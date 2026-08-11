// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * Generate steps for LeetCode 3: Longest Substring Without Repeating Characters.
 * The latest-seen map lets left jump directly past a duplicate in the window.
 */
function buildSteps3(input, params) {
  if (Number(params && params.approach) === 2) {
    return buildSteps3Set(input);
  }

  const s = typeof input === "string" ? input : String(input ?? "");
  const chars = s.split("");
  const steps = [];
  const lastSeen = {};
  let left = 0;
  let best = 0;
  let bestL = 0;
  let bestR = -1;

  const indices = (lo, hi) => (
    lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, offset) => lo + offset) : []
  );
  const setLabel = (labels, idx, label) => {
    if (idx < 0 || idx >= chars.length) return;
    const key = `0,${idx + 1}`;
    labels[key] = labels[key] ? `${labels[key]}\n${label}` : label;
  };
  const mapText = () => {
    const entries = Object.entries(lastSeen);
    return entries.length
      ? `{${entries.map(([ch, idx]) => `${JSON.stringify(ch)}:${idx}`).join(", ")}}`
      : "{}";
  };
  const makeGrid = (opts = {}) => {
    const lo = Number.isInteger(opts.left) ? opts.left : left;
    const hi = Number.isInteger(opts.right) ? opts.right : left - 1;
    const active = new Set(indices(lo, hi));
    const labels = {};
    setLabel(labels, lo, `left=${lo}`);
    setLabel(labels, hi, `right=${hi}`);
    if (Number.isInteger(opts.previousDuplicate)) {
      setLabel(labels, opts.previousDuplicate, "old");
      setLabel(labels, hi, "dup");
    }
    if (opts.markBest) {
      for (const idx of indices(bestL, bestR)) setLabel(labels, idx, "best");
    }

    const windowText = lo <= hi ? s.slice(lo, hi + 1) : "";
    const bestText = bestR >= bestL ? s.slice(bestL, bestR + 1) : "";
    return {
      dp: [["", ...chars]],
      text1: "",
      text2: s,
      colLabels: chars.map((char, idx) => ({ index: `idx=${idx}`, char })),
      hlCell: Number.isInteger(opts.focus) ? [0, opts.focus + 1] : null,
      autoScrollCell: hi >= 0 ? [0, hi + 1] : null,
      pathCells: indices(lo, hi).map((idx) => [0, idx + 1]),
      historyCells: indices(bestL, bestR)
        .filter((idx) => !active.has(idx))
        .map((idx) => [0, idx + 1]),
      cellLabels: labels,
      largeCells: true,
      caption: opts.caption || `window=${JSON.stringify(windowText)} · len=${Math.max(0, hi - lo + 1)} · best=${JSON.stringify(bestText)} (${best})`,
      secondaryCaption: `last_seen = ${mapText()}`,
    };
  };
  const variables = (right = null, ch = null) => {
    const values = [
      { name: "left", value: left },
      { name: "best", value: best },
      { name: "last_seen", value: mapText() },
    ];
    if (Number.isInteger(right)) values.splice(1, 0, { name: "right", value: right });
    if (ch !== null) values.splice(2, 0, { name: "ch", value: JSON.stringify(ch) });
    return values;
  };
  const snap = (opts) => {
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts.grid),
      highlight: [],
      mark: [],
      codeLines: [opts.codeLine],
      vars: opts.vars,
      note: opts.note,
      final: Boolean(opts.final),
    });
  };

  snap({
    title: { vi: "Tạo bảng vị trí", en: "Create the position map" },
    codeLine: 3,
    grid: { left: 0, right: -1, caption: `s=${JSON.stringify(s)} · last_seen starts empty` },
    vars: variables(),
    note: { vi: "last_seen sẽ lưu chỉ số xuất hiện gần nhất của từng ký tự.", en: "last_seen will store the most recent index of every character." },
  });
  snap({
    title: { vi: "Đặt cạnh trái", en: "Set the left edge" },
    codeLine: 4,
    grid: { left: 0, right: -1, caption: "left = 0 · window is empty" },
    vars: variables(),
    note: { vi: "Cửa sổ hợp lệ tiếp theo sẽ bắt đầu tại left = 0.", en: "The next valid window will begin at left = 0." },
  });
  snap({
    title: { vi: "Khởi tạo kỷ lục", en: "Initialize the record" },
    codeLine: 5,
    grid: { left: 0, right: -1, caption: "best = 0 · no window has been measured" },
    vars: variables(),
    note: { vi: "best giữ độ dài cửa sổ không lặp dài nhất đã thấy.", en: "best stores the longest duplicate-free window seen so far." },
  });

  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    const previous = Object.prototype.hasOwnProperty.call(lastSeen, ch) ? lastSeen[ch] : null;
    const conflicts = Number.isInteger(previous) && previous >= left;

    snap({
      title: { vi: `Đọc s[${right}] = ${JSON.stringify(ch)}`, en: `Read s[${right}] = ${JSON.stringify(ch)}` },
      codeLine: 6,
      grid: { left, right, focus: right },
      vars: variables(right, ch),
      note: { vi: `right tiến đến chỉ số ${right}; ký tự mới là ${JSON.stringify(ch)}.`, en: `right advances to index ${right}; the new character is ${JSON.stringify(ch)}.` },
    });
    snap({
      title: conflicts ? { vi: "Tìm thấy ký tự trùng trong cửa sổ", en: "Duplicate found inside the window" } : { vi: "Không có xung đột", en: "No conflict" },
      codeLine: 7,
      grid: { left, right, focus: right, previousDuplicate: conflicts ? previous : null },
      vars: [
        ...variables(right, ch),
        { name: "previous", value: previous === null ? "not seen" : previous },
        { name: "previous >= left", value: conflicts },
      ],
      note: conflicts
        ? { vi: `${JSON.stringify(ch)} đã xuất hiện tại ${previous}, vẫn nằm trong cửa sổ [${left}..${right}].`, en: `${JSON.stringify(ch)} was seen at ${previous}, still inside window [${left}..${right}].` }
        : { vi: previous === null ? `${JSON.stringify(ch)} chưa từng xuất hiện.` : `Lần xuất hiện cũ ở ${previous} đã nằm bên trái cửa sổ hiện tại.`, en: previous === null ? `${JSON.stringify(ch)} has not appeared before.` : `The previous occurrence at ${previous} is already left of the current window.` },
    });

    if (conflicts) {
      const oldLeft = left;
      left = previous + 1;
      snap({
        title: { vi: `Dời left: ${oldLeft} → ${left}`, en: `Move left: ${oldLeft} → ${left}` },
        codeLine: 8,
        grid: { left, right, focus: right },
        vars: variables(right, ch),
        note: { vi: `Bỏ ký tự trùng cũ tại ${previous}; cửa sổ hợp lệ mới là [${left}..${right}].`, en: `Skip the old duplicate at ${previous}; the new valid window is [${left}..${right}].` },
      });
    }

    lastSeen[ch] = right;
    snap({
      title: { vi: "Ghi vị trí mới nhất", en: "Record the latest position" },
      codeLine: 9,
      grid: { left, right, focus: right },
      vars: variables(right, ch),
      note: { vi: `Cập nhật last_seen[${JSON.stringify(ch)}] = ${right}.`, en: `Update last_seen[${JSON.stringify(ch)}] = ${right}.` },
    });

    const windowLength = right - left + 1;
    const oldBest = best;
    if (windowLength > best) {
      best = windowLength;
      bestL = left;
      bestR = right;
    }
    snap({
      title: best > oldBest ? { vi: `Kỷ lục mới: ${best}`, en: `New record: ${best}` } : { vi: `Giữ kỷ lục: ${best}`, en: `Keep the record: ${best}` },
      codeLine: 10,
      grid: { left, right, focus: right, markBest: best > oldBest },
      vars: [...variables(right, ch), { name: "window length", value: windowLength }],
      note: best > oldBest
        ? { vi: `Độ dài ${windowLength} lớn hơn ${oldBest}; best = ${best}.`, en: `Length ${windowLength} beats ${oldBest}; best = ${best}.` }
        : { vi: `Độ dài ${windowLength} không vượt kỷ lục ${best}.`, en: `Length ${windowLength} does not beat the record ${best}.` },
    });
  }

  snap({
    title: { vi: `Trả về ${best}`, en: `Return ${best}` },
    codeLine: 11,
    grid: { left: bestL, right: bestR, focus: bestR, markBest: true, caption: `longest=${JSON.stringify(bestR >= bestL ? s.slice(bestL, bestR + 1) : "")} · length=${best}` },
    vars: [{ name: "best", value: best }],
    note: { vi: `Substring không lặp dài nhất là ${JSON.stringify(bestR >= bestL ? s.slice(bestL, bestR + 1) : "")} với độ dài ${best}.`, en: `The longest duplicate-free substring is ${JSON.stringify(bestR >= bestL ? s.slice(bestL, bestR + 1) : "")} with length ${best}.` },
    final: true,
  });

  return { original: s, answer: best, steps };
}

/**
 * LeetCode 3, approach 2: maintain the current duplicate-free window in a set.
 * When the new character is already present, remove characters from the left
 * one at a time until the duplicate disappears.
 */
function buildSteps3Set(input) {
  const s = typeof input === "string" ? input : String(input ?? "");
  const chars = s.split("");
  const charSet = new Set();
  const steps = [];
  let left = 0;
  let maxLength = 0;
  let bestL = 0;
  let bestR = -1;

  const indices = (lo, hi) => (
    lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, offset) => lo + offset) : []
  );
  const setLabel = (labels, index, label) => {
    if (index < 0 || index >= chars.length) return;
    const key = `0,${index + 1}`;
    labels[key] = labels[key] ? `${labels[key]}\n${label}` : label;
  };
  const setText = () => {
    const values = [...charSet].map((char) => JSON.stringify(char));
    return values.length ? `{${values.join(", ")}}` : "set()";
  };
  const makeGrid = (opts = {}) => {
    const lo = Number.isInteger(opts.left) ? opts.left : left;
    const hi = Number.isInteger(opts.right) ? opts.right : left - 1;
    const active = new Set(indices(lo, hi));
    const labels = {};
    setLabel(labels, lo, `left=${lo}`);
    setLabel(labels, hi, `right=${hi}`);
    if (opts.duplicateChar !== undefined) {
      for (const index of indices(lo, hi)) {
        if (s[index] === opts.duplicateChar) setLabel(labels, index, "dup");
      }
    }
    if (Number.isInteger(opts.removing)) setLabel(labels, opts.removing, "remove");
    if (opts.markBest) {
      for (const index of indices(bestL, bestR)) setLabel(labels, index, "best");
    }

    const windowText = lo <= hi ? s.slice(lo, hi + 1) : "";
    const bestText = bestR >= bestL ? s.slice(bestL, bestR + 1) : "";
    return {
      dp: [["", ...chars]],
      text1: "",
      text2: s,
      colLabels: chars.map((char, index) => ({ index: `idx=${index}`, char })),
      hlCell: Number.isInteger(opts.focus) ? [0, opts.focus + 1] : null,
      autoScrollCell: hi >= 0 ? [0, hi + 1] : null,
      pathCells: indices(lo, hi).map((index) => [0, index + 1]),
      historyCells: indices(bestL, bestR)
        .filter((index) => !active.has(index))
        .map((index) => [0, index + 1]),
      cellLabels: labels,
      largeCells: true,
      caption: opts.caption || `window=${JSON.stringify(windowText)} · len=${Math.max(0, hi - lo + 1)} · best=${JSON.stringify(bestText)} (${maxLength})`,
      secondaryCaption: `char_set = ${setText()}`,
    };
  };
  const variables = (right = null) => {
    const values = [
      { name: "left", value: left },
      { name: "max_length", value: maxLength },
      { name: "char_set", value: setText() },
    ];
    if (Number.isInteger(right)) values.splice(1, 0, { name: "right", value: right });
    return values;
  };
  const snap = (opts) => {
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts.grid || {}),
      highlight: [],
      mark: [],
      codeLines: [opts.codeLine],
      codeBlock: 2,
      vars: opts.vars || variables(),
      note: opts.note,
      final: Boolean(opts.final),
    });
  };

  snap({
    title: { vi: "Đặt left = 0", en: "Set left = 0" },
    codeLine: 3,
    grid: { left: 0, right: -1, caption: "left = 0 · window is empty" },
    note: { vi: "left là cạnh trái của cửa sổ.", en: "left is the window's left boundary." },
  });
  snap({
    title: { vi: "Khởi tạo độ dài lớn nhất", en: "Initialize maximum length" },
    codeLine: 4,
    grid: { left: 0, right: -1, caption: "max_length = 0" },
    note: { vi: "Chưa có cửa sổ nào được đo nên max_length bắt đầu bằng 0.", en: "No window has been measured, so max_length starts at 0." },
  });
  snap({
    title: { vi: "Tạo set rỗng", en: "Create an empty set" },
    codeLine: 5,
    grid: { left: 0, right: -1, caption: "char_set = set()" },
    note: { vi: "char_set chứa đúng các ký tự của cửa sổ hợp lệ hiện tại.", en: "char_set contains exactly the current valid window's characters." },
  });

  for (let right = 0; right < chars.length; right++) {
    const ch = s[right];
    snap({
      title: { vi: `Đọc s[${right}] = ${JSON.stringify(ch)}`, en: `Read s[${right}] = ${JSON.stringify(ch)}` },
      codeLine: 7,
      grid: { left, right, focus: right, duplicateChar: charSet.has(ch) ? ch : undefined },
      vars: [...variables(right), { name: "s[right]", value: JSON.stringify(ch) }],
      note: { vi: `right mở rộng cạnh phải đến index ${right}.`, en: `right expands the right edge to index ${right}.` },
    });

    while (true) {
      const duplicate = charSet.has(ch);
      snap({
        title: duplicate
          ? { vi: "Ký tự mới đang bị trùng", en: "The new character is duplicated" }
          : { vi: "Cửa sổ không có ký tự trùng", en: "The window has no duplicate" },
        codeLine: 8,
        grid: { left, right, focus: right, duplicateChar: duplicate ? ch : undefined },
        vars: [...variables(right), { name: "s[right] in char_set", value: duplicate }],
        note: duplicate
          ? { vi: `${JSON.stringify(ch)} đã có trong char_set, nên phải co cửa sổ từ left.`, en: `${JSON.stringify(ch)} is already in char_set, so shrink the window from left.` }
          : { vi: `${JSON.stringify(ch)} chưa có trong char_set; có thể thoát vòng while.`, en: `${JSON.stringify(ch)} is not in char_set; the while loop can stop.` },
      });
      if (!duplicate) break;

      const removedIndex = left;
      const removed = s[removedIndex];
      charSet.delete(removed);
      snap({
        title: { vi: `Xóa ${JSON.stringify(removed)} khỏi set`, en: `Remove ${JSON.stringify(removed)} from the set` },
        codeLine: 9,
        grid: { left, right, focus: removedIndex, removing: removedIndex, duplicateChar: charSet.has(ch) ? ch : undefined },
        vars: [...variables(right), { name: "removed", value: `s[${removedIndex}] = ${JSON.stringify(removed)}` }],
        note: { vi: `char_set.remove(s[left]) xóa ký tự tại index ${removedIndex}.`, en: `char_set.remove(s[left]) removes the character at index ${removedIndex}.` },
      });

      left += 1;
      snap({
        title: { vi: `Tăng left lên ${left}`, en: `Advance left to ${left}` },
        codeLine: 10,
        grid: { left, right, focus: left, duplicateChar: charSet.has(ch) ? ch : undefined },
        vars: variables(right),
        note: { vi: `Cạnh trái chuyển sang index ${left}; vòng while sẽ kiểm tra lại.`, en: `The left edge moves to index ${left}; the while condition will be checked again.` },
      });
    }

    charSet.add(ch);
    snap({
      title: { vi: `Thêm ${JSON.stringify(ch)} vào set`, en: `Add ${JSON.stringify(ch)} to the set` },
      codeLine: 12,
      grid: { left, right, focus: right },
      vars: variables(right),
      note: { vi: `Sau khi thêm, char_set khớp với cửa sổ ${JSON.stringify(s.slice(left, right + 1))}.`, en: `After insertion, char_set matches window ${JSON.stringify(s.slice(left, right + 1))}.` },
    });

    const windowLength = right - left + 1;
    const oldMax = maxLength;
    if (windowLength > maxLength) {
      maxLength = windowLength;
      bestL = left;
      bestR = right;
    }
    snap({
      title: maxLength > oldMax
        ? { vi: `Kỷ lục mới: ${maxLength}`, en: `New record: ${maxLength}` }
        : { vi: `Giữ kỷ lục: ${maxLength}`, en: `Keep the record: ${maxLength}` },
      codeLine: 13,
      grid: { left, right, focus: right, markBest: maxLength > oldMax },
      vars: [...variables(right), { name: "right - left + 1", value: windowLength }],
      note: maxLength > oldMax
        ? { vi: `Cửa sổ dài ${windowLength}, lớn hơn kỷ lục cũ ${oldMax}.`, en: `The window length ${windowLength} beats the old record ${oldMax}.` }
        : { vi: `Cửa sổ dài ${windowLength}, không vượt max_length = ${maxLength}.`, en: `The window length ${windowLength} does not beat max_length = ${maxLength}.` },
    });
  }

  snap({
    title: { vi: `Trả về ${maxLength}`, en: `Return ${maxLength}` },
    codeLine: 15,
    grid: { left: bestL, right: bestR, focus: bestR, markBest: true, caption: `longest=${JSON.stringify(bestR >= bestL ? s.slice(bestL, bestR + 1) : "")} · length=${maxLength}` },
    vars: [{ name: "max_length", value: maxLength }],
    note: { vi: `Substring không lặp dài nhất là ${JSON.stringify(bestR >= bestL ? s.slice(bestL, bestR + 1) : "")} với độ dài ${maxLength}.`, en: `The longest duplicate-free substring is ${JSON.stringify(bestR >= bestL ? s.slice(bestL, bestR + 1) : "")} with length ${maxLength}.` },
    final: true,
  });

  return { original: s, answer: maxLength, steps };
}

/**
 * Generate steps for LeetCode 1004: Max Consecutive Ones III.
 * Expand right, then shrink left whenever the window contains more than k zeros.
 */
