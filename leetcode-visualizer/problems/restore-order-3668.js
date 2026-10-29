'use strict';

const {runTrace} = require('./wasm-picture-trace');
const bi = (vi,en) => ({vi,en});
const code = [
  'class Solution:',
  '    def recoverOrder(self, order, friends):',
  '        friend_set = set(friends)',
  '        result = []',
  '        for position, runner in enumerate(order):',
  '            is_friend = runner in friend_set',
  '            if is_friend:',
  '                result.append(runner)',
  '        return result',
];

function parse(order, params={}) {
  if (!Array.isArray(order) || !order.length || order.length>100 ||
      !order.every(id=>Number.isSafeInteger(id)&&id>=1&&id<=order.length) || new Set(order).size!==order.length) {
    throw new RangeError('#3668: order phải là hoán vị 1…n, tối đa 100 người / order must be a permutation of 1…n, up to 100 runners.');
  }
  let friends;
  try {
    const raw=params.friends??'1,3,4';
    friends=Array.isArray(raw)?[...raw]:typeof raw==='string'&&raw.trim().startsWith('[')?JSON.parse(raw):typeof raw==='string'?raw.split(',').map(value=>value.trim()===''?NaN:Number(value)):null;
  } catch {throw new TypeError('friends: nhập 1,3,4 hoặc [1,3,4] / enter comma-separated IDs or a JSON array.');}
  if (!Array.isArray(friends) || !friends.length || friends.length>Math.min(8,order.length) ||
      !friends.every((id,index)=>Number.isSafeInteger(id)&&id>=1&&id<=order.length&&(!index||id>friends[index-1]))) {
    throw new RangeError('friends: 1–8 ID khác nhau, tăng dần và nằm trong order / use 1–8 distinct increasing IDs present in order.');
  }
  return [[...order],[...friends]];
}

function builder(input,params={}) {
  const [order,friends]=parse(input,params);
  const trace=runTrace({code:code.join('\n'),method:'recoverOrder',args:[order,friends]});
  const checked=[],added=[];
  let active=null,verdict=null;
  const steps=trace.events.map((record,index)=>{
    const {line,locals}=record;
    let event='step';
    if (line===3) event='set';
    if (line===4) event='init';
    if (line===5) {active=record.branch?locals.position:null;verdict=null;event=record.branch?'runner':'exhausted';}
    if (line===6) {verdict=locals.is_friend;checked.push({position:locals.position,runner:locals.runner,isFriend:verdict});event='lookup';}
    if (line===7) event=verdict?'accept':'skip';
    if (line===8) {added.push(locals.position);event='append';}
    const final=index===trace.events.length-1;
    if (final) {active=null;verdict=null;event='return';}
    return {arr:[], codeBlock:1, codeLines:[line], final,
      title:bi(`L${line} · ${event}`,`L${line} · ${event}`),note:bi('',''),
      vars:['position','runner','is_friend','friend_set','result'].map(name=>({name,value:Object.hasOwn(locals,name)?locals[name]:'—'})),
      finishing3668View:{source:{line,text:code[line-1].trim(),timing:'after'},event,
        locals,outer:record.outer,frames:record.frames,scope:record.scope,
        branch:record.branch,returning:record.returning,returned:record.returned,
        order:[...order],friends:[...friends],friendSet:locals.friend_set??null,result:locals.result??null,
        active,verdict,checked:checked.map(item=>({...item})),added:[...added],
        move:line===8?{from:locals.position,to:locals.result.length-1,runner:locals.runner}:null,
        done:final,answer:final?trace.answer:null},
    };
  });
  return {original:order,answer:trace.answer,steps};
}

module.exports={3668:{
  id:3668,difficulty:'easy',slug:'restore-finishing-order',
  title:bi('Restore Finishing Order','Restore Finishing Order'),
  titleVi:bi('Thứ tự về đích của nhóm bạn','Friends in finishing order'),
  category:{key:'array',vi:'Mảng',en:'Array'},
  tags:[{key:'hash-set',vi:'Hash Set',en:'Hash Set'}],
  statement:bi('order là thứ tự về đích. Chỉ giữ các ID trong friends, theo đúng thứ tự của order.',
    'order gives the finishing order. Keep only IDs in friends, preserving their order in order.'),
  inputKind:'positive',defaultInput:[3,1,2,5,4],
  inputLabel:bi('order · hoán vị 1…n','order · permutation of 1…n'),
  extraParams:[{key:'friends',type:'string',default:'1,3,4',label:bi('friends · ID tăng dần, tối đa 8 bạn','friends · increasing IDs, up to 8 friends')}],
  debugMode:'line-by-line',
  approach:[bi('Duyệt hàng về đích → kiểm tra trong set → thêm bạn vào result.',
    'Scan the finishers → look up the ID in the set → append friends to result.')],
  complexity:{time:'O(n + m)',space:'O(m)',note:bi('n người chạy, m bạn; quét order một lần.','n runners, m friends; scan order once.')},
  code,liveArgs:(input,params)=>parse(input,params),builder,
}};
