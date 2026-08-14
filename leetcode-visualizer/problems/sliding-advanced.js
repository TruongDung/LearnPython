// Advanced Sliding Window visualizations: exact-K, complete windows, and max frequency.

function range(start, end) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, offset) => start + offset);
}

function makeStep(nums, opts) {
  return {
    title: opts.title,
    arr: [...nums],
    sub: nums.map((_, index) => `[${index}]`),
    highlight: opts.highlight || [],
    mark: opts.mark || [],
    final: Boolean(opts.final),
    codeLines: [opts.line],
    vars: opts.vars || [],
    note: opts.note,
    ...(opts.slidingFreqView ? { slidingFreqView: opts.slidingFreqView } : {}),
  };
}

function mapText(map) {
  const entries = [...map.entries()];
  return entries.length ? `{${entries.map(([key, value]) => `${key}:${value}`).join(", ")}}` : "{}";
}

function buildSteps992(input, params) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const k = Number(params?.k ?? 2);
  if (!Number.isInteger(k) || k < 1) throw new Error("k must be a positive integer");
  const steps = [];
  const freqK = new Map(); const freqKm1 = new Map();
  let leftK = 0; let leftKm1 = 0; let ans = 0;
  const snap = (title, line, right = -1, note, extra = {}) => steps.push(makeStep(nums, {
    title, line, highlight: range(leftK, right), mark: range(leftKm1, right), note,
    vars: [{ name: "k", value: k }, { name: "leftK", value: leftK }, { name: "leftK-1", value: leftKm1 }, { name: "freqK", value: mapText(freqK) }, { name: "freqK-1", value: mapText(freqKm1) }, { name: "ans", value: ans }, ...(extra.vars || [])],
    final: extra.final,
  }));
  snap({ vi: "Khởi tạo hai frequency maps", en: "Initialize two frequency maps" }, 3, -1, { vi: "Ta tính exactly K = atMost(K) − atMost(K−1) trong cùng một lượt quét.", en: "Compute exactly K as atMost(K) − atMost(K−1) in one pass." });
  snap({ vi: "leftK = leftK-1 = ans = 0", en: "leftK = leftK-1 = ans = 0" }, 4, -1, { vi: "Hai biên trái quản lý hai cửa sổ khác nhau.", en: "Two left boundaries manage two different windows." });
  for (let right = 0; right < nums.length; right++) {
    const value = nums[right];
    snap({ vi: `Xét nums[${right}] = ${value}`, en: `Inspect nums[${right}] = ${value}` }, 5, right, { vi: "Mở rộng cả hai cửa sổ.", en: "Expand both windows." });
    freqK.set(value, (freqK.get(value) || 0) + 1); freqKm1.set(value, (freqKm1.get(value) || 0) + 1);
    snap({ vi: `Thêm ${value} vào freqK và freqK-1`, en: `Add ${value} to freqK and freqK-1` }, 6, right, { vi: "Cập nhật đếm của hai cửa sổ atMost.", en: "Update counts for both atMost windows." });
    while (freqK.size > k) {
      snap({ vi: `len(freqK)=${freqK.size} > ${k} → thu hẹp`, en: `len(freqK)=${freqK.size} > ${k} → shrink` }, 7, right, { vi: "Cửa sổ K có quá nhiều giá trị distinct.", en: "The K window has too many distinct values." });
      const removed = nums[leftK]; freqK.set(removed, freqK.get(removed) - 1); if (freqK.get(removed) === 0) freqK.delete(removed); leftK++;
      snap({ vi: `Bỏ ${removed}, leftK → ${leftK}`, en: `Remove ${removed}, leftK → ${leftK}` }, 8, right, { vi: "Đưa cửa sổ về tối đa K distinct.", en: "Restore at most K distinct values." });
    }
    while (freqKm1.size > k - 1) {
      snap({ vi: `len(freqK-1)=${freqKm1.size} > ${k - 1} → thu hẹp`, en: `len(freqK-1)=${freqKm1.size} > ${k - 1} → shrink` }, 9, right, { vi: "Cửa sổ K−1 cần giữ tối đa K−1 distinct.", en: "The K−1 window must keep at most K−1 distinct values." });
      const removed = nums[leftKm1]; freqKm1.set(removed, freqKm1.get(removed) - 1); if (freqKm1.get(removed) === 0) freqKm1.delete(removed); leftKm1++;
      snap({ vi: `Bỏ ${removed}, leftK-1 → ${leftKm1}`, en: `Remove ${removed}, leftK-1 → ${leftKm1}` }, 10, right, { vi: "Mọi start trong [leftK..leftK-1) tạo đúng K distinct.", en: "Every start in [leftK..leftK-1) creates exactly K distinct values." });
    }
    const added = leftKm1 - leftK; ans += added;
    snap({ vi: `ans += leftK-1 - leftK = ${added} → ${ans}`, en: `ans += leftK-1 - leftK = ${added} → ${ans}` }, 11, right, { vi: "Cộng số subarray kết thúc tại right có đúng K giá trị distinct.", en: "Add the number of exactly-K subarrays ending at right." }, { vars: [{ name: "new exact-K subarrays", value: added }] });
  }
  snap({ vi: `return ans → ${ans}`, en: `return ans → ${ans}` }, 12, nums.length - 1, { vi: "Tổng số subarray có đúng K giá trị distinct.", en: "Total number of subarrays with exactly K distinct values." }, { final: true });
  return { original: nums, k, answer: ans, steps };
}

