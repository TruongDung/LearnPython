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
  const stoneChars = stones.split("");
  const makeJewelsView = (phase, currentIndex, isJewel, count) => ({
    jewels,
    stones,
    jewelTypes: [...jewelSet],
    currentIndex: Number.isInteger(currentIndex) ? currentIndex : null,
    currentStone: Number.isInteger(currentIndex) ? stoneChars[currentIndex] : null,
    isJewel: typeof isJewel === "boolean" ? isJewel : null,
    count,
    phase,
    stoneStates: stoneChars.map((stone, index) => {
      if (index > currentIndex || currentIndex === null) return phase === "done" ? (jewelSet.has(stone) ? "matched" : "skipped") : "waiting";
      if (index === currentIndex) return isJewel ? "active-match" : "active-skip";
      return jewelSet.has(stone) ? "matched" : "skipped";
    }),
  });

  steps.push({
    title: { vi: "Tạo jewel_set từ các loại đá quý", en: "Create jewel_set from jewel types" },
    arr: stoneChars.map(() => 0),
    sub: stoneChars,
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "jewels", value: jewels },
      { name: "stones", value: stones },
      { name: "jewel_set", value: `{${jewels.split("").join(", ")}}` },
    ],
    note: {
      vi: `jewel_set = {${jewels.split("").join(", ")}}. Set chỉ lưu LOẠI đá quý; sau đó duyệt từng viên trong stones để đếm.`,
      en: `jewel_set = {${jewels.split("").join(", ")}}. The set stores JEWEL TYPES; then scan every stone to count matches.`,
    },
    jewelsStonesView: makeJewelsView("init", null, null, 0),
  });

  let count = 0;
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
      codeLines: [5, 6, 7],
      vars: [
        { name: "i", value: i },
        { name: "stone", value: s },
        { name: "isJewel", value: isJewel },
        { name: "count", value: count },
      ],
      note: {
        vi: isJewel
          ? `Viên stones[${i}] = '${s}' thuộc jewel_set → cộng 1, count = ${count}.`
          : `Viên stones[${i}] = '${s}' không thuộc jewel_set → không cộng, count vẫn là ${count}.`,
        en: isJewel
          ? `stones[${i}] = '${s}' is in jewel_set → add 1, count = ${count}.`
          : `stones[${i}] = '${s}' is not in jewel_set → do not add, count stays ${count}.`,
      },
      jewelsStonesView: makeJewelsView(isJewel ? "match" : "skip", i, isJewel, count),
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${count}`, en: `Result: ${count}` },
    arr: stoneChars.map((c) => (jewelSet.has(c) ? 1 : 0)),
    sub: stoneChars,
    highlight: [],
    mark: stoneChars.map((c, i) => (jewelSet.has(c) ? i : -1)).filter((i) => i >= 0),
    final: true,
    codeLines: [8],
    vars: [{ name: "answer", value: count }],
    note: {
      vi: `Có ${count} viên đá là đá quý trong "${stones}".`,
      en: `There are ${count} jewels among the stones in "${stones}".`,
    },
    jewelsStonesView: makeJewelsView("done", null, null, count),
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

function buildSteps560(nums, params) {
  const parsedK = Number.parseInt(params && params.k, 10);
  const k = Number.isInteger(parsedK) ? parsedK : 0;
  const count = new Map([[0, 1]]);
  const prefixPositions = new Map([[0, [-1]]]);
  const prefixSums = new Array(nums.length).fill(null);
  const steps = [];
  let prefixSum = 0;
  let answer = 0;

  const mapEntries = () => [...count.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([sum, frequency]) => ({
      sum,
      frequency,
      positions: [...(prefixPositions.get(sum) || [])],
    }));
  const mapString = () => `{${mapEntries().map((entry) => `${entry.sum}: ${entry.frequency}`).join(", ")}}`;
  const positionsString = (positions) => positions.length ? `[${positions.join(", ")}]` : "none";
  const rangesString = (positions, end) => positions.length
    ? positions.map((position) => `[${position + 1}..${end}]`).join(", ")
    : "none";
  const makeView = ({ current = -1, needed = null, matchingPositions = [], newSubarrays = [], status = [] } = {}) => ({
    nums: [...nums],
    prefixSums: [...prefixSums],
    current,
    k,
    needed,
    matchingPositions: [...matchingPositions],
    newSubarrays: newSubarrays.map((range) => ({ ...range })),
    entries: mapEntries(),
    status,
  });
  const loopVars = (i, extras = []) => [
    { name: "i", value: i },
    { name: "num", value: nums[i] },
    { name: "prefix_sum", value: prefixSum },
    { name: "needed", value: prefixSum - k },
    { name: "res", value: answer },
    { name: "count", value: mapString() },
    ...extras,
  ];

  steps.push({
    title: { vi: "Khởi tạo count = {0: 1}", en: "Initialize count = {0: 1}" },
    codeLines: [3, 4],
    prefixSumCountView: makeView({
      status: [
        { label: "k", value: k },
        { label: "count[0]", value: 1 },
        { label: "prefix position", value: -1 },
      ],
    }),
    vars: [
      { name: "k", value: k },
      { name: "count", value: mapString() },
      { name: "prefix_sum", value: prefixSum },
      { name: "res", value: answer },
    ],
    note: {
      vi: "count[0] = 1 nghĩa là trước khi bắt đầu mảng, ta đã gặp prefix sum 0 một lần tại vị trí giả P[-1]. Ví dụ P[i] = k thì needed = 0 và đoạn bắt đầu từ index 0 được tính.",
      en: "count[0] = 1 means we have already seen prefix sum 0 once at the virtual position P[-1]. For example, if P[i] = k then needed = 0 and the range starts at index 0.",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo prefix_sum = 0 và res = 0", en: "Initialize prefix_sum = 0 and res = 0" },
    codeLines: [5, 6],
    prefixSumCountView: makeView({
      status: [
        { label: "prefix_sum", value: prefixSum },
        { label: "res", value: answer },
        { label: "count", value: mapString() },
      ],
    }),
    vars: [
      { name: "k", value: k },
      { name: "prefix_sum", value: prefixSum },
      { name: "res", value: answer },
      { name: "count", value: mapString() },
    ],
    note: {
      vi: "Chưa đọc phần tử nào: tổng tiền tố và số đoạn con hợp lệ đều bằng 0.",
      en: "No number has been processed yet, so both the prefix sum and the valid-subarray count are 0.",
    },
  });

  for (let i = 0; i < nums.length; i += 1) {
    steps.push({
      title: { vi: `Vòng lặp: num = nums[${i}] = ${nums[i]}`, en: `Loop: num = nums[${i}] = ${nums[i]}` },
      codeLines: [7],
      prefixSumCountView: makeView({
        current: i,
        status: [
          { label: "i", value: i },
          { label: "num", value: nums[i] },
          { label: "prefix_sum before", value: prefixSum },
        ],
      }),
      vars: loopVars(i),
      note: {
        vi: `Bắt đầu xử lý nums[${i}] = ${nums[i]}. prefix_sum hiện tại vẫn là ${prefixSum}.`,
        en: `Start processing nums[${i}] = ${nums[i]}. The current prefix_sum is still ${prefixSum}.`,
      },
    });

    const beforePrefix = prefixSum;
    prefixSum += nums[i];
    prefixSums[i] = prefixSum;
    steps.push({
      title: { vi: `prefix_sum = ${beforePrefix} + (${nums[i]}) = ${prefixSum}`, en: `prefix_sum = ${beforePrefix} + (${nums[i]}) = ${prefixSum}` },
      codeLines: [8],
      prefixSumCountView: makeView({
        current: i,
        status: [
          { label: "previous prefix", value: beforePrefix },
          { label: "num", value: nums[i] },
          { label: "prefix_sum", value: prefixSum },
        ],
      }),
      vars: loopVars(i),
      note: {
        vi: `P[${i}] = P[${i - 1}] + nums[${i}] = ${beforePrefix} + (${nums[i]}) = ${prefixSum}. Đây là tổng toàn bộ nums[0..${i}], chưa phải tổng của một đoạn con bất kỳ.` ,
        en: `P[${i}] = P[${i - 1}] + nums[${i}] = ${beforePrefix} + (${nums[i]}) = ${prefixSum}. This is the full prefix sum nums[0..${i}], not yet the sum of an arbitrary subarray.`,
      },
    });

    const needed = prefixSum - k;
    const matchingPositions = [...(prefixPositions.get(needed) || [])];
    const contribution = count.get(needed) || 0;
    const newSubarrays = matchingPositions.map((position) => ({
      start: position + 1,
      end: i,
      previousPosition: position,
    }));
    steps.push({
      title: { vi: `needed = ${prefixSum} - (${k}) = ${needed}`, en: `needed = ${prefixSum} - (${k}) = ${needed}` },
      codeLines: [9],
      prefixSumCountView: makeView({
        current: i,
        needed,
        matchingPositions,
        newSubarrays,
        status: [
          { label: "prefix_sum", value: prefixSum },
          { label: "k", value: k },
          { label: "needed", value: needed },
          { label: "count[needed]", value: contribution },
        ],
      }),
      vars: loopVars(i, [
        { name: "needed", value: needed },
        { name: "needed in count", value: count.has(needed) },
        { name: "matching prefix positions", value: positionsString(matchingPositions) },
      ]),
      note: {
        vi: matchingPositions.length
          ? `P[${i}] = ${prefixSum} nên cần P[j] = ${prefixSum} - (${k}) = ${needed}. Đã thấy P[j] = ${needed} tại ${positionsString(matchingPositions)}; mỗi vị trí tạo đoạn nums[j+1..${i}] có tổng ${prefixSum} - ${needed} = ${k}.`
          : `P[${i}] = ${prefixSum} nên cần P[j] = ${prefixSum} - (${k}) = ${needed}, nhưng count chưa có tổng này. Vì vậy chưa có đoạn con kết thúc tại index ${i} có tổng ${k}.`,
        en: matchingPositions.length
          ? `P[${i}] = ${prefixSum}, so we need P[j] = ${prefixSum} - (${k}) = ${needed}. P[j] = ${needed} appears at ${positionsString(matchingPositions)}; each position creates nums[j+1..${i}] with sum ${prefixSum} - ${needed} = ${k}.`
          : `P[${i}] = ${prefixSum}, so we need P[j] = ${prefixSum} - (${k}) = ${needed}, but count has not seen this sum. No subarray ending at index ${i} sums to ${k}.`,
      },
    });

    const beforeAnswer = answer;
    answer += contribution;
    steps.push({
      title: { vi: `res = ${beforeAnswer} + ${contribution} = ${answer}`, en: `res = ${beforeAnswer} + ${contribution} = ${answer}` },
      codeLines: [10],
      prefixSumCountView: makeView({
        current: i,
        needed,
        matchingPositions,
        newSubarrays,
        status: [
          { label: "matching prefixes", value: positionsString(matchingPositions) },
          { label: "new subarrays", value: rangesString(matchingPositions, i) },
          { label: "added", value: contribution },
          { label: "res", value: answer },
        ],
      }),
      vars: loopVars(i, [
        { name: `count[${needed}]`, value: contribution },
        { name: "new subarrays", value: rangesString(matchingPositions, i) },
      ]),
      note: {
        vi: contribution
          ? `count[${needed}] = ${contribution}, nên có ${contribution} prefix phù hợp. Cộng ${contribution} vào res: ${beforeAnswer} + ${contribution} = ${answer}. Các đoạn mới là ${rangesString(matchingPositions, i)}.`
          : `count[${needed}] = 0 nên không có prefix phù hợp. Không có đoạn mới được cộng, res vẫn bằng ${answer}.`,
        en: contribution
          ? `count[${needed}] = ${contribution}, so ${contribution} prefixes match. Add ${contribution} to res: ${beforeAnswer} + ${contribution} = ${answer}. New ranges: ${rangesString(matchingPositions, i)}.`
          : `count[${needed}] = 0, so no earlier prefix matches. No new range is added and res remains ${answer}.`,
      },
    });

    const oldFrequency = count.get(prefixSum) || 0;
    count.set(prefixSum, oldFrequency + 1);
    if (!prefixPositions.has(prefixSum)) prefixPositions.set(prefixSum, []);
    prefixPositions.get(prefixSum).push(i);
    steps.push({
      title: { vi: `count[${prefixSum}] = ${oldFrequency + 1}`, en: `count[${prefixSum}] = ${oldFrequency + 1}` },
      codeLines: [11],
      prefixSumCountView: makeView({
        current: i,
        needed,
        matchingPositions,
        newSubarrays,
        status: [
          { label: "stored prefix", value: `P[${i}] = ${prefixSum}` },
          { label: "old frequency", value: oldFrequency },
          { label: "new frequency", value: oldFrequency + 1 },
          { label: "res", value: answer },
        ],
      }),
      vars: loopVars(i, [
        { name: `count[${prefixSum}]`, value: oldFrequency + 1 },
        { name: "prefix positions", value: positionsString(prefixPositions.get(prefixSum)) },
      ]),
      note: {
        vi: `Đã kiểm tra xong index ${i}, bây giờ mới lưu P[${i}] = ${prefixSum} vào count. Lưu sau bước kiểm tra rất quan trọng: nếu lưu trước, prefix hiện tại có thể tự ghép với chính nó thành đoạn rỗng.`,
        en: `Index ${i} has been checked; now store P[${i}] = ${prefixSum} in count. Storing it after the check is important: storing it first could pair the prefix with itself and create an empty range.`,
      },
    });
  }

  steps.push({
    title: { vi: `Trả về ${answer}`, en: `Return ${answer}` },
    codeLines: [12],
    prefixSumCountView: makeView({
      status: [
        { label: "processed", value: nums.length },
        { label: "count", value: mapString() },
        { label: "answer", value: answer },
      ],
    }),
    vars: [
      { name: "prefix_sum", value: prefixSum },
      { name: "res", value: answer },
      { name: "count", value: mapString() },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Có tổng cộng ${answer} đoạn con liên tiếp có tổng đúng bằng k = ${k}.`,
      en: `There are ${answer} contiguous subarrays whose sum is exactly k = ${k}.`,
    },
    final: true,
  });

  return { steps, answer };
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
    kind: "range-sum-immutable",
    nums: [...nums],
    prefix: [...prefix],
    current,
    prefixIndex,
    query,
    status,
  });

  steps.push({
    title: { vi: "Khởi tạo prefix[0] = 0", en: "Initialize prefix[0] = 0" },
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
      vi: "prefix có thêm một ô đầu. prefix[i] là tổng nums[0..i-1].",
      en: "prefix has one extra leading cell. prefix[i] is the sum of nums[0..i-1].",
    },
  });

  for (let i = 0; i < n; i += 1) {
    const before = prefix[i];
    steps.push({
      title: { vi: `Đọc nums[${i}] = ${nums[i]}`, en: `Read nums[${i}] = ${nums[i]}` },
      codeLines: [4],
      prefix1DView: makeView({
        current: i,
        prefixIndex: i,
        status: [
          { label: "i", value: i },
          { label: "num", value: nums[i] },
          { label: `prefix[${i}]`, value: before },
        ],
      }),
      vars: [
        { name: "num", value: nums[i] },
        { name: "previous prefix", value: before },
      ],
      note: {
        vi: `Lấy nums[${i}] = ${nums[i]}. Prefix hiện tại vẫn là ${before}; chưa append giá trị mới.`,
        en: `Take nums[${i}] = ${nums[i]}. The current prefix is still ${before}; the new value has not been appended yet.`,
      },
    });

    prefix[i + 1] = before + nums[i];
    steps.push({
      title: { vi: `prefix[${i + 1}] = ${prefix[i + 1]}`, en: `prefix[${i + 1}] = ${prefix[i + 1]}` },
      codeLines: [5],
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
        vi: `Lấy tổng trước đó ${before} cộng nums[${i}] = ${nums[i]}.`,
        en: `Take the previous sum ${before} plus nums[${i}] = ${nums[i]}.`,
      },
    });
  }

  const answer = prefix[right + 1] - prefix[left];
  const queryView = (phase, extra = {}) => ({
    left,
    right,
    phase,
    rightPrefixIndex: right + 1,
    leftPrefixIndex: left,
    included: nums.slice(left, right + 1),
    excludedLeft: nums.slice(0, left),
    ...extra,
  });

  steps.push({
    title: { vi: `Gọi sumRange(${left}, ${right})`, en: `Call sumRange(${left}, ${right})` },
    codeLines: [7],
    prefix1DView: makeView({
      query: queryView("select-range"),
      status: [
        { label: "left", value: left },
        { label: "right", value: right },
        { label: "target", value: `nums[${left}..${right}]` },
      ],
    }),
    vars: [{ name: "left", value: left }, { name: "right", value: right }],
    note: {
      vi: `Cần tổng đoạn đóng nums[${left}..${right}]. Prefix dùng đoạn nửa mở, nên mốc phải là right + 1 = ${right + 1}.`,
      en: `We need the closed range nums[${left}..${right}]. Prefix sums use half-open ranges, so the right boundary is right + 1 = ${right + 1}.`,
    },
  });

  steps.push({
    title: { vi: `right_sum = prefix[${right + 1}]`, en: `right_sum = prefix[${right + 1}]` },
    codeLines: [8],
    prefix1DView: makeView({
      query: queryView("right-prefix", { rightPrefixValue: prefix[right + 1] }),
      prefixIndex: right + 1,
      status: [
        { label: `prefix[${right + 1}]`, value: prefix[right + 1] },
        { label: "contains", value: `nums[0..${right}]` },
      ],
    }),
    vars: [{ name: "right_sum", value: prefix[right + 1] }],
    note: {
      vi: `prefix[${right + 1}] = ${prefix[right + 1]} chứa tổng từ nums[0] đến nums[${right}], gồm cả phần cần lấy và phần trước left.`,
      en: `prefix[${right + 1}] = ${prefix[right + 1]} contains nums[0] through nums[${right}], including both the target range and the part before left.`,
    },
  });

  steps.push({
    title: { vi: `left_sum = prefix[${left}]`, en: `left_sum = prefix[${left}]` },
    codeLines: [9],
    prefix1DView: makeView({
      query: queryView("left-prefix", {
        rightPrefixValue: prefix[right + 1],
        leftPrefixValue: prefix[left],
      }),
      prefixIndex: left,
      status: [
        { label: `prefix[${right + 1}]`, value: prefix[right + 1] },
        { label: `prefix[${left}]`, value: prefix[left] },
        { label: "subtract", value: `nums[0..${left - 1}]` },
      ],
    }),
    vars: [{ name: "right_sum", value: prefix[right + 1] }, { name: "left_sum", value: prefix[left] }],
    note: {
      vi: `prefix[${left}] = ${prefix[left]} chính là tổng phần đứng trước left. Trừ phần này sẽ chỉ còn nums[${left}..${right}].`,
      en: `prefix[${left}] = ${prefix[left]} is exactly the sum before left. Subtracting it leaves only nums[${left}..${right}].`,
    },
  });

  steps.push({
    title: { vi: `${prefix[right + 1]} - ${prefix[left]} = ${answer}`, en: `${prefix[right + 1]} - ${prefix[left]} = ${answer}` },
    codeLines: [10],
    prefix1DView: makeView({
      query: queryView("subtract", {
        rightPrefixValue: prefix[right + 1],
        leftPrefixValue: prefix[left],
        answer,
      }),
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
      vi: `Tổng nums[${left}..${right}] = prefix[${right + 1}] - prefix[${left}].`,
      en: `Sum nums[${left}..${right}] = prefix[${right + 1}] - prefix[${left}].`,
    },
    final: true,
  });

  return { steps, answer };
}

