'use strict';
const base=require('./interview')[9009],{runTrace}=require('./wasm-picture-trace'),bi=(vi,en)=>({vi,en});
const codes=[`from math import hypot

class Solution:
    def nearbyMerchants(self, merchants, user, radius):
        answer = []
        for index, (name, x, y) in enumerate(merchants):
            dx = x - user[0]
            dy = y - user[1]
            distance = hypot(dx, dy)
            if distance <= radius:
                answer.append((distance, name, index))
        answer.sort()
        return [name for distance, name, index in answer]`,
`from math import floor, hypot

class Solution:
    def nearbyMerchants(self, merchants, user, radius):
        cell_size = max(radius, 1.0)
        buckets = {}
        for index, (name, x, y) in enumerate(merchants):
            cell = (floor(x / cell_size), floor(y / cell_size))
            buckets.setdefault(cell, []).append(index)

        min_cx = floor((user[0] - radius) / cell_size)
        max_cx = floor((user[0] + radius) / cell_size)
        min_cy = floor((user[1] - radius) / cell_size)
        max_cy = floor((user[1] + radius) / cell_size)
        answer = []
        for cx in range(min_cx, max_cx + 1):
            for cy in range(min_cy, max_cy + 1):
                for index in buckets.get((cx, cy), []):
                    name, x, y = merchants[index]
                    dx = x - user[0]
                    dy = y - user[1]
                    distance = hypot(dx, dy)
                    if distance <= radius:
                        answer.append((distance, name, index))
        answer.sort()
        return [name for distance, name, index in answer]`].map(s=>s.split('\n'));
