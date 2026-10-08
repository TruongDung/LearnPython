"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def findLongestWord(self, s: str, dictionary: list[str]) -> str:",
  '        best = ""',
  "        for word in dictionary:",
  "            i, j = 0, 0",
  "            while i < len(s) and j < len(word):",
  "                if s[i] == word[j]:",
  "                    j += 1",
  "                i += 1",
  "            if j != len(word):",
  "                continue",
  "            if len(word) > len(best) or (len(word) == len(best) and word < best):",
  "                best = word",
  "        return best",
];
const preview = value => value.length <= 40 ? value : value.slice(0, 37) + "…";

function parseInput(input, params = {}) {
  const error = message => { throw new Error(`524: ${message}`); };
  if (typeof input !== "string" || !/^[a-z]{1,1000}$/.test(input)) error("s must contain 1–1000 lowercase letters / s phải gồm 1–1000 chữ thường a–z.");
  let dictionary = params.dictionary;
  if (typeof dictionary === "string") {
    try { dictionary = JSON.parse(dictionary); }
    catch { error('dictionary must be a JSON array, e.g. ["ale","apple"] / dictionary phải là mảng JSON.'); }
  }
  if (!Array.isArray(dictionary) || dictionary.length < 1 || dictionary.length > 1000 || dictionary.some(word => typeof word !== "string" || !/^[a-z]{1,1000}$/.test(word))) {
    error("dictionary must contain 1–1000 words, each with 1–1000 lowercase letters / dictionary cần 1–1000 từ, mỗi từ gồm 1–1000 chữ thường.");
  }
  return { s: input, dictionary: [...dictionary] };
}

function buildSteps(input, params) {
  const { s, dictionary } = parseInput(input, params);
  const steps = [], history = [];
  let best = "", bestMatches = [], word = "", index = -1, i = 0, j = 0, matches = [];
  let inspected = 0, validCount = 0, detailCount = 0, omitted = 0;
  const emit = (line, phase, title, note, extra = {}) => {
    if (extra.detail && detailCount++ >= 1400) { omitted++; return; }
    if (detailCount >= 1400 && ["candidate", "pointers", "choice"].includes(phase)) { omitted++; return; }
    steps.push({
      arr: [], highlight: [], mark: [], codeLines: [line], title, note, final: phase === "done",
      vars: [{ name: "i", value: i }, { name: "j", value: j }, { name: "word", value: preview(word) }, { name: "best", value: preview(best) }],
      dictionary524View: {
        s, word, index, i, j, best, phase,
        matches: phase === "done" ? [...matches] : matches.slice(-40),
        matchOffset: phase === "done" ? 0 : Math.max(0, matches.length - 40), total: dictionary.length,
        inspected, validCount, omitted, compared: extra.compared ? { ...extra.compared } : null,
        history: history.slice(-5).map(item => ({ ...item })),
        candidates: dictionary.slice(Math.max(0, index - 2), Math.max(0, index - 2) + 5).map((value, offset) => ({ index: Math.max(0, index - 2) + offset, word: preview(value), length: value.length })),
        answer: phase === "done" ? best : null,
      },
    });
  };
  emit(3, "init", bi("Bắt đầu với best = \"\"", 'Start with best = ""'), bi("Một từ hợp lệ phải xuất hiện trong s theo đúng thứ tự. Được bỏ ký tự, không được đổi thứ tự.", "A valid word must appear in s in the same order. Characters may be deleted, but never reordered."));
  for (index = 0; index < dictionary.length; index++) {
    word = dictionary[index]; matches = [];
    emit(4, "candidate", bi(`Thử từ ${index + 1}/${dictionary.length}: ${preview(word)}`, `Try word ${index + 1}/${dictionary.length}: ${preview(word)}`), bi("Kiểm tra từ này trước khi so sánh với best.", "Check this word before comparing it with best."));
    i = 0; j = 0;
    emit(5, "pointers", bi("i = 0, j = 0", "i = 0, j = 0"), bi("i duyệt s; j chỉ chữ tiếp theo cần tìm trong word.", "i scans s; j points to the next required letter in word."));
    while (i < s.length && j < word.length) {
      const compared = { i, j, source: s[i], target: word[j], equal: s[i] === word[j] };
      emit(7, "compare", bi(`${s[i]} ${compared.equal ? "=" : "≠"} ${word[j]}`, `${s[i]} ${compared.equal ? "=" : "≠"} ${word[j]}`), compared.equal
        ? bi("Khớp: giữ ký tự này và chuyển sang chữ tiếp theo của word.", "Match: keep this character and move to the next letter of word.")
        : bi("Không khớp: bỏ ký tự này của s, vẫn tìm cùng một chữ trong word.", "Mismatch: delete this character from s; keep looking for the same letter in word."), { detail: true, compared });
      if (compared.equal) {
        matches.push(i); j++;
        emit(8, "match", bi(`j → ${j}: đã khớp ${j}/${word.length} chữ`, `j → ${j}: matched ${j}/${word.length} letters`), bi("Chỉ khi hai chữ bằng nhau thì j mới tiến lên.", "j advances only when the two letters match."), { detail: true, compared });
      }
      i++;
      emit(9, "advance", bi(`i → ${i}`, `i → ${i}`), bi("i luôn tiến lên; các vị trí được giữ tăng dần nên thứ tự không đổi.", "i always advances; kept positions increase, preserving their order."), { detail: true });
    }
    const valid = j === word.length;
    inspected++; if (valid) validCount++;
    emit(10, "verdict", valid ? bi("Khớp đủ: từ hợp lệ", "All letters matched: valid word") : bi(`Chỉ khớp ${j}/${word.length}: loại từ này`, `Only ${j}/${word.length} matched: reject this word`), valid
      ? bi("Đã tìm đủ các chữ theo thứ tự. Bây giờ mới xét độ dài và thứ tự từ điển.", "All letters were found in order. Now compare length and lexicographic order.")
      : bi(`Đã hết s nhưng còn thiếu chữ '${word[j]}'. best giữ nguyên.`, `s ended before the required '${word[j]}' was found. best stays unchanged.`));
    if (!valid) {
      history.push({ index, word: preview(word), valid, selected: false, reason: "invalid" });
      emit(11, "reject", bi("Bỏ qua từ không hợp lệ", "Skip the invalid word"), bi("Độ dài lớn cũng không có ích nếu không tạo được từ này bằng cách xóa ký tự.", "A longer word cannot win unless it can be formed by deleting characters."));
      continue;
    }
    const better = word.length > best.length || (word.length === best.length && word < best);
    const reason = word.length > best.length ? "longer" : word.length < best.length ? "shorter" : word < best ? "lex-smaller" : "lex-keep";
    const explanation = {
      longer: bi(`${word.length} > ${best.length}: từ mới dài hơn, chọn từ mới.`, `${word.length} > ${best.length}: the new word is longer, so choose it.`),
      shorter: bi(`${word.length} < ${best.length}: từ mới ngắn hơn, giữ best.`, `${word.length} < ${best.length}: the new word is shorter, so keep best.`),
      "lex-smaller": bi(`Cùng ${word.length} chữ; '${preview(word)}' đứng trước '${preview(best)}' trong từ điển.`, `Both have ${word.length} letters; '${preview(word)}' comes before '${preview(best)}' lexicographically.`),
      "lex-keep": bi(`Cùng ${word.length} chữ; từ mới không đứng trước best trong từ điển.`, `Both have ${word.length} letters; the new word does not precede best lexicographically.`),
    }[reason];
    emit(12, "choice", better ? bi("Từ mới thắng best", "The new word beats best") : bi("Giữ best hiện tại", "Keep the current best"), explanation);
    history.push({ index, word: preview(word), valid, selected: better, reason });
    if (better) {
      best = word; bestMatches = [...matches];
      emit(13, "update", bi(`best ← ${preview(best)}`, `best ← ${preview(best)}`), explanation);
    } else {
      emit(12, "keep", bi("best không đổi", "best stays unchanged"), explanation);
    }
  }
  index = -1; word = best; matches = bestMatches; i = s.length; j = best.length;
  emit(14, "done", best ? bi(`Kết quả: ${preview(best)}`, `Result: ${preview(best)}`) : bi('Kết quả: ""', 'Result: ""'), bi(`Đã kiểm tra ${inspected} từ, có ${validCount} từ hợp lệ. ${best ? "Các ô xanh cho thấy cách giữ lại từ thắng cuộc." : "Không có từ hợp lệ nên trả chuỗi rỗng."}`, `Checked ${inspected} words; ${validCount} are valid. ${best ? "Green cells show how to keep the winning word." : "No valid word exists, so return the empty string."}`));
  return { original: s, answer: best, steps };
}