function buildSteps1004(nums, params) {
  const k = params.k;
  const steps = [];

  const inWindow = (i, j) => Array.from({ length: j - i + 1 }, (_, t) => i + t);

  steps.push({
    title: { vi: "Mảng ban đầu", en: "Initial array" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [{ name: "k", value: k }],
    note: {
      vi: `Mảng nhị phân: [${nums.join(", ")}], k = ${k}. Được phép lật tối đa ${k} số 0 thành 1.`,
      en: `Binary array: [${nums.join(", ")}], k = ${k}. You may flip at most ${k} zeros to ones.`,
    },
  });

  let left = 0;
  let zeroCount = 0;
  let maxLength = 0;
  let bestL = 0;
  let bestR = -1;

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeroCount += 1;

    // Expand window to right
    steps.push({
      title: { vi: `Mở rộng: right = ${right}`, en: `Expand: right = ${right}` },
      arr: [...nums],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [6, 7, 8],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "zeroCount", value: zeroCount },
        { name: "maxLength", value: maxLength },
      ],
      note: {
        vi: `Thêm nums[${right}]=${nums[right]}. Số 0 trong cửa sổ [${left}..${right}] = ${zeroCount}.`,
        en: `Add nums[${right}]=${nums[right]}. Zeros in window [${left}..${right}] = ${zeroCount}.`,
      },
    });

    // Shrink window when zeros exceed k
    while (zeroCount > k) {
      const removed = nums[left];
      if (nums[left] === 0) zeroCount -= 1;
      left += 1;
      steps.push({
        title: { vi: `Co cửa sổ: left = ${left}`, en: `Shrink: left = ${left}` },
        arr: [...nums],
        highlight: inWindow(left, right),
        mark: [],
        codeLines: [9, 10, 11, 12],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "zeroCount", value: zeroCount },
          { name: "maxLength", value: maxLength },
        ],
        note: {
          vi: `Zeros vượt k=${k}. Bỏ nums[${left - 1}]=${removed} ở trái, left → ${left}. Zeros = ${zeroCount}.`,
          en: `Zeros exceeded k=${k}. Drop nums[${left - 1}]=${removed} on left, left → ${left}. Zeros = ${zeroCount}.`,
        },
      });
    }

    const length = right - left + 1;
    if (length > maxLength) {
      maxLength = length;
      bestL = left;
      bestR = right;
      steps.push({
        title: { vi: `Cập nhật max = ${maxLength}`, en: `Update max = ${maxLength}` },
        arr: [...nums],
        highlight: inWindow(left, right),
        mark: [],
        codeLines: [13],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "maxLength", value: maxLength },
          { name: "zeroCount", value: zeroCount },
        ],
        note: {
          vi: `Cửa sổ [${left}..${right}] dài ${length} > kỷ lục cũ. maxLength = ${maxLength}.`,
          en: `Window [${left}..${right}] of length ${length} beats the record. maxLength = ${maxLength}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestR >= 0 ? inWindow(bestL, bestR) : [],
    final: true,
    codeLines: [14],
    vars: [
      { name: "maxLength", value: maxLength },
      { name: "window", value: bestR >= 0 ? `[${bestL}..${bestR}]` : "-" },
    ],
    note: {
      vi: `Cửa sổ dài nhất là [${bestL}..${bestR}] với độ dài ${maxLength}. Đáp án = ${maxLength}.`,
      en: `The longest window is [${bestL}..${bestR}] with length ${maxLength}. Answer = ${maxLength}.`,
    },
  });

  return { original: [...nums], k, answer: maxLength, steps };
}

/**
 * LeetCode 1100: Find K-Length Substrings With No Repeated Characters.
 * Sliding window with a frequency map:
 *  - Expand right and count s[right].
 *  - Shrink while the window has a duplicate of s[right] or is longer than k.
 *  - Count windows whose length is exactly k.
 */
function buildSteps1100(input, params) {
  if (Number(params && params.approach) === 2) {
    return buildSteps1100Set(input, params);
  }

  const s = typeof input === "string" ? input.trim() : String(input);
  const k = params.k;
  const n = s.length;
  const chars = s.split("");
  const steps = [];
  const count = {};
  let left = 0;
  let answer = 0;
  const validStarts = [];

  const inWindow = (lo, hi) => (
    lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, x) => lo + x) : []
  );
  const countText = () => {
    const entries = Object.entries(count).filter(([, v]) => v > 0);
    return entries.length ? `{${entries.map(([ch, v]) => `${ch}:${v}`).join(", ")}}` : "{}";
  };
  const validCells = () => validStarts.flatMap((start) =>
    inWindow(start, start + k - 1).map((idx) => [0, idx + 1])
  );
  const validWindowsText = () => validStarts
    .map((start) => `"${s.slice(start, start + k)}"`)
    .join(", ");
  const setLabel = (labels, idx, label) => {
    if (idx < 0 || idx >= n) return;
    const key = `0,${idx + 1}`;
    labels[key] = labels[key] ? `${labels[key]}\n${label}` : label;
  };
  const makeGrid = (opts = {}) => {
    const lo = Number.isInteger(opts.left) ? opts.left : left;
    const hi = Number.isInteger(opts.right) ? opts.right : left - 1;
    const currentIndices = new Set(inWindow(lo, hi));
    const labels = {};
    setLabel(labels, lo, `left=${lo}`);
    setLabel(labels, hi, `right=${hi}`);
    if (opts.duplicateChar) {
      for (let idx = lo; idx <= hi; idx++) {
        if (s[idx] === opts.duplicateChar) setLabel(labels, idx, "dup");
      }
    }
    if (opts.valid) {
      for (let idx = lo; idx <= hi; idx++) setLabel(labels, idx, "valid");
    }
    return {
      dp: [["", ...chars]],
      text1: "",
      text2: s,
      colLabels: chars.map((char, idx) => ({ index: `idx=${idx}`, char })),
      hlCell: Number.isInteger(opts.focus) ? [0, opts.focus + 1] : null,
      autoScrollCell: hi >= 0 ? [0, hi + 1] : null,
      pathCells: inWindow(lo, hi).map((idx) => [0, idx + 1]),
      historyCells: opts.showValid === false
        ? []
        : validCells().filter(([, col]) => !currentIndices.has(col - 1)),
      cellLabels: labels,
      largeCells: true,
      caption: opts.caption || `window="${lo <= hi ? s.slice(lo, hi + 1) : ""}" · len=${Math.max(0, hi - lo + 1)}/${k} · count=${countText()} · answer=${answer}`,
      secondaryCaption: opts.showValid === false
        ? ""
        : `valid windows so far (${validStarts.length}): ${validWindowsText() || "none"}`,
    };
  };

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts.grid || {}),
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  snap({
    title: { vi: "Khởi tạo", en: "Initialize" },
    codeLines: [3],
    grid: { left: 0, right: -1, showValid: false, caption: `s="${s}" · k=${k}` },
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "k", value: k },
      { name: "n", value: n },
    ],
    note: {
      vi: "Đếm substring liên tiếp độ dài k mà không có ký tự lặp.",
      en: "Count contiguous substrings of length k with no repeated characters.",
    },
  });

  if (k <= 0 || k > n) {
    snap({
      title: { vi: "Không thể có cửa sổ hợp lệ", en: "No valid window possible" },
      codeLines: [3],
      grid: { left: 0, right: -1, showValid: false, caption: `k=${k} · n=${n} · answer=0` },
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: `k=${k} không tạo được substring hợp lệ trong chuỗi dài ${n}.`,
        en: `k=${k} cannot form a valid substring in a string of length ${n}.`,
      },
      final: true,
    });
    return { s, k, answer: 0, steps };
  }

  snap({
    title: { vi: "left = 0", en: "left = 0" },
    codeLines: [4],
    grid: { left, right: -1, showValid: false },
    vars: [{ name: "left", value: left }],
    note: {
      vi: "left là đầu cửa sổ hiện tại.",
      en: "left is the start of the current window.",
    },
  });

  snap({
    title: { vi: "count = {}", en: "count = {}" },
    codeLines: [5],
    grid: { left, right: -1, showValid: false },
    vars: [{ name: "count", value: countText() }],
    note: {
      vi: "count lưu số lần xuất hiện của từng ký tự trong cửa sổ.",
      en: "count stores each character's frequency inside the window.",
    },
  });

  snap({
    title: { vi: "answer = 0", en: "answer = 0" },
    codeLines: [6],
    grid: { left, right: -1, showValid: false },
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: "answer đếm số cửa sổ hợp lệ độ dài k.",
      en: "answer counts valid windows of length k.",
    },
  });

  for (let right = 0; right < n; right++) {
    const ch = s[right];
    snap({
      title: { vi: `for right=${right}, ch='${ch}'`, en: `for right=${right}, ch='${ch}'` },
      codeLines: [7],
      grid: { left, right, focus: right },
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "ch", value: ch },
        { name: "window", value: `"${s.slice(left, right + 1)}"` },
      ],
      note: {
        vi: `Mở rộng cửa sổ sang phải, thêm s[${right}]='${ch}'.`,
        en: `Expand the window to the right, adding s[${right}]='${ch}'.`,
      },
    });

    count[ch] = (count[ch] || 0) + 1;
    snap({
      title: { vi: `count['${ch}'] = ${count[ch]}`, en: `count['${ch}'] = ${count[ch]}` },
      codeLines: [8],
      grid: { left, right, focus: right, duplicateChar: count[ch] > 1 ? ch : null },
      vars: [
        { name: "ch", value: ch },
        { name: "count", value: countText() },
      ],
      note: {
        vi: `Tăng tần suất của '${ch}' trong cửa sổ.`,
        en: `Increase the frequency of '${ch}' in the window.`,
      },
    });

    while ((count[ch] || 0) > 1 || right - left + 1 > k) {
      const tooMany = (count[ch] || 0) > 1;
      const tooLong = right - left + 1 > k;
      snap({
        title: { vi: `while invalid -> true`, en: `while invalid -> true` },
        codeLines: [9],
        grid: { left, right, focus: tooMany ? right : left, duplicateChar: tooMany ? ch : null },
        vars: [
          { name: `count['${ch}'] > 1`, value: tooMany },
          { name: "window length > k", value: tooLong },
          { name: "window length", value: right - left + 1 },
          { name: "k", value: k },
        ],
        note: {
          vi: tooMany
            ? `Cửa sổ có ký tự '${ch}' bị lặp, cần co trái.`
            : `Cửa sổ dài hơn k=${k}, cần co trái.`,
          en: tooMany
            ? `The window repeats '${ch}', so shrink from the left.`
            : `The window is longer than k=${k}, so shrink from the left.`,
        },
      });

      const removed = s[left];
      count[removed] -= 1;
      snap({
        title: { vi: `count[s[left]] -= 1`, en: `count[s[left]] -= 1` },
        codeLines: [10],
        grid: { left, right, focus: left, duplicateChar: (count[ch] || 0) > 1 ? ch : null },
        vars: [
          { name: "removed", value: removed },
          { name: "count", value: countText() },
        ],
        note: {
          vi: `Bỏ s[${left}]='${removed}' khỏi cửa sổ.`,
          en: `Remove s[${left}]='${removed}' from the window.`,
        },
      });

      left += 1;
      snap({
        title: { vi: `left = ${left}`, en: `left = ${left}` },
        codeLines: [11],
        grid: { left, right, focus: left },
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "window", value: `"${s.slice(left, right + 1)}"` },
          { name: "count", value: countText() },
        ],
        note: {
          vi: `Dời left sang ${left}.`,
          en: `Move left to ${left}.`,
        },
      });
    }

    const windowLen = right - left + 1;
    const isValidK = windowLen === k;
    snap({
      title: { vi: `if window length == k -> ${isValidK}`, en: `if window length == k -> ${isValidK}` },
      codeLines: [12],
      grid: { left, right, focus: right, valid: isValidK },
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "window", value: `"${s.slice(left, right + 1)}"` },
        { name: "window length", value: windowLen },
        { name: "k", value: k },
      ],
      note: isValidK
        ? {
            vi: "Cửa sổ hiện tại có đúng độ dài k và không có ký tự lặp.",
            en: "The current window has exactly length k and no repeated characters.",
          }
        : {
            vi: "Cửa sổ chưa đủ độ dài k.",
            en: "The window is not length k yet.",
          },
    });

    if (isValidK) {
      answer += 1;
      validStarts.push(left);
      snap({
        title: { vi: `answer = ${answer}`, en: `answer = ${answer}` },
        codeLines: [13],
        grid: { left, right, focus: right, valid: true },
        vars: [
          { name: "valid substring", value: `"${s.slice(left, right + 1)}"` },
          { name: "answer", value: answer },
        ],
        note: {
          vi: `Đếm substring "${s.slice(left, right + 1)}".`,
          en: `Count substring "${s.slice(left, right + 1)}".`,
        },
      });
    }
  }

  snap({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    codeLines: [14],
    grid: {
      left,
      right: n - 1,
      caption: `finished · answer=${answer}`,
    },
    vars: [
      { name: "answer", value: answer },
      { name: "valid windows", value: validStarts.map((start) => `"${s.slice(start, start + k)}"`).join(", ") || "none" },
    ],
    note: {
      vi: `Có ${answer} substring độ dài ${k} không có ký tự lặp.`,
      en: `There are ${answer} substring(s) of length ${k} with no repeated characters.`,
    },
    final: true,
  });

  return { s, k, answer, steps };
}

/**
 * LeetCode 1100, approach 2: keep a duplicate-free set window.
 * After counting a length-k window, remove its left edge immediately.
 */
function buildSteps1100Set(input, params) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const k = Number(params.k);
  const chars = s.split("");
  const charSet = new Set();
  const steps = [];
  const validStarts = [];
  let left = 0;
  let total = 0;

  const inWindow = (lo, hi) => (
    lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, offset) => lo + offset) : []
  );
  const setText = () => `{${[...charSet].join(", ")}}`;
  const validCells = () => validStarts.flatMap((start) =>
    inWindow(start, start + k - 1).map((index) => [0, index + 1])
  );
  const validWindowsText = () => validStarts
    .map((start) => `"${s.slice(start, start + k)}"`)
    .join(", ");
  const setLabel = (labels, index, label) => {
    if (index < 0 || index >= chars.length) return;
    const key = `0,${index + 1}`;
    labels[key] = labels[key] ? `${labels[key]}\n${label}` : label;
  };
  const makeGrid = (opts = {}) => {
    const lo = Number.isInteger(opts.left) ? opts.left : left;
    const hi = Number.isInteger(opts.right) ? opts.right : left - 1;
    const currentIndices = new Set(inWindow(lo, hi));
    const labels = {};
    setLabel(labels, lo, `left=${lo}`);
    setLabel(labels, hi, `right=${hi}`);
    if (opts.duplicateChar) {
      for (let index = lo; index <= hi; index++) {
        if (s[index] === opts.duplicateChar) setLabel(labels, index, "dup");
      }
    }
    if (opts.valid) {
      for (let index = lo; index <= hi; index++) setLabel(labels, index, "valid");
    }
    return {
      dp: [["", ...chars]],
      text1: "",
      text2: s,
      colLabels: chars.map((char, index) => ({ index: `idx=${index}`, char })),
      hlCell: Number.isInteger(opts.focus) ? [0, opts.focus + 1] : null,
      autoScrollCell: hi >= 0 ? [0, hi + 1] : null,
      pathCells: inWindow(lo, hi).map((index) => [0, index + 1]),
      historyCells: opts.showValid === false
        ? []
        : validCells().filter(([, col]) => !currentIndices.has(col - 1)),
      cellLabels: labels,
      largeCells: true,
      caption: opts.caption || `window="${lo <= hi ? s.slice(lo, hi + 1) : ""}" · len=${Math.max(0, hi - lo + 1)}/${k} · char_set=${setText()} · total=${total}`,
      secondaryCaption: opts.showValid === false
        ? ""
        : `valid windows so far (${validStarts.length}): ${validWindowsText() || "none"}`,
    };
  };
  const snap = (opts) => {
    const persistentVarNames = new Set(["left", "total", "char_set"]);
    const extraVars = (opts.vars || []).filter(({ name }) => !persistentVarNames.has(name));
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts.grid || {}),
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      codeBlock: 2,
      vars: [
        { name: "left", value: left },
        { name: "total", value: total },
        { name: "char_set", value: setText() },
        ...extraVars,
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  };

  snap({
    title: { vi: "Khởi tạo char_set rỗng", en: "Initialize an empty char_set" },
    codeLines: [3],
    grid: { left: 0, right: -1, showValid: false, caption: `s="${s}" · k=${k}` },
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "k", value: k },
      { name: "char_set", value: setText() },
    ],
    note: {
      vi: "char_set chứa đúng các ký tự trong cửa sổ hiện tại và luôn không có phần tử trùng.",
      en: "char_set contains exactly the current window's characters and never contains duplicates.",
    },
  });
  snap({
    title: { vi: "left = 0", en: "left = 0" },
    codeLines: [4],
    grid: { left, right: -1, showValid: false },
    vars: [{ name: "left", value: left }],
    note: { vi: "left là đầu trái của cửa sổ.", en: "left is the window's left boundary." },
  });
  snap({
    title: { vi: "total = 0", en: "total = 0" },
    codeLines: [5],
    grid: { left, right: -1, showValid: false },
    vars: [{ name: "total", value: total }],
    note: { vi: "total đếm các substring hợp lệ độ dài k.", en: "total counts valid length-k substrings." },
  });

  for (let right = 0; right < chars.length; right++) {
    const ch = s[right];
    snap({
      title: { vi: `for right=${right}, s[right]='${ch}'`, en: `for right=${right}, s[right]='${ch}'` },
      codeLines: [7],
      grid: { left, right, focus: right, duplicateChar: charSet.has(ch) ? ch : null },
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "s[right]", value: `'${ch}'` },
        { name: "char_set", value: setText() },
      ],
      note: {
        vi: `Mở rộng cạnh phải đến index ${right}. Chưa thêm '${ch}' vào set cho tới khi xử lý hết bản sao cũ.`,
        en: `Move the right edge to index ${right}. Do not add '${ch}' until its old copy has been removed.`,
      },
    });

    while (true) {
      const duplicate = charSet.has(ch);
      snap({
        title: { vi: `while s[right] in char_set → ${duplicate}`, en: `while s[right] in char_set -> ${duplicate}` },
        codeLines: [8],
        grid: { left, right, focus: duplicate ? left : right, duplicateChar: duplicate ? ch : null },
        vars: [
          { name: "s[right] in char_set", value: duplicate },
          { name: "char_set", value: setText() },
          { name: "window", value: `"${s.slice(left, right + 1)}"` },
        ],
        note: duplicate
          ? {
              vi: `'${ch}' đã có trong cửa sổ. Phải xóa từ bên trái cho đến khi bản sao cũ của '${ch}' biến mất.`,
              en: `'${ch}' is already in the window. Remove from the left until its old copy disappears.`,
            }
          : {
              vi: `'${ch}' chưa có trong char_set, nên cửa sổ sẽ vẫn không lặp sau khi thêm.`,
              en: `'${ch}' is not in char_set, so adding it preserves uniqueness.`,
            },
      });
      if (!duplicate) break;

      const removed = s[left];
      charSet.delete(removed);
      snap({
        title: { vi: `char_set.remove('${removed}')`, en: `char_set.remove('${removed}')` },
        codeLines: [9],
        grid: { left, right, focus: left, duplicateChar: charSet.has(ch) ? ch : null },
        vars: [
          { name: "removed", value: `s[${left}] = '${removed}'` },
          { name: "char_set", value: setText() },
        ],
        note: {
          vi: `Xóa ký tự trái '${removed}' khỏi set trước khi dời left.`,
          en: `Remove leftmost character '${removed}' from the set before moving left.`,
        },
      });

      left += 1;
      snap({
        title: { vi: `left = ${left}`, en: `left = ${left}` },
        codeLines: [10],
        grid: { left, right, focus: left, duplicateChar: charSet.has(ch) ? ch : null },
        vars: [
          { name: "left", value: left },
          { name: "window", value: `"${s.slice(left, right + 1)}"` },
        ],
        note: { vi: `Dời left sang index ${left}.`, en: `Move left to index ${left}.` },
      });
    }

    charSet.add(ch);
    snap({
      title: { vi: `char_set.add('${ch}')`, en: `char_set.add('${ch}')` },
      codeLines: [11],
      grid: { left, right, focus: right },
      vars: [
        { name: "char_set", value: setText() },
        { name: "window", value: `"${s.slice(left, right + 1)}"` },
      ],
      note: {
        vi: `Thêm '${ch}'. Bây giờ char_set khớp chính xác với cửa sổ không lặp hiện tại.`,
        en: `Add '${ch}'. char_set now exactly matches the current duplicate-free window.`,
      },
    });

    const windowLength = right - left + 1;
    const isValidK = windowLength === k;
    snap({
      title: { vi: `if right-left+1 == k → ${isValidK}`, en: `if right-left+1 == k -> ${isValidK}` },
      codeLines: [13],
      grid: { left, right, focus: right, valid: isValidK },
      vars: [
        { name: "right-left+1", value: `${right}-${left}+1 = ${windowLength}` },
        { name: "k", value: k },
        { name: "condition", value: isValidK },
      ],
      note: isValidK
        ? { vi: "Cửa sổ không lặp có đúng độ dài k, nên đây là một đáp án.", en: "The duplicate-free window has length k, so it is a valid answer." }
        : { vi: "Cửa sổ không lặp chưa đạt độ dài k.", en: "The duplicate-free window has not reached length k." },
    });

    if (isValidK) {
      const validStart = left;
      const validSubstring = s.slice(validStart, right + 1);
      total += 1;
      validStarts.push(validStart);
      snap({
        title: { vi: `total = ${total}`, en: `total = ${total}` },
        codeLines: [14],
        grid: { left, right, focus: right, valid: true },
        vars: [
          { name: "valid substring", value: `"${validSubstring}"` },
          { name: "total", value: total },
        ],
        note: { vi: `Đếm substring "${validSubstring}".`, en: `Count substring "${validSubstring}".` },
      });

      const removed = s[left];
      charSet.delete(removed);
      snap({
        title: { vi: `char_set.remove('${removed}')`, en: `char_set.remove('${removed}')` },
        codeLines: [15],
        grid: { left, right, focus: left, valid: true },
        vars: [
          { name: "removed", value: `s[${left}] = '${removed}'` },
          { name: "char_set", value: setText() },
        ],
        note: {
          vi: `Sau khi đếm, xóa cạnh trái '${removed}' ngay. Cửa sổ chuẩn bị cho right tiếp theo sẽ dài tối đa k-1.`,
          en: `After counting, immediately remove left edge '${removed}'. The next iteration starts with at most k-1 characters.`,
        },
      });

      left += 1;
      snap({
        title: { vi: `left = ${left}`, en: `left = ${left}` },
        codeLines: [16],
        grid: { left, right, focus: left },
        vars: [
          { name: "left", value: left },
          { name: "next window", value: `"${s.slice(left, right + 1)}"` },
          { name: "char_set", value: setText() },
        ],
        note: {
          vi: `Dời left sang ${left}; không cần điều kiện window > k trong approach này.`,
          en: `Move left to ${left}; this approach never needs a window > k condition.`,
        },
      });
    }
  }

  snap({
    title: { vi: `return ${total}`, en: `return ${total}` },
    codeLines: [18],
    grid: {
      left,
      right: chars.length - 1,
      caption: `finished · total=${total}`,
    },
    vars: [
      { name: "total", value: total },
      { name: "valid windows", value: validStarts.map((start) => `"${s.slice(start, start + k)}"`).join(", ") || "none" },
    ],
    note: {
      vi: `Có ${total} substring độ dài ${k} không có ký tự lặp.`,
      en: `There are ${total} substring(s) of length ${k} with no repeated characters.`,
    },
    final: true,
  });

  return { s, k, answer: total, steps };
}

/**
 * Generate steps for LeetCode 1208: Get Equal Substrings Within Budget.
 *
 * Sliding window on cost array cost[i] = |s[i] - t[i]|:
 *  - Expand right, add cost[right] to windowCost.
 *  - When windowCost > maxCost, shrink left and subtract cost[left].
 *  - The answer is the maximum valid window length.
 */
function buildSteps1208(s, params) {
  const t = params.t;
  const maxCost = params.maxCost;
  const n = Math.min(s.length, t.length);

  const cost = [];
  const pair = [];
  for (let i = 0; i < n; i++) {
    cost.push(Math.abs(s.charCodeAt(i) - t.charCodeAt(i)));
    pair.push(`${s[i]}\u2192${t[i]}`);
  }

  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  steps.push({
    title: { vi: "Mảng chi phí", en: "Cost array" },
    arr: [...cost],
    sub: [...pair],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5, 6],
    vars: [
      { name: "s", value: s },
      { name: "t", value: t },
      { name: "maxCost", value: maxCost },
    ],
    note: {
      vi: `cost[i] = |s[i] - t[i]|. Chuyển "${s}" → "${t}" tốn [${cost.join(", ")}]. Ngân sách maxCost = ${maxCost}.`,
      en: `cost[i] = |s[i] - t[i]|. Converting "${s}" → "${t}" costs [${cost.join(", ")}]. Budget maxCost = ${maxCost}.`,
    },
  });

  let left = 0;
  let windowCost = 0;
  let maxLength = 0;
  let bestL = 0;
  let bestR = -1;

  for (let right = 0; right < n; right++) {
    windowCost += cost[right];

    steps.push({
      title: { vi: `Mở rộng: right = ${right}`, en: `Expand: right = ${right}` },
      arr: [...cost],
      sub: [...pair],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [7, 8],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "windowCost", value: windowCost },
        { name: "maxCost", value: maxCost },
        { name: "maxLength", value: maxLength },
      ],
      note: {
        vi: `Thêm cost[${right}] = ${cost[right]} (${pair[right]}). windowCost = ${windowCost}, ngân sách ${maxCost}.`,
        en: `Add cost[${right}] = ${cost[right]} (${pair[right]}). windowCost = ${windowCost}, budget ${maxCost}.`,
      },
    });

    while (windowCost > maxCost) {
      windowCost -= cost[left];
      left += 1;
      steps.push({
        title: { vi: `Co cửa sổ: left = ${left}`, en: `Shrink: left = ${left}` },
        arr: [...cost],
        sub: [...pair],
        highlight: left <= right ? inWindow(left, right) : [],
        mark: [],
        codeLines: [9, 10, 11],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "windowCost", value: windowCost },
          { name: "maxCost", value: maxCost },
          { name: "maxLength", value: maxLength },
        ],
        note: {
          vi: `windowCost vượt ngân sách. Bỏ cost[${left - 1}] ở trái, dời left → ${left}. windowCost = ${windowCost}.`,
          en: `windowCost exceeded the budget. Drop cost[${left - 1}] on the left, move left → ${left}. windowCost = ${windowCost}.`,
        },
      });
    }

    const length = right - left + 1;
    if (length > maxLength) {
      maxLength = length;
      bestL = left;
      bestR = right;
      steps.push({
        title: { vi: `Cập nhật max = ${maxLength}`, en: `Update max = ${maxLength}` },
        arr: [...cost],
        sub: [...pair],
        highlight: inWindow(left, right),
        mark: [],
        codeLines: [12],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "windowCost", value: windowCost },
          { name: "maxLength", value: maxLength },
        ],
        note: {
          vi: `Cửa sổ hợp lệ [${left}..${right}] dài ${length} > kỷ lục cũ. maxLength = ${maxLength}.`,
          en: `Valid window [${left}..${right}] of length ${length} beats the record. maxLength = ${maxLength}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...cost],
    sub: [...pair],
    highlight: [],
    mark: bestR >= 0 ? inWindow(bestL, bestR) : [],
    final: true,
    codeLines: [13],
    vars: [
      { name: "maxLength", value: maxLength },
      { name: "window", value: bestR >= 0 ? `[${bestL}..${bestR}]` : "-" },
    ],
    note: {
      vi: `Đoạn dài nhất chuyển được trong ngân sách là [${bestL}..${bestR}], độ dài ${maxLength}. Đáp án = ${maxLength}.`,
      en: `The longest convertible substring within budget is [${bestL}..${bestR}], length ${maxLength}. Answer = ${maxLength}.`,
    },
  });

  return { original: s, t, maxCost, answer: maxLength, steps };
}

