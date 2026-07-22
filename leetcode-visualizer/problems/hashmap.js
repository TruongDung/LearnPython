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
      { name: "seen", value: dictStr() },
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
        codeLines: [7],
        vars: [
          { name: "i", value: i },
          { name: "comp", value: comp },
          { name: "j", value: j },
          { name: "seen", value: dictStr() },
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
        { name: "seen", value: dictStr() },
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
      codeLines: [8],
      vars: [{ name: "seen", value: dictStr() }],
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
  const states = Array.from({ length: Math.max(s1.length, s2.length) }, () => "pending");

  // Build pair set
  const pairSet = new Set();
  for (const [a, b] of pairs) {
    pairSet.add(`${a}|${b}`);
    pairSet.add(`${b}|${a}`);
  }

  function makeSentenceView(current = -1, relation = "pending") {
    const hasCurrent = current >= 0 && current < Math.max(s1.length, s2.length);
    return {
      sentence1: s1,
      sentence2: s2,
      states: states.slice(),
      current,
      pairs: pairs.map(([a, b]) => `${a} <-> ${b}`),
      status: [
        { label: "index", value: hasCurrent ? current : "-" },
        { label: "sentence1[i]", value: hasCurrent ? (s1[current] || "missing") : "-" },
        { label: "sentence2[i]", value: hasCurrent ? (s2[current] || "missing") : "-" },
        { label: "relation", value: relation },
      ],
    };
  }

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: s1.map(() => 0),
    sub: s1.map((w, i) => `${w}↔${s2[i] || "?"}`),
    highlight: [],
    mark: [],
    codeLines: [10],
    sentenceView: makeSentenceView(-1, "pair set ready"),
    vars: [
      { name: "sentence1", value: `[${s1.join(", ")}]` },
      { name: "sentence2", value: `[${s2.join(", ")}]` },
      { name: "similarPairs", value: pairs.map(([a, b]) => `(${a},${b})`).join(", ") },
      { name: "pair_set size", value: pairSet.size },
    ],
    note: {
      vi: `sentence1 = [${s1.join(", ")}], sentence2 = [${s2.join(", ")}]. Xây set từ ${pairs.length} cặp tương đồng.`,
      en: `sentence1 = [${s1.join(", ")}], sentence2 = [${s2.join(", ")}]. Build set from ${pairs.length} similar pairs.`,
    },
  });

  // Check length
  if (s1.length !== s2.length) {
    for (let i = 0; i < states.length; i++) states[i] = "different";
    steps.push({
      title: { vi: "Độ dài khác nhau → False", en: "Different lengths → False" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      sentenceView: makeSentenceView(-1, "different lengths"),
      vars: [
        { name: "len(sentence1)", value: s1.length },
        { name: "len(sentence2)", value: s2.length },
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
      states[i] = "identical";
      steps.push({
        title: { vi: `i=${i}: "${w1}" == "${w2}" ✓`, en: `i=${i}: "${w1}" == "${w2}" ✓` },
        arr: s1.map((_, j) => j <= i ? 1 : 0),
        sub: s1.map((w, j) => `${w}↔${s2[j]}`),
        highlight: [i],
        mark: [],
        codeLines: [13],
        sentenceView: makeSentenceView(i, "identical"),
        vars: [
          { name: "i", value: i },
          { name: "sentence1[i]", value: w1 },
          { name: "sentence2[i]", value: w2 },
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
      states[i] = "different";
      steps.push({
        title: { vi: `i=${i}: "${w1}"↔"${w2}" không tương đồng → False`, en: `i=${i}: "${w1}"↔"${w2}" not similar → False` },
        arr: s1.map((_, j) => j <= i ? 1 : 0),
        sub: s1.map((w, j) => `${w}↔${s2[j]}`),
        highlight: [i],
        mark: [i],
        final: true,
        codeLines: [15],
        sentenceView: makeSentenceView(i, "not similar"),
        vars: [
          { name: "i", value: i },
          { name: "sentence1[i]", value: w1 },
          { name: "sentence2[i]", value: w2 },
          { name: "in pair_set", value: false },
          { name: "result", value: false },
        ],
        note: {
          vi: `"${w1}" ≠ "${w2}" và cặp ("${w1}","${w2}") không có trong similarPairs → False.`,
          en: `"${w1}" ≠ "${w2}" and pair ("${w1}","${w2}") is not in similarPairs → False.`,
        },
      });
      return { s1, s2, pairs, answer: false, steps };
    }

    states[i] = "similar";
    steps.push({
      title: { vi: `i=${i}: "${w1}"↔"${w2}" tương đồng ✓`, en: `i=${i}: "${w1}"↔"${w2}" similar ✓` },
      arr: s1.map((_, j) => j <= i ? 1 : 0),
      sub: s1.map((w, j) => `${w}↔${s2[j]}`),
      highlight: [i],
      mark: [],
      codeLines: [14],
      sentenceView: makeSentenceView(i, "similar pair"),
      vars: [
        { name: "i", value: i },
        { name: "sentence1[i]", value: w1 },
        { name: "sentence2[i]", value: w2 },
        { name: "in pair_set", value: true },
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
    codeLines: [16],
    sentenceView: makeSentenceView(-1, "all pairs pass"),
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

function buildSteps523(nums, params) {
  const parsedK = Number.parseInt(params && params.k, 10);
  const k = Number.isInteger(parsedK) && parsedK > 0 ? parsedK : 1;
  const firstSeen = new Map([[0, -1]]);
  const prefixSums = new Array(nums.length).fill(null);
  const remainders = new Array(nums.length).fill(null);
  const steps = [];
  const localized = (vi, en) => ({ vi, en });
  const booleanText = (value) => localized(value ? "Đúng" : "Sai", value ? "True" : "False");

  const mapEntries = () => [...firstSeen.entries()].map(([remainder, index]) => ({ remainder, index }));
  const mapString = () => `{${mapEntries().map((entry) => `${entry.remainder}: ${entry.index}`).join(", ")}}`;
  const makeView = ({ current = -1, matchStart = -1, matchEnd = -1, matchState = "", proof = null, status = [] } = {}) => ({
    nums: [...nums],
    prefixSums: [...prefixSums],
    remainders: [...remainders],
    current,
    matchStart,
    matchEnd,
    matchState,
    proof,
    entries: mapEntries(),
    status,
  });
  const makeProof = (previous, current, remainder, state) => {
    const previousSum = previous === -1 ? 0 : prefixSums[previous];
    const currentSum = prefixSums[current];
    const start = previous + 1;
    return {
      previousIndex: previous,
      previousSum,
      currentIndex: current,
      currentSum,
      remainder,
      k,
      start,
      end: current,
      subarray: nums.slice(start, current + 1),
      subarraySum: currentSum - previousSum,
      length: current - previous,
      state,
    };
  };
  const loopVars = (i, prefixSum, remainder, extras = []) => {
    const vars = [
      { name: "i", value: i },
      { name: "num", value: nums[i] },
      { name: "prefix_sum", value: prefixSum },
    ];
    if (remainder !== undefined) vars.push({ name: "remainder", value: remainder });
    vars.push({ name: "first_seen", value: mapString() }, ...extras);
    return vars;
  };

  steps.push({
    title: { vi: "Khởi tạo first_seen = {0: -1}", en: "Initialize first_seen = {0: -1}" },
    codeLines: [3],
    prefixRemainderView: makeView({
      status: [
        { label: "k", value: k },
        { label: localized("bảng chỉ số đầu tiên", "first_seen"), value: "{0: -1}" },
      ],
    }),
    vars: [{ name: "k", value: k }, { name: "first_seen", value: "{0: -1}" }],
    note: {
      vi: "Hãy tưởng tượng trước phần tử đầu tiên có một tổng tiền tố bằng 0 tại chỉ số -1. Nhờ mốc giả này, thuật toán có thể nhận ra đoạn con hợp lệ bắt đầu từ chỉ số 0.",
      en: "Remainder 0 at index -1 lets a valid subarray starting at index 0 be detected.",
    },
  });

  let prefixSum = 0;
  steps.push({
    title: { vi: "Khởi tạo tổng tiền tố bằng 0", en: "Initialize prefix_sum = 0" },
    codeLines: [4],
    prefixRemainderView: makeView({
      status: [
        { label: localized("tổng tiền tố", "prefix_sum"), value: prefixSum },
        { label: localized("bảng chỉ số đầu tiên", "first_seen"), value: mapString() },
      ],
    }),
    vars: [
      { name: "k", value: k },
      { name: "prefix_sum", value: prefixSum },
      { name: "first_seen", value: mapString() },
    ],
    note: {
      vi: "prefix_sum là tổng từ nums[0] đến vị trí hiện tại. Trước khi đọc phần tử nào, tổng này bằng 0.",
      en: "Start with prefix sum 0 before iterating through nums.",
    },
  });

  let answer = false;
  for (let i = 0; i < nums.length; i += 1) {
    steps.push({
      title: { vi: `Vòng lặp lấy i = ${i}, num = ${nums[i]}`, en: `Loop binds i = ${i}, num = ${nums[i]}` },
      codeLines: [5],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: localized("chỉ số i", "i"), value: i },
          { label: localized("giá trị num", "num"), value: nums[i] },
          { label: localized("tổng trước khi cộng", "prefix_sum before"), value: prefixSum },
        ],
      }),
      vars: loopVars(i, prefixSum),
      note: {
        vi: `Bắt đầu xử lý nums[${i}] = ${nums[i]}. Dòng 5 mới chỉ lấy i và num; tổng tiền tố vẫn là ${prefixSum}.`,
        en: `Start iteration ${i}; line 5 only binds i and num, before adding num to prefix_sum.`,
      },
    });

    prefixSum += nums[i];
    prefixSums[i] = prefixSum;
    steps.push({
      title: { vi: `Cộng nums[${i}] = ${nums[i]} vào tổng tiền tố`, en: `Add nums[${i}] = ${nums[i]}` },
      codeLines: [6],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: localized("chỉ số", "index"), value: i },
          { label: localized("tổng nums[0..i]", "prefix sum"), value: prefixSum },
          { label: "k", value: k },
        ],
      }),
      vars: loopVars(i, prefixSum),
      note: {
        vi: `Sau phép cộng, tổng của đoạn nums[0..${i}] bằng ${prefixSum}.`,
        en: `The prefix sum through index ${i} is ${prefixSum}.`,
      },
    });

    const remainder = prefixSum % k;
    remainders[i] = remainder;
    steps.push({
      title: { vi: `${prefixSum} % ${k} = ${remainder}`, en: `${prefixSum} % ${k} = ${remainder}` },
      codeLines: [7],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: localized("tổng tiền tố", "prefix sum"), value: prefixSum },
          { label: localized("phần dư", "remainder"), value: remainder },
          {
            label: localized("chỉ số đầu tiên", "first seen"),
            value: firstSeen.has(remainder)
              ? firstSeen.get(remainder)
              : localized("chưa từng xuất hiện", "not stored"),
          },
        ],
      }),
      vars: loopVars(i, prefixSum, remainder),
      note: {
        vi: `Tổng tiền tố ${prefixSum} có phần dư ${remainder} khi chia cho ${k}. Nếu phần dư này từng xuất hiện, hiệu của hai tổng tiền tố sẽ chia hết cho ${k}.`,
        en: `Two prefix sums with the same remainder differ by a multiple of ${k}.`,
      },
    });

    const wasSeen = firstSeen.has(remainder);
    const previousAtCheck = wasSeen ? firstSeen.get(remainder) : null;
    steps.push({
      title: {
        vi: `Phần dư ${remainder} đã xuất hiện chưa? ${wasSeen ? "Đúng" : "Sai"}`,
        en: `Check ${remainder} in first_seen: ${wasSeen ? "True" : "False"}`,
      },
      codeLines: [8],
      prefixRemainderView: makeView({
        current: i,
        proof: wasSeen ? makeProof(previousAtCheck, i, remainder, "candidate") : null,
        status: [
          { label: localized("phần dư hiện tại", "remainder"), value: remainder },
          { label: localized("đã có trong bảng", "in first_seen"), value: booleanText(wasSeen) },
          {
            label: localized("chỉ số sớm nhất", "earliest index"),
            value: wasSeen ? firstSeen.get(remainder) : localized("chưa có", "not stored"),
          },
        ],
      }),
      vars: loopVars(i, prefixSum, remainder, [
        { name: "remainder in first_seen", value: wasSeen },
      ]),
      note: {
        vi: wasSeen
          ? `Phần dư ${remainder} đã xuất hiện lần đầu tại chỉ số ${firstSeen.get(remainder)}. Vì vậy tổng của đoạn từ chỉ số ${firstSeen.get(remainder) + 1} đến ${i} chia hết cho ${k}; tiếp theo phải kiểm tra đoạn này có ít nhất 2 phần tử hay không.`
          : `Phần dư ${remainder} chưa từng xuất hiện. Chưa thể tạo đoạn con có tổng chia hết cho ${k}, nên đi vào nhánh else để lưu chỉ số ${i}.`,
        en: wasSeen
          ? `Remainder ${remainder} is already in the map, so evaluate the length on line 9.`
          : `Remainder ${remainder} is not in the map, so enter the else branch on line 11.`,
      },
    });

    if (wasSeen) {
      const previous = firstSeen.get(remainder);
      const length = i - previous;
      const start = previous + 1;
      steps.push({
        title: {
          vi: `Độ dài = ${i} - (${previous}) = ${length}; có đủ 2 phần tử? ${length >= 2 ? "Đúng" : "Sai"}`,
          en: `${i} - (${previous}) >= 2: ${length >= 2 ? "True" : "False"}`,
        },
        codeLines: [9],
        prefixRemainderView: makeView({
          current: i,
          matchStart: start,
          matchEnd: i,
          matchState: length >= 2 ? "valid" : "too-short",
          proof: makeProof(previous, i, remainder, length >= 2 ? "valid" : "too-short"),
          status: [
            { label: localized("chỉ số có cùng phần dư", "first index"), value: previous },
            { label: localized("đoạn đang kiểm tra", "candidate"), value: `[${start}..${i}]` },
            { label: localized("độ dài", "length"), value: length },
            { label: localized("độ dài >= 2", "length >= 2"), value: booleanText(length >= 2) },
          ],
        }),
        vars: loopVars(i, prefixSum, remainder, [
          { name: `first_seen[${remainder}]`, value: previous },
          { name: "length", value: `${i} - (${previous}) = ${length}` },
          { name: "length >= 2", value: length >= 2 },
        ]),
        note: {
          vi: length >= 2
            ? `Đoạn nums[${start}..${i}] = [${nums.slice(start, i + 1).join(", ")}] có tổng chia hết cho ${k} và dài ${length}, nên hợp lệ.`
            : `Đoạn nums[${start}..${i}] chỉ dài ${length}, nên chưa hợp lệ. Vẫn giữ chỉ số sớm nhất ${previous}; không ghi đè bằng ${i}, để lần lặp sau có thể tạo đoạn dài ít nhất 2.`,
          en: length >= 2
            ? `Candidate nums[${start}..${i}] has length ${length}, satisfying the minimum length of 2.`
            : `Candidate nums[${start}..${i}] has length ${length}, so it is too short. Keep the earliest index ${previous}.`,
        },
      });

      if (length >= 2) {
        answer = true;
        steps.push({
          title: { vi: `Tìm thấy đoạn con hợp lệ [${start}..${i}]`, en: `Found subarray [${start}..${i}]` },
          codeLines: [10],
          prefixRemainderView: makeView({
            current: i,
            matchStart: start,
            matchEnd: i,
            matchState: "valid",
            proof: makeProof(previous, i, remainder, "valid"),
            status: [
              { label: localized("đoạn con", "subarray"), value: `[${start}..${i}]` },
              { label: localized("độ dài", "length"), value: length },
              { label: localized("kết quả", "result"), value: localized("Đúng", "True") },
            ],
          }),
          vars: loopVars(i, prefixSum, remainder, [
            { name: "length", value: length },
            { name: "result", value: true },
          ]),
          note: {
            vi: `Trả về True vì đoạn liên tiếp nums[${start}..${i}] = [${nums.slice(start, i + 1).join(", ")}] có ${length} phần tử và tổng của nó chia hết cho ${k}.`,
            en: `Length ${length} is at least 2, so contiguous subarray [${nums.slice(start, i + 1).join(", ")}] is valid.`,
          },
          final: true,
        });
        break;
      }
    } else {
      steps.push({
        title: { vi: "Đi vào nhánh else", en: "Enter the else branch" },
        codeLines: [11],
        prefixRemainderView: makeView({
          current: i,
          status: [
            { label: localized("phần dư", "remainder"), value: remainder },
            { label: localized("đã có trong bảng", "in first_seen"), value: booleanText(false) },
            { label: localized("hành động tiếp theo", "next action"), value: localized(`lưu ${remainder} -> ${i}`, `store ${remainder} -> ${i}`) },
          ],
        }),
        vars: loopVars(i, prefixSum, remainder),
        note: {
          vi: `Điều kiện ở dòng 8 là Sai. Tại dòng 11, bảng first_seen vẫn chưa thay đổi; dòng 12 mới thực hiện việc lưu.`,
          en: "The line 8 condition is False; the map has not changed yet on line 11.",
        },
      });

      firstSeen.set(remainder, i);
      steps.push({
        title: { vi: `Lưu phần dư ${remainder} lần đầu tại chỉ số ${i}`, en: `Store remainder ${remainder} at index ${i}` },
        codeLines: [12],
        prefixRemainderView: makeView({
          current: i,
          status: [
            { label: localized("vừa lưu", "stored"), value: `${remainder} -> ${i}` },
            { label: localized("số phần dư đã lưu", "map size"), value: firstSeen.size },
          ],
        }),
        vars: loopVars(i, prefixSum, remainder),
        note: {
          vi: `Ghi first_seen[${remainder}] = ${i}. Mỗi phần dư chỉ được lưu lần đầu; chỉ số càng sớm thì đoạn con tìm được về sau càng dài và dễ đạt điều kiện độ dài >= 2.`,
          en: "Keep only the earliest index for each remainder to maximize the possible subarray length.",
        },
      });
    }
  }

  if (!answer) {
    steps.push({
      title: { vi: "Không có đoạn con hợp lệ", en: "No valid subarray" },
      codeLines: [13],
      prefixRemainderView: makeView({
        status: [
          { label: localized("số phần tử đã kiểm tra", "checked"), value: nums.length },
          { label: localized("kết quả", "result"), value: localized("Sai", "False") },
        ],
      }),
      vars: [
        { name: "prefix_sum", value: prefixSum },
        { name: "first_seen", value: mapString() },
        { name: "result", value: false },
      ],
      note: {
        vi: "Đã duyệt hết mảng nhưng không tìm được hai tổng tiền tố có cùng phần dư và cách nhau ít nhất 2 vị trí, nên trả về False.",
        en: "No matching prefix remainders are at least two indices apart.",
      },
      final: true,
    });
  }

  return { steps, answer };
}

