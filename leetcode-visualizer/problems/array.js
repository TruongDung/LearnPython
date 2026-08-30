// Auto-generated: do not edit headers manually.
const rectangle850SegmentTree = require("./math")[850];
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * LeetCode 1295: Find Numbers with Even Number of Digits.
 * Count how many numbers in the array have an even number of digits.
 */
function buildSteps1295(nums) {
  const steps = [];
  let count = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [{ name: "count", value: 0 }],
    note: {
      vi: `Duyệt từng số, đếm số lượng chữ số. Nếu chẵn → count += 1.`,
      en: `Iterate each number, count its digits. If even → count += 1.`,
    },
  });

  const evenIndices = [];
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const digits = String(num).length;
    const isEven = digits % 2 === 0;
    if (isEven) {
      count++;
      evenIndices.push(i);
    }

    steps.push({
      title: { vi: `Xét nums[${i}] = ${num}`, en: `Check nums[${i}] = ${num}` },
      arr: [...nums],
      highlight: [i],
      mark: [...evenIndices],
      codeLines: [4, 5, 6],
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
        { name: "digits", value: digits },
        { name: "even?", value: isEven ? "yes" : "no" },
        { name: "count", value: count },
      ],
      note: {
        vi: `${num} có ${digits} chữ số (${isEven ? "chẵn → count++" : "lẻ → bỏ qua"}). count = ${count}.`,
        en: `${num} has ${digits} digit(s) (${isEven ? "even → count++" : "odd → skip"}). count = ${count}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [...evenIndices],
    final: true,
    codeLines: [7],
    vars: [
      { name: "count", value: count },
      { name: "even numbers", value: evenIndices.map((i) => nums[i]) },
    ],
    note: {
      vi: `Có ${count} số có số lượng chữ số chẵn: [${evenIndices.map((i) => nums[i]).join(", ")}].`,
      en: `${count} number(s) have an even number of digits: [${evenIndices.map((i) => nums[i]).join(", ")}].`,
    },
  });

  return { original: [...nums], answer: count, steps };
}

/**
 * LeetCode 941: Valid Mountain Array.
 * Walk up from the left, walk down to the right.
 * Valid if peak is not at either end.
 */
function buildSteps941Legacy(nums) {
  const n = nums.length;
  const steps = [];

  if (n < 3) {
    steps.push({
      title: { vi: "Quá ngắn", en: "Too short" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [4],
      vars: [{ name: "result", value: false }],
      note: { vi: `Mảng cần ít nhất 3 phần tử. Trả về False.`, en: `Array needs at least 3 elements. Return False.` },
    });
    return { original: [...nums], answer: false, steps };
  }

  steps.push({
    title: { vi: "Bắt đầu leo lên", en: "Start climbing up" },
    arr: [...nums],
    highlight: [0],
    mark: [],
    codeLines: [5, 6],
    vars: [{ name: "i", value: 0 }, { name: "phase", value: "climb" }],
    note: { vi: "Bắt đầu từ trái, đi lên bao lâu nums[i] < nums[i+1].", en: "Start from the left, climb while nums[i] < nums[i+1]." },
  });

  let i = 0;
  while (i + 1 < n && nums[i] < nums[i + 1]) {
    i++;
    steps.push({
      title: { vi: `Leo lên: i = ${i}`, en: `Climb: i = ${i}` },
      arr: [...nums],
      highlight: Array.from({ length: i + 1 }, (_, x) => x),
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "phase", value: "climb" },
      ],
      note: {
        vi: `nums[${i - 1}]=${nums[i - 1]} < nums[${i}]=${nums[i]} → tiếp tục leo.`,
        en: `nums[${i - 1}]=${nums[i - 1]} < nums[${i}]=${nums[i]} → keep climbing.`,
      },
    });
  }

  const peak = i;
  if (peak === 0 || peak === n - 1) {
    steps.push({
      title: { vi: "Không có đỉnh hợp lệ", en: "No valid peak" },
      arr: [...nums],
      highlight: [peak],
      mark: [],
      final: true,
      codeLines: [8],
      vars: [{ name: "peak", value: peak }, { name: "result", value: false }],
      note: {
        vi: `Đỉnh ở biên (i=${peak}) → không phải núi. Trả về False.`,
        en: `Peak at boundary (i=${peak}) → not a mountain. Return False.`,
      },
    });
    return { original: [...nums], answer: false, steps };
  }

  steps.push({
    title: { vi: `Đỉnh tại i = ${peak}`, en: `Peak at i = ${peak}` },
    arr: [...nums],
    highlight: [peak],
    mark: [peak],
    codeLines: [8, 9],
    vars: [{ name: "peak", value: peak }, { name: "nums[peak]", value: nums[peak] }],
    note: { vi: `Đỉnh = nums[${peak}] = ${nums[peak]}. Bây giờ đi xuống.`, en: `Peak = nums[${peak}] = ${nums[peak]}. Now descend.` },
  });

  while (i + 1 < n && nums[i] > nums[i + 1]) {
    i++;
    steps.push({
      title: { vi: `Xuống: i = ${i}`, en: `Descend: i = ${i}` },
      arr: [...nums],
      highlight: Array.from({ length: i - peak + 1 }, (_, x) => peak + x),
      mark: [peak],
      codeLines: [9, 10],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "phase", value: "descend" },
      ],
      note: {
        vi: `nums[${i - 1}]=${nums[i - 1]} > nums[${i}]=${nums[i]} → tiếp tục xuống.`,
        en: `nums[${i - 1}]=${nums[i - 1]} > nums[${i}]=${nums[i]} → keep descending.`,
      },
    });
  }

  const valid = i === n - 1;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: valid ? Array.from({ length: n }, (_, x) => x) : [peak],
    final: true,
    codeLines: [11],
    vars: [
      { name: "i", value: i },
      { name: "n-1", value: n - 1 },
      { name: "result", value: valid },
    ],
    note: {
      vi: valid
        ? `Đã xuống tới cuối (i=${i} == n-1). Đây là núi hợp lệ → True.`
        : `Dừng sớm tại i=${i} (chưa tới cuối). Không phải núi → False.`,
      en: valid
        ? `Descended to the end (i=${i} == n-1). Valid mountain → True.`
        : `Stopped early at i=${i} (not at end). Not a mountain → False.`,
    },
  });

  return { original: [...nums], answer: valid, steps };
}

/**
 * LeetCode 1299: Replace Elements with Greatest Element on Right Side.
 * Traverse right to left, track running max. Replace each element with the max to its right.
 * Last element becomes -1.
 */
/** LeetCode 941: exact line-by-line mountain profile visualization. */
function buildSteps941(nums) {
  const n = nums.length;
  const steps = [];
  let i = 0;
  let peak = null;
  let phase = "length";
  let activeEdge = null;
  let failedEdge = null;
  let validatedEdges = [];
  let result = null;
  let reason = "";

  const snapshot = () => ({
    nums: [...nums], n, i, peak, phase, activeEdge, failedEdge,
    validatedEdges: [...validatedEdges], result, reason,
  });
  const addStep = (title, note, codeLine, nextPhase, vars = [], final = false) => {
    phase = nextPhase;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: [...nums],
      highlight: Number.isInteger(i) && i < n ? [i] : [],
      mark: peak === null ? [] : [peak],
      vars: [
        { name: "n", value: n },
        { name: "i", value: i },
        { name: "peak", value: peak === null ? "?" : peak },
        ...vars,
      ],
      mountainArrayView: snapshot(),
    });
  };

  addStep(
    { vi: `n = len(arr) = ${n}`, en: `n = len(arr) = ${n}` },
    { vi: "Một ngọn núi cần đoạn tăng, một đỉnh và đoạn giảm.", en: "A mountain needs an ascent, one peak, and a descent." },
    3, "length", [{ name: "n", value: n }],
  );
  if (n < 3) {
    result = false;
    reason = "too-short";
    addStep(
      { vi: `${n} < 3 → return False`, en: `${n} < 3 → return False` },
      { vi: "Ít hơn 3 điểm thì không thể có cả sườn lên và sườn xuống.", en: "Fewer than 3 points cannot contain both an ascent and a descent." },
      4, "done", [{ name: "result", value: false }], true,
    );
    return { original: [...nums], answer: false, steps };
  }
  addStep(
    { vi: `${n} < 3 → False`, en: `${n} < 3 → False` },
    { vi: "Mảng đủ dài; bắt đầu tìm đỉnh.", en: "The array is long enough; start searching for the peak." },
    4, "length", [],
  );
  i = 0;
  addStep(
    { vi: "i = 0", en: "i = 0" },
    { vi: "Bắt đầu ở chân núi bên trái.", en: "Start at the left foot of the mountain." },
    5, "climb", [{ name: "i", value: i }],
  );

  while (i + 1 < n && nums[i] < nums[i + 1]) {
    activeEdge = i;
    addStep(
      { vi: `${nums[i]} < ${nums[i + 1]} → tiếp tục leo`, en: `${nums[i]} < ${nums[i + 1]} → keep climbing` },
      { vi: `Cạnh [${i}→${i + 1}] tăng nghiêm ngặt, đúng sườn lên.`, en: `Edge [${i}→${i + 1}] is strictly increasing, so it belongs to the ascent.` },
      6, "climb-check", [{ name: "arr[i]", value: nums[i] }, { name: "arr[i+1]", value: nums[i + 1] }],
    );
    validatedEdges.push(i);
    i += 1;
    activeEdge = null;
    addStep(
      { vi: `i += 1 → ${i}`, en: `i += 1 → ${i}` },
      { vi: `Con trỏ đã leo tới arr[${i}] = ${nums[i]}.`, en: `The pointer has climbed to arr[${i}] = ${nums[i]}.` },
      7, "climb", [{ name: "i", value: i }],
    );
  }

  activeEdge = i + 1 < n ? i : null;
  if (activeEdge !== null && nums[i] === nums[i + 1]) failedEdge = i;
  addStep(
    {
      vi: activeEdge === null ? "Đã tới cuối mảng → dừng leo" : `${nums[i]} < ${nums[i + 1]} → False`,
      en: activeEdge === null ? "Reached the array end → stop climbing" : `${nums[i]} < ${nums[i + 1]} → False`,
    },
    {
      vi: activeEdge === null ? "Không còn điểm bên phải để leo tiếp." : (nums[i] === nums[i + 1] ? "Hai giá trị bằng nhau tạo đoạn phẳng, không được phép trong núi." : "Giá trị tiếp theo thấp hơn; vị trí hiện tại là ứng viên đỉnh."),
      en: activeEdge === null ? "There is no point to the right." : (nums[i] === nums[i + 1] ? "Equal adjacent values form a plateau, which a mountain forbids." : "The next value is lower, so the current position is the peak candidate."),
    },
    6, "climb-stop", [],
  );

  peak = i;
  activeEdge = null;
  if (peak === 0 || peak === n - 1) {
    result = false;
    reason = peak === 0 ? "no-ascent" : "no-descent";
    addStep(
      { vi: `peak = ${peak} nằm ở biên → False`, en: `peak = ${peak} is on a boundary → False` },
      { vi: peak === 0 ? "Không có sườn tăng trước đỉnh." : "Không có sườn giảm sau đỉnh.", en: peak === 0 ? "There is no ascent before the peak." : "There is no descent after the peak." },
      8, "done", [{ name: "result", value: false }], true,
    );
    return { original: [...nums], answer: false, steps };
  }
  failedEdge = null;
  addStep(
    { vi: `0 < peak=${peak} < ${n - 1}`, en: `0 < peak=${peak} < ${n - 1}` },
    { vi: `arr[${peak}] = ${nums[peak]} là đỉnh nội bộ hợp lệ; bắt đầu đi xuống.`, en: `arr[${peak}] = ${nums[peak]} is a valid internal peak; begin descending.` },
    8, "peak", [{ name: "arr[peak]", value: nums[peak] }],
  );

  while (i + 1 < n && nums[i] > nums[i + 1]) {
    activeEdge = i;
    addStep(
      { vi: `${nums[i]} > ${nums[i + 1]} → tiếp tục xuống`, en: `${nums[i]} > ${nums[i + 1]} → keep descending` },
      { vi: `Cạnh [${i}→${i + 1}] giảm nghiêm ngặt, đúng sườn xuống.`, en: `Edge [${i}→${i + 1}] is strictly decreasing, so it belongs to the descent.` },
      9, "descend-check", [{ name: "arr[i]", value: nums[i] }, { name: "arr[i+1]", value: nums[i + 1] }],
    );
    validatedEdges.push(i);
    i += 1;
    activeEdge = null;
    addStep(
      { vi: `i += 1 → ${i}`, en: `i += 1 → ${i}` },
      { vi: `Con trỏ đã xuống tới arr[${i}] = ${nums[i]}.`, en: `The pointer has descended to arr[${i}] = ${nums[i]}.` },
      10, "descend", [{ name: "i", value: i }],
    );
  }

  activeEdge = i + 1 < n ? i : null;
  if (activeEdge !== null) failedEdge = i;
  addStep(
    {
      vi: activeEdge === null ? "Đã tới cuối mảng → dừng xuống" : `${nums[i]} > ${nums[i + 1]} → False`,
      en: activeEdge === null ? "Reached the array end → stop descending" : `${nums[i]} > ${nums[i + 1]} → False`,
    },
    {
      vi: activeEdge === null ? "Sườn xuống đã đi hết mảng." : (nums[i] === nums[i + 1] ? "Gặp đoạn phẳng trên sườn xuống." : "Mảng tăng trở lại sau đỉnh, tạo thêm một đỉnh/đáy."),
      en: activeEdge === null ? "The descent reaches the array end." : (nums[i] === nums[i + 1] ? "A plateau appears on the descent." : "The array rises again after the peak, creating another turn."),
    },
    9, "descend-stop", [],
  );

  result = i === n - 1;
  reason = result ? "valid" : "stopped-early";
  activeEdge = null;
  addStep(
    { vi: `return ${i} == ${n - 1} → ${result ? "True" : "False"}`, en: `return ${i} == ${n - 1} → ${result ? "True" : "False"}` },
    { vi: result ? "Đã tăng nghiêm ngặt tới một đỉnh rồi giảm nghiêm ngặt tới cuối mảng." : `Dừng sớm ở index ${i}; phần còn lại không tiếp tục giảm.`, en: result ? "The array strictly rises to one peak, then strictly falls to the end." : `Stopped early at index ${i}; the remaining values do not keep decreasing.` },
    11, "done", [{ name: "result", value: result }], true,
  );
  return { original: [...nums], answer: result, steps };
}

function buildSteps1299Legacy(nums) {
  const n = nums.length;
  const original = [...nums];
  const arr = [...nums];
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [{ name: "rightMax", value: -1 }],
    note: {
      vi: `Duyệt từ phải qua trái. rightMax = -1 (phía sau phần tử cuối không có gì).`,
      en: `Traverse right to left. rightMax = -1 (nothing to the right of the last element).`,
    },
  });

  let rightMax = -1;
  for (let i = n - 1; i >= 0; i--) {
    const cur = arr[i];
    arr[i] = rightMax;
    rightMax = Math.max(rightMax, cur);

    steps.push({
      title: { vi: `i = ${i}: thay ${cur} → ${arr[i]}`, en: `i = ${i}: replace ${cur} → ${arr[i]}` },
      arr: [...arr],
      highlight: [i],
      mark: [],
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "original", value: cur },
        { name: "arr[i]", value: arr[i] },
        { name: "rightMax", value: rightMax },
      ],
      note: {
        vi: `arr[${i}] = rightMax cũ = ${arr[i]}. Cập nhật rightMax = max(${arr[i] === -1 && i === n - 1 ? -1 : rightMax === cur ? cur : rightMax}, ${cur}) = ${rightMax}.`,
        en: `arr[${i}] = old rightMax = ${arr[i]}. Update rightMax = max(prev, ${cur}) = ${rightMax}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [9],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Kết quả: [${arr.join(", ")}].`,
      en: `Result: [${arr.join(", ")}].`,
    },
  });

  return { original, answer: arr, steps };
}

/** LeetCode 1299: exact line-by-line right-to-left maximum visualization. */
function buildSteps1299(nums) {
  const n = nums.length;
  const original = [...nums];
  const arr = [...nums];
  const steps = [];
  let rightMax = -1;
  let rightMaxSource = null;
  let previousRightMax = -1;
  let previousMaxSource = null;
  let currentI = null;
  let cur = null;
  let writeValue = null;
  let writeSource = null;
  let processedFrom = n;
  let phase = "length";
  let maxUpdated = false;

  const snapshot = () => ({
    original: [...original], arr: [...arr], n, rightMax, rightMaxSource,
    previousRightMax, previousMaxSource, currentI, cur, writeValue, writeSource,
    processedFrom, phase, maxUpdated,
  });
  const addStep = (title, note, codeLine, nextPhase, vars = [], final = false) => {
    phase = nextPhase;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: [...arr],
      highlight: Number.isInteger(currentI) ? [currentI] : [],
      mark: rightMaxSource === null ? [] : [rightMaxSource],
      vars: [
        { name: "n", value: n },
        { name: "i", value: currentI === null ? "?" : currentI },
        { name: "cur", value: cur === null ? "?" : cur },
        { name: "right_max", value: rightMax },
        ...vars,
      ],
      replaceGreatestView: snapshot(),
    });
  };

  addStep(
    { vi: `n = len(arr) = ${n}`, en: `n = len(arr) = ${n}` },
    { vi: "Ta sẽ xử lý mảng từ phải sang trái để luôn biết maximum ở bên phải.", en: "Process the array right to left so the maximum on the right is always known." },
    3, "length", [{ name: "n", value: n }],
  );
  rightMax = -1;
  addStep(
    { vi: "right_max = -1", en: "right_max = -1" },
    { vi: "Bên phải phần tử cuối không có giá trị nào, nên đáp án cuối là -1.", en: "Nothing exists to the right of the last value, so its replacement is -1." },
    4, "init", [{ name: "right_max", value: rightMax }],
  );

  for (let i = n - 1; i >= 0; i -= 1) {
    currentI = i;
    cur = null;
    writeValue = null;
    writeSource = null;
    previousRightMax = rightMax;
    previousMaxSource = rightMaxSource;
    maxUpdated = false;
    addStep(
      { vi: `Vòng lặp: i = ${i}`, en: `Loop: i = ${i}` },
      { vi: `Xử lý arr[${i}] từ phải sang trái; các index ${i + 1}..${n - 1} đã hoàn tất.`, en: `Process arr[${i}] right to left; indices ${i + 1}..${n - 1} are complete.` },
      5, "scan", [{ name: "i", value: i }],
    );

    cur = arr[i];
    addStep(
      { vi: `cur = arr[${i}] = ${cur}`, en: `cur = arr[${i}] = ${cur}` },
      { vi: "Lưu giá trị gốc trước khi ghi đè lên arr[i].", en: "Save the original value before overwriting arr[i]." },
      6, "read", [{ name: "cur", value: cur }],
    );

    writeValue = rightMax;
    writeSource = rightMaxSource;
    arr[i] = rightMax;
    processedFrom = i;
    addStep(
      { vi: `arr[${i}] = right_max → ${writeValue}`, en: `arr[${i}] = right_max → ${writeValue}` },
      { vi: writeSource === null ? "Index cuối nhận -1 vì không có phần tử bên phải." : `Maximum hoàn toàn bên phải đến từ original[${writeSource}] = ${original[writeSource]}.`, en: writeSource === null ? "The last index receives -1 because nothing is to its right." : `The strict-right maximum comes from original[${writeSource}] = ${original[writeSource]}.` },
      7, "write", [{ name: "arr[i]", value: writeValue }, { name: "source index", value: writeSource === null ? "none" : writeSource }],
    );

    previousRightMax = rightMax;
    previousMaxSource = rightMaxSource;
    if (cur > rightMax) {
      rightMax = cur;
      rightMaxSource = i;
      maxUpdated = true;
    }
    addStep(
      {
        vi: `right_max = max(${previousRightMax}, ${cur}) → ${rightMax}`,
        en: `right_max = max(${previousRightMax}, ${cur}) → ${rightMax}`,
      },
      {
        vi: maxUpdated ? `${cur} lớn hơn maximum cũ, nên trở thành maximum cho index tiếp theo bên trái.` : `${cur} không lớn hơn maximum cũ; giữ right_max = ${rightMax}.`,
        en: maxUpdated ? `${cur} exceeds the old maximum, so it becomes the maximum for the next index to the left.` : `${cur} does not exceed the old maximum; keep right_max = ${rightMax}.`,
      },
      8, "update", [{ name: "old right_max", value: previousRightMax }, { name: "new right_max", value: rightMax }],
    );
  }

  currentI = null;
  cur = null;
  writeValue = null;
  writeSource = null;
  processedFrom = 0;
  maxUpdated = false;
  addStep(
    { vi: `return [${arr.join(", ")}]`, en: `return [${arr.join(", ")}]` },
    { vi: "Mỗi vị trí đã được thay bằng maximum nằm hoàn toàn bên phải của nó.", en: "Every position has been replaced by the maximum strictly to its right." },
    9, "done", [{ name: "result", value: [...arr] }], true,
  );
  return { original, answer: arr, steps };
}

// 1089 moved to two-pointer.js

/**
 * Generate steps for LeetCode 1260: Shift 2D Grid.
 * Map each cell to a flattened index, shift it by k with modulo, then map it
 * back to a row and column in the result grid.
 */
function buildSteps1260(input, params) {
  if (Number(params && params.approach) === 2) {
    return buildSteps1260Flatten(input, params);
  }

  const rowStrings = String(input).split(";").map((row) => row.trim()).filter(Boolean);
  const grid = rowStrings.map((row) => row.split(",").map((value) => Number(value.trim())));
  const k = params.k;
  const valid = grid.length > 0
    && grid[0].length > 0
    && grid.every((row) => row.length === grid[0].length)
    && grid.every((row) => row.every(Number.isInteger));

  if (!valid) {
    return {
      original: input,
      answer: null,
      steps: [{
        title: { vi: "Grid không hợp lệ", en: "Invalid grid" },
        codeLines: [3],
        final: true,
        vars: [{ name: "error", value: "invalid rectangular grid" }],
        shiftGridView: { source: [], result: [], k, phase: { vi: "Lỗi input", en: "Input error" } },
        note: {
          vi: "Mỗi hàng phải có cùng số cột và chỉ chứa số nguyên. Ví dụ: 1,2,3;4,5,6;7,8,9.",
          en: "Every row must have the same number of integer cells. Example: 1,2,3;4,5,6;7,8,9.",
        },
      }],
    };
  }

  const m = grid.length;
  const n = grid[0].length;
  const total = m * n;
  const normalizedK = k % total;
  const result = Array.from({ length: m }, () => Array(n).fill(null));
  const steps = [];
  const placed = [];

  const makeView = (overrides = {}) => ({
    source: grid.map((row) => [...row]),
    result: result.map((row) => [...row]),
    k,
    normalizedK,
    placed: placed.map(([r, c]) => [r, c]),
    ...overrides,
  });

  steps.push({
    title: { vi: "Đọc kích thước grid", en: "Read grid dimensions" },
    codeLines: [3],
    vars: [
      { name: "m", value: m },
      { name: "n", value: n },
      { name: "k", value: k },
      { name: "cells", value: total },
    ],
    shiftGridView: makeView({ phase: { vi: "Grid ban đầu", en: "Original grid" } }),
    note: {
      vi: `Grid có ${m} hàng, ${n} cột, tổng cộng ${total} ô. Shift ${k} lần tương đương dịch ${normalizedK} vị trí sau khi lấy modulo ${total}.`,
      en: `The grid has ${m} rows, ${n} columns, and ${total} cells. ${k} shifts equal ${normalizedK} positions after modulo ${total}.`,
    },
  });

  steps.push({
    title: { vi: "Tạo result rỗng", en: "Create an empty result" },
    codeLines: [4],
    vars: [
      { name: "m", value: m },
      { name: "n", value: n },
      { name: "result", value: `${m} x ${n} empty` },
    ],
    shiftGridView: makeView({ phase: { vi: "Chưa đặt ô nào", en: "No cells placed yet" } }),
    note: {
      vi: "Tạo grid kết quả cùng kích thước. Dấu chấm là vị trí chưa được gán.",
      en: "Create a result grid with the same dimensions. A dot marks an unassigned position.",
    },
  });

  for (let r = 0; r < m; r++) {
    steps.push({
      title: { vi: `Duyệt hàng r = ${r}`, en: `Visit row r = ${r}` },
      codeLines: [5],
      vars: [
        { name: "r", value: r },
        { name: "k", value: k },
        { name: "placed", value: placed.length },
      ],
      shiftGridView: makeView({ sourceRow: r, phase: { vi: `Đang duyệt hàng ${r}`, en: `Scanning row ${r}` } }),
      note: {
        vi: `Bắt đầu xử lý các ô ở hàng ${r}.`,
        en: `Begin processing cells in row ${r}.`,
      },
    });

    for (let c = 0; c < n; c++) {
      const value = grid[r][c];
      const oldPos = r * n + c;
      const newPos = (oldPos + k) % total;
      const newR = Math.floor(newPos / n);
      const newC = newPos % n;

      steps.push({
        title: { vi: `Chọn grid[${r}][${c}] = ${value}`, en: `Select grid[${r}][${c}] = ${value}` },
        codeLines: [6],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "value", value },
          { name: "k", value: k },
        ],
        shiftGridView: makeView({
          current: [r, c],
          phase: { vi: "Chọn ô nguồn", en: "Select source cell" },
        }),
        note: {
          vi: `Ô đang xét chứa ${value} tại tọa độ (${r}, ${c}).`,
          en: `The current cell contains ${value} at coordinate (${r}, ${c}).`,
        },
      });

      steps.push({
        title: { vi: `Đổi (${r}, ${c}) thành index ${oldPos}`, en: `Flatten (${r}, ${c}) to index ${oldPos}` },
        codeLines: [7],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "old_pos", value: oldPos },
          { name: "formula", value: `${r} * ${n} + ${c}` },
        ],
        shiftGridView: makeView({
          current: [r, c],
          oldPos,
          phase: { vi: "Trải phẳng tọa độ cũ", en: "Flatten the old coordinate" },
        }),
        note: {
          vi: `old_pos = r * n + c = ${r} * ${n} + ${c} = ${oldPos}.`,
          en: `old_pos = r * n + c = ${r} * ${n} + ${c} = ${oldPos}.`,
        },
      });

      steps.push({
        title: { vi: `Dịch index ${oldPos} thêm ${k}`, en: `Shift index ${oldPos} by ${k}` },
        codeLines: [8],
        vars: [
          { name: "old_pos", value: oldPos },
          { name: "k", value: k },
          { name: "m*n", value: total },
          { name: "new_pos", value: newPos },
        ],
        shiftGridView: makeView({
          current: [r, c],
          oldPos,
          newPos,
          phase: { vi: "Dịch trên dãy 1D", en: "Shift on the 1D sequence" },
        }),
        note: {
          vi: `new_pos = (${oldPos} + ${k}) % ${total} = ${newPos}. Modulo đưa vị trí vượt cuối quay lại đầu grid.`,
          en: `new_pos = (${oldPos} + ${k}) % ${total} = ${newPos}. Modulo wraps positions past the end back to the start.`,
        },
      });

      steps.push({
        title: { vi: `Index ${newPos} -> (${newR}, ${newC})`, en: `Index ${newPos} -> (${newR}, ${newC})` },
        codeLines: [9],
        vars: [
          { name: "new_pos", value: newPos },
          { name: "new_r", value: newR },
          { name: "new_c", value: newC },
          { name: "n", value: n },
        ],
        shiftGridView: makeView({
          current: [r, c],
          target: [newR, newC],
          oldPos,
          newPos,
          phase: { vi: "Đổi index mới thành tọa độ", en: "Unflatten the new index" },
        }),
        note: {
          vi: `new_r = ${newPos} // ${n} = ${newR}; new_c = ${newPos} % ${n} = ${newC}.`,
          en: `new_r = ${newPos} // ${n} = ${newR}; new_c = ${newPos} % ${n} = ${newC}.`,
        },
      });

      result[newR][newC] = value;
      placed.push([newR, newC]);
      steps.push({
        title: { vi: `Đặt ${value} vào result[${newR}][${newC}]`, en: `Place ${value} at result[${newR}][${newC}]` },
        codeLines: [10],
        vars: [
          { name: "value", value },
          { name: "new_r", value: newR },
          { name: "new_c", value: newC },
          { name: "placed", value: placed.length },
        ],
        shiftGridView: makeView({
          current: [r, c],
          target: [newR, newC],
          oldPos,
          newPos,
          phase: { vi: "Gán vào grid kết quả", en: "Write into the result grid" },
        }),
        note: {
          vi: `result[${newR}][${newC}] = grid[${r}][${c}] = ${value}.`,
          en: `result[${newR}][${newC}] = grid[${r}][${c}] = ${value}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Trả về grid đã shift", en: "Return the shifted grid" },
    codeLines: [11],
    final: true,
    vars: [
      { name: "k", value: k },
      { name: "normalized_k", value: normalizedK },
      { name: "placed", value: placed.length },
    ],
    shiftGridView: makeView({ phase: { vi: "Kết quả cuối cùng", en: "Final result" } }),
    note: {
      vi: `Đã chuyển đủ ${total} ô. Trả về grid sau ${k} lần shift.`,
      en: `All ${total} cells have been moved. Return the grid after ${k} shifts.`,
    },
  });

  return { original: grid.map((row) => [...row]), answer: result.map((row) => [...row]), steps };
}

function buildSteps1260Flatten(input, params) {
  const rowStrings = String(input).split(";").map((row) => row.trim()).filter(Boolean);
  const originalGrid = rowStrings.map((row) => row.split(",").map((value) => Number(value.trim())));
  const k = params.k;
  const valid = originalGrid.length > 0
    && originalGrid[0].length > 0
    && originalGrid.every((row) => row.length === originalGrid[0].length)
    && originalGrid.every((row) => row.every(Number.isInteger));

  if (!valid) {
    return {
      original: input,
      answer: null,
      steps: [{
        title: { vi: "Grid không hợp lệ", en: "Invalid grid" },
        codeLines: [3],
        codeBlock: 2,
        final: true,
        vars: [{ name: "error", value: "invalid rectangular grid" }],
        shiftGridView: { source: [], result: [], k, phase: { vi: "Lỗi input", en: "Input error" } },
        note: {
          vi: "Mỗi hàng phải có cùng số cột và chỉ chứa số nguyên. Ví dụ: 1,2,3;4,5,6;7,8,9.",
          en: "Every row must have the same number of integer cells. Example: 1,2,3;4,5,6;7,8,9.",
        },
      }],
    };
  }

  const grid = originalGrid.map((row) => [...row]);
  const nRows = grid.length;
  const nCols = grid[0].length;
  const size = nRows * nCols;
  const oneArr = [];
  const newArr = Array(size).fill(null);
  const rebuiltGrid = Array.from({ length: nRows }, () => Array(nCols).fill(null));
  const steps = [];
  const placed = [];

  const makeView = (overrides = {}) => ({
    source: originalGrid.map((row) => [...row]),
    result: rebuiltGrid.map((row) => [...row]),
    sourceLabel: "grid",
    resultLabel: { vi: "grid đang ghi lại", en: "grid being rebuilt" },
    oneArr: [...oneArr],
    newArr: [...newArr],
    k,
    normalizedK: k % size,
    placed: placed.map(([r, c]) => [r, c]),
    ...overrides,
  });
  const snap = ({ title, line, vars, note, view = {}, final = false }) => {
    steps.push({
      title,
      codeLines: [line],
      codeBlock: 2,
      vars,
      note,
      final,
      shiftGridView: makeView(view),
    });
  };

  snap({
    title: { vi: `n_rows = ${nRows}`, en: `n_rows = ${nRows}` },
    line: 3,
    vars: [{ name: "n_rows", value: nRows }],
    view: { phase: { vi: "Đọc số hàng", en: "Read the row count" } },
    note: { vi: `Grid có ${nRows} hàng.`, en: `The grid has ${nRows} rows.` },
  });
  snap({
    title: { vi: `n_cols = ${nCols}`, en: `n_cols = ${nCols}` },
    line: 4,
    vars: [{ name: "n_rows", value: nRows }, { name: "n_cols", value: nCols }],
    view: { phase: { vi: "Đọc số cột", en: "Read the column count" } },
    note: { vi: `Mỗi hàng có ${nCols} cột.`, en: `Each row has ${nCols} columns.` },
  });
  snap({
    title: { vi: `size = ${size}`, en: `size = ${size}` },
    line: 6,
    vars: [
      { name: "n_rows", value: nRows },
      { name: "n_cols", value: nCols },
      { name: "size", value: size },
    ],
    view: { phase: { vi: "Tính tổng số ô", en: "Compute the total cell count" } },
    note: { vi: `size = ${nRows} * ${nCols} = ${size}.`, en: `size = ${nRows} * ${nCols} = ${size}.` },
  });
  snap({
    title: { vi: "Tạo one_arr rỗng", en: "Create an empty one_arr" },
    line: 8,
    vars: [{ name: "one_arr", value: "[]" }],
    view: { phase: { vi: "Mảng phẳng chưa có phần tử", en: "The flattened array is empty" } },
    note: { vi: "one_arr sẽ chứa grid theo thứ tự từ trái sang phải, từ trên xuống dưới.", en: "one_arr will store the grid from left to right, top to bottom." },
  });
  snap({
    title: { vi: `Tạo new_arr gồm ${size} ô`, en: `Create new_arr with ${size} slots` },
    line: 9,
    vars: [
      { name: "size", value: size },
      { name: "new_arr", value: `[${Array(size).fill("0").join(", ")}]` },
    ],
    view: { phase: { vi: "Mảng sau shift chưa được điền", en: "The shifted array has not been filled" } },
    note: { vi: `Code khởi tạo new_arr với ${size} số 0; visualization dùng dấu chấm để phân biệt các ô chưa được gán.`, en: `The code initializes new_arr with ${size} zeros; the visualization uses dots to distinguish unassigned slots.` },
  });

  for (let r = 0; r < nRows; r++) {
    snap({
      title: { vi: `Lấy hàng ${r}`, en: `Read row ${r}` },
      line: 11,
      vars: [
        { name: "row", value: `[${grid[r].join(", ")}]` },
        { name: "one_arr.length", value: oneArr.length },
      ],
      view: {
        sourceRow: r,
        phase: { vi: `Flatten hàng ${r}`, en: `Flatten row ${r}` },
      },
      note: { vi: `Vòng ngoài lấy grid[${r}] = [${grid[r].join(", ")}].`, en: `The outer loop reads grid[${r}] = [${grid[r].join(", ")}].` },
    });

    for (let c = 0; c < nCols; c++) {
      const value = grid[r][c];
      snap({
        title: { vi: `Đọc x = ${value}`, en: `Read x = ${value}` },
        line: 12,
        vars: [
          { name: "row", value: `[${grid[r].join(", ")}]` },
          { name: "x", value },
          { name: "source", value: `grid[${r}][${c}]` },
        ],
        view: {
          current: [r, c],
          activeOneIndex: oneArr.length,
          phase: { vi: "Chọn phần tử tiếp theo", en: "Select the next value" },
        },
        note: { vi: `Vòng trong đọc x = grid[${r}][${c}] = ${value}.`, en: `The inner loop reads x = grid[${r}][${c}] = ${value}.` },
      });

      oneArr.push(value);
      snap({
        title: { vi: `Append ${value} vào one_arr`, en: `Append ${value} to one_arr` },
        line: 13,
        vars: [
          { name: "x", value },
          { name: "one_arr", value: `[${oneArr.join(", ")}]` },
          { name: "one_arr.length", value: oneArr.length },
        ],
        view: {
          current: [r, c],
          activeOneIndex: oneArr.length - 1,
          phase: { vi: "Ghi vào mảng phẳng", en: "Append to the flattened array" },
        },
        note: { vi: `one_arr.append(${value}) -> [${oneArr.join(", ")}].`, en: `one_arr.append(${value}) -> [${oneArr.join(", ")}].` },
      });
    }
  }

  for (let i = 0; i < size; i++) {
    snap({
      title: { vi: `Duyệt i = ${i}`, en: `Visit i = ${i}` },
      line: 15,
      vars: [
        { name: "i", value: i },
        { name: "one_arr[i]", value: oneArr[i] },
        { name: "k", value: k },
      ],
      view: {
        activeOneIndex: i,
        oldPos: i,
        phase: { vi: "Chọn index cũ", en: "Select the old index" },
      },
      note: { vi: `Xét one_arr[${i}] = ${oneArr[i]}.`, en: `Inspect one_arr[${i}] = ${oneArr[i]}.` },
    });

    const newIndex = (i + k) % size;
    snap({
      title: { vi: `new_index = ${newIndex}`, en: `new_index = ${newIndex}` },
      line: 16,
      vars: [
        { name: "i", value: i },
        { name: "k", value: k },
        { name: "size", value: size },
        { name: "new_index", value: newIndex },
      ],
      view: {
        activeOneIndex: i,
        activeNewIndex: newIndex,
        oldPos: i,
        newPos: newIndex,
        phase: { vi: "Tính vị trí sau shift", en: "Compute the shifted index" },
      },
      note: { vi: `new_index = (${i} + ${k}) % ${size} = ${newIndex}.`, en: `new_index = (${i} + ${k}) % ${size} = ${newIndex}.` },
    });

    newArr[newIndex] = oneArr[i];
    snap({
      title: { vi: `Đặt ${oneArr[i]} vào new_arr[${newIndex}]`, en: `Place ${oneArr[i]} at new_arr[${newIndex}]` },
      line: 17,
      vars: [
        { name: "i", value: i },
        { name: "new_index", value: newIndex },
        { name: "one_arr[i]", value: oneArr[i] },
        { name: "new_arr", value: `[${newArr.map((value) => value === null ? "." : value).join(", ")}]` },
      ],
      view: {
        activeOneIndex: i,
        activeNewIndex: newIndex,
        oldPos: i,
        newPos: newIndex,
        phase: { vi: "Ghi vào mảng đã shift", en: "Write into the shifted array" },
      },
      note: { vi: `new_arr[${newIndex}] = one_arr[${i}] = ${oneArr[i]}.`, en: `new_arr[${newIndex}] = one_arr[${i}] = ${oneArr[i]}.` },
    });
  }

  for (let r = 0; r < nRows; r++) {
    snap({
      title: { vi: `Ghi lại hàng i = ${r}`, en: `Rebuild row i = ${r}` },
      line: 19,
      vars: [
        { name: "i", value: r },
        { name: "n_cols", value: nCols },
      ],
      view: {
        resultRow: r,
        phase: { vi: `Chuyển new_arr về hàng ${r}`, en: `Map new_arr back to row ${r}` },
      },
      note: { vi: `Bắt đầu ghi các giá trị của hàng ${r} trở lại grid.`, en: `Begin writing values for row ${r} back into grid.` },
    });

    for (let c = 0; c < nCols; c++) {
      const flatIndex = r * nCols + c;
      const value = newArr[flatIndex];
      snap({
        title: { vi: `Chọn ô (${r}, ${c})`, en: `Select cell (${r}, ${c})` },
        line: 20,
        vars: [
          { name: "i", value: r },
          { name: "j", value: c },
          { name: "flat_index", value: flatIndex },
        ],
        view: {
          target: [r, c],
          activeNewIndex: flatIndex,
          newPos: flatIndex,
          phase: { vi: "Chọn tọa độ cần ghi", en: "Select the destination coordinate" },
        },
        note: { vi: `Ô grid[${r}][${c}] tương ứng index phẳng ${r} * ${nCols} + ${c} = ${flatIndex}.`, en: `Cell grid[${r}][${c}] corresponds to flat index ${r} * ${nCols} + ${c} = ${flatIndex}.` },
      });

      rebuiltGrid[r][c] = value;
      grid[r][c] = value;
      placed.push([r, c]);
      snap({
        title: { vi: `grid[${r}][${c}] = ${value}`, en: `grid[${r}][${c}] = ${value}` },
        line: 21,
        vars: [
          { name: "i", value: r },
          { name: "j", value: c },
          { name: "i*n_cols+j", value: flatIndex },
          { name: "new_arr[index]", value },
        ],
        view: {
          target: [r, c],
          activeNewIndex: flatIndex,
          newPos: flatIndex,
          phase: { vi: "Ghi trở lại grid", en: "Write back into grid" },
        },
        note: { vi: `grid[${r}][${c}] = new_arr[${flatIndex}] = ${value}.`, en: `grid[${r}][${c}] = new_arr[${flatIndex}] = ${value}.` },
      });
    }
  }

  snap({
    title: { vi: "Trả về grid", en: "Return grid" },
    line: 23,
    final: true,
    vars: [
      { name: "one_arr", value: `[${oneArr.join(", ")}]` },
      { name: "new_arr", value: `[${newArr.join(", ")}]` },
      { name: "grid", value: JSON.stringify(grid) },
    ],
    view: {
      resultLabel: { vi: "grid cuối cùng", en: "final grid" },
      phase: { vi: "Kết quả Approach 2", en: "Approach 2 result" },
    },
    note: { vi: `Trả về grid = ${JSON.stringify(grid)}.`, en: `Return grid = ${JSON.stringify(grid)}.` },
  });

  return { original: originalGrid, answer: grid.map((row) => [...row]), steps };
}

/**
 * Generate steps for LeetCode 1275: Find Winner on a Tic Tac Toe Game.
 * Simulate each move on a 3x3 board and check for a winner.
 */
function buildSteps1275(input) {
  const movesRaw = String(input).split(",").map((m) => m.trim()).filter((m) => m.length > 0);
  const moves = movesRaw.map((m) => {
    const parts = m.split("-");
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  });
  const steps = [];

  const board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  const boardStr = () => board.map((r) => r.map((c) => c || ".").join("")).join("|");

  const flatLabels = () => {
    const flat = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        flat.push(board[r][c] || ".");
    return flat;
  };
  const rowCells = (row) => [row * 3, row * 3 + 1, row * 3 + 2];
  const colCells = (col) => [col, col + 3, col + 6];
  const mainDiagonal = [0, 4, 8];
  const antiDiagonal = [2, 4, 6];
  const cellsMatch = (cells, player) => cells.every((index) => flatLabels()[index] === player);
  const boardCells = (highlight, mark) => {
    const highlightSet = new Set(highlight);
    const markSet = new Set(mark);
    return board.map((row, r) => row.map((player, c) => {
      const index = r * 3 + c;
      let cls = player === "A" ? "tic-a" : player === "B" ? "tic-b" : "empty";
      if (highlightSet.has(index)) cls = "current";
      if (markSet.has(index)) cls = "path";
      return { label: player, meta: `(${r},${c})`, cls };
    }));
  };
  const pushStep = ({ title, highlight = [], mark = [], codeLines, vars = [], note, final = false }) => {
    steps.push({
      title,
      bfsGrid: {
        rows: 3,
        cols: 3,
        cells: boardCells(highlight, mark),
        variant: "tic-tac-toe",
      },
      final,
      codeLines,
      vars,
      note,
    });
  };

  pushStep({
    title: { vi: "Bàn cờ trống", en: "Empty board" },
    codeLines: [3],
    vars: [
      { name: "moves", value: movesRaw.join(", ") },
      { name: "board", value: boardStr() },
    ],
    note: {
      vi: `Bàn 3×3 trống. A đi trước (nước lẻ), B đi sau (nước chẵn).`,
      en: `Empty 3×3 board. A goes first (odd moves), B goes second (even moves).`,
    },
  });

  for (let i = 0; i < moves.length; i++) {
    const [r, c] = moves[i];
    const player = i % 2 === 0 ? "A" : "B";
    const cellIdx = r * 3 + c;

    pushStep({
      title: { vi: `Vòng for: nước ${i + 1}`, en: `For loop: move ${i + 1}` },
      highlight: [cellIdx],
      codeLines: [4],
      vars: [
        { name: "i", value: i },
        { name: "r", value: r },
        { name: "c", value: c },
        { name: "player", value: player },
      ],
      note: {
        vi: `Đọc moves[${i}] = (${r},${c}); ${player} là người chơi của lượt này.`,
        en: `Read moves[${i}] = (${r},${c}); ${player} is the player for this turn.`,
      },
    });

    board[r][c] = player;
    pushStep({
      title: { vi: `${player} đặt quân tại (${r},${c})`, en: `${player} places at (${r},${c})` },
      highlight: [cellIdx],
      codeLines: [5],
      vars: [
        { name: "i", value: i },
        { name: "board[r][c]", value: player },
        { name: "board", value: boardStr() },
      ],
      note: {
        vi: `Gán board[${r}][${c}] = '${player}'. Chưa kiểm tra thắng cho đến khi đặt xong mọi nước đi.`,
        en: `Set board[${r}][${c}] = '${player}'. Winner checks begin after all moves are placed.`,
      },
    });
  }

  for (const player of ["A", "B"]) {
    pushStep({
      title: { vi: `Kiểm tra người chơi ${player}`, en: `Check player ${player}` },
      codeLines: [7],
      vars: [{ name: "player", value: player }, { name: "board", value: boardStr() }],
      note: {
        vi: `Bắt đầu kiểm tra các hàng, cột và đường chéo của ${player}.`,
        en: `Begin checking ${player}'s rows, columns, and diagonals.`,
      },
    });

    for (let line = 0; line < 3; line++) {
      const row = rowCells(line);
      const rowWin = cellsMatch(row, player);
      pushStep({
        title: { vi: `Hàng ${line} của ${player}: ${rowWin}`, en: `Player ${player}, row ${line}: ${rowWin}` },
        highlight: row,
        codeLines: [8, 9],
        vars: [
          { name: "player", value: player },
          { name: "i", value: line },
          { name: "row values", value: row.map((index) => flatLabels()[index]).join(", ") },
          { name: "row complete", value: rowWin },
        ],
        note: {
          vi: `Kiểm tra board[${line}][0..2] có đều là '${player}' hay không.`,
          en: `Check whether board[${line}][0..2] are all '${player}'.`,
        },
      });
      if (rowWin) {
        pushStep({
          title: { vi: `return '${player}'`, en: `return '${player}'` },
          mark: row,
          codeLines: [10],
          vars: [{ name: "winner", value: player }, { name: "winning row", value: line }],
          note: { vi: `${player} thắng bằng hàng ${line}.`, en: `${player} wins on row ${line}.` },
          final: true,
        });
        return { moves: movesRaw, answer: player, steps };
      }

      const col = colCells(line);
      const colWin = cellsMatch(col, player);
      pushStep({
        title: { vi: `Cột ${line} của ${player}: ${colWin}`, en: `Player ${player}, column ${line}: ${colWin}` },
        highlight: col,
        codeLines: [11],
        vars: [
          { name: "player", value: player },
          { name: "i", value: line },
          { name: "column values", value: col.map((index) => flatLabels()[index]).join(", ") },
          { name: "column complete", value: colWin },
        ],
        note: {
          vi: `Kiểm tra board[0..2][${line}] có đều là '${player}' hay không.`,
          en: `Check whether board[0..2][${line}] are all '${player}'.`,
        },
      });
      if (colWin) {
        pushStep({
          title: { vi: `return '${player}'`, en: `return '${player}'` },
          mark: col,
          codeLines: [12],
          vars: [{ name: "winner", value: player }, { name: "winning column", value: line }],
          note: { vi: `${player} thắng bằng cột ${line}.`, en: `${player} wins on column ${line}.` },
          final: true,
        });
        return { moves: movesRaw, answer: player, steps };
      }
    }

    const mainWin = cellsMatch(mainDiagonal, player);
    pushStep({
      title: { vi: `Đường chéo chính của ${player}: ${mainWin}`, en: `Player ${player}, main diagonal: ${mainWin}` },
      highlight: mainDiagonal,
      codeLines: [13],
      vars: [
        { name: "player", value: player },
        { name: "diagonal values", value: mainDiagonal.map((index) => flatLabels()[index]).join(", ") },
        { name: "diagonal complete", value: mainWin },
      ],
      note: {
        vi: `Kiểm tra (0,0), (1,1), (2,2) có đều là '${player}' hay không.`,
        en: `Check whether (0,0), (1,1), and (2,2) are all '${player}'.`,
      },
    });
    if (mainWin) {
      pushStep({
        title: { vi: `return '${player}'`, en: `return '${player}'` },
        mark: mainDiagonal,
        codeLines: [14],
        vars: [{ name: "winner", value: player }, { name: "winning line", value: "main diagonal" }],
        note: { vi: `${player} thắng bằng đường chéo chính.`, en: `${player} wins on the main diagonal.` },
        final: true,
      });
      return { moves: movesRaw, answer: player, steps };
    }

    const antiWin = cellsMatch(antiDiagonal, player);
    pushStep({
      title: { vi: `Đường chéo phụ của ${player}: ${antiWin}`, en: `Player ${player}, anti-diagonal: ${antiWin}` },
      highlight: antiDiagonal,
      codeLines: [15],
      vars: [
        { name: "player", value: player },
        { name: "anti-diagonal values", value: antiDiagonal.map((index) => flatLabels()[index]).join(", ") },
        { name: "anti-diagonal complete", value: antiWin },
      ],
      note: {
        vi: `Kiểm tra (0,2), (1,1), (2,0) có đều là '${player}' hay không.`,
        en: `Check whether (0,2), (1,1), and (2,0) are all '${player}'.`,
      },
    });
    if (antiWin) {
      pushStep({
        title: { vi: `return '${player}'`, en: `return '${player}'` },
        mark: antiDiagonal,
        codeLines: [16],
        vars: [{ name: "winner", value: player }, { name: "winning line", value: "anti-diagonal" }],
        note: { vi: `${player} thắng bằng đường chéo phụ.`, en: `${player} wins on the anti-diagonal.` },
        final: true,
      });
      return { moves: movesRaw, answer: player, steps };
    }
  }

  const answer = moves.length === 9 ? "Draw" : "Pending";
  pushStep({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    final: true,
    codeLines: [17],
    vars: [
      { name: "len(moves)", value: moves.length },
      { name: "answer", value: answer },
    ],
    note: {
      vi: answer === "Draw"
        ? "Hết ô mà không ai thắng → Hòa."
        : `Còn ô trống và chưa ai thắng → Pending.`,
      en: answer === "Draw"
        ? "All cells filled with no winner → Draw."
        : `Empty cells remain and no winner → Pending.`,
    },
  });

  return { moves: movesRaw, answer, steps };
}

/**
 * LeetCode 628: Maximum Product of Three Numbers.
 *
 * Given nums (may include negatives), return the max product of any 3 numbers.
 *
 * One-pass greedy: track the top 3 largest (first ≥ second ≥ third) AND the
 * bottom 2 smallest (minFirst ≤ minSecond) while scanning. The answer is:
 *   max(first * second * third, minFirst * minSecond * first)
 * because two very negative numbers multiplied together become a large
 * POSITIVE number, which combined with the largest positive can beat the
 * naive "top 3" product (e.g. nums=[-10,-10,1,3,2] → (-10)*(-10)*3 = 300,
 * way bigger than 3*2*1=6).
 *
 * The minFirst/minSecond block is the EXACT MIRROR of the first/second/third
 * block: same if/elif/elif shape, just hunting for the 2 SMALLEST numbers
 * instead of the 3 largest. Each Python line uses a tuple assignment
 * (e.g. `third, second, first = second, first, digit`) so ALL slots shift at
 * once — Python evaluates the whole right-hand tuple BEFORE assigning, so
 * there's no risk of overwriting a value before it's been shifted down.
 */
function buildSteps628(nums) {
  const steps = [];

  let first = -Infinity, second = -Infinity, third = -Infinity;
  let minFirst = Infinity, minSecond = Infinity;
  const visited = new Array(nums.length).fill(false);

  function slots(bumpKeys, transitions) {
    const bumps = bumpKeys || new Set();
    const trans = transitions || {};
    return [
      { key: "first", label: { vi: "first (lớn 1)", en: "first (top 1)" }, value: first, group: "top", bump: bumps.has("first"), transition: trans.first },
      { key: "second", label: { vi: "second (lớn 2)", en: "second (top 2)" }, value: second, group: "top", bump: bumps.has("second"), transition: trans.second },
      { key: "third", label: { vi: "third (lớn 3)", en: "third (top 3)" }, value: third, group: "top", bump: bumps.has("third"), transition: trans.third },
      { key: "minFirst", label: { vi: "minFirst (nhỏ 1)", en: "minFirst (bottom 1)" }, value: minFirst, group: "bottom", bump: bumps.has("minFirst"), transition: trans.minFirst },
      { key: "minSecond", label: { vi: "minSecond (nhỏ 2)", en: "minSecond (bottom 2)" }, value: minSecond, group: "bottom", bump: bumps.has("minSecond"), transition: trans.minSecond },
    ];
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      multiSlotPodiumView: {
        values: nums,
        visited: opts.visited || [...visited],
        current: opts.current !== undefined ? opts.current : -1,
        slots: slots(opts.bumpKeys, opts.transitions),
        formula: opts.formula,
        mirrorHint: opts.mirrorHint,
      },
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Line 3: first = second = third = float('-inf')
  snap({
    title: { vi: "first = second = third = -∞", en: "first = second = third = -∞" },
    codeLines: [3],
    vars: [{ name: "nums", value: `[${nums.join(",")}]` }],
    note: {
      vi: `nums = [${nums.join(",")}]. Sẽ theo dõi 3 số LỚN NHẤT (first≥second≥third) trong 1 lần quét.`,
      en: `nums = [${nums.join(",")}]. Will track the 3 LARGEST numbers (first≥second≥third) in one pass.`,
    },
  });

  // Line 4: minFirst = minSecond = float('inf')
  snap({
    title: { vi: "minFirst = minSecond = +∞", en: "minFirst = minSecond = +∞" },
    codeLines: [4],
    note: {
      vi: "minFirst/minSecond khởi tạo +∞. Đây là cặp biến ĐỐI XỨNG (mirror) với first/second: cùng logic \"giữ top-k\", chỉ khác là top-k của phía NHỎ NHẤT thay vì lớn nhất. Lý do cần chúng: 2 số âm rất nhỏ nhân lại có thể ra số dương RẤT LỚN, đủ để đánh bại tích của 3 số lớn nhất.",
      en: "minFirst/minSecond start at +∞. This is the MIRROR pair of first/second: same \"keep top-k\" logic, just hunting the SMALLEST side instead of the largest. Why we need them: two very negative numbers multiplied can produce a VERY LARGE positive, big enough to beat the top-3 product.",
    },
  });

  for (let idx = 0; idx < nums.length; idx++) {
    const digit = nums[idx];

    // Line 5: for digit in nums:
    snap({
      title: { vi: `for digit in nums → digit = ${digit}`, en: `for digit in nums → digit = ${digit}` },
      current: idx,
      codeLines: [5],
      vars: [{ name: "digit", value: digit }],
      note: {
        vi: `Xét số tiếp theo: digit = nums[${idx}] = ${digit}. Số này sẽ được so với CẢ 2 nhóm bệ (top-3 và bottom-2) trong vòng lặp này.`,
        en: `Consider the next number: digit = nums[${idx}] = ${digit}. This number will be checked against BOTH groups of slots (top-3 and bottom-2) in this iteration.`,
      },
    });

    // ── Top-3 block ──────────────────────────────────────
    // Line 6: if digit > first:
    const beatsFirst = digit > first;
    snap({
      title: { vi: `if digit > first → ${digit} > ${fmtInf(first)} → ${beatsFirst}`, en: `if digit > first → ${digit} > ${fmtInf(first)} → ${beatsFirst}` },
      current: idx,
      codeLines: [6],
      note: beatsFirst
        ? { vi: `${digit} > first=${fmtInf(first)} → digit sẽ chiếm bệ FIRST; first/second cũ dồn xuống second/third cùng lúc.`, en: `${digit} > first=${fmtInf(first)} → digit will take the FIRST slot; old first/second shift down into second/third simultaneously.` }
        : { vi: `${digit} không lớn hơn first=${fmtInf(first)} → kiểm tiếp second.`, en: `${digit} is not larger than first=${fmtInf(first)} → check second next.` },
    });

    if (beatsFirst) {
      // Line 7: third, second, first = second, first, digit
      const oldSecond = second, oldFirst = first;
      third = oldSecond; second = oldFirst; first = digit;
      snap({
        title: { vi: `third,second,first = second,first,digit → (${fmtInf(third)}, ${fmtInf(second)}, ${first})`, en: `third,second,first = second,first,digit → (${fmtInf(third)}, ${fmtInf(second)}, ${first})` },
        current: idx,
        bumpKeys: new Set(["first", "second", "third"]),
        transitions: { third: `${fmtInf(oldSecond)}→${fmtInf(third)}`, second: `${fmtInf(oldFirst)}→${fmtInf(second)}`, first: `${fmtInf(-Infinity)}→${first}` },
        codeLines: [7],
        note: {
          vi: `Python tính TOÀN BỘ vế phải (second, first, digit) = (${fmtInf(oldSecond)}, ${fmtInf(oldFirst)}, ${digit}) TRƯỚC, rồi mới gán cùng lúc: third←${fmtInf(oldSecond)}, second←${fmtInf(oldFirst)}, first←${digit}. Nhờ vậy không lo bị gán đè trước khi kịp dùng.`,
          en: `Python evaluates the ENTIRE right-hand side (second, first, digit) = (${fmtInf(oldSecond)}, ${fmtInf(oldFirst)}, ${digit}) FIRST, then assigns all at once: third←${fmtInf(oldSecond)}, second←${fmtInf(oldFirst)}, first←${digit}. So nothing gets overwritten before it's used.`,
        },
      });
    } else {
      // Line 8: elif digit > second:
      const beatsSecond = digit > second;
      snap({
        title: { vi: `elif digit > second → ${digit} > ${fmtInf(second)} → ${beatsSecond}`, en: `elif digit > second → ${digit} > ${fmtInf(second)} → ${beatsSecond}` },
        current: idx,
        codeLines: [8],
        note: beatsSecond
          ? { vi: `${digit} > second=${fmtInf(second)} → digit sẽ chiếm bệ SECOND; second cũ dồn xuống third cùng lúc.`, en: `${digit} > second=${fmtInf(second)} → digit will take the SECOND slot; old second shifts into third simultaneously.` }
          : { vi: `${digit} không lớn hơn second=${fmtInf(second)} → kiểm tiếp third.`, en: `${digit} is not larger than second=${fmtInf(second)} → check third next.` },
      });

      if (beatsSecond) {
        // Line 9: third, second = second, digit
        const oldSecond = second;
        third = oldSecond; second = digit;
        snap({
          title: { vi: `third,second = second,digit → (${fmtInf(third)}, ${second})`, en: `third,second = second,digit → (${fmtInf(third)}, ${second})` },
          current: idx,
          bumpKeys: new Set(["second", "third"]),
          transitions: { third: `${fmtInf(oldSecond)}→${fmtInf(third)}`, second: `→${second}` },
          codeLines: [9],
          note: {
            vi: `Vế phải (second, digit) = (${fmtInf(oldSecond)}, ${digit}) tính trước, rồi gán: third←${fmtInf(oldSecond)}, second←${digit}.`,
            en: `Right-hand side (second, digit) = (${fmtInf(oldSecond)}, ${digit}) computed first, then assigned: third←${fmtInf(oldSecond)}, second←${digit}.`,
          },
        });
      } else {
        // Line 10: elif digit > third:
        const beatsThird = digit > third;
        snap({
          title: { vi: `elif digit > third → ${digit} > ${fmtInf(third)} → ${beatsThird}`, en: `elif digit > third → ${digit} > ${fmtInf(third)} → ${beatsThird}` },
          current: idx,
          codeLines: [10],
          note: beatsThird
            ? { vi: `${digit} > third=${fmtInf(third)} → digit sẽ chiếm bệ THIRD.`, en: `${digit} > third=${fmtInf(third)} → digit will take the THIRD slot.` }
            : { vi: `${digit} không đủ lớn để vào top-3 → không cập nhật top.`, en: `${digit} isn't large enough for the top-3 → no top update.` },
        });

        if (beatsThird) {
          // Line 11: third = digit
          third = digit;
          snap({
            title: { vi: `third = digit → third = ${third}`, en: `third = digit → third = ${third}` },
            current: idx,
            bumpKeys: new Set(["third"]),
            codeLines: [11],
            note: { vi: `digit=${digit} chiếm bệ third.`, en: `digit=${digit} takes the third slot.` },
          });
        }
      }
    }

    // ── Bottom-2 block (mirror of top-3, hunting smallest) ──
    // Line 12: if digit < minFirst:
    const beatsMinFirst = digit < minFirst;
    snap({
      title: { vi: `if digit < minFirst → ${digit} < ${fmtInf(minFirst)} → ${beatsMinFirst}`, en: `if digit < minFirst → ${digit} < ${fmtInf(minFirst)} → ${beatsMinFirst}` },
      current: idx,
      codeLines: [12],
      mirrorHint: true,
      note: beatsMinFirst
        ? { vi: `Y HỆT logic first ở trên nhưng ngược dấu: ${digit} < minFirst=${fmtInf(minFirst)} → digit chiếm bệ MINFIRST (nhỏ nhất); minFirst cũ dồn xuống minSecond cùng lúc.`, en: `Exactly the SAME logic as first above but flipped: ${digit} < minFirst=${fmtInf(minFirst)} → digit takes the MINFIRST slot; old minFirst shifts into minSecond simultaneously.` }
        : { vi: `${digit} không nhỏ hơn minFirst=${fmtInf(minFirst)} → kiểm tiếp minSecond.`, en: `${digit} is not smaller than minFirst=${fmtInf(minFirst)} → check minSecond next.` },
    });

    if (beatsMinFirst) {
      // Line 13: minSecond, minFirst = minFirst, digit
      const oldMinFirst = minFirst;
      minSecond = oldMinFirst; minFirst = digit;
      snap({
        title: { vi: `minSecond,minFirst = minFirst,digit → (${fmtInf(minSecond)}, ${minFirst})`, en: `minSecond,minFirst = minFirst,digit → (${fmtInf(minSecond)}, ${minFirst})` },
        current: idx,
        bumpKeys: new Set(["minFirst", "minSecond"]),
        transitions: { minSecond: `${fmtInf(oldMinFirst)}→${fmtInf(minSecond)}`, minFirst: `→${minFirst}` },
        codeLines: [13],
        note: {
          vi: `Vế phải (minFirst, digit) = (${fmtInf(oldMinFirst)}, ${digit}) tính trước, rồi gán cùng lúc: minSecond←${fmtInf(oldMinFirst)} (đẩy xuống), minFirst←${digit} (chiếm ngôi nhỏ nhất). Đây chính là phép "swap có điều kiện", giống dòng 7 nhưng chỉ 2 bệ.`,
          en: `Right-hand side (minFirst, digit) = (${fmtInf(oldMinFirst)}, ${digit}) computed first, then assigned together: minSecond←${fmtInf(oldMinFirst)} (pushed down), minFirst←${digit} (takes the smallest spot). This is the same "conditional swap" pattern as line 7, just with 2 slots.`,
        },
      });
    } else {
      // Line 14: elif digit < minSecond:
      const beatsMinSecond = digit < minSecond;
      snap({
        title: { vi: `elif digit < minSecond → ${digit} < ${fmtInf(minSecond)} → ${beatsMinSecond}`, en: `elif digit < minSecond → ${digit} < ${fmtInf(minSecond)} → ${beatsMinSecond}` },
        current: idx,
        codeLines: [14],
        mirrorHint: true,
        note: beatsMinSecond
          ? { vi: `${digit} < minSecond=${fmtInf(minSecond)} → digit chiếm bệ MINSECOND. (elif vì digit đã KHÔNG nhỏ hơn minFirst ở trên rồi — không cần so lại từ đầu.)`, en: `${digit} < minSecond=${fmtInf(minSecond)} → digit takes the MINSECOND slot. (elif because digit already failed the minFirst check above — no need to recompare from scratch.)` }
          : { vi: `${digit} không đủ nhỏ để vào bottom-2 → không cập nhật.`, en: `${digit} isn't small enough for the bottom-2 → no update.` },
      });

      if (beatsMinSecond) {
        // Line 15: minSecond = digit
        minSecond = digit;
        snap({
          title: { vi: `minSecond = digit → minSecond = ${minSecond}`, en: `minSecond = digit → minSecond = ${minSecond}` },
          current: idx,
          bumpKeys: new Set(["minSecond"]),
          codeLines: [15],
          note: { vi: `digit=${digit} chiếm bệ minSecond.`, en: `digit=${digit} takes the minSecond slot.` },
        });
      }
    }

    visited[idx] = true;
  }

  // Line 16: return max(first * second * third, minFirst * minSecond * first)
  const top3 = first * second * third;
  const bottom2top1 = minFirst * minSecond * first;
  const answer = Math.max(top3, bottom2top1);
  const usedBottom = bottom2top1 > top3;

  const fs = {
    title: { vi: `Kết quả: max(${top3}, ${bottom2top1}) = ${answer}`, en: `Result: max(${top3}, ${bottom2top1}) = ${answer}` },
    arr: [],
    multiSlotPodiumView: {
      values: nums,
      visited: [...visited],
      current: -1,
      slots: slots(),
      formula: { label: { vi: "tích lớn nhất", en: "max product" }, value: answer },
    },
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [
      { name: "first*second*third", value: top3 },
      { name: "minFirst*minSecond*first", value: bottom2top1 },
      { name: "answer", value: answer },
    ],
    note: usedBottom
      ? { vi: `minFirst×minSecond×first = ${bottom2top1} LỚN HƠN first×second×third = ${top3} (2 số âm nhỏ nhân lại thành số dương lớn) → answer = ${answer}.`, en: `minFirst×minSecond×first = ${bottom2top1} is LARGER than first×second×third = ${top3} (two very negative numbers multiply into a large positive) → answer = ${answer}.` }
      : { vi: `first×second×third = ${top3} ≥ minFirst×minSecond×first = ${bottom2top1} → answer = ${answer}.`, en: `first×second×third = ${top3} ≥ minFirst×minSecond×first = ${bottom2top1} → answer = ${answer}.` },
  };
  steps.push(fs);

  return { original: nums, answer, steps };
}

function fmtInf(v) {
  if (v === Infinity) return "+\u221E";
  if (v === -Infinity) return "-\u221E";
  return String(v);
}

/**
 * LeetCode 1464: Maximum Product of Two Elements in an Array.
 *
 * Track the largest and second-largest numbers in one pass. The answer uses
 * (first - 1) * (second - 1), so the visualization keeps the two chosen bars
 * marked as the scan updates them.
 */
function buildSteps1464(nums) {
  const steps = [];

  if (nums.length < 2) {
    steps.push({
      title: { vi: "Cần ít nhất 2 phần tử", en: "Need at least 2 elements" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "n", value: nums.length }],
      note: {
        vi: "Bài 1464 yêu cầu chọn 2 phần tử khác nhau, nên mảng phải có ít nhất 2 phần tử.",
        en: "Problem 1464 must choose 2 different elements, so the array needs at least 2 elements.",
      },
    });
    return { original: [...nums], answer: null, steps };
  }

  let first = 0;
  let second = 0;
  let firstIdx = -1;
  let secondIdx = -1;

  function selectedMarks() {
    return [firstIdx, secondIdx].filter((idx) => idx >= 0);
  }

  steps.push({
    title: { vi: "Khởi tạo 2 biến lớn nhất", en: "Initialize top two values" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "first", value: first },
      { name: "second", value: second },
    ],
    note: {
      vi: "Vì nums[i] là số dương, bắt đầu first = second = 0 rồi quét mảng một lần.",
      en: "Because nums[i] is positive, start first = second = 0 and scan the array once.",
    },
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];

    steps.push({
      title: { vi: `Xét nums[${i}] = ${num}`, en: `Check nums[${i}] = ${num}` },
      arr: [...nums],
      highlight: [i],
      mark: selectedMarks(),
      codeLines: [4],
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
        { name: "first", value: first },
        { name: "second", value: second },
      ],
      note: {
        vi: `So sánh num=${num} với first=${first} trước, rồi mới tới second=${second}.`,
        en: `Compare num=${num} with first=${first} first, then second=${second}.`,
      },
    });

    if (num > first) {
      const oldFirst = first;
      const oldFirstIdx = firstIdx;
      second = first;
      secondIdx = firstIdx;
      first = num;
      firstIdx = i;

      steps.push({
        title: { vi: `${num} trở thành first`, en: `${num} becomes first` },
        arr: [...nums],
        highlight: [i],
        mark: selectedMarks(),
        codeLines: [5, 6, 7],
        vars: [
          { name: "num", value: num },
          { name: "old first", value: oldFirst },
          { name: "first", value: first },
          { name: "second", value: second },
        ],
        note: {
          vi: `${num} > first cũ (${oldFirst}) → đẩy first cũ xuống second${oldFirstIdx >= 0 ? ` ở index ${oldFirstIdx}` : ""}, rồi first = ${num}.`,
          en: `${num} > old first (${oldFirst}) → move old first down to second${oldFirstIdx >= 0 ? ` at index ${oldFirstIdx}` : ""}, then first = ${num}.`,
        },
      });
    } else if (num > second) {
      second = num;
      secondIdx = i;

      steps.push({
        title: { vi: `${num} trở thành second`, en: `${num} becomes second` },
        arr: [...nums],
        highlight: [i],
        mark: selectedMarks(),
        codeLines: [8, 9],
        vars: [
          { name: "num", value: num },
          { name: "first", value: first },
          { name: "second", value: second },
        ],
        note: {
          vi: `${num} không vượt first=${first}, nhưng ${num} > second cũ → cập nhật second = ${num}.`,
          en: `${num} does not beat first=${first}, but ${num} > old second → update second = ${num}.`,
        },
      });
    } else {
      steps.push({
        title: { vi: `${num} không vào top 2`, en: `${num} stays outside top 2` },
        arr: [...nums],
        highlight: [i],
        mark: selectedMarks(),
        codeLines: [5, 8],
        vars: [
          { name: "num", value: num },
          { name: "first", value: first },
          { name: "second", value: second },
        ],
        note: {
          vi: `${num} <= first=${first} và ${num} <= second=${second}, nên top 2 không đổi.`,
          en: `${num} <= first=${first} and ${num} <= second=${second}, so the top two values stay unchanged.`,
        },
      });
    }
  }

  const answer = (first - 1) * (second - 1);
  steps.push({
    title: { vi: `Kết quả: (${first}-1)×(${second}-1) = ${answer}`, en: `Result: (${first}-1)×(${second}-1) = ${answer}` },
    arr: [...nums],
    highlight: [],
    mark: selectedMarks(),
    final: true,
    codeLines: [10],
    vars: [
      { name: "first", value: first },
      { name: "second", value: second },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Hai số lớn nhất là ${first} và ${second}. Trả về (${first}-1)×(${second}-1) = ${answer}.`,
      en: `The two largest values are ${first} and ${second}. Return (${first}-1)×(${second}-1) = ${answer}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 2091: Removing Minimum and Maximum From Array.
 *
 * Find the indices of the unique minimum and maximum, then compare the three
 * possible deletion plans: all from the front, all from the back, or one from
 * each end.
 */
function buildSteps2091(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const n = nums.length;
  const steps = [];

  if (n === 0) {
    steps.push({
      title: { vi: "Mảng rỗng", en: "Empty array" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "n", value: 0 }],
      note: { vi: "Không có phần tử để xóa.", en: "There are no elements to remove." },
    });
    return { original: [], answer: 0, steps };
  }

  let minIdx = 0;
  let maxIdx = 0;

  const idxSub = nums.map((_, i) => `[${i}]`);
  const marks = () => [...new Set([minIdx, maxIdx])];

  steps.push({
    title: { vi: "Khởi tạo min/max tại index 0", en: "Initialize min/max at index 0" },
    arr: [...nums],
    sub: idxSub,
    highlight: [0],
    mark: marks(),
    codeLines: [3],
    vars: [
      { name: "n", value: n },
      { name: "min_idx", value: minIdx },
      { name: "max_idx", value: maxIdx },
    ],
    note: {
      vi: "Mảng có các phần tử khác nhau, nên min và max cuối cùng sẽ có index duy nhất.",
      en: "All values are distinct, so the final min and max each have a unique index.",
    },
  });

  for (let i = 1; i < n; i++) {
    const oldMin = minIdx;
    const oldMax = maxIdx;
    if (nums[i] < nums[minIdx]) minIdx = i;
    if (nums[i] > nums[maxIdx]) maxIdx = i;
    const changedMin = minIdx !== oldMin;
    const changedMax = maxIdx !== oldMax;

    steps.push({
      title: {
        vi: `Xét nums[${i}] = ${nums[i]}`,
        en: `Check nums[${i}] = ${nums[i]}`,
      },
      arr: [...nums],
      sub: idxSub,
      highlight: [i],
      mark: marks(),
      codeLines: [5, 6, 7, 8, 9],
      vars: [
        { name: "i", value: i },
        { name: "min_idx", value: minIdx },
        { name: "nums[min_idx]", value: nums[minIdx] },
        { name: "max_idx", value: maxIdx },
        { name: "nums[max_idx]", value: nums[maxIdx] },
      ],
      note: {
        vi: changedMin
          ? `${nums[i]} nhỏ hơn min cũ ${nums[oldMin]} → cập nhật min_idx = ${i}.`
          : changedMax
            ? `${nums[i]} lớn hơn max cũ ${nums[oldMax]} → cập nhật max_idx = ${i}.`
            : `${nums[i]} không đổi min/max hiện tại.`,
        en: changedMin
          ? `${nums[i]} is smaller than old min ${nums[oldMin]} → update min_idx = ${i}.`
          : changedMax
            ? `${nums[i]} is larger than old max ${nums[oldMax]} → update max_idx = ${i}.`
            : `${nums[i]} does not change the current min/max.`,
      },
    });
  }

  let left = Math.min(minIdx, maxIdx);
  let right = Math.max(minIdx, maxIdx);
  steps.push({
    title: { vi: `Sắp xếp index: left=${left}, right=${right}`, en: `Order indices: left=${left}, right=${right}` },
    arr: [...nums],
    sub: idxSub,
    highlight: [left, right],
    mark: [left, right],
    codeLines: [10],
    vars: [
      { name: "min_idx", value: minIdx },
      { name: "max_idx", value: maxIdx },
      { name: "left", value: left },
      { name: "right", value: right },
    ],
    note: {
      vi: "Gọi left là index nhỏ hơn và right là index lớn hơn để viết công thức gọn.",
      en: "Let left be the smaller index and right be the larger index so the formulas stay simple.",
    },
  });

  const fromFront = right + 1;
  const fromBack = n - left;
  const bothEnds = left + 1 + n - right;
  const answer = Math.min(fromFront, fromBack, bothEnds);
  const bestPlan = answer === fromFront
    ? "front"
    : answer === fromBack
      ? "back"
      : "both";

  const plans = [
    {
      key: "front",
      value: fromFront,
      line: 11,
      highlight: Array.from({ length: right + 1 }, (_, i) => i),
      title: { vi: `Từ đầu: right + 1 = ${fromFront}`, en: `From front: right + 1 = ${fromFront}` },
      note: {
        vi: `Xóa từ đầu tới index ${right} sẽ chắc chắn xóa cả min và max.`,
        en: `Deleting from the front through index ${right} removes both min and max.`,
      },
    },
    {
      key: "back",
      value: fromBack,
      line: 12,
      highlight: Array.from({ length: n - left }, (_, i) => left + i),
      title: { vi: `Từ cuối: n - left = ${fromBack}`, en: `From back: n - left = ${fromBack}` },
      note: {
        vi: `Xóa từ cuối lùi về index ${left} sẽ chắc chắn xóa cả min và max.`,
        en: `Deleting from the back down to index ${left} removes both min and max.`,
      },
    },
    {
      key: "both",
      value: bothEnds,
      line: 13,
      highlight: [
        ...Array.from({ length: left + 1 }, (_, i) => i),
        ...Array.from({ length: n - right }, (_, i) => right + i),
      ],
      title: { vi: `Hai đầu: left + 1 + n - right = ${bothEnds}`, en: `Both ends: left + 1 + n - right = ${bothEnds}` },
      note: {
        vi: `Xóa một cực trị từ đầu và cực trị còn lại từ cuối: ${left + 1} + ${n - right}.`,
        en: `Delete one extreme from the front and the other from the back: ${left + 1} + ${n - right}.`,
      },
    },
  ];

  plans.forEach((plan) => {
    steps.push({
      title: plan.title,
      arr: [...nums],
      sub: idxSub,
      highlight: plan.highlight,
      mark: [left, right],
      codeLines: [plan.line],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "front", value: fromFront },
        { name: "back", value: fromBack },
        { name: "both", value: bothEnds },
      ],
      note: plan.note,
    });
  });

  steps.push({
    title: { vi: `Đáp án: min(${fromFront}, ${fromBack}, ${bothEnds}) = ${answer}`, en: `Answer: min(${fromFront}, ${fromBack}, ${bothEnds}) = ${answer}` },
    arr: [...nums],
    sub: idxSub,
    highlight: plans.find((plan) => plan.key === bestPlan).highlight,
    mark: [left, right],
    final: true,
    codeLines: [14],
    vars: [
      { name: "best plan", value: bestPlan },
      { name: "answer", value: answer },
    ],
    note: {
      vi: bestPlan === "front"
        ? `Cách ít nhất là xóa ${answer} phần tử từ đầu.`
        : bestPlan === "back"
          ? `Cách ít nhất là xóa ${answer} phần tử từ cuối.`
          : `Cách ít nhất là xóa từ cả hai đầu, tổng ${answer} phần tử.`,
      en: bestPlan === "front"
        ? `The minimum is deleting ${answer} element(s) from the front.`
        : bestPlan === "back"
          ? `The minimum is deleting ${answer} element(s) from the back.`
          : `The minimum is deleting from both ends, ${answer} element(s) total.`,
    },
  });

  return { original: nums, answer, steps };
}

/**
 * LeetCode 84: Largest Rectangle in Histogram.
 *
 * Given heights of bars in a histogram, find the area of the largest
 * rectangle that fits entirely within the histogram.
 *
 * Monotonic increasing stack of INDICES: as we scan left to right, whenever
 * the current bar is shorter than or equal to the bar at the stack top, we
 * POP that index and compute its rectangle. A shorter current bar supplies
 * the first blocking boundary on the right; an equal bar replaces an older
 * duplicate so the new index can represent the same height farther right.
 * A sentinel height of 0 appended at the end forces every remaining bar in
 * the stack to be popped and evaluated.
 */
function buildSteps84(inputHeights) {
  const heights = [...inputHeights];
  const n = heights.length;
  const bars = [...heights, 0];
  const sentinelIndex = n;
  const stack = [];
  const steps = [];
  let maxArea = 0;
  let bestRect = null;

  function stackLabel() {
    return `[${stack.map((index) => `${index}:${bars[index]}`).join(", ")}]`;
  }

  function addStep({
    event,
    phase,
    title,
    codeLines,
    note,
    currentIndex = null,
    poppedIndex = null,
    leftBoundary = null,
    rightBoundary = null,
    width = null,
    candidateHeight = null,
    candidateArea = null,
    previousMax = null,
    whileResult = null,
    improved = null,
    vars = [],
    final = false,
  }) {
    const highlight = new Set();
    if (Number.isInteger(currentIndex) && currentIndex < n) highlight.add(currentIndex);
    if (Number.isInteger(poppedIndex) && poppedIndex < n) highlight.add(poppedIndex);
    if (Number.isInteger(leftBoundary) && Number.isInteger(rightBoundary)) {
      for (let index = leftBoundary; index <= rightBoundary && index < n; index++) highlight.add(index);
    }
    const bestIndices = bestRect
      ? Array.from({ length: bestRect.right - bestRect.left + 1 }, (_, offset) => bestRect.left + offset)
      : [];

    steps.push({
      title,
      arr: [...heights],
      sub: heights.map((_, index) => `[${index}]`),
      highlight: [...highlight],
      mark: final ? bestIndices : [],
      final,
      codeLines,
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "max_area", value: maxArea },
        ...vars,
      ],
      note,
      histogramRectangleView: {
        event,
        phase,
        heights: [...heights],
        bars: [...bars],
        originalLength: n,
        sentinelIndex,
        stack: [...stack],
        currentIndex,
        currentHeight: Number.isInteger(currentIndex) ? bars[currentIndex] : null,
        poppedIndex,
        leftBoundary,
        rightBoundary,
        width,
        candidateHeight,
        candidateArea,
        previousMax,
        whileResult,
        improved,
        maxArea,
        bestRect: bestRect ? { ...bestRect } : null,
      },
    });
  }

  addStep({
    event: "init-stack",
    phase: "setup",
    title: { vi: "Khởi tạo stack rỗng", en: "Initialize an empty stack" },
    codeLines: [3],
    vars: [{ name: "heights", value: `[${heights.join(", ")}]` }],
    note: {
      vi: "stack lưu INDEX của các cột chưa tìm được biên phải. Chiều cao tại các index trong stack luôn tăng nghiêm ngặt từ đáy lên đỉnh.",
      en: "stack stores INDICES whose right boundary is still unknown. Their heights are strictly increasing from bottom to top.",
    },
  });

  addStep({
    event: "init-max",
    phase: "setup",
    title: { vi: "max_area = 0", en: "max_area = 0" },
    codeLines: [4],
    note: {
      vi: "Chưa tính hình chữ nhật nào nên diện tích lớn nhất ban đầu bằng 0.",
      en: "No rectangle has been evaluated yet, so the initial maximum is 0.",
    },
  });

  addStep({
    event: "add-sentinel",
    phase: "setup",
    title: { vi: `bars = heights + [0] → thêm sentinel tại index ${sentinelIndex}`, en: `bars = heights + [0] → append sentinel at index ${sentinelIndex}` },
    codeLines: [5],
    currentIndex: sentinelIndex,
    vars: [{ name: "bars", value: `[${bars.join(", ")}]` }],
    note: {
      vi: "Sentinel cao 0 buộc mọi cột còn lại bị pop ở cuối. Nó chỉ hỗ trợ thuật toán, không phải cột thật của histogram.",
      en: "The height-0 sentinel forces every remaining bar to be popped at the end. It is not a real histogram bar.",
    },
  });

  for (let i = 0; i < bars.length; i++) {
    addStep({
      event: "scan",
      phase: "scan",
      title: i === sentinelIndex
        ? { vi: `Duyệt sentinel i=${i}, height=0`, en: `Scan sentinel i=${i}, height=0` }
        : { vi: `Duyệt cột i=${i}, height=${bars[i]}`, en: `Scan bar i=${i}, height=${bars[i]}` },
      codeLines: [6],
      currentIndex: i,
      vars: [{ name: "i", value: i }, { name: "bars[i]", value: bars[i] }],
      note: i === sentinelIndex
        ? { vi: "Đã đến sentinel: điều kiện while sẽ lần lượt xả các index còn lại trong stack.", en: "The scan reached the sentinel, so the while loop will flush the remaining stack indices." }
        : { vi: `Bắt đầu xử lý cột ${i}; trước tiên so chiều cao ${bars[i]} với đỉnh stack.`, en: `Start processing bar ${i}; first compare height ${bars[i]} with the stack top.` },
    });

    while (true) {
      const topIndex = stack.length ? stack[stack.length - 1] : null;
      const shouldPop = topIndex !== null && bars[topIndex] >= bars[i];
      const equalHeight = shouldPop && bars[topIndex] === bars[i];

      addStep({
        event: "while-check",
        phase: "stack",
        title: { vi: `Kiểm tra while → ${shouldPop}`, en: `Evaluate while → ${shouldPop}` },
        codeLines: [7],
        currentIndex: i,
        poppedIndex: topIndex,
        whileResult: shouldPop,
        vars: topIndex === null
          ? [{ name: "condition", value: false }]
          : [
              { name: "stack[-1]", value: topIndex },
              { name: `bars[${topIndex}] >= bars[${i}]`, value: `${bars[topIndex]} >= ${bars[i]} → ${shouldPop}` },
            ],
        note: shouldPop
          ? equalHeight
            ? { vi: `Hai cột cùng cao ${bars[i]}. Pop index ${topIndex} để index ${i} mới đại diện cùng chiều cao nhưng có thể mở rộng xa hơn.`, en: `Both bars have height ${bars[i]}. Pop index ${topIndex} so the newer index ${i} represents that height and can extend farther.` }
            : { vi: `Cột hiện tại thấp hơn đỉnh stack (${bars[i]} < ${bars[topIndex]}), nên i=${i} là biên phải đầu tiên chặn cột ${topIndex}.`, en: `The current bar is shorter than the top (${bars[i]} < ${bars[topIndex]}), so i=${i} is the first right boundary blocking bar ${topIndex}.` }
          : topIndex === null
            ? { vi: "Stack rỗng nên điều kiện while sai; chuyển sang push i.", en: "The stack is empty, so the while condition is false; proceed to push i." }
            : { vi: `${bars[topIndex]} < ${bars[i]} nên chiều cao vẫn tăng; không pop.`, en: `${bars[topIndex]} < ${bars[i]}, so heights remain increasing; do not pop.` },
      });

      if (!shouldPop) break;

      const top = stack.pop();
      addStep({
        event: "pop",
        phase: "stack",
        title: { vi: `top = stack.pop() → ${top}`, en: `top = stack.pop() → ${top}` },
        codeLines: [8],
        currentIndex: i,
        poppedIndex: top,
        candidateHeight: bars[top],
        vars: [{ name: "top", value: top }, { name: "bars[top]", value: bars[top] }],
        note: {
          vi: `Pop index ${top}. Cột cao ${bars[top]} đã tìm được biên phải độc quyền là i=${i}; tiếp theo tìm biên trái từ đỉnh stack mới.`,
          en: `Pop index ${top}. Height ${bars[top]} now has exclusive right boundary i=${i}; next derive its left boundary from the new stack top.`,
        },
      });

      const newTop = stack.length ? stack[stack.length - 1] : null;
      const leftBoundary = newTop === null ? 0 : newTop + 1;
      const rightBoundary = i - 1;
      const width = i - (newTop === null ? -1 : newTop) - 1;
      addStep({
        event: "width",
        phase: "area",
        title: { vi: `Khoảng hợp lệ [${leftBoundary}..${rightBoundary}] → width=${width}`, en: `Valid span [${leftBoundary}..${rightBoundary}] → width=${width}` },
        codeLines: [9],
        currentIndex: i,
        poppedIndex: top,
        leftBoundary,
        rightBoundary,
        width,
        candidateHeight: bars[top],
        vars: [
          { name: "new stack top", value: newTop === null ? "empty" : `${newTop}:${bars[newTop]}` },
          { name: "left", value: leftBoundary },
          { name: "right", value: rightBoundary },
          { name: "width", value: width },
        ],
        note: newTop === null
          ? { vi: `Stack rỗng sau pop nên không có cột thấp hơn bên trái: width = i = ${i}.`, en: `The stack is empty after the pop, so no shorter bar exists on the left: width = i = ${i}.` }
          : { vi: `Đỉnh stack mới ${newTop} là cột thấp hơn gần nhất bên trái; không lấy hai biên nên width = ${i} - ${newTop} - 1 = ${width}.`, en: `New stack top ${newTop} is the nearest shorter bar on the left; exclude both boundaries: width = ${i} - ${newTop} - 1 = ${width}.` },
      });

      const candidateArea = bars[top] * width;
      const previousMax = maxArea;
      const improved = candidateArea > maxArea;
      if (improved) {
        maxArea = candidateArea;
        bestRect = {
          left: leftBoundary,
          right: rightBoundary,
          height: bars[top],
          width,
          area: candidateArea,
        };
      }
      addStep({
        event: "area",
        phase: "area",
        title: { vi: `area = ${bars[top]} × ${width} = ${candidateArea}; max_area = ${maxArea}`, en: `area = ${bars[top]} × ${width} = ${candidateArea}; max_area = ${maxArea}` },
        codeLines: [10],
        currentIndex: i,
        poppedIndex: top,
        leftBoundary,
        rightBoundary,
        width,
        candidateHeight: bars[top],
        candidateArea,
        previousMax,
        improved,
        vars: [
          { name: "height", value: bars[top] },
          { name: "width", value: width },
          { name: "area", value: candidateArea },
        ],
        note: improved
          ? { vi: `${candidateArea} > ${previousMax}, cập nhật hình tốt nhất thành [${leftBoundary}..${rightBoundary}], height=${bars[top]}, area=${candidateArea}.`, en: `${candidateArea} > ${previousMax}, so the best rectangle becomes [${leftBoundary}..${rightBoundary}], height=${bars[top]}, area=${candidateArea}.` }
          : { vi: `${candidateArea} ≤ ${previousMax}, giữ nguyên max_area=${maxArea}.`, en: `${candidateArea} ≤ ${previousMax}, so max_area remains ${maxArea}.` },
      });
    }

    stack.push(i);
    addStep({
      event: "push",
      phase: "stack",
      title: { vi: `stack.append(${i}) → ${stackLabel()}`, en: `stack.append(${i}) → ${stackLabel()}` },
      codeLines: [11],
      currentIndex: i,
      vars: [{ name: "i", value: i }],
      note: i === sentinelIndex
        ? { vi: `Đẩy sentinel index ${i}; đây là trạng thái stack thật khi vòng for kết thúc.`, en: `Push sentinel index ${i}; this is the real stack state when the for loop ends.` }
        : { vi: `Đẩy index ${i}. Từ đáy tới đỉnh, các chiều cao trong stack tiếp tục tăng nghiêm ngặt.`, en: `Push index ${i}. Heights in the stack remain strictly increasing from bottom to top.` },
    });
  }

  addStep({
    event: "done",
    phase: "done",
    title: { vi: `return max_area → ${maxArea}`, en: `return max_area → ${maxArea}` },
    codeLines: [12],
    final: true,
    leftBoundary: bestRect?.left ?? null,
    rightBoundary: bestRect?.right ?? null,
    width: bestRect?.width ?? null,
    candidateHeight: bestRect?.height ?? null,
    candidateArea: bestRect?.area ?? null,
    vars: bestRect
      ? [
          { name: "best range", value: `[${bestRect.left}, ${bestRect.right}]` },
          { name: "best height", value: bestRect.height },
          { name: "best width", value: bestRect.width },
          { name: "answer", value: maxArea },
        ]
      : [{ name: "answer", value: 0 }],
    note: bestRect
      ? {
          vi: `Hình chữ nhật lớn nhất phủ các cột ${bestRect.left}..${bestRect.right}, cao ${bestRect.height}, rộng ${bestRect.width}, diện tích ${bestRect.area}.`,
          en: `The largest rectangle spans bars ${bestRect.left}..${bestRect.right}, with height ${bestRect.height}, width ${bestRect.width}, and area ${bestRect.area}.`,
        }
      : { vi: "Histogram rỗng hoặc toàn cột cao 0 nên kết quả bằng 0.", en: "The histogram is empty or all bars have height 0, so the answer is 0." },
  });

  return { original: [...heights], answer: maxArea, steps };
}

/** LeetCode 85: Maximal Rectangle — row histograms + monotonic stack. */
function buildSteps85(input) {
  const matrix = String(input).split(/[;|]/).map((row) => row.trim()).filter(Boolean)
    .map((row) => (row.includes(",") ? row.split(",") : [...row]).map((cell) => String(cell).trim()));
  if (!matrix.length || !matrix[0].length) throw new Error("Enter a binary matrix, e.g. 1,0,1,0,0;1,0,1,1,1");
  if (!matrix.every((row) => row.length === matrix[0].length && row.every((cell) => cell === "0" || cell === "1"))) {
    throw new Error("Matrix must be rectangular and contain only 0/1.");
  }
  if (matrix.length > 8 || matrix[0].length > 8) throw new Error("Visualization for 85 supports matrices up to 8 x 8.");
  const rows = matrix.length;
  const cols = matrix[0].length;
  const heights = new Array(cols).fill(0);
  const steps = [];
  let maxArea = 0;
  let bestRect = null;

  function rectCells(rect) {
    if (!rect) return [];
    const cells = [];
    for (let r = rect.top; r <= rect.bottom; r++) {
      for (let c = rect.left; c <= rect.right; c++) cells.push([r, c]);
    }
    return cells;
  }

  function stackLabel(stack) {
    return `[${stack.map((i) => `${i}:${i < cols ? heights[i] : 0}`).join(", ")}]`;
  }

  function rectLabel(rect, fallback = "none") {
    return rect ? `rows ${rect.top}-${rect.bottom}, cols ${rect.left}-${rect.right}` : fallback;
  }

  function labelCells({ row, col, candidate, best, currentLabel }) {
    const labels = {};
    if (best) labels[`${best.top},${best.left}`] = { vi: "best", en: "best" };
    if (candidate) labels[`${candidate.top},${candidate.left}`] = { vi: "cand", en: "cand" };
    if (Number.isInteger(row) && Number.isInteger(col) && row < rows && col < cols) {
      labels[`${row},${col}`] = currentLabel || { vi: "đang xét", en: "current" };
    }
    return labels;
  }

  function push({
    title,
    codeLines,
    row = null,
    col = null,
    stack = [],
    popped = null,
    left = null,
    right = null,
    candidate = null,
    showBest = true,
    final = false,
    vars = [],
    note,
    caption,
    secondaryCaption,
    currentLabel,
  }) {
    const visibleRect = candidate || (showBest ? bestRect : null);
    const span = Number.isInteger(left) && Number.isInteger(right)
      ? Array.from({ length: Math.max(0, right - left + 1) }, (_, offset) => left + offset)
      : [];
    const gridStep = matrixStep2D(matrix, {
      title,
      codeLines,
      final,
      vars: [
        { name: "heights", value: `[${heights.join(",")}]` },
        { name: "stack", value: stackLabel(stack) },
        { name: "max_area", value: maxArea },
        ...vars,
      ],
      note,
      grid: {
        hlCell: Number.isInteger(row) && Number.isInteger(col) ? [row, col] : null,
        pathCells: rectCells(visibleRect),
        historyCells: Number.isInteger(row)
          ? Array.from({ length: row }, (_, r) => matrix[r].map((_, c) => [r, c])).flat()
          : [],
        cellLabels: labelCells({ row, col, candidate, best: showBest ? bestRect : null, currentLabel }),
        caption: caption || { vi: "Ma trận nhị phân", en: "Binary matrix" },
        secondaryCaption,
      },
    });
    gridStep.arr = [...heights];
    gridStep.sub = heights.map((_, index) => `[${index}]`);
    gridStep.highlight = [...span.filter((i) => i >= 0 && i < cols)];
    if (Number.isInteger(col) && col < cols) gridStep.highlight.push(col);
    if (Number.isInteger(popped) && popped < cols) gridStep.highlight.push(popped);
    gridStep.mark = final && bestRect ? Array.from({ length: bestRect.right - bestRect.left + 1 }, (_, offset) => bestRect.left + offset) : [];
    steps.push(gridStep);
  }

  push({
    title: { vi: "Khởi tạo heights = 0", en: "Initialize heights = 0" },
    codeLines: [3, 4, 5],
    vars: [{ name: "rows,cols", value: `${rows},${cols}` }],
    secondaryCaption: { vi: "heights[c] = số lượng 1 liên tiếp kết thúc tại hàng hiện tại.", en: "heights[c] = consecutive 1s ending at the current row." },
    note: { vi: "Mỗi hàng biến thành một histogram. Sau khi cập nhật heights của hàng r, bài toán trên hàng đó trở thành Largest Rectangle in Histogram.", en: "Each row becomes a histogram. After updating heights for row r, that row becomes a Largest Rectangle in Histogram problem." },
  });

  for (let r = 0; r < rows; r++) {
    push({
      title: { vi: `Bắt đầu hàng ${r}`, en: `Start row ${r}` },
      codeLines: [6],
      row: r,
      showBest: Boolean(bestRect),
      vars: [{ name: "row", value: r }],
      caption: { vi: `Cập nhật histogram cho hàng ${r}`, en: `Update histogram for row ${r}` },
      secondaryCaption: { vi: "Ô 1 kéo dài cột histogram; ô 0 cắt đứt cột đó.", en: "A 1 extends the histogram bar; a 0 resets that bar." },
      note: { vi: `Ta chỉ xét các rectangle có đáy nằm tại hàng ${r}.`, en: `Now consider rectangles whose bottom edge is row ${r}.` },
    });

    for (let c = 0; c < cols; c++) {
      const oldHeight = heights[c];
      heights[c] = matrix[r][c] === "1" ? heights[c] + 1 : 0;
      push({
        title: { vi: `heights[${c}]: ${oldHeight} → ${heights[c]}`, en: `heights[${c}]: ${oldHeight} → ${heights[c]}` },
        codeLines: [7, 8],
        row: r,
        col: c,
        vars: [
          { name: "matrix[r][c]", value: matrix[r][c] },
          { name: "old height", value: oldHeight },
          { name: "new height", value: heights[c] },
        ],
        currentLabel: { vi: matrix[r][c] === "1" ? "+1" : "reset", en: matrix[r][c] === "1" ? "+1" : "reset" },
        secondaryCaption: { vi: `Sau ô (${r},${c}), heights = [${heights.join(", ")}]`, en: `After cell (${r},${c}), heights = [${heights.join(", ")}]` },
        note: { vi: matrix[r][c] === "1" ? "Gặp 1 nên tăng chiều cao histogram ở cột này." : "Gặp 0 nên không rectangle toàn 1 nào đi xuyên qua ô này; reset về 0.", en: matrix[r][c] === "1" ? "A 1 extends this histogram bar." : "A 0 blocks any all-1 rectangle through this cell, so reset to 0." },
      });
    }

    const stack = [];
    const bars = [...heights, 0];
    push({
      title: { vi: `Xử lý histogram của hàng ${r}`, en: `Process row ${r}'s histogram` },
      codeLines: [9, 10],
      row: r,
      vars: [{ name: "row", value: r }],
      caption: { vi: `Histogram đáy ở hàng ${r}`, en: `Histogram ending at row ${r}` },
      secondaryCaption: { vi: `bars = heights + [0] = [${bars.join(", ")}]`, en: `bars = heights + [0] = [${bars.join(", ")}]` },
      note: { vi: "Thêm cột sentinel 0 ở cuối để xả stack và tính hết các rectangle còn mở.", en: "Append a sentinel 0 bar to flush the stack and evaluate all still-open rectangles." },
    });

    for (let i = 0; i <= cols; i++) {
      push({
        title: i === cols
          ? { vi: `Duyệt sentinel i=${i}`, en: `Scan sentinel i=${i}` }
          : { vi: `Duyệt cột i=${i}, height=${bars[i]}`, en: `Scan column i=${i}, height=${bars[i]}` },
        codeLines: [10],
        row: r,
        col: i < cols ? i : null,
        stack,
        showBest: Boolean(bestRect),
        vars: [{ name: "i", value: i === cols ? "sentinel" : i }, { name: "h", value: bars[i] }],
        secondaryCaption: i === cols
          ? { vi: "Sentinel height 0 buộc các cột còn lại bị pop.", en: "The height-0 sentinel forces remaining bars to pop." }
          : { vi: `So sánh height ${bars[i]} với đỉnh stack.`, en: `Compare height ${bars[i]} with the stack top.` },
        note: { vi: "Stack lưu index các cột có height tăng dần.", en: "The stack stores column indices in increasing height order." },
      });

      while (true) {
        const topIndex = stack.length ? stack[stack.length - 1] : null;
        const shouldPop = topIndex !== null && bars[topIndex] >= bars[i];
        push({
          title: { vi: `Kiểm tra while → ${shouldPop}`, en: `Evaluate while → ${shouldPop}` },
          codeLines: [11],
          row: r,
          col: i < cols ? i : null,
          stack,
          popped: topIndex,
          showBest: Boolean(bestRect),
          vars: topIndex === null
            ? [{ name: "condition", value: false }]
            : [
                { name: "stack[-1]", value: topIndex },
                { name: `bars[${topIndex}] >= h`, value: `${bars[topIndex]} >= ${bars[i]} → ${shouldPop}` },
              ],
          secondaryCaption: shouldPop
            ? { vi: "Current thấp hơn/bằng đỉnh stack, nên pop để chốt rectangle của đỉnh đó.", en: "Current is lower/equal to the stack top, so pop to close that top bar's rectangle." }
            : { vi: "Điều kiện sai, có thể push current vào stack.", en: "Condition is false, so current can be pushed." },
          note: shouldPop
            ? { vi: `Cột ${i === cols ? "sentinel" : i} là biên phải đầu tiên làm height ${bars[topIndex]} không thể kéo tiếp.`, en: `Column ${i === cols ? "sentinel" : i} is the first right boundary that blocks height ${bars[topIndex]}.` }
            : topIndex === null
              ? { vi: "Stack rỗng, không có gì để pop.", en: "The stack is empty; nothing to pop." }
              : { vi: `Height ${bars[topIndex]} < ${bars[i]}, stack vẫn tăng.`, en: `Height ${bars[topIndex]} < ${bars[i]}, so the stack remains increasing.` },
        });

        if (!shouldPop) break;

        const top = stack.pop();
        const height = bars[top];
        push({
          title: { vi: `top = stack.pop() → ${top}`, en: `top = stack.pop() → ${top}` },
          codeLines: [12],
          row: r,
          col: i < cols ? i : null,
          stack,
          popped: top,
          showBest: Boolean(bestRect),
          vars: [{ name: "top", value: top }, { name: "height", value: height }],
          secondaryCaption: { vi: `Cột ${top} cao ${height} đã có biên phải là ${i - 1}.`, en: `Column ${top} with height ${height} now has right boundary ${i - 1}.` },
          note: { vi: "Sau khi pop, đỉnh stack mới sẽ cho biết biên trái gần nhất thấp hơn height này.", en: "After popping, the new stack top gives the nearest lower left boundary for this height." },
        });

        const left = stack.length ? stack[stack.length - 1] + 1 : 0;
        const right = i - 1;
        const width = right - left + 1;
        const area = height * width;
        const candidate = height > 0 ? { top: r - height + 1, bottom: r, left, right } : null;
        push({
          title: { vi: `Rectangle ứng viên: ${height} × ${width} = ${area}`, en: `Candidate rectangle: ${height} × ${width} = ${area}` },
          codeLines: [13],
          row: r,
          col: i < cols ? i : null,
          stack,
          popped: top,
          left,
          right,
          candidate,
          showBest: Boolean(bestRect),
          vars: [
            { name: "left", value: left },
            { name: "right", value: right },
            { name: "width", value: width },
            { name: "height", value: height },
            { name: "area", value: area },
          ],
          caption: { vi: candidate ? "Rectangle ứng viên trên ma trận" : "Height 0 không tạo rectangle", en: candidate ? "Candidate rectangle on the matrix" : "Height 0 creates no rectangle" },
          secondaryCaption: candidate
            ? { vi: `${rectLabel(candidate)} → area ${area}`, en: `${rectLabel(candidate)} → area ${area}` }
            : { vi: "Sentinel height 0 chỉ dùng để xả stack.", en: "The height-0 sentinel is only used to flush the stack." },
          note: candidate
            ? { vi: `Vì đáy rectangle ở hàng ${r}, top = r - height + 1 = ${candidate.top}.`, en: `Because the rectangle bottom is row ${r}, top = r - height + 1 = ${candidate.top}.` }
            : { vi: "Không cập nhật best với rectangle rỗng.", en: "Do not update best with an empty rectangle." },
        });

        const previousBest = maxArea;
        if (area > maxArea) {
          maxArea = area;
          bestRect = candidate;
        }
        push({
          title: area > previousBest
            ? { vi: `Cập nhật best = ${maxArea}`, en: `Update best = ${maxArea}` }
            : { vi: `Giữ best = ${maxArea}`, en: `Keep best = ${maxArea}` },
          codeLines: [14],
          row: r,
          col: i < cols ? i : null,
          stack,
          popped: top,
          candidate,
          left,
          right,
          vars: [
            { name: "old best", value: previousBest },
            { name: "height", value: height },
            { name: "left..right", value: `${left}..${right}` },
            { name: "area", value: area },
            { name: "best rectangle", value: rectLabel(bestRect) },
          ],
          caption: { vi: "So sánh rectangle ứng viên với best hiện tại", en: "Compare candidate rectangle with current best" },
          secondaryCaption: area > previousBest
            ? { vi: `${area} > ${previousBest}, lưu rectangle mới.`, en: `${area} > ${previousBest}, store the new rectangle.` }
            : { vi: `${area} <= ${previousBest}, không đổi best.`, en: `${area} <= ${previousBest}, keep the existing best.` },
          note: area > previousBest
            ? { vi: `Best mới là ${rectLabel(bestRect)} với diện tích ${maxArea}.`, en: `The new best is ${rectLabel(bestRect)} with area ${maxArea}.` }
            : { vi: `Rectangle này không tốt hơn best hiện tại.`, en: `This rectangle does not improve the current best.` },
        });
      }

      stack.push(i);
      push({
        title: { vi: `Push cột ${i === cols ? "sentinel" : i}`, en: `Push ${i === cols ? "sentinel" : `column ${i}`}` },
        codeLines: [15],
        row: r,
        col: i < cols ? i : null,
        stack,
        showBest: Boolean(bestRect),
        vars: [{ name: "i", value: i === cols ? "sentinel" : i }],
        secondaryCaption: { vi: `stack = ${stackLabel(stack)}`, en: `stack = ${stackLabel(stack)}` },
        note: { vi: "Sau khi pop hết cột cao hơn/bằng, stack giữ index có chiều cao tăng dần.", en: "After popping every taller/equal bar, the stack keeps indices in increasing height order." },
      });
    }
  }

  push({
    title: { vi: `Diện tích lớn nhất = ${maxArea}`, en: `Largest area = ${maxArea}` },
    codeLines: [16],
    final: true,
    vars: [{ name: "best rectangle", value: rectLabel(bestRect) }, { name: "answer", value: maxArea }],
    caption: { vi: "Best rectangle cuối cùng", en: "Final best rectangle" },
    secondaryCaption: bestRect
      ? { vi: `${rectLabel(bestRect)} có area ${maxArea}.`, en: `${rectLabel(bestRect)} has area ${maxArea}.` }
      : { vi: "Không có ô 1 nào.", en: "No 1-cell exists." },
    note: { vi: "Hình chữ nhật tốt nhất được tô trên ma trận; histogram cuối hiển thị hàng cuối đã xử lý.", en: "The best rectangle is highlighted on the matrix; the histogram shows the last processed row." },
  });

  return { original: matrix, answer: maxArea, steps };
}

/**
 * LeetCode 42: Trapping Rain Water — two pointer approach.
 * left/right pointers move inward; left_max/right_max track the tallest wall
 * seen from each side. Water above a bar = (side max) - height[bar].
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def trap(self, height):
 *  3          if not height: return 0
 *  4          left, right = 0, len(height) - 1
 *  5          left_max, right_max = height[left], height[right]
 *  6          water = 0
 *  7          while left < right:
 *  8              if left_max < right_max:
 *  9                  left += 1
 * 10                  left_max = max(left_max, height[left])
 * 11                  water += left_max - height[left]
 * 12              else:
 * 13                  right -= 1
 * 14                  right_max = max(right_max, height[right])
 * 15                  water += right_max - height[right]
 * 16          return water
 */
function buildSteps42(input) {
  const height = Array.isArray(input)
    ? [...input]
    : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const n = height.length;
  const steps = [];
  const water = new Array(n).fill(0); // water[i] = units trapped above bar i

  if (n === 0) {
    steps.push({
      title: { vi: "Mảng rỗng → 0", en: "Empty array → 0" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Không có cột nào.", en: "No bars." },
    });
    return { original: height, answer: 0, steps };
  }

  // sub row shows how much water sits above each bar so far
  const makeSub = () => height.map((h, i) => (water[i] > 0 ? `💧${water[i]}` : ""));
  const makeView = ({
    left = -1,
    right = -1,
    leftMax = null,
    rightMax = null,
    current = -1,
    side = "",
    add = null,
    total = 0,
    decision = "",
    status = [],
  } = {}) => ({
    height: [...height],
    water: [...water],
    left,
    right,
    leftMax,
    rightMax,
    current,
    side,
    add,
    total,
    decision,
    status,
  });

  let left = 0;
  let right = n - 1;
  let leftMax = height[left];
  let rightMax = height[right];
  let total = 0;

  function pushTrapStep({
    title,
    codeLine,
    note,
    current = -1,
    side = "",
    add = null,
    decision = "",
    status = [],
    vars = [],
    mark = [],
  }) {
    steps.push({
      title,
      arr: [...height],
      sub: makeSub(),
      trappingRainView: makeView({
        left,
        right,
        leftMax,
        rightMax,
        current,
        side,
        add,
        total,
        decision,
        status,
      }),
      highlight: [left, right].filter((index) => index >= 0),
      mark,
      codeLines: [codeLine],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "left_max", value: leftMax },
        { name: "right_max", value: rightMax },
        { name: "water", value: total },
        ...vars,
      ],
      note,
    });
  }

  pushTrapStep({
    title: { vi: "Dòng 4 · đặt left/right", en: "Line 4 · set left/right" },
    codeLine: 4,
    decision: "left, right = 0, len(height) - 1",
    status: [{ label: "left", value: left }, { label: "right", value: right }],
    note: {
      vi: `Bắt đầu với left=0 và right=${right}, hai con trỏ đứng ở hai đầu mảng.`,
      en: `Start with left=0 and right=${right}, one pointer at each end.`,
    },
  });

  pushTrapStep({
    title: { vi: "Dòng 5 · đặt left_max/right_max", en: "Line 5 · set left_max/right_max" },
    codeLine: 5,
    decision: "left_max, right_max = height[left], height[right]",
    status: [{ label: "left_max", value: leftMax }, { label: "right_max", value: rightMax }],
    note: {
      vi: `left_max=${leftMax}, right_max=${rightMax}. Đây là tường cao nhất đã thấy từ mỗi phía.`,
      en: `left_max=${leftMax}, right_max=${rightMax}. These are the tallest walls seen from each side.`,
    },
  });

  pushTrapStep({
    title: { vi: "Dòng 6 · water = 0", en: "Line 6 · water = 0" },
    codeLine: 6,
    decision: "water = 0",
    status: [{ label: "water", value: total }],
    note: {
      vi: "Chưa xử lý cột nào nên tổng nước ban đầu là 0.",
      en: "No bar has been processed yet, so total water starts at 0.",
    },
  });

  while (left < right) {
    const useLeft = leftMax < rightMax;
    pushTrapStep({
      title: { vi: `Dòng 7 · ${left} < ${right}`, en: `Line 7 · ${left} < ${right}` },
      codeLine: 7,
      decision: "while left < right",
      status: [{ label: "left", value: left }, { label: "right", value: right }],
      note: {
        vi: "Vòng lặp tiếp tục vì hai con trỏ chưa gặp nhau.",
        en: "The loop continues because the two pointers have not met.",
      },
    });

    pushTrapStep({
      title: { vi: `Dòng 8 · ${leftMax} ${useLeft ? "<" : "≥"} ${rightMax}`, en: `Line 8 · ${leftMax} ${useLeft ? "<" : "≥"} ${rightMax}` },
      codeLine: 8,
      side: useLeft ? "left" : "right",
      decision: useLeft ? "left_max < right_max" : "left_max >= right_max",
      status: [
        { label: "left_max", value: leftMax },
        { label: "right_max", value: rightMax },
        { label: "branch", value: useLeft ? "left" : "right" },
      ],
      vars: [{ name: "condition", value: useLeft }],
      note: {
        vi: useLeft
          ? `Tường trái thấp hơn, nên xử lý cột bên trái.`
          : `Tường phải không cao hơn tường trái, nên xử lý cột bên phải.`,
        en: useLeft
          ? "The left wall is lower, so process the left side."
          : "The right wall is not higher than the left wall, so process the right side.",
      },
    });

    if (useLeft) {
      left += 1;
      pushTrapStep({
        title: { vi: `Dòng 9 · left = ${left}`, en: `Line 9 · left = ${left}` },
        codeLine: 9,
        current: left,
        side: "left",
        decision: "left += 1",
        status: [{ label: "height[left]", value: height[left] }],
        note: {
          vi: `Di chuyển left sang index ${left}.`,
          en: `Move left to index ${left}.`,
        },
      });

      leftMax = Math.max(leftMax, height[left]);
      pushTrapStep({
        title: { vi: `Dòng 10 · left_max = ${leftMax}`, en: `Line 10 · left_max = ${leftMax}` },
        codeLine: 10,
        current: left,
        side: "left",
        decision: `left_max = max(left_max, height[${left}])`,
        status: [{ label: "height[left]", value: height[left] }, { label: "left_max", value: leftMax }],
        note: {
          vi: `Cập nhật tường cao nhất bên trái sau khi thấy height[${left}] = ${height[left]}.`,
          en: `Update the tallest left wall after seeing height[${left}] = ${height[left]}.`,
        },
      });

      const add = leftMax - height[left];
      water[left] = add;
      total += add;
      pushTrapStep({
        title: { vi: `Dòng 11 · cộng ${add} nước`, en: `Line 11 · add ${add} water` },
        codeLine: 11,
        current: left,
        side: "left",
        add,
        decision: `water += ${leftMax} - ${height[left]}`,
        status: [{ label: "added", value: add }, { label: "total", value: total }],
        mark: add > 0 ? [left] : [],
        vars: [{ name: "water added", value: add }],
        note: {
          vi: `Nước trên cột ${left} = left_max - height[${left}] = ${leftMax} - ${height[left]} = ${add}. Tổng = ${total}.`,
          en: `Water above bar ${left} = left_max - height[${left}] = ${leftMax} - ${height[left]} = ${add}. Total = ${total}.`,
        },
      });
    } else {
      pushTrapStep({
        title: { vi: "Dòng 12 · vào else", en: "Line 12 · enter else" },
        codeLine: 12,
        side: "right",
        decision: "else",
        status: [{ label: "branch", value: "right" }],
        note: {
          vi: "Xử lý phía phải vì right_max là phía giới hạn.",
          en: "Process the right side because right_max is the limiting side.",
        },
      });

      right -= 1;
      pushTrapStep({
        title: { vi: `Dòng 13 · right = ${right}`, en: `Line 13 · right = ${right}` },
        codeLine: 13,
        current: right,
        side: "right",
        decision: "right -= 1",
        status: [{ label: "height[right]", value: height[right] }],
        note: {
          vi: `Di chuyển right sang index ${right}.`,
          en: `Move right to index ${right}.`,
        },
      });

      rightMax = Math.max(rightMax, height[right]);
      pushTrapStep({
        title: { vi: `Dòng 14 · right_max = ${rightMax}`, en: `Line 14 · right_max = ${rightMax}` },
        codeLine: 14,
        current: right,
        side: "right",
        decision: `right_max = max(right_max, height[${right}])`,
        status: [{ label: "height[right]", value: height[right] }, { label: "right_max", value: rightMax }],
        note: {
          vi: `Cập nhật tường cao nhất bên phải sau khi thấy height[${right}] = ${height[right]}.`,
          en: `Update the tallest right wall after seeing height[${right}] = ${height[right]}.`,
        },
      });

      const add = rightMax - height[right];
      water[right] = add;
      total += add;
      pushTrapStep({
        title: { vi: `Dòng 15 · cộng ${add} nước`, en: `Line 15 · add ${add} water` },
        codeLine: 15,
        current: right,
        side: "right",
        add,
        decision: `water += ${rightMax} - ${height[right]}`,
        status: [{ label: "added", value: add }, { label: "total", value: total }],
        mark: add > 0 ? [right] : [],
        vars: [{ name: "water added", value: add }],
        note: {
          vi: `Nước trên cột ${right} = right_max - height[${right}] = ${rightMax} - ${height[right]} = ${add}. Tổng = ${total}.`,
          en: `Water above bar ${right} = right_max - height[${right}] = ${rightMax} - ${height[right]} = ${add}. Total = ${total}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: `return water = ${total}`, en: `return water = ${total}` },
    arr: [...height],
    sub: makeSub(),
    trappingRainView: makeView({
      left,
      right,
      leftMax,
      rightMax,
      total,
      decision: "done",
      status: [{ label: "answer", value: total }],
    }),
    highlight: [],
    mark: water.map((w, i) => (w > 0 ? i : -1)).filter((x) => x >= 0),
    final: true,
    codeLines: [16],
    vars: [{ name: "answer (water)", value: total }],
    note: {
      vi: `Tổng lượng nước mưa giữ được = ${total} đơn vị. Các cột có nước được tô xanh.`,
      en: `Total trapped rain water = ${total} units. Bars holding water are highlighted.`,
    },
  });

  return { original: height, answer: total, steps };
}

/**
 * LeetCode 41: First Missing Positive — cyclic sort in place.
 * Put each value v in 1..n at index v-1. Then the first index i where
 * nums[i] != i+1 gives the answer i+1.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def firstMissingPositive(self, nums):
 *  3          n = len(nums)
 *  4          for i in range(n):
 *  5              while 1 <= nums[i] <= n and nums[nums[i]-1] != nums[i]:
 *  6                  target_index = nums[i] - 1
 *  7                  swap nums[i], nums[target_index]
 *  8          for i in range(n):
 *  9              if nums[i] != i + 1:
 * 10                  return i + 1
 * 11          return n + 1
 */
function buildSteps41(input) {
  const nums = Array.isArray(input)
    ? [...input]
    : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const n = nums.length;
  const steps = [];
  const arr = [...nums];
  let answer = n + 1;

  const makeView = (opts = {}) => ({
    phase: opts.phase || "place",
    values: [...arr],
    expected: arr.map((_, index) => index + 1),
    currentIndex: Number.isInteger(opts.currentIndex) ? opts.currentIndex : -1,
    targetIndex: Number.isInteger(opts.targetIndex) ? opts.targetIndex : -1,
    placedIndex: Number.isInteger(opts.placedIndex) ? opts.placedIndex : -1,
    scanIndex: Number.isInteger(opts.scanIndex) ? opts.scanIndex : -1,
    missingIndex: Number.isInteger(opts.missingIndex) ? opts.missingIndex : -1,
    correctIndices: arr.map((value, index) => value === index + 1 ? index : -1).filter((index) => index >= 0),
    ignoredIndices: arr.map((value, index) => value < 1 || value > n ? index : -1).filter((index) => index >= 0),
    duplicateIndices: arr.map((value, index) => (
      value >= 1 && value <= n && index !== value - 1 && arr[value - 1] === value ? index : -1
    )).filter((index) => index >= 0),
    action: opts.action || "",
    reason: opts.reason || "",
    answer: opts.answer,
  });

  const addStep = (opts) => {
    steps.push({
      title: opts.title,
      arr: [...arr],
      sub: arr.map((_, index) => `index ${index} wants ${index + 1}`),
      highlight: Number.isInteger(opts.currentIndex) ? [opts.currentIndex] : [],
      mark: arr.map((value, index) => value === index + 1 ? index : -1).filter((index) => index >= 0),
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      cyclicSortView: makeView(opts),
      final: !!opts.final,
    });
  };

  addStep({
    title: { vi: "Mỗi số x có một 'nhà' tại index x - 1", en: "Every value x has a home at index x - 1" },
    phase: "place", codeLines: [3],
    action: `valid homes: 1→index 0, 2→index 1, ..., ${n}→index ${Math.max(0, n - 1)}`,
    vars: [{ name: "n", value: n }, { name: "useful values", value: n ? `1..${n}` : "none" }, { name: "nums", value: `[${arr.join(", ")}]` }],
    note: {
      vi: `Với n=${n}, chỉ các số 1..${n} có ô riêng trong mảng. Số x phải nằm tại index x-1. Số ≤0 hoặc >n không thể ảnh hưởng đáp án nên sẽ bị bỏ qua.`,
      en: `With n=${n}, only values 1..${n} have a slot in the array. Value x belongs at index x-1. Values ≤0 or >n cannot affect the answer and are ignored.`,
    },
  });

  for (let i = 0; i < n; i++) {
    addStep({
      title: { vi: `for i=${i}: xử lý nums[${i}]`, en: `for i=${i}: process nums[${i}]` },
      phase: "place", currentIndex: i, codeLines: [4],
      action: `current index = ${i}, value = ${arr[i]}`,
      vars: [{ name: "i", value: i }, { name: "nums[i]", value: arr[i] }],
      note: { vi: `Giữ i=${i} cố định. while sẽ tiếp tục đổi cho đến khi giá trị mới tại nums[${i}] không cần hoặc không thể đổi nữa.`, en: `Keep i=${i} fixed. The while loop keeps swapping until the new value at nums[${i}] no longer needs or cannot be moved.` },
    });

    while (true) {
      const value = arr[i];
      const inRange = value >= 1 && value <= n;
      const targetIndex = inRange ? value - 1 : -1;
      const alreadyAtHome = inRange && targetIndex === i;
      const targetHasSameValue = inRange && arr[targetIndex] === value;
      const canSwap = inRange && !targetHasSameValue;
      let reason;
      if (!inRange) reason = "outside-range";
      else if (alreadyAtHome) reason = "already-correct";
      else if (targetHasSameValue) reason = "duplicate";
      else reason = "swap";

      addStep({
        title: canSwap
          ? { vi: `${value} phải về index ${targetIndex}`, en: `${value} belongs at index ${targetIndex}` }
          : { vi: `while dừng: ${reason}`, en: `while stops: ${reason}` },
        phase: "place", currentIndex: i, targetIndex, codeLines: canSwap ? [5, 6] : [5], reason,
        action: canSwap
          ? `target_index = ${value} - 1 = ${targetIndex}; nums[${targetIndex}] = ${arr[targetIndex]}`
          : reason === "outside-range"
            ? `${value} is outside 1..${n}`
            : reason === "already-correct"
              ? `${value} is already at index ${i}`
              : `index ${targetIndex} already contains ${value}`,
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value },
          { name: "in 1..n?", value: inRange },
          { name: "target_index", value: targetIndex >= 0 ? targetIndex : "N/A" },
          { name: "can swap?", value: canSwap },
        ],
        note: canSwap ? {
          vi: `Điều kiện while đúng: ${value} thuộc 1..${n} và ô đích index ${targetIndex} chưa chứa ${value}. Chuẩn bị đổi nums[${i}] với nums[${targetIndex}].`,
          en: `The while condition is true: ${value} is in 1..${n}, and target index ${targetIndex} does not yet contain ${value}. Prepare to swap nums[${i}] with nums[${targetIndex}].`,
        } : reason === "outside-range" ? {
          vi: `${value} không có 'nhà' trong mảng kích thước ${n}, nên bỏ qua.`,
          en: `${value} has no home in an array of length ${n}, so ignore it.`,
        } : reason === "already-correct" ? {
          vi: `${value} đã ở đúng index ${value - 1}; không cần đổi.`,
          en: `${value} is already at its home index ${value - 1}; no swap is needed.`,
        } : {
          vi: `Ô đích index ${targetIndex} đã có ${value}. Đây là bản sao dư nên không đổi, tránh vòng lặp vô hạn.`,
          en: `Target index ${targetIndex} already contains ${value}. This extra duplicate is not swapped, preventing an infinite loop.`,
        },
      });

      if (!canSwap) break;
      const displaced = arr[targetIndex];
      arr[targetIndex] = value;
      arr[i] = displaced;
      addStep({
        title: { vi: `Đổi ${value} ↔ ${displaced}`, en: `Swap ${value} ↔ ${displaced}` },
        phase: "place", currentIndex: i, targetIndex, placedIndex: targetIndex, codeLines: [7], reason: "swapped",
        action: `swap index ${i} and ${targetIndex} → ${value} is now home`,
        vars: [
          { name: "i", value: i },
          { name: "target_index", value: targetIndex },
          { name: "placed value", value },
          { name: "new nums[i]", value: arr[i] },
          { name: "nums", value: `[${arr.join(", ")}]` },
        ],
        note: {
          vi: `${value} đã về đúng 'nhà' index ${targetIndex}. i vẫn là ${i}; vòng while kiểm tra tiếp giá trị mới ${arr[i]} vừa bị đổi về đây.`,
          en: `${value} is now at its home index ${targetIndex}. i stays ${i}; the while loop next checks the displaced value ${arr[i]} now at this position.`,
        },
      });
    }
  }

  addStep({
    title: { vi: "Pha 2: quét từ trái sang phải", en: "Phase 2: scan from left to right" },
    phase: "scan", codeLines: [8], action: "find the first slot whose value does not match its expected value",
    vars: [{ name: "nums after placement", value: `[${arr.join(", ")}]` }],
    note: { vi: "Sau pha đặt chỗ, index i phải chứa i+1. Ô sai đầu tiên chính là số dương nhỏ nhất đang bị thiếu.", en: "After placement, index i should contain i+1. The first mismatched slot is exactly the smallest missing positive." },
  });

  for (let i = 0; i < n; i++) {
    const matches = arr[i] === i + 1;
    addStep({
      title: { vi: `index ${i}: ${arr[i]} ${matches ? "==" : "≠"} ${i + 1}`, en: `index ${i}: ${arr[i]} ${matches ? "==" : "≠"} ${i + 1}` },
      phase: "scan", currentIndex: i, scanIndex: i, missingIndex: matches ? -1 : i, codeLines: [8, 9], reason: matches ? "match" : "missing",
      action: `actual ${arr[i]} ${matches ? "==" : "!="} expected ${i + 1}`,
      vars: [{ name: "i", value: i }, { name: "nums[i]", value: arr[i] }, { name: "expected", value: i + 1 }, { name: "match?", value: matches }],
      note: matches
        ? { vi: `Số ${i + 1} có mặt đúng tại index ${i}; tiếp tục sang ô kế tiếp.`, en: `Value ${i + 1} is present at index ${i}; continue to the next slot.` }
        : { vi: `Index ${i} lẽ ra phải chứa ${i + 1}, nhưng đang chứa ${arr[i]}. Vậy ${i + 1} là số dương nhỏ nhất bị thiếu.`, en: `Index ${i} should contain ${i + 1}, but it contains ${arr[i]}. Therefore ${i + 1} is the smallest missing positive.` },
    });
    if (!matches) {
      answer = i + 1;
      addStep({
        title: { vi: `return ${answer}`, en: `return ${answer}` },
        phase: "answer", currentIndex: i, missingIndex: i, codeLines: [10], answer, final: true,
        action: `first mismatched slot → answer = ${answer}`,
        vars: [{ name: "answer", value: answer }, { name: "missing slot", value: i }],
        note: { vi: `${answer} là đáp án vì mọi số dương nhỏ hơn nó đã nằm đúng chỗ, còn ô dành cho ${answer} bị sai.`, en: `${answer} is the answer because every smaller positive is correctly placed, while the slot reserved for ${answer} is mismatched.` },
      });
      return { original: nums, answer, steps };
    }
  }

  addStep({
    title: { vi: `return n + 1 = ${n + 1}`, en: `return n + 1 = ${n + 1}` },
    phase: "answer", codeLines: [11], answer: n + 1, final: true,
    action: `all slots 1..${n} match → answer = ${n + 1}`,
    vars: [{ name: "n", value: n }, { name: "answer", value: n + 1 }],
    note: { vi: `Mọi số 1..${n} đều có mặt, nên số dương nhỏ nhất bị thiếu tiếp theo là ${n + 1}.`, en: `Every value 1..${n} is present, so the next smallest missing positive is ${n + 1}.` },
  });
  return { original: nums, answer: n + 1, steps };
}

/**
 * LeetCode 31: Next Permutation — find pivot, swap, reverse suffix.
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def nextPermutation(self, nums):
 *  3          i = n - 2
 *  4          while i >= 0 and nums[i] >= nums[i+1]: i -= 1
 *  5          if i >= 0:
 *  6              j = n - 1
 *  7              while nums[j] <= nums[i]: j -= 1
 *  8              nums[i], nums[j] = nums[j], nums[i]
 *  9          reverse(nums[i+1:])
 */
function buildSteps31(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const n = nums.length;
  const steps = [];

  steps.push({
    title: { vi: "Tìm pivot từ phải sang", en: "Find the pivot from the right" },
    arr: [...nums], sub: nums.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    codeLines: [3, 4],
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }],
    note: {
      vi:
        "Hoán vị kế tiếp: tìm i lớn nhất mà nums[i] < nums[i+1] (điểm 'giảm' đầu tiên từ phải).\n" +
        "Nếu không có → mảng đang giảm dần → hoán vị lớn nhất → đảo ngược thành nhỏ nhất.",
      en:
        "Next permutation: find the largest i with nums[i] < nums[i+1] (first 'ascent' from the right).\n" +
        "If none → array is descending → the largest permutation → reverse to the smallest.",
    },
  });

  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;

  steps.push({
    title: { vi: i >= 0 ? `Pivot tại i=${i} (nums[i]=${nums[i]})` : "Không có pivot (mảng giảm dần)", en: i >= 0 ? `Pivot at i=${i} (nums[i]=${nums[i]})` : "No pivot (descending array)" },
    arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
    highlight: i >= 0 ? [i, i + 1] : [], mark: i >= 0 ? [i] : [],
    codeLines: [4, 5],
    vars: [{ name: "i", value: i }],
    note: {
      vi: i >= 0
        ? `Tìm thấy pivot: nums[${i}]=${nums[i]} < nums[${i + 1}]=${nums[i + 1]}. Phần sau i đang giảm dần.`
        : `Không tìm thấy pivot → mảng đã là hoán vị lớn nhất. Đảo ngược toàn bộ.`,
      en: i >= 0
        ? `Pivot found: nums[${i}]=${nums[i]} < nums[${i + 1}]=${nums[i + 1]}. The suffix after i is descending.`
        : `No pivot found → the array is the largest permutation. Reverse everything.`,
    },
  });

  if (i >= 0) {
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;
    steps.push({
      title: { vi: `Tìm j=${j}: nums[j]=${nums[j]} là số nhỏ nhất > nums[i]`, en: `Find j=${j}: nums[j]=${nums[j]} is the smallest > nums[i]` },
      arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
      highlight: [i, j], mark: [j],
      codeLines: [6, 7],
      vars: [{ name: "i", value: i }, { name: "j", value: j }, { name: "nums[j]", value: nums[j] }],
      note: { vi: `Từ phải, tìm số đầu tiên > nums[${i}]=${nums[i]} → nums[${j}]=${nums[j]}.`, en: `From the right, find the first value > nums[${i}]=${nums[i]} → nums[${j}]=${nums[j]}.` },
    });
    [nums[i], nums[j]] = [nums[j], nums[i]];
    steps.push({
      title: { vi: `Swap nums[${i}] ↔ nums[${j}]`, en: `Swap nums[${i}] ↔ nums[${j}]` },
      arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
      highlight: [i, j], mark: [i],
      codeLines: [8],
      vars: [{ name: "nums", value: `[${nums.join(", ")}]` }],
      note: { vi: `Đổi chỗ để tăng vị trí i lên giá trị nhỏ nhất có thể lớn hơn.`, en: `Swap so position i increases to the smallest possible larger value.` },
    });
  }

  // reverse suffix
  let left = i + 1, right = n - 1;
  const suffix = [...Array(Math.max(0, n - (i + 1)))].map((_, k) => i + 1 + k);
  while (left < right) { [nums[left], nums[right]] = [nums[right], nums[left]]; left++; right--; }

  steps.push({
    title: { vi: `Đảo ngược phần sau i (từ ${i + 1})`, en: `Reverse the suffix after i (from ${i + 1})` },
    arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
    highlight: suffix, mark: suffix,
    final: true,
    codeLines: [9],
    vars: [{ name: "answer", value: `[${nums.join(", ")}]` }],
    note: {
      vi: `Đảo ngược đoạn sau i để nó tăng dần (nhỏ nhất). Kết quả: [${nums.join(", ")}].`,
      en: `Reverse the suffix so it becomes ascending (smallest). Result: [${nums.join(", ")}].`,
    },
  });

  return { original: input, answer: nums, steps };
}

/**
 * LeetCode 56: Merge Intervals — sort by start, merge overlaps.
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def merge(self, intervals):
 *  3          intervals.sort(key=lambda x: x[0])
 *  4          merged = []
 *  5          for start, end in intervals:
 *  6              if not merged or start > merged[-1][1]: merged.append([start, end])
 *  7              else: merged[-1][1] = max(merged[-1][1], end)
 *  8          return merged
 */
function buildSteps56(input, params) {
  // intervals: "1-3,2-6,8-10,15-18"
  const raw = params && params.intervals !== undefined ? String(params.intervals) : String(input);
  const intervals = raw.split(",").map((p) => p.trim()).filter(Boolean).map((p) => p.split("-").map((x) => Number(x.trim())));
  intervals.sort((a, b) => a[0] - b[0]);
  const steps = [];
  const merged = [];

  const fmt = (arr) => `[${arr.map(([s, e]) => `[${s},${e}]`).join(", ")}]`;

  steps.push({
    title: { vi: "Sắp xếp theo điểm bắt đầu", en: "Sort by start" },
    arr: [], highlight: [], mark: [],
    codeLines: [3, 4],
    vars: [{ name: "intervals (sorted)", value: fmt(intervals) }, { name: "merged", value: "[]" }],
    note: {
      vi: "Sắp các đoạn theo điểm bắt đầu tăng dần. Duyệt và gộp nếu chồng lấn với đoạn cuối trong merged.",
      en: "Sort intervals by start ascending. Scan and merge if overlapping the last interval in merged.",
    },
  });

  for (const [start, end] of intervals) {
    if (!merged.length || start > merged[merged.length - 1][1]) {
      merged.push([start, end]);
      steps.push({
        title: { vi: `[${start},${end}] không chồng → thêm mới`, en: `[${start},${end}] no overlap → append` },
        arr: [], highlight: [], mark: [],
        codeLines: [5, 6],
        vars: [{ name: "current", value: `[${start},${end}]` }, { name: "merged", value: fmt(merged) }],
        note: {
          vi: merged.length === 1
            ? `Đoạn đầu tiên → thêm [${start},${end}] vào merged.`
            : `start=${start} > end đoạn cuối=${merged[merged.length - 2] ? merged[merged.length - 2][1] : ""} → không chồng lấn → thêm đoạn mới.`,
          en: merged.length === 1
            ? `First interval → append [${start},${end}] to merged.`
            : `start=${start} > previous end → no overlap → append a new interval.`,
        },
      });
    } else {
      const old = merged[merged.length - 1][1];
      merged[merged.length - 1][1] = Math.max(old, end);
      steps.push({
        title: { vi: `[${start},${end}] chồng → mở rộng end → ${merged[merged.length - 1][1]}`, en: `[${start},${end}] overlaps → extend end → ${merged[merged.length - 1][1]}` },
        arr: [], highlight: [], mark: [],
        codeLines: [5, 7],
        vars: [{ name: "current", value: `[${start},${end}]` }, { name: "merged", value: fmt(merged) }],
        note: {
          vi: `start=${start} ≤ end đoạn cuối=${old} → chồng lấn → mở rộng end = max(${old}, ${end}) = ${merged[merged.length - 1][1]}.`,
          en: `start=${start} ≤ last end=${old} → overlap → extend end = max(${old}, ${end}) = ${merged[merged.length - 1][1]}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: `Kết quả: ${fmt(merged)}`, en: `Result: ${fmt(merged)}` },
    arr: [], highlight: [], mark: [], final: true,
    codeLines: [8],
    vars: [{ name: "answer", value: fmt(merged) }],
    note: { vi: `Các đoạn sau khi gộp: ${fmt(merged)}.`, en: `Intervals after merging: ${fmt(merged)}.` },
  });

  return { original: intervals, answer: merged, steps };
}

/** LeetCode 66: Plus One — add 1 with carry from the least significant digit. */
function buildSteps66(input) {
  const digits = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  steps.push({
    title: { vi: "Cộng 1 từ hàng đơn vị", en: "Add 1 from the least significant digit" },
    arr: [...digits], sub: digits.map((_, i) => `[${i}]`), highlight: [], mark: [],
    codeLines: [3],
    vars: [{ name: "digits", value: `[${digits.join(", ")}]` }],
    note: { vi: "Duyệt từ phải sang. Nếu chữ số < 9 → +1 và xong. Nếu = 9 → thành 0 và nhớ tiếp.", en: "Scan right to left. If a digit < 9 → +1 and done. If = 9 → becomes 0 and carry continues." },
  });
  let i = digits.length - 1;
  let done = false;
  while (i >= 0) {
    if (digits[i] < 9) {
      digits[i] += 1;
      steps.push({
        title: { vi: `digits[${i}]=${digits[i] - 1} < 9 → +1 = ${digits[i]}, xong`, en: `digits[${i}]=${digits[i] - 1} < 9 → +1 = ${digits[i]}, done` },
        arr: [...digits], sub: digits.map((_, x) => `[${x}]`), highlight: [i], mark: [i], final: true,
        codeLines: [4, 5],
        vars: [{ name: "i", value: i }, { name: "digits", value: `[${digits.join(", ")}]` }],
        note: { vi: `Chữ số này < 9 nên +1 và không còn nhớ → trả về ngay.`, en: `This digit < 9 so +1 with no carry → return immediately.` },
      });
      done = true;
      break;
    }
    digits[i] = 0;
    steps.push({
      title: { vi: `digits[${i}]=9 → 0, nhớ 1`, en: `digits[${i}]=9 → 0, carry 1` },
      arr: [...digits], sub: digits.map((_, x) => `[${x}]`), highlight: [i], mark: [],
      codeLines: [6],
      vars: [{ name: "i", value: i }, { name: "digits", value: `[${digits.join(", ")}]` }],
      note: { vi: `9 + 1 = 10 → đặt 0, nhớ 1 sang trái.`, en: `9 + 1 = 10 → set 0, carry 1 to the left.` },
    });
    i--;
  }
  let answer = digits;
  if (!done) {
    answer = [1, ...digits];
    steps.push({
      title: { vi: `Tất cả là 9 → thêm 1 ở đầu`, en: `All were 9 → prepend 1` },
      arr: [...answer], sub: answer.map((_, x) => `[${x}]`), highlight: [0], mark: [0], final: true,
      codeLines: [7],
      vars: [{ name: "answer", value: `[${answer.join(", ")}]` }],
      note: { vi: `Nhớ vượt ra ngoài → thêm 1 vào đầu (vd 999 → 1000).`, en: `Carry overflows → prepend 1 (e.g. 999 → 1000).` },
    });
  }
  return { original: input, answer, steps };
}

/** LeetCode 136: Single Number — XOR cancels pairs. */
function buildSteps136(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  let result = 0;
  steps.push({
    title: { vi: "result = 0", en: "result = 0" },
    arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [],
    codeLines: [3],
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }, { name: "result", value: 0 }],
    note: { vi: "XOR có tính: a^a=0 và a^0=a. Nên XOR mọi phần tử → các cặp triệt tiêu, còn lại số xuất hiện 1 lần.", en: "XOR properties: a^a=0 and a^0=a. XOR all elements → pairs cancel, leaving the single number." },
  });
  for (let i = 0; i < nums.length; i++) {
    const prev = result;
    result ^= nums[i];
    steps.push({
      title: { vi: `result ^= ${nums[i]} → ${result}`, en: `result ^= ${nums[i]} → ${result}` },
      arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i], mark: [],
      codeLines: [4, 5],
      vars: [{ name: "i", value: i }, { name: "nums[i]", value: nums[i] }, { name: "result", value: result }],
      note: { vi: `${prev} XOR ${nums[i]} = ${result}.`, en: `${prev} XOR ${nums[i]} = ${result}.` },
    });
  }
  steps.push({
    title: { vi: `Đáp án: ${result}`, en: `Answer: ${result}` },
    arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], final: true,
    codeLines: [6],
    vars: [{ name: "answer", value: result }],
    note: { vi: `Số xuất hiện đúng 1 lần = ${result}.`, en: `The number appearing once = ${result}.` },
  });
  return { original: nums, answer: result, steps };
}

/** LeetCode 169: Majority Element — Boyer-Moore voting. */
function buildSteps169(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  let count = 0, candidate = null;
  steps.push({
    title: { vi: "count = 0, candidate = None", en: "count = 0, candidate = None" },
    arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [],
    codeLines: [3],
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }, { name: "count", value: 0 }],
    note: { vi: "Boyer-Moore: ứng viên 'sống sót' nếu count > 0. Khi count=0 chọn ứng viên mới. Phần tử đa số (> n/2) luôn thắng.", en: "Boyer-Moore: a candidate survives while count > 0. When count=0, pick a new candidate. The majority element (> n/2) always wins." },
  });
  for (let i = 0; i < nums.length; i++) {
    if (count === 0) {
      candidate = nums[i];
      steps.push({
        title: { vi: `count=0 → candidate = ${candidate}`, en: `count=0 → candidate = ${candidate}` },
        arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i], mark: [i],
        codeLines: [4, 5],
        vars: [{ name: "i", value: i }, { name: "candidate", value: candidate }, { name: "count", value: 1 }],
        note: { vi: `count về 0 → chọn nums[${i}]=${candidate} làm ứng viên mới.`, en: `count hit 0 → pick nums[${i}]=${candidate} as the new candidate.` },
      });
    }
    count += nums[i] === candidate ? 1 : -1;
    steps.push({
      title: { vi: `nums[${i}]=${nums[i]} ${nums[i] === candidate ? "==" : "≠"} candidate → count=${count}`, en: `nums[${i}]=${nums[i]} ${nums[i] === candidate ? "==" : "≠"} candidate → count=${count}` },
      arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i], mark: [],
      codeLines: [6],
      vars: [{ name: "i", value: i }, { name: "candidate", value: candidate }, { name: "count", value: count }],
      note: { vi: `${nums[i] === candidate ? `Cùng ứng viên → count+1` : `Khác ứng viên → count-1`} = ${count}.`, en: `${nums[i] === candidate ? `Same as candidate → count+1` : `Different → count-1`} = ${count}.` },
    });
  }
  steps.push({
    title: { vi: `Đáp án: ${candidate}`, en: `Answer: ${candidate}` },
    arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], final: true,
    codeLines: [7],
    vars: [{ name: "answer", value: candidate }],
    note: { vi: `Phần tử đa số = ${candidate}.`, en: `Majority element = ${candidate}.` },
  });
  return { original: nums, answer: candidate, steps };
}

/** LeetCode 268: Missing Number — XOR of indices and values. */
function buildSteps268(input, params) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps268Sum(nums);
  const n = nums.length;
  const steps = [];
  const bits = Math.max(1, n.toString(2).length);
  const toBits = (value) => (value < 0 ? "-" : value.toString(2).padStart(bits, "0"));
  const seen = new Set();
  let result = n;

  const push = (opts) => {
    const board = Array.from({ length: n + 1 }, (_, num) => ({
      num,
      canceled: seen.has(num),
      current: num === opts.currentValue,
      isResult: Boolean(opts.final) && num === result,
    }));
    steps.push({
      title: opts.title,
      arr: [...nums],
      sub: nums.map((_, index) => `[${index}]`),
      highlight: Number.isInteger(opts.currentIndex) ? [opts.currentIndex] : [],
      mark: [],
      final: Boolean(opts.final),
      codeLines: [opts.line],
      vars: opts.vars || [],
      note: opts.note,
      missingNumberView: {
        method: "xor",
        nums: [...nums],
        n,
        phase: opts.phase || "fold",
        currentIndex: Number.isInteger(opts.currentIndex) ? opts.currentIndex : -1,
        pair: opts.pair || null,
        result,
        resultBits: toBits(result),
        bits,
        board,
        answer: opts.final ? result : null,
      },
    });
  };

  push({
    title: { vi: `result = n = ${n}`, en: `result = n = ${n}` },
    line: 3,
    phase: "init",
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }, { name: "n", value: n }, { name: "result", value: result }],
    note: {
      vi: `Số thiếu nằm trong [0, ${n}]. XOR mọi index 0..${n} với mọi giá trị: cặp bằng nhau triệt tiêu, chỉ còn số thiếu. Khởi tạo result = n vì index chỉ chạy 0..${n - 1}.`,
      en: `The missing number is in [0, ${n}]. XOR every index 0..${n} with every value: equal pairs cancel, leaving the missing number. Start result = n because indices only run 0..${n - 1}.`,
    },
  });

  for (let i = 0; i < n; i++) {
    const previous = result;
    result ^= i ^ nums[i];
    seen.add(nums[i]);
    push({
      title: { vi: `result ^= ${i} ^ ${nums[i]} → ${result}`, en: `result ^= ${i} ^ ${nums[i]} → ${result}` },
      line: 5,
      phase: "fold",
      currentIndex: i,
      currentValue: nums[i],
      pair: { index: i, value: nums[i], previous },
      vars: [
        { name: "i", value: i },
        { name: "num", value: nums[i] },
        { name: "result (bin)", value: `${result} = ${toBits(result)}₂` },
      ],
      note: {
        vi: `Gộp index ${i} và giá trị ${nums[i]}. Trên bảng 0..${n}, số ${nums[i]} đã xuất hiện như một giá trị nên bị triệt tiêu với index cùng tên. result: ${previous} → ${result}.`,
        en: `Fold in index ${i} and value ${nums[i]}. On the 0..${n} board, ${nums[i]} now appears as a value, so it cancels its matching index. result: ${previous} → ${result}.`,
      },
    });
  }

  push({
    title: { vi: `Đáp án: ${result}`, en: `Answer: ${result}` },
    line: 6,
    phase: "done",
    final: true,
    vars: [{ name: "answer", value: result }, { name: "answer (bin)", value: `${toBits(result)}₂` }],
    note: {
      vi: `Mọi số trong [0, ${n}] đều bị triệt tiêu trừ ${result} — số duy nhất không xuất hiện như một giá trị. Vậy số bị thiếu = ${result}.`,
      en: `Every number in [0, ${n}] cancels except ${result} — the only one that never appears as a value. So the missing number = ${result}.`,
    },
  });
  return { original: nums, answer: result, steps };
}

/** LeetCode 268 Approach 2: Missing Number — Gauss sum (expected − actual). */
function buildSteps268Sum(nums) {
  const n = nums.length;
  const steps = [];
  const expectedSum = (n * (n + 1)) / 2;
  const summed = new Set();
  let actualSum = 0;

  const push = (opts) => {
    const board = Array.from({ length: n + 1 }, (_, num) => ({
      num,
      canceled: summed.has(num),
      current: num === opts.currentValue,
      isResult: Boolean(opts.final) && num === opts.answer,
    }));
    steps.push({
      title: opts.title,
      arr: [...nums],
      sub: nums.map((_, index) => `[${index}]`),
      highlight: Number.isInteger(opts.currentIndex) ? [opts.currentIndex] : [],
      mark: [],
      final: Boolean(opts.final),
      codeBlock: 2,
      codeLines: [opts.line],
      vars: opts.vars || [],
      note: opts.note,
      missingNumberView: {
        method: "sum",
        nums: [...nums],
        n,
        phase: opts.phase || "actual",
        currentIndex: Number.isInteger(opts.currentIndex) ? opts.currentIndex : -1,
        expectedSum,
        actualSum,
        expectedReady: opts.expectedReady !== false,
        actualReady: Boolean(opts.actualReady),
        missing: opts.missing === undefined ? null : opts.missing,
        board,
        answer: opts.final ? opts.answer : null,
      },
    });
  };

  push({
    title: { vi: `expected_sum = 0+1+…+${n} = ${expectedSum}`, en: `expected_sum = 0+1+…+${n} = ${expectedSum}` },
    line: 3,
    phase: "expected",
    note: {
      vi: `Nếu không thiếu số nào, tổng của 0..${n} phải bằng ${expectedSum} (công thức Gauss n·(n+1)/2).`,
      en: `If nothing were missing, the sum of 0..${n} would be ${expectedSum} (Gauss formula n·(n+1)/2).`,
    },
  });

  for (let i = 0; i < n; i++) {
    actualSum += nums[i];
    summed.add(nums[i]);
    push({
      title: { vi: `actual_sum += ${nums[i]} → ${actualSum}`, en: `actual_sum += ${nums[i]} → ${actualSum}` },
      line: 4,
      phase: "actual",
      currentIndex: i,
      currentValue: nums[i],
      vars: [
        { name: "i", value: i },
        { name: "num", value: nums[i] },
        { name: "actual_sum", value: actualSum },
      ],
      note: {
        vi: `Cộng dồn giá trị thực tế. Trên bảng 0..${n}, số ${nums[i]} đã có mặt trong nums.`,
        en: `Accumulate the actual values. On the 0..${n} board, ${nums[i]} is present in nums.`,
      },
    });
  }

  const missing = expectedSum - actualSum;
  push({
    title: { vi: `missing = ${expectedSum} − ${actualSum} = ${missing}`, en: `missing = ${expectedSum} − ${actualSum} = ${missing}` },
    line: 5,
    phase: "diff",
    actualReady: true,
    missing,
    vars: [
      { name: "expected_sum", value: expectedSum },
      { name: "actual_sum", value: actualSum },
      { name: "missing_num", value: missing },
    ],
    note: {
      vi: `Chênh lệch giữa tổng mong đợi và tổng thực tế chính là số bị thiếu: ${expectedSum} − ${actualSum} = ${missing}.`,
      en: `The gap between the expected and actual sums is exactly the missing number: ${expectedSum} − ${actualSum} = ${missing}.`,
    },
  });

  push({
    title: { vi: `Đáp án: ${missing}`, en: `Answer: ${missing}` },
    line: 6,
    phase: "done",
    final: true,
    actualReady: true,
    missing,
    answer: missing,
    vars: [{ name: "answer", value: missing }],
    note: {
      vi: `Số duy nhất trong [0, ${n}] không được cộng vào actual_sum là ${missing}.`,
      en: `The only number in [0, ${n}] never added to actual_sum is ${missing}.`,
    },
  });

  return { original: nums, answer: missing, steps };
}

/** LeetCode 1386: Cinema Seat Allocation — greedy per row over 3 group windows. */
function buildSteps1386(input, params) {
  const n = Number(Array.isArray(input) ? input[0] : input) || 1;
  const reservedRaw = String((params && params.reserved) || "").trim();
  const reservedByRow = new Map(); // row → Set of seat columns
  if (reservedRaw) {
    for (const token of reservedRaw.split(";")) {
      const [rowStr, colStr] = token.split(",");
      const row = Number(String(rowStr).trim());
      const col = Number(String(colStr).trim());
      if (!Number.isInteger(row) || !Number.isInteger(col)) continue;
      if (row < 1 || row > n || col < 1 || col > 10) continue;
      if (!reservedByRow.has(row)) reservedByRow.set(row, new Set());
      reservedByRow.get(row).add(col);
    }
  }

  const steps = [];
  let answer = 0;
  const reservedRows = [...reservedByRow.keys()].sort((a, b) => a - b);
  const emptyRows = n - reservedRows.length;

  const seatBoard = (reservedSet, chosen) => {
    // chosen: array of {name, cols}
    const chosenCols = new Map();
    (chosen || []).forEach((g) => g.cols.forEach((c) => chosenCols.set(c, g.name)));
    return Array.from({ length: 10 }, (_, idx) => {
      const col = idx + 1;
      return {
        col,
        reserved: reservedSet ? reservedSet.has(col) : false,
        group: chosenCols.get(col) || null,
        aisle: col === 1 || col === 10,
      };
    });
  };

  const push = (meta, step) => {
    steps.push(Object.assign({}, step, {
      cinemaSeatView: {
        n,
        emptyRows,
        emptyContribution: emptyRows * 2,
        reservedRowCount: reservedRows.length,
        phase: meta.phase || "",
        currentRow: meta.currentRow ?? null,
        seats: meta.seats || null,
        windows: meta.windows || null,
        chosen: meta.chosen || [],
        rowGroups: meta.rowGroups ?? null,
        answer,
        final: Boolean(meta.final),
      },
    }));
  };

  push({ phase: "intro" }, {
    title: { vi: "Cinema Seat Allocation", en: "Cinema Seat Allocation" },
    arr: [],
    highlight: [], mark: [],
    codeLines: [4],
    vars: [
      { name: "n (số hàng)", value: n },
      { name: "hàng có ghế đặt", value: reservedRows.length ? `[${reservedRows.join(", ")}]` : "không" },
    ],
    note: {
      vi: "Mỗi nhóm 4 người cần 4 ghế liền kề. Ghế 1 và 10 sát lối đi nên không thuộc nhóm nào. Chỉ có 3 cửa sổ nhóm: ghế 2–5, 6–9 và 4–7 (cửa sổ giữa dùng khi hai bên bị chặn).",
      en: "Each 4-person group needs 4 adjacent seats. Seats 1 and 10 are next to the aisle and belong to no group. Only 3 group windows exist: seats 2–5, 6–9, and 4–7 (the middle window is used when both sides are blocked).",
    },
  });

  if (emptyRows > 0) {
    push({ phase: "empty" }, {
      title: { vi: `${emptyRows} hàng trống → +${emptyRows * 2}`, en: `${emptyRows} empty rows → +${emptyRows * 2}` },
      arr: [],
      highlight: [], mark: [],
      codeLines: [7],
      vars: [
        { name: "hàng trống", value: emptyRows },
        { name: "mỗi hàng", value: "2 nhóm (2–5 và 6–9)" },
      ],
      note: {
        vi: `Có ${emptyRows} hàng không có ghế nào bị đặt. Mỗi hàng như vậy xếp được 2 nhóm (2–5 và 6–9), cộng ${emptyRows * 2} nhóm.`,
        en: `${emptyRows} rows have no reserved seats. Each such row fits 2 groups (2–5 and 6–9), adding ${emptyRows * 2} groups.`,
      },
    });
    answer += emptyRows * 2;
  }

  for (const row of reservedRows) {
    const reserved = reservedByRow.get(row);
    const leftFree = ![2, 3, 4, 5].some((c) => reserved.has(c));
    const rightFree = ![6, 7, 8, 9].some((c) => reserved.has(c));
    const midFree = ![4, 5, 6, 7].some((c) => reserved.has(c));

    push({ phase: "inspect", currentRow: row, seats: seatBoard(reserved, []), windows: { left: leftFree, right: rightFree, mid: midFree } }, {
      title: { vi: `Hàng ${row}: kiểm tra 3 cửa sổ`, en: `Row ${row}: check the 3 windows` },
      arr: [],
      highlight: [], mark: [],
      codeLines: [9, 10, 11],
      vars: [
        { name: "hàng", value: row },
        { name: "ghế đã đặt", value: `[${[...reserved].sort((a, b) => a - b).join(", ")}]` },
        { name: "2–5 trống?", value: leftFree ? "có" : "không" },
        { name: "6–9 trống?", value: rightFree ? "có" : "không" },
        { name: "4–7 trống?", value: midFree ? "có" : "không" },
      ],
      note: {
        vi: `Hàng ${row} có ghế đặt tại [${[...reserved].sort((a, b) => a - b).join(", ")}]. Xét từng cửa sổ: 2–5 ${leftFree ? "trống" : "bị chặn"}, 6–9 ${rightFree ? "trống" : "bị chặn"}, 4–7 ${midFree ? "trống" : "bị chặn"}.`,
        en: `Row ${row} has reserved seats [${[...reserved].sort((a, b) => a - b).join(", ")}]. Check each window: 2–5 ${leftFree ? "free" : "blocked"}, 6–9 ${rightFree ? "free" : "blocked"}, 4–7 ${midFree ? "free" : "blocked"}.`,
      },
    });

    let chosen = [];
    let rowGroups = 0;
    if (leftFree && rightFree) {
      chosen = [{ name: "left", cols: [2, 3, 4, 5] }, { name: "right", cols: [6, 7, 8, 9] }];
      rowGroups = 2;
    } else if (midFree) {
      chosen = [{ name: "mid", cols: [4, 5, 6, 7] }];
      rowGroups = 1;
    } else if (leftFree) {
      chosen = [{ name: "left", cols: [2, 3, 4, 5] }];
      rowGroups = 1;
    } else if (rightFree) {
      chosen = [{ name: "right", cols: [6, 7, 8, 9] }];
      rowGroups = 1;
    }
    answer += rowGroups;

    const reasonVi = rowGroups === 2
      ? "Cả 2–5 và 6–9 đều trống → xếp 2 nhóm."
      : rowGroups === 1 && chosen[0].name === "mid"
        ? "Hai bên bị chặn nhưng 4–7 trống → xếp 1 nhóm ở giữa."
        : rowGroups === 1
          ? `Chỉ ${chosen[0].name === "left" ? "2–5" : "6–9"} trống → xếp 1 nhóm.`
          : "Không cửa sổ nào trống → 0 nhóm.";
    const reasonEn = rowGroups === 2
      ? "Both 2–5 and 6–9 are free → place 2 groups."
      : rowGroups === 1 && chosen[0].name === "mid"
        ? "Both sides blocked but 4–7 is free → place 1 middle group."
        : rowGroups === 1
          ? `Only ${chosen[0].name === "left" ? "2–5" : "6–9"} is free → place 1 group.`
          : "No window is free → 0 groups.";

    push({ phase: "assign", currentRow: row, seats: seatBoard(reserved, chosen), windows: { left: leftFree, right: rightFree, mid: midFree }, chosen, rowGroups }, {
      title: { vi: `Hàng ${row}: +${rowGroups} nhóm`, en: `Row ${row}: +${rowGroups} groups` },
      arr: [],
      highlight: [], mark: [],
      codeLines: [12],
      vars: [
        { name: "hàng", value: row },
        { name: "nhóm hàng này", value: rowGroups },
        { name: "tổng hiện tại", value: answer },
      ],
      note: { vi: reasonVi, en: reasonEn },
    });
  }

  push({ phase: "done", final: true }, {
    title: { vi: `Đáp án: ${answer} nhóm`, en: `Answer: ${answer} groups` },
    arr: [],
    highlight: [], mark: [],
    final: true,
    codeLines: [13],
    vars: [
      { name: "hàng trống × 2", value: emptyRows * 2 },
      { name: "cộng từ hàng có ghế đặt", value: answer - emptyRows * 2 },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Tổng số nhóm 4 người tối đa = ${emptyRows * 2} (từ ${emptyRows} hàng trống) + ${answer - emptyRows * 2} (từ các hàng có ghế đặt) = ${answer}.`,
      en: `Maximum number of 4-person groups = ${emptyRows * 2} (from ${emptyRows} empty rows) + ${answer - emptyRows * 2} (from reserved rows) = ${answer}.`,
    },
  });

  return { original: n, answer, steps };
}

function parseMatrix(input) {
  return String(input).split(/[;|]/).map((r) => r.trim()).filter(Boolean).map((r) => r.split(",").map((v) => Number(v.trim())));
}

const twoDArrayTag = { key: "2d-array", vi: "Mảng 2D", en: "2D Array" };

function parseIntegerMatrix2D(input) {
  const matrix = parseMatrix(input);
  if (!matrix.length || !matrix[0].length || !matrix.every((row) => row.length === matrix[0].length && row.every(Number.isInteger))) {
    throw new Error("enter a non-empty rectangular integer matrix, e.g. 1,2;3,4");
  }
  return matrix;
}

function cloneMatrix2D(matrix) {
  return matrix.map((row) => [...row]);
}

function blankMatrix2D(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill("·"));
}

function matrixGrid2D(matrix, options = {}) {
  const safe = matrix.length && matrix[0].length ? matrix : [["·"]];
  return {
    dp: safe.map((row) => row.map((value) => value === null || value === undefined ? "·" : value)),
    text1: " ".repeat(safe.length),
    text2: " ".repeat(safe[0].length),
    largeCells: true,
    ...options,
  };
}

function matrixStep2D(matrix, { title, codeLines = [], vars = [], note, final = false, grid = {} }) {
  return {
    title,
    arr: [],
    highlight: [],
    mark: [],
    final,
    codeLines,
    vars,
    note,
    grid: matrixGrid2D(matrix, grid),
  };
}

/** LeetCode 422: Valid Word Square. */
function buildSteps422(input) {
  const words = String(input).split(",").map((word) => word.trim()).filter(Boolean);
  if (!words.length) throw new Error("enter words separated by commas, e.g. ball,area,lead,lady");
  const width = Math.max(...words.map((word) => word.length));
  const board = words.map((word) => Array.from({ length: width }, (_, col) => word[col] || "·"));
  const steps = [];
  const push = (details) => steps.push(matrixStep2D(board, details));

  push({ title: { vi: "Bắt đầu kiểm tra word square", en: "Start checking the word square" }, codeLines: [2], vars: [{ name: "words", value: `[${words.join(", ")}]` }], note: { vi: "Word square hợp lệ khi ô (r,c) bằng ô đối xứng (c,r).", en: "A word square is valid when cell (r,c) equals its mirrored cell (c,r)." }, grid: { caption: "words[r][c] must equal words[c][r]" } });
  for (let r = 0; r < words.length; r++) {
    push({ title: { vi: `Duyệt hàng r=${r}`, en: `Visit row r=${r}` }, codeLines: [3], vars: [{ name: "r", value: r }, { name: "word", value: words[r] }], note: { vi: "Lấy từng từ làm một hàng của hình vuông.", en: "Treat each word as one row of the square." }, grid: { pathCells: [[r, 0]], caption: "Outer loop" } });
    for (let c = 0; c < words[r].length; c++) {
      const ch = words[r][c];
      const mirroredExists = c < words.length && r < words[c].length;
      const mirroredValue = mirroredExists ? words[c][r] : "missing";
      const same = mirroredExists && ch === mirroredValue;
      push({ title: { vi: `Duyệt ô (${r},${c})`, en: `Visit cell (${r},${c})` }, codeLines: [4], vars: [{ name: "c", value: c }, { name: "ch", value: ch }], note: { vi: "Lấy ký tự hiện tại để so với ô đối xứng.", en: "Read the current character before checking its mirror." }, grid: { hlCell: [r, c], pathCells: [], caption: "Inner loop" } });
      push({ title: { vi: `Kiểm tra ô đối xứng (${c},${r}) có tồn tại không`, en: `Check whether mirror (${c},${r}) exists` }, codeLines: [5], vars: [{ name: "c >= len(words)", value: c >= words.length }, { name: "r >= len(words[c])", value: c < words.length ? r >= words[c].length : "skipped" }], note: { vi: mirroredExists ? "Ô đối xứng tồn tại, tiếp tục so sánh ký tự." : "Ô đối xứng bị thiếu nên không thể là word square.", en: mirroredExists ? "The mirrored cell exists, so compare characters next." : "The mirrored cell is missing, so this is not a valid word square." }, grid: { hlCell: [r, c], pathCells: mirroredExists ? [[c, r]] : [], caption: "Bounds check" } });
      if (!mirroredExists) {
        push({ title: { vi: `Thiếu ô đối xứng tại (${c},${r})`, en: `Missing mirror at (${c},${r})` }, codeLines: [6], final: true, vars: [{ name: "words[r][c]", value: ch }, { name: "words[c][r]", value: "missing" }, { name: "valid", value: false }], note: { vi: `words[${c}] không có index ${r} → return False.`, en: `words[${c}] has no index ${r} → return False.` }, grid: { hlCell: [r, c], pathCells: [], caption: "Return False" } });
        return { original: words, answer: false, steps };
      }
      push({ title: { vi: `So sánh '${ch}' với '${mirroredValue}'`, en: `Compare '${ch}' with '${mirroredValue}'` }, codeLines: [7], vars: [{ name: "ch", value: ch }, { name: "words[c][r]", value: mirroredValue }, { name: "match", value: same }], note: { vi: same ? "Hai ký tự bằng nhau, tiếp tục." : "Hai ký tự khác nhau nên không hợp lệ.", en: same ? "The characters match, so continue." : "The characters differ, so this is invalid." }, grid: { hlCell: [r, c], pathCells: [[c, r]], caption: "Character compare" } });
      if (!same) {
        push({ title: { vi: `Lệch tại (${r},${c})`, en: `Mismatch at (${r},${c})` }, codeLines: [8], final: true, vars: [{ name: "words[r][c]", value: ch }, { name: "words[c][r]", value: mirroredValue }, { name: "valid", value: false }], note: { vi: `words[${r}][${c}] != words[${c}][${r}] → return False.`, en: `words[${r}][${c}] != words[${c}][${r}] → return False.` }, grid: { hlCell: [r, c], pathCells: [[c, r]], caption: "Return False" } });
        return { original: words, answer: false, steps };
      }
    }
  }
  push({ title: { vi: "Tất cả ô đều đối xứng", en: "All cells are symmetric" }, codeLines: [9], final: true, vars: [{ name: "valid", value: true }], note: { vi: "Mọi cặp (r,c) và (c,r) đều bằng nhau → True.", en: "Every pair (r,c) and (c,r) matches → True." }, grid: { caption: "Valid word square" } });
  return { original: words, answer: true, steps };
}

/** LeetCode 566: Reshape the Matrix. */
function buildSteps566(input, params = {}) {
  const matrix = parseIntegerMatrix2D(input);
  const rows = Number(params.r);
  const cols = Number(params.c);
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) throw new Error("r and c must be positive integers");
  const total = matrix.length * matrix[0].length;
  const steps = [];
  steps.push(matrixStep2D(matrix, { title: { vi: "Đọc ma trận nguồn", en: "Read the source matrix" }, codeLines: [3], vars: [{ name: "source shape", value: `${matrix.length}×${matrix[0].length}` }, { name: "target shape", value: `${rows}×${cols}` }, { name: "cells", value: total }], note: { vi: "Reshape giữ nguyên thứ tự row-major của mọi phần tử.", en: "Reshape preserves the row-major order of every element." }, grid: { caption: "Source matrix" } }));
  if (total !== rows * cols) {
    steps.push(matrixStep2D(matrix, { title: { vi: "Không thể reshape", en: "Cannot reshape" }, codeLines: [4, 5], final: true, vars: [{ name: "source cells", value: total }, { name: "target cells", value: rows * cols }], note: { vi: "Số ô khác nhau nên phải trả về ma trận ban đầu.", en: "The cell counts differ, so return the original matrix." }, grid: { caption: "Return source unchanged" } }));
    return { original: matrix, answer: matrix, steps };
  }
  const result = blankMatrix2D(rows, cols);
  for (let index = 0; index < total; index++) {
    const sourceRow = Math.floor(index / matrix[0].length);
    const sourceCol = index % matrix[0].length;
    const targetRow = Math.floor(index / cols);
    const targetCol = index % cols;
    result[targetRow][targetCol] = matrix[sourceRow][sourceCol];
    steps.push(matrixStep2D(result, { title: { vi: `Đặt ${matrix[sourceRow][sourceCol]} vào (${targetRow},${targetCol})`, en: `Place ${matrix[sourceRow][sourceCol]} at (${targetRow},${targetCol})` }, codeLines: [6, 7, 8], vars: [{ name: "flat index", value: index }, { name: "source", value: `(${sourceRow},${sourceCol})` }, { name: "target", value: `(${targetRow},${targetCol})` }], note: { vi: `Phần tử thứ ${index} theo thứ tự row-major giữ nguyên vị trí phẳng rồi đổi sang tọa độ mới.`, en: `Item ${index} keeps its row-major flat position, then gets a new coordinate.` }, grid: { hlCell: [targetRow, targetCol], caption: `Result ${rows}×${cols}` } }));
  }
  steps.push(matrixStep2D(result, { title: { vi: "Hoàn tất reshape", en: "Reshape complete" }, codeLines: [9], final: true, vars: [{ name: "result", value: JSON.stringify(result) }], note: { vi: "Đã ghi mọi phần tử theo thứ tự ban đầu.", en: "All values were written in their original order." }, grid: { caption: "Reshaped matrix" } }));
  return { original: matrix, answer: result, steps };
}

/** LeetCode 766: Toeplitz Matrix. */
function buildSteps766(input) {
  const matrix = parseIntegerMatrix2D(input);
  const steps = [];
  steps.push(matrixStep2D(matrix, { title: { vi: "Kiểm tra các đường chéo", en: "Check diagonals" }, codeLines: [3], vars: [{ name: "rows, cols", value: `${matrix.length}, ${matrix[0].length}` }], note: { vi: "Mỗi ô (r,c), trừ hàng/cột đầu, phải bằng ô (r−1,c−1).", en: "Every cell (r,c), except the first row/column, must equal (r−1,c−1)." }, grid: { caption: "Compare each cell with its top-left diagonal neighbor" } }));
  for (let r = 1; r < matrix.length; r++) for (let c = 1; c < matrix[0].length; c++) {
    const same = matrix[r][c] === matrix[r - 1][c - 1];
    steps.push(matrixStep2D(matrix, { title: { vi: `So sánh (${r},${c}) với (${r - 1},${c - 1})`, en: `Compare (${r},${c}) with (${r - 1},${c - 1})` }, codeLines: [4, 5], final: !same, vars: [{ name: "current", value: matrix[r][c] }, { name: "top-left", value: matrix[r - 1][c - 1] }, { name: "toeplitz", value: same }], note: { vi: same ? "Hai giá trị bằng nhau → tiếp tục đường chéo." : "Hai giá trị khác nhau → không phải Toeplitz.", en: same ? "The values match → continue along diagonals." : "The values differ → not Toeplitz." }, grid: { hlCell: [r, c], pathCells: [[r - 1, c - 1]], caption: same ? "Diagonal matches" : "Diagonal mismatch" } }));
    if (!same) return { original: matrix, answer: false, steps };
  }
  steps.push(matrixStep2D(matrix, { title: { vi: "Ma trận Toeplitz", en: "Toeplitz matrix" }, codeLines: [6], final: true, vars: [{ name: "toeplitz", value: true }], note: { vi: "Mọi đường chéo từ trái-trên xuống phải-dưới đều có cùng giá trị.", en: "Every top-left to bottom-right diagonal has one value." }, grid: { caption: "All diagonal checks passed" } }));
  return { original: matrix, answer: true, steps };
}

/** LeetCode 832: Flipping an Image. */
function buildSteps832(input) {
  const matrix = parseIntegerMatrix2D(input);
  if (!matrix.every((row) => row.every((value) => value === 0 || value === 1))) throw new Error("image cells must be 0 or 1");
  const result = blankMatrix2D(matrix.length, matrix[0].length);
  const steps = [matrixStep2D(matrix, { title: { vi: "Reverse rồi invert", en: "Reverse then invert" }, codeLines: [3], vars: [{ name: "rows", value: matrix.length }], note: { vi: "Mỗi hàng được đảo chiều; sau đó 0↔1.", en: "Reverse every row; then flip 0↔1." }, grid: { caption: "Original binary image" } })];
  for (let r = 0; r < matrix.length; r++) for (let c = 0; c < matrix[0].length; c++) {
    const targetCol = matrix[0].length - 1 - c;
    const value = matrix[r][c] ^ 1;
    result[r][targetCol] = value;
    steps.push(matrixStep2D(result, { title: { vi: `(${r},${c}) → (${r},${targetCol})`, en: `(${r},${c}) → (${r},${targetCol})` }, codeLines: [4, 5, 6], vars: [{ name: "source", value: matrix[r][c] }, { name: "reversed col", value: targetCol }, { name: "inverted", value }], note: { vi: `Đảo cột ${c} thành ${targetCol}, rồi ${matrix[r][c]} XOR 1 = ${value}.`, en: `Reverse column ${c} to ${targetCol}, then ${matrix[r][c]} XOR 1 = ${value}.` }, grid: { hlCell: [r, targetCol], caption: "Building flipped image" } }));
  }
  steps.push(matrixStep2D(result, { title: { vi: "Ảnh sau khi flip", en: "Flipped image" }, codeLines: [7], final: true, vars: [{ name: "result", value: JSON.stringify(result) }], note: { vi: "Mọi hàng đã được reverse và mọi bit đã invert.", en: "Every row is reversed and every bit is inverted." }, grid: { caption: "Final image" } }));
  return { original: matrix, answer: result, steps };
}

/** LeetCode 867: Transpose Matrix. */
function buildSteps867(input) {
  const matrix = parseIntegerMatrix2D(input);
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array.from({ length: cols }, () => Array(rows).fill(null));
  const steps = [];
  const copied = [];
  const push = ({ line, phase, row = null, col = null, final = false, title, note }) => {
    const source = row != null && col != null ? [row, col] : null;
    const target = source ? [col, row] : null;
    steps.push({
      title, note, final, arr: [], sub: [], highlight: [], mark: [], codeLines: [line],
      vars: [
        { name: "rows", value: rows }, { name: "cols", value: cols },
        ...(row != null ? [{ name: "r", value: row }] : []),
        ...(col != null ? [{ name: "c", value: col }] : []),
        ...(source ? [{ name: "matrix[r][c]", value: matrix[row][col] }, { name: "result[c][r]", value: `result[${col}][${row}]` }] : []),
        { name: "copied", value: `${copied.length}/${rows * cols}` },
      ],
      transpose867View: {
        matrix: matrix.map((sourceRow) => [...sourceRow]), result: result.map((targetRow) => [...targetRow]),
        rows, cols, source, target, copied: copied.map((cell) => [...cell]), phase, final,
      },
    });
  };

  push({ line: 3, phase: "rows", title: { vi: `rows = ${rows}`, en: `rows = ${rows}` }, note: { vi: "Đếm số hàng của matrix nguồn.", en: "Count the source matrix rows." } });
  push({ line: 4, phase: "cols", title: { vi: `cols = ${cols}`, en: `cols = ${cols}` }, note: { vi: "Đếm số cột của matrix nguồn.", en: "Count the source matrix columns." } });
  push({ line: 5, phase: "allocate", title: { vi: `Tạo result ${cols} × ${rows}`, en: `Allocate result ${cols} × ${rows}` }, note: { vi: "Transpose hoán đổi kích thước: rows × cols trở thành cols × rows. Các ô bắt đầu rỗng.", en: "Transpose swaps the shape: rows × cols becomes cols × rows. Every target cell starts empty." } });
  for (let r = 0; r < rows; r++) {
    push({ line: 6, phase: "row", row: r, title: { vi: `Bắt đầu hàng r = ${r}`, en: `Start row r = ${r}` }, note: { vi: `Duyệt lần lượt các cột trong matrix[${r}].`, en: `Visit each column in matrix[${r}].` } });
    for (let c = 0; c < cols; c++) {
      push({ line: 7, phase: "column", row: r, col: c, title: { vi: `Chọn c = ${c}`, en: `Choose c = ${c}` }, note: { vi: `Ô nguồn là matrix[${r}][${c}] = ${matrix[r][c]}.`, en: `The source cell is matrix[${r}][${c}] = ${matrix[r][c]}.` } });
      result[c][r] = matrix[r][c];
      copied.push([r, c]);
      push({ line: 8, phase: "copy", row: r, col: c, title: { vi: `Sao chép (${r},${c}) → (${c},${r})`, en: `Copy (${r},${c}) → (${c},${r})` }, note: { vi: `Đổi thứ tự chỉ số: result[${c}][${r}] = matrix[${r}][${c}] = ${matrix[r][c]}.`, en: `Swap the indexes: result[${c}][${r}] = matrix[${r}][${c}] = ${matrix[r][c]}.` } });
    }
  }
  push({ line: 9, phase: "done", final: true, title: { vi: "return result", en: "return result" }, note: { vi: `Đã sao chép ${rows * cols} ô; result có kích thước ${cols} × ${rows}.`, en: `All ${rows * cols} cells are copied; result has shape ${cols} × ${rows}.` } });
  return { original: matrix, answer: result, steps };
}

/** LeetCode 1337: The K Weakest Rows in a Matrix. */
function buildSteps1337(input, params = {}) {
  const matrix = parseIntegerMatrix2D(input);
  const k = Number(params.k);
  if (!Number.isInteger(k) || k <= 0 || k > matrix.length) throw new Error("k must be between 1 and the number of rows");
  const steps = [matrixStep2D(matrix, { title: { vi: "Đếm soldiers ở từng hàng", en: "Count soldiers in every row" }, codeLines: [3], vars: [{ name: "k", value: k }], note: { vi: "Hàng yếu hơn có ít soldier hơn; nếu bằng nhau, chỉ số hàng nhỏ hơn đứng trước.", en: "A weaker row has fewer soldiers; ties use the smaller row index." }, grid: { caption: "1 = soldier, 0 = civilian" } })];
  const strengths = [];
  for (let r = 0; r < matrix.length; r++) {
    const soldiers = matrix[r].reduce((sum, value) => sum + value, 0);
    strengths.push([soldiers, r]);
    steps.push(matrixStep2D(matrix, { title: { vi: `Hàng ${r}: ${soldiers} soldier`, en: `Row ${r}: ${soldiers} soldiers` }, codeLines: [4, 5], vars: [{ name: "row", value: r }, { name: "soldiers", value: soldiers }, { name: "pairs", value: strengths.map(([count, row]) => `(${count},${row})`).join(" ") }], note: { vi: `Tổng các bit của hàng ${r} là ${soldiers}.`, en: `The sum of row ${r}'s bits is ${soldiers}.` }, grid: { pathCells: matrix[r].map((_, c) => [r, c]), caption: "Counting this row" } }));
  }
  strengths.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const answer = strengths.slice(0, k).map(([, row]) => row);
  steps.push(matrixStep2D(matrix, { title: { vi: `Sắp xếp và lấy ${k} hàng yếu nhất`, en: `Sort and take the ${k} weakest rows` }, codeLines: [6, 7], final: true, vars: [{ name: "sorted (soldiers,row)", value: strengths.map((item) => `(${item[0]},${item[1]})`).join(" ") }, { name: "answer", value: `[${answer.join(", ")}]` }], note: { vi: `Thứ tự sau sắp xếp cho ${k} hàng đầu là [${answer.join(", ")}].`, en: `The first ${k} row indexes after sorting are [${answer.join(", ")}].` }, grid: { pathCells: answer.flatMap((row) => matrix[row].map((_, col) => [row, col])), caption: "Weakest rows highlighted" } }));
  return { original: matrix, answer, steps };
}

/** LeetCode 1351: Count Negative Numbers in a Sorted Matrix. */
function buildSteps1351(input) {
  const matrix = parseIntegerMatrix2D(input);
  const steps = [];
  const visited = [];
  let row = 0, col = matrix[0].length - 1, count = 0;
  steps.push(matrixStep2D(matrix, { title: { vi: "Bắt đầu ở góc phải-trên", en: "Start at the top-right corner" }, codeLines: [3], vars: [{ name: "row,col", value: `${row},${col}` }, { name: "count", value: count }], note: { vi: "Nếu gặp số âm, toàn bộ ô phía dưới cùng cột cũng âm; nếu không, đi xuống.", en: "At a negative value, every cell below in that column is negative; otherwise move down." }, grid: { hlCell: [row, col], caption: "Rows and columns are non-increasing" } }));
  while (row < matrix.length && col >= 0) {
    const value = matrix[row][col];
    visited.push([row, col]);
    if (value < 0) {
      const added = matrix.length - row;
      count += added;
      steps.push(matrixStep2D(matrix, { title: { vi: `${value} âm → +${added}`, en: `${value} is negative → +${added}` }, codeLines: [5, 6, 7], vars: [{ name: "cell", value: `(${row},${col})` }, { name: "added", value: added }, { name: "count", value: count }], note: { vi: `Từ hàng ${row} trở xuống ở cột ${col} đều âm, cộng ${added}; sau đó sang trái.`, en: `Rows ${row} through the bottom in column ${col} are negative, add ${added}; then move left.` }, grid: { hlCell: [row, col], historyCells: visited, pathCells: Array.from({ length: added }, (_, offset) => [row + offset, col]), caption: "Count an entire negative column suffix" } }));
      col--;
    } else {
      steps.push(matrixStep2D(matrix, { title: { vi: `${value} không âm → đi xuống`, en: `${value} is non-negative → move down` }, codeLines: [8], vars: [{ name: "cell", value: `(${row},${col})` }, { name: "count", value: count }], note: { vi: "Cần số nhỏ hơn, nên đi xuống hàng kế tiếp.", en: "We need a smaller value, so move down one row." }, grid: { hlCell: [row, col], historyCells: visited, caption: "Move down" } }));
      row++;
    }
  }
  steps.push(matrixStep2D(matrix, { title: { vi: `Có ${count} số âm`, en: `${count} negative numbers` }, codeLines: [9], final: true, vars: [{ name: "count", value: count }], note: { vi: "Con trỏ đã ra ngoài ma trận; count là đáp án.", en: "The pointer left the matrix; count is the answer." }, grid: { historyCells: visited, caption: "Finished" } }));
  return { original: matrix, answer: count, steps };
}

/** LeetCode 1886: Determine Whether Matrix Can Be Obtained By Rotation. */
function buildSteps1886(input, params = {}) {
  const matrix = parseIntegerMatrix2D(input);
  const target = parseIntegerMatrix2D(params.target);
  if (matrix.length !== matrix[0].length || target.length !== target[0].length || matrix.length !== target.length) throw new Error("mat and target must be square matrices of the same size");
  const rotate = (grid) => Array.from({ length: grid.length }, (_, r) => Array.from({ length: grid.length }, (_, c) => grid[grid.length - 1 - c][r]));
  let current = cloneMatrix2D(matrix);
  const steps = [];
  const tested = [];
  const size = matrix.length;
  const snapshot = ({ title, phase, angle, matches, mismatches, codeLines = [], vars = [], note, decision = null, final = false }) => {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
      rotation1886View: {
        original: cloneMatrix2D(matrix),
        current: cloneMatrix2D(current),
        target: cloneMatrix2D(target),
        size,
        angle,
        phase,
        matches: matches.map(([row, col]) => [row, col]),
        mismatches: mismatches.map(([row, col]) => [row, col]),
        tested: tested.map((item) => ({ ...item })),
        decision,
      },
    });
  };

  for (let turns = 0; turns < 4; turns++) {
    const angle = turns * 90;
    const matches = [];
    const mismatches = [];
    for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
      (current[row][col] === target[row][col] ? matches : mismatches).push([row, col]);
    }
    const same = mismatches.length === 0;
    snapshot({
      title: { vi: `Bắt đầu lượt xoay ${angle}°`, en: `Start the ${angle}° rotation attempt` },
      phase: "loop",
      angle,
      matches,
      mismatches,
      codeLines: [5],
      vars: [{ name: "turn", value: turns }, { name: "rotation", value: `${angle}°` }, { name: "candidate", value: "mat" }],
      note: { vi: `Vòng lặp bắt đầu với ma trận ứng viên ở góc ${angle}°.`, en: `The loop starts with the ${angle}° matrix candidate.` },
      decision: { kind: "loop", angle },
    });
    tested.push({ angle, same });
    snapshot({
      title: { vi: `Kiểm tra ứng viên ${angle}° có bằng target`, en: `Check whether the ${angle}° candidate equals target` },
      phase: "compare",
      angle,
      matches,
      mismatches,
      codeLines: [6],
      vars: [{ name: "candidate == target", value: same }, { name: "matching cells", value: `${matches.length}/${size * size}` }],
      note: { vi: same ? `Điều kiện đúng: tất cả ${size * size} ô đều khớp target.` : `Điều kiện sai: vẫn còn ${mismatches.length} ô khác target.` , en: same ? `The condition is true: all ${size * size} cells match target.` : `The condition is false: ${mismatches.length} cells still differ from target.` },
      decision: { kind: "compare", matchingCount: matches.length, total: size * size, same },
    });
    if (same) {
      snapshot({
        title: { vi: `Ứng viên ${angle}° trùng target → trả về True`, en: `The ${angle}° candidate equals target → return True` },
        phase: "found",
        angle,
        matches,
        mismatches,
        codeLines: [7],
        final: true,
        vars: [{ name: "answer", value: true }, { name: "rotation", value: `${angle}°` }],
        note: { vi: "Điều kiện ở dòng trước đúng, nên hàm kết thúc ngay với True.", en: "The previous condition was true, so the function exits immediately with True." },
        decision: { kind: "found", matchingCount: matches.length, total: size * size },
      });
      return { original: matrix, answer: true, steps };
    }
    if (turns === 3) break;
    snapshot({
      title: { vi: `Xoay ứng viên ${angle}° thành ${angle + 90}°`, en: `Rotate the ${angle}° candidate to ${angle + 90}°` },
      phase: "rotate",
      angle,
      matches,
      mismatches,
      codeLines: [8],
      vars: [{ name: "rotation", value: `${angle}° → ${angle + 90}°` }, { name: "move rule", value: "(r,c) → (c,n-1-r)" }],
      note: { vi: "Mỗi giá trị đi theo quy tắc (r,c) → (c,n-1-r) khi xoay 90° theo chiều kim đồng hồ.", en: "Every value follows (r,c) → (c,n-1-r) for a clockwise 90° rotation." },
      decision: { kind: "rotate", fromAngle: angle, toAngle: angle + 90 },
    });
    current = rotate(current);
  }
  const matches = [];
  const mismatches = [];
  for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) (current[row][col] === target[row][col] ? matches : mismatches).push([row, col]);
  snapshot({
    title: { vi: "Không có góc xoay phù hợp", en: "No rotation matches" },
    phase: "missing",
    angle: 270,
    matches,
    mismatches,
    codeLines: [9],
    final: true,
    vars: [{ name: "tested rotations", value: "0°, 90°, 180°, 270°" }, { name: "answer", value: false }],
    note: { vi: "Đã thử đủ bốn hướng; không có ứng viên nào bằng target → False.", en: "All four orientations were tried; none equals target → False." },
    decision: { kind: "missing", matchingCount: matches.length, total: size * size },
  });
  return { original: matrix, answer: false, steps };
}

/** LeetCode 1886, approach 2: compare mat directly with mapped target coordinates. */
function buildSteps1886Direct(input, params = {}) {
  const matrix = parseIntegerMatrix2D(input);
  const target = parseIntegerMatrix2D(params.target);
  if (matrix.length !== matrix[0].length || target.length !== target[0].length || matrix.length !== target.length) throw new Error("mat and target must be square matrices of the same size");
  const size = matrix.length;
  const steps = [];
  const tested = [];
  const checks = [
    { angle: 90, formula: "target[j][n - 1 - i]", map: (row, col) => [col, size - 1 - row], lines: { flag: 5, outer: 6, inner: 7, compare: 8, fail: 9, break: 10, result: 12, return: 13 } },
    { angle: 180, formula: "target[n - 1 - i][n - 1 - j]", map: (row, col) => [size - 1 - row, size - 1 - col], lines: { flag: 15, outer: 16, inner: 17, compare: 18, fail: 19, break: 20, result: 22, return: 23 } },
    { angle: 270, formula: "target[n - 1 - j][i]", map: (row, col) => [size - 1 - col, row], lines: { flag: 25, outer: 26, inner: 27, compare: 28, fail: 29, break: 30, result: 32, return: 33 } },
    { angle: 0, formula: "target[i][j]", map: (row, col) => [row, col], lines: { flag: 35, outer: 36, inner: 37, compare: 38, fail: 39, break: 40, result: 42, return: 43 } },
  ];

  function snapshot({ title, phase, check, sourceMatches = [], targetMatches = [], sourceMismatches = [], targetMismatches = [], activeSource = null, activeTarget = null, codeLine, vars = [], note, decision = null, final = false }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeBlock: 2,
      codeLines: [codeLine],
      vars,
      note,
      rotation1886View: {
        approach: 2,
        comparisonMode: "mapped",
        original: cloneMatrix2D(matrix),
        current: cloneMatrix2D(matrix),
        target: cloneMatrix2D(target),
        size,
        angle: check ? check.angle : null,
        phase,
        matches: sourceMatches.map(([row, col]) => [row, col]),
        mismatches: sourceMismatches.map(([row, col]) => [row, col]),
        sourceMatches: sourceMatches.map(([row, col]) => [row, col]),
        targetMatches: targetMatches.map(([row, col]) => [row, col]),
        sourceMismatches: sourceMismatches.map(([row, col]) => [row, col]),
        targetMismatches: targetMismatches.map(([row, col]) => [row, col]),
        activeSource,
        activeTarget,
        mapping: check ? { angle: check.angle, formula: check.formula } : null,
        tested: tested.map((item) => ({ ...item })),
        decision,
      },
    });
  }

  snapshot({
    title: { vi: `n = len(mat) = ${size}`, en: `n = len(mat) = ${size}` },
    phase: "direct-size",
    codeLine: 3,
    vars: [{ name: "n", value: size }, { name: "method", value: "direct target mapping" }],
    note: { vi: "Cách 2 không xoay mat. Thay vào đó, đối chiếu mỗi ô mat với tọa độ tương ứng trên target.", en: "Approach 2 does not rotate mat. Instead, it compares each mat cell with its corresponding target coordinate." },
    decision: { kind: "direct-size", size },
  });

  for (const check of checks) {
    let flag = true;
    const sourceMatches = [];
    const targetMatches = [];
    const sourceMismatches = [];
    const targetMismatches = [];
    snapshot({
      title: { vi: `Kiểm tra ánh xạ xoay ${check.angle}°`, en: `Check the ${check.angle}° rotation mapping` },
      phase: "direct-reset",
      check,
      sourceMatches,
      targetMatches,
      sourceMismatches,
      targetMismatches,
      codeLine: check.lines.flag,
      vars: [{ name: "flag", value: true }, { name: "rotation", value: `${check.angle}°` }, { name: "target coordinate", value: check.formula }],
      note: { vi: `Đặt flag = True trước khi kiểm tra ánh xạ ${check.angle}°.`, en: `Set flag = True before checking the ${check.angle}° mapping.` },
      decision: { kind: "direct-reset", angle: check.angle, formula: check.formula },
    });

    for (let row = 0; row < size; row++) {
      snapshot({
        title: { vi: `Vòng ngoài: i = ${row}`, en: `Outer loop: i = ${row}` },
        phase: "direct-outer",
        check,
        sourceMatches,
        targetMatches,
        sourceMismatches,
        targetMismatches,
        codeLine: check.lines.outer,
        vars: [{ name: "i", value: row }, { name: "flag", value: flag }],
        note: { vi: `Duyệt hàng ${row} của mat.`, en: `Visit row ${row} of mat.` },
        decision: { kind: "direct-outer", row, angle: check.angle },
      });
      for (let col = 0; col < size; col++) {
        const [targetRow, targetCol] = check.map(row, col);
        const sourceValue = matrix[row][col];
        const targetValue = target[targetRow][targetCol];
        snapshot({
          title: { vi: `Vòng trong: j = ${col}`, en: `Inner loop: j = ${col}` },
          phase: "direct-inner",
          check,
          sourceMatches,
          targetMatches,
          sourceMismatches,
          targetMismatches,
          activeSource: [row, col],
          activeTarget: [targetRow, targetCol],
          codeLine: check.lines.inner,
          vars: [{ name: "i,j", value: `${row},${col}` }, { name: "mat[i][j]", value: sourceValue }, { name: "mapped target", value: `[${targetRow}][${targetCol}]` }],
          note: { vi: `Chuẩn bị so sánh mat[${row}][${col}] với ${check.formula}.`, en: `Prepare to compare mat[${row}][${col}] with ${check.formula}.` },
          decision: { kind: "direct-inner", row, col, targetRow, targetCol, angle: check.angle },
        });
        const same = sourceValue === targetValue;
        (same ? sourceMatches : sourceMismatches).push([row, col]);
        (same ? targetMatches : targetMismatches).push([targetRow, targetCol]);
        snapshot({
          title: { vi: `So sánh ${sourceValue} ${same ? "==" : "!="} ${targetValue}`, en: `Compare ${sourceValue} ${same ? "==" : "!="} ${targetValue}` },
          phase: "direct-compare",
          check,
          sourceMatches,
          targetMatches,
          sourceMismatches,
          targetMismatches,
          activeSource: [row, col],
          activeTarget: [targetRow, targetCol],
          codeLine: check.lines.compare,
          vars: [{ name: "mat[i][j]", value: sourceValue }, { name: check.formula, value: targetValue }, { name: "different", value: !same }],
          note: { vi: same ? "Hai ô ánh xạ có cùng giá trị, tiếp tục kiểm tra." : "Hai ô ánh xạ khác nhau, flag sẽ trở thành False.", en: same ? "The mapped cells have the same value, so continue checking." : "The mapped cells differ, so flag will become False." },
          decision: { kind: "direct-compare", sourceValue, targetValue, same, row, col, targetRow, targetCol, angle: check.angle },
        });
        if (!same) {
          flag = false;
          snapshot({
            title: { vi: "Phát hiện khác nhau → flag = False", en: "Difference found → flag = False" },
            phase: "direct-fail",
            check,
            sourceMatches,
            targetMatches,
            sourceMismatches,
            targetMismatches,
            activeSource: [row, col],
            activeTarget: [targetRow, targetCol],
            codeLine: check.lines.fail,
            vars: [{ name: "flag", value: false }, { name: "first mismatch", value: `mat[${row}][${col}] vs target[${targetRow}][${targetCol}]` }],
            note: { vi: "Chỉ cần một cặp khác nhau là ánh xạ xoay này không thể đúng.", en: "One different pair is enough for this rotation mapping to fail." },
            decision: { kind: "direct-fail", angle: check.angle, row, col, targetRow, targetCol },
          });
          snapshot({
            title: { vi: "Dừng vòng j hiện tại", en: "Break the current j loop" },
            phase: "direct-break",
            check,
            sourceMatches,
            targetMatches,
            sourceMismatches,
            targetMismatches,
            activeSource: [row, col],
            activeTarget: [targetRow, targetCol],
            codeLine: check.lines.break,
            vars: [{ name: "flag", value: false }, { name: "break", value: "inner loop" }],
            note: { vi: "break chỉ thoát vòng j; vòng i vẫn tiếp tục theo đúng code này.", en: "break exits only the j loop; the i loop continues exactly as written." },
            decision: { kind: "direct-break", angle: check.angle },
          });
          break;
        }
      }
    }
    tested.push({ angle: check.angle, same: flag });
    snapshot({
      title: { vi: `Kiểm tra flag của ánh xạ ${check.angle}°`, en: `Check the ${check.angle}° mapping flag` },
      phase: "direct-result",
      check,
      sourceMatches,
      targetMatches,
      sourceMismatches,
      targetMismatches,
      codeLine: check.lines.result,
      vars: [{ name: "flag", value: flag }, { name: "checked pairs", value: `${sourceMatches.length + sourceMismatches.length}/${size * size}` }],
      note: { vi: flag ? "Không có cặp nào khác nhau: điều kiện flag đúng." : "Đã có cặp khác nhau: tiếp tục thử ánh xạ xoay kế tiếp.", en: flag ? "No pair differed: the flag condition is true." : "A pair differed: continue with the next rotation mapping." },
      decision: { kind: "direct-result", angle: check.angle, flag, checked: sourceMatches.length + sourceMismatches.length, total: size * size },
    });
    if (flag) {
      snapshot({
        title: { vi: `Ánh xạ ${check.angle}° hợp lệ → trả về True`, en: `The ${check.angle}° mapping is valid → return True` },
        phase: "found",
        check,
        sourceMatches,
        targetMatches,
        sourceMismatches,
        targetMismatches,
        codeLine: check.lines.return,
        vars: [{ name: "answer", value: true }, { name: "rotation", value: `${check.angle}°` }],
        note: { vi: "flag vẫn True, nên target có thể nhận được bằng phép xoay này.", en: "flag is still True, so target can be obtained by this rotation." },
        decision: { kind: "direct-found", angle: check.angle, matchingCount: sourceMatches.length, total: size * size },
        final: true,
      });
      return { original: matrix, answer: true, steps };
    }
  }

  snapshot({
    title: { vi: "Cả bốn ánh xạ đều thất bại → trả về False", en: "All four mappings fail → return False" },
    phase: "missing",
    check: checks.at(-1),
    codeLine: 45,
    vars: [{ name: "answer", value: false }, { name: "tested mappings", value: "90°, 180°, 270°, 0°" }],
    note: { vi: "Không có ánh xạ nào giữ flag = True, nên target không thể nhận được từ mat bằng xoay.", en: "No mapping kept flag = True, so target cannot be obtained from mat by rotation." },
    decision: { kind: "direct-missing" },
    final: true,
  });
  return { original: matrix, answer: false, steps };
}

/** LeetCode 2022: Convert 1D Array Into 2D Array. */
function buildSteps2022(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : String(input).split(",").map((value) => Number(value.trim())).filter((value) => !Number.isNaN(value));
  const rows = Number(params.m), cols = Number(params.n);
  if (!nums.length || !nums.every(Number.isInteger) || !Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) throw new Error("enter integer nums and positive m, n");
  const needed = rows * cols;
  const createView = ({ matrix, phase, activeIndex = null, activeCell = null, placedCount = 0, decision = null }) => ({
    nums: [...nums],
    matrix: cloneMatrix2D(matrix),
    rows,
    cols,
    needed,
    phase,
    activeIndex,
    activeCell,
    placedCount,
    decision,
  });
  if (nums.length !== rows * cols) {
    return {
      original: nums,
      answer: [],
      steps: [{
        title: { vi: "Kích thước không khớp", en: "Size mismatch" },
        arr: nums,
        highlight: [],
        mark: [],
        final: true,
        codeLines: [3, 4],
        vars: [{ name: "nums length", value: nums.length }, { name: "m*n", value: needed }],
        note: { vi: "Không thể chia đủ nums thành m×n ô nên trả về [].", en: "nums cannot fill m×n cells, so return []." },
        convert2022View: createView({
          matrix: [],
          phase: "mismatch",
          decision: { kind: "mismatch", length: nums.length, needed },
        }),
      }],
    };
  }
  const result = blankMatrix2D(rows, cols);
  const steps = [];
  const snapshot = ({ title, phase, codeLines = [], vars = [], note, activeIndex = null, activeCell = null, placedCount = 0, decision = null, final = false }) => {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
      convert2022View: createView({ matrix: result, phase, activeIndex, activeCell, placedCount, decision }),
    });
  };

  snapshot({
    title: { vi: "Kiểm tra có đủ ô để đặt mọi phần tử", en: "Check that every value has a destination cell" },
    phase: "validate",
    codeLines: [3, 4],
    vars: [{ name: "len(original)", value: nums.length }, { name: "m*n", value: needed }],
    note: { vi: `${nums.length} phần tử khớp với ${rows} × ${cols} = ${needed} ô, nên có thể tạo ma trận.`, en: `${nums.length} values match ${rows} × ${cols} = ${needed} cells, so the matrix can be created.` },
    decision: { kind: "valid", length: nums.length, needed },
  });
  snapshot({
    title: { vi: `Tạo result ${rows} × ${cols} rỗng`, en: `Create an empty ${rows} × ${cols} result` },
    phase: "init",
    codeLines: [5],
    vars: [{ name: "original", value: `[${nums.join(", ")}]` }, { name: "m,n", value: `${rows},${cols}` }],
    note: { vi: "Các ô sẽ được điền theo hàng: hết một hàng mới sang hàng kế tiếp.", en: "Cells are filled row by row: finish one row before moving to the next." },
    decision: { kind: "init" },
  });
  for (let index = 0; index < nums.length; index++) {
    const row = Math.floor(index / cols), col = index % cols;
    snapshot({
      title: { vi: `Tính vị trí cho original[${index}] = ${nums[index]}`, en: `Calculate the position for original[${index}] = ${nums[index]}` },
      phase: "map",
      codeLines: [6, 7],
      vars: [{ name: "index", value: index }, { name: "row", value: `${index} // ${cols} = ${row}` }, { name: "col", value: `${index} % ${cols} = ${col}` }],
      note: { vi: `Chỉ số ${index} được đổi thành hàng ${row}, cột ${col}.`, en: `Index ${index} maps to row ${row}, column ${col}.` },
      activeIndex: index,
      activeCell: [row, col],
      placedCount: index,
      decision: { kind: "map", index, value: nums[index], row, col },
    });
    result[row][col] = nums[index];
    snapshot({
      title: { vi: `Ghi ${nums[index]} vào result[${row}][${col}]`, en: `Write ${nums[index]} into result[${row}][${col}]` },
      phase: "place",
      codeLines: [7],
      vars: [{ name: "result[row][col]", value: nums[index] }, { name: "đã đặt", value: `${index + 1}/${needed}` }],
      note: { vi: `Giá trị ở original[${index}] đã vào đúng ô (${row}, ${col}).`, en: `The value from original[${index}] is now in its cell (${row}, ${col}).` },
      activeIndex: index,
      activeCell: [row, col],
      placedCount: index + 1,
      decision: { kind: "place", index, value: nums[index], row, col },
    });
  }
  snapshot({
    title: { vi: "Chuyển đổi hoàn tất", en: "Conversion complete" },
    phase: "done",
    codeLines: [8],
    final: true,
    vars: [{ name: "result", value: JSON.stringify(result) }],
    note: { vi: "Đã dùng đúng m×n phần tử và điền đầy tất cả các ô.", en: "Exactly m×n values were used and every cell is filled." },
    placedCount: needed,
    decision: { kind: "done" },
  });
  return { original: nums, answer: result, steps };
}

/** LeetCode 73: Set Matrix Zeroes. */
function buildSteps73(input) {
  const original = parseIntegerMatrix2D(input);
  const result = cloneMatrix2D(original);
  const rows = original.length;
  const cols = original[0].length;
  const zeroRows = new Set();
  const zeroCols = new Set();
  const steps = [];
  const setText = (set) => `{${[...set].join(", ")}}`;

  function snapshot({ title, phase, codeLines = [], vars = [], note, activeCell = null, changedCell = null, decision = null, final = false }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
      zero73View: {
        original: cloneMatrix2D(original),
        matrix: cloneMatrix2D(result),
        rows,
        cols,
        phase,
        activeCell,
        changedCell,
        zeroRows: [...zeroRows],
        zeroCols: [...zeroCols],
        decision,
      },
    });
  }

  snapshot({
    title: { vi: "Lượt 1: quét để tìm các số 0 gốc", en: "Pass 1: scan for original zeroes" },
    phase: "scan",
    codeLines: [3, 4],
    vars: [{ name: "rows,cols", value: `${rows},${cols}` }, { name: "zero_rows", value: "{}" }, { name: "zero_cols", value: "{}" }],
    note: { vi: "Chỉ ghi lại vị trí 0 vào hai Set. Chưa thay đổi bất kỳ ô nào trong matrix.", en: "Only record original zeroes in two Sets. Do not change any matrix cell yet." },
    decision: { kind: "init" },
  });

  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const value = original[row][col];
    snapshot({
      title: { vi: `Đọc matrix[${row}][${col}] = ${value}`, en: `Read matrix[${row}][${col}] = ${value}` },
      phase: "scan",
      codeLines: [5, 6, 7],
      vars: [{ name: "r,c", value: `${row},${col}` }, { name: "value", value }, { name: "zero_rows", value: setText(zeroRows) }, { name: "zero_cols", value: setText(zeroCols) }],
      note: { vi: value === 0 ? "Đây là số 0 gốc: cần đánh dấu cả hàng lẫn cột, nhưng vẫn chưa sửa matrix." : "Không phải 0 gốc, tiếp tục quét." , en: value === 0 ? "This is an original zero: mark both its row and column, but do not edit the matrix yet." : "Not an original zero; keep scanning." },
      activeCell: [row, col],
      decision: { kind: "scan", value },
    });
    if (value === 0) {
      zeroRows.add(row);
      zeroCols.add(col);
      snapshot({
        title: { vi: `Ghi marker: hàng ${row} và cột ${col}`, en: `Record markers: row ${row} and column ${col}` },
        phase: "mark",
        codeLines: [8, 9],
        vars: [{ name: "zero_rows", value: setText(zeroRows) }, { name: "zero_cols", value: setText(zeroCols) }],
        note: { vi: `Đã lưu hàng ${row} và cột ${col}. Lượt hai sẽ dùng hai Set này để quyết định ô nào thành 0.`, en: `Saved row ${row} and column ${col}. Pass 2 will use these Sets to decide which cells become zero.` },
        activeCell: [row, col],
        decision: { kind: "mark", row, col },
      });
    }
  }

  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const shouldZero = zeroRows.has(row) || zeroCols.has(col);
    snapshot({
      title: { vi: `Kiểm tra marker cho ô (${row},${col})`, en: `Check markers for cell (${row},${col})` },
      phase: "apply",
      codeLines: [10, 11, 12],
      vars: [{ name: "r,c", value: `${row},${col}` }, { name: "r in zero_rows", value: zeroRows.has(row) }, { name: "c in zero_cols", value: zeroCols.has(col) }],
      note: { vi: shouldZero ? "Chỉ cần hàng HOẶC cột đã được đánh dấu là ô phải thành 0." : "Cả hàng lẫn cột đều không được đánh dấu, nên giữ nguyên giá trị." , en: shouldZero ? "A marked row OR column is enough: this cell must become zero." : "Neither row nor column is marked, so keep the value." },
      activeCell: [row, col],
      decision: { kind: "check", rowMarked: zeroRows.has(row), colMarked: zeroCols.has(col), shouldZero },
    });
    if (!shouldZero) continue;
    const before = result[row][col];
    result[row][col] = 0;
    snapshot({
      title: { vi: `Đặt matrix[${row}][${col}] = 0`, en: `Set matrix[${row}][${col}] = 0` },
      phase: "apply",
      codeLines: [13],
      vars: [{ name: "r,c", value: `${row},${col}` }, { name: "before", value: before }, { name: "zero_rows", value: setText(zeroRows) }, { name: "zero_cols", value: setText(zeroCols) }],
      note: { vi: `Ô này nằm trong ${zeroRows.has(row) ? `hàng ${row}` : ""}${zeroRows.has(row) && zeroCols.has(col) ? " và " : ""}${zeroCols.has(col) ? `cột ${col}` : ""} đã đánh dấu, nên đổi thành 0.`, en: `This cell is in the marked ${zeroRows.has(row) ? `row ${row}` : ""}${zeroRows.has(row) && zeroCols.has(col) ? " and " : ""}${zeroCols.has(col) ? `column ${col}` : ""}, so set it to zero.` },
      activeCell: [row, col],
      changedCell: [row, col],
      decision: { kind: "apply", rowMarked: zeroRows.has(row), colMarked: zeroCols.has(col), before },
    });
  }
  snapshot({
    title: { vi: "Hoàn tất Set Matrix Zeroes", en: "Set Matrix Zeroes complete" },
    phase: "done",
    codeLines: [14],
    final: true,
    vars: [{ name: "result", value: JSON.stringify(result) }],
    note: { vi: "Mọi hàng hoặc cột có số 0 gốc đều đã thành 0. Các Set chỉ được dùng để nhớ marker của lượt một.", en: "Every row or column with an original zero is now zero. The Sets were only used to preserve pass-1 markers." },
    decision: { kind: "done" },
  });
  return { original, answer: result, steps };
}

/** LeetCode 74: Search a 2D Matrix. */
function buildSteps74(input, params = {}) {
  const matrix = parseIntegerMatrix2D(input);
  const target = Number(params.target);
  if (!Number.isInteger(target)) throw new Error("target must be an integer");
  const rows = matrix.length, cols = matrix[0].length;
  const steps = [];
  const inspected = [];
  let lo = 0, hi = rows * cols - 1;
  const coord = (index) => [Math.floor(index / cols), index % cols];

  function snapshot({ title, phase, codeLines = [], vars = [], note, mid = null, decision = null, final = false }) {
    const activeCell = Number.isInteger(mid) ? coord(mid) : null;
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars,
      note,
      search74View: {
        matrix: cloneMatrix2D(matrix),
        rows,
        cols,
        target,
        lo,
        hi,
        mid,
        activeCell,
        inspected: inspected.map((item) => ({ ...item })),
        phase,
        decision,
      },
    });
  }

  snapshot({
    title: { vi: "Trải matrix thành dải chỉ số phẳng", en: "Flatten the matrix into one index range" },
    phase: "init",
    codeLines: [3, 4],
    vars: [{ name: "rows,cols", value: `${rows},${cols}` }, { name: "target", value: target }, { name: "lo,hi", value: `${lo},${hi}` }],
    note: { vi: "Vì hàng sau bắt đầu lớn hơn hàng trước kết thúc, toàn bộ matrix có thể xem như một mảng đã sắp xếp từ index 0 đến rows×cols−1.", en: "Because each row starts above the previous row's end, the whole matrix acts like one sorted array from index 0 to rows×cols-1." },
    decision: { kind: "init" },
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const [row, col] = coord(mid);
    const value = matrix[row][col];
    inspected.push({ index: mid, row, col, value });
    snapshot({
      title: { vi: `mid = ${mid} → matrix[${row}][${col}] = ${value}`, en: `mid = ${mid} → matrix[${row}][${col}] = ${value}` },
      phase: "probe",
      codeLines: [5, 6, 7],
      vars: [{ name: "lo,hi", value: `${lo},${hi}` }, { name: "mid", value: mid }, { name: "mid//cols, mid%cols", value: `${row},${col}` }, { name: "value", value }],
      note: { vi: `Đổi index phẳng ${mid}: row = ${mid} // ${cols} = ${row}, col = ${mid} % ${cols} = ${col}; rồi đọc ${value}.`, en: `Convert flat index ${mid}: row = ${mid} // ${cols} = ${row}, col = ${mid} % ${cols} = ${col}; then read ${value}.` },
      mid,
      decision: { kind: "probe", value, row, col },
    });
    if (value === target) {
      snapshot({
        title: { vi: `${value} == target → True`, en: `${value} == target → True` },
        phase: "found",
        codeLines: [8, 9],
        final: true,
        vars: [{ name: "target", value: target }, { name: "found", value: true }, { name: "position", value: `(${row},${col})` }],
        note: { vi: `Tìm thấy target tại matrix[${row}][${col}], tương ứng index phẳng ${mid}.`, en: `Found the target at matrix[${row}][${col}], which is flat index ${mid}.` },
        mid,
        decision: { kind: "found", value, row, col },
      });
      return { original: matrix, answer: true, steps };
    }
    if (value < target) {
      const oldLo = lo;
      const nextLo = mid + 1;
      lo = nextLo;
      snapshot({
        title: { vi: `${value} < ${target} → lo = ${nextLo}`, en: `${value} < ${target} → lo = ${nextLo}` },
        phase: "move-right",
        codeLines: [10, 11],
        vars: [{ name: "old lo", value: oldLo }, { name: "new lo", value: nextLo }, { name: "hi", value: hi }],
        note: { vi: `Mọi index từ ${oldLo} đến ${mid} đều có giá trị ≤ ${value}, nên bỏ nửa trái và chỉ giữ khoảng ${lo}..${hi}.`, en: `Every index from ${oldLo} to ${mid} has value <= ${value}, so discard the left half and keep only ${lo}..${hi}.` },
        mid,
        decision: { kind: "move-right", value, oldLo, nextLo },
      });
    } else {
      const oldHi = hi;
      const nextHi = mid - 1;
      hi = nextHi;
      snapshot({
        title: { vi: `${value} > ${target} → hi = ${nextHi}`, en: `${value} > ${target} → hi = ${nextHi}` },
        phase: "move-left",
        codeLines: [12, 13],
        vars: [{ name: "lo", value: lo }, { name: "old hi", value: oldHi }, { name: "new hi", value: nextHi }],
        note: { vi: `Mọi index từ ${mid} đến ${oldHi} đều có giá trị ≥ ${value}, nên bỏ nửa phải và chỉ giữ khoảng ${lo}..${hi}.`, en: `Every index from ${mid} to ${oldHi} has value >= ${value}, so discard the right half and keep only ${lo}..${hi}.` },
        mid,
        decision: { kind: "move-left", value, oldHi, nextHi },
      });
    }
  }
  snapshot({
    title: { vi: "Không tìm thấy target", en: "Target not found" },
    phase: "missing",
    codeLines: [14],
    final: true,
    vars: [{ name: "target", value: target }, { name: "lo,hi", value: `${lo},${hi}` }, { name: "found", value: false }],
    note: { vi: `lo = ${lo} đã vượt hi = ${hi}; khoảng tìm kiếm rỗng nên target không có trong matrix.`, en: `lo = ${lo} crossed hi = ${hi}; the search range is empty, so the target is not in the matrix.` },
    decision: { kind: "missing" },
  });
  return { original: matrix, answer: false, steps };
}

/** LeetCode 48: Rotate Image — transpose then reverse rows. */
function buildSteps48(input, params) {
  const m = parseMatrix(input);
  const original = m.map((r) => [...r]);
  const n = m.length;
  const approach = Number(params && params.approach) || 1;
  const codeBlock = approach === 2 ? 2 : 1;
  const steps = [];
  const totalTransposeSwaps = n * (n - 1) / 2;
  let transposeSwaps = 0;
  const reversedRows = [];

  function gsnap(o) {
    const activeCells = o.activeCells || [];
    steps.push({
      title: o.title,
      arr: [],
      grid: {
        dp: m.map((r) => [...r]),
        text1: Array.from({ length: n }, (_, i) => String(i)).join(""),
        text2: Array.from({ length: n }, (_, i) => String(i)).join(""),
        hlCell: activeCells[0] || null,
        pathCells: activeCells.slice(1),
        largeCells: true,
      },
      rotate48View: {
        original: original.map((r) => [...r]),
        matrix: m.map((r) => [...r]),
        n,
        approach,
        phase: o.phase || "init",
        activeCells: activeCells.map((cell) => [...cell]),
        activeRow: Number.isInteger(o.activeRow) ? o.activeRow : null,
        swap: o.swap || null,
        transposeSwaps,
        totalTransposeSwaps,
        reversedRows: [...reversedRows],
      },
      highlight: [],
      mark: [],
      final: o.final || false,
      codeBlock,
      codeLines: o.codeLines || [],
      vars: o.vars || [],
      note: o.note,
    });
  }

  gsnap({
    phase: "init",
    title: { vi: approach === 2 ? "Cách 2: transpose + swap từng cặp" : "Cách 1: transpose + row.reverse()", en: approach === 2 ? "Approach 2: transpose + pair swaps" : "Approach 1: transpose + row.reverse()" },
    codeLines: [3],
    vars: [{ name: "n", value: n }],
    note: { vi: "Xoay 90° clockwise bằng hai phép biến đổi: transpose qua đường chéo chính, rồi đảo trái-phải từng hàng.", en: "Rotate 90° clockwise with two transforms: transpose across the main diagonal, then reverse every row left-to-right." },
  });

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const before = [m[i][j], m[j][i]];
      [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
      transposeSwaps++;
      gsnap({
        phase: "transpose",
        title: { vi: `Transpose: đổi (${i},${j}) ↔ (${j},${i})`, en: `Transpose: swap (${i},${j}) ↔ (${j},${i})` },
        activeCells: [[i, j], [j, i]],
        swap: { kind: "transpose", a: [i, j], b: [j, i], before, after: [m[i][j], m[j][i]] },
        codeLines: [4, 5, 6],
        vars: [{ name: "i,j", value: `${i},${j}` }, { name: "swaps", value: `${transposeSwaps}/${totalTransposeSwaps}` }],
        note: { vi: "Hai ô đối xứng qua đường chéo chính đổi chỗ. Các ô trên đường chéo giữ nguyên.", en: "The two cells mirrored across the main diagonal trade places. Diagonal cells stay fixed." },
      });
    }
  }

  gsnap({
    phase: "transpose-done",
    title: { vi: "Transpose hoàn tất", en: "Transpose complete" },
    codeLines: approach === 2 ? [7, 8] : [7],
    vars: [{ name: "swaps", value: transposeSwaps }],
    note: { vi: "Ma trận đã phản chiếu qua đường chéo chính. Bây giờ đảo trái-phải từng hàng để hoàn tất góc xoay.", en: "The matrix is reflected across its main diagonal. Now reverse each row left-to-right to finish the rotation." },
  });

  if (approach === 2) {
    for (let i = 0; i < n; i++) {
      const pairs = Math.floor(n / 2);
      if (pairs === 0) {
        reversedRows.push(i);
        gsnap({
          phase: "reverse-row",
          title: { vi: `Hàng ${i} chỉ có một ô`, en: `Row ${i} has one cell` },
          activeRow: i,
          codeLines: [7, 8],
          vars: [{ name: "row", value: i }],
          note: { vi: "Không có cặp trái-phải nào cần đổi; hàng này đã được đảo xong.", en: "There is no left-right pair to swap; this row is already reversed." },
        });
      }
      for (let j = 0; j < pairs; j++) {
        const k = n - 1 - j;
        const before = [m[i][j], m[i][k]];
        [m[i][j], m[i][k]] = [m[i][k], m[i][j]];
        if (j === pairs - 1) reversedRows.push(i);
        gsnap({
          phase: "reverse-swap",
          title: { vi: `Đảo hàng ${i}: đổi cột ${j} ↔ ${k}`, en: `Reverse row ${i}: swap columns ${j} ↔ ${k}` },
          activeCells: [[i, j], [i, k]],
          activeRow: i,
          swap: { kind: "reverse", a: [i, j], b: [i, k], before, after: [m[i][j], m[i][k]] },
          codeLines: [7, 8, 9],
          vars: [{ name: "i,j", value: `${i},${j}` }, { name: "n-1-j", value: k }],
          note: { vi: "Đổi một cặp đối xứng trái-phải trong cùng hàng. Khi mọi cặp xong, cả hàng đã đảo ngược.", en: "Swap one mirrored left-right pair in this row. Once every pair is done, the row is reversed." },
        });
      }
    }
  } else {
    for (let i = 0; i < n; i++) {
      const beforeRow = [...m[i]];
      m[i].reverse();
      reversedRows.push(i);
      gsnap({
        phase: "reverse-row",
        title: { vi: `row.reverse(): đảo toàn bộ hàng ${i}`, en: `row.reverse(): reverse all of row ${i}` },
        activeCells: [[i, 0], [i, n - 1]],
        activeRow: i,
        swap: { kind: "row-reverse", row: i, beforeRow, afterRow: [...m[i]] },
        codeLines: [7, 8],
        vars: [{ name: "row", value: i }, { name: "done", value: `${reversedRows.length}/${n}` }],
        note: { vi: "Đảo thứ tự từ trái sang phải của cả hàng. Hàng này đã ở đúng vị trí trong ma trận xoay.", en: "Reverse the entire row left-to-right. This row is now in its final rotated position." },
      });
    }
  }
  gsnap({
    phase: "done",
    title: { vi: "Hoàn tất xoay 90° theo chiều kim đồng hồ", en: "90° clockwise rotation complete" },
    final: true,
    codeLines: approach === 2 ? [9] : [8],
    vars: [{ name: "matrix", value: JSON.stringify(m) }],
    note: { vi: "Mỗi ô ban đầu (r,c) đã đi đến (c,n-1-r). Ma trận được sửa trực tiếp, không cần ma trận phụ.", en: "Every original cell (r,c) moved to (c,n-1-r). The matrix was modified in place with no extra matrix." },
  });
  return { original, answer: m, steps };
}

/** LeetCode 54: Spiral Matrix. */
function buildSteps54(input) {
  const m = parseMatrix(input);
  const R = m.length, C = m[0].length;
  const steps = [];
  const result = [];
  const visited = new Set();
  let top = 0, bottom = R - 1, left = 0, right = C - 1;
  let layer = 0;

  function gsnap(o) {
    const visitedCells = [...visited].map((key, index) => {
      const [row, col] = key.split(",").map(Number);
      return { row, col, value: m[row][col], order: index + 1 };
    });
    steps.push({
      title: o.title,
      arr: [],
      grid: {
        dp: m.map((row) => [...row]),
        text1: Array.from({ length: R }, (_, i) => String(i)).join(""),
        text2: Array.from({ length: C }, (_, i) => String(i)).join(""),
        hlCell: o.hlCell || null,
        pathCells: visitedCells.map((cell) => [cell.row, cell.col]),
        largeCells: true,
      },
      spiral54View: {
        matrix: m.map((row) => [...row]),
        rows: R,
        cols: C,
        bounds: { top, bottom, left, right },
        layer,
        phase: o.phase || "check-loop",
        direction: o.direction || null,
        activeCell: o.hlCell || null,
        visitedCells,
        result: result.slice(),
        boundaryChange: o.boundaryChange || null,
        guard: o.guard || null,
        remainingCount: R * C - visited.size,
      },
      highlight: [],
      mark: [],
      final: o.final || false,
      codeLines: o.codeLines || [],
      vars: o.vars || [],
      note: o.note,
    });
  }

  gsnap({ title: { vi: "Khởi tạo result và 4 biên", en: "Initialize result and 4 bounds" }, phase: "init", codeLines: [3, 4, 5], vars: [{ name: "R,C", value: `${R},${C}` }, { name: "top,bottom", value: `${top},${bottom}` }, { name: "left,right", value: `${left},${right}` }], note: { vi: "Bốn biên bao quanh vùng CHƯA duyệt. Thứ tự mỗi vòng là TOP → RIGHT → BOTTOM → LEFT.", en: "The four bounds enclose the UNVISITED region. Each layer follows TOP → RIGHT → BOTTOM → LEFT." } });
  while (top <= bottom && left <= right) {
    gsnap({ title: { vi: `Lớp ${layer + 1}: kiểm tra 4 biên`, en: `Layer ${layer + 1}: check all four bounds` }, phase: "check-loop", direction: "top", codeLines: [6], vars: [{ name: "top,bottom", value: `${top},${bottom}` }, { name: "left,right", value: `${left},${right}` }], note: { vi: `top ≤ bottom và left ≤ right nên vùng [${top}..${bottom}] × [${left}..${right}] vẫn còn ô.`, en: `top ≤ bottom and left ≤ right, so region [${top}..${bottom}] × [${left}..${right}] still contains cells.` } });
    for (let c = left; c <= right; c++) {
      result.push(m[top][c]);
      visited.add(`${top},${c}`);
      gsnap({ title: { vi: `TOP: lấy matrix[${top}][${c}] = ${m[top][c]}`, en: `TOP: take matrix[${top}][${c}] = ${m[top][c]}` }, phase: "scan-top", direction: "top", hlCell: [top, c], codeLines: [7, 8], vars: [{ name: "c", value: c }, { name: "res", value: `[${result.join(",")}]` }], note: { vi: `Đi trái → phải trên hàng top=${top}, từ c=${left} đến c=${right}.`, en: `Move left → right on row top=${top}, from c=${left} through c=${right}.` } });
    }
    const previousTop = top;
    top++;
    gsnap({ title: { vi: `Co TOP: ${previousTop} → ${top}`, en: `Shrink TOP: ${previousTop} → ${top}` }, phase: "shrink-top", direction: "top", boundaryChange: { name: "top", from: previousTop, to: top }, codeLines: [9], vars: [{ name: "top", value: top }, { name: "res", value: `[${result.join(",")}]` }], note: { vi: `Hàng ${previousTop} đã xong, nên top đi xuống hàng ${top}.`, en: `Row ${previousTop} is complete, so top moves down to row ${top}.` } });
    for (let r = top; r <= bottom; r++) {
      result.push(m[r][right]);
      visited.add(`${r},${right}`);
      gsnap({ title: { vi: `RIGHT: lấy matrix[${r}][${right}] = ${m[r][right]}`, en: `RIGHT: take matrix[${r}][${right}] = ${m[r][right]}` }, phase: "scan-right", direction: "right", hlCell: [r, right], codeLines: [10, 11], vars: [{ name: "r", value: r }, { name: "res", value: `[${result.join(",")}]` }], note: { vi: `Đi trên → dưới trên cột right=${right}, từ r=${top} đến r=${bottom}.`, en: `Move top → bottom on column right=${right}, from r=${top} through r=${bottom}.` } });
    }
    const previousRight = right;
    right--;
    gsnap({ title: { vi: `Co RIGHT: ${previousRight} → ${right}`, en: `Shrink RIGHT: ${previousRight} → ${right}` }, phase: "shrink-right", direction: "right", boundaryChange: { name: "right", from: previousRight, to: right }, codeLines: [12], vars: [{ name: "right", value: right }, { name: "res", value: `[${result.join(",")}]` }], note: { vi: `Cột ${previousRight} đã xong, nên right dịch trái sang cột ${right}.`, en: `Column ${previousRight} is complete, so right moves left to column ${right}.` } });
    gsnap({ title: { vi: "Có còn hàng BOTTOM không?", en: "Does a BOTTOM row remain?" }, phase: "check-bottom", direction: "bottom", guard: { expression: "top <= bottom", left: top, right: bottom, pass: top <= bottom }, codeLines: [13], vars: [{ name: "top,bottom", value: `${top},${bottom}` }], note: { vi: top <= bottom ? `${top} ≤ ${bottom}: còn hàng bottom=${bottom}, tiếp tục quét phải → trái.` : `${top} > ${bottom}: không còn hàng, phải bỏ qua để tránh lấy trùng.`, en: top <= bottom ? `${top} ≤ ${bottom}: row bottom=${bottom} remains; scan right → left.` : `${top} > ${bottom}: no row remains; skip it to avoid duplicates.` } });
    if (top <= bottom) {
      for (let c = right; c >= left; c--) {
        result.push(m[bottom][c]);
        visited.add(`${bottom},${c}`);
        gsnap({ title: { vi: `BOTTOM: lấy matrix[${bottom}][${c}] = ${m[bottom][c]}`, en: `BOTTOM: take matrix[${bottom}][${c}] = ${m[bottom][c]}` }, phase: "scan-bottom", direction: "bottom", hlCell: [bottom, c], codeLines: [14, 15], vars: [{ name: "c", value: c }, { name: "res", value: `[${result.join(",")}]` }], note: { vi: `Đi phải → trái trên hàng bottom=${bottom}, từ c=${right} về c=${left}.`, en: `Move right → left on row bottom=${bottom}, from c=${right} back to c=${left}.` } });
      }
      const previousBottom = bottom;
      bottom--;
      gsnap({ title: { vi: `Co BOTTOM: ${previousBottom} → ${bottom}`, en: `Shrink BOTTOM: ${previousBottom} → ${bottom}` }, phase: "shrink-bottom", direction: "bottom", boundaryChange: { name: "bottom", from: previousBottom, to: bottom }, codeLines: [16], vars: [{ name: "bottom", value: bottom }, { name: "res", value: `[${result.join(",")}]` }], note: { vi: `Hàng ${previousBottom} đã xong, nên bottom đi lên hàng ${bottom}.`, en: `Row ${previousBottom} is complete, so bottom moves up to row ${bottom}.` } });
    }
    gsnap({ title: { vi: "Có còn cột LEFT không?", en: "Does a LEFT column remain?" }, phase: "check-left", direction: "left", guard: { expression: "left <= right", left, right, pass: left <= right }, codeLines: [17], vars: [{ name: "left,right", value: `${left},${right}` }], note: { vi: left <= right ? `${left} ≤ ${right}: còn cột left=${left}, tiếp tục quét dưới → trên.` : `${left} > ${right}: không còn cột, phải bỏ qua để tránh lấy trùng.`, en: left <= right ? `${left} ≤ ${right}: column left=${left} remains; scan bottom → top.` : `${left} > ${right}: no column remains; skip it to avoid duplicates.` } });
    if (left <= right) {
      for (let r = bottom; r >= top; r--) {
        result.push(m[r][left]);
        visited.add(`${r},${left}`);
        gsnap({ title: { vi: `LEFT: lấy matrix[${r}][${left}] = ${m[r][left]}`, en: `LEFT: take matrix[${r}][${left}] = ${m[r][left]}` }, phase: "scan-left", direction: "left", hlCell: [r, left], codeLines: [18, 19], vars: [{ name: "r", value: r }, { name: "res", value: `[${result.join(",")}]` }], note: { vi: `Đi dưới → trên trên cột left=${left}, từ r=${bottom} về r=${top}.`, en: `Move bottom → top on column left=${left}, from r=${bottom} back to r=${top}.` } });
      }
      const previousLeft = left;
      left++;
      gsnap({ title: { vi: `Co LEFT: ${previousLeft} → ${left}`, en: `Shrink LEFT: ${previousLeft} → ${left}` }, phase: "shrink-left", direction: "left", boundaryChange: { name: "left", from: previousLeft, to: left }, codeLines: [20], vars: [{ name: "left", value: left }, { name: "res", value: `[${result.join(",")}]` }], note: { vi: `Cột ${previousLeft} đã xong, nên left dịch phải sang cột ${left}.`, en: `Column ${previousLeft} is complete, so left moves right to column ${left}.` } });
    }
    layer++;
  }
  gsnap({ title: { vi: `Kết quả: [${result.join(",")}]`, en: `Result: [${result.join(",")}]` }, phase: "done", final: true, codeLines: [21], vars: [{ name: "answer", value: `[${result.join(",")}]` }], note: { vi: "Bốn biên đã giao nhau; mọi ô xuất hiện đúng một lần theo thứ tự xoắn ốc.", en: "The four bounds have crossed; every cell appears exactly once in spiral order." } });
  return { original: m, answer: result, steps };
}

/** LeetCode 189: Rotate Array — reverse trick. */
function buildSteps189(input, params) {
  const arr = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const n = arr.length;
  let k = (params && params.k !== undefined ? Number(params.k) : 3) % n;
  const steps = [];
  const rev = (lo, hi) => { while (lo < hi) { [arr[lo], arr[hi]] = [arr[hi], arr[lo]]; lo++; hi--; } };
  steps.push({ title: { vi: `k = ${k}`, en: `k = ${k}` }, arr: [...arr], sub: arr.map((_, i) => `[${i}]`), highlight: [], mark: [], codeLines: [3], vars: [{ name: "n", value: n }, { name: "k", value: k }], note: { vi: "Xoay phải k = đảo toàn bộ, rồi đảo k phần tử đầu, rồi đảo phần còn lại.", en: "Right rotate by k = reverse whole, reverse first k, reverse the rest." } });
  rev(0, n - 1);
  steps.push({ title: { vi: "Đảo toàn bộ mảng", en: "Reverse the whole array" }, arr: [...arr], sub: arr.map((_, i) => `[${i}]`), highlight: [], mark: Array.from({ length: n }, (_, i) => i), codeLines: [4], vars: [{ name: "arr", value: `[${arr.join(",")}]` }], note: { vi: "Bước 1: đảo ngược toàn bộ.", en: "Step 1: reverse everything." } });
  rev(0, k - 1);
  steps.push({ title: { vi: `Đảo ${k} phần tử đầu`, en: `Reverse first ${k}` }, arr: [...arr], sub: arr.map((_, i) => `[${i}]`), highlight: [], mark: Array.from({ length: k }, (_, i) => i), codeLines: [5], vars: [{ name: "arr", value: `[${arr.join(",")}]` }], note: { vi: "Bước 2: đảo k phần tử đầu để đúng thứ tự.", en: "Step 2: reverse the first k to fix order." } });
  rev(k, n - 1);
  steps.push({ title: { vi: `Đảo phần còn lại`, en: `Reverse the rest` }, arr: [...arr], sub: arr.map((_, i) => `[${i}]`), highlight: [], mark: Array.from({ length: n - k }, (_, i) => k + i), final: true, codeLines: [6], vars: [{ name: "answer", value: `[${arr.join(",")}]` }], note: { vi: `Bước 3: đảo phần còn lại → mảng đã xoay phải ${k}.`, en: `Step 3: reverse the rest → array rotated right by ${k}.` } });
  return { original: input, answer: arr, steps };
}

/** LeetCode 238: Product of Array Except Self — prefix × suffix. */
function buildSteps238(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const n = nums.length;
  const ans = new Array(n).fill(1);
  const steps = [];
  steps.push({ title: { vi: "answer = [1,...]", en: "answer = [1,...]" }, arr: [...nums], sub: ans.map(String), highlight: [], mark: [], codeLines: [3], vars: [{ name: "nums", value: `[${nums.join(",")}]` }], note: { vi: "answer[i] = tích prefix (bên trái) × tích suffix (bên phải), không dùng phép chia.", en: "answer[i] = prefix product (left) × suffix product (right), without division." } });
  let prefix = 1;
  for (let i = 0; i < n; i++) { ans[i] = prefix; prefix *= nums[i]; steps.push({ title: { vi: `prefix pass i=${i}: answer[${i}]=${ans[i]}`, en: `prefix pass i=${i}: answer[${i}]=${ans[i]}` }, arr: [...nums], sub: ans.map(String), highlight: [i], mark: [], codeLines: [4, 5, 6], vars: [{ name: "i", value: i }, { name: "prefix (after)", value: prefix }, { name: "answer", value: `[${ans.join(",")}]` }], note: { vi: `answer[${i}] = tích các phần tử bên TRÁI = ${ans[i]}. prefix nhân nums[${i}] → ${prefix}.`, en: `answer[${i}] = product of elements to the LEFT = ${ans[i]}. prefix ×= nums[${i}] → ${prefix}.` } }); }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) { ans[i] *= suffix; suffix *= nums[i]; steps.push({ title: { vi: `suffix pass i=${i}: answer[${i}]=${ans[i]}`, en: `suffix pass i=${i}: answer[${i}]=${ans[i]}` }, arr: [...nums], sub: ans.map(String), highlight: [i], mark: [], codeLines: [7, 8, 9], vars: [{ name: "i", value: i }, { name: "suffix (after)", value: suffix }, { name: "answer", value: `[${ans.join(",")}]` }], note: { vi: `answer[${i}] ×= tích bên PHẢI → ${ans[i]}. suffix nhân nums[${i}] → ${suffix}.`, en: `answer[${i}] ×= product to the RIGHT → ${ans[i]}. suffix ×= nums[${i}] → ${suffix}.` } }); }
  steps.push({ title: { vi: `Kết quả: [${ans.join(",")}]`, en: `Result: [${ans.join(",")}]` }, arr: [...nums], sub: ans.map(String), highlight: [], mark: Array.from({ length: n }, (_, i) => i), final: true, codeLines: [10], vars: [{ name: "answer", value: `[${ans.join(",")}]` }], note: { vi: "Tích mọi phần tử trừ chính nó.", en: "Product of all elements except self." } });
  return { original: nums, answer: ans, steps };
}

/** LeetCode 128: Longest Consecutive Sequence — hash set, only start at run heads. */
function buildSteps128(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const set = new Set(nums);
  const steps = [];
  let best = 0;
  steps.push({ title: { vi: "num_set = set(nums)", en: "num_set = set(nums)" }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], codeLines: [3], vars: [{ name: "num_set", value: `{${[...set].join(",")}}` }], note: { vi: "Với mỗi số là ĐẦU dãy (num-1 không có trong set), đếm độ dài dãy liên tiếp.", en: "For each number that STARTS a run (num-1 not in set), count the consecutive run length." } });
  for (const num of set) {
    if (!set.has(num - 1)) {
      let len = 1;
      while (set.has(num + len)) len++;
      best = Math.max(best, len);
      steps.push({ title: { vi: `${num} là đầu dãy → dài ${len}`, en: `${num} starts a run → length ${len}` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: nums.map((v, i) => (v >= num && v < num + len ? i : -1)).filter((x) => x >= 0), mark: [], codeLines: [4, 5, 6, 7, 8], vars: [{ name: "num", value: num }, { name: "run length", value: len }, { name: "best", value: best }], note: { vi: `${num - 1} không có trong set → ${num} là đầu dãy. Đếm ${num}..${num + len - 1} → độ dài ${len}. best=${best}.`, en: `${num - 1} not in set → ${num} is a run head. Count ${num}..${num + len - 1} → length ${len}. best=${best}.` } });
    } else {
      steps.push({ title: { vi: `${num} không phải đầu dãy → bỏ`, en: `${num} not a run head → skip` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], codeLines: [4], vars: [{ name: "num", value: num }], note: { vi: `${num - 1} có trong set → ${num} nằm giữa dãy → bỏ để tránh đếm lại.`, en: `${num - 1} in set → ${num} is mid-run → skip to avoid recount.` } });
    }
  }
  steps.push({ title: { vi: `Đáp án: ${best}`, en: `Answer: ${best}` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], final: true, codeLines: [9], vars: [{ name: "answer", value: best }], note: { vi: `Dãy liên tiếp dài nhất = ${best}.`, en: `Longest consecutive run = ${best}.` } });
  return { original: nums, answer: best, steps };
}

/** LeetCode 240: Search a 2D Matrix II — staircase search from the top-right. */
function buildSteps240(input, params) {
  const m = parseMatrix(input);
  const R = m.length, C = m[0].length;
  const target = Number(params && params.target !== undefined ? params.target : 5);
  const steps = [];
  const visited = new Set();
  function gsnap(o) {
    steps.push({
      title: o.title, arr: [],
      grid: {
        dp: m.map((r) => [...r]),
        text1: Array.from({ length: R }, (_, i) => String(i)).join(""),
        text2: Array.from({ length: C }, (_, i) => String(i)).join(""),
        hlCell: o.hlCell || null,
        pathCells: [...visited].map((k) => k.split(",").map(Number)),
        largeCells: true,
      },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [], vars: o.vars || [], note: o.note,
    });
  }
  gsnap({
    title: { vi: "Bắt đầu từ góc trên-phải", en: "Start at the top-right corner" },
    codeLines: [5],
    vars: [{ name: "target", value: target }, { name: "row", value: 0 }, { name: "col", value: C - 1 }],
    note: {
      vi: `Ma trận ${R}×${C}: mỗi hàng tăng dần trái→phải, mỗi cột tăng dần trên→dưới. Bắt đầu ở góc trên-phải (0, ${C - 1}): đi TRÁI nếu giá trị > target, đi XUỐNG nếu < target.`,
      en: `${R}×${C} matrix: rows increase left→right, cols increase top→bottom. Start at top-right (0, ${C - 1}): go LEFT if value > target, go DOWN if value < target.`,
    },
  });
  let row = 0, col = C - 1;
  while (row < R && col >= 0) {
    const value = m[row][col];
    visited.add(`${row},${col}`);
    if (value === target) {
      gsnap({
        title: { vi: `matrix[${row}][${col}] = ${value} = target ✓`, en: `matrix[${row}][${col}] = ${value} = target ✓` },
        hlCell: [row, col], final: true, codeLines: [7, 8, 9],
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "value", value }, { name: "found", value: true }],
        note: { vi: `Tìm thấy target=${target} tại ô (${row}, ${col}) → trả về True.`, en: `Found target=${target} at cell (${row}, ${col}) → return True.` },
      });
      return { original: m, answer: true, steps };
    }
    if (value > target) {
      gsnap({
        title: { vi: `${value} > ${target} → sang trái (col--)`, en: `${value} > ${target} → go left (col--)` },
        hlCell: [row, col], codeLines: [7, 10, 11],
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "value", value }],
        note: { vi: `matrix[${row}][${col}]=${value} > target. Mọi ô còn lại của cột ${col} còn lớn hơn → loại cột này, col = ${col - 1}.`, en: `matrix[${row}][${col}]=${value} > target. The rest of column ${col} is even larger → drop it, col = ${col - 1}.` },
      });
      col -= 1;
    } else {
      gsnap({
        title: { vi: `${value} < ${target} → xuống dưới (row++)`, en: `${value} < ${target} → go down (row++)` },
        hlCell: [row, col], codeLines: [7, 10, 12, 13],
        vars: [{ name: "row", value: row }, { name: "col", value: col }, { name: "value", value }],
        note: { vi: `matrix[${row}][${col}]=${value} < target. Mọi ô còn lại bên trái của hàng ${row} còn nhỏ hơn → loại hàng này, row = ${row + 1}.`, en: `matrix[${row}][${col}]=${value} < target. The rest of row ${row} to the left is even smaller → drop it, row = ${row + 1}.` },
      });
      row += 1;
    }
  }
  gsnap({
    title: { vi: `Không tìm thấy ${target}`, en: `${target} not found` },
    final: true, codeLines: [6, 14], vars: [{ name: "found", value: false }],
    note: { vi: `Đã ra khỏi ma trận mà chưa gặp target → trả về False.`, en: `Walked off the matrix without meeting target → return False.` },
  });
  return { original: m, answer: false, steps };
}

/** LeetCode 287: Find the Duplicate Number — Floyd's tortoise & hare. */
function buildSteps287(input) {
  const nums = Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const n = nums.length;
  const sub = nums.map((_, i) => `[${i}]`);
  const steps = [];
  let slow = nums[0], fast = nums[0];
  steps.push({
    title: { vi: "slow = fast = nums[0]", en: "slow = fast = nums[0]" },
    arr: [...nums], sub, highlight: [0], mark: [], codeLines: [3],
    vars: [{ name: "slow", value: slow }, { name: "fast", value: fast }],
    note: { vi: `Coi mỗi giá trị là con trỏ i→nums[i]. Số bị lặp tạo ra một CHU TRÌNH. slow=fast=nums[0]=${slow}.`, en: `Treat each value as a pointer i→nums[i]. The duplicate creates a CYCLE. slow=fast=nums[0]=${slow}.` },
  });
  let guard = 0;
  while (guard++ < n * 4) {
    slow = nums[slow];
    fast = nums[nums[fast]];
    const met = slow === fast;
    steps.push({
      title: { vi: `Pha 1: slow=${slow}, fast=${fast}`, en: `Phase 1: slow=${slow}, fast=${fast}` },
      arr: [...nums], sub, highlight: [slow, fast], mark: [], codeLines: met ? [4, 5, 6, 7, 8] : [4, 5, 6, 7],
      vars: [{ name: "slow (1 bước)", value: slow }, { name: "fast (2 bước)", value: fast }, { name: "slow == fast?", value: met }],
      note: {
        vi: met
          ? `slow đi 1 bước → ${slow}; fast đi 2 bước → ${fast}. slow == fast → gặp nhau trong chu trình, break.`
          : `slow = nums[slow] = ${slow} (1 bước); fast = nums[nums[fast]] = ${fast} (2 bước). Chưa gặp nhau.`,
        en: met
          ? `slow moves 1 → ${slow}; fast moves 2 → ${fast}. slow == fast → they meet inside the cycle, break.`
          : `slow = nums[slow] = ${slow} (1 step); fast = nums[nums[fast]] = ${fast} (2 steps). Not met yet.`,
      },
    });
    if (met) break;
  }
  slow = nums[0];
  steps.push({
    title: { vi: "Pha 2: đặt lại slow = nums[0]", en: "Phase 2: reset slow to nums[0]" },
    arr: [...nums], sub, highlight: [slow, fast], mark: [], codeLines: [9],
    vars: [{ name: "slow", value: slow }, { name: "fast", value: fast }],
    note: { vi: `Đặt lại slow = nums[0] = ${slow}. Cho slow và fast cùng đi 1 bước tới khi gặp nhau → đó là cửa vào chu trình = số bị lặp.`, en: `Reset slow = nums[0] = ${slow}. Advance slow and fast one step each until they meet → the cycle entrance = the duplicate.` },
  });
  guard = 0;
  while (slow !== fast && guard++ < n * 4) {
    slow = nums[slow];
    fast = nums[fast];
    steps.push({
      title: { vi: `slow=${slow}, fast=${fast}`, en: `slow=${slow}, fast=${fast}` },
      arr: [...nums], sub, highlight: [slow, fast], mark: [], codeLines: [10, 11, 12],
      vars: [{ name: "slow", value: slow }, { name: "fast", value: fast }, { name: "slow == fast?", value: slow === fast }],
      note: { vi: `slow = nums[slow] = ${slow}; fast = nums[fast] = ${fast} (mỗi bên 1 bước).`, en: `slow = nums[slow] = ${slow}; fast = nums[fast] = ${fast} (one step each).` },
    });
  }
  steps.push({
    title: { vi: `Số bị lặp = ${slow}`, en: `Duplicate = ${slow}` },
    arr: [...nums], sub, highlight: [slow], mark: [slow], final: true, codeLines: [13],
    vars: [{ name: "answer", value: slow }],
    note: { vi: `slow và fast gặp nhau tại cửa vào chu trình = ${slow} → đó là số bị lặp.`, en: `slow and fast meet at the cycle entrance = ${slow} → the duplicated number.` },
  });
  return { original: nums, answer: slow, steps };
}

function parseRectangles850(input) {
  if (Array.isArray(input)) {
    return input.map((rectangle) => Array.isArray(rectangle) ? rectangle.map(Number) : []).filter((rectangle) => rectangle.length === 4);
  }
  return String(input)
    .split(";")
    .map((part) => part.split(",").map((value) => Number(value.trim())))
    .filter((rectangle) => rectangle.length === 4 && rectangle.every(Number.isFinite));
}

/** LeetCode 850: Rectangle Area II — sweep x-events and merge active y-intervals. */
function buildSteps850(input) {
  const rectangles = parseRectangles850(input);
  const valid = rectangles.length > 0 && rectangles.every(([x1, y1, x2, y2]) => (
    [x1, y1, x2, y2].every(Number.isInteger) && x1 < x2 && y1 < y2
  ));
  const steps = [];
  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [2],
      vars: [{ name: "rectangles", value: JSON.stringify(rectangles) }],
      note: {
        vi: "Nhập mỗi hình theo dạng x1,y1,x2,y2; các hình cách nhau bằng dấu chấm phẩy và cần x1 < x2, y1 < y2.",
        en: "Enter each rectangle as x1,y1,x2,y2 separated by semicolons, with x1 < x2 and y1 < y2.",
      },
    });
    return { original: rectangles, answer: 0, steps };
  }

  const MOD = 1000000007n;
  const events = [];
  const active = [];
  const processedBands = [];
  let prevX = null;
  let sweepX = null;
  let coveredY = 0;
  let currentEnd = null;
  let currentInterval = null;
  let mergedSegments = [];
  let currentBand = null;
  let areaExact = 0n;
  let stripArea = 0n;
  let currentEventIndex = -1;
  let processedEventCount = 0;
  let currentRectId = null;

  const mergeIntervals = (items) => {
    const sorted = [...items].sort((a, b) => a.y1 - b.y1 || a.y2 - b.y2 || a.rectId - b.rectId);
    const merged = [];
    for (const interval of sorted) {
      const last = merged[merged.length - 1];
      if (!last || interval.y1 > last.y2) merged.push({ y1: interval.y1, y2: interval.y2 });
      else last.y2 = Math.max(last.y2, interval.y2);
    }
    return merged;
  };

  function addStep({ title, codeLine, phase, vars = [], note, final = false }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
      rectangleAreaView: {
        phase,
        rectangles: rectangles.map(([x1, y1, x2, y2], index) => ({ id: index + 1, x1, y1, x2, y2 })),
        events: events.map((event, index) => ({
          ...event,
          index,
          isCurrent: index === currentEventIndex,
          isProcessed: index < processedEventCount,
        })),
        active: active.map((interval) => ({ ...interval })),
        prevX,
        sweepX,
        coveredY,
        currentEnd: currentEnd === -Infinity ? "-∞" : currentEnd,
        currentInterval: currentInterval ? { ...currentInterval } : null,
        mergedSegments: mergedSegments.map((segment) => ({ ...segment })),
        processedBands: processedBands.map((band) => ({ ...band, segments: band.segments.map((segment) => ({ ...segment })) })),
        currentBand: currentBand ? { ...currentBand, segments: currentBand.segments.map((segment) => ({ ...segment })) } : null,
        area: areaExact.toString(),
        stripArea: stripArea.toString(),
        currentRectId,
        answer: final ? Number(areaExact % MOD) : null,
      },
    });
  }

  addStep({
    title: { vi: "MOD = 10⁹ + 7", en: "MOD = 10⁹ + 7" }, codeLine: 3, phase: "build",
    vars: [{ name: "MOD", value: "1000000007" }],
    note: { vi: "Chỉ áp dụng modulo khi trả kết quả; visualization vẫn giữ diện tích chính xác.", en: "Modulo is applied only to the returned result; the visualization keeps the exact area." },
  });
  addStep({
    title: { vi: "events = []", en: "events = []" }, codeLine: 4, phase: "build",
    vars: [{ name: "events", value: "[]" }],
    note: { vi: "Mỗi hình tạo một event START tại x1 và một event END tại x2.", en: "Each rectangle creates a START event at x1 and an END event at x2." },
  });

  rectangles.forEach(([x1, y1, x2, y2], index) => {
    const rectId = index + 1;
    currentRectId = rectId;
    addStep({
      title: { vi: `Đọc R${rectId} = [${x1},${y1},${x2},${y2}]`, en: `Read R${rectId} = [${x1},${y1},${x2},${y2}]` }, codeLine: 5, phase: "build",
      vars: [{ name: "x1,y1,x2,y2", value: `${x1},${y1},${x2},${y2}` }],
      note: { vi: `R${rectId} phủ x trong [${x1},${x2}) và y trong [${y1},${y2}).`, en: `R${rectId} covers x in [${x1},${x2}) and y in [${y1},${y2}).` },
    });
    events.push({ x: x1, type: 1, y1, y2, rectId });
    addStep({
      title: { vi: `Thêm START R${rectId} tại x=${x1}`, en: `Add START R${rectId} at x=${x1}` }, codeLine: 6, phase: "build",
      vars: [{ name: "event", value: `(${x1}, +1, ${y1}, ${y2})` }, { name: "events.length", value: events.length }],
      note: { vi: `Khi đường quét tới x=${x1}, đoạn y=[${y1},${y2}) bắt đầu hoạt động.`, en: `When the sweep reaches x=${x1}, y=[${y1},${y2}) becomes active.` },
    });
    events.push({ x: x2, type: -1, y1, y2, rectId });
    addStep({
      title: { vi: `Thêm END R${rectId} tại x=${x2}`, en: `Add END R${rectId} at x=${x2}` }, codeLine: 7, phase: "build",
      vars: [{ name: "event", value: `(${x2}, -1, ${y1}, ${y2})` }, { name: "events.length", value: events.length }],
      note: { vi: `Tại x=${x2}, đoạn y của R${rectId} sẽ bị xóa khỏi active.`, en: `At x=${x2}, R${rectId}'s y-interval will be removed from active.` },
    });
  });

  currentRectId = null;
  events.sort((a, b) => a.x - b.x || a.type - b.type || a.rectId - b.rectId);
  addStep({
    title: { vi: "Sắp xếp events theo x", en: "Sort events by x" }, codeLine: 8, phase: "sort",
    vars: [{ name: "events", value: `[${events.map((event) => `(${event.x},${event.type > 0 ? "+1" : "-1"},R${event.rectId})`).join(", ")}]` }],
    note: { vi: "Đường quét xử lý event từ trái sang phải; END đứng trước START nếu cùng x.", en: "The sweep processes events left to right; END precedes START when x is tied." },
  });
  addStep({
    title: { vi: "active = []", en: "active = []" }, codeLine: 9, phase: "init",
    vars: [{ name: "active", value: "[]" }],
    note: { vi: "active chứa các đoạn y của hình đang cắt qua dải x hiện tại.", en: "active stores y-intervals from rectangles crossing the current x-strip." },
  });
  prevX = events[0].x;
  sweepX = prevX;
  addStep({
    title: { vi: `prev_x = ${prevX}`, en: `prev_x = ${prevX}` }, codeLine: 10, phase: "init",
    vars: [{ name: "prev_x", value: prevX }],
    note: { vi: "Chưa có chiều rộng để tính trước event đầu tiên.", en: "There is no strip width before the first event." },
  });
  addStep({
    title: { vi: "area = 0", en: "area = 0" }, codeLine: 11, phase: "init",
    vars: [{ name: "area", value: "0" }],
    note: { vi: "Diện tích sẽ được cộng từng dải giữa hai giá trị x liên tiếp.", en: "Area is accumulated one strip between consecutive x-values at a time." },
  });

  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    const { x, type, y1, y2, rectId } = event;
    currentEventIndex = index;
    currentRectId = rectId;
    sweepX = x;
    coveredY = 0;
    currentEnd = null;
    currentInterval = null;
    mergedSegments = [];
    stripArea = 0n;
    currentBand = { x1: prevX, x2: x, segments: [], coveredY: 0, area: "0", counted: false };
    addStep({
      title: { vi: `Event ${index + 1}: x=${x}, ${type === 1 ? "START" : "END"} R${rectId}`, en: `Event ${index + 1}: x=${x}, ${type === 1 ? "START" : "END"} R${rectId}` }, codeLine: 13, phase: "event",
      vars: [{ name: "x", value: x }, { name: "event_type", value: type }, { name: "y1,y2", value: `${y1},${y2}` }],
      note: { vi: `Trước khi áp dụng event tại x=${x}, tính diện tích dải [${prevX},${x}) bằng active hiện tại.`, en: `Before applying the event at x=${x}, measure strip [${prevX},${x}) using the current active set.` },
    });
    addStep({
      title: { vi: "covered_y = 0", en: "covered_y = 0" }, codeLine: 14, phase: "measure",
      vars: [{ name: "covered_y", value: 0 }, { name: "active", value: `[${active.map((item) => `R${item.rectId}[${item.y1},${item.y2})`).join(", ")}]` }],
      note: { vi: "Quét các đoạn active để tính tổng chiều dài y hợp, không cộng phần chồng lặp.", en: "Scan active intervals to compute union y-length without double-counting overlaps." },
    });
    currentEnd = -Infinity;
    addStep({
      title: { vi: "current_end = -∞", en: "current_end = -∞" }, codeLine: 15, phase: "measure",
      vars: [{ name: "current_end", value: "-∞" }],
      note: { vi: "current_end là điểm y xa nhất đã được phủ trong lúc merge.", en: "current_end is the farthest y already covered during the merge." },
    });

    const sortedActive = [...active].sort((a, b) => a.y1 - b.y1 || a.y2 - b.y2 || a.rectId - b.rectId);
    for (let activeIndex = 0; activeIndex < sortedActive.length; activeIndex++) {
      const interval = sortedActive[activeIndex];
      currentInterval = { ...interval };
      addStep({
        title: { vi: `Xét R${interval.rectId}: [${interval.y1},${interval.y2})`, en: `Inspect R${interval.rectId}: [${interval.y1},${interval.y2})` }, codeLine: 16, phase: "scan",
        vars: [{ name: "start,end", value: `${interval.y1},${interval.y2}` }, { name: "current_end", value: currentEnd === -Infinity ? "-∞" : currentEnd }],
        note: { vi: "Các đoạn được xét theo start tăng dần.", en: "Intervals are inspected by increasing start." },
      });
      const clippedStart = Math.max(currentEnd, interval.y1);
      addStep({
        title: { vi: `start = max(${currentEnd === -Infinity ? "-∞" : currentEnd}, ${interval.y1}) = ${clippedStart}`, en: `start = max(${currentEnd === -Infinity ? "-∞" : currentEnd}, ${interval.y1}) = ${clippedStart}` }, codeLine: 17, phase: "scan",
        vars: [{ name: "start", value: clippedStart }, { name: "end", value: interval.y2 }],
        note: { vi: "Nếu đoạn chồng phần đã phủ, bỏ qua phần chồng bằng cách đẩy start tới current_end.", en: "When this interval overlaps covered y, skip the overlap by moving start to current_end." },
      });
      const added = Math.max(0, interval.y2 - clippedStart);
      coveredY += added;
      addStep({
        title: { vi: `covered_y += ${added} → ${coveredY}`, en: `covered_y += ${added} → ${coveredY}` }, codeLine: 18, phase: "merge",
        vars: [{ name: "end - start", value: interval.y2 - clippedStart }, { name: "added", value: added }, { name: "covered_y", value: coveredY }],
        note: added > 0
          ? { vi: `Chỉ cộng ${added} đơn vị y chưa từng được tính.`, en: `Add only ${added} y-units not counted before.` }
          : { vi: "Đoạn này nằm hoàn toàn trong phần đã phủ nên cộng 0.", en: "This interval is fully contained in covered y, so it adds 0." },
      });
      currentEnd = Math.max(currentEnd, interval.y2);
      mergedSegments = mergeIntervals(sortedActive.slice(0, activeIndex + 1));
      currentBand = { ...currentBand, segments: mergedSegments.map((segment) => ({ ...segment })), coveredY };
      addStep({
        title: { vi: `current_end = ${currentEnd}`, en: `current_end = ${currentEnd}` }, codeLine: 19, phase: "merge",
        vars: [{ name: "current_end", value: currentEnd }, { name: "union y", value: `[${mergedSegments.map((segment) => `[${segment.y1},${segment.y2})`).join(", ")}]` }],
        note: { vi: "current_end tiến tới cuối xa nhất của hợp các đoạn đã quét.", en: "current_end advances to the farthest end of the intervals scanned so far." },
      });
    }

    currentInterval = null;
    const fullUnion = mergeIntervals(active);
    mergedSegments = fullUnion;
    const dx = x - prevX;
    stripArea = BigInt(dx) * BigInt(coveredY);
    areaExact += stripArea;
    currentBand = { x1: prevX, x2: x, segments: fullUnion.map((segment) => ({ ...segment })), coveredY, area: stripArea.toString(), counted: true };
    if (dx > 0) processedBands.push({ ...currentBand, segments: currentBand.segments.map((segment) => ({ ...segment })) });
    addStep({
      title: { vi: `area += ${dx} × ${coveredY} = ${stripArea}`, en: `area += ${dx} × ${coveredY} = ${stripArea}` }, codeLine: 20, phase: "area",
      vars: [{ name: "x - prev_x", value: dx }, { name: "covered_y", value: coveredY }, { name: "strip area", value: stripArea.toString() }, { name: "area", value: areaExact.toString() }],
      note: { vi: `Dải [${prevX},${x}) rộng ${dx}, tổng y phủ ${coveredY}; cộng đúng ${stripArea}, kể cả khi các hình chồng nhau.`, en: `Strip [${prevX},${x}) has width ${dx} and union y-length ${coveredY}; add exactly ${stripArea}, even with overlaps.` },
    });

    const isStart = type === 1;
    addStep({
      title: { vi: `event_type == 1 → ${isStart}`, en: `event_type == 1 → ${isStart}` }, codeLine: 21, phase: "update",
      vars: [{ name: "event_type", value: type }, { name: "condition", value: isStart }],
      note: isStart
        ? { vi: `START R${rectId}: thêm đoạn y sau khi dải bên trái đã được tính.`, en: `START R${rectId}: add its y-interval after measuring the strip to the left.` }
        : { vi: `END R${rectId}: xóa đoạn y sau khi dải bên trái đã được tính.`, en: `END R${rectId}: remove its y-interval after measuring the strip to the left.` },
    });
    if (isStart) {
      active.push({ y1, y2, rectId });
      addStep({
        title: { vi: `active.append([${y1},${y2}))`, en: `active.append([${y1},${y2}))` }, codeLine: 22, phase: "update",
        vars: [{ name: "active", value: `[${active.map((item) => `R${item.rectId}[${item.y1},${item.y2})`).join(", ")}]` }],
        note: { vi: `R${rectId} sẽ góp phần vào dải x tiếp theo.`, en: `R${rectId} will contribute to the next x-strip.` },
      });
    } else {
      addStep({
        title: { vi: "Đi vào nhánh else", en: "Enter the else branch" }, codeLine: 23, phase: "update",
        vars: [{ name: "event", value: `END R${rectId}` }],
        note: { vi: "Event kết thúc nên cần xóa đúng đoạn của hình này.", en: "This is an ending event, so remove this rectangle's interval." },
      });
      const removeIndex = active.findIndex((item) => item.rectId === rectId);
      if (removeIndex !== -1) active.splice(removeIndex, 1);
      addStep({
        title: { vi: `active.remove([${y1},${y2}))`, en: `active.remove([${y1},${y2}))` }, codeLine: 24, phase: "update",
        vars: [{ name: "active", value: `[${active.map((item) => `R${item.rectId}[${item.y1},${item.y2})`).join(", ")}]` }],
        note: { vi: `R${rectId} không còn phủ phần bên phải x=${x}.`, en: `R${rectId} no longer covers anything to the right of x=${x}.` },
      });
    }
    prevX = x;
    processedEventCount = index + 1;
    addStep({
      title: { vi: `prev_x = ${x}`, en: `prev_x = ${x}` }, codeLine: 25, phase: "event",
      vars: [{ name: "prev_x", value: prevX }, { name: "area", value: areaExact.toString() }],
      note: { vi: "Event kế tiếp sẽ tạo dải bắt đầu từ x này với active vừa cập nhật.", en: "The next event will form a strip starting at this x with the updated active set." },
    });
  }

  currentEventIndex = -1;
  currentRectId = null;
  currentInterval = null;
  currentBand = null;
  coveredY = 0;
  currentEnd = null;
  mergedSegments = mergeIntervals(active);
  sweepX = events[events.length - 1].x;
  const answer = Number(areaExact % MOD);
  addStep({
    title: { vi: `return ${areaExact} % 1000000007 = ${answer}`, en: `return ${areaExact} % 1000000007 = ${answer}` }, codeLine: 26, phase: "done", final: true,
    vars: [{ name: "exact area", value: areaExact.toString() }, { name: "answer", value: answer }],
    note: { vi: `Tổng diện tích hợp là ${areaExact}; sau modulo, đáp án là ${answer}.`, en: `The exact union area is ${areaExact}; after modulo, the answer is ${answer}.` },
  });
  return { original: rectangles, answer, steps };
}

/** LeetCode 4013: Count Subarrays With Even Odd Ratio II — prefix sums + Fenwick tree. */
function buildSteps4013(input, params = {}) {
  const nums = Array.isArray(input)
    ? input.map(Number)
    : String(input).split(",").map((value) => Number(value.trim())).filter(Number.isFinite);
  const a = Number(params.a);
  const b = Number(params.b);
  const steps = [];
  const valid = nums.length > 0
    && nums.every((value) => Number.isInteger(value) && value >= 1)
    && Number.isInteger(a) && a >= 1
    && Number.isInteger(b) && b >= 1;

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [...nums], highlight: [], mark: [], final: true, codeLines: [4],
      vars: [{ name: "nums", value: nums }, { name: "a", value: a }, { name: "b", value: b }],
      note: {
        vi: "nums phải chứa số nguyên dương; a và b cũng phải là số nguyên dương.",
        en: "nums must contain positive integers, and a and b must also be positive integers.",
      },
      evenOddRatioView: {
        phase: "invalid", nums: [...nums], weights: [], pref: [], values: [], bit: [],
        a, b, currentNumIndex: -1, currentPrefixIndex: -1, rank: null,
        queryIndex: null, queryPath: [], updatePath: [], queryTotal: 0,
        smaller: null, eligiblePrefixIndices: [], seen: 0, added: 0, ans: 0,
      },
    });
    return { original: nums, nums, a, b, answer: 0, steps };
  }

  const weights = Array(nums.length).fill(null);
  const pref = [0];
  let values = [];
  let bit = [];
  let ans = 0;
  let seen = 0;
  let currentNumIndex = -1;
  let currentPrefixIndex = -1;
  let rank = null;
  let queryIndex = null;
  let queryPath = [];
  let updatePath = [];
  let queryTotal = 0;
  let smaller = null;
  let eligiblePrefixIndices = [];
  let added = 0;

  function addStep({ title, codeLine, phase, vars = [], note, final = false }) {
    steps.push({
      title,
      arr: [...nums],
      highlight: currentNumIndex >= 0 ? [currentNumIndex] : [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
      evenOddRatioView: {
        phase,
        nums: [...nums],
        weights: [...weights],
        pref: [...pref],
        values: [...values],
        bit: bit.slice(1),
        a,
        b,
        currentNumIndex,
        currentPrefixIndex,
        rank,
        queryIndex,
        queryPath: [...queryPath],
        updatePath: [...updatePath],
        queryTotal,
        smaller,
        eligiblePrefixIndices: [...eligiblePrefixIndices],
        seen,
        added,
        ans,
      },
    });
  }

  addStep({
    title: { vi: "pref = [0]", en: "pref = [0]" }, codeLine: 5, phase: "prefix-init",
    vars: [{ name: "pref", value: [0] }, { name: "ratio limit", value: `${a}/${b}` }],
    note: {
      vi: "Prefix rỗng bằng 0. Mỗi số chẵn sẽ đóng góp +b, mỗi số lẻ đóng góp -a.",
      en: "The empty prefix is 0. Each even number contributes +b; each odd number contributes -a.",
    },
  });

  for (let index = 0; index < nums.length; index++) {
    currentNumIndex = index;
    const num = nums[index];
    addStep({
      title: { vi: `Đọc nums[${index}] = ${num}`, en: `Read nums[${index}] = ${num}` }, codeLine: 6, phase: "transform-read",
      vars: [{ name: "num", value: num }, { name: "parity", value: num % 2 === 0 ? "even" : "odd" }],
      note: {
        vi: `Xét tính chẵn lẻ của ${num} để đổi bài toán tỉ lệ thành tổng trọng số.`,
        en: `Inspect ${num}'s parity to turn the ratio condition into a weighted-sum condition.`,
      },
    });

    const weight = num % 2 === 0 ? b : -a;
    weights[index] = weight;
    addStep({
      title: { vi: `${num % 2 === 0 ? "Chẵn" : "Lẻ"} → weight = ${weight}`, en: `${num % 2 === 0 ? "Even" : "Odd"} → weight = ${weight}` },
      codeLine: 7, phase: "transform-weight",
      vars: [{ name: "num", value: num }, { name: "weight", value: weight }],
      note: num % 2 === 0
        ? { vi: `Số chẵn làm x tăng 1 nên b·x - a·y tăng b = ${b}.`, en: `An even number increments x, so b·x - a·y increases by b = ${b}.` }
        : { vi: `Số lẻ làm y tăng 1 nên b·x - a·y giảm a = ${a}.`, en: `An odd number increments y, so b·x - a·y decreases by a = ${a}.` },
    });

    const nextPrefix = pref[pref.length - 1] + weight;
    pref.push(nextPrefix);
    currentPrefixIndex = pref.length - 1;
    addStep({
      title: { vi: `pref[${currentPrefixIndex}] = ${nextPrefix}`, en: `pref[${currentPrefixIndex}] = ${nextPrefix}` },
      codeLine: 8, phase: "prefix-append",
      vars: [{ name: "pref[-1] before", value: nextPrefix - weight }, { name: "weight", value: weight }, { name: `pref[${currentPrefixIndex}]`, value: nextPrefix }],
      note: {
        vi: `Cộng weight ${weight}: prefix mới = ${nextPrefix - weight} + (${weight}) = ${nextPrefix}.`,
        en: `Add weight ${weight}: new prefix = ${nextPrefix - weight} + (${weight}) = ${nextPrefix}.`,
      },
    });
  }

  currentNumIndex = -1;
  currentPrefixIndex = -1;
  values = [...new Set(pref)].sort((left, right) => left - right);
  addStep({
    title: { vi: "Nén tọa độ các prefix", en: "Coordinate-compress prefixes" }, codeLine: 10, phase: "compress",
    vars: [{ name: "pref", value: pref }, { name: "values", value: values }],
    note: {
      vi: `Sắp xếp các giá trị prefix duy nhất thành [${values.join(", ")}]. Rank tăng dần cho phép Fenwick đếm theo thứ tự giá trị.`,
      en: `Sort unique prefix values as [${values.join(", ")}]. Increasing ranks let Fenwick count by value order.`,
    },
  });

  bit = Array(values.length + 1).fill(0);
  addStep({
    title: { vi: "Khởi tạo Fenwick Tree", en: "Initialize Fenwick Tree" }, codeLine: 11, phase: "bit-init",
    vars: [{ name: "len(values)", value: values.length }, { name: "bit", value: bit }],
    note: {
      vi: "BIT dùng index 1-based; mỗi lần thêm một prefix, cây lưu số lần các rank đã xuất hiện.",
      en: "BIT is 1-based; whenever a prefix is inserted, it stores how many times each rank has appeared.",
    },
  });

  ans = 0;
  addStep({
    title: { vi: "ans = 0", en: "ans = 0" }, codeLine: 25, phase: "scan-init",
    vars: [{ name: "ans", value: ans }],
    note: { vi: "ans tích lũy số subarray hợp lệ.", en: "ans accumulates the number of valid subarrays." },
  });
  seen = 0;
  addStep({
    title: { vi: "seen = 0", en: "seen = 0" }, codeLine: 26, phase: "scan-init",
    vars: [{ name: "seen", value: seen }],
    note: { vi: "seen là số prefix trước prefix hiện tại.", en: "seen is the number of prefixes before the current prefix." },
  });

  for (let prefixIndex = 0; prefixIndex < pref.length; prefixIndex++) {
    const value = pref[prefixIndex];
    currentPrefixIndex = prefixIndex;
    currentNumIndex = prefixIndex - 1;
    rank = null;
    queryIndex = null;
    queryPath = [];
    updatePath = [];
    queryTotal = 0;
    smaller = null;
    added = 0;
    eligiblePrefixIndices = Array.from({ length: prefixIndex }, (_, index) => index)
      .filter((index) => pref[index] >= value);

    addStep({
      title: { vi: `Quét pref[${prefixIndex}] = ${value}`, en: `Scan pref[${prefixIndex}] = ${value}` }, codeLine: 27, phase: "scan-prefix",
      vars: [{ name: "value", value }, { name: "seen", value: seen }],
      note: {
        vi: `Cần đếm prefix trước đó >= ${value}; mỗi prefix như vậy tạo một subarray có tổng biến đổi <= 0.`,
        en: `Count previous prefixes >= ${value}; each one creates a subarray with transformed sum <= 0.`,
      },
    });

    rank = values.indexOf(value) + 1;
    addStep({
      title: { vi: `rank(${value}) = ${rank}`, en: `rank(${value}) = ${rank}` }, codeLine: 28, phase: "find-rank",
      vars: [{ name: "value", value }, { name: "rank", value: rank }],
      note: {
        vi: `bisect_left tìm ${value} ở vị trí ${rank - 1}; cộng 1 để dùng BIT 1-based → rank ${rank}.`,
        en: `bisect_left finds ${value} at position ${rank - 1}; add 1 for the 1-based BIT → rank ${rank}.`,
      },
    });

    queryIndex = rank - 1;
    addStep({
      title: { vi: `smaller = query(${queryIndex})`, en: `smaller = query(${queryIndex})` }, codeLine: 29, phase: "query-call",
      vars: [{ name: "rank - 1", value: queryIndex }],
      note: {
        vi: `Query tới rank ${queryIndex} chỉ đếm prefix trước đó < ${value}; prefix bằng ${value} không bị loại.`,
        en: `Query through rank ${queryIndex} counts only previous prefixes < ${value}; prefixes equal to ${value} are not excluded.`,
      },
    });
    addStep({
      title: { vi: `Vào query(${queryIndex})`, en: `Enter query(${queryIndex})` }, codeLine: 18, phase: "query-enter",
      vars: [{ name: "index", value: queryIndex }],
      note: { vi: "Hàm query tính tổng tần suất từ rank 1 tới index.", en: "query returns the total frequency from rank 1 through index." },
    });
    queryTotal = 0;
    addStep({
      title: { vi: "total = 0", en: "total = 0" }, codeLine: 19, phase: "query-init",
      vars: [{ name: "total", value: queryTotal }, { name: "index", value: queryIndex }],
      note: { vi: "Bắt đầu tổng prefix nhỏ hơn từ 0.", en: "Start the smaller-prefix total at 0." },
    });

    let queryCursor = queryIndex;
    while (queryCursor > 0) {
      queryIndex = queryCursor;
      addStep({
        title: { vi: `${queryCursor} > 0 → tiếp tục query`, en: `${queryCursor} > 0 → continue query` }, codeLine: 20, phase: "query-check",
        vars: [{ name: "index", value: queryCursor }, { name: "condition", value: true }],
        note: { vi: `BIT[${queryCursor}] chứa tổng của một đoạn rank kết thúc tại ${queryCursor}.`, en: `BIT[${queryCursor}] stores a rank-range total ending at ${queryCursor}.` },
      });
      queryPath.push(queryCursor);
      const bitValue = bit[queryCursor];
      queryTotal += bitValue;
      addStep({
        title: { vi: `total += BIT[${queryCursor}] = ${bitValue}`, en: `total += BIT[${queryCursor}] = ${bitValue}` }, codeLine: 21, phase: "query-read",
        vars: [{ name: `BIT[${queryCursor}]`, value: bitValue }, { name: "total", value: queryTotal }],
        note: { vi: `Đã đếm ${queryTotal} prefix có rank nằm trong các đoạn BIT vừa ghé.`, en: `The visited BIT ranges contain ${queryTotal} prefixes so far.` },
      });
      const nextCursor = queryCursor - (queryCursor & -queryCursor);
      queryIndex = nextCursor;
      addStep({
        title: { vi: `index: ${queryCursor} → ${nextCursor}`, en: `index: ${queryCursor} → ${nextCursor}` }, codeLine: 22, phase: "query-jump",
        vars: [{ name: "lowbit", value: queryCursor & -queryCursor }, { name: "index", value: nextCursor }],
        note: { vi: "Bỏ đoạn rank vừa cộng và nhảy tới node cha tiếp theo.", en: "Skip the rank range just counted and jump to the next parent node." },
      });
      queryCursor = nextCursor;
    }
    queryIndex = 0;
    addStep({
      title: { vi: "index = 0 → dừng query", en: "index = 0 → stop query" }, codeLine: 20, phase: "query-check",
      vars: [{ name: "index", value: 0 }, { name: "condition", value: false }, { name: "total", value: queryTotal }],
      note: { vi: "Không còn đoạn BIT nào cần cộng.", en: "No more BIT ranges remain to add." },
    });
    smaller = queryTotal;
    addStep({
      title: { vi: `return total = ${smaller}`, en: `return total = ${smaller}` }, codeLine: 23, phase: "query-return",
      vars: [{ name: "smaller", value: smaller }],
      note: { vi: `Có ${smaller} prefix trước đó nhỏ hơn ${value}.`, en: `${smaller} previous prefixes are smaller than ${value}.` },
    });

    added = seen - smaller;
    ans += added;
    addStep({
      title: { vi: `ans += ${seen} - ${smaller} = ${added}`, en: `ans += ${seen} - ${smaller} = ${added}` }, codeLine: 30, phase: "count",
      vars: [{ name: "seen", value: seen }, { name: "smaller", value: smaller }, { name: "valid starts", value: added }, { name: "ans", value: ans }],
      note: {
        vi: `${seen} prefix đã thấy trừ ${smaller} prefix nhỏ hơn = ${added} prefix >= ${value}; thêm ${added} subarray hợp lệ.`,
        en: `${seen} seen prefixes minus ${smaller} smaller ones = ${added} prefixes >= ${value}; add ${added} valid subarrays.`,
      },
    });

    addStep({
      title: { vi: `add(rank ${rank})`, en: `add(rank ${rank})` }, codeLine: 31, phase: "update-call",
      vars: [{ name: "rank", value: rank }],
      note: { vi: `Đưa pref[${prefixIndex}] = ${value} vào Fenwick để các prefix sau có thể đếm nó.`, en: `Insert pref[${prefixIndex}] = ${value} into Fenwick so later prefixes can count it.` },
    });
    let updateCursor = rank;
    addStep({
      title: { vi: `Vào add(${rank})`, en: `Enter add(${rank})` }, codeLine: 13, phase: "update-enter",
      vars: [{ name: "index", value: updateCursor }],
      note: { vi: "Hàm add tăng các node BIT bao phủ rank hiện tại.", en: "add increments every BIT node whose range covers the current rank." },
    });
    while (updateCursor < bit.length) {
      addStep({
        title: { vi: `${updateCursor} < ${bit.length} → cập nhật`, en: `${updateCursor} < ${bit.length} → update` }, codeLine: 14, phase: "update-check",
        vars: [{ name: "index", value: updateCursor }, { name: "condition", value: true }],
        note: { vi: `BIT[${updateCursor}] bao phủ rank ${rank}, nên node này phải tăng 1.`, en: `BIT[${updateCursor}] covers rank ${rank}, so this node must increase by 1.` },
      });
      updatePath.push(updateCursor);
      bit[updateCursor] += 1;
      addStep({
        title: { vi: `BIT[${updateCursor}] += 1 → ${bit[updateCursor]}`, en: `BIT[${updateCursor}] += 1 → ${bit[updateCursor]}` }, codeLine: 15, phase: "update-write",
        vars: [{ name: `BIT[${updateCursor}]`, value: bit[updateCursor] }],
        note: { vi: `Node BIT[${updateCursor}] giờ ghi nhận thêm prefix có rank ${rank}.`, en: `BIT[${updateCursor}] now records one more prefix at rank ${rank}.` },
      });
      const nextCursor = updateCursor + (updateCursor & -updateCursor);
      addStep({
        title: { vi: `index: ${updateCursor} → ${nextCursor}`, en: `index: ${updateCursor} → ${nextCursor}` }, codeLine: 16, phase: "update-jump",
        vars: [{ name: "lowbit", value: updateCursor & -updateCursor }, { name: "index", value: nextCursor }],
        note: { vi: "Nhảy tới node BIT cha tiếp theo cũng bao phủ rank này.", en: "Jump to the next parent BIT node that also covers this rank." },
      });
      updateCursor = nextCursor;
    }
    addStep({
      title: { vi: `${updateCursor} < ${bit.length} → False`, en: `${updateCursor} < ${bit.length} → False` }, codeLine: 14, phase: "update-check",
      vars: [{ name: "index", value: updateCursor }, { name: "condition", value: false }],
      note: { vi: "index đã ra ngoài BIT nên add kết thúc.", en: "index is outside the BIT, so add finishes." },
    });

    seen += 1;
    addStep({
      title: { vi: `seen += 1 → ${seen}`, en: `seen += 1 → ${seen}` }, codeLine: 32, phase: "seen-update",
      vars: [{ name: "seen", value: seen }, { name: "ans", value: ans }],
      note: { vi: `pref[${prefixIndex}] đã trở thành prefix trước cho vòng lặp kế tiếp.`, en: `pref[${prefixIndex}] is now a previous prefix for the next iteration.` },
    });
  }

  currentNumIndex = -1;
  currentPrefixIndex = pref.length - 1;
  rank = values.indexOf(pref[pref.length - 1]) + 1;
  queryIndex = null;
  queryPath = [];
  updatePath = [];
  eligiblePrefixIndices = [];
  smaller = null;
  added = 0;
  addStep({
    title: { vi: `Trả về ${ans}`, en: `Return ${ans}` }, codeLine: 33, phase: "done", final: true,
    vars: [{ name: "ans", value: ans }],
    note: {
      vi: `Tổng cộng ${ans} subarray có ít nhất một số lẻ và tỉ lệ even/odd <= ${a}/${b}.`,
      en: `There are ${ans} subarrays with at least one odd number and even/odd ratio <= ${a}/${b}.`,
    },
  });

  return { original: nums, nums, a, b, answer: ans, steps };
}

/**
 * LeetCode 3731: Find Missing Elements.
 *
 * Given a sorted or unsorted array of integers, return all integers in the
 * range [nums[0], nums[-1]) (exclusive of the last element) that are NOT
 * present in nums.
 *
 * Algorithm (as given by user):
 *   1. Sort nums.
 *   2. Walk an integer counter i from nums[0] to nums[-1] (exclusive).
 *   3. If i matches nums[j], advance j. Otherwise, i is missing → append to a.
 */
function buildSteps3731(input) {
  const originalNums = [...input];
  const nums = [...input];
  const steps = [];

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [...nums],
      sub: nums.map((_, idx) => `[${idx}]`),
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Line 3: nums.sort()
  snap({
    title: { vi: "nums.sort()", en: "nums.sort()" },
    codeLines: [3],
    vars: [{ name: "nums (before sort)", value: `[${nums.join(",")}]` }],
    note: {
      vi: `nums = [${nums.join(",")}] trước khi sắp xếp. Sắp xếp để có thể dùng 1 con trỏ j đi từ trái sang phải.`,
      en: `nums = [${nums.join(",")}] before sorting. Sort so we can use a single pointer j moving left to right.`,
    },
  });
  nums.sort((a, b) => a - b);
  snap({
    title: { vi: `nums.sort() → [${nums.join(",")}]`, en: `nums.sort() → [${nums.join(",")}]` },
    codeLines: [3],
    vars: [{ name: "nums (after sort)", value: `[${nums.join(",")}]` }],
    note: {
      vi: `Sau sắp xếp: nums = [${nums.join(",")}]. Bây giờ nums[0]=${nums[0]} là giá trị nhỏ nhất, nums[-1]=${nums[nums.length - 1]} là lớn nhất.`,
      en: `After sorting: nums = [${nums.join(",")}]. Now nums[0]=${nums[0]} is the minimum, nums[-1]=${nums[nums.length - 1]} is the maximum.`,
    },
  });

  // Line 4: a = []
  const a = [];
  snap({
    title: { vi: "a = []", en: "a = []" },
    codeLines: [4],
    vars: [{ name: "a", value: "[]" }],
    note: {
      vi: "a sẽ chứa các số bị thiếu trong dải [nums[0], nums[-1]).",
      en: "a will hold the missing integers in the range [nums[0], nums[-1]).",
    },
  });

  // Line 5: j = 0
  let j = 0;
  snap({
    title: { vi: "j = 0", en: "j = 0" },
    highlight: [0],
    codeLines: [5],
    vars: [{ name: "j", value: 0 }, { name: "nums[j]", value: nums[0] }],
    note: {
      vi: `j là con trỏ vào mảng nums (đã sắp xếp). Ban đầu j=0 → nums[j]=${nums[0]}.`,
      en: `j is a pointer into the sorted nums array. Initially j=0 → nums[j]=${nums[0]}.`,
    },
  });

  const loStart = nums[0];
  const loEnd = nums[nums.length - 1];

  // Line 6: for i in range(nums[0], nums[-1]):
  for (let i = loStart; i < loEnd; i++) {
    snap({
      title: { vi: `for i in range(${loStart}, ${loEnd}): i=${i}`, en: `for i in range(${loStart}, ${loEnd}): i=${i}` },
      highlight: [j],
      codeLines: [6],
      vars: [{ name: "i", value: i }, { name: "j", value: j }, { name: "nums[j]", value: nums[j] }],
      note: {
        vi: `Xét số nguyên i=${i}. Đây có nằm trong nums không?`,
        en: `Consider integer i=${i}. Is it present in nums?`,
      },
    });

    // Line 7: if nums[j] != i:
    const missing = nums[j] !== i;
    snap({
      title: { vi: `if nums[j] != i → nums[${j}]=${nums[j]} != ${i} → ${missing}`, en: `if nums[j] != i → nums[${j}]=${nums[j]} != ${i} → ${missing}` },
      highlight: [j],
      codeLines: [7],
      vars: [{ name: "nums[j]", value: nums[j] }, { name: "i", value: i }],
      note: missing
        ? { vi: `nums[${j}]=${nums[j]} ≠ i=${i} → ${i} KHÔNG có trong nums → thêm vào a.`, en: `nums[${j}]=${nums[j]} ≠ i=${i} → ${i} is NOT in nums → append to a.` }
        : { vi: `nums[${j}]=${nums[j]} == i=${i} → ${i} có trong nums → tăng j để kiểm tra số tiếp theo.`, en: `nums[${j}]=${nums[j]} == i=${i} → ${i} is present in nums → advance j to check the next number.` },
    });

    if (missing) {
      // Line 8: a.append(i)
      a.push(i);
      snap({
        title: { vi: `a.append(${i}) → a=[${a.join(",")}]`, en: `a.append(${i}) → a=[${a.join(",")}]` },
        highlight: [j],
        codeLines: [8],
        vars: [{ name: "a", value: `[${a.join(",")}]` }],
        note: {
          vi: `Thêm ${i} vào danh sách kết quả.`,
          en: `Append ${i} to the result list.`,
        },
      });
    } else {
      // Line 10: j += 1
      j++;
      snap({
        title: { vi: `j += 1 → j=${j}`, en: `j += 1 → j=${j}` },
        highlight: [j < nums.length ? j : j - 1],
        codeLines: [10],
        vars: [{ name: "j", value: j }, { name: "nums[j]", value: j < nums.length ? nums[j] : "(end)" }],
        note: {
          vi: `i=${i} đã khớp với nums[${j - 1}], nên tăng j. Giờ j=${j}${j < nums.length ? `, nums[j]=${nums[j]}` : " (hết mảng)"}.`,
          en: `i=${i} matched nums[${j - 1}], so advance j. Now j=${j}${j < nums.length ? `, nums[j]=${nums[j]}` : " (end of array)"}.`,
        },
      });
    }
  }

  // Line 11: return a
  const answer = [...a];
  const fs = {
    title: { vi: `return a → [${answer.join(",")}]`, en: `return a → [${answer.join(",")}]` },
    arr: [...nums],
    sub: nums.map((_, idx) => `[${idx}]`),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [11],
    vars: [{ name: "answer", value: `[${answer.join(",")}]` }],
    note: {
      vi: `Các số bị thiếu trong dải [${loStart}, ${loEnd}): [${answer.join(",")}].`,
      en: `Missing integers in range [${loStart}, ${loEnd}): [${answer.join(",")}].`,
    },
  };
  steps.push(fs);

  return { original: originalNums, answer, steps };
}

/** LeetCode 315: Count of Smaller Numbers After Self — compression + Fenwick Tree. */
function buildSteps315(input) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const n = nums.length;
  const values = [...new Set(nums)].sort((a, b) => a - b);
  const ranks = new Map(values.map((value, index) => [value, index + 1]));
  const bit = Array(values.length + 1).fill(0);
  const answer = Array(n).fill(null);
  const steps = [];
  let currentIndex = -1;
  let currentRank = null;
  let queryCursor = null;
  let queryLimit = null;
  let queryTotal = 0;
  let queryPath = [];
  let updateCursor = null;
  let updatePath = [];
  let action = "compress";

  const makeView = () => ({
    phase: action,
    nums: [...nums],
    values: [...values],
    ranks: values.map((value, index) => ({ value, rank: index + 1 })),
    bit: bit.slice(1),
    answer: [...answer],
    currentIndex,
    currentRank,
    queryCursor,
    queryLimit,
    queryTotal,
    queryPath: [...queryPath],
    updateCursor,
    updatePath: [...updatePath],
    processedIndices: Array.from({ length: n }, (_, index) => index).filter((index) => answer[index] !== null),
  });
  const addStep = ({ title, note, codeLine, phase, vars = [], final = false }) => {
    action = phase;
    const view = makeView();
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: [...nums],
      highlight: currentIndex >= 0 ? [currentIndex] : [],
      mark: view.processedIndices,
      vars: [
        { name: "answer", value: `[${answer.map((value) => value === null ? "_" : value).join(", ")}]` },
        ...vars,
      ],
      countSmallerView: view,
    });
  };

  addStep({
    title: { vi: "Nén tọa độ các giá trị", en: "Coordinate-compress the values" },
    note: {
      vi: `Sắp xếp các giá trị duy nhất: [${values.join(", ")}]. Giá trị nhỏ hơn luôn có rank nhỏ hơn, nên Fenwick có thể đếm theo rank.`,
      en: `Sort the unique values: [${values.join(", ")}]. Smaller values always have smaller ranks, so Fenwick can count by rank.`,
    },
    codeLine: 3,
    phase: "compress",
    vars: [{ name: "values", value: `[${values.join(", ")}]` }],
  });
  addStep({
    title: { vi: "Tạo ánh xạ value → rank", en: "Build the value → rank mapping" },
    note: {
      vi: `Rank dùng index 1-based: ${values.map((value) => `${value}→${ranks.get(value)}`).join(", ")}.`,
      en: `Ranks are 1-based: ${values.map((value) => `${value}→${ranks.get(value)}`).join(", ")}.`,
    },
    codeLine: 4,
    phase: "rank",
    vars: [{ name: "rank", value: `{${values.map((value) => `${value}:${ranks.get(value)}`).join(", ")}}` }],
  });
  addStep({
    title: { vi: "Khởi tạo Fenwick Tree", en: "Initialize the Fenwick Tree" },
    note: {
      vi: "BIT[r] lưu số phần tử đã quét thuộc một đoạn rank. Ban đầu chưa có phần tử nào ở bên phải.",
      en: "BIT[r] stores how many scanned elements fall in a rank range. Initially, no elements are on the processed right side.",
    },
    codeLine: 5,
    phase: "bit-init",
    vars: [{ name: "bit", value: `[${bit.join(", ")}]` }],
  });
  addStep({
    title: { vi: "Khởi tạo mảng kết quả", en: "Initialize the answer array" },
    note: {
      vi: "answer[i] sẽ lưu số phần tử nhỏ hơn nums[i] nằm ở bên phải i.",
      en: "answer[i] will store how many elements smaller than nums[i] occur to its right.",
    },
    codeLine: 6,
    phase: "answer-init",
  });

  for (let index = n - 1; index >= 0; index -= 1) {
    currentIndex = index;
    currentRank = null;
    queryCursor = null;
    queryLimit = null;
    queryTotal = 0;
    queryPath = [];
    updateCursor = null;
    updatePath = [];
    addStep({
      title: { vi: `Quét i=${index} từ phải sang trái`, en: `Scan i=${index} from right to left` },
      note: {
        vi: `Các index lớn hơn ${index} đã nằm trong Fenwick. Bây giờ xét nums[${index}] = ${nums[index]}.`,
        en: `All indices greater than ${index} are already in Fenwick. Now inspect nums[${index}] = ${nums[index]}.`,
      },
      codeLine: 17,
      phase: "scan",
      vars: [{ name: "index", value: index }, { name: "nums[index]", value: nums[index] }],
    });

    currentRank = ranks.get(nums[index]);
    addStep({
      title: { vi: `rank(${nums[index]}) = ${currentRank}`, en: `rank(${nums[index]}) = ${currentRank}` },
      note: {
        vi: `Mọi giá trị nhỏ hơn ${nums[index]} có rank trong [1, ${currentRank - 1}].`,
        en: `Every value smaller than ${nums[index]} has a rank in [1, ${currentRank - 1}].`,
      },
      codeLine: 18,
      phase: "rank-current",
      vars: [{ name: "current_rank", value: currentRank }],
    });

    queryLimit = currentRank - 1;
    queryCursor = queryLimit;
    addStep({
      title: { vi: `query(${queryLimit}) đếm rank nhỏ hơn`, en: `query(${queryLimit}) counts smaller ranks` },
      note: {
        vi: `Không query tới current_rank vì bài yêu cầu nhỏ hơn nghiêm ngặt, không tính giá trị bằng ${nums[index]}.`,
        en: `Do not query through current_rank because the problem asks for strictly smaller values, excluding values equal to ${nums[index]}.`,
      },
      codeLine: 19,
      phase: "query-call",
      vars: [{ name: "current_rank - 1", value: queryLimit }],
    });
    addStep({
      title: { vi: `Vào query(${queryLimit})`, en: `Enter query(${queryLimit})` },
      note: { vi: "query lấy prefix sum của tần suất rank.", en: "query returns a prefix sum of rank frequencies." },
      codeLine: 7,
      phase: "query-enter",
      vars: [{ name: "index", value: queryCursor }],
    });
    queryTotal = 0;
    addStep({
      title: { vi: "total = 0", en: "total = 0" },
      note: { vi: "Bắt đầu tổng số phần tử nhỏ hơn từ 0.", en: "Start the smaller-element count at 0." },
      codeLine: 8,
      phase: "query-init",
      vars: [{ name: "total", value: queryTotal }],
    });
    while (queryCursor > 0) {
      addStep({
        title: { vi: `${queryCursor} > 0 → đọc BIT[${queryCursor}]`, en: `${queryCursor} > 0 → read BIT[${queryCursor}]` },
        note: {
          vi: `BIT[${queryCursor}] chứa tổng tần suất của đoạn rank kết thúc tại ${queryCursor}.`,
          en: `BIT[${queryCursor}] stores the frequency total for a rank range ending at ${queryCursor}.`,
        },
        codeLine: 9,
        phase: "query-check",
        vars: [{ name: "index", value: queryCursor }],
      });
      queryPath.push(queryCursor);
      queryTotal += bit[queryCursor];
      addStep({
        title: { vi: `total += BIT[${queryCursor}] → ${queryTotal}`, en: `total += BIT[${queryCursor}] → ${queryTotal}` },
        note: {
          vi: `Node này đóng góp ${bit[queryCursor]}; tổng số phần tử nhỏ hơn hiện là ${queryTotal}.`,
          en: `This node contributes ${bit[queryCursor]}; the smaller-element total is now ${queryTotal}.`,
        },
        codeLine: 10,
        phase: "query-read",
        vars: [{ name: `BIT[${queryCursor}]`, value: bit[queryCursor] }, { name: "total", value: queryTotal }],
      });
      const previousCursor = queryCursor;
      queryCursor -= queryCursor & -queryCursor;
      addStep({
        title: { vi: `index: ${previousCursor} → ${queryCursor}`, en: `index: ${previousCursor} → ${queryCursor}` },
        note: {
          vi: `Trừ lowbit(${previousCursor}) = ${previousCursor & -previousCursor} để chuyển sang đoạn prefix tiếp theo.`,
          en: `Subtract lowbit(${previousCursor}) = ${previousCursor & -previousCursor} to move to the next prefix range.`,
        },
        codeLine: 11,
        phase: "query-jump",
        vars: [{ name: "index", value: queryCursor }],
      });
    }
    addStep({
      title: { vi: "index = 0 → kết thúc query", en: "index = 0 → finish query" },
      note: { vi: "Đã cộng hết các đoạn rank nhỏ hơn.", en: "All smaller-rank ranges have been added." },
      codeLine: 9,
      phase: "query-check",
      vars: [{ name: "index", value: 0 }, { name: "total", value: queryTotal }],
    });
    addStep({
      title: { vi: `return ${queryTotal}`, en: `return ${queryTotal}` },
      note: {
        vi: `Có ${queryTotal} phần tử đã quét nhỏ hơn ${nums[index]}.`,
        en: `${queryTotal} processed elements are smaller than ${nums[index]}.`,
      },
      codeLine: 12,
      phase: "query-return",
      vars: [{ name: "total", value: queryTotal }],
    });
    answer[index] = queryTotal;
    addStep({
      title: { vi: `answer[${index}] = ${queryTotal}`, en: `answer[${index}] = ${queryTotal}` },
      note: {
        vi: `Ghi kết quả cho nums[${index}] = ${nums[index]}.`,
        en: `Store the result for nums[${index}] = ${nums[index]}.`,
      },
      codeLine: 19,
      phase: "answer-write",
      vars: [{ name: `answer[${index}]`, value: queryTotal }],
    });

    updateCursor = currentRank;
    addStep({
      title: { vi: `update(rank ${currentRank})`, en: `update(rank ${currentRank})` },
      note: {
        vi: `Đưa ${nums[index]} vào Fenwick để các phần tử bên trái có thể đếm nó.`,
        en: `Insert ${nums[index]} into Fenwick so elements to its left can count it.`,
      },
      codeLine: 20,
      phase: "update-call",
      vars: [{ name: "current_rank", value: currentRank }],
    });
    addStep({
      title: { vi: `Vào update(${currentRank})`, en: `Enter update(${currentRank})` },
      note: { vi: "update tăng mọi node BIT bao phủ rank này.", en: "update increments every BIT node covering this rank." },
      codeLine: 13,
      phase: "update-enter",
      vars: [{ name: "index", value: updateCursor }],
    });
    while (updateCursor < bit.length) {
      addStep({
        title: { vi: `${updateCursor} < ${bit.length} → cập nhật`, en: `${updateCursor} < ${bit.length} → update` },
        note: {
          vi: `BIT[${updateCursor}] có đoạn phủ chứa rank ${currentRank}.`,
          en: `BIT[${updateCursor}] covers rank ${currentRank}.`,
        },
        codeLine: 14,
        phase: "update-check",
        vars: [{ name: "index", value: updateCursor }],
      });
      updatePath.push(updateCursor);
      bit[updateCursor] += 1;
      addStep({
        title: { vi: `BIT[${updateCursor}] += 1 → ${bit[updateCursor]}`, en: `BIT[${updateCursor}] += 1 → ${bit[updateCursor]}` },
        note: {
          vi: `Node BIT[${updateCursor}] giờ ghi nhận thêm một phần tử có rank ${currentRank}.`,
          en: `BIT[${updateCursor}] now records one more element at rank ${currentRank}.`,
        },
        codeLine: 15,
        phase: "update-write",
        vars: [{ name: `BIT[${updateCursor}]`, value: bit[updateCursor] }],
      });
      const previousCursor = updateCursor;
      updateCursor += updateCursor & -updateCursor;
      addStep({
        title: { vi: `index: ${previousCursor} → ${updateCursor}`, en: `index: ${previousCursor} → ${updateCursor}` },
        note: {
          vi: `Cộng lowbit(${previousCursor}) = ${previousCursor & -previousCursor} để đi lên node cha.`,
          en: `Add lowbit(${previousCursor}) = ${previousCursor & -previousCursor} to climb to the parent node.`,
        },
        codeLine: 16,
        phase: "update-jump",
        vars: [{ name: "index", value: updateCursor }],
      });
    }
    addStep({
      title: { vi: `${updateCursor} >= ${bit.length} → kết thúc update`, en: `${updateCursor} >= ${bit.length} → finish update` },
      note: {
        vi: `nums[${index}] = ${nums[index]} đã được thêm hoàn toàn vào Fenwick.`,
        en: `nums[${index}] = ${nums[index]} is now fully inserted into Fenwick.`,
      },
      codeLine: 14,
      phase: "update-check",
      vars: [{ name: "index", value: updateCursor }],
    });
  }

  currentIndex = -1;
  currentRank = null;
  queryCursor = null;
  updateCursor = null;
  addStep({
    title: { vi: `Hoàn tất → [${answer.join(", ")}]`, en: `Done → [${answer.join(", ")}]` },
    note: {
      vi: "Mỗi answer[i] là số phần tử nhỏ hơn nums[i] nằm ở bên phải i.",
      en: "Each answer[i] is the number of elements smaller than nums[i] to its right.",
    },
    codeLine: 21,
    phase: "done",
    vars: [{ name: "return", value: `[${answer.join(", ")}]` }],
    final: true,
  });
  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 2996: Smallest Missing Integer Greater Than Sequential Prefix Sum.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def missingInteger(self, nums):
 *  3          total = nums[0]
 *  4          i = 1
 *  5          while i < len(nums) and nums[i] == nums[i - 1] + 1:
 *  6              total += nums[i]
 *  7              i += 1
 *  8          seen = set(nums)
 *  9          while total in seen:
 * 10              total += 1
 * 11          return total
 */
function buildSteps2996(input) {
  const nums = Array.isArray(input) ? input.map(Number).filter((value) => Number.isFinite(value)) : [];
  const steps = [];

  if (!nums.length) {
    const view = {
      nums: [],
      prefixEnd: -1,
      currentIndex: -1,
      sum: 0,
      seen: [],
      candidate: 0,
      candidates: [],
      phase: "done",
      decision: "empty visual input",
      status: [{ label: "answer", value: 0 }],
    };
    steps.push({
      title: { vi: "Input rỗng", en: "Empty input" },
      arr: [],
      missingIntegerView: view,
      final: true,
      codeLines: [2],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Bài gốc luôn có nums không rỗng; nếu input rỗng thì visualization trả 0 để không lỗi.",
        en: "The original problem has non-empty nums; for an empty visual input, return 0.",
      },
    });
    return { original: nums, answer: 0, steps };
  }

  let total = nums[0];
  let i = 1;
  let prefixEnd = 0;
  const seen = new Set(nums);
  const candidates = [];
  const sortedSeen = () => [...seen].sort((a, b) => a - b);
  const prefixIndices = () => Array.from({ length: prefixEnd + 1 }, (_, index) => index);

  function makeView({ phase, currentIndex = -1, candidate = null, decision = "", status = [] } = {}) {
    return {
      nums: [...nums],
      prefixEnd,
      currentIndex,
      sum: total,
      seen: sortedSeen(),
      candidate,
      candidates: [...candidates],
      phase,
      decision,
      status,
    };
  }

  steps.push({
    title: { vi: `Khởi tạo total = nums[0] = ${total}`, en: `Initialize total = nums[0] = ${total}` },
    arr: [...nums],
    highlight: [0],
    mark: [0],
    missingIntegerView: makeView({
      phase: "prefix",
      currentIndex: 0,
      decision: "total = nums[0]",
      status: [{ label: "prefix", value: "[0..0]" }, { label: "total", value: total }],
    }),
    codeLines: [3, 4],
    vars: [{ name: "total", value: total }, { name: "i", value: i }],
    note: {
      vi: "Prefix liên tiếp phải bắt đầu từ nums[0]. Lấy nums[0] làm tổng ban đầu.",
      en: "The sequential prefix must start at nums[0]. Use nums[0] as the initial sum.",
    },
  });

  while (i < nums.length && nums[i] === nums[i - 1] + 1) {
    steps.push({
      title: { vi: `nums[${i}] nối tiếp nums[${i - 1}]`, en: `nums[${i}] follows nums[${i - 1}]` },
      arr: [...nums],
      highlight: [i - 1, i],
      mark: prefixIndices(),
      missingIntegerView: makeView({
        phase: "prefix",
        currentIndex: i,
        decision: `${nums[i]} == ${nums[i - 1]} + 1`,
        status: [{ label: "check", value: "continue" }, { label: "total before", value: total }],
      }),
      codeLines: [5],
      vars: [{ name: "i", value: i }, { name: "nums[i]", value: nums[i] }, { name: "total", value: total }],
      note: {
        vi: `${nums[i]} đúng bằng ${nums[i - 1]} + 1, nên vẫn thuộc prefix tăng liên tiếp.`,
        en: `${nums[i]} equals ${nums[i - 1]} + 1, so it stays inside the sequential prefix.`,
      },
    });

    total += nums[i];
    prefixEnd = i;
    steps.push({
      title: { vi: `Cộng nums[${i}] → total = ${total}`, en: `Add nums[${i}] → total = ${total}` },
      arr: [...nums],
      highlight: [i],
      mark: prefixIndices(),
      missingIntegerView: makeView({
        phase: "prefix",
        currentIndex: i,
        decision: `total += nums[${i}]`,
        status: [{ label: "added", value: nums[i] }, { label: "total", value: total }],
      }),
      codeLines: [6, 7],
      vars: [{ name: "i", value: i }, { name: "total", value: total }],
      note: {
        vi: `Prefix hiện tại là nums[0..${prefixEnd}], tổng = ${total}.`,
        en: `Current prefix is nums[0..${prefixEnd}], sum = ${total}.`,
      },
    });
    i += 1;
  }

  steps.push({
    title: i < nums.length
      ? { vi: `Prefix dừng trước nums[${i}]`, en: `Prefix stops before nums[${i}]` }
      : { vi: "Toàn bộ mảng là prefix liên tiếp", en: "The whole array is a sequential prefix" },
    arr: [...nums],
    highlight: i < nums.length ? [i - 1, i] : [],
    mark: prefixIndices(),
    missingIntegerView: makeView({
      phase: "prefix-stop",
      currentIndex: i < nums.length ? i : -1,
      decision: i < nums.length ? `${nums[i]} != ${nums[i - 1]} + 1` : "reached end of nums",
      status: [{ label: "prefix", value: `[0..${prefixEnd}]` }, { label: "prefix sum", value: total }],
    }),
    codeLines: [5],
    vars: [{ name: "i", value: i }, { name: "total", value: total }],
    note: i < nums.length
      ? {
        vi: `nums[${i}]=${nums[i]} không bằng ${nums[i - 1]}+1, nên prefix kết thúc ở index ${prefixEnd}.`,
        en: `nums[${i}]=${nums[i]} is not ${nums[i - 1]}+1, so the prefix ends at index ${prefixEnd}.`,
      }
      : {
        vi: `Không gặp chỗ đứt đoạn. Tổng prefix = ${total}.`,
        en: `No break in the sequence. Prefix sum = ${total}.`,
      },
  });

  steps.push({
    title: { vi: "Tạo set(nums)", en: "Build set(nums)" },
    arr: [...nums],
    highlight: [],
    mark: prefixIndices(),
    missingIntegerView: makeView({
      phase: "set",
      candidate: total,
      decision: "seen = set(nums)",
      status: [{ label: "seen size", value: seen.size }, { label: "start candidate", value: total }],
    }),
    codeLines: [8],
    vars: [{ name: "seen", value: `{${sortedSeen().join(", ")}}` }, { name: "candidate", value: total }],
    note: {
      vi: "Dùng set để kiểm tra candidate có xuất hiện trong nums hay không trong O(1).",
      en: "Use a set to test whether a candidate appears in nums in O(1).",
    },
  });

  const startCandidate = total;
  while (seen.has(total)) {
    candidates.push({ value: total, exists: true });
    steps.push({
      title: { vi: `${total} đã có trong nums`, en: `${total} exists in nums` },
      arr: [...nums],
      highlight: nums.map((value, index) => (value === total ? index : -1)).filter((index) => index >= 0),
      mark: prefixIndices(),
      missingIntegerView: makeView({
        phase: "candidate",
        candidate: total,
        decision: `${total} in seen`,
        status: [{ label: "candidate", value: total }, { label: "exists?", value: "yes" }],
      }),
      codeLines: [9, 10],
      vars: [{ name: "candidate", value: total }, { name: "in seen?", value: true }],
      note: {
        vi: `${total} chưa phải đáp án vì đã xuất hiện trong nums. Tăng candidate lên 1.`,
        en: `${total} is not the answer because it appears in nums. Increment the candidate by 1.`,
      },
    });
    total += 1;
  }

  candidates.push({ value: total, exists: false });
  steps.push({
    title: { vi: `return ${total}`, en: `return ${total}` },
    arr: [...nums],
    highlight: [],
    mark: prefixIndices(),
    missingIntegerView: makeView({
      phase: "done",
      candidate: total,
      decision: `${total} not in seen`,
      status: [{ label: "answer", value: total }, { label: "started from", value: startCandidate }],
    }),
    final: true,
    codeLines: [9, 11],
    vars: [{ name: "answer", value: total }],
    note: {
      vi: `${total} là số nhỏ nhất >= ${startCandidate} mà không xuất hiện trong nums.`,
      en: `${total} is the smallest integer >= ${startCandidate} that does not appear in nums.`,
    },
  });

  return { original: [...nums], answer: total, steps };
}

/** LeetCode 699: Falling Squares — coordinate compression + lazy segment tree. */
function buildSteps699(input) {
  let positions = [];
  if (Array.isArray(input) && input.every((item) => Array.isArray(item))) {
    positions = input.map((item) => [Number(item[0]), Number(item[1])]);
  } else if (Array.isArray(input)) {
    for (let index = 0; index + 1 < input.length; index += 2) positions.push([Number(input[index]), Number(input[index + 1])]);
  } else {
    const raw = String(input ?? "").trim();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((item) => Array.isArray(item))) {
        positions = parsed.map((item) => [Number(item[0]), Number(item[1])]);
      }
    } catch (_error) {
      // Fall through to the compact "left,size; ..." format used by the UI.
    }
    if (!positions.length && raw) {
      positions = raw
        .split(/[;|\n]+/)
        .map((row) => row.trim())
        .filter(Boolean)
        .map((row) => row.split(/[\s,]+/).map(Number).slice(0, 2));
    }
  }
  positions = positions.filter((item) => item.length === 2 && Number.isFinite(item[0]) && Number.isFinite(item[1]) && item[1] > 0);
  const coords = [...new Set(positions.flatMap(([left, size]) => [left, left + size]))].sort((a, b) => a - b);
  const indexOf = new Map(coords.map((value, index) => [value, index]));
  const segmentCount = Math.max(0, coords.length - 1);
  const tree = Array(Math.max(2, segmentCount * 4 + 2)).fill(0);
  const lazy = Array(tree.length).fill(null);
  const leafHeights = Array(segmentCount).fill(0);
  const placed = [];
  const outputs = [];
  const steps = [];
  let phase = "compress";
  let currentSquare = -1;
  let queryLeft = null;
  let queryRight = null;
  let baseHeight = 0;
  let newHeight = 0;
  let activeNode = null;
  let queryVisited = [];
  let updateVisited = [];
  let operation = null;
  let returnedValue = null;

  const collectTreeNodes = () => {
    const nodes = [];
    const visit = (node, start, end, depth) => {
      if (start > end || start < 0 || end >= segmentCount) return;
      nodes.push({
        node,
        start,
        end,
        depth,
        value: tree[node],
        lazy: lazy[node],
        xLeft: coords[start],
        xRight: coords[end + 1],
      });
      if (start === end) return;
      const mid = Math.floor((start + end) / 2);
      visit(node * 2, start, mid, depth + 1);
      visit(node * 2 + 1, mid + 1, end, depth + 1);
    };
    if (segmentCount > 0) visit(1, 0, segmentCount - 1, 0);
    return nodes;
  };
  const makeView = () => ({
    phase,
    positions: positions.map((item) => [...item]),
    coords: [...coords],
    segments: leafHeights.map((height, index) => ({ left: coords[index], right: coords[index + 1], height })),
    treeNodes: collectTreeNodes(),
    placed: placed.map((item) => ({ ...item })),
    outputs: [...outputs],
    currentSquare,
    queryLeft,
    queryRight,
    baseHeight,
    newHeight,
    activeNode,
    queryVisited: [...queryVisited],
    updateVisited: [...updateVisited],
    operation,
    returnedValue,
  });
  const addStep = ({ title, note, codeLine, nextPhase, vars = [], final = false }) => {
    phase = nextPhase;
    const view = makeView();
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: positions.map((item) => item[0]),
      highlight: currentSquare >= 0 ? [currentSquare] : [],
      mark: Array.from({ length: Math.max(0, currentSquare) }, (_, index) => index),
      vars: [
        { name: "answer", value: `[${outputs.join(", ")}]` },
        ...(queryLeft !== null ? [{ name: "compressed range", value: `[${queryLeft}, ${queryRight}]` }] : []),
        ...vars,
      ],
      fallingSquaresView: view,
    });
  };

  addStep({
    title: { vi: "Nén tất cả cạnh trái/phải", en: "Compress every left/right edge" },
    note: {
      vi: `Các cạnh duy nhất theo thứ tự: [${coords.join(", ")}]. Mỗi cặp cạnh liên tiếp tạo một ground segment không thể bị chia nhỏ thêm.`,
      en: `Unique sorted edges: [${coords.join(", ")}]. Each adjacent edge pair forms one ground segment that never needs another split.`,
    },
    codeLine: 3,
    nextPhase: "compress",
    vars: [{ name: "coords", value: `[${coords.join(", ")}]` }],
  });
  addStep({
    title: { vi: "Tạo ánh xạ tọa độ → index", en: "Build coordinate → index mapping" },
    note: {
      vi: `${coords.map((value, index) => `${value}→${index}`).join(", ")}. Square [left, right) phủ segment index index[left]..index[right]−1.`,
      en: `${coords.map((value, index) => `${value}→${index}`).join(", ")}. Square [left, right) covers segment indices index[left]..index[right]−1.`,
    },
    codeLine: 4,
    nextPhase: "map",
  });
  addStep({
    title: { vi: `Có ${segmentCount} ground segment`, en: `${segmentCount} ground segments` },
    note: { vi: "Segment Tree lưu maximum height trên các ground segment này.", en: "The Segment Tree stores maximum height over these ground segments." },
    codeLine: 5,
    nextPhase: "segments",
    vars: [{ name: "n", value: segmentCount }],
  });
  addStep({
    title: { vi: "Khởi tạo tree và lazy", en: "Initialize tree and lazy arrays" },
    note: {
      vi: "tree[node] là max height; lazy[node] khác None nghĩa là toàn bộ đoạn node đang được gán cùng một height.",
      en: "tree[node] is a max height; non-None lazy[node] means the node's entire range has one assigned height.",
    },
    codeLine: 6,
    nextPhase: "tree-init",
  });
  addStep({
    title: { vi: "lazy = None cho mọi node", en: "Set every lazy value to None" },
    note: { vi: "Chưa có range assignment nào đang chờ đẩy xuống con.", en: "No range assignment is waiting to propagate to children." },
    codeLine: 7,
    nextPhase: "tree-init",
  });
  addStep({
    title: { vi: "answer = []", en: "answer = []" },
    note: { vi: "Sau mỗi square, append maximum height toàn cục.", en: "Append the global maximum height after every square." },
    codeLine: 27,
    nextPhase: "ready",
  });

  function push(node, start, end) {
    if (lazy[node] === null || start === end) return;
    activeNode = node;
    addStep({
      title: { vi: `Đẩy lazy ${lazy[node]} từ node ${node}`, en: `Push lazy ${lazy[node]} from node ${node}` },
      note: { vi: `Node ${node} bị chia nhỏ cho thao tác hiện tại, nên assignment phải truyền xuống hai con.`, en: `Node ${node} is being split for the current operation, so its assignment must propagate to both children.` },
      codeLine: 8,
      nextPhase: "push-lazy",
      vars: [{ name: `lazy[${node}]`, value: lazy[node] }],
    });
    const assigned = lazy[node];
    for (const child of [node * 2, node * 2 + 1]) {
      tree[child] = assigned;
      lazy[child] = assigned;
    }
    addStep({
      title: { vi: `Gán hai node con = ${assigned}`, en: `Assign both child nodes = ${assigned}` },
      note: { vi: `tree và lazy của node ${node * 2}, ${node * 2 + 1} cùng nhận ${assigned}.`, en: `tree and lazy for nodes ${node * 2}, ${node * 2 + 1} both receive ${assigned}.` },
      codeLine: 11,
      nextPhase: "push-lazy",
    });
    lazy[node] = null;
    addStep({
      title: { vi: `lazy[${node}] = None`, en: `lazy[${node}] = None` },
      note: { vi: "Assignment đã được đẩy hết xuống con.", en: "The assignment has been fully propagated to the children." },
      codeLine: 13,
      nextPhase: "push-lazy",
    });
  }

  function query(node, start, end, left, right) {
    activeNode = node;
    queryVisited.push(node);
    returnedValue = null;
    addStep({
      title: { vi: `query node ${node} · segment [${start}, ${end}]`, en: `query node ${node} · segment [${start}, ${end}]` },
      note: { vi: `So sánh node range [${start}, ${end}] với query [${left}, ${right}].`, en: `Compare node range [${start}, ${end}] with query [${left}, ${right}].` },
      codeLine: 14,
      nextPhase: "query",
      vars: [{ name: "node", value: node }, { name: "tree[node]", value: tree[node] }],
    });
    if (right < start || end < left) {
      returnedValue = 0;
      addStep({
        title: { vi: "Không giao nhau → return 0", en: "Disjoint → return 0" },
        note: { vi: "Node này không đóng góp vào chiều cao nền.", en: "This node contributes nothing to the base height." },
        codeLine: 15,
        nextPhase: "query-skip",
        vars: [{ name: "return", value: 0 }],
      });
      return 0;
    }
    if (left <= start && end <= right) {
      returnedValue = tree[node];
      addStep({
        title: { vi: `Phủ hoàn toàn → return ${tree[node]}`, en: `Fully covered → return ${tree[node]}` },
        note: { vi: `Dùng trực tiếp max height đã lưu tại node ${node}.`, en: `Use the max height already stored at node ${node}.` },
        codeLine: 16,
        nextPhase: "query-hit",
        vars: [{ name: "return", value: tree[node] }],
      });
      return tree[node];
    }
    push(node, start, end);
    const mid = Math.floor((start + end) / 2);
    activeNode = node;
    addStep({
      title: { vi: `Chia query tại mid=${mid}`, en: `Split query at mid=${mid}` },
      note: { vi: "Query cả hai node con và lấy maximum.", en: "Query both children and take their maximum." },
      codeLine: 18,
      nextPhase: "query-split",
      vars: [{ name: "mid", value: mid }],
    });
    const leftValue = query(node * 2, start, mid, left, right);
    const rightValue = query(node * 2 + 1, mid + 1, end, left, right);
    const result = Math.max(leftValue, rightValue);
    activeNode = node;
    returnedValue = result;
    addStep({
      title: { vi: `max(${leftValue}, ${rightValue}) = ${result}`, en: `max(${leftValue}, ${rightValue}) = ${result}` },
      note: { vi: `Node ${node} trả chiều cao nền lớn nhất ${result}.`, en: `Node ${node} returns maximum base height ${result}.` },
      codeLine: 19,
      nextPhase: "query-return",
      vars: [{ name: "return", value: result }],
    });
    return result;
  }

  function assign(node, start, end, left, right, height) {
    activeNode = node;
    updateVisited.push(node);
    addStep({
      title: { vi: `assign node ${node} · segment [${start}, ${end}]`, en: `assign node ${node} · segment [${start}, ${end}]` },
      note: { vi: `Cố gắng gán height ${height} cho phần giao với update [${left}, ${right}].`, en: `Try to assign height ${height} to the overlap with update [${left}, ${right}].` },
      codeLine: 20,
      nextPhase: "update",
      vars: [{ name: "node", value: node }, { name: "height", value: height }],
    });
    if (right < start || end < left) {
      addStep({
        title: { vi: "Không giao nhau → return", en: "Disjoint → return" },
        note: { vi: "Không thay đổi node này.", en: "Leave this node unchanged." },
        codeLine: 21,
        nextPhase: "update-skip",
      });
      return;
    }
    if (left <= start && end <= right) {
      tree[node] = height;
      lazy[node] = height;
      addStep({
        title: { vi: `Phủ hoàn toàn → tree[${node}] = lazy[${node}] = ${height}`, en: `Fully covered → tree[${node}] = lazy[${node}] = ${height}` },
        note: { vi: "Lazy assignment cho phép dừng tại node này mà chưa cần đi xuống từng leaf.", en: "Lazy assignment lets us stop at this node without visiting every leaf." },
        codeLine: 22,
        nextPhase: "update-hit",
        vars: [{ name: `tree[${node}]`, value: height }, { name: `lazy[${node}]`, value: height }],
      });
      return;
    }
    push(node, start, end);
    const mid = Math.floor((start + end) / 2);
    activeNode = node;
    addStep({
      title: { vi: `Chia update tại mid=${mid}`, en: `Split update at mid=${mid}` },
      note: { vi: "Update cả hai node con có thể giao với range.", en: "Update both children that may overlap the range." },
      codeLine: 24,
      nextPhase: "update-split",
      vars: [{ name: "mid", value: mid }],
    });
    assign(node * 2, start, mid, left, right, height);
    assign(node * 2 + 1, mid + 1, end, left, right, height);
    tree[node] = Math.max(tree[node * 2], tree[node * 2 + 1]);
    activeNode = node;
    addStep({
      title: { vi: `Kéo lên tree[${node}] = ${tree[node]}`, en: `Pull tree[${node}] = ${tree[node]}` },
      note: { vi: `max(tree[${node * 2}], tree[${node * 2 + 1}]) = ${tree[node]}.`, en: `max(tree[${node * 2}], tree[${node * 2 + 1}]) = ${tree[node]}.` },
      codeLine: 26,
      nextPhase: "update-pull",
      vars: [{ name: `tree[${node}]`, value: tree[node] }],
    });
  }

  for (let squareIndex = 0; squareIndex < positions.length; squareIndex += 1) {
    const [left, size] = positions[squareIndex];
    const right = left + size;
    currentSquare = squareIndex;
    queryLeft = null;
    queryRight = null;
    baseHeight = 0;
    newHeight = 0;
    activeNode = null;
    queryVisited = [];
    updateVisited = [];
    operation = "square";
    returnedValue = null;
    addStep({
      title: { vi: `Square ${squareIndex}: [${left}, ${right}) · size ${size}`, en: `Square ${squareIndex}: [${left}, ${right}) · size ${size}` },
      note: { vi: "Square rơi thẳng xuống và dừng trên maximum height của toàn bộ khoảng nó phủ.", en: "The square falls vertically and stops on the maximum height across its entire footprint." },
      codeLine: 28,
      nextPhase: "square",
      vars: [{ name: "left, size", value: `[${left}, ${size}]` }],
    });
    addStep({
      title: { vi: `right = ${left} + ${size} = ${right}`, en: `right = ${left} + ${size} = ${right}` },
      note: { vi: `Dùng interval nửa mở [${left}, ${right}) để hai square chỉ chạm cạnh không bị coi là overlap.`, en: `Use half-open interval [${left}, ${right}) so squares touching only at an edge do not overlap.` },
      codeLine: 29,
      nextPhase: "square",
      vars: [{ name: "right", value: right }],
    });
    queryLeft = indexOf.get(left);
    queryRight = indexOf.get(right) - 1;
    addStep({
      title: { vi: `Compressed range = [${queryLeft}, ${queryRight}]`, en: `Compressed range = [${queryLeft}, ${queryRight}]` },
      note: { vi: `Square phủ ground segment ${queryLeft}..${queryRight}.`, en: `The square covers ground segments ${queryLeft}..${queryRight}.` },
      codeLine: 30,
      nextPhase: "map-square",
      vars: [{ name: "ql", value: queryLeft }, { name: "qr", value: queryRight }],
    });
    operation = "query";
    queryVisited = [];
    activeNode = null;
    addStep({
      title: { vi: `Query base height trên [${queryLeft}, ${queryRight}]`, en: `Query base height on [${queryLeft}, ${queryRight}]` },
      note: { vi: "Lấy maximum, không lấy minimum hay average, vì square phải nằm trên vật cản cao nhất dưới nó.", en: "Take the maximum—not minimum or average—because the square must sit above the tallest obstacle beneath it." },
      codeLine: 31,
      nextPhase: "query-start",
    });
    baseHeight = segmentCount > 0 ? query(1, 0, segmentCount - 1, queryLeft, queryRight) : 0;
    activeNode = null;
    returnedValue = baseHeight;
    addStep({
      title: { vi: `base = ${baseHeight}`, en: `base = ${baseHeight}` },
      note: { vi: `Square sẽ bắt đầu từ height ${baseHeight}.`, en: `The square will start at height ${baseHeight}.` },
      codeLine: 31,
      nextPhase: "query-done",
      vars: [{ name: "base", value: baseHeight }],
    });
    newHeight = baseHeight + size;
    addStep({
      title: { vi: `top = ${baseHeight} + ${size} = ${newHeight}`, en: `top = ${baseHeight} + ${size} = ${newHeight}` },
      note: { vi: "Toàn bộ footprint của square nhận cùng top height mới.", en: "The square's entire footprint receives the same new top height." },
      codeLine: 32,
      nextPhase: "calculate",
      vars: [{ name: "top", value: newHeight }],
    });
    operation = "update";
    updateVisited = [];
    activeNode = null;
    addStep({
      title: { vi: `Range assign [${queryLeft}, ${queryRight}] = ${newHeight}`, en: `Range assign [${queryLeft}, ${queryRight}] = ${newHeight}` },
      note: { vi: "Đây là assignment, không phải cộng: mặt trên mới của mọi segment bị phủ chính là top của square.", en: "This is assignment, not addition: every covered segment's new surface is the square's top." },
      codeLine: 33,
      nextPhase: "update-start",
    });
    if (segmentCount > 0) assign(1, 0, segmentCount - 1, queryLeft, queryRight, newHeight);
    for (let index = queryLeft; index <= queryRight; index += 1) leafHeights[index] = newHeight;
    placed.push({ index: squareIndex, left, right, size, bottom: baseHeight, top: newHeight });
    activeNode = null;
    addStep({
      title: { vi: "Square đã nằm trên skyline", en: "Square is now part of the skyline" },
      note: { vi: `Các segment [${queryLeft}, ${queryRight}] có surface height ${newHeight}.`, en: `Segments [${queryLeft}, ${queryRight}] now have surface height ${newHeight}.` },
      codeLine: 33,
      nextPhase: "landed",
      vars: [{ name: "top", value: newHeight }],
    });
    const globalMax = segmentCount > 0 ? tree[1] : 0;
    outputs.push(globalMax);
    operation = "output";
    addStep({
      title: { vi: `Append global max ${globalMax}`, en: `Append global max ${globalMax}` },
      note: { vi: `Root tree[1] lưu maximum của toàn bộ skyline: answer = [${outputs.join(", ")}].`, en: `Root tree[1] stores the entire skyline maximum: answer = [${outputs.join(", ")}].` },
      codeLine: 34,
      nextPhase: "output",
      vars: [{ name: "tree[1]", value: globalMax }],
    });
  }

  currentSquare = -1;
  queryLeft = null;
  queryRight = null;
  activeNode = null;
  queryVisited = [];
  updateVisited = [];
  operation = "done";
  returnedValue = null;
  addStep({
    title: { vi: `Hoàn tất → [${outputs.join(", ")}]`, en: `Done → [${outputs.join(", ")}]` },
    note: { vi: "Mỗi phần tử là maximum height sau khi square tương ứng rơi xuống.", en: "Each value is the maximum height after its corresponding square falls." },
    codeLine: 35,
    nextPhase: "done",
    vars: [{ name: "answer", value: `[${outputs.join(", ")}]` }],
    final: true,
  });
  return { original: positions.map((item) => [...item]), answer: [...outputs], steps };
}

/** LeetCode 493: Reverse Pairs — merge-sort cross-pair counting. */
function buildSteps732(input) {
  let bookings = [];
  if (Array.isArray(input) && input.every((item) => Array.isArray(item))) {
    bookings = input.map((item) => [Number(item[0]), Number(item[1])]);
  } else if (Array.isArray(input)) {
    for (let index = 0; index + 1 < input.length; index += 2) bookings.push([Number(input[index]), Number(input[index + 1])]);
  } else {
    const raw = String(input ?? "").trim();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((item) => Array.isArray(item))) {
        bookings = parsed.map((item) => [Number(item[0]), Number(item[1])]);
      }
    } catch (_error) {
      // Fall through to compact "start,end; ..." input.
    }
    if (!bookings.length && raw) {
      bookings = raw
        .split(/[;|\n]+/)
        .map((row) => row.trim())
        .filter(Boolean)
        .map((row) => row.split(/[\s,]+/).map(Number).slice(0, 2));
    }
  }
  bookings = bookings.filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end) && start < end);
  const LIMIT_LEFT = 0;
  const LIMIT_RIGHT = 1000000000 - 1;
  const tree = new Map();
  const lazy = new Map();
  const ranges = new Map([[1, { start: LIMIT_LEFT, end: LIMIT_RIGHT, depth: 0 }]]);
  const steps = [];
  const outputs = [];
  const processed = [];
  let phase = "init";
  let currentBooking = -1;
  let activeNode = null;
  let visitedNodes = [];
  let coveredNodes = [];
  let pulledNodes = [];
  let queryLeft = null;
  let queryRight = null;

  const valueAt = (node) => tree.get(node) || 0;
  const lazyAt = (node) => lazy.get(node) || 0;
  const makeSegments = () => {
    const edges = [...new Set(bookings.flatMap(([start, end]) => [start, end]))].sort((a, b) => a - b);
    return edges.slice(0, -1).map((left, index) => {
      const right = edges[index + 1];
      const count = processed.reduce((total, booking) => total + (booking.start <= left && right <= booking.end ? 1 : 0), 0);
      const current = currentBooking >= 0 && bookings[currentBooking]
        ? bookings[currentBooking][0] <= left && right <= bookings[currentBooking][1]
        : false;
      return { left, right, count, current };
    });
  };
  const makeView = () => ({
    phase,
    bookings: bookings.map((item) => [...item]),
    processed: processed.map((item) => ({ ...item })),
    outputs: [...outputs],
    currentBooking,
    activeNode,
    visitedNodes: [...visitedNodes],
    coveredNodes: [...coveredNodes],
    pulledNodes: [...pulledNodes],
    queryLeft,
    queryRight,
    segments: makeSegments(),
    treeNodes: [...ranges.entries()]
      .filter(([node]) => tree.has(node) || visitedNodes.includes(node) || node === 1)
      .map(([node, range]) => ({ node, ...range, value: valueAt(node), lazy: lazyAt(node) }))
      .sort((a, b) => a.depth - b.depth || a.node - b.node),
  });
  const addStep = ({ title, note, codeLine, nextPhase, vars = [], final = false }) => {
    phase = nextPhase;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: bookings.map((item) => item[0]),
      highlight: currentBooking >= 0 ? [currentBooking] : [],
      mark: Array.from({ length: Math.max(0, currentBooking) }, (_, index) => index),
      vars: [
        { name: "max overlap", value: valueAt(1) },
        ...(queryLeft !== null ? [{ name: "update range", value: `[${queryLeft}, ${queryRight}]` }] : []),
        ...vars,
      ],
      calendarThreeView: makeView(),
    });
  };

  addStep({
    title: { vi: "Khởi tạo Dynamic Segment Tree", en: "Initialize the Dynamic Segment Tree" },
    note: {
      vi: "Không tạo sẵn 4 * 10^9 node. Chỉ các node nằm trên đường update mới được materialize trong dictionary.",
      en: "Do not allocate 4 * 10^9 nodes. Only nodes touched by an update are materialized in dictionaries.",
    },
    codeLine: 3,
    nextPhase: "init",
    vars: [{ name: "domain", value: "[0, 10^9-1]" }],
  });
  addStep({
    title: { vi: "lazy[node] lưu số booking phủ toàn node", en: "lazy[node] stores full-node coverage" },
    note: {
      vi: "tree[node] là overlap lớn nhất trong đoạn; lazy[node] là phần cộng áp dụng cho toàn bộ đoạn node.",
      en: "tree[node] is the maximum overlap in the range; lazy[node] is the increment applied to the entire node range.",
    },
    codeLine: 4,
    nextPhase: "init",
  });

  function update(node, start, end, left, right, depth) {
    activeNode = node;
    if (!visitedNodes.includes(node)) visitedNodes.push(node);
    ranges.set(node, { start, end, depth });
    if (right < start || end < left) return;
    if (left <= start && end <= right) {
      tree.set(node, valueAt(node) + 1);
      lazy.set(node, lazyAt(node) + 1);
      if (!coveredNodes.includes(node)) coveredNodes.push(node);
      return;
    }
    const mid = Math.floor((start + end) / 2);
    ranges.set(node * 2, { start, end: mid, depth: depth + 1 });
    ranges.set(node * 2 + 1, { start: mid + 1, end, depth: depth + 1 });
    update(node * 2, start, mid, left, right, depth + 1);
    update(node * 2 + 1, mid + 1, end, left, right, depth + 1);
    tree.set(node, lazyAt(node) + Math.max(valueAt(node * 2), valueAt(node * 2 + 1)));
    activeNode = node;
    if (!pulledNodes.includes(node)) pulledNodes.push(node);
  }

  for (let index = 0; index < bookings.length; index += 1) {
    const [start, end] = bookings[index];
    currentBooking = index;
    queryLeft = start;
    queryRight = end - 1;
    activeNode = null;
    visitedNodes = [];
    coveredNodes = [];
    pulledNodes = [];
    addStep({
      title: { vi: `book(${start}, ${end})`, en: `book(${start}, ${end})` },
      note: {
        vi: `Đổi interval nửa mở [${start}, ${end}) thành range nguyên [${start}, ${end - 1}].`,
        en: `Convert half-open interval [${start}, ${end}) into integer range [${start}, ${end - 1}].`,
      },
      codeLine: 19,
      nextPhase: "booking",
      vars: [{ name: "start, end", value: `[${start}, ${end}]` }],
    });
    update(1, LIMIT_LEFT, LIMIT_RIGHT, queryLeft, queryRight, 0);
    activeNode = visitedNodes[visitedNodes.length - 1] ?? 1;
    addStep({
      title: { vi: `Đi qua ${visitedNodes.length} dynamic node`, en: `Visit ${visitedNodes.length} dynamic nodes` },
      note: {
        vi: `Chỉ materialize các node giao với [${queryLeft}, ${queryRight}]; độ sâu tối đa khoảng 30.`,
        en: `Only nodes intersecting [${queryLeft}, ${queryRight}] are materialized; maximum depth is about 30.`,
      },
      codeLine: 6,
      nextPhase: "visit",
      vars: [{ name: "visited", value: visitedNodes.length }],
    });
    activeNode = coveredNodes[coveredNodes.length - 1] ?? 1;
    addStep({
      title: { vi: `${coveredNodes.length} node được lazy +1`, en: `${coveredNodes.length} nodes receive lazy +1` },
      note: {
        vi: "Mỗi node được phủ hoàn toàn dừng đệ quy và tăng tree/lazy trực tiếp.",
        en: "Each fully covered node stops recursion and increments tree/lazy directly.",
      },
      codeLine: 10,
      nextPhase: "cover",
      vars: [{ name: "covered nodes", value: coveredNodes.length }],
    });
    activeNode = 1;
    addStep({
      title: { vi: `Pull ${pulledNodes.length} node về root`, en: `Pull ${pulledNodes.length} nodes back to the root` },
      note: {
        vi: `Root hiện lưu maximum overlap ${valueAt(1)} theo công thức lazy + max(left, right).`,
        en: `The root now stores maximum overlap ${valueAt(1)} via lazy + max(left, right).`,
      },
      codeLine: 16,
      nextPhase: "pull",
      vars: [{ name: "pulled nodes", value: pulledNodes.length }],
    });
    processed.push({ index, start, end, overlap: valueAt(1) });
    outputs.push(valueAt(1));
    activeNode = 1;
    addStep({
      title: { vi: `Root trả maximum overlap = ${valueAt(1)}`, en: `Root returns maximum overlap = ${valueAt(1)}` },
      note: {
        vi: `Sau booking ${index + 1}, answer = [${outputs.join(", ")}].`,
        en: `After booking ${index + 1}, answer = [${outputs.join(", ")}].`,
      },
      codeLine: 20,
      nextPhase: "output",
      vars: [{ name: "return", value: valueAt(1) }],
    });
  }

  currentBooking = -1;
  queryLeft = null;
  queryRight = null;
  activeNode = null;
  visitedNodes = [];
  coveredNodes = [];
  pulledNodes = [];
  addStep({
    title: { vi: `Hoàn tất → [${outputs.join(", ")}]`, en: `Done → [${outputs.join(", ")}]` },
    note: { vi: "Mỗi kết quả là số booking chồng lấp lớn nhất sau lần gọi tương ứng.", en: "Each result is the maximum overlap after the corresponding call." },
    codeLine: 20,
    nextPhase: "done",
    vars: [{ name: "answer", value: `[${outputs.join(", ")}]` }],
    final: true,
  });
  return { original: bookings.map((item) => [...item]), answer: [...outputs], steps };
}

function buildSteps493MergeSort(input) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const working = nums.map((value, originalIndex) => ({ value, originalIndex }));
  const steps = [];
  const stack = [];
  let phase = "start";
  let range = null;
  let leftPos = null;
  let rightCursor = null;
  let validPositions = [];
  let rangeCount = 0;
  let lastAdded = 0;
  let mergedRange = null;

  const makeView = () => ({
    phase,
    nums: [...nums],
    working: working.map((item) => ({ ...item })),
    stack: stack.map((item) => ({ ...item })),
    range: range ? { ...range } : null,
    leftPos,
    rightCursor,
    validPositions: [...validPositions],
    rangeCount,
    lastAdded,
    mergedRange: mergedRange ? { ...mergedRange } : null,
  });
  const addStep = ({ title, note, codeLine, nextPhase, vars = [], final = false }) => {
    phase = nextPhase;
    const view = makeView();
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: [...nums],
      highlight: leftPos !== null && leftPos >= 0 && working[leftPos] ? [working[leftPos].originalIndex] : [],
      mark: validPositions.map((position) => working[position]?.originalIndex).filter(Number.isInteger),
      vars: [
        ...(range ? [{ name: "range", value: `[${range.start}, ${range.end})` }] : []),
        ...vars,
      ],
      reversePairsView: view,
    });
  };

  addStep({
    title: { vi: "Bắt đầu Merge Sort", en: "Start Merge Sort" },
    note: {
      vi: "Một reverse pair cần i < j và nums[i] > 2 × nums[j]. Merge Sort giữ điều kiện index bằng cách chia nửa trái/phải, rồi sort mỗi nửa theo value để đếm nhanh.",
      en: "A reverse pair needs i < j and nums[i] > 2 × nums[j]. Merge Sort preserves index order through left/right halves, then sorts values for fast counting.",
    },
    codeLine: 16,
    nextPhase: "start",
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }],
  });

  function sortCount(start, end, depth) {
    range = { start, end, mid: null, depth };
    leftPos = null;
    rightCursor = null;
    validPositions = [];
    rangeCount = 0;
    lastAdded = 0;
    mergedRange = null;
    stack.push({ start, end, depth });
    addStep({
      title: { vi: `sort_count(${start}, ${end})`, en: `sort_count(${start}, ${end})` },
      note: { vi: `Xử lý đoạn positions [${start}, ${end}).`, en: `Process positions [${start}, ${end}).` },
      codeLine: 3,
      nextPhase: "divide",
      vars: [{ name: "depth", value: depth }],
    });
    addStep({
      title: { vi: `${end} - ${start} ${end - start <= 1 ? "≤" : ">"} 1`, en: `${end} - ${start} ${end - start <= 1 ? "≤" : ">"} 1` },
      note: end - start <= 1
        ? { vi: "Đoạn có tối đa một phần tử nên không thể tạo pair.", en: "A range with at most one element cannot form a pair." }
        : { vi: "Tiếp tục chia đoạn thành hai nửa theo index.", en: "Keep dividing the range into index-ordered halves." },
      codeLine: 4,
      nextPhase: "divide",
    });
    if (end - start <= 1) {
      addStep({
        title: { vi: "Base case → return 0", en: "Base case → return 0" },
        note: { vi: "Một phần tử không có reverse pair.", en: "One element contains no reverse pair." },
        codeLine: 5,
        nextPhase: "base",
        vars: [{ name: "count", value: 0 }],
      });
      stack.pop();
      return 0;
    }

    const mid = Math.floor((start + end) / 2);
    range = { start, mid, end, depth };
    addStep({
      title: { vi: `mid = ${mid}`, en: `mid = ${mid}` },
      note: {
        vi: `Nửa trái [${start}, ${mid}) luôn chứa original index sớm hơn nửa phải [${mid}, ${end}).`,
        en: `The left half [${start}, ${mid}) always contains earlier original indices than the right half [${mid}, ${end}).`,
      },
      codeLine: 6,
      nextPhase: "divide",
      vars: [{ name: "mid", value: mid }],
    });
    addStep({
      title: { vi: `Đệ quy nửa trái [${start}, ${mid})`, en: `Recurse left [${start}, ${mid})` },
      note: { vi: "Đếm pair nằm hoàn toàn trong nửa trái.", en: "Count pairs entirely inside the left half." },
      codeLine: 7,
      nextPhase: "divide",
    });
    const leftCount = sortCount(start, mid, depth + 1);
    range = { start, mid, end, depth };
    addStep({
      title: { vi: `Nửa trái trả ${leftCount}`, en: `Left half returns ${leftCount}` },
      note: { vi: "Tiếp tục đếm pair nằm hoàn toàn trong nửa phải.", en: "Continue with pairs entirely inside the right half." },
      codeLine: 8,
      nextPhase: "divide",
      vars: [{ name: "left_count", value: leftCount }],
    });
    const rightCount = sortCount(mid, end, depth + 1);
    range = { start, mid, end, depth };
    rangeCount = leftCount + rightCount;
    addStep({
      title: { vi: `count = ${leftCount} + ${rightCount} = ${rangeCount}`, en: `count = ${leftCount} + ${rightCount} = ${rangeCount}` },
      note: {
        vi: "Hai nửa đã sort theo value. Bây giờ chỉ cần đếm các pair chéo có left ở nửa trái và right ở nửa phải.",
        en: "Both halves are sorted by value. Now count cross pairs with left in the left half and right in the right half.",
      },
      codeLine: 8,
      nextPhase: "count",
      vars: [{ name: "count", value: rangeCount }],
    });

    rightCursor = mid;
    addStep({
      title: { vi: `right = mid = ${mid}`, en: `right = mid = ${mid}` },
      note: {
        vi: "right chỉ tiến tới vì các left value được xét theo thứ tự tăng dần.",
        en: "right only moves forward because left values are inspected in increasing order.",
      },
      codeLine: 9,
      nextPhase: "count",
      vars: [{ name: "right", value: rightCursor }],
    });

    for (let left = start; left < mid; left += 1) {
      leftPos = left;
      validPositions = Array.from({ length: Math.max(0, rightCursor - mid) }, (_, offset) => mid + offset);
      lastAdded = 0;
      addStep({
        title: { vi: `Xét left=${left}: value ${working[left].value}`, en: `Inspect left=${left}: value ${working[left].value}` },
        note: {
          vi: `Tìm các value bên phải thỏa ${working[left].value} > 2 × right.value.`,
          en: `Find right-side values satisfying ${working[left].value} > 2 × right.value.`,
        },
        codeLine: 10,
        nextPhase: "count",
        vars: [{ name: "left value", value: working[left].value }],
      });
      while (rightCursor < end && working[left].value > 2 * working[rightCursor].value) {
        validPositions = Array.from({ length: rightCursor - mid + 1 }, (_, offset) => mid + offset);
        addStep({
          title: {
            vi: `${working[left].value} > 2 × ${working[rightCursor].value} ✓`,
            en: `${working[left].value} > 2 × ${working[rightCursor].value} ✓`,
          },
          note: {
            vi: `Original pair (${working[left].originalIndex}, ${working[rightCursor].originalIndex}) hợp lệ. Vì nửa phải đã sort, mọi position từ mid đến right hiện tại cũng hợp lệ.`,
            en: `Original pair (${working[left].originalIndex}, ${working[rightCursor].originalIndex}) is valid. Since the right half is sorted, every position from mid through this right position is valid.`,
          },
          codeLine: 11,
          nextPhase: "compare-valid",
          vars: [{ name: "right", value: rightCursor }],
        });
        rightCursor += 1;
        addStep({
          title: { vi: `right → ${rightCursor}`, en: `right → ${rightCursor}` },
          note: { vi: "Thử value lớn hơn tiếp theo trong nửa phải.", en: "Try the next larger value in the right half." },
          codeLine: 12,
          nextPhase: "move-right",
          vars: [{ name: "right", value: rightCursor }],
        });
      }
      addStep({
        title: rightCursor < end
          ? { vi: `${working[left].value} ≤ 2 × ${working[rightCursor].value} → dừng`, en: `${working[left].value} ≤ 2 × ${working[rightCursor].value} → stop` }
          : { vi: "right đã đến cuối nửa phải", en: "right reached the end of the right half" },
        note: rightCursor < end
          ? { vi: "Value hiện tại và mọi value lớn hơn phía sau đều không thể tạo reverse pair với left này.", en: "This value and every larger value after it cannot form a reverse pair with this left value." }
          : { vi: "Mọi value trong nửa phải đều hợp lệ với left này.", en: "Every value in the right half is valid with this left value." },
        codeLine: 11,
        nextPhase: "count",
      });
      lastAdded = rightCursor - mid;
      validPositions = Array.from({ length: lastAdded }, (_, offset) => mid + offset);
      rangeCount += lastAdded;
      addStep({
        title: { vi: `count += ${rightCursor} - ${mid} = ${lastAdded}`, en: `count += ${rightCursor} - ${mid} = ${lastAdded}` },
        note: {
          vi: `${lastAdded} value bên phải tạo reverse pair với original index ${working[left].originalIndex}; count của đoạn là ${rangeCount}.`,
          en: `${lastAdded} right-side values form reverse pairs with original index ${working[left].originalIndex}; the range count is ${rangeCount}.`,
        },
        codeLine: 13,
        nextPhase: "count-add",
        vars: [{ name: "right - mid", value: lastAdded }, { name: "count", value: rangeCount }],
      });
    }

    const merged = working.slice(start, end).sort((a, b) => a.value - b.value || a.originalIndex - b.originalIndex);
    working.splice(start, end - start, ...merged);
    leftPos = null;
    rightCursor = null;
    validPositions = [];
    mergedRange = { start, end };
    addStep({
      title: { vi: `Merge và sort [${start}, ${end})`, en: `Merge and sort [${start}, ${end})` },
      note: {
        vi: `Đoạn sau merge: [${working.slice(start, end).map((item) => item.value).join(", ")}]. Cấp cha sẽ dùng thứ tự tăng dần này.`,
        en: `Merged range: [${working.slice(start, end).map((item) => item.value).join(", ")}]. The parent level will use this increasing order.`,
      },
      codeLine: 14,
      nextPhase: "merge",
      vars: [{ name: "sorted", value: `[${working.slice(start, end).map((item) => item.value).join(", ")}]` }],
    });
    addStep({
      title: { vi: `return count = ${rangeCount}`, en: `return count = ${rangeCount}` },
      note: { vi: `Đoạn [${start}, ${end}) đóng góp ${rangeCount} reverse pair.`, en: `Range [${start}, ${end}) contributes ${rangeCount} reverse pairs.` },
      codeLine: 15,
      nextPhase: "return",
      vars: [{ name: "count", value: rangeCount }],
    });
    stack.pop();
    return rangeCount;
  }

  const answer = sortCount(0, working.length, 0);
  range = { start: 0, mid: Math.floor(working.length / 2), end: working.length, depth: 0 };
  leftPos = null;
  rightCursor = null;
  validPositions = [];
  rangeCount = answer;
  lastAdded = 0;
  mergedRange = { start: 0, end: working.length };
  addStep({
    title: { vi: `Hoàn tất → return ${answer}`, en: `Done → return ${answer}` },
    note: { vi: `Có ${answer} cặp (i, j) thỏa i < j và nums[i] > 2 × nums[j].`, en: `${answer} pairs (i, j) satisfy i < j and nums[i] > 2 × nums[j].` },
    codeLine: 16,
    nextPhase: "done",
    vars: [{ name: "answer", value: answer }],
    final: true,
  });
  return { original: [...nums], answer, steps };
}

/** LeetCode 1649: Create Sorted Array Through Instructions — compression + Fenwick Tree. */
function buildSteps493SegmentTree(input) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const values = [...new Set(nums)].sort((a, b) => a - b);
  const rank = new Map(values.map((value, index) => [value, index]));
  const size = values.length;
  const tree = Array(Math.max(1, size * 4)).fill(0);
  const treeRanges = [];
  const steps = [];
  let phase = "compress";
  let currentIndex = -1;
  let threshold = null;
  let queryLeft = null;
  let queryPath = [];
  let coveredNodes = [];
  let updatePath = [];
  let found = 0;
  let answer = 0;

  const collectRanges = (node, start, end, depth) => {
    treeRanges.push({ node, start, end, depth });
    if (start === end) return;
    const mid = Math.floor((start + end) / 2);
    collectRanges(node * 2, start, mid, depth + 1);
    collectRanges(node * 2 + 1, mid + 1, end, depth + 1);
  };
  if (size) collectRanges(1, 0, size - 1, 0);

  const upperBound = (target) => {
    let left = 0;
    let right = size;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] <= target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const query = (node, start, end, left, right) => {
    queryPath.push(node);
    if (right < start || end < left) return 0;
    if (left <= start && end <= right) {
      coveredNodes.push(node);
      return tree[node];
    }
    const mid = Math.floor((start + end) / 2);
    return query(node * 2, start, mid, left, right)
      + query(node * 2 + 1, mid + 1, end, left, right);
  };
  const update = (node, start, end, index) => {
    updatePath.push(node);
    if (start === end) {
      tree[node] += 1;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (index <= mid) update(node * 2, start, mid, index);
    else update(node * 2 + 1, mid + 1, end, index);
    tree[node] = tree[node * 2] + tree[node * 2 + 1];
  };
  const snapshot = () => ({
    phase,
    nums: [...nums],
    values: [...values],
    tree: [...tree],
    treeRanges: treeRanges.map((item) => ({ ...item })),
    currentIndex,
    threshold,
    queryLeft,
    queryPath: [...queryPath],
    coveredNodes: [...coveredNodes],
    updatePath: [...updatePath],
    found,
    answer,
  });
  const addStep = (title, note, codeLine, nextPhase, vars = [], final = false) => {
    phase = nextPhase;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      codeBlock: 2,
      final,
      arr: [...nums],
      highlight: currentIndex >= 0 ? [currentIndex] : [],
      mark: [],
      vars: [{ name: "answer", value: answer }, ...vars],
      reversePairsSegmentTreeView: snapshot(),
    });
  };

  addStep(
    { vi: "Nén tọa độ các giá trị", en: "Coordinate-compress the values" },
    { vi: "Sắp các value duy nhất để mỗi value có một rank tăng dần.", en: "Sort unique values so every value receives an increasing rank." },
    5, "compress", [{ name: "values", value: `[${values.join(", ")}]` }],
  );
  addStep(
    { vi: "Khởi tạo Segment Tree tần suất", en: "Initialize the frequency Segment Tree" },
    { vi: "Mỗi node lưu số value đã xuất hiện trong range rank của nó.", en: "Every node stores the number of seen values in its rank range." },
    7, "init",
  );

  for (let index = 0; index < nums.length; index += 1) {
    currentIndex = index;
    threshold = 2 * nums[index];
    queryLeft = null;
    queryPath = [];
    coveredNodes = [];
    updatePath = [];
    found = 0;
    addStep(
      { vi: `Xét nums[${index}] = ${nums[index]}`, en: `Process nums[${index}] = ${nums[index]}` },
      { vi: `Cây đang chứa ${index} value ở các index nhỏ hơn ${index}.`, en: `The tree contains ${index} values from earlier indices.` },
      27, "scan", [{ name: "value", value: nums[index] }, { name: "seen", value: index }],
    );
    queryLeft = upperBound(threshold);
    addStep(
      { vi: `Tìm value đầu tiên > ${threshold}`, en: `Find the first value > ${threshold}` },
      { vi: `bisect_right(${threshold}) trả rank ${queryLeft}; cần query [${queryLeft}, ${size - 1}].`, en: `bisect_right(${threshold}) returns rank ${queryLeft}; query [${queryLeft}, ${size - 1}].` },
      28, "bounds", [{ name: "2 * value", value: threshold }, { name: "first rank", value: queryLeft }],
    );
    if (size && queryLeft < size) found = query(1, 0, size - 1, queryLeft, size - 1);
    addStep(
      { vi: `Segment Tree query trả ${found}`, en: `Segment Tree query returns ${found}` },
      { vi: `${found} value trước đó lớn hơn 2 * ${nums[index]} = ${threshold}.`, en: `${found} earlier values are greater than 2 * ${nums[index]} = ${threshold}.` },
      30, "query", [{ name: "found", value: found }],
    );
    answer += found;
    addStep(
      { vi: `answer += ${found} → ${answer}`, en: `answer += ${found} → ${answer}` },
      { vi: `Các value được đếm đều có index i < ${index}.`, en: `Every counted value has index i < ${index}.` },
      30, "count", [{ name: "found", value: found }],
    );
    queryPath = [];
    coveredNodes = [];
    updatePath = [];
    if (size) update(1, 0, size - 1, rank.get(nums[index]));
    addStep(
      { vi: `Update value ${nums[index]} vào cây`, en: `Update value ${nums[index]} into the tree` },
      { vi: "Chỉ update sau query để nums[j] không tự ghép với chính nó.", en: "Update after querying so nums[j] never pairs with itself." },
      31, "update", [{ name: "rank", value: rank.get(nums[index]) }],
    );
  }

  currentIndex = -1;
  threshold = null;
  queryLeft = null;
  queryPath = [];
  coveredNodes = [];
  updatePath = [];
  found = 0;
  addStep(
    { vi: `Hoàn tất → return ${answer}`, en: `Done → return ${answer}` },
    { vi: `Có ${answer} cặp (i, j) thỏa i < j và nums[i] > 2 * nums[j].`, en: `${answer} pairs satisfy i < j and nums[i] > 2 * nums[j].` },
    32, "done", [{ name: "answer", value: answer }], true,
  );
  return { original: [...nums], answer, steps };
}

function buildSteps493(input, params = {}) {
  return Number(params && params.approach) === 2
    ? buildSteps493SegmentTree(input)
    : buildSteps493MergeSort(input);
}

function buildSteps1649(input) {
  const instructions = Array.isArray(input) ? input.map(Number) : [];
  const values = [...new Set(instructions)].sort((a, b) => a - b);
  const ranks = new Map(values.map((value, index) => [value, index + 1]));
  const bit = Array(values.length + 1).fill(0);
  const MOD = 1000000007;
  const steps = [];
  const costs = Array(instructions.length).fill(null);
  let phase = "compress";
  let currentIndex = -1;
  let currentValue = null;
  let currentRank = null;
  let queryKind = null;
  let queryLimit = null;
  let queryCursor = null;
  let queryTotal = 0;
  let queryPath = [];
  let updateCursor = null;
  let updatePath = [];
  let less = 0;
  let lessOrEqual = 0;
  let greater = 0;
  let currentCost = 0;
  let totalCost = 0;

  const makeView = () => ({
    phase,
    instructions: [...instructions],
    values: [...values],
    ranks: values.map((value, index) => ({ value, rank: index + 1 })),
    bit: bit.slice(1),
    costs: [...costs],
    currentIndex,
    currentValue,
    currentRank,
    queryKind,
    queryLimit,
    queryCursor,
    queryTotal,
    queryPath: [...queryPath],
    updateCursor,
    updatePath: [...updatePath],
    less,
    lessOrEqual,
    greater,
    currentCost,
    totalCost,
    inserted: currentIndex >= 0 ? currentIndex : costs.filter((value) => value !== null).length,
    mod: MOD,
  });
  const addStep = ({ title, note, codeLine, nextPhase, vars = [], final = false }) => {
    phase = nextPhase;
    const view = makeView();
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: [...instructions],
      highlight: currentIndex >= 0 ? [currentIndex] : [],
      mark: Array.from({ length: Math.max(0, currentIndex) }, (_, index) => index),
      vars: [
        { name: "answer", value: totalCost },
        ...(currentIndex >= 0 ? [{ name: "inserted", value: currentIndex }] : []),
        ...vars,
      ],
      sortedArrayCostView: view,
    });
  };

  addStep({
    title: { vi: "Nén tọa độ instructions", en: "Coordinate-compress instructions" },
    note: {
      vi: `Sắp xếp các giá trị duy nhất: [${values.join(", ")}]. Thứ tự rank giữ nguyên quan hệ nhỏ hơn/lớn hơn.`,
      en: `Sort the unique values: [${values.join(", ")}]. Rank order preserves smaller/greater comparisons.`,
    },
    codeLine: 4,
    nextPhase: "compress",
    vars: [{ name: "values", value: `[${values.join(", ")}]` }],
  });
  addStep({
    title: { vi: "Tạo ánh xạ value → rank", en: "Build the value → rank mapping" },
    note: {
      vi: `Dùng rank 1-based cho Fenwick: ${values.map((value) => `${value}→${ranks.get(value)}`).join(", ")}.`,
      en: `Use 1-based ranks for Fenwick: ${values.map((value) => `${value}→${ranks.get(value)}`).join(", ")}.`,
    },
    codeLine: 5,
    nextPhase: "rank",
    vars: [{ name: "rank", value: `{${values.map((value) => `${value}:${ranks.get(value)}`).join(", ")}}` }],
  });
  addStep({
    title: { vi: "Khởi tạo Fenwick Tree", en: "Initialize the Fenwick Tree" },
    note: {
      vi: "BIT lưu tần suất của các giá trị đã được chèn, được nhóm theo rank.",
      en: "BIT stores frequencies of values already inserted, grouped by rank.",
    },
    codeLine: 6,
    nextPhase: "bit-init",
    vars: [{ name: "bit", value: `[${bit.join(", ")}]` }],
  });
  addStep({
    title: { vi: "answer = 0", en: "answer = 0" },
    note: {
      vi: "Chi phí tổng được cộng modulo 1,000,000,007 sau mỗi instruction.",
      en: "The running cost is reduced modulo 1,000,000,007 after every instruction.",
    },
    codeLine: 17,
    nextPhase: "init",
  });

  function tracedQuery(limit, kind, callLine) {
    queryKind = kind;
    queryLimit = limit;
    queryCursor = limit;
    queryTotal = 0;
    queryPath = [];
    updateCursor = null;
    updatePath = [];
    const targetText = kind === "less"
      ? { vi: "nhỏ hơn", en: "strictly smaller" }
      : { vi: "nhỏ hơn hoặc bằng", en: "less than or equal" };
    addStep({
      title: { vi: `Gọi query(${limit}) để đếm ${targetText.vi}`, en: `Call query(${limit}) to count ${targetText.en}` },
      note: kind === "less"
        ? { vi: `Các rank 1..${limit} đại diện cho value < ${currentValue}.`, en: `Ranks 1..${limit} represent values < ${currentValue}.` }
        : { vi: `Các rank 1..${limit} đại diện cho value ≤ ${currentValue}.`, en: `Ranks 1..${limit} represent values ≤ ${currentValue}.` },
      codeLine: callLine,
      nextPhase: kind === "less" ? "query-less" : "query-lte",
      vars: [{ name: "query index", value: limit }],
    });
    addStep({
      title: { vi: `Vào query(${limit})`, en: `Enter query(${limit})` },
      note: { vi: "Fenwick query tính prefix frequency đến rank này.", en: "A Fenwick query computes the prefix frequency through this rank." },
      codeLine: 7,
      nextPhase: kind === "less" ? "query-less" : "query-lte",
    });
    addStep({
      title: { vi: "query total = 0", en: "query total = 0" },
      note: { vi: "Bắt đầu cộng các node Fenwick trên query path.", en: "Start accumulating Fenwick nodes on the query path." },
      codeLine: 8,
      nextPhase: kind === "less" ? "query-less" : "query-lte",
      vars: [{ name: "query total", value: 0 }],
    });
    while (queryCursor > 0) {
      addStep({
        title: { vi: `${queryCursor} > 0 → đọc BIT[${queryCursor}]`, en: `${queryCursor} > 0 → read BIT[${queryCursor}]` },
        note: {
          vi: `Node này đang chứa ${bit[queryCursor]} phần tử đã chèn trong đoạn rank mà nó quản lý.`,
          en: `This node currently contains ${bit[queryCursor]} inserted elements in its covered rank range.`,
        },
        codeLine: 9,
        nextPhase: kind === "less" ? "query-less" : "query-lte",
      });
      queryPath.push(queryCursor);
      queryTotal += bit[queryCursor];
      addStep({
        title: { vi: `total += BIT[${queryCursor}] → ${queryTotal}`, en: `total += BIT[${queryCursor}] → ${queryTotal}` },
        note: { vi: `Cộng ${bit[queryCursor]}, query total hiện là ${queryTotal}.`, en: `Add ${bit[queryCursor]}; the query total is now ${queryTotal}.` },
        codeLine: 10,
        nextPhase: kind === "less" ? "query-less" : "query-lte",
        vars: [{ name: `BIT[${queryCursor}]`, value: bit[queryCursor] }, { name: "query total", value: queryTotal }],
      });
      const previous = queryCursor;
      queryCursor -= queryCursor & -queryCursor;
      addStep({
        title: { vi: `index: ${previous} → ${queryCursor}`, en: `index: ${previous} → ${queryCursor}` },
        note: {
          vi: `Trừ lowbit(${previous}) = ${previous & -previous} để đi đến node prefix tiếp theo.`,
          en: `Subtract lowbit(${previous}) = ${previous & -previous} to reach the next prefix node.`,
        },
        codeLine: 11,
        nextPhase: kind === "less" ? "query-less" : "query-lte",
        vars: [{ name: "index", value: queryCursor }],
      });
    }
    addStep({
      title: { vi: "index = 0 → kết thúc query", en: "index = 0 → finish query" },
      note: { vi: "Đã đi hết query path.", en: "The query path is complete." },
      codeLine: 9,
      nextPhase: kind === "less" ? "query-less" : "query-lte",
      vars: [{ name: "query total", value: queryTotal }],
    });
    addStep({
      title: { vi: `query(${limit}) trả ${queryTotal}`, en: `query(${limit}) returns ${queryTotal}` },
      note: { vi: `Có ${queryTotal} giá trị đã chèn thuộc prefix rank 1..${limit}.`, en: `${queryTotal} inserted values belong to rank prefix 1..${limit}.` },
      codeLine: 12,
      nextPhase: kind === "less" ? "query-less" : "query-lte",
      vars: [{ name: "return", value: queryTotal }],
    });
    return queryTotal;
  }

  function tracedUpdate(rankValue) {
    queryKind = null;
    queryCursor = null;
    queryPath = [];
    updateCursor = rankValue;
    updatePath = [];
    addStep({
      title: { vi: `Gọi update(${rankValue})`, en: `Call update(${rankValue})` },
      note: { vi: `Thêm value ${currentValue} vào tần suất rank ${rankValue}.`, en: `Insert value ${currentValue} into frequency rank ${rankValue}.` },
      codeLine: 24,
      nextPhase: "update",
      vars: [{ name: "rank", value: rankValue }],
    });
    addStep({
      title: { vi: `Vào update(${rankValue})`, en: `Enter update(${rankValue})` },
      note: { vi: "Update đi từ node hiện tại lên các node cha Fenwick.", en: "Update walks from the current node through its Fenwick ancestors." },
      codeLine: 13,
      nextPhase: "update",
    });
    while (updateCursor < bit.length) {
      addStep({
        title: { vi: `${updateCursor} < ${bit.length} → cập nhật node`, en: `${updateCursor} < ${bit.length} → update node` },
        note: { vi: `BIT[${updateCursor}] quản lý một đoạn rank chứa rank ${rankValue}.`, en: `BIT[${updateCursor}] covers a rank range containing rank ${rankValue}.` },
        codeLine: 14,
        nextPhase: "update",
      });
      updatePath.push(updateCursor);
      bit[updateCursor] += 1;
      addStep({
        title: { vi: `BIT[${updateCursor}] += 1 → ${bit[updateCursor]}`, en: `BIT[${updateCursor}] += 1 → ${bit[updateCursor]}` },
        note: { vi: `Node này giờ chứa tổng tần suất ${bit[updateCursor]}.`, en: `This node now stores frequency total ${bit[updateCursor]}.` },
        codeLine: 15,
        nextPhase: "update",
        vars: [{ name: `BIT[${updateCursor}]`, value: bit[updateCursor] }],
      });
      const previous = updateCursor;
      updateCursor += updateCursor & -updateCursor;
      addStep({
        title: { vi: `index: ${previous} → ${updateCursor}`, en: `index: ${previous} → ${updateCursor}` },
        note: { vi: `Cộng lowbit(${previous}) = ${previous & -previous} để đi lên node cha.`, en: `Add lowbit(${previous}) = ${previous & -previous} to move to the parent node.` },
        codeLine: 16,
        nextPhase: "update",
        vars: [{ name: "index", value: updateCursor }],
      });
    }
    addStep({
      title: { vi: "Update hoàn tất", en: "Update complete" },
      note: { vi: `${currentValue} đã nằm trong Fenwick và sẽ được tính cho instruction tiếp theo.`, en: `${currentValue} is now in Fenwick and will be counted for the next instruction.` },
      codeLine: 14,
      nextPhase: "update-done",
    });
  }

  for (let index = 0; index < instructions.length; index += 1) {
    currentIndex = index;
    currentValue = instructions[index];
    currentRank = null;
    queryKind = null;
    queryLimit = null;
    queryCursor = null;
    queryTotal = 0;
    queryPath = [];
    updateCursor = null;
    updatePath = [];
    less = 0;
    lessOrEqual = 0;
    greater = 0;
    currentCost = 0;
    addStep({
      title: { vi: `Xử lý instructions[${index}] = ${currentValue}`, en: `Process instructions[${index}] = ${currentValue}` },
      note: { vi: `Trước khi chèn đã có ${index} phần tử trong sorted array.`, en: `${index} elements are already in the sorted array before this insertion.` },
      codeLine: 18,
      nextPhase: "scan",
      vars: [{ name: "value", value: currentValue }],
    });
    currentRank = ranks.get(currentValue);
    addStep({
      title: { vi: `rank(${currentValue}) = ${currentRank}`, en: `rank(${currentValue}) = ${currentRank}` },
      note: { vi: "Dùng rank để query tần suất theo thứ tự giá trị.", en: "Use the rank to query frequencies by value order." },
      codeLine: 19,
      nextPhase: "rank-current",
      vars: [{ name: "r", value: currentRank }],
    });

    less = tracedQuery(currentRank - 1, "less", 20);
    addStep({
      title: { vi: `less = ${less}`, en: `less = ${less}` },
      note: { vi: `Có ${less} phần tử đã chèn nhỏ hơn ${currentValue}.`, en: `${less} inserted elements are smaller than ${currentValue}.` },
      codeLine: 20,
      nextPhase: "less-result",
      vars: [{ name: "less", value: less }],
    });
    lessOrEqual = tracedQuery(currentRank, "lte", 21);
    greater = index - lessOrEqual;
    addStep({
      title: { vi: `greater = ${index} - ${lessOrEqual} = ${greater}`, en: `greater = ${index} - ${lessOrEqual} = ${greater}` },
      note: {
        vi: `Lấy số đã chèn (${index}) trừ số ≤ ${currentValue} (${lessOrEqual}); giá trị bằng không được tính là lớn hơn.`,
        en: `Subtract values ≤ ${currentValue} (${lessOrEqual}) from inserted count (${index}); equal values are not greater.`,
      },
      codeLine: 21,
      nextPhase: "greater-result",
      vars: [{ name: "less_or_equal", value: lessOrEqual }, { name: "greater", value: greater }],
    });
    currentCost = Math.min(less, greater);
    costs[index] = currentCost;
    addStep({
      title: { vi: `cost = min(${less}, ${greater}) = ${currentCost}`, en: `cost = min(${less}, ${greater}) = ${currentCost}` },
      note: { vi: "Chi phí chèn là nhánh rẻ hơn giữa số nhỏ hơn và số lớn hơn.", en: "Insertion cost is the cheaper side between smaller and greater counts." },
      codeLine: 22,
      nextPhase: "cost",
      vars: [{ name: "cost", value: currentCost }],
    });
    const previousTotal = totalCost;
    totalCost = (totalCost + currentCost) % MOD;
    addStep({
      title: { vi: `answer = (${previousTotal} + ${currentCost}) mod M → ${totalCost}`, en: `answer = (${previousTotal} + ${currentCost}) mod M → ${totalCost}` },
      note: { vi: `Cộng chi phí hiện tại và lấy modulo ${MOD}.`, en: `Add the current cost and reduce modulo ${MOD}.` },
      codeLine: 23,
      nextPhase: "cost-add",
      vars: [{ name: "answer", value: totalCost }],
    });
    tracedUpdate(currentRank);
  }

  currentIndex = -1;
  currentValue = null;
  currentRank = null;
  queryKind = null;
  queryCursor = null;
  queryPath = [];
  updateCursor = null;
  updatePath = [];
  currentCost = 0;
  addStep({
    title: { vi: `Hoàn tất → return ${totalCost}`, en: `Done → return ${totalCost}` },
    note: { vi: `Tổng chi phí tạo sorted array là ${totalCost}.`, en: `The total cost to create the sorted array is ${totalCost}.` },
    codeLine: 25,
    nextPhase: "done",
    vars: [{ name: "answer", value: totalCost }],
    final: true,
  });
  return { original: [...instructions], answer: totalCost, steps };
}

/** LeetCode 327: Count of Range Sum — prefix sums + merge-sort pair counting. */
function buildSteps327MergeSort(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const lowerRaw = Number(params.lower);
  const upperRaw = Number(params.upper);
  const lower = Number.isFinite(lowerRaw) ? Math.trunc(lowerRaw) : -2;
  const upper = Number.isFinite(upperRaw) ? Math.max(lower, Math.trunc(upperRaw)) : 2;
  const prefixOriginal = [{ sum: 0, originalIndex: 0 }];
  let working = [];
  const steps = [];
  const stack = [];
  let phase = "prefix";
  let currentNumIndex = -1;
  let range = null;
  let leftPos = null;
  let low = null;
  let high = null;
  let validPositions = [];
  let rangeCount = 0;
  let lastAdded = 0;
  let mergedRange = null;

  const snapshotView = () => ({
    phase,
    nums: [...nums],
    lower,
    upper,
    prefixOriginal: prefixOriginal.map((item) => ({ ...item })),
    working: working.map((item) => ({ ...item })),
    currentNumIndex,
    range: range ? { ...range } : null,
    leftPos,
    low,
    high,
    validPositions: [...validPositions],
    rangeCount,
    lastAdded,
    mergedRange: mergedRange ? { ...mergedRange } : null,
    stack: stack.map((item) => ({ ...item })),
  });
  const addStep = ({ title, note, codeLine, nextPhase, vars = [], final = false }) => {
    phase = nextPhase;
    const view = snapshotView();
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: [...nums],
      highlight: currentNumIndex >= 0 ? [currentNumIndex] : [],
      mark: [],
      vars: [
        { name: "lower, upper", value: `[${lower}, ${upper}]` },
        ...(range ? [{ name: "range", value: `[${range.start}, ${range.end})` }] : []),
        ...vars,
      ],
      rangeSumCountView: view,
    });
  };

  addStep({
    title: { vi: "Khởi tạo prefix với P0 = 0", en: "Initialize prefix with P0 = 0" },
    note: {
      vi: "Pj − Pi là tổng subarray nums[i..j−1]. Thêm P0 để biểu diễn các subarray bắt đầu tại index 0.",
      en: "Pj − Pi is the sum of nums[i..j−1]. P0 represents subarrays that start at index 0.",
    },
    codeLine: 3,
    nextPhase: "prefix",
    vars: [{ name: "prefix", value: "[(0, P0)]" }],
  });
  let running = 0;
  for (let index = 0; index < nums.length; index += 1) {
    currentNumIndex = index;
    running += nums[index];
    addStep({
      title: { vi: `running += nums[${index}] → ${running}`, en: `running += nums[${index}] → ${running}` },
      note: {
        vi: `Tổng từ nums[0] đến nums[${index}] là ${running}.`,
        en: `The sum from nums[0] through nums[${index}] is ${running}.`,
      },
      codeLine: 4,
      nextPhase: "prefix",
      vars: [{ name: "running", value: running }],
    });
    prefixOriginal.push({ sum: running, originalIndex: index + 1 });
    addStep({
      title: { vi: `Thêm P${index + 1} = ${running}`, en: `Append P${index + 1} = ${running}` },
      note: {
        vi: `P${index + 1} lưu tổng của nums[0..${index}].`,
        en: `P${index + 1} stores the sum of nums[0..${index}].`,
      },
      codeLine: 5,
      nextPhase: "prefix",
      vars: [{ name: `P${index + 1}`, value: running }],
    });
  }
  currentNumIndex = -1;
  working = prefixOriginal.map((item) => ({ ...item }));
  addStep({
    title: { vi: "Bắt đầu Merge Sort trên prefix", en: "Start Merge Sort on the prefixes" },
    note: {
      vi: "Mỗi lần chia, nửa trái chứa prefix index sớm hơn nửa phải. Sau khi hai nửa đã sort theo sum, dùng hai con trỏ để đếm cặp chéo.",
      en: "Each split keeps earlier prefix indices on the left. Once both halves are sorted by sum, two pointers count cross-half pairs.",
    },
    codeLine: 21,
    nextPhase: "divide",
  });

  function sortCount(start, end, depth) {
    range = { start, end, mid: null, depth };
    leftPos = null;
    low = null;
    high = null;
    validPositions = [];
    rangeCount = 0;
    lastAdded = 0;
    mergedRange = null;
    stack.push({ start, end, depth });
    addStep({
      title: { vi: `sort_count(${start}, ${end})`, en: `sort_count(${start}, ${end})` },
      note: {
        vi: `Xử lý đoạn prefix positions [${start}, ${end}).`,
        en: `Process prefix positions [${start}, ${end}).`,
      },
      codeLine: 6,
      nextPhase: "divide",
      vars: [{ name: "depth", value: depth }],
    });
    addStep({
      title: { vi: `${end} - ${start} ${end - start <= 1 ? "≤" : ">"} 1`, en: `${end} - ${start} ${end - start <= 1 ? "≤" : ">"} 1` },
      note: end - start <= 1
        ? { vi: "Đoạn có tối đa một prefix nên không thể tạo cặp.", en: "A range with at most one prefix cannot form a pair." }
        : { vi: "Đoạn còn nhiều hơn một prefix nên tiếp tục chia.", en: "The range has more than one prefix, so keep dividing." },
      codeLine: 7,
      nextPhase: "divide",
    });
    if (end - start <= 1) {
      addStep({
        title: { vi: "Base case → return 0", en: "Base case → return 0" },
        note: { vi: "Không có range sum nào trong một prefix đơn lẻ.", en: "A single prefix contains no range-sum pair." },
        codeLine: 8,
        nextPhase: "base",
        vars: [{ name: "count", value: 0 }],
      });
      stack.pop();
      return 0;
    }

    const mid = Math.floor((start + end) / 2);
    range = { start, mid, end, depth };
    addStep({
      title: { vi: `mid = ${mid}`, en: `mid = ${mid}` },
      note: {
        vi: `Chia thành [${start}, ${mid}) và [${mid}, ${end}). Prefix index trong nửa trái luôn xảy ra trước nửa phải.`,
        en: `Split into [${start}, ${mid}) and [${mid}, ${end}). Prefix indices in the left half always occur before the right half.`,
      },
      codeLine: 9,
      nextPhase: "divide",
      vars: [{ name: "mid", value: mid }],
    });
    addStep({
      title: { vi: `Đệ quy nửa trái [${start}, ${mid})`, en: `Recurse left [${start}, ${mid})` },
      note: { vi: "Đếm các cặp hoàn toàn nằm trong nửa trái.", en: "Count pairs entirely inside the left half." },
      codeLine: 10,
      nextPhase: "divide",
    });
    const leftCount = sortCount(start, mid, depth + 1);
    range = { start, mid, end, depth };
    addStep({
      title: { vi: `Nửa trái trả ${leftCount}`, en: `Left half returns ${leftCount}` },
      note: { vi: "Tiếp tục đếm các cặp hoàn toàn trong nửa phải.", en: "Continue with pairs entirely inside the right half." },
      codeLine: 11,
      nextPhase: "divide",
      vars: [{ name: "left_count", value: leftCount }],
    });
    const rightCount = sortCount(mid, end, depth + 1);
    range = { start, mid, end, depth };
    rangeCount = leftCount + rightCount;
    addStep({
      title: { vi: `count = ${leftCount} + ${rightCount} = ${rangeCount}`, en: `count = ${leftCount} + ${rightCount} = ${rangeCount}` },
      note: {
        vi: "Hai nửa hiện đã sort theo prefix sum. Bây giờ đếm các cặp có prefix trái ở nửa trái và prefix phải ở nửa phải.",
        en: "Both halves are now sorted by prefix sum. Count pairs whose left prefix is in the left half and right prefix is in the right half.",
      },
      codeLine: 11,
      nextPhase: "count",
      vars: [{ name: "count", value: rangeCount }],
    });

    low = mid;
    high = mid;
    addStep({
      title: { vi: `low = high = mid = ${mid}`, en: `low = high = mid = ${mid}` },
      note: {
        vi: "low sẽ tìm prefix phải đầu tiên có hiệu ≥ lower; high tìm vị trí đầu tiên có hiệu > upper.",
        en: "low finds the first right prefix with difference ≥ lower; high finds the first with difference > upper.",
      },
      codeLine: 12,
      nextPhase: "count",
      vars: [{ name: "low", value: low }, { name: "high", value: high }],
    });

    for (let left = start; left < mid; left += 1) {
      leftPos = left;
      validPositions = [];
      lastAdded = 0;
      addStep({
        title: { vi: `Xét prefix trái ${left}`, en: `Inspect left prefix ${left}` },
        note: {
          vi: `Prefix trái là P${working[left].originalIndex} = ${working[left].sum}. Tìm các prefix phải có hiệu trong [${lower}, ${upper}].`,
          en: `The left prefix is P${working[left].originalIndex} = ${working[left].sum}. Find right prefixes whose difference lies in [${lower}, ${upper}].`,
        },
        codeLine: 13,
        nextPhase: "count",
        vars: [{ name: "left_sum", value: working[left].sum }],
      });

      while (low < end && working[low].sum - working[left].sum < lower) {
        addStep({
          title: { vi: `${working[low].sum} - ${working[left].sum} < ${lower}`, en: `${working[low].sum} - ${working[left].sum} < ${lower}` },
          note: {
            vi: `Hiệu ${working[low].sum - working[left].sum} quá nhỏ, bỏ prefix phải P${working[low].originalIndex}.`,
            en: `Difference ${working[low].sum - working[left].sum} is too small, so skip right prefix P${working[low].originalIndex}.`,
          },
          codeLine: 14,
          nextPhase: "move-low",
          vars: [{ name: "low", value: low }],
        });
        low += 1;
        addStep({
          title: { vi: `low → ${low}`, en: `low → ${low}` },
          note: { vi: "Di chuyển low sang prefix sum lớn hơn.", en: "Move low to a larger prefix sum." },
          codeLine: 15,
          nextPhase: "move-low",
          vars: [{ name: "low", value: low }],
        });
      }
      addStep({
        title: { vi: `low dừng tại ${low}`, en: `low stops at ${low}` },
        note: low < end
          ? { vi: `Hiệu đầu tiên không nhỏ hơn lower là ${working[low].sum - working[left].sum}.`, en: `The first difference not below lower is ${working[low].sum - working[left].sum}.` }
          : { vi: "Không còn prefix phải đạt lower.", en: "No right prefix reaches lower." },
        codeLine: 14,
        nextPhase: "count",
      });

      while (high < end && working[high].sum - working[left].sum <= upper) {
        addStep({
          title: { vi: `${working[high].sum} - ${working[left].sum} ≤ ${upper}`, en: `${working[high].sum} - ${working[left].sum} ≤ ${upper}` },
          note: {
            vi: `Prefix phải P${working[high].originalIndex} vẫn không vượt upper nên mở rộng cửa sổ hợp lệ.`,
            en: `Right prefix P${working[high].originalIndex} is still within upper, so expand the valid window.`,
          },
          codeLine: 16,
          nextPhase: "move-high",
          vars: [{ name: "high", value: high }],
        });
        high += 1;
        addStep({
          title: { vi: `high → ${high}`, en: `high → ${high}` },
          note: { vi: "Tiếp tục tìm vị trí đầu tiên có hiệu > upper.", en: "Continue to the first difference greater than upper." },
          codeLine: 17,
          nextPhase: "move-high",
          vars: [{ name: "high", value: high }],
        });
      }
      addStep({
        title: { vi: `high dừng tại ${high}`, en: `high stops at ${high}` },
        note: { vi: "Khoảng prefix phải hợp lệ là [low, high).", en: "The valid right-prefix window is [low, high)." },
        codeLine: 16,
        nextPhase: "count",
      });
      validPositions = Array.from({ length: Math.max(0, high - low) }, (_, offset) => low + offset);
      lastAdded = Math.max(0, high - low);
      rangeCount += lastAdded;
      addStep({
        title: { vi: `count += ${high} - ${low} = ${lastAdded}`, en: `count += ${high} - ${low} = ${lastAdded}` },
        note: {
          vi: `Có ${lastAdded} prefix phải tạo range sum hợp lệ với P${working[left].originalIndex}. count của đoạn = ${rangeCount}.`,
          en: `${lastAdded} right prefixes form valid range sums with P${working[left].originalIndex}. The range count is ${rangeCount}.`,
        },
        codeLine: 18,
        nextPhase: "count-add",
        vars: [{ name: "high - low", value: lastAdded }, { name: "count", value: rangeCount }],
      });
    }

    const beforeMerge = working.slice(start, end).map((item) => ({ ...item }));
    const merged = beforeMerge.sort((a, b) => a.sum - b.sum || a.originalIndex - b.originalIndex);
    working.splice(start, end - start, ...merged);
    mergedRange = { start, end };
    leftPos = null;
    low = null;
    high = null;
    validPositions = [];
    addStep({
      title: { vi: `Merge và sort đoạn [${start}, ${end})`, en: `Merge and sort [${start}, ${end})` },
      note: {
        vi: `Đoạn được sắp theo prefix sum để cấp cha có thể dùng hai con trỏ: [${working.slice(start, end).map((item) => item.sum).join(", ")}].`,
        en: `Sort the range by prefix sum so its parent can use two pointers: [${working.slice(start, end).map((item) => item.sum).join(", ")}].`,
      },
      codeLine: 19,
      nextPhase: "merge",
      vars: [{ name: "sorted sums", value: `[${working.slice(start, end).map((item) => item.sum).join(", ")}]` }],
    });
    addStep({
      title: { vi: `return count = ${rangeCount}`, en: `return count = ${rangeCount}` },
      note: {
        vi: `Đoạn [${start}, ${end}) đóng góp tổng cộng ${rangeCount} range sum hợp lệ.`,
        en: `Range [${start}, ${end}) contributes ${rangeCount} valid range sums in total.`,
      },
      codeLine: 20,
      nextPhase: "return",
      vars: [{ name: "count", value: rangeCount }],
    });
    stack.pop();
    return rangeCount;
  }

  const answer = sortCount(0, working.length, 0);
  range = { start: 0, mid: Math.floor(working.length / 2), end: working.length, depth: 0 };
  rangeCount = answer;
  lastAdded = 0;
  mergedRange = { start: 0, end: working.length };
  addStep({
    title: { vi: `Hoàn tất → return ${answer}`, en: `Done → return ${answer}` },
    note: {
      vi: `Có ${answer} subarray có tổng nằm trong [${lower}, ${upper}].`,
      en: `${answer} subarrays have sums in [${lower}, ${upper}].`,
    },
    codeLine: 21,
    nextPhase: "done",
    vars: [{ name: "answer", value: answer }],
    final: true,
  });
  return { original: [...nums], answer, steps };
}

/** LeetCode 327, approach 2: prefix sums + coordinate compression + Segment Tree. */
function buildSteps327SegmentTree(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const lowerRaw = Number(params.lower);
  const upperRaw = Number(params.upper);
  const lower = Number.isFinite(lowerRaw) ? Math.trunc(lowerRaw) : -2;
  const upper = Number.isFinite(upperRaw) ? Math.max(lower, Math.trunc(upperRaw)) : 2;
  const prefix = [0];
  for (const num of nums) prefix.push(prefix[prefix.length - 1] + num);
  const values = [...new Set(prefix)].sort((a, b) => a - b);
  const rank = new Map(values.map((value, index) => [value, index]));
  const size = values.length;
  const tree = Array(Math.max(1, size * 4)).fill(0);
  const steps = [];
  let phase = "prefix";
  let prefixIndex = 0;
  let queryLeft = null;
  let queryRight = null;
  let queryPath = [];
  let coveredNodes = [];
  let updatePath = [];
  let queryCount = 0;
  let answer = 0;

  const lowerBound = (target) => {
    let left = 0;
    let right = size;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] < target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const upperBound = (target) => {
    let left = 0;
    let right = size;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] <= target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const treeRanges = [];
  const collectRanges = (node, start, end, depth) => {
    treeRanges.push({ node, start, end, depth });
    if (start === end) return;
    const mid = Math.floor((start + end) / 2);
    collectRanges(node * 2, start, mid, depth + 1);
    collectRanges(node * 2 + 1, mid + 1, end, depth + 1);
  };
  if (size) collectRanges(1, 0, size - 1, 0);

  const snapshot = () => ({
    phase,
    nums: [...nums],
    prefix: [...prefix],
    values: [...values],
    tree: [...tree],
    treeRanges: treeRanges.map((item) => ({ ...item })),
    lower,
    upper,
    prefixIndex,
    queryLeft,
    queryRight,
    queryPath: [...queryPath],
    coveredNodes: [...coveredNodes],
    updatePath: [...updatePath],
    queryCount,
    answer,
  });
  const addStep = (title, note, codeLine, nextPhase, vars = [], final = false) => {
    phase = nextPhase;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      codeBlock: 2,
      final,
      arr: [...nums],
      highlight: prefixIndex > 0 ? [prefixIndex - 1] : [],
      mark: [],
      vars: [
        { name: "lower, upper", value: `[${lower}, ${upper}]` },
        { name: "answer", value: answer },
        ...vars,
      ],
      rangeSumSegmentTreeView: snapshot(),
    });
  };

  addStep(
    { vi: "Tạo toàn bộ prefix sum", en: "Build every prefix sum" },
    { vi: "Pj là tổng nums[0..j-1]; P0 = 0.", en: "Pj is the sum of nums[0..j-1]; P0 = 0." },
    7,
    "prefix",
    [{ name: "prefix", value: `[${prefix.join(", ")}]` }],
  );
  addStep(
    { vi: "Nén tọa độ các prefix", en: "Coordinate-compress the prefixes" },
    { vi: "Mỗi prefix sum được đổi thành một rank tăng dần để Segment Tree lưu tần suất.", en: "Each prefix sum receives an increasing rank so the Segment Tree can store frequencies." },
    8,
    "compress",
    [{ name: "values", value: `[${values.join(", ")}]` }],
  );

  const query = (node, start, end, left, right) => {
    queryPath.push(node);
    if (right < start || end < left) return 0;
    if (left <= start && end <= right) {
      coveredNodes.push(node);
      return tree[node];
    }
    const mid = Math.floor((start + end) / 2);
    return query(node * 2, start, mid, left, right)
      + query(node * 2 + 1, mid + 1, end, left, right);
  };
  const update = (node, start, end, index) => {
    updatePath.push(node);
    if (start === end) {
      tree[node] += 1;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (index <= mid) update(node * 2, start, mid, index);
    else update(node * 2 + 1, mid + 1, end, index);
    tree[node] = tree[node * 2] + tree[node * 2 + 1];
  };

  prefixIndex = 0;
  updatePath = [];
  if (size) update(1, 0, size - 1, rank.get(0));
  addStep(
    { vi: "Đưa P0 = 0 vào cây", en: "Insert P0 = 0 into the tree" },
    { vi: "Cây chỉ chứa các prefix xuất hiện trước prefix đang xét.", en: "The tree contains only prefixes that occur before the current prefix." },
    30,
    "update",
    [{ name: "rank(P0)", value: rank.get(0) }],
  );

  for (let index = 1; index < prefix.length; index += 1) {
    prefixIndex = index;
    queryPath = [];
    coveredNodes = [];
    updatePath = [];
    queryCount = 0;
    const current = prefix[index];
    const minPrevious = current - upper;
    const maxPrevious = current - lower;
    queryLeft = lowerBound(minPrevious);
    queryRight = upperBound(maxPrevious) - 1;
    addStep(
      { vi: `Xét P${index} = ${current}`, en: `Process P${index} = ${current}` },
      { vi: `Cần tìm prefix trước đó Pi trong [${minPrevious}, ${maxPrevious}].`, en: `Find earlier prefixes Pi inside [${minPrevious}, ${maxPrevious}].` },
      31,
      "scan",
      [{ name: "current", value: current }],
    );
    addStep(
      { vi: `Đổi khoảng value thành rank [${queryLeft}, ${queryRight}]`, en: `Convert the value interval to ranks [${queryLeft}, ${queryRight}]` },
      { vi: "bisect_left lấy rank đầu tiên >= current-upper; bisect_right lấy vị trí sau current-lower.", en: "bisect_left finds the first rank >= current-upper; bisect_right finds the position after current-lower." },
      32,
      "bounds",
      [{ name: "value interval", value: `[${minPrevious}, ${maxPrevious}]` }],
    );
    if (size && queryLeft <= queryRight) queryCount = query(1, 0, size - 1, queryLeft, queryRight);
    addStep(
      { vi: `Segment Tree query trả ${queryCount}`, en: `Segment Tree query returns ${queryCount}` },
      { vi: `${queryCount} prefix trước đó tạo subarray sum hợp lệ kết thúc tại index ${index - 1}.`, en: `${queryCount} earlier prefixes form valid subarray sums ending at index ${index - 1}.` },
      34,
      "query",
      [{ name: "found", value: queryCount }],
    );
    answer += queryCount;
    addStep(
      { vi: `answer += ${queryCount} → ${answer}`, en: `answer += ${queryCount} → ${answer}` },
      { vi: "Cộng số prefix hợp lệ vừa truy vấn vào kết quả.", en: "Add the newly queried valid-prefix count to the answer." },
      34,
      "count",
      [{ name: "found", value: queryCount }],
    );
    queryPath = [];
    coveredNodes = [];
    updatePath = [];
    update(1, 0, size - 1, rank.get(current));
    addStep(
      { vi: `Update rank của P${index}`, en: `Update P${index}'s rank` },
      { vi: `Sau query mới thêm ${current}; nhờ vậy một prefix không bao giờ tự ghép với chính nó.`, en: `Insert ${current} only after querying, so a prefix never pairs with itself.` },
      35,
      "update",
      [{ name: `rank(P${index})`, value: rank.get(current) }],
    );
  }
  queryLeft = null;
  queryRight = null;
  queryPath = [];
  coveredNodes = [];
  updatePath = [];
  queryCount = 0;
  addStep(
    { vi: `Hoàn tất → return ${answer}`, en: `Done → return ${answer}` },
    { vi: `Có ${answer} subarray có tổng trong [${lower}, ${upper}].`, en: `${answer} subarrays have sums in [${lower}, ${upper}].` },
    36,
    "done",
    [{ name: "answer", value: answer }],
    true,
  );
  return { original: [...nums], answer, steps };
}

function buildSteps327FenwickLegacy(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const lowerRaw = Number(params.lower);
  const upperRaw = Number(params.upper);
  const lower = Number.isFinite(lowerRaw) ? Math.trunc(lowerRaw) : -2;
  const upper = Number.isFinite(upperRaw) ? Math.max(lower, Math.trunc(upperRaw)) : 2;
  const prefix = [0];
  for (const num of nums) prefix.push(prefix[prefix.length - 1] + num);
  const values = [...new Set(prefix)].sort((a, b) => a - b);
  const ranks = new Map(values.map((value, index) => [value, index + 1]));
  const bit = Array(values.length + 1).fill(0);
  const steps = [];
  let phase = "prefix";
  let prefixIndex = 0;
  let leftRank = null;
  let rightRank = null;
  let leftPath = [];
  let rightPath = [];
  let updatePath = [];
  let leftCount = 0;
  let rightCount = 0;
  let found = 0;
  let answer = 0;

  const lowerBound = (target) => {
    let left = 0;
    let right = values.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] < target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const upperBound = (target) => {
    let left = 0;
    let right = values.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] <= target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const query = (index) => {
    const path = [];
    let total = 0;
    while (index > 0) {
      path.push(index);
      total += bit[index];
      index -= index & -index;
    }
    return { total, path };
  };
  const update = (index) => {
    const path = [];
    while (index < bit.length) {
      path.push(index);
      bit[index] += 1;
      index += index & -index;
    }
    return path;
  };
  const snapshot = () => ({
    phase,
    nums: [...nums],
    prefix: [...prefix],
    values: [...values],
    ranks: values.map((value, index) => ({ value, rank: index + 1 })),
    bit: bit.slice(1),
    lower,
    upper,
    prefixIndex,
    leftRank,
    rightRank,
    leftPath: [...leftPath],
    rightPath: [...rightPath],
    updatePath: [...updatePath],
    leftCount,
    rightCount,
    found,
    answer,
  });
  const addStep = (title, note, codeLine, nextPhase, vars = [], final = false) => {
    phase = nextPhase;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      codeBlock: 3,
      final,
      arr: [...nums],
      highlight: prefixIndex > 0 ? [prefixIndex - 1] : [],
      mark: [],
      vars: [
        { name: "lower, upper", value: `[${lower}, ${upper}]` },
        { name: "answer", value: answer },
        ...vars,
      ],
      rangeSumFenwickView: snapshot(),
    });
  };

  addStep(
    { vi: "Tạo toàn bộ prefix sum", en: "Build every prefix sum" },
    { vi: "Pj là tổng nums[0..j-1]; P0 = 0.", en: "Pj is the sum of nums[0..j-1]; P0 = 0." },
    7, "prefix", [{ name: "prefix", value: `[${prefix.join(", ")}]` }],
  );
  addStep(
    { vi: "Nén prefix thành rank 1-based", en: "Compress prefixes into 1-based ranks" },
    { vi: "BIT dùng rank 1-based và lưu frequency của các prefix đã đi qua.", en: "The BIT uses 1-based ranks and stores frequencies of earlier prefixes." },
    8, "compress", [{ name: "values", value: `[${values.join(", ")}]` }],
  );

  prefixIndex = 0;
  updatePath = update(ranks.get(0));
  addStep(
    { vi: "Update P0 = 0 vào BIT", en: "Update P0 = 0 into the BIT" },
    { vi: "BIT phải chứa prefix rỗng trước khi xét subarray đầu tiên.", en: "The BIT must contain the empty prefix before processing the first subarray." },
    25, "update", [{ name: "rank(P0)", value: ranks.get(0) }],
  );

  for (let index = 1; index < prefix.length; index += 1) {
    prefixIndex = index;
    leftRank = null;
    rightRank = null;
    leftPath = [];
    rightPath = [];
    updatePath = [];
    leftCount = 0;
    rightCount = 0;
    found = 0;
    const current = prefix[index];
    const minPrevious = current - upper;
    const maxPrevious = current - lower;
    addStep(
      { vi: `Xét P${index} = ${current}`, en: `Process P${index} = ${current}` },
      { vi: `Tìm prefix trước đó trong [${minPrevious}, ${maxPrevious}].`, en: `Find earlier prefixes inside [${minPrevious}, ${maxPrevious}].` },
      26, "scan", [{ name: "current", value: current }],
    );
    leftRank = lowerBound(minPrevious) + 1;
    rightRank = upperBound(maxPrevious);
    addStep(
      { vi: `Khoảng rank = [${leftRank}, ${rightRank}]`, en: `Rank interval = [${leftRank}, ${rightRank}]` },
      { vi: "left là rank đầu tiên >= current-upper; right là rank cuối cùng <= current-lower.", en: "left is the first rank >= current-upper; right is the last rank <= current-lower." },
      28, "bounds", [{ name: "value interval", value: `[${minPrevious}, ${maxPrevious}]` }],
    );
    const rightResult = query(rightRank);
    const leftResult = query(leftRank - 1);
    rightCount = rightResult.total;
    leftCount = leftResult.total;
    rightPath = rightResult.path;
    leftPath = leftResult.path;
    found = rightCount - leftCount;
    addStep(
      { vi: `query(${rightRank}) - query(${leftRank - 1}) = ${found}`, en: `query(${rightRank}) - query(${leftRank - 1}) = ${found}` },
      { vi: `${rightCount} prefix <= cận trên, trừ ${leftCount} prefix nhỏ hơn cận dưới.`, en: `${rightCount} prefixes are <= the upper bound; subtract ${leftCount} below the lower bound.` },
      29, "query", [{ name: "right prefix count", value: rightCount }, { name: "left prefix count", value: leftCount }],
    );
    answer += found;
    addStep(
      { vi: `answer += ${found} → ${answer}`, en: `answer += ${found} → ${answer}` },
      { vi: "Cộng số prefix trước đó tạo range sum hợp lệ.", en: "Add the earlier prefixes that form valid range sums." },
      29, "count", [{ name: "found", value: found }],
    );
    leftPath = [];
    rightPath = [];
    updatePath = update(ranks.get(current));
    addStep(
      { vi: `Update rank của P${index}`, en: `Update P${index}'s rank` },
      { vi: "Update sau query để prefix hiện tại không tự ghép với chính nó.", en: "Update after querying so the current prefix never pairs with itself." },
      30, "update", [{ name: `rank(P${index})`, value: ranks.get(current) }],
    );
  }

  prefixIndex = prefix.length - 1;
  leftRank = null;
  rightRank = null;
  leftPath = [];
  rightPath = [];
  updatePath = [];
  found = 0;
  addStep(
    { vi: `Hoàn tất → return ${answer}`, en: `Done → return ${answer}` },
    { vi: `Có ${answer} subarray có tổng trong [${lower}, ${upper}].`, en: `${answer} subarrays have sums in [${lower}, ${upper}].` },
    31, "done", [{ name: "answer", value: answer }], true,
  );
  return { original: [...nums], answer, steps };
}

/** LeetCode 327, approach 3: exact line-by-line Fenwick Tree debugger. */
function buildSteps327Fenwick(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const lowerRaw = Number(params.lower);
  const upperRaw = Number(params.upper);
  const lower = Number.isFinite(lowerRaw) ? Math.trunc(lowerRaw) : -2;
  const upper = Number.isFinite(upperRaw) ? Math.max(lower, Math.trunc(upperRaw)) : 2;
  const prefix = [];
  let values = [];
  let rank = new Map();
  let bit = [];
  const steps = [];
  let phase = "prefix-init";
  let operation = "prefix";
  let prefixIndex = 0;
  let storedThrough = -1;
  let leftRank = null;
  let rightRank = null;
  let leftPath = [];
  let rightPath = [];
  let updatePath = [];
  let leftCount = 0;
  let rightCount = 0;
  let found = 0;
  let answer = 0;
  let activeBitIndex = null;
  let queryCursor = null;
  let queryTotal = 0;

  const lowerBound = (target) => {
    let left = 0;
    let right = values.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] < target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const upperBound = (target) => {
    let left = 0;
    let right = values.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] <= target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const snapshot = () => ({
    phase, operation, nums: [...nums], prefix: [...prefix], values: [...values],
    ranks: values.map((value, index) => ({ value, rank: index + 1 })),
    bit: bit.slice(1), lower, upper, prefixIndex, storedThrough, leftRank, rightRank,
    leftPath: [...leftPath], rightPath: [...rightPath], updatePath: [...updatePath],
    leftCount, rightCount, found, answer, activeBitIndex, queryCursor, queryTotal,
  });
  const addStep = (title, note, codeLine, nextPhase, vars = [], final = false) => {
    phase = nextPhase;
    steps.push({
      title, note, codeLines: [codeLine], codeBlock: 3, final,
      arr: [...nums], highlight: prefixIndex > 0 ? [prefixIndex - 1] : [], mark: [],
      vars: [{ name: "lower, upper", value: `[${lower}, ${upper}]` }, { name: "answer", value: answer }, ...vars],
      rangeSumFenwickView: snapshot(),
    });
  };

  const traceQuery = (startIndex, side) => {
    const isRight = side === "right";
    const path = [];
    let index = startIndex;
    let total = 0;
    operation = isRight ? "query-right" : "query-left";
    activeBitIndex = null;
    queryCursor = index;
    queryTotal = 0;
    if (isRight) rightPath = [];
    else leftPath = [];
    addStep(
      { vi: `Gọi query(${startIndex})`, en: `Call query(${startIndex})` },
      { vi: isRight ? "Đếm prefix có rank <= right." : "Đếm prefix có rank < left.", en: isRight ? "Count prefixes with rank <= right." : "Count prefixes with rank < left." },
      29, "query-call", [{ name: "index", value: startIndex }],
    );
    addStep(
      { vi: `Vào query(index=${startIndex})`, en: `Enter query(index=${startIndex})` },
      { vi: "Tạm dừng vòng lặp chính và chạy hàm prefix query.", en: "Pause the main loop and execute the prefix-query helper." },
      12, "query-enter", [{ name: "index", value: startIndex }],
    );
    addStep(
      { vi: "total = 0", en: "total = 0" },
      { vi: "Khởi tạo tổng frequency cho query này.", en: "Initialize the frequency total for this query." },
      13, "query-init", [{ name: "total", value: 0 }],
    );
    while (index > 0) {
      activeBitIndex = index;
      queryCursor = index;
      addStep(
        { vi: `${index} > 0 → tiếp tục`, en: `${index} > 0 → continue` },
        { vi: `BIT[${index}] là node tiếp theo trên query path.`, en: `BIT[${index}] is the next node on the query path.` },
        14, "query-check", [{ name: "index", value: index }, { name: "total", value: total }],
      );
      path.push(index);
      total += bit[index];
      queryTotal = total;
      if (isRight) { rightPath = [...path]; rightCount = total; }
      else { leftPath = [...path]; leftCount = total; }
      addStep(
        { vi: `total += BIT[${index}] → ${total}`, en: `total += BIT[${index}] → ${total}` },
        { vi: `Cộng frequency ${bit[index]} do node này quản lý.`, en: `Add the frequency ${bit[index]} covered by this node.` },
        15, "query-read", [{ name: `BIT[${index}]`, value: bit[index] }, { name: "total", value: total }],
      );
      const lowbit = index & -index;
      const next = index - lowbit;
      addStep(
        { vi: `index -= lowbit(${index}) → ${next}`, en: `index -= lowbit(${index}) → ${next}` },
        { vi: `Bỏ đoạn rank vừa đếm dài ${lowbit}, rồi đi về node cha.`, en: `Remove the ${lowbit}-rank block just counted, then move to its parent.` },
        16, "query-jump", [{ name: "lowbit", value: lowbit }, { name: "next index", value: next }],
      );
      index = next;
      queryCursor = index;
    }
    activeBitIndex = null;
    addStep(
      { vi: "index = 0 → dừng while", en: "index = 0 → stop while" },
      { vi: "Query path đã đi hết các đoạn rank cần cộng.", en: "The query path has covered every required rank block." },
      14, "query-check", [{ name: "index", value: 0 }, { name: "total", value: total }],
    );
    addStep(
      { vi: `return total = ${total}`, en: `return total = ${total}` },
      { vi: `query(${startIndex}) trả về ${total}.`, en: `query(${startIndex}) returns ${total}.` },
      17, "query-return", [{ name: "total", value: total }],
    );
    return total;
  };

  const traceUpdate = (startIndex, label, callerLine) => {
    let index = startIndex;
    updatePath = [];
    operation = "update";
    activeBitIndex = null;
    addStep(
      { vi: `Gọi update(${startIndex}) cho ${label}`, en: `Call update(${startIndex}) for ${label}` },
      { vi: "Thêm một prefix vào các node Fenwick cha.", en: "Insert one prefix into its Fenwick ancestors." },
      callerLine, "update-call", [{ name: "index", value: startIndex }],
    );
    addStep(
      { vi: `Vào update(index=${startIndex})`, en: `Enter update(index=${startIndex})` },
      { vi: "Tạm dừng vòng lặp chính và chạy hàm Fenwick update.", en: "Pause the main loop and execute the Fenwick-update helper." },
      19, "update-enter", [{ name: "index", value: startIndex }],
    );
    while (index < bit.length) {
      activeBitIndex = index;
      addStep(
        { vi: `${index} < ${bit.length} → cập nhật`, en: `${index} < ${bit.length} → update` },
        { vi: `BIT[${index}] chứa rank ${startIndex}, nên frequency tăng 1.`, en: `BIT[${index}] covers rank ${startIndex}, so its frequency increases by 1.` },
        20, "update-check", [{ name: "index", value: index }],
      );
      bit[index] += 1;
      updatePath.push(index);
      addStep(
        { vi: `BIT[${index}] += 1 → ${bit[index]}`, en: `BIT[${index}] += 1 → ${bit[index]}` },
        { vi: "Node hiện tại đã ghi nhận prefix mới.", en: "The current node now includes the new prefix." },
        21, "update-write", [{ name: `BIT[${index}]`, value: bit[index] }],
      );
      const lowbit = index & -index;
      const next = index + lowbit;
      addStep(
        { vi: `index += lowbit(${index}) → ${next}`, en: `index += lowbit(${index}) → ${next}` },
        { vi: `Nhảy lên node cha bằng lowbit = ${lowbit}.`, en: `Jump to the parent node using lowbit = ${lowbit}.` },
        22, "update-jump", [{ name: "lowbit", value: lowbit }, { name: "next index", value: next }],
      );
      index = next;
    }
    activeBitIndex = null;
    addStep(
      { vi: `${index} < ${bit.length} → False`, en: `${index} < ${bit.length} → False` },
      { vi: "Đã vượt kích thước BIT, kết thúc update.", en: "The index is outside the BIT, so the update is complete." },
      20, "update-check", [{ name: "index", value: index }],
    );
  };

  prefix.push(0);
  addStep(
    { vi: "prefix = [0]", en: "prefix = [0]" },
    { vi: "P0 = 0 biểu diễn prefix rỗng trước nums[0].", en: "P0 = 0 represents the empty prefix before nums[0]." },
    5, "prefix-init", [{ name: "prefix", value: `[${prefix.join(", ")}]` }],
  );
  nums.forEach((num, index) => {
    prefixIndex = index + 1;
    operation = "prefix";
    addStep(
      { vi: `Đọc nums[${index}] = ${num}`, en: `Read nums[${index}] = ${num}` },
      { vi: "Vòng for xử lý phần tử tiếp theo.", en: "The for-loop reads the next element." },
      6, "prefix-loop", [{ name: "num", value: num }],
    );
    const nextPrefix = prefix[prefix.length - 1] + num;
    prefix.push(nextPrefix);
    addStep(
      { vi: `prefix.append(${nextPrefix})`, en: `prefix.append(${nextPrefix})` },
      { vi: `${nextPrefix - num} + ${num} = ${nextPrefix}.`, en: `${nextPrefix - num} + ${num} = ${nextPrefix}.` },
      7, "prefix-append", [{ name: "prefix", value: `[${prefix.join(", ")}]` }],
    );
  });

  values = [...new Set(prefix)].sort((a, b) => a - b);
  addStep(
    { vi: "Sắp xếp và loại prefix trùng", en: "Sort and deduplicate prefixes" },
    { vi: "Mỗi giá trị prefix duy nhất sẽ nhận một rank tăng dần.", en: "Each distinct prefix value receives an increasing rank." },
    8, "compress", [{ name: "values", value: `[${values.join(", ")}]` }],
  );
  rank = new Map(values.map((value, index) => [value, index + 1]));
  addStep(
    { vi: "Tạo rank 1-based", en: "Build 1-based ranks" },
    { vi: "Fenwick Tree dùng index từ 1 và vẫn giữ thứ tự giá trị.", en: "The Fenwick Tree is 1-based while preserving value order." },
    9, "rank", [{ name: "rank", value: values.map((value) => `${value}:${rank.get(value)}`).join(", ") }],
  );
  bit = Array(values.length + 1).fill(0);
  addStep(
    { vi: `Khởi tạo BIT với ${bit.length} ô`, en: `Initialize BIT with ${bit.length} slots` },
    { vi: "BIT[0] không dùng; các frequency còn lại bắt đầu bằng 0.", en: "BIT[0] is unused; every other frequency starts at 0." },
    10, "bit-init", [{ name: "bit", value: `[${bit.join(", ")}]` }],
  );

  answer = 0;
  addStep(
    { vi: "answer = 0", en: "answer = 0" },
    { vi: "Chưa có range sum nào được đếm.", en: "No range sum has been counted yet." },
    24, "answer-init", [{ name: "answer", value: answer }],
  );
  prefixIndex = 0;
  traceUpdate(rank.get(0), "P0 = 0", 25);
  storedThrough = 0;

  for (let index = 1; index < prefix.length; index += 1) {
    prefixIndex = index;
    leftRank = null;
    rightRank = null;
    leftPath = [];
    rightPath = [];
    updatePath = [];
    leftCount = 0;
    rightCount = 0;
    found = 0;
    const current = prefix[index];
    const minPrevious = current - upper;
    const maxPrevious = current - lower;
    activeBitIndex = null;
    operation = "scan";
    addStep(
      { vi: `Vòng for: current = P${index} = ${current}`, en: `For-loop: current = P${index} = ${current}` },
      { vi: `Cần tìm prefix trước đó trong [${minPrevious}, ${maxPrevious}].`, en: `Find earlier prefixes inside [${minPrevious}, ${maxPrevious}].` },
      26, "scan", [{ name: "current", value: current }],
    );
    leftRank = lowerBound(minPrevious) + 1;
    addStep(
      { vi: `left = ${leftRank}`, en: `left = ${leftRank}` },
      { vi: `bisect_left tìm vị trí đầu tiên >= ${minPrevious}; cộng 1 để đổi sang rank 1-based.`, en: `bisect_left finds the first value >= ${minPrevious}; add 1 for a 1-based rank.` },
      27, "bounds", [{ name: "current - upper", value: minPrevious }, { name: "left", value: leftRank }],
    );
    rightRank = upperBound(maxPrevious);
    addStep(
      { vi: `right = ${rightRank}`, en: `right = ${rightRank}` },
      { vi: `bisect_right tìm vị trí sau giá trị cuối <= ${maxPrevious}; đó cũng là rank cuối cần query.`, en: `bisect_right finds the position after the last value <= ${maxPrevious}; it is also the final rank to query.` },
      28, "bounds", [{ name: "current - lower", value: maxPrevious }, { name: "right", value: rightRank }],
    );
    rightCount = traceQuery(rightRank, "right");
    leftCount = traceQuery(leftRank - 1, "left");
    found = rightCount - leftCount;
    answer += found;
    operation = "count";
    activeBitIndex = null;
    addStep(
      { vi: `answer += ${rightCount} - ${leftCount} → ${answer}`, en: `answer += ${rightCount} - ${leftCount} → ${answer}` },
      { vi: `Có ${found} prefix trước đó tạo range sum hợp lệ với P${index}.`, en: `${found} earlier prefixes form valid range sums with P${index}.` },
      29, "count", [{ name: "found", value: found }],
    );
    leftPath = [];
    rightPath = [];
    traceUpdate(rank.get(current), `P${index} = ${current}`, 30);
    storedThrough = index;
  }

  prefixIndex = prefix.length - 1;
  leftRank = null;
  rightRank = null;
  leftPath = [];
  rightPath = [];
  updatePath = [];
  found = 0;
  activeBitIndex = null;
  operation = "done";
  addStep(
    { vi: `return ${answer}`, en: `return ${answer}` },
    { vi: `Có ${answer} subarray có tổng trong [${lower}, ${upper}].`, en: `${answer} subarrays have sums in [${lower}, ${upper}].` },
    31, "done", [{ name: "answer", value: answer }], true,
  );
  return { original: [...nums], answer, steps };
}

function buildSteps327(input, params = {}) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 3) return buildSteps327Fenwick(input, params);
  if (approach === 2) return buildSteps327SegmentTree(input, params);
  return buildSteps327MergeSort(input, params);
}

module.exports = {
  699: {
    id: 699,
    difficulty: "hard",
    slug: "falling-squares",
    category: { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
    tags: [
      { key: "coordinate-compression", vi: "Nén tọa độ", en: "Coordinate Compression" },
      { key: "lazy-propagation", vi: "Lazy Propagation", en: "Lazy Propagation" },
    ],
    title: { vi: "Falling Squares", en: "Falling Squares" },
    titleVi: { vi: "Các hình vuông rơi", en: "Falling squares" },
    statement: {
      vi: "Mỗi positions[i] = [left, size] mô tả một hình vuông rơi xuống interval [left, left+size). Sau mỗi lần rơi, trả maximum height của toàn bộ skyline.",
      en: "Each positions[i] = [left, size] describes a square falling onto interval [left, left+size). Return the global maximum skyline height after every fall.",
    },
    defaultInput: "1,2;2,3;6,1",
    inputKind: "string",
    inputLabel: { vi: "positions (left,size; ...)", en: "positions (left,size; ...)" },
    approach: [
      { vi: "Nén toàn bộ cạnh left và left+size thành các ground segment liên tiếp.", en: "Compress every left and left+size edge into adjacent ground segments." },
      { vi: "Query maximum height trên footprint để tìm đáy, rồi top = base + size.", en: "Query the maximum height across the footprint for its base, then top = base + size." },
      { vi: "Lazy Segment Tree range-assign toàn bộ footprint bằng top; root là maximum toàn cục.", en: "Lazy Segment Tree range-assigns the entire footprint to top; the root is the global maximum." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Có tối đa 2n cạnh nén; mỗi square thực hiện một range-max query và một lazy range assignment O(log n).",
        en: "There are at most 2n compressed edges; every square performs one range-max query and one lazy range assignment in O(log n).",
      },
    },
    code: [
      "class Solution:",
      "    def fallingSquares(self, positions):",
      "        coords = sorted({x for left, size in positions for x in (left, left + size)})",
      "        index = {x: i for i, x in enumerate(coords)}",
      "        n = len(coords) - 1",
      "        tree = [0] * (4 * n)",
      "        lazy = [None] * (4 * n)",
      "        def push(node):",
      "            if lazy[node] is None: return",
      "            for child in (node * 2, node * 2 + 1):",
      "                tree[child] = lazy[node]",
      "                lazy[child] = lazy[node]",
      "            lazy[node] = None",
      "        def query(node, start, end, left, right):",
      "            if right < start or end < left: return 0",
      "            if left <= start and end <= right: return tree[node]",
      "            push(node)",
      "            mid = (start + end) // 2",
      "            return max(query(node*2,start,mid,left,right), query(node*2+1,mid+1,end,left,right))",
      "        def assign(node, start, end, left, right, height):",
      "            if right < start or end < left: return",
      "            if left <= start and end <= right: tree[node] = lazy[node] = height; return",
      "            push(node)",
      "            mid = (start + end) // 2",
      "            assign(node*2, start, mid, left, right, height); assign(node*2+1, mid+1, end, left, right, height)",
      "            tree[node] = max(tree[node*2], tree[node*2+1])",
      "        answer = []",
      "        for left, size in positions:",
      "            right = left + size",
      "            ql, qr = index[left], index[right] - 1",
      "            base = query(1, 0, n-1, ql, qr)",
      "            top = base + size",
      "            assign(1, 0, n-1, ql, qr, top)",
      "            answer.append(tree[1])",
      "        return answer",
    ],
    builder: buildSteps699,
  },
  732: {
    id: 732,
    difficulty: "hard",
    slug: "my-calendar-iii",
    category: { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
    tags: [
      { key: "dynamic-segment-tree", vi: "Dynamic Segment Tree", en: "Dynamic Segment Tree" },
      { key: "lazy-propagation", vi: "Lazy Propagation", en: "Lazy Propagation" },
      { key: "interval", vi: "Khoảng", en: "Interval" },
    ],
    title: { vi: "My Calendar III", en: "My Calendar III" },
    titleVi: { vi: "Lịch có số lần chồng lấp lớn nhất", en: "Calendar with maximum overlap" },
    statement: {
      vi: "Thiết kế MyCalendarThree. Mỗi book(start, end) thêm một sự kiện nửa mở [start, end) và trả số sự kiện chồng lấp đồng thời lớn nhất sau lần thêm đó.",
      en: "Design MyCalendarThree. Each book(start, end) adds a half-open event [start, end) and returns the maximum number of concurrent events after that booking.",
    },
    defaultInput: "10,20;50,60;10,40;5,15;5,10;25,55",
    inputKind: "string",
    inputLabel: { vi: "bookings (start,end; ...)", en: "bookings (start,end; ...)" },
    approach: [
      { vi: "Mỗi booking [start, end) được update +1 trên range nguyên [start, end-1].", en: "Each half-open booking [start, end) adds 1 over integer range [start, end-1]." },
      { vi: "Dynamic Segment Tree bao phủ [0, 10^9-1] nhưng chỉ tạo node trên các đường update thực sự được đi qua.", en: "A Dynamic Segment Tree covers [0, 10^9-1] but materializes only nodes actually visited by updates." },
      { vi: "tree[node] = lazy[node] + max(tree[left], tree[right]); tree[1] luôn là overlap lớn nhất toàn lịch.", en: "tree[node] = lazy[node] + max(tree[left], tree[right]); tree[1] is always the calendar's global maximum overlap." },
    ],
    complexity: {
      time: "O(log C) / booking",
      space: "O(n log C)",
      note: {
        vi: "C = 10^9 là miền thời gian. Mỗi booking đi qua O(log C) level; dictionary chỉ lưu các node đã được sử dụng.",
        en: "C = 10^9 is the time domain. Each booking visits O(log C) levels; dictionaries store only materialized nodes.",
      },
    },
    code: [
      "class MyCalendarThree:",
      "    def __init__(self):",
      "        self.tree = {}",
      "        self.lazy = {}",
      "",
      "    def update(self, node, start, end, left, right):",
      "        if right < start or end < left:",
      "            return",
      "        if left <= start and end <= right:",
      "            self.tree[node] = self.tree.get(node, 0) + 1",
      "            self.lazy[node] = self.lazy.get(node, 0) + 1",
      "            return",
      "        mid = (start + end) // 2",
      "        self.update(node * 2, start, mid, left, right)",
      "        self.update(node * 2 + 1, mid + 1, end, left, right)",
      "        self.tree[node] = self.lazy.get(node, 0) + max(self.tree.get(node * 2, 0), self.tree.get(node * 2 + 1, 0))",
      "",
      "    def book(self, start: int, end: int) -> int:",
      "        self.update(1, 0, 10**9 - 1, start, end - 1)",
      "        return self.tree[1]",
    ],
    builder: buildSteps732,
  },
  493: {
    id: 493,
    difficulty: "hard",
    slug: "reverse-pairs",
    category: { key: "divide-and-conquer", vi: "Chia để trị", en: "Divide and Conquer" },
    tags: [
      { key: "merge-sort", vi: "Merge Sort", en: "Merge Sort" },
      { key: "two-pointers", vi: "Hai con trỏ", en: "Two Pointers" },
      { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
      { key: "coordinate-compression", vi: "Nén tọa độ", en: "Coordinate Compression" },
    ],
    title: { vi: "Reverse Pairs", en: "Reverse Pairs" },
    titleVi: { vi: "Đếm cặp đảo đặc biệt", en: "Count special reverse pairs" },
    statement: {
      vi: "Cho mảng nums. Đếm số cặp index (i, j) sao cho i < j và nums[i] > 2 × nums[j].",
      en: "Given nums, count index pairs (i, j) such that i < j and nums[i] > 2 × nums[j].",
    },
    defaultInput: [1, 3, 2, 3, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Merge Sort + Two Pointers", en: "Approach 1: Merge Sort + Two Pointers" } },
        { value: "2", label: { vi: "Cách 2: Segment Tree", en: "Approach 2: Segment Tree" } },
      ] },
    ],
    approach: [
      { vi: "Merge Sort chia theo index, nên phần tử nửa trái luôn có index nhỏ hơn phần tử nửa phải.", en: "Merge Sort splits by index, so every left-half element has an earlier index than every right-half element." },
      { vi: "Sau khi hai nửa đã sort, dùng con trỏ right đơn điệu để đếm value phải thỏa left > 2 × right.", en: "Once both halves are sorted, use a monotonic right pointer to count right values satisfying left > 2 × right." },
      { vi: "Merge hai nửa theo value để cấp đệ quy cha tiếp tục đếm trong thời gian tuyến tính.", en: "Merge the halves by value so the parent recursion level can keep counting linearly." },
      { vi: "Cách 2 quét trái sang phải; với nums[j], Segment Tree đếm các nums[i] đã thấy có value > 2 * nums[j].", en: "Approach 2 scans left to right; for nums[j], a Segment Tree counts seen nums[i] values greater than 2 * nums[j]." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Cách 1 quét tuyến tính ở mỗi level Merge Sort. Cách 2 thực hiện một range query và một point update O(log n) cho mỗi phần tử.",
        en: "Approach 1 scans linearly at every Merge Sort level. Approach 2 performs one O(log n) range query and point update per element.",
      },
    },
    code: [
      "class Solution:",
      "    def reversePairs(self, nums):",
      "        def sort_count(start, end):",
      "            if end - start <= 1:",
      "                return 0",
      "            mid = (start + end) // 2",
      "            count = sort_count(start, mid)",
      "            count += sort_count(mid, end)",
      "            right = mid",
      "            for left in range(start, mid):",
      "                while right < end and nums[left] > 2 * nums[right]:",
      "                    right += 1",
      "                count += right - mid",
      "            nums[start:end] = sorted(nums[start:end])",
      "            return count",
      "        return sort_count(0, len(nums))",
    ],
    codeLabel: { vi: "Cách 1 · Merge Sort + Two Pointers", en: "Approach 1 · Merge Sort + Two Pointers" },
    code2Label: { vi: "Cách 2 · Segment Tree", en: "Approach 2 · Segment Tree" },
    code2: [
      "from bisect import bisect_right",
      "",
      "class Solution:",
      "    def reversePairs(self, nums):",
      "        values = sorted(set(nums))",
      "        rank = {value: i for i, value in enumerate(values)}",
      "        tree = [0] * (4 * len(values))",
      "",
      "        def query(node, start, end, left, right):",
      "            if right < start or end < left:",
      "                return 0",
      "            if left <= start and end <= right:",
      "                return tree[node]",
      "            mid = (start + end) // 2",
      "            return query(node*2, start, mid, left, right) + query(node*2+1, mid+1, end, left, right)",
      "",
      "        def update(node, start, end, index):",
      "            if start == end:",
      "                tree[node] += 1",
      "                return",
      "            mid = (start + end) // 2",
      "            if index <= mid: update(node*2, start, mid, index)",
      "            else: update(node*2+1, mid+1, end, index)",
      "            tree[node] = tree[node*2] + tree[node*2+1]",
      "",
      "        answer = 0",
      "        for value in nums:",
      "            first = bisect_right(values, 2 * value)",
      "            if first < len(values):",
      "                answer += query(1, 0, len(values)-1, first, len(values)-1)",
      "            update(1, 0, len(values)-1, rank[value])",
      "        return answer",
    ],
    builder: buildSteps493,
  },
  1649: {
    id: 1649,
    difficulty: "hard",
    slug: "create-sorted-array-through-instructions",
    category: { key: "fenwick-tree", vi: "Fenwick Tree", en: "Fenwick Tree" },
    tags: [
      { key: "coordinate-compression", vi: "Nén tọa độ", en: "Coordinate Compression" },
      { key: "binary-indexed-tree", vi: "Binary Indexed Tree", en: "Binary Indexed Tree" },
    ],
    title: { vi: "Create Sorted Array Through Instructions", en: "Create Sorted Array Through Instructions" },
    titleVi: { vi: "Tạo mảng đã sắp xếp qua các chỉ dẫn", en: "Create a sorted array through instructions" },
    statement: {
      vi: "Chèn lần lượt mỗi giá trị trong instructions vào một mảng đã sắp xếp. Chi phí mỗi lần chèn là min(số phần tử nhỏ hơn, số phần tử lớn hơn). Trả tổng chi phí modulo 10⁹+7.",
      en: "Insert each value from instructions into a sorted array. Each insertion costs min(number of smaller elements, number of greater elements). Return the total cost modulo 10⁹+7.",
    },
    defaultInput: [1, 5, 6, 2],
    inputKind: "integer",
    inputLabel: { vi: "instructions", en: "instructions" },
    approach: [
      { vi: "Nén các giá trị thành rank 1-based theo thứ tự tăng dần.", en: "Coordinate-compress values into increasing 1-based ranks." },
      { vi: "Fenwick query(rank−1) đếm giá trị nhỏ hơn; inserted − query(rank) đếm giá trị lớn hơn.", en: "Fenwick query(rank−1) counts smaller values; inserted − query(rank) counts greater values." },
      { vi: "Cộng min(less, greater), rồi update rank hiện tại vào Fenwick.", en: "Add min(less, greater), then update the current rank in Fenwick." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Nén tọa độ O(n log n); mỗi instruction có hai query và một update Fenwick O(log n).",
        en: "Coordinate compression costs O(n log n); every instruction performs two queries and one Fenwick update in O(log n).",
      },
    },
    code: [
      "class Solution:",
      "    def createSortedArray(self, instructions):",
      "        MOD = 10**9 + 7",
      "        values = sorted(set(instructions))",
      "        rank = {value: i + 1 for i, value in enumerate(values)}",
      "        bit = [0] * (len(values) + 1)",
      "        def query(index):",
      "            total = 0",
      "            while index > 0:",
      "                total += bit[index]",
      "                index -= index & -index",
      "            return total",
      "        def update(index):",
      "            while index < len(bit):",
      "                bit[index] += 1",
      "                index += index & -index",
      "        answer = 0",
      "        for inserted, value in enumerate(instructions):",
      "            r = rank[value]",
      "            less = query(r - 1)",
      "            greater = inserted - query(r)",
      "            cost = min(less, greater)",
      "            answer = (answer + cost) % MOD",
      "            update(r)",
      "        return answer",
    ],
    builder: buildSteps1649,
  },
  327: {
    id: 327,
    difficulty: "hard",
    slug: "count-of-range-sum",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    tags: [
      { key: "merge-sort", vi: "Merge Sort", en: "Merge Sort" },
      { key: "divide-and-conquer", vi: "Chia để trị", en: "Divide and Conquer" },
      { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
      { key: "coordinate-compression", vi: "Nén tọa độ", en: "Coordinate Compression" },
      { key: "binary-indexed-tree", vi: "Binary Indexed Tree", en: "Binary Indexed Tree" },
    ],
    title: { vi: "Count of Range Sum", en: "Count of Range Sum" },
    titleVi: { vi: "Đếm tổng đoạn trong khoảng", en: "Count range sums inside bounds" },
    statement: {
      vi: "Cho mảng nums và hai số lower, upper. Đếm số subarray có tổng nằm trong đoạn đóng [lower, upper].",
      en: "Given nums and lower and upper, count the subarrays whose sums lie in the inclusive range [lower, upper].",
    },
    defaultInput: [-2, 5, -1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "lower", type: "number", label: { vi: "lower", en: "lower" }, default: -2, allowNegative: true },
      { key: "upper", type: "number", label: { vi: "upper", en: "upper" }, default: 2, allowNegative: true },
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Prefix Sum + Merge Sort", en: "Approach 1: Prefix Sum + Merge Sort" } },
        { value: "2", label: { vi: "Cách 2: Prefix Sum + Segment Tree", en: "Approach 2: Prefix Sum + Segment Tree" } },
        { value: "3", label: { vi: "Cách 3: Prefix Sum + Fenwick Tree / BIT", en: "Approach 3: Prefix Sum + Fenwick Tree / BIT" } },
      ] },
    ],
    approach: [
      { vi: "Dùng prefix: sum(nums[i..j−1]) = Pj − Pi.", en: "Use prefixes: sum(nums[i..j−1]) = Pj − Pi." },
      { vi: "Merge Sort giữ thứ tự prefix index qua hai nửa, đồng thời sort mỗi nửa theo giá trị prefix sum.", en: "Merge Sort preserves prefix-index order across halves while sorting each half by prefix-sum value." },
      { vi: "Với mỗi prefix trái, hai con trỏ low/high tìm các prefix phải thỏa lower ≤ Pright − Pleft ≤ upper.", en: "For each left prefix, low/high locate right prefixes satisfying lower ≤ Pright − Pleft ≤ upper." },
      { vi: "Cách 2 quét prefix từ trái sang phải; Segment Tree đếm các prefix trước đó nằm trong [current−upper, current−lower].", en: "Approach 2 scans prefixes left to right; a Segment Tree counts earlier prefixes inside [current−upper, current−lower]." },
      { vi: "Cách 3 dùng BIT: count đoạn rank [left, right] = query(right) - query(left-1), rồi update rank của prefix hiện tại.", en: "Approach 3 uses a BIT: rank-range count [left, right] = query(right) - query(left-1), then updates the current prefix rank." },
    ],
    complexity: {
      time: "O(n log n) · cả ba cách",
      space: "O(n)",
      note: {
        vi: "Cách 1 dùng Merge Sort. Cách 2 dùng Segment Tree. Cách 3 dùng hai prefix query và một update BIT O(log n) cho mỗi prefix.",
        en: "Approach 1 uses Merge Sort. Approach 2 uses a Segment Tree. Approach 3 performs two BIT prefix queries and one O(log n) update per prefix.",
      },
    },
    code: [
      "class Solution:",
      "    def countRangeSum(self, nums, lower, upper):",
      "        prefix = [(0, 0)]",
      "        for index, num in enumerate(nums):",
      "            prefix.append((prefix[-1][0] + num, index + 1))",
      "        def sort_count(start, end):",
      "            if end - start <= 1:",
      "                return 0",
      "            mid = (start + end) // 2",
      "            count = sort_count(start, mid)",
      "            count += sort_count(mid, end)",
      "            low = high = mid",
      "            for left in range(start, mid):",
      "                while low < end and prefix[low][0] - prefix[left][0] < lower:",
      "                    low += 1",
      "                while high < end and prefix[high][0] - prefix[left][0] <= upper:",
      "                    high += 1",
      "                count += high - low",
      "            prefix[start:end] = sorted(prefix[start:end])",
      "            return count",
      "        return sort_count(0, len(prefix))",
    ],
    codeLabel: { vi: "Cách 1 · Prefix Sum + Merge Sort", en: "Approach 1 · Prefix Sum + Merge Sort" },
    code2Label: { vi: "Cách 2 · Prefix Sum + Segment Tree", en: "Approach 2 · Prefix Sum + Segment Tree" },
    code2: [
      "from bisect import bisect_left, bisect_right",
      "",
      "class Solution:",
      "    def countRangeSum(self, nums, lower, upper):",
      "        prefix = [0]",
      "        for num in nums:",
      "            prefix.append(prefix[-1] + num)",
      "        values = sorted(set(prefix))",
      "        rank = {value: i for i, value in enumerate(values)}",
      "        tree = [0] * (4 * len(values))",
      "",
      "        def query(node, start, end, left, right):",
      "            if right < start or end < left:",
      "                return 0",
      "            if left <= start and end <= right:",
      "                return tree[node]",
      "            mid = (start + end) // 2",
      "            return query(node*2, start, mid, left, right) + query(node*2+1, mid+1, end, left, right)",
      "",
      "        def update(node, start, end, index):",
      "            if start == end:",
      "                tree[node] += 1",
      "                return",
      "            mid = (start + end) // 2",
      "            if index <= mid: update(node*2, start, mid, index)",
      "            else: update(node*2+1, mid+1, end, index)",
      "            tree[node] = tree[node*2] + tree[node*2+1]",
      "",
      "        answer = 0",
      "        update(1, 0, len(values)-1, rank[0])",
      "        for current in prefix[1:]:",
      "            left = bisect_left(values, current - upper)",
      "            right = bisect_right(values, current - lower) - 1",
      "            answer += query(1, 0, len(values)-1, left, right)",
      "            update(1, 0, len(values)-1, rank[current])",
      "        return answer",
    ],
    code3Label: { vi: "Cách 3 · Prefix Sum + Fenwick Tree / BIT", en: "Approach 3 · Prefix Sum + Fenwick Tree / BIT" },
    code3: [
      "from bisect import bisect_left, bisect_right",
      "",
      "class Solution:",
      "    def countRangeSum(self, nums, lower, upper):",
      "        prefix = [0]",
      "        for num in nums:",
      "            prefix.append(prefix[-1] + num)",
      "        values = sorted(set(prefix))",
      "        rank = {value: i + 1 for i, value in enumerate(values)}",
      "        bit = [0] * (len(values) + 1)",
      "",
      "        def query(index):",
      "            total = 0",
      "            while index > 0:",
      "                total += bit[index]",
      "                index -= index & -index",
      "            return total",
      "",
      "        def update(index):",
      "            while index < len(bit):",
      "                bit[index] += 1",
      "                index += index & -index",
      "",
      "        answer = 0",
      "        update(rank[0])",
      "        for current in prefix[1:]:",
      "            left = bisect_left(values, current - upper) + 1",
      "            right = bisect_right(values, current - lower)",
      "            answer += query(right) - query(left - 1)",
      "            update(rank[current])",
      "        return answer",
    ],
    builder: buildSteps327,
  },
  2996: {
    id: 2996,
    difficulty: "easy",
    slug: "smallest-missing-integer-greater-than-sequential-prefix-sum",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "hash-set", vi: "Hash Set", en: "Hash Set" },
      { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    ],
    title: { vi: "Smallest Missing Integer Greater Than Sequential Prefix Sum", en: "Smallest Missing Integer Greater Than Sequential Prefix Sum" },
    titleVi: { vi: "Số thiếu nhỏ nhất từ tổng prefix liên tiếp", en: "Smallest missing from sequential prefix sum" },
    statement: {
      vi:
        "Cho nums. Lấy prefix dài nhất bắt đầu từ nums[0] sao cho mỗi số sau bằng số trước + 1. " +
        "Tính tổng prefix đó, rồi trả về số nguyên nhỏ nhất lớn hơn hoặc bằng tổng này nhưng không xuất hiện trong nums.",
      en:
        "Given nums, take the longest prefix starting at nums[0] where each next value equals previous + 1. " +
        "Sum that prefix, then return the smallest integer greater than or equal to that sum that is missing from nums.",
    },
    defaultInput: [1, 2, 3, 2, 5],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Bắt đầu total = nums[0], rồi đi từ trái sang phải khi nums[i] == nums[i-1] + 1.", en: "Start total = nums[0], then scan while nums[i] == nums[i-1] + 1." },
      { vi: "Khi prefix bị đứt, total chính là sequential prefix sum.", en: "When the prefix breaks, total is the sequential prefix sum." },
      { vi: "Dùng set(nums) để kiểm tra nhanh candidate có xuất hiện không.", en: "Use set(nums) for fast membership checks." },
      { vi: "Trong khi candidate nằm trong set, tăng candidate. Số đầu tiên không có trong set là đáp án.", en: "While the candidate is in the set, increment it. The first value not in the set is the answer." },
    ],
    complexity: {
      time: "O(n + k)",
      space: "O(n)",
      note: {
        vi: "n để tạo set và quét prefix; k là số candidate phải nhảy qua vì đã xuất hiện trong nums.",
        en: "n builds the set and scans the prefix; k is the number of candidates skipped because they appear in nums.",
      },
    },
    code: [
      "class Solution:",
      "    def missingInteger(self, nums: List[int]) -> int:",
      "        total = nums[0]",
      "        i = 1",
      "        while i < len(nums) and nums[i] == nums[i - 1] + 1:",
      "            total += nums[i]",
      "            i += 1",
      "        seen = set(nums)",
      "        while total in seen:",
      "            total += 1",
      "        return total",
    ],
    builder: buildSteps2996,
  },
  315: {
    id: 315,
    difficulty: "hard",
    slug: "count-of-smaller-numbers-after-self",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "fenwick-tree", vi: "Fenwick Tree", en: "Fenwick Tree" },
      { key: "coordinate-compression", vi: "Nén tọa độ", en: "Coordinate Compression" },
    ],
    title: { vi: "Count of Smaller Numbers After Self", en: "Count of Smaller Numbers After Self" },
    titleVi: { vi: "Đếm số nhỏ hơn ở bên phải", en: "Count smaller values to the right" },
    statement: {
      vi: "Cho mảng nums. Trả về answer, trong đó answer[i] là số phần tử nhỏ hơn nums[i] nằm bên phải index i.",
      en: "Given nums, return answer where answer[i] is the number of elements smaller than nums[i] to the right of index i.",
    },
    defaultInput: [5, 2, 6, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Nén các giá trị thành rank 1-based; giá trị nhỏ hơn có rank nhỏ hơn.", en: "Compress values into 1-based ranks; smaller values receive smaller ranks." },
      { vi: "Quét nums từ phải sang trái để Fenwick chỉ chứa các phần tử ở bên phải index hiện tại.", en: "Scan nums from right to left so Fenwick contains only elements to the right of the current index." },
      { vi: "query(rank - 1) đếm các giá trị nhỏ hơn nghiêm ngặt; update(rank) thêm nums[i] vào cây.", en: "query(rank - 1) counts strictly smaller values; update(rank) inserts nums[i] into the tree." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Nén tọa độ O(n log n); mỗi phần tử thực hiện một query và một update Fenwick O(log n).",
        en: "Coordinate compression takes O(n log n); each element performs one O(log n) Fenwick query and update.",
      },
    },
    code: [
      "class Solution:",
      "    def countSmaller(self, nums: List[int]) -> List[int]:",
      "        values = sorted(set(nums))",
      "        rank = {value: index + 1 for index, value in enumerate(values)}",
      "        bit = [0] * (len(values) + 1)",
      "        answer = [0] * len(nums)",
      "        def query(index):",
      "            total = 0",
      "            while index > 0:",
      "                total += bit[index]",
      "                index -= index & -index",
      "            return total",
      "        def update(index):",
      "            while index < len(bit):",
      "                bit[index] += 1",
      "                index += index & -index",
      "        for index in range(len(nums) - 1, -1, -1):",
      "            current_rank = rank[nums[index]]",
      "            answer[index] = query(current_rank - 1)",
      "            update(current_rank)",
      "        return answer",
    ],
    builder: buildSteps315,
  },
  3731: {
    id: 3731,
    difficulty: "easy",
    slug: "find-missing-elements",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Find Missing Elements", en: "Find Missing Elements" },
    titleVi: { vi: "Tìm các số bị thiếu", en: "Find the missing elements" },
    statement: {
      vi:
        "Cho mảng số nguyên nums (có thể chưa sắp xếp). Sắp xếp mảng và trả về tất cả số nguyên " +
        "nằm trong dải [nums.min, nums.max) nhưng KHÔNG xuất hiện trong nums.",
      en:
        "Given an integer array nums (possibly unsorted), sort it and return all integers " +
        "in the range [nums.min, nums.max) that are NOT present in nums.",
    },
    defaultInput: [7, 4, 5, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Sắp xếp nums để có thể dùng 1 con trỏ j đi từ trái sang phải.", en: "Sort nums so a single pointer j can scan left to right." },
      { vi: "Dùng biến đếm i từ nums[0] tới nums[-1] (không tính nums[-1] vì nó chắc chắn có trong nums). Nếu nums[j] == i thì i đang có trong nums → tăng j. Nếu nums[j] != i thì i bị thiếu → thêm vào kết quả.", en: "Walk integer counter i from nums[0] to nums[-1] (exclusive, since nums[-1] is always present). If nums[j] == i then i is in nums → advance j. If nums[j] != i then i is missing → append to result." },
    ],
    complexity: {
      time: "O(n log n + range)",
      space: "O(n)",
      note: {
        vi: "Sắp xếp O(n log n); duyệt O(range) ≈ O(n) nếu range không quá lớn.",
        en: "Sort O(n log n); traversal O(range) ≈ O(n) if the range isn't much larger than n.",
      },
    },
    code: [
      "class Solution:",
      "    def findMissingElements(self, nums):",
      "        nums.sort()",
      "        a = []",
      "        j = 0",
      "        for i in range(nums[0], nums[-1]):",
      "            if nums[j] != i:",
      "                a.append(i)",
      "            else:",
      "                j += 1",
      "        return a",
    ],
    builder: buildSteps3731,
  },
  4013: {
    id: 4013, difficulty: "hard", slug: "count-subarrays-with-even-odd-ratio-ii",
    category: { key: "array", vi: "Mảng / Prefix Sum", en: "Array / Prefix Sum" },
    title: { vi: "Count Subarrays With Even Odd Ratio II", en: "Count Subarrays With Even Odd Ratio II" },
    titleVi: { vi: "Đếm subarray theo tỉ lệ chẵn/lẻ II", en: "Count subarrays by even/odd ratio II" },
    statement: {
      vi: "Cho nums và hai số nguyên dương a, b. Với mỗi subarray, gọi x là số phần tử chẵn và y là số phần tử lẻ. Đếm các subarray có y > 0 và x/y <= a/b.",
      en: "Given nums and positive integers a and b, let x and y be the counts of even and odd elements in a subarray. Count subarrays where y > 0 and x/y <= a/b.",
    },
    defaultInput: [1, 2, 1, 2],
    inputKind: "nonneg",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "a", label: { vi: "Tử số a", en: "Numerator a" }, default: 3, min: 1 },
      { key: "b", label: { vi: "Mẫu số b", en: "Denominator b" }, default: 2, min: 1 },
    ],
    approach: [
      { vi: "Đổi mỗi số chẵn thành +b và mỗi số lẻ thành -a. Khi đó điều kiện x/y <= a/b tương đương tổng biến đổi <= 0.", en: "Replace each even value with +b and each odd value with -a. Then x/y <= a/b is equivalent to transformed sum <= 0." },
      { vi: "Subarray chỉ có số chẵn luôn có tổng biến đổi dương, nên điều kiện y > 0 được đảm bảo tự động.", en: "An all-even subarray always has a positive transformed sum, so the y > 0 condition is enforced automatically." },
      { vi: "Với prefix sums, subarray [l..r] hợp lệ khi pref[r+1] <= pref[l].", en: "With prefix sums, subarray [l..r] is valid when pref[r+1] <= pref[l]." },
      { vi: "Nén tọa độ và dùng Fenwick Tree để đếm số prefix trước đó >= prefix hiện tại.", en: "Coordinate-compress values and use a Fenwick Tree to count previous prefixes >= the current prefix." },
    ],
    complexity: {
      time: "O(n log n)", space: "O(n)",
      note: { vi: "Nén n+1 prefix; mỗi prefix thực hiện một query và một update Fenwick O(log n).", en: "Compress n+1 prefixes; each prefix performs one O(log n) Fenwick query and update." },
    },
    code: [
      "from bisect import bisect_left",
      "",
      "class Solution:",
      "    def countRatioSubarrays(self, nums: List[int], a: int, b: int) -> int:",
      "        pref = [0]",
      "        for num in nums:",
      "            weight = b if num % 2 == 0 else -a",
      "            pref.append(pref[-1] + weight)",
      "",
      "        values = sorted(set(pref))",
      "        bit = [0] * (len(values) + 1)",
      "",
      "        def add(index):",
      "            while index < len(bit):",
      "                bit[index] += 1",
      "                index += index & -index",
      "",
      "        def query(index):",
      "            total = 0",
      "            while index > 0:",
      "                total += bit[index]",
      "                index -= index & -index",
      "            return total",
      "",
      "        ans = 0",
      "        seen = 0",
      "        for value in pref:",
      "            rank = bisect_left(values, value) + 1",
      "            smaller = query(rank - 1)",
      "            ans += seen - smaller",
      "            add(rank)",
      "            seen += 1",
      "        return ans",
    ],
    builder: buildSteps4013,
  },
  850: {
    id: 850, difficulty: "hard", slug: "rectangle-area-ii",
    tags: [{ key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" }],
    category: { key: "array", vi: "Mảng / Sweep Line", en: "Array / Sweep Line" },
    title: { vi: "Rectangle Area II", en: "Rectangle Area II" },
    titleVi: { vi: "Tổng diện tích hợp của các hình chữ nhật", en: "Union area of rectangles" },
    statement: {
      vi: "Cho các hình chữ nhật song song với trục tọa độ. Tính tổng diện tích được phủ bởi ít nhất một hình và trả kết quả modulo 10⁹ + 7. Nhập mỗi hình theo dạng x1,y1,x2,y2; các hình cách nhau bằng dấu chấm phẩy.",
      en: "Given axis-aligned rectangles, find the total area covered by at least one rectangle and return it modulo 10⁹ + 7. Enter each rectangle as x1,y1,x2,y2, separated by semicolons.",
    },
    defaultInput: "0,0,2,2;1,0,2,3;1,0,3,1",
    inputKind: "string",
    debugMode: "semantic",
    inputLabel: { vi: "rectangles (x1,y1,x2,y2;...)", en: "rectangles (x1,y1,x2,y2;...)" },
    extraParams: [{
      key: "approach",
      type: "select",
      label: { vi: "Cách giải", en: "Approach" },
      default: 2,
      options: [
        { value: 1, label: { vi: "1 · Merge active intervals", en: "1 · Merge active intervals" } },
        { value: 2, label: { vi: "2 · Segment Tree O(n log n)", en: "2 · Segment Tree O(n log n)" } },
      ],
    }],
    approach: [
      { vi: "Cách 1 quét theo x và merge các đoạn y đang active.", en: "Approach 1 sweeps x and merges active y-intervals." },
      { vi: "Cách 2 mặc định quét theo y, nén tọa độ x và dùng Segment Tree lưu covered_x.", en: "The default approach sweeps y, compresses x, and stores covered_x in a Segment Tree." },
      { vi: "Giữa hai event, cộng covered_x × delta_y vào diện tích.", en: "Between consecutive events, add covered_x × delta_y to the area." },
    ],
    complexity: {
      time: "O(n log n)", space: "O(n)",
      note: {
        vi: "Cách 2 mặc định có 2n events; mỗi event cập nhật Segment Tree trong O(log n). Cách 1 tốn O(n² log n).",
        en: "The default approach has 2n events and updates the Segment Tree in O(log n) each. Approach 1 takes O(n² log n).",
      },
    },
    code: [
      "class Solution:",
      "    def rectangleArea(self, rectangles):",
      "        MOD = 10**9 + 7",
      "        events = []",
      "        for x1, y1, x2, y2 in rectangles:",
      "            events.append((x1, 1, y1, y2))",
      "            events.append((x2, -1, y1, y2))",
      "        events.sort()",
      "        active = []",
      "        prev_x = events[0][0]",
      "        area = 0",
      "",
      "        for x, event_type, y1, y2 in events:",
      "            covered_y = 0",
      "            current_end = float('-inf')",
      "            for start, end in sorted(active):",
      "                start = max(current_end, start)",
      "                covered_y += max(0, end - start)",
      "                current_end = max(current_end, end)",
      "            area += (x - prev_x) * covered_y",
      "            if event_type == 1:",
      "                active.append((y1, y2))",
      "            else:",
      "                active.remove((y1, y2))",
      "            prev_x = x",
      "        return area % MOD",
    ],
    code2: rectangle850SegmentTree.code,
    code2Label: { vi: "Cách 2 · Sweep Line + Segment Tree", en: "Approach 2 · Sweep Line + Segment Tree" },
    liveArgs: (input) => [parseRectangles850(input)],
    builder: buildSteps850,
    builder2: rectangle850SegmentTree.builder,
  },
  240: {
    id: 240, difficulty: "medium", slug: "search-a-2d-matrix-ii",
    category: { key: "array", vi: "Mảng / Ma trận", en: "Array / Matrix" },
    title: { vi: "Search a 2D Matrix II", en: "Search a 2D Matrix II" },
    titleVi: { vi: "Tìm kiếm trong ma trận 2D II (đi kiểu cầu thang)", en: "Search a 2D matrix II (staircase)" },
    statement: { vi: "Ma trận mỗi hàng tăng dần trái→phải, mỗi cột tăng dần trên→dưới. Kiểm tra target có tồn tại. Nhập ma trận (hàng cách ';'), target trong tham số.", en: "Each row increases left→right and each column top→bottom. Check whether target exists. Enter matrix (rows separated by ';'); target as a parameter." },
    defaultInput: "1,4,7,11,15;2,5,8,12,19;3,6,9,16,22;10,13,14,17,24;18,21,23,26,30",
    inputKind: "string", inputLabel: { vi: "Ma trận (hàng cách ;)", en: "Matrix (rows separated by ;)" },
    extraParams: [{ key: "target", label: { vi: "target", en: "target" }, default: 5 }],
    approach: [
      { vi: "Bắt đầu ở góc trên-phải (row=0, col=cuối).", en: "Start at the top-right corner (row=0, col=last)." },
      { vi: "Nếu ô > target → bỏ cả cột (col--); nếu < target → bỏ cả hàng (row++).", en: "If cell > target → drop the column (col--); if < target → drop the row (row++)." },
      { vi: "Dừng khi tìm thấy hoặc đi ra ngoài ma trận.", en: "Stop when found or when walking off the matrix." },
    ],
    complexity: { time: "O(R + C)", space: "O(1)", note: { vi: "Mỗi bước loại bỏ hẳn một hàng hoặc một cột.", en: "Each step eliminates a whole row or column." } },
    code: [
      "class Solution:",
      "    def searchMatrix(self, matrix, target):",
      "        if not matrix or not matrix[0]:",
      "            return False",
      "        row, col = 0, len(matrix[0]) - 1",
      "        while row < len(matrix) and col >= 0:",
      "            value = matrix[row][col]",
      "            if value == target:",
      "                return True",
      "            if value > target:",
      "                col -= 1",
      "            else:",
      "                row += 1",
      "        return False",
    ],
    builder: buildSteps240,
  },
  287: {
    id: 287, difficulty: "medium", slug: "find-the-duplicate-number",
    category: { key: "array", vi: "Mảng / Hai con trỏ", en: "Array / Two Pointers" },
    title: { vi: "Find the Duplicate Number", en: "Find the Duplicate Number" },
    titleVi: { vi: "Tìm số bị lặp (Floyd tortoise & hare)", en: "Find the duplicate (Floyd's cycle)" },
    statement: { vi: "Mảng n+1 số trong [1, n], có đúng một số bị lặp. Tìm số đó, không sửa mảng và dùng O(1) bộ nhớ. Nhập nums.", en: "An array of n+1 integers in [1, n] with exactly one repeated number. Find it without modifying the array and using O(1) space. Enter nums." },
    defaultInput: [1, 3, 4, 2, 2], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [],
    approach: [
      { vi: "Coi mỗi giá trị là con trỏ i→nums[i]; số bị lặp tạo ra một chu trình.", en: "Treat each value as a pointer i→nums[i]; the duplicate forms a cycle." },
      { vi: "Pha 1: slow đi 1 bước, fast đi 2 bước cho đến khi gặp nhau trong chu trình.", en: "Phase 1: slow moves 1 step, fast 2 steps until they meet inside the cycle." },
      { vi: "Pha 2: đặt lại slow về nums[0], cùng đi 1 bước; điểm gặp là cửa vào chu trình = số bị lặp.", en: "Phase 2: reset slow to nums[0], move both 1 step; the meeting point is the cycle entrance = the duplicate." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Không sửa mảng, không dùng bộ nhớ phụ.", en: "No array modification, no extra memory." } },
    code: [
      "class Solution:",
      "    def findDuplicate(self, nums):",
      "        slow = fast = nums[0]",
      "        while True:",
      "            slow = nums[slow]",
      "            fast = nums[nums[fast]]",
      "            if slow == fast:",
      "                break",
      "        slow = nums[0]",
      "        while slow != fast:",
      "            slow = nums[slow]",
      "            fast = nums[fast]",
      "        return slow",
    ],
    builder: buildSteps287,
  },
  48: {
    id: 48, difficulty: "medium", slug: "rotate-image",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [twoDArrayTag],
    title: { vi: "Rotate Image", en: "Rotate Image" },
    titleVi: { vi: "Xoay ma trận 90° (transpose + reverse)", en: "Rotate matrix 90° (transpose + reverse)" },
    statement: { vi: "Xoay ma trận n×n 90° theo chiều kim đồng hồ, tại chỗ. Nhập ma trận: hàng cách ';', giá trị cách ','.", en: "Rotate an n×n matrix 90° clockwise, in place. Enter matrix: rows separated by ';', values by ','." },
    defaultInput: "1,2,3;4,5,6;7,8,9", inputKind: "string", inputLabel: { vi: "Ma trận (hàng cách ;)", en: "Matrix (rows separated by ;)" },
    extraParams: [
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: transpose + row.reverse()", en: "Approach 1: transpose + row.reverse()" } },
        { value: "2", label: { vi: "Cách 2: transpose + swap từng cặp", en: "Approach 2: transpose + pair swaps" } },
      ] },
    ],
    approach: [
      { vi: "Bước 1 — Transpose: đổi matrix[r][c] với matrix[c][r] ở hai phía đường chéo chính; các ô (i,i) giữ nguyên.", en: "Step 1 — Transpose: swap matrix[r][c] with matrix[c][r] across the main diagonal; cells (i,i) stay fixed." },
      { vi: "Bước 2 — Reverse rows: Cách 1 gọi row.reverse(); Cách 2 tự đổi matrix[i][j] với matrix[i][n-1-j].", en: "Step 2 — Reverse rows: Approach 1 calls row.reverse(); Approach 2 manually swaps matrix[i][j] with matrix[i][n-1-j]." },
      { vi: "Ghép hai phép biến đổi: vị trí gốc (r,c) → transpose thành (c,r) → đảo hàng thành (c,n-1-r).", en: "Combine both transforms: original position (r,c) → transpose to (c,r) → row reversal to (c,n-1-r)." },
      { vi: "Làm trực tiếp trên matrix nên dùng O(1) bộ nhớ phụ; tổng công việc vẫn là O(n²).", en: "All changes happen in the matrix, so auxiliary space is O(1); total work remains O(n²)." },
    ],
    complexity: { time: "O(n²)", space: "O(1)", note: { vi: "Tại chỗ.", en: "In-place." } },
    code: ["class Solution:", "    def rotate(self, matrix):", "        n = len(matrix)", "        for i in range(n):", "            for j in range(i+1, n):", "                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]", "        for row in matrix:", "            row.reverse()"],
    code2: ["class Solution:", "    def rotate(self, matrix):", "        n = len(matrix)", "        for i in range(n):", "            for j in range(i+1, n):", "                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]", "        for i in range(n):", "            for j in range(0, n//2):", "                matrix[i][j], matrix[i][n-1-j] = matrix[i][n-1-j], matrix[i][j]"],
    builder: buildSteps48,
  },
  54: {
    id: 54, difficulty: "medium", slug: "spiral-matrix",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [twoDArrayTag],
    title: { vi: "Spiral Matrix", en: "Spiral Matrix" },
    titleVi: { vi: "Duyệt ma trận theo xoắn ốc", en: "Traverse matrix in spiral order" },
    statement: { vi: "Trả về mọi phần tử theo thứ tự xoắn ốc. Nhập ma trận: hàng cách ';', giá trị cách ','.", en: "Return all elements in spiral order. Enter matrix: rows separated by ';', values by ','." },
    defaultInput: "1,2,3,4;5,6,7,8;9,10,11,12", inputKind: "string", inputLabel: { vi: "Ma trận (hàng cách ;)", en: "Matrix (rows separated by ;)" }, extraParams: [],
    approach: [
      { vi: "top, right, bottom, left luôn bao quanh đúng vùng CHƯA duyệt.", en: "top, right, bottom, and left always enclose exactly the UNVISITED region." },
      { vi: "Quét TOP →, RIGHT ↓, BOTTOM ←, LEFT ↑ theo chiều kim đồng hồ.", en: "Scan TOP →, RIGHT ↓, BOTTOM ←, and LEFT ↑ clockwise." },
      { vi: "Xong TOP/LEFT thì tăng biên; xong RIGHT/BOTTOM thì giảm biên để co vào lớp kế tiếp.", en: "After TOP/LEFT increment the bound; after RIGHT/BOTTOM decrement it to shrink into the next layer." },
      { vi: "Kiểm tra top <= bottom và left <= right trước hai cạnh cuối để không lấy trùng khi chỉ còn một hàng hoặc một cột.", en: "Check top <= bottom and left <= right before the final two edges to avoid duplicates when only one row or column remains." },
    ],
    complexity: { time: "O(R·C)", space: "O(1)", note: { vi: "Mỗi ô thăm 1 lần.", en: "Each cell visited once." } },
    code: [
      "class Solution:",
      "    def spiralOrder(self, matrix):",
      "        res = []",
      "        top, bottom = 0, len(matrix) - 1",
      "        left, right = 0, len(matrix[0]) - 1",
      "        while top <= bottom and left <= right:",
      "            for c in range(left, right + 1):",
      "                res.append(matrix[top][c])",
      "            top += 1",
      "            for r in range(top, bottom + 1):",
      "                res.append(matrix[r][right])",
      "            right -= 1",
      "            if top <= bottom:",
      "                for c in range(right, left - 1, -1):",
      "                    res.append(matrix[bottom][c])",
      "                bottom -= 1",
      "            if left <= right:",
      "                for r in range(bottom, top - 1, -1):",
      "                    res.append(matrix[r][left])",
      "                left += 1",
      "        return res",
    ],
    builder: buildSteps54,
  },
  189: {
    id: 189, difficulty: "medium", slug: "rotate-array",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Rotate Array", en: "Rotate Array" },
    titleVi: { vi: "Xoay mảng phải k bước (mẹo đảo ngược)", en: "Rotate array right by k (reverse trick)" },
    statement: { vi: "Xoay mảng sang phải k bước, tại chỗ. Nhập nums; k trong tham số.", en: "Rotate the array right by k steps, in place. Enter nums; k as a parameter." },
    defaultInput: [1, 2, 3, 4, 5, 6, 7], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 3 }],
    approach: [{ vi: "k %= n.", en: "k %= n." }, { vi: "Đảo toàn bộ mảng.", en: "Reverse the whole array." }, { vi: "Đảo k phần tử đầu.", en: "Reverse the first k." }, { vi: "Đảo phần còn lại.", en: "Reverse the rest." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "3 lần đảo, tại chỗ.", en: "Three reversals, in-place." } },
    code: ["class Solution:", "    def rotate(self, nums, k):", "        n = len(nums); k %= n", "        nums.reverse()", "        nums[:k] = reversed(nums[:k])", "        nums[k:] = reversed(nums[k:])"],
    builder: buildSteps189,
  },
  238: {
    id: 238, difficulty: "medium", slug: "product-of-array-except-self",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Product of Array Except Self", en: "Product of Array Except Self" },
    titleVi: { vi: "Tích trừ chính nó (prefix × suffix)", en: "Product except self (prefix × suffix)" },
    statement: { vi: "answer[i] = tích mọi phần tử trừ nums[i], KHÔNG dùng phép chia. Nhập nums cách nhau dấu phẩy.", en: "answer[i] = product of all elements except nums[i], WITHOUT division. Enter nums comma-separated." },
    defaultInput: [1, 2, 3, 4], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [],
    approach: [{ vi: "Lượt 1: answer[i] = tích các phần tử bên trái (prefix).", en: "Pass 1: answer[i] = product of elements to the left (prefix)." }, { vi: "Lượt 2: nhân thêm tích các phần tử bên phải (suffix).", en: "Pass 2: multiply by the product of elements to the right (suffix)." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Không tính mảng output.", en: "Excluding the output array." } },
    code: ["class Solution:", "    def productExceptSelf(self, nums):", "        n = len(nums); answer = [1]*n", "        prefix = 1", "        for i in range(n):", "            answer[i] = prefix; prefix *= nums[i]", "        suffix = 1", "        for i in range(n-1, -1, -1):", "            answer[i] *= suffix; suffix *= nums[i]", "        return answer"],
    builder: buildSteps238,
  },
  128: {
    id: 128, difficulty: "medium", slug: "longest-consecutive-sequence",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Longest Consecutive Sequence", en: "Longest Consecutive Sequence" },
    titleVi: { vi: "Dãy liên tiếp dài nhất (hash set)", en: "Longest consecutive run (hash set)" },
    statement: { vi: "Tìm độ dài dãy số liên tiếp dài nhất, O(n). Nhập nums cách nhau dấu phẩy.", en: "Find the length of the longest run of consecutive integers, O(n). Enter nums comma-separated." },
    defaultInput: [100, 4, 200, 1, 3, 2], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [],
    approach: [{ vi: "Đưa vào set để tra cứu O(1).", en: "Put into a set for O(1) lookups." }, { vi: "Chỉ bắt đầu đếm tại ĐẦU dãy (num-1 không có trong set).", en: "Only count from a run HEAD (num-1 not in set)." }, { vi: "Đếm num, num+1, num+2, ... trong set.", en: "Count num, num+1, num+2, ... in the set." }],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Mỗi số được thăm tối đa 2 lần.", en: "Each number is visited at most twice." } },
    code: ["class Solution:", "    def longestConsecutive(self, nums):", "        num_set = set(nums); best = 0", "        for num in num_set:", "            if num - 1 not in num_set:", "                length = 1", "                while num + length in num_set: length += 1", "                best = max(best, length)", "        return best"],
    builder: buildSteps128,
  },
  66: {
    id: 66,
    difficulty: "easy",
    slug: "plus-one",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Plus One", en: "Plus One" },
    titleVi: { vi: "Cộng 1 vào số dạng mảng", en: "Add one to an array-form number" },
    statement: { vi: "Cho số nguyên biểu diễn bằng mảng chữ số (đầu là hàng cao nhất). Cộng 1 và trả về mảng kết quả. Nhập các chữ số cách nhau dấu phẩy.", en: "Given a number as an array of digits (most significant first), add 1 and return the result array. Enter digits comma-separated." },
    defaultInput: [1, 2, 3],
    inputKind: "integer", inputLabel: { vi: "digits", en: "digits" }, extraParams: [],
    approach: [
      { vi: "Duyệt từ chữ số cuối (hàng đơn vị).", en: "Scan from the last digit (units place)." },
      { vi: "Nếu < 9 → +1 và trả về ngay (không nhớ).", en: "If < 9 → +1 and return immediately (no carry)." },
      { vi: "Nếu = 9 → đặt 0, nhớ sang trái.", en: "If = 9 → set 0, carry to the left." },
      { vi: "Nếu nhớ vượt ra ngoài → thêm 1 ở đầu.", en: "If the carry overflows → prepend 1." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt từ phải sang.", en: "Single right-to-left pass." } },
    code: [
      "class Solution:",
      "    def plusOne(self, digits):",
      "        for i in range(len(digits)-1, -1, -1):",
      "            if digits[i] < 9:",
      "                digits[i] += 1; return digits",
      "            digits[i] = 0",
      "        return [1] + digits",
    ],
    builder: buildSteps66,
  },
  136: {
    id: 136,
    difficulty: "easy",
    slug: "single-number",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Single Number", en: "Single Number" },
    titleVi: { vi: "Số xuất hiện một lần (XOR)", en: "The number appearing once (XOR)" },
    statement: { vi: "Mọi phần tử xuất hiện 2 lần trừ 1 phần tử. Tìm phần tử đó, O(n) thời gian O(1) bộ nhớ. Nhập cách nhau dấu phẩy.", en: "Every element appears twice except one. Find it in O(n) time O(1) space. Enter comma-separated." },
    defaultInput: [4, 1, 2, 1, 2],
    inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [],
    approach: [
      { vi: "XOR có tính a^a=0 và a^0=a.", en: "XOR: a^a=0 and a^0=a." },
      { vi: "XOR toàn bộ mảng → các cặp triệt tiêu.", en: "XOR the whole array → pairs cancel." },
      { vi: "Kết quả là số xuất hiện đúng 1 lần.", en: "The result is the number appearing once." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt XOR.", en: "Single XOR pass." } },
    code: [
      "class Solution:",
      "    def singleNumber(self, nums):",
      "        result = 0",
      "        for num in nums:",
      "            result ^= num",
      "        return result",
    ],
    builder: buildSteps136,
  },
  169: {
    id: 169,
    difficulty: "easy",
    slug: "majority-element",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Majority Element", en: "Majority Element" },
    titleVi: { vi: "Phần tử đa số (Boyer-Moore)", en: "Majority element (Boyer-Moore)" },
    statement: { vi: "Tìm phần tử xuất hiện > n/2 lần. Dùng bỏ phiếu Boyer-Moore, O(n)/O(1). Nhập cách nhau dấu phẩy.", en: "Find the element appearing > n/2 times. Use Boyer-Moore voting, O(n)/O(1). Enter comma-separated." },
    defaultInput: [2, 2, 1, 1, 1, 2, 2],
    inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [],
    approach: [
      { vi: "Giữ candidate và count.", en: "Keep a candidate and a count." },
      { vi: "count=0 → chọn phần tử hiện tại làm candidate.", en: "count=0 → pick the current element as candidate." },
      { vi: "Cùng candidate → count+1; khác → count-1.", en: "Same as candidate → count+1; different → count-1." },
      { vi: "Phần tử đa số luôn còn lại làm candidate cuối cùng.", en: "The majority element always remains the final candidate." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt, hai biến.", en: "Single pass, two variables." } },
    code: [
      "class Solution:",
      "    def majorityElement(self, nums):",
      "        count = 0; candidate = None",
      "        for num in nums:",
      "            if count == 0: candidate = num",
      "            count += 1 if num == candidate else -1",
      "        return candidate",
    ],
    builder: buildSteps169,
  },
  268: {
    id: 268,
    difficulty: "easy",
    slug: "missing-number",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Missing Number", en: "Missing Number" },
    titleVi: { vi: "Số bị thiếu (XOR)", en: "The missing number (XOR)" },
    statement: { vi: "Cho mảng chứa n số phân biệt trong [0, n], tìm số bị thiếu. Nhập cách nhau dấu phẩy.", en: "Given an array of n distinct numbers in [0, n], find the missing one. Enter comma-separated." },
    defaultInput: [3, 0, 1],
    inputKind: "integer", inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "1 — XOR O(1) space", en: "1 — XOR O(1) space" } },
          { value: 2, label: { vi: "2 — Tổng Gauss", en: "2 — Gauss sum" } },
        ],
      },
    ],
    approach: [
      { vi: "XOR mọi index 0..n và mọi giá trị.", en: "XOR all indices 0..n and all values." },
      { vi: "Cặp (index, giá trị) trùng nhau triệt tiêu.", en: "Matching (index, value) pairs cancel." },
      { vi: "Còn lại là số bị thiếu.", en: "What remains is the missing number." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Approach 1: một lượt XOR. Approach 2: tổng mong đợi trừ tổng thực tế.", en: "Approach 1: single XOR pass. Approach 2: expected sum minus actual sum." } },
    code: [
      "class Solution:",
      "    def missingNumber(self, nums):",
      "        result = len(nums)",
      "        for i, num in enumerate(nums):",
      "            result ^= i ^ num",
      "        return result",
    ],
    code2: [
      "class Solution:",
      "    def missingNumber(self, nums: List[int]) -> int:",
      "        expected_sum = sum(range(len(nums) + 1))",
      "        actual_sum = sum(nums)",
      "        missing_num = expected_sum - actual_sum",
      "        return missing_num",
    ],
    codeLabel: { vi: "Cách 1: XOR O(1) space", en: "Approach 1: XOR O(1) space" },
    code2Label: { vi: "Cách 2: Tổng Gauss (expected − actual)", en: "Approach 2: Gauss sum (expected − actual)" },
    builder: buildSteps268,
  },
  1386: {
    id: 1386,
    difficulty: "medium",
    slug: "cinema-seat-allocation",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Cinema Seat Allocation", en: "Cinema Seat Allocation" },
    titleVi: { vi: "Xếp ghế rạp chiếu phim", en: "Cinema seat allocation" },
    statement: {
      vi: "Rạp có n hàng, mỗi hàng 10 ghế (1..10). Một nhóm 4 người cần 4 ghế liền kề trong cùng hàng (không tính lối đi giữa ghế 5 và 6). Cho danh sách ghế đã đặt, trả về số nhóm 4 người tối đa có thể xếp.",
      en: "A cinema has n rows with 10 seats each (1..10). A 4-person group needs 4 adjacent seats in one row (the aisle between seats 5 and 6 is allowed within a group only via seats 4–7). Given reserved seats, return the maximum number of 4-person groups.",
    },
    defaultInput: [3],
    inputKind: "positive",
    inputLabel: { vi: "n (số hàng)", en: "n (rows)" },
    singleInput: true,
    maxInput: 50,
    extraParams: [
      { key: "reserved", type: "string", label: { vi: "reservedSeats (hàng,ghế; ...)", en: "reservedSeats (row,seat; ...)" }, default: "1,2;1,3;1,8;2,6;3,1;3,10" },
    ],
    approach: [
      { vi: "Hàng trống xếp được 2 nhóm (2–5 và 6–9).", en: "An empty row fits 2 groups (2–5 and 6–9)." },
      { vi: "Với hàng có ghế đặt, xét 3 cửa sổ: 2–5, 6–9, 4–7.", en: "For reserved rows, check 3 windows: 2–5, 6–9, 4–7." },
      { vi: "Nếu cả hai bên trống → 2 nhóm; nếu chỉ giữa (4–7) trống → 1 nhóm.", en: "If both sides free → 2 groups; if only the middle (4–7) is free → 1 group." },
    ],
    complexity: {
      time: "O(reserved)",
      space: "O(reserved)",
      note: { vi: "Chỉ xét các hàng có ghế đặt; hàng trống tính gộp 2 nhóm mỗi hàng.", en: "Only reserved rows are examined; empty rows contribute 2 groups each in bulk." },
    },
    code: [
      "class Solution:",
      "    def maxNumberOfFamilies(self, n, reservedSeats):",
      "        from collections import defaultdict",
      "        rows = defaultdict(set)",
      "        for r, c in reservedSeats:",
      "            rows[r].add(c)",
      "        total = (n - len(rows)) * 2",
      "        for cols in rows.values():",
      "            left = not (cols & {2, 3, 4, 5})",
      "            right = not (cols & {6, 7, 8, 9})",
      "            mid = not (cols & {4, 5, 6, 7})",
      "            total += 2 if left and right else 1 if left or right or mid else 0",
      "        return total",
    ],
    builder: buildSteps1386,
  },
  31: {
    id: 31,
    difficulty: "medium",
    slug: "next-permutation",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Next Permutation", en: "Next Permutation" },
    titleVi: { vi: "Hoán vị kế tiếp (pivot + swap + reverse)", en: "Next permutation (pivot + swap + reverse)" },
    statement: {
      vi: "Cho mảng số. Biến nó thành hoán vị KẾ TIẾP theo thứ tự từ điển (tại chỗ). Nếu là lớn nhất → về nhỏ nhất. Nhập cách nhau dấu phẩy.",
      en: "Given an array, rearrange it into the NEXT lexicographic permutation (in place). If it's the largest → wrap to the smallest. Enter comma-separated.",
    },
    defaultInput: [1, 2, 3],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Tìm i lớn nhất với nums[i] < nums[i+1] (pivot).", en: "Find the largest i with nums[i] < nums[i+1] (pivot)." },
      { vi: "Nếu có pivot: tìm j từ phải với nums[j] > nums[i], swap i↔j.", en: "If a pivot exists: find j from the right with nums[j] > nums[i], swap i↔j." },
      { vi: "Đảo ngược đoạn sau i để nó nhỏ nhất.", en: "Reverse the suffix after i to make it smallest." },
      { vi: "Nếu không có pivot → đảo ngược toàn bộ (về hoán vị nhỏ nhất).", en: "If no pivot → reverse the whole array (to the smallest permutation)." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Vài lượt tuyến tính, tại chỗ.", en: "A few linear passes, in place." } },
    code: [
      "class Solution:",
      "    def nextPermutation(self, nums):",
      "        i = len(nums) - 2",
      "        while i >= 0 and nums[i] >= nums[i+1]: i -= 1",
      "        if i >= 0:",
      "            j = len(nums) - 1",
      "            while nums[j] <= nums[i]: j -= 1",
      "            nums[i], nums[j] = nums[j], nums[i]",
      "        nums[i+1:] = reversed(nums[i+1:])",
    ],
    builder: buildSteps31,
  },
  56: {
    id: 56,
    difficulty: "medium",
    slug: "merge-intervals",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Merge Intervals", en: "Merge Intervals" },
    titleVi: { vi: "Gộp đoạn chồng lấn (sort + merge)", en: "Merge overlapping intervals (sort + merge)" },
    statement: {
      vi: "Cho danh sách đoạn [start,end]. Gộp mọi đoạn chồng lấn. Nhập các đoạn dạng start-end, cách nhau dấu phẩy.",
      en: "Given intervals [start,end], merge all overlapping ones. Enter intervals as start-end separated by commas.",
    },
    defaultInput: "1-3,2-6,8-10,15-18",
    inputKind: "string",
    inputLabel: { vi: "Đoạn (start-end, cách bởi ,)", en: "Intervals (start-end, comma separated)" },
    extraParams: [],
    approach: [
      { vi: "Sắp các đoạn theo điểm bắt đầu.", en: "Sort intervals by start." },
      { vi: "Duyệt: nếu start > end của đoạn cuối trong merged → thêm đoạn mới.", en: "Scan: if start > last merged end → append a new interval." },
      { vi: "Ngược lại (chồng lấn) → mở rộng end = max(end cũ, end mới).", en: "Otherwise (overlap) → extend end = max(old end, new end)." },
    ],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Chi phí chính là sắp xếp.", en: "Dominated by the sort." } },
    code: [
      "class Solution:",
      "    def merge(self, intervals):",
      "        intervals.sort(key=lambda x: x[0])",
      "        merged = []",
      "        for start, end in intervals:",
      "            if not merged or start > merged[-1][1]: merged.append([start, end])",
      "            else: merged[-1][1] = max(merged[-1][1], end)",
      "        return merged",
    ],
    builder: buildSteps56,
  },
  41: {
    id: 41,
    difficulty: "hard",
    slug: "first-missing-positive",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "First Missing Positive", en: "First Missing Positive" },
    titleVi: { vi: "Số dương nhỏ nhất bị thiếu (cyclic sort)", en: "Smallest missing positive (cyclic sort)" },
    statement: {
      vi:
        "Cho mảng nums. Tìm số nguyên DƯƠNG nhỏ nhất KHÔNG có trong mảng, dùng O(n) thời gian và O(1) bộ nhớ phụ. " +
        "Nhập nums cách nhau dấu phẩy.",
      en:
        "Given nums, find the smallest POSITIVE integer NOT present, in O(n) time and O(1) extra space. " +
        "Enter nums as comma-separated numbers.",
    },
    defaultInput: [3, 4, -1, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Đáp án chắc chắn trong [1, n+1]. Chỉ quan tâm giá trị 1..n.", en: "The answer is always in [1, n+1]. Only values 1..n matter." },
      { vi: "Cyclic sort: đưa mỗi giá trị v về đúng index v-1 bằng cách đổi chỗ.", en: "Cyclic sort: place each value v at its correct index v-1 via swaps." },
      { vi: "Bỏ qua giá trị ≤ 0 hoặc > n, và khi đích đã có đúng giá trị.", en: "Skip values ≤ 0 or > n, and when the target already holds the right value." },
      { vi: "Quét lại: ô đầu tiên có nums[i] ≠ i+1 → đáp án i+1; nếu không có → n+1.", en: "Re-scan: the first cell with nums[i] ≠ i+1 → answer i+1; if none → n+1." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi lần đổi chỗ đưa 1 giá trị về đúng chỗ vĩnh viễn → tổng số swap ≤ n.",
        en: "Each swap places one value permanently → total swaps ≤ n.",
      },
    },
    code: [
      "class Solution:",
      "    def firstMissingPositive(self, nums):",
      "        n = len(nums)",
      "        for i in range(n):",
      "            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:",
      "                target_index = nums[i] - 1",
      "                nums[i], nums[target_index] = nums[target_index], nums[i]",
      "        for i in range(n):",
      "            if nums[i] != i + 1:",
      "                return i + 1",
      "        return n + 1",
    ],
    builder: buildSteps41,
  },
  42: {
    id: 42,
    difficulty: "hard",
    slug: "trapping-rain-water",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Trapping Rain Water", en: "Trapping Rain Water" },
    titleVi: { vi: "Hứng nước mưa (hai con trỏ)", en: "Trap rain water (two pointers)" },
    statement: {
      vi:
        "Cho mảng height biểu diễn độ cao các cột (rộng 1). Tính tổng lượng nước mưa " +
        "giữ được giữa các cột sau khi mưa. Nhập height là dãy số cách nhau dấu phẩy.",
      en:
        "Given an array height of bar heights (each width 1), compute how much rain water " +
        "can be trapped between the bars. Enter height as comma-separated numbers.",
    },
    defaultInput: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
    inputKind: "nonneg",
    inputLabel: { vi: "height", en: "height" },
    extraParams: [],
    approach: [
      { vi: "Hai con trỏ left, right từ hai đầu. left_max, right_max lưu tường cao nhất mỗi bên.", en: "Two pointers left, right from both ends. left_max, right_max track the tallest wall on each side." },
      { vi: "Luôn xử lý phía có tường THẤP HƠN vì phía đó quyết định mức nước tại cột đang xét.", en: "Always process the side with the SHORTER wall, since it caps the water level at the current bar." },
      { vi: "Nước trên cột = (max phía đó) - chiều cao cột. Cộng dồn vào tổng.", en: "Water above a bar = (that side's max) - bar height. Accumulate into the total." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt 1 lần với 2 con trỏ, bộ nhớ hằng số.",
        en: "Single pass with two pointers, constant memory.",
      },
    },
    code: [
      "class Solution:",
      "    def trap(self, height):",
      "        if not height: return 0",
      "        left, right = 0, len(height) - 1",
      "        left_max, right_max = height[left], height[right]",
      "        water = 0",
      "        while left < right:",
      "            if left_max < right_max:",
      "                left += 1",
      "                left_max = max(left_max, height[left])",
      "                water += left_max - height[left]",
      "            else:",
      "                right -= 1",
      "                right_max = max(right_max, height[right])",
      "                water += right_max - height[right]",
      "        return water",
    ],
    builder: buildSteps42,
  },
  84: {
    id: 84,
    difficulty: "hard",
    slug: "largest-rectangle-in-histogram",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Largest Rectangle in Histogram", en: "Largest Rectangle in Histogram" },
    titleVi: { vi: "Hình chữ nhật lớn nhất trong biểu đồ cột", en: "Largest rectangle in a histogram" },
    statement: {
      vi:
        "Cho mảng heights biểu diễn chiều cao các cột liên tiếp trong 1 biểu đồ cột (mỗi cột rộng 1). " +
        "Tìm diện tích hình chữ nhật LỚN NHẤT nằm hoàn toàn trong biểu đồ.",
      en:
        "Given an array heights representing the heights of contiguous bars in a histogram (each bar has width 1), " +
        "find the area of the LARGEST rectangle that fits entirely within the histogram.",
    },
    defaultInput: [2, 1, 5, 6, 2, 3],
    inputKind: "nonneg",
    inputLabel: { vi: "heights", en: "heights" },
    extraParams: [],
    approach: [
      { vi: "Dùng stack lưu INDEX theo thứ tự CHIỀU CAO TĂNG DẦN. Thêm cột lính canh cao 0 vào cuối để buộc xả hết stack.", en: "Use a stack of INDICES in strictly INCREASING height order. Append a sentinel bar of height 0 to force-flush the stack at the end." },
      { vi: "Khi cột hiện tại THẤP HƠN HOẶC BẰNG đỉnh stack → pop. Nếu thấp hơn, current là biên chặn bên phải; nếu bằng nhau, current thay index cũ để đại diện cùng chiều cao xa hơn về bên phải.", en: "When the current bar is LOWER THAN OR EQUAL TO the stack top → pop. A lower bar is the right blocker; an equal bar replaces the older index so the same height can be represented farther right." },
      { vi: "Sau khi pop hết cột cao hơn/bằng, đẩy cột hiện tại vào stack.", en: "After popping every taller-or-equal bar, push the current bar's index onto the stack." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Mỗi cột được push và pop tối đa 1 lần → tổng O(n).",
        en: "Each bar is pushed and popped at most once → total O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def largestRectangleArea(self, heights):",
      "        stack = []",
      "        max_area = 0",
      "        bars = heights + [0]",
      "        for i in range(len(bars)):",
      "            while stack and bars[stack[-1]] >= bars[i]:",
      "                top = stack.pop()",
      "                width = i - stack[-1] - 1 if stack else i",
      "                max_area = max(max_area, bars[top] * width)",
      "            stack.append(i)",
      "        return max_area",
    ],
    builder: buildSteps84,
  },
  85: {
    id: 85,
    difficulty: "hard",
    slug: "maximal-rectangle",
    category: { key: "array", vi: "Mảng / Stack", en: "Array / Stack" },
    title: { vi: "Maximal Rectangle", en: "Maximal Rectangle" },
    titleVi: { vi: "Hình chữ nhật toàn 1 lớn nhất", en: "Largest all-1 rectangle" },
    statement: {
      vi: "Cho ma trận nhị phân, tìm diện tích hình chữ nhật lớn nhất chỉ gồm các ô 1. Nhập hàng cách ';', cột cách ','.",
      en: "Given a binary matrix, find the area of the largest rectangle containing only 1s. Enter rows separated by ';', columns by ','.",
    },
    defaultInput: "1,0,1,0,0;1,0,1,1,1;1,1,1,1,1;1,0,0,1,0",
    inputKind: "string",
    inputLabel: { vi: "matrix (hàng cách ;)", en: "matrix (rows separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "Quét từng hàng, cập nhật heights[c] = số lượng 1 liên tiếp phía trên kết thúc tại hàng hiện tại.", en: "Scan row by row, updating heights[c] as consecutive 1s ending at the current row." },
      { vi: "Mỗi hàng trở thành một bài Largest Rectangle in Histogram.", en: "Each row becomes one Largest Rectangle in Histogram problem." },
      { vi: "Dùng stack tăng dần để pop cột và tính rectangle ứng viên.", en: "Use an increasing stack to pop bars and compute candidate rectangles." },
    ],
    complexity: { time: "O(R·C)", space: "O(C)", note: { vi: "Mỗi cột của mỗi hàng được push/pop tối đa một lần.", en: "Each column per row is pushed/popped at most once." } },
    code: [
      "class Solution:",
      "    def maximalRectangle(self, matrix):",
      "        if not matrix: return 0",
      "        heights = [0] * len(matrix[0])",
      "        best = 0",
      "        for row in matrix:",
      "            for c, value in enumerate(row):",
      "                heights[c] = heights[c] + 1 if value == '1' else 0",
      "            stack = []",
      "            for i, h in enumerate(heights + [0]):",
      "                while stack and heights[stack[-1]] >= h:",
      "                    top = stack.pop()",
      "                    width = i - stack[-1] - 1 if stack else i",
      "                    best = max(best, heights[top] * width)",
      "                stack.append(i)",
      "        return best",
    ],
    builder: buildSteps85,
  },
  739: {
    id: 739,
    difficulty: "medium",
    slug: "daily-temperatures",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Daily Temperatures", en: "Daily Temperatures" },
    titleVi: { vi: "Nhiệt độ hằng ngày", en: "Daily Temperatures" },
    statement: {
      vi: "Cho mảng temperatures, với mỗi ngày i hãy trả về cần chờ bao nhiêu ngày đến ngày ấm hơn tiếp theo. Nếu không có ngày nào ấm hơn ở bên phải thì trả về 0.",
      en: "Given temperatures, return for every day i how many days you must wait for a warmer temperature. Return 0 when no warmer day exists to its right.",
    },
    defaultInput: [73, 74, 75, 71, 69, 72, 76, 73],
    inputKind: "nonneg",
    inputLabel: { vi: "temperatures", en: "temperatures" },
    extraParams: [],
    approach: [
      { vi: "Duyệt từ trái sang phải; stack giữ INDEX của các ngày chưa tìm thấy ngày ấm hơn, theo nhiệt độ GIẢM DẦN từ đáy đến đỉnh.", en: "Scan left to right; the stack holds INDICES still waiting for a warmer day, with temperatures DECREASING from bottom to top." },
      { vi: "Nếu nhiệt độ hôm nay cao hơn nhiệt độ ở đỉnh, hôm nay là ngày ấm hơn đầu tiên của đỉnh: pop và ghi answer[prev] = i - prev.", en: "If today is warmer than the stack top, today is that top's first warmer day: pop it and set answer[prev] = i - prev." },
      { vi: "Sau khi giải quyết mọi ngày lạnh hơn, push index hôm nay. Các index còn lại sau vòng lặp không có ngày ấm hơn nên giữ answer = 0.", en: "After resolving every colder day, push today's index. Indices left after the scan have no warmer day, so their answer remains 0." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: { vi: "Mỗi index được push một lần và pop nhiều nhất một lần.", en: "Every index is pushed once and popped at most once." },
    },
    code: [
      "class Solution:",
      "    def dailyTemperatures(self, temperatures):",
      "        answer = [0] * len(temperatures)",
      "        stack = []",
      "        for i, temp in enumerate(temperatures):",
      "            while stack and temperatures[stack[-1]] < temp:",
      "                prev = stack.pop()",
      "                answer[prev] = i - prev",
      "            stack.append(i)",
      "        return answer",
    ],
    builder: function buildSteps739(inputTemperatures) {
      const temperatures = [...inputTemperatures];
      const answer = Array(temperatures.length).fill(0);
      const stack = [];
      const steps = [];

      const stackLabel = () => `[${stack.map((index) => `${index}:${temperatures[index]}°`).join(", ")}]`;
      const answerLabel = () => `[${answer.join(", ")}]`;
      const stackItems = () => stack.map((index) => ({
        value: `${temperatures[index]}°`,
        detail: `index ${index}`,
      }));

      function addStep({ title, codeLines, note, current = null, highlightIndices = [], status = [], vars = [], final = false }) {
        const highlight = new Set(highlightIndices);
        if (Number.isInteger(current)) highlight.add(current);
        const top = stack.length ? stack[stack.length - 1] : null;
        steps.push({
          title,
          arr: [...temperatures],
          sub: temperatures.map((_, index) => `i=${index} · wait=${answer[index]}`),
          highlight: [...highlight],
          mark: final ? answer.map((days, index) => days > 0 ? index : -1).filter((index) => index >= 0) : [],
          final,
          codeLines,
          vars: [
            { name: "stack (bottom → top)", value: stackLabel() },
            { name: "answer", value: answerLabel() },
            ...vars,
          ],
          note,
          stackView: {
            title: "Monotonic decreasing stack (indices)",
            emptyLabel: "empty stack",
            input: [...temperatures],
            inputLabel: "temperatures",
            current,
            items: stackItems(),
            status: [
              { label: "top", value: top === null ? "empty" : `${top}: ${temperatures[top]}°` },
              { label: "current", value: Number.isInteger(current) ? `${current}: ${temperatures[current]}°` : "—" },
              { label: "answer", value: answerLabel() },
              ...status,
            ],
          },
        });
      }

      addStep({
        title: { vi: "answer = [0] × n", en: "answer = [0] × n" },
        codeLines: [3],
        vars: [{ name: "n", value: temperatures.length }],
        note: { vi: "Mặc định mỗi ngày trả về 0. Chỉ thay đổi khi tìm được ngày ấm hơn đầu tiên ở bên phải.", en: "Every day starts with answer 0. Change it only when its first warmer day on the right is found." },
      });
      addStep({
        title: { vi: "stack = []", en: "stack = []" },
        codeLines: [4],
        note: { vi: "Stack lưu index của các ngày còn đang chờ nhiệt độ cao hơn. Nhiệt độ giảm dần từ đáy lên đỉnh.", en: "The stack stores indices of days still waiting for a warmer temperature. Temperatures decrease from bottom to top." },
      });

      for (let i = 0; i < temperatures.length; i++) {
        const temp = temperatures[i];
        addStep({
          title: { vi: `Duyệt i=${i}, temp=${temp}°`, en: `Scan i=${i}, temp=${temp}°` },
          codeLines: [5],
          current: i,
          vars: [{ name: "i", value: i }, { name: "temp", value: temp }],
          note: { vi: `Ngày ${i} có ${temp}°. So sánh nó với ngày ở đỉnh stack để xem ngày nào vừa gặp nhiệt độ ấm hơn đầu tiên.`, en: `Day ${i} is ${temp}°. Compare it with the stack top to see which day just found its first warmer temperature.` },
        });

        while (true) {
          const previous = stack.length ? stack[stack.length - 1] : null;
          const isWarmer = previous !== null && temperatures[previous] < temp;
          addStep({
            title: { vi: `while top < ${temp}° → ${isWarmer ? "ĐÚNG" : "SAI"}`, en: `while top < ${temp}° → ${isWarmer ? "TRUE" : "FALSE"}` },
            codeLines: [6],
            current: i,
            highlightIndices: previous === null ? [] : [previous],
            status: [{ label: "condition", value: previous === null ? "stack is empty → False" : `${temperatures[previous]}° < ${temp}° → ${isWarmer}` }],
            vars: previous === null
              ? [{ name: "condition", value: false }]
              : [{ name: "prev (top)", value: previous }, { name: "temperatures[prev] < temp", value: `${temperatures[previous]} < ${temp} → ${isWarmer}` }],
            note: isWarmer
              ? { vi: `Ngày ${i} ấm hơn ngày ${previous} (${temp}° > ${temperatures[previous]}°). Đây là ngày ấm hơn ĐẦU TIÊN vì ${previous} vẫn chưa bị pop.`, en: `Day ${i} is warmer than day ${previous} (${temp}° > ${temperatures[previous]}°). It is the FIRST warmer day because ${previous} is still unresolved on the stack.` }
              : previous === null
                ? { vi: "Stack rỗng, không còn ngày nào chờ được giải quyết. Chuyển sang push hôm nay.", en: "The stack is empty, so no waiting day can be resolved. Proceed to push today." }
                : { vi: `Đỉnh ${previous} có ${temperatures[previous]}° không thấp hơn ${temp}°. Giữ nó lại vì vẫn có thể gặp ngày ấm hơn sau này.`, en: `Top ${previous} is ${temperatures[previous]}°, which is not lower than ${temp}°. Keep it because a warmer day may appear later.` },
          });
          if (!isWarmer) break;

          const resolved = stack.pop();
          addStep({
            title: { vi: `prev = stack.pop() → ${resolved}`, en: `prev = stack.pop() → ${resolved}` },
            codeLines: [7],
            current: i,
            highlightIndices: [resolved],
            status: [{ label: "popped / resolved", value: `${resolved}: ${temperatures[resolved]}°` }],
            vars: [{ name: "prev", value: resolved }, { name: "temperature[prev]", value: temperatures[resolved] }],
            note: { vi: `Pop ngày ${resolved}: ngày ${i} vừa là ngày đầu tiên ấm hơn của nó.`, en: `Pop day ${resolved}: day ${i} is its first warmer day.` },
          });

          answer[resolved] = i - resolved;
          addStep({
            title: { vi: `answer[${resolved}] = ${i} - ${resolved} = ${answer[resolved]}`, en: `answer[${resolved}] = ${i} - ${resolved} = ${answer[resolved]}` },
            codeLines: [8],
            current: i,
            highlightIndices: [resolved],
            status: [{ label: `answer[${resolved}]`, value: answer[resolved] }],
            vars: [{ name: "prev", value: resolved }, { name: "days waited", value: answer[resolved] }],
            note: { vi: `Từ ngày ${resolved} đến ngày ${i} cần chờ ${answer[resolved]} ngày.`, en: `From day ${resolved} to day ${i}, the wait is ${answer[resolved]} day(s).` },
          });
        }

        stack.push(i);
        addStep({
          title: { vi: `stack.append(${i})`, en: `stack.append(${i})` },
          codeLines: [9],
          current: i,
          vars: [{ name: "pushed index", value: i }],
          note: { vi: `Ngày ${i} chưa thấy ngày ấm hơn của chính nó, nên push vào stack để chờ. Stack vẫn giảm dần nhiệt độ.`, en: `Day ${i} has not found its own warmer day yet, so push it onto the stack to wait. The stack remains decreasing by temperature.` },
        });
      }

      addStep({
        title: { vi: `return answer → ${answerLabel()}`, en: `return answer → ${answerLabel()}` },
        codeLines: [10],
        final: true,
        status: [{ label: "unresolved indices", value: stack.length ? `[${stack.join(", ")}] → remain 0` : "none" }],
        vars: [{ name: "unresolved", value: stack.length ? `[${stack.join(", ")}]` : "[]" }, { name: "answer", value: answerLabel() }],
        note: stack.length
          ? { vi: `Các ngày còn trong stack [${stack.join(", ")}] không có ngày ấm hơn ở bên phải nên answer của chúng giữ 0.`, en: `The days still in stack [${stack.join(", ")}] have no warmer day to the right, so their answers stay 0.` }
          : { vi: "Không còn ngày nào chờ xử lý.", en: "No day remains unresolved." },
      });

      return { original: temperatures, answer, steps };
    },
  },
  628: {
    id: 628,
    difficulty: "easy",
    slug: "maximum-product-of-three-numbers",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Maximum Product of Three Numbers", en: "Maximum Product of Three Numbers" },
    titleVi: { vi: "Tích lớn nhất của 3 số", en: "Max product of three numbers" },
    statement: {
      vi:
        "Cho mảng nums (CÓ THỂ chứa số âm), tìm tích lớn nhất có thể tạo được từ BẤT KỲ 3 số trong mảng.",
      en:
        "Given an array nums (MAY contain negative numbers), find the maximum product obtainable from ANY three numbers in the array.",
    },
    defaultInput: [-10, -10, 1, 3, 2],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Theo dõi 3 số LỚN NHẤT (first≥second≥third) trong 1 lần quét, giống bài 3536 nhưng có 3 bệ.", en: "Track the 3 LARGEST numbers (first≥second≥third) in one pass, like problem 3536 but with 3 slots." },
      { vi: "Đồng thời theo dõi 2 số NHỎ NHẤT (minFirst≤minSecond), vì 2 số âm rất nhỏ nhân lại có thể ra số dương rất lớn.", en: "Simultaneously track the 2 SMALLEST numbers (minFirst≤minSecond), because two very negative numbers multiplied can produce a very large positive." },
      { vi: "Kết quả = max(first×second×third, minFirst×minSecond×first).", en: "Result = max(first×second×third, minFirst×minSecond×first)." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Chỉ 1 lần quét qua mảng, dùng 5 biến phụ.",
        en: "Only one pass through the array, using 5 auxiliary variables.",
      },
    },
    code: [
      "class Solution:",
      "    def maximumProduct(self, nums: List[int]) -> int:",
      "        first = second = third = float('-inf')",
      "        minFirst = minSecond = float('inf')",
      "        for digit in nums:",
      "            if digit > first:",
      "                third, second, first = second, first, digit",
      "            elif digit > second:",
      "                third, second = second, digit",
      "            elif digit > third:",
      "                third = digit",
      "            if digit < minFirst:",
      "                minSecond, minFirst = minFirst, digit",
      "            elif digit < minSecond:",
      "                minSecond = digit",
      "        return max(first * second * third, minFirst * minSecond * first)",
    ],
    builder: buildSteps628,
  },
  1464: {
    id: 1464,
    difficulty: "easy",
    slug: "maximum-product-of-two-elements-in-an-array",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Maximum Product of Two Elements in an Array", en: "Maximum Product of Two Elements in an Array" },
    titleVi: { vi: "Tích lớn nhất của 2 phần tử", en: "Maximum product of two elements" },
    statement: {
      vi: "Cho mảng nums gồm các số nguyên dương. Chọn hai index khác nhau i và j sao cho (nums[i]-1) * (nums[j]-1) là lớn nhất.",
      en: "Given an array nums of positive integers, choose two different indices i and j to maximize (nums[i]-1) * (nums[j]-1).",
    },
    defaultInput: [3, 4, 5, 2],
    inputKind: "positive",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Chỉ cần 2 số lớn nhất trong mảng; các số nhỏ hơn không thể tạo tích tốt hơn.", en: "Only the two largest numbers are needed; smaller values cannot form a better product." },
      { vi: "Quét một lần, giữ first là lớn nhất và second là lớn nhì. Khi có số mới vượt first, đẩy first cũ xuống second.", en: "Scan once, keeping first as the largest and second as the runner-up. When a new value beats first, push the old first down to second." },
      { vi: "Kết quả là (first - 1) * (second - 1).", en: "The result is (first - 1) * (second - 1)." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Quét mảng đúng một lần và chỉ giữ 2 biến.",
        en: "Scan the array once and keep only 2 variables.",
      },
    },
    code: [
      "class Solution:",
      "    def maxProduct(self, nums: List[int]) -> int:",
      "        first = second = 0",
      "        for num in nums:",
      "            if num > first:",
      "                second = first",
      "                first = num",
      "            elif num > second:",
      "                second = num",
      "        return (first - 1) * (second - 1)",
    ],
    builder: buildSteps1464,
  },
  2091: {
    id: 2091,
    difficulty: "medium",
    slug: "removing-minimum-and-maximum-from-array",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Removing Minimum and Maximum From Array", en: "Removing Minimum and Maximum From Array" },
    titleVi: { vi: "Xóa phần tử nhỏ nhất và lớn nhất khỏi mảng", en: "Remove minimum and maximum from array" },
    statement: {
      vi: "Cho mảng nums gồm các số nguyên phân biệt. Mỗi bước chỉ được xóa phần tử đầu hoặc cuối. Trả về số bước ít nhất để xóa cả phần tử nhỏ nhất và lớn nhất.",
      en: "Given an array nums of distinct integers. In one operation, delete either the first or last element. Return the minimum deletions needed to remove both the minimum and maximum elements.",
    },
    defaultInput: [2, 10, 7, 5, 4, 1, 8, 6],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Quét một lần để tìm index của minimum và maximum.", en: "Scan once to find the indices of the minimum and maximum values." },
      { vi: "Đặt left = index nhỏ hơn, right = index lớn hơn.", en: "Let left be the smaller index and right be the larger index." },
      { vi: "So sánh 3 cách: xóa hết từ đầu tới right, xóa hết từ cuối tới left, hoặc xóa từ cả hai đầu.", en: "Compare 3 choices: delete from the front through right, delete from the back through left, or delete from both ends." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Một lần quét để tìm min/max; sau đó chỉ tính 3 công thức.",
        en: "One scan finds min/max; afterward only three formulas are evaluated.",
      },
    },
    code: [
      "class Solution:",
      "    def minimumDeletions(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        min_idx = max_idx = 0",
      "        for i in range(1, n):",
      "            if nums[i] < nums[min_idx]:",
      "                min_idx = i",
      "            if nums[i] > nums[max_idx]:",
      "                max_idx = i",
      "        left, right = sorted((min_idx, max_idx))",
      "        front = right + 1",
      "        back = n - left",
      "        both = left + 1 + n - right",
      "        return min(front, back, both)",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int MinimumDeletions(int[] nums) {",
      "        int n = nums.Length;",
      "        int minIdx = 0, maxIdx = 0;",
      "        for (int i = 1; i < n; i++) {",
      "            if (nums[i] < nums[minIdx]) minIdx = i;",
      "            if (nums[i] > nums[maxIdx]) maxIdx = i;",
      "        }",
      "        int left = Math.Min(minIdx, maxIdx);",
      "        int right = Math.Max(minIdx, maxIdx);",
      "        int front = right + 1;",
      "        int back = n - left;",
      "        int both = left + 1 + n - right;",
      "        return Math.Min(front, Math.Min(back, both));",
      "    }",
      "}",
    ],
    builder: buildSteps2091,
  },
  1299: {
    id: 1299,
    difficulty: "easy",
    slug: "replace-elements-with-greatest-element-on-right-side",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Replace Elements with Greatest Element on Right Side", en: "Replace Elements with Greatest Element on Right Side" },
    titleVi: { vi: "Thay bằng phần tử lớn nhất bên phải", en: "Replace with greatest on right" },
    statement: {
      vi: "Cho mảng arr. Thay mỗi phần tử bằng phần tử lớn nhất nằm ở bên phải nó. Phần tử cuối trở thành -1.",
      en: "Given an array arr, replace every element with the greatest element among the elements to its right. The last element becomes -1.",
    },
    defaultInput: [17, 18, 5, 4, 6, 1],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần từ phải. Thay tại chỗ nên O(1) bộ nhớ phụ.",
        en: "Single right-to-left pass. In-place so O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def replaceElements(self, arr):",
      "        n = len(arr)",
      "        right_max = -1",
      "        for i in range(n-1, -1, -1):",
      "            cur = arr[i]",
      "            arr[i] = right_max",
      "            right_max = max(right_max, cur)",
      "        return arr",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int[] ReplaceElements(int[] arr) {",
      "        int n = arr.Length;",
      "        int rightMax = -1;",
      "        for (int i = n - 1; i >= 0; i--) {",
      "            int cur = arr[i];",
      "            arr[i] = rightMax;",
      "            rightMax = Math.Max(rightMax, cur);",
      "        }",
      "        return arr;",
      "    }",
      "}",
    ],
    builder: buildSteps1299,
  },
  941: {
    id: 941,
    difficulty: "easy",
    slug: "valid-mountain-array",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Valid Mountain Array", en: "Valid Mountain Array" },
    titleVi: { vi: "Mảng núi hợp lệ", en: "Check if array forms a mountain" },
    statement: {
      vi: "Cho mảng arr. Trả về True nếu nó là mảng núi: tăng nghiêm ngặt tới một đỉnh, rồi giảm nghiêm ngặt. Cần ít nhất 3 phần tử.",
      en: "Given an array arr, return True if it is a valid mountain array: strictly increasing to a peak, then strictly decreasing. Needs at least 3 elements.",
    },
    defaultInput: [0, 3, 2, 1],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần từ trái qua đỉnh rồi xuống. O(1) bộ nhớ.",
        en: "Single pass: climb up then descend. O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def validMountainArray(self, arr):",
      "        n = len(arr)",
      "        if n < 3: return False",
      "        i = 0",
      "        while i+1 < n and arr[i] < arr[i+1]:",
      "            i += 1",
      "        if i == 0 or i == n-1: return False",
      "        while i+1 < n and arr[i] > arr[i+1]:",
      "            i += 1",
      "        return i == n - 1",
    ],
    builder: buildSteps941,
  },
  1295: {
    id: 1295,
    difficulty: "easy",
    slug: "find-numbers-with-even-number-of-digits",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Find Numbers with Even Number of Digits", en: "Find Numbers with Even Number of Digits" },
    titleVi: { vi: "Đếm số có chữ số chẵn", en: "Count numbers with even digit count" },
    statement: {
      vi: "Cho mảng nums chứa các số nguyên. Trả về số lượng phần tử có số lượng chữ số chẵn.",
      en: "Given an array nums of integers, return how many of them contain an even number of digits.",
    },
    defaultInput: [12, 345, 2, 6, 7896],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần, đếm chữ số bằng log hoặc chuỗi O(1). Tổng O(n).",
        en: "Single pass, digit count via log or string is O(1). Total O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def findNumbers(self, nums):",
      "        count = 0",
      "        for num in nums:",
      "            if len(str(num)) % 2 == 0:",
      "                count += 1",
      "        return count",
    ],
    builder: buildSteps1295,
  },
  1275: {
    id: 1275,
    difficulty: "easy",
    slug: "find-winner-on-a-tic-tac-toe-game",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [twoDArrayTag],
    title: { vi: "Find Winner on a Tic Tac Toe Game", en: "Find Winner on a Tic Tac Toe Game" },
    titleVi: { vi: "Tìm người thắng Tic-Tac-Toe", en: "Find Tic-Tac-Toe winner" },
    statement: {
      vi:
        "Cho danh sách nước đi trên bàn cờ 3x3. Nước đi lẻ là của A, nước chẵn là của B. " +
        "Trả về 'A' nếu A thắng, 'B' nếu B thắng, 'Draw' nếu hòa (hết ô), hoặc 'Pending' nếu chưa kết thúc.",
      en:
        "Given a list of moves on a 3x3 board. Odd moves belong to A, even moves to B. " +
        "Return 'A' if A wins, 'B' if B wins, 'Draw' if it's a draw (all cells filled), or 'Pending' if game is not over.",
    },
    defaultInput: "0-0,2-0,1-1,2-1,2-2",
    inputKind: "string",
    inputLabel: { vi: "Nước đi (row-col, cách bởi dấu phẩy)", en: "Moves (row-col, comma separated)" },
    extraParams: [],
    complexity: {
      time: "O(M)",
      space: "O(1)",
      note: {
        vi: "Duyệt M nước đi, mỗi nước kiểm tra thắng O(1) (bàn cố định 3×3). Bộ nhớ O(1) cho bàn 3×3.",
        en: "Iterate M moves, each check for win is O(1) (fixed 3×3 board). Memory O(1) for the 3×3 board.",
      },
    },
    code: [
      "class Solution:",
      "    def tictactoe(self, moves):",
      "        board = [['' for _ in range(3)] for _ in range(3)]",
      "        for i, (r, c) in enumerate(moves):",
      "            board[r][c] = 'A' if i % 2 == 0 else 'B'",
      "        # Check rows, cols, diagonals",
      "        for player in ['A', 'B']:",
      "            for i in range(3):",
      "                if all(board[i][j]==player for j in range(3)):",
      "                    return player",
      "                if all(board[j][i]==player for j in range(3)):",
      "                    return player",
      "            if all(board[i][i]==player for i in range(3)):",
      "                return player",
      "            if all(board[i][2-i]==player for i in range(3)):",
      "                return player",
      "        return 'Draw' if len(moves)==9 else 'Pending'",
    ],
    builder: buildSteps1275,
  },
  1260: {
    id: 1260,
    difficulty: "easy",
    slug: "shift-2d-grid",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [twoDArrayTag],
    title: { vi: "Shift 2D Grid", en: "Shift 2D Grid" },
    titleVi: { vi: "Dịch grid 2 chiều", en: "Shift a 2D grid" },
    statement: {
      vi: "Cho grid m x n và số nguyên k. Mỗi lần shift, mọi phần tử dịch sang phải một ô; phần tử cuối hàng sang đầu hàng kế tiếp và phần tử cuối grid quay về ô (0,0). Trả về grid sau k lần shift.",
      en: "Given an m x n grid and integer k, shift every element right by one per operation. Row endings move to the next row, and the final cell wraps to (0,0). Return the grid after k shifts.",
    },
    defaultInput: "1,2,3;4,5,6;7,8,9",
    inputKind: "string",
    inputLabel: {
      vi: "Grid (phẩy ngăn cột, chấm phẩy ngăn hàng)",
      en: "Grid (commas separate columns, semicolons separate rows)",
    },
    extraParams: [
      { key: "k", label: { vi: "Số lần shift k", en: "Shift count k" }, default: 1, min: 0 },
      {
        key: "approach",
        label: { vi: "Chọn cách visualize", en: "Visualization approach" },
        type: "select",
        default: 1,
        options: [
          { value: 1, label: { vi: "Cách 1: Ánh xạ trực tiếp", en: "Approach 1: Direct mapping" } },
          { value: 2, label: { vi: "Cách 2: Flatten rồi shift", en: "Approach 2: Flatten then shift" } },
        ],
      },
    ],
    complexity: {
      time: "O(m*n)",
      space: "O(m*n)",
      note: {
        vi: "Mỗi ô được đọc và ghi đúng một lần. Grid kết quả chứa m*n phần tử.",
        en: "Each cell is read and written exactly once. The result grid stores m*n elements.",
      },
    },
    approach: [
      { vi: "Cách 1 ánh xạ trực tiếp mỗi tọa độ cũ sang tọa độ mới bằng index phẳng.", en: "Approach 1 maps every old coordinate directly to a new coordinate through a flat index." },
      { vi: "Cách 2 trải grid thành one_arr, dịch sang new_arr, rồi ghi new_arr trở lại grid.", en: "Approach 2 flattens grid into one_arr, shifts into new_arr, then writes new_arr back to grid." },
      { vi: "Cả hai cách dùng modulo để phần tử vượt cuối quay lại đầu.", en: "Both approaches use modulo to wrap positions past the end back to the start." },
    ],
    code: [
      "class Solution:",
      "    def shiftGrid(self, grid: List[List[int]], k: int) -> List[List[int]]:",
      "        m, n = len(grid), len(grid[0])",
      "        result = [[0] * n for _ in range(m)]",
      "        for r in range(m):",
      "            for c in range(n):",
      "                old_pos = r * n + c",
      "                new_pos = (old_pos + k) % (m * n)",
      "                new_r, new_c = divmod(new_pos, n)",
      "                result[new_r][new_c] = grid[r][c]",
      "        return result",
    ],
    code2: [
      "class Solution:",
      "    def shiftGrid(self, grid: List[List[int]], k: int) -> List[List[int]]:",
      "        n_rows = len(grid)",
      "        n_cols = len(grid[0])",
      "",
      "        size = n_rows * n_cols",
      "",
      "        one_arr = []",
      "        new_arr = [0] * size",
      "",
      "        for row in grid:",
      "            for x in row:",
      "                one_arr.append(x)",
      "",
      "        for i in range(size):",
      "            new_index = (i + k) % size",
      "            new_arr[new_index] = one_arr[i]",
      "",
      "        for i in range(n_rows):",
      "            for j in range(n_cols):",
      "                grid[i][j] = new_arr[i * n_cols + j]",
      "",
      "        return grid",
    ],
    codeLabel: { vi: "Cách 1: Ánh xạ trực tiếp", en: "Approach 1: Direct mapping" },
    code2Label: { vi: "Cách 2: Flatten rồi shift", en: "Approach 2: Flatten then shift" },
    builder: buildSteps1260,
  },
};

Object.assign(module.exports, {
  422: {
    id: 422, difficulty: "easy", slug: "valid-word-square",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Valid Word Square", en: "Valid Word Square" }, titleVi: { vi: "Kiểm tra word square hợp lệ", en: "Check whether a word square is valid" },
    statement: { vi: "Cho các từ theo từng hàng. Word square hợp lệ nếu ký tự tại words[r][c] luôn bằng words[c][r]. Nhập các từ cách nhau dấu phẩy.", en: "Given words as rows, a word square is valid when words[r][c] always equals words[c][r]. Enter comma-separated words." },
    defaultInput: "ball,area,lead,lady", inputKind: "string", inputLabel: { vi: "words (cách nhau dấu phẩy)", en: "words (comma separated)" }, extraParams: [],
    approach: [{ vi: "Đặt các từ thành lưới ký tự.", en: "Place the words in a character grid." }, { vi: "So sánh từng ô với phần tử đối xứng qua đường chéo chính.", en: "Compare every cell with its mirror across the main diagonal." }],
    complexity: { time: "O(L)", space: "O(1)", note: { vi: "L là tổng số ký tự trong các từ.", en: "L is the total number of characters." } },
    code: ["class Solution:", "    def validWordSquare(self, words):", "        for r, word in enumerate(words):", "            for c, ch in enumerate(word):", "                if c >= len(words) or r >= len(words[c]):", "                    return False", "                if ch != words[c][r]:", "                    return False", "        return True"], builder: buildSteps422,
  },
  566: {
    id: 566, difficulty: "easy", slug: "reshape-the-matrix",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Reshape the Matrix", en: "Reshape the Matrix" }, titleVi: { vi: "Đổi hình dạng ma trận", en: "Change a matrix's shape" },
    statement: { vi: "Đổi mat thành ma trận r×c nhưng giữ nguyên thứ tự row-major. Nếu số ô không khớp, trả về mat ban đầu.", en: "Reshape mat into r×c while preserving row-major order. Return mat unchanged when the cell counts differ." },
    defaultInput: "1,2;3,4", inputKind: "string", inputLabel: { vi: "mat (hàng cách ;)", en: "mat (rows separated by ;)" }, extraParams: [{ key: "r", label: { vi: "r (hàng mới)", en: "r (new rows)" }, default: 1, min: 1 }, { key: "c", label: { vi: "c (cột mới)", en: "c (new columns)" }, default: 4, min: 1 }],
    approach: [{ vi: "Kiểm tra tổng số ô có bằng r×c không.", en: "Check whether the total cell count equals r×c." }, { vi: "Dùng chỉ số phẳng row-major để ánh xạ ô cũ sang ô mới.", en: "Use a row-major flat index to map each old cell to its new cell." }],
    complexity: { time: "O(m·n)", space: "O(r·c)", note: { vi: "Mỗi phần tử được ghi một lần vào ma trận kết quả.", en: "Each value is written once to the result matrix." } },
    code: ["class Solution:", "    def matrixReshape(self, mat, r, c):", "        m, n = len(mat), len(mat[0])", "        if m * n != r * c:", "            return mat", "        result = [[0] * c for _ in range(r)]", "        for index in range(m * n):", "            result[index // c][index % c] = mat[index // n][index % n]", "        return result"], builder: buildSteps566,
  },
  766: {
    id: 766, difficulty: "easy", slug: "toeplitz-matrix",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Toeplitz Matrix", en: "Toeplitz Matrix" }, titleVi: { vi: "Kiểm tra ma trận Toeplitz", en: "Check a Toeplitz matrix" },
    statement: { vi: "Ma trận Toeplitz có mọi đường chéo từ trái-trên xuống phải-dưới cùng một giá trị.", en: "A Toeplitz matrix has one constant value along every top-left to bottom-right diagonal." },
    defaultInput: "1,2,3,4;5,1,2,3;9,5,1,2", inputKind: "string", inputLabel: { vi: "matrix (hàng cách ;)", en: "matrix (rows separated by ;)" }, extraParams: [],
    approach: [{ vi: "Bỏ qua hàng và cột đầu tiên.", en: "Skip the first row and first column." }, { vi: "Mỗi matrix[r][c] phải bằng matrix[r−1][c−1].", en: "Every matrix[r][c] must equal matrix[r−1][c−1]." }],
    complexity: { time: "O(m·n)", space: "O(1)", note: { vi: "So sánh từng ô với hàng xóm trên-trái.", en: "Compare each cell with its top-left neighbor." } },
    code: ["class Solution:", "    def isToeplitzMatrix(self, matrix):", "        for r in range(1, len(matrix)):", "            for c in range(1, len(matrix[0])):", "                if matrix[r][c] != matrix[r-1][c-1]:", "                    return False", "        return True"], builder: buildSteps766,
  },
  832: {
    id: 832, difficulty: "easy", slug: "flipping-an-image",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Flipping an Image", en: "Flipping an Image" }, titleVi: { vi: "Lật ngang và đảo bit ảnh", en: "Reverse rows and invert image bits" },
    statement: { vi: "Lật ngang từng hàng của ảnh nhị phân, sau đó đảo mỗi bit 0↔1.", en: "Reverse each row of a binary image, then invert every bit 0↔1." },
    defaultInput: "1,1,0;1,0,1;0,0,0", inputKind: "string", inputLabel: { vi: "image (0/1; hàng cách ;)", en: "image (0/1; rows separated by ;)" }, extraParams: [],
    approach: [{ vi: "Phần tử ở cột c được chuyển tới cột n−1−c.", en: "A value at column c moves to n−1−c." }, { vi: "Dùng XOR 1 để đảo bit: 0^1=1, 1^1=0.", en: "Use XOR 1 to invert: 0^1=1, 1^1=0." }],
    complexity: { time: "O(m·n)", space: "O(m·n)", note: { vi: "Visualizer dựng ma trận kết quả riêng để từng bước dễ thấy.", en: "The visualizer uses a separate result matrix so each step is visible." } },
    code: ["class Solution:", "    def flipAndInvertImage(self, image):", "        for row in image:", "            row.reverse()", "            for c in range(len(row)):", "                row[c] ^= 1", "        return image"], builder: buildSteps832,
  },
  867: {
    id: 867, difficulty: "easy", slug: "transpose-matrix",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Transpose Matrix", en: "Transpose Matrix" }, titleVi: { vi: "Chuyển vị ma trận", en: "Transpose a matrix" },
    statement: { vi: "Trả về transpose của matrix: matrix[r][c] trở thành result[c][r].", en: "Return the transpose: matrix[r][c] becomes result[c][r]." },
    defaultInput: "1,2,3;4,5,6", inputKind: "string", inputLabel: { vi: "matrix (hàng cách ;)", en: "matrix (rows separated by ;)" }, extraParams: [],
    approach: [{ vi: "Tạo ma trận kết quả có số hàng/cột hoán đổi.", en: "Create a result whose row and column counts are swapped." }, { vi: "Ghi từng phần tử (r,c) vào (c,r).", en: "Write every element from (r,c) into (c,r)." }],
    complexity: { time: "O(m·n)", space: "O(m·n)", note: { vi: "Mỗi ô được sao chép một lần.", en: "Every cell is copied once." } },
    code: ["class Solution:", "    def transpose(self, matrix):", "        rows = len(matrix)", "        cols = len(matrix[0])", "        result = [[0] * rows for _ in range(cols)]", "        for r in range(rows):", "            for c in range(cols):", "                result[c][r] = matrix[r][c]", "        return result"], builder: buildSteps867,
  },
  1337: {
    id: 1337, difficulty: "easy", slug: "the-k-weakest-rows-in-a-matrix",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "The K Weakest Rows in a Matrix", en: "The K Weakest Rows in a Matrix" }, titleVi: { vi: "K hàng yếu nhất trong ma trận", en: "Find the K weakest matrix rows" },
    statement: { vi: "1 là soldier và 0 là civilian. Hàng yếu hơn có ít soldier hơn; hòa thì chỉ số hàng nhỏ hơn đứng trước.", en: "1 is a soldier and 0 a civilian. Fewer soldiers means weaker; ties use the smaller row index." },
    defaultInput: "1,1,0,0,0;1,1,1,1,0;1,0,0,0,0;1,1,0,0,0;1,1,1,1,1", inputKind: "string", inputLabel: { vi: "mat (hàng cách ;)", en: "mat (rows separated by ;)" }, extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 3, min: 1 }],
    approach: [{ vi: "Đếm soldier (tổng các bit) của từng hàng.", en: "Count soldiers (the row's bit sum) in each row." }, { vi: "Sắp xếp cặp (soldiers, rowIndex), rồi lấy k chỉ số đầu.", en: "Sort (soldiers, rowIndex) pairs and take the first k indexes." }],
    complexity: { time: "O(m·n + m log m)", space: "O(m)", note: { vi: "Mảng pair lưu strength của từng hàng.", en: "A pair array stores every row's strength." } },
    code: ["class Solution:", "    def kWeakestRows(self, mat, k):", "        strength = []", "        for r, row in enumerate(mat):", "            strength.append((sum(row), r))", "        strength.sort()", "        return [row for _, row in strength[:k]]"], builder: buildSteps1337,
  },
  1351: {
    id: 1351, difficulty: "easy", slug: "count-negative-numbers-in-a-sorted-matrix",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Count Negative Numbers in a Sorted Matrix", en: "Count Negative Numbers in a Sorted Matrix" }, titleVi: { vi: "Đếm số âm trong ma trận đã sắp xếp", en: "Count negatives in a sorted matrix" },
    statement: { vi: "Mỗi hàng và cột đều giảm dần. Đếm số phần tử âm.", en: "Every row and column is non-increasing. Count negative entries." },
    defaultInput: "4,3,2,-1;3,2,1,-1;1,1,-1,-2;-1,-1,-2,-3", inputKind: "string", inputLabel: { vi: "grid (hàng cách ;)", en: "grid (rows separated by ;)" }, extraParams: [],
    approach: [{ vi: "Bắt đầu ở góc phải-trên.", en: "Start from the top-right corner." }, { vi: "Nếu âm, cộng mọi ô phía dưới cùng cột rồi đi trái; nếu không âm, đi xuống.", en: "If negative, count all cells below in that column then move left; otherwise move down." }],
    complexity: { time: "O(m+n)", space: "O(1)", note: { vi: "Con trỏ chỉ đi xuống hoặc sang trái.", en: "The pointer only moves down or left." } },
    code: ["class Solution:", "    def countNegatives(self, grid):", "        r, c = 0, len(grid[0]) - 1", "        count = 0", "        while r < len(grid) and c >= 0:", "            if grid[r][c] < 0:", "                count += len(grid) - r", "                c -= 1", "            else:", "                r += 1", "        return count"], builder: buildSteps1351,
  },
  1886: {
    id: 1886, difficulty: "easy", slug: "determine-whether-matrix-can-be-obtained-by-rotation",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Determine Whether Matrix Can Be Obtained By Rotation", en: "Determine Whether Matrix Can Be Obtained By Rotation" }, titleVi: { vi: "Kiểm tra target bằng xoay ma trận", en: "Check whether rotation reaches target" },
    statement: { vi: "Kiểm tra mat sau 0°, 90°, 180° hoặc 270° có thể bằng target không.", en: "Check whether mat can equal target after 0°, 90°, 180°, or 270° rotation." },
    defaultInput: "0,1;1,0", inputKind: "string", inputLabel: { vi: "mat (vuông; hàng cách ;)", en: "mat (square; rows separated by ;)" }, extraParams: [
      { key: "target", type: "string", label: { vi: "target (hàng cách ;)", en: "target (rows separated by ;)" }, default: "1,0;0,1" },
      { key: "approach", type: "select", label: { vi: "Cách giải", en: "Approach" }, default: "1", options: [
        { value: "1", label: { vi: "Cách 1: xoay ma trận rồi so sánh", en: "Approach 1: rotate then compare" } },
        { value: "2", label: { vi: "Cách 2: đối chiếu tọa độ trực tiếp", en: "Approach 2: direct coordinate mapping" } },
      ] },
    ],
    approach: [
      { vi: "Cách 1: so sánh mat với target ở 0°, rồi xoay mat 90° tối đa ba lần.", en: "Approach 1: compare mat with target at 0°, then rotate mat 90° up to three times." },
      { vi: "Cách 2: giữ mat cố định và đối chiếu mat[i][j] với tọa độ tương ứng trên target cho 90°, 180°, 270° và 0°.", en: "Approach 2: keep mat fixed and compare mat[i][j] with the corresponding target coordinate for 90°, 180°, 270°, and 0°." },
    ],
    complexity: { time: "O(n²)", space: "O(n²) / O(1)", note: { vi: "Cả hai cách tối đa kiểm tra bốn hướng xoay. Cách 1 tạo ma trận xoay mới; Cách 2 chỉ dùng vài biến và ánh xạ chỉ số.", en: "Both approaches check at most four rotations. Approach 1 creates rotated matrices; Approach 2 uses only a few variables and index mappings." } },
    codeLabel: { vi: "Cách 1: xoay ma trận rồi so sánh", en: "Approach 1: rotate then compare" },
    code: ["class Solution:", "    def findRotation(self, mat, target):", "        def rotate(grid):", "            return [list(row) for row in zip(*grid[::-1])]", "        for _ in range(4):", "            if mat == target:", "                return True", "            mat = rotate(mat)", "        return False"],
    code2Label: { vi: "Cách 2: đối chiếu tọa độ trực tiếp", en: "Approach 2: direct coordinate mapping" },
    code2: [
      "class Solution:",
      "    def findRotation(self, mat, target):",
      "        n = len(mat)",
      "",
      "        flag = True",
      "        for i in range(n):",
      "            for j in range(n):",
      "                if mat[i][j] != target[j][n - 1 - i]:",
      "                    flag = False",
      "                    break",
      "",
      "        if flag:",
      "            return True",
      "",
      "        flag = True",
      "        for i in range(n):",
      "            for j in range(n):",
      "                if mat[i][j] != target[n - 1 - i][n - 1 - j]:",
      "                    flag = False",
      "                    break",
      "",
      "        if flag:",
      "            return True",
      "",
      "        flag = True",
      "        for i in range(n):",
      "            for j in range(n):",
      "                if mat[i][j] != target[n - 1 - j][i]:",
      "                    flag = False",
      "                    break",
      "",
      "        if flag:",
      "            return True",
      "",
      "        flag = True",
      "        for i in range(n):",
      "            for j in range(n):",
      "                if mat[i][j] != target[i][j]:",
      "                    flag = False",
      "                    break",
      "",
      "        if flag:",
      "            return True",
      "",
      "        return False",
    ],
    builder: buildSteps1886,
    builder2: buildSteps1886Direct,
  },
  2022: {
    id: 2022, difficulty: "easy", slug: "convert-1d-array-into-2d-array",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Convert 1D Array Into 2D Array", en: "Convert 1D Array Into 2D Array" }, titleVi: { vi: "Chuyển mảng 1D thành 2D", en: "Convert a 1D array into 2D" },
    statement: { vi: "Tạo mảng m×n từ original theo thứ tự hàng trước. Nếu original không đủ đúng m×n phần tử, trả về [].", en: "Build an m×n array from original in row-major order. Return [] unless original has exactly m×n values." },
    defaultInput: [1, 2, 3, 4], inputKind: "integer", inputLabel: { vi: "original", en: "original" }, extraParams: [{ key: "m", label: { vi: "m (hàng)", en: "m (rows)" }, default: 2, min: 1 }, { key: "n", label: { vi: "n (cột)", en: "n (columns)" }, default: 2, min: 1 }],
    approach: [{ vi: "Kiểm tra len(original) == m×n.", en: "Check len(original) == m×n." }, { vi: "Với index i: row=i//n và col=i%n.", en: "For index i: row=i//n and col=i%n." }],
    complexity: { time: "O(m·n)", space: "O(m·n)", note: { vi: "Mỗi giá trị original được đặt một lần.", en: "Each original value is placed once." } },
    code: ["class Solution:", "    def construct2DArray(self, original, m, n):", "        if len(original) != m * n:", "            return []", "        result = [[0] * n for _ in range(m)]", "        for index, value in enumerate(original):", "            result[index // n][index % n] = value", "        return result"], builder: buildSteps2022,
  },
});

// ─── 689: Maximum Sum of 3 Non-Overlapping Subarrays ───
function buildSteps689(input, params = {}) {
  const nums = (Array.isArray(input) ? input : String(input).split(",")).map(Number);
  const k = Number(params.k || 2);
  if (!Number.isInteger(k) || k < 1 || nums.length < 3 * k || nums.some((value) => !Number.isFinite(value))) {
    throw new Error("Use finite nums with length at least 3 * k");
  }
  if (nums.length > 24) throw new Error("Visualization supports at most 24 numbers");
  const n = nums.length;
  const windowSums = Array.from({ length: n - k + 1 }, (_, start) => nums.slice(start, start + k).reduce((sum, value) => sum + value, 0));
  const left = new Array(windowSums.length);
  const right = new Array(windowSums.length);
  const steps = [];
  let answer = null;

  function snapshot({ title, note, line, phase, active = -1, middle = -1, candidate = null, final = false }) {
    steps.push({
      title, note, codeLines: [line], arr: [...nums], highlight: [], mark: [], final,
      vars: [
        { name: "k", value: k },
        { name: "window sums", value: `[${windowSums.join(", ")}]` },
        { name: "best", value: answer ? `[${answer.join(", ")}]` : "-" },
      ],
      subarray689View: {
        nums: [...nums], k, windowSums: [...windowSums], left: left.map((value) => value ?? null), right: right.map((value) => value ?? null),
        active, middle, candidate: candidate ? { ...candidate } : null, answer: answer ? [...answer] : null, phase,
      },
    });
  }

  snapshot({ title: { vi: `Tạo ${windowSums.length} cửa sổ dài k=${k}`, en: `Create ${windowSums.length} windows of length k=${k}` }, note: { vi: "Mỗi windowSums[i] là tổng nums[i..i+k-1]. Ba window không overlap tương đương chọn ba start cách nhau ít nhất k.", en: "windowSums[i] is nums[i..i+k-1]. Three non-overlapping windows have starts at least k apart." }, line: 4, phase: "windows" });

  let best = 0;
  for (let index = 0; index < windowSums.length; index++) {
    if (windowSums[index] > windowSums[best]) best = index;
    left[index] = best;
    snapshot({ title: { vi: `left[${index}] = ${best}`, en: `left[${index}] = ${best}` }, note: { vi: `Trong các window từ 0..${index}, start ${best} có tổng lớn nhất ${windowSums[best]}.`, en: `Among windows 0..${index}, start ${best} has the largest sum ${windowSums[best]}.` }, line: 8, phase: "left", active: index });
  }

  best = windowSums.length - 1;
  for (let index = windowSums.length - 1; index >= 0; index--) {
    if (windowSums[index] >= windowSums[best]) best = index;
    right[index] = best;
    snapshot({ title: { vi: `right[${index}] = ${best}`, en: `right[${index}] = ${best}` }, note: { vi: `Trong các window từ ${index}..cuối, start ${best} là lựa chọn tốt nhất (giữ start nhỏ hơn khi hòa).`, en: `Among windows ${index}..end, start ${best} is best (keep the earlier start on ties).` }, line: 11, phase: "right", active: index });
  }

  let bestTotal = -Infinity;
  for (let middle = k; middle <= windowSums.length - k - 1; middle++) {
    const first = left[middle - k];
    const third = right[middle + k];
    const total = windowSums[first] + windowSums[middle] + windowSums[third];
    const candidate = { first, middle, third, total };
    if (total > bestTotal) {
      bestTotal = total;
      answer = [first, middle, third];
    }
    snapshot({ title: { vi: `Thử middle=${middle}: tổng = ${total}`, en: `Try middle=${middle}: total = ${total}` }, note: total === bestTotal && answer && answer[1] === middle ? { vi: `left[${middle - k}]=${first}, middle=${middle}, right[${middle + k}]=${third} tạo kỷ lục ${total}.`, en: `left[${middle - k}]=${first}, middle=${middle}, right[${middle + k}]=${third} make the new best ${total}.` } : { vi: `Tổng ${total} không vượt best ${bestTotal}; giữ đáp án cũ.`, en: `Total ${total} does not beat best ${bestTotal}; keep the earlier answer.` }, line: 15, phase: "combine", active: middle, middle, candidate });
  }
  snapshot({ title: { vi: `Kết quả [${answer.join(", ")}]`, en: `Result [${answer.join(", ")}]` }, note: { vi: `Ba subarray bắt đầu tại ${answer.join(", ")} có tổng lớn nhất ${bestTotal}.`, en: `The subarrays starting at ${answer.join(", ")} have the maximum total ${bestTotal}.` }, line: 16, phase: "done", final: true });
  return { original: [...nums], answer, steps };
}

Object.assign(module.exports, {
  689: {
    id: 689, difficulty: "hard", slug: "maximum-sum-of-3-non-overlapping-subarrays",
    category: { key: "sliding-window", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Maximum Sum of 3 Non-Overlapping Subarrays", en: "Maximum Sum of 3 Non-Overlapping Subarrays" },
    titleVi: { vi: "Ba subarray không chồng nhau có tổng lớn nhất", en: "Best three non-overlapping subarrays" },
    statement: { vi: "Chọn ba subarray độ dài k, không chồng nhau, có tổng lớn nhất. Nếu hòa, trả về bộ chỉ số từ điển nhỏ nhất.", en: "Choose three non-overlapping subarrays of length k with maximum sum. On ties, return the lexicographically smallest starts." },
    defaultInput: [1, 2, 1, 2, 6, 7, 5, 1], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" },
    extraParams: [{ key: "k", label: { vi: "k (độ dài mỗi subarray)", en: "k (length of each subarray)" }, default: 2, min: 1 }],
    approach: [{ vi: "Tính tổng cho mọi cửa sổ độ dài k.", en: "Compute every length-k window sum." }, { vi: "left[i] và right[i] lưu start tốt nhất ở hai phía của i.", en: "left[i] and right[i] store the best start on either side of i." }, { vi: "Cố định cửa sổ giữa rồi ghép với lựa chọn tối ưu bên trái/phải.", en: "Fix the middle window, then combine it with optimal left/right choices." }],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Ba lượt tuyến tính trên danh sách window.", en: "Three linear passes over the windows." } },
    code: ["class Solution:", "    def maxSumOfThreeSubarrays(self, nums, k):", "        n = len(nums)", "        sums = [sum(nums[i:i+k]) for i in range(n-k+1)]", "        left = [0] * len(sums)", "        best = 0", "        for i in range(len(sums)):", "            if sums[i] > sums[best]: best = i", "            left[i] = best", "        right = [0] * len(sums); best = len(sums)-1", "        for i in range(len(sums)-1, -1, -1):", "            if sums[i] >= sums[best]: best = i", "            right[i] = best", "        answer = None", "        for mid in range(k, len(sums)-k):", "            candidate = [left[mid-k], mid, right[mid+k]]", "            if answer is None or sum(sums[i] for i in candidate) > sum(sums[i] for i in answer): answer = candidate", "        return answer"],
    builder: buildSteps689,
  },
});

/** LeetCode 3718: Smallest Missing Multiple of K. */
function buildSteps3718(nums, params) {
  const arr = Array.isArray(nums) ? nums.map(Number) : [];
  const k = Math.max(1, Number(params && params.k) || 1);
  const seen = new Set();
  const checked = [];
  const steps = [];
  const maxChecks = arr.length + 1;

  function push(opts) {
    const candidate = Number.isFinite(opts.candidate) ? opts.candidate : null;
    const matchingIndices = candidate === null
      ? []
      : arr.map((value, index) => (value === candidate ? index : -1)).filter((index) => index >= 0);
    steps.push({
      title: opts.title,
      arr: [...arr],
      sub: arr.map((value) => value % k === 0 ? `${value / k}×k` : "not multiple"),
      highlight: Number.isInteger(opts.currentIndex) ? [opts.currentIndex] : matchingIndices,
      mark: arr.map((value, index) => value % k === 0 && seen.has(value) ? index : -1).filter((index) => index >= 0),
      final: Boolean(opts.final),
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      missing3718View: {
        approach: 1,
        phase: opts.phase || "init",
        nums: [...arr],
        k,
        seen: [...seen].sort((a, b) => a - b),
        currentIndex: Number.isInteger(opts.currentIndex) ? opts.currentIndex : null,
        insertion: opts.insertion || null,
        candidate,
        multiplier: Number.isInteger(opts.multiplier) ? opts.multiplier : null,
        present: typeof opts.present === "boolean" ? opts.present : null,
        checked: checked.map((item) => ({ ...item })),
        setProgress: seen.size,
        inputProgress: Number(opts.inputProgress) || 0,
        maxChecks,
        upperBound: maxChecks * k,
        answer: opts.answer ?? null,
      },
    });
  }

  push({
    phase: "init",
    title: { vi: "Khởi tạo hash set rỗng", en: "Initialize an empty hash set" },
    codeLines: [4],
    vars: [{ name: "seen", value: "{}" }, { name: "k", value: k }],
    note: { vi: "Đưa nums vào Set để mỗi phép kiểm tra candidate có thời gian O(1) trung bình.", en: "Put nums into a Set so each candidate membership check takes O(1) average time." },
  });

  for (let index = 0; index < arr.length; index++) {
    const value = arr[index];
    const duplicate = seen.has(value);
    seen.add(value);
    push({
      phase: "build-set",
      title: duplicate
        ? { vi: `nums[${index}] = ${value} đã có trong Set`, en: `nums[${index}] = ${value} is already in the Set` }
        : { vi: `Thêm nums[${index}] = ${value} vào Set`, en: `Add nums[${index}] = ${value} to the Set` },
      currentIndex: index,
      insertion: { value, duplicate },
      inputProgress: index + 1,
      codeLines: [4],
      vars: [{ name: "value", value }, { name: "duplicate?", value: duplicate }, { name: "seen size", value: seen.size }],
      note: duplicate
        ? { vi: "Set chỉ giữ một bản sao; duplicate không làm thay đổi việc kiểm tra tồn tại.", en: "A Set keeps one copy; duplicates do not change membership checks." }
        : { vi: `${value} được thêm vào Set.`, en: `${value} is added to the Set.` },
    });
  }

  push({
    phase: "enumerate",
    title: { vi: `Bắt đầu từ bội dương đầu tiên: 1 × ${k} = ${k}`, en: `Start at the first positive multiple: 1 × ${k} = ${k}` },
    candidate: k,
    multiplier: 1,
    inputProgress: arr.length,
    codeLines: [5],
    vars: [{ name: "multiplier", value: 1 }, { name: "candidate", value: k }],
    note: { vi: "Bắt đầu multiplier = 1, không phải 0, vì đề bài yêu cầu bội dương.", en: "Start multiplier at 1, not 0, because the problem asks for a positive multiple." },
  });

  for (let multiplier = 1; multiplier <= maxChecks; multiplier++) {
    const candidate = multiplier * k;
    const present = seen.has(candidate);
    checked.push({ multiplier, value: candidate, present });
    if (!present) {
      push({
        phase: "missing",
        title: { vi: `${candidate} không có trong Set → đáp án`, en: `${candidate} is absent from the Set → answer` },
        candidate,
        multiplier,
        present,
        inputProgress: arr.length,
        final: true,
        answer: candidate,
        codeLines: [6, 8],
        vars: [{ name: "candidate", value: candidate }, { name: "candidate in seen?", value: false }, { name: "answer", value: candidate }],
        note: { vi: `${candidate} là bội đầu tiên bị thiếu. Vì mọi bội nhỏ hơn đã được kiểm tra theo thứ tự tăng dần, đây chắc chắn là đáp án nhỏ nhất.`, en: `${candidate} is the first missing multiple. Every smaller multiple was checked in increasing order, so this is guaranteed to be the smallest answer.` },
      });
      return { original: [...arr], answer: candidate, steps };
    }

    push({
      phase: "present",
      title: { vi: `${candidate} có trong Set → thử bội tiếp theo`, en: `${candidate} is in the Set → try the next multiple` },
      candidate,
      multiplier,
      present,
      inputProgress: arr.length,
      codeLines: [6, 7],
      vars: [{ name: "multiplier", value: multiplier }, { name: "candidate", value: candidate }, { name: "candidate in seen?", value: true }],
      note: { vi: `${candidate} đã xuất hiện trong nums, nên tăng multiplier từ ${multiplier} lên ${multiplier + 1}.`, en: `${candidate} appears in nums, so increment multiplier from ${multiplier} to ${multiplier + 1}.` },
    });
  }

  throw new Error("A missing multiple must exist within n + 1 checks.");
}

/** LeetCode 3718, approach 2: keep the current multiple directly in ans. */
function buildSteps3718Ans(nums, params) {
  const arr = Array.isArray(nums) ? nums.map(Number) : [];
  const k = Math.max(1, Number(params && params.k) || 1);
  const seen = new Set();
  const checked = [];
  const steps = [];
  const maxChecks = arr.length + 1;

  function push(opts) {
    const candidate = Number.isFinite(opts.candidate) ? opts.candidate : null;
    const matchingIndices = candidate === null
      ? []
      : arr.map((value, index) => (value === candidate ? index : -1)).filter((index) => index >= 0);
    steps.push({
      title: opts.title,
      arr: [...arr],
      sub: arr.map((value) => value % k === 0 ? `${value / k}×k` : "not multiple"),
      highlight: Number.isInteger(opts.currentIndex) ? [opts.currentIndex] : matchingIndices,
      mark: arr.map((value, index) => value % k === 0 && seen.has(value) ? index : -1).filter((index) => index >= 0),
      final: Boolean(opts.final),
      codeBlock: 2,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      missing3718View: {
        approach: 2,
        phase: opts.phase || "init",
        nums: [...arr],
        k,
        seen: [...seen].sort((a, b) => a - b),
        currentIndex: Number.isInteger(opts.currentIndex) ? opts.currentIndex : null,
        insertion: opts.insertion || null,
        candidate,
        multiplier: Number.isInteger(opts.multiplier) ? opts.multiplier : null,
        ansBefore: Number.isFinite(opts.ansBefore) ? opts.ansBefore : null,
        ansAfter: Number.isFinite(opts.ansAfter) ? opts.ansAfter : null,
        present: typeof opts.present === "boolean" ? opts.present : null,
        checked: checked.map((item) => ({ ...item })),
        setProgress: seen.size,
        inputProgress: Number(opts.inputProgress) || 0,
        maxChecks,
        upperBound: maxChecks * k,
        answer: opts.answer ?? null,
      },
    });
  }

  push({
    phase: "init",
    title: { vi: "Khởi tạo hash set rỗng", en: "Initialize an empty hash set" },
    codeLines: [3],
    vars: [{ name: "seen", value: "{}" }, { name: "k", value: k }],
    note: { vi: "Mô phỏng seen = set(nums) từng phần tử để thấy rõ Set loại bỏ duplicate.", en: "Build seen = set(nums) one item at a time to show how the Set removes duplicates." },
  });

  for (let index = 0; index < arr.length; index++) {
    const value = arr[index];
    const duplicate = seen.has(value);
    seen.add(value);
    push({
      phase: "build-set",
      title: duplicate
        ? { vi: `nums[${index}] = ${value} đã có trong Set`, en: `nums[${index}] = ${value} is already in the Set` }
        : { vi: `Thêm nums[${index}] = ${value} vào Set`, en: `Add nums[${index}] = ${value} to the Set` },
      currentIndex: index,
      insertion: { value, duplicate },
      inputProgress: index + 1,
      codeLines: [3],
      vars: [{ name: "value", value }, { name: "duplicate?", value: duplicate }, { name: "seen size", value: seen.size }],
      note: duplicate
        ? { vi: "Set chỉ giữ một bản sao; duplicate không làm thay đổi phép kiểm tra ans in seen.", en: "A Set keeps one copy; duplicates do not change the ans-in-seen check." }
        : { vi: `${value} được thêm vào Set.`, en: `${value} is added to the Set.` },
    });
  }

  let ans = k;
  push({
    phase: "enumerate",
    title: { vi: `Khởi tạo ans = k = ${k}`, en: `Initialize ans = k = ${k}` },
    candidate: ans,
    multiplier: 1,
    inputProgress: arr.length,
    codeLines: [4],
    vars: [{ name: "ans", value: ans }, { name: "k", value: k }],
    note: { vi: "ans luôn là candidate hiện tại và bắt đầu tại bội dương nhỏ nhất k.", en: "ans is always the current candidate and starts at the smallest positive multiple k." },
  });

  for (let multiplier = 1; multiplier <= maxChecks; multiplier++) {
    const present = seen.has(ans);
    checked.push({ multiplier, value: ans, present });
    if (!present) {
      push({
        phase: "missing",
        title: { vi: `${ans} không có trong Set → return ans`, en: `${ans} is absent from the Set → return ans` },
        candidate: ans,
        multiplier,
        present,
        inputProgress: arr.length,
        final: true,
        answer: ans,
        codeLines: [5, 7],
        vars: [{ name: "ans", value: ans }, { name: "ans in seen?", value: false }, { name: "return", value: ans }],
        note: { vi: `${ans} là bội đầu tiên làm điều kiện while sai, nên được trả về ngay.`, en: `${ans} is the first multiple that makes the while condition false, so it is returned immediately.` },
      });
      return { original: [...arr], answer: ans, steps };
    }

    push({
      phase: "present",
      title: { vi: `${ans} có trong Set → vào thân while`, en: `${ans} is in the Set → enter the while body` },
      candidate: ans,
      multiplier,
      present,
      inputProgress: arr.length,
      codeLines: [5],
      vars: [{ name: "ans", value: ans }, { name: "ans in seen?", value: true }],
      note: { vi: `Điều kiện ${ans} in seen là True, vì vậy cần nhảy sang bội kế tiếp.`, en: `${ans} in seen is True, so advance to the next multiple.` },
    });

    const previous = ans;
    ans += k;
    push({
      phase: "increment",
      title: { vi: `Cộng k: ans = ${previous} + ${k} = ${ans}`, en: `Add k: ans = ${previous} + ${k} = ${ans}` },
      candidate: ans,
      multiplier: multiplier + 1,
      ansBefore: previous,
      ansAfter: ans,
      inputProgress: arr.length,
      codeLines: [6],
      vars: [{ name: "ans before", value: previous }, { name: "k", value: k }, { name: "ans after", value: ans }],
      note: { vi: "ans += k giữ ans luôn là bội kế tiếp mà không cần biến multiplier.", en: "ans += k keeps ans at the next multiple without a separate multiplier variable." },
    });
  }

  throw new Error("A missing multiple must exist within n + 1 checks.");
}

Object.assign(module.exports, {
  3718: {
    id: 3718,
    difficulty: "easy",
    slug: "smallest-missing-multiple-of-k",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [{ key: "hash-set", vi: "Hash Set", en: "Hash Set" }],
    title: { vi: "Smallest Missing Multiple of K", en: "Smallest Missing Multiple of K" },
    titleVi: { vi: "Bội dương nhỏ nhất của k còn thiếu", en: "Smallest missing positive multiple of k" },
    statement: {
      vi: "Cho mảng số nguyên nums và số nguyên dương k. Trả về bội dương nhỏ nhất của k không xuất hiện trong nums.",
      en: "Given an integer array nums and a positive integer k, return the smallest positive multiple of k that is missing from nums.",
    },
    defaultInput: [8, 2, 3, 4, 6],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "k", label: { vi: "k", en: "k" }, type: "number", default: 2 },
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: multiplier × k", en: "Approach 1: multiplier × k" } },
          { value: "2", label: { vi: "Cách 2: ans += k", en: "Approach 2: ans += k" } },
        ],
      },
    ],
    approach: [
      { vi: "Đưa mọi phần tử của nums vào Hash Set để kiểm tra tồn tại trong O(1) trung bình.", en: "Put every nums value into a Hash Set for O(1) average membership checks." },
      { vi: "Duyệt các bội dương theo thứ tự k, 2k, 3k, ...; bội đầu tiên không nằm trong Set là đáp án.", en: "Enumerate positive multiples in order k, 2k, 3k, ...; the first one absent from the Set is the answer." },
      { vi: "Cách 1 lưu multiplier rồi tính multiplier × k. Cách 2 lưu trực tiếp candidate trong ans và nhảy bằng ans += k.", en: "Approach 1 stores a multiplier and computes multiplier × k. Approach 2 stores the candidate directly in ans and advances with ans += k." },
      { vi: "Chỉ cần tối đa n+1 lần kiểm tra: nums có n phần tử nên không thể chứa đủ n+1 bội khác nhau đầu tiên.", en: "At most n+1 checks are needed: n array elements cannot contain all of the first n+1 distinct multiples." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Tạo Set O(n), rồi kiểm tra nhiều nhất n+1 bội.", en: "Build the Set in O(n), then check at most n+1 multiples." } },
    code: [
      "class Solution:",
      "    def missingMultiple(self, nums, k):",
      "        # O(1) average membership checks",
      "        seen = set(nums)",
      "        multiplier = 1",
      "        while multiplier * k in seen:",
      "            multiplier += 1",
      "        return multiplier * k",
    ],
    code2: [
      "class Solution:",
      "    def missingMultiple(self, nums: List[int], k: int) -> int:",
      "        seen = set(nums)",
      "        ans = k",
      "        while ans in seen:",
      "            ans += k",
      "        return ans",
    ],
    codeLabel: { vi: "Cách 1: multiplier × k", en: "Approach 1: multiplier × k" },
    code2Label: { vi: "Cách 2: ans += k", en: "Approach 2: ans += k" },
    builder: buildSteps3718,
    builder2: buildSteps3718Ans,
  },
});

/**
 * LeetCode 2502: Design Memory Allocator.
 * Allocation scans left-to-right while tracking the current consecutive-free
 * streak. The first streak reaching size is the required first-fit block.
 */
function buildSteps2502(input, params) {
  const n = Array.isArray(input) && Number.isInteger(input[0]) ? input[0] : 10;
  const raw = String((params && params.operations) || "").trim();
  const operations = raw.split(/\s*[|;]\s*/).filter(Boolean).map((part) => {
    const tokens = part.replace(/[(),]/g, " ").trim().split(/\s+/);
    const name = String(tokens[0] || "").toLowerCase();
    if (name === "allocate") {
      const size = Number(tokens[1]);
      const mID = Number(tokens[2]);
      return {
        name,
        size,
        mID,
        raw: part,
        label: `allocate(${tokens[1] ?? "?"}, ${tokens[2] ?? "?"})`,
        valid: tokens.length === 3 && Number.isInteger(size) && size > 0 && Number.isInteger(mID) && mID > 0,
      };
    }
    const mID = Number(tokens[1]);
    const freeName = name === "free" || name === "freememory";
    return {
      name: freeName ? "free" : name,
      mID,
      raw: part,
      label: `freeMemory(${tokens[1] ?? "?"})`,
      valid: freeName && tokens.length === 2 && Number.isInteger(mID) && mID > 0,
    };
  });
  const valid = Number.isInteger(n) && n > 0 && n <= 30
    && operations.length > 0
    && operations.every((operation) => operation.valid);
  const memory = new Array(Math.max(1, Math.min(30, Number.isInteger(n) ? n : 10))).fill(0);
  const results = new Array(operations.length).fill(null);
  const steps = [];

  const freeRuns = () => {
    const runs = [];
    let start = -1;
    for (let i = 0; i <= memory.length; i += 1) {
      if (i < memory.length && memory[i] === 0 && start === -1) start = i;
      if ((i === memory.length || memory[i] !== 0) && start !== -1) {
        runs.push({ start, end: i - 1, length: i - start });
        start = -1;
      }
    }
    return runs;
  };

  function snapshot({
    title,
    note,
    codeLines,
    phase,
    activeOpIndex = -1,
    completedOps = 0,
    currentOperation = null,
    scanIndex = null,
    streak = 0,
    candidateRange = null,
    touched = [],
    blocker = null,
    result = null,
    final = false,
  }) {
    const step = {
      title,
      codeLines,
      allocator2502View: {
        phase,
        n: memory.length,
        memory: memory.slice(),
        operations: operations.map((operation) => operation.label),
        activeOpIndex,
        completedOps,
        results: results.slice(),
        currentOperation: currentOperation ? { ...currentOperation } : null,
        scanIndex,
        streak,
        candidateRange: candidateRange ? candidateRange.slice() : null,
        touched: touched.slice(),
        blocker,
        freeRuns: freeRuns(),
        result,
      },
      vars: [
        { name: "memory", value: `[${memory.join(", ")}]` },
        { name: "free runs", value: freeRuns().map((run) => `[${run.start}..${run.end}] len=${run.length}`).join(" | ") || "none" },
        { name: "result", value: result === null ? "pending" : result },
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  if (!valid) {
    snapshot({
      title: { vi: "Input hoặc operations không hợp lệ", en: "Invalid input or operations" },
      note: {
        vi: "n phải trong 1..30. Dùng: allocate size mID | free mID.",
        en: "n must be in 1..30. Use: allocate size mID | free mID.",
      },
      codeLines: [1],
      phase: "invalid",
      final: true,
    });
    return { original: { n, operations: raw }, answer: null, steps };
  }

  snapshot({
    title: { vi: `Khởi tạo ${n} ô nhớ đều FREE`, en: `Initialize ${n} FREE memory cells` },
    note: {
      vi: "0 nghĩa là ô trống; số dương là mID đang sở hữu ô đó. allocate luôn phải chọn block trống liên tiếp đầu tiên.",
      en: "0 means free; a positive number is the mID owning that cell. allocate must always take the first contiguous free block.",
    },
    codeLines: [1, 2, 3],
    phase: "init",
  });

  operations.forEach((operation, opIndex) => {
    if (operation.name === "allocate") {
      let streak = 0;
      let start = -1;
      snapshot({
        title: { vi: `Bắt đầu allocate(size=${operation.size}, mID=${operation.mID})`, en: `Start allocate(size=${operation.size}, mID=${operation.mID})` },
        note: {
          vi: "Quét từ địa chỉ 0. Biến free đếm độ dài chuỗi ô trống đang kết thúc tại i.",
          en: "Scan from address 0. Variable free counts the consecutive free cells ending at i.",
        },
        codeLines: [4, 5],
        phase: "allocate-start",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        currentOperation: operation,
      });

      for (let i = 0; i < memory.length; i += 1) {
        const isFree = memory[i] === 0;
        streak = isFree ? streak + 1 : 0;
        const candidateStart = streak > 0 ? i - streak + 1 : null;
        const candidateRange = candidateStart === null ? null : [candidateStart, i];
        snapshot({
          title: {
            vi: isFree ? `i=${i}: FREE → streak=${streak}` : `i=${i}: mID ${memory[i]} chặn → reset streak=0`,
            en: isFree ? `i=${i}: FREE → streak=${streak}` : `i=${i}: mID ${memory[i]} blocks → reset streak=0`,
          },
          note: {
            vi: isFree
              ? `Block trống ứng viên hiện là [${candidateStart}..${i}], dài ${streak}/${operation.size}.`
              : `Không thể đi xuyên qua ô đã cấp phát; bắt đầu tìm block mới sau index ${i}.`,
            en: isFree
              ? `The current candidate free block is [${candidateStart}..${i}], length ${streak}/${operation.size}.`
              : `An allocation cannot cross an occupied cell; start a new candidate after index ${i}.`,
          },
          codeLines: isFree ? [6, 7, 8, 11] : [6, 9, 10],
          phase: isFree && streak === operation.size ? "fit-found" : isFree ? "scan-free" : "scan-blocked",
          activeOpIndex: opIndex,
          completedOps: opIndex,
          currentOperation: operation,
          scanIndex: i,
          streak,
          candidateRange,
          blocker: isFree ? null : i,
        });
        if (streak === operation.size) {
          start = i - operation.size + 1;
          break;
        }
      }

      if (start === -1) {
        results[opIndex] = -1;
        snapshot({
          title: { vi: "Không có block đủ dài → -1", en: "No free block is long enough → -1" },
          note: {
            vi: `Có thể tổng số ô trống vẫn đủ ${operation.size}, nhưng chúng bị phân mảnh nên không tạo thành một block liên tiếp.`,
            en: `There may be at least ${operation.size} free cells in total, but fragmentation prevents one contiguous block.`,
          },
          codeLines: [15],
          phase: "allocate-fail",
          activeOpIndex: opIndex,
          completedOps: opIndex + 1,
          currentOperation: operation,
          result: -1,
        });
        return;
      }

      const range = Array.from({ length: operation.size }, (_, offset) => start + offset);
      range.forEach((index) => { memory[index] = operation.mID; });
      results[opIndex] = start;
      snapshot({
        title: { vi: `Ghi mID ${operation.mID} vào [${start}..${start + operation.size - 1}]`, en: `Write mID ${operation.mID} into [${start}..${start + operation.size - 1}]` },
        note: {
          vi: `Đây là block hợp lệ đầu tiên nên allocate trả về địa chỉ bắt đầu ${start}.`,
          en: `This is the first valid block, so allocate returns its start address ${start}.`,
        },
        codeLines: [12, 13, 14],
        phase: "allocate-write",
        activeOpIndex: opIndex,
        completedOps: opIndex + 1,
        currentOperation: operation,
        scanIndex: start + operation.size - 1,
        streak: operation.size,
        candidateRange: [start, start + operation.size - 1],
        touched: range,
        result: start,
      });
      return;
    }

    const matches = memory.map((value, index) => value === operation.mID ? index : -1).filter((index) => index >= 0);
    snapshot({
      title: { vi: `freeMemory(${operation.mID}): tìm mọi ô cùng mID`, en: `freeMemory(${operation.mID}): find every matching cell` },
      note: {
        vi: matches.length
          ? `Tìm thấy ${matches.length} ô tại index [${matches.join(", ")}]. Một mID có thể sở hữu nhiều block rời nhau.`
          : `Không có ô nào thuộc mID ${operation.mID}.`,
        en: matches.length
          ? `Found ${matches.length} cells at indices [${matches.join(", ")}]. One mID may own several separate blocks.`
          : `No cell belongs to mID ${operation.mID}.`,
      },
      codeLines: [16, 17, 18, 19],
      phase: "free-find",
      activeOpIndex: opIndex,
      completedOps: opIndex,
      currentOperation: operation,
      touched: matches,
    });
    matches.forEach((index) => { memory[index] = 0; });
    results[opIndex] = matches.length;
    snapshot({
      title: { vi: `Đặt ${matches.length} ô về FREE → ${matches.length}`, en: `Mark ${matches.length} cells FREE → ${matches.length}` },
      note: {
        vi: "Các vùng FREE kề nhau tự hợp thành một run dài hơn; freeMemory trả về số ô vừa giải phóng.",
        en: "Adjacent FREE regions naturally form a longer run; freeMemory returns the number of released cells.",
      },
      codeLines: [20, 21, 22],
      phase: "free-write",
      activeOpIndex: opIndex,
      completedOps: opIndex + 1,
      currentOperation: operation,
      touched: matches,
      result: matches.length,
    });
  });

  snapshot({
    title: { vi: "Hoàn tất mọi operation", en: "All operations complete" },
    note: {
      vi: "Mỗi allocate dùng first-fit từ trái sang phải; mỗi freeMemory xóa toàn bộ ô mang đúng mID.",
      en: "Every allocate uses left-to-right first fit; every freeMemory clears all cells carrying that mID.",
    },
    codeLines: [22],
    phase: "done",
    activeOpIndex: operations.length,
    completedOps: operations.length,
    final: true,
  });
  return { original: { n, operations: raw }, answer: results, steps };
}

Object.assign(module.exports, {
  2502: {
    id: 2502,
    difficulty: "medium",
    slug: "design-memory-allocator",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Design Memory Allocator", en: "Design Memory Allocator" },
    titleVi: { vi: "Thiết kế bộ cấp phát bộ nhớ", en: "Design a memory allocator" },
    statement: {
      vi: "Thiết kế Allocator cho n ô nhớ. allocate(size, mID) cấp block FREE liên tiếp đầu tiên có độ dài size và trả về index đầu; nếu không có trả -1. freeMemory(mID) giải phóng mọi ô thuộc mID và trả số ô đã giải phóng.",
      en: "Design Allocator for n memory cells. allocate(size, mID) takes the first contiguous FREE block of length size and returns its start index, or -1. freeMemory(mID) releases every cell owned by mID and returns the released count.",
    },
    defaultInput: [10],
    inputKind: "positive",
    singleInput: true,
    maxInput: 30,
    inputLabel: { vi: "n (số ô nhớ, tối đa 30)", en: "n (memory cells, max 30)" },
    extraParams: [{
      key: "operations",
      type: "string",
      label: { vi: "Operations, ngăn cách bằng |", en: "Operations separated by |" },
      default: "allocate 1 1 | allocate 1 2 | allocate 1 3 | free 2 | allocate 3 4 | allocate 1 1 | allocate 1 1 | free 1",
    }],
    approach: [
      { vi: "Biểu diễn bộ nhớ bằng mảng: 0 là FREE, giá trị dương là mID sở hữu ô.", en: "Represent memory as an array: 0 is FREE and a positive value is the owning mID." },
      { vi: "allocate quét trái sang phải và đếm streak FREE liên tiếp; streak đầu tiên đạt size chính là first-fit.", en: "allocate scans left-to-right and counts a consecutive FREE streak; the first streak reaching size is the first fit." },
      { vi: "freeMemory quét toàn mảng, đặt mọi ô bằng mID về 0 và đếm số ô đã xóa.", en: "freeMemory scans all cells, resets every matching mID to 0, and counts released cells." },
    ],
    complexity: {
      time: "O(n) / operation",
      space: "O(n)",
      note: { vi: "Mỗi operation quét tối đa n ô; mảng memory có n phần tử.", en: "Each operation scans at most n cells; memory contains n entries." },
    },
    code: [
      "class Allocator:",
      "    def __init__(self, n: int):",
      "        self.memory = [0] * n",
      "    def allocate(self, size: int, mID: int) -> int:",
      "        free = 0",
      "        for i in range(len(self.memory)):",
      "            if self.memory[i] == 0:",
      "                free += 1",
      "            else:",
      "                free = 0",
      "            if free == size:",
      "                start = i - size + 1",
      "                self.memory[start:i + 1] = [mID] * size",
      "                return start",
      "        return -1",
      "    def freeMemory(self, mID: int) -> int:",
      "        released = 0",
      "        for i in range(len(self.memory)):",
      "            if self.memory[i] == mID:",
      "                self.memory[i] = 0",
      "                released += 1",
      "        return released",
    ],
    builder: buildSteps2502,
  },
});

function buildSteps363(input, params = {}) {
  const matrix = parseIntegerMatrix2D(input);
  const k = Number(params.k ?? 2);
  const rows = matrix.length, cols = matrix[0].length;
  const steps = [];
  let best = -Infinity;
  let bestRect = null;
  const rectCells = (rect) => {
    if (!rect) return [];
    const cells = [];
    for (let r = rect.top; r <= rect.bottom; r++) for (let c = rect.left; c <= rect.right; c++) cells.push([r, c]);
    return cells;
  };
  const lowerBound = (arr, target) => {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      const value = typeof arr[mid] === "number" ? arr[mid] : arr[mid].sum;
      if (value < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  function push(title, codeLines, colSums, vars, note, final = false, rect = null) {
    const step = matrixStep2D(matrix, {
      title,
      codeLines,
      final,
      vars: [{ name: "k", value: k }, { name: "best", value: best === -Infinity ? "-∞" : best }, ...vars],
      note,
      grid: { pathCells: rectCells(rect || bestRect), caption: "Candidate rectangle" },
    });
    step.arr = [...colSums];
    step.sub = colSums.map((_, i) => `[${i}]`);
    step.highlight = [];
    step.mark = final && bestRect ? Array.from({ length: bestRect.right - bestRect.left + 1 }, (_, i) => bestRect.left + i) : [];
    steps.push(step);
  }

  push({ vi: "Khởi tạo best = -∞", en: "Initialize best = -∞" }, [3], new Array(cols).fill(0), [{ name: "shape", value: `${rows}×${cols}` }], { vi: "Cố định cặp hàng top..bottom, nén tổng theo cột.", en: "Fix top..bottom rows, compress sums by column." });
  for (let top = 0; top < rows; top++) {
    const colSums = new Array(cols).fill(0);
    for (let bottom = top; bottom < rows; bottom++) {
      for (let c = 0; c < cols; c++) colSums[c] += matrix[bottom][c];
      push({ vi: `Nén hàng ${top}..${bottom}`, en: `Compress rows ${top}..${bottom}` }, [4, 5, 6], colSums, [{ name: "top,bottom", value: `${top},${bottom}` }, { name: "colSums", value: `[${colSums.join(",")}]` }], { vi: "Bây giờ bài toán thành: max subarray sum no larger than k.", en: "Now the problem becomes max subarray sum no larger than k." });
      const prefixes = [{ sum: 0, index: 0 }];
      let prefix = 0;
      for (let right = 0; right < cols; right++) {
        prefix += colSums[right];
        const need = prefix - k;
        const idx = lowerBound(prefixes, need);
        let candidate = null;
        if (idx < prefixes.length) {
          const prev = prefixes[idx];
          const sum = prefix - prev.sum;
          candidate = { top, bottom, left: prev.index, right };
          if (sum > best) {
            best = sum;
            bestRect = candidate;
          }
          push({ vi: `right=${right}: candidate=${sum}`, en: `right=${right}: candidate=${sum}` }, [7, 8, 9, 10], colSums, [{ name: "prefix", value: prefix }, { name: "need", value: need }, { name: "sorted prefixes", value: `[${prefixes.map((p) => p.sum).join(",")}]` }, { name: "candidate", value: sum }], { vi: "Tìm prefix nhỏ nhất ≥ prefix-k để subarray sum không vượt quá k.", en: "Find the smallest prefix >= prefix-k so the subarray sum does not exceed k." }, false, candidate);
        }
        const insert = lowerBound(prefixes, prefix);
        prefixes.splice(insert, 0, { sum: prefix, index: right + 1 });
      }
    }
  }
  push({ vi: `Max sum ≤ ${k} là ${best}`, en: `Max sum <= ${k} is ${best}` }, [11], new Array(cols).fill(0), [{ name: "answer", value: best }], { vi: "Đã thử mọi cặp hàng và mọi đoạn cột bằng prefix sorted list.", en: "All row pairs and column ranges were checked with a sorted prefix list." }, true);
  return { original: matrix, answer: best, steps };
}

Object.assign(module.exports, {
  363: {
    id: 363,
    difficulty: "hard",
    slug: "max-sum-of-rectangle-no-larger-than-k",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Max Sum of Rectangle No Larger Than K", en: "Max Sum of Rectangle No Larger Than K" },
    titleVi: { vi: "Tổng rectangle lớn nhất không vượt quá k", en: "Max rectangle sum no larger than k" },
    statement: { vi: "Tìm tổng lớn nhất của một rectangle trong matrix sao cho tổng ≤ k.", en: "Find the largest rectangle sum in matrix such that the sum is <= k." },
    defaultInput: "1,0,1;0,-2,3",
    inputKind: "string",
    inputLabel: { vi: "matrix", en: "matrix" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Cố định top/bottom rồi nén tổng từng cột.", en: "Fix top/bottom rows and compress column sums." },
      { vi: "Trên mảng nén, dùng prefix sum + sorted list để tìm subarray sum lớn nhất ≤ k.", en: "On the compressed array, use prefix sums + sorted list to find the best subarray sum <= k." },
    ],
    complexity: { time: "O(R²·C·log C)", space: "O(C)", note: { vi: "Có R² cặp hàng; mỗi cặp xử lý C prefix.", en: "There are R² row pairs; each processes C prefixes." } },
    code: ["import bisect", "class Solution:", "    def maxSumSubmatrix(self, matrix, k):", "        best = float('-inf')", "        for top in range(len(matrix)):", "            col_sums = [0] * len(matrix[0])", "            for bottom in range(top, len(matrix)):", "                for c in range(len(col_sums)): col_sums[c] += matrix[bottom][c]", "                prefixes = [0]; prefix = 0", "                for value in col_sums:", "                    prefix += value", "                    i = bisect.bisect_left(prefixes, prefix - k)", "                    if i < len(prefixes): best = max(best, prefix - prefixes[i])", "                    bisect.insort(prefixes, prefix)", "        return best"],
    builder: buildSteps363,
  },
});

Object.assign(module.exports, {
  73: {
    id: 73, difficulty: "medium", slug: "set-matrix-zeroes",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Set Matrix Zeroes", en: "Set Matrix Zeroes" }, titleVi: { vi: "Đặt hàng/cột chứa 0 thành 0", en: "Zero every row and column containing a zero" },
    statement: { vi: "Nếu matrix[r][c] là 0, đặt toàn bộ hàng r và cột c thành 0. Visualizer dùng hai Set để nhớ marker trước khi đổi ma trận.", en: "If matrix[r][c] is 0, set its entire row r and column c to zero. The visualizer uses two Sets to preserve markers before changing the matrix." },
    defaultInput: "1,1,1;1,0,1;1,1,1", inputKind: "string", inputLabel: { vi: "matrix (hàng cách ;)", en: "matrix (rows separated by ;)" }, extraParams: [],
    approach: [{ vi: "Lượt 1: quét matrix, ghi mọi chỉ số hàng và cột chứa 0 vào Set.", en: "Pass 1: scan the matrix and record every row and column that contains a zero." }, { vi: "Lượt 2: ô nào nằm trong hàng hoặc cột đã ghi thì đổi thành 0.", en: "Pass 2: turn a cell to 0 if its row or column was recorded." }],
    complexity: { time: "O(m·n)", space: "O(m+n)", note: { vi: "Mỗi ô được quét tối đa hai lần; các Set chứa tối đa m hàng và n cột.", en: "Each cell is scanned at most twice; the Sets hold at most m rows and n columns." } },
    code: [
      "class Solution:",
      "    def setZeroes(self, matrix):",
      "        rows, cols = len(matrix), len(matrix[0])",
      "        zero_rows, zero_cols = set(), set()",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if matrix[r][c] == 0:",
      "                    zero_rows.add(r)",
      "                    zero_cols.add(c)",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if r in zero_rows or c in zero_cols:",
      "                    matrix[r][c] = 0",
      "        return matrix",
    ], builder: buildSteps73,
  },
  74: {
    id: 74, difficulty: "medium", slug: "search-a-2d-matrix",
    category: { key: "array", vi: "Mảng", en: "Array" }, tags: [twoDArrayTag],
    title: { vi: "Search a 2D Matrix", en: "Search a 2D Matrix" }, titleVi: { vi: "Tìm kiếm nhị phân trong ma trận", en: "Binary-search a sorted matrix" },
    statement: { vi: "Mỗi hàng tăng dần và phần tử đầu của hàng sau lớn hơn phần tử cuối của hàng trước. Tìm target bằng binary search trên index phẳng.", en: "Every row is sorted and the first value of a row is greater than the last value of the previous row. Find target with binary search over flat indexes." },
    defaultInput: "1,3,5,7;10,11,16,20;23,30,34,60", inputKind: "string", inputLabel: { vi: "matrix đã sắp xếp (hàng cách ;)", en: "sorted matrix (rows separated by ;)" }, extraParams: [{ key: "target", label: { vi: "target", en: "target" }, default: 3 }],
    approach: [{ vi: "Coi matrix là mảng đã sắp xếp dài rows×cols: lo=0, hi=rows×cols−1.", en: "Treat the matrix as one sorted array of rows×cols values: lo=0, hi=rows×cols−1." }, { vi: "Đổi index mid trở lại tọa độ bằng row=mid//cols, col=mid%cols.", en: "Convert flat mid back to a coordinate with row=mid//cols, col=mid%cols." }],
    complexity: { time: "O(log(m·n))", space: "O(1)", note: { vi: "Mỗi bước bỏ đi một nửa toàn bộ vùng tìm kiếm.", en: "Each step discards half of the entire search range." } },
    code: ["class Solution:", "    def searchMatrix(self, matrix, target):", "        rows, cols = len(matrix), len(matrix[0])", "        lo, hi = 0, rows * cols - 1", "        while lo <= hi:", "            mid = (lo + hi) // 2", "            value = matrix[mid // cols][mid % cols]", "            if value == target:", "                return True", "            elif value < target:", "                lo = mid + 1", "            else:", "                hi = mid - 1", "        return False"], builder: buildSteps74,
  },
});

/**
 * LeetCode 2948: Make Lexicographically Smallest Array by Swapping Elements.
 * Adjacent values in sorted order form a swappable component while their gap
 * is at most limit. Inside one component, sorted values go to sorted indices.
 */
function buildSteps2948(input, params = {}) {
  const original = Array.isArray(input) ? input.map(Number) : [];
  const limit = Number(params.limit ?? 2);
  const steps = [];
  const pairs = original
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index);
  const groups = [];
  let groupStart = 0;

  for (let i = 1; i <= pairs.length; i++) {
    const boundary = i === pairs.length || pairs[i].value - pairs[i - 1].value > limit;
    if (!boundary) continue;
    const members = pairs.slice(groupStart, i);
    groups.push({
      id: groups.length,
      start: groupStart,
      end: i - 1,
      values: members.map((pair) => pair.value),
      indices: members.map((pair) => pair.index).sort((a, b) => a - b),
    });
    groupStart = i;
  }

  const pairGroup = new Array(pairs.length).fill(0);
  groups.forEach((group) => {
    for (let i = group.start; i <= group.end; i++) pairGroup[i] = group.id;
  });
  const answer = new Array(original.length).fill(null);
  const assignedIndices = new Set();

  function snapshot({
    title,
    note,
    codeLines,
    phase,
    scanIndex = null,
    gap = null,
    sameGroup = null,
    revealedThrough = -1,
    activeGroup = null,
    assignment = null,
    final = false,
  }) {
    const step = {
      title,
      codeLines,
      lexSwap2948View: {
        phase,
        original: original.slice(),
        limit,
        sortedPairs: pairs.map((pair, position) => ({ ...pair, group: pairGroup[position], position })),
        groups: groups.map((group) => ({ ...group, values: group.values.slice(), indices: group.indices.slice() })),
        answer: answer.slice(),
        assignedIndices: [...assignedIndices].sort((a, b) => a - b),
        scanIndex,
        gap,
        sameGroup,
        revealedThrough,
        activeGroup,
        assignment,
      },
      vars: [
        { name: "limit", value: limit },
        { name: "sorted values", value: `[${pairs.map((pair) => pair.value).join(", ")}]` },
        { name: "answer", value: `[${answer.map((value) => value ?? "_").join(", ")}]` },
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  if (!original.length || !Number.isFinite(limit) || limit < 0 || original.some((value) => !Number.isFinite(value))) {
    snapshot({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      note: { vi: "nums phải có số và limit phải không âm.", en: "nums must contain numbers and limit must be non-negative." },
      codeLines: [3],
      phase: "invalid",
      final: true,
    });
    return { original, answer: null, steps };
  }

  snapshot({
    title: { vi: "Giữ lại value và index ban đầu", en: "Keep each value with its original index" },
    note: {
      vi: "Index quyết định vị trí trong đáp án; value quyết định phần tử nào có thể nối với nhau bằng swap.",
      en: "Indices determine answer positions; values determine which elements are connected by swaps.",
    },
    codeLines: [3],
    phase: "input",
  });

  snapshot({
    title: { vi: "Sắp xếp các cặp theo value", en: "Sort pairs by value" },
    note: {
      vi: "Sau khi sort, chỉ cần kiểm tra gap giữa hai value kề nhau.",
      en: "After sorting, only gaps between adjacent values need to be checked.",
    },
    codeLines: [3],
    phase: "sorted",
    revealedThrough: 0,
  });

  if (pairs.length === 1) {
    snapshot({
      title: { vi: "Chỉ có một nhóm", en: "There is one component" },
      note: { vi: "Một phần tử tự tạo thành một nhóm hoán đổi.", en: "A single value forms its own swap component." },
      codeLines: [5, 6, 7, 8, 9],
      phase: "groups-ready",
      revealedThrough: 0,
      activeGroup: 0,
    });
  } else {
    for (let i = 1; i < pairs.length; i++) {
      const currentGap = pairs[i].value - pairs[i - 1].value;
      const connected = currentGap <= limit;
      snapshot({
        title: connected
          ? { vi: `${pairs[i].value} - ${pairs[i - 1].value} = ${currentGap} ≤ ${limit}: cùng nhóm`, en: `${pairs[i].value} - ${pairs[i - 1].value} = ${currentGap} <= ${limit}: same group` }
          : { vi: `${pairs[i].value} - ${pairs[i - 1].value} = ${currentGap} > ${limit}: nhóm mới`, en: `${pairs[i].value} - ${pairs[i - 1].value} = ${currentGap} > ${limit}: new group` },
        note: connected
          ? { vi: "Hai value kề nhau swap được; quan hệ bắc cầu nối toàn bộ nhóm.", en: "These adjacent values can swap; transitivity connects the entire component." }
          : { vi: "Không có value trung gian để vượt qua gap này, nên hai phía không thể đổi chỗ cho nhau.", en: "No intermediate value bridges this gap, so the two sides cannot exchange positions." },
        codeLines: [6, 7, 8],
        phase: "scan-gap",
        scanIndex: i,
        gap: currentGap,
        sameGroup: connected,
        revealedThrough: i,
        activeGroup: pairGroup[i],
      });
    }

    snapshot({
      title: { vi: `Tạo được ${groups.length} nhóm hoán đổi`, en: `Built ${groups.length} swap component(s)` },
      note: {
        vi: "Trong mỗi nhóm, mọi value có thể đi đến mọi index nhờ chuỗi swap hợp lệ.",
        en: "Within a component, every value can reach every index through valid swaps.",
      },
      codeLines: [5, 6, 7, 8, 9],
      phase: "groups-ready",
      revealedThrough: pairs.length - 1,
    });
  }

  groups.forEach((group) => {
    group.indices.forEach((index, rank) => {
      const value = group.values[rank];
      answer[index] = value;
      assignedIndices.add(index);
      snapshot({
        title: { vi: `Gán value ${value} vào index ${index}`, en: `Place value ${value} at index ${index}` },
        note: {
          vi: `Trong nhóm ${group.id + 1}, value nhỏ thứ ${rank + 1} đi vào index nhỏ thứ ${rank + 1}.`,
          en: `In component ${group.id + 1}, the ${rank + 1}${rank === 0 ? "st" : rank === 1 ? "nd" : rank === 2 ? "rd" : "th"} smallest value goes to the matching smallest index.`,
        },
        codeLines: [10, 11, 12, 13],
        phase: "assign",
        revealedThrough: pairs.length - 1,
        activeGroup: group.id,
        assignment: { group: group.id, index, value, rank },
      });
    });
  });

  snapshot({
    title: { vi: `Đáp án nhỏ nhất: [${answer.join(", ")}]`, en: `Lexicographically smallest: [${answer.join(", ")}]` },
    note: {
      vi: "Mỗi nhóm đã đặt các value nhỏ nhất vào các index nhỏ nhất, nên không thể cải thiện vị trí đầu tiên nào nữa.",
      en: "Each component puts its smallest values at its smallest indices, so no earlier position can be improved.",
    },
    codeLines: [14, 15],
    phase: "done",
    revealedThrough: pairs.length - 1,
    final: true,
  });

  return { original, answer, steps };
}

Object.assign(module.exports, {
  2948: {
    id: 2948,
    difficulty: "medium",
    slug: "make-lexicographically-smallest-array-by-swapping-elements",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: { vi: "Make Lexicographically Smallest Array by Swapping Elements", en: "Make Lexicographically Smallest Array by Swapping Elements" },
    titleVi: { vi: "Tạo mảng nhỏ nhất theo thứ tự từ điển bằng phép đổi chỗ", en: "Build the lexicographically smallest array with swaps" },
    statement: {
      vi: "Được swap nums[i] và nums[j] nếu |nums[i]-nums[j]| ≤ limit. Hãy thực hiện tùy ý số lần để thu được mảng nhỏ nhất theo thứ tự từ điển.",
      en: "Swap nums[i] and nums[j] when |nums[i]-nums[j]| <= limit. Perform any number of swaps to obtain the lexicographically smallest array.",
    },
    defaultInput: [1, 5, 3, 9, 8],
    inputKind: "array",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [{ key: "limit", label: { vi: "limit", en: "limit" }, default: 2 }],
    approach: [
      { vi: "Sort các cặp (value, index). Gap kề nhau ≤ limit tạo cùng một nhóm liên thông.", en: "Sort (value, index) pairs. Adjacent gaps <= limit form one connected component." },
      { vi: "Trong mỗi nhóm, sort index rồi ghép value nhỏ nhất với index nhỏ nhất.", en: "Within each component, sort indices and pair the smallest values with the smallest indices." },
      { vi: "Các nhóm bị ngăn bởi gap > limit nên không thể trao đổi value qua ranh giới.", en: "A gap > limit prevents values from crossing that component boundary." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: { vi: "Sort value và index chi phối thời gian.", en: "Sorting values and indices dominates the running time." },
    },
    code: [
      "class Solution:",
      "    def lexicographicallySmallestArray(self, nums, limit):",
      "        pairs = sorted((value, index) for index, value in enumerate(nums))",
      "        answer = nums[:]",
      "        start = 0",
      "        while start < len(nums):",
      "            end = start + 1",
      "            while end < len(nums) and pairs[end][0] - pairs[end - 1][0] <= limit:",
      "                end += 1",
      "            indices = sorted(index for _, index in pairs[start:end])",
      "            values = [value for value, _ in pairs[start:end]]",
      "            for index, value in zip(indices, values):",
      "                answer[index] = value",
      "            start = end",
      "        return answer",
    ],
    builder: buildSteps2948,
  },
});
