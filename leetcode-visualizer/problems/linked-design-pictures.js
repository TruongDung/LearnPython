'use strict';
const {runTrace}=require('./wasm-picture-trace');
const base=require('./linked-list');
const bi=(vi,en)=>({vi,en}),copy=v=>JSON.parse(JSON.stringify(v));
const LIST_CODE=`class ListNode:
    def __init__(self, val=0):
        self.val = val
        self.prev = None
        self.next = None

class MyLinkedList:
    def __init__(self):
        self.dummy = ListNode()
        self.size = 0

    def get(self, index: int) -> int:
        if index < 0 or index >= self.size:
            return -1
        current = self.dummy.next
        for _ in range(index):
            current = current.next
        return current.val

    def addAtHead(self, val: int) -> None:
        self.addAtIndex(0, val)

    def addAtTail(self, val: int) -> None:
        self.addAtIndex(self.size, val)

    def addAtIndex(self, index: int, val: int) -> None:
        if index < 0 or index > self.size:
            return
        prev = self.dummy
        for _ in range(index):
            prev = prev.next
        node = ListNode(val)
        node.next = prev.next
        node.prev = prev
        if prev.next:
            prev.next.prev = node
        prev.next = node
        self.size += 1

    def deleteAtIndex(self, index: int) -> None:
        if index < 0 or index >= self.size:
            return
        prev = self.dummy
        for _ in range(index):
            prev = prev.next
        removed = prev.next
        prev.next = removed.next
        if removed.next:
            removed.next.prev = prev
        self.size -= 1`;
