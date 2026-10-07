"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def reverseWords(self, s: str) -> str:",
  "        words = []",
  "        i = len(s) - 1",
  "        while i >= 0:",
  "            if s[i] == ' ':",
  "                i -= 1",
  "                continue",
  "            end = i",
  "            while i >= 0 and s[i] != ' ':",
  "                i -= 1",
  "            words.append(s[i + 1:end + 1])",
  "        return ' '.join(words)",
];

function parseInput(input) {
  if (typeof input !== "string" || !/^[A-Za-z0-9 ]{1,100}$/.test(input) || !/[A-Za-z0-9]/.test(input)) {
    throw new Error("151: s phải có 1–100 ký tự chữ tiếng Anh, số hoặc dấu cách và ít nhất một từ / s must contain 1–100 English letters, digits or spaces and at least one word.");
  }
  return input;
}

function buildSteps(input) {
  const s = parseInput(input);
  const steps = [];
  const words = [];
  let i = null;
  let end = null;
  let range = null;
  const emit = (line, phase, title, note, final = false) => {
    steps.push({
      arr: [], codeLines: [line], title, note, final,
      vars: [
        { name: "i", value: i },
        { name: "end", value: end },
        { name: "words", value: words.map(word => word.text) },
      ],
      reverseWords151View: {
        s, i, end, range: range && { ...range },
        words: words.map(word => ({ ...word })), phase,
      },
    });
  };
  emit(3, "init", bi("words = []", "words = []"), bi("Thu thập các từ từ phải sang trái.", "Collect words from right to left."));
  i = s.length - 1;
  emit(4, "start", bi(`i = ${i}`, `i = ${i}`), bi("Bắt đầu tại ký tự cuối, kể cả khi đó là dấu cách.", "Start at the final character, including a trailing space."));
  while (true) {
    range = null;
    emit(5, "outer-check", bi(`i >= 0 → ${i >= 0 ? "True" : "False"}`, `i >= 0 → ${i >= 0 ? "True" : "False"}`), bi(i >= 0 ? "Kiểm tra ký tự hiện tại." : "Đã duyệt hết chuỗi; nối các từ đã thu thập.", i >= 0 ? "Check the current character." : "The scan is complete; join the collected words."));
    if (i < 0) break;
    const space = s[i] === " ";
    emit(6, "space-check", bi(`s[${i}] == ' ' → ${space ? "True" : "False"}`, `s[${i}] == ' ' → ${space ? "True" : "False"}`), bi(space ? "Bỏ qua dấu cách này, không thêm vào words." : "Đã gặp cuối một từ.", space ? "Skip this space without adding it to words." : "Found the end of a word."));
    if (space) {
      const skipped = i;
      i--;
      emit(7, "skip-space", bi(`Bỏ dấu cách tại ${skipped}; i = ${i}`, `Skip space at ${skipped}; i = ${i}`), bi("Dấu cách đầu, cuối và dấu cách lặp đều được bỏ qua.", "Leading, trailing and repeated spaces are all skipped."));
      emit(8, "continue", bi("Tiếp tục vòng ngoài", "Continue the outer loop"), bi("Kiểm tra lại i >= 0 trước khi đọc ký tự tiếp theo.", "Recheck i >= 0 before reading the next character."));
      continue;
    }
    end = i;
    emit(9, "word-end", bi(`end = ${end}`, `end = ${end}`), bi("Giữ lại chỉ số cuối từ; i tìm đầu từ ở bên trái.", "Keep the word's end index while i finds its beginning to the left."));
    while (true) {
      const inside = i >= 0 && s[i] !== " ";
      emit(10, "word-check", bi(`i >= 0 and s[i] != ' ' → ${inside ? "True" : "False"}`, `i >= 0 and s[i] != ' ' → ${inside ? "True" : "False"}`), bi(inside ? "Vẫn trong từ: dịch i sang trái." : `Từ hoàn chỉnh là s[${i + 1}:${end + 1}].`, inside ? "Still inside the word: move i left." : `The complete word is s[${i + 1}:${end + 1}].`));
      if (!inside) break;
      i--;
      range = { start: i + 1, end };
      emit(11, "scan-word", bi(`i -= 1 → ${i}`, `i -= 1 → ${i}`), bi(`Đã quét đoạn [${i + 1}…${end}]. Thứ tự chữ trong từ được giữ nguyên.`, `Scanned [${i + 1}…${end}]. Character order within the word is preserved.`));
    }
    const word = { text: s.slice(i + 1, end + 1), start: i + 1, end };
    words.push(word);
    emit(12, "append", bi(`Thêm ${JSON.stringify(word.text)} vào words`, `Append ${JSON.stringify(word.text)} to words`), bi("Từ ngoài cùng bên phải được thêm trước, nên words có thứ tự đảo ngược.", "The rightmost word is appended first, so words are in reverse order."));
  }
  end = null;
  const answer = words.map(word => word.text).join(" ");
  emit(13, "done", bi(`Kết quả: ${answer}`, `Result: ${answer}`), bi("Nối bằng đúng một dấu cách giữa hai từ; không có dấu cách ở đầu hoặc cuối.", "Join with exactly one space between words and no leading or trailing spaces."), true);
  return { original: s, answer, steps };
}

module.exports = {
  151: {
    id: 151, slug: "reverse-words-in-a-string", difficulty: "medium",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" }],
    title: bi("Reverse Words in a String", "Reverse Words in a String"),
    titleVi: bi("Đảo thứ tự các từ trong chuỗi", "Reverse the order of words in a string"),
    statement: bi("Đảo thứ tự các từ trong s, giữ nguyên chữ trong từng từ. Bỏ dấu cách đầu/cuối và chỉ giữ một dấu cách giữa các từ. Ví dụ: '  hello world  ' → 'world hello'; 'a good   example' → 'example good a'. s gồm chữ tiếng Anh, số và dấu cách, có ít nhất một từ; giới hạn bài gốc là 10⁴ ký tự.", "Reverse the order of words in s, preserving characters within each word. Remove leading/trailing spaces and keep one space between words. Examples: '  hello world  ' → 'world hello'; 'a good   example' → 'example good a'. s contains English letters, digits and spaces, with at least one word; the original limit is 10⁴ characters."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("s — chữ, số, dấu cách; tối đa 100 ký tự để mô phỏng", "s — letters, digits, spaces; up to 100 characters for visualization"),
    defaultInput: "  the sky   is blue  ",
    approach: [
      bi("Duyệt i từ cuối chuỗi, bỏ qua từng dấu cách.", "Scan i from the end, skipping spaces."),
      bi("Đặt end ở cuối từ, dịch i tới dấu cách hoặc -1; thêm s[i+1:end+1] vào words.", "Set end at the word's last character, move i to a space or -1, then append s[i+1:end+1] to words."),
      bi("Nối words bằng một dấu cách. Các từ đã được thu thập theo thứ tự đảo.", "Join words with one space. The words were collected in reverse order."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: bi("Mỗi ký tự được duyệt một lần; words và kết quả cần O(n) bộ nhớ.", "Each character is scanned once; words and the result use O(n) memory.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
