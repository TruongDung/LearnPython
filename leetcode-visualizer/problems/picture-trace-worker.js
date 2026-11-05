'use strict';
const {parentPort,workerData}=require('node:worker_threads'),{readFileSync}=require('node:fs'),{deflateSync}=require('node:zlib'),path=require('node:path');
let ready,arrowReady=false;
function getRuntime(){
 if(!ready)ready=Promise.resolve().then(()=>require('pyodide').loadPyodide({indexURL:path.dirname(require.resolve('pyodide/package.json'))+path.sep})).then(runtime=>{runtime.runPython(readFileSync(require.resolve('./picture-trace.py'),'utf8'));return runtime;});
 return ready;
}
async function execute({payload,shared}){
 const control=new Int32Array(shared,0,4),bytes=new Uint8Array(shared,16);
 try{
  // Keep boot failures inside the shared-memory error channel as well.
  const runtime=await getRuntime();
  const gridProfile=payload.profile==='arrow1368'||payload.profile==='obstacle2290';
  if(gridProfile&&!arrowReady){runtime.runPython(readFileSync(require.resolve('./arrow-grid-trace.py'),'utf8'));arrowReady=true;}
  runtime.globals.set('__picture_payload',JSON.stringify(payload));
  let result;
  try{result=runtime.runPython(gridProfile?'arrow_grid_trace(json.loads(__picture_payload))':'picture_trace(json.loads(__picture_payload))');}finally{runtime.globals.delete('__picture_payload');}
  const packed=deflateSync(Buffer.from(result));
  if(packed.length>bytes.length)throw new Error('The recorded trace exceeds the transfer buffer.');
  bytes.set(packed);Atomics.store(control,1,packed.length);Atomics.store(control,0,1);
 }catch(error){const message=Buffer.from(String(error?.stack??error));const size=Math.min(message.length,bytes.length);bytes.set(message.subarray(0,size));Atomics.store(control,1,size);Atomics.store(control,0,2);}
 Atomics.notify(control,0);
}
parentPort.on('message',execute);
if(workerData)execute(workerData);
