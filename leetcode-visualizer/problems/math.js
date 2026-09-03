// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * Generate steps for LeetCode 13: Roman to Integer.
 *
 * Scan left to right:
 *  - If current value < next value → subtract current.
 *  - Else → add current.
 */
function buildSteps13(input) {
  const s = String(input).toUpperCase();
  const roman = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const steps = [];
  const chars = s.split("");
  const values = chars.map((ch) => roman[ch] || 0);
  const contributions = values.map((value, index) => (
    index + 1 < values.length && value < values[index + 1] ? -value : value
  ));
  const processedIndexes = (end) => Array.from({ length: end + 1 }, (_, index) => index);
  const visibleContributions = (end) => values.map((value, index) => (
    index <= end ? contributions[index] : value
  ));

  let result = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4, 5],
    vars: [
      { name: "s", value: s },
      { name: "result", value: 0 },
    ],
    note: {
      vi: `Chuỗi La Mã: "${s}". Giá trị từng ký tự: [${values.join(", ")}]. Duyệt từ trái sang phải.`,
      en: `Roman string: "${s}". Character values: [${values.join(", ")}]. Scan left to right.`,
    },
  });

  for (let i = 0; i < s.length; i++) {
    const cur = values[i];
    const next = i + 1 < s.length ? values[i + 1] : 0;
    const subtract = cur < next;
    const before = result;

    if (subtract) {
      result -= cur;
      steps.push({
        title: { vi: `${before} - ${cur} = ${result}`, en: `${before} - ${cur} = ${result}` },
        arr: visibleContributions(i),
        sub: chars,
        highlight: [i, i + 1],
        mark: processedIndexes(i - 1),
        codeLines: [6, 7, 8],
        vars: [
          { name: "i", value: i },
          { name: "s[i]", value: `${chars[i]} = ${cur}` },
          { name: "s[i+1]", value: `${chars[i + 1]} = ${next}` },
          { name: "before", value: before },
          { name: "contribution", value: -cur },
          { name: "result", value: result },
        ],
        note: {
          vi: `${chars[i]}(${cur}) < ${chars[i + 1]}(${next}) → result -= ${cur}. result = ${result}.`,
          en: `${chars[i]}(${cur}) < ${chars[i + 1]}(${next}) → result -= ${cur}. result = ${result}.`,
        },
      });
    } else {
      result += cur;
      steps.push({
        title: { vi: `${before} + ${cur} = ${result}`, en: `${before} + ${cur} = ${result}` },
        arr: visibleContributions(i),
        sub: chars,
        highlight: [i],
        mark: processedIndexes(i - 1),
        codeLines: [6, 7, 9, 10],
        vars: [
          { name: "i", value: i },
          { name: "s[i]", value: `${chars[i]} = ${cur}` },
          { name: "s[i+1]", value: i + 1 < s.length ? `${chars[i + 1]} = ${next}` : "end" },
          { name: "before", value: before },
          { name: "contribution", value: cur },
          { name: "result", value: result },
        ],
        note: {
          vi: i + 1 < s.length
            ? `${chars[i]}(${cur}) >= ${chars[i + 1]}(${next}) → result += ${cur}. result = ${result}.`
            : `${chars[i]}(${cur}) là ký tự cuối → result += ${cur}. result = ${result}.`,
          en: i + 1 < s.length
            ? `${chars[i]}(${cur}) >= ${chars[i + 1]}(${next}) → result += ${cur}. result = ${result}.`
            : `${chars[i]}(${cur}) is the last character → result += ${cur}. result = ${result}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: `Tổng = ${result}`, en: `Total = ${result}` },
    arr: contributions,
    sub: chars,
    highlight: [],
    mark: processedIndexes(s.length - 1),
    final: true,
    codeLines: [11],
    vars: [
      { name: "expression", value: contributions.map((value) => (value >= 0 ? `+${value}` : String(value))).join(" ").replace(/^\+/, "") },
      { name: "answer", value: result },
    ],
    note: {
      vi: `"${s}" = ${contributions.join(" + ").replace(/\+ -/g, "- ")} = ${result}. Cột âm là ký tự đứng trước giá trị lớn hơn nên phải trừ.`,
      en: `"${s}" = ${contributions.join(" + ").replace(/\+ -/g, "- ")} = ${result}. A negative bar is a symbol before a larger value, so it is subtracted.`,
    },
  });

  return { original: s, answer: result, steps };
}

/**
 * Generate steps for LeetCode 246: Strobogrammatic Number.
 *
 * Two pointers from both ends:
 *  - Check if num[left] has a valid rotated pair.
 *  - Check if the pair matches num[right].
 *  - Move pointers inward until they meet.
 */
function buildSteps246(input) {
  const num = String(input);
  const pairs = { "0": "0", "1": "1", "6": "9", "8": "8", "9": "6" };
  const steps = [];
  const digits = num.split("");
  const digitNums = digits.map(Number);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: digitNums,
    sub: digits,
    highlight: [],
    mark: [],
    codeLines: [2, 3],
    vars: [
      { name: "num", value: num },
      { name: "pairs", value: "0↔0, 1↔1, 6↔9, 8↔8, 9↔6" },
      { name: "left", value: 0 },
      { name: "right", value: num.length - 1 },
    ],
    note: {
      vi: `Kiểm tra "${num}" có phải strobogrammatic không. Dùng 2 con trỏ: left=0, right=${num.length - 1}.`,
      en: `Check if "${num}" is strobogrammatic. Use two pointers: left=0, right=${num.length - 1}.`,
    },
  });

  let left = 0;
  let right = num.length - 1;
  let answer = true;

  while (left <= right) {
    const lChar = num[left];
    const rChar = num[right];

    if (!(lChar in pairs)) {
      answer = false;
      steps.push({
        title: { vi: `'${lChar}' không hợp lệ → False`, en: `'${lChar}' invalid → False` },
        arr: digitNums,
        sub: digits,
        highlight: [left],
        mark: [left],
        final: true,
        codeLines: [4, 5, 6],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "num[left]", value: lChar },
          { name: "valid_digits", value: "0,1,6,8,9" },
          { name: "result", value: false },
        ],
        note: {
          vi: `'${lChar}' không nằm trong tập {0,1,6,8,9} nên không thể xoay 180° → False.`,
          en: `'${lChar}' is not in {0,1,6,8,9} so it cannot be rotated 180° → False.`,
        },
      });
      return { num, answer: false, steps };
    }

    if (pairs[lChar] !== rChar) {
      answer = false;
      steps.push({
        title: { vi: `'${lChar}'↔'${rChar}' không khớp → False`, en: `'${lChar}'↔'${rChar}' mismatch → False` },
        arr: digitNums,
        sub: digits,
        highlight: [left, right],
        mark: [left, right],
        final: true,
        codeLines: [4, 7, 8],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "num[left]", value: lChar },
          { name: "num[right]", value: rChar },
          { name: "expected", value: pairs[lChar] },
          { name: "result", value: false },
        ],
        note: {
          vi: `'${lChar}' xoay 180° thành '${pairs[lChar]}', nhưng num[right]='${rChar}' ≠ '${pairs[lChar]}' → False.`,
          en: `'${lChar}' rotated 180° becomes '${pairs[lChar]}', but num[right]='${rChar}' ≠ '${pairs[lChar]}' → False.`,
        },
      });
      return { num, answer: false, steps };
    }

    // Match
    steps.push({
      title: { vi: `'${lChar}'↔'${rChar}' ✓`, en: `'${lChar}'↔'${rChar}' ✓` },
      arr: digitNums,
      sub: digits,
      highlight: [left, right],
      mark: [],
      codeLines: [4, 7, 9, 10],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "num[left]", value: lChar },
        { name: "num[right]", value: rChar },
        { name: "pairs[left]", value: pairs[lChar] },
      ],
      note: {
        vi: left === right
          ? `Ký tự giữa '${lChar}' xoay 180° vẫn là '${pairs[lChar]}' = '${rChar}' ✓.`
          : `'${lChar}' xoay 180° = '${pairs[lChar]}' khớp với num[${right}]='${rChar}' ✓. Dời con trỏ.`,
        en: left === right
          ? `Middle character '${lChar}' rotated 180° is still '${pairs[lChar]}' = '${rChar}' ✓.`
          : `'${lChar}' rotated 180° = '${pairs[lChar]}' matches num[${right}]='${rChar}' ✓. Move pointers.`,
      },
    });

    left++;
    right--;
  }

  steps.push({
    title: { vi: "Kết quả: True", en: "Result: True" },
    arr: digitNums,
    sub: digits,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [11],
    vars: [{ name: "result", value: true }],
    note: {
      vi: `Tất cả cặp ký tự đều hợp lệ → "${num}" là strobogrammatic → True.`,
      en: `All character pairs are valid → "${num}" is strobogrammatic → True.`,
    },
  });

  return { num, answer: true, steps };
}

/**
 * LeetCode 1291: Sequential Digits.
 * Generate candidates by taking substrings of "123456789".
 */
function buildSteps1291(input, params) {
  const low = Array.isArray(input) ? input[0] : Number(input);
  const high = Number(params.high);
  const digits = "123456789";
  const minLen = String(low).length;
  const maxLen = String(high).length;
  const steps = [];
  const seen = [];
  const accepted = [];
  const acceptedIndices = [];

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "low", value: low },
      { name: "high", value: high },
      { name: "digits", value: digits },
      { name: "ans", value: "[]" },
    ],
    note: {
      vi: `Mọi số sequential digits đều là một substring liên tiếp của "${digits}". Thử độ dài từ ${minLen} đến ${maxLen}.`,
      en: `Every sequential digit number is a contiguous substring of "${digits}". Try lengths from ${minLen} to ${maxLen}.`,
    },
  });

  for (let length = minLen; length <= maxLen; length++) {
    steps.push({
      title: { vi: `Độ dài = ${length}`, en: `Length = ${length}` },
      arr: [...seen],
      highlight: [],
      mark: [...acceptedIndices],
      codeLines: [5],
      vars: [
        { name: "length", value: length },
        { name: "start range", value: `0..${9 - length}` },
        { name: "ans", value: `[${accepted.join(", ")}]` },
      ],
      note: {
        vi: `Tạo các số có ${length} chữ số bằng cách cắt substring độ dài ${length}.`,
        en: `Create ${length}-digit numbers by slicing substrings of length ${length}.`,
      },
    });

    for (let start = 0; start <= 9 - length; start++) {
      steps.push({
        title: { vi: `start = ${start}`, en: `start = ${start}` },
        arr: [...seen],
        highlight: [],
        mark: [...acceptedIndices],
        codeLines: [6],
        vars: [
          { name: "length", value: length },
          { name: "start", value: start },
          { name: "slice", value: `digits[${start}:${start + length}]` },
        ],
        note: {
          vi: `Lấy digits[${start}:${start + length}] = "${digits.slice(start, start + length)}".`,
          en: `Take digits[${start}:${start + length}] = "${digits.slice(start, start + length)}".`,
        },
      });

      const raw = digits.slice(start, start + length);
      const num = Number(raw);
      seen.push(num);
      const idx = seen.length - 1;

      steps.push({
        title: { vi: `num = ${num}`, en: `num = ${num}` },
        arr: [...seen],
        sub: seen.map((_, i) => String(i)),
        highlight: [idx],
        mark: [...acceptedIndices],
        codeLines: [7],
        vars: [
          { name: "raw", value: raw },
          { name: "num", value: num },
        ],
        note: {
          vi: `Chuyển substring "${raw}" thành số ${num}.`,
          en: `Convert substring "${raw}" to number ${num}.`,
        },
      });

      const inRange = low <= num && num <= high;
      steps.push({
        title: {
          vi: inRange ? `${low} <= ${num} <= ${high} ✓` : `${num} ngoài khoảng`,
          en: inRange ? `${low} <= ${num} <= ${high} ✓` : `${num} out of range`,
        },
        arr: [...seen],
        sub: seen.map((_, i) => String(i)),
        highlight: [idx],
        mark: [...acceptedIndices],
        codeLines: [8],
        vars: [
          { name: "low", value: low },
          { name: "num", value: num },
          { name: "high", value: high },
          { name: "in range?", value: inRange },
        ],
        note: {
          vi: inRange
            ? `${num} nằm trong [${low}, ${high}], thêm vào ans.`
            : `${num} không nằm trong [${low}, ${high}], bỏ qua.`,
          en: inRange
            ? `${num} is inside [${low}, ${high}], append it to ans.`
            : `${num} is not inside [${low}, ${high}], skip it.`,
        },
      });

      if (inRange) {
        accepted.push(num);
        acceptedIndices.push(idx);
        steps.push({
          title: { vi: `append(${num})`, en: `append(${num})` },
          arr: [...seen],
          sub: seen.map((_, i) => String(i)),
          highlight: [idx],
          mark: [...acceptedIndices],
          codeLines: [9],
          vars: [
            { name: "num", value: num },
            { name: "ans", value: `[${accepted.join(", ")}]` },
          ],
          note: {
            vi: `ans = [${accepted.join(", ")}].`,
            en: `ans = [${accepted.join(", ")}].`,
          },
        });
      }
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...seen],
    sub: seen.map((_, i) => String(i)),
    highlight: [],
    mark: [...acceptedIndices],
    final: true,
    codeLines: [10],
    vars: [{ name: "answer", value: `[${accepted.join(", ")}]` }],
    note: {
      vi: `Các số sequential digits trong [${low}, ${high}] là [${accepted.join(", ")}].`,
      en: `Sequential digit numbers in [${low}, ${high}] are [${accepted.join(", ")}].`,
    },
  });

  return { low, high, answer: accepted, steps };
}

/**
 * Generate steps for LeetCode 50: Pow(x, n).
 *
 * Fast exponentiation (binary exponentiation):
 *  - If n < 0: x = 1/x, n = -n.
 *  - result = 1.
 *  - Loop: if n is odd then result *= x; x *= x; n = floor(n/2).
 *  - The answer is result.
 */
function buildSteps50(input, params) {
  let x = params.x;
  let n = input[0];
  const steps = [];
  const origX = x;
  const origN = n;

  // Track result history for bar visualization
  const resultHistory = [];
  const labels = [];

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [],
    highlight: [],
    mark: [],
    codeLines: [2, 3],
    vars: [
      { name: "x", value: x },
      { name: "n", value: n },
    ],
    note: {
      vi: `Tính ${x}^${n} bằng lũy thừa nhanh (Binary Exponentiation).`,
      en: `Compute ${x}^${n} using fast exponentiation (Binary Exponentiation).`,
    },
  });

  if (n < 0) {
    x = 1 / x;
    n = -n;
    steps.push({
      title: { vi: "n âm → đảo x", en: "Negative n → invert x" },
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [4, 5],
      vars: [
        { name: "x", value: x },
        { name: "n", value: n },
      ],
      note: {
        vi: `n < 0 nên đổi x = 1/x = ${x}, n = -n = ${n}.`,
        en: `n < 0, so set x = 1/x = ${x}, n = -n = ${n}.`,
      },
    });
  }

  let result = 1;
  let iteration = 0;
  resultHistory.push(result);
  labels.push("init");

  steps.push({
    title: { vi: "Bắt đầu vòng lặp", en: "Start loop" },
    arr: [...resultHistory],
    highlight: [resultHistory.length - 1],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "result", value: result },
      { name: "x", value: x },
      { name: "n", value: n },
      { name: "n (bin)", value: n.toString(2) },
    ],
    note: {
      vi: `result = 1. Lặp: nếu n lẻ thì nhân result với x, rồi bình phương x và chia đôi n.`,
      en: `result = 1. Loop: if n is odd, multiply result by x, then square x and halve n.`,
    },
  });

  while (n > 0) {
    iteration++;
    const nBin = n.toString(2);
    const isOdd = n % 2 === 1;

    if (isOdd) {
      result *= x;
      resultHistory.push(+result.toFixed(10));
      labels.push(`×x`);
      steps.push({
        title: { vi: `Lần ${iteration}: n lẻ → result *= x`, en: `Iter ${iteration}: n odd → result *= x` },
        arr: [...resultHistory],
        highlight: [resultHistory.length - 1],
        mark: [],
        codeLines: [7, 8],
        vars: [
          { name: "n (bin)", value: nBin },
          { name: "n", value: n },
          { name: "n % 2", value: 1 },
          { name: "result", value: +result.toFixed(10) },
          { name: "x", value: +x.toFixed(10) },
        ],
        note: {
          vi: `n=${n} (nhị phân: ${nBin}) là lẻ → result = result × x = ${+result.toFixed(10)}.`,
          en: `n=${n} (binary: ${nBin}) is odd → result = result × x = ${+result.toFixed(10)}.`,
        },
      });
    } else {
      steps.push({
        title: { vi: `Lần ${iteration}: n chẵn → bỏ qua`, en: `Iter ${iteration}: n even → skip` },
        arr: [...resultHistory],
        highlight: [],
        mark: [],
        codeLines: [7],
        vars: [
          { name: "n (bin)", value: nBin },
          { name: "n", value: n },
          { name: "n % 2", value: 0 },
          { name: "result", value: +result.toFixed(10) },
          { name: "x", value: +x.toFixed(10) },
        ],
        note: {
          vi: `n=${n} (nhị phân: ${nBin}) là chẵn → không nhân result.`,
          en: `n=${n} (binary: ${nBin}) is even → do not multiply result.`,
        },
      });
    }

    x *= x;
    n = Math.floor(n / 2);

    steps.push({
      title: { vi: `Bình phương x, chia đôi n`, en: `Square x, halve n` },
      arr: [...resultHistory],
      highlight: [],
      mark: [],
      codeLines: [9, 10],
      vars: [
        { name: "x", value: +x.toFixed(10) },
        { name: "n", value: n },
        { name: "n (bin)", value: n > 0 ? n.toString(2) : "0" },
        { name: "result", value: +result.toFixed(10) },
      ],
      note: {
        vi: `x = x² = ${+x.toFixed(10)}, n = ⌊n/2⌋ = ${n}.`,
        en: `x = x² = ${+x.toFixed(10)}, n = ⌊n/2⌋ = ${n}.`,
      },
    });
  }

  const finalResult = +result.toFixed(10);
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...resultHistory],
    highlight: [],
    mark: [resultHistory.length - 1],
    final: true,
    codeLines: [11],
    vars: [{ name: "answer", value: finalResult }],
    note: {
      vi: `${origX}^${origN} = ${finalResult}.`,
      en: `${origX}^${origN} = ${finalResult}.`,
    },
  });

  return { x: origX, n: origN, answer: finalResult, steps };
}

/**
 * LeetCode 3754: Concatenate Non-Zero Digits and Multiply by Sum I.
 *
 * Given a positive integer n:
 *   1. Sum every digit of n → s.
 *   2. Build x by concatenating the NON-ZERO digits of n in their original
 *      left-to-right order.
 *   3. Return x * s.
 *
 * Example: n = 10203004 → digits [1,0,2,0,3,0,0,4]
 *   s = 1+0+2+0+3+0+0+4 = 10
 *   x = 1234 (drop zeros, keep original order)
 *   answer = 10 * 1234 = 12340
 *
 * The user's Python approach walks digits right-to-left with n%10, so `temp`
 * ends up with non-zero digits in REVERSED order and must be reversed again.
 * We visualize exactly that flow so the animation matches the code.
 */
function buildSteps3754(input) {
  const rawN = Array.isArray(input) ? Number(input[0]) : Number(input);
  const steps = [];

  if (!Number.isFinite(rawN) || rawN <= 0 || !Number.isInteger(rawN)) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "n phải là số nguyên dương.",
        en: "n must be a positive integer.",
      },
    });
    return { original: rawN, answer: 0, steps };
  }

  // Digits left-to-right (for display)
  const digits = String(rawN).split("").map(Number);
  const D = digits.length;

  // Track consumption from the RIGHT (matches the Python n%10 loop)
  const consumed = new Array(D).fill(false);
  let s = 0;
  let temp = 0;   // grows by temp = temp*10 + digit each non-zero digit consumed
  let rev = 0;    // final reversed number (built after the loop)

  function pushDigitStep(opts) {
    const label = opts.label;
    // Bars: use each digit value as bar height (min 1 so zeros still show)
    const arr = digits.map((d) => (d === 0 ? 0.5 : d));
    const sub = digits.map((d, i) => (consumed[i] ? `·` : String(d)));
    steps.push({
      title: opts.title,
      arr,
      sub,
      highlight: opts.highlight || [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: [
        { name: "n (remaining)", value: opts.n },
        { name: "digit = n%10", value: label.digit },
        { name: "sum s", value: s },
        { name: "temp", value: temp },
        ...(opts.extra || []),
      ],
      note: opts.note,
    });
  }

  // ── Intro ───────────────────────────────────────────────
  steps.push({
    title: { vi: "Đầu vào", en: "Input" },
    arr: digits.map((d) => (d === 0 ? 0.5 : d)),
    sub: digits.map(String),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "n", value: rawN },
      { name: "digits", value: `[${digits.join(",")}]` },
      { name: "s", value: 0 },
      { name: "temp", value: 0 },
    ],
    note: {
      vi:
        `n = ${rawN}. Quét từng chữ số từ phải sang trái (n%10):\n` +
        `  s += digit  (cộng vào tổng)\n` +
        `  Nếu digit ≠ 0: temp = temp*10 + digit  (dồn các chữ số khác 0)\n` +
        `Vì quét ngược, temp sẽ đảo ngược so với thứ tự gốc → phải reverse ở cuối.`,
      en:
        `n = ${rawN}. Scan digits right-to-left with n%10:\n` +
        `  s += digit  (accumulate sum)\n` +
        `  If digit ≠ 0: temp = temp*10 + digit  (pack non-zero digits)\n` +
        `Because we scan backwards, temp ends up REVERSED and must be flipped at the end.`,
    },
  });

  // ── Phase 1: consume digits right-to-left ───────────────
  let m = rawN;
  for (let posFromRight = 0; posFromRight < D; posFromRight++) {
    const idxLTR = D - 1 - posFromRight; // index in the left-to-right display
    const digit = m % 10;

    // Update s
    s += digit;

    // Update temp (only for non-zero digits)
    const kept = digit !== 0;
    if (kept) temp = temp * 10 + digit;

    // Mark this digit as consumed
    consumed[idxLTR] = true;
    const nextN = Math.floor(m / 10);

    pushDigitStep({
      title: kept
        ? { vi: `digit = ${digit} (khác 0, giữ)`, en: `digit = ${digit} (non-zero, keep)` }
        : { vi: `digit = ${digit} (là 0, bỏ)`, en: `digit = ${digit} (zero, drop)` },
      n: m,
      label: { digit },
      highlight: [idxLTR],
      codeLines: kept ? [4, 5, 6, 7, 8] : [4, 5, 6, 8],
      note: {
        vi: kept
          ? `n%10 = ${digit}. s += ${digit} → s = ${s}. Vì ${digit} ≠ 0, temp = temp*10 + ${digit} = ${temp}. Tiếp: n = n//10 = ${nextN}.`
          : `n%10 = ${digit}. s += ${digit} → s = ${s}. Vì ${digit} = 0, không thêm vào temp. Tiếp: n = n//10 = ${nextN}.`,
        en: kept
          ? `n%10 = ${digit}. s += ${digit} → s = ${s}. Since ${digit} ≠ 0, temp = temp*10 + ${digit} = ${temp}. Next: n = n//10 = ${nextN}.`
          : `n%10 = ${digit}. s += ${digit} → s = ${s}. Since ${digit} = 0, skip temp. Next: n = n//10 = ${nextN}.`,
      },
    });

    m = nextN;
  }

  // ── Phase 2: reverse temp → rev ─────────────────────────
  let t = temp;
  const reverseFrames = [];
  while (t > 0) {
    const last = t % 10;
    rev = rev * 10 + last;
    t = Math.floor(t / 10);
    reverseFrames.push({ last, rev, t });
  }

  // Show a compact "reverse" step (or none if temp === 0)
  if (temp === 0) {
    steps.push({
      title: { vi: "Không có chữ số khác 0", en: "No non-zero digits" },
      arr: digits.map((d) => (d === 0 ? 0.5 : d)),
      sub: digits.map(String),
      highlight: [],
      mark: [],
      codeLines: [10, 11, 12],
      vars: [
        { name: "s", value: s },
        { name: "temp", value: 0 },
        { name: "rev", value: 0 },
      ],
      note: {
        vi: `Không có digit khác 0 → rev = 0.`,
        en: `No non-zero digits → rev = 0.`,
      },
    });
  } else {
    // One combined step showing the reversal
    steps.push({
      title: { vi: `Reverse temp → rev`, en: `Reverse temp → rev` },
      arr: digits.map((d) => (d === 0 ? 0.5 : d)),
      sub: digits.map(String),
      highlight: [],
      mark: [],
      codeLines: [10, 11, 12],
      vars: [
        { name: "temp (before reverse)", value: temp },
        { name: "rev (after reverse)", value: rev },
        { name: "steps taken", value: reverseFrames.length },
      ],
      note: {
        vi:
          `Reverse temp = ${temp} thành rev = ${rev} bằng vòng lặp:\n` +
          `  rev = rev*10 + temp%10; temp //= 10.\n` +
          `Kết quả: rev = ${rev} (đúng bằng các chữ số khác 0 của n theo thứ tự gốc trái → phải).`,
        en:
          `Reverse temp = ${temp} into rev = ${rev} via the loop:\n` +
          `  rev = rev*10 + temp%10; temp //= 10.\n` +
          `Result: rev = ${rev} (exactly the non-zero digits of n in original left-to-right order).`,
      },
    });
  }

  // ── Final ───────────────────────────────────────────────
  const answer = s * rev;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: digits.map((d) => (d === 0 ? 0.5 : d)),
    sub: digits.map(String),
    highlight: [],
    mark: digits.map((d, i) => (d !== 0 ? i : -1)).filter((i) => i >= 0),
    final: true,
    codeLines: [13, 14],
    vars: [
      { name: "s (sum of digits)", value: s },
      { name: "rev (non-zero digits)", value: rev },
      { name: "answer = s × rev", value: answer },
    ],
    note: {
      vi: `answer = s × rev = ${s} × ${rev} = ${answer}. (Các chữ số khác 0 được đánh dấu xanh.)`,
      en: `answer = s × rev = ${s} × ${rev} = ${answer}. (Non-zero digits highlighted in green.)`,
    },
  });

  return { original: rawN, answer, steps };
}

