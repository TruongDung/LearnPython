'use strict';
const {Worker}=require('node:worker_threads'),{inflateSync,deflateSync}=require('node:zlib');
const fs=require('node:fs'),path=require('node:path');
let worker,nativeWorker,javascriptWorker;const cache=new Map();
function nativeRuntimeAvailable(){
 if(process.env.VERCEL==='1')return false;
 if(process.env.LEETCODE_PYTHON_NATIVE)return true;
 return ['Scripts/python.exe','bin/python'].some(file=>fs.existsSync(path.join(__dirname,'../.viz-python',file)));
}
function runTrace(payload){
 const key=JSON.stringify(payload);
 if(cache.has(key)){const packed=cache.get(key);cache.delete(key);cache.set(key,packed);return JSON.parse(inflateSync(packed));}
 const shared=new SharedArrayBuffer(16+16*1024*1024),control=new Int32Array(shared,0,4);
 const engine=payload.engine==='native'&&!nativeRuntimeAvailable()?'wasm':payload.engine;
 const requestPayload=payload.engine==='native'&&engine==='wasm'?{...payload,loadBundledPackages:true}:payload;
 if(engine==='javascript'){
  if(!javascriptWorker){const created=new Worker(require.resolve('./javascript-picture-worker'),{execArgv:[],workerData:{payload,shared}});javascriptWorker=created;created.unref();created.on('error',()=>{if(javascriptWorker===created)javascriptWorker=null;});}else javascriptWorker.postMessage({payload,shared});
 }else if(engine==='native'){
  if(!nativeWorker){const created=new Worker(require.resolve('./picture-native-worker'),{execArgv:[],workerData:{payload,shared}});nativeWorker=created;created.unref();created.on('error',()=>{if(nativeWorker===created)nativeWorker=null;});}else nativeWorker.postMessage({payload,shared});
 }else if(!worker){
  // Serverless preload hooks belong to the HTTP process, not the Python worker.
  const created=new Worker(require.resolve('./picture-trace-worker'),{execArgv:[],workerData:{payload:requestPayload,shared}});
  worker=created;created.unref();created.on('error',()=>{if(worker===created)worker=null;});
 }else worker.postMessage({payload:requestPayload,shared});
 if(Atomics.wait(control,0,0,60000)==='timed-out'){if(engine==='javascript'){javascriptWorker?.terminate();javascriptWorker=null;}else if(engine==='native'){nativeWorker?.terminate();nativeWorker=null;}else{worker?.terminate();worker=null;}throw new Error('Trace timed out. Use a smaller example.');}
 const bytes=Buffer.from(shared,16,Atomics.load(control,1));
 if(Atomics.load(control,0)!==1)throw new Error(bytes.toString());
 const decoded=inflateSync(bytes),result=JSON.parse(decoded);cache.set(key,deflateSync(decoded));while(cache.size>12)cache.delete(cache.keys().next().value);
 return result;
}
module.exports={runTrace};