function buildSteps974(nums, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps974Alt(nums, params);
  return buildSteps974Main(nums, params);
}

function buildSteps974Main(nums, params) {
  const parsedK = Number.parseInt(params && params.k, 10);
  const k = Number.isInteger(parsedK) && parsedK > 0 ? parsedK : 1;
  const remainderCount = new Map([[0, 1]]);
  const remainderPositions = new Map([[0, [-1]]]);
  const prefixSums = new Array(nums.length).fill(null);
  const remainders = new Array(nums.length).fill(null);
  const steps = [];
  let prefixSum = 0;
  let total = 0;

  const mapEntries = () => [...remainderCount.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([remainder, count]) => ({ remainder, index: count }));
  const mapString = () => `{${mapEntries().map((entry) => `${entry.remainder}: ${entry.index}`).join(", ")}}`;
  const makeView = ({ current = -1, status = [] } = {}) => ({
    nums: [...nums],
    prefixSums: [...prefixSums],
    remainders: [...remainders],
    current,
    matchStart: -1,
    matchEnd: -1,
    entries: mapEntries(),
    heading: "Numbers / prefix sum / remainder",
    prefixLabel: "sum",
    remainderLabel: "rem",
    mapTitle: "Prefix remainder frequencies",
    mapKeyLabel: "remainder",
    mapValueLabel: "count",
    status,
  });
  const loopVars = (i, remainder, extras = []) => {
    const vars = [
      { name: "i", value: i },
      { name: "num", value: nums[i] },
      { name: "prefix_sum", value: prefixSum },
    ];
    if (remainder !== undefined) vars.push({ name: "remainder", value: remainder });
    vars.push(
      { name: "total", value: total },
      { name: "remainder_count", value: mapString() },
      ...extras,
    );
    return vars;
  };
  const formatSubarrays = (positions, end) => {
    if (!positions.length) return "none";
    const ranges = positions.map((position) => `[${position + 1}..${end}]`);
    if (ranges.length <= 6) return ranges.join(", ");
    return `${ranges.slice(0, 6).join(", ")}, ... +${ranges.length - 6} more`;
  };

  steps.push({
    title: { vi: "Khoi tao remainder_count = {0: 1}", en: "Initialize remainder_count = {0: 1}" },
    codeLines: [3],
    prefixRemainderView: makeView({
      status: [
        { label: "seed remainder", value: 0 },
        { label: "seed count", value: 1 },
        { label: "prefix position", value: -1 },
      ],
    }),
    vars: [
      { name: "k", value: k },
      { name: "remainder_count", value: mapString() },
    ],
    note: {
      vi: "Count 1 cho remainder 0 dai dien prefix rong tai vi tri -1; nho vay subarray bat dau tu index 0 duoc dem.",
      en: "Count 1 for remainder 0 represents the empty prefix at position -1, allowing subarrays that start at index 0 to be counted.",
    },
  });

  steps.push({
    title: { vi: "Khoi tao prefix_sum = 0", en: "Initialize prefix_sum = 0" },
    codeLines: [4],
    prefixRemainderView: makeView({
      status: [
        { label: "prefix_sum", value: prefixSum },
        { label: "remainder_count", value: mapString() },
      ],
    }),
    vars: [
      { name: "k", value: k },
      { name: "prefix_sum", value: prefixSum },
      { name: "remainder_count", value: mapString() },
    ],
    note: {
      vi: "Tong tien to bat dau bang 0 truoc khi doc nums.",
      en: "The prefix sum starts at 0 before reading nums.",
    },
  });

  steps.push({
    title: { vi: "Khoi tao total = 0", en: "Initialize total = 0" },
    codeLines: [5],
    prefixRemainderView: makeView({
      status: [
        { label: "total", value: total },
        { label: "meaning", value: "valid subarrays found" },
      ],
    }),
    vars: [
      { name: "k", value: k },
      { name: "prefix_sum", value: prefixSum },
      { name: "total", value: total },
      { name: "remainder_count", value: mapString() },
    ],
    note: {
      vi: "Chua xu ly phan tu nao, nen chua tim thay subarray hop le.",
      en: "No elements have been processed, so no valid subarrays have been found yet.",
    },
  });

  for (let i = 0; i < nums.length; i += 1) {
    steps.push({
      title: { vi: `Vong lap gan i = ${i}, num = ${nums[i]}`, en: `Loop binds i = ${i}, num = ${nums[i]}` },
      codeLines: [6],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: "i", value: i },
          { label: "num", value: nums[i] },
          { label: "prefix_sum before", value: prefixSum },
        ],
      }),
      vars: loopVars(i),
      note: {
        vi: `Bat dau xu ly nums[${i}] = ${nums[i]}; prefix_sum chua thay doi tai dong 6.`,
        en: `Begin processing nums[${i}] = ${nums[i]}; prefix_sum has not changed on line 6.`,
      },
    });

    const beforePrefix = prefixSum;
    prefixSum += nums[i];
    prefixSums[i] = prefixSum;
    steps.push({
      title: { vi: `prefix_sum = ${beforePrefix} + (${nums[i]}) = ${prefixSum}`, en: `prefix_sum = ${beforePrefix} + (${nums[i]}) = ${prefixSum}` },
      codeLines: [7],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: "before", value: beforePrefix },
          { label: "num", value: nums[i] },
          { label: "prefix_sum", value: prefixSum },
        ],
      }),
      vars: loopVars(i),
      note: {
        vi: `Tong nums[0..${i}] bay gio la ${prefixSum}.`,
        en: `The sum of nums[0..${i}] is now ${prefixSum}.`,
      },
    });

    const remainder = ((prefixSum % k) + k) % k;
    remainders[i] = remainder;
    steps.push({
      title: { vi: `${prefixSum} % ${k} = ${remainder}`, en: `${prefixSum} % ${k} = ${remainder}` },
      codeLines: [8],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: "prefix_sum", value: prefixSum },
          { label: "k", value: k },
          { label: "remainder", value: remainder },
        ],
      }),
      vars: loopVars(i, remainder),
      note: {
        vi: `Python tra remainder khong am ${remainder}, ke ca khi prefix_sum la so am.`,
        en: `Python produces non-negative remainder ${remainder}, even when prefix_sum is negative.`,
      },
    });

    const priorPositions = [...(remainderPositions.get(remainder) || [])];
    const contribution = remainderCount.get(remainder) || 0;
    const beforeTotal = total;
    total += contribution;
    steps.push({
      title: { vi: `total = ${beforeTotal} + ${contribution} = ${total}`, en: `total = ${beforeTotal} + ${contribution} = ${total}` },
      codeLines: [9],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: "matching prefixes", value: priorPositions.length ? `[${priorPositions.join(", ")}]` : "none" },
          { label: "new subarrays", value: formatSubarrays(priorPositions, i) },
          { label: "added", value: contribution },
          { label: "total", value: total },
        ],
      }),
      vars: loopVars(i, remainder, [
        { name: `remainder_count.get(${remainder}, 0)`, value: contribution },
      ]),
      note: {
        vi: contribution
          ? `Co ${contribution} prefix truoc do cung remainder ${remainder}, nen co them ${contribution} subarray ket thuc tai index ${i}.`
          : `Chua co prefix nao cung remainder ${remainder}, nen index ${i} chua tao subarray moi.`,
        en: contribution
          ? `${contribution} earlier prefix(es) have remainder ${remainder}, creating ${contribution} new subarray(s) ending at index ${i}.`
          : `No earlier prefix has remainder ${remainder}, so index ${i} creates no new subarray.`,
      },
    });

    remainderCount.set(remainder, contribution + 1);
    if (!remainderPositions.has(remainder)) remainderPositions.set(remainder, []);
    remainderPositions.get(remainder).push(i);
    steps.push({
      title: {
        vi: `remainder_count[${remainder}] = ${contribution + 1}`,
        en: `remainder_count[${remainder}] = ${contribution + 1}`,
      },
      codeLines: [10],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: "remainder", value: remainder },
          { label: "old count", value: contribution },
          { label: "new count", value: contribution + 1 },
          { label: "total", value: total },
        ],
      }),
      vars: loopVars(i, remainder),
      note: {
        vi: `Luu prefix hien tai de cac index sau co cung remainder ${remainder} co the tao them subarray.`,
        en: `Store the current prefix so later indices with remainder ${remainder} can form additional subarrays.`,
      },
    });
  }

  steps.push({
    title: { vi: `Tra ve ${total}`, en: `Return ${total}` },
    codeLines: [11],
    prefixRemainderView: makeView({
      status: [
        { label: "processed", value: nums.length },
        { label: "remainder_count", value: mapString() },
        { label: "answer", value: total },
      ],
    }),
    vars: [
      { name: "prefix_sum", value: prefixSum },
      { name: "total", value: total },
      { name: "remainder_count", value: mapString() },
    ],
    note: {
      vi: `Co tong cong ${total} subarray co tong chia het cho ${k}.`,
      en: `There are ${total} subarrays whose sums are divisible by ${k}.`,
    },
    final: true,
  });

  return { steps, answer: total };
}

// ─── 974, approach 2: defaultdict(int) + "in" check (user-provided style) ───
// Line-by-line trace of the exact code shown to the user:
//  1  class Solution:
//  2      def subarraysDivByK(self, nums, k):
//  3          m = defaultdict(int)
//  4          m[0] = 1
//  5          sum_count = 0
//  6          prefix_sum = 0
//  7          for i in range(len(nums)):
//  8              prefix_sum += nums[i]
//  9              remainder = prefix_sum % k
// 10             if remainder in m:
// 11                 sum_count += m[remainder]
// 12             m[remainder] += 1
// 13         return sum_count
function buildSteps974Alt(nums, params) {
  const parsedK = Number.parseInt(params && params.k, 10);
  const k = Number.isInteger(parsedK) && parsedK > 0 ? parsedK : 1;
  const m = new Map();
  const mPositions = new Map();
  const prefixSums = new Array(nums.length).fill(null);
  const remainders = new Array(nums.length).fill(null);
  const steps = [];
  let prefixSum = 0;
  let sumCount = 0;

  const mEntries = () => [...m.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([remainder, count]) => ({ remainder, index: count }));
  const mString = () => `{${mEntries().map((entry) => `${entry.remainder}: ${entry.index}`).join(", ")}}`;
  const makeView = ({ current = -1, status = [] } = {}) => ({
    nums: [...nums],
    prefixSums: [...prefixSums],
    remainders: [...remainders],
    current,
    matchStart: -1,
    matchEnd: -1,
    entries: mEntries(),
    heading: "Numbers / prefix sum / remainder",
    prefixLabel: "sum",
    remainderLabel: "rem",
    mapTitle: "m (remainder frequencies)",
    mapKeyLabel: "remainder",
    mapValueLabel: "count",
    status,
  });
  const formatSubarrays = (positions, end) => {
    if (!positions.length) return "none";
    const ranges = positions.map((position) => `[${position + 1}..${end}]`);
    if (ranges.length <= 6) return ranges.join(", ");
    return `${ranges.slice(0, 6).join(", ")}, ... +${ranges.length - 6} more`;
  };

  function push({ title, codeLines, current = -1, status = [], vars, note, final = false }) {
    const debugVars = [...(vars || [])];
    if (!debugVars.some((variable) => variable.name === "sum_count")) {
      debugVars.push({ name: "sum_count", value: sumCount });
    }
    if (!debugVars.some((variable) => variable.name === "m")) {
      debugVars.push({ name: "m", value: mString() });
    }
    steps.push({
      title,
      arr: [],
      prefixRemainderView: makeView({ current, status }),
      highlight: [],
      mark: [],
      final,
      codeBlock: 2,
      codeLines,
      vars: debugVars,
      note,
    });
  }

  push({
    title: { vi: "m = defaultdict(int)", en: "m = defaultdict(int)" },
    codeLines: [3],
    status: [{ label: "m", value: "{}" }],
    vars: [{ name: "k", value: k }, { name: "m", value: "{}" }],
    note: {
      vi:
        "Tại sao dùng defaultdict? Ý tưởng chính: subarray nums[l+1..r] chia hết cho k " +
        "⟺ prefix_sum[r] và prefix_sum[l] có CÙNG remainder khi chia k (đây là nguyên lý chuồng bồ câu áp dụng cho phần dư). " +
        "Nên ta cần đếm: với mỗi remainder, có bao nhiêu prefix_sum trước đó cùng remainder đó. defaultdict(int) giúp tăng count mà không cần kiểm tra key đã tồn tại chưa.",
      en:
        "Why defaultdict? Core idea: subarray nums[l+1..r] is divisible by k " +
        "⟺ prefix_sum[r] and prefix_sum[l] share the SAME remainder mod k (pigeonhole principle applied to remainders). " +
        "So we need to count, for each remainder, how many earlier prefix sums shared it. defaultdict(int) lets us increment counts without checking key existence first.",
    },
  });

  m.set(0, 1);
  mPositions.set(0, [-1]);
  push({
    title: { vi: "m[0] = 1", en: "m[0] = 1" },
    codeLines: [4],
    status: [
      { label: "seed remainder", value: 0 },
      { label: "seed count", value: 1 },
      { label: "prefix position", value: -1 },
    ],
    vars: [{ name: "m", value: mString() }],
    note: {
      vi:
        "Tại sao cần dòng này? prefix_sum[-1] (trước khi đọc phần tử nào) = 0, có remainder 0. " +
        "Nếu không seed sẵn m[0]=1, subarray nums[0..r] tự nó chia hết cho k (remainder[r]=0) sẽ KHÔNG được đếm, vì không có prefix nào 'trước' index 0 để so khớp. " +
        "Seed này chính là đại diện cho prefix rỗng đó.",
      en:
        "Why is this line needed? prefix_sum[-1] (before reading any element) = 0, with remainder 0. " +
        "Without seeding m[0]=1, a subarray nums[0..r] that itself is divisible by k (remainder[r]=0) would NOT be counted, since there'd be no earlier prefix to match against. " +
        "This seed represents that empty prefix.",
    },
  });

  push({
    title: { vi: "sum_count = 0", en: "sum_count = 0" },
    codeLines: [5],
    status: [{ label: "sum_count", value: sumCount }],
    vars: [{ name: "sum_count", value: sumCount }],
    note: { vi: "Biến đếm số subarray hợp lệ tìm được, tăng dần khi duyệt qua mảng.", en: "Counter for valid subarrays found, incremented while scanning the array." },
  });

  push({
    title: { vi: "prefix_sum = 0", en: "prefix_sum = 0" },
    codeLines: [6],
    status: [{ label: "prefix_sum", value: prefixSum }],
    vars: [{ name: "prefix_sum", value: prefixSum }],
    note: {
      vi: "Tổng tiền tố bắt đầu bằng 0, sẽ cộng dồn từng phần tử nums[i] khi duyệt qua mảng để tính prefix_sum[i] = nums[0]+...+nums[i].",
      en: "The prefix sum starts at 0, accumulating each nums[i] while scanning so prefix_sum[i] = nums[0]+...+nums[i].",
    },
  });

  for (let i = 0; i < nums.length; i++) {
    push({
      title: { vi: `for i in range(len(nums)): i = ${i}`, en: `for i in range(len(nums)): i = ${i}` },
      codeLines: [7],
      current: i,
      status: [{ label: "i", value: i }, { label: "nums[i]", value: nums[i] }],
      vars: [{ name: "i", value: i }, { name: "nums[i]", value: nums[i] }],
      note: { vi: `Xét phần tử nums[${i}] = ${nums[i]}.`, en: `Process element nums[${i}] = ${nums[i]}.` },
    });

    const before = prefixSum;
    prefixSum += nums[i];
    prefixSums[i] = prefixSum;
    push({
      title: { vi: `prefix_sum += nums[${i}] → ${before} + (${nums[i]}) = ${prefixSum}`, en: `prefix_sum += nums[${i}] → ${before} + (${nums[i]}) = ${prefixSum}` },
      codeLines: [8],
      current: i,
      status: [{ label: "before", value: before }, { label: "num", value: nums[i] }, { label: "prefix_sum", value: prefixSum }],
      vars: [{ name: "prefix_sum", value: prefixSum }],
      note: { vi: `Tổng nums[0..${i}] bây giờ là ${prefixSum}.`, en: `The sum of nums[0..${i}] is now ${prefixSum}.` },
    });

    const remainder = ((prefixSum % k) + k) % k;
    remainders[i] = remainder;
    push({
      title: { vi: `remainder = ${prefixSum} % ${k} = ${remainder}`, en: `remainder = ${prefixSum} % ${k} = ${remainder}` },
      codeLines: [9],
      current: i,
      status: [{ label: "prefix_sum", value: prefixSum }, { label: "k", value: k }, { label: "remainder", value: remainder }],
      vars: [{ name: "remainder", value: remainder }],
      note: {
        vi:
          `Tại sao lấy remainder? Ta không cần biết prefix_sum chính xác, chỉ cần biết phần dư khi chia k, vì hai prefix_sum cùng remainder ⟺ hiệu của chúng chia hết cho k. ` +
          `Python trả remainder không âm (${remainder}) ngay cả khi prefix_sum âm (${prefixSum}), nên không cần chuẩn hóa thêm.`,
        en:
          `Why take the remainder? We don't need the exact prefix_sum, only its remainder mod k, since two prefix sums sharing a remainder ⟺ their difference is divisible by k. ` +
          `Python produces a non-negative remainder (${remainder}) even when prefix_sum is negative (${prefixSum}), so no extra normalization is needed.`,
      },
    });

    const exists = m.has(remainder);
    const priorPositions = [...(mPositions.get(remainder) || [])];
    push({
      title: { vi: `remainder in m? ${exists}`, en: `remainder in m? ${exists}` },
      codeLines: [10],
      current: i,
      status: [
        { label: "remainder", value: remainder },
        { label: "in m?", value: exists },
        { label: "matching prefixes", value: priorPositions.length ? `[${priorPositions.join(", ")}]` : "none" },
      ],
      vars: [{ name: "remainder", value: remainder }, { name: "in m?", value: exists }],
      note: {
        vi: exists
          ? `remainder ${remainder} đã từng xuất hiện tại prefix ${priorPositions.length > 1 ? "các vị trí" : "vị trí"} ${priorPositions.join(", ")} → mỗi prefix đó, kết hợp với prefix hiện tại (i=${i}), tạo thành 1 subarray có tổng chia hết cho ${k}.`
          : `Chưa có prefix nào trước đó có remainder ${remainder} → không có cặp nào để tạo subarray kết thúc tại i=${i}, nhưng ta vẫn cần lưu remainder này lại cho các index sau.`,
        en: exists
          ? `remainder ${remainder} was seen before at prefix position(s) ${priorPositions.join(", ")} → each of those, paired with the current prefix (i=${i}), forms a subarray whose sum is divisible by ${k}.`
          : `No earlier prefix has remainder ${remainder} → no pair exists to form a subarray ending at i=${i}, but we still need to record this remainder for later indices.`,
      },
    });

    if (exists) {
      const contribution = m.get(remainder);
      const beforeCount = sumCount;
      sumCount += contribution;
      push({
        title: { vi: `sum_count += m[${remainder}] → ${beforeCount} + ${contribution} = ${sumCount}`, en: `sum_count += m[${remainder}] → ${beforeCount} + ${contribution} = ${sumCount}` },
        codeLines: [11],
        current: i,
        status: [
          { label: "new subarrays", value: formatSubarrays(priorPositions, i) },
          { label: "added", value: contribution },
          { label: "sum_count", value: sumCount },
        ],
        vars: [{ name: "sum_count", value: sumCount }],
        note: {
          vi:
            `Đây chính là bước ĐẾM: mỗi lần trước đó gặp remainder ${remainder} là 1 subarray hợp lệ kết thúc tại i=${i} ` +
            `(bắt đầu ngay sau vị trí đó). Có ${contribution} lần như vậy → cộng thêm ${contribution} vào sum_count. Cụ thể: ${formatSubarrays(priorPositions, i)}.`,
          en:
            `This is the COUNTING step: each earlier occurrence of remainder ${remainder} corresponds to 1 valid subarray ending at i=${i} ` +
            `(starting right after that position). There are ${contribution} such occurrence(s) → add ${contribution} to sum_count. Specifically: ${formatSubarrays(priorPositions, i)}.`,
        },
      });
    }

    const oldCount = m.get(remainder) || 0;
    m.set(remainder, oldCount + 1);
    if (!mPositions.has(remainder)) mPositions.set(remainder, []);
    mPositions.get(remainder).push(i);
    push({
      title: { vi: `m[${remainder}] += 1 → ${oldCount + 1}`, en: `m[${remainder}] += 1 → ${oldCount + 1}` },
      codeLines: [12],
      current: i,
      status: [
        { label: "remainder", value: remainder },
        { label: "old count", value: oldCount },
        { label: "new count", value: oldCount + 1 },
        { label: "sum_count", value: sumCount },
      ],
      vars: [{ name: `m[${remainder}]`, value: oldCount + 1 }, { name: "m", value: mString() }],
      note: {
        vi:
          `Tại sao luôn tăng, kể cả khi remainder chưa từng có (defaultdict tự tạo 0 trước, rồi +1 = ${oldCount + 1})? ` +
          `Vì prefix tại i=${i} cũng SẼ TRỞ THÀNH một "prefix cũ" cho các index j>${i} phía sau so khớp. Bước này đăng ký nó vào m để không bị bỏ sót.`,
        en:
          `Why increment even if the remainder never existed before (defaultdict auto-creates 0, then +1 = ${oldCount + 1})? ` +
          `Because the prefix at i=${i} will itself become an "earlier prefix" for later indices j>${i} to match against. This step registers it in m so it isn't missed.`,
      },
    });
  }

  push({
    title: { vi: `return sum_count = ${sumCount}`, en: `return sum_count = ${sumCount}` },
    codeLines: [13],
    status: [
      { label: "processed", value: nums.length },
      { label: "m", value: mString() },
      { label: "answer", value: sumCount },
    ],
    vars: [{ name: "answer", value: sumCount }],
    final: true,
    note: {
      vi:
        `Có tổng cộng ${sumCount} subarray có tổng chia hết cho ${k}. ` +
        `Thay vì kiểm tra O(n²) cặp (i, j) và tính lại tổng mỗi lần, thuật toán chỉ duyệt 1 lần O(n), ` +
        `vì "2 prefix cùng remainder → hiệu chia hết cho k" biến bài toán thành đếm tần suất remainder — đây là lý do cách này nhanh.`,
      en:
        `There are ${sumCount} subarrays whose sums are divisible by ${k}. ` +
        `Instead of checking O(n²) pairs (i, j) and recomputing sums each time, this algorithm scans once in O(n), ` +
        `because "2 prefixes sharing a remainder → their difference is divisible by k" turns the problem into counting remainder frequencies — that's why this approach is fast.`,
    },
  });

  return { steps, answer: sumCount };
}

