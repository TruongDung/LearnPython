"use strict";

const {
  bi,
  fail,
  parsePlainParams,
  parseInteger,
  parseIntegerArray,
  createTracer,
  lowerBound,
  upperBound,
  Fenwick,
} = require("./hard-viz-shared");

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const range = (start, end) => end < start
  ? []
  : Array.from({ length: end - start + 1 }, (_, offset) => start + offset);

const MAX_VISUAL_INPUT = 40;
const MAX_ABSOLUTE_VALUE = 1_000_000_000;

// ---------------------------------------------------------------------------
// 2302. Count Subarrays With Score Less Than K
// ---------------------------------------------------------------------------

const COUNT_SUBARRAYS_2302_SOURCE = Object.freeze([
  "class Solution:",
  "    def countSubarrays(self, nums: list[int], k: int) -> int:",
  "        left = 0",
  "        window_sum = answer = 0",
  "        for right, value in enumerate(nums):",
  "            window_sum += value",
  "            while window_sum * (right - left + 1) >= k:",
  "                window_sum -= nums[left]",
  "                left += 1",
  "            answer += right - left + 1",
  "        return answer",
]);

const COUNT_SUBARRAYS_2302_PHASES = Object.freeze([
  bi("Khởi tạo cửa sổ", "Initialize window"),
  bi("Mở rộng sang phải", "Expand right"),
  bi("Co biên trái", "Shrink left"),
  bi("Cộng đóng góp", "Add contribution"),
  bi("Hoàn tất", "Complete"),
]);

function parseCountSubarrays2302(input, params) {
  const parsedParams = parsePlainParams(params, 2302);
  const nums = parseIntegerArray(input, {
    problemId: 2302,
    name: "nums",
    minLength: 1,
    maxLength: MAX_VISUAL_INPUT,
    minValue: 1,
    maxValue: 100_000,
  });
  const k = parseInteger(hasOwn(parsedParams, "k") ? parsedParams.k : 10, {
    problemId: 2302,
    name: "k",
    min: 1,
    max: 1_000_000_000_000_000,
  });
  return { nums, k };
}

