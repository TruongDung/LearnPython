'use strict';
const bi=(vi,en)=>({vi,en});
const LINEAR=`import random

class Solution:
    def __init__(self, w):
        self.weights = list(w)
        self.total = sum(w)

    def pickIndex(self):
        target = random.randint(1, self.total)
        cumulative = 0
        for index, weight in enumerate(self.weights):
            cumulative += weight
            if target <= cumulative:
                return index`.split('\n');
const ALIAS=`import random

class Solution:
    def __init__(self, w):
        self.n = len(w)
        self.total = sum(w)
        scaled = [weight * self.n for weight in w]
        self.cut = [self.total] * self.n
        self.alias = list(range(self.n))
        small = [i for i in range(self.n) if scaled[i] < self.total]
        large = [i for i in range(self.n) if scaled[i] >= self.total]
        while small and large:
            s = small.pop()
            l = large.pop()
            self.cut[s] = scaled[s]
            self.alias[s] = l
            scaled[l] -= self.total - scaled[s]
            if scaled[l] < self.total:
                small.append(l)
            else:
                large.append(l)

    def pickIndex(self):
        column = random.randrange(self.n)
        roll = random.randint(1, self.total)
        if roll <= self.cut[column]:
            return column
        return self.alias[column]`.split('\n');

module.exports=base=>{
  function parse(input,params){
    const options={targets:base.extraParams.find(p=>p.key==='targets').default,...params};
    const {w,total,targets}=base.builder(input,options).steps[0].randomPickView;
    const text=String(options.columns??'').trim();let columns;
    try{columns=text?(text.startsWith('[')?JSON.parse(text):text.split(',').map(Number)):targets.map((_,i)=>i%w.length);}catch{throw new Error('528: columns must be a list of zero-based column indices');}
    if(!Array.isArray(columns)||columns.length!==targets.length||columns.some(n=>!Number.isInteger(n)||n<0||n>=w.length))throw new Error('528: columns must match targets in length, with 0 <= column < len(w)');
    return {w,total,targets,columns};
  }
  function build(input,params={},method){
    const {w,total,targets,columns}=parse(input,params),n=w.length,steps=[],code=method===2?LINEAR:ALIAS;
    const v={method,n,w,total,targets,columns,prefix:[],phase:'intro',decision:'intro',buildIndex:-1,pickNumber:0,target:null,lo:null,hi:null,mid:null,result:null,picks:[],tally:Array(n).fill(0),answer:null,
      cumulative:0,previousCumulative:0,scanIndex:-1,cut:[],alias:[],scaled:[],small:[],large:[],s:null,l:null,column:null,roll:null};
    const line=text=>code.findIndex(s=>s.trim()===text)+1;
    const snap=(text,decision,phase=v.phase)=>{
      v.decision=decision;v.phase=phase;const sourceLine=line(text);if(!sourceLine)throw new Error('Missing 528 source: '+text);
      steps.push({arr:[],highlight:[],mark:[],title:bi(text,text),note:bi('',''),codeBlock:method,codeLines:[sourceLine],final:phase==='done',
        vars:[{name:'total',value:total},{name:'target',value:v.target},{name:'column',value:v.column},{name:'cumulative',value:v.cumulative}],randomPickView:structuredClone({...v,source:text})});
    };
    if(method===2){
      snap('self.weights = list(w)','weights');snap('self.total = sum(w)','total');
      for(let pick=0;pick<targets.length;pick++){
        v.pickNumber=pick+1;v.target=targets[pick];v.result=null;v.scanIndex=-1;v.cumulative=0;v.previousCumulative=0;
        snap('target = random.randint(1, self.total)','draw','pick');snap('cumulative = 0','reset');
        for(let i=0;i<n;i++){
          v.scanIndex=i;snap('for index, weight in enumerate(self.weights):','scan');
          v.previousCumulative=v.cumulative;v.cumulative+=w[i];snap('cumulative += weight','add');
          snap('if target <= cumulative:','compare');
          if(v.target<=v.cumulative){v.result=i;v.picks.push({target:v.target,index:i});v.tally[i]++;snap('return index','resolved');break;}
        }
      }
      v.answer=v.picks.map(p=>p.index);snap('return index','done','done');
    }else{
      snap('self.n = len(w)','size','build');snap('self.total = sum(w)','total');
      v.scaled=w.map(weight=>weight*n);snap('scaled = [weight * self.n for weight in w]','scaled');
      v.cut=Array(n).fill(total);snap('self.cut = [self.total] * self.n','cut');
      v.alias=Array.from({length:n},(_,i)=>i);snap('self.alias = list(range(self.n))','alias');
      v.small=v.scaled.flatMap((mass,i)=>mass<total?[i]:[]);snap('small = [i for i in range(self.n) if scaled[i] < self.total]','small');
      v.large=v.scaled.flatMap((mass,i)=>mass>=total?[i]:[]);snap('large = [i for i in range(self.n) if scaled[i] >= self.total]','large');
      while(v.small.length&&v.large.length){
        snap('while small and large:','pair');v.s=v.small.pop();snap('s = small.pop()','small-pop');v.l=v.large.pop();snap('l = large.pop()','large-pop');
        v.cut[v.s]=v.scaled[v.s];snap('self.cut[s] = scaled[s]','cut-write');v.alias[v.s]=v.l;snap('self.alias[s] = l','alias-write');
        v.scaled[v.l]-=total-v.scaled[v.s];snap('scaled[l] -= self.total - scaled[s]','rebalance');snap('if scaled[l] < self.total:','compare-mass');
        if(v.scaled[v.l]<total){v.small.push(v.l);snap('small.append(l)','requeue');}else{v.large.push(v.l);snap('large.append(l)','requeue');}
      }
      v.s=null;v.l=null;snap('while small and large:','ready');
      for(let pick=0;pick<targets.length;pick++){
        v.pickNumber=pick+1;v.result=null;v.target=null;v.roll=null;v.column=columns[pick];snap('column = random.randrange(self.n)','column','pick');
        v.roll=targets[pick];v.target=v.roll;snap('roll = random.randint(1, self.total)','roll');snap('if roll <= self.cut[column]:','compare-cut');
        v.result=v.roll<=v.cut[v.column]?v.column:v.alias[v.column];v.picks.push({target:v.roll,column:v.column,index:v.result});v.tally[v.result]++;
        snap(v.roll<=v.cut[v.column]?'return column':'return self.alias[column]','resolved');
      }
      v.answer=v.picks.map(p=>p.index);snap(v.roll<=v.cut[v.column]?'return column':'return self.alias[column]','done','done');
    }
    return {original:[...w],answer:v.answer,steps};
  }
  const labels=[bi('1. Prefix + tìm nhị phân','1. Prefix + binary search'),bi('2. Quét tuyến tính','2. Linear scan'),bi('3. Alias · O(1) mỗi pick','3. Alias · O(1) per pick')];
  return {...base,
    extraParams:[...base.extraParams,{key:'columns',type:'string',default:'',allowEmpty:true,label:bi('columns — cột alias mô phỏng, trống = 0,1,…','columns — simulated alias columns, blank = 0,1,…')},{key:'approach',type:'select',default:'1',label:bi('Cách giải','Approach'),options:labels.map((label,i)=>({value:String(i+1),label}))}],
    codeLabel:labels[0],code2:LINEAR,code2Label:labels[1],code3:ALIAS,code3Label:labels[2],
    approach:[bi('Prefix chia dải vé thành các khối, rồi tìm nhị phân khối chứa target.','Prefix sums partition the tickets; binary search locates the target block.'),bi('Quét từng trọng số và cộng dồn đến khi bao phủ target.','Scan and accumulate weights until the target is covered.'),bi('Alias chia khối lượng thành n cột bằng nhau; chọn cột đều và một roll để chọn chủ cột hoặc alias.','Alias packs mass into n equal columns; a uniform column and roll select the column owner or its alias.')],
    complexity2:{time:'O(n) setup · O(n) per pick',space:'O(n)',note:bi('Giữ weights, cộng dồn lại cho mỗi lần chọn.','Store weights and scan them again on each pick.')},
    complexity3:{time:'O(n) setup · O(1) per pick',space:'O(n)',note:bi('Dùng ngưỡng nguyên, không cần làm tròn xác suất.','Integer thresholds avoid probability rounding.')},
    builder:(input,params={})=>{const r=base.builder(input,{targets:base.extraParams[0].default,...params});r.steps=r.steps.map(s=>({...s,randomPickView:{...s.randomPickView,method:1}}));return r;},
    builder2:(input,params)=>build(input,params,2),builder3:(input,params)=>build(input,params,3),
  };
};
