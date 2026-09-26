// LeetCode 1589: range-add difference array, then rearrangement inequality.

const label = (vi, en) => ({ vi, en });
const MOD = 1000000007;
const PREVIEW = 18;

function parseRequests1589(raw) {
  let requests = raw;
  if (typeof raw === "string") {
    try {
      requests = JSON.parse(raw);
    } catch (_) {
      throw new Error('requests must be JSON pairs such as [[1,3],[0,1]]');
    }
  }
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > 100000
    || requests.some((pair) => !Array.isArray(pair) || pair.length !== 2
      || !Number.isInteger(pair[0]) || !Number.isInteger(pair[1]))) {
    throw new Error("requests must contain 1..100000 integer pairs [left, right]");
  }
  return requests.map(([left, right]) => [left, right]);
}

function buildSteps1589(input, params = {}) {
  const nums = Array.isArray(input) ? [...input] : [];
  if (nums.length < 1 || nums.length > 100000
    || nums.some((value) => !Number.isInteger(value) || value < 0 || value > 100000)) {
    throw new Error("nums must contain 1..100000 integers in [0, 100000]");
  }
  const requests = parseRequests1589(params.requests);
  const n = nums.length;
  for (const [left, right] of requests) {
    if (left < 0 || left > right || right >= n) {
      throw new Error("each request must satisfy 0 <= left <= right < nums.length");
    }
  }

  const diff = new Array(n + 1).fill(0);
  const frequency = new Array(n).fill(0);
  const steps = [];
  let sortedNums = null;
  let sortedFrequency = null;
  let answer = 0;
  let running = 0;
  let prefixProcessed = -1;

  function record(phase, title, codeLine, note, state = {}) {
    const activeIndex = state.index ?? null;
    const requestIndex = state.requestIndex ?? null;
    const request = requestIndex === null ? null : requests[requestIndex];
    const indices = new Set(Array.from({ length: Math.min(n, PREVIEW) }, (_, index) => index));
    if (activeIndex !== null && activeIndex <= n) indices.add(activeIndex);
    if (request) {
      indices.add(request[0]);
      indices.add(request[1]);
      indices.add(request[1] + 1);
    }
    const previewIndices = [...indices].sort((a, b) => a - b);
    const pairIndex = state.pairIndex ?? null;
    const sortedIndices = new Set(Array.from({ length: Math.min(n, PREVIEW) }, (_, index) => index));
    if (pairIndex !== null) sortedIndices.add(pairIndex);
    const vars = [{ name: "n", value: n }, { name: "requests", value: requests.length }];
    if (requestIndex !== null) vars.push({ name: "request", value: requestIndex },
      { name: "left", value: request[0] }, { name: "right", value: request[1] });
    if (activeIndex !== null) vars.push({ name: "i", value: activeIndex }, { name: "running", value: running });
    if (pairIndex !== null) vars.push({ name: "value", value: sortedNums[pairIndex] },
      { name: "count", value: sortedFrequency[pairIndex] });
    if (state.final || pairIndex !== null) vars.push({ name: "answer", value: answer });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [codeLine], vars, note,
      final: Boolean(state.final),
      permutation1589View: {
        phase, n, requestCount: requests.length, requestIndex, request,
        requests: requests.slice(0, 8).map((pair, index) => ({ index, left: pair[0], right: pair[1] })),
        cells: previewIndices.map((index) => ({
          index, value: index < n ? nums[index] : null, diff: diff[index],
          frequency: index < n && index <= prefixProcessed ? frequency[index] : null,
        })),
        activeIndex, pairIndex, sorted: !sortedNums ? [] : [...sortedIndices].sort((a, b) => a - b).map((index) => ({
          index, value: sortedNums ? sortedNums[index] : null,
          frequency: sortedFrequency ? sortedFrequency[index] : null,
        })),
        running, contribution: pairIndex === null ? null
          : sortedNums[pairIndex] * sortedFrequency[pairIndex],
        answer, truncated: requests.length > 24 || n > 30,
      },
    });
  }

  record("init", label("Tạo mảng hiệu", "Create difference array"), 5,
    label("diff có thêm một ô chặn để đánh dấu sau cuối đoạn.",
      "diff has one extra sentinel cell for the position just after a range."));
  for (let requestIndex = 0; requestIndex < requests.length; requestIndex++) {
    const [left, right] = requests[requestIndex];
    diff[left]++;
    if (requestIndex < 24) {
      record("range-start", label(`Yêu cầu ${requestIndex}: +1 tại ${left}`,
        `Request ${requestIndex}: +1 at ${left}`), 7,
      label("Bắt đầu phủ đoạn tại left.", "Start covering the range at left."),
      { requestIndex, index: left });
    }
    diff[right + 1]--;
    if (requestIndex < 24) {
      record("range-end", label(`Yêu cầu ${requestIndex}: -1 tại ${right + 1}`,
        `Request ${requestIndex}: -1 at ${right + 1}`), 8,
      label("Ngừng phủ ngay sau right; ô n là ô chặn, không thuộc nums.",
        "Stop covering after right; cell n is a sentinel outside nums."),
      { requestIndex, index: right + 1 });
    }
  }
  record("range-done", label("Đã đánh dấu tất cả đoạn", "All ranges marked"), 9,
    label("Lấy tổng tiền tố của diff để biết mỗi vị trí được dùng bao nhiêu lần.",
      "Prefix-sum diff to find how many requests use each position."));

  for (let index = 0; index < n; index++) {
    running += diff[index];
    frequency[index] = running;
    prefixProcessed = index;
    if (index < 30) {
      record("prefix", label(`Vị trí ${index} xuất hiện ${running} lần`,
        `Position ${index} is used ${running} times`), 13,
      label("Tần suất tại i là tổng diff[0..i].", "Frequency at i is the sum of diff[0..i]."),
      { index });
    }
  }
  sortedNums = [...nums].sort((a, b) => a - b);
  record("sort-values", label("Sắp nums tăng dần", "Sort nums ascending"), 14,
    label("Giữ số lớn cho vị trí có tần suất lớn.", "Reserve larger values for more frequently used positions."));
  sortedFrequency = [...frequency].sort((a, b) => a - b);
  record("sort-frequency", label("Sắp tần suất tăng dần", "Sort frequencies ascending"), 15,
    label("Ghép hai dãy cùng thứ tự là tối ưu theo bất đẳng thức hoán vị.",
      "Pairing the two sorted lists maximizes their dot product."));
  for (let index = 0; index < n; index++) {
    answer = (answer + sortedNums[index] * sortedFrequency[index]) % MOD;
    if (index < 30) {
      record("pair", label(`Ghép ${sortedNums[index]} × ${sortedFrequency[index]}`,
        `Pair ${sortedNums[index]} × ${sortedFrequency[index]}`), 18,
      label("Cộng đóng góp rồi lấy modulo 1 000 000 007.",
        "Add the contribution, then take modulo 1,000,000,007."), { pairIndex: index });
    }
  }
  record("done", label(`Đáp án: ${answer}`, `Answer: ${answer}`), 19,
    label("Mỗi phần tử lớn đã được ghép với một tần suất lớn tương ứng.",
      "Every large value has been paired with a correspondingly large frequency."), { final: true });
  return { original: nums, answer, steps };
}