/**
 * LeetCode 3756: Concatenate Non-Zero Digits and Multiply by Sum II.
 *
 * Given string s and queries [l, r]:
 *   - Extract substring s[l..r].
 *   - Form x by concatenating non-zero digits (in order). If none, x = 0.
 *   - sum = digit sum of x.
 *   - answer[i] = x * sum mod 10^9+7.
 *
 * Visualization: show the string with each query highlighting the substring,
 * then stepping through forming x, computing sum, and the multiplication.
 */
function buildSteps3756(input, params) {
  const s = String(input || "");
  const MOD = 1_000_000_007;
  const queriesRaw = String(params.queries || "").split(";").map((q) => q.trim()).filter(Boolean)
    .map((q) => q.split(",").map(Number));
  const steps = [];

  // Show the string
  const digits = s.split("");
  steps.push({
    title: { vi: "Chuỗi đầu vào", en: "Input string" },
    arr: digits.map((d) => Number(d) || 0.5),
    sub: digits,
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "s", value: s },
      { name: "queries", value: queriesRaw.length },
    ],
    note: {
      vi: `Chuỗi s = "${s}" (${s.length} ký tự). Có ${queriesRaw.length} truy vấn.`,
      en: `String s = "${s}" (${s.length} chars). ${queriesRaw.length} queries.`,
    },
  });

  const answers = [];
  for (let qi = 0; qi < queriesRaw.length; qi++) {
    const [l, r] = queriesRaw[qi];
    const sub = s.slice(l, r + 1);
    const nonZero = sub.split("").filter((c) => c !== "0").join("");
    const x = nonZero.length > 0 ? BigInt(nonZero) : 0n;
    const digitSum = nonZero.split("").reduce((acc, c) => acc + Number(c), 0);
    const result = Number((x * BigInt(digitSum)) % BigInt(MOD));
    answers.push(result);

    // Highlight the substring range
    const hlRange = Array.from({ length: r - l + 1 }, (_, k) => l + k);

    steps.push({
      title: { vi: `Query ${qi + 1}: [${l}, ${r}]`, en: `Query ${qi + 1}: [${l}, ${r}]` },
      arr: digits.map((d) => Number(d) || 0.5),
      sub: digits,
      highlight: hlRange,
      mark: [],
      codeLines: [5, 6, 7, 8, 9],
      vars: [
        { name: "query", value: `[${l}, ${r}]` },
        { name: "substring", value: `"${sub}"` },
        { name: "non-zero digits", value: nonZero || "(none)" },
        { name: "x", value: x.toString() },
        { name: "digit sum of x", value: digitSum },
        { name: "x × sum", value: `${x} × ${digitSum} = ${(x * BigInt(digitSum)).toString()}` },
        { name: "answer (mod)", value: result },
      ],
      note: {
        vi:
          `s[${l}..${r}] = "${sub}". Chữ số khác 0: "${nonZero}" → x = ${x}. ` +
          `sum = ${nonZero.split("").join("+")} = ${digitSum}. ` +
          `x × sum = ${x} × ${digitSum} = ${(x * BigInt(digitSum)).toString()}` +
          (x * BigInt(digitSum) >= BigInt(MOD) ? ` mod 10⁹+7 = ${result}.` : `.`),
        en:
          `s[${l}..${r}] = "${sub}". Non-zero digits: "${nonZero}" → x = ${x}. ` +
          `sum = ${nonZero.split("").join("+")} = ${digitSum}. ` +
          `x × sum = ${x} × ${digitSum} = ${(x * BigInt(digitSum)).toString()}` +
          (x * BigInt(digitSum) >= BigInt(MOD) ? ` mod 10⁹+7 = ${result}.` : `.`),
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: digits.map((d) => Number(d) || 0.5),
    sub: digits,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [10],
    vars: [
      { name: "answers", value: `[${answers.join(", ")}]` },
    ],
    note: {
      vi: `Kết quả: [${answers.join(", ")}].`,
      en: `Result: [${answers.join(", ")}].`,
    },
  });

  return { original: s, answer: answers, steps };
}

/**
 * LeetCode 2470: Number of Subarrays With LCM Equal to K.
 * Enumerate every start index and extend the subarray while maintaining LCM.
 */
function buildSteps2470(nums, params) {
  const k = Number(params && params.k !== undefined ? params.k : 6);
  const steps = [];

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a;
  }

  function lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs((a / gcd(a, b)) * b);
  }

  let answer = 0;

  steps.push({
    title: { vi: "Khoi tao", en: "Initialize" },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "k", value: k },
      { name: "answer", value: answer },
    ],
    note: {
      vi: "Thu moi subarray nums[i..j], cap nhat LCM dan khi j tang.",
      en: "Try every subarray nums[i..j], updating the LCM as j expands.",
    },
  });

  for (let i = 0; i < nums.length; i++) {
    let curLcm = 1;
    steps.push({
      title: { vi: `Start i=${i}`, en: `Start i=${i}` },
      arr: [...nums],
      sub: nums.map((_, idx) => `[${idx}]`),
      highlight: [i],
      mark: [],
      codeLines: [4, 5],
      vars: [
        { name: "i", value: i },
        { name: "cur_lcm", value: curLcm },
        { name: "answer", value: answer },
      ],
      note: {
        vi: `Bat dau subarray moi tai i=${i}.`,
        en: `Start a new subarray at i=${i}.`,
      },
    });

    for (let j = i; j < nums.length; j++) {
      const prevLcm = curLcm;
      const g = gcd(curLcm, nums[j]);
      curLcm = lcm(curLcm, nums[j]);
      const range = Array.from({ length: j - i + 1 }, (_, idx) => i + idx);

      steps.push({
        title: { vi: `j=${j}: lcm(${prevLcm}, ${nums[j]}) = ${curLcm}`, en: `j=${j}: lcm(${prevLcm}, ${nums[j]}) = ${curLcm}` },
        arr: [...nums],
        sub: nums.map((_, idx) => `[${idx}]`),
        highlight: range,
        mark: [j],
        codeLines: [6, 7],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "nums[j]", value: nums[j] },
          { name: "gcd", value: g },
          { name: "cur_lcm", value: curLcm },
          { name: "subarray", value: `[${nums.slice(i, j + 1).join(", ")}]` },
        ],
        note: {
          vi: `LCM hien tai = prev_lcm / gcd(prev_lcm, nums[j]) * nums[j] = ${prevLcm} / ${g} * ${nums[j]} = ${curLcm}.`,
          en: `Current LCM = prev_lcm / gcd(prev_lcm, nums[j]) * nums[j] = ${prevLcm} / ${g} * ${nums[j]} = ${curLcm}.`,
        },
      });

      if (curLcm === k) {
        answer += 1;
        steps.push({
          title: { vi: `LCM == k -> answer = ${answer}`, en: `LCM == k -> answer = ${answer}` },
          arr: [...nums],
          sub: nums.map((_, idx) => `[${idx}]`),
          highlight: range,
          mark: range,
          codeLines: [8, 9],
          vars: [
            { name: "subarray", value: `[${nums.slice(i, j + 1).join(", ")}]` },
            { name: "cur_lcm", value: curLcm },
            { name: "k", value: k },
            { name: "answer", value: answer },
          ],
          note: {
            vi: `Subarray nums[${i}..${j}] co LCM dung bang k=${k}, dem them 1.`,
            en: `Subarray nums[${i}..${j}] has LCM equal to k=${k}, count it.`,
          },
        });
      }

      if (curLcm > k || k % curLcm !== 0) {
        steps.push({
          title: { vi: "Dung som", en: "Break early" },
          arr: [...nums],
          sub: nums.map((_, idx) => `[${idx}]`),
          highlight: range,
          mark: [],
          codeLines: [10, 11],
          vars: [
            { name: "cur_lcm", value: curLcm },
            { name: "k", value: k },
            { name: "reason", value: curLcm > k ? "cur_lcm > k" : "k % cur_lcm != 0" },
          ],
          note: {
            vi: curLcm > k
              ? "LCM chi co the giu nguyen hoac tang khi them phan tu, nen neu da lon hon k thi dung."
              : "LCM hien tai khong chia het k, them phan tu ve sau se khong the quay ve dung k.",
            en: curLcm > k
              ? "LCM can only stay the same or increase as we add elements, so once it is greater than k we stop."
              : "The current LCM does not divide k, so extending this subarray cannot make it exactly k.",
          },
        });
        break;
      }
    }
  }

  steps.push({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [12],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Co ${answer} subarray co LCM bang ${k}.`,
      en: `There are ${answer} subarray(s) with LCM equal to ${k}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 3867: Sum of GCD of Formed Pairs.
 * Build prefixGcd, sort it, then pair smallest with largest.
 */
function buildSteps3867(nums) {
  const steps = [];
  const prefixGcd = [];

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a;
  }

  function vars(extra = []) {
    return [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "prefixGcd", value: `[${prefixGcd.join(", ")}]` },
      ...extra,
    ];
  }

  steps.push({
    title: { vi: "Initialize prefixGcd", en: "Initialize prefixGcd" },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    codeLines: [5, 6],
    vars: vars([{ name: "mx", value: 0 }]),
    note: {
      vi: "First build prefixGcd[i] = gcd(nums[i], max(nums[0..i])).",
      en: "First build prefixGcd[i] = gcd(nums[i], max(nums[0..i])).",
    },
  });

  let mx = 0;
  for (let i = 0; i < nums.length; i++) {
    const prevMx = mx;
    mx = Math.max(mx, nums[i]);
    const g = gcd(nums[i], mx);
    prefixGcd.push(g);

    steps.push({
      title: { vi: `i=${i}: gcd(${nums[i]}, ${mx}) = ${g}`, en: `i=${i}: gcd(${nums[i]}, ${mx}) = ${g}` },
      arr: [...nums],
      sub: nums.map((_, idx) => `[${idx}]`),
      highlight: [i],
      mark: [i],
      codeLines: [7, 8, 9],
      vars: vars([
        { name: "i", value: i },
        { name: "previous mx", value: prevMx },
        { name: "mx", value: mx },
        { name: "nums[i]", value: nums[i] },
        { name: "gcd(nums[i], mx)", value: g },
      ]),
      note: {
        vi: `mx = max(${prevMx}, ${nums[i]}) = ${mx}; prefixGcd[${i}] = gcd(${nums[i]}, ${mx}) = ${g}.`,
        en: `mx = max(${prevMx}, ${nums[i]}) = ${mx}; prefixGcd[${i}] = gcd(${nums[i]}, ${mx}) = ${g}.`,
      },
    });
  }

  const sorted = [...prefixGcd].sort((a, b) => a - b);
  steps.push({
    title: { vi: "Sort prefixGcd", en: "Sort prefixGcd" },
    arr: [...sorted],
    sub: sorted.map((_, i) => `[${i}]`),
    highlight: sorted.map((_, i) => i),
    mark: [],
    codeLines: [10],
    vars: [
      { name: "prefixGcd before sort", value: `[${prefixGcd.join(", ")}]` },
      { name: "prefixGcd after sort", value: `[${sorted.join(", ")}]` },
    ],
    note: {
      vi: `Sort prefixGcd from [${prefixGcd.join(", ")}] to [${sorted.join(", ")}].`,
      en: `Sort prefixGcd from [${prefixGcd.join(", ")}] to [${sorted.join(", ")}].`,
    },
  });

  let left = 0;
  let right = sorted.length - 1;
  let answer = 0;

  while (left < right) {
    const g = gcd(sorted[left], sorted[right]);
    answer += g;
    steps.push({
      title: { vi: `Pair ${sorted[left]} with ${sorted[right]}`, en: `Pair ${sorted[left]} with ${sorted[right]}` },
      arr: [...sorted],
      sub: sorted.map((_, i) => `[${i}]`),
      highlight: [left, right],
      mark: [left, right],
      codeLines: [13, 14, 15],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "a", value: sorted[left] },
        { name: "b", value: sorted[right] },
        { name: "gcd(a, b)", value: g },
        { name: "answer", value: answer },
      ],
      note: {
        vi: `Take smallest unpaired ${sorted[left]} and largest unpaired ${sorted[right]}. gcd = ${g}; answer = ${answer}.`,
        en: `Take smallest unpaired ${sorted[left]} and largest unpaired ${sorted[right]}. gcd = ${g}; answer = ${answer}.`,
      },
    });
    left += 1;
    right -= 1;
  }

  steps.push({
    title: { vi: `Result: ${answer}`, en: `Result: ${answer}` },
    arr: [...sorted],
    sub: sorted.map((_, i) => `[${i}]`),
    highlight: left === right ? [left] : [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [
      { name: "sorted prefixGcd", value: `[${sorted.join(", ")}]` },
      { name: "ignored middle", value: left === right ? sorted[left] : "none" },
      { name: "answer", value: answer },
    ],
    note: {
      vi: left === right
        ? `n is odd, so middle value ${sorted[left]} is ignored. Return ${answer}.`
        : `All values were paired. Return ${answer}.`,
      en: left === right
        ? `n is odd, so middle value ${sorted[left]} is ignored. Return ${answer}.`
        : `All values were paired. Return ${answer}.`,
    },
  });

  return { original: [...nums], prefixGcd, sorted, answer, steps };
}

/**
 * LeetCode 3312: Sorted GCD Pair Queries.
 *
 * Key idea:
 *  1. Count freq[v] = number of times value v appears.
 *  2. For each g from 1..max:
 *     cntMultiples[g] = sum of freq[g], freq[2g], freq[3g], ...
 *     exact[g] = C(cntMultiples[g], 2) − exact[2g] − exact[3g] − ...
 *     This is Euler-sieve style inclusion-exclusion.
 *  3. Build gcdPairs: for each g where exact[g] > 0, push g exactly exact[g] times.
 *     Sort ascending → sorted list of all pair GCDs.
 *  4. Prefix sum on sorted gcdPairs for O(1) query answer via bisect.
 */
function buildSteps3312(input, params) {
  const nums = Array.isArray(input) ? input : [input];
  const queriesRaw = String(params && params.queries !== undefined ? params.queries : "0;2;2")
    .split(";").map(s => s.trim()).filter(Boolean).map(Number);

  const steps = [];

  function gcdFn(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
  function comb2(k) { return k < 2 ? 0 : k * (k - 1) / 2; }

  const maxVal = Math.max(...nums);
  const freq = new Array(maxVal + 1).fill(0);
  for (const v of nums) freq[v]++;

  // ── Compute all pairs (for small inputs, enumerate them) ──────────
  const allPairs = [];
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      allPairs.push({ i, j, vi: nums[i], vj: nums[j], g: gcdFn(nums[i], nums[j]) });
  allPairs.sort((a, b) => a.g - b.g);
  const gcdPairsSorted = allPairs.map(p => p.g);
  const totalPairs = allPairs.length;
  const showPairs = Math.min(allPairs.length, 20);
  const gcdView = (overrides = {}) => ({
    nums: [...nums],
    sorted: gcdPairsSorted.slice(0, 40),
    pair: null,
    activeG: null,
    buckets: [],
    query: null,
    ...overrides,
  });

  // ── Step 0: intro — show nums ──────────────────────────────────────
  steps.push({
    title: { en: "Input: nums array", vi: "Đầu vào: mảng nums" },
    arr: [...nums],
    gcdPairsView: gcdView(),
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "n", value: nums.length },
      { name: "total pairs C(n,2)", value: totalPairs },
    ],
    note: {
      en: `nums = [${nums.join(", ")}]. There are C(${nums.length},2) = ${totalPairs} pairs (i,j) with i < j. We need the GCD of every pair, sorted.`,
      vi: `nums = [${nums.join(", ")}]. Có C(${nums.length},2) = ${totalPairs} cặp (i,j) với i < j. Cần GCD của mọi cặp, sắp xếp.`,
    },
  });

  // ── Step 1: show each pair and its GCD (for small n) ──────────────
  if (nums.length <= 8) {
    for (const { i, j, vi, vj, g } of allPairs.slice(0, showPairs)) {
      steps.push({
        title: { en: `gcd(nums[${i}], nums[${j}]) = gcd(${vi}, ${vj}) = ${g}`, vi: `gcd(nums[${i}], nums[${j}]) = gcd(${vi}, ${vj}) = ${g}` },
        arr: [...nums],
        gcdPairsView: gcdView({ pair: { i, j, vi, vj, g }, activeG: g }),
        sub: nums.map((_, idx) => idx === i ? `[${idx}]` : idx === j ? `[${idx}]` : `[${idx}]`),
        highlight: [i, j],
        mark: [],
        codeLines: [5],
        vars: [
          { name: `nums[${i}]`, value: vi },
          { name: `nums[${j}]`, value: vj },
          { name: `gcd(${vi}, ${vj})`, value: g },
        ],
        note: {
          en: `Pair (${i}, ${j}): gcd(${vi}, ${vj}) = ${g}. This will appear in the sorted gcdPairs array.`,
          vi: `Cặp (${i}, ${j}): gcd(${vi}, ${vj}) = ${g}. Sẽ xuất hiện trong mảng gcdPairs đã sắp xếp.`,
        },
      });
    }
  }

  // ── Step 2: show the sorted gcdPairs array ─────────────────────────
  steps.push({
    title: { en: "Sorted gcdPairs array", vi: "Mảng gcdPairs đã sắp xếp" },
    arr: gcdPairsSorted.slice(0, 40),
    gcdPairsView: gcdView(),
    sub: gcdPairsSorted.slice(0, 40).map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "gcdPairs (sorted)", value: `[${gcdPairsSorted.join(", ")}]` },
      { name: "length", value: totalPairs },
    ],
    note: {
      en: `gcdPairs = all ${totalPairs} pair GCDs sorted ascending. Query q → return gcdPairs[q]. But we can't store all pairs for large n — use the sieve.`,
      vi: `gcdPairs = tất cả ${totalPairs} GCD cặp, sắp xếp tăng dần. Query q → trả gcdPairs[q]. Nhưng không thể lưu tất cả cặp nếu n lớn → dùng sieve.`,
    },
  });

  // ── Phase 2: sieve (compute exact[g] for each g) ──────────────────
  const cntMult = new Array(maxVal + 1).fill(0);
  const exact = new Array(maxVal + 1).fill(0);
  for (let g = 1; g <= maxVal; g++) {
    let t = 0;
    for (let mul = g; mul <= maxVal; mul += g) t += freq[mul];
    cntMult[g] = t;
  }
  for (let g = maxVal; g >= 1; g--) {
    let s = comb2(cntMult[g]);
    for (let mul = 2 * g; mul <= maxVal; mul += g) s -= exact[mul];
    exact[g] = s;
  }
  let bucketPrefix = 0;
  const bucketSnapshot = exact.map((count, g) => {
    if (g === 0 || count === 0) return null;
    bucketPrefix += count;
    return { g, count, prefix: bucketPrefix };
  }).filter(Boolean);

  // Show sieve steps for all g values up to maxVal (keep it manageable)
  const sieveLimit = Math.min(maxVal, 10);
  for (let g = 1; g <= sieveLimit; g++) {
    const divIndices = nums.map((v, i) => v % g === 0 ? i : -1).filter(x => x >= 0);
    const divValues = divIndices.map(i => nums[i]);
    const higherTerms = [];
    for (let mul = 2 * g; mul <= maxVal; mul += g)
      if (exact[mul] > 0) higherTerms.push(`exact[${mul}]=${exact[mul]}`);

    // In gcdPairsSorted, mark positions where g appears
    const gPositions = gcdPairsSorted.slice(0, 40).map((v, i) => v === g ? i : -1).filter(x => x >= 0);

    steps.push({
      title: { en: `Sieve g=${g}: exact[${g}] = ${exact[g]} pairs`, vi: `Sieve g=${g}: exact[${g}] = ${exact[g]} cặp` },
      arr: gcdPairsSorted.slice(0, 40),
      gcdPairsView: gcdView({ activeG: g, buckets: bucketSnapshot }),
      sub: gcdPairsSorted.slice(0, 40).map((v, i) => v === g ? `g=${g}` : `[${i}]`),
      highlight: gPositions,
      mark: [],
      codeLines: [8, 9, 10, 11],
      vars: [
        { name: "g", value: g },
        { name: `nums divisible by ${g}`, value: divValues.length > 0 ? `[${divValues.join(", ")}] (${divValues.length} elements)` : "none" },
        { name: `cntMult[${g}]`, value: cntMult[g] },
        { name: `C(${cntMult[g]}, 2)`, value: comb2(cntMult[g]) },
        { name: "subtract (pairs with GCD > g)", value: higherTerms.join(" + ") || "0" },
        { name: `exact[${g}] = pairs with GCD exactly ${g}`, value: exact[g] },
      ],
      note: {
        en: `g=${g}: ${divValues.length} elements in nums are divisible by ${g} → [${divValues.join(", ")}]. Pairs all divisible by ${g}: C(${cntMult[g]},2)=${comb2(cntMult[g])}. Minus pairs with GCD strictly > ${g}: ${higherTerms.join(" + ") || "0"}. exact[${g}] = ${exact[g]} pairs highlighted in gcdPairs.`,
        vi: `g=${g}: ${divValues.length} phần tử chia hết cho ${g} → [${divValues.join(", ")}]. Cặp đều chia hết: C(${cntMult[g]},2)=${comb2(cntMult[g])}. Trừ cặp GCD > ${g}: ${higherTerms.join(" + ") || "0"}. exact[${g}] = ${exact[g]} cặp (đánh dấu trong gcdPairs).`,
      },
    });
  }

  if (maxVal > sieveLimit) {
    steps.push({
      title: { en: `Sieve complete for all g ≤ ${maxVal}`, vi: `Sieve hoàn tất cho g ≤ ${maxVal}` },
      arr: gcdPairsSorted.slice(0, 40),
      gcdPairsView: gcdView({ buckets: bucketSnapshot }),
      sub: gcdPairsSorted.slice(0, 40).map((_, i) => `[${i}]`),
      highlight: [],
      mark: [],
      codeLines: [8, 9, 10, 11],
      vars: exact.map((v, g) => v > 0 ? ({ name: `exact[${g}]`, value: `${v} pairs` }) : null).filter(Boolean).slice(0, 15),
      note: {
        en: `All g processed. Non-zero exact[g] values above = how many pairs in gcdPairs have GCD = g.`,
        vi: `Đã xử lý tất cả g. Các exact[g] khác 0 ở trên = số cặp trong gcdPairs có GCD = g.`,
      },
    });
  }

  // ── Phase 3: prefix sum ────────────────────────────────────────────
  const prefix = new Array(maxVal + 2).fill(0);
  for (let g = 1; g <= maxVal; g++) prefix[g] = prefix[g - 1] + exact[g];

  // Show prefix as bar chart using gcdEntries
  const gcdEntries = [];
  for (let g = 1; g <= maxVal; g++) if (exact[g] > 0) gcdEntries.push({ g, exact: exact[g], prefix: prefix[g] });

  steps.push({
    title: { en: "Build prefix sum for O(log V) queries", vi: "Xây prefix sum để query O(log V)" },
    arr: gcdEntries.map(e => e.prefix),
    gcdPairsView: gcdView({ buckets: bucketSnapshot }),
    sub: gcdEntries.map(e => `g≤${e.g}`),
    highlight: [],
    mark: [],
    codeLines: [13, 14],
    vars: [
      { name: "total pairs", value: totalPairs },
      ...gcdEntries.map(e => ({ name: `prefix[${e.g}]`, value: e.prefix })),
    ],
    note: {
      en: `prefix[g] = number of pairs with GCD ≤ g. To find gcdPairs[q], binary-search for the smallest g where prefix[g] ≥ q+1.`,
      vi: `prefix[g] = số cặp có GCD ≤ g. Để tìm gcdPairs[q], binary search g nhỏ nhất sao cho prefix[g] ≥ q+1.`,
    },
  });

  // ── Phase 4: answer queries ────────────────────────────────────────
  const answers = [];
  for (let qi = 0; qi < queriesRaw.length; qi++) {
    const q = queriesRaw[qi];
    let lo = 1, hi = maxVal;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (prefix[mid] < q + 1) lo = mid + 1;
      else hi = mid;
    }
    const ans = lo;
    answers.push(ans);

    // Mark the answer position in gcdPairsSorted
    const markPos = gcdPairsSorted.slice(0, 40).map((v, i) => i === q ? i : -1).filter(x => x >= 0);

    steps.push({
      title: { en: `Query queries[${qi}]=${q} → gcdPairs[${q}] = ${ans}`, vi: `Query queries[${qi}]=${q} → gcdPairs[${q}] = ${ans}` },
      arr: gcdPairsSorted.slice(0, 40),
      gcdPairsView: gcdView({ activeG: ans, buckets: bucketSnapshot, query: { index: q, answer: ans } }),
      sub: gcdPairsSorted.slice(0, 40).map((v, i) => i === q ? `◄[${i}]` : `[${i}]`),
      highlight: [q],
      mark: markPos,
      codeLines: [16, 17],
      vars: [
        { name: `queries[${qi}]`, value: q },
        { name: "prefix[ans-1]", value: ans > 1 ? prefix[ans - 1] : 0 },
        { name: `prefix[${ans}]`, value: prefix[ans] },
        { name: `gcdPairs[${q}]`, value: ans },
      ],
      note: {
        en: `q=${q}: find smallest g where prefix[g] ≥ ${q + 1}. prefix[${ans > 1 ? ans - 1 : 0}]=${ans > 1 ? prefix[ans - 1] : 0} < ${q + 1} ≤ prefix[${ans}]=${prefix[ans]}. So gcdPairs[${q}] = ${ans}. ← marked in array above.`,
        vi: `q=${q}: tìm g nhỏ nhất có prefix[g] ≥ ${q + 1}. prefix[${ans > 1 ? ans - 1 : 0}]=${ans > 1 ? prefix[ans - 1] : 0} < ${q + 1} ≤ prefix[${ans}]=${prefix[ans]}. Vậy gcdPairs[${q}] = ${ans}. ← đánh dấu trong mảng.`,
      },
    });
  }

  // ── Final ──────────────────────────────────────────────────────────
  steps.push({
    title: { en: "Result", vi: "Kết quả" },
    arr: gcdPairsSorted.slice(0, 40),
    gcdPairsView: gcdView({ buckets: bucketSnapshot, query: queriesRaw.length ? { index: queriesRaw[queriesRaw.length - 1], answer: answers[answers.length - 1] } : null }),
    sub: gcdPairsSorted.slice(0, 40).map((_, i) => queriesRaw.includes(i) ? `q=${i}` : `[${i}]`),
    highlight: queriesRaw.filter(q => q < 40),
    mark: answers.map(a => gcdPairsSorted.slice(0, 40).indexOf(a)).filter(x => x >= 0),
    final: true,
    codeLines: [18],
    vars: [
      { name: "queries", value: `[${queriesRaw.join(", ")}]` },
      { name: "answers", value: `[${answers.join(", ")}]` },
    ],
    note: {
      en: `answers = [${answers.join(", ")}]. Each answer is the value at the queried index in the sorted gcdPairs array.`,
      vi: `Kết quả = [${answers.join(", ")}]. Mỗi đáp án là giá trị tại chỉ số truy vấn trong mảng gcdPairs đã sắp xếp.`,
    },
  });

  return { original: nums, answer: answers, steps };
}