function buildCountSubarrays2302(input, params) {
  const { nums, k } = parseCountSubarrays2302(input, params);
  const tracer = createTracer({
    problemId: 2302,
    source: COUNT_SUBARRAYS_2302_SOURCE,
    phases: COUNT_SUBARRAYS_2302_PHASES,
    maxSteps: 128,
    baseArray: nums,
    legend: [
      { label: bi("Phần tử vừa mở rộng", "Newly expanded element"), state: "active" },
      { label: bi("Nằm trong cửa sổ", "Inside the window"), state: "candidate" },
      { label: bi("Đóng góp hợp lệ", "Valid contribution"), state: "updated" },
      { label: bi("Bất biến đúng", "Invariant holds"), state: "success" },
      { label: bi("Cần co cửa sổ", "Window must shrink"), state: "danger" },
    ],
  });

  let left = 0;
  let right = -1;
  let windowSum = 0;
  let answer = 0;
  const contributionRows = [];

  const windowLength = () => Math.max(0, right - left + 1);
  const windowScore = () => windowSum * windowLength();
  const windowIndices = () => range(left, right);

  function sequence(final = false) {
    return nums.map((value, index) => {
      let state = "pending";
      if (final) state = "success";
      else if (index === right) state = "active";
      else if (index >= left && index <= right) state = "candidate";
      else if (index < left || index <= right) state = "muted";
      return {
        label: bi(`nums[${index}]`, `nums[${index}]`),
        value,
        state,
      };
    });
  }

  function contributionTable(final = false) {
    return {
      title: bi("Đóng góp theo đầu phải", "Contribution by right endpoint"),
      columns: [
        bi("left", "left"),
        bi("right", "right"),
        bi("tổng", "sum"),
        bi("độ dài", "length"),
        bi("điểm", "score"),
        bi("cộng", "added"),
        bi("answer", "answer"),
      ],
      rows: contributionRows.map((row) => ({
        label: bi(`Kết thúc tại ${row.right}`, `Ends at ${row.right}`),
        state: final ? "success" : row.right === right ? "updated" : "default",
        cells: [
          row.left,
          row.right,
          row.sum,
          row.length,
          { value: row.score, state: "success" },
          { value: row.added, state: "updated" },
          row.answer,
        ],
      })),
    };
  }

  function emit2302({
    phaseIndex,
    codeLines,
    title,
    note,
    action,
    formula,
    contribution = null,
    final = false,
  }) {
    const length = windowLength();
    const score = windowScore();
    const invariant = score < k;
    const bounds = length > 0 ? `[${left}, ${right}]` : "∅";
    const contributionItems = contribution
      ? [
        {
          label: bi("Các vị trí bắt đầu", "Valid start indices"),
          value: contribution.starts.length ? contribution.starts : "∅",
          state: "updated",
        },
        {
          label: bi("Số subarray mới", "New subarrays"),
          value: contribution.added,
          state: "updated",
        },
      ]
      : [{ label: bi("Chưa cộng ở bước này", "Nothing added in this step"), value: 0, state: "muted" }];

    tracer.emit({
      phaseIndex,
      codeLines,
      title,
      note,
      action,
      formula,
      arr: nums,
      sub: nums.map((_, index) => {
        if (index === left && index === right) return "L = R";
        if (index === left) return "L";
        if (index === right) return "R";
        return index >= left && index <= right ? "window" : "";
      }),
      highlight: windowIndices(),
      mark: right >= 0 && right < nums.length ? [right] : [],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right >= 0 ? right : "—" },
        { name: "window_sum", value: windowSum },
        { name: "length", value: length },
        { name: "score", value: score },
        { name: "answer", value: answer },
      ],
      metrics: [
        { label: bi("Cửa sổ", "Window"), value: bounds, state: length ? "active" : "muted" },
        { label: bi("Tổng", "Sum"), value: windowSum, state: "info" },
        { label: bi("Độ dài", "Length"), value: length, state: "info" },
        { label: bi("Điểm", "Score"), value: score, state: invariant ? "success" : "danger" },
        { label: bi("Ngưỡng k", "Threshold k"), value: k, state: "default" },
        { label: bi("Đáp án đang có", "Running answer"), value: answer, state: "answer" },
      ],
      groups: [
        {
          title: bi("Bất biến cửa sổ", "Window invariant"),
          items: [
            { label: bi("window_sum", "window_sum"), value: windowSum, state: "default" },
            { label: bi("right - left + 1", "right - left + 1"), value: length, state: "default" },
            {
              label: bi("window_sum × length < k", "window_sum × length < k"),
              value: invariant,
              state: invariant ? "success" : "danger",
            },
          ],
        },
        { title: bi("Đóng góp hiện tại", "Current contribution"), items: contributionItems },
      ],
      sequence: sequence(final),
      table: contributionTable(final),
      final,
      answer: final ? answer : null,
    });
  }

  emit2302({
    phaseIndex: 0,
    codeLines: [3, 4],
    title: bi("Khởi tạo cửa sổ rỗng", "Initialize an empty window"),
    note: bi(
      "left = 0, window_sum = 0 và answer = 0; cửa sổ rỗng có điểm 0.",
      "left = 0, window_sum = 0, and answer = 0; the empty window has score 0.",
    ),
    action: bi("Đặt các biến tích lũy về 0", "Set the accumulators to zero"),
    formula: bi(
      "window_sum * (right - left + 1) = 0 < k",
      "window_sum * (right - left + 1) = 0 < k",
    ),
  });

  for (let index = 0; index < nums.length; index += 1) {
    right = index;
    windowSum += nums[right];
    emit2302({
      phaseIndex: 1,
      codeLines: [5, 6],
      title: bi(`Mở rộng right đến ${right}`, `Expand right to ${right}`),
      note: bi(
        `Thêm nums[${right}] = ${nums[right]}, nên window_sum = ${windowSum}.`,
        `Add nums[${right}] = ${nums[right]}, making window_sum = ${windowSum}.`,
      ),
      action: bi(`Đưa ${nums[right]} vào cửa sổ`, `Add ${nums[right]} to the window`),
      formula: bi(
        `score = ${windowSum} * ${windowLength()} = ${windowScore()}; nếu score ≥ ${k} thì co`,
        `score = ${windowSum} * ${windowLength()} = ${windowScore()}; shrink if score >= ${k}`,
      ),
    });

    while (windowSum * (right - left + 1) >= k) {
      const removedIndex = left;
      const removedValue = nums[removedIndex];
      const scoreBefore = windowScore();
      windowSum -= removedValue;
      left += 1;
      emit2302({
        phaseIndex: 2,
        codeLines: [7, 8, 9],
        title: bi(`Loại nums[${removedIndex}] khỏi cửa sổ`, `Remove nums[${removedIndex}] from the window`),
        note: bi(
          `Điểm ${scoreBefore} không nhỏ hơn k=${k}; bỏ ${removedValue} và tăng left thành ${left}.`,
          `Score ${scoreBefore} is not below k=${k}; remove ${removedValue} and advance left to ${left}.`,
        ),
        action: bi(`Co trái sau khi điểm = ${scoreBefore}`, `Shrink from the left after score = ${scoreBefore}`),
        formula: bi(
          `while window_sum * (right - left + 1) >= k; điểm mới = ${windowScore()}`,
          `while window_sum * (right - left + 1) >= k; new score = ${windowScore()}`,
        ),
      });
    }

    const added = right - left + 1;
    const starts = range(left, right);
    answer += added;
    contributionRows.push({
      left,
      right,
      sum: windowSum,
      length: added,
      score: windowScore(),
      added,
      answer,
    });
    emit2302({
      phaseIndex: 3,
      codeLines: [10],
      title: bi(`Cộng ${added} subarray kết thúc tại ${right}`, `Add ${added} subarrays ending at ${right}`),
      note: bi(
        `Vì nums dương và cửa sổ [${left}, ${right}] hợp lệ, mọi suffix bắt đầu từ ${left}..${right} cũng hợp lệ.`,
        `Because nums is positive and window [${left}, ${right}] is valid, every suffix starting at ${left}..${right} is also valid.`,
      ),
      action: bi(`answer += ${right} - ${left} + 1 = ${added}`, `answer += ${right} - ${left} + 1 = ${added}`),
      formula: bi(
        "window_sum * (right - left + 1) < k; contribution = right - left + 1",
        "window_sum * (right - left + 1) < k; contribution = right - left + 1",
      ),
      contribution: { starts, added },
    });
  }

  emit2302({
    phaseIndex: 4,
    codeLines: [11],
    title: bi(`Trả về ${answer}`, `Return ${answer}`),
    note: bi(
      "Mỗi subarray hợp lệ được đếm đúng một lần tại đầu phải của nó.",
      "Every valid subarray is counted exactly once at its right endpoint.",
    ),
    action: bi("Hoàn tất phép đếm", "Finish counting"),
    formula: bi(
      "Sau mỗi right: window_sum * (right - left + 1) < k",
      "After every right: window_sum * (right - left + 1) < k",
    ),
    final: true,
  });

  return {
    original: [...nums],
    k,
    answer,
    steps: tracer.finish(),
  };
}

