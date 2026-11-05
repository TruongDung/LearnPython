'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const runner=require.resolve('../problems/wasm-picture-trace'),workerPath=require.resolve('../problems/picture-trace-worker');
test('Python trace starts under a server preload hook and reuses the worker for different requests',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'picture-worker-')),preload=path.join(dir,'preload.cjs');
 try{fs.writeFileSync(preload,"if(!require('node:worker_threads').isMainThread)throw new Error('HTTP bootstrap must not run in the Python worker');");
 const source=`const {runTrace}=require(${JSON.stringify(runner)});const code='class Solution:\\n    def add(self, a, b):\\n        answer = a + b\\n        return answer';const a=runTrace({code,method:'add',args:[2,3]});const b=runTrace({code,method:'add',args:[8,13]});console.log(JSON.stringify([a,b]));`;
 const result=spawnSync(process.execPath,['--require',preload,'-e',source],{encoding:'utf8',timeout:15000});assert.equal(result.status,0,result.stderr||result.error?.message);const runs=JSON.parse(result.stdout);assert.deepEqual(runs.map(r=>r.answer),[5,21]);assert.deepEqual(runs[0].events.map(e=>e.line),[3,4]);
 }finally{const resolved=path.resolve(dir);assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));assert.ok(path.basename(resolved).startsWith('picture-worker-'));fs.rmSync(resolved,{recursive:true,force:true});}
});
test('a missing Python runtime is reported through shared memory instead of silently timing out',()=>{
 const source=`const Module=require('node:module'),original=Module._load;Module._load=function(id,...args){if(id==='pyodide')throw new Error('test runtime unavailable');return original.call(this,id,...args);};require(${JSON.stringify(workerPath)});`;
 const {Worker}=require('node:worker_threads'),shared=new SharedArrayBuffer(4096),control=new Int32Array(shared,0,4);const worker=new Worker(source,{eval:true,execArgv:[],workerData:{payload:{},shared}});worker.unref();
 try{assert.notEqual(Atomics.wait(control,0,0,5000),'timed-out');assert.equal(Atomics.load(control,0),2);assert.match(Buffer.from(shared,16,Atomics.load(control,1)).toString(),/test runtime unavailable/);}finally{worker.terminate();}
});
test('Vercel packaging stays within its schema limit and covers every trace helper, wheel and WebAssembly asset',()=>{
 const config=JSON.parse(fs.readFileSync(require.resolve('../vercel.json'),'utf8')),include=config.functions['server.js'].includeFiles;
 assert.equal(typeof include,'string');assert.ok(include.length<=256,`includeFiles is ${include.length} characters (maximum 256)`);
 const root=path.dirname(require.resolve('../vercel.json'));
 const assets=['problems/picture-trace-worker.js',
  ...fs.readdirSync(path.join(root,'problems')).filter(name=>name.endsWith('-trace.py')).map(name=>'problems/'+name),
  ...fs.readdirSync(path.join(root,'public/vendor')).filter(name=>name.endsWith('.whl')).map(name=>'public/vendor/'+name),
  'node_modules/pyodide/package.json','node_modules/pyodide/pyodide.asm.wasm','node_modules/pyodide/python_stdlib.zip'];
 for(const asset of assets){assert.ok(fs.existsSync(path.join(root,asset)),asset);assert.ok(path.posix.matchesGlob(asset,include),`Missing from function bundle: ${asset}`);}
 for(const asset of['tests/picture-trace-runtime.test.js','public/index.html','node_modules/express/package.json'])assert.equal(path.posix.matchesGlob(asset,include),false,asset);
});
