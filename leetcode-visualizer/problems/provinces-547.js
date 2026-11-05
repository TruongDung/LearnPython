'use strict';
const base=require('./union-find')[547],{runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const codes=[`from typing import List

class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        self.components -= 1

class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        uf = UnionFind(n)
        for i in range(n):
            for j in range(i + 1, n):
                if isConnected[i][j]:
                    uf.union(i, j)
        return uf.components`,
`from typing import List

class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        visited = [False] * n

        def dfs(city):
            visited[city] = True
            for neighbor in range(n):
                if isConnected[city][neighbor] and not visited[neighbor]:
                    dfs(neighbor)

        provinces = 0
        for city in range(n):
            if not visited[city]:
                provinces += 1
                dfs(city)
        return provinces`].map(source=>source.split('\n'));
function parse(input){
 let matrix=input;if(typeof matrix==='string'){const raw=matrix.trim();try{matrix=raw.startsWith('[')?JSON.parse(raw):raw?raw.split(/[;|\n]/).map(row=>/^[01]+$/.test(row.trim())?[...row.trim()].map(Number):row.split(',').map(v=>v.trim()?Number(v):NaN)):null;}catch{matrix=null;}}
 if(!Array.isArray(matrix)||matrix.length<1||matrix.length>12||matrix.some(row=>!Array.isArray(row)||row.length!==matrix.length||row.some(v=>v!==0&&v!==1)))throw new RangeError('547: Use a square binary matrix for 1–12 cities. Example: [[1,1,0],[1,1,0],[0,0,1]].');
 for(let i=0;i<matrix.length;i++)for(let j=0;j<matrix.length;j++)if(matrix[i][i]!==1||matrix[i][j]!==matrix[j][i])throw new RangeError('547: isConnected[i][i] must be 1 and isConnected[i][j] must equal isConnected[j][i].');
 return matrix.map(row=>[...row]);
}
function groupsFrom(parent,owners){
 const map=new Map();
 if(parent){for(let city=0;city<parent.length;city++){let root=city;while(parent[root]!==root)root=parent[root];if(!map.has(root))map.set(root,{root,members:[]});map.get(root).members.push(city);}}
 else owners.forEach((group,city)=>{if(group===null)return;if(!map.has(group))map.set(group,{root:city,members:[]});map.get(group).members.push(city);});
 return[...map.values()].sort((a,b)=>a.members[0]-b.members[0]).map(g=>({...g,color:g.members[0]}));
}
function build(input,params={},method=1){
 const matrix=parse(input),n=matrix.length,code=codes[method-1],trace=runTrace({code:code.join('\n'),method:'findCircleNum',args:[matrix],stateClasses:method===1?['UnionFind']:[]});
 let state={},cell=null,check=null,owners=Array(n).fill(null);const history=[],used=[];
 const steps=trace.events.map((record,index)=>{
  const root=record.outer,local=record.locals,x={...root,...local},source=code[record.line-1].trim(),final=index===trace.events.length-1;let event='step',change=null;
  const previous=state.parent?[...state.parent]:null;
  if(local.self)state=local.self;
  if(method===1){
   if(source==='for i in range(n):'){cell=null;check=null;}
   if(source==='for j in range(i + 1, n):'){cell=record.branch?[root.i,root.j]:null;check=null;}
   if(source==='if isConnected[i][j]:'){cell=[root.i,root.j];check={value:matrix[root.i][root.j],enter:record.branch,visited:null};event='matrix';}
   if(source==='self.parent[ry] = rx'||source==='self.parent[x] = self.parent[self.parent[x]]'){
    const city=record.scope==='find'?local.x:local.ry;change={city,before:previous[city],after:state.parent[city],kind:record.scope==='find'?'compress':'link'};event=change.kind;
   }
   if(source==='if rx == ry:'&&record.branch)event='same';
   if(source==='self.components -= 1'){event='merge';history.push({a:root.i,b:root.j,count:state.components,step:index});used.push([root.i,root.j]);}
  }else{
   if(source==='for city in range(n):'){cell=null;check=null;}
   if(record.scope==='dfs'&&source==='for neighbor in range(n):'){cell=record.branch?[local.city,local.neighbor]:null;check=null;}
   if(source==='if isConnected[city][neighbor] and not visited[neighbor]:'){cell=[local.city,local.neighbor];check={value:matrix[local.city][local.neighbor],visited:root.visited[local.neighbor],enter:record.branch};event='matrix';}
   if(source==='provinces += 1'){event='province';history.push({seed:root.city,count:root.provinces,step:index});}
   if(source==='visited[city] = True'){
    owners[local.city]=root.provinces;event='visit';const calls=record.frames.filter(f=>f.name==='dfs');if(calls.length>1)used.push([calls.at(-2).locals.city,local.city]);cell=null;check=null;
   }
  }
  const parent=state.parent?[...state.parent]:null,rank=state.rank?[...state.rank]:null,groups=groupsFrom(method===1?parent:null,owners),colorOf=Array(n).fill(null);
  groups.forEach(g=>g.members.forEach(city=>{colorOf[city]=g.color;}));
  const unionFrame=record.frames.find(f=>f.name==='union')?.locals??{},findCity=record.scope==='find'?local.x:null;
  if(final){event='return';cell=null;check=null;}
  const view={id:547,method,line:record.line,source,scope:record.scope,event,matrix:matrix.map(row=>[...row]),n,cell:cell?[...cell]:null,check:check?{...check}:null,count:method===1?state.components??null:root.provinces??null,parent,rank,change,groups:groups.map(g=>({...g,members:[...g.members]})),colorOf,owners:[...owners],visited:method===2?[...(root.visited??[])]:null,findCity,roots:unionFrame.rx!==undefined&&unionFrame.ry!==undefined?[unionFrame.rx,unionFrame.ry]:null,stack:record.frames.filter(f=>f.name==='dfs').map(f=>f.locals.city),used:used.map(edge=>[...edge]),history:history.map(h=>({...h})),answer:final?trace.answer:null,final};
  const names=method===1?['n','i','j','x','y','rx','ry']:['n','city','neighbor','provinces','visited'];
  return{arr:[],codeBlock:method,codeLines:[record.line],final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:names.map(name=>({name,value:x[name]??'—'})),province547View:view};
 });return{original:matrix.map(row=>[...row]),answer:trace.answer,steps};
}
module.exports={547:{...base,titleVi:bi('Mỗi màu là một tỉnh','One color per province'),statement:bi('Các thành phố nối trực tiếp hoặc qua thành phố khác thuộc cùng một tỉnh. Đếm số tỉnh.','Cities connected directly or through other cities form one province. Count the provinces.'),inputLabel:bi('Ma trận đối xứng 0/1 · 1–12 thành phố · đường chéo = 1','Symmetric 0/1 matrix · 1–12 cities · diagonal = 1'),code:codes[0],code2:codes[1],debugMode:'line-by-line',complexity:{time:'O(N² · α(N))',space:'O(N)'},complexity2:{time:'O(N²)',space:'O(N)'},approach:[bi('Union-Find: gộp hai gốc khác nhau → giảm components.','Union-Find: merge different roots → decrease components.'),bi('DFS: gặp thành phố chưa thăm → bắt đầu một tỉnh và tô hết vùng nối được.','DFS: an unvisited city starts a province; visit its entire connected region.')],builder:(input,params={})=>build(input,params,Number(params.approach)===2?2:1),builder2:(input,params)=>build(input,params,2),liveArgs:input=>[parse(input)]}};
