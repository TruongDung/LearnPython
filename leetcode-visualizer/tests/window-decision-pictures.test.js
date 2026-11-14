'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {SUPPORTED}=require('../problems');
const {spawnSync}=require('node:child_process');
const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-window-decision-pictures.js'),'utf8'),ctx);
const presets=vm.runInContext('WD_PRESETS',ctx),ids=Object.keys(presets).map(Number),plain=x=>JSON.parse(JSON.stringify(x));
function build(id,input=SUPPORTED[id].defaultInput,params={}){params=plain(params);input=plain(input);const p=SUPPORTED[id],method=Number(params.approach??1);return (p['builder'+(method===1?'':method)]||p.builder)(input,params);}
const ranges=a=>a.flatMap((_,l)=>a.slice(l).map((_,j)=>[l,l+j]));
const sum=a=>a.reduce((a,b)=>a+b,0),counts=a=>{const m={};for(const x of a)m[x]=(m[x]||0)+1;return m;};
let seed=2024;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};

test('1052 pictures separate baseline from extra, including all-happy and zero-customer minutes',()=>{
  const samples=[...presets[1052].map(plain),...Array.from({length:25},()=>{const n=1+rand(8);return[Array.from({length:n},()=>rand(10)),{minutes:1+rand(n),grumpy:Array.from({length:n},()=>rand(2)).join(',')}];})];
  for(const [a,p]of samples){const g=p.grumpy.split(',').map(Number),base=sum(a.filter((_,i)=>!g[i])),windows=Array.from({length:a.length-p.minutes+1},(_,l)=>sum(a.slice(l,l+p.minutes).map((n,i)=>n*g[l+i]))),r=build(1052,a,p);
    assert.equal(r.answer,base+Math.max(...windows));const v=r.steps.at(-1).windowDecisionView;assert.equal(v.baseline,base);assert.equal(v.bestExtra,Math.max(...windows));assert.equal(windows[v.best[0]],v.bestExtra);
    for(const step of r.steps){const v=step.windowDecisionView;assert.equal(sum(v.members.map(i=>a[i])),v.extra);assert.ok(v.members.every(i=>g[i]===1));}
  }
});

test('862 shortest witnesses and deque removals match brute force with negative numbers and repeated prefix sums',()=>{
  const cases=[...presets[862].map(plain),...Array.from({length:35},()=>[Array.from({length:1+rand(8)},()=>rand(11)-5),{k:1+rand(15)}])];
  for(const [a,p]of cases){const valid=ranges(a).filter(([l,r])=>sum(a.slice(l,r+1))>=p.k),expected=valid.length?Math.min(...valid.map(([l,r])=>r-l+1)):-1,r=build(862,a,p);assert.equal(r.answer,expected);
    for(const step of r.steps){const v=step.windowDecisionView;assert.equal(v.prefix.length,a.length+1);assert.equal(v.prefix.at(-1),sum(a));if(v.phase==='push')for(let i=1;i<v.deque.length;i++)assert.ok(v.prefix[v.deque[i-1]]<v.prefix[v.deque[i]]);if(v.candidate){assert.ok(v.candidate.sum>=p.k);assert.equal(v.candidate.sum,sum(a.slice(v.candidate.left,v.candidate.right+1)));}}
    const v=r.steps.at(-1).windowDecisionView;if(expected>=0){assert.equal(v.best[1]-v.best[0]+1,expected);assert.ok(sum(a.slice(v.best[0],v.best[1]+1))>=p.k);}else assert.deepEqual(v.best,[]);
  }
});

test('1208 cost columns, accumulator and best affordable window match independent enumeration',()=>{
  for(const [s,p]of [...presets[1208].map(plain),...Array.from({length:20},()=>{const n=1+rand(8);return[Array.from({length:n},()=>String.fromCharCode(97+rand(5))).join(''),{t:Array.from({length:n},()=>String.fromCharCode(97+rand(5))).join(''),maxCost:rand(8)}];})]){
    const costs=[...s].map((ch,i)=>Math.abs(ch.charCodeAt(0)-p.t.charCodeAt(i))),expected=Math.max(0,...ranges(costs).filter(([l,r])=>sum(costs.slice(l,r+1))<=p.maxCost).map(([l,r])=>r-l+1)),r=build(1208,s,p);assert.equal(r.answer,expected);
    for(const st of r.steps){const v=st.windowDecisionView;assert.deepEqual(v.items,costs);assert.equal(v.sum,sum(costs.slice(v.left,v.right+1)));}
  }
});