function buildSteps2080IndexMap(nums, params) {
  const n = nums.length;
  const leftRaw = Number.parseInt(params && params.left, 10);
  const rightRaw = Number.parseInt(params && params.right, 10);
  const valueRaw = Number.parseInt(params && params.value, 10);
  const left = Math.max(0, Math.min(n - 1, Number.isInteger(leftRaw) ? leftRaw : 0));
  const right = Math.max(left, Math.min(n - 1, Number.isInteger(rightRaw) ? rightRaw : n - 1));
  const value = Number.isInteger(valueRaw) ? valueRaw : nums[0];
  const indexMap = new Map();
  const steps = [];
  const queryPositions = [];
  let currentValue = null;

  const sortedEntries = () => Array.from(indexMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([key, indices]) => ({ value: key, indices: [...indices] }));

  const makeView = ({
    phase = "build",
    current = -1,
    activeValue = currentValue,
    targetValue = value,
    lo = null,
    hi = null,
    mid = null,
    leftPos = null,
    rightPos = null,
    answer = null,
    status = [],
  } = {}) => ({
    nums: [...nums],
    entries: sortedEntries(),
    query: { left, right, value: targetValue },
    queryPositions: [...queryPositions],
    phase,
    current,
    activeValue,
    lo,
    hi,
    mid,
    leftPos,
    rightPos,
    answer,
    status,
  });

  steps.push({
    title: { vi: "Khởi tạo bảng value → indices", en: "Initialize value → indices table" },
    codeLines: [6],
    rangeFrequencyView: makeView({
      phase: "build",
      status: [
        { label: "left", value: left },
        { label: "right", value: right },
        { label: "value", value },
      ],
    }),
    vars: [
      { name: "pos", value: "{}" },
      { name: "query", value: `(${left}, ${right}, ${value})` },
    ],
    note: {
      vi: "Constructor sẽ lưu mọi vị trí xuất hiện của từng giá trị. Vì duyệt từ trái sang phải, mỗi list index tự động tăng dần.",
      en: "The constructor stores all occurrence positions for each value. Since we scan left to right, each index list is naturally sorted.",
    },
  });

  for (let i = 0; i < n; i += 1) {
    const num = nums[i];
    currentValue = num;
    steps.push({
      title: { vi: `Đọc arr[${i}] = ${num}`, en: `Read arr[${i}] = ${num}` },
      codeLines: [7],
      rangeFrequencyView: makeView({
        phase: "build",
        current: i,
        activeValue: num,
        status: [
          { label: "i", value: i },
          { label: "arr[i]", value: num },
          { label: "pos[num] before", value: `[${(indexMap.get(num) || []).join(", ")}]` },
        ],
      }),
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
      ],
      note: {
        vi: `Chuẩn bị thêm index ${i} vào list của value ${num}.`,
        en: `Prepare to append index ${i} to the list for value ${num}.`,
      },
    });

    if (!indexMap.has(num)) indexMap.set(num, []);
    indexMap.get(num).push(i);
    steps.push({
      title: { vi: `pos[${num}].append(${i})`, en: `pos[${num}].append(${i})` },
      codeLines: [8],
      rangeFrequencyView: makeView({
        phase: "build",
        current: i,
        activeValue: num,
        status: [
          { label: "value", value: num },
          { label: "indices", value: `[${indexMap.get(num).join(", ")}]` },
        ],
      }),
      vars: [
        { name: `pos[${num}]`, value: `[${indexMap.get(num).join(", ")}]` },
      ],
      note: {
        vi: `Value ${num} xuất hiện ở index ${i}, nên lưu lại index này.`,
        en: `Value ${num} appears at index ${i}, so store this index.`,
      },
    });
  }

  const positions = indexMap.get(value) || [];
  for (const index of positions) {
    if (index >= left && index <= right) queryPositions.push(index);
  }

  steps.push({
    title: { vi: `Lấy list index của value ${value}`, en: `Get index list for value ${value}` },
    codeLines: [11],
    rangeFrequencyView: makeView({
      phase: "query",
      activeValue: value,
      status: [
        { label: "indices", value: `[${positions.join(", ")}]` },
        { label: "range", value: `[${left}, ${right}]` },
      ],
    }),
    vars: [
      { name: "arr", value: `[${positions.join(", ")}]` },
      { name: "left,right,value", value: `${left}, ${right}, ${value}` },
    ],
    note: {
      vi: `Chỉ cần xét list index của ${value}; các value khác không ảnh hưởng tới query này.`,
      en: `Only the index list for ${value} matters; other values do not affect this query.`,
    },
  });

  const traceBisect = (target, kind, line) => {
    let lo = 0;
    let hi = positions.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const goRight = kind === "left" ? positions[mid] < target : positions[mid] <= target;
      steps.push({
        title: {
          vi: `${kind === "left" ? "bisect_left" : "bisect_right"}: mid=${mid}`,
          en: `${kind === "left" ? "bisect_left" : "bisect_right"}: mid=${mid}`,
        },
        codeLines: [line],
        rangeFrequencyView: makeView({
          phase: kind,
          activeValue: value,
          lo,
          hi,
          mid,
          status: [
            { label: "target", value: target },
            { label: "indices[mid]", value: positions[mid] ?? "-" },
            { label: "move", value: goRight ? "lo = mid + 1" : "hi = mid" },
          ],
        }),
        vars: [
          { name: "lo", value: lo },
          { name: "hi", value: hi },
          { name: "mid", value: mid },
          { name: "target", value: target },
        ],
        note: {
          vi: goRight
            ? `indices[${mid}] = ${positions[mid]} vẫn ${kind === "left" ? "< left" : "<= right"}, nên bỏ nửa trái.`
            : `indices[${mid}] = ${positions[mid]} đã đủ lớn, giữ nửa trái.`,
          en: goRight
            ? `indices[${mid}] = ${positions[mid]} is still ${kind === "left" ? "< left" : "<= right"}, so discard the left half.`
            : `indices[${mid}] = ${positions[mid]} is large enough, so keep the left half.`,
        },
      });
      if (goRight) lo = mid + 1;
      else hi = mid;
    }
    steps.push({
      title: {
        vi: `${kind === "left" ? "left_bound" : "right_bound"} = ${lo}`,
        en: `${kind === "left" ? "left_bound" : "right_bound"} = ${lo}`,
      },
      codeLines: [line],
      rangeFrequencyView: makeView({
        phase: kind,
        activeValue: value,
        leftPos: kind === "left" ? lo : null,
        rightPos: kind === "right" ? lo : null,
        status: [
          { label: kind === "left" ? "bisect_left" : "bisect_right", value: lo },
        ],
      }),
      vars: [{ name: kind === "left" ? "l" : "r", value: lo }],
      note: {
        vi: `${kind === "left" ? "Vị trí đầu tiên có index >= left" : "Vị trí đầu tiên có index > right"} là ${lo}.`,
        en: `${kind === "left" ? "The first position with index >= left" : "The first position with index > right"} is ${lo}.`,
      },
    });
    return lo;
  };

  const leftPos = traceBisect(left, "left", 12);
  const rightPos = traceBisect(right, "right", 13);
  const answer = rightPos - leftPos;
  steps.push({
    title: { vi: `frequency = ${rightPos} - ${leftPos} = ${answer}`, en: `frequency = ${rightPos} - ${leftPos} = ${answer}` },
    codeLines: [14],
    rangeFrequencyView: makeView({
      phase: "answer",
      activeValue: value,
      leftPos,
      rightPos,
      answer,
      status: [
        { label: "left_bound", value: leftPos },
        { label: "right_bound", value: rightPos },
        { label: "answer", value: answer },
      ],
    }),
    vars: [
      { name: "left_bound", value: leftPos },
      { name: "right_bound", value: rightPos },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Có ${answer} index của value ${value} nằm trong đoạn [${left}, ${right}].`,
      en: `There are ${answer} indices of value ${value} inside [${left}, ${right}].`,
    },
    final: true,
  });

  return { steps, answer };
}

function buildSteps2080SegmentTree(nums, params) {
  const n = nums.length;
  const leftRaw = Number.parseInt(params && params.left, 10);
  const rightRaw = Number.parseInt(params && params.right, 10);
  const valueRaw = Number.parseInt(params && params.value, 10);
  const left = Math.max(0, Math.min(n - 1, Number.isInteger(leftRaw) ? leftRaw : 0));
  const right = Math.max(left, Math.min(n - 1, Number.isInteger(rightRaw) ? rightRaw : n - 1));
  const value = Number.isInteger(valueRaw) ? valueRaw : nums[0];
  let size = 1;
  while (size < n) size *= 2;

  const tree = Array.from({ length: 2 * size }, () => new Map());
  const coverage = Array.from({ length: 2 * size }, () => []);
  const steps = [];
  const selected = [];
  const queryIndices = Array.from({ length: right - left + 1 }, (_, offset) => left + offset);
  const formatMap = (map) => {
    if (!(map instanceof Map) || map.size === 0) return "∅";
    return `{${Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([key, count]) => `${key}:${count}`).join(", ")}}`;
  };
  const treeSnapshot = () => tree.slice(1).map(formatMap);
  const coverageSnapshot = () => coverage.slice(1).map((indices) => [...indices]);
  const snapshot = ({ title, note, codeLine, codeLines, mode = "build", activeTree = [], status = [], vars = [], final = false }) => {
    steps.push({
      title,
      note,
      codeLines: Array.isArray(codeLines) ? codeLines : [codeLine],
      codeBlock: 2,
      final,
      segmentTreeView: {
        nums: [...nums],
        tree: treeSnapshot(),
        coverage: coverageSnapshot(),
        activeNums: mode === "query" ? [...queryIndices] : [],
        activeTree: [...activeTree],
        selectedTree: [...selected],
        path: [...activeTree],
        mode,
        mapMode: true,
        status,
      },
      vars: [
        { name: "query", value: `(${left}, ${right}, ${value})` },
        ...vars,
      ],
    });
  };

  snapshot({
    title: { vi: `Tạo Segment Tree với ${size} lá`, en: `Create a Segment Tree with ${size} leaves` },
    note: {
      vi: "Mỗi node lưu một bảng {value: số lần xuất hiện} trong đoạn mà node quản lý. size là lũy thừa 2 nhỏ nhất không bé hơn n.",
      en: "Each node stores a {value: frequency} map for its covered range. size is the smallest power of two not less than n.",
    },
    codeLines: [5, 6, 7, 8],
    status: [{ label: "n", value: n }, { label: "size", value: size }, { label: "tree nodes", value: 2 * size - 1 }],
  });

  for (let index = 0; index < n; index += 1) {
    const node = size + index;
    tree[node].set(nums[index], 1);
    coverage[node] = [index];
    snapshot({
      title: { vi: `Lá tree[${node}] nhận arr[${index}] = ${nums[index]}`, en: `Leaf tree[${node}] receives arr[${index}] = ${nums[index]}` },
      note: {
        vi: `Lá chỉ quản lý index ${index}, nên frequency map là {${nums[index]}:1}.`,
        en: `This leaf covers only index ${index}, so its frequency map is {${nums[index]}:1}.`,
      },
      codeLines: [9, 10],
      activeTree: [node],
      status: [{ label: "leaf", value: node }, { label: "range", value: `[${index}, ${index}]` }, { label: "map", value: formatMap(tree[node]) }],
      vars: [{ name: `tree[${node}]`, value: formatMap(tree[node]) }],
    });
  }

  for (let node = size - 1; node >= 1; node -= 1) {
    const merged = new Map(tree[node * 2]);
    for (const [key, count] of tree[node * 2 + 1]) merged.set(key, (merged.get(key) || 0) + count);
    tree[node] = merged;
    coverage[node] = [...coverage[node * 2], ...coverage[node * 2 + 1]];
    if (coverage[node].length === 0) continue;
    snapshot({
      title: { vi: `Gộp hai con vào tree[${node}]`, en: `Merge both children into tree[${node}]` },
      note: {
        vi: `Cộng frequency theo từng value từ tree[${node * 2}] và tree[${node * 2 + 1}].`,
        en: `Add frequencies value by value from tree[${node * 2}] and tree[${node * 2 + 1}].`,
      },
      codeLines: [11, 12],
      activeTree: [node * 2, node * 2 + 1, node],
      status: [
        { label: `tree[${node * 2}]`, value: formatMap(tree[node * 2]) },
        { label: `tree[${node * 2 + 1}]`, value: formatMap(tree[node * 2 + 1]) },
        { label: `tree[${node}]`, value: formatMap(tree[node]) },
      ],
      vars: [{ name: `tree[${node}]`, value: formatMap(tree[node]) }],
    });
  }

  let queryLeft = left + size;
  let queryRight = right + size + 1;
  let answer = 0;
  snapshot({
    title: { vi: `Query [${left}, ${right}] cho value ${value}`, en: `Query [${left}, ${right}] for value ${value}` },
    note: {
      vi: `Đổi sang đoạn nửa mở ở tầng lá: [${queryLeft}, ${queryRight}). Mỗi node được chọn nằm hoàn toàn trong query.`,
      en: `Convert to a half-open leaf range [${queryLeft}, ${queryRight}). Every selected node lies completely inside the query.`,
    },
    codeLines: [13, 14, 15, 16],
    mode: "query",
    activeTree: [queryLeft, queryRight - 1],
    status: [{ label: "leaf range", value: `[${queryLeft}, ${queryRight})` }, { label: "target value", value }],
    vars: [{ name: "left", value: queryLeft }, { name: "right", value: queryRight }, { name: "answer", value: 0 }],
  });

  while (queryLeft < queryRight) {
    const pickedThisLevel = [];
    const pickedLeft = queryLeft % 2 === 1;
    const pickedRight = queryRight % 2 === 1;
    if (pickedLeft) {
      pickedThisLevel.push(queryLeft);
      selected.push(queryLeft);
      answer += tree[queryLeft].get(value) || 0;
      queryLeft += 1;
    }
    if (pickedRight) {
      queryRight -= 1;
      pickedThisLevel.push(queryRight);
      selected.push(queryRight);
      answer += tree[queryRight].get(value) || 0;
    }
    snapshot({
      title: {
        vi: pickedThisLevel.length ? `Chọn node ${pickedThisLevel.join(", ")}` : "Không chọn node ở level này",
        en: pickedThisLevel.length ? `Select node ${pickedThisLevel.join(", ")}` : "Select no node at this level",
      },
      note: {
        vi: pickedThisLevel.length
          ? `Các node này nằm trọn trong [${left}, ${right}]. Cộng count của value ${value}, tổng hiện tại = ${answer}.`
          : "Hai biên chưa tạo thành node nằm trọn trong query; đi lên node cha.",
        en: pickedThisLevel.length
          ? `These nodes lie fully inside [${left}, ${right}]. Add their count for value ${value}; running total = ${answer}.`
          : "Neither boundary forms a fully covered node yet; climb to the parents.",
      },
      codeLines: [
        17,
        ...(pickedLeft ? [18, 19, 20] : []),
        ...(pickedRight ? [21, 22, 23] : []),
        24,
        25,
      ],
      mode: "query",
      activeTree: pickedThisLevel,
      status: [
        ...pickedThisLevel.map((node) => ({ label: `tree[${node}][${value}]`, value: tree[node].get(value) || 0 })),
        { label: "answer", value: answer },
        { label: "next bounds", value: `[${Math.floor(queryLeft / 2)}, ${Math.floor(queryRight / 2)})` },
      ],
      vars: [{ name: "answer", value: answer }],
    });
    queryLeft = Math.floor(queryLeft / 2);
    queryRight = Math.floor(queryRight / 2);
  }

  snapshot({
    title: { vi: `Kết quả: ${answer} lần xuất hiện`, en: `Result: ${answer} occurrences` },
    note: {
      vi: `Tổng frequency của value ${value} trong các node phủ đúng đoạn [${left}, ${right}] là ${answer}.`,
      en: `The total frequency of value ${value} across the nodes that exactly cover [${left}, ${right}] is ${answer}.`,
    },
    codeLine: 26,
    mode: "query",
    activeTree: [...selected],
    status: [{ label: "selected nodes", value: selected.join(", ") || "∅" }, { label: "answer", value: answer }],
    vars: [{ name: "answer", value: answer }],
    final: true,
  });
  return { steps, answer };
}

function buildSteps2080(nums, params) {
  return Number(params && params.approach) === 2
    ? buildSteps2080SegmentTree(nums, params)
    : buildSteps2080IndexMap(nums, params);
}

function buildSteps2286(input, params) {
  const n = Math.max(1, Math.min(12, Number.isInteger(input[0]) ? input[0] : 3));
  const m = Math.max(1, Math.min(12, Number.isInteger(input[1]) ? input[1] : 5));
  const rawOperations = String((params && params.operations) || "").trim();
  const commands = rawOperations
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const tokens = part.split(/\s+/);
      const op = (tokens[0] || "").toLowerCase();
      const k = Number(tokens[1]);
      const maxRow = Number(tokens[2]);
      return { op, k, maxRow, tokenCount: tokens.length, raw: part };
    });
  const validCommands = commands.length > 0 && commands.every((command) => {
    const validName = command.op === "gather" || command.op === "scatter";
    return validName
      && command.tokenCount === 3
      && Number.isInteger(command.k)
      && command.k > 0
      && Number.isInteger(command.maxRow)
      && command.maxRow >= 0;
  });

  const used = new Array(n).fill(0);
  const steps = [];
  const outputs = [];

  const clampRow = (row) => Math.max(0, Math.min(n - 1, row));
  const remaining = () => used.map((taken) => m - taken);
  const totalRemaining = (maxRow) => remaining().slice(0, clampRow(maxRow) + 1).reduce((sum, value) => sum + value, 0);

  function buildTreeNodes(activeRows = [], activeRanges = []) {
    const rem = remaining();
    const nodes = [];
    let id = 1;
    function dfs(left, right, depth) {
      const nodeId = id++;
      if (left === right) {
        nodes.push({
          id: nodeId,
          left,
          right,
          depth,
          max: rem[left],
          sum: rem[left],
          active: activeRows.includes(left) || activeRanges.some(([a, b]) => left >= a && right <= b),
        });
        return { max: rem[left], sum: rem[left] };
      }
      const mid = Math.floor((left + right) / 2);
      const leftInfo = dfs(left, mid, depth + 1);
      const rightInfo = dfs(mid + 1, right, depth + 1);
      const max = Math.max(leftInfo.max, rightInfo.max);
      const sum = leftInfo.sum + rightInfo.sum;
      nodes.push({
        id: nodeId,
        left,
        right,
        depth,
        max,
        sum,
        active: activeRanges.some(([a, b]) => left >= a && right <= b)
          || activeRows.some((row) => row >= left && row <= right),
      });
      return { max, sum };
    }
    dfs(0, n - 1, 0);
    return nodes.sort((a, b) => (a.depth - b.depth) || (a.left - b.left));
  }

  function snapshot({
    title,
    codeLine,
    note,
    phase = "init",
    operationIndex = -1,
    operation = null,
    activeRows = [],
    activeRanges = [],
    allocation = [],
    result = null,
    status = [],
    vars = [],
    final = false,
  }) {
    const step = {
      title,
      codeLines: [codeLine],
      bookMyShowView: {
        n,
        m,
        used: [...used],
        remaining: remaining(),
        treeNodes: buildTreeNodes(activeRows, activeRanges),
        operations: commands.map((command) => command.raw),
        operationIndex,
        operation,
        phase,
        activeRows: [...activeRows],
        activeRanges: activeRanges.map((range) => [...range]),
        allocation: allocation.map((item) => ({ ...item })),
        outputs: [...outputs],
        result,
        status,
      },
      vars: [
        { name: "used", value: `[${used.join(", ")}]` },
        { name: "remaining", value: `[${remaining().join(", ")}]` },
        { name: "outputs", value: JSON.stringify(outputs) },
        ...vars,
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  if (!validCommands) {
    return {
      original: { n, m, operations: rawOperations },
      answer: null,
      steps: [{
        title: { vi: "Operations không hợp lệ", en: "Invalid operations" },
        codeLines: [1],
        bookMyShowView: {
          n,
          m,
          used: [...used],
          remaining: remaining(),
          treeNodes: buildTreeNodes(),
          operations: [],
          operationIndex: -1,
          operation: null,
          phase: "invalid",
          activeRows: [],
          activeRanges: [],
          allocation: [],
          outputs: [],
          result: null,
          status: [{ label: "format", value: "gather k maxRow | scatter k maxRow" }],
        },
        vars: [{ name: "operations", value: rawOperations || "-" }],
        note: {
          vi: "Dùng cú pháp: gather k maxRow | scatter k maxRow.",
          en: "Use: gather k maxRow | scatter k maxRow.",
        },
        final: true,
      }],
    };
  }

  snapshot({
    title: { vi: `Khởi tạo ${n} hàng, mỗi hàng ${m} ghế`, en: `Initialize ${n} rows with ${m} seats each` },
    codeLine: 7,
    phase: "init",
    status: [
      { label: "rows", value: n },
      { label: "seats/row", value: m },
      { label: "root max/sum", value: `${m}/${n * m}` },
    ],
    note: {
      vi: "Mỗi row bắt đầu còn m ghế. Segment tree root lưu max remaining của một hàng và tổng remaining toàn rạp.",
      en: "Each row starts with m remaining seats. The segment tree root stores max remaining in one row and total remaining seats.",
    },
  });

  function findGatherRow(k, maxRow) {
    const limit = clampRow(maxRow);
    for (let row = 0; row <= limit; row += 1) {
      if (m - used[row] >= k) return row;
    }
    return -1;
  }

  for (let index = 0; index < commands.length; index += 1) {
    const command = commands[index];
    const maxRow = clampRow(command.maxRow);
    const opLabel = `${command.op}(${command.k}, ${command.maxRow})`;
    snapshot({
      title: { vi: `Operation ${index + 1}: ${opLabel}`, en: `Operation ${index + 1}: ${opLabel}` },
      codeLine: command.op === "gather" ? 9 : 20,
      phase: command.op,
      operationIndex: index,
      operation: command,
      activeRanges: [[0, maxRow]],
      status: [
        { label: "k", value: command.k },
        { label: "maxRow", value: command.maxRow },
        { label: "search rows", value: `0..${maxRow}` },
      ],
      vars: [{ name: "operation", value: opLabel }],
      note: {
        vi: command.op === "gather"
          ? "gather cần tìm một hàng đầu tiên có đủ k ghế liên tiếp."
          : "scatter chỉ cần đủ tổng số ghế trống trong các hàng 0..maxRow.",
        en: command.op === "gather"
          ? "gather needs the first row with at least k consecutive free seats."
          : "scatter only needs enough total free seats across rows 0..maxRow.",
      },
    });

    if (command.op === "gather") {
      const row = findGatherRow(command.k, maxRow);
      snapshot({
        title: { vi: row >= 0 ? `Tìm thấy row ${row}` : "Không có row đủ chỗ", en: row >= 0 ? `Found row ${row}` : "No row has enough seats" },
        codeLine: 10,
        phase: "gather",
        operationIndex: index,
        operation: command,
        activeRows: row >= 0 ? [row] : [],
        activeRanges: [[0, maxRow]],
        result: row >= 0 ? [row, used[row]] : [],
        status: [
          { label: "needed", value: command.k },
          { label: "row", value: row >= 0 ? row : "none" },
          { label: "max remaining in range", value: Math.max(...remaining().slice(0, maxRow + 1)) },
        ],
        vars: [{ name: "row", value: row }],
        note: {
          vi: row >= 0
            ? `Row ${row} còn ${m - used[row]} ghế, đủ cho ${command.k} người ngồi liên tiếp.`
            : `Không hàng nào trong 0..${maxRow} còn đủ ${command.k} ghế liên tiếp.`,
          en: row >= 0
            ? `Row ${row} has ${m - used[row]} remaining seats, enough for ${command.k} consecutive people.`
            : `No row in 0..${maxRow} has ${command.k} consecutive remaining seats.`,
        },
      });

      if (row < 0) {
        outputs.push([]);
        snapshot({
          title: { vi: "gather trả []", en: "gather returns []" },
          codeLine: 12,
          phase: "gather",
          operationIndex: index,
          operation: command,
          activeRanges: [[0, maxRow]],
          result: [],
          status: [{ label: "return", value: "[]" }],
          vars: [{ name: "return", value: "[]" }],
          note: { vi: "Không cập nhật ghế vì gather thất bại.", en: "No seats are updated because gather failed." },
        });
        continue;
      }

      const startSeat = used[row];
      snapshot({
        title: { vi: `start = used[${row}] = ${startSeat}`, en: `start = used[${row}] = ${startSeat}` },
        codeLine: 13,
        phase: "gather",
        operationIndex: index,
        operation: command,
        activeRows: [row],
        allocation: [{ row, start: startSeat, count: command.k }],
        result: [row, startSeat],
        status: [
          { label: "row", value: row },
          { label: "start seat", value: startSeat },
        ],
        vars: [{ name: "start", value: startSeat }],
        note: {
          vi: `Ghế đầu tiên còn trống trong row ${row} là seat ${startSeat}.`,
          en: `The first free seat in row ${row} is seat ${startSeat}.`,
        },
      });

      used[row] += command.k;
      snapshot({
        title: { vi: `Book ${command.k} ghế ở row ${row}`, en: `Book ${command.k} seats in row ${row}` },
        codeLine: 14,
        phase: "gather",
        operationIndex: index,
        operation: command,
        activeRows: [row],
        allocation: [{ row, start: startSeat, count: command.k }],
        result: [row, startSeat],
        status: [
          { label: "used[row]", value: used[row] },
          { label: "remaining[row]", value: m - used[row] },
        ],
        vars: [{ name: `used[${row}]`, value: used[row] }],
        note: {
          vi: `Cập nhật row ${row}: đã dùng ${used[row]} ghế, còn ${m - used[row]}.`,
          en: `Update row ${row}: ${used[row]} seats used, ${m - used[row]} remaining.`,
        },
      });
      outputs.push([row, startSeat]);
      snapshot({
        title: { vi: `Return [${row}, ${startSeat}]`, en: `Return [${row}, ${startSeat}]` },
        codeLine: 18,
        phase: "gather",
        operationIndex: index,
        operation: command,
        activeRows: [row],
        allocation: [{ row, start: startSeat, count: command.k }],
        result: [row, startSeat],
        status: [{ label: "return", value: `[${row}, ${startSeat}]` }],
        vars: [{ name: "return", value: `[${row}, ${startSeat}]` }],
        note: {
          vi: "gather trả về row và seat bắt đầu.",
          en: "gather returns the row and starting seat.",
        },
      });
    } else {
      const available = totalRemaining(maxRow);
      snapshot({
        title: { vi: `Tổng ghế trống 0..${maxRow} = ${available}`, en: `Free seats in 0..${maxRow} = ${available}` },
        codeLine: 21,
        phase: "scatter",
        operationIndex: index,
        operation: command,
        activeRanges: [[0, maxRow]],
        result: available >= command.k,
        status: [
          { label: "needed", value: command.k },
          { label: "available", value: available },
        ],
        vars: [{ name: "available", value: available }],
        note: {
          vi: available >= command.k
            ? "Đủ tổng số ghế, scatter sẽ phân bổ từ hàng nhỏ đến lớn."
            : "Không đủ tổng số ghế trong phạm vi, scatter trả False.",
          en: available >= command.k
            ? "There are enough seats, so scatter will allocate from smaller rows to larger rows."
            : "Not enough seats in range, so scatter returns False.",
        },
      });

      if (available < command.k) {
        outputs.push(false);
        snapshot({
          title: { vi: "scatter trả False", en: "scatter returns False" },
          codeLine: 22,
          phase: "scatter",
          operationIndex: index,
          operation: command,
          activeRanges: [[0, maxRow]],
          result: false,
          status: [{ label: "return", value: "False" }],
          vars: [{ name: "return", value: "False" }],
          note: { vi: "Không có cập nhật ghế.", en: "No seats are updated." },
        });
        continue;
      }

      let remainingNeed = command.k;
      const allocation = [];
      for (let row = 0; row <= maxRow && remainingNeed > 0; row += 1) {
        snapshot({
          title: { vi: `Xét row ${row}`, en: `Inspect row ${row}` },
          codeLine: 24,
          phase: "scatter",
          operationIndex: index,
          operation: command,
          activeRows: [row],
          activeRanges: [[0, maxRow]],
          allocation,
          status: [
            { label: "need", value: remainingNeed },
            { label: `free row ${row}`, value: m - used[row] },
          ],
          vars: [{ name: "row", value: row }, { name: "k", value: remainingNeed }],
          note: {
            vi: `scatter lấy ghế trống từ row ${row} nếu còn cần.`,
            en: `scatter takes free seats from row ${row} if more seats are still needed.`,
          },
        });
        const take = Math.min(remainingNeed, m - used[row]);
        snapshot({
          title: { vi: `take = ${take}`, en: `take = ${take}` },
          codeLine: 25,
          phase: "scatter",
          operationIndex: index,
          operation: command,
          activeRows: [row],
          activeRanges: [[0, maxRow]],
          allocation: take > 0 ? [...allocation, { row, start: used[row], count: take }] : allocation,
          status: [
            { label: "need", value: remainingNeed },
            { label: "take", value: take },
          ],
          vars: [{ name: "take", value: take }],
          note: {
            vi: `Lấy min(k còn lại, ghế trống row ${row}) = ${take}.`,
            en: `Take min(remaining k, free seats in row ${row}) = ${take}.`,
          },
        });
        if (take === 0) continue;
        const startSeat = used[row];
        used[row] += take;
        remainingNeed -= take;
        allocation.push({ row, start: startSeat, count: take });
        snapshot({
          title: { vi: `Book ${take} ghế ở row ${row}`, en: `Book ${take} seats in row ${row}` },
          codeLine: 26,
          phase: "scatter",
          operationIndex: index,
          operation: command,
          activeRows: [row],
          activeRanges: [[0, maxRow]],
          allocation,
          status: [
            { label: "used[row]", value: used[row] },
            { label: "remaining need", value: remainingNeed },
          ],
          vars: [{ name: `used[${row}]`, value: used[row] }],
          note: {
            vi: `Cập nhật row ${row}, rồi giảm k còn lại.`,
            en: `Update row ${row}, then reduce the remaining k.`,
          },
        });
      }
      outputs.push(true);
      snapshot({
        title: { vi: "scatter trả True", en: "scatter returns True" },
        codeLine: 31,
        phase: "scatter",
        operationIndex: index,
        operation: command,
        activeRanges: [[0, maxRow]],
        allocation,
        result: true,
        status: [{ label: "return", value: "True" }],
        vars: [{ name: "return", value: "True" }],
        note: {
          vi: "Đã book đủ số ghế yêu cầu.",
          en: "All requested seats have been booked.",
        },
      });
    }
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { steps, answer: outputs };
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

  const validCommands = nums.length > 0 && commands.length > 0 && commands.every((command) => {
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
        segmentTreeView: {
          nums,
          tree: [],
          coverage: [],
          activeNums: [],
          activeTree: [],
          selectedTree: [],
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
  const tree = new Array(2 * n).fill(0);
  const coverage = Array.from({ length: 2 * n }, () => []);
  const outputs = [null];
  const steps = [];
  const detailedTrace = n <= 40 && commands.length <= 40;

  for (let i = 0; i < n; i += 1) {
    coverage[n + i] = [i];
  }
  for (let i = n - 1; i > 0; i -= 1) {
    coverage[i] = [...(coverage[2 * i] || []), ...(coverage[2 * i + 1] || [])].sort((a, b) => a - b);
  }

  const treeText = () => `[${tree.slice(1).join(", ")}]`;
  const numsText = () => `[${nums.join(", ")}]`;
  const outputsText = () => JSON.stringify(outputs);

  function snapshot({
    title,
    codeLine,
    note,
    mode = "idle",
    activeNums = [],
    activeTree = [],
    selectedTree = [],
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
      segmentTreeView: {
        nums: [...nums],
        tree: tree.slice(1),
        coverage: coverage.slice(1).map((items) => [...items]),
        activeNums: [...activeNums],
        activeTree: [...activeTree],
        selectedTree: [...selectedTree],
        path: [...path],
        mode,
        status,
      },
      vars: [
        { name: "nums", value: numsText() },
        { name: "tree", value: treeText() },
        { name: "outputs", value: outputsText() },
        ...vars,
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  snapshot({
    title: { vi: "Tạo segment tree dạng mảng 2*n", en: "Create a 2*n array segment tree" },
    codeLine: 3,
    mode: "build",
    status: [{ label: "n", value: n }, { label: "tree size", value: 2 * n }],
    note: { vi: "Nửa sau của mảng tree là các lá; nửa đầu là các tổng cha.", en: "The second half stores leaves; the first half stores parent sums." },
    force: true,
  });

  for (let index = 0; index < n; index += 1) {
    tree[n + index] = nums[index];
    snapshot({
      title: { vi: `Gán lá tree[${n + index}] = nums[${index}]`, en: `Set leaf tree[${n + index}] = nums[${index}]` },
      codeLine: 5,
      mode: "build",
      activeNums: [index],
      activeTree: [n + index],
      path: [n + index],
      status: [{ label: "i", value: index }, { label: "leaf", value: n + index }, { label: "value", value: nums[index] }],
      vars: [{ name: `tree[${n + index}]`, value: nums[index] }],
      note: { vi: `Lá tree[${n + index}] đại diện cho nums[${index}].`, en: `Leaf tree[${n + index}] represents nums[${index}].` },
    });
  }

  for (let index = n - 1; index > 0; index -= 1) {
    const leftChild = 2 * index;
    const rightChild = 2 * index + 1;
    tree[index] = tree[leftChild] + tree[rightChild];
    snapshot({
      title: { vi: `tree[${index}] = tree[${leftChild}] + tree[${rightChild}]`, en: `tree[${index}] = tree[${leftChild}] + tree[${rightChild}]` },
      codeLine: 8,
      mode: "build",
      activeNums: coverage[index],
      activeTree: [index, leftChild, rightChild].filter((node) => node < 2 * n),
      path: [leftChild, rightChild, index].filter((node) => node < 2 * n),
      status: [{ label: "parent", value: index }, { label: "sum", value: tree[index] }],
      vars: [{ name: `tree[${index}]`, value: `${tree[leftChild]} + ${tree[rightChild]} = ${tree[index]}` }],
      note: { vi: "Mỗi node cha lưu tổng của hai node con trực tiếp.", en: "Each parent stores the sum of its two direct children." },
    });
  }

  for (let commandIndex = 0; commandIndex < commands.length; commandIndex += 1) {
    const command = commands[commandIndex];
    const isLast = commandIndex === commands.length - 1;

    if (command.op === "update") {
      const index = command.first;
      const value = command.second;
      let pos = index + n;
      snapshot({
        title: { vi: `update(${index}, ${value})`, en: `update(${index}, ${value})` },
        codeLine: 10,
        mode: "update",
        activeNums: [index],
        activeTree: [pos],
        path: [pos],
        status: [{ label: "operation", value: `${commandIndex + 1}/${commands.length}` }, { label: "update", value: `[${index}] = ${value}` }],
        vars: [{ name: "pos", value: `${index} + ${n} = ${pos}` }, { name: "val", value }],
        note: { vi: "Đổi index của nums sang vị trí lá trong tree.", en: "Convert the nums index to its leaf position in tree." },
      });
      const oldValue = nums[index];
      nums[index] = value;
      tree[pos] = value;
      snapshot({
        title: { vi: `Ghi tree[${pos}] = ${value}`, en: `Write tree[${pos}] = ${value}` },
        codeLine: 12,
        mode: "update",
        activeNums: [index],
        activeTree: [pos],
        path: [pos],
        status: [{ label: "old", value: oldValue }, { label: "new", value }],
        vars: [{ name: `tree[${pos}]`, value }, { name: `nums[${index}]`, value }],
        note: { vi: "Sau khi sửa lá, các node cha trên đường lên root cần tính lại.", en: "After changing the leaf, recompute every parent on the path to the root." },
      });
      const path = [pos];
      while (pos > 1) {
        pos = Math.floor(pos / 2);
        const leftChild = 2 * pos;
        const rightChild = 2 * pos + 1;
        const before = tree[pos];
        tree[pos] = tree[leftChild] + tree[rightChild];
        path.push(pos);
        snapshot({
          title: { vi: `Tính lại tree[${pos}]`, en: `Recompute tree[${pos}]` },
          codeLine: 16,
          mode: "update",
          activeNums: coverage[pos],
          activeTree: [pos, leftChild, rightChild].filter((node) => node < 2 * n),
          selectedTree: path,
          path,
          status: [{ label: "parent", value: pos }, { label: "before", value: before }, { label: "after", value: tree[pos] }],
          vars: [{ name: `tree[${pos}]`, value: `${tree[leftChild]} + ${tree[rightChild]} = ${tree[pos]}` }],
          note: { vi: `Đi lên node cha ${pos}; tổng mới lấy từ hai con.`, en: `Move to parent ${pos}; its new sum comes from its two children.` },
        });
      }
      outputs.push(null);
      snapshot({
        title: { vi: `Hoàn tất update(${index}, ${value})`, en: `Finish update(${index}, ${value})` },
        codeLine: 16,
        mode: "update",
        activeNums: [index],
        selectedTree: path,
        path,
        status: [{ label: "operation", value: `${commandIndex + 1}/${commands.length}` }, { label: "output", value: "null" }],
        note: { vi: "Mảng nums và segment tree đã đồng bộ.", en: "nums and the segment tree are now synchronized." },
        final: isLast,
        force: isLast,
      });
    } else {
      const left = command.first;
      const right = command.second;
      const activeNums = Array.from({ length: right - left + 1 }, (_, offset) => left + offset);
      const status = [{ label: "operation", value: `${commandIndex + 1}/${commands.length}` }, { label: "range", value: `[${left}, ${right}]` }];
      let leftPos = left + n;
      let rightPos = right + n;
      let total = 0;
      const selectedTree = [];
      snapshot({
        title: { vi: `sumRange(${left}, ${right})`, en: `sumRange(${left}, ${right})` },
        codeLine: 18,
        mode: "query",
        activeNums,
        activeTree: [leftPos, rightPos],
        path: [leftPos, rightPos],
        status,
        vars: [{ name: "left", value: leftPos }, { name: "right", value: rightPos }, { name: "total", value: total }],
        note: { vi: "Đưa hai đầu query xuống hàng lá rồi đi dần lên cha.", en: "Move both query endpoints to leaves, then climb toward the root." },
      });
      while (leftPos <= rightPos) {
        snapshot({
          title: { vi: `left=${leftPos}, right=${rightPos}`, en: `left=${leftPos}, right=${rightPos}` },
          codeLine: 24,
          mode: "query",
          activeNums,
          activeTree: [leftPos, rightPos],
          selectedTree,
          path: [leftPos, rightPos],
          status: [...status, { label: "total", value: total }],
          vars: [{ name: "left", value: leftPos }, { name: "right", value: rightPos }, { name: "total", value: total }],
          note: { vi: "Nếu left là con phải hoặc right là con trái, node đó là một đoạn trọn vẹn cần cộng.", en: "If left is a right child or right is a left child, that whole node contributes to the answer." },
        });
        if (leftPos % 2 === 1) {
          const before = total;
          total += tree[leftPos];
          selectedTree.push(leftPos);
          snapshot({
            title: { vi: `Cộng tree[${leftPos}]`, en: `Add tree[${leftPos}]` },
            codeLine: 26,
            mode: "query",
            activeNums: coverage[leftPos],
            activeTree: [leftPos],
            selectedTree,
            path: selectedTree,
            status: [...status, { label: "total", value: `${before} + ${tree[leftPos]} = ${total}` }],
            vars: [{ name: "total", value: `${before} + ${tree[leftPos]} = ${total}` }],
            note: { vi: `Node ${leftPos} nằm trọn trong query nên cộng trực tiếp.`, en: `Node ${leftPos} is fully inside the query, so add it directly.` },
          });
          leftPos += 1;
        }
        if (rightPos % 2 === 0) {
          const before = total;
          total += tree[rightPos];
          selectedTree.push(rightPos);
          snapshot({
            title: { vi: `Cộng tree[${rightPos}]`, en: `Add tree[${rightPos}]` },
            codeLine: 29,
            mode: "query",
            activeNums: coverage[rightPos],
            activeTree: [rightPos],
            selectedTree,
            path: selectedTree,
            status: [...status, { label: "total", value: `${before} + ${tree[rightPos]} = ${total}` }],
            vars: [{ name: "total", value: `${before} + ${tree[rightPos]} = ${total}` }],
            note: { vi: `Node ${rightPos} nằm trọn trong query nên cộng trực tiếp.`, en: `Node ${rightPos} is fully inside the query, so add it directly.` },
          });
          rightPos -= 1;
        }
        leftPos = Math.floor(leftPos / 2);
        rightPos = Math.floor(rightPos / 2);
        snapshot({
          title: { vi: "Đi lên tầng cha", en: "Move to the parent level" },
          codeLine: 33,
          mode: "query",
          activeNums,
          activeTree: leftPos <= rightPos ? [leftPos, rightPos] : [],
          selectedTree,
          path: leftPos <= rightPos ? [leftPos, rightPos] : selectedTree,
          status: [...status, { label: "total", value: total }],
          vars: [{ name: "left", value: leftPos }, { name: "right", value: rightPos }],
          note: leftPos <= rightPos
            ? { vi: "Hai con trỏ tiếp tục xét ở tầng cao hơn.", en: "The two pointers continue at the next higher level." }
            : { vi: "Hai con trỏ đã vượt nhau, query kết thúc.", en: "The pointers crossed, so the query ends." },
        });
      }
      outputs.push(total);
      snapshot({
        title: { vi: `sumRange(${left}, ${right}) = ${total}`, en: `sumRange(${left}, ${right}) = ${total}` },
        codeLine: 35,
        mode: "query",
        activeNums,
        selectedTree,
        path: selectedTree,
        status: [...status, { label: "answer", value: total }],
        vars: [{ name: "return", value: total }],
        note: { vi: "Các node đã chọn phủ đúng đoạn query và không chồng lặp.", en: "The selected nodes cover exactly the query range without overlap." },
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

/** LeetCode 1346: Check If N and Its Double Exist — hash set. */
function buildSteps1346(input) {
  const arr = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  const seen = new Set();
  function snap(o) { steps.push({ title: o.title, arr: [...arr], sub: arr.map((_, i) => `[${i}]`), highlight: o.highlight || [], mark: o.mark || [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: "seen = set()", en: "seen = set()" }, codeLines: [3], vars: [{ name: "arr", value: `[${arr.join(", ")}]` }], note: { vi: "Với mỗi số, kiểm tra 2×num hoặc num/2 (nếu chẵn) đã thấy chưa. Nếu có → tồn tại cặp N và 2N.", en: "For each num, check if 2×num or num/2 (if even) was already seen. If so → a pair N and 2N exists." } });
  let answer = false;
  for (let i = 0; i < arr.length; i++) {
    const num = arr[i];
    const hitDouble = seen.has(num * 2);
    const hitHalf = num % 2 === 0 && seen.has(num / 2);
    if (hitDouble || hitHalf) {
      answer = true;
      const other = hitDouble ? num * 2 : num / 2;
      const otherIdx = arr.indexOf(other);
      snap({ title: { vi: `num=${num}: thấy ${other} → True`, en: `num=${num}: found ${other} → True` }, highlight: [i], mark: otherIdx >= 0 ? [otherIdx] : [], final: true, codeLines: [4, 5, 6], vars: [{ name: "num", value: num }, { name: "match", value: `${other} (=${hitDouble ? "2×num" : "num/2"})` }, { name: "answer", value: true }], note: { vi: `${num} và ${other} tạo thành cặp N/2N → trả về True.`, en: `${num} and ${other} form an N/2N pair → return True.` } });
      break;
    }
    seen.add(num);
    snap({ title: { vi: `num=${num}: chưa có cặp → thêm vào seen`, en: `num=${num}: no pair yet → add to seen` }, highlight: [i], mark: [], codeLines: [4, 5, 7], vars: [{ name: "num", value: num }, { name: "seen", value: `{${[...seen].join(", ")}}` }], note: { vi: `Chưa thấy 2×${num}=${num * 2}${num % 2 === 0 ? ` hay ${num}/2=${num / 2}` : ""}. Thêm ${num} vào seen.`, en: `Haven't seen 2×${num}=${num * 2}${num % 2 === 0 ? ` or ${num}/2=${num / 2}` : ""}. Add ${num} to seen.` } });
  }
  if (!answer) snap({ title: { vi: "Không có cặp → False", en: "No pair → False" }, final: true, codeLines: [8], vars: [{ name: "answer", value: false }], note: { vi: "Duyệt hết mà không tìm được cặp N/2N.", en: "Scanned all without finding an N/2N pair." } });
  return { original: arr, answer, steps };
}

