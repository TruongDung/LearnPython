'use strict';
const base=require('./trie')[588];
const bi=(vi,en)=>({vi,en});
const CODE=base.code;
const LIMITS={operations:16,depth:8,content:200,totalContent:1200,nodes:80};
const fail=message=>{throw new Error(`588 · ${message}`);};

function splitOutsideQuotes(text,separator) {
  const result=[];let part='',quote=null,escaped=false;
  for(const ch of text){
    if(quote){part+=ch;if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch===quote)quote=null;continue;}
    if(ch==='"'||ch==="'"){quote=ch;part+=ch;}
    else if(ch===separator){result.push(part.trim());part='';}else part+=ch;
  }
  if(quote)fail('Thiếu dấu đóng chuỗi / Unclosed quoted string.');
  result.push(part.trim());return result;
}
function decodeArgument(raw) {
  const text=raw.trim();
  if(text.startsWith('"')){try{return JSON.parse(text);}catch{fail('Chuỗi JSON không hợp lệ / Invalid JSON string.');}}
  if(text.startsWith("'")){
    if(!text.endsWith("'"))fail('Thiếu dấu nháy / Unclosed string.');
    let result='';const body=text.slice(1,-1);
    for(let i=0;i<body.length;i++){
      if(body[i]!=='\\'){result+=body[i];continue;}
      const ch=body[++i],escapes={n:'\n',r:'\r',t:'\t',"'":"'",'"':'"','\\':'\\'};
      if(ch===undefined||!Object.hasOwn(escapes,ch))fail('Escape không hợp lệ / Unsupported escape.');
      result+=escapes[ch];
    }return result;
  }
  return text;
}
function parseOperations(input) {
  if(typeof input!=='string'||!input.trim())fail('Nhập ít nhất một lệnh / Enter at least one operation.');
  const aliases={ls:'ls',mkdir:'mkdir',add:'addContentToFile',addcontenttofile:'addContentToFile',read:'readContentFromFile',readcontentfromfile:'readContentFromFile'};
  let records;
  if(input.trim().startsWith('[')){
    let parsed;try{parsed=JSON.parse(input);}catch{fail('JSON không hợp lệ / Invalid JSON.');}
    if(!Array.isArray(parsed))fail('Cần mảng lệnh JSON / Expected a JSON operation array.');
    records=parsed.map(row=>{if(!Array.isArray(row)||typeof row[0]!=='string')fail('Lệnh JSON phải là [name, path, content?] / Use [name, path, content?].');return {method:row[0],args:row.slice(1)};});
  }else records=splitOutsideQuotes(input,';').filter(Boolean).map(raw=>{
    const match=raw.match(/^([A-Za-z]+)\s*\(([\s\S]*)\)$/);if(!match)fail('Cú pháp: ls(/), mkdir(/a), add(/a/f,"text"), read(/a/f).');
    const args=splitOutsideQuotes(match[2],',').map(decodeArgument);return {method:match[1],args};
  });
  if(records.length<1||records.length>LIMITS.operations)fail(`Mô phỏng 1–${LIMITS.operations} lệnh / Visualize 1–${LIMITS.operations} operations.`);
  let totalContent=0;
  const operations=records.map(({method,args},index)=>{
    const name=aliases[method.toLowerCase()];if(!name)fail(`Không hỗ trợ ${method} / Unsupported operation.`);
    if(args.length!==(name==='addContentToFile'?2:1)||args.some(arg=>typeof arg!=='string'))fail('Sai tham số / Invalid arguments.');
    const path=args[0],parts=path==='/'?[]:path.slice(1).split('/');
    if(!path.startsWith('/')||parts.length>LIMITS.depth||parts.some(part=>!part||part==='.'||part==='..'||part.length>32||/[^a-z0-9._-]/.test(part)))fail('Path tuyệt đối, tối đa 8 cấp, tên gồm a–z, 0–9, . _ - / Use an absolute path with at most 8 segments.');
    const content=name==='addContentToFile'?args[1]:null;
    if(content!==null){totalContent+=[...content].length;if([...content].length>LIMITS.content)fail('Mỗi lần ghi tối đa 200 ký tự / Up to 200 characters per write.');}
    return {index,name,path,parts,content,args:[...args],raw:`${name}(${args.map(arg=>JSON.stringify(arg)).join(', ')})`};
  });
  if(totalContent>LIMITS.totalContent)fail('Tổng nội dung tối đa 1200 ký tự / Up to 1200 content characters.');
  // Validate the operation sequence before producing a trace, using full paths
  // independently of the source's node traversal.
  const entries=new Map([['/','directory']]);
  for(const op of operations){
    if(op.name==='ls'||op.name==='readContentFromFile'){
      if(!entries.has(op.path))fail(`Đường dẫn chưa có: ${op.path} / Path does not exist.`);
      if(op.name==='readContentFromFile'&&entries.get(op.path)!=='file')fail(`Chỉ đọc file: ${op.path} / Reading requires a file.`);
      continue;
    }
    if(op.name==='addContentToFile'&&(op.path==='/'||entries.get(op.path)==='directory'))fail(`Đích ghi phải là file: ${op.path} / Write target must be a file.`);
    let cursor='';
    op.parts.forEach((part,i)=>{
      cursor+='/'+part;const leaf=i===op.parts.length-1;
      if(entries.get(cursor)==='file'&&(!leaf||op.name==='mkdir'))fail(`Không thể đi qua file: ${cursor} / Cannot traverse a file.`);
      if(!entries.has(cursor))entries.set(cursor,leaf&&op.name==='addContentToFile'?'file':'directory');
    });
    if(entries.size>LIMITS.nodes)fail('Cây mô phỏng tối đa 80 node / Up to 80 filesystem nodes.');
  }
  return operations;
}

