"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def wordPattern(self, pattern: str, s: str) -> bool:",
  "        words = s.split()",
  "        if len(pattern) != len(words):",
  "            return False",
  "        char_to_word, word_to_char = {}, {}",
  "        for ch, word in zip(pattern, words):",
  "            if ch in char_to_word and char_to_word[ch] != word:",
  "                return False",
  "            if word in word_to_char and word_to_char[word] != ch:",
  "                return False",
  "            char_to_word[ch] = word",
  "            word_to_char[word] = ch",
  "        return True",
];

function parseInput(input, params = {}) {
  const pattern = input, s = params.s;
  if (typeof pattern !== "string" || !/^[a-z]{1,100}$/.test(pattern)) {
    throw new Error("290: pattern must contain 1–100 lowercase letters / pattern phải gồm 1–100 chữ thường a–z.");
  }
  if (typeof s !== "string" || s.length > 300 || !/^[a-z]+(?: [a-z]+)*$/.test(s)) {
    throw new Error("290: s must contain 1–300 lowercase letters and single spaces between words / s phải gồm 1–300 chữ thường và dấu cách đơn giữa các từ, không có khoảng trắng đầu/cuối.");
  }
  return { pattern, s, words: s.split(" ") };
}

function buildSteps(input, params) {
  const { pattern, s, words } = parseInput(input, params);
  const charToWord = new Map(), wordToChar = new Map(), steps = [];
  let initialized = false, index = null, ch = null, word = null, matched = 0;
  let forwardConflict = null, reverseConflict = null, answer = null;
  const emit = (line, phase, title, note, final = false) => steps.push({
    arr: [], codeLines: [line], title, note, final,
    vars: [{ name: "pattern", value: pattern }, { name: "s", value: s }, { name: "words", value: [...words] },
      ...(initialized ? [{ name: "char_to_word", value: JSON.stringify(Object.fromEntries(charToWord)) }, { name: "word_to_char", value: JSON.stringify(Object.fromEntries(wordToChar)) }] : []),
      ...(ch === null ? [] : [{ name: "ch", value: ch }, { name: "word", value: word }])],
    wordPattern290View: { pattern, s, words, initialized, index, ch, word, matched, forwardConflict, reverseConflict, answer, phase,
      charToWord: [...charToWord].map(entry => [...entry]), wordToChar: [...wordToChar].map(entry => [...entry]) },
  });
  emit(3, "split", bi("Tách s thành các từ", "Split s into words"), bi("Ghép mỗi ký tự của pattern với một từ tại cùng vị trí, không ghép với từng chữ của s.", "Pair each pattern letter with the word at the same position, rather than individual letters of s."));
  const differentLength = pattern.length !== words.length;
  emit(4, "length", bi(`${pattern.length} ký tự · ${words.length} từ`, `${pattern.length} letters · ${words.length} words`), bi(
    differentLength ? "Số ký tự pattern khác số từ: không thể khớp toàn bộ." : "Số lượng bằng nhau. Tiếp theo kiểm tra ánh xạ theo cả hai chiều.",
    differentLength ? "The pattern length differs from the word count: a full match is impossible." : "The counts match. Next check the mapping in both directions."));
  if (differentLength) {
    answer = false;
    emit(5, "done", bi("False: khác số lượng", "False: different counts"), bi("Dừng trước khi tạo các bảng ánh xạ. Ô ∅ là vị trí không có ký tự hoặc từ tương ứng.", "Stop before creating the maps. ∅ marks a missing letter or word at that position."), true);
    return { pattern, original: s, answer, steps };
  }
  initialized = true;
  emit(6, "init", bi("Tạo hai bảng ánh xạ rỗng", "Create two empty maps"), bi("Một ký tự chỉ đi với một từ; một từ chỉ thuộc về một ký tự.", "Each letter maps to one word; each word belongs to one letter."));
  for (index = 0; index < pattern.length; index++) {
    ch = pattern[index]; word = words[index]; forwardConflict = null; reverseConflict = null;
    emit(7, "read", bi(`Vị trí ${index}: '${ch}' ↔ '${word}'`, `Position ${index}: '${ch}' ↔ '${word}'`), bi("Chưa xác nhận cặp này. Kiểm tra các ánh xạ đã lưu trước.", "This pair is not verified yet. Check the previously stored mappings."));
    forwardConflict = charToWord.has(ch) && charToWord.get(ch) !== word;
    emit(8, "forward-check", bi("Kiểm tra ký tự → từ", "Check letter → word"), bi(
      forwardConflict ? `'${ch}' đã đi với '${charToWord.get(ch)}', nhưng hiện gặp '${word}': xung đột.` : charToWord.has(ch) ? `'${ch}' vẫn đi với '${word}', đúng ánh xạ đã lưu.` : `'${ch}' chưa có ánh xạ. Cần kiểm tra từ '${word}' có thuộc ký tự khác không.`,
      forwardConflict ? `'${ch}' already maps to '${charToWord.get(ch)}', but now meets '${word}': conflict.` : charToWord.has(ch) ? `'${ch}' still maps to '${word}', matching the stored mapping.` : `'${ch}' has no mapping yet. Check whether '${word}' belongs to another letter.`));
    if (forwardConflict) {
      answer = false;
      emit(9, "done", bi("False: một ký tự gặp hai từ", "False: one letter meets two words"), bi("Giữ nguyên các ánh xạ cũ và dừng tại xung đột đầu tiên.", "Keep the old mappings unchanged and stop at the first conflict."), true);
      return { pattern, original: s, answer, steps };
    }
    reverseConflict = wordToChar.has(word) && wordToChar.get(word) !== ch;
    emit(10, "reverse-check", bi("Kiểm tra từ → ký tự", "Check word → letter"), bi(
      reverseConflict ? `'${word}' đã thuộc về '${wordToChar.get(word)}', không thể thuộc thêm '${ch}'.` : wordToChar.has(word) ? `'${word}' vẫn thuộc về '${ch}', đúng ánh xạ đã lưu.` : `'${word}' chưa thuộc ký tự nào. Có thể lưu cặp này.`,
      reverseConflict ? `'${word}' already belongs to '${wordToChar.get(word)}', so it cannot also belong to '${ch}'.` : wordToChar.has(word) ? `'${word}' still belongs to '${ch}', matching the stored mapping.` : `'${word}' has no owner yet. This pair can be stored.`));
    if (reverseConflict) {
      answer = false;
      emit(11, "done", bi("False: hai ký tự dùng chung một từ", "False: two letters share one word"), bi("Chỉ kiểm tra ký tự → từ sẽ bỏ sót lỗi này. Phải kiểm tra cả chiều ngược lại.", "Checking only letter → word would miss this conflict. The reverse direction is required."), true);
      return { pattern, original: s, answer, steps };
    }
    charToWord.set(ch, word);
    emit(12, "store-forward", bi(`Lưu '${ch}' → '${word}'`, `Store '${ch}' → '${word}'`), bi("Đã lưu chiều ký tự → từ. Chiều từ → ký tự được lưu ở bước tiếp theo.", "Stored letter → word. Store word → letter in the next step."));
    wordToChar.set(word, ch); matched++;
    emit(13, "store-reverse", bi(`Lưu '${word}' → '${ch}'`, `Store '${word}' → '${ch}'`), bi(`Đã xác nhận ${matched}/${pattern.length} vị trí; các cặp lặp lại phải giữ nguyên cả hai chiều.`, `Verified ${matched}/${pattern.length} positions; repeated pairs must preserve both directions.`));
  }
  index = pattern.length - 1; answer = true;
  emit(14, "done", bi("True: các từ khớp pattern", "True: the words match the pattern"), bi("Mọi vị trí đều khớp và không có ký tự hay từ nào có hai ánh xạ khác nhau.", "Every position matches, and neither a letter nor a word has conflicting mappings."), true);
  return { pattern, original: s, answer, steps };
}

