"use strict";
function palindrome5Jump(kind) {
    if (typeof steps === 'undefined' || typeof renderStep !== 'function') return;
    if (typeof stopPlay === 'function') stopPlay();
    const next = steps.findIndex((s,i)=>i>stepIndex && s.palindrome5View && (kind === 'best' ? s.palindrome5View.bestUpdated : kind === 'answer' ? s.final : s.palindrome5View.line === (s.palindrome5View.mode === 'dp' ? 9 : 6)));
    if (next>=0) {stepIndex=next; renderStep();}
}
function renderPalindrome5(step) {
    const v=step.palindrome5View, vi=typeof lang!=='undefined'&&lang==='vi', t=(a,b)=>vi?a:b;
    const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const n=v.chars.length, pair=v.candidate, valid=i=>i>=0&&i<n, inside=(i,r)=>r&&i>=r[0]&&i<=r[1];
    const text=r=>r?v.chars.slice(Math.max(0,r[0]),Math.min(n,r[1]+1)).join(''):'';
    const inBounds=pair&&pair.every(valid), compared=v.checked!==null;
    const stopped=compared&&!v.checked;
    const status=v.final?t('Hoàn tất', 'Complete'):vi?v.phase.vi:v.phase.en;
    let explanation=t('Chọn một tâm rồi thử mở rộng. Chỉ đoạn đã khớp mới được dùng để cập nhật best.', 'Choose a center and expand. Only a confirmed matching range may update best.');
    if(v.mode==='dp') explanation=t('dp[i][j] cho biết đoạn s[i..j] có đối xứng hay không. Dấu · nghĩa là ô chưa xét.', 'dp[i][j] tells whether s[i..j] is a palindrome. A dot means the cell has not been tested.');
    if(pair) {
        if(!inBounds) explanation=t('Đã chạm biên chuỗi. Dừng mở rộng tại tâm này.', 'Reached a string boundary. Stop expanding this center.');
        else if(stopped) explanation=v.chars[pair[0]]!==v.chars[pair[1]]?t('Hai ký tự khác nhau → đoạn này không đối xứng.', 'The characters differ → this range is not a palindrome.'):t('Hai đầu giống nhau nhưng đoạn bên trong không đối xứng → loại.', 'The ends match, but the interior is not a palindrome → reject.');
        else if(v.checked) explanation=t('Hai đầu khớp và phần bên trong hợp lệ. Đoạn này đối xứng; so độ dài với best.', 'Matching ends and a valid interior confirm a palindrome. Compare its length with best.');
        else explanation=t('Đang chuẩn bị cặp ký tự tiếp theo. Chưa kết luận đoạn mới có đối xứng.', 'Preparing the next pair. The new range has not yet been confirmed.');
    }
    if(v.bestUpdated) explanation=t('Đoạn đã xác nhận dài hơn best cũ → lưu làm kết quả tốt nhất mới.', 'The confirmed range is longer than the old best → save the new best.');
    if(v.final) explanation=t('Đã thử hết các tâm / đoạn. Nếu có nhiều đáp án cùng độ dài, giữ đoạn gặp trước.', 'All centers / ranges have been tested. Ties keep the first range found.');
    const cells=v.chars.map((ch,i)=>{
        const left=pair&&pair[0]===i, right=pair&&pair[1]===i;
        return `<div class="p5-cell ${inside(i,v.accepted)?'confirmed':''} ${inside(i,v.best)?'best':''} ${left||right?'endpoint':''} ${stopped&&(left||right)?'mismatch':''}"><small>${i}</small><b>${esc(ch===' '?'␣':ch)}</b><em>${left&&right?'L · R':left?'L':right?'R':'&nbsp;'}</em>${v.mode==='center'&&v.center===i&&v.kind?`<span class="p5-center ${v.kind}">${v.kind==='odd'?'▲':'▲'}</span>`:''}</div>`;
    }).join('');
    const compare=pair?`<div class="p5-compare ${stopped?'stopped':''}"><div><small>${v.mode==='dp'?'i':'L'} = ${pair[0]}</small><b>${valid(pair[0])?esc(v.chars[pair[0]]):'∅'}</b></div><strong>${compared?(inBounds?(v.chars[pair[0]]===v.chars[pair[1]]?'=':'≠'):t('biên','edge')):'?'}</strong><div><small>${v.mode==='dp'?'j':'R'} = ${pair[1]}</small><b>${valid(pair[1])?esc(v.chars[pair[1]]):'∅'}</b></div><p>${compared?(v.checked?'✓ '+t('Đối xứng','Palindrome'):'✕ '+t('Dừng / loại','Stop / reject')):t('Chờ kiểm tra','Awaiting check')}</p></div>`:'';
    let table='';
    if(v.mode==='dp'&&v.table.length) {
        const tested=new Set(v.tested), dep=pair&&pair[1]-pair[0]>=2?[pair[0]+1,pair[1]-1]:null;
        table=`<section class="p5-dp"><div class="p5-recurrence"><b>dp[i][j] = (s[i] == s[j]) AND (j − i &lt; 2 OR dp[i+1][j−1])</b><span>${dep?`[${pair}] ← [${dep}] · ${t('đọc ô bên trong','read the interior cell')}`:t('Độ dài 1 hoặc 2: chỉ cần kiểm tra hai đầu.','Length 1 or 2: only the endpoints need checking.')}</span></div><div class="p5-table-scroll"><table><thead><tr><th>i ↓ / j →</th>${v.chars.map((ch,j)=>`<th>${j}<small>${esc(ch)}</small></th>`).join('')}</tr></thead><tbody>${v.chars.map((ch,i)=>`<tr><th>${i}<small>${esc(ch)}</small></th>${v.chars.map((_,j)=>{
            const known=tested.has(`${i},${j}`), value=known?(v.table[i][j]?'T':'F'):'·';
            return `<td class="${j<i?'unused':known?(v.table[i][j]?'yes':'no'):''} ${pair&&i===pair[0]&&j===pair[1]?'current':''} ${dep&&i===dep[0]&&j===dep[1]?'dependency':''}" aria-label="dp[${i}][${j}] ${j<i?'—':value}">${j<i?'—':value}</td>`;
        }).join('')}</tr>`).join('')}</tbody></table></div><small>T = ${t('đối xứng','palindrome')} · F = ${t('không đối xứng','not a palindrome')} · ${t('viền cam: ô đang xét · viền xanh dương: ô bên trong','orange outline: current cell · blue outline: interior dependency')}</small></section>`;
    }
    const buttons=[['check',t('Cặp tiếp →','Next check →')],['best',t('Best tiếp ↑','Next best ↑')],['answer',t('Đáp án ✓','Answer ✓')]].map(([kind,label])=>`<button type="button" data-p5-jump="${kind}"${v.final?' disabled':''}>${label}</button>`).join('');
    const host=typeof $==='function'?$('treeView'):document.getElementById('treeView');
    host.innerHTML=`<section class="p5-viz"><header class="p5-header"><span>#5 · ${v.mode==='dp'?'DP':t('Mở rộng từ tâm','Expand from center')}</span><strong>${esc(status)}</strong></header><div class="p5-rule">${v.mode==='center'?`<span><b>① ${t('Tâm lẻ','Odd center')}</b> a <u>b</u> a · L = R</span><span><b>② ${t('Tâm chẵn','Even center')}</b> a b <u>│</u> b a · R = L + 1</span>`:`<span>${t('Xét đoạn ngắn trước → dùng lại kết quả cho đoạn dài.','Process short ranges first → reuse their results for longer ranges.')}</span>`}</div>
        <div class="p5-string-scroll"><div class="p5-string">${cells||`<i>${t('Chuỗi rỗng','Empty string')}</i>`}</div></div>
        ${v.mode==='center'&&v.kind?`<div class="p5-center-label">▲ ${v.kind==='odd'?t('Tâm trên ký tự','Center on a character'):t('Tâm giữa hai ký tự','Center between characters')} ${v.kind==='odd'?v.center:`${v.center} | ${v.center+1}`} · ${t('mở rộng','expand')} ← L · R →</div>`:''}
        <div class="p5-legend"><span>🟠 L / R</span><span>🟢 ${t('Đoạn đã xác nhận','Confirmed range')}</span><span>🔵 ${t('Gạch dưới = best','Underline = best')}</span></div>
        ${compare}<p class="p5-explanation" role="status">${esc(explanation)}</p>
        <div class="p5-results"><div><small>${t('Đoạn đã xác nhận ở lần này','Confirmed in this attempt')}</small><b>${v.accepted?'“'+esc(text(v.accepted))+'”':'—'}</b><span>${v.accepted?`${t('độ dài','length')} ${v.accepted[1]-v.accepted[0]+1}`:''}</span></div><div class="p5-best ${v.bestUpdated?'updated':''}"><small>${v.final?t('ĐÁP ÁN','ANSWER'):t('TỐT NHẤT TỚI HIỆN TẠI','BEST SO FAR')}</small><b>“${esc(v.bestText)}”</b><span>${t('độ dài','length')} ${Math.max(0,v.best[1]-v.best[0]+1)} ${v.best[1]>=0?`· [${v.best}]`:''}</span></div></div>
        ${table}<nav class="p5-actions">${buttons}</nav><div class="p5-presets"><small>${t('Thử ví dụ','Try an example')}</small>${['babad','cbbd','racecar','aaaa'].map(s=>`<button type="button" data-p5-preset="${s}">${s}</button>`).join('')}</div>
        <details class="p5-source"><summary>L${v.line} · ${esc(status)}</summary><code>${esc(v.source)}</code></details></section>`;
    host.querySelectorAll('[data-p5-jump]').forEach(button=>button.addEventListener('click',()=>palindrome5Jump(button.dataset.p5Jump)));
    host.querySelectorAll('[data-p5-preset]').forEach(button=>button.addEventListener('click',()=>{const input=document.getElementById('arrInput'),run=document.getElementById('runBtn');if(input&&run){input.value=button.dataset.p5Preset;run.click();}}));
}