function build(input) {
  const operations=parseOperations(input),fs={kind:'filesystem'},frames=[],steps=[],outputs=[];
  let nextId=0,opIndex=-1,segmentIndex=null,created=null,lastLocated=null;
  const rawNode=node=>({...(node.children===undefined?{}:{children:Object.fromEntries(Object.entries(node.children).map(([name,child])=>[name,rawNode(child)]))}),...(Object.hasOwn(node,'content')?{content:node.content}:{})});
  const rawValue=value=>value?.kind==='node'?rawNode(value):value?.kind==='filesystem'?(fs.root?{root:rawNode(fs.root)}:{}):value;
  const nodeView=node=>node?{id:node.id,parent:node.parent?.id??null,name:node.name,path:node.path,depth:node.depth,
    content:node.content??null,contentInitialized:Object.hasOwn(node,'content'),children:node.children?Object.keys(node.children).sort():null}:null;
  const route=node=>{const ids=[];for(let cursor=node;cursor;cursor=cursor.parent)ids.unshift(cursor.id);return ids;};
  function emit(line,event,label,extra={}) {
    const frame=frames.at(-1),active=frame.locals.node??(frame.locals.self?.kind==='node'?frame.locals.self:lastLocated??fs.root);
    const nodes=[];function visit(node){nodes.push(nodeView(node));Object.values(node.children??{}).forEach(visit);}if(fs.root)visit(fs.root);
    const op=operations[opIndex];
    steps.push({arr:[],codeLines:[line],codeBlock:1,title:bi(`Dòng ${line} · ${label.vi}`,`Line ${line} · ${label.en}`),note:bi('',''),final:false,
      vars:Object.entries(frame.locals).map(([name,value])=>({name,value:value?.kind?(value.kind==='filesystem'?'FileSystem':`node(${JSON.stringify(value.path)})`):value,...(value?.kind?{rawValue:rawValue(value)}:{})})),
      memoryFileSystem588View:{line,source:CODE[line-1].trim(),event,scope:frame.method,opIndex,
        operation:op?{...op,args:[...op.args],parts:[...op.parts]}:null,
        operations:operations.map(o=>({index:o.index,name:o.name,path:o.path,raw:o.raw})),
        nodes,current:active?.id??null,active:nodeView(active),pointerName:frame.locals.node?'node':frame.locals.self?.kind==='node'?'self':'context',visited:active?route(active):[],
        pending:active&&!nodes.some(n=>n.id===active.id)?nodeView(active):null,
        segmentIndex,created,outputs:outputs.map(o=>({...o,value:Array.isArray(o.value)?[...o.value]:o.value})),
        stack:frames.map(f=>f.method),condition:null,result:null,outputReady:false,append:null,...extra},
    });
  }
  function makeNode(name,parent) {
    const node={kind:'node',id:nextId++,name,parent,path:parent?(parent.path==='/'?'':parent.path)+'/'+name:'/',depth:parent?parent.depth+1:0};
    frames.push({method:'TrieNode.__init__',locals:{self:node}});
    node.children=Object.create(null);emit(3,'children-init',bi('children = {}','children = {}'));
    node.content=null;emit(4,'directory-init',bi('content = None · thư mục','content = None · directory'));
    frames.pop();return node;
  }
  frames.push({method:'FileSystem.__init__',locals:{self:fs}});
  fs.root=makeNode('/',null);emit(8,'root',bi('Thư mục gốc /','Root folder /'));frames.pop();
  function navigate(path,create=false) {
    const frame={method:'_navigate',locals:{self:fs,path,create,node:fs.root}};frames.push(frame);
    emit(30,'navigate-start',bi('node → /','node → /'));
    const parts=path.split('/').slice(1);
    for(let i=0;i<parts.length;i++) {
      segmentIndex=i;created=null;frame.locals.part=parts[i];
      emit(31,'segment',bi(`Đọc ${JSON.stringify(parts[i])}`,`Read ${JSON.stringify(parts[i])}`));
      const empty=!parts[i];emit(32,'empty-check',bi('Kiểm tra phần rỗng','Check for an empty segment'),{condition:empty});
      if(empty){emit(33,'continue',bi('Bỏ qua phần rỗng','Skip the empty segment'));continue;}
      const missing=!Object.hasOwn(frame.locals.node.children,parts[i]);
      emit(34,'child-check',bi(missing?'Thiếu node':'Dùng lại node',missing?'Missing node':'Reuse the node'),{condition:missing});
      if(missing){
        emit(35,'create-check',bi('Có được tạo node?','May create a node?'),{condition:!create});
        if(!create){emit(36,'missing',bi('Đường dẫn chưa có','Path missing'),{result:null});frames.pop();return null;}
        const child=makeNode(parts[i],frame.locals.node);frame.locals.node.children[parts[i]]=child;created=child.id;
        emit(37,'create',bi(`Tạo ${parts[i]}`,`Create ${parts[i]}`));
      }
      frame.locals.node=frame.locals.node.children[parts[i]];
      emit(38,'walk',bi(`node → ${frame.locals.node.path}`,`node → ${frame.locals.node.path}`));
    }
    emit(31,'segments-end',bi('Đã đi hết path','Path traversal complete'));
    emit(39,'navigate-return',bi('Trả node','Return node'));lastLocated=frame.locals.node;frames.pop();return frame.locals.node;
  }
  function complete(value){outputs.push({index:opIndex,name:operations[opIndex].name,path:operations[opIndex].path,value});return {result:value,outputReady:true};}
  operations.forEach((op,index)=>{
    opIndex=index;segmentIndex=null;created=null;
    const frame={method:op.name,locals:{self:fs,path:op.path,...(op.name==='addContentToFile'?{content:op.content}:{})}};frames.push(frame);
    const node=navigate(op.path,op.name==='mkdir'||op.name==='addContentToFile');
    if(op.name==='mkdir'){emit(17,'mkdir-done',bi('Thư mục đã sẵn sàng','Directory ready'),complete(null));frames.pop();return;}
    frame.locals.node=node;
    if(op.name==='ls'){
      emit(11,'ls-node',bi('Đã tìm node để liệt kê','Found the node to list'));
      const file=node.content!==null;emit(12,'file-check',bi('File hay thư mục?','File or directory?'),{condition:file});
      if(file){const value=[op.path.split('/').at(-1)];emit(13,'list-file',bi('Trả đúng tên file','Return the file name'),complete(value));}
      else {const value=Object.keys(node.children).sort();emit(14,'list-directory',bi('Danh sách theo A–Z','List in alphabetical order'),complete(value));}
    }else if(op.name==='readContentFromFile'){
      emit(26,'read-node',bi('Đã tìm file','File found'));
      emit(27,'read',bi('Đọc nội dung','Read content'),complete(node.content));
    }else{
      emit(20,'write-node',bi('Đã tìm node để ghi','Found the node to write'));
      const empty=node.content===null;emit(21,'content-check',bi('Đã có content?','Has content?'),{condition:empty});
      if(empty){node.content='';emit(22,'file-init',bi('Khởi tạo file rỗng','Initialize an empty file'));}
      const before=node.content;node.content+=op.content;
      emit(23,'append',bi('Nối thêm nội dung','Append content'),{...complete(null),append:{before,added:op.content,after:node.content}});
    }
    frames.pop();
  });
  const answer=outputs.map(o=>Array.isArray(o.value)?[...o.value]:o.value);
  steps.at(-1).final=true;steps.at(-1).memoryFileSystem588View.answer=answer;
  return {original:operations.map(o=>[o.name,...o.args]),answer,steps};
}
module.exports={588:{...base,debugMode:'line-by-line',preserveInputWhitespace:true,
  defaultInput:'ls(/);mkdir(/a/b/c);add(/a/b/c/d,"hello");add(/a/b/c/d," world");ls(/a/b/c);ls(/a/b/c/d);read(/a/b/c/d)',
  inputLabel:bi('Tối đa 16 lệnh, cách nhau bằng ; · hỗ trợ alias add/read','Up to 16 semicolon-separated operations · add/read aliases supported'),
  approach:[bi('Mỗi phần của path là một node. content = None: thư mục; content là chuỗi: file.','Each path segment is a node. content = None means a directory; a string means a file.'),bi('add nối thêm nội dung; ls trả tên file hoặc tên các con đã sắp xếp.','add appends content; ls returns a file name or sorted child names.')],
  complexity:{...base.complexity,note:bi('Mô phỏng ≤16 lệnh, path ≤8 cấp, cây ≤80 node; mỗi lần ghi ≤200 ký tự.','Visualization: ≤16 operations, ≤8 path segments, ≤80 nodes; ≤200 characters per write.')},
  parseOperations,builder:build,visualizationLimits:LIMITS,
}};
