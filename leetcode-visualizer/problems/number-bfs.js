// Number-state BFS lessons in the Graph catalog.

const label = (vi, en) => ({ vi, en });
const MAX_TRACE_STEPS = 450;

function buildSteps2059(input, params = {}) {
  const nums = Array.isArray(input) ? input : [];
  const start = Number(params.start ?? 2);
  const goal = Number(params.goal ?? 12);
  if (!nums.length || nums.length > 1000 || nums.some((num) => !Number.isInteger(num) || Math.abs(num) > 1e9)
    || new Set(nums).size !== nums.length || !Number.isInteger(start) || start < 0 || start > 1000
    || !Number.isInteger(goal) || Math.abs(goal) > 1e9) {
    throw new Error("nums must contain 1–1000 distinct integers in [-10^9, 10^9]; start must be in [0, 1000] and goal in [-10^9, 10^9]");
  }

  const steps = [];
  let queue = null;
  let head = 0;
  let seen = null;
  let current = null;
  let distance = null;
  let num = null;
  let candidate = null;
  let omitted = false;
  const parent = new Map([[start, null]]);

  function record(phase, title, line, note, options = {}) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const waiting = queue ? queue.length - head : null;
    const preview = queue ? queue.slice(head, head + 8).map(([value, depth]) => ({ value, depth })) : [];
    const vars = [{ name: "nums", value: [...nums] }, { name: "start", value: start }, { name: "goal", value: goal }];
    if (queue) vars.push({ name: "queue", value: `[${preview.map(({ value, depth }) => `(${value},${depth})`).join(", ")}${waiting > 8 ? ", …" : ""}]` });
    if (seen) vars.push({ name: "seen count", value: seen.size });
    if (current !== null) vars.push({ name: "value", value: current }, { name: "steps", value: distance });
    if (num !== null) vars.push({ name: "num", value: num });
    if (candidate) vars.push({ name: "nxt", value: candidate.value });
    if (options.final) vars.push({ name: "answer", value: options.answer });
    steps.push({
      title, arr: [...nums], highlight: [], mark: [], codeLines: [line], vars, note,
      final: Boolean(options.final),
      numberBfs2059View: {
        phase, start, goal, nums: [...nums], current, distance, num,
        candidate: candidate ? { ...candidate } : null,
        queue: preview, queueSize: waiting, seenCount: seen ? seen.size : null,
        path: options.path || [], answer: options.answer ?? null, omitted,
      },
    });
  }

  function pathTo(value) {
    const reversed = [];
    let node = value;
    while (node !== null) {
      const edge = parent.get(node);
      reversed.push({ value: node, op: edge?.op ?? null, num: edge?.num ?? null });
      node = edge?.from ?? null;
    }
    return reversed.reverse();
  }

  record("guard", label(`start == goal? ${start === goal}`, `start == goal? ${start === goal}`), 5,
    label("Nếu hai giá trị trùng nhau thì không cần thao tác.", "If the values are equal, no operation is needed."));
  if (start === goal) {
    record("found", label("Trả về 0 thao tác", "Return 0 operations"), 6,
      label("Đã ở goal ngay từ đầu.", "Already at the goal."), { final: true, answer: 0, path: pathTo(start) });
    return { original: nums, start, goal, answer: 0, steps };
  }

  queue = [[start, 0]];
  record("init", label(`queue = [(${start}, 0)]`, `queue = [(${start}, 0)]`), 7,
    label("BFS bắt đầu từ start ở tầng 0.", "BFS starts from start at depth 0."));
  seen = new Set([start]);
  record("init", label(`seen = {${start}}`, `seen = {${start}}`), 8,
    label("Đánh dấu start ngay khi đưa vào hàng đợi.", "Mark start as seen when it is enqueued."));

  while (head < queue.length) {
    record("loop", label(`Hàng đợi còn ${queue.length - head} trạng thái`, `${queue.length - head} states remain in the queue`), 9,
      label("BFS luôn lấy trạng thái nông nhất trước.", "BFS processes the shallowest states first."));
    [current, distance] = queue[head++];
    num = null;
    candidate = null;
    record("pop", label(`Lấy ${current} ở tầng ${distance}`, `Pop ${current} at depth ${distance}`), 10,
      label("Mở rộng ba phép toán cho từng số trong nums.", "Try the three operations for each number in nums."));

    for (const nextNum of nums) {
      num = nextNum;
      candidate = null;
      record("choose", label(`Chọn num = ${num}`, `Choose num = ${num}`), 11,
        label("Một số có thể dùng lại nhiều lần ở các bước sau.", "Each number may be reused in later operations."));
      const neighbors = [
        { value: current + num, op: "+" },
        { value: current - num, op: "−" },
        { value: current ^ num, op: "^" },
      ];
      for (const next of neighbors) {
        candidate = { ...next, from: current, num, status: "checking" };
        record("candidate", label(`${current} ${next.op} ${num} = ${next.value}`, `${current} ${next.op} ${num} = ${next.value}`), 12,
          label("Tạo trạng thái kế tiếp; ngay cả goal ngoài [0, 1000] vẫn có thể là đáp án.", "Generate a neighbor; an out-of-range goal can still be the answer."));
        candidate.status = next.value === goal ? "goal" : "not-goal";
        record("goal-check", label(`${next.value} == goal? ${next.value === goal}`, `${next.value} == goal? ${next.value === goal}`), 13,
          next.value === goal
            ? label("Đã gặp goal ở tầng kế tiếp: BFS bảo đảm đây là đường ngắn nhất.", "Goal reached at the next depth; BFS guarantees a shortest path.")
            : label("Chưa tới goal; chỉ giá trị hợp lệ, chưa thấy mới được vào queue.", "Not the goal; only in-range unseen states may enter the queue."));
        if (next.value === goal) {
          const path = [...pathTo(current), { value: goal, op: next.op, num }];
          record("found", label(`Trả về ${distance + 1} thao tác`, `Return ${distance + 1} operations`), 14,
            omitted
              ? label("Trace dài đã được rút gọn; đường đi ngắn nhất vẫn được hiển thị đầy đủ.", "The long trace was shortened; the complete shortest path is still shown.")
              : label("Đường đi được dựng lại từ các trạng thái đã khám phá.", "Reconstruct the path through discovered states."),
            { final: true, answer: distance + 1, path });
          return { original: nums, start, goal, answer: distance + 1, steps };
        }
        const inRange = next.value >= 0 && next.value <= 1000;
        const unseen = inRange && !seen.has(next.value);
        candidate.status = !inRange ? "outside" : unseen ? "new" : "seen";
        record("range-check", label(`${next.value} hợp lệ và chưa thấy? ${unseen}`, `${next.value} in range and unseen? ${unseen}`), 15,
          !inRange
            ? label("Giá trị ngoài [0, 1000] không phải goal nên không thể đi tiếp.", "Out-of-range states cannot be expanded unless they are the goal.")
            : unseen
              ? label("Trạng thái mới được thêm vào BFS.", "This new state can join the BFS queue.")
              : label("Đã thấy trạng thái này; bỏ qua để tránh lặp.", "Already seen; skip it to avoid cycles."));
        if (!unseen) continue;
        seen.add(next.value);
        parent.set(next.value, { from: current, op: next.op, num });
        candidate.status = "discovered";
        record("mark", label(`Đánh dấu ${next.value}`, `Mark ${next.value} seen`), 16,
          label("Đánh dấu trước khi enqueue để không đưa trùng trạng thái.", "Mark before enqueuing to prevent duplicate states."));
        queue.push([next.value, distance + 1]);
        candidate.status = "queued";
        record("enqueue", label(`Đưa ${next.value} vào tầng ${distance + 1}`, `Enqueue ${next.value} at depth ${distance + 1}`), 17,
          label("Queue FIFO giúp duyệt hết tầng hiện tại trước tầng sau.", "FIFO order finishes the current depth before the next."));
      }
    }
  }

  record("done", label("Queue rỗng: trả về -1", "Queue empty: return -1"), 18,
    omitted
      ? label("Trace dài đã được rút gọn; BFS đã duyệt hết mọi trạng thái hợp lệ mà không gặp goal.", "The long trace was shortened; BFS exhausted all valid states without reaching the goal.")
      : label("Không còn trạng thái có thể mở rộng; goal không thể đạt được.", "No expandable states remain; the goal is unreachable."),
    { final: true, answer: -1 });
  return { original: nums, start, goal, answer: -1, steps };
}