/**
 * LeetCode 643: Maximum Average Subarray I.
 * Keep the sum of one fixed-size window and slide it one position at a time.
 */
function buildSteps643(input, params) {
  if (Number(params && params.approach) === 2) {
    return buildSteps643Prefix(input, params);
  }

  const nums = Array.isArray(input) ? input.map(Number) : [];
  const k = Number(params && params.k);
  if (!nums.length || !Number.isInteger(k) || k < 1 || k > nums.length) {
    throw new Error("k must be an integer between 1 and nums.length");
  }

  const steps = [];
  const indices = (left, right) => (
    Number.isInteger(left) && Number.isInteger(right) && left <= right
      ? Array.from({ length: right - left + 1 }, (_, offset) => left + offset)
      : []
  );
  const format = (value) => Number(value.toFixed(5));
  let currentLeft = null;
  let currentRight = null;
  let nextLeft = null;
  let nextRight = null;
  let bestLeft = null;
  let bestRight = null;
  let windowSum = null;
  let maxSum = null;
  let outgoingIndex = null;
  let incomingIndex = null;
  let operation = null;
  let shouldUpdate = null;
  const evaluatedWindows = [];

  const phaseFor = (event) => {
    if (["enter", "select-initial", "init-sum", "init-max"].includes(event)) return "initialize";
    if (["advance", "calculate-slide", "apply-slide"].includes(event)) return "slide";
    if (["compare", "apply-max"].includes(event)) return "compare";
    return "done";
  };
  const makeView = (event, overrides = {}) => ({
    event,
    phase: phaseFor(event),
    nums: [...nums],
    k,
    currentLeft,
    currentRight,
    nextLeft,
    nextRight,
    bestLeft,
    bestRight,
    windowSum,
    maxSum,
    currentAverage: windowSum === null ? null : windowSum / k,
    maxAverage: maxSum === null ? null : maxSum / k,
    outgoingIndex,
    incomingIndex,
    operation: operation ? { ...operation } : null,
    shouldUpdate,
    evaluatedWindows: evaluatedWindows.map((window) => ({ ...window })),
    ...overrides,
  });
  const variables = (extra = []) => {
    const values = [{ name: "k", value: k }];
    if (windowSum !== null) values.push({ name: "window_sum", value: windowSum });
    if (maxSum !== null) values.push({ name: "max_sum", value: maxSum });
    return [...values, ...extra];
  };
  const push = ({ event, title, line, note, vars = variables(), final = false, view = {} }) => {
    steps.push({
      title,
      arr: [...nums],
      highlight: indices(currentLeft, currentRight),
      mark: indices(bestLeft, bestRight),
      averageWindowView: makeView(event, view),
      codeLines: [line],
      vars,
      note,
      final,
    });
  };

  push({
    event: "enter",
    title: { vi: "Bắt đầu findMaxAverage", en: "Enter findMaxAverage" },
    line: 2,
    note: {
      vi: `Ta cần tìm cửa sổ liên tiếp dài đúng k = ${k} có tổng lớn nhất. Chưa gán window_sum hoặc max_sum.`,
      en: `Find the contiguous window of exactly k = ${k} elements with the largest sum. window_sum and max_sum are not assigned yet.`,
    },
  });

  currentLeft = 0;
  currentRight = k - 1;
  push({
    event: "select-initial",
    title: { vi: `Chọn nums[:${k}]`, en: `Select nums[:${k}]` },
    line: 3,
    note: {
      vi: `Cửa sổ đầu tiên là [0..${k - 1}]. Bước tiếp theo mới tính và gán tổng của ${k} phần tử này.`,
      en: `The first window is [0..${k - 1}]. The next step computes and assigns the sum of these ${k} values.`,
    },
  });

  const firstWindow = nums.slice(0, k);
  const firstWindowExpression = firstWindow.map((value, index) => {
    if (index === 0) return String(value);
    return value < 0 ? `- ${Math.abs(value)}` : `+ ${value}`;
  }).join(" ");
  windowSum = firstWindow.reduce((sum, value) => sum + value, 0);
  push({
    event: "init-sum",
    title: { vi: `window_sum = ${windowSum}`, en: `window_sum = ${windowSum}` },
    line: 3,
    note: {
      vi: `sum(nums[:${k}]) = ${firstWindowExpression} = ${windowSum}.`,
      en: `sum(nums[:${k}]) = ${firstWindowExpression} = ${windowSum}.`,
    },
  });

  maxSum = windowSum;
  bestLeft = currentLeft;
  bestRight = currentRight;
  evaluatedWindows.push({
    left: currentLeft,
    right: currentRight,
    sum: windowSum,
    average: windowSum / k,
    isBest: true,
  });
  push({
    event: "init-max",
    title: { vi: `max_sum = ${maxSum}`, en: `max_sum = ${maxSum}` },
    line: 4,
    note: {
      vi: `Cửa sổ đầu tiên tạm giữ kỷ lục: tổng ${maxSum}, trung bình ${format(maxSum / k)}.`,
      en: `The first window starts as the record: sum ${maxSum}, average ${format(maxSum / k)}.`,
    },
  });

  for (let i = k; i < nums.length; i++) {
    outgoingIndex = i - k;
    incomingIndex = i;
    nextLeft = currentLeft + 1;
    nextRight = i;
    operation = null;
    shouldUpdate = null;
    push({
      event: "advance",
      title: { vi: `i = ${i}: xác định OUT và IN`, en: `i = ${i}: identify OUT and IN` },
      line: 6,
      vars: variables([
        { name: "i", value: i },
        { name: "OUT", value: `nums[${outgoingIndex}] = ${nums[outgoingIndex]}` },
        { name: "IN", value: `nums[${incomingIndex}] = ${nums[incomingIndex]}` },
      ]),
      note: {
        vi: `Để trượt sang [${nextLeft}..${nextRight}], bỏ nums[${outgoingIndex}] = ${nums[outgoingIndex]} và thêm nums[${incomingIndex}] = ${nums[incomingIndex]}.`,
        en: `To slide to [${nextLeft}..${nextRight}], remove nums[${outgoingIndex}] = ${nums[outgoingIndex]} and add nums[${incomingIndex}] = ${nums[incomingIndex]}.`,
      },
    });

    const previousSum = windowSum;
    const nextSum = previousSum + nums[incomingIndex] - nums[outgoingIndex];
    operation = {
      previousSum,
      incomingValue: nums[incomingIndex],
      outgoingValue: nums[outgoingIndex],
      result: nextSum,
    };
    push({
      event: "calculate-slide",
      title: {
        vi: `${previousSum} + ${nums[incomingIndex]} - ${nums[outgoingIndex]} = ${nextSum}`,
        en: `${previousSum} + ${nums[incomingIndex]} - ${nums[outgoingIndex]} = ${nextSum}`,
      },
      line: 7,
      vars: variables([
        { name: "i", value: i },
        { name: "next window_sum", value: nextSum },
      ]),
      note: {
        vi: "Tính tổng cửa sổ mới từ tổng cũ; không cần cộng lại toàn bộ k phần tử.",
        en: "Compute the new window sum from the old sum; there is no need to add all k values again.",
      },
    });

    windowSum = nextSum;
    currentLeft = nextLeft;
    currentRight = nextRight;
    push({
      event: "apply-slide",
      title: { vi: `Gán window_sum = ${windowSum}`, en: `Assign window_sum = ${windowSum}` },
      line: 7,
      vars: variables([{ name: "i", value: i }]),
      note: {
        vi: `Cửa sổ hiện tại đã chuyển thành [${currentLeft}..${currentRight}], tổng ${windowSum}, trung bình ${format(windowSum / k)}.`,
        en: `The current window is now [${currentLeft}..${currentRight}], sum ${windowSum}, average ${format(windowSum / k)}.`,
      },
    });

    shouldUpdate = windowSum > maxSum;
    push({
      event: "compare",
      title: shouldUpdate
        ? { vi: `${windowSum} > ${maxSum}: cập nhật kỷ lục`, en: `${windowSum} > ${maxSum}: update the record` }
        : { vi: `${windowSum} ≤ ${maxSum}: giữ kỷ lục`, en: `${windowSum} ≤ ${maxSum}: keep the record` },
      line: 8,
      vars: variables([
        { name: "i", value: i },
        { name: "window_sum > max_sum", value: shouldUpdate },
      ]),
      note: shouldUpdate
        ? { vi: `Tổng ${windowSum} lớn hơn max_sum ${maxSum}.`, en: `Sum ${windowSum} is greater than max_sum ${maxSum}.` }
        : { vi: `Tổng ${windowSum} không vượt max_sum ${maxSum}.`, en: `Sum ${windowSum} does not beat max_sum ${maxSum}.` },
    });

    if (shouldUpdate) {
      maxSum = windowSum;
      bestLeft = currentLeft;
      bestRight = currentRight;
      evaluatedWindows.forEach((window) => { window.isBest = false; });
    }
    evaluatedWindows.push({
      left: currentLeft,
      right: currentRight,
      sum: windowSum,
      average: windowSum / k,
      isBest: shouldUpdate,
    });
    push({
      event: "apply-max",
      title: shouldUpdate
        ? { vi: `max_sum = ${maxSum}`, en: `max_sum = ${maxSum}` }
        : { vi: `max_sum vẫn là ${maxSum}`, en: `max_sum stays ${maxSum}` },
      line: 8,
      vars: variables([
        { name: "i", value: i },
        { name: "best window", value: `[${bestLeft}..${bestRight}]` },
      ]),
      note: shouldUpdate
        ? { vi: `Lưu [${bestLeft}..${bestRight}] làm cửa sổ tốt nhất mới.`, en: `Store [${bestLeft}..${bestRight}] as the new best window.` }
        : { vi: `Giữ cửa sổ tốt nhất [${bestLeft}..${bestRight}].`, en: `Keep the best window [${bestLeft}..${bestRight}].` },
    });
  }

  outgoingIndex = null;
  incomingIndex = null;
  nextLeft = null;
  nextRight = null;
  operation = null;
  shouldUpdate = null;
  const answer = maxSum / k;
  push({
    event: "done",
    title: { vi: `Trả về ${format(answer)}`, en: `Return ${format(answer)}` },
    line: 10,
    vars: [
      { name: "max_sum", value: maxSum },
      { name: "k", value: k },
      { name: "answer", value: format(answer) },
    ],
    note: {
      vi: `Cửa sổ tốt nhất [${bestLeft}..${bestRight}] có trung bình ${maxSum} / ${k} = ${format(answer)}.`,
      en: `The best window [${bestLeft}..${bestRight}] has average ${maxSum} / ${k} = ${format(answer)}.`,
    },
    final: true,
    view: {
      currentLeft: bestLeft,
      currentRight: bestRight,
      windowSum: maxSum,
      currentAverage: answer,
    },
  });

  return { original: nums, k, answer, steps };
}

/**
 * LeetCode 643, approach 2: prefix sums.
 * prefix[right] - prefix[left] gives the sum of nums[left..right-1].
 */
