// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * Generate steps for LeetCode 1967: Number of Strings That Appear as Substrings in Word.
 * Simple iteration: check if each pattern is a substring of word.
 */
function buildSteps1967(input, params) {
  const patterns = String(input).split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const word = String(params.word || "");
  const steps = [];

  let count = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: patterns.map(() => 0),
    sub: patterns,
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [
      { name: "word", value: word },
      { name: "patterns", value: `[${patterns.join(", ")}]` },
      { name: "count", value: 0 },
    ],
    note: {
      vi: `Kiểm tra từng pattern xem có phải substring của "${word}" không.`,
      en: `Check each pattern to see if it's a substring of "${word}".`,
    },
  });

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const found = word.includes(pattern);
    if (found) count++;

    steps.push({
      title: { vi: `"${pattern}" ${found ? "∈" : "∉"} "${word}"`, en: `"${pattern}" ${found ? "∈" : "∉"} "${word}"` },
      arr: patterns.map((_, idx) => {
        if (idx < i) return word.includes(patterns[idx]) ? 1 : 0;
        if (idx === i) return found ? 1 : 0;
        return 0;
      }),
      sub: patterns,
      highlight: [i],
      mark: found ? [i] : [],
      codeLines: [3, 4, 5],
      vars: [
        { name: "pattern", value: pattern },
        { name: "in word?", value: found },
        { name: "count", value: count },
      ],
      note: {
        vi: found
          ? `"${pattern}" là substring của "${word}" ✓ → count = ${count}`
          : `"${pattern}" KHÔNG phải substring của "${word}" ✗`,
        en: found
          ? `"${pattern}" is a substring of "${word}" ✓ → count = ${count}`
          : `"${pattern}" is NOT a substring of "${word}" ✗`,
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${count}`, en: `Result: ${count}` },
    arr: patterns.map((p) => (word.includes(p) ? 1 : 0)),
    sub: patterns,
    highlight: [],
    mark: patterns.map((p, idx) => (word.includes(p) ? idx : -1)).filter((x) => x >= 0),
    final: true,
    codeLines: [6],
    vars: [{ name: "count", value: count }],
    note: {
      vi: `${count} trong ${patterns.length} patterns là substring của "${word}".`,
      en: `${count} out of ${patterns.length} patterns are substrings of "${word}".`,
    },
  });

  return { patterns, word, answer: count, steps };
}

/**
 * LeetCode 1598: Crawler Log Folder.
 * Track the current folder depth while reading each operation.
 */
function parseLogs1598(input) {
  return Array.isArray(input)
    ? input.map((s) => String(s).trim()).filter(Boolean)
    : String(input).split(",").map((s) => s.trim()).filter(Boolean);
}

function buildSteps1598Depth(input) {
  const logs = parseLogs1598(input);
  const steps = [];
  const depths = new Array(logs.length).fill(0);
  const path = [];

  function pathLabel() {
    return path.length ? `/${path.join("/")}/` : "/";
  }

  function pushStep(opts) {
    steps.push({
      title: opts.title,
      arr: depths.slice(),
      sub: logs,
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeLines: [opts.codeLine],
      vars: [
        { name: "depth", value: path.length },
        { name: "path", value: pathLabel() },
        { name: "logs", value: `[${logs.join(", ")}]` },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize depth", en: "Initialize depth" },
    codeLine: 3,
    vars: [{ name: "path stack", value: "[]" }],
    note: {
      vi: "Start at the main folder. depth = 0 and path stack is empty.",
      en: "Start at the main folder. depth = 0 and path stack is empty.",
    },
  });

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    pushStep({
      title: { vi: `Read logs[${i}]`, en: `Read logs[${i}]` },
      codeLine: 4,
      current: i,
      highlight: [i],
      vars: [
        { name: "i", value: i },
        { name: "log", value: log },
      ],
      note: {
        vi: `Current operation is "${log}".`,
        en: `Current operation is "${log}".`,
      },
    });

    if (log === "../") {
      const before = pathLabel();
      if (path.length > 0) path.pop();
      depths[i] = path.length;
      pushStep({
        title: { vi: "Move to parent", en: "Move to parent" },
        codeLine: 6,
        highlight: [i],
        vars: [
          { name: "operation", value: "../" },
          { name: "before", value: before },
          { name: "after", value: pathLabel() },
        ],
        note: {
          vi: path.length === 0 && before === "/"
            ? "Already at the main folder, so '../' keeps depth at 0."
            : `Go up one level: ${before} -> ${pathLabel()}.`,
          en: path.length === 0 && before === "/"
            ? "Already at the main folder, so '../' keeps depth at 0."
            : `Go up one level: ${before} -> ${pathLabel()}.`,
        },
      });
    } else if (log === "./") {
      depths[i] = path.length;
      pushStep({
        title: { vi: "Stay in current folder", en: "Stay in current folder" },
        codeLine: 8,
        highlight: [i],
        vars: [{ name: "operation", value: "./" }],
        note: {
          vi: "'./' means stay in the same folder, so depth does not change.",
          en: "'./' means stay in the same folder, so depth does not change.",
        },
      });
    } else {
      const folder = log.endsWith("/") ? log.slice(0, -1) : log;
      path.push(folder);
      depths[i] = path.length;
      pushStep({
        title: { vi: `Enter ${folder}`, en: `Enter ${folder}` },
        codeLine: 10,
        highlight: [i],
        mark: [i],
        vars: [
          { name: "folder", value: folder },
          { name: "path stack", value: `[${path.join(", ")}]` },
        ],
        note: {
          vi: `Enter child folder "${folder}", so depth becomes ${path.length}.`,
          en: `Enter child folder "${folder}", so depth becomes ${path.length}.`,
        },
      });
    }

    for (let j = i + 1; j < depths.length; j++) depths[j] = path.length;
  }

  const answer = path.length;
  pushStep({
    title: { vi: `Result: ${answer}`, en: `Result: ${answer}` },
    codeLine: 11,
    mark: logs.map((_, idx) => idx),
    final: true,
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Minimum operations to return to the main folder equals current depth = ${answer}.`,
      en: `Minimum operations to return to the main folder equals current depth = ${answer}.`,
    },
  });

  return { logs, answer, steps };
}

