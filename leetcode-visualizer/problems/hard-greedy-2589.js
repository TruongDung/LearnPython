"use strict";

const {
  bi,
  fail,
  parsePlainParams,
  parseRows,
  createTracer,
} = require("./hard-viz-shared");

const PROBLEM_ID = 2589;
const DEFAULT_INPUT = "[[2,3,1],[4,5,1],[1,5,2]]";

const LIMITS = Object.freeze({
  minTasks: 1,
  maxTasks: 40,
  minTime: 1,
  maxTime: 2_000,
  maxTraceSteps: 128,
  maxTimelineCells: 96,
  maxSelectedPreview: 24,
  maxSelectedGroups: 18,
  maxAddedPreview: 12,
});

const PHASES = Object.freeze([
  bi("Sắp xếp theo thời điểm kết thúc", "Sort by end time"),
  bi("Xét task kế tiếp", "Inspect the next task"),
  bi("Đếm các mốc đã chọn", "Count selected time points"),
  bi("Chọn thêm từ phải sang trái", "Select more from right to left"),
  bi("Hoàn tất", "Final result"),
]);

const LEGEND = Object.freeze([
  { label: bi("Khoảng của task hiện tại", "Current task interval"), state: "active" },
  { label: bi("Mốc đang được cân nhắc", "Candidate time point"), state: "candidate" },
  { label: bi("Mốc vừa được chọn", "Newly selected time point"), state: "updated" },
  { label: bi("Mốc đã chọn trước đó", "Previously selected time point"), state: "success" },
  { label: bi("Task đã thỏa", "Satisfied task"), state: "chosen" },
]);

const SOURCE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def findMinimumTime(self, tasks: List[List[int]]) -> int:",
  "        tasks.sort(key=lambda task: task[1])",
  "        selected = [False] * (tasks[-1][1] + 1)",
  "        answer = 0",
  "        for start, end, duration in tasks:",
  "            completed = sum(selected[start:end + 1])",
  "            need = duration - completed",
  "            time = end",
  "            while need > 0:",
  "                if not selected[time]:",
  "                    selected[time] = True",
  "                    answer += 1",
  "                    need -= 1",
  "                time -= 1",
  "        return answer",
]);

function sourceLine(fragment) {
  const index = SOURCE.findIndex((line) => line.includes(fragment));
  if (index < 0) throw new Error(`#${PROBLEM_ID}: missing Python source line: ${fragment}`);
  return index + 1;
}

const PYTHON_LINES = Object.freeze({
  sort: [sourceLine("tasks.sort")],
  inspect: [sourceLine("for start, end, duration")],
  count: [sourceLine("completed ="), sourceLine("need =")],
  select: [
    sourceLine("time = end"),
    sourceLine("while need > 0"),
    sourceLine("if not selected[time]"),
    sourceLine("selected[time] = True"),
    sourceLine("answer += 1"),
    sourceLine("need -= 1"),
    sourceLine("time -= 1"),
  ],
  finish: [sourceLine("return answer")],
});

function parseMinimumTime2589Input(input, params = {}) {
  parsePlainParams(params, PROBLEM_ID);
  const tasks = parseRows(input, {
    problemId: PROBLEM_ID,
    name: "tasks",
    columns: 3,
    minRows: LIMITS.minTasks,
    maxRows: LIMITS.maxTasks,
    minValue: LIMITS.minTime,
    maxValue: LIMITS.maxTime,
  });

  tasks.forEach(([start, end, duration], index) => {
    if (start > end) {
      fail(
        PROBLEM_ID,
        RangeError,
        `tasks[${index}] phải thỏa 1 <= start <= end`,
        `tasks[${index}] must satisfy 1 <= start <= end`,
      );
    }
    const intervalLength = end - start + 1;
    if (duration > intervalLength) {
      fail(
        PROBLEM_ID,
        RangeError,
        `duration của tasks[${index}] không được vượt độ dài khoảng ${intervalLength}`,
        `tasks[${index}].duration must not exceed its interval length ${intervalLength}`,
      );
    }
  });

  return { tasks: tasks.map((task) => [...task]) };
}

function evenlySample(values, limit) {
  if (values.length <= limit) return [...values];
  if (limit <= 1) return values.length ? [values[0]] : [];
  const sampled = [];
  const used = new Set();
  for (let index = 0; index < limit; index += 1) {
    const sourceIndex = Math.round(index * (values.length - 1) / (limit - 1));
    if (!used.has(sourceIndex)) {
      used.add(sourceIndex);
      sampled.push(values[sourceIndex]);
    }
  }
  return sampled;
}