function buildSteps525(nums) {
  const bits = nums.map((num) => (num === 1 ? 1 : 0));
  const firstSeen = new Map([[0, -1]]);
  const balances = new Array(bits.length).fill(null);
  const firstValues = new Array(bits.length).fill(null);
  const steps = [];
  let balance = 0;
  let maxLen = 0;
  let bestStart = -1;
  let bestEnd = -1;

  const mapEntries = () => [...firstSeen.entries()].map(([remainder, index]) => ({ remainder, index }));
  const mapString = () => `{${mapEntries().map((entry) => `${entry.remainder}: ${entry.index}`).join(", ")}}`;
  const makeView = ({ current = -1, matchStart = bestStart, matchEnd = bestEnd, status = [] } = {}) => ({
    nums: [...bits],
    prefixSums: [...balances],
    remainders: [...firstValues],
    current,
    matchStart,
    matchEnd,
    entries: mapEntries(),
    heading: "Bits / balance / first seen",
    prefixLabel: "balance",
    remainderLabel: "first",
    mapTitle: "Earliest balance index",
    mapKeyLabel: "balance",
    mapValueLabel: "index",
    status,
  });

  steps.push({
    title: { vi: "Khoi tao balance 0 tai index -1", en: "Seed balance 0 at index -1" },
    codeLines: [3],
    prefixRemainderView: makeView({
      matchStart: -1,
      matchEnd: -1,
      status: [
        { label: "0 counts as", value: -1 },
        { label: "1 counts as", value: 1 },
        { label: "first_seen", value: "{0: -1}" },
      ],
    }),
    vars: [{ name: "first_seen", value: "{0: -1}" }, { name: "balance", value: 0 }, { name: "max_len", value: 0 }],
    note: {
      vi: "Doi 0 thanh -1 va 1 thanh +1. Neu balance lap lai, doan giua co so 0 va 1 bang nhau.",
      en: "Treat 0 as -1 and 1 as +1. When a balance repeats, the middle subarray has equal 0s and 1s.",
    },
  });

  for (let i = 0; i < bits.length; i += 1) {
    const delta = bits[i] === 1 ? 1 : -1;
    balance += delta;
    balances[i] = balance;
    firstValues[i] = firstSeen.has(balance) ? firstSeen.get(balance) : "new";

    steps.push({
      title: { vi: `Doc nums[${i}] = ${bits[i]}`, en: `Read nums[${i}] = ${bits[i]}` },
      codeLines: [5, 6],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: "delta", value: delta },
          { label: "balance", value: balance },
          { label: "first seen", value: firstValues[i] },
        ],
      }),
      vars: [
        { name: "i", value: i },
        { name: "num", value: bits[i] },
        { name: "delta", value: delta },
        { name: "balance", value: balance },
      ],
      note: {
        vi: `${bits[i]} lam balance thay doi ${delta > 0 ? "+1" : "-1"}, nen balance hien tai = ${balance}.`,
        en: `${bits[i]} changes balance by ${delta > 0 ? "+1" : "-1"}, so the current balance is ${balance}.`,
      },
    });

    if (firstSeen.has(balance)) {
      const previous = firstSeen.get(balance);
      const length = i - previous;
      const start = previous + 1;
      if (length > maxLen) {
        maxLen = length;
        bestStart = start;
        bestEnd = i;
      }
      steps.push({
        title: { vi: `Balance ${balance} lap lai`, en: `Balance ${balance} repeats` },
        codeLines: [7, 8],
        prefixRemainderView: makeView({
          current: i,
          matchStart: start,
          matchEnd: i,
          status: [
            { label: "previous", value: previous },
            { label: "candidate", value: `[${start}..${i}]` },
            { label: "length", value: length },
            { label: "max_len", value: maxLen },
          ],
        }),
        vars: [
          { name: "balance", value: balance },
          { name: `first_seen[${balance}]`, value: previous },
          { name: "length", value: `${i} - (${previous}) = ${length}` },
          { name: "max_len", value: maxLen },
        ],
        note: {
          vi: `Balance tai ${previous} va ${i} giong nhau, nen nums[${start}..${i}] co so 0 va 1 bang nhau.`,
          en: `The balance at ${previous} and ${i} is the same, so nums[${start}..${i}] has equal 0s and 1s.`,
        },
      });
    } else {
      firstSeen.set(balance, i);
      firstValues[i] = i;
      steps.push({
        title: { vi: `Luu balance ${balance} tai index ${i}`, en: `Store balance ${balance} at index ${i}` },
        codeLines: [10],
        prefixRemainderView: makeView({
          current: i,
          status: [
            { label: "stored", value: `${balance} -> ${i}` },
            { label: "map size", value: firstSeen.size },
          ],
        }),
        vars: [{ name: "balance", value: balance }, { name: "first_seen", value: mapString() }],
        note: {
          vi: "Chi luu index dau tien cua moi balance de tao do dai lon nhat.",
          en: "Keep the earliest index for each balance so later repeats produce the longest length.",
        },
      });
    }
  }

  steps.push({
    title: { vi: `Ket qua: ${maxLen}`, en: `Result: ${maxLen}` },
    codeLines: [11],
    prefixRemainderView: makeView({
      current: -1,
      status: [
        { label: "best", value: bestStart >= 0 ? `[${bestStart}..${bestEnd}]` : "-" },
        { label: "max_len", value: maxLen },
      ],
    }),
    vars: [{ name: "first_seen", value: mapString() }, { name: "max_len", value: maxLen }],
    note: {
      vi: maxLen > 0 ? `Doan dai nhat la nums[${bestStart}..${bestEnd}], do dai ${maxLen}.` : "Khong co doan nao co so 0 va 1 bang nhau.",
      en: maxLen > 0 ? `The longest subarray is nums[${bestStart}..${bestEnd}], length ${maxLen}.` : "No subarray has equal 0s and 1s.",
    },
    final: true,
  });

  return { steps, answer: maxLen };
}

function buildSteps1590(nums, params) {
  const p = Math.max(1, Math.abs(Number.parseInt(params && params.p, 10) || 1));
  const total = nums.reduce((sum, num) => sum + num, 0);
  const need = total % p;
  const lastSeen = new Map([[0, -1]]);
  const prefixSums = new Array(nums.length).fill(null);
  const remainders = new Array(nums.length).fill(null);
  const steps = [];
  let prefixSum = 0;
  let bestLen = nums.length;
  let bestStart = -1;
  let bestEnd = -1;

  const mapEntries = () => [...lastSeen.entries()].map(([remainder, index]) => ({ remainder, index }));
  const mapString = () => `{${mapEntries().map((entry) => `${entry.remainder}: ${entry.index}`).join(", ")}}`;
  const makeView = ({ current = -1, matchStart = bestStart, matchEnd = bestEnd, status = [] } = {}) => ({
    nums: [...nums],
    prefixSums: [...prefixSums],
    remainders: [...remainders],
    current,
    matchStart,
    matchEnd,
    entries: mapEntries(),
    heading: "Numbers / prefix / remainder",
    prefixLabel: "sum",
    remainderLabel: "rem",
    mapTitle: "Latest remainder index",
    mapKeyLabel: "remainder",
    mapValueLabel: "index",
    status,
  });

  steps.push({
    title: { vi: `Total % p = ${need}`, en: `Total % p = ${need}` },
    codeLines: [3, 4],
    prefixRemainderView: makeView({
      matchStart: -1,
      matchEnd: -1,
      status: [
        { label: "total", value: total },
        { label: "p", value: p },
        { label: "need remove", value: need },
      ],
    }),
    vars: [{ name: "total", value: total }, { name: "p", value: p }, { name: "need", value: need }],
    note: {
      vi: `Tong mang du ${need} khi chia cho ${p}. Can xoa mot subarray co tong du ${need}.`,
      en: `The array sum leaves remainder ${need} modulo ${p}. Remove a subarray whose sum has that same remainder.`,
    },
  });

  if (need === 0) {
    steps.push({
      title: { vi: "Da chia het, khong can xoa", en: "Already divisible, remove nothing" },
      codeLines: [5],
      prefixRemainderView: makeView({
        matchStart: -1,
        matchEnd: -1,
        status: [
          { label: "need", value: 0 },
          { label: "answer", value: 0 },
        ],
      }),
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Tong mang da chia het cho p, nen tra ve 0.",
        en: "The total is already divisible by p, so return 0.",
      },
      final: true,
    });
    return { steps, answer: 0 };
  }

  for (let i = 0; i < nums.length; i += 1) {
    prefixSum += nums[i];
    const remainder = prefixSum % p;
    const target = (remainder - need + p) % p;
    prefixSums[i] = prefixSum;
    remainders[i] = remainder;

    steps.push({
      title: { vi: `Doc nums[${i}] = ${nums[i]}`, en: `Read nums[${i}] = ${nums[i]}` },
      codeLines: [8, 9, 10],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: "prefix", value: prefixSum },
          { label: "remainder", value: remainder },
          { label: "target", value: target },
        ],
      }),
      vars: [
        { name: "i", value: i },
        { name: "num", value: nums[i] },
        { name: "prefix", value: prefixSum },
        { name: "remainder", value: remainder },
        { name: "target", value: `(${remainder} - ${need} + ${p}) % ${p} = ${target}` },
      ],
      note: {
        vi: `Neu tung thay remainder ${target}, doan giua se co tong du ${need}.`,
        en: `If remainder ${target} was seen before, the subarray between then and now has remainder ${need}.`,
      },
    });

    if (lastSeen.has(target)) {
      const previous = lastSeen.get(target);
      const start = previous + 1;
      const length = i - previous;
      const end = i;
      if (length < bestLen) {
        bestLen = length;
        bestStart = start;
        bestEnd = end;
      }
      steps.push({
        title: { vi: `Candidate remove [${start}..${end}]`, en: `Candidate remove [${start}..${end}]` },
        codeLines: [11, 12],
        prefixRemainderView: makeView({
          current: i,
          matchStart: start,
          matchEnd: end,
          status: [
            { label: "target index", value: previous },
            { label: "candidate len", value: length },
            { label: "best len", value: bestLen },
          ],
        }),
        vars: [
          { name: "target", value: target },
          { name: `last_seen[${target}]`, value: previous },
          { name: "candidate", value: `[${start}..${end}]` },
          { name: "best_len", value: bestLen },
        ],
        note: {
          vi: `Xoa nums[${start}..${end}] lam phan con lai chia het cho ${p}. Cap nhat do dai nho nhat neu tot hon.`,
          en: `Removing nums[${start}..${end}] makes the remaining sum divisible by ${p}. Update the shortest length if it improves.`,
        },
      });
    }

    lastSeen.set(remainder, i);
    steps.push({
      title: { vi: `Luu remainder ${remainder} tai index ${i}`, en: `Store remainder ${remainder} at index ${i}` },
      codeLines: [13],
      prefixRemainderView: makeView({
        current: i,
        status: [
          { label: "stored", value: `${remainder} -> ${i}` },
          { label: "best len", value: bestLen === nums.length ? "-" : bestLen },
        ],
      }),
      vars: [{ name: "last_seen", value: mapString() }, { name: "best_len", value: bestLen === nums.length ? "inf" : bestLen }],
      note: {
        vi: "Dung index moi nhat cho moi remainder de subarray can xoa ngan nhat.",
        en: "Keep the latest index for each remainder to make the removable subarray as short as possible.",
      },
    });
  }

  const answer = bestLen < nums.length ? bestLen : -1;
  steps.push({
    title: { vi: `Ket qua: ${answer}`, en: `Result: ${answer}` },
    codeLines: [15],
    prefixRemainderView: makeView({
      current: -1,
      matchStart: answer === -1 ? -1 : bestStart,
      matchEnd: answer === -1 ? -1 : bestEnd,
      status: [
        { label: "remove", value: answer === -1 ? "none" : `[${bestStart}..${bestEnd}]` },
        { label: "answer", value: answer },
      ],
    }),
    vars: [{ name: "answer", value: answer }, { name: "best_len", value: bestLen === nums.length ? "inf" : bestLen }],
    note: {
      vi: answer === -1 ? "Chi co the xoa ca mang, khong hop le nen tra ve -1." : `Subarray can xoa ngan nhat la nums[${bestStart}..${bestEnd}], do dai ${answer}.`,
      en: answer === -1 ? "Only removing the whole array would work, which is not allowed, so return -1." : `The shortest removable subarray is nums[${bestStart}..${bestEnd}], length ${answer}.`,
    },
    final: true,
  });

  return { steps, answer };
}

