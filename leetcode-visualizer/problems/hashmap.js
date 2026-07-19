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
  const makeView = ({ current = -1, matchStart = -1, matchEnd = -1, matchState = "", status = [] } = {}) => ({
    nums: [...nums],
    prefixSums: [...prefixSums],
    remainders: [...remainders],
    current,
    matchStart,
    matchEnd,
    matchState,
    entries: mapEntries(),
    status,
  });
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
    steps.push({
      title: {
        vi: `Phần dư ${remainder} đã xuất hiện chưa? ${wasSeen ? "Đúng" : "Sai"}`,
        en: `Check ${remainder} in first_seen: ${wasSeen ? "True" : "False"}`,
      },
      codeLines: [8],
      prefixRemainderView: makeView({
        current: i,
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
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    title: { vi: "Subarray Sums Divisible by K", en: "Subarray Sums Divisible by K" },
    titleVi: { vi: "Dem day con co tong chia het cho K", en: "Count subarrays with sums divisible by K" },
    statement: {
      vi: "Cho mang so nguyen nums va so nguyen k. Tra ve so day con lien tiep khong rong co tong chia het cho k.",
      en: "Given an integer array nums and an integer k, return the number of non-empty contiguous subarrays whose sums are divisible by k.",
    },
    defaultInput: [4, 5, 0, -2, -3, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 5, min: 2, max: 10000 },
    ],
    approach: [
      {
        vi: "Neu hai prefix sum co cung remainder modulo k, hieu cua chung chia het cho k.",
        en: "If two prefix sums have the same remainder modulo k, their difference is divisible by k.",
      },
      {
        vi: "remainder_count[r] dem so prefix truoc do co remainder r.",
        en: "remainder_count[r] counts earlier prefixes whose remainder is r.",
      },
      {
        vi: "Tai moi index, cong count cua remainder hien tai vao total, sau do tang count.",
        en: "At each index, add the current remainder frequency to total, then increment that frequency.",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(min(n, k))",
      note: {
        vi: "Duyet nums mot lan; hash map luu tan suat cac prefix remainder.",
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
