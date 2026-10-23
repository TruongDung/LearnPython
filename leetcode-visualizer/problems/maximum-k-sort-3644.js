"use strict";

const { trace, bi } = require("./picture-trace");

const category = { key: "bitmask", vi: "Bitmask", en: "Bitmask" };
const bitmaskTag = { key: "bitmask", vi: "Bitmask", en: "Bitmask" };
const code = [
  "class Solution:",
  "    def sortPermutation(self, nums):",
  "        common = -1",
  "        for i, value in enumerate(nums):",
  "            if i != value:",
  "                common &= value",
  "        return max(common, 0)",
];

function parse(input) {
  const nums = Array.isArray(input) ? [...input] : typeof input === "string" && input.trim()
    ? input.split(",").map((part) => part.trim() === "" ? NaN : Number(part)) : [];
  if (nums.length < 1 || nums.length > 100000
    || !nums.every((value) => Number.isInteger(value) && value >= 0 && value < nums.length)
    || new Set(nums).size !== nums.length) {
    throw new Error("nums: cần hoán vị 1–100000 số từ 0 đến n−1. / Use a permutation of 1–100000 values in [0, n−1].");
  }
  return nums;
}

function builder(input) {
  const nums = parse(input);
  const detailed = nums.length <= 30;
  const previewIndices = detailed
    ? nums.map((_, index) => index)
    : [...new Set([
      ...Array.from({ length: Math.min(8, nums.length) }, (_, index) => index),
      ...Array.from({ length: Math.min(8, nums.length) }, (_, index) => nums.length - Math.min(8, nums.length) + index),
    ])];
  const width = Math.max(1, (nums.length - 1).toString(2).length);
  const allBits = (1 << width) - 1;
  const bits = (value) => (value < 0 ? allBits : value).toString(2).padStart(width, "0");
  const run = trace(3644, code, detailed);
  const locals = { self: {}, nums };
  const misplaced = detailed ? [] : null;
  let misplacedCount = 0;
  let current = null;
  let comparison = null;
  let maskUpdate = null;
  let answer = null;
  let loopFinished = false;

  const picture = () => ({
    nums: previewIndices.map((index) => ({ index, value: nums[index], misplaced: nums[index] !== index })),
    total: nums.length,
    preview: !detailed,
    i: locals.i ?? null,
    value: locals.value ?? null,
    common: locals.common ?? null,
    commonBits: locals.common == null ? null : bits(locals.common),
    valueBits: current ? bits(current.value) : null,
    beforeBits: maskUpdate ? bits(maskUpdate.before) : (locals.common == null ? null : bits(locals.common)),
    afterBits: maskUpdate ? bits(maskUpdate.after) : (locals.common == null ? null : bits(locals.common)),
    current,
    comparison,
    maskUpdate,
    misplaced: detailed ? [...misplaced] : misplacedCount,
    misplacedCount,
    answer,
    loopFinished,
    width,
  });
  const emit = (line, event) => run.emit(line, event, locals, picture);

  locals.common = -1;
  emit(3, "common = all 1-bits");
  for (let i = 0; i < nums.length; i++) {
    locals.i = i;
    locals.value = nums[i];
    loopFinished = false;
    current = { index: i, value: nums[i], home: nums[i], misplaced: nums[i] !== i };
    comparison = null;
    maskUpdate = null;
    emit(4, "next index");

    const misplacedHere = i !== nums[i];
    comparison = { index: i, value: nums[i], misplaced: misplacedHere };
    emit(5, misplacedHere ? "wrong place" : "already home");
    if (misplacedHere) {
      const before = locals.common;
      locals.common &= nums[i];
      misplacedCount++;
      if (detailed) misplaced.push({ index: i, value: nums[i] });
      maskUpdate = { before, value: nums[i], after: locals.common };
      emit(6, "AND into common bits");
    }
  }

  loopFinished = true;
  current = null;
  comparison = null;
  maskUpdate = null;
  emit(4, "loop finished");
  answer = Math.max(locals.common, 0);
  emit(7, "return largest valid k");

  const result = run.finish(answer, picture, nums);
  for (const step of result.steps) {
    step.k3644View = step.pictureView;
    delete step.pictureView;
  }
  return result;
}

module.exports = {
  3644: {
    id: 3644,
    difficulty: "medium",
    slug: "maximum-k-to-sort-a-permutation",
    category,
    tags: [bitmaskTag, { key: "array", vi: "Mảng", en: "Array" }],
    title: { vi: "Maximum K to Sort a Permutation", en: "Maximum K to Sort a Permutation" },
    titleVi: { vi: "K lớn nhất để sắp xếp hoán vị", en: "Maximum K to Sort a Permutation" },
    statement: bi(
      "Chỉ đổi chỗ hai số nếu AND của chúng bằng k. Tìm k lớn nhất để sắp xếp được hoán vị.",
      "You may swap two values only when their bitwise AND equals k. Find the largest k that can sort the permutation.",
    ),
    defaultInput: [0, 3, 2, 1],
    inputKind: "array",
    inputLabel: bi("nums · hoán vị 0…n−1", "nums · permutation of 0…n−1"),
    extraParams: [],
    approach: [bi(
      "Số đúng chỗ không cần đổi. Mỗi số sai chỗ phải có mọi bit của k.",
      "Values already home need no swap. Every misplaced value must contain every bit of k.",
    ), bi(
      "AND tất cả số sai chỗ để giữ lại mask chung lớn nhất. Nếu không có số sai chỗ, trả 0.",
      "AND all misplaced values to keep their largest shared mask. If none are misplaced, return 0.",
    )],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: bi(
        "Quét tuyến tính; debug từng dòng với tối đa 30 số. Input lớn vẫn được tính đủ, hình xem 8 số đầu và cuối.",
        "One linear scan; line debug supports up to 30 values. Larger inputs are fully computed, with the first and last 8 values shown.",
      ),
    },
    codeLabel: bi("Vị trí sai → AND mask chung", "Misplaced values → common AND mask"),
    code,
    builder,
    liveArgs: (input) => [parse(input)],
    debugMode: "line-by-line",
  },
};
