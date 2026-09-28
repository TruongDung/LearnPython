// Focused array problem definitions extracted from array.js.
module.exports = {};

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

/**
 * LeetCode 3903: Smallest Stable Index I.
 * instability[i] = max(nums[0..i]) - min(nums[i..n-1])
 * Return the smallest i where instability[i] <= k.
 */
function buildSteps3903(nums, params) {
  const k = params && params.k !== undefined ? params.k : 3;
  const n = nums.length;
  const steps = [];
  const right = Array(n).fill(nums[n - 1]);
  const prefix = Array(n).fill(null);
  const gaps = Array(n).fill(null);
  let answer = -1;

  const snapshot = ({ phase, line, current = -1, suffixReadyFrom = n, prefixMax = null, gap = null, stable = null, final = false, title, note }) => {
    const suffixBuilt = phase === "suffix-init" ? [n - 1] : Array.from({ length: n - suffixReadyFrom }, (_, offset) => suffixReadyFrom + offset);
    steps.push({
      title,
      note,
      final,
      arr: [...nums],
      sub: right.map((value, index) => suffixBuilt.includes(index) ? value : "?"),
      highlight: current >= 0 ? [current] : [],
      mark: answer >= 0 ? [answer] : [],
      codeLines: [line],
      vars: [
        { name: "i", value: current >= 0 ? current : "-" },
        { name: "k", value: k },
        { name: "prefix max", value: prefixMax ?? "-" },
        { name: "suffix min", value: current >= 0 ? right[current] : "-" },
        { name: "gap", value: gap ?? "-" },
      ],
      stable3903View: {
        nums: [...nums], k, right: [...right], prefix: [...prefix], gaps: [...gaps],
        current, suffixReadyFrom, suffixBuilt, prefixMax, gap, stable, answer, phase,
      },
    });
  };

  snapshot({ phase: "size", line: 3, title: { vi: "n = len(nums)", en: "n = len(nums)" }, note: { vi: `Có ${n} vị trí; mỗi vị trí i sẽ so sánh max bên trái với min bên phải.`, en: `There are ${n} positions; each i compares the left maximum with the right minimum.` } });
  snapshot({ phase: "suffix-init", line: 4, current: n - 1, suffixReadyFrom: n - 1, title: { vi: "Khởi tạo suffix-min từ cuối mảng", en: "Seed suffix minimum from the last value" }, note: { vi: `right được tạo từ nums[-1]=${nums[n - 1]}; chỉ right[${n - 1}] đã là suffix-min hoàn chỉnh.`, en: `right is seeded with nums[-1]=${nums[n - 1]}; only right[${n - 1}] is already a final suffix minimum.` } });
  for (let i = n - 2; i >= 0; i--) {
    snapshot({ phase: "suffix-loop", line: 5, current: i, suffixReadyFrom: i + 1, title: { vi: `Duyệt suffix tại i = ${i}`, en: `Visit suffix index i = ${i}` }, note: { vi: `So sánh nums[${i}] với suffix-min đã biết ở right[${i + 1}].`, en: `Compare nums[${i}] with the known suffix minimum right[${i + 1}].` } });
    right[i] = Math.min(right[i + 1], nums[i]);
    snapshot({ phase: "suffix-write", line: 6, current: i, suffixReadyFrom: i, title: { vi: `right[${i}] = ${right[i]}`, en: `right[${i}] = ${right[i]}` }, note: { vi: `min(${nums[i]}, ${right[i + 1]}) = ${right[i]}. Đây là min của nums[${i}..${n - 1}].`, en: `min(${nums[i]}, ${right[i + 1]}) = ${right[i]}. This is the minimum of nums[${i}..${n - 1}].` } });
  }

  let prefixMax = 0;
  snapshot({ phase: "prefix-init", line: 7, prefixMax, title: { vi: "left = 0", en: "left = 0" }, note: { vi: "Bắt đầu quét từ trái; left sẽ luôn là max của đoạn đã đi qua.", en: "Start the left-to-right scan; left will always be the maximum of the visited prefix." } });
  for (let i = 0; i < n; i++) {
    snapshot({ phase: "forward-loop", line: 8, current: i, suffixReadyFrom: 0, prefixMax, title: { vi: `Duyệt i = ${i}`, en: `Visit i = ${i}` }, note: { vi: `Chuẩn bị mở rộng prefix bằng nums[${i}]=${nums[i]}.`, en: `Prepare to extend the prefix with nums[${i}]=${nums[i]}.` } });
    prefixMax = Math.max(prefixMax, nums[i]);
    prefix[i] = prefixMax;
    snapshot({ phase: "prefix-write", line: 9, current: i, suffixReadyFrom: 0, prefixMax, title: { vi: `left = max(left, ${nums[i]}) = ${prefixMax}`, en: `left = max(left, ${nums[i]}) = ${prefixMax}` }, note: { vi: `max(nums[0..${i}]) = ${prefixMax}.`, en: `max(nums[0..${i}]) = ${prefixMax}.` } });
    const gap = prefixMax - right[i];
    gaps[i] = gap;
    const stable = gap <= k;
    snapshot({ phase: "check", line: 10, current: i, suffixReadyFrom: 0, prefixMax, gap, stable, title: { vi: `${gap} ${stable ? "≤" : ">"} ${k}`, en: `${gap} ${stable ? "≤" : ">"} ${k}` }, note: { vi: `instability[${i}] = max(nums[0..${i}]) − min(nums[${i}..${n - 1}]) = ${prefixMax} − ${right[i]} = ${gap}.`, en: `instability[${i}] = max(nums[0..${i}]) − min(nums[${i}..${n - 1}]) = ${prefixMax} − ${right[i]} = ${gap}.` } });
    if (stable) {
      answer = i;
      snapshot({ phase: "found", line: 11, current: i, suffixReadyFrom: 0, prefixMax, gap, stable: true, final: true, title: { vi: `return ${i}`, en: `return ${i}` }, note: { vi: `Đây là i đầu tiên có instability ≤ k, nên là đáp án nhỏ nhất.`, en: `This is the first i with instability ≤ k, so it is the smallest answer.` } });
      break;
    }
  }
  if (answer === -1) snapshot({ phase: "not-found", line: 12, suffixReadyFrom: 0, prefixMax, final: true, title: { vi: "return -1", en: "return -1" }, note: { vi: `Không có index nào có instability ≤ ${k}.`, en: `No index has instability ≤ ${k}.` } });
  return { original: [...nums], answer, steps };
}

