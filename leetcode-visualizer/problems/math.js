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

  let result = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4],
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

    if (subtract) {
      result -= cur;
      steps.push({
        title: { vi: `i=${i}: ${chars[i]}(${cur}) < ${chars[i + 1]}(${next}) → trừ`, en: `i=${i}: ${chars[i]}(${cur}) < ${chars[i + 1]}(${next}) → subtract` },
        arr: values,
        sub: chars,
        highlight: [i, i + 1],
        mark: [],
        codeLines: [5, 6, 7],
        vars: [
          { name: "i", value: i },
          { name: "s[i]", value: `${chars[i]} = ${cur}` },
          { name: "s[i+1]", value: `${chars[i + 1]} = ${next}` },
          { name: "action", value: `subtract ${cur}` },
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
        title: { vi: `i=${i}: ${chars[i]}(${cur}) → cộng`, en: `i=${i}: ${chars[i]}(${cur}) → add` },
        arr: values,
        sub: chars,
        highlight: [i],
        mark: [],
        codeLines: [5, 6, 8, 9],
        vars: [
          { name: "i", value: i },
          { name: "s[i]", value: `${chars[i]} = ${cur}` },
          { name: "s[i+1]", value: i + 1 < s.length ? `${chars[i + 1]} = ${next}` : "end" },
          { name: "action", value: `add ${cur}` },
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
    title: { vi: "Kết quả", en: "Result" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [10],
    vars: [{ name: "answer", value: result }],
    note: {
      vi: `"${s}" = ${result}.`,
      en: `"${s}" = ${result}.`,
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

module.exports = {
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
};