function buildSteps3312Approach2(input, params) {
  const result = buildSteps3312(input, params);
  const lineMap = {
    4: [3, 4],
    5: [],
    8: [7, 8, 9],
    9: [10, 11],
    10: [12, 13, 14],
    11: [12, 13, 14],
    13: [15, 16],
    14: [15, 16],
    16: [17, 18, 19, 20, 21],
    17: [17, 18, 19, 20, 21],
    18: [22],
  };

  result.steps.forEach((step) => {
    const mapped = [...new Set((step.codeLines || []).flatMap((line) => lineMap[line] || []))];
    step.codeBlock = 2;
    step.codeLines = mapped;
  });
  return result;
}

/**
 * LeetCode 3513: Number of Unique XOR Triplets I.
 * The permutation property makes the answer depend only on n.
 */
function buildSteps3513(input) {
  const nums = Array.isArray(input) ? [...input] : [input];
  const n = nums.length;
  const steps = [];
  const bitWidth = Math.max(1, n.toString(2).length);
  const binary = (value) => value.toString(2).padStart(bitWidth, "0");
  const binaryLabels = nums.map((value) => value.toString(2).padStart(bitWidth, "0"));
  const indexOfValue = (value) => nums.indexOf(value);
  const positionsOf = (values) => [...new Set(values.map(indexOfValue).filter((index) => index >= 0))];
  const snapshot = (overrides = {}) => ({
    arr: [...nums],
    sub: [...binaryLabels],
    highlight: [],
    mark: [],
    ...overrides,
  });

  steps.push(snapshot({
    title: { vi: "Đọc nums là hoán vị của 1..n", en: "Read nums as a permutation of 1..n" },
    codeLines: [2],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "values", value: `{1, 2, ..., ${n}}` },
    ],
    note: {
      vi: `Đề bài bảo đảm nums là một hoán vị của các số từ 1 đến n. Thứ tự không làm thay đổi tập kết quả XOR: với ba giá trị đã chọn, ta luôn sắp ba chỉ số thành i <= j <= k, còn phép XOR có tính giao hoán. Vì vậy đáp án chỉ phụ thuộc vào n, không phụ thuộc vị trí các phần tử trong nums.`,
      en: `nums is a permutation of 1 through n. XOR is commutative, so the answer depends only on n, not on the permutation order.`,
    },
  }));

  steps.push(snapshot({
    title: { vi: "Nhắc lại 3 quy tắc XOR", en: "Review three XOR rules" },
    codeLines: [2],
    vars: [
      { name: "cùng bit", value: "0 XOR 0 = 0; 1 XOR 1 = 0" },
      { name: "khác bit", value: "0 XOR 1 = 1; 1 XOR 0 = 1" },
      { name: "hệ quả", value: "x XOR x = 0; x XOR 0 = x" },
    ],
    note: {
      vi: "XOR xử lý độc lập từng cột bit: hai bit giống nhau cho 0, hai bit khác nhau cho 1. Vì vậy một số XOR với chính nó sẽ triệt tiêu thành 0, còn XOR với 0 giữ nguyên số đó. Hai tính chất này giải thích cả trường hợp lặp chỉ số và cách ghép ba giá trị ở các bước sau.",
      en: "XOR works independently in each bit column. Equal bits produce 0 and different bits produce 1, so x XOR x = 0 and x XOR 0 = x.",
    },
  }));

  steps.push(snapshot({
    title: { vi: `n = len(nums) = ${n}`, en: `n = len(nums) = ${n}` },
    codeLines: [3],
    vars: [
      { name: "n", value: n },
      { name: "n (binary)", value: n.toString(2) },
    ],
    note: {
      vi: `Lấy độ dài mảng: n = ${n}. Do nums chứa đúng các giá trị 1..${n}, ta không cần duyệt mọi bộ ba chỉ số, vốn có thể lên tới O(n^3).`,
      en: `The array length is n = ${n}. Since nums contains exactly 1 through n, enumerating O(n^3) index triplets is unnecessary.`,
    },
  }));

  if (n <= 2) {
    steps.push(snapshot({
      title: { vi: `n <= 2 là Đúng`, en: `n <= 2 is True` },
      codeLines: [4],
      vars: [
        { name: "n", value: n },
        { name: "n <= 2", value: true },
      ],
      note: {
        vi: `Với n = ${n}, chưa thể chọn ba giá trị phân biệt. Nếu một chỉ số xuất hiện hai lần thì hai số bằng nhau triệt tiêu vì x XOR x = 0; kết quả còn lại chỉ là một phần tử của nums. Do đó có đúng ${n} giá trị XOR khác nhau.`,
        en: `For n = ${n}, three distinct values cannot be selected. Equal values cancel in pairs, leaving exactly the ${n} values in nums.`,
      },
    }));

    steps.push(snapshot({
      title: { vi: `return n = ${n}`, en: `return n = ${n}` },
      codeLines: [5],
      mark: nums.map((_, index) => index),
      final: true,
      vars: [{ name: "answer", value: n }],
      note: {
        vi: `Trả về ${n}. Các kết quả duy nhất chính là {${nums.slice().sort((a, b) => a - b).join(", ")}}.`,
        en: `Return ${n}. The unique results are exactly the values already in nums.`,
      },
    }));
    return { original: nums, answer: n, steps };
  }

  steps.push(snapshot({
    title: { vi: "n <= 2 là Sai", en: "n <= 2 is False" },
    codeLines: [4],
    vars: [
      { name: "n", value: n },
      { name: "n <= 2", value: false },
    ],
    note: {
      vi: `n = ${n} > 2 nên nums chắc chắn chứa 1, 2 và 3. Ba giá trị phân biệt này cho phép tạo 0, đồng thời mở ra toàn bộ miền kết quả có cùng số bit với n. Ta đi tiếp tới công thức ở dòng 6.`,
      en: `Since n = ${n} > 2, nums contains 1, 2, and 3. These distinct values make zero and unlock the full bit range.`,
    },
  }));

  const limit = 1 << bitWidth;
  const maxResult = limit - 1;
  const highestBit = limit >> 1;

  steps.push(snapshot({
    title: { vi: `n.bit_length() = ${bitWidth}`, en: `n.bit_length() = ${bitWidth}` },
    codeLines: [6],
    vars: [
      { name: "n", value: `${n} = ${binary(n)}₂` },
      { name: "n.bit_length()", value: bitWidth },
    ],
    note: {
      vi: `${n} viết ở hệ nhị phân là ${binary(n)}₂. Bỏ các số 0 ở đầu, biểu diễn này có ${bitWidth} chữ số, nên n.bit_length() = ${bitWidth}. Đây là số vị trí bit mà mọi phần tử từ 1 đến n có thể sử dụng.`,
      en: `${n} is ${binary(n)} in binary and needs ${bitWidth} bit positions, so n.bit_length() = ${bitWidth}.`,
    },
  }));

  steps.push(snapshot({
    title: { vi: `Dịch trái: 1 << ${bitWidth} = ${limit}`, en: `Left shift: 1 << ${bitWidth} = ${limit}` },
    codeLines: [6],
    vars: [
      { name: "1 (binary)", value: "1" },
      { name: `1 << ${bitWidth}`, value: `${limit} = ${limit.toString(2)}₂` },
      { name: "meaning", value: `2^${bitWidth} = ${limit}` },
    ],
    note: {
      vi: `Toán tử << dịch bit 1 sang trái ${bitWidth} vị trí: 1₂ thành ${limit.toString(2)}₂, tức 2^${bitWidth} = ${limit}. Số này không phải giá trị XOR lớn nhất; nó là số lượng phần tử trong miền từ 0 đến ${limit - 1}.`,
      en: `Shifting binary 1 left ${bitWidth} places gives ${limit}. This is the count of values from 0 through ${limit - 1}, not the largest XOR itself.`,
    },
  }));

  steps.push(snapshot({
    title: { vi: `Cận trên: kết quả chỉ nằm trong 0..${maxResult}`, en: `Upper bound: results lie in 0..${maxResult}` },
    codeLines: [6],
    vars: [
      { name: "largest input", value: `${n} = ${n.toString(2).padStart(bitWidth, "0")}₂` },
      { name: "largest possible XOR", value: `${maxResult} = ${maxResult.toString(2)}₂` },
      { name: "range size", value: limit },
    ],
    note: {
      vi: `Mọi nums[i] dùng tối đa ${bitWidth} bit, nên XOR của ba phần tử cũng không thể bật bit thứ ${bitWidth + 1}. Giá trị lớn nhất có thể là ${maxResult.toString(2)}₂ = ${maxResult}. Vì thế nhiều nhất chỉ có ${limit} kết quả trong đoạn [0, ${maxResult}].`,
      en: `Every value uses at most ${bitWidth} bits, so a triplet XOR is at most ${maxResult}. There are at most ${limit} possible results.`,
    },
  }));

  const sampleValue = Math.min(n, 3);
  const sampleIndex = indexOfValue(sampleValue);
  steps.push(snapshot({
    title: { vi: `Tạo mọi x trong 1..${n}`, en: `Build every x in 1..${n}` },
    codeLines: [6],
    highlight: sampleIndex >= 0 ? [sampleIndex] : [],
    vars: [
      { name: "x (ví dụ)", value: sampleValue },
      { name: "decimal", value: `${sampleValue} XOR ${sampleValue} XOR ${sampleValue} = ${sampleValue}` },
      { name: "binary", value: `${binary(sampleValue)} XOR ${binary(sampleValue)} XOR ${binary(sampleValue)} = ${binary(sampleValue)}` },
      { name: "đã tạo được", value: `{1, 2, ..., ${n}}` },
    ],
    note: {
      vi: `Với bất kỳ x thuộc [1, ${n}], chọn cùng một chỉ số ba lần, tức i = j = k tại vị trí chứa x. Khi đó x XOR x XOR x = 0 XOR x = x. Ví dụ ${sampleValue} XOR ${sampleValue} XOR ${sampleValue} = ${sampleValue}. Vậy toàn bộ ${n} giá trị từ 1 đến n đều đạt được.`,
      en: `For any x in [1, ${n}], choose the same index three times: x XOR x XOR x = x. Thus every value from 1 through n is reachable.`,
    },
  }));

  steps.push(snapshot({
    title: { vi: "Tạo giá trị 0 bằng 1 XOR 2 XOR 3", en: "Build 0 with 1 XOR 2 XOR 3" },
    codeLines: [6],
    highlight: positionsOf([1, 2, 3]),
    vars: [
      { name: "triplet", value: "1 XOR 2 XOR 3" },
      { name: "binary", value: `${binary(1)} XOR ${binary(2)} XOR ${binary(3)} = ${binary(0)}` },
      { name: "result", value: 0 },
      { name: "đã tạo được", value: `{0, 1, 2, ..., ${n}}` },
    ],
    note: {
      vi: `nums chứa đủ 1, 2, 3 và 1 XOR 2 = 3, nên 1 XOR 2 XOR 3 = 3 XOR 3 = 0. Dù ba giá trị nằm ở thứ tự nào trong nums, ta sắp các vị trí của chúng thành i <= j <= k; kết quả XOR vẫn giữ nguyên.`,
      en: `nums contains 1, 2, and 3. Since 1 XOR 2 = 3, their triplet XOR is 0; their indices can always be sorted.`,
    },
  }));

  if (n < maxResult) {
    steps.push(snapshot({
      title: { vi: `Chọn H = ${highestBit}, bit cao nhất`, en: `Choose H = ${highestBit}, the highest bit` },
      codeLines: [6],
      highlight: positionsOf([highestBit]),
      vars: [
        { name: "H", value: `${highestBit} = ${binary(highestBit)}₂` },
        { name: "missing targets", value: `[${n + 1}, ${maxResult}]` },
      ],
      note: {
        vi: `H = ${highestBit} = ${binary(highestBit)}₂ là lũy thừa 2 lớn nhất không vượt quá n, nên H chắc chắn có trong nums. H chỉ bật bit cao nhất. Mọi target còn thiếu từ ${n + 1} đến ${maxResult} cũng bật bit này; ta sẽ dùng H để tạo bit cao, rồi dùng hai số nhỏ hơn H để ghép các bit thấp.`,
        en: `H = ${highestBit} is the largest power of two not exceeding n, so it is in nums. It supplies the highest bit for every missing target.`,
      },
    }));

    steps.push(snapshot({
      title: { vi: "Công thức dựng hai số cho phần bit thấp", en: "Construct two values for the low bits" },
      codeLines: [6],
      vars: [
        { name: "y = 1", value: "2 XOR 3 = 1" },
        { name: "y = 2", value: "1 XOR 3 = 2" },
        { name: "y >= 3", value: "1 XOR (y XOR 1) = y" },
      ],
      note: {
        vi: `Với target, bỏ bit cao bằng y = target XOR H. Cần tìm a,b sao cho a XOR b = y. Nếu y=1 dùng 2 và 3; nếu y=2 dùng 1 và 3; nếu y>=3 dùng a=1, b=y XOR 1. Cả a,b đều khác nhau, nhỏ hơn H và thuộc nums. Khi ghép lại: H XOR a XOR b = H XOR y = target.`,
        en: `Remove the high bit with y = target XOR H. Build y as a XOR b using one of three cases, then H XOR a XOR b equals the target.`,
      },
    }));

    const allMissingTargets = Array.from({ length: maxResult - n }, (_, index) => n + 1 + index);
    const shownTargets = allMissingTargets.length <= 8
      ? allMissingTargets
      : [...new Set([...allMissingTargets.slice(0, 3), allMissingTargets.at(-1)])];

    for (const target of shownTargets) {
      const lowBits = target ^ highestBit;
      let a;
      let b;
      let pairReason;
      if (lowBits === 1) {
        [a, b] = [2, 3];
        pairReason = "y = 1 nên chọn 2 XOR 3 = 1";
      } else if (lowBits === 2) {
        [a, b] = [1, 3];
        pairReason = "y = 2 nên chọn 1 XOR 3 = 2";
      } else {
        [a, b] = [1, lowBits ^ 1];
        pairReason = `y >= 3 nên chọn 1 XOR (y XOR 1) = 1 XOR ${b} = ${lowBits}`;
      }

      steps.push(snapshot({
        title: { vi: `Target ${target}: tách bit cao và bit thấp`, en: `Target ${target}: split high and low bits` },
        codeLines: [6],
        highlight: positionsOf([highestBit]),
        vars: [
          { name: "target", value: `${target} = ${binary(target)}₂` },
          { name: "H", value: `${highestBit} = ${binary(highestBit)}₂` },
          { name: "y = target XOR H", value: `${lowBits} = ${binary(lowBits)}₂` },
        ],
        note: {
          vi: `Mục tiêu là ${target} = ${binary(target)}₂. XOR với H=${binary(highestBit)}₂ sẽ tắt đúng bit cao nhất và giữ các bit thấp: ${binary(target)} XOR ${binary(highestBit)} = ${binary(lowBits)}, nên y=${lowBits}. Bây giờ chỉ cần tạo y từ hai số nhỏ hơn H.`,
          en: `XOR target ${binary(target)} with H ${binary(highestBit)} to remove the highest bit, leaving y = ${binary(lowBits)}.`,
        },
      }));

      steps.push(snapshot({
        title: { vi: `Target ${target}: chọn a=${a}, b=${b}`, en: `Target ${target}: choose a=${a}, b=${b}` },
        codeLines: [6],
        highlight: positionsOf([a, b]),
        vars: [
          { name: "y", value: `${lowBits} = ${binary(lowBits)}₂` },
          { name: "a XOR b", value: `${a} XOR ${b} = ${lowBits}` },
          { name: "binary", value: `${binary(a)} XOR ${binary(b)} = ${binary(lowBits)}` },
        ],
        note: {
          vi: `${pairReason}. Kiểm tra theo bit: ${binary(a)} XOR ${binary(b)} = ${binary(lowBits)}. Hai số ${a} và ${b} đều thuộc đoạn 1..n, khác nhau và cũng khác H=${highestBit}, nên chúng tương ứng với ba chỉ số hợp lệ trong nums.`,
          en: `Choose a=${a} and b=${b}. Their XOR is y=${lowBits}, and both are valid distinct values below H.`,
        },
      }));

      steps.push(snapshot({
        title: { vi: `Target ${target}: ghép H XOR a XOR b`, en: `Target ${target}: combine H XOR a XOR b` },
        codeLines: [6],
        highlight: positionsOf([highestBit, a, b]),
        vars: [
          { name: "decimal", value: `${highestBit} XOR ${a} XOR ${b} = ${target}` },
          { name: "binary", value: `${binary(highestBit)} XOR ${binary(a)} XOR ${binary(b)} = ${binary(target)}` },
          { name: "new reachable", value: target },
        ],
        note: {
          vi: `Ghép ba số: ${highestBit} XOR ${a} XOR ${b} = ${highestBit} XOR (${a} XOR ${b}) = ${highestBit} XOR ${lowBits} = ${target}. Theo từng cột bit: ${binary(highestBit)} XOR ${binary(a)} XOR ${binary(b)} = ${binary(target)}. Vì XOR giao hoán, ta sắp vị trí của ba số thành i <= j <= k mà không đổi kết quả.`,
          en: `Combine the three values: ${highestBit} XOR ${a} XOR ${b} = ${target}. Sorting their indices preserves the XOR result.`,
        },
      }));
    }

    steps.push(snapshot({
      title: { vi: `Suy ra toàn bộ ${n + 1}..${maxResult} đều tạo được`, en: `Therefore every value ${n + 1}..${maxResult} is reachable` },
      codeLines: [6],
      vars: [
        { name: "đã có", value: `{0, 1, ..., ${n}}` },
        { name: "vừa chứng minh", value: `{${n + 1}, ..., ${maxResult}}` },
        { name: "toàn bộ", value: `{0, 1, ..., ${maxResult}}` },
      ],
      note: {
        vi: `Các ví dụ trên dùng đúng một công thức áp dụng cho mọi target trong [${n + 1}, ${maxResult}], không chỉ các target đang hiển thị. Kết hợp với 0 và đoạn 1..n đã tạo trước đó, tập kết quả không còn lỗ hổng: chính xác là {0, 1, ..., ${maxResult}}.`,
        en: `The same construction works for every missing target. Together with 0 through n, the reachable set is exactly 0 through ${maxResult}.`,
      },
    }));
  } else {
    steps.push(snapshot({
      title: { vi: `Không còn khoảng trống sau ${n}`, en: `No values are missing above ${n}` },
      codeLines: [6],
      vars: [
        { name: "n", value: n },
        { name: "maximum XOR", value: maxResult },
      ],
      note: {
        vi: `Ở trường hợp này n = ${n} đã bằng cận trên ${maxResult}. Các bước trước đã tạo được 0 và mọi giá trị 1..n, nên toàn bộ đoạn [0, ${maxResult}] đã đầy đủ, không cần dựng thêm giá trị nào.`,
        en: `Here n already equals the upper bound ${maxResult}. Zero and every value from 1 through n cover the whole range.`,
      },
    }));
  }

  steps.push(snapshot({
    title: { vi: `return ${limit}`, en: `return ${limit}` },
    codeLines: [6],
    mark: nums.map((_, index) => index),
    final: true,
    vars: [
      { name: "reachable range", value: `[0, ${maxResult}]` },
      { name: "answer", value: limit },
    ],
    note: {
      vi: `Ta vừa chứng minh cả cận trên lẫn khả năng tạo đủ mọi giá trị từ 0 đến ${maxResult}. Đoạn này có ${maxResult} - 0 + 1 = ${limit} số, nên trả về 1 << ${bitWidth} = ${limit}.`,
      en: `Every value from 0 through ${maxResult} is reachable, and no larger value is possible. Return ${limit}.`,
    },
  }));

  return { original: nums, answer: limit, steps };
}

/**
 * LeetCode 1979: Find Greatest Common Divisor of Array.
 * Line-by-line: find min, find max, then Euclid's GCD step by step.
 */
