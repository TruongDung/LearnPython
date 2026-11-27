"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const lessons=require('../problems').SUPPORTED,sources=require('../problems/math-replay-sources.json');
const solve=(id,input,params={})=>lessons[id].builder(input,params);
function roman(n){let s='';for(const[v,c]of[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){s+=c;n-=v;}return s;}
test('math source implementations match independent integer, combinatorial and decimal oracles',()=>{
 const cases=[];const add=(id,args,expected)=>cases.push({id,args,expected});
 for(let n=1;n<=3999;n++)add(13,[roman(n)],n);
 for(let a=-100;a<=100;a++)for(let b=-12;b<=12;b++)if(b)add(29,[a,b],Math.trunc(a/b)||0);
 for(const[a,b]of[[-2147483648,-1],[-2147483648,1],[2147483647,3],[-2147483648,2147483647]])add(29,[a,b],Math.max(-2147483648,Math.min(2147483647,Math.trunc(a/b))));
 for(const x of[-3,-1.5,-1,0,.5,1,2,3])for(let n=-15;n<=15;n++)if(x||n>=0)add(50,[x,n],Math.pow(x,n));
 function permutations(a){if(!a.length)return[''];return a.flatMap((v,i)=>permutations([...a.slice(0,i),...a.slice(i+1)]).map(s=>v+s));}
 for(let n=1;n<=6;n++)permutations(Array.from({length:n},(_,i)=>i+1)).forEach((s,i)=>add(60,[n,i+1],s));
 for(const[n,d,out]of[[1,2,'0.5'],[2,3,'0.(6)'],[1,6,'0.1(6)'],[4,333,'0.(012)'],[-50,8,'-6.25'],[7,-12,'-0.58(3)'],[0,-7,'0'],[-2147483648,-1,'2147483648']])add(166,[n,d],out);
 for(let n=1;n<=2000;n++){let value=n,s='';while(value){value--;s=String.fromCharCode(65+value%26)+s;value=Math.floor(value/26);}add(168,[n],s);add(171,[s],n);}
 for(const[n,s]of[[26,'Z'],[27,'AA'],[701,'ZY'],[702,'ZZ'],[703,'AAA'],[2147483647,'FXSHRXW']]){add(168,[n],s);add(171,[s],n);}
 let factorial=1n;for(let n=0;n<=100;n++){if(n)factorial*=BigInt(n);const s=String(factorial);add(172,[n],s.length-s.replace(/0+$/,'').length);}
 for(let n=0;n<=300;n++){let count=0;for(let x=2;x<n;x++){let prime=true;for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break;}if(prime)count++;}add(204,[n],count);}
 const script='import sys,json\np=json.load(sys.stdin)\nfunctions={}\nfor key,code in p["sources"].items():\n scope={}\n exec(code,scope)\n name=next(name for name in vars(scope["Solution"]) if not name.startswith("_"))\n functions[int(key)]=getattr(scope["Solution"](),name)\nprint(json.dumps([functions[c["id"]](*c["args"]) for c in p["cases"]]))';
 const local=path.resolve(__dirname,'../.viz-python',process.platform==='win32'?'Scripts/python.exe':'bin/python'),python=fs.existsSync(local)?local:process.platform==='win32'?'python':'python3';
 const result=spawnSync(python,['-c',script],{input:JSON.stringify({sources,cases}),encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:5*1024*1024});assert.equal(result.status,0,result.stderr);const answers=JSON.parse(result.stdout);
 cases.forEach((c,i)=>{if(typeof c.expected==='number')assert.ok(Math.abs(answers[i]-c.expected)<=Math.max(1e-10,Math.abs(c.expected)*1e-10),JSON.stringify(c));else assert.equal(answers[i],c.expected,JSON.stringify(c));});
 process.stdout.write(`Verified ${cases.length} independent math cases\n`);
});
test('every new picture uses reversible executed snapshots in both languages, with external line controls',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-math-replays.js'),'utf8'),ctx);
 for(const id of[13,29,50,60,166,168,171,172,204]){const p=lessons[id],params=Object.fromEntries(p.extraParams.map(e=>[e.key,e.default])),run=p.builder(p.defaultInput,params),saved=JSON.stringify(run);assert.equal(p.debugMode,'line-by-line');assert.ok(run.steps.length>1);
  for(const lang of['vi','en']){ctx.lang=lang;for(const step of run.steps){const v=step.mathReplayView;assert.equal(v.source,p.code[v.line-1]);assert.equal(v.result,step.final?run.answer:null);ctx.renderMathReplay(step);assert.match(host.innerHTML,new RegExp(`data-math-id="${id}"`));assert.equal(host.innerHTML.includes('mp-final'),step.final);assert.doesNotMatch(host.innerHTML,/iv-debug|iv-source|data-code-line|\[object Object\]|NaN|<script|<img/);}}
  ctx.renderMathReplay(run.steps[0]);const first=host.innerHTML;ctx.renderMathReplay(run.steps.at(-1));ctx.renderMathReplay(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),saved);assert.equal(run.steps.filter(s=>s.final).length,1);
 }
 const p=lessons[4123],run=p.builder(p.defaultInput);for(const lang of['vi','en'])for(const step of run.steps){const html=ctx.mathPicture(step.catalogLessonView,lang);assert.match(html,/data-math-id="4123"/);assert.doesNotMatch(html,/iv-debug|iv-source|NaN|\[object Object\]/);}
});
test('line execution separates reading, deciding and committing arithmetic changes',()=>{
 const romanRun=solve(13,'IV');assert.equal(romanRun.answer,4);const decision=romanRun.steps.find(s=>s.mathReplayView.source.trim()==='subtract = current < following');assert.equal(decision.mathReplayView.locals.result,0);assert.equal(decision.mathReplayView.history.length,0);assert.deepEqual(romanRun.steps.at(-1).mathReplayView.history.map(h=>h.delta),[-1,5]);
 for(const[a,b]of[[10,3],[-7,3],[0,3],[-2147483648,-1]]){const r=solve(29,[a],{divisor:b});assert.equal(r.answer,Math.min(2147483647,Math.trunc(a/b))||0);}
 assert.equal(solve(50,[-3],{x:2}).answer,.125);assert.equal(solve(50,[-2147483648],{x:1}).answer,1);
 assert.equal(solve(60,[4],{k:9}).answer,'2314');assert.equal(solve(166,'[1,6]').answer,'0.1(6)');assert.equal(solve(168,'[27]').answer,'AA');assert.equal(solve(171,'["AA"]').answer,27);assert.equal(solve(172,'[125]').answer,31);assert.equal(solve(204,[0]).answer,0);
 for(const[id,input,params]of[[13,'IC',{}],[29,[3],{divisor:0}],[50,[-1],{x:0}],[60,[3],{k:7}],[166,'[1,0]',{}],[168,'[0]',{}],[171,'["a"]',{}],[172,'[-1]',{}],[204,[301],{}]])assert.throws(()=>solve(id,input,params));
});
test('picture assets are lazy, versioned, and readable in light/dark themes',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/math-replays.css'),'utf8');for(const asset of['math-replays.css','renderer-math-replays.js']){const line=html.split('\n').find(l=>l.includes(asset));const ids=line.match(/data-problem-ids="([^"]+)"/)[1].split(' ');for(const id of[13,29,50,60,166,168,171,172,204,4123])assert.ok(ids.includes(String(id)));}assert.match(css,/\[data-theme="light"\]/);assert.match(css,/@media\(max-width:600px\)/);assert.match(html,/mathReplays=1/);
});
