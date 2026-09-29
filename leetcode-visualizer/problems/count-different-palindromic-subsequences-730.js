const COUNT_PALINDROMIC_SUBSEQUENCES_730_MOD = 1_000_000_007;
const COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH = 10;
const COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_FRAMES = 1_200;
const COUNT_PALINDROMIC_SUBSEQUENCES_730_EVIDENCE_LIMIT =
  (1 << COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH) - 1;
const COUNT_PALINDROMIC_SUBSEQUENCES_730_ALPHABET = Object.freeze(["a", "b", "c", "d"]);
const COUNT_PALINDROMIC_SUBSEQUENCES_730_SOURCE = Object.freeze([
  "class Solution:",
  "    def countPalindromicSubsequences(self, s: str) -> int:",
  "        MOD = 10**9 + 7",
  "        n = len(s)",
  "        dp = [[0] * n for _ in range(n)]",
  "        for i in range(n - 1, -1, -1):",
  "            dp[i][i] = 1",
  "            for j in range(i + 1, n):",
  "                if s[i] == s[j]:",
  "                    low, high = i + 1, j - 1",
  "                    while low <= high and s[low] != s[i]:",
  "                        low += 1",
  "                    while low <= high and s[high] != s[j]:",
  "                        high -= 1",
  "                    middle = dp[i + 1][j - 1]",
  "                    if low > high:",
  "                        dp[i][j] = (2 * middle + 2) % MOD",
  "                    elif low == high:",
  "                        dp[i][j] = (2 * middle + 1) % MOD",
  "                    else:",
  "                        dp[i][j] = (2 * middle - dp[low + 1][high - 1]) % MOD",
  "                else:",
  "                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1]) % MOD",
  "        return dp[0][n - 1]",
]);

function parseCountPalindromicSubsequences730Input(input) {
  if (typeof input !== "string") {
    throw new TypeError("Count Different Palindromic Subsequences input must be a string.");
  }
  if (!/^[a-d]+$/.test(input)) {
    throw new TypeError(
      "Count Different Palindromic Subsequences input must contain only a, b, c, and d.",
    );
  }
  if (input.length < 1 || input.length > COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH) {
    throw new RangeError(
      `Count Different Palindromic Subsequences visualization supports 1 to ${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH} characters.`,
    );
  }
  return input;
}

function deepFreezeCountPalindromicSubsequences730View(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function canonicalModulo730(value) {
  return ((value % COUNT_PALINDROMIC_SUBSEQUENCES_730_MOD)
    + COUNT_PALINDROMIC_SUBSEQUENCES_730_MOD)
    % COUNT_PALINDROMIC_SUBSEQUENCES_730_MOD;
}

function compareIndexTuples730(left, right) {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index++) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.length - right.length;
}

function comparePalindromeEvidence730(left, right) {
  if (left.palindrome < right.palindrome) return -1;
  if (left.palindrome > right.palindrome) return 1;
  return compareIndexTuples730(left.indexTuple, right.indexTuple);
}

function copyEvidenceEntry730(entry) {
  return {
    palindrome: entry.palindrome,
    value: entry.value,
    outerChar: entry.outerChar,
    length: entry.length,
    mask: entry.mask,
    localMask: entry.localMask,
    absoluteMask: entry.absoluteMask,
    indexTuple: [...entry.indexTuple],
    indices: [...entry.indices],
  };
}

function copyEvidenceGroup730(group) {
  return {
    outerChar: group.outerChar,
    count: group.count,
    palindromes: [...group.palindromes],
    entries: group.entries.map(copyEvidenceEntry730),
  };
}

function copyCellEvidence730(evidence) {
  return evidence ? {
    interval: [...evidence.interval],
    substring: evidence.substring,
    method: evidence.method,
    representativeRule: evidence.representativeRule,
    maskEnumeration: { ...evidence.maskEnumeration },
    dpValue: evidence.dpValue,
    count: evidence.count,
    distinctCount: evidence.distinctCount,
    bounded: evidence.bounded,
    entryLimit: evidence.entryLimit,
    shownCount: evidence.shownCount,
    omittedCount: evidence.omittedCount,
    truncated: evidence.truncated,
    entries: evidence.entries.map(copyEvidenceEntry730),
    groups: evidence.groups.map(copyEvidenceGroup730),
    assertions: { ...evidence.assertions },
  } : null;
}

