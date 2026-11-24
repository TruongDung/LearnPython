'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[3411];
const run=input=>p.builder(input??p.defaultInput);
function oracle(nums){const gcd=(a,b)=>b===0n?a:gcd(b,a%b);let best=0,range=null;const windows=new Map();for(let left=0;left<nums.length;left++){let prod=1n,g=0n,l=1n;for(let right=left;right<nums.length;right++){const n=BigInt(nums[right]);prod*=n;g=gcd(g,n);l=l/gcd(l,n)*n;const match=prod===g*l;windows.set(`${left},${right}`,match);if(match&&right-left+1>best){best=right-left+1;range=[left,right];}}}return{best,range,windows};}
const examples=[[1,2,1,2,1,1,1],[2,3,4,5,6],[1,2,3,1,4,5,1],[2,2,2,2],[1,1,1,1],[2,8],Array(12).fill(1),Array(12).fill(10)];
test('3411 matches independent BigInt enumeration, including every short array and skipped branches',()=>{
 const arrays=[...examples];for(let n=2;n<=5;n++)for(let mask=0;mask<3**n;mask++){let m=mask;arrays.push(Array.from({length:n},()=>{const x=m%3+1;m=Math.floor(m/3);return x;}));}
 let seed=3411;for(let i=0;i<80;i++){const length=2+i%11;arrays.push(Array.from({length},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%10+1;}));}
 for(const nums of arrays){const expected=oracle(nums),r=run(nums),v=r.steps.at(-1).equalProducts3411View;assert.equal(r.answer,expected.best,nums.join(','));assert.deepEqual([v.best.left,v.best.right],expected.range);for(const cell of v.cells){if(cell.pruned)assert.equal(expected.windows.get(`${cell.left},${cell.right}`),false);else assert.equal(cell.match,expected.windows.get(`${cell.left},${cell.right}`));}assert.ok(r.steps.every(s=>(s.equalProducts3411View.product??0)<=252000));}
});
test('3411 source updates the three registers independently and publishes matches only at the executed if',()=>{
 const r=run('2,3,4'),frames=r.steps.map(s=>s.equalProducts3411View),product=frames.find(v=>v.line===13&&v.right===1),g=frames.find(v=>v.line===14&&v.right===1),l=frames.find(v=>v.line===15&&v.right===1);
 assert.equal(product.product,6);assert.equal(product.g,2);assert.equal(product.l,2);assert.equal(product.productTo,1);assert.equal(product.gcdTo,0);assert.equal(product.comparison,null);assert.deepEqual(product.update,{kind:'product',before:2,value:3,after:6});
 assert.equal(g.g,1);assert.equal(g.l,2);assert.equal(l.l,6);assert.equal(l.comparison,null);
 const target=frames.find(v=>v.line===16&&v.right===1);assert.equal(target.comparison.target,6);assert.equal(target.comparison.match,null);
 const checked=frames.find(v=>v.line===17&&v.right===1);assert.equal(checked.comparison.match,true);assert.equal(checked.answer,0);
 const committed=frames.find(v=>v.line===18&&v.right===1);assert.equal(committed.answer,2);assert.equal(committed.best.left,0);assert.equal(committed.best.right,1);
 assert.ok(frames.some(v=>v.line===20&&v.comparison.over===true));assert.ok(frames.some(v=>v.line===11&&v.condition===false));
});
function python(){const command=(process.env.PYTHON?[process.env.PYTHON]:['python3','python3.14','python3.13','python3.12','python3.11','python3.10','/opt/homebrew/bin/python3']).find(name=>{const r=spawnSync(name,['-c','import sys; print(sys.version_info.major*100+sys.version_info.minor)'],{encoding:'utf8'});return r.status===0&&Number(r.stdout.trim())>=310;});assert.ok(command,'CPython 3.10+ is required.');return command;}
test('3411 every executed statement and post-statement local matches CPython, including break and loop exhaustion',()=>{
 const payloads=examples.slice(0,6).map(nums=>({code:p.code.join('\n'),method:'maxLength',args:[nums]})),source="import json,sys,runpy\nf=runpy.run_path('problems/picture-trace.py')['picture_trace']\nprint(json.dumps([json.loads(f(p)) for p in json.load(sys.stdin)]))";
 const result=spawnSync(python(),['-c',source],{cwd:require('node:path').resolve(__dirname,'..'),input:JSON.stringify(payloads),encoding:'utf8',maxBuffer:16e6});assert.equal(result.status,0,result.stderr);
 JSON.parse(result.stdout).forEach((expected,index)=>{const r=run(examples[index]);assert.equal(r.answer,expected.answer);assert.equal(r.steps.length,expected.events.length);r.steps.forEach((s,i)=>assert.deepEqual({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v=>[v.name,v.value]))},{line:expected.events[i].line,locals:expected.events[i].locals}));});
});
test('3411 input validation and live Python cover the official 100-value bound',()=>{
 for(const input of ['','1','0,2','11,2','-1,2','1,,2','1.5,2','[true,2]',Array(13).fill(1)])assert.throws(()=>run(input),/3411/);
 assert.deepEqual(p.liveArgs('[2,8]'),[[2,8]]);assert.throws(()=>p.liveArgs(Array(101).fill(1)),/3411/);
 const cases=[Array(100).fill(1),Array(100).fill(10),Array.from({length:100},(_,i)=>i%10+1)],input={code:p.code.join('\n'),arrays:cases},source="import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p['code'],scope)\nprint(json.dumps([scope['Solution']().maxLength(a) for a in p['arrays']]))";
 const result=spawnSync(python(),['-c',source],{encoding:'utf8',input:JSON.stringify(input)});assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),cases.map(a=>oracle(a).best));assert.equal(p.liveArgs(cases[0])[0].length,100);
});
test('3411 VI/EN figures render every frame without corrupting captures, exposing stale comparisons or overflowing prime factors',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},context={lang:'vi',$:()=>host,steps:[],stepIndex:0,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-equal-products-3411.js'),'utf8'),context);
 for(const input of examples){const r=run(input),before=JSON.stringify(r.steps);context.steps=r.steps;for(const lang of ['vi','en']){context.lang=lang;r.steps.forEach((s,i)=>{context.stepIndex=i;context.renderEqualProducts3411(s);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);assert.match(host.innerHTML,new RegExp(`data-source-line="${s.codeLines[0]}"`));if(s.equalProducts3411View.comparison===null&&!s.final)assert.doesNotMatch(host.innerHTML,/class="mp-equation/);});}assert.equal(JSON.stringify(r.steps),before);}
});
test('3411 factor diagrams show the extra prime copy causing 2×3×4 to fail',()=>{
 const context={escapeHtml:String};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-equal-products-3411.js'),'utf8'),context);const html=context.equalProducts3411Factors([2,3,4],{match:false});assert.equal((html.match(/class="extra"/g)||[]).length,1);assert.match(html,/gcd × lcm/);
});
test('3411 is registered with lazy assets and the shared independent code themes',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),active=html.replace(/<template[\s\S]*?<\/template>/g,'');for(const name of ['equal-products-3411.css','renderer-equal-products-3411.js']){assert.equal(html.split(name).length-1,1);assert.ok(!active.includes(name));}
 assert.equal(p.debugMode,'line-by-line');assert.equal(p.category.key,'math');assert.match(html,/trie-picture-ui\.js[^>]+data-problem-ids="[^"]*\b3411\b/);assert.match(html,/requested-picture-lessons\.css[^>]+data-problem-ids="[^"]*\b3411\b/);
 const registry=fs.readFileSync(require.resolve('../public/script.js'),'utf8');assert.match(registry,/equalProducts3411View.*renderEqualProducts3411/);
});
