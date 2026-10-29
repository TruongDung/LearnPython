function renderLogSystem635Pictures(step) {
  const v=step.logSystem635View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=escapeHtml,q=v.query,c=v.current;
  const lengths={Year:4,Month:7,Day:10,Hour:13,Minute:16,Second:19},fields=['YYYY','MM','DD','hh','mm','ss'];
  const result=value=>value===null?'None':JSON.stringify(value);
  const timestamp=(value,length=19)=>`<div class="ls635-time">${value.split(':').map((part,i)=>`${i?'<i>:</i>':''}<span class="${[4,7,10,13,16,19][i]<=length?'kept':'ignored'}" data-time-field="${i}" data-kept="${[4,7,10,13,16,19][i]<=length}"><small>${fields[i]}</small><b>${part}</b></span>`).join('')}</div>`;
  const operations=v.operations.map((op,i)=>`<span class="ls635-op ${i===c?.operationIndex?'active':''}"><small>${i+1}</small><code>${op.name==='put'?`put(${op.args[0]})`:`retrieve(${op.args[2]})`}</code>${i<v.outputs.length?`<b>${result(v.outputs[i])}</b>`:''}</span>`).join('');
  const bound=(label,value,key)=>`<div class="ls635-bound"><header><code>${label}</code><b data-bound-key="${label}" data-value="${key??'pending'}">${key??'…'}</b></header>${timestamp(value,q.length)}</div>`;
  const cut=q?`<section class="ls635-cut"><header><b>timestamp[:length]</b><small>length = ${q.length}</small></header><div class="ls635-granularities">${Object.entries(lengths).map(([name,length])=>`<button type="button" data-log-granularity="${name}" aria-pressed="${name===q.granularity}"><b>${name}</b><small>${length}</small></button>`).join('')}</div>${bound('start',q.start,q.startKey)}${bound('end',q.end,q.endKey)}<div class="ls635-cut-legend"><span>${t('Màu: giữ lại','Color: keep')}</span><span class="ignored">${t('Mờ: bỏ qua','Dim: ignore')}</span></div></section>`:'';
  const rows=v.logs.map((log,index)=>{
    const decision=q?.decisions.find(d=>d.index===index),included=q?.matches?.includes(log.id),active=q?.activeIndex===index;
    const status=!q?(c?.logId===log.id?'new':'stored'):included?'included':decision?decision.matches?'hit':'miss':'pending';
    return `<article class="ls635-log ${status} ${active?'active':''}" data-log-id="${log.id}" data-log-status="${status}"><header><b>id ${log.id}</b><strong>${status==='included'?'✓':status==='hit'?'→ +':status==='miss'?'×':status==='new'?'+':'…'}</strong></header>${timestamp(log.timestamp,q?.length??19)}</article>`;
  }).join('');
  const storage=`<section class="ls635-storage"><header><b>self.logs</b><small>${q?`${q.scanned}/${v.logs.length}`:v.logs.length}</small></header><div class="ls635-log-list">${rows||'<div class="ls635-empty">▤ ∅</div>'}</div></section>`;
  const compared=q?.verdict!==null&&q?.activeIndex>=0&&q?.keyIndex===q?.activeIndex;
  const keyCard=(label,value)=>`<div><small>${label}</small><b>${value??'…'}</b></div>`;
  const comparison=q&&q.activeIndex>=0?`<section class="ls635-compare" data-comparison="${compared?q.verdict:'pending'}"><header><b>id ${q.logId}</b><small>${q.key!==null&&q.keyIndex!==q.activeIndex?t('key ↶ vòng trước','key ↶ previous loop'):v.event==='append'?t('đã thêm ID','ID appended'):''}</small></header><div class="ls635-inequality">${keyCard('start_key',q.startKey)}<strong>≤</strong>${keyCard('key',q.key)}<strong>≤</strong>${keyCard('end_key',q.endKey)}</div><div class="ls635-verdict ${compared?q.verdict?'yes':'no':''}">${compared?`${q.startKey<=q.key?'✓':'×'} ≤ key ≤ ${q.key<=q.endKey?'✓':'×'} → ${q.verdict?'True':'False'}`:'…'}</div></section>`:'';
  const basket=q?`<section class="ls635-result ${v.event==='return'?'returned':''}"><header><b>${v.event==='return'?'return result':'result'}</b><small>${q.matches?.length??'…'}</small></header><div data-log-result="${q.matches===null?'pending':JSON.stringify(q.matches)}">${q.matches===null?'<i>…</i>':q.matches.length?q.matches.map(id=>`<span class="${v.event==='append'&&id===q.logId?'appended':''}" data-result-id="${id}">${id}</span>`).join(''):'<i>[]</i>'}</div></section>`:'';
  const example=[['put',1,'2017:01:01:23:59:59'],['put',2,'2017:01:01:22:59:59'],['put',3,'2016:01:01:00:00:00'],['retrieve','2016:01:01:01:01:01','2017:01:01:23:00:00','Year'],['retrieve','2016:01:01:01:01:01','2017:01:01:23:00:00','Hour']];
  const presets=[
    {label:'Year / Hour',ops:example},
    {label:t('Hai biên','Both bounds'),ops:[['put',1,'2020:06:15:10:00:00'],['put',2,'2020:06:15:11:00:00'],['put',3,'2020:06:15:12:00:00'],['retrieve','2020:06:15:10:00:00','2020:06:15:11:00:00','Hour']]},
    {label:t('Không khớp','No match'),ops:[['put',1,'2020:01:01:00:00:00'],['retrieve','2021:01:01:00:00:00','2021:12:31:23:59:59','Year']]},
  ];
  host.innerHTML=`<section class="ls635-viz" aria-label="Log Storage #635"><header class="ls635-heading"><b>▤ #635 · Log System</b><small>${t('Dòng','Line')} ${v.line}${step.final?' · ✓':''}</small></header><div class="ls635-presets">${presets.map((preset,i)=>`<button type="button" data-log-preset="${i}">${esc(preset.label)}</button>`).join('')}</div><div class="ls635-ops" tabindex="0" role="region" aria-label="${t('Các lệnh','Operations')}">${operations}</div><header class="ls635-current"><code>${esc(c?.label??'LogSystem()')}</code>${q?`<small>${q.granularity} · ${q.length} ${t('ký tự','characters')}</small>`:''}</header>${cut}${comparison}${basket}${storage}<code class="ls635-source">${esc(v.source.trim())}</code><details class="ls635-why"><summary>${t('Vì sao?','Why?')}</summary><div>${esc(pick(v.explanation))}</div></details></section>`;
  const rail=host.querySelector?.('.ls635-ops'),active=rail?.querySelector('.active');
  if(active)rail.scrollLeft=Math.max(0,active.offsetLeft-rail.offsetLeft-rail.clientWidth/2+active.clientWidth/2);
  async function loadQuery(ops,index,granularity){
    $('arrInput').value=JSON.stringify(ops);await runViz();
    const next=steps.findIndex(s=>s.logSystem635View?.line===12&&s.logSystem635View.current?.operationIndex===index&&(!granularity||s.logSystem635View.query?.granularity===granularity));
    if(next>=0){stepIndex=next;renderStep();}
  }
  host.querySelectorAll?.('[data-log-preset]').forEach(button=>{
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();});
    button.addEventListener('click',()=>{const ops=presets[Number(button.dataset.logPreset)].ops;loadQuery(ops,ops.findIndex(op=>op[0]==='retrieve'));});
  });
  host.querySelectorAll?.('[data-log-granularity]').forEach(button=>{
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();});
    button.addEventListener('click',()=>{const ops=v.operations.map(op=>[op.name,...op.args]);ops[c.operationIndex][3]=button.dataset.logGranularity;loadQuery(ops,c.operationIndex,button.dataset.logGranularity);});
  });
}
