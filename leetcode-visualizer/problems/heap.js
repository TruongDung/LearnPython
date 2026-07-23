// LeetCode Visualizer — Heap / Priority Queue problems.
// A heap is stored as an array; node i has children 2i+1, 2i+2 and parent floor((i-1)/2).
// We render it as a binary tree so the heap property is easy to see.

const HEAP_CAT = { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" };

// Build tree-view nodes from a heap array.
// heap: array of elements. labelFn(el) → string shown in the node.
// hlSet / markSet: Sets of ARRAY INDICES to highlight (amber) / mark (green ring).
function heapTree(heap, labelFn, hlSet, markSet) {
  const nodes = [];
  let nextX = 0;
  function dfs(i, depth) {
    if (i >= heap.length) return;
    dfs(2 * i + 1, depth + 1);
    const x = nextX++;
    const labelLines = typeof labelFn.lines === "function" ? labelFn.lines(heap[i]) : null;
    nodes.push({
      id: i,
      label: labelFn(heap[i]),
      labelLines: Array.isArray(labelLines) ? labelLines.map(String) : null,
      sub: `index ${i}`,
      x,
      y: depth,
      parentId: i === 0 ? null : Math.floor((i - 1) / 2),
      hl: hlSet ? hlSet.has(i) : false,
      isWord: markSet ? markSet.has(i) : false,
    });
    dfs(2 * i + 2, depth + 1);
  }
  dfs(0, 0);
  return nodes;
}

function heapSnapshot(heap, labelFn, opts) {
  return {
    title: opts.title,
    arr: [],
    tree: { nodes: heapTree(heap, labelFn, opts.hlSet, opts.markSet) },
    highlight: [],
    mark: [],
    codeLines: opts.codeLines || [],
    vars: opts.vars || [],
    note: opts.note,
  };
}

// ─── 3092: Most Frequent IDs ───
function buildSteps3092(nums, params) {
  const changes = String(params.freq || "")
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isInteger(value));
  const steps = [];

  if (changes.length !== nums.length || nums.length === 0) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [4],
      vars: [
        { name: "nums.length", value: nums.length },
        { name: "freq.length", value: changes.length },
      ],
      note: {
        vi: "nums và freq phải có cùng độ dài và không được rỗng.",
        en: "nums and freq must have equal non-zero length.",
      },
      final: true,
    });
    return { original: { nums: [...nums], freq: changes }, answer: null, steps };
  }

  const counts = new Map();
  const heap = [];
  const answer = [];

  const higherPriority = (a, b) => a.count > b.count || (a.count === b.count && a.id < b.id);
  const isCurrent = (entry) => (counts.get(entry.id) || 0) === entry.count;
  const label = (entry) => `${entry.id}·f${entry.count}${isCurrent(entry) ? "" : " old"}`;
  const countsText = () => {
    const entries = [...counts.entries()].sort((a, b) => a[0] - b[0]);
    return `{${entries.map(([id, count]) => `${id}: ${count}`).join(", ")}}`;
  };
  const heapText = () => `[${heap.map((entry) => `(${entry.id},${entry.count}${isCurrent(entry) ? "" : ",old"})`).join(", ")}]`;
  const validIndices = () => new Set(heap.map((entry, index) => isCurrent(entry) ? index : -1).filter((index) => index >= 0));

  function snapshot(opts) {
    const step = heapSnapshot([...heap], label, {
      title: opts.title,
      codeLines: opts.codeLines,
      hlSet: opts.hlSet || new Set(),
      markSet: opts.markSet || validIndices(),
      vars: opts.vars,
      note: opts.note,
    });
    if (opts.final) step.final = true;
    steps.push(step);
  }

  function siftUp(index) {
    let child = index;
    while (child > 0) {
      const parent = Math.floor((child - 1) / 2);
      if (!higherPriority(heap[child], heap[parent])) break;
      [heap[child], heap[parent]] = [heap[parent], heap[child]];
      child = parent;
    }
  }

  function siftDown(index) {
    let parent = index;
    while (true) {
      let best = parent;
      const left = parent * 2 + 1;
      const right = left + 1;
      if (left < heap.length && higherPriority(heap[left], heap[best])) best = left;
      if (right < heap.length && higherPriority(heap[right], heap[best])) best = right;
      if (best === parent) break;
      [heap[parent], heap[best]] = [heap[best], heap[parent]];
      parent = best;
    }
  }

  function push(entry) {
    heap.push(entry);
    siftUp(heap.length - 1);
  }

  function popRoot() {
    const removed = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      siftDown(0);
    }
    return removed;
  }

  snapshot({
    title: { vi: "Khởi tạo counts, heap và answer", en: "Initialize counts, heap, and answer" },
    codeLines: [5, 6, 7],
    vars: [
      { name: "counts", value: "{}" },
      { name: "heap", value: "[]" },
      { name: "answer", value: "[]" },
    ],
    note: {
      vi: "counts giữ tần suất thật hiện tại. Heap có thể chứa cả entry mới lẫn entry cũ; entry cũ sẽ bị xóa khi lên root.",
      en: "counts stores each current frequency. The heap may contain current and stale entries; stale entries are removed when they reach the root.",
    },
  });

  for (let i = 0; i < nums.length; i++) {
    const id = nums[i];
    const delta = changes[i];
    const oldCount = counts.get(id) || 0;

    snapshot({
      title: { vi: `Update ${i}: ID ${id}, delta ${delta}`, en: `Update ${i}: ID ${id}, delta ${delta}` },
      codeLines: [8],
      vars: [
        { name: "i", value: i },
        { name: "id", value: id },
        { name: "delta", value: delta },
        { name: "old count", value: oldCount },
        { name: "answer", value: `[${answer.join(", ")}]` },
      ],
      note: {
        vi: `Áp dụng thay đổi ${delta >= 0 ? "+" : ""}${delta} cho ID ${id}.`,
        en: `Apply change ${delta >= 0 ? "+" : ""}${delta} to ID ${id}.`,
      },
    });

    const newCount = oldCount + delta;
    counts.set(id, newCount);
    snapshot({
      title: { vi: `counts[${id}] = ${oldCount} + (${delta}) = ${newCount}`, en: `counts[${id}] = ${oldCount} + (${delta}) = ${newCount}` },
      codeLines: [9],
      vars: [
        { name: "id", value: id },
        { name: "old count", value: oldCount },
        { name: "delta", value: delta },
        { name: "new count", value: newCount },
        { name: "counts", value: countsText() },
        { name: "heap", value: heapText() },
      ],
      note: {
        vi: heap.length
          ? `Hash map đã cập nhật. Các heap entry cũ của ID ${id} lập tức trở thành stale nếu count không còn khớp.`
          : "Hash map đã cập nhật; heap hiện vẫn rỗng.",
        en: heap.length
          ? `The map is updated. Older heap entries for ID ${id} immediately become stale when their count no longer matches.`
          : "The map is updated; the heap is still empty.",
      },
    });

    push({ id, count: newCount });
    const pushedIndex = heap.findIndex((entry) => entry.id === id && entry.count === newCount);
    snapshot({
      title: { vi: `heappush((${newCount === 0 ? 0 : -newCount}, ${id}))`, en: `heappush((${newCount === 0 ? 0 : -newCount}, ${id}))` },
      codeLines: [10],
      hlSet: pushedIndex >= 0 ? new Set([pushedIndex]) : new Set([0]),
      vars: [
        { name: "pushed", value: `ID ${id}, count ${newCount}` },
        { name: "heap", value: heapText() },
        { name: "root", value: `ID ${heap[0].id}, count ${heap[0].count}` },
      ],
      note: {
        vi: `Python dùng (-count, id) để biến heapq thành max-heap. Cây đang hiển thị count dương cho dễ đọc.`,
        en: `Python stores (-count, id) to use heapq as a max-heap. The tree displays positive counts for readability.`,
      },
    });

    while (heap.length > 0 && !isCurrent(heap[0])) {
      const stale = heap[0];
      const currentCount = counts.get(stale.id) || 0;
      snapshot({
        title: { vi: `Root ID ${stale.id}, f${stale.count} đã cũ`, en: `Root ID ${stale.id}, f${stale.count} is stale` },
        codeLines: [11],
        hlSet: new Set([0]),
        vars: [
          { name: "root stored count", value: stale.count },
          { name: `counts[${stale.id}]`, value: currentCount },
          { name: "condition", value: `${stale.count} != ${currentCount}` },
        ],
        note: {
          vi: `Heap root nói ID ${stale.id} có ${stale.count}, nhưng hash map nói ${currentCount}. Root này không còn hợp lệ nên phải pop.`,
          en: `The heap root says ID ${stale.id} has ${stale.count}, but the map says ${currentCount}. This root is stale and must be popped.`,
        },
      });

      const removed = popRoot();
      snapshot({
        title: { vi: `heappop stale (${removed.id}, ${removed.count})`, en: `heappop stale (${removed.id}, ${removed.count})` },
        codeLines: [12],
        hlSet: heap.length ? new Set([0]) : new Set(),
        vars: [
          { name: "removed", value: `ID ${removed.id}, count ${removed.count}` },
          { name: "heap", value: heapText() },
          { name: "new root", value: heap.length ? `ID ${heap[0].id}, count ${heap[0].count}` : "none" },
        ],
        note: {
          vi: heap.length
            ? "Xóa root cũ và khôi phục heap. Vòng while sẽ kiểm tra root mới lần nữa."
            : "Xóa root cũ; heap tạm thời rỗng.",
          en: heap.length
            ? "Remove the stale root and restore the heap. The while loop checks the new root again."
            : "Remove the stale root; the heap is temporarily empty.",
        },
      });
    }

    snapshot({
      title: { vi: "Root hiện tại hợp lệ", en: "Current root is valid" },
      codeLines: [11],
      hlSet: new Set([0]),
      vars: [
        { name: "root ID", value: heap[0].id },
        { name: "root count", value: heap[0].count },
        { name: `counts[${heap[0].id}]`, value: counts.get(heap[0].id) || 0 },
        { name: "condition", value: "false - stop popping" },
      ],
      note: {
        vi: `Root có count ${heap[0].count}, khớp hash map. Vì đây là max-heap, ${heap[0].count} là tần suất lớn nhất hiện tại.`,
        en: `The root count ${heap[0].count} matches the map. Because this is a max-heap, ${heap[0].count} is the current maximum frequency.`,
      },
    });

    answer.push(heap[0].count);
    snapshot({
      title: { vi: `answer.append(${heap[0].count})`, en: `answer.append(${heap[0].count})` },
      codeLines: [13],
      hlSet: new Set([0]),
      vars: [
        { name: "i", value: i },
        { name: "max frequency", value: heap[0].count },
        { name: "answer", value: `[${answer.join(", ")}]` },
        { name: "counts", value: countsText() },
      ],
      note: {
        vi: `Sau update ${i}, tần suất lớn nhất là ${heap[0].count}.`,
        en: `After update ${i}, the largest frequency is ${heap[0].count}.`,
      },
    });
  }

  snapshot({
    title: { vi: `Kết quả: [${answer.join(", ")}]`, en: `Result: [${answer.join(", ")}]` },
    codeLines: [14],
    markSet: validIndices(),
    vars: [
      { name: "answer", value: `[${answer.join(", ")}]` },
      { name: "final counts", value: countsText() },
    ],
    note: {
      vi: `Hoàn tất ${nums.length} update. Mỗi phần tử answer là tần suất lớn nhất ngay sau update tương ứng.`,
      en: `Completed ${nums.length} updates. Each answer value is the maximum frequency immediately after its update.`,
    },
    final: true,
  });

  return {
    original: { nums: [...nums], freq: changes },
    answer,
    steps,
  };
}

// ─── 9001: Real-Time Experience Profit Tracker ───
function buildSteps9001(input, params) {
  const operations = Array.isArray(input) ? input.map((op) => String(op).trim().toUpperCase()) : [];
  const experiences = String(params.experiences || "").split(",").map((name) => {
    const trimmed = name.trim();
    return trimmed === "-" ? "" : trimmed;
  });
  const deltaParts = String(params.deltas || "").split(",").map((part) => part.trim());
  const deltas = deltaParts.map(Number);
  const steps = [];

  const valid = operations.length > 0
    && operations.length === experiences.length
    && operations.length === deltas.length
    && operations.every((op) => op === "U" || op === "Q")
    && deltaParts.every((part, index) => part !== "" && Number.isInteger(deltas[index]))
    && operations.every((op, index) => op === "Q" || experiences[index] !== "");

  if (!valid) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [9],
      vars: [
        { name: "len(operations)", value: operations.length },
        { name: "len(experiences)", value: experiences.length },
        { name: "len(deltas)", value: deltas.length },
      ],
      note: {
        vi: "Ba mảng phải có cùng độ dài. operations chỉ chứa U hoặc Q; mỗi U cần tên experience; mọi delta phải là số nguyên. Với Q có thể nhập '-' cho tên vì giá trị này không được dùng.",
        en: "All three arrays must have equal length. Operations must be U or Q, updates need a name, and every delta must be an integer. Use '-' as the unused query name.",
      },
      final: true,
    });
    return { original: { operations, experiences, deltas }, answer: null, steps };
  }

  const totals = new Map();
  const heap = [];
  const result = [];

  const isCurrent = (entry) => (totals.get(entry.name) || 0) === entry.profit;
  const higherPriority = (a, b) => a.profit > b.profit
    || (a.profit === b.profit && a.name < b.name);
  const label = (entry) => `${entry.name}·$${entry.profit}${isCurrent(entry) ? "" : " old"}`;
  label.lines = (entry) => [entry.name, `profit=${entry.profit}`, isCurrent(entry) ? "current" : "stale"];
  const totalsText = () => {
    const entries = [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return `{${entries.map(([name, total]) => `${name}: ${total}`).join(", ")}}`;
  };
  const heapText = () => `[${heap.map((entry) => `(${entry.name},${entry.profit}${isCurrent(entry) ? "" : ",old"})`).join(", ")}]`;
  const resultText = () => `[${result.map((name) => name === null ? "None" : `'${name}'`).join(", ")}]`;
  const currentIndices = () => new Set(heap
    .map((entry, index) => isCurrent(entry) ? index : -1)
    .filter((index) => index >= 0));
  let activeOperation = -1;

  function snapshot(opts) {
    const step = heapSnapshot([...heap], label, {
      title: opts.title,
      codeLines: opts.codeLines,
      hlSet: opts.hlSet || new Set(),
      markSet: opts.markSet || currentIndices(),
      vars: opts.vars || [],
      note: opts.note,
    });
    step.profitTrackerView = {
      operations: operations.map((op, index) => ({
        op,
        name: experiences[index],
        delta: deltas[index],
      })),
      activeIndex: activeOperation,
      phase: opts.phase || "state",
      totals: [...totals.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, total]) => ({ name, total })),
      heap: heap.map((entry, index) => ({
        index,
        name: entry.name,
        profit: entry.profit,
        storedPriority: -entry.profit,
        current: isCurrent(entry),
        root: index === 0,
        focused: Boolean(opts.hlSet && opts.hlSet.has(index)),
      })),
      result: [...result],
      action: opts.action || null,
    };
    if (opts.final) step.final = true;
    steps.push(step);
  }

  function siftUp(index) {
    let child = index;
    while (child > 0) {
      const parent = Math.floor((child - 1) / 2);
      if (!higherPriority(heap[child], heap[parent])) break;
      [heap[child], heap[parent]] = [heap[parent], heap[child]];
      child = parent;
    }
  }

  function siftDown(index) {
    let parent = index;
    while (true) {
      let best = parent;
      const left = 2 * parent + 1;
      const right = left + 1;
      if (left < heap.length && higherPriority(heap[left], heap[best])) best = left;
      if (right < heap.length && higherPriority(heap[right], heap[best])) best = right;
      if (best === parent) break;
      [heap[parent], heap[best]] = [heap[best], heap[parent]];
      parent = best;
    }
  }

  function push(entry) {
    heap.push(entry);
    siftUp(heap.length - 1);
  }

  function popRoot() {
    const removed = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      siftDown(0);
    }
    return removed;
  }

  snapshot({
    title: { vi: "Khởi tạo totals", en: "Initialize totals" },
    codeLines: [5],
    phase: "init",
    action: { type: "init", target: "totals" },
    vars: [{ name: "totals", value: "{}" }],
    note: {
      vi: "totals là hash map chứa tổng lợi nhuận đúng hiện tại của mỗi experience. Đây là nguồn dữ liệu chuẩn để nhận biết một entry trong heap còn hợp lệ hay đã cũ.",
      en: "totals is the source of truth for each experience's current profit and is used to detect stale heap entries.",
    },
  });
  snapshot({
    title: { vi: "Khởi tạo heap", en: "Initialize heap" },
    codeLines: [6],
    phase: "init",
    action: { type: "init", target: "heap" },
    vars: [{ name: "heap", value: "[]" }],
    note: {
      vi: "Python heapq là min-heap, nên ta lưu (-total, name). Total càng lớn thì -total càng nhỏ và càng gần root. Khi bằng total, tuple tự ưu tiên name nhỏ hơn theo thứ tự chữ cái.",
      en: "Python heapq is a min-heap, so entries are stored as (-total, name). Larger totals rise to the root, with names breaking ties alphabetically.",
    },
  });
  snapshot({
    title: { vi: "Khởi tạo res", en: "Initialize res" },
    codeLines: [7],
    phase: "init",
    action: { type: "init", target: "res" },
    vars: [{ name: "res", value: "[]" }],
    note: {
      vi: "res chỉ nhận thêm một phần tử khi gặp operation Q. Mỗi phần tử là tên experience đang có total lớn nhất, hoặc None nếu chưa có update nào.",
      en: "res receives one item per query: the current highest earner, or None when no experience has been updated.",
    },
  });

  for (let index = 0; index < operations.length; index++) {
    activeOperation = index;
    const op = operations[index];
    const name = experiences[index];
    const delta = deltas[index];

    snapshot({
      title: { vi: `Operation ${index}: ${op}${op === "U" ? ` ${name} ${delta >= 0 ? "+" : ""}${delta}` : ""}`, en: `Operation ${index}: ${op}${op === "U" ? ` ${name} ${delta >= 0 ? "+" : ""}${delta}` : ""}` },
      codeLines: [9],
      phase: "read",
      action: { type: "read", op, name, delta },
      vars: [
        { name: "index", value: index },
        { name: "op", value: op },
        { name: "name", value: op === "U" ? name : "unused" },
        { name: "delta", value: op === "U" ? delta : "unused" },
        { name: "totals", value: totalsText() },
        { name: "res", value: resultText() },
      ],
      note: {
        vi: op === "U"
          ? `Đọc update thứ ${index}: thay đổi total của ${name} một lượng ${delta >= 0 ? "+" : ""}${delta}.`
          : `Đọc query thứ ${index}: cần tìm experience có total lớn nhất ở đúng thời điểm này.`,
        en: op === "U" ? `Read update ${index} for ${name}.` : `Read query ${index} and find the current highest earner.`,
      },
    });

    if (op === "U") {
      snapshot({
        title: { vi: "op == 'U' là Đúng", en: "op == 'U' is True" },
        codeLines: [10],
        phase: "branch",
        action: { type: "branch", branch: "update" },
        vars: [{ name: "op", value: op }, { name: "branch", value: "update" }],
        note: {
          vi: "Đi vào nhánh update. Ta cập nhật hash map trước, sau đó push một snapshot mới vào heap; snapshot cũ không cần tìm và xóa ngay.",
          en: "Enter the update branch: update the map first, then push a fresh snapshot into the heap.",
        },
      });

      const oldTotal = totals.get(name) || 0;
      const newTotal = oldTotal + delta;
      totals.set(name, newTotal);
      snapshot({
        title: { vi: `totals['${name}'] = ${oldTotal} + (${delta}) = ${newTotal}`, en: `totals['${name}'] = ${oldTotal} + (${delta}) = ${newTotal}` },
        codeLines: [11],
        phase: "update",
        action: { type: "update", name, oldTotal, delta, newTotal },
        vars: [
          { name: "old total", value: oldTotal },
          { name: "delta", value: delta },
          { name: "new total", value: newTotal },
          { name: "totals", value: totalsText() },
        ],
        note: {
          vi: `Nguồn dữ liệu chuẩn đã đổi: ${name} hiện có total ${newTotal}. Mọi heap entry cũ của ${name} có profit khác ${newTotal} lập tức trở thành stale, nhưng vẫn nằm trong heap cho tới khi cản đường ở root.`,
          en: `${name}'s current total is now ${newTotal}. Older heap entries with another value become stale but remain until they reach the root.`,
        },
      });

      const pushedEntry = { name, profit: newTotal };
      push(pushedEntry);
      const pushedIndex = heap.indexOf(pushedEntry);
      snapshot({
        title: { vi: `Push (${-newTotal}, '${name}')`, en: `Push (${-newTotal}, '${name}')` },
        codeLines: [12],
        phase: "push",
        action: { type: "push", name, profit: newTotal, storedPriority: -newTotal },
        hlSet: new Set([Math.max(0, pushedIndex)]),
        vars: [
          { name: "stored tuple", value: `(${-newTotal}, '${name}')` },
          { name: "heap", value: heapText() },
          { name: "root", value: `${heap[0].name}: ${heap[0].profit}` },
        ],
        note: {
          vi: `Push phiên bản mới của ${name} vào heap rồi sift-up. Cây hiển thị profit dương cho dễ đọc, dù Python thực tế lưu ${-newTotal}. Update kết thúc tại đây; lazy deletion chỉ chạy khi có query.`,
          en: `Push ${name}'s fresh snapshot and sift it up. Lazy deletion runs only when a query needs the root.`,
        },
      });
      continue;
    }

    snapshot({
      title: { vi: "op == 'U' là Sai, vào Query", en: "op == 'U' is False: query" },
      codeLines: [13],
      phase: "query",
      action: { type: "branch", branch: "query" },
      hlSet: heap.length ? new Set([0]) : new Set(),
      vars: [
        { name: "op", value: op },
        { name: "heap root", value: heap.length ? `${heap[0].name}: ${heap[0].profit}` : "None" },
      ],
      note: {
        vi: "Query không thay đổi totals. Trước khi trả lời, ta chỉ cần làm sạch root cho tới khi root khớp với total hiện tại trong hash map.",
        en: "A query does not change totals. It only cleans stale roots before reading the answer.",
      },
    });

    while (heap.length > 0 && !isCurrent(heap[0])) {
      const stale = heap[0];
      const currentTotal = totals.get(stale.name) || 0;
      snapshot({
        title: { vi: `Root ${stale.name}:${stale.profit} là stale`, en: `Root ${stale.name}:${stale.profit} is stale` },
        codeLines: [14],
        phase: "compare",
        action: { type: "compare", name: stale.name, heapProfit: stale.profit, actualProfit: currentTotal, current: false },
        hlSet: new Set([0]),
        vars: [
          { name: "heap root profit", value: stale.profit },
          { name: `totals['${stale.name}']`, value: currentTotal },
          { name: "comparison", value: `${stale.profit} != ${currentTotal}` },
        ],
        note: {
          vi: `Heap đang nói ${stale.name} có ${stale.profit}, nhưng totals nói giá trị hiện tại là ${currentTotal}. Hai số không bằng nhau nên entry ở root là phiên bản cũ và không thể dùng làm đáp án.`,
          en: `The heap says ${stale.name} has ${stale.profit}, but totals says ${currentTotal}; the root is stale.`,
        },
      });

      const removed = popRoot();
      snapshot({
        title: { vi: `Pop stale ${removed.name}:${removed.profit}`, en: `Pop stale ${removed.name}:${removed.profit}` },
        codeLines: [15],
        phase: "pop",
        action: { type: "pop", name: removed.name, profit: removed.profit },
        hlSet: heap.length ? new Set([0]) : new Set(),
        vars: [
          { name: "removed", value: `${removed.name}: ${removed.profit}` },
          { name: "heap", value: heapText() },
          { name: "new root", value: heap.length ? `${heap[0].name}: ${heap[0].profit}` : "None" },
        ],
        note: {
          vi: heap.length
            ? "Chỉ entry stale bị xóa. Phần tử cuối được đưa lên root và sift-down; vòng while sẽ kiểm tra root mới thêm một lần nữa."
            : "Entry stale cuối cùng đã bị xóa và heap rỗng; query sẽ trả None.",
          en: heap.length ? "Remove only the stale entry, restore the heap, and check the new root." : "The heap is now empty, so the query returns None.",
        },
      });
    }

    snapshot({
      title: { vi: heap.length ? `Root ${heap[0].name}:${heap[0].profit} hợp lệ` : "Heap rỗng" , en: heap.length ? `Root ${heap[0].name}:${heap[0].profit} is current` : "Heap is empty" },
      codeLines: [14],
      phase: "compare",
      action: heap.length
        ? { type: "compare", name: heap[0].name, heapProfit: heap[0].profit, actualProfit: totals.get(heap[0].name) || 0, current: true }
        : { type: "empty" },
      hlSet: heap.length ? new Set([0]) : new Set(),
      vars: heap.length ? [
        { name: "root profit", value: heap[0].profit },
        { name: `totals['${heap[0].name}']`, value: totals.get(heap[0].name) || 0 },
        { name: "while condition", value: "False" },
      ] : [{ name: "heap", value: "[]" }, { name: "while condition", value: "False" }],
      note: {
        vi: heap.length
          ? `Root khớp totals nên vòng while dừng. Vì heap ưu tiên profit lớn nhất, ${heap[0].name} với ${heap[0].profit} là experience kiếm nhiều nhất hiện tại.`
          : "Heap không có entry nào nên điều kiện while sai ngay; chưa có experience để trả về.",
        en: heap.length ? `The root matches totals, so ${heap[0].name} is the current highest earner.` : "The heap is empty, so there is no current experience.",
      },
    });

    const winner = heap.length ? heap[0].name : null;
    result.push(winner);
    snapshot({
      title: { vi: `res.append(${winner === null ? "None" : `'${winner}'`})`, en: `res.append(${winner === null ? "None" : `'${winner}'`})` },
      codeLines: [16],
      phase: "answer",
      action: { type: "answer", name: winner, profit: heap.length ? heap[0].profit : null, peek: true },
      hlSet: heap.length ? new Set([0]) : new Set(),
      vars: [
        { name: "winner", value: winner === null ? "None" : winner },
        { name: "res", value: resultText() },
        { name: "heap after query", value: heapText() },
      ],
      note: {
        vi: winner === null
          ? "Heap rỗng nên thêm None vào res."
          : `Thêm ${winner} vào res bằng heap[0][1]. Quan trọng: đây là PEEK, không phải heappop; root hợp lệ phải được giữ lại để một query kế tiếp vẫn trả đúng dù không có update xen giữa.`,
        en: winner === null ? "Append None because the heap is empty." : `Append ${winner} by peeking at heap[0]. Do not pop the valid winner.`,
      },
    });
  }

  activeOperation = operations.length;
  snapshot({
    title: { vi: `return ${resultText()}`, en: `return ${resultText()}` },
    codeLines: [18],
    phase: "done",
    action: { type: "return" },
    markSet: currentIndices(),
    vars: [
      { name: "res", value: resultText() },
      { name: "final totals", value: totalsText() },
      { name: "heap entries", value: heap.length },
    ],
    note: {
      vi: `Đã xử lý ${operations.length} operations và trả ${result.length} kết quả query. Mỗi update push đúng một entry; mỗi entry stale bị pop nhiều nhất một lần, nên tổng thời gian là O(m log m), không phải mỗi query quét lại toàn bộ experiences.`,
      en: `Processed ${operations.length} operations and returned ${result.length} query results. Each entry is pushed once and popped at most once, for O(m log m) total time.`,
    },
    final: true,
  });

  return { original: { operations, experiences, deltas }, answer: result, steps };
}

