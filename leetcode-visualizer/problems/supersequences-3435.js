"use strict";
const bi = (vi,en) => ({vi,en});
const PROGRAM = [
  ['import','from collections import deque'],
  ['class','class Solution:'],
  ['method','    def supersequences(self, words):'],
  ['letters','        letters = sorted(set("".join(words)))'],
  ['index','        index = dict((ch, i) for i, ch in enumerate(letters))'],
  ['n','        n = len(letters)'],
  ['edges','        edges = tuple((index[a], index[b]) for a, b in words)'],
  ['graph','        graph = list([] for _ in range(n))'],
  ['build-edge','        for u, v in edges:'],
  ['add-edge','            graph[u].append(v)'],
  ['define','        def is_dag(keep):'],
  ['indegree','            indegree = [0] * n'],
  ['scan-edge','            for u, v in edges:'],
  ['inside','                if keep & (1 << u) and keep & (1 << v):'],
  ['indegree-add','                    indegree[v] += 1'],
  ['queue','            queue = deque(u for u in range(n) if keep & (1 << u) and indegree[u] == 0)'],
  ['count','            count = 0'],
  ['while-queue','            while queue:'],
  ['pop','                u = queue.popleft()'],
  ['visit','                count += 1'],
  ['neighbor','                for v in graph[u]:'],
  ['kept-neighbor','                    if keep & (1 << v):'],
  ['indegree-drop','                        indegree[v] -= 1'],
  ['ready','                        if indegree[v] == 0:'],
  ['enqueue','                            queue.append(v)'],
  ['dag-result','            return count == keep.bit_count()'],
  ['best','        best = n + 1'],
  ['masks','        masks = []'],
  ['mask','        for repeat in range(1 << n):'],
  ['cost','            cost = repeat.bit_count()'],
  ['cost-test','            if cost > best:'],
  ['skip-cost','                continue'],
  ['keep','            keep = ((1 << n) - 1) ^ repeat'],
  ['dag-test','            if not is_dag(keep):'],
  ['skip-cycle','                continue'],
  ['best-test','            if cost < best:'],
  ['new-best','                best = cost'],
  ['reset','                masks = []'],
  ['save','            masks.append(repeat)'],
  ['result-init','        result = []'],
  ['result-mask','        for repeat in masks:'],
  ['freq-init','            freq = [0] * 26'],
  ['char','            for i, ch in enumerate(letters):'],
  ['assign','                freq[ord(ch) - ord("a")] = 2 if repeat & (1 << i) else 1'],
  ['freq-save','            result.append(freq)'],
  ['result','        return result'],
];
const CODE = PROGRAM.map(([,code])=>code), LINE = Object.fromEntries(PROGRAM.map(([tag],i)=>[tag,i+1]));
const copy = x => JSON.parse(JSON.stringify(x));
const bits = mask => {let count=0;for(;mask;mask&=mask-1)count++;return count;};
function parse(input) {
  let words;
  if(Array.isArray(input)) words=[...input];
  else {const text=String(input??'').trim();try{words=text.startsWith('[')?JSON.parse(text):text.split(/[\s,;]+/).filter(Boolean);}catch(_){throw new RangeError('3435: nhập ["ab","ba"] hoặc ab,ba / enter ["ab","ba"] or ab,ba.');}}
  if(!Array.isArray(words)||words.length<1||words.length>256||words.some(word=>typeof word!=='string'||!/^[a-z]{2}$/.test(word))||new Set(words).size!==words.length||new Set(words.join('')).size>16)
    throw new RangeError('3435: 1–256 từ khác nhau, mỗi từ 2 chữ a–z, tối đa 16 chữ cái / 1–256 unique two-letter words, at most 16 distinct letters.');
  return words;
}
// A repeated letter can be placed once before and once after all single letters.
// Thus only edges between single letters need to admit a topological order.
function findCycle(keep,graph) {
  const state=Array(graph.length).fill(0),path=[];let cycle=[];
  function visit(u){state[u]=1;path.push(u);for(const v of graph[u])if(keep&(1<<v)){if(state[v]===1){cycle=[...path.slice(path.indexOf(v)),v];return true;}if(!state[v]&&visit(v))return true;}path.pop();state[u]=2;return false;}
  for(let u=0;u<graph.length;u++)if(keep&(1<<u)&&!state[u]&&visit(u))break;
  return cycle;
}
function build(input) {
  const words=parse(input),s={words},stack=[],steps=[];
  let frame=0,omitted=0,phase='input',probe=null,processed=[];
  const limit=4000;
  function emit(tag,final=false) {
    frame++;
    if(steps.length>=limit&&!final){omitted++;return;}
    const f=stack.at(-1),line=LINE[tag];
    const locals=copy(f?{...f,edges:s.edges,graph:s.graph,n:s.n}:s);
    const currentProbe=f?{...f,processed,ok:tag==='dag-result'?f.count===bits(f.keep):null}:probe?.repeat===s.repeat?probe:null;
    const view=copy({frame,event:tag,phase,words,letters:s.letters??[...new Set(words.join(''))].sort(),edges:s.edges??[],repeat:s.repeat??null,
      best:s.best??null,masks:s.masks??[],probe:currentProbe,cycle:tag==='dag-result'&&f.count!==bits(f.keep)?findCycle(f.keep,s.graph):currentProbe?.cycle??[],
      omitted,limit,currentLetter:s.ch??null});
    steps.push({arr:[],highlight:[],mark:[],codeLines:[line],source:{line,text:CODE[line-1],scope:f?'is_dag':'supersequences'},locals,
      vars:Object.entries(locals).map(([name,value])=>({name,value})),title:bi(final?'Kết quả':`Dòng ${line}`,final?'Result':`Line ${line}`),note:bi('',''),final,supersequences3435View:view});
  }
  s.letters=[...new Set(words.join(''))].sort();emit('letters');
  s.index=Object.fromEntries(s.letters.map((ch,i)=>[ch,i]));emit('index');s.n=s.letters.length;emit('n');
  s.edges=words.map(([a,b])=>[s.index[a],s.index[b]]);emit('edges');s.graph=Array.from({length:s.n},()=>[]);emit('graph');
  for(const [u,v]of s.edges){Object.assign(s,{u,v});emit('build-edge');s.graph[u].push(v);emit('add-edge');}emit('build-edge');emit('define');
  function isDag(keep) {
    const f={keep};stack.push(f);processed=[];f.indegree=Array(s.n).fill(0);emit('indegree');
    for(const [u,v]of s.edges){Object.assign(f,{u,v});emit('scan-edge');const inside=(keep&(1<<u))&&(keep&(1<<v));emit('inside');if(inside){f.indegree[v]++;emit('indegree-add');}}emit('scan-edge');
    f.queue=Array.from({length:s.n},(_,u)=>u).filter(u=>(keep&(1<<u))&&!f.indegree[u]);emit('queue');f.count=0;emit('count');
    while(f.queue.length){emit('while-queue');f.u=f.queue.shift();emit('pop');f.count++;processed.push(f.u);emit('visit');
      for(const v of s.graph[f.u]){f.v=v;emit('neighbor');emit('kept-neighbor');if(keep&(1<<v)){f.indegree[v]--;emit('indegree-drop');emit('ready');if(!f.indegree[v]){f.queue.push(v);emit('enqueue');}}}emit('neighbor');
    }emit('while-queue');const ok=f.count===bits(keep);emit('dag-result');
    probe={...f,repeat:s.repeat,processed:[...processed],ok,cycle:ok||steps.length>=limit?[]:findCycle(keep,s.graph)};stack.pop();return ok;
  }
  s.best=s.n+1;emit('best');s.masks=[];emit('masks');phase='search';
  for(let repeat=0;repeat<(1<<s.n);repeat++){
    s.repeat=repeat;emit('mask');s.cost=bits(repeat);emit('cost');emit('cost-test');if(s.cost>s.best){emit('skip-cost');continue;}
    s.keep=((1<<s.n)-1)^repeat;emit('keep');const ok=isDag(s.keep);emit('dag-test');if(!ok){emit('skip-cycle');continue;}
    emit('best-test');if(s.cost<s.best){s.best=s.cost;emit('new-best');s.masks=[];emit('reset');}s.masks.push(repeat);emit('save');
  }emit('mask');phase='counts';s.result=[];emit('result-init');
  for(const repeat of s.masks){s.repeat=repeat;emit('result-mask');s.freq=Array(26).fill(0);emit('freq-init');
    for(let i=0;i<s.n;i++){s.i=i;s.ch=s.letters[i];emit('char');s.freq[s.ch.charCodeAt(0)-97]=(repeat&(1<<i))?2:1;emit('assign');}emit('char');
    s.result.push([...s.freq]);emit('freq-save');
  }emit('result-mask');phase='done';emit('result',true);
  return{original:words,answer:s.result,steps};
}
module.exports={3435:{
  id:3435,slug:'frequencies-of-shortest-supersequences',difficulty:'hard',
  title:bi('Frequencies of Shortest Supersequences','Frequencies of Shortest Supersequences'),titleVi:bi('Tần suất chữ trong chuỗi chung ngắn nhất','Letter counts in shortest supersequences'),
  category:{key:'graph',vi:'Đồ thị',en:'Graph'},tags:[{key:'bitmask',vi:'Bitmask',en:'Bitmask'},{key:'enumeration',vi:'Liệt kê',en:'Enumeration'}],
  statement:bi('Mỗi từ có 2 chữ. Tìm mọi bảng tần suất của chuỗi ngắn nhất chứa tất cả các từ theo dạng dãy con. Mỗi bảng có 26 ô a–z; các chuỗi hoán vị chỉ tính một lần.','Each word has two letters. Find every letter-frequency vector of a shortest string containing all words as subsequences. Each vector has 26 entries a–z; permutations count once.'),
  approach:[bi('ab → a đứng trước b. Chu trình buộc phải lặp ít nhất một chữ.','ab → a precedes b. A cycle forces at least one letter to repeat.'),bi('Thử các chữ xuất hiện 2 lần; phần còn lại phải là DAG. Giữ mọi cách lặp ít nhất.','Try letters occurring twice; the remaining graph must be a DAG. Keep all choices with the fewest repeats.')],
  inputKind:'string',inputLabel:bi('words · ví dụ ab,ba hoặc ["ab","ba"]','words · e.g. ab,ba or ["ab","ba"]'),defaultInput:'ab,ba',extraParams:[],
  debugMode:'line-by-line',code:CODE,builder:build,liveArgs:input=>[parse(input)],
  complexity:{time:'O(2ᵏ · (k + m) + 26R)',space:'O(k + m + 26R)',note:bi('k ≤ 16 chữ cái, m từ, R bảng kết quả. Input lớn hiển thị tối đa 4.000 bước đầu và kết quả; thuật toán vẫn tính đầy đủ.','k ≤ 16 letters, m words, R result vectors. Large inputs display the first 4,000 steps plus the result; the full algorithm still runs.')},
}};
