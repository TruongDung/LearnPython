"use strict";
const base = require("./tree")[103];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi,en) => ({vi,en}), copy = value => JSON.parse(JSON.stringify(value));
const code = base.code.join("\n").replace("if not root: return []", "if not root:\n            return []")
 .replace("if n.left: nxt.append(n.left)", "if n.left:\n                    nxt.append(n.left)")
 .replace("if n.right: nxt.append(n.right)", "if n.right:\n                    nxt.append(n.right)").split("\n");
const code2 = ["import collections", "", ...base.code2];
const profiles = [null,
 {guard:3,empty:4,init:5,loop:6,collect:7,record:[8],flip:9,reset:10,each:11,leftCheck:12,leftAdd:13,rightCheck:14,rightAdd:15,advance:16,end:17},
 {guard:5,empty:6,queueInit:7,seed:8,counter:9,init:10,loop:11,size:12,reset:13,each:14,pop:15,collect:16,leftCheck:17,leftAdd:18,rightCheck:19,rightAdd:20,check:21,record:[22,24],flip:25,end:26}];

function parse(input) {
  let values = input;
  if (typeof values === "string") {
    const raw = values.trim();
    try { values = !raw ? [] : raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => {
      const text = s.trim(); return ["null", "None"].includes(text) ? null : text ? Number(text) : NaN;
    }); } catch { values = null; }
  }
  const error = () => new RangeError("#103: cây level-order gồm 0–31 nút, số nguyên −1000…1000, null cho nhánh trống / use 0–31 connected integer nodes, −1000…1000, with null for missing children.");
  if (!Array.isArray(values) || values.length > 63
    || !Array.from(values).every(v => v === null || Number.isInteger(v) && Math.abs(v) <= 1000)) throw error();
  values = [...values];
  const nodes = values.length && values[0] !== null ? [{ id: "0:0", value: values[0], left: null, right: null, parent: null, depth: 0 }] : [];
  let index = 1;
  for (let head = 0; head < nodes.length && index < values.length; head++) for (const side of ["left", "right"]) {
    if (index >= values.length) break;
    const value = values[index], id = `0:${index++}`;
    if (value === null) continue;
    nodes[head][side] = id;
    nodes.push({ id, value, left: null, right: null, parent: nodes[head].id, depth: nodes[head].depth + 1 });
  }
  if (nodes.length > 31 || values.slice(index).some(v => v !== null)) throw error();
  const byId = new Map(nodes.map(node => [node.id, node])); let rank = 0;
  const inorder = id => { if (id === null) return; const n = byId.get(id); inorder(n.left); n.rank = rank++; inorder(n.right); };
  if (nodes.length) inorder(nodes[0].id);
  return { values, nodes, byId };
}

