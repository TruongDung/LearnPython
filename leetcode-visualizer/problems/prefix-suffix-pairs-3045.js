'use strict';
const base=require('./hard-trie-3045')[3045];
const bi=(vi,en)=>({vi,en});
const CODE=[
  'from typing import List',
  '',
  'class Solution:',
  '    def countPrefixSuffixPairs(self, words: List[str]) -> int:',
  '        children = [{}]',
  '        terminal = [0]',
  '        answer = 0',
  '        for j, word in enumerate(words):',
  '            node = 0',
  '            for d in range(len(word)):',
  '                pair = (word[d], word[-1 - d])',
  '                if pair not in children[node]:',
  '                    break',
  '                node = children[node][pair]',
  '                answer += terminal[node]',
  '            node = 0',
  '            for d in range(len(word)):',
  '                pair = (word[d], word[-1 - d])',
  '                if pair not in children[node]:',
  '                    children[node][pair] = len(children)',
  '                    children.append({})',
  '                    terminal.append(0)',
  '                node = children[node][pair]',
  '            terminal[node] += 1',
  '        return answer',
];
const pairOf=key=>[String.fromCharCode(97+Math.floor(key/26)),String.fromCharCode(97+key%26)];
const compact=word=>word.length<=28?word:word.slice(0,12)+'…'+word.slice(-12);

