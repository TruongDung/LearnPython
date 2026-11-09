'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[833],run=(s=p.defaultInput,params={})=>p.builder(s,params),view=s=>s.findReplace833View;
function oracle(s,indices,sources,targets){let out=s;for(const {index,source,target}of indices.map((index,i)=>({index,source:sources[i],target:targets[i]})).filter(o=>s.startsWith(o.source,o.index)).sort((a,b)=>b.index-a.index))out=out.slice(0,index)+target+out.slice(index+source.length);return out;}
let seed=833;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function ui(lang='vi',extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-find-replace-string-833.js'),'utf8'),ctx);return {ctx,render:s=>{ctx.renderFindReplace833View(s);return host.innerHTML;}};}
test('833 replays one actual Python statement per frame and returns the real Python result',()=>{
  const r=run();assert.equal(r.answer,'eeebffff');assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(p.visualizationLimits.completeTrace,true);
  for(const s of r.steps){const v=view(s);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(p.code[v.source.line-1].trim(),v.source.text);assert.equal(v.locals.s,'abcd');assert.equal(v.preview,(v.locals.answer??[]).join(''));assert.deepEqual(v.parts,v.locals.answer??null);assert.deepEqual(v.replacements,v.locals.replacements.__pairs__??[]);assert.equal(v.cursor,v.locals.i??null);}
});
test('source checks, dictionary assignments, appends and index advancement occur at separate native steps',()=>{
  for(const params of [{indices:[0,2],sources:['a','cd'],targets:['eee','ffff']},{indices:[0,2],sources:['ab','ec'],targets:['eee','ffff']}]){let previous;
    for(const s of run('abcd',params).steps){const v=view(s),x=v.locals;
      if(v.change?.kind==='check'&&v.change.pass){assert.equal(v.operations[v.change.order].status,'matched');assert.ok(!v.replacements.some(([index])=>index===x.index));}
      if(v.change?.kind==='accept'){assert.equal(v.operations[v.change.order].status,'accepted');assert.ok(v.replacements.some(([index,pair])=>index===x.index&&pair[0]===x.source&&pair[1]===x.target));assert.equal(v.preview,'');}
      if(v.change?.kind==='append'){const chunk=v.chunks.at(-1);assert.equal(v.cursor,previous.cursor);assert.equal(chunk.start,x.i);assert.equal(chunk.text,x.answer.at(-1));assert.equal(v.chunks.length,previous.chunks.length+1);assert.equal(x.answer.length,previous.locals.answer.length+1);}
      if(v.change?.kind==='advance'){assert.deepEqual(v.parts,previous.parts);assert.equal(v.cursor,previous.cursor+previous.segment.source.length);assert.equal(v.change.to,x.i);}
      if(v.source.text==='while i < len(s):'&&v.branch){assert.equal(v.segment,null);assert.equal(v.activeOperation,null);assert.deepEqual(v.activeRange,[v.cursor]);}
      previous=v;
    }
  }
});
test('unsorted indices, changing output lengths, adjacent replacements, mismatches and sources past the end match an independent reverse oracle',()=>{
  const cases=[['abcdxyz',[4,0],['xyz','ab'],['q','long']],['abcdef',[0,2,4],['ab','cd','ef'],['x','y','z']],['abc',[0,2],['z','cde'],['x','tail']],['a',[0],['a'],['z']],['aaaa',[2,0],['aa','aa'],['longer','x']]];
  for(let trial=0;trial<75;trial++){const n=1+rand(18),s=Array.from({length:n},()=>String.fromCharCode(97+rand(3))).join(''),ops=[];for(let i=0;i<n;){const length=1+rand(Math.min(3,n-i));ops.push({index:i,source:rand(3)===0?'z'+s.slice(i+1,i+length):s.slice(i,i+length),target:'x'.repeat(1+rand(5))});i+=length;}for(let i=ops.length-1;i>0;i--){const j=rand(i+1);[ops[i],ops[j]]=[ops[j],ops[i]];}cases.push([s,ops.map(o=>o.index),ops.map(o=>o.source),ops.map(o=>o.target)]);}
  for(const[s,indices,sources,targets]of cases){const r=run(s,{indices,sources,targets}),last=view(r.steps.at(-1));assert.equal(r.answer,oracle(s,indices,sources,targets));assert.equal(last.cursor,s.length);let cursor=0;for(const part of last.chunks){assert.equal(part.start,cursor);assert.equal(part.source,s.slice(part.start,part.end));if(part.kind==='copy')assert.equal(part.text,part.source);else assert.equal(part.text,targets[part.order]);cursor=part.end;}assert.equal(cursor,s.length);assert.equal(last.chunks.map(c=>c.text).join(''),r.answer);}
});
test('all source lines, locals, branches, frames and return values match CPython',()=>{
  const cases=[['abcd',{indices:[0,2],sources:['a','cd'],targets:['eee','ffff']}],['abcd',{indices:[0,2],sources:['ab','ec'],targets:['eee','ffff']}],['abcdxyz',{indices:[4,0],sources:['xyz','ab'],targets:['q','long']}],['abc',{indices:[2],sources:['cde'],targets:['x']}]];
  const items=cases.map(([s,params])=>({code:p.code.join('\n'),method:'findReplaceString',args:p.liveArgs(s,params)}));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(...cases[i]);assert.equal(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const v=view(r.steps[j]);assert.deepEqual(r.steps[j].codeLines,[e.line]);for(const key of ['locals','outer','frames','scope','branch','returned','returning'])assert.deepEqual(v[key],e[key],`${i}/${j}/${key}`);for(const watch of r.steps[j].vars)assert.deepEqual(watch.rawValue,e.locals[watch.name]);});});
});
test('120 input characters, 30 replacements and 50-character words keep a complete replay and full output',()=>{
  const s='a'.repeat(120),indices=Array.from({length:30},(_,i)=>i),sources=Array(30).fill('a'),targets=Array(30).fill('b'.repeat(50)),r=run(s,{indices,sources,targets}),last=view(r.steps.at(-1));
  assert.equal(r.answer,'b'.repeat(1500)+'a'.repeat(90));assert.equal(last.trace.truncated,false);assert.equal(last.cursor,120);assert.equal(last.chunks.length,120);assert.ok(r.steps.length>400);for(const step of r.steps){const v=view(step);assert.equal(v.preview,(v.parts??[]).join(''));assert.equal(v.preview,v.chunks.map(c=>c.text).join(''));}
  const renderer=ui();for(const i of [0,Math.floor(r.steps.length/2),r.steps.length-1])assert.doesNotMatch(renderer.render(r.steps[i]),/undefined|NaN|Infinity|object Object/);
});
test('every preset renders all native frames in VI/EN without mutation and supports deterministic rewind',()=>{
  const cases=vm.runInContext('FR833_CASES',ui().ctx);for(const c of cases){const r=run(c[0],{indices:Array.from(c[1]),sources:Array.from(c[2]),targets:Array.from(c[3])}),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));if(view(s).change?.kind==='append')assert.ok(html.includes('i chưa tăng')||html.includes('i has not advanced'));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);}
});
test('source/target input validation rejects sparse arrays, empty CSV tokens, excessive words and invalid live overlaps',()=>{
  for(const key of ['indices','sources','targets']){const params={indices:[0],sources:['a'],targets:['b']};for(const value of [Array(1),null,[true]])assert.throws(()=>run('abc',{...params,[key]:value}));}
  for(const input of [null,[],['abc'],{},true,123,'a'.repeat(121)])assert.throws(()=>run(input,{indices:[0],sources:['a'],targets:['b']}));
  assert.throws(()=>run('abc',{indices:'1,,2',sources:'b,a,c',targets:'x,y,z'}));for(const key of ['sources','targets'])assert.throws(()=>run('abc',{indices:[0],sources:['a'],targets:['b'],[key]:['a'.repeat(51)]}));
  assert.throws(()=>p.liveArgs('abc',{indices:[0,1],sources:['ab','bc'],targets:['x','y']}),/chồng lấn/);assert.throws(()=>run('abc',null));
  const params={indices:[0,2],sources:['a','cd'],targets:['x','y']},saved=JSON.stringify(params);run('abcd',params);assert.equal(JSON.stringify(params),saved);
});
test('line, source check, append, advance and result navigation only select actual native events',()=>{
  const r=run(),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});for(const kind of ['line','check','append','advance','result']){renderer.ctx.stepIndex=0;const target=renderer.ctx.fr833Next(kind);assert.ok(target>0);renderer.ctx.fr833Go(target);assert.equal(renderer.ctx.stepIndex,target);}renderer.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','check','append','advance','result'])assert.equal(renderer.ctx.fr833Next(kind),-1);
});
test('833 renderer/styles remain lazy and load the shared light/dark theme tokens',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/renderer-find-replace-string-833|find-replace-string-833\.css/);
  assert.match(html.split('\n').find(line=>line.includes('tree-replay-pictures.css')),/data-problem-ids="[^"]*833/);assert.match(html,/find-replace-string-833\.css\?v=native-v2/);assert.match(html,/renderer-find-replace-string-833\.js\?v=native-v2/);
});
