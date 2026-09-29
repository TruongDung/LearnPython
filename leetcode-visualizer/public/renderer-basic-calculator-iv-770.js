"use strict";

function renderBasicCalculatorIV770View(step) {
  const raw = step && step.calculator770View && typeof step.calculator770View === "object"
    ? step.calculator770View
    : {};
  const locale = typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
  const text = (en, vi) => locale === "vi" ? vi : en;
  const escape = (value) => String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const localized = (value, fallback = "") => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return String(value[locale] ?? value.en ?? value.vi ?? fallback);
    }
    return typeof value === "string" ? value : fallback;
  };
  const safeInteger = (value, minimum, maximum) => Number.isSafeInteger(value)
    && value >= minimum && value <= maximum ? value : null;

  const expression = typeof raw.expression === "string" ? raw.expression.slice(0, 250) : "";
  const tokenTypes = new Set(["number", "variable", "operator", "lparen", "rparen"]);
  const tokens = Array.isArray(raw.tokens) ? raw.tokens.slice(0, 260).flatMap((token) => {
    if (!token || typeof token !== "object" || typeof token.value !== "string") return [];
    const value = token.value.slice(0, 48);
    const type = tokenTypes.has(token.type) ? token.type : "variable";
    const start = safeInteger(token.start, 0, 250) ?? 0;
    const end = safeInteger(token.end, start, 250) ?? start;
    return [{ value, type, start, end }];
  }) : [];
  const index = safeInteger(raw.index, 0, tokens.length) ?? 0;

  const sanitizeTerms = (value, maximum = 12) => Array.isArray(value)
    ? value.slice(0, maximum).flatMap((term) => {
      if (!term || typeof term !== "object" || !Number.isSafeInteger(term.coefficient)) return [];
      const variables = Array.isArray(term.variables)
        ? term.variables.slice(0, 40).filter((variable) => typeof variable === "string" && /^[a-z]+$/.test(variable))
        : [];
      return [{
        coefficient: term.coefficient,
        variables,
        degree: variables.length,
      }];
    })
    : [];

  const substitutions = Array.isArray(raw.substitutions) ? raw.substitutions.slice(0, 40).flatMap((entry) => {
    if (!entry || typeof entry !== "object" || typeof entry.variable !== "string"
      || !/^[a-z]+$/.test(entry.variable) || !Number.isSafeInteger(entry.value)) return [];
    return [{ variable: entry.variable.slice(0, 48), value: entry.value }];
  }) : [];

  const frameKinds = new Set(["expression", "term", "factor"]);
  const frames = Array.isArray(raw.frames) ? raw.frames.slice(0, 24).flatMap((frame) => {
    if (!frame || typeof frame !== "object") return [];
    const kind = frameKinds.has(frame.kind) ? frame.kind : "factor";
    return [{
      depth: safeInteger(frame.depth, 0, 260) ?? 0,
      kind,
      start: safeInteger(frame.start, 0, tokens.length) ?? 0,
      result: sanitizeTerms(frame.result),
      termCount: safeInteger(frame.termCount, 0, 1500) ?? 0,
    }];
  }) : [];
  const omittedFrames = safeInteger(raw.omittedFrames, 0, 260) ?? 0;

  const operationTypes = new Set([
    "add", "subtract", "multiply", "identity", "negate", "group",
    "literal", "substitute", "variable", "sort",
  ]);
  const operation = raw.operation && typeof raw.operation === "object" && operationTypes.has(raw.operation.type)
    ? {
      type: raw.operation.type,
      detail: typeof raw.operation.detail === "string" ? raw.operation.detail.slice(0, 100) : "",
      left: sanitizeTerms(raw.operation.left),
      right: sanitizeTerms(raw.operation.right),
      result: sanitizeTerms(raw.operation.result),
      leftCount: safeInteger(raw.operation.leftCount, 0, 1500) ?? 0,
      rightCount: safeInteger(raw.operation.rightCount, 0, 1500) ?? 0,
      resultCount: safeInteger(raw.operation.resultCount, 0, 1500) ?? 0,
    }
    : null;

  const answer = Array.isArray(raw.answer)
    ? raw.answer.slice(0, 24).filter((item) => typeof item === "string").map((item) => item.slice(0, 300))
    : null;
  const answerCount = safeInteger(raw.answerCount, 0, 1500);
  const shortened = raw.shortened === true;

  const termHtml = (term, role = "") => {
    const monomial = term.variables.length
      ? term.variables.map((variable) => `<span>${escape(variable)}</span>`).join("<i>×</i>")
      : `<span class="bc770-constant">${text("constant", "hằng số")}</span>`;
    const signClass = term.coefficient < 0 ? "negative" : term.coefficient > 0 ? "positive" : "zero";
    return `<span class="bc770-term ${escape(role)} ${signClass}">
      <b>${term.coefficient}</b><i>×</i><span class="bc770-monomial">${monomial}</span><small>deg ${term.degree}</small>
    </span>`;
  };
  const termsHtml = (terms, role, emptyText) => terms.length
    ? terms.map((term) => termHtml(term, role)).join("")
    : `<span class="bc770-empty">${escape(emptyText || text("zero polynomial ∅", "đa thức 0 ∅"))}</span>`;

  const tokenHtml = tokens.map((token, tokenIndex) => {
    const state = tokenIndex < index ? "consumed" : tokenIndex === index ? "current" : "pending";
    const pointer = tokenIndex === index ? "<i>i</i>" : "";
    return `<span class="bc770-token ${token.type} ${state}" title="chars ${token.start}..${token.end}">
      <small>${tokenIndex}</small><strong>${escape(token.value)}</strong>${pointer}
    </span>`;
  }).join("");
  const endPointer = index === tokens.length
    ? `<span class="bc770-token end current"><small>${tokens.length}</small><strong>EOF</strong><i>i</i></span>`
    : "";

  const substitutionHtml = substitutions.length
    ? substitutions.map((entry) => `<span class="bc770-substitution"><b>${escape(entry.variable)}</b><i>→</i><strong>${entry.value}</strong></span>`).join("")
    : `<span class="bc770-empty">${text("No substitutions — every variable stays symbolic.", "Không có phép thay thế — mọi biến được giữ dạng ký hiệu.")}</span>`;

  const frameName = (kind) => kind === "expression"
    ? text("EXPRESSION  (+ / −)", "EXPRESSION  (+ / −)")
    : kind === "term"
      ? text("TERM  (×)", "TERM  (×)")
      : text("FACTOR", "FACTOR");
  const frameHtml = frames.map((frame, frameIndex) => {
    const active = frameIndex === frames.length - 1 ? "active" : "";
    return `<li class="bc770-frame ${frame.kind} ${active}">
      <header><span>#${frame.depth} · ${frameName(frame.kind)}</span><small>${frame.termCount} ${text("terms", "hạng tử")}</small></header>
      <div>${termsHtml(frame.result, "frame", text("waiting for a result", "đang chờ kết quả"))}</div>
      <footer>${text("started at token", "bắt đầu tại token")} ${frame.start}</footer>
    </li>`;
  }).join("");

  const operationSymbol = operation ? {
    add: "+",
    subtract: "−",
    multiply: "×",
    identity: "+",
    negate: "−1 ×",
    group: "( … )",
    literal: "#",
    substitute: "→",
    variable: "x",
    sort: "⇅",
  }[operation.type] : "";
  const operationTitle = operation ? {
    add: text("POLYNOMIAL ADDITION", "CỘNG ĐA THỨC"),
    subtract: text("POLYNOMIAL SUBTRACTION", "TRỪ ĐA THỨC"),
    multiply: text("DISTRIBUTIVE MULTIPLICATION", "NHÂN PHÂN PHỐI"),
    identity: text("UNARY PLUS", "DẤU CỘNG MỘT NGÔI"),
    negate: text("NEGATE COEFFICIENTS", "ĐỔI DẤU HỆ SỐ"),
    group: text("PARENTHESIZED RESULT", "KẾT QUẢ TRONG NGOẶC"),
    literal: text("CONSTANT POLYNOMIAL", "ĐA THỨC HẰNG"),
    substitute: text("VARIABLE SUBSTITUTION", "THAY GIÁ TRỊ BIẾN"),
    variable: text("SYMBOLIC VARIABLE", "BIẾN KÝ HIỆU"),
    sort: text("CANONICAL OUTPUT ORDER", "THỨ TỰ OUTPUT CHUẨN"),
  }[operation.type] : "";
  const binaryOperation = operation && ["add", "subtract", "multiply"].includes(operation.type);
  const operationHtml = operation ? `<div class="bc770-operation ${operation.type}">
    <header><strong>${operationTitle}</strong><span>${escape(operation.detail || operationSymbol)}</span></header>
    <div class="bc770-equation ${binaryOperation ? "binary" : "unary"}">
      ${binaryOperation ? `<section><small>${text("LEFT", "TRÁI")} · ${operation.leftCount}</small><div>${termsHtml(operation.left, "left")}</div></section><b>${operationSymbol}</b>
      <section><small>${text("RIGHT", "PHẢI")} · ${operation.rightCount}</small><div>${termsHtml(operation.right, "right")}</div></section><b>=</b>` : `<b>${operationSymbol}</b>`}
      <section class="result"><small>${text("RESULT", "KẾT QUẢ")} · ${operation.resultCount}</small><div>${termsHtml(operation.result, "result")}</div></section>
    </div>
  </div>` : `<div class="bc770-operation-empty">
    <strong>${text("PARSE FIRST, COMBINE SECOND", "PHÂN TÍCH TRƯỚC, GỘP SAU")}</strong>
    <span>${text("The active frame is building its next polynomial operand.", "Khung đang hoạt động đang tạo toán hạng đa thức kế tiếp.")}</span>
  </div>`;

  const answerHtml = answer ? `<section class="bc770-answer">
    <header><div><small>${text("CANONICAL RESULT", "KẾT QUẢ CHUẨN")}</small><strong>${answerCount ?? answer.length} ${text("nonzero terms", "hạng tử khác 0")}</strong></div><span>${text("degree ↓ · tuple lexicographic ↑", "bậc ↓ · tuple từ điển ↑")}</span></header>
    <div>${answer.length ? answer.map((term, answerIndex) => `<span><small>${answerIndex + 1}</small><code>${escape(term)}</code></span>`).join("") : `<strong class="bc770-zero-answer">[] · ${text("all terms cancelled", "mọi hạng tử đã triệt tiêu")}</strong>`}</div>
  </section>` : "";

  const phase = typeof raw.phase === "string" ? raw.phase.slice(0, 60) : "parse";
  const title = localized(step && step.title, text("Polynomial parser", "Bộ phân tích đa thức"));
  const note = localized(step && step.note, "");
  const currentValue = index < tokens.length ? tokens[index].value : "EOF";

  $("treeView").innerHTML = `<section class="bc770-viz" aria-label="Basic Calculator IV polynomial visualization">
    <header class="bc770-header">
      <div><small>RECURSIVE DESCENT + SPARSE POLYNOMIAL · #770</small><h2>${text("BASIC CALCULATOR IV", "MÁY TÍNH CƠ BẢN IV")}</h2></div>
      <div><strong>${escape(title)}</strong><span>${escape(phase)}</span></div>
    </header>
    <div class="bc770-rule"><span><b>expression</b> → term ((+|−) term)*</span><span><b>term</b> → factor (× factor)*</span><span><b>factor</b> → number | variable | (expression)</span></div>
    <section class="bc770-panel bc770-substitutions"><header><strong>${text("SUBSTITUTION TABLE", "BẢNG THAY THẾ")}</strong><span>${substitutions.length} ${text("bindings", "ánh xạ")}</span></header><div>${substitutionHtml}</div></section>
    <section class="bc770-panel bc770-tokens"><header><strong>${text("TOKEN STREAM", "LUỒNG TOKEN")}</strong><span>i = ${index}/${tokens.length} · ${escape(currentValue)}</span></header><div>${tokenHtml}${endPointer}</div><footer><code>${escape(expression)}</code></footer></section>
    <div class="bc770-main">
      <section class="bc770-panel bc770-stack"><header><strong>${text("RECURSIVE CALL STACK", "NGĂN XẾP ĐỆ QUY")}</strong><span>${omittedFrames ? `+${omittedFrames} ${text("hidden", "đã ẩn")} · ` : ""}${frames.length + omittedFrames} ${text("frames", "khung")}</span></header><ol>${frameHtml || `<li class="bc770-empty">${text("Every parser call has returned.", "Mọi lời gọi parser đã trả về.")}</li>`}</ol></section>
      <section class="bc770-panel bc770-workbench"><header><strong>${text("POLYNOMIAL WORKBENCH", "BÀN TÍNH ĐA THỨC")}</strong><span>${operation ? operation.type : "parse"}</span></header>${operationHtml}</section>
    </div>
    ${answerHtml}
    ${shortened ? `<div class="bc770-short">${text("The board bounds trace and term previews; the returned answer is still computed in full.", "Bảng giới hạn trace và phần xem trước hạng tử; đáp án trả về vẫn được tính đầy đủ.")}</div>` : ""}
    <footer class="bc770-note"><strong>${text("WHY THIS STEP", "VÌ SAO CÓ BƯỚC NÀY")}</strong><span>${escape(note)}</span></footer>
  </section>`;
}
