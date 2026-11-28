'use strict';
const {defineEasy}=require('./easy-lesson');const lessons={};
for(const entry of require('./guided-4000-5000.json')){
 const options={engine:entry.engine,harness:entry.harness,prelude:entry.prelude,method:entry.method,names:entry.names,kinds:entry.kinds,answerKind:entry.returnKind||undefined,difficulty:entry.difficulty,focus:entry.focus,description:entry.description,reference:entry.reference,stateClasses:entry.classes||[],objectClasses:(entry.classes||[]).filter(name=>name!=='Solution'),captureClasses:entry.captureClasses||[],exposeState:true,traceOptions:{maxEvents:entry.maxEvents||12000},teachingMode:'guided',scene:entry.scene||{compact:true,debug:true},guide:entry.guideEn,provenance:entry.provenance};
 if(entry.id===4123)options.maxArrayLength=12;
 const lesson=defineEasy(entry.id,entry.title,entry.group,entry.sample,entry.expected,entry.code,entry.guideVi,'Xem các vòng lặp và kích thước trạng thái trong code','Không tính lịch sử mô phỏng',options);
 lesson.liveEditorDisabled=true;
 lesson.sourceLanguage='python';
 if(entry.id===4123){
  lesson.statement={vi:'Mỗi lần xóa một đoạn liên tiếp dài ít nhất 2; phí bằng tổng hai đầu. Nối phần còn lại và tìm tổng phí nhỏ nhất để xóa hết. Mô phỏng DP: 2–12 số nguyên.',en:'Delete a contiguous segment of at least 2 items, paying the sum of its endpoints. Join the remaining items and minimize the total cost to delete everything. DP visualization: 2–12 integers.'};
  lesson.complexity={time:'O(n³)',space:'O(n²)',note:{vi:'Mô hình DP để học, giới hạn 12 số; không tính lịch sử mô phỏng.',en:'Teaching DP model, capped at 12 items; excludes replay history.'}};
 }
 lessons[entry.id]=lesson;
}
module.exports=lessons;
