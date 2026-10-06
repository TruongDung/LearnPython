// LeetCode 664 — Strange Printer focused exact visualization module.

const STRANGE_PRINTER_664_MAX_LENGTH = 12;
const STRANGE_PRINTER_664_SOURCE = Object.freeze([
  "class Solution:",
  "    def strangePrinter(self, s):",
  "        n = len(s)",
  "        dp = [[0]*n for _ in range(n)]",
  "        for i in range(n-1, -1, -1):",
  "            dp[i][i] = 1",
  "            for j in range(i+1, n):",
  "                dp[i][j] = dp[i][j-1] + 1",
  "                for k in range(i, j):",
  "                    if s[k] == s[j]:",
  "                        dp[i][j] = min(dp[i][j], dp[i][k] + (dp[k+1][j-1] if k+1 <= j-1 else 0))",
  "        return dp[0][n-1] if n else 0",
]);

function parseStrangePrinter664Input(input) {
  if (typeof input !== "string") {
    throw new TypeError("Strange Printer input must be a string.");
  }
  if (!/^[a-z]+$/.test(input)) {
    throw new TypeError("Strange Printer input must be nonempty and contain lowercase English letters only.");
  }
  if (input.length > STRANGE_PRINTER_664_MAX_LENGTH) {
    throw new RangeError(`Strange Printer visualization supports at most ${STRANGE_PRINTER_664_MAX_LENGTH} characters.`);
  }
  return input;
}