// ─── 347: Top K Frequent Elements ───
// Line-by-line trace of the exact code shown to the user:
//  1  class Solution:
//  2      def topKFrequent(self, nums, k):
//  3          from collections import Counter
//  4          freq = Counter(nums)
//  5          import heapq
//  6          heap = []
//  7          for v, f in freq.items():
//  8              heapq.heappush(heap, (f, v))
//  9              if len(heap) > k:
// 10                 heapq.heappop(heap)
// 11         return [v for f, v in heap]
function buildSteps347(input, params) {
  const nums = String(input).split(",").map((s) => Number(s.trim()));
  const k = params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  const label = (e) => `${e.v}·f${e.f}`;

  steps.push(heapSnapshot([], label, {
    title: { vi: `Top ${k} phần tử xuất hiện nhiều nhất`, en: `Top ${k} frequent elements` },
    codeLines: [2],
    vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "k", value: k }],
    note: {
      vi:
        `Ý tưởng: đếm tần suất, rồi duy trì MIN-HEAP kích thước k theo tần suất. ` +
        `Nếu heap vượt k → bỏ gốc (freq NHỎ nhất). Cuối cùng heap chứa đúng k số tần suất lớn nhất.`,
      en:
        `Idea: count frequencies, then keep a MIN-HEAP of size k by frequency. ` +
        `If the heap exceeds k → pop the root (SMALLEST freq). In the end the heap holds the k most frequent numbers.`,
    },
  }));

  // Line 3: from collections import Counter
  steps.push(heapSnapshot([], label, {
    title: { vi: "from collections import Counter", en: "from collections import Counter" },
    codeLines: [3],
    vars: [],
    note: { vi: "Import Counter để đếm tần suất tiện lợi.", en: "Import Counter for convenient frequency counting." },
  }));

  // Line 4: freq = Counter(nums)
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);
  const freqStr = [...freq.entries()].map(([v, f]) => `${v}→${f}`).join(", ");
  const freqCounterStr = `Counter({${[...freq.entries()].map(([v, f]) => `${v}: ${f}`).join(", ")}})`;
  steps.push(heapSnapshot([], label, {
    title: { vi: `freq = ${freqCounterStr}`, en: `freq = ${freqCounterStr}` },
    codeLines: [4],
    vars: [{ name: "freq", value: freqCounterStr }],
    note: { vi: `Tần suất mỗi số: ${freqStr}.`, en: `Frequency of each number: ${freqStr}.` },
  }));

  // Line 5: import heapq
  steps.push(heapSnapshot([], label, {
    title: { vi: "import heapq", en: "import heapq" },
    codeLines: [5],
    vars: [],
    note: { vi: "Import heapq để dùng min-heap.", en: "Import heapq to use a min-heap." },
  }));

  // Line 6: heap = []
  const heap = [];
  const less = (a, b) => a.f < b.f; // min-heap on frequency
  function heapArrStr() { return `[${heap.map((e) => `${e.v}:${e.f}`).join(", ")}]`; }
  steps.push(heapSnapshot([], label, {
    title: { vi: "heap = []", en: "heap = []" },
    codeLines: [6],
    vars: [{ name: "heap", value: "[]" }],
    note: { vi: "Heap rỗng ban đầu.", en: "The heap starts empty." },
  }));

  function siftUp(i, triggerLine) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (less(heap[i], heap[p])) {
        const a = heap[i], b = heap[p];
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push(heapSnapshot(heap, label, {
          title: { vi: `heapq nội bộ: ${a.v}(f${a.f}) ↑ đổi với ${b.v}(f${b.f})`, en: `heapq internal: swap ${a.v}(f${a.f}) with ${b.v}(f${b.f})` },
          hlSet: new Set([i, p]), codeLines: [triggerLine],
          vars: [{ name: "heap", value: heapArrStr() }],
          note: { vi: `freq ${a.f} < freq ${b.f} → con nhỏ hơn cha, đổi chỗ để giữ tính chất min-heap (gốc luôn nhỏ nhất). Đây là việc heapq.heappush tự làm bên trong.`, en: `freq ${a.f} < freq ${b.f} → child smaller than parent, swap to keep the min-heap property. This happens inside heapq.heappush automatically.` },
        }));
        i = p;
      } else break;
    }
  }

  function siftDown(i, triggerLine) {
    const n = heap.length;
    while (true) {
      let s = i; const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && less(heap[l], heap[s])) s = l;
      if (r < n && less(heap[r], heap[s])) s = r;
      if (s === i) break;
      const a = heap[i], b = heap[s];
      [heap[i], heap[s]] = [heap[s], heap[i]];
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `heapq nội bộ: ${a.v}(f${a.f}) ↓ đổi với ${b.v}(f${b.f})`, en: `heapq internal: swap ${a.v}(f${a.f}) with ${b.v}(f${b.f})` },
        hlSet: new Set([i, s]), codeLines: [triggerLine],
        vars: [{ name: "heap", value: heapArrStr() }],
        note: { vi: `Cha lớn hơn con nhỏ nhất → đẩy xuống để khôi phục min-heap. Đây là việc heapq.heappop tự làm bên trong.`, en: `Parent larger than smallest child → push it down to restore the min-heap. This happens inside heapq.heappop automatically.` },
      }));
      i = s;
    }
  }

  // Line 7-10: for v, f in freq.items(): push, then pop if over capacity.
  for (const [v, f] of freq.entries()) {
    // Line 7: for v, f in freq.items()
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `for v, f in freq.items(): v=${v}, f=${f}`, en: `for v, f in freq.items(): v=${v}, f=${f}` },
      codeLines: [7],
      vars: [{ name: "v", value: v }, { name: "f", value: f }],
      note: { vi: `Xét số ${v} với tần suất ${f}.`, en: `Process number ${v} with frequency ${f}.` },
    }));

    // Line 8: heapq.heappush(heap, (f, v))
    heap.push({ v, f });
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `heapq.heappush(heap, (${f}, ${v}))`, en: `heapq.heappush(heap, (${f}, ${v}))` },
      hlSet: new Set([heap.length - 1]), codeLines: [8],
      vars: [{ name: "heap", value: heapArrStr() }, { name: "size", value: heap.length }],
      note: { vi: `Thêm (${v}, freq ${f}) vào heap; heapq tự sift-up để giữ tính chất min-heap.`, en: `Add (${v}, freq ${f}) to the heap; heapq internally sifts up to keep the min-heap property.` },
    }));
    siftUp(heap.length - 1, 8);

    // Line 9: if len(heap) > k
    const overCapacity = heap.length > k;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `len(heap) > k? ${overCapacity} (${heap.length} vs ${k})`, en: `len(heap) > k? ${overCapacity} (${heap.length} vs ${k})` },
      codeLines: [9],
      vars: [{ name: "len(heap)", value: heap.length }, { name: "k", value: k }],
      note: {
        vi: overCapacity ? `Heap vượt quá ${k} phần tử → cần bỏ gốc.` : `Heap chưa vượt ${k} phần tử → chưa cần bỏ gì.`,
        en: overCapacity ? `Heap exceeds ${k} elements → need to pop the root.` : `Heap hasn't exceeded ${k} elements yet → nothing to pop.`,
      },
    }));

    if (overCapacity) {
      // Line 10: heapq.heappop(heap)
      const removed = heap[0];
      const last = heap.pop();
      if (heap.length > 0) heap[0] = last;
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `heapq.heappop(heap) → bỏ ${removed.v}(f${removed.f})`, en: `heapq.heappop(heap) → remove ${removed.v}(f${removed.f})` },
        hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [10],
        vars: [{ name: "removed", value: `${removed.v} (f${removed.f})` }, { name: "heap", value: heapArrStr() }],
        note: { vi: `Bỏ GỐC (freq nhỏ nhất = ${removed.f}). heapq đưa phần tử cuối lên gốc rồi tự sift-down.`, en: `Remove the ROOT (smallest freq = ${removed.f}). heapq moves the last element to the root then internally sifts down.` },
      }));
      if (heap.length > 0) siftDown(0, 10);
    }
  }

  // Line 11: return [v for f, v in heap]
  const result = heap.map((e) => e.v).sort((a, b) => freq.get(b) - freq.get(a));
  const markAll = new Set(heap.map((_, i) => i));
  const fs = heapSnapshot(heap, label, {
    title: { vi: `return [v for f, v in heap] = [${result.join(", ")}]`, en: `return [v for f, v in heap] = [${result.join(", ")}]` },
    markSet: markAll, codeLines: [11],
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: { vi: `Heap còn lại đúng ${k} số có tần suất lớn nhất → đáp án [${result.join(", ")}].`, en: `The heap holds exactly the ${k} most frequent numbers → answer [${result.join(", ")}].` },
  });
  fs.final = true; steps.push(fs);

  // Keep "freq" visible in every step's debug panel, not just the counting step.
  steps.forEach((step) => {
    if (!step.vars) step.vars = [];
    if (!step.vars.some((v) => v.name === "freq")) {
      step.vars.unshift({ name: "freq", value: freqCounterStr });
    }
  });

  return { input, answer: `[${result.join(", ")}]`, steps };
}

