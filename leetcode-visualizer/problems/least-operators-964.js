'use strict';
const base = require('./hard-dp-visualizations')[964];
const bi = (vi,en) => ({vi,en});
const KEYS = ['x','target','position','remaining','unit_cost','quotient','remainder','use_low','use_carry'];

function buildSteps(input,params={}) {
  const {x,target}=base.parseLeastOperators964Input(input,params);
  const steps=[],stack=[],memo=new Map(),decisions=new Map();
  let hits=0,cacheReads=[],witness=null;
  const outer={x,target};
  function emit(line,locals,phaseIndex,event,pending=null,returned=false) {
    const inSolve=locals!==outer;
    const position=locals.position??0,remaining=locals.remaining??target;
    const pythonLocals=Object.fromEntries(KEYS.map(key=>[key,locals[key]??null]));
    const lowCost=locals.use_low??null,carryCost=locals.use_carry??null;
    const choice=line===17?(carryCost<lowCost?'carry':'low'):line===15?'exact':line===11?'low':line===8?'zero':null;
    const action=event;
    steps.push({
      title:bi(`L${line} · ${event.vi}`,`L${line} · ${event.en}`),note:bi('',''),
      codeLines:[line],codeBlock:1,debugLine:line,final:returned,arr:[],highlight:[],mark:[],
      vars:Object.entries(pythonLocals).filter(([,value])=>value!==null).map(([name,value])=>({name,value})),
      leastOps964View:{
        x,target,position,remaining,unitCost:locals.unit_cost??null,quotient:locals.quotient??null,remainder:locals.remainder??null,
        lowCost,carryCost,choice,phaseIndex,action,formula:bi(pending?.formula??base.code[line-1].trim(),pending?.formula??base.code[line-1].trim()),
        line,source:base.code[line-1],timing:returned?'return':'before',functionName:inSolve?'solve':'leastOpsExpressTarget',
        pythonLocals,pending,cacheHits:hits,cacheReads:cacheReads.map(item=>({...item})),
        memoSize:memo.size,stack:stack.map(frame=>({...frame})),memo:[...memo.entries()].slice(-12).map(([key,cost])=>({key,cost})),
        witness:returned?witness:null,traceTruncated:false,
      },
    });
    cacheReads=[];
  }
  emit(5,outer,0,bi('Bật cache','Enable cache'));
  emit(6,outer,0,bi('Tạo hàm DFS','Define DFS'));
  emit(5,outer,0,bi('Bọc DFS bằng cache','Wrap DFS with cache'));
  emit(6,outer,0,bi('DFS đã sẵn sàng','DFS is ready'));
  emit(18,outer,0,bi('Gọi DFS cho số đích','Call DFS for the target'),{target:'answer',before:null,after:null,formula:`F(0, ${target}) − 1`});
  function solve(position,remaining) {
    const key=`${position}:${remaining}`;
    if(memo.has(key)){hits++;cacheReads.push({key,cost:memo.get(key)});return memo.get(key);}
    const locals={x,position,remaining};
    stack.push({position,remaining});
    const finish=(cost,choice)=>{
      memo.set(key,cost);decisions.set(key,{...locals,choice});stack.pop();return cost;
    };
    emit(7,locals,1,bi('Còn gì cần ghép?','Anything left to build?'),{target:'remaining == 0',after:remaining===0,kind:'condition'});
    if(remaining===0){
      emit(8,locals,5,bi('Hết số → trả 0','Nothing left → return 0'),{target:`F(${position}, ${remaining})`,after:0,kind:'return'});
      return finish(0,'zero');
    }
    const cost=position===0?2:position;
    emit(9,locals,1,bi('Tính giá một khối','Price one block'),{target:'unit_cost',before:null,after:cost});
    locals.unit_cost=cost;
    emit(10,locals,1,bi('Chỉ cần một khối?','Only one block needed?'),{target:'remaining == 1',after:remaining===1,kind:'condition'});
    if(remaining===1){
      emit(11,locals,5,bi('Trả giá một khối','Return the price of one block'),{target:`F(${position}, ${remaining})`,after:cost,kind:'return'});
      return finish(cost,'low');
    }
    const q=Math.floor(remaining/x),r=remaining%x;
    emit(12,locals,2,bi('Tách thương và dư','Split quotient and remainder'),{target:'quotient, remainder',before:null,after:`${q}, ${r}`});
    locals.quotient=q;locals.remainder=r;
    emit(13,locals,3,bi('A · Cộng phần dư','A · Add the remainder'),{target:'use_low',before:null,after:null,formula:`${r} × ${cost} + F(${position+1}, ${q})`,kind:'call'});
    locals.use_low=r*cost+solve(position+1,q);
    emit(14,locals,3,bi('Dư bằng 0?','Zero remainder?'),{target:'remainder == 0',after:r===0,kind:'condition'});
    if(r===0){
      emit(15,locals,5,bi('Chọn A, trả về','Choose A and return'),{target:`F(${position}, ${remaining})`,after:locals.use_low,kind:'return'});
      return finish(locals.use_low,'exact');
    }
    emit(16,locals,4,bi('B · Bù lên rồi trừ','B · Overshoot, then subtract'),{target:'use_carry',before:null,after:null,formula:`${x-r} × ${cost} + F(${position+1}, ${q+1})`,kind:'call'});
    locals.use_carry=(x-r)*cost+solve(position+1,q+1);
    const choice=locals.use_carry<locals.use_low?'carry':'low';
    const best=Math.min(locals.use_low,locals.use_carry);
    emit(17,locals,5,bi('Trả chi phí nhỏ hơn','Return the lower cost'),{target:`F(${position}, ${remaining})`,after:best,kind:'return'});
    return finish(best,choice);
  }
  const rawCost=solve(0,target),answer=rawCost-1;
  function collect(position,remaining){
    if(!remaining)return [];
    if(remaining===1)return [{position,coefficient:1}];
    const d=decisions.get(`${position}:${remaining}`),carry=d.choice==='carry';
    const coefficient=carry?d.remainder-x:d.remainder;
    return [...(coefficient?[{position,coefficient}]:[]),...collect(position+1,d.quotient+(carry?1:0))];
  }
  const terms=collect(0,target).sort((a,b)=>b.position-a.position),tokens=[];
  for(const {position,coefficient}of terms)for(let repeat=0;repeat<Math.abs(coefficient);repeat++){
    if(tokens.length)tokens.push({type:'operator',value:coefficient<0?'-':'+'});
    const count=position===0?2:position;
    for(let i=0;i<count;i++){
      if(i)tokens.push({type:'operator',value:position===0?'/':'*'});
      tokens.push({type:'operand',value:String(x)});
    }
  }
  witness={terms,tokens,expression:tokens.map(token=>token.value).join(''),operatorCount:tokens.filter(token=>token.type==='operator').length};
  emit(18,outer,6,bi(`Đáp án ${answer}`,`Answer ${answer}`),{target:'return',before:rawCost,after:answer,formula:`${rawCost} − 1 = ${answer}`,kind:'return'},true);
  return {original:[x],answer,witness,steps};
}

module.exports={964:{...base,builder:buildSteps,debugMode:'line'}};