test('1358, 2799 and 2962 credit each valid position pair exactly once, preserving both 1358 approaches',()=>{
  for(const id of[1358,2799,2962])for(const approach of(id===1358?['1','2']:['1']))for(const [input,p]of presets[id]){
    const a=typeof input==='string'?[...input]:plain(input),params={...p,approach},r=build(id,input,params),required=id===1358?['a','b','c']:id===2799?[...new Set(a)]:[Math.max(...a)],valid=ranges(a).filter(([l,r])=>{const freq=counts(a.slice(l,r+1));return id===2962?(freq[required[0]]||0)>=p.k:required.every(x=>freq[x]>0);}),expected=new Set(valid.map(a=>a.join(':')));
    assert.equal(r.answer,valid.length);
    for(const step of r.steps){const v=step.windowDecisionView,credited=ctx.wdCredited(v),enumerated=[];for(const g of v.groups)for(let i=g.from;i<=g.to;i++)enumerated.push(g.direction==='ends'?`${g.fixed}:${i}`:`${i}:${g.fixed}`);assert.equal(credited.size,enumerated.length,'no double counting');assert.equal(credited.size,v.answer);for(const pair of credited)assert.ok(expected.has(pair));}
    assert.deepEqual([...ctx.wdCredited(r.steps.at(-1).windowDecisionView)].sort(),[...expected].sort());
  }
});

test('1499 candidate points, distance band and best pair match an independent quadratic oracle',()=>{
  for(const [text,p]of presets[1499]){const points=text.split(';').map(s=>s.split(',').map(Number)),valid=[];for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)if(points[j][0]-points[i][0]<=p.k)valid.push(points[i][1]+points[j][1]+points[j][0]-points[i][0]);const r=build(1499,text,p);assert.equal(r.answer,Math.max(...valid));
    for(const step of r.steps){const v=step.windowDecisionView;if(v.phase==='push')for(let i=1;i<v.deque.length;i++){const a=points[v.deque[i-1]],b=points[v.deque[i]];assert.ok(a[1]-a[0]>b[1]-b[0]);}if(v.candidate){const a=points[v.candidate.left],b=points[v.candidate.right];assert.ok(b[0]-a[0]<=p.k);assert.equal(v.candidate.sum,a[1]+b[1]+b[0]-a[0]);}}
  }
});

test('frequency caps, distinct sums and replacement answers retain valid best-window witnesses',()=>{
  for(const id of[3090,2958,2461,2024])for(const [input,p]of presets[id]){const a=typeof input==='string'?[...input]:plain(input),all=ranges(a),valid=all.filter(([l,r])=>{const f=counts(a.slice(l,r+1));return id===2461?r-l+1===p.k&&Object.keys(f).length===p.k:id===2024?r-l+1-Math.max(...Object.values(f))<=p.k:Math.max(...Object.values(f))<=(id===3090?2:p.k);}),expected=Math.max(0,...valid.map(([l,r])=>id===2461?sum(a.slice(l,r+1)):r-l+1)),r=build(id,input,p);assert.equal(r.answer,expected);
    const v=r.steps.at(-1).windowDecisionView;if(v.best.length){const l=v.best[0],right=v.best.at(-1);assert.ok(valid.some(([a,b])=>a===l&&b===right));assert.equal(id===2461?sum(a.slice(l,right+1)):right-l+1,expected);}else assert.equal(expected,0);
    for(const step of r.steps.filter(s=>!s.final)){const view=step.windowDecisionView;assert.deepEqual(counts(view.members.map(i=>a[i])),Object.fromEntries(Object.entries(view.freq).filter(([,n])=>n>0)));}
  }
});

test('2904 keeps both algorithms, exact one-bit counts and lexicographic ties',()=>{
  const samples=[...presets[2904].map(plain),...Array.from({length:25},()=>[Array.from({length:1+rand(10)},()=>String(rand(2))).join(''),{k:1+rand(4)}])];
  for(const approach of['1','2'])for(const [s,p]of samples){const good=ranges([...s]).map(([l,r])=>s.slice(l,r+1)).filter(s=>[...s].filter(c=>c==='1').length===p.k).sort((a,b)=>a.length-b.length||a.localeCompare(b)),r=build(2904,s,{...p,approach});assert.equal(r.answer,good[0]??'');
    for(const st of r.steps){const v=st.windowDecisionView;assert.equal(v.approach,Number(approach));if(v.candidate){assert.equal(v.candidate.text,s.slice(v.candidate.left,v.candidate.right+1));assert.equal([...v.candidate.text].filter(c=>c==='1').length,p.k);}}
  }
});

