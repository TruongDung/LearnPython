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

function buildStepsFixedMatch(input, params, config) {
  const text = String(input ?? "");
  const pattern = String(params?.[config.patternKey] ?? config.defaultPattern);
  if (!pattern) throw new Error(`${config.patternKey} must not be empty`);
  const chars = [...text]; const need = new Map(); const window = new Map(); const steps = [];
  for (const ch of pattern) need.set(ch, (need.get(ch) || 0) + 1);
  let left = 0; const matches = [];
  const equal = () => need.size === window.size && [...need].every(([ch, count]) => window.get(ch) === count);
  const snap = (title, line, right = -1, note, extra = {}) => {
    const windowIndices = range(left, right);
    steps.push(makeStep(chars, {
      title, line, highlight: windowIndices, mark: extra.mark || [], final: extra.final, note,
      vars: [{ name: config.patternKey, value: JSON.stringify(pattern) }, { name: "need", value: mapText(need) }, { name: "windowFreq", value: mapText(window) }, { name: "left", value: left }, { name: "right", value: right >= 0 ? right : "-" }, { name: config.resultName, value: config.existsOnly ? (matches.length ? "True" : "False") : `[${matches.join(", ")}]` }, ...(extra.vars || [])],
      slidingFreqView: { nums: chars, label: config.textLabel, left, right, window: windowIndices, best: extra.mark || [], freq: Object.fromEntries(window), k: pattern.length, mode: "frequency", activeValue: extra.activeValue, overLimit: false, ans: config.existsOnly ? (matches.length ? 1 : 0) : matches.length, done: extra.final },
    }));
  };
  snap({ vi: `need = Counter(${config.patternKey})`, en: `need = Counter(${config.patternKey})` }, 3, -1, { vi: `Mẫu ${JSON.stringify(pattern)} yêu cầu đúng frequency: ${mapText(need)}.`, en: `Pattern ${JSON.stringify(pattern)} requires exact frequencies: ${mapText(need)}.` });
  snap({ vi: "window = {}, left = 0", en: "window = {}, left = 0" }, 4, -1, { vi: "Cửa sổ luôn được giữ có độ dài bằng pattern.", en: "The window is kept at the pattern length." });
  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    snap({ vi: `Xét ${config.textLabel}[${right}] = ${JSON.stringify(ch)}`, en: `Inspect ${config.textLabel}[${right}] = ${JSON.stringify(ch)}` }, 5, right, { vi: "Mở rộng fixed window sang phải.", en: "Expand the fixed window to the right." }, { activeValue: ch });
    window.set(ch, (window.get(ch) || 0) + 1);
    snap({ vi: `window[${JSON.stringify(ch)}] += 1 → ${window.get(ch)}`, en: `window[${JSON.stringify(ch)}] += 1 → ${window.get(ch)}` }, 6, right, { vi: "Ghi nhận ký tự mới trong frequency của cửa sổ.", en: "Record the new character in the window frequency." }, { activeValue: ch });
    if (right - left + 1 > pattern.length) {
      snap({ vi: `window size > ${pattern.length} → bỏ cạnh trái`, en: `window size > ${pattern.length} → remove left edge` }, 7, right, { vi: "Cửa sổ đang dài hơn pattern, cần loại ký tự cũ nhất.", en: "The window is longer than the pattern, so remove its oldest character." });
      const removed = chars[left]; window.set(removed, window.get(removed) - 1); if (window.get(removed) === 0) window.delete(removed);
      snap({ vi: `window[${JSON.stringify(removed)}] -= 1`, en: `window[${JSON.stringify(removed)}] -= 1` }, 8, right, { vi: `Loại ${JSON.stringify(removed)} khỏi frequency cửa sổ.`, en: `Remove ${JSON.stringify(removed)} from the window frequency.` }, { vars: [{ name: "removed", value: JSON.stringify(removed) }] });
      left++;
      snap({ vi: `left += 1 → ${left}`, en: `left += 1 → ${left}` }, 9, right, { vi: "Cửa sổ quay về đúng độ dài pattern.", en: "The window returns to the pattern length." });
    }
    const isMatch = right - left + 1 === pattern.length && equal();
    snap({ vi: isMatch ? "windowFreq == need → khớp" : "windowFreq != need → chưa khớp", en: isMatch ? "windowFreq == need → match" : "windowFreq != need → no match" }, 10, right, { vi: isMatch ? "Mọi ký tự và số lần xuất hiện đều khớp pattern." : "Frequency hiện tại chưa giống pattern.", en: isMatch ? "Every character and count matches the pattern." : "The current frequency does not yet match the pattern." }, { mark: isMatch ? range(left, right) : [] });
    if (isMatch) {
      matches.push(left);
      snap({ vi: config.existsOnly ? `return True tại start=${left}` : `ans.append(${left})`, en: config.existsOnly ? `return True at start=${left}` : `ans.append(${left})` }, 11, right, { vi: config.existsOnly ? "Đã tìm thấy một hoán vị của pattern trong text." : `Lưu vị trí bắt đầu ${left} của anagram.`, en: config.existsOnly ? "A permutation of the pattern was found in the text." : `Save anagram start index ${left}.` }, { mark: range(left, right), vars: [{ name: "matched window", value: JSON.stringify(text.slice(left, right + 1)) }] });
      if (config.existsOnly) return { original: text, [config.patternKey]: pattern, answer: true, steps: steps.map((step, index) => index === steps.length - 1 ? { ...step, final: true } : step) };
    }
  }
  snap({ vi: config.existsOnly ? "return False" : `return ans → [${matches.join(", ")}]`, en: config.existsOnly ? "return False" : `return ans → [${matches.join(", ")}]` }, 12, chars.length - 1, { vi: config.existsOnly ? "Không có window nào là hoán vị của pattern." : "Đây là mọi start index có anagram của pattern.", en: config.existsOnly ? "No window is a permutation of the pattern." : "These are all start indices containing a pattern anagram." }, { final: true });
  return { original: text, [config.patternKey]: pattern, answer: config.existsOnly ? false : matches, steps };
}

