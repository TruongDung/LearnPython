// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * Generate steps for LeetCode 1: Two Sum (using hash map).
 *
 *  - For each i, check if (target - nums[i]) has already appeared.
 *  - If yes: found the pair of indices.
 *  - If no: store nums[i] -> i in the hash map.
 */
function buildSteps1(nums, params) {
  const target = params.target;
  const steps = [];
  const seen = {};

  const dictStr = () => {
    const entries = Object.keys(seen).map((k) => `${k}:${seen[k]}`);
    return `{${entries.join(", ")}}`;
  };

  steps.push({
    title: { vi: "Khởi tạo hash map", en: "Initialize hash map" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "target", value: target },
      { name: "d", value: dictStr() },
    ],
    note: {
      vi: `target = ${target}. Dùng hash map d (giá trị → chỉ số), ban đầu rỗng {}.`,
      en: `target = ${target}. Use a hash map d (value → index), initially empty {}.`,
    },
  });

  let answer = null;
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (Object.prototype.hasOwnProperty.call(seen, comp)) {
      const j = seen[comp];
      answer = [i, j];
      steps.push({
        title: { vi: `Tìm thấy tại i=${i}`, en: `Found at i=${i}` },
        arr: [...nums],
        highlight: [j, i],
        mark: [j, i],
        final: true,
        codeLines: [5, 6],
        vars: [
          { name: "i", value: i },
          { name: "comp", value: comp },
          { name: "j", value: j },
          { name: "d", value: dictStr() },
        ],
        note: {
          vi: `target - nums[${i}] = ${target} - ${nums[i]} = ${comp} đã có trong d tại chỉ số ${j}. Trả về [${i}, ${j}].`,
          en: `target - nums[${i}] = ${target} - ${nums[i]} = ${comp} is already in d at index ${j}. Return [${i}, ${j}].`,
        },
      });
      break;
    }

    seen[nums[i]] = i;
    steps.push({
      title: { vi: `Xét i=${i}`, en: `Inspect i=${i}` },
      arr: [...nums],
      highlight: [i],
      mark: [],
      codeLines: [4, 7],
      vars: [
        { name: "i", value: i },
        { name: "comp", value: comp },
        { name: "d", value: dictStr() },
      ],
      note: {
        vi: `Cần ${comp} (= ${target} - ${nums[i]}) nhưng chưa có trong d. Lưu nums[${i}]=${nums[i]} → ${i}. d = ${dictStr()}.`,
        en: `Need ${comp} (= ${target} - ${nums[i]}) but it is not in d. Store nums[${i}]=${nums[i]} → ${i}. d = ${dictStr()}.`,
      },
    });
  }

  if (!answer) {
    steps.push({
      title: { vi: "Không tìm thấy", en: "Not found" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [7],
      vars: [{ name: "d", value: dictStr() }],
      note: {
        vi: "Không có cặp nào có tổng bằng target.",
        en: "No pair sums to the target.",
      },
    });
  }

  return { original: [...nums], target, answer: answer ? `[${answer[0]}, ${answer[1]}]` : "none", steps };
}

/**
 * Generate steps for LeetCode 3020: Find the Maximum Number of Elements in a Subset.
 *
 * Valid subsets follow the pattern [x, x², x⁴, …, x^k, …, x⁴, x², x].
 * For each base x: follow the power chain, each level needs >= 2 copies (except the peak needs >= 1).
 * Special case x = 1 is handled separately (needs odd count).
 */