function build(input,params={}) {
  const {words,totalCharacters}=base.parser(input,params);
  const detailed=words.length<=12&&totalCharacters<=80&&words.every(word=>word.length<=24);
  const steps=[], children=[], terminal=[], meta=[], matches=[], wordSteps=new Map();
  const locals={};
  let j=null,word='',d=null,node=null,key=null,mode='init',answer=0,inserted=0,contribution=0;
  let path=[],created=null;
  const emit=(line,phase,title,extra={},final=false)=>{
    if(!detailed&&!final&&(steps.length>=319||j!==null&&(j>=6||d!==null&&d>=3)))return -1;
    const selected=new Set([0,...path.slice(-40)]);
    if(created!==null&&created<children.length)selected.add(created);
    for(let id=0;id<children.length&&selected.size<60;id++)selected.add(id);
    const ids=[...selected].filter(id=>id<children.length).sort((a,b)=>a-b);
    const depths=new Set();
    if(word.length) {
      for(let k=0;k<Math.min(8,word.length);k++)depths.add(k);
      for(let k=Math.max(0,word.length-4);k<word.length;k++)depths.add(k);
      if(d!==null)for(let k=Math.max(0,d-2);k<Math.min(word.length,d+3);k++)depths.add(k);
    }
    const visibleWords=new Set();
    for(let k=0;k<Math.min(words.length,12);k++)visibleWords.add(k);
    if(j!==null)visibleWords.add(j);
    const vars=Object.entries(locals).map(([name,value])=>({name,value:Array.isArray(value)?[...value]:value}));
    if(children.length)vars.unshift({name:'children',value:detailed?children.map(edges=>Object.fromEntries([...edges].map(([k,v])=>[pairOf(k).join(','),v]))):`${children.length} nodes`});
    if(terminal.length)vars.push({name:'terminal',value:detailed?[...terminal]:`${terminal.length} counters`});
    const index=steps.length;
    steps.push({arr:[],codeLines:[line],codeBlock:1,title:typeof title==='string'?bi(title,title):title,note:bi('',''),vars,final,
      prefixSuffix3045View:{line,source:CODE[line-1].trim(),phase,mode,detailed,totalWords:words.length,totalCharacters,
        words:[...visibleWords].sort((a,b)=>a-b).map(index=>({index,text:compact(words[index]),length:words[index].length,inserted:index<inserted,step:wordSteps.get(index)??-1})),
        j,word:compact(word),wordLength:word.length,pairs:[...depths].sort((a,b)=>a-b).map(depth=>({depth,left:word[depth],right:word[word.length-1-depth]})),
        d,pair:key===null?null:pairOf(key),node,created,path:path.slice(-60),inserted,answer,contribution,
        nodes:ids.map(id=>({id,parent:meta[id].parent,pair:meta[id].key===null?null:pairOf(meta[id].key),depth:meta[id].depth,terminal:terminal[id]??null,words:[...meta[id].words]})),
        totalNodes:children.length,matches:matches.map(m=>({...m})),condition:null,add:null,...extra},
    });return index;
  };
  children.push(new Map());meta.push({parent:null,key:null,depth:0,words:[]});
  emit(5,'init','children = [{}]');
  terminal.push(0);emit(6,'init','terminal = [0]');
  locals.answer=0;emit(7,'init','answer = 0');
  for(j=0;j<words.length;j++) {
    word=words[j];d=null;key=null;created=null;contribution=0;mode='query';
    locals.j=j;locals.word=compact(word);
    wordSteps.set(j,j<12?steps.length:-1);
    const readIndex=emit(8,'word',bi(`Đọc words[${j}]`,`Read words[${j}]`));
    wordSteps.set(j,readIndex);
    node=0;locals.node=0;path=[0];emit(9,'query-root',bi('Hỏi trie của các từ trước','Query the trie of earlier words'));
    let broke=false;
    for(d=0;d<word.length;d++) {
      key=null;locals.d=d;
      emit(10,'query-char',`d = ${d}`);
      key=(word.charCodeAt(d)-97)*26+word.charCodeAt(word.length-1-d)-97;
      locals.pair=pairOf(key);emit(11,'pair',bi('Ghép đầu và cuối','Pair the front and back'));
      const missing=!children[node].has(key);
      emit(12,'query-check',bi(missing?'Thiếu cạnh':'Có cạnh',missing?'Missing edge':'Edge found'),{condition:missing});
      if(missing){emit(13,'missing',bi('Dừng hỏi, chuyển sang chèn','Stop query, then insert'));broke=true;break;}
      node=children[node].get(key);locals.node=node;path.push(node);
      emit(14,'query-walk',`node = ${node}`);
      const before=answer,count=terminal[node];answer+=count;contribution+=count;locals.answer=answer;
      const added=[];
      for(const i of meta[node].words)if(matches.length<(detailed?80:32)){const match={i,j,word:compact(words[i]),length:words[i].length};matches.push(match);added.push(i);}
      emit(15,'add',`answer: ${before} + ${count} = ${answer}`,{add:{before,count,after:answer,indices:added,length:d+1}});
    }
    if(!broke){d=word.length-1;emit(10,'query-end',bi('Hỏi xong','Query complete'));}
    mode='insert';node=0;locals.node=0;path=[0];d=null;created=null;
    emit(16,'insert-root',bi('Chèn sau khi hỏi xong','Insert after querying'));
    for(d=0;d<word.length;d++) {
      key=null;created=null;locals.d=d;emit(17,'insert-char',`d = ${d}`);
      key=(word.charCodeAt(d)-97)*26+word.charCodeAt(word.length-1-d)-97;locals.pair=pairOf(key);
      emit(18,'insert-pair',bi('Cặp để chèn','Pair to insert'));
      const missing=!children[node].has(key);
      emit(19,'insert-check',bi(missing?'Tạo nhánh mới':'Dùng lại nhánh',missing?'Create a branch':'Reuse the branch'),{condition:missing});
      if(missing) {
        created=children.length;children[node].set(key,created);
        emit(20,'link',bi('Nối tới node mới','Link to the new node'));
        children.push(new Map());meta.push({parent:node,key,depth:meta[node].depth+1,words:[]});
        emit(21,'create',bi('Tạo node rỗng','Create an empty node'));
        terminal.push(0);emit(22,'count-init','terminal = 0');
      }
      node=children[node].get(key);locals.node=node;path.push(node);
      emit(23,'insert-walk',`node = ${node}`);
    }
    d=word.length-1;emit(17,'insert-end',bi('Chèn hết ký tự','All characters inserted'));
    terminal[node]++;if(meta[node].words.length<(detailed?12:8))meta[node].words.push(j);inserted++;
    emit(24,'terminal',`terminal[${node}] = ${terminal[node]}`);
    // Keep only word indices needed by the bounded replay controls.
    if(j>=12)wordSteps.delete(j);
  }
  j=words.length-1;d=null;mode='done';created=null;
  emit(8,'words-end',bi('Đã xử lý mọi từ','All words processed'));
  emit(25,'done',bi(`${answer} cặp hợp lệ`,`${answer} valid pairs`),{},true);
  return {original:[...words],answer,steps};
}
module.exports={3045:{...base,code:CODE,debugMode:'line-by-line',builder:build,
  approach:[bi('Ghép ký tự từ hai đầu → hỏi trie → cộng terminal → chèn từ hiện tại.','Pair front/back letters → query trie → add terminal counts → insert the current word.')],
  complexity:{time:'O(L)',space:'O(L)',note:bi('L là tổng độ dài từ. Trace đầy đủ khi ≤12 từ, tổng ≤80 ký tự, mỗi từ ≤24; đầu vào lớn vẫn tính đủ.','L is total word length. Full trace: up to 12 words, 80 total letters, 24 per word; larger inputs are still fully computed.')},
}};
