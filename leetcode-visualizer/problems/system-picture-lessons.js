'use strict';
const {runTrace}=require('./wasm-picture-trace');
const allocator=require('./server-allocator-9018')[9018],library=require('./lib-register-9019')[9019];
const bi=(vi,en)=>({vi,en});
const copy=x=>JSON.parse(JSON.stringify(x));
const ALLOCATOR_HARNESS=`
class Solution:
    def run(self, inventory, operations):
        allocator = ServerAllocator(inventory)
        results = []
        for index, (method, argument) in enumerate(operations):
            results.append(getattr(allocator, method)(argument))
        return results`;
const LIBRARY_HARNESS=`
    def traceEntry(self, registrations, template):
        try:
            return self.evaluateLibrary(registrations, template)
        except ValueError as error:
            return {'error': str(error)}`;
function instanceState(e,key){return e.locals.self??[...e.frames].reverse().find(f=>f.locals.self&&key in f.locals.self)?.locals.self??{};}
function buildAllocator(input,params={},block=1){
 const {inventory,operations}=allocator.parseServerAllocator9018Input(input,params),code=(block===2?allocator.code2:allocator.code),native=runTrace({code:code.join('\n')+ALLOCATOR_HARNESS,method:'run',args:[inventory,operations.map(o=>[o.kind,o.arg])],stateClasses:['ServerAllocator']});
 if(native.trace.truncated)throw new Error('9018: incomplete Python trace.');
 const events=native.events.filter(e=>e.line<=code.length),history=[],outputs=[];
 const steps=events.map((e,index)=>{
  const state=instanceState(e,block===2?'used_masks':'used'),opIndex=e.outer.index??-1,operation=operations[opIndex]??null;
  const keys=new Set(block===2?Object.keys(state.used_masks??{}):[...Object.keys(state.used??{}),...Object.keys(state.free??{}),...Object.keys(state.next_id??{})]);
  if(operation)keys.add(operation.serverType);
  const types=[...keys].sort().map(name=>{
   if(block===2){const mask=state.used_masks?.[name]??0;const used=[];for(let i=0;i<54;i++)if(BigInt(mask)&(1n<<BigInt(i)))used.push(i+1);let minimum=1;while(used.includes(minimum))minimum++;return{name,used,free:[],next:null,mask:String(mask),minimum,pending:!Object.hasOwn(state.used_masks??{},name)};}
   const used=[...(state.used?.[name]??[])],free=[...(state.free?.[name]??[])],next=state.next_id?.[name]??null;let minimum=1;while(used.includes(minimum))minimum++;return{name,used,free,next,minimum,mask:null,pending:!Object.hasOwn(state.used??{},name)};
  });
  if(operation&&e.scope===operation.kind&&e.returning){outputs.push(e.returned);history.push({index:opIndex,kind:operation.kind,arg:operation.arg,value:e.returned,step:index});}
  const final=index===events.length-1;
  const view={id:9018,block,line:e.line,source:code[e.line-1].trim(),scope:e.scope,condition:e.branch,final,types,
    operations:operations.map(o=>({kind:o.kind,arg:o.arg})),opIndex,operation:operation?{...operation}:null,history:history.map(copy),outputs:[...outputs],
    number:e.locals.number??null,mask:e.locals.mask===undefined?null:String(e.locals.mask),freeBit:e.locals.free_bit===undefined?null:String(e.locals.free_bit),returned:e.returning?e.returned:null};
  return frame(view,e.locals,block);
 });
 const finalInventory=steps.at(-1).systemPictureView.types.flatMap(t=>t.used.map(n=>`${t.name}-${n}`)).sort();
 return{original:[...inventory],operations:operations.map(o=>({name:o.kind,args:[o.arg]})),answer:native.answer,finalInventory,steps};
}
function buildLibrary(input,params={}){
 // Preserve the existing parser and expansion bounds before tracing Python.
 const bounded=library.builder(input,params);
 if(bounded.error&&!bounded.error.startsWith('Cycle detected'))throw new RangeError(bounded.error);
 const args=library.liveArgs(input,params),code=library.code,native=runTrace({code:code.join('\n')+LIBRARY_HARNESS,method:'traceEntry',args,stateClasses:['Library'],objectClasses:['Library'],traceCalls:['dfs'],maxEvents:8000});
 if(native.trace.truncated)throw new RangeError('9019: ví dụ quá dài để debug từng dòng; hãy dùng ít ký tự hoặc tham chiếu hơn / use a smaller example for line-by-line replay.');
 let events=native.events.filter(e=>e.line<=code.length),error=null;
 const cycle=events.findIndex(e=>e.line===20);if(cycle>=0){events=events.slice(0,cycle+1);error=bounded.error??'Cycle detected';}
 const saved=new Map();
 const steps=events.map((e,index)=>{
  const state=instanceState(e,'registrations'),registrations=state.registrations??e.locals.library?.registrations??{},frames=e.frames.filter(f=>f.name==='dfs').map(f=>({source:f.locals.source,text:f.locals.text,index:f.locals.index??null,char:f.locals.char??null,inside:f.locals.inside??null,variable:f.locals.variable??[],result:f.locals.result??[]}));
  if(e.scope==='Register'&&e.line===6)saved.set(e.locals.name,index);
  const visiting=e.locals.visiting??[...e.frames].reverse().find(f=>Array.isArray(f.locals.visiting))?.locals.visiting??[];
  const final=index===events.length-1,view={id:9019,line:e.line,source:code[e.line-1].trim(),scope:e.scope,condition:e.branch,timing:e.timing??'after',final,
    registrations:Object.entries(registrations).map(([name,value])=>({name,value,step:saved.get(name)})),template:args[1],frames:frames.map(copy),visiting:[...visiting],
    activeName:e.scope==='Register'||e.scope==='dfs'&&e.line>=18&&e.line<=24?e.locals.name??null:null,
    output:final&&!error?native.answer:null,error:final?error:null,cycle:!!error&&final,returned:e.returning?e.returned:null};
  return frame(view,e.locals);
 });
 return{original:args[0],answer:error?null:native.answer,error,steps};
}
function frame(view,locals,block=1){return{title:bi(`Dòng ${view.line} · ${view.scope}`,`Line ${view.line} · ${view.scope}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[view.line],codeBlock:block,final:view.final,vars:Object.entries(locals).map(([name,value])=>({name,value})),systemPictureView:view};}
module.exports={
 9018:{...allocator,builder:(input,params)=>buildAllocator(input,params),builder2:(input,params)=>buildAllocator(input,params,2),approach:[bi('Mỗi loại có một dãy ID riêng. Min-heap giữ các ô trống; bitmask dùng bit 0 thấp nhất để chọn đúng ID nhỏ nhất.','Each type has its own ID row. A min-heap stores gaps; a bitmask selects the lowest zero bit to allocate the smallest free ID.')]},
 9019:{...library,builder:buildLibrary,approach:[bi('Registry nối tên với template. DFS thay từng %NAME%; visiting đánh dấu đường đang mở để phát hiện chu kỳ.','The registry connects names to templates. DFS expands each %NAME%; visiting marks the current path to detect cycles.')]},
};
