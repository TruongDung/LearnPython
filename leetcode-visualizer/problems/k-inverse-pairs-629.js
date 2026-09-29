// LeetCode 629 — K Inverse Pairs Array focused visualization module.

const K_INVERSE_PAIRS_629_MOD = 1_000_000_007;
const K_INVERSE_PAIRS_629_MAX_N = 8;
const K_INVERSE_PAIRS_629_MAX_K = 28;
const K_INVERSE_PAIRS_629_SOURCE = Object.freeze([
  "class Solution:",
  "    def kInversePairs(self, n: int, k: int) -> int:",
  "        MOD = 10**9 + 7",
  "        maximum = n * (n - 1) // 2",
  "        if k < 0 or k > maximum:",
  "            return 0",
  "        k = min(k, maximum - k)",
  "        dp = [0] * (k + 1)",
  "        dp[0] = 1",
  "        for size in range(1, n + 1):",
  "            next_dp = [0] * (k + 1)",
  "            window = 0",
  "            upper = min(k, size * (size - 1) // 2)",
  "            for inv in range(upper + 1):",
  "                window = (window + dp[inv]) % MOD",
  "                if inv >= size:",
  "                    window = (window - dp[inv - size]) % MOD",
  "                next_dp[inv] = window",
  "            dp = next_dp",
  "        answer = dp[k]",
  "        return answer",
]);

function parseKInversePairs629Input(input, params) {
  if (!Array.isArray(input) || input.length !== 1 || !Number.isSafeInteger(input[0])) {
    throw new TypeError("K Inverse Pairs input must be an array containing one integer n.");
  }
  const n = input[0];
  const rawK = params && params.k;
  const k = typeof rawK === "number"
    ? rawK
    : typeof rawK === "string" && /^\d+$/.test(rawK.trim()) ? Number(rawK.trim()) : NaN;
  if (!Number.isSafeInteger(n) || n < 1 || n > K_INVERSE_PAIRS_629_MAX_N) {
    throw new RangeError(`K Inverse Pairs n must be between 1 and ${K_INVERSE_PAIRS_629_MAX_N}.`);
  }
  if (!Number.isSafeInteger(k) || k < 0 || k > K_INVERSE_PAIRS_629_MAX_K) {
    throw new RangeError(`K Inverse Pairs k must be between 0 and ${K_INVERSE_PAIRS_629_MAX_K}.`);
  }
  return { n, k };
}