function buildSteps1598Stack(input) {
  const logs = parseLogs1598(input);
  const steps = [];
  const depths = new Array(logs.length).fill(0);
  const stack = [];

  function pathLabel() {
    return stack.length ? `/${stack.join("/")}/` : "/";
  }

  function stackLabel() {
    return `[${stack.join(", ")}]`;
  }

  function pushStep(opts) {
    steps.push({
      title: opts.title,
      arr: depths.slice(),
      sub: logs,
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeLines: [opts.codeLine],
      codeBlock: 2,
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "depth", value: stack.length },
        { name: "path", value: pathLabel() },
        { name: "logs", value: `[${logs.join(", ")}]` },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize stack", en: "Initialize stack" },
    codeLine: 4,
    vars: [{ name: "stack", value: "[]" }],
    note: {
      vi: "Use stack to store the current path. Top of stack is the current folder.",
      en: "Use stack to store the current path. Top of stack is the current folder.",
    },
  });

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    pushStep({
      title: { vi: `Read logs[${i}]`, en: `Read logs[${i}]` },
      codeLine: 4,
      highlight: [i],
      vars: [
        { name: "i", value: i },
        { name: "log", value: log },
      ],
      note: {
        vi: `Current operation is "${log}".`,
        en: `Current operation is "${log}".`,
      },
    });

    if (log === "../") {
      pushStep({
        title: { vi: "Parent operation", en: "Parent operation" },
        codeLine: 5,
        highlight: [i],
        vars: [{ name: "operation", value: "../" }],
        note: {
          vi: "'../' means move to parent, so pop the nearest folder if possible.",
          en: "'../' means move to parent, so pop the nearest folder if possible.",
        },
      });

      const before = pathLabel();
      const popped = stack.length ? stack.pop() : null;
      depths[i] = stack.length;
      pushStep({
        title: { vi: popped ? `Pop ${popped}` : "Stack already empty", en: popped ? `Pop ${popped}` : "Stack already empty" },
        codeLine: 7,
        highlight: [i],
        vars: [
          { name: "popped", value: popped || "none" },
          { name: "before", value: before },
          { name: "after", value: pathLabel() },
        ],
        note: {
          vi: popped
            ? `Pop "${popped}" from stack: ${before} -> ${pathLabel()}.`
            : "Already at root, so stack stays empty.",
          en: popped
            ? `Pop "${popped}" from stack: ${before} -> ${pathLabel()}.`
            : "Already at root, so stack stays empty.",
        },
      });
    } else if (log === "./") {
      depths[i] = stack.length;
      pushStep({
        title: { vi: "Current folder operation", en: "Current folder operation" },
        codeLine: 8,
        highlight: [i],
        vars: [{ name: "operation", value: "./" }],
        note: {
          vi: "'./' does not change the stack.",
          en: "'./' does not change the stack.",
        },
      });
    } else {
      const folder = log.endsWith("/") ? log.slice(0, -1) : log;
      pushStep({
        title: { vi: `Child folder ${folder}`, en: `Child folder ${folder}` },
        codeLine: 10,
        highlight: [i],
        vars: [{ name: "folder", value: folder }],
        note: {
          vi: `Any other log enters a child folder, so push "${folder}".`,
          en: `Any other log enters a child folder, so push "${folder}".`,
        },
      });

      stack.push(folder);
      depths[i] = stack.length;
      pushStep({
        title: { vi: `Push ${folder}`, en: `Push ${folder}` },
        codeLine: 10,
        highlight: [i],
        mark: [i],
        vars: [
          { name: "folder", value: folder },
          { name: "stack", value: stackLabel() },
        ],
        note: {
          vi: `Stack now represents path ${pathLabel()}.`,
          en: `Stack now represents path ${pathLabel()}.`,
        },
      });
    }

    for (let j = i + 1; j < depths.length; j++) depths[j] = stack.length;
  }

  const answer = stack.length;
  pushStep({
    title: { vi: `Result: ${answer}`, en: `Result: ${answer}` },
    codeLine: 11,
    mark: logs.map((_, idx) => idx),
    final: true,
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Need one '../' for each folder left in stack, so answer = stack.length = ${answer}.`,
      en: `Need one '../' for each folder left in stack, so answer = stack.length = ${answer}.`,
    },
  });

  return { logs, answer, steps };
}

function buildSteps1598(input, params) {
  const approach = String(params && params.approach ? params.approach : "1");
  if (approach === "2") return buildSteps1598Stack(input);
  return buildSteps1598Depth(input);
}

/**
 * LeetCode 641: Design Circular Deque.
 * Simulate a fixed-size circular buffer with front pointer and size.
 */
function parseDequeOps641(input) {
  const raw = String(input || "").trim();
  const ops = [];
  const re = /([A-Za-z]+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = re.exec(raw))) {
    const name = match[1];
    const argText = match[2].trim();
    const args = argText.length ? argText.split(",").map((s) => Number(s.trim())) : [];
    ops.push({ name, args });
  }
  if (ops.length) return ops;
  return raw.split(",").map((part) => ({ name: part.trim(), args: [] })).filter((op) => op.name);
}

function buildSteps641(input) {
  const ops = parseDequeOps641(input);
  const first = ops[0] && ops[0].name === "MyCircularDeque" ? ops.shift() : { args: [3] };
  const k = Number.isInteger(first.args[0]) && first.args[0] > 0 ? first.args[0] : 3;
  const buffer = new Array(k).fill(null);
  const steps = [];
  let front = 0;
  let size = 0;
  let lastResult = null;

  function rearIndex() {
    return size === 0 ? -1 : (front + size - 1) % k;
  }

  function dequeValues() {
    return Array.from({ length: size }, (_, i) => buffer[(front + i) % k]);
  }

  function displayArray() {
    return buffer.map((v) => (v === null ? 0 : v));
  }

  function labels() {
    return buffer.map((_, idx) => {
      const marks = [];
      if (idx === front) marks.push("F");
      if (idx === rearIndex()) marks.push("R");
      return marks.length ? `${idx}:${marks.join("")}` : String(idx);
    });
  }

  function vars(extra = []) {
    return [
      { name: "deque", value: `[${dequeValues().join(", ")}]` },
      { name: "buffer", value: `[${buffer.map((v) => (v === null ? "_" : v)).join(", ")}]` },
      { name: "front", value: front },
      { name: "rear", value: rearIndex() },
      { name: "size", value: size },
      { name: "capacity", value: k },
      { name: "lastResult", value: lastResult === null ? "none" : lastResult },
      ...extra,
    ];
  }

  function pushStep(opts) {
    const mark = [];
    if (front >= 0 && size > 0) mark.push(front);
    const rear = rearIndex();
    if (rear >= 0 && !mark.includes(rear)) mark.push(rear);
    steps.push({
      title: opts.title,
      arr: displayArray(),
      sub: labels(),
      highlight: opts.highlight || [],
      mark: opts.mark || mark,
      codeLines: [opts.codeLine],
      vars: vars(opts.vars || []),
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: `Initialize deque k=${k}`, en: `Initialize deque k=${k}` },
    codeLine: 3,
    vars: [{ name: "operation", value: `MyCircularDeque(${k})` }],
    note: {
      vi: `Create a circular buffer with capacity ${k}. front = 0 and size = 0.`,
      en: `Create a circular buffer with capacity ${k}. front = 0 and size = 0.`,
    },
  });

  for (let stepIndex = 0; stepIndex < ops.length; stepIndex++) {
    const { name, args } = ops[stepIndex];
    const value = args[0];

    pushStep({
      title: { vi: `Call ${name}`, en: `Call ${name}` },
      codeLine: 4,
      vars: [
        { name: "step", value: stepIndex + 1 },
        { name: "operation", value: `${name}(${args.join(",")})` },
      ],
      note: {
        vi: `Process operation ${stepIndex + 1}: ${name}(${args.join(",")}).`,
        en: `Process operation ${stepIndex + 1}: ${name}(${args.join(",")}).`,
      },
    });

    if (name === "insertFront") {
      if (size === k) {
        lastResult = false;
        pushStep({
          title: { vi: "insertFront fails", en: "insertFront fails" },
          codeLine: 7,
          vars: [{ name: "value", value }],
          note: { vi: "Deque is full, so insertFront returns False.", en: "Deque is full, so insertFront returns False." },
        });
      } else {
        front = (front - 1 + k) % k;
        buffer[front] = value;
        size++;
        lastResult = true;
        pushStep({
          title: { vi: `insertFront(${value})`, en: `insertFront(${value})` },
          codeLine: 10,
          highlight: [front],
          vars: [{ name: "value", value }],
          note: {
            vi: `Move front backward circularly, place ${value}, then size becomes ${size}.`,
            en: `Move front backward circularly, place ${value}, then size becomes ${size}.`,
          },
        });
      }
    } else if (name === "insertLast") {
      if (size === k) {
        lastResult = false;
        pushStep({
          title: { vi: "insertLast fails", en: "insertLast fails" },
          codeLine: 13,
          vars: [{ name: "value", value }],
          note: { vi: "Deque is full, so insertLast returns False.", en: "Deque is full, so insertLast returns False." },
        });
      } else {
        const idx = (front + size) % k;
        buffer[idx] = value;
        size++;
        lastResult = true;
        pushStep({
          title: { vi: `insertLast(${value})`, en: `insertLast(${value})` },
          codeLine: 16,
          highlight: [idx],
          vars: [
            { name: "value", value },
            { name: "insert index", value: idx },
          ],
          note: {
            vi: `Insert at (front + size) % k = ${idx}, then size becomes ${size}.`,
            en: `Insert at (front + size) % k = ${idx}, then size becomes ${size}.`,
          },
        });
      }
    } else if (name === "deleteFront") {
      if (size === 0) {
        lastResult = false;
        pushStep({
          title: { vi: "deleteFront fails", en: "deleteFront fails" },
          codeLine: 19,
          note: { vi: "Deque is empty, so deleteFront returns False.", en: "Deque is empty, so deleteFront returns False." },
        });
      } else {
        const oldFront = front;
        const removed = buffer[oldFront];
        buffer[oldFront] = null;
        front = (front + 1) % k;
        size--;
        if (size === 0) front = 0;
        lastResult = true;
        pushStep({
          title: { vi: "deleteFront", en: "deleteFront" },
          codeLine: 22,
          highlight: [oldFront],
          vars: [{ name: "removed", value: removed }],
          note: {
            vi: `Remove front value ${removed} and advance front circularly.`,
            en: `Remove front value ${removed} and advance front circularly.`,
          },
        });
      }
    } else if (name === "deleteLast") {
      if (size === 0) {
        lastResult = false;
        pushStep({
          title: { vi: "deleteLast fails", en: "deleteLast fails" },
          codeLine: 25,
          note: { vi: "Deque is empty, so deleteLast returns False.", en: "Deque is empty, so deleteLast returns False." },
        });
      } else {
        const idx = rearIndex();
        const removed = buffer[idx];
        buffer[idx] = null;
        size--;
        if (size === 0) front = 0;
        lastResult = true;
        pushStep({
          title: { vi: "deleteLast", en: "deleteLast" },
          codeLine: 28,
          highlight: [idx],
          vars: [{ name: "removed", value: removed }],
          note: {
            vi: `Remove rear value ${removed} at index ${idx}.`,
            en: `Remove rear value ${removed} at index ${idx}.`,
          },
        });
      }
    } else if (name === "getFront") {
      lastResult = size === 0 ? -1 : buffer[front];
      pushStep({
        title: { vi: `getFront -> ${lastResult}`, en: `getFront -> ${lastResult}` },
        codeLine: 24,
        highlight: size === 0 ? [] : [front],
        note: {
          vi: size === 0 ? "Deque is empty, return -1." : `Front value is buffer[${front}] = ${lastResult}.`,
          en: size === 0 ? "Deque is empty, return -1." : `Front value is buffer[${front}] = ${lastResult}.`,
        },
      });
    } else if (name === "getRear") {
      const rear = rearIndex();
      lastResult = size === 0 ? -1 : buffer[rear];
      pushStep({
        title: { vi: `getRear -> ${lastResult}`, en: `getRear -> ${lastResult}` },
        codeLine: 26,
        highlight: rear >= 0 ? [rear] : [],
        note: {
          vi: size === 0 ? "Deque is empty, return -1." : `Rear value is buffer[${rear}] = ${lastResult}.`,
          en: size === 0 ? "Deque is empty, return -1." : `Rear value is buffer[${rear}] = ${lastResult}.`,
        },
      });
    } else if (name === "isEmpty") {
      lastResult = size === 0;
      pushStep({
        title: { vi: `isEmpty -> ${lastResult}`, en: `isEmpty -> ${lastResult}` },
        codeLine: 28,
        note: { vi: `size == 0 is ${lastResult}.`, en: `size == 0 is ${lastResult}.` },
      });
    } else if (name === "isFull") {
      lastResult = size === k;
      pushStep({
        title: { vi: `isFull -> ${lastResult}`, en: `isFull -> ${lastResult}` },
        codeLine: 30,
        note: { vi: `size == capacity is ${lastResult}.`, en: `size == capacity is ${lastResult}.` },
      });
    }
  }

  pushStep({
    title: { vi: "Finished operations", en: "Finished operations" },
    codeLine: 30,
    final: true,
    vars: [{ name: "answer", value: lastResult === null ? "None" : lastResult }],
    note: {
      vi: `All operations processed. Final deque = [${dequeValues().join(", ")}].`,
      en: `All operations processed. Final deque = [${dequeValues().join(", ")}].`,
    },
  });

  return { operations: ops, answer: lastResult, steps };
}

/**
 * LeetCode 1670: Design Front Middle Back Queue.
 * Visualize the standard two-half deque approach.
 */
function buildSteps1670(input) {
  const ops = parseDequeOps641(input);
  if (ops[0] && ops[0].name === "FrontMiddleBackQueue") ops.shift();

  const left = [];
  const right = [];
  const steps = [];
  let lastResult = null;

  function queueValues() {
    return left.concat(right);
  }

  function middleIndex() {
    const n = queueValues().length;
    return n === 0 ? -1 : Math.floor((n - 1) / 2);
  }

  function labels() {
    const q = queueValues();
    const mid = middleIndex();
    return q.map((_, idx) => {
      const marks = [];
      if (idx === 0) marks.push("F");
      if (idx === mid) marks.push("M");
      if (idx === q.length - 1) marks.push("B");
      return marks.length ? `${idx}:${marks.join("")}` : String(idx);
    });
  }

  function vars(extra = []) {
    return [
      { name: "queue", value: `[${queueValues().join(", ")}]` },
      { name: "left", value: `[${left.join(", ")}]` },
      { name: "right", value: `[${right.join(", ")}]` },
      { name: "middleIndex", value: middleIndex() },
      { name: "size", value: queueValues().length },
      { name: "lastResult", value: lastResult === null ? "none" : lastResult },
      ...extra,
    ];
  }

  function pushStep(opts) {
    const q = queueValues();
    const mid = middleIndex();
    const mark = [];
    if (q.length) {
      mark.push(0);
      if (!mark.includes(mid)) mark.push(mid);
      if (!mark.includes(q.length - 1)) mark.push(q.length - 1);
    }
    steps.push({
      title: opts.title,
      arr: q.length ? q : [0],
      sub: q.length ? labels() : ["empty"],
      highlight: opts.highlight || [],
      mark: opts.mark || mark,
      codeLines: [opts.codeLine],
      vars: vars(opts.vars || []),
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  function balance() {
    let moved = null;
    if (left.length < right.length) {
      moved = right.shift();
      left.push(moved);
    } else if (left.length > right.length + 1) {
      moved = left.pop();
      right.unshift(moved);
    }
    return moved;
  }

  pushStep({
    title: { vi: "Initialize queue", en: "Initialize queue" },
    codeLine: 3,
    vars: [{ name: "operation", value: "FrontMiddleBackQueue()" }],
    note: {
      vi: "Use two halves. left stores the front half and may have one extra item.",
      en: "Use two halves. left stores the front half and may have one extra item.",
    },
  });

  for (let stepIndex = 0; stepIndex < ops.length; stepIndex++) {
    const { name, args } = ops[stepIndex];
    const value = args[0];
    pushStep({
      title: { vi: `Call ${name}`, en: `Call ${name}` },
      codeLine: 4,
      vars: [
        { name: "step", value: stepIndex + 1 },
        { name: "operation", value: `${name}(${args.join(",")})` },
      ],
      note: {
        vi: `Process operation ${stepIndex + 1}: ${name}(${args.join(",")}).`,
        en: `Process operation ${stepIndex + 1}: ${name}(${args.join(",")}).`,
      },
    });

    if (name === "pushFront") {
      left.unshift(value);
      pushStep({
        title: { vi: `pushFront(${value})`, en: `pushFront(${value})` },
        codeLine: 7,
        highlight: [0],
        vars: [{ name: "value", value }],
        note: {
          vi: `Insert ${value} at the front of left.`,
          en: `Insert ${value} at the front of left.`,
        },
      });
      const moved = balance();
      pushStep({
        title: { vi: "Balance halves", en: "Balance halves" },
        codeLine: 8,
        vars: [{ name: "moved", value: moved === null ? "none" : moved }],
        note: {
          vi: "Keep left length equal to right length, or exactly one larger.",
          en: "Keep left length equal to right length, or exactly one larger.",
        },
      });
    } else if (name === "pushMiddle") {
      if (left.length > right.length) {
        const moved = left.pop();
        right.unshift(moved);
        pushStep({
          title: { vi: "Make room for middle", en: "Make room for middle" },
          codeLine: 11,
          vars: [{ name: "moved", value: moved }],
          note: {
            vi: `left had one extra item, so move ${moved} to the front of right first.`,
            en: `left had one extra item, so move ${moved} to the front of right first.`,
          },
        });
      }
      left.push(value);
      pushStep({
        title: { vi: `pushMiddle(${value})`, en: `pushMiddle(${value})` },
        codeLine: 12,
        highlight: [middleIndex()],
        vars: [{ name: "value", value }],
        note: {
          vi: `Place ${value} at the end of left, which is the middle position.`,
          en: `Place ${value} at the end of left, which is the middle position.`,
        },
      });
    } else if (name === "pushBack") {
      right.push(value);
      pushStep({
        title: { vi: `pushBack(${value})`, en: `pushBack(${value})` },
        codeLine: 15,
        highlight: [queueValues().length - 1],
        vars: [{ name: "value", value }],
        note: {
          vi: `Insert ${value} at the back of right.`,
          en: `Insert ${value} at the back of right.`,
        },
      });
      const moved = balance();
      pushStep({
        title: { vi: "Balance halves", en: "Balance halves" },
        codeLine: 16,
        vars: [{ name: "moved", value: moved === null ? "none" : moved }],
        note: {
          vi: "If right became larger, move its front into left.",
          en: "If right became larger, move its front into left.",
        },
      });
    } else if (name === "popFront") {
      if (!left.length && !right.length) {
        lastResult = -1;
        pushStep({
          title: { vi: "popFront -> -1", en: "popFront -> -1" },
          codeLine: 19,
          note: { vi: "Queue is empty.", en: "Queue is empty." },
        });
      } else {
        lastResult = left.length ? left.shift() : right.shift();
        pushStep({
          title: { vi: `popFront -> ${lastResult}`, en: `popFront -> ${lastResult}` },
          codeLine: 20,
          highlight: [0],
          vars: [{ name: "removed", value: lastResult }],
          note: { vi: "Remove the front item.", en: "Remove the front item." },
        });
        const moved = balance();
        pushStep({
          title: { vi: "Balance halves", en: "Balance halves" },
          codeLine: 21,
          vars: [{ name: "moved", value: moved === null ? "none" : moved }],
          note: { vi: "Restore the size invariant.", en: "Restore the size invariant." },
        });
      }
    } else if (name === "popMiddle") {
      if (!left.length && !right.length) {
        lastResult = -1;
        pushStep({
          title: { vi: "popMiddle -> -1", en: "popMiddle -> -1" },
          codeLine: 24,
          note: { vi: "Queue is empty.", en: "Queue is empty." },
        });
      } else {
        const idx = middleIndex();
        lastResult = left.pop();
        pushStep({
          title: { vi: `popMiddle -> ${lastResult}`, en: `popMiddle -> ${lastResult}` },
          codeLine: 25,
          highlight: [idx],
          vars: [{ name: "removed", value: lastResult }],
          note: {
            vi: "The front-most middle is always the last item of left.",
            en: "The front-most middle is always the last item of left.",
          },
        });
        const moved = balance();
        pushStep({
          title: { vi: "Balance halves", en: "Balance halves" },
          codeLine: 26,
          vars: [{ name: "moved", value: moved === null ? "none" : moved }],
          note: { vi: "Restore the size invariant.", en: "Restore the size invariant." },
        });
      }
    } else if (name === "popBack") {
      if (!left.length && !right.length) {
        lastResult = -1;
        pushStep({
          title: { vi: "popBack -> -1", en: "popBack -> -1" },
          codeLine: 29,
          note: { vi: "Queue is empty.", en: "Queue is empty." },
        });
      } else {
        const idx = queueValues().length - 1;
        lastResult = right.length ? right.pop() : left.pop();
        pushStep({
          title: { vi: `popBack -> ${lastResult}`, en: `popBack -> ${lastResult}` },
          codeLine: 30,
          highlight: [idx],
          vars: [{ name: "removed", value: lastResult }],
          note: { vi: "Remove the back item.", en: "Remove the back item." },
        });
        const moved = balance();
        pushStep({
          title: { vi: "Balance halves", en: "Balance halves" },
          codeLine: 31,
          vars: [{ name: "moved", value: moved === null ? "none" : moved }],
          note: { vi: "Restore the size invariant.", en: "Restore the size invariant." },
        });
      }
    }
  }

  pushStep({
    title: { vi: "Finished operations", en: "Finished operations" },
    codeLine: 31,
    final: true,
    vars: [{ name: "answer", value: lastResult === null ? "None" : lastResult }],
    note: {
      vi: `All operations processed. Final queue = [${queueValues().join(", ")}].`,
      en: `All operations processed. Final queue = [${queueValues().join(", ")}].`,
    },
  });

  return { operations: ops, answer: lastResult, steps };
}

/**
 * LeetCode 71: Simplify Path.
 * Keep canonical directory names on a stack while scanning path segments.
 */
function buildSteps71(input) {
  const path = String(input).trim();
  const parts = path.split("/");
  const displayParts = parts.map((part) => (part === "" ? '""' : part));
  const stack = [];
  const steps = [];
  let part;

  function canonicalPath() {
    return `/${stack.join("/")}`;
  }

  function stackLabel() {
    return `[${stack.map((name) => `'${name}'`).join(", ")}]`;
  }

  function partLabel() {
    return part === undefined ? "not in scope" : `'${part}'`;
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      stackView: {
        title: "Directory stack",
        emptyLabel: "root only",
        items: stack.slice(),
        input: displayParts,
        current,
        inputLabel: "path.split('/')",
        status: [
          { label: "part", value: partLabel() },
          { label: "canonical path", value: canonicalPath() },
        ],
      },
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "part", value: partLabel() },
        { name: "canonical path", value: `"${canonicalPath()}"` },
        { name: "path", value: `"${path}"` },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize stack", en: "Initialize stack" },
    codeLine: 3,
    note: {
      vi: "Stack rong dai dien cho thu muc goc '/'. Moi ten thu muc hop le se duoc push vao stack.",
      en: "An empty stack represents root '/'. Each valid directory name will be pushed onto the stack.",
    },
  });

  for (let i = 0; i < parts.length; i++) {
    part = parts[i];
    pushStep({
      title: { vi: `Read part ${displayParts[i]}`, en: `Read part ${displayParts[i]}` },
      codeLine: 4,
      current: i,
      vars: [
        { name: "i", value: i },
        { name: `path.split('/')[${i}]`, value: `'${part}'` },
      ],
      note: {
        vi: `Xu ly segment thu ${i}: ${part === "" ? "empty segment" : `'${part}'`}.`,
        en: `Process segment ${i}: ${part === "" ? "empty segment" : `'${part}'`}.`,
      },
    });

    if (part === "" || part === ".") {
      pushStep({
        title: { vi: part === "" ? "Skip empty part" : "Skip '.'", en: part === "" ? "Skip empty part" : "Skip '.'" },
        codeLine: 6,
        current: i,
        vars: [{ name: "action", value: "continue" }],
        note: {
          vi: part === ""
            ? "Dau '/' o dau, cuoi, hoac lap lai tao empty segment; bo qua no."
            : "'.' nghia la thu muc hien tai, nen stack khong thay doi.",
          en: part === ""
            ? "A leading, trailing, or repeated '/' creates an empty segment; ignore it."
            : "'.' means the current directory, so the stack does not change.",
        },
      });
      continue;
    }

    if (part === "..") {
      if (stack.length) {
        const before = canonicalPath();
        const removed = stack.pop();
        pushStep({
          title: { vi: `Pop '${removed}'`, en: `Pop '${removed}'` },
          codeLine: 9,
          current: i,
          vars: [
            { name: "removed", value: `'${removed}'` },
            { name: "before", value: `"${before}"` },
            { name: "after", value: `"${canonicalPath()}"` },
          ],
          note: {
            vi: `'..' quay ve thu muc cha, nen pop '${removed}' khoi stack.`,
            en: `'..' moves to the parent directory, so pop '${removed}' from the stack.`,
          },
        });
      } else {
        pushStep({
          title: { vi: "Stay at root", en: "Stay at root" },
          codeLine: 8,
          current: i,
          vars: [{ name: "stack empty", value: true }],
          note: {
            vi: "Da o root '/', nen '..' khong the di len them va stack van rong.",
            en: "Already at root '/', so '..' cannot move higher and the stack stays empty.",
          },
        });
      }
      continue;
    }

    stack.push(part);
    pushStep({
      title: { vi: `Push '${part}'`, en: `Push '${part}'` },
      codeLine: 11,
      current: i,
      vars: [
        { name: "directory", value: `'${part}'` },
        { name: "action", value: "stack.append(part)" },
      ],
      note: {
        vi: `'${part}' la ten thu muc hop le. Push vao stack de tao ${canonicalPath()}.`,
        en: `'${part}' is a valid directory name. Push it to form ${canonicalPath()}.`,
      },
    });
  }

  const answer = canonicalPath();
  pushStep({
    title: { vi: `Result: "${answer}"`, en: `Result: "${answer}"` },
    codeLine: 12,
    current: parts.length,
    vars: [{ name: "answer", value: `"${answer}"` }],
    note: {
      vi: `Noi cac thu muc trong stack bang '/', sau do them '/' o dau: "${answer}".`,
      en: `Join the stack with '/', then add the leading '/': "${answer}".`,
    },
    final: true,
  });

  return { path, parts, answer, steps };
}

/**
 * LeetCode 1963: Minimum Number of Swaps to Make the String Balanced.
 * Match closing brackets with a stack and count those that have no opener.
 */
function buildSteps1963(input) {
  const s = String(input).trim();
  const chars = s.split("");
  const stack = [];
  const steps = [];
  let unmatchedClose;
  let ch;

  function stackItems() {
    return stack.map((index) => ({ value: "[", detail: `index ${index}` }));
  }

  function stackLabel() {
    return `[${stack.join(", ")}]`;
  }

  function charLabel() {
    return ch === undefined ? "not in scope" : `'${ch}'`;
  }

  function unmatchedLabel() {
    return unmatchedClose === undefined ? "not in scope" : unmatchedClose;
  }

  function swapsLabel() {
    return unmatchedClose === undefined ? "not in scope" : Math.ceil(unmatchedClose / 2);
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      stackView: {
        title: "Unmatched '[' stack",
        emptyLabel: "no unmatched '['",
        items: stackItems(),
        input: chars,
        current,
        inputLabel: "Bracket string",
        status: [
          { label: "unmatched ']'", value: unmatchedLabel() },
          { label: "minimum swaps", value: swapsLabel() },
        ],
      },
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "ch", value: charLabel() },
        { name: "unmatched_close", value: unmatchedLabel() },
        { name: "(unmatched_close + 1) // 2", value: swapsLabel() },
        { name: "s", value: `"${s}"` },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize stack", en: "Initialize stack" },
    codeLine: 3,
    note: {
      vi: "Stack luu index cua cac '[' chua duoc ghep voi ']'.",
      en: "The stack stores indices of '[' brackets that have not been matched with ']'.",
    },
  });

  unmatchedClose = 0;
  pushStep({
    title: { vi: "Initialize unmatched_close", en: "Initialize unmatched_close" },
    codeLine: 4,
    note: {
      vi: "unmatched_close dem cac ']' xuat hien khi stack dang rong.",
      en: "unmatched_close counts ']' brackets encountered while the stack is empty.",
    },
  });

  for (let i = 0; i < chars.length; i++) {
    ch = chars[i];
    pushStep({
      title: { vi: `Read '${ch}'`, en: `Read '${ch}'` },
      codeLine: 5,
      current: i,
      vars: [
        { name: "i", value: i },
        { name: `s[${i}]`, value: `'${ch}'` },
      ],
      note: {
        vi: `Xu ly s[${i}] = '${ch}'.`,
        en: `Process s[${i}] = '${ch}'.`,
      },
    });

    if (ch === "[") {
      stack.push(i);
      pushStep({
        title: { vi: `Push '[' at ${i}`, en: `Push '[' at ${i}` },
        codeLine: 7,
        current: i,
        vars: [
          { name: "pushed index", value: i },
          { name: "action", value: "stack.append(i)" },
        ],
        note: {
          vi: "Day la ngoac mo. Push index vao stack de cho mot ']' o phia sau ghep cap.",
          en: "This is an opening bracket. Push its index so a later ']' can match it.",
        },
      });
      continue;
    }

    if (stack.length) {
      const openIndex = stack.pop();
      pushStep({
        title: {
          vi: `Match '[' at ${openIndex} with ']' at ${i}`,
          en: `Match '[' at ${openIndex} with ']' at ${i}`,
        },
        codeLine: 9,
        current: i,
        vars: [
          { name: "open index", value: openIndex },
          { name: "close index", value: i },
          { name: "action", value: "stack.pop()" },
        ],
        note: {
          vi: `Ghep '[' tai index ${openIndex} voi ']' tai index ${i}, roi pop ngoac mo khoi stack.`,
          en: `Match '[' at index ${openIndex} with ']' at index ${i}, then pop the opener from the stack.`,
        },
      });
      continue;
    }

    unmatchedClose += 1;
    pushStep({
      title: { vi: `Unmatched ']' at ${i}`, en: `Unmatched ']' at ${i}` },
      codeLine: 11,
      current: i,
      vars: [
        { name: "unmatched index", value: i },
        { name: "action", value: "unmatched_close += 1" },
      ],
      note: {
        vi: `Stack rong, nen ']' tai index ${i} chua co '[' phia truoc de ghep.`,
        en: `The stack is empty, so ']' at index ${i} has no earlier '[' to match.`,
      },
    });
  }

  const answer = Math.ceil(unmatchedClose / 2);
  pushStep({
    title: { vi: `Result: ${answer} swap${answer === 1 ? "" : "s"}`, en: `Result: ${answer} swap${answer === 1 ? "" : "s"}` },
    codeLine: 12,
    current: chars.length,
    vars: [{ name: "answer", value: `(${unmatchedClose} + 1) // 2 = ${answer}` }],
    note: {
      vi: `Mot swap co the sua toi da hai dau ']' khong ghep cap, nen answer = (${unmatchedClose} + 1) // 2 = ${answer}.`,
      en: `One swap can fix up to two unmatched ']' brackets, so answer = (${unmatchedClose} + 1) // 2 = ${answer}.`,
    },
    final: true,
  });

  return { s, answer, steps };
}

