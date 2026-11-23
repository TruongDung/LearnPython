'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), { spawnSync } = require('node:child_process');
const p = require('../problems').SUPPORTED[1352], { prepareDesignLiveRun } = require('../live-args');
const cases = [p.defaultInput, 'add(2);add(3);add(4);getProduct(2);getProduct(3)', 'add(0);getProduct(1);add(0);getProduct(2);add(7);getProduct(1);getProduct(2);getProduct(3)', 'add(1);add(1);add(1);getProduct(3);getProduct(1)', 'add(100);add(100);add(100);add(100);add(20);getProduct(4);getProduct(5);add(0);getProduct(6)', 'add(2)', 'add(0)', Array(24).fill('add(1)').join(';')];
function oracle(operations) { const stream = []; return operations.map(op => { if(op.name === 'add') { stream.push(op.args[0]); return null; } return stream.slice(-op.args[0]).reduce((a,b) => a*b,1); }); }

test('1352 matches direct multiplication for repeated zeros, prefix boundaries and all small streams through length five', () => {
  for(const input of cases) assert.deepEqual(p.builder(input).answer, oracle(p.parseOperations(input)));
  function enumerate(operations, count) {
    if(count) assert.deepEqual(p.builder(operations).answer,oracle(p.parseOperations(operations)));
    if(count === 5) return;
    for(const value of [0,1,2,3]) enumerate([...operations,['add',value],...Array.from({length:count+1},(_,i) => ['getProduct',i+1])],count+1);
  }
  enumerate([],0);
  assert.deepEqual(p.builder(p.defaultInput).answer,[null,null,null,null,null,20,40,0,null,32]);
});

test('1352 every constructor, branch, append and return line with self and parameters matches CPython', () => {
  const python = `import sys,json
payload=json.load(sys.stdin)
ns={}
exec(compile(payload['source'],'<product1352>','exec'),ns)
def encode(x):
    if isinstance(x,dict):return {k:encode(v) for k,v in x.items()}
    if isinstance(x,list):return [encode(v) for v in x]
    if isinstance(x,(int,str,bool)) or x is None:return x
    return encode(vars(x))
out=[]
for operations in payload['cases']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='<product1352>':return None
        key=id(frame)
        if event in ('line','return'):
            if key in pending:rows.append({'line':pending[key],'method':frame.f_code.co_name,'locals':encode(dict(frame.f_locals))})
            if event=='line':pending[key]=frame.f_lineno
            else:pending.pop(key,None)
        return trace
    sys.settrace(trace)
    instance=ns['ProductOfNumbers']()
    answer=[getattr(instance,op['name'])(*op['args']) for op in operations]
    sys.settrace(None)
    out.append({'answer':answer,'rows':rows})
print(json.dumps(out))`;
  const reference = spawnSync(process.env.PYTHON || 'python3',['-c',python],{input:JSON.stringify({source:p.code.join('\n'),cases:cases.map(input => p.parseOperations(input))}),encoding:'utf8',maxBuffer:8e6});
  assert.equal(reference.status,0,reference.stderr);
  JSON.parse(reference.stdout).forEach((expected,index) => { const run = p.builder(cases[index]); assert.deepEqual(run.answer,expected.answer); assert.deepEqual(run.steps.map(step => ({line:step.codeLines[0],method:step.product1352View.method,locals:step.product1352View.locals})),expected.rows); });
});

test('1352 query frames preserve prefix state and publish results only at the executed return statement', () => {
  for(const input of cases) {
    const run = p.builder(input);
    for(const step of run.steps) {
      const v=step.product1352View;
      assert.deepEqual(step.codeLines,[v.line]);assert.equal(v.source,p.code[v.line-1].trim());
      assert.deepEqual(v.locals.self.prefix,v.prefix);
      assert.equal(v.prefix[0],1);let product=1;
      assert.deepEqual(v.prefix,[1,...v.stream.slice(v.lastZero+1).map(value => product*=value)]);
      assert.equal(v.history.length,v.outputs.length);
      if(v.line===6) { assert.equal(v.resultReady,false);assert.equal(v.stream.length,p.parseOperations(input).slice(0,v.opIndex).filter(op=>op.name==='add').length); }
      if(v.line===7) { assert.deepEqual(v.prefix,[1]);assert.equal(v.stream.at(-1),0);assert.equal(v.resultReady,false); }
      if(v.method==='getProduct') {
        assert.deepEqual(v.prefix,v.beforePrefix);
        if(v.line===12) { assert.equal(v.resultReady,false);assert.equal(v.calculation,null);assert.equal(v.outputs.length,v.opIndex); }
        else { assert.equal(v.resultReady,true);assert.equal(v.result,v.stream.slice(-v.k).reduce((a,b)=>a*b,1)); }
        if(v.line===14) { const c=v.calculation;assert.equal(c.denominator,v.prefix.at(-v.k-1));assert.equal(c.numerator/c.denominator,c.result); }
      }
    }
    assert.equal(run.steps.filter(step=>step.final).length,1);assert.equal(run.steps.at(-1).product1352View.final,true);
  }
});

