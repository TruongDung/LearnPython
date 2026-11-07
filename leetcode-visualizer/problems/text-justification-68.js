"use strict";

const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const LIMITS = { words: 20, maxWidth: 24, totalCharacters: 120 };
const CODE = `from typing import List

class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        lines = []
        start = 0
        while start < len(words):
            end = start + 1
            letters = len(words[start])
            while end < len(words) and letters + len(words[end]) + (end - start) <= maxWidth:
                letters += len(words[end])
                end += 1
            count = end - start
            if end == len(words) or count == 1:
                line = ' '.join(words[start:end]).ljust(maxWidth)
            else:
                spaces, extra = divmod(maxWidth - letters, count - 1)
                parts = []
                for gap in range(count - 1):
                    parts.append(words[start + gap])
                    width = spaces + (1 if gap < extra else 0)
                    parts.append(' ' * width)
                parts.append(words[end - 1])
                line = ''.join(parts)
            lines.append(line)
            start = end
        return lines`.split("\n");

function parse(input, params = {}) {
  if (!params || typeof params !== "object" || Array.isArray(params)) throw new RangeError("#68: params phải là object / params must be an object.");
  let words = input;
  if (typeof input === "string") {
    const text = input.trim();
    try { words = text.startsWith("[") ? JSON.parse(text) : text.split(/[,;|]/).map(word => word.trim()); }
    catch (_) { throw new RangeError("#68: words phải là JSON hoặc các từ ngăn bằng dấu phẩy / enter JSON or comma-separated words."); }
  }
  if (!Array.isArray(words) || words.length < 1 || words.length > LIMITS.words
    || !words.every(word => typeof word === "string" && /^[!-~]+$/.test(word))) {
    throw new RangeError("#68: 1–20 từ ASCII không rỗng, không chứa khoảng trắng / use 1–20 nonempty ASCII words without whitespace.");
  }
  const maxWidth = params.maxWidth === undefined ? 16 : params.maxWidth;
  if (!Number.isInteger(maxWidth) || maxWidth < 1 || maxWidth > LIMITS.maxWidth) {
    throw new RangeError("#68: maxWidth là số nguyên 1–24 / maxWidth must be an integer from 1 to 24.");
  }
  if (words.some(word => word.length > maxWidth)) throw new RangeError("#68: từ dài hơn maxWidth / a word is longer than maxWidth.");
  if (words.reduce((sum, word) => sum + word.length, 0) > LIMITS.totalCharacters) {
    throw new RangeError("#68: tối đa 120 ký tự trong các từ / at most 120 word characters.");
  }
  return [[...words], maxWidth];
}

const PHASES = {
  5: bi("lines = []", "lines = []"), 6: bi("Bắt đầu từ đầu mảng", "Start at the first word"),
  7: bi("Mở dòng mới", "Start a new line"), 8: bi("Lấy từ đầu dòng", "Take the first word"),
  9: bi("Đếm ký tự chữ", "Count letter characters"), 10: bi("Thêm từ có vừa không?", "Does the next word fit?"),
  11: bi("Cộng độ dài từ mới", "Add the next word's length"), 12: bi("end tiến thêm 1", "Advance end by one"),
  13: bi("Đếm số từ trong dòng", "Count words in the line"), 14: bi("Dòng cuối hoặc chỉ 1 từ?", "Last line or a single word?"),
  15: bi("Căn trái · bù cuối dòng", "Left align · pad the right"), 17: bi("Chia khoảng trắng bằng divmod", "Divide spaces with divmod"),
  18: bi("parts = []", "parts = []"), 19: bi("Duyệt từng khe", "Visit each gap"),
  20: bi("Thêm từ vào parts", "Append a word to parts"), 21: bi("Khe bên trái nhận phần dư", "Left gaps get the remainder"),
  22: bi("Thêm khoảng trắng vào parts", "Append spaces to parts"), 23: bi("Thêm từ cuối", "Append the last word"),
  24: bi("Ghép parts → line", "Join parts → line"), 25: bi("Lưu dòng hoàn chỉnh", "Save the completed line"),
  26: bi("start → end", "start → end"), 27: bi("Tất cả dòng đã đủ độ rộng ✓", "Every line has the required width ✓"),
};