function buildStepsPrefixExact(input, params, config) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const target = Number(params?.[config.param] ?? config.defaultTarget);
  if (!Number.isInteger(target) || target < 0) throw new Error(`${config.param} must be a non-negative integer`);
  const steps = []; const freq = new Map([[0, 1]]); let prefix = 0; let ans = 0;
  const snap = (title, line, right = -1, note, extra = {}) => steps.push(makeStep(nums, {
    title, line, highlight: range(0, right), mark: extra.mark || [], note, final: extra.final,
    vars: [{ name: config.param, value: target }, { name: "prefix", value: prefix }, { name: "need", value: extra.need ?? "-" }, { name: "prefixFreq", value: mapText(freq) }, { name: "ans", value: ans }, ...(extra.vars || [])],
  }));
  snap({ vi: "prefixFreq = {0: 1}", en: "prefixFreq = {0: 1}" }, 3, -1, { vi: "Prefix sum 0 xuất hiện một lần trước mảng.", en: "Prefix sum 0 appears once before the array." });
  snap({ vi: "prefix = ans = 0", en: "prefix = ans = 0" }, 4, -1, { vi: "Mỗi prefix hiện tại sẽ tìm prefix cũ cách target.", en: "Each current prefix looks for an earlier prefix target away." });
  for (let right = 0; right < nums.length; right++) {
    const value = nums[right];
    snap({ vi: `Xét nums[${right}] = ${value}`, en: `Inspect nums[${right}] = ${value}` }, 5, right, { vi: "Mở rộng prefix tới phần tử hiện tại.", en: "Extend the prefix to the current item." });
    const contribution = config.contribution(value); prefix += contribution;
    snap({ vi: `prefix += ${config.expression(value)} → ${prefix}`, en: `prefix += ${config.expression(value)} → ${prefix}` }, 6, right, { vi: config.viContribution, en: config.enContribution });
    const need = prefix - target;
    snap({ vi: `need = prefix - target = ${need}`, en: `need = prefix - target = ${need}` }, 7, right, { vi: "Mọi prefix cũ bằng need sẽ tạo một subarray hợp lệ kết thúc ở right.", en: "Every earlier prefix equal to need forms a valid subarray ending at right." }, { need });
    const found = freq.get(need) || 0; ans += found;
    snap({ vi: `ans += freq[${need}] = ${found} → ${ans}`, en: `ans += freq[${need}] = ${found} → ${ans}` }, 8, right, { vi: "Cộng số prefix phù hợp đã gặp.", en: "Add the number of matching prefixes seen so far." }, { need, vars: [{ name: "new subarrays", value: found }] });
    freq.set(prefix, (freq.get(prefix) || 0) + 1);
    snap({ vi: `prefixFreq[${prefix}] += 1`, en: `prefixFreq[${prefix}] += 1` }, 9, right, { vi: "Lưu prefix hiện tại cho các vị trí sau.", en: "Store the current prefix for later positions." }, { need });
  }
  snap({ vi: `return ans → ${ans}`, en: `return ans → ${ans}` }, 10, nums.length - 1, { vi: "Đếm xong mọi subarray có tổng điều kiện đúng target.", en: "All subarrays satisfying the target condition are counted." }, { final: true });
  return { original: nums, [config.param]: target, answer: ans, steps };
}

