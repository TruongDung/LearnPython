function renderAtoi8Pictures(step) {
  const v = step.atoi8View, t = (vi, en) => lang === "vi" ? vi : en, esc = value => escapeHtml(String(value));
  const phases = [t("Bỏ ␣", "Skip ␣"), t("Dấu ±", "Sign ±"), t("Ghép số", "Build digits"), t("Kết quả", "Result")];
  const phase = ["spaces", "sign", "digits", "result"].indexOf(v.stage);
  const start = Math.max(0, Math.min(v.i - 5, v.s.length - 10)), end = Math.min(v.s.length, start + 10);
  const stopped = v.reason === "non-digit" || v.event === "digit-check" && !v.check && v.i < v.s.length;
  let chars = "";
  for (let index = start; index <= end; index++) {
    const eof = index === v.s.length, current = index === v.i, x = 36 + (index - start) * 59;
    const kind = eof ? "eof" : v.overflow && current || stopped && index >= v.i ? "stop" : v.consumed[index] || "pending";
    const char = eof ? "∅" : v.s[index] === " " ? "␣" : v.s[index];
    chars += `<g class="a8-char ${kind}${current ? " current" : ""}"><rect x="${x}" y="44" width="51" height="55" rx="9"/><text class="glyph" x="${x + 25.5}" y="79" text-anchor="middle">${esc(char)}</text><text class="index" x="${x + 25.5}" y="120" text-anchor="middle">${eof ? "EOF" : index}</text>${kind === "space" ? `<path class="skip" d="M${x + 8},88 L${x + 43},55"/>` : kind === "digit" ? `<text class="tick" x="${x + 44}" y="95">✓</text>` : ""}</g>`;
    if (current) chars += `<g class="a8-pointer"><text x="${x + 25.5}" y="17" text-anchor="middle">i = ${v.i}</text><path d="M${x + 19},25 L${x + 32},25 L${x + 25.5},37 Z"/></g>`;
  }
  const m = v.math, checking = ["overflow-check", "clamp", "append", "move-digit"].includes(v.event);
  const overflow = checking && m && m.candidate > v.limit;
  const math = m
    ? `<text class="caption" x="42" y="185">${t("Ghép chữ số", "Append digit")} · s[${m.index}] = '${m.digit}'</text><text class="equation" x="232" y="225" text-anchor="middle">${m.before} × 10 + ${m.digit}</text><path class="arrow" d="M232,238 v15 m-6,-6 6,6 6,-6"/><text class="number ${overflow ? "danger" : m.appended ? "good" : ""}" x="232" y="284" text-anchor="middle">${m.candidate}</text><text class="caption" x="232" y="311" text-anchor="middle">${overflow ? t("Không ghi vào value", "Not stored in value") : m.appended ? "value ✓" : t("Số dự kiến", "Candidate")}</text>`
    : `<text class="caption" x="42" y="185">${step.final ? t("Áp dấu", "Apply sign") : "value"}</text><text class="number" x="232" y="247" text-anchor="middle">${step.final ? `${v.sign === -1 ? "−1" : "+1"} × ${v.value}` : v.value ?? "?"}</text><text class="caption" x="232" y="290" text-anchor="middle">${step.final ? `= ${v.answer}` : t("Chờ chữ số →", "Await digit →")}</text>`;
  const gate = checking && m
    ? `<text class="caption" x="584" y="185" text-anchor="middle">${t("Vượt giới hạn?", "Above the limit?")}</text><text class="gate-value ${overflow ? "danger" : "good"}" x="584" y="218" text-anchor="middle">${m.candidate}</text><text class="compare ${overflow ? "danger" : "good"}" x="584" y="246" text-anchor="middle">${overflow ? "&gt; ✕" : "≤ ✓"}</text><text class="gate-value" x="584" y="274" text-anchor="middle">${v.limit}</text><text class="caption" x="584" y="311" text-anchor="middle">${overflow ? t("Chặn 32-bit", "Clamp to 32-bit") : t("Có thể ghép", "Safe to append")}</text>`
    : `<text class="caption" x="584" y="185" text-anchor="middle">${t("Dấu", "Sign")}</text><text class="number sign" x="584" y="231" text-anchor="middle">${v.sign === null ? "?" : v.sign === -1 ? "−" : "+"}</text><text class="caption" x="584" y="270" text-anchor="middle">${t("Độ lớn tối đa", "Magnitude limit")}</text><text class="gate-value" x="584" y="301" text-anchor="middle">${v.limit ?? "—"}</text>`;
  const status = v.reason === "overflow" ? t("Vượt 32-bit → chặn", "Overflow → clamp") : v.reason === "end" ? t("Hết chuỗi", "End of input") : v.reason === "non-digit" ? t("Gặp ký tự khác → dừng", "Non-digit → stop") : "";
  const examples = ["   -042xyz", "1337c0d3", "words and 987", "0-1", "2147483648", "-2147483649", ""];
  const host = $("treeView");
  host.innerHTML = `<section class="a8-viz" aria-label="8 · String to Integer">
    <header><strong>8 · atoi</strong><button type="button" data-a8-next ${step.final ? "disabled" : ""}>${t("Ký tự tiếp", "Next character")} ⏭</button><button type="button" data-a8-result>${t("Kết quả", "Result")}</button></header>
    <div class="a8-phases">${phases.map((text, i) => `<span class="${i === phase ? "active" : i < phase ? "done" : ""}"><b>${i < phase ? "✓" : i + 1}</b>${text}</span>`).join("")}</div>
    <div class="a8-line"><b>L${v.line}</b><code>${esc(v.source)}</code>${v.check === null ? "" : `<strong class="${v.check ? "yes" : "no"}">${v.check ? "True ✓" : "False ✕"}</strong>`}</div>
    <div class="a8-picture"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 335" role="img" aria-label="${esc(t("Con trỏ", "Pointer"))} i=${v.i}, value=${v.value ?? "?"}${m ? `, ${m.before} × 10 + ${m.digit} = ${m.candidate}` : ""}">
      ${chars}<text class="caption" x="36" y="146">${start ? `← ${start} ${t("ký tự trước", "earlier characters")}` : ""}</text><text class="caption" x="684" y="146" text-anchor="end">${end < v.s.length ? `${v.s.length - end - 1} ${t("ký tự sau", "later characters")} →` : ""}</text>
      <rect class="panel" x="20" y="163" width="424" height="166" rx="12"/><rect class="panel" x="457" y="163" width="243" height="166" rx="12"/>${math}${gate}
    </svg></div>
    <div class="a8-legend"><span class="space">␣ ${t("bỏ", "skip")}</span><span class="sign">± ${t("dấu", "sign")}</span><span class="digit">✓ ${t("đã ghép", "appended")}</span><span class="stop">✕ ${t("dừng", "stop")}</span><span>∅ ${t("hết chuỗi", "end")}</span></div>
    ${step.final ? `<div class="a8-answer"><span>${status}</span><strong>return ${v.answer}</strong></div>` : ""}
    <div class="a8-examples">${examples.map((s, i) => `<button type="button" data-a8-example="${i}">${esc(JSON.stringify(s))}</button>`).join("")}</div>
  </section>`;
  host.querySelector("[data-a8-result]").addEventListener("click", () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector("[data-a8-next]").addEventListener("click", () => {
    const target = steps.findIndex((s, i) => i > stepIndex && (s.atoi8View?.i > v.i || s.final));
    stopPlay(); stepIndex = target < 0 ? steps.length - 1 : target; renderStep();
  });
  host.querySelectorAll("[data-a8-example]").forEach(button => button.addEventListener("click", () => { $("arrInput").value = examples[Number(button.dataset.a8Example)]; runViz(); }));
}
