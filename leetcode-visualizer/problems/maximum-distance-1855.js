"use strict";

const { bi, parseIntegerArray, parsePlainParams } = require("./hard-viz-shared");
const MAX_VISUAL_LENGTH = 100;
const SOURCE = Object.freeze([
  "class Solution:",
  "    def maxDistance(self, nums1: list[int], nums2: list[int]) -> int:",
  "        i = j = 0",
  "        best = 0",
  "        while i < len(nums1) and j < len(nums2):",
  "            if nums1[i] <= nums2[j]:",
  "                if i <= j:",
  "                    best = max(best, j - i)",
  "                j += 1",
  "            else:",
  "                i += 1",
  "        return best",
]);

function parseInputs(input, params) {
  const options = parsePlainParams(params, 1855);
  const parse = (value, name) => {
    const nums = parseIntegerArray(value, { problemId: 1855, name, minLength: 1, maxLength: MAX_VISUAL_LENGTH, minValue: 1, maxValue: 100000 });
    if (nums.some((value, index) => index > 0 && value > nums[index - 1])) {
      throw new RangeError(`#1855: ${name} phải không tăng / ${name} must be non-increasing.`);
    }
    return nums;
  };
  return [parse(input, "nums1"), parse(options.nums2, "nums2")];
}

function buildSteps(input, params) {
  const [nums1, nums2] = parseInputs(input, params);
  const steps = [];
  const locals = { nums1, nums2, i: 0, j: 0 };
  let i = 0;
  let j = 0;
  let best = null;
  let bestPair = null;
  let valueCheck = null;
  let indexCheck = null;
  let candidate = null;
  let previousBest = null;
  let answer = null;
  let running = null;
  let previousVars = [{ name: "nums1", value: [...nums1] }, { name: "nums2", value: [...nums2] }];
  function emit(line, event, title, note, final = false) {
    const vars = Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value }));
    steps.push({
      arr: [], codeLines: [line], final, title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note, vars,
      maximumDistance1855View: {
        line, source: SOURCE[line - 1], event, nums1: [...nums1], nums2: [...nums2], i, j,
        best, bestPair: bestPair ? [...bestPair] : null, valueCheck, indexCheck, candidate, previousBest, answer, running,
        beforeVars: previousVars.map(entry => ({ ...entry, value: Array.isArray(entry.value) ? [...entry.value] : entry.value })),
        nextLine: null, nextSource: null,
      },
    });
    previousVars = vars;
  }
  function clearChecks() { valueCheck = indexCheck = candidate = previousBest = null; }
  emit(3, "pointers", bi("i = j = 0", "i = j = 0"), bi("i trỏ vào nums1, j trỏ vào nums2. Hai mảng đều không tăng.", "i points into nums1 and j into nums2. Both arrays are non-increasing."));
  best = 0;
  locals.best = best;
  emit(4, "initialize", bi("best = 0", "best = 0"), bi("Chưa có cặp hợp lệ. Khởi tạo khoảng cách tốt nhất bằng 0.", "No valid pair has been found. Initialize the best distance to 0."));
  while (true) {
    clearChecks();
    running = i < nums1.length && j < nums2.length;
    emit(5, running ? "loop-check" : "loop-end", bi(`i < ${nums1.length} and j < ${nums2.length} → ${running ? "True" : "False"}`, `i < ${nums1.length} and j < ${nums2.length} → ${running ? "True" : "False"}`), bi(running ? "Cả hai con trỏ còn trong mảng. Dòng tiếp theo mới so sánh giá trị." : i >= nums1.length ? "i đã hết nums1: không còn giá trị mới để ghép. Dừng, không đọc nums1[i]." : "j đã hết nums2: không còn vị trí xa hơn để xét. Dừng, không đọc nums2[j].", running ? "Both pointers are in bounds. The next line compares their values." : i >= nums1.length ? "i reached the end of nums1: no new value remains. Stop without reading nums1[i]." : "j reached the end of nums2: no further position remains. Stop without reading nums2[j]."));
    if (!running) break;
    valueCheck = nums1[i] <= nums2[j];
    emit(6, "value-check", bi(`${nums1[i]} <= ${nums2[j]} → ${valueCheck ? "True" : "False"}`, `${nums1[i]} <= ${nums2[j]} → ${valueCheck ? "True" : "False"}`), bi(valueCheck ? "Giá trị phù hợp. Kiểm tra thêm i <= j trước khi cập nhật best." : "nums1[i] quá lớn. nums2 về bên phải chỉ nhỏ hơn hoặc bằng, nên giữ j và tăng i để tìm giá trị nums1 nhỏ hơn.", valueCheck ? "The values fit. Also check i <= j before updating best." : "nums1[i] is too large. Later nums2 values cannot be larger, so keep j and increase i to find a smaller nums1 value."));
    if (valueCheck) {
      indexCheck = i <= j;
      candidate = indexCheck ? j - i : null;
      emit(7, "index-check", bi(`${i} <= ${j} → ${indexCheck ? "True" : "False"}`, `${i} <= ${j} → ${indexCheck ? "True" : "False"}`), bi(indexCheck ? `Cặp (${i}, ${j}) hợp lệ. Khoảng cách ứng viên ${j} − ${i} = ${candidate}. Chưa cập nhật best.` : "Giá trị phù hợp nhưng j < i: cặp chưa hợp lệ. Bỏ qua dòng 8; tăng j để bắt kịp i.", indexCheck ? `Pair (${i}, ${j}) is valid. Candidate distance ${j} − ${i} = ${candidate}. best has not been updated yet.` : "The values fit, but j < i: the pair is invalid. Skip line 8 and increase j to catch up with i."));
      if (indexCheck) {
        previousBest = best;
        if (bestPair === null || candidate > best) bestPair = [i, j];
        best = Math.max(best, candidate);
        locals.best = best;
        emit(8, "update-best", bi(`best = max(${previousBest}, ${candidate}) = ${best}`, `best = max(${previousBest}, ${candidate}) = ${best}`), bi(best > previousBest ? "Khoảng cách tăng: lưu cặp tốt nhất mới, đánh dấu xanh trên hai hàng." : "Ứng viên không lớn hơn best: giữ khoảng cách tốt nhất. Khoảng cách 0 vẫn có thể là cặp hợp lệ.", best > previousBest ? "Distance improves: retain the new best pair, marked green in both rows." : "The candidate is no greater than best: retain the best distance. Distance 0 can still be a valid pair."));
      }
      j++;
      locals.j = j;
      clearChecks();
      emit(9, "move-j", bi(`j += 1 → ${j}`, `j += 1 → ${j}`), bi("Giữ i, thử j xa hơn. Chưa so sánh giá trị ở vị trí mới; quay lại while để kiểm tra biên.", "Keep i and try a further j. The new value has not been compared; return to while to check bounds."));
    } else {
      i++;
      locals.i = i;
      clearChecks();
      emit(11, "move-i", bi(`i += 1 → ${i}`, `i += 1 → ${i}`), bi("Giữ j, thử nums1 nhỏ hơn hoặc bằng. Con trỏ có thể đến END; while sẽ kiểm tra trước khi đọc tiếp.", "Keep j and try a no-larger nums1 value. The pointer may reach END; while checks before the next read."));
    }
  }
  answer = best;
  emit(12, "return", bi(`return ${best}`, `return ${best}`), bi(bestPair ? `Cặp (${bestPair[0]}, ${bestPair[1]}) đạt khoảng cách ${best}.` : "Không có cặp hợp lệ; trả về 0 theo đề bài.", bestPair ? `Pair (${bestPair[0]}, ${bestPair[1]}) achieves distance ${best}.` : "No valid pair exists; return 0 as required."), true);
  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.maximumDistance1855View.nextLine = nextLine;
    step.maximumDistance1855View.nextSource = nextLine === null ? null : SOURCE[nextLine - 1];
  });
  return { original: [...nums1], answer, steps };
}

