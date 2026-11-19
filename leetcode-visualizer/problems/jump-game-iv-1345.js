'use strict';
const bi=(vi,en)=>({vi,en});
const CODE=[
  'from collections import defaultdict, deque',
  '',
  'class Solution:',
  '    def minJumps(self, arr):',
  '        n = len(arr)',
  '        groups = defaultdict(list)',
  '        for index, value in enumerate(arr):',
  '            groups[value].append(index)',
  '        queue = deque([0])',
  '        distance = [-1] * n',
  '        distance[0] = 0',
  '        while queue:',
  '            i = queue.popleft()',
  '            if i == n - 1:',
  '                return distance[i]',
  '            neighbors = [i - 1, i + 1] + groups.pop(arr[i], [])',
  '            for j in neighbors:',
  '                if 0 <= j < n and distance[j] == -1:',
  '                    distance[j] = distance[i] + 1',
  '                    queue.append(j)',
];
function parse(input){if(!Array.isArray(input)||input.length<1||input.length>50000||input.some(value=>!Number.isInteger(value)||Math.abs(value)>100000000))throw new Error('1345: cần 1..50000 số nguyên trong [-10^8, 10^8]. / Use 1..50000 integers in [-10^8, 10^8].');return input;}
function buildSteps(input){
  const arr=parse(input),n=arr.length,detailed=n<=24,steps=[],allGroups=new Map(),colors=new Map();
  const py={arr,n:null,groups:null,index:null,value:null,queue:null,distance:null,i:null,neighbors:null,j:null};
  const parent=new Int32Array(n).fill(-1),sampled=new Set([0,1,n-2,n-1]);let head=0,answer=null,witness=null;
  function emit(line,{pending=null,condition=null,force=false,final=false}={}){
    if(!detailed&&!force)return;
    const current=py.i,queue=py.queue?py.queue.slice(head,head+8):[],queueCount=py.queue?py.queue.length-head:0;
    const focus=final?witness.nodes.at(-1).index:current??0;
    const visible=n<=24?arr.map((_,i)=>i):[...new Set([0,1,2,focus-1,focus,focus+1,py.j,...(final?witness.nodes.map(node=>node.index):[]),n-3,n-2,n-1].filter(i=>Number.isInteger(i)&&i>=0&&i<n))].sort((a,b)=>a-b);
    const value=arr[current??0],group=allGroups.get(value)||[];
    const locals={...py,arr:detailed?[...arr]:null,groups:detailed&&py.groups?[...py.groups].sort(([a],[b])=>a-b).map(([value,indices])=>[value,[...indices]]):null,queue:detailed&&py.queue?py.queue.slice(head):null,distance:detailed&&py.distance?[...py.distance]:null,neighbors:detailed&&py.neighbors?[...py.neighbors]:null};
    steps.push({title:bi(`Dòng ${line} · ${final?'Đường nhảy ngắn nhất':current===null?'Xuất phát ở ô 0':`Mở ô #${current}`}`,`Line ${line} · ${final?'Shortest jump route':current===null?'Start at index 0':`Expand #${current}`}`),note:bi('',''),arr:[],highlight:[],mark:[],codeBlock:1,codeLines:[line],debugLine:line,final,
      vars:Object.entries(py).filter(([key,value])=>value!==null&&typeof value==='number').map(([name,value])=>({name,value})),
      jump1345View:{n,detailed,line,source:CODE[line-1],timing:'before',pythonLocals:locals,current,distance:current===null||!py.distance?null:py.distance[current],pending,condition,
        cells:visible.map(index=>({index,value:arr[index],color:colors.get(arr[index])??0,distance:py.distance?.[index]??null})),omitted:n-visible.length,
        queue:queue.map(index=>({index,distance:py.distance?.[index]??null})),queueCount,
        group:{value,indices:group.slice(0,8),count:group.length,available:py.groups?.has(value)??false,built:py.groups!==null},
        neighbors:py.neighbors?py.neighbors.slice(0,8):null,neighborCount:py.neighbors?.length??0,
        candidate:[18,19,20].includes(line)?py.j:null,answer:final?answer:null,witness:final?witness:null,
      }});
  }
  emit(5,{force:true,pending:{target:'n',after:n}});py.n=n;
  emit(6,{force:true});py.groups=new Map();emit(7);
  for(let index=0;index<n;index++){py.index=index;py.value=arr[index];emit(8);if(!py.groups.has(py.value)){const group=[];py.groups.set(py.value,group);allGroups.set(py.value,group);colors.set(py.value,colors.size%5);}py.groups.get(py.value).push(index);emit(7);}
  emit(9,{force:true,pending:{target:'queue',after:[0]}});py.queue=[0];
  emit(10,{force:true,pending:{target:'distance',kind:'allocate',after:n}});py.distance=Array(n).fill(-1);
  emit(11,{force:true,pending:{target:'distance[0]',before:-1,after:0}});py.distance[0]=0;
  emit(12,{force:true,condition:head<py.queue.length});
  while(head<py.queue.length){
    const keep=sampled.has(py.queue[head]);emit(13,{force:keep,pending:{target:'i',after:py.queue[head]}});py.i=py.queue[head++];
    emit(14,{force:keep,condition:py.i===n-1});
    if(py.i===n-1){
      answer=py.distance[py.i];const path=[];for(let i=py.i;i!==-1;i=parent[i])path.push(i);path.reverse();
      const indices=path.length<=12?path.map((_,i)=>i):[0,1,2,path.length-3,path.length-2,path.length-1];
      witness={length:answer,complete:path.length<=12,omitted:path.length-indices.length,nodes:indices.map(k=>({index:path[k],value:arr[path[k]],distance:k,kind:k===0?'start':Math.abs(path[k]-path[k-1])===1?'adjacent':'same'}))};
      emit(15,{force:true,final:true,pending:{target:'return',after:answer}});return{original:[...arr],answer,witness,steps};
    }
    const group=py.groups.get(arr[py.i])||[],neighbors=[py.i-1,py.i+1,...group];
    emit(16,{force:keep,pending:{target:'neighbors',kind:'expand',value:arr[py.i],groupCount:group.length,after:neighbors.length}});py.neighbors=neighbors;py.groups.delete(arr[py.i]);emit(17,{force:keep});
    for(let k=0;k<neighbors.length;k++){
      py.j=neighbors[k];const sample=keep&&(k<3||k===neighbors.length-1)||py.j===n-1;
      const valid=py.j>=0&&py.j<n&&py.distance[py.j]===-1;
      emit(18,{force:sample,condition:valid});
      if(valid){const next=py.distance[py.i]+1;emit(19,{force:sample,pending:{target:`distance[${py.j}]`,before:-1,after:next}});py.distance[py.j]=next;parent[py.j]=py.i;emit(20,{force:sample,pending:{target:'queue',kind:'append',after:py.j}});py.queue.push(py.j);}
      emit(17,{force:sample});
    }
    emit(12,{force:keep,condition:head<py.queue.length});
  }
  throw new Error('1345: target unreachable');
}
module.exports={1345:{id:1345,difficulty:'hard',slug:'jump-game-iv',category:{key:'graph',vi:'Đồ thị',en:'Graph'},tags:[{key:'bfs',vi:'BFS / Theo tầng',en:'BFS'},{key:'array',vi:'Mảng',en:'Array'}],
  title:bi('Jump Game IV','Jump Game IV'),titleVi:bi('Nhảy kề bên hoặc cùng số · ít bước nhất','Jump to a neighbor or equal value · fewest steps'),statement:bi('Từ ô 0 đến ô cuối. Một bước: sang ô kề bên hoặc tới bất kỳ ô nào cùng giá trị. Không nhảy ra ngoài mảng.','Go from index 0 to the last index. One jump reaches an adjacent index or any index with the same value. Stay inside the array.'),
  defaultInput:[100,-23,-23,404,100,23,23,23,3,404],inputKind:'integer',inputLabel:bi('arr · các số nguyên','arr · integers'),extraParams:[],debugMode:'line',code:CODE,builder:buildSteps,liveArgs:input=>[[...parse(input)]],limits:{maxLength:50000,minValue:-100000000,maxValue:100000000},
  approach:[bi('BFS mở theo tầng: 0 bước → 1 bước → 2 bước…','BFS expands by distance: 0 jumps → 1 jump → 2 jumps…'),bi('Đánh dấu ngay khi thêm vào queue. Dùng một nhóm cùng số xong thì bỏ nhóm, tránh quét lại.','Mark a node when enqueueing it. Remove each equal-value bucket after expanding it once.')],
  complexity:{time:'O(n)',space:'O(n)',note:bi('Debug mọi dòng với ≤ 24 ô. Mảng lớn gộp vòng lặp, vẫn tính đủ đáp án.','Every line is traced for ≤ 24 entries. Larger arrays summarize loops and still compute the full answer.')},
}};
