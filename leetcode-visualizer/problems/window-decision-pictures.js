'use strict';
// Adapt the existing trace, retaining each algorithm and each approach.
const clone = value => structuredClone(value);
const list = value => { try { const a=JSON.parse(String(value)); return Array.isArray(a)?a:[]; } catch { return []; } };
const number = (value, fallback) => Number.isFinite(value) ? value : fallback;
const map = value => Object.fromEntries([...String(value??'').matchAll(/(?:"?)([^\s{},:"]+)(?:"?)\s*:\s*(-?\d+)/g)].map(m=>[m[1],Number(m[2])]));
const unquote = value => { try { return JSON.parse(value); } catch { return String(value??''); } };
const counts = items => { const out={}; for(const item of items)out[item]=(out[item]||0)+1; return out; };

function attach(id, problem) {
  return {...problem,builder(input,params={}) {
    const defaults=Object.fromEntries((problem.extraParams||[]).map(p=>[p.key,p.default]));
    const options={...defaults,...params};
    if(options.approach!==undefined)options.approach=String(options.approach);
    const run=problem.builder(input,options), items=typeof input==='string'?[...input]:[...(input||[])];
    const kinds={1052:'grumpy',862:'prefix',1208:'budget',1358:'count',1499:'points',2461:'distinct-sum',2799:'count',2904:'beautiful',3090:'frequency',2958:'frequency',2962:'count',2271:'carpet',2024:'replacement',283:'moves'};
    const state={id,kind:kinds[id],items,k:Number(options.k??0),approach:Number(options.approach??1),left:0,right:-1,freq:{},best:[],answer:0,total:0,groups:[],members:[],deque:[]};
    let previousTotal=0, previousDeque=[], bestScore=null, previousBest='';
    if(id===1052){state.items=[...run.original];state.grumpy=[...run.grumpy];state.k=run.minutes;state.baseline=state.items.reduce((sum,n,i)=>sum+(state.grumpy[i]?0:n),0);}
    if(id===862){state.items=[...run.original];state.prefix=[0];for(const n of state.items)state.prefix.push(state.prefix.at(-1)+n);}
    if(id===1208){state.s=String(input);state.t=String(options.t);state.items=run.steps[0].arr;state.k=Number(options.maxCost);state.sum=0;}
    if(id===1358)state.required=['a','b','c'];
    if(id===2799)state.required=[...new Set(items)];
    if(id===2962){state.required=[Math.max(...items)];state.target=state.required[0];}
    if(id===1499){state.points=clone(run.original);state.items=state.points.map(p=>`(${p.join(',')})`);}
    if(id===2271){state.tiles=run.steps[0].arr.map(label=>JSON.parse(label));state.items=state.tiles.map(p=>`[${p.join(',')}]`);state.k=Number(options.carpetLen);state.carpet=null;}
    run.steps=run.steps.map((step,index)=>{
      const vars=Object.fromEntries((step.vars||[]).map(v=>[v.name,v.value])), lines=step.codeLines||[], oldFreq={...state.freq}, raw=step.slidingFreqView;
      const previousLeft=state.left, previousRight=state.right, previousAnswer=state.answer;
      state.phase=index===0?'setup':step.final?'result':'check';state.gain=0;state.removed=null;state.pending=null;state.candidate=null;
      if(raw){
        state.left=raw.left;state.right=raw.right;state.freq={...raw.freq};state.k=raw.k;state.answer=raw.ans;state.best=[...(raw.best||[])];
        const plus=Object.entries(state.freq).filter(([key,n])=>n>(oldFreq[key]||0));
        const minus=Object.entries(oldFreq).filter(([key,n])=>n>(state.freq[key]||0));
        for(const [key,n]of plus)for(let j=0;j<n-(oldFreq[key]||0);j++)if(!state.members.includes(state.right))state.members.push(state.right);
        for(const [key,n]of minus)for(let j=0;j<n-(state.freq[key]||0);j++){const p=state.members.findIndex(i=>String(state.items[i])===key);if(p>=0)state.removed=state.members.splice(p,1)[0];}
        if(state.right>previousRight)state.phase='visit';
        if(plus.length)state.phase='add';if(minus.length||state.left>previousLeft)state.phase='shrink';
        if(state.answer>previousAnswer)state.phase=[2799,2962].includes(id)?'count':'best';
        if(state.right>=0&&!state.members.includes(state.right))state.pending=state.right;
        state.sum=vars.window_sum??state.sum;
      }
      if(id===1052){
        state.right=step.highlight?.at(-1)??-1;state.left=Math.max(0,state.right-state.k+1);state.extra=vars.extraSatisfied;state.bestExtra=vars.bestExtra;state.answer=state.baseline+state.bestExtra;
        if(lines.includes(7))state.phase='add';if(lines.includes(8))state.phase='shrink';if(lines.includes(6))state.phase='visit';
        if((lines.includes(9)||step.final)&&(state.bestExtra>bestScore||bestScore===null)){bestScore=state.bestExtra;state.best=[state.left,state.left+state.k-1];state.phase='best';}
        if(step.final)state.best=[...(step.mark||[])].length?[step.mark[0],step.mark.at(-1)]:state.best;
        // Membership of the accumulator may temporarily exceed the target window.
        if(lines.includes(7))state.members.push(state.right);
        if(lines.includes(8)){state.removed=state.right-state.k;state.members=state.members.filter(i=>i!==state.removed);}
      }
      if(id===1208){
        state.left=number(vars.left,state.left);state.right=number(vars.right,state.right);state.sum=number(vars.windowCost,state.sum);state.answer=number(vars.maxLength,state.answer);
        if(lines.includes(8))state.phase='add';if(lines.includes(11))state.phase='shrink';
        if(state.answer>previousAnswer){state.best=[state.left,state.right];state.phase='best';}
        if(step.final){state.left=state.best[0]??0;state.right=state.best[1]??-1;state.sum=state.items.slice(state.left,state.right+1).reduce((a,b)=>a+b,0);}
      }
      if(id===1358){
        if(vars.count!==undefined)state.freq=map(vars.count);
        if(vars.last!==undefined)state.last=map(vars.last);
        if(vars.left!==undefined){const n=String(vars.left).split('→').at(-1).trim();state.left=Number(n);}
        state.right=number(vars.right,number(vars.i,state.right));state.answer=number(vars.total,number(vars.res,state.answer));
        if(lines.includes(7)&&!lines.includes(8))state.phase='add';if(lines.includes(11))state.phase='shrink';
        if(state.approach===2&&state.last){state.left=0;state.freq=counts(state.items.slice(0,state.right+1));}
      }
      if([1358,2799,2962].includes(id)){
        state.gain=state.answer-previousTotal;
        if(state.gain>0){state.phase='count';const group=id===1358&&state.approach===2?{direction:'starts',from:0,to:state.gain-1,fixed:state.right}:{direction:'ends',from:state.right,to:state.items.length-1,fixed:state.left};state.groups.push(group);state.candidate=group;}
        previousTotal=state.answer;
      }
      if(id===862||id===1499){
        state.right=number(vars.i,-1);state.deque=list(vars[id===862?'deque(indices)':'deque indices']);
        const removed=previousDeque.filter(i=>!state.deque.includes(i));state.removed=removed[0]??null;
        state.score=typeof vars.answer==='number'?vars.answer:null;
        if(removed.length)state.phase=removed[0]===previousDeque[0]?'pop-front':'pop-back';
        if(state.deque.length>previousDeque.length)state.phase='push';
        if(id===862&&lines.includes(6)&&removed.length){state.phase='found';state.candidate={left:removed[0],right:state.right-1,sum:state.prefix[state.right]-state.prefix[removed[0]]};if(bestScore===null||state.score<bestScore){bestScore=state.score;state.best=[state.candidate.left,state.candidate.right];}}
        if(id===1499&&lines.includes(8)&&state.deque.length){state.phase='found';const a=state.deque[0],b=state.right;state.candidate={left:a,right:b,sum:state.points[a][1]+state.points[b][1]+state.points[b][0]-state.points[a][0]};if(bestScore===null||state.score>bestScore){bestScore=state.score;state.best=[a,b];}}
        state.answer=state.score;previousDeque=[...state.deque];
      }
      if(id===2904){
        const oldOnes=state.ones;
        state.left=number(vars.left,state.left);state.right=number(vars.right,state.right);state.ones=number(vars.ones,state.ones??0);state.bestText=unquote(vars.best??'""');
        const row=step.grid?.dp?.[1]||[],candidate=row.flatMap((ch,i)=>i>0&&ch!==''?[i-1]:[]);
        state.candidate=candidate.length?{left:candidate[0],right:candidate.at(-1),text:candidate.map(i=>state.items[i]).join('')}:null;
        state.best=[...(step.mark||[])];state.answer=state.bestText;
        if(state.bestText!==previousBest){state.phase='best';previousBest=state.bestText;}
        if(state.left>previousLeft)state.phase='shrink';
        state.positions=state.approach===2?list(vars.ones):state.items.flatMap((ch,i)=>ch==='1'?[i]:[]);
        if(typeof vars.ones==='number'&&vars.ones<oldOnes&&state.left===previousLeft){state.removed=state.left;state.phase='shrink';}
      }
      if(id===2271){
        state.left=number(vars.left,state.left);state.answer=vars.ans;
        if(typeof vars.carpetStart==='number'){state.carpet=[vars.carpetStart,vars.carpetStart+state.k-1];state.phase='slide';}
        if(state.answer>previousAnswer){state.bestCarpet=[...state.carpet];state.phase='best';}
        if(step.final)state.carpet=state.bestCarpet??state.carpet;
      }
      if(id===283){state.before=[...state.items];state.items=[...step.arr];state.write=number(vars.write,state.write??0);state.right=number(vars.i,state.right);state.phase=lines.includes(6)?'swap':'visit';state.left=state.write;state.swap=lines.includes(6)?{left:state.write-1,right:state.right}:null;}
      if(step.final){state.phase='result';state.answer=run.answer;}
      const snapshot={...clone(state),final:Boolean(step.final),lines:[...lines],index};
      return {...step,windowDecisionView:snapshot};
    });
    return run;
  }};
}
module.exports={attach,ids:[1052,862,1208,1358,1499,2461,2799,2904,3090,2958,2962,2271,2024]};
