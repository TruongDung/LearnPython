'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[588];
const {prepareDesignLiveRun}=require('../live-args');
const cases=[
  p.defaultInput,
  'mkdir(/zeta);mkdir(/alpha);mkdir(/beta);ls(/)',
  'mkdir(/docs);add(/docs/readme,"hello");add(/docs/todo,"work");ls(/docs);ls(/docs/readme);read(/docs/readme)',
  'mkdir(/a/b);mkdir(/a/b);add(/a/b/f,"");add(/a/b/f,"one");add(/a/b/f," two");read(/a/b/f)',
  'mkdir(/);ls(/)',
  'add(/a/b/f,"a; read(/fake), \\"quote\\"\\n😀");read(/a/b/f)',
  'add(/constructor/__proto__,"<script>&");ls(/constructor);read(/constructor/__proto__)',
];
// The escaped quote fixture is assembled as data to keep its exact source clear.
cases[5]='add(/a/b/f,'+JSON.stringify('a; read(/fake), "quote"\n😀')+');read(/a/b/f)';
function oracle(operations){
  const folders=new Set(['/']),files=new Map(),out=[];
  for(const op of operations){
    if(op.name==='mkdir'||op.name==='addContentToFile'){
      const parts=op.path.split('/').slice(1);let path='';
      for(const part of parts.slice(0,op.name==='mkdir'?parts.length:-1)){if(part){path+='/'+part;folders.add(path);}}
      if(op.name==='addContentToFile')files.set(op.path,(files.get(op.path)||'')+op.content);
      out.push(null);
    }else if(op.name==='readContentFromFile')out.push(files.get(op.path));
    else if(files.has(op.path))out.push([op.path.split('/').at(-1)]);
    else {const prefix=op.path==='/'?'/':op.path+'/';out.push([...folders,...files.keys()].filter(path=>path!==op.path&&path.startsWith(prefix)&&!path.slice(prefix.length).includes('/')).map(path=>path.slice(prefix.length)).sort());}
  }return out;
}

test('588 folder creation, append, read, file listing and sorted directory listing match an independent oracle',()=>{
  for(const input of cases){const r=p.builder(input);assert.deepEqual(r.answer,oracle(p.parseOperations(input)),input);assert.equal(r.steps.at(-1).final,true);assert.equal(r.steps.filter(s=>s.final).length,1);assert.ok(r.steps.every(s=>s.codeLines.length===1));}
  assert.deepEqual(p.builder(cases[0]).answer,[[],null,null,null,['d'],['d'],'hello world']);
  assert.deepEqual(p.builder(cases[1]).answer,[null,null,null,['alpha','beta','zeta']]);
});