function buildSteps438(input, params) {
  return buildStepsFixedMatch(input, params, { patternKey: "p", defaultPattern: "abc", textLabel: "s", resultName: "anagram starts", existsOnly: false });
}

function buildSteps567(input, params) {
  return buildStepsFixedMatch(input, params, { patternKey: "s1", defaultPattern: "ab", textLabel: "s2", resultName: "contains permutation", existsOnly: true });
}

function buildSteps2904(input, params) {
  const s = String(input ?? "");
  if (!/^[01]+$/.test(s)) throw new Error("s must be a non-empty binary string");
  const k = Number(params?.k ?? 2);
  if (!Number.isInteger(k) || k < 1) throw new Error("k must be a positive integer");

  const chars = [...s];
  const steps = [];
  let left = 0;
  let ones = 0;
  let best = "";
  let bestLeft = -1;
  let bestRight = -1;

  const addLabel = (labels, index, label) => {
    if (index < 0 || index >= chars.length) return;
    const key = `0,${index + 1}`;
    labels[key] = labels[key] ? `${labels[key]}\n${label}` : label;
  };
  const bestRange = () => bestLeft >= 0 ? range(bestLeft, bestRight) : [];
  const better = (candidate) => (
    best === "" || candidate.length < best.length || (candidate.length === best.length && candidate < best)
  );
  const makeGrid = (right, focus, extra = {}) => {
    const labels = {};
    addLabel(labels, left, `left=${left}`);
    addLabel(labels, right, `right=${right}`);
    for (const index of bestRange()) addLabel(labels, index, "best");
    if (Number.isInteger(extra.removing)) addLabel(labels, extra.removing, "drop");
    const active = new Set(range(left, right));
    return {
      dp: [["", ...chars]],
      text1: "",
      text2: s,
      colLabels: chars.map((char, index) => ({ index: `idx=${index}`, char })),
      hlCell: Number.isInteger(focus) ? [0, focus + 1] : null,
      autoScrollCell: right >= 0 ? [0, right + 1] : null,
      pathCells: range(left, right).map((index) => [0, index + 1]),
      historyCells: bestRange().filter((index) => !active.has(index)).map((index) => [0, index + 1]),
      cellLabels: labels,
      largeCells: true,
      caption: `window=${JSON.stringify(left <= right ? s.slice(left, right + 1) : "")} · ones=${ones}/${k} · best=${JSON.stringify(best)}`,
      secondaryCaption: "shortest first; lexicographically smallest breaks ties",
    };
  };
  const snap = (title, line, right = -1, note, extra = {}) => {
    steps.push({
      title,
      arr: [],
      grid: makeGrid(right, Number.isInteger(extra.focus) ? extra.focus : right, extra),
      highlight: [],
      mark: bestRange(),
      final: Boolean(extra.final),
      codeLines: [line],
      vars: [
        { name: "k", value: k },
        { name: "left", value: left },
        { name: "right", value: right >= 0 ? right : "-" },
        { name: "ones", value: ones },
        { name: "best", value: JSON.stringify(best) },
        ...(extra.vars || []),
      ],
      note,
    });
  };

  snap(
    { vi: "Khởi tạo cửa sổ", en: "Initialize the window" },
    3,
    -1,
    { vi: "left bắt đầu ở 0, ones đếm số bit 1 trong cửa sổ, best ban đầu rỗng.", en: "left starts at 0, ones counts 1-bits in the window, and best starts empty." },
  );

  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    snap(
      { vi: `Xét s[${right}] = ${ch}`, en: `Inspect s[${right}] = ${ch}` },
      4,
      right,
      { vi: "Mở rộng cạnh phải thêm một ký tự.", en: "Expand the right edge by one character." },
    );

    if (ch === "1") {
      ones++;
      snap(
        { vi: `Gặp bit 1 -> ones = ${ones}`, en: `Saw a 1 -> ones = ${ones}` },
        5,
        right,
        { vi: "Cửa sổ có thêm một bit 1.", en: "The window gained one 1-bit." },
      );
    }

    while (ones > k) {
      snap(
        { vi: `ones=${ones} > k=${k}`, en: `ones=${ones} > k=${k}` },
        6,
        right,
        { vi: "Cửa sổ có quá nhiều bit 1 nên phải bỏ bớt từ bên trái.", en: "The window has too many 1-bits, so shrink from the left." },
        { removing: left, focus: left },
      );
      if (chars[left] === "1") ones--;
      const removed = chars[left];
      left++;
      snap(
        { vi: `Bỏ s[${left - 1}] = ${removed}`, en: `Drop s[${left - 1}] = ${removed}` },
        7,
        right,
        { vi: `Dịch left sang ${left}; ones hiện là ${ones}.`, en: `Move left to ${left}; ones is now ${ones}.` },
        { vars: [{ name: "removed", value: JSON.stringify(removed) }] },
      );
    }

    while (ones === k) {
      const candidate = s.slice(left, right + 1);
      const isBetter = better(candidate);
      snap(
        isBetter
          ? { vi: `Ứng viên tốt hơn: ${candidate}`, en: `Better candidate: ${candidate}` }
          : { vi: `Ứng viên chưa tốt hơn: ${candidate}`, en: `Candidate is not better: ${candidate}` },
        8,
        right,
        isBetter
          ? { vi: "Window có đúng k bit 1 và ngắn hơn best hiện tại hoặc cùng độ dài nhưng nhỏ hơn theo từ điển.", en: "The window has exactly k 1-bits and is shorter than best, or tied in length but lexicographically smaller." }
          : { vi: "Window có đúng k bit 1 nhưng không thắng best hiện tại.", en: "The window has exactly k 1-bits but does not beat the current best." },
        { vars: [{ name: "candidate", value: JSON.stringify(candidate) }] },
      );
      if (isBetter) {
        best = candidate;
        bestLeft = left;
        bestRight = right;
        snap(
          { vi: `best = ${best}`, en: `best = ${best}` },
          9,
          right,
          { vi: "Lưu substring tốt nhất mới.", en: "Save the new best substring." },
        );
      }

      snap(
        { vi: "Co left để thử ngắn hơn", en: "Shrink left to try shorter" },
        10,
        right,
        { vi: "Khi vẫn đủ k bit 1, ta bỏ cạnh trái để tìm ứng viên ngắn hơn với cùng right.", en: "While the window still has k 1-bits, drop the left edge to seek a shorter candidate at the same right." },
        { removing: left, focus: left },
      );
      if (chars[left] === "1") ones--;
      const removed = chars[left];
      left++;
      snap(
        { vi: `left -> ${left}`, en: `left -> ${left}` },
        11,
        right,
        { vi: `Đã bỏ ${JSON.stringify(removed)}; ones = ${ones}.`, en: `Dropped ${JSON.stringify(removed)}; ones = ${ones}.` },
        { vars: [{ name: "removed", value: JSON.stringify(removed) }] },
      );
    }
  }

  snap(
    { vi: `return ${JSON.stringify(best)}`, en: `return ${JSON.stringify(best)}` },
    12,
    chars.length - 1,
    best
      ? { vi: `Substring đẹp ngắn nhất, nhỏ nhất theo từ điển là ${JSON.stringify(best)}.`, en: `The shortest, lexicographically smallest beautiful substring is ${JSON.stringify(best)}.` }
      : { vi: "Không có substring nào chứa đúng k bit 1.", en: "No substring contains exactly k 1-bits." },
    { final: true },
  );

  return { original: s, k, answer: best, steps };
}

