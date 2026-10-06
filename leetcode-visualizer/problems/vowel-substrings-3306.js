"use strict";

const { bi, parsePlainParams } = require("./hard-viz-shared");
const SOURCE = Object.freeze([
  "class Solution:",
  "    def countOfSubstrings(self, word: str, k: int) -> int:",
  "        totals = []",
  "        for minimum in (k, k + 1):",
  "            freq = {}",
  "            consonants = 0",
  "            left = 0",
  "            total = 0",
  "            for right, ch in enumerate(word):",
  "                if ch in 'aeiou':",
  "                    freq[ch] = freq.get(ch, 0) + 1",
  "                else:",
  "                    consonants += 1",
  "                while len(freq) == 5 and consonants >= minimum:",
  "                    old = word[left]",
  "                    if old in 'aeiou':",
  "                        freq[old] -= 1",
  "                        if freq[old] == 0:",
  "                            del freq[old]",
  "                    else:",
  "                        consonants -= 1",
  "                    left += 1",
  "                total += left",
  "            totals.append(total)",
  "        return totals[0] - totals[1]",
]);

function parseInputs(input, params) {
  const options = parsePlainParams(params, 3306);
  if (typeof input !== "string" || !/^[a-z]{5,80}$/.test(input)) throw new TypeError("#3306: word cần 5–80 chữ a-z / word needs 5–80 lowercase letters.");
  let k = options.k;
  if (typeof k === "string" && /^\d+$/.test(k)) k = Number(k);
  if (!Number.isSafeInteger(k) || k < 0 || k > input.length - 5) throw new RangeError("#3306: k phải là số nguyên từ 0 đến len(word)-5 / k must be an integer from 0 to len(word)-5.");
  return [input, k];
}

