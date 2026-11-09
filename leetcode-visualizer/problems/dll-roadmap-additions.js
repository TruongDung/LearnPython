'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=v=>JSON.parse(JSON.stringify(v));
const CODES={2296:`class Node:
    def __init__(self, val=''):
        self.val = val
        self.prev = None
        self.next = None

class TextEditor:
    def __init__(self):
        self.head = Node()
        self.cursor = self.head

    def addText(self, text: str) -> None:
        for char in text:
            node = Node(char)
            node.prev = self.cursor
            node.next = self.cursor.next
            if node.next:
                node.next.prev = node
            self.cursor.next = node
            self.cursor = node

    def deleteText(self, k: int) -> int:
        removed = 0
        while k > 0 and self.cursor is not self.head:
            node = self.cursor
            self.cursor = node.prev
            self.cursor.next = node.next
            if node.next:
                node.next.prev = self.cursor
            removed += 1
            k -= 1
        return removed

    def _context(self):
        chars = []
        node = self.cursor
        while node is not self.head and len(chars) < 10:
            chars.append(node.val)
            node = node.prev
        return ''.join(reversed(chars))

    def cursorLeft(self, k: int) -> str:
        while k > 0 and self.cursor is not self.head:
            self.cursor = self.cursor.prev
            k -= 1
        return self._context()

    def cursorRight(self, k: int) -> str:
        while k > 0 and self.cursor.next:
            self.cursor = self.cursor.next
            k -= 1
        return self._context()`,
1206:`import random
random.seed(0)

class Node:
    def __init__(self, val, height):
        self.val = val
        self.forward = [None] * height

class Skiplist:
    def __init__(self):
        self.head = Node(-1, 16)
        self.height = 1

    def search(self, target: int) -> bool:
        node = self.head
        for level in range(self.height - 1, -1, -1):
            while node.forward[level] and node.forward[level].val < target:
                node = node.forward[level]
        node = node.forward[0]
        return node is not None and node.val == target

    def add(self, num: int) -> None:
        update = [self.head] * 16
        node = self.head
        for level in range(self.height - 1, -1, -1):
            while node.forward[level] and node.forward[level].val < num:
                node = node.forward[level]
            update[level] = node
        height = 1
        while height < 16 and random.random() < 0.5:
            height += 1
        self.height = max(self.height, height)
        node = Node(num, height)
        for level in range(height):
            node.forward[level] = update[level].forward[level]
            update[level].forward[level] = node

    def erase(self, num: int) -> bool:
        update = [self.head] * 16
        node = self.head
        for level in range(self.height - 1, -1, -1):
            while node.forward[level] and node.forward[level].val < num:
                node = node.forward[level]
            update[level] = node
        node = node.forward[0]
        if node is None or node.val != num:
            return False
        for level in range(self.height):
            if update[level].forward[level] is node:
                update[level].forward[level] = node.forward[level]
        while self.height > 1 and self.head.forward[self.height - 1] is None:
            self.height -= 1
        return True`,
1823:`class Node:
    def __init__(self, val):
        self.val = val
        self.prev = None
        self.next = None

class Solution:
    def findTheWinner(self, n: int, k: int) -> int:
        nodes = [Node(i + 1) for i in range(n)]
        for i in range(n):
            nodes[i].next = nodes[(i + 1) % n]
            nodes[i].prev = nodes[(i - 1) % n]
        current = nodes[0]
        remaining = n
        while remaining > 1:
            for _ in range(k - 1):
                current = current.next
            removed = current
            removed.prev.next = removed.next
            removed.next.prev = removed.prev
            current = removed.next
            remaining -= 1
        return current.val`};
