'use strict';

const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const CODE=`from functools import lru_cache

class Solution:
    def uniquePaths(self, m, n):
        rows, cols = m, n

        @lru_cache(None)
        def dfs(row, col):
            if row >= rows or col >= cols:
                return 0

            if row == rows - 1 and col == cols - 1:
                return 1

            down = dfs(row + 1, col)
            right = dfs(row, col + 1)

            return down + right

        return dfs(0, 0)`.split('\n');

function build(rows,cols){
 return buildMemo({id:62,grid:Array.from({length:rows},()=>Array(cols).fill(0)),code:CODE,method:'uniquePaths',args:[rows,cols]});
}

function buildMemo({id,grid,code,method,args}){
 const rows=grid.length,cols=grid[0].length,native=runTrace({code:code.join('\n'),method,args,traceCalls:['dfs']});
 const memo=grid.map(row=>row.map(()=>null)),cached=new Map(),writes=[];
 const downLine=code.findIndex(line=>line.includes('down = dfs('))+1,rightLine=code.findIndex(line=>line.includes('right = dfs('))+1;
 const rootLine=code.findIndex(line=>line.includes('return dfs(0, 0)'))+1;
 let cacheHits=0;
 const inside=cell=>cell&&cell[0]>=0&&cell[0]<rows&&cell[1]>=0&&cell[1]<cols;
 const steps=native.events.map((event,index)=>{
  const x=event.locals,line=event.line,final=index===native.events.length-1,cell=event.scope==='dfs'?[x.row,x.col]:null;
  const stack=event.frames.filter(frame=>frame.name==='dfs').map((frame,i,frames)=>({cell:[frame.locals.row,frame.locals.col],line:frame.line,status:i===frames.length-1?'active':'waiting'}));
  let active=inside(cell)?cell:null,phase=cell?(inside(cell)?'guard':'outside'):'init',pendingCall=null,received=null,cacheHit=null;
  if(event.event==='call'){
   const target=line===rootLine?[0,0]:line===downLine?[x.row+1,x.col]:[x.row,x.col+1];
   pendingCall={cell:target,variable:line===downLine?'down':line===rightLine?'right':null,cached:cached.has(target.join(':'))};phase='call';
   if(stack.length)stack.at(-1).status='calling';
  }else if(cell&&event.returning){
   cached.set(cell.join(':'),event.returned);if(stack.length)stack.at(-1).status='returning';
   if(active){memo[x.row][x.col]=event.returned;writes.push({cell:[...cell],value:event.returned,step:index});phase='write';}
   else phase='outside-return';
  }else if(cell&&(line===downLine||line===rightLine)){
   const target=line===downLine?[x.row+1,x.col]:[x.row,x.col+1],previous=native.events[index-1],value=line===downLine?x.down:x.right;
   const expanded=previous?.returning&&previous.scope==='dfs'&&previous.locals.row===target[0]&&previous.locals.col===target[1];
   if(!expanded){
    if(cached.get(target.join(':'))!==value)throw new Error(`${id}: cached return differs from the Python trace.`);
    cacheHits++;cacheHit={cell:target,value};phase='cache-hit';
   }else phase='receive';
   received={cell:target,variable:line===downLine?'down':'right',value,cached:!expanded};
  }
  const blocked=Boolean(id===63&&active&&grid[x.row][x.col]===1),goal=Boolean(active&&!blocked&&x.row===rows-1&&x.col===cols-1);
  const neighbors=active&&!goal&&!blocked?[
   {cell:[x.row+1,x.col],direction:'down',value:x.down??null},
   {cell:[x.row,x.col+1],direction:'right',value:x.right??null},
  ]:[];
  if(final){active=[0,0];phase='result';}
  const counts=memo.map(row=>row.map(value=>[value])),known=memo.map(row=>row.map(value=>[value!==null]));
  const view={id,method:2,kind:id===63?'obstacles':'count',grid,rows,cols,k:1,rem:0,previous:0,counts,known,rawDP:memo.map(row=>[...row]),active,neighbors,
   phase,writes:structuredClone(writes),line,source:code[line-1].trim(),branch:event.branch,stack,pendingCall,received,cacheHit,cacheHits,goal,blocked,
   outside:cell&&!inside(cell)?cell:null,returned:event.returning?event.returned:null,execution:{event:event.event,timing:event.timing,scope:event.scope},
   trace:native.trace,final,answer:final?native.answer:null,path:[],paths:[]};
  return {arr:[],codeBlock:2,codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,
   vars:['rows','cols','row','col','down','right'].map(name=>({name,value:x[name]??'—'})),gridPathPictureView:view};
 });
 return {original:id===62?[rows]:grid,answer:native.answer,steps};
}
module.exports={CODE,build,buildMemo};