module.exports = {
  1855: {
    id: 1855, difficulty: "medium", slug: "maximum-distance-between-a-pair-of-values",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: bi("Khoảng cách lớn nhất giữa một cặp giá trị", "Maximum Distance Between a Pair of Values"),
    titleVi: bi("Quét hai mảng không tăng bằng i và j", "Scan two non-increasing arrays with i and j"),
    statement: bi("Cho hai mảng không tăng nums1, nums2. Cặp (i,j) hợp lệ khi i <= j và nums1[i] <= nums2[j]. Trả về j−i lớn nhất; trả về 0 nếu không có cặp hợp lệ.", "Given two non-increasing arrays nums1 and nums2, pair (i,j) is valid when i <= j and nums1[i] <= nums2[j]. Return the largest j−i, or 0 if no valid pair exists."),
    defaultInput: [55, 30, 5, 4, 2], inputKind: "positive",
    inputLabel: bi("nums1 (không tăng; 1–100 phần tử)", "nums1 (non-increasing; 1–100 values)"),
    extraParams: [{ key: "nums2", type: "string", default: "100,20,10,10,5", label: bi("nums2 (không tăng; 1–100 số, cách nhau dấu phẩy)", "nums2 (non-increasing; 1–100 comma-separated values)") }],
    debugMode: "line-by-line",
    approach: [
      bi("Đặt i = j = 0, best = 0. Mỗi con trỏ chỉ đi sang phải.", "Initialize i = j = 0 and best = 0. Each pointer only moves right."),
      bi("Nếu nums1[i] > nums2[j], tăng i: tăng j không sửa được vì nums2 không tăng.", "If nums1[i] > nums2[j], increase i: increasing j cannot fix the values because nums2 is non-increasing."),
      bi("Nếu giá trị phù hợp, kiểm tra i <= j. Cặp hợp lệ thì best = max(best,j−i); sau đó tăng j để thử khoảng cách xa hơn.", "When the values fit, check i <= j. For a valid pair, best = max(best,j−i); then increase j to try a greater distance."),
      bi("j < i thì chưa cập nhật best; tiếp tục tăng j. Dừng khi một con trỏ hết mảng.", "When j < i, do not update best; keep advancing j. Stop when either pointer reaches its array's end."),
      bi("Mô phỏng từng dòng nhận tối đa 100 phần tử mỗi mảng; giá trị thuộc 1..100000. Mã Python áp dụng cho giới hạn đề bài tới 100000 phần tử.", "The line-by-line visualization accepts up to 100 values per array, in 1..100000. The Python solution also handles the problem's limit of 100000 values."),
    ],
    complexity: { time: "O(n + m)", space: "O(1) auxiliary", note: bi("n/m là độ dài hai mảng. Các bản sao và cặp minh họa chỉ dùng cho mô phỏng.", "n/m are the two array lengths. Snapshots and the witness pair are only for visualization.") },
    code: SOURCE, builder: buildSteps, liveArgs: parseInputs,
  },
};