Object.assign(module.exports, {
  3903: {
    id: 3903,
    difficulty: "easy",
    slug: "smallest-stable-index-i",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Smallest Stable Index I", en: "Smallest Stable Index I" },
    titleVi: { vi: "Chỉ số ổn định nhỏ nhất I", en: "Smallest stable index I" },
    statement: {
      vi: "Với mỗi chỉ số i, định nghĩa instability[i] = max(nums[0..i]) − min(nums[i..n−1]). Trả về chỉ số nhỏ nhất i mà instability[i] ≤ k. Nếu không tồn tại, trả về −1.",
      en: "For each index i, define instability[i] = max(nums[0..i]) − min(nums[i..n−1]). Return the smallest i such that instability[i] ≤ k. If none exists, return −1.",
    },
    defaultInput: [5, 0, 1, 4],
    inputKind: "nonneg",
    extraParams: [
      {
        key: "k",
        label: { vi: "Ngưỡng k", en: "Threshold k" },
        default: 3,
        min: 0,
      },
    ],
    approach: [
      { vi: "Precompute right[i] = min(nums[i..n−1]) bằng cách duyệt từ phải sang trái.", en: "Precompute right[i] = min(nums[i..n−1]) by traversing right-to-left." },
      { vi: "Duyệt từ trái, duy trì prefixMax. Tính instability = prefixMax − right[i].", en: "Sweep left, maintaining prefixMax. Compute instability = prefixMax − right[i]." },
      { vi: "Trả về chỉ số đầu tiên có instability ≤ k, hoặc −1.", en: "Return the first index with instability ≤ k, or −1." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Một lần duyệt để tính suffix-min, một lần duyệt để tìm kết quả. O(n) bộ nhớ cho mảng right[].",
        en: "One pass to build suffix-min, one pass to find the answer. O(n) space for the right[] array.",
      },
    },
    code: [
      "class Solution:",
      "    def firstStableIndex(self, nums, k):",
      "        n = len(nums)",
      "        right = [nums[-1]] * n",
      "        for i in range(n - 2, -1, -1):",
      "            right[i] = min(right[i + 1], nums[i])",
      "        left = 0",
      "        for i, x in enumerate(nums):",
      "            left = max(left, x)",
      "            if left - right[i] <= k:",
      "                return i",
      "        return -1",
    ],
    builder: buildSteps3903,
  },
});

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


// ─── 3483: Unique 3-Digit Even Numbers ───
function parseDigits3483(input) {
  const digits = Array.isArray(input)
    ? input.map(Number)
    : String(input ?? "").split(",").map((value) => Number(value.trim()));
  if (digits.length < 3 || digits.length > 10) {
    throw new Error("digits must contain between 3 and 10 values.");
  }
  if (!digits.every((digit) => Number.isInteger(digit) && digit >= 0 && digit <= 9)) {
    throw new Error("Every value in digits must be an integer between 0 and 9.");
  }
  return digits;
}