/** LeetCode 383: Ransom Note — frequency counter. */
function buildSteps383(input, params) {
  const ransom = String(input);
  const magazine = String(params && params.magazine !== undefined ? params.magazine : "aab");
  const steps = [];
  const avail = {};
  for (const c of magazine) avail[c] = (avail[c] || 0) + 1;
  const availStr = () => `{${Object.entries(avail).map(([k, v]) => `${k}:${v}`).join(", ")}}`;
  function snap(o) { steps.push({ title: o.title, arr: [], highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: "Đếm tần suất chữ trong magazine", en: "Count letter frequencies in magazine" }, codeLines: [3], vars: [{ name: "ransomNote", value: `"${ransom}"` }, { name: "magazine", value: `"${magazine}"` }, { name: "available", value: availStr() }], note: { vi: "Đếm số lần mỗi chữ có trong magazine. Mỗi chữ của ransomNote 'tiêu thụ' 1 chữ tương ứng.", en: "Count each letter available in magazine. Each ransomNote char 'consumes' one matching letter." } });
  let answer = true;
  for (const ch of ransom) {
    if ((avail[ch] || 0) <= 0) {
      answer = false;
      snap({ title: { vi: `'${ch}' hết trong magazine → False`, en: `'${ch}' exhausted in magazine → False` }, final: true, codeLines: [4, 5], vars: [{ name: "char", value: `'${ch}'` }, { name: `available['${ch}']`, value: avail[ch] || 0 }, { name: "answer", value: false } ], note: { vi: `Cần '${ch}' nhưng magazine không còn → không ghép được.`, en: `Need '${ch}' but magazine has none left → cannot construct.` } });
      break;
    }
    avail[ch] -= 1;
    snap({ title: { vi: `Dùng '${ch}' → available['${ch}']=${avail[ch]}`, en: `Use '${ch}' → available['${ch}']=${avail[ch]}` }, codeLines: [4, 6], vars: [{ name: "char", value: `'${ch}'` }, { name: "available", value: availStr() }], note: { vi: `'${ch}' còn trong magazine → dùng 1, giảm số lượng.`, en: `'${ch}' available → use one, decrement its count.` } });
  }
  if (answer) snap({ title: { vi: "Ghép được → True", en: "Constructible → True" }, final: true, codeLines: [7], vars: [{ name: "answer", value: true }], note: { vi: "Mọi chữ của ransomNote đều đủ trong magazine.", en: "Every ransomNote letter is covered by magazine." } });
  return { original: ransom, answer, steps };
}

/** LeetCode 359: Logger Rate Limiter — hash map of next-allowed timestamps. */
function buildSteps359(input) {
  // input: "ts,message; ts,message; ..."
  const calls = String(input).split(";").map((c) => c.trim()).filter(Boolean).map((c) => {
    const idx = c.indexOf(",");
    return [Number(c.slice(0, idx).trim()), c.slice(idx + 1).trim()];
  });
  const steps = [];
  const lastPrinted = {};
  const mapStr = () => `{${Object.entries(lastPrinted).map(([k, v]) => `${k}:${v}`).join(", ")}}`;
  function snap(o) { steps.push({ title: o.title, arr: [], highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: "last_printed = {}", en: "last_printed = {}" }, codeLines: [3], vars: [{ name: "calls", value: calls.length }], note: { vi: "Mỗi message lưu thời điểm SỚM NHẤT được in lại (= ts+10). In nếu chưa từng in hoặc ts ≥ mốc đó.", en: "Each message stores the EARLIEST timestamp it may reprint (= ts+10). Print if never printed or ts ≥ that mark." } });
  const results = [];
  for (const [ts, msg] of calls) {
    const ok = !(msg in lastPrinted) || ts >= lastPrinted[msg];
    if (ok) lastPrinted[msg] = ts + 10;
    results.push(ok);
    snap({
      title: { vi: `t=${ts} "${msg}" → ${ok}`, en: `t=${ts} "${msg}" → ${ok}` },
      codeLines: ok ? [4, 5, 6] : [4, 7],
      vars: [{ name: "timestamp", value: ts }, { name: "message", value: `"${msg}"` }, { name: "last_printed", value: mapStr() }, { name: "result", value: ok }],
      note: {
        vi: ok
          ? `"${msg}" chưa in hoặc đã qua 10s → IN. Đặt mốc kế = ${ts + 10}.`
          : `"${msg}" mới in gần đây (mốc ${lastPrinted[msg]} > ${ts}) → KHÔNG in.`,
        en: ok
          ? `"${msg}" never printed or 10s passed → PRINT. Set next mark = ${ts + 10}.`
          : `"${msg}" printed recently (mark ${lastPrinted[msg]} > ${ts}) → do NOT print.`,
      },
    });
  }
  snap({ title: { vi: `Kết quả: [${results.join(", ")}]`, en: `Result: [${results.join(", ")}]` }, final: true, codeLines: [7], vars: [{ name: "answers", value: `[${results.join(", ")}]` }], note: { vi: "Kết quả in/không-in cho từng message.", en: "Print/no-print result for each message." } });
  return { original: calls, answer: results, steps };
}

/** LeetCode 217: Contains Duplicate. */
function buildSteps217(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  const seen = new Set();
  function snap(o) { steps.push({ title: o.title, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: o.highlight || [], mark: o.mark || [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: "seen = set()", en: "seen = set()" }, codeLines: [3], vars: [{ name: "nums", value: `[${nums.join(",")}]` }], note: { vi: "Duyệt mảng, nếu gặp lại số đã thấy → có trùng.", en: "Scan the array; if a number was already seen → duplicate exists." } });
  let answer = false;
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(nums[i])) { answer = true; snap({ title: { vi: `nums[${i}]=${nums[i]} đã có → True`, en: `nums[${i}]=${nums[i]} already seen → True` }, highlight: [i], mark: [nums.indexOf(nums[i])], final: true, codeLines: [4, 5], vars: [{ name: "num", value: nums[i] }, { name: "answer", value: true }], note: { vi: `${nums[i]} đã xuất hiện trước đó → có phần tử trùng.`, en: `${nums[i]} appeared before → a duplicate exists.` } }); break; }
    seen.add(nums[i]);
    snap({ title: { vi: `nums[${i}]=${nums[i]} mới → thêm vào seen`, en: `nums[${i}]=${nums[i]} new → add to seen` }, highlight: [i], mark: [], codeLines: [4, 6], vars: [{ name: "num", value: nums[i] }, { name: "seen", value: `{${[...seen].join(",")}}` }], note: { vi: `Chưa thấy → thêm vào seen.`, en: `Not seen → add to seen.` } });
  }
  if (!answer) snap({ title: { vi: "Không có trùng → False", en: "No duplicate → False" }, final: true, codeLines: [7], vars: [{ name: "answer", value: false }], note: { vi: "Mọi phần tử khác nhau.", en: "All elements are distinct." } });
  return { original: nums, answer, steps };
}

/** LeetCode 219: Contains Duplicate II. */
function buildSteps219(input, params) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const k = params && params.k !== undefined ? Number(params.k) : 3;
  const steps = [];
  const last = {};
  function snap(o) { steps.push({ title: o.title, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: o.highlight || [], mark: o.mark || [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: `last = {}, k=${k}`, en: `last = {}, k=${k}` }, codeLines: [3], vars: [{ name: "k", value: k }], note: { vi: "Lưu chỉ số gần nhất của mỗi giá trị. Nếu gặp lại trong khoảng ≤ k → True.", en: "Store the last index of each value. If a repeat occurs within ≤ k → True." } });
  let answer = false;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] in last && i - last[nums[i]] <= k) { answer = true; snap({ title: { vi: `nums[${i}]=${nums[i]}, |${i}-${last[nums[i]]}|≤${k} → True`, en: `nums[${i}]=${nums[i]}, |${i}-${last[nums[i]]}|≤${k} → True` }, highlight: [i, last[nums[i]]], mark: [i, last[nums[i]]], final: true, codeLines: [4, 5], vars: [{ name: "num", value: nums[i] }, { name: "prev index", value: last[nums[i]] }, { name: "distance", value: i - last[nums[i]] }], note: { vi: `${nums[i]} lặp lại cách ${i - last[nums[i]]} ≤ k=${k} → True.`, en: `${nums[i]} repeats within distance ${i - last[nums[i]]} ≤ k=${k} → True.` } }); break; }
    last[nums[i]] = i;
    snap({ title: { vi: `last[${nums[i]}] = ${i}`, en: `last[${nums[i]}] = ${i}` }, highlight: [i], mark: [], codeLines: [4, 6], vars: [{ name: "num", value: nums[i] }, { name: "last", value: `{${Object.entries(last).map(([kk, v]) => `${kk}:${v}`).join(",")}}` }], note: { vi: `Cập nhật chỉ số gần nhất của ${nums[i]} = ${i}.`, en: `Update last index of ${nums[i]} = ${i}.` } });
  }
  if (!answer) snap({ title: { vi: "Không có → False", en: "None → False" }, final: true, codeLines: [7], vars: [{ name: "answer", value: false }], note: { vi: "Không có cặp trùng trong khoảng k.", en: "No duplicate pair within distance k." } });
  return { original: nums, answer, steps };
}

/** LeetCode 202: Happy Number — detailed Floyd cycle detection trace. */
function buildSteps202(input) {
  const n0 = Number(Array.isArray(input) ? input[0] : String(input).trim());
  if (!Number.isSafeInteger(n0) || n0 < 1 || n0 > 999999999) {
    throw new Error("Enter one positive integer from 1 to 999999999.");
  }

  const steps = [];
  const breakdown = (value) => {
    const digits = String(value).split("").map(Number);
    const terms = digits.map((digit) => ({ digit, square: digit * digit }));
    return { value, digits, terms, sum: terms.reduce((total, term) => total + term.square, 0) };
  };
  const next = (value) => breakdown(value).sum;
  let slow = n0;
  let fast = n0;
  const slowPath = [n0];
  const fastPath = [n0];

  function snap(options) {
    const transform = options.transform || null;
    steps.push({
      title: options.title,
      arr: transform ? [...transform.digits] : String(options.activeValue ?? n0).split("").map(Number),
      sub: transform ? transform.terms.map((term) => `${term.digit}²`) : [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "slow", value: slow },
        { name: "fast", value: fast },
        ...(transform ? [{ name: `nxt(${transform.value})`, value: transform.sum }] : []),
        ...(options.vars || []),
      ],
      note: options.note,
      happyNumberView: {
        original: n0,
        slow,
        fast,
        slowPath: [...slowPath],
        fastPath: [...fastPath],
        transform: transform ? { ...transform, terms: transform.terms.map((term) => ({ ...term })) } : null,
        mover: options.mover || null,
        fastHop: options.fastHop ?? null,
        phase: options.phase || "setup",
        condition: options.condition ?? null,
        answer: options.answer ?? null,
      },
    });
  }

  snap({
    title: { vi: "Định nghĩa nxt(x)", en: "Define nxt(x)" },
    codeLines: [3, 4, 5, 6, 7, 8, 9],
    phase: "helper",
    activeValue: n0,
    transform: breakdown(n0),
    note: {
      vi: "nxt(x) tách từng chữ số, bình phương rồi cộng lại. Đây là cạnh chuyển từ một số sang số kế tiếp.",
      en: "nxt(x) splits the digits, squares each one, and adds them. This defines one transition to the next number.",
    },
  });

  snap({
    title: { vi: `slow = n = ${n0}`, en: `slow = n = ${n0}` },
    codeLines: [11],
    phase: "init-slow",
    activeValue: n0,
    mover: "slow",
    note: {
      vi: "Con trỏ slow bắt đầu tại n và sẽ đi đúng một cạnh mỗi vòng.",
      en: "The slow pointer starts at n and moves exactly one transition per loop.",
    },
  });

  const firstFastTransform = breakdown(n0);
  fast = firstFastTransform.sum;
  fastPath.push(fast);
  snap({
    title: { vi: `fast = nxt(${n0}) = ${fast}`, en: `fast = nxt(${n0}) = ${fast}` },
    codeLines: [12],
    phase: "init-fast",
    transform: firstFastTransform,
    mover: "fast",
    note: {
      vi: `Khởi động fast trước một bước: ${firstFastTransform.terms.map((term) => `${term.digit}²`).join(" + ")} = ${fast}.`,
      en: `Start fast one step ahead: ${firstFastTransform.terms.map((term) => `${term.digit}²`).join(" + ")} = ${fast}.`,
    },
  });

  let guard = 0;
  while (fast !== 1 && slow !== fast && guard < 100) {
    guard += 1;
    snap({
      title: { vi: `${fast} != 1 và ${slow} != ${fast}`, en: `${fast} != 1 and ${slow} != ${fast}` },
      codeLines: [13],
      phase: "condition",
      condition: true,
      note: {
        vi: "Chưa chạm 1 và hai con trỏ chưa gặp nhau, nên tiếp tục vòng lặp.",
        en: "Fast has not reached 1 and the pointers have not met, so continue the loop.",
      },
    });

    const slowTransform = breakdown(slow);
    slow = slowTransform.sum;
    slowPath.push(slow);
    snap({
      title: { vi: `slow = nxt(${slowTransform.value}) = ${slow}`, en: `slow = nxt(${slowTransform.value}) = ${slow}` },
      codeLines: [14],
      phase: "slow-step",
      transform: slowTransform,
      mover: "slow",
      note: {
        vi: `Slow đi một bước: ${slowTransform.terms.map((term) => `${term.digit}²`).join(" + ")} = ${slow}.`,
        en: `Slow moves one step: ${slowTransform.terms.map((term) => `${term.digit}²`).join(" + ")} = ${slow}.`,
      },
    });

    const fastFirstTransform = breakdown(fast);
    const fastHop = fastFirstTransform.sum;
    fastPath.push(fastHop);
    snap({
      title: { vi: `Fast bước 1: nxt(${fast}) = ${fastHop}`, en: `Fast hop 1: nxt(${fast}) = ${fastHop}` },
      codeLines: [15],
      phase: "fast-hop-one",
      transform: fastFirstTransform,
      mover: "fast",
      fastHop,
      note: {
        vi: `Nửa đầu của nxt(nxt(fast)): fast tạm đi tới ${fastHop}.`,
        en: `First half of nxt(nxt(fast)): fast temporarily reaches ${fastHop}.`,
      },
    });

    const fastSecondTransform = breakdown(fastHop);
    fast = fastSecondTransform.sum;
    fastPath.push(fast);
    snap({
      title: { vi: `Fast bước 2: nxt(${fastHop}) = ${fast}`, en: `Fast hop 2: nxt(${fastHop}) = ${fast}` },
      codeLines: [15],
      phase: "fast-hop-two",
      transform: fastSecondTransform,
      mover: "fast",
      fastHop,
      note: {
        vi: `Fast hoàn tất hai bước và dừng tại ${fast}; slow hiện ở ${slow}.`,
        en: `Fast completes its two transitions and stops at ${fast}; slow is now at ${slow}.`,
      },
    });
  }

  const reachedOne = fast === 1;
  snap({
    title: reachedOne
      ? { vi: "fast == 1: dừng vòng lặp", en: "fast == 1: stop the loop" }
      : { vi: `slow == fast == ${slow}: phát hiện chu kỳ`, en: `slow == fast == ${slow}: cycle detected` },
    codeLines: [13],
    phase: reachedOne ? "reached-one" : "cycle",
    condition: false,
    note: reachedOne
      ? { vi: "Fast đã chạm 1. Từ 1, nxt(1) vẫn là 1 nên dãy đã đi tới đích.", en: "Fast reached 1. Since nxt(1) remains 1, the sequence has reached its goal." }
      : { vi: "Slow và fast gặp nhau trước khi thấy 1. Dãy đang lặp trong một chu kỳ không chứa 1.", en: "Slow and fast met before reaching 1. The sequence is repeating in a cycle that excludes 1." },
  });

  snap({
    title: { vi: `return fast == 1 → ${reachedOne}`, en: `return fast == 1 → ${reachedOne}` },
    codeLines: [16],
    phase: "done",
    answer: reachedOne,
    final: true,
    vars: [{ name: "answer", value: reachedOne }],
    note: reachedOne
      ? { vi: `${n0} là Happy Number vì dãy biến đổi chạm 1.`, en: `${n0} is a Happy Number because its sequence reaches 1.` }
      : { vi: `${n0} không phải Happy Number vì dãy rơi vào chu kỳ.`, en: `${n0} is not a Happy Number because its sequence enters a cycle.` },
  });

  return { original: n0, answer: reachedOne, steps };
}

