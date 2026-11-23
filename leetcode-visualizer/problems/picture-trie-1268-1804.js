'use strict';
const base=require('./trie'),{runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const CODE1268=`class Solution:
    def suggestedProducts(self, products, searchWord):
        products = sorted(products)
        root = {'children': {}, 'top': []}
        for product in products:
            node, path = root, ''
            for ch in product:
                path += ch
                if ch not in node['children']:
                    node['children'][ch] = {'children': {}, 'top': []}
                node = node['children'][ch]
                if len(node['top']) < 3:
                    node['top'].append(product)
        ans = []
        node, prefix = root, ''
        for ch in searchWord:
            prefix += ch
            if node is not None:
                node = node['children'].get(ch)
            suggestions = [] if node is None else node['top'][:]
            ans.append(suggestions)
        return ans`;
const CODE1804=base[1804].code.join('\n');
const HARNESS=`
class Solution:
    def run(self, operations):
        trie = Trie()
        results = []
        for index, (method, word) in enumerate(operations):
            results.append(getattr(trie, method)(word))
        return results`;
function words(input,id,live=false){
 let list=input;
 if(typeof input==='string')try{list=input.trim().startsWith('[')?JSON.parse(input):input.split(',').map(s=>s.trim());}catch(_){list=null;}
 const max=live?1000:8,maxLength=live?id===1268?3000:2000:12;
 if(!Array.isArray(list)||!list.length||list.length>max||!Array.from(list).every(w=>typeof w==='string'&&new RegExp(`^[a-z]{1,${maxLength}}$`).test(w)))throw new RangeError(`${id}: 1–${max} từ a–z, mỗi từ ≤${maxLength} ký tự / invalid words.`);
 if(id===1268&&(new Set(list).size!==list.length||list.reduce((n,w)=>n+w.length,0)>(live?20000:80)))throw new RangeError('1268: sản phẩm khác nhau, tổng ký tự tối đa 80 khi minh hoạ / use distinct products, up to 80 visual characters.');
 return [...list];
}
function text(value,id,live=false,optional=false){
 if(optional&&value==='')return '';
 if(typeof value!=='string'||!new RegExp(`^[a-z]{1,${live?id===1268?1000:2000:12}}$`).test(value))throw new RangeError(`${id}: từ truy vấn phải gồm chữ a–z / query must be lowercase a–z.`);
 return value;
}
function args1268(input,params={},live=false){return[words(input,1268,live),text(params.searchWord??'mouse',1268,live)];}
function operations1804(input,params={},live=false){
 const list=words(input,1804,live),word=text(params.countWord??'apple',1804,live),prefix=text(params.countPrefix??'app',1804,live),erase=text(params.erase??'apple',1804,live,true);
 if(erase&&!list.includes(erase))throw new RangeError('1804: chỉ erase một từ đã chèn / erase must target an inserted word.');
 return [...list.map(w=>({name:'insert',args:[w]})),{name:'countWordsEqualTo',args:[word]},{name:'countWordsStartingWith',args:[prefix]},...(erase?[{name:'erase',args:[erase]},{name:'countWordsEqualTo',args:[word]},{name:'countWordsStartingWith',args:[prefix]}]:[])];
}
function tree1268(root){
 const out=[];function walk(node,prefix,parent,ch){if(!node)return;out.push({id:prefix,prefix,parent,ch,top:[...node.top]});for(const [c,child]of Object.entries(node.children))walk(child,prefix+c,prefix,c);}
 walk(root,'',null,'•');return out;
}
function tree1804(event){
 const allocated=new Map((event.objects??[]).map(o=>[o.id,o])),root=event.locals.self?.root?.id??event.frames.find(f=>f.locals.self?.root)?.locals.self.root.id;
 const out=[];function walk(id,prefix,parent,ch){const o=allocated.get(id);if(!o)return;const f=o.fields;out.push({id,prefix,parent,ch,prefixCount:f.prefix_count??null,wordCount:f.word_count??null});for(const [c,child]of Object.entries(f.children??{}))walk(child.id,prefix+c,id,c);}
 if(root)walk(root,'',null,'•');return out;
}
function build1268(input,params={}){
 const args=args1268(input,params),code=CODE1268.split('\n'),native=runTrace({code:CODE1268,method:'suggestedProducts',args});let current='',history=[];
 const steps=native.events.map((e,index)=>{const x=e.locals,line=e.line;
  if(line===6)current='';if(line===11)current=x.path;if(line===15)current='';if(line===19)current=x.node===null?current:x.prefix;
  if(line===21)history.push({prefix:x.prefix,products:[...x.suggestions],step:index});
  const nodes=tree1268(x.root),view={id:1268,line,source:code[line-1].trim(),scope:e.scope,condition:e.branch,final:e.returning,products:[...args[0]].sort(),searchWord:args[1],
   nodes,current,building:line<=13,target:line<=13?x.product??'':x.prefix??'',char:x.ch??null,missing:line>=19&&x.node===null,
   cache:nodes.find(n=>n.prefix===current)?.top??[],history:history.map(h=>({...h,products:[...h.products]})),result:line>=20?[...(x.suggestions??[])]:null};
  return frame(view,e.locals);
 });return{original:args[0],answer:native.answer,steps};
}
function build1804(input,params={}){
 const operations=operations1804(input,params),native=runTrace({code:CODE1804+HARNESS,method:'run',args:[operations.map(o=>[o.name,o.args[0]])],captureAllocations:['TrieNode'],stateClasses:['Trie']}),code=CODE1804.split('\n');
 let outputs=[],history=[];const events=native.events.filter(e=>e.line<=code.length);
 const steps=events.map((e,index)=>{const opIndex=e.outer.index??-1,op=operations[opIndex],x=e.locals,nodes=tree1804(e),current=x.node?.id??x.self?.root?.id??nodes[0]?.id??null;
  if(op&&e.scope===op.name&&e.returning){outputs.push(e.returned);history.push({opIndex,value:e.returned,step:index});}
  const view={id:1804,line:e.line,source:code[e.line-1].trim(),scope:e.scope,condition:e.branch,final:index===events.length-1,nodes,current,
    operations:operations.map(o=>({name:o.name,word:o.args[0]})),opIndex,target:op?.args[0]??'',char:x.ch??null,outputs:[...outputs],history:history.map(h=>({...h})),result:e.returning&&op?.name===e.scope?e.returned:null,
    method:op?.name??'Trie',missing:[21,28].includes(e.line)&&e.branch===true};
  return frame(view,x);
 });return{original:words(input,1804),answer:native.answer,steps};
}
function frame(view,locals){return{title:bi(`Dòng ${view.line} · ${view.scope}`,`Line ${view.line} · ${view.scope}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[view.line],final:view.final,vars:Object.entries(locals).map(([name,value])=>({name,value})),trieLessonView:view};}
module.exports={
 1268:{...base[1268],code:CODE1268.split('\n'),builder:build1268,liveArgs:(input,params)=>args1268(input,params,true),debugMode:'line-by-line',
  inputLabel:bi('1–8 sản phẩm khác nhau · mỗi từ ≤12 chữ, tổng ≤80 chữ','1–8 unique products · ≤12 letters each, ≤80 total letters'),
  approach:[bi('Chèn sản phẩm theo thứ tự từ điển; mỗi node giữ tối đa 3 gợi ý. Thiếu nhánh vẫn thêm [] cho mọi ký tự còn lại.','Insert products in lexicographic order; each node keeps up to three suggestions. After a missing branch, append [] for every remaining character.')],
  complexity:{time:'O(P log P · L + S)',space:'O(P·L + S)',note:bi('P sản phẩm dài tối đa L; S là độ dài searchWord. Chỉ sao chép tối đa 3 gợi ý mỗi lần gõ.','P products of length at most L; S search characters. At most three suggestions are copied per typed character.')}},
 1804:{...base[1804],builder:build1804,debugMode:'line-by-line',prepareLiveDesign:(input,params)=>({className:'Trie',constructorArgs:[],operations:operations1804(input,params,true)}),
  inputLabel:bi('1–8 từ chèn · cho phép lặp · mỗi từ ≤12 chữ','1–8 inserted words · duplicates allowed · ≤12 letters each'),
  approach:[bi('Mỗi node có prefix_count và word_count. insert tăng các bộ đếm; erase chỉ giảm một bản, giữ lại nhánh để các từ khác vẫn truy cập được.','Each node has prefix_count and word_count. insert increments them; erase decrements one copy and keeps branches accessible to other words.')],
 },
};