function parseRangeUpdates(raw, length) {
  let rows = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else {
    const text = String(raw || "").trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) rows = parsed;
    } catch (_) {
      rows = text
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => part.split(",").map((value) => Number.parseInt(value.trim(), 10)));
    }
  }

  return rows
    .filter((row) => Array.isArray(row) && row.length >= 3)
    .map((row) => row.slice(0, 3).map((value) => Number.parseInt(value, 10)))
    .filter(([start, end, inc]) => Number.isInteger(start) && Number.isInteger(end) && Number.isInteger(inc))
    .map(([start, end, inc]) => [
      Math.max(0, Math.min(length - 1, start)),
      Math.max(0, Math.min(length - 1, end)),
      inc,
    ])
    .filter(([start, end]) => start <= end);
}

function buildSteps370(input, params) {
  const length = Math.max(1, Math.min(20, Number.parseInt(input && input[0], 10) || 5));
  const updates = parseRangeUpdates(params && params.updates, length);
  const diff = new Array(length + 1).fill(0);
  const result = new Array(length).fill(null);
  const steps = [];

  const makeView = ({
    currentUpdate = -1,
    activeStart = -1,
    activeEnd = -1,
    activeBoundary = -1,
    currentResult = -1,
    status = [],
  } = {}) => ({
    length,
    diff: [...diff],
    result: [...result],
    updates: updates.map(([start, end, inc]) => ({ start, end, inc })),
    currentUpdate,
    activeStart,
    activeEnd,
    activeBoundary,
    currentResult,
    status,
  });

  steps.push({
    title: { vi: `Khoi tao diff length ${length + 1}`, en: `Initialize diff length ${length + 1}` },
    codeLines: [3],
    differenceArrayView: makeView({
      status: [
        { label: "length", value: length },
        { label: "updates", value: updates.length },
      ],
    }),
    vars: [{ name: "length", value: length }, { name: "diff", value: `[${diff.join(", ")}]` }],
    note: {
      vi: "Dung diff co them 1 o cuoi de danh dau diem ket thuc range bang diff[end + 1].",
      en: "Use one extra diff cell so each range can close at diff[end + 1].",
    },
  });

  updates.forEach(([start, end, inc], updateIndex) => {
    steps.push({
      title: { vi: `Update ${updateIndex}: [${start}, ${end}, ${inc}]`, en: `Update ${updateIndex}: [${start}, ${end}, ${inc}]` },
      codeLines: [4],
      differenceArrayView: makeView({
        currentUpdate: updateIndex,
        activeStart: start,
        activeEnd: end,
        status: [
          { label: "start", value: start },
          { label: "end", value: end },
          { label: "inc", value: inc },
        ],
      }),
      vars: [{ name: "start", value: start }, { name: "end", value: end }, { name: "inc", value: inc }],
      note: {
        vi: `Range [${start}..${end}] se tang ${inc}. Thay vi cap nhat tung o, ta chi danh dau hai bien.`,
        en: `Range [${start}..${end}] will increase by ${inc}. Instead of updating every cell, mark the two boundaries.`,
      },
    });

    diff[start] += inc;
    steps.push({
      title: { vi: `diff[${start}] += ${inc}`, en: `diff[${start}] += ${inc}` },
      codeLines: [5],
      differenceArrayView: makeView({
        currentUpdate: updateIndex,
        activeStart: start,
        activeEnd: end,
        activeBoundary: start,
        status: [
          { label: "open range", value: `+${inc} at ${start}` },
          { label: `diff[${start}]`, value: diff[start] },
        ],
      }),
      vars: [{ name: `diff[${start}]`, value: diff[start] }, { name: "diff", value: `[${diff.join(", ")}]` }],
      note: {
        vi: `Tu index ${start}, prefix sum se bat dau cong ${inc}.`,
        en: `Starting at index ${start}, the prefix sum begins adding ${inc}.`,
      },
    });

    diff[end + 1] -= inc;
    steps.push({
      title: { vi: `diff[${end + 1}] -= ${inc}`, en: `diff[${end + 1}] -= ${inc}` },
      codeLines: [6],
      differenceArrayView: makeView({
        currentUpdate: updateIndex,
        activeStart: start,
        activeEnd: end,
        activeBoundary: end + 1,
        status: [
          { label: "close range", value: `-${inc} at ${end + 1}` },
          { label: `diff[${end + 1}]`, value: diff[end + 1] },
        ],
      }),
      vars: [{ name: `diff[${end + 1}]`, value: diff[end + 1] }, { name: "diff", value: `[${diff.join(", ")}]` }],
      note: {
        vi: `Sau index ${end}, tac dong ${inc} phai dung lai, nen tru lai tai ${end + 1}.`,
        en: `After index ${end}, the effect of ${inc} must stop, so subtract it at ${end + 1}.`,
      },
    });
  });

  let running = 0;
  steps.push({
    title: { vi: "Bat dau prefix sum", en: "Start prefix sum" },
    codeLines: [7, 8],
    differenceArrayView: makeView({
      status: [
        { label: "running", value: running },
        { label: "diff", value: `[${diff.join(", ")}]` },
      ],
    }),
    vars: [{ name: "running", value: running }, { name: "result", value: "[]" }],
    note: {
      vi: "Sau khi danh dau moi update, lay prefix sum cua diff de ra mang cuoi.",
      en: "After marking every update, take the prefix sum of diff to build the final array.",
    },
  });

  for (let i = 0; i < length; i += 1) {
    running += diff[i];
    result[i] = running;
    steps.push({
      title: { vi: `result[${i}] = ${running}`, en: `result[${i}] = ${running}` },
      codeLines: [9, 10, 11],
      differenceArrayView: makeView({
        currentResult: i,
        status: [
          { label: "i", value: i },
          { label: `diff[${i}]`, value: diff[i] },
          { label: "running", value: running },
        ],
      }),
      vars: [{ name: "i", value: i }, { name: "running", value: running }, { name: "result", value: `[${result.map((v) => v == null ? "_" : v).join(", ")}]` }],
      note: {
        vi: `Cong diff[${i}] = ${diff[i]} vao running, gia tri that tai index ${i} la ${running}.`,
        en: `Add diff[${i}] = ${diff[i]} to running; the real value at index ${i} is ${running}.`,
      },
    });
  }

  steps.push({
    title: { vi: `Ket qua: [${result.join(", ")}]`, en: `Result: [${result.join(", ")}]` },
    codeLines: [12],
    differenceArrayView: makeView({
      status: [
        { label: "answer", value: `[${result.join(", ")}]` },
        { label: "updates", value: updates.length },
      ],
    }),
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: {
      vi: "Prefix sum cua diff da ap dung tat ca range updates.",
      en: "The prefix sum of diff has applied all range updates.",
    },
    final: true,
  });

  return { steps, answer: result };
}

function buildSteps1480(nums) {
  const running = new Array(nums.length).fill(null);
  const steps = [];
  let total = 0;

  const makeView = ({ current = -1, status = [] } = {}) => ({
    nums: [...nums],
    running: [...running],
    current,
    status,
  });

  steps.push({
    title: { vi: "Khoi tao running sum", en: "Initialize running sum" },
    codeLines: [3],
    runningSumView: makeView({
      status: [
        { label: "running", value: 0 },
        { label: "result", value: "[]" },
      ],
    }),
    vars: [{ name: "running", value: 0 }, { name: "result", value: "[]" }],
    note: {
      vi: "running giu tong tu nums[0] den index hien tai.",
      en: "running stores the sum from nums[0] through the current index.",
    },
  });

  for (let i = 0; i < nums.length; i += 1) {
    const before = total;
    total += nums[i];
    running[i] = total;
    steps.push({
      title: { vi: `runningSum[${i}] = ${total}`, en: `runningSum[${i}] = ${total}` },
      codeLines: [4, 5, 6],
      runningSumView: makeView({
        current: i,
        status: [
          { label: "i", value: i },
          { label: "previous", value: before },
          { label: `nums[${i}]`, value: nums[i] },
          { label: "running", value: total },
        ],
      }),
      vars: [
        { name: "i", value: i },
        { name: "running", value: `${before} + ${nums[i]} = ${total}` },
        { name: "result", value: `[${running.map((v) => v == null ? "_" : v).join(", ")}]` },
      ],
      note: {
        vi: `Cong nums[${i}] = ${nums[i]} vao tong truoc do ${before}, duoc ${total}.`,
        en: `Add nums[${i}] = ${nums[i]} to the previous total ${before}, giving ${total}.`,
      },
    });
  }

  steps.push({
    title: { vi: `Ket qua: [${running.join(", ")}]`, en: `Result: [${running.join(", ")}]` },
    codeLines: [7],
    runningSumView: makeView({
      current: -1,
      status: [
        { label: "answer", value: `[${running.join(", ")}]` },
        { label: "length", value: nums.length },
      ],
    }),
    vars: [{ name: "answer", value: `[${running.join(", ")}]` }],
    note: {
      vi: "Moi vi tri la tong tat ca phan tu tu dau mang den vi tri do.",
      en: "Each position is the sum of all elements from the start through that position.",
    },
    final: true,
  });

  return { steps, answer: running };
}

function buildSteps303(nums, params) {
  const n = nums.length;
  const leftRaw = Number.parseInt(params && params.left, 10);
  const rightRaw = Number.parseInt(params && params.right, 10);
  const left = Math.max(0, Math.min(n - 1, Number.isInteger(leftRaw) ? leftRaw : 0));
  const right = Math.max(left, Math.min(n - 1, Number.isInteger(rightRaw) ? rightRaw : n - 1));
  const prefix = new Array(n + 1).fill(null);
  prefix[0] = 0;
  const steps = [];

  const makeView = ({ current = -1, prefixIndex = -1, query = null, status = [] } = {}) => ({
    nums: [...nums],
    prefix: [...prefix],
    current,
    prefixIndex,
    query,
    status,
  });

  steps.push({
    title: { vi: "Khoi tao prefix[0] = 0", en: "Initialize prefix[0] = 0" },
    codeLines: [3],
    prefix1DView: makeView({
      prefixIndex: 0,
      status: [
        { label: "left", value: left },
        { label: "right", value: right },
      ],
    }),
    vars: [{ name: "prefix[0]", value: 0 }, { name: "query", value: `[${left}, ${right}]` }],
    note: {
      vi: "prefix co them 1 o dau. prefix[i] la tong nums[0..i-1].",
      en: "prefix has one extra leading cell. prefix[i] is the sum of nums[0..i-1].",
    },
  });

  for (let i = 0; i < n; i += 1) {
    const before = prefix[i];
    prefix[i + 1] = before + nums[i];
    steps.push({
      title: { vi: `prefix[${i + 1}] = ${prefix[i + 1]}`, en: `prefix[${i + 1}] = ${prefix[i + 1]}` },
      codeLines: [4, 5],
      prefix1DView: makeView({
        current: i,
        prefixIndex: i + 1,
        status: [
          { label: "i", value: i },
          { label: `prefix[${i}]`, value: before },
          { label: `nums[${i}]`, value: nums[i] },
          { label: `prefix[${i + 1}]`, value: `${before} + ${nums[i]} = ${prefix[i + 1]}` },
        ],
      }),
      vars: [
        { name: "i", value: i },
        { name: `prefix[${i + 1}]`, value: `${before} + ${nums[i]} = ${prefix[i + 1]}` },
        { name: "prefix", value: `[${prefix.map((v) => v == null ? "_" : v).join(", ")}]` },
      ],
      note: {
        vi: `Lay tong truoc do ${before} cong nums[${i}] = ${nums[i]}.`,
        en: `Take the previous sum ${before} plus nums[${i}] = ${nums[i]}.`,
      },
    });
  }

  const answer = prefix[right + 1] - prefix[left];
  steps.push({
    title: { vi: `sumRange(${left}, ${right}) = ${answer}`, en: `sumRange(${left}, ${right}) = ${answer}` },
    codeLines: [8],
    prefix1DView: makeView({
      query: { left, right },
      prefixIndex: -1,
      status: [
        { label: `prefix[${right + 1}]`, value: prefix[right + 1] },
        { label: `prefix[${left}]`, value: prefix[left] },
        { label: "answer", value: `${prefix[right + 1]} - ${prefix[left]} = ${answer}` },
      ],
    }),
    vars: [
      { name: "left", value: left },
      { name: "right", value: right },
      { name: "answer", value: `${prefix[right + 1]} - ${prefix[left]} = ${answer}` },
    ],
    note: {
      vi: `Tong nums[${left}..${right}] = prefix[${right + 1}] - prefix[${left}].`,
      en: `Sum nums[${left}..${right}] = prefix[${right + 1}] - prefix[${left}].`,
    },
    final: true,
  });

  return { steps, answer };
}

