'use strict';

function ds2243Text(vi,en){return typeof lang!=='undefined'&&lang==='vi'?vi:en;}
function ds2243Escape(value){return String(value??'…').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ds2243Color(index){return `var(--ds-color-${index%5})`;}
function ds2243Digits(text,extra=''){return [...text].map(d=>`<span class="ds2243-digit ${extra}">${d}</span>`).join('');}
function ds2243Scene(v,choice){
 if(!v.final)return v.current?{...v.current,preview:false}:null;
 if(!v.rounds.length)return null;
 let [r,g]=typeof choice==='string'?choice.split(':').map(Number):[];
 if(!Number.isInteger(r)||!Number.isInteger(g)||!v.rounds[r]?.groups[g]||v.rounds[r].groups[g].part===null){r=v.rounds.length-1;g=v.rounds[r].groups.findIndex(group=>group.total>=10);if(g<0)g=0;}
 const group=v.rounds[r].groups[g];
 return {round:r,group:g,text:group.text,total:group.total,processed:group.text.length,digit:null,appended:true,preview:true};
}
function ds2243Round(v,round,r,scene){
 const chosen=scene?.round===r?scene.group:-1;
 const groups=round.groups.map((group,g)=>`<button type="button" class="ds2243-group ${g===chosen?'selected':''}" style="--ds-group:${ds2243Color(g)}" data-ds2243-group="${r}:${g}" ${group.part===null?'disabled':''} aria-label="${ds2243Text('Xem nhóm','Inspect group')} ${g+1}: ${group.text}${group.total===null?'':` → ${group.total}`}"><span class="ds2243-group-label">${ds2243Text('Nhóm','Group')} ${g+1}${group.text.length<v.k?` · ${group.text.length}/${v.k}`:''}</span><span class="ds2243-group-digits">${[...group.text].map((d,i)=>`<span class="ds2243-digit ${g===chosen&&i<scene.processed?'read':''} ${g===chosen&&scene.digit!==null&&i===(scene.processed-(v.phase==='add'?1:0))?'active':''}">${d}</span>`).join('')}</span><span class="ds2243-down">↓</span><strong data-ds2243-part="${r}:${g}" data-ds2243-value="${group.part??''}">${group.part??'…'}</strong></button>`).join('');
 return `<section class="ds2243-round" data-ds2243-round="${r}"><header><b>${ds2243Text('Vòng','Round')} ${r+1}</b><small>${round.input.length} &gt; ${v.k}</small></header><div class="ds2243-groups">${groups}</div><div class="ds2243-join"><small>${ds2243Text('Nối chuỗi','Join strings')}</small><div class="ds2243-parts">${round.parts.map((part,g)=>`<span style="--ds-group:${ds2243Color(g)}">&quot;${part}&quot;</span>`).join('')||'<span>…</span>'}</div><i>→</i><output data-ds2243-output="${r}" data-ds2243-value="${round.output??''}">${round.output===null?'…':`&quot;${round.output}&quot;`}</output></div></section>`;
}
function ds2243Proof(v,scene){
 if(!scene||scene.text===null)return `<div class="ds2243-rule"><b>${ds2243Text('Chia nhóm → cộng → ghép','Split → sum → join')}</b><small>${v.final?ds2243Text('Độ dài đã ≤ k, trả về nguyên chuỗi.','Length is already ≤ k; return the original string.'):ds2243Text('Mỗi nhóm tạo ra một phần của chuỗi mới.','Each group creates one part of the new string.')}</small></div>`;
 const full=scene.processed===scene.text.length,added=scene.text.slice(0,scene.processed),pending=scene.text.slice(scene.processed);
 return `<section class="ds2243-proof" data-ds2243-proof="${scene.round}:${scene.group}" style="--ds-group:${ds2243Color(scene.group)}"><header><small>${ds2243Text('Vòng','Round')} ${scene.round+1} · ${ds2243Text('nhóm','group')} ${scene.group+1}</small>${scene.preview?`<button type="button" data-ds2243-replay="${scene.round}:${scene.group}">${ds2243Text('Tới bước tính','Replay calculation')} →</button>`:''}</header><div class="ds2243-equation">${scene.total===null?'…':added?[...added].map((digit,i)=>`${i?'<i>+</i>':''}<span data-ds2243-added="${digit}">${digit}</span>`).join(''):'<span data-ds2243-added="0">0</span>'}<i>=</i><b data-ds2243-total="${scene.total??''}">${scene.total??'…'}</b></div>${pending?`<div class="ds2243-pending"><small>${ds2243Text('Chờ cộng','To add')}</small>${[...pending].map((d,i)=>`<span class="ds2243-digit ${i===0&&v.phase==='choose-digit'?'active':''}">${d}</span>`).join('')}</div>`:''}<div class="ds2243-keep">${scene.appended?`<span>→</span><strong data-ds2243-kept="${scene.total}">&quot;${scene.total}&quot;</strong><small>${scene.total>=10?ds2243Text(`Giữ cả ${String(scene.total).length} chữ số`,`Keep all ${String(scene.total).length} digits`):ds2243Text('Giữ tổng của nhóm','Keep the group sum')}</small>`:`<small>${full?ds2243Text('Đã cộng xong · chờ thêm vào parts','Sum complete · awaiting append to parts'):ds2243Text('Cộng từng chữ số trong nhóm','Add each digit in the group')}</small>`}</div></section>`;
}
function renderDigitSumString2243Pictures(step){
 const v=step.digitSumString2243View;if(!v)return;
 const host=typeof document!=='undefined'?document.getElementById('treeView'):$('treeView');if(!host)return;
 const state=host.dataset??{},key=JSON.stringify([v.s,v.k]);
 if(state.ds2243KeyState!==key){state.ds2243KeyState=key;delete state.ds2243ChoiceState;}
 const scene=ds2243Scene(v,state.ds2243ChoiceState),open=host.querySelector?.('.ds2243-debug')?.open??false;
 const presets=[['11111222223',3,'Mẫu · 135','Example · 135'],['9999',2,'Giữ tổng 18','Keep sum 18'],['00000000',3,'Giữ số 0','Keep zeros'],['12345',3,'Nhóm cuối ngắn','Short last group'],['123',3,'Đã đủ ngắn','Already short']];
 host.innerHTML=`<article class="ds2243-viz" data-source-line="${v.source.line}" data-phase="${v.phase}"><header class="ds2243-heading"><small>2243 · DIGIT SUM</small><h2>${ds2243Text('Chia nhóm → cộng chữ số → ghép lại','Split → sum digits → join')}</h2></header><nav class="ds2243-presets">${presets.map(([s,k,vi,en],i)=>`<button type="button" data-ds2243-preset="${i}">${ds2243Text(vi,en)}</button>`).join('')}</nav><div class="ds2243-metrics"><div><small>${ds2243Text('Mỗi nhóm tối đa','Group size up to')}</small><b>k = ${v.k}</b></div><div><small>${ds2243Text('Độ dài hiện tại','Current length')}</small><b>${v.working.length}</b></div></div>${v.rounds.length===0?`<div class="ds2243-input"><small>${ds2243Text('Chuỗi ban đầu','Original string')}</small><div>${ds2243Digits(v.s)}</div></div>`:''}${v.rounds.map((round,r)=>ds2243Round(v,round,r,scene)).join('')}${v.final?`<section class="ds2243-answer"><small>${v.working.length} ≤ ${v.k} · ${ds2243Text('Dừng','Stop')}</small><strong data-ds2243-answer="${v.answer}">&quot;${v.answer}&quot;</strong></section>`:''}<div class="ds2243-card">${ds2243Proof(v,scene)}</div><footer class="ds2243-controls"><button type="button" data-ds2243-control="first">↶ ${ds2243Text('Đầu','First')}</button><button type="button" data-ds2243-control="group" ${v.rounds.length===0&&v.final?'disabled':''}>${ds2243Text('Xong một nhóm','Finish group')} →</button><button type="button" data-ds2243-control="round" ${v.rounds.length===0&&v.final?'disabled':''}>${ds2243Text('Xong một vòng','Finish round')} ↓</button><button type="button" data-ds2243-control="last">${ds2243Text('Kết quả','Result')} ⇥</button></footer><details class="ds2243-debug" ${open?'open':''}><summary>${ds2243Text('Code / biến đang chạy','Code / live variables')}</summary><code>L${v.source.line} · ${ds2243Escape(v.source.text)}</code><div class="ds2243-vars">${step.vars.map(x=>`<span>${ds2243Escape(x.name)} = <b>${ds2243Escape(JSON.stringify(x.value))}</b></span>`).join('')}</div><button type="button" data-ds2243-control="line">${ds2243Text('Từng dòng','Next line')} →</button></details></article>`;
 const stop=()=>{if(typeof stopPlay==='function')stopPlay();},go=index=>{if(typeof steps==='undefined'||index<0||index>=steps.length)return;stop();stepIndex=index;renderStep();};
 host.querySelectorAll?.('[data-ds2243-control]').forEach(el=>el.addEventListener('click',()=>{
  const action=el.dataset.ds2243Control;
  if(action==='first')return go(0);
  if(action==='last'){delete state.ds2243ChoiceState;return go(steps.length-1);}
  if(action==='line')return go(Math.min(stepIndex+1,steps.length-1));
  const index=steps.findIndex((s,i)=>i>stepIndex&&s.digitSumString2243View?.phase===(action==='group'?'append':'join'));go(index<0?steps.length-1:index);
 }));
 host.querySelectorAll?.('[data-ds2243-group]').forEach(el=>el.addEventListener('click',()=>{
  const cell=el.dataset.ds2243Group,[r,g]=cell.split(':').map(Number);
  if(v.final){state.ds2243ChoiceState=cell;stop();renderDigitSumString2243Pictures(step);}else go(v.rounds[r].groups[g].step);
 }));
 host.querySelectorAll?.('[data-ds2243-replay]').forEach(el=>el.addEventListener('click',()=>{const[r,g]=el.dataset.ds2243Replay.split(':').map(Number);go(v.rounds[r].groups[g].step);}));
 host.querySelectorAll?.('[data-ds2243-preset]').forEach(el=>el.addEventListener('click',async()=>{
  const[s,k]=presets[Number(el.dataset.ds2243Preset)];document.getElementById('arrInput').value=s;document.querySelector('#extraParams [data-param="k"]').value=k;await runViz();stop();
 }));
 host.querySelectorAll?.('button,summary').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();}));
}