function deepFreezeInversePairs629View(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function buildInverseWitness629(n, requestedK) {
  const digits = Array(n + 1).fill(0);
  let remaining = requestedK;
  for (let size = n; size >= 1; size--) {
    digits[size] = Math.min(remaining, size - 1);
    remaining -= digits[size];
  }
  const permutation = [];
  const insertionOrder = [];
  for (let size = 1; size <= n; size++) {
    const index = size - 1 - digits[size];
    permutation.splice(index, 0, size);
    insertionOrder.push({ size, digit: digits[size], index, permutation: [...permutation] });
  }
  let inversionCount = 0;
  const pairs = [];
  for (let left = 0; left < permutation.length; left++) {
    for (let right = left + 1; right < permutation.length; right++) {
      if (permutation[left] > permutation[right]) {
        inversionCount++;
        pairs.push([permutation[left], permutation[right]]);
      }
    }
  }
  const valid = remaining === 0
    && inversionCount === requestedK
    && [...permutation].sort((left, right) => left - right).every((value, index) => value === index + 1);
  if (!valid) throw new Error("K Inverse Pairs witness invariant failed.");
  return { digits: digits.slice(1), insertionOrder, permutation, inversionCount, pairs, valid };
}

function buildSteps629Exact(input, params) {
  const { n, k: requestedK } = parseKInversePairs629Input(input, params);
  const steps = [];
  const localized = (en, vi) => ({ en, vi });
  const counters = {
    sizeIterations: 0,
    cellIterations: 0,
    windowAdds: 0,
    evictionChecks: 0,
    evictions: 0,
    cellWrites: 0,
    rowCommits: 0,
  };
  let maximum = null;
  let effectiveK = null;
  let reflected = false;
  let size = null;
  let inv = null;
  let upper = null;
  let dp = null;
  let nextDp = null;
  let nextComputed = null;
  const rows = [];
  let window = null;
  let windowState = {
    left: null, right: null, before: null,
    incomingIndex: null, incomingValue: null, afterAdd: null,
    evict: null, outgoingIndex: null, outgoingValue: null, afterRemove: null,
  };
  let answer = null;
  let witness = null;
  let impossible = false;

  const rowSnapshot = (row) => ({
    size: row.size,
    upper: row.upper,
    values: [...row.values],
    computed: [...row.computed],
  });
  const snapshotView = ({ line, event, phase, timing, condition, final }) => deepFreezeInversePairs629View({
    version: 1,
    problemId: 629,
    source: { line, text: K_INVERSE_PAIRS_629_SOURCE[line - 1] },
    event,
    phase,
    timing,
    condition: condition && typeof condition === "object"
      ? { expression: condition.expression, result: condition.result }
      : { expression: null, result: null },
    input: {
      n,
      requestedK,
      maximum,
      effectiveK,
      reflected,
      impossible,
      modulus: K_INVERSE_PAIRS_629_MOD,
      limits: { maxN: K_INVERSE_PAIRS_629_MAX_N, maxK: K_INVERSE_PAIRS_629_MAX_K },
    },
    cursor: { size, inv, upper },
    window: { ...windowState },
    recurrence: {
      sourceLeft: inv === null || size === null ? null : Math.max(0, inv - size + 1),
      sourceRight: inv,
      addedInversionsMin: inv === null || size === null ? null : Math.max(0, inv - Math.min(inv, size - 1)),
      addedInversionsMax: inv === null ? null : inv,
    },
    rolling: {
      dp: dp ? [...dp] : [],
      next: nextDp ? [...nextDp] : [],
      nextComputed: nextComputed ? [...nextComputed] : [],
    },
    rows: rows.map(rowSnapshot),
    witness: witness ? {
      digits: [...witness.digits],
      insertionOrder: witness.insertionOrder.map((entry) => ({ ...entry, permutation: [...entry.permutation] })),
      permutation: [...witness.permutation],
      inversionCount: witness.inversionCount,
      pairs: witness.pairs.map((pair) => [...pair]),
      valid: witness.valid,
    } : null,
    invariants: {
      canonicalResidue: window === null || (Number.isSafeInteger(window) && window >= 0 && window < K_INVERSE_PAIRS_629_MOD),
      windowRange: inv === null || size === null ? null : { left: Math.max(0, inv - size + 1), right: inv },
      writtenCellMatchesWindow: inv === null || !nextComputed || !nextComputed[inv] || nextDp[inv] === window,
      completedRowsBounded: rows.every((row) => row.values.every((value, index) => index <= row.upper || value === 0)),
      witnessValid: witness ? witness.valid && witness.inversionCount === requestedK : null,
    },
    counters: { ...counters },
    answer,
    final,
  });
  const emit = ({ line, event, phase, timing = "after", condition = null, title, note, final = false }) => {
    const view = snapshotView({ line, event, phase, timing, condition, final });
    steps.push({
      title,
      note,
      arr: view.rolling.next.length ? [...view.rolling.next] : [...view.rolling.dp],
      sub: (view.rolling.next.length ? view.rolling.next : view.rolling.dp).map((_, index) => `inv=${index}`),
      highlight: Number.isInteger(inv) ? [inv] : [],
      mark: view.witness ? view.witness.permutation.map((_, index) => index) : [],
      final,
      codeLines: [line],
      vars: [
        { name: "n", value: n },
        { name: "requested k", value: requestedK },
        { name: "effective k", value: effectiveK ?? "—" },
        { name: "size", value: size ?? "—" },
        { name: "inv", value: inv ?? "—" },
        { name: "window", value: window ?? "—" },
        { name: "answer", value: answer ?? "—" },
      ],
      inversePairs629View: view,
    });
  };

  emit({ line: 1, event: "bind-class", phase: "setup", title: localized("Bind Solution class", "Liên kết lớp Solution"), note: localized("The method counts permutations by size and inversion total.", "Method đếm permutation theo kích thước và tổng inversion.") });
  emit({ line: 2, event: "bind-method", phase: "setup", title: localized("Bind kInversePairs", "Liên kết kInversePairs"), note: localized("Input n and k produce one count modulo 1,000,000,007.", "Input n và k tạo một số đếm modulo 1.000.000.007.") });
  emit({ line: 3, event: "set-modulus", phase: "setup", title: localized("Set MOD = 1,000,000,007", "Đặt MOD = 1.000.000.007"), note: localized("Every rolling-window update is normalized into [0, MOD).", "Mọi cập nhật cửa sổ được chuẩn hóa vào [0, MOD).") });
  maximum = n * (n - 1) / 2;
  emit({ line: 4, event: "compute-maximum", phase: "setup", title: localized(`Maximum inversions = ${maximum}`, `Số inversion tối đa = ${maximum}`), note: localized("The descending permutation realizes one inversion for every pair.", "Permutation giảm dần tạo một inversion cho mỗi cặp.") });
  impossible = requestedK < 0 || requestedK > maximum;
  emit({ line: 5, event: impossible ? "feasibility-check-true" : "feasibility-check-false", phase: "setup", condition: { expression: `${requestedK} < 0 or ${requestedK} > ${maximum}`, result: impossible }, title: localized(`Impossible request? ${impossible}`, `Yêu cầu bất khả thi? ${impossible}`), note: impossible ? localized("No permutation can exceed the pair-count maximum.", "Không permutation nào vượt số cặp tối đa.") : localized("The requested inversion total is feasible.", "Tổng inversion yêu cầu là khả thi.") });
  if (impossible) {
    answer = 0;
    emit({ line: 6, event: "impossible-return", phase: "done", title: localized("Return 0", "Trả về 0"), note: localized("The source exits before allocating DP because the target is impossible.", "Mã nguồn thoát trước khi cấp phát DP vì target bất khả thi."), final: true });
    return { original: [n], k: requestedK, answer, witness: null, steps };
  }

  effectiveK = Math.min(requestedK, maximum - requestedK);
  reflected = effectiveK !== requestedK;
  emit({ line: 7, event: "fold-by-symmetry", phase: "setup", title: localized(`Effective k = ${effectiveK}${reflected ? " (reflected)" : ""}`, `k hiệu dụng = ${effectiveK}${reflected ? " (đối xứng)" : ""}`), note: localized("Complementing every value bijects k inversions with maximum−k inversions.", "Lấy phần bù mọi giá trị tạo song ánh giữa k inversion và maximum−k inversion.") });
  dp = Array(effectiveK + 1).fill(0);
  emit({ line: 8, event: "allocate-dp", phase: "setup", title: localized(`Allocate ${dp.length} DP column(s)`, `Cấp phát ${dp.length} cột DP`), note: localized("Only columns through the symmetry-folded target are needed.", "Chỉ cần các cột đến target đã gập đối xứng.") });
  dp[0] = 1;
  rows.push({ size: 0, upper: 0, values: [...dp], computed: dp.map((_, index) => index === 0) });
  emit({ line: 9, event: "seed-empty-permutation", phase: "setup", title: localized("dp[0] = 1", "dp[0] = 1"), note: localized("There is exactly one empty permutation with zero inversions.", "Có đúng một permutation rỗng với 0 inversion.") });

  for (let currentSize = 1; currentSize <= n; currentSize++) {
    size = currentSize;
    inv = null;
    counters.sizeIterations++;
    emit({ line: 10, event: "select-size", phase: "row", timing: "before", condition: { expression: `${size} <= ${n}`, result: true }, title: localized(`Build size ${size}`, `Xây dựng size ${size}`), note: localized(`Insert largest value ${size}; it can add 0..${size - 1} inversions.`, `Chèn giá trị lớn nhất ${size}; nó có thể thêm 0..${size - 1} inversion.`) });
    nextDp = Array(effectiveK + 1).fill(0);
    nextComputed = Array(effectiveK + 1).fill(false);
    emit({ line: 11, event: "allocate-next-row", phase: "row", title: localized("Allocate zeroed next_dp", "Cấp phát next_dp bằng 0"), note: localized("The previous row remains immutable while this row is built.", "Hàng trước giữ nguyên trong khi xây hàng này.") });
    window = 0;
    windowState = { left: 0, right: null, before: 0, incomingIndex: null, incomingValue: null, afterAdd: 0, evict: null, outgoingIndex: null, outgoingValue: null, afterRemove: 0 };
    emit({ line: 12, event: "reset-window", phase: "row", title: localized("Reset window = 0", "Đặt lại window = 0"), note: localized("The bounded predecessor sum starts empty for each size.", "Tổng predecessor có biên bắt đầu rỗng cho mỗi size.") });
    upper = Math.min(effectiveK, size * (size - 1) / 2);
    emit({ line: 13, event: "compute-row-upper", phase: "row", title: localized(`Row support ends at ${upper}`, `Support hàng kết thúc tại ${upper}`), note: localized(`A size-${size} permutation cannot have more than ${size * (size - 1) / 2} inversions.`, `Permutation size-${size} không thể có hơn ${size * (size - 1) / 2} inversion.`) });

    for (let currentInv = 0; currentInv <= upper; currentInv++) {
      inv = currentInv;
      counters.cellIterations++;
      windowState = { left: Math.max(0, inv - size + 1), right: inv, before: window, incomingIndex: inv, incomingValue: dp[inv], afterAdd: null, evict: null, outgoingIndex: null, outgoingValue: null, afterRemove: null };
      emit({ line: 14, event: "select-inversion-total", phase: "cell", timing: "before", condition: { expression: `${inv} <= ${upper}`, result: true }, title: localized(`Compute D(${size}, ${inv})`, `Tính D(${size}, ${inv})`), note: localized(`Legal previous inversion columns are ${windowState.left}..${inv}.`, `Các cột inversion trước hợp lệ là ${windowState.left}..${inv}.`) });
      const beforeAdd = window;
      window = (window + dp[inv]) % K_INVERSE_PAIRS_629_MOD;
      counters.windowAdds++;
      windowState.afterAdd = window;
      windowState.afterRemove = window;
      emit({ line: 15, event: "add-window-right", phase: "cell", title: localized(`Add dp[${inv}]=${dp[inv]} → ${window}`, `Cộng dp[${inv}]=${dp[inv]} → ${window}`), note: localized(`Window residue changes from ${beforeAdd} to ${window}.`, `Residue cửa sổ đổi từ ${beforeAdd} thành ${window}.`) });
      const evict = inv >= size;
      counters.evictionChecks++;
      windowState.evict = evict;
      emit({ line: 16, event: evict ? "eviction-check-true" : "eviction-check-false", phase: "cell", condition: { expression: `${inv} >= ${size}`, result: evict }, title: localized(`Expired predecessor? ${evict}`, `Có predecessor hết hạn? ${evict}`), note: evict ? localized(`dp[${inv - size}] lies just left of the legal window and must leave.`, `dp[${inv - size}] nằm ngay trái cửa sổ hợp lệ và phải rời đi.`) : localized("The window has not reached size entries yet.", "Cửa sổ chưa đạt size phần tử.") });
      if (evict) {
        const outgoingIndex = inv - size;
        const outgoingValue = dp[outgoingIndex];
        window = (window - outgoingValue + K_INVERSE_PAIRS_629_MOD) % K_INVERSE_PAIRS_629_MOD;
        counters.evictions++;
        windowState.outgoingIndex = outgoingIndex;
        windowState.outgoingValue = outgoingValue;
        windowState.afterRemove = window;
        emit({ line: 17, event: "remove-window-left", phase: "cell", title: localized(`Remove dp[${outgoingIndex}]=${outgoingValue} → ${window}`, `Trừ dp[${outgoingIndex}]=${outgoingValue} → ${window}`), note: localized("Adding MOD before JavaScript remainder matches Python's non-negative modulo.", "Cộng MOD trước phép dư JavaScript để khớp modulo không âm của Python.") });
      }
      nextDp[inv] = window;
      nextComputed[inv] = true;
      counters.cellWrites++;
      emit({ line: 18, event: "write-next-cell", phase: "cell", title: localized(`next_dp[${inv}] = ${window}`, `next_dp[${inv}] = ${window}`), note: localized(`This equals the bounded sum of previous columns ${windowState.left}..${inv}.`, `Giá trị này bằng tổng có biên các cột trước ${windowState.left}..${inv}.`) });
    }
    inv = null;
    emit({ line: 14, event: "inversion-loop-complete", phase: "row", timing: "before", condition: { expression: `${upper + 1} <= ${upper}`, result: false }, title: localized(`Size-${size} row complete`, `Hàng size-${size} hoàn tất`), note: localized(`Computed ${upper + 1} reachable column(s); later columns remain mathematically impossible.`, `Đã tính ${upper + 1} cột tới được; các cột sau bất khả thi về mặt toán học.`) });
    dp = [...nextDp];
    rows.push({ size, upper, values: [...dp], computed: dp.map((_, index) => index <= upper) });
    counters.rowCommits++;
    emit({ line: 19, event: "commit-row", phase: "row", title: localized(`Commit size-${size} row`, `Commit hàng size-${size}`), note: localized("Only now does dp replace the immutable previous row.", "Chỉ lúc này dp mới thay thế hàng trước bất biến.") });
  }
  size = null;
  upper = null;
  nextDp = null;
  nextComputed = null;
  window = null;
  emit({ line: 10, event: "size-loop-complete", phase: "row", timing: "before", condition: { expression: `${n + 1} <= ${n}`, result: false }, title: localized("All sizes complete", "Mọi size hoàn tất"), note: localized(`The final rolling row counts permutations of 1..${n}.`, `Hàng rolling cuối đếm permutation của 1..${n}.`) });
  answer = dp[effectiveK];
  emit({ line: 20, event: "capture-answer", phase: "done", title: localized(`answer = ${answer}`, `answer = ${answer}`), note: localized(reflected ? `Symmetry maps effective k=${effectiveK} back to requested k=${requestedK}.` : `Column k=${requestedK} is the requested count.`, reflected ? `Đối xứng ánh xạ k hiệu dụng=${effectiveK} về k yêu cầu=${requestedK}.` : `Cột k=${requestedK} là số đếm yêu cầu.`) });
  witness = buildInverseWitness629(n, requestedK);
  emit({ line: 21, event: "final-return", phase: "done", title: localized(`Return ${answer}`, `Trả về ${answer}`), note: localized(`Witness [${witness.permutation.join(", ")}] has exactly ${requestedK} inversions; it does not alter the count.`, `Witness [${witness.permutation.join(", ")}] có đúng ${requestedK} inversion; nó không thay đổi số đếm.`), final: true });

  return { original: [n], k: requestedK, answer, witness, steps };
}

module.exports = {
  629: {
    id: 629,
    difficulty: "hard",
    slug: "k-inverse-pairs-array",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "prefix-sum", vi: "Tổng tiền tố", en: "Prefix Sum" },
      { key: "sliding-window", vi: "Cửa sổ trượt", en: "Sliding Window" },
    ],
    title: { vi: "K Inverse Pairs Array", en: "K Inverse Pairs Array" },
    titleVi: { vi: "Đếm permutation có đúng k inversion", en: "Count permutations with exactly k inversions" },
    statement: {
      vi: "Cho n và k, đếm số permutation của [1..n] có đúng k cặp nghịch thế, modulo 10^9+7. Visualizer hỗ trợ 1≤n≤8 và 0≤k≤28; k vượt maximum được trace tới nhánh trả 0.",
      en: "Given n and k, count permutations of [1..n] with exactly k inverse pairs modulo 10^9+7. The visualizer supports 1≤n≤8 and 0≤k≤28; k above the maximum is traced to the zero-return branch.",
    },
    defaultInput: [4],
    inputKind: "positive",
    inputLabel: { vi: "n (1..8)", en: "n (1..8)" },
    singleInput: true,
    maxInput: K_INVERSE_PAIRS_629_MAX_N,
    extraParams: [{ key: "k", type: "number", min: 0, max: K_INVERSE_PAIRS_629_MAX_K, default: 5, label: { vi: "k (0..28)", en: "k (0..28)" } }],
    debugMode: "line-by-line",
    parseKInversePairs629Input,
    approach: [
      { vi: "D(size,inv) cộng các trạng thái size−1 khi số inversion mới do phần tử lớn nhất tạo nằm trong [0,size−1].", en: "D(size,inv) sums size−1 states where inversions added by the new largest value lie in [0,size−1]." },
      { vi: "Giữ tổng cửa sổ: thêm dp[inv], và khi inv≥size thì loại dp[inv−size], giúp mỗi cell O(1).", en: "Maintain a window sum: add dp[inv], and when inv≥size evict dp[inv−size], making each cell O(1)." },
      { vi: "Đối xứng D(n,k)=D(n,maximum−k) thu hẹp số cột; mọi residue được chuẩn hóa vào [0,MOD).", en: "Symmetry D(n,k)=D(n,maximum−k) reduces columns; every residue is normalized into [0,MOD)." },
      { vi: "Sidecar inversion digits dựng một permutation cụ thể có đúng k inversion mà không thay đổi answer DP.", en: "Sidecar inversion digits construct one concrete permutation with exactly k inversions without changing the DP answer." },
    ],
    complexity: {
      time: "O(n·min(k, maximum−k))",
      space: "O(min(k, maximum−k))",
      note: { vi: "Mã nguồn dùng hai hàng rolling; visualization giữ lịch sử hàng và witness để giảng giải.", en: "The source uses two rolling rows; the visualization retains row history and a witness for teaching." },
    },
    code: K_INVERSE_PAIRS_629_SOURCE,
    liveArgs: (input, params) => {
      const value = parseKInversePairs629Input(input, params);
      return [value.n, value.k];
    },
    builder: buildSteps629Exact,
  },
};
