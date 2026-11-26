'use strict';

// Only executed locals supply split rows, candidates, keys, and group members.
function renderRotationGroups3999(v, language) {
  const t=(vi,en)=>language==='vi'?vi:en;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const x=v.locals||{}, words=v.args[0]||[], line=v.line;
  const index=Number.isInteger(x.index)?x.index:-1;
  const word=typeof x.word==='string'?x.word:'';
  const rotating=line>=8&&line<=14;
  const parity=rotating&&Number.isInteger(x.parity)?x.parity:-1;
  const keys=line>=7&&Array.isArray(x.key)?x.key:[];
  const groups=Array.isArray(x.groups?.__pairs__)?x.groups.__pairs__:[];
  const signature=line>=15&&Array.isArray(x.signature)?x.signature:null;

  function tiles(text,p,offset=0,withIndices=true,difference=-1) {
    if(text==='')return `<span class="rg3999-empty" aria-label="${esc(t('Dãy rỗng','Empty sequence'))}">∅</span>`;
    const original=p===0?x.even:x.odd;
    return `<div class="rg3999-tiles">${[...text].map((letter,i)=>{
      const sourceIndex=typeof original==='string'&&original.length?(i+offset)%original.length*2+p:null;
      return `<span class="rg3999-tile parity-${p} ${i===difference?'difference':''}"><b>${esc(letter)}</b>${withIndices&&sourceIndex!==null?`<small>${sourceIndex}</small>`:''}</span>`;
    }).join('')}</div>`;
  }
  function lane(p) {
    const splitReady=!!word&&line>=(p===0?5:6)&&typeof x[p===0?'even':'odd']==='string';
    const original=splitReady?x[p===0?'even':'odd']:null;
    const active=parity===p;
    const best=typeof keys[p]==='string'?keys[p]:active&&line>=9&&typeof x.best==='string'?x.best:null;
    const candidate=active&&line>=11&&line<=13&&typeof x.candidate==='string'?x.candidate:null;
    const offset=candidate!==null&&Number.isInteger(x.offset)?x.offset:0;
    const difference=candidate!==null&&typeof x.best==='string'?[...candidate].findIndex((c,i)=>c!==x.best[i]):-1;
    let bestOffset=0;
    if(original&&best!==null)for(let i=0;i<original.length;i++)if(original.slice(i)+original.slice(0,i)===best){bestOffset=i;break;}
    return `<section class="rg3999-lane parity-${p} ${active?'active':''}">
      <header><span class="rg3999-parity">${p}</span><b>${p===0?t('Chẵn','Even'):t('Lẻ','Odd')}</b><small>${p===0?'0 · 2 · 4 …':'1 · 3 · 5 …'}</small></header>
      <div class="rg3999-strip">${original===null?'<span class="rg3999-pending">···</span>':tiles(original,p)}</div>
      ${candidate!==null?`<div class="rg3999-wrap" aria-label="${esc(t('Quay trái '+offset+' vị trí','Rotate left by '+offset+' positions'))}"><svg viewBox="0 0 160 26" aria-hidden="true"><path d="M17 23 Q17 7 35 7 H142 M142 7 L135 1 M142 7 L135 13"/></svg><span>← ${offset}</span></div><div class="rg3999-candidate" data-parity="${p}" data-offset="${offset}">${tiles(candidate,p,offset,true,difference)}</div>`:''}
      <div class="rg3999-best"><small>min ↻</small>${best===null?'<span class="rg3999-pending">···</span>':tiles(best,p,bestOffset,false)}${line===13&&active?'<strong class="rg3999-check">✓</strong>':''}</div>
    </section>`;
  }
  const signatureView=signature?`<div class="rg3999-signature" aria-label="${esc(t('Cặp đại diện','Representative pair'))}"><span class="rg3999-key parity-0">${esc(signature[0]||'∅')}</span><b>+</b><span class="rg3999-key parity-1">${esc(signature[1]||'∅')}</span><span>→</span>${groups.some(([key])=>JSON.stringify(key)===JSON.stringify(signature))?`<b>${String.fromCharCode(65+groups.findIndex(([key])=>JSON.stringify(key)===JSON.stringify(signature)))}</b>`:'<b>＋</b>'}</div>`:'';
  return `<section class="rg3999" data-rotation-groups="3999">
    <nav class="rg3999-words" aria-label="${esc(t('Các từ đầu vào','Input words'))}">${words.map((w,i)=>`<span class="${i===index&&!v.final?'active':''} ${v.final||i<index||i===index&&line>=18?'done':''}" data-word-index="${i}"><small>${i+1}</small><b>${esc(w)}</b></span>`).join('')}</nav>
    <div class="rg3999-word" aria-label="${esc(t('Vị trí trong từ hiện tại','Positions in the current word'))}">${word?[...word].map((letter,i)=>`<span class="rg3999-tile parity-${i%2}"><b>${esc(letter)}</b><small>${i}</small></span>`).join(''):'<span class="rg3999-pending">···</span>'}</div>
    <div class="rg3999-split" aria-hidden="true"><span>↙</span><span>↘</span></div>
    <div class="rg3999-lanes">${lane(0)}${lane(1)}</div>
    ${signatureView}
    <section class="rg3999-groups"><header><b>${v.final?t('Nhóm','Groups'):t('Nhóm đã tạo','Groups so far')}</b><strong>${groups.length}</strong></header><div class="rg3999-buckets">${groups.length?groups.slice(0,8).map(([key,members],i)=>`<article class="rg3999-bucket ${signature&&JSON.stringify(key)===JSON.stringify(signature)?'active':''}"><header><b>${String.fromCharCode(65+i)}</b><span class="rg3999-key parity-0">${esc(key[0]||'∅')}</span><span>+</span><span class="rg3999-key parity-1">${esc(key[1]||'∅')}</span></header><div>${members.length?members.map(member=>`<span>${esc(member)}</span>`).join(''):'<span class="rg3999-pending">···</span>'}</div></article>`).join(''):'<span class="rg3999-empty">∅</span>'}</div>${groups.length>8?`<small>8 / ${groups.length}</small>`:''}</section>
  </section>`;
}