test('1352 accepts command strings, rows and both LeetCode arrays; validates zero, k, products and full live limits', () => {
  const rows=[['ProductOfNumbers'],['add',3],['add',0],['add',2],['getProduct',2],['get',1]];
  for(const input of [rows,JSON.stringify(rows),'ProductOfNumbers();add(3);add(0);add(2);getProduct(2);get(1);']) assert.deepEqual(p.builder(input).answer,[null,null,null,0,2]);
  const names=['ProductOfNumbers','add','add','getProduct'], args=[[],[2],[3],[2]];
  for(const input of [JSON.stringify([names,args]),JSON.stringify(names)+'\n'+JSON.stringify(args)]) assert.deepEqual(p.builder(input).answer,[null,null,6]);
  for(const input of ['',[],null,'getProduct(1)','add(2);getProduct(0)','add(2);getProduct(2)','add(-1)','add(101)','add(1.5)','add(true)','add(2);;get(1)','add(1);ProductOfNumbers()','add(2,3)','__proto__(1)',JSON.stringify([['add',true]]),JSON.stringify([['add','2']]),'add(100);add(100);add(100);add(100);add(100)',Array(25).fill('add(1)').join(';'),JSON.stringify([['add'],[[1],[2]]])]) assert.throws(()=>p.builder(input),/1352/);
  const config=prepareDesignLiveRun(p,p.defaultInput);assert.equal(config.className,'ProductOfNumbers');assert.deepEqual(config.constructorArgs,[]);assert.deepEqual(config.operations,p.parseOperations(p.defaultInput).map(({name,args})=>({name,args})));
  assert.equal(p.prepareLiveDesign(Array.from({length:40000},()=>['add',1])).operations.length,40000);
  assert.throws(()=>p.prepareLiveDesign(Array.from({length:40001},()=>['add',1])),/1352/);
});

test('1352 pictures render each stream tile, prefix marker, pending add and query result in VI/EN without changing captures', () => {
  const host={innerHTML:'',querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host,steps:[],stepIndex:0,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-product-last-k-1352.js'),'utf8'),ctx);
  for(const input of cases) {
    ctx.steps=p.builder(input).steps;const saved=JSON.stringify(ctx.steps);
    for(const language of ['vi','en']) { ctx.lang=language;ctx.steps.forEach((step,index)=>{
      ctx.stepIndex=index;ctx.renderProductLastK1352View(step);const v=step.product1352View;
      assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
      assert.match(host.innerHTML,new RegExp(`data-source-line="${v.line}"`));
      assert.equal((host.innerHTML.match(/data-pk1352-value=/g)||[]).length,v.stream.length);
      assert.equal((host.innerHTML.match(/data-pk1352-prefix=/g)||[]).length,v.prefix.length);
      assert.equal((host.innerHTML.match(/data-pk1352-op=/g)||[]).length,v.operations.length+1);
      if(v.line===6) assert.match(host.innerHTML,/pk1352-number pending/);
      if(v.line===7) assert.match(host.innerHTML,/pk1352-discarded/);
      if(v.line===13) assert.match(host.innerHTML,/pk1352-zero-equation/);
      if(v.line===14) assert.match(host.innerHTML,/pk1352-cancellation/);
    }); }
    assert.equal(JSON.stringify(ctx.steps),saved);
  }
});

test('1352 picture assets load lazily with independent code themes and native line debugger enabled', () => {
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/renderer-product-last-k-1352|product-last-k-1352\.css/);
  assert.match(html,/trie-picture-ui\.js[^>]+data-problem-ids="[^"]*1352/);assert.match(html,/product-last-k-1352\.css/);assert.match(html,/renderer-product-last-k-1352\.js/);
  assert.match(fs.readFileSync(require.resolve('../public/trie-picture-ui.js'),'utf8'),/1224,1352,1504/);assert.equal(p.debugMode,'line-by-line');
});
