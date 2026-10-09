"use strict";

const LR9019_COPY = Object.freeze({
  en: Object.freeze({
    kicker: "DESIGN 9019 · HASH MAP + DFS", fallback: "Library Template Register", line: "LINE",
    registry: "Registration map", registryHelp: "A placeholder name points to the template text expanded by DFS.",
    scanner: "Current scanner", scannerHelp: "The top frame owns the active cursor and its partial output.",
    stack: "DFS call stack", stackHelp: "The root template is at the bottom; the active dependency is on top.",
    visiting: "Cycle guard · visiting", visitingHelp: "Only names on the active recursion path stay in this set.",
    output: "Evaluation result", pending: "Still evaluating…", idle: "No active frames — DFS has returned.", empty: "empty string", missing: "No registrations yet",
    source: "source", cursor: "cursor", nameBuffer: "name buffer", partial: "partial output", outside: "literal mode",
    inside: "inside %…%", root: "root", final: "COMPLETE", failed: "CYCLE DETECTED", stopped: "STOPPED",
    traceOmitted: "Some intermediate frames were omitted to keep the visualization responsive.",
  }),
  vi: Object.freeze({
    kicker: "THIẾT KẾ 9019 · HASH MAP + DFS", fallback: "Library Template Register", line: "DÒNG",
    registry: "Registration map", registryHelp: "Tên placeholder trỏ đến template text được DFS mở rộng.",
    scanner: "Bộ quét hiện tại", scannerHelp: "Frame trên cùng giữ cursor đang chạy và output tạm của nó.",
    stack: "DFS call stack", stackHelp: "Template gốc ở dưới; dependency đang chạy nằm trên cùng.",
    visiting: "Chặn chu kỳ · visiting", visitingHelp: "Chỉ các tên trên đường đệ quy active nằm trong tập này.",
    output: "Kết quả Evaluate", pending: "Đang evaluate…", idle: "Không còn frame active — DFS đã trả về.", empty: "chuỗi rỗng", missing: "Chưa có registration",
    source: "nguồn", cursor: "cursor", nameBuffer: "buffer tên", partial: "output tạm", outside: "literal mode",
    inside: "bên trong %…%", root: "gốc", final: "HOÀN TẤT", failed: "PHÁT HIỆN CHU KỲ", stopped: "ĐÃ DỪNG",
    traceOmitted: "Một số frame trung gian đã được lược bớt để visualization luôn mượt.",
  }),
});

function lr9019Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function lr9019Locale() { return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en"; }
function lr9019Localized(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) return String(value[locale] ?? value.en ?? value.vi ?? fallback);
  return typeof value === "string" ? value : fallback;
}
function lr9019String(value, limit = 500) { return typeof value === "string" ? value.slice(0, limit) : ""; }
function lr9019Integer(value, minimum, maximum) { return Number.isInteger(value) && value >= minimum && value <= maximum ? value : null; }

function lr9019Normalize(step) {
  const raw = step && step.libRegister9019View && typeof step.libRegister9019View === "object" ? step.libRegister9019View : {};
  const registrations = (Array.isArray(raw.registrations) ? raw.registrations : []).slice(0, 15).map((entry) => ({
    name: lr9019String(entry && entry.name, 28), value: lr9019String(entry && entry.value, 180),
  })).filter((entry) => entry.name);
  const frames = (Array.isArray(raw.frames) ? raw.frames : []).slice(0, 20).map((frame) => ({
    source: lr9019String(frame && frame.source, 30), text: lr9019String(frame && frame.text, 240),
    index: lr9019Integer(frame && frame.index, -1, 240) ?? -1, char: lr9019String(frame && frame.char, 2),
    inside: Boolean(frame && frame.inside), variable: lr9019String(frame && frame.variable, 80), result: lr9019String(frame && frame.result, 5000),
  }));
  const allowedPhases = new Set(["setup", "register", "evaluate", "expand", "scan", "resolve", "recurse", "return", "done", "error"]);
  return {
    phase: allowedPhases.has(raw.phase) ? raw.phase : "setup",
    event: lr9019String(raw.event, 40), line: lr9019Integer(raw.line, 1, 42) ?? 1,
    sourceText: lr9019String(raw.sourceText, 220), registrations,
    template: lr9019String(raw.template, 240), frames,
    visiting: (Array.isArray(raw.visiting) ? raw.visiting : []).slice(0, 20).map((name) => lr9019String(name, 28)),
    activeName: raw.activeName == null ? null : lr9019String(raw.activeName, 28),
    activeValue: raw.activeValue == null ? null : lr9019String(raw.activeValue, 180),
    condition: raw.condition && typeof raw.condition === "object" && typeof raw.condition.result === "boolean"
      ? { expression: lr9019String(raw.condition.expression, 100), result: raw.condition.result } : null,
    output: raw.output == null ? null : lr9019String(raw.output, 5000), error: raw.error == null ? null : lr9019String(raw.error, 500),
    traceOmitted: raw.traceOmitted === true, final: Boolean(raw.final || (step && step.final)),
    title: lr9019Localized(step && step.title, lr9019Locale(), LR9019_COPY[lr9019Locale()].fallback).slice(0, 300),
    note: lr9019Localized(step && step.note, lr9019Locale(), "").slice(0, 800),
  };
}

function lr9019Token(value) {
  if (value === "") return '<span class="lr9019-empty">""</span>';
  return `<code>${lr9019Escape(value)}</code>`;
}