function buildSteps1979(input) {
  const nums = Array.isArray(input) ? input : [input];
  const steps = [];

  // Line 3: mn = min(nums)
  const mn = Math.min(...nums);
  const minIdx = nums.indexOf(mn);
  steps.push({
    title: { en: "mn = min(nums)", vi: "mn = min(nums)" },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [minIdx],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "mn", value: mn },
    ],
    note: {
      en: `Find minimum: mn = min(nums) = ${mn} (at index ${minIdx}).`,
      vi: `Tìm min: mn = min(nums) = ${mn} (tại index ${minIdx}).`,
    },
  });

  // Line 4: mx = max(nums)
  const mx = Math.max(...nums);
  const maxIdx = nums.indexOf(mx);
  steps.push({
    title: { en: "mx = max(nums)", vi: "mx = max(nums)" },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [maxIdx],
    mark: [minIdx],
    codeLines: [4],
    vars: [
      { name: "mn", value: mn },
      { name: "mx", value: mx },
    ],
    note: {
      en: `Find maximum: mx = max(nums) = ${mx} (at index ${maxIdx}).`,
      vi: `Tìm max: mx = max(nums) = ${mx} (tại index ${maxIdx}).`,
    },
  });

  // Line 5: a, b = mx, mn
  let a = mx, b = mn;
  steps.push({
    title: { en: `a, b = ${mx}, ${mn}`, vi: `a, b = ${mx}, ${mn}` },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [minIdx, maxIdx],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "a", value: a },
      { name: "b", value: b },
    ],
    note: {
      en: `Start Euclid's algorithm with a = mx = ${mx}, b = mn = ${mn}.`,
      vi: `Bắt đầu thuật toán Euclid với a = mx = ${mx}, b = mn = ${mn}.`,
    },
  });

  // Euclid loop
  while (b !== 0) {
    // Line 6: while b != 0
    steps.push({
      title: { en: `while b=${b} != 0 → True`, vi: `while b=${b} != 0 → True` },
      arr: [...nums],
      sub: nums.map((_, i) => `[${i}]`),
      highlight: [minIdx, maxIdx],
      mark: [],
      codeLines: [6],
      vars: [
        { name: "a", value: a },
        { name: "b", value: b },
        { name: "b != 0", value: true },
      ],
      note: {
        en: `b = ${b} ≠ 0 → continue loop.`,
        vi: `b = ${b} ≠ 0 → tiếp tục vòng lặp.`,
      },
    });

    // Line 7: a, b = b, a % b
    const remainder = a % b;
    const oldA = a, oldB = b;
    a = b;
    b = remainder;
    steps.push({
      title: { en: `a, b = ${oldB}, ${oldA} % ${oldB} = ${oldB}, ${remainder}`, vi: `a, b = ${oldB}, ${oldA} % ${oldB} = ${oldB}, ${remainder}` },
      arr: [...nums],
      sub: nums.map((_, i) => `[${i}]`),
      highlight: [minIdx, maxIdx],
      mark: [],
      codeLines: [7],
      vars: [
        { name: "a (old)", value: oldA },
        { name: "b (old)", value: oldB },
        { name: `${oldA} % ${oldB}`, value: remainder },
        { name: "a (new)", value: a },
        { name: "b (new)", value: b },
      ],
      note: {
        en: `a, b = b, a%b = ${oldB}, ${oldA}%${oldB} = (${a}, ${b}).`,
        vi: `a, b = b, a%b = ${oldB}, ${oldA}%${oldB} = (${a}, ${b}).`,
      },
    });
  }

  // Line 6 again: while b != 0 → False
  steps.push({
    title: { en: `while b=0 != 0 → False (exit loop)`, vi: `while b=0 != 0 → False (thoát vòng lặp)` },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [minIdx, maxIdx],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "a", value: a },
      { name: "b", value: b },
      { name: "b != 0", value: false },
    ],
    note: {
      en: `b = 0 → exit while loop. GCD is stored in a.`,
      vi: `b = 0 → thoát vòng lặp. GCD nằm trong a.`,
    },
  });

  // Line 8: return a
  const answer = a;
  steps.push({
    title: { en: `return a = ${answer}`, vi: `return a = ${answer}` },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [minIdx, maxIdx],
    mark: [minIdx, maxIdx],
    final: true,
    codeLines: [8],
    vars: [
      { name: "a", value: answer },
      { name: "gcd(mn, mx)", value: `gcd(${mn}, ${mx}) = ${answer}` },
    ],
    note: {
      en: `GCD of smallest (${mn}) and largest (${mx}) = ${answer}.`,
      vi: `GCD của nhỏ nhất (${mn}) và lớn nhất (${mx}) = ${answer}.`,
    },
  });

  return { original: nums, answer, steps };
}

/**
 * LeetCode 3536: Maximum Product of Two Digits.
 *
 * Given a positive integer n, extract its digits and return the maximum
 * product obtainable by multiplying any two of them (a digit may be reused
 * if it appears more than once, e.g. n=22 → 2*2=4).
 *
 * Greedy approach: track the two LARGEST digits seen so far (first, second)
 * while scanning n from right to left with n%10 / n//10. The answer is
 * first * second once all digits have been scanned.
 */
function buildSteps3536(input) {
  const rawN = Array.isArray(input) ? Number(input[0]) : Number(input);
  const steps = [];

  if (!Number.isFinite(rawN) || rawN <= 0 || !Number.isInteger(rawN)) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "n phải là số nguyên dương.",
        en: "n must be a positive integer.",
      },
    });
    return { original: rawN, answer: 0, steps };
  }

  // Digits left-to-right (for display); the algorithm itself scans n%10
  // right-to-left, so we track which display index is being visited.
  const digits = String(rawN).split("").map(Number);
  const D = digits.length;
  const visited = new Array(D).fill(false);

  let first = 0;  // largest digit seen so far
  let second = 0; // second-largest digit seen so far

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      digitPodiumView: {
        digits,
        visited: [...visited],
        current: opts.current !== undefined ? opts.current : -1,
        first,
        second,
        updateKind: opts.updateKind || null,
        answer: opts.answer,
      },
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: [
        { name: "n (remaining)", value: opts.remaining !== undefined ? opts.remaining : "-" },
        { name: "digit", value: opts.digit !== undefined ? opts.digit : "-" },
        { name: "first (largest)", value: first },
        { name: "second (2nd largest)", value: second },
      ],
      note: opts.note,
    });
  }

  // Line 3: first = second = 0
  snap({
    title: { vi: "first = second = 0", en: "first = second = 0" },
    current: -1,
    remaining: rawN,
    codeLines: [3],
    note: {
      vi: `n = ${rawN}. Khởi tạo 2 "bệ" (podium): first = second = 0. first sẽ giữ chữ số lớn nhất đã thấy, second giữ chữ số lớn nhì.`,
      en: `n = ${rawN}. Initialize two "podium slots": first = second = 0. first will hold the largest digit seen so far, second the second-largest.`,
    },
  });

  // Scan digits right-to-left (matches n%10 loop)
  let m = rawN;
  for (let posFromRight = 0; posFromRight < D; posFromRight++) {
    const idxLTR = D - 1 - posFromRight;

    // Line 4: while n > 0:
    snap({
      title: { vi: `while n > 0 → True (n=${m})`, en: `while n > 0 → True (n=${m})` },
      current: -1,
      remaining: m,
      codeLines: [4],
      note: {
        vi: `n = ${m} > 0 → còn chữ số cần xét, tiếp tục vòng lặp.`,
        en: `n = ${m} > 0 → there are still digits to check, continue the loop.`,
      },
    });

    // Line 5: digit = n % 10
    const digit = m % 10;
    snap({
      title: { vi: `digit = n % 10 = ${digit}`, en: `digit = n % 10 = ${digit}` },
      current: idxLTR,
      remaining: m,
      digit,
      codeLines: [5],
      note: {
        vi: `Lấy chữ số cuối của n=${m}: digit = ${m} % 10 = ${digit}.`,
        en: `Take the last digit of n=${m}: digit = ${m} % 10 = ${digit}.`,
      },
    });

    // Line 6: if digit > first:
    const beatsFirst = digit > first;
    snap({
      title: { vi: `if digit > first → ${digit} > ${first} → ${beatsFirst}`, en: `if digit > first → ${digit} > ${first} → ${beatsFirst}` },
      current: idxLTR,
      remaining: m,
      digit,
      codeLines: [6],
      note: beatsFirst
        ? { vi: `${digit} > first=${first} → digit sẽ chiếm bệ FIRST, còn first cũ bị đẩy xuống bệ SECOND.`, en: `${digit} > first=${first} → digit will take the FIRST slot, and the old first gets pushed down into the SECOND slot.` }
        : { vi: `${digit} không lớn hơn first=${first} → kiểm tra tiếp với second.`, en: `${digit} is not larger than first=${first} → check against second next.` },
    });

    let updateKind;
    if (beatsFirst) {
      // Line 7: second = first
      const oldFirst = first;
      second = first;
      snap({
        title: { vi: `second = first → second = ${second}`, en: `second = first → second = ${second}` },
        current: idxLTR,
        remaining: m,
        digit,
        updateKind: "second",
        codeLines: [7],
        note: {
          vi: `Trước khi ghi đè first, "đẩy" giá trị first cũ (${oldFirst}) xuống bệ second. second = ${second}.`,
          en: `Before overwriting first, push the old first value (${oldFirst}) down into the second slot. second = ${second}.`,
        },
      });

      // Line 8: first = digit
      first = digit;
      updateKind = "first";
      snap({
        title: { vi: `first = digit → first = ${first}`, en: `first = digit → first = ${first}` },
        current: idxLTR,
        remaining: m,
        digit,
        updateKind: "first",
        codeLines: [8],
        note: {
          vi: `digit=${digit} chiếm bệ first. Giờ first=${first}, second=${second}.`,
          en: `digit=${digit} takes the first slot. Now first=${first}, second=${second}.`,
        },
      });
    } else {
      // Line 9: elif digit > second:
      const beatsSecond = digit > second;
      snap({
        title: { vi: `elif digit > second → ${digit} > ${second} → ${beatsSecond}`, en: `elif digit > second → ${digit} > ${second} → ${beatsSecond}` },
        current: idxLTR,
        remaining: m,
        digit,
        codeLines: [9],
        note: beatsSecond
          ? { vi: `${digit} > second=${second} → digit sẽ chiếm bệ SECOND.`, en: `${digit} > second=${second} → digit will take the SECOND slot.` }
          : { vi: `${digit} cũng không lớn hơn second=${second} → không đủ mạnh để chiếm bệ nào, giữ nguyên first/second.`, en: `${digit} is not larger than second=${second} either → not strong enough to take a slot, first/second stay unchanged.` },
      });

      if (beatsSecond) {
        // Line 10: second = digit
        second = digit;
        updateKind = "second";
        snap({
          title: { vi: `second = digit → second = ${second}`, en: `second = digit → second = ${second}` },
          current: idxLTR,
          remaining: m,
          digit,
          updateKind: "second",
          codeLines: [10],
          note: {
            vi: `digit=${digit} chiếm bệ second. Giờ first=${first}, second=${second}.`,
            en: `digit=${digit} takes the second slot. Now first=${first}, second=${second}.`,
          },
        });
      } else {
        updateKind = "none";
      }
    }

    visited[idxLTR] = true;

    // Line 11: n //= 10
    const nextN = Math.floor(m / 10);
    m = nextN;
    snap({
      title: { vi: `n //= 10 → n = ${m}`, en: `n //= 10 → n = ${m}` },
      current: -1,
      remaining: m,
      updateKind: updateKind === "none" ? null : updateKind,
      codeLines: [11],
      note: {
        vi: `Bỏ chữ số cuối đã xét: n = ${m}.`,
        en: `Drop the digit just processed: n = ${m}.`,
      },
    });
  }

  // Line 4 (final check): while n > 0 → False
  snap({
    title: { vi: `while n > 0 → False (n=0)`, en: `while n > 0 → False (n=0)` },
    current: -1,
    remaining: 0,
    codeLines: [4],
    note: {
      vi: `n = 0 → đã quét hết mọi chữ số, thoát vòng lặp.`,
      en: `n = 0 → all digits have been scanned, exit the loop.`,
    },
  });

  // Line 12: return first * second
  const answer = first * second;
  snap({
    title: { vi: `return first * second → ${first} × ${second} = ${answer}`, en: `return first * second → ${first} × ${second} = ${answer}` },
    current: -1,
    remaining: 0,
    final: true,
    codeLines: [12],
    answer,
    note: {
      vi: `Tích lớn nhất = first × second = ${first} × ${second} = ${answer}.`,
      en: `Maximum product = first × second = ${first} × ${second} = ${answer}.`,
    },
  });

  return { original: rawN, answer, steps };
}

/**
 * LeetCode 9: Palindrome Number.
 *
 * Given an integer x, return true if x is a palindrome, false otherwise.
 *
 * Simple approach: fully reverse the number into `res` (via y = x, then
 * peeling digits with y%10 / y//10), then compare res == x directly.
 * Note: if x is negative, y = x <= 0 so the while loop never runs, res stays
 * 0, and 0 == x is only true when x == 0 — so negative numbers correctly
 * fall through to False without needing a separate sign check.
 */
/**
 * LeetCode 7: Reverse Integer.
 * Extract digits from the right, append them to rev, then restore the sign.
 */
function buildSteps7(input) {
  const original = Array.isArray(input) ? Number(input[0]) : Number(input);
  const steps = [];
  const LIMIT = 2147483647;
  const MIN_LIMIT = -2147483648;
  const sign = original < 0 ? -1 : 1;
  let x = Math.abs(original);
  let rev = 0;
  const digits = String(x).split("").map(Number);
  const visited = new Array(digits.length).fill(false);

  function snap({ title, note, current = -1, digit, codeLines, final = false, answer, updateKind = null }) {
    steps.push({
      title,
      arr: [],
      digitPodiumView: {
        digits,
        visited: [...visited],
        current,
        first: rev,
        second: x,
        updateKind,
        op: "←",
        firstLabel: { vi: "rev (đảo ngược)", en: "rev (reversed)" },
        secondLabel: { vi: "x (còn lại)", en: "x (remaining)" },
        resultLabel: { vi: "kết quả", en: "result" },
        answer,
      },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars: [
        { name: "sign", value: sign },
        { name: "x", value: x },
        { name: "digit", value: digit === undefined ? "-" : digit },
        { name: "rev", value: rev },
      ],
      note,
    });
  }

  snap({
    title: { vi: `sign = ${sign}`, en: `sign = ${sign}` },
    note: {
      vi: original < 0 ? "x âm, lưu sign = -1 để khôi phục dấu sau khi đảo." : "x không âm, dùng sign = 1.",
      en: original < 0 ? "x is negative, so save sign = -1 to restore it after reversing." : "x is non-negative, so use sign = 1.",
    },
    codeLines: [3],
  });

  snap({
    title: { vi: `x = abs(x) = ${x}`, en: `x = abs(x) = ${x}` },
    note: {
      vi: "Đảo phần trị tuyệt đối; dấu sẽ được gắn lại ở cuối.",
      en: "Reverse the absolute value; restore the sign at the end.",
    },
    codeLines: [4],
  });

  snap({
    title: { vi: "rev = 0", en: "rev = 0" },
    note: { vi: "Khởi tạo số đảo ngược rỗng.", en: "Initialize the reversed number as empty." },
    codeLines: [5],
  });

  let position = digits.length - 1;
  while (x > 0) {
    snap({
      title: { vi: `while x > 0 → ${x} > 0 → True`, en: `while x > 0 → ${x} > 0 → True` },
      note: { vi: "Vẫn còn chữ số chưa lấy từ bên phải.", en: "There are still digits to take from the right." },
      codeLines: [6],
    });

    const digit = x % 10;
    snap({
      title: { vi: `digit = x % 10 = ${digit}`, en: `digit = x % 10 = ${digit}` },
      note: { vi: `Lấy chữ số cuối ${digit} của x=${x}.`, en: `Take the last digit ${digit} from x=${x}.` },
      current: position,
      digit,
      codeLines: [7],
    });

    const previousRev = rev;
    rev = rev * 10 + digit;
    visited[position] = true;
    snap({
      title: { vi: `rev = ${previousRev} × 10 + ${digit} = ${rev}`, en: `rev = ${previousRev} × 10 + ${digit} = ${rev}` },
      note: { vi: `Dồn ${digit} vào cuối rev để xây số đảo ngược.`, en: `Append ${digit} to rev to build the reversed number.` },
      current: position,
      digit,
      updateKind: "first",
      codeLines: [8],
    });

    const previousX = x;
    x = Math.floor(x / 10);
    snap({
      title: { vi: `x //= 10 → ${previousX} // 10 = ${x}`, en: `x //= 10 → ${previousX} // 10 = ${x}` },
      note: { vi: "Bỏ chữ số cuối vừa xử lý khỏi x.", en: "Drop the digit that was just processed from x." },
      digit,
      updateKind: "first",
      codeLines: [9],
    });
    position--;
  }

  snap({
    title: { vi: `while x > 0 → ${x} > 0 → False`, en: `while x > 0 → ${x} > 0 → False` },
    note: { vi: "Đã xử lý hết các chữ số.", en: "All digits have been processed." },
    codeLines: [6],
  });

  rev *= sign;
  snap({
    title: { vi: `rev *= sign → ${rev}`, en: `rev *= sign → ${rev}` },
    note: { vi: "Khôi phục dấu ban đầu cho số đã đảo.", en: "Restore the original sign to the reversed number." },
    updateKind: "first",
    codeLines: [10],
  });

  const inRange = MIN_LIMIT <= rev && rev <= LIMIT;
  snap({
    title: { vi: `Kiểm tra 32-bit → ${inRange}`, en: `Check 32-bit range → ${inRange}` },
    note: inRange
      ? { vi: `${rev} nằm trong miền số nguyên 32-bit có dấu.`, en: `${rev} fits in the signed 32-bit integer range.` }
      : { vi: `${rev} vượt miền số nguyên 32-bit có dấu.`, en: `${rev} overflows the signed 32-bit integer range.` },
    codeLines: [11],
  });

  const answer = inRange ? rev : 0;
  snap({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    note: inRange
      ? { vi: `Trả về số đã đảo: ${answer}.`, en: `Return the reversed integer: ${answer}.` }
      : { vi: "Theo yêu cầu đề bài, tràn 32-bit phải trả về 0.", en: "The problem requires returning 0 on 32-bit overflow." },
    final: true,
    answer,
    codeLines: [inRange ? 12 : 13],
  });

  return { original, answer, steps };
}

function buildSteps9(input) {
  const rawX = Array.isArray(input) ? Number(input[0]) : Number(input);
  const steps = [];

  if (!Number.isFinite(rawX) || !Number.isInteger(rawX)) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: false }],
      note: { vi: "x phải là số nguyên.", en: "x must be an integer." },
    });
    return { original: rawX, answer: false, steps };
  }

  const digits = String(Math.abs(rawX)).split("").map(Number);
  const D = digits.length;
  const visited = new Array(D).fill(false);

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      digitPodiumView: {
        digits,
        visited: opts.visited || [...visited],
        current: opts.current !== undefined ? opts.current : -1,
        first: opts.y !== undefined ? opts.y : rawX,
        second: opts.res !== undefined ? opts.res : 0,
        firstLabel: { vi: "y (còn lại)", en: "y (remaining)" },
        secondLabel: { vi: "res (đảo ngược)", en: "res (reversed)" },
        op: "vs",
        resultLabel: { vi: "palindrome?", en: "palindrome?" },
        updateKind: opts.updateKind || null,
        answer: opts.answer,
      },
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Line 3: y = x
  let y = rawX;
  snap({
    title: { vi: `y = x → y = ${y}`, en: `y = x → y = ${y}` },
    y,
    res: 0,
    codeLines: [3],
    vars: [{ name: "x", value: rawX }, { name: "y", value: y }],
    note: {
      vi: `Sao chép x=${rawX} vào y để có thể sửa đổi mà không ảnh hưởng x gốc (vẫn cần x để so sánh ở cuối).`,
      en: `Copy x=${rawX} into y so it can be modified without affecting the original x (still needed for the final comparison).`,
    },
  });

  // Line 4: res = 0
  let res = 0;
  snap({
    title: { vi: "res = 0", en: "res = 0" },
    y,
    res: 0,
    codeLines: [4],
    vars: [{ name: "y", value: y }, { name: "res", value: 0 }],
    note: {
      vi: "res sẽ chứa số y sau khi đảo ngược hoàn toàn từng chữ số.",
      en: "res will hold y with all its digits fully reversed.",
    },
  });

  let iterCount = 0;
  while (y > 0) {
    // Line 5: while y > 0:
    snap({
      title: { vi: `while y > 0 → ${y} > 0 → True`, en: `while y > 0 → ${y} > 0 → True` },
      y,
      res,
      codeLines: [5],
      vars: [{ name: "y", value: y }, { name: "res", value: res }],
      note: {
        vi: `y=${y} > 0 → còn chữ số để đảo, tiếp tục vòng lặp.`,
        en: `y=${y} > 0 → there are still digits to reverse, continue the loop.`,
      },
    });

    // Line 6: res = res * 10 + y % 10
    const digit = y % 10;
    const oldRes = res;
    res = res * 10 + digit;
    const idxLTR = D - 1 - iterCount;
    if (idxLTR >= 0 && idxLTR < D) visited[idxLTR] = true;
    iterCount++;

    snap({
      title: { vi: `res = res*10 + y%10 = ${oldRes}*10 + ${digit} = ${res}`, en: `res = res*10 + y%10 = ${oldRes}*10 + ${digit} = ${res}` },
      y,
      res,
      current: idxLTR,
      visited: [...visited],
      updateKind: "second",
      codeLines: [6],
      vars: [{ name: "digit (y%10)", value: digit }, { name: "res", value: res }],
      note: {
        vi: `Lấy chữ số cuối của y: ${digit}. res = ${oldRes}×10 + ${digit} = ${res}.`,
        en: `Take the last digit of y: ${digit}. res = ${oldRes}×10 + ${digit} = ${res}.`,
      },
    });

    // Line 7: y //= 10
    const oldY = y;
    y = Math.floor(y / 10);
    snap({
      title: { vi: `y //= 10 → y = ${oldY} // 10 = ${y}`, en: `y //= 10 → y = ${oldY} // 10 = ${y}` },
      y,
      res,
      visited: [...visited],
      updateKind: "first",
      codeLines: [7],
      vars: [{ name: "y", value: y }, { name: "res", value: res }],
      note: {
        vi: `Bỏ chữ số cuối vừa xét khỏi y: y = ${y}.`,
        en: `Drop the digit just processed from y: y = ${y}.`,
      },
    });
  }

  // Line 5 (final check): while y > 0 → False
  snap({
    title: { vi: `while y > 0 → ${y} > 0 → False`, en: `while y > 0 → ${y} > 0 → False` },
    y,
    res,
    visited: [...visited],
    codeLines: [5],
    vars: [{ name: "y", value: y }, { name: "res", value: res }],
    note: {
      vi: `y=${y} → đã đảo ngược xong toàn bộ, thoát vòng lặp.`,
      en: `y=${y} → the number has been fully reversed, exit the loop.`,
    },
  });

  // Line 8: if res == x:
  const answer = res === rawX;
  snap({
    title: { vi: `if res == x → ${res} == ${rawX} → ${answer}`, en: `if res == x → ${res} == ${rawX} → ${answer}` },
    y,
    res,
    visited: [...visited],
    codeLines: [8],
    vars: [{ name: "res", value: res }, { name: "x", value: rawX }],
    note: answer
      ? { vi: `res=${res} == x=${rawX} → đảo ngược ra chính nó → sẽ trả True.`, en: `res=${res} == x=${rawX} → reversing gives back the same number → will return True.` }
      : { vi: `res=${res} ≠ x=${rawX} → đảo ngược ra khác → sẽ trả False.`, en: `res=${res} ≠ x=${rawX} → reversing gives a different number → will return False.` },
  });

  if (answer) {
    // Line 9: return True
    snap({
      title: { vi: "return True", en: "return True" },
      y,
      res,
      visited: [...visited],
      final: true,
      codeLines: [9],
      answer: true,
      vars: [{ name: "answer", value: true }],
      note: {
        vi: `${rawX} LÀ palindrome.`,
        en: `${rawX} IS a palindrome.`,
      },
    });
  } else {
    // Line 10: return False
    snap({
      title: { vi: "return False", en: "return False" },
      y,
      res,
      visited: [...visited],
      final: true,
      codeLines: [10],
      answer: false,
      vars: [{ name: "answer", value: false }],
      note: {
        vi: `${rawX} KHÔNG phải palindrome.`,
        en: `${rawX} is NOT a palindrome.`,
      },
    });
  }

  return { original: rawX, answer, steps };
}

