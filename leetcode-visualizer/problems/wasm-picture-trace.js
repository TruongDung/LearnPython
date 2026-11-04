'use strict';
const {Worker}=require('node:worker_threads'),{inflateSync,deflateSync}=require('node:zlib');
let worker;const cache=new Map();
function runTrace(payload){
 const key=JSON.stringify(payload);
 if(cache.has(key)){const packed=cache.get(key);cache.delete(key);cache.set(key,packed);return JSON.parse(inflateSync(packed));}
 const shared=new SharedArrayBuffer(16+16*1024*1024),control=new Int32Array(shared,0,4);
 if(!worker){
  // Serverless preload hooks belong to the HTTP process, not the Python worker.
  const created=new Worker(require.resolve('./picture-trace-worker'),{execArgv:[],workerData:{payload,shared}});
  worker=created;created.unref();created.on('error',()=>{if(worker===created)worker=null;});
 }else worker.postMessage({payload,shared});
 if(Atomics.wait(control,0,0,60000)==='timed-out'){worker.terminate();worker=null;throw new Error('Python trace timed out. Use a smaller example.');}
 const bytes=Buffer.from(shared,16,Atomics.load(control,1));
 if(Atomics.load(control,0)!==1)throw new Error(bytes.toString());
 const decoded=inflateSync(bytes),result=JSON.parse(decoded);cache.set(key,deflateSync(decoded));while(cache.size>12)cache.delete(cache.keys().next().value);
 return result;
}
module.exports={runTrace};