function builder(input,params={}) {
 const method=Number(params.approach)===2?2:1,p=profiles[method],source=method===1?code:code2;
 const {values,nodes,byId}=parse(input),trace=runTrace({code:source.join("\n"),method:"zigzagLevelOrder",args:[values],treeArgs:[0]});
 const resultIds=[],directions=[];let round=0,roundIds=[],popped=[],limit=null,current=null,bufferIds=null,rowDirection=null,rowLevel=null,lastRecord=null,alias=null;
 const steps=trace.events.map(record=>{
  const x=record.locals,line=record.line,queue=x.queue?.map(n=>n.id)??null,nxt=method===1?x.nxt?.map(n=>n.id)??null:null;
  const flag=method===1?x.ltr??null:x.level===undefined?null:x.level%2===0;
  const buffer=method===1?x.vals??null:x.lst??null,result=method===1?x.res??null:x.result??null;
  let change=null,probe=null;
  if(line===p.loop&&record.branch){round++;roundIds=[...queue];popped=[];limit=null;current=null;}
  if(method===1&&line===p.collect){bufferIds=[...queue];rowDirection=x.ltr;rowLevel=round;lastRecord=null;change={kind:"collect"};}
  if(method===2&&line===p.reset){bufferIds=[];rowDirection=flag;rowLevel=x.level+1;lastRecord=null;change={kind:"reset"};}
  if(method===1&&line===p.reset){alias=false;change={kind:"reset-next"};}
  if(method===2&&line===p.size)limit=x.size;
  if(line===p.each)current=method===1&&record.branch?x.n.id:null;
  if(method===2&&line===p.pop){current=x.node.id;popped.push(current);change={kind:"pop",node:current};}
  if(method===2&&line===p.collect){bufferIds.push(current);change={kind:"collect",node:current};}
  if([p.leftCheck,p.leftAdd,p.rightCheck,p.rightAdd].includes(line)){
   const parent=method===1?x.n.id:x.node.id,side=[p.leftCheck,p.leftAdd].includes(line)?"left":"right",child=byId.get(parent)[side];
   probe={parent,side,child,exists:child!==null,appended:line===p.leftAdd||line===p.rightAdd};
   if(probe.appended)change={kind:"enqueue",parent,child,side};
  }
  if(p.record.includes(line)){
   const direction=method===1?x.ltr:x.level%2===0,ordered=direction?[...bufferIds]:[...bufferIds].reverse();
   resultIds.push(ordered);directions.push(direction);
   lastRecord={index:result.length-1,sourceIds:[...bufferIds],ids:[...ordered],values:[...result.at(-1)],direction};
   change={kind:"record",index:result.length-1};
  }
  if(line===p.flip)change={kind:"flip"};
  if(method===1&&line===p.advance){alias=true;current=null;change={kind:"advance"};}
  const phase=line===p.guard?bi("Kiểm tra root","Check root"):line===p.empty?bi("Cây rỗng → []","Empty tree → []")
   :line===p.loop?record.branch?bi(`Tầng ${round}`,`Level ${round}`):bi("queue rỗng","queue is empty")
    :line===p.collect?bi(method===1?"queue → vals":`Thêm ${x.node.val} vào lst`,method===1?"queue → vals":`Append ${x.node.val} to lst`)
     :p.record.includes(line)?bi(`Ghi tầng ${round} ${lastRecord.direction?"→":"←"}`,`Record level ${round} ${lastRecord.direction?"→":"←"}`)
      :line===p.flip?bi(`Cờ kế tiếp ${flag?"→":"←"}`,`Next direction ${flag?"→":"←"}`)
       :probe?bi(probe.appended?`Thêm ${byId.get(probe.child).value} vào ${method===1?"nxt":"queue"}`:`Kiểm tra con ${probe.side==="left"?"trái":"phải"}`,probe.appended?`Enqueue ${byId.get(probe.child).value}`:`Check ${probe.side} child`)
        :line===p.pop?bi(`Lấy ${x.node.val} khỏi queue`,`Pop ${x.node.val} from queue`)
         :line===p.each?record.branch?bi(method===1?`n ← ${x.n.val}`:`Lượt ${x._+1}/${limit}`,method===1?`n ← ${x.n.val}`:`Iteration ${x._+1}/${limit}`):bi("Xong vòng for","For loop finished")
          :line===p.end?bi("Trả các hàng zigzag","Return zigzag rows"):bi(source[line-1].trim(),source[line-1].trim());
  const view={method,nodes,queue,nxt,alias,round,roundIds:[...roundIds],queueRoles:method===2?queue?.map(id=>roundIds.length&&!roundIds.includes(id)?"next":"current")??null:null,
   current,limit,popped:[...popped],flag,flagValue:method===1?x.ltr??null:x.level??null,rowDirection,rowLevel,
   buffer,bufferIds:bufferIds?[...bufferIds]:null,result,resultIds:copy(resultIds),directions:[...directions],recorded:resultIds.flat(),lastRecord:lastRecord?copy(lastRecord):null,probe,change,
   source:{line,text:source[line-1].trim(),timing:"after"},phase,answer:record.returning?trace.answer:null,
   scope:record.scope,locals:x,outer:record.outer,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,trace:trace.trace};
  const names=method===1?["root","res","queue","ltr","vals","nxt","n"]:["root","queue","level","result","size","lst","_","node"];
  return {arr:[],codeBlock:method,codeLines:[line],final:record.returning,title:bi(`L${line} · ${phase.vi}`,`L${line} · ${phase.en}`),note:bi("",""),vars:names.map(name=>({name,value:x[name]??(name==="root"?"None":"—"),rawValue:x[name]??null})),zigzag103View:view};
 });
 return {original:values,answer:JSON.stringify(trace.answer),steps};
}
module.exports={103:{...base,code,code2,builder,debugMode:"line-by-line",allowEmptyInput:true,
 inputLabel:bi("Cây level-order · 0–31 nút · −1000…1000 · null cho nhánh trống","Level-order tree · 0–31 nodes · −1000…1000 · null for missing children"),
 statement:bi("BFS vẫn gom trái → phải. Chiều ghi hàng vào kết quả đổi luân phiên → ← →.","BFS still collects left → right. Alternate the direction used to record each result row: → ← →."),
 approach:[bi("Cách 1: cờ ltr và hai danh sách. Cách 2: deque và chẵn/lẻ của level. Đảo giá trị trong hàng khi ghi chiều ←.","Approach 1: ltr and two frontier lists. Approach 2: deque and level parity. Reverse a row when recording direction ←.")],
 visualizationLimits:{maxNodes:31,completeTrace:true},liveArgs:input=>[{__viz_type:"binary_tree",values:parse(input).values,tree_id:"root"}]
}};
