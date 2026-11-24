'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED:P}=require('../problems'),{prepareDesignLiveRun}=require('../live-args');
const defaults=id=>Object.fromEntries(P[id].extraParams.map(x=>[x.key,x.default]));
const run=(id,input=P[id].defaultInput,params=defaults(id))=>P[id].builder(input,params);
function permutations(items,k=items.length){if(!k)return[[]];return items.flatMap((value,i)=>permutations(items.filter((_,j)=>i!==j),k-1).map(rest=>[value,...rest]));}
const fixtures={
 18:[['1,0,-1,0,-2,2',{target:0}],['2,2,2,2,2',{target:8}],['1,2,3,4',{target:100}],['-3,-2,-1,0,0,1,2,3',{target:0}],['1',{target:1}],['1000000000,1000000000,-1000000000,-1000000000',{target:0}]],
 26:[['0,0,1,1,1,2,2,3,3,4',{}],['1,1,1,1',{}],['-2,-1,0,1,2',{}],['7',{}],[Array(24).fill(-100).join(','),{}]],
 3799:[['able,area,echo,also',{}],['code,cafe,eden,edge',{}],['aaaa,abba,acca,adda,aeea,affa',{}],['echo,also,area,able',{}]],
 1947:[['110;101;001',{mentors:'100;001;110'}],['00;00;00',{mentors:'11;11;11'}],['10;01',{mentors:'01;10'}],['1',{mentors:'0'}],['10101010;01010101;11001100;00110011;11110000;00001111',{mentors:'01010101;10101010;00110011;11001100;00001111;11110000'}]],
 4060:[['18',{r:22}],['98',{r:101}],['1',{r:10}],['1',{r:1}],['2',{r:2}],['100',{r:100}],['990',{r:1030}],['1',{r:1000000000000000}]],
 1268:[['mobile,mouse,moneypot,monitor,mousepad',{searchWord:'mouse'}],['mobile,mouse,monitor',{searchWord:'moxyz'}],['havana',{searchWord:'havanaxxx'}],['a,ab,abc,b',{searchWord:'zzz'}],['apple,app,appetite,apply,april',{searchWord:'app'}]],
 1804:[['apple,apple,app,apply',{countWord:'apple',countPrefix:'app',erase:'apple'}],['app,apple',{countWord:'app',countPrefix:'app',erase:'app'}],['cat,car',{countWord:'cap',countPrefix:'ca',erase:'cat'}],['a,a,ab',{countWord:'a',countPrefix:'a',erase:'a'}]],
 917:[['ab-cd',{}],['Test1ng-Leet=code-Q!',{}],['123-!',{}],['A',{}],['<a>B&c',{}],['a-1B'.repeat(25),{}]],
};
test('1 finds a valid pair of distinct indices for every short array and handles no solution',()=>{
 for(let n=2;n<=4;n++)for(let mask=0;mask<3**n;mask++){let m=mask;const nums=Array.from({length:n},()=>{const x=[-2,0,2][m%3];m=Math.floor(m/3);return x;});for(const target of [-4,-2,0,2,4]){let exists=false;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)exists ||= nums[i]+nums[j]===target;const input=[...nums],r=run(1,input,{target});assert.deepEqual(input,nums);if(exists){assert.equal(r.answer.length,2);const [a,b]=r.answer;assert.notEqual(a,b);assert.ok(a>=0&&a<n&&b>=0&&b<n);assert.equal(nums[a]+nums[b],target);}else assert.deepEqual(r.answer,[]);}}
});
test('1 seen entries appear only on insertion, reuse stored indices and retain exact line state',()=>{
 for(const [input,target]of [['2,7,11,15',9],['3,3',6],['0,4,3,0',0],['-3,4,3,90',0],['2,2,2,7',9],['1000000000,-1000000000',0],['1,2,3',10]]){const r=run(1,input,{target});for(const s of r.steps){const v=s.lessonPictureView;if(v.line===4)assert.equal(v.complement,null);if(v.lookup===true){assert.ok(v.matchedIndex<v.read);assert.equal(v.nums[v.matchedIndex]+v.current,target);}if(v.line===8){const entry=v.seen.find(x=>x.value===v.current);assert.equal(entry.index,v.read);assert.equal(entry.step,r.steps.indexOf(s));assert.equal(v.lookup,false);}if(v.read!==null&&v.line!==8)assert.ok(v.seen.every(x=>x.index<v.read));}assert.deepEqual(r.steps.at(-1).lessonPictureView.pair,r.answer);}
 const same=run(1,'3,3',{target:6});assert.equal(same.steps.find(s=>s.lessonPictureView.line===6).lessonPictureView.lookup,false);assert.deepEqual(same.answer,[1,0]);
 const overwritten=run(1,'2,2,2,7',{target:9});assert.ok(overwritten.steps.some(s=>s.lessonPictureView.write?.previous===1));assert.deepEqual(overwritten.answer,[3,2]);
});
test('1 validates visual bounds and preserves the full live input range',()=>{
 for(const input of ['', '1', '1,,2', '1.5,2', '[true,2]', '1000000001,2', Array(25).fill(0)])assert.throws(()=>run(1,input,{target:0}),/1:/);
 for(const target of [1e9+1,-1e9-1,1.5,Infinity,'9'])assert.throws(()=>run(1,'2,7',{target}),/1:/);
 assert.equal(P[1].liveArgs(Array(10000).fill(0),{target:0})[0].length,10000);assert.throws(()=>P[1].liveArgs(Array(10001).fill(0),{target:0}),/1:/);
 assert.equal(run(1,Array.from({length:24},(_,i)=>i).join(','),{target:45}).answer.length,2);
});

