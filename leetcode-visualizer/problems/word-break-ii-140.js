"use strict";

const base = require("./dp")[140];
const { bi, parsePlainParams, parseStringArray } = require("./hard-viz-shared");
const CODE = Object.freeze([...base.code]);
const MAX_SENTENCES = 128;

function parse140(input, params) {
  const options = parsePlainParams(params, 140);
  if (typeof input !== "string" || !/^[a-z]{1,24}$/.test(input)) throw new RangeError("#140: nhập 1–24 chữ thường a-z / enter 1–24 lowercase letters.");
  const wordDict = parseStringArray(options.wordDict === undefined ? base.extraParams[0].default : options.wordDict,
    { problemId: 140, name: "wordDict", minLength: 0, maxLength: 1000, minWordLength: 1, maxWordLength: 24 });
  // Reject oversized visualizations before building snapshots; never drop
  // sentences or skip executed lines in a run that is accepted.
  const words = new Set(wordDict), counts = Array(input.length + 1).fill(0);
  counts[input.length] = 1;
  for (let start = input.length - 1; start >= 0; start--) {
    for (let end = start + 1; end <= input.length; end++) if (words.has(input.slice(start, end))) {
      counts[start] = Math.min(MAX_SENTENCES + 1, counts[start] + counts[end]);
    }
  }
  if (counts[0] > MAX_SENTENCES) throw new RangeError("#140: quá 128 câu để minh hoạ đủ từng dòng; rút gọn s hoặc wordDict / more than 128 sentences; shorten s or wordDict for a complete trace.");
  return [input, wordDict];
}

