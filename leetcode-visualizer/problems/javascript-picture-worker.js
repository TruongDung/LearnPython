'use strict';
const {parentPort,workerData}=require('node:worker_threads'),vm=require('node:vm'),zlib=require('node:zlib');
const parser=require('@babel/parser'),traverse=require('@babel/traverse').default,generate=require('@babel/generator').default,t=require('@babel/types');
function instrument(code){
 const ast=parser.parse(code,{sourceType:'script'});
 function locals(path){const names=Object.keys(path.scope.getAllBindings()).filter(n=>!n.startsWith('__'));const props=names.map(name=>t.objectProperty(t.stringLiteral(name),t.callExpression(t.identifier('__read'),[t.arrowFunctionExpression([],t.identifier(name))])));props.push(t.objectProperty(t.stringLiteral('self'),t.callExpression(t.identifier('__read'),[t.arrowFunctionExpression([],t.thisExpression())])));return t.arrowFunctionExpression([],t.objectExpression(props));}
 function call(name,path,extra=[]){return t.callExpression(t.identifier(name),[t.numericLiteral(path.node.loc?.start.line||1),locals(path),...extra]);}
 traverse(ast,{ArrowFunctionExpression(path){if(!t.isBlockStatement(path.node.body)){const value=path.node.body;path.node.body=t.blockStatement([t.returnStatement(value)]);path.node.body.body[0].loc=value.loc;}}});
 traverse(ast,{
  ReturnStatement:{exit(path){if(path.node._guided)return;const value=path.node.argument||t.identifier('undefined');path.node.argument=call('__ret',path,[value]);path.node._guided=true;path.skip();}},
  IfStatement:{exit(path){path.node.test=call('__test',path,[path.node.test]);}},
  'VariableDeclaration|ExpressionStatement':{exit(path){if(path.node._guided||path.parentPath.isForStatement()||path.parentPath.isForInStatement()||path.parentPath.isForOfStatement()||path.parentPath.isExportNamedDeclaration())return;const statement=t.expressionStatement(call('__snap',path));statement._guided=true;if(path.inList)path.insertAfter(statement);else if(path.key==='body')path.replaceWith(t.blockStatement([path.node,statement]));}}
 });
 return generate(ast).code;
}
async function trace(payload){
 let now=0,nextTimer=1;const timers=new Map(),events=[],max=payload.maxEvents||12000;let active=true;
 function encode(value,seen=new WeakSet(),depth=0){if(value===undefined||value===null)return null;if(typeof value==='function')return '[function '+(value.name||'anonymous')+']';if(typeof value==='bigint')return value.toString();if(typeof value==='number')return Number.isFinite(value)?value:String(value);if(typeof value!=='object')return value;if(depth>10)return '…';if(seen.has(value))return '↩';seen.add(value);if(value instanceof Error)return {error:value.message};if(Array.isArray(value))return value.slice(0,120).map(v=>encode(v,seen,depth+1));const kind=Object.prototype.toString.call(value);if(kind==='[object Map]')return {__pairs__:[...value].map(([a,b])=>[encode(a,seen,depth+1),encode(b,seen,depth+1)])};if(kind==='[object Set]')return [...value].map(v=>encode(v,seen,depth+1));if(kind==='[object Date]')return value.toISOString();const out={};for(const key of Object.keys(value).slice(0,120)){try{out[key]=encode(value[key],seen,depth+1);}catch{out[key]='[unreadable]';}}return out;}
 function snap(line,get,extra={}){if(!active)return;if(events.length>=max)throw Error('Example exceeds the step budget; use a smaller input.');const values=get();const locals={};for(const[k,v]of Object.entries(values)){if(k==='self'){if(v&&v!==context&&Object.keys(v).length<80)for(const[name,value]of Object.entries(v))locals[name]=encode(value);continue;}if(typeof v!=='function'&&v!==undefined)locals[k]=encode(v);}locals.clock=now;events.push({line,scope:'JavaScript',locals,outer:{},frames:[{name:'JavaScript',locals}],objects:[],branch:null,returning:false,returned:null,...extra});}
 const RealDate=Date;class ClockDate extends RealDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const schedule=(fn,delay=0,repeat=0,args=[])=>{const id=nextTimer++;timers.set(id,{id,at:now+Math.max(0,Number(delay)||0),fn,args,repeat});return id;};
 const context=vm.createContext({__args:payload.args,__read:fn=>{try{return fn();}catch{return undefined;}},__snap:snap,__ret:(line,get,value)=>{snap(line,get,{returning:true,returned:encode(value)});return value;},__test:(line,get,value)=>{snap(line,get,{branch:!!value});return value;},setTimeout:(fn,delay,...args)=>schedule(fn,delay,0,args),clearTimeout:id=>timers.delete(id),setInterval:(fn,delay,...args)=>schedule(fn,delay,Math.max(1,Number(delay)||1),args),clearInterval:id=>timers.delete(id),Date:ClockDate,console:{log(){}},structuredClone, __now:()=>now});
 context.globalThis=context;
 vm.runInContext(instrument(payload.code),context,{timeout:1000});
 let settled=false,answer,failure;
 const promise=vm.runInContext('(async()=>{ const args=__args; '+payload.harness+' })()',context,{timeout:1000});
 Promise.resolve(promise).then(v=>{answer=v;settled=true;},e=>{failure=e;settled=true;});
 for(let ticks=0;ticks<10000;ticks++){
  await new Promise(resolve=>setImmediate(resolve));
  if(settled)break;
  if(!timers.size)throw Error('The example has an unresolved promise without a scheduled callback.');
  const timer=[...timers.values()].sort((a,b)=>a.at-b.at||a.id-b.id)[0];now=timer.at;timers.delete(timer.id);if(timer.repeat)timers.set(timer.id,{...timer,at:now+timer.repeat});
  timer.fn(...timer.args);
 }
 if(!settled)throw Error('Virtual timer budget exceeded.');if(failure)throw failure;
 active=false;const result=encode(answer);events.push({line:payload.code.split('\n').length,scope:'result',locals:{clock:now},outer:{},frames:[{name:'result',locals:{clock:now}}],objects:[],branch:null,returning:true,returned:result});
 return {answer:result,events,trace:{truncated:false,engine:'javascript',virtualTime:now}};
}
async function run(request){const control=new Int32Array(request.shared,0,4);try{const result=await trace(request.payload),bytes=zlib.deflateSync(Buffer.from(JSON.stringify(result)));if(bytes.length>request.shared.byteLength-16)throw Error('Trace exceeds the visualization buffer.');Buffer.from(request.shared,16,bytes.length).set(bytes);Atomics.store(control,1,bytes.length);Atomics.store(control,0,1);}catch(e){const bytes=Buffer.from(String(e.stack||e));Buffer.from(request.shared,16,bytes.length).set(bytes);Atomics.store(control,1,bytes.length);Atomics.store(control,0,2);}Atomics.notify(control,0);}
parentPort.on('message',run);run(workerData);