test('11 maximum water agrees with every pair, including zeros and equal walls',()=>{
 for(const nums of [[1,8,6,2,5,4,8,3,7],[1,1],[0,0,0,0],[1,2,3,4,5],[10000,0,10000]]){let best=0;for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)best=Math.max(best,(j-i)*Math.min(nums[i],nums[j]));const r=run(11,nums.join(',')),v=r.steps.at(-1).lessonPictureView;assert.equal(r.answer,best);assert.equal(v.bestPair.area,best);assert.equal(v.bestPair.width,v.bestPair.right-v.bestPair.left);assert.equal(v.bestPair.height,Math.min(nums[v.bestPair.left],nums[v.bestPair.right]));}
});
test('15 produces every unique zero-sum triplet and no duplicate tuples',()=>{
 for(const nums of [[-1,0,1,2,-1,-4],[0,0,0,0,0],[1,2,3,4],[-2,0,0,2,2],[-100000,0,100000],[-3,-2,-1,0,0,1,2,3]]){const expected=new Set();for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)for(let k=j+1;k<nums.length;k++)if(nums[i]+nums[j]+nums[k]===0)expected.add(JSON.stringify([nums[i],nums[j],nums[k]].sort((a,b)=>a-b)));const r=run(15,nums.join(','));assert.deepEqual(r.answer.map(JSON.stringify).sort(),[...expected].sort());assert.equal(r.answer.length,new Set(r.answer.map(JSON.stringify)).size);}
});
test('16 closest sum and its witness agree with every triplet, including an early exact return',()=>{
 for(const [nums,target]of [[[-1,2,1,-4],1],[[-1,0,1,2],0],[[0,0,0],1],[[1,2,3,4],-10],[[-1000,-1000,1000],10000],[[1,2,4,8,16],12]]){const sums=[];for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)for(let k=j+1;k<nums.length;k++)sums.push(nums[i]+nums[j]+nums[k]);const r=run(16,nums.join(','),{target}),v=r.steps.at(-1).lessonPictureView;assert.equal(Math.abs(r.answer-target),Math.min(...sums.map(s=>Math.abs(s-target))));assert.equal(v.closestRecord.values.reduce((a,b)=>a+b,0),r.answer);assert.equal(new Set(v.closestRecord.indices).size,3);}
 assert.equal(run(16,'-1,0,1,2',{target:0}).steps.at(-1).codeLines[0],16);
});
test('80 writes each sorted value at most twice and keeps the untouched array length',()=>{
 for(const nums of [[0,0,1,1,1,1,2,3,3],[1,1,1,2,2,3],[1,1,1,1,1],[-2,-1,0,1,2],[7],Array(24).fill(-10000)]){const expected=nums.filter((x,i)=>i<2||x!==nums[i-2]),r=run(80,nums.join(',')),v=r.steps.at(-1).lessonPictureView;assert.equal(r.answer,expected.length);assert.deepEqual(v.validPrefix,expected);assert.equal(v.nums.length,nums.length);for(const s of r.steps){const p=s.lessonPictureView;assert.ok(p.validPrefix.every((x,i,a)=>i<2||x!==a[i-2]));if(p.copy)assert.equal(p.nums[p.copy.to],p.original[p.copy.from]);}}
});