function buildSteps1248(input, params) {
  return buildStepsPrefixExact(input, params, {
    param: "k", defaultTarget: 3, contribution: (value) => Math.abs(value) % 2, expression: (value) => `${value} % 2`,
    viContribution: "Chỉ số lẻ đóng góp 1, số chẵn đóng góp 0 vào prefix.", enContribution: "Odd numbers contribute 1 and even numbers contribute 0 to the prefix.",
  });
}

function buildSteps930(input, params) {
  return buildStepsPrefixExact(input, params, {
    param: "goal", defaultTarget: 2, contribution: (value) => value, expression: (value) => String(value),
    viContribution: "Mảng nhị phân nên prefix chính là tổng số bit 1 đã gặp.", enContribution: "For a binary array, the prefix is the number of 1 bits seen so far.",
  });
}

function buildSteps2799(input) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const target = new Set(nums).size; const freq = new Map(); const steps = []; let left = 0; let ans = 0;
  const view = (right, final = false) => ({ nums: [...nums], label: "nums", left, right, window: range(left, right), best: [], freq: Object.fromEntries(freq), k: target, mode: "distinct", ans, done: final });
  const snap = (title, line, right = -1, note, extra = {}) => steps.push(makeStep(nums, { title, line, highlight: range(left, right), mark: extra.mark || [], note, final: extra.final, slidingFreqView: view(right, extra.final), vars: [{ name: "all distinct types", value: target }, { name: "left", value: left }, { name: "right", value: right >= 0 ? right : "-" }, { name: "freq", value: mapText(freq) }, { name: "ans", value: ans }, ...(extra.vars || [])] }));
  snap({ vi: `target = len(set(nums)) = ${target}`, en: `target = len(set(nums)) = ${target}` }, 3, -1, { vi: "Một complete subarray phải chứa đủ mọi loại số của toàn mảng.", en: "A complete subarray contains every value type in the whole array." });
  snap({ vi: "freq = {}, left = ans = 0", en: "freq = {}, left = ans = 0" }, 4, -1, { vi: "Khởi tạo cửa sổ trượt.", en: "Initialize the sliding window." });
  for (let right = 0; right < nums.length; right++) {
    const value = nums[right]; snap({ vi: `Xét nums[${right}] = ${value}`, en: `Inspect nums[${right}] = ${value}` }, 5, right, { vi: "Mở rộng right.", en: "Expand right." });
    freq.set(value, (freq.get(value) || 0) + 1); snap({ vi: `freq[${value}] += 1`, en: `freq[${value}] += 1` }, 6, right, { vi: "Ghi nhận loại số trong cửa sổ.", en: "Record the value type in the window." });
    while (freq.size === target) {
      snap({ vi: `len(freq) == target == ${target} → complete`, en: `len(freq) == target == ${target} → complete` }, 7, right, { vi: "Cửa sổ hiện tại đã complete.", en: "The current window is complete." });
      const added = nums.length - right; ans += added; snap({ vi: `ans += n - right = ${added} → ${ans}`, en: `ans += n - right = ${added} → ${ans}` }, 8, right, { vi: "Mọi điểm kết thúc từ right tới n−1 đều vẫn complete.", en: "Every ending position from right through n−1 remains complete." }, { vars: [{ name: "new complete subarrays", value: added }] });
      const removed = nums[left]; freq.set(removed, freq.get(removed) - 1); if (freq.get(removed) === 0) freq.delete(removed); left++; snap({ vi: `Bỏ ${removed}, left → ${left}`, en: `Remove ${removed}, left → ${left}` }, 9, right, { vi: "Thu hẹp để tìm complete window ngắn hơn.", en: "Shrink to find a shorter complete window." });
    }
  }
  snap({ vi: `return ans → ${ans}`, en: `return ans → ${ans}` }, 10, nums.length - 1, { vi: "Tổng số complete subarrays.", en: "Total number of complete subarrays." }, { final: true });
  return { original: nums, answer: ans, steps };
}

