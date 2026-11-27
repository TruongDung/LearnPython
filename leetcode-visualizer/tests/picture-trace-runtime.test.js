'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const runner=require.resolve('../problems/wasm-picture-trace'),workerPath=require.resolve('../problems/picture-trace-worker');

test('native lessons fall back to offline WebAssembly packages on Vercel and machines without Python',()=>{
 for(const vercel of['1','']){
  const source=`
   const assert=require('node:assert/strict'),fs=require('node:fs'),threads=require('node:worker_threads');
   const exists=fs.existsSync;fs.existsSync=function(file){return String(file).includes('.viz-python')?false:exists.call(this,file);};
   const Worker=threads.Worker;
   threads.Worker=class extends Worker{constructor(file,options){
    assert.ok(!String(file).includes('picture-native-worker'));
    const bootstrap='globalThis.fetch=()=>{throw new Error("Network disabled during package loading")};'+
     'for(const name of ["node:http","node:https"]){const http=require(name);http.get=http.request=()=>{throw new Error("Network disabled during package loading")};}'+
     'require('+JSON.stringify(file)+');';
    super(bootstrap,{...options,eval:true});
   }};
   const {runTrace}=require(${JSON.stringify(runner)});
   const payload={engine:'native',method:'total',prelude:'import numpy as np\\nimport pandas as pd\\nimport sqlite3\\nfrom sortedcontainers import SortedList',code:'class Solution:\\n    def total(self, values):\\n        ordered = SortedList(values)\\n        table = pd.DataFrame({"x": list(ordered)})\\n        total = int(np.asarray(table["x"]).sum())\\n        connection = sqlite3.connect(":memory:")\\n        doubled = connection.execute("select ? * 2", (total,)).fetchone()[0]\\n        connection.close()\\n        return [total, doubled]'};
   const first=runTrace({...payload,args:[[3,1,2]]}),second=runTrace({...payload,args:[[4,5]]});
   assert.deepEqual(first.answer,[6,12]);assert.deepEqual(second.answer,[9,18]);
   assert.equal(first.trace.truncated,false);assert.equal(first.events.at(-1).returning,true);
   console.log('Offline fallback passed');
  `;
  const result=spawnSync(process.execPath,['-e',source],{encoding:'utf8',timeout:30000,windowsHide:true,env:{...process.env,VERCEL:vercel,LEETCODE_PYTHON_NATIVE:vercel?'unavailable-python':''}});
  assert.equal(result.status,0,result.stderr||result.error?.message);assert.match(result.stdout,/Offline fallback passed/);
 }
});

test('sparse local snapshots preserve every value and implicit zero while dense snapshots stay unchanged',()=>{
 const {runTrace}=require(runner);
 const code='class Solution:\n    def update(self):\n        table = [0] * 6\n        table[2] = 4\n        table[2] = 0\n        table[5] = 9\n        return table';
 const dense=runTrace({code,method:'update',args:[]});
 const sparse=runTrace({code,method:'update',args:[],summarizeLocals:{table:'nonzero'}});
 assert.deepEqual(sparse.answer,dense.answer);assert.deepEqual(sparse.events.map(e=>e.line),dense.events.map(e=>e.line));
 sparse.events.forEach((event,i)=>{
  const snapshot=event.locals.table;assert.equal(snapshot.__sparse__,true);assert.equal(snapshot.length,6);
  const restored=Array(snapshot.length).fill(0);for(const[index,value]of snapshot.entries){assert.notEqual(value,0);restored[index]=value;}
  assert.deepEqual(restored,dense.events[i].locals.table);
 });
 assert.deepEqual(sparse.events[1].locals.table.entries,[[2,4]]);assert.deepEqual(sparse.events[2].locals.table.entries,[]);
});
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
  ...fs.readdirSync(path.join(root,'public/vendor')).filter(name=>/\.(whl|zip)$/.test(name)).map(name=>'public/vendor/'+name),
  'node_modules/pyodide/package.json','node_modules/pyodide/pyodide.asm.wasm','node_modules/pyodide/python_stdlib.zip'];
 for(const asset of assets){assert.ok(fs.existsSync(path.join(root,asset)),asset);assert.ok(path.posix.matchesGlob(asset,include),`Missing from function bundle: ${asset}`);}
 for(const asset of['tests/picture-trace-runtime.test.js','public/index.html','node_modules/express/package.json'])assert.equal(path.posix.matchesGlob(asset,include),false,asset);
});

test('bundled optional packages match the pinned Pyodide dependency graph and checksums',()=>{
 const crypto=require('node:crypto'),root=path.dirname(require.resolve('../vercel.json'));
 const lock=require('pyodide/pyodide-lock.json'),manifest=require('../public/vendor/python-packages.json');
 assert.equal(manifest.pyodideVersion,lock.info.version);
 const names=new Set(manifest.packages.map(p=>p.name));
 for(const name of['sortedcontainers','numpy','pandas','sqlite3'])assert.ok(names.has(name));
 for(const pkg of manifest.packages){
  const expected=lock.packages[pkg.name];assert.equal(pkg.file,expected.file_name);assert.equal(pkg.sha256,expected.sha256);
  for(const dependency of expected.depends)assert.ok(names.has(dependency),dependency);
  const bytes=fs.readFileSync(path.join(root,'public/vendor',pkg.file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),pkg.sha256);
 }
});
