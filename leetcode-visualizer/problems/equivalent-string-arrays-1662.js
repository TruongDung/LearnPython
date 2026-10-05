"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def arrayStringsAreEqual(self, word1: list[str], word2: list[str]) -> bool:",
  "        s1 = ''.join(word1)",
  "        s2 = ''.join(word2)",
  "        if len(s1) != len(s2):",
  "            return False",
  "        for i, ch in enumerate(s1):",
  "            if ch != s2[i]:",
  "                return False",
  "        return True",
];

function parseWords(value, name) {
  let words = value;
  if (typeof value === "string") {
    try { words = value.trim().startsWith('[') ? JSON.parse(value) : value.split(',').map(part => part.trim()); }
    catch (_) { throw new Error(`1662: ${name} must be a JSON string array / phải là mảng chuỗi JSON, ví dụ ["ab","c"].`); }
  }
  if (!Array.isArray(words) || words.length < 1 || words.length > 1000 || words.some(word => typeof word !== "string" || !/^[a-z]+$/.test(word)) || words.reduce((n, word) => n + word.length, 0) > 1000) {
    throw new Error(`1662: ${name} must contain nonempty lowercase strings, totaling 1–1000 characters / mảng phải gồm chuỗi chữ thường không rỗng, tổng 1–1000 ký tự.`);
  }
  return [...words];
}

function parseInput(input, params = {}) {
  return { word1: parseWords(input, "word1"), word2: parseWords(params.word2, "word2") };
}

function buildSteps(input, params) {
  const { word1, word2 } = parseInput(input, params);
  const steps = [];
  let s1 = null;
  let s2 = null;
  let index = null;
  let same = null;
  let matched = 0;
  let answer = null;
  const emit = (line, phase, title, note, final = false) => {
    steps.push({
      arr: [], codeLines: [line], title, note, final,
      vars: [{ name: "word1", value: word1 }, { name: "word2", value: word2 },
        ...(s1 === null ? [] : [{ name: "s1", value: s1 }]),
        ...(s2 === null ? [] : [{ name: "s2", value: s2 }]),
        ...(index === null ? [] : [{ name: "i", value: index }, { name: "ch", value: s1[index] }])],
      equivalent1662View: { word1, word2, s1, s2, index, same, matched, answer, phase },
    });
  };
  emit(2, "init", bi("So sánh chuỗi mà hai mảng tạo ra", "Compare the strings represented by both arrays"), bi("Ranh giới giữa các phần tử có thể khác nhau. Không so sánh trực tiếp hai mảng.", "The chunk boundaries may differ. Do not compare the arrays directly."));
  s1 = word1.join("");
  emit(3, "join-first", bi(`Nối word1 → ${s1}`, `Join word1 → ${s1}`), bi("Giữ đúng thứ tự phần tử, không thêm dấu cách hay dấu phẩy.", "Preserve the element order; do not insert spaces or commas."));
  s2 = word2.join("");
  emit(4, "join-second", bi(`Nối word2 → ${s2}`, `Join word2 → ${s2}`), bi("Hai hàng ký tự đã được nối; bây giờ mới kiểm tra chúng.", "Both character rows are assembled; now check them."));
  const differentLength = s1.length !== s2.length;
  emit(5, "length", bi(`len(s1) != len(s2) → ${differentLength ? "True" : "False"}`, `len(s1) != len(s2) → ${differentLength ? "True" : "False"}`), bi(differentLength ? `Độ dài ${s1.length} và ${s2.length} khác nhau → không thể là cùng một chuỗi.` : `Cùng độ dài ${s1.length}. Cần kiểm tra từng ký tự; chưa thể kết luận True.`, differentLength ? `Lengths ${s1.length} and ${s2.length} differ, so the strings cannot be equal.` : `Both lengths are ${s1.length}. Check every character before returning True.`));
  if (differentLength) {
    answer = false;
    emit(6, "done", bi("False: khác độ dài", "False: different lengths"), bi("Dừng ngay. Không cần so sánh các ký tự.", "Stop immediately. No character comparison is needed."), true);
  } else {
    for (index = 0; index < s1.length; index++) {
      same = null;
      emit(7, "read", bi(`Xét vị trí i = ${index}`, `Inspect position i = ${index}`), bi(`Đọc s1[${index}] = '${s1[index]}' và s2[${index}] = '${s2[index]}'.`, `Read s1[${index}] = '${s1[index]}' and s2[${index}] = '${s2[index]}'.`));
      same = s1[index] === s2[index];
      if (same) matched++;
      emit(8, "compare", bi(`'${s1[index]}' ${same ? "=" : "≠"} '${s2[index]}'`, `'${s1[index]}' ${same ? "=" : "≠"} '${s2[index]}'`), bi(same ? `Ký tự trùng nhau. Đã kiểm tra đúng ${matched}/${s1.length} vị trí.` : "Ký tự khác nhau: sẽ trả False ở dòng tiếp theo.", same ? `Characters match. Verified ${matched}/${s1.length} positions.` : "Characters differ: return False on the next line."));
      if (!same) {
        answer = false;
        emit(9, "done", bi(`False: khác ký tự tại vị trí ${index}`, `False: mismatch at position ${index}`), bi("Một vị trí khác nhau là đủ để kết luận; không cần xét phần còn lại.", "One mismatch is enough; the remaining characters do not need to be checked."), true);
        break;
      }
    }
    if (answer === null) {
      index = s1.length - 1;
      answer = true;
      emit(10, "done", bi("True: cùng chuỗi", "True: the strings are equal"), bi("Cùng độ dài và mọi vị trí đều trùng nhau, dù cách chia phần tử có thể khác.", "The lengths and every character match, even if the chunk boundaries differ."), true);
    }
  }
  return { word1, word2, answer, steps };
}