function boundedEdges(values, limit) {
  if (values.length <= limit) return [...values];
  const leftCount = Math.ceil(limit / 2);
  const rightCount = Math.floor(limit / 2);
  return [...values.slice(0, leftCount), ...values.slice(values.length - rightCount)];
}

function formatSlots(slots, limit) {
  if (slots === null || slots === undefined) return "—";
  if (!slots.length) return bi("không có", "none");
  const ordered = [...slots].sort((left, right) => left - right);
  if (ordered.length <= limit) return `[${ordered.join(", ")}]`;
  const shown = boundedEdges(ordered, limit);
  return `[${shown.slice(0, Math.ceil(limit / 2)).join(", ")}, …, ${shown.slice(Math.ceil(limit / 2)).join(", ")}] (+${ordered.length - limit})`;
}

function buildMinimumTime2589(input, params = {}) {
  const { tasks } = parseMinimumTime2589Input(input, params);
  const sortedTasks = tasks
    .map(([start, end, duration], originalIndex) => ({
      start,
      end,
      duration,
      originalIndex,
    }))
    .sort((left, right) => left.end - right.end || left.originalIndex - right.originalIndex);
  const maxEnd = sortedTasks.at(-1).end;
  const selected = Array(maxEnd + 1).fill(false);
  const records = sortedTasks.map((task, sortedIndex) => ({
    ...task,
    sortedIndex,
    counted: null,
    added: null,
    selectedAfter: null,
    status: "pending",
  }));
  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: PHASES,
    maxSteps: LIMITS.maxTraceSteps,
    baseArray: [],
    legend: LEGEND,
  });
  let answer = 0;

  function countSelected(start, end) {
    let count = 0;
    for (let time = start; time <= end; time += 1) {
      if (selected[time]) count += 1;
    }
    return count;
  }

  function collectSelectedSlots() {
    const slots = [];
    for (let time = 1; time <= maxEnd; time += 1) {
      if (selected[time]) slots.push(time);
    }
    return slots;
  }

  function collectSelectedRuns(slots) {
    const runs = [];
    for (const time of slots) {
      const previous = runs.at(-1);
      if (previous && previous.end + 1 === time) previous.end = time;
      else runs.push({ start: time, end: time });
    }
    return runs;
  }

  function timelineTimes(task, selectedSlots, addedSlots) {
    if (maxEnd <= LIMITS.maxTimelineCells) {
      return Array.from({ length: maxEnd }, (_, index) => index + 1);
    }

    const values = [];
    const seen = new Set();
    const add = (time) => {
      if (values.length >= LIMITS.maxTimelineCells
        || !Number.isSafeInteger(time)
        || time < 1
        || time > maxEnd
        || seen.has(time)) return;
      seen.add(time);
      values.push(time);
    };

    add(1);
    add(maxEnd);
    if (task) {
      add(task.start);
      add(task.end);
      add(task.start - 1);
      add(task.start + 1);
      add(task.end - 1);
      add(task.end + 1);
      const interval = Array.from(
        { length: task.end - task.start + 1 },
        (_, index) => task.start + index,
      );
      evenlySample(interval, 40).forEach(add);
    }
    evenlySample([...addedSlots].sort((left, right) => left - right), 24).forEach(add);
    evenlySample(selectedSlots, 24).forEach(add);

    for (let index = 0;
      index < LIMITS.maxTimelineCells && values.length < LIMITS.maxTimelineCells;
      index += 1) {
      add(1 + Math.round(index * (maxEnd - 1) / (LIMITS.maxTimelineCells - 1)));
    }
    for (let time = 1; values.length < LIMITS.maxTimelineCells && time <= maxEnd; time += 1) {
      add(time);
    }
    return values.sort((left, right) => left - right);
  }

  function selectedRunsItems(runs) {
    const shown = boundedEdges(runs, LIMITS.maxSelectedGroups);
    const items = shown.map((run) => ({
      label: run.start === run.end
        ? bi(`Mốc ${run.start}`, `Time ${run.start}`)
        : bi(`Đoạn ${run.start}–${run.end}`, `Run ${run.start}–${run.end}`),
      value: run.end - run.start + 1,
      state: "success",
    }));
    if (runs.length > shown.length) {
      items.splice(Math.ceil(shown.length / 2), 0, {
        label: bi("Các đoạn được lược gọn", "Condensed runs"),
        value: runs.length - shown.length,
        state: "warning",
      });
    }
    return items.length ? items : [{
      label: bi("Chưa có đoạn nào", "No selected run yet"),
      value: "—",
      state: "muted",
    }];
  }

  function buildTaskTable(currentTaskIndex, phaseIndex) {
    return {
      title: bi("Task theo thứ tự end tăng dần", "Tasks in ascending end-time order"),
      columns: [
        bi("Thứ tự", "Order"),
        bi("Task gốc", "Original task"),
        bi("Khoảng", "Interval"),
        bi("Yêu cầu", "Duration"),
        bi("Đếm khi xét", "Count at inspection"),
        bi("Mốc thêm", "Added slots"),
        bi("Đang có", "Selected now"),
        bi("Trạng thái", "Status"),
      ],
      rows: records.map((record, index) => {
        let rowState = record.status;
        if (index === currentTaskIndex) rowState = phaseIndex === 3 ? "updated" : "active";
        const status = record.status === "success"
          ? bi("đã thỏa", "satisfied")
          : record.status === "active"
            ? bi("đang xét", "active")
            : bi("chờ", "pending");
        return {
          label: bi(`Task ${record.originalIndex + 1}`, `Task ${record.originalIndex + 1}`),
          state: rowState,
          cells: [
            record.sortedIndex + 1,
            `#${record.originalIndex + 1}`,
            `[${record.start}, ${record.end}]`,
            record.duration,
            record.counted === null ? "—" : record.counted,
            formatSlots(record.added, LIMITS.maxAddedPreview),
            countSelected(record.start, record.end),
            { value: status, state: rowState },
          ],
        };
      }),
    };
  }

  function buildGroups(task, selectedSlots, runs, addedSlots, completed, needBefore, remaining) {
    const groups = [
      {
        title: bi("Các mốc thời gian đã chọn", "Selected time points"),
        items: [
          {
            label: bi("Tổng số mốc", "Selected count"),
            value: selectedSlots.length,
            state: selectedSlots.length ? "success" : "muted",
          },
          {
            label: bi("Danh sách mốc", "Selected slots"),
            value: formatSlots(selectedSlots, LIMITS.maxSelectedPreview),
            state: selectedSlots.length ? "chosen" : "muted",
          },
          {
            label: bi("Vừa thêm", "Just added"),
            value: formatSlots(addedSlots, LIMITS.maxAddedPreview),
            state: addedSlots.length ? "updated" : "muted",
          },
        ],
      },
      {
        title: bi("Các nhóm liên tiếp đã chọn", "Contiguous selected groups"),
        items: selectedRunsItems(runs),
      },
    ];

    if (task) {
      groups.push({
        title: bi("Điểm kiểm tra của task", "Task checkpoint"),
        items: [
          {
            label: bi("Khoảng", "Interval"),
            value: `[${task.start}, ${task.end}]`,
            state: "active",
          },
          {
            label: bi("Số mốc yêu cầu", "Required points"),
            value: task.duration,
            state: "default",
          },
          {
            label: bi("Đã đếm", "Already counted"),
            value: completed === null ? "—" : completed,
            state: completed === null ? "muted" : "computed",
          },
          {
            label: bi("Thiếu trước khi chọn", "Needed before selection"),
            value: needBefore === null ? "—" : needBefore,
            state: needBefore > 0 ? "warning" : needBefore === 0 ? "success" : "muted",
          },
          {
            label: bi("Còn thiếu", "Remaining need"),
            value: remaining === null ? "—" : remaining,
            state: remaining > 0 ? "candidate" : remaining === 0 ? "success" : "muted",
          },
        ],
      });
    }
    return groups;
  }

  function emit(config) {
    const taskIndex = Number.isInteger(config.taskIndex) ? config.taskIndex : null;
    const task = taskIndex === null ? null : records[taskIndex];
    const addedSlots = Array.isArray(config.addedSlots) ? config.addedSlots : [];
    const completed = config.completed === undefined ? null : config.completed;
    const needBefore = config.needBefore === undefined ? null : config.needBefore;
    const remaining = config.remaining === undefined ? null : config.remaining;
    const selectedSlots = collectSelectedSlots();
    const runs = collectSelectedRuns(selectedSlots);
    const visibleTimes = timelineTimes(task, selectedSlots, addedSlots);
    const omittedTimelinePoints = maxEnd - visibleTimes.length;
    if (omittedTimelinePoints > 0
      || selectedSlots.length > LIMITS.maxSelectedPreview
      || runs.length > LIMITS.maxSelectedGroups) {
      tracer.truncate();
    }

    const addedSet = new Set(addedSlots);
    const highlight = [];
    const mark = [];
    const sequence = visibleTimes.map((time, index) => {
      const inInterval = task !== null && time >= task.start && time <= task.end;
      if (inInterval) highlight.push(index);
      if (selected[time]) mark.push(index);
      let state = "muted";
      if (addedSet.has(time)) state = "updated";
      else if (selected[time] && inInterval) state = "chosen";
      else if (selected[time]) state = "success";
      else if (inInterval) state = "active";
      return {
        label: `t=${time}`,
        value: selected[time] ? bi("bật", "on") : bi("tắt", "off"),
        state,
      };
    });
    if (omittedTimelinePoints > 0) {
      sequence.push({
        label: bi("Mốc timeline đã lấy mẫu", "Sampled-out timeline points"),
        value: omittedTimelinePoints,
        state: "warning",
      });
    }

    const processedCount = records.filter((record) => record.status === "success").length;
    const selectedInCurrent = task === null ? null : countSelected(task.start, task.end);
    return tracer.emit({
      phaseIndex: config.phaseIndex,
      title: config.title,
      note: config.note,
      action: config.action,
      formula: config.formula,
      codeLines: config.codeLines,
      vars: [
        { name: "task", value: task === null ? "—" : [task.start, task.end, task.duration] },
        { name: "completed", value: completed === null ? "—" : completed },
        { name: "need", value: remaining === null ? "—" : remaining },
        { name: "selected_count", value: answer },
        { name: "added", value: formatSlots(addedSlots, LIMITS.maxAddedPreview) },
      ],
      arr: visibleTimes.map((time) => selected[time] ? 1 : 0),
      sub: visibleTimes.map((time) => `t=${time}`),
      highlight,
      mark,
      metrics: [
        {
          label: bi("Task đang xét", "Current task"),
          value: taskIndex === null ? "—" : `${taskIndex + 1}/${records.length}`,
          state: taskIndex === null ? "muted" : "active",
        },
        {
          label: bi("Đã xử lý", "Processed tasks"),
          value: `${processedCount}/${records.length}`,
          state: processedCount === records.length ? "success" : "default",
        },
        {
          label: bi("Khoảng", "Interval"),
          value: task === null ? "—" : `[${task.start}, ${task.end}]`,
          state: task === null ? "muted" : "active",
        },
        {
          label: bi("Yêu cầu", "Required duration"),
          value: task === null ? "—" : task.duration,
          state: task === null ? "muted" : "default",
        },
        {
          label: bi("Đã chọn trong khoảng", "Selected in interval"),
          value: selectedInCurrent === null ? "—" : selectedInCurrent,
          state: selectedInCurrent === null ? "muted" : "computed",
        },
        {
          label: bi("Thiếu trước khi chọn", "Needed before selection"),
          value: needBefore === null ? "—" : needBefore,
          state: needBefore > 0 ? "warning" : needBefore === 0 ? "success" : "muted",
        },
        {
          label: bi("Vừa thêm", "Newly selected"),
          value: addedSlots.length,
          state: addedSlots.length ? "updated" : "muted",
        },
        {
          label: bi("Tổng mốc đã chọn", "Total selected"),
          value: answer,
          state: config.final ? "answer" : answer ? "success" : "default",
        },
        {
          label: bi("Timeline", "Timeline"),
          value: `1..${maxEnd}`,
          state: omittedTimelinePoints > 0 ? "warning" : "default",
        },
      ],
      table: buildTaskTable(taskIndex, config.phaseIndex),
      groups: buildGroups(
        task,
        selectedSlots,
        runs,
        addedSlots,
        completed,
        needBefore,
        remaining,
      ),
      sequence,
      final: Boolean(config.final),
      answer: config.final ? answer : null,
    });
  }

  emit({
    phaseIndex: 0,
    title: bi("Sắp task theo end tăng dần", "Sort tasks by ascending end time"),
    note: bi(
      "Xử lý task kết thúc sớm trước giúp mọi mốc mới chọn càng hữu ích càng lâu cho các task phía sau.",
      "Processing the earliest ending task first keeps every new selected point useful for as many later tasks as possible.",
    ),
    action: bi("Sắp xếp bản sao của tasks theo end.", "Sort a copy of tasks by end."),
    formula: bi("end₁ <= end₂ <= ... <= endₙ", "end₁ <= end₂ <= ... <= endₙ"),
    codeLines: PYTHON_LINES.sort,
  });

  for (let taskIndex = 0; taskIndex < records.length; taskIndex += 1) {
    const record = records[taskIndex];
    record.status = "active";
    emit({
      phaseIndex: 1,
      taskIndex,
      title: bi(
        `Xét task #${record.originalIndex + 1}: [${record.start}, ${record.end}, ${record.duration}]`,
        `Inspect task #${record.originalIndex + 1}: [${record.start}, ${record.end}, ${record.duration}]`,
      ),
      note: bi(
        "Task cần đủ số mốc bật bên trong khoảng đóng [start, end].",
        "The task needs enough active time points inside the closed interval [start, end].",
      ),
      action: bi("Đọc task kế tiếp trong thứ tự greedy.", "Read the next task in greedy order."),
      formula: bi(
        `interval = [${record.start}, ${record.end}], duration = ${record.duration}`,
        `interval = [${record.start}, ${record.end}], duration = ${record.duration}`,
      ),
      codeLines: PYTHON_LINES.inspect,
    });

    const completed = countSelected(record.start, record.end);
    const needBefore = Math.max(0, record.duration - completed);
    record.counted = completed;
    emit({
      phaseIndex: 2,
      taskIndex,
      completed,
      needBefore,
      remaining: needBefore,
      title: bi(
        `Trong khoảng đã có ${completed} mốc`,
        `The interval already contains ${completed} selected points`,
      ),
      note: bi(
        `Task còn thiếu ${needBefore} mốc; nếu không thiếu thì giữ nguyên tập đã chọn.`,
        `The task still needs ${needBefore} points; if it needs none, keep the current selection.`,
      ),
      action: bi("Đếm các mốc đã bật trong khoảng.", "Count active time points in the interval."),
      formula: bi(
        `need = max(0, ${record.duration} - ${completed}) = ${needBefore}`,
        `need = max(0, ${record.duration} - ${completed}) = ${needBefore}`,
      ),
      codeLines: PYTHON_LINES.count,
    });

    const addedSlots = [];
    let remaining = needBefore;
    let time = record.end;
    while (remaining > 0 && time >= record.start) {
      if (!selected[time]) {
        selected[time] = true;
        answer += 1;
        remaining -= 1;
        addedSlots.push(time);
      }
      time -= 1;
    }
    if (remaining !== 0) {
      throw new Error(`#${PROBLEM_ID}: validated task could not be satisfied`);
    }

    record.added = [...addedSlots];
    record.selectedAfter = countSelected(record.start, record.end);
    record.status = "success";
    emit({
      phaseIndex: 3,
      taskIndex,
      completed,
      needBefore,
      remaining,
      addedSlots,
      title: addedSlots.length
        ? bi(
          `Chọn ${addedSlots.length} mốc phải nhất còn trống`,
          `Select the ${addedSlots.length} rightmost free points`,
        )
        : bi("Task đã đủ, không cần chọn thêm", "The task is already satisfied"),
      note: addedSlots.length
        ? bi(
          `Đã thêm ${formatSlots(addedSlots, LIMITS.maxAddedPreview)}. Chọn từ end lùi về start bảo toàn các mốc sớm cho tương lai.`,
          `Added ${formatSlots(addedSlots, LIMITS.maxAddedPreview)}. Choosing backward from end preserves earlier points for future tasks.`,
        )
        : bi(
          "Các mốc đã chọn từ task trước đã đáp ứng task này.",
          "Points selected for earlier tasks already satisfy this task.",
        ),
      action: bi(
        "Quét từ end về start và bật mốc chưa dùng cho tới khi hết thiếu.",
        "Scan from end toward start and activate free points until the deficit is zero.",
      ),
      formula: bi(
        `selected += ${addedSlots.length}; total = ${answer}`,
        `selected += ${addedSlots.length}; total = ${answer}`,
      ),
      codeLines: PYTHON_LINES.select,
    });
  }

  const unsatisfied = records.find(
    (record) => countSelected(record.start, record.end) < record.duration,
  );
  if (unsatisfied || answer !== collectSelectedSlots().length) {
    throw new Error(`#${PROBLEM_ID}: greedy result violates a task invariant`);
  }

  emit({
    phaseIndex: 4,
    title: bi(`Thời gian tối thiểu là ${answer}`, `The minimum time is ${answer}`),
    note: bi(
      "Mọi task đã đủ duration mốc. Lập luận trao đổi cho phép dời mỗi lựa chọn mới sang phải mà không làm hỏng task đã xử lý, nên số mốc là tối ưu.",
      "Every task has enough points. An exchange argument moves each new choice rightward without breaking processed tasks, so the selected count is optimal.",
    ),
    action: bi("Trả tổng số mốc thời gian đã chọn.", "Return the number of selected time points."),
    formula: bi(`answer = |selected| = ${answer}`, `answer = |selected| = ${answer}`),
    codeLines: PYTHON_LINES.finish,
    final: true,
  });

  return {
    original: { tasks: tasks.map((task) => [...task]) },
    answer,
    steps: tracer.finish(),
  };
}