test('18 enumerates all unique quadruplets, including repeated values and wide integer sums',()=>{
 for(const [input,params]of fixtures[18]){const nums=input.split(',').map(Number),unique=new Map();for(let a=0;a<nums.length;a++)for(let b=a+1;b<nums.length;b++)for(let c=b+1;c<nums.length;c++)for(let d=c+1;d<nums.length;d++)if(nums[a]+nums[b]+nums[c]+nums[d]===params.target){const row=[nums[a],nums[b],nums[c],nums[d]].sort((a,b)=>a-b);unique.set(JSON.stringify(row),row);}const r=run(18,input,params);assert.deepEqual(r.answer.map(JSON.stringify).sort(),[...unique.keys()].sort());assert.equal(new Set(r.answer.map(JSON.stringify)).size,r.answer.length);}
});
test('26 returns k and writes exactly the unique sorted prefix in place',()=>{
 for(const [input,params]of fixtures[26]){const nums=input.split(',').map(Number),unique=[...new Set(nums)],r=run(26,input,params),v=r.steps.at(-1).lessonPictureView;assert.equal(r.answer,unique.length);assert.deepEqual(v.nums.slice(0,r.answer),unique);assert.equal(v.nums.length,nums.length);for(const s of r.steps){const p=s.lessonPictureView;assert.equal(new Set(p.validPrefix).size,p.validPrefix.length);if(p.copy)assert.equal(p.nums[p.copy.to],p.original[p.copy.from]);}}
});

test('3799 agrees with exhaustive distinct permutations, corner constraints and tuple sorting',()=>{
 for(const [input,params]of fixtures[3799]){const words=input.split(','),expected=permutations(words,4).filter(([t,l,r,b])=>t[0]===l[0]&&t[3]===r[0]&&b[0]===l[3]&&b[3]===r[3]).sort((a,b)=>a.join(',')<b.join(',')?-1:1),r=run(3799,input,params);assert.deepEqual(r.answer,expected);assert.equal(r.steps.at(-1).lessonPictureView.count,expected.length);assert.ok(r.steps.every(s=>s.lessonPictureView.gallery.length<=6));}
});
test('1947 scores and recovered matching agree with exhaustive bijections, including six students',()=>{
 for(const [input,params]of fixtures[1947]){const [students,mentors]=P[1947].liveArgs(input,params),m=students.length,score=students.map(s=>mentors.map(t=>s.reduce((n,b,q)=>n+Number(b===t[q]),0))),expected=Math.max(...permutations(Array.from({length:m},(_,i)=>i)).map(p=>p.reduce((n,j,i)=>n+score[i][j],0))),r=run(1947,input,params),v=r.steps.at(-1).lessonPictureView;
  assert.equal(r.answer,expected);assert.deepEqual(v.score,score);assert.equal(v.path.length,m);assert.equal(new Set(v.path.map(p=>p.mentor)).size,m);assert.equal(v.path.reduce((n,p)=>n+score[p.student][p.mentor],0),expected);
 }
});
test('4060 handles significant zeros, ignored padding, singletons and the full 10^15 bound',()=>{
 const good=x=>[...String(x)].filter(ch=>Number(ch)%2===0).length%2===0;
 for(const [l,params]of fixtures[4060]){const expected=params.r===1e15?500000000000000:Array.from({length:params.r-Number(l)+1},(_,i)=>Number(l)+i).filter(good).length,r=run(4060,l,params),v=r.steps.at(-1).lessonPictureView;assert.equal(r.answer,expected);assert.equal(v.right-v.left,expected);assert.ok(r.steps.some(s=>s.lessonPictureView.transition.started===false));}
 assert.equal(run(4060,'1000000000000000',{r:1e15}).answer,0);
});
test('1268 returns an entry for every character after missing a branch and caches exactly the lexicographic top three',()=>{
 for(const [input,params]of fixtures[1268]){const products=input.split(',').sort(),expected=[...params.searchWord].map((_,i)=>products.filter(p=>p.startsWith(params.searchWord.slice(0,i+1))).slice(0,3)),r=run(1268,input,params),v=r.steps.at(-1).trieLessonView;
  assert.deepEqual(r.answer,expected);assert.equal(v.history.length,params.searchWord.length);for(const node of v.nodes)assert.deepEqual(node.top,node.prefix?products.filter(p=>p.startsWith(node.prefix)).slice(0,3):[]);
 }
});
test('1804 preserves counts for duplicate copies and for a longer word after erasing its prefix word',()=>{
 for(const [input,params]of fixtures[1804]){const config=prepareDesignLiveRun(P[1804],input,params),counts=new Map(),expected=config.operations.map(op=>{const word=op.args[0];if(op.name==='insert'){counts.set(word,(counts.get(word)||0)+1);return null;}if(op.name==='erase'){counts.set(word,counts.get(word)-1);return null;}return op.name==='countWordsEqualTo'?counts.get(word)||0:[...counts].reduce((n,[w,c])=>n+(w.startsWith(word)?c:0),0);}),r=run(1804,input,params),v=r.steps.at(-1).trieLessonView;
  assert.deepEqual(r.answer,expected);assert.deepEqual(v.outputs,expected);for(const node of v.nodes){assert.equal(node.wordCount,counts.get(node.prefix)||0);assert.equal(node.prefixCount,node.prefix?[...counts].reduce((n,[w,c])=>n+(w.startsWith(node.prefix)?c:0),0):0);}
 }
});
test('917 retains every locked index and records all condition evaluations as actual Python lines',()=>{
 for(const [s,params]of fixtures[917]){const letters=[...s].filter(c=>/[A-Za-z]/.test(c)).reverse();let index=0;const expected=[...s].map(c=>/[A-Za-z]/.test(c)?letters[index++]:c).join(''),r=run(917,s,params);assert.equal(r.answer,expected);assert.ok(r.steps.every(step=>step.codeLines.length===1));assert.equal(r.steps.at(-1).codeLines[0],14);}
 const r=run(917,'-a!');assert.ok(r.steps.some(s=>s.lessonPictureView.line===6&&s.lessonPictureView.condition===false));
});

