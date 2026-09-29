"use strict";

// Focused hard bitmask visualizations for LeetCode 1723 and 2172.

const bi = (vi, en) => ({ vi, en });

const LIMITS_1723 = Object.freeze({
  minJobs: 1,
  maxJobs: 12,
  minJobTime: 1,
  maxJobTime: 10_000_000,
  maxWorkers: 12,
  maxStates: 1 << 12,
  maxTraceSteps: 260,
  maxTableRows: 12,
  maxSubsetTraceEvents: 24,
  maxTransitionsPerWorker: 14,
});

const LIMITS_2172 = Object.freeze({
  minNums: 1,
  maxNums: 18,
  minNum: 1,
  maxNum: 15,
  minSlots: 1,
  maxSlots: 9,
  maxStates: 3 ** 9,
  maxTraceSteps: 260,
  maxTableRows: 12,
  maxTransitionsPerNumber: 10,
});

const PHASES_1723 = Object.freeze([
  bi("Tính tổng tập con", "Compute subset sums"),
  bi("Khởi tạo DP", "Initialize DP"),
  bi("Chọn công nhân", "Select worker"),
  bi("Duyệt submask", "Enumerate submasks"),
  bi("Dựng lại phân công", "Reconstruct assignments"),
  bi("Kết quả", "Result"),
]);

const PHASES_2172 = Object.freeze([
  bi("Khởi tạo DP tam phân", "Initialize ternary DP"),
  bi("Giải mã trạng thái", "Decode state"),
  bi("Thử một slot", "Try a slot"),
  bi("Cập nhật DP", "Update DP"),
  bi("Chọn trạng thái đích", "Select terminal state"),
  bi("Dựng lại phân công", "Reconstruct assignments"),
  bi("Kết quả", "Result"),
]);

const SOURCE_1723 = Object.freeze([
  "from typing import List",
  "class Solution:",
  "    def minimumTimeRequired(self, jobs: List[int], k: int) -> int:",
  "        n, size = len(jobs), 1 << len(jobs)",
  "        subset_sum = [0] * size",
  "        for mask in range(1, size):",
  "            bit = mask & -mask",
  "            job = bit.bit_length() - 1",
  "            subset_sum[mask] = subset_sum[mask ^ bit] + jobs[job]",
  "        inf = sum(jobs) + 1",
  "        dp = [[inf] * size for _ in range(k + 1)]",
  "        choice = [[0] * size for _ in range(k + 1)]",
  "        dp[0][0] = 0",
  "        for worker in range(1, k + 1):",
  "            dp[worker][0] = 0",
  "            for mask in range(1, size):",
  "                sub = mask",
  "                while sub:",
  "                    candidate = max(dp[worker - 1][mask ^ sub], subset_sum[sub])",
  "                    if candidate < dp[worker][mask]:",
  "                        dp[worker][mask] = candidate",
  "                        choice[worker][mask] = sub",
  "                    sub = (sub - 1) & mask",
  "        assignments = [[] for _ in range(k)]",
  "        mask = size - 1",
  "        for worker in range(k, 0, -1):",
  "            sub = choice[worker][mask]",
  "            assignments[worker - 1] = [i for i in range(n) if sub >> i & 1]",
  "            mask ^= sub",
  "        return dp[k][size - 1]",
]);

const SOURCE_2172 = Object.freeze([
  "from typing import List",
  "class Solution:",
  "    def maximumANDSum(self, nums: List[int], numSlots: int) -> int:",
  "        powers = [3 ** slot for slot in range(numSlots)]",
  "        states = 3 ** numSlots",
  "        dp = [-1] * states",
  "        parent = [None] * states",
  "        dp[0] = 0",
  "        for state in range(states):",
  "            used = sum((state // powers[slot]) % 3 for slot in range(numSlots))",
  "            if dp[state] < 0 or used >= len(nums):",
  "                continue",
  "            for slot in range(numSlots):",
  "                if (state // powers[slot]) % 3 == 2:",
  "                    continue",
  "                next_state = state + powers[slot]",
  "                candidate = dp[state] + (nums[used] & (slot + 1))",
  "                if candidate > dp[next_state]:",
  "                    dp[next_state] = candidate",
  "                    parent[next_state] = (state, slot)",
  "        best_state = max(",
  "            (state for state in range(states)",
  "             if sum((state // powers[s]) % 3 for s in range(numSlots)) == len(nums)),",
  "            key=lambda state: dp[state],",
  "        )",
  "        assignments = [[] for _ in range(numSlots)]",
  "        state = best_state",
  "        for index in range(len(nums) - 1, -1, -1):",
  "            state, slot = parent[state]",
  "            assignments[slot].append(index)",
  "        return dp[best_state]",
]);

function fail(problemId, ErrorType, vi, en) {
  throw new ErrorType(`#${problemId}: ${vi} / ${en}`);
}

function parseParams(params, problemId) {
  if (params === undefined) return {};
  if (params === null || typeof params !== "object" || Array.isArray(params)) {
    fail(problemId, TypeError, "params phải là một object", "params must be an object");
  }
  const prototype = Object.getPrototypeOf(params);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(problemId, TypeError, "params phải là object thuần", "params must be a plain object");
  }
  return params;
}

function parseCanonicalInteger(value, problemId, name) {
  let parsed = NaN;
  if (typeof value === "number") {
    parsed = value;
  } else if (typeof value === "string") {
    const text = value.trim();
    if (/^(0|[1-9]\d*)$/.test(text)) parsed = Number(text);
  }
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    fail(
      problemId,
      TypeError,
      `${name} phải là số nguyên không âm an toàn`,
      `${name} must be a non-negative safe integer`,
    );
  }
  return parsed;
}

function parsePositiveArray(input, options) {
  const { problemId, name, minLength, maxLength, minValue, maxValue } = options;
  if (!Array.isArray(input)) {
    fail(problemId, TypeError, `${name} phải là một mảng`, `${name} must be an array`);
  }
  if (input.length < minLength || input.length > maxLength) {
    fail(
      problemId,
      RangeError,
      `${name} phải có từ ${minLength} đến ${maxLength} phần tử`,
      `${name} must contain ${minLength} to ${maxLength} elements`,
    );
  }
  const values = [];
  for (let index = 0; index < input.length; index += 1) {
    const value = input[index];
    if (!Number.isSafeInteger(value)) {
      fail(
        problemId,
        TypeError,
        `${name}[${index}] phải là số nguyên an toàn`,
        `${name}[${index}] must be a safe integer`,
      );
    }
    if (value < minValue || value > maxValue) {
      fail(
        problemId,
        RangeError,
        `${name}[${index}] phải thuộc [${minValue}, ${maxValue}]`,
        `${name}[${index}] must be in [${minValue}, ${maxValue}]`,
      );
    }
    values.push(value);
  }
  return values;
}