// ─── 373: Find K Pairs with Smallest Sums ───
function buildSteps373(input, params) {
  const nums1 = String(input).split(",").map((s) => Number(s.trim()));
  const nums2 = String(params.nums2 || "").split(",").map((s) => Number(s.trim()));
  const k = params.k !== undefined ? Number(params.k) : 3;
  const steps = [];
  const label = (e) => `(${e.u},${e.v})·s${e.sum}`;
  const heap = [];
  const less = (a, b) => a.sum < b.sum;
  const arrStr = () => `[${heap.map((e) => `(${e.sum}, ${e.i}, ${e.j})`).join(", ")}]`;
  const result = [];
  const picked = new Set();

  function pickedKey(i, j) {
    return `${i},${j}`;
  }

  function pairSnapshot(opts) {
    const dp = Array.from({ length: nums1.length + 1 }, () => Array(nums2.length + 1).fill(""));
    for (let i = 0; i < nums1.length; i++) {
      for (let j = 0; j < nums2.length; j++) {
        dp[i + 1][j + 1] = nums1[i] + nums2[j];
      }
    }

    const pathCells = [];
    const cellLabels = {};
    for (const item of heap) {
      const key = `${item.i + 1},${item.j + 1}`;
      pathCells.push([item.i + 1, item.j + 1]);
      cellLabels[key] = "heap";
    }
    for (const key of picked) {
      const [i, j] = key.split(",").map(Number);
      pathCells.push([i + 1, j + 1]);
      cellLabels[`${i + 1},${j + 1}`] = "result";
    }

    const highlighted = opts.hlSet ? [...opts.hlSet].map((idx) => heap[idx]).find(Boolean) : null;
    const activePair = opts.activePair || (highlighted ? [highlighted.i, highlighted.j, "heap"] : null);
    if (activePair) {
      cellLabels[`${activePair[0] + 1},${activePair[1] + 1}`] = activePair[2] || "current";
    }

    return {
      title: opts.title,
      arr: [],
      grid: {
        dp,
        text1: "nums1",
        text2: "nums2",
        largeCells: true,
        rowLabels: nums1.map((value, idx) => ({ index: `i=${idx}`, char: String(value) })),
        colLabels: nums2.map((value, idx) => ({ index: `j=${idx}`, char: String(value) })),
        hlCell: activePair ? [activePair[0] + 1, activePair[1] + 1] : null,
        pathCells,
        cellLabels,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: opts.final || false,
    };
  }

  const heapSnapshot = (_heap, _label, opts) => pairSnapshot(opts);

  function siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (!less(heap[i], heap[p])) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  }
  function siftDown(i) {
    const n = heap.length;
    while (true) {
      let s = i; const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && less(heap[l], heap[s])) s = l;
      if (r < n && less(heap[r], heap[s])) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      i = s;
    }
  }

  steps.push(pairSnapshot({
    title: { vi: `Tìm ${k} cặp có tổng nhỏ nhất`, en: `Find ${k} pairs with smallest sums` },
    codeLines: [2],
    vars: [{ name: "nums1", value: `[${nums1.join(",")}]` }, { name: "nums2", value: `[${nums2.join(",")}]` }, { name: "k", value: k }],
    note: {
      vi:
        `Xem mọi cặp như một bảng: hàng i cố định nums1[i], cột j chọn nums2[j], và ô (i,j) có giá trị nums1[i] + nums2[j]. ` +
        `Vì cả hai mảng tăng dần, tổng trong từng hàng cũng tăng từ trái sang phải.\n` +
        `Min-heap chỉ giữ "ứng viên đầu hàng" chưa lấy của mỗi hàng. Gốc heap luôn là tổng nhỏ nhất trong frontier này, nên cũng là cặp nhỏ nhất tiếp theo trên toàn bảng.\n` +
        `Sau khi lấy ô (i,j), ta chỉ cần đưa ô bên phải (i,j+1) của cùng hàng vào heap. Nhờ vậy không phải tạo toàn bộ nums1.length × nums2.length cặp.`,
      en:
        `Pair (u, v): u from nums1, v from nums2. Both arrays are SORTED ascending.\n` +
        `Use a MIN-HEAP on the sum u+v:\n` +
        `• Init: push (nums1[i], nums2[0]) for i = 0..min(k,len1)-1 (smallest pair of each row).\n` +
        `• Repeat k times: pop the root (smallest sum) → add to result; push the next pair (same u, advance to nums2[j+1]).\n` +
        `Node label: "(u,v)·sSum".`,
    },
  }));

  steps.push(pairSnapshot({
    title: { vi: "heap = []", en: "heap = []" },
    codeLines: [5],
    vars: [{ name: "heap", value: arrStr() }],
    note: {
      vi: "Khởi tạo min-heap rỗng. Mỗi phần tử heap sẽ có dạng (tổng, i, j), đại diện cho cặp [nums1[i], nums2[j]]. Chưa có hàng nào đưa ứng viên vào frontier.",
      en: "Initialize an empty heap. No pair has been pushed yet.",
    },
  }));

  // Init: push (nums1[i], nums2[0]).
  const lim = Math.min(k, nums1.length);
  for (let i = 0; i < lim; i++) {
    const el = { u: nums1[i], v: nums2[0], i, j: 0, sum: nums1[i] + nums2[0] };
    heap.push(el);
    steps.push(pairSnapshot({
      title: { vi: `Khởi tạo: push (${el.u}, ${el.v}) tổng ${el.sum}`, en: `Init: push (${el.u}, ${el.v}) sum ${el.sum}` },
      hlSet: new Set([heap.length - 1]), codeLines: [7],
      vars: [{ name: "heap", value: arrStr() }, { name: "i", value: el.i }, { name: "j", value: el.j }],
      note: {
        vi: `Ở hàng i=${el.i}, cặp nhỏ nhất chắc chắn nằm tại cột j=0 vì nums2 đã tăng dần. Ta đưa (${el.u}, ${el.v}) với tổng ${el.u} + ${el.v} = ${el.sum} vào heap. heapq sẽ sift-up để gốc vẫn là ứng viên có tổng nhỏ nhất. Chỉ cần mở tối đa min(k, len(nums1)) hàng vì kết quả chỉ lấy k cặp.`,
        en: `Pair each nums1 element with the FIRST (smallest) of nums2. Add to heap then sift-up.`,
      },
    }));
    siftUp(heap.length - 1);
  }

  steps.push(pairSnapshot({
    title: { vi: "res = []", en: "res = []" },
    codeLines: [8],
    vars: [{ name: "res", value: "[]" }, { name: "heap", value: arrStr() }],
    note: {
      vi: `Khởi tạo res rỗng để lưu các cặp theo đúng thứ tự được lấy khỏi min-heap. Heap hiện có ${heap.length} ứng viên đầu hàng; chưa có cặp nào được xác nhận vào kết quả.`,
      en: "Initialize the empty result list. The heap already has the initial candidates.",
    },
  }));

  // Pop k times.
  while (result.length < k && heap.length > 0) {
    steps.push(pairSnapshot({
      title: { vi: "while heap and len(res) < k", en: "while heap and len(res) < k" },
      codeLines: [9],
      vars: [
        { name: "len(res)", value: result.length },
        { name: "k", value: k },
        { name: "heap", value: arrStr() },
      ],
      note: {
        vi: `Kiểm tra hai điều kiện: heap còn ${heap.length} ứng viên và res mới có ${result.length}/${k} cặp. Cả hai đều đúng nên tiếp tục. Gốc hiện tại là (${heap[0].u}, ${heap[0].v}) có tổng ${heap[0].sum}; đây là cặp sẽ được xét kế tiếp.`,
        en: "There are still heap candidates and fewer than k pairs have been collected.",
      },
    }));

    const root = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    if (heap.length > 0) siftDown(0);

    steps.push(pairSnapshot({
      title: { vi: `heappop -> (${root.u},${root.v})`, en: `heappop -> (${root.u},${root.v})` },
      activePair: [root.i, root.j, "pop"],
      codeLines: [10],
      vars: [
        { name: "s", value: root.sum },
        { name: "i", value: root.i },
        { name: "j", value: root.j },
        { name: "heap", value: arrStr() },
      ],
      note: {
        vi: `Pop gốc (${root.u}, ${root.v}) với tổng ${root.sum}. Cặp này nhỏ nhất toàn cục trong số các cặp chưa lấy: mỗi hàng chỉ đưa phần tử chưa lấy nhỏ nhất của hàng đó vào frontier, và gốc min-heap nhỏ nhất trong tất cả các ứng viên ấy. Sau pop, heapq tự sift-down để khôi phục thứ tự heap.`,
        en: "Pop the heap root: this is the smallest-sum pair in the current frontier.",
      },
    }));

    result.push([root.u, root.v]);
    picked.add(pickedKey(root.i, root.j));
    const resStr = result.map((p) => `[${p.join(",")}]`).join(", ");
    steps.push(pairSnapshot({
      title: { vi: `res.append([${root.u}, ${root.v}])`, en: `res.append([${root.u}, ${root.v}])` },
      activePair: [root.i, root.j, "result"],
      codeLines: [11],
      vars: [
        { name: "s", value: root.sum },
        { name: "i", value: root.i },
        { name: "j", value: root.j },
        { name: "res", value: `[${resStr}]` },
        { name: "heap", value: arrStr() },
      ],
      note: {
        vi: `Thêm [${root.u}, ${root.v}] vào res vì cặp này đã được chứng minh là nhỏ nhất tiếp theo. res hiện có ${result.length}/${k} cặp: [${resStr}]. Ta vẫn phải xem hàng i=${root.i} còn cặp kế tiếp hay không.`,
        en: "Append the popped pair to res.",
      },
    }));

    // Push the next candidate from the same nums1 element.
    if (root.j + 1 < nums2.length) {
      steps.push(pairSnapshot({
        title: { vi: "if j + 1 < len(nums2)", en: "if j + 1 < len(nums2)" },
        activePair: [root.i, root.j, "result"],
        codeLines: [12],
        vars: [
          { name: "j + 1", value: root.j + 1 },
          { name: "len(nums2)", value: nums2.length },
        ],
        note: {
          vi: `Cặp vừa lấy nằm ở cột j=${root.j}. Vì j+1=${root.j + 1} < len(nums2)=${nums2.length}, hàng i=${root.i} vẫn còn ô bên phải. Ô (i=${root.i}, j=${root.j + 1}) là cặp nhỏ nhất chưa xét của hàng này và phải được đưa vào frontier.`,
          en: "If this row has a next column, push the next candidate into the heap.",
        },
      }));

      const nj = root.j + 1;
      const el = { u: root.u, v: nums2[nj], i: root.i, j: nj, sum: root.u + nums2[nj] };
      heap.push(el);
      siftUp(heap.length - 1);
      steps.push(pairSnapshot({
        title: { vi: `Push next pair (${el.u}, ${el.v}) sum ${el.sum}`, en: `Push next pair (${el.u}, ${el.v}) sum ${el.sum}` },
        activePair: [el.i, el.j, "push"],
        hlSet: new Set([heap.findIndex((x) => x.i === el.i && x.j === el.j)]), codeLines: [13],
        vars: [{ name: "heap", value: arrStr() }, { name: "i", value: el.i }, { name: "j", value: el.j }],
        note: {
          vi: `Giữ nguyên hàng i=${el.i}, dịch sang phải tới j=${el.j}: cặp mới là (${el.u}, ${el.v}), tổng ${el.u} + ${el.v} = ${el.sum}. Push cặp này để thay thế ứng viên vừa pop của cùng hàng; heapq sift-up và frontier lại sẵn sàng cho vòng tiếp theo.`,
          en: `Keep u=${el.u}, advance to nums2[j+1] = ${el.v}.`,
        },
      }));
    } else {
      steps.push(pairSnapshot({
        title: { vi: `Hàng i=${root.i} đã hết phần tử`, en: `Row i=${root.i} has no next element` },
        activePair: [root.i, root.j, "result"],
        codeLines: [12],
        vars: [
          { name: "j + 1", value: root.j + 1 },
          { name: "len(nums2)", value: nums2.length },
          { name: "heap", value: arrStr() },
        ],
        note: {
          vi: `Điều kiện sai vì j+1=${root.j + 1} bằng len(nums2)=${nums2.length}. Cặp vừa lấy đã ở cột cuối của hàng i=${root.i}, nên hàng này không còn ứng viên để push; ta tiếp tục chỉ với các hàng còn lại trong heap.`,
          en: `The popped pair was the last element in row i=${root.i}, so this row contributes no new heap candidate.`,
        },
      }));
    }
  }

  steps.push(pairSnapshot({
    title: {
      vi: result.length >= k ? `Đã lấy đủ ${k} cặp` : "Heap đã rỗng",
      en: result.length >= k ? `Collected ${k} pairs` : "The heap is empty",
    },
    codeLines: [9],
    vars: [
      { name: "len(res)", value: result.length },
      { name: "k", value: k },
      { name: "heap size", value: heap.length },
    ],
    note: {
      vi: result.length >= k
        ? `Kiểm tra lại điều kiện while: len(res)=${result.length} không còn nhỏ hơn k=${k}, nên dừng dù heap vẫn có thể còn ứng viên. Ta chỉ được yêu cầu tối đa k cặp.`
        : `Kiểm tra lại điều kiện while: heap đã rỗng sau khi duyệt hết mọi hàng, nên không còn cặp nào để lấy. Kết quả có ${result.length} cặp, ít hơn k vì tổng số cặp khả dụng không đủ.`,
      en: result.length >= k
        ? `The loop stops because len(res)=${result.length} is no longer less than k=${k}.`
        : "The loop stops because no heap candidates remain.",
    },
  }));

  const resStr = result.map((p) => `[${p.join(",")}]`).join(", ");
  const fs = pairSnapshot({
    title: { vi: `return res -> [${resStr}]`, en: `return res -> [${resStr}]` },
    codeLines: [14],
    vars: [{ name: "res", value: `[${resStr}]` }, { name: "return", value: `[${resStr}]` }],
    note: {
      vi: `Trả về res gồm ${result.length} cặp: [${resStr}]. Thứ tự pop của min-heap bảo đảm tổng các cặp không giảm; thuật toán chỉ giữ tối đa min(k, len(nums1)) ứng viên nên không phải tạo toàn bộ tích Descartes của hai mảng.`,
      en: "Finish the function and return res.",
    },
  });
  fs.final = true; steps.push(fs);

  return { input, answer: `[${resStr}]`, steps };
}

// Shared sift helpers that record a step on every swap (generic notes).
function makeSifters(steps, heap, label, less, arrStr) {
  function siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (less(heap[i], heap[p])) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push(heapSnapshot(heap, label, {
          title: { vi: `Sift-up: ${label(heap[p])} ↑`, en: `Sift-up: ${label(heap[p])} ↑` },
          hlSet: new Set([i, p]),
          vars: [{ name: "heap", value: arrStr() }],
          note: { vi: `Con có ưu tiên cao hơn cha → đổi chỗ để giữ tính chất heap (gốc là phần tử lấy ra trước).`, en: `Child has higher priority than parent → swap to keep the heap property (root comes out first).` },
        }));
        i = p;
      } else break;
    }
  }
  function siftDown(i) {
    const n = heap.length;
    while (true) {
      let s = i; const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && less(heap[l], heap[s])) s = l;
      if (r < n && less(heap[r], heap[s])) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Sift-down: ${label(heap[i])} ↓`, en: `Sift-down: ${label(heap[i])} ↓` },
        hlSet: new Set([i, s]),
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `Cha có ưu tiên thấp hơn con → đẩy xuống để khôi phục heap.`, en: `Parent has lower priority than a child → push down to restore the heap.` },
      }));
      i = s;
    }
  }
  return { siftUp, siftDown };
}

// ─── 378: Kth Smallest Element in a Sorted Matrix ───
function buildSteps378(input, params) {
  const matrix = String(input).split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
  const k = params.k !== undefined ? Number(params.k) : 8;
  const n = matrix.length;
  const steps = [];
  const label = (e) => `${e.val}`;
  const heap = [];
  const less = (a, b) => a.val < b.val; // min-heap by value
  const arrStr = () => `[${heap.map((e) => e.val).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);
  const matStr = matrix.map((r) => `[${r.join(",")}]`).join("  ");

  steps.push(heapSnapshot([], label, {
    title: { vi: `Phần tử nhỏ thứ ${k} trong ma trận sorted`, en: `${k}th smallest in a sorted matrix` },
    codeLines: [2],
    vars: [{ name: "matrix", value: matStr }, { name: "k", value: k }],
    note: {
      vi:
        `Ma trận có MỖI HÀNG và MỖI CỘT đều tăng dần.\n` +
        `Dùng MIN-HEAP các phần tử (giá trị, hàng, cột):\n` +
        `• Khởi tạo: đẩy phần tử ĐẦU mỗi hàng (matrix[r][0]).\n` +
        `• Lặp: lấy gốc (nhỏ nhất), đẩy phần tử kế bên phải cùng hàng (matrix[r][c+1]).\n` +
        `• Phần tử lấy ra lần thứ ${k} chính là đáp án.`,
      en:
        `The matrix is sorted in EVERY ROW and EVERY COLUMN.\n` +
        `Use a MIN-HEAP of (value, row, col):\n` +
        `• Init: push the FIRST element of each row (matrix[r][0]).\n` +
        `• Loop: pop the root (smallest), push the next element to its right (matrix[r][c+1]).\n` +
        `• The ${k}th popped element is the answer.`,
    },
  }));

  // Init: first element of each row.
  for (let r = 0; r < n; r++) {
    const el = { val: matrix[r][0], r, c: 0 };
    heap.push(el);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Khởi tạo: push ${el.val} (hàng ${r})`, en: `Init: push ${el.val} (row ${r})` },
      hlSet: new Set([heap.length - 1]), codeLines: [4, 5],
      vars: [{ name: "heap", value: arrStr() }],
      note: { vi: `Đẩy phần tử đầu hàng ${r} = ${el.val} vào heap rồi sift-up.`, en: `Push the first element of row ${r} = ${el.val} into the heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
  }

  let popped = 0; let answer = null;
  while (popped < k && heap.length > 0) {
    const root = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    popped++; answer = root.val;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Pop lần ${popped}: ${root.val} tại (${root.r},${root.c})`, en: `Pop #${popped}: ${root.val} at (${root.r},${root.c})` },
      hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [7, 8],
      vars: [{ name: "lần pop", value: `${popped}/${k}` }, { name: "giá trị", value: root.val }, { name: "heap", value: arrStr() }],
      note: { vi: `Gốc = ${root.val} là phần tử nhỏ thứ ${popped}. ${popped === k ? `Đây là đáp án (nhỏ thứ ${k})!` : `Đưa phần tử cuối lên gốc rồi sift-down.`}`, en: `Root = ${root.val} is the ${popped}th smallest. ${popped === k ? `This is the answer (${k}th smallest)!` : `Move last to root then sift-down.`}` },
    }));
    if (popped === k) break;
    if (heap.length > 0) siftDown(0);
    if (root.c + 1 < matrix[root.r].length) {
      const el = { val: matrix[root.r][root.c + 1], r: root.r, c: root.c + 1 };
      heap.push(el);
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Push kế bên phải: ${el.val} tại (${el.r},${el.c})`, en: `Push right neighbor: ${el.val} at (${el.r},${el.c})` },
        hlSet: new Set([heap.length - 1]), codeLines: [9, 10],
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `Sau khi lấy (${root.r},${root.c}), ứng viên tiếp theo của hàng ${root.r} là ${el.val} ở cột ${el.c}. Đẩy vào rồi sift-up.`, en: `After taking (${root.r},${root.c}), the next candidate of row ${root.r} is ${el.val} at column ${el.c}. Push then sift-up.` },
      }));
      siftUp(heap.length - 1);
    }
  }

  const fs = heapSnapshot(heap, label, {
    title: { vi: `Đáp án: nhỏ thứ ${k} = ${answer}`, en: `Answer: ${k}th smallest = ${answer}` },
    codeLines: [11],
    vars: [{ name: "answer", value: answer }],
    note: { vi: `Phần tử lấy ra lần thứ ${k} = ${answer}.`, en: `The ${k}th popped element = ${answer}.` },
  });
  fs.final = true; steps.push(fs);

  return { input, answer, steps };
}

// ─── 692: Top K Frequent Words ───
function buildSteps692(input, params) {
  const words = String(input).split(",").map((s) => s.trim()).filter((s) => s.length);
  const k = params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  const label = (e) => `-${e.count}, ${e.w}`;

  steps.push(heapSnapshot([], label, {
    title: { vi: `Top ${k} từ xuất hiện nhiều nhất`, en: `Top ${k} frequent words` },
    codeLines: [2],
    vars: [{ name: "words", value: `[${words.join(",")}]` }, { name: "k", value: k }],
    note: {
      vi:
        `Trả về k từ xuất hiện NHIỀU nhất. Nếu BẰNG tần suất → từ NHỎ hơn theo bảng chữ cái xếp trước.\n` +
        `Đẩy (-count, word) vào MIN-HEAP: vì count bị đảo dấu, gốc heap luôn là cặp NHỎ nhất về (-count, word) = count LỚN nhất, hòa thì word NHỎ nhất — đúng thứ tự cần lấy.\n` +
        `Lấy ra (pop) k lần liên tiếp là có ngay k từ đúng thứ tự yêu cầu, KHÔNG cần sắp lại ở cuối.`,
      en:
        `Return the k MOST frequent words. On a tie → the lexicographically SMALLER word comes first.\n` +
        `Push (-count, word) into a MIN-HEAP: negating count means the root is always the SMALLEST (-count, word) pair = HIGHEST count, and on ties the SMALLEST word — exactly the order needed.\n` +
        `Popping k times in a row already yields the k words in the required order, with NO final sort needed.`,
    },
  }));

  // Count frequencies.
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const freqStr = [...freq.entries()].map(([w, f]) => `${w}→${f}`).join(", ");
  const freqCounterStr = `Counter({${[...freq.entries()].map(([w, f]) => `'${w}': ${f}`).join(", ")}})`;
  steps.push(heapSnapshot([], label, {
    title: { vi: `freq = ${freqCounterStr}`, en: `freq = ${freqCounterStr}` },
    codeLines: [3],
    vars: [{ name: "freq", value: freqCounterStr }],
    note: { vi: `Tần suất: ${freqStr}.`, en: `Frequencies: ${freqStr}.` },
  }));

  const heap = [];
  // Min-heap on (-count, word) ⇔ root = highest count, tie-break smallest word.
  const less = (a, b) => (a.count > b.count) || (a.count === b.count && a.w < b.w);
  const arrStr = () => `[${heap.map((e) => `(-${e.count},"${e.w}")`).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  steps.push(heapSnapshot([], label, {
    title: { vi: "Khởi tạo heap rỗng", en: "Initialize an empty heap" },
    codeLines: [4],
    vars: [{ name: "heap", value: "[]" }],
    note: { vi: "heap sẽ chứa mọi từ khác nhau, mỗi từ dạng (-count, word).", en: "heap will hold every distinct word, each as (-count, word)." },
  }));

  for (const [w, count] of freq.entries()) {
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Xét "${w}" (count=${count})`, en: `Consider "${w}" (count=${count})` },
      codeLines: [5],
      vars: [{ name: "word, count", value: `"${w}", ${count}` }, { name: "heap", value: arrStr() }],
      note: { vi: `Duyệt tới "${w}" (count ${count}); heap CHƯA đổi, bước sau mới push.`, en: `Now visiting "${w}" (count ${count}); the heap is unchanged, the next step pushes it.` },
    }));
    heap.push({ w, count });
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push (-${count}, "${w}")`, en: `Push (-${count}, "${w}")` },
      hlSet: new Set([heap.length - 1]), codeLines: [6],
      vars: [{ name: "heap", value: arrStr() }, { name: "size", value: heap.length }],
      note: { vi: `Đẩy (-${count}, "${w}") vào cuối heap rồi sift-up để giữ tính chất heap.`, en: `Push (-${count}, "${w}") to the end then sift-up to keep the heap property.` },
    }));
    siftUp(heap.length - 1);
  }

  const result = [];
  steps.push(heapSnapshot(heap, label, {
    title: { vi: "Khởi tạo result rỗng", en: "Initialize an empty result" },
    codeLines: [7],
    vars: [{ name: "result", value: "[]" }, { name: "heap", value: arrStr() }],
    note: { vi: `Heap đã có đủ ${freq.size} từ khác nhau. Giờ lấy ra ${k} lần.`, en: `The heap now holds all ${freq.size} distinct words. Now pop ${k} times.` },
  }));

  for (let i = 0; i < k; i++) {
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Lượt lấy ${i + 1}/${k}`, en: `Pop ${i + 1}/${k}` },
      codeLines: [8],
      vars: [{ name: "vòng", value: `${i + 1}/${k}` }, { name: "heap", value: arrStr() }],
      note: { vi: `Bắt đầu lượt lấy thứ ${i + 1}.`, en: `Starting pop #${i + 1}.` },
    }));

    const root = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Pop gốc: (-${root.count}, "${root.w}")`, en: `Pop root: (-${root.count}, "${root.w}")` },
      hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [9],
      vars: [{ name: "count, word", value: `${root.count}, "${root.w}"` }, { name: "heap", value: arrStr() }],
      note: { vi: `Gốc là (-${root.count}, "${root.w}") = từ có count LỚN nhất hiện tại (hòa thì chữ nhỏ hơn). Đưa phần tử cuối lên gốc rồi sift-down.`, en: `The root is (-${root.count}, "${root.w}") = the current word with the HIGHEST count (ties → smaller word). Move the last element to the root then sift-down.` },
    }));
    if (heap.length > 0) siftDown(0);

    result.push(root.w);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `result.append("${root.w}") → [${result.join(", ")}]`, en: `result.append("${root.w}") → [${result.join(", ")}]` },
      codeLines: [10],
      vars: [{ name: "result", value: `[${result.join(", ")}]` }, { name: "heap", value: arrStr() }],
      note: { vi: `Thêm "${root.w}" vào result. Vì heap đã pop đúng thứ tự, KHÔNG cần sắp lại.`, en: `Add "${root.w}" to result. Since the heap already pops in the correct order, no final sort is needed.` },
    }));
  }

  const fs = heapSnapshot(heap, label, {
    title: { vi: `Kết quả: [${result.map((w) => `"${w}"`).join(", ")}]`, en: `Result: [${result.map((w) => `"${w}"`).join(", ")}]` },
    codeLines: [11],
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: { vi: `return result → [${result.join(", ")}].`, en: `return result → [${result.join(", ")}].` },
  });
  fs.final = true; steps.push(fs);

  // Keep "freq" visible in every step's debug panel, not just the counting step.
  steps.forEach((step) => {
    if (!step.vars) step.vars = [];
    if (!step.vars.some((v) => v.name === "freq")) {
      step.vars.unshift({ name: "freq", value: freqCounterStr });
    }
  });

  return { input, answer: `[${result.join(", ")}]`, steps };
}

// ─── 973: K Closest Points to Origin ───
function buildSteps973(input, params) {
  const pts = String(input).split(";").map((p) => p.split(",").map((s) => Number(s.trim())));
  const k = params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  const label = (e) => `(${e.x},${e.y})·d${e.d}`;
  const heap = [];
  const less = (a, b) => a.d > b.d; // MAX-heap: largest distance at root
  const arrStr = () => `[${heap.map((e) => `(${e.x},${e.y}):${e.d}`).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  steps.push(heapSnapshot([], label, {
    title: { vi: `${k} điểm gần gốc tọa độ nhất`, en: `${k} closest points to origin` },
    codeLines: [2],
    vars: [{ name: "points", value: pts.map((p) => `(${p.join(",")})`).join(" ") }, { name: "k", value: k }],
    note: {
      vi:
        `Khoảng cách (bình phương) tới gốc = x² + y² (không cần khai căn).\n` +
        `Dùng MAX-HEAP kích thước k theo khoảng cách:\n` +
        `• Đẩy từng điểm vào heap.\n` +
        `• Nếu heap > k → bỏ GỐC (điểm XA nhất).\n` +
        `• Heap còn lại = k điểm gần nhất. Nhãn: "(x,y)·dKhoảngCách²".`,
      en:
        `Squared distance to origin = x² + y² (no square root needed).\n` +
        `Use a MAX-HEAP of size k by distance:\n` +
        `• Push each point.\n` +
        `• If heap > k → drop the ROOT (FARTHEST point).\n` +
        `• Remaining heap = k closest points. Label: "(x,y)·dDist²".`,
    },
  }));

  steps.push(heapSnapshot([], label, {
    title: { vi: "Khởi tạo max-heap rỗng", en: "Initialize an empty max-heap" },
    codeLines: [3, 4],
    vars: [{ name: "heap", value: "[]" }],
    note: { vi: "heap bắt đầu rỗng, kích thước sẽ được giữ ≤ k khi duyệt từng điểm.", en: "heap starts empty; its size will be kept ≤ k while scanning each point." },
  }));

  for (const [x, y] of pts) {
    const d = x * x + y * y;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `d = ${x}² + ${y}² = ${d}`, en: `d = ${x}² + ${y}² = ${d}` },
      codeLines: [6],
      vars: [{ name: "x, y", value: `${x}, ${y}` }, { name: "d", value: d }],
      note: { vi: `Tính khoảng cách bình phương tới gốc cho điểm (${x},${y}).`, en: `Compute the squared distance to the origin for point (${x},${y}).` },
    }));
    heap.push({ x, y, d });
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push (${x},${y}) d=${d}`, en: `Push (${x},${y}) d=${d}` },
      hlSet: new Set([heap.length - 1]), codeLines: [7],
      vars: [{ name: "heap", value: arrStr() }, { name: "size", value: heap.length }],
      note: { vi: `Thêm vào max-heap rồi sift-up.`, en: `Add to the max-heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
    if (heap.length > k) {
      const removed = heap[0];
      const last = heap.pop();
      if (heap.length > 0) heap[0] = last;
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Heap > ${k} → bỏ điểm xa nhất (${removed.x},${removed.y}) d${removed.d}`, en: `Heap > ${k} → drop farthest (${removed.x},${removed.y}) d${removed.d}` },
        hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [8],
        vars: [{ name: "bỏ", value: `(${removed.x},${removed.y}) d${removed.d}` }, { name: "heap", value: arrStr() }],
        note: { vi: `Gốc max-heap = điểm xa nhất (d=${removed.d}) → loại. Đưa phần tử cuối lên gốc rồi sift-down.`, en: `Max-heap root = farthest point (d=${removed.d}) → remove. Move last to root then sift-down.` },
      }));
      if (heap.length > 0) siftDown(0);
    }
  }

  const result = heap.map((e) => [e.x, e.y]);
  const resStr = result.map((p) => `[${p.join(",")}]`).join(", ");
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Kết quả: [${resStr}]`, en: `Result: [${resStr}]` },
    markSet: new Set(heap.map((_, i) => i)), codeLines: [9],
    vars: [{ name: "answer", value: `[${resStr}]` }],
    note: { vi: `Heap giữ lại đúng ${k} điểm gần gốc nhất.`, en: `The heap keeps exactly the ${k} closest points.` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer: `[${resStr}]`, steps };
}