test('all requested lessons match full CPython post-statement lines and locals',()=>{
 const payloads=[];
 for(const id of [1,11,15,16,18,26,80,205,217,219,383,917,1268,1804,1947,3020,3799,4060]){
  let code=P[id].code.join('\n'),args,method={205:'isIsomorphic',217:'containsDuplicate',219:'containsNearbyDuplicate',383:'canConstruct',3020:'maximumLength',1:'twoSum',11:'maxArea',15:'threeSum',16:'threeSumClosest',80:'removeDuplicates',18:'fourSum',26:'removeDuplicates',917:'reverseOnlyLetters',1268:'suggestedProducts',1947:'maxCompatibilitySum',3799:'wordSquares',4060:'countEvenlyGoodIntegers'}[id],extra={};
  if(id===1804){const ops=P[id].prepareLiveDesign(P[id].defaultInput,defaults(id)).operations;args=[ops.map(op=>[op.name,op.args[0]])];method='run';code+=`\nclass Solution:\n    def run(self, operations):\n        trie = Trie()\n        results = []\n        for index, (method, word) in enumerate(operations):\n            results.append(getattr(trie, method)(word))\n        return results`;extra={captureAllocations:['TrieNode'],stateClasses:['Trie']};}
  else args=P[id].liveArgs(P[id].defaultInput,defaults(id));
  payloads.push({id,payload:{code,method,args,...extra,...([15,18,3799].includes(id)?{summarizeLocals:{ans:0}}:{})}});
 }
 const python=`import json,sys,runpy\npicture_trace=runpy.run_path('problems/picture-trace.py')['picture_trace']\nprint(json.dumps([json.loads(picture_trace(p['payload'])) for p in json.load(sys.stdin)]))`;
 const runtime=(process.env.PYTHON?[process.env.PYTHON]:['python3','python3.14','python3.13','python3.12','python3.11','python3.10','/opt/homebrew/bin/python3']).find(command=>{const check=spawnSync(command,['-c','import sys; print(sys.version_info.major*100+sys.version_info.minor)'],{encoding:'utf8'});return check.status===0&&Number(check.stdout.trim())>=310;});assert.ok(runtime,'Trace comparison requires CPython 3.10+ for accurate continue-line events.');
 const result=spawnSync(runtime,['-c',python],{cwd:require('node:path').resolve(__dirname,'..'),input:JSON.stringify(payloads),encoding:'utf8',maxBuffer:16e6});assert.equal(result.status,0,result.stderr);
 JSON.parse(result.stdout).forEach((expected,i)=>{const id=payloads[i].id,r=run(id),events=expected.events.filter(e=>e.line<=P[id].code.length);assert.deepEqual(r.answer,expected.answer);assert.equal(r.steps.length,events.length,`lesson ${id} trace length`);r.steps.forEach((s,index)=>assert.deepEqual({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v=>[v.name,v.value]))},{line:events[index].line,locals:events[index].locals},`lesson ${id}, event ${index}`));});
});