function buildCellEvidence730(s, start, end, dpValue) {
  const width = end - start + 1;
  const lastLocalMask = (1 << width) - 1;
  const smallestByPalindrome = new Map();

  for (let localMask = 1; localMask <= lastLocalMask; localMask++) {
    const indexTuple = [];
    let palindrome = "";
    let absoluteMask = 0;
    for (let offset = 0; offset < width; offset++) {
      if ((localMask & (1 << offset)) === 0) continue;
      const absoluteIndex = start + offset;
      indexTuple.push(absoluteIndex);
      palindrome += s[absoluteIndex];
      absoluteMask |= 1 << absoluteIndex;
    }

    let isPalindrome = true;
    for (let left = 0, right = palindrome.length - 1; left < right; left++, right--) {
      if (palindrome[left] !== palindrome[right]) {
        isPalindrome = false;
        break;
      }
    }
    if (!isPalindrome) continue;

    const candidate = {
      palindrome,
      value: palindrome,
      outerChar: palindrome[0],
      length: palindrome.length,
      mask: absoluteMask,
      localMask,
      absoluteMask,
      indexTuple,
      indices: [...indexTuple],
    };
    const incumbent = smallestByPalindrome.get(palindrome);
    if (!incumbent || compareIndexTuples730(candidate.indexTuple, incumbent.indexTuple) < 0) {
      smallestByPalindrome.set(palindrome, candidate);
    }
  }

  const entries = [...smallestByPalindrome.values()].sort(comparePalindromeEvidence730);
  const groups = COUNT_PALINDROMIC_SUBSEQUENCES_730_ALPHABET.map((outerChar) => {
    const matching = entries.filter((entry) => entry.outerChar === outerChar);
    return {
      outerChar,
      count: matching.length,
      palindromes: matching.map((entry) => entry.palindrome),
      entries: matching.map(copyEvidenceEntry730),
    };
  });

  const representativesValid = entries.every((entry) => {
    const reconstructed = entry.indexTuple.map((index) => s[index]).join("");
    const reconstructedMask = entry.indexTuple.reduce((mask, index) => mask | (1 << index), 0);
    const indicesAreAbsolute = entry.indexTuple.every(
      (index, tupleIndex) => Number.isInteger(index)
        && index >= start
        && index <= end
        && (tupleIndex === 0 || entry.indexTuple[tupleIndex - 1] < index),
    );
    return reconstructed === entry.palindrome
      && reconstructed === [...reconstructed].reverse().join("")
      && reconstructedMask === entry.absoluteMask
      && entry.mask === entry.absoluteMask
      && indicesAreAbsolute;
  });
  const groupedCount = groups.reduce((total, group) => total + group.count, 0);
  const countMatchesDp = entries.length === dpValue;
  const withinBound = entries.length <= lastLocalMask
    && entries.length <= COUNT_PALINDROMIC_SUBSEQUENCES_730_EVIDENCE_LIMIT;
  if (!countMatchesDp) {
    throw new Error(
      `#730 evidence count ${entries.length} does not match dp[${start}][${end}] = ${dpValue}.`,
    );
  }
  if (!representativesValid || groupedCount !== entries.length || !withinBound) {
    throw new Error(`#730 evidence invariant failed for interval [${start}, ${end}].`);
  }

  return {
    interval: [start, end],
    substring: s.slice(start, end + 1),
    method: "enumerate every non-empty local subsequence mask",
    representativeRule: "lexicographically smallest absolute index tuple",
    maskEnumeration: {
      firstLocalMask: 1,
      lastLocalMask,
      masksExamined: lastLocalMask,
      localWidth: width,
    },
    dpValue,
    count: entries.length,
    distinctCount: entries.length,
    bounded: true,
    entryLimit: COUNT_PALINDROMIC_SUBSEQUENCES_730_EVIDENCE_LIMIT,
    shownCount: entries.length,
    omittedCount: 0,
    truncated: false,
    entries: entries.map(copyEvidenceEntry730),
    groups,
    assertions: {
      countMatchesDp,
      groupedCountMatches: groupedCount === entries.length,
      representativesAreValid: representativesValid,
      indexTuplesAreAbsolute: representativesValid,
      lexicographicallySmallestRepresentatives: true,
      withinBound,
    },
  };
}

function buildFinalEvidence730(rootEvidence, answer) {
  if (!rootEvidence || rootEvidence.count !== answer) {
    throw new Error("#730 final evidence does not match the root DP answer.");
  }
  const groups = rootEvidence.groups.map(copyEvidenceGroup730);
  const groupedCount = groups.reduce((total, group) => total + group.count, 0);
  if (groupedCount !== answer) {
    throw new Error("#730 final grouped evidence does not match the answer.");
  }
  return {
    strategy: "complete mask enumeration, grouped by outer character",
    representativeRule: rootEvidence.representativeRule,
    rootInterval: [...rootEvidence.interval],
    count: answer,
    distinctCount: answer,
    bounded: true,
    entryLimit: COUNT_PALINDROMIC_SUBSEQUENCES_730_EVIDENCE_LIMIT,
    shownCount: rootEvidence.entries.length,
    omittedCount: 0,
    truncated: false,
    masksExamined: rootEvidence.maskEnumeration.masksExamined,
    entries: rootEvidence.entries.map(copyEvidenceEntry730),
    groups,
    assertions: {
      countMatchesAnswer: rootEvidence.count === answer,
      groupedCountMatches: groupedCount === answer,
      completeWithinVisualizationBound: rootEvidence.entries.length
        <= COUNT_PALINDROMIC_SUBSEQUENCES_730_EVIDENCE_LIMIT,
      deterministicRepresentatives: true,
    },
  };
}