function buildSteps307(input, params) {
  const nums = [...input];
  const rawOperations = String((params && params.operations) || "").trim();
  const commands = rawOperations
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const tokens = part.split(/\s+/);
      const op = (tokens[0] || "").toLowerCase();
      const first = Number(tokens[1]);
      const second = Number(tokens[2]);
      return { op, first, second, tokenCount: tokens.length };
    });

  const validCommands = commands.length > 0 && commands.every((command) => {
    const validName = command.op === "update" || command.op === "sumrange";
    const validArgs = command.tokenCount === 3
      && Number.isInteger(command.first)
      && Number.isInteger(command.second);
    if (!validName || !validArgs) return false;
    if (command.op === "update") return command.first >= 0 && command.first < nums.length;
    return command.first >= 0 && command.first <= command.second && command.second < nums.length;
  });

  if (!validCommands) {
    return {
      original: { nums, operations: rawOperations },
      answer: null,
      steps: [{
        title: { vi: "Thao tác không hợp lệ", en: "Invalid operations" },
        codeLines: [1],
        fenwickView: {
          nums,
          bit: new Array(nums.length).fill(0),
          activeNums: [],
          activeBit: [],
          visitedBit: [],
          path: [],
          mode: "idle",
          status: [{ label: "operations", value: rawOperations || "-" }],
        },
        vars: [{ name: "operations", value: rawOperations || "-" }],
        note: {
          vi: "Dùng cú pháp: update index value | sumRange left right.",
          en: "Use: update index value | sumRange left right.",
        },
        final: true,
      }],
    };
  }

  const n = nums.length;
  const bit = new Array(n + 1).fill(0);
  const outputs = [null];
  const steps = [];
  const detailedTrace = n <= 40 && commands.length <= 40;

  const bitText = () => `[${bit.slice(1).join(", ")}]`;
  const numsText = () => `[${nums.join(", ")}]`;
  const outputsText = () => JSON.stringify(outputs);

  function snapshot({
    title,
    codeLine,
    note,
    mode = "idle",
    activeNums = [],
    activeBit = [],
    visitedBit = [],
    path = [],
    status = [],
    vars = [],
    final = false,
    force = false,
  }) {
    if (!detailedTrace && !force) return;
    const step = {
      title,
      codeLines: [codeLine],
      fenwickView: {
        nums: [...nums],
        bit: bit.slice(1),
        activeNums: [...activeNums],
        activeBit: [...activeBit],
        visitedBit: [...visitedBit],
        path: [...path],
        mode,
        status,
      },
      vars: [
        { name: "nums", value: numsText() },
        { name: "bit", value: bitText() },
        { name: "outputs", value: outputsText() },
        ...vars,
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  function traceAdd(startIndex, delta, context) {
    let index = startIndex;
    const path = [];

    snapshot({
      title: { vi: `_add(index=${index}, delta=${delta})`, en: `_add(index=${index}, delta=${delta})` },
      codeLine: 8,
      mode: context.mode,
      activeNums: context.activeNums,
      activeBit: [index],
      path,
      status: context.status,
      vars: [{ name: "index", value: index }, { name: "delta", value: delta }],
      note: {
        vi: "Fenwick dùng index 1-based; bắt đầu tại ô tương ứng với phần tử đang cập nhật.",
        en: "Fenwick uses 1-based indices; start at the cell corresponding to the updated element.",
      },
    });

    while (index <= n) {
      snapshot({
        title: { vi: `index ${index} còn nằm trong BIT`, en: `index ${index} is inside the BIT` },
        codeLine: 9,
        mode: context.mode,
        activeNums: context.activeNums,
        activeBit: [index],
        visitedBit: path,
        path: [...path, index],
        status: context.status,
        vars: [{ name: "index", value: index }, { name: "delta", value: delta }],
        note: {
          vi: `BIT[${index}] quản lý đoạn [${index - (index & -index)}, ${index - 1}] của nums.`,
          en: `BIT[${index}] covers nums[${index - (index & -index)}..${index - 1}].`,
        },
      });

      const before = bit[index];
      bit[index] += delta;
      path.push(index);
      snapshot({
        title: { vi: `BIT[${index}] = ${before} + (${delta}) = ${bit[index]}`, en: `BIT[${index}] = ${before} + (${delta}) = ${bit[index]}` },
        codeLine: 10,
        mode: context.mode,
        activeNums: context.activeNums,
        activeBit: [index],
        visitedBit: path,
        path,
        status: context.status,
        vars: [{ name: `bit[${index}]`, value: `${before} + (${delta}) = ${bit[index]}` }],
        note: {
          vi: `Cộng delta vào tổng đoạn mà BIT[${index}] đại diện.`,
          en: `Add delta to the range sum represented by BIT[${index}].`,
        },
      });

      const lowbit = index & -index;
      const next = index + lowbit;
      snapshot({
        title: { vi: `Nhảy ${index} + lowbit(${index}) = ${next}`, en: `Jump ${index} + lowbit(${index}) = ${next}` },
        codeLine: 11,
        mode: context.mode,
        activeNums: context.activeNums,
        activeBit: next <= n ? [next] : [],
        visitedBit: path,
        path: next <= n ? [...path, next] : path,
        status: context.status,
        vars: [{ name: "lowbit", value: lowbit }, { name: "next index", value: next }],
        note: {
          vi: next <= n ? `Đi tới node cha BIT[${next}], node này quản lý một đoạn lớn hơn.` : `${next} vượt n=${n}, kết thúc đường update.`,
          en: next <= n ? `Move to parent BIT[${next}], which covers a larger range.` : `${next} exceeds n=${n}, so the update path ends.`,
        },
      });
      index = next;
    }

    snapshot({
      title: { vi: "Kết thúc đường cập nhật BIT", en: "Finish the BIT update path" },
      codeLine: 9,
      mode: context.mode,
      activeNums: context.activeNums,
      visitedBit: path,
      path,
      status: context.status,
      vars: [{ name: "index", value: index }, { name: "n", value: n }],
      note: { vi: `index=${index} > n=${n}, vòng lặp dừng.`, en: `index=${index} > n=${n}, so the loop stops.` },
    });
  }

  function tracePrefix(startIndex, context) {
    let index = startIndex;
    let total = 0;
    const path = [];

    snapshot({
      title: { vi: `_prefix(index=${index})`, en: `_prefix(index=${index})` },
      codeLine: 18,
      mode: "query",
      activeNums: context.activeNums,
      activeBit: index > 0 ? [index] : [],
      path,
      status: context.status,
      vars: [{ name: "index", value: index }],
      note: { vi: `Tính tổng nums[0..${index - 1}] bằng các đoạn rời nhau trong BIT.`, en: `Compute nums[0..${index - 1}] using disjoint ranges stored in the BIT.` },
    });
    snapshot({
      title: { vi: "Khởi tạo total = 0", en: "Initialize total = 0" },
      codeLine: 19,
      mode: "query",
      activeNums: context.activeNums,
      activeBit: index > 0 ? [index] : [],
      path,
      status: context.status,
      vars: [{ name: "total", value: total }],
      note: { vi: "Mỗi node trên đường đi sẽ đóng góp đúng một đoạn không chồng lặp.", en: "Each visited node contributes one non-overlapping range." },
    });

    while (index > 0) {
      snapshot({
        title: { vi: `index=${index} > 0`, en: `index=${index} > 0` },
        codeLine: 20,
        mode: "query",
        activeNums: context.activeNums,
        activeBit: [index],
        visitedBit: path,
        path: [...path, index],
        status: context.status,
        vars: [{ name: "index", value: index }, { name: "total", value: total }],
        note: { vi: `Đọc tổng đoạn [${index - (index & -index)}, ${index - 1}] từ BIT[${index}].`, en: `Read range [${index - (index & -index)}, ${index - 1}] from BIT[${index}].` },
      });

      const before = total;
      total += bit[index];
      path.push(index);
      snapshot({
        title: { vi: `total = ${before} + ${bit[index]} = ${total}`, en: `total = ${before} + ${bit[index]} = ${total}` },
        codeLine: 21,
        mode: "query",
        activeNums: context.activeNums,
        activeBit: [index],
        visitedBit: path,
        path,
        status: context.status,
        vars: [{ name: "total", value: `${before} + ${bit[index]} = ${total}` }, { name: `bit[${index}]`, value: bit[index] }],
        note: { vi: `Cộng tổng lưu tại BIT[${index}] vào kết quả prefix.`, en: `Add the sum stored at BIT[${index}] to the prefix result.` },
      });

      const lowbit = index & -index;
      const next = index - lowbit;
      snapshot({
        title: { vi: `Lùi ${index} - lowbit(${index}) = ${next}`, en: `Move ${index} - lowbit(${index}) = ${next}` },
        codeLine: 22,
        mode: "query",
        activeNums: context.activeNums,
        activeBit: next > 0 ? [next] : [],
        visitedBit: path,
        path: next > 0 ? [...path, next] : path,
        status: context.status,
        vars: [{ name: "lowbit", value: lowbit }, { name: "next index", value: next }],
        note: { vi: next > 0 ? `Bỏ đoạn vừa cộng và đi tới phần prefix còn lại tại BIT[${next}].` : "Đã phủ hết prefix, index trở về 0.", en: next > 0 ? `Remove the covered range and continue with BIT[${next}].` : "The whole prefix is covered, so index reaches 0." },
      });
      index = next;
    }

    snapshot({
      title: { vi: "index = 0, dừng query", en: "index = 0, stop the query" },
      codeLine: 20,
      mode: "query",
      activeNums: context.activeNums,
      visitedBit: path,
      path,
      status: context.status,
      vars: [{ name: "index", value: index }, { name: "total", value: total }],
      note: { vi: "Không còn đoạn prefix nào cần cộng.", en: "No prefix range remains to be added." },
    });
    snapshot({
      title: { vi: `Trả về prefix sum ${total}`, en: `Return prefix sum ${total}` },
      codeLine: 23,
      mode: "query",
      activeNums: context.activeNums,
      visitedBit: path,
      path,
      status: context.status,
      vars: [{ name: "return", value: total }],
      note: { vi: `Tổng prefix cần tìm là ${total}.`, en: `The requested prefix sum is ${total}.` },
    });
    return total;
  }

  snapshot({
    title: { vi: "Sao chép nums để hỗ trợ update", en: "Copy nums for future updates" },
    codeLine: 3,
    mode: "build",
    status: [{ label: "n", value: n }, { label: "phase", value: "build" }],
    note: { vi: "Cần giữ giá trị hiện tại của nums[index] để tính delta khi update.", en: "Keep each current nums[index] value so update can compute its delta." },
    force: true,
  });
  snapshot({
    title: { vi: `Tạo BIT gồm ${n} ô 0`, en: `Create ${n} zeroed BIT cells` },
    codeLine: 4,
    mode: "build",
    status: [{ label: "BIT size", value: n }, { label: "indexing", value: "1-based" }],
    note: { vi: "bit[0] không dùng; hình chỉ hiển thị bit[1..n].", en: "bit[0] is unused; the visual shows bit[1..n]." },
  });

  for (let index = 0; index < n; index += 1) {
    snapshot({
      title: { vi: `Build từ nums[${index}] = ${nums[index]}`, en: `Build from nums[${index}] = ${nums[index]}` },
      codeLine: 5,
      mode: "build",
      activeNums: [index],
      status: [{ label: "i", value: index }, { label: "value", value: nums[index] }],
      vars: [{ name: "i", value: index }, { name: "value", value: nums[index] }],
      note: { vi: "Duyệt từng phần tử để cộng nó vào mọi Fenwick node chứa index này.", en: "Visit each value and add it to every Fenwick node whose range contains this index." },
    });
    snapshot({
      title: { vi: `Gọi _add(${index + 1}, ${nums[index]})`, en: `Call _add(${index + 1}, ${nums[index]})` },
      codeLine: 6,
      mode: "build",
      activeNums: [index],
      activeBit: [index + 1],
      status: [{ label: "i", value: index }, { label: "delta", value: nums[index] }],
      note: { vi: "Đổi index nums 0-based sang index BIT 1-based.", en: "Convert the 0-based nums index to the 1-based BIT index." },
    });
    traceAdd(index + 1, nums[index], {
      mode: "build",
      activeNums: [index],
      status: [{ label: "build nums index", value: index }, { label: "value", value: nums[index] }],
    });
  }

  for (let commandIndex = 0; commandIndex < commands.length; commandIndex += 1) {
    const command = commands[commandIndex];
    const isLast = commandIndex === commands.length - 1;

    if (command.op === "update") {
      const index = command.first;
      const value = command.second;
      snapshot({
        title: { vi: `update(${index}, ${value})`, en: `update(${index}, ${value})` },
        codeLine: 13,
        mode: "update",
        activeNums: [index],
        status: [{ label: "operation", value: `${commandIndex + 1}/${commands.length}` }, { label: "update", value: `[${index}] = ${value}` }],
        vars: [{ name: "index", value: index }, { name: "val", value: value }],
        note: { vi: `Đổi nums[${index}] từ ${nums[index]} thành ${value}.`, en: `Change nums[${index}] from ${nums[index]} to ${value}.` },
      });
      const delta = value - nums[index];
      snapshot({
        title: { vi: `delta = ${value} - ${nums[index]} = ${delta}`, en: `delta = ${value} - ${nums[index]} = ${delta}` },
        codeLine: 14,
        mode: "update",
        activeNums: [index],
        status: [{ label: "old", value: nums[index] }, { label: "new", value }, { label: "delta", value: delta }],
        vars: [{ name: "delta", value: `${value} - ${nums[index]} = ${delta}` }],
        note: { vi: "Fenwick chỉ cần cộng phần chênh lệch vào các node liên quan.", en: "Fenwick only needs to add the difference to affected nodes." },
      });
      const oldValue = nums[index];
      nums[index] = value;
      snapshot({
        title: { vi: `Ghi nums[${index}] = ${value}`, en: `Write nums[${index}] = ${value}` },
        codeLine: 15,
        mode: "update",
        activeNums: [index],
        status: [{ label: "old", value: oldValue }, { label: "new", value }, { label: "delta", value: delta }],
        vars: [{ name: `nums[${index}]`, value }],
        note: { vi: "Mảng gốc giờ phản ánh giá trị mới.", en: "The source array now reflects the new value." },
      });
      snapshot({
        title: { vi: `Gọi _add(${index + 1}, ${delta})`, en: `Call _add(${index + 1}, ${delta})` },
        codeLine: 16,
        mode: "update",
        activeNums: [index],
        activeBit: [index + 1],
        status: [{ label: "update", value: `[${index}]` }, { label: "delta", value: delta }],
        note: { vi: "Bắt đầu cập nhật các Fenwick range chứa nums[index].", en: "Begin updating Fenwick ranges that contain nums[index]." },
      });
      traceAdd(index + 1, delta, {
        mode: "update",
        activeNums: [index],
        status: [{ label: "update index", value: index }, { label: "delta", value: delta }],
      });
      outputs.push(null);
      snapshot({
        title: { vi: `Hoàn tất update(${index}, ${value})`, en: `Finish update(${index}, ${value})` },
        codeLine: 16,
        mode: "update",
        activeNums: [index],
        status: [{ label: "operation", value: `${commandIndex + 1}/${commands.length}` }, { label: "output", value: "null" }],
        vars: [{ name: "delta", value: delta }],
        note: { vi: "Mảng nums và BIT đã đồng bộ.", en: "nums and the BIT are now synchronized." },
        final: isLast,
        force: isLast,
      });
    } else {
      const left = command.first;
      const right = command.second;
      const activeNums = Array.from({ length: right - left + 1 }, (_, offset) => left + offset);
      const status = [{ label: "operation", value: `${commandIndex + 1}/${commands.length}` }, { label: "range", value: `[${left}, ${right}]` }];
      snapshot({
        title: { vi: `sumRange(${left}, ${right})`, en: `sumRange(${left}, ${right})` },
        codeLine: 25,
        mode: "query",
        activeNums,
        status,
        vars: [{ name: "left", value: left }, { name: "right", value: right }],
        note: { vi: "Tổng đoạn bằng prefix(right + 1) trừ prefix(left).", en: "The range sum is prefix(right + 1) minus prefix(left)." },
      });
      snapshot({
        title: { vi: `Tính _prefix(${right + 1})`, en: `Compute _prefix(${right + 1})` },
        codeLine: 26,
        mode: "query",
        activeNums,
        activeBit: [right + 1],
        status,
        note: { vi: `Vế phải bao gồm nums[0..${right}].`, en: `The right prefix includes nums[0..${right}].` },
      });
      const rightPrefix = tracePrefix(right + 1, { activeNums, status });
      snapshot({
        title: { vi: `Tính _prefix(${left})`, en: `Compute _prefix(${left})` },
        codeLine: 26,
        mode: "query",
        activeNums,
        activeBit: left > 0 ? [left] : [],
        status,
        vars: [{ name: "right prefix", value: rightPrefix }],
        note: { vi: `Vế trái loại phần nums[0..${left - 1}] khỏi tổng.`, en: `The left prefix removes nums[0..${left - 1}] from the total.` },
      });
      const leftPrefix = tracePrefix(left, { activeNums, status });
      const result = rightPrefix - leftPrefix;
      outputs.push(result);
      snapshot({
        title: { vi: `${rightPrefix} - ${leftPrefix} = ${result}`, en: `${rightPrefix} - ${leftPrefix} = ${result}` },
        codeLine: 26,
        mode: "query",
        activeNums,
        status: [...status, { label: "answer", value: result }],
        vars: [{ name: "right prefix", value: rightPrefix }, { name: "left prefix", value: leftPrefix }, { name: "return", value: result }],
        note: { vi: `sumRange(${left}, ${right}) = ${result}.`, en: `sumRange(${left}, ${right}) = ${result}.` },
        final: isLast,
        force: isLast,
      });
    }
  }

  return { original: { nums: [...input], operations: rawOperations }, answer: outputs, steps };
}

/**
 * LeetCode 1797: Design Authentication Manager.
 * Hash map tokenId -> expiry time (currentTime + ttl). generate always
 * (re)writes the expiry. renew only refreshes it if the token is still
 * unexpired at currentTime (map.get(tokenId, 0) > currentTime), otherwise
 * it's a no-op. countUnexpiredTokens scans every known token and counts
 * those whose expiry is strictly greater than currentTime.
 *
 * Input: pipe-separated commands, e.g.
 *   "generate aaa 2 | countUnexpiredTokens 6 | generate bbb 7 | renew aaa 8 | renew bbb 10 | countUnexpiredTokens 15"
 * Param ttl: timeToLive (default 5).
 */
function buildSteps1797(input, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps1797DLL(input, params);
  return buildSteps1797HashMap(input, params);
}

function buildSteps1797HashMap(input, params) {
  const ttl = params && params.ttl !== undefined ? Number(params.ttl) : 5;
  const raw = String(input || "").trim();
  const steps = [];

  function parseCommands(text) {
    return text
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const tokens = part.split(/\s+/).filter(Boolean);
        const op = (tokens[0] || "").toLowerCase();
        if ((op === "generate" || op === "renew") && tokens.length >= 3) {
          return { op, tokenId: tokens[1], time: Number(tokens[2]), raw: part };
        }
        if (op === "countunexpiredtokens" && tokens.length >= 2) {
          return { op, time: Number(tokens[1]), raw: part };
        }
        return { op: "invalid", raw: part };
      });
  }

  const commands = parseCommands(raw);
  if (!commands.length || commands.some((c) => c.op === "invalid")) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: [],
      final: true,
      codeLines: [1],
      vars: [{ name: "expected", value: "generate aaa 2 | countUnexpiredTokens 6 | ..." }],
      note: {
        vi: "Nhập thao tác dạng: generate tokenId time | renew tokenId time | countUnexpiredTokens time.",
        en: "Enter operations like: generate tokenId time | renew tokenId time | countUnexpiredTokens time.",
      },
    });
    return { original: raw, answer: [], steps };
  }

  const tokens = new Map(); // tokenId -> expiry
  const order = []; // stable display order (insertion order)
  const outputs = [];

  function nodesFor(hlId, extraStatus) {
    return order.map((id) => {
      const exp = tokens.get(id);
      return {
        id,
        label: id,
        row: "main",
        sub: id === hlId && extraStatus ? extraStatus : `exp=${exp}`,
      };
    });
  }

  function push({ title, hlId, activeIds = [], extraStatus, operation, codeLines, vars, note, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: {
        nodes: nodesFor(hlId, extraStatus),
        edges: [],
        layout: "linear",
        order: [...order],
        caption: `${operation || ""} | ttl=${ttl} | tokens: ${order.map((id) => `${id}(${tokens.get(id)})`).join(", ") || "(none)"}`,
        annotations: hlId ? { [hlId]: extraStatus || "checking" } : {},
        hlNodes: hlId ? [hlId] : [],
        hlEdges: [],
        visitedNodes: activeIds,
      },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars: vars || [],
      note,
    });
  }

  push({
    title: { vi: `Khởi tạo AuthenticationManager(timeToLive=${ttl})`, en: `Initialize AuthenticationManager(timeToLive=${ttl})` },
    operation: "__init__",
    codeLines: [3],
    vars: [{ name: "ttl", value: ttl }, { name: "tokens", value: "{}" }],
    note: {
      vi: `Lưu timeToLive=${ttl}. tokens là hash map rỗng: tokenId → thời điểm hết hạn.`,
      en: `Store timeToLive=${ttl}. tokens is an empty hash map: tokenId → expiry time.`,
    },
  });

  for (const command of commands) {
    if (command.op === "generate") {
      const { tokenId, time } = command;
      if (!order.includes(tokenId)) order.push(tokenId);

      push({
        title: { vi: `generate("${tokenId}", ${time})`, en: `generate("${tokenId}", ${time})` },
        hlId: tokenId,
        operation: `generate("${tokenId}", ${time})`,
        codeLines: [5],
        vars: [{ name: "tokenId", value: tokenId }, { name: "currentTime", value: time }],
        note: { vi: `Tạo token mới "${tokenId}" tại thời điểm ${time}.`, en: `Create a new token "${tokenId}" at time ${time}.` },
      });

      const exp = time + ttl;
      tokens.set(tokenId, exp);
      push({
        title: { vi: `tokens["${tokenId}"] = ${time} + ${ttl} = ${exp}`, en: `tokens["${tokenId}"] = ${time} + ${ttl} = ${exp}` },
        hlId: tokenId,
        extraStatus: `exp=${exp}`,
        operation: `generate("${tokenId}", ${time})`,
        codeLines: [6],
        vars: [{ name: `tokens["${tokenId}"]`, value: exp }],
        note: {
          vi: `Token "${tokenId}" sẽ hết hạn tại thời điểm ${exp} (= ${time} + ${ttl}).`,
          en: `Token "${tokenId}" will expire at time ${exp} (= ${time} + ${ttl}).`,
        },
      });
      outputs.push(null);
    } else if (command.op === "renew") {
      const { tokenId, time } = command;
      const known = order.includes(tokenId);
      if (!known) order.push(tokenId);
      const currentExp = tokens.has(tokenId) ? tokens.get(tokenId) : 0;

      push({
        title: { vi: `renew("${tokenId}", ${time})`, en: `renew("${tokenId}", ${time})` },
        hlId: tokenId,
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [7],
        vars: [{ name: "tokenId", value: tokenId }, { name: "currentTime", value: time }],
        note: { vi: `Gia hạn token "${tokenId}" tại thời điểm ${time} (chỉ khi chưa hết hạn).`, en: `Renew token "${tokenId}" at time ${time} (only if not yet expired).` },
      });

      const isExpiredOrMissing = currentExp <= time;
      push({
        title: { vi: `tokens.get("${tokenId}", 0) <= ${time}? ${isExpiredOrMissing} (${currentExp} vs ${time})`, en: `tokens.get("${tokenId}", 0) <= ${time}? ${isExpiredOrMissing} (${currentExp} vs ${time})` },
        hlId: tokenId,
        extraStatus: `exp=${currentExp || "none"}`,
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [8],
        vars: [{ name: `tokens.get("${tokenId}", 0)`, value: currentExp }, { name: "currentTime", value: time }],
        note: {
          vi: isExpiredOrMissing
            ? (tokens.has(tokenId) ? `Token "${tokenId}" đã hết hạn (${currentExp} ≤ ${time}) → bỏ qua.` : `Token "${tokenId}" chưa từng tồn tại → bỏ qua.`)
            : `Token "${tokenId}" vẫn còn hiệu lực (${currentExp} > ${time}) → gia hạn.`,
          en: isExpiredOrMissing
            ? (tokens.has(tokenId) ? `Token "${tokenId}" already expired (${currentExp} ≤ ${time}) → skip.` : `Token "${tokenId}" never existed → skip.`)
            : `Token "${tokenId}" is still valid (${currentExp} > ${time}) → renew it.`,
        },
      });

      if (isExpiredOrMissing) {
        push({
          title: { vi: "return (bỏ qua)", en: "return (skip)" },
          hlId: tokenId,
          operation: `renew("${tokenId}", ${time})`,
          codeLines: [9],
          vars: [],
          note: { vi: `Không làm gì cả; "${tokenId}" giữ nguyên trạng thái cũ.`, en: `Nothing happens; "${tokenId}" keeps its old state.` },
        });
      } else {
        const newExp = time + ttl;
        tokens.set(tokenId, newExp);
        push({
          title: { vi: `tokens["${tokenId}"] = ${time} + ${ttl} = ${newExp}`, en: `tokens["${tokenId}"] = ${time} + ${ttl} = ${newExp}` },
          hlId: tokenId,
          extraStatus: `exp=${newExp}`,
          operation: `renew("${tokenId}", ${time})`,
          codeLines: [10],
          vars: [{ name: `tokens["${tokenId}"]`, value: newExp }],
          note: { vi: `Cập nhật hạn mới của "${tokenId}" thành ${newExp}.`, en: `Update "${tokenId}"'s new expiry to ${newExp}.` },
        });
      }
      outputs.push(null);
    } else if (command.op === "countunexpiredtokens") {
      const { time } = command;
      push({
        title: { vi: `countUnexpiredTokens(${time})`, en: `countUnexpiredTokens(${time})` },
        operation: `countUnexpiredTokens(${time})`,
        codeLines: [11],
        vars: [{ name: "currentTime", value: time }],
        note: { vi: `Đếm số token còn hiệu lực tại thời điểm ${time}.`, en: `Count tokens still valid at time ${time}.` },
      });

      let count = 0;
      push({
        title: { vi: "count = 0", en: "count = 0" },
        operation: `countUnexpiredTokens(${time})`,
        codeLines: [12],
        vars: [{ name: "count", value: count }],
        note: { vi: "Bắt đầu đếm từ 0.", en: "Start counting from 0." },
      });

      const activeSoFar = [];
      for (const id of order) {
        const exp = tokens.get(id);
        push({
          title: { vi: `for exp in tokens.values(): "${id}" → exp=${exp}`, en: `for exp in tokens.values(): "${id}" → exp=${exp}` },
          hlId: id,
          activeIds: [...activeSoFar],
          operation: `countUnexpiredTokens(${time})`,
          codeLines: [13],
          vars: [{ name: "tokenId", value: id }, { name: "exp", value: exp }],
          note: { vi: `Xét token "${id}", hết hạn tại ${exp}.`, en: `Check token "${id}", expiring at ${exp}.` },
        });

        const isActive = exp > time;
        push({
          title: { vi: `exp > ${time}? ${isActive}`, en: `exp > ${time}? ${isActive}` },
          hlId: id,
          activeIds: [...activeSoFar],
          operation: `countUnexpiredTokens(${time})`,
          codeLines: [14],
          vars: [{ name: "exp", value: exp }, { name: "currentTime", value: time }],
          note: {
            vi: isActive ? `"${id}" còn hiệu lực (${exp} > ${time}) → tính vào count.` : `"${id}" đã hết hạn (${exp} ≤ ${time}) → không tính.`,
            en: isActive ? `"${id}" is still valid (${exp} > ${time}) → count it.` : `"${id}" already expired (${exp} ≤ ${time}) → don't count.`,
          },
        });

        if (isActive) {
          count++;
          activeSoFar.push(id);
          push({
            title: { vi: `count += 1 → ${count}`, en: `count += 1 → ${count}` },
            hlId: id,
            activeIds: [...activeSoFar],
            operation: `countUnexpiredTokens(${time})`,
            codeLines: [15],
            vars: [{ name: "count", value: count }],
            note: { vi: `"${id}" hợp lệ, tăng count lên ${count}.`, en: `"${id}" is valid, increment count to ${count}.` },
          });
        }
      }

      push({
        title: { vi: `return count = ${count}`, en: `return count = ${count}` },
        activeIds: [...activeSoFar],
        operation: `countUnexpiredTokens(${time})`,
        codeLines: [16],
        vars: [{ name: "answer", value: count }],
        note: { vi: `Có ${count} token còn hiệu lực tại thời điểm ${time}.`, en: `There are ${count} unexpired token(s) at time ${time}.` },
      });
      outputs.push(count);
    }
  }

  const fs = {
    title: { vi: "Kết quả", en: "Result" },
    arr: [],
    graph: {
      nodes: nodesFor(null),
      edges: [],
      layout: "linear",
      order: [...order],
      caption: `tokens: ${order.map((id) => `${id}(${tokens.get(id)})`).join(", ") || "(none)"}`,
      annotations: {},
      hlNodes: [],
      hlEdges: [],
      visitedNodes: [],
    },
    highlight: [],
    mark: [],
    codeLines: [],
    vars: [{ name: "outputs", value: `[${outputs.map((v) => (v === null ? "null" : v)).join(", ")}]` }],
    note: {
      vi: `Hoàn tất ${commands.length} thao tác.`,
      en: `Finished ${commands.length} operation(s).`,
    },
    final: true,
  };
  steps.push(fs);

  return { original: raw, answer: outputs, steps };
}

