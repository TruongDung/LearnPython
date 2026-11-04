'use strict';
const {runTrace}=require('./wasm-picture-trace'),methods=require('./task-manager-3408-methods');
const bi=(vi,en)=>({vi,en});
const defaultConfig={tasks:[[1,101,10],[2,102,20],[3,103,15]],ops:[['add',4,104,5],['edit',102,8],['execTop'],['rmv',101],['add',5,105,15],['execTop']]};
function parse(input){let config=input;if(typeof input==='string'){try{config=JSON.parse(input);}catch(_){config=null;}}
 const valid=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max;
 if(!config||!Array.isArray(config.tasks)||!Array.isArray(config.ops)||config.tasks.length>10||config.ops.length>12||config.tasks.some(row=>!Array.isArray(row)||row.length!==3||!valid(row[0],1e5)||!valid(row[1],1e5)||!valid(row[2],1e9)))throw new RangeError('3408: JSON {tasks:[[userId,taskId,priority],...],ops:[["add",u,t,p],["edit",t,p],["rmv",t],["execTop"]]} · up to 10 initial tasks and 12 operations.');
 const ids=new Set();for(const[,id]of config.tasks){if(ids.has(id))throw new RangeError('3408: taskId must be unique.');ids.add(id);}
 const active=new Map(config.tasks.map(([u,id,p])=>[id,[u,p]]));
 for(const op of config.ops){if(!Array.isArray(op))throw new RangeError('3408: invalid operation.');const[action,...args]=op;
 if(action==='add'&&args.length===3&&valid(args[0],1e5)&&valid(args[1],1e5)&&valid(args[2],1e9)&&!active.has(args[1]))active.set(args[1],[args[0],args[2]]);
 else if(action==='edit'&&args.length===2&&active.has(args[0])&&valid(args[1],1e9))active.get(args[0])[1]=args[1];
 else if(action==='rmv'&&args.length===1&&active.has(args[0]))active.delete(args[0]);
 else if(action==='execTop'&&args.length===0){const top=[...active].sort((a,b)=>b[1][1]-a[1][1]||b[0]-a[0])[0];if(top)active.delete(top[0]);}
 else throw new RangeError('3408: invalid operation, duplicate add, or missing taskId.');
 }
 return JSON.parse(JSON.stringify(config));
}
function pairs(dict){return dict?.__pairs__??[];}
function build(input,params={},method=1){const config=parse(input),definition=methods[method-1],trace=runTrace({code:definition.code.join('\n'),method:'run',args:[config],stateClasses:['TaskManager']});let state={},opIndex=-1;
 const steps=trace.events.map((record,index)=>{const root=record.outer,local=record.locals,source=definition.code[record.line-1].trim(),final=index===trace.events.length-1;
  if(local.self)state=local.self;
  if(source==='for op in config["ops"]:'&&record.branch)opIndex++;
  const tasks=pairs(state.tasks).map(([taskId,[userId,priority]])=>({taskId,userId,priority})),byId=new Map(tasks.map(task=>[task.taskId,task])),versions=new Map(pairs(state.versions));
  const heap=(state.heap??[]).map(entry=>{if(method===5){const task=byId.get(entry);return{taskId:entry,priority:task?.priority??null,userId:task?.userId??null,key:entry,stale:false};}const priority=-entry[0]||0,taskId=-entry[1]||0,task=byId.get(taskId);return{taskId,priority,userId:task?.userId??null,key:[...entry],version:entry[2]??null,stale:!task||(method===2?entry[2]!==versions.get(taskId):priority!==task.priority)};});
  const view={id:3408,method,line:record.line,source,scope:record.scope,frames:record.frames.map(f=>f.name),branch:record.branch,config,opIndex,tasks,heap,order:(state.order??[]).map(e=>[...e]),positions:pairs(state.pos).map(e=>[...e]),versions:[...versions],candidate:record.scope==='execTop'?local.best??local.taskId??null:null,answer:root.answer?[...root.answer]:[],result:record.returning&&record.scope==='execTop'?record.returned:null,change:[state,root.answer??null],final};
  const context={...root,...local};return{arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:['taskId','userId','priority','newPriority','best','neg_priority','version','index','parent','left','right','answer'].map(name=>({name,value:context[name]??'—'})),taskManager3408View:view};
 });return{original:config,answer:trace.answer,steps};}
const problem={id:3408,difficulty:'medium',slug:'design-task-manager',category:{key:'design',vi:'Thiết kế',en:'Design'},tags:[{key:'heap',vi:'Heap',en:'Heap'}],title:bi('Design Task Manager','Design Task Manager'),titleVi:bi('Ưu tiên lớn nhất → taskId lớn nhất','Highest priority → highest taskId'),statement:bi('add, edit, rmv và execTop. execTop xóa task có (priority, taskId) lớn nhất và trả userId; rỗng trả -1.','Support add, edit, rmv and execTop. Execute and remove the maximum (priority, taskId), returning its userId; return -1 if empty.'),defaultInput:JSON.stringify(defaultConfig),inputKind:'string',inputLabel:bi('JSON · tasks và ops','JSON · tasks and ops'),debugMode:'line-by-line',extraParams:[{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:methods.map((m,i)=>({value:i+1,label:m.label}))}],approach:[bi('So sánh priority trước, taskId sau. Trả userId của task đã xóa.','Compare priority first, taskId second. Return the removed task’s userId.')],liveArgs:input=>[parse(input)]};
methods.forEach((m,i)=>{const s=i?i+1:'';problem[`code${s}`]=m.code;problem[`code${s}Label`]=m.label;problem[`builder${s}`]=(input,params)=>build(input,params,i+1);problem[`complexity${s}`]={time:m.time,space:m.space,note:bi('M: task hiện có · H: tổng bản heap chưa dọn · D: ID từng xuất hiện. Lazy heap có thể dọn nhiều bản cũ trong một execTop.','M: active tasks · H: heap entries not yet cleaned · D: IDs ever added. A lazy execTop can discard many stale entries.')};});
module.exports={3408:problem};