function parseMinimumTimeRequired1723Input(input, params = {}) {
  const safeParams = parseParams(params, 1723);
  const jobs = parsePositiveArray(input, {
    problemId: 1723,
    name: "jobs",
    minLength: LIMITS_1723.minJobs,
    maxLength: LIMITS_1723.maxJobs,
    minValue: LIMITS_1723.minJobTime,
    maxValue: LIMITS_1723.maxJobTime,
  });
  const k = parseCanonicalInteger(safeParams.k, 1723, "k");
  if (k < 1 || k > LIMITS_1723.maxWorkers || k > jobs.length) {
    fail(
      1723,
      RangeError,
      `k phải thuộc [1, ${jobs.length}]`,
      `k must be in [1, ${jobs.length}]`,
    );
  }
  const states = 1 << jobs.length;
  if (states > LIMITS_1723.maxStates) {
    fail(
      1723,
      RangeError,
      `số trạng thái không được vượt ${LIMITS_1723.maxStates}`,
      `the state count must not exceed ${LIMITS_1723.maxStates}`,
    );
  }
  return { jobs, k };
}

function parseMaximumANDSum2172Input(input, params = {}) {
  const safeParams = parseParams(params, 2172);
  const nums = parsePositiveArray(input, {
    problemId: 2172,
    name: "nums",
    minLength: LIMITS_2172.minNums,
    maxLength: LIMITS_2172.maxNums,
    minValue: LIMITS_2172.minNum,
    maxValue: LIMITS_2172.maxNum,
  });
  const numSlots = parseCanonicalInteger(safeParams.numSlots, 2172, "numSlots");
  if (numSlots < LIMITS_2172.minSlots || numSlots > LIMITS_2172.maxSlots) {
    fail(
      2172,
      RangeError,
      `numSlots phải thuộc [${LIMITS_2172.minSlots}, ${LIMITS_2172.maxSlots}]`,
      `numSlots must be in [${LIMITS_2172.minSlots}, ${LIMITS_2172.maxSlots}]`,
    );
  }
  if (nums.length > 2 * numSlots) {
    fail(
      2172,
      RangeError,
      "nums không được có nhiều hơn 2 × numSlots phần tử",
      "nums must not contain more than 2 × numSlots elements",
    );
  }
  const states = 3 ** numSlots;
  if (states > LIMITS_2172.maxStates) {
    fail(
      2172,
      RangeError,
      `số trạng thái không được vượt ${LIMITS_2172.maxStates}`,
      `the state count must not exceed ${LIMITS_2172.maxStates}`,
    );
  }
  return { nums, numSlots };
}

function cloneJsonSafe(value, path = "$", active = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${path} must contain a finite number`);
    return value;
  }
  if (typeof value !== "object") throw new TypeError(`${path} is not JSON-safe`);
  if (active.has(value)) throw new TypeError(`${path} must not be cyclic`);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null) {
    throw new TypeError(`${path} must contain only plain objects and arrays`);
  }
  active.add(value);
  let clone;
  if (Array.isArray(value)) {
    clone = value.map((entry, index) => cloneJsonSafe(entry, `${path}[${index}]`, active));
  } else {
    clone = {};
    for (const [key, entry] of Object.entries(value)) {
      clone[key] = cloneJsonSafe(entry, `${path}.${key}`, active);
    }
  }
  active.delete(value);
  return clone;
}

function freezeDeep(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}

function validateBilingual(value, field, problemId) {
  if (!value || typeof value !== "object" || typeof value.vi !== "string" || typeof value.en !== "string") {
    throw new TypeError(`#${problemId}: ${field} must be bilingual {vi,en}`);
  }
}

function normalizeIndices(indices, length, problemId, field) {
  if (!Array.isArray(indices)) throw new TypeError(`#${problemId}: ${field} must be an array`);
  const unique = new Set();
  for (const index of indices) {
    if (!Number.isSafeInteger(index) || index < 0 || index >= length) {
      throw new RangeError(`#${problemId}: every ${field} index must be within the arr bounds`);
    }
    unique.add(index);
  }
  return [...unique].sort((left, right) => left - right);
}

function pushSemanticStep(steps, source, problemId, config) {
  validateBilingual(config.title, "title", problemId);
  validateBilingual(config.note, "note", problemId);
  if (!Array.isArray(config.codeLines) || config.codeLines.length === 0
    || config.codeLines.some((line) => !Number.isSafeInteger(line) || line < 1 || line > source.length)) {
    throw new RangeError(`#${problemId}: every codeLines entry must be within 1..${source.length}`);
  }
  if (!Array.isArray(config.vars)) throw new TypeError(`#${problemId}: vars must be an array`);
  if (!Array.isArray(config.arr) || !Array.isArray(config.sub) || config.arr.length !== config.sub.length) {
    throw new TypeError(`#${problemId}: arr and sub must be parallel arrays`);
  }
  if (!config.arr.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new TypeError(`#${problemId}: arr must contain finite numbers`);
  }

  const view = config.hardProblemView;
  if (!view || view.problemId !== problemId || !Number.isSafeInteger(view.phaseIndex)
    || !Array.isArray(view.phases) || view.phaseIndex < 0 || view.phaseIndex >= view.phases.length) {
    throw new TypeError(`#${problemId}: hardProblemView has an invalid problem or phase`);
  }
  view.phases.forEach((phase, index) => validateBilingual(phase, `phases[${index}]`, problemId));
  validateBilingual(view.phase, "phase", problemId);
  validateBilingual(view.action, "action", problemId);
  validateBilingual(view.formula, "formula", problemId);
  if (!Array.isArray(view.metrics) || !Array.isArray(view.legend)
    || typeof view.traceTruncated !== "boolean") {
    throw new TypeError(`#${problemId}: hardProblemView metrics, legend, or traceTruncated is invalid`);
  }

  steps.push({
    title: { ...config.title },
    note: { ...config.note },
    codeLines: [...config.codeLines],
    vars: cloneJsonSafe(config.vars),
    arr: [...config.arr],
    sub: [...config.sub],
    highlight: normalizeIndices(config.highlight, config.arr.length, problemId, "highlight"),
    mark: normalizeIndices(config.mark, config.arr.length, problemId, "mark"),
    final: Boolean(config.final),
    hardProblemView: freezeDeep(cloneJsonSafe(view)),
  });
}

function finishTrace(steps, problemId, maxTraceSteps) {
  if (steps.length === 0 || steps.length > maxTraceSteps || !steps[steps.length - 1].final) {
    throw new Error(`#${problemId}: trace must end within its cap with one terminal final step`);
  }
  if (steps.slice(0, -1).some((step) => step.final)) {
    throw new Error(`#${problemId}: only the terminal step may set final=true`);
  }
  JSON.stringify(steps);
}

function clonePhases(phases) {
  return phases.map((phase) => ({ ...phase }));
}

function indicesFromMask(mask, length) {
  const indices = [];
  for (let index = 0; index < length; index += 1) {
    if ((mask & (1 << index)) !== 0) indices.push(index);
  }
  return indices;
}

function formatBinaryMask(mask, width) {
  return `0b${mask.toString(2).padStart(width, "0")}`;
}

function boundedIndices(size, anchors, limit) {
  const selected = [];
  const seen = new Set();
  const add = (value) => {
    if (selected.length >= limit || !Number.isSafeInteger(value) || value < 0 || value >= size || seen.has(value)) return;
    seen.add(value);
    selected.push(value);
  };
  anchors.forEach(add);
  const pivot = anchors.find((value) => Number.isSafeInteger(value) && value >= 0 && value < size) ?? 0;
  for (let distance = 1; selected.length < limit && (pivot - distance >= 0 || pivot + distance < size); distance += 1) {
    add(pivot - distance);
    add(pivot + distance);
  }
  for (let value = 0; selected.length < limit && value < size; value += 1) add(value);
  return selected.sort((left, right) => left - right);
}