function buildSteps730Exact(input) {
  const s = parseCountPalindromicSubsequences730Input(input);
  const n = s.length;
  const steps = [];
  const localized = (en, vi) => ({ en, vi });
  let dp = [];
  let computedMask = [];
  let evidenceTable = [];
  let dpAllocated = false;
  let i = null;
  let j = null;
  let low = null;
  let high = null;
  let endpointEqual = null;
  let dependencyIntervals = [];
  let answer = null;
  let finalEvidence = null;
  let scan = {
    target: null,
    lowStart: null,
    highStart: null,
    lowCondition: null,
    highCondition: null,
  };
  let recurrence = {
    branch: "idle",
    formula: null,
    middleValue: null,
    duplicateValue: null,
    rawValue: null,
    value: null,
  };
  const counters = {
    frames: 0,
    iLoopTrue: 0,
    iLoopFalse: 0,
    jLoopTrue: 0,
    jLoopFalse: 0,
    diagonalWrites: 0,
    endpointChecks: 0,
    equalEndpoints: 0,
    unequalEndpoints: 0,
    lowScanChecks: 0,
    lowScanAdvances: 0,
    highScanChecks: 0,
    highScanRetreats: 0,
    zeroInnerMatchBranches: 0,
    oneInnerMatchBranches: 0,
    multipleInnerMatchBranches: 0,
    recurrenceWrites: 0,
    evidenceBuilds: 0,
    evidenceMasksExamined: 0,
  };

  const isCell = (row, column) => Number.isInteger(row)
    && Number.isInteger(column)
    && row >= 0
    && column >= row
    && column < n;
  const copyDependency = (dependency) => ({
    role: dependency.role,
    interval: [...dependency.interval],
    start: dependency.start,
    end: dependency.end,
    value: dependency.value,
    empty: dependency.empty,
  });
  const dependency = (role, start, end, value, empty = false) => ({
    role,
    interval: [start, end],
    start,
    end,
    value,
    empty,
  });
  const resetCellState = (branch = "idle") => {
    low = null;
    high = null;
    endpointEqual = null;
    dependencyIntervals = [];
    scan = {
      target: null,
      lowStart: null,
      highStart: null,
      lowCondition: null,
      highCondition: null,
    };
    recurrence = {
      branch,
      formula: null,
      middleValue: null,
      duplicateValue: null,
      rawValue: null,
      value: null,
    };
  };
  const commitCell = (row, column, rawValue) => {
    const value = canonicalModulo730(rawValue);
    dp[row][column] = value;
    computedMask[row][column] = true;
    const evidence = buildCellEvidence730(s, row, column, value);
    evidenceTable[row][column] = evidence;
    recurrence.rawValue = rawValue;
    recurrence.value = value;
    counters.evidenceBuilds++;
    counters.evidenceMasksExamined += evidence.maskEnumeration.masksExamined;
    return value;
  };

  const snapshotView = ({ line, event, phase, timing, condition, final }) => {
    const tablesAreSquare = !dpAllocated || (
      dp.length === n
      && computedMask.length === n
      && evidenceTable.length === n
      && dp.every((row) => row.length === n)
      && computedMask.every((row) => row.length === n)
      && evidenceTable.every((row) => row.length === n)
    );
    const lowerTriangleUnused = !dpAllocated || dp.every((row, rowIndex) => row.every(
      (value, columnIndex) => columnIndex >= rowIndex
        || (value === 0 && computedMask[rowIndex][columnIndex] === false
          && evidenceTable[rowIndex][columnIndex] === null),
    ));
    const uncomputedCellsAreZero = !dpAllocated || computedMask.every((row, rowIndex) => row.every(
      (isComputed, columnIndex) => isComputed || dp[rowIndex][columnIndex] === 0,
    ));
    const computedMaskMatchesEvidence = !dpAllocated || computedMask.every(
      (row, rowIndex) => row.every(
        (isComputed, columnIndex) => isComputed === (evidenceTable[rowIndex][columnIndex] !== null),
      ),
    );
    const evidenceCountsMatchDp = !dpAllocated || evidenceTable.every(
      (row, rowIndex) => row.every(
        (evidence, columnIndex) => evidence === null
          || (evidence.count === dp[rowIndex][columnIndex]
            && evidence.dpValue === dp[rowIndex][columnIndex]
            && evidence.assertions.countMatchesDp),
      ),
    );
    const evidenceIsBounded = !dpAllocated || evidenceTable.every((row) => row.every(
      (evidence) => evidence === null || (
        evidence.bounded
        && !evidence.truncated
        && evidence.omittedCount === 0
        && evidence.count <= evidence.entryLimit
        && evidence.assertions.withinBound
      ),
    ));
    const canonicalResidues = !dpAllocated || dp.every((row, rowIndex) => row.every(
      (value, columnIndex) => !computedMask[rowIndex][columnIndex]
        || (Number.isSafeInteger(value)
          && value >= 0
          && value < COUNT_PALINDROMIC_SUBSEQUENCES_730_MOD),
    ));
    const dependenciesComputed = dependencyIntervals.every((item) => item.empty || (
      isCell(item.start, item.end) && computedMask[item.start][item.end]
    ));
    const activeCell = isCell(i, j);
    const activeEvidence = activeCell ? evidenceTable[i][j] : null;
    const activeCellEvidenceMatches = activeEvidence === null
      ? null
      : activeEvidence.count === dp[i][j] && computedMask[i][j];

    return deepFreezeCountPalindromicSubsequences730View({
      version: 1,
      problemId: 730,
      source: { line, text: COUNT_PALINDROMIC_SUBSEQUENCES_730_SOURCE[line - 1] },
      event,
      phase,
      timing,
      condition: condition && typeof condition === "object"
        ? { expression: condition.expression, result: condition.result }
        : { expression: null, result: null },
      input: {
        s,
        length: n,
        alphabet: [...COUNT_PALINDROMIC_SUBSEQUENCES_730_ALPHABET],
        modulus: COUNT_PALINDROMIC_SUBSEQUENCES_730_MOD,
        limits: {
          minLength: 1,
          maxLength: COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH,
          maxFrames: COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_FRAMES,
          maxEvidenceEntries: COUNT_PALINDROMIC_SUBSEQUENCES_730_EVIDENCE_LIMIT,
        },
      },
      cursors: { i, j, low, high },
      interval: activeCell ? [i, j] : null,
      endpoint: {
        leftChar: activeCell ? s[i] : null,
        rightChar: activeCell ? s[j] : null,
        equal: endpointEqual,
      },
      scan: { ...scan, low, high },
      recurrence: { ...recurrence },
      dependencyIntervals: dependencyIntervals.map(copyDependency),
      dpAllocated,
      dp: dp.map((row) => [...row]),
      computedMask: computedMask.map((row) => [...row]),
      evidenceTable: evidenceTable.map((row) => row.map(copyCellEvidence730)),
      activeEvidence: copyCellEvidence730(activeEvidence),
      finalEvidence: finalEvidence ? {
        ...finalEvidence,
        rootInterval: [...finalEvidence.rootInterval],
        entries: finalEvidence.entries.map(copyEvidenceEntry730),
        groups: finalEvidence.groups.map(copyEvidenceGroup730),
        assertions: { ...finalEvidence.assertions },
      } : null,
      counters: { ...counters },
      invariants: {
        definition: "dp[i][j] counts distinct non-empty palindromic subsequence values in s[i..j]",
        sourceEventHasSingletonLine: Number.isInteger(line)
          && line >= 1
          && line <= COUNT_PALINDROMIC_SUBSEQUENCES_730_SOURCE.length,
        tablesAreSquare,
        lowerTriangleUnused,
        uncomputedCellsAreZero,
        computedMaskMatchesEvidence,
        evidenceCountsMatchDp,
        evidenceIsBounded,
        canonicalResidues,
        dependenciesComputed,
        activeCellEvidenceMatches,
        framesWithinLimit: counters.frames <= COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_FRAMES,
        answerMatchesRoot: answer === null ? null : computedMask[0][n - 1]
          && answer === dp[0][n - 1],
        finalEvidenceMatchesAnswer: finalEvidence === null ? null
          : finalEvidence.count === answer && finalEvidence.assertions.countMatchesAnswer,
      },
      answer,
      final,
    });
  };

  const emit = ({
    line,
    event,
    phase,
    timing = "after",
    condition = null,
    title,
    note,
    final = false,
  }) => {
    if (steps.length >= COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_FRAMES) {
      throw new Error(
        `#730 frame invariant exceeded ${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_FRAMES} frames.`,
      );
    }
    counters.frames++;
    const view = snapshotView({ line, event, phase, timing, condition, final });
    const activeCell = view.interval ? [...view.interval] : final ? [0, n - 1] : null;
    const pathCells = view.dependencyIntervals
      .filter((item) => !item.empty && isCell(item.start, item.end))
      .map((item) => [...item.interval]);
    const displayDp = view.dp.map((row, rowIndex) => row.map((value, columnIndex) => {
      if (columnIndex < rowIndex) return "";
      return view.computedMask[rowIndex][columnIndex] ? String(value) : "·";
    }));

    steps.push({
      title,
      note,
      arr: s.split(""),
      highlight: activeCell ? [...new Set(activeCell)] : [],
      mark: Number.isInteger(view.cursors.low) && Number.isInteger(view.cursors.high)
        ? [...new Set([view.cursors.low, view.cursors.high])]
        : [],
      grid: {
        dp: displayDp,
        text1: s.split("").slice(1),
        text2: s.split("").slice(1),
        hlCell: activeCell,
        pathCells,
        largeCells: true,
        caption: activeCell
          ? `dp[${activeCell[0]}][${activeCell[1]}] counts distinct palindromes in "${s.slice(activeCell[0], activeCell[1] + 1)}"`
          : `Distinct-palindromic-subsequence interval DP for "${s}"`,
      },
      final,
      codeLines: [line],
      vars: [
        { name: "s", value: s },
        { name: "i", value: view.cursors.i ?? "—" },
        { name: "j", value: view.cursors.j ?? "—" },
        { name: "low", value: view.cursors.low ?? "—" },
        { name: "high", value: view.cursors.high ?? "—" },
        { name: "branch", value: view.recurrence.branch },
        { name: "answer", value: view.answer ?? "—" },
      ],
      countPalindromicSubsequences730View: view,
    });
  };

  emit({
    line: 1,
    event: "bind-class",
    phase: "setup",
    title: localized("Bind Solution class", "Liên kết lớp Solution"),
    note: localized(
      "The class exposes the exact equal-endpoint interval-DP source below.",
      "Lớp chứa đúng mã nguồn DP đoạn theo hai đầu bằng nhau bên dưới.",
    ),
  });
  emit({
    line: 2,
    event: "bind-method",
    phase: "setup",
    title: localized("Bind countPalindromicSubsequences", "Liên kết countPalindromicSubsequences"),
    note: localized(
      "The strict parser has already accepted one to ten characters from a through d.",
      "Bộ phân tích nghiêm ngặt đã nhận từ một đến mười ký tự a đến d.",
    ),
  });
  emit({
    line: 3,
    event: "set-modulus",
    phase: "setup",
    title: localized("Set MOD = 1,000,000,007", "Đặt MOD = 1.000.000.007"),
    note: localized(
      "Every recurrence write is normalized to the canonical non-negative residue.",
      "Mọi lần ghi công thức được chuẩn hóa thành số dư không âm chính tắc.",
    ),
  });
  emit({
    line: 4,
    event: "set-length",
    phase: "setup",
    title: localized(`Set n = ${n}`, `Đặt n = ${n}`),
    note: localized(
      "All evidence uses absolute indices in this original string.",
      "Mọi bằng chứng dùng chỉ số tuyệt đối trong chuỗi gốc này.",
    ),
  });

  dp = Array.from({ length: n }, () => Array(n).fill(0));
  computedMask = Array.from({ length: n }, () => Array(n).fill(false));
  evidenceTable = Array.from({ length: n }, () => Array(n).fill(null));
  dpAllocated = true;
  emit({
    line: 5,
    event: "allocate-dp",
    phase: "setup",
    title: localized(`Allocate a ${n}×${n} DP table`, `Cấp phát bảng DP ${n}×${n}`),
    note: localized(
      "The computed mask distinguishes unwritten zeroes; evidence is attached only to written cells.",
      "Mask computed phân biệt số 0 chưa ghi; bằng chứng chỉ gắn với ô đã ghi.",
    ),
  });

  for (let currentI = n - 1; currentI >= 0; currentI--) {
    i = currentI;
    j = null;
    resetCellState("i-loop");
    counters.iLoopTrue++;
    emit({
      line: 6,
      event: "i-loop-true",
      phase: "fill",
      timing: "before",
      condition: { expression: `${i} >= 0`, result: true },
      title: localized(`Start row i = ${i}`, `Bắt đầu hàng i = ${i}`),
      note: localized(
        "Descending i makes every interval with a larger left endpoint available first.",
        "Duyệt i giảm dần giúp mọi đoạn có đầu trái lớn hơn sẵn sàng trước.",
      ),
    });

    j = i;
    recurrence.branch = "diagonal";
    recurrence.formula = "1";
    commitCell(i, i, 1);
    counters.diagonalWrites++;
    emit({
      line: 7,
      event: "write-diagonal",
      phase: "fill",
      title: localized(`dp[${i}][${i}] = 1`, `dp[${i}][${i}] = 1`),
      note: localized(
        `The singleton '${s[i]}' is the only non-empty subsequence of this cell.`,
        `Ký tự đơn '${s[i]}' là subsequence không rỗng duy nhất của ô này.`,
      ),
    });

    for (let currentJ = i + 1; currentJ < n; currentJ++) {
      j = currentJ;
      resetCellState("j-loop");
      counters.jLoopTrue++;
      emit({
        line: 8,
        event: "j-loop-true",
        phase: "fill",
        timing: "before",
        condition: { expression: `${j} < ${n}`, result: true },
        title: localized(`Open interval [${i}, ${j}]`, `Mở đoạn [${i}, ${j}]`),
        note: localized(
          `Compute the distinct values inside "${s.slice(i, j + 1)}".`,
          `Tính các giá trị khác nhau trong "${s.slice(i, j + 1)}".`,
        ),
      });

      endpointEqual = s[i] === s[j];
      recurrence.branch = endpointEqual ? "equal-endpoints-pending" : "unequal-endpoints-pending";
      counters.endpointChecks++;
      if (endpointEqual) counters.equalEndpoints++;
      else counters.unequalEndpoints++;
      emit({
        line: 9,
        event: endpointEqual ? "endpoint-condition-true" : "endpoint-condition-false",
        phase: "recurrence",
        condition: { expression: `s[${i}] == s[${j}]`, result: endpointEqual },
        title: localized(
          endpointEqual
            ? `Endpoints both equal '${s[i]}'`
            : `Endpoints '${s[i]}' and '${s[j]}' differ`,
          endpointEqual
            ? `Hai đầu đều là '${s[i]}'`
            : `Hai đầu '${s[i]}' và '${s[j]}' khác nhau`,
        ),
        note: endpointEqual
          ? localized(
            "Scan the interior for duplicate copies of the endpoint character.",
            "Quét phần trong để tìm bản sao của ký tự hai đầu.",
          )
          : localized(
            "Use inclusion-exclusion over the intervals that drop one endpoint.",
            "Dùng bao hàm-loại trừ trên hai đoạn bỏ một đầu.",
          ),
      });

      if (endpointEqual) {
        low = i + 1;
        high = j - 1;
        scan = {
          target: s[i],
          lowStart: low,
          highStart: high,
          lowCondition: null,
          highCondition: null,
        };
        recurrence.branch = "scan-inner-matches";
        emit({
          line: 10,
          event: "initialize-inner-scan",
          phase: "scan",
          title: localized(
            `Initialize low = ${low}, high = ${high}`,
            `Khởi tạo low = ${low}, high = ${high}`,
          ),
          note: localized(
            `The scan seeks interior '${s[i]}' occurrences only.`,
            `Phép quét chỉ tìm ký tự '${s[i]}' ở phần trong.`,
          ),
        });

        while (true) {
          const shouldAdvanceLow = low <= high && s[low] !== s[i];
          scan.lowCondition = shouldAdvanceLow;
          counters.lowScanChecks++;
          emit({
            line: 11,
            event: shouldAdvanceLow ? "low-scan-condition-true" : "low-scan-condition-false",
            phase: "scan",
            timing: "before",
            condition: {
              expression: `${low} <= ${high} and s[${low}] != '${s[i]}'`,
              result: shouldAdvanceLow,
            },
            title: localized(
              shouldAdvanceLow ? `Skip low index ${low}` : `Stop low scan at ${low}`,
              shouldAdvanceLow ? `Bỏ qua chỉ số low ${low}` : `Dừng quét low tại ${low}`,
            ),
            note: shouldAdvanceLow
              ? localized(
                `s[${low}]='${s[low]}' is not the endpoint character.`,
                `s[${low}]='${s[low]}' không phải ký tự hai đầu.`,
              )
              : localized(
                low <= high
                  ? `low found the first interior '${s[i]}' at index ${low}.`
                  : "No interior endpoint character remains in the scan range.",
                low <= high
                  ? `low tìm thấy '${s[i]}' đầu tiên bên trong tại chỉ số ${low}.`
                  : "Không còn ký tự hai đầu nào trong phạm vi quét.",
              ),
          });
          if (!shouldAdvanceLow) break;
          low++;
          counters.lowScanAdvances++;
          emit({
            line: 12,
            event: "advance-low",
            phase: "scan",
            title: localized(`Advance low to ${low}`, `Tăng low thành ${low}`),
            note: localized(
              "The next condition frame re-evaluates the literal while guard.",
              "Frame điều kiện kế tiếp đánh giá lại đúng guard while.",
            ),
          });
        }

        while (true) {
          const shouldRetreatHigh = low <= high && s[high] !== s[j];
          scan.highCondition = shouldRetreatHigh;
          counters.highScanChecks++;
          emit({
            line: 13,
            event: shouldRetreatHigh ? "high-scan-condition-true" : "high-scan-condition-false",
            phase: "scan",
            timing: "before",
            condition: {
              expression: `${low} <= ${high} and s[${high}] != '${s[j]}'`,
              result: shouldRetreatHigh,
            },
            title: localized(
              shouldRetreatHigh ? `Skip high index ${high}` : `Stop high scan at ${high}`,
              shouldRetreatHigh ? `Bỏ qua chỉ số high ${high}` : `Dừng quét high tại ${high}`,
            ),
            note: shouldRetreatHigh
              ? localized(
                `s[${high}]='${s[high]}' is not the endpoint character.`,
                `s[${high}]='${s[high]}' không phải ký tự hai đầu.`,
              )
              : localized(
                low <= high
                  ? `high found the last interior '${s[j]}' at index ${high}.`
                  : "The low scan already proved there is no interior match.",
                low <= high
                  ? `high tìm thấy '${s[j]}' cuối cùng bên trong tại chỉ số ${high}.`
                  : "Phép quét low đã chứng minh không có ký tự trùng bên trong.",
              ),
          });
          if (!shouldRetreatHigh) break;
          high--;
          counters.highScanRetreats++;
          emit({
            line: 14,
            event: "retreat-high",
            phase: "scan",
            title: localized(`Retreat high to ${high}`, `Giảm high thành ${high}`),
            note: localized(
              "The next condition frame re-evaluates the literal while guard.",
              "Frame điều kiện kế tiếp đánh giá lại đúng guard while.",
            ),
          });
        }

        const middleStart = i + 1;
        const middleEnd = j - 1;
        const middleEmpty = middleStart > middleEnd;
        const middleValue = middleEmpty ? 0 : dp[middleStart][middleEnd];
        recurrence.middleValue = middleValue;
        recurrence.formula = middleEmpty ? "middle = 0 (empty interval)" : `middle = dp[${middleStart}][${middleEnd}]`;
        dependencyIntervals = [
          dependency("middle", middleStart, middleEnd, middleValue, middleEmpty),
        ];
        emit({
          line: 15,
          event: "read-middle",
          phase: "recurrence",
          title: localized(
            `Read middle = ${middleValue}`,
            `Đọc middle = ${middleValue}`,
          ),
          note: localized(
            middleEmpty
              ? "Adjacent equal endpoints have an empty middle with value zero."
              : `The already-computed interior [${middleStart}, ${middleEnd}] supplies the doubled base.`,
            middleEmpty
              ? "Hai đầu bằng nhau liền kề có phần giữa rỗng với giá trị 0."
              : `Đoạn trong [${middleStart}, ${middleEnd}] đã tính cung cấp cơ sở nhân đôi.`,
          ),
        });

        const zeroInnerMatches = low > high;
        emit({
          line: 16,
          event: zeroInnerMatches
            ? "zero-inner-match-condition-true"
            : "zero-inner-match-condition-false",
          phase: "recurrence",
          condition: { expression: `${low} > ${high}`, result: zeroInnerMatches },
          title: localized(
            zeroInnerMatches ? "Zero interior endpoint matches" : "At least one interior endpoint match",
            zeroInnerMatches ? "Không có ký tự hai đầu trùng bên trong" : "Có ít nhất một ký tự hai đầu trùng bên trong",
          ),
          note: zeroInnerMatches
            ? localized(
              "Doubling the middle adds wrapped values; +2 adds the singleton and the endpoint pair.",
              "Nhân đôi phần giữa thêm các giá trị được bọc; +2 thêm ký tự đơn và cặp hai đầu.",
            )
            : localized(
              "A later branch distinguishes one interior match from multiple matches.",
              "Nhánh sau phân biệt một ký tự trùng với nhiều ký tự trùng bên trong.",
            ),
        });

        if (zeroInnerMatches) {
          recurrence.branch = "zero-inner-match";
          recurrence.formula = `2 * ${middleValue} + 2`;
          const rawValue = 2 * middleValue + 2;
          commitCell(i, j, rawValue);
          counters.zeroInnerMatchBranches++;
          counters.recurrenceWrites++;
          emit({
            line: 17,
            event: "write-zero-inner-match",
            phase: "write",
            title: localized(
              `Write (${rawValue}) mod MOD = ${dp[i][j]}`,
              `Ghi (${rawValue}) mod MOD = ${dp[i][j]}`,
            ),
            note: localized(
              "The cell evidence independently contains exactly this many distinct values.",
              "Bằng chứng ô độc lập chứa đúng số giá trị khác nhau này.",
            ),
          });
        } else {
          const oneInnerMatch = low === high;
          emit({
            line: 18,
            event: oneInnerMatch
              ? "one-inner-match-condition-true"
              : "one-inner-match-condition-false",
            phase: "recurrence",
            condition: { expression: `${low} == ${high}`, result: oneInnerMatch },
            title: localized(
              oneInnerMatch ? `Exactly one interior match at ${low}` : `Multiple interior matches from ${low} to ${high}`,
              oneInnerMatch ? `Đúng một ký tự trùng bên trong tại ${low}` : `Nhiều ký tự trùng bên trong từ ${low} đến ${high}`,
            ),
            note: oneInnerMatch
              ? localized(
                "The singleton endpoint value already occurs once inside, so only one new base value remains.",
                "Giá trị ký tự đơn đã xuất hiện một lần bên trong, nên chỉ còn một giá trị cơ sở mới.",
              )
              : localized(
                "Values wrapped around the duplicate interior range must be subtracted once.",
                "Các giá trị bọc quanh phạm vi trùng bên trong phải được trừ một lần.",
              ),
          });

          if (oneInnerMatch) {
            recurrence.branch = "one-inner-match";
            recurrence.formula = `2 * ${middleValue} + 1`;
            const rawValue = 2 * middleValue + 1;
            commitCell(i, j, rawValue);
            counters.oneInnerMatchBranches++;
            counters.recurrenceWrites++;
            emit({
              line: 19,
              event: "write-one-inner-match",
              phase: "write",
              title: localized(
                `Write (${rawValue}) mod MOD = ${dp[i][j]}`,
                `Ghi (${rawValue}) mod MOD = ${dp[i][j]}`,
              ),
              note: localized(
                "The independent mask evidence verifies the deduplicated count.",
                "Bằng chứng mask độc lập xác minh số đếm đã loại trùng.",
              ),
            });
          } else {
            recurrence.branch = "multiple-inner-matches";
            emit({
              line: 20,
              event: "multiple-inner-match-branch",
              phase: "recurrence",
              title: localized(
                "Enter the multiple-inner-match branch",
                "Vào nhánh nhiều ký tự trùng bên trong",
              ),
              note: localized(
                "The strictly interior duplicate range identifies values counted twice.",
                "Phạm vi nằm hẳn trong các bản sao xác định các giá trị bị đếm hai lần.",
              ),
            });

            const duplicateStart = low + 1;
            const duplicateEnd = high - 1;
            const duplicateEmpty = duplicateStart > duplicateEnd;
            const duplicateValue = duplicateEmpty ? 0 : dp[duplicateStart][duplicateEnd];
            recurrence.duplicateValue = duplicateValue;
            recurrence.formula = `2 * ${middleValue} - ${duplicateValue}`;
            dependencyIntervals = [
              dependency("middle", middleStart, middleEnd, middleValue, middleEmpty),
              dependency("duplicate", duplicateStart, duplicateEnd, duplicateValue, duplicateEmpty),
            ];
            const rawValue = 2 * middleValue - duplicateValue;
            commitCell(i, j, rawValue);
            counters.multipleInnerMatchBranches++;
            counters.recurrenceWrites++;
            emit({
              line: 21,
              event: "write-multiple-inner-matches",
              phase: "write",
              title: localized(
                `Write (${rawValue}) mod MOD = ${dp[i][j]}`,
                `Ghi (${rawValue}) mod MOD = ${dp[i][j]}`,
              ),
              note: localized(
                `Subtract dp[${duplicateStart}][${duplicateEnd}]=${duplicateValue}, then normalize canonically.`,
                `Trừ dp[${duplicateStart}][${duplicateEnd}]=${duplicateValue}, rồi chuẩn hóa chính tắc.`,
              ),
            });
          }
        }
      } else {
        recurrence.branch = "unequal-endpoints";
        emit({
          line: 22,
          event: "unequal-endpoint-branch",
          phase: "recurrence",
          title: localized("Enter the unequal-endpoint branch", "Vào nhánh hai đầu khác nhau"),
          note: localized(
            "Union the two one-endpoint-shorter sets and remove their overlap.",
            "Hợp hai tập bỏ một đầu rồi loại phần giao của chúng.",
          ),
        });

        const leftValue = dp[i + 1][j];
        const rightValue = dp[i][j - 1];
        const overlapStart = i + 1;
        const overlapEnd = j - 1;
        const overlapEmpty = overlapStart > overlapEnd;
        const overlapValue = overlapEmpty ? 0 : dp[overlapStart][overlapEnd];
        dependencyIntervals = [
          dependency("drop-left", i + 1, j, leftValue),
          dependency("drop-right", i, j - 1, rightValue),
          dependency("overlap", overlapStart, overlapEnd, overlapValue, overlapEmpty),
        ];
        const rawValue = leftValue + rightValue - overlapValue;
        recurrence.formula = `${leftValue} + ${rightValue} - ${overlapValue}`;
        commitCell(i, j, rawValue);
        counters.recurrenceWrites++;
        emit({
          line: 23,
          event: "write-unequal-endpoints",
          phase: "write",
          title: localized(
            `Write (${rawValue}) mod MOD = ${dp[i][j]}`,
            `Ghi (${rawValue}) mod MOD = ${dp[i][j]}`,
          ),
          note: localized(
            "Canonical modulo preserves the non-negative representative even after subtraction.",
            "Modulo chính tắc giữ đại diện không âm kể cả sau phép trừ.",
          ),
        });
      }
    }

    j = n;
    resetCellState("j-loop-complete");
    counters.jLoopFalse++;
    emit({
      line: 8,
      event: "j-loop-false",
      phase: "fill",
      timing: "before",
      condition: { expression: `${j} < ${n}`, result: false },
      title: localized(`Row i = ${i} complete`, `Hoàn tất hàng i = ${i}`),
      note: localized(
        "Every interval beginning at this i now has matching mask evidence.",
        "Mọi đoạn bắt đầu tại i này giờ có bằng chứng mask tương ứng.",
      ),
    });
  }

  i = -1;
  j = null;
  resetCellState("i-loop-complete");
  counters.iLoopFalse++;
  emit({
    line: 6,
    event: "i-loop-false",
    phase: "fill",
    timing: "before",
    condition: { expression: `${i} >= 0`, result: false },
    title: localized("All DP rows complete", "Hoàn tất mọi hàng DP"),
    note: localized(
      "Every upper-triangle cell is computed, canonical, and evidence-checked.",
      "Mọi ô tam giác trên đã được tính, chuẩn hóa và kiểm tra bằng chứng.",
    ),
  });

  answer = dp[0][n - 1];
  finalEvidence = buildFinalEvidence730(evidenceTable[0][n - 1], answer);
  i = null;
  j = null;
  resetCellState("final");
  emit({
    line: 24,
    event: "final-return",
    phase: "done",
    title: localized(`Return ${answer}`, `Trả về ${answer}`),
    note: localized(
      `The complete bounded evidence groups all ${answer} distinct values by outer character.`,
      `Bằng chứng đầy đủ có giới hạn nhóm toàn bộ ${answer} giá trị khác nhau theo ký tự ngoài cùng.`,
    ),
    final: true,
  });

  if (steps.length !== counters.frames
    || steps.length > COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_FRAMES
    || steps.filter((step) => step.final).length !== 1) {
    throw new Error("#730 final frame-count invariant failed.");
  }

  return {
    original: s,
    answer,
    evidence: deepFreezeCountPalindromicSubsequences730View(finalEvidence),
    evidenceTable: deepFreezeCountPalindromicSubsequences730View(
      evidenceTable.map((row) => row.map(copyCellEvidence730)),
    ),
    steps,
  };
}