module.exports = {
  2059: {
    id: 2059,
    difficulty: "medium",
    slug: "minimum-operations-to-convert-number",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [
      { key: "bfs", vi: "BFS", en: "BFS" },
      { key: "shortest-path", vi: "Đường đi ngắn nhất", en: "Shortest Path" },
    ],
    title: label("Minimum Operations to Convert Number", "Minimum Operations to Convert Number"),
    titleVi: label("Số thao tác ít nhất để đổi số", "Minimum operations to convert a number"),
    statement: label(
      "Từ start, dùng một số trong nums để cộng, trừ hoặc XOR. Chỉ được tiếp tục thao tác khi giá trị hiện tại nằm trong [0, 1000]. Trả số thao tác ít nhất để tới goal, kể cả khi goal nằm ngoài khoảng đó; không thể thì trả -1.",
      "From start, add, subtract, or XOR any number in nums. You may expand only values in [0, 1000]. Return the fewest operations to reach goal, even if goal is out of range, or -1 if impossible."
    ),
    defaultInput: [2, 4, 12],
    inputKind: "integer",
    inputLabel: label("nums (cách nhau bằng dấu phẩy)", "nums (comma-separated)"),
    extraParams: [
      { key: "start", label: label("start", "start"), default: 2 },
      { key: "goal", label: label("goal", "goal"), default: 12, allowNegative: true },
    ],
    approach: [
      label("Mỗi giá trị 0..1000 là một trạng thái của đồ thị không trọng số.", "Each value from 0 to 1000 is a state in an unweighted graph."),
      label("BFS duyệt theo số thao tác tăng dần; đánh dấu khi đưa vào queue để tránh lặp.", "BFS explores in increasing operation count; mark states when enqueuing to avoid repeats."),
      label("Kiểm tra goal trước giới hạn [0, 1000]: bước cuối được phép ra ngoài khoảng.", "Check goal before the [0, 1000] bound: the final move may go out of range."),
    ],
    complexity: {
      time: "O(1001 · n)", space: "O(1001)",
      note: label("Có tối đa 1001 trạng thái mở rộng được; mỗi trạng thái thử 3 phép toán với mọi số trong nums.", "At most 1001 states can be expanded, each trying three operations for every number in nums."),
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def minimumOperations(self, nums, start, goal):",
      "        if start == goal:",
      "            return 0",
      "        queue = deque([(start, 0)])",
      "        seen = {start}",
      "        while queue:",
      "            value, steps = queue.popleft()",
      "            for num in nums:",
      "                for nxt, op in ((value + num, '+'), (value - num, '−'), (value ^ num, '^')):",
      "                    if nxt == goal:",
      "                        return steps + 1",
      "                    if 0 <= nxt <= 1000 and nxt not in seen:",
      "                        seen.add(nxt)",
      "                        queue.append((nxt, steps + 1))",
      "        return -1",
    ],
    builder: buildSteps2059,
  },
};