const clone = value => JSON.parse(JSON.stringify(value));
function buildSteps(input, params) {
  const [word, k] = parseInputs(input, params);
  const steps = [];
  const locals = { word, k };
  const perRight = [Array(word.length).fill(null), Array(word.length).fill(null)];
  let beforeVars = Object.entries(locals).map(([name, value]) => ({ name, value }));
  let pass = null; let right = null; let phase = "initialize"; let guard = null;
  let removedPending = false; let addition = null; let answer = null;
  function emit(line, event, note, final = false) {
    const vars = Object.entries(locals).map(([name, value]) => ({ name, value: clone(value) }));
    steps.push({ arr: [], codeLines: [line], final,
      title: bi(`Dòng ${line}: ${SOURCE[line - 1].trim()}`, `Line ${line}: ${SOURCE[line - 1].trim()}`), note, vars,
      vowelSubstrings3306View: {
        line, source: SOURCE[line - 1], event, word, k, pass, phase, right,
        minimum: locals.minimum ?? null, left: locals.left ?? null,
        freq: clone(locals.freq ?? {}), consonants: locals.consonants ?? null,
        total: locals.total ?? null, totals: [...(locals.totals ?? [])],
        guard: clone(guard), removedPending, old: locals.old ?? null, addition, answer,
        perRight: perRight.map(row => [...row]), beforeVars: clone(beforeVars), nextLine: null, nextSource: null,
      },
    });
    beforeVars = vars;
  }
  locals.totals = [];
  emit(3, "totals", bi("Chuẩn bị hai tổng: F(k) và F(k+1). F(t) đếm chuỗi con đủ 5 nguyên âm và có ít nhất t phụ âm.", "Prepare two totals: F(k) and F(k+1). F(t) counts substrings with all five vowels and at least t consonants."));
  for (let index = 0; index < 2; index++) {
    pass = index; phase = "initialize"; right = null; guard = null; removedPending = false; addition = null;
    locals.minimum = k + index;
    emit(4, "pass", bi(`Lượt ${index + 1}: tính F(${locals.minimum}), đếm ít nhất ${locals.minimum} phụ âm.`, `Pass ${index + 1}: compute F(${locals.minimum}), counting at least ${locals.minimum} consonants.`));
    locals.freq = {};
    emit(5, "reset-freq", bi("Xóa bảng tần suất cho lượt mới. Chỉ lưu nguyên âm đang có số lần xuất hiện > 0.", "Reset the frequency dictionary for this pass. Keep only vowels with positive counts."));
    locals.consonants = 0;
    emit(6, "reset-consonants", bi("Bắt đầu với 0 phụ âm.", "Start with zero consonants."));
    locals.left = 0;
    emit(7, "reset-left", bi("Đặt đầu trái cửa sổ tại 0.", "Place the left window boundary at 0."));
    locals.total = 0;
    emit(8, "reset-total", bi("Tổng của lượt này bắt đầu từ 0.", "The total for this pass starts at zero."));
    for (let r = 0; r < word.length; r++) {
      right = r; phase = "scan"; guard = null; addition = null; locals.right = r; locals.ch = word[r];
      emit(9, "expand", bi(`right = ${r}, ch = '${word[r]}'. Dòng tiếp theo phân loại và thêm ký tự vào bộ đếm.`, `right = ${r}, ch = '${word[r]}'. The following lines classify and add the character to the counters.`));
      const vowel = "aeiou".includes(locals.ch);
      emit(10, "classify", bi(vowel ? `'${locals.ch}' là nguyên âm → chạy dòng 11.` : `'${locals.ch}' là phụ âm → chạy dòng 13.`, vowel ? `'${locals.ch}' is a vowel → run line 11.` : `'${locals.ch}' is a consonant → run line 13.`));
      if (vowel) {
        locals.freq[locals.ch] = (locals.freq[locals.ch] ?? 0) + 1;
        emit(11, "add-vowel", bi(`Tăng freq['${locals.ch}'] thành ${locals.freq[locals.ch]}. Đếm số lần, không chỉ đánh dấu có/không.`, `Increment freq['${locals.ch}'] to ${locals.freq[locals.ch]}. Track occurrences, not just presence.`));
      } else {
        locals.consonants++;
        emit(13, "add-consonant", bi(`Cửa sổ có ${locals.consonants} phụ âm.`, `The window contains ${locals.consonants} consonants.`));
      }
      while (true) {
        guard = { distinct: Object.keys(locals.freq).length, enough: locals.consonants >= locals.minimum };
        guard.result = guard.distinct === 5 && guard.enough;
        emit(14, guard.result ? "while-continue" : "while-stop", bi(guard.result ? "Cửa sổ đủ 5 nguyên âm và đủ phụ âm: start = left hiện tại hợp lệ. Thu hẹp để tìm hết các start hợp lệ." : locals.left === 0 ? "Dừng thu hẹp: cửa sổ hiện tại không hợp lệ. left = 0 nên không có start hợp lệ." : `Dừng thu hẹp: cửa sổ hiện tại không hợp lệ. Các start 0..${locals.left - 1} hợp lệ; từ left trở đi không hợp lệ.`, guard.result ? "The window has all vowels and enough consonants: the current left is a valid start. Shrink to find every valid start." : locals.left === 0 ? "Stop shrinking: the current window is invalid. left = 0, so no valid start exists." : `Stop shrinking: the current window is invalid. Starts 0..${locals.left - 1} are valid; starts from left onwards are invalid.`));
        if (!guard.result) break;
        locals.old = word[locals.left];
        emit(15, "read-old", bi(`Đọc old = word[${locals.left}] = '${locals.old}' để bỏ khỏi cửa sổ.`, `Read old = word[${locals.left}] = '${locals.old}' to remove it from the window.`));
        const oldVowel = "aeiou".includes(locals.old);
        emit(16, "classify-old", bi(oldVowel ? "old là nguyên âm: giảm tần suất." : "old là phụ âm: giảm consonants.", oldVowel ? "old is a vowel: decrease its frequency." : "old is a consonant: decrease consonants."));
        guard = null;
        if (oldVowel) {
          locals.freq[locals.old]--; removedPending = true;
          emit(17, "remove-vowel", bi(`Đã trừ '${locals.old}': freq còn ${locals.freq[locals.old]}. left chưa tăng; ký tự gạch ngang đã được trừ khỏi bộ đếm.`, `Removed '${locals.old}': its frequency is now ${locals.freq[locals.old]}. left has not advanced yet; the struck-through character is already excluded from the counters.`));
          emit(18, "zero-check", bi(locals.freq[locals.old] === 0 ? "Tần suất bằng 0: phải xóa khóa để len(freq) phản ánh số nguyên âm khác nhau." : "Tần suất vẫn > 0: giữ khóa này, vì cửa sổ vẫn còn nguyên âm đó.", locals.freq[locals.old] === 0 ? "Zero frequency: delete the key so len(freq) reflects distinct vowels." : "Frequency remains positive: keep this key because the vowel is still present."));
          if (locals.freq[locals.old] === 0) {
            delete locals.freq[locals.old];
            emit(19, "delete-vowel", bi(`Xóa khóa '${locals.old}'; còn ${Object.keys(locals.freq).length} loại nguyên âm.`, `Delete key '${locals.old}'; ${Object.keys(locals.freq).length} distinct vowels remain.`));
          }
        } else {
          locals.consonants--; removedPending = true;
          emit(21, "remove-consonant", bi(`Đã trừ phụ âm '${locals.old}'; consonants = ${locals.consonants}. left sẽ tăng ở dòng 22.`, `Removed consonant '${locals.old}'; consonants = ${locals.consonants}. left will advance on line 22.`));
        }
        locals.left++; removedPending = false;
        emit(22, "move-left", bi(`left = ${locals.left}. Kiểm tra lại while ở dòng 14 trước khi cộng tổng.`, `left = ${locals.left}. Recheck the while condition on line 14 before adding to the total.`));
      }
      addition = locals.left;
      locals.total += addition;
      perRight[pass][right] = addition;
      emit(23, "count", bi(addition === 0 ? "Cộng 0: không có start hợp lệ cho right này." : `Cộng left = ${addition}: đúng ${addition} chuỗi con kết thúc tại right = ${right}, bắt đầu ở 0..${addition - 1}. Đây là ít nhất ${locals.minimum} phụ âm, chưa phải đúng k.`, addition === 0 ? "Add 0: no valid start exists for this right." : `Add left = ${addition}: exactly ${addition} substrings end at right = ${right}, with starts 0..${addition - 1}. These have at least ${locals.minimum} consonants, not yet exactly k.`));
    }
    emit(9, "right-end", bi("right đã đi hết word. Mỗi chuỗi con được đếm theo đúng một vị trí kết thúc.", "right has traversed word. Each substring is counted at its unique ending position."));
    locals.totals.push(locals.total); phase = "complete";
    emit(24, "pass-total", bi(`Lưu F(${locals.minimum}) = ${locals.total} vào totals.`, `Save F(${locals.minimum}) = ${locals.total} in totals.`));
  }
  emit(4, "passes-end", bi("Đã hoàn thành cả hai ngưỡng k và k+1.", "Both thresholds k and k+1 are complete."));
  answer = locals.totals[0] - locals.totals[1];
  emit(25, "return", bi(`Đúng ${k} phụ âm = F(${k}) − F(${k + 1}) = ${locals.totals[0]} − ${locals.totals[1]} = ${answer}. Những chuỗi có nhiều hơn k phụ âm xuất hiện trong cả hai tổng và bị trừ đi.`, `Exactly ${k} consonants = F(${k}) − F(${k + 1}) = ${locals.totals[0]} − ${locals.totals[1]} = ${answer}. Substrings with more than k consonants appear in both totals and cancel out.`), true);
  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.vowelSubstrings3306View.nextLine = nextLine;
    step.vowelSubstrings3306View.nextSource = nextLine === null ? null : SOURCE[nextLine - 1];
  });
  return { original: word, answer, steps };
}

