'use strict';
const {defineEasy}=require('./easy-lesson');
const {attachDeletionReplay}=require('./deletion-4123-replay');const lessons={};
for(const entry of require('./guided-4000-5000.json')){
 const options={engine:entry.engine,harness:entry.harness,prelude:entry.prelude,method:entry.method,names:entry.names,kinds:entry.kinds,answerKind:entry.returnKind||undefined,difficulty:entry.difficulty,focus:entry.focus,description:entry.description,reference:entry.reference,stateClasses:entry.classes||[],objectClasses:(entry.classes||[]).filter(name=>name!=='Solution'),captureClasses:entry.captureClasses||[],exposeState:true,traceOptions:{maxEvents:entry.maxEvents||12000},teachingMode:'guided',scene:entry.scene||{compact:true,debug:true},guide:entry.guideEn,provenance:entry.provenance};
 if(entry.id===4123)options.maxArrayLength=80;
 const lesson=defineEasy(entry.id,entry.title,entry.group,entry.sample,entry.expected,entry.code,entry.guideVi,'Xem các vòng lặp và kích thước trạng thái trong code','Không tính lịch sử mô phỏng',options);
 lesson.liveEditorDisabled=true;
 lesson.sourceLanguage='python';
 if(entry.id===4123){
  lesson.statement={vi:'Mỗi lần xóa một đoạn liên tiếp dài ít nhất 2; phí bằng tổng hai đầu. Nối phần còn lại và tìm tổng phí nhỏ nhất để xóa hết. Mô phỏng: 2–80 số nguyên.',en:'Delete a contiguous segment of at least 2 items, paying the sum of its endpoints. Join the remaining items and minimize the total cost to delete everything. Visualization: 2–80 integers.'};
  lesson.complexity={time:'O(n)',space:'O(1)',note:{vi:'Không tính lịch sử và đường đi dùng để vẽ hình.',en:'Excludes replay snapshots and paths used for drawing.'}};
  delete lesson.code2; delete lesson.code2Label;
  attachDeletionReplay(lesson);
 }
 lessons[entry.id]=lesson;
}
module.exports=lessons;
