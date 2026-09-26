// LeetCode 3550: scan left to right and stop at the first digit-sum match.

const label = (vi, en) => ({ vi, en });
const MAX_TRACE_STEPS = 700;

function buildSteps3550(input) {
  const nums = Array.isArray(input) ? [...input] : [];
  if (nums.length < 1 || nums.length > 100
    || nums.some((value) => !Number.isInteger(value) || value < 0 || value > 1000)) {
    throw new Error("nums must contain 1..100 integers in [0, 1000]");
  }

  const steps = [];
  let i = null;
  let value = null;
  let remaining = null;
  let total = null;
  let digit = null;
  let processed = 0;
  let answer = null;
  let omitted = false;

  function record(phase, title, line, note, options = {}) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const indices = new Set(Array.from({ length: Math.min(nums.length, 24) }, (_, index) => index));
    if (i !== null) indices.add(i);
    const vars = [{ name: "n", value: nums.length }];
    if (i !== null) vars.push({ name: "i", value: i }, { name: "value", value },
      { name: "remaining", value: remaining }, { name: "digit sum", value: total });
    if (digit !== null) vars.push({ name: "digit", value: digit });
    if (options.final) vars.push({ name: "answer", value: answer });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note,
      final: Boolean(options.final),
      digitSum3550View: {
        phase, n: nums.length, i, value, remaining, total, digit, processed,
        digits: value === null ? [] : String(value).split("").map(Number),
        cells: [...indices].sort((a, b) => a - b).map((index) => ({
          index, value: nums[index], scanned: phase === "not-found" || i !== null && index < i,
          current: index === i, matched: answer !== null && answer >= 0 && index === answer,
        })),
        answer, omitted,
      },
    });
  }

  for (let index = 0; index < nums.length; index++) {
    i = index;
    value = nums[i];
    remaining = null;
    total = null;
    digit = null;
    processed = 0;
    record("visit", label(`Xét i = ${i}, nums[i] = ${value}`, `Inspect i = ${i}, nums[i] = ${value}`), 3,
      label("Duyệt tăng dần để lần khớp đầu tiên có chỉ số nhỏ nhất.",
        "Scanning in order guarantees the first match has the smallest index."));
    remaining = value;
    record("copy", label(`remaining = ${remaining}`, `remaining = ${remaining}`), 4,
      label("Dùng bản sao để lấy từng chữ số, không đổi nums[i].",
        "Use a copy to extract digits without changing nums[i]."));
    total = 0;
    record("sum-init", label("digit sum = 0", "digit sum = 0"), 5,
      label("Với số 0, vòng lặp không chạy và tổng chữ số vẫn đúng bằng 0.",
        "For zero, the loop does not run and its digit sum is correctly zero."));
    while (true) {
      const hasDigit = remaining > 0;
      record("digit-check", label(`remaining > 0? ${hasDigit}`, `remaining > 0? ${hasDigit}`), 6,
        hasDigit
          ? label("Chữ số hàng đơn vị sẽ được cộng tiếp.", "Add the current ones digit next.")
          : label("Đã cộng hết các chữ số; so tổng với i.", "All digits have been added; compare the sum with i."));
      if (!hasDigit) break;
      digit = remaining % 10;
      total += digit;
      processed++;
      record("add-digit", label(`Cộng ${digit} → tổng ${total}`, `Add ${digit} → sum ${total}`), 7,
        label("remaining % 10 lấy chữ số cuối cùng.", "remaining % 10 extracts the last digit."));
      remaining = Math.floor(remaining / 10);
      record("remove-digit", label(`remaining = ${remaining}`, `remaining = ${remaining}`), 8,
        label("Chia nguyên cho 10 để bỏ chữ số vừa xử lý.",
          "Integer-divide by 10 to discard the processed digit."));
    }
    const matches = total === i;
    record("compare", label(`${total} == ${i}? ${matches}`, `${total} == ${i}? ${matches}`), 9,
      matches
        ? label("Đã khớp; vì quét trái sang phải nên đây là chỉ số nhỏ nhất.",
          "Match found; left-to-right scanning makes this the smallest valid index.")
        : label("Chưa khớp, tiếp tục sang phần tử bên phải.", "No match; continue with the next element."));
    if (matches) {
      answer = i;
      record("found", label(`Trả về ${answer}`, `Return ${answer}`), 10,
        omitted
          ? label("Trace dài đã rút gọn nhưng vẫn tính đúng đáp án.",
            "The long trace was shortened, but the answer is complete.")
          : label("Không cần xem các chỉ số lớn hơn sau khi đã tìm được đáp án.",
            "No larger index needs checking after the first match."), { final: true });
      return { original: nums, answer, steps };
    }
  }

  i = null;
  value = null;
  remaining = null;
  total = null;
  digit = null;
  processed = 0;
  answer = -1;
  record("not-found", label("Không có chỉ số hợp lệ: -1", "No matching index: -1"), 11,
    omitted
      ? label("Trace dài đã rút gọn; toàn bộ mảng vẫn được kiểm tra.",
        "The long trace was shortened; the full array was still checked.")
      : label("Không phần tử nào có tổng chữ số bằng chỉ số của nó.",
        "No value has a digit sum equal to its index."), { final: true });
  return { original: nums, answer, steps };
}

module.exports = {
  3550: {
    id: 3550,
    difficulty: "easy",
    slug: "smallest-index-with-digit-sum-equal-to-index",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "math", vi: "Toán", en: "Math" },
    ],
    title: label("Smallest Index With Digit Sum Equal to Index", "Smallest Index With Digit Sum Equal to Index"),
    titleVi: label("Chỉ số nhỏ nhất bằng tổng chữ số", "First index equal to digit sum"),
    statement: label(
      "Trả chỉ số i nhỏ nhất sao cho tổng các chữ số của nums[i] bằng i; nếu không có, trả -1.",
      "Return the smallest index i whose value nums[i] has a digit sum equal to i; return -1 if none exists."
    ),
    defaultInput: [1, 10, 11],
    inputKind: "integer",
    inputLabel: label("nums (0..1000)", "nums (0..1000)"),
    approach: [
      label("Quét i từ trái sang phải nên lần khớp đầu tiên tự động là chỉ số nhỏ nhất.",
        "Scan indices from left to right so the first match is automatically the smallest."),
      label("Lấy chữ số cuối bằng % 10, cộng dồn, rồi chia nguyên cho 10 để chuyển sang chữ số tiếp theo.",
        "Extract the last digit with % 10, add it, then integer-divide by 10 to move to the next digit."),
      label("So sánh tổng với i; trả ngay nếu bằng, hoặc -1 sau khi duyệt hết.",
        "Compare the digit sum with i; return immediately on equality, or -1 after the scan."),
    ],
    complexity: {
      time: "O(n · d)", space: "O(1)",
      note: label("d là số chữ số tối đa (ở đây nhiều nhất 4); ngoài trace học tập chỉ dùng vài biến.",
        "d is the maximum number of digits (at most 4 here); the algorithm uses only a few variables outside the teaching trace."),
    },
    code: [
      "class Solution:",
      "    def smallestIndex(self, nums):",
      "        for i, value in enumerate(nums):",
      "            remaining = value",
      "            total = 0",
      "            while remaining > 0:",
      "                total += remaining % 10",
      "                remaining //= 10",
      "            if total == i:",
      "                return i",
      "        return -1",
    ],
    builder: buildSteps3550,
  },
};
