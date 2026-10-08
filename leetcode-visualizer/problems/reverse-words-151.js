"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def reverseWords(self, s: str) -> str:",
  "        words = s.split()",
  "        left, right = 0, len(words) - 1",
  "        while left < right:",
  "            words[left], words[right] = words[right], words[left]",
  "            left += 1",
  "            right -= 1",
  "        return \" \".join(words)",
];

function parseInput(input) {
  const printableAscii = typeof input === "string" && /^[\x20-\x7e]+$/.test(input);
  if (!printableAscii || input.length > 120 || !/[^ ]/.test(input)) {
    throw new Error("151: visualization accepts 1–120 printable ASCII characters with at least one word / mô phỏng nhận 1–120 ký tự ASCII in được, có ít nhất một từ.");
  }
  return input;
}

function buildSteps(input) {
  const s = parseInput(input);
  const segments = [...s.matchAll(/[^ ]+| +/g)].map((match) => ({
    text: match[0],
    start: match.index,
    end: match.index + match[0].length - 1,
    space: match[0][0] === " ",
  }));
  const words = s.split(/ +/).filter(Boolean);
  const originalWords = [...words];
  const origins = words.map((_, index) => index);
  const discardedSpaces = segments.filter((segment) => segment.space)
    .reduce((count, segment) => count + segment.text.length, 0);
  const steps = [];
  let left = null;
  let right = null;
  let swap = null;
  let swaps = 0;

  const emit = (line, phase, title, note, final = false) => {
    const output = words.join(" ");
    steps.push({
      arr: [],
      codeLines: [line],
      title,
      note,
      final,
      vars: [
        { name: "s", value: s },
        { name: "words", value: [...words] },
        { name: "left", value: left },
        { name: "right", value: right },
      ],
      reverseWords151View: {
        s,
        segments,
        originalWords,
        words: [...words],
        origins: [...origins],
        discardedSpaces,
        left,
        right,
        swap,
        swaps,
        output,
        phase,
      },
    });
  };

  emit(
    3,
    "split",
    bi("Tách các từ", "Split into words"),
    bi(
      `split() lấy ${words.length} từ và loại ${discardedSpaces} ký tự khoảng trắng; các khoảng cách sẽ được chuẩn hóa sau.`,
      `split() extracts ${words.length} words and removes ${discardedSpaces} space characters; spacing will be normalized later.`,
    ),
  );

  left = 0;
  right = words.length - 1;
  emit(
    4,
    "pointers",
    bi(`Đặt left = ${left}, right = ${right}`, `Set left = ${left}, right = ${right}`),
    bi("Hai con trỏ bắt đầu ở hai đầu mảng words.", "The two pointers start at opposite ends of the words array."),
  );

  while (true) {
    swap = null;
    const shouldSwap = left < right;
    emit(
      5,
      shouldSwap ? "check" : "check-done",
      bi(`left < right → ${shouldSwap ? "True" : "False"}`, `left < right → ${shouldSwap ? "True" : "False"}`),
      bi(
        shouldSwap ? "Còn một cặp đối xứng cần đổi chỗ." : "Hai con trỏ đã gặp nhau hoặc đi qua nhau; thứ tự từ đã đảo xong.",
        shouldSwap ? "A mirrored pair still needs to be swapped." : "The pointers have met or crossed; word order is fully reversed.",
      ),
    );
    if (!shouldSwap) break;

    swap = { left, right, before: [words[left], words[right]] };
    [words[left], words[right]] = [words[right], words[left]];
    [origins[left], origins[right]] = [origins[right], origins[left]];
    swaps += 1;
    emit(
      6,
      "swap",
      bi(`Đổi “${swap.before[0]}” ↔ “${swap.before[1]}”`, `Swap “${swap.before[0]}” ↔ “${swap.before[1]}”`),
      bi(`Vị trí ${left} và ${right} đã đổi chỗ.`, `Positions ${left} and ${right} have been exchanged.`),
    );

    swap = null;
    left += 1;
    emit(7, "move-left", bi(`left += 1 → ${left}`, `left += 1 → ${left}`), bi("Dịch con trỏ trái vào giữa.", "Move the left pointer inward."));
    right -= 1;
    emit(8, "move-right", bi(`right -= 1 → ${right}`, `right -= 1 → ${right}`), bi("Dịch con trỏ phải vào giữa rồi kiểm tra lại vòng lặp.", "Move the right pointer inward, then check the loop again."));
  }

  const answer = words.join(" ");
  emit(
    9,
    "done",
    bi(`Kết quả: ${answer}`, `Result: ${answer}`),
    bi("join bằng đúng một khoảng trắng, nên kết quả không có khoảng trắng thừa ở đầu, cuối hoặc giữa các từ.", "Joining with one space removes leading, trailing, and repeated spaces from the result."),
    true,
  );
  return { original: s, answer, steps };
}

module.exports = {
  151: {
    id: 151,
    slug: "reverse-words-in-a-string",
    difficulty: "medium",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" }],
    title: bi("Reverse Words in a String", "Reverse Words in a String"),
    titleVi: bi("Đảo thứ tự các từ trong chuỗi", "Reverse the order of words in a string"),
    statement: bi(
      "Cho chuỗi s. Trả về các từ theo thứ tự ngược lại, nối bằng đúng một khoảng trắng và bỏ khoảng trắng thừa.",
      "Given a string s, return its words in reverse order, joined by exactly one space with extra spaces removed.",
    ),
    inputKind: "string",
    preserveInputWhitespace: true,
    inputLabel: bi("s — câu ASCII, tối đa 120 ký tự để mô phỏng", "s — ASCII sentence, up to 120 characters for visualization"),
    defaultInput: "  the sky   is blue  ",
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      bi("s.split() lấy các từ và tự bỏ khoảng trắng thừa.", "s.split() extracts the words and discards extra whitespace."),
      bi("Dùng left và right đổi các cặp từ đối xứng từ ngoài vào trong.", "Use left and right to swap mirrored word pairs from the outside inward."),
      bi("Nối mảng đã đảo bằng một khoảng trắng để tạo kết quả chuẩn hóa.", "Join the reversed array with one space to produce the normalized result."),
      bi("Mô phỏng giới hạn 120 ký tự để trace dễ đọc; thuật toán vẫn xử lý đầu vào theo giới hạn gốc.", "The visualization is capped at 120 characters for a readable trace; the algorithm still supports the original input limit."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: bi("split và join duyệt toàn bộ chuỗi; mảng words dùng O(n) bộ nhớ phụ.", "split and join scan the full string; the words array uses O(n) auxiliary space."),
    },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: (input) => [parseInput(input)],
  },
};