function buildSteps3483(input) {
  const digits = parseDigits3483(input);
  const numbers = new Set();
  const steps = [];
  let attempts = 0;
  let evenCandidates = 0;
  let duplicateCandidates = 0;

  function addStep({
    event,
    phaseIndex,
    title,
    note,
    codeLines,
    i = -1,
    j = -1,
    k = -1,
    candidate = null,
    decision = "choose",
    reason = "",
    final = false,
  }) {
    const selected = [i, j, k].filter((index) => Number.isInteger(index) && index >= 0);
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    steps.push({
      title,
      note,
      final,
      arr: [...digits],
      sub: digits.map((_, index) => `i=${index}`),
      highlight: selected,
      mark: [],
      codeLines,
      vars: [
        { name: "hundreds", value: i >= 0 ? digits[i] : "—" },
        { name: "tens", value: j >= 0 ? digits[j] : "—" },
        { name: "ones", value: k >= 0 ? digits[k] : "—" },
        { name: "candidate", value: candidate ?? "—" },
        { name: "distinct", value: numbers.size },
      ],
      uniqueEven3483View: {
        event,
        phaseIndex,
        digits: [...digits],
        i,
        j,
        k,
        candidate,
        decision,
        reason,
        attempts,
        evenCandidates,
        duplicateCandidates,
        numbers: sortedNumbers,
        final,
      },
    });
  }

  addStep({
    event: "intro",
    phaseIndex: 0,
    decision: "intro",
    title: { vi: "Chọn ba digit ở ba index khác nhau", en: "Choose three digits from three different indices" },
    note: {
      vi: "Hàng trăm không được là 0, hàng đơn vị phải chẵn, và set loại các số bị tạo lặp lại.",
      en: "The hundreds digit cannot be 0, the ones digit must be even, and a set removes repeated numbers.",
    },
    codeLines: [3],
  });

  for (let i = 0; i < digits.length; i += 1) {
    if (digits[i] === 0) {
      addStep({
        event: "reject-leading-zero",
        phaseIndex: 0,
        i,
        decision: "reject",
        reason: "leading-zero",
        title: { vi: `Bỏ digits[${i}] = 0 ở hàng trăm`, en: `Reject digits[${i}] = 0 in the hundreds place` },
        note: { vi: "Số có ba chữ số không thể bắt đầu bằng 0.", en: "A three-digit number cannot start with 0." },
        codeLines: [5],
      });
      continue;
    }

    addStep({
      event: "choose-hundreds",
      phaseIndex: 0,
      i,
      decision: "choose",
      title: { vi: `Chọn ${digits[i]} làm hàng trăm`, en: `Choose ${digits[i]} for the hundreds place` },
      note: { vi: `Khóa index ${i}; hai vị trí sau phải dùng index khác.`, en: `Lock index ${i}; the next two places must use different indices.` },
      codeLines: [4],
    });

    for (let j = 0; j < digits.length; j += 1) {
      if (j === i) continue;
      addStep({
        event: "choose-tens",
        phaseIndex: 1,
        i,
        j,
        decision: "choose",
        title: { vi: `Chọn ${digits[j]} làm hàng chục`, en: `Choose ${digits[j]} for the tens place` },
        note: { vi: `Đã dùng index ${i} và ${j}; hàng đơn vị phải lấy index còn lại.`, en: `Indices ${i} and ${j} are used; the ones place must use another index.` },
        codeLines: [6],
      });

      for (let k = 0; k < digits.length; k += 1) {
        if (k === i || k === j) continue;
        attempts += 1;
        if (digits[k] % 2 !== 0) {
          addStep({
            event: "reject-odd-ones",
            phaseIndex: 2,
            i,
            j,
            k,
            decision: "reject",
            reason: "odd-ones",
            title: { vi: `Bỏ hàng đơn vị ${digits[k]} vì là số lẻ`, en: `Reject odd ones digit ${digits[k]}` },
            note: { vi: "Một số chẵn bắt buộc kết thúc bằng 0, 2, 4, 6 hoặc 8.", en: "An even number must end in 0, 2, 4, 6, or 8." },
            codeLines: [9],
          });
          continue;
        }

        evenCandidates += 1;
        const candidate = digits[i] * 100 + digits[j] * 10 + digits[k];
        const isDuplicate = numbers.has(candidate);
        if (isDuplicate) duplicateCandidates += 1;
        else numbers.add(candidate);
        addStep({
          event: isDuplicate ? "duplicate" : "add-number",
          phaseIndex: 3,
          i,
          j,
          k,
          candidate,
          decision: isDuplicate ? "duplicate" : "add",
          reason: isDuplicate ? "already-in-set" : "new-number",
          title: isDuplicate
            ? { vi: `${candidate} đã có trong set`, en: `${candidate} is already in the set` }
            : { vi: `Thêm ${candidate} vào set`, en: `Add ${candidate} to the set` },
          note: isDuplicate
            ? { vi: "Các index khác nhau vẫn có thể tạo cùng một số khi input chứa digit lặp.", en: "Different indices can still form the same number when the input contains repeated digits." }
            : { vi: `${digits[i]}×100 + ${digits[j]}×10 + ${digits[k]} = ${candidate}; đây là số chẵn ba chữ số mới.`, en: `${digits[i]}×100 + ${digits[j]}×10 + ${digits[k]} = ${candidate}; this is a new three-digit even number.` },
          codeLines: [10],
        });
      }
    }
  }

  addStep({
    event: "done",
    phaseIndex: 4,
    decision: "done",
    final: true,
    title: { vi: `Có ${numbers.size} số chẵn khác nhau`, en: `${numbers.size} distinct even numbers` },
    note: {
      vi: `Set chứa ${numbers.size} số hợp lệ; kích thước của set chính là đáp án.`,
      en: `The set contains ${numbers.size} valid numbers; its size is the answer.`,
    },
    codeLines: [11],
  });

  return { original: [...digits], answer: numbers.size, numbers: [...numbers].sort((a, b) => a - b), steps };
}

