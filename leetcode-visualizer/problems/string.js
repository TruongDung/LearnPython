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
    codeLine: 3,
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
    steps.push({
      title: opts.title,
      arr: chars.map((ch) => (opens.has(ch) ? 1 : -1)),
      sub: chars,
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      codeLines: [opts.codeLine],
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "top", value: stack.length ? stack[stack.length - 1] : "empty" },
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
      codeLine: 4,
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
        codeLine: 6,
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
      codeLine: 8,
      highlight: [i],
      vars: [
        { name: "closing", value: ch },
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
        codeLine: 9,
        highlight: [i],
        vars: [{ name: "answer", value: false }],
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
      codeLine: 10,
      highlight: [i],
      mark: [i],
      vars: [{ name: "action", value: "pop" }],
      note: {
        vi: `Matched '${expected}${ch}', so pop '${expected}' from the stack.`,
        en: `Matched '${expected}${ch}', so pop '${expected}' from the stack.`,
      },
    });
  }

  const answer = stack.length === 0;
  pushStep({
    title: { vi: `Result: ${answer}`, en: `Result: ${answer}` },
    codeLine: 11,
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
      "        for ch in s:",
      "            if ch in '([{':",
      "                stack.append(ch)",
      "            else:",
      "                if not stack or stack[-1] != {')':'(', ']':'[', '}':'{'}[ch]:",
      "                    return False",
      "                stack.pop()",
      "        return not stack",
    ],
    builder: buildSteps20,
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