module.exports = {
  1589: {
    id: 1589,
    difficulty: "medium",
    slug: "maximum-sum-obtained-of-any-permutation",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "prefix-sum", vi: "Tổng tiền tố", en: "Prefix Sum" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: label("Maximum Sum Obtained of Any Permutation", "Maximum Sum Obtained of Any Permutation"),
    titleVi: label("Tổng truy vấn lớn nhất sau hoán vị", "Maximum request sum after permutation"),
    statement: label(
      "Hoán vị nums sao cho tổng các đoạn requests [left,right] lớn nhất; trả kết quả modulo 1 000 000 007.",
      "Permute nums to maximize the total of all inclusive requests [left,right]; return it modulo 1,000,000,007."
    ),
    defaultInput: [1, 2, 3, 4, 5],
    inputKind: "nonneg",
    inputLabel: label("nums (0..100000)", "nums (0..100000)"),
    extraParams: [{ key: "requests", type: "string",
      label: label("requests (JSON, ví dụ [[1,3],[0,1]])", "requests (JSON, e.g. [[1,3],[0,1]])"),
      default: "[[1,3],[0,1]]" }],
    approach: [
      label("Với mỗi đoạn [l,r], cộng 1 tại diff[l] và trừ 1 tại diff[r+1].",
        "For each range [l,r], add 1 at diff[l] and subtract 1 at diff[r+1]."),
      label("Tổng tiền tố của diff cho biết mỗi chỉ số xuất hiện trong bao nhiêu truy vấn.",
        "The prefix sum of diff gives the number of requests covering each index."),
      label("Sắp tăng dần nums và các tần suất, nhân từng cặp rồi cộng modulo 1 000 000 007.",
        "Sort nums and frequencies ascending, multiply corresponding pairs, and sum modulo 1,000,000,007."),
    ],
    complexity: { time: "O(n log n + m)", space: "O(n)",
      note: label("n là số phần tử; m là số truy vấn. Trace chỉ hiển thị một phần đầu khi dữ liệu lớn.",
        "n is the array length and m is the request count. Large inputs show a shortened teaching trace.") },
    code: [
      "class Solution:",
      "    def maxSumRangeQuery(self, nums, requests):",
      "        MOD = 10**9 + 7",
      "        n = len(nums)",
      "        diff = [0] * (n + 1)",
      "        for left, right in requests:",
      "            diff[left] += 1",
      "            diff[right + 1] -= 1",
      "        frequency = [0] * n",
      "        running = 0",
      "        for i in range(n):",
      "            running += diff[i]",
      "            frequency[i] = running",
      "        nums.sort()",
      "        frequency.sort()",
      "        answer = 0",
      "        for value, count in zip(nums, frequency):",
      "            answer = (answer + value * count) % MOD",
      "        return answer",
    ],
    builder: buildSteps1589,
    liveArgs(input, params) {
      const nums = Array.isArray(input) ? input : [];
      const requests = parseRequests1589(params.requests);
      if (nums.length < 1 || requests.some(([left, right]) => left < 0 || left > right || right >= nums.length)) {
        throw new Error("invalid nums or request bounds");
      }
      return [nums, requests];
    },
  },
};
