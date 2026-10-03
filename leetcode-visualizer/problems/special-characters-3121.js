"use strict";

const bi = (vi, en) => ({ vi, en });
const MAX_WORD_LENGTH = 80;
const SOURCE = Object.freeze([
  "class Solution:",
  "    def numberOfSpecialChars(self, word: str) -> int:",
  "        last_lower = [-1] * 26",
  "        first_upper = [len(word)] * 26",
  "",
  "        for i, ch in enumerate(word):",
  "            k = ord(ch.lower()) - ord('a')",
  "            if ch.islower():",
  "                last_lower[k] = i",
  "            elif first_upper[k] == len(word):",
  "                first_upper[k] = i",
  "",
  "        ans = 0",
  "        for k in range(26):",
  "            if last_lower[k] != -1 and last_lower[k] < first_upper[k] < len(word):",
  "                ans += 1",
  "        return ans",
]);

function parseWord(input) {
  if (typeof input !== "string") throw new TypeError("#3121: word must be a string / word phải là chuỗi.");
  const word = input.trim();
  if (!word.length || word.length > MAX_WORD_LENGTH) throw new RangeError(`#3121: visualization accepts 1..${MAX_WORD_LENGTH} letters / mô phỏng nhận 1..${MAX_WORD_LENGTH} chữ cái.`);
  if (!/^[a-zA-Z]+$/.test(word)) throw new TypeError("#3121: word may contain only a-z and A-Z / chỉ dùng a-z và A-Z.");
  return word;
}

function buildSteps(input) {
  const word = parseWord(input);
  const steps = [];
  let lastLower = null;
  let firstUpper = null;
  let i = null;
  let k = null;
  let ans = null;
  let phase = "initialize";
  const locals = { word };
  const checked = Array(26).fill(null);
  const counted = [];
  function emit(line, event, title, note, final = false) {
    steps.push({
      arr: [], codeLines: [line], final,
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      specialCharacters3121View: {
        word, phase, event, line, source: SOURCE[line - 1],
        index: phase === "scan" ? i : null,
        activeLetter: phase === "scan" && i !== null ? word[i].toLowerCase() : phase === "check" && k !== null ? String.fromCharCode(97 + k) : null,
        lastLower: lastLower ? [...lastLower] : null,
        firstUpper: firstUpper ? [...firstUpper] : null,
        checked: [...checked], counted: [...counted], answer: ans,
      },
    });
  }
  emit(2, "call", bi("Đếm chữ cái đặc biệt", "Count special letters"), bi("Cả hai dạng phải xuất hiện, và mọi chữ thường phải đứng trước chữ hoa đầu tiên.", "Both cases must occur, and every lowercase occurrence must precede the first uppercase occurrence."));
  lastLower = Array(26).fill(-1);
  locals.last_lower = lastLower;
  emit(3, "init-lower", bi("Khởi tạo last_lower = −1", "Initialize last_lower = −1"), bi("−1 nghĩa là chưa thấy chữ thường.", "−1 means no lowercase occurrence has been seen."));
  firstUpper = Array(26).fill(word.length);
  locals.first_upper = firstUpper;
  emit(4, "init-upper", bi(`Khởi tạo first_upper = ${word.length}`, `Initialize first_upper = ${word.length}`), bi("len(word) là vị trí giả nằm ngoài chuỗi, biểu thị chưa thấy chữ hoa.", "len(word) is a sentinel outside the word, meaning no uppercase occurrence has been seen."));
  phase = "scan";
  for (i = 0; i < word.length; i++) {
    const ch = word[i];
    locals.i = i;
    locals.ch = ch;
    emit(6, "read", bi(`Đọc word[${i}] = '${ch}'`, `Read word[${i}] = '${ch}'`), bi("Quét chuỗi từ trái sang phải.", "Scan the word from left to right."));
    k = ch.toLowerCase().charCodeAt(0) - 97;
    locals.k = k;
    emit(7, "map-letter", bi(`'${ch}' → ô ${k} (${ch.toLowerCase()})`, `'${ch}' → slot ${k} (${ch.toLowerCase()})`), bi("Chữ thường và chữ hoa dùng chung một ô trong hai mảng.", "Lowercase and uppercase share the same slot in the two arrays."));
    const lower = ch >= "a" && ch <= "z";
    emit(8, "case-check", bi(`ch.islower() → ${lower ? "True" : "False"}`, `ch.islower() → ${lower ? "True" : "False"}`), bi(lower ? "Cập nhật vị trí chữ thường cuối cùng." : "Chữ hoa: chỉ ghi nhận lần xuất hiện đầu tiên.", lower ? "Update the last lowercase position." : "Uppercase: record only the first occurrence."));
    if (lower) {
      lastLower[k] = i;
      emit(9, "update-lower", bi(`last_lower[${k}] = ${i}`, `last_lower[${k}] = ${i}`), bi("Luôn ghi đè: cần chữ thường CUỐI CÙNG, kể cả khi đã gặp chữ hoa.", "Always overwrite: we need the LAST lowercase occurrence, including any after an uppercase."));
    } else {
      const first = firstUpper[k] === word.length;
      emit(10, "first-upper-check", bi(`first_upper[${k}] == len(word) → ${first ? "True" : "False"}`, `first_upper[${k}] == len(word) → ${first ? "True" : "False"}`), bi(first ? "Chưa thấy chữ hoa này: lưu vị trí hiện tại." : "Đã thấy chữ hoa này: giữ nguyên vị trí đầu tiên.", first ? "First uppercase occurrence: save this position." : "Already saw this uppercase: keep the first position."));
      if (first) {
        firstUpper[k] = i;
        emit(11, "update-upper", bi(`first_upper[${k}] = ${i}`, `first_upper[${k}] = ${i}`), bi("Đây là chữ hoa ĐẦU TIÊN của chữ cái này.", "This is the FIRST uppercase occurrence of this letter."));
      }
    }
  }
  phase = "check";
  k = null;
  ans = 0;
  locals.ans = ans;
  // The Python loop leaves i and ch at their last values; its k remains until the next loop iteration.
  emit(13, "init-answer", bi("ans = 0", "ans = 0"), bi("Quét xong. Kiểm tra riêng 26 chữ cái và đếm mỗi chữ đúng một lần.", "Scanning is complete. Check all 26 letters and count each one at most once."));
  for (k = 0; k < 26; k++) {
    locals.k = k;
    const letter = String.fromCharCode(97 + k);
    emit(14, "check-letter", bi(`Xét ${letter} / ${letter.toUpperCase()}`, `Check ${letter} / ${letter.toUpperCase()}`), bi("Cần cả hai dạng và last_lower < first_upper.", "We need both cases and last_lower < first_upper."));
    const special = lastLower[k] !== -1 && lastLower[k] < firstUpper[k] && firstUpper[k] < word.length;
    checked[k] = special;
    emit(15, "compare", bi(`${letter}: ${special ? "đặc biệt" : "không đặc biệt"}`, `${letter}: ${special ? "special" : "not special"}`), bi(`last_lower=${lastLower[k]}, first_upper=${firstUpper[k]}, n=${word.length}.`, `last_lower=${lastLower[k]}, first_upper=${firstUpper[k]}, n=${word.length}.`));
    if (special) {
      ans++;
      locals.ans = ans;
      counted.push(letter);
      emit(16, "count", bi(`Đếm ${letter}: ans = ${ans}`, `Count ${letter}: ans = ${ans}`), bi("Một chữ cái đặc biệt đóng góp đúng 1 vào kết quả.", "A special letter contributes exactly 1 to the answer."));
    }
  }
  phase = "done";
  emit(17, "return", bi(`return ${ans}`, `return ${ans}`), bi(`Các chữ cái đặc biệt: ${counted.join(", ") || "∅"}.`, `Special letters: ${counted.join(", ") || "∅"}.`), true);
  return { original: word, answer: ans, steps };
}