const CONFIG={2296:['TextEditor','Design a Text Editor','design-a-text-editor','hard'],1206:['Skiplist','Design Skiplist','design-skiplist','hard'],1823:['Solution','Find the Winner of the Circular Game','find-the-winner-of-the-circular-game','medium']};
function parse(id,input,params={}){
  if(!params||typeof params!=='object'||Array.isArray(params))throw new TypeError('Invalid parameters');
  if(id===1823){const raw=Array.isArray(input)&&input.length===1?input[0]:input,n=typeof raw==='string'&&/^\d+$/.test(raw.trim())?Number(raw):raw,k=params.k===undefined?2:params.k;if(!Number.isInteger(n)||n<1||n>12||!Number.isInteger(k)||k<1||k>n)throw new RangeError('#1823: 1 ≤ k ≤ n ≤ 12');return {args:[n,k],operations:[]};}
  let rows=input;try{if(typeof rows==='string')rows=JSON.parse(rows);}catch{rows=null;}
  if(!Array.isArray(rows)||!rows.length||rows.length>20)throw new RangeError(`#${id}: use 1–20 operations as JSON`);
  let allocated=0;
  const operations=Array.from(rows).map((row,i)=>{
    const allowed=id===2296?['addText','deleteText','cursorLeft','cursorRight']:['add','search','erase'];
    if(!Array.isArray(row)||row.length!==2||!allowed.includes(row[0]))throw new TypeError(`#${id}: invalid operation ${i}`);
    const [name,arg]=row;
    if(name==='addText'){if(typeof arg!=='string'||!/^[a-z]{1,24}$/.test(arg))throw new RangeError('addText: 1–24 lowercase characters');allocated+=arg.length;}
    else if(!Number.isInteger(arg)||arg<(id===2296?1:0)||arg>(id===2296?40:20000))throw new RangeError(`#${id}: invalid argument`);
    if(name==='add')allocated++;
    return {name,args:[arg],label:`${name}(${typeof arg==='string'?JSON.stringify(arg):arg})`};
  });
  if(allocated>(id===2296?24:14))throw new RangeError(`#${id}: too many new nodes for a full diagram`);
  return {operations};
}
function tracePayload(id,input,params){const config=parse(id,input,params);if(id===1823)return {config,payload:{code:CODES[id],method:'findTheWinner',args:config.args,captureAllocations:['Node'],stateClasses:['Node']}};
  const code=CODES[id]+`\n\nclass Solution:\n    def replay(self, operations):\n        linked = ${CONFIG[id][0]}()\n        results = []\n        for operation_index, (name, arguments) in enumerate(operations):\n            result = getattr(linked, name)(*arguments)\n            results.append(result)\n        return results`;
  return {config,payload:{code,method:'replay',args:[config.operations.map(op=>[op.name,op.args])],objectClasses:[CONFIG[id][0]],stateClasses:[CONFIG[id][0],'Node'],captureAllocations:['Node']}};
}
const ref=x=>x&&typeof x==='object'?x.id??null:null;
function build(id,input,params){const {config,payload}=tracePayload(id,input,params),source=CODES[id].split('\n'),native=runTrace(payload),events=native.events.filter(e=>e.line<=source.length),history=[],outputs=[];
  let previous=null;
  const steps=events.map((e,index)=>{
    const x=e.locals,frames=e.frames.filter(f=>f.name!=='replay'),state=frames.slice().reverse().map(f=>f.locals.self).find(s=>s&&(s.head||s.cursor||s.height))??e.outer.linked??{};
    const nodes=e.objects.map(o=>({id:o.id,type:o.type,fields:o.fields})),byId=new Map(nodes.map(n=>[n.id,n])),operationIndex=e.outer.operation_index??-1,operation=config.operations[operationIndex]??null,head=ref(state.head),chain=[],seen=new Set();
    for(let current=id===1823?ref(x.current)??ref(x.nodes?.[0]):head;current&&!seen.has(current);current=id===1206?ref(byId.get(current)?.fields.forward?.[0]):ref(byId.get(current)?.fields.next)){seen.add(current);chain.push(current);}
    const bindings={};for(const f of frames)for(const [name,value]of Object.entries(f.locals))if(ref(value))bindings[name]=ref(value);if(id===2296&&ref(state.cursor))bindings.cursor=ref(state.cursor);
    let change=null;const changes=[];
    for(const n of nodes){const old=previous?.nodes.find(o=>o.id===n.id);if(!old){change={kind:'create',node:n.id};continue;}
      for(const field of ['next','prev'])if(Object.hasOwn(old.fields,field)&&Object.hasOwn(n.fields,field)&&ref(old.fields[field])!==ref(n.fields[field]))changes.push({kind:'link',node:n.id,field,before:ref(old.fields[field]),after:ref(n.fields[field])});
      if(id===1206){const a=n.fields.forward,b=old.fields.forward;if(a&&b)for(let level=0;level<a.length;level++)if(ref(a[level])!==ref(b[level]))changes.push({kind:'link',node:n.id,field:'forward',level,before:ref(b[level]),after:ref(a[level])});}
    }
    if(changes.length)change=changes.at(-1);
    if(id===1823&&x.remaining!==undefined&&previous?.locals.remaining!==undefined&&x.remaining<previous.locals.remaining)change={kind:'remove',node:ref(x.removed)};
    if(id!==1823&&e.returning&&e.scope===(operation?.name??'__init__')&&(e.scope!=='__init__'||e.line>(id===2296?7:9))){history.push({index:operationIndex,label:operation?.label??CONFIG[id][0]+'()',result:e.returned,step:index});if(operationIndex>=0)outputs.push(e.returned);}
    const final=index===events.length-1,text=source[e.line-1].trim(),view={id,kind:id===2296?'text':id===1206?'skip':'circle',operations:config.operations,operationIndex,operation,constructorArgs:[],nodes,state,chain,items:id===1823?chain:chain.filter(n=>n!==head),sentinels:head?[head]:[],bindings,doubly:id!==1206,
      cycle:null,history:copy(history),outputs:[...outputs],changes,change,source:{line:e.line,text,timing:'after'},locals:x,outer:e.outer,frames:e.frames,scope:e.scope,branch:e.branch,returning:e.returning,returned:e.returned,objects:e.objects,trace:native.trace,result:final?native.answer:null};previous=view;
    return {arr:[],codeBlock:1,codeLines:[e.line],final,title:bi(`L${e.line} · ${text}`,`L${e.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),[id===2296?'linkedDesignView':'dllRoadmapView']:view};
  });return {original:config.operations,answer:native.answer,steps};
}
const defaults={2296:'[["addText","leetcode"],["deleteText",4],["addText","practice"],["cursorRight",3],["cursorLeft",8],["deleteText",10],["cursorLeft",2],["cursorRight",6]]',1206:'[["add",1],["add",2],["add",3],["search",0],["add",4],["search",1],["erase",0],["erase",1],["search",1]]',1823:5};
module.exports=Object.fromEntries([2296,1206,1823].map(id=>[id,{id,difficulty:CONFIG[id][3],slug:CONFIG[id][2],category:{key:id===1206?'design':'doubly-linked-list',vi:id===1206?'Thiết kế':'Danh sách liên kết đôi',en:id===1206?'Design':'Doubly Linked List'},tags:[{key:'linked-list',vi:'Danh sách liên kết',en:'Linked List'},{key:'design',vi:'Thiết kế',en:'Design'}],title:bi(CONFIG[id][1],CONFIG[id][1]),titleVi:bi(CONFIG[id][1],CONFIG[id][1]),
  defaultInput:defaults[id],inputKind:id===1823?'integer':'string',inputLabel:bi(id===1823?'n · 1–12 người':'JSON thao tác · ≤20 lệnh, ≤24 ký tự mới / ≤14 lần add',id===1823?'n · 1–12 players':'JSON operations · ≤20 calls, ≤24 added characters / ≤14 add calls'),extraParams:id===1823?[{key:'k',default:2,min:1,max:12,label:bi('k','k')}]:[],debugMode:'line-by-line',code:CODES[id].split('\n'),
  statement:bi(id===2296?'Thêm, xóa bên trái cursor; di chuyển cursor và trả tối đa 10 ký tự bên trái.':id===1206?'Thêm, tìm và xóa một lần xuất hiện. Skiplist cho phép giá trị trùng.':'Đếm k người theo vòng, loại người thứ k, tiếp tục từ người kế tiếp.',id===2296?'Insert, backspace, move the cursor and return up to 10 characters to its left.':id===1206?'Add, search and erase one occurrence. Duplicate values are allowed.':'Count k players cyclically, remove the kth, and continue with the next player.'),
  approach:[bi(id===1206?'Các tầng là forward thật. Seed cố định để debug lặp lại được.':id===2296?'Cursor trỏ node ngay bên trái vị trí nhập. Mỗi lần đổi prev/next được phát riêng.':'Mô phỏng bằng DLL vòng; giữ lại các con trỏ thật sau mỗi dòng.',id===1206?'Levels show actual forward pointers. A fixed seed makes replay repeatable.':id===2296?'The cursor points to the node just left of insertion. Replay each prev/next assignment.':'Simulate with a circular DLL and replay actual pointers after each statement.')],
  complexity:{time:id===1206?'O(log n) expected':id===2296?'O(k + 10) per call':'O(nk)',space:'O(n)',note:bi(id===1823?'Phương án DLL minh họa; công thức Josephus có thể dùng O(n) thời gian, O(1) bộ nhớ.':'Độ phức tạp của lời giải Python.',id===1823?'DLL simulation; Josephus recurrence can achieve O(n) time and O(1) space.':'Complexity of the Python solution.')},builder:(input,params)=>build(id,input,params),tracePayload:(input,params)=>tracePayload(id,input,params).payload,
  ...(id===1823?{liveArgs:(input,params)=>parse(id,input,params).args}:{prepareLiveDesign:(input,params)=>({className:CONFIG[id][0],constructorArgs:[],operations:parse(id,input,params).operations.map(({name,args})=>({name,args}))})}),
}]));
