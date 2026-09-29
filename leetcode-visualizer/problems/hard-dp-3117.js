"use strict";

const {
  bi,
  parsePlainParams,
  parseIntegerArray,
  createTracer,
} = require("./hard-viz-shared");

const PROBLEM_ID = 3117;

const LIMITS = Object.freeze({
  minNums: 1,
  maxNums: 32,
  minAndValues: 1,
  maxAndValues: 10,
  minValue: 0,
  maxValue: 1_000_000_000,
  maxTraceSteps: 240,
  maxComputationTraceSteps: 210,
  maxMemoRows: 18,
  maxStackItems: 12,
});

const PHASES = Object.freeze([
  bi("Khởi tạo DFS có memo", "Initialize memoized DFS"),
  bi("Mở trạng thái DFS", "Open a DFS state"),
  bi("Mở rộng đoạn hiện tại", "Extend the current segment"),
  bi("Đóng đoạn khớp AND", "Close an AND-matching segment"),
  bi("Ghi hoặc đọc memo", "Write or reuse memo"),
  bi("Cắt khi bit đích đã mất", "Prune after a target bit is lost"),
  bi("Dựng lại các đoạn", "Reconstruct segments"),
  bi("Kết quả", "Result"),
]);

const LEGEND = Object.freeze([
  { label: bi("Trạng thái DFS đang xét", "Active DFS state"), state: "active" },
  { label: bi("Chuyển trạng thái ứng viên", "Candidate transition"), state: "candidate" },
  { label: bi("Lựa chọn tối ưu", "Optimal choice"), state: "chosen" },
  { label: bi("Giá trị đã memo", "Memoized value"), state: "memo" },
  { label: bi("Đoạn đã dựng lại", "Reconstructed segment"), state: "success" },
  { label: bi("Trạng thái bất khả thi", "Impossible state"), state: "danger" },
]);

const SOURCE = Object.freeze([
  "from functools import cache",
  "from sys import setrecursionlimit",
  "from typing import List",
  "",
  "class Solution:",
  "    def minimumValueSum(self, nums: List[int], andValues: List[int]) -> int:",
  "        n, m = len(nums), len(andValues)",
  "        setrecursionlimit(max(1000, 3 * n + 10))",
  "        INF = 10**18",
  "        choice = {}",
  "",
  "        @cache",
  "        def dfs(i: int, j: int, running_and: int) -> int:",
  "            if i == n:",
  "                return 0 if j == m else INF",
  "            if j == m:",
  "                return INF",
  "",
  "            next_and = running_and & nums[i]",
  "            target = andValues[j]",
  "            if (next_and & target) != target:",
  "                return INF",
  "",
  "            extend = dfs(i + 1, j, next_and)",
  "            best = extend",
  "            choice[(i, j, running_and)] = \"extend\"",
  "",
  "            if next_and == target:",
  "                suffix = dfs(i + 1, j + 1, -1)",
  "                close = nums[i] + suffix if suffix < INF else INF",
  "                if close <= best and close < INF:",
  "                    best = close",
  "                    choice[(i, j, running_and)] = \"close\"",
  "",
  "            return best",
  "",
  "        answer = dfs(0, 0, -1)",
  "        if answer >= INF:",
  "            return -1",
  "",
  "        segments = []",
  "        i = j = start = 0",
  "        running_and = -1",
  "        while i < n:",
  "            action = choice[(i, j, running_and)]",
  "            running_and &= nums[i]",
  "            if action == \"close\":",
  "                segments.append((start, i))",
  "                j += 1",
  "                start = i + 1",
  "                running_and = -1",
  "            i += 1",
  "        return answer",
]);

function sourceLine(fragment) {
  const index = SOURCE.findIndex((line) => line.includes(fragment));
  if (index < 0) throw new Error(`#${PROBLEM_ID}: missing Python source fragment: ${fragment}`);
  return index + 1;
}

const CODE_LINES = Object.freeze({
  setup: [sourceLine("n, m = len(nums)"), sourceLine("INF = 10**18"), sourceLine("choice = {}")],
  state: [sourceLine("def dfs(i: int"), sourceLine("next_and = running_and")],
  terminal: [sourceLine("if i == n:"), sourceLine("return 0 if j == m"), sourceLine("if j == m:")],
  prune: [sourceLine("if (next_and & target)")],
  extend: [sourceLine("extend = dfs"), sourceLine("best = extend")],
  close: [sourceLine("if next_and == target:"), sourceLine("suffix = dfs"), sourceLine("close = nums[i]")],
  choose: [sourceLine("if close <= best"), sourceLine("best = close"), sourceLine("choice[(i, j, running_and)] = \"close\"")],
  memo: [sourceLine("@cache"), sourceLine("return best")],
  reconstruct: [sourceLine("segments = []"), sourceLine("while i < n:"), sourceLine("action = choice"), sourceLine("segments.append")],
  result: [sourceLine("answer = dfs"), sourceLine("return -1"), SOURCE.length],
});