// ---------------------------------------------------------------------------
// 2426. Number of Pairs Satisfying Inequality
// ---------------------------------------------------------------------------

const NUMBER_OF_PAIRS_2426_SOURCE = Object.freeze([
  "from bisect import bisect_left, bisect_right",
  "",
  "class Fenwick:",
  "    def __init__(self, size: int):",
  "        self.tree = [0] * (size + 1)",
  "",
  "    def add(self, index: int, delta: int) -> None:",
  "        while index < len(self.tree):",
  "            self.tree[index] += delta",
  "            index += index & -index",
  "",
  "    def query(self, index: int) -> int:",
  "        total = 0",
  "        while index > 0:",
  "            total += self.tree[index]",
  "            index -= index & -index",
  "        return total",
  "",
  "class Solution:",
  "    def numberOfPairs(self, nums1: list[int], nums2: list[int], diff: int) -> int:",
  "        differences = [a - b for a, b in zip(nums1, nums2)]",
  "        coordinates = sorted(set(differences))",
  "        bit = Fenwick(len(coordinates))",
  "        answer = 0",
  "        for current in differences:",
  "            query_index = bisect_right(coordinates, current + diff)",
  "            answer += bit.query(query_index)",
  "            update_index = bisect_left(coordinates, current) + 1",
  "            bit.add(update_index, 1)",
  "        return answer",
]);