function buildSteps643Prefix(input, params) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  const k = Number(params && params.k);
  if (!nums.length || !Number.isInteger(k) || k < 1 || k > nums.length) {
    throw new Error("k must be an integer between 1 and nums.length");
  }

  const steps = [];
  const prefix = new Array(nums.length + 1).fill(null);
  const evaluatedWindows = [];
  const format = (value) => Number(value.toFixed(5));
  let activeNumIndex = null;
  let activePrefixFrom = null;
  let activePrefixTo = null;
  let windowLeft = null;
  let windowRight = null;
  let windowSum = null;
  let maxSum = null;
  let recordBefore = null;
  let bestLeft = null;
  let bestRight = null;
  let shouldUpdate = null;

  const phaseFor = (event) => {
    if (["enter", "init-prefix"].includes(event)) return "initialize";
    if (["prefix-loop", "prefix-assign"].includes(event)) return "build";
    if (["init-record", "window-loop", "window-sum", "compare", "apply-max"].includes(event)) return "query";
    return "done";
  };
  const makeView = (event, overrides = {}) => ({
    event,
    phase: phaseFor(event),
    nums: [...nums],
    k,
    prefix: [...prefix],
    activeNumIndex,
    activePrefixFrom,
    activePrefixTo,
    windowLeft,
    windowRight,
    windowSum,
    currentAverage: windowSum === null ? null : windowSum / k,
    maxSum,
    maxAverage: maxSum === null ? null : maxSum / k,
    recordBefore,
    bestLeft,
    bestRight,
    shouldUpdate,
    evaluatedWindows: evaluatedWindows.map((window) => ({ ...window })),
    ...overrides,
  });
  const variables = (extra = []) => {
    const values = [
      { name: "k", value: k },
      { name: "prefix", value: `[${prefix.map((value) => value === null ? "_" : value).join(", ")}]` },
    ];
    if (windowSum !== null) values.push({ name: "window_sum", value: windowSum });
    if (maxSum !== null) values.push({ name: "max_sum", value: maxSum });
    return [...values, ...extra];
  };
  const push = ({ event, title, line, note, vars = variables(), final = false, view = {} }) => {
    const highlighted = Number.isInteger(windowLeft) && Number.isInteger(windowRight)
      ? Array.from({ length: windowRight - windowLeft }, (_, offset) => windowLeft + offset)
      : [];
    steps.push({
      title,
      arr: [...nums],
      highlight: highlighted,
      mark: Number.isInteger(bestLeft) && Number.isInteger(bestRight)
        ? Array.from({ length: bestRight - bestLeft }, (_, offset) => bestLeft + offset)
        : [],
      prefixAverageView: makeView(event, view),
      codeBlock: 2,
      codeLines: [line],
      vars,
      note,
      final,
    });
  };

  push({
    event: "enter",
    title: { vi: "Bắt đầu cách Prefix Sum", en: "Enter the Prefix Sum approach" },
    line: 2,
    note: {
      vi: "Mảng prefix chưa được tạo. prefix[t] sẽ lưu tổng của nums[0..t-1].",
      en: "The prefix array has not been created yet. prefix[t] will store the sum of nums[0..t-1].",
    },
  });

  prefix[0] = 0;
  push({
    event: "init-prefix",
    title: { vi: `Tạo prefix có ${prefix.length} ô`, en: `Create ${prefix.length} prefix cells` },
    line: 3,
    note: {
      vi: `prefix[0] = 0 vì chưa lấy phần tử nào; ${nums.length} ô còn lại sẽ được điền lần lượt.`,
      en: `prefix[0] = 0 because no value has been taken; the remaining ${nums.length} cells will be filled from left to right.`,
    },
  });

  for (let i = 0; i < nums.length; i++) {
    activeNumIndex = i;
    activePrefixFrom = i;
    activePrefixTo = i + 1;
    push({
      event: "prefix-loop",
      title: { vi: `i = ${i}, num = ${nums[i]}`, en: `i = ${i}, num = ${nums[i]}` },
      line: 4,
      vars: variables([
        { name: "i", value: i },
        { name: "num", value: nums[i] },
      ]),
      note: {
        vi: `Đọc nums[${i}] = ${nums[i]}; dùng prefix[${i}] để tính ô kế tiếp.`,
        en: `Read nums[${i}] = ${nums[i]}; use prefix[${i}] to compute the next cell.`,
      },
    });

    prefix[i + 1] = prefix[i] + nums[i];
    push({
      event: "prefix-assign",
      title: { vi: `prefix[${i + 1}] = ${prefix[i + 1]}`, en: `prefix[${i + 1}] = ${prefix[i + 1]}` },
      line: 5,
      vars: variables([
        { name: "i", value: i },
        { name: "num", value: nums[i] },
      ]),
      note: {
        vi: `prefix[${i + 1}] = prefix[${i}] + nums[${i}] = ${prefix[i]} + (${nums[i]}) = ${prefix[i + 1]}.`,
        en: `prefix[${i + 1}] = prefix[${i}] + nums[${i}] = ${prefix[i]} + (${nums[i]}) = ${prefix[i + 1]}.`,
      },
    });
  }

  activeNumIndex = null;
  activePrefixFrom = null;
  activePrefixTo = null;
  push({
    event: "init-record",
    title: { vi: "max_sum = -∞", en: "max_sum = -∞" },
    line: 6,
    vars: variables([{ name: "max_sum", value: "-∞" }]),
    note: {
      vi: "Khởi tạo kỷ lục nhỏ hơn mọi tổng cửa sổ để cửa sổ đầu tiên chắc chắn được nhận.",
      en: "Start below every possible window sum so the first window is guaranteed to become the record.",
    },
  });

  for (let right = k; right <= nums.length; right++) {
    windowLeft = right - k;
    windowRight = right;
    windowSum = null;
    recordBefore = maxSum;
    shouldUpdate = null;
    push({
      event: "window-loop",
      title: { vi: `right = ${right}, left = ${windowLeft}`, en: `right = ${right}, left = ${windowLeft}` },
      line: 7,
      vars: variables([
        { name: "left", value: windowLeft },
        { name: "right", value: right },
      ]),
      note: {
        vi: `Hai mốc prefix[${windowLeft}] và prefix[${right}] bao quanh nums[${windowLeft}..${right - 1}], đúng ${k} phần tử.`,
        en: `prefix[${windowLeft}] and prefix[${right}] bound nums[${windowLeft}..${right - 1}], exactly ${k} values.`,
      },
    });

    windowSum = prefix[right] - prefix[windowLeft];
    push({
      event: "window-sum",
      title: { vi: `window_sum = ${windowSum}`, en: `window_sum = ${windowSum}` },
      line: 8,
      vars: variables([
        { name: "left", value: windowLeft },
        { name: "right", value: right },
      ]),
      note: {
        vi: `prefix[${right}] - prefix[${windowLeft}] = ${prefix[right]} - (${prefix[windowLeft]}) = ${windowSum}. Phần prefix trước left bị triệt tiêu.`,
        en: `prefix[${right}] - prefix[${windowLeft}] = ${prefix[right]} - (${prefix[windowLeft]}) = ${windowSum}. The prefix before left cancels out.`,
      },
    });

    shouldUpdate = maxSum === null || windowSum > maxSum;
    recordBefore = maxSum;
    push({
      event: "compare",
      title: shouldUpdate
        ? { vi: `${windowSum} > ${maxSum === null ? "-∞" : maxSum}: cập nhật`, en: `${windowSum} > ${maxSum === null ? "-∞" : maxSum}: update` }
        : { vi: `${windowSum} ≤ ${maxSum}: giữ kỷ lục`, en: `${windowSum} ≤ ${maxSum}: keep the record` },
      line: 9,
      vars: variables([
        { name: "left", value: windowLeft },
        { name: "right", value: right },
        { name: "window_sum > max_sum", value: shouldUpdate },
      ]),
      note: shouldUpdate
        ? { vi: "Tổng cửa sổ hiện tại tốt hơn kỷ lục trước.", en: "The current window sum beats the previous record." }
        : { vi: "Kỷ lục hiện tại vẫn lớn hơn hoặc bằng tổng này.", en: "The current record is still greater than or equal to this sum." },
    });

    if (shouldUpdate) {
      maxSum = windowSum;
      bestLeft = windowLeft;
      bestRight = right;
      evaluatedWindows.forEach((window) => { window.isBest = false; });
    }
    evaluatedWindows.push({
      left: windowLeft,
      right,
      sum: windowSum,
      average: windowSum / k,
      isBest: shouldUpdate,
    });
    push({
      event: "apply-max",
      title: shouldUpdate
        ? { vi: `max_sum = ${maxSum}`, en: `max_sum = ${maxSum}` }
        : { vi: `max_sum vẫn là ${maxSum}`, en: `max_sum stays ${maxSum}` },
      line: 9,
      vars: variables([
        { name: "best window", value: `[${bestLeft}..${bestRight - 1}]` },
      ]),
      note: shouldUpdate
        ? { vi: `Lưu nums[${bestLeft}..${bestRight - 1}] làm cửa sổ tốt nhất.`, en: `Store nums[${bestLeft}..${bestRight - 1}] as the best window.` }
        : { vi: `Giữ nums[${bestLeft}..${bestRight - 1}] là cửa sổ tốt nhất.`, en: `Keep nums[${bestLeft}..${bestRight - 1}] as the best window.` },
    });
  }

  const answer = maxSum / k;
  activeNumIndex = null;
  activePrefixFrom = null;
  activePrefixTo = null;
  shouldUpdate = null;
  recordBefore = null;
  push({
    event: "done",
    title: { vi: `Trả về ${format(answer)}`, en: `Return ${format(answer)}` },
    line: 10,
    vars: [
      { name: "max_sum", value: maxSum },
      { name: "k", value: k },
      { name: "answer", value: format(answer) },
    ],
    note: {
      vi: `Cửa sổ tốt nhất nums[${bestLeft}..${bestRight - 1}] có trung bình ${maxSum} / ${k} = ${format(answer)}.`,
      en: `The best window nums[${bestLeft}..${bestRight - 1}] has average ${maxSum} / ${k} = ${format(answer)}.`,
    },
    final: true,
    view: {
      windowLeft: bestLeft,
      windowRight: bestRight,
      windowSum: maxSum,
      currentAverage: answer,
    },
  });

  return { original: nums, k, prefix, answer, steps };
}

/**
 * LeetCode 487: Max Consecutive Ones II.
 * Sliding window: allow flipping at most one 0 to 1.
 */
function buildSteps487(nums) {
  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  let left = 0;
  let zeroCount = 0;
  let maxLen = 0;
  let bestL = 0;
  let bestR = -1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "left", value: 0 },
      { name: "zeroCount", value: 0 },
      { name: "maxLen", value: 0 },
    ],
    note: {
      vi: `Mảng nhị phân. Được lật tối đa 1 số 0 thành 1. Tìm dãy 1 liên tiếp dài nhất.`,
      en: `Binary array. May flip at most one 0 to 1. Find the longest consecutive-ones run.`,
    },
  });

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeroCount++;

    steps.push({
      title: { vi: `Mở rộng: right = ${right}`, en: `Expand: right = ${right}` },
      arr: [...nums],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [6, 7, 8],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "zeroCount", value: zeroCount },
        { name: "maxLen", value: maxLen },
      ],
      note: {
        vi: `Thêm nums[${right}]=${nums[right]}. Số 0 trong cửa sổ = ${zeroCount}.`,
        en: `Add nums[${right}]=${nums[right]}. Zeros in window = ${zeroCount}.`,
      },
    });

    while (zeroCount > 1) {
      if (nums[left] === 0) zeroCount--;
      left++;
      steps.push({
        title: { vi: `Co: left = ${left}`, en: `Shrink: left = ${left}` },
        arr: [...nums],
        highlight: left <= right ? inWindow(left, right) : [],
        mark: [],
        codeLines: [9, 10, 11],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "zeroCount", value: zeroCount },
          { name: "maxLen", value: maxLen },
        ],
        note: {
          vi: `zeroCount > 1 → co trái. Bỏ nums[${left - 1}]. zeroCount = ${zeroCount}.`,
          en: `zeroCount > 1 → shrink left. Drop nums[${left - 1}]. zeroCount = ${zeroCount}.`,
        },
      });
    }

    const len = right - left + 1;
    if (len > maxLen) {
      maxLen = len;
      bestL = left;
      bestR = right;
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestR >= 0 ? inWindow(bestL, bestR) : [],
    final: true,
    codeLines: [12],
    vars: [
      { name: "maxLen", value: maxLen },
      { name: "window", value: `[${bestL}..${bestR}]` },
    ],
    note: {
      vi: `Dãy 1 liên tiếp dài nhất (lật ≤1 số 0) = ${maxLen}, đoạn [${bestL}..${bestR}].`,
      en: `Longest consecutive ones (flipping ≤1 zero) = ${maxLen}, segment [${bestL}..${bestR}].`,
    },
  });

  return { original: [...nums], answer: maxLen, steps };
}

/**
 * LeetCode 209: Minimum Size Subarray Sum.
 * Sliding window: expand right, shrink left while sum >= target, track min length.
 */
function buildSteps209Legacy(nums, params) {
  const target = params.target;
  const n = nums.length;
  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  let left = 0;
  let sum = 0;
  let minLen = Infinity;
  let bestL = 0;
  let bestR = -1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "target", value: target },
      { name: "left", value: 0 },
      { name: "sum", value: 0 },
      { name: "minLen", value: "∞" },
    ],
    note: {
      vi: `Tìm đoạn con ngắn nhất có tổng ≥ ${target}. Cửa sổ trượt: mở rộng rồi co.`,
      en: `Find shortest subarray with sum ≥ ${target}. Sliding window: expand then shrink.`,
    },
  });

  for (let right = 0; right < n; right++) {
    sum += nums[right];

    steps.push({
      title: { vi: `Mở rộng: right=${right}`, en: `Expand: right=${right}` },
      arr: [...nums],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "sum", value: sum },
        { name: "minLen", value: minLen === Infinity ? "∞" : minLen },
      ],
      note: {
        vi: `Thêm nums[${right}]=${nums[right]}. sum=${sum}${sum >= target ? " ≥ target → co cửa sổ" : ""}.`,
        en: `Add nums[${right}]=${nums[right]}. sum=${sum}${sum >= target ? " ≥ target → shrink" : ""}.`,
      },
    });

    while (sum >= target) {
      const len = right - left + 1;
      if (len < minLen) {
        minLen = len;
        bestL = left;
        bestR = right;
      }
      sum -= nums[left];
      left++;

      steps.push({
        title: { vi: `Co: left=${left}, len=${len}`, en: `Shrink: left=${left}, len=${len}` },
        arr: [...nums],
        highlight: left <= right ? inWindow(left, right) : [],
        mark: [],
        codeLines: [8, 9, 10, 11],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "sum", value: sum },
          { name: "minLen", value: minLen },
          { name: "windowLen", value: len },
        ],
        note: {
          vi: `sum cũ ≥ ${target}. Bỏ nums[${left - 1}]=${nums[left - 1]}. Đoạn dài ${len}${len === minLen ? " → cập nhật minLen" : ""}. sum=${sum}.`,
          en: `sum was ≥ ${target}. Drop nums[${left - 1}]=${nums[left - 1]}. Window was ${len}${len === minLen ? " → update minLen" : ""}. sum=${sum}.`,
        },
      });
    }
  }

  const answer = minLen === Infinity ? 0 : minLen;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestR >= 0 ? inWindow(bestL, bestR) : [],
    final: true,
    codeLines: [12],
    vars: [
      { name: "minLen", value: answer },
      { name: "window", value: bestR >= 0 ? `[${bestL}..${bestR}]` : "none" },
    ],
    note: {
      vi: answer === 0
        ? `Không có đoạn con nào có tổng ≥ ${target}. Trả về 0.`
        : `Đoạn ngắn nhất có tổng ≥ ${target}: [${bestL}..${bestR}] = [${nums.slice(bestL, bestR + 1).join(",")}], dài ${answer}.`,
      en: answer === 0
        ? `No subarray sums to ≥ ${target}. Return 0.`
        : `Shortest subarray with sum ≥ ${target}: [${bestL}..${bestR}] = [${nums.slice(bestL, bestR + 1).join(",")}], length ${answer}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 713: Subarray Product Less Than K.
 * Sliding window: expand right (multiply), shrink left (divide) while product >= k.
 * Count of valid subarrays ending at right = right - left + 1.
 */
/** LeetCode 209: detailed sliding-window visualization and line-by-line trace. */
function buildSteps209(nums, params = {}) {
  const targetRaw = Number(params.target);
  const target = Number.isFinite(targetRaw) ? Math.max(1, Math.trunc(targetRaw)) : 7;
  const steps = [];
  let left = 0;
  let right = -1;
  let total = 0;
  let minLen = Infinity;
  let bestL = null;
  let bestR = null;
  let phase = "init";
  let removedIndex = null;
  let candidateLen = null;
  let improved = false;

  const indices = (lo, hi) => (
    Number.isInteger(lo) && Number.isInteger(hi) && lo <= hi
      ? Array.from({ length: hi - lo + 1 }, (_, offset) => lo + offset)
      : []
  );
  const snapshot = () => ({
    nums: [...nums], target, left, right, total, phase, removedIndex,
    candidateLen, improved, minLen: minLen === Infinity ? null : minLen,
    bestLeft: bestL, bestRight: bestR,
  });
  const addStep = (title, note, codeLine, nextPhase, vars = [], final = false) => {
    phase = nextPhase;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: [...nums],
      highlight: indices(left, right),
      mark: bestL === null ? [] : indices(bestL, bestR),
      vars: [
        { name: "target", value: target },
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "total", value: total },
        { name: "min_len", value: minLen === Infinity ? "∞" : minLen },
        ...vars,
      ],
      minimumSubarrayView: snapshot(),
    });
  };

  addStep(
    { vi: "left = 0", en: "left = 0" },
    { vi: "Cạnh trái bắt đầu ở đầu mảng.", en: "The left edge starts at the beginning of the array." },
    3, "init", [{ name: "left", value: left }],
  );
  addStep(
    { vi: "total = 0", en: "total = 0" },
    { vi: "Cửa sổ ban đầu rỗng nên tổng bằng 0.", en: "The initial window is empty, so its sum is 0." },
    4, "init", [{ name: "total", value: total }],
  );
  addStep(
    { vi: "min_len = ∞", en: "min_len = ∞" },
    { vi: "Chưa tìm thấy cửa sổ nào đạt target.", en: "No window has reached the target yet." },
    5, "init", [{ name: "min_len", value: "∞" }],
  );

  for (right = 0; right < nums.length; right += 1) {
    removedIndex = null;
    candidateLen = null;
    improved = false;
    addStep(
      { vi: `Di chuyển right đến index ${right}`, en: `Move right to index ${right}` },
      { vi: `Chuẩn bị đưa nums[${right}] = ${nums[right]} vào cửa sổ.`, en: `Prepare to add nums[${right}] = ${nums[right]} to the window.` },
      6, "expand", [{ name: "nums[right]", value: nums[right] }],
    );
    const previousTotal = total;
    total += nums[right];
    addStep(
      { vi: `total += ${nums[right]} → ${total}`, en: `total += ${nums[right]} → ${total}` },
      { vi: `${previousTotal} + ${nums[right]} = ${total}. Cửa sổ hiện tại là [${left}..${right}].`, en: `${previousTotal} + ${nums[right]} = ${total}. The current window is [${left}..${right}].` },
      7, "expand", [{ name: "previous total", value: previousTotal }, { name: "nums[right]", value: nums[right] }],
    );

    while (total >= target) {
      candidateLen = right - left + 1;
      improved = candidateLen < minLen;
      addStep(
        { vi: `${total} >= ${target} → True`, en: `${total} >= ${target} → True` },
        { vi: `Cửa sổ đã hợp lệ. Ghi nhận độ dài ${candidateLen}, rồi thử co bên trái.`, en: `The window is valid. Record length ${candidateLen}, then try shrinking from the left.` },
        8, "eligible", [{ name: "window length", value: candidateLen }],
      );
      if (improved) {
        minLen = candidateLen;
        bestL = left;
        bestR = right;
      }
      addStep(
        {
          vi: improved ? `min_len = ${candidateLen} · kỷ lục mới` : `min_len giữ nguyên = ${minLen}`,
          en: improved ? `min_len = ${candidateLen} · new best` : `Keep min_len = ${minLen}`,
        },
        {
          vi: improved
            ? `Đoạn [${left}..${right}] ngắn hơn mọi đáp án trước đó.`
            : `Đoạn [${left}..${right}] dài ${candidateLen}, không ngắn hơn best hiện tại.`,
          en: improved
            ? `Window [${left}..${right}] is shorter than every previous answer.`
            : `Window [${left}..${right}] has length ${candidateLen}, not shorter than the current best.`,
        },
        9, "record", [{ name: "candidate length", value: candidateLen }, { name: "updated", value: improved }],
      );

      removedIndex = left;
      const removedValue = nums[left];
      const beforeRemoval = total;
      total -= removedValue;
      addStep(
        { vi: `total -= nums[${left}] → ${total}`, en: `total -= nums[${left}] → ${total}` },
        { vi: `${beforeRemoval} - ${removedValue} = ${total}. Loại phần tử trái để cửa sổ ngắn hơn.`, en: `${beforeRemoval} - ${removedValue} = ${total}. Remove the leftmost value to shorten the window.` },
        10, "remove", [{ name: "removed", value: removedValue }, { name: "total", value: total }],
      );
      left += 1;
      addStep(
        { vi: `left += 1 → ${left}`, en: `left += 1 → ${left}` },
        { vi: `Cạnh trái mới là index ${left}; kiểm tra lại total >= target.`, en: `The new left edge is index ${left}; check total >= target again.` },
        11, "shrink", [{ name: "left", value: left }],
      );
      removedIndex = null;
    }

    candidateLen = left <= right ? right - left + 1 : 0;
    improved = false;
    addStep(
      { vi: `${total} >= ${target} → False`, en: `${total} >= ${target} → False` },
      {
        vi: right + 1 < nums.length
          ? "Tổng chưa đủ target; cần mở rộng right để thêm số dương tiếp theo."
          : "Tổng chưa đủ target và đã hết mảng; dừng quét.",
        en: right + 1 < nums.length
          ? "The sum is below target; expand right to add the next positive value."
          : "The sum is below target and the array is exhausted; stop scanning.",
      },
      8, "need-more", [{ name: "total", value: total }],
    );
  }

  const answer = minLen === Infinity ? 0 : minLen;
  removedIndex = null;
  candidateLen = null;
  improved = false;
  addStep(
    { vi: `return ${answer}`, en: `return ${answer}` },
    {
      vi: answer === 0
        ? `Không có đoạn con nào có tổng >= ${target}.`
        : `Đoạn ngắn nhất là [${bestL}..${bestR}] = [${nums.slice(bestL, bestR + 1).join(", ")}], dài ${answer}.`,
      en: answer === 0
        ? `No subarray has sum >= ${target}.`
        : `The shortest window is [${bestL}..${bestR}] = [${nums.slice(bestL, bestR + 1).join(", ")}], length ${answer}.`,
    },
    12, "done", [{ name: "answer", value: answer }], true,
  );
  return { original: [...nums], answer, steps };
}

function buildSteps713(nums, params) {
  const k = params.k;
  const n = nums.length;
  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  if (k <= 1) {
    steps.push({
      title: { vi: "k ≤ 1 → 0", en: "k ≤ 1 → 0" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "k", value: k }, { name: "answer", value: 0 }],
      note: { vi: `k ≤ 1: không có tích dương nào < ${k}. Trả về 0.`, en: `k ≤ 1: no positive product < ${k}. Return 0.` },
    });
    return { original: [...nums], answer: 0, steps };
  }

  let left = 0;
  let product = 1;
  let count = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6],
    vars: [{ name: "k", value: k }, { name: "left", value: 0 }, { name: "product", value: 1 }, { name: "count", value: 0 }],
    note: {
      vi: `Đếm đoạn con có tích < ${k}. Cửa sổ trượt: nhân khi mở rộng, chia khi co.`,
      en: `Count subarrays with product < ${k}. Sliding window: multiply to expand, divide to shrink.`,
    },
  });

  for (let right = 0; right < n; right++) {
    product *= nums[right];

    while (product >= k && left <= right) {
      product /= nums[left];
      left++;
    }

    const added = right - left + 1;
    count += added;

    steps.push({
      title: { vi: `right=${right}: +${added} đoạn`, en: `right=${right}: +${added} subarrays` },
      arr: [...nums],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [7, 8, 9, 10, 11],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "product", value: product },
        { name: "added", value: added },
        { name: "count", value: count },
      ],
      note: {
        vi: `Cửa sổ [${left}..${right}], tích = ${product} < ${k}. Có ${added} đoạn con mới kết thúc tại ${right}. Tổng = ${count}.`,
        en: `Window [${left}..${right}], product = ${product} < ${k}. ${added} new subarray(s) ending at ${right}. Total = ${count}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [12],
    vars: [{ name: "count", value: count }],
    note: {
      vi: `Tổng số đoạn con có tích < ${k} = ${count}.`,
      en: `Total subarrays with product < ${k} = ${count}.`,
    },
  });

  return { original: [...nums], answer: count, steps };
}

