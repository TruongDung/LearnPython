"use strict";

const { bi, parseIntegerArray } = require("./hard-viz-shared");
const MAX_VISUAL_LENGTH = 80;
const SOURCE = Object.freeze([
  "class Solution:",
  "    def findDisappearedNumbers(self, nums: list[int]) -> list[int]:",
  "        for i in range(len(nums)):",
  "            value = abs(nums[i])",
  "            index = value - 1",
  "            if nums[index] > 0:",
  "                nums[index] = -nums[index]",
  "",
  "        missing = []",
  "        for i in range(len(nums)):",
  "            if nums[i] > 0:",
  "                missing.append(i + 1)",
  "",
  "        return missing",
]);

function parseNums(input) {
  const nums = parseIntegerArray(input, { problemId: 448, name: "nums", minLength: 1, maxLength: MAX_VISUAL_LENGTH, minValue: 1 });
  if (nums.some(value => value > nums.length)) throw new RangeError("#448: every value must be in 1..n / mỗi giá trị phải thuộc 1..n.");
  return nums;
}

function buildSteps(input) {
  const original = parseNums(input);
  const nums = [...original];
  const steps = [];
  const locals = { nums };
  let phase = "initialize";
  let current = null;
  let currentValue = null;
  let target = null;
  let targetBefore = null;
  let accepted = null;
  let missing = null;
  function emit(line, event, title, note, final = false) {
    steps.push({
      arr: [], codeLines: [line], final,
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      disappearedNumbers448View: {
        line, source: SOURCE[line - 1], event, phase, original: [...original], nums: [...nums],
        current, value: currentValue, target, targetBefore, accepted, missing: missing ? [...missing] : null,
      },
    });
  }
  emit(2, "call", bi("Tìm các số bị thiếu trong 1..n", "Find missing numbers in 1..n"), bi("Dùng dấu của nums làm bộ nhớ đánh dấu. Giá trị ban đầu đều nằm trong 1..n.", "Use the signs of nums as markers. Every original value lies in 1..n."));
  phase = "mark";
  for (let i = 0; i < nums.length; i++) {
    current = i;
    currentValue = null;
    target = null;
    targetBefore = null;
    accepted = null;
    locals.i = i;
    emit(3, "read", bi(`Đọc nums[${i}] = ${nums[i]}`, `Read nums[${i}] = ${nums[i]}`), bi("Dấu âm có thể do một bước trước đánh dấu; độ lớn vẫn là giá trị gốc.", "A negative sign may have been set earlier; the magnitude still holds the original value."));
    currentValue = Math.abs(nums[i]);
    locals.value = currentValue;
    emit(4, "absolute", bi(`value = abs(${nums[i]}) = ${currentValue}`, `value = abs(${nums[i]}) = ${currentValue}`), bi("Lấy abs để đọc đúng giá trị, kể cả ô đã bị đổi dấu.", "Take abs to recover the value even when this slot has been marked negative."));
    target = currentValue - 1;
    targetBefore = nums[target];
    locals.index = target;
    emit(5, "map-index", bi(`Số ${currentValue} → chỉ số ${target}`, `Number ${currentValue} → index ${target}`), bi("Số k dùng ô k−1 để ghi nhận đã xuất hiện.", "Number k uses slot k−1 to record its presence."));
    accepted = nums[target] > 0;
    emit(6, "mark-check", bi(`nums[${target}] > 0 → ${accepted ? "True" : "False"}`, `nums[${target}] > 0 → ${accepted ? "True" : "False"}`), bi(accepted ? "Ô đích còn dương: cần đổi thành âm." : "Ô đích đã âm: số này đã được đánh dấu, giữ nguyên.", accepted ? "Target is positive: change it to negative." : "Target is already negative: this number was marked, so leave it unchanged."));
    if (accepted) {
      nums[target] = -nums[target];
      emit(7, "mark-negative", bi(`nums[${target}] = ${nums[target]}`, `nums[${target}] = ${nums[target]}`), bi(`Ô ${target} âm chứng minh số ${currentValue} có trong mảng; không thay đổi độ lớn của ô.`, `A negative slot ${target} records that number ${currentValue} occurs; the slot's magnitude is preserved.`));
    }
  }
  phase = "collect";
  current = null;
  currentValue = null;
  target = null;
  targetBefore = null;
  accepted = null;
  missing = [];
  locals.missing = missing;
  emit(9, "init-missing", bi("missing = []", "missing = []"), bi("Quét xong: ô âm = số đã có; ô dương = số thiếu. Chuẩn bị thu kết quả.", "Marking complete: negative slots mean present numbers; positive slots mean missing numbers. Prepare the output."));
  for (let i = 0; i < nums.length; i++) {
    current = i;
    accepted = null;
    locals.i = i;
    emit(10, "collect-read", bi(`Kiểm tra ô ${i}, đại diện số ${i + 1}`, `Inspect slot ${i}, representing number ${i + 1}`), bi("Đọc dấu của ô, không dùng độ lớn để chọn số kết quả.", "Read the slot's sign; its magnitude does not determine the output number."));
    accepted = nums[i] > 0;
    emit(11, "missing-check", bi(`nums[${i}] = ${nums[i]} > 0 → ${accepted ? "True" : "False"}`, `nums[${i}] = ${nums[i]} > 0 → ${accepted ? "True" : "False"}`), bi(accepted ? `Ô này chưa được đánh dấu: số ${i + 1} bị thiếu.` : `Ô này âm: số ${i + 1} có trong mảng, bỏ qua.`, accepted ? `This slot was never marked: number ${i + 1} is missing.` : `This slot is negative: number ${i + 1} is present, so skip it.`));
    if (accepted) {
      missing.push(i + 1);
      emit(12, "append-missing", bi(`Thêm ${i + 1} vào missing`, `Append ${i + 1} to missing`), bi(`Kết quả hiện tại: [${missing.join(", ")}].`, `Output so far: [${missing.join(", ")}].`));
    }
  }
  phase = "done";
  current = null;
  accepted = null;
  emit(14, "return", bi(`return [${missing.join(", ")}]`, `return [${missing.join(", ")}]`), bi("Mỗi ô còn dương đóng góp số index + 1. Mảng nums đã được đổi dấu tại chỗ.", "Each remaining positive slot contributes index + 1. nums has been marked in place."), true);
  return { original: [...original], answer: [...missing], steps };
}

