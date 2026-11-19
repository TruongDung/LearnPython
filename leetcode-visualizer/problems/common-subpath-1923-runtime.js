'use strict';
const bi=(vi,en)=>({vi,en});
const ROOT_KEYS=['n','paths','ordered','base','mod1','mod2','limit','power1','power2','length','prefixes','path','first','second','city','value','low','high','middle'];
const EXISTS_KEYS=['length','starts_by_hash','start','key','common','path_index','present','representative_start','representative','exact_everywhere','found','same_hash','same_slice'];
const HASH_KEYS=['path_index','start','length','first','second','end','hash1','hash2'];
const pair=key=>key.split(':').map(Number),compare=(a,b)=>pair(a)[0]-pair(b)[0]||pair(a)[1]-pair(b)[1];
const mod=(value,m)=>Number((value%BigInt(m)+BigInt(m))%BigInt(m));
function serialize(value){if(value instanceof Set)return [...value].sort(compare).map(pair);if(value instanceof Map)return [...value].sort(([a],[b])=>compare(a,b)).map(([key,starts])=>[pair(key),[...starts]]);if(Array.isArray(value))return value.map(serialize);return value;}
function buildCommon1923({n,paths},source){
  const total=paths.reduce((sum,path)=>sum+path.length,0),detailed=total<=24,steps=[],attempts=[];
  const r=Object.fromEntries(ROOT_KEYS.map(key=>[key,null]));r.n=n;r.paths=paths;
  const root={fn:'longestCommonSubpath',line:5,keys:ROOT_KEYS,locals:r},stack=[root];
  let orderedIds=paths.map((_,i)=>i),prepIndex=0,prepCity=0,e=null,activeWindow=null,flow=null,aliases=new Map(),verified=new Map(),lastWitness=null,bestWitness=null,result=null,probeSerial=0;
  function frameCopy(frame){const locals={};for(const key of frame.keys){const value=frame.locals[key];locals[key]=!detailed&&value!==null&&typeof value==='object'?null:key==='key'&&value!==null?pair(value):serialize(value);}return{fn:frame.fn,line:frame.line,locals};}
  function alias(key){if(!aliases.has(key))aliases.set(key,`H${aliases.size+1}`);return aliases.get(key);}
  function token(key){return{id:alias(key),hash:pair(key)};}
  function emit(frame,line,{pending=null,condition=null,force=false}={}){
    frame.line=line;
    if(!detailed&&!force)return;
    const final=frame===root&&line===77,ordered=r.ordered||paths;
    const active=activeWindow?.pathIndex??prepIndex;
    const indices=ordered.length<=5?ordered.map((_,i)=>i):[...new Set([0,1,active,ordered.length-1].filter(i=>i>=0&&i<ordered.length))].sort((a,b)=>a-b);
    const rows=indices.map(index=>{const path=ordered[index],start=final?bestWitness?.starts[index]:verified.get(index),length=final?r.low:e?.length||0;
      const focus=activeWindow?.pathIndex===index?activeWindow.start:start??0;
      const cells=path.length<=14?path.map((value,i)=>({index:i,value})):[...new Set([0,1,...Array.from({length:7},(_,i)=>focus-1+i),path.length-2,path.length-1].filter(i=>i>=0&&i<path.length))].sort((a,b)=>a-b).map(i=>({index:i,value:path[i]}));
      return{order:index,id:orderedIds[index],length:path.length,cells,omitted:path.length-cells.length,matchStart:start??null,matchLength:start===null||start===undefined?0:length,activeStart:!final&&activeWindow?.pathIndex===index?activeWindow.start:null,activeLength:!final&&activeWindow?.pathIndex===index?activeWindow.length:0};});
    const candidates=e?.starts_by_hash?[...e.starts_by_hash].slice(0,8).map(([key,starts])=>({...token(key),start:starts[0],values:ordered[0].slice(starts[0],starts[0]+Math.min(e.length,8)),length:e.length,alive:e.common===null?null:e.common.has(key),seen:e.present?.has(key)??false,verified:verified.size===ordered.length&&e.key===key})):[];
    const frames=stack.map(frameCopy);
    const title=final?bi('Đoạn chung dài nhất','Longest common subpath'):bi(frame.fn==='hash_at'?'Băm một cửa sổ':frame.fn==='exists'?'Giữ đoạn xuất hiện ở mọi đường':'Tìm độ dài lớn nhất',frame.fn==='hash_at'?'Hash one window':frame.fn==='exists'?'Keep windows shared by every path':'Find the longest length');
    steps.push({title:bi(`Dòng ${line}: ${title.vi}`,`Line ${line}: ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],codeBlock:1,codeLines:[line],debugLine:line,final,
      vars:frames.at(-1).locals?Object.entries(frames.at(-1).locals).filter(([,value])=>value!==null&&typeof value!=='object').map(([name,value])=>({name,value})):[],
      common1923View:{line,source:source[line-1],fn:frame.fn,timing:'before',detailed,total,pathCount:paths.length,shortest:r.limit,frames,pythonLocals:frames.at(-1).locals,pending,condition,
        low:r.low,high:r.high,middle:r.middle,probeSerial,result,attempts:attempts.map(item=>({...item})),rows,
        activeWindow:activeWindow?{...activeWindow,values:ordered[activeWindow.pathIndex].slice(activeWindow.start,activeWindow.start+Math.min(activeWindow.length,10))}:null,
        candidates,hiddenCandidates:e?.starts_by_hash?Math.max(0,e.starts_by_hash.size-candidates.length):0,
        commonCount:e?.common?.size??null,presentCount:e?.present?.size??null,
        flow:flow?{...flow,before:flow.before.slice(0,8).map(token),present:flow.present.slice(0,8).map(token),after:flow.after.slice(0,8).map(token)}:null,
        answer:final?r.low:null,witness:final?bestWitness:null,
      }});
  }
  const E=(line,options={})=>emit(root,line,options);
  E(5,{force:true});orderedIds=paths.map((_,i)=>i).sort((a,b)=>paths[a].length-paths[b].length||a-b);r.ordered=orderedIds.map(i=>paths[i]);
  E(6,{force:true});r.base=100003;r.mod1=1000000007;r.mod2=1000000009;
  E(7,{force:true});r.limit=r.ordered[0].length;
  E(8,{force:true,pending:{target:'power1',kind:'allocate',after:r.limit+1}});r.power1=Array(r.limit+1).fill(1);
  E(9,{force:true,pending:{target:'power2',kind:'allocate',after:r.limit+1}});r.power2=Array(r.limit+1).fill(1);
  E(10);
  for(let length=1;length<=r.limit;length++){r.length=length;E(11);r.power1[length]=r.power1[length-1]*r.base%r.mod1;E(12);r.power2[length]=r.power2[length-1]*r.base%r.mod2;E(10);}
  E(14,{force:true});r.prefixes=[];E(15);
  for(prepIndex=0;prepIndex<r.ordered.length;prepIndex++){
    r.path=r.ordered[prepIndex];E(16);r.first=[0];E(17);r.second=[0];E(18);
    for(prepCity=0;prepCity<r.path.length;prepCity++){r.city=r.path[prepCity];E(19);r.value=r.city+1;E(20);r.first.push((r.first.at(-1)*r.base+r.value)%r.mod1);E(21);r.second.push((r.second.at(-1)*r.base+r.value)%r.mod2);E(18);}
    E(22);r.prefixes.push([r.first,r.second]);E(15);
  }
  E(24,{force:true});
  function hashAt(pathIndex,start,length,sampled){
    activeWindow={pathIndex,start,length};
    const h={path_index:pathIndex,start,length,first:null,second:null,end:null,hash1:null,hash2:null};
    const frame={fn:'hash_at',line:25,keys:HASH_KEYS,locals:h};stack.push(frame);
    const H=line=>emit(frame,line,{force:sampled});
    H(25);[h.first,h.second]=r.prefixes[pathIndex];H(26);h.end=start+length;
    H(27);h.hash1=mod(BigInt(h.first[h.end])-BigInt(h.first[start])*BigInt(r.power1[length]),r.mod1);
    H(28);h.hash2=mod(BigInt(h.second[h.end])-BigInt(h.second[start])*BigInt(r.power2[length]),r.mod2);
    H(29);stack.pop();return `${h.hash1}:${h.hash2}`;
  }
  E(31,{force:true});
  function exists(length){
    e=Object.fromEntries(EXISTS_KEYS.map(key=>[key,null]));e.length=length;flow=null;aliases=new Map();verified=new Map();activeWindow=null;
    const frame={fn:'exists',line:32,keys:EXISTS_KEYS,locals:e};stack.push(frame);
    const X=(line,options={})=>emit(frame,line,options);
    const finish=value=>{stack.pop();return value;};
    X(32,{condition:length===0,force:true});if(length===0){X(33,{force:true});return finish(true);}
    X(34,{force:true});e.starts_by_hash=new Map();X(35);
    for(let start=0;start+length<=r.ordered[0].length;start++){
      e.start=start;const sample=!detailed&&start===0;
      X(36,{force:sample});const key=hashAt(0,start,length,sample);e.key=key;alias(key);
      X(37,{force:sample});if(!e.starts_by_hash.has(key))e.starts_by_hash.set(key,[]);e.starts_by_hash.get(key).push(start);X(35);
    }
    X(38,{force:true});e.common=new Set(e.starts_by_hash.keys());X(40);
    for(let pathIndex=1;pathIndex<r.ordered.length;pathIndex++){
      e.path_index=pathIndex;const show=!detailed&&(pathIndex===1||pathIndex===r.ordered.length-1);
      X(41,{force:show});e.present=new Set();X(42);
      for(let start=0;start+length<=r.ordered[pathIndex].length;start++){
        e.start=start;const sample=show&&start===0;X(43,{force:sample});e.key=hashAt(pathIndex,start,length,sample);
        X(44,{condition:e.common.has(e.key),force:sample});if(e.common.has(e.key)){X(45,{force:sample});e.present.add(e.key);}X(42);
      }
      const next=new Set([...e.common].filter(key=>e.present.has(key)));
      flow={before:[...e.common],present:[...e.present],after:[...next],beforeCount:e.common.size,presentCount:e.present.size,afterCount:next.size,pathIndex,timing:'pending'};
      X(46,{force:show||next.size===0,pending:{target:'common',before:e.common.size,after:next.size}});e.common=next;flow.timing='written';
      X(47,{condition:e.common.size===0,force:show||next.size===0});if(!e.common.size){X(48,{force:true});return finish(false);}X(40);
    }
    X(51,{force:true});
    for(const key of [...e.common].sort(compare)){
      e.key=key;X(52);
      for(const representativeStart of e.starts_by_hash.get(key)){
        e.representative_start=representativeStart;X(53);e.representative=r.ordered[0].slice(representativeStart,representativeStart+length);verified=new Map([[0,representativeStart]]);
        X(54);e.exact_everywhere=true;X(55);
        for(let pathIndex=1;pathIndex<r.ordered.length;pathIndex++){
          e.path_index=pathIndex;const show=!detailed&&(pathIndex===1||pathIndex===r.ordered.length-1);
          X(56);e.found=false;X(57);
          for(let start=0;start+length<=r.ordered[pathIndex].length;start++){
            e.start=start;const sample=show&&start===0;X(58,{force:sample});e.same_hash=hashAt(pathIndex,start,length,sample)===key;
            X(59,{force:sample});e.same_slice=e.same_hash&&e.representative.every((city,i)=>city===r.ordered[pathIndex][start+i]);
            X(60,{condition:e.same_hash&&e.same_slice,force:sample});if(e.same_hash&&e.same_slice){X(61,{force:show});e.found=true;verified.set(pathIndex,start);X(62);break;}X(57);
          }
          X(63,{condition:!e.found,force:show});if(!e.found){X(64,{force:true});e.exact_everywhere=false;X(65);break;}X(55);
        }
        X(66,{condition:e.exact_everywhere});if(e.exact_everywhere){lastWitness={length,values:e.representative.slice(0,12),omitted:Math.max(0,length-12),starts:r.ordered.map((_,i)=>verified.get(i)),orderedIds:[...orderedIds]};X(67,{force:true});return finish(true);}X(52);
      }
      X(51);
    }
    X(68,{force:true});return finish(false);
  }
  E(70,{force:true,pending:{target:'low, high',after:[0,r.limit]}});r.low=0;r.high=r.limit;
  E(71,{force:true,condition:r.low<r.high});
  while(r.low<r.high){
    const nextMiddle=Math.floor((r.low+r.high+1)/2);E(72,{force:true,pending:{target:'middle',before:r.middle,after:nextMiddle}});r.middle=nextMiddle;probeSerial++;result=null;
    E(73,{force:true});result=exists(r.middle);const previousLow=r.low,previousHigh=r.high;
    if(result){E(74,{force:true,pending:{target:'low',before:r.low,after:r.middle}});r.low=r.middle;bestWitness=lastWitness;}
    else{E(76,{force:true,pending:{target:'high',before:r.high,after:r.middle-1}});r.high=r.middle-1;}
    attempts.push({length:r.middle,ok:result,low:previousLow,high:previousHigh,nextLow:r.low,nextHigh:r.high});E(71,{force:true,condition:r.low<r.high});
  }
  E(77,{force:true,pending:{target:'return',after:r.low}});
  return{original:{n,paths:paths.map(path=>[...path])},answer:r.low,witness:bestWitness,steps};
}
module.exports={buildCommon1923,ROOT_KEYS,EXISTS_KEYS,HASH_KEYS};
