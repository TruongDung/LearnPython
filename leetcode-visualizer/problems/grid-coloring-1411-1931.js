'use strict';
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi,en) => ({vi,en});
const MOD = 1000000007;
const CODE1411 = `class Solution:
    def numOfWays(self, n: int) -> int:
        MOD = 10**9 + 7
        aba, abc = 6, 6
        for row in range(2, n + 1):
            next_aba = (3 * aba + 2 * abc) % MOD
            next_abc = (2 * aba + 2 * abc) % MOD
            aba, abc = next_aba, next_abc
        return (aba + abc) % MOD`;
const CODE1931 = `from itertools import product

class Solution:
    def colorTheGrid(self, m: int, n: int) -> int:
        MOD = 10**9 + 7
        states = [s for s in product(range(3), repeat=m) if all(s[r] != s[r - 1] for r in range(1, m))]
        previous_for = [[i for i, left in enumerate(states) if all(a != b for a, b in zip(left, right))] for right in states]
        dp = [1] * len(states)
        for col in range(1, n):
            next_dp = []
            for target, compatible in enumerate(previous_for):
                ways = sum(dp[i] for i in compatible) % MOD
                next_dp.append(ways)
            dp = next_dp
        return sum(dp) % MOD`;

function integer(value,min,max,id,name) {
  const n = Number(value);
  if(!Number.isInteger(n)||n<min||n>max)throw new RangeError(`${id}: ${name} must be an integer from ${min} to ${max}.`);
  return n;
}
function parse1411(input) {
  const raw = Array.isArray(input) && input.length === 1 ? input[0] : input;
  if(Array.isArray(raw)||String(raw ?? '').trim()==='')throw new RangeError('1411: enter n from 1 to 12 for visualization.');
  return integer(raw,1,12,1411,'n');
}
function parse1931(input,params={}) {
  const raw = Array.isArray(input) && input.length === 1 ? input[0] : input;
  if(Array.isArray(raw)||String(raw ?? '').trim()==='')throw new RangeError('1931: enter m from 1 to 5 and n from 1 to 8.');
  return {m:integer(raw,1,5,1931,'m'),n:integer(params.n ?? 3,1,8,1931,'n')};
}
function statesFor(m) {
  const states=[];
  function extend(prefix) {
    if(prefix.length===m){states.push(prefix);return;}
    for(let color=0;color<3;color++)if(!prefix.length||prefix.at(-1)!==color)extend([...prefix,color]);
  }
  extend([]); return states;
}
function compatibility(states) {return states.map(right=>states.flatMap((left,i)=>left.every((c,r)=>c!==right[r])?[i]:[]));}
const ROWS = statesFor(3);
const transitions = [0,1].flatMap(from => [0,1].map(to => {
  const left = from===0 ? [0,1,0] : [0,1,2];
  return {from:from===0?'ABA':'ABC',to:to===0?'ABA':'ABC',left,
    choices:ROWS.filter(right=>(right[0]===right[2])===(to===0)&&right.every((color,i)=>color!==left[i]))};
}));