module.exports = {
  3121: {
    id: 3121, difficulty: "medium", slug: "count-the-number-of-special-characters-ii",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }, { key: "array", vi: "Mảng", en: "Array" }],
    title: bi("Đếm số ký tự đặc biệt II", "Count the Number of Special Characters II"),
    titleVi: bi("Chữ thường cuối cùng phải trước chữ hoa đầu tiên", "Last lowercase must precede first uppercase"),
    statement: bi("Cho chuỗi word gồm chữ cái tiếng Anh. Một chữ cái là đặc biệt khi xuất hiện cả dạng thường và hoa, đồng thời mọi lần xuất hiện dạng thường đều đứng trước dạng hoa đầu tiên. Trả về số chữ cái đặc biệt.", "Given an English-letter string word, a letter is special when both cases occur and all its lowercase occurrences come before its first uppercase occurrence. Return the number of special letters."),
    inputKind: "string", inputLabel: bi("word (1–80 chữ cái để mô phỏng)", "word (1–80 letters for visualization)"),
    defaultInput: "aaAbcBC", extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Quét word, lưu vị trí chữ thường cuối cùng trong last_lower và chữ hoa đầu tiên trong first_upper.", "Scan word, recording the last lowercase position in last_lower and the first uppercase position in first_upper."),
      bi("Chữ hoa lặp lại không ghi đè first_upper; chữ thường luôn ghi đè last_lower.", "Repeated uppercase letters never overwrite first_upper; lowercase letters always overwrite last_lower."),
      bi("Đếm chữ cái k nếu last_lower[k] != −1 và last_lower[k] < first_upper[k] < len(word).", "Count letter k when last_lower[k] != −1 and last_lower[k] < first_upper[k] < len(word)."),
      bi("Mô phỏng giới hạn 80 ký tự để giữ đầy đủ từng bước. Mã Python dùng được với giới hạn gốc 200.000 ký tự.", "The visualization accepts up to 80 characters to retain every step. The Python solution supports the original 200,000-character limit."),
    ],
    complexity: { time: "O(n + 26) = O(n)", space: "O(26) = O(1)", note: bi("Hai mảng 26 ô; mỗi ký tự được quét một lần. Không tính bộ nhớ lưu các khung mô phỏng.", "Two arrays of 26 slots; each character is scanned once. Excludes stored visualization frames.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseWord(input)],
  },
};
