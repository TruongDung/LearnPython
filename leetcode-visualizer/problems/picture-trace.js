"use strict";
const bi = (vi, en = vi) => ({ vi, en });
const clone = value => JSON.parse(JSON.stringify(value));
function trace(id, code, detailed) {
  let active = detailed;
  const steps = [];
  return {
    get active() { return active; },
    emit(line, event, locals, picture) {
      if (!active) return;
      if (steps.length >= 12000) { active = false; steps.length = 0; return; }
      steps.push({ title: bi(`Dòng ${line} · ${event}`, `Line ${line} · ${event}`), codeLines: [line], codeBlock: 1,
        final: false, arr: [], highlight: [], mark: [], note: bi(""),
        vars: Object.entries(locals).map(([name, value]) => ({ name, rawValue: clone(value), value: name === "self" ? JSON.stringify(value) : typeof value === "object" ? JSON.stringify(value) : value })),
        pictureView: { id, mode: "trace", line, source: code[line - 1].trim(), event, ...clone(picture()) } });
    },
    finish(answer, picture, original) {
      if (!active) steps.push({ title: bi("Kết quả · hình xem trước", "Result · picture preview"), codeLines: [], codeBlock: 1, final: true,
        arr: [], highlight: [], mark: [], vars: [], note: bi(""), pictureView: { id, mode: "summary", source: "", line: null, event: "done", ...clone(picture()) } });
      steps.at(-1).final = true;
      return { original, answer, steps };
    }
  };
}
module.exports = { trace, bi };