function scalar(raw,label,min,max){const n=typeof raw==='string'&&raw.trim()===''?NaN:Number(raw);if(!['string','number'].includes(typeof raw)||!Number.isFinite(n)||n<min||n>max)throw new RangeError(`9009: ${label} must be a finite number from ${min} to ${max}.`);return n;}
function parse(input,params={}){
 let points=input;if(typeof points==='string'){const raw=points.trim();try{points=raw.startsWith('[')?JSON.parse(raw):raw?raw.split('|').map(item=>{const colon=item.lastIndexOf(':');if(colon<1)throw Error();const xy=item.slice(colon+1).split(',');if(xy.length!==2||xy.some(v=>!v.trim()))throw Error();return[item.slice(0,colon).trim(),...xy.map(Number)];}):[];}catch{points=null;}}
 if(!Array.isArray(points)||points.length>24)throw new RangeError('9009: Use up to 24 merchants as Name:x,y|Name:x,y or JSON [[name,x,y],...].');
 points=points.map(row=>{if(!Array.isArray(row)||row.length!==3||typeof row[0]!=='string'||!row[0].trim()||row[0].trim().length>32||/[\u0000-\u001f]/.test(row[0]))throw new RangeError('9009: Each merchant needs a name (1–32 characters) and two coordinates.');if(row.slice(1).some(v=>typeof v!=='number'))throw new RangeError('9009: Merchant coordinates must be numbers.');return[row[0].trim(),scalar(row[1],'x',-10000,10000),scalar(row[2],'y',-10000,10000)];});
 return{points,user:[scalar(params.x??0,'user x',-10000,10000),scalar(params.y??0,'user y',-10000,10000)],radius:scalar(params.radius??5,'radius',0,10000)};
}
function build(input,params={},method=1){
 const{points,user,radius}=parse(input,params),code=codes[method-1],trace=runTrace({code:code.join('\n'),method:'nearbyMerchants',args:[points,user,radius]});
 const statuses=points.map(()=>null),checks=[],queried=[];let phase=method===1?'scan':'build',active=null,building=null,dx=null,dy=null,distance=null,checked=null,currentCell=null;
 const steps=trace.events.map((r,index)=>{const x=r.locals,source=code[r.line-1].trim(),final=index===trace.events.length-1;let event='step';
  if(source==='for index, (name, x, y) in enumerate(merchants):'){
   if(method===1){active=r.branch?x.index:null;dx=dy=distance=checked=null;event='select';}
   else building=r.branch?x.index:null;
  }
  if(source==='buckets.setdefault(cell, []).append(index)')event='store';
  if(source.startsWith('min_cx =')){phase='query';building=null;}
  if(source==='for cx in range(min_cx, max_cx + 1):'||source==='for cy in range(min_cy, max_cy + 1):'){active=null;dx=dy=distance=checked=null;currentCell=source.startsWith('for cy')&&r.branch?[x.cx,x.cy]:null;event='cell';}
  if(source==='for index in buckets.get((cx, cy), []):'){
   if(!queried.some(([a,b])=>a===x.cx&&b===x.cy))queried.push([x.cx,x.cy]);active=r.branch?x.index:null;dx=dy=distance=checked=null;event=r.branch?'select':'empty-cell';
  }
  if(source==='dx = x - user[0]'){dx=x.dx;event='dx';}
  if(source==='dy = y - user[1]'){dy=x.dy;event='dy';}
  if(source==='distance = hypot(dx, dy)'){distance=x.distance;event='distance';}
  if(source==='if distance <= radius:'){checked=r.branch;statuses[active]=r.branch;checks.push({merchant:active,distance:x.distance,inside:r.branch,step:index});event='check';}
  if(source==='answer.append((distance, name, index))')event='keep';
  if(source==='answer.sort()'){event='sort';active=null;dx=dy=distance=checked=null;}
  if(final){event='return';active=null;building=null;currentCell=null;}
  const buckets=(x.buckets?.__pairs__??[]).map(([cell,ids])=>({cell:[...cell],ids:[...ids]}));
  const view={id:9009,method,line:r.line,source,event,phase,points:points.map(p=>[...p]),user:[...user],radius,active,building,dx,dy,distance,checked,statuses:[...statuses],checks:checks.map(c=>({...c})),answerRows:x.answer?.map(row=>[...row])??null,cellSize:x.cell_size??null,buckets,queried:queried.map(p=>[...p]),cell:currentCell?[...currentCell]:null,bounds:['min_cx','max_cx','min_cy','max_cy'].every(k=>x[k]!==undefined)?[x.min_cx,x.max_cx,x.min_cy,x.max_cy]:null,answer:final?[...trace.answer]:null,final};
  return{arr:[],codeBlock:method,codeLines:[r.line],final,title:bi(`Dòng ${r.line}`,`Line ${r.line}`),note:bi('',''),vars:['user','index','name','x','y','dx','dy','distance','radius','cell_size','cell','cx','cy','answer'].map(name=>({name,value:x[name]??'—'})),merchant9009View:view};
 });return{original:points.map(p=>[...p]),answer:trace.answer,steps};
}
const labels=[bi('Quét từng điểm','Scan points'),bi('Lưới ô + lọc chính xác','Grid + exact checks')];
module.exports={9009:{...base,titleVi:bi('Trong vòng tròn bán kính?','Inside the radius?'),statement:bi('Tọa độ trên mặt phẳng x/y. Giữ cửa hàng có khoảng cách ≤ radius, gồm cả trên biên.','Coordinates lie on an x/y plane. Keep merchants with distance ≤ radius, including the boundary.'),inputLabel:bi('Name:x,y|Name:x,y · tối đa 24 điểm · tọa độ ±10000','Name:x,y|Name:x,y · up to 24 points · coordinates ±10000'),extraParams:[...base.extraParams.map(p=>({...p,min:p.key==='radius'?0:-10000,max:10000})),{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:labels.map((label,i)=>({value:i+1,label}))}],approach:[bi('Quét: tính dx, dy → khoảng cách → kiểm tra ≤ radius.','Scan: compute dx, dy → distance → check ≤ radius.'),bi('Lưới: gom điểm theo ô, lấy các ô trong khung bán kính rồi kiểm tra khoảng cách thật.','Grid: bucket points, query the radius bounding box, then check exact distances.')],code:codes[0],code2:codes[1],codeLabel:labels[0],code2Label:labels[1],debugMode:'line-by-line',complexity:{time:'O(N + K log K)',space:'O(K)',note:bi('K: số cửa hàng trong vùng; kết quả sắp từ gần đến xa.','K: matches; results are sorted by distance, then name.')},complexity2:{time:'O(N + C + K log K)',space:'O(N)',note:bi('Gồm dựng lưới. C: số điểm trong ô ứng viên; K: kết quả.','Includes grid construction. C: candidates in queried cells; K: matches.')},builder:(input,params={})=>build(input,params,Number(params.approach)===2?2:1),builder2:(input,params)=>build(input,params,2),liveArgs:(input,params)=>{const{points,user,radius}=parse(input,params);return[points,user,radius];}}};