Object.assign(module.exports, {
  3483: {
    id: 3483,
    difficulty: "easy",
    slug: "unique-3-digit-even-numbers",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "hash-set", vi: "Hash Set", en: "Hash Set" },
      { key: "enumeration", vi: "Liệt kê", en: "Enumeration" },
    ],
    title: { vi: "Unique 3-Digit Even Numbers", en: "Unique 3-Digit Even Numbers" },
    titleVi: { vi: "Đếm các số chẵn 3 chữ số phân biệt", en: "Unique three-digit even numbers" },
    statement: {
      vi: "Cho mảng digits. Đếm có bao nhiêu số chẵn ba chữ số phân biệt có thể tạo ra. Mỗi bản sao của một digit chỉ được dùng một lần trong mỗi số và không được có số 0 ở đầu.",
      en: "Given digits, count the distinct three-digit even numbers that can be formed. Each copy of a digit may be used only once per number, and leading zeros are not allowed.",
    },
    defaultInput: [1, 2, 3, 4],
    inputKind: "nonneg",
    inputLabel: { vi: "digits (3 đến 10 chữ số, mỗi số từ 0 đến 9)", en: "digits (3 to 10 values, each from 0 to 9)" },
    extraParams: [],
    approach: [
      { vi: "Dùng ba vòng lặp để chọn ba index khác nhau cho hàng trăm, hàng chục và hàng đơn vị.", en: "Use three loops to select distinct indices for the hundreds, tens, and ones places." },
      { vi: "Bỏ hàng trăm bằng 0 và hàng đơn vị lẻ; các lựa chọn còn lại luôn tạo số chẵn có ba chữ số.", en: "Reject a zero hundreds digit and an odd ones digit; every remaining choice forms a three-digit even number." },
      { vi: "Thêm số tạo được vào set để tự động loại kết quả trùng khi digits chứa nhiều bản sao giống nhau.", en: "Insert each formed number into a set to remove duplicates caused by repeated digits." },
    ],
    complexity: {
      time: "O(n³)",
      space: "O(u)",
      note: {
        vi: "n ≤ 10 và u là số kết quả khác nhau; có nhiều nhất 450 số chẵn có ba chữ số.",
        en: "n ≤ 10 and u is the number of distinct results; at most 450 three-digit even numbers exist.",
      },
    },
    code: [
      "class Solution:",
      "    def totalNumbers(self, digits):",
      "        numbers = set()",
      "        for i in range(len(digits)):",
      "            if digits[i] == 0: continue",
      "            for j in range(len(digits)):",
      "                if j == i: continue",
      "                for k in range(len(digits)):",
      "                    if k == i or k == j or digits[k] % 2: continue",
      "                    numbers.add(100 * digits[i] + 10 * digits[j] + digits[k])",
      "        return len(numbers)",
    ],
    liveArgs: (input) => [parseDigits3483(input)],
    builder: buildSteps3483,
  },
});