/**
 * LeetCode 1797, approach 2: Doubly Linked List + hash map.
 * Exploits the constraint that currentTime is strictly increasing across
 * all calls: every newly generated/renewed expiry is larger than all
 * existing ones, so appending to the TAIL keeps the list sorted by expiry
 * (HEAD = smallest expiry = next to expire). countUnexpiredTokens then only
 * needs to evict from the head while expired, instead of scanning everything.
 * Line-by-line trace of the exact Python code shown to the user:
 *  1  class Node:
 *  2      def __init__(self, tokenId, exp):
 *  3          self.tokenId = tokenId
 *  4          self.exp = exp
 *  5          self.prev = None
 *  6          self.next = None
 *  7
 *  8  class AuthenticationManager:
 *  9      def __init__(self, timeToLive: int):
 * 10          self.ttl = timeToLive
 * 11          self.map = {}
 * 12          self.head = Node(None, 0)
 * 13          self.tail = Node(None, 0)
 * 14          self.head.next = self.tail
 * 15          self.tail.prev = self.head
 * 16
 * 17      def _remove(self, node):
 * 18          node.prev.next = node.next
 * 19          node.next.prev = node.prev
 * 20
 * 21      def _append(self, node):
 * 22          prev = self.tail.prev
 * 23          prev.next = node
 * 24          node.prev = prev
 * 25          node.next = self.tail
 * 26          self.tail.prev = node
 * 27
 * 28      def generate(self, tokenId: str, currentTime: int) -> None:
 * 29          if tokenId in self.map:
 * 30              self._remove(self.map[tokenId])
 * 31          node = Node(tokenId, currentTime + self.ttl)
 * 32          self.map[tokenId] = node
 * 33          self._append(node)
 * 34
 * 35      def renew(self, tokenId: str, currentTime: int) -> None:
 * 36          if tokenId not in self.map:
 * 37              return
 * 38          node = self.map[tokenId]
 * 39          if node.exp <= currentTime:
 * 40              return
 * 41          self._remove(node)
 * 42          node.exp = currentTime + self.ttl
 * 43          self._append(node)
 * 44
 * 45      def countUnexpiredTokens(self, currentTime: int) -> int:
 * 46          while self.head.next is not self.tail and self.head.next.exp <= currentTime:
 * 47              expired = self.head.next
 * 48              self._remove(expired)
 * 49              del self.map[expired.tokenId]
 * 50          return len(self.map)
 */