function builder(input, params = {}) {
  const [words, maxWidth] = parse(input, params);
  const trace = runTrace({ code: CODE.join("\n"), method: "fullJustify", args: [words, maxWidth] });
  let range = null, fit = null, mode = null, reason = null, plan = null, allocated = [], activeGap = null;
  let partsReady = false, lineReady = false, widthReady = false, completedWords = 0, previousText = "";
  const steps = trace.events.map(record => {
    const { line, locals: x } = record;
    if (line === 7 && record.branch) {
      range = { start: x.start, end: x.start, letters: null }; fit = mode = reason = plan = null;
      allocated = []; activeGap = null; partsReady = lineReady = widthReady = false; previousText = "";
    }
    if (line === 8 || line === 12) { range.end = x.end; fit = null; }
    if (line === 9 || line === 11) range.letters = x.letters;
    if (line === 10) {
      fit = x.end < words.length ? { index: x.end, word: words[x.end], letters: x.letters,
        wordLength: words[x.end].length, gaps: x.end - x.start,
        needed: x.letters + words[x.end].length + x.end - x.start, fits: record.branch } : null;
    }
    if (line === 14) { mode = record.branch ? "left" : "full"; reason = record.branch ? x.end === words.length ? "last" : "single" : null; fit = null; }
    if (line === 17) {
      plan = { total: maxWidth - x.letters, gaps: x.count - 1, base: x.spaces, extra: x.extra,
        widths: Array.from({ length: x.count - 1 }, (_, gap) => x.spaces + (gap < x.extra ? 1 : 0)) };
      allocated = Array(x.count - 1).fill(null);
    }
    if (line === 18) partsReady = true;
    if (line === 19) { activeGap = record.branch ? x.gap : null; widthReady = false; }
    if (line === 21) widthReady = true;
    if (line === 22) allocated[x.gap] = x.width;
    if (line === 15 || line === 24) lineReady = true;
    if (line === 25) completedWords = range.end;
    const lineWords = range ? words.slice(range.start, range.end) : [];
    const cells = [];
    const append = (text, kind, gap = null, base = null) => [...text].forEach((char, offset) => {
      cells.push({ char, kind: kind === "gap" && base !== null && offset >= base ? "extra" : kind, gap });
    });
    let boardMode = "draft";
    if (lineReady && mode === "left") {
      boardMode = "line";
      lineWords.forEach((word, i) => { if (i) append(" ", "gap", i - 1); append(word, "letter"); });
      append(x.line.slice(cells.length), "padding");
    } else if (partsReady) {
      boardMode = lineReady ? "line" : "parts";
      x.parts.forEach((part, i) => append(part, i % 2 ? "gap" : "letter", i % 2 ? (i - 1) / 2 : null, i % 2 ? plan.base : null));
    } else {
      lineWords.forEach((word, i) => { if (i) append(" ", "draft-gap", i - 1); append(word, "draft"); });
    }
    const text = cells.map(cell => cell.char).join("");
    const written = [15, 20, 22, 23, 24].includes(line)
      ? { from: line === 15 || line === 24 ? 0 : previousText.length, to: text.length } : null;
    const exhausted = [7, 19].includes(line) && record.branch === false;
    const phase = exhausted ? bi("Hết vòng lặp ↩", "Loop exhausted ↩") : PHASES[line];
    const stage = record.returning ? "done" : line <= 13 ? "pack" : line <= 18 ? "divide" : line <= 24 ? "build" : "save";
    const names = line === 13 ? ["start", "end", "count"] : line === 15 || line === 24 ? ["line", "maxWidth"]
      : stage === "pack" ? ["start", "end", "letters", "maxWidth"] : stage === "divide" ? ["letters", "count", "spaces", "extra"]
      : stage === "build" ? ["gap", "width", "spaces", "extra"] : stage === "done" ? ["lines"] : ["start", "end", "line"];
    const view = {
      words, maxWidth, range: range && { ...range }, lineWords, completedWords, mode, reason, boardMode, cells, text, written,
      fit: fit && { ...fit }, plan: plan && { ...plan, widths: [...plan.widths] }, allocated: [...allocated], activeGap,
      currentWidth: widthReady ? x.width : null, partsReady, lineReady,
      output: x.lines ?? null, answer: record.returning ? trace.answer : null,
      source: { line, text: CODE[line - 1].trim(), timing: "after" }, phase, stage, exhausted,
      locals: x, outer: record.outer, frames: record.frames, scope: record.scope,
      branch: record.branch, returned: record.returned, returning: record.returning, trace: trace.trace,
    };
    previousText = text;
    return {
      arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final: record.returning,
      title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: names.map(name => ({ name, value: x[name] ?? "—", rawValue: x[name] ?? null })),
      textJustification68View: view,
    };
  });
  return { original: words, input: words, answer: trace.answer, steps };
}

module.exports = { 68: {
  id: 68, difficulty: "hard", slug: "text-justification", category: { key: "string", vi: "Chuỗi", en: "String" },
  title: bi("Text Justification", "Text Justification"), titleVi: bi("Căn đều văn bản", "Fully justify text"),
  tags: [{ key: "array", vi: "Mảng", en: "Array" }, { key: "greedy", vi: "Tham lam", en: "Greedy" }, { key: "simulation", vi: "Mô phỏng", en: "Simulation" }],
  statement: bi("Gom nhiều từ nhất vào mỗi dòng đúng maxWidth ký tự. Chia khoảng trắng đều giữa các từ; phần dư ưu tiên khe bên trái. Dòng cuối và dòng một từ căn trái.",
    "Pack as many words as fit into each maxWidth-character line. Distribute spaces evenly, giving extra spaces to the left gaps. Left-align the last line and single-word lines."),
  defaultInput: ["This", "is", "an", "example", "of", "text", "justification."], inputKind: "stringArray",
  inputLabel: bi("words · JSON hoặc dấu phẩy · tối đa 20 từ, 120 ký tự", "words · JSON or commas · up to 20 words, 120 characters"),
  extraParams: [{ key: "maxWidth", type: "number", label: bi("maxWidth · 1–24", "maxWidth · 1–24"), default: 16, min: 1, max: 24 }],
  approach: [bi("Gom từ → divmod khoảng trắng → ghép ô → lưu dòng. · là một khoảng trắng.", "Pack words → divmod spaces → fill cells → save line. A dot · represents one space.")],
  complexity: { time: "O(total characters + output size)", space: "O(output size)", note: bi("Tạo từng ký tự đầu ra; kết quả chứa tất cả dòng đã căn đều.", "Construct each output character; the result stores all justified lines.") },
  code: CODE, codeLabel: bi("Greedy · từng dòng Python", "Greedy · Python line by line"), debugMode: "line-by-line",
  visualizationLimits: { ...LIMITS, completeTrace: true }, builder, liveArgs: parse,
} };