/**
 * LeetCode 1358: Number of Substrings Containing All Three Characters.
 * Sliding window: expand right until window has all 3 chars, then
 * all substrings starting from left..current_left ending at right..n-1 are valid.
 * Count += n - right for each valid window position after shrinking.
 */
function buildSteps1358(input, params) {
  const approach = (params && params.approach) || 1;
  if (approach === 2) return buildSteps1358Last(input);

  const s = typeof input === "string" ? input : String(input);
  const n = s.length;
  const steps = [];

  const count = { a: 0, b: 0, c: 0 };
  let left = 0;
  let total = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: s.split("").map((ch) => ch.charCodeAt(0) - 96), // a=1,b=2,c=3 for bar heights
    sub: s.split(""),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "s", value: s },
      { name: "count", value: "{a:0, b:0, c:0}" },
      { name: "total", value: 0 },
    ],
    note: {
      vi: `Đếm số substring chứa ít nhất 1 'a', 1 'b', 1 'c'. Dùng cửa sổ trượt: khi cửa sổ hợp lệ → mọi mở rộng sang phải cũng hợp lệ.`,
      en: `Count substrings containing at least one 'a', 'b', and 'c'. Sliding window: once valid, all extensions to the right are also valid.`,
    },
  });

  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  for (let right = 0; right < n; right++) {
    count[s[right]]++;

    // Shrink while all three present
    while (count.a >= 1 && count.b >= 1 && count.c >= 1) {
      const added = n - right;
      total += added;

      steps.push({
        title: { vi: `Hợp lệ: left=${left}, right=${right}`, en: `Valid: left=${left}, right=${right}` },
        arr: s.split("").map((ch) => ch.charCodeAt(0) - 96),
        sub: s.split(""),
        highlight: inWindow(left, right),
        mark: [],
        codeLines: [6, 7, 8, 9, 10],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "count", value: `{a:${count.a}, b:${count.b}, c:${count.c}}` },
          { name: "+substrings", value: `${added} (n - right = ${n} - ${right})` },
          { name: "total", value: total },
        ],
        note: {
          vi: `Cửa sổ [${left}..${right}] chứa cả a,b,c → ${added} substring hợp lệ bắt đầu tại left=${left} (kéo dài đến cuối). total = ${total}. Co left.`,
          en: `Window [${left}..${right}] has all a,b,c → ${added} valid substrings starting at left=${left} (extend to end). total = ${total}. Shrink left.`,
        },
      });

      count[s[left]]--;
      left++;
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: s.split("").map((ch) => ch.charCodeAt(0) - 96),
    sub: s.split(""),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [11],
    vars: [{ name: "total", value: total }],
    note: {
      vi: `Tổng số substring chứa cả 'a', 'b', 'c' = ${total}.`,
      en: `Total substrings containing all three characters = ${total}.`,
    },
  });

  return { original: s, answer: total, steps };
}

/**
 * LeetCode 1358 — Approach 2: Last Index Tracking (tối ưu hơn).
 * Thay vì sliding window, theo dõi vị trí cuối cùng của mỗi ký tự.
 * Khi cả 3 đã xuất hiện, số substring hợp lệ kết thúc tại i = min(last) + 1.
 */
function buildSteps1358Last(input) {
  const s = typeof input === "string" ? input : String(input);
  const n = s.length;
  const steps = [];
  const last = { a: -1, b: -1, c: -1 };
  let res = 0;

  steps.push({
    title: { vi: "Khởi tạo (Last Index)", en: "Initialize (Last Index)" },
    arr: s.split("").map((ch) => ch.charCodeAt(0) - 96),
    sub: s.split(""),
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "last", value: "{a:-1, b:-1, c:-1}" },
      { name: "res", value: 0 },
    ],
    note: {
      vi: `Ý tưởng: last[ch] = vị trí cuối cùng thấy ch.\nKhi cả 3 đã xuất hiện: số substring hợp lệ KẾT THÚC tại i = min(last['a'], last['b'], last['c']) + 1.\n(Vì bất kỳ vị trí bắt đầu nào từ 0..min(last) đều tạo substring chứa cả 3.)`,
      en: `Idea: last[ch] = last seen position of ch.\nOnce all 3 have appeared: valid substrings ENDING at i = min(last['a'], last['b'], last['c']) + 1.\n(Any start from 0..min(last) yields a substring with all 3.)`,
    },
  });

  for (let i = 0; i < n; i++) {
    const ch = s[i];
    last[ch] = i;

    if (last.a !== -1 && last.b !== -1 && last.c !== -1) {
      const minLast = Math.min(last.a, last.b, last.c);
      const added = minLast + 1;
      res += added;

      steps.push({
        title: { vi: `i=${i} '${ch}': +${added}`, en: `i=${i} '${ch}': +${added}` },
        arr: s.split("").map((c) => c.charCodeAt(0) - 96),
        sub: s.split(""),
        highlight: [last.a, last.b, last.c],
        mark: [i],
        codeLines: [5, 6, 7, 8],
        vars: [
          { name: "i", value: i },
          { name: "last", value: `{a:${last.a}, b:${last.b}, c:${last.c}}` },
          { name: "min(last)", value: minLast },
          { name: "+substrings", value: `min(last)+1 = ${added}` },
          { name: "res", value: res },
        ],
        note: {
          vi: `last = {a:${last.a}, b:${last.b}, c:${last.c}}. min = ${minLast}.\nSố substring mới = min+1 = ${added} (start từ 0..${minLast} đều hợp lệ).\nres = ${res}.`,
          en: `last = {a:${last.a}, b:${last.b}, c:${last.c}}. min = ${minLast}.\nNew substrings = min+1 = ${added} (start 0..${minLast} are all valid).\nres = ${res}.`,
        },
      });
    } else {
      steps.push({
        title: { vi: `i=${i} '${ch}': chưa đủ 3`, en: `i=${i} '${ch}': not all 3 yet` },
        arr: s.split("").map((c) => c.charCodeAt(0) - 96),
        sub: s.split(""),
        highlight: [i],
        mark: [],
        codeLines: [5, 6],
        vars: [
          { name: "i", value: i },
          { name: "last", value: `{a:${last.a}, b:${last.b}, c:${last.c}}` },
          { name: "res", value: res },
        ],
        note: {
          vi: `Chưa đủ cả 3 ký tự → bỏ qua.`,
          en: `Not all 3 chars seen yet → skip.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: s.split("").map((c) => c.charCodeAt(0) - 96),
    sub: s.split(""),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [9],
    vars: [{ name: "res", value: res }],
    note: {
      vi: `Tổng = ${res}.`,
      en: `Total = ${res}.`,
    },
  });

  return { original: s, answer: res, steps };
}

/**
 * LeetCode 424: Longest Repeating Character Replacement — sliding window.
 * Window is valid while (window length - max single-char freq) <= k, i.e. we
 * can replace the other chars. Shrink from left when invalid.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def characterReplacement(self, s, k):
 *  3          count = defaultdict(int); left = 0; max_freq = 0; result = 0
 *  4          for right, ch in enumerate(s):
 *  5              count[ch] += 1
 *  6              max_freq = max(max_freq, count[ch])
 *  7              while (right - left + 1) - max_freq > k:
 *  8                  count[s[left]] -= 1; left += 1
 *  9              result = max(result, right - left + 1)
 * 10          return result
 */
function buildSteps424(input, params) {
  const s = typeof input === "string" ? input : String(input ?? "");
  const k = params && params.k !== undefined ? Number(params.k) : 2;
  const chars = s.split("");
  const steps = [];
  const count = {};
  let left = 0, maxFreq = 0, result = 0;
  let bestL = 0, bestR = -1;

  const countStr = () => `{${Object.entries(count).filter(([, v]) => v > 0).map(([c, v]) => `${c}:${v}`).join(", ")}}`;
  const inWin = (lo, hi) => (lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, x) => lo + x) : []);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: chars, sub: chars.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    codeLines: [3],
    vars: [{ name: "k", value: k }, { name: "left", value: 0 }, { name: "max_freq", value: 0 }, { name: "result", value: 0 }],
    note: {
      vi:
        `Cửa sổ hợp lệ khi (độ dài) - (tần suất ký tự nhiều nhất) ≤ k, tức số ký tự cần THAY ≤ k.\n` +
        `Mở rộng right; khi cửa sổ không hợp lệ thì co left.`,
      en:
        `A window is valid when (length) - (max single-char freq) ≤ k, i.e. chars to REPLACE ≤ k.\n` +
        `Expand right; shrink left when the window becomes invalid.`,
    },
  });

  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    count[ch] = (count[ch] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[ch]);
    steps.push({
      title: { vi: `right=${right} '${ch}': count[${ch}]=${count[ch]}, max_freq=${maxFreq}`, en: `right=${right} '${ch}': count[${ch}]=${count[ch]}, max_freq=${maxFreq}` },
      arr: chars, sub: chars.map((_, x) => `[${x}]`),
      highlight: inWin(left, right), mark: [right],
      codeLines: [4, 5, 6],
      vars: [
        { name: "right", value: right }, { name: "char", value: `'${ch}'` },
        { name: "count", value: countStr() }, { name: "max_freq", value: maxFreq },
      ],
      note: { vi: `Thêm '${ch}'. max_freq = ký tự xuất hiện nhiều nhất trong cửa sổ = ${maxFreq}.`, en: `Add '${ch}'. max_freq = most frequent char count in window = ${maxFreq}.` },
    });

    while ((right - left + 1) - maxFreq > k) {
      const lch = chars[left];
      count[lch] -= 1;
      left++;
      steps.push({
        title: { vi: `Cửa sổ không hợp lệ → co: bỏ '${lch}', left=${left}`, en: `Window invalid → shrink: drop '${lch}', left=${left}` },
        arr: chars, sub: chars.map((_, x) => `[${x}]`),
        highlight: inWin(left, right), mark: [],
        codeLines: [7, 8],
        vars: [
          { name: "window len", value: right - left + 2 },
          { name: "max_freq", value: maxFreq },
          { name: "need replace", value: (right - left + 2) - maxFreq },
          { name: "left", value: left },
        ],
        note: { vi: `(độ dài - max_freq) > k=${k} → phải thay quá ${k} ký tự → bỏ '${lch}' bên trái, left tiến.`, en: `(length - max_freq) > k=${k} → would replace more than ${k} chars → drop '${lch}' on the left, advance left.` },
      });
    }

    const len = right - left + 1;
    if (len > result) { result = len; bestL = left; bestR = right; }
    steps.push({
      title: { vi: `result = max(result, ${len}) = ${result}`, en: `result = max(result, ${len}) = ${result}` },
      arr: chars, sub: chars.map((_, x) => `[${x}]`),
      highlight: inWin(left, right), mark: inWin(bestL, bestR),
      codeLines: [9],
      vars: [{ name: "window len", value: len }, { name: "result", value: result }],
      note: { vi: `Cửa sổ [${left}..${right}] hợp lệ, dài ${len}. result = ${result}.`, en: `Window [${left}..${right}] valid, length ${len}. result = ${result}.` },
    });
  }

  steps.push({
    title: { vi: `return ${result}`, en: `return ${result}` },
    arr: chars, sub: chars.map((_, i) => `[${i}]`),
    highlight: [], mark: inWin(bestL, bestR), final: true,
    codeLines: [10],
    vars: [{ name: "answer", value: result }],
    note: { vi: `Chuỗi con dài nhất có thể biến thành 1 ký tự lặp bằng ≤ k lần thay = ${result}.`, en: `Longest substring turnable into one repeating char with ≤ k replacements = ${result}.` },
  });

  return { original: s, k, answer: result, steps };
}

/**
 * LeetCode 480: Sliding Window Median — keep the window sorted, read the middle.
 * (Visualization uses a sorted-window model; the O(log n) two-heap version has
 * identical outputs.)
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def medianSlidingWindow(self, nums, k):
 *  3          window = SortedList()
 *  4          result = []
 *  5          for i, num in enumerate(nums):
 *  6              window.add(num)
 *  7              if i >= k:
 *  8                  window.remove(nums[i-k])
 *  9              if i >= k - 1:
 * 10                  if k % 2 == 1: result.append(window[k//2])
 * 11                  else: result.append((window[k//2-1]+window[k//2])/2)
 * 12          return result
 */
function buildSteps480(inputNums, params) {
  const nums = Array.isArray(inputNums)
    ? [...inputNums]
    : String(inputNums).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const k = params && params.k !== undefined ? Number(params.k) : 3;
  const n = nums.length;
  const steps = [];

  if (n === 0 || k <= 0 || k > n) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [2],
      vars: [], note: { vi: "Cần 0 < k ≤ len(nums).", en: "Need 0 < k ≤ len(nums)." },
    });
    return { original: nums, k, answer: [], steps };
  }

  const win = [];  // sorted window
  const result = [];
  const median = () => (k % 2 === 1 ? win[(k - 1) / 2] : (win[k / 2 - 1] + win[k / 2]) / 2);
  const winStr = () => `[${win.join(", ")}]`;
  const windowCells = (i) => {
    const lo = Math.max(0, i - k + 1);
    return Array.from({ length: i - lo + 1 }, (_, x) => lo + x);
  };

  steps.push({
    title: { vi: "window = SortedList(), result = []", en: "window = SortedList(), result = []" },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    codeLines: [3, 4],
    vars: [{ name: "k", value: k }, { name: "window", value: "[]" }, { name: "result", value: "[]" }],
    note: {
      vi:
        `Giữ cửa sổ hiện tại LUÔN ĐƯỢC SẮP XẾP. Trung vị = phần tử giữa (k lẻ) hoặc trung bình 2 phần tử giữa (k chẵn).\n` +
        `Mỗi bước: thêm nums[i], nếu vượt kích thước thì bỏ nums[i-k], rồi đọc trung vị.`,
      en:
        `Keep the current window ALWAYS SORTED. Median = middle element (odd k) or average of the two middle (even k).\n` +
        `Each step: add nums[i], if over size remove nums[i-k], then read the median.`,
    },
  });

  for (let i = 0; i < n; i++) {
    // add nums[i] in sorted position
    let pos = 0;
    while (pos < win.length && win[pos] < nums[i]) pos++;
    win.splice(pos, 0, nums[i]);

    steps.push({
      title: { vi: `window.add(${nums[i]}) → ${winStr()}`, en: `window.add(${nums[i]}) → ${winStr()}` },
      arr: [...nums],
      sub: nums.map((_, x) => `[${x}]`),
      highlight: windowCells(i),
      mark: [i],
      codeLines: [5, 6],
      vars: [
        { name: "i", value: i },
        { name: "num", value: nums[i] },
        { name: "window (sorted)", value: winStr() },
      ],
      note: {
        vi: `Chèn ${nums[i]} vào vị trí đúng để cửa sổ vẫn được sắp xếp: ${winStr()}.`,
        en: `Insert ${nums[i]} at the right position to keep the window sorted: ${winStr()}.`,
      },
    });

    if (i >= k) {
      const out = nums[i - k];
      win.splice(win.indexOf(out), 1);
      steps.push({
        title: { vi: `window.remove(${out}) (ra khỏi cửa sổ) → ${winStr()}`, en: `window.remove(${out}) (left window) → ${winStr()}` },
        arr: [...nums],
        sub: nums.map((_, x) => `[${x}]`),
        highlight: windowCells(i),
        mark: [i - k],
        codeLines: [7, 8],
        vars: [
          { name: "leaving", value: `nums[${i - k}] = ${out}` },
          { name: "window (sorted)", value: winStr() },
        ],
        note: {
          vi: `Phần tử nums[${i - k}]=${out} rời cửa sổ → xóa khỏi window: ${winStr()}.`,
          en: `Element nums[${i - k}]=${out} leaves the window → remove from window: ${winStr()}.`,
        },
      });
    }

    if (i >= k - 1) {
      const med = median();
      result.push(med);
      const midCells = k % 2 === 1
        ? [(k - 1) / 2]
        : [k / 2 - 1, k / 2];
      steps.push({
        title: { vi: `Trung vị = ${med} → result = [${result.join(", ")}]`, en: `Median = ${med} → result = [${result.join(", ")}]` },
        arr: [...nums],
        sub: nums.map((_, x) => `[${x}]`),
        highlight: windowCells(i),
        mark: [],
        codeLines: k % 2 === 1 ? [9, 10] : [9, 11],
        vars: [
          { name: "window (sorted)", value: winStr() },
          { name: "middle idx", value: midCells.join(", ") },
          { name: "median", value: med },
          { name: "result", value: `[${result.join(", ")}]` },
        ],
        note: {
          vi: k % 2 === 1
            ? `k=${k} lẻ → trung vị = window[${(k - 1) / 2}] = ${med}.`
            : `k=${k} chẵn → trung vị = (window[${k / 2 - 1}] + window[${k / 2}]) / 2 = ${med}.`,
          en: k % 2 === 1
            ? `k=${k} odd → median = window[${(k - 1) / 2}] = ${med}.`
            : `k=${k} even → median = (window[${k / 2 - 1}] + window[${k / 2}]) / 2 = ${med}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: `return [${result.join(", ")}]`, en: `return [${result.join(", ")}]` },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    final: true,
    codeLines: [12],
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: {
      vi: `Trung vị của mỗi cửa sổ trượt kích thước ${k}: [${result.join(", ")}].`,
      en: `Median of each sliding window of size ${k}: [${result.join(", ")}].`,
    },
  });

  return { original: nums, k, answer: result, steps };
}

/**
 * LeetCode 239: Sliding Window Maximum — monotonic decreasing deque of indices.
 * dq front always holds the index of the current window maximum.
 *
 * Code lines (1-indexed):
 *  1  from collections import deque
 *  2  class Solution:
 *  3      def maxSlidingWindow(self, nums, k):
 *  4          dq = deque()
 *  5          result = []
 *  6          for i, num in enumerate(nums):
 *  7              while dq and nums[dq[-1]] < num:
 *  8                  dq.pop()
 *  9              dq.append(i)
 * 10              if dq[0] <= i - k:
 * 11                  dq.popleft()
 * 12              if i >= k - 1:
 * 13                  result.append(nums[dq[0]])
 * 14          return result
 */
function buildSteps239(inputNums, params) {
  const nums = Array.isArray(inputNums)
    ? [...inputNums]
    : String(inputNums).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const k = params && params.k !== undefined ? Number(params.k) : 3;
  const n = nums.length;
  const steps = [];
  const dq = [];       // indices, values decreasing
  const result = [];

  const dqStr = () => `[${dq.map((idx) => `${idx}:${nums[idx]}`).join(", ")}]`;
  const windowCells = (i) => {
    const lo = Math.max(0, i - k + 1);
    return Array.from({ length: i - lo + 1 }, (_, x) => lo + x);
  };

  if (n === 0 || k <= 0) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [3],
      vars: [], note: { vi: "Cần mảng không rỗng và k > 0.", en: "Need a non-empty array and k > 0." },
    });
    return { original: nums, k, answer: [], steps };
  }

  steps.push({
    title: { vi: "dq = deque(), result = []", en: "dq = deque(), result = []" },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    codeLines: [4, 5],
    vars: [
      { name: "k", value: k },
      { name: "dq (indices)", value: "[]" },
      { name: "result", value: "[]" },
    ],
    note: {
      vi:
        `dq lưu INDEX của các phần tử theo giá trị GIẢM DẦN. Front dq[0] luôn là index của MAX trong cửa sổ.\n` +
        `Mỗi lần cửa sổ đủ k=${k} phần tử thì ghi nums[dq[0]] vào result.`,
      en:
        `dq holds element INDICES in DECREASING value order. Front dq[0] is always the index of the window MAX.\n` +
        `Whenever the window reaches k=${k} elements, append nums[dq[0]] to result.`,
    },
  });

  for (let i = 0; i < n; i++) {
    const num = nums[i];
    steps.push({
      title: { vi: `for i=${i}, num=${num}`, en: `for i=${i}, num=${num}` },
      arr: [...nums],
      sub: nums.map((_, x) => `[${x}]`),
      highlight: [i],
      mark: dq.length ? [...dq] : [],
      codeLines: [6],
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
        { name: "dq", value: dqStr() },
      ],
      note: {
        vi: `Xét phần tử nums[${i}]=${num}. Các index trong dq được tô đậm.`,
        en: `Inspect nums[${i}]=${num}. Indices currently in dq are marked.`,
      },
    });

    // Pop smaller values from the back
    while (dq.length && nums[dq[dq.length - 1]] < num) {
      const popped = dq.pop();
      steps.push({
        title: { vi: `nums[${popped}]=${nums[popped]} < ${num} → pop khỏi đuôi dq`, en: `nums[${popped}]=${nums[popped]} < ${num} → pop from dq back` },
        arr: [...nums],
        sub: nums.map((_, x) => `[${x}]`),
        highlight: [i],
        mark: dq.length ? [...dq] : [],
        codeLines: [7, 8],
        vars: [
          { name: "i", value: i },
          { name: "num", value: num },
          { name: "popped index", value: popped },
          { name: "dq", value: dqStr() },
        ],
        note: {
          vi: `nums[${popped}]=${nums[popped]} < num=${num} nên index ${popped} không bao giờ là max nữa (bị ${num} "che"). Pop khỏi đuôi dq.`,
          en: `nums[${popped}]=${nums[popped]} < num=${num}, so index ${popped} can never be the max again (dominated by ${num}). Pop it from the back.`,
        },
      });
    }

    dq.push(i);
    steps.push({
      title: { vi: `dq.append(${i})`, en: `dq.append(${i})` },
      arr: [...nums],
      sub: nums.map((_, x) => `[${x}]`),
      highlight: [i],
      mark: [...dq],
      codeLines: [9],
      vars: [
        { name: "i", value: i },
        { name: "dq", value: dqStr() },
      ],
      note: {
        vi: `Thêm index ${i} vào đuôi dq. Giá trị trong dq vẫn giảm dần: ${dqStr()}.`,
        en: `Append index ${i} to dq's back. Values in dq stay decreasing: ${dqStr()}.`,
      },
    });

    // Remove front if outside window
    if (dq[0] <= i - k) {
      const removed = dq.shift();
      steps.push({
        title: { vi: `dq[0]=${removed} ≤ i-k=${i - k} → popleft (ra khỏi cửa sổ)`, en: `dq[0]=${removed} ≤ i-k=${i - k} → popleft (out of window)` },
        arr: [...nums],
        sub: nums.map((_, x) => `[${x}]`),
        highlight: windowCells(i),
        mark: [...dq],
        codeLines: [10, 11],
        vars: [
          { name: "i", value: i },
          { name: "i - k", value: i - k },
          { name: "removed front", value: removed },
          { name: "dq", value: dqStr() },
        ],
        note: {
          vi: `Front dq[0]=${removed} đã nằm ngoài cửa sổ [${i - k + 1}..${i}] → popleft.`,
          en: `Front dq[0]=${removed} is now outside window [${i - k + 1}..${i}] → popleft.`,
        },
      });
    }

    // Record window max
    if (i >= k - 1) {
      result.push(nums[dq[0]]);
      steps.push({
        title: { vi: `Cửa sổ [${i - k + 1}..${i}] đủ k → result.append(${nums[dq[0]]})`, en: `Window [${i - k + 1}..${i}] full → result.append(${nums[dq[0]]})` },
        arr: [...nums],
        sub: nums.map((_, x) => `[${x}]`),
        highlight: windowCells(i),
        mark: [dq[0]],
        codeLines: [12, 13],
        vars: [
          { name: "i", value: i },
          { name: "window", value: `[${i - k + 1}..${i}]` },
          { name: "max (nums[dq[0]])", value: nums[dq[0]] },
          { name: "result", value: `[${result.join(", ")}]` },
        ],
        note: {
          vi: `Cửa sổ đủ ${k} phần tử. Max = nums[dq[0]] = nums[${dq[0]}] = ${nums[dq[0]]}. result = [${result.join(", ")}].`,
          en: `Window has ${k} elements. Max = nums[dq[0]] = nums[${dq[0]}] = ${nums[dq[0]]}. result = [${result.join(", ")}].`,
        },
      });
    }
  }

  steps.push({
    title: { vi: `return result = [${result.join(", ")}]`, en: `return result = [${result.join(", ")}]` },
    arr: [...nums],
    sub: nums.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [14],
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: {
      vi: `Max của mỗi cửa sổ trượt kích thước ${k}: [${result.join(", ")}].`,
      en: `Maximum of each sliding window of size ${k}: [${result.join(", ")}].`,
    },
  });

  return { original: nums, k, answer: result, steps };
}

