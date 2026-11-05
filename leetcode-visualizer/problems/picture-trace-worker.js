'use strict';
const {parentPort,workerData}=require('node:worker_threads'),{readFileSync}=require('node:fs'),{deflateSync}=require('node:zlib'),path=require('node:path');
let ready,arrowReady=false,safeReady=false,networkReady=false,probabilityReady=false,subgraphReady=false,sortedReady=false;
function getRuntime(){
 if(!ready)ready=Promise.resolve().then(()=>require('pyodide').loadPyodide({indexURL:path.dirname(require.resolve('pyodide/package.json'))+path.sep})).then(runtime=>{runtime.runPython(readFileSync(require.resolve('./picture-trace.py'),'utf8'));return runtime;});
 return ready;
}
async function execute({payload,shared}){
 const control=new Int32Array(shared,0,4),bytes=new Uint8Array(shared,16);
 try{
  // Keep boot failures inside the shared-memory error channel as well.
  const runtime=await getRuntime();
  if(payload.packages?.includes('sortedcontainers')&&!sortedReady){
   const wheel='sortedcontainers-2.4.0-py2.py3-none-any.whl';
   runtime.FS.writeFile('/tmp/'+wheel,readFileSync(path.join(__dirname,'../public/vendor',wheel)));
   runtime.runPython("import sys\nsys.path.insert(0, '/tmp/sortedcontainers-2.4.0-py2.py3-none-any.whl')");
   sortedReady=true;
  }
  const gridProfile=payload.profile==='arrow1368'||payload.profile==='obstacle2290';
  if(gridProfile&&!arrowReady){runtime.runPython(readFileSync(require.resolve('./arrow-grid-trace.py'),'utf8'));arrowReady=true;}
  if(payload.profile==='safe3286'&&!safeReady){runtime.runPython(readFileSync(require.resolve('./safe-walk-trace.py'),'utf8'));safeReady=true;}
  if(payload.profile==='network743'&&!networkReady){runtime.runPython(readFileSync(require.resolve('./network-delay-trace.py'),'utf8'));networkReady=true;}
  if(payload.profile==='probability1514'&&!probabilityReady){runtime.runPython(readFileSync(require.resolve('./maximum-probability-trace.py'),'utf8'));probabilityReady=true;}
  if(payload.profile==='subgraph2203'&&!subgraphReady){runtime.runPython(readFileSync(require.resolve('./minimum-subgraph-trace.py'),'utf8'));subgraphReady=true;}
  runtime.globals.set('__picture_payload',JSON.stringify(payload));
  let result;
  const entrypoint=payload.profile==='subgraph2203'?'minimum_subgraph_trace':payload.profile==='probability1514'?'maximum_probability_trace':payload.profile==='network743'?'network_delay_trace':payload.profile==='safe3286'?'safe_walk_trace':gridProfile?'arrow_grid_trace':'picture_trace';
  try{result=runtime.runPython(`${entrypoint}(json.loads(__picture_payload))`);}finally{runtime.globals.delete('__picture_payload');}
  const packed=deflateSync(Buffer.from(result));
  if(packed.length>bytes.length)throw new Error('The recorded trace exceeds the transfer buffer.');
  bytes.set(packed);Atomics.store(control,1,packed.length);Atomics.store(control,0,1);
 }catch(error){const message=Buffer.from(String(error?.stack??error));const size=Math.min(message.length,bytes.length);bytes.set(message.subarray(0,size));Atomics.store(control,1,size);Atomics.store(control,0,2);}
 Atomics.notify(control,0);
}
parentPort.on('message',execute);
if(workerData)execute(workerData);