const NUMBER_OF_PAIRS_2426_PHASES = Object.freeze([
  bi("Tạo mảng hiệu d", "Build difference array d"),
  bi("Nén tọa độ", "Compress coordinates"),
  bi("Truy vấn Fenwick", "Query Fenwick"),
  bi("Cập nhật Fenwick", "Update Fenwick"),
  bi("Hoàn tất", "Complete"),
]);

function parseNumberOfPairs2426(input, params) {
  const parsedParams = parsePlainParams(params, 2426);
  const nums1 = parseIntegerArray(input, {
    problemId: 2426,
    name: "nums1",
    minLength: 1,
    maxLength: MAX_VISUAL_INPUT,
    minValue: -MAX_ABSOLUTE_VALUE,
    maxValue: MAX_ABSOLUTE_VALUE,
  });
  const nums2 = parseIntegerArray(
    hasOwn(parsedParams, "nums2") ? parsedParams.nums2 : "[2,2,1]",
    {
      problemId: 2426,
      name: "nums2",
      minLength: 1,
      maxLength: MAX_VISUAL_INPUT,
      minValue: -MAX_ABSOLUTE_VALUE,
      maxValue: MAX_ABSOLUTE_VALUE,
    },
  );
  if (nums1.length !== nums2.length) {
    fail(
      2426,
      RangeError,
      "nums1 và nums2 phải có cùng độ dài",
      "nums1 and nums2 must have the same length",
    );
  }
  const diff = parseInteger(hasOwn(parsedParams, "diff") ? parsedParams.diff : 1, {
    problemId: 2426,
    name: "diff",
    min: -MAX_ABSOLUTE_VALUE,
    max: MAX_ABSOLUTE_VALUE,
  });
  return { nums1, nums2, diff };
}

function fenwickQueryPath(prefixLength) {
  const path = [];
  for (let index = prefixLength; index > 0; index -= index & -index) path.push(index);
  return path;
}

function fenwickUpdatePath(zeroBasedIndex, size) {
  const path = [];
  for (let index = zeroBasedIndex + 1; index <= size; index += index & -index) path.push(index);
  return path;
}