function buildSteps2962(input, params) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const k = Number(params?.k ?? 2);
  if (!Number.isInteger(k) || k < 1) throw new Error("k must be a positive integer");
  const maxValue = Math.max(...nums); const steps = []; let left = 0; let countMax = 0; let ans = 0;
  const view = (right, final = false, overLimit = false) => ({ nums: [...nums], label: "nums", left, right, window: range(left, right), best: [], freq: { [maxValue]: countMax }, k, mode: "frequency", activeValue: maxValue, overLimit, ans, done: final });
  const snap = (title, line, right = -1, note, extra = {}) => steps.push(makeStep(nums, { title, line, highlight: range(left, right), mark: extra.mark || [], note, final: extra.final, slidingFreqView: view(right, extra.final, extra.overLimit), vars: [{ name: "maxValue", value: maxValue }, { name: "k", value: k }, { name: "left", value: left }, { name: "right", value: right >= 0 ? right : "-" }, { name: "countMax", value: countMax }, { name: "ans", value: ans }, ...(extra.vars || [])] }));
  snap({ vi: `maxValue = ${maxValue}`, en: `maxValue = ${maxValue}` }, 3, -1, { vi: "Mọi subarray cần chứa giá trị lớn nhất này ít nhất k lần.", en: "Every subarray must contain this maximum value at least k times." });
  snap({ vi: "left = countMax = ans = 0", en: "left = countMax = ans = 0" }, 4, -1, { vi: "Khởi tạo cửa sổ.", en: "Initialize the window." });
  for (let right = 0; right < nums.length; right++) {
    const value = nums[right]; snap({ vi: `Xét nums[${right}] = ${value}`, en: `Inspect nums[${right}] = ${value}` }, 5, right, { vi: "Mở rộng right.", en: "Expand right." });
    if (value === maxValue) { countMax++; snap({ vi: `nums[right] == maxValue → countMax = ${countMax}`, en: `nums[right] == maxValue → countMax = ${countMax}` }, 6, right, { vi: "Tăng số lần xuất hiện của maxValue trong cửa sổ.", en: "Increase the number of maxValue occurrences in the window." }, { overLimit: countMax >= k }); }
    while (countMax >= k) {
      snap({ vi: `countMax=${countMax} ≥ k=${k} → hợp lệ`, en: `countMax=${countMax} ≥ k=${k} → valid` }, 7, right, { vi: "Cửa sổ hiện tại chứa đủ maxValue.", en: "The current window contains enough maxValue values." }, { overLimit: true });
      const added = nums.length - right; ans += added; snap({ vi: `ans += n - right = ${added} → ${ans}`, en: `ans += n - right = ${added} → ${ans}` }, 8, right, { vi: "Mọi endpoint từ right tới cuối mảng đều hợp lệ.", en: "Every endpoint from right through the end is valid." }, { vars: [{ name: "new valid subarrays", value: added }], overLimit: true });
      if (nums[left] === maxValue) countMax--; snap({ vi: `Nếu nums[left] là max, countMax → ${countMax}`, en: `If nums[left] is max, countMax → ${countMax}` }, 9, right, { vi: "Chuẩn bị thu hẹp cạnh trái.", en: "Prepare to shrink the left edge." });
      left++; snap({ vi: `left += 1 → ${left}`, en: `left += 1 → ${left}` }, 10, right, { vi: "Tìm start tiếp theo vẫn hợp lệ.", en: "Find the next valid start." });
    }
  }
  snap({ vi: `return ans → ${ans}`, en: `return ans → ${ans}` }, 11, nums.length - 1, { vi: "Tổng số subarray có maxValue xuất hiện ít nhất k lần.", en: "Total subarrays where maxValue appears at least k times." }, { final: true });
  return { original: nums, k, answer: ans, steps };
}