module.exports = {
  448: {
    id: 448, difficulty: "easy", slug: "find-all-numbers-disappeared-in-an-array",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }],
    title: bi("Tìm tất cả số bị thiếu trong mảng", "Find All Numbers Disappeared in an Array"),
    titleVi: bi("Đánh dấu bằng dấu âm, rồi tìm ô còn dương", "Mark negatives, then find positive slots"),
    statement: bi("Cho mảng nums có n phần tử, mỗi giá trị thuộc [1,n]. Trả về mọi số trong [1,n] không xuất hiện trong nums.", "Given nums of length n with each value in [1,n], return all numbers in [1,n] that do not occur in nums."),
    defaultInput: [4, 3, 2, 7, 8, 2, 3, 1], inputKind: "positive",
    inputLabel: bi("nums (1–80 phần tử; mỗi số thuộc 1..n)", "nums (1–80 values; each in 1..n)"),
    extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Lần quét 1: đọc value = abs(nums[i]), rồi ánh xạ số đó đến index = value − 1.", "First pass: read value = abs(nums[i]), then map it to index = value − 1."),
      bi("Nếu ô nums[index] còn dương, đổi nó thành âm. Nếu đã âm thì giữ nguyên, tránh số trùng xóa dấu đã đánh.", "If nums[index] is positive, negate it. If already negative, leave it unchanged so duplicates cannot erase a mark."),
      bi("Lần quét 2: mỗi ô nums[i] còn dương có nghĩa số i + 1 chưa xuất hiện; thêm i + 1 vào kết quả.", "Second pass: each positive nums[i] means number i + 1 never appeared; append i + 1 to the output."),
      bi("Mã Python đổi dấu nums tại chỗ và dùng O(1) bộ nhớ phụ ngoài kết quả. Mô phỏng nhận tối đa 80 phần tử để giữ đủ từng bước.", "The Python solution marks nums in place and uses O(1) auxiliary space excluding the output. The visualization accepts up to 80 values to keep every step."),
    ],
    complexity: { time: "O(n)", space: "O(1) auxiliary", note: bi("Hai lượt quét tuyến tính. Không tính danh sách kết quả; các bản sao mảng chỉ dùng cho mô phỏng.", "Two linear scans. Excludes the output list; array snapshots are only for visualization.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseNums(input)],
  },
};
