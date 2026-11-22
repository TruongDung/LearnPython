'use strict';
const base=require('./trie')[208];
const bi=(vi,en)=>({vi,en});
function parse(input,params={}) {
  if(typeof input!=='string')throw new TypeError('208 · Nhập các từ cách nhau bằng dấu phẩy / Enter comma-separated words.');
  let words;try{words=input.trim().startsWith('[')?JSON.parse(input):input.split(',').map(w=>w.trim());}catch{throw new TypeError('208 · words không hợp lệ / invalid words');}
  const search=params.search??'app',prefix=params.prefix??'app';
  if(!Array.isArray(words)||words.length<1||words.length>12||words.some(w=>typeof w!=='string'||w.length<1||w.length>12||/[^a-z]/.test(w))||words.reduce((n,w)=>n+w.length,0)>100)throw new RangeError('208 · Mô phỏng 1–12 từ a–z, mỗi từ ≤12 chữ, tổng ≤100 / Visualize 1–12 lowercase words, ≤12 letters each, ≤100 total.');
  for(const value of [search,prefix])if(typeof value!=='string'||value.length<1||value.length>12||/[^a-z]/.test(value))throw new TypeError('208 · search/prefix: 1–12 chữ a–z / 1–12 lowercase letters.');
  return {words:[...words],search,prefix};
}
function build(input,params={},block=1) {
  const {words,search,prefix}=parse(input,params),nested=block===2,source=nested?base.code2:base.code;
  const trie={kind:'trie'},steps=[],frames=[];
  const ops=[{method:'Trie',word:'',step:0,result:null,done:false},...words.map(word=>({method:'insert',word,step:-1,result:null,done:false})),{method:'search',word:search,step:-1,result:null,done:false},{method:'startsWith',word:prefix,step:-1,result:null,done:false}];
  let nextId=0,opIndex=0,index=null,phase='init',created=null,missing=false;
  function rawNode(node) {
    if(nested)return {...Object.fromEntries(Object.entries(node.children||{}).map(([ch,child])=>[ch,rawNode(child)])),...(node.isWord?{'$':true}:{})};
    return {...(node.children===null?{}:{children:Object.fromEntries(Object.entries(node.children).map(([ch,child])=>[ch,rawNode(child)]))}),...(node.isWord===null?{}:{is_word:node.isWord})};
  }
  const encode=value=>value?.kind==='node'?rawNode(value):value?.kind==='trie'?(value.root?{root:rawNode(value.root)}:{}):value;
  const pathTo=node=>{const path=[];for(let n=node;n;n=n.parent)path.unshift(n.id);return path;};
  function emit(line,event,label,result=null,condition=null) {
    const frame=frames.at(-1),active=frame.locals.node||(frame.locals.self?.kind==='node'?frame.locals.self:trie.root);
    const nodes=[];
    function visit(node){nodes.push({id:node.id,parent:node.parent?.id??null,ch:node.ch,prefix:node.prefix,isWord:node.isWord});Object.values(node.children||{}).forEach(visit);}
    if(trie.root)visit(trie.root);
    steps.push({arr:[],codeBlock:block,codeLines:[line],title:bi(`Dòng ${line} · ${label.vi}`,`Line ${line} · ${label.en}`),note:bi('',''),final:false,
      vars:Object.entries(frame.locals).map(([name,value])=>({name,value:value?.kind?(value.kind==='trie'?'Trie':`node(${JSON.stringify(value.prefix||'root')})`):value,...(value?.kind?{rawValue:encode(value)}:{})})),
      trie208View:{line,source:source[line-1].trim(),scope:frame.method,event,phase,block,opIndex,operations:ops.map(op=>({...op})),
        words:[...words],search,prefix,nodes,current:active?.id??null,path:active?pathTo(active):[],created,index,missing,
        pending:active&&!nodes.some(n=>n.id===active.id)?{ch:active.ch,prefix:active.prefix}:null,
        target:ops[opIndex].word,terminal:active?.isWord??null,result,condition},
    });
  }
  function makeNode(ch,parent) {
    const node={kind:'node',id:nextId++,ch,prefix:parent?parent.prefix+ch:'',parent,children:null,isWord:null};
    if(nested){node.children=Object.create(null);node.isWord=false;return node;}
    frames.push({method:'TrieNode.__init__',locals:{self:node}});
    node.children=Object.create(null);emit(3,'children-init',bi('children = {}','children = {}'));
    node.isWord=false;emit(4,'end-init',bi('Chưa phải cuối từ','Not a word end'));
    frames.pop();return node;
  }
  frames.push({method:'Trie.__init__',locals:{self:trie}});
  trie.root=makeNode('root',null);ops[0].done=true;
  emit(nested?3:8,'root',bi('Trie rỗng','Empty trie'));frames.pop();
  words.forEach((word,wordIndex)=>{
    opIndex=wordIndex+1;phase='insert';index=null;missing=false;created=null;ops[opIndex].step=steps.length;
    const frame={method:'insert',locals:{self:trie,word,node:trie.root}};frames.push(frame);
    emit(nested?6:11,'insert-start',bi('node → root','node → root'));
    for(let i=0;i<word.length;i++) {
      index=i;created=null;frame.locals.ch=word[i];emit(nested?7:12,'char',bi(`Đọc '${word[i]}'`,`Read '${word[i]}'`));
      const absent=!Object.hasOwn(frame.locals.node.children,word[i]);
      if(!nested)emit(13,'edge-check',bi(absent?'Thiếu cạnh':'Dùng lại cạnh',absent?'Missing edge':'Reuse edge'),null,absent);
      if(absent){const child=makeNode(word[i],frame.locals.node);frame.locals.node.children[word[i]]=child;created=child.id;if(!nested)emit(14,'create',bi('Nối node mới','Attach new node'));}
      frame.locals.node=frame.locals.node.children[word[i]];
      emit(nested?8:15,'walk',bi(`node → ${frame.locals.node.prefix}`,`node → ${frame.locals.node.prefix}`));
    }
    created=null;emit(nested?7:12,'loop-end',bi('Đã đi hết từ','Word fully traversed'));
    frame.locals.node.isWord=true;ops[opIndex].done=true;
    emit(nested?9:16,'mark',bi(`★ ${word}`,`★ ${word}`));frames.pop();
  });
  const results={};
  function query(method,target) {
    opIndex=method==='search'?words.length+1:words.length+2;phase=method==='search'?'search':'prefix';index=null;missing=false;created=null;ops[opIndex].step=steps.length;
    const isSearch=method==='search',frame={method,locals:{self:trie,[isSearch?'word':'prefix']:target,node:trie.root}};frames.push(frame);
    const start=nested?(isSearch?12:20):(isSearch?19:27),loop=start+1,check=start+2,fail=start+3,walk=start+4,finish=start+5;
    emit(start,'query-start',bi('node → root','node → root'));
    for(let i=0;i<target.length;i++) {
      index=i;frame.locals.ch=target[i];emit(loop,'char',bi(`Đọc '${target[i]}'`,`Read '${target[i]}'`));
      missing=!Object.hasOwn(frame.locals.node.children,target[i]);emit(check,'edge-check',bi(missing?'Không có cạnh':'Có cạnh',missing?'Missing edge':'Edge found'),null,missing);
      if(missing){results[method]=false;ops[opIndex].result=false;ops[opIndex].done=true;emit(fail,'return',bi('Thiếu nhánh → False','Missing branch → False'),false);frames.pop();return;}
      frame.locals.node=frame.locals.node.children[target[i]];emit(walk,'walk',bi(`node → ${frame.locals.node.prefix}`,`node → ${frame.locals.node.prefix}`));
    }
    emit(loop,'loop-end',bi('Đã đi hết ký tự','Traversal complete'));
    const result=isSearch?frame.locals.node.isWord:true;results[method]=result;ops[opIndex].result=result;ops[opIndex].done=true;
    emit(finish,'return',isSearch?bi(result?'Có ★ → True':'Chỉ là prefix → False',result?'Word end ★ → True':'Only a prefix → False'):bi('Đủ đường → True','Path exists → True'),result);frames.pop();
  }
  query('search',search);query('startsWith',prefix);
  steps.at(-1).final=true;steps.at(-1).trie208View.answer={...results};
  return {original:[...words],answer:results,steps};
}
module.exports={208:{...base,defaultInput:'apple,apply',debugMode:'line-by-line',
  statement:bi('insert: tạo hoặc dùng lại nhánh, đánh dấu ★ ở cuối từ. search cần đủ đường và ★; startsWith chỉ cần đủ đường.','insert creates or reuses branches and marks ★ at the word end. search needs a full path plus ★; startsWith only needs the path.'),
  inputLabel:bi('1–12 từ a–z, cách nhau bằng dấu phẩy · mỗi từ ≤12 chữ','1–12 comma-separated lowercase words · ≤12 letters each'),
  extraParams:base.extraParams.map(p=>p.key==='prefix'?{...p,default:'app'}:p),
  approach:[bi('Đường đi tồn tại ≠ từ đã chèn. ★ là dấu kết thúc từ.','An existing path is not always an inserted word. ★ marks a word end.')],
  complexity:{time:'O(L) / operation',space:'O(S)',note:bi('L: độ dài từ; S: tổng ký tự đã chèn. Mô phỏng ≤12 từ, ≤100 ký tự.','L: word length; S: total inserted letters. Visualization: ≤12 words, ≤100 letters.')},
  builder:(input,params)=>build(input,params,1),builder2:(input,params)=>build(input,params,2),parser:parse,
}};