function buildSteps1797DLL(input, params) {
  const ttl = params && params.ttl !== undefined ? Number(params.ttl) : 5;
  const raw = String(input || "").trim();
  const steps = [];

  function parseCommands(text) {
    return text
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const tokens = part.split(/\s+/).filter(Boolean);
        const op = (tokens[0] || "").toLowerCase();
        if ((op === "generate" || op === "renew") && tokens.length >= 3) {
          return { op, tokenId: tokens[1], time: Number(tokens[2]), raw: part };
        }
        if (op === "countunexpiredtokens" && tokens.length >= 2) {
          return { op, time: Number(tokens[1]), raw: part };
        }
        return { op: "invalid", raw: part };
      });
  }

  const commands = parseCommands(raw);
  if (!commands.length || commands.some((c) => c.op === "invalid")) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: [],
      final: true,
      codeBlock: 2,
      codeLines: [1],
      vars: [{ name: "expected", value: "generate aaa 2 | countUnexpiredTokens 6 | ..." }],
      note: {
        vi: "Nhập thao tác dạng: generate tokenId time | renew tokenId time | countUnexpiredTokens time.",
        en: "Enter operations like: generate tokenId time | renew tokenId time | countUnexpiredTokens time.",
      },
    });
    return { original: raw, answer: [], steps };
  }

  const HEAD = "head";
  const TAIL = "tail";
  const map = new Map(); // tokenId -> exp
  const nextMap = new Map();
  const prevMap = new Map();
  nextMap.set(HEAD, TAIL);
  prevMap.set(TAIL, HEAD);
  const outputs = [];

  function order() {
    const ord = [];
    let cur = HEAD;
    while (cur) {
      ord.push(cur);
      cur = nextMap.get(cur);
    }
    return ord;
  }

  function push({ title, hlId, activeIds = [], extraStatus, operation, codeLines, vars, note, final = false }) {
    const ord = order();
    const nodes = ord.map((id) => {
      if (id === HEAD) return { id, label: "H", row: "main", sub: "sentinel" };
      if (id === TAIL) return { id, label: "T", row: "main", sub: "sentinel" };
      const exp = map.get(id);
      return { id, label: id, row: "main", sub: id === hlId && extraStatus ? extraStatus : `exp=${exp}` };
    });
    const edges = [];
    for (let i = 0; i < ord.length - 1; i++) {
      edges.push({ u: ord[i], v: ord[i + 1], w: "next", kind: "next" });
      edges.push({ u: ord[i + 1], v: ord[i], w: "prev", kind: "prev" });
    }
    steps.push({
      title,
      arr: [],
      graph: {
        nodes,
        edges,
        layout: "linear",
        order: ord,
        caption: `${operation || ""} | ttl=${ttl} | head→tail: ${ord.map((id) => (id === HEAD ? "H" : id === TAIL ? "T" : `${id}(${map.get(id)})`)).join(" → ")}`,
        annotations: hlId ? { [hlId]: extraStatus || "checking" } : {},
        hlNodes: hlId ? [hlId] : [],
        hlEdges: [],
        visitedNodes: activeIds,
      },
      highlight: [],
      mark: [],
      final,
      codeBlock: 2,
      codeLines,
      vars: vars || [],
      note,
    });
  }

  function removeNode(id) {
    const p = prevMap.get(id);
    const n = nextMap.get(id);
    nextMap.set(p, n);
    prevMap.set(n, p);
  }
  function appendNode(id) {
    const tailPrev = prevMap.get(TAIL);
    nextMap.set(tailPrev, id);
    prevMap.set(id, tailPrev);
    nextMap.set(id, TAIL);
    prevMap.set(TAIL, id);
  }

  push({
    title: { vi: `Khởi tạo AuthenticationManager(timeToLive=${ttl})`, en: `Initialize AuthenticationManager(timeToLive=${ttl})` },
    operation: "__init__",
    codeLines: [9],
    vars: [{ name: "ttl", value: ttl }, { name: "map", value: "{}" }],
    note: {
      vi: `Lưu timeToLive=${ttl}. Doubly linked list chỉ có 2 sentinel head/tail; nhờ currentTime luôn tăng, list sẽ tự sắp theo hạn tăng dần từ head đến tail.`,
      en: `Store timeToLive=${ttl}. The doubly linked list starts with just head/tail sentinels; since currentTime always increases, the list stays sorted by expiry from head to tail.`,
    },
  });

  for (const command of commands) {
    if (command.op === "generate") {
      const { tokenId, time } = command;
      push({
        title: { vi: `generate("${tokenId}", ${time})`, en: `generate("${tokenId}", ${time})` },
        hlId: tokenId,
        operation: `generate("${tokenId}", ${time})`,
        codeLines: [28],
        vars: [{ name: "tokenId", value: tokenId }, { name: "currentTime", value: time }],
        note: { vi: `Tạo (hoặc thay) token "${tokenId}" tại thời điểm ${time}.`, en: `Create (or replace) token "${tokenId}" at time ${time}.` },
      });

      const existed = map.has(tokenId);
      push({
        title: { vi: `"${tokenId}" in map? ${existed}`, en: `"${tokenId}" in map? ${existed}` },
        hlId: existed ? tokenId : undefined,
        operation: `generate("${tokenId}", ${time})`,
        codeLines: [29],
        vars: [{ name: "in map?", value: existed }],
        note: { vi: existed ? `"${tokenId}" đã tồn tại → tháo node cũ trước.` : `"${tokenId}" chưa tồn tại → tạo node mới.`, en: existed ? `"${tokenId}" already exists → detach the old node first.` : `"${tokenId}" doesn't exist yet → create a new node.` },
      });
      if (existed) {
        removeNode(tokenId);
        map.delete(tokenId);
        push({
          title: { vi: `_remove(map["${tokenId}"])`, en: `_remove(map["${tokenId}"])` },
          operation: `generate("${tokenId}", ${time})`,
          codeLines: [30],
          vars: [],
          note: { vi: `Tháo node cũ của "${tokenId}" khỏi vị trí hiện tại trong list.`, en: `Detach "${tokenId}"'s old node from its current spot in the list.` },
        });
      }

      const exp = time + ttl;
      push({
        title: { vi: `node = Node("${tokenId}", ${time} + ${ttl}) = Node("${tokenId}", ${exp})`, en: `node = Node("${tokenId}", ${time} + ${ttl}) = Node("${tokenId}", ${exp})` },
        operation: `generate("${tokenId}", ${time})`,
        codeLines: [31],
        vars: [{ name: "node.exp", value: exp }],
        note: { vi: `Tạo node mới, hết hạn tại ${exp}.`, en: `Create a new node, expiring at ${exp}.` },
      });

      map.set(tokenId, exp);
      push({
        title: { vi: `map["${tokenId}"] = node`, en: `map["${tokenId}"] = node` },
        hlId: tokenId,
        extraStatus: `exp=${exp}`,
        operation: `generate("${tokenId}", ${time})`,
        codeLines: [32],
        vars: [{ name: `map["${tokenId}"]`, value: `exp=${exp}` }],
        note: { vi: `Đăng ký node vào hash map để tra O(1).`, en: `Register the node in the hash map for O(1) lookup.` },
      });

      appendNode(tokenId);
      push({
        title: { vi: `_append(node) → gắn "${tokenId}" vào cuối (tail)`, en: `_append(node) → attach "${tokenId}" at the tail` },
        hlId: tokenId,
        extraStatus: `exp=${exp}`,
        operation: `generate("${tokenId}", ${time})`,
        codeLines: [33],
        vars: [{ name: "position", value: "tail (largest expiry so far)" }],
        note: { vi: `currentTime luôn tăng nên exp mới luôn lớn nhất → gắn vào tail giữ list sắp tăng dần.`, en: `currentTime always increases, so the new exp is always the largest → appending at the tail keeps the list sorted.` },
      });
      outputs.push(null);
    } else if (command.op === "renew") {
      const { tokenId, time } = command;
      push({
        title: { vi: `renew("${tokenId}", ${time})`, en: `renew("${tokenId}", ${time})` },
        hlId: tokenId,
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [35],
        vars: [{ name: "tokenId", value: tokenId }, { name: "currentTime", value: time }],
        note: { vi: `Gia hạn "${tokenId}" nếu còn hiệu lực.`, en: `Renew "${tokenId}" if still valid.` },
      });

      const exists = map.has(tokenId);
      push({
        title: { vi: `"${tokenId}" not in map? ${!exists}`, en: `"${tokenId}" not in map? ${!exists}` },
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [36],
        vars: [{ name: "in map?", value: exists }],
        note: { vi: exists ? `"${tokenId}" tồn tại, kiểm tra hạn.` : `"${tokenId}" chưa từng tồn tại → bỏ qua.`, en: exists ? `"${tokenId}" exists, check its expiry.` : `"${tokenId}" never existed → skip.` },
      });
      if (!exists) {
        push({
          title: { vi: "return (bỏ qua)", en: "return (skip)" },
          operation: `renew("${tokenId}", ${time})`,
          codeLines: [37],
          vars: [],
          note: { vi: "Không có gì để gia hạn.", en: "Nothing to renew." },
        });
        outputs.push(null);
        continue;
      }

      const exp = map.get(tokenId);
      push({
        title: { vi: `node = map["${tokenId}"] (exp=${exp})`, en: `node = map["${tokenId}"] (exp=${exp})` },
        hlId: tokenId,
        extraStatus: `exp=${exp}`,
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [38],
        vars: [{ name: "node.exp", value: exp }],
        note: { vi: `Tra node của "${tokenId}" từ hash map.`, en: `Look up "${tokenId}"'s node from the hash map.` },
      });

      const isExpired = exp <= time;
      push({
        title: { vi: `node.exp <= ${time}? ${isExpired} (${exp} vs ${time})`, en: `node.exp <= ${time}? ${isExpired} (${exp} vs ${time})` },
        hlId: tokenId,
        extraStatus: `exp=${exp}`,
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [39],
        vars: [{ name: "node.exp", value: exp }, { name: "currentTime", value: time }],
        note: { vi: isExpired ? `"${tokenId}" đã hết hạn → bỏ qua.` : `"${tokenId}" còn hiệu lực → gia hạn.`, en: isExpired ? `"${tokenId}" already expired → skip.` : `"${tokenId}" still valid → renew it.` },
      });
      if (isExpired) {
        push({
          title: { vi: "return (bỏ qua)", en: "return (skip)" },
          hlId: tokenId,
          operation: `renew("${tokenId}", ${time})`,
          codeLines: [40],
          vars: [],
          note: { vi: `"${tokenId}" giữ nguyên trạng thái cũ, sẽ bị dọn ở lần countUnexpiredTokens kế tiếp.`, en: `"${tokenId}" keeps its old state; it will be cleaned up on the next countUnexpiredTokens call.` },
        });
        outputs.push(null);
        continue;
      }

      removeNode(tokenId);
      push({
        title: { vi: `_remove(node) → tháo "${tokenId}" khỏi vị trí cũ`, en: `_remove(node) → detach "${tokenId}" from its old spot` },
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [41],
        vars: [],
        note: { vi: "Cần tháo ra trước khi gắn lại vào tail với hạn mới.", en: "Must detach before re-attaching at the tail with the new expiry." },
      });

      const newExp = time + ttl;
      map.set(tokenId, newExp);
      push({
        title: { vi: `node.exp = ${time} + ${ttl} = ${newExp}`, en: `node.exp = ${time} + ${ttl} = ${newExp}` },
        hlId: tokenId,
        extraStatus: `exp=${newExp}`,
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [42],
        vars: [{ name: "node.exp", value: newExp }],
        note: { vi: `Cập nhật hạn mới của "${tokenId}" thành ${newExp}.`, en: `Update "${tokenId}"'s new expiry to ${newExp}.` },
      });

      appendNode(tokenId);
      push({
        title: { vi: `_append(node) → gắn lại "${tokenId}" vào tail`, en: `_append(node) → re-attach "${tokenId}" at the tail` },
        hlId: tokenId,
        extraStatus: `exp=${newExp}`,
        operation: `renew("${tokenId}", ${time})`,
        codeLines: [43],
        vars: [{ name: "position", value: "tail (largest expiry so far)" }],
        note: { vi: `Hạn mới luôn lớn nhất nên gắn vào tail giữ list sắp tăng dần.`, en: `The new expiry is always the largest, so appending at the tail keeps the list sorted.` },
      });
      outputs.push(null);
    } else if (command.op === "countunexpiredtokens") {
      const { time } = command;
      push({
        title: { vi: `countUnexpiredTokens(${time})`, en: `countUnexpiredTokens(${time})` },
        operation: `countUnexpiredTokens(${time})`,
        codeLines: [45],
        vars: [{ name: "currentTime", value: time }],
        note: { vi: `Dọn hết token đã hết hạn từ head, rồi trả về số token còn lại.`, en: `Evict every expired token starting from head, then return how many remain.` },
      });

      const removedIds = [];
      while (true) {
        const headNext = nextMap.get(HEAD);
        const isTail = headNext === TAIL;
        const headExp = isTail ? null : map.get(headNext);
        const shouldEvict = !isTail && headExp <= time;
        push({
          title: {
            vi: `head.next là tail hoặc đã hết hạn? ${shouldEvict}${isTail ? " (list rỗng)" : ` (exp=${headExp})`}`,
            en: `head.next is tail or expired? ${shouldEvict}${isTail ? " (empty list)" : ` (exp=${headExp})`}`,
          },
          hlId: isTail ? undefined : headNext,
          extraStatus: isTail ? undefined : `exp=${headExp}`,
          operation: `countUnexpiredTokens(${time})`,
          codeLines: [46],
          vars: [{ name: "head.next", value: isTail ? "tail" : `${headNext} (exp=${headExp})` }],
          note: {
            vi: isTail
              ? "Danh sách rỗng → dừng vòng lặp."
              : shouldEvict
                ? `"${headNext}" là token cũ nhất (hạn nhỏ nhất=${headExp}) và đã hết hạn (${headExp} ≤ ${time}) → cần dọn.`
                : `"${headNext}" là token cũ nhất nhưng vẫn còn hiệu lực (${headExp} > ${time}) → dừng vòng lặp, các token còn lại đều còn hiệu lực.`,
            en: isTail
              ? "The list is empty → stop the loop."
              : shouldEvict
                ? `"${headNext}" is the oldest token (smallest expiry=${headExp}) and already expired (${headExp} ≤ ${time}) → evict it.`
                : `"${headNext}" is the oldest token but still valid (${headExp} > ${time}) → stop the loop, every remaining token is valid.`,
          },
        });
        if (!shouldEvict) break;

        const expired = headNext;
        push({
          title: { vi: `expired = head.next = "${expired}"`, en: `expired = head.next = "${expired}"` },
          hlId: expired,
          extraStatus: `exp=${headExp}`,
          operation: `countUnexpiredTokens(${time})`,
          codeLines: [47],
          vars: [{ name: "expired", value: expired }],
          note: { vi: `Chuẩn bị xóa token hết hạn "${expired}".`, en: `Prepare to remove the expired token "${expired}".` },
        });

        removeNode(expired);
        push({
          title: { vi: `_remove(expired) → tháo "${expired}" khỏi list`, en: `_remove(expired) → detach "${expired}" from the list` },
          operation: `countUnexpiredTokens(${time})`,
          codeLines: [48],
          vars: [],
          note: { vi: `Head giờ trỏ tới token cũ nhất kế tiếp.`, en: `Head now points to the next-oldest token.` },
        });

        map.delete(expired);
        removedIds.push(expired);
        push({
          title: { vi: `del map["${expired}"]`, en: `del map["${expired}"]` },
          operation: `countUnexpiredTokens(${time})`,
          codeLines: [49],
          vars: [{ name: "removed", value: expired }],
          note: { vi: `"${expired}" bị loại hoàn toàn khỏi hệ thống.`, en: `"${expired}" is fully gone from the structure.` },
        });
      }

      const count = map.size;
      push({
        title: { vi: `return len(map) = ${count}`, en: `return len(map) = ${count}` },
        activeIds: [...map.keys()],
        operation: `countUnexpiredTokens(${time})`,
        codeLines: [50],
        vars: [{ name: "answer", value: count }],
        note: { vi: `Sau khi dọn xong, còn ${count} token hợp lệ trong map.`, en: `After cleanup, ${count} valid token(s) remain in the map.` },
      });
      outputs.push(count);
    }
  }

  const ordFinal = order();
  const fs = {
    title: { vi: "Kết quả", en: "Result" },
    arr: [],
    graph: {
      nodes: ordFinal.map((id) => (id === HEAD ? { id, label: "H", row: "main", sub: "sentinel" } : id === TAIL ? { id, label: "T", row: "main", sub: "sentinel" } : { id, label: id, row: "main", sub: `exp=${map.get(id)}` })),
      edges: (() => {
        const e = [];
        for (let i = 0; i < ordFinal.length - 1; i++) {
          e.push({ u: ordFinal[i], v: ordFinal[i + 1], w: "next", kind: "next" });
          e.push({ u: ordFinal[i + 1], v: ordFinal[i], w: "prev", kind: "prev" });
        }
        return e;
      })(),
      layout: "linear",
      order: ordFinal,
      caption: `head→tail: ${ordFinal.map((id) => (id === HEAD ? "H" : id === TAIL ? "T" : `${id}(${map.get(id)})`)).join(" → ")}`,
      annotations: {},
      hlNodes: [],
      hlEdges: [],
      visitedNodes: [],
    },
    highlight: [],
    mark: [],
    codeBlock: 2,
    codeLines: [],
    vars: [{ name: "outputs", value: `[${outputs.map((v) => (v === null ? "null" : v)).join(", ")}]` }],
    note: {
      vi: `Hoàn tất ${commands.length} thao tác.`,
      en: `Finished ${commands.length} operation(s).`,
    },
    final: true,
  };
  steps.push(fs);

  return { original: raw, answer: outputs, steps };
}