module.exports = {
  3306: {
    id: 3306, difficulty: "medium", slug: "count-of-substrings-containing-every-vowel-and-k-consonants-ii",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }, { key: "hashmap", vi: "Hash Map", en: "Hash Map" }],
    title: bi("Đếm chuỗi con đủ nguyên âm và k phụ âm II", "Count of Substrings Containing Every Vowel and K Consonants II"),
    titleVi: bi("Hai lượt cửa sổ: ít nhất k trừ ít nhất k+1", "Two window passes: at least k minus at least k+1"),
    statement: bi("Cho word chỉ chứa chữ thường và k ≥ 0. Đếm chuỗi con chứa mỗi nguyên âm a,e,i,o,u ít nhất một lần và có đúng k phụ âm. Chuỗi con là đoạn liên tiếp; các vị trí khác nhau được đếm riêng.", "Given lowercase word and k ≥ 0, count substrings containing each vowel a,e,i,o,u at least once and exactly k consonants. Substrings are contiguous; different positions count separately."),
    defaultInput: "ieaouqqieaouqq", inputKind: "string",
    inputLabel: bi("word (5–80 chữ a-z)", "word (5–80 lowercase letters)"),
    extraParams: [{ key: "k", type: "number", default: 1, label: bi("k (0 ≤ k ≤ len(word) − 5)", "k (0 ≤ k ≤ len(word) − 5)") }],
    debugMode: "line-by-line", code: SOURCE, builder: buildSteps, liveArgs: parseInputs,
    approach: [
      bi("F(t) đếm chuỗi con chứa đủ 5 nguyên âm và ít nhất t phụ âm. Đúng k = F(k) − F(k+1), vì các chuỗi nhiều phụ âm hơn bị trừ đi.", "F(t) counts substrings with all five vowels and at least t consonants. Exactly k = F(k) − F(k+1), cancelling substrings with more consonants."),
      bi("Mỗi lượt, mở rộng right và cập nhật freq/consonants. Khi cửa sổ còn hợp lệ, bỏ word[left] và tăng left. Xóa khóa nguyên âm khi tần suất về 0.", "In each pass, advance right and update freq/consonants. While the window remains valid, remove word[left] and advance left. Delete vowel keys when their count reaches zero."),
      bi("Khi while dừng, [left,right] không hợp lệ, nhưng mọi start < left đều hợp lệ; start ≥ left không thể khắc phục phần thiếu. Vì thế cộng left, không cộng độ dài cửa sổ.", "When while stops, [left,right] is invalid, but all starts < left are valid; starts ≥ left cannot restore what is missing. Add left, not the window length."),
      bi("Mô phỏng nhận tối đa 80 ký tự để giữ debug từng dòng. Đề cho phép 200000 ký tự; code vẫn chạy O(n) với hai lượt. Đáp án có thể vượt số nguyên 32 bit.", "The visualization accepts up to 80 characters to retain every debug line. The problem allows 200000 characters; the code still runs in O(n) with two passes. Answers may exceed 32-bit integers."),
    ],
    complexity: { time: "O(n)", space: "O(1)", note: bi("Hai lượt, mỗi con trỏ chỉ tiến tối đa n lần; freq có tối đa 5 khóa, totals có 2 số. Snapshot và bảng minh họa là chi phí riêng của mô phỏng.", "Two passes, each pointer advances at most n times; freq has at most five keys and totals has two numbers. Snapshots and the visualization table are separate costs.") },
  },
};
