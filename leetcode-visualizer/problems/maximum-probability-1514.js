'use strict';

const base=require('./graph')[1514];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en=vi)=>({vi,en});

function parseInput(input,params={}) {
  const n=Number(params.n??3),start=Number(params.start_node??0),end=Number(params.end_node??2);
  if(!Number.isInteger(n)||n<2||n>10000||!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<0||start>=n||end>=n||start===end)throw new RangeError('1514: 2 ≤ n ≤ 10000; start ≠ end, thuộc 0..n−1 / start and end must be distinct nodes.');
  let weighted=input;
  if(typeof input==='string') {
    const text=input.trim();
    if(text.startsWith('[')) {try{weighted=JSON.parse(text);}catch{throw new RangeError('1514: JSON cạnh không hợp lệ / Invalid edge JSON.');}}
    else weighted=text?text.split(',').map(edge=>{
      const match=edge.trim().match(/^(\d+)\s*-\s*(\d+)\s*-\s*((?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)$/);
      return match?match.slice(1).map(Number):null;
    }):[];
  }
  if(!Array.isArray(weighted)||weighted.length>20000||!Array.from(weighted).every(edge=>Array.isArray(edge)&&edge.length===3&&Number.isInteger(edge[0])&&Number.isInteger(edge[1])&&edge[0]>=0&&edge[0]<n&&edge[1]>=0&&edge[1]<n&&edge[0]!==edge[1]&&typeof edge[2]==='number'&&Number.isFinite(edge[2])&&edge[2]>=0&&edge[2]<=1))throw new RangeError('1514: tối đa 20000 cạnh a-b-p; a ≠ b, p ∈ [0,1] / Up to 20000 edges; distinct endpoints and probability in [0,1].');
  if(new Set(weighted.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(','))).size!==weighted.length)throw new RangeError('1514: mỗi cặp nút chỉ có một cạnh vô hướng / Each undirected pair must be unique.');
  return {n,start,end,weighted:weighted.map(edge=>[...edge]),edges:weighted.map(([a,b])=>[a,b]),probabilities:weighted.map(edge=>edge[2])};
}

function title(view) {
  if(view.final)return bi('Xác suất lớn nhất','Maximum probability');
  const labels={build:bi('Dựng đồ thị hai chiều','Build both directions'),init:bi('Khởi tạo','Initialize'),pop:bi('Lấy xác suất lớn nhất','Pop highest probability'),stale:bi('Bỏ bản ghi cũ','Skip stale entry'),target:bi('Đã tới đích?','Reached the target?'),inspect:bi('Thử cạnh','Inspect edge'),'scan-done':bi('Đã thử các cạnh','Neighbors scanned'),calculate:bi('Nhân xác suất','Multiply probabilities'),compare:bi('Đường này tốt hơn?','Is this route better?'),update:bi('Cập nhật best','Update best'),push:bi('Đưa vào heap','Push into heap')};
  return labels[view.phase]||bi(`Dòng ${view.source.line}`,`Line ${view.source.line}`);
}

function build(input,params={}) {
  const {n,start,end,weighted,edges,probabilities}=parseInput(input,params);
  const result=runTrace({profile:'probability1514',code:base.code.join('\n'),method:'maxProbability',args:[n,edges,probabilities,start,end],maxEvents:1600});
  let previous=new Map();
  const steps=result.events.map(view=>{
    const changed=view.best.filter(item=>previous.has(item.node)&&previous.get(item.node)!==null&&previous.get(item.node)!==item.value)
      .map(item=>({node:item.node,before:previous.get(item.node),after:item.value}));
    previous=new Map(view.best.map(item=>[item.node,item.value]));
    return {arr:[],highlight:[],mark:[],codeBlock:1,codeLines:[view.source.line],final:view.final,title:title(view),note:bi(''),
      vars:Object.entries(view.locals).map(([name,value])=>({name,value})),probability1514View:{...view,changed,trace:result.trace}};
  });
  return {original:weighted,n,edges:weighted,startNode:start,endNode:end,answer:result.answer,steps};
}

module.exports={1514:{...base,builder:build,parseInput,allowEmptyInput:true,
  statement:bi('Đi từ start tới end. Mỗi cạnh có xác suất thành công p. Chọn đường có tích xác suất lớn nhất; không có đường thì trả 0.','Go from start to end. Each edge has success probability p. Choose the largest product of probabilities; return 0 if unreachable.'),
  inputLabel:bi('Cạnh a-b-p, cách bởi dấu phẩy; hoặc JSON [[a,b,p],…]','Comma-separated a-b-p edges, or JSON [[a,b,p],…]'),
  approach:[bi('Ưu tiên xác suất lớn nhất. Thử new_prob = prob × edge_prob; chỉ giữ khi lớn hơn best[v].','Pop the highest probability. Try new_prob = prob × edge_prob; keep it only if larger than best[v].')],
  extraParams:[{key:'n',label:bi('n · số nút','n · nodes'),default:3,min:2,max:10000},{key:'start_node',label:bi('start · nguồn','start · source'),default:0,min:0,max:9999},{key:'end_node',label:bi('end · đích','end · target'),default:2,min:0,max:9999}],
  liveArgs:(input,params)=>{const {n,start,end,edges,probabilities}=parseInput(input,params);return[n,edges,probabilities,start,end];},
}};