test('2271 carpet intersections match exhaustive placements across intervals and gaps',()=>{
  for(const [text,p]of presets[2271]){const tiles=text.split(';').map(s=>s.split(',').map(Number)),white=new Set(tiles.flatMap(([a,b])=>Array.from({length:b-a+1},(_,i)=>a+i)));let expected=0;for(let start=Math.min(...white)-p.carpetLen;start<=Math.max(...white);start++){let covered=0;for(let i=0;i<p.carpetLen;i++)covered+=white.has(start+i);expected=Math.max(expected,covered);}const r=build(2271,text,p);assert.equal(r.answer,expected);const v=r.steps.at(-1).windowDecisionView;assert.equal(v.carpet[1]-v.carpet[0]+1,p.carpetLen);assert.equal([...white].filter(i=>i>=v.carpet[0]&&i<=v.carpet[1]).length,expected);}
});

test('283 swap arrows use the old write slot while the displayed write pointer advances',()=>{
  for(const [a]of presets[283]){const r=build(283,a),expected=[...a.filter(n=>n!==0),...a.filter(n=>n===0)];assert.deepEqual(r.answer,expected);for(const st of r.steps){const v=st.windowDecisionView;if(v.swap){const after=[...v.before];[after[v.swap.left],after[v.swap.right]]=[after[v.swap.right],after[v.swap.left]];assert.deepEqual(v.items,after);assert.equal(v.swap.left,v.write-1);}}}
});

test('100 preserves node paths and null slots, distinguishes values from subtree return values',()=>{
  for(const [input,params]of presets[100]){const r=build(100,input,params);for(const st of r.steps){const v=st.sameTreeView;for(const side of['p','q']){const topology=v[side+'Topology'];assert.equal(new Set(topology.map(n=>n.path)).size,topology.length);if(v[side+'Id']!==null)assert.equal(topology.find(n=>n.id===v[side+'Id']).value,v[side+'Value']);}const layout=ctx.wdTreeLayout(v,v.path);for(const n of[...v.pTopology,...v.qTopology])assert.ok(layout.positions.has(n.path));}}
  assert.equal(build(100,'1,2',{q:'1,null,2'}).answer,false);assert.equal(build(100,'',{q:''}).answer,true);
});

test('3306 per-end differences count exactly k consonants with all five vowels',()=>{
  for(const [word,p]of presets[3306]){const r=build(3306,word,p),expected=Array(word.length).fill(0);for(const [l,end]of ranges([...word])){const s=word.slice(l,end+1);if([...'aeiou'].every(v=>s.includes(v))&&[...s].filter(c=>!'aeiou'.includes(c)).length===p.k)expected[end]++;}assert.equal(r.answer,sum(expected));const v=r.steps.at(-1).vowelSubstrings3306View;assert.deepEqual(v.perRight[0].map((n,i)=>n-v.perRight[1][i]),expected);}
});

test('528 target tickets map to the first prefix at least target, including inclusive block boundaries',()=>{
  for(const [input,p]of presets[528]){const weights=input.split(',').map(Number),prefix=[];let total=0;for(const n of weights)prefix.push(total+=n);const targets=p.targets.split(',').map(Number),expected=targets.map(t=>prefix.findIndex(n=>n>=t)),r=build(528,input,p);assert.deepEqual(r.answer,expected);
    for(const st of r.steps){const v=st.randomPickView;assert.deepEqual(v.prefix,prefix.slice(0,v.prefix.length));if(v.target!==null&&v.lo!==null&&v.hi!==null){const result=prefix.findIndex(n=>n>=v.target);assert.ok(v.lo<=result&&result<=v.hi);}if(v.result!==null)assert.equal(v.result,prefix.findIndex(n=>n>=v.target));}
  }
});

test('528 linear scans agree with binary search for every ticket and preserve exact cumulative state',()=>{
  for(const weights of[[1,3,2],[2,3,1],[7],[1,1,1,1],[9,1,2]]){
    const total=sum(weights);
    for(let start=1;start<=total;start+=8){const targets=Array.from({length:Math.min(8,total-start+1)},(_,i)=>start+i).join(','),a=build(528,weights.join(','),{targets,approach:'1'}),b=build(528,weights.join(','),{targets,approach:'2'});assert.deepEqual(b.answer,a.answer);
      for(const st of b.steps){const v=st.randomPickView;assert.equal(v.method,2);if(v.scanIndex>=0&&['add','compare','resolved','done'].includes(v.decision))assert.equal(v.cumulative,sum(weights.slice(0,v.scanIndex+1)));if(v.result!==null)assert.ok(v.target<=v.cumulative&&v.target>v.cumulative-weights[v.result]);}
    }
  }
});

