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

  // ── Step 0: intro — show nums ──────────────────────────────────────
  steps.push({
    title: { en: "Input: nums array", vi: "Đầu vào: mảng nums" },
    arr: [...nums],
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

module.exports = {
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
      { key: "queries", label: { vi: "queries (cách nhau ;)", en: "queries (semicolon-separated)" }, default: "0;2;2", type: "text" },
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
    builder: buildSteps3312,
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
};