/**
 * LeetCode 454: 4Sum II.
 * Count tuples (a, b, c, d) where a + b + c + d = 0 using a hash map of
 * all pair sums a + b. Then every c + d needs the complementary key
 * -(c + d). Duplicated pair sums are stored as frequencies, not just keys.
 */
function buildSteps454(nums1, params) {
  const parseList = (value) => String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map(Number)
    .filter(Number.isFinite);
  const A = Array.isArray(nums1) ? nums1.map(Number).filter(Number.isFinite) : parseList(nums1);
  const B = parseList(params && params.nums2);
  const C = parseList(params && params.nums3);
  const D = parseList(params && params.nums4);
  const steps = [];
  const valid = A.length && B.length && C.length && D.length;

  function mapEntries(pairCount) {
    return [...pairCount.entries()].sort((x, y) => x[0] - y[0]).map(([sum, count]) => ({ sum, count }));
  }

  function snap(opts, pairCount, answer) {
    steps.push({
      title: opts.title,
      arr: [...A],
      sub: A.map((_, index) => `[${index}]`),
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      fourSumPairsView: {
        nums1: [...A], nums2: [...B], nums3: [...C], nums4: [...D],
        activeA: opts.activeA,
        activeB: opts.activeB,
        activeC: opts.activeC,
        activeD: opts.activeD,
        pairSum: opts.pairSum,
        complement: opts.complement,
        foundCount: opts.foundCount,
        pairEntries: mapEntries(pairCount),
        answer,
        phase: opts.phase || "build",
      },
    });
  }

  if (!valid) {
    snap({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      final: true,
      codeLines: [2],
      vars: [{ name: "nums1", value: `[${A.join(",")}]` }, { name: "nums2", value: `[${B.join(",")}]` }, { name: "nums3", value: `[${C.join(",")}]` }, { name: "nums4", value: `[${D.join(",")}]` }],
      note: { vi: "Cần nhập đủ bốn mảng số nguyên không rỗng.", en: "All four non-empty integer arrays are required." },
      phase: "invalid",
    }, new Map(), 0);
    return { original: { nums1: A, nums2: B, nums3: C, nums4: D }, answer: 0, steps };
  }

  const pairCount = new Map();
  let answer = 0;

  // Line 3: pair_count = {}
  snap({
    title: { vi: "pair_count = {}", en: "pair_count = {}" },
    codeLines: [3],
    vars: [{ name: "pair_count", value: "{}" }],
    note: { vi: "Hash map sẽ lưu {tổng a+b : số cặp (a,b) tạo tổng đó}.", en: "The hash map stores {sum a+b : number of (a,b) pairs producing that sum}." },
    phase: "init-map",
  }, pairCount, answer);

  for (let ai = 0; ai < A.length; ai++) {
    const a = A[ai];
    // Line 4
    snap({
      title: { vi: `for a in nums1: a=nums1[${ai}]=${a}`, en: `for a in nums1: a=nums1[${ai}]=${a}` },
      codeLines: [4], activeA: ai,
      vars: [{ name: "a", value: a }],
      note: { vi: `Chọn a=${a}; ghép nó lần lượt với mọi b trong nums2.`, en: `Choose a=${a}; pair it with every b in nums2.` },
      phase: "choose-a",
    }, pairCount, answer);

    for (let bi = 0; bi < B.length; bi++) {
      const b = B[bi];
      // Line 5
      snap({
        title: { vi: `for b in nums2: b=nums2[${bi}]=${b}`, en: `for b in nums2: b=nums2[${bi}]=${b}` },
        codeLines: [5], activeA: ai, activeB: bi,
        vars: [{ name: "a", value: a }, { name: "b", value: b }],
        note: { vi: `Xét cặp (a,b)=(${a},${b}).`, en: `Inspect pair (a,b)=(${a},${b}).` },
        phase: "choose-b",
      }, pairCount, answer);

      const sum = a + b;
      const oldCount = pairCount.get(sum) || 0;
      pairCount.set(sum, oldCount + 1);
      // Line 6
      snap({
        title: { vi: `pair_count[${a}+${b}=${sum}] = ${oldCount}+1 = ${oldCount + 1}`, en: `pair_count[${a}+${b}=${sum}] = ${oldCount}+1 = ${oldCount + 1}` },
        codeLines: [6], activeA: ai, activeB: bi, pairSum: sum,
        vars: [{ name: "a + b", value: sum }, { name: `pair_count[${sum}]`, value: oldCount + 1 }],
        note: { vi: `Lưu tần suất tổng ${sum}. Nếu nhiều cặp (a,b) có cùng tổng thì phải cộng dồn vì mỗi cặp là một tuple riêng.`, en: `Store the frequency of sum ${sum}. Multiple (a,b) pairs with the same sum must accumulate because each is a separate tuple.` },
        phase: "store-pair",
      }, pairCount, answer);
    }
  }

  // Line 7: count = 0
  snap({
    title: { vi: "count = 0", en: "count = 0" },
    codeLines: [7],
    vars: [{ name: "count", value: answer }],
    note: { vi: "Đã có tất cả tổng a+b. Bây giờ duyệt các cặp (c,d) và tìm tổng bù trong hash map.", en: "All a+b sums are ready. Now scan (c,d) pairs and look up their complement in the hash map." },
    phase: "init-count",
  }, pairCount, answer);

  for (let ci = 0; ci < C.length; ci++) {
    const c = C[ci];
    // Line 8
    snap({
      title: { vi: `for c in nums3: c=nums3[${ci}]=${c}`, en: `for c in nums3: c=nums3[${ci}]=${c}` },
      codeLines: [8], activeC: ci,
      vars: [{ name: "c", value: c }],
      note: { vi: `Chọn c=${c}; ghép nó với mọi d trong nums4.`, en: `Choose c=${c}; pair it with every d in nums4.` },
      phase: "choose-c",
    }, pairCount, answer);

    for (let di = 0; di < D.length; di++) {
      const d = D[di];
      // Line 9
      snap({
        title: { vi: `for d in nums4: d=nums4[${di}]=${d}`, en: `for d in nums4: d=nums4[${di}]=${d}` },
        codeLines: [9], activeC: ci, activeD: di,
        vars: [{ name: "c", value: c }, { name: "d", value: d }],
        note: { vi: `Xét cặp (c,d)=(${c},${d}).`, en: `Inspect pair (c,d)=(${c},${d}).` },
        phase: "choose-d",
      }, pairCount, answer);

      const complement = -(c + d);
      const foundCount = pairCount.get(complement) || 0;
      answer += foundCount;
      // Line 10
      snap({
        title: { vi: `count += pair_count[-(${c}+${d})=${complement}] = ${foundCount} → ${answer}`, en: `count += pair_count[-(${c}+${d})=${complement}] = ${foundCount} → ${answer}` },
        codeLines: [10], activeC: ci, activeD: di, complement, foundCount,
        vars: [{ name: "-(c+d)", value: complement }, { name: `pair_count[${complement}]`, value: foundCount }, { name: "count", value: answer }],
        note: foundCount
          ? { vi: `Cần a+b=${complement} để a+b+c+d=0. Hash map có ${foundCount} cặp như vậy, nên count tăng ${foundCount}.`, en: `Need a+b=${complement} so a+b+c+d=0. The hash map has ${foundCount} such pair(s), so count increases by ${foundCount}.` }
          : { vi: `Cần a+b=${complement}, nhưng hash map không có tổng này → không có tuple mới.`, en: `Need a+b=${complement}, but the hash map has no such sum → no new tuple.` },
        phase: "lookup-complement",
      }, pairCount, answer);
    }
  }

  // Line 11: return count
  snap({
    title: { vi: `return count → ${answer}`, en: `return count → ${answer}` },
    final: true, codeLines: [11],
    vars: [{ name: "count", value: answer }],
    note: { vi: `Tổng số tuple (a,b,c,d) có a+b+c+d=0 là ${answer}.`, en: `The total number of tuples (a,b,c,d) with a+b+c+d=0 is ${answer}.` },
    phase: "found",
  }, pairCount, answer);

  return { original: { nums1: A, nums2: B, nums3: C, nums4: D }, answer, steps };
}

