"use strict";

function add2Jump(kind) {
  if (typeof steps === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  const target = kind === "sum" ? 9 : kind === "write" ? 11 : 15;
  const next = steps.findIndex((step, index) => index > stepIndex && step.addTwoNumbers2View?.line === target);
  if (next >= 0) { stepIndex = next; renderStep(); }
}

function renderAddTwoNumbers2(step) {
  const v = step.addTwoNumbers2View;
  const vi = typeof lang !== "undefined" && lang === "vi";
  const t = (a,b) => vi ? a : b;
  const esc = value => String(value ?? "").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const c = v.column;
  const number = digits => [...digits].reverse().join("").replace(/^0+(?=\d)/, "") || "0";
  const totalColumns = Math.max(v.a.length, v.b.length, v.output.length, (c?.index ?? -1) + 1);
  const active = c?.index ?? 0, count = Math.min(totalColumns, 8);
  const start = Math.max(0, Math.min(active - 3, totalColumns - count));
  const indices = Array.from({ length: count }, (_, i) => start + i);
  const place = i => i < 4 ? (vi ? ["Đơn vị","Chục","Trăm","Nghìn"] : ["Ones","Tens","Hundreds","Thousands"])[i] : `10${String(i).replace(/\d/g,d=>"⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`;
  const sourceKnown = c && c.total !== null;
  const isInputDone = v.cursorA === null && v.cursorB === null;

  function chain(label, values, kind, cursor) {
    const cells = indices.map(i => {
      const exists = i < values.length, pointed = cursor === i, current = c?.index === i;
      const written = kind === "result" && exists;
      const text = exists ? values[i] : kind === "result" ? "?" : "0";
      const sub = pointed ? kind === "a" ? "l1 ↓" : "l2 ↓" : !exists && kind !== "result" ? t("hết → 0", "ended → 0") : written ? "✓" : "";
      return `<div class="a2-slot${current?" is-column":""}"><div class="a2-node ${kind}${!exists?" is-empty":""}${pointed?" is-pointer":""}${written?" is-written":""}${c?.written&&current&&kind==="result"?" is-new":""}" data-index="${i}" data-value="${exists?values[i]:""}"><b>${esc(text)}</b></div><small>${esc(sub)}</small>${i < start+count-1 ? '<i class="a2-link" aria-hidden="true">→</i>' : ""}</div>`;
    }).join("");
    return `<div class="a2-chain ${kind}"><strong>${label}</strong><div class="a2-chain-grid" style="--a2-cols:${count}">${cells}</div><span class="a2-end" title="${t("Cuối danh sách", "End of list")}">∅</span></div>`;
  }
  const columns = indices.map(i=>`<span class="${c?.index===i?"is-current":""}"><b>${esc(place(i))}</b><small>10^${i}</small></span>`).join("");
  const incoming = c ? c.carryIn : 0;
  const carryAt = c?.carryOut > 0 ? c.index + 1 : null;
  const carryRail = indices.map(i=>{
    const previous = v.history.find(item=>item.index===i-1);
    const amount = c?.index===i ? incoming : previous?.carryOut || 0;
    return `<span>${amount ? `<b class="a2-carry-chip">${t("nhớ", "carry")} ${amount} ↓</b>` : carryAt===i ? `<b class="a2-carry-chip">${t("nhớ", "carry")} 1 →</b>` : ""}</span>`;
  }).join("");

  function term(value, cls, label) {
    return `<span class="a2-term ${cls}"><small>${label}</small><b>${value === null ? "?" : esc(value)}</b></span>`;
  }
  const formula = c ? `<section class="a2-calculator" aria-label="${t("Phép cộng ở cột hiện tại", "Current column addition")}">
    <header><span>${esc(place(c.index))}</span><strong>${sourceKnown ? `${c.a} + ${c.b} + ${incoming} = ${c.total}` : t("Lấy hai chữ số cùng hàng", "Read matching digits")}</strong></header>
    <div class="a2-equation">${term(c.a,"a","A")}<i>+</i>${term(c.b,"b","B")}<i>+</i>${term(incoming,"carry",t("nhớ vào", "carry in"))}<i>=</i>${term(c.total,"total",t("tổng", "total"))}</div>
    <div class="a2-split"><div class="a2-write${c.written?" ready":""}"><span>↓ % 10</span><strong>${c.digit === null ? "?" : c.digit}</strong><small>${t("GHI VÀO NODE", "WRITE TO NODE")}</small></div><div class="a2-carry-out${c.carryOut?" active":""}"><span>÷ 10 ${t("lấy phần nguyên", "integer part")} →</span><strong>${c.carryOut === null ? "?" : c.carryOut}</strong><small>${c.carryOut ? t("NHỚ SANG HÀNG KẾ", "CARRY TO NEXT PLACE") : t("KHÔNG CÓ SỐ NHỚ", "NO OUTGOING CARRY")}</small></div></div>
    ${isInputDone && c.carryIn > 0 && c.index >= Math.max(v.a.length,v.b.length) ? `<div class="a2-last-carry">${t("Hai danh sách đã hết → tạo thêm node cho số nhớ", "Both lists ended → create a final node for the carry")}</div>` : ""}
  </section>` : `<div class="a2-start">${t("Cộng từ đầu danh sách: đơn vị → chục → trăm", "Start at the heads: ones → tens → hundreds")} <b>→</b></div>`;
  const history = v.history.length ? `<div class="a2-history">${v.history.slice(-5).map(item=>`<span class="${item.index===c?.index?"is-current":""}"><small>${esc(place(item.index))}</small><b>${item.a} + ${item.b} + ${item.carryIn} = ${item.total}</b><em>${t("ghi", "write")} ${item.digit} · ${t("nhớ", "carry")} ${item.carryOut}</em></span>`).join("")}</div>` : "";
  const button = (kind,label) => {
    const line=kind==="sum"?9:kind==="write"?11:15;
    const available=typeof steps!=="undefined"&&steps.some((s,i)=>i>stepIndex&&s.addTwoNumbers2View?.line===line);
    return `<button type="button" data-a2-jump="${kind}"${available?"":" disabled"}>${label}</button>`;
  };
  const host=typeof $==="function"?$("treeView"):document.getElementById("treeView");
  host.innerHTML=`<section class="a2-viz" aria-label="${t("Cộng hai danh sách chữ số", "Add two digit lists")}">
    <header class="a2-header"><span>#2</span><div class="a2-numbers"><b class="a">${number(v.a)}</b><i>+</i><b class="b">${number(v.b)}</b><i>=</i><b class="result">${v.final?number(v.answer):"?"}</b></div></header>
    <div class="a2-rule"><span>① ${t("Đầu list = hàng đơn vị", "List head = ones place")}</span><span>② ${t("Thiếu chữ số → dùng 0", "Missing digit → use 0")}</span></div>
    <section class="a2-paper"><div class="a2-place-row"><span></span><div style="--a2-cols:${count}">${columns}</div><span></span></div><div class="a2-rail"><span></span><div style="--a2-cols:${count}">${carryRail}</div><span></span></div>
      ${chain("A",v.a,"a",v.cursorA)}${chain("B",v.b,"b",v.cursorB)}<div class="a2-divider"></div>${chain("=",v.output,"result",null)}
      ${totalColumns>count?`<small class="a2-window">${t("Đang xem cột", "Showing columns")} ${start+1}–${start+count} / ${totalColumns}</small>`:""}
    </section>${formula}${history}
    ${v.final?`<div class="a2-answer"><span>${t("Danh sách kết quả", "Result list")}</span><b>${v.answer.join(" → ")}</b><i>⇢</i><span>${t("số", "number")} <strong>${number(v.answer)}</strong></span></div>`:""}
    <nav class="a2-actions" aria-label="${t("Đi tới bước quan trọng", "Jump to a key step")}">${button("sum",t("Cộng cột tiếp →", "Next column sum →"))}${button("write",t("Ghi chữ số ↓", "Write digit ↓"))}${button("done",t("Đáp án ✓", "Answer ✓"))}</nav>
    <div class="a2-presets"><small>${t("Thử ví dụ", "Try an example")}</small><button type="button" data-a2-preset="2,4,3;5,6,4">342 + 465</button><button type="button" data-a2-preset="9,9;1">99 + 1</button><button type="button" data-a2-preset="2,4,3;5">342 + 5</button></div>
    <details class="a2-source"><summary>L${v.line} · ${esc(vi?v.phase.vi:v.phase.en)}</summary><code>${esc(v.source)}</code></details>
  </section>`;
  host.querySelectorAll("[data-a2-jump]").forEach(button=>button.addEventListener("click",()=>add2Jump(button.dataset.a2Jump)));
  host.querySelectorAll("[data-a2-preset]").forEach(button=>button.addEventListener("click",()=>{
    const input=document.getElementById("arrInput"),run=document.getElementById("runBtn");
    if(input&&run){input.value=button.dataset.a2Preset;run.click();}
  }));
}