function parseMinimumValueSum3117Input(input, params = {}) {
  const safeParams = parsePlainParams(params, PROBLEM_ID);
  const nums = parseIntegerArray(input, {
    problemId: PROBLEM_ID,
    name: "nums",
    minLength: LIMITS.minNums,
    maxLength: LIMITS.maxNums,
    minValue: LIMITS.minValue,
    maxValue: LIMITS.maxValue,
  });
  const andValues = parseIntegerArray(safeParams.andValues, {
    problemId: PROBLEM_ID,
    name: "andValues",
    minLength: LIMITS.minAndValues,
    maxLength: Math.min(LIMITS.maxAndValues, nums.length),
    minValue: LIMITS.minValue,
    maxValue: LIMITS.maxValue,
  });
  return { nums: [...nums], andValues: [...andValues] };
}

function memoKey(i, j, runningAnd) {
  return `${i}|${j}|${runningAnd}`;
}

function formatAnd(value) {
  if (value === -1) return "ALL (−1)";
  return `${value} (0b${value.toString(2)})`;
}

function shortAnd(value) {
  return value === -1 ? "ALL" : String(value);
}

function displayCost(value, inf) {
  return value === null || value === undefined ? "—" : value >= inf ? "∞" : value;
}

function decisionLabel(decision) {
  if (decision === "extend") return bi("mở rộng", "extend");
  if (decision === "close") return bi("đóng đoạn", "close");
  if (decision === "done") return bi("hoàn tất", "done");
  if (decision === "impossible") return bi("bất khả thi", "impossible");
  if (decision === "pruned") return bi("đã cắt", "pruned");
  return "—";
}

function inclusiveIndices(start, end, length) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) return [];
  const result = [];
  for (let index = Math.max(0, start); index <= Math.min(end, length - 1); index += 1) {
    result.push(index);
  }
  return result;
}

