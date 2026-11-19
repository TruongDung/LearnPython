'use strict';
const base=require('./dp')[943],bi=(vi,en)=>({vi,en});
const CODE=[
  'class Solution:',
  '    def shortestSuperstring(self, words):',
  '        n = len(words)',
  '        overlap = [[0] * n for _ in range(n)]',
  '        for a in range(n):',
  '            for b in range(n):',
  '                if a == b:',
  '                    continue',
  '                for k in range(min(len(words[a]), len(words[b])), -1, -1):',
  '                    if words[a].endswith(words[b][:k]):',
  '                        overlap[a][b] = k',
  '                        break',
  '        dp = [[None] * n for _ in range(1 << n)]',
  '        for last in range(n):',
  '            dp[1 << last][last] = words[last]',
  '        for mask in range(1, 1 << n):',
  '            for last in range(n):',
  '                if dp[mask][last] is None:',
  '                    continue',
  '                for nxt in range(n):',
  '                    if mask & (1 << nxt):',
  '                        continue',
  '                    candidate = dp[mask][last] + words[nxt][overlap[last][nxt]:]',
  '                    new_mask = mask | (1 << nxt)',
  '                    if dp[new_mask][nxt] is None or len(candidate) < len(dp[new_mask][nxt]):',
  '                        dp[new_mask][nxt] = candidate',
  '        return min((text for text in dp[-1] if text is not None), key=len)',
];
function parse(input){
  const raw=typeof input==='string'?input.split(','):input;
  if(!Array.isArray(raw)||raw.some(word=>typeof word!=='string'))throw new Error('943: words cần là các từ a–z, cách nhau dấu phẩy. / Use comma-separated lowercase words.');
  const rawWords=raw.map(word=>word.trim()).filter(Boolean);
  if(!rawWords.length||rawWords.length>12||rawWords.some(word=>!/^[a-z]+$/.test(word)||word.length>20))throw new Error('943: dùng 1..12 từ a–z, mỗi từ dài 1..20. / Use 1..12 lowercase words of length 1..20.');
  const unique=[...new Set(rawWords)],words=unique.filter((word,i)=>!unique.some((other,j)=>i!==j&&other.includes(word)));
  return{words,rawWords};
}
function buildSteps(input){
  const {words,rawWords}=parse(input),n=words.length,full=(1<<n)-1,detailed=n<=3,steps=[];
  const py={n:null,a:null,b:null,k:null,last:null,mask:null,nxt:null,candidate:null,new_mask:null};
  let overlap=null,dp=null,parents=null,probe=null,merge=null,overlapFrames=0,dpFrames=0,answer=null,placements=null;
  const phaseNames={init:bi('Chuẩn bị từ','Prepare words'),overlap:bi('Chồng phần trùng','Match suffix and prefix'),seed:bi('Bắt đầu từ một từ','Start with one word'),dp:bi('Thử nối thêm từ','Try appending a word'),done:bi('Chuỗi ngắn nhất','Shortest superstring')};
  const clone=matrix=>matrix?matrix.map(row=>[...row]):null;
  function emit(line,phase,pending=null){
    if(!detailed){
      if(phase==='overlap'&&overlapFrames++>=70)return;
      if(phase==='dp'&&dpFrames++>=140&&!(py.mask===full-1&&[23,24,25,26].includes(line)))return;
    }
    const final=phase==='done';
    const rowMask=final?full:merge?merge.toMask:py.mask??(py.last!==null&&phase==='seed'?1<<py.last:0);
    const event=phaseNames[phase];
    const pythonLocals={words:[...words],...py,overlap:detailed?clone(overlap):null,dp:detailed?clone(dp):null};
    steps.push({title:bi(`L${line} · ${event.vi}`,`L${line} · ${event.en}`),note:bi('',''),codeLines:[line],codeBlock:1,debugLine:line,final,arr:[],highlight:[],mark:[],
      vars:Object.entries(py).filter(([,value])=>value!==null).map(([name,value])=>({name,value})),
      shortest943PictureView:{n,words:[...words],rawWords:[...rawWords],line,source:CODE[line-1],timing:'before',phase,pending,detailed,
        pythonLocals,overlap:clone(overlap),probe:probe?{...probe}:null,merge:merge?{...merge}:null,rowMask,
        row:dp?dp[rowMask].map((text,last)=>({last,text,length:text?.length??null})):[],
        prefix:dp&&py.mask!==null&&py.last!==null?dp[py.mask][py.last]:null,
        answer:final?answer:null,placements:final?placements.map(item=>({...item})):null,
      }});
  }
  const write=(target,before,after,kind='write')=>({target,before,after,kind});
  emit(3,'init',write('n',null,n));py.n=n;
  emit(4,'init',write('overlap',null,`${n} × ${n}`));
  // Python 3.12+ traces inlined comprehensions on this same source line.
  if(detailed)for(let row=0;row<n;row++)emit(4,'init',{...write('overlap',null,`${n} × ${n}`),row,totalRows:n});
  overlap=Array.from({length:n},()=>Array(n).fill(0));
  for(let a=0;a<n;a++){
    emit(5,'overlap',write('a',py.a,a));py.a=a;
    for(let b=0;b<n;b++){
      emit(6,'overlap',write('b',py.b,b));py.b=b;probe=null;
      emit(7,'overlap',{target:'a == b',after:a===b,kind:'condition'});
      if(a===b){emit(8,'overlap');continue;}
      for(let k=Math.min(words[a].length,words[b].length);k>=0;k--){
        emit(9,'overlap',write('k',py.k,k));py.k=k;
        const matched=words[a].endsWith(words[b].slice(0,k));probe={a,b,k,matched};
        emit(10,'overlap',{target:'suffix == prefix',after:matched,kind:'condition'});
        if(matched){emit(11,'overlap',write(`overlap[${a}][${b}]`,overlap[a][b],k));overlap[a][b]=k;emit(12,'overlap');break;}
      }
    }
    emit(6,'overlap');
  }
  emit(5,'overlap');probe=null;
  emit(13,'seed',write('dp',null,`${1<<n} × ${n}`));
  if(detailed)for(let row=0;row<(1<<n);row++)emit(13,'seed',{...write('dp',null,`${1<<n} × ${n}`),row,totalRows:1<<n});
  dp=Array.from({length:1<<n},()=>Array(n).fill(null));parents=Array.from({length:1<<n},()=>Array(n).fill(null));
  for(let last=0;last<n;last++){
    emit(14,'seed',write('last',py.last,last));py.last=last;
    emit(15,'seed',write(`dp[${1<<last}][${last}]`,null,words[last]));dp[1<<last][last]=words[last];
  }
  emit(14,'seed');
  for(let mask=1;mask<=full;mask++){
    emit(16,'dp',write('mask',py.mask,mask));py.mask=mask;merge=null;
    for(let last=0;last<n;last++){
      emit(17,'dp',write('last',py.last,last));py.last=last;merge=null;
      const empty=dp[mask][last]===null;
      emit(18,'dp',{target:`dp[${mask}][${last}] is None`,after:empty,kind:'condition'});
      if(empty){emit(19,'dp');continue;}
      for(let nxt=0;nxt<n;nxt++){
        emit(20,'dp',write('nxt',py.nxt,nxt));py.nxt=nxt;merge=null;
        const used=Boolean(mask&(1<<nxt));
        emit(21,'dp',{target:`${mask} & (1 << ${nxt})`,after:used,kind:'condition'});
        if(used){emit(22,'dp');continue;}
        const k=overlap[last][nxt],toMask=mask|(1<<nxt),prefix=dp[mask][last],suffix=words[nxt].slice(k),candidate=prefix+suffix;
        merge={a:last,b:nxt,k,prefix,suffix,candidate,fromMask:mask,toMask,old:dp[toMask][nxt],status:'draft'};
        emit(23,'dp',write('candidate',py.candidate,candidate));py.candidate=candidate;
        emit(24,'dp',write('new_mask',py.new_mask,toMask));py.new_mask=toMask;
        const improve=dp[toMask][nxt]===null||candidate.length<dp[toMask][nxt].length;
        emit(25,'dp',{target:'candidate shorter?',after:improve,kind:'condition'});
        if(improve){emit(26,'dp',write(`dp[${toMask}][${nxt}]`,dp[toMask][nxt],candidate));dp[toMask][nxt]=candidate;parents[toMask][nxt]=last;merge.status='written';}
        else merge.status='kept';
      }
      emit(20,'dp');
    }
    emit(17,'dp');
  }
  emit(16,'dp');
  let last=0;for(let i=1;i<n;i++)if(dp[full][i].length<dp[full][last].length)last=i;
  answer=dp[full][last];const order=[];let mask=full;
  while(last!==null){order.unshift(last);const prev=parents[mask][last];mask^=1<<last;last=prev;}
  placements=[];let length=0,previous=null;
  for(const index of order){const k=previous===null?0:overlap[previous][index];placements.push({index,word:words[index],start:length-k,overlap:k});length+=words[index].length-k;previous=index;}
  merge=null;emit(27,'done',{target:'return',after:answer,kind:'return'});
  return {original:rawWords,answer,order,placements,steps};
}
module.exports={943:{...base,builder:buildSteps,defaultInput:'cat,atg,tgc',debugMode:'line',code:CODE,liveArgs:input=>[parse(input).words],
  approach:[bi('Chồng đuôi từ trước lên đầu từ sau: cat + atg → catg.','Overlap the suffix with the next prefix: cat + atg → catg.'),bi('Chỉ thêm ký tự mới. DP giữ chuỗi ngắn nhất cho cùng tập từ và cùng từ cuối.','Append only new letters. DP keeps the shortest string for the same word set and final word.')],
  complexity:{time:'O(n²·2^n·S + n²·L²)',space:'O(n·2^n·S)',note:bi('S = tổng độ dài các từ; L = độ dài từ dài nhất.','S = total word length; L = longest word length.')},
  limits:{maxWords:12,maxWordLength:20},
}};