const CODES={707:LIST_CODE,146:base[146].code.join('\n')};
function parse(id,input,params={}){
  if(!params||typeof params!=='object'||Array.isArray(params))throw new TypeError('Invalid parameters');
  let rows=input;
  try{if(typeof rows==='string'){const s=rows.trim();rows=s.startsWith('[')?JSON.parse(s):s?s.split('|').map(t=>{const words=t.trim().replace(/[(),]/g,' ').split(/\s+/);return [words[0],...words.slice(1).map(Number)];}):[];}}catch{rows=null;}
  if(!Array.isArray(rows)||!rows.length||rows.length>20)throw new RangeError(`#${id}: provide 1–20 operations`);
  const signatures=id===707?{get:1,addAtHead:1,addAtTail:1,addAtIndex:2,deleteAtIndex:1}:{get:1,put:2};
  let inserts=0;
  const operations=Array.from(rows).map((row,i)=>{
    if(!Array.isArray(row)||typeof row[0]!=='string'||!Object.hasOwn(signatures,row[0])||row.length!==signatures[row[0]]+1)throw new TypeError(`#${id}: invalid operation ${i}`);
    const [name,...args]=row;
    if(!args.every((n,j)=>Number.isInteger(n)&&n>=0&&n<=(id===707?1000:name==='put'&&j===1?100000:10000)))throw new RangeError(`#${id}: invalid integer argument in operation ${i}`);
    if(name.startsWith('add')||name==='put')inserts++;
    return {name,args,label:`${name}(${args.join(', ')})`};
  });
  if(inserts>14)throw new RangeError(`#${id}: use at most 14 add/put calls for complete pointer diagrams`);
  const capacity=id===146?(params.capacity===undefined?2:params.capacity):null;
  if(id===146&&(!Number.isInteger(capacity)||capacity<1||capacity>3000))throw new RangeError('#146: capacity must be an integer from 1 to 3000');
  return {operations,className:id===707?'MyLinkedList':'LRUCache',constructorArgs:id===707?[]:[capacity]};
}
function payloadFor(id,input,params){
  const config=parse(id,input,params),code=CODES[id];
  const harness=`\n\nclass Solution:\n    def replay(self, operations, constructor_args):\n        linked = ${config.className}(*constructor_args)\n        results = []\n        for operation_index, (name, arguments) in enumerate(operations):\n            result = getattr(linked, name)(*arguments)\n            results.append(result)\n        return results`;
  return {config,payload:{code:code+harness,method:'replay',args:[config.operations.map(op=>[op.name,op.args]),config.constructorArgs],
    objectClasses:[config.className],stateClasses:[config.className,id===707?'ListNode':'Node'],captureAllocations:[id===707?'ListNode':'Node']}};
}
const ref=value=>value&&typeof value==='object'&&typeof value.id==='string'?value.id:null;
function build(id,input,params){
  const {config,payload}=payloadFor(id,input,params),source=CODES[id].split('\n'),native=runTrace(payload);
  const events=native.events.filter(e=>e.line<=source.length),history=[],outputs=[],writes=[];
  let previous=null,seenInit=false;
  const steps=events.map((e,index)=>{
    const x=e.locals,text=source[e.line-1].trim(),operationIndex=e.outer.operation_index??-1,operation=config.operations[operationIndex]??null;
    const frames=e.frames.filter(f=>f.name!=='replay');
    const state=frames.slice().reverse().map(f=>f.locals.self).find(s=>s&&Object.keys(s).some(k=>['dummy','size','cache','capacity','left','right'].includes(k)))??e.outer.linked??{};
    const nodes=e.objects.map(o=>({id:o.id,type:o.type,fields:o.fields})),byId=new Map(nodes.map(n=>[n.id,n]));
    const start=id===707?ref(state.dummy):ref(state.left),end=id===146?ref(state.right):null;
    const chain=[],visited=new Set();let cycle=null;
    for(let current=start;current!==null;current=ref(byId.get(current)?.fields.next)){
      if(visited.has(current)){cycle=current;break;}visited.add(current);chain.push(current);if(current===end)break;
    }
    const sentinels=[start,end].filter(Boolean),items=chain.filter(n=>!sentinels.includes(n));
    const bindings={};for(const frame of frames)for(const [name,value]of Object.entries(frame.locals))if(ref(value))bindings[name]=ref(value);
    if(e.scope==='__init__'&&(id===707?e.line<6:e.line<8)&&nodes.length)bindings['self (new)']=nodes.at(-1).id;
    let change=null;
    if(previous){for(const node of nodes){const before=previous.nodes.find(n=>n.id===node.id);if(!before){change={kind:'create',node:node.id};continue;}
      for(const field of ['next','prev'])if(Object.hasOwn(node.fields,field)&&Object.hasOwn(before.fields,field)&&ref(node.fields[field])!==ref(before.fields[field])){
        const write={kind:'link',node:node.id,field,before:ref(before.fields[field]),after:ref(node.fields[field]),step:index};writes.push(write);change=write;
      }
    }}else if(nodes.length)change={kind:'create',node:nodes[0].id};
    if(!change&&previous&&state.size!==undefined&&state.size!==previous.state.size)change={kind:'size',before:previous.state.size??null,after:state.size};
    const cache=state.cache?.__pairs__??[],oldCache=previous?.state.cache?.__pairs__??[];
    if(JSON.stringify(cache)!==JSON.stringify(oldCache))change={kind:'map'};
    const expected=operation?.name??'__init__',topReturn=e.returning&&e.scope===expected&&(e.scope!=='__init__'||e.line>(id===707?6:8));
    if(topReturn){
      const row={index:operationIndex,label:operation?.label??`${config.className}(${config.constructorArgs.join(', ')})`,result:e.returned,step:index,list:items.map(n=>id===707?byId.get(n).fields.val:byId.get(n).fields.key)};
      history.push(row);if(operationIndex>=0)outputs.push(e.returned);else seenInit=true;
      if(!change)change={kind:'return',value:e.returned};
    }
    const final=index===events.length-1;
    const view={id,operations:config.operations,operationIndex,operation,constructorArgs:config.constructorArgs,nodes,state,chain,cycle,items,sentinels,bindings,
      cache,capacity:id===146?state.capacity??null:null,size:id===707?state.size??null:null,physicalSize:items.length,
      initialized:seenInit,doubly:true,history:copy(history),outputs:[...outputs],writes:copy(writes),change,
      source:{line:e.line,text,timing:'after'},locals:x,outer:e.outer,frames:e.frames,scope:e.scope,branch:e.branch,
      returned:e.returned,returning:e.returning,objects:e.objects,trace:native.trace,result:final?native.answer:null};
    previous=view;
    return {arr:[],codeBlock:1,codeLines:[e.line],final,title:bi(`L${e.line} · ${text}`,`L${e.line} · ${text}`),note:bi('',''),
      vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),linkedDesignView:view};
  });
  return {original:config.operations.map(op=>[op.name,...op.args]),answer:native.answer,steps};
}
const list={id:707,difficulty:'medium',slug:'design-linked-list',category:{key:'linked-list',vi:'Danh sách liên kết',en:'Linked List'},
  tags:[{key:'design',vi:'Thiết kế',en:'Design'},{key:'doubly-linked-list',vi:'Danh sách liên kết đôi',en:'Doubly Linked List'}],
  title:bi('Design Linked List','Design Linked List'),titleVi:bi('Thiết kế danh sách liên kết','Design a linked list'),
  statement:bi('get, thêm đầu/cuối/theo index, xóa theo index. Index bắt đầu từ 0; get sai index trả −1.','Get, insert at head/tail/index, and delete by index. Indices start at 0; invalid get returns −1.'),
  defaultInput:'[["addAtHead",1],["addAtTail",3],["addAtIndex",1,2],["get",1],["deleteAtIndex",1],["get",1]]',extraParams:[],
  approach:[bi('dummy đứng trước phần tử đầu. Đi tới prev rồi đổi next; size được cập nhật ở dòng riêng.','A dummy precedes the first item. Walk to prev, then change next; update size on its own line.')],
  complexity:{time:'O(n) get / insert / delete by index; O(1) addAtHead',space:'O(n)',note:bi('Thêm cuối đi từ dummy tới cuối danh sách.','Tail insertion walks from the dummy to the end.')},
};
module.exports=Object.fromEntries([707,146].map(id=>[id,{
  ...(id===707?list:base[146]),code:CODES[id].split('\n'),debugMode:'line-by-line',inputKind:'string',
  inputLabel:bi('Thao tác JSON hoặc ngăn bằng | · ≤20 thao tác, ≤14 lần thêm/put','JSON operations or separate by | · ≤20 calls, ≤14 add/put calls'),
  ...(id===146?{extraParams:[{key:'capacity',label:bi('capacity','capacity'),default:2,min:1,max:3000}],approach:[bi('Map tìm node. List hai chiều giữ thứ tự LRU → MRU; từng con trỏ thay đổi đúng dòng Python.','A map locates nodes. A doubly linked list stores LRU → MRU order; replay each actual pointer assignment.')]}:{}),
  visualizationLimits:{maxOperations:20,maxAllocatingCalls:14,completeTrace:true},builder:(input,params)=>build(id,input,params),
  prepareLiveDesign:(input,params)=>{const c=parse(id,input,params);return {className:c.className,constructorArgs:c.constructorArgs,operations:c.operations.map(({name,args})=>({name,args}))};},
  tracePayload:(input,params)=>payloadFor(id,input,params).payload,
}]));