/**
 * LeetCode 394: Decode String.
 * Save the prefix and repeat count for each nested group on a stack.
 */
function buildSteps394(input) {
  const s = String(input).trim();
  const chars = s.split("");
  const stack = [];
  const steps = [];
  let current;
  let number;

  function frameItems() {
    return stack.map((frame) => ({
      value: `${frame.repeat}x`,
      detail: `prefix = "${frame.prefix}"`,
    }));
  }

  function stackLabel() {
    return stack.length
      ? `[${stack.map((frame) => `("${frame.prefix}", ${frame.repeat})`).join(", ")}]`
      : "[]";
  }

  function currentLabel() {
    return current === undefined ? "not in scope" : `"${current}"`;
  }

  function numberLabel() {
    return number === undefined ? "not in scope" : number;
  }

  function pushStep(opts) {
    const index = Number.isInteger(opts.current) ? opts.current : -1;
    const explicitVars = opts.vars || [];
    const charVar =
      index >= 0 && index < chars.length && !explicitVars.some((item) => item.name === "ch")
        ? [{ name: "ch", value: `'${chars[index]}'` }]
        : [];

    steps.push({
      title: opts.title,
      codeLines: opts.codeLines,
      stackView: {
        title: "Saved frames",
        emptyLabel: "no saved frames",
        items: frameItems(),
        input: chars,
        current: index,
        inputLabel: "Encoded string",
        status: [
          { label: "current", value: currentLabel() },
          { label: "number", value: numberLabel() },
        ],
      },
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "current", value: currentLabel() },
        { name: "number", value: numberLabel() },
        ...charVar,
        ...explicitVars,
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize stack", en: "Initialize stack" },
    codeLines: [3],
    vars: [{ name: "s", value: `"${s}"` }],
    note: {
      vi: "The stack will save the outer prefix and repeat count for each nested group.",
      en: "The stack will save the outer prefix and repeat count for each nested group.",
    },
  });

  current = "";
  pushStep({
    title: { vi: "Initialize current", en: "Initialize current" },
    codeLines: [4],
    note: {
      vi: "current builds the decoded text at the active nesting level.",
      en: "current builds the decoded text at the active nesting level.",
    },
  });

  number = 0;
  pushStep({
    title: { vi: "Initialize number", en: "Initialize number" },
    codeLines: [5],
    note: {
      vi: "number accumulates the repeat count before the next '['.",
      en: "number accumulates the repeat count before the next '['.",
    },
  });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    pushStep({
      title: { vi: `Read '${ch}'`, en: `Read '${ch}'` },
      codeLines: [6],
      current: i,
      vars: [{ name: "i", value: i }],
      note: {
        vi: `Process s[${i}] = '${ch}'.`,
        en: `Process s[${i}] = '${ch}'.`,
      },
    });

    if (/\d/.test(ch)) {
      const previousNumber = number;
      number = number * 10 + Number(ch);
      pushStep({
        title: { vi: `Build number: ${number}`, en: `Build number: ${number}` },
        codeLines: [8],
        current: i,
        vars: [
          { name: "digit", value: Number(ch) },
          { name: "calculation", value: `${previousNumber} * 10 + ${ch} = ${number}` },
        ],
        note: {
          vi: `Append digit ${ch} to the repeat count. This also supports multi-digit counts such as 12.`,
          en: `Append digit ${ch} to the repeat count. This also supports multi-digit counts such as 12.`,
        },
      });
      continue;
    }

    if (ch === "[") {
      const savedPrefix = current;
      const savedRepeat = number;
      stack.push({ prefix: savedPrefix, repeat: savedRepeat });
      pushStep({
        title: { vi: `Save frame ${savedRepeat}x`, en: `Save frame ${savedRepeat}x` },
        codeLines: [10],
        current: i,
        vars: [
          { name: "saved prefix", value: `"${savedPrefix}"` },
          { name: "saved repeat", value: savedRepeat },
          { name: "action", value: "stack.append((current, number))" },
        ],
        note: {
          vi: `Push (prefix = "${savedPrefix}", repeat = ${savedRepeat}) so the outer state can be restored at ']'.`,
          en: `Push (prefix = "${savedPrefix}", repeat = ${savedRepeat}) so the outer state can be restored at ']'.`,
        },
      });

      current = "";
      pushStep({
        title: { vi: "Reset current", en: "Reset current" },
        codeLines: [11],
        current: i,
        vars: [{ name: "action", value: "current = ''" }],
        note: {
          vi: "Start building the text inside this new bracket group.",
          en: "Start building the text inside this new bracket group.",
        },
      });

      number = 0;
      pushStep({
        title: { vi: "Reset number", en: "Reset number" },
        codeLines: [12],
        current: i,
        vars: [{ name: "action", value: "number = 0" }],
        note: {
          vi: "The repeat count is saved in the frame, so reset number for the next group.",
          en: "The repeat count is saved in the frame, so reset number for the next group.",
        },
      });
      continue;
    }

    if (ch === "]") {
      const frame = stack.pop();
      const nested = current;
      pushStep({
        title: { vi: `Pop frame ${frame.repeat}x`, en: `Pop frame ${frame.repeat}x` },
        codeLines: [14],
        current: i,
        vars: [
          { name: "previous", value: `"${frame.prefix}"` },
          { name: "repeat", value: frame.repeat },
          { name: "nested", value: `"${nested}"` },
        ],
        note: {
          vi: `The group "${nested}" is complete. Restore its saved prefix and repeat count.`,
          en: `The group "${nested}" is complete. Restore its saved prefix and repeat count.`,
        },
      });

      current = frame.prefix + nested.repeat(frame.repeat);
      pushStep({
        title: { vi: `Expand to "${current}"`, en: `Expand to "${current}"` },
        codeLines: [15],
        current: i,
        vars: [
          { name: "previous", value: `"${frame.prefix}"` },
          { name: "repeat * nested", value: `${frame.repeat} * "${nested}"` },
          { name: "current", value: `"${current}"` },
        ],
        note: {
          vi: `current = "${frame.prefix}" + ${frame.repeat} * "${nested}" = "${current}".`,
          en: `current = "${frame.prefix}" + ${frame.repeat} * "${nested}" = "${current}".`,
        },
      });
      continue;
    }

    current += ch;
    pushStep({
      title: { vi: `Append '${ch}'`, en: `Append '${ch}'` },
      codeLines: [17],
      current: i,
      vars: [{ name: "action", value: `current += '${ch}'` }],
      note: {
        vi: `'${ch}' is a letter, so append it to the current nesting level.`,
        en: `'${ch}' is a letter, so append it to the current nesting level.`,
      },
    });
  }

  pushStep({
    title: { vi: `Result: "${current}"`, en: `Result: "${current}"` },
    codeLines: [18],
    current: chars.length,
    vars: [{ name: "answer", value: `"${current}"` }],
    note: {
      vi: `All groups are expanded, so the decoded string is "${current}".`,
      en: `All groups are expanded, so the decoded string is "${current}".`,
    },
    final: true,
  });

  return { s, answer: current, steps };
}

