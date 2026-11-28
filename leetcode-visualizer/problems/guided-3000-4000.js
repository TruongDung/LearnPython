'use strict';
const {defineEasy}=require('./easy-lesson');const lessons={};
const {parseArguments}=require('./catalog-lesson');
const {attachMexReplay,attachSwapReplay}=require('./sequence-picture-replays');
const ideas={};
for(const entry of require('./guided-3000-4000.json')){
 const options={engine:entry.engine,harness:entry.harness,prelude:entry.prelude,method:entry.method,names:entry.names,kinds:entry.kinds,answerKind:entry.returnKind||undefined,difficulty:entry.difficulty,focus:entry.focus,description:entry.description,reference:entry.reference,stateClasses:entry.classes||[],objectClasses:(entry.classes||[]).filter(name=>name!=='Solution'),captureClasses:entry.captureClasses||[],exposeState:true,traceOptions:{maxEvents:entry.maxEvents||12000,summarizeLocals:entry.summarizeLocals||{}},teachingMode:'guided',scene:entry.scene||{compact:true,debug:true},guide:entry.guideEn,provenance:entry.provenance};
 if(entry.id===3948||entry.id===3962){options.engine='wasm';options.prelude=entry.id===3962?'from math import inf':'';options.maxArrayLength=entry.id===3948?60:12;}
 const lesson=defineEasy(entry.id,entry.title,entry.group,entry.sample,entry.expected,entry.code,ideas[entry.id]||entry.guideVi,'Xem các vòng lặp và kích thước trạng thái trong code','Không tính lịch sử mô phỏng',options);
 if(entry.engine==='javascript'){
  lesson.codeLabel={vi:'JavaScript · chạy thật · đồng hồ ảo',en:'JavaScript · actual execution · virtual clock'};
  lesson.code2=['// Clock ảo bắt đầu ở 0 ms; callbacks và cách gọi của ví dụ.','async function demo(args) {',...entry.harness.split('\n').map(line=>'    '+line),'}','demo('+JSON.stringify(entry.sample)+');'];
  lesson.code2Label={vi:'Ví dụ gọi hàm · callback được sử dụng',en:'Example invocation · bundled callbacks'};
 }
 if(/import pandas|pd\.DataFrame/.test(entry.code))lesson.codeLabel={vi:'Python · Pandas · từng bước trên bảng',en:'Python · Pandas · table operations'};
 lesson.liveEditorDisabled=true;
 lesson.sourceLanguage=entry.engine==='javascript'?'javascript':'python';
 if(entry.id===3998){
  const build=lesson.builder;
  lesson.builder=input=>{
   const[s,patterns]=parseArguments(input,lesson.__catalog);
   if(typeof s!=='string'||!/^[01]+$/.test(s)||!Array.isArray(patterns)||!patterns.length||!patterns.every(p=>typeof p==='string'&&p.length===s.length&&/^[01?]+$/.test(p)))throw new Error('#3998: s chỉ chứa 0/1; mỗi mẫu gồm 0/1/? và dài bằng s. / s must be binary; each pattern must use 0/1/? and have the same length as s.');
   return build(input);
  };
  lesson.statement={vi:'Sắp tăng dần một dãy con để biến s thành mẫu đích. Các vị trí được chọn không cần liền nhau. Mỗi dấu ? được thay bằng 0 hoặc 1.',en:'Sort a chosen subsequence to reach each target pattern. Chosen positions need not be adjacent. Replace each ? with 0 or 1.'};
  lesson.approach=[{vi:'Điền số 0 vào các dấu ? bên trái trước.',en:'Fill the leftmost ? positions with the required zeroes first.'},{vi:'Mỗi đoạn đầu của đích phải có ít nhất số 0 của nguồn.',en:'Every target prefix needs at least as many zeroes as the source prefix.'},{vi:'Hình vẽ sắp hai vị trí 1,0 thành 0,1.',en:'The drawing sorts two selected positions from 1,0 to 0,1.'}];
  lesson.complexity={time:'O(q × n²)',space:'O(n + q)',note:{vi:'Bao gồm tìm và vẽ các thao tác minh hoạ; không tính lịch sử debug.',en:'Includes finding the illustrated witness operations; excludes debug history.'}};
 }
 if(entry.id===3999){
  lesson.statement={vi:'Quay vòng độc lập các ký tự ở vị trí chẵn và lẻ. Hai từ cùng nhóm khi cả hai dãy đều quay được về cùng cặp đại diện. Chỉ số bắt đầu từ 0.',en:'Rotate even-position and odd-position characters independently. Two words share a group when both sequences rotate to the same representative pair. Indices start at 0.'};
  lesson.approach=[{vi:'Tím: vị trí chẵn. Xanh: vị trí lẻ.',en:'Purple: even positions. Teal: odd positions.'},{vi:'Thử các vòng quay, giữ chuỗi nhỏ nhất của mỗi màu.',en:'Try rotations and keep the smallest string of each color.'},{vi:'Cả hai đại diện trùng nhau → cùng nhóm.',en:'Both representatives match → the same group.'}];
  lesson.complexity={time:'O(Σ |w|²)',space:'O(Σ |w|)',note:{vi:'Bản minh hoạ duyệt từng vòng quay; không tính lịch sử debug.',en:'This teaching version visits each rotation; excludes debug history.'}};
 }
 if(entry.id===3946){
  const build=lesson.builder;
  lesson.builder=input=>{
   const[items,budget]=parseArguments(input,lesson.__catalog);
   if(!Array.isArray(items)||!items.length||items.length>10||!items.every(row=>Array.isArray(row)&&row.length===2&&row.every(v=>Number.isInteger(v)&&v>=1&&v<=1500))||!Number.isInteger(budget)||budget<0||budget>60)throw new Error('#3946: 1–10 loại [factor, price] nguyên dương ≤1500; ngân sách 0–60. / Use 1–10 item types with positive integer factors/prices ≤1500 and budget 0–60.');
   return build(input);
  };
  lesson.statement={vi:'Mua bản đầu của loại i: nhận một quà từ mỗi loại j ≠ i có factor[j] chia hết cho factor[i]. Mua lặp không nhận thêm quà. Tối đa hoá tổng số bản trong ngân sách.',en:'The first purchase of type i grants one free copy of every other type whose factor is divisible by factor[i]. Repeat purchases grant no extra gifts. Maximize all paid and free copies within the budget.'};
  lesson.approach=[{vi:'cnt[f] đếm số loại có hệ số f.',en:'cnt[f] counts item types with factor f.'},{vi:'gain[f] cộng cnt ở các bội của f, gồm bản mua đầu và quà.',en:'gain[f] sums counts at multiples of f, including the first paid copy and gifts.'},{vi:'Khởi tạo mua rẻ nhất, rồi cập nhật ngân sách từ phải sang trái.',en:'Start with cheapest copies, then update budgets from right to left.'}];
  lesson.complexity={time:'O(m log m + n × B)',space:'O(m + B)',note:{vi:'m = 1500. Không tính lịch sử debug; ô 0 được gom trong hình. Giới hạn hình: 10 loại, ngân sách 60.',en:'m = 1500. Excludes debug history; zero cells are compressed in the picture. Visual limit: 10 types, budget 60.'}};
 }
 if(entry.id===3948)attachMexReplay(lesson);
 if(entry.id===3962)attachSwapReplay(lesson);
 lessons[entry.id]=lesson;
}
module.exports=lessons;
