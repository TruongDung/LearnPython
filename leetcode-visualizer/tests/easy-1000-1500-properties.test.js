"use strict";
const test=require('node:test'),assert=require('node:assert/strict');
const lessons=Object.assign({},...['1000-1099','1100-1199','1200-1299','1300-1399','1400-1500'].map(g=>require('../problems/easy-'+g)));
const run=(id,args)=>lessons[id].builder(JSON.stringify(args)),answer=(id,args)=>run(id,args).answer;
let seed=1500;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const permutations=a=>a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const integer=a=>a.reduce((v,bit)=>v*(-2)+bit,0);
test('digit algorithms agree with literal decimal counting and integer arithmetic',()=>{
  for(const[lo,hi]of[[0,30],[1,99],[95,125],[999,1030]])for(let digit=0;digit<10;digit++){let count=0;for(let n=lo;n<=hi;n++)count+=[...String(n)].filter(ch=>ch===String(digit)).length;assert.equal(answer(1067,[digit,lo,hi]),count);}
  for(const n of[1,10,20,99,100,123,300])assert.equal(answer(1012,[n]),Array.from({length:n},(_,i)=>String(i+1)).filter(s=>new Set(s).size<s.length).length);
  for(let n=0;n<30;n++){assert.equal(integer([...answer(1017,[n])].map(Number)),n);const a=[...answer(1017,[n])].map(Number),b=[...answer(1017,[n+3])].map(Number);assert.equal(integer(answer(1073,[a,b])),2*n+3);}
  for(const n of[1,6,10,20,99,100]){let count=0;const map={'0':'0','1':'1','6':'9','8':'8','9':'6'};for(let value=1;value<=n;value++){const s=String(value);if([...s].every(ch=>ch in map)&&Number([...s].reverse().map(ch=>map[ch]).join(''))!==value)count++;}assert.equal(answer(1088,[n]),count);}
});
test('one-swap previous permutations and bike assignments match exhaustive choices',()=>{
  const compare=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;};
  for(const a of[[3,1,1,3],[1,9,4,6,7],[1,1,5],[5,4,3,2,1],[3,2,2,1]]){let best=a;const candidates=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const b=[...a];[b[i],b[j]]=[b[j],b[i]];if(compare(b,a)<0)candidates.push(b);}if(candidates.length)best=candidates.sort(compare).at(-1);assert.deepEqual(answer(1053,[a]),best);}
  for(let t=0;t<10;t++){const workers=Array.from({length:3},()=>[random(5),random(5)]),bikes=Array.from({length:4},()=>[random(5),random(5)]);const expected=Math.min(...permutations([0,1,2,3]).map(order=>workers.reduce((sum,p,i)=>sum+Math.abs(p[0]-bikes[order[i]][0])+Math.abs(p[1]-bikes[order[i]][1]),0)));assert.equal(answer(1066,[workers,bikes]),expected);}
  for(const a of[[1,1,1,2,2,2],[1],[1,1,2,2,3],[2,2,2,1,1]]){const r=answer(1054,[a]);assert.deepEqual([...r].sort(),[...a].sort());assert.ok(r.every((v,i)=>!i||v!==r[i-1]));}
});
test('stone moves II agrees with the complete legal endpoint-move graph',()=>{
  const memo=new Map();function solve(s){const key=s.join(',');if(memo.has(key))return memo.get(key);if(s.at(-1)-s[0]===s.length-1)return[0,0];const children=[];for(const rest of[s.slice(1),s.slice(0,-1)])for(let p=rest[0]+1;p<rest.at(-1);p++)if(!rest.includes(p))children.push(solve([...rest,p].sort((a,b)=>a-b)));const value=[1+Math.min(...children.map(p=>p[0])),1+Math.max(...children.map(p=>p[1]))];memo.set(key,value);return value;}
  for(const s of[[1,2,10],[4,7,9],[1,3,5],[1,2,3,7],[1,3,6,8],[2,3,4,5]])assert.deepEqual(answer(1040,[s]),solve(s));
});
test('polygon triangulation and palindrome removal match independent exhaustive ear and removal searches',()=>{
  function triangulate(a){if(a.length===3)return a[0]*a[1]*a[2];let best=Infinity;for(let i=0;i<a.length;i++){const cost=a[(i+a.length-1)%a.length]*a[i]*a[(i+1)%a.length];best=Math.min(best,cost+triangulate(a.filter((_,j)=>i!==j)));}return best;}
  function removals(arr){const queue=[[arr,0]],seen=new Set();for(const[a,d]of queue){const key=a.join(',');if(seen.has(key))continue;seen.add(key);if(!a.length)return d;for(let i=0;i<a.length;i++)for(let j=i+1;j<=a.length;j++){const part=a.slice(i,j);if(part.every((v,k)=>v===part[part.length-1-k]))queue.push([[...a.slice(0,i),...a.slice(j)],d+1]);}}}
  for(let t=0;t<10;t++){const a=Array.from({length:5},()=>random(5)+1);assert.equal(answer(1039,[a]),triangulate(a));const b=Array.from({length:5},()=>random(3));assert.equal(answer(1246,[b]),removals(b));}
});
test('submatrix targets and one-bordered squares match literal cell enumeration',()=>{
  for(let t=0;t<10;t++){const a=Array.from({length:3},()=>Array.from({length:3},()=>random(5)-2)),target=random(5)-2;let count=0;for(let r=0;r<3;r++)for(let c=0;c<3;c++)for(let b=r;b<3;b++)for(let d=c;d<3;d++){let sum=0;for(let i=r;i<=b;i++)for(let j=c;j<=d;j++)sum+=a[i][j];count+=sum===target;}assert.equal(answer(1074,[a,target]),count);
    const grid=a.map(row=>row.map(v=>Number(v>0)));let best=0;for(let r=0;r<3;r++)for(let c=0;c<3;c++)for(let size=1;r+size<=3&&c+size<=3;size++){const edges=[];for(let i=0;i<size;i++)edges.push(grid[r][c+i],grid[r+size-1][c+i],grid[r+i][c],grid[r+i][c+size-1]);if(edges.every(v=>v===1))best=Math.max(best,size*size);}assert.equal(answer(1139,[grid]),best);
  }
});
test('string algorithms retain entity boundaries, scope, lexicographic suffixes and repetition rules',()=>{
  assert.equal(answer(1410,['&amp;gt;&lt;&quot;&apos;&frasl;&unknown;']),'&gt;<'+String.fromCharCode(34,39)+'/&unknown;');
  for(let t=0;t<20;t++){const s=Array.from({length:8},()=>'abc'[random(3)]).join('');assert.equal(answer(1163,[s]),Array.from({length:s.length},(_,i)=>s.slice(i)).sort().at(-1));}
  for(const[text,expected]of[['(let x 2 (mult x (let x 3 y 4 (add x y))))',14],['(let x 3 x 2 x)',2],['(let x 1 y 2 x (add x y) (add x y))',5]])assert.equal(require('../problems/easy-700-799')[736].builder(JSON.stringify([text])).answer,expected);
  for(const s of['a','aaaa','abcba','volvo','antaprezatepzapreanta','merchant']){let best=1;for(let mask=0;mask<2**(s.length-1);mask++){if(s.length>12&&mask>4095)break;const parts=[];let start=0;for(let i=0;i<s.length-1;i++)if(mask>>i&1){parts.push(s.slice(start,i+1));start=i+1;}parts.push(s.slice(start));if(parts.every((p,i)=>p===parts[parts.length-1-i]))best=Math.max(best,parts.length);}if(s.length<=12)assert.equal(answer(1147,[s]),best);}
});
test('scheduler models handle every arrival order and preserve fork and queue ownership',()=>{
  for(const order of permutations([1,2,3]))assert.equal(answer(1114,[order]),'firstsecondthird');
  for(const order of permutations(['odd','even','zero']))for(let n=1;n<=4;n++)assert.deepEqual(answer(1116,[n,order]),Array.from({length:n},(_,i)=>[0,i+1]).flat());
  for(const order of[['foo','bar'],['bar','foo']])for(let n=1;n<=4;n++)assert.equal(answer(1115,[n,order]),'foobar'.repeat(n));
  for(const arrivals of['HHO','OHH','HOH','OOHHHH','HHHHOO','HOHOHH'])assert.equal(answer(1117,[arrivals]),'HHO'.repeat(arrivals.length/3));
  for(const order of permutations([0,1,2,3,4]).filter((_,i)=>i%10===0)){const r=run(1226,[order]);assert.deepEqual([...r.answer].sort(),[0,1,2,3,4]);for(const step of r.steps){const v=step.catalogLessonView,x=v.locals;if(v.source.trim()!=='stage[philosopher] += 1')continue;const active=x.stage.filter(s=>s>=1&&s<=6).length;assert.equal(x.slots,4-active);assert.ok(x.slots>=0);for(let p=0;p<5;p++){if(x.stage[p]===2)assert.equal(x.forks[p],p);if(x.stage[p]===3||x.stage[p]===4){assert.equal(x.forks[p],p);assert.equal(x.forks[(p+1)%5],p);}if(x.stage[p]===5)assert.equal(x.forks[(p+1)%5],p);if(x.stage[p]===0||x.stage[p]===7)assert.ok(!x.forks.includes(p));}}}
  const r=run(1188,[1,[['dequeue'],['enqueue',1],['enqueue',2],['dequeue']]]);assert.deepEqual(r.answer,{results:[2,null,null,1],waiting:[],queue:[]});for(const s of r.steps){const q=s.catalogLessonView.locals.queue;if(q)assert.ok(q.length<=1);}
  assert.deepEqual(answer(1188,[1,[['enqueue',1],['enqueue',2]]]).waiting,[1]);
});
test('verbal arithmetic agrees with all digit injections on small letter sets',()=>{
  function brute(words,result){const chars=[...new Set(words.join('')+result)],leading=new Set([...words,result].filter(w=>w.length>1).map(w=>w[0])),mapping={};const value=w=>Number([...w].map(ch=>mapping[ch]).join(''));function visit(i,used){if(i===chars.length)return words.reduce((sum,w)=>sum+value(w),0)===value(result);const ch=chars[i];for(let d=0;d<10;d++)if(!used.has(d)&&!(d===0&&leading.has(ch))){mapping[ch]=d;used.add(d);if(visit(i+1,used))return true;used.delete(d);}return false;}return visit(0,new Set());}
  for(const[words,result]of[[['A','A'],'B'],[['A','B'],'AA'],[['A','A'],'AA'],[['AB','BA'],'CC'],[['A','B'],'C']])assert.equal(answer(1307,[words,result]),brute(words,result));
});
test('strictly-increasing replacements and weighted jobs agree with complete choice enumeration',()=>{
  function replacements(a,b){let best=Infinity;function visit(i,previous,cost){if(i===a.length){best=Math.min(best,cost);return;}if(a[i]>previous)visit(i+1,a[i],cost);for(const value of b)if(value>previous)visit(i+1,value,cost+1);}visit(0,-Infinity,0);return best===Infinity?-1:best;}
  for(let t=0;t<12;t++){const a=Array.from({length:4},()=>random(6)),b=[0,2,5];assert.equal(answer(1187,[a,b]),replacements(a,b));const starts=Array.from({length:5},()=>random(6)),ends=starts.map(x=>x+1+random(3)),profits=starts.map(()=>random(20)+1);let best=0;for(let mask=0;mask<32;mask++){const jobs=starts.map((start,i)=>({start,end:ends[i],profit:profits[i],i})).filter(j=>mask>>j.i&1).sort((a,b)=>a.start-b.start);if(jobs.every((j,i)=>!i||jobs[i-1].end<=j.start))best=Math.max(best,jobs.reduce((s,j)=>s+j.profit,0));}assert.equal(answer(1235,[starts,ends,profits]),best);}
});
test('two-finger typing, team performance and max dot product agree with all assignments and subsets',()=>{
  function typing(word){let best=Infinity;for(let mask=0;mask<2**word.length;mask++){const positions=[null,null];let sum=0;[...word].forEach((ch,i)=>{const finger=mask>>i&1,pos=ch.charCodeAt(0)-65,old=positions[finger];if(old!==null)sum+=Math.abs((old/6|0)-(pos/6|0))+Math.abs(old%6-pos%6);positions[finger]=pos;});best=Math.min(best,sum);}return best;}
  const subsequences=a=>Array.from({length:2**a.length-1},(_,mask)=>a.filter((_,i)=>(mask+1)>>i&1));
  for(let t=0;t<10;t++){const word=Array.from({length:5},()=>'ABGQZ'[random(5)]).join('');assert.equal(answer(1320,[word]),typing(word));const speed=Array.from({length:5},()=>random(9)+1),eff=Array.from({length:5},()=>random(9)+1),k=1+random(4);let best=0;for(let mask=1;mask<32;mask++){const ids=[0,1,2,3,4].filter(i=>mask>>i&1);if(ids.length<=k)best=Math.max(best,ids.reduce((s,i)=>s+speed[i],0)*Math.min(...ids.map(i=>eff[i])));}assert.equal(answer(1383,[5,speed,eff,k]),best);
    const a=Array.from({length:4},()=>random(7)-3),b=Array.from({length:4},()=>random(7)-3);let dot=-Infinity;for(const x of subsequences(a))for(const y of subsequences(b))if(x.length===y.length)dot=Math.max(dot,x.reduce((s,v,i)=>s+v*y[i],0));assert.equal(answer(1458,[a,b]),dot);
  }
});
test('record-count arrays, distinct hat assignments and row sums match full enumeration',()=>{
  for(let n=1;n<=4;n++)for(let m=1;m<=3;m++){const counts=Array(n+1).fill(0);function visit(a){if(a.length===n){let max=0,cost=0;for(const v of a)if(v>max){cost++;max=v;}counts[cost]++;return;}for(let v=1;v<=m;v++)visit([...a,v]);}visit([]);for(let k=0;k<=n;k++)assert.equal(answer(1420,[n,m,k]),counts[k]);}
  function hats(likes,i=0,used=new Set()){if(i===likes.length)return 1;let total=0;for(const h of likes[i])if(!used.has(h)){used.add(h);total+=hats(likes,i+1,used);used.delete(h);}return total;}
  for(const likes of[[[3,4],[4,5],[5]],[[1,2],[1,2]],[[1],[1]],[[1,2,3],[2,3,4],[1,4]]])assert.equal(answer(1434,[likes]),hats(likes));
  for(let t=0;t<8;t++){const mat=Array.from({length:3},()=>Array.from({length:3},()=>random(8)).sort((a,b)=>a-b));let sums=[0];for(const row of mat)sums=sums.flatMap(s=>row.map(v=>s+v));sums.sort((a,b)=>a-b);for(const k of[1,4,27])assert.equal(answer(1439,[mat,k]),sums[k-1]);}
});
test('two-box probability matches equiprobable assignments of distinguishable balls',()=>{
  for(const balls of[[1,1],[2,1,1],[2,2],[1,1,1,1],[3,1],[2,2,2]]){const colors=balls.flatMap((n,color)=>Array(n).fill(color)),half=colors.length/2;let total=0,good=0;for(let mask=0;mask<2**colors.length;mask++)if(mask.toString(2).replace(/0/g,'').length===half){const first=new Set(),second=new Set();colors.forEach((c,i)=>(mask>>i&1?first:second).add(c));total++;good+=first.size===second.size;}close(answer(1467,[balls]),good/total);}
});
test('binary and N-ary clone graphs contain new nodes with correctly redirected edges',()=>{
  for(const[values,randoms]of[[[1,2,3],[2,0,null]],[[7,7,7],[0,2,1]],[[1,null,2],[2,null,0]]]){const r=run(1485,[values,randoms]),v=r.steps.at(-1).catalogLessonView,byId=new Map(v.objects.map(o=>[o.id,o])),mapping=new Map(v.locals.copies.__pairs__.map(([a,b])=>[a.id,b.id]));assert.deepEqual(r.answer,{tree:values,random:randoms});for(const[original,copy]of mapping){assert.notEqual(original,copy);assert.ok(!mapping.has(copy));const a=byId.get(original).fields,b=byId.get(copy).fields;assert.equal(a.val,b.val);for(const edge of['left','right','random'])assert.equal(b[edge]?.id??null,a[edge]?mapping.get(a[edge].id):null);}}
  const r=run(1490,[[1,[[2,[]],[3,[[4,[]]]]]]]),v=r.steps.at(-1).catalogLessonView,byId=new Map(v.objects.map(o=>[o.id,o]));const original=new Set(),cloned=new Set();function compare(a,b){original.add(a.id);cloned.add(b.id);assert.notEqual(a.id,b.id);const x=byId.get(a.id).fields,y=byId.get(b.id).fields;assert.equal(x.val,y.val);assert.equal(x.children.length,y.children.length);x.children.forEach((child,i)=>compare(child,y.children[i]));}compare(v.locals.root,v.locals.copied);assert.ok([...cloned].every(id=>!original.has(id)));
  assert.deepEqual(answer(1379,[[1,1,1,1,null,null,1],[1,1,1,1,null,null,1],'R']),[1,null,1]);
});
test('course schedules and flood plans agree with exhaustive legal state searches',()=>{
  function semesters(n,edges,k){const full=(1<<n)-1,q=[[0,0]],seen=new Set();for(const[mask,d]of q){if(mask===full)return d;if(seen.has(mask))continue;seen.add(mask);const available=Array.from({length:n},(_,i)=>i).filter(c=>!(mask>>c&1)&&edges.filter(([,b])=>b===c+1).every(([a])=>mask>>(a-1)&1));for(let choice=1;choice<2**available.length;choice++){const ids=available.filter((_,i)=>choice>>i&1);if(ids.length<=k)q.push([ids.reduce((m,i)=>m|(1<<i),mask),d+1]);}}return -1;}
  for(let t=0;t<12;t++){const n=5,k=1+random(3),edges=[];for(let a=1;a<=n;a++)for(let b=a+1;b<=n;b++)if(random(3)===0)edges.push([a,b]);assert.equal(answer(1494,[n,edges,k]),semesters(n,edges,k));}assert.equal(answer(1494,[2,[[1,2],[2,1]],1]),-1);
  function feasible(rains){const lakes=[...new Set(rains.filter(Boolean))];function visit(i,full){if(i===rains.length)return true;const lake=rains[i];if(lake){if(full.has(lake))return false;return visit(i+1,new Set([...full,lake]));}return [0,...lakes].some(lake=>{const next=new Set(full);next.delete(lake);return visit(i+1,next);});}return visit(0,new Set());}
  for(let t=0;t<25;t++){const rains=Array.from({length:7},()=>random(4)),plan=answer(1488,[rains]),possible=feasible(rains);assert.equal(plan.length>0,possible,JSON.stringify(rains));if(possible){const full=new Set();rains.forEach((lake,i)=>{if(lake){assert.equal(plan[i],-1);assert.ok(!full.has(lake));full.add(lake);}else{assert.ok(plan[i]>0);full.delete(plan[i]);}});}}
});
test('box/key reachability agrees with a monotone fixed point',()=>{
  for(let t=0;t<12;t++){const n=5,status=Array.from({length:n},()=>random(2)),candies=Array.from({length:n},()=>random(10)),keys=Array.from({length:n},()=>[0,1,2,3,4].filter(()=>random(4)===0)),contained=Array.from({length:n},()=>[0,1,2,3,4].filter(()=>random(4)===0)),initial=[0];const owned=new Set(initial),unlocked=new Set(),opened=new Set();let changed=true;while(changed){changed=false;for(const box of owned)if(!opened.has(box)&&(status[box]||unlocked.has(box))){opened.add(box);keys[box].forEach(k=>unlocked.add(k));contained[box].forEach(b=>owned.add(b));changed=true;}}assert.equal(answer(1298,[status,candies,keys,contained,initial]),[...opened].reduce((s,i)=>s+candies[i],0));}
});
test('file sharing reuses the smallest free ID and transfers chunks only when a provider exists',()=>{
  const users=new Map(),operations=[],expected=[];for(let i=0;i<35;i++){const ids=[...users.keys()];if(!ids.length||random(3)===0){const chunks=[1,2,3,4].filter(()=>random(2));let id=1;while(users.has(id))id++;users.set(id,new Set(chunks));operations.push(['join',chunks]);expected.push(id);}else if(random(4)===0){const id=ids[random(ids.length)];users.delete(id);operations.push(['leave',id]);expected.push(null);}else{const id=ids[random(ids.length)],chunk=1+random(4),providers=ids.filter(x=>users.get(x).has(chunk)).sort((a,b)=>a-b);if(providers.length)users.get(id).add(chunk);operations.push(['request',id,chunk]);expected.push(providers);}}assert.deepEqual(answer(1500,[4,operations]),expected);
});

test('existing duplicate-substring lesson handles unsuccessful lengths and returns a longest repeated substring',()=>{
 const p=require('../problems').SUPPORTED[1044];
 for(const s of['','a','abcd','banana','aaaaa','abcabcxyzabc']){
  let length=0;for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++){let n=0;while(j+n<s.length&&s[i+n]===s[j+n])n++;length=Math.max(length,n);}
  const r=p.builder(s);assert.equal(r.answer.length,length);assert.ok(r.steps.at(-1).final);
  if(length)assert.ok(s.indexOf(r.answer,s.indexOf(r.answer)+1)>=0);
 }
});