function buildSteps140(input, params) {
  const [s, wordDict] = parse140(input, params), words = new Set(wordDict), memo = new Map(), stack = [], steps = [];
  let memoReady = false, nextId = 0, memoHits = 0;
  const copy = values => [...values];
  const selection = new Set(["end", "slice", "dictionary", "skip", "tail", "append", "tails-done"]);
  function emit(line, phase, title, detail = {}, final = false) {
    const f = stack.at(-1), locals = f ? { start: f.start,
      ...Object.fromEntries(["end", "word", "tail"].filter(key => Object.hasOwn(f, key)).map(key => [key, f[key]])),
      ...(f.sentences ? { sentences: copy(f.sentences) } : {}) } : {};
    const candidate = f && selection.has(phase) && f.end !== undefined ? {
      start: f.start, end: f.end, text: s.slice(f.start, f.end), member: f.member,
    } : null;
    steps.push({ title, note: bi("", ""), arr: [], codeLines: [line], final,
      vars: [
        { name: "start", value: f?.start ?? "—" }, { name: "end", value: f?.end ?? "—" },
        { name: "word", value: f?.word ?? "—" }, { name: "tail", value: f?.tail === undefined ? "—" : f.tail || "''" },
        { name: "len(sentences)", value: f?.sentences ? f.sentences.length : "—" },
        { name: "len(memo)", value: memoReady ? memo.size : "—" },
      ], wordBreak140View: {
        s, dictionary: [...words], phase, source: { line, text: CODE[line - 1], timing: "after" },
        scope: f ? "dfs" : "wordBreak", locals, candidate, memoReady, memoHits,
        memo: [...memo].map(([start, values]) => ({ start, count: values.length, preview: values.slice(0, 2) })),
        stack: stack.map(frame => ({ id: frame.id, start: frame.start, via: frame.via ? { ...frame.via } : null,
          count: frame.sentences ? frame.sentences.length : null })),
        returned: f?.returned ? { ...f.returned, preview: copy(f.returned.preview) } : null,
        answer: null, ...detail,
      },
    });
  }
  emit(3, "words", bi("Tạo bộ từ", "Build the word set"));
  memoReady = true; emit(4, "memo-init", bi("memo = {}", "memo = {}"));
  emit(5, "define", bi("Tạo hàm dfs", "Define dfs"));
  function dfs(start, via = null) {
    const f = { id: nextId++, start, via, member: null };
    stack.push(f); emit(6, "end-check", bi(start === s.length ? "Đã hết ký tự" : "Tách phần còn lại", start === s.length ? "No characters left" : "Split the remaining suffix"), { atEnd: start === s.length });
    if (start === s.length) {
      emit(7, "base-return", bi("1 cách kết thúc: chuỗi rỗng", "1 empty continuation"));
      stack.pop(); return { values: [""], kind: "base", start };
    }
    const hit = memo.has(start);
    if (hit) memoHits++;
    emit(8, "memo-check", bi(hit ? "Hậu tố đã có trong memo" : "Chưa có trong memo", hit ? "Suffix found in memo" : "Not in memo yet"), { memoHit: hit });
    if (hit) {
      const values = memo.get(start);
      emit(9, "memo-return", bi("Dùng lại kết quả ↩", "Reuse cached results ↩"), { cache: { start, count: values.length, preview: values.slice(0, 2) } });
      stack.pop(); return { values, kind: "memo", start };
    }
    f.sentences = []; emit(10, "collect", bi("sentences = []", "sentences = []"));
    for (let end = start + 1; end <= s.length; end++) {
      f.end = end; f.member = null; f.returned = null;
      emit(11, "end", bi("Nới điểm cắt end", "Move the end boundary"));
      f.word = s.slice(start, end); emit(12, "slice", bi(`Cắt “${f.word}”`, `Slice “${f.word}”`));
      f.member = words.has(f.word); emit(13, "dictionary", bi(f.member ? "Có trong từ điển ✓" : "Không có trong từ điển", f.member ? "Dictionary match ✓" : "Not a dictionary word"));
      if (!f.member) { emit(14, "skip", bi("Thử điểm cắt tiếp", "Try the next boundary")); continue; }
      const child = dfs(end, { start, end, word: f.word });
      f.returned = { start: child.start, kind: child.kind, count: child.values.length, preview: child.values.slice(0, 2) };
      for (const tail of child.values) {
        f.tail = tail; emit(15, "tail", bi("Lấy một tail để ghép", "Take one continuation"));
        f.sentences.push(f.word + (tail ? ` ${tail}` : ""));
        emit(16, "append", bi("Ghép word + tail", "Join word + tail"));
      }
      emit(15, "tails-done", bi("Đã ghép hết tail", "All continuations joined"));
    }
    emit(11, "ends-done", bi("Hết điểm cắt", "No boundaries left"));
    memo.set(start, f.sentences); emit(17, "memo-save", bi(`Lưu memo[${start}]`, `Save memo[${start}]`));
    emit(18, "return", bi("Trả các câu của hậu tố", "Return the suffix sentences"));
    stack.pop(); return { values: f.sentences, kind: "computed", start };
  }
  const result = dfs(0).values;
  emit(19, "done", bi(`${result.length} câu hợp lệ`, `${result.length} valid sentences`), { answer: copy(result) }, true);
  return { original: s, answer: copy(result), steps };
}

module.exports = { 140: { ...base, code: CODE, builder: buildSteps140, debugMode: "line-by-line", liveArgs: parse140,
  inputLabel: bi("s · 1–24 chữ thường", "s · 1–24 lowercase letters"),
  extraParams: [{ ...base.extraParams[0], allowEmpty: true }],
  approach: [bi("Cắt word → tra từ điển → ghép từng tail. Memo giữ các câu của cùng một hậu tố để dùng lại.", "Slice a word → check the dictionary → join each tail. Memo reuses sentences for the same suffix.")],
  complexity: { time: "O(W + n³ + C)", space: "O(D + n² + C)",
    note: bi("W là số ký tự từ điển, D là số từ; C là tổng ký tự các câu ở mọi hậu tố. Minh hoạ tối đa 24 ký tự, 128 câu hoàn chỉnh; giữ đủ mọi dòng.", "W is dictionary character count, D is word count, C is total sentence size across all suffixes. Up to 24 characters and 128 complete sentences, with every executed line traced.") },
} };
