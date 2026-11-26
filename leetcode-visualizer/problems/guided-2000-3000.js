'use strict';
const {defineEasy}=require('./easy-lesson');const lessons={};
const ideas=require('./guided-ideas');
for(const entry of require('./guided-2000-3000.json')){
 const options={engine:entry.engine,harness:entry.harness,prelude:entry.prelude,method:entry.method,names:entry.names,kinds:entry.kinds,answerKind:entry.returnKind||undefined,difficulty:entry.difficulty,focus:entry.focus,description:entry.description,reference:entry.reference,stateClasses:entry.classes||[],objectClasses:(entry.classes||[]).filter(name=>name!=='Solution'),captureClasses:entry.captureClasses||[],exposeState:true,traceOptions:{maxEvents:entry.maxEvents||12000},teachingMode:'guided',provenance:entry.provenance};
 const lesson=defineEasy(entry.id,entry.title,entry.group,entry.sample,entry.expected,entry.code,ideas[entry.id]||entry.guideVi,'Xem các vòng lặp và kích thước trạng thái trong code','Không tính lịch sử mô phỏng',options);
 if(entry.engine==='javascript'){
  lesson.codeLabel={vi:'JavaScript · chạy thật · đồng hồ ảo',en:'JavaScript · actual execution · virtual clock'};
  lesson.code2=['// Clock ảo bắt đầu ở 0 ms; callbacks và cách gọi của ví dụ.','async function demo(args) {',...entry.harness.split('\n').map(line=>'    '+line),'}','demo('+JSON.stringify(entry.sample)+');'];
  lesson.code2Label={vi:'Ví dụ gọi hàm · callback được sử dụng',en:'Example invocation · bundled callbacks'};
 }
 if(/import pandas|pd\.DataFrame/.test(entry.code))lesson.codeLabel={vi:'Python · Pandas · từng bước trên bảng',en:'Python · Pandas · table operations'};
 lesson.liveEditorDisabled=true;
 lesson.sourceLanguage=entry.engine==='javascript'?'javascript':'python';
 lessons[entry.id]=lesson;
}
module.exports=lessons;