function buildNumberOfPairs2426(input, params) {
  const { nums1, nums2, diff } = parseNumberOfPairs2426(input, params);
  const differences = nums1.map((value, index) => value - nums2[index]);
  const coordinates = [...new Set(differences)].sort((left, right) => left - right);
  const bit = new Fenwick(coordinates.length);
  const frequencies = Array(coordinates.length).fill(0);
  const tracer = createTracer({
    problemId: 2426,
    source: NUMBER_OF_PAIRS_2426_SOURCE,
    phases: NUMBER_OF_PAIRS_2426_PHASES,
    maxSteps: 96,
    baseArray: differences,
    legend: [
      { label: bi("Hiệu đang xét", "Current difference"), state: "active" },
      { label: bi("Thuộc miền truy vấn", "Inside query range"), state: "candidate" },
      { label: bi("Nút BIT được cập nhật", "Updated BIT node"), state: "updated" },
      { label: bi("Đã chèn", "Inserted"), state: "success" },
      { label: bi("Chưa xử lý", "Not processed"), state: "pending" },
    ],
  });

  let answer = 0;
  let seen = 0;

  function coordinateTable({ threshold = null, queryLimit = 0, queryPath = [], updateRank = null, updatePath = [], final = false }) {
    return {
      title: bi("Tọa độ nén và Fenwick tree", "Compressed coordinates and Fenwick tree"),
      columns: [
        bi("Giá trị d", "d value"),
        bi("Tần suất", "Frequency"),
        bi("BIT[rank]", "BIT[rank]"),
        bi("≤ ngưỡng?", "<= threshold?"),
        bi("Đường BIT", "BIT path"),
      ],
      rows: coordinates.map((coordinate, index) => {
        const rank = index + 1;
        const eligible = threshold !== null && index < queryLimit;
        const queriedNode = queryPath.includes(rank);
        const updatedNode = updatePath.includes(rank);
        let state = "default";
        if (final) state = "success";
        else if (updatedNode) state = "updated";
        else if (index === updateRank) state = "active";
        else if (eligible) state = "candidate";
        return {
          label: bi(`Hạng ${rank}`, `Rank ${rank}`),
          state,
          cells: [
            { value: coordinate, state: index === updateRank ? "active" : "default" },
            { value: frequencies[index], state: index === updateRank ? "updated" : "default" },
            {
              value: bit.tree[rank],
              state: updatedNode ? "updated" : queriedNode ? "candidate" : "default",
            },
            {
              value: threshold === null ? "—" : eligible ? bi("có", "yes") : bi("không", "no"),
              state: eligible ? "candidate" : "muted",
            },
            {
              value: updatedNode ? bi("cập nhật", "update") : queriedNode ? bi("truy vấn", "query") : "—",
              state: updatedNode ? "updated" : queriedNode ? "candidate" : "muted",
            },
          ],
        };
      }),
    };
  }

  function differenceSequence(currentIndex, processedThrough, final = false) {
    return differences.map((value, index) => {
      let state = "pending";
      if (final || index <= processedThrough) state = "success";
      if (!final && index === currentIndex) state = "active";
      return {
        label: bi(
          `d[${index}] = ${nums1[index]} - ${nums2[index]}`,
          `d[${index}] = ${nums1[index]} - ${nums2[index]}`,
        ),
        value,
        state,
      };
    });
  }

  function emit2426({
    phaseIndex,
    codeLines,
    title,
    note,
    action,
    formula,
    currentIndex = -1,
    processedThrough = -1,
    threshold = null,
    queryLimit = 0,
    queryPath = [],
    updateRank = null,
    updatePath = [],
    added = null,
    final = false,
  }) {
    const current = currentIndex >= 0 ? differences[currentIndex] : null;
    const traversalPath = updatePath.length ? updatePath : queryPath;
    const traversalKind = updatePath.length ? bi("Cập nhật", "Update") : bi("Truy vấn", "Query");
    const traversalItems = traversalPath.length
      ? traversalPath.map((rank) => ({
        label: bi(`BIT[${rank}]`, `BIT[${rank}]`),
        value: bit.tree[rank],
        state: updatePath.length ? "updated" : "candidate",
      }))
      : [{ label: bi("Chưa duyệt nút BIT", "No BIT node traversed"), value: "—", state: "muted" }];

    tracer.emit({
      phaseIndex,
      codeLines,
      title,
      note,
      action,
      formula,
      arr: differences,
      sub: differences.map((_, index) => `${nums1[index]}-${nums2[index]}`),
      highlight: currentIndex >= 0 ? [currentIndex] : [],
      mark: range(0, processedThrough),
      vars: [
        { name: "i", value: currentIndex >= 0 ? currentIndex : "—" },
        { name: "d[i]", value: current === null ? "—" : current },
        { name: "diff", value: diff },
        { name: "threshold", value: threshold === null ? "—" : threshold },
        { name: "query_count", value: added === null ? "—" : added },
        { name: "seen", value: seen },
        { name: "answer", value: answer },
      ],
      metrics: [
        { label: bi("Hiệu hiện tại", "Current difference"), value: current === null ? "—" : current, state: "active" },
        { label: bi("Ngưỡng d[i] + diff", "Threshold d[i] + diff"), value: threshold === null ? "—" : threshold, state: "info" },
        { label: bi("Số hạng đã thấy", "Seen values"), value: seen, state: "default" },
        { label: bi("Cặp mới", "New pairs"), value: added === null ? "—" : added, state: added ? "updated" : "muted" },
        { label: bi("Đáp án đang có", "Running answer"), value: answer, state: "answer" },
      ],
      groups: [
        {
          title: bi("Tọa độ đã nén", "Compressed coordinates"),
          items: coordinates.map((coordinate, index) => ({
            label: bi(`rank ${index + 1}`, `rank ${index + 1}`),
            value: coordinate,
            state: index === updateRank ? "active" : threshold !== null && index < queryLimit ? "candidate" : "default",
          })),
        },
        { title: traversalKind, items: traversalItems },
      ],
      sequence: differenceSequence(currentIndex, processedThrough, final),
      table: coordinateTable({ threshold, queryLimit, queryPath, updateRank, updatePath, final }),
      final,
      answer: final ? answer : null,
    });
  }

  emit2426({
    phaseIndex: 0,
    codeLines: [21],
    title: bi("Tạo d[i] = nums1[i] - nums2[i]", "Build d[i] = nums1[i] - nums2[i]"),
    note: bi(
      `Mảng hiệu là [${differences.join(", ")}]. Bất đẳng thức trở thành d[j] ≤ d[i] + diff cho j < i.`,
      `The difference array is [${differences.join(", ")}]. The inequality becomes d[j] <= d[i] + diff for j < i.`,
    ),
    action: bi("Trừ hai mảng theo từng vị trí", "Subtract the arrays element by element"),
    formula: bi("d[i] = nums1[i] - nums2[i]", "d[i] = nums1[i] - nums2[i]"),
  });

  emit2426({
    phaseIndex: 1,
    codeLines: [22, 23, 24],
    title: bi("Nén các giá trị d phân biệt", "Compress the distinct d values"),
    note: bi(
      `Các tọa độ tăng dần là [${coordinates.join(", ")}]; BIT ban đầu chứa toàn số 0.`,
      `The sorted coordinates are [${coordinates.join(", ")}]; the BIT initially contains only zeros.`,
    ),
    action: bi("Sắp xếp, loại trùng và tạo Fenwick", "Sort, deduplicate, and create the Fenwick tree"),
    formula: bi("rank(x) = lower_bound(coordinates, x) + 1", "rank(x) = lower_bound(coordinates, x) + 1"),
  });

  for (let index = 0; index < differences.length; index += 1) {
    const current = differences[index];
    const threshold = current + diff;
    const queryLimit = upperBound(coordinates, threshold);
    const queryPath = fenwickQueryPath(queryLimit);
    const added = queryLimit === 0 ? 0 : bit.prefix(queryLimit - 1);
    answer += added;

    emit2426({
      phaseIndex: 2,
      codeLines: [25, 26, 27],
      title: bi(`Truy vấn các d trước ≤ ${threshold}`, `Query earlier d values <= ${threshold}`),
      note: bi(
        `upper_bound trả ${queryLimit}; Fenwick đếm ${added} trong ${seen} giá trị trước, nên answer = ${answer}.`,
        `upper_bound returns ${queryLimit}; Fenwick counts ${added} among ${seen} earlier values, so answer = ${answer}.`,
      ),
      action: bi(`Cộng ${added} cặp có đầu phải ${index}`, `Add ${added} pairs with right endpoint ${index}`),
      formula: bi(
        "query_count = count(previous d <= d[i] + diff)",
        "query_count = count(previous d <= d[i] + diff)",
      ),
      currentIndex: index,
      processedThrough: index - 1,
      threshold,
      queryLimit,
      queryPath,
      added,
    });

    const updateRank = lowerBound(coordinates, current);
    const updatePath = fenwickUpdatePath(updateRank, coordinates.length);
    bit.add(updateRank, 1);
    frequencies[updateRank] += 1;
    seen += 1;

    emit2426({
      phaseIndex: 3,
      codeLines: [28, 29],
      title: bi(`Chèn d[${index}] = ${current} tại rank ${updateRank + 1}`, `Insert d[${index}] = ${current} at rank ${updateRank + 1}`),
      note: bi(
        `Cập nhật các nút BIT [${updatePath.join(", ")}]; giá trị này chỉ tham gia truy vấn của các index sau.`,
        `Update BIT nodes [${updatePath.join(", ")}]; this value participates only in later queries.`,
      ),
      action: bi("Cập nhật tần suất Fenwick", "Update the Fenwick frequency"),
      formula: bi(
        "update_rank = lower_bound(coordinates, d[i]) + 1",
        "update_rank = lower_bound(coordinates, d[i]) + 1",
      ),
      currentIndex: index,
      processedThrough: index,
      threshold,
      queryLimit,
      updateRank,
      updatePath,
      added,
    });
  }

  emit2426({
    phaseIndex: 4,
    codeLines: [30],
    title: bi(`Trả về ${answer}`, `Return ${answer}`),
    note: bi(
      "Mỗi cặp i < j được đếm đúng khi d[j] được xử lý, trước khi d[j] được chèn vào BIT.",
      "Each pair i < j is counted exactly when d[j] is processed, before d[j] is inserted into the BIT.",
    ),
    action: bi("Hoàn tất phép đếm cặp", "Finish counting pairs"),
    formula: bi(
      "d[i] <= d[j] + diff, với i < j",
      "d[i] <= d[j] + diff, for i < j",
    ),
    processedThrough: differences.length - 1,
    final: true,
  });

  return {
    original: [...nums1],
    nums2: [...nums2],
    diff,
    differences: [...differences],
    answer,
    steps: tracer.finish(),
  };
}