function buildSteps3020(nums) {
  const steps = [];
  const freq = {};
  nums.forEach((v) => {
    freq[v] = (freq[v] || 0) + 1;
  });
  const freqStr = (f) =>
    `{${Object.keys(f)
      .map((k) => `${k}:${f[k]}`)
      .join(", ")}}`;
  const idxOf = (val) => nums.map((v, i) => (v === val ? i : -1)).filter((i) => i >= 0);

  let ans = 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "ans", value: ans },
      { name: "freq", value: freqStr(freq) },
    ],
    note: {
      vi: "Đếm tần suất các số. Mẫu hợp lệ: [x, x², x⁴, …, x^k, …, x⁴, x², x]. Tìm tập con dài nhất.",
      en: "Count value frequencies. Valid pattern: [x, x², x⁴, …, x^k, …, x⁴, x², x]. Find the longest such subset.",
    },
  });

  const bases = [...new Set(nums)].sort((a, b) => a - b);
  for (const x of bases) {
    if (x === 1) {
      const cnt = freq[1];
      const val = cnt % 2 === 0 ? cnt - 1 : cnt;
      if (val > ans) ans = val;
      steps.push({
        title: { vi: "Trường hợp x = 1", en: "Case x = 1" },
        arr: [...nums],
        highlight: idxOf(1),
        mark: [],
        codeLines: [6, 7, 8],
        vars: [
          { name: "x", value: 1 },
          { name: "freq[1]", value: cnt },
          { name: "ans", value: ans },
        ],
        note: {
          vi: `Có ${cnt} số 1. Mẫu chỉ gồm số 1 cần số lượng lẻ → dùng ${val}. ans = ${ans}.`,
          en: `There are ${cnt} ones. A subset of only 1s needs an odd count → use ${val}. ans = ${ans}.`,
        },
      });
      continue;
    }

    let cnt = 0;
    let cur = x;
    while ((freq[cur] || 0) >= 2) {
      cnt += 2;
      steps.push({
        title: { vi: `Cơ số x = ${x}: lũy thừa ${cur}`, en: `Base x = ${x}: power ${cur}` },
        arr: [...nums],
        highlight: idxOf(cur),
        mark: [],
        codeLines: [12, 13, 14],
        vars: [
          { name: "x", value: x },
          { name: "cur", value: cur },
          { name: "freq[cur]", value: freq[cur] || 0 },
          { name: "cnt", value: cnt },
          { name: "ans", value: ans },
        ],
        note: {
          vi: `freq[${cur}] = ${freq[cur]} ≥ 2 → thêm một cặp (cnt += 2 = ${cnt}), tiếp tục với ${cur * cur}.`,
          en: `freq[${cur}] = ${freq[cur]} ≥ 2 → add a pair (cnt += 2 = ${cnt}), continue with ${cur * cur}.`,
        },
      });
      cur = cur * cur;
    }

    const hasPeak = (freq[cur] || 0) >= 1;
    cnt += hasPeak ? 1 : -1;
    if (cnt > ans) ans = cnt;
    steps.push({
      title: { vi: `Cơ số x = ${x}: đỉnh`, en: `Base x = ${x}: peak` },
      arr: [...nums],
      highlight: hasPeak ? idxOf(cur) : [],
      mark: [],
      codeLines: [15, 16],
      vars: [
        { name: "x", value: x },
        { name: "cur", value: cur },
        { name: "freq[cur]", value: freq[cur] || 0 },
        { name: "cnt", value: cnt },
        { name: "ans", value: ans },
      ],
      note: {
        vi: hasPeak
          ? `freq[${cur}] ≥ 1 → có phần tử đỉnh, cnt += 1 = ${cnt}. ans = ${ans}.`
          : `freq[${cur}] = 0 → thiếu đỉnh, bỏ bớt một phần tử (cnt -= 1 = ${cnt}). ans = ${ans}.`,
        en: hasPeak
          ? `freq[${cur}] ≥ 1 → peak element exists, cnt += 1 = ${cnt}. ans = ${ans}.`
          : `freq[${cur}] = 0 → no peak, drop one element (cnt -= 1 = ${cnt}). ans = ${ans}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [17],
    vars: [{ name: "ans", value: ans }],
    note: {
      vi: `Số phần tử lớn nhất của một tập con hợp lệ = ${ans}.`,
      en: `Maximum number of elements in a valid subset = ${ans}.`,
    },
  });

  return { original: [...nums], answer: ans, steps };
}

/**
 * Generate steps for LeetCode 205: Isomorphic Strings.
 *
 * Use two hash maps (s→t and t→s) to enforce bijective mapping:
 *  - If s[i] already mapped, check it maps to t[i].
 *  - If not mapped, check t[i] is not already mapped to another char in s.
 *  - If any conflict → False. Otherwise → True.
 */
function buildSteps205(input, params) {
  const s = String(input);
  const t = String(params.t || "");
  const steps = [];

  // Display arrays: show both strings as paired characters
  const sChars = s.split("");
  const tChars = t.split("");

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: sChars.map((c, i) => 0),
    sub: sChars.map((c, i) => `${c}→${tChars[i] || "?"}`),
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4, 5],
    vars: [
      { name: "s", value: s },
      { name: "t", value: t },
      { name: "map_s", value: "{}" },
      { name: "map_t", value: "{}" },
    ],
    note: {
      vi: `So sánh "${s}" và "${t}". Dùng 2 hash map: map_s (s→t) và map_t (t→s) để kiểm tra ánh xạ 1-1.`,
      en: `Compare "${s}" and "${t}". Use 2 hash maps: map_s (s→t) and map_t (t→s) to verify bijective mapping.`,
    },
  });

  if (s.length !== t.length) {
    steps.push({
      title: { vi: "Độ dài khác nhau → False", en: "Different lengths → False" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [2, 3],
      vars: [
        { name: "len(s)", value: s.length },
        { name: "len(t)", value: t.length },
        { name: "result", value: false },
      ],
      note: {
        vi: `len(s)=${s.length} ≠ len(t)=${t.length} → không thể đẳng cấu → False.`,
        en: `len(s)=${s.length} ≠ len(t)=${t.length} → cannot be isomorphic → False.`,
      },
    });
    return { s, t, answer: false, steps };
  }

  const mapS = {};
  const mapT = {};
  let answer = true;

  const fmtMap = (m) => {
    const entries = Object.entries(m).map(([k, v]) => `${k}→${v}`);
    return `{${entries.join(", ")}}`;
  };

  for (let i = 0; i < s.length; i++) {
    const c1 = s[i];
    const c2 = t[i];

    if (c1 in mapS) {
      if (mapS[c1] !== c2) {
        // Conflict: c1 already maps to something else
        answer = false;
        steps.push({
          title: { vi: `i=${i}: xung đột → False`, en: `i=${i}: conflict → False` },
          arr: sChars.map((_, j) => j <= i ? 1 : 0),
          sub: sChars.map((c, j) => `${c}→${tChars[j]}`),
          highlight: [i],
          mark: [i],
          final: true,
          codeLines: [6, 7, 8, 9],
          vars: [
            { name: "i", value: i },
            { name: "c1", value: c1 },
            { name: "c2", value: c2 },
            { name: "map_s[c1]", value: mapS[c1] },
            { name: "conflict", value: `${c1}→${mapS[c1]} but need ${c1}→${c2}` },
            { name: "map_s", value: fmtMap(mapS) },
            { name: "result", value: false },
          ],
          note: {
            vi: `'${c1}' đã ánh xạ sang '${mapS[c1]}', nhưng bây giờ cần ánh xạ sang '${c2}' → xung đột → False.`,
            en: `'${c1}' already maps to '${mapS[c1]}', but now needs to map to '${c2}' → conflict → False.`,
          },
        });
        return { s, t, answer: false, steps };
      }
      // Consistent mapping
      steps.push({
        title: { vi: `i=${i}: ${c1}→${c2} (đã ánh xạ) ✓`, en: `i=${i}: ${c1}→${c2} (existing) ✓` },
        arr: sChars.map((_, j) => j <= i ? 1 : 0),
        sub: sChars.map((c, j) => `${c}→${tChars[j]}`),
        highlight: [i],
        mark: [],
        codeLines: [6, 7, 8],
        vars: [
          { name: "i", value: i },
          { name: "c1", value: c1 },
          { name: "c2", value: c2 },
          { name: "map_s[c1]", value: mapS[c1] },
          { name: "map_s", value: fmtMap(mapS) },
          { name: "map_t", value: fmtMap(mapT) },
        ],
        note: {
          vi: `'${c1}' đã ánh xạ sang '${c2}' → nhất quán, tiếp tục.`,
          en: `'${c1}' already maps to '${c2}' → consistent, continue.`,
        },
      });
    } else {
      if (c2 in mapT) {
        // Conflict: c2 already mapped from another char
        answer = false;
        steps.push({
          title: { vi: `i=${i}: xung đột ngược → False`, en: `i=${i}: reverse conflict → False` },
          arr: sChars.map((_, j) => j <= i ? 1 : 0),
          sub: sChars.map((c, j) => `${c}→${tChars[j]}`),
          highlight: [i],
          mark: [i],
          final: true,
          codeLines: [6, 7, 11, 12],
          vars: [
            { name: "i", value: i },
            { name: "c1", value: c1 },
            { name: "c2", value: c2 },
            { name: "map_t[c2]", value: mapT[c2] },
            { name: "conflict", value: `${c2} already mapped from '${mapT[c2]}', cannot map from '${c1}'` },
            { name: "map_t", value: fmtMap(mapT) },
            { name: "result", value: false },
          ],
          note: {
            vi: `'${c2}' đã được ánh xạ từ '${mapT[c2]}', không thể ánh xạ từ '${c1}' nữa → xung đột → False.`,
            en: `'${c2}' is already mapped from '${mapT[c2]}', cannot also map from '${c1}' → conflict → False.`,
          },
        });
        return { s, t, answer: false, steps };
      }
      // New mapping
      mapS[c1] = c2;
      mapT[c2] = c1;
      steps.push({
        title: { vi: `i=${i}: ${c1}→${c2} (mới)`, en: `i=${i}: ${c1}→${c2} (new)` },
        arr: sChars.map((_, j) => j <= i ? 1 : 0),
        sub: sChars.map((c, j) => `${c}→${tChars[j]}`),
        highlight: [i],
        mark: [],
        codeLines: [6, 7, 11, 13, 14, 15],
        vars: [
          { name: "i", value: i },
          { name: "c1", value: c1 },
          { name: "c2", value: c2 },
          { name: "map_s", value: fmtMap(mapS) },
          { name: "map_t", value: fmtMap(mapT) },
        ],
        note: {
          vi: `Tạo ánh xạ mới: '${c1}' ↔ '${c2}'. map_s = ${fmtMap(mapS)}.`,
          en: `Create new mapping: '${c1}' ↔ '${c2}'. map_s = ${fmtMap(mapS)}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả: True", en: "Result: True" },
    arr: sChars.map(() => 1),
    sub: sChars.map((c, i) => `${c}→${tChars[i]}`),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [
      { name: "map_s", value: fmtMap(mapS) },
      { name: "result", value: true },
    ],
    note: {
      vi: `Tất cả ký tự ánh xạ 1-1 không xung đột → "${s}" và "${t}" đẳng cấu → True.`,
      en: `All characters map bijectively without conflict → "${s}" and "${t}" are isomorphic → True.`,
    },
  });

  return { s, t, answer: true, steps };
}

/**
 * Generate steps for LeetCode 734: Sentence Similarity.
 *
 * Build a set of similar pairs (both directions), then check each word pair.
 */
function buildSteps734(input, params) {
  const s1 = String(input).split(",").map((w) => w.trim()).filter((w) => w.length > 0);
  const s2 = String(params.sentence2 || "").split(",").map((w) => w.trim()).filter((w) => w.length > 0);
  const pairsRaw = String(params.pairs || "").split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  const pairs = pairsRaw.map((p) => {
    const parts = p.split("-");
    return [parts[0] || "", parts[1] || ""];
  });

  const steps = [];

  // Build pair set
  const pairSet = new Set();
  for (const [a, b] of pairs) {
    pairSet.add(`${a}|${b}`);
    pairSet.add(`${b}|${a}`);
  }

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: s1.map(() => 0),
    sub: s1.map((w, i) => `${w}↔${s2[i] || "?"}`),
    highlight: [],
    mark: [],
    codeLines: [2, 4, 5, 6, 7],
    vars: [
      { name: "sentence1", value: `[${s1.join(", ")}]` },
      { name: "sentence2", value: `[${s2.join(", ")}]` },
      { name: "pairs", value: pairs.map(([a, b]) => `(${a},${b})`).join(", ") },
      { name: "pairSet size", value: pairSet.size },
    ],
    note: {
      vi: `sentence1 = [${s1.join(", ")}], sentence2 = [${s2.join(", ")}]. Xây set từ ${pairs.length} cặp tương đồng.`,
      en: `sentence1 = [${s1.join(", ")}], sentence2 = [${s2.join(", ")}]. Build set from ${pairs.length} similar pairs.`,
    },
  });

  // Check length
  if (s1.length !== s2.length) {
    steps.push({
      title: { vi: "Độ dài khác nhau → False", en: "Different lengths → False" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [2, 3],
      vars: [
        { name: "len(s1)", value: s1.length },
        { name: "len(s2)", value: s2.length },
        { name: "result", value: false },
      ],
      note: {
        vi: `len(sentence1)=${s1.length} ≠ len(sentence2)=${s2.length} → False.`,
        en: `len(sentence1)=${s1.length} ≠ len(sentence2)=${s2.length} → False.`,
      },
    });
    return { s1, s2, pairs, answer: false, steps };
  }

  // Check each word
  for (let i = 0; i < s1.length; i++) {
    const w1 = s1[i];
    const w2 = s2[i];

    if (w1 === w2) {
      steps.push({
        title: { vi: `i=${i}: "${w1}" == "${w2}" ✓`, en: `i=${i}: "${w1}" == "${w2}" ✓` },
        arr: s1.map((_, j) => j <= i ? 1 : 0),
        sub: s1.map((w, j) => `${w}↔${s2[j]}`),
        highlight: [i],
        mark: [],
        codeLines: [8, 9, 10],
        vars: [
          { name: "i", value: i },
          { name: "s1[i]", value: w1 },
          { name: "s2[i]", value: w2 },
          { name: "match", value: "identical" },
        ],
        note: {
          vi: `"${w1}" == "${w2}" → giống nhau, bỏ qua.`,
          en: `"${w1}" == "${w2}" → identical, skip.`,
        },
      });
      continue;
    }

    const inSet = pairSet.has(`${w1}|${w2}`);
    if (!inSet) {
      steps.push({
        title: { vi: `i=${i}: "${w1}"↔"${w2}" không tương đồng → False`, en: `i=${i}: "${w1}"↔"${w2}" not similar → False` },
        arr: s1.map((_, j) => j <= i ? 1 : 0),
        sub: s1.map((w, j) => `${w}↔${s2[j]}`),
        highlight: [i],
        mark: [i],
        final: true,
        codeLines: [8, 11, 12],
        vars: [
          { name: "i", value: i },
          { name: "s1[i]", value: w1 },
          { name: "s2[i]", value: w2 },
          { name: "inPairSet", value: false },
          { name: "result", value: false },
        ],
        note: {
          vi: `"${w1}" ≠ "${w2}" và cặp ("${w1}","${w2}") không có trong similarPairs → False.`,
          en: `"${w1}" ≠ "${w2}" and pair ("${w1}","${w2}") is not in similarPairs → False.`,
        },
      });
      return { s1, s2, pairs, answer: false, steps };
    }

    steps.push({
      title: { vi: `i=${i}: "${w1}"↔"${w2}" tương đồng ✓`, en: `i=${i}: "${w1}"↔"${w2}" similar ✓` },
      arr: s1.map((_, j) => j <= i ? 1 : 0),
      sub: s1.map((w, j) => `${w}↔${s2[j]}`),
      highlight: [i],
      mark: [],
      codeLines: [8, 11],
      vars: [
        { name: "i", value: i },
        { name: "s1[i]", value: w1 },
        { name: "s2[i]", value: w2 },
        { name: "inPairSet", value: true },
      ],
      note: {
        vi: `"${w1}" ≠ "${w2}" nhưng cặp ("${w1}","${w2}") có trong similarPairs → tương đồng ✓.`,
        en: `"${w1}" ≠ "${w2}" but pair ("${w1}","${w2}") is in similarPairs → similar ✓.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả: True", en: "Result: True" },
    arr: s1.map(() => 1),
    sub: s1.map((w, i) => `${w}↔${s2[i]}`),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [13],
    vars: [{ name: "result", value: true }],
    note: {
      vi: `Mọi cặp từ đều giống nhau hoặc tương đồng → hai câu tương đồng → True.`,
      en: `All word pairs are identical or similar → the sentences are similar → True.`,
    },
  });

  return { s1, s2, pairs, answer: true, steps };
}

/**
 * Generate steps for LeetCode 760: Find Anagram Mappings.
 * Build a hash map from nums2 (value → index), then map each element of nums1.
 */
function buildSteps760(input, params) {
  const nums1 = String(input).split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const nums2 = String(params.nums2 || "").split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const steps = [];

  // Build index map from nums2
  const indexMap = {};
  for (let i = 0; i < nums2.length; i++) {
    indexMap[nums2[i]] = i;
  }

  const fmtMap = () => {
    const entries = Object.entries(indexMap).map(([k, v]) => `${k}:${v}`);
    return `{${entries.join(", ")}}`;
  };

  steps.push({
    title: { vi: "Xây hash map từ nums2", en: "Build hash map from nums2" },
    arr: [...nums2],
    highlight: nums2.map((_, i) => i),
    mark: [],
    codeLines: [2, 3, 4],
    vars: [
      { name: "nums1", value: `[${nums1.join(", ")}]` },
      { name: "nums2", value: `[${nums2.join(", ")}]` },
      { name: "index_map", value: fmtMap() },
    ],
    note: {
      vi: `Xây hash map: value → index từ nums2. index_map = ${fmtMap()}.`,
      en: `Build hash map: value → index from nums2. index_map = ${fmtMap()}.`,
    },
  });

  const result = [];
  for (let i = 0; i < nums1.length; i++) {
    const val = nums1[i];
    const j = indexMap[val];
    result.push(j);

    steps.push({
      title: { vi: `nums1[${i}]=${val} → index ${j}`, en: `nums1[${i}]=${val} → index ${j}` },
      arr: [...nums2],
      highlight: [j],
      mark: [],
      codeLines: [5],
      vars: [
        { name: "i", value: i },
        { name: "nums1[i]", value: val },
        { name: "index_map[val]", value: j },
        { name: "result", value: `[${result.join(", ")}]` },
      ],
      note: {
        vi: `nums1[${i}]=${val} nằm ở vị trí ${j} trong nums2 → mapping[${i}] = ${j}.`,
        en: `nums1[${i}]=${val} is at position ${j} in nums2 → mapping[${i}] = ${j}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...result],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [5],
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: {
      vi: `Mapping: [${result.join(", ")}].`,
      en: `Mapping: [${result.join(", ")}].`,
    },
  });

  return { nums1, nums2, answer: `[${result.join(", ")}]`, steps };
}

/**
 * Generate steps for LeetCode 771: Jewels and Stones.
 * Build a set from jewels, then count stones that are in the set.
 */
function buildSteps771(input, params) {
  const jewels = String(input);
  const stones = String(params.stones || "");
  const steps = [];
  const jewelSet = new Set(jewels.split(""));

  steps.push({
    title: { vi: "Xây set đá quý", en: "Build jewel set" },
    arr: stones.split("").map(() => 0),
    sub: stones.split(""),
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [
      { name: "jewels", value: jewels },
      { name: "stones", value: stones },
      { name: "jewel_set", value: `{${jewels.split("").join(", ")}}` },
    ],
    note: {
      vi: `Đá quý: "${jewels}" → set = {${jewels.split("").join(", ")}}. Đếm trong "${stones}".`,
      en: `Jewels: "${jewels}" → set = {${jewels.split("").join(", ")}}. Count in "${stones}".`,
    },
  });

  let count = 0;
  const stoneChars = stones.split("");
  for (let i = 0; i < stoneChars.length; i++) {
    const s = stoneChars[i];
    const isJewel = jewelSet.has(s);
    if (isJewel) count++;

    steps.push({
      title: { vi: `i=${i}: '${s}' ${isJewel ? "→ đá quý ✓" : "→ không"}`, en: `i=${i}: '${s}' ${isJewel ? "→ jewel ✓" : "→ not jewel"}` },
      arr: stoneChars.map((c, j) => j <= i ? (jewelSet.has(c) ? 1 : 0) : 0),
      sub: stoneChars,
      highlight: [i],
      mark: isJewel ? [i] : [],
      codeLines: [3, 4, 5, 6],
      vars: [
        { name: "i", value: i },
        { name: "stone", value: s },
        { name: "isJewel", value: isJewel },
        { name: "count", value: count },
      ],
      note: {
        vi: isJewel
          ? `'${s}' ∈ jewel_set → count = ${count}.`
          : `'${s}' ∉ jewel_set → bỏ qua. count = ${count}.`,
        en: isJewel
          ? `'${s}' ∈ jewel_set → count = ${count}.`
          : `'${s}' ∉ jewel_set → skip. count = ${count}.`,
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${count}`, en: `Result: ${count}` },
    arr: stoneChars.map((c) => (jewelSet.has(c) ? 1 : 0)),
    sub: stoneChars,
    highlight: [],
    mark: stoneChars.map((c, i) => (jewelSet.has(c) ? i : -1)).filter((i) => i >= 0),
    final: true,
    codeLines: [7],
    vars: [{ name: "answer", value: count }],
    note: {
      vi: `Có ${count} viên đá là đá quý trong "${stones}".`,
      en: `There are ${count} jewels among the stones in "${stones}".`,
    },
  });

  return { jewels, stones, answer: count, steps };
}

/**
 * Generate steps for LeetCode 1394: Find Lucky Integer in an Array.
 * Count frequencies, then find the largest number whose frequency equals itself.
 */
function buildSteps1394(nums) {
  const steps = [];

  // Count frequencies
  const freq = {};
  for (const num of nums) {
    freq[num] = (freq[num] || 0) + 1;
  }

  const fmtFreq = () => {
    const entries = Object.entries(freq).map(([k, v]) => `${k}:${v}`);
    return `{${entries.join(", ")}}`;
  };

  steps.push({
    title: { vi: "Đếm tần suất", en: "Count frequencies" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4],
    vars: [
      { name: "arr", value: `[${nums.join(", ")}]` },
      { name: "freq", value: fmtFreq() },
    ],
    note: {
      vi: `Đếm tần suất từng số: ${fmtFreq()}.`,
      en: `Count frequency of each number: ${fmtFreq()}.`,
    },
  });

  // Find lucky numbers
  let result = -1;
  const luckyNums = [];
  const entries = Object.entries(freq).sort(([a], [b]) => Number(a) - Number(b));

  for (const [numStr, count] of entries) {
    const num = Number(numStr);
    const isLucky = num === count;
    if (isLucky) {
      luckyNums.push(num);
      result = Math.max(result, num);
    }

    steps.push({
      title: { vi: `${num}: freq=${count} ${isLucky ? "= num → lucky ✓" : "≠ num"}`, en: `${num}: freq=${count} ${isLucky ? "= num → lucky ✓" : "≠ num"}` },
      arr: [...nums],
      highlight: nums.map((v, i) => v === num ? i : -1).filter((i) => i >= 0),
      mark: isLucky ? nums.map((v, i) => v === num ? i : -1).filter((i) => i >= 0) : [],
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "num", value: num },
        { name: "count", value: count },
        { name: "isLucky", value: isLucky },
        { name: "result", value: result },
      ],
      note: {
        vi: isLucky
          ? `${num} xuất hiện ${count} lần = chính nó → lucky! result = ${result}.`
          : `${num} xuất hiện ${count} lần ≠ ${num} → không phải lucky.`,
        en: isLucky
          ? `${num} appears ${count} times = itself → lucky! result = ${result}.`
          : `${num} appears ${count} times ≠ ${num} → not lucky.`,
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${result}`, en: `Result: ${result}` },
    arr: [...nums],
    highlight: [],
    mark: result > 0 ? nums.map((v, i) => v === result ? i : -1).filter((i) => i >= 0) : [],
    final: true,
    codeLines: [9],
    vars: [
      { name: "lucky_numbers", value: luckyNums.length ? `[${luckyNums.join(", ")}]` : "none" },
      { name: "answer", value: result },
    ],
    note: {
      vi: result === -1
        ? "Không có số lucky nào → trả về -1."
        : `Số lucky lớn nhất = ${result}.`,
      en: result === -1
        ? "No lucky number exists → return -1."
        : `Largest lucky number = ${result}.`,
    },
  });

  return { original: [...nums], answer: result, steps };
}

/**
 * Generate steps for LeetCode 1399: Count Largest Group.
 * Group numbers 1..n by digit sum, find how many groups have the max size.
 */
function buildSteps1399(input) {
  const n = input[0];
  const steps = [];
  const groups = {};

  // Build groups
  for (let i = 1; i <= n; i++) {
    const digitSum = String(i).split("").reduce((s, d) => s + Number(d), 0);
    if (!groups[digitSum]) groups[digitSum] = [];
    groups[digitSum].push(i);
  }

  const sortedKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);
  const groupSizes = sortedKeys.map((k) => groups[k].length);
  const groupLabels = sortedKeys.map((k) => `Σ=${k}`);

  steps.push({
    title: { vi: "Nhóm theo tổng chữ số", en: "Group by digit sum" },
    arr: groupSizes,
    sub: groupLabels,
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "groups", value: sortedKeys.length },
    ],
    note: {
      vi: `Nhóm các số 1..${n} theo tổng chữ số. Có ${sortedKeys.length} nhóm.`,
      en: `Group numbers 1..${n} by digit sum. There are ${sortedKeys.length} groups.`,
    },
  });

  // Show each group
  for (const key of sortedKeys) {
    const members = groups[key];
    const idx = sortedKeys.indexOf(key);
    steps.push({
      title: { vi: `Σ=${key}: [${members.join(",")}] (${members.length})`, en: `Σ=${key}: [${members.join(",")}] (${members.length})` },
      arr: groupSizes,
      sub: groupLabels,
      highlight: [idx],
      mark: [],
      codeLines: [3, 4, 5],
      vars: [
        { name: "digit_sum", value: key },
        { name: "members", value: `[${members.join(", ")}]` },
        { name: "size", value: members.length },
      ],
      note: {
        vi: `Nhóm tổng chữ số = ${key}: gồm ${members.length} số [${members.join(", ")}].`,
        en: `Group with digit sum = ${key}: contains ${members.length} numbers [${members.join(", ")}].`,
      },
    });
  }

  // Find max and count
  const maxSize = Math.max(...groupSizes);
  const largestGroups = sortedKeys.filter((k) => groups[k].length === maxSize);
  const answer = largestGroups.length;

  const maxIndices = sortedKeys.map((k, i) => groups[k].length === maxSize ? i : -1).filter((i) => i >= 0);

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: groupSizes,
    sub: groupLabels,
    highlight: [],
    mark: maxIndices,
    final: true,
    codeLines: [6, 7],
    vars: [
      { name: "max_size", value: maxSize },
      { name: "largest_groups", value: largestGroups.map((k) => `Σ=${k}`).join(", ") },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Kích thước nhóm lớn nhất = ${maxSize}. Có ${answer} nhóm đạt kích thước này: [${largestGroups.map((k) => `Σ=${k}`).join(", ")}].`,
      en: `Largest group size = ${maxSize}. There are ${answer} groups with this size: [${largestGroups.map((k) => `Σ=${k}`).join(", ")}].`,
    },
  });

  return { n, answer, steps };
}

module.exports = {
  3020: {
    id: 3020,
    difficulty: "medium",
    slug: "find-the-maximum-number-of-elements-in-subset",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Find the Maximum Number of Elements in a Subset", en: "Find the Maximum Number of Elements in a Subset" },
    titleVi: { vi: "Số phần tử lớn nhất trong tập con theo mẫu lũy thừa", en: "Largest subset following the power pattern" },
    statement: {
      vi:
        "Cho mảng số nguyên dương nums. Chọn một tập con và xếp thành mảng theo mẫu " +
        "[x, x², x⁴, …, x^(k/2), x^k, x^(k/2), …, x⁴, x², x] (k là lũy thừa của 2). " +
        "Trả về số phần tử lớn nhất của một tập con như vậy.",
      en:
        "You are given an array of positive integers nums. Select a subset that can be placed in an array following the pattern " +
        "[x, x², x⁴, …, x^(k/2), x^k, x^(k/2), …, x⁴, x², x] (k is a power of 2). " +
        "Return the maximum number of elements in such a subset.",
    },
    defaultInput: [5, 4, 1, 2, 2],
    inputKind: "positive", // số nguyên dương
    extraParams: [],
    complexity: {
      time: "O(n log(max))",
      space: "O(n)",
      note: {
        vi: "Với mỗi cơ số, chuỗi lũy thừa dài tối đa O(log(max)) mức; tổng cộng O(n log(max)). Bảng tần suất tốn O(n) bộ nhớ.",
        en: "For each base, the power chain has at most O(log(max)) levels; overall O(n log(max)). The frequency map uses O(n) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def maximumLength(self, nums):",
      "        freq = Counter(nums)",
      "        ans = 1",
      "        for x in set(nums):",
      "            if x == 1:",
      "                cnt = freq[1]",
      "                ans = max(ans, cnt - (cnt % 2 == 0))",
      "                continue",
      "            cnt = 0",
      "            cur = x",
      "            while freq[cur] >= 2:",
      "                cnt += 2",
      "                cur = cur * cur",
      "            cnt += 1 if freq[cur] >= 1 else -1",
      "            ans = max(ans, cnt)",
      "        return ans",
    ],
    builder: buildSteps3020,
  },
  1: {
    id: 1,
    difficulty: "easy",
    slug: "two-sum",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Two Sum", en: "Two Sum" },
    titleVi: { vi: "Tổng hai số", en: "Two sum" },
    statement: {
      vi: "Cho mảng số nguyên nums và một số nguyên target, trả về chỉ số của hai số sao cho tổng của chúng bằng target. Mỗi đầu vào có đúng một đáp án và không dùng cùng một phần tử hai lần.",
      en: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution, and you may not use the same element twice.",
    },
    defaultInput: [2, 7, 11, 15],
    inputKind: "integer", // cho phép số âm
    extraParams: [
      {
        key: "target",
        label: { vi: "target (tổng cần tìm)", en: "target (target sum)" },
        default: 9,
        allowNegative: true,
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyệt mảng một lần, mỗi lần tra cứu/chèn hash map là O(1) trung bình nên O(n) thời gian. Hash map lưu tối đa n phần tử nên O(n) bộ nhớ.",
        en: "A single pass with O(1) average hash-map lookups/inserts gives O(n) time. The hash map holds up to n entries, so O(n) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def twoSum(self, nums, target):",
      "        seen = {}",
      "        for i in range(len(nums)):",
      "            complement = target - nums[i]",
      "            if complement in seen:",
      "                return [i, seen[complement]]",
      "            seen[nums[i]] = i",
    ],
    builder: buildSteps1,
  },
  205: {
    id: 205,
    difficulty: "easy",
    slug: "isomorphic-strings",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Isomorphic Strings", en: "Isomorphic Strings" },
    titleVi: { vi: "Chuỗi đẳng cấu", en: "Isomorphic strings" },
    statement: {
      vi:
        "Cho hai chuỗi s và t, xác định xem chúng có đẳng cấu không. " +
        "Hai chuỗi đẳng cấu nếu mỗi ký tự trong s có thể được ánh xạ 1-1 sang ký tự trong t (giữ nguyên thứ tự). " +
        "Không có hai ký tự khác nhau ánh xạ sang cùng một ký tự, và ngược lại.",
      en:
        "Given two strings s and t, determine if they are isomorphic. " +
        "Two strings are isomorphic if each character in s can be mapped one-to-one to a character in t (preserving order). " +
        "No two different characters may map to the same character, and vice versa.",
    },
    defaultInput: "egg",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [
      {
        key: "t",
        type: "string",
        label: { vi: "Chuỗi t", en: "String t" },
        default: "add",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt chuỗi một lần O(n). Bảng ánh xạ tối đa 256 ký tự ASCII → O(1) bộ nhớ.",
        en: "Single pass O(n). Mapping tables hold at most 256 ASCII characters → O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def isIsomorphic(self, s: str, t: str) -> bool:",
      "        if len(s) != len(t):",
      "            return False",
      "        s_to_t = {}",
      "        t_to_s = {}",
      "        for i in range(len(s)):",
      "            char_s, char_t = s[i], t[i]",
      "            if char_s in s_to_t:",
      "                if s_to_t[char_s] != char_t:",
      "                    return False",
      "            else:",
      "                if char_t in t_to_s:",
      "                    return False",
      "                s_to_t[char_s] = char_t",
      "                t_to_s[char_t] = char_s",
      "        return True",
    ],
    builder: buildSteps205,
  },
  734: {
    id: 734,
    difficulty: "easy",
    slug: "sentence-similarity",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Sentence Similarity", en: "Sentence Similarity" },
    titleVi: { vi: "Độ tương đồng câu", en: "Sentence similarity" },
    statement: {
      vi:
        "Cho hai câu sentence1 và sentence2 (mỗi câu là danh sách từ) và danh sách cặp từ tương đồng similarPairs. " +
        "Hai câu tương đồng nếu chúng cùng độ dài và mỗi cặp từ tương ứng hoặc giống nhau, hoặc nằm trong similarPairs. " +
        "Lưu ý: quan hệ tương đồng KHÔNG bắc cầu (similar(a,b) và similar(b,c) KHÔNG suy ra similar(a,c)).",
      en:
        "Given two sentences sentence1 and sentence2 (each a list of words) and a list of similar word pairs similarPairs. " +
        "Two sentences are similar if they have the same length and each corresponding pair of words is either identical or in similarPairs. " +
        "Note: similarity is NOT transitive (similar(a,b) and similar(b,c) does NOT imply similar(a,c)).",
    },
    defaultInput: "great,acting,skills",
    inputKind: "string",
    inputLabel: { vi: "sentence1 (từ cách nhau bởi dấu phẩy)", en: "sentence1 (words comma separated)" },
    extraParams: [
      {
        key: "sentence2",
        type: "string",
        label: { vi: "sentence2 (từ cách nhau bởi dấu phẩy)", en: "sentence2 (words comma separated)" },
        default: "fine,drama,talent",
      },
      {
        key: "pairs",
        type: "string",
        label: { vi: "similarPairs (vd: great-fine,acting-drama)", en: "similarPairs (e.g. great-fine,acting-drama)" },
        default: "great-fine,acting-drama,skills-talent",
      },
    ],
    complexity: {
      time: "O(N + P)",
      space: "O(P)",
      note: {
        vi: "Xây set từ P cặp: O(P). Duyệt N từ, mỗi từ tra set O(1): O(N). Tổng O(N+P). Bộ nhớ O(P) cho set.",
        en: "Build set from P pairs: O(P). Iterate N words, each set lookup O(1): O(N). Total O(N+P). Memory O(P) for the set.",
      },
    },
    code: [
      "class Solution:",
      "    def areSentencesSimilar(self, s1, s2, pairs):",
      "        if len(s1) != len(s2):",
      "            return False",
      "        pairSet = set()",
      "        for a, b in pairs:",
      "            pairSet.add((a, b))",
      "            pairSet.add((b, a))",
      "        for i in range(len(s1)):",
      "            if s1[i] == s2[i]:",
      "                continue",
      "            if (s1[i], s2[i]) not in pairSet:",
      "                return False",
      "        return True",
    ],
    builder: buildSteps734,
  },
  760: {
    id: 760,
    difficulty: "easy",
    slug: "find-anagram-mappings",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Find Anagram Mappings", en: "Find Anagram Mappings" },
    titleVi: { vi: "Tìm ánh xạ Anagram", en: "Find anagram mappings" },
    statement: {
      vi:
        "Cho hai mảng nums1 và nums2, trong đó nums2 là một hoán vị (anagram) của nums1. " +
        "Trả về mảng mapping sao cho mapping[i] = j nghĩa là nums1[i] xuất hiện tại nums2[j]. " +
        "Nếu có nhiều đáp án, trả về bất kỳ đáp án hợp lệ nào.",
      en:
        "Given two arrays nums1 and nums2 where nums2 is an anagram of nums1. " +
        "Return an array mapping such that mapping[i] = j means nums1[i] appears at nums2[j]. " +
        "If there are multiple answers, return any valid one.",
    },
    defaultInput: "12,28,46,32,50",
    inputKind: "string",
    inputLabel: { vi: "nums1 (cách nhau bởi dấu phẩy)", en: "nums1 (comma separated)" },
    extraParams: [
      {
        key: "nums2",
        type: "string",
        label: { vi: "nums2 (hoán vị của nums1)", en: "nums2 (anagram of nums1)" },
        default: "50,12,32,46,28",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Xây hash map từ nums2: O(n). Duyệt nums1, mỗi phần tử tra O(1): O(n). Bộ nhớ O(n) cho map.",
        en: "Build hash map from nums2: O(n). Iterate nums1, each lookup O(1): O(n). Memory O(n) for the map.",
      },
    },
    code: [
      "class Solution:",
      "    def anagramMappings(self, nums1, nums2):",
      "        index_map = {}",
      "        for i, num in enumerate(nums2):",
      "            index_map[num] = i",
      "        return [index_map[num] for num in nums1]",
    ],
    builder: buildSteps760,
  },
  771: {
    id: 771,
    difficulty: "easy",
    slug: "jewels-and-stones",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Jewels and Stones", en: "Jewels and Stones" },
    titleVi: { vi: "Đá quý và Đá", en: "Jewels and stones" },
    statement: {
      vi:
        "Cho chuỗi jewels chứa các loại đá quý (mỗi ký tự là một loại) và chuỗi stones chứa các viên đá bạn có. " +
        "Đếm số viên đá trong stones cũng là đá quý. Phân biệt hoa thường.",
      en:
        "Given a string jewels representing types of stones that are jewels, and a string stones representing stones you have. " +
        "Count how many of your stones are also jewels. Letters are case sensitive.",
    },
    defaultInput: "aA",
    inputKind: "string",
    inputLabel: { vi: "jewels (các loại đá quý)", en: "jewels (jewel types)" },
    extraParams: [
      {
        key: "stones",
        type: "string",
        label: { vi: "stones (các viên đá bạn có)", en: "stones (your stones)" },
        default: "aAAbbbb",
      },
    ],
    complexity: {
      time: "O(J + S)",
      space: "O(J)",
      note: {
        vi: "Xây set từ jewels: O(J). Duyệt stones, mỗi ký tự tra set O(1): O(S). Bộ nhớ O(J).",
        en: "Build set from jewels: O(J). Iterate stones, each set lookup O(1): O(S). Memory O(J).",
      },
    },
    code: [
      "class Solution:",
      "    def numJewelsInStones(self, jewels, stones):",
      "        jewel_set = set(jewels)",
      "        count = 0",
      "        for s in stones:",
      "            if s in jewel_set:",
      "                count += 1",
      "        return count",
    ],
    builder: buildSteps771,
  },
  1394: {
    id: 1394,
    difficulty: "easy",
    slug: "find-lucky-integer-in-an-array",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Find Lucky Integer in an Array", en: "Find Lucky Integer in an Array" },
    titleVi: { vi: "Tìm số may mắn trong mảng", en: "Find lucky integer" },
    statement: {
      vi:
        "Cho mảng số nguyên arr. Một số nguyên 'lucky' nếu tần suất xuất hiện của nó trong mảng bằng chính giá trị đó. " +
        "Trả về số lucky lớn nhất. Nếu không có, trả về -1.",
      en:
        "Given an array of integers arr. An integer is 'lucky' if its frequency in the array equals its value. " +
        "Return the largest lucky number. If none exists, return -1.",
    },
    defaultInput: [2, 2, 3, 4],
    inputKind: "positive",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Đếm tần suất O(n), duyệt map tìm lucky O(n). Bộ nhớ O(n) cho frequency map.",
        en: "Count frequencies O(n), iterate map to find lucky O(n). Memory O(n) for frequency map.",
      },
    },
    code: [
      "class Solution:",
      "    def findLucky(self, arr):",
      "        freq = {}",
      "        for num in arr:",
      "            freq[num] = freq.get(num, 0) + 1",
      "        result = -1",
      "        for num, count in freq.items():",
      "            if num == count:",
      "                result = max(result, num)",
      "        return result",
    ],
    builder: buildSteps1394,
  },
  1399: {
    id: 1399,
    difficulty: "easy",
    slug: "count-largest-group",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Count Largest Group", en: "Count Largest Group" },
    titleVi: { vi: "Đếm nhóm lớn nhất", en: "Count largest group" },
    statement: {
      vi:
        "Cho số nguyên n. Nhóm các số từ 1 đến n theo tổng các chữ số. " +
        "Trả về số lượng nhóm có kích thước lớn nhất.",
      en:
        "Given an integer n. Group numbers from 1 to n by their digit sum. " +
        "Return the number of groups that have the largest size.",
    },
    defaultInput: [13],
    inputKind: "positive",
    singleInput: true,
    maxInput: 100,
    inputLabel: { vi: "n", en: "n" },
    extraParams: [],
    complexity: {
      time: "O(n · log₁₀(n))",
      space: "O(n)",
      note: {
        vi: "Duyệt n số, mỗi số tính tổng chữ số O(log₁₀(n)). Bộ nhớ O(n) cho map nhóm.",
        en: "Iterate n numbers, digit sum of each is O(log₁₀(n)). Memory O(n) for group map.",
      },
    },
    code: [
      "class Solution:",
      "    def countLargestGroup(self, n: int) -> int:",
      "        groups = {}",
      "        for i in range(1, n + 1):",
      "            digit_sum = sum(int(d) for d in str(i))",
      "            groups[digit_sum] = groups.get(digit_sum, 0) + 1",
      "        max_size = max(groups.values())",
      "        return sum(1 for v in groups.values() if v == max_size)",
    ],
    builder: buildSteps1399,
  },
};