module.exports = {
  2589: {
    id: 2589,
    difficulty: "hard",
    slug: "minimum-time-to-complete-all-tasks",
    category: {
      key: "greedy",
      ...bi("Tham lam / Lập lịch", "Greedy / Scheduling"),
    },
    tags: [
      { key: "greedy", ...bi("Tham lam", "Greedy") },
      { key: "sorting", ...bi("Sắp xếp", "Sorting") },
      { key: "scheduling", ...bi("Lập lịch", "Scheduling") },
      { key: "array", ...bi("Mảng", "Array") },
    ],
    title: bi(
      "Thời gian tối thiểu để hoàn thành mọi task",
      "Minimum Time to Complete All Tasks",
    ),
    titleVi: bi(
      "Lập lịch greedy bằng các mốc phải nhất",
      "Greedy scheduling with rightmost time points",
    ),
    statement: bi(
      "Mỗi task [start, end, duration] cần máy chạy tại ít nhất duration mốc nguyên trong khoảng. Máy có thể phục vụ đồng thời nhiều task; hãy tối thiểu hóa tổng số mốc máy chạy.",
      "Each task [start, end, duration] needs the computer to run at least duration integer time points in its interval. One active point can serve multiple tasks; minimize the total active time.",
    ),
    defaultInput: DEFAULT_INPUT,
    defaults: { input: DEFAULT_INPUT },
    expectedAnswer: 2,
    inputKind: "string",
    inputLabel: bi(
      `tasks: JSON matrix hoặc start,end,duration;... (1..${LIMITS.maxTasks} task, end <= ${LIMITS.maxTime})`,
      `tasks: JSON matrix or start,end,duration;... (1..${LIMITS.maxTasks} tasks, end <= ${LIMITS.maxTime})`,
    ),
    maxInput: LIMITS.maxTasks,
    visualizationLimits: {
      ...LIMITS,
      note: bi(
        "Timeline và trace được lấy mẫu có giới hạn; việc sắp xếp, đếm và chọn mốc vẫn chạy đầy đủ cho mọi input hợp lệ.",
        "Timeline and trace displays are bounded samples; sorting, counting, and point selection still run fully for every valid input.",
      ),
    },
    extraParams: [],
    approach: [
      bi(
        "Sắp task theo end tăng dần để chốt các deadline sớm trước.",
        "Sort tasks by ascending end time to settle earlier deadlines first.",
      ),
      bi(
        "Với mỗi task, đếm các mốc đã chọn trong [start, end] và tính phần còn thiếu.",
        "For each task, count selected points in [start, end] and compute its deficit.",
      ),
      bi(
        "Nếu còn thiếu, chọn các mốc chưa dùng từ end lùi về start; lựa chọn phải nhất có khả năng tái sử dụng cao nhất cho task kết thúc muộn hơn.",
        "If points are missing, select unused points from end back to start; the rightmost choices are most reusable by later-ending tasks.",
      ),
    ],
    complexity: {
      time: "O(n log n + n · T)",
      space: "O(T)",
      note: bi(
        "n là số task và T là end lớn nhất. Python source dùng mảng boolean đúng với giới hạn timeline của LeetCode.",
        "n is the number of tasks and T is the largest end. The Python source uses a boolean array, matching LeetCode's timeline bound.",
      ),
    },
    debugMode: "semantic",
    code: SOURCE,
    parser: parseMinimumTime2589Input,
    parseMinimumTime2589Input,
    liveArgs(input, params = {}) {
      const parsed = parseMinimumTime2589Input(input, params);
      return [parsed.tasks.map((task) => [...task])];
    },
    builder: buildMinimumTime2589,
  },
};