function displayFiniteSentinel(value, sentinel, symbol = "∞") {
  return value === sentinel ? symbol : value;
}

function buildSteps1723(input, params = {}) {
  const { jobs, k } = parseMinimumTimeRequired1723Input(input, params);
  const n = jobs.length;
  const size = 1 << n;
  const fullMask = size - 1;
  const subsetSum = Array(size).fill(0);
  const total = jobs.reduce((sum, value) => sum + value, 0);
  const inf = total + 1;
  const steps = [];
  let traceTruncated = false;
  let dp = null;
  let choice = null;
  let answer = null;
  const assignments = Array.from({ length: k }, () => null);
  const assignmentLoads = Array(k).fill(0);
  const workerByJob = Array(n).fill(-1);

  function buildTable(options) {
    const mask = options.mask === null ? 0 : options.mask;
    const submask = options.submask === null ? 0 : options.submask;
    const remainder = options.remainder === null ? 0 : options.remainder;
    const rows = boundedIndices(
      size,
      [0, mask, submask, remainder, fullMask],
      LIMITS_1723.maxTableRows,
    );
    if (dp === null || choice === null) {
      return {
        title: bi("Tổng thời gian theo subset", "Subset workload sums"),
        columns: [bi("mask", "mask"), bi("job trong subset", "jobs in subset"), bi("subset_sum", "subset_sum")],
        rows: rows.map((state) => ({
          label: formatBinaryMask(state, n),
          state: state === mask ? "active" : state <= options.computedMask ? "computed" : "pending",
          cells: [
            formatBinaryMask(state, n),
            indicesFromMask(state, n).map((index) => `j${index}`).join(", ") || "∅",
            subsetSum[state],
          ],
        })),
      };
    }

    const worker = options.worker === null ? 0 : options.worker;
    const previousWorker = Math.max(0, worker - 1);
    return {
      title: bi(
        `Cửa sổ DP cho công nhân ${worker}`,
        `DP window for worker ${worker}`,
      ),
      columns: [
        bi("mask", "mask"),
        bi("subset_sum", "subset_sum"),
        bi("hàng trước", "previous row"),
        bi("hàng hiện tại", "current row"),
        bi("submask chọn", "chosen submask"),
      ],
      rows: rows.map((state) => {
        const selected = choice[worker][state];
        return {
          label: formatBinaryMask(state, n),
          state: state === mask ? "active" : state === submask ? "candidate" : dp[worker][state] !== inf ? "computed" : "pending",
          cells: [
            formatBinaryMask(state, n),
            subsetSum[state],
            displayFiniteSentinel(dp[previousWorker][state], inf),
            { value: displayFiniteSentinel(dp[worker][state], inf), state: state === mask ? "updated" : "computed" },
            selected === 0 && state !== 0 ? "—" : formatBinaryMask(selected, n),
          ],
        };
      }),
    };
  }

  function makeView(options) {
    const mask = options.mask;
    const submask = options.submask;
    const remainder = options.remainder;
    const worker = options.worker;
    const phase = PHASES_1723[options.phaseIndex];
    const activeJobs = submask === null ? [] : indicesFromMask(submask, n);
    const remainderJobs = remainder === null ? [] : indicesFromMask(remainder, n);
    const currentBest = options.best === null ? "—" : displayFiniteSentinel(options.best, inf);
    const candidate = options.candidate === null ? "—" : displayFiniteSentinel(options.candidate, inf);

    return {
      problemId: 1723,
      phaseIndex: options.phaseIndex,
      phases: clonePhases(PHASES_1723),
      phase: { ...phase },
      action: options.action,
      formula: options.formula,
      metrics: [
        { label: bi("Số job", "Jobs"), value: `${n}/${LIMITS_1723.maxJobs}` },
        { label: bi("Số trạng thái", "States"), value: `${size}/${LIMITS_1723.maxStates}` },
        { label: bi("Công nhân", "Worker"), value: worker === null ? "—" : `${worker}/${k}`, state: worker === null ? "muted" : "active" },
        { label: bi("Mask", "Mask"), value: mask === null ? "—" : formatBinaryMask(mask, n) },
        { label: bi("Submask", "Submask"), value: submask === null ? "—" : formatBinaryMask(submask, n), state: submask === null ? "muted" : "candidate" },
        { label: bi("Ứng viên", "Candidate"), value: candidate },
        { label: bi("Tốt nhất hiện tại", "Current best"), value: currentBest, state: options.updated ? "updated" : "info" },
      ],
      table: buildTable(options),
      queue: Array.from({ length: k }, (_, index) => {
        const assigned = assignments[index];
        let state = "pending";
        if (assigned !== null) state = "success";
        else if (worker === index + 1) state = "active";
        else if (worker !== null && index + 1 < worker) state = "computed";
        return {
          label: `worker ${index + 1}`,
          sub: assigned === null ? "chưa dựng / not rebuilt" : `load=${assignmentLoads[index]}`,
          state,
        };
      }),
      groups: [
        {
          title: bi("Phân hoạch đang xét", "Partition under consideration"),
          items: [
            { label: bi("Job còn lại", "Remaining jobs"), value: remainderJobs.map((index) => `j${index}`).join(", ") || "∅", state: "computed" },
            { label: bi("Job giao worker", "Jobs given to worker"), value: activeJobs.map((index) => `j${index}`).join(", ") || "∅", state: "candidate" },
            { label: "max(previous, load)", value: candidate, state: options.updated ? "updated" : "info" },
          ],
        },
        {
          title: bi("Phân công đã dựng", "Reconstructed assignments"),
          items: assignments.map((assigned, index) => ({
            label: `worker ${index + 1}`,
            value: assigned === null
              ? "—"
              : `${assigned.map((job) => `j${job}=${jobs[job]}`).join(", ") || "∅"} · load=${assignmentLoads[index]}`,
            state: assigned === null ? "pending" : "success",
          })),
        },
      ],
      sequence: jobs.map((job, index) => {
        let state = "idle";
        if (activeJobs.includes(index)) state = "active";
        else if (workerByJob[index] >= 0) state = "success";
        else if (remainderJobs.includes(index)) state = "candidate";
        return { label: `j${index}`, value: job, state };
      }),
      legend: [
        { label: bi("Trạng thái đang xét", "Active state"), state: "active" },
        { label: bi("Submask ứng viên", "Candidate submask"), state: "candidate" },
        { label: bi("Giá trị vừa cải thiện", "Improved value"), state: "updated" },
        { label: bi("Phân công đã dựng", "Reconstructed assignment"), state: "success" },
      ],
      answer: options.final ? answer : null,
      traceTruncated,
    };
  }

  function emit(options) {
    const final = Boolean(options.final);
    if (!final && steps.length >= LIMITS_1723.maxTraceSteps - 1) {
      traceTruncated = true;
      return false;
    }
    if (final && steps.length >= LIMITS_1723.maxTraceSteps) {
      throw new Error("#1723: no trace slot remains for the terminal frame");
    }
    const mask = options.mask ?? null;
    const submask = options.submask ?? null;
    const remainder = options.remainder ?? null;
    const worker = options.worker ?? null;
    const highlight = options.highlight
      ?? (submask === null ? [] : indicesFromMask(submask, n));
    const mark = options.mark
      ?? (remainder === null ? [] : indicesFromMask(remainder, n));
    const best = options.best ?? null;
    const candidate = options.candidate ?? null;
    const viewOptions = {
      ...options,
      mask,
      submask,
      remainder,
      worker,
      best,
      candidate,
      computedMask: options.computedMask ?? 0,
      updated: Boolean(options.updated),
      final,
    };
    pushSemanticStep(steps, SOURCE_1723, 1723, {
      title: options.title,
      note: options.note,
      codeLines: options.codeLines,
      vars: [
        { name: bi("worker", "worker"), value: worker === null ? "—" : worker },
        { name: bi("mask", "mask"), value: mask === null ? "—" : formatBinaryMask(mask, n) },
        { name: bi("submask", "submask"), value: submask === null ? "—" : formatBinaryMask(submask, n) },
        { name: bi("candidate", "candidate"), value: candidate === null ? "—" : displayFiniteSentinel(candidate, inf) },
        { name: bi("best", "best"), value: best === null ? "—" : displayFiniteSentinel(best, inf) },
        { name: bi("phân công", "assignments"), value: assignments.map((assigned) => assigned === null ? [] : [...assigned]) },
      ],
      arr: jobs,
      sub: jobs.map((job, index) => workerByJob[index] < 0
        ? `j${index}: ${job} · unassigned`
        : `j${index}: ${job} · worker ${workerByJob[index] + 1}`),
      highlight,
      mark,
      final,
      hardProblemView: makeView(viewOptions),
    });
    return true;
  }

  emit({
    phaseIndex: 0,
    title: bi("Khởi tạo tổng của mask rỗng", "Initialize the empty-mask sum"),
    note: bi("Mask 0 không chứa job nào nên có tổng thời gian bằng 0.", "Mask 0 contains no jobs, so its workload sum is zero."),
    action: bi("Tạo bảng subset_sum hữu hạn.", "Allocate the finite subset_sum table."),
    formula: bi("subset_sum[0] = 0", "subset_sum[0] = 0"),
    codeLines: [4, 5],
    mask: 0,
    computedMask: 0,
    highlight: [],
    mark: [],
  });

  let subsetTraceEvents = 0;
  let subsetTraceOmitted = false;
  for (let mask = 1; mask < size; mask += 1) {
    const bit = mask & -mask;
    const job = 31 - Math.clz32(bit);
    const previous = mask ^ bit;
    subsetSum[mask] = subsetSum[previous] + jobs[job];
    if (subsetTraceEvents < LIMITS_1723.maxSubsetTraceEvents) {
      emit({
        phaseIndex: 0,
        title: bi(`Tính tổng cho ${formatBinaryMask(mask, n)}`, `Compute the sum for ${formatBinaryMask(mask, n)}`),
        note: bi(
          `Tách bit thấp nhất j${job}; cộng thời gian ${jobs[job]} vào tổng của mask còn lại.`,
          `Remove lowest set bit j${job}; add its duration ${jobs[job]} to the remaining mask's sum.`,
        ),
        action: bi("Mở rộng một subset từ subset nhỏ hơn.", "Extend one subset from a smaller subset."),
        formula: bi(
          `subset_sum[${mask}] = subset_sum[${previous}] + jobs[${job}] = ${subsetSum[mask]}`,
          `subset_sum[${mask}] = subset_sum[${previous}] + jobs[${job}] = ${subsetSum[mask]}`,
        ),
        codeLines: [6, 7, 8, 9],
        mask,
        submask: bit,
        remainder: previous,
        best: subsetSum[mask],
        computedMask: mask,
      });
      subsetTraceEvents += 1;
    } else if (!subsetTraceOmitted) {
      traceTruncated = true;
      subsetTraceOmitted = true;
    }
  }

  dp = Array.from({ length: k + 1 }, () => Array(size).fill(inf));
  choice = Array.from({ length: k + 1 }, () => Array(size).fill(0));
  dp[0][0] = 0;

  emit({
    phaseIndex: 1,
    title: bi("Khởi tạo DP theo công nhân và mask", "Initialize worker-by-mask DP"),
    note: bi(
      "Chỉ trạng thái không giao job cho 0 công nhân có makespan 0; mọi trạng thái khác dùng sentinel hữu hạn sum(jobs)+1.",
      "Only assigning no jobs to zero workers has makespan 0; every other state uses the finite sentinel sum(jobs)+1.",
    ),
    action: bi("Tạo dp và bảng choice để dựng lại.", "Allocate dp and a choice table for reconstruction."),
    formula: bi("dp[0][0] = 0; các ô khác = total + 1", "dp[0][0] = 0; all other cells = total + 1"),
    codeLines: [10, 11, 12, 13],
    worker: 0,
    mask: 0,
    best: 0,
    computedMask: 0,
    highlight: [],
    mark: [],
  });

  for (let worker = 1; worker <= k; worker += 1) {
    dp[worker][0] = 0;
    emit({
      phaseIndex: 2,
      title: bi(`Bắt đầu hàng worker ${worker}`, `Start worker row ${worker}`),
      note: bi(
        "Worker hiện tại có thể nhận subset được chọn; mask còn lại do các worker trước xử lý.",
        "The current worker receives the chosen subset; previous workers handle the remaining mask.",
      ),
      action: bi("Đặt base của hàng rồi duyệt mọi mask.", "Seed the row base, then scan every mask."),
      formula: bi(`dp[${worker}][0] = 0`, `dp[${worker}][0] = 0`),
      codeLines: [14, 15],
      worker,
      mask: 0,
      best: 0,
      computedMask: 0,
      highlight: [],
      mark: [],
    });

    let workerTraceEvents = 0;
    let workerTraceOmitted = false;
    for (let mask = 1; mask < size; mask += 1) {
      for (let submask = mask; submask > 0; submask = (submask - 1) & mask) {
        const remainder = mask ^ submask;
        const candidate = Math.max(dp[worker - 1][remainder], subsetSum[submask]);
        const updated = candidate < dp[worker][mask];
        if (updated) {
          dp[worker][mask] = candidate;
          choice[worker][mask] = submask;
        }

        if (workerTraceEvents < LIMITS_1723.maxTransitionsPerWorker) {
          emit({
            phaseIndex: 3,
            title: updated
              ? bi(`Cải thiện dp[${worker}][${formatBinaryMask(mask, n)}]`, `Improve dp[${worker}][${formatBinaryMask(mask, n)}]`)
              : bi(`Thử submask ${formatBinaryMask(submask, n)}`, `Try submask ${formatBinaryMask(submask, n)}`),
            note: updated
              ? bi(
                "Makespan ứng viên nhỏ hơn giá trị hiện tại, nên lưu cả chi phí và submask để dựng lại.",
                "The candidate makespan is smaller than the current value, so store both its cost and submask for reconstruction.",
              )
              : bi(
                "Ứng viên này không tốt hơn lựa chọn đang lưu; DP vẫn giữ makespan nhỏ nhất.",
                "This candidate does not beat the stored choice; DP keeps the smaller makespan.",
              ),
            action: updated
              ? bi("Ghi một chuyển trạng thái tốt hơn.", "Write an improved transition.")
              : bi("So sánh chuyển trạng thái.", "Compare the transition."),
            formula: bi(
              `max(dp[${worker - 1}][${formatBinaryMask(remainder, n)}], subset_sum[${formatBinaryMask(submask, n)}]) = ${displayFiniteSentinel(candidate, inf)}`,
              `max(dp[${worker - 1}][${formatBinaryMask(remainder, n)}], subset_sum[${formatBinaryMask(submask, n)}]) = ${displayFiniteSentinel(candidate, inf)}`,
            ),
            codeLines: updated ? [19, 20, 21, 22] : [16, 17, 18, 19, 23],
            worker,
            mask,
            submask,
            remainder,
            candidate,
            best: dp[worker][mask],
            updated,
            computedMask: mask,
          });
          workerTraceEvents += 1;
        } else if (!workerTraceOmitted) {
          traceTruncated = true;
          workerTraceOmitted = true;
        }
      }
    }

    emit({
      phaseIndex: 2,
      title: bi(`Hoàn tất hàng worker ${worker}`, `Finish worker row ${worker}`),
      note: bi(
        "Mọi submask đã được xét cho mọi mask; hàng này chứa makespan tối ưu với tối đa số worker hiện có.",
        "Every submask has been considered for every mask; this row holds the optimum using the workers available so far.",
      ),
      action: bi("Chốt hàng DP hiện tại.", "Finalize the current DP row."),
      formula: bi(
        `dp[${worker}][all] = ${dp[worker][fullMask]}`,
        `dp[${worker}][all] = ${dp[worker][fullMask]}`,
      ),
      codeLines: [14, 16, 18, 23],
      worker,
      mask: fullMask,
      best: dp[worker][fullMask],
      computedMask: fullMask,
      highlight: [],
      mark: indicesFromMask(fullMask, n),
    });
  }

  answer = dp[k][fullMask];
  let remainingMask = fullMask;
  for (let worker = k; worker >= 1; worker -= 1) {
    const submask = choice[worker][remainingMask];
    if ((submask & remainingMask) !== submask || (remainingMask !== 0 && submask === 0)) {
      throw new Error(`#1723: invalid reconstruction at worker ${worker}`);
    }
    const assigned = indicesFromMask(submask, n);
    assignments[worker - 1] = assigned;
    assignmentLoads[worker - 1] = assigned.reduce((sum, index) => sum + jobs[index], 0);
    assigned.forEach((index) => {
      if (workerByJob[index] !== -1) throw new Error(`#1723: job ${index} was reconstructed twice`);
      workerByJob[index] = worker - 1;
    });
    const previousMask = remainingMask;
    remainingMask ^= submask;
    emit({
      phaseIndex: 4,
      title: bi(`Dựng phân công worker ${worker}`, `Reconstruct worker ${worker}`),
      note: bi(
        `Choice lưu trong DP giao ${assigned.length} job với tải ${assignmentLoads[worker - 1]} cho worker này.`,
        `The saved DP choice gives this worker ${assigned.length} jobs with load ${assignmentLoads[worker - 1]}.`,
      ),
      action: bi("Lấy submask đã chọn rồi xóa nó khỏi mask.", "Read the chosen submask and remove it from the mask."),
      formula: bi(
        `${formatBinaryMask(previousMask, n)} XOR ${formatBinaryMask(submask, n)} = ${formatBinaryMask(remainingMask, n)}`,
        `${formatBinaryMask(previousMask, n)} XOR ${formatBinaryMask(submask, n)} = ${formatBinaryMask(remainingMask, n)}`,
      ),
      codeLines: [24, 25, 26, 27, 28, 29],
      worker,
      mask: previousMask,
      submask,
      remainder: remainingMask,
      best: answer,
      highlight: assigned,
      mark: workerByJob.map((owner, index) => owner >= 0 ? index : -1).filter((index) => index >= 0),
      computedMask: fullMask,
    });
  }

  if (remainingMask !== 0 || workerByJob.some((worker) => worker < 0)
    || Math.max(...assignmentLoads) !== answer) {
    throw new Error("#1723: reconstructed assignments do not match the optimum");
  }

  emit({
    phaseIndex: 5,
    title: bi(`Makespan nhỏ nhất là ${answer}`, `The minimum makespan is ${answer}`),
    note: bi(
      "Mọi job xuất hiện đúng một lần trong các subset đã dựng; tải lớn nhất bằng đáp án DP.",
      "Every job appears exactly once in the reconstructed subsets; their maximum load equals the DP answer.",
    ),
    action: bi("Trả makespan tối ưu.", "Return the optimal makespan."),
    formula: bi(`answer = dp[${k}][${formatBinaryMask(fullMask, n)}] = ${answer}`, `answer = dp[${k}][${formatBinaryMask(fullMask, n)}] = ${answer}`),
    codeLines: [30],
    worker: k,
    mask: fullMask,
    best: answer,
    final: true,
    highlight: [],
    mark: Array.from({ length: n }, (_, index) => index),
    computedMask: fullMask,
  });

  finishTrace(steps, 1723, LIMITS_1723.maxTraceSteps);
  return {
    original: { jobs: [...jobs], k },
    answer,
    steps,
  };
}