/**
 * LeetCode 150: Evaluate Reverse Polish Notation.
 * Use a stack: push numbers, pop two operands when an operator appears.
 */
function buildSteps150(input) {
  const tokens = Array.isArray(input)
    ? input.map((item) => String(item).trim()).filter((item) => item.length > 0)
    : String(input)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter((item) => item.length > 0);
  const stack = [];
  const steps = [];
  const operators = new Set(["+", "-", "*", "/"]);

  function stackLabel() {
    return `[${stack.join(", ")}]`;
  }

  function tokenValues() {
    return tokens.map((token) => (/^-?\d+$/.test(token) ? Number(token) : 0));
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    const explicitVars = opts.vars || [];
    const tokenVar =
      current >= 0 && current < tokens.length && !explicitVars.some((item) => item.name === "token")
        ? [{ name: "token", value: tokens[current] }]
        : [];

    steps.push({
      title: opts.title,
      arr: tokenValues(),
      sub: tokens,
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeLines: [opts.codeLine],
      stackView: {
        items: stack.slice(),
        input: tokens,
        current,
        expected: "",
      },
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "top", value: stack.length ? stack[stack.length - 1] : "empty" },
        ...tokenVar,
        ...explicitVars,
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  function applyOperator(a, b, op) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "*") return a * b;
    return Math.trunc(a / b);
  }

  function operatorLine(op) {
    if (op === "+") return 10;
    if (op === "-") return 11;
    if (op === "*") return 12;
    return 13;
  }

  pushStep({
    title: { vi: "Initialize stack", en: "Initialize stack" },
    codeLine: 3,
    vars: [{ name: "tokens.length", value: tokens.length }],
    note: {
      vi: "Read tokens left to right. Numbers are pushed; operators consume the top two stack values.",
      en: "Read tokens left to right. Numbers are pushed; operators consume the top two stack values.",
    },
  });

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    pushStep({
      title: { vi: `Read '${token}'`, en: `Read '${token}'` },
      codeLine: 4,
      current: i,
      highlight: [i],
      vars: [{ name: "i", value: i }],
      note: {
        vi: `Process tokens[${i}] = '${token}'.`,
        en: `Process tokens[${i}] = '${token}'.`,
      },
    });

    if (!operators.has(token)) {
      const value = Number(token);
      stack.push(value);
      pushStep({
        title: { vi: `Push ${value}`, en: `Push ${value}` },
        codeLine: 6,
        current: i,
        highlight: [i],
        mark: [i],
        vars: [
          { name: "value", value },
          { name: "action", value: "push number" },
        ],
        note: {
          vi: `'${token}' is a number, so push ${value} onto the operand stack.`,
          en: `'${token}' is a number, so push ${value} onto the operand stack.`,
        },
      });
      continue;
    }

    const b = stack.pop();
    const a = stack.pop();
    pushStep({
      title: { vi: `Pop ${a}, ${b}`, en: `Pop ${a}, ${b}` },
      codeLine: 8,
      current: i,
      operator: token,
      highlight: [i],
      vars: [
        { name: "a", value: a },
        { name: "b", value: b },
        { name: "operator", value: token },
      ],
      note: {
        vi: `Pop b = ${b} first, then a = ${a}. The order matters for '-' and '/'.`,
        en: `Pop b = ${b} first, then a = ${a}. The order matters for '-' and '/'.`,
      },
    });

    const value = applyOperator(a, b, token);
    stack.push(value);
    pushStep({
      title: { vi: `${a} ${token} ${b} = ${value}`, en: `${a} ${token} ${b} = ${value}` },
      codeLine: operatorLine(token),
      current: i,
      operator: token,
      highlight: [i],
      mark: [i],
      vars: [
        { name: "a", value: a },
        { name: "b", value: b },
        { name: "operator", value: token },
        { name: "value", value },
      ],
      note: {
        vi: `Compute ${a} ${token} ${b}, then push ${value} back onto the stack.`,
        en: `Compute ${a} ${token} ${b}, then push ${value} back onto the stack.`,
      },
    });
  }

  const answer = stack[stack.length - 1];
  pushStep({
    title: { vi: `Result: ${answer}`, en: `Result: ${answer}` },
    codeLine: 14,
    mark: tokens.map((_, i) => i),
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `After all tokens, the only remaining stack value is ${answer}.`,
      en: `After all tokens, the only remaining stack value is ${answer}.`,
    },
    final: true,
  });

  return { tokens, answer, steps };
}