module.exports = {
  454: {
    id: 454,
    difficulty: "medium",
    slug: "4sum-ii",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: { vi: "4Sum II", en: "4Sum II" },
    titleVi: { vi: "Đếm bộ bốn có tổng bằng 0", en: "Count quadruplets with sum zero" },
    statement: {
      vi: "Cho bốn mảng số nguyên nums1, nums2, nums3, nums4 có cùng độ dài. Đếm số tuple (i,j,k,l) sao cho nums1[i] + nums2[j] + nums3[k] + nums4[l] = 0.",
      en: "Given four integer arrays nums1, nums2, nums3, and nums4 of the same length, count tuples (i,j,k,l) such that nums1[i] + nums2[j] + nums3[k] + nums4[l] = 0.",
    },
    defaultInput: "1,2",
    inputKind: "integer",
    inputLabel: { vi: "nums1", en: "nums1" },
    extraParams: [
      { key: "nums2", type: "string", label: { vi: "nums2 (cách bởi ,)", en: "nums2 (comma separated)" }, default: "-2,-1" },
      { key: "nums3", type: "string", label: { vi: "nums3 (cách bởi ,)", en: "nums3 (comma separated)" }, default: "-1,2" },
      { key: "nums4", type: "string", label: { vi: "nums4 (cách bởi ,)", en: "nums4 (comma separated)" }, default: "0,2" },
    ],
    approach: [
      { vi: "Duyệt tất cả cặp (a,b) từ nums1 × nums2 và lưu tần suất từng tổng a+b vào hash map.", en: "Enumerate all (a,b) pairs from nums1 × nums2 and store the frequency of every a+b sum in a hash map." },
      { vi: "Với từng cặp (c,d), cần a+b = -(c+d) để tổng bốn số bằng 0.", en: "For each (c,d) pair, we need a+b = -(c+d) so all four numbers sum to 0." },
      { vi: "Cộng pair_count[-(c+d)] vào kết quả; tần suất tự động tính mọi cặp (a,b) trùng tổng.", en: "Add pair_count[-(c+d)] to the result; frequencies automatically count every (a,b) pair with that sum." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: { vi: "Hai lần duyệt cặp O(n²); hash map có tối đa O(n²) tổng khác nhau.", en: "Two O(n²) pair scans; the hash map has up to O(n²) distinct sums." },
    },
    code: [
      "class Solution:",
      "    def fourSumCount(self, nums1, nums2, nums3, nums4):",
      "        pair_count = {}",
      "        for a in nums1:",
      "            for b in nums2:",
      "                pair_count[a + b] = pair_count.get(a + b, 0) + 1",
      "        count = 0",
      "        for c in nums3:",
      "            for d in nums4:",
      "                count += pair_count.get(-(c + d), 0)",
      "        return count",
    ],
    builder: buildSteps454,
  },
  202: {
    id: 202, difficulty: "easy", slug: "happy-number",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    title: { vi: "Happy Number", en: "Happy Number" },
    titleVi: { vi: "Số hạnh phúc (phát hiện chu trình)", en: "Happy number (cycle detection)" },
    statement: { vi: "Lặp thay n bằng tổng bình phương các chữ số. Nếu về 1 → hạnh phúc. Nhập n.", en: "Repeatedly replace n with the sum of squares of its digits. If it reaches 1 → happy. Enter n." },
    defaultInput: [19], inputKind: "integer", inputLabel: { vi: "n", en: "n" }, singleInput: true, extraParams: [],
    approach: [{ vi: "next(x) = tổng bình phương các chữ số.", en: "next(x) = sum of squared digits." }, { vi: "Dùng slow/fast (Floyd) phát hiện chu trình.", en: "Use slow/fast (Floyd) to detect a cycle." }, { vi: "fast==1 → happy; slow==fast → chu trình → không happy.", en: "fast==1 → happy; slow==fast → cycle → not happy." }],
    complexity: { time: "O(log n)", space: "O(1)", note: { vi: "Không cần set nhờ Floyd.", en: "No set needed thanks to Floyd." } },
    code: [
      "class Solution:",
      "    def isHappy(self, n):",
      "        def nxt(x):",
      "            total = 0",
      "            while x > 0:",
      "                digit = x % 10",
      "                total += digit * digit",
      "                x //= 10",
      "            return total",
      "",
      "        slow = n",
      "        fast = nxt(n)",
      "        while fast != 1 and slow != fast:",
      "            slow = nxt(slow)",
      "            fast = nxt(nxt(fast))",
      "        return fast == 1",
    ],
    liveArgs: (input) => [Number(Array.isArray(input) ? input[0] : input)],
    builder: buildSteps202,
  },
  217: {
    id: 217, difficulty: "easy", slug: "contains-duplicate",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    title: { vi: "Contains Duplicate", en: "Contains Duplicate" },
    titleVi: { vi: "Có phần tử trùng không (hash set)", en: "Any duplicate? (hash set)" },
    statement: { vi: "Kiểm tra mảng có phần tử nào lặp lại không. Nhập nums cách nhau dấu phẩy.", en: "Check whether any value appears more than once. Enter nums comma-separated." },
    defaultInput: [1, 2, 3, 1], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [],
    approach: [{ vi: "Duyệt và lưu các số đã thấy vào set.", en: "Scan and store seen numbers in a set." }, { vi: "Gặp lại → True.", en: "See a repeat → True." }],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Một lượt với set.", en: "Single pass with a set." } },
    code: ["class Solution:", "    def containsDuplicate(self, nums):", "        seen = set()", "        for num in nums:", "            if num in seen: return True", "            seen.add(num)", "        return False"],
    builder: buildSteps217,
  },
  219: {
    id: 219, difficulty: "easy", slug: "contains-duplicate-ii",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    title: { vi: "Contains Duplicate II", en: "Contains Duplicate II" },
    titleVi: { vi: "Trùng trong khoảng k (hash map)", en: "Duplicate within distance k (hash map)" },
    statement: { vi: "Có tồn tại i≠j với nums[i]==nums[j] và |i-j|≤k không? Nhập nums; k trong tham số.", en: "Does there exist i≠j with nums[i]==nums[j] and |i-j|≤k? Enter nums; k as a parameter." },
    defaultInput: [1, 2, 3, 1], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 3 }],
    approach: [{ vi: "Lưu chỉ số gần nhất của mỗi giá trị.", en: "Store the last index of each value." }, { vi: "Gặp lại trong khoảng ≤ k → True.", en: "See a repeat within ≤ k → True." }],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Một lượt với hash map.", en: "Single pass with a hash map." } },
    code: ["class Solution:", "    def containsNearbyDuplicate(self, nums, k):", "        last = {}", "        for i, num in enumerate(nums):", "            if num in last and i - last[num] <= k: return True", "            last[num] = i", "        return False"],
    builder: buildSteps219,
  },
  1346: {
    id: 1346,
    difficulty: "easy",
    slug: "check-if-n-and-its-double-exist",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    title: { vi: "Check If N and Its Double Exist", en: "Check If N and Its Double Exist" },
    titleVi: { vi: "Kiểm tra tồn tại N và 2N (hash set)", en: "Check if N and 2N exist (hash set)" },
    statement: { vi: "Cho mảng arr. Có tồn tại i ≠ j sao cho arr[i] == 2*arr[j] không? Nhập cách nhau dấu phẩy.", en: "Given arr, does there exist i ≠ j with arr[i] == 2*arr[j]? Enter comma-separated." },
    defaultInput: [10, 2, 5, 3],
    inputKind: "integer", inputLabel: { vi: "arr", en: "arr" }, extraParams: [],
    approach: [
      { vi: "Duyệt mảng, giữ tập seen các số đã gặp.", en: "Scan the array, keep a set of seen numbers." },
      { vi: "Với mỗi num: kiểm tra 2×num hoặc num/2 (nếu chẵn) có trong seen.", en: "For each num: check if 2×num or num/2 (if even) is in seen." },
      { vi: "Nếu có → True. Ngược lại thêm num vào seen.", en: "If yes → True. Otherwise add num to seen." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Một lượt với hash set.", en: "Single pass with a hash set." } },
    code: ["class Solution:", "    def checkIfExist(self, arr):", "        seen = set()", "        for num in arr:", "            if num*2 in seen or (num%2==0 and num//2 in seen):", "                return True", "            seen.add(num)", "        return False"],
    builder: buildSteps1346,
  },
  383: {
    id: 383,
    difficulty: "easy",
    slug: "ransom-note",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    title: { vi: "Ransom Note", en: "Ransom Note" },
    titleVi: { vi: "Thư tống tiền (đếm tần suất)", en: "Ransom note (frequency counter)" },
    statement: { vi: "Có thể tạo ransomNote từ các chữ trong magazine (mỗi chữ dùng 1 lần)? Nhập ransomNote; magazine trong tham số.", en: "Can ransomNote be built from magazine's letters (each used once)? Enter ransomNote; magazine as a parameter." },
    defaultInput: "aa",
    inputKind: "string", inputLabel: { vi: "ransomNote", en: "ransomNote" },
    extraParams: [{ key: "magazine", label: { vi: "magazine", en: "magazine" }, default: "aab" }],
    approach: [
      { vi: "Đếm tần suất chữ trong magazine.", en: "Count letter frequencies in magazine." },
      { vi: "Với mỗi chữ của ransomNote, giảm số lượng tương ứng.", en: "For each ransomNote char, decrement its available count." },
      { vi: "Nếu hết chữ nào đó → không tạo được → False.", en: "If a needed letter runs out → cannot build → False." },
    ],
    complexity: { time: "O(m+n)", space: "O(1)", note: { vi: "Đếm ≤ 26 chữ.", en: "Count over ≤ 26 letters." } },
    code: ["class Solution:", "    def canConstruct(self, ransomNote, magazine):", "        available = Counter(magazine)", "        for ch in ransomNote:", "            if available[ch] <= 0: return False", "            available[ch] -= 1", "        return True"],
    builder: buildSteps383,
  },
  359: {
    id: 359,
    difficulty: "easy",
    slug: "logger-rate-limiter",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    title: { vi: "Logger Rate Limiter", en: "Logger Rate Limiter" },
    titleVi: { vi: "Giới hạn tần suất log (hash map + timestamp)", en: "Logger rate limiter (hash map + timestamp)" },
    statement: { vi: "Mỗi message chỉ được in nếu chưa in trong 10 giây gần nhất. Nhập các lời gọi dạng ts,message ngăn bởi ';'.", en: "A message may print only if not printed in the last 10 seconds. Enter calls as ts,message separated by ';'." },
    defaultInput: "1,foo;2,bar;3,foo;8,bar;10,foo;11,foo",
    inputKind: "string", inputLabel: { vi: "Lời gọi (ts,message; ...)", en: "Calls (ts,message; ...)" }, extraParams: [],
    approach: [
      { vi: "last_printed[message] = thời điểm sớm nhất được in lại (= ts+10).", en: "last_printed[message] = earliest timestamp allowed to reprint (= ts+10)." },
      { vi: "In nếu message chưa từng in HOẶC ts ≥ mốc đã lưu.", en: "Print if the message is new OR ts ≥ the stored mark." },
      { vi: "Khi in, cập nhật mốc = ts + 10.", en: "When printing, update the mark = ts + 10." },
    ],
    complexity: { time: "O(1)/call", space: "O(unique messages)", note: { vi: "Tra cứu hash map O(1).", en: "O(1) hash-map lookups." } },
    code: ["class Logger:", "    def __init__(self): self.last_printed = {}", "    def shouldPrintMessage(self, timestamp, message):", "        if message not in self.last_printed or timestamp >= self.last_printed[message]:", "            self.last_printed[message] = timestamp + 10", "            return True", "        return False"],
    builder: buildSteps359,
  },
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
  560: {
    id: 560,
    difficulty: "medium",
    slug: "subarray-sum-equals-k",
    category: { key: "prefix-sum", vi: "Tổng tiền tố", en: "Prefix Sum" },
    title: { vi: "Subarray Sum Equals K", en: "Subarray Sum Equals K" },
    titleVi: { vi: "Đếm mảng con có tổng bằng K", en: "Count subarrays with sum K" },
    statement: {
      vi: "Cho một mảng số nguyên nums và số nguyên k. Hãy đếm các mảng con liên tiếp, không rỗng có tổng bằng k. Ví dụ nums = [1,1,1], k = 2 thì có [0..1] và [1..2] → đáp án 2.",
      en: "Given an integer array nums and an integer k, count non-empty contiguous subarrays whose sum equals k. Example: nums = [1,1,1], k = 2 has [0..1] and [1..2] → answer 2.",
    },
    defaultInput: [1, 1, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 2, allowNegative: true, min: -2147483648, max: 2147483647 },
    ],
    approach: [
      {
        vi: "Đặt P[i] = nums[0] + ... + nums[i]. Khi đó tổng đoạn nums[l..r] = P[r] - P[l-1], vì phần tổng trước l bị triệt tiêu.",
        en: "Define P[i] = nums[0] + ... + nums[i]. Then sum(nums[l..r]) = P[r] - P[l-1], because the earlier prefix cancels out.",
      },
      {
        vi: "Khi đang ở index i, P[i] đã biết. Muốn đoạn kết thúc tại i có tổng k, ta cần tìm prefix cũ P[j] = P[i] - k.",
        en: "At index i, P[i] is known. For a subarray ending at i to sum to k, find an earlier prefix P[j] = P[i] - k.",
      },
      {
        vi: "Mỗi lần tìm thấy P[j], ta có đúng một đoạn nums[j+1..i]. Vì vậy count[needed] chính là số đoạn mới cần cộng vào res.",
        en: "Each matching P[j] gives exactly one range nums[j+1..i]. Therefore count[needed] is exactly how many new ranges to add to res.",
      },
      {
        vi: "Lưu prefix hiện tại vào count sau khi kiểm tra để không dùng chính nó tạo đoạn rỗng.",
        en: "Store the current prefix in count only after checking, so it cannot form an empty subarray with itself.",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyệt nums một lần và lưu tần suất các tổng tiền tố trong hash map.",
        en: "Scan nums once and store prefix-sum frequencies in a hash map.",
      },
    },
    code: [
      "class Solution:",
      "    def subarraySum(self, nums, k):",
      "        count = defaultdict(int)",
      "        count[0] = 1",
      "        cur = 0",
      "        res = 0",
      "        for num in nums:",
      "            cur += num",
      "            if cur-k in count:",
      "                res += count[cur - k]",
      "            count[cur] += 1",
      "        return res",
    ],
    builder: buildSteps560,
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
    titleVi: { vi: "Truy vấn tổng đoạn bất biến", en: "Immutable range sum query" },
    statement: {
      vi: "Cho mảng nums không thay đổi. Thiết kế NumArray để trả về tổng nums[left..right] nhiều lần.",
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
      { vi: "Xây dựng prefix với prefix[0] = 0.", en: "Build prefix with prefix[0] = 0." },
      { vi: "prefix[i + 1] = prefix[i] + nums[i].", en: "prefix[i + 1] = prefix[i] + nums[i]." },
      { vi: "sumRange(left, right) = prefix[right + 1] - prefix[left].", en: "sumRange(left, right) = prefix[right + 1] - prefix[left]." },
    ],
    complexity: {
      time: "O(n) build, O(1) query",
      space: "O(n)",
      note: {
        vi: "Mỗi query chỉ đọc hai ô prefix.",
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
      "        right_sum = self.prefix[right + 1]",
      "        left_sum = self.prefix[left]",
      "        return right_sum - left_sum",
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
      { vi: "Segment Tree cách 2 dùng mảng 2*n: tree[n+i] là lá ứng với nums[i], tree[i] là tổng hai con.", en: "The second Segment Tree style uses a 2*n array: tree[n+i] is the leaf for nums[i], and tree[i] is the sum of its children." },
      { vi: "update sửa lá index+n rồi đi ngược lên root, tính lại từng node cha.", en: "update changes the leaf index+n, then climbs to the root and recomputes each parent." },
      { vi: "sumRange đưa left/right xuống hàng lá; gặp con phải ở trái hoặc con trái ở phải thì cộng node đó rồi nhảy lên cha.", en: "sumRange moves left/right to leaves; when the left pointer is a right child or the right pointer is a left child, add that node and climb." },
    ],
    complexity: {
      time: "O(n) build, O(log n) update/query",
      space: "O(n)",
      note: {
        vi: "Mỗi lần update hoặc query chỉ đi qua chiều cao của segment tree.",
        en: "Each update or query touches only the height of the segment tree.",
      },
    },
    code: [
      "class NumArray:",
      "    def __init__(self, nums: List[int]):",
      "        self.n = len(nums)",
      "        self.tree = [0] * (2 * self.n)",
      "        for i, num in enumerate(nums):",
      "            self.tree[self.n + i] = num",
      "        for i in range(self.n - 1, 0, -1):",
      "            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]",
      "",
      "    def update(self, index: int, val: int) -> None:",
      "        pos = index + self.n",
      "        self.tree[pos] = val",
      "        while pos > 1:",
      "            pos //= 2",
      "            self.tree[pos] = self.tree[2 * pos] + self.tree[2 * pos + 1]",
      "",
      "    def sumRange(self, left: int, right: int) -> int:",
      "        left += self.n",
      "        right += self.n",
      "        total = 0",
      "        while left <= right:",
      "            if left % 2 == 1:",
      "                total += self.tree[left]",
      "                left += 1",
      "            if right % 2 == 0:",
      "                total += self.tree[right]",
      "                right -= 1",
      "            left //= 2",
      "            right //= 2",
      "        return total",
    ],
    builder: buildSteps307,
  },
  2080: {
    id: 2080,
    difficulty: "medium",
    slug: "range-frequency-queries",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    tags: [
      { key: "binary-search", vi: "Binary Search", en: "Binary Search" },
      { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
    ],
    title: { vi: "Range Frequency Queries", en: "Range Frequency Queries" },
    titleVi: { vi: "Truy vấn tần suất trong đoạn", en: "Range frequency queries" },
    statement: {
      vi: "Thiết kế RangeFreqQuery. Với mỗi query(left, right, value), trả về số lần value xuất hiện trong arr[left..right].",
      en: "Design RangeFreqQuery. For each query(left, right, value), return how many times value appears in arr[left..right].",
    },
    defaultInput: [12, 33, 4, 56, 22, 2, 34, 33, 22, 12, 34, 56],
    inputKind: "integer",
    inputLabel: { vi: "arr", en: "arr" },
    extraParams: [
      { key: "left", type: "number", label: { vi: "left", en: "left" }, default: 1 },
      { key: "right", type: "number", label: { vi: "right", en: "right" }, default: 2 },
      { key: "value", type: "number", label: { vi: "value", en: "value" }, default: 4 },
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Hash Map + Binary Search", en: "Approach 1: Hash Map + Binary Search" } },
        { value: "2", label: { vi: "Cách 2: Segment Tree frequency map", en: "Approach 2: Segment Tree frequency maps" } },
      ] },
    ],
    approach: [
      { vi: "Trong constructor, tạo hashmap value → list các index xuất hiện.", en: "In the constructor, build a hashmap from value to its occurrence indices." },
      { vi: "Các list index đã tăng dần vì ta duyệt arr từ trái sang phải.", en: "Each index list is sorted because arr is scanned left to right." },
      { vi: "Query dùng bisect_left(list, left) và bisect_right(list, right); hiệu hai vị trí là tần suất.", en: "A query uses bisect_left(list, left) and bisect_right(list, right); the difference is the frequency." },
      { vi: "Cách 2: mỗi node Segment Tree lưu frequency map của đoạn; query tách [left, right] thành O(log n) node và cộng count của value.", en: "Approach 2: each Segment Tree node stores a frequency map; a query decomposes [left, right] into O(log n) nodes and sums the count for value." },
    ],
    complexity: {
      time: "C1: O(n) build, O(log k) query · C2: O(n log n) build, O(log n) query",
      space: "C1: O(n) · C2: O(n log n)",
      note: {
        vi: "Cách 1 thường tối ưu hơn cho bài này. Cách 2 minh họa range query tổng quát bằng frequency map ở mỗi node.",
        en: "Approach 1 is usually more efficient here. Approach 2 demonstrates a general range query using a frequency map at each node.",
      },
    },
    code: [
      "from collections import defaultdict",
      "from bisect import bisect_left, bisect_right",
      "",
      "class RangeFreqQuery:",
      "    def __init__(self, arr: List[int]):",
      "        self.pos = defaultdict(list)",
      "        for i, num in enumerate(arr):",
      "            self.pos[num].append(i)",
      "",
      "    def query(self, left: int, right: int, value: int) -> int:",
      "        indices = self.pos[value]",
      "        l = bisect_left(indices, left)",
      "        r = bisect_right(indices, right)",
      "        return r - l",
    ],
    codeLabel: { vi: "Cách 1 · Hash Map + Binary Search", en: "Approach 1 · Hash Map + Binary Search" },
    code2Label: { vi: "Cách 2 · Segment Tree frequency map", en: "Approach 2 · Segment Tree frequency maps" },
    code2: [
      "from collections import Counter",
      "",
      "class RangeFreqQuery:",
      "    def __init__(self, arr: List[int]):",
      "        self.n, self.size = len(arr), 1",
      "        while self.size < self.n:",
      "            self.size *= 2",
      "        self.tree = [Counter() for _ in range(2 * self.size)]",
      "        for index, value in enumerate(arr):",
      "            self.tree[self.size + index][value] = 1",
      "        for node in range(self.size - 1, 0, -1):",
      "            self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]",
      "    def query(self, left: int, right: int, value: int) -> int:",
      "        left += self.size",
      "        right += self.size + 1",
      "        answer = 0",
      "        while left < right:",
      "            if left % 2 == 1:",
      "                answer += self.tree[left][value]",
      "                left += 1",
      "            if right % 2 == 1:",
      "                right -= 1",
      "                answer += self.tree[right][value]",
      "            left //= 2",
      "            right //= 2",
      "        return answer",
    ],
    builder: buildSteps2080,
  },
  2286: {
    id: 2286,
    difficulty: "hard",
    slug: "booking-concert-tickets-in-groups",
    category: { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
    tags: [
      { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
      { key: "binary-search", vi: "Binary Search", en: "Binary Search" },
    ],
    title: { vi: "Booking Concert Tickets in Groups", en: "Booking Concert Tickets in Groups" },
    titleVi: { vi: "Đặt vé concert theo nhóm", en: "Book concert seats for groups" },
    statement: {
      vi: "Thiết kế BookMyShow với n hàng, mỗi hàng m ghế. gather(k, maxRow) cần k ghế liên tiếp trong một hàng <= maxRow; scatter(k, maxRow) cần tổng k ghế bất kỳ trong các hàng <= maxRow.",
      en: "Design BookMyShow with n rows and m seats per row. gather(k, maxRow) needs k consecutive seats in one row <= maxRow; scatter(k, maxRow) needs any k seats across rows <= maxRow.",
    },
    defaultInput: [2, 5],
    inputKind: "positive",
    inputLabel: { vi: "n,m", en: "n,m" },
    extraParams: [{
      key: "operations",
      type: "string",
      label: { vi: "Thao tác (ngăn bằng |)", en: "Operations (separated by |)" },
      default: "gather 4 0 | gather 2 0 | scatter 5 1 | scatter 5 1",
    }],
    approach: [
      { vi: "Mỗi row lưu used[row], nên remaining[row] = m - used[row].", en: "Each row stores used[row], so remaining[row] = m - used[row]." },
      { vi: "Segment Tree lưu max remaining để gather tìm hàng đầu tiên đủ k ghế liên tiếp.", en: "A segment tree stores max remaining seats so gather can find the first row with at least k consecutive seats." },
      { vi: "Segment Tree cũng lưu sum remaining để scatter kiểm tra tổng ghế trống trong 0..maxRow.", en: "The segment tree also stores sum remaining seats so scatter can check total availability in 0..maxRow." },
    ],
    complexity: {
      time: "O(log n) gather, O((r+1) log n) scatter worst-case",
      space: "O(n)",
      note: {
        vi: "gather tìm bằng max tree. scatter kiểm tra tổng O(log n), rồi phân bổ theo các row nhỏ nhất còn ghế; mỗi row cập nhật tree.",
        en: "gather searches using the max tree. scatter checks total in O(log n), then fills the smallest rows with free seats; each touched row updates the tree.",
      },
    },
    code: [
      "class BookMyShow:",
      "    def __init__(self, n: int, m: int):",
      "        self.n = n",
      "        self.m = m",
      "        self.used = [0] * n",
      "        self.first = 0  # leftmost row that still has free seats",
      "        self.seg = SegmentTree([m] * n)",
      "",
      "    def gather(self, k: int, maxRow: int) -> List[int]:",
      "        row = self.seg.first_at_least(k, 0, maxRow)",
      "        if row == -1:",
      "            return []",
      "        start = self.used[row]",
      "        self.used[row] += k",
      "        self.seg.update(row, self.m - self.used[row])",
      "        while self.first < self.n and self.used[self.first] == self.m:",
      "            self.first += 1",
      "        return [row, start]",
      "",
      "    def scatter(self, k: int, maxRow: int) -> bool:",
      "        if self.seg.sum_range(0, maxRow) < k:",
      "            return False",
      "        while k > 0:",
      "            free = self.m - self.used[self.first]",
      "            take = min(k, free)",
      "            self.used[self.first] += take",
      "            k -= take",
      "            self.seg.update(self.first, self.m - self.used[self.first])",
      "            if self.used[self.first] == self.m:",
      "                self.first += 1",
      "        return True",
      "",
      "",
      "class SegmentTree:",
      "    def __init__(self, arr: List[int]):",
      "        self.n = len(arr)",
      "        self.size = 1",
      "        while self.size < self.n:",
      "            self.size *= 2",
      "        self.max_tree = [0] * (2 * self.size)",
      "        self.sum_tree = [0] * (2 * self.size)",
      "        for i in range(self.n):",
      "            self.max_tree[self.size + i] = arr[i]",
      "            self.sum_tree[self.size + i] = arr[i]",
      "        for i in range(self.size - 1, 0, -1):",
      "            self.max_tree[i] = max(self.max_tree[2 * i], self.max_tree[2 * i + 1])",
      "            self.sum_tree[i] = self.sum_tree[2 * i] + self.sum_tree[2 * i + 1]",
      "",
      "    def update(self, idx: int, value: int) -> None:",
      "        i = self.size + idx",
      "        self.max_tree[i] = value",
      "        self.sum_tree[i] = value",
      "        i //= 2",
      "        while i:",
      "            self.max_tree[i] = max(self.max_tree[2 * i], self.max_tree[2 * i + 1])",
      "            self.sum_tree[i] = self.sum_tree[2 * i] + self.sum_tree[2 * i + 1]",
      "            i //= 2",
      "",
      "    def sum_range(self, left: int, right: int) -> int:",
      "        res = 0",
      "        left += self.size",
      "        right += self.size + 1",
      "        while left < right:",
      "            if left & 1:",
      "                res += self.sum_tree[left]; left += 1",
      "            if right & 1:",
      "                right -= 1; res += self.sum_tree[right]",
      "            left //= 2; right //= 2",
      "        return res",
      "",
      "    def first_at_least(self, k: int, lo: int, hi: int) -> int:",
      "        return self._query(1, 0, self.size - 1, lo, hi, k)",
      "",
      "    def _query(self, node, nl, nr, lo, hi, k):",
      "        if nr < lo or hi < nl or self.max_tree[node] < k:",
      "            return -1",
      "        if nl == nr:",
      "            return nl",
      "        mid = (nl + nr) // 2",
      "        left = self._query(2 * node, nl, mid, lo, hi, k)",
      "        if left != -1:",
      "            return left",
      "        return self._query(2 * node + 1, mid + 1, nr, lo, hi, k)",
    ],
    builder: buildSteps2286,
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
    tags: [{ key: "2d-array", vi: "Mảng 2D", en: "2D Array" }],
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

/**
 * LeetCode 380: Insert Delete GetRandom O(1).
 * The visualizer intentionally splits remove() into write-last, update-map,
 * pop, and delete-map frames so the O(1) invariant is visible.
 */
function buildSteps380(input, params) {
  const raw = String(input || "").trim();
  const seed = Number.isInteger(params && params.seed) ? params.seed : 7;
  const operations = raw.split(/\s*[|;]\s*/).filter(Boolean).map((part) => {
    const tokens = part.replace(/[(),]/g, " ").trim().split(/\s+/);
    const name = String(tokens[0] || "").toLowerCase();
    const value = tokens.length > 1 ? Number(tokens[1]) : null;
    const valid = name === "getrandom"
      ? tokens.length === 1
      : (name === "insert" || name === "remove") && tokens.length === 2 && Number.isInteger(value);
    return {
      name,
      value,
      valid,
      raw: part,
      label: name === "getrandom" ? "getRandom()" : `${name}(${tokens[1] ?? "?"})`,
    };
  });
  const commandsValid = operations.length > 0 && operations.every((operation) => operation.valid);
  const values = [];
  const positions = new Map();
  const results = new Array(operations.length).fill(null);
  const steps = [];
  let randomState = (seed >>> 0) || 1;

  const mapEntries = () => [...positions.entries()]
    .map(([value, index]) => ({ value, index }))
    .sort((a, b) => a.index - b.index || a.value - b.value);
  const invariantOk = () => positions.size === values.length
    && values.every((value, index) => positions.get(value) === index);
  const randomIndex = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return Math.floor((randomState / 4294967296) * values.length);
  };

  function snapshot({
    title,
    note,
    codeLines,
    phase,
    activeOpIndex = -1,
    completedOps = 0,
    activeValue = null,
    activeArrayIndex = null,
    lastIndex = null,
    lastValue = null,
    randomPick = null,
    result = null,
    detail = null,
    final = false,
  }) {
    const step = {
      title,
      codeLines,
      randomizedSet380View: {
        phase,
        operations: operations.map((operation) => operation.label),
        activeOpIndex,
        completedOps,
        results: results.slice(),
        values: values.slice(),
        mapEntries: mapEntries(),
        invariantOk: invariantOk(),
        activeValue,
        activeArrayIndex,
        lastIndex,
        lastValue,
        randomPick,
        result,
        detail,
        seed,
      },
      vars: [
        { name: "values", value: `[${values.join(", ")}]` },
        { name: "index", value: `{${mapEntries().map((entry) => `${entry.value}:${entry.index}`).join(", ")}}` },
        { name: "invariant", value: invariantOk() ? "index[values[i]] == i" : "temporarily updating" },
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  if (!commandsValid) {
    snapshot({
      title: { vi: "Operations không hợp lệ", en: "Invalid operations" },
      note: {
        vi: "Dùng cú pháp: insert 1 | remove 1 | getRandom.",
        en: "Use: insert 1 | remove 1 | getRandom.",
      },
      codeLines: [2],
      phase: "invalid",
      detail: { message: "insert value | remove value | getRandom" },
      final: true,
    });
    return { original: raw, answer: null, steps };
  }

  snapshot({
    title: { vi: "Khởi tạo mảng và hashmap rỗng", en: "Initialize an empty array and hash map" },
    note: {
      vi: "values giữ các phần tử dày đặc; index[value] chỉ đúng vị trí của value trong values. Hai cấu trúc phải luôn đồng bộ sau mỗi operation.",
      en: "values stores elements densely; index[value] points to the exact slot in values. Both structures must agree after every operation.",
    },
    codeLines: [3, 4, 5],
    phase: "init",
  });

  operations.forEach((operation, opIndex) => {
    const value = operation.value;
    if (operation.name === "insert") {
      const exists = positions.has(value);
      snapshot({
        title: { vi: `insert(${value}): kiểm tra hashmap`, en: `insert(${value}): check the hash map` },
        note: {
          vi: exists ? `${value} đã có trong index nên không được chèn trùng.` : `${value} chưa có; vị trí mới sẽ là len(values) = ${values.length}.`,
          en: exists ? `${value} is already in index, so duplicates are rejected.` : `${value} is absent; its new slot will be len(values) = ${values.length}.`,
        },
        codeLines: [6, 7],
        phase: exists ? "insert-reject" : "insert-check",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: exists ? positions.get(value) : values.length,
        detail: { exists },
      });
      if (exists) {
        results[opIndex] = false;
        snapshot({
          title: { vi: `insert(${value}) → False`, en: `insert(${value}) → False` },
          note: { vi: "Set không thay đổi.", en: "The set is unchanged." },
          codeLines: [8],
          phase: "return",
          activeOpIndex: opIndex,
          completedOps: opIndex + 1,
          activeValue: value,
          activeArrayIndex: positions.get(value),
          result: false,
        });
        return;
      }

      const newIndex = values.length;
      positions.set(value, newIndex);
      snapshot({
        title: { vi: `index[${value}] = ${newIndex}`, en: `index[${value}] = ${newIndex}` },
        note: {
          vi: "Hashmap đã dành trước vị trí cuối hiện tại; ô values tương ứng sẽ được append ngay ở dòng kế tiếp.",
          en: "The map reserves the current end position; the corresponding values slot is appended on the next line.",
        },
        codeLines: [9],
        phase: "insert-map",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: newIndex,
        detail: { newIndex },
      });
      values.push(value);
      results[opIndex] = true;
      snapshot({
        title: { vi: `Append ${value} vào values[${newIndex}] → True`, en: `Append ${value} to values[${newIndex}] → True` },
        note: {
          vi: "Ô mảng đã xuất hiện đúng nơi hashmap trỏ tới; invariant được khôi phục và insert hoàn tất O(1).",
          en: "The array slot now exists exactly where the map points; the invariant is restored and insert finishes in O(1).",
        },
        codeLines: [10, 11],
        phase: "return",
        activeOpIndex: opIndex,
        completedOps: opIndex + 1,
        activeValue: value,
        activeArrayIndex: newIndex,
        result: true,
      });
      return;
    }

    if (operation.name === "remove") {
      const exists = positions.has(value);
      snapshot({
        title: { vi: `remove(${value}): tìm index`, en: `remove(${value}): locate its index` },
        note: {
          vi: exists ? `Hashmap cho biết ngay ${value} nằm ở values[${positions.get(value)}].` : `${value} không tồn tại nên remove trả về False.`,
          en: exists ? `The map immediately locates ${value} at values[${positions.get(value)}].` : `${value} is absent, so remove returns False.`,
        },
        codeLines: [12, 13],
        phase: exists ? "remove-lookup" : "remove-reject",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: exists ? positions.get(value) : null,
        detail: { exists },
      });
      if (!exists) {
        results[opIndex] = false;
        snapshot({
          title: { vi: `remove(${value}) → False`, en: `remove(${value}) → False` },
          note: { vi: "Không có dữ liệu nào thay đổi.", en: "No data changes." },
          codeLines: [14],
          phase: "return",
          activeOpIndex: opIndex,
          completedOps: opIndex + 1,
          activeValue: value,
          result: false,
        });
        return;
      }

      const removeIndex = positions.get(value);
      const endIndex = values.length - 1;
      const endValue = values[endIndex];
      snapshot({
        title: { vi: `Chuẩn bị xóa ô ${removeIndex}`, en: `Prepare to remove slot ${removeIndex}` },
        note: {
          vi: `Để tránh splice O(n), lấy phần tử cuối ${endValue} ở ô ${endIndex} lấp vào ô ${removeIndex}.`,
          en: `To avoid an O(n) splice, move the last value ${endValue} from slot ${endIndex} into slot ${removeIndex}.`,
        },
        codeLines: [15, 16],
        phase: "remove-plan",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: removeIndex,
        lastIndex: endIndex,
        lastValue: endValue,
        detail: { removeIndex, endIndex, endValue },
      });

      values[removeIndex] = endValue;
      snapshot({
        title: { vi: `values[${removeIndex}] = ${endValue}`, en: `values[${removeIndex}] = ${endValue}` },
        note: {
          vi: removeIndex === endIndex ? "Phần tử cần xóa vốn ở cuối nên phép ghi không đổi hình dạng mảng." : "Giá trị cuối đã được copy vào lỗ trống; tạm thời mảng có hai bản của nó.",
          en: removeIndex === endIndex ? "The removed value is already last, so this write does not visibly move anything." : "The last value fills the hole; the array temporarily contains two copies of it.",
        },
        codeLines: [17],
        phase: "remove-write-last",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: removeIndex,
        lastIndex: endIndex,
        lastValue: endValue,
        detail: { removeIndex, endIndex, endValue },
      });

      positions.set(endValue, removeIndex);
      snapshot({
        title: { vi: `index[${endValue}] = ${removeIndex}`, en: `index[${endValue}] = ${removeIndex}` },
        note: {
          vi: "Cập nhật hashmap của phần tử vừa di chuyển trước khi bỏ ô cuối.",
          en: "Update the moved value's map entry before removing the final slot.",
        },
        codeLines: [18],
        phase: "remove-map-update",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: removeIndex,
        lastIndex: endIndex,
        lastValue: endValue,
        detail: { removeIndex, endIndex, endValue },
      });

      values.pop();
      snapshot({
        title: { vi: "Pop ô cuối trong O(1)", en: "Pop the final slot in O(1)" },
        note: {
          vi: `values giờ còn [${values.join(", ")}]; entry của ${value} sẽ được xóa khỏi hashmap ở dòng kế tiếp.`,
          en: `values is now [${values.join(", ")}]; the map entry for ${value} is deleted next.`,
        },
        codeLines: [19],
        phase: "remove-pop",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: removeIndex,
        lastValue: endValue,
        detail: { removeIndex, endIndex, endValue },
      });

      positions.delete(value);
      results[opIndex] = true;
      snapshot({
        title: { vi: `Xóa index[${value}] → True`, en: `Delete index[${value}] → True` },
        note: {
          vi: "Mảng và hashmap lại khớp hoàn toàn; remove chỉ dùng số thao tác cố định nên là O(1).",
          en: "Array and map agree again; remove used a fixed number of operations, so it is O(1).",
        },
        codeLines: [20, 21],
        phase: "return",
        activeOpIndex: opIndex,
        completedOps: opIndex + 1,
        activeValue: value,
        activeArrayIndex: removeIndex < values.length ? removeIndex : null,
        lastValue: endValue,
        result: true,
      });
      return;
    }

    if (values.length === 0) {
      results[opIndex] = null;
      snapshot({
        title: { vi: "getRandom() khi set rỗng", en: "getRandom() on an empty set" },
        note: {
          vi: "LeetCode đảm bảo getRandom chỉ được gọi khi set không rỗng; operation này được đánh dấu không hợp lệ.",
          en: "LeetCode guarantees getRandom is called only on a non-empty set; this operation is marked invalid.",
        },
        codeLines: [22, 23],
        phase: "random-empty",
        activeOpIndex: opIndex,
        completedOps: opIndex + 1,
        result: null,
      });
      return;
    }

    const pickedIndex = randomIndex();
    const pickedValue = values[pickedIndex];
    results[opIndex] = pickedValue;
    snapshot({
      title: { vi: `getRandom(): chọn index ${pickedIndex} → ${pickedValue}`, en: `getRandom(): pick index ${pickedIndex} → ${pickedValue}` },
      note: {
        vi: `Mảng dày đặc có ${values.length} ô, nên chọn đều một index trong [0, ${values.length - 1}] cũng chính là chọn đều một value. Seed ${seed} chỉ giúp demo lặp lại được.`,
        en: `The dense array has ${values.length} slots, so a uniform index in [0, ${values.length - 1}] is a uniform value. Seed ${seed} only makes the demo reproducible.`,
      },
      codeLines: [22, 23],
      phase: "random-pick",
      activeOpIndex: opIndex,
      completedOps: opIndex + 1,
      activeValue: pickedValue,
      activeArrayIndex: pickedIndex,
      randomPick: { index: pickedIndex, value: pickedValue, length: values.length },
      result: pickedValue,
    });
  });

  snapshot({
    title: { vi: "Hoàn tất mọi operation", en: "All operations complete" },
    note: {
      vi: "values luôn dày đặc và hashmap luôn trỏ ngược về đúng index; đó là lý do cả ba API đạt O(1) trung bình.",
      en: "values stays dense and the map always points back to exact indices; that is why all three APIs are average O(1).",
    },
    codeLines: [23],
    phase: "done",
    activeOpIndex: operations.length,
    completedOps: operations.length,
    final: true,
  });

  return { original: raw, answer: results, steps };
}

/**
 * LeetCode 381: Insert Delete GetRandom O(1) - Duplicates allowed.
 * values keeps every occurrence while indices[value] stores every slot that
 * currently contains that value. remove() traces the full swap-delete update.
 */
function buildSteps381(input, params = {}) {
  const raw = String(input || "").trim();
  const seed = Number.isInteger(params.seed) ? params.seed : 11;
  const operations = raw.split(/\s*[|;]\s*/).filter(Boolean).map((part) => {
    const tokens = part.replace(/[(),]/g, " ").trim().split(/\s+/);
    const name = String(tokens[0] || "").toLowerCase();
    const value = tokens.length > 1 ? Number(tokens[1]) : null;
    const valid = name === "getrandom"
      ? tokens.length === 1
      : (name === "insert" || name === "remove") && tokens.length === 2 && Number.isInteger(value);
    return {
      name,
      value,
      valid,
      label: name === "getrandom" ? "getRandom()" : `${name}(${tokens[1] ?? "?"})`,
    };
  });
  const commandsValid = operations.length > 0 && operations.length <= 16 && operations.every((operation) => operation.valid);
  const values = [];
  const indices = new Map();
  const results = new Array(operations.length).fill(null);
  const steps = [];
  let randomState = (seed >>> 0) || 1;

  const ensureSet = (value) => {
    if (!indices.has(value)) indices.set(value, new Set());
    return indices.get(value);
  };
  const indexEntries = () => [...indices.entries()]
    .map(([value, slots]) => ({ value, indices: [...slots].sort((a, b) => a - b) }))
    .sort((a, b) => a.value - b.value);
  const invariantOk = () => {
    let totalIndices = 0;
    for (const [value, slots] of indices) {
      totalIndices += slots.size;
      for (const index of slots) {
        if (index < 0 || index >= values.length || values[index] !== value) return false;
      }
    }
    if (totalIndices !== values.length) return false;
    return values.every((value, index) => indices.has(value) && indices.get(value).has(index));
  };
  const probabilityEntries = () => {
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    return [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([value, count]) => ({ value, count, total: values.length }));
  };
  const randomIndex = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return Math.floor((randomState / 4294967296) * values.length);
  };

  function snapshot({
    title,
    note,
    codeLines,
    phase,
    activeOpIndex = -1,
    completedOps = 0,
    activeValue = null,
    activeArrayIndex = null,
    lastIndex = null,
    lastValue = null,
    randomPick = null,
    result = null,
    detail = null,
    final = false,
  }) {
    const entries = indexEntries();
    const step = {
      title,
      codeLines,
      randomizedCollection381View: {
        phase,
        operations: operations.map((operation) => operation.label),
        activeOpIndex,
        completedOps,
        results: results.slice(),
        values: values.slice(),
        indexEntries: entries,
        probabilities: probabilityEntries(),
        invariantOk: invariantOk(),
        activeValue,
        activeArrayIndex,
        lastIndex,
        lastValue,
        randomPick,
        result,
        detail,
        seed,
      },
      vars: [
        { name: "values", value: `[${values.join(", ")}]` },
        { name: "indices", value: `{${entries.map((entry) => `${entry.value}:{${entry.indices.join(",")}}`).join(", ")}}` },
        { name: "invariant", value: invariantOk() ? "i in indices[values[i]]" : "temporarily updating" },
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  if (!commandsValid) {
    snapshot({
      title: { vi: "Operations không hợp lệ", en: "Invalid operations" },
      note: {
        vi: "Dùng tối đa 16 thao tác theo cú pháp: insert 1 | remove 1 | getRandom.",
        en: "Use at most 16 operations: insert 1 | remove 1 | getRandom.",
      },
      codeLines: [5],
      phase: "invalid",
      final: true,
    });
    return { original: raw, answer: null, steps };
  }

  snapshot({
    title: { vi: "Khởi tạo RandomizedCollection rỗng", en: "Initialize an empty RandomizedCollection" },
    note: {
      vi: "values lưu mọi occurrence; indices[value] là tập hợp tất cả vị trí đang chứa value.",
      en: "values stores every occurrence; indices[value] is the set of every slot currently containing value.",
    },
    codeLines: [5, 6, 7],
    phase: "init",
  });

  operations.forEach((operation, opIndex) => {
    const value = operation.value;
    if (operation.name === "insert") {
      const slots = ensureSet(value);
      const isNew = slots.size === 0;
      snapshot({
        title: { vi: `insert(${value}): is_new = ${isNew}`, en: `insert(${value}): is_new = ${isNew}` },
        note: {
          vi: isNew ? `${value} chưa có occurrence nào, nhưng vẫn sẽ được append như mọi lần insert.` : `${value} đã tồn tại: vẫn append duplicate, chỉ có giá trị return là False.`,
          en: isNew ? `${value} has no occurrence yet, and will be appended.` : `${value} already exists: append the duplicate anyway, but return False.`,
        },
        codeLines: [9, 10],
        phase: "insert-check",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: values.length,
        detail: { isNew },
      });

      const newIndex = values.length;
      slots.add(newIndex);
      snapshot({
        title: { vi: `indices[${value}].add(${newIndex})`, en: `indices[${value}].add(${newIndex})` },
        note: {
          vi: `Index set đã giữ chỗ ${newIndex}; ô values[${newIndex}] sẽ xuất hiện ở dòng kế tiếp.`,
          en: `The index set reserves slot ${newIndex}; values[${newIndex}] appears on the next line.`,
        },
        codeLines: [11],
        phase: "insert-index",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: newIndex,
        detail: { isNew, newIndex },
      });

      values.push(value);
      results[opIndex] = isNew;
      snapshot({
        title: { vi: `values.append(${value}) → ${isNew}`, en: `values.append(${value}) → ${isNew}` },
        note: {
          vi: `Occurrence mới nằm ở ô ${newIndex}; invariant được khôi phục.`,
          en: `The new occurrence is stored at slot ${newIndex}; the invariant is restored.`,
        },
        codeLines: [12, 13],
        phase: "return",
        activeOpIndex: opIndex,
        completedOps: opIndex + 1,
        activeValue: value,
        activeArrayIndex: newIndex,
        result: isNew,
        detail: { isNew, newIndex },
      });
      return;
    }

    if (operation.name === "remove") {
      const slots = indices.get(value);
      const exists = Boolean(slots && slots.size);
      snapshot({
        title: { vi: `remove(${value}): kiểm tra index set`, en: `remove(${value}): check its index set` },
        note: {
          vi: exists ? `indices[${value}] = {${[...slots].sort((a, b) => a - b).join(", ")}}; chỉ xóa một occurrence.` : `${value} không có occurrence nào nên trả False.`,
          en: exists ? `indices[${value}] = {${[...slots].sort((a, b) => a - b).join(", ")}}; remove only one occurrence.` : `${value} has no occurrence, so return False.`,
        },
        codeLines: [15, 16],
        phase: exists ? "remove-lookup" : "remove-reject",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        detail: { exists },
      });
      if (!exists) {
        results[opIndex] = false;
        snapshot({
          title: { vi: `remove(${value}) → False`, en: `remove(${value}) → False` },
          note: { vi: "Collection không thay đổi.", en: "The collection is unchanged." },
          codeLines: [17],
          phase: "return",
          activeOpIndex: opIndex,
          completedOps: opIndex + 1,
          activeValue: value,
          result: false,
          detail: { exists: false },
        });
        return;
      }

      const removeIndex = Math.min(...slots);
      slots.delete(removeIndex);
      snapshot({
        title: { vi: `Lấy occurrence index ${removeIndex}`, en: `Take occurrence index ${removeIndex}` },
        note: {
          vi: `Python set.pop() có thể lấy bất kỳ index nào; demo chọn index nhỏ nhất để kết quả lặp lại được.`,
          en: `Python set.pop() may take any index; the demo chooses the smallest one for repeatability.`,
        },
        codeLines: [19],
        phase: "remove-take-index",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: removeIndex,
        detail: { exists: true, removeIndex },
      });

      const lastIndex = values.length - 1;
      const lastValue = values[lastIndex];
      snapshot({
        title: { vi: `last = values[${lastIndex}] = ${lastValue}`, en: `last = values[${lastIndex}] = ${lastValue}` },
        note: {
          vi: removeIndex === lastIndex ? "Occurrence cần xóa đang ở cuối, nên không cần swap." : `Di chuyển ${lastValue} từ ô ${lastIndex} vào lỗ ${removeIndex}.`,
          en: removeIndex === lastIndex ? "The removed occurrence is already last, so no swap is needed." : `Move ${lastValue} from slot ${lastIndex} into hole ${removeIndex}.`,
        },
        codeLines: [20, 21],
        phase: "remove-plan",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: removeIndex,
        lastIndex,
        lastValue,
        detail: { removeIndex, lastIndex, needsSwap: removeIndex !== lastIndex },
      });

      if (removeIndex !== lastIndex) {
        values[removeIndex] = lastValue;
        snapshot({
          title: { vi: `values[${removeIndex}] = ${lastValue}`, en: `values[${removeIndex}] = ${lastValue}` },
          note: {
            vi: "Giá trị cuối đã lấp lỗ, nhưng index set của nó vẫn còn trỏ tới ô cuối.",
            en: "The last value fills the hole, but its index set still points to the final slot.",
          },
          codeLines: [23, 24],
          phase: "remove-copy-last",
          activeOpIndex: opIndex,
          completedOps: opIndex,
          activeValue: value,
          activeArrayIndex: removeIndex,
          lastIndex,
          lastValue,
          detail: { removeIndex, lastIndex, needsSwap: true },
        });

        const lastSlots = ensureSet(lastValue);
        lastSlots.delete(lastIndex);
        snapshot({
          title: { vi: `indices[${lastValue}].remove(${lastIndex})`, en: `indices[${lastValue}].remove(${lastIndex})` },
          note: { vi: "Bỏ vị trí cũ của phần tử vừa di chuyển.", en: "Remove the moved value's old slot." },
          codeLines: [25],
          phase: "remove-index-old",
          activeOpIndex: opIndex,
          completedOps: opIndex,
          activeValue: value,
          activeArrayIndex: removeIndex,
          lastIndex,
          lastValue,
          detail: { removeIndex, lastIndex, needsSwap: true },
        });

        lastSlots.add(removeIndex);
        snapshot({
          title: { vi: `indices[${lastValue}].add(${removeIndex})`, en: `indices[${lastValue}].add(${removeIndex})` },
          note: {
            vi: `Index set của ${lastValue} giờ trỏ tới vị trí mới ${removeIndex}.`,
            en: `${lastValue}'s index set now points to its new slot ${removeIndex}.`,
          },
          codeLines: [26],
          phase: "remove-index-new",
          activeOpIndex: opIndex,
          completedOps: opIndex,
          activeValue: value,
          activeArrayIndex: removeIndex,
          lastIndex,
          lastValue,
          detail: { removeIndex, lastIndex, needsSwap: true },
        });
      } else {
        snapshot({
          title: { vi: "Bỏ qua khối swap", en: "Skip the swap block" },
          note: { vi: "remove_index == last_index, nên ba dòng cập nhật phần tử di chuyển không chạy.", en: "remove_index == last_index, so the three moved-value update lines do not run." },
          codeLines: [23],
          phase: "remove-no-swap",
          activeOpIndex: opIndex,
          completedOps: opIndex,
          activeValue: value,
          activeArrayIndex: removeIndex,
          lastIndex,
          lastValue,
          detail: { removeIndex, lastIndex, needsSwap: false },
        });
      }

      values.pop();
      snapshot({
        title: { vi: "values.pop() trong O(1)", en: "values.pop() in O(1)" },
        note: { vi: `Mảng dày đặc còn [${values.join(", ")}].`, en: `The dense array is now [${values.join(", ")}].` },
        codeLines: [28],
        phase: "remove-pop",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        activeValue: value,
        activeArrayIndex: removeIndex < values.length ? removeIndex : null,
        lastIndex,
        lastValue,
        detail: { removeIndex, lastIndex, needsSwap: removeIndex !== lastIndex },
      });

      if (slots.size === 0) {
        indices.delete(value);
        snapshot({
          title: { vi: `del indices[${value}]`, en: `del indices[${value}]` },
          note: { vi: `Không còn occurrence ${value}; xóa key rỗng khỏi hashmap.`, en: `No ${value} occurrence remains; delete the empty hash-map key.` },
          codeLines: [29, 30],
          phase: "remove-clean-key",
          activeOpIndex: opIndex,
          completedOps: opIndex,
          activeValue: value,
          lastValue,
          detail: { removeIndex, lastIndex, keyDeleted: true },
        });
      } else {
        snapshot({
          title: { vi: `Giữ indices[${value}]`, en: `Keep indices[${value}]` },
          note: { vi: `Vẫn còn occurrence tại {${[...slots].sort((a, b) => a - b).join(", ")}}, nên không xóa key.`, en: `Occurrences remain at {${[...slots].sort((a, b) => a - b).join(", ")}}, so keep the key.` },
          codeLines: [29],
          phase: "remove-keep-key",
          activeOpIndex: opIndex,
          completedOps: opIndex,
          activeValue: value,
          lastValue,
          detail: { removeIndex, lastIndex, keyDeleted: false },
        });
      }

      results[opIndex] = true;
      snapshot({
        title: { vi: `remove(${value}) → True`, en: `remove(${value}) → True` },
        note: { vi: "Đúng một occurrence đã bị xóa và invariant được khôi phục.", en: "Exactly one occurrence was removed and the invariant is restored." },
        codeLines: [31],
        phase: "return",
        activeOpIndex: opIndex,
        completedOps: opIndex + 1,
        activeValue: value,
        lastValue,
        result: true,
        detail: { removeIndex, lastIndex },
      });
      return;
    }

    if (values.length === 0) {
      results[opIndex] = null;
      snapshot({
        title: { vi: "getRandom() khi collection rỗng", en: "getRandom() on an empty collection" },
        note: { vi: "LeetCode đảm bảo trường hợp này không xảy ra.", en: "LeetCode guarantees this case does not occur." },
        codeLines: [33, 34],
        phase: "random-empty",
        activeOpIndex: opIndex,
        completedOps: opIndex + 1,
        result: null,
      });
      return;
    }

    const pickedIndex = randomIndex();
    const pickedValue = values[pickedIndex];
    results[opIndex] = pickedValue;
    snapshot({
      title: { vi: `getRandom(): index ${pickedIndex} → ${pickedValue}`, en: `getRandom(): index ${pickedIndex} → ${pickedValue}` },
      note: {
        vi: `Mỗi ô có xác suất 1/${values.length}; vì ${pickedValue} xuất hiện ${values.filter((item) => item === pickedValue).length} lần nên xác suất của value tỷ lệ với số occurrence.`,
        en: `Every slot has probability 1/${values.length}; because ${pickedValue} appears ${values.filter((item) => item === pickedValue).length} times, its probability is proportional to occurrence count.`,
      },
      codeLines: [33, 34],
      phase: "random-pick",
      activeOpIndex: opIndex,
      completedOps: opIndex + 1,
      activeValue: pickedValue,
      activeArrayIndex: pickedIndex,
      randomPick: { index: pickedIndex, value: pickedValue, length: values.length },
      result: pickedValue,
    });
  });

  snapshot({
    title: { vi: "Hoàn tất mọi operation", en: "All operations complete" },
    note: {
      vi: "Mảng dày đặc hỗ trợ random theo occurrence; các index set giúp insert/remove trung bình O(1).",
      en: "The dense array provides occurrence-weighted random picks; index sets keep insert/remove average O(1).",
    },
    codeLines: [34],
    phase: "done",
    activeOpIndex: operations.length,
    completedOps: operations.length,
    final: true,
  });

  return { original: raw, answer: results, steps };
}

Object.assign(module.exports, {
  380: {
    id: 380,
    difficulty: "medium",
    slug: "insert-delete-getrandom-o1",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: { vi: "Insert Delete GetRandom O(1)", en: "Insert Delete GetRandom O(1)" },
    titleVi: { vi: "Thêm, xóa và lấy ngẫu nhiên trong O(1)", en: "Insert, delete, and get random in O(1)" },
    statement: {
      vi: "Thiết kế RandomizedSet hỗ trợ insert(val), remove(val) và getRandom(). Mỗi thao tác phải chạy O(1) trung bình; getRandom trả về mỗi phần tử hiện có với xác suất bằng nhau.",
      en: "Design RandomizedSet with insert(val), remove(val), and getRandom(). Every operation must run in average O(1), and getRandom returns every current element with equal probability.",
    },
    defaultInput: "insert 1 | remove 2 | insert 2 | getRandom | remove 1 | insert 2 | getRandom",
    inputKind: "string",
    inputLabel: { vi: "Operations, ngăn cách bằng |", en: "Operations separated by |" },
    extraParams: [{ key: "seed", label: { vi: "Seed cho demo random", en: "Random demo seed" }, default: 7 }],
    approach: [
      { vi: "Mảng values lưu phần tử liên tục để getRandom chọn một index đều trong O(1).", en: "A dense values array lets getRandom choose a uniform index in O(1)." },
      { vi: "Hashmap index[value] cho biết chính xác vị trí để insert/remove không cần tìm tuyến tính.", en: "The index[value] hash map locates every value without a linear search." },
      { vi: "Khi remove, copy phần tử cuối vào lỗ trống, sửa hashmap rồi pop cuối; không dùng splice O(n).", en: "On remove, copy the last value into the hole, update its map entry, then pop; never use an O(n) splice." },
    ],
    complexity: {
      time: "O(1) average / operation",
      space: "O(n)",
      note: { vi: "Mảng và hashmap cùng lưu tối đa n phần tử.", en: "The array and map each store at most n elements." },
    },
    code: [
      "import random",
      "class RandomizedSet:",
      "    def __init__(self):",
      "        self.values = []",
      "        self.index = {}",
      "    def insert(self, val: int) -> bool:",
      "        if val in self.index:",
      "            return False",
      "        self.index[val] = len(self.values)",
      "        self.values.append(val)",
      "        return True",
      "    def remove(self, val: int) -> bool:",
      "        if val not in self.index:",
      "            return False",
      "        remove_index = self.index[val]",
      "        last = self.values[-1]",
      "        self.values[remove_index] = last",
      "        self.index[last] = remove_index",
      "        self.values.pop()",
      "        del self.index[val]",
      "        return True",
      "    def getRandom(self) -> int:",
      "        return random.choice(self.values)",
    ],
    builder: buildSteps380,
  },
  381: {
    id: 381,
    difficulty: "hard",
    slug: "insert-delete-getrandom-o1-duplicates-allowed",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "design", vi: "Thiết kế", en: "Design" },
      { key: "randomized", vi: "Ngẫu nhiên", en: "Randomized" },
    ],
    title: { vi: "Insert Delete GetRandom O(1) - Duplicates allowed", en: "Insert Delete GetRandom O(1) - Duplicates allowed" },
    titleVi: { vi: "RandomizedCollection cho phép phần tử trùng", en: "RandomizedCollection with duplicate occurrences" },
    statement: {
      vi: "Thiết kế multiset hỗ trợ insert, remove một occurrence và getRandom trong O(1) trung bình. Mỗi occurrence có xác suất được chọn bằng nhau, nên value xuất hiện nhiều lần có xác suất lớn hơn.",
      en: "Design a multiset supporting insert, removal of one occurrence, and getRandom in average O(1). Every occurrence is equally likely, so repeated values have proportionally higher probability.",
    },
    defaultInput: "insert 1 | insert 1 | insert 2 | getRandom | remove 1 | getRandom",
    inputKind: "string",
    inputLabel: { vi: "Operations, ngăn cách bằng |", en: "Operations separated by |" },
    extraParams: [{ key: "seed", label: { vi: "Seed cho demo random", en: "Random demo seed" }, default: 11 }],
    approach: [
      { vi: "values lưu mọi occurrence liên tiếp; getRandom chọn đều một index nên tự động tạo xác suất theo số lần xuất hiện.", en: "values stores every occurrence densely; choosing a uniform index automatically weights values by occurrence count." },
      { vi: "indices[value] là một set chứa mọi index của value, cho phép lấy một occurrence bất kỳ trong O(1) trung bình.", en: "indices[value] is a set of every slot containing value, allowing any occurrence to be found in average O(1)." },
      { vi: "remove dùng swap-delete: đưa phần tử cuối vào lỗ, chuyển index của phần tử đó từ last_index sang remove_index, rồi pop.", en: "remove uses swap-delete: move the final value into the hole, transfer its index from last_index to remove_index, then pop." },
    ],
    complexity: {
      time: "O(1) average / operation",
      space: "O(n)",
      note: { vi: "Mỗi occurrence xuất hiện một lần trong values và đúng một index set.", en: "Every occurrence appears once in values and in exactly one index set." },
    },
    codeLabel: { vi: "Array + Hash Map of Sets", en: "Array + Hash Map of Sets" },
    code: [
      "import random",
      "from collections import defaultdict",
      "",
      "class RandomizedCollection:",
      "    def __init__(self):",
      "        self.values = []",
      "        self.indices = defaultdict(set)",
      "",
      "    def insert(self, val: int) -> bool:",
      "        is_new = not self.indices[val]",
      "        self.indices[val].add(len(self.values))",
      "        self.values.append(val)",
      "        return is_new",
      "",
      "    def remove(self, val: int) -> bool:",
      "        if not self.indices[val]:",
      "            return False",
      "",
      "        remove_index = self.indices[val].pop()",
      "        last_index = len(self.values) - 1",
      "        last_value = self.values[-1]",
      "",
      "        if remove_index != last_index:",
      "            self.values[remove_index] = last_value",
      "            self.indices[last_value].remove(last_index)",
      "            self.indices[last_value].add(remove_index)",
      "",
      "        self.values.pop()",
      "        if not self.indices[val]:",
      "            del self.indices[val]",
      "        return True",
      "",
      "    def getRandom(self) -> int:",
      "        return random.choice(self.values)",
    ],
    builder: buildSteps381,
  },
});

/**
 * LeetCode 149: Max Points on a Line.
 *
 * For every anchor point we reduce each ray to a neighbour into a canonical
 * slope fraction (a, b): divide by gcd, flip signs so b >= 0, collapse the
 * vertical/horizontal special cases. Points sharing one key through the same
 * anchor are collinear, so the answer is max over anchors of the largest
 * bucket (+ duplicates + the anchor itself).
 *
 * Input format: "x,y; x,y; ..." or JSON "[[x,y], ...]", capped at 10 points
 * so every anchor round stays readable.
 */
function gcd149(x, y) {
  let a = Math.abs(x);
  let b = Math.abs(y);
  while (b) { const t = a % b; a = b; b = t; }
  return a || 1;
}

function parsePoints149(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return [];
  const validPair = (pair) => pair.length === 2 && pair.every((v) => Number.isInteger(v) && Math.abs(v) <= 100);
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const pts = parsed.map((row) => Array.isArray(row) ? row.map(Number) : null);
        return pts.every(validPair) ? pts : [];
      }
    } catch (_error) {
      // Fall through to compact parsing.
    }
  }
  return text
    .split(/\s*[;\n|]+\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(",").map((v) => Number(v.trim())))
    .filter(validPair);
}

function buildSteps149(input) {
  const raw = String(input ?? "").trim();
  const points = parsePoints149(raw);
  const steps = [];
  const n = points.length;
  const invalid = raw.length > 0 && (n === 0 || n > 10);

  function snapshot(opts) {
    const step = {
      title: opts.title,
      codeLines: opts.codeLines || [],
      maxPoints149View: {
        event: opts.event,
        points: points.map((pt) => pt.slice()),
        anchorIdx: Number.isInteger(opts.anchorIdx) ? opts.anchorIdx : null,
        scanIdx: Number.isInteger(opts.scanIdx) ? opts.scanIdx : null,
        scanned: (opts.scanned || []).slice(),
        dy: opts.dy != null ? opts.dy : null,
        dx: opts.dx != null ? opts.dx : null,
        g: opts.g != null ? opts.g : null,
        a: opts.a != null ? opts.a : null,
        b: opts.b != null ? opts.b : null,
        key: opts.key != null ? opts.key : null,
        duplicateCount: opts.duplicateCount || 0,
        buckets: (opts.buckets || []).map((bucket) => ({ ...bucket })),
        collinear: (opts.collinear || []).slice(),
        localBest: opts.localBest ? { ...opts.localBest } : null,
        globalBest: opts.globalBest ? { ...opts.globalBest } : null,
        processedAnchors: opts.processedAnchors || 0,
      },
      vars: opts.vars || [],
      note: opts.note,
    };
    if (opts.final) step.final = true;
    steps.push(step);
  }

  if (invalid) {
    snapshot({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      event: "invalid",
      vars: [],
      note: {
        vi: "Nhập tối đa 10 điểm dạng x,y; x,y; ... hoặc [[x,y],...]. Tọa độ là số nguyên trong [-100, 100].",
        en: "Enter up to 10 points as x,y; x,y; ... or [[x,y],...]. Coordinates are integers within [-100, 100].",
      },
      final: true,
    });
    return { original: { points: raw }, answer: null, steps };
  }

  const fmtPt = (idx) => `(${points[idx][0]},${points[idx][1]})`;
  const globalBest = { count: n <= 2 ? n : 1, anchorIdx: n > 0 ? 0 : null, lineKey: null };
  let processedAnchors = 0;
  let winningCollinear = points.map((_, idx) => idx);

  snapshot({
    title: { vi: `Khởi tạo: n = ${n} điểm`, en: `Setup: n = ${n} points` },
    event: "setup",
    codeLines: [6, 7],
    vars: [
      { name: "n", value: n },
      { name: "best", value: n <= 2 ? n : 1 },
    ],
    note: n <= 2
      ? { vi: "Với n ≤ 2 luôn tồn tại một đường thẳng qua mọi điểm nên đáp án là n.", en: "With n ≤ 2 one line always passes through every point, so the answer is n." }
      : { vi: "Chiến lược: mỗi điểm lần lượt làm điểm gốc; phân loại mọi tia đi ra theo hệ số góc đã chuẩn hóa; bucket lớn nhất chính là đường dày nhất qua gốc đó.", en: "Strategy: make each point the anchor; classify every outgoing ray by its reduced slope; the biggest bucket through an anchor is its densest line." },
  });

  if (n <= 2) {
    globalBest.count = n;
    snapshot({
      title: { vi: `n = ${n} ≤ 2 → trả về ${n}`, en: `n = ${n} ≤ 2 → return ${n}` },
      event: "done",
      codeLines: [8],
      vars: [{ name: "answer", value: n }],
      globalBest: { ...globalBest },
      collinear: points.map((_, idx) => idx),
      note: { vi: "Không cần quét slope khi còn ít hơn 3 điểm.", en: "No slope scan is needed with fewer than three points." },
      final: true,
    });
    return { original: { points: raw }, answer: n, steps };
  }

  snapshot({
    title: { vi: "best = 1 (một điểm nào cũng nằm trên một đường)", en: "best = 1 (any single point lies on some line)" },
    event: "init-best",
    codeLines: [9],
    vars: [{ name: "best", value: 1 }],
    globalBest: { ...globalBest },
    note: { vi: "Bắt đầu quét từng điểm làm điểm gốc i.", en: "Start scanning every point as anchor i." },
  });

  for (let i = 0; i < n; i += 1) {
    const slopes = new Map();
    let duplicates = 0;
    const anchorVars = () => [
      { name: "i (gốc)", value: `${i} ${fmtPt(i)}` },
      { name: "duplicates", value: duplicates },
      { name: "buckets", value: slopes.size ? [...slopes.entries()].map(([k, c]) => `${k}×${c}`).join(" | ") : "{}" },
    ];

    snapshot({
      title: { vi: `i = ${i}: điểm gốc ${fmtPt(i)} — reset slopes{{}}`, en: `i = ${i}: anchor ${fmtPt(i)} — reset slopes{}` },
      event: "anchor-start",
      anchorIdx: i,
      processedAnchors: i,
      codeLines: [10, 11, 12],
      vars: anchorVars(),
      note: { vi: "Mỗi vòng i phải bắt đầu với bảng slope trống vì các đường qua gốc khác là các đường khác.", en: "Every anchor round starts with an empty slope table because lines through different anchors are different lines." },
    });

    for (let j = 0; j < n; j += 1) {
      if (j === i) {
        snapshot({
          title: { vi: `j = ${j} trùng gốc → bỏ qua`, en: `j = ${j} is the anchor itself → skip` },
          event: "skip-self",
          anchorIdx: i,
          scanIdx: j,
          processedAnchors: i,
          codeLines: [14, 15],
          vars: anchorVars(),
          note: { vi: "Tia từ một điểm tới chính nó không xác định hướng.", en: "A ray from a point to itself defines no direction." },
        });
        continue;
      }

      const dy = points[j][1] - points[i][1];
      const dx = points[j][0] - points[i][0];

      snapshot({
        title: { vi: `${fmtPt(i)} → ${fmtPt(j)}: dy = ${dy}, dx = ${dx}`, en: `${fmtPt(i)} → ${fmtPt(j)}: dy = ${dy}, dx = ${dx}` },
        event: "deltas",
        anchorIdx: i,
        scanIdx: j,
        scanned: Array.from({ length: j - (j > i ? 1 : 0) }, (_, k) => k).filter((k) => k !== i && k < j),
        dy, dx,
        duplicateCount: duplicates,
        processedAnchors: i,
        buckets: [...slopes.entries()].map(([key, count]) => ({ key, count })),
        codeLines: [16, 17],
        vars: [{ name: "dy", value: dy }, { name: "dx", value: dx }],
        note: { vi: "Vector chỉ phương từ gốc tới điểm j; hai điểm cùng vector tỉ lệ tức cùng đường thẳng.", en: "Direction vector from the anchor to j; proportionate vectors share one straight line." },
      });

      if (dy === 0 && dx === 0) {
        duplicates += 1;
        snapshot({
          title: { vi: `${fmtPt(j)} trùng toạ độ gốc → duplicates = ${duplicates}`, en: `${fmtPt(j)} coincides with the anchor → duplicates = ${duplicates}` },
          event: "duplicate",
          anchorIdx: i,
          scanIdx: j,
          dy, dx,
          duplicateCount: duplicates,
          processedAnchors: i,
          codeLines: [18, 19, 20],
          vars: anchorVars(),
          note: { vi: "Điểm trùng nằm trên mọi đường qua gốc nên được cộng vào kết quả cuối của vòng này.", en: "A coincident point lies on every line through the anchor, so it joins this round's final tally." },
        });
        continue;
      }

      const g = gcd149(dy, dx);
      let a = dy / g;
      let b = dx / g;
      snapshot({
        title: { vi: `gcd(${Math.abs(dy)}, ${Math.abs(dx)}) = ${g} → (${a}, ${b})`, en: `gcd(${Math.abs(dy)}, ${Math.abs(dx)}) = ${g} → (${a}, ${b})` },
        event: "gcd-reduce",
        anchorIdx: i,
        scanIdx: j,
        dy, dx, g, a, b,
        duplicateCount: duplicates,
        processedAnchors: i,
        buckets: [...slopes.entries()].map(([key, count]) => ({ key, count })),
        codeLines: [21, 22],
        vars: [{ name: "g", value: g }, { name: "(a, b)", value: `(${a}, ${b})` }],
        note: { vi: "Chia cả hai cho GCD: (2,4) và (1,2) phải rơi vào cùng bucket.", en: "Divide both by their GCD: (2,4) and (1,2) must land in the same bucket." },
      });

      let canonicalNote;
      if (b < 0) {
        a = -a; b = -b;
        canonicalNote = {
          vi: "b âm → đảo dấu cả hai để (1,−2) và (−1,2) thành cùng một hướng.",
          en: "Negative b → flip both signs so (1,−2) and (−1,2) merge into one direction.",
        };
        snapshot({
          title: { vi: `Chuẩn hoá dấu → (${a}, ${b})`, en: `Canonical sign → (${a}, ${b})` },
          event: "canonical",
          anchorIdx: i,
          scanIdx: j,
          dy, dx, g, a, b,
          key: `${a}/${b}`,
          duplicateCount: duplicates,
          processedAnchors: i,
          codeLines: [23, 24],
          vars: [{ name: "(a, b)", value: `(${a}, ${b})` }],
          note: canonicalNote,
        });
      } else if (b === 0) {
        a = 1; b = 0;
        snapshot({
          title: { vi: "Đường thẳng đứng → (1, 0)", en: "Vertical line → (1, 0)" },
          event: "canonical",
          anchorIdx: i,
          scanIdx: j,
          dy, dx, g: 1, a: 1, b: 0,
          key: "1/0",
          duplicateCount: duplicates,
          processedAnchors: i,
          codeLines: [25, 26],
          vars: [{ name: "(a, b)", value: "(1, 0)" }],
          note: { vi: "dx = 0: mọi điểm cùng hoành độ dùng chung key đứng (1, 0).", en: "dx = 0: all points sharing an x use the vertical key (1, 0)." },
        });
      } else if (a === 0) {
        a = 0; b = 1;
        snapshot({
          title: { vi: "Đường ngang → (0, 1)", en: "Horizontal line → (0, 1)" },
          event: "canonical",
          anchorIdx: i,
          scanIdx: j,
          dy, dx, g: 1, a: 0, b: 1,
          key: "0/1",
          duplicateCount: duplicates,
          processedAnchors: i,
          codeLines: [27, 28],
          vars: [{ name: "(a, b)", value: "(0, 1)" }],
          note: { vi: "dy = 0: ép b về +1 để −0/+0 không tách bucket.", en: "dy = 0: force b to +1 so ±0 does not split the bucket." },
        });
      }

      const key = `${a}/${b}`;
      const newCount = (slopes.get(key) || 0) + 1;
      slopes.set(key, newCount);
      snapshot({
        title: { vi: `slopes["${key}"] = ${newCount}`, en: `slopes["${key}"] = ${newCount}` },
        event: "bucket-add",
        anchorIdx: i,
        scanIdx: j,
        dy, dx, g, a, b, key,
        duplicateCount: duplicates,
        processedAnchors: i,
        buckets: [...slopes.entries()].map(([bk, count]) => ({ key: bk, count })).sort((x, y) => y.count - x.count || x.key.localeCompare(y.key)),
        codeLines: [29, 30],
        vars: anchorVars(),
        note: { vi: `Bucket "${key}" giờ có ${newCount} tia → ${newCount + 1 + duplicates} điểm trên đường đó kể cả gốc.`, en: `Bucket "${key}" now holds ${newCount} rays → ${newCount + 1 + duplicates} points on that line including the anchor.` },
      });
    }

    let bestKey = null;
    let bestCount = 0;
    for (const [key, count] of slopes.entries()) {
      if (count > bestCount) { bestCount = count; bestKey = key; }
    }
    const local = bestCount + duplicates + 1;
    const collinear = bestKey === null ? [i] : [i, ...points.map((_, idx) => idx).filter((idx) => {
      if (idx === i) return false;
      const ddy = points[idx][1] - points[i][1];
      const ddx = points[idx][0] - points[i][0];
      if (ddy === 0 && ddx === 0) return true;
      const gg = gcd149(ddy, ddx);
      let aa = ddy / gg;
      let bb = ddx / gg;
      if (bb < 0) { aa = -aa; bb = -bb; }
      if (bb === 0) { aa = 1; bb = 0; } else if (aa === 0) { bb = 1; }
      return `${aa}/${bb}` === bestKey;
    })];
    const localBest = { key: bestKey, count: local };
    snapshot({
      title: {
        vi: `Gốc ${fmtPt(i)}: đường "${bestKey}" dày nhất → ${local} điểm`,
        en: `Anchor ${fmtPt(i)}: densest line "${bestKey}" → ${local} points`,
      },
      event: "round-best",
      anchorIdx: i,
      collinear,
      localBest,
      globalBest: { ...globalBest },
      duplicateCount: duplicates,
      buckets: [...slopes.entries()].map(([bk, count]) => ({ key: bk, count })).sort((x, y) => y.count - x.count),
      processedAnchors: i + 1,
      codeLines: [31],
      vars: [...anchorVars(), { name: "local", value: local }],
      note: { vi: "Bucket lớn nhất + duplicates + chính gốc = số điểm nhiều nhất trên một đường qua điểm này.", en: "Largest bucket + duplicates + the anchor itself = densest line through this point." },
    });

    if (local > globalBest.count) {
      globalBest.count = local;
      globalBest.anchorIdx = i;
      globalBest.lineKey = bestKey;
      winningCollinear = collinear;
      snapshot({
        title: { vi: `best tăng lên ${local} nhờ gốc ${fmtPt(i)}`, en: `best rises to ${local} thanks to anchor ${fmtPt(i)}` },
        event: "best-update",
        anchorIdx: i,
        collinear,
        localBest,
        globalBest: { ...globalBest },
        processedAnchors: i + 1,
        codeLines: [32],
        vars: [{ name: "best", value: globalBest.count }],
        note: { vi: "Cập nhật kỷ lục toàn cục; các vòng sau chỉ có thể sanh bằng hoặc vượt.", en: "Global record updated; later rounds can only tie or beat it." },
      });
    }
  }

  snapshot({
    title: { vi: `Kết quả: ${globalBest.count} điểm thẳng hàng`, en: `Answer: ${globalBest.count} collinear points` },
    event: "done",
    collinear: winningCollinear,
    globalBest: { ...globalBest },
    processedAnchors: n,
    codeLines: [33],
    vars: [{ name: "return", value: globalBest.count }],
    note: { vi: "Độ phức tạp O(n²) vòng đôi với băm slope; đây cũng là cách truy vết đường thắng.", en: "The O(n²) double loop with slope hashing also reveals the winning line." },
    final: true,
  });

  return { original: { points: raw }, answer: globalBest.count, steps };
}

// ─── Small array / hash-map visualizations ────────────────────────────────
function parseIntegerListSmallHash(value, label) {
  const values = String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map(Number);
  if (!values.length || values.some((value) => !Number.isInteger(value))) {
    throw new Error(`${label} must be a non-empty comma-separated list of integers.`);
  }
  return values;
}

function buildSteps344(input) {
  const original = [...String(input ?? "")];
  if (!original.length || original.length > 18) throw new Error("Use 1 to 18 characters so the swap trace stays readable.");
  const chars = [...original];
  const steps = [];
  const snap = (title, codeLines, note, extra = {}) => steps.push({
    title,
    arr: [...chars],
    highlight: [extra.left, extra.right].filter(Number.isInteger),
    mark: extra.swapped ? [extra.left, extra.right] : [],
    codeLines,
    vars: [
      { name: "left", value: extra.left ?? 0 },
      { name: "right", value: extra.right ?? chars.length - 1 },
    ],
    note,
    final: Boolean(extra.final),
    reverse344View: {
      chars: [...chars],
      left: extra.left ?? 0,
      right: extra.right ?? chars.length - 1,
      phase: extra.phase || "setup",
      swapped: extra.swapped || null,
    },
  });

  let left = 0;
  let right = chars.length - 1;
  snap(
    { vi: "Khởi tạo hai con trỏ", en: "Initialize two pointers" },
    [3],
    { vi: "left ở đầu chuỗi, right ở cuối chuỗi.", en: "left starts at the beginning and right at the end." },
    { left, right, phase: "setup" },
  );
  while (left < right) {
    snap(
      { vi: `Kiểm tra left < right: ${left} < ${right}`, en: `Check left < right: ${left} < ${right}` },
      [4],
      { vi: "Hai con trỏ chưa gặp nhau nên đổi chỗ hai ký tự ở biên.", en: "The pointers have not met, so swap the boundary characters." },
      { left, right, phase: "check" },
    );
    const before = [chars[left], chars[right]];
    [chars[left], chars[right]] = [chars[right], chars[left]];
    snap(
      { vi: `Đổi '${before[0]}' và '${before[1]}'`, en: `Swap '${before[0]}' and '${before[1]}'` },
      [5],
      { vi: `s[${left}] và s[${right}] đã được hoán đổi tại chỗ.`, en: `s[${left}] and s[${right}] have been swapped in place.` },
      { left, right, phase: "swap", swapped: [left, right] },
    );
    left += 1;
    snap(
      { vi: `left += 1 → ${left}`, en: `left += 1 → ${left}` },
      [6],
      { vi: "Bỏ qua ký tự bên trái đã đúng vị trí.", en: "Skip the left character now in its final position." },
      { left, right, phase: "move-left" },
    );
    right -= 1;
    snap(
      { vi: `right -= 1 → ${right}`, en: `right -= 1 → ${right}` },
      [7],
      { vi: "Bỏ qua ký tự bên phải đã đúng vị trí.", en: "Skip the right character now in its final position." },
      { left, right, phase: "move-right" },
    );
  }
  snap(
    { vi: "Hai con trỏ gặp nhau", en: "Pointers have met" },
    [4],
    { vi: "left không còn nhỏ hơn right; mảng ký tự đã đảo ngược.", en: "left is no longer smaller than right; the character array is reversed." },
    { left, right, phase: "done", final: true },
  );
  return { original, answer: chars, steps };
}

function buildSteps349(input, params = {}) {
  const nums1 = parseIntegerListSmallHash(input, "nums1");
  const nums2 = parseIntegerListSmallHash(params.nums2, "nums2");
  if (nums1.length > 12 || nums2.length > 12) throw new Error("Use at most 12 values in each array for the visualization.");
  const seen = new Set(nums1);
  const result = new Set();
  const steps = [];
  const snap = (title, codeLines, note, extra = {}) => steps.push({
    title,
    arr: [...nums2],
    highlight: Number.isInteger(extra.index) ? [extra.index] : [],
    mark: extra.found && Number.isInteger(extra.index) ? [extra.index] : [],
    codeLines,
    vars: [{ name: "seen", value: `{${[...seen].join(", ")}}` }, { name: "result", value: `[${[...result].join(", ")}]` }],
    note,
    final: Boolean(extra.final),
    smallHashView: {
      kind: "unique-intersection",
      nums1: [...nums1], nums2: [...nums2], activeIndex: extra.index ?? -1,
      activeValue: extra.value ?? null, phase: extra.phase || "setup",
      seen: [...seen], result: [...result], found: Boolean(extra.found),
    },
  });

  snap(
    { vi: "Tạo set từ nums1", en: "Build a set from nums1" }, [3],
    { vi: "Set tự loại các phần tử trùng trong nums1.", en: "A set automatically removes duplicates from nums1." },
    { phase: "build" },
  );
  snap(
    { vi: "Khởi tạo result = set()", en: "Initialize result = set()" }, [4],
    { vi: "result cũng là set, nên mỗi giá trị giao nhau chỉ xuất hiện một lần.", en: "result is also a set, so each intersecting value appears only once." },
    { phase: "result-init" },
  );
  nums2.forEach((value, index) => {
    snap(
      { vi: `Duyệt nums2[${index}] = ${value}`, en: `Read nums2[${index}] = ${value}` }, [5],
      { vi: "Xét từng giá trị của nums2.", en: "Inspect each value in nums2." },
      { index, value, phase: "read" },
    );
    const found = seen.has(value);
    snap(
      { vi: `${value} in seen → ${found}`, en: `${value} in seen → ${found}` }, [6],
      found
        ? { vi: `${value} có trong nums1 nên thuộc giao.`, en: `${value} is present in nums1, so it belongs to the intersection.` }
        : { vi: `${value} không có trong nums1 nên bỏ qua.`, en: `${value} is absent from nums1, so skip it.` },
      { index, value, found, phase: "check" },
    );
    if (found) {
      const alreadyPresent = result.has(value);
      result.add(value);
      snap(
        { vi: `result.add(${value})`, en: `result.add(${value})` }, [7],
        alreadyPresent
          ? { vi: `${value} đã có trong result; set giữ đúng một bản sao.`, en: `${value} is already in result; the set keeps one copy.` }
          : { vi: `Thêm ${value} vào result.`, en: `Add ${value} to result.` },
        { index, value, found: !alreadyPresent, phase: "add" },
      );
    }
  });
  snap(
    { vi: "Trả về result", en: "Return result" }, [8],
    { vi: "Đây là giao của hai mảng, không có phần tử lặp.", en: "This is the intersection of both arrays, with no duplicates." },
    { phase: "done", final: true },
  );
  return { original: { nums1, nums2 }, answer: [...result], steps };
}

function buildSteps350(input, params = {}) {
  const nums1 = parseIntegerListSmallHash(input, "nums1");
  const nums2 = parseIntegerListSmallHash(params.nums2, "nums2");
  if (nums1.length > 12 || nums2.length > 12) throw new Error("Use at most 12 values in each array for the visualization.");
  const counts = new Map();
  nums1.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  const result = [];
  const steps = [];
  const countObject = () => Object.fromEntries([...counts.entries()].sort(([left], [right]) => left - right));
  const snap = (title, codeLines, note, extra = {}) => steps.push({
    title,
    arr: [...nums2],
    highlight: Number.isInteger(extra.index) ? [extra.index] : [],
    mark: extra.taken && Number.isInteger(extra.index) ? [extra.index] : [],
    codeLines,
    vars: [{ name: "count", value: JSON.stringify(countObject()) }, { name: "result", value: `[${result.join(", ")}]` }],
    note,
    final: Boolean(extra.final),
    smallHashView: {
      kind: "multiset-intersection",
      nums1: [...nums1], nums2: [...nums2], activeIndex: extra.index ?? -1,
      activeValue: extra.value ?? null, phase: extra.phase || "setup",
      counts: countObject(), result: [...result], taken: Boolean(extra.taken),
    },
  });

  snap(
    { vi: "count = Counter(nums1)", en: "count = Counter(nums1)" }, [5],
    { vi: "Lưu số lần còn có thể dùng của mỗi giá trị trong nums1.", en: "Store how many times each nums1 value remains available." },
    { phase: "count" },
  );
  snap(
    { vi: "Khởi tạo result", en: "Initialize result" }, [6],
    { vi: "result giữ cả các bản sao hợp lệ.", en: "result retains every valid duplicate." },
    { phase: "result-init" },
  );
  nums2.forEach((value, index) => {
    snap(
      { vi: `Duyệt nums2[${index}] = ${value}`, en: `Read nums2[${index}] = ${value}` }, [7],
      { vi: "Kiểm tra một bản sao từ nums2.", en: "Inspect one copy from nums2." },
      { index, value, phase: "read" },
    );
    const available = counts.get(value) || 0;
    const taken = available > 0;
    snap(
      { vi: `count[${value}] > 0 → ${taken}`, en: `count[${value}] > 0 → ${taken}` }, [8],
      taken
        ? { vi: `Còn ${available} bản sao của ${value} trong nums1.`, en: `${available} copy/copies of ${value} remain in nums1.` }
        : { vi: `Không còn bản sao ${value} nào để ghép.`, en: `No ${value} copy remains to match.` },
      { index, value, taken, phase: "check" },
    );
    if (taken) {
      result.push(value);
      snap(
        { vi: `result.append(${value})`, en: `result.append(${value})` }, [9],
        { vi: "Giữ bản sao này trong giao đa tập.", en: "Keep this copy in the multiset intersection." },
        { index, value, taken: true, phase: "append" },
      );
      counts.set(value, available - 1);
      snap(
        { vi: `count[${value}] -= 1`, en: `count[${value}] -= 1` }, [10],
        { vi: "Đã dùng một bản sao nên giảm số lượng còn lại.", en: "One copy was used, so decrement the remaining count." },
        { index, value, taken: true, phase: "decrement" },
      );
    }
  });
  snap(
    { vi: "Trả về result", en: "Return result" }, [11],
    { vi: "Mỗi giá trị xuất hiện bằng min(tần suất ở hai mảng).", en: "Each value appears min(its frequency in the two arrays) times." },
    { phase: "done", final: true },
  );
  return { original: { nums1, nums2 }, answer: result, steps };
}

function buildSteps387(input) {
  const chars = [...String(input ?? "")];
  if (!chars.length || chars.length > 18) throw new Error("Use 1 to 18 characters so the frequency trace stays readable.");
  const counts = new Map();
  chars.forEach((char) => counts.set(char, (counts.get(char) || 0) + 1));
  const steps = [];
  const countObject = () => Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
  const snap = (title, codeLines, note, extra = {}) => steps.push({
    title,
    arr: [...chars],
    highlight: Number.isInteger(extra.index) ? [extra.index] : [],
    mark: extra.unique && Number.isInteger(extra.index) ? [extra.index] : [],
    codeLines,
    vars: [{ name: "count", value: JSON.stringify(countObject()) }, { name: "i", value: extra.index ?? "-" }, { name: "ch", value: extra.char ?? "-" }],
    note,
    final: Boolean(extra.final),
    smallHashView: {
      kind: "first-unique", chars: [...chars], activeIndex: extra.index ?? -1,
      activeValue: extra.char ?? null, phase: extra.phase || "setup", counts: countObject(),
      answer: extra.answer ?? null, unique: Boolean(extra.unique),
    },
  });

  snap(
    { vi: "count = Counter(s)", en: "count = Counter(s)" }, [5],
    { vi: "Đếm toàn bộ ký tự trước để biết ký tự nào xuất hiện đúng một lần.", en: "Count every character first to know which ones occur exactly once." },
    { phase: "count" },
  );
  for (let index = 0; index < chars.length; index++) {
    const char = chars[index];
    snap(
      { vi: `Duyệt i=${index}, ch='${char}'`, en: `Read i=${index}, ch='${char}'` }, [6],
      { vi: "Duyệt lại theo thứ tự gốc của chuỗi.", en: "Scan again in the string's original order." },
      { index, char, phase: "read" },
    );
    const unique = counts.get(char) === 1;
    snap(
      { vi: `count['${char}'] == 1 → ${unique}`, en: `count['${char}'] == 1 → ${unique}` }, [7],
      unique
        ? { vi: `Đây là ký tự duy nhất đầu tiên, tại chỉ số ${index}.`, en: `This is the first unique character, at index ${index}.` }
        : { vi: `'${char}' xuất hiện ${counts.get(char)} lần nên tiếp tục.`, en: `'${char}' appears ${counts.get(char)} times, so continue.` },
      { index, char, unique, phase: "check" },
    );
    if (unique) {
      snap(
        { vi: `return ${index}`, en: `return ${index}` }, [8],
        { vi: "Vì duyệt trái sang phải, đây chính là chỉ số nhỏ nhất hợp lệ.", en: "Because we scan left to right, this is the smallest valid index." },
        { index, char, unique: true, phase: "done", answer: index, final: true },
      );
      return { original: chars.join(""), answer: index, steps };
    }
  }
  snap(
    { vi: "Không có ký tự duy nhất", en: "No unique character exists" }, [9],
    { vi: "Không ký tự nào có tần suất bằng 1.", en: "No character has frequency 1." },
    { phase: "done", answer: -1, final: true },
  );
  return { original: chars.join(""), answer: -1, steps };
}

function buildSteps496(input, params = {}) {
  const nums1 = parseIntegerListSmallHash(input, "nums1");
  const nums2 = parseIntegerListSmallHash(params.nums2, "nums2");
  if (nums1.length > 10 || nums2.length > 14) throw new Error("Use up to 10 nums1 values and 14 nums2 values for the visualization.");
  const nextGreater = new Map();
  const stack = [];
  const steps = [];
  const answer = Array(nums1.length).fill("?");
  const nums2Sub = () => nums2.map((value, index) => `nums2[${index}] = ${value}`);
  const nums1Sub = () => nums1.map((value, index) => `nums1[${index}] = ${value} · ans=${answer[index]}`);
  const mappingText = () => [...nextGreater.entries()].map(([from, to]) => `${from}->${to}`).join(", ") || "empty";
  const stackText = () => `[${stack.map((item) => `${item.value}@${item.index}`).join(", ")}]`;
  const stackItems = () => stack.map((item) => ({ value: item.value, detail: `nums2[${item.index}]` }));
  const snap = ({ title, codeLines, note, phase = "scan", index = -1, value = "", compareIndex = -1, resolved = null, lookupIndex = -1, final = false }) => {
    const readingNums1 = phase === "lookup" || phase === "answer";
    const arr = readingNums1 ? nums1 : nums2;
    const highlight = [];
    if (Number.isInteger(index) && index >= 0) highlight.push(index);
    if (Number.isInteger(compareIndex) && compareIndex >= 0 && !readingNums1) highlight.push(compareIndex);
    if (Number.isInteger(lookupIndex) && lookupIndex >= 0) highlight.push(lookupIndex);
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title,
      arr: [...arr],
      sub: readingNums1 ? nums1Sub() : nums2Sub(),
      highlight,
      mark: resolved ? [resolved.index] : final ? answer.map((item, i) => item !== -1 ? i : -1).filter((i) => i >= 0) : stack.map((item) => item.index),
      codeLines,
      vars: [
        { name: "phase", value: phase },
        { name: "stack", value: stackText() },
        { name: "next_greater", value: `{${mappingText()}}` },
        { name: "answer", value: `[${answer.join(", ")}]` },
      ],
      note,
      final: Boolean(final),
      stackView: {
        title: "Monotonic decreasing stack (nums2 values waiting for next greater)",
        emptyLabel: "no unresolved nums2 value",
        items: stackItems(),
        input: [...nums2],
        current: readingNums1 ? -1 : index,
        inputLabel: "nums2 scan builds value -> next greater map",
        expected: value,
        status: [
          { label: "current nums2 value", value: value || "-" },
          { label: "stack top", value: top ? `${top.value}@${top.index}` : "empty" },
          { label: "resolved map", value: mappingText() },
          { label: "nums1 answer", value: `[${answer.join(", ")}]` },
        ],
      },
    });
  };

  snap({
    title: { vi: "Mục tiêu: tạo map từ nums2 trước", en: "Goal: build a map from nums2 first" },
    codeLines: [3, 4],
    note: {
      vi: "nums1 là subset của nums2. Ta xử lý nums2 một lần để biết mỗi giá trị trỏ tới next greater nào.",
      en: "nums1 is a subset of nums2. Process nums2 once to know each value's next greater value.",
    },
  });
  snap({
    title: { vi: "Stack giảm dần: giá trị nào còn chờ?", en: "Decreasing stack: which values are still waiting?" },
    codeLines: [4],
    note: {
      vi: "Nếu giá trị mới lớn hơn đỉnh stack, nó giải quyết đỉnh stack. Nếu không, giá trị mới cũng phải chờ.",
      en: "If a new value is greater than the stack top, it resolves that top. Otherwise, the new value must wait too.",
    },
  });
  nums2.forEach((value, index) => {
    snap({
      title: { vi: `Đọc nums2[${index}] = ${value}`, en: `Read nums2[${index}] = ${value}` },
      codeLines: [5],
      index,
      value,
      note: {
        vi: `${value} nhìn sang stack: mọi giá trị nhỏ hơn nó ở đỉnh stack sẽ nhận ${value} làm next greater.`,
        en: `${value} looks at the stack: every smaller value on top receives ${value} as its next greater.`,
      },
    });
    while (stack.length && value > stack.at(-1).value) {
      const top = stack.at(-1);
      snap({
        title: { vi: `${value} > ${top.value}: tìm thấy next greater`, en: `${value} > ${top.value}: next greater found` },
        codeLines: [6],
        index,
        value,
        compareIndex: top.index,
        note: {
          vi: `Vì ${value} là phần tử đầu tiên bên phải lớn hơn ${top.value}, ta có thể giải quyết ${top.value}.`,
          en: `Because ${value} is the first greater value to the right of ${top.value}, ${top.value} is resolved.`,
        },
      });
      const resolved = stack.pop();
      nextGreater.set(resolved.value, value);
      snap({
        title: { vi: `map[${resolved.value}] = ${value}`, en: `map[${resolved.value}] = ${value}` },
        codeLines: [7],
        index,
        value,
        resolved,
        note: {
          vi: `Pop ${resolved.value}@${resolved.index} khỏi stack và lưu mapping ${resolved.value} -> ${value}.`,
          en: `Pop ${resolved.value}@${resolved.index} from the stack and store mapping ${resolved.value} -> ${value}.`,
        },
      });
    }
    stack.push({ value, index });
    snap({
      title: { vi: `Push ${value} vào stack`, en: `Push ${value} onto the stack` },
      codeLines: [8],
      index,
      value,
      note: {
        vi: `${value} bây giờ cũng đang chờ một phần tử lớn hơn ở bên phải.`,
        en: `${value} is now also waiting for a greater value to its right.`,
      },
    });
  });
  snap({
    title: { vi: "nums2 đã xử lý xong", en: "nums2 scan is finished" },
    codeLines: [9],
    note: {
      vi: stack.length
        ? `Các giá trị còn trong stack [${stack.map((item) => item.value).join(", ")}] không có phần tử lớn hơn bên phải, nên mặc định là -1.`
        : "Mọi giá trị trong nums2 đều đã được giải quyết.",
      en: stack.length
        ? `Values still in the stack [${stack.map((item) => item.value).join(", ")}] have no greater value to their right, so their default is -1.`
        : "Every value in nums2 has been resolved.",
    },
  });
  nums1.forEach((value, index) => {
    const found = nextGreater.get(value) ?? -1;
    answer[index] = found;
    snap({
      title: { vi: `nums1[${index}] = ${value} -> ${found}`, en: `nums1[${index}] = ${value} -> ${found}` },
      codeLines: [9],
      phase: "lookup",
      lookupIndex: index,
      note: {
        vi: found === -1
          ? `${value} không có trong map, nghĩa là không có next greater trong nums2.`
          : `Tra map thấy ${value} có next greater là ${found}.`,
        en: found === -1
          ? `${value} is not in the map, so it has no next greater value in nums2.`
          : `The map says ${value}'s next greater value is ${found}.`,
      },
    });
  });
  snap({
    title: { vi: `Trả về [${answer.join(", ")}] cho nums1`, en: `Return [${answer.join(", ")}] for nums1` },
    codeLines: [9],
    phase: "answer",
    final: true,
    note: { vi: "Mỗi vị trí trong answer tương ứng cùng vị trí trong nums1.", en: "Each answer position corresponds to the same position in nums1." },
  });
  return { original: { nums1, nums2 }, answer, steps };
}

function buildSteps503(input) {
  const nums = parseIntegerListSmallHash(input, "nums");
  if (nums.length > 14) throw new Error("Use up to 14 numbers for the circular stack visualization.");
  const n = nums.length;
  const answer = Array(n).fill(-1);
  const stack = [];
  const steps = [];

  const stackLabel = () => `[${stack.map((index) => `${index}:${nums[index]}`).join(", ")}]`;
  const answerLabel = () => `[${answer.join(", ")}]`;
  const stackItems = () => stack.map((index) => ({ value: nums[index], detail: `index ${index}` }));
  const sub = () => nums.map((_, index) => `i=${index} · next=${answer[index]}`);

  const snap = (title, codeLines, note, extra = {}) => {
    const realIndex = Number.isInteger(extra.index) ? extra.index : -1;
    const pass = Number.isInteger(extra.pass) ? extra.pass : 0;
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title,
      arr: [...nums],
      sub: sub(),
      highlight: realIndex >= 0 ? [realIndex] : [],
      mark: Number.isInteger(extra.resolvedIndex) ? [extra.resolvedIndex] : (extra.final ? answer.map((value, index) => value !== -1 ? index : -1).filter((index) => index >= 0) : []),
      codeLines,
      vars: [
        { name: "i", value: Number.isInteger(extra.i) ? extra.i : "-" },
        { name: "idx", value: realIndex >= 0 ? realIndex : "-" },
        { name: "pass", value: pass === 0 ? "first" : "second" },
        { name: "stack", value: stackLabel() },
        { name: "answer", value: answerLabel() },
      ],
      note,
      final: Boolean(extra.final),
      stackView: {
        title: "Monotonic decreasing stack (unresolved indices)",
        emptyLabel: "empty stack",
        items: stackItems(),
        input: [...nums],
        current: realIndex,
        inputLabel: "nums scanned twice by i % n",
        expected: realIndex >= 0 ? nums[realIndex] : "",
        status: [
          { label: "circular i", value: Number.isInteger(extra.i) ? extra.i : "-" },
          { label: "idx = i % n", value: realIndex >= 0 ? realIndex : "-" },
          { label: "top unresolved", value: top === null ? "empty" : `${top}:${nums[top]}` },
          { label: "answer", value: answerLabel() },
        ],
      },
    });
  };

  snap(
    { vi: "answer = [-1] * n", en: "answer = [-1] * n" }, [3],
    { vi: "Mặc định mỗi index chưa có phần tử lớn hơn kế tiếp. Nếu không tìm thấy sau 2 vòng, giữ -1.", en: "Every index starts unresolved. If no greater value appears after two passes, it stays -1." },
  );
  snap(
    { vi: "stack = []", en: "stack = []" }, [4],
    { vi: "Stack giữ index chưa tìm được next greater; giá trị trên stack giảm dần.", en: "The stack stores unresolved indices; their values stay decreasing." },
  );

  for (let i = 0; i < 2 * n; i++) {
    const idx = i % n;
    const pass = i < n ? 0 : 1;
    snap(
      { vi: `i=${i}, idx=${idx}, nums[idx]=${nums[idx]}`, en: `i=${i}, idx=${idx}, nums[idx]=${nums[idx]}` }, [5, 6],
      pass === 0
        ? { vi: "Vòng đầu: vừa so sánh, vừa push index mới vào stack.", en: "First pass: compare, then push new indices onto the stack." }
        : { vi: "Vòng hai: chỉ dùng các phần tử đầu mảng để giải quyết index còn chờ.", en: "Second pass: reuse front values only to resolve indices still waiting." },
      { i, index: idx, pass },
    );

    while (stack.length && nums[stack.at(-1)] < nums[idx]) {
      const top = stack.at(-1);
      snap(
        { vi: `${nums[top]} < ${nums[idx]} → pop index ${top}`, en: `${nums[top]} < ${nums[idx]} → pop index ${top}` }, [7],
        { vi: `nums[${idx}] là phần tử lớn hơn đầu tiên gặp được khi đi vòng tròn từ index ${top}.`, en: `nums[${idx}] is the first greater value found while moving circularly from index ${top}.` },
        { i, index: idx, pass },
      );
      const resolved = stack.pop();
      answer[resolved] = nums[idx];
      snap(
        { vi: `answer[${resolved}] = ${nums[idx]}`, en: `answer[${resolved}] = ${nums[idx]}` }, [8],
        { vi: `Ghi kết quả cho index ${resolved}; index này không cần nằm trong stack nữa.`, en: `Record the result for index ${resolved}; it no longer needs to stay in the stack.` },
        { i, index: idx, pass, resolvedIndex: resolved },
      );
    }

    if (i < n) {
      stack.push(idx);
      snap(
        { vi: `push index ${idx}`, en: `push index ${idx}` }, [9, 10],
        { vi: `Index ${idx} vẫn cần chờ phần tử lớn hơn ở bên phải vòng tròn.`, en: `Index ${idx} still waits for a greater value to its circular right.` },
        { i, index: idx, pass },
      );
    } else {
      snap(
        { vi: "Vòng hai không push lại", en: "Do not push during second pass" }, [9],
        { vi: "Nếu push ở vòng hai, ta sẽ lặp vô hạn logic; vòng hai chỉ để giải quyết phần còn lại.", en: "Pushing during the second pass would repeat the logic forever; this pass only resolves leftovers." },
        { i, index: idx, pass },
      );
    }
  }

  snap(
    { vi: `Trả về ${answerLabel()}`, en: `Return ${answerLabel()}` }, [11],
    stack.length
      ? { vi: `Các index còn lại [${stack.join(", ")}] không có phần tử lớn hơn trong toàn bộ vòng tròn.`, en: `Remaining indices [${stack.join(", ")}] have no greater value anywhere around the circle.` }
      : { vi: "Mọi index đã tìm được next greater.", en: "Every index found a next greater value." },
    { i: 2 * n, index: -1, pass: 1, final: true },
  );

  return { original: nums, answer, steps };
}