function buildSteps3117(input, params = {}) {
  const { nums, andValues } = parseMinimumValueSum3117Input(input, params);
  const n = nums.length;
  const m = andValues.length;
  const inf = nums.reduce((sum, value) => sum + value, 0) + 1;
  const memo = new Map();
  const memoDetails = new Map();
  const memoOrder = [];
  const choice = new Map();
  const stack = [];
  const segments = [];
  const groupByIndex = Array(n).fill(-1);
  const stats = {
    calls: 0,
    memoHits: 0,
    statesComputed: 0,
    bitPrunes: 0,
    extendTransitions: 0,
    closeTransitions: 0,
    maxDepth: 0,
  };
  let answer = null;
  let emittedComputationSteps = 0;
  let selectiveTraceOmitted = false;

  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: PHASES,
    maxSteps: LIMITS.maxTraceSteps,
    baseArray: nums,
    legend: LEGEND,
  });

  function saveMemo(key, value, detail) {
    if (!memo.has(key)) {
      memoOrder.push(key);
      stats.statesComputed += 1;
    }
    memo.set(key, value);
    memoDetails.set(key, { ...detail, result: value });
    return value;
  }

  function buildMemoTable(options) {
    const keys = memoOrder.slice(-LIMITS.maxMemoRows);
    if (options.key && !keys.includes(options.key)) {
      if (keys.length >= LIMITS.maxMemoRows) keys.shift();
      keys.push(options.key);
    }

    const rows = keys.map((key) => {
      const detail = memoDetails.get(key) || (key === options.key ? options : {});
      let state = "memo";
      if (key === options.key) state = "active";
      else if (detail.decision === "pruned") state = "danger";
      else if (detail.result >= inf) state = "invalid";
      return {
        label: key,
        state,
        cells: [
          detail.i ?? "—",
          detail.j ?? "—",
          detail.runningAnd === undefined ? "—" : formatAnd(detail.runningAnd),
          detail.nextAnd === null || detail.nextAnd === undefined ? "—" : formatAnd(detail.nextAnd),
          detail.target === null || detail.target === undefined ? "—" : formatAnd(detail.target),
          displayCost(detail.result ?? detail.best, inf),
          decisionLabel(detail.decision),
        ],
      };
    });

    if (!rows.length) {
      rows.push({
        label: bi("memo rỗng", "empty memo"),
        state: "pending",
        cells: ["—", "—", "—", "—", "—", "—", "—"],
      });
    }

    return {
      title: bi(
        `Cửa sổ ${Math.min(keys.length, LIMITS.maxMemoRows)} trạng thái DFS/memo`,
        `Window of ${Math.min(keys.length, LIMITS.maxMemoRows)} DFS/memo states`,
      ),
      columns: [
        "i",
        "j",
        bi("AND vào", "incoming AND"),
        bi("AND sau nums[i]", "AND after nums[i]"),
        bi("đích", "target"),
        bi("chi phí nhỏ nhất", "minimum cost"),
        bi("choice", "choice"),
      ],
      rows,
    };
  }

  function buildDfsStack() {
    if (!stack.length) {
      return [{
        label: bi("Stack DFS rỗng", "Empty DFS stack"),
        sub: bi("Chưa mở trạng thái", "No state is open"),
        state: "pending",
      }];
    }
    const visible = stack.slice(-LIMITS.maxStackItems);
    const hidden = stack.length - visible.length;
    return visible.map((frame, index) => ({
      label: `dfs(${frame.i}, ${frame.j}, ${shortAnd(frame.runningAnd)})`,
      sub: bi(
        `đoạn g${frame.j + 1}: [${frame.segmentStart}..${Math.max(frame.segmentStart - 1, frame.i - 1)}]${hidden && index === 0 ? ` · ẩn ${hidden} frame` : ""}`,
        `group ${frame.j + 1}: [${frame.segmentStart}..${Math.max(frame.segmentStart - 1, frame.i - 1)}]${hidden && index === 0 ? ` · ${hidden} hidden frames` : ""}`,
      ),
      state: index === visible.length - 1 ? "active" : "pending",
    }));
  }

  function buildTransitionGroups(options) {
    const hasTransition = options.nextAnd !== null && options.nextAnd !== undefined
      && options.target !== null && options.target !== undefined;
    const targetPreserved = hasTransition
      ? (options.nextAnd & options.target) === options.target
      : null;
    const canClose = hasTransition && options.nextAnd === options.target;
    const extendState = options.decision === "extend"
      ? "chosen"
      : options.extendCost !== null && options.extendCost !== undefined
        ? (options.extendCost >= inf ? "invalid" : "candidate")
        : "pending";
    const closeState = options.decision === "close"
      ? "chosen"
      : !canClose
        ? "invalid"
        : options.closeCost !== null && options.closeCost !== undefined
          ? (options.closeCost >= inf ? "invalid" : "candidate")
          : "candidate";

    const segmentItems = segments.length
      ? segments.map((segment) => ({
        label: `g${segment.group + 1} [${segment.start}..${segment.end}]`,
        value: `[${segment.values.join(", ")}] · AND=${segment.andValue} · last=${segment.last}`,
        state: "success",
      }))
      : [{
        label: bi("Witness", "Witness"),
        value: answer === -1
          ? bi("Không tồn tại phân hoạch hợp lệ", "No valid partition exists")
          : bi("Chưa dựng đoạn", "No segment reconstructed yet"),
        state: answer === -1 ? "danger" : "pending",
      }];

    return [
      {
        title: bi("Hai chuyển trạng thái", "Extend-versus-close transitions"),
        items: [
          {
            label: bi("Mở rộng đoạn", "Extend segment"),
            value: displayCost(options.extendCost, inf),
            state: extendState,
          },
          {
            label: bi("Đóng đoạn + phần đuôi", "Close segment + suffix"),
            value: canClose ? displayCost(options.closeCost, inf) : bi("AND chưa bằng đích", "AND does not equal target"),
            state: closeState,
          },
          {
            label: bi("Bit đích còn được giữ", "Target bits remain present"),
            value: targetPreserved === null
              ? "—"
              : targetPreserved
                ? bi("Có", "Yes")
                : bi("Không", "No"),
            state: targetPreserved === null ? "muted" : targetPreserved ? "success" : "danger",
          },
        ],
      },
      {
        title: bi("Trạng thái hiện tại", "Current state"),
        items: [
          { label: "i", value: options.i ?? "—", state: "active" },
          { label: "j", value: options.j ?? "—" },
          {
            label: bi("AND đang chạy", "Running AND"),
            value: options.nextAnd === null || options.nextAnd === undefined ? "—" : formatAnd(options.nextAnd),
            state: "active",
          },
          {
            label: bi("AND đích", "Target AND"),
            value: options.target === null || options.target === undefined ? "—" : formatAnd(options.target),
            state: "candidate",
          },
          {
            label: bi("Giá trị memo/best", "Memo/best value"),
            value: displayCost(options.best, inf),
            state: options.best !== null && options.best !== undefined && options.best < inf ? "memo" : "pending",
          },
        ],
      },
      {
        title: bi("Các đoạn dựng từ choice", "Segments reconstructed from choice"),
        items: segmentItems,
      },
    ];
  }

  function buildAndSequence(options) {
    if (options.showWitness && segments.length) {
      const sequence = [];
      segments.forEach((segment) => {
        let running = -1;
        for (let index = segment.start; index <= segment.end; index += 1) {
          const before = running;
          running &= nums[index];
          sequence.push({
            label: `g${segment.group + 1} · i=${index}`,
            value: `${shortAnd(before)} & ${nums[index]} = ${running}`,
            state: index === segment.end ? "chosen" : "success",
          });
        }
      });
      return sequence;
    }

    const start = options.segmentStart;
    const end = options.sequenceEnd ?? options.i;
    if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && start <= end && end < n) {
      const sequence = [];
      let running = -1;
      for (let index = start; index <= end; index += 1) {
        const before = running;
        running &= nums[index];
        sequence.push({
          label: `i=${index}`,
          value: `${shortAnd(before)} & ${nums[index]} = ${running}`,
          state: index === end ? "active" : "computed",
        });
      }
      return sequence;
    }

    return nums.map((value, index) => ({
      label: `i=${index}`,
      value,
      state: answer === -1 ? "invalid" : "idle",
    }));
  }

  function emit(config, force = false) {
    if (!force && emittedComputationSteps >= LIMITS.maxComputationTraceSteps) {
      if (!selectiveTraceOmitted) {
        tracer.truncate();
        selectiveTraceOmitted = true;
      }
      return false;
    }
    if (!force) emittedComputationSteps += 1;

    const options = {
      i: config.i ?? null,
      j: config.j ?? null,
      runningAnd: config.runningAnd ?? null,
      nextAnd: config.nextAnd ?? null,
      target: config.target ?? null,
      extendCost: config.extendCost ?? null,
      closeCost: config.closeCost ?? null,
      best: config.best ?? null,
      decision: config.decision ?? null,
      segmentStart: config.segmentStart ?? null,
      sequenceEnd: config.sequenceEnd ?? null,
      key: config.key ?? null,
      showWitness: Boolean(config.showWitness),
    };
    const activeEnd = Number.isInteger(options.i) ? Math.min(options.i, n - 1) : -1;
    const highlight = config.highlight ?? inclusiveIndices(options.segmentStart, activeEnd, n);
    const mark = config.mark ?? groupByIndex
      .map((group, index) => group >= 0 ? index : -1)
      .filter((index) => index >= 0);
    const currentGroup = options.j === null || options.j >= m ? "—" : `${options.j + 1}/${m}`;

    return tracer.emit({
      phaseIndex: config.phaseIndex,
      title: config.title,
      note: config.note,
      action: config.action,
      formula: config.formula,
      codeLines: config.codeLines,
      vars: [
        { name: "i", value: options.i ?? "—" },
        { name: "j", value: options.j ?? "—" },
        { name: bi("AND vào", "incoming AND"), value: options.runningAnd === null ? "—" : formatAnd(options.runningAnd) },
        { name: bi("AND mới", "next AND"), value: options.nextAnd === null ? "—" : formatAnd(options.nextAnd) },
        { name: bi("đích", "target"), value: options.target === null ? "—" : formatAnd(options.target) },
        { name: bi("choice", "choice"), value: decisionLabel(options.decision) },
        { name: bi("best", "best"), value: displayCost(options.best, inf) },
      ],
      arr: nums,
      sub: nums.map((value, index) => {
        if (groupByIndex[index] >= 0) {
          const segment = segments[groupByIndex[index]];
          return `g${groupByIndex[index] + 1}${index === segment.end ? " · end" : ""}`;
        }
        if (Number.isInteger(options.segmentStart) && index >= options.segmentStart && index <= activeEnd) {
          return `g${(options.j ?? 0) + 1} · AND path`;
        }
        return `nums[${index}]=${value}`;
      }),
      highlight,
      mark,
      metrics: [
        { label: bi("Phần tử", "Elements"), value: `${n}/${LIMITS.maxNums}` },
        { label: bi("Nhóm đích", "Target groups"), value: `${m}/${LIMITS.maxAndValues}` },
        { label: bi("Nhóm hiện tại", "Current group"), value: currentGroup, state: options.j === null ? "muted" : "active" },
        { label: bi("Lời gọi DFS", "DFS calls"), value: stats.calls },
        { label: bi("Trạng thái memo", "Memo states"), value: memo.size, state: "memo" },
        { label: bi("Memo hit", "Memo hits"), value: stats.memoHits, state: stats.memoHits ? "memo" : "muted" },
        { label: bi("Độ sâu lớn nhất", "Maximum depth"), value: stats.maxDepth },
        { label: bi("Nhánh mất bit", "Lost-bit prunes"), value: stats.bitPrunes, state: stats.bitPrunes ? "warning" : "muted" },
        { label: bi("Chuyển mở rộng", "Extend transitions"), value: stats.extendTransitions },
        { label: bi("Chuyển đóng", "Close transitions"), value: stats.closeTransitions },
      ],
      table: buildMemoTable(options),
      queue: buildDfsStack(),
      groups: buildTransitionGroups(options),
      sequence: buildAndSequence(options),
      final: Boolean(config.final),
      answer: config.final ? answer : null,
    });
  }

  emit({
    phaseIndex: 0,
    title: bi("Khởi tạo trạng thái dfs(0, 0, ALL)", "Initialize state dfs(0, 0, ALL)"),
    note: bi(
      "runningAnd bắt đầu bằng −1 (mọi bit 1). Mỗi trạng thái sẽ thử giữ nums[i] trong đoạn hiện tại hoặc đóng đoạn nếu AND đúng bằng đích.",
      "runningAnd starts at −1 (all bits set). Each state either keeps nums[i] in the current segment or closes the segment when its AND exactly equals the target.",
    ),
    action: bi("Tạo memo và bảng choice rỗng.", "Create empty memo and choice tables."),
    formula: bi("dfs(i, j, a) = chi phí nhỏ nhất từ i với AND trước i là a", "dfs(i, j, a) = minimum suffix cost from i with pre-i AND a"),
    codeLines: CODE_LINES.setup,
    i: 0,
    j: 0,
    runningAnd: -1,
    segmentStart: 0,
    sequenceEnd: 0,
    key: memoKey(0, 0, -1),
  });

  function dfs(i, j, runningAnd, segmentStart) {
    stats.calls += 1;
    const key = memoKey(i, j, runningAnd);
    stack.push({ i, j, runningAnd, segmentStart, key });
    stats.maxDepth = Math.max(stats.maxDepth, stack.length);
    const leave = (value) => {
      stack.pop();
      return value;
    };

    if (memo.has(key)) {
      stats.memoHits += 1;
      const cached = memo.get(key);
      const detail = memoDetails.get(key);
      emit({
        phaseIndex: 4,
        title: bi(`Dùng memo cho ${key}`, `Reuse memo for ${key}`),
        note: bi(
          "Trạng thái này đã được giải chính xác; DFS không mở lại các nhánh extend/close của nó.",
          "This state was solved exactly, so DFS does not reopen its extend/close branches.",
        ),
        action: bi("Đọc chi phí từ memo.", "Read the cost from memo."),
        formula: bi(`memo[${key}] = ${displayCost(cached, inf)}`, `memo[${key}] = ${displayCost(cached, inf)}`),
        codeLines: CODE_LINES.memo,
        ...detail,
        key,
        segmentStart,
        sequenceEnd: i - 1,
        best: cached,
      });
      return leave(cached);
    }

    if (i === n) {
      const result = j === m ? 0 : inf;
      const decision = j === m ? "done" : "impossible";
      saveMemo(key, result, {
        i, j, runningAnd, nextAnd: null, target: null, decision,
      });
      emit({
        phaseIndex: 4,
        title: j === m
          ? bi("Đã dùng hết phần tử và đích", "Consumed all elements and targets")
          : bi("Hết phần tử trước khi đủ nhóm", "Elements ended before all groups closed"),
        note: j === m
          ? bi("Mọi đoạn đã được đóng, nên phần đuôi có chi phí 0.", "Every segment has closed, so the suffix cost is 0.")
          : bi("Còn AND đích nhưng không còn phần tử để tạo đoạn.", "Targets remain but no elements remain to form a segment."),
        action: bi("Giải trạng thái kết thúc.", "Resolve the terminal state."),
        formula: bi(`i = n ⇒ ${j === m ? "0" : "∞"}`, `i = n ⇒ ${j === m ? "0" : "∞"}`),
        codeLines: CODE_LINES.terminal,
        i, j, runningAnd, segmentStart, sequenceEnd: i - 1, key, best: result, decision,
      });
      return leave(result);
    }

    if (j === m) {
      saveMemo(key, inf, {
        i, j, runningAnd, nextAnd: null, target: null, decision: "impossible",
      });
      emit({
        phaseIndex: 4,
        title: bi("Đã hết nhóm nhưng vẫn còn phần tử", "Targets ended while elements remain"),
        note: bi(
          "Phân hoạch phải dùng toàn bộ nums, vì vậy trạng thái này bất khả thi.",
          "The partition must consume all of nums, so this state is impossible.",
        ),
        action: bi("Kết thúc trạng thái không hợp lệ.", "Terminate an invalid state."),
        formula: bi("j = m và i < n ⇒ ∞", "j = m and i < n ⇒ ∞"),
        codeLines: CODE_LINES.terminal,
        i, j, runningAnd, segmentStart, sequenceEnd: i - 1, key, best: inf, decision: "impossible",
      });
      return leave(inf);
    }

    const nextAnd = runningAnd & nums[i];
    const target = andValues[j];
    emit({
      phaseIndex: 1,
      title: bi(`Mở dfs(${i}, ${j}, ${shortAnd(runningAnd)})`, `Open dfs(${i}, ${j}, ${shortAnd(runningAnd)})`),
      note: bi(
        `Thêm nums[${i}]=${nums[i]} làm AND của đoạn hiện tại đổi thành ${nextAnd}.`,
        `Including nums[${i}]=${nums[i]} changes the current segment AND to ${nextAnd}.`,
      ),
      action: bi("Cập nhật running AND trước khi rẽ nhánh.", "Update the running AND before branching."),
      formula: bi(`${shortAnd(runningAnd)} & ${nums[i]} = ${nextAnd}`, `${shortAnd(runningAnd)} & ${nums[i]} = ${nextAnd}`),
      codeLines: CODE_LINES.state,
      i, j, runningAnd, nextAnd, target, segmentStart, sequenceEnd: i, key,
    });

    if ((nextAnd & target) !== target) {
      stats.bitPrunes += 1;
      saveMemo(key, inf, {
        i, j, runningAnd, nextAnd, target, decision: "pruned",
      });
      emit({
        phaseIndex: 5,
        title: bi("Bit bắt buộc của target đã mất", "A required target bit was lost"),
        note: bi(
          "Phép AND chỉ có thể tắt thêm bit khi đoạn dài ra. Một bit 1 của target đã thành 0 nên không phần mở rộng nào có thể khôi phục nó.",
          "AND can only clear more bits as the segment grows. A target 1-bit is now 0, so no extension can restore it.",
        ),
        action: bi("Cắt đúng theo bất biến bit đơn điệu.", "Prune only by the monotone-bit invariant."),
        formula: bi(`(${nextAnd} & ${target}) ≠ ${target} ⇒ ∞`, `(${nextAnd} & ${target}) ≠ ${target} ⇒ ∞`),
        codeLines: CODE_LINES.prune,
        i, j, runningAnd, nextAnd, target, segmentStart, sequenceEnd: i, key,
        best: inf, decision: "pruned",
      });
      return leave(inf);
    }

    stats.extendTransitions += 1;
    const extendCost = dfs(i + 1, j, nextAnd, segmentStart);
    emit({
      phaseIndex: 2,
      title: bi(`Thử mở rộng qua i=${i}`, `Try extending through i=${i}`),
      note: bi(
        "Không cộng nums[i]: phần tử cuối đoạn chỉ được tính khi đoạn được đóng.",
        "Do not add nums[i]: a segment's last value is charged only when that segment closes.",
      ),
      action: bi("Giữ cùng target j và chuyển sang i+1.", "Keep target j and advance to i+1."),
      formula: bi(`extend = dfs(${i + 1}, ${j}, ${nextAnd}) = ${displayCost(extendCost, inf)}`, `extend = dfs(${i + 1}, ${j}, ${nextAnd}) = ${displayCost(extendCost, inf)}`),
      codeLines: CODE_LINES.extend,
      i, j, runningAnd, nextAnd, target, segmentStart, sequenceEnd: i, key,
      extendCost, best: extendCost,
    });

    let closeCost = inf;
    if (nextAnd === target) {
      stats.closeTransitions += 1;
      const suffixCost = dfs(i + 1, j + 1, -1, i + 1);
      closeCost = suffixCost < inf ? nums[i] + suffixCost : inf;
      emit({
        phaseIndex: 3,
        title: bi(`Thử đóng nhóm ${j + 1} tại i=${i}`, `Try closing group ${j + 1} at i=${i}`),
        note: bi(
          `AND của [${segmentStart}..${i}] đúng bằng andValues[${j}]=${target}; nếu đóng, chi phí cộng phần tử cuối ${nums[i]}.`,
          `The AND of [${segmentStart}..${i}] equals andValues[${j}]=${target}; closing charges its last value ${nums[i]}.`,
        ),
        action: bi("Đóng đoạn và reset AND về ALL cho nhóm kế.", "Close the segment and reset AND to ALL for the next group."),
        formula: bi(`close = ${nums[i]} + dfs(${i + 1}, ${j + 1}, ALL) = ${displayCost(closeCost, inf)}`, `close = ${nums[i]} + dfs(${i + 1}, ${j + 1}, ALL) = ${displayCost(closeCost, inf)}`),
        codeLines: CODE_LINES.close,
        i, j, runningAnd, nextAnd, target, segmentStart, sequenceEnd: i, key,
        extendCost, closeCost, best: Math.min(extendCost, closeCost),
      });
    }

    let best = extendCost;
    let decision = "extend";
    if (closeCost <= best && closeCost < inf) {
      best = closeCost;
      decision = "close";
    }
    if (best >= inf) decision = "impossible";
    if (best < inf) choice.set(key, decision);
    saveMemo(key, best, {
      i, j, runningAnd, nextAnd, target, extendCost, closeCost, decision,
    });

    emit({
      phaseIndex: 4,
      title: best < inf
        ? bi(`Memo ${key} = ${best}`, `Memo ${key} = ${best}`)
        : bi(`Memo ${key} = ∞`, `Memo ${key} = ∞`),
      note: best < inf
        ? bi(
          `So sánh đầy đủ hai khả năng hợp lệ và lưu choice=${decision} để dựng witness.`,
          `Compare both valid alternatives and save choice=${decision} for witness reconstruction.`,
        )
        : bi(
          "Không nhánh nào hoàn tất được toàn bộ số nhóm và phần tử.",
          "Neither branch can consume every target group and element.",
        ),
      action: bi("Ghi kết quả chính xác của trạng thái.", "Memoize the state's exact result."),
      formula: bi(`memo[${key}] = min(${displayCost(extendCost, inf)}, ${displayCost(closeCost, inf)}) = ${displayCost(best, inf)}`, `memo[${key}] = min(${displayCost(extendCost, inf)}, ${displayCost(closeCost, inf)}) = ${displayCost(best, inf)}`),
      codeLines: decision === "close" ? CODE_LINES.choose : CODE_LINES.memo,
      i, j, runningAnd, nextAnd, target, segmentStart, sequenceEnd: i, key,
      extendCost, closeCost, best, decision,
    });
    return leave(best);
  }

  const optimum = dfs(0, 0, -1, 0);
  answer = optimum >= inf ? -1 : optimum;

  if (answer !== -1) {
    let i = 0;
    let j = 0;
    let start = 0;
    let runningAnd = -1;
    let reconstructedCost = 0;

    while (i < n) {
      const key = memoKey(i, j, runningAnd);
      const action = choice.get(key);
      if (action !== "extend" && action !== "close") {
        throw new Error(`#${PROBLEM_ID}: missing reconstruction choice for ${key}`);
      }
      const incomingAnd = runningAnd;
      const nextAnd = runningAnd & nums[i];

      if (action === "close") {
        const segment = {
          group: j,
          start,
          end: i,
          target: andValues[j],
          andValue: nextAnd,
          last: nums[i],
          values: nums.slice(start, i + 1),
        };
        segments.push(segment);
        for (let index = start; index <= i; index += 1) groupByIndex[index] = j;
        reconstructedCost += nums[i];

        emit({
          phaseIndex: 6,
          title: bi(`Dựng g${j + 1} = [${start}..${i}]`, `Reconstruct g${j + 1} = [${start}..${i}]`),
          note: bi(
            `Choice đã lưu đóng đoạn với AND=${nextAnd}; phần tử cuối ${nums[i]} nâng tổng witness lên ${reconstructedCost}.`,
            `The saved choice closes a segment with AND=${nextAnd}; last value ${nums[i]} raises the witness total to ${reconstructedCost}.`,
          ),
          action: bi("Ghi biên đoạn liên tiếp từ choice.", "Record contiguous boundaries from choice."),
          formula: bi(`AND(nums[${start}..${i}]) = ${nextAnd} = target[${j}]`, `AND(nums[${start}..${i}]) = ${nextAnd} = target[${j}]`),
          codeLines: CODE_LINES.reconstruct,
          i, j, runningAnd: incomingAnd, nextAnd, target: andValues[j], segmentStart: start,
          sequenceEnd: i, key, best: memo.get(key), decision: "close", showWitness: true,
          highlight: inclusiveIndices(start, i, n),
        }, true);

        j += 1;
        start = i + 1;
        runningAnd = -1;
      } else {
        runningAnd = nextAnd;
      }
      i += 1;
    }

    const segmentsAreValid = j === m
      && start === n
      && reconstructedCost === answer
      && segments.length === m
      && segments.every((segment, group) => {
        const actualAnd = segment.values.reduce((value, number) => value & number, -1);
        return segment.group === group
          && segment.start <= segment.end
          && actualAnd === segment.target
          && segment.andValue === segment.target;
      });
    if (!segmentsAreValid || groupByIndex.some((group) => group < 0)) {
      throw new Error(`#${PROBLEM_ID}: reconstructed segments do not match the optimum`);
    }
  }

  const rootDetail = memoDetails.get(memoKey(0, 0, -1)) || {};
  emit({
    phaseIndex: 7,
    title: answer === -1
      ? bi("Không có phân hoạch hợp lệ", "No valid partition exists")
      : bi(`Tổng nhỏ nhất là ${answer}`, `The minimum sum is ${answer}`),
    note: answer === -1
      ? bi(
        "DFS đầy đủ không tìm được cách chia toàn bộ nums thành đúng số nhóm có AND yêu cầu.",
        "The complete DFS found no way to divide all of nums into exactly the required AND groups.",
      )
      : bi(
        `Choice dựng được ${segments.length} đoạn liên tiếp; tổng các phần tử cuối là ${segments.map((segment) => segment.last).join(" + ")} = ${answer}.`,
        `Choice reconstructs ${segments.length} contiguous segments; their last values sum to ${segments.map((segment) => segment.last).join(" + ")} = ${answer}.`,
      ),
    action: answer === -1
      ? bi("Trả −1.", "Return −1.")
      : bi("Trả chi phí tối ưu cùng witness đã kiểm tra.", "Return the optimum with its validated witness."),
    formula: answer === -1
      ? bi("dfs(0, 0, ALL) = ∞ ⇒ answer = −1", "dfs(0, 0, ALL) = ∞ ⇒ answer = −1")
      : bi(`answer = ${segments.map((segment) => segment.last).join(" + ")} = ${answer}`, `answer = ${segments.map((segment) => segment.last).join(" + ")} = ${answer}`),
    codeLines: CODE_LINES.result,
    i: 0,
    j: 0,
    runningAnd: -1,
    nextAnd: rootDetail.nextAnd ?? null,
    target: rootDetail.target ?? null,
    segmentStart: 0,
    sequenceEnd: n - 1,
    key: memoKey(0, 0, -1),
    extendCost: rootDetail.extendCost ?? null,
    closeCost: rootDetail.closeCost ?? null,
    best: optimum,
    decision: rootDetail.decision ?? (answer === -1 ? "impossible" : null),
    showWitness: true,
    final: true,
    highlight: [],
    mark: answer === -1 ? [] : Array.from({ length: n }, (_, index) => index),
  }, true);

  const segmentWitness = segments.map((segment) => ({
    group: segment.group,
    start: segment.start,
    end: segment.end,
    target: segment.target,
    andValue: segment.andValue,
    last: segment.last,
    values: [...segment.values],
  }));

  return {
    original: { nums: [...nums], andValues: [...andValues] },
    answer,
    segments: segmentWitness,
    witness: answer === -1 ? null : {
      segments: segmentWitness,
      lastValues: segmentWitness.map((segment) => segment.last),
      total: answer,
    },
    metrics: { ...stats, memoStates: memo.size },
    steps: tracer.finish(),
  };
}

