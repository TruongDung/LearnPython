"use strict";

const {
  bi,
  fail,
  parsePlainParams,
  parseInteger,
  createTracer,
} = require("./hard-viz-shared");

const PROBLEM_ID = 1723;

const LIMITS = Object.freeze({
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

const PHASES = Object.freeze([
  bi("Tính tổng tập con", "Compute subset sums"),
  bi("Khởi tạo DP", "Initialize DP"),
  bi("Chọn công nhân", "Select worker"),
  bi("Duyệt submask", "Enumerate submasks"),
  bi("Dựng lại phân công", "Reconstruct assignments"),
  bi("Kết quả", "Result"),
]);

const LEGEND = Object.freeze([
  { label: bi("Trạng thái đang xét", "Active state"), state: "active" },
  { label: bi("Submask ứng viên", "Candidate submask"), state: "candidate" },
  { label: bi("Giá trị vừa cải thiện", "Improved value"), state: "updated" },
  { label: bi("Phân công đã dựng", "Reconstructed assignment"), state: "success" },
]);

const SOURCE = Object.freeze([
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

function parseMinimumTimeRequired1723Input(input, params = {}) {
  const safeParams = parsePlainParams(params, PROBLEM_ID);
  if (!Array.isArray(input)) {
    fail(PROBLEM_ID, TypeError, "jobs phải là một mảng", "jobs must be an array");
  }
  if (input.length < LIMITS.minJobs || input.length > LIMITS.maxJobs) {
    fail(
      PROBLEM_ID,
      RangeError,
      `jobs phải có từ ${LIMITS.minJobs} đến ${LIMITS.maxJobs} phần tử`,
      `jobs must contain ${LIMITS.minJobs} to ${LIMITS.maxJobs} elements`,
    );
  }

  const jobs = input.map((value, index) => {
    if (!Number.isSafeInteger(value)) {
      fail(
        PROBLEM_ID,
        TypeError,
        `jobs[${index}] phải là số nguyên an toàn`,
        `jobs[${index}] must be a safe integer`,
      );
    }
    if (value < LIMITS.minJobTime || value > LIMITS.maxJobTime) {
      fail(
        PROBLEM_ID,
        RangeError,
        `jobs[${index}] phải thuộc [${LIMITS.minJobTime}, ${LIMITS.maxJobTime}]`,
        `jobs[${index}] must be in [${LIMITS.minJobTime}, ${LIMITS.maxJobTime}]`,
      );
    }
    return value;
  });

  const k = parseInteger(safeParams.k, {
    problemId: PROBLEM_ID,
    name: "k",
    min: 1,
    max: Math.min(LIMITS.maxWorkers, jobs.length),
  });
  const stateCount = 1 << jobs.length;
  if (stateCount > LIMITS.maxStates) {
    fail(
      PROBLEM_ID,
      RangeError,
      `số trạng thái không được vượt ${LIMITS.maxStates}`,
      `the state count must not exceed ${LIMITS.maxStates}`,
    );
  }
  return { jobs: [...jobs], k };
}

function indicesFromMask(mask, length) {
  const indices = [];
  for (let index = 0; index < length; index += 1) {
    if ((mask & (1 << index)) !== 0) indices.push(index);
  }
  return indices;
}

function formatMask(mask, width) {
  return `0b${mask.toString(2).padStart(width, "0")}`;
}

function boundedIndices(size, anchors, limit) {
  const selected = [];
  const seen = new Set();
  const add = (value) => {
    if (selected.length >= limit || !Number.isSafeInteger(value)
      || value < 0 || value >= size || seen.has(value)) return;
    seen.add(value);
    selected.push(value);
  };
  anchors.forEach(add);
  const pivot = anchors.find((value) => Number.isSafeInteger(value)
    && value >= 0 && value < size) ?? 0;
  for (let distance = 1;
    selected.length < limit && (pivot - distance >= 0 || pivot + distance < size);
    distance += 1) {
    add(pivot - distance);
    add(pivot + distance);
  }
  for (let value = 0; selected.length < limit && value < size; value += 1) add(value);
  return selected.sort((left, right) => left - right);
}

function displaySentinel(value, sentinel) {
  return value === sentinel ? "∞" : value;
}

function buildSteps1723(input, params = {}) {
  const { jobs, k } = parseMinimumTimeRequired1723Input(input, params);
  const n = jobs.length;
  const size = 1 << n;
  const fullMask = size - 1;
  const subsetSum = Array(size).fill(0);
  const total = jobs.reduce((sum, value) => sum + value, 0);
  const inf = total + 1;
  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: PHASES,
    maxSteps: LIMITS.maxTraceSteps,
    baseArray: jobs,
    legend: LEGEND,
  });

  let dp = null;
  let choice = null;
  let answer = null;
  const assignments = Array.from({ length: k }, () => null);
  const assignmentLoads = Array(k).fill(0);
  const workerByJob = Array(n).fill(-1);

  function buildTable(options) {
    const mask = options.mask ?? 0;
    const submask = options.submask ?? 0;
    const remainder = options.remainder ?? 0;
    const rows = boundedIndices(
      size,
      [0, mask, submask, remainder, fullMask],
      LIMITS.maxTableRows,
    );

    if (dp === null || choice === null) {
      return {
        title: bi("Tổng thời gian theo subset", "Subset workload sums"),
        columns: [
          bi("mask", "mask"),
          bi("job trong subset", "jobs in subset"),
          bi("subset_sum", "subset_sum"),
        ],
        rows: rows.map((state) => ({
          label: formatMask(state, n),
          state: state === mask
            ? "active"
            : state <= options.computedMask ? "computed" : "pending",
          cells: [
            formatMask(state, n),
            indicesFromMask(state, n).map((index) => `j${index}`).join(", ") || "∅",
            subsetSum[state],
          ],
        })),
      };
    }

    const worker = options.worker ?? 0;
    const previousWorker = Math.max(0, worker - 1);
    return {
      title: bi(`Cửa sổ DP cho công nhân ${worker}`, `DP window for worker ${worker}`),
      columns: [
        bi("mask", "mask"),
        bi("subset_sum", "subset_sum"),
        bi("hàng trước", "previous row"),
        bi("hàng hiện tại", "current row"),
        bi("submask chọn", "chosen submask"),
      ],
      rows: rows.map((state) => {
        const selected = choice[worker][state];
        let rowState = dp[worker][state] === inf ? "pending" : "computed";
        if (state === submask && state !== mask) rowState = "candidate";
        if (state === mask) rowState = "active";
        return {
          label: formatMask(state, n),
          state: rowState,
          cells: [
            formatMask(state, n),
            subsetSum[state],
            displaySentinel(dp[previousWorker][state], inf),
            {
              value: displaySentinel(dp[worker][state], inf),
              state: state === mask && options.updated ? "updated" : "computed",
            },
            selected === 0 && state !== 0 ? "—" : formatMask(selected, n),
          ],
        };
      }),
    };
  }

  function buildQueue(options) {
    return Array.from({ length: k }, (_, index) => {
      const assigned = assignments[index];
      let state = "pending";
      if (assigned !== null) state = "success";
      else if (options.worker === index + 1) state = "active";
      else if (options.worker !== null && index + 1 < options.worker) state = "computed";
      return {
        label: `worker ${index + 1}`,
        sub: assigned === null
          ? bi("chưa dựng", "not rebuilt")
          : `load=${assignmentLoads[index]}`,
        state,
      };
    });
  }

  function buildGroups(options) {
    const activeJobs = options.submask === null ? [] : indicesFromMask(options.submask, n);
    const remainderJobs = options.remainder === null ? [] : indicesFromMask(options.remainder, n);
    const candidate = options.candidate === null
      ? "—"
      : displaySentinel(options.candidate, inf);
    return [
      {
        title: bi("Phân hoạch đang xét", "Partition under consideration"),
        items: [
          {
            label: bi("Job còn lại", "Remaining jobs"),
            value: remainderJobs.map((index) => `j${index}`).join(", ") || "∅",
            state: "computed",
          },
          {
            label: bi("Job giao worker", "Jobs given to worker"),
            value: activeJobs.map((index) => `j${index}`).join(", ") || "∅",
            state: "candidate",
          },
          {
            label: "max(previous, load)",
            value: candidate,
            state: options.updated ? "updated" : "info",
          },
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
    ];
  }

  function buildSequence(options) {
    const activeJobs = new Set(options.submask === null
      ? []
      : indicesFromMask(options.submask, n));
    const remainderJobs = new Set(options.remainder === null
      ? []
      : indicesFromMask(options.remainder, n));
    return jobs.map((job, index) => {
      let state = "idle";
      if (activeJobs.has(index)) state = "active";
      else if (workerByJob[index] >= 0) state = "success";
      else if (remainderJobs.has(index)) state = "candidate";
      return { label: `j${index}`, value: job, state };
    });
  }

  function emit(config) {
    const options = {
      ...config,
      worker: config.worker ?? null,
      mask: config.mask ?? null,
      submask: config.submask ?? null,
      remainder: config.remainder ?? null,
      candidate: config.candidate ?? null,
      best: config.best ?? null,
      computedMask: config.computedMask ?? 0,
      updated: Boolean(config.updated),
    };
    const candidate = options.candidate === null
      ? "—"
      : displaySentinel(options.candidate, inf);
    const best = options.best === null ? "—" : displaySentinel(options.best, inf);
    const highlight = config.highlight
      ?? (options.submask === null ? [] : indicesFromMask(options.submask, n));
    const mark = config.mark
      ?? (options.remainder === null ? [] : indicesFromMask(options.remainder, n));

    return tracer.emit({
      phaseIndex: config.phaseIndex,
      title: config.title,
      note: config.note,
      action: config.action,
      formula: config.formula,
      codeLines: config.codeLines,
      vars: [
        { name: bi("worker", "worker"), value: options.worker ?? "—" },
        { name: bi("mask", "mask"), value: options.mask === null ? "—" : formatMask(options.mask, n) },
        { name: bi("submask", "submask"), value: options.submask === null ? "—" : formatMask(options.submask, n) },
        { name: bi("candidate", "candidate"), value: candidate },
        { name: bi("tốt nhất", "best"), value: best },
        {
          name: bi("phân công", "assignments"),
          value: assignments.map((assigned) => assigned === null ? [] : [...assigned]),
        },
      ],
      arr: jobs,
      sub: jobs.map((job, index) => workerByJob[index] < 0
        ? `j${index}: ${job} · unassigned`
        : `j${index}: ${job} · worker ${workerByJob[index] + 1}`),
      highlight,
      mark,
      metrics: [
        { label: bi("Số job", "Jobs"), value: `${n}/${LIMITS.maxJobs}` },
        { label: bi("Số trạng thái", "States"), value: `${size}/${LIMITS.maxStates}` },
        {
          label: bi("Công nhân", "Worker"),
          value: options.worker === null ? "—" : `${options.worker}/${k}`,
          state: options.worker === null ? "muted" : "active",
        },
        { label: bi("Mask", "Mask"), value: options.mask === null ? "—" : formatMask(options.mask, n) },
        {
          label: bi("Submask", "Submask"),
          value: options.submask === null ? "—" : formatMask(options.submask, n),
          state: options.submask === null ? "muted" : "candidate",
        },
        { label: bi("Ứng viên", "Candidate"), value: candidate },
        {
          label: bi("Tốt nhất hiện tại", "Current best"),
          value: best,
          state: options.updated ? "updated" : "info",
        },
      ],
      table: buildTable(options),
      queue: buildQueue(options),
      groups: buildGroups(options),
      sequence: buildSequence(options),
      final: Boolean(config.final),
      answer: config.final ? answer : null,
    });
  }

  emit({
    phaseIndex: 0,
    title: bi("Khởi tạo tổng của mask rỗng", "Initialize the empty-mask sum"),
    note: bi(
      "Mask 0 không chứa job nào nên có tổng thời gian bằng 0.",
      "Mask 0 contains no jobs, so its workload sum is zero.",
    ),
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
    if (subsetTraceEvents < LIMITS.maxSubsetTraceEvents) {
      emit({
        phaseIndex: 0,
        title: bi(`Tính tổng cho ${formatMask(mask, n)}`, `Compute the sum for ${formatMask(mask, n)}`),
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
      tracer.truncate();
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
    formula: bi(
      "dp[0][0] = 0; các ô khác = total + 1",
      "dp[0][0] = 0; all other cells = total + 1",
    ),
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

        if (workerTraceEvents < LIMITS.maxTransitionsPerWorker) {
          emit({
            phaseIndex: 3,
            title: updated
              ? bi(
                `Cải thiện dp[${worker}][${formatMask(mask, n)}]`,
                `Improve dp[${worker}][${formatMask(mask, n)}]`,
              )
              : bi(
                `Thử submask ${formatMask(submask, n)}`,
                `Try submask ${formatMask(submask, n)}`,
              ),
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
              `max(dp[${worker - 1}][${formatMask(remainder, n)}], subset_sum[${formatMask(submask, n)}]) = ${displaySentinel(candidate, inf)}`,
              `max(dp[${worker - 1}][${formatMask(remainder, n)}], subset_sum[${formatMask(submask, n)}]) = ${displaySentinel(candidate, inf)}`,
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
          tracer.truncate();
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
        `dp[${worker}][all] = ${displaySentinel(dp[worker][fullMask], inf)}`,
        `dp[${worker}][all] = ${displaySentinel(dp[worker][fullMask], inf)}`,
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
      throw new Error(`#${PROBLEM_ID}: invalid reconstruction at worker ${worker}`);
    }
    const assigned = indicesFromMask(submask, n);
    assignments[worker - 1] = assigned;
    assignmentLoads[worker - 1] = assigned.reduce((sum, index) => sum + jobs[index], 0);
    assigned.forEach((index) => {
      if (workerByJob[index] !== -1) {
        throw new Error(`#${PROBLEM_ID}: job ${index} was reconstructed twice`);
      }
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
      action: bi(
        "Lấy submask đã chọn rồi xóa nó khỏi mask.",
        "Read the chosen submask and remove it from the mask.",
      ),
      formula: bi(
        `${formatMask(previousMask, n)} XOR ${formatMask(submask, n)} = ${formatMask(remainingMask, n)}`,
        `${formatMask(previousMask, n)} XOR ${formatMask(submask, n)} = ${formatMask(remainingMask, n)}`,
      ),
      codeLines: [24, 25, 26, 27, 28, 29],
      worker,
      mask: previousMask,
      submask,
      remainder: remainingMask,
      best: answer,
      highlight: assigned,
      mark: workerByJob
        .map((owner, index) => owner >= 0 ? index : -1)
        .filter((index) => index >= 0),
      computedMask: fullMask,
    });
  }

  if (remainingMask !== 0 || workerByJob.some((worker) => worker < 0)
    || Math.max(...assignmentLoads) !== answer) {
    throw new Error(`#${PROBLEM_ID}: reconstructed assignments do not match the optimum`);
  }

  emit({
    phaseIndex: 5,
    title: bi(`Makespan nhỏ nhất là ${answer}`, `The minimum makespan is ${answer}`),
    note: bi(
      "Mọi job xuất hiện đúng một lần trong các subset đã dựng; tải lớn nhất bằng đáp án DP.",
      "Every job appears exactly once in the reconstructed subsets; their maximum load equals the DP answer.",
    ),
    action: bi("Trả makespan tối ưu.", "Return the optimal makespan."),
    formula: bi(
      `answer = dp[${k}][${formatMask(fullMask, n)}] = ${answer}`,
      `answer = dp[${k}][${formatMask(fullMask, n)}] = ${answer}`,
    ),
    codeLines: [30],
    worker: k,
    mask: fullMask,
    best: answer,
    final: true,
    highlight: [],
    mark: Array.from({ length: n }, (_, index) => index),
    computedMask: fullMask,
  });

  return {
    original: { jobs: [...jobs], k },
    answer,
    steps: tracer.finish(),
  };
}

module.exports = {
  1723: {
    id: 1723,
    difficulty: "hard",
    slug: "find-minimum-time-to-finish-all-jobs",
    category: {
      key: "bitmask",
      vi: "Bitmask / Quy hoạch động",
      en: "Bitmask / Dynamic Programming",
    },
    tags: [
      { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
      { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "subset-dp", vi: "DP tập con", en: "Subset DP" },
    ],
    title: bi(
      "Thời gian tối thiểu để hoàn thành mọi công việc",
      "Find Minimum Time to Finish All Jobs",
    ),
    titleVi: bi(
      "Phân công job tối ưu bằng DP tập con",
      "Optimal job assignment with subset DP",
    ),
    statement: bi(
      "Giao mỗi job cho đúng một trong k công nhân. Mỗi công nhân làm tuần tự các job của mình; hãy tối thiểu hóa tải lớn nhất của một công nhân.",
      "Assign every job to exactly one of k workers. Each worker processes assigned jobs sequentially; minimize the maximum worker load.",
    ),
    defaultInput: [3, 2, 3],
    defaults: { input: [3, 2, 3], k: 3 },
    inputKind: "positive",
    inputLabel: bi(
      "jobs (1..12 thời gian dương)",
      "jobs (1..12 positive durations)",
    ),
    extraParams: [
      {
        key: "k",
        type: "number",
        min: 1,
        max: LIMITS.maxWorkers,
        default: 3,
        label: bi(
          "k (số công nhân, không quá số job)",
          "k (workers, at most the job count)",
        ),
      },
    ],
    visualizationLimits: { ...LIMITS },
    approach: [
      bi(
        "Tiền xử lý subset_sum[mask] bằng cách bỏ bit thấp nhất, nên mọi tải subset có trong O(2^n).",
        "Precompute subset_sum[mask] by removing its lowest set bit, giving every subset load in O(2^n).",
      ),
      bi(
        "dp[w][mask] là makespan nhỏ nhất khi các worker 1..w xử lý đúng tập job mask.",
        "dp[w][mask] is the minimum makespan when workers 1..w process exactly the jobs in mask.",
      ),
      bi(
        "Giao sub ⊆ mask cho worker w và lấy max(dp[w−1][mask xor sub], subset_sum[sub]); tối thiểu hóa trên mọi submask.",
        "Give sub ⊆ mask to worker w and take max(dp[w−1][mask xor sub], subset_sum[sub]); minimize over every submask.",
      ),
      bi(
        "Lưu submask tốt nhất cho mỗi ô để dựng lại subset của từng công nhân.",
        "Store the best submask for each cell to reconstruct every worker's subset.",
      ),
    ],
    complexity: {
      time: "O(2^n + k · 3^n)",
      space: "O(k · 2^n)",
      note: bi(
        "Tổng số cặp (mask, submask) là 3^n. Toàn bộ DP và reconstruction luôn chạy; chỉ trace và bảng hiển thị bị chặn.",
        "There are 3^n (mask, submask) pairs. The full DP and reconstruction always run; only emitted trace and table snapshots are capped.",
      ),
    },
    code: SOURCE,
    debugMode: "semantic",
    parser: parseMinimumTimeRequired1723Input,
    parseMinimumTimeRequired1723Input,
    liveArgs(input, params = {}) {
      const parsed = parseMinimumTimeRequired1723Input(input, params);
      return [[...parsed.jobs], parsed.k];
    },
    builder: buildSteps1723,
  },
};