function ternaryDigits(state, numSlots, powers) {
  return powers.map((power) => Math.floor(state / power) % 3);
}

function formatTernaryState(state, numSlots, powers) {
  return `[${ternaryDigits(state, numSlots, powers).join(",")}]₃`;
}

function buildSteps2172(input, params = {}) {
  const { nums, numSlots } = parseMaximumANDSum2172Input(input, params);
  const n = nums.length;
  const powers = Array.from({ length: numSlots }, (_, slot) => 3 ** slot);
  const stateCount = 3 ** numSlots;
  const dp = Array(stateCount).fill(-1);
  const parentState = new Int32Array(stateCount);
  const parentSlot = new Int8Array(stateCount);
  parentState.fill(-1);
  parentSlot.fill(-1);
  const occupancyCount = new Uint8Array(stateCount);
  for (let state = 1; state < stateCount; state += 1) {
    occupancyCount[state] = occupancyCount[Math.floor(state / 3)] + (state % 3);
  }
  dp[0] = 0;

  const steps = [];
  const assignments = Array.from({ length: numSlots }, () => []);
  const slotByNum = Array(n).fill(-1);
  let traceTruncated = false;
  let bestKnownScore = 0;
  let bestState = null;
  let answer = null;

  function buildTable(options) {
    const activeState = options.activeState === null ? 0 : options.activeState;
    const nextState = options.nextState === null ? 0 : options.nextState;
    const terminal = bestState === null ? stateCount - 1 : bestState;
    const rows = boundedIndices(
      stateCount,
      [0, activeState, nextState, terminal, stateCount - 1],
      LIMITS_2172.maxTableRows,
    );
    return {
      title: bi("Cửa sổ trạng thái occupancy cơ số 3", "Base-3 occupancy state window"),
      columns: [
        bi("state", "state"),
        bi("occupancy theo slot", "occupancy by slot"),
        bi("số nums đã đặt", "numbers placed"),
        bi("điểm tốt nhất", "best score"),
        bi("parent", "parent"),
        bi("slot chọn", "chosen slot"),
      ],
      rows: rows.map((state) => {
        let rowState = dp[state] >= 0 ? "computed" : "pending";
        if (state === activeState) rowState = "active";
        if (state === nextState && options.updated) rowState = "updated";
        if (bestState !== null && state === bestState) rowState = "success";
        return {
          label: `s=${state}`,
          state: rowState,
          cells: [
            state,
            formatTernaryState(state, numSlots, powers),
            occupancyCount[state],
            { value: dp[state] < 0 ? "—" : dp[state], state: rowState },
            parentState[state] < 0 ? "—" : parentState[state],
            parentSlot[state] < 0 ? "—" : parentSlot[state] + 1,
          ],
        };
      }),
    };
  }

  function makeView(options) {
    const phase = PHASES_2172[options.phaseIndex];
    const stateForSlots = options.nextState ?? options.activeState ?? bestState ?? 0;
    const occupancy = ternaryDigits(stateForSlots, numSlots, powers);
    const activeIndex = options.currentIndex;
    const activeSlot = options.slot;
    const gain = options.gain;
    const candidate = options.candidate;
    return {
      problemId: 2172,
      phaseIndex: options.phaseIndex,
      phases: clonePhases(PHASES_2172),
      phase: { ...phase },
      action: options.action,
      formula: options.formula,
      metrics: [
        { label: bi("Số nums", "Numbers"), value: `${n}/${LIMITS_2172.maxNums}` },
        { label: bi("Số slot", "Slots"), value: `${numSlots}/${LIMITS_2172.maxSlots}` },
        { label: bi("Số trạng thái", "States"), value: `${stateCount}/${LIMITS_2172.maxStates}` },
        { label: bi("Index đang đặt", "Current index"), value: activeIndex === null ? "—" : activeIndex, state: activeIndex === null ? "muted" : "active" },
        { label: bi("Slot", "Slot"), value: activeSlot === null ? "—" : activeSlot + 1, state: activeSlot === null ? "muted" : "candidate" },
        { label: bi("Điểm cộng", "Gain"), value: gain === null ? "—" : gain },
        { label: bi("Điểm ứng viên", "Candidate score"), value: candidate === null ? "—" : candidate, state: options.updated ? "updated" : "info" },
        { label: bi("Điểm tốt nhất đã thấy", "Best score seen"), value: bestKnownScore, state: "success" },
      ],
      table: buildTable(options),
      queue: occupancy.map((count, slot) => ({
        label: `slot ${slot + 1}`,
        sub: `${count}/2`,
        state: slot === activeSlot ? "active" : count === 2 ? "success" : count === 1 ? "candidate" : "idle",
      })),
      groups: [
        {
          title: bi("Chuyển trạng thái", "State transition"),
          items: [
            { label: bi("Số đang đặt", "Number being placed"), value: activeIndex === null ? "—" : `nums[${activeIndex}]=${nums[activeIndex]}`, state: activeIndex === null ? "muted" : "active" },
            { label: bi("Slot thử", "Tried slot"), value: activeSlot === null ? "—" : activeSlot + 1, state: activeSlot === null ? "muted" : "candidate" },
            { label: "num & slot", value: gain === null ? "—" : gain, state: "info" },
            { label: bi("Ứng viên", "Candidate"), value: candidate === null ? "—" : candidate, state: options.updated ? "updated" : "info" },
          ],
        },
        {
          title: bi("Phân công đã dựng", "Reconstructed assignments"),
          items: assignments.map((indices, slot) => ({
            label: `slot ${slot + 1}`,
            value: indices.length === 0
              ? "—"
              : indices.map((index) => `#${index}=${nums[index]}`).join(", "),
            state: indices.length === 0 ? "pending" : "success",
          })),
        },
      ],
      sequence: nums.map((num, index) => {
        let state = "idle";
        if (index === activeIndex) state = "active";
        else if (slotByNum[index] >= 0) state = "success";
        else if (index < options.used) state = "computed";
        return { label: `#${index}`, value: num, state };
      }),
      legend: [
        { label: bi("Trạng thái đang mở rộng", "State being expanded"), state: "active" },
        { label: bi("Slot còn chỗ", "Slot with capacity"), state: "candidate" },
        { label: bi("Điểm vừa cải thiện", "Improved score"), state: "updated" },
        { label: bi("Phân công đã dựng", "Reconstructed assignment"), state: "success" },
      ],
      answer: options.final ? answer : null,
      traceTruncated,
    };
  }

  function emit(options) {
    const final = Boolean(options.final);
    if (!final && steps.length >= LIMITS_2172.maxTraceSteps - 1) {
      traceTruncated = true;
      return false;
    }
    if (final && steps.length >= LIMITS_2172.maxTraceSteps) {
      throw new Error("#2172: no trace slot remains for the terminal frame");
    }
    const activeState = options.activeState ?? null;
    const nextState = options.nextState ?? null;
    const currentIndex = options.currentIndex ?? null;
    const slot = options.slot ?? null;
    const gain = options.gain ?? null;
    const candidate = options.candidate ?? null;
    const used = options.used ?? 0;
    const highlight = options.highlight
      ?? (currentIndex === null ? [] : [currentIndex]);
    const mark = options.mark
      ?? Array.from({ length: Math.min(used, n) }, (_, index) => index);
    const viewOptions = {
      ...options,
      activeState,
      nextState,
      currentIndex,
      slot,
      gain,
      candidate,
      used,
      updated: Boolean(options.updated),
      final,
    };
    pushSemanticStep(steps, SOURCE_2172, 2172, {
      title: options.title,
      note: options.note,
      codeLines: options.codeLines,
      vars: [
        { name: bi("state", "state"), value: activeState === null ? "—" : activeState },
        { name: bi("occupancy", "occupancy"), value: activeState === null ? [] : ternaryDigits(activeState, numSlots, powers) },
        { name: bi("index", "index"), value: currentIndex === null ? "—" : currentIndex },
        { name: bi("slot", "slot"), value: slot === null ? "—" : slot + 1 },
        { name: bi("gain", "gain"), value: gain === null ? "—" : gain },
        { name: bi("candidate", "candidate"), value: candidate === null ? "—" : candidate },
        { name: bi("phân công", "assignments"), value: assignments.map((indices) => [...indices]) },
      ],
      arr: nums,
      sub: nums.map((num, index) => slotByNum[index] < 0
        ? `#${index}: ${num} · unassigned`
        : `#${index}: ${num} · slot ${slotByNum[index] + 1}`),
      highlight,
      mark,
      final,
      hardProblemView: makeView(viewOptions),
    });
    return true;
  }

  emit({
    phaseIndex: 0,
    title: bi("Khởi tạo trạng thái occupancy rỗng", "Initialize the empty occupancy state"),
    note: bi(
      "Mỗi chữ số cơ số 3 là số phần tử trong một slot: 0, 1 hoặc 2. State 0 có điểm 0.",
      "Each base-3 digit is one slot's occupancy: 0, 1, or 2. State 0 has score 0.",
    ),
    action: bi("Tạo powers, dp và parent.", "Allocate powers, dp, and parent."),
    formula: bi("dp[0] = 0; dp[state khác] = -1", "dp[0] = 0; every other dp[state] = -1"),
    codeLines: [4, 5, 6, 7, 8],
    activeState: 0,
    used: 0,
    highlight: [],
    mark: [],
  });

  const levelAnnounced = Array(n).fill(false);
  const transitionTraceCount = Array(n).fill(0);
  const transitionTraceOmitted = Array(n).fill(false);

  for (let state = 0; state < stateCount; state += 1) {
    const used = occupancyCount[state];
    if (dp[state] < 0 || used >= n) continue;

    if (!levelAnnounced[used]) {
      emit({
        phaseIndex: 1,
        title: bi(`Giải mã state ${state}`, `Decode state ${state}`),
        note: bi(
          `Tổng các chữ số occupancy là ${used}, nên số tiếp theo là nums[${used}]=${nums[used]}.`,
          `The occupancy digits sum to ${used}, so the next number is nums[${used}]=${nums[used]}.`,
        ),
        action: bi("Suy ra index từ tổng occupancy.", "Derive the index from total occupancy."),
        formula: bi(
          `used = sum(${formatTernaryState(state, numSlots, powers)}) = ${used}`,
          `used = sum(${formatTernaryState(state, numSlots, powers)}) = ${used}`,
        ),
        codeLines: [9, 10, 11, 12],
        activeState: state,
        currentIndex: used,
        used,
      });
      levelAnnounced[used] = true;
    }

    for (let slot = 0; slot < numSlots; slot += 1) {
      const occupancy = Math.floor(state / powers[slot]) % 3;
      if (occupancy === 2) continue;
      const nextState = state + powers[slot];
      const gain = nums[used] & (slot + 1);
      const candidate = dp[state] + gain;
      const updated = candidate > dp[nextState];
      if (updated) {
        dp[nextState] = candidate;
        parentState[nextState] = state;
        parentSlot[nextState] = slot;
        if (candidate > bestKnownScore) bestKnownScore = candidate;
      }

      if (transitionTraceCount[used] < LIMITS_2172.maxTransitionsPerNumber) {
        emit({
          phaseIndex: updated ? 3 : 2,
          title: updated
            ? bi(`Cải thiện state ${nextState}`, `Improve state ${nextState}`)
            : bi(`Thử slot ${slot + 1}`, `Try slot ${slot + 1}`),
          note: updated
            ? bi(
              "Slot còn sức chứa và ứng viên tốt hơn điểm đã lưu, nên cập nhật score cùng parent.",
              "The slot has capacity and the candidate beats the saved score, so update both score and parent.",
            )
            : bi(
              "Slot còn sức chứa nhưng ứng viên không cải thiện state đích.",
              "The slot has capacity, but this candidate does not improve the destination state.",
            ),
          action: updated
            ? bi("Ghi score và cạnh parent tốt hơn.", "Store the improved score and parent edge.")
            : bi("So sánh điểm ứng viên.", "Compare the candidate score."),
          formula: bi(
            `dp[${state}] + (${nums[used]} & ${slot + 1}) = ${dp[state]} + ${gain} = ${candidate}`,
            `dp[${state}] + (${nums[used]} & ${slot + 1}) = ${dp[state]} + ${gain} = ${candidate}`,
          ),
          codeLines: updated ? [13, 14, 16, 17, 18, 19, 20] : [13, 14, 16, 17, 18],
          activeState: state,
          nextState,
          currentIndex: used,
          slot,
          gain,
          candidate,
          updated,
          used,
        });
        transitionTraceCount[used] += 1;
      } else if (!transitionTraceOmitted[used]) {
        traceTruncated = true;
        transitionTraceOmitted[used] = true;
      }
    }
  }

  let bestScore = -1;
  for (let state = 0; state < stateCount; state += 1) {
    if (occupancyCount[state] === n && dp[state] > bestScore) {
      bestScore = dp[state];
      bestState = state;
    }
  }
  if (bestState === null || bestScore < 0) {
    throw new Error("#2172: no reachable terminal occupancy state");
  }
  answer = bestScore;

  emit({
    phaseIndex: 4,
    title: bi(`Chọn terminal state ${bestState}`, `Select terminal state ${bestState}`),
    note: bi(
      "Chỉ các state có tổng occupancy bằng nums.length là hoàn chỉnh; chọn state có score lớn nhất.",
      "Only states whose total occupancy equals nums.length are complete; choose the one with maximum score.",
    ),
    action: bi("Quét mọi state hoàn chỉnh.", "Scan every complete state."),
    formula: bi(`best = dp[${bestState}] = ${answer}`, `best = dp[${bestState}] = ${answer}`),
    codeLines: [21, 22, 23, 24, 25],
    activeState: bestState,
    used: n,
    candidate: answer,
    highlight: [],
    mark: Array.from({ length: n }, (_, index) => index),
  });

  let state = bestState;
  for (let index = n - 1; index >= 0; index -= 1) {
    const slot = parentSlot[state];
    const previous = parentState[state];
    if (slot < 0 || slot >= numSlots || previous < 0 || previous >= stateCount
      || state !== previous + powers[slot]) {
      throw new Error(`#2172: invalid reconstruction at nums[${index}]`);
    }
    assignments[slot].unshift(index);
    slotByNum[index] = slot;
    const childState = state;
    state = previous;
    emit({
      phaseIndex: 5,
      title: bi(`Gán nums[${index}] vào slot ${slot + 1}`, `Assign nums[${index}] to slot ${slot + 1}`),
      note: bi(
        `Parent của state ${childState} cho biết lần chuyển cuối đã đặt giá trị ${nums[index]} vào slot ${slot + 1}.`,
        `The parent of state ${childState} shows that the last transition placed value ${nums[index]} into slot ${slot + 1}.`,
      ),
      action: bi("Đi ngược một cạnh parent.", "Follow one parent edge backward."),
      formula: bi(
        `${childState} - 3^${slot} = ${previous}; ${nums[index]} & ${slot + 1} = ${nums[index] & (slot + 1)}`,
        `${childState} - 3^${slot} = ${previous}; ${nums[index]} & ${slot + 1} = ${nums[index] & (slot + 1)}`,
      ),
      codeLines: [26, 27, 28, 29, 30],
      activeState: childState,
      nextState: previous,
      currentIndex: index,
      slot,
      gain: nums[index] & (slot + 1),
      candidate: answer,
      used: n,
      highlight: [index],
      mark: slotByNum.map((assignedSlot, numIndex) => assignedSlot >= 0 ? numIndex : -1).filter((numIndex) => numIndex >= 0),
    });
  }

  const reconstructedScore = slotByNum.reduce(
    (score, slot, index) => score + (nums[index] & (slot + 1)),
    0,
  );
  if (state !== 0 || slotByNum.some((slot) => slot < 0)
    || assignments.some((indices) => indices.length > 2)
    || reconstructedScore !== answer) {
    throw new Error("#2172: reconstructed assignment does not match the optimum");
  }

  emit({
    phaseIndex: 6,
    title: bi(`Maximum AND sum là ${answer}`, `The maximum AND sum is ${answer}`),
    note: bi(
      "Mỗi số được gán đúng một lần, không slot nào chứa quá hai số, và tổng dựng lại bằng DP tối ưu.",
      "Every number is assigned exactly once, no slot contains more than two numbers, and the reconstructed score equals the DP optimum.",
    ),
    action: bi("Trả score tối đa.", "Return the maximum score."),
    formula: bi(`answer = dp[${bestState}] = ${answer}`, `answer = dp[${bestState}] = ${answer}`),
    codeLines: [31],
    activeState: bestState,
    used: n,
    candidate: answer,
    final: true,
    highlight: [],
    mark: Array.from({ length: n }, (_, index) => index),
  });

  finishTrace(steps, 2172, LIMITS_2172.maxTraceSteps);
  return {
    original: { nums: [...nums], numSlots },
    answer,
    steps,
  };
}