// ─── 1046: Last Stone Weight ───
function buildSteps1046(input) {
  const stones = String(input).split(",").map((s) => Number(s.trim()));
  const steps = [];
  const label = (e) => `${e}`;
  const heap = [];
  const less = (a, b) => a > b; // MAX-heap
  const arrStr = () => `[${heap.join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  steps.push(heapSnapshot([], label, {
    title: { vi: "Hòn đá cuối cùng (Last Stone Weight)", en: "Last Stone Weight" },
    codeLines: [2],
    vars: [{ name: "stones", value: `[${stones.join(",")}]` }],
    note: {
      vi:
        `Mỗi lần lấy 2 hòn đá NẶNG nhất (x ≥ y) đập nhau:\n` +
        `• Nếu x == y → cả hai vỡ hết.\n` +
        `• Nếu x > y → còn lại 1 hòn nặng x − y.\n` +
        `Dùng MAX-HEAP để luôn lấy 2 hòn nặng nhất. Lặp tới khi còn ≤ 1 hòn.`,
      en:
        `Each turn take the 2 HEAVIEST stones (x ≥ y) and smash them:\n` +
        `• If x == y → both destroyed.\n` +
        `• If x > y → a stone of weight x − y remains.\n` +
        `Use a MAX-HEAP to always pick the two heaviest. Repeat until ≤ 1 stone.`,
    },
  }));

  for (const s of stones) {
    heap.push(s);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push ${s}`, en: `Push ${s}` },
      hlSet: new Set([heap.length - 1]), codeLines: [3, 4],
      vars: [{ name: "heap", value: arrStr() }],
      note: { vi: `Thêm hòn ${s} vào max-heap rồi sift-up.`, en: `Add stone ${s} to the max-heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
  }

  function popMax(roleVi, roleEn) {
    const root = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Lấy hòn nặng nhất = ${root} (${roleVi})`, en: `Pop heaviest = ${root} (${roleEn})` },
      hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [6, 7],
      vars: [{ name: roleVi, value: root }, { name: "heap", value: arrStr() }],
      note: { vi: `Gốc max-heap = hòn nặng nhất = ${root}. Đưa cuối lên gốc rồi sift-down.`, en: `Max-heap root = heaviest = ${root}. Move last to root then sift-down.` },
    }));
    if (heap.length > 0) siftDown(0);
    return root;
  }

  while (heap.length > 1) {
    const x = popMax("x", "x");
    const y = popMax("y", "y");
    if (x - y > 0) {
      const diff = x - y;
      heap.push(diff);
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `${x} đập ${y} → còn ${diff}, push lại`, en: `${x} vs ${y} → ${diff} remains, push back` },
        hlSet: new Set([heap.length - 1]), codeLines: [8, 9],
        vars: [{ name: "x-y", value: `${x}-${y}=${diff}` }, { name: "heap", value: arrStr() }],
        note: { vi: `x=${x} > y=${y} → hòn mới nặng ${diff} quay lại heap. Sift-up.`, en: `x=${x} > y=${y} → a new stone of weight ${diff} goes back in. Sift-up.` },
      }));
      siftUp(heap.length - 1);
    } else {
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `${x} đập ${y} → cả hai vỡ hết`, en: `${x} vs ${y} → both destroyed` },
        codeLines: [8],
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `x == y = ${x} → hai hòn triệt tiêu, không thêm gì.`, en: `x == y = ${x} → both cancel, nothing added.` },
      }));
    }
  }

  const answer = heap.length ? heap[0] : 0;
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Đáp án: ${answer}`, en: `Answer: ${answer}` },
    codeLines: [10],
    vars: [{ name: "answer", value: answer }],
    note: { vi: heap.length ? `Còn lại 1 hòn nặng ${answer}.` : `Không còn hòn nào → 0.`, en: heap.length ? `One stone of weight ${answer} remains.` : `No stones left → 0.` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 215: Kth Largest Element in an Array ───
function buildSteps215(input, params) {
  const nums = String(input).split(",").map((s) => Number(s.trim()));
  const k = params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  const label = (e) => `${e}`;
  const heap = [];
  const less = (a, b) => a < b; // MIN-heap
  const arrStr = () => `[${heap.join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  steps.push(heapSnapshot([], label, {
    title: { vi: `Phần tử LỚN thứ ${k}`, en: `${k}th LARGEST element` },
    codeLines: [2],
    vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "k", value: k }],
    note: {
      vi:
        `Duy trì MIN-HEAP kích thước k:\n` +
        `• Đẩy từng số vào heap.\n` +
        `• Nếu heap > k → bỏ GỐC (số NHỎ nhất trong heap).\n` +
        `• Heap luôn giữ k số lớn nhất; GỐC chính là số lớn thứ ${k}.`,
      en:
        `Keep a MIN-HEAP of size k:\n` +
        `• Push each number.\n` +
        `• If heap > k → drop the ROOT (the SMALLEST in the heap).\n` +
        `• The heap always holds the k largest; the ROOT is the ${k}th largest.`,
    },
  }));

  steps.push(heapSnapshot([], label, {
    title: { vi: "Khởi tạo min-heap rỗng", en: "Initialize an empty min-heap" },
    codeLines: [4],
    vars: [{ name: "heap", value: "[]" }],
    note: { vi: "heap sẽ giữ tối đa k số lớn nhất đã thấy.", en: "heap will hold at most the k largest numbers seen so far." },
  }));

  for (const x of nums) {
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Xét ${x}`, en: `Consider ${x}` },
      codeLines: [5],
      vars: [{ name: "x", value: x }, { name: "heap", value: arrStr() }],
      note: { vi: `Duyệt tới ${x}; heap CHƯA đổi, bước sau mới push.`, en: `Now visiting ${x}; the heap is unchanged, the next step pushes it.` },
    }));
    heap.push(x);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push ${x}`, en: `Push ${x}` },
      hlSet: new Set([heap.length - 1]), codeLines: [6],
      vars: [{ name: "heap", value: arrStr() }, { name: "size", value: heap.length }],
      note: { vi: `Thêm ${x} vào min-heap rồi sift-up.`, en: `Add ${x} to the min-heap then sift-up.` },
    }));
    siftUp(heap.length - 1);

    const overCapacity = heap.length > k;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `len(heap) > k? ${overCapacity} (${heap.length} vs ${k})`, en: `len(heap) > k? ${overCapacity} (${heap.length} vs ${k})` },
      codeLines: [7],
      vars: [{ name: "len(heap)", value: heap.length }, { name: "k", value: k }],
      note: {
        vi: overCapacity ? `Heap vượt quá ${k} phần tử → cần bỏ gốc.` : `Heap chưa vượt ${k} phần tử → chưa cần bỏ gì.`,
        en: overCapacity ? `Heap exceeds ${k} elements → need to pop the root.` : `Heap hasn't exceeded ${k} elements yet → nothing to pop.`,
      },
    }));

    if (overCapacity) {
      const removed = heap[0];
      const last = heap.pop();
      if (heap.length > 0) heap[0] = last;
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Heap > ${k} → bỏ nhỏ nhất ${removed}`, en: `Heap > ${k} → drop smallest ${removed}` },
        hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [8],
        vars: [{ name: "bỏ", value: removed }, { name: "heap", value: arrStr() }],
        note: { vi: `Gốc min-heap = ${removed} là nhỏ nhất → loại (không nằm trong top ${k}). Sift-down.`, en: `Min-heap root = ${removed} is smallest → drop (not in the top ${k}). Sift-down.` },
      }));
      if (heap.length > 0) siftDown(0);
    }
  }

  const answer = heap[0];
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Đáp án: lớn thứ ${k} = ${answer}`, en: `Answer: ${k}th largest = ${answer}` },
    markSet: new Set([0]), codeLines: [9],
    vars: [{ name: "answer", value: answer }],
    note: { vi: `Gốc heap = ${answer} là phần tử lớn thứ ${k}.`, en: `The heap root = ${answer} is the ${k}th largest element.` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 253: Meeting Rooms II ───
function buildSteps253RoomTuples(input) {
  const parsed = String(input || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const valid = parsed.length > 0 && parsed.every((interval) => (
    interval.length === 2
    && Number.isFinite(interval[0])
    && Number.isFinite(interval[1])
    && interval[0] < interval[1]
  ));
  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], codeLines: [3], final: true,
      vars: [{ name: "answer", value: null }],
      note: {
        vi: "Mỗi cuộc họp phải có dạng start,end với start < end; các cuộc họp cách nhau bởi dấu ';'.",
        en: "Each meeting must be start,end with start < end; separate meetings with ';'.",
      },
    });
    return { input, answer: null, steps };
  }

  const intervals = parsed.map(([start, end], index) => ({ start, end, originalIndex: index }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const heap = [];
  const assignments = [];
  let nextRoom = 0;
  let currentIndex = null;

  const heapText = () => `[${heap.map((entry) => `(end=${entry.end}, R${entry.room + 1})`).join(", ")}]`;
  const snapshot = (title, codeLine, vars, note, options = {}) => ({
    title,
    arr: [],
    highlight: [],
    mark: [],
    codeLines: [codeLine],
    vars,
    note,
    final: Boolean(options.final),
    meetingRoomsTimelineView: {
      intervals: intervals.map((meeting) => ({ ...meeting })),
      assignments: assignments.map((meeting) => ({ ...meeting })),
      heap: heap.map((entry) => ({ ...entry })),
      roomCount: nextRoom,
      currentIndex,
      decision: options.decision || null,
      selectedRoom: Number.isInteger(options.selectedRoom) ? options.selectedRoom : null,
    },
  });

  steps.push(snapshot(
    { vi: "Sắp xếp cuộc họp theo start", en: "Sort meetings by start" }, 4,
    [{ name: "intervals", value: intervals.map(({ start, end }) => `[${start},${end}]`).join(" ") }],
    { vi: "Timeline được sắp từ trái sang phải theo thời gian bắt đầu.", en: "The timeline is ordered from left to right by meeting start time." }
  ));
  steps.push(snapshot(
    { vi: "Khởi tạo min-heap rỗng", en: "Initialize an empty min-heap" }, 5,
    [{ name: "heap", value: "[]" }],
    { vi: "Heap sẽ lưu (end, room) của từng phòng đang được sử dụng.", en: "The heap stores (end, room) for every room currently in use." }
  ));
  steps.push(snapshot(
    { vi: "Phòng mới tiếp theo là Room 1", en: "The next new room is Room 1" }, 6,
    [{ name: "next_room", value: nextRoom }],
    { vi: "Chưa có phòng nào được tạo.", en: "No rooms have been created yet." }
  ));

  for (let index = 0; index < intervals.length; index++) {
    const meeting = intervals[index];
    currentIndex = index;
    steps.push(snapshot(
      { vi: `Xét cuộc họp [${meeting.start},${meeting.end}]`, en: `Inspect meeting [${meeting.start},${meeting.end}]` }, 7,
      [{ name: "meeting", value: `[${meeting.start},${meeting.end}]` }, { name: "heap", value: heapText() }],
      { vi: "Thanh nét đứt trên hàng Chờ xếp là cuộc họp đang cần phòng.", en: "The dashed bar on the Pending row is the meeting that needs a room." }
    ));

    const canReuse = heap.length > 0 && heap[0].end <= meeting.start;
    steps.push(snapshot(
      {
        vi: heap.length
          ? `end sớm nhất ${heap[0].end} ≤ start ${meeting.start}? ${canReuse ? "Đúng" : "Sai"}`
          : "Heap rỗng — chưa có phòng để tái sử dụng",
        en: heap.length
          ? `Earliest end ${heap[0].end} ≤ start ${meeting.start}? ${canReuse ? "True" : "False"}`
          : "Heap is empty — no room can be reused",
      }, 8,
      [{ name: "can_reuse", value: canReuse }, { name: "heap min", value: heap.length ? `(end=${heap[0].end}, R${heap[0].room + 1})` : "none" }],
      canReuse
        ? { vi: `Room ${heap[0].room + 1} đã rảnh trước thời điểm ${meeting.start}.`, en: `Room ${heap[0].room + 1} is free by time ${meeting.start}.` }
        : { vi: "Cuộc họp mới chồng thời gian với tất cả phòng đang dùng, nên cần phòng mới.", en: "The new meeting overlaps every occupied room, so a new room is required." }
    ));

    let room;
    if (canReuse) {
      const freed = heap.shift();
      room = freed.room;
      steps.push(snapshot(
        { vi: `Pop → tái sử dụng Room ${room + 1}`, en: `Pop → reuse Room ${room + 1}` }, 9,
        [{ name: "freed", value: `(end=${freed.end}, R${room + 1})` }, { name: "room", value: room }],
        { vi: `Cuộc họp trước trong Room ${room + 1} đã kết thúc lúc ${freed.end}.`, en: `The previous meeting in Room ${room + 1} ended at ${freed.end}.` },
        { decision: "reuse", selectedRoom: room }
      ));
    } else {
      steps.push(snapshot(
        { vi: "Đi vào nhánh tạo phòng mới", en: "Enter the new-room branch" }, 10,
        [{ name: "can_reuse", value: false }],
        { vi: "Không có phòng nào kết thúc kịp trước cuộc họp hiện tại.", en: "No room finishes in time for the current meeting." },
        { decision: "new" }
      ));
      room = nextRoom;
      steps.push(snapshot(
        { vi: `room = ${room} → Room ${room + 1}`, en: `room = ${room} → Room ${room + 1}` }, 11,
        [{ name: "room", value: room }],
        { vi: `Gán cuộc họp vào Room ${room + 1} mới.`, en: `Assign the meeting to new Room ${room + 1}.` },
        { decision: "new", selectedRoom: room }
      ));
      nextRoom++;
      steps.push(snapshot(
        { vi: `next_room = ${nextRoom}`, en: `next_room = ${nextRoom}` }, 12,
        [{ name: "rooms created", value: nextRoom }],
        { vi: `Tổng số phòng đã tạo là ${nextRoom}.`, en: `${nextRoom} room(s) have now been created.` },
        { decision: "new", selectedRoom: room }
      ));
    }

    assignments.push({ ...meeting, room, meetingIndex: index });
    heap.push({ end: meeting.end, room, meetingIndex: index });
    heap.sort((a, b) => a.end - b.end || a.room - b.room);
    steps.push(snapshot(
      { vi: `Xếp [${meeting.start},${meeting.end}] vào Room ${room + 1}`, en: `Place [${meeting.start},${meeting.end}] in Room ${room + 1}` }, 13,
      [{ name: "heap", value: heapText() }, { name: "rooms", value: nextRoom }],
      { vi: `Push (end=${meeting.end}, Room ${room + 1}) vào min-heap. Timeline cho thấy phòng này bận đến ${meeting.end}.`, en: `Push (end=${meeting.end}, Room ${room + 1}) into the min-heap. The timeline shows this room occupied until ${meeting.end}.` },
      { decision: canReuse ? "reused" : "created", selectedRoom: room }
    ));
  }

  currentIndex = null;
  steps.push(snapshot(
    { vi: `Kết quả: ${nextRoom} phòng`, en: `Result: ${nextRoom} rooms` }, 14,
    [{ name: "answer", value: nextRoom }, { name: "heap", value: heapText() }],
    { vi: `Timeline cần ${nextRoom} hàng phòng để không có hai cuộc họp nào chồng nhau trong cùng một phòng.`, en: `The timeline needs ${nextRoom} room lanes so no two meetings overlap within one room.` },
    { final: true, decision: "done" }
  ));
  return { input, answer: nextRoom, steps };
}

function buildSteps253PopPush(input) {
  const parsed = String(input || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const valid = parsed.length > 0 && parsed.every((interval) => (
    interval.length === 2
    && Number.isFinite(interval[0])
    && Number.isFinite(interval[1])
    && interval[0] < interval[1]
  ));
  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], codeLines: [3], codeBlock: 2, final: true,
      vars: [{ name: "answer", value: null }],
      note: {
        vi: "Mỗi cuộc họp phải có dạng start,end với start < end; các cuộc họp cách nhau bởi dấu ';'.",
        en: "Each meeting must be start,end with start < end; separate meetings with ';'.",
      },
    });
    return { input, answer: null, steps };
  }

  const intervals = parsed.map(([start, end], index) => ({ start, end, originalIndex: index }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const heap = [];
  const assignments = [];
  let nextRoom = 0;
  let currentIndex = null;
  const heapText = () => `[${heap.map((entry) => `(end=${entry.end}, R${entry.room + 1})`).join(", ")}]`;
  const snapshot = (title, codeLine, vars, note, options = {}) => ({
    title,
    arr: [],
    highlight: [],
    mark: [],
    codeLines: [codeLine],
    codeBlock: 2,
    vars,
    note,
    final: Boolean(options.final),
    meetingRoomsTimelineView: {
      intervals: intervals.map((meeting) => ({ ...meeting })),
      assignments: assignments.map((meeting) => ({ ...meeting })),
      heap: heap.map((entry) => ({ ...entry })),
      roomCount: nextRoom,
      currentIndex,
      decision: options.decision || null,
      selectedRoom: Number.isInteger(options.selectedRoom) ? options.selectedRoom : null,
    },
  });

  steps.push(snapshot(
    { vi: "Sắp xếp cuộc họp theo start", en: "Sort meetings by start" }, 4,
    [{ name: "intervals", value: intervals.map(({ start, end }) => `[${start},${end}]`).join(" ") }],
    { vi: "Approach 2 dùng heap chỉ chứa end; timeline gắn thêm Room để nhìn được việc phân bổ.", en: "Approach 2 stores only end times in the heap; the timeline also tracks Room IDs for clarity." }
  ));
  steps.push(snapshot(
    { vi: "Khởi tạo pq rỗng", en: "Initialize empty pq" }, 5,
    [{ name: "pq", value: "[]" }],
    { vi: "pq là min-heap, nên pop luôn lấy cuộc họp kết thúc sớm nhất.", en: "pq is a min-heap, so pop always removes the earliest ending meeting." }
  ));

  for (let index = 0; index < intervals.length; index++) {
    const meeting = intervals[index];
    currentIndex = index;
    steps.push(snapshot(
      { vi: `Xét [${meeting.start},${meeting.end}]`, en: `Inspect [${meeting.start},${meeting.end}]` }, 6,
      [{ name: "start", value: meeting.start }, { name: "end", value: meeting.end }, { name: "pq", value: heapText() }],
      { vi: "Xử lý cuộc họp kế tiếp theo thứ tự start tăng dần.", en: "Process the next meeting in ascending start-time order." }
    ));

    const isEmpty = heap.length === 0;
    steps.push(snapshot(
      { vi: `len(pq) == 0? ${isEmpty}`, en: `len(pq) == 0? ${isEmpty}` }, 7,
      [{ name: "len(pq)", value: heap.length }, { name: "is_empty", value: isEmpty }],
      isEmpty
        ? { vi: "Chưa có phòng nào, nên cuộc họp đầu tiên phải tạo Room 1.", en: "No room exists yet, so the first meeting creates Room 1." }
        : { vi: "Heap đã có phòng; pop phòng kết thúc sớm nhất để kiểm tra tái sử dụng.", en: "The heap has rooms; pop the earliest ending one to test reuse." }
    ));

    if (isEmpty) {
      const room = nextRoom++;
      assignments.push({ ...meeting, room, meetingIndex: index });
      heap.push({ end: meeting.end, room, meetingIndex: index });
      steps.push(snapshot(
        { vi: `Push ${meeting.end} → tạo Room ${room + 1}`, en: `Push ${meeting.end} → create Room ${room + 1}` }, 8,
        [{ name: "pq", value: heapText() }, { name: "rooms", value: nextRoom }],
        { vi: `Room ${room + 1} được dùng cho [${meeting.start},${meeting.end}].`, en: `Room ${room + 1} is assigned to [${meeting.start},${meeting.end}].` },
        { decision: "created", selectedRoom: room }
      ));
      continue;
    }

    steps.push(snapshot(
      { vi: "Đi vào nhánh pop heap", en: "Enter the heap-pop branch" }, 9,
      [{ name: "pq", value: heapText() }],
      { vi: "Lấy phòng có end nhỏ nhất ra khỏi heap.", en: "Remove the room with the smallest end time from the heap." }
    ));
    const earliest = heap.shift();
    steps.push(snapshot(
      { vi: `curr = ${earliest.end} từ Room ${earliest.room + 1}`, en: `curr = ${earliest.end} from Room ${earliest.room + 1}` }, 10,
      [{ name: "curr", value: earliest.end }, { name: "pq after pop", value: heapText() }],
      { vi: `Room ${earliest.room + 1} là ứng viên tái sử dụng vì kết thúc sớm nhất.`, en: `Room ${earliest.room + 1} is the reuse candidate because it ends first.` },
      { selectedRoom: earliest.room }
    ));

    const canReuse = earliest.end <= meeting.start;
    steps.push(snapshot(
      { vi: `${earliest.end} ≤ ${meeting.start}? ${canReuse}`, en: `${earliest.end} ≤ ${meeting.start}? ${canReuse}` }, 11,
      [{ name: "curr", value: earliest.end }, { name: "start", value: meeting.start }, { name: "can_reuse", value: canReuse }],
      canReuse
        ? { vi: `Room ${earliest.room + 1} đã rảnh, nên dùng lại cho cuộc họp hiện tại.`, en: `Room ${earliest.room + 1} is free, so reuse it for the current meeting.` }
        : { vi: `Ngay cả Room ${earliest.room + 1} kết thúc sớm nhất vẫn còn bận, nên cần phòng mới.`, en: `Even earliest-ending Room ${earliest.room + 1} is still busy, so a new room is needed.` },
      { decision: canReuse ? "reuse" : "new", selectedRoom: earliest.room }
    ));

    let room;
    if (canReuse) {
      room = earliest.room;
      assignments.push({ ...meeting, room, meetingIndex: index });
      heap.push({ end: meeting.end, room, meetingIndex: index });
      heap.sort((a, b) => a.end - b.end || a.room - b.room);
      steps.push(snapshot(
        { vi: `Push ${meeting.end} → tái sử dụng Room ${room + 1}`, en: `Push ${meeting.end} → reuse Room ${room + 1}` }, 12,
        [{ name: "pq", value: heapText() }, { name: "rooms", value: nextRoom }],
        { vi: `Thay end cũ ${earliest.end} bằng end mới ${meeting.end}; số phòng không tăng.`, en: `Replace old end ${earliest.end} with new end ${meeting.end}; the room count does not increase.` },
        { decision: "reused", selectedRoom: room }
      ));
    } else {
      steps.push(snapshot(
        { vi: "Không thể tái sử dụng", en: "Cannot reuse the popped room" }, 13,
        [{ name: "curr", value: earliest.end }, { name: "start", value: meeting.start }],
        { vi: "Phải trả curr vào heap trước khi thêm phòng mới.", en: "Push curr back before adding a new room." },
        { decision: "new" }
      ));
      heap.push(earliest);
      heap.sort((a, b) => a.end - b.end || a.room - b.room);
      steps.push(snapshot(
        { vi: `Push lại curr = ${earliest.end}`, en: `Push curr = ${earliest.end} back` }, 14,
        [{ name: "pq", value: heapText() }],
        { vi: `Room ${earliest.room + 1} vẫn bận nên phải giữ lại trong heap.`, en: `Room ${earliest.room + 1} is still occupied, so it must remain in the heap.` }
      ));
      room = nextRoom++;
      assignments.push({ ...meeting, room, meetingIndex: index });
      heap.push({ end: meeting.end, room, meetingIndex: index });
      heap.sort((a, b) => a.end - b.end || a.room - b.room);
      steps.push(snapshot(
        { vi: `Push ${meeting.end} → tạo Room ${room + 1}`, en: `Push ${meeting.end} → create Room ${room + 1}` }, 15,
        [{ name: "pq", value: heapText() }, { name: "rooms", value: nextRoom }],
        { vi: `Thêm end=${meeting.end} cho Room ${room + 1} mới; kích thước heap tăng một.`, en: `Add end=${meeting.end} for new Room ${room + 1}; heap size increases by one.` },
        { decision: "created", selectedRoom: room }
      ));
    }
  }

  currentIndex = null;
  steps.push(snapshot(
    { vi: `Kết quả: len(pq) = ${heap.length}`, en: `Result: len(pq) = ${heap.length}` }, 16,
    [{ name: "answer", value: heap.length }, { name: "pq", value: heapText() }],
    { vi: `Heap chỉ tăng kích thước khi không thể tái sử dụng phòng, nên len(pq) = ${heap.length} là số phòng tối thiểu.`, en: `The heap grows only when no room can be reused, so len(pq) = ${heap.length} is the minimum room count.` },
    { final: true, decision: "done" }
  ));
  return { input, answer: heap.length, steps };
}

function buildSteps253(input, params) {
  const approach = Number(params && params.approach) || 1;
  return approach === 2 ? buildSteps253PopPush(input) : buildSteps253RoomTuples(input);
}

// ─── 767: Reorganize String ───
function buildSteps767(input, params) {
  const approach = Number(params && params.approach) || 1;
  return approach === 2 ? buildSteps767EvenOdd(input) : buildSteps767HeapifyPopPush(input);
}

// Approach 2: max-heap gives characters most-frequent-first; place each run
// of a character directly into the answer's EVEN slots (0,2,4,...) first,
// then wrap to ODD slots (1,3,5,...) once even slots run out. Handling the
// most frequent character first guarantees no two placements of it land
// adjacent, because it fills every other slot before any repeats are near.
function buildSteps767EvenOdd(input) {
  const s = String(input).trim();
  const n = s.length;
  const steps = [];
  const label = (e) => `${e.ch}·${e.freq}`;
  const heap = [];
  const less = (a, b) => a.freq > b.freq; // max-heap by freq
  const arrStr = () => `[${heap.map((e) => `(-${e.freq},'${e.ch}')`).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  const freqDict = new Map();
  for (const ch of s) freqDict.set(ch, (freqDict.get(ch) || 0) + 1);
  const res = new Array(n).fill(null);

  function snapshot(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes: [] },
      highlight: [], mark: [],
      codeLines: [opts.codeLine],
      codeBlock: 2,
      vars: opts.vars,
      note: opts.note,
      final: Boolean(opts.final),
      evenOddFillView: {
        s, n,
        res: res.slice(),
        i: opts.i !== undefined ? opts.i : null,
        curCh: opts.curCh || null,
        heap: heap.map((e) => ({ ...e })),
      },
    });
  }

  snapshot({
    title: { vi: "Sắp lại chuỗi — Cách 2 (điền chẵn/lẻ)", en: "Reorganize string — Approach 2 (even/odd fill)" },
    codeLine: 2,
    vars: [{ name: "s", value: s }],
    note: {
      vi:
        `Ý tưởng khác: KHÔNG giữ ký tự 1 lượt như cách 1. Thay vào đó điền ký tự nhiều nhất vào các Ô CHẴN (0,2,4,...) trước.\n` +
        `Hết ô chẵn thì nhảy sang ô LẺ (1,3,5,...). Vì ký tự nhiều nhất luôn được xử lý trước và chiếm hết ô chẵn, nó không thể kề chính nó.`,
      en:
        `Different idea: instead of holding a char for one turn, place the most frequent char into EVEN slots (0,2,4,...) first.\n` +
        `Once even slots run out, wrap to ODD slots (1,3,5,...). Since the most frequent char always goes first and fills every even slot, it can never end up adjacent to itself.`,
    },
  });

  snapshot({
    title: { vi: "freq_dict = defaultdict(int)", en: "freq_dict = defaultdict(int)" },
    codeLine: 5,
    vars: [{ name: "freq_dict", value: "{}" }],
    note: { vi: "Khởi tạo dict đếm tần suất, mặc định 0.", en: "Initialize a frequency-counting dict, defaulting to 0." },
  });

  snapshot({
    title: { vi: `for char in s: freq_dict[char] += 1`, en: `for char in s: freq_dict[char] += 1` },
    codeLine: 7,
    vars: [{ name: "freq_dict", value: `{${[...freqDict.entries()].map(([c, f]) => `${c}: ${f}`).join(", ")}}` }],
    note: { vi: "Duyệt s, tăng đếm cho từng ký tự.", en: "Scan s, incrementing the count for each character." },
  });

  for (const [ch, freq] of freqDict.entries()) heap.push({ ch, freq });
  snapshot({
    title: { vi: "pq = [(-freq, char) for char, freq in freq_dict.items()]", en: "pq = [(-freq, char) for char, freq in freq_dict.items()]" },
    codeLine: 8,
    vars: [{ name: "pq", value: arrStr() }],
    note: { vi: "Xây danh sách (-freq, char) cho mỗi ký tự khác nhau; chưa phải heap hợp lệ.", en: "Build a list of (-freq, char) for every distinct char; not a valid heap yet." },
  });

  const rawHeap = heap.splice(0, heap.length);
  for (const el of rawHeap) { heap.push(el); siftUp(heap.length - 1); }
  snapshot({
    title: { vi: "heapq.heapify(pq)", en: "heapq.heapify(pq)" },
    codeLine: 9,
    vars: [{ name: "pq", value: arrStr() }],
    note: { vi: "Sắp lại để gốc luôn là ký tự có freq LỚN nhất.", en: "Rearrange so the root is always the char with the HIGHEST freq." },
  });

  const maxFreq = Math.max(...[...freqDict.values()]);
  const impossible = maxFreq > Math.floor((n + 1) / 2);
  snapshot({
    title: impossible
      ? { vi: `-pq[0][0] = ${maxFreq} > (n+1)//2 = ${Math.floor((n + 1) / 2)} → không thể`, en: `-pq[0][0] = ${maxFreq} > (n+1)//2 = ${Math.floor((n + 1) / 2)} → impossible` }
      : { vi: `-pq[0][0] = ${maxFreq} ≤ (n+1)//2 = ${Math.floor((n + 1) / 2)} → khả thi`, en: `-pq[0][0] = ${maxFreq} ≤ (n+1)//2 = ${Math.floor((n + 1) / 2)} → feasible` },
    codeLine: 10,
    vars: [{ name: "max freq", value: maxFreq }, { name: "(len(s)+1)//2", value: Math.floor((n + 1) / 2) }],
    note: impossible
      ? { vi: `Ký tự nhiều nhất xuất hiện quá thường xuyên để tránh kề nhau → trả "".`, en: `The most frequent char appears too often to avoid being adjacent to itself → return "".` }
      : { vi: `Ký tự nhiều nhất vẫn có thể xếp không kề nhau → tiếp tục.`, en: `The most frequent char can still be spread out without adjacency → continue.` },
  });
  if (impossible) {
    snapshot({
      title: { vi: `return ""`, en: `return ""` },
      codeLine: 11,
      final: true,
      vars: [{ name: "answer", value: '""' }],
      note: { vi: `Không thể sắp xếp → trả chuỗi rỗng.`, en: `Cannot be arranged → return an empty string.` },
    });
    return { input, answer: '""', steps };
  }

  snapshot({
    title: { vi: `res = [""] * len(s)`, en: `res = [""] * len(s)` },
    codeLine: 12,
    vars: [{ name: "res", value: `[${res.map(() => "_").join(",")}]` }],
    note: { vi: `Mảng kết quả rỗng, kích thước ${n}.`, en: `An empty result array of size ${n}.` },
  });

  let i = 0;
  snapshot({
    title: { vi: "i = 0", en: "i = 0" },
    codeLine: 13,
    i,
    vars: [{ name: "i", value: i }],
    note: { vi: "Con trỏ i bắt đầu từ ô chẵn đầu tiên.", en: "Pointer i starts at the first even slot." },
  });

  while (heap.length > 0) {
    snapshot({
      title: { vi: `len(pq) > 0? true (${heap.length} còn lại)`, en: `len(pq) > 0? true (${heap.length} left)` },
      codeLine: 14,
      i,
      vars: [{ name: "pq", value: arrStr() }],
      note: { vi: "pq chưa rỗng, tiếp tục lặp.", en: "pq is not empty, keep looping." },
    });

    const cur = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    if (heap.length > 0) siftDown(0);
    snapshot({
      title: { vi: `curr = heapq.heappop(pq) → (-${cur.freq}, '${cur.ch}')`, en: `curr = heapq.heappop(pq) → (-${cur.freq}, '${cur.ch}')` },
      codeLine: 15,
      curCh: cur.ch, i,
      vars: [{ name: "curr", value: `(-${cur.freq}, '${cur.ch}')` }, { name: "pq", value: arrStr() }],
      note: { vi: `Lấy gốc = ký tự '${cur.ch}' đang có freq LỚN nhất (${cur.freq}).`, en: `Pop the root = char '${cur.ch}' with the HIGHEST current freq (${cur.freq}).` },
    });

    snapshot({
      title: { vi: `char, freq = '${cur.ch}', ${cur.freq}`, en: `char, freq = '${cur.ch}', ${cur.freq}` },
      codeLine: 16,
      curCh: cur.ch, i,
      vars: [{ name: "char", value: `'${cur.ch}'` }, { name: "freq", value: cur.freq }],
      note: { vi: `Đảo dấu lại: freq thật = ${cur.freq}.`, en: `Un-negate: the real freq = ${cur.freq}.` },
    });

    for (let k = 0; k < cur.freq; k++) {
      snapshot({
        title: { vi: `for _ in range(${cur.freq}): lượt ${k + 1}/${cur.freq}`, en: `for _ in range(${cur.freq}): turn ${k + 1}/${cur.freq}` },
        codeLine: 17,
        curCh: cur.ch, i,
        vars: [{ name: "turn", value: `${k + 1}/${cur.freq}` }],
        note: { vi: `Điền '${cur.ch}' lần thứ ${k + 1} trong tổng ${cur.freq} lần.`, en: `Placing '${cur.ch}' occurrence ${k + 1} of ${cur.freq}.` },
      });

      res[i] = cur.ch;
      snapshot({
        title: { vi: `res[${i}] = '${cur.ch}'`, en: `res[${i}] = '${cur.ch}'` },
        codeLine: 18,
        curCh: cur.ch, i,
        vars: [{ name: "i", value: i }, { name: "res", value: `[${res.map((c) => c === null ? "_" : `'${c}'`).join(",")}]` }],
        note: { vi: `Đặt '${cur.ch}' vào ô ${i}.`, en: `Place '${cur.ch}' into slot ${i}.` },
      });

      i += 2;
      snapshot({
        title: { vi: `i += 2 → ${i}`, en: `i += 2 → ${i}` },
        codeLine: 19,
        curCh: cur.ch, i: i >= n ? null : i,
        vars: [{ name: "i", value: i }],
        note: { vi: `Nhảy sang ô cách 2 (${i}).`, en: `Jump to the slot 2 apart (${i}).` },
      });

      const wrapped = i >= n;
      snapshot({
        title: wrapped
          ? { vi: `i >= len(s)? true (${i} ≥ ${n})`, en: `i >= len(s)? true (${i} ≥ ${n})` }
          : { vi: `i >= len(s)? false (${i} < ${n})`, en: `i >= len(s)? false (${i} < ${n})` },
        codeLine: 20,
        curCh: cur.ch, i: wrapped ? null : i,
        vars: [{ name: "i", value: i }, { name: "len(s)", value: n }],
        note: wrapped
          ? { vi: `Đã hết ô chẵn, cần chuyển sang ô lẻ.`, en: `Even slots are exhausted, need to switch to odd slots.` }
          : { vi: `Vẫn còn ô chẵn phía trước.`, en: `Even slots remain ahead.` },
      });

      if (wrapped) {
        i = 1;
        snapshot({
          title: { vi: `i = 1 (chuyển sang ô lẻ)`, en: `i = 1 (switch to odd slots)` },
          codeLine: 21,
          curCh: cur.ch, i,
          vars: [{ name: "i", value: i }],
          note: { vi: `Bắt đầu điền ô lẻ (1,3,5,...) từ 1.`, en: `Start filling odd slots (1,3,5,...) from 1.` },
        });
      }
    }
  }

  const result = res.join("");
  snapshot({
    title: { vi: `return "".join(res) = "${result}"`, en: `return "".join(res) = "${result}"` },
    codeLine: 22,
    final: true,
    vars: [{ name: "answer", value: `"${result}"` }],
    note: { vi: `Ghép res thành chuỗi kết quả: "${result}".`, en: `Join res into the result string: "${result}".` },
  });
  return { input, answer: result, steps };
}