/**
 * LeetCode 76: Minimum Window Substring — sliding window with a need-counter.
 *
 * Code lines (1-indexed):
 *  1  from collections import Counter
 *  2  class Solution:
 *  3      def minWindow(self, s, t):
 *  4          if not s or not t: return ""
 *  5          need = Counter(t)
 *  6          missing = len(t)
 *  7          left = 0
 *  8          start, end = 0, 0
 *  9          for right, char in enumerate(s):
 * 10              if need[char] > 0: missing -= 1
 * 11              need[char] -= 1
 * 12              while missing == 0:
 * 13                  if end == 0 or right - left + 1 < end - start:
 * 14                      start, end = left, right + 1
 * 15                  need[s[left]] += 1
 * 16                  if need[s[left]] > 0: missing += 1
 * 17                  left += 1
 * 18          return s[start:end]
 */
function buildSteps76(input, params) {
  const s = typeof input === "string" ? input : String(input ?? "");
  const t = params && params.t !== undefined ? String(params.t) : "ABC";
  const chars = s.split("");
  const steps = [];

  const need = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;
  const needStr = () => `{${Object.entries(need).map(([c, v]) => `${c}:${v}`).join(", ")}}`;

  if (!s || !t) {
    steps.push({
      title: { vi: "s hoặc t rỗng → \"\"", en: "s or t empty → \"\"" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [4],
      vars: [{ name: "answer", value: '""' }],
      note: { vi: "Không có window hợp lệ.", en: "No valid window." },
    });
    return { original: s, answer: "", steps };
  }

  let missing = t.length;
  let left = 0;
  let start = 0, end = 0;

  const inWin = (lo, hi) => (lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, x) => lo + x) : []);

  steps.push({
    title: { vi: "need = Counter(t), missing = len(t)", en: "need = Counter(t), missing = len(t)" },
    arr: chars,
    sub: chars.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    codeLines: [5, 6, 7, 8],
    vars: [
      { name: "t", value: `"${t}"` },
      { name: "need", value: needStr() },
      { name: "missing", value: missing },
      { name: "left", value: left },
    ],
    note: {
      vi:
        `need đếm số ký tự cần: ${needStr()}. missing = ${missing} = tổng ký tự còn thiếu.\n` +
        `Mở rộng right; khi missing==0 thì window đã chứa đủ t → co left để rút gọn.`,
      en:
        `need counts required chars: ${needStr()}. missing = ${missing} = total chars still needed.\n` +
        `Expand right; when missing==0 the window covers t → shrink left to minimize.`,
    },
  });

  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    const wasNeeded = (need[ch] || 0) > 0;
    if (wasNeeded) missing -= 1;
    need[ch] = (need[ch] || 0) - 1;

    steps.push({
      title: { vi: `right=${right}, char='${ch}': need['${ch}']→${need[ch]}, missing=${missing}`, en: `right=${right}, char='${ch}': need['${ch}']→${need[ch]}, missing=${missing}` },
      arr: chars,
      sub: chars.map((_, i) => `[${i}]`),
      highlight: inWin(left, right),
      mark: [right],
      codeLines: [9, 10, 11],
      vars: [
        { name: "right", value: right },
        { name: "char", value: `'${ch}'` },
        { name: "need", value: needStr() },
        { name: "missing", value: missing },
      ],
      note: {
        vi: `Thêm '${ch}' vào window. ${wasNeeded ? `'${ch}' là ký tự cần → missing giảm còn ${missing}.` : `'${ch}' không cần thiết (need đã ≤ 0) → missing giữ nguyen.`}`,
        en: `Add '${ch}' to the window. ${wasNeeded ? `'${ch}' was needed → missing drops to ${missing}.` : `'${ch}' not needed (need ≤ 0) → missing unchanged.`}`,
      },
    });

    while (missing === 0) {
      const curLen = right - left + 1;
      const better = end === 0 || curLen < end - start;
      if (better) {
        start = left;
        end = right + 1;
      }
      steps.push({
        title: { vi: `missing==0: window [${left}..${right}] hợp lệ${better ? " → cập nhật best" : ""}`, en: `missing==0: window [${left}..${right}] valid${better ? " → update best" : ""}` },
        arr: chars,
        sub: chars.map((_, i) => `[${i}]`),
        highlight: inWin(left, right),
        mark: inWin(start, end - 1),
        codeLines: [12, 13, 14],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "window len", value: curLen },
          { name: "best window", value: end > 0 ? `"${s.slice(start, end)}" (len ${end - start})` : "none" },
        ],
        note: {
          vi: better
            ? `Window "${s.slice(left, right + 1)}" (len ${curLen}) ngắn hơn best cũ → lưu start=${start}, end=${end}.`
            : `Window "${s.slice(left, right + 1)}" (len ${curLen}) không ngắn hơn best hiện tại.`,
          en: better
            ? `Window "${s.slice(left, right + 1)}" (len ${curLen}) beats the old best → store start=${start}, end=${end}.`
            : `Window "${s.slice(left, right + 1)}" (len ${curLen}) is not shorter than the current best.`,
        },
      });

      const lch = chars[left];
      need[lch] = (need[lch] || 0) + 1;
      const nowMissing = need[lch] > 0;
      if (nowMissing) missing += 1;
      left += 1;
      steps.push({
        title: { vi: `Co left: bỏ '${lch}', left→${left}${nowMissing ? `, missing=${missing}` : ""}`, en: `Shrink left: drop '${lch}', left→${left}${nowMissing ? `, missing=${missing}` : ""}` },
        arr: chars,
        sub: chars.map((_, i) => `[${i}]`),
        highlight: inWin(left, right),
        mark: inWin(start, end - 1),
        codeLines: [15, 16, 17],
        vars: [
          { name: "removed", value: `'${lch}'` },
          { name: "need", value: needStr() },
          { name: "missing", value: missing },
          { name: "left", value: left },
        ],
        note: {
          vi: `Trả '${lch}' về need. ${nowMissing ? `Giờ need['${lch}']=${need[lch]} > 0 → window thiếu '${lch}', missing=${missing}, thoát while.` : `need['${lch}']=${need[lch]} ≤ 0 → window vẫn đủ, tiếp tục co.`}`,
          en: `Return '${lch}' to need. ${nowMissing ? `Now need['${lch}']=${need[lch]} > 0 → window misses '${lch}', missing=${missing}, exit while.` : `need['${lch}']=${need[lch]} ≤ 0 → window still valid, keep shrinking.`}`,
        },
      });
    }
  }

  const answer = s.slice(start, end);
  steps.push({
    title: { vi: `return s[${start}:${end}] = "${answer}"`, en: `return s[${start}:${end}] = "${answer}"` },
    arr: chars,
    sub: chars.map((_, i) => `[${i}]`),
    highlight: [],
    mark: inWin(start, end - 1),
    final: true,
    codeLines: [18],
    vars: [{ name: "answer", value: `"${answer}"` }],
    note: {
      vi: answer ? `Substring nhỏ nhất chứa mọi ký tự của "${t}" là "${answer}".` : `Không tồn tại window hợp lệ → "".`,
      en: answer ? `The smallest substring containing all of "${t}" is "${answer}".` : `No valid window exists → "".`,
    },
  });

  return { original: s, answer, steps };
}

/**
 * LeetCode 2444: Count Subarrays With Fixed Bounds.
 * Single pass O(n): track three moving indices:
 *   bad     — last index where nums[i] is outside [minK, maxK]
 *   min_pos — last index where nums[i] == minK
 *   max_pos — last index where nums[i] == maxK
 *
 * For each i, the number of valid subarrays ending at i is:
 *   max(0, min(min_pos, max_pos) - bad)
 * because the left boundary of any valid subarray must be:
 *   > bad (cannot include an out-of-bound value)
 *   ≤ min(min_pos, max_pos) (must include the latest minK AND maxK)
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def countSubarrays(self, nums, minK, maxK):
 *  3          res = 0
 *  4          bad = -1
 *  5          min_pos = -1
 *  6          max_pos = -1
 *  7          for i, num in enumerate(nums):
 *  8              if num < minK or num > maxK:
 *  9                  bad = i
 * 10              if num == minK:
 * 11                  min_pos = i
 * 12              if num == maxK:
 * 13                  max_pos = i
 * 14              count = max(0, min(min_pos, max_pos) - bad)
 * 15              res += count
 * 16          return res
 */