module.exports = {
  1797: {
    id: 1797,
    difficulty: "medium",
    slug: "design-authentication-manager",
    category: { key: "doubly-linked-list", vi: "Danh sách liên kết đôi", en: "Doubly Linked List" },
    title: { vi: "Design Authentication Manager", en: "Design Authentication Manager" },
    titleVi: { vi: "Thiết kế hệ thống quản lý xác thực", en: "Design an authentication token manager" },
    statement: {
      vi:
        "Thiết kế AuthenticationManager(timeToLive): generate(tokenId, currentTime) tạo token mới hết hạn sau timeToLive giây. " +
        "renew(tokenId, currentTime) gia hạn token nếu nó CHƯA hết hạn (nếu đã hết hạn hoặc không tồn tại thì bỏ qua). " +
        "countUnexpiredTokens(currentTime) trả về số token còn hiệu lực tại thời điểm đó. " +
        "Nếu token hết hạn đúng lúc t và có hành động khác cũng tại t, coi như hết hạn xảy ra TRƯỚC.",
      en:
        "Design AuthenticationManager(timeToLive): generate(tokenId, currentTime) creates a new token expiring timeToLive seconds later. " +
        "renew(tokenId, currentTime) renews the token only if it is NOT yet expired (ignored if expired or nonexistent). " +
        "countUnexpiredTokens(currentTime) returns how many tokens are still valid at that time. " +
        "If a token expires exactly at time t and another action also happens at t, expiration is considered to happen FIRST.",
    },
    defaultInput: "generate aaa 2 | countUnexpiredTokens 6 | generate bbb 7 | renew aaa 8 | renew bbb 10 | countUnexpiredTokens 15",
    inputKind: "string",
    inputLabel: { vi: "Thao tác, ngăn cách bằng |", en: "Operations separated by |" },
    extraParams: [
      { key: "ttl", label: { vi: "timeToLive", en: "timeToLive" }, default: 5 },
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Hash Map thuần", en: "Approach 1: Plain Hash Map" } },
        { value: "2", label: { vi: "Cách 2: Doubly Linked List + Hash Map", en: "Approach 2: Doubly Linked List + Hash Map" } },
      ] },
    ],
    approach: [
      { vi: "Hash map tokenId → thời điểm hết hạn (currentTime + ttl).", en: "Hash map tokenId → expiry time (currentTime + ttl)." },
      { vi: "generate luôn ghi đè (tạo mới) thời điểm hết hạn.", en: "generate always overwrites (creates) the expiry time." },
      { vi: "renew chỉ gia hạn nếu token còn hiệu lực (exp > currentTime); ngược lại bỏ qua.", en: "renew only refreshes if the token is still valid (exp > currentTime); otherwise it's a no-op." },
      { vi: "countUnexpiredTokens quét toàn bộ map, đếm token có exp > currentTime.", en: "countUnexpiredTokens scans the whole map, counting tokens with exp > currentTime." },
    ],
    complexity: {
      time: "O(1) generate/renew, O(n) countUnexpiredTokens",
      space: "O(n)",
      note: {
        vi: "n = số tokenId đã từng generate. generate/renew là tra map O(1); countUnexpiredTokens phải quét hết map.",
        en: "n = number of tokenIds ever generated. generate/renew are O(1) map lookups; countUnexpiredTokens must scan the whole map.",
      },
    },
    code: [
      "class AuthenticationManager:",
      "    def __init__(self, timeToLive: int):",
      "        self.ttl = timeToLive",
      "        self.tokens = {}",
      "    def generate(self, tokenId: str, currentTime: int) -> None:",
      "        self.tokens[tokenId] = currentTime + self.ttl",
      "    def renew(self, tokenId: str, currentTime: int) -> None:",
      "        if self.tokens.get(tokenId, 0) <= currentTime:",
      "            return",
      "        self.tokens[tokenId] = currentTime + self.ttl",
      "    def countUnexpiredTokens(self, currentTime: int) -> int:",
      "        count = 0",
      "        for exp in self.tokens.values():",
      "            if exp > currentTime:",
      "                count += 1",
      "        return count",
    ],
    code2: [
      "class Node:",
      "    def __init__(self, tokenId, exp):",
      "        self.tokenId = tokenId",
      "        self.exp = exp",
      "        self.prev = None",
      "        self.next = None",
      "",
      "class AuthenticationManager:",
      "    def __init__(self, timeToLive: int):",
      "        self.ttl = timeToLive",
      "        self.map = {}",
      "        self.head = Node(None, 0)",
      "        self.tail = Node(None, 0)",
      "        self.head.next = self.tail",
      "        self.tail.prev = self.head",
      "",
      "    def _remove(self, node):",
      "        node.prev.next = node.next",
      "        node.next.prev = node.prev",
      "",
      "    def _append(self, node):",
      "        prev = self.tail.prev",
      "        prev.next = node",
      "        node.prev = prev",
      "        node.next = self.tail",
      "        self.tail.prev = node",
      "",
      "    def generate(self, tokenId: str, currentTime: int) -> None:",
      "        if tokenId in self.map:",
      "            self._remove(self.map[tokenId])",
      "        node = Node(tokenId, currentTime + self.ttl)",
      "        self.map[tokenId] = node",
      "        self._append(node)",
      "",
      "    def renew(self, tokenId: str, currentTime: int) -> None:",
      "        if tokenId not in self.map:",
      "            return",
      "        node = self.map[tokenId]",
      "        if node.exp <= currentTime:",
      "            return",
      "        self._remove(node)",
      "        node.exp = currentTime + self.ttl",
      "        self._append(node)",
      "",
      "    def countUnexpiredTokens(self, currentTime: int) -> int:",
      "        while self.head.next is not self.tail and self.head.next.exp <= currentTime:",
      "            expired = self.head.next",
      "            self._remove(expired)",
      "            del self.map[expired.tokenId]",
      "        return len(self.map)",
    ],
    codeLabel: { vi: "Cách 1: Hash Map thuần", en: "Approach 1: Plain Hash Map" },
    code2Label: { vi: "Cách 2: Doubly Linked List + Hash Map", en: "Approach 2: Doubly Linked List + Hash Map" },
    builder: buildSteps1797,
  },
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
    codeCsharp: [
      "public class Solution {",
      "    public int[] TwoSum(int[] nums, int target) {",
      "        var seen = new Dictionary<int, int>();",
      "        for (int i = 0; i < nums.Length; i++) {",
      "            int complement = target - nums[i];",
      "            if (seen.ContainsKey(complement)) {",
      "                return new int[] { i, seen[complement] };",
      "            }",
      "            seen[nums[i]] = i;",
      "        }",
      "        return new int[] {};",
      "    }",
      "}",
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
    requireEqualLength: true,
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
  523: {
    id: 523,
    difficulty: "medium",
    slug: "continuous-subarray-sum",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Continuous Subarray Sum", en: "Continuous Subarray Sum" },
    titleVi: { vi: "Kiểm tra tổng đoạn con là bội của k", en: "Continuous subarray sum" },
    statement: {
      vi: "Cho mảng số nguyên không âm nums và số nguyên dương k. Trả về True nếu tồn tại một đoạn con liên tiếp có ít nhất 2 phần tử và tổng chia hết cho k.",
      en: "Given a non-negative integer array nums and an integer k, return true if a continuous subarray of length at least 2 has a sum that is a multiple of k.",
    },
    defaultInput: [23, 2, 4, 6, 7],
    inputKind: "nonneg",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 6, min: 1, max: 2147483647 },
    ],
    approach: [
      {
        vi: "Tại mỗi chỉ số i, tính tổng tiền tố prefix_sum = nums[0] + ... + nums[i], rồi lấy phần dư prefix_sum % k.",
        en: "Track each prefix sum modulo k instead of the full sum.",
      },
      {
        vi: "Nếu cùng một phần dư xuất hiện tại hai tổng tiền tố, hiệu của hai tổng đó chia hết cho k. Hiệu này chính là tổng đoạn con nằm giữa chúng.",
        en: "When a remainder repeats, the sum between those prefixes is divisible by k.",
      },
      {
        vi: "first_seen lưu chỉ số sớm nhất của từng phần dư. Chỉ trả về True khi khoảng cách giữa hai chỉ số ít nhất là 2.",
        en: "Store the earliest index for each remainder and require a distance of at least 2.",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(min(n, k))",
      note: {
        vi: "Duyệt mảng một lần. Hash map first_seen lưu chỉ số xuất hiện đầu tiên của mỗi phần dư.",
        en: "One pass; the hash map stores the earliest index for each remainder.",
      },
    },
    code: [
      "class Solution:",
      "    def checkSubarraySum(self, nums: List[int], k: int) -> bool:",
      "        first_seen = {0: -1}",
      "        prefix_sum = 0",
      "        for i, num in enumerate(nums):",
      "            prefix_sum += num",
      "            remainder = prefix_sum % k",
      "            if remainder in first_seen:",
      "                if i - first_seen[remainder] >= 2:",
      "                    return True",
      "            else:",
      "                first_seen[remainder] = i",
      "        return False",
    ],
    builder: buildSteps523,
  },
  974: {
    id: 974,
    difficulty: "medium",
    slug: "subarray-sums-divisible-by-k",
    category: { key: "prefix-sum", vi: "Tổng tiền tố", en: "Prefix Sum" },
    title: { vi: "Subarray Sums Divisible by K", en: "Subarray Sums Divisible by K" },
    titleVi: { vi: "Đếm mảng con có tổng chia hết cho K", en: "Count subarrays with sums divisible by K" },
    statement: {
      vi: "Cho mảng số nguyên nums và số nguyên k. Hãy trả về số mảng con liên tiếp, không rỗng có tổng chia hết cho k.",
      en: "Given an integer array nums and an integer k, return the number of non-empty contiguous subarrays whose sums are divisible by k.",
    },
    defaultInput: [4, 5, 0, -2, -3, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 5, min: 2, max: 10000 },
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Đếm tần suất phần dư", en: "Approach 1: remainder_count.get(...)" } },
        { value: "2", label: { vi: "Cách 2: defaultdict và kiểm tra 'in'", en: "Approach 2: defaultdict + 'in' check" } },
      ] },
    ],
    approach: [
      {
        vi: "Nếu hai tổng tiền tố có cùng phần dư khi chia cho k thì hiệu của chúng chia hết cho k.",
        en: "If two prefix sums have the same remainder modulo k, their difference is divisible by k.",
      },
      {
        vi: "remainder_count[r] lưu số tổng tiền tố trước đó có phần dư bằng r.",
        en: "remainder_count[r] counts earlier prefixes whose remainder is r.",
      },
      {
        vi: "Tại mỗi chỉ số, cộng tần suất của phần dư hiện tại vào kết quả, sau đó tăng tần suất ấy lên 1.",
        en: "At each index, add the current remainder frequency to total, then increment that frequency.",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(min(n, k))",
      note: {
        vi: "Duyệt nums một lần; bảng băm lưu tần suất các phần dư của tổng tiền tố.",
        en: "Scan nums once; the hash map stores prefix remainder frequencies.",
      },
    },
    code: [
      "class Solution:",
      "    def subarraysDivByK(self, nums: List[int], k: int) -> int:",
      "        remainder_count = {0: 1}",
      "        prefix_sum = 0",
      "        total = 0",
      "        for i, num in enumerate(nums):",
      "            prefix_sum += num",
      "            remainder = prefix_sum % k",
      "            total += remainder_count.get(remainder, 0)",
      "            remainder_count[remainder] = remainder_count.get(remainder, 0) + 1",
      "        return total",
    ],
    code2: [
      "class Solution:",
      "    def subarraysDivByK(self, nums, k):",
      "        m = defaultdict(int)",
      "        m[0] = 1",
      "        sum_count = 0",
      "        prefix_sum = 0",
      "        for i in range(len(nums)):",
      "            prefix_sum += nums[i]",
      "            remainder = prefix_sum % k",
      "            if remainder in m:",
      "                sum_count += m[remainder]",
      "            m[remainder] += 1",
      "        return sum_count",
    ],
    codeLabel: { vi: "Cách 1: Đếm tần suất phần dư", en: "Approach 1: remainder_count.get(...)" },
    code2Label: { vi: "Cách 2: defaultdict và kiểm tra 'in'", en: "Approach 2: defaultdict + 'in' check" },
    builder: buildSteps974,
  },
  525: {
    id: 525,
    difficulty: "medium",
    slug: "contiguous-array",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Contiguous Array", en: "Contiguous Array" },
    titleVi: { vi: "Mang con lien tiep co 0 va 1 bang nhau", en: "Longest balanced binary subarray" },
    statement: {
      vi: "Cho mang nhi phan nums. Tra ve do dai lon nhat cua day con lien tiep co so luong 0 va 1 bang nhau.",
      en: "Given a binary array nums, return the maximum length of a contiguous subarray with an equal number of 0 and 1.",
    },
    defaultInput: [0, 1, 0, 1, 1, 0, 0],
    inputKind: "binary",
    inputLabel: { vi: "nums", en: "nums" },
    approach: [
      { vi: "Doi 0 thanh -1 va 1 thanh +1 de bien bai toan thanh prefix balance.", en: "Convert 0 to -1 and 1 to +1 to turn the problem into prefix balance tracking." },
      { vi: "Neu balance lap lai tai hai index, tong delta o giua bang 0, nen so 0 va 1 bang nhau.", en: "If a balance repeats at two indices, the delta sum between them is 0, so zeros and ones are equal." },
      { vi: "Luu index dau tien cua moi balance de lay do dai lon nhat.", en: "Store the earliest index for each balance to maximize the length." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyet mot lan; hash map luu balance dau tien gap duoc.",
        en: "One pass; the hash map stores the first index where each balance appears.",
      },
    },
    code: [
      "class Solution:",
      "    def findMaxLength(self, nums: List[int]) -> int:",
      "        first_seen = {0: -1}",
      "        balance = 0",
      "        max_len = 0",
      "        for i, num in enumerate(nums):",
      "            balance += 1 if num == 1 else -1",
      "            if balance in first_seen:",
      "                max_len = max(max_len, i - first_seen[balance])",
      "            else:",
      "                first_seen[balance] = i",
      "        return max_len",
    ],
    builder: buildSteps525,
  },
  1480: {
    id: 1480,
    difficulty: "easy",
    slug: "running-sum-of-1d-array",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Running Sum of 1D Array", en: "Running Sum of 1D Array" },
    titleVi: { vi: "Tong chay cua mang 1D", en: "Running prefix sum" },
    statement: {
      vi: "Cho mang nums. runningSum[i] bang tong nums[0] + nums[1] + ... + nums[i]. Tra ve mang runningSum.",
      en: "Given an array nums, runningSum[i] is nums[0] + nums[1] + ... + nums[i]. Return the running sum array.",
    },
    defaultInput: [1, 2, 3, 4],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    approach: [
      { vi: "Duyet tu trai sang phai va giu bien running.", en: "Scan from left to right and keep a running total." },
      { vi: "Tai moi index, running += nums[i].", en: "At each index, running += nums[i]." },
      { vi: "Ghi running vao result[i].", en: "Write running into result[i]." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1) extra",
      note: {
        vi: "Neu tinh in-place thi chi can mot bien running ngoai mang ket qua.",
        en: "If done in-place, only one running variable is needed besides the output array.",
      },
    },
    code: [
      "class Solution:",
      "    def runningSum(self, nums: List[int]) -> List[int]:",
      "        running = 0",
      "        for i in range(len(nums)):",
      "            running += nums[i]",
      "            nums[i] = running",
      "        return nums",
    ],
    builder: buildSteps1480,
  },
  303: {
    id: 303,
    difficulty: "easy",
    slug: "range-sum-query-immutable",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Range Sum Query - Immutable", en: "Range Sum Query - Immutable" },
    titleVi: { vi: "Truy van tong doan bat bien", en: "Immutable range sum query" },
    statement: {
      vi: "Cho mang nums khong thay doi. Thiet ke NumArray de tra ve tong nums[left..right] nhieu lan.",
      en: "Given an immutable array nums, design NumArray to return the sum of nums[left..right] many times.",
    },
    defaultInput: [-2, 0, 3, -5, 2, -1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "left", type: "number", label: { vi: "left", en: "left" }, default: 0 },
      { key: "right", type: "number", label: { vi: "right", en: "right" }, default: 2 },
    ],
    approach: [
      { vi: "Build prefix voi prefix[0] = 0.", en: "Build prefix with prefix[0] = 0." },
      { vi: "prefix[i + 1] = prefix[i] + nums[i].", en: "prefix[i + 1] = prefix[i] + nums[i]." },
      { vi: "sumRange(left, right) = prefix[right + 1] - prefix[left].", en: "sumRange(left, right) = prefix[right + 1] - prefix[left]." },
    ],
    complexity: {
      time: "O(n) build, O(1) query",
      space: "O(n)",
      note: {
        vi: "Moi query chi doc hai o prefix.",
        en: "Each query reads only two prefix cells.",
      },
    },
    code: [
      "class NumArray:",
      "    def __init__(self, nums: List[int]):",
      "        self.prefix = [0]",
      "        for num in nums:",
      "            self.prefix.append(self.prefix[-1] + num)",
      "",
      "    def sumRange(self, left: int, right: int) -> int:",
      "        return self.prefix[right + 1] - self.prefix[left]",
    ],
    builder: buildSteps303,
  },
  307: {
    id: 307,
    difficulty: "medium",
    slug: "range-sum-query-mutable",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Range Sum Query - Mutable", en: "Range Sum Query - Mutable" },
    titleVi: { vi: "Truy vấn tổng đoạn có cập nhật", en: "Mutable range sum queries" },
    statement: {
      vi: "Thiết kế NumArray hỗ trợ update(index, val) và trả về tổng nums[left..right] bằng sumRange(left, right).",
      en: "Design NumArray to support update(index, val) and return nums[left..right] with sumRange(left, right).",
    },
    defaultInput: [1, 3, 5],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [{
      key: "operations",
      type: "string",
      label: { vi: "Thao tác (ngăn bằng |)", en: "Operations (separated by |)" },
      default: "sumRange 0 2 | update 1 2 | sumRange 0 2",
    }],
    approach: [
      { vi: "Fenwick Tree lưu các tổng đoạn theo lowbit; bit[i] quản lý nums[i-lowbit(i)..i-1].", en: "A Fenwick Tree stores lowbit ranges; bit[i] covers nums[i-lowbit(i)..i-1]." },
      { vi: "update tính delta rồi đi lên bằng i += lowbit(i), cộng delta vào mọi node cha.", en: "update computes delta, then climbs with i += lowbit(i), adding delta to each parent." },
      { vi: "Prefix sum đi xuống bằng i -= lowbit(i); sumRange = prefix(right+1) - prefix(left).", en: "A prefix sum descends with i -= lowbit(i); sumRange = prefix(right+1) - prefix(left)." },
    ],
    complexity: {
      time: "O(n log n) build, O(log n) update/query",
      space: "O(n)",
      note: {
        vi: "Mỗi đường update hoặc prefix chỉ đi qua tối đa O(log n) Fenwick node.",
        en: "Each update or prefix path visits at most O(log n) Fenwick nodes.",
      },
    },
    code: [
      "class NumArray:",
      "    def __init__(self, nums: List[int]):",
      "        self.nums = nums[:]",
      "        self.bit = [0] * (len(nums) + 1)",
      "        for i, value in enumerate(nums):",
      "            self._add(i + 1, value)",
      "",
      "    def _add(self, index: int, delta: int) -> None:",
      "        while index < len(self.bit):",
      "            self.bit[index] += delta",
      "            index += index & -index",
      "",
      "    def update(self, index: int, val: int) -> None:",
      "        delta = val - self.nums[index]",
      "        self.nums[index] = val",
      "        self._add(index + 1, delta)",
      "",
      "    def _prefix(self, index: int) -> int:",
      "        total = 0",
      "        while index > 0:",
      "            total += self.bit[index]",
      "            index -= index & -index",
      "        return total",
      "",
      "    def sumRange(self, left: int, right: int) -> int:",
      "        return self._prefix(right + 1) - self._prefix(left)",
    ],
    builder: buildSteps307,
  },
  370: {
    id: 370,
    difficulty: "medium",
    premium: true,
    slug: "range-addition",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Range Addition", en: "Range Addition" },
    titleVi: { vi: "Cong doan bang mang hieu", en: "Range updates with a difference array" },
    statement: {
      vi: "Cho length va danh sach updates [start, end, inc]. Bat dau voi mang toan 0, moi update cong inc vao moi phan tu tu start den end. Tra ve mang sau cung.",
      en: "Given length and updates [start, end, inc], start with an all-zero array and add inc to every element from start to end for each update. Return the final array.",
    },
    defaultInput: [5],
    inputKind: "positive",
    singleInput: true,
    maxInput: 20,
    inputLabel: { vi: "length", en: "length" },
    extraParams: [
      {
        key: "updates",
        type: "string",
        label: { vi: "updates (JSON hoac start,end,inc;...)", en: "updates (JSON or start,end,inc;...)" },
        default: "[[1,3,2],[2,4,3],[0,2,-2]]",
      },
    ],
    approach: [
      { vi: "Dung difference array diff co them mot o phu o cuoi.", en: "Use a difference array diff with one extra sentinel cell at the end." },
      { vi: "Voi update [start,end,inc]: diff[start] += inc va diff[end+1] -= inc.", en: "For update [start,end,inc]: diff[start] += inc and diff[end+1] -= inc." },
      { vi: "Lay prefix sum cua diff de tao mang ket qua.", en: "Take the prefix sum of diff to build the final array." },
    ],
    complexity: {
      time: "O(n + k)",
      space: "O(n)",
      note: {
        vi: "k la so updates. Moi update O(1), sau do mot lan prefix sum O(n).",
        en: "k is the number of updates. Each update is O(1), then one O(n) prefix pass.",
      },
    },
    code: [
      "class Solution:",
      "    def getModifiedArray(self, length: int, updates: List[List[int]]) -> List[int]:",
      "        diff = [0] * (length + 1)",
      "        for start, end, inc in updates:",
      "            diff[start] += inc",
      "            diff[end + 1] -= inc",
      "        result = []",
      "        running = 0",
      "        for i in range(length):",
      "            running += diff[i]",
      "            result.append(running)",
      "        return result",
    ],
    builder: buildSteps370,
  },
  1590: {
    id: 1590,
    difficulty: "medium",
    slug: "make-sum-divisible-by-p",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Make Sum Divisible by P", en: "Make Sum Divisible by P" },
    titleVi: { vi: "Xoa day con ngan nhat de tong chia het cho p", en: "Remove shortest subarray to make sum divisible" },
    statement: {
      vi: "Cho mang so nguyen duong nums va so nguyen p. Xoa mot day con lien tiep ngan nhat sao cho tong phan con lai chia het cho p. Khong duoc xoa ca mang.",
      en: "Given positive integers nums and p, remove the shortest contiguous subarray so the remaining sum is divisible by p. Removing the whole array is not allowed.",
    },
    defaultInput: [3, 1, 4, 2],
    inputKind: "positive",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "p", type: "number", label: { vi: "p", en: "p" }, default: 6 },
    ],
    approach: [
      { vi: "Tinh need = sum(nums) % p. Can xoa subarray co tong du need.", en: "Compute need = sum(nums) % p. We need to remove a subarray whose sum has remainder need." },
      { vi: "Duyet prefix modulo p. Voi remainder hien tai r, can tim target = (r - need + p) % p.", en: "Scan prefix modulo p. For current remainder r, look for target = (r - need + p) % p." },
      { vi: "Luu index moi nhat cua moi remainder de candidate remove ngan nhat.", en: "Store the latest index for each remainder to get the shortest removable candidate." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(min(n, p))",
      note: {
        vi: "Mot lan duyet; hash map luu remainder prefix gan nhat.",
        en: "One pass; the hash map stores the latest prefix index for each remainder.",
      },
    },
    code: [
      "class Solution:",
      "    def minSubarray(self, nums: List[int], p: int) -> int:",
      "        need = sum(nums) % p",
      "        if need == 0:",
      "            return 0",
      "        last_seen = {0: -1}",
      "        prefix = 0",
      "        ans = len(nums)",
      "        for i, num in enumerate(nums):",
      "            prefix = (prefix + num) % p",
      "            target = (prefix - need + p) % p",
      "            if target in last_seen:",
      "                ans = min(ans, i - last_seen[target])",
      "            last_seen[prefix] = i",
      "        return ans if ans < len(nums) else -1",
    ],
    builder: buildSteps1590,
  },
  734: {
    id: 734,
    difficulty: "easy",
    premium: true,
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
      "from typing import List",
      "",
      "class Solution:",
      "    def areSentencesSimilar(self, sentence1: List[str], sentence2: List[str], similarPairs: List[List[str]]) -> bool:",
      "        if len(sentence1) != len(sentence2):",
      "            return False",
      "        pair_set = set()",
      "        for word1, word2 in similarPairs:",
      "            pair_set.add((word1, word2))",
      "            pair_set.add((word2, word1))",
      "        for i in range(len(sentence1)):",
      "            if sentence1[i] == sentence2[i]:",
      "                continue",
      "            if (sentence1[i], sentence2[i]) not in pair_set:",
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
