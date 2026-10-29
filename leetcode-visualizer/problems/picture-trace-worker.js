'use strict';
const {parentPort}=require('node:worker_threads'),{readFileSync}=require('node:fs'),{deflateSync}=require('node:zlib');
const ready=require('pyodide').loadPyodide().then(runtime=>{runtime.runPython(readFileSync(require.resolve('./picture-trace.py'),'utf8'));return runtime;});
parentPort.on('message',async({payload,shared})=>{
 const control=new Int32Array(shared,0,4),bytes=new Uint8Array(shared,16);
 try{
  const runtime=await ready;
  runtime.globals.set('__picture_payload',JSON.stringify(payload));
  let result;
  try{result=runtime.runPython('picture_trace(json.loads(__picture_payload))');}finally{runtime.globals.delete('__picture_payload');}
  const packed=deflateSync(Buffer.from(result));
  if(packed.length>bytes.length)throw new Error('The recorded trace exceeds the transfer buffer.');
  bytes.set(packed);Atomics.store(control,1,packed.length);Atomics.store(control,0,1);
 }catch(error){const message=Buffer.from(String(error?.stack??error));const size=Math.min(message.length,bytes.length);bytes.set(message.subarray(0,size));Atomics.store(control,1,size);Atomics.store(control,0,2);}
 Atomics.notify(control,0);
});