Object.assign(module.exports, {
  344: {
    id: 344,
    difficulty: "easy",
    slug: "reverse-string",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: { vi: "Reverse String", en: "Reverse String" },
    titleVi: { vi: "Đảo ngược chuỗi tại chỗ", en: "Reverse a string in place" },
    statement: { vi: "Đảo ngược mảng ký tự tại chỗ bằng hai con trỏ.", en: "Reverse a character array in place using two pointers." },
    defaultInput: "hello",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [],
    approach: [
      { vi: "Đặt left ở đầu và right ở cuối mảng ký tự.", en: "Place left at the start and right at the end of the character array." },
      { vi: "Đổi chỗ hai ký tự biên rồi dịch hai con trỏ vào trong.", en: "Swap the boundary characters, then move both pointers inward." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Mỗi ký tự chỉ được đổi chỗ nhiều nhất một lần.", en: "Each character participates in at most one swap." } },
    code: ["class Solution:", "    def reverseString(self, s):", "        left, right = 0, len(s) - 1", "        while left < right:", "            s[left], s[right] = s[right], s[left]", "            left += 1", "            right -= 1"],
    liveArgs: (input) => [[...String(input ?? "")]],
    builder: buildSteps344,
  },
  349: {
    id: 349,
    difficulty: "easy",
    slug: "intersection-of-two-arrays",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }, { key: "hash-set", vi: "Hash Set", en: "Hash Set" }],
    title: { vi: "Intersection of Two Arrays", en: "Intersection of Two Arrays" },
    titleVi: { vi: "Giao của hai mảng", en: "Unique intersection of two arrays" },
    statement: { vi: "Trả về các giá trị xuất hiện ở cả nums1 và nums2; mỗi giá trị chỉ một lần.", en: "Return values present in both nums1 and nums2, with each value appearing once." },
    defaultInput: "1,2,2,1",
    inputKind: "string",
    inputLabel: { vi: "nums1 (cách bởi ,)", en: "nums1 (comma separated)" },
    extraParams: [{ key: "nums2", type: "string", label: { vi: "nums2 (cách bởi ,)", en: "nums2 (comma separated)" }, default: "2,2" }],
    approach: [
      { vi: "Đặt mọi giá trị nums1 vào set để kiểm tra membership O(1) trung bình.", en: "Put nums1 values in a set for average O(1) membership checks." },
      { vi: "Duyệt nums2; nếu giá trị có trong set thì thêm vào result set.", en: "Scan nums2; add values found in the set to a result set." },
    ],
    complexity: { time: "O(m+n)", space: "O(m+n)", note: { vi: "Hai set loại bỏ duplicate tự động.", en: "The two sets automatically remove duplicates." } },
    code: ["class Solution:", "    def intersection(self, nums1, nums2):", "        seen = set(nums1)", "        result = set()", "        for num in nums2:", "            if num in seen:", "                result.add(num)", "        return list(result)"],
    liveArgs: (input, params) => [parseIntegerListSmallHash(input, "nums1"), parseIntegerListSmallHash(params.nums2, "nums2")],
    builder: buildSteps349,
  },
  350: {
    id: 350,
    difficulty: "easy",
    slug: "intersection-of-two-arrays-ii",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }, { key: "frequency-count", vi: "Đếm tần suất", en: "Frequency Count" }],
    title: { vi: "Intersection of Two Arrays II", en: "Intersection of Two Arrays II" },
    titleVi: { vi: "Giao của hai mảng có lặp", en: "Multiset intersection of two arrays" },
    statement: { vi: "Trả về giao của nums1 và nums2, giữ lại số bản sao bằng tần suất nhỏ hơn ở hai mảng.", en: "Return the multiset intersection, retaining each value min(freq1, freq2) times." },
    defaultInput: "4,9,5",
    inputKind: "string",
    inputLabel: { vi: "nums1 (cách bởi ,)", en: "nums1 (comma separated)" },
    extraParams: [{ key: "nums2", type: "string", label: { vi: "nums2 (cách bởi ,)", en: "nums2 (comma separated)" }, default: "9,4,9,8,4" }],
    approach: [
      { vi: "Đếm tần suất từng giá trị của nums1.", en: "Count each nums1 value's frequency." },
      { vi: "Khi nums2 có giá trị còn count dương, thêm nó rồi giảm count.", en: "When a nums2 value still has positive count, append it then decrement the count." },
    ],
    complexity: { time: "O(m+n)", space: "O(m)", note: { vi: "Hash map giữ số bản sao còn dùng được từ nums1.", en: "The hash map holds remaining usable copies from nums1." } },
    code: ["from collections import Counter", "", "class Solution:", "    def intersect(self, nums1, nums2):", "        count = Counter(nums1)", "        result = []", "        for num in nums2:", "            if count[num] > 0:", "                result.append(num)", "                count[num] -= 1", "        return result"],
    liveArgs: (input, params) => [parseIntegerListSmallHash(input, "nums1"), parseIntegerListSmallHash(params.nums2, "nums2")],
    builder: buildSteps350,
  },
  387: {
    id: 387,
    difficulty: "easy",
    slug: "first-unique-character-in-a-string",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }, { key: "frequency-count", vi: "Đếm tần suất", en: "Frequency Count" }],
    title: { vi: "First Unique Character in a String", en: "First Unique Character in a String" },
    titleVi: { vi: "Ký tự duy nhất đầu tiên", en: "First non-repeating character" },
    statement: { vi: "Trả về chỉ số đầu tiên có ký tự xuất hiện đúng một lần, hoặc -1.", en: "Return the first index whose character occurs exactly once, or -1." },
    defaultInput: "loveleetcode",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [],
    approach: [
      { vi: "Đếm tần suất toàn bộ ký tự trong s.", en: "Count every character in s." },
      { vi: "Duyệt lại từ trái sang phải; ký tự đầu tiên có count 1 là đáp án.", en: "Scan left to right again; the first character with count 1 is the answer." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Bảng tần suất ký tự có kích thước giới hạn bởi alphabet.", en: "The character frequency table is bounded by the alphabet." } },
    code: ["from collections import Counter", "", "class Solution:", "    def firstUniqChar(self, s):", "        count = Counter(s)", "        for i, ch in enumerate(s):", "            if count[ch] == 1:", "                return i", "        return -1"],
    liveArgs: (input) => [String(input ?? "")],
    builder: buildSteps387,
  },
  496: {
    id: 496,
    difficulty: "easy",
    slug: "next-greater-element-i",
    category: { key: "stack-queue", vi: "Stack & Queue", en: "Stack & Queue" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }, { key: "monotonic-stack", vi: "Monotonic Stack", en: "Monotonic Stack" }],
    title: { vi: "Next Greater Element I", en: "Next Greater Element I" },
    titleVi: { vi: "Phần tử lớn hơn kế tiếp", en: "Next greater element" },
    statement: { vi: "Với mỗi giá trị trong nums1, tìm phần tử lớn hơn đầu tiên nằm bên phải nó trong nums2, hoặc -1.", en: "For each nums1 value, find its first greater value to the right in nums2, or -1." },
    defaultInput: "4,1,2", inputKind: "string", inputLabel: { vi: "nums1 (cách bởi ,)", en: "nums1 (comma separated)" },
    extraParams: [{ key: "nums2", type: "string", label: { vi: "nums2 (cách bởi ,)", en: "nums2 (comma separated)" }, default: "1,3,4,2" }],
    approach: [
      { vi: "Duyệt nums2 và giữ stack giảm dần gồm các giá trị chưa được giải quyết.", en: "Scan nums2 and keep a decreasing stack of unresolved values." },
      { vi: "Khi num lớn hơn đỉnh stack, nó là next greater của đỉnh đó; pop và lưu mapping.", en: "When num exceeds the stack top, it is that top's next greater value; pop and store the mapping." },
    ],
    complexity: { time: "O(m+n)", space: "O(n)", note: { vi: "Mỗi nums2 value được push và pop nhiều nhất một lần.", en: "Every nums2 value is pushed and popped at most once." } },
    code: ["class Solution:", "    def nextGreaterElement(self, nums1, nums2):", "        next_greater = {}", "        stack = []", "        for num in nums2:", "            while stack and num > stack[-1]:", "                next_greater[stack.pop()] = num", "            stack.append(num)", "        return [next_greater.get(num, -1) for num in nums1]"],
    liveArgs: (input, params) => [parseIntegerListSmallHash(input, "nums1"), parseIntegerListSmallHash(params.nums2, "nums2")],
    builder: buildSteps496,
  },
  503: {
    id: 503,
    difficulty: "medium",
    slug: "next-greater-element-ii",
    category: { key: "stack-queue", vi: "Stack & Queue", en: "Stack & Queue" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }, { key: "monotonic-stack", vi: "Monotonic Stack", en: "Monotonic Stack" }],
    title: { vi: "Next Greater Element II", en: "Next Greater Element II" },
    titleVi: { vi: "Phần tử lớn hơn kế tiếp II", en: "Next greater element II" },
    statement: {
      vi: "Cho mảng tròn nums, với mỗi index tìm phần tử lớn hơn đầu tiên khi đi sang phải theo vòng tròn; nếu không có thì trả về -1.",
      en: "Given a circular array nums, find the first greater element to the right for each index while wrapping around; return -1 if none exists.",
    },
    defaultInput: "1,2,1",
    inputKind: "string",
    inputLabel: { vi: "nums (cách bởi ,)", en: "nums (comma separated)" },
    extraParams: [],
    approach: [
      { vi: "Duyệt 2*n bước và dùng idx = i % n để mô phỏng mảng tròn.", en: "Scan 2*n steps and use idx = i % n to simulate the circular array." },
      { vi: "Stack lưu index chưa có next greater, theo giá trị giảm dần.", en: "The stack stores unresolved indices in decreasing value order." },
      { vi: "Chỉ push index trong vòng đầu; vòng hai chỉ giúp các index còn lại nhìn thấy phần đầu mảng.", en: "Push indices only during the first pass; the second pass only lets leftover indices see the array's front." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: { vi: "Mỗi index được push một lần và pop nhiều nhất một lần; vòng lặp chạy 2n bước.", en: "Each index is pushed once and popped at most once; the loop runs 2n steps." },
    },
    code: [
      "class Solution:",
      "    def nextGreaterElements(self, nums):",
      "        answer = [-1] * len(nums)",
      "        stack = []",
      "        for i in range(2 * len(nums)):",
      "            idx = i % len(nums)",
      "            while stack and nums[stack[-1]] < nums[idx]:",
      "                answer[stack.pop()] = nums[idx]",
      "            if i < len(nums):",
      "                stack.append(idx)",
      "        return answer",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int[] NextGreaterElements(int[] nums) {",
      "        int n = nums.Length;",
      "        int[] answer = Enumerable.Repeat(-1, n).ToArray();",
      "        Stack<int> stack = new Stack<int>();",
      "        for (int i = 0; i < 2 * n; i++) {",
      "            int idx = i % n;",
      "            while (stack.Count > 0 && nums[stack.Peek()] < nums[idx]) {",
      "                answer[stack.Pop()] = nums[idx];",
      "            }",
      "            if (i < n) stack.Push(idx);",
      "        }",
      "        return answer;",
      "    }",
      "}",
    ],
    liveArgs: (input) => [parseIntegerListSmallHash(input, "nums")],
    builder: buildSteps503,
  },
  149: {
    id: 149,
    difficulty: "hard",
    slug: "max-points-on-a-line",
    category: { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    tags: [
      { key: "geometry", vi: "Hình học", en: "Geometry" },
      { key: "math", vi: "Toán", en: "Math" },
    ],
    title: { vi: "Max Points on a Line", en: "Max Points on a Line" },
    titleVi: { vi: "Số điểm nhiều nhất trên một đường thẳng", en: "Find the densest straight line through given points" },
    statement: {
      vi: "Cho các điểm (x, y) trên mặt phẳng. Trả về số điểm nhiều nhất cùng nằm trên một đường thẳng.",
      en: "Given (x, y) points on a plane, return the maximum number of points that lie on one straight line.",
    },
    defaultInput: "1,1;3,2;5,3;4,1;2,3;1,4",
    inputKind: "string",
    inputLabel: { vi: "points (x,y; ...) — tối đa 10 điểm", en: "points (x,y; ...) — up to 10 points" },
    extraParams: [],
    approach: [
      { vi: "Mỗi điểm lần lượt làm gốc; đếm mỗi tia ra bằng slope chuẩn hóa (a, b) sau khi chia GCD và thống nhất dấu.", en: "Rotate each point as the anchor; count every outgoing ray by its reduced slope (a, b) after GCD division and sign normalization." },
      { vi: "Bucket lớn nhất qua mỗi gốc (+ điểm trùng + chính gốc) ứng viên cho đáp án.", en: "The largest bucket through each anchor (+ duplicates + the anchor) is that round's candidate." },
      { vi: "Key đặc biệt: đứng (1, 0), ngang (0, 1); b<0 thì đảo dấu cả cặp để hướng gộp đúng.", en: "Special keys: vertical (1, 0), horizontal (0, 1); negative b flips both signs so directions merge." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n)",
      note: { vi: "Vòng ngoài chọn gốc, vòng trong quét mọi điểm khác; mỗi vòng chỉ giữ tối đa n−1 bucket slope.", en: "Outer loop picks the anchor, inner loop scans all other points; each round keeps at most n−1 slope buckets." },
    },
    code: [
      "from math import gcd",
      "",
      "",
      "class Solution:",
      "    def maxPoints(self, points: list[list[int]]) -> int:",
      "        n = len(points)",
      "        if n <= 2:",
      "            return n",
      "        best = 1",
      "        for i in range(n):",
      "            slopes = {}",
      "            duplicates = 0",
      "            for j in range(n):",
      "                if j == i:",
      "                    continue",
      "                dy = points[j][1] - points[i][1]",
      "                dx = points[j][0] - points[i][0]",
      "                if dy == 0 and dx == 0:",
      "                    duplicates += 1",
      "                    continue",
      "                g = gcd(abs(dy), abs(dx))",
      "                a, b = dy // g, dx // g",
      "                if b < 0:",
      "                    a, b = -a, -b",
      "                if b == 0:",
      "                    a, b = 1, 0",
      "                elif a == 0:",
      "                    a, b = 0, 1",
      "                key = (a, b)",
      "                slopes[key] = slopes.get(key, 0) + 1",
      "            local = (max(slopes.values()) if slopes else 0) + duplicates + 1",
      "            best = max(best, local)",
      "        return best",
    ],
    builder: buildSteps149,
  },
});
