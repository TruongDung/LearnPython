'use strict';
const {defineEasy}=require('./easy-lesson');const lessons={};
for(const entry of require('./guided-4000-5000.json')){
 const options={engine:entry.engine,harness:entry.harness,prelude:entry.prelude,method:entry.method,names:entry.names,kinds:entry.kinds,answerKind:entry.returnKind||undefined,difficulty:entry.difficulty,focus:entry.focus,description:entry.description,reference:entry.reference,stateClasses:entry.classes||[],objectClasses:(entry.classes||[]).filter(name=>name!=='Solution'),captureClasses:entry.captureClasses||[],exposeState:true,traceOptions:{maxEvents:entry.maxEvents||12000},teachingMode:'guided',scene:entry.scene||{compact:true,debug:true},guide:entry.guideEn,provenance:entry.provenance};
 const lesson=defineEasy(entry.id,entry.title,entry.group,entry.sample,entry.expected,entry.code,entry.guideVi,'Xem các vòng lặp và kích thước trạng thái trong code','Không tính lịch sử mô phỏng',options);
 lesson.liveEditorDisabled=true;
 lesson.sourceLanguage='python';
 lessons[entry.id]=lesson;
}
module.exports=lessons;
