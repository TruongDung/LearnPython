const MOD = 1_000_000_007;
const both = (vi, en) => ({ vi, en });

function validate(binary) {
  if (typeof binary !== "string" || !/^[01]+$/.test(binary)) {
    throw new Error("Nhập chuỗi chỉ gồm 0 và 1 / Enter a non-empty binary string.");
  }
  if (binary.length > 100000) throw new Error("Maximum length: 100000.");
  return binary;
}

function buildSteps1987(input) {
  const binary = validate(input);
  // Exact sets are teaching aids only. The solution itself uses three scalars.
  const showSets = binary.length <= 10;
  let buckets = [[], []];
  let end0 = 0, end1 = 0, hasZero = 0;
  const steps = [];
  const snap = (index, phase, codeLines, note, transition = null) => {
    const start = Math.max(0, index - 12);
    steps.push({
      title: both(phase === "done" ? "Kết quả" : index < 0 ? "Khởi tạo" : `Đọc binary[${index}] = ${binary[index]}`,
        phase === "done" ? "Final answer" : index < 0 ? "Initialize" : `Read binary[${index}] = ${binary[index]}`),
      codeLines, note,
      vars: [{ name: "end0", value: end0 }, { name: "end1", value: end1 }, { name: "hasZero", value: hasZero }],
      goodSubseqView: {
        phase, index, length: binary.length, start, chars: binary.slice(start, start + 25),
        end0, end1, hasZero, total: (end0 + end1 + hasZero) % MOD,
        buckets: showSets ? buckets.map(values => [...values]) : null,
        transition,
      },
    });
  };
  snap(-1, "init", [3, 4], both("end0/end1 chỉ đếm chuỗi bắt đầu bằng 1. Chuỗi đơn 0 được đếm riêng.",
    "end0/end1 count strings starting with 1. The singleton 0 is counted separately."));
  for (let i = 0; i < binary.length; i++) {
    const bit = Number(binary[i]);
    const old = [end0, end1];
    const previous = buckets[bit];
    let generated = [];
    if (showSets) {
      generated = buckets.flat().map(value => value + bit);
      if (bit === 1) generated.push("1");
      buckets[bit] = generated.sort((a, b) => a.length - b.length || a.localeCompare(b));
    }
    if (bit === 0) { end0 = (end0 + end1) % MOD; hasZero = 1; }
    else end1 = (end0 + end1 + 1) % MOD;
    // Keep long-input traces bounded, while still computing every character.
    if (i < 80 || i === binary.length - 1) {
      snap(i, "update", bit === 0 ? [5, 6, 7, 8] : [5, 6, 9, 10],
        both("Thay thế nhóm có đuôi hiện tại; giữ nguyên nhóm còn lại. Mọi chuỗi cũ trong nhóm đã xuất hiện trong các chuỗi vừa tạo, nên không cộng thêm nhóm cũ.",
          "Replace the current ending bucket; keep the other bucket. Every old string in this bucket is already among the generated strings, so do not add the old bucket again."),
        { bit, old, previous: showSets ? [...previous] : null, repeated: showSets ? generated.filter(value => previous.includes(value)) : null,
          skipped: i >= 80 ? i - 80 : 0 });
    }
  }
  snap(binary.length - 1, "done", [11], both("Cộng hai nhóm rời nhau và thêm 0 đúng một lần nếu có. Mọi số đếm lấy modulo 10^9 + 7.",
    "Add the two disjoint buckets and include 0 once if present. All counts are modulo 10^9 + 7."));
  return { original: binary, answer: (end0 + end1 + hasZero) % MOD, steps };
}

module.exports = {
  1987: {
    id: 1987, difficulty: "hard", slug: "number-of-unique-good-subsequences",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: both("Number of Unique Good Subsequences", "Number of Unique Good Subsequences"),
    titleVi: both("Đếm dãy con tốt phân biệt", "Count distinct good subsequences"),
    statement: both("Đếm các dãy con nhị phân khác nhau, không rỗng và không bắt đầu bằng 0, ngoại trừ chuỗi đơn 0. Trả về kết quả modulo 10^9 + 7.",
      "Count distinct, non-empty binary subsequences without a leading zero, except the singleton 0. Return the count modulo 10^9 + 7."),
    defaultInput: "101", inputKind: "string", extraParams: [],
    inputLabel: both("binary (ví dụ: 101, 001, 11)", "binary (examples: 101, 001, 11)"),
    approach: [
      both("Invariant: end0/end1 là số chuỗi phân biệt bắt đầu bằng 1, kết thúc bằng 0/1 trong prefix đã đọc.", "Invariant: end0/end1 count distinct strings starting with 1 and ending in 0/1 in the processed prefix."),
      both("Đọc 0: end0 = end0 + end1; hasZero = 1. Đọc 1: end1 = end0 + end1 + 1 (chuỗi đơn 1).", "Read 0: end0 = end0 + end1; hasZero = 1. Read 1: end1 = end0 + end1 + 1 (the singleton 1)."),
      both("Gắn cùng một bit vào các chuỗi khác nhau vẫn tạo chuỗi khác nhau. Nhóm mới chứa toàn bộ nhóm cũ, nên thay thế thay vì cộng dồn.", "Appending the same bit to different strings produces different strings. The new bucket includes the old bucket, so replace rather than accumulate."),
    ],
    complexity: { time: "O(n)", space: "O(1)", note: both("Thuật toán dùng 3 biến. Minh họa liệt kê chuỗi khi n ≤ 10; input dài hiển thị 80 bước đầu và bước cuối, vẫn tính toàn bộ input.",
      "The algorithm uses three scalars. The visualization lists strings for n ≤ 10; long inputs show the first 80 updates and the last, while computing the full input.") },
    code: ["class Solution:", "    def numberOfUniqueGoodSubsequences(self, binary: str) -> int:", "        MOD = 10**9 + 7", "        end0 = end1 = hasZero = 0", "        for bit in binary:", "            if bit == '0':", "                end0 = (end0 + end1) % MOD", "                hasZero = 1", "            else:", "                end1 = (end0 + end1 + 1) % MOD", "        return (end0 + end1 + hasZero) % MOD"],
    liveArgs: input => [validate(input)], builder: buildSteps1987,
  },
};