/**
 * LeetCode 20: Valid Parentheses.
 * Use a stack of opening brackets and match every closing bracket with the top.
 */
function buildSteps20(input) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const chars = s.split("");
  const stack = [];
  const steps = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const opens = new Set(["(", "[", "{"]);

  function stackLabel() {
    return `[${stack.join(", ")}]`;
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    const explicitVars = opts.vars || [];
    const hasCurrentChar = current >= 0 && current < chars.length;
    const currentCharVar =
      hasCurrentChar && !explicitVars.some((item) => item.name === "ch")
        ? [{ name: "ch", value: chars[current] }]
        : [];

    steps.push({
      title: opts.title,
      arr: chars.map((ch) => (opens.has(ch) ? 1 : -1)),
      sub: chars,
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeLines: [opts.codeLine],
      stackView: {
        items: stack.slice(),
        input: chars,
        current,
        expected: opts.expected || "",
      },
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "top", value: stack.length ? stack[stack.length - 1] : "empty" },
        { name: "s", value: `"${s}"` },
        ...currentCharVar,
        ...explicitVars,
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize stack", en: "Initialize stack" },
    codeLine: 3,
    vars: [{ name: "n", value: chars.length }],
    note: {
      vi: "Scan left to right. Opening brackets go onto the stack; closing brackets must match the stack top.",
      en: "Scan left to right. Opening brackets go onto the stack; closing brackets must match the stack top.",
    },
  });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    pushStep({
      title: { vi: `Read '${ch}'`, en: `Read '${ch}'` },
      codeLine: 5,
      current: i,
      highlight: [i],
      vars: [
        { name: "i", value: i },
        { name: "ch", value: ch },
      ],
      note: {
        vi: `Process s[${i}] = '${ch}'.`,
        en: `Process s[${i}] = '${ch}'.`,
      },
    });

    if (opens.has(ch)) {
      stack.push(ch);
      pushStep({
        title: { vi: `Push '${ch}'`, en: `Push '${ch}'` },
        codeLine: 7,
        current: i,
        highlight: [i],
        mark: [i],
        vars: [{ name: "action", value: "push" }],
        note: {
          vi: `'${ch}' is an opening bracket, so push it onto the stack.`,
          en: `'${ch}' is an opening bracket, so push it onto the stack.`,
        },
      });
      continue;
    }

    const expected = pairs[ch];
    const top = stack.length ? stack[stack.length - 1] : null;
    pushStep({
      title: { vi: `Need '${expected}'`, en: `Need '${expected}'` },
      codeLine: 12,
      current: i,
      expected,
      highlight: [i],
      vars: [
        { name: "closing", value: ch },
        { name: "pairs[ch]", value: expected },
        { name: "expected top", value: expected },
        { name: "actual top", value: top || "empty" },
      ],
      note: {
        vi: `To match '${ch}', the stack top must be '${expected}'.`,
        en: `To match '${ch}', the stack top must be '${expected}'.`,
      },
    });

    if (!top || top !== expected) {
      pushStep({
        title: { vi: "Mismatch -> False", en: "Mismatch -> False" },
        codeLine: !top ? 9 : 12,
        current: i,
        expected,
        highlight: [i],
        vars: [
          { name: "pairs[ch]", value: expected },
          { name: "answer", value: false },
        ],
        note: {
          vi: !top
            ? `Stack is empty, so '${ch}' has no matching opener.`
            : `Top '${top}' does not match '${ch}'.`,
          en: !top
            ? `Stack is empty, so '${ch}' has no matching opener.`
            : `Top '${top}' does not match '${ch}'.`,
        },
        final: true,
      });
      return { s, answer: false, steps };
    }

    stack.pop();
    pushStep({
      title: { vi: `Pop '${expected}'`, en: `Pop '${expected}'` },
      codeLine: 15,
      current: i,
      expected,
      highlight: [i],
      mark: [i],
      vars: [
        { name: "pairs[ch]", value: expected },
        { name: "action", value: "pop" },
      ],
      note: {
        vi: `Matched '${expected}${ch}', so pop '${expected}' from the stack.`,
        en: `Matched '${expected}${ch}', so pop '${expected}' from the stack.`,
      },
    });
  }

  const answer = stack.length === 0;
  pushStep({
    title: { vi: `Result: ${answer}`, en: `Result: ${answer}` },
    codeLine: 17,
    mark: answer ? chars.map((_, i) => i) : [],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: answer
        ? "Every closing bracket matched and the stack is empty."
        : `Input ended but stack still contains ${stackLabel()}.`,
      en: answer
        ? "Every closing bracket matched and the stack is empty."
        : `Input ended but stack still contains ${stackLabel()}.`,
    },
    final: true,
  });

  return { s, answer, steps };
}

