'use strict';
const {parentPort,workerData}=require('node:worker_threads'),{spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const python=process.env.LEETCODE_PYTHON_NATIVE||[path.join(root,'.viz-python','Scripts','python.exe'),path.join(root,'.viz-python','bin','python')].find(p=>fs.existsSync(p));
let child,buffer='',active=null,stderr='';
function finish(error,bytes){if(!active)return;const shared=active.shared,control=new Int32Array(shared,0,4);const body=error?Buffer.from(error):bytes;if(body.length>shared.byteLength-16){finish('Trace exceeds the visualization buffer; use a smaller example.');return;}Buffer.from(shared,16,body.length).set(body);Atomics.store(control,1,body.length);Atomics.store(control,0,error?2:1);Atomics.notify(control,0);active=null;}
if(python){child=spawn(python,['-X','utf8','-u',path.join(__dirname,'picture-native-worker.py')],{windowsHide:true,stdio:['pipe','pipe','pipe']});child.stdout.setEncoding('utf8');child.stdout.on('data',chunk=>{buffer+=chunk;let end;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);try{const result=JSON.parse(line);finish(result.error,result.data?Buffer.from(result.data,'base64'):undefined);}catch(e){finish('Invalid native trace: '+e.message);}}});child.stderr.on('data',b=>{stderr=(stderr+b).slice(-2000);});child.on('error',e=>finish(e.message));child.on('exit',code=>finish('Native Python exited '+code+': '+stderr));}
function run(request){active=request;if(!child){finish('Native lesson runtime is missing. Run npm run setup:visualizations.');return;}child.stdin.write(JSON.stringify(request.payload)+'\n');}
parentPort.on('message',run);process.on('exit',()=>child?.kill());run(workerData);
