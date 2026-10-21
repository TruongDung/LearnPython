"use strict";
const base = require("./graph")[127];
const bi = (vi,en) => ({vi,en});
const prefix = [
  "from collections import defaultdict, deque",
  "",
  "class Solution:",
  "    def ladderLength(self, beginWord, endWord, wordList):",
  "        if endWord not in wordList:",
  "            return 0",
  "        buckets = defaultdict(list)",
  "        for word in wordList:",
  "            for i in range(len(word)):",
  "                pattern = word[:i] + '*' + word[i+1:]",
  "                buckets[pattern].append(word)",
];
const code = [...prefix,
  "        queue = deque([(beginWord, 1)])",
  "        seen = {beginWord}",
  "        while queue:",
  "            word, depth = queue.popleft()",
  "            if word == endWord:",
  "                return depth",
  "            for i in range(len(word)):",
  "                pattern = word[:i] + '*' + word[i+1:]",
  "                for nxt in buckets[pattern]:",
  "                    if nxt not in seen:",
  "                        seen.add(nxt)",
  "                        queue.append((nxt, depth + 1))",
  "                buckets[pattern].clear()",
  "        return 0",
];
const code2 = [...prefix,
  "        front, back = [beginWord], [endWord]",
  "        dist_front, dist_back = {beginWord: 1}, {endWord: 1}",
  "        while front and back:",
  "            if len(front) > len(back):",
  "                front, back = back, front",
  "                dist_front, dist_back = dist_back, dist_front",
  "            following = []",
  "            for word in front:",
  "                for i in range(len(word)):",
  "                    pattern = word[:i] + '*' + word[i+1:]",
  "                    for nxt in buckets[pattern]:",
  "                        if nxt in dist_back:",
  "                            return dist_front[word] + dist_back[nxt]",
  "                        if nxt not in dist_front:",
  "                            dist_front[nxt] = dist_front[word] + 1",
  "                            following.append(nxt)",
  "            front = following",
  "        return 0",
];
function parse(input,params = {}) {
  const begin = params.beginWord === undefined ? "hit" : params.beginWord, end = params.endWord === undefined ? "cog" : params.endWord;
  if (typeof begin !== "string" || typeof end !== "string" || !/^[a-z]{1,10}$/.test(begin) || !/^[a-z]{1,10}$/.test(end) || begin.length !== end.length || begin === end) throw new Error("beginWord và endWord phải khác nhau, cùng độ dài 1–10 chữ a–z / use distinct words of equal length, 1–10 lowercase letters.");
  let words = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.startsWith("[")) { try { words = JSON.parse(text); } catch { throw new Error("wordList: JSON không hợp lệ / invalid JSON."); } }
    else words = text ? text.split(",").map(w=>w.trim()) : [];
  }
  if (!Array.isArray(words) || words.length > 5000 || words.some(w=>typeof w !== "string" || !/^[a-z]+$/.test(w) || w.length !== begin.length) || new Set(words).size !== words.length) throw new Error("wordList: tối đa 5000 từ không trùng, cùng độ dài với beginWord, chỉ chữ a–z / up to 5000 unique lowercase words, same length as beginWord.");
  return [begin,end,[...words]];
}
const clone = value => value instanceof Map ? Object.fromEntries([...value].map(([k,v])=>[k,clone(v)])) : value instanceof Set ? [...value].sort() : Array.isArray(value) ? value.map(clone) : value && typeof value === "object" ? {...value} : value;
function oneLetter(a,b) { let count=0; for(let i=0;i<a.length;i++) if(a[i]!==b[i]) count++; return count===1; }
function makeGraph(begin,end,words,path,summary) {
  const chosen = summary ? [...new Set([begin,...path.slice(0,7),...path.slice(-7),...words.slice(0,16),end])].slice(0,17) : [begin,...words.filter(w=>w!==begin)];
  if (!chosen.includes(end)) chosen.push(end);
  const legal = new Set([begin,...words]), edges=[];
  for(let i=0;i<chosen.length;i++) for(let j=i+1;j<chosen.length;j++) if(legal.has(chosen[i]) && legal.has(chosen[j]) && oneLetter(chosen[i],chosen[j])) edges.push([chosen[i],chosen[j]]);
  return {nodes:chosen,edges,missingEnd:!words.includes(end),total:new Set([begin,...words,end]).size};
}
function build(input,params = {},approach = 1) {
  const [begin,end,words] = parse(input,params), detailed=words.length<=12 && begin.length<=5, source=approach===2?code2:code;
  const locals={self:{},beginWord:begin,endWord:end,wordList:words}, steps=[];
  const parentsStart=new Map(),parentsEnd=new Map();
  let distStart=new Map(),distEnd=new Map(),frontOrigin="start",phase="prepare",current=null,expanded=[],meeting=null,answer=null,path=[];
  const graph=detailed?makeGraph(begin,end,words,[],false):null;
  const bucket = pattern => {if(!locals.buckets.has(pattern)) locals.buckets.set(pattern,[]);return locals.buckets.get(pattern);};
  function trace(line,event,title,options={}) {
    if(!detailed) return;
    const final=answer!==null;
    steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),codeLines:[line],codeBlock:approach,final,arr:[],highlight:[],mark:[],note:bi("",""),
      vars:Object.entries(locals).map(([name,value])=>({name,rawValue:clone(value),value:name==="self"?"Solution":clone(value)})),
      ladder127View:{mode:"trace",approach,phase,event,line,source:source[line-1].trim(),begin,end,graph,word:current,
        candidate:phase==="search" && ["candidate","meet-check","discover","enqueue","distance"].includes(event)?locals.nxt??null:null,
        pattern:locals.pattern??null,bucket:locals.pattern && locals.buckets?.has(locals.pattern)?[...locals.buckets.get(locals.pattern)]:[],
        queue:clone(locals.queue??[]),front:clone(locals.front??[]),back:clone(locals.back??[]),following:clone(locals.following??[]),frontOrigin,
        seen:clone(locals.seen??new Set()),distStart:clone(distStart),distEnd:clone(distEnd),expanded:[...expanded],
        treeStart:clone(parentsStart),treeEnd:clone(parentsEnd),check:options.check??null,meeting:meeting&&{...meeting},answer,path:[...path]}
    });
  }
  function loop(name,values,line,event,body) {
    for(const value of values) {locals[name]=value;trace(line,event,bi(`${name} = ${value}`,`${name} = ${value}`));if(body(value)) return true;}
    trace(line,event+"-end",bi(`Hết vòng ${name}`,`${name} loop ends`));return false;
  }
  function fromRoot(word,parents) {const result=[word];while(parents.has(word)){word=parents.get(word);result.push(word);}return result.reverse();}
  function finish(value,line,resultPath=[]) {
    answer=value;path=resultPath;trace(line,"return",bi(value?`${value} từ · ${value-1} lần đổi chữ` : "Không có đường → 0",value?`${value} words · ${value-1} letter changes`:"No path → 0"));
    if(!detailed) steps.push({title:bi("Kết quả · tính đủ từ điển", "Result · full dictionary computed"),codeLines:[],codeBlock:approach,final:true,vars:[],arr:[],highlight:[],mark:[],note:bi("",""),
      ladder127View:{mode:"summary",approach,phase:"done",event:"return",line:null,source:"",begin,end,graph:makeGraph(begin,end,words,path,true),word:null,candidate:null,pattern:null,bucket:[],queue:[],front:[],back:[],following:[],frontOrigin:"start",seen:[],distStart:{},distEnd:{},expanded:[],treeStart:{},treeEnd:{},check:null,meeting:null,answer,path}});
    return {beginWord:begin,endWord:end,answer,steps};
  }
  const missing=!words.includes(end);trace(5,"end-check",bi(missing?"Từ đích không có trong từ điển":"Từ đích có trong từ điển",missing?"Target missing from dictionary":"Target is in dictionary"),{check:missing});
  if(missing) return finish(0,6);
  phase="build";locals.buckets=new Map();trace(7,"buckets",bi("Nhóm các từ chung mẫu *", "Group words sharing a * pattern"));
  loop("word",words,8,"build-word",word=>{loop("i",Array.from({length:word.length},(_,i)=>i),9,"build-index",i=>{
    locals.pattern=word.slice(0,i)+"*"+word.slice(i+1);trace(10,"pattern",bi(`${word} → ${locals.pattern}`,`${word} → ${locals.pattern}`));
    bucket(locals.pattern).push(word);trace(11,"bucket-add",bi(`Thêm ${word}`,`Add ${word}`));
  });});
  phase="search";
  if(approach===1) {
    locals.queue=[[begin,1]];distStart.set(begin,1);trace(12,"queue-init",bi("Bắt đầu từ 1 từ", "Start with 1 word"));
    locals.seen=new Set([begin]);trace(13,"seen-init",bi("Đánh dấu từ đầu", "Mark the start word"));
    while(true) {
      const active=locals.queue.length>0;trace(14,"while",bi(active?"Queue còn từ":"Queue rỗng",active?"Queue has words":"Queue is empty"),{check:active});if(!active) break;
      [locals.word,locals.depth]=locals.queue.shift();current=locals.word;expanded.push(current);trace(15,"pop",bi(`Lấy ${current} · ${locals.depth} từ`,`Pop ${current} · ${locals.depth} words`));
      const found=current===end;trace(16,"target",bi(found?"Đã tới đích":"Chưa tới đích",found?"Target reached":"Not at target yet"),{check:found});
      if(found) return finish(locals.depth,17,fromRoot(end,parentsStart));
      loop("i",Array.from({length:current.length},(_,i)=>i),18,"search-index",i=>{
        locals.pattern=current.slice(0,i)+"*"+current.slice(i+1);trace(19,"pattern",bi(`Tìm nhóm ${locals.pattern}`,`Look up ${locals.pattern}`));
        loop("nxt",bucket(locals.pattern),20,"neighbor",nxt=>{
          const fresh=!locals.seen.has(nxt);trace(21,"candidate",bi(fresh?`${nxt} chưa thăm`:`${nxt} đã thăm`,fresh?`${nxt} is new`:`${nxt} already seen`),{check:fresh});
          if(fresh){locals.seen.add(nxt);trace(22,"discover",bi(`Đánh dấu ${nxt}`,`Mark ${nxt}`));locals.queue.push([nxt,locals.depth+1]);parentsStart.set(nxt,current);distStart.set(nxt,locals.depth+1);trace(23,"enqueue",bi(`Thêm ${nxt} · ${locals.depth+1} từ`,`Queue ${nxt} · ${locals.depth+1} words`));}
        });
        bucket(locals.pattern).length=0;trace(24,"clear",bi("Xóa nhóm đã xét", "Clear the processed group"));
      });
    }
    return finish(0,25);
  }
  locals.front=[begin];locals.back=[end];trace(12,"front-init",bi("Hai đầu: begin ↔ end", "Two ends: begin ↔ end"));
  locals.dist_front=new Map([[begin,1]]);locals.dist_back=new Map([[end,1]]);distStart=locals.dist_front;distEnd=locals.dist_back;trace(13,"dist-init",bi("Mỗi đầu bắt đầu với 1 từ", "Each end starts with 1 word"));
  while(true) {
    const active=locals.front.length>0 && locals.back.length>0;trace(14,"while",bi(active?"Cả hai phía còn từ":"Một phía đã hết từ",active?"Both frontiers have words":"A frontier is empty"),{check:active});if(!active) break;
    const swap=locals.front.length>locals.back.length;trace(15,"size-check",bi(swap?"Đổi phía → mở phía nhỏ hơn":"Mở phía front",swap?"Switch to the smaller frontier":"Expand front"),{check:swap});
    if(swap){[locals.front,locals.back]=[locals.back,locals.front];frontOrigin=frontOrigin==="start"?"end":"start";trace(16,"swap-front",bi("Đổi hai frontier", "Swap frontiers"));[locals.dist_front,locals.dist_back]=[locals.dist_back,locals.dist_front];trace(17,"swap-distance",bi("Đổi hai bảng khoảng cách", "Swap distance maps"));}
    locals.following=[];trace(18,"following",bi("Tầng mới rỗng", "Next layer starts empty"));
    const met=loop("word",locals.front,19,"expand-word",word=>{
      current=word;expanded.push(word);
      return loop("i",Array.from({length:word.length},(_,i)=>i),20,"search-index",i=>{
        locals.pattern=word.slice(0,i)+"*"+word.slice(i+1);trace(21,"pattern",bi(`Tìm nhóm ${locals.pattern}`,`Look up ${locals.pattern}`));
        return loop("nxt",bucket(locals.pattern),22,"neighbor",nxt=>{
          const found=locals.dist_back.has(nxt);if(found) meeting={from:word,to:nxt,origin:frontOrigin};trace(23,"meet-check",bi(found?"Hai phía gặp nhau!":"Chưa gặp phía còn lại",found?"The searches meet!":"Not in the other search yet"),{check:found});
          if(found) {const startWord=frontOrigin==="start"?word:nxt,endWord=frontOrigin==="start"?nxt:word;finish(locals.dist_front.get(word)+locals.dist_back.get(nxt),24,[...fromRoot(startWord,parentsStart),...fromRoot(endWord,parentsEnd).reverse()]);return true;}
          const fresh=!locals.dist_front.has(nxt);trace(25,"candidate",bi(fresh?`${nxt} chưa thăm ở phía này`:`${nxt} đã thăm`,fresh?`${nxt} is new on this side`:`${nxt} already seen`),{check:fresh});
          if(fresh){locals.dist_front.set(nxt,locals.dist_front.get(word)+1);(frontOrigin==="start"?parentsStart:parentsEnd).set(nxt,word);trace(26,"distance",bi(`${nxt}: ${locals.dist_front.get(nxt)} từ`,`${nxt}: ${locals.dist_front.get(nxt)} words`));locals.following.push(nxt);trace(27,"enqueue",bi(`Thêm ${nxt} vào tầng mới`,`Add ${nxt} to next layer`));}
        });
      });
    });
    if(met) return {beginWord:begin,endWord:end,answer,steps};
    locals.front=locals.following;trace(28,"advance",bi("Chuyển sang tầng mới", "Advance to the next layer"));
  }
  return finish(0,29);
}
module.exports = {127:{...base,code,code2,builder:(input,params)=>build(input,params,1),builder2:(input,params)=>build(input,params,2),debugMode:"line-by-line",allowEmptyInput:true,
  titleVi:bi("Mỗi cạnh đổi 1 chữ · BFS tìm đường ít từ nhất", "One letter per edge · BFS finds the fewest words"),
  statement:bi("Nối hai từ khi khác đúng 1 chữ. Tìm đường ngắn nhất từ beginWord đến endWord; đếm cả hai đầu. Không có đường → 0.", "Connect words differing in exactly one letter. Find the shortest beginWord → endWord path; count both ends. No path → 0."),
  approach:[bi("Cách 1: BFS từng tầng từ beginWord.", "Approach 1: BFS by layers from beginWord."),bi("Cách 2: BFS từ hai đầu, mở phía ít từ hơn.", "Approach 2: BFS from both ends, expand the smaller frontier."),bi("Chung mẫu * → chỉ khác vị trí có dấu *.", "Shared * pattern → only the wildcard position can differ.")],
  complexity:{time:"O(N·L²)",space:"O(N·L²)",note:bi("N từ, L chữ/từ; bộ nhớ tính cả chuỗi mẫu. Debug ≤12 từ, L≤5. Đầu vào lớn vẫn tính đủ; hình xem trước ≤18 từ.", "N words, L letters each; space includes pattern strings. Full debug for ≤12 words, L≤5. Larger inputs compute fully and preview ≤18 words.")},
  liveArgs:(input,params)=>parse(input,params)
}};