module.exports = {
  3117: {
    id: 3117,
    difficulty: "hard",
    slug: "minimum-sum-of-values-by-dividing-array",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "memoization", vi: "Ghi nhớ", en: "Memoization" },
      { key: "bitwise-and", vi: "AND theo bit", en: "Bitwise AND" },
      { key: "partition", vi: "Phân hoạch liên tiếp", en: "Contiguous partition" },
    ],
    title: bi(
      "Tổng giá trị nhỏ nhất khi chia mảng",
      "Minimum Sum of Values by Dividing Array",
    ),
    titleVi: bi(
      "Chia mảng theo AND bằng DFS có memo",
      "Partition by AND with memoized DFS",
    ),
    statement: bi(
      "Chia nums thành đúng andValues.length đoạn con liên tiếp, không rỗng sao cho AND của đoạn j bằng andValues[j]. Tối thiểu hóa tổng phần tử cuối của mọi đoạn; trả −1 nếu không thể.",
      "Divide nums into exactly andValues.length nonempty contiguous subarrays so segment j has bitwise AND andValues[j]. Minimize the sum of every segment's last element; return −1 if impossible.",
    ),
    defaultInput: [1, 4, 3, 3, 2],
    defaults: { input: [1, 4, 3, 3, 2], andValues: "[0,3,3,2]" },
    inputKind: "nonneg",
    inputLabel: bi(
      `nums (${LIMITS.minNums}..${LIMITS.maxNums} số nguyên không âm)`,
      `nums (${LIMITS.minNums}..${LIMITS.maxNums} nonnegative integers)`,
    ),
    extraParams: [
      {
        key: "andValues",
        type: "string",
        default: "[0,3,3,2]",
        label: bi(
          `andValues (mảng JSON/CSV, 1..${LIMITS.maxAndValues})`,
          `andValues (JSON/CSV array, 1..${LIMITS.maxAndValues})`,
        ),
      },
    ],
    visualizationLimits: { ...LIMITS },
    approach: [
      bi(
        "dfs(i,j,a) là chi phí nhỏ nhất từ i khi đang tạo nhóm j và AND của phần đoạn trước i là a; memo hóa toàn bộ bộ ba.",
        "dfs(i,j,a) is the minimum suffix cost at i while building group j with pre-i segment AND a; memoize every triple.",
      ),
      bi(
        "Sau nextAnd = a & nums[i], luôn thử extend; chỉ thử close khi nextAnd đúng bằng andValues[j], lúc đó cộng nums[i] và reset AND về −1.",
        "After nextAnd = a & nums[i], always try extend; try close only when nextAnd equals andValues[j], then charge nums[i] and reset AND to −1.",
      ),
      bi(
        "Chỉ cắt khi (nextAnd & target) !== target: AND về sau chỉ mất bit nên bit target đã mất không thể xuất hiện lại. Không dùng cắt tỉa theo thứ tự số học.",
        "Prune only when (nextAnd & target) !== target: future ANDs can only lose bits, so a lost target bit cannot return. No numeric-order pruning is used.",
      ),
      bi(
        "Lưu choice extend/close cho mỗi trạng thái hữu hạn rồi đi lại từ (0,0,−1) để dựng chính xác biên các đoạn và witness.",
        "Store the extend/close choice for every finite state, then replay from (0,0,−1) to reconstruct exact segment boundaries and a witness.",
      ),
    ],
    complexity: {
      time: "O(n · m · B)",
      space: "O(n · m · B)",
      note: bi(
        "B là số giá trị AND tích lũy khác nhau tại một vị trí (không quá số bit + 1). DP và reconstruction chạy đầy đủ; chỉ trace, stack và cửa sổ memo bị giới hạn hiển thị.",
        "B is the number of distinct cumulative AND values at one position (at most bit count + 1). DP and reconstruction run fully; only trace, stack, and memo windows are display-bounded.",
      ),
    },
    code: SOURCE,
    debugMode: "semantic",
    parser: parseMinimumValueSum3117Input,
    parseMinimumValueSum3117Input,
    liveArgs(input, params = {}) {
      const parsed = parseMinimumValueSum3117Input(input, params);
      return [[...parsed.nums], [...parsed.andValues]];
    },
    builder: buildSteps3117,
  },
};