module.exports = {
  524: {
    id: 524, slug: "longest-word-in-dictionary-through-deleting", difficulty: "medium",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Longest Word in Dictionary through Deleting", "Longest Word in Dictionary through Deleting"),
    titleVi: bi("Từ dài nhất tạo được bằng cách xóa ký tự", "Longest word formed by deleting characters"),
    statement: bi("Cho s và dictionary. Tìm từ dài nhất trong dictionary có thể tạo bằng cách xóa một số ký tự của s, giữ nguyên thứ tự. Nếu bằng độ dài, chọn từ nhỏ nhất theo thứ tự từ điển; nếu không có từ hợp lệ, trả chuỗi rỗng.", "Given s and dictionary, find the longest dictionary word formed by deleting characters from s while preserving order. Break length ties by choosing the lexicographically smallest word. Return an empty string if none is valid."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("s — chuỗi chữ thường a–z", "s — lowercase string a–z"), defaultInput: "abpcplea",
    extraParams: [{ key: "dictionary", type: "string", label: bi("dictionary — mảng JSON các từ", "dictionary — JSON array of words"), default: '["ale","apple","monkey","plea"]' }],
    debugMode: "line-by-line",
    approach: [bi("Với mỗi từ, i duyệt s và j duyệt từ cần tìm.", "For each word, i scans s and j scans the word."), bi("Khi khớp, tiến cả hai; khi khác, chỉ tiến i. Khớp đủ thì từ hợp lệ.", "On a match, advance both pointers; otherwise advance only i. Matching all letters makes the word valid."), bi("Chọn từ dài hơn; nếu cùng độ dài, chọn từ nhỏ hơn theo thứ tự từ điển.", "Choose a longer word; on equal lengths, choose the lexicographically smaller word.")],
    complexity: { time: "O(d × n)", space: "O(1)", note: bi("d là số từ, n = len(s). Mỗi từ duyệt s tối đa một lần; không tính dữ liệu mô phỏng. Với dữ liệu lớn, mô phỏng rút gọn các bước nhưng vẫn hiển thị kết luận cho mọi từ.", "d is the word count and n = len(s). Each word scans s at most once; excludes visualization data. Large inputs condense steps while still showing every word's verdict.") },
    code: SOURCE, builder: buildSteps,
    liveArgs: (input, params) => { const { s, dictionary } = parseInput(input, params); return [s, dictionary]; },
  },
};