const category = { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" };
const arrayTag = [{ key: "array", vi: "Mảng", en: "Array" }];

module.exports = {
  992: { id: 992, difficulty: "hard", slug: "subarrays-with-k-different-integers", category, tags: arrayTag, title: { vi: "Subarrays with K Different Integers", en: "Subarrays with K Different Integers" }, titleVi: { vi: "Subarray có đúng K giá trị khác nhau", en: "Subarrays with exactly K distinct integers" }, statement: { vi: "Đếm subarray có đúng k số nguyên phân biệt.", en: "Count subarrays containing exactly k distinct integers." }, defaultInput: [1, 2, 1, 2, 3], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [{ key: "k", label: { vi: "k (số distinct chính xác)", en: "k (exact distinct count)" }, default: 2 }], complexity: { time: "O(n)", space: "O(n)", note: { vi: "Duy trì hai cửa sổ atMost(K) và atMost(K−1).", en: "Maintain atMost(K) and atMost(K−1) windows." } }, code: ["class Solution:", "    def subarraysWithKDistinct(self, nums, k):", "        freq_k = {}; freq_km1 = {}", "        left_k = left_km1 = ans = 0", "        for right, num in enumerate(nums):", "            freq_k[num] += 1; freq_km1[num] += 1", "            while len(freq_k) > k:", "                remove_from(freq_k, left_k)", "            while len(freq_km1) > k - 1:", "                remove_from(freq_km1, left_km1)", "            ans += left_km1 - left_k", "        return ans"], builder: buildSteps992 },
  1248: { id: 1248, difficulty: "medium", slug: "count-number-of-nice-subarrays", category, tags: arrayTag, title: { vi: "Count Number of Nice Subarrays", en: "Count Number of Nice Subarrays" }, titleVi: { vi: "Đếm subarray có đúng K số lẻ", en: "Count subarrays with exactly K odd numbers" }, statement: { vi: "Đếm subarray có đúng k số lẻ.", en: "Count subarrays containing exactly k odd numbers." }, defaultInput: [1, 1, 2, 1, 1], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [{ key: "k", label: { vi: "k (số lẻ chính xác)", en: "k (exact odd count)" }, default: 3 }], complexity: { time: "O(n)", space: "O(n)", note: { vi: "Prefix đếm số lẻ và frequency map.", en: "Odd-count prefix sums with a frequency map." } }, code: ["class Solution:", "    def numberOfSubarrays(self, nums, k):", "        prefix_freq = {0: 1}", "        prefix = ans = 0", "        for right, num in enumerate(nums):", "            prefix += num % 2", "            need = prefix - k", "            ans += prefix_freq.get(need, 0)", "            prefix_freq[prefix] = prefix_freq.get(prefix, 0) + 1", "        return ans"], builder: buildSteps1248 },
  930: { id: 930, difficulty: "medium", slug: "binary-subarrays-with-sum", category, tags: arrayTag, title: { vi: "Binary Subarrays With Sum", en: "Binary Subarrays With Sum" }, titleVi: { vi: "Đếm subarray nhị phân có tổng bằng Goal", en: "Binary subarrays with sum Goal" }, statement: { vi: "Đếm subarray trong mảng nhị phân có tổng đúng goal.", en: "Count binary subarrays whose sum equals goal." }, defaultInput: [1, 0, 1, 0, 1], inputKind: "binary", inputLabel: { vi: "nums (0 hoặc 1)", en: "nums (0 or 1)" }, extraParams: [{ key: "goal", label: { vi: "goal (tổng chính xác)", en: "goal (exact sum)" }, default: 2 }], complexity: { time: "O(n)", space: "O(n)", note: { vi: "Prefix sum và frequency map.", en: "Prefix sums and a frequency map." } }, code: ["class Solution:", "    def numSubarraysWithSum(self, nums, goal):", "        prefix_freq = {0: 1}", "        prefix = ans = 0", "        for right, num in enumerate(nums):", "            prefix += num", "            need = prefix - goal", "            ans += prefix_freq.get(need, 0)", "            prefix_freq[prefix] = prefix_freq.get(prefix, 0) + 1", "        return ans"], builder: buildSteps930 },
  2799: { id: 2799, difficulty: "medium", slug: "count-complete-subarrays-in-an-array", category, tags: arrayTag, title: { vi: "Count Complete Subarrays in an Array", en: "Count Complete Subarrays in an Array" }, titleVi: { vi: "Đếm complete subarray", en: "Count complete subarrays" }, statement: { vi: "Đếm subarray chứa mọi giá trị distinct xuất hiện trong toàn mảng.", en: "Count subarrays containing every distinct value from the full array." }, defaultInput: [1, 3, 1, 2, 2], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [], complexity: { time: "O(n)", space: "O(n)", note: { vi: "Cửa sổ trượt với frequency map.", en: "Sliding window with a frequency map." } }, code: ["class Solution:", "    def countCompleteSubarrays(self, nums):", "        target = len(set(nums))", "        freq = {}; left = ans = 0", "        for right, num in enumerate(nums):", "            freq[num] = freq.get(num, 0) + 1", "            while len(freq) == target:", "                ans += len(nums) - right", "                remove_from(freq, left); left += 1", "        return ans"], builder: buildSteps2799 },
  2962: { id: 2962, difficulty: "medium", slug: "count-subarrays-where-max-element-appears-at-least-k-times", category, tags: arrayTag, title: { vi: "Count Subarrays Where Max Element Appears at Least K Times", en: "Count Subarrays Where Max Element Appears at Least K Times" }, titleVi: { vi: "Đếm subarray có phần tử lớn nhất xuất hiện ít nhất K lần", en: "Count subarrays where the maximum appears at least K times" }, statement: { vi: "Đếm subarray mà giá trị lớn nhất của toàn mảng xuất hiện ít nhất k lần.", en: "Count subarrays in which the global maximum appears at least k times." }, defaultInput: [1, 3, 2, 3, 3], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [{ key: "k", label: { vi: "k (số lần max xuất hiện)", en: "k (maximum occurrences)" }, default: 2 }], complexity: { time: "O(n)", space: "O(1)", note: { vi: "Chỉ theo dõi số lần maxValue trong cửa sổ.", en: "Track only maxValue occurrences in the window." } }, code: ["class Solution:", "    def countSubarrays(self, nums, k):", "        max_value = max(nums)", "        left = count_max = ans = 0", "        for right, num in enumerate(nums):", "            if num == max_value: count_max += 1", "            while count_max >= k:", "                ans += len(nums) - right", "                if nums[left] == max_value: count_max -= 1", "                left += 1", "        return ans"], builder: buildSteps2962 },
};