module.exports = {
  1662: {
    id:1662, slug:"check-if-two-string-arrays-are-equivalent", difficulty:"easy",
    category:{ key:"string", vi:"Chuỗi", en:"String" },
    tags:[{ key:"array", vi:"Mảng", en:"Array" }],
    title:bi("Check If Two String Arrays are Equivalent", "Check If Two String Arrays are Equivalent"),
    titleVi:bi("Hai mảng có tạo cùng một chuỗi không?", "Do the arrays represent the same string?"),
    statement:bi("Cho word1 và word2 là hai mảng chuỗi chữ thường không rỗng. Nối các phần tử theo đúng thứ tự; trả True nếu tạo cùng một chuỗi, ngược lại trả False. Ví dụ: [\"ab\",\"c\"] và [\"a\",\"bc\"] đều tạo \"abc\".", "Given two arrays of nonempty lowercase strings, concatenate their elements in order. Return True if they represent the same string, otherwise False. Example: [\"ab\",\"c\"] and [\"a\",\"bc\"] both represent \"abc\"."),
    inputKind:"stringArray", inputLabel:bi("word1 — mảng JSON, ví dụ [\"ab\",\"c\"]", "word1 — JSON array, e.g. [\"ab\",\"c\"]"),
    defaultInput:["ab","c"], extraParams:[{ key:"word2", type:"string", label:bi("word2 — mảng JSON, ví dụ [\"a\",\"bc\"]", "word2 — JSON array, e.g. [\"a\",\"bc\"]"), default:'["a","bc"]' }],
    debugMode:"line-by-line",
    approach:[
      bi("Nối word1 thành s1 và word2 thành s2. Không thêm ký tự phân cách.", "Join word1 into s1 and word2 into s2, without adding separators."),
      bi("Khác độ dài → False. Cùng độ dài → so sánh từng vị trí, dừng ở ký tự khác đầu tiên.", "Different lengths → False. Equal lengths → compare positions and stop at the first mismatch."),
      bi("Trả True chỉ khi mọi ký tự đều trùng. Ranh giới phần tử không quyết định kết quả.", "Return True only after all characters match. Chunk boundaries do not determine equality."),
      bi("Python có thể viết ngắn gọn: ''.join(word1) == ''.join(word2). Mã bên dưới tách bước so sánh để dễ quan sát.", "Python can also use ''.join(word1) == ''.join(word2). The code below expands the comparison into visible steps."),
    ],
    complexity:{ time:"O(n + m)", space:"O(n + m)", note:bi("n và m là tổng số ký tự của hai mảng. Lưu hai chuỗi đã nối; không tính các khung mô phỏng.", "n and m are the total character counts of the two arrays. Stores the joined strings; excludes visualization frames.") },
    code:SOURCE, builder:buildSteps, liveArgs:(input,params) => { const parsed = parseInput(input,params); return [parsed.word1,parsed.word2]; },
  },
};