module.exports = {
  2302: {
    id: 2302,
    difficulty: "hard",
    slug: "count-subarrays-with-score-less-than-k",
    category: { key: "sliding", ...bi("Cửa sổ trượt", "Sliding Window") },
    tags: [
      { key: "array", ...bi("Mảng", "Array") },
      { key: "sliding-window", ...bi("Cửa sổ trượt", "Sliding Window") },
      { key: "counting", ...bi("Đếm", "Counting") },
    ],
    title: bi("Đếm mảng con có điểm nhỏ hơn K", "Count Subarrays With Score Less Than K"),
    titleVi: bi("Đếm mảng con có điểm nhỏ hơn K", "Count subarrays with score less than K"),
    statement: bi(
      "Cho mảng số nguyên dương nums và số nguyên dương k. Điểm của một subarray bằng tổng nhân độ dài; hãy đếm các subarray có điểm nhỏ hơn k.",
      "Given a positive integer array nums and a positive integer k, a subarray's score is its sum times its length; count subarrays whose score is less than k.",
    ),
    defaultInput: [2, 1, 4, 3, 5],
    inputKind: "positive",
    inputLabel: bi("nums (1–40 số nguyên dương)", "nums (1–40 positive integers)"),
    maxInput: 100_000,
    extraParams: [
      {
        key: "k",
        type: "number",
        min: 1,
        max: 1_000_000_000_000_000,
        default: 10,
        label: bi("k (ngưỡng điểm)", "k (score threshold)"),
      },
    ],
    approach: [
      bi(
        "Giữ cửa sổ [left,right] và tổng window_sum. Sau khi thêm right, co left khi điểm không nhỏ hơn k.",
        "Maintain window [left,right] and window_sum. After adding right, shrink left while the score is not below k.",
      ),
      bi(
        "Bất biến sau vòng co là window_sum * (right-left+1) < k.",
        "After shrinking, the invariant is window_sum * (right-left+1) < k.",
      ),
      bi(
        "Vì mọi số đều dương, mọi suffix của cửa sổ hợp lệ cũng hợp lệ; right đóng góp right-left+1 subarray.",
        "Because every value is positive, every suffix of a valid window is also valid; right contributes right-left+1 subarrays.",
      ),
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: bi(
        "Mỗi phần tử đi vào qua right và bị loại qua left nhiều nhất một lần; trace bị giới hạn 128 frame cho tối đa 40 phần tử.",
        "Each element enters through right and leaves through left at most once; the trace is capped at 128 frames for at most 40 values.",
      ),
    },
    debugMode: "semantic",
    code: COUNT_SUBARRAYS_2302_SOURCE,
    liveArgs: (input, params) => {
      const parsed = parseCountSubarrays2302(input, params);
      return [parsed.nums, parsed.k];
    },
    builder: buildCountSubarrays2302,
  },

  2426: {
    id: 2426,
    difficulty: "hard",
    slug: "number-of-pairs-satisfying-inequality",
    category: { key: "fenwick", ...bi("Fenwick Tree", "Fenwick Tree") },
    tags: [
      { key: "array", ...bi("Mảng", "Array") },
      { key: "binary-indexed-tree", ...bi("Cây chỉ số nhị phân", "Binary Indexed Tree") },
      { key: "coordinate-compression", ...bi("Nén tọa độ", "Coordinate Compression") },
      { key: "binary-search", ...bi("Tìm kiếm nhị phân", "Binary Search") },
    ],
    title: bi("Số cặp thỏa mãn bất đẳng thức", "Number of Pairs Satisfying Inequality"),
    titleVi: bi("Đếm cặp bằng nén tọa độ và Fenwick", "Count pairs with compression and Fenwick"),
    statement: bi(
      "Cho nums1, nums2 cùng độ dài và số nguyên diff. Đếm cặp i < j thỏa nums1[i] - nums1[j] ≤ nums2[i] - nums2[j] + diff.",
      "Given equal-length nums1 and nums2 and an integer diff, count pairs i < j satisfying nums1[i] - nums1[j] <= nums2[i] - nums2[j] + diff.",
    ),
    defaultInput: [3, 2, 5],
    inputKind: "integer",
    inputLabel: bi("nums1 (1–40 số nguyên)", "nums1 (1–40 integers)"),
    extraParams: [
      {
        key: "nums2",
        type: "string",
        default: "[2,2,1]",
        label: bi("nums2 (JSON hoặc CSV)", "nums2 (JSON or CSV)"),
      },
      {
        key: "diff",
        type: "number",
        allowNegative: true,
        min: -MAX_ABSOLUTE_VALUE,
        max: MAX_ABSOLUTE_VALUE,
        default: 1,
        label: bi("diff (số nguyên có dấu)", "diff (signed integer)"),
      },
    ],
    approach: [
      bi(
        "Đặt d[i] = nums1[i] - nums2[i]; điều kiện của cặp trước i và hiện tại j trở thành d[i] ≤ d[j] + diff.",
        "Set d[i] = nums1[i] - nums2[i]; for an earlier i and current j, the condition becomes d[i] <= d[j] + diff.",
      ),
      bi(
        "Nén các giá trị d phân biệt. upper_bound(d[j]+diff) xác định prefix tọa độ cần truy vấn.",
        "Compress distinct d values. upper_bound(d[j]+diff) identifies the coordinate prefix to query.",
      ),
      bi(
        "Fenwick lưu tần suất d đã thấy: query trước để đếm cặp, rồi lower_bound và update d hiện tại để giữ i < j.",
        "Fenwick stores frequencies of seen d values: query first to count pairs, then lower_bound and update the current d to preserve i < j.",
      ),
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: bi(
        "Nén tọa độ tốn O(n log n); mỗi phần tử có một upper_bound, một Fenwick query, một lower_bound và một update. Trace tối đa 96 frame.",
        "Compression costs O(n log n); each value performs one upper_bound, one Fenwick query, one lower_bound, and one update. The trace is capped at 96 frames.",
      ),
    },
    debugMode: "semantic",
    code: NUMBER_OF_PAIRS_2426_SOURCE,
    liveArgs: (input, params) => {
      const parsed = parseNumberOfPairs2426(input, params);
      return [parsed.nums1, parsed.nums2, parsed.diff];
    },
    builder: buildNumberOfPairs2426,
  },
};