function buildSteps2904Positions(input, params) {
  const s = String(input ?? "");
  if (!/^[01]+$/.test(s)) throw new Error("s must be a non-empty binary string");
  const k = Number(params?.k ?? 2);
  if (!Number.isInteger(k) || k < 1) throw new Error("k must be a positive integer");

  const chars = [...s];
  const onesPos = [];
  const steps = [];
  let best = "";
  let bestLeft = -1;
  let bestRight = -1;

  const addLabel = (labels, index, label) => {
    if (index < 0 || index >= chars.length) return;
    const key = `0,${index + 1}`;
    labels[key] = labels[key] ? `${labels[key]}\n${label}` : label;
  };
  const bestRange = () => bestLeft >= 0 ? range(bestLeft, bestRight) : [];
  const better = (candidate) => (
    best === "" || candidate.length < best.length || (candidate.length === best.length && candidate < best)
  );
  const makeGrid = (opts = {}) => {
    const labels = {};
    for (const index of onesPos) addLabel(labels, index, "1-pos");
    for (const index of bestRange()) addLabel(labels, index, "best");
    if (Number.isInteger(opts.left)) addLabel(labels, opts.left, `L=${opts.left}`);
    if (Number.isInteger(opts.right)) addLabel(labels, opts.right, `R=${opts.right}`);
    const candidateCells = Number.isInteger(opts.left) && Number.isInteger(opts.right)
      ? range(opts.left, opts.right)
      : [];
    const active = new Set(candidateCells);
    return {
      dp: [["", ...chars]],
      text1: "",
      text2: s,
      colLabels: chars.map((char, index) => ({ index: `idx=${index}`, char })),
      hlCell: Number.isInteger(opts.focus) ? [0, opts.focus + 1] : null,
      autoScrollCell: Number.isInteger(opts.focus) ? [0, opts.focus + 1] : null,
      pathCells: candidateCells.map((index) => [0, index + 1]),
      historyCells: bestRange().filter((index) => !active.has(index)).map((index) => [0, index + 1]),
      cellLabels: labels,
      largeCells: true,
      caption: opts.caption || `ones positions=[${onesPos.join(", ")}] · best=${JSON.stringify(best)}`,
      secondaryCaption: "Each candidate starts at one_pos[i] and ends at one_pos[i+k-1].",
    };
  };
  const snap = (title, line, note, extra = {}) => {
    steps.push({
      title,
      arr: [],
      grid: makeGrid(extra),
      highlight: [],
      mark: bestRange(),
      final: Boolean(extra.final),
      codeLines: [line],
      vars: [
        { name: "k", value: k },
        { name: "ones", value: `[${onesPos.join(", ")}]` },
        { name: "best", value: JSON.stringify(best) },
        ...(extra.vars || []),
      ],
      note,
    });
  };

  snap(
    { vi: "Khởi tạo danh sách vị trí bit 1", en: "Initialize the 1-position list" },
    3,
    { vi: "Ta chỉ quan tâm đến vị trí các ký tự '1', vì substring đẹp ngắn nhất luôn bắt đầu và kết thúc bằng '1'.", en: "We only care about positions of '1', because the shortest beautiful substring always starts and ends with '1'." },
  );

  for (let i = 0; i < chars.length; i++) {
    snap(
      { vi: `Quét s[${i}] = ${chars[i]}`, en: `Scan s[${i}] = ${chars[i]}` },
      4,
      { vi: "Duyệt chuỗi một lần để gom vị trí các bit 1.", en: "Scan the string once to collect all 1-bit positions." },
      { focus: i },
    );
    if (chars[i] === "1") {
      onesPos.push(i);
      snap(
        { vi: `ones.append(${i})`, en: `ones.append(${i})` },
        5,
        { vi: `Ghi nhận vị trí ${i}; hiện có ${onesPos.length} bit 1.`, en: `Record position ${i}; we have seen ${onesPos.length} 1-bits.` },
        { focus: i },
      );
    }
  }

  if (onesPos.length < k) {
    snap(
      { vi: "Không đủ bit 1", en: "Not enough 1-bits" },
      6,
      { vi: `Chỉ có ${onesPos.length} bit 1, ít hơn k=${k}, nên trả về chuỗi rỗng.`, en: `There are only ${onesPos.length} 1-bits, fewer than k=${k}, so return an empty string.` },
      { final: true },
    );
    return { original: s, k, answer: "", steps };
  }

  for (let i = 0; i + k - 1 < onesPos.length; i++) {
    const left = onesPos[i];
    const right = onesPos[i + k - 1];
    const candidate = s.slice(left, right + 1);
    const isBetter = better(candidate);
    snap(
      isBetter
        ? { vi: `Ứng viên tốt hơn: ${candidate}`, en: `Better candidate: ${candidate}` }
        : { vi: `Ứng viên chưa tốt hơn: ${candidate}`, en: `Candidate is not better: ${candidate}` },
      8,
      isBetter
        ? { vi: `Cụm ${k} bit 1 từ ones[${i}] đến ones[${i + k - 1}] tạo substring ngắn hơn best hoặc cùng độ dài nhưng nhỏ hơn theo từ điển.`, en: `The ${k}-bit group from ones[${i}] through ones[${i + k - 1}] gives a shorter substring, or a same-length lexicographically smaller one.` }
        : { vi: `Cụm ${k} bit 1 này tạo candidate nhưng không thắng best hiện tại.`, en: `This ${k}-bit group creates a candidate but does not beat the current best.` },
      {
        left,
        right,
        focus: right,
        vars: [
          { name: "i", value: i },
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "candidate", value: JSON.stringify(candidate) },
        ],
      },
    );
    if (isBetter) {
      best = candidate;
      bestLeft = left;
      bestRight = right;
      snap(
        { vi: `best = ${best}`, en: `best = ${best}` },
        9,
        { vi: "Lưu candidate làm đáp án tốt nhất hiện tại.", en: "Save the candidate as the current best answer." },
        { left, right, focus: right },
      );
    }
  }

  snap(
    { vi: `return ${JSON.stringify(best)}`, en: `return ${JSON.stringify(best)}` },
    10,
    best
      ? { vi: `Substring đẹp ngắn nhất, nhỏ nhất theo từ điển là ${JSON.stringify(best)}.`, en: `The shortest, lexicographically smallest beautiful substring is ${JSON.stringify(best)}.` }
      : { vi: "Không có substring nào chứa đúng k bit 1.", en: "No substring contains exactly k 1-bits." },
    { final: true },
  );

  return { original: s, k, answer: best, steps };
}