test('VI/EN renderers cover every captured statement without corrupting data or leaking invalid values',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},context={lang:'vi',$:()=>host,steps:[],stepIndex:0,escapeHtml:x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')};vm.createContext(context);
 for(const name of ['renderer-requested-picture-lessons.js','renderer-picture-trie-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+name),'utf8'),context);
 for(const id of [1,11,15,16,18,26,80,205,217,219,383,917,1268,1804,1947,3020,3799,4060]){const r=run(id);context.steps=r.steps;const before=JSON.stringify(r.steps);for(const lang of ['vi','en']){context.lang=lang;r.steps.forEach((s,i)=>{context.stepIndex=i;context[id===1268||id===1804?'renderPictureTrieLesson':'renderLessonPictures'](s);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);assert.match(host.innerHTML,new RegExp(`data-source-line="${s.codeLines[0]}"`));if(id===917)assert.doesNotMatch(host.innerHTML,/<a>|<b>B/);});}assert.equal(JSON.stringify(r.steps),before);}
});
test('input validation and full live constraints remain distinct from readable picture limits',()=>{
 for(const input of ['','a,b,c,d','able,able,echo,also','able,area,echo,also,more,word,next','ABLE,area,echo,also'])assert.throws(()=>run(3799,input,{}),/3799/);
 for(const [input,params]of [['0',{r:22}],['23',{r:22}],['1',{r:1e15+1}],['1.5',{r:22}]])assert.throws(()=>run(4060,input,params),/4060/);
 for(const input of ['','2;0','01;0','[[]]'])assert.throws(()=>run(1947,input,{mentors:'0'}),/1947/);
 assert.throws(()=>run(1947,'0',{mentors:'00'}),/1947/);assert.throws(()=>run(1268,'a,a',{searchWord:'a'}),/1268/);assert.throws(()=>run(1804,'a',{countWord:'a',countPrefix:'a',erase:'b'}),/1804/);
 assert.equal(P[3799].liveArgs(['aaaa','abba','acca','adda','aeea','affa','agga'])[0].length,7);
 assert.equal(P[1947].liveArgs(Array.from({length:8},()=>[1]),{mentors:Array.from({length:8},()=>[0])})[0].length,8);
 assert.equal(P[1268].liveArgs(['a'.repeat(3000)],{searchWord:'a'.repeat(1000)})[1].length,1000);
 assert.throws(()=>run(26,'2,1'),/26/);assert.throws(()=>run(26,'101'),/26/);assert.throws(()=>run(18,'1,,2',{target:0}),/18/);assert.throws(()=>run(18,'1,2,3,4',{target:1e9+1}),/18/);
 for(const [id,input]of [[11,'1'],[11,'-1,2'],[15,'1,2'],[16,'1,2'],[80,'2,1']])assert.throws(()=>run(id,input),new RegExp(String(id)));
 assert.equal(P[11].liveArgs(Array(100000).fill(0))[0].length,100000);assert.equal(P[15].liveArgs(Array(3000).fill(0))[0].length,3000);assert.equal(P[16].liveArgs(Array(500).fill(0),{target:10000})[0].length,500);assert.equal(P[80].liveArgs(Array(30000).fill(-10000))[0].length,30000);
 assert.equal(P[18].liveArgs(Array(200).fill(0),{target:0})[0].length,200);assert.equal(P[26].liveArgs(Array(30000).fill(-100))[0].length,30000);
});
test('new assets are lazy, use shared independent code themes, and preserve existing shared picture assets',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),active=html.replace(/<template[\s\S]*?<\/template>/g,'');
 for(const name of ['requested-picture-lessons.css','renderer-requested-picture-lessons.js','picture-trie-lessons.css','renderer-picture-trie-lessons.js','system-picture-lessons.css','renderer-system-picture-lessons.js']){assert.equal(html.split(name).length-1,1,`one manifest entry for ${name}`);assert.ok(!active.includes(name));}
 assert.match(fs.readFileSync(require.resolve('../public/renderer-picture-lessons.js'),'utf8'),/function renderPictureLesson\(/);
 assert.match(fs.readFileSync(require.resolve('../public/picture-lessons.css'),'utf8'),/\.pl-viz/);
 for(const id of [1,11,15,16,18,26,80,205,217,219,383,917,1268,1804,1947,3020,3799,4060]){assert.equal(P[id].debugMode,'line-by-line');assert.match(html,new RegExp(`trie-picture-ui\\.js[^>]+data-problem-ids="[^"]*\\b${id}\\b`));}
});