function buildSteps767HeapifyPopPush(input) {
  const s = String(input).trim();
  const steps = [];
  const label = (e) => `${e.ch}·${e.cnt}`;
  const heap = [];
  const less = (a, b) => a.cnt > b.cnt; // MAX-heap by count
  const arrStr = () => `[${heap.map((e) => `${e.ch}:${e.cnt}`).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  const freq = new Map();
  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
  const freqStr = [...freq.entries()].map(([c, f]) => `${c}→${f}`).join(", ");

  steps.push(heapSnapshot([], label, {
    title: { vi: "Sắp xếp lại chuỗi (không 2 ký tự kề giống nhau)", en: "Reorganize string (no two adjacent equal)" },
    codeLines: [2],
    vars: [{ name: "s", value: s }, { name: "freq", value: freqStr }],
    note: {
      vi:
        `Mục tiêu: xếp lại để KHÔNG có 2 ký tự giống nhau cạnh nhau.\n` +
        `Tham lam với MAX-HEAP theo tần suất:\n` +
        `• Luôn lấy ký tự CÒN NHIỀU nhất, thêm vào kết quả, giảm count.\n` +
        `• GIỮ ký tự vừa dùng sang một bên 1 lượt (prev) để không bị lặp; lượt sau mới đẩy lại heap.\n` +
        `• Nếu ký tự nào > (n+1)/2 thì không thể xếp → trả "".`,
      en:
        `Goal: rearrange so NO two equal characters are adjacent.\n` +
        `Greedy with a MAX-HEAP by frequency:\n` +
        `• Always take the MOST frequent char, append it, decrement its count.\n` +
        `• HOLD the just-used char aside for one turn (prev) to avoid repeats; push it back next turn.\n` +
        `• If any char count > (n+1)/2, it's impossible → return "".`,
    },
  }));

  // Line 5: heap = [(-c, ch) for ch, c in Counter(s).items()]  (build the raw list first, unheapified)
  for (const [ch, cnt] of freq.entries()) heap.push({ ch, cnt });
  steps.push(heapSnapshot(heap, label, {
    title: { vi: `heap = [(-c, ch) for ch, c in Counter(s).items()]`, en: `heap = [(-c, ch) for ch, c in Counter(s).items()]` },
    codeLines: [5],
    vars: [{ name: "heap", value: arrStr() }],
    note: { vi: `Xây danh sách (-count, ch) cho mỗi ký tự khác nhau. Chưa phải heap hợp lệ, cần heapify.`, en: `Build a list of (-count, ch) for every distinct char. Not a valid heap yet, needs heapify.` },
  }));

  // Line 6: heapq.heapify(heap) — bring the list into heap order via sift-up from scratch.
  const rawHeap = heap.splice(0, heap.length);
  for (const el of rawHeap) {
    heap.push(el);
    siftUp(heap.length - 1);
  }
  steps.push(heapSnapshot(heap, label, {
    title: { vi: `heapq.heapify(heap)`, en: `heapq.heapify(heap)` },
    codeLines: [6],
    vars: [{ name: "heap", value: arrStr() }],
    note: { vi: `Sắp lại heap để gốc luôn là ký tự có count LỚN nhất (max-heap qua -count).`, en: `Rearrange the heap so the root is always the char with the HIGHEST count (max-heap via -count).` },
  }));

  let result = "";
  let prev = null;
  const n = s.length;

  steps.push(heapSnapshot(heap, label, {
    title: { vi: `res, prev = [], None`, en: `res, prev = [], None` },
    codeLines: [7],
    vars: [{ name: "res", value: "[]" }, { name: "prev", value: "None" }],
    note: { vi: `res sẽ chứa kết quả; prev giữ ký tự vừa dùng để chờ 1 lượt trước khi đẩy lại.`, en: `res will hold the result; prev holds the just-used char to wait one turn before pushing back.` },
  }));

  while (heap.length > 0) {
    const notEmpty = heap.length > 0;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `heap còn ${heap.length} phần tử`, en: `heap still has ${heap.length} element(s)` },
      codeLines: [8],
      vars: [{ name: "heap", value: arrStr() }, { name: "condition", value: notEmpty }],
      note: { vi: `heap chưa rỗng, tiếp tục lặp.`, en: `The heap is not empty, keep looping.` },
    }));

    const cur = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    if (heap.length > 0) siftDown(0);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `c, ch = heapq.heappop(heap) → ('${cur.ch}', count ${cur.cnt})`, en: `c, ch = heapq.heappop(heap) → ('${cur.ch}', count ${cur.cnt})` },
      codeLines: [9],
      vars: [{ name: "c", value: -cur.cnt }, { name: "ch", value: `'${cur.ch}'` }, { name: "heap", value: arrStr() }],
      note: { vi: `Lấy gốc = ký tự '${cur.ch}' đang có count LỚN nhất (${cur.cnt}).`, en: `Pop the root = char '${cur.ch}' with the HIGHEST current count (${cur.cnt}).` },
    }));

    result += cur.ch;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `res.append('${cur.ch}') → "${result}"`, en: `res.append('${cur.ch}') → "${result}"` },
      codeLines: [10],
      vars: [{ name: "res", value: `"${result}"` }],
      note: { vi: `Nối '${cur.ch}' vào kết quả.`, en: `Append '${cur.ch}' to the result.` },
    }));

    const pushedBack = prev && prev.cnt > 0;
    if (pushedBack) {
      heap.push(prev);
      siftUp(heap.length - 1);
    }
    steps.push(heapSnapshot(heap, label, {
      title: pushedBack
        ? { vi: `prev còn count < 0 → đẩy lại '${prev.ch}'`, en: `prev still has count < 0 → push '${prev.ch}' back` }
        : { vi: `prev = None hoặc đã hết count → không đẩy lại`, en: `prev is None or exhausted → nothing pushed back` },
      codeLines: [11],
      vars: [{ name: "prev", value: prev ? `('${prev.ch}', count ${prev.cnt})` : "None" }, { name: "heap", value: arrStr() }],
      note: pushedBack
        ? { vi: `Ký tự '${prev.ch}' giữ từ lượt trước vẫn còn count, đẩy lại vào heap.`, en: `Char '${prev.ch}' held from last turn still has count left, push it back into the heap.` }
        : { vi: `Không có ký tự nào cần đẩy lại lượt này.`, en: `Nothing needs to be pushed back this turn.` },
    }));

    cur.cnt--;
    prev = cur;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `prev = (${-cur.cnt}, '${cur.ch}')`, en: `prev = (${-cur.cnt}, '${cur.ch}')` },
      codeLines: [12],
      vars: [{ name: "prev", value: `(${-cur.cnt}, '${cur.ch}')` }],
      note: { vi: `Giữ '${cur.ch}' lại (count đã giảm) để chờ đúng 1 lượt trước khi có thể dùng lại.`, en: `Hold '${cur.ch}' aside (count decremented) so it waits exactly one turn before reuse.` },
    }));
  }

  steps.push(heapSnapshot(heap, label, {
    title: { vi: `out = ''.join(res) = "${result}"`, en: `out = ''.join(res) = "${result}"` },
    codeLines: [13],
    vars: [{ name: "out", value: `"${result}"` }],
    note: { vi: `Ghép res thành chuỗi kết quả.`, en: `Join res into the result string.` },
  }));

  const ok = result.length === n;
  const answer = ok ? result : '""';
  const fs = heapSnapshot(heap, label, {
    title: { vi: ok ? `Kết quả: "${result}"` : `Không thể → ""`, en: ok ? `Result: "${result}"` : `Impossible → ""` },
    codeLines: [14],
    vars: [{ name: "answer", value: answer }],
    note: { vi: ok ? `len(out) == len(s) → xếp được chuỗi hợp lệ: "${result}".` : `len(out) != len(s) → có ký tự quá nhiều → trả "".`, en: ok ? `len(out) == len(s) → built a valid arrangement: "${result}".` : `len(out) != len(s) → some char too frequent → return "".` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 23: Merge k Sorted Lists ───
function buildSteps23(input, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps23DC(input);
  return buildSteps23Heap(input);
}

function buildSteps23Heap(input) {
  const lists = String(input).split(";").map((s) => s.split(",").map(Number).filter((x) => !isNaN(x)));
  const k = lists.length;
  const steps = [];
  const label = (e) => `${e.val}`;
  label.lines = (e) => [`val=${e.val}`, `list=${e.listIdx}`, `pos=${e.nodeIdx}`];
  const heap = [];
  const less = (a, b) => a.val < b.val || (a.val === b.val && a.listIdx < b.listIdx);
  const arrStr = () => `[${heap.map((e) => `(${e.val},L${e.listIdx},p${e.nodeIdx})`).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  const result = [];
  const listsStr = lists.map((l, i) => `L${i}: [${l.join(",")}]`).join("  ");

  steps.push(heapSnapshot([], label, {
    title: { vi: `Gộp ${k} danh sách đã sắp xếp`, en: `Merge ${k} sorted lists` },
    codeLines: [4, 5],
    vars: [{ name: "lists", value: listsStr }, { name: "k", value: k }],
    note: {
      vi:
        `${k} list: ${listsStr}\n\n` +
        `Dùng MIN-HEAP kích thước ≤ ${k}:\n` +
        `• Đẩy head mỗi list vào heap.\n` +
        `• Pop nhỏ nhất → thêm vào kết quả.\n` +
        `• Đẩy node tiếp theo của list đó vào heap.\n` +
        `• Lặp cho đến hết.`,
      en:
        `${k} lists: ${listsStr}\n\n` +
        `Use a MIN-HEAP of size ≤ ${k}:\n` +
        `• Push head of each list into heap.\n` +
        `• Pop the smallest → add to result.\n` +
        `• Push the next node of that list into heap.\n` +
        `• Repeat until done.`,
    },
  }));

  // Track pointers into each list
  const ptrs = lists.map(() => 0);

  // Init: push head of each list
  for (let i = 0; i < k; i++) {
    if (lists[i].length > 0) {
      heap.push({ val: lists[i][0], listIdx: i, nodeIdx: 0 });
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Push head L${i}: ${lists[i][0]}`, en: `Push head L${i}: ${lists[i][0]}` },
        hlSet: new Set([heap.length - 1]), codeLines: [6, 7, 8],
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `Đẩy đầu list ${i} (= ${lists[i][0]}) vào min-heap.`, en: `Push head of list ${i} (= ${lists[i][0]}) into the min-heap.` },
      }));
      siftUp(heap.length - 1);
      ptrs[i] = 1;
    }
  }

  // Pop loop — detailed sub-steps
  while (heap.length > 0) {
    const root = heap[0];
    const li = root.listIdx;
    const hasNext = ptrs[li] < lists[li].length;

    // Sub-step 1: identify root (smallest in heap)
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Gốc heap = ${root.val} (L${li}) → nhỏ nhất`, en: `Heap root = ${root.val} (L${li}) → smallest` },
      hlSet: new Set([0]), codeLines: [10, 11],
      vars: [{ name: "heap root", value: `${root.val} (from L${li})` }, { name: "heap", value: arrStr() }, { name: "linked list so far", value: result.length > 0 ? `D→${result.join("→")}` : "D (empty)" }],
      note: { vi: `Gốc min-heap = ${root.val} → đây là phần tử nhỏ nhất hiện tại. Sắp pop ra nối vào node.next.`, en: `Min-heap root = ${root.val} → current smallest. About to pop and link to node.next.` },
    }));

    // Sub-step 2: pop root, move last to root
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    result.push(root.val);

    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Pop ${root.val} → result=[${result.join(",")}]`, en: `Pop ${root.val} → result=[${result.join(",")}]` },
      hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [11, 12, 13],
      vars: [
        { name: "popped", value: root.val },
        { name: "node (cur)", value: `→ ${root.val} (mới nối)` },
        { name: "linked list", value: `D→${result.join("→")} (cur=${root.val})` },
        { name: "last → root", value: heap.length > 0 ? `${heap[0].val} moved to root` : "heap empty" },
      ],
      note: { vi: `Pop ${root.val}, nối vào result. Đưa phần tử cuối lên gốc → cần sift-down.`, en: `Pop ${root.val}, append to result. Move last element to root → need sift-down.` },
    }));

    // Sub-step 3: sift-down (each swap is a separate step via makeSifters)
    if (heap.length > 0) siftDown(0);

    // Sub-step 4: push next from same list (if available)
    if (hasNext) {
      const nextVal = lists[li][ptrs[li]];
      heap.push({ val: nextVal, listIdx: li, nodeIdx: ptrs[li] });

      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Push L${li}[${ptrs[li]}]=${nextVal} vào heap`, en: `Push L${li}[${ptrs[li]}]=${nextVal} into heap` },
        hlSet: new Set([heap.length - 1]), codeLines: [14, 15],
        vars: [
          { name: "from list", value: `L${li}` },
          { name: "next val", value: nextVal },
          { name: "heap", value: arrStr() },
        ],
        note: { vi: `Đẩy phần tử tiếp theo của L${li} (= ${nextVal}) vào cuối heap → cần sift-up.`, en: `Push next element of L${li} (= ${nextVal}) at the end of heap → need sift-up.` },
      }));

      ptrs[li]++;
      // Sub-step 5: sift-up (each swap is a separate step via makeSifters)
      siftUp(heap.length - 1);
    } else {
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `L${li} hết → không push`, en: `L${li} exhausted → no push` },
        codeLines: [14],
        vars: [{ name: "L" + li, value: "exhausted" }, { name: "heap", value: arrStr() }],
        note: { vi: `List ${li} không còn phần tử → không push gì vào heap.`, en: `List ${li} has no more elements → nothing to push.` },
      }));
    }
  }

  // Final
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Kết quả: [${result.join(",")}]`, en: `Result: [${result.join(",")}]` },
    codeLines: [16],
    vars: [{ name: "answer", value: `[${result.join(",")}]` }, { name: "total nodes", value: result.length }],
    note: { vi: `Đã gộp ${k} list thành 1 list tăng dần: [${result.join(",")}].`, en: `Merged ${k} lists into one sorted list: [${result.join(",")}].` },
  });
  fs.final = true; steps.push(fs);

  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 23 Approach 2: Divide & Conquer (merge pairs) ───