/** LeetCode 231: Power of Two — n & (n-1) == 0. */
function buildSteps231(input) {
  const n = Number(Array.isArray(input) ? input[0] : String(input).trim());
  const steps = [];
  const bin = (v) => (v < 0 ? "-" : "") + Math.abs(v).toString(2);
  const width = n < 0 ? 32 : Math.max(4, Math.abs(n).toString(2).length);
  const bits = (value) => (Number(value) >>> 0).toString(2).padStart(32, "0").slice(-width);
  const row = (label, value, tone = "") => ({ label, value, bits: bits(value), tone });
  const stages = [
    { vi: "1. Kiểm tra n", en: "1. Check n" },
    { vi: "2. Tính n - 1", en: "2. Compute n - 1" },
    { vi: "3. AND", en: "3. AND" },
    { vi: "4. Kết luận", en: "4. Decide" },
  ];
  const rule = {
    vi: "Lũy thừa của 2 có đúng một bit 1; n & (n-1) sẽ xóa bit đó.",
    en: "A power of two has exactly one 1-bit; n & (n-1) clears that bit.",
  };
  function snap(o) {
    steps.push({
      title: o.title, arr: [], highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [], vars: o.vars || [], note: o.note,
      bitmaskBasicsView: {
        problemId: 231, mode: "power-of-two", phase: o.phase, stages,
        stageIndex: o.stageIndex, rule, width, rows: o.rows || [], activeBit: -1,
        expression: o.expression || null, progress: null, trail: [], result: o.result || null,
      },
    });
  }
  snap({
    title: { vi: `n = ${n}`, en: `n = ${n}` }, phase: "setup", stageIndex: 0,
    codeLines: [3], vars: [{ name: "n", value: n }, { name: "n (binary)", value: bin(n) }],
    rows: [row("n", n, "source")],
    expression: { vi: "Trước hết n phải dương; sau đó mới áp dụng bit trick.", en: "First n must be positive; then apply the bit trick." },
    note: { vi: "Lũy thừa của 2 có ĐÚNG 1 bit 1. Khi đó n & (n-1) xóa bit đó → 0.", en: "A power of two has EXACTLY one set bit. Then n & (n-1) clears it → 0." },
  });
  if (n <= 0) {
    snap({
      title: { vi: `n ≤ 0 → False`, en: `n ≤ 0 → False` }, phase: "done", stageIndex: 3,
      final: true, codeLines: [4], vars: [{ name: "answer", value: false }], rows: [row("n", n, "danger")],
      expression: { vi: "Điều kiện n > 0 sai, nên không cần thực hiện AND.", en: "The n > 0 condition fails, so no AND operation is needed." },
      result: { label: { vi: "LŨY THỪA CỦA 2?", en: "POWER OF TWO?" }, value: "False", status: "danger" },
      note: { vi: "Số ≤ 0 không phải lũy thừa của 2.", en: "Non-positive is not a power of two." },
    });
    return { original: n, answer: false, steps };
  }
  const andVal = n & (n - 1);
  const answer = andVal === 0;
  snap({
    title: { vi: `n & (n-1) = ${andVal}`, en: `n & (n-1) = ${andVal}` }, phase: "and", stageIndex: 2,
    codeLines: [4],
    vars: [{ name: "n", value: `${n} (${bin(n)})` }, { name: "n-1", value: `${n - 1} (${bin(n - 1)})` }, { name: "n & (n-1)", value: andVal }, { name: "answer", value: answer }],
    rows: [row("n", n, "source"), row("n - 1", n - 1, "active"), row("AND", andVal, answer ? "result" : "danger")],
    expression: { vi: `${bits(n)} & ${bits(n - 1)} = ${bits(andVal)} → ${answer ? "bằng 0" : "khác 0"}.`, en: `${bits(n)} & ${bits(n - 1)} = ${bits(andVal)} → ${answer ? "equals 0" : "is not 0"}.` },
    note: { vi: answer ? `Kết quả = 0 → n có 1 bit duy nhất → là lũy thừa của 2.` : `Kết quả ≠ 0 → n có nhiều bit → KHÔNG phải lũy thừa của 2.`, en: answer ? `Result = 0 → n has a single bit → it IS a power of two.` : `Result ≠ 0 → n has multiple bits → NOT a power of two.` },
  });
  snap({
    title: { vi: answer ? `${andVal} = 0 → True` : `${andVal} ≠ 0 → False`, en: answer ? `${andVal} = 0 → True` : `${andVal} ≠ 0 → False` },
    phase: "done", stageIndex: 3, final: true, codeLines: [4],
    vars: [{ name: "answer", value: answer }],
    rows: [row("n", n, "source"), row("n & (n - 1)", andVal, answer ? "result" : "danger")],
    expression: { vi: answer ? "AND bằng 0: n chỉ có đúng một bit 1." : "AND vẫn khác 0: sau khi xóa một bit 1 vẫn còn bit 1 khác.", en: answer ? "AND is 0: n had exactly one set bit." : "AND is non-zero: another 1-bit remains after clearing one." },
    result: { label: { vi: "LŨY THỪA CỦA 2?", en: "POWER OF TWO?" }, value: answer ? "True" : "False", status: answer ? "success" : "danger" },
    note: { vi: answer ? `${n} là lũy thừa của 2.` : `${n} không phải lũy thừa của 2.`, en: answer ? `${n} is a power of two.` : `${n} is not a power of two.` },
  });
  return { original: n, answer, steps };
}