test('588 all constructor, navigation and public-method lines and raw locals match CPython',()=>{
  const script=`import sys,json
payload=json.load(sys.stdin)
ns={}
exec(compile(payload['source'],'<fs588>','exec'),ns)
def encode(v):
    if isinstance(v,dict):return {k:encode(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)):return [encode(x) for x in v]
    if isinstance(v,(str,int,bool)) or v is None:return v
    return encode(vars(v))
out=[]
for operations in payload['cases']:
    events=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='<fs588>':return trace
        key=id(frame)
        if event in ('line','return'):
            if key in pending:
                scope=frame.f_code.co_name
                if scope=='__init__':scope=type(frame.f_locals['self']).__name__+'.__init__'
                events.append({'line':pending[key],'scope':scope,'vars':encode(dict(frame.f_locals))})
            if event=='line':pending[key]=frame.f_lineno
            else:pending.pop(key,None)
        return trace
    sys.settrace(trace)
    system=ns['FileSystem']()
    answer=[getattr(system,operation['name'])(*operation['args']) for operation in operations]
    sys.settrace(None)
    out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
  const run=spawnSync('python3',['-c',script],{input:JSON.stringify({source:p.code.join('\n'),cases:cases.map(input=>p.parseOperations(input))}),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((expected,index)=>{const r=p.builder(cases[index]);assert.deepEqual(r.answer,expected.answer);assert.deepEqual(r.steps.map(step=>({line:step.codeLines[0],scope:step.memoryFileSystem588View.scope,vars:Object.fromEntries(step.vars.map(v=>[v.name,Object.hasOwn(v,'rawValue')?v.rawValue:v.value]))})),expected.events,cases[index]);});
});

test('588 snapshots distinguish None directories from empty files, preserve old content, and keep reads immutable',()=>{
  const r=p.builder('mkdir(/a);add(/a/f,"");read(/a/f);add(/a/f,"hello");add(/a/f," world");read(/a/f)');
  const append=r.steps.filter(s=>s.memoryFileSystem588View.append);
  assert.deepEqual(append.map(s=>s.memoryFileSystem588View.append),[{before:'',added:'',after:''},{before:'',added:'hello',after:'hello'},{before:'hello',added:' world',after:'hello world'}]);
  const empty=append[0].memoryFileSystem588View;
  assert.equal(empty.nodes.find(n=>n.path==='/a/f').content,'');assert.equal(empty.nodes.find(n=>n.path==='/a').content,null);
  assert.deepEqual(r.steps[0].vars[0].rawValue,{children:{}});assert.equal(r.steps[0].memoryFileSystem588View.nodes.length,0);
  const beforeRead=r.steps.find(s=>s.memoryFileSystem588View.opIndex===5).memoryFileSystem588View.nodes;
  assert.deepEqual(r.steps.at(-1).memoryFileSystem588View.nodes,beforeRead);
  assert.equal(append[1].memoryFileSystem588View.nodes.find(n=>n.path==='/a/f').content,'hello');
  const many=Array.from({length:16},(_,i)=>`mkdir(/a${i}/b/c)`).join(';'),full=p.builder(many);
  assert.ok(full.steps.length>180);assert.equal(full.steps.at(-1).memoryFileSystem588View.outputs.length,16);
});

test('588 parser handles quoted delimiters, JSON, aliases and rejects invalid operation sequences',()=>{
  const content='hello; read(/fake), "text"\n😀';
  const input=JSON.stringify([['mkdir','/docs'],['add','/docs/readme',content],['read','/docs/readme'],['ls','/docs']]);
  assert.deepEqual(p.builder(input).answer,[null,null,content,['readme']]);
  assert.deepEqual(p.builder("add('/a','it\\'s ok');read('/a')").answer,[null,"it's ok"]);
  for(const input of ['', 'wat(/)', 'read(/missing)', 'mkdir(/a);read(/a)', 'add(/,"x")', 'mkdir(/a);add(/a,"x")', 'add(/a,"x");mkdir(/a/b)', 'mkdir(a)', 'mkdir(/a/)', 'mkdir(/a//b)', 'mkdir(/../a)', 'add(/a,"unterminated)', JSON.stringify([['add','/a','x'.repeat(201)]]),Array(17).fill('ls(/)').join(';')])assert.throws(()=>p.builder(input),/588/);
  const config=prepareDesignLiveRun(p,'add(/a,'+JSON.stringify(content)+');read(/a)');
  assert.equal(config.className,'FileSystem');assert.deepEqual(config.operations,[{name:'addContentToFile',args:['/a',content]},{name:'readContentFromFile',args:['/a']}]);
});

test('588 pictures render every line in VI/EN with escaped file contents and separate file/folder icons',()=>{
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),stepIndex:0,steps:[]};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-memory-file-system-588.js'),'utf8'),ctx);
  for(const lang of ['vi','en'])for(const input of cases){ctx.lang=lang;ctx.steps=p.builder(input).steps;ctx.steps.forEach((step,index)=>{ctx.stepIndex=index;ctx.renderMemoryFileSystem588View(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|<script>/);assert.match(host.innerHTML,/fs588-inspector/);assert.match(host.innerHTML,new RegExp(`(?:Dòng|Line) ${step.codeLines[0]}`));if(step.memoryFileSystem588View.append)assert.match(host.innerHTML,/fs588-append/);});}
});
