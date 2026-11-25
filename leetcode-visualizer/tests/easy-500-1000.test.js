"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const groups=['500-599','600-699','700-799','800-899','900-1000'];
const lessons=Object.assign({},...groups.map(g=>require('../problems/easy-'+g)));
const run=(id,args)=>lessons[id].builder(JSON.stringify(args));
const answer=(id,args)=>run(id,args).answer;
function expected(actual,reference,message){
  if(reference?.uniqueCells){const[m,n,k]=reference.uniqueCells;assert.equal(actual.length,k);assert.equal(new Set(actual.map(p=>p.join(','))).size,k);actual.forEach(([r,c])=>assert.ok(r>=0&&r<m&&c>=0&&c<n));}
  else if(reference?.oneOf)assert.ok(reference.oneOf.some(v=>JSON.stringify(v)===JSON.stringify(actual)),message);
  else if(typeof reference==='number')assert.ok(Math.abs(actual-reference)<1e-7,`${message}: ${actual} != ${reference}`);
  else assert.deepEqual(actual,reference,message);
}
test('281 missing lessons are registered and every ID from 500 through 1000 is available',()=>{
  const {SUPPORTED}=require('../problems');assert.equal(Object.keys(lessons).length,281);
  assert.deepEqual(groups.map(g=>Object.keys(require('../problems/easy-'+g)).length),[60,57,51,60,53]);
  for(let id=500;id<=1000;id++)assert.equal(typeof SUPPORTED[id]?.builder,'function',`Missing #${id}`);
  for(const p of Object.values(lessons)){
    assert.equal(SUPPORTED[p.id],p);assert.ok(p.__catalog.teaching.vi.length>20,`Guide #${p.id}`);
    const r=p.builder(p.defaultInput);expected(r.answer,p.__catalog.expected,`#${p.id}`);assert.ok(r.steps.length);assert.equal(r.steps.filter(s=>s.final).length,1);
    for(const s of r.steps){const v=s.catalogLessonView;assert.equal(v.trace.truncated,false);assert.equal(v.source,p.code[s.codeLines[0]-1]);assert.ok(v.teaching);}
    assert.equal(r.steps.at(-1).final,true);
  }
});
test('all new frames render in both languages without unsafe markup, invalid numbers or snapshot mutation',()=>{
  const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:{code:[]}});
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-catalog-lessons.js'),'utf8'),ctx);
  for(const p of Object.values(lessons)){
    const r=p.builder(p.defaultInput),before=JSON.stringify(r);ctx.problemData=p;
    for(const lang of['vi','en']){ctx.lang=lang;for(const s of r.steps){ctx.renderCatalogLesson(s);assert.match(host.innerHTML,/cl-teaching/);assert.doesNotMatch(host.innerHTML,/NaN|undefined|\[object Object\]|<script|<img/);}}
    ctx.renderCatalogLesson(r.steps[0]);const first=host.innerHTML;ctx.renderCatalogLesson(r.steps.at(-1));ctx.renderCatalogLesson(r.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(r),before);
  }
  for(const s of run(616,['<img onerror=x>', ['img']]).steps){ctx.renderCatalogLesson(s);assert.doesNotMatch(host.innerHTML,/<img/);}
});
test('281 Python solutions agree with native CPython answers and executed data statements',()=>{
  const {spawnSync}=require('node:child_process'),context=require('../problems/catalog-context');
  const payloads=Object.values(lessons).map(p=>{const e=p.__catalog;return{code:p.code.join('\n'),method:e.method,args:e.sample,prelude:context+'\n_viz_config=json.loads('+JSON.stringify(JSON.stringify({kinds:e.kinds||[],answerKind:e.answerKind}))+')\n',randomSeed:e.seed??105,maxEvents:e.traceOptions?.maxEvents||6000,failOnTruncate:true,captureAllocations:['TreeNode','ListNode','Node'],stateClasses:['Solution'],objectClasses:['TreeNode','ListNode','Node'],summarizeLocals:e.traceOptions?.summarizeLocals||{}};});
  const program="import json,sys,runpy\np=json.load(sys.stdin);f=runpy.run_path(p['path'])['picture_trace'];out=[]\nfor payload in p['cases']:\n r=json.loads(f(payload));out.append({'answer':r['answer'],'events':[[e['line'],e['scope']] for e in r['events']]})\nprint(json.dumps(out))";
  const python=process.env.PYTHON||path.resolve(__dirname,'../../.venv/Scripts/python.exe');
  const ref=spawnSync(python,['-X','utf8','-c',program],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),cases:payloads}),encoding:'utf8',maxBuffer:32e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const p=Object.values(lessons)[i],r=p.builder(p.defaultInput);expected(r.answer,native.answer,`Native #${p.id}`);
    const data=([line])=>!/^\s*(?:if|elif|else|while|for|return|assert|def|class|import|from|break|continue|nonlocal|@)\b/.test(p.code[line-1]);
    assert.deepEqual(r.steps.map(s=>[s.catalogLessonView.line,s.catalogLessonView.frames.at(-1).name]).filter(data),native.events.filter(data),`Native statement order #${p.id}`);
  });
});
test('lazy assets include all 281 IDs and provide real navigation between source events',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');for(const name of['catalog-lessons.css','renderer-catalog-lessons.js']){const tag=html.split('\n').find(line=>line.includes(name));assert.ok(tag);const ids=new Set(tag.match(/data-problem-ids="([^"]+)"/)[1].split(' '));for(const id of Object.keys(lessons))assert.ok(ids.has(id),`Missing lazy asset ${name} #${id}`);}
  const r=run(763,['ababcbacadefegdehijhklij']);for(const kind of['change','decision','answer']){const host={innerHTML:'',querySelectorAll:()=>[]};let calls=0;const ctx=vm.createContext({steps:r.steps,stepIndex:0,renderStep:()=>calls++,stopPlay:()=>{}});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-catalog-lessons.js'),'utf8'),ctx);ctx.catalogLessonJump(kind);assert.equal(calls,1);const v=r.steps[ctx.stepIndex].catalogLessonView;if(kind==='answer')assert.ok(v.final);else if(kind==='decision')assert.notEqual(v.branch,null);else assert.ok(v.changed.length);}
});
let seed=500;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const permutations=a=>a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]];
const pal=s=>s===[...s].reverse().join('');
test('nearest palindrome, next permutation, looped strings and weighted median have independent small oracles',()=>{
  for(const n of[1,9,10,11,99,100,101,999,1000,123,9999]){let d=1;while(!pal(String(n-d))&&!pal(String(n+d)))d++;assert.equal(answer(564,[String(n)]),String(pal(String(n-d))?n-d:n+d));}
  for(const n of[12,21,115,2301,1243]){const values=[...new Set(permutations([...String(n)]).map(a=>Number(a.join(''))))].filter(x=>x>n);assert.equal(answer(556,[n]),values.length?Math.min(...values):-1);}
  for(const words of[['ab','cd'],['ab','x','ba'],['a','b']]){let best='';for(let mask=0;mask<2**words.length;mask++){const loop=words.map((w,i)=>mask>>i&1?[...w].reverse().join(''):w).join('');for(let i=0;i<loop.length;i++){const value=loop.slice(i)+loop.slice(0,i);if(value>best)best=value;}}assert.equal(answer(555,[words]),best);}
  for(let t=0;t<12;t++){const rows=Array.from({length:4},(_,num)=>({num,frequency:random(4)+1}));const values=rows.flatMap(r=>Array(r.frequency).fill(r.num));assert.equal(answer(571,[rows]),(values[(values.length-1)>>1]+values[values.length>>1])/2);}
});
test('wildcard decoding, attendance, out-of-bound paths and one-edit monotonicity cover edge states',()=>{
  function decode(s){if(!s)return 1;let count=0;for(let value=1;value<=26;value++){const text=String(value);if(text.length<=s.length&&[...text].every((ch,i)=>s[i]===ch||s[i]==='*'&&ch!=='0'))count+=decode(s.slice(text.length));}return count;}
  for(const s of['*','1*','*0','**','***','0','10','2*','30','*1*'])assert.equal(answer(639,[s]),decode(s));
  for(const s of['PPALLP','PPALLL','AA','L',''])assert.equal(answer(551,[s]),[...s].filter(ch=>ch==='A').length<2&&!s.includes('LLL'));
  function paths(m,n,moves,r,c){if(r<0||r>=m||c<0||c>=n)return 1;if(!moves)return 0;return [[1,0],[-1,0],[0,1],[0,-1]].reduce((sum,[dr,dc])=>sum+paths(m,n,moves-1,r+dr,c+dc),0);}
  for(const[m,n,k,r,c]of[[1,1,0,0,0],[1,1,1,0,0],[2,3,3,0,1],[3,2,4,2,1]])assert.equal(answer(576,[m,n,k,r,c]),paths(m,n,k,r,c));
  for(let t=0;t<18;t++){const a=Array.from({length:5},()=>random(5));const sorted=b=>b.every((v,i)=>!i||b[i-1]<=v);let possible=sorted(a);for(let i=0;i<a.length;i++)for(let v=-1;v<=5;v++){const b=a.slice();b[i]=v;possible||=sorted(b);}assert.equal(answer(665,[a]),possible);}
});
test('coin paths use the lowest cost and then the lexicographically smallest complete route',()=>{
  for(let t=0;t<12;t++){const a=Array.from({length:6},()=>random(5)-1),jump=2+random(2);const paths=[];function visit(i,path,cost){if(a[i]<0)return;path=[...path,i+1];cost+=a[i];if(i===a.length-1)paths.push({path,cost});else for(let j=i+1;j<=Math.min(a.length-1,i+jump);j++)visit(j,path,cost);}visit(0,[],0);paths.sort((a,b)=>a.cost-b.cost||a.path.join(',').localeCompare(b.path.join(',')));assert.deepEqual(answer(656,[a,jump]),paths[0]?.path||[]);}
});
test('bulb parity and empty-slot days agree with direct day-by-day simulations',()=>{
  for(let n=1;n<=5;n++)for(let m=0;m<=3;m++){let states=new Set(['1'.repeat(n)]);for(let press=0;press<m;press++){const next=new Set();for(const s of states)for(let button=0;button<4;button++)next.add([...s].map((bit,i)=>(button===0||button===1&&(i+1)%2===0||button===2&&(i+1)%2===1||button===3&&(i+1)%3===1)?String(1-Number(bit)):bit).join(''));states=next;}assert.equal(answer(672,[n,m]),states.size);}
  for(let t=0;t<10;t++){const bulbs=permutations([1,2,3,4])[random(24)],k=random(3);let expected=-1;const active=new Set();for(let day=0;day<4;day++){active.add(bulbs[day]);for(let left=1;left+k+1<=4;left++)if(active.has(left)&&active.has(left+k+1)&&Array.from({length:k},(_,i)=>left+i+1).every(x=>!active.has(x)))expected=expected<0?day+1:expected;}assert.equal(answer(683,[bulbs,k]),expected);}
});
test('repeated subarrays, pair distances and minimum subsequence windows agree with enumeration',()=>{
  for(let t=0;t<12;t++){const a=Array.from({length:5},()=>random(4)),b=Array.from({length:4},()=>random(4));let best=0;for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){let size=0;while(i+size<a.length&&j+size<b.length&&a[i+size]===b[j+size])size++;best=Math.max(best,size);}assert.equal(answer(718,[a,b]),best);const distances=[];for(let i=0;i<a.length;i++)for(let j=0;j<i;j++)distances.push(Math.abs(a[i]-a[j]));distances.sort((a,b)=>a-b);const k=random(distances.length)+1;assert.equal(answer(719,[a,k]),distances[k-1]);}
  for(const[s,t]of[['abcdebdde','bde'],['aaaa','aa'],['abc','d'],['abcb','bb'],['abc','abc']]){let best='';for(let i=0;i<s.length;i++)for(let j=i+1;j<=s.length;j++){const part=s.slice(i,j);let k=0;for(const ch of part)if(ch===t[k])k++;if(k===t.length&&(!best||part.length<best.length))best=part;}assert.equal(answer(727,[s,t]),best);}
});
test('intersection greedy and chessboard swaps agree with exhaustive subset and board searches',()=>{
  for(const intervals of[[[1,3],[1,4],[2,5],[3,5]],[[0,1],[1,2],[2,3]],[[0,4],[2,5]]]){let best=7;for(let mask=0;mask<64;mask++){const points=Array.from({length:6},(_,i)=>i).filter(i=>mask>>i&1);if(intervals.every(([a,b])=>points.filter(x=>a<=x&&x<=b).length>=2))best=Math.min(best,points.length);}assert.equal(answer(757,[intervals]),best);}
  for(let mask=0;mask<16;mask++){const board=Array.from({length:2},(_,r)=>Array.from({length:2},(_,c)=>mask>>(r*2+c)&1));const queue=[[board,0]],seen=new Set();let best=-1;for(let q=0;q<queue.length;q++){const[b,d]=queue[q],key=b.flat().join('');if(seen.has(key))continue;seen.add(key);if(key==='0110'||key==='1001'){best=d;break;}queue.push([[b[1],b[0]],d+1],[b.map(row=>[row[1],row[0]]),d+1]);}assert.equal(answer(782,[board]),best);}
});
test('matrix flips, advantage matching, subsequence widths and contiguous ORs have independent exhaustive oracles',()=>{
  for(let t=0;t<8;t++){const grid=Array.from({length:2},()=>Array.from({length:3},()=>random(2)));let best=0;for(let mask=0;mask<32;mask++){let score=0;for(let r=0;r<2;r++)for(let c=0;c<3;c++)score+=(grid[r][c]^(mask>>r&1)^(mask>>(c+2)&1))*2**(2-c);best=Math.max(best,score);}assert.equal(answer(861,[grid]),best);
    const a=Array.from({length:5},()=>random(9)),b=Array.from({length:5},()=>random(9));const arranged=answer(870,[a,b]);assert.deepEqual([...arranged].sort(),[...a].sort());assert.equal(arranged.filter((v,i)=>v>b[i]).length,Math.max(...permutations(a).map(p=>p.filter((v,i)=>v>b[i]).length)));
    let widths=0;for(let mask=1;mask<32;mask++){const sub=a.filter((_,i)=>mask>>i&1);widths+=Math.max(...sub)-Math.min(...sub);}assert.equal(answer(891,[a]),widths);const ors=new Set();for(let i=0;i<a.length;i++){let value=0;for(let j=i;j<a.length;j++)ors.add(value|=a[j]);}assert.equal(answer(898,[a]),ors.size);
  }
});
test('domino simulation, numeric transformations, squareful permutations and arithmetic retain edge-case correctness',()=>{
  function dominoes(s){let state=[...s];while(true){const proposals=state.map(()=>new Set());for(let i=0;i<state.length;i++){const j=state[i]==='R'?i+1:state[i]==='L'?i-1:-1;if(j>=0&&j<state.length&&state[j]==='.')proposals[j].add(state[i]);}const next=state.map((ch,i)=>proposals[i].size===1?[...proposals[i]][0]:ch);if(next.join('')===state.join(''))return next.join('');state=next;}}
  for(const s of['.L.R...LR..L..','R...L','R....L','...R','L...','R.L','R....'])assert.equal(answer(838,[s]),dominoes(s));
  for(const[s,t,value]of[['0.(9)','1.',true],['0.1(6)','0.16(6)',true],['0.9','0.(9)',false],['0.00(0)','0',true]])assert.equal(answer(972,[s,t]),value);
  for(const nums of[[1,17,8],[2,2,2],[0,0,1],[1,1,8,8]]){const unique=new Set(permutations(nums).filter(p=>p.slice(1).every((v,i)=>Number.isInteger(Math.sqrt(v+p[i])))).map(p=>p.join(',')));assert.equal(answer(996,[nums]),unique.size);}
  for(let a=0;a<=5;a++)for(let b=0;b<=5;b++)if(Math.max(a,b)<=2*(Math.min(a,b)+1)){const s=answer(984,[a,b]);assert.equal([...s].filter(x=>x==='a').length,a);assert.equal([...s].filter(x=>x==='b').length,b);assert.doesNotMatch(s,/aaa|bbb/);}
});
test('DI permutations, super-palindromes, triple multiplicity and three-part binary splits match enumeration',()=>{
  for(const s of['','D','I','DID','III','DDI','IDID']){const values=Array.from({length:s.length+1},(_,i)=>i);assert.equal(answer(903,[s]),permutations(values).filter(p=>[...s].every((ch,i)=>ch==='I'?p[i]<p[i+1]:p[i]>p[i+1])).length);}
  for(const[lo,hi]of[[1,10000],[4,1000],[400,1000]]){let count=0;for(let root=1;root*root<=hi;root++)if(root*root>=lo&&pal(String(root))&&pal(String(root*root)))count++;assert.equal(answer(906,[String(lo),String(hi)]),count);}
  for(let t=0;t<15;t++){const a=Array.from({length:7},()=>random(6)),target=random(12);let count=0;for(let i=0;i<7;i++)for(let j=i+1;j<7;j++)for(let k=j+1;k<7;k++)count+=a[i]+a[j]+a[k]===target;assert.equal(answer(923,[a,target]),count);
    const bits=Array.from({length:6},()=>random(2));const value=a=>parseInt(a.join(''),2);const possible=[];for(let i=0;i<4;i++)for(let j=i+2;j<6;j++)if(value(bits.slice(0,i+1))===value(bits.slice(i+1,j))&&value(bits.slice(j))===value(bits.slice(0,i+1)))possible.push([i,j]);const result=answer(927,[bits]);if(!possible.length)assert.deepEqual(result,[-1,-1]);else assert.ok(possible.some(p=>p[0]===result[0]&&p[1]===result[1]));
  }
});
test('stamping and pancake outputs replay into valid final states',()=>{
  for(const[stamp,target]of[['abc','ababc'],['abca','aabcaca'],['a','aaaa'],['ab','abab']]){const moves=answer(936,[stamp,target]),state=Array(target.length).fill('?');assert.ok(moves.length<=10*target.length);for(const start of moves){assert.ok(start>=0&&start+stamp.length<=target.length);[...stamp].forEach((ch,j)=>state[start+j]=ch);}assert.equal(state.join(''),target);}
  assert.deepEqual(answer(936,['ab','aa']),[]);
  for(const a of[[3,2,4,1],[1],[1,2,3],[5,1,4,2,3]]){const state=[...a];for(const count of answer(969,[a])){assert.ok(count>=1&&count<=a.length);state.splice(0,count,...state.slice(0,count).reverse());}assert.deepEqual(state,[...a].sort((a,b)=>a-b));}
});
test('column deletion II and III agree with every retained-column subset',()=>{
  for(let t=0;t<14;t++){const rows=Array.from({length:3},()=>Array.from({length:4},()=>String.fromCharCode(97+random(3))).join(''));let second=4,third=4;for(let mask=0;mask<16;mask++){const selected=rows.map(s=>[...s].filter((_,i)=>mask>>i&1).join('')),removed=4-mask.toString(2).replace(/0/g,'').length;if(selected.every((s,i)=>!i||selected[i-1]<=s))second=Math.min(second,removed);if(selected.every(s=>[...s].every((ch,i)=>!i||s[i-1]<=ch)))third=Math.min(third,removed);}assert.equal(answer(955,[rows]),second);assert.equal(answer(960,[rows]),third);}
});
test('slash-region DSU agrees with independent 3x expanded-grid flood fill',()=>{
  function regions(grid){const n=grid.length*3,blocked=Array.from({length:n},()=>Array(n).fill(false));grid.forEach((row,r)=>[...row].forEach((ch,c)=>{for(let d=0;d<3;d++)if(ch==='/')blocked[r*3+d][c*3+2-d]=true;else if(ch===String.fromCharCode(92))blocked[r*3+d][c*3+d]=true;}));let count=0;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!blocked[r][c]){count++;const q=[[r,c]];blocked[r][c]=true;for(const[x,y]of q)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a>=0&&a<n&&b>=0&&b<n&&!blocked[a][b]){blocked[a][b]=true;q.push([a,b]);}}}return count;}
  for(let t=0;t<18;t++){const choices=[' ','/',String.fromCharCode(92)],grid=Array.from({length:2},()=>Array.from({length:2},()=>choices[random(3)]).join(''));assert.equal(answer(959,[grid]),regions(grid));}
});