/** LeetCode 204: Count Primes — Sieve of Eratosthenes. */
function buildSteps204(input) {
  const n = Number(Array.isArray(input) ? input[0] : String(input).trim());
  const steps = [];
  if (n < 3) { steps.push({ title: { vi: `n=${n} < 3 → 0`, en: `n=${n} < 3 → 0` }, arr: [], highlight: [], mark: [], final: true, codeLines: [3], vars: [{ name: "answer", value: 0 }], note: { vi: "Không có số nguyên tố < 2.", en: "No primes below 2." } }); return { original: n, answer: 0, steps }; }
  const isPrime = new Array(n).fill(true);
  isPrime[0] = isPrime[1] = false;
  const arrView = () => isPrime.map((p, i) => (i < 2 ? 0 : p ? 1 : 0));
  function snap(o) { steps.push({ title: o.title, arr: arrView(), sub: isPrime.map((_, i) => `${i}`), highlight: o.highlight || [], mark: o.mark || [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: "is_prime = [True]*n; 0,1 = False", en: "is_prime = [True]*n; 0,1 = False" }, codeLines: [3, 4], vars: [{ name: "n", value: n }], note: { vi: "Sàng Eratosthenes: đánh dấu bội của mỗi số nguyên tố là hợp số (0). Ô = 1 nếu là nguyên tố.", en: "Sieve of Eratosthenes: mark multiples of each prime as composite (0). Cell = 1 if prime." } });
  for (let p = 2; p * p < n; p++) {
    if (isPrime[p]) {
      for (let mult = p * p; mult < n; mult += p) isPrime[mult] = false;
      snap({ title: { vi: `p=${p} nguyên tố → xóa bội từ ${p * p}`, en: `p=${p} prime → cross out multiples from ${p * p}` }, highlight: [p], mark: [], codeLines: [5, 6, 7, 8], vars: [{ name: "p", value: p }, { name: "primes so far", value: isPrime.filter(Boolean).length }], note: { vi: `${p} là nguyên tố. Đánh dấu ${p * p}, ${p * (p + 1)}, ... là hợp số.`, en: `${p} is prime. Mark ${p * p}, ${p * (p + 1)}, ... as composite.` } });
    }
  }
  const count = isPrime.filter(Boolean).length;
  snap({ title: { vi: `Đếm nguyên tố: ${count}`, en: `Count primes: ${count}` }, highlight: [], mark: isPrime.map((p, i) => (p ? i : -1)).filter((x) => x >= 0), final: true, codeLines: [9], vars: [{ name: "answer", value: count }], note: { vi: `Có ${count} số nguyên tố < ${n}.`, en: `There are ${count} primes below ${n}.` } });
  return { original: n, answer: count, steps };
}

/** LeetCode 29: Divide Two Integers — repeated doubling subtraction. */
function buildSteps29(input, params) {
  const dividend = Number(Array.isArray(input) ? input[0] : String(input).trim());
  const divisor = params && params.divisor !== undefined ? Number(params.divisor) : 3;
  const steps = [];
  function snap(o) { steps.push({ title: o.title, arr: [], highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  const INT_MAX = 2 ** 31 - 1, INT_MIN = -(2 ** 31);
  snap({ title: { vi: `${dividend} ÷ ${divisor}`, en: `${dividend} ÷ ${divisor}` }, codeLines: [3], vars: [{ name: "dividend", value: dividend }, { name: "divisor", value: divisor }], note: { vi: "Không dùng phép chia/nhân/mod. Trừ dần bội GẤP ĐÔI của divisor.", en: "No division/multiplication/mod. Subtract doubling multiples of the divisor." } });
  if (dividend === INT_MIN && divisor === -1) { snap({ title: { vi: "Tràn số → INT_MAX", en: "Overflow → INT_MAX" }, final: true, codeLines: [4], vars: [{ name: "answer", value: INT_MAX }], note: { vi: "Trường hợp tràn 32-bit.", en: "32-bit overflow case." } }); return { original: dividend, answer: INT_MAX, steps }; }
  const negative = (dividend < 0) !== (divisor < 0);
  let a = Math.abs(dividend), b = Math.abs(divisor), q = 0;
  snap({ title: { vi: `|a|=${a}, |b|=${b}, âm=${negative}`, en: `|a|=${a}, |b|=${b}, negative=${negative}` }, codeLines: [5, 6], vars: [{ name: "a", value: a }, { name: "b", value: b }, { name: "negative", value: negative }], note: { vi: "Lấy trị tuyệt đối, ghi nhớ dấu.", en: "Take absolute values, remember the sign." } });
  while (a >= b) {
    let temp = b, mult = 1;
    while (a >= (temp << 1)) { temp <<= 1; mult <<= 1; }
    a -= temp; q += mult;
    snap({ title: { vi: `Trừ ${temp} (=${b}×${mult}) → q=${q}, a=${a}`, en: `Subtract ${temp} (=${b}×${mult}) → q=${q}, a=${a}` }, codeLines: [7, 8, 9, 10, 11], vars: [{ name: "subtract", value: temp }, { name: "multiple", value: mult }, { name: "quotient", value: q }, { name: "remaining a", value: a }], note: { vi: `Nhân đôi divisor tới ${temp} (${b}×${mult}) ≤ a. Trừ ra, cộng ${mult} vào thương.`, en: `Double the divisor to ${temp} (${b}×${mult}) ≤ a. Subtract it, add ${mult} to the quotient.` } });
  }
  const answer = negative ? -q : q;
  snap({ title: { vi: `Đáp án: ${answer}`, en: `Answer: ${answer}` }, final: true, codeLines: [12], vars: [{ name: "answer", value: answer }], note: { vi: `${dividend} ÷ ${divisor} = ${answer} (làm tròn về 0).`, en: `${dividend} ÷ ${divisor} = ${answer} (truncated toward zero).` } });
  return { original: dividend, answer, steps };
}

/** LeetCode 258: Add Digits — repeated digit sum (digital root). */
function buildSteps258(input) {
  const start = Array.isArray(input) ? Number(input[0]) : Number(input);
  const steps = [];
  const digitsOf = (x) => String(x).split("").map(Number);
  let num = start;
  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: digitsOf(num), sub: digitsOf(num).map(String), highlight: [], mark: [], codeLines: [2, 3],
    vars: [{ name: "num", value: num }],
    note: { vi: `Cộng dồn các chữ số của num = ${num} cho tới khi chỉ còn 1 chữ số (digital root).`, en: `Repeatedly sum the digits of num = ${num} until a single digit remains (digital root).` },
  });
  if (num < 10) {
    steps.push({
      title: { vi: `${num} đã là 1 chữ số`, en: `${num} is already a single digit` },
      arr: digitsOf(num), sub: digitsOf(num).map(String), highlight: [0], mark: [0], final: true, codeLines: [3, 9],
      vars: [{ name: "answer", value: num }],
      note: { vi: `num=${num} < 10 → bỏ qua vòng lặp, trả về ${num}.`, en: `num=${num} < 10 → skip the loop, return ${num}.` },
    });
    return { original: start, answer: num, steps };
  }
  let round = 0;
  while (num >= 10) {
    round++;
    const digs = digitsOf(num);
    let total = 0;
    let m = num;
    const consumed = [];
    steps.push({
      title: { vi: `Vòng ${round}: num = ${num} (≥ 10)`, en: `Round ${round}: num = ${num} (≥ 10)` },
      arr: digs, sub: digs.map(String), highlight: [], mark: [], codeLines: [3, 4],
      vars: [{ name: "num", value: num }, { name: "total", value: 0 }],
      note: { vi: `num=${num} ≥ 10 → cộng từng chữ số. Đặt total = 0.`, en: `num=${num} ≥ 10 → sum its digits. Set total = 0.` },
    });
    let pos = digs.length - 1;
    while (m > 0) {
      const d = m % 10;
      total += d;
      consumed.push(pos);
      m = Math.floor(m / 10);
      steps.push({
        title: { vi: `+ chữ số ${d}`, en: `+ digit ${d}` },
        arr: digs, sub: digs.map((x, i) => (consumed.includes(i) ? `(${x})` : String(x))), highlight: [pos], mark: [...consumed], codeLines: [5, 6, 7],
        vars: [{ name: "digit = num%10", value: d }, { name: "total", value: total }, { name: "num (còn lại)", value: m }],
        note: { vi: `total += ${d} → ${total}. num //= 10 → ${m}.`, en: `total += ${d} → ${total}. num //= 10 → ${m}.` },
      });
      pos--;
    }
    num = total;
    steps.push({
      title: { vi: `num = total = ${num}`, en: `num = total = ${num}` },
      arr: digitsOf(num), sub: digitsOf(num).map(String), highlight: [], mark: [], codeLines: [8],
      vars: [{ name: "num", value: num }],
      note: { vi: `Kết thúc vòng ${round}: num = ${num}. ${num >= 10 ? "Vẫn ≥ 10 → lặp tiếp." : "< 10 → dừng."}`, en: `End of round ${round}: num = ${num}. ${num >= 10 ? "Still ≥ 10 → loop again." : "< 10 → stop."}` },
    });
  }
  steps.push({
    title: { vi: `Kết quả: ${num}`, en: `Result: ${num}` },
    arr: digitsOf(num), sub: digitsOf(num).map(String), highlight: [0], mark: [0], final: true, codeLines: [9],
    vars: [{ name: "answer", value: num }],
    note: { vi: `Digital root của ${start} = ${num}.`, en: `Digital root of ${start} = ${num}.` },
  });
  return { original: start, answer: num, steps };
}

/** LeetCode 319: Bulb Switcher — divisor parity proof and O(1) solution. */
function buildSteps319(input) {
  const raw = Array.isArray(input) ? Number(input[0]) : Number(input);
  const n = Math.max(0, Math.floor(Number.isFinite(raw) ? raw : 0));
  const answer = Math.floor(Math.sqrt(n));
  const bulbs = new Array(n).fill(0);
  const labels = Array.from({ length: n }, (_, index) => String(index + 1));
  const squareIndexes = [];
  const steps = [{
    title: { vi: "Mỗi bóng bắt đầu ở trạng thái TẮT", en: "Every bulb starts OFF" },
    arr: [...bulbs], sub: labels, highlight: [], mark: [], codeLines: [4],
    vars: [{ name: "n", value: n }, { name: "trạng thái ban đầu", value: "OFF" }],
    note: {
      vi: `Bóng số x bị đảo ở vòng d khi d là một ước của x. Vì vậy số lần bóng x bị đảo chính là số lượng ước của x.`,
      en: `Bulb x is toggled in round d exactly when d divides x. Therefore its toggle count equals its number of divisors.`,
    },
  }];

  for (let bulb = 1; bulb <= n; bulb++) {
    const divisors = [];
    for (let divisor = 1; divisor <= bulb; divisor++) {
      if (bulb % divisor === 0) divisors.push(divisor);
    }
    const isSquare = Number.isInteger(Math.sqrt(bulb));
    if (isSquare) {
      bulbs[bulb - 1] = 1;
      squareIndexes.push(bulb - 1);
    }
    const pairText = [];
    for (let left = 0, right = divisors.length - 1; left <= right; left++, right--) {
      pairText.push(left === right ? `${divisors[left]}×${divisors[right]}` : `(${divisors[left]}, ${divisors[right]})`);
    }
    steps.push({
      title: {
        vi: `Bóng ${bulb}: ${divisors.length} lần đảo → ${isSquare ? "BẬT" : "TẮT"}`,
        en: `Bulb ${bulb}: ${divisors.length} toggles → ${isSquare ? "ON" : "OFF"}`,
      },
      arr: [...bulbs], sub: labels, highlight: [bulb - 1], mark: [...squareIndexes], codeLines: [5],
      vars: [
        { name: "bulb", value: bulb },
        { name: "divisors", value: `[${divisors.join(", ")}]` },
        { name: "toggle_count", value: divisors.length },
        { name: "perfect_square", value: isSquare },
      ],
      note: isSquare ? {
        vi: `Các ước ghép thành ${pairText.join(", ")}. Riêng √${bulb} ghép với chính nó nên tổng số ước là LẺ; bóng còn BẬT.`,
        en: `The divisors pair as ${pairText.join(", ")}. Since √${bulb} pairs with itself, the divisor count is ODD and the bulb stays ON.`,
      } : {
        vi: `Các ước ghép thành từng cặp ${pairText.join(", ")}; tổng số ước là CHẴN nên bóng trở lại TẮT.`,
        en: `The divisors form pairs ${pairText.join(", ")}; the count is EVEN, so the bulb returns to OFF.`,
      },
    });
  }

  const onBulbs = squareIndexes.map((index) => index + 1);
  steps.push({
    title: { vi: `⌊√${n}⌋ = ${answer}`, en: `⌊√${n}⌋ = ${answer}` },
    arr: [...bulbs], sub: labels, highlight: [...squareIndexes], mark: [...squareIndexes], final: true, codeLines: [5],
    vars: [
      { name: "n", value: n },
      { name: "bóng còn BẬT", value: `[${onBulbs.join(", ")}]` },
      { name: "answer", value: answer },
    ],
    note: answer === 0 ? {
      vi: "Không có bóng nào nên đáp án là 0.",
      en: "There are no bulbs, so the answer is 0.",
    } : {
      vi: `Các bóng còn sáng là 1², 2², ..., ${answer}². Có đúng ${answer} số chính phương không vượt quá ${n}, nên trả về isqrt(${n}) = ${answer}.`,
      en: `The bulbs left ON are 1², 2², ..., ${answer}². Exactly ${answer} perfect squares do not exceed ${n}, so return isqrt(${n}) = ${answer}.`,
    },
  });
  return { original: n, answer, steps };
}

function parseRectangles850(input) {
  return String(input)
    .split(";")
    .map((row) => row.split(",").map((value) => Number(value.trim())))
    .filter(
      (rectangle) =>
        rectangle.length === 4 &&
        rectangle.every(Number.isFinite) &&
        rectangle[0] < rectangle[2] &&
        rectangle[1] < rectangle[3]
    );
}

/**
 * LeetCode 850: Rectangle Area II.
 * Sweep horizontal events and maintain the covered x-length with a segment tree.
 */
function buildSteps850(input) {
  const MOD = 1000000007n;
  const rectangles = parseRectangles850(input);

  if (rectangles.length === 0) {
    return {
      original: [],
      answer: 0,
      steps: [{
        title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
        rectangleSweepView: { rectangles: [], xs: [], y: 0, nextY: 0, coveredX: 0, area: 0, addedArea: 0, deltaY: 0, events: [], leafCounts: [], treeNodes: [] },
        codeBlock: 2,
        codeLines: [5],
        vars: [{ name: "answer", value: 0 }],
        note: {
          vi: "Nhập mỗi hình theo x1,y1,x2,y2 và ngăn cách các hình bằng dấu chấm phẩy.",
          en: "Enter each rectangle as x1,y1,x2,y2 and separate rectangles with semicolons.",
        },
        final: true,
      }],
    };
  }

  const xs = [...new Set(rectangles.flatMap(([x1, , x2]) => [x1, x2]))].sort((a, b) => a - b);
  const xIndex = new Map(xs.map((x, index) => [x, index]));
  const segmentCount = xs.length - 1;
  const events = [];

  rectangles.forEach(([x1, y1, x2, y2], rectangleIndex) => {
    events.push({ y: y1, delta: 1, x1, x2, rectangleIndex });
    events.push({ y: y2, delta: -1, x1, x2, rectangleIndex });
  });
  events.sort((a, b) => a.y - b.y || b.delta - a.delta || a.x1 - b.x1);

  const coverCount = new Array(segmentCount * 4 + 5).fill(0);
  const coveredLength = new Array(segmentCount * 4 + 5).fill(0);
  const leafCounts = new Array(segmentCount).fill(0);

  function update(node, left, right, queryLeft, queryRight, delta, trace, depth = 0) {
    trace({
      line: 18,
      node,
      left,
      right,
      depth,
      action: `Kiểm tra [${xs[left]}, ${xs[right + 1]}) có nằm trọn trong đoạn update hay không`,
      actionEn: `Check whether [${xs[left]}, ${xs[right + 1]}) is fully inside the update range`,
    });
    if (queryLeft <= left && right <= queryRight) {
      coverCount[node] += delta;
      trace({
        line: 19,
        node,
        left,
        right,
        depth,
        action: `count[${node}] ${delta > 0 ? "+=" : "-="} 1 → ${coverCount[node]}`,
        actionEn: `count[${node}] ${delta > 0 ? "+=" : "-="} 1 → ${coverCount[node]}`,
      });
    } else {
      const middle = Math.floor((left + right) / 2);
      trace({
        line: 21,
        node,
        left,
        right,
        depth,
        action: `Chia node tại mid=${middle}: [${xs[left]}, ${xs[middle + 1]}) và [${xs[middle + 1]}, ${xs[right + 1]})`,
        actionEn: `Split at mid=${middle}: [${xs[left]}, ${xs[middle + 1]}) and [${xs[middle + 1]}, ${xs[right + 1]})`,
      });
      if (queryLeft <= middle) {
        trace({ line: 22, node, left, right, depth, action: "Đoạn update chạm node con trái", actionEn: "The update range intersects the left child" });
        update(node * 2, left, middle, queryLeft, queryRight, delta, trace, depth + 1);
      }
      if (queryRight > middle) {
        trace({ line: 24, node, left, right, depth, action: "Đoạn update chạm node con phải", actionEn: "The update range intersects the right child" });
        update(node * 2 + 1, middle + 1, right, queryLeft, queryRight, delta, trace, depth + 1);
      }
    }

    if (coverCount[node] > 0) {
      coveredLength[node] = xs[right + 1] - xs[left];
      trace({
        line: 27,
        node,
        left,
        right,
        depth,
        action: `count[${node}] > 0 nên length[${node}] = ${coveredLength[node]}`,
        actionEn: `count[${node}] > 0, so length[${node}] = ${coveredLength[node]}`,
      });
    } else if (left === right) {
      coveredLength[node] = 0;
      trace({
        line: 29,
        node,
        left,
        right,
        depth,
        action: `Node lá không còn được phủ nên length[${node}] = 0`,
        actionEn: `The uncovered leaf now has length[${node}] = 0`,
      });
    } else {
      coveredLength[node] = coveredLength[node * 2] + coveredLength[node * 2 + 1];
      trace({
        line: 31,
        node,
        left,
        right,
        depth,
        action: `Gộp hai con: length[${node}] = ${coveredLength[node * 2]} + ${coveredLength[node * 2 + 1]} = ${coveredLength[node]}`,
        actionEn: `Merge children: length[${node}] = ${coveredLength[node * 2]} + ${coveredLength[node * 2 + 1]} = ${coveredLength[node]}`,
      });
    }
  }

  function snapshotTree() {
    const nodes = [];
    function visit(node, left, right, depth, parent, inheritedCount) {
      const effectiveCount = inheritedCount + coverCount[node];
      const effectiveLength = effectiveCount > 0
        ? xs[right + 1] - xs[left]
        : coveredLength[node];
      nodes.push({
        id: node,
        parent,
        left,
        right,
        depth,
        count: effectiveCount,
        length: effectiveLength,
      });
      if (left === right) return;
      const middle = Math.floor((left + right) / 2);
      visit(node * 2, left, middle, depth + 1, node, effectiveCount);
      visit(node * 2 + 1, middle + 1, right, depth + 1, node, effectiveCount);
    }
    visit(1, 0, segmentCount - 1, 0, null, 0);
    return nodes;
  }

  const steps = [];
  let eventIndex = 0;
  let previousY = events[0].y;
  let currentY = previousY;
  let nextY = previousY;
  let deltaY = 0;
  let coveredBefore = 0;
  let addedArea = 0;
  let area = 0n;
  let currentEvents = [];
  let activeNode = null;
  let activeRange = null;
  let updateRange = null;
  let callDepth = 0;

  const formatExact = (value) => value <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(value)
    : value.toString();

  function makeView(phase, action) {
    return {
      rectangles: rectangles.map((rectangle) => [...rectangle]),
      xs: [...xs],
      y: currentY,
      previousY,
      nextY,
      deltaY,
      coveredBefore,
      coveredX: coveredLength[1],
      addedArea,
      area: Number(area),
      events: currentEvents.map((event) => ({ ...event })),
      leafCounts: [...leafCounts],
      treeNodes: snapshotTree(),
      phase,
      action,
      activeNode,
      activeRange: activeRange ? { ...activeRange } : null,
      updateRange: updateRange ? { ...updateRange } : null,
      callDepth,
    };
  }

  function addStep({ line, titleVi, titleEn, noteVi, noteEn, vars = [], phase = "setup", action = "", final = false }) {
    steps.push({
      title: { vi: titleVi, en: titleEn },
      codeBlock: 2,
      rectangleSweepView: makeView(phase, action || noteVi),
      codeLines: [line],
      vars,
      note: { vi: noteVi, en: noteEn },
      final,
    });
  }

  addStep({
    line: 5,
    titleVi: "Dòng 5 · Khai báo MOD",
    titleEn: "Line 5 · Define MOD",
    noteVi: "MOD = 10⁹ + 7; chỉ dùng khi trả kết quả cuối.",
    noteEn: "MOD = 10⁹ + 7; it is applied to the final result.",
    vars: [{ name: "MOD", value: "1000000007" }],
  });
  addStep({
    line: 6,
    titleVi: "Dòng 6 · Khởi tạo events và x_values",
    titleEn: "Line 6 · Initialize events and x_values",
    noteVi: "events lưu cạnh ngang theo y; x_values dùng để nén tọa độ x.",
    noteEn: "events stores horizontal sweep events; x_values is used for x compression.",
    vars: [{ name: "events", value: "[]" }, { name: "x_values", value: "set()" }],
  });

  const setupEvents = [];
  const setupXValues = new Set();
  rectangles.forEach(([x1, y1, x2, y2], rectangleIndex) => {
    addStep({
      line: 7,
      titleVi: `Dòng 7 · Đọc R${rectangleIndex + 1}`,
      titleEn: `Line 7 · Read R${rectangleIndex + 1}`,
      noteVi: `R${rectangleIndex + 1} = [${x1}, ${y1}, ${x2}, ${y2}].`,
      noteEn: `R${rectangleIndex + 1} = [${x1}, ${y1}, ${x2}, ${y2}].`,
      vars: [{ name: "x1,y1,x2,y2", value: `${x1},${y1},${x2},${y2}` }],
    });
    setupEvents.push(
      { y: y1, delta: 1, x1, x2, rectangleIndex },
      { y: y2, delta: -1, x1, x2, rectangleIndex }
    );
    currentEvents = setupEvents;
    addStep({
      line: 8,
      titleVi: `Dòng 8 · Tạo hai event cho R${rectangleIndex + 1}`,
      titleEn: `Line 8 · Create two events for R${rectangleIndex + 1}`,
      noteVi: `Thêm START tại y=${y1} và END tại y=${y2}, cùng phủ đoạn x=[${x1}, ${x2}).`,
      noteEn: `Add START at y=${y1} and END at y=${y2}, both covering x=[${x1}, ${x2}).`,
      vars: [{ name: "events.length", value: setupEvents.length }],
    });
    setupXValues.add(x1);
    setupXValues.add(x2);
    addStep({
      line: 9,
      titleVi: `Dòng 9 · Thêm biên x của R${rectangleIndex + 1}`,
      titleEn: `Line 9 · Add R${rectangleIndex + 1} x boundaries`,
      noteVi: `x_values = {${[...setupXValues].sort((a, b) => a - b).join(", ")}}.`,
      noteEn: `x_values = {${[...setupXValues].sort((a, b) => a - b).join(", ")}}.`,
      vars: [{ name: "x_values", value: `{${[...setupXValues].sort((a, b) => a - b).join(", ")}}` }],
    });
  });

  currentEvents = events;
  addStep({
    line: 10,
    titleVi: "Dòng 10 · Sắp xếp events theo y",
    titleEn: "Line 10 · Sort events by y",
    noteVi: "Các event cùng y được xử lý chung trước khi chuyển sang dải y tiếp theo.",
    noteEn: "Events sharing the same y are processed together before the next y-strip.",
    vars: [{ name: "event y", value: `[${events.map((event) => event.y).join(", ")}]` }],
  });
  addStep({ line: 11, titleVi: "Dòng 11 · Nén tọa độ x", titleEn: "Line 11 · Compress x-coordinates", noteVi: `xs = [${xs.join(", ")}].`, noteEn: `xs = [${xs.join(", ")}].`, vars: [{ name: "xs", value: `[${xs.join(", ")}]` }] });
  addStep({ line: 12, titleVi: "Dòng 12 · Tạo bảng x → index", titleEn: "Line 12 · Build x → index map", noteVi: `index = {${xs.map((x, index) => `${x}:${index}`).join(", ")}}.`, noteEn: `index = {${xs.map((x, index) => `${x}:${index}`).join(", ")}}.`, vars: [{ name: "index", value: `{${xs.map((x, index) => `${x}:${index}`).join(", ")}}` }] });
  addStep({ line: 13, titleVi: "Dòng 13 · Đếm đoạn x cơ sở", titleEn: "Line 13 · Count elementary x segments", noteVi: `m = len(xs) - 1 = ${segmentCount}.`, noteEn: `m = len(xs) - 1 = ${segmentCount}.`, vars: [{ name: "m", value: segmentCount }] });
  addStep({ line: 14, titleVi: "Dòng 14 · Khởi tạo count", titleEn: "Line 14 · Initialize count", noteVi: "count[node] lưu số event đang phủ toàn bộ node.", noteEn: "count[node] stores how many active ranges fully cover the node.", vars: [{ name: "count", value: `[0] × ${coverCount.length}` }] });
  addStep({ line: 15, titleVi: "Dòng 15 · Khởi tạo length", titleEn: "Line 15 · Initialize length", noteVi: "length[1] sẽ luôn là tổng chiều dài x đang được phủ.", noteEn: "length[1] will always hold the total covered x-length.", vars: [{ name: "length[1]", value: 0 }] });
  addStep({ line: 33, titleVi: "Dòng 33 · area = 0", titleEn: "Line 33 · area = 0", noteVi: "Bắt đầu cộng diện tích từng dải ngang.", noteEn: "Start accumulating horizontal strip areas.", vars: [{ name: "area", value: 0 }] });
  addStep({ line: 34, titleVi: "Dòng 34 · previous_y", titleEn: "Line 34 · previous_y", noteVi: `previous_y = ${previousY}, là y của event đầu tiên.`, noteEn: `previous_y = ${previousY}, the first event y.`, vars: [{ name: "previous_y", value: previousY }] });
  addStep({ line: 35, titleVi: "Dòng 35 · i = 0", titleEn: "Line 35 · i = 0", noteVi: "i trỏ tới event chưa xử lý tiếp theo.", noteEn: "i points to the next unprocessed event.", vars: [{ name: "i", value: 0 }] });

  currentEvents = [];
  while (eventIndex < events.length) {
    addStep({
      line: 36,
      titleVi: `Dòng 36 · i=${eventIndex} < ${events.length}`,
      titleEn: `Line 36 · i=${eventIndex} < ${events.length}`,
      noteVi: "Điều kiện đúng nên tiếp tục vòng sweep.",
      noteEn: "The condition is true, so the sweep continues.",
      vars: [{ name: "i", value: eventIndex }, { name: "len(events)", value: events.length }],
      phase: "sweep",
    });

    currentY = events[eventIndex].y;
    let nextEventIndex = eventIndex;
    while (nextEventIndex < events.length && events[nextEventIndex].y === currentY) nextEventIndex += 1;
    nextY = nextEventIndex < events.length ? events[nextEventIndex].y : currentY;
    currentEvents = [];
    addStep({
      line: 37,
      titleVi: `Dòng 37 · y = ${currentY}`,
      titleEn: `Line 37 · y = ${currentY}`,
      noteVi: `Lấy y từ events[${eventIndex}].`,
      noteEn: `Read y from events[${eventIndex}].`,
      vars: [{ name: "y", value: currentY }, { name: "previous_y", value: previousY }],
      phase: "sweep",
    });

    deltaY = currentY - previousY;
    coveredBefore = coveredLength[1];
    const addedAreaExact = BigInt(coveredBefore) * BigInt(deltaY);
    addedArea = formatExact(addedAreaExact);
    area = (area + addedAreaExact) % MOD;
    addStep({
      line: 38,
      titleVi: `Dòng 38 · Cộng diện tích dải y=[${previousY}, ${currentY})`,
      titleEn: `Line 38 · Add strip y=[${previousY}, ${currentY})`,
      noteVi: `area += ${coveredBefore} × (${currentY} − ${previousY}) = ${addedArea}; area = ${Number(area)}.`,
      noteEn: `area += ${coveredBefore} × (${currentY} − ${previousY}) = ${addedArea}; area = ${Number(area)}.`,
      vars: [{ name: "length[1]", value: coveredBefore }, { name: "delta_y", value: deltaY }, { name: "added_area", value: addedArea }, { name: "area", value: Number(area) }],
      phase: "area",
    });

    while (eventIndex < events.length && events[eventIndex].y === currentY) {
      addStep({
        line: 39,
        titleVi: `Dòng 39 · Event ${eventIndex} có y=${currentY}`,
        titleEn: `Line 39 · Event ${eventIndex} has y=${currentY}`,
        noteVi: "Event thuộc nhóm y hiện tại nên được cập nhật vào Segment Tree.",
        noteEn: "This event belongs to the current y-group and must update the Segment Tree.",
        vars: [{ name: "i", value: eventIndex }, { name: "events[i][0] == y", value: true }],
        phase: "event",
      });

      const event = events[eventIndex];
      currentEvents.push({ ...event });
      addStep({
        line: 40,
        titleVi: `Dòng 40 · Giải nén ${event.delta > 0 ? "START" : "END"} R${event.rectangleIndex + 1}`,
        titleEn: `Line 40 · Unpack ${event.delta > 0 ? "START" : "END"} R${event.rectangleIndex + 1}`,
        noteVi: `delta=${event.delta}, đoạn x=[${event.x1}, ${event.x2}).`,
        noteEn: `delta=${event.delta}, x-range=[${event.x1}, ${event.x2}).`,
        vars: [{ name: "delta", value: event.delta }, { name: "x1", value: event.x1 }, { name: "x2", value: event.x2 }],
        phase: "event",
      });

      const left = xIndex.get(event.x1);
      const right = xIndex.get(event.x2) - 1;
      updateRange = { left, right, x1: event.x1, x2: event.x2, delta: event.delta };
      activeNode = 1;
      activeRange = { left: 0, right: segmentCount - 1 };
      callDepth = 0;
      for (let index = left; index <= right; index++) leafCounts[index] += event.delta;
      addStep({
        line: 41,
        titleVi: `Dòng 41 · Gọi update cho [${event.x1}, ${event.x2})`,
        titleEn: `Line 41 · Call update for [${event.x1}, ${event.x2})`,
        noteVi: `Chỉ số nén cần cập nhật: [${left}, ${right}], delta=${event.delta}.`,
        noteEn: `Compressed update indexes: [${left}, ${right}], delta=${event.delta}.`,
        vars: [{ name: "ql", value: left }, { name: "qr", value: right }, { name: "delta", value: event.delta }],
        phase: "update-call",
      });

      update(1, 0, segmentCount - 1, left, right, event.delta, (traceState) => {
        activeNode = traceState.node;
        activeRange = { left: traceState.left, right: traceState.right };
        callDepth = traceState.depth;
        addStep({
          line: traceState.line,
          titleVi: `Dòng ${traceState.line} · Node #${traceState.node} [${xs[traceState.left]}, ${xs[traceState.right + 1]})`,
          titleEn: `Line ${traceState.line} · Node #${traceState.node} [${xs[traceState.left]}, ${xs[traceState.right + 1]})`,
          noteVi: traceState.action,
          noteEn: traceState.actionEn,
          vars: [
            { name: "node", value: traceState.node },
            { name: "left,right", value: `${traceState.left},${traceState.right}` },
            { name: "depth", value: traceState.depth },
            { name: "count[node]", value: coverCount[traceState.node] },
            { name: "length[node]", value: coveredLength[traceState.node] },
          ],
          phase: "segment-tree",
        });
      });

      activeNode = null;
      activeRange = null;
      eventIndex += 1;
      addStep({
        line: 42,
        titleVi: `Dòng 42 · i tăng thành ${eventIndex}`,
        titleEn: `Line 42 · Increment i to ${eventIndex}`,
        noteVi: `Event vừa xử lý xong; length[1] = ${coveredLength[1]}.`,
        noteEn: `The event is complete; length[1] = ${coveredLength[1]}.`,
        vars: [{ name: "i", value: eventIndex }, { name: "length[1]", value: coveredLength[1] }],
        phase: "event-done",
      });
    }

    updateRange = null;
    activeNode = null;
    activeRange = null;
    previousY = currentY;
    addStep({
      line: 43,
      titleVi: `Dòng 43 · previous_y = ${previousY}`,
      titleEn: `Line 43 · previous_y = ${previousY}`,
      noteVi: `Nhóm event tại y=${currentY} hoàn tất; covered_x cho dải tiếp theo là ${coveredLength[1]}.`,
      noteEn: `The y=${currentY} event group is complete; covered_x for the next strip is ${coveredLength[1]}.`,
      vars: [{ name: "previous_y", value: previousY }, { name: "covered_x", value: coveredLength[1] }, { name: "area", value: Number(area) }],
      phase: "level-done",
    });
  }

  currentEvents = [];
  deltaY = 0;
  addedArea = 0;
  addStep({
    line: 36,
    titleVi: `Dòng 36 · i=${eventIndex}, vòng lặp kết thúc`,
    titleEn: `Line 36 · i=${eventIndex}, loop ends`,
    noteVi: "i đã bằng len(events), không còn event nào.",
    noteEn: "i equals len(events), so no events remain.",
    vars: [{ name: "i", value: eventIndex }, { name: "len(events)", value: events.length }],
    phase: "done",
  });
  addStep({
    line: 44,
    titleVi: `Dòng 44 · Trả kết quả ${Number(area)}`,
    titleEn: `Line 44 · Return ${Number(area)}`,
    noteVi: `return area % MOD = ${Number(area)}.`,
    noteEn: `return area % MOD = ${Number(area)}.`,
    vars: [{ name: "area % MOD", value: Number(area) }],
    phase: "return",
    final: true,
  });

  return { original: rectangles, answer: Number(area), steps };
}

// ─── 1739 Approach 2: simulate layer-by-layer with height/floor/total ────────
function buildSteps1739Approach2(input) {
  const n = Array.isArray(input) ? input[0] : Number(input);
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be a positive integer");
  if (n > 100000) throw new Error("n must be at most 100000");

  const steps = [];
  let height = 0, total = 0, floor = 0;

  const snap = (o) => steps.push({ ...o });

  snap({
    title: { vi: `n = ${n} — Cách 2: mô phỏng từng tầng`, en: `n = ${n} — Approach 2: simulate layer by layer` },
    note: {
      vi: "Tăng height từng bước. Mỗi tầng mới thêm floor += height (thêm hàng mới vào sàn), total += floor. Tiếp tục cho đến khi total ≥ n.",
      en: "Increment height step by step. Each new layer adds floor += height (a new row to the base), total += floor. Continue until total ≥ n.",
    },
    arr: [n], highlight: [], mark: [], codeLines: [2, 3, 4],
    vars: [{ name: "height", value: 0 }, { name: "floor", value: 0 }, { name: "total", value: 0 }],
    buildingBoxesView: { phase: "init", k: 0, total: 0, floor: 0, n, remainder: n, extraFloor: 0, complete: false },
  });

  // Phase 1 — grow height until total >= n
  while (total < n) {
    height++;
    floor += height;
    total += floor;
    snap({
      title: { vi: `height=${height}: floor+=${height} → ${floor}, total+=${floor} → ${total}`, en: `height=${height}: floor+=${height} → ${floor}, total+=${floor} → ${total}` },
      note: {
        vi: `Thêm hàng ${height} vào đế tháp: floor = ${floor}, total = ${total}. ${total >= n ? `total ≥ ${n} → dừng vòng lặp.` : `Chưa đủ ${n} hộp, tiếp tục.`}`,
        en: `Add row ${height} to the base: floor = ${floor}, total = ${total}. ${total >= n ? `total ≥ ${n} → exit loop.` : `Not yet ${n} boxes, continue.`}`,
      },
      arr: [n], highlight: [], mark: [], codeLines: [5, 6, 7, 8],
      vars: [
        { name: "height", value: height },
        { name: "floor", value: floor },
        { name: "total", value: total },
        { name: "remaining", value: Math.max(0, n - total) },
      ],
      buildingBoxesView: { phase: "layer", k: height, total: Math.min(total, n), floor, n, remainder: Math.max(0, n - total), extraFloor: 0, complete: total >= n },
    });
  }

  // Check exact fit
  if (total === n) {
    snap({
      title: { vi: `total == n == ${n} → trả về floor = ${floor}`, en: `total == n == ${n} → return floor = ${floor}` },
      note: {
        vi: `Tháp vừa khớp chính xác n hộp. Không cần ô sàn thêm. Đáp án = ${floor}.`,
        en: `The pyramid holds exactly n boxes. No extra floor cell needed. Answer = ${floor}.`,
      },
      arr: [n], highlight: [], mark: [], codeLines: [9, 10], final: true,
      vars: [{ name: "answer", value: floor }, { name: "total", value: total }, { name: "floor", value: floor }],
      buildingBoxesView: { phase: "done", k: height, total, floor, n, remainder: 0, extraFloor: 0, complete: true },
    });
    return { input, answer: floor, steps };
  }

  // Roll back one layer
  total -= floor;
  floor -= height;
  const kFull = height - 1;

  snap({
    title: { vi: `Lui lại 1 tầng: total -= ${floor + height} → ${total}, floor -= ${height} → ${floor}`, en: `Undo last layer: total -= ${floor + height} → ${total}, floor -= ${height} → ${floor}` },
    note: {
      vi: `Tháp ${kFull} tầng (không phải ${height}) là tháp đầy đủ cuối cùng chứa ≤ ${n} hộp. Còn ${n - total} hộp dư cần được đỡ bằng các ô sàn lẻ.`,
      en: `The ${kFull}-layer (not ${height}) pyramid is the last full pyramid with ≤ ${n} boxes. ${n - total} boxes remain and need individual floor cells.`,
    },
    arr: [n], highlight: [], mark: [], codeLines: [11, 12],
    vars: [
      { name: "height (rolled back)", value: kFull },
      { name: "floor (rolled back)", value: floor },
      { name: "total (rolled back)", value: total },
      { name: "remaining", value: n - total },
    ],
    buildingBoxesView: { phase: "between", k: kFull, total, floor, n, remainder: n - total, extraFloor: 0, complete: false },
  });

  // Phase 2 — add floor cells one by one
  let x = 0, extraFloor = 0;

  snap({
    title: { vi: `Bước 2: thêm ô sàn lẻ — còn ${n - total} hộp`, en: `Step 2: add individual floor cells — ${n - total} boxes remaining` },
    note: {
      vi: "Mỗi ô sàn lẻ ở hàng x có thể đỡ thêm x hộp phía trên. Tăng x từ 1 cho đến khi total ≥ n.",
      en: "Each extra floor cell in row x supports x more boxes above. Increment x from 1 until total ≥ n.",
    },
    arr: [n], highlight: [], mark: [], codeLines: [14, 15],
    vars: [{ name: "remaining", value: n - total }, { name: "floor so far", value: floor }],
    buildingBoxesView: { phase: "extra-init", k: kFull, total, floor, n, remainder: n - total, extraFloor: 0, complete: false },
  });

  while (total < n) {
    x++;
    total += x;
    floor++;
    extraFloor++;
    snap({
      title: { vi: `x=${x}: total += ${x} → ${total}, floor++ → ${floor}`, en: `x=${x}: total += ${x} → ${total}, floor++ → ${floor}` },
      note: {
        vi: `Ô sàn lẻ thứ ${extraFloor} ở hàng x=${x} đỡ thêm ${x} hộp. total = ${total}${total >= n ? ` ≥ ${n} → xong!` : ` < ${n}, tiếp tục.`}`,
        en: `Extra floor cell ${extraFloor} at row x=${x} supports ${x} boxes. total = ${total}${total >= n ? ` ≥ ${n} → done!` : ` < ${n}, continue.`}`,
      },
      arr: [n], highlight: [], mark: [], codeLines: [15, 16, 17],
      vars: [
        { name: "x", value: x },
        { name: `+${x} boxes`, value: `total → ${total}` },
        { name: "floor", value: floor },
        { name: "remaining", value: Math.max(0, n - total) },
      ],
      buildingBoxesView: { phase: "extra", k: kFull, total: Math.min(total, n), floor, n, remainder: Math.max(0, n - total), extraFloor, complete: total >= n },
    });
  }

  snap({
    title: { vi: `Kết quả: ${floor} ô sàn`, en: `Answer: ${floor} floor cells` },
    note: {
      vi: `Tháp ${kFull} tầng đầy đủ + ${extraFloor} ô sàn lẻ = ${floor} ô. Chứa ≥ ${n} hộp.`,
      en: `Full ${kFull}-layer pyramid + ${extraFloor} extra floor cells = ${floor} cells. Holds ≥ ${n} boxes.`,
    },
    arr: [n], highlight: [], mark: [], final: true, codeLines: [19],
    vars: [{ name: "answer", value: floor }, { name: "total", value: total }, { name: "n", value: n }],
    buildingBoxesView: { phase: "done", k: kFull, total, floor, n, remainder: 0, extraFloor, complete: true },
  });

  return { input, answer: floor, steps };
}
function buildSteps1739(input) {
  const n = Array.isArray(input) ? input[0] : Number(input);
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be a positive integer");
  if (n > 100000) throw new Error("n must be at most 100000");

  const steps = [];

  // ── layer info for display ────────────────────────────────────────────────
  // Layer k (1-indexed from bottom) has triangular number T(k) = k*(k+1)/2 boxes
  // and a floor footprint of T(k) cells arranged as a right-isosceles triangle.
  //
  // View: for each step we store a `buildingBoxesView` with layer data
  // so the renderer can draw a 2D triangle footprint of each layer.

  function triNum(k) { return k * (k + 1) / 2; }
  function fullPyramidTotal(k) { return k * (k + 1) * (k + 2) / 6; }

  // Step 1 — find k (full pyramid layers)
  let k = 0, total = 0, floor = 0;

  const snap = (o) => steps.push({ ...o });

  snap({
    title: { vi: `n = ${n} hộp cần đặt vào góc phòng`, en: `n = ${n} boxes to place in a room corner` },
    note: {
      vi: "Xây hình tháp tam giác 3D. Tầng k từ đỉnh có T(k) = k*(k+1)/2 hộp; sàn tháp k tầng cần T(k) ô. Bước 1: tìm số tầng tháp đầy đủ.",
      en: "Build a 3D triangular pyramid in a corner. Layer k from top holds T(k) = k*(k+1)/2 boxes; a k-layer pyramid needs T(k) floor cells. Step 1: find the number of full layers.",
    },
    arr: [n], highlight: [], mark: [], codeLines: [3, 4], vars: [{ name: "n", value: n }],
    buildingBoxesView: { phase: "init", k: 0, total: 0, floor: 0, n, remainder: n, extraFloor: 0, complete: false },
  });

  while (total + triNum(k + 1) <= n) {
    k++;
    const layerBoxes = triNum(k);
    total += layerBoxes;
    floor += k;
    snap({
      title: { vi: `Tầng ${k}: thêm T(${k}) = ${layerBoxes} hộp → total = ${total}, floor = ${floor}`, en: `Layer ${k}: add T(${k}) = ${layerBoxes} boxes → total = ${total}, floor = ${floor}` },
      note: {
        vi: `Tầng ${k} có T(${k}) = ${k}×${k + 1}/2 = ${layerBoxes} hộp. Sàn tháp ${k} tầng cần ${floor} ô (T(${k}) = ${triNum(k)}).`,
        en: `Layer ${k} holds T(${k}) = ${k}×${k + 1}/2 = ${layerBoxes} boxes. The ${k}-layer pyramid needs ${floor} floor cells (T(${k}) = ${triNum(k)}).`,
      },
      arr: [n], highlight: [], mark: [], codeLines: [4, 5, 6, 7],
      vars: [
        { name: "k", value: k },
        { name: `T(${k})`, value: layerBoxes },
        { name: "total", value: total },
        { name: "floor", value: floor },
        { name: "remaining", value: n - total },
      ],
      buildingBoxesView: { phase: "layer", k, total, floor, n, remainder: n - total, extraFloor: 0, complete: false },
    });
  }

  // Summarise full-pyramid phase
  if (k > 0) {
    snap({
      title: { vi: `Tháp ${k} tầng chứa ${total}/${n} hộp, sàn = ${floor}`, en: `${k}-layer pyramid holds ${total}/${n} boxes, floor = ${floor}` },
      note: {
        vi: `Thêm tầng ${k + 1} sẽ cần T(${k + 1}) = ${triNum(k + 1)} hộp nữa → total = ${total + triNum(k + 1)} > ${n}. Chuyển sang bước 2.`,
        en: `Adding layer ${k + 1} would need T(${k + 1}) = ${triNum(k + 1)} more boxes → total = ${total + triNum(k + 1)} > ${n}. Move to step 2.`,
      },
      arr: [n], highlight: [], mark: [], codeLines: [8, 9],
      vars: [{ name: "k (final)", value: k }, { name: "total", value: total }, { name: "floor", value: floor }, { name: "remainder", value: n - total }],
      buildingBoxesView: { phase: "between", k, total, floor, n, remainder: n - total, extraFloor: 0, complete: false },
    });
  }

  // Step 2 — add individual floor boxes
  let j = 0, extraFloor = 0;
  const remainder0 = n - total;

  if (remainder0 > 0) {
    snap({
      title: { vi: `Bước 2: còn ${remainder0} hộp dư, thêm từng ô sàn`, en: `Step 2: ${remainder0} boxes remaining, add floor cells one by one` },
      note: {
        vi: "Mỗi ô sàn mới ở hàng j có thể đỡ thêm j hộp phía trên. Tăng j từ 1 đến khi bù đủ phần dư.",
        en: "Each new floor cell in row j can support j additional boxes above. Increase j from 1 until the remainder is covered.",
      },
      arr: [n], highlight: [], mark: [], codeLines: [9, 10],
      vars: [{ name: "remainder", value: remainder0 }, { name: "floor so far", value: floor }],
      buildingBoxesView: { phase: "extra-init", k, total, floor, n, remainder: remainder0, extraFloor: 0, complete: false },
    });
  }

  while (total < n) {
    j++;
    total += j;
    floor++;
    extraFloor++;
    snap({
      title: { vi: `Ô sàn thứ ${extraFloor} (hàng j=${j}): +${j} hộp → total = ${Math.min(total, n)}, floor = ${floor}`, en: `Extra floor cell ${extraFloor} (row j=${j}): +${j} boxes → total = ${Math.min(total, n)}, floor = ${floor}` },
      note: {
        vi: `Ô sàn ở hàng j=${j} của tầng ${k + 1} đỡ thêm ${j} hộp. total = ${total}${total >= n ? ` ≥ ${n} → đủ rồi!` : ` < ${n}, tiếp tục.`}`,
        en: `Floor cell at row j=${j} of layer ${k + 1} supports ${j} additional boxes. total = ${total}${total >= n ? ` ≥ ${n} → done!` : ` < ${n}, continue.`}`,
      },
      arr: [n], highlight: [], mark: [], codeLines: [10, 11, 12, 13],
      vars: [
        { name: "j", value: j },
        { name: `+${j} boxes`, value: `total → ${total}` },
        { name: "floor", value: floor },
        { name: "remaining", value: Math.max(0, n - total) },
      ],
      buildingBoxesView: { phase: "extra", k, total: Math.min(total, n), floor, n, remainder: Math.max(0, n - total), extraFloor, complete: total >= n },
    });
  }

  snap({
    title: { vi: `Kết quả: ${floor} ô sàn`, en: `Answer: ${floor} floor cells` },
    note: {
      vi: `Tháp ${k} tầng đầy đủ (sàn T(${k}) = ${triNum(k)} ô) + ${extraFloor} ô sàn riêng lẻ = ${floor} ô. Đủ chứa ≥ ${n} hộp.`,
      en: `Full ${k}-layer pyramid (floor T(${k}) = ${triNum(k)} cells) + ${extraFloor} individual floor cells = ${floor} cells. Supports ≥ ${n} boxes.`,
    },
    arr: [n], highlight: [], mark: [], final: true, codeLines: [15],
    vars: [{ name: "answer", value: floor }, { name: "total", value: total }, { name: "n", value: n }],
    buildingBoxesView: { phase: "done", k, total, floor, n, remainder: 0, extraFloor, complete: true },
  });

  return { input, answer: floor, steps };
}

module.exports = {
  850: {
    id: 850,
    difficulty: "hard",
    slug: "rectangle-area-ii",
    category: { key: "math", vi: "Toán học", en: "Math" },
    tags: [
      { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
      { key: "sweep-line", vi: "Sweep Line", en: "Sweep Line" },
    ],
    title: { vi: "Rectangle Area II", en: "Rectangle Area II" },
    titleVi: { vi: "Diện tích hợp các hình chữ nhật", en: "Union area of rectangles" },
    statement: {
      vi: "Cho nhiều hình chữ nhật song song với trục tọa độ. Tính tổng diện tích được phủ ít nhất một lần, modulo 10^9+7. Nhập mỗi hình theo x1,y1,x2,y2; ngăn cách bằng dấu chấm phẩy.",
      en: "Given axis-aligned rectangles, return the total area covered by at least one rectangle modulo 10^9+7. Enter each rectangle as x1,y1,x2,y2; separate rectangles with semicolons.",
    },
    defaultInput: "0,0,2,2;1,0,2,3;1,0,3,1",
    inputKind: "string",
    debugMode: "semantic",
    inputLabel: { vi: "rectangles (x1,y1,x2,y2; ...)", en: "rectangles (x1,y1,x2,y2; ...)" },
    extraParams: [],
    approach: [
      { vi: "Tạo event +1 tại y1 và event −1 tại y2 cho mỗi đoạn [x1,x2).", en: "Create a +1 event at y1 and a −1 event at y2 for every [x1,x2) interval." },
      { vi: "Nén tọa độ x; Segment Tree lưu tổng chiều dài x đang được phủ.", en: "Compress x-coordinates; the Segment Tree stores the total currently covered x-length." },
      { vi: "Giữa hai mức y liên tiếp, cộng covered_x × delta_y vào diện tích.", en: "Between consecutive y-levels, add covered_x × delta_y to the area." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Có 2n events; mỗi event cập nhật Segment Tree trong O(log n).",
        en: "There are 2n events; each updates the Segment Tree in O(log n).",
      },
    },
    code: [
      "from typing import List",
      "",
      "class Solution:",
      "    def rectangleArea(self, rectangles: List[List[int]]) -> int:",
      "        MOD = 10**9 + 7",
      "        events, x_values = [], set()",
      "        for x1, y1, x2, y2 in rectangles:",
      "            events += [(y1, 1, x1, x2), (y2, -1, x1, x2)]",
      "            x_values.update((x1, x2))",
      "        events.sort()",
      "        xs = sorted(x_values)",
      "        index = {x: i for i, x in enumerate(xs)}",
      "        m = len(xs) - 1",
      "        count = [0] * (4 * m)",
      "        length = [0] * (4 * m)",
      "",
      "        def update(node, left, right, ql, qr, delta):",
      "            if ql <= left and right <= qr:",
      "                count[node] += delta",
      "            else:",
      "                mid = (left + right) // 2",
      "                if ql <= mid:",
      "                    update(node * 2, left, mid, ql, qr, delta)",
      "                if qr > mid:",
      "                    update(node * 2 + 1, mid + 1, right, ql, qr, delta)",
      "            if count[node] > 0:",
      "                length[node] = xs[right + 1] - xs[left]",
      "            elif left == right:",
      "                length[node] = 0",
      "            else:",
      "                length[node] = length[node * 2] + length[node * 2 + 1]",
      "",
      "        area = 0",
      "        previous_y = events[0][0]",
      "        i = 0",
      "        while i < len(events):",
      "            y = events[i][0]",
      "            area += length[1] * (y - previous_y)",
      "            while i < len(events) and events[i][0] == y:",
      "                _, delta, x1, x2 = events[i]",
      "                update(1, 0, m - 1, index[x1], index[x2] - 1, delta)",
      "                i += 1",
      "            previous_y = y",
      "        return area % MOD",
    ],
    liveArgs: (input) => [parseRectangles850(input)],
    builder: buildSteps850,
  },
  258: {
    id: 258, difficulty: "easy", slug: "add-digits",
    category: { key: "math", vi: "Toán học", en: "Math" },
    title: { vi: "Add Digits", en: "Add Digits" },
    titleVi: { vi: "Cộng chữ số tới khi còn 1 chữ số (digital root)", en: "Add digits until single (digital root)" },
    statement: { vi: "Lặp cộng các chữ số của num tới khi kết quả chỉ còn 1 chữ số. Nhập num.", en: "Repeatedly add the digits of num until the result has a single digit. Enter num." },
    defaultInput: [38], inputKind: "integer", inputLabel: { vi: "num", en: "num" }, singleInput: true, extraParams: [],
    approach: [
      { vi: "Vòng ngoài: khi num ≥ 10, cộng các chữ số của num.", en: "Outer loop: while num ≥ 10, sum its digits." },
      { vi: "Vòng trong: total += num%10; num //= 10.", en: "Inner loop: total += num%10; num //= 10." },
      { vi: "Gán num = total và lặp lại tới khi < 10.", en: "Set num = total and repeat until < 10." },
    ],
    complexity: { time: "O(log n) mỗi vòng", space: "O(1)", note: { vi: "Số chữ số giảm nhanh nên rất ít vòng.", en: "The digit count shrinks fast, so very few rounds." } },
    code: [
      "class Solution:",
      "    def addDigits(self, num):",
      "        while num >= 10:",
      "            total = 0",
      "            while num > 0:",
      "                total += num % 10",
      "                num //= 10",
      "            num = total",
      "        return num",
    ],
    builder: buildSteps258,
  },
  319: {
    id: 319, difficulty: "medium", slug: "bulb-switcher",
    category: { key: "math", vi: "Toán học", en: "Math" },
    title: { vi: "Bulb Switcher", en: "Bulb Switcher" },
    titleVi: { vi: "Công tắc bóng đèn (số chính phương)", en: "Bulb switcher (perfect squares)" },
    statement: { vi: "n bóng đèn ban đầu tắt. Vòng i đảo mọi bóng là bội của i. Đếm số bóng còn sáng sau n vòng. Nhập n.", en: "n bulbs start off. In round i, toggle every bulb that is a multiple of i. Count bulbs ON after n rounds. Enter n." },
    defaultInput: [6], inputKind: "nonneg", inputLabel: { vi: "n (0 đến 20 để mô phỏng)", en: "n (0 to 20 for visualization)" }, singleInput: true, maxInput: 20, extraParams: [],
    approach: [
      { vi: "Bóng i bị đảo một lần cho mỗi ước của i.", en: "Bulb i is toggled once per divisor of i." },
      { vi: "Chỉ số chính phương có số ước LẺ → còn sáng.", en: "Only perfect squares have an ODD divisor count → stay ON." },
      { vi: "Số bóng sáng = số chính phương ≤ n = ⌊√n⌋ (đáp án O(1)).", en: "Bulbs ON = perfect squares ≤ n = ⌊√n⌋ (the O(1) answer)." },
    ],
    complexity: { time: "O(1)", space: "O(1)", note: { vi: "Lời giải chỉ tính căn bậc hai; visualization liệt kê ước để chứng minh công thức.", en: "The solution only computes a square root; the visualization lists divisors to prove the formula." } },
    code: [
      "import math",
      "",
      "class Solution:",
      "    def bulbSwitch(self, n: int) -> int:",
      "        return math.isqrt(n)",
    ],
    builder: buildSteps319,
  },
  29: {
    id: 29, difficulty: "medium", slug: "divide-two-integers",
    category: { key: "math", vi: "Toán học", en: "Math" },
    title: { vi: "Divide Two Integers", en: "Divide Two Integers" },
    titleVi: { vi: "Chia hai số nguyên (không dùng /)", en: "Divide two integers (no /)" },
    statement: { vi: "Chia dividend cho divisor không dùng phép nhân/chia/mod. Làm tròn về 0. Nhập dividend; divisor trong tham số.", en: "Divide dividend by divisor without *, /, %. Truncate toward zero. Enter dividend; divisor as a parameter." },
    defaultInput: [10], inputKind: "integer", inputLabel: { vi: "dividend", en: "dividend" },
    extraParams: [{ key: "divisor", label: { vi: "divisor", en: "divisor" }, default: 3 }],
    approach: [{ vi: "Lấy trị tuyệt đối, ghi nhớ dấu.", en: "Take absolute values, remember the sign." }, { vi: "Nhân đôi divisor tới khi vừa ≤ phần còn lại, trừ ra, cộng bội vào thương.", en: "Double the divisor until it fits, subtract it, add the multiple to the quotient." }, { vi: "Xử lý tràn INT_MIN / -1.", en: "Handle the INT_MIN / -1 overflow case." }],
    complexity: { time: "O(log²n)", space: "O(1)", note: { vi: "Mỗi vòng ngoài giảm a ít nhất một nửa.", en: "Each outer loop reduces a by at least half." } },
    code: ["class Solution:", "    def divide(self, dividend, divisor):", "        if dividend==-2**31 and divisor==-1: return 2**31-1", "        neg = (dividend<0) != (divisor<0)", "        a, b, q = abs(dividend), abs(divisor), 0", "        while a >= b:", "            temp, mult = b, 1", "            while a >= (temp<<1): temp<<=1; mult<<=1", "            a -= temp; q += mult", "        return -q if neg else q"],
    builder: buildSteps29,
  },
  204: {
    id: 204, difficulty: "medium", slug: "count-primes",
    category: { key: "math", vi: "Toán học", en: "Math" },
    title: { vi: "Count Primes", en: "Count Primes" },
    titleVi: { vi: "Đếm số nguyên tố (sàng Eratosthenes)", en: "Count primes (Sieve of Eratosthenes)" },
    statement: { vi: "Đếm số nguyên tố nhỏ hơn n. Nhập n.", en: "Count the primes strictly less than n. Enter n." },
    defaultInput: [10], inputKind: "integer", inputLabel: { vi: "n", en: "n" }, extraParams: [],
    approach: [{ vi: "Khởi tạo mọi số là nguyên tố; 0,1 không phải.", en: "Mark all as prime; 0,1 are not." }, { vi: "Với mỗi p nguyên tố, xóa bội p·p, p·(p+1), ...", en: "For each prime p, cross out multiples p·p, p·(p+1), ..." }, { vi: "Đếm các ô còn lại.", en: "Count the remaining primes." }],
    complexity: { time: "O(n log log n)", space: "O(n)", note: { vi: "Sàng chuẩn.", en: "Classic sieve." } },
    code: ["class Solution:", "    def countPrimes(self, n):", "        if n < 3: return 0", "        is_prime = [True]*n; is_prime[0]=is_prime[1]=False", "        p = 2", "        while p*p < n:", "            if is_prime[p]:", "                for m in range(p*p, n, p): is_prime[m] = False", "            p += 1", "        return sum(is_prime)"],
    builder: buildSteps204,
  },
  231: {
    id: 231, difficulty: "easy", slug: "power-of-two",
    category: { key: "math", vi: "Toán học", en: "Math" },
    title: { vi: "Power of Two", en: "Power of Two" },
    titleVi: { vi: "Lũy thừa của 2 (bit trick)", en: "Power of two (bit trick)" },
    statement: { vi: "Kiểm tra n có phải lũy thừa của 2. Nhập n.", en: "Check whether n is a power of two. Enter n." },
    defaultInput: [16], inputKind: "integer", inputLabel: { vi: "n", en: "n" }, extraParams: [],
    approach: [{ vi: "Lũy thừa của 2 có đúng 1 bit 1.", en: "A power of two has exactly one set bit." }, { vi: "n & (n-1) xóa bit thấp nhất → 0 nếu chỉ có 1 bit.", en: "n & (n-1) clears the lowest set bit → 0 if only one bit." }, { vi: "Kèm điều kiện n > 0.", en: "Also require n > 0." }],
    complexity: { time: "O(1)", space: "O(1)", note: { vi: "Một phép bit.", en: "A single bitwise op." } },
    code: ["class Solution:", "    def isPowerOfTwo(self, n):", "        # exactly one set bit", "        return n > 0 and (n & (n-1)) == 0"],
    builder: buildSteps231,
  },
  7: {
    id: 7,
    difficulty: "medium",
    slug: "reverse-integer",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Reverse Integer", en: "Reverse Integer" },
    titleVi: { vi: "Đảo ngược số nguyên", en: "Reverse an integer" },
    statement: {
      vi: "Cho số nguyên có dấu 32-bit x. Trả về x với các chữ số đảo ngược; nếu kết quả vượt miền số nguyên có dấu 32-bit thì trả về 0.",
      en: "Given a signed 32-bit integer x, return x with its digits reversed. Return 0 if the result overflows the signed 32-bit range.",
    },
    defaultInput: [123],
    inputKind: "integer",
    inputLabel: { vi: "x", en: "x" },
    singleInput: true,
    extraParams: [],
    approach: [
      { vi: "Lưu dấu, rồi làm việc với trị tuyệt đối của x.", en: "Save the sign, then work with the absolute value of x." },
      { vi: "Lặp lấy chữ số cuối bằng x % 10 và thêm vào rev bằng rev = rev × 10 + digit.", en: "Repeatedly take the last digit with x % 10 and append it with rev = rev × 10 + digit." },
      { vi: "Bỏ chữ số vừa xử lý bằng x //= 10, khôi phục dấu, rồi kiểm tra miền 32-bit.", en: "Drop the processed digit with x //= 10, restore the sign, then check the 32-bit range." },
    ],
    complexity: {
      time: "O(log |x|)",
      space: "O(1)",
      note: {
        vi: "Mỗi chữ số được xử lý đúng một lần và chỉ dùng số lượng biến cố định.",
        en: "Each digit is processed once and only a constant number of variables is used.",
      },
    },
    code: [
      "class Solution:",
      "    def reverse(self, x: int) -> int:",
      "        sign = -1 if x < 0 else 1",
      "        x = abs(x)",
      "        rev = 0",
      "        while x > 0:",
      "            digit = x % 10",
      "            rev = rev * 10 + digit",
      "            x //= 10",
      "        rev *= sign",
      "        if -2**31 <= rev <= 2**31 - 1:",
      "            return rev",
      "        return 0",
    ],
    builder: buildSteps7,
  },
  9: {
    id: 9,
    difficulty: "easy",
    slug: "palindrome-number",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Palindrome Number", en: "Palindrome Number" },
    titleVi: { vi: "Số đối xứng (Palindrome)", en: "Palindrome number" },
    statement: {
      vi:
        "Cho số nguyên x, trả về True nếu x là số đối xứng (palindrome), False nếu không, " +
        "KHÔNG được chuyển x thành chuỗi.",
      en:
        "Given an integer x, return true if x is a palindrome, and false otherwise, " +
        "WITHOUT converting the integer to a string.",
    },
    defaultInput: [121],
    inputKind: "integer",
    inputLabel: { vi: "x", en: "x" },
    singleInput: true,
    maxInput: 1000000000,
    extraParams: [],
    approach: [
      { vi: "Sao chép y = x, rồi đảo ngược TOÀN BỘ y bằng cách lặp lấy chữ số cuối (y%10) và dồn vào res, sau đó bỏ chữ số đó khỏi y (y//=10).", en: "Copy y = x, then fully reverse y by repeatedly taking its last digit (y%10) and appending it to res, then dropping that digit from y (y//=10)." },
      { vi: "So sánh res với x ban đầu. Nếu x âm, y=x ≤ 0 nên vòng lặp không chạy, res=0 → chỉ res==x khi x=0, mọi số âm khác đều trả False tự nhiên (không cần kiểm tra dấu riêng).", en: "Compare res with the original x. If x is negative, y=x ≤ 0 so the loop never runs and res stays 0 → res==x is only true when x=0, so every other negative number naturally returns False (no separate sign check needed)." },
      { vi: "res == x → x là palindrome (True); ngược lại → False.", en: "res == x → x is a palindrome (True); otherwise → False." },
    ],
    complexity: {
      time: "O(log₁₀ x)",
      space: "O(1)",
      note: {
        vi: "Đảo ngược toàn bộ chữ số của x (không tối ưu nửa số), không cần chuyển thành chuỗi.",
        en: "Reverses all of x's digits (not optimized to half), no string conversion needed.",
      },
    },
    code: [
      "class Solution:",
      "    def isPalindrome(self, x: int) -> bool:",
      "        y = x",
      "        res = 0",
      "        while y > 0:",
      "            res = res * 10 + y % 10",
      "            y //= 10",
      "        if res == x:",
      "            return True",
      "        return False",
    ],
    builder: buildSteps9,
  },
  3536: {
    id: 3536,
    difficulty: "easy",
    slug: "maximum-product-of-two-digits",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Maximum Product of Two Digits", en: "Maximum Product of Two Digits" },
    titleVi: { vi: "Tích lớn nhất của 2 chữ số", en: "Max product of two digits" },
    statement: {
      vi:
        "Cho số nguyên dương n. Trả về tích lớn nhất có thể tạo được bằng cách nhân 2 chữ số bất kỳ của n " +
        "(1 chữ số có thể dùng lại nếu nó xuất hiện nhiều lần trong n).",
      en:
        "Given a positive integer n, return the maximum product obtainable by multiplying any two of its digits " +
        "(a digit can be reused if it appears multiple times in n).",
    },
    defaultInput: [124],
    inputKind: "positive",
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 1000000000,
    extraParams: [],
    approach: [
      { vi: "Tích lớn nhất luôn là (chữ số lớn nhất) × (chữ số lớn nhì).", en: "The max product is always (largest digit) × (second-largest digit)." },
      { vi: "Quét từng chữ số bằng n%10 / n//10, luôn giữ 2 biến first/second là 2 chữ số lớn nhất đã thấy.", en: "Scan digits with n%10 / n//10, maintaining first/second as the two largest digits seen so far." },
      { vi: "Kết quả = first × second sau khi quét hết chữ số.", en: "Result = first × second after scanning all digits." },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Quét ~log₁₀(n) chữ số, mỗi bước O(1).",
        en: "About log₁₀(n) digits, each processed in O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def maxProduct(self, n: int) -> int:",
      "        first = second = 0",
      "        while n > 0:",
      "            digit = n % 10",
      "            if digit > first:",
      "                second = first",
      "                first = digit",
      "            elif digit > second:",
      "                second = digit",
      "            n //= 10",
      "        return first * second",
    ],
    builder: buildSteps3536,
  },
  3513: {
    id: 3513,
    difficulty: "medium",
    slug: "number-of-unique-xor-triplets-i",
    category: { key: "math", vi: "Toán / Bit Manipulation", en: "Math / Bit Manipulation" },
    title: { vi: "Number of Unique XOR Triplets I", en: "Number of Unique XOR Triplets I" },
    titleVi: { vi: "Số lượng giá trị XOR bộ ba khác nhau I", en: "Number of unique XOR triplet values I" },
    statement: {
      vi: "Cho mảng nums dài n, là một hoán vị của các số trong đoạn [1, n]. Một XOR triplet có giá trị nums[i] XOR nums[j] XOR nums[k] với i <= j <= k. Trả về số lượng giá trị XOR triplet khác nhau.",
      en: "Given nums, a permutation of [1, n], return the number of distinct values nums[i] XOR nums[j] XOR nums[k] over all i <= j <= k.",
    },
    defaultInput: [4, 1, 3, 2],
    inputKind: "positive",
    inputLabel: { vi: "nums (hoán vị của 1..n)", en: "nums (permutation of 1..n)" },
    extraParams: [],
    approach: [
      { vi: "Vì nums là hoán vị của 1..n và XOR có tính giao hoán, thứ tự phần tử không ảnh hưởng đáp án.", en: "Because nums is a permutation of 1..n and XOR is commutative, the order does not affect the answer." },
      { vi: "Nếu n <= 2, chỉ tạo được các giá trị đang có trong nums nên đáp án là n.", en: "If n <= 2, only the values already in nums are reachable, so the answer is n." },
      { vi: "Nếu n >= 3: tạo 1..n bằng x XOR x XOR x, tạo 0 bằng 1 XOR 2 XOR 3, rồi dựng từng giá trị còn thiếu bằng H XOR a XOR b.", en: "If n >= 3, build 1..n with x XOR x XOR x, build 0 with 1 XOR 2 XOR 3, then construct every missing value as H XOR a XOR b." },
      { vi: "Mọi kết quả dùng tối đa bit_length(n) bit, nên đáp án là 2^bit_length(n).", en: "Every result uses at most bit_length(n) bits, so the answer is 2^bit_length(n)." },
    ],
    complexity: {
      time: "O(1)",
      space: "O(1)",
      note: {
        vi: "Chỉ đọc len(nums), kiểm tra n và tính bit_length; không duyệt các bộ ba.",
        en: "Only read len(nums), test n, and compute bit_length; no triplets are enumerated.",
      },
    },
    code: [
      "class Solution:",
      "    def uniqueXorTriplets(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        if n <= 2:",
      "            return n",
      "        return 1 << n.bit_length()",
    ],
    builder: buildSteps3513,
  },
  3312: {
    id: 3312,
    difficulty: "hard",
    slug: "sorted-gcd-pair-queries",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Sorted GCD Pair Queries", en: "Sorted GCD Pair Queries" },
    titleVi: { vi: "Truy vấn GCD cặp đã sắp xếp", en: "Sorted GCD pair queries" },
    statement: {
      vi: "Cho mảng nums và mảng queries. Với mỗi cặp (i,j) với i<j, tính gcd(nums[i],nums[j]) rồi sắp xếp tất cả gcd này thành mảng gcdPairs. Trả về gcdPairs[queries[k]] cho mỗi k.",
      en: "Given nums and queries. For every pair (i,j) with i<j, compute gcd(nums[i],nums[j]). Sort all these GCDs into array gcdPairs (ascending). Return gcdPairs[queries[k]] for each k.",
    },
    defaultInput: [2, 3, 4],
    inputKind: "positive",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "queries", label: { vi: "queries (cách nhau ;)", en: "queries (semicolon-separated)" }, default: "0;2;2", type: "string" },
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: freq + exact riêng", en: "Approach 1: separate freq + exact" } },
          { value: "2", label: { vi: "Cách 2: tái dùng mảng cnt", en: "Approach 2: reuse the cnt array" } },
        ],
      },
    ],
    approach: [
      { vi: "Đếm freq[v] = số lần v xuất hiện trong nums.", en: "Count freq[v] = occurrences of v in nums." },
      { vi: "Với mỗi g (sieve): cntMult[g] = tổng freq[g]+freq[2g]+... Dùng inclusion-exclusion: exact[g] = C(cntMult[g],2) - Σ exact[k·g].", en: "For each g (sieve): cntMult[g] = sum of freq[g]+freq[2g]+... Use inclusion-exclusion: exact[g] = C(cntMult[g],2) - Σ exact[k·g]." },
      { vi: "Xây prefix sum để trả lời query bằng binary search.", en: "Build prefix sum to answer each query via binary search." },
    ],
    complexity: {
      time: "O(V log V + Q log V)",
      space: "O(V)",
      note: {
        vi: "V = max(nums). Sieve O(V log V) (harmonic series). Mỗi query O(log V).",
        en: "V = max(nums). Sieve is O(V log V) by the harmonic series. Each query is O(log V).",
      },
    },
    code: [
      "from math import gcd",
      "",
      "class Solution:",
      "    def gcdValues(self, nums, queries):",
      "        freq = Counter(nums)",
      "        maxVal = max(nums)",
      "        exact = [0] * (maxVal + 1)",
      "        for g in range(maxVal, 0, -1):",
      "            cntMult = sum(freq[g * k] for k in range(1, maxVal // g + 1))",
      "            exact[g] = cntMult * (cntMult - 1) // 2",
      "            for k in range(2, maxVal // g + 1):",
      "                exact[g] -= exact[g * k]",
      "        prefix = list(accumulate(exact))",
      "        return [bisect_left(prefix, q + 1) for q in queries]",
    ],
    code2Label: { vi: "Cách 2: tái dùng mảng cnt", en: "Approach 2: reuse the cnt array" },
    code2: [
      "from bisect import bisect_left",
      "",
      "class Solution:",
      "    def gcdValues(self, nums: List[int], queries: List[int]) -> List[int]:",
      "        m = max(nums)",
      "        cnt = [0] * (m + 1)",
      "        for num in nums:",
      "            cnt[num] += 1",
      "        for i in range(1, m + 1):",
      "            for j in range(i * 2, m + 1, i):",
      "                cnt[i] += cnt[j]",
      "        for i in range(1, m + 1):",
      "            cnt[i] = cnt[i] * (cnt[i] - 1) // 2",
      "        for i in range(m, 0, -1):",
      "            for j in range(i * 2, m + 1, i):",
      "                cnt[i] -= cnt[j]",
      "        for i in range(1, m + 1):",
      "            cnt[i] += cnt[i - 1]",
      "        ans = []",
      "        for q in queries:",
      "            q += 1",
      "            pos = bisect_left(cnt, q)",
      "            ans.append(pos)",
      "        return ans",
    ],
    builder: (input, params) => (Number(params && params.approach) === 2
      ? buildSteps3312Approach2(input, params)
      : buildSteps3312(input, params)),
  },
  3867: {
    id: 3867,
    difficulty: "medium",
    slug: "sum-of-gcd-of-formed-pairs",
    category: { key: "math", vi: "Toan / De quy", en: "Math / Recursion" },
    title: { vi: "Sum of GCD of Formed Pairs", en: "Sum of GCD of Formed Pairs" },
    titleVi: { vi: "Tong GCD cua cac cap duoc tao", en: "Sum of GCD of formed pairs" },
    statement: {
      vi:
        "Cho mang nums. Tao prefixGcd[i] = gcd(nums[i], max(nums[0..i])). Sau do sort prefixGcd, ghep phan tu nho nhat voi lon nhat va cong gcd cua tung cap. Neu n le, bo qua phan tu giua.",
      en:
        "Given nums. Build prefixGcd[i] = gcd(nums[i], max(nums[0..i])). Sort prefixGcd, pair the smallest with the largest, and sum the gcd of each pair. If n is odd, ignore the middle value.",
    },
    defaultInput: [3, 6, 2, 8],
    inputKind: "positive",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Duyet nums va giu mx la max prefix hien tai.", en: "Scan nums while tracking the current prefix maximum mx." },
      { vi: "Tinh prefixGcd[i] = gcd(nums[i], mx).", en: "Compute prefixGcd[i] = gcd(nums[i], mx)." },
      { vi: "Sort prefixGcd tang dan.", en: "Sort prefixGcd in non-decreasing order." },
      { vi: "Dung hai pointer de ghep nho nhat voi lon nhat, cong gcd cua moi cap.", en: "Use two pointers to pair smallest with largest and add each pair gcd." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Xay prefixGcd O(n log V) do gcd, sort O(n log n), sau do ghep cap O(n log V). Can O(n) bo nho cho prefixGcd.",
        en: "Build prefixGcd in O(n log V) for gcd, sort in O(n log n), then pair in O(n log V). Uses O(n) memory for prefixGcd.",
      },
    },
    code: [
      "from math import gcd",
      "",
      "class Solution:",
      "    def gcdSum(self, nums):",
      "        prefixGcd = []",
      "        mx = 0",
      "        for x in nums:",
      "            mx = max(mx, x)",
      "            prefixGcd.append(gcd(x, mx))",
      "        prefixGcd.sort()",
      "        answer = 0",
      "        left, right = 0, len(prefixGcd) - 1",
      "        while left < right:",
      "            answer += gcd(prefixGcd[left], prefixGcd[right])",
      "            left += 1; right -= 1",
      "        return answer",
    ],
    builder: buildSteps3867,
  },
  50: {
    id: 50,
    difficulty: "medium",
    slug: "powx-n",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Pow(x, n)", en: "Pow(x, n)" },
    titleVi: { vi: "Lũy thừa x mũ n", en: "Power x to the n" },
    statement: {
      vi: "Cho x (số thực) và n (số nguyên), tính x^n (tức x mũ n). Sử dụng thuật toán lũy thừa nhanh (binary exponentiation) với độ phức tạp O(log n).",
      en: "Implement pow(x, n), which calculates x raised to the power n. Use fast exponentiation (binary exponentiation) in O(log n) time.",
    },
    defaultInput: [10],
    inputKind: "integer",
    inputLabel: { vi: "n (số mũ)", en: "n (exponent)" },
    singleInput: true,
    maxInput: 30,
    extraParams: [
      {
        key: "x",
        label: { vi: "x (cơ số)", en: "x (base)" },
        default: 2,
        allowNegative: true,
      },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Mỗi vòng lặp chia n cho 2, nên chỉ cần O(log n) phép nhân. Chỉ dùng vài biến phụ nên O(1) bộ nhớ.",
        en: "Each iteration halves n, so only O(log n) multiplications are needed. Only a few extra variables are used, so O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def myPow(self, x: float, n: int) -> float:",
      "        if n < 0:",
      "            x = 1 / x",
      "            n = -n",
      "        result = 1",
      "        while n > 0:",
      "            if n % 2 == 1:",
      "                result *= x",
      "            x *= x",
      "            n //= 2",
      "        return result",
    ],
    builder: buildSteps50,
  },
  13: {
    id: 13,
    difficulty: "easy",
    slug: "roman-to-integer",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Roman to Integer", en: "Roman to Integer" },
    titleVi: { vi: "Chuyển số La Mã sang số nguyên", en: "Roman numeral to integer" },
    statement: {
      vi:
        "Cho một chuỗi số La Mã, chuyển thành số nguyên. " +
        "Quy tắc: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. " +
        "Nếu ký tự nhỏ hơn đứng trước ký tự lớn hơn (VD: IV=4, IX=9), ta trừ thay vì cộng.",
      en:
        "Given a Roman numeral string, convert it to an integer. " +
        "Rules: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. " +
        "If a smaller value precedes a larger value (e.g. IV=4, IX=9), subtract instead of add.",
    },
    defaultInput: "MCMXCIV",
    inputKind: "string",
    inputLabel: { vi: "Số La Mã (VD: MCMXCIV)", en: "Roman numeral (e.g. MCMXCIV)" },
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt chuỗi một lần từ trái sang phải, mỗi ký tự xử lý O(1) → O(n). Chỉ dùng vài biến phụ → O(1) bộ nhớ.",
        en: "Single pass left to right, each character processed in O(1) → O(n) time. Only a few variables used → O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def romanToInt(self, s: str) -> int:",
      "        roman = {'I':1,'V':5,'X':10,'L':50,",
      "                 'C':100,'D':500,'M':1000}",
      "        result = 0",
      "        for i in range(len(s)):",
      "            if i+1 < len(s) and roman[s[i]] < roman[s[i+1]]:",
      "                result -= roman[s[i]]",
      "            else:",
      "                result += roman[s[i]]",
      "        return result",
    ],
    builder: buildSteps13,
  },
  1291: {
    id: 1291,
    difficulty: "medium",
    slug: "sequential-digits",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Sequential Digits", en: "Sequential Digits" },
    titleVi: { vi: "Số có chữ số liên tiếp tăng dần", en: "Numbers with sequential increasing digits" },
    statement: {
      vi:
        "Một số có sequential digits nếu mỗi chữ số hơn chữ số trước đúng 1. " +
        "Cho low và high, trả về mọi số sequential digits trong khoảng [low, high], tăng dần.",
      en:
        "An integer has sequential digits if each digit is one more than the previous digit. " +
        "Given low and high, return all sequential digit numbers in [low, high], sorted.",
    },
    defaultInput: [100],
    inputKind: "positive",
    inputLabel: { vi: "low", en: "low" },
    singleInput: true,
    maxInput: 1000000000,
    extraParams: [
      { key: "high", type: "number", label: { vi: "high", en: "high" }, default: 300 },
    ],
    approach: [
      { vi: "Mọi số hợp lệ là substring của chuỗi '123456789'.", en: "Every valid number is a substring of '123456789'." },
      { vi: "Duyệt độ dài từ len(low) đến len(high), rồi duyệt vị trí bắt đầu.", en: "Iterate lengths from len(low) to len(high), then each start position." },
      { vi: "Nếu candidate nằm trong [low, high] thì thêm vào kết quả.", en: "If a candidate lies inside [low, high], append it to the answer." },
    ],
    complexity: {
      time: "O(1)",
      space: "O(1)",
      note: {
        vi: "Tối đa chỉ có 36 số sequential digits từ chuỗi '123456789', nên số bước bị chặn bởi hằng số.",
        en: "There are at most 36 sequential digit numbers from '123456789', so the work is bounded by a constant.",
      },
    },
    code: [
      "class Solution:",
      "    def sequentialDigits(self, low: int, high: int) -> List[int]:",
      "        ans = []",
      "        digits = '123456789'",
      "        for length in range(len(str(low)), len(str(high)) + 1):",
      "            for start in range(0, 10 - length):",
      "                num = int(digits[start:start + length])",
      "                if low <= num <= high:",
      "                    ans.append(num)",
      "        return ans",
    ],
    builder: buildSteps1291,
  },
  246: {
    id: 246,
    difficulty: "easy",
    slug: "strobogrammatic-number",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Strobogrammatic Number", en: "Strobogrammatic Number" },
    titleVi: { vi: "Số đối xứng quay 180°", en: "Strobogrammatic number" },
    statement: {
      vi:
        "Một số strobogrammatic là số trông giống hệt khi xoay 180°. " +
        "Các chữ số hợp lệ khi xoay: 0↔0, 1↔1, 6↔9, 8↔8, 9↔6. " +
        "Cho một chuỗi num, xác định xem nó có phải số strobogrammatic không.",
      en:
        "A strobogrammatic number looks the same when rotated 180 degrees. " +
        "Valid rotated digit pairs: 0↔0, 1↔1, 6↔9, 8↔8, 9↔6. " +
        "Given a string num, determine if it is strobogrammatic.",
    },
    defaultInput: "69",
    inputKind: "string",
    inputLabel: { vi: "Số (chuỗi chữ số)", en: "Number (digit string)" },
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Dùng hai con trỏ từ hai đầu vào giữa, mỗi bước O(1) → O(n). Chỉ dùng bảng ánh xạ cố định → O(1) bộ nhớ.",
        en: "Two pointers from both ends toward center, each step O(1) → O(n). Only a fixed mapping table → O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def isStrobogrammatic(self, num: str) -> bool:",
      "        pairs = {'0':'0','1':'1','6':'9','8':'8','9':'6'}",
      "        left, right = 0, len(num) - 1",
      "        while left <= right:",
      "            if num[left] not in pairs:",
      "                return False",
      "            if pairs[num[left]] != num[right]:",
      "                return False",
      "            left += 1",
      "            right -= 1",
      "        return True",
    ],
    builder: buildSteps246,
  },
  2470: {
    id: 2470,
    difficulty: "medium",
    slug: "number-of-subarrays-with-lcm-equal-to-k",
    category: { key: "math", vi: "Toan / De quy", en: "Math / Recursion" },
    title: { vi: "Number of Subarrays With LCM Equal to K", en: "Number of Subarrays With LCM Equal to K" },
    titleVi: { vi: "So subarray co LCM bang K", en: "Subarrays with LCM equal to K" },
    statement: {
      vi: "Cho mang nums va so k. Dem so subarray lien tiep co boi chung nho nhat LCM bang k.",
      en: "Given nums and k, count the contiguous subarrays whose least common multiple is exactly k.",
    },
    defaultInput: [3, 6, 2, 7, 1],
    inputKind: "positive",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [
      { key: "k", label: { vi: "k", en: "k" }, default: 6 },
    ],
    approach: [
      { vi: "Thu moi diem bat dau i, roi mo rong j sang phai.", en: "Try every start index i, then expand j to the right." },
      { vi: "Cap nhat cur_lcm = lcm(cur_lcm, nums[j]) bang gcd.", en: "Update cur_lcm = lcm(cur_lcm, nums[j]) using gcd." },
      { vi: "Neu cur_lcm == k thi dem. Neu cur_lcm > k hoac k khong chia het cur_lcm thi dung som.", en: "If cur_lcm == k, count it. If cur_lcm > k or k is not divisible by cur_lcm, break early." },
    ],
    complexity: {
      time: "O(n^2 * log V)",
      space: "O(1)",
      note: { vi: "Co toi da O(n^2) subarray, moi lan cap nhat LCM dung gcd O(log V).", en: "There are up to O(n^2) subarrays; each LCM update uses gcd in O(log V)." },
    },
    code: [
      "class Solution:",
      "    def subarrayLCM(self, nums: List[int], k: int) -> int:",
      "        answer = 0",
      "        for i in range(len(nums)):",
      "            cur_lcm = 1",
      "            for j in range(i, len(nums)):",
      "                cur_lcm = cur_lcm * nums[j] // gcd(cur_lcm, nums[j])",
      "                if cur_lcm == k:",
      "                    answer += 1",
      "                if cur_lcm > k or k % cur_lcm != 0:",
      "                    break",
      "        return answer",
    ],
    builder: buildSteps2470,
  },
  3754: {
    id: 3754,
    difficulty: "easy",
    slug: "concatenate-non-zero-digits-and-multiply-by-sum-i",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Concatenate Non-Zero Digits and Multiply by Sum I", en: "Concatenate Non-Zero Digits and Multiply by Sum I" },
    titleVi: { vi: "Ghép các chữ số khác 0 rồi nhân với tổng chữ số", en: "Concat non-zero digits × sum of digits" },
    statement: {
      vi:
        "Cho số nguyên dương n. Gọi x là số được tạo bằng cách nối các chữ số khác 0 của n theo đúng thứ tự trái sang phải. " +
        "Gọi sum là tổng các chữ số của n. Trả về x × sum.",
      en:
        "Given a positive integer n. Let x be the number formed by concatenating the non-zero digits of n in their original left-to-right order. " +
        "Let sum be the sum of all digits of n. Return x × sum.",
    },
    defaultInput: [10203004],
    inputKind: "positive",
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 100000000,
    extraParams: [],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Quét ~log₁₀(n) chữ số, mỗi bước O(1); reverse temp cũng O(log n). Chỉ dùng vài biến phụ.",
        en: "About log₁₀(n) digits, each processed in O(1); reversing temp is also O(log n). Only a few extra variables.",
      },
    },
    code: [
      "class Solution:",
      "    def sumAndMultiply(self, n: int) -> int:",
      "        s = 0",
      "        temp = 0",
      "        while n > 0:",
      "            digit = n % 10",
      "            s += digit",
      "            if digit != 0:",
      "                temp = temp * 10 + digit",
      "            n //= 10",
      "        rev = 0",
      "        while temp > 0:",
      "            rev = rev * 10 + temp % 10",
      "            temp //= 10",
      "        return s * rev",
    ],
    builder: buildSteps3754,
  },
  3756: {
    id: 3756,
    difficulty: "medium",
    slug: "concatenate-non-zero-digits-and-multiply-by-sum-ii",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Concatenate Non-Zero Digits and Multiply by Sum II", en: "Concatenate Non-Zero Digits and Multiply by Sum II" },
    titleVi: { vi: "Ghép chữ số khác 0 × tổng (nhiều truy vấn)", en: "Concat non-zero digits × sum (multiple queries)" },
    statement: {
      vi:
        "Cho chuỗi s gồm chữ số và mảng queries. Mỗi query [l,r]: " +
        "lấy substring s[l..r], ghép các chữ số khác 0 thành x, tính sum = tổng chữ số x, trả về x × sum mod 10^9+7.",
      en:
        "Given digit string s and queries [l,r]: " +
        "extract substring s[l..r], concatenate non-zero digits into x, let sum = digit sum of x, return x × sum mod 10^9+7.",
    },
    defaultInput: "10203004",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi chữ số)", en: "s (digit string)" },
    extraParams: [
      { key: "queries", type: "string", label: { vi: "queries (l,r;l,r;...)", en: "queries (l,r;l,r;...)" }, default: "0,7;1,3;4,6" },
    ],
    complexity: {
      time: "O(m + q·k)",
      time: "O(n + q)",
      space: "O(n)",
      note: {
        vi: "Xây prefix arrays O(n). Mỗi query O(1) bằng phép trừ prefix. Tổng O(n + q).",
        en: "Build prefix arrays in O(n). Each query is O(1) via prefix subtraction. Total O(n + q).",
      },
    },
    code: [
      "MOD = 10**9 + 7",
      "pow10 = [1] * 100001",
      "for i in range(1, 100001):",
      "    pow10[i] = pow10[i - 1] * 10 % MOD",
      "",
      "class Solution:",
      "    def sumAndMultiply(self, s: str, queries: List[List[int]]) -> List[int]:",
      "        n = len(s)",
      "        sum = [0] * (n + 1)",
      "        x = [0] * (n + 1)",
      "        cnt = [0] * (n + 1)",
      "        for i, c in enumerate(s):",
      "            d = int(c)",
      "            sum[i + 1] = sum[i] + d",
      "            x[i + 1] = (x[i] * 10 + d) % MOD if d > 0 else x[i]",
      "            cnt[i + 1] = cnt[i] + (d > 0)",
      "        m = len(queries)",
      "        res = [0] * m",
      "        for i in range(m):",
      "            l = queries[i][0]",
      "            r = queries[i][1] + 1",
      "            length = cnt[r] - cnt[l]",
      "            res[i] = (x[r] - x[l] * pow10[length]) * (sum[r] - sum[l]) % MOD",
      "        return res",
    ],
    builder: buildSteps3756,
  },
  1979: {
    id: 1979,
    difficulty: "easy",
    slug: "find-greatest-common-divisor-of-array",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Find Greatest Common Divisor of Array", en: "Find Greatest Common Divisor of Array" },
    titleVi: { vi: "GCD của min và max trong mảng", en: "GCD of min and max in array" },
    statement: {
      vi: "Cho mảng nums, trả về GCD của phần tử nhỏ nhất và lớn nhất trong mảng.",
      en: "Given an integer array nums, return the GCD of the smallest and largest numbers in nums.",
    },
    defaultInput: [2, 5, 6, 9, 10],
    inputKind: "positive",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Tìm min và max của mảng.", en: "Find min and max of the array." },
      { vi: "Tính GCD(min, max) bằng thuật toán Euclid.", en: "Compute GCD(min, max) using the Euclidean algorithm." },
    ],
    complexity: {
      time: "O(n + log(min))",
      space: "O(1)",
      note: { vi: "O(n) tìm min/max, O(log(min)) cho GCD Euclid.", en: "O(n) to find min/max, O(log(min)) for Euclidean GCD." },
    },
    code: [
      "class Solution:",
      "    def findGCD(self, nums):",
      "        mn = min(nums)",
      "        mx = max(nums)",
      "        a, b = mx, mn",
      "        while b != 0:",
      "            a, b = b, a % b",
      "        return a",
    ],
    builder: buildSteps1979,
  },
  1739: {
    id: 1739,
    difficulty: "hard",
    slug: "building-boxes",
    category: { key: "math", vi: "Toán học", en: "Math" },
    tags: [{ key: "greedy", vi: "Tham lam", en: "Greedy" }, { key: "math", vi: "Toán học", en: "Math" }],
    title: { vi: "Building Boxes", en: "Building Boxes" },
    titleVi: { vi: "Đặt hộp vào góc tường (hình tam giác 3D)", en: "Minimum floor boxes for a 3D corner pyramid" },
    statement: {
      vi: "Bạn có n hộp và cần đặt chúng vào góc phòng (ba mặt tường). Mỗi hộp ở tầng trên phải có hộp đỡ bên dưới hoặc tường. Trả về số hộp TỐI THIỂU cần đặt lên SÀN để chứa đủ n hộp.",
      en: "You have n boxes to place in a room corner (three walls). Every box above the ground needs support from boxes below or walls. Return the MINIMUM number of boxes touching the FLOOR to accommodate all n boxes.",
    },
    defaultInput: [10],
    inputKind: "positive",
    singleInput: true,
    maxInput: 100000,
    inputLabel: { vi: "n — số hộp", en: "n — number of boxes" },
    extraParams: [],
    approach: [
      { vi: "Hình tháp lý tưởng: tầng k từ đỉnh xuống chứa T(k) = k*(k+1)/2 hộp; sàn tầng k chiếm T(k) ô. Tổng hộp k tầng = T(1)+T(2)+…+T(k) = k*(k+1)*(k+2)/6.", en: "Ideal pyramid: layer k from the top holds T(k) = k*(k+1)/2 boxes; the floor footprint of layer k is T(k) cells. Total boxes in k layers = T(1)+T(2)+…+T(k) = k*(k+1)*(k+2)/6." },
      { vi: "Bước 1 — tìm k: tăng k cho đến khi tổng ≥ n. Tháp k tầng cần sàn T(k) = k*(k+1)/2 ô.", en: "Step 1 — find k: increase k until the total ≥ n. A k-layer pyramid needs floor footprint T(k) = k*(k+1)/2 cells." },
      { vi: "Bước 2 — thêm hộp sàn riêng lẻ: nếu còn n − total(k−1) hộp dư, mỗi hộp sàn mới ở hàng j có thể đỡ thêm j hộp phía trên. Tăng j từ 1 cho đến khi bù đủ phần dư.", en: "Step 2 — add individual floor boxes: for each remaining n − total(k−1) box, a new floor box in row j can support j additional boxes. Increase j from 1 until the remainder is covered." },
    ],
    complexity: {
      time: "O(n^(1/3))",
      space: "O(1)",
      note: { vi: "k ≈ ∛(6n); vòng lặp bước 2 cũng ngắn theo bậc k.", en: "k ≈ ∛(6n); the step-2 loop is also short on the order of k." },
    },
    code: [
      "class Solution:",
      "    def minimumBoxes(self, n: int) -> int:",
      "        # Step 1: find k layers of the full pyramid",
      "        k, total, floor = 0, 0, 0",
      "        while total + (k + 1) * (k + 2) // 2 <= n:",
      "            k += 1",
      "            total += k * (k + 1) // 2",
      "            floor += k",
      "        # Step 2: add individual floor boxes for the remainder",
      "        j = 0",
      "        while total < n:",
      "            j += 1",
      "            total += j",
      "            floor += 1",
      "        return floor",
    ],
    codeLabel: { vi: "Cách 1: Greedy công thức k*(k+1)*(k+2)/6", en: "Approach 1: Greedy formula k*(k+1)*(k+2)/6" },
    code2Label: { vi: "Cách 2: Mô phỏng tăng height từng bước", en: "Approach 2: Simulate height increment" },
    code2: [
      "class Solution:",
      "    def minimumBoxes(self, n: int) -> int:",
      "        height = 0",
      "        total = 0",
      "        floor = 0",
      "        while total < n:",
      "            height += 1",
      "            floor += height",
      "            total += floor",
      "        if total == n:",
      "            return floor",
      "        total -= floor",
      "        floor -= height",
      "        x = 0",
      "        while total < n:",
      "            x += 1",
      "            total += x",
      "            floor += 1",
      "        return floor",
    ],
    builder: buildSteps1739,
    builder2: buildSteps1739Approach2,
  },
};