test('528 alias columns own exactly n*w integer tickets and handle both sides of every cut',()=>{
  assert.equal(SUPPORTED[528].extraParams.find(p=>p.key==='columns').allowEmpty,true);
  for(const weights of[[1,3,2],[2,3,1],[7],[1,1,1,1],[9,1,2],[1,1,1,10,1],[3,7,2,8]]){
    const total=sum(weights),r=build(528,weights.join(','),{targets:'1',columns:'0',approach:'3'}),v=r.steps.at(-1).randomPickView,mass=Array(weights.length).fill(0);
    for(let column=0;column<weights.length;column++){assert.ok(Number.isInteger(v.cut[column])&&v.cut[column]>=0&&v.cut[column]<=total);mass[column]+=v.cut[column];mass[v.alias[column]]+=total-v.cut[column];
      const rolls=[...new Set([1,total,v.cut[column],v.cut[column]+1].filter(n=>n>=1&&n<=total))];const q=build(528,weights.join(','),{targets:rolls.join(','),columns:rolls.map(()=>column).join(','),approach:'3'});assert.deepEqual(q.answer,rolls.map(roll=>roll<=v.cut[column]?column:v.alias[column]));
    }
    assert.deepEqual(mass,weights.map(w=>w*weights.length));
    for(const st of r.steps){const v=st.randomPickView;assert.equal(v.method,3);assert.equal(SUPPORTED[528].code3[st.codeLines[0]-1].trim(),v.source);}
  }
  assert.throws(()=>build(528,'1,3,2',{targets:'1,2',columns:'3,0',approach:'3'}),/columns/);
});

test('528 displayed Python executes all three sampling methods with the recorded simulated draws',()=>{
  const cases=[];for(const method of[1,2,3])for(const [input,p]of presets[528]){const weights=input.split(',').map(Number),targets=p.targets.split(',').map(Number),columns=targets.map((_,i)=>i%weights.length),r=build(528,input,{...p,approach:String(method)});cases.push({method,weights,targets,columns,code:SUPPORTED[528]['code'+(method===1?'':method)].join('\n'),expected:r.answer});}
  const script="import json,sys,random\nfor case in json.load(sys.stdin):\n scope={'List':list}\n exec(case['code'],scope)\n obj=scope['Solution'](case['weights'])\n rolls=iter(case['targets']); columns=iter(case['columns'])\n old_int,old_range=random.randint,random.randrange\n random.randint=lambda a,b:next(rolls)\n random.randrange=lambda n:next(columns)\n try:\n  got=[obj.pickIndex() for _ in case['targets']]\n  assert got==case['expected'],(case['method'],got,case['expected'])\n finally:\n  random.randint,random.randrange=old_int,old_range\nprint('ok')";
  const r=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify(cases),encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/ok/);
});

test('all 19 lessons and every approach render immutable replay in both languages',()=>{
  for(const id of ids)for(const method of(id===3505?[1,2,3,4,5,6,7]:id===528?[1,2,3]:[1358,2904].includes(id)?[1,2]:[1])){
    const p=SUPPORTED[id],params=Object.fromEntries((p.extraParams||[]).map(p=>[p.key,p.default])),r=build(id,p.defaultInput,{...params,approach:String(method)}),before=JSON.stringify(r);ctx.steps=r.steps;
    for(const language of['vi','en']){ctx.lang=language;r.steps.forEach((step,i)=>{ctx.stepIndex=i;ctx.renderWindowDecisionPictures(step);assert.match(host.innerHTML,new RegExp(`data-wd-problem="${id}"`));assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);});}
    assert.equal(JSON.stringify(r),before);
    if(id===3505)assert.equal(r.steps.at(-1).equalSubarrays3505View.method,method);
  }
});

test('every preset is accepted and each dedicated renderer is deferred in the problem asset templates',()=>{
  for(const id of ids)for(const [input,params]of presets[id]){const r=build(id,input,params);assert.ok(r.steps.length);assert.ok(r.steps.at(-1).final);assert.equal(ctx.wdRead(r.steps.at(-1)).id,id);}
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');for(const name of['renderer-window-decision-pictures.js','window-decision-pictures.css'])assert.equal(html.split(name+'?').length-1,1);
});