function buildSteps2444(inputNums, params) {
  const nums = Array.isArray(inputNums)
    ? [...inputNums]
    : String(inputNums).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const minK = params && params.minK !== undefined ? Number(params.minK) : 1;
  const maxK = params && params.maxK !== undefined ? Number(params.maxK) : 5;
  const n = nums.length;
  const steps = [];

  if (n === 0) {
    steps.push({
      title: { vi: "Mảng rỗng", en: "Empty array" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [2],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Mảng rỗng → 0.", en: "Empty array → 0." },
    });
    return { original: nums, minK, maxK, answer: 0, steps };
  }

  // Helper: sub-row labels
  const makeSub = (bad, minPos, maxPos) =>
    nums.map((_, i) => {
      if (i === bad && i === minPos && i === maxPos) return "bad+min+max";
      if (i === bad && i === minPos) return "bad+min";
      if (i === bad && i === maxPos) return "bad+max";
      if (i === minPos && i === maxPos) return "min+max";
      if (i === bad) return "bad";
      if (i === minPos) return "min_pos";
      if (i === maxPos) return "max_pos";
      return "";
    });

  // ── Init steps ────────────────────────────────────────────────────────────
  steps.push({
    title: { vi: "res = 0, bad = -1, min_pos = -1, max_pos = -1", en: "res = 0, bad = -1, min_pos = -1, max_pos = -1" },
    arr: [...nums],
    sub: nums.map(() => ""),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5, 6],
    vars: [
      { name: "minK", value: minK },
      { name: "maxK", value: maxK },
      { name: "res", value: 0 },
      { name: "bad", value: -1 },
      { name: "min_pos", value: -1 },
      { name: "max_pos", value: -1 },
    ],
    note: {
      vi:
        `Ý tưởng: với mỗi i, đếm số subarray kết thúc tại i có min=minK=${minK} và max=maxK=${maxK}.\n` +
        `• bad: chỉ số ngoài [${minK},${maxK}] gần nhất — mọi subarray hợp lệ phải bắt đầu SAU bad.\n` +
        `• min_pos: chỉ số xuất hiện minK=${minK} gần nhất.\n` +
        `• max_pos: chỉ số xuất hiện maxK=${maxK} gần nhất.\n` +
        `count = max(0, min(min_pos, max_pos) - bad) = số vị trí left hợp lệ.`,
      en:
        `Idea: for each i, count subarrays ending at i with min=minK=${minK} and max=maxK=${maxK}.\n` +
        `• bad: last index outside [${minK},${maxK}] — every valid subarray must start AFTER bad.\n` +
        `• min_pos: last index where minK=${minK} appeared.\n` +
        `• max_pos: last index where maxK=${maxK} appeared.\n` +
        `count = max(0, min(min_pos, max_pos) - bad) = number of valid left boundaries.`,
    },
  });

  // ── Main loop ─────────────────────────────────────────────────────────────
  let res = 0;
  let bad = -1;
  let minPos = -1;
  let maxPos = -1;

  for (let i = 0; i < n; i++) {
    const num = nums[i];

    // ── for i, num ─────────────────────────────────────────────────────────
    steps.push({
      title: { vi: `for i=${i}, num=${num}`, en: `for i=${i}, num=${num}` },
      arr: [...nums],
      sub: makeSub(bad, minPos, maxPos),
      highlight: [i],
      mark: [],
      codeLines: [7],
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
        { name: "res", value: res },
        { name: "bad", value: bad },
        { name: "min_pos", value: minPos },
        { name: "max_pos", value: maxPos },
      ],
      note: {
        vi: `Xét nums[${i}]=${num}. minK=${minK}, maxK=${maxK}.`,
        en: `Inspect nums[${i}]=${num}. minK=${minK}, maxK=${maxK}.`,
      },
    });

    // ── bad check ──────────────────────────────────────────────────────────
    const isOutOfBound = num < minK || num > maxK;
    if (isOutOfBound) {
      bad = i;
      steps.push({
        title: { vi: `num=${num} nằm ngoài [${minK},${maxK}] → bad = ${i}`, en: `num=${num} is outside [${minK},${maxK}] → bad = ${i}` },
        arr: [...nums],
        sub: makeSub(bad, minPos, maxPos),
        highlight: [i],
        mark: [],
        codeLines: [8, 9],
        vars: [
          { name: "i", value: i },
          { name: "num", value: num },
          { name: "condition", value: `${num} < ${minK} || ${num} > ${maxK}` },
          { name: "bad", value: bad },
          { name: "min_pos", value: minPos },
          { name: "max_pos", value: maxPos },
        ],
        note: {
          vi: `nums[${i}]=${num} nằm ngoài [${minK}, ${maxK}] → cập nhật bad = ${i}.\nMọi subarray hợp lệ kết thúc ở đây (hoặc xa hơn) phải bắt đầu sau index ${i}.`,
          en: `nums[${i}]=${num} is outside [${minK}, ${maxK}] → update bad = ${i}.\nEvery valid subarray ending here (or later) must start after index ${i}.`,
        },
      });
    } else {
      steps.push({
        title: { vi: `num=${num} trong [${minK},${maxK}] → bad không đổi (${bad})`, en: `num=${num} is within [${minK},${maxK}] → bad unchanged (${bad})` },
        arr: [...nums],
        sub: makeSub(bad, minPos, maxPos),
        highlight: [i],
        mark: [],
        codeLines: [8],
        vars: [
          { name: "i", value: i },
          { name: "num", value: num },
          { name: "condition", value: false },
          { name: "bad", value: bad },
        ],
        note: {
          vi: `nums[${i}]=${num} nằm trong [${minK}, ${maxK}] → bad giữ nguyên = ${bad}.`,
          en: `nums[${i}]=${num} is within [${minK}, ${maxK}] → bad stays at ${bad}.`,
        },
      });
    }

    // ── min_pos update ─────────────────────────────────────────────────────
    if (num === minK) {
      minPos = i;
      steps.push({
        title: { vi: `num == minK (${minK}) → min_pos = ${i}`, en: `num == minK (${minK}) → min_pos = ${i}` },
        arr: [...nums],
        sub: makeSub(bad, minPos, maxPos),
        highlight: [i],
        mark: [],
        codeLines: [10, 11],
        vars: [
          { name: "i", value: i },
          { name: "num", value: num },
          { name: "min_pos", value: minPos },
          { name: "max_pos", value: maxPos },
          { name: "bad", value: bad },
        ],
        note: {
          vi: `nums[${i}]=${num} == minK=${minK} → cập nhật min_pos = ${i}.`,
          en: `nums[${i}]=${num} == minK=${minK} → update min_pos = ${i}.`,
        },
      });
    }

    // ── max_pos update ─────────────────────────────────────────────────────
    if (num === maxK) {
      maxPos = i;
      steps.push({
        title: { vi: `num == maxK (${maxK}) → max_pos = ${i}`, en: `num == maxK (${maxK}) → max_pos = ${i}` },
        arr: [...nums],
        sub: makeSub(bad, minPos, maxPos),
        highlight: [i],
        mark: [],
        codeLines: [12, 13],
        vars: [
          { name: "i", value: i },
          { name: "num", value: num },
          { name: "min_pos", value: minPos },
          { name: "max_pos", value: maxPos },
          { name: "bad", value: bad },
        ],
        note: {
          vi: `nums[${i}]=${num} == maxK=${maxK} → cập nhật max_pos = ${i}.`,
          en: `nums[${i}]=${num} == maxK=${maxK} → update max_pos = ${i}.`,
        },
      });
    }

    // ── count = max(0, min(min_pos, max_pos) - bad) ────────────────────────
    const smaller = Math.min(minPos, maxPos);
    const count = Math.max(0, smaller - bad);
    const validLeft = smaller > bad ? Array.from({ length: smaller - bad }, (_, x) => bad + 1 + x) : [];

    steps.push({
      title: { vi: `count = max(0, min(${minPos}, ${maxPos}) - ${bad}) = max(0, ${smaller} - ${bad}) = ${count}`, en: `count = max(0, min(${minPos}, ${maxPos}) - ${bad}) = max(0, ${smaller} - ${bad}) = ${count}` },
      arr: [...nums],
      sub: makeSub(bad, minPos, maxPos),
      highlight: [i],
      mark: validLeft,
      codeLines: [14],
      vars: [
        { name: "i", value: i },
        { name: "min_pos", value: minPos },
        { name: "max_pos", value: maxPos },
        { name: "min(min_pos, max_pos)", value: smaller },
        { name: "bad", value: bad },
        { name: "count", value: count },
      ],
      note: {
        vi: count > 0
          ? `min(min_pos=${minPos}, max_pos=${maxPos}) = ${smaller}.\n` +
            `Valid left boundaries = indices (${bad}, ${smaller}] = ${count} vị trí (tô xanh).\n` +
            `Mỗi vị trí left đó cho 1 subarray hợp lệ kết thúc tại i=${i}.`
          : `min(min_pos=${minPos}, max_pos=${maxPos}) = ${smaller} ≤ bad=${bad} → chưa đủ minK VÀ maxK trong window → count = 0.`,
        en: count > 0
          ? `min(min_pos=${minPos}, max_pos=${maxPos}) = ${smaller}.\n` +
            `Valid left boundaries = indices (${bad}, ${smaller}] = ${count} positions (highlighted green).\n` +
            `Each gives one valid subarray ending at i=${i}.`
          : `min(min_pos=${minPos}, max_pos=${maxPos}) = ${smaller} ≤ bad=${bad} → minK AND maxK not both in window → count = 0.`,
      },
    });

    // ── res += count ───────────────────────────────────────────────────────
    res += count;
    steps.push({
      title: { vi: `res += ${count} → res = ${res}`, en: `res += ${count} → res = ${res}` },
      arr: [...nums],
      sub: makeSub(bad, minPos, maxPos),
      highlight: [i],
      mark: validLeft,
      codeLines: [15],
      vars: [
        { name: "i", value: i },
        { name: "count", value: count },
        { name: "res", value: res },
      ],
      note: {
        vi: `Cộng thêm ${count} subarray hợp lệ kết thúc tại i=${i}. Tổng cộng đến giờ: res = ${res}.`,
        en: `Add ${count} valid subarrays ending at i=${i}. Running total: res = ${res}.`,
      },
    });
  }

  // ── Final ──────────────────────────────────────────────────────────────────
  steps.push({
    title: { vi: `return res = ${res}`, en: `return res = ${res}` },
    arr: [...nums],
    sub: makeSub(bad, minPos, maxPos),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [
      { name: "answer (res)", value: res },
      { name: "minK", value: minK },
      { name: "maxK", value: maxK },
    ],
    note: {
      vi: `Tổng số subarray có min=minK=${minK} và max=maxK=${maxK} là ${res}.`,
      en: `Total subarrays with min=minK=${minK} and max=maxK=${maxK} is ${res}.`,
    },
  });

  return { original: nums, minK, maxK, answer: res, steps };
}