function build1411(input) {
  const n=parse1411(input),code=CODE1411.split('\n'),trace=runTrace({code:CODE1411,method:'numOfWays',args:[n]});
  const history=[];
  let old=null,nextA=null,nextB=null;
  const steps=trace.events.map((record,index)=>{
    const x=record.outer,source=code[record.line-1].trim(),final=index===trace.events.length-1;
    let event='prepare';
    if(source==='aba, abc = 6, 6'){history.push({row:1,aba:6,abc:6,total:12,step:index});event='base';}
    if(source==='for row in range(2, n + 1):'&&record.branch){old={aba:x.aba,abc:x.abc};nextA=null;nextB=null;event='row';}
    if(source.startsWith('next_aba =')){nextA=x.next_aba;event='aba';}
    if(source.startsWith('next_abc =')){nextB=x.next_abc;event='abc';}
    if(source==='aba, abc = next_aba, next_abc'){history.push({row:x.row,aba:x.aba,abc:x.abc,total:(x.aba+x.abc)%MOD,step:index});event='commit';}
    if(final)event='done';
    return {arr:[],codeBlock:1,codeLines:[record.line],final,
      title:bi(event==='done'?`${n} hàng → ${trace.answer} cách`:event==='base'?'Hàng đầu có 6 ABA + 6 ABC':`Hàng ${x.row??1} · ${event==='aba'?'đếm ABA':event==='abc'?'đếm ABC':'gộp mẫu tô'}`,event==='done'?`${n} rows → ${trace.answer} ways`:event==='base'?'First row: 6 ABA + 6 ABC':`Row ${x.row??1} · ${event==='aba'?'count ABA':event==='abc'?'count ABC':'combine patterns'}`),note:bi('',''),
      vars:['row','aba','abc','next_aba','next_abc'].map(name=>({name,value:x[name]??'—'})),
      paint1411View:{n,event,source,row:x.row??1,aba:x.aba??null,abc:x.abc??null,old:old?{...old}:null,nextA,nextB,history:history.map(h=>({...h})),transitions:transitions.map(tr=>({...tr,left:[...tr.left],choices:tr.choices.map(s=>[...s])})),final,answer:final?trace.answer:null},
    };
  });
  return {original:[n],answer:trace.answer,steps};
}
function build1931(input,params={}) {
  const {m,n}=parse1931(input,params),code=CODE1931.split('\n'),states=statesFor(m),previousFor=compatibility(states);
  const trace=runTrace({code:CODE1931,method:'colorTheGrid',args:[m,n],summarizeLocals:{states:0,previous_for:0}});
  const history=[];
  const steps=trace.events.map((record,index)=>{
    const x=record.outer,source=code[record.line-1].trim(),final=index===trace.events.length-1;
    let event='prepare';
    if(source==='dp = [1] * len(states)'){history.push({column:1,total:states.length,step:index});event='base';}
    if(source==='next_dp = []')event='column';
    if(source==='ways = sum(dp[i] for i in compatible) % MOD')event='sum';
    if(source==='next_dp.append(ways)')event='append';
    if(source==='dp = next_dp'){history.push({column:x.col+1,total:x.dp.reduce((a,b)=>(a+b)%MOD,0),step:index});event='commit';}
    if(final)event='done';
    const target=Number.isInteger(x.target)&&['sum','append'].includes(event)?x.target:null;
    const column=x.col===undefined?1:x.col+1;
    return {arr:[],codeBlock:1,codeLines:[record.line],final,
      title:bi(final?`${m}×${n} → ${trace.answer} cách`:target!==null?`Cột ${column} · cộng cách cho mẫu #${target+1}`:`Ghép cột ${column}`,final?`${m}×${n} → ${trace.answer} ways`:target!==null?`Column ${column} · sum ways for pattern #${target+1}`:`Build column ${column}`),note:bi('',''),
      vars:['col','target','compatible','ways','dp','next_dp'].map(name=>({name,value:x[name]??'—'})),
      paint1931View:{m,n,event,source,column,target,ways:target===null?null:x.ways??null,states:states.map(s=>[...s]),previousFor:previousFor.map(a=>[...a]),dp:x.dp?[...x.dp]:null,nextDp:['sum','append','column'].includes(event)&&x.next_dp?[...x.next_dp]:null,history:history.map(h=>({...h})),final,answer:final?trace.answer:null},
    };
  });
  return {original:[m],answer:trace.answer,steps};
}
const tags=[{key:'graph-coloring',vi:'Tô màu đồ thị',en:'Graph Coloring'}];
module.exports={
  1411:{id:1411,difficulty:'hard',slug:'number-of-ways-to-paint-n-3-grid',title:bi('Number of Ways to Paint N × 3 Grid','Number of Ways to Paint N × 3 Grid'),titleVi:bi('Chỉ cần nhớ hai kiểu hàng: ABA và ABC','Only two row types matter: ABA and ABC'),category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},tags,
    statement:bi('Tô lưới n hàng × 3 cột bằng đỏ, vàng, xanh; hai ô kề cạnh phải khác màu. Đếm số cách modulo 1,000,000,007. Bản trực quan dùng n từ 1 đến 12.','Paint an n-row × 3-column grid red, yellow or green with different colors on adjacent cells. Count colorings modulo 1,000,000,007. Visualization uses n from 1 to 12.'),
    inputKind:'string',inputLabel:bi('n · số hàng (1–12)','n · rows (1–12)'),defaultInput:'3',code:CODE1411.split('\n'),debugMode:'line-by-line',complexity:{time:'O(n)',space:'O(1)'},
    approach:[bi('Hàng ABA dùng 2 màu, hai đầu giống nhau; ABC dùng 3 màu khác nhau. Mỗi kiểu có 6 cách ở hàng đầu.','ABA uses 2 colors with equal ends; ABC uses 3 distinct colors. Each type has 6 first-row colorings.'),bi('Từ một ABA có 3 ABA và 2 ABC ghép được; từ một ABC có 2 ABA và 2 ABC ghép được.','One ABA allows 3 ABA and 2 ABC successors; one ABC allows 2 ABA and 2 ABC successors.')],builder:build1411,liveArgs:input=>[parse1411(input)]},
  1931:{id:1931,difficulty:'hard',slug:'painting-a-grid-with-three-different-colors',title:bi('Painting a Grid With Three Different Colors','Painting a Grid With Three Different Colors'),titleVi:bi('Ghép cột: mỗi hàng phải khác màu ở hai bên','Join columns: every row must differ across the boundary'),category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},tags,
    statement:bi('Tô lưới m hàng × n cột bằng đỏ, xanh lá, xanh dương sao cho mọi ô kề cạnh khác màu. Đếm số cách modulo 1,000,000,007. Bản trực quan: m=1–5, n=1–8.','Paint an m-row × n-column grid red, green or blue so adjacent cells differ. Count colorings modulo 1,000,000,007. Visualization: m=1–5, n=1–8.'),
    inputKind:'string',inputLabel:bi('m · số hàng (1–5)','m · rows (1–5)'),defaultInput:'3',extraParams:[{key:'n',label:bi('n · số cột (1–8)','n · columns (1–8)'),type:'number',default:3,min:1,max:8}],
    code:CODE1931.split('\n'),debugMode:'line-by-line',complexity:{time:'O(m · 3^m + m · S² + n · E)',space:'O(m · S + E)',note:bi('S = 3·2^(m−1) mẫu cột; E = số cặp mẫu ghép được.','S = 3·2^(m−1) column patterns; E = compatible pattern pairs.')},
    approach:[bi('Liệt kê mẫu cột hợp lệ: hai ô đứng cạnh nhau khác màu.','List valid column patterns: vertically adjacent cells differ.'),bi('Hai cột ghép được khi màu khác nhau ở mọi hàng. dp[mẫu] đếm tất cả cách kết thúc ở mẫu đó.','Two columns fit when every row differs. dp[pattern] counts all colorings ending in that pattern.'),bi('Số cách mới của một mẫu là tổng dp của các mẫu cột trước ghép được.','A pattern’s new count is the sum of dp values of compatible preceding patterns.')],builder:build1931,liveArgs:(input,params)=>{const {m,n}=parse1931(input,params);return [m,n];}},
};