module.exports = {
  20: {
    id: 20,
    difficulty: "easy",
    slug: "valid-parentheses",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Valid Parentheses", en: "Valid Parentheses" },
    titleVi: { vi: "Kiểm tra ngoặc hợp lệ", en: "Check if brackets are valid" },
    statement: {
      vi: "Cho chuỗi chỉ gồm '(', ')', '[', ']', '{', '}'. Kiểm tra các ngoặc có đóng/mở đúng thứ tự hay không.",
      en: "Given a string containing only '(', ')', '[', ']', '{', '}', determine whether the brackets are closed in the correct order.",
    },
    defaultInput: "()[]{}",
    inputKind: "string",
    inputLabel: { vi: "String s", en: "String s" },
    extraParams: [],
    approach: [
      { vi: "Duyệt từng ký tự từ trái sang phải.", en: "Scan each character from left to right." },
      { vi: "Nếu là ngoặc mở, push vào stack.", en: "If it is an opening bracket, push it onto the stack." },
      { vi: "Nếu là ngoặc đóng, stack top phải là ngoặc mở tương ứng; nếu không thì false.", en: "If it is a closing bracket, the stack top must be the matching opener; otherwise return false." },
      { vi: "Cuối cùng stack phải rỗng.", en: "At the end, the stack must be empty." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyệt mỗi ký tự một lần. Stack tệ nhất chứa toàn bộ các ngoặc mở.",
        en: "Each character is processed once. In the worst case, the stack stores all opening brackets.",
      },
    },
    code: [
      "class Solution:",
      "    def isValid(self, s: str) -> bool:",
      "        stack = []",
      "        pairs = {')': '(', ']': '[', '}': '{'}",
      "        for ch in s:",
      "            if ch in '([{':",
      "                stack.append(ch)",
      "            else:",
      "                if not stack:",
      "                    return False",
      "",
      "                if stack[-1] != pairs[ch]:",
      "                    return False",
      "",
      "                stack.pop()",
      "",
      "        return not stack",
    ],
    builder: buildSteps20,
  },
  71: {
    id: 71,
    difficulty: "medium",
    slug: "simplify-path",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Simplify Path", en: "Simplify Path" },
    titleVi: { vi: "Rut gon duong dan Unix", en: "Simplify a Unix path" },
    statement: {
      vi: "Cho mot absolute path Unix. Chuyen path ve dang canonical: mot dau '/' giua cac thu muc, bo qua '.', va '..' quay ve thu muc cha neu co the.",
      en: "Given an absolute Unix path, convert it to its canonical form: one '/' between directories, ignore '.', and let '..' move to the parent when possible.",
    },
    defaultInput: "/a/./b/../../c/",
    inputKind: "string",
    inputLabel: { vi: "Unix path", en: "Unix path" },
    extraParams: [],
    approach: [
      { vi: "Tach path theo dau '/' va duyet tung segment.", en: "Split the path by '/' and scan every segment." },
      { vi: "Bo qua empty segment va '.'.", en: "Ignore empty segments and '.'." },
      { vi: "Voi '..', pop thu muc gan nhat neu stack khong rong.", en: "For '..', pop the nearest directory when the stack is not empty." },
      { vi: "Push ten thu muc binh thuong, roi join stack de tao canonical path.", en: "Push normal directory names, then join the stack to build the canonical path." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Moi ky tu va segment duoc xu ly mot lan. Stack luu toi da tat ca ten thu muc trong path.",
        en: "Each character and segment is processed once. The stack may store every directory name in the path.",
      },
    },
    code: [
      "class Solution:",
      "    def simplifyPath(self, path: str) -> str:",
      "        stack = []",
      "        for part in path.split('/'):",
      "            if part == '' or part == '.':",
      "                continue",
      "            if part == '..':",
      "                if stack:",
      "                    stack.pop()",
      "            else:",
      "                stack.append(part)",
      "        return '/' + '/'.join(stack)",
    ],
    builder: buildSteps71,
  },
  150: {
    id: 150,
    difficulty: "medium",
    slug: "evaluate-reverse-polish-notation",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Evaluate Reverse Polish Notation", en: "Evaluate Reverse Polish Notation" },
    titleVi: { vi: "Tinh gia tri bieu thuc hau to", en: "Evaluate postfix expression" },
    statement: {
      vi: "Cho mang tokens bieu dien bieu thuc Reverse Polish Notation. Tinh gia tri bieu thuc, trong do phep chia lay phan nguyen cat ve 0.",
      en: "Given tokens representing a Reverse Polish Notation expression. Evaluate it, with division truncating toward zero.",
    },
    defaultInput: ["2", "1", "+", "3", "*"],
    inputKind: "stringArray",
    inputLabel: { vi: "tokens (JSON hoac comma-separated)", en: "tokens (JSON or comma-separated)" },
    extraParams: [],
    approach: [
      { vi: "Duyet token tu trai sang phai.", en: "Scan tokens from left to right." },
      { vi: "Neu token la so, push vao stack.", en: "If the token is a number, push it onto the stack." },
      { vi: "Neu token la operator, pop b truoc, pop a sau, tinh a op b.", en: "If the token is an operator, pop b first, then a, and compute a op b." },
      { vi: "Push ket qua lai vao stack. Sau cung stack con mot gia tri la dap an.", en: "Push the result back. At the end, the only stack value is the answer." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Moi token duoc xu ly mot lan. Stack co the chua toi da O(n) so.",
        en: "Each token is processed once. The stack can store up to O(n) numbers.",
      },
    },
    code: [
      "class Solution:",
      "    def evalRPN(self, tokens):",
      "        stack = []",
      "        for token in tokens:",
      "            if token not in '+-*/':",
      "                stack.append(int(token))",
      "            else:",
      "                b = stack.pop()",
      "                a = stack.pop()",
      "                if token == '+': stack.append(a + b)",
      "                elif token == '-': stack.append(a - b)",
      "                elif token == '*': stack.append(a * b)",
      "                else: stack.append(int(a / b))",
      "        return stack[-1]",
    ],
    builder: buildSteps150,
  },
  394: {
    id: 394,
    difficulty: "medium",
    slug: "decode-string",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Decode String", en: "Decode String" },
    titleVi: { vi: "Giai ma chuoi long nhau", en: "Decode a nested string" },
    statement: {
      vi: "Cho chuoi da ma hoa theo dang k[encoded_string]. Giai ma chuoi, trong do encoded_string duoc lap lai dung k lan va cac nhom co the long nhau.",
      en: "Given a string encoded as k[encoded_string], decode it by repeating each bracketed string k times. Groups may be nested.",
    },
    defaultInput: "3[a2[c]]",
    inputKind: "string",
    inputLabel: { vi: "Encoded string s", en: "Encoded string s" },
    extraParams: [],
    approach: [
      { vi: "Duyet tung ky tu va ghep cac chu so vao bien number.", en: "Scan each character and accumulate digits in number." },
      { vi: "Khi gap '[', push (current, number) vao stack, sau do reset current va number.", en: "At '[', push (current, number) onto the stack, then reset both values." },
      { vi: "Khi gap ']', pop frame va ghep previous + repeat * current.", en: "At ']', pop one frame and combine previous + repeat * current." },
      { vi: "Chu cai duoc noi truc tiep vao current.", en: "Append letters directly to current." },
    ],
    complexity: {
      time: "O(n + output)",
      space: "O(n + output)",
      note: {
        vi: "Moi ky tu ma hoa duoc doc mot lan; viec tao chuoi ty le voi do dai ket qua. Stack luu cac nhom long nhau.",
        en: "Each encoded character is read once; string construction is proportional to the decoded output. The stack stores nested groups.",
      },
    },
    code: [
      "class Solution:",
      "    def decodeString(self, s: str) -> str:",
      "        stack = []",
      "        current = ''",
      "        number = 0",
      "        for ch in s:",
      "            if ch.isdigit():",
      "                number = number * 10 + int(ch)",
      "            elif ch == '[':",
      "                stack.append((current, number))",
      "                current = ''",
      "                number = 0",
      "            elif ch == ']':",
      "                previous, repeat = stack.pop()",
      "                current = previous + repeat * current",
      "            else:",
      "                current += ch",
      "        return current",
    ],
    builder: buildSteps394,
  },
  1670: {
    id: 1670,
    difficulty: "medium",
    slug: "design-front-middle-back-queue",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Design Front Middle Back Queue", en: "Design Front Middle Back Queue" },
    titleVi: { vi: "Thiết kế hàng đợi Front-Middle-Back", en: "Design a front-middle-back queue" },
    statement: {
      vi: "Thiết kế queue hỗ trợ pushFront, pushMiddle, pushBack và popFront, popMiddle, popBack. popMiddle lấy phần tử middle phía trước nếu có hai middle.",
      en: "Design a queue that supports pushFront, pushMiddle, pushBack and popFront, popMiddle, popBack. popMiddle removes the front-most middle when there are two middles.",
    },
    defaultInput: "FrontMiddleBackQueue(), pushFront(1), pushBack(2), pushMiddle(3), pushMiddle(4), popFront(), popMiddle(), popMiddle(), popBack(), popFront()",
    inputKind: "string",
    inputLabel: { vi: "operations", en: "operations" },
    extraParams: [],
    approach: [
      { vi: "Giữ hai nửa left/right. left là nửa trước và có thể nhiều hơn right đúng 1 phần tử.", en: "Keep two halves: left and right. left is the front half and may contain exactly one extra item." },
      { vi: "Middle front-most chính là phần tử cuối của left.", en: "The front-most middle is the last item of left." },
      { vi: "Sau mỗi push/pop, cân bằng lại để left.length == right.length hoặc left.length == right.length + 1.", en: "After each push/pop, rebalance so left.length == right.length or left.length == right.length + 1." },
    ],
    complexity: {
      time: "O(1)",
      space: "O(n)",
      note: {
        vi: "Với deque thật, mỗi thao tác push/pop ở hai đầu là O(1). Bộ nhớ lưu n phần tử.",
        en: "With real deques, each end operation is O(1). Memory stores n elements.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class FrontMiddleBackQueue:",
      "    def __init__(self):",
      "        self.left = deque()",
      "        self.right = deque()",
      "    def _balance(self):",
      "        if len(self.left) < len(self.right):",
      "            self.left.append(self.right.popleft())",
      "        if len(self.left) > len(self.right) + 1:",
      "            self.right.appendleft(self.left.pop())",
      "    def pushFront(self, val: int) -> None:",
      "        self.left.appendleft(val)",
      "        self._balance()",
      "    def pushMiddle(self, val: int) -> None:",
      "        if len(self.left) > len(self.right):",
      "            self.right.appendleft(self.left.pop())",
      "        self.left.append(val)",
      "    def pushBack(self, val: int) -> None:",
      "        self.right.append(val)",
      "        self._balance()",
      "    def popFront(self) -> int:",
      "        if not self.left and not self.right: return -1",
      "        ans = self.left.popleft() if self.left else self.right.popleft()",
      "        self._balance(); return ans",
      "    def popMiddle(self) -> int:",
      "        if not self.left and not self.right: return -1",
      "        ans = self.left.pop()",
      "        self._balance(); return ans",
      "    def popBack(self) -> int:",
      "        if not self.left and not self.right: return -1",
      "        ans = self.right.pop() if self.right else self.left.pop()",
      "        self._balance(); return ans",
    ],
    builder: buildSteps1670,
  },
  641: {
    id: 641,
    difficulty: "medium",
    slug: "design-circular-deque",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Design Circular Deque", en: "Design Circular Deque" },
    titleVi: { vi: "Thiết kế deque vòng", en: "Design a fixed-size circular deque" },
    statement: {
      vi: "Thiết kế deque vòng kích thước k hỗ trợ insert/delete ở cả hai đầu, getFront/getRear, isEmpty và isFull.",
      en: "Design a fixed-size circular deque that supports insert/delete at both ends, getFront/getRear, isEmpty, and isFull.",
    },
    defaultInput: "MyCircularDeque(3), insertLast(1), insertLast(2), insertFront(3), insertFront(4), getRear(), isFull(), deleteLast(), insertFront(4), getFront()",
    inputKind: "string",
    inputLabel: { vi: "operations", en: "operations" },
    extraParams: [],
    approach: [
      { vi: "Dùng mảng cố định kích thước k làm circular buffer.", en: "Use a fixed-size array as a circular buffer." },
      { vi: "Giữ front và size. Rear được tính bằng (front + size - 1) % k.", en: "Track front and size. Rear is computed as (front + size - 1) % k." },
      { vi: "insertFront di chuyển front lùi vòng tròn; insertLast ghi vào (front + size) % k.", en: "insertFront moves front backward circularly; insertLast writes to (front + size) % k." },
    ],
    complexity: {
      time: "O(1)",
      space: "O(k)",
      note: {
        vi: "Mỗi operation chỉ cập nhật vài biến/index nên O(1). Bộ nhớ là mảng kích thước k.",
        en: "Each operation updates a few variables/indices, so O(1). Memory is the array of size k.",
      },
    },
    code: [
      "class MyCircularDeque:",
      "    def __init__(self, k: int):",
      "        self.data = [None] * k",
      "        self.k = k",
      "        self.front = 0",
      "        self.size = 0",
      "    def insertFront(self, value: int) -> bool:",
      "        if self.isFull(): return False",
      "        self.front = (self.front - 1) % self.k",
      "        self.data[self.front] = value; self.size += 1; return True",
      "    def insertLast(self, value: int) -> bool:",
      "        if self.isFull(): return False",
      "        idx = (self.front + self.size) % self.k",
      "        self.data[idx] = value; self.size += 1; return True",
      "    def deleteFront(self) -> bool:",
      "        if self.isEmpty(): return False",
      "        self.data[self.front] = None",
      "        self.front = (self.front + 1) % self.k; self.size -= 1; return True",
      "    def deleteLast(self) -> bool:",
      "        if self.isEmpty(): return False",
      "        idx = (self.front + self.size - 1) % self.k",
      "        self.data[idx] = None; self.size -= 1; return True",
      "    def getFront(self) -> int:",
      "        return -1 if self.isEmpty() else self.data[self.front]",
      "    def getRear(self) -> int:",
      "        return -1 if self.isEmpty() else self.data[(self.front + self.size - 1) % self.k]",
      "    def isEmpty(self) -> bool:",
      "        return self.size == 0",
      "    def isFull(self) -> bool:",
      "        return self.size == self.k",
    ],
    builder: buildSteps641,
  },
  1598: {
    id: 1598,
    difficulty: "easy",
    slug: "crawler-log-folder",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Crawler Log Folder", en: "Crawler Log Folder" },
    titleVi: { vi: "Theo dõi thư mục crawler", en: "Track crawler folder depth" },
    statement: {
      vi: "Cho danh sách log thao tác thư mục. '../' quay về thư mục cha, './' giữ nguyên, còn 'x/' đi vào thư mục con x. Trả về số bước tối thiểu để quay về thư mục chính.",
      en: "Given folder operation logs. '../' moves to the parent folder, './' stays, and 'x/' enters child folder x. Return the minimum operations needed to go back to the main folder.",
    },
    defaultInput: ["d1/", "d2/", "../", "d21/", "./"],
    inputKind: "stringArray",
    inputLabel: { vi: "logs (JSON hoặc comma-separated)", en: "logs (JSON or comma-separated)" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Cach tiep can", en: "Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "1 - Depth counter", en: "1 - Depth counter" } },
          { value: 2, label: { vi: "2 - Stack", en: "2 - Stack" } },
        ],
      },
    ],
    approach: [
      { vi: "Approach 1: dung bien depth. Vao folder con thi depth++, '../' thi depth=max(0,depth-1), './' bo qua.", en: "Approach 1: use a depth counter. Child folder => depth++, '../' => depth=max(0,depth-1), './' => skip." },
      { vi: "Approach 2: dung stack de luu path hien tai. Child folder push, '../' pop neu stack khong rong, './' khong doi.", en: "Approach 2: use a stack to store the current path. Child folder pushes, '../' pops if possible, './' does nothing." },
      { vi: "Ket qua la depth hien tai, hoac stack.length.", en: "The answer is the current depth, or stack.length." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyệt mỗi log một lần. Visualizer giữ path stack để dễ xem; lời giải chỉ cần biến depth O(1).",
        en: "Read each log once. The visualizer keeps a path stack for clarity; the core solution only needs O(1) depth.",
      },
    },
    code: [
      "class Solution:",
      "    def minOperations(self, logs):",
      "        depth = 0",
      "        for log in logs:",
      "            if log == '../':",
      "                depth = max(0, depth - 1)",
      "            elif log == './':",
      "                continue",
      "            else:",
      "                depth += 1",
      "        return depth",
    ],
    codeLabel: { vi: "Approach 1: Depth counter", en: "Approach 1: Depth counter" },
    code2Label: { vi: "Approach 2: Stack", en: "Approach 2: Stack" },
    code2: [
      "class Solution:",
      "    def minOperations(self, logs):",
      "        stack = []",
      "        for log in logs:",
      "            if log == '../':",
      "                if stack:",
      "                    stack.pop()",
      "            elif log == './':",
      "                continue",
      "            else:",
      "                stack.append(log[:-1])",
      "        return len(stack)",
    ],
    builder: buildSteps1598,
  },
  1963: {
    id: 1963,
    difficulty: "medium",
    slug: "minimum-number-of-swaps-to-make-the-string-balanced",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: {
      vi: "Minimum Number of Swaps to Make the String Balanced",
      en: "Minimum Number of Swaps to Make the String Balanced",
    },
    titleVi: { vi: "So swap toi thieu de can bang chuoi ngoac", en: "Minimum swaps to balance brackets" },
    statement: {
      vi: "Cho chuoi gom so luong '[' va ']' bang nhau. Moi swap co the doi cho hai ky tu bat ky. Tim so swap toi thieu de chuoi ngoac can bang.",
      en: "Given a string with equal numbers of '[' and ']'. One swap may exchange any two characters. Return the minimum swaps needed to balance the bracket string.",
    },
    defaultInput: "][][",
    inputKind: "string",
    inputLabel: { vi: "Bracket string s", en: "Bracket string s" },
    extraParams: [],
    approach: [
      { vi: "Push moi '[' chua ghep cap vao stack.", en: "Push each unmatched '[' onto the stack." },
      { vi: "Voi ']', pop mot '[' neu stack khong rong; neu rong thi tang unmatched_close.", en: "For ']', pop one '[' when possible; otherwise increment unmatched_close." },
      { vi: "Mot swap co the sua toi da hai unmatched closing brackets.", en: "One swap can fix up to two unmatched closing brackets." },
      { vi: "Ket qua la (unmatched_close + 1) // 2.", en: "The answer is (unmatched_close + 1) // 2." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyet chuoi mot lan. Stack luu toi da n/2 ngoac mo; co the toi uu thanh O(1) bang mot bien dem.",
        en: "Scan the string once. The stack stores up to n/2 openers; it can be optimized to O(1) with a counter.",
      },
    },
    code: [
      "class Solution:",
      "    def minSwaps(self, s: str) -> int:",
      "        stack = []",
      "        unmatched_close = 0",
      "        for i, ch in enumerate(s):",
      "            if ch == '[':",
      "                stack.append(i)",
      "            elif stack:",
      "                stack.pop()",
      "            else:",
      "                unmatched_close += 1",
      "        return (unmatched_close + 1) // 2",
    ],
    builder: buildSteps1963,
  },
  1967: {
    id: 1967,
    difficulty: "easy",
    slug: "number-of-strings-that-appear-as-substrings-in-word",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Number of Strings That Appear as Substrings in Word", en: "Number of Strings That Appear as Substrings in Word" },
    titleVi: { vi: "Số chuỗi xuất hiện như chuỗi con", en: "Count patterns that are substrings" },
    statement: {
      vi:
        "Cho mảng patterns và chuỗi word. Đếm số lượng chuỗi trong patterns là chuỗi con (substring) của word.",
      en:
        "Given an array of strings patterns and a string word. Count how many strings in patterns are substrings of word.",
    },
    defaultInput: "a,abc,bc,d",
    inputKind: "string",
    inputLabel: { vi: "patterns (cách bởi dấu phẩy)", en: "patterns (comma separated)" },
    extraParams: [
      {
        key: "word",
        type: "string",
        label: { vi: "word", en: "word" },
        default: "abc",
      },
    ],
    complexity: {
      time: "O(n × m)",
      space: "O(1)",
      note: {
        vi: "Duyệt n patterns, mỗi pattern kiểm tra substring O(m) với m = len(word). Tổng O(n×m). O(1) bộ nhớ extra.",
        en: "Iterate n patterns, each substring check is O(m) where m = len(word). Total O(n×m). O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def numOfStrings(self, patterns, word):",
      "        count = 0",
      "        for pattern in patterns:",
      "            if pattern in word:",
      "                count += 1",
      "        return count",
    ],
    builder: buildSteps1967,
  },
};