const category = { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" };
const arrayTag = [{ key: "array", vi: "Mảng", en: "Array" }];
const stringTag = { key: "string", vi: "Chuỗi", en: "String" };
const inclusionExclusionTag = { key: "inclusion-exclusion", vi: "Bao hàm – loại trừ", en: "Inclusion–Exclusion" };

module.exports = {
  992: { id: 992, difficulty: "hard", slug: "subarrays-with-k-different-integers", category, tags: [...arrayTag, inclusionExclusionTag], title: { vi: "Subarrays with K Different Integers", en: "Subarrays with K Different Integers" }, titleVi: { vi: "Subarray có đúng K giá trị khác nhau", en: "Subarrays with exactly K distinct integers" }, statement: { vi: "Đếm subarray có đúng k số nguyên phân biệt.", en: "Count subarrays containing exactly k distinct integers." }, defaultInput: [1, 2, 1, 2, 3], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [{ key: "k", label: { vi: "k (số distinct chính xác)", en: "k (exact distinct count)" }, default: 2 }], complexity: { time: "O(n)", space: "O(n)", note: { vi: "Duy trì hai cửa sổ atMost(K) và atMost(K−1).", en: "Maintain atMost(K) and atMost(K−1) windows." } }, code: ["class Solution:", "    def subarraysWithKDistinct(self, nums, k):", "        freq_k = {}; freq_km1 = {}", "        left_k = left_km1 = ans = 0", "        for right, num in enumerate(nums):", "            freq_k[num] += 1; freq_km1[num] += 1", "            while len(freq_k) > k:", "                remove_from(freq_k, left_k)", "            while len(freq_km1) > k - 1:", "                remove_from(freq_k, left_km1)", "            ans += left_km1 - left_k", "        return ans"], builder: buildSteps992 },
  1248: { id: 1248, difficulty: "medium", slug: "count-number-of-nice-subarrays", category, tags: arrayTag, title: { vi: "Count Number of Nice Subarrays", en: "Count Number of Nice Subarrays" }, titleVi: { vi: "Đếm subarray có đúng K số lẻ", en: "Count subarrays with exactly K odd numbers" }, statement: { vi: "Đếm subarray có đúng k số lẻ.", en: "Count subarrays containing exactly k odd numbers." }, defaultInput: [1, 1, 2, 1, 1], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [{ key: "k", label: { vi: "k (số lẻ chính xác)", en: "k (exact odd count)" }, default: 3 }], complexity: { time: "O(n)", space: "O(n)", note: { vi: "Prefix đếm số lẻ và frequency map.", en: "Odd-count prefix sums with a frequency map." } }, code: ["class Solution:", "    def numberOfSubarrays(self, nums, k):", "        prefix_freq = {0: 1}", "        prefix = ans = 0", "        for right, num in enumerate(nums):", "            prefix += num % 2", "            need = prefix - k", "            ans += prefix_freq.get(need, 0)", "            prefix_freq[prefix] = prefix_freq.get(prefix, 0) + 1", "        return ans"], builder: buildSteps1248 },
  930: { id: 930, difficulty: "medium", slug: "binary-subarrays-with-sum", category, tags: arrayTag, title: { vi: "Binary Subarrays With Sum", en: "Binary Subarrays With Sum" }, titleVi: { vi: "Đếm subarray nhị phân có tổng bằng Goal", en: "Binary subarrays with sum Goal" }, statement: { vi: "Đếm subarray trong mảng nhị phân có tổng đúng goal.", en: "Count binary subarrays whose sum equals goal." }, defaultInput: [1, 0, 1, 0, 1], inputKind: "binary", inputLabel: { vi: "nums (0 hoặc 1)", en: "nums (0 or 1)" }, extraParams: [{ key: "goal", label: { vi: "goal (tổng chính xác)", en: "goal (exact sum)" }, default: 2 }], complexity: { time: "O(n)", space: "O(n)", note: { vi: "Prefix sum và frequency map.", en: "Prefix sums and a frequency map." } }, code: ["class Solution:", "    def numSubarraysWithSum(self, nums, goal):", "        prefix_freq = {0: 1}", "        prefix = ans = 0", "        for right, num in enumerate(nums):", "            prefix += num", "            need = prefix - goal", "            ans += prefix_freq.get(need, 0)", "            prefix_freq[prefix] = prefix_freq.get(prefix, 0) + 1", "        return ans"], builder: buildSteps930 },
  2799: { id: 2799, difficulty: "medium", slug: "count-complete-subarrays-in-an-array", category, tags: arrayTag, title: { vi: "Count Complete Subarrays in an Array", en: "Count Complete Subarrays in an Array" }, titleVi: { vi: "Đếm complete subarray", en: "Count complete subarrays" }, statement: { vi: "Đếm subarray chứa mọi giá trị distinct xuất hiện trong toàn mảng.", en: "Count subarrays containing every distinct value from the full array." }, defaultInput: [1, 3, 1, 2, 2], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [], complexity: { time: "O(n)", space: "O(n)", note: { vi: "Cửa sổ trượt với frequency map.", en: "Sliding window with a frequency map." } }, code: ["class Solution:", "    def countCompleteSubarrays(self, nums):", "        target = len(set(nums))", "        freq = {}; left = ans = 0", "        for right, num in enumerate(nums):", "            freq[num] = freq.get(num, 0) + 1", "            while len(freq) == target:", "                ans += len(nums) - right", "                remove_from(freq, left); left += 1", "        return ans"], builder: buildSteps2799 },
  2962: { id: 2962, difficulty: "medium", slug: "count-subarrays-where-max-element-appears-at-least-k-times", category, tags: arrayTag, title: { vi: "Count Subarrays Where Max Element Appears at Least K Times", en: "Count Subarrays Where Max Element Appears at Least K Times" }, titleVi: { vi: "Đếm subarray có phần tử lớn nhất xuất hiện ít nhất K lần", en: "Count subarrays where the maximum appears at least K times" }, statement: { vi: "Đếm subarray mà giá trị lớn nhất của toàn mảng xuất hiện ít nhất k lần.", en: "Count subarrays in which the global maximum appears at least k times." }, defaultInput: [1, 3, 2, 3, 3], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [{ key: "k", label: { vi: "k (số lần max xuất hiện)", en: "k (maximum occurrences)" }, default: 2 }], complexity: { time: "O(n)", space: "O(1)", note: { vi: "Chỉ theo dõi số lần maxValue trong cửa sổ.", en: "Track only maxValue occurrences in the window." } }, code: ["class Solution:", "    def countSubarrays(self, nums, k):", "        max_value = max(nums)", "        left = count_max = ans = 0", "        for right, num in enumerate(nums):", "            if num == max_value: count_max += 1", "            while count_max >= k:", "                ans += len(nums) - right", "                if nums[left] == max_value: count_max -= 1", "                left += 1", "        return ans"], builder: buildSteps2962 },
  2904: {
    id: 2904,
    difficulty: "medium",
    slug: "shortest-and-lexicographically-smallest-beautiful-string",
    category,
    tags: [stringTag],
    title: { vi: "Shortest and Lexicographically Smallest Beautiful String", en: "Shortest and Lexicographically Smallest Beautiful String" },
    titleVi: { vi: "Chuỗi đẹp ngắn nhất và nhỏ nhất theo từ điển", en: "Shortest and lexicographically smallest beautiful string" },
    statement: { vi: "Cho chuỗi nhị phân s và số k. Tìm substring ngắn nhất chứa đúng k ký tự '1'; nếu nhiều substring cùng độ dài, trả về substring nhỏ nhất theo từ điển. Nếu không có, trả về chuỗi rỗng.", en: "Given a binary string s and integer k, find the shortest substring containing exactly k '1' characters; if several have the same length, return the lexicographically smallest one. Return an empty string if none exists." },
    defaultInput: "100011001",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi nhị phân)", en: "s (binary string)" },
    extraParams: [
      { key: "k", label: { vi: "k (số bit 1 chính xác)", en: "k (exact number of 1s)" }, default: 3, min: 1 },
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Cửa sổ trượt", en: "Approach 1: Sliding window" } },
          { value: "2", label: { vi: "Cách 2: Vị trí các bit 1", en: "Approach 2: Positions of 1-bits" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: cửa sổ trượt với biến ones; khi window có đúng k bit 1 thì cập nhật best rồi co left.", en: "Approach 1: sliding window with a ones counter; when the window has exactly k 1-bits, update best and shrink left." },
      { vi: "Cách 2: gom vị trí mọi bit 1. Mỗi ứng viên được xác định bởi k bit 1 liên tiếp: s[ones[i]..ones[i+k-1]].", en: "Approach 2: collect every 1-bit position. Each candidate is defined by k consecutive 1-bits: s[ones[i]..ones[i+k-1]]." },
      { vi: "Cách 2 quét chuỗi O(n) để tạo vị trí và chỉ xét O(#ones) ứng viên; ưu tiên ngắn hơn, rồi nhỏ hơn theo từ điển.", en: "Approach 2 scans the string in O(n) to build positions and checks O(#ones) candidates; shorter wins first, then lexicographically smaller." },
    ],
    complexity: { time: "Approach 1: O(n²) worst-case slicing/compare; Approach 2: O(n) scan + candidate substring compare", space: "Approach 1: O(1); Approach 2: O(n)", note: { vi: "Cách 2 giảm phần quét xuống tuyến tính bằng cách chỉ xét các cụm k bit 1 liên tiếp. Trong Python, slicing/so sánh chuỗi vẫn có chi phí theo độ dài candidate.", en: "Approach 2 makes the scan linear by checking only groups of k consecutive 1-bits. In Python, slicing/comparing strings still costs the candidate length." } },
    codeLabel: { vi: "Cách 1: Cửa sổ trượt", en: "Approach 1: Sliding window" },
    code: [
      "class Solution:",
      "    def shortestBeautifulSubstring(self, s: str, k: int) -> str:",
      "        left = ones = 0",
      "        best = \"\"",
      "        for right, ch in enumerate(s):",
      "            if ch == \"1\": ones += 1",
      "            while ones > k:",
      "                if s[left] == \"1\": ones -= 1",
      "                left += 1",
      "            while ones == k:",
      "                cand = s[left:right + 1]",
      "                if best == \"\" or len(cand) < len(best) or (len(cand) == len(best) and cand < best):",
      "                    best = cand",
      "                if s[left] == \"1\": ones -= 1",
      "                left += 1",
      "        return best",
    ],
    code2Label: { vi: "Cách 2: Vị trí các bit 1", en: "Approach 2: Positions of 1-bits" },
    code2: [
      "class Solution:",
      "    def shortestBeautifulSubstring(self, s: str, k: int) -> str:",
      "        ones = [i for i, ch in enumerate(s) if ch == \"1\"]",
      "        if len(ones) < k:",
      "            return \"\"",
      "        best = \"\"",
      "        for i in range(len(ones) - k + 1):",
      "            left = ones[i]",
      "            right = ones[i + k - 1]",
      "            cand = s[left:right + 1]",
      "            if best == \"\" or len(cand) < len(best) or (len(cand) == len(best) and cand < best):",
      "                best = cand",
      "        return best",
    ],
    builder: buildSteps2904,
    builder2: buildSteps2904Positions,
  },
};

module.exports[438] = { id: 438, difficulty: "medium", slug: "find-all-anagrams-in-a-string", category, tags: [{ key: "string", vi: "Chuỗi", en: "String" }], title: { vi: "Find All Anagrams in a String", en: "Find All Anagrams in a String" }, titleVi: { vi: "Tìm mọi anagram trong chuỗi", en: "Find all anagrams in a string" }, statement: { vi: "Tìm mọi vị trí bắt đầu trong s mà substring là anagram của p.", en: "Find all start indices in s whose substring is an anagram of p." }, defaultInput: "cbaebabacd", inputKind: "string", inputLabel: { vi: "Chuỗi s", en: "String s" }, extraParams: [{ key: "p", type: "string", label: { vi: "Pattern p", en: "Pattern p" }, default: "abc" }], complexity: { time: "O(|s| + |p|)", space: "O(alphabet)", note: { vi: "Fixed window có độ dài bằng p và so sánh frequency map.", en: "Use a fixed window of p's length and compare frequency maps." } }, code: ["class Solution:", "    def findAnagrams(self, s, p):", "        need = Counter(p)", "        window = {}; left = 0; ans = []", "        for right, ch in enumerate(s):", "            window[ch] = window.get(ch, 0) + 1", "            if right - left + 1 > len(p):", "                remove_from(window, s[left])", "                left += 1", "            if right - left + 1 == len(p) and window == need:", "                ans.append(left)", "        return ans"], builder: buildSteps438 };

module.exports[567] = { id: 567, difficulty: "medium", slug: "permutation-in-string", category, tags: [{ key: "string", vi: "Chuỗi", en: "String" }], title: { vi: "Permutation in String", en: "Permutation in String" }, titleVi: { vi: "Hoán vị trong chuỗi", en: "Permutation in String" }, statement: { vi: "Kiểm tra s2 có chứa một hoán vị của s1 hay không.", en: "Check whether s2 contains a permutation of s1." }, defaultInput: "eidbaooo", inputKind: "string", inputLabel: { vi: "Chuỗi s2", en: "String s2" }, extraParams: [{ key: "s1", type: "string", label: { vi: "Pattern s1", en: "Pattern s1" }, default: "ab" }], complexity: { time: "O(|s1| + |s2|)", space: "O(alphabet)", note: { vi: "Fixed window có độ dài bằng s1.", en: "Use a fixed window of s1's length." } }, code: ["class Solution:", "    def checkInclusion(self, s1, s2):", "        need = Counter(s1)", "        window = {}; left = 0", "        for right, ch in enumerate(s2):", "            window[ch] = window.get(ch, 0) + 1", "            if right - left + 1 > len(s1):", "                remove_from(window, s2[left])", "                left += 1", "            if right - left + 1 == len(s1) and window == need:", "                return True", "        return False"], builder: buildSteps567 };