module.exports = {
  3: {
    id: 3,
    difficulty: "medium",
    slug: "longest-substring-without-repeating-characters",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: {
      vi: "Longest Substring Without Repeating Characters",
      en: "Longest Substring Without Repeating Characters",
    },
    titleVi: {
      vi: "Substring dài nhất không lặp ký tự",
      en: "Longest substring without repeating characters",
    },
    statement: {
      vi: "Cho chuỗi s, trả về độ dài substring dài nhất không chứa ký tự lặp lại.",
      en: "Given a string s, return the length of the longest substring without repeating characters.",
    },
    defaultInput: "abcabcbb",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn cách visualize", en: "Visualization approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "Cách 1: Last-seen map", en: "Approach 1: Last-seen map" } },
          { value: 2, label: { vi: "Cách 2: Character set", en: "Approach 2: Character set" } },
        ],
      },
    ],
    approach: [
      {
        vi: "Cách 1 dùng last_seen để nhảy cạnh trái đến ngay sau vị trí trùng cũ.",
        en: "Approach 1 uses last_seen to jump the left edge just past the old duplicate.",
      },
      {
        vi: "Cách 2 dùng char_set và co cửa sổ từng ký tự cho đến khi ký tự mới không còn trùng.",
        en: "Approach 2 uses char_set and shrinks one character at a time until the new character is unique.",
      },
      {
        vi: "Cả hai cách đều giữ cửa sổ không lặp và cập nhật độ dài lớn nhất sau mỗi cạnh phải.",
        en: "Both approaches keep a duplicate-free window and update the maximum length at every right edge.",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(min(n, charset))",
      note: {
        vi: "Cạnh phải duyệt chuỗi một lần và cạnh trái chỉ tiến về trước. Map hoặc set lưu tối đa một mục cho mỗi ký tự khác nhau.",
        en: "The right edge scans once and the left edge only moves forward. The map or set stores at most one entry per distinct character.",
      },
    },
    code: [
      "class Solution:",
      "    def lengthOfLongestSubstring(self, s: str) -> int:",
      "        last_seen = {}",
      "        left = 0",
      "        best = 0",
      "        for right, ch in enumerate(s):",
      "            if ch in last_seen and last_seen[ch] >= left:",
      "                left = last_seen[ch] + 1",
      "            last_seen[ch] = right",
      "            best = max(best, right - left + 1)",
      "        return best",
    ],
    code2: [
      "class Solution:",
      "    def lengthOfLongestSubstring(self, s: str) -> int:",
      "        left = 0",
      "        max_length = 0",
      "        char_set = set()",
      "",
      "        for right in range(len(s)):",
      "            while s[right] in char_set:",
      "                char_set.remove(s[left])",
      "                left += 1",
      "",
      "            char_set.add(s[right])",
      "            max_length = max(max_length, right - left + 1)",
      "",
      "        return max_length",
    ],
    codeLabel: { vi: "Cách 1: Last-seen map", en: "Approach 1: Last-seen map" },
    code2Label: { vi: "Cách 2: Character set", en: "Approach 2: Character set" },
    builder: buildSteps3,
  },
  1358: {
    id: 1358,
    difficulty: "medium",
    slug: "number-of-substrings-containing-all-three-characters",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Number of Substrings Containing All Three Characters", en: "Number of Substrings Containing All Three Characters" },
    titleVi: { vi: "Số substring chứa cả a, b, c", en: "Substrings with all three chars" },
    statement: {
      vi: "Cho chuỗi s chỉ gồm 'a', 'b', 'c'. Trả về số lượng substring chứa ít nhất một 'a', một 'b', và một 'c'.",
      en: "Given a string s consisting only of 'a', 'b', and 'c', return the number of substrings containing at least one occurrence of all three characters.",
    },
    defaultInput: "abcabc",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s (chỉ a,b,c)", en: "String s (only a,b,c)" },
    extraParams: [
      { key: "approach", label: { vi: "Cách (1=sliding window, 2=last index)", en: "Approach (1=sliding window, 2=last index)" }, default: 1 },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi ký tự được thêm/bỏ khỏi cửa sổ tối đa 1 lần → O(n). Chỉ dùng 3 biến đếm.",
        en: "Each character added/removed at most once → O(n). Only 3 counters used.",
      },
    },
    code: [
      "class Solution:",
      "    def numberOfSubstrings(self, s):",
      "        count = {'a': 0, 'b': 0, 'c': 0}",
      "        left = 0",
      "        total = 0",
      "        for right in range(len(s)):",
      "            count[s[right]] += 1",
      "            while count['a'] > 0 and count['b'] > 0 and count['c'] > 0:",
      "                total += len(s) - right",
      "                count[s[left]] -= 1",
      "                left += 1",
      "        return total",
    ],
    builder: buildSteps1358,
  },
  713: {
    id: 713,
    difficulty: "medium",
    slug: "subarray-product-less-than-k",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Subarray Product Less Than K", en: "Subarray Product Less Than K" },
    titleVi: { vi: "Đoạn con có tích nhỏ hơn K", en: "Subarrays with product < K" },
    statement: {
      vi: "Cho mảng số nguyên dương nums và k. Trả về số lượng đoạn con liên tiếp có tích các phần tử < k.",
      en: "Given an array of positive integers nums and an integer k, return the number of contiguous subarrays where the product of all elements is strictly less than k.",
    },
    defaultInput: [10, 5, 2, 6],
    inputKind: "positive",
    extraParams: [
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 100 },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi phần tử được nhân/chia tối đa một lần → O(n). O(1) bộ nhớ.",
        en: "Each element multiplied/divided at most once → O(n). O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def numSubarrayProductLessThanK(self, nums, k):",
      "        if k <= 1: return 0",
      "        left = 0",
      "        product = 1",
      "        count = 0",
      "        for right in range(len(nums)):",
      "            product *= nums[right]",
      "            while product >= k:",
      "                product //= nums[left]",
      "                left += 1",
      "            count += right - left + 1",
      "        return count",
    ],
    builder: buildSteps713,
  },
  209: {
    id: 209,
    difficulty: "medium",
    slug: "minimum-size-subarray-sum",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Minimum Size Subarray Sum", en: "Minimum Size Subarray Sum" },
    titleVi: { vi: "Đoạn con ngắn nhất có tổng ≥ target", en: "Shortest subarray with sum ≥ target" },
    statement: {
      vi: "Cho mảng số nguyên dương nums và target. Trả về độ dài ngắn nhất của một đoạn con liên tiếp có tổng ≥ target. Nếu không có, trả về 0.",
      en: "Given an array of positive integers nums and a target, return the minimal length of a contiguous subarray whose sum is ≥ target. If there is none, return 0.",
    },
    defaultInput: [2, 3, 1, 2, 4, 3],
    inputKind: "positive",
    extraParams: [
      { key: "target", type: "number", label: { vi: "target", en: "target" }, default: 7 },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi phần tử được thêm/bỏ khỏi cửa sổ tối đa 1 lần → O(n). O(1) bộ nhớ.",
        en: "Each element is added/removed at most once → O(n). O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def minSubArrayLen(self, target, nums):",
      "        left = 0",
      "        total = 0",
      "        min_len = float('inf')",
      "        for right in range(len(nums)):",
      "            total += nums[right]",
      "            while total >= target:",
      "                min_len = min(min_len, right-left+1)",
      "                total -= nums[left]",
      "                left += 1",
      "        return min_len if min_len != float('inf') else 0",
    ],
    builder: buildSteps209,
  },
  643: {
    id: 643,
    difficulty: "easy",
    slug: "maximum-average-subarray-i",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Maximum Average Subarray I", en: "Maximum Average Subarray I" },
    titleVi: { vi: "Đoạn con có trung bình lớn nhất I", en: "Maximum average subarray I" },
    statement: {
      vi: "Cho mảng số nguyên nums gồm n phần tử và số nguyên k. Tìm đoạn con liên tiếp có đúng k phần tử với giá trị trung bình lớn nhất và trả về giá trị trung bình đó.",
      en: "Given an integer array nums of n elements and an integer k, find the contiguous subarray of exactly k elements with the maximum average and return that average.",
    },
    defaultInput: [1, 12, -5, -6, 50, 3],
    inputKind: "integer",
    extraParams: [
      { key: "k", type: "number", label: { vi: "Độ dài cửa sổ k", en: "Window size k" }, default: 4 },
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn cách visualize", en: "Visualization approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "Cách 1: Sliding Window", en: "Approach 1: Sliding Window" } },
          { value: 2, label: { vi: "Cách 2: Prefix Sum", en: "Approach 2: Prefix Sum" } },
        ],
      },
    ],
    approach: [
      {
        vi: "Cách 1 (Sliding Window): tính tổng k phần tử đầu, rồi mỗi lần trượt thì cộng IN và trừ OUT. Dùng O(1) bộ nhớ phụ.",
        en: "Approach 1 (Sliding Window): sum the first k values, then add IN and subtract OUT for every slide. Uses O(1) extra space.",
      },
      {
        vi: "Cách 2 (Prefix Sum): dựng prefix[t] = tổng nums[0..t-1]. Tổng cửa sổ nums[left..right-1] = prefix[right] - prefix[left].",
        en: "Approach 2 (Prefix Sum): build prefix[t] as the sum of nums[0..t-1]. Then nums[left..right-1] sums to prefix[right] - prefix[left].",
      },
      {
        vi: "Cả hai cách đều so sánh tổng vì mọi cửa sổ có cùng độ dài k, rồi chỉ chia max_sum cho k một lần ở cuối.",
        en: "Both approaches compare sums because every window has the same length k, then divide max_sum by k once at the end.",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1) / O(n)",
      note: {
        vi: "Cách 1 dùng O(1) bộ nhớ phụ. Cách 2 dùng mảng prefix dài n+1 nên cần O(n) bộ nhớ; mỗi tổng cửa sổ được truy vấn trong O(1).",
        en: "Approach 1 uses O(1) extra space. Approach 2 stores an n+1 prefix array, so it uses O(n) space and answers each window-sum query in O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def findMaxAverage(self, nums: List[int], k: int) -> float:",
      "        window_sum = sum(nums[:k])",
      "        max_sum = window_sum",
      "",
      "        for i in range(k, len(nums)):",
      "            window_sum += nums[i] - nums[i - k]",
      "            max_sum = max(max_sum, window_sum)",
      "",
      "        return max_sum / k",
    ],
    code2: [
      "class Solution:",
      "    def findMaxAverage(self, nums: List[int], k: int) -> float:",
      "        prefix = [0] * (len(nums) + 1)",
      "        for i, num in enumerate(nums):",
      "            prefix[i + 1] = prefix[i] + num",
      "        max_sum = float('-inf')",
      "        for right in range(k, len(nums) + 1):",
      "            window_sum = prefix[right] - prefix[right - k]",
      "            max_sum = max(max_sum, window_sum)",
      "        return max_sum / k",
    ],
    codeLabel: { vi: "Cách 1: Sliding Window", en: "Approach 1: Sliding Window" },
    code2Label: { vi: "Cách 2: Prefix Sum", en: "Approach 2: Prefix Sum" },
    builder: buildSteps643,
  },
  487: {
    id: 487,
    difficulty: "medium",
    slug: "max-consecutive-ones-ii",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Max Consecutive Ones II", en: "Max Consecutive Ones II" },
    titleVi: { vi: "Dãy số 1 liên tiếp dài nhất II", en: "Longest run of ones (flip 1 zero)" },
    statement: {
      vi: "Cho mảng nhị phân nums. Trả về số lượng 1 liên tiếp lớn nhất nếu bạn được lật tối đa một số 0 thành 1.",
      en: "Given a binary array nums, return the maximum number of consecutive 1's if you can flip at most one 0.",
    },
    defaultInput: [1, 0, 1, 1, 0],
    inputKind: "binary",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Cửa sổ trượt duyệt mảng một lần O(n). Chỉ dùng vài biến O(1).",
        en: "Sliding window traverses once O(n). Only a few variables O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def findMaxConsecutiveOnes(self, nums):",
      "        left = 0",
      "        zero_count = 0",
      "        max_len = 0",
      "        for right in range(len(nums)):",
      "            if nums[right] == 0:",
      "                zero_count += 1",
      "            while zero_count > 1:",
      "                if nums[left] == 0:",
      "                    zero_count -= 1",
      "                left += 1",
      "            max_len = max(max_len, right-left+1)",
      "        return max_len",
    ],
    builder: buildSteps487,
  },
  1208: {
    id: 1208,
    difficulty: "medium",
    slug: "get-equal-substrings-within-budget",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Get Equal Substrings Within Budget", en: "Get Equal Substrings Within Budget" },
    titleVi: { vi: "Đoạn con bằng nhau trong ngân sách", en: "Equal substring within budget" },
    statement: {
      vi:
        "Cho hai chuỗi s và t cùng độ dài. Chi phí đổi s[i] thành t[i] là |ASCII(s[i]) - ASCII(t[i])|. " +
        "Cho ngân sách maxCost, trả về độ dài lớn nhất của một đoạn con của s có thể đổi thành đoạn con tương ứng của t với tổng chi phí ≤ maxCost.",
      en:
        "You are given two equal-length strings s and t. The cost of changing s[i] to t[i] is |ASCII(s[i]) - ASCII(t[i])|. " +
        "Given a budget maxCost, return the maximum length of a substring of s that can be changed into the corresponding substring of t with total cost ≤ maxCost.",
    },
    defaultInput: "abcd",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [
      {
        key: "t",
        type: "string",
        label: { vi: "Chuỗi t (cùng độ dài s)", en: "String t (same length as s)" },
        default: "bcdf",
      },
      {
        key: "maxCost",
        type: "number",
        label: { vi: "maxCost (ngân sách)", en: "maxCost (budget)" },
        default: 3,
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Mỗi chỉ số left và right chỉ duyệt qua chuỗi một lần (cửa sổ trượt) nên O(n) thời gian. Mảng cost dài n nên O(n) bộ nhớ.",
        en: "Both left and right pointers traverse the string once (sliding window), so O(n) time. The cost array of length n is O(n) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def equalSubstring(self, s, t, maxCost):",
      "        cost = [abs(ord(a) - ord(b)) for a, b in zip(s, t)]",
      "        left = 0",
      "        window = 0",
      "        max_len = 0",
      "        for right in range(len(s)):",
      "            window += cost[right]",
      "            while window > maxCost:",
      "                window -= cost[left]",
      "                left += 1",
      "            max_len = max(max_len, right - left + 1)",
      "        return max_len",
    ],
    builder: buildSteps1208,
  },
  1100: {
    id: 1100,
    difficulty: "medium",
    premium: true,
    slug: "find-k-length-substrings-with-no-repeated-characters",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Find K-Length Substrings With No Repeated Characters", en: "Find K-Length Substrings With No Repeated Characters" },
    titleVi: { vi: "Đếm substring độ dài K không lặp ký tự", en: "K-length substrings with no repeated characters" },
    statement: {
      vi: "Cho chuỗi s và số nguyên k. Trả về số substring liên tiếp có độ dài k mà không có ký tự nào lặp lại.",
      en: "Given a string s and an integer k, return the number of contiguous substrings of length k with no repeated characters.",
    },
    defaultInput: "havefunonleetcode",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 5 },
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn cách visualize", en: "Visualization approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "Cách 1: Frequency map", en: "Approach 1: Frequency map" } },
          { value: 2, label: { vi: "Cách 2: Character set", en: "Approach 2: Character set" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 dùng frequency map; co trái khi có duplicate hoặc cửa sổ dài hơn k.", en: "Approach 1 uses a frequency map; shrink on duplicates or when the window exceeds k." },
      { vi: "Cách 2 dùng set; co trái đến khi s[j] không còn trùng.", en: "Approach 2 uses a set; shrink until s[j] is no longer duplicated." },
      { vi: "Khi cách 2 đếm được cửa sổ dài k, xóa cạnh trái ngay để cửa sổ kế tiếp không thể dài hơn k.", en: "After approach 2 counts a length-k window, it immediately removes the left edge so the next window cannot exceed k." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(min(n, charset))",
      note: {
        vi: "Cả hai cách đều O(n): mỗi ký tự vào/ra cửa sổ tối đa một lần. Map hoặc set giữ các ký tự trong cửa sổ.",
        en: "Both approaches are O(n): each character enters and leaves the window at most once. A map or set stores the window's characters.",
      },
    },
    code: [
      "class Solution:",
      "    def numKLenSubstrNoRepeats(self, s: str, k: int) -> int:",
      "        if k <= 0 or k > len(s): return 0",
      "        left = 0",
      "        count = {}",
      "        answer = 0",
      "        for right, ch in enumerate(s):",
      "            count[ch] = count.get(ch, 0) + 1",
      "            while count[ch] > 1 or right - left + 1 > k:",
      "                count[s[left]] -= 1",
      "                left += 1",
      "            if right - left + 1 == k:",
      "                answer += 1",
      "        return answer",
    ],
    code2: [
      "class Solution:",
      "    def numKLenSubstrNoRepeats(self, s: str, k: int) -> int:",
      "        char_set = set()",
      "        left = 0",
      "        total = 0",
      "",
      "        for right in range(len(s)):",
      "            while s[right] in char_set:",
      "                char_set.remove(s[left])",
      "                left += 1",
      "            char_set.add(s[right])",
      "",
      "            if right - left + 1 == k:",
      "                total += 1",
      "                char_set.remove(s[left])",
      "                left += 1",
      "",
      "        return total",
    ],
    codeLabel: { vi: "Cách 1: Frequency map", en: "Approach 1: Frequency map" },
    code2Label: { vi: "Cách 2: Character set", en: "Approach 2: Character set" },
    builder: buildSteps1100,
  },
  1004: {
    id: 1004,
    difficulty: "medium",
    slug: "max-consecutive-ones-iii",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Max Consecutive Ones III", en: "Max Consecutive Ones III" },
    titleVi: { vi: "Dãy số 1 liên tiếp dài nhất III", en: "Longest run of consecutive ones III" },
    statement: {
      vi: "Cho mảng nhị phân nums và số nguyên k. Trả về số lượng số 1 liên tiếp lớn nhất có thể có nếu bạn được phép lật tối đa k số 0 thành 1.",
      en: "Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's.",
    },
    defaultInput: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0],
    inputKind: "binary", // chỉ gồm 0 và 1
    extraParams: [
      {
        key: "k",
        label: { vi: "k (số 0 được phép lật)", en: "k (zeros you may flip)" },
        default: 2,
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi chỉ số i và j chỉ duyệt qua mảng đúng một lần (cửa sổ trượt), nên O(n). Chỉ dùng vài biến đếm nên bộ nhớ O(1).",
        en: "Both pointers i and j traverse the array once (sliding window), so O(n). Only a few counters are used, so O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def longestOnes(self, nums, k):",
      "        left = 0",
      "        max_length = 0",
      "        zero_count = 0",
      "        for right in range(len(nums)):",
      "            if nums[right] == 0:",
      "                zero_count += 1",
      "                while zero_count > k:",
      "                    if nums[left] == 0:",
      "                        zero_count -= 1",
      "                    left += 1",
      "            max_length = max(max_length, right - left + 1)",
      "        return max_length",
    ],
    builder: buildSteps1004,
  },
  239: {
    id: 239,
    difficulty: "hard",
    slug: "sliding-window-maximum",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Sliding Window Maximum", en: "Sliding Window Maximum" },
    titleVi: { vi: "Giá trị lớn nhất mỗi cửa sổ trượt (monotonic deque)", en: "Maximum of each sliding window (monotonic deque)" },
    statement: {
      vi:
        "Cho mảng nums và số k. Cửa sổ kích thước k trượt từ trái sang phải. " +
        "Trả về mảng giá trị lớn nhất của mỗi cửa sổ. Nhập nums cách nhau dấu phẩy.",
      en:
        "Given an array nums and integer k, a window of size k slides from left to right. " +
        "Return the maximum of each window. Enter nums as comma-separated numbers.",
    },
    defaultInput: [1, 3, -1, -3, 5, 3, 6, 7],
    inputKind: "integer",
    extraParams: [
      { key: "k", label: { vi: "k (kích thước cửa sổ)", en: "k (window size)" }, default: 3 },
    ],
    approach: [
      { vi: "Dùng deque lưu INDEX theo giá trị GIẢM DẦN. Front dq[0] luôn là index của max cửa sổ.", en: "Use a deque of INDICES in DECREASING value order. Front dq[0] is always the window max index." },
      { vi: "Trước khi thêm i: pop khỏi đuôi mọi index có giá trị < nums[i] (chúng không bao giờ là max nữa).", en: "Before adding i: pop from the back every index whose value < nums[i] (they can never be max again)." },
      { vi: "Pop front nếu nó ra khỏi cửa sổ (dq[0] ≤ i-k).", en: "Pop the front if it left the window (dq[0] ≤ i-k)." },
      { vi: "Khi i ≥ k-1, ghi nums[dq[0]] (max cửa sổ hiện tại) vào result.", en: "When i ≥ k-1, append nums[dq[0]] (current window max) to result." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(k)",
      note: {
        vi: "Mỗi index được push và pop tối đa 1 lần → O(n). Deque chứa tối đa k phần tử.",
        en: "Each index is pushed and popped at most once → O(n). The deque holds at most k elements.",
      },
    },
    code: [
      "from collections import deque",
      "class Solution:",
      "    def maxSlidingWindow(self, nums, k):",
      "        dq = deque()",
      "        result = []",
      "        for i, num in enumerate(nums):",
      "            while dq and nums[dq[-1]] < num:",
      "                dq.pop()",
      "            dq.append(i)",
      "            if dq[0] <= i - k:",
      "                dq.popleft()",
      "            if i >= k - 1:",
      "                result.append(nums[dq[0]])",
      "        return result",
    ],
    builder: buildSteps239,
  },
  424: {
    id: 424,
    difficulty: "medium",
    slug: "longest-repeating-character-replacement",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Longest Repeating Character Replacement", en: "Longest Repeating Character Replacement" },
    titleVi: { vi: "Chuỗi lặp dài nhất sau ≤ k lần thay", en: "Longest repeating substring after ≤ k replacements" },
    statement: {
      vi: "Cho chuỗi s và số k. Được thay tối đa k ký tự bất kỳ. Tìm độ dài chuỗi con dài nhất chỉ gồm 1 ký tự lặp. Nhập s; k trong tham số.",
      en: "Given string s and integer k, you may replace at most k characters. Find the length of the longest substring of a single repeating char. Enter s; k as a parameter.",
    },
    defaultInput: "AABABBA",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      { key: "k", label: { vi: "k (số lần thay)", en: "k (replacements)" }, default: 1 },
    ],
    approach: [
      { vi: "Cửa sổ trượt; count đếm tần suất từng ký tự trong cửa sổ.", en: "Sliding window; count tracks each char's frequency in the window." },
      { vi: "max_freq = tần suất ký tự nhiều nhất. Cần thay = (độ dài) - max_freq.", en: "max_freq = highest char frequency. Replacements needed = (length) - max_freq." },
      { vi: "Nếu cần thay > k → cửa sổ không hợp lệ → co left.", en: "If replacements needed > k → window invalid → shrink left." },
      { vi: "result = độ dài cửa sổ hợp lệ dài nhất.", en: "result = length of the longest valid window." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Mỗi ký tự vào/ra cửa sổ 1 lần; bảng đếm ≤ 26.", en: "Each char enters/leaves once; count table ≤ 26." } },
    code: [
      "class Solution:",
      "    def characterReplacement(self, s, k):",
      "        count = defaultdict(int); left = 0; max_freq = 0; result = 0",
      "        for right, ch in enumerate(s):",
      "            count[ch] += 1",
      "            max_freq = max(max_freq, count[ch])",
      "            while (right - left + 1) - max_freq > k:",
      "                count[s[left]] -= 1; left += 1",
      "            result = max(result, right - left + 1)",
      "        return result",
    ],
    builder: buildSteps424,
  },
  480: {
    id: 480,
    difficulty: "hard",
    slug: "sliding-window-median",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Sliding Window Median", en: "Sliding Window Median" },
    titleVi: { vi: "Trung vị của cửa sổ trượt", en: "Median of each sliding window" },
    statement: {
      vi:
        "Cho mảng nums và số k. Cửa sổ kích thước k trượt từ trái sang phải. " +
        "Trả về TRUNG VỊ của mỗi cửa sổ. Nhập nums cách nhau dấu phẩy.",
      en:
        "Given an array nums and integer k, a window of size k slides left to right. " +
        "Return the MEDIAN of each window. Enter nums as comma-separated numbers.",
    },
    defaultInput: [1, 3, -1, -3, 5, 3, 6, 7],
    inputKind: "integer",
    extraParams: [
      { key: "k", label: { vi: "k (kích thước cửa sổ)", en: "k (window size)" }, default: 3 },
    ],
    approach: [
      { vi: "Giữ cửa sổ luôn được sắp xếp; trung vị là phần tử giữa.", en: "Keep the window sorted; the median is the middle element." },
      { vi: "k lẻ → phần tử window[k//2]. k chẵn → trung bình 2 phần tử giữa.", en: "Odd k → element window[k//2]. Even k → average of the two middle elements." },
      { vi: "Mỗi bước: thêm phần tử mới, bỏ phần tử rời cửa sổ, đọc trung vị.", en: "Each step: add the new element, remove the leaving one, read the median." },
      { vi: "Bản tối ưu O(log n) dùng hai heap + lazy deletion; kết quả giống nhau.", en: "The optimal O(log n) version uses two heaps + lazy deletion; results are identical." },
    ],
    complexity: {
      time: "O(n·k) sorted-window / O(n·log k) two-heap",
      space: "O(k)",
      note: {
        vi: "Bản Python đi kèm dùng hai heap + lazy deletion cho O(n log k).",
        en: "The accompanying Python uses two heaps + lazy deletion for O(n log k).",
      },
    },
    code: [
      "class Solution:",
      "    def medianSlidingWindow(self, nums, k):",
      "        window = SortedList()",
      "        result = []",
      "        for i, num in enumerate(nums):",
      "            window.add(num)",
      "            if i >= k:",
      "                window.remove(nums[i-k])",
      "            if i >= k - 1:",
      "                if k % 2 == 1: result.append(window[k//2])",
      "                else: result.append((window[k//2-1]+window[k//2])/2)",
      "        return result",
    ],
    builder: buildSteps480,
  },
  76: {
    id: 76,
    difficulty: "hard",
    slug: "minimum-window-substring",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Minimum Window Substring", en: "Minimum Window Substring" },
    titleVi: { vi: "Substring nhỏ nhất chứa mọi ký tự của t", en: "Smallest substring covering all of t" },
    statement: {
      vi:
        "Cho chuỗi s và chuỗi t. Tìm substring NHỎ NHẤT của s chứa TẤT CẢ ký tự của t " +
        "(kể cả số lần lặp). Nếu không có, trả về \"\".",
      en:
        "Given strings s and t, find the SMALLEST substring of s that contains ALL characters of t " +
        "(including duplicates). If none, return \"\".",
    },
    defaultInput: "ADOBECODEBANC",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      { key: "t", label: { vi: "t (ký tự cần)", en: "t (required chars)" }, default: "ABC" },
    ],
    approach: [
      { vi: "need = Counter(t) đếm ký tự cần. missing = tổng ký tự còn thiếu.", en: "need = Counter(t) counts required chars. missing = total chars still needed." },
      { vi: "Mở rộng right, giảm need[char]; nếu char thực sự cần thì missing giảm.", en: "Expand right, decrement need[char]; if char was actually needed, missing decreases." },
      { vi: "Khi missing==0 (đủ t) → co left để rút gọn window, cập nhật best.", en: "When missing==0 (t is covered) → shrink left to minimize, update best." },
      { vi: "Khi bỏ ký tự cần khỏi window, missing tăng lại → thoát vòng co.", en: "When a needed char leaves the window, missing goes back up → stop shrinking." },
    ],
    complexity: {
      time: "O(|s| + |t|)",
      space: "O(|t|)",
      note: {
        vi: "Mỗi ký tự của s được right thêm và left bỏ tối đa 1 lần.",
        en: "Each char of s is added by right and removed by left at most once.",
      },
    },
    code: [
      "from collections import Counter",
      "class Solution:",
      "    def minWindow(self, s, t):",
      "        if not s or not t: return \"\"",
      "        need = Counter(t)",
      "        missing = len(t)",
      "        left = 0",
      "        start, end = 0, 0",
      "        for right, char in enumerate(s):",
      "            if need[char] > 0: missing -= 1",
      "            need[char] -= 1",
      "            while missing == 0:",
      "                if end == 0 or right-left+1 < end-start:",
      "                    start, end = left, right + 1",
      "                need[s[left]] += 1",
      "                if need[s[left]] > 0: missing += 1",
      "                left += 1",
      "        return s[start:end]",
    ],
    builder: buildSteps76,
  },
  2444: {
    id: 2444,
    difficulty: "hard",
    slug: "count-subarrays-with-fixed-bounds",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Count Subarrays With Fixed Bounds", en: "Count Subarrays With Fixed Bounds" },
    titleVi: { vi: "Đếm subarray có min=minK và max=maxK (O(n))", en: "Count subarrays whose min=minK and max=maxK (O(n))" },
    statement: {
      vi:
        "Cho mảng nums và hai số nguyên minK, maxK. " +
        "Đếm số subarray (liên tiếp) có min = minK VÀ max = maxK. " +
        "Nhập nums là dãy số nguyên cách nhau bởi dấu phẩy.",
      en:
        "Given an integer array nums and two integers minK and maxK, " +
        "count subarrays (contiguous) whose minimum equals minK AND maximum equals maxK. " +
        "Enter nums as comma-separated integers.",
    },
    defaultInput: [1, 3, 5, 2, 7, 5],
    inputKind: "integer",
    extraParams: [
      { key: "minK", label: { vi: "minK", en: "minK" }, default: 1 },
      { key: "maxK", label: { vi: "maxK", en: "maxK" }, default: 5 },
    ],
    approach: [
      { vi: "Duyệt một lần O(n): duy trì 3 biến bad, min_pos, max_pos.", en: "Single pass O(n): maintain 3 variables bad, min_pos, max_pos." },
      { vi: "bad = chỉ số ngoài [minK, maxK] gần nhất. Mọi subarray hợp lệ phải bắt đầu SAU bad.", en: "bad = last index outside [minK, maxK]. Every valid subarray must start AFTER bad." },
      { vi: "min_pos = chỉ số xuất hiện minK gần nhất; max_pos = chỉ số xuất hiện maxK gần nhất.", en: "min_pos = last index of minK; max_pos = last index of maxK." },
      { vi: "Số subarray hợp lệ kết thúc tại i = max(0, min(min_pos, max_pos) - bad). Vì left phải > bad VÀ ≤ min(min_pos, max_pos).", en: "Valid subarrays ending at i = max(0, min(min_pos, max_pos) - bad). Because left must be > bad AND ≤ min(min_pos, max_pos)." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng đúng 1 lần. Chỉ dùng 3 biến ngoài result.",
        en: "Single pass through the array. Only 3 extra variables besides result.",
      },
    },
    code: [
      "class Solution:",
      "    def countSubarrays(self, nums, minK, maxK):",
      "        res = 0",
      "        bad = -1",
      "        min_pos = -1",
      "        max_pos = -1",
      "        for i, num in enumerate(nums):",
      "            if num < minK or num > maxK:",
      "                bad = i",
      "            if num == minK:",
      "                min_pos = i",
      "            if num == maxK:",
      "                max_pos = i",
      "            count = max(0, min(min_pos, max_pos) - bad)",
      "            res += count",
      "        return res",
    ],
    builder: buildSteps2444,
  },
};