function lr9019Registry(state, copy) {
  const cards = state.registrations.map((entry) => {
    const active = entry.name === state.activeName;
    return `<div class="lr9019-registration${active ? " is-active" : ""}">
      <strong>%${lr9019Escape(entry.name)}%</strong><span aria-hidden="true">→</span>${lr9019Token(entry.value)}
    </div>`;
  }).join("");
  return `<section class="lr9019-panel lr9019-registry"><header><div><strong>${lr9019Escape(copy.registry)}</strong><small>${lr9019Escape(copy.registryHelp)}</small></div><b>${state.registrations.length}</b></header>
    <div class="lr9019-registration-grid">${cards || `<em>${lr9019Escape(copy.missing)}</em>`}</div></section>`;
}

function lr9019Scanner(state, copy) {
  const frame = state.frames.at(-1);
  if (!frame) {
    return `<section class="lr9019-panel lr9019-scanner"><header><div><strong>${lr9019Escape(copy.scanner)}</strong><small>${lr9019Escape(copy.scannerHelp)}</small></div></header>
      <div class="lr9019-template"><small>${lr9019Escape(copy.root)}</small><code>${lr9019Escape(state.template)}</code></div></section>`;
  }
  const cells = [...frame.text].map((char, index) => {
    const classes = ["lr9019-char"];
    if (index < frame.index) classes.push("is-done");
    if (index === frame.index) classes.push("is-current");
    if (char === "%") classes.push("is-delimiter");
    return `<span class="${classes.join(" ")}"><b>${char === " " ? "·" : lr9019Escape(char)}</b><small>${index}</small></span>`;
  }).join("");
  return `<section class="lr9019-panel lr9019-scanner"><header><div><strong>${lr9019Escape(copy.scanner)} · ${lr9019Escape(frame.source)}</strong><small>${lr9019Escape(copy.scannerHelp)}</small></div><span class="lr9019-mode ${frame.inside ? "is-inside" : ""}">${lr9019Escape(frame.inside ? copy.inside : copy.outside)}</span></header>
    <div class="lr9019-char-row">${cells || `<span class="lr9019-empty">${lr9019Escape(copy.empty)}</span>`}</div>
    <div class="lr9019-buffers"><div><small>${lr9019Escape(copy.nameBuffer)}</small>${lr9019Token(frame.variable)}</div><div><small>${lr9019Escape(copy.partial)}</small>${lr9019Token(frame.result)}</div></div>
  </section>`;
}

function lr9019Stack(state, copy) {
  const rows = state.frames.map((frame, index) => {
    const active = index === state.frames.length - 1;
    return `<li class="${active ? "is-active" : ""}"><span>${index + 1}</span><div><strong>dfs(${lr9019Escape(frame.source)})</strong><small>${lr9019Escape(frame.text || copy.empty)}</small></div><code>${lr9019Escape(frame.result)}</code></li>`;
  }).reverse().join("");
  return `<section class="lr9019-panel lr9019-stack"><header><div><strong>${lr9019Escape(copy.stack)}</strong><small>${lr9019Escape(copy.stackHelp)}</small></div><b>${state.frames.length}</b></header>
    <ol>${rows || `<li class="is-empty"><em>${lr9019Escape(state.final ? copy.idle : copy.pending)}</em></li>`}</ol></section>`;
}

function lr9019Guard(state, copy) {
  const chips = state.visiting.map((name, index) => `<span class="${name === state.activeName ? "is-active" : ""}">%${lr9019Escape(name)}%${index < state.visiting.length - 1 ? '<i aria-hidden="true">→</i>' : ""}</span>`).join("");
  return `<section class="lr9019-panel lr9019-guard"><header><div><strong>${lr9019Escape(copy.visiting)}</strong><small>${lr9019Escape(copy.visitingHelp)}</small></div></header>
    <div class="lr9019-path">${chips || `<span class="is-empty">∅</span>`}</div></section>`;
}

function lr9019Result(state, copy) {
  const status = state.error ? (state.error.startsWith("Cycle detected") ? copy.failed : copy.stopped) : state.final ? copy.final : copy.pending;
  const className = state.error ? "is-error" : state.final ? "is-complete" : "is-pending";
  const value = state.error || (state.output == null ? copy.pending : state.output || copy.empty);
  return `<section class="lr9019-result ${className}"><div><small>${lr9019Escape(copy.output)}</small><strong>${lr9019Escape(status)}</strong></div><code>${lr9019Escape(value)}</code></section>`;
}

function renderLibRegister9019View(step) {
  const root = $("treeView");
  const locale = lr9019Locale();
  const copy = LR9019_COPY[locale];
  const state = lr9019Normalize(step);
  const condition = state.condition ? `<span class="lr9019-condition ${state.condition.result ? "is-true" : "is-false"}"><code>${lr9019Escape(state.condition.expression)}</code><b>${state.condition.result ? "TRUE" : "FALSE"}</b></span>` : "";
  root.innerHTML = `<section class="lr9019-viz" role="img" aria-label="${lr9019Escape(`${copy.fallback}: ${state.title}`)}">
    <header class="lr9019-heading"><div><small>${lr9019Escape(copy.kicker)}</small><h3>${lr9019Escape(state.title || copy.fallback)}</h3></div><div class="lr9019-meta"><span>${lr9019Escape(copy.line)} ${state.line}</span><b>${lr9019Escape(state.phase.toUpperCase())}</b></div></header>
    <div class="lr9019-action"><div><code>${lr9019Escape(state.sourceText)}</code>${condition}</div><p>${lr9019Escape(state.note)}</p></div>
    ${lr9019Registry(state, copy)}
    <div class="lr9019-workspace">${lr9019Scanner(state, copy)}${lr9019Stack(state, copy)}</div>
    ${lr9019Guard(state, copy)}
    ${lr9019Result(state, copy)}
    ${state.traceOmitted ? `<p class="lr9019-omitted">${lr9019Escape(copy.traceOmitted)}</p>` : ""}
  </section>`;
}