function deepFreezeStrangePrinter664View(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function copyDependency(dependency) {
  return {
    role: dependency.role,
    interval: [...dependency.interval],
    start: dependency.start,
    end: dependency.end,
    value: dependency.value,
    empty: dependency.empty,
  };
}

function copyChoice(selected) {
  return selected ? {
    type: selected.type,
    value: selected.value,
    char: selected.char,
    k: selected.k,
    dependencies: selected.dependencies.map(copyDependency),
  } : null;
}

function buildStrangePrinter664Witness(s, choiceTable, answer) {
  const build = (left, right) => {
    if (left > right) return [];
    const selected = choiceTable[left][right];
    if (!selected) throw new Error(`Strange Printer witness is missing choice [${left}, ${right}].`);

    let plan;
    if (selected.type === "single") {
      plan = [{ char: s[left], left, right }];
    } else if (selected.type === "separate") {
      plan = [...build(left, right - 1), { char: s[right], left: right, right }];
    } else if (selected.type === "merge") {
      const mergeIndex = selected.k;
      const leftPlan = build(left, mergeIndex);
      let extendingTurn = -1;
      for (let turnIndex = leftPlan.length - 1; turnIndex >= 0; turnIndex--) {
        const turn = leftPlan[turnIndex];
        if (turn.char === s[mergeIndex] && turn.left <= mergeIndex && mergeIndex <= turn.right) {
          extendingTurn = turnIndex;
          break;
        }
      }
      if (extendingTurn < 0) {
        throw new Error(`Strange Printer witness cannot merge index ${mergeIndex} into ${right}.`);
      }
      leftPlan[extendingTurn] = { ...leftPlan[extendingTurn], right };
      plan = [...leftPlan, ...build(mergeIndex + 1, right - 1)];
    } else {
      throw new Error(`Strange Printer witness has unknown choice type "${selected.type}".`);
    }

    if (plan.length !== selected.value) {
      throw new Error(`Strange Printer witness turn-count mismatch on [${left}, ${right}].`);
    }
    return plan;
  };

  const plan = build(0, s.length - 1);
  if (plan.length !== answer) {
    throw new Error("Strange Printer witness turn count does not equal the DP answer.");
  }

  const initialCanvas = Array(s.length).fill(null);
  const canvas = [...initialCanvas];
  const turns = plan.map((turn, index) => {
    if (!/^[a-z]$/.test(turn.char)
      || !Number.isInteger(turn.left)
      || !Number.isInteger(turn.right)
      || turn.left < 0
      || turn.left > turn.right
      || turn.right >= s.length) {
      throw new Error("Strange Printer witness contains an invalid turn.");
    }
    for (let position = turn.left; position <= turn.right; position++) canvas[position] = turn.char;
    return {
      turn: index + 1,
      char: turn.char,
      left: turn.left,
      right: turn.right,
      interval: [turn.left, turn.right],
      postCanvas: [...canvas],
      postCanvasText: canvas.map((char) => char === null ? "·" : char).join(""),
    };
  });
  const finalCanvas = canvas.join("");
  if (turns.length !== answer || finalCanvas !== s) {
    throw new Error("Strange Printer witness replay invariant failed.");
  }

  return {
    strategy: "reconstruct strict DP choices, extend merged turns, then replay overwrites",
    rootInterval: [0, s.length - 1],
    initialCanvas,
    turns,
    turnCount: turns.length,
    finalCells: [...canvas],
    finalCanvas,
    valid: true,
  };
}

function buildSteps664Exact(input) {
  const s = parseStrangePrinter664Input(input);
  const n = s.length;
  const steps = [];
  const localized = (en, vi) => ({ en, vi });
  let dp = [];
  let computedMask = [];
  let choiceTable = [];
  let dpAllocated = false;
  const counters = {
    frames: 0,
    iLoopTrue: 0,
    iLoopFalse: 0,
    jLoopTrue: 0,
    jLoopFalse: 0,
    kLoopTrue: 0,
    kLoopFalse: 0,
    diagonalWrites: 0,
    baselineWrites: 0,
    conditionChecks: 0,
    matches: 0,
    mismatches: 0,
    mergeCandidates: 0,
    improvements: 0,
    ties: 0,
    worse: 0,
    dpWrites: 0,
    choiceWrites: 0,
    witnessTurns: 0,
  };

  let i = null;
  let j = null;
  let k = null;
  let baseline = null;
  let candidate = null;
  let incumbent = null;
  let dependencyIntervals = [];
  let outcome = "idle";
  let answer = null;
  let witness = null;

  const dependency = (role, start, end, value, empty = false) => ({
    role,
    interval: [start, end],
    start,
    end,
    value,
    empty,
  });
  const isCell = (row, column) => Number.isInteger(row)
    && Number.isInteger(column)
    && row >= 0
    && column >= row
    && column < n;
  const choicesEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const copyWitness = (value) => value ? {
    strategy: value.strategy,
    rootInterval: [...value.rootInterval],
    initialCanvas: [...value.initialCanvas],
    turns: value.turns.map((turn) => ({
      ...turn,
      interval: [...turn.interval],
      postCanvas: [...turn.postCanvas],
    })),
    turnCount: value.turnCount,
    finalCells: [...value.finalCells],
    finalCanvas: value.finalCanvas,
    valid: value.valid,
  } : null;
  const copyBaseline = (value) => value ? {
    interval: [...value.interval],
    value: value.value,
    prefixValue: value.prefixValue,
    appendedIndex: value.appendedIndex,
    appendedChar: value.appendedChar,
    formula: value.formula,
  } : null;
  const copyCandidate = (value) => value ? {
    interval: [...value.interval],
    k: value.k,
    char: value.char,
    value: value.value,
    leftValue: value.leftValue,
    middleValue: value.middleValue,
    formula: value.formula,
  } : null;
  const copyIncumbent = (value) => value ? {
    value: value.value,
    choice: copyChoice(value.choice),
  } : null;
  const snapshotView = ({ line, event, phase, timing, condition, final }) => {
    const tableChoices = choiceTable.map((row) => row.map(copyChoice));
    const activeCell = isCell(i, j);
    const dependenciesAreComputed = dependencyIntervals.every((item) => item.empty || (
      isCell(item.start, item.end) && computedMask[item.start][item.end]
    ));
    const strictTieKeptIncumbent = outcome !== "tie" || !activeCell || !incumbent
      || (dp[i][j] === incumbent.value && choicesEqual(choiceTable[i][j], incumbent.choice));
    const maskAndChoicesAgree = computedMask.every((row, rowIndex) => row.every(
      (isComputed, columnIndex) => isComputed === (choiceTable[rowIndex][columnIndex] !== null),
    ));
    const choiceValuesMatchDp = choiceTable.every((row, rowIndex) => row.every(
      (selected, columnIndex) => selected === null || selected.value === dp[rowIndex][columnIndex],
    ));
    const uncomputedCellsAreZero = computedMask.every((row, rowIndex) => row.every(
      (isComputed, columnIndex) => isComputed || dp[rowIndex][columnIndex] === 0,
    ));
    const lowerTriangleUnused = dp.every((row, rowIndex) => row.every(
      (value, columnIndex) => columnIndex >= rowIndex || (value === 0 && !computedMask[rowIndex][columnIndex]),
    ));
    const witnessCopy = copyWitness(witness);

    return deepFreezeStrangePrinter664View({
      version: 1,
      problemId: 664,
      source: { line, text: STRANGE_PRINTER_664_SOURCE[line - 1] },
      event,
      phase,
      timing,
      condition: condition && typeof condition === "object"
        ? { expression: condition.expression, result: condition.result }
        : { expression: null, result: null },
      input: {
        s,
        length: n,
        limits: { maxLength: STRANGE_PRINTER_664_MAX_LENGTH },
      },
      cursors: { i, j, k },
      interval: activeCell ? [i, j] : null,
      dpAllocated,
      dp: dp.map((row) => [...row]),
      computedMask: computedMask.map((row) => [...row]),
      choiceTable: tableChoices,
      baseline: copyBaseline(baseline),
      candidate: copyCandidate(candidate),
      incumbent: copyIncumbent(incumbent),
      dependencyIntervals: dependencyIntervals.map(copyDependency),
      outcome,
      counters: { ...counters },
      invariants: {
        definition: "dp[i][j] is the minimum turns needed to print s[i..j]",
        tablesAreSquare: !dpAllocated || (dp.length === n
          && computedMask.length === n
          && choiceTable.length === n
          && dp.every((row) => row.length === n)
          && computedMask.every((row) => row.length === n)
          && choiceTable.every((row) => row.length === n)),
        lowerTriangleUnused,
        uncomputedCellsAreZero,
        computedMaskMatchesChoices: maskAndChoicesAgree,
        choiceValuesMatchDp,
        activeCellComputed: activeCell ? computedMask[i][j] : null,
        dependenciesComputed: dependenciesAreComputed,
        strictTieKeptIncumbent,
        answerMatchesRoot: answer === null ? null : computedMask[0][n - 1] && answer === dp[0][n - 1],
        witnessValid: witnessCopy === null ? null : witnessCopy.valid
          && witnessCopy.turnCount === answer
          && witnessCopy.finalCanvas === s,
      },
      answer,
      witness: witnessCopy,
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
    counters.frames++;
    const view = snapshotView({ line, event, phase, timing, condition, final });
    const highlightedCell = isCell(view.cursors.i, view.cursors.j)
      ? [view.cursors.i, view.cursors.j]
      : final ? [0, n - 1] : null;
    const pathCells = view.dependencyIntervals
      .filter((item) => !item.empty && isCell(item.start, item.end))
      .map((item) => [...item.interval]);
    const displayDp = view.dp.map((row, rowIndex) => row.map((value, columnIndex) => {
      if (columnIndex < rowIndex) return "";
      return view.computedMask[rowIndex][columnIndex] ? String(value) : "·";
    }));
    const activeValue = highlightedCell ? view.dp[highlightedCell[0]][highlightedCell[1]] : null;

    steps.push({
      title,
      note,
      arr: [],
      highlight: [],
      mark: [],
      grid: {
        dp: displayDp,
        text1: s.split("").slice(1),
        text2: s.split("").slice(1),
        hlCell: highlightedCell,
        pathCells,
        largeCells: true,
        caption: highlightedCell
          ? `dp[${highlightedCell[0]}][${highlightedCell[1]}] = ${activeValue}`
          : `dp[i][j] = minimum turns for s[i..j] in "${s}"`,
      },
      final,
      codeLines: [line],
      vars: [
        { name: "s", value: s },
        { name: "i", value: view.cursors.i ?? "—" },
        { name: "j", value: view.cursors.j ?? "—" },
        { name: "k", value: view.cursors.k ?? "—" },
        { name: "outcome", value: view.outcome },
        { name: "answer", value: view.answer ?? "—" },
      ],
      strangePrinter664View: view,
    });
  };
  const resetTransition = (nextOutcome = "idle") => {
    baseline = null;
    candidate = null;
    incumbent = null;
    dependencyIntervals = [];
    outcome = nextOutcome;
  };

  emit({
    line: 1,
    event: "bind-class",
    phase: "setup",
    title: localized("Bind Solution class", "Liên kết lớp Solution"),
    note: localized("The class exposes the exact interval-DP method shown below.", "Lớp chứa đúng method quy hoạch động đoạn hiển thị bên dưới."),
  });
  emit({
    line: 2,
    event: "bind-method",
    phase: "setup",
    title: localized("Bind strangePrinter", "Liên kết strangePrinter"),
    note: localized("The accepted input is already a strict nonempty lowercase string.", "Input đã được kiểm tra nghiêm ngặt là chuỗi chữ thường không rỗng."),
  });
  emit({
    line: 3,
    event: "set-length",
    phase: "setup",
    title: localized(`Set n = ${n}`, `Đặt n = ${n}`),
    note: localized("Every DP interval uses original, uncompressed string indices.", "Mọi đoạn DP dùng index của chuỗi gốc, không nén."),
  });
  dp = Array.from({ length: n }, () => Array(n).fill(0));
  computedMask = Array.from({ length: n }, () => Array(n).fill(false));
  choiceTable = Array.from({ length: n }, () => Array(n).fill(null));
  dpAllocated = true;
  emit({
    line: 4,
    event: "allocate-dp",
    phase: "setup",
    title: localized(`Allocate a ${n}×${n} DP table`, `Cấp phát bảng DP ${n}×${n}`),
    note: localized("The computed mask distinguishes unwritten zeroes from real interval values.", "Mask computed phân biệt số 0 chưa ghi với giá trị đoạn thực."),
  });

  for (let currentI = n - 1; currentI >= 0; currentI--) {
    i = currentI;
    j = null;
    k = null;
    resetTransition("i-loop");
    counters.iLoopTrue++;
    emit({
      line: 5,
      event: "i-loop-true",
      phase: "fill",
      timing: "before",
      condition: { expression: `${i} >= 0`, result: true },
      title: localized(`Start row i = ${i}`, `Bắt đầu hàng i = ${i}`),
      note: localized("Descending i guarantees every lower-start dependency is ready.", "Duyệt i giảm dần bảo đảm mọi phụ thuộc có điểm đầu lớn hơn đã sẵn sàng."),
    });

    j = i;
    dp[i][i] = 1;
    computedMask[i][i] = true;
    choiceTable[i][i] = { type: "single", value: 1, char: s[i], k: null, dependencies: [] };
    counters.diagonalWrites++;
    counters.dpWrites++;
    counters.choiceWrites++;
    outcome = "diagonal";
    incumbent = { value: 1, choice: copyChoice(choiceTable[i][i]) };
    emit({
      line: 6,
      event: "write-diagonal",
      phase: "fill",
      title: localized(`dp[${i}][${i}] = 1`, `dp[${i}][${i}] = 1`),
      note: localized(`One turn prints the single character '${s[i]}'.`, `Một lượt in ký tự đơn '${s[i]}'.`),
    });

    for (let currentJ = i + 1; currentJ < n; currentJ++) {
      j = currentJ;
      k = null;
      resetTransition("j-loop");
      counters.jLoopTrue++;
      emit({
        line: 7,
        event: "j-loop-true",
        phase: "fill",
        timing: "before",
        condition: { expression: `${j} < ${n}`, result: true },
        title: localized(`Open interval [${i}, ${j}]`, `Mở đoạn [${i}, ${j}]`),
        note: localized(`Compute the exact minimum for "${s.slice(i, j + 1)}".`, `Tính minimum chính xác cho "${s.slice(i, j + 1)}".`),
      });

      const prefixValue = dp[i][j - 1];
      const baselineValue = prefixValue + 1;
      dependencyIntervals = [
        dependency("prefix", i, j - 1, prefixValue),
        dependency("singleton", j, j, 1),
      ];
      baseline = {
        interval: [i, j],
        value: baselineValue,
        prefixValue,
        appendedIndex: j,
        appendedChar: s[j],
        formula: `dp[${i}][${j - 1}] + 1`,
      };
      dp[i][j] = baselineValue;
      computedMask[i][j] = true;
      choiceTable[i][j] = {
        type: "separate",
        value: baselineValue,
        char: s[j],
        k: null,
        dependencies: dependencyIntervals.map(copyDependency),
      };
      incumbent = { value: baselineValue, choice: copyChoice(choiceTable[i][j]) };
      candidate = null;
      outcome = "baseline";
      counters.baselineWrites++;
      counters.dpWrites++;
      counters.choiceWrites++;
      emit({
        line: 8,
        event: "write-baseline",
        phase: "fill",
        title: localized(`Baseline = ${prefixValue} + 1 = ${baselineValue}`, `Baseline = ${prefixValue} + 1 = ${baselineValue}`),
        note: localized(`Print s[${j}]='${s[j]}' in a separate final turn; this choice wins every later tie.`, `In s[${j}]='${s[j]}' bằng lượt cuối riêng; lựa chọn này thắng mọi tie về sau.`),
      });

      for (let currentK = i; currentK < j; currentK++) {
        k = currentK;
        candidate = null;
        incumbent = { value: dp[i][j], choice: copyChoice(choiceTable[i][j]) };
        dependencyIntervals = [];
        outcome = "k-loop";
        counters.kLoopTrue++;
        emit({
          line: 9,
          event: "k-loop-true",
          phase: "candidate",
          timing: "before",
          condition: { expression: `${k} < ${j}`, result: true },
          title: localized(`Try merge index k = ${k}`, `Thử index gộp k = ${k}`),
          note: localized(`Only a matching '${s[j]}' can share its turn with the interval ending at k.`, `Chỉ ký tự '${s[j]}' trùng mới có thể dùng chung lượt với đoạn kết thúc tại k.`),
        });

        const matches = s[k] === s[j];
        counters.conditionChecks++;
        if (matches) counters.matches++;
        else counters.mismatches++;
        outcome = matches ? "condition-true" : "condition-false";
        emit({
          line: 10,
          event: matches ? "match-condition-true" : "match-condition-false",
          phase: "candidate",
          condition: { expression: `s[${k}] == s[${j}]`, result: matches },
          title: localized(
            matches ? `'${s[k]}' matches '${s[j]}'` : `'${s[k]}' does not match '${s[j]}'`,
            matches ? `'${s[k]}' trùng '${s[j]}'` : `'${s[k]}' không trùng '${s[j]}'`,
          ),
          note: matches
            ? localized("Evaluate the merge recurrence on the next source line.", "Đánh giá công thức gộp ở dòng nguồn tiếp theo.")
            : localized("The source skips the merge assignment for this k.", "Mã nguồn bỏ qua phép gán gộp cho k này."),
        });

        if (matches) {
          const leftValue = dp[i][k];
          const middleIsEmpty = k + 1 > j - 1;
          const middleValue = middleIsEmpty ? 0 : dp[k + 1][j - 1];
          dependencyIntervals = [
            dependency("left", i, k, leftValue),
            dependency("middle", k + 1, j - 1, middleValue, middleIsEmpty),
          ];
          candidate = {
            interval: [i, j],
            k,
            char: s[j],
            value: leftValue + middleValue,
            leftValue,
            middleValue,
            formula: `dp[${i}][${k}] + ${middleIsEmpty ? "0" : `dp[${k + 1}][${j - 1}]`}`,
          };
          const incumbentBefore = { value: dp[i][j], choice: copyChoice(choiceTable[i][j]) };
          incumbent = incumbentBefore;
          if (candidate.value < incumbentBefore.value) outcome = "improve";
          else if (candidate.value === incumbentBefore.value) outcome = "tie";
          else outcome = "worse";

          counters.mergeCandidates++;
          counters.dpWrites++;
          if (outcome === "improve") {
            dp[i][j] = candidate.value;
            choiceTable[i][j] = {
              type: "merge",
              value: candidate.value,
              char: s[j],
              k,
              dependencies: dependencyIntervals.map(copyDependency),
            };
            counters.improvements++;
            counters.choiceWrites++;
          } else if (outcome === "tie") {
            counters.ties++;
          } else {
            counters.worse++;
          }
          emit({
            line: 11,
            event: `merge-candidate-${outcome}`,
            phase: "candidate",
            title: localized(
              `Candidate ${candidate.value} is ${outcome} versus incumbent ${incumbentBefore.value}`,
              `Ứng viên ${candidate.value} là ${outcome} so với incumbent ${incumbentBefore.value}`,
            ),
            note: outcome === "improve"
              ? localized("Strict improvement replaces both the DP value and its reconstruction choice.", "Cải thiện nghiêm ngặt thay cả giá trị DP và lựa chọn tái dựng.")
              : outcome === "tie"
                ? localized("Equality keeps the incumbent: baseline wins its ties, otherwise the first improving k wins.", "Bằng nhau giữ incumbent: baseline thắng tie của nó, nếu không k cải thiện đầu tiên thắng.")
                : localized("A larger legal candidate cannot replace the incumbent.", "Ứng viên hợp lệ lớn hơn không thể thay incumbent."),
          });
        }
      }

      k = j;
      candidate = null;
      incumbent = { value: dp[i][j], choice: copyChoice(choiceTable[i][j]) };
      dependencyIntervals = [];
      outcome = "k-loop-complete";
      counters.kLoopFalse++;
      emit({
        line: 9,
        event: "k-loop-false",
        phase: "candidate",
        timing: "before",
        condition: { expression: `${k} < ${j}`, result: false },
        title: localized(`All k tested for [${i}, ${j}]`, `Đã thử mọi k cho [${i}, ${j}]`),
        note: localized(`The committed choice is ${choiceTable[i][j].type} with value ${dp[i][j]}.`, `Lựa chọn đã chốt là ${choiceTable[i][j].type} với giá trị ${dp[i][j]}.`),
      });
    }

    j = n;
    k = null;
    resetTransition("j-loop-complete");
    counters.jLoopFalse++;
    emit({
      line: 7,
      event: "j-loop-false",
      phase: "fill",
      timing: "before",
      condition: { expression: `${j} < ${n}`, result: false },
      title: localized(`Row i = ${i} complete`, `Hoàn tất hàng i = ${i}`),
      note: localized("Every interval beginning at this i now has a deterministic choice.", "Mọi đoạn bắt đầu tại i này giờ có lựa chọn xác định."),
    });
  }

  i = -1;
  j = null;
  k = null;
  resetTransition("i-loop-complete");
  counters.iLoopFalse++;
  emit({
    line: 5,
    event: "i-loop-false",
    phase: "fill",
    timing: "before",
    condition: { expression: `${i} >= 0`, result: false },
    title: localized("All DP rows complete", "Hoàn tất mọi hàng DP"),
    note: localized("The root cell now stores the minimum for the exact original string.", "Ô gốc giờ lưu minimum cho đúng chuỗi gốc."),
  });

  answer = dp[0][n - 1];
  witness = buildStrangePrinter664Witness(s, choiceTable, answer);
  counters.witnessTurns = witness.turnCount;
  i = null;
  j = null;
  k = null;
  resetTransition("final");
  emit({
    line: 12,
    event: "final-return",
    phase: "done",
    title: localized(`Return ${answer}`, `Trả về ${answer}`),
    note: localized(
      `The ${witness.turnCount}-turn sidecar replays to "${witness.finalCanvas}" without changing the DP answer.`,
      `Sidecar ${witness.turnCount} lượt phát lại thành "${witness.finalCanvas}" mà không đổi đáp án DP.`,
    ),
    final: true,
  });

  return {
    original: s,
    answer,
    witness: copyWitness(witness),
    steps,
  };
}

module.exports = {
  664: {
    id: 664,
    difficulty: "hard",
    slug: "strange-printer",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "interval-dp", vi: "DP đoạn", en: "Interval DP" },
      { key: "string", vi: "Chuỗi", en: "String" },
    ],
    title: { vi: "Strange Printer", en: "Strange Printer" },
    titleVi: { vi: "Máy in kỳ lạ", en: "Strange printer" },
    statement: {
      vi: `Máy in mỗi lượt ghi một dãy liên tiếp của cùng một ký tự và có thể đè nội dung cũ. Tìm số lượt ít nhất để tạo đúng s. Trace dùng nguyên chuỗi chữ thường không rỗng, không nén, dài tối đa ${STRANGE_PRINTER_664_MAX_LENGTH}.`,
      en: `In one turn the printer writes one repeated character over a contiguous range and may overwrite existing content. Find the fewest turns that produce exactly s. The trace uses the uncompressed nonempty lowercase input, limited to ${STRANGE_PRINTER_664_MAX_LENGTH} characters.`,
    },
    defaultInput: "aba",
    inputKind: "string",
    inputLabel: {
      vi: `s (1..${STRANGE_PRINTER_664_MAX_LENGTH} chữ thường)`,
      en: `s (1..${STRANGE_PRINTER_664_MAX_LENGTH} lowercase letters)`,
    },
    maxInput: STRANGE_PRINTER_664_MAX_LENGTH,
    extraParams: [],
    debugMode: "line-by-line",
    parseStrangePrinter664Input,
    approach: [
      {
        vi: "dp[i][j] là số lượt ít nhất để in đúng đoạn gốc s[i..j]. Baseline in s[j] riêng: dp[i][j−1]+1.",
        en: "dp[i][j] is the minimum turns for the exact original substring s[i..j]. The baseline prints s[j] separately: dp[i][j−1]+1.",
      },
      {
        vi: "Nếu s[k]=s[j], kéo dài lượt đang in ký tự đó qua j, cho ứng viên dp[i][k]+dp[k+1][j−1] (đoạn giữa rỗng có cost 0).",
        en: "When s[k]=s[j], extend that character's turn through j, giving candidate dp[i][k]+dp[k+1][j−1] (an empty middle costs 0).",
      },
      {
        vi: "Chỉ ứng viên nhỏ hơn nghiêm ngặt mới đổi choice: baseline thắng tie; sau một cải thiện, k nhỏ nhất trong các merge hòa nhau được giữ.",
        en: "Only a strictly smaller candidate changes the choice: the baseline wins ties; after an improvement, the smallest k among tied merges is retained.",
      },
      {
        vi: `Trace chạy đúng thứ tự 12 dòng nguồn với input không nén tối đa ${STRANGE_PRINTER_664_MAX_LENGTH}; mỗi vòng lặp, điều kiện, baseline và ứng viên merge có frame riêng.`,
        en: `The trace follows the 12 source lines exactly on an uncompressed input of at most ${STRANGE_PRINTER_664_MAX_LENGTH}; each loop, condition, baseline, and merge candidate has its own frame.`,
      },
      {
        vi: "Sau khi có answer, sidecar tái dựng các lượt in cụ thể từ choice, phát lại phép đè trên canvas trống và xác nhận số lượt cùng chuỗi cuối.",
        en: "After the answer is fixed, a sidecar reconstructs concrete turns from the choices, replays overwrites on a blank canvas, and verifies both turn count and final string.",
      },
    ],
    complexity: {
      time: "O(n³)",
      space: "O(n²)",
      note: {
        vi: `Ba vòng i/j/k tạo O(n³) ứng viên; DP, mask và choice dùng O(n²). Giới hạn trace ${STRANGE_PRINTER_664_MAX_LENGTH} giữ mọi frame thực tế có thể xem được.`,
        en: `The i/j/k loops produce O(n³) candidates; DP, mask, and choices use O(n²). The trace limit of ${STRANGE_PRINTER_664_MAX_LENGTH} keeps every literal frame practical.`,
      },
    },
    code: STRANGE_PRINTER_664_SOURCE,
    liveArgs: (input) => [parseStrangePrinter664Input(input)],
    builder: buildSteps664Exact,
  },
};