module.exports = {
  730: {
    id: 730,
    difficulty: "hard",
    slug: "count-different-palindromic-subsequences",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "interval-dp", vi: "DP trên đoạn", en: "Interval DP" },
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "dedup", vi: "Tránh đếm trùng", en: "Deduplication" },
    ],
    title: {
      vi: "Count Different Palindromic Subsequences",
      en: "Count Different Palindromic Subsequences",
    },
    titleVi: {
      vi: "Đếm subsequence đối xứng khác nhau",
      en: "Count different palindromic subsequences",
    },
    statement: {
      vi: `Cho chuỗi s dài 1..${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH}, chỉ gồm a, b, c, d. Trả về số palindromic subsequence không rỗng khác nhau modulo 10^9+7.`,
      en: `Given a string s of length 1..${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH} containing only a, b, c, and d, return the number of distinct non-empty palindromic subsequences modulo 10^9+7.`,
    },
    defaultInput: "bccb",
    inputKind: "string",
    inputLabel: {
      vi: `s (1..${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH}, chỉ a-d)`,
      en: `s (1..${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH}, a-d only)`,
    },
    maxInput: COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH,
    extraParams: [],
    debugMode: "line-by-line",
    parseCountPalindromicSubsequences730Input,
    approach: [
      {
        vi: "dp[i][j] đếm các giá trị palindromic subsequence không rỗng khác nhau trong s[i..j]; tính i giảm và j tăng.",
        en: "dp[i][j] counts distinct non-empty palindromic subsequence values in s[i..j]; fill i downward and j upward.",
      },
      {
        vi: "Nếu hai đầu khác nhau, dùng bao hàm-loại trừ: dp[i+1][j] + dp[i][j−1] − dp[i+1][j−1].",
        en: "For unequal endpoints, use inclusion-exclusion: dp[i+1][j] + dp[i][j−1] − dp[i+1][j−1].",
      },
      {
        vi: "Nếu hai đầu bằng nhau, quét low/high tìm cùng ký tự bên trong: không có, một, hoặc nhiều bản sao lần lượt dùng 2·middle+2, 2·middle+1, hoặc 2·middle−duplicate.",
        en: "For equal endpoints, scan low/high for the same interior character: zero, one, or multiple copies use 2·middle+2, 2·middle+1, or 2·middle−duplicate respectively.",
      },
      {
        vi: "Mọi phép trừ được chuẩn hóa vào [0, MOD). Mask computed phân biệt ô chưa ghi với giá trị thật.",
        en: "Every subtraction is normalized into [0, MOD). The computed mask distinguishes unwritten cells from real values.",
      },
      {
        vi: "Sidecar độc lập liệt kê mọi mask subsequence cho từng ô, giữ tuple chỉ số tuyệt đối nhỏ nhất theo thứ tự từ điển cho mỗi palindrome và bắt buộc count bằng DP.",
        en: "An independent sidecar enumerates every subsequence mask per cell, keeps the lexicographically smallest absolute index tuple for each palindrome, and requires its count to equal the DP value.",
      },
    ],
    complexity: {
      time: "O(n³)",
      space: "O(n²)",
      note: {
        vi: `DP quét low/high nên tốn O(n³). Chỉ visualization mới dùng oracle mask O(n²·2^n·n); n≤${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH} giữ evidence và tối đa ${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_FRAMES} frame có giới hạn.`,
        en: `The DP scans low/high, taking O(n³). Only the visualization uses the O(n²·2^n·n) mask oracle; n≤${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_LENGTH} bounds the evidence and the trace to at most ${COUNT_PALINDROMIC_SUBSEQUENCES_730_MAX_FRAMES} frames.`,
      },
    },
    code: COUNT_PALINDROMIC_SUBSEQUENCES_730_SOURCE,
    liveArgs: (input) => {
      const s = parseCountPalindromicSubsequences730Input(input);
      return [s];
    },
    builder: buildSteps730Exact,
  },
};