module.exports = {
  290: {
    id: 290, slug: "word-pattern", difficulty: "easy",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }],
    title: bi("Word Pattern", "Word Pattern"), titleVi: bi("Các từ có khớp mẫu không?", "Do the words follow the pattern?"),
    statement: bi("Cho pattern và chuỗi s gồm các từ cách nhau một dấu cách. Trả True nếu có ánh xạ một-một giữa ký tự pattern và từ tại mỗi vị trí. Một ký tự không thể ghép hai từ khác nhau; hai ký tự khác nhau không thể dùng chung một từ. Ví dụ: abba / dog cat cat dog → True; abba / dog cat cat fish → False; ab / dog dog → False. Đề gốc: pattern tối đa 300 chữ, s tối đa 3.000 ký tự; mô phỏng nhận tối đa 100 chữ pattern và 300 ký tự của s.", "Given pattern and s containing words separated by single spaces, return True if pattern letters and words have a one-to-one mapping at every position. One letter cannot map to two different words; different letters cannot share a word. Examples: abba / dog cat cat dog → True; abba / dog cat cat fish → False; ab / dog dog → False. Original limits: 300 pattern letters and 3,000 characters in s; visualization accepts up to 100 pattern letters and 300 characters in s."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("pattern — 1–100 chữ thường a–z", "pattern — 1–100 lowercase letters a–z"),
    defaultInput: "abba", extraParams: [{ key: "s", type: "string", label: bi("s — các từ cách nhau một dấu cách, tối đa 300 ký tự", "s — words separated by single spaces, up to 300 characters"), default: "dog cat cat dog" }],
    debugMode: "line-by-line",
    approach: [
      bi("Tách s thành words. Số từ phải bằng số ký tự pattern.", "Split s into words. The word count must equal the pattern length."),
      bi("Duyệt từng cặp ký tự/từ; kiểm tra char_to_word để một ký tự không ghép nhiều từ.", "Inspect each letter/word pair; check char_to_word so a letter cannot map to different words."),
      bi("Kiểm tra word_to_char để một từ không thuộc nhiều ký tự.", "Check word_to_char so a word cannot belong to different letters."),
      bi("Nếu không xung đột, lưu cả hai chiều. Trả True sau khi kiểm tra toàn bộ.", "If no conflict exists, store both directions. Return True only after all positions are checked."),
    ],
    complexity: { time: "O(n + m)", space: "O(n + m)", note: bi("n = len(pattern), m = len(s). Tách và lưu các từ, rồi duyệt pattern; tra dictionary trung bình O(1). Không tính các khung mô phỏng.", "n = len(pattern), m = len(s). Split and store the words, then scan the pattern; dictionary lookups are O(1) on average. Excludes visualization frames.") },
    code: SOURCE, builder: buildSteps,
    liveArgs: (input, params) => { const { pattern, s } = parseInput(input, params); return [pattern, s]; },
  },
};
