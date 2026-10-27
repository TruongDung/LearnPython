const base = require('./requested-visualizations')[9013];
const bi = (vi,en) => ({vi,en});
const CODE = [
  'def arrange(n):',
  '    is_square = lambda x: int(x ** 0.5) ** 2 == x',
  '    values = list(range(1, n + 1))',
  '    graph = {}',
  '    for a in values:',
  '        graph[a] = []',
  '        for b in values:',
  '            if a != b and is_square(a + b):',
  '                graph[a].append(b)',
  '    path = []',
  '    used = set()',
  '    def dfs(value):',
  '        path.append(value)',
  '        used.add(value)',
  '        if len(path) == n:',
  '            return True',
  '        candidates = sorted((x for x in graph[value] if x not in used), key=lambda x: (len(graph[x]), x))',
  '        for nxt in candidates:',
  '            child_ok = dfs(nxt)',
  '            if child_ok:',
  '                return True',
  '        used.remove(value)',
  '        path.pop()',
  '        return False',
  '    starts = sorted(values, key=lambda x: (len(graph[x]), x))',
  '    for start in starts:',
  '        found = dfs(start)',
  '        if found:',
  '            return path',
  '    return []',
];

function buildSquare9013(input) {
  const n = Number(Array.isArray(input) ? input[0] : input);
  if(!Number.isInteger(n)||n<1||n>16)throw new RangeError('9013: n phải là số nguyên 1…16 / n must be an integer from 1 to 16.');
  const steps=[],outer={n},stack=[];
  let values=[],graph=null,path=null,used=null,attempts=0,backtracks=0,solution=null;
  const ordered = items => [...items].sort((a,b)=>graph[a].length-graph[b].length||a-b);
  const copy = value => Array.isArray(value)?value.map(copy):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v)])):value;
  const titles={
    'define-is-square':bi('Kiểm tra số chính phương','Define square test'),'build-values':bi('Tạo các số 1…n','Build 1…n'),
    'build-graph':bi('Nối cặp có tổng chính phương','Connect square-sum pairs'),'path-init':bi('path = []','path = []'),
    'graph-row':bi('Chọn số a','Select a'),'graph-row-init':bi('Tạo hàng xóm của a','Initialize neighbors of a'),
    'graph-pair':bi('Thử cặp a + b','Try pair a + b'),'graph-check':bi('Tổng là số chính phương?','Is the sum a square?'),
    'graph-add':bi('Nối hai số ✓','Connect the pair ✓'),
    'used-init':bi('used = set()','used = set()'),'define-dfs':bi('Chuẩn bị DFS','Define DFS'),
    'sort-starts':bi('Thử điểm ít cạnh trước','Try lower-degree starts first'),'start-loop':bi('Chọn điểm đầu','Select start'),
    'path-append':bi('Thêm số vào đuôi','Append a number'),'mark-used':bi('Đánh dấu đã dùng','Mark used'),
    'complete-check':bi('Đủ n số?','All n numbers?'),'return-true':bi('Trả True ✓','Return True ✓'),
    'build-candidates':bi('Chọn hàng xóm chưa dùng','Find unused neighbors'),'candidate-loop':bi('Thử số tiếp theo','Try next number'),
    'child-result':bi('DFS con trả về','Child DFS returns'),'child-check':bi('Nhánh con thành công?','Child succeeded?'),
    'unmark-used':bi('Bỏ đánh dấu','Unmark used'),'path-pop':bi('Bỏ số cuối ↶','Pop last number ↶'),
    'return-false':bi('Trả False ↶','Return False ↶'),'dfs-result':bi('Nhận kết quả DFS','DFS returns'),
    'found-check':bi('Đã tìm thấy?','Found a path?'),'return-path':bi('Tìm được chuỗi ✓','Found arrangement ✓'),
    'return-empty':bi('Không có cách xếp','No arrangement'),
  };
  function emit(line,operation,options={}) {
    const frame=stack.at(-1),local=frame?.locals??outer;
    const locals=copy(frame?{...local,n,graph,path,used:used===null?null:[...used].sort((a,b)=>a-b)}:{...outer,
      ...(graph===null?{}:{graph}),...(path===null?{}:{path}),...(used===null?{}:{used:[...used].sort((a,b)=>a-b)})});
    const current=path?[...path]:[],candidates=frame?(frame.locals.candidates??[]):(outer.starts??[]);
    const focus=options.focus??frame?.locals.value??outer.start??null;
    const edges=[];
    if(graph)for(const a of values)for(const b of graph[a]??[])if(a<b)edges.push({u:a,v:b,sum:a+b,root:Math.sqrt(a+b)});
    const pairs=current.slice(1).map((value,i)=>[current[i],value]);
    const attempted=frame?(frame.locals.nxt??null):(outer.start??null);
    const view={
      n,phase:options.final?'done':options.phase??(graph===null?'graph':'search'),operation,
      source:{line,text:CODE[line-1],timing:'after',scope:frame?'dfs':'arrange'},locals,
      nodes:values.map(value=>({value,degree:graph?.[value]?.length??0,state:current.includes(value)?'path':candidates.includes(value)?'candidate':'available'})),
      edges:edges.map(edge=>({...edge,inPath:pairs.some(([a,b])=>a===edge.u&&b===edge.v||a===edge.v&&b===edge.u),current:options.edge?.includes(edge.u)&&options.edge?.includes(edge.v)||false})),
      path:current,pathReady:path!==null,used:used===null?null:[...used],candidates:[...candidates],
      focus,attempted,attempts,backtracks,omitted:0,traceTruncated:false,
      stack:stack.map(item=>({value:item.locals.value,nxt:item.locals.nxt??null,candidates:[...(item.locals.candidates??[])],child_ok:item.locals.child_ok??null})),
      tried:[...(frame?.tried??[])],condition:options.condition??null,returnValue:options.returnValue??null,
      probe:options.probe??null,
      solution:options.final&&solution?[...solution]:null,reason:options.reason??null,frame:steps.length,
    };
    steps.push({title:bi(`Dòng ${line} · ${(titles[operation]??bi(operation,operation)).vi}`,`Line ${line} · ${(titles[operation]??bi(operation,operation)).en}`),
      arr:[],highlight:[],mark:[],note:bi('',''),final:!!options.final,codeLines:[line],debugLine:line,
      vars:Object.entries(locals).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),
      square9013View:view});
  }
  emit(2,'define-is-square',{phase:'graph'});
  values=Array.from({length:n},(_,i)=>i+1);outer.values=values;
  emit(3,'build-values',{phase:'graph'});
  graph={};
  emit(4,'build-graph',{phase:'graph'});
  for(const a of values){
    outer.a=a;emit(5,'graph-row',{phase:'graph',focus:a,condition:{expression:'for a',result:true}});
    graph[a]=[];emit(6,'graph-row-init',{phase:'graph',focus:a});
    for(const b of values){
      outer.b=b;
      const probe={a,b,sum:a+b,square:Number.isInteger(Math.sqrt(a+b)),distinct:a!==b};
      emit(7,'graph-pair',{phase:'graph',focus:a,probe,condition:{expression:'for b',result:true}});
      const allowed=probe.distinct&&probe.square;
      emit(8,'graph-check',{phase:'graph',focus:a,probe,condition:{expression:'a != b and is_square(a + b)',result:allowed}});
      if(allowed){graph[a].push(b);emit(9,'graph-add',{phase:'graph',focus:a,probe,edge:[a,b]});}
    }
    emit(7,'graph-pair',{phase:'graph',focus:a,condition:{expression:'for b',result:false}});
  }
  emit(5,'graph-row',{phase:'graph',condition:{expression:'for a',result:false}});
  path=[];emit(10,'path-init');
  used=new Set();emit(11,'used-init');
  emit(12,'define-dfs');

  function dfs(value) {
    const frame={locals:{value},tried:[]};stack.push(frame);attempts++;
    path.push(value);emit(13,'path-append',{phase:'choose',focus:value});
    used.add(value);emit(14,'mark-used',{phase:'choose',focus:value});
    const complete=path.length===n;
    emit(15,'complete-check',{phase:'choose',condition:{expression:'len(path) == n',result:complete},reason:complete?'complete':'incomplete'});
    if(complete){
      solution=[...path];emit(16,'return-true',{phase:'choose',returnValue:true,reason:'complete'});
      stack.pop();return true;
    }
    frame.locals.candidates=ordered(graph[value].filter(next=>!used.has(next)));
    const candidates=frame.locals.candidates;
    emit(17,'build-candidates',{phase:candidates.length?'choose':'dead-end',reason:candidates.length?null:'no-candidate'});
    for(const next of candidates){
      frame.locals.nxt=next;
      emit(18,'candidate-loop',{phase:'try',edge:[value,next],condition:{expression:'for nxt',result:true}});
      frame.locals.child_ok=dfs(next);
      if(!frame.locals.child_ok)frame.tried.push(next);
      emit(19,'child-result',{phase:frame.locals.child_ok?'choose':'backtrack',edge:[value,next],reason:frame.locals.child_ok?'success':'failed'});
      emit(20,'child-check',{phase:frame.locals.child_ok?'choose':'backtrack',condition:{expression:'child_ok',result:frame.locals.child_ok},reason:frame.locals.child_ok?'true':'false'});
      if(frame.locals.child_ok){
        emit(21,'return-true',{phase:'choose',returnValue:true,reason:'child-success'});
        stack.pop();return true;
      }
    }
    emit(18,'candidate-loop',{phase:'dead-end',condition:{expression:'for nxt',result:false},reason:'exhausted'});
    used.delete(value);emit(22,'unmark-used',{phase:'backtrack'});
    path.pop();backtracks++;emit(23,'path-pop',{phase:'backtrack'});
    emit(24,'return-false',{phase:'backtrack',returnValue:false,reason:'exhausted'});
    stack.pop();return false;
  }
  outer.starts=ordered(values);emit(25,'sort-starts',{phase:'start'});
  for(const start of outer.starts){
    outer.start=start;emit(26,'start-loop',{phase:'start',condition:{expression:'for start',result:true}});
    outer.found=dfs(start);emit(27,'dfs-result',{phase:outer.found?'choose':'backtrack',reason:outer.found?'success':'failed'});
    emit(28,'found-check',{phase:outer.found?'choose':'backtrack',condition:{expression:'found',result:outer.found},reason:outer.found?'true':'false'});
    if(outer.found){emit(29,'return-path',{final:true,returnValue:[...path],reason:'solution'});return {original:[n],answer:[...path],steps};}
  }
  emit(26,'start-loop',{phase:'start',condition:{expression:'for start',result:false}});
  emit(30,'return-empty',{final:true,returnValue:[],reason:'exhausted'});
  return {original:[n],answer:[],steps};
}

module.exports={9013:{...base,code:CODE,debugMode:'line-by-line',builder:buildSquare9013}};