function buildSteps23DC(input) {
  const lists = String(input).split(";").map((s) => s.split(",").map(Number).filter((x) => !isNaN(x)));
  const steps = [];
  const k = lists.length;

  const listsStr = lists.map((l, i) => `L${i}:[${l.join(",")}]`).join("  ");
  steps.push({
    title: { vi: "Divide & Conquer: gộp từng cặp", en: "Divide & Conquer: merge pairwise" },
    arr: lists.flat(), sub: lists.flat().map(String),
    highlight: [], mark: [], codeLines: [2, 3, 4, 5], codeBlock: 2,
    vars: [{ name: "lists", value: listsStr }, { name: "k", value: k }],
    note: {
      vi: `${k} lists: ${listsStr}\n\nLặp: mỗi vòng gộp từng CẶP. Số list giảm một nửa → log(k) vòng.\nMỗi merge dùng 2 pointers so sánh đầu, lấy nhỏ hơn.`,
      en: `${k} lists: ${listsStr}\n\nLoop: each round merges PAIRS. List count halves → log(k) rounds.\nEach merge uses 2 pointers comparing heads, taking the smaller.`,
    },
  });

  let current = lists.map((l) => [...l]);
  let round = 0;

  while (current.length > 1) {
    round++;
    const merged = [];
    for (let p = 0; p < current.length; p += 2) {
      const la = current[p];
      const lb = p + 1 < current.length ? current[p + 1] : null;

      if (!lb) { merged.push(la); continue; }

      // Tree view: la at y=0, lb at y=1, result at y=2
      const res = [];
      let i = 0, j = 0;

      // Intro step for this pair
      function treeSnap(title, note, curI, curJ, vars, codeLines) {
        const nodes = [];
        // la nodes (y=0)
        la.forEach((v, idx) => { nodes.push({ id: idx, label: String(v), x: idx * 2, y: 0, parentId: idx > 0 ? idx - 1 : null, hl: idx === curI, isWord: false }); });
        // lb nodes (y=1)
        const lbOff = la.length;
        lb.forEach((v, idx) => { nodes.push({ id: lbOff + idx, label: String(v), x: idx * 2, y: 1, parentId: idx > 0 ? lbOff + idx - 1 : null, hl: idx === curJ, isWord: false }); });
        // result nodes (y=2): dummy "D" + values
        const resOff = la.length + lb.length;
        nodes.push({ id: resOff, label: "D", x: 0, y: 2, parentId: null, hl: false, isWord: false });
        res.forEach((v, idx) => {
          const isCur = idx === res.length - 1;
          nodes.push({ id: resOff + 1 + idx, label: String(v), x: (idx + 1) * 2, y: 2, parentId: resOff + idx, hl: false, isWord: isCur });
        });
        const ann = {};
        if (curI >= 0 && curI < la.length) ann[curI] = "l1";
        if (curJ >= 0 && curJ < lb.length) ann[la.length + curJ] = "l2";
        if (res.length > 0) ann[resOff + res.length] = "cur";
        return { title, arr: [], tree: { nodes, annotations: ann }, highlight: [], mark: [], codeLines: codeLines || [], codeBlock: 2, vars: vars || [], note };
      }

      steps.push(treeSnap(
        { vi: `Vòng ${round}: merge [${la.join(",")}] + [${lb.join(",")}]`, en: `Round ${round}: merge [${la.join(",")}] + [${lb.join(",")}]` },
        { vi: `So sánh đầu mỗi list, lấy nhỏ hơn.`, en: `Compare heads, take the smaller.` },
        0, 0,
        [{ name: "l1", value: la.join("→") }, { name: "l2", value: lb.join("→") }],
        [7, 8, 9, 10]
      ));

      // Merge step by step
      while (i < la.length && j < lb.length) {
        const takeL1 = la[i] <= lb[j];
        if (takeL1) { res.push(la[i]); i++; } else { res.push(lb[j]); j++; }

        steps.push(treeSnap(
          { vi: `${res[res.length-1]} ← ${takeL1 ? "l1" : "l2"}`, en: `${res[res.length-1]} ← ${takeL1 ? "l1" : "l2"}` },
          { vi: `${takeL1 ? `l1=${la[i-1]}≤l2=${lb[j]}` : `l2=${lb[j-1]}<l1=${la[i]}`} → lấy ${res[res.length-1]}.`, en: `${takeL1 ? `l1=${la[i-1]}≤l2=${lb[j]}` : `l2=${lb[j-1]}<l1=${la[i]}`} → take ${res[res.length-1]}.` },
          i < la.length ? i : -1, j < lb.length ? j : -1,
          [{ name: "took", value: `${res[res.length-1]} from ${takeL1?"l1":"l2"}` }, { name: "result", value: res.join("→") }],
          takeL1 ? [17, 18, 19] : [20, 21, 22]
        ));
      }
      // Append remaining
      while (i < la.length) res.push(la[i++]);
      while (j < lb.length) res.push(lb[j++]);

      steps.push(treeSnap(
        { vi: `Merge xong: [${res.join(",")}]`, en: `Merge done: [${res.join(",")}]` },
        { vi: `Kết quả: ${res.join("→")}.`, en: `Result: ${res.join("→")}.` },
        -1, -1,
        [{ name: "merged", value: res.join("→") }],
        [24, 25]
      ));

      merged.push(res);
    }
    current = merged;
  }

  const result = current[0] || [];
  const fs = {
    title: { vi: `Kết quả: ${result.join("→")}`, en: `Result: ${result.join("→")}` },
    arr: result, sub: result.map(String),
    highlight: [], mark: result.map((_, i) => i), final: true, codeLines: [11, 12], codeBlock: 2,
    vars: [{ name: "answer", value: result.join("→") }, { name: "rounds", value: round }],
    note: { vi: `Sau ${round} vòng gộp cặp: ${result.join("→")}.`, en: `After ${round} pairwise merge rounds: ${result.join("→")}.` },
  };
  steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 218: The Skyline Problem ───
function buildSteps218(input) {
  const raw = String(input || "").trim();
  let buildings;

  try {
    buildings = raw.startsWith("[")
      ? JSON.parse(raw)
      : raw.split(";").filter(Boolean).map((row) => row.split(",").map((value) => Number(value.trim())));
  } catch (_) {
    buildings = [];
  }

  const valid = Array.isArray(buildings)
    && buildings.length > 0
    && buildings.every((building) => Array.isArray(building)
      && building.length === 3
      && building.every(Number.isInteger)
      && building[0] < building[1]
      && building[2] > 0);

  if (!valid) {
    const steps = [{
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      skylineView: { buildings: [], skyline: [], heap: [], sweepX: null, currentHeight: 0, activeBuildingIds: [] },
      codeLines: [4],
      vars: [{ name: "buildings", value: "[]" }],
      note: {
        vi: "Mỗi tòa nhà phải có dạng left,right,height với left < right và height > 0.",
        en: "Each building must be left,right,height with left < right and height > 0.",
      },
      final: true,
    }];
    return { original: [], answer: [], steps };
  }

  buildings = buildings
    .map((building, id) => [...building, id])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
    .map((building, id) => [building[0], building[1], building[2], id]);

  const plainBuildings = buildings.map(([left, right, height]) => [left, right, height]);
  const events = [...new Set(buildings.flatMap(([left, right]) => [left, right]))].sort((a, b) => a - b);
  const heap = [];
  const answer = [];
  const steps = [];
  const detailedTrace = buildings.length <= 60;
  let i = 0;
  let sweepX = null;
  let currentHeight = 0;

  const higherPriority = (a, b) => a.height > b.height
    || (a.height === b.height && a.right < b.right)
    || (a.height === b.height && a.right === b.right && a.id < b.id);

  function siftUp(index) {
    let child = index;
    while (child > 0) {
      const parent = Math.floor((child - 1) / 2);
      if (!higherPriority(heap[child], heap[parent])) break;
      [heap[child], heap[parent]] = [heap[parent], heap[child]];
      child = parent;
    }
  }

  function siftDown(index) {
    let parent = index;
    while (true) {
      let best = parent;
      const left = parent * 2 + 1;
      const right = left + 1;
      if (left < heap.length && higherPriority(heap[left], heap[best])) best = left;
      if (right < heap.length && higherPriority(heap[right], heap[best])) best = right;
      if (best === parent) break;
      [heap[parent], heap[best]] = [heap[best], heap[parent]];
      parent = best;
    }
  }

  function push(entry) {
    heap.push(entry);
    siftUp(heap.length - 1);
  }

  function popRoot() {
    const removed = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      siftDown(0);
    }
    return removed;
  }

  const heapText = () => heap.length
    ? `[${heap.map((entry) => `h${entry.height}→${entry.right}${sweepX !== null && entry.right <= sweepX ? " stale" : ""}`).join(", ")}]`
    : "[]";
  const answerText = () => JSON.stringify(answer);
  const activeIds = () => sweepX === null
    ? []
    : buildings.filter(([left, right]) => left <= sweepX && sweepX < right).map((building) => building[3]);

  function snapshot({ title, codeLine, note, extraVars = [], final = false, force = false }) {
    if (!detailedTrace && !force) return;
    const step = {
      title,
      arr: [],
      highlight: [],
      mark: [],
      skylineView: {
        buildings: plainBuildings,
        skyline: answer.map((point) => [...point]),
        heap: heap.map((entry) => ({ height: entry.height, right: entry.right, id: entry.id })),
        sweepX,
        currentHeight,
        activeBuildingIds: activeIds(),
      },
      codeLines: [codeLine],
      vars: [
        { name: "x", value: sweepX === null ? "-" : sweepX },
        { name: "heap (-height, right)", value: heapText() },
        { name: "answer", value: answerText() },
        ...extraVars,
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  snapshot({
    title: { vi: "Lấy tất cả mốc trái/phải và sắp xếp", en: "Collect and sort every left/right edge" },
    codeLine: 5,
    extraVars: [{ name: "events", value: `[${events.join(", ")}]` }],
    note: {
      vi: "Chỉ tại cạnh trái hoặc phải của một tòa nhà, độ cao skyline mới có thể thay đổi.",
      en: "The skyline height can change only at a building's left or right edge.",
    },
    force: true,
  });
  snapshot({
    title: { vi: "Khởi tạo max-heap rỗng", en: "Initialize an empty max-heap" },
    codeLine: 6,
    note: { vi: "Heap lưu (-height, right) trong Python; hình hiển thị height dương cho dễ đọc.", en: "Python stores (-height, right); the visual shows positive heights for readability." },
  });
  snapshot({
    title: { vi: "Khởi tạo danh sách kết quả", en: "Initialize the result list" },
    codeLine: 7,
    note: { vi: "answer sẽ chỉ chứa các điểm mà độ cao thực sự thay đổi.", en: "answer will contain only points where the height actually changes." },
  });
  snapshot({
    title: { vi: "Bắt đầu từ tòa nhà đầu tiên", en: "Start at the first building" },
    codeLine: 8,
    extraVars: [{ name: "i", value: i }],
    note: { vi: "i trỏ tới tòa nhà chưa được đưa vào heap.", en: "i points to the next building not yet pushed into the heap." },
  });

  for (const x of events) {
    sweepX = x;
    snapshot({
      title: { vi: `Đưa đường quét tới x = ${x}`, en: `Move the sweep line to x = ${x}` },
      codeLine: 10,
      extraVars: [{ name: "i", value: i }],
      note: { vi: `Xử lý toàn bộ cạnh bắt đầu và kết thúc tại x = ${x}.`, en: `Process every start and end edge at x = ${x}.` },
    });

    while (i < buildings.length && buildings[i][0] <= x) {
      const [left, right, height, id] = buildings[i];
      snapshot({
        title: { vi: `Tòa nhà ${i} bắt đầu tại ${left} ≤ ${x}`, en: `Building ${i} starts at ${left} ≤ ${x}` },
        codeLine: 11,
        extraVars: [{ name: "i", value: i }, { name: "buildings[i]", value: `[${left}, ${right}, ${height}]` }],
        note: { vi: "Điều kiện đúng, nên tòa nhà này phải tham gia heap trước khi lấy độ cao lớn nhất.", en: "The condition is true, so this building must enter the heap before reading the maximum height." },
      });
      snapshot({
        title: { vi: `Tách left=${left}, right=${right}, height=${height}`, en: `Unpack left=${left}, right=${right}, height=${height}` },
        codeLine: 12,
        extraVars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "height", value: height }],
        note: { vi: "right dùng để nhận biết entry hết hạn; height quyết định ưu tiên trong max-heap.", en: "right detects expiration; height determines max-heap priority." },
      });
      push({ left, right, height, id });
      snapshot({
        title: { vi: `Push (-${height}, ${right}) vào heap`, en: `Push (-${height}, ${right}) into the heap` },
        codeLine: 13,
        extraVars: [{ name: "root", value: `h${heap[0].height}→${heap[0].right}` }],
        note: { vi: `Sau sift-up, root là tòa nhà cao nhất đang có trong heap: h=${heap[0].height}.`, en: `After sift-up, the root is the tallest building in the heap: h=${heap[0].height}.` },
      });
      i += 1;
      snapshot({
        title: { vi: `Tăng i lên ${i}`, en: `Advance i to ${i}` },
        codeLine: 14,
        extraVars: [{ name: "i", value: i }],
        note: { vi: "Chuyển con trỏ sang tòa nhà chưa thêm tiếp theo.", en: "Move the pointer to the next building not yet added." },
      });
    }

    snapshot({
      title: { vi: "Không còn tòa nhà mới tại x này", en: "No more buildings start by this x" },
      codeLine: 11,
      extraVars: [{ name: "i", value: i }],
      note: { vi: i >= buildings.length ? "Đã đưa toàn bộ tòa nhà vào heap." : `Tòa nhà kế tiếp bắt đầu tại ${buildings[i][0]} > ${x}.`, en: i >= buildings.length ? "Every building has been pushed." : `The next building starts at ${buildings[i][0]} > ${x}.` },
    });

    while (heap.length > 0 && heap[0].right <= x) {
      const expired = heap[0];
      snapshot({
        title: { vi: `Root h${expired.height} hết hạn tại ${expired.right}`, en: `Root h${expired.height} expired at ${expired.right}` },
        codeLine: 16,
        extraVars: [{ name: "heap[0].right", value: expired.right }, { name: "expired?", value: `${expired.right} ≤ ${x}` }],
        note: { vi: "Lazy removal chỉ cần xóa entry hết hạn khi nó lên root; entry hết hạn nằm dưới không thể ảnh hưởng maximum.", en: "Lazy removal deletes an expired entry only when it reaches the root; expired entries below it cannot affect the maximum." },
      });
      const removed = popRoot();
      snapshot({
        title: { vi: `Pop tòa nhà h${removed.height} khỏi heap`, en: `Pop building h${removed.height} from the heap` },
        codeLine: 17,
        extraVars: [{ name: "removed", value: `h${removed.height}→${removed.right}` }, { name: "new root", value: heap.length ? `h${heap[0].height}→${heap[0].right}` : "none" }],
        note: { vi: heap.length ? "Sift-down đưa entry ưu tiên cao nhất còn lại lên root." : "Heap đã rỗng vì không còn tòa nhà phủ vị trí x này.", en: heap.length ? "Sift-down moves the highest-priority remaining entry to the root." : "The heap is empty because no building covers this x." },
      });
    }

    snapshot({
      title: { vi: heap.length ? "Root hiện tại chưa hết hạn" : "Heap không còn entry", en: heap.length ? "The current root is still active" : "The heap has no entries" },
      codeLine: 16,
      extraVars: [{ name: "condition", value: heap.length ? `${heap[0].right} ≤ ${x} is false` : "heap is empty" }],
      note: { vi: "Vòng xóa lazy dừng; root bây giờ hợp lệ hoặc heap rỗng.", en: "Lazy removal stops; the root is now valid or the heap is empty." },
    });

    currentHeight = heap.length ? heap[0].height : 0;
    snapshot({
      title: { vi: `Độ cao tại x=${x} là ${currentHeight}`, en: `Height at x=${x} is ${currentHeight}` },
      codeLine: 19,
      extraVars: [{ name: "height", value: currentHeight }],
      note: { vi: heap.length ? "Root của max-heap cho độ cao lớn nhất đang phủ x." : "Không có tòa nhà đang hoạt động nên độ cao trở về 0.", en: heap.length ? "The max-heap root gives the tallest height covering x." : "No building is active, so the height returns to 0." },
    });

    const previousHeight = answer.length ? answer[answer.length - 1][1] : null;
    const changed = answer.length === 0 || previousHeight !== currentHeight;
    snapshot({
      title: { vi: changed ? "Độ cao đã thay đổi" : "Độ cao không đổi", en: changed ? "The height changed" : "The height did not change" },
      codeLine: 20,
      extraVars: [{ name: "previous height", value: previousHeight === null ? "none" : previousHeight }, { name: "changed", value: changed }],
      note: { vi: changed ? "Đây là một điểm ngoặt mới của skyline." : "Không thêm điểm vì skyline vẫn nằm ngang ở cùng độ cao.", en: changed ? "This is a new skyline key point." : "No point is added because the skyline stays at the same height." },
    });

    if (changed) {
      answer.push([x, currentHeight]);
      snapshot({
        title: { vi: `Thêm điểm [${x}, ${currentHeight}]`, en: `Append point [${x}, ${currentHeight}]` },
        codeLine: 21,
        extraVars: [{ name: "new point", value: `[${x}, ${currentHeight}]` }],
        note: { vi: "Nối điểm mới bằng đoạn ngang rồi đoạn dọc để tạo đường bao skyline.", en: "Connect the new point with horizontal and vertical segments to form the skyline outline." },
      });
    }
  }

  snapshot({
    title: { vi: `Hoàn tất skyline với ${answer.length} điểm`, en: `Finish the skyline with ${answer.length} points` },
    codeLine: 23,
    extraVars: [{ name: "return", value: answerText() }],
    note: { vi: "Mỗi điểm liên tiếp có độ cao khác nhau; điểm cuối đưa đường bao trở về mặt đất.", en: "Consecutive points have different heights; the final point returns the outline to ground level." },
    final: true,
    force: true,
  });

  return { original: plainBuildings, answer, steps };
}

module.exports = {
  218: {
    id: 218,
    difficulty: "hard",
    slug: "the-skyline-problem",
    category: HEAP_CAT,
    title: { vi: "The Skyline Problem", en: "The Skyline Problem" },
    titleVi: { vi: "Đường chân trời của các tòa nhà", en: "The skyline formed by buildings" },
    statement: {
      vi: "Cho các tòa nhà [left, right, height], trả về các điểm ngoặt [x, height] mô tả đường chân trời khi nhìn từ xa.",
      en: "Given buildings [left, right, height], return the key points [x, height] describing their skyline.",
    },
    defaultInput: "2,9,10;3,7,15;5,12,12;15,20,10;19,24,8",
    inputKind: "string",
    inputLabel: { vi: "Tòa nhà (left,right,height; ...)", en: "Buildings (left,right,height; ...)" },
    extraParams: [],
    approach: [
      { vi: "Sweep line qua mọi cạnh trái/phải theo thứ tự x tăng dần.", en: "Sweep through every left/right edge in increasing x order." },
      { vi: "Max-heap lưu (height, right). Push tòa nhà đã bắt đầu và lazy-pop root đã kết thúc.", en: "A max-heap stores (height, right). Push started buildings and lazily pop expired roots." },
      { vi: "Chỉ thêm [x, height] khi maximum hiện tại khác độ cao của điểm gần nhất.", en: "Append [x, height] only when the current maximum differs from the latest point's height." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: { vi: "Sắp xếp 2n cạnh; mỗi tòa nhà được push và pop tối đa một lần.", en: "Sort 2n edges; each building is pushed and popped at most once." },
    },
    code: [
      "import heapq",
      "",
      "class Solution:",
      "    def getSkyline(self, buildings):",
      "        events = sorted({x for left, right, height in buildings for x in (left, right)})",
      "        heap = []",
      "        answer = []",
      "        i = 0",
      "",
      "        for x in events:",
      "            while i < len(buildings) and buildings[i][0] <= x:",
      "                left, right, height = buildings[i]",
      "                heapq.heappush(heap, (-height, right))",
      "                i += 1",
      "",
      "            while heap and heap[0][1] <= x:",
      "                heapq.heappop(heap)",
      "",
      "            height = -heap[0][0] if heap else 0",
      "            if not answer or answer[-1][1] != height:",
      "                answer.append([x, height])",
      "",
      "        return answer",
    ],
    builder: buildSteps218,
  },
  3092: {
    id: 3092,
    difficulty: "medium",
    slug: "most-frequent-ids",
    category: HEAP_CAT,
    title: { vi: "Most Frequent IDs", en: "Most Frequent IDs" },
    titleVi: { vi: "ID có tần suất lớn nhất sau mỗi update", en: "Maximum ID frequency after every update" },
    statement: {
      vi: "Với update i, cộng freq[i] vào tần suất của nums[i]. Sau mỗi update, trả về tần suất lớn nhất trong tất cả ID.",
      en: "At update i, add freq[i] to the frequency of nums[i]. After every update, return the largest frequency among all IDs.",
    },
    defaultInput: [2, 3, 2, 1],
    inputKind: "nonneg",
    inputLabel: { vi: "nums (ID được cập nhật)", en: "nums (IDs being updated)" },
    extraParams: [
      {
        key: "freq",
        type: "string",
        label: { vi: "freq (mức thay đổi, phẩy ngăn)", en: "freq (changes, comma separated)" },
        default: "3,2,-3,1",
      },
    ],
    approach: [
      {
        vi: "Hash map counts lưu tần suất thật hiện tại của mỗi ID.",
        en: "A counts hash map stores each ID's true current frequency.",
      },
      {
        vi: "Mỗi update push (-count, id) mới vào heap. Entry cũ không xóa ngay mà trở thành stale.",
        en: "Each update pushes a new (-count, id) into the heap. Older entries remain as stale entries.",
      },
      {
        vi: "Pop root trong khi count trong heap không khớp hash map; root hợp lệ tiếp theo chính là maximum.",
        en: "Pop while the heap root count does not match the map; the next valid root is the maximum.",
      },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Mỗi update push một entry; mỗi stale entry chỉ bị pop một lần. Tổng O(n log n), bộ nhớ O(n).",
        en: "Each update pushes one entry, and every stale entry is popped at most once. Total O(n log n) time and O(n) space.",
      },
    },
    code: [
      "class Solution:",
      "    def mostFrequentIDs(self, nums, freq):",
      "        from collections import defaultdict",
      "        import heapq",
      "        counts = defaultdict(int)",
      "        heap = []",
      "        answer = []",
      "        for id, delta in zip(nums, freq):",
      "            counts[id] += delta",
      "            heapq.heappush(heap, (-counts[id], id))",
      "            while -heap[0][0] != counts[heap[0][1]]:",
      "                heapq.heappop(heap)",
      "            answer.append(-heap[0][0])",
      "        return answer",
    ],
    builder: buildSteps3092,
  },
  9001: {
    id: 9001,
    difficulty: "medium",
    category: HEAP_CAT,
    title: { vi: "Real-Time Experience Profit Tracker", en: "Real-Time Experience Profit Tracker" },
    titleVi: { vi: "Theo dõi experience có lợi nhuận cao nhất", en: "Track the highest-earning experience" },
    statement: {
      vi: "Xử lý chuỗi thao tác U và Q. U cộng delta vào tổng lợi nhuận của một experience. Q trả về tên experience có tổng lợi nhuận lớn nhất hiện tại, hoặc None nếu chưa có dữ liệu. Khi bằng lợi nhuận, tên nhỏ hơn theo thứ tự chữ cái được ưu tiên.",
      en: "Process U and Q operations. U adds a delta to an experience's total profit. Q returns the current highest-earning experience, or None if no data exists. Ties are resolved alphabetically.",
    },
    defaultInput: ["U", "U", "Q", "U", "Q", "U", "Q"],
    inputKind: "stringArray",
    inputLabel: { vi: "operations (JSON hoặc phẩy ngăn cách)", en: "operations (JSON or comma separated)" },
    extraParams: [
      { key: "experiences", type: "string", label: { vi: "experiences (dùng '-' cho Q)", en: "experiences (use '-' for Q)" }, default: "GameA,GameB,-,GameB,-,GameA,-" },
      { key: "deltas", type: "string", label: { vi: "deltas (Q dùng 0)", en: "deltas (use 0 for Q)" }, default: "100,150,0,-60,0,50,0" },
    ],
    approach: [
      { vi: "totals lưu lợi nhuận đúng hiện tại; mỗi update push một snapshot (-total, name) mới vào heap.", en: "totals stores current profits; each update pushes a fresh (-total, name) snapshot into the heap." },
      { vi: "Entry cũ được giữ lại và chỉ bị pop khi lên root nhưng không còn khớp totals. Đây là lazy deletion.", en: "Old entries remain and are popped only when they reach the root and no longer match totals. This is lazy deletion." },
      { vi: "Query peek heap[0] sau khi dọn stale root. Không pop winner hợp lệ, vì query kế tiếp vẫn cần nó.", en: "A query peeks at heap[0] after stale cleanup. It never pops the valid winner, which future queries still need." },
    ],
    complexity: {
      time: "O(m log m)",
      space: "O(m)",
      note: {
        vi: "Mỗi update push một entry và mỗi stale entry bị pop tối đa một lần. Query không quét toàn bộ experience.",
        en: "Each update pushes one entry and each stale entry is popped at most once. Queries do not scan every experience.",
      },
    },
    code: [
      "import heapq",
      "from collections import defaultdict",
      "",
      "def get_highest_earning_experiences(operations, experiences, deltas):",
      "    totals = defaultdict(int)",
      "    heap = []",
      "    res = []",
      "",
      "    for op, name, delta in zip(operations, experiences, deltas):",
      "        if op == 'U':",
      "            totals[name] += delta",
      "            heapq.heappush(heap, (-totals[name], name))",
      "        else:",
      "            while heap and -heap[0][0] != totals[heap[0][1]]:",
      "                heapq.heappop(heap)",
      "            res.append(heap[0][1] if heap else None)",
      "",
      "    return res",
    ],
    builder: buildSteps9001,
  },
  347: {
    id: 347, difficulty: "medium", slug: "top-k-frequent-elements",
    category: HEAP_CAT,
    title: { vi: "Top K Frequent Elements", en: "Top K Frequent Elements" },
    titleVi: { vi: "K phần tử xuất hiện nhiều nhất", en: "K most frequent elements" },
    statement: { vi: "Cho mảng nums và số k, trả về k phần tử xuất hiện NHIỀU NHẤT. Nhập mảng cách bởi dấu phẩy.", en: "Given an array nums and integer k, return the k MOST frequent elements. Enter the array comma-separated." },
    defaultInput: "1,1,1,2,2,3",
    inputKind: "string", inputLabel: { vi: "Mảng số (dấu phẩy)", en: "Array (comma-separated)" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Đếm tần suất bằng hash map.", en: "Count frequencies with a hash map." },
      { vi: "Duy trì min-heap kích thước k theo tần suất; khi vượt k thì bỏ gốc (freq nhỏ nhất).", en: "Keep a size-k min-heap by frequency; when it exceeds k, pop the root (smallest freq)." },
      { vi: "Heap còn lại = k phần tử tần suất lớn nhất. (Bucket sort cho O(n).)", en: "Remaining heap = k most frequent. (Bucket sort gives O(n).)" },
    ],
    complexity: { time: "O(n log k)", space: "O(n)", note: { vi: "n lần push/pop vào heap kích thước k.", en: "n push/pop operations on a size-k heap." } },
    code: [
      "class Solution:",
      "    def topKFrequent(self, nums, k):",
      "        from collections import Counter",
      "        freq = Counter(nums)",
      "        import heapq",
      "        heap = []",
      "        for v, f in freq.items():",
      "            heapq.heappush(heap, (f, v))",
      "            if len(heap) > k:",
      "                heapq.heappop(heap)",
      "        return [v for f, v in heap]",
    ],
    liveArgs: (input, params) => {
      const nums = String(input).split(",").map((s) => Number(s.trim()));
      const k = params.k !== undefined ? Number(params.k) : 2;
      return [nums, k];
    },
    builder: buildSteps347,
  },
  373: {
    id: 373, difficulty: "medium", slug: "find-k-pairs-with-smallest-sums",
    category: HEAP_CAT,
    title: { vi: "Find K Pairs with Smallest Sums", en: "Find K Pairs with Smallest Sums" },
    titleVi: { vi: "K cặp có tổng nhỏ nhất", en: "K pairs with smallest sums" },
    statement: { vi: "Cho 2 mảng đã sắp xếp nums1, nums2 và k. Trả về k cặp (u, v) (u∈nums1, v∈nums2) có tổng u+v nhỏ nhất. Nhập nums1; nums2 và k ở ô tham số.", en: "Given two sorted arrays nums1, nums2 and k, return the k pairs (u, v) (u∈nums1, v∈nums2) with the smallest sums u+v. Enter nums1; nums2 and k in the param fields." },
    defaultInput: "1,7,11",
    inputKind: "string", inputLabel: { vi: "nums1 (đã sắp xếp)", en: "nums1 (sorted)" },
    extraParams: [{ key: "nums2", label: { vi: "nums2 (đã sắp xếp)", en: "nums2 (sorted)" }, type: "string", default: "2,4,6" }, { key: "k", label: { vi: "k", en: "k" }, default: 3 }],
    approach: [
      { vi: "Min-heap theo tổng. Khởi tạo với (nums1[i], nums2[0]) cho i đầu.", en: "Min-heap by sum. Initialize with (nums1[i], nums2[0]) for the first i's." },
      { vi: "Mỗi lần pop cặp nhỏ nhất, giữ nguyên u và đẩy cặp kế tiếp ở bên phải: nums2[j+1].", en: "Each pop of the smallest pair, push the next pair (same u, advance to nums2[j+1])." },
    ],
    complexity: { time: "O(k log k)", space: "O(k)", note: { vi: "Mỗi pop/push trên heap kích thước ≤ k.", en: "Each pop/push on a heap of size ≤ k." } },
    code: [
      "class Solution:",
      "    def kSmallestPairs(self, nums1, nums2, k):",
      "        import heapq",
      "        if not nums1 or not nums2: return []",
      "        heap = []",
      "        for i in range(min(k, len(nums1))):",
      "            heapq.heappush(heap, (nums1[i]+nums2[0], i, 0))",
      "        res = []",
      "        while heap and len(res) < k:",
      "            s, i, j = heapq.heappop(heap)",
      "            res.append([nums1[i], nums2[j]])",
      "            if j + 1 < len(nums2):",
      "                heapq.heappush(heap, (nums1[i]+nums2[j+1], i, j+1))",
      "        return res",
    ],
    liveArgs: (input, params) => {
      const nums1 = String(input).split(",").map((s) => Number(s.trim()));
      const nums2 = String(params.nums2 || "").split(",").map((s) => Number(s.trim()));
      const k = params.k !== undefined ? Number(params.k) : 3;
      return [nums1, nums2, k];
    },
    builder: buildSteps373,
  },
  378: {
    id: 378, difficulty: "medium", slug: "kth-smallest-element-in-a-sorted-matrix",
    category: HEAP_CAT,
    title: { vi: "Kth Smallest Element in a Sorted Matrix", en: "Kth Smallest Element in a Sorted Matrix" },
    titleVi: { vi: "Phần tử nhỏ thứ k trong ma trận sorted", en: "Kth smallest in sorted matrix" },
    statement: { vi: "Cho ma trận n×n với mỗi hàng và mỗi cột tăng dần, tìm phần tử nhỏ thứ k. Nhập các hàng cách bởi ';', các số trong hàng cách bởi ','.", en: "Given an n×n matrix where each row and column is sorted ascending, find the kth smallest element. Enter rows separated by ';', numbers by ','." },
    defaultInput: "1,5,9;10,11,13;12,13,15",
    inputKind: "string", inputLabel: { vi: "Ma trận (hàng cách ';')", en: "Matrix (rows by ';')" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 8 }],
    approach: [
      { vi: "Min-heap (giá trị, hàng, cột). Khởi tạo với phần tử đầu mỗi hàng.", en: "Min-heap of (value, row, col). Initialize with the first element of each row." },
      { vi: "Pop k lần; mỗi pop đẩy phần tử kế bên phải cùng hàng. Lần pop thứ k = đáp án.", en: "Pop k times; each pop pushes the right neighbor in the same row. The kth pop = answer." },
    ],
    complexity: { time: "O(k log n)", space: "O(n)", note: { vi: "Heap chứa tối đa n phần tử (số hàng).", en: "Heap holds at most n elements (number of rows)." } },
    code: [
      "class Solution:",
      "    def kthSmallest(self, matrix, k):",
      "        import heapq",
      "        n = len(matrix)",
      "        heap = [(matrix[r][0], r, 0) for r in range(n)]",
      "        heapq.heapify(heap)",
      "        for _ in range(k):",
      "            val, r, c = heapq.heappop(heap)",
      "            if c + 1 < n:",
      "                heapq.heappush(heap, (matrix[r][c+1], r, c+1))",
      "        return val",
    ],
    liveArgs: (input, params) => {
      const matrix = String(input).split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
      const k = params.k !== undefined ? Number(params.k) : 8;
      return [matrix, k];
    },
    builder: buildSteps378,
  },
  692: {
    id: 692, difficulty: "medium", slug: "top-k-frequent-words",
    category: HEAP_CAT,
    title: { vi: "Top K Frequent Words", en: "Top K Frequent Words" },
    titleVi: { vi: "K từ xuất hiện nhiều nhất", en: "K most frequent words" },
    statement: { vi: "Cho danh sách từ và k, trả về k từ xuất hiện nhiều nhất; nếu bằng tần suất thì từ nhỏ hơn theo bảng chữ cái xếp trước. Nhập các từ cách bởi dấu phẩy.", en: "Given words and k, return the k most frequent; on a tie the lexicographically smaller word comes first. Enter words comma-separated." },
    defaultInput: "i,love,leetcode,i,love,coding",
    inputKind: "string", inputLabel: { vi: "Danh sách từ (dấu phẩy)", en: "Words (comma-separated)" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Đếm tần suất bằng Counter.", en: "Count frequencies with Counter." },
      { vi: "Đẩy (-count, word) vào heap cho mỗi từ. Đảo dấu count nên gốc heap = count LỚN nhất, hòa thì word NHỎ nhất.", en: "Push (-count, word) for every word. Negating count means the root is the HIGHEST count, ties broken by the SMALLEST word." },
      { vi: "Pop k lần liên tiếp là ra ngay k từ đúng thứ tự, không cần sort lại.", en: "Popping k times in a row already yields the k words in order, no extra sort needed." },
    ],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Heap chứa tất cả n từ khác nhau (không giới hạn kích thước k).", en: "The heap holds all n distinct words (not capped at size k)." } },
    code: [
      "class Solution:",
      "    def topKFrequent(self, words, k):",
      "        freq = Counter(words)",
      "        heap = []",
      "        for word, count in freq.items():",
      "            heapq.heappush(heap, (-count, word))",
      "        result = []",
      "        for _ in range(k):",
      "            count, word = heapq.heappop(heap)",
      "            result.append(word)",
      "        return result",
    ],
    liveArgs: (input, params) => {
      const words = String(input).split(",").map((s) => s.trim()).filter((s) => s.length);
      const k = params.k !== undefined ? Number(params.k) : 2;
      return [words, k];
    },
    builder: buildSteps692,
  },
  973: {
    id: 973, difficulty: "medium", slug: "k-closest-points-to-origin",
    category: HEAP_CAT,
    title: { vi: "K Closest Points to Origin", en: "K Closest Points to Origin" },
    titleVi: { vi: "K điểm gần gốc tọa độ nhất", en: "K closest points to origin" },
    statement: { vi: "Cho danh sách điểm và k, trả về k điểm gần gốc tọa độ (0,0) nhất. Nhập các điểm cách bởi ';', tọa độ cách bởi ','.", en: "Given points and k, return the k points closest to the origin (0,0). Enter points separated by ';', coords by ','." },
    defaultInput: "1,3;-2,2;5,8;0,1",
    inputKind: "string", inputLabel: { vi: "Điểm (cách ';')", en: "Points (sep ';')" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Khoảng cách² = x²+y². Max-heap kích thước k; vượt k thì bỏ điểm xa nhất.", en: "Distance² = x²+y². Size-k max-heap; when exceeding k, drop the farthest." },
    ],
    complexity: { time: "O(n log k)", space: "O(k)", note: { vi: "n điểm, heap kích thước k.", en: "n points, heap of size k." } },
    code: [
      "class Solution:",
      "    def kClosest(self, points, k):",
      "        import heapq",
      "        heap = []",
      "        for x, y in points:",
      "            d = x*x + y*y",
      "            heapq.heappush(heap, (-d, x, y))",
      "            if len(heap) > k: heapq.heappop(heap)",
      "        return [[x, y] for d, x, y in heap]",
    ],
    liveArgs: (input, params) => {
      const points = String(input).split(";").map((p) => p.split(",").map((s) => Number(s.trim())));
      const k = params.k !== undefined ? Number(params.k) : 2;
      return [points, k];
    },
    builder: buildSteps973,
  },
  1046: {
    id: 1046, difficulty: "easy", slug: "last-stone-weight",
    category: HEAP_CAT,
    title: { vi: "Last Stone Weight", en: "Last Stone Weight" },
    titleVi: { vi: "Trọng lượng hòn đá cuối", en: "Weight of the last stone" },
    statement: { vi: "Mỗi lần lấy 2 hòn nặng nhất đập nhau (x≥y): nếu x>y còn lại x−y. Trả về trọng lượng hòn cuối (hoặc 0). Nhập các số cách bởi dấu phẩy.", en: "Each turn smash the two heaviest stones (x≥y): if x>y, x−y remains. Return the last stone's weight (or 0). Enter numbers comma-separated." },
    defaultInput: "2,7,4,1,8,1",
    inputKind: "string", inputLabel: { vi: "Trọng lượng đá (dấu phẩy)", en: "Stone weights (comma-sep)" },
    extraParams: [],
    approach: [
      { vi: "Max-heap. Lặp: pop 2 hòn nặng nhất, nếu lệch thì push hiệu vào lại.", en: "Max-heap. Loop: pop the two heaviest; if they differ, push the difference back." },
    ],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Mỗi lần đập là vài thao tác heap.", en: "Each smash is a few heap operations." } },
    code: [
      "class Solution:",
      "    def lastStoneWeight(self, stones):",
      "        import heapq",
      "        heap = [-s for s in stones]",
      "        heapq.heapify(heap)",
      "        while len(heap) > 1:",
      "            x = -heapq.heappop(heap)",
      "            y = -heapq.heappop(heap)",
      "            if x > y:",
      "                heapq.heappush(heap, -(x - y))",
      "        return -heap[0] if heap else 0",
    ],
    liveArgs: (input) => {
      const stones = String(input).split(",").map((s) => Number(s.trim()));
      return [stones];
    },
    builder: buildSteps1046,
  },
  215: {
    id: 215, difficulty: "medium", slug: "kth-largest-element-in-an-array",
    category: HEAP_CAT,
    title: { vi: "Kth Largest Element in an Array", en: "Kth Largest Element in an Array" },
    titleVi: { vi: "Phần tử lớn thứ k", en: "Kth largest element" },
    statement: { vi: "Cho mảng nums và k, trả về phần tử LỚN thứ k (theo thứ tự sắp xếp). Nhập mảng cách bởi dấu phẩy.", en: "Given nums and k, return the kth LARGEST element (in sorted order). Enter the array comma-separated." },
    defaultInput: "3,2,1,5,6,4",
    inputKind: "string", inputLabel: { vi: "Mảng số (dấu phẩy)", en: "Array (comma-separated)" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Min-heap kích thước k; vượt k thì bỏ gốc (nhỏ nhất). Gốc cuối cùng = lớn thứ k.", en: "Size-k min-heap; when exceeding k, drop the root (smallest). Final root = kth largest." },
    ],
    complexity: { time: "O(n log k)", space: "O(k)", note: { vi: "n số, heap kích thước k.", en: "n numbers, heap of size k." } },
    code: [
      "class Solution:",
      "    def findKthLargest(self, nums, k):",
      "        import heapq",
      "        heap = []",
      "        for x in nums:",
      "            heapq.heappush(heap, x)",
      "            if len(heap) > k:",
      "                heapq.heappop(heap)",
      "        return heap[0]",
    ],
    liveArgs: (input, params) => {
      const nums = String(input).split(",").map((s) => Number(s.trim()));
      const k = params.k !== undefined ? Number(params.k) : 2;
      return [nums, k];
    },
    builder: buildSteps215,
  },
  253: {
    id: 253, difficulty: "medium", slug: "meeting-rooms-ii",
    premium: true,
    category: HEAP_CAT,
    title: { vi: "Meeting Rooms II", en: "Meeting Rooms II" },
    titleVi: { vi: "Số phòng họp tối thiểu", en: "Minimum meeting rooms" },
    statement: { vi: "Cho các cuộc họp [start, end], tìm SỐ PHÒNG tối thiểu để tổ chức tất cả. Nhập các cuộc họp cách bởi ';', start/end cách bởi ','.", en: "Given meetings [start, end], find the MINIMUM number of rooms to host them all. Enter meetings separated by ';', start/end by ','." },
    defaultInput: "0,30;5,10;15,20",
    inputKind: "string", inputLabel: { vi: "Cuộc họp (cách ';')", en: "Meetings (sep ';')" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Heap (end, room)", en: "Approach 1: Heap (end, room)" } },
          { value: "2", label: { vi: "Cách 2: Pop rồi push lại", en: "Approach 2: Pop then push back" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 lưu (end, room) trong heap, nên biết trực tiếp phòng nào được tái sử dụng.", en: "Approach 1 stores (end, room) in the heap, directly identifying the room to reuse." },
      { vi: "Cách 2 pop end nhỏ nhất. Nếu tái sử dụng được thì push end mới; nếu không thì push end cũ trở lại rồi push end mới.", en: "Approach 2 pops the smallest end. Reuse by pushing the new end; otherwise push the old end back and then the new end." },
      { vi: "Ở cả hai cách, kích thước heap cuối cùng là số phòng tối thiểu.", en: "In both approaches, the final heap size is the minimum number of rooms." },
    ],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Sắp xếp O(n log n) + heap.", en: "Sort O(n log n) + heap." } },
    code: [
      "import heapq",
      "class Solution:",
      "    def minMeetingRooms(self, intervals):",
      "        intervals.sort(key=lambda x: x[0])",
      "        heap = []  # (end, room)",
      "        next_room = 0",
      "        for start, end in intervals:",
      "            if heap and heap[0][0] <= start:",
      "                _, room = heapq.heappop(heap)",
      "            else:",
      "                room = next_room",
      "                next_room += 1",
      "            heapq.heappush(heap, (end, room))",
      "        return next_room",
    ],
    codeLabel: { vi: "Cách 1: Heap (end, room)", en: "Approach 1: Heap (end, room)" },
    code2: [
      "import heapq",
      "class Solution:",
      "    def minMeetingRooms(self, intervals):",
      "        intervals.sort()",
      "        pq = []",
      "        for start, end in intervals:",
      "            if len(pq) == 0:",
      "                heapq.heappush(pq, end)",
      "            else:",
      "                curr = heapq.heappop(pq)",
      "                if curr <= start:",
      "                    heapq.heappush(pq, end)",
      "                else:",
      "                    heapq.heappush(pq, curr)",
      "                    heapq.heappush(pq, end)",
      "        return len(pq)",
    ],
    code2Label: { vi: "Cách 2: Pop rồi push lại", en: "Approach 2: Pop then push back" },
    builder: buildSteps253,
  },
  767: {
    id: 767, difficulty: "medium", slug: "reorganize-string",
    category: HEAP_CAT,
    title: { vi: "Reorganize String", en: "Reorganize String" },
    titleVi: { vi: "Sắp lại chuỗi không kề trùng", en: "Rearrange so no two adjacent equal" },
    statement: { vi: "Sắp xếp lại chuỗi sao cho không có 2 ký tự giống nhau cạnh nhau. Nếu không thể, trả về \"\". Nhập một chuỗi chữ thường.", en: "Rearrange the string so no two adjacent characters are equal. If impossible, return \"\". Enter a lowercase string." },
    defaultInput: "aab",
    inputKind: "string", inputLabel: { vi: "Chuỗi", en: "String" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Heapify + giữ 1 lượt", en: "Approach 1: Heapify + hold one turn" } },
          { value: "2", label: { vi: "Cách 2: Điền ô chẵn/lẻ", en: "Approach 2: Even/odd slot fill" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: Max-heap theo tần suất. Mỗi lượt lấy ký tự nhiều nhất, giữ lại 1 lượt rồi đẩy về.", en: "Approach 1: Max-heap by frequency. Each turn take the most frequent, hold it one turn, then push back." },
      { vi: "Cách 2: Max-heap lấy ký tự nhiều nhất trước, điền thẳng vào các ô CHẴN (0,2,4,...); hết ô chẵn thì nhảy sang ô LẺ (1,3,5,...).", en: "Approach 2: Max-heap pops the most frequent char first and fills EVEN slots (0,2,4,...) directly; once even slots run out, wrap to ODD slots (1,3,5,...)." },
      { vi: "Cách 2 không cần giữ ký tự 1 lượt vì ký tự nhiều nhất luôn chiếm hết ô chẵn trước khi có ký tự khác chen vào giữa.", en: "Approach 2 needs no one-turn holding because the most frequent char always claims every even slot before anything else can land between its copies." },
    ],
    complexity: { time: "O(n log k)", space: "O(k)", note: { vi: "k ≤ 26 ký tự. Cả hai cách đều O(n log k).", en: "k ≤ 26 distinct chars. Both approaches are O(n log k)." } },
    code: [
      "class Solution:",
      "    def reorganizeString(self, s):",
      "        from collections import Counter",
      "        import heapq",
      "        heap = [(-c, ch) for ch, c in Counter(s).items()]",
      "        heapq.heapify(heap)",
      "        res, prev = [], None",
      "        while heap:",
      "            c, ch = heapq.heappop(heap)",
      "            res.append(ch)",
      "            if prev and prev[0] < 0: heapq.heappush(heap, prev)",
      "            prev = (c + 1, ch)",
      "        out = ''.join(res)",
      "        return out if len(out) == len(s) else ''",
    ],
    code2: [
      "class Solution:",
      "    def reorganizeString(self, s):",
      "        import heapq",
      "        from collections import defaultdict",
      "        freq_dict = defaultdict(int)",
      "        for char in s:",
      "            freq_dict[char] += 1",
      "        pq = [(-freq, char) for char, freq in freq_dict.items()]",
      "        heapq.heapify(pq)",
      "        if -pq[0][0] > (len(s)+1) // 2:",
      "            return \"\"",
      "        res = [\"\"] * len(s)",
      "        i = 0",
      "        while len(pq) > 0:",
      "            curr = heapq.heappop(pq)",
      "            char, freq = curr[1], -curr[0]",
      "            for _ in range(freq):",
      "                res[i] = char",
      "                i += 2",
      "                if i >= len(s):",
      "                    i = 1",
      "        return \"\".join(res)",
    ],
    codeLabel: { vi: "Cách 1: Heapify + giữ 1 lượt", en: "Approach 1: Heapify + hold one turn" },
    code2Label: { vi: "Cách 2: Điền ô chẵn/lẻ", en: "Approach 2: Even/odd slot fill" },
    liveArgs: (input) => [String(input).trim()],
    builder: buildSteps767,
  },
  23: {
    id: 23,
    difficulty: "hard",
    slug: "merge-k-sorted-lists",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Merge k Sorted Lists", en: "Merge k Sorted Lists" },
    titleVi: { vi: "Gộp k danh sách đã sắp xếp", en: "Merge k sorted linked lists" },
    statement: {
      vi: "Cho k danh sách liên kết đã sắp xếp tăng dần, gộp tất cả thành 1 danh sách duy nhất cũng tăng dần. Nhập các list cách bởi ';', giá trị cách bởi ','.",
      en: "Given k sorted linked lists, merge them into one sorted list. Enter lists separated by ';', values by ','.",
    },
    defaultInput: "1,4,5;1,3,4;2,6",
    inputKind: "string",
    inputLabel: { vi: "Các list (cách bởi ';')", en: "Lists (separated by ';')" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Min-Heap O(n log k)", en: "Approach 1: Min-Heap O(n log k)" } },
          { value: "2", label: { vi: "Cách 2: Divide & Conquer O(n log k)", en: "Approach 2: Divide & Conquer O(n log k)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: Min-heap chứa head mỗi list. Pop nhỏ nhất, push node kế.", en: "Approach 1: Min-heap holds head of each list. Pop smallest, push next node." },
      { vi: "Cách 2: Merge từng cặp list (giống merge sort). Lặp cho tới còn 1 list.", en: "Approach 2: Merge lists pairwise (like merge sort). Repeat until one list remains." },
    ],
    complexity: { time: "O(n log k)", space: "O(k) / O(1)", note: { vi: "Cả 2 cách đều O(n log k). Heap dùng O(k), D&C dùng O(1) extra.", en: "Both are O(n log k). Heap uses O(k) space, D&C uses O(1) extra." } },
    code: [
      "import heapq",
      "",
      "class Solution:",
      "    def mergeKLists(self, lists):",
      "        heap = []",
      "        for i, lst in enumerate(lists):",
      "            if lst:",
      "                heapq.heappush(heap, (lst.val, i, lst))",
      "        dummy = node = ListNode(0)",
      "        while heap:",
      "            val, i, cur = heapq.heappop(heap)",
      "            node.next = cur",
      "            node = node.next",
      "            if cur.next:",
      "                heapq.heappush(heap, (cur.next.val, i, cur.next))",
      "        return dummy.next",
    ],
    code2: [
      "class Solution:",
      "    def mergeKLists(self, lists):",
      "        if not lists:",
      "            return None",
      "        while len(lists) > 1:",
      "            merged = []",
      "            for i in range(0, len(lists), 2):",
      "                l1 = lists[i]",
      "                l2 = lists[i+1] if i+1 < len(lists) else None",
      "                merged.append(self.mergeTwoLists(l1, l2))",
      "            lists = merged",
      "        return lists[0]",
      "",
      "    def mergeTwoLists(self, l1, l2):",
      "        dummy = ListNode(0)",
      "        cur = dummy",
      "        while l1 and l2:",
      "            if l1.val < l2.val:",
      "                cur.next = l1",
      "                l1 = l1.next",
      "            else:",
      "                cur.next = l2",
      "                l2 = l2.next",
      "            cur = cur.next",
      "        cur.next = l1 or l2",
      "        return dummy.next",
    ],
    codeLabel: { vi: "Cách 1: Min-Heap", en: "Approach 1: Min-Heap" },
    code2Label: { vi: "Cách 2: Divide & Conquer", en: "Approach 2: Divide & Conquer" },
    builder: buildSteps23,
  },
};