module.exports = {
  1723: {
    id: 1723,
    difficulty: "hard",
    slug: "find-minimum-time-to-finish-all-jobs",
    category: { key: "bitmask", vi: "Bitmask / Quy hoạch động", en: "Bitmask / Dynamic Programming" },
    tags: [
      { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
      { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "subset-dp", vi: "DP tập con", en: "Subset DP" },
    ],
    title: bi("Thời gian tối thiểu để hoàn thành mọi công việc", "Find Minimum Time to Finish All Jobs"),
    titleVi: bi("Phân công job tối ưu bằng DP tập con", "Optimal job assignment with subset DP"),
    statement: bi(
      "Giao mỗi job cho đúng một trong k công nhân. Mỗi công nhân làm tuần tự các job của mình; hãy tối thiểu hóa tải lớn nhất của một công nhân.",
      "Assign every job to exactly one of k workers. Each worker processes assigned jobs sequentially; minimize the maximum worker load.",
    ),
    defaultInput: [3, 2, 3],
    defaults: { input: [3, 2, 3], k: 3 },
    inputKind: "positive",
    inputLabel: bi("jobs (1..12 thời gian dương)", "jobs (1..12 positive durations)"),
    extraParams: [
      {
        key: "k",
        type: "number",
        min: 1,
        max: LIMITS_1723.maxWorkers,
        default: 3,
        label: bi("k (số công nhân, không quá số job)", "k (workers, at most the job count)"),
      },
    ],
    visualizationLimits: { ...LIMITS_1723 },
    approach: [
      bi("Tiền xử lý subset_sum[mask] bằng cách bỏ bit thấp nhất, nên mọi tải subset có trong O(2^n).", "Precompute subset_sum[mask] by removing its lowest set bit, giving every subset load in O(2^n)."),
      bi("dp[w][mask] là makespan nhỏ nhất khi các worker 1..w xử lý đúng tập job mask.", "dp[w][mask] is the minimum makespan when workers 1..w process exactly the jobs in mask."),
      bi("Giao sub ⊆ mask cho worker w và lấy max(dp[w−1][mask xor sub], subset_sum[sub]); tối thiểu hóa trên mọi submask.", "Give sub ⊆ mask to worker w and take max(dp[w−1][mask xor sub], subset_sum[sub]); minimize over every submask."),
      bi("Lưu submask tốt nhất cho mỗi ô để dựng lại subset của từng công nhân.", "Store the best submask for each cell to reconstruct every worker's subset."),
    ],
    complexity: {
      time: "O(2^n + k · 3^n)",
      space: "O(k · 2^n)",
      note: bi(
        "Tổng số cặp (mask, submask) là 3^n. Toàn bộ DP và reconstruction luôn chạy; chỉ trace và bảng hiển thị bị chặn.",
        "There are 3^n (mask, submask) pairs. The full DP and reconstruction always run; only emitted trace and table snapshots are capped.",
      ),
    },
    code: SOURCE_1723,
    debugMode: "semantic",
    parser: parseMinimumTimeRequired1723Input,
    parseMinimumTimeRequired1723Input,
    liveArgs: (input, params = {}) => {
      const parsed = parseMinimumTimeRequired1723Input(input, params);
      return [[...parsed.jobs], parsed.k];
    },
    builder: buildSteps1723,
  },

  2172: {
    id: 2172,
    difficulty: "hard",
    slug: "maximum-and-sum-of-array",
    category: { key: "bitmask", vi: "Bitmask / Quy hoạch động", en: "Bitmask / Dynamic Programming" },
    tags: [
      { key: "bitmask", vi: "Bitmask tam phân", en: "Ternary Mask" },
      { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "state-compression", vi: "Nén trạng thái", en: "State Compression" },
    ],
    title: bi("Tổng AND lớn nhất của mảng", "Maximum AND Sum of Array"),
    titleVi: bi("Gán tối đa hai số mỗi slot bằng DP cơ số 3", "Assign at most two numbers per slot with base-3 DP"),
    statement: bi(
      "Gán mỗi số vào một trong numSlots slot, mỗi slot chứa tối đa hai số. Điểm của số num trong slot đánh số từ 1 là num & slot; tối đa hóa tổng điểm.",
      "Assign every number to one of numSlots slots, with capacity two per slot. Placing num in a 1-based slot scores num & slot; maximize the total score.",
    ),
    defaultInput: [1, 2, 3, 4, 5, 6],
    defaults: { input: [1, 2, 3, 4, 5, 6], numSlots: 3 },
    inputKind: "positive",
    inputLabel: bi("nums (1..18 giá trị trong 1..15)", "nums (1..18 values in 1..15)"),
    extraParams: [
      {
        key: "numSlots",
        type: "number",
        min: LIMITS_2172.minSlots,
        max: LIMITS_2172.maxSlots,
        default: 3,
        label: bi("numSlots (1..9, sức chứa 2)", "numSlots (1..9, capacity 2)"),
      },
    ],
    visualizationLimits: { ...LIMITS_2172 },
    approach: [
      bi("Mã hóa occupancy của mỗi slot bằng một chữ số cơ số 3: 0, 1 hoặc 2.", "Encode each slot's occupancy as one base-3 digit: 0, 1, or 2."),
      bi("Tổng chữ số của state cho biết bao nhiêu số đầu tiên đã được gán và do đó xác định nums[index] tiếp theo.", "The state digit sum gives how many prefix numbers are assigned and therefore identifies the next nums[index]."),
      bi("Với mỗi slot chưa đầy, tăng chữ số đó một đơn vị và cộng nums[index] & (slot+1).", "For every non-full slot, increment its digit and add nums[index] & (slot+1)."),
      bi("Lưu parent state và slot của mỗi cải thiện để dựng lại một phân công tối ưu có sức chứa hợp lệ.", "Store the parent state and slot for every improvement to reconstruct one capacity-valid optimum assignment."),
    ],
    complexity: {
      time: "O(numSlots · 3^numSlots)",
      space: "O(3^numSlots)",
      note: bi(
        "Mỗi state thử tối đa numSlots chuyển trạng thái. DP đầy đủ luôn được tính; trace, bảng và chuỗi hiển thị đều có giới hạn hữu hạn.",
        "Each state tries at most numSlots transitions. The complete DP is always computed; trace, tables, and displayed sequences remain finitely bounded.",
      ),
    },
    code: SOURCE_2172,
    debugMode: "semantic",
    parser: parseMaximumANDSum2172Input,
    parseMaximumANDSum2172Input,
    liveArgs: (input, params = {}) => {
      const parsed = parseMaximumANDSum2172Input(input, params);
      return [[...parsed.nums], parsed.numSlots];
    },
    builder: buildSteps2172,
  },
};
