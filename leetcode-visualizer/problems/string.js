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

/**
 * LeetCode 346: Moving Average from Data Stream.
 * Keep only the latest size values in a FIFO queue and maintain their sum.
 */
function buildSteps346(input) {
  const operations = parseDequeOps641(input);
  const constructor = operations[0] && operations[0].name === "MovingAverage"
    ? operations[0]
    : { name: "MovingAverage", args: [3] };
  const size = Number.isInteger(constructor.args[0]) && constructor.args[0] > 0
    ? constructor.args[0]
    : 3;
  const startIndex = operations[0] && operations[0].name === "MovingAverage" ? 1 : 0;
  const nextOperations = operations.slice(startIndex).filter((op) => op.name === "next");
  const stream = nextOperations.map((op) => op.args[0]).filter((value) => Number.isFinite(value));
  const queue = [];
  const outputs = [null];
  const steps = [];
  let windowSum = 0;
  let average = null;
  let removed = null;

  function numberLabel(value) {
    if (value === null || value === undefined) return "none";
    if (Number.isInteger(value)) return String(value);
    return String(Number(value.toFixed(6)));
  }

  function outputLabel() {
    return `[${outputs.map((value) => value === null ? "None" : numberLabel(value)).join(", ")}]`;
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      queueView: {
        title: "Sliding window queue",
        items: queue.slice(),
        capacity: Math.max(size, queue.length),
        stream,
        current,
        active: Number.isInteger(opts.active) ? opts.active : -1,
        status: [
          { label: "capacity", value: size },
          { label: "window_sum", value: numberLabel(windowSum) },
          { label: "average", value: numberLabel(average) },
          { label: "evicted", value: numberLabel(removed) },
        ],
      },
      vars: [
        { name: "size", value: size },
        { name: "queue", value: `[${queue.join(", ")}]` },
        { name: "window_sum", value: windowSum },
        { name: "average", value: numberLabel(average) },
        { name: "removed", value: numberLabel(removed) },
        { name: "outputs", value: outputLabel() },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: `Khoi tao size = ${size}`, en: `Initialize size = ${size}` },
    codeLine: 5,
    note: {
      vi: `Cua so chi giu toi da ${size} gia tri moi nhat.`,
      en: `The window keeps at most the latest ${size} values.`,
    },
  });

  pushStep({
    title: { vi: "Khoi tao queue rong", en: "Initialize empty queue" },
    codeLine: 6,
    note: {
      vi: "Queue theo thu tu FIFO: gia tri cu nhat o FRONT, gia tri moi nhat o REAR.",
      en: "The queue is FIFO: the oldest value is at FRONT and the newest is at REAR.",
    },
  });

  pushStep({
    title: { vi: "Khoi tao window_sum = 0", en: "Initialize window_sum = 0" },
    codeLine: 7,
    note: {
      vi: "Luu rolling sum de khong phai cong lai toan bo queue sau moi lan next().",
      en: "Keep a rolling sum so next() never has to sum the whole queue again.",
    },
  });

  for (let i = 0; i < stream.length; i++) {
    const value = stream[i];
    removed = null;

    queue.push(value);
    pushStep({
      title: { vi: `Them ${value} vao REAR`, en: `Append ${value} at REAR` },
      codeLine: 10,
      current: i,
      active: queue.length - 1,
      vars: [
        { name: "val", value },
        { name: "action", value: `queue.append(${value})` },
      ],
      note: {
        vi: `next(${value}) them gia tri moi vao cuoi queue.`,
        en: `next(${value}) appends the new value to the rear of the queue.`,
      },
    });

    windowSum += value;
    pushStep({
      title: { vi: `window_sum += ${value}`, en: `window_sum += ${value}` },
      codeLine: 11,
      current: i,
      active: queue.length - 1,
      vars: [
        { name: "val", value },
        { name: "calculation", value: `${windowSum - value} + ${value} = ${windowSum}` },
      ],
      note: {
        vi: `Cong ${value} vao rolling sum, duoc ${windowSum}.`,
        en: `Add ${value} to the rolling sum, giving ${windowSum}.`,
      },
    });

    const overflowing = queue.length > size;
    pushStep({
      title: {
        vi: overflowing ? `${queue.length} > ${size}: cua so bi tran` : `${queue.length} <= ${size}: chua can loai`,
        en: overflowing ? `${queue.length} > ${size}: window overflow` : `${queue.length} <= ${size}: no eviction`,
      },
      codeLine: 13,
      current: i,
      active: overflowing ? 0 : queue.length - 1,
      vars: [{ name: "len(queue) > size", value: overflowing }],
      note: {
        vi: overflowing
          ? "Queue vuot capacity, nen gia tri cu nhat tai FRONT phai roi cua so."
          : "Queue van nam trong capacity, nen moi gia tri hien tai deu duoc tinh.",
        en: overflowing
          ? "The queue exceeds capacity, so the oldest FRONT value must leave the window."
          : "The queue is within capacity, so every current value remains in the average.",
      },
    });

    if (overflowing) {
      removed = queue.shift();
      pushStep({
        title: { vi: `Loai FRONT = ${removed}`, en: `Evict FRONT = ${removed}` },
        codeLine: 14,
        current: i,
        vars: [
          { name: "removed", value: removed },
          { name: "action", value: `queue.popleft() -> ${removed}` },
        ],
        note: {
          vi: `${removed} la gia tri cu nhat, nen bi popleft khoi queue.`,
          en: `${removed} is the oldest value, so popleft removes it from the queue.`,
        },
      });

      const sumBeforeRemoval = windowSum;
      windowSum -= removed;
      pushStep({
        title: { vi: `window_sum -= ${removed}`, en: `window_sum -= ${removed}` },
        codeLine: 15,
        current: i,
        vars: [{ name: "calculation", value: `${sumBeforeRemoval} - ${removed} = ${windowSum}` }],
        note: {
          vi: `Tru gia tri da roi cua so; rolling sum moi la ${windowSum}.`,
          en: `Subtract the evicted value; the new rolling sum is ${windowSum}.`,
        },
      });
    }

    average = windowSum / queue.length;
    outputs.push(average);
    pushStep({
      title: { vi: `Average = ${numberLabel(average)}`, en: `Average = ${numberLabel(average)}` },
      codeLine: 17,
      current: i,
      vars: [
        { name: "len(queue)", value: queue.length },
        { name: "calculation", value: `${windowSum} / ${queue.length} = ${numberLabel(average)}` },
        { name: "return", value: numberLabel(average) },
      ],
      note: {
        vi: `Trung binh cua cua so [${queue.join(", ")}] la ${windowSum} / ${queue.length} = ${numberLabel(average)}.`,
        en: `The average of [${queue.join(", ")}] is ${windowSum} / ${queue.length} = ${numberLabel(average)}.`,
      },
    });
  }

  pushStep({
    title: { vi: `Ket qua cuoi: ${numberLabel(average)}`, en: `Final result: ${numberLabel(average)}` },
    codeLine: 17,
    current: stream.length,
    final: true,
    vars: [{ name: "all outputs", value: outputLabel() }],
    note: {
      vi: `Da xu ly toan bo stream. Queue cuoi cung la [${queue.join(", ")}].`,
      en: `The full stream is processed. The final queue is [${queue.join(", ")}].`,
    },
  });

  return { operations, outputs, answer: average, steps };
}

/**
 * LeetCode 362: Design Hit Counter.
 * Store chronological hit timestamps and discard hits older than 300 seconds.
 */
function buildSteps362(input) {
  const operations = parseDequeOps641(input);
  const startIndex = operations[0] && operations[0].name === "HitCounter" ? 1 : 0;
  const calls = operations.slice(startIndex).filter((op) => op.name === "hit" || op.name === "getHits");
  const operationLabels = calls.map((op) => `${op.name}(${op.args.join(", ")})`);
  const hits = [];
  const outputs = [null];
  const steps = [];
  let currentOperation = "HitCounter()";
  let timestamp = null;
  let expireAt = null;
  let lastResult = null;
  let removed = [];

  function outputLabel() {
    return `[${outputs.map((value) => value === null ? "None" : value).join(", ")}]`;
  }

  function rangeLabel() {
    return timestamp === null ? "none" : `[${timestamp - 299}, ${timestamp}]`;
  }

  function removedLabel() {
    return removed.length ? `[${removed.join(", ")}]` : "none";
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      queueView: {
        title: "Hits from the past 300 seconds",
        items: hits.slice(),
        capacity: Math.max(calls.filter((op) => op.name === "hit").length, hits.length, 1),
        stream: operationLabels,
        current,
        active: Number.isInteger(opts.active) ? opts.active : -1,
        status: [
          { label: "operation", value: currentOperation },
          { label: "valid range", value: rangeLabel() },
          { label: "hit count", value: hits.length },
          { label: "removed", value: removedLabel() },
        ],
      },
      vars: [
        { name: "hits", value: `[${hits.join(", ")}]` },
        { name: "timestamp", value: timestamp === null ? "none" : timestamp },
        { name: "timestamp - 300", value: expireAt === null ? "none" : `${timestamp} - 300 = ${expireAt}` },
        { name: "len(hits)", value: hits.length },
        { name: "removed", value: removedLabel() },
        { name: "lastResult", value: lastResult === null ? "None" : lastResult },
        { name: "outputs", value: outputLabel() },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Khoi tao HitCounter", en: "Initialize HitCounter" },
    codeLine: 5,
    note: {
      vi: "Queue ban dau rong. FRONT la hit cu nhat, REAR la hit moi nhat.",
      en: "The queue starts empty. FRONT is the oldest hit and REAR is the newest hit.",
    },
  });

  for (let i = 0; i < calls.length; i++) {
    const op = calls[i];
    timestamp = op.args[0];
    expireAt = timestamp - 300;
    currentOperation = operationLabels[i];
    removed = [];
    lastResult = null;

    if (op.name === "hit") {
      hits.push(timestamp);
      outputs.push(null);
      pushStep({
        title: { vi: `Ghi nhan hit tai ${timestamp}`, en: `Record hit at ${timestamp}` },
        codeLine: 8,
        current: i,
        active: hits.length - 1,
        vars: [
          { name: "action", value: `hits.append(${timestamp})` },
          { name: "return", value: "None" },
        ],
        note: {
          vi: `Append timestamp ${timestamp} vao REAR. hit() khong tra ve gia tri.`,
          en: `Append timestamp ${timestamp} at REAR. hit() does not return a value.`,
        },
      });
      continue;
    }

    while (hits.length && hits[0] <= expireAt) {
      const stale = hits[0];
      pushStep({
        title: { vi: `${stale} <= ${expireAt}: hit da het han`, en: `${stale} <= ${expireAt}: hit expired` },
        codeLine: 11,
        current: i,
        active: 0,
        vars: [
          { name: "hits[0]", value: stale },
          { name: "hits[0] <= timestamp - 300", value: `${stale} <= ${expireAt} = True` },
        ],
        note: {
          vi: `Hit ${stale} khong nam trong 300 giay gan nhat [${timestamp - 299}, ${timestamp}], nen phai roi FRONT.`,
          en: `Hit ${stale} is outside the latest 300 seconds [${timestamp - 299}, ${timestamp}], so it must leave FRONT.`,
        },
      });

      removed.push(hits.shift());
      pushStep({
        title: { vi: `popleft ${removed[removed.length - 1]}`, en: `Popleft ${removed[removed.length - 1]}` },
        codeLine: 12,
        current: i,
        vars: [
          { name: "popped", value: removed[removed.length - 1] },
          { name: "action", value: "hits.popleft()" },
        ],
        note: {
          vi: `Loai hit het han. Queue con lai la [${hits.join(", ")}].`,
          en: `Remove the expired hit. The queue is now [${hits.join(", ")}].`,
        },
      });
    }

    const frontIsValid = hits.length > 0;
    pushStep({
      title: {
        vi: frontIsValid ? `${hits[0]} > ${expireAt}: FRONT con hop le` : "Queue rong: dung loai",
        en: frontIsValid ? `${hits[0]} > ${expireAt}: FRONT is valid` : "Queue empty: stop pruning",
      },
      codeLine: 11,
      current: i,
      active: frontIsValid ? 0 : -1,
      vars: [
        { name: "hits is not empty", value: frontIsValid },
        {
          name: "hits[0] <= timestamp - 300",
          value: frontIsValid ? `${hits[0]} <= ${expireAt} = False` : "not evaluated",
        },
      ],
      note: {
        vi: frontIsValid
          ? `FRONT = ${hits[0]} nam trong khoang [${timestamp - 299}, ${timestamp}], nen dung popleft.`
          : "Khong con hit nao de kiem tra, nen vong while ket thuc.",
        en: frontIsValid
          ? `FRONT = ${hits[0]} is inside [${timestamp - 299}, ${timestamp}], so pruning stops.`
          : "There are no hits left to inspect, so the while loop ends.",
      },
    });

    lastResult = hits.length;
    outputs.push(lastResult);
    pushStep({
      title: { vi: `getHits(${timestamp}) -> ${lastResult}`, en: `getHits(${timestamp}) -> ${lastResult}` },
      codeLine: 14,
      current: i,
      vars: [
        { name: "valid hits", value: `[${hits.join(", ")}]` },
        { name: "return", value: lastResult },
      ],
      note: {
        vi: `Co ${lastResult} hit trong 300 giay gan nhat [${timestamp - 299}, ${timestamp}].`,
        en: `There are ${lastResult} hits in the latest 300 seconds [${timestamp - 299}, ${timestamp}].`,
      },
    });
  }

  pushStep({
    title: { vi: `Ket qua cuoi: ${lastResult}`, en: `Final result: ${lastResult}` },
    codeLine: 14,
    current: calls.length,
    final: true,
    vars: [{ name: "all outputs", value: outputLabel() }],
    note: {
      vi: `Da xu ly toan bo operations. Queue cuoi cung la [${hits.join(", ")}].`,
      en: `All operations are complete. The final queue is [${hits.join(", ")}].`,
    },
  });

  return { operations, outputs, answer: lastResult, steps };
}

/**
 * LeetCode 933: Number of Recent Calls.
 * Keep request timestamps from the inclusive interval [t - 3000, t].
 */
function buildSteps933(input) {
  const operations = parseDequeOps641(input);
  const startIndex = operations[0] && operations[0].name === "RecentCounter" ? 1 : 0;
  const pingOperations = operations.slice(startIndex).filter((op) => op.name === "ping");
  const stream = pingOperations.map((op) => op.args[0]).filter((value) => Number.isFinite(value));
  const requests = [];
  const outputs = [null];
  const steps = [];
  let t = null;
  let lowerBound = null;
  let result = null;
  let removed = [];

  function outputLabel() {
    return `[${outputs.map((value) => value === null ? "None" : value).join(", ")}]`;
  }

  function rangeLabel() {
    return lowerBound === null ? "none" : `[${lowerBound}, ${t}]`;
  }

  function removedLabel() {
    return removed.length ? `[${removed.join(", ")}]` : "none";
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      queueView: {
        title: "Recent requests queue",
        items: requests.slice(),
        capacity: Math.max(stream.length, requests.length, 1),
        stream,
        current,
        active: Number.isInteger(opts.active) ? opts.active : -1,
        status: [
          { label: "t", value: t === null ? "none" : t },
          { label: "valid range", value: rangeLabel() },
          { label: "recent count", value: requests.length },
          { label: "removed", value: removedLabel() },
        ],
      },
      vars: [
        { name: "requests", value: `[${requests.join(", ")}]` },
        { name: "t", value: t === null ? "none" : t },
        { name: "t - 3000", value: lowerBound === null ? "none" : `${t} - 3000 = ${lowerBound}` },
        { name: "len(requests)", value: requests.length },
        { name: "removed", value: removedLabel() },
        { name: "outputs", value: outputLabel() },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Khoi tao RecentCounter", en: "Initialize RecentCounter" },
    codeLine: 5,
    note: {
      vi: "Queue ban dau rong. FRONT se luu request cu nhat va REAR luu request moi nhat.",
      en: "The queue starts empty. FRONT holds the oldest request and REAR holds the newest.",
    },
  });

  for (let i = 0; i < stream.length; i++) {
    t = stream[i];
    lowerBound = t - 3000;
    removed = [];
    result = null;

    requests.push(t);
    pushStep({
      title: { vi: `ping(${t}): them vao REAR`, en: `ping(${t}): append at REAR` },
      codeLine: 8,
      current: i,
      active: requests.length - 1,
      vars: [
        { name: "operation", value: `ping(${t})` },
        { name: "action", value: `requests.append(${t})` },
      ],
      note: {
        vi: `Them request moi tai thoi diem ${t}. Cua so hop le hien tai la [${lowerBound}, ${t}].`,
        en: `Add the request at time ${t}. The current valid window is [${lowerBound}, ${t}].`,
      },
    });

    while (requests[0] < lowerBound) {
      const stale = requests[0];
      pushStep({
        title: { vi: `${stale} < ${lowerBound}: request da cu`, en: `${stale} < ${lowerBound}: request is stale` },
        codeLine: 9,
        current: i,
        active: 0,
        vars: [
          { name: "requests[0]", value: stale },
          { name: "requests[0] < t - 3000", value: `${stale} < ${lowerBound} = True` },
        ],
        note: {
          vi: `${stale} nam ngoai khoang [${lowerBound}, ${t}], nen phai roi FRONT.`,
          en: `${stale} is outside [${lowerBound}, ${t}], so it must leave from FRONT.`,
        },
      });

      removed.push(requests.shift());
      pushStep({
        title: { vi: `popleft ${removed[removed.length - 1]}`, en: `Popleft ${removed[removed.length - 1]}` },
        codeLine: 10,
        current: i,
        vars: [
          { name: "popped", value: removed[removed.length - 1] },
          { name: "action", value: "requests.popleft()" },
        ],
        note: {
          vi: `Loai request cu nhat. Queue con lai la [${requests.join(", ")}].`,
          en: `Remove the oldest request. The queue is now [${requests.join(", ")}].`,
        },
      });
    }

    pushStep({
      title: {
        vi: `${requests[0]} >= ${lowerBound}: FRONT con hop le`,
        en: `${requests[0]} >= ${lowerBound}: FRONT is valid`,
      },
      codeLine: 9,
      current: i,
      active: 0,
      vars: [
        { name: "requests[0]", value: requests[0] },
        { name: "requests[0] < t - 3000", value: `${requests[0]} < ${lowerBound} = False` },
      ],
      note: {
        vi: `FRONT = ${requests[0]} nam trong khoang inclusive [${lowerBound}, ${t}], nen dung popleft.`,
        en: `FRONT = ${requests[0]} is inside the inclusive interval [${lowerBound}, ${t}], so pruning stops.`,
      },
    });

    result = requests.length;
    outputs.push(result);
    pushStep({
      title: { vi: `Tra ve ${result}`, en: `Return ${result}` },
      codeLine: 12,
      current: i,
      vars: [
        { name: "return", value: result },
        { name: "valid requests", value: `[${requests.join(", ")}]` },
      ],
      note: {
        vi: `Co ${result} request trong khoang [${lowerBound}, ${t}].`,
        en: `There are ${result} requests in [${lowerBound}, ${t}].`,
      },
    });
  }

  pushStep({
    title: { vi: `Ket qua cuoi: ${result}`, en: `Final result: ${result}` },
    codeLine: 12,
    current: stream.length,
    final: true,
    vars: [{ name: "all outputs", value: outputLabel() }],
    note: {
      vi: `Da xu ly toan bo ping. Queue cuoi cung la [${requests.join(", ")}].`,
      en: `All ping calls are complete. The final queue is [${requests.join(", ")}].`,
    },
  });

  return { operations, outputs, answer: result, steps };
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
 * LeetCode 1700: Number of Students Unable to Eat Lunch.
 * Simulate students as a FIFO queue and sandwiches as a top-first stack.
 */
function buildSteps1700(input, params) {
  const students = Array.isArray(input)
    ? input.map(Number)
    : String(input).split(",").map((value) => Number(value.trim()));
  const sandwiches = String(params && params.sandwiches !== undefined ? params.sandwiches : "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value));
  const queue = students.map((preference, id) => ({ id, preference }));
  let sandwichStack;
  let rotations;
  const steps = [];

  function foodName(type) {
    if (type === 0) return "circle";
    if (type === 1) return "square";
    return "not in scope";
  }

  function queueValues() {
    return queue.map((student) => `S${student.id}:${student.preference}`);
  }

  function queueLabel() {
    return `[${queueValues().join(", ")}]`;
  }

  function sandwichLabel() {
    return sandwichStack === undefined ? "not in scope" : `[${sandwichStack.join(", ")}]`;
  }

  function sandwichItems() {
    if (sandwichStack === undefined) return [];
    return sandwichStack
      .slice()
      .reverse()
      .map((type) => ({ value: type, detail: foodName(type) }));
  }

  function frontStudentLabel() {
    return queue.length ? `S${queue[0].id} wants ${queue[0].preference}` : "queue empty";
  }

  function topSandwichLabel() {
    return sandwichStack && sandwichStack.length
      ? `${sandwichStack[0]} (${foodName(sandwichStack[0])})`
      : sandwichStack === undefined
        ? "not in scope"
        : "none";
  }

  function pushStep(opts) {
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      stackView: {
        title: "Sandwich stack (top first)",
        emptyLabel: sandwichStack === undefined ? "sandwiches not initialized" : "no sandwiches left",
        items: sandwichItems(),
        input: queueValues(),
        current: queue.length ? 0 : -1,
        inputLabel: "Student queue (0=circle, 1=square): FRONT -> REAR",
        status: [
          { label: "front student", value: frontStudentLabel() },
          { label: "top sandwich", value: topSandwichLabel() },
        ],
      },
      vars: [
        { name: "student_queue", value: queueLabel() },
        { name: "sandwich_stack", value: sandwichLabel() },
        { name: "rotations", value: rotations === undefined ? "not in scope" : rotations },
        { name: "queue length", value: queue.length },
        { name: "front student", value: frontStudentLabel() },
        { name: "top sandwich", value: topSandwichLabel() },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize student queue", en: "Initialize student queue" },
    codeLine: 5,
    vars: [{ name: "students", value: `[${students.join(", ")}]` }],
    note: {
      vi: "Queue la FIFO: hoc sinh o FRONT duoc xu ly truoc; neu khong nhan sandwich thi hoc sinh do chuyen xuong REAR.",
      en: "A queue is FIFO: the student at the FRONT is processed first; if they refuse the sandwich, they move to the REAR.",
    },
  });

  sandwichStack = sandwiches.slice();
  pushStep({
    title: { vi: "Initialize sandwich stack", en: "Initialize sandwich stack" },
    codeLine: 6,
    vars: [{ name: "sandwiches", value: `[${sandwiches.join(", ")}]` }],
    note: {
      vi: "sandwiches[0] la sandwich tren cung. 0 la circular, 1 la square.",
      en: "sandwiches[0] is the top sandwich. 0 means circular and 1 means square.",
    },
  });

  rotations = 0;
  pushStep({
    title: { vi: "Initialize rotations", en: "Initialize rotations" },
    codeLine: 7,
    note: {
      vi: "rotations dem so hoc sinh lien tiep tu choi sandwich hien tai. Khi co nguoi an, reset ve 0.",
      en: "rotations counts consecutive students who reject the current sandwich. Reset it to 0 whenever someone eats.",
    },
  });

  while (queue.length && rotations < queue.length) {
    const student = queue[0];
    const sandwich = sandwichStack[0];
    const matches = student.preference === sandwich;

    pushStep({
      title: {
        vi: `Check S${student.id}: ${student.preference} ${matches ? "=" : "!="} ${sandwich}`,
        en: `Check S${student.id}: ${student.preference} ${matches ? "=" : "!="} ${sandwich}`,
      },
      codeLine: 9,
      vars: [
        { name: "student_queue[0]", value: student.preference },
        { name: "sandwich_stack[0]", value: sandwich },
        { name: "preference matches", value: matches },
      ],
      note: {
        vi: `So sanh preference cua S${student.id} o front voi sandwich tren cung.`,
        en: `Compare the preference of S${student.id} at the front with the top sandwich.`,
      },
    });

    if (matches) {
      pushStep({
        title: { vi: `S${student.id} accepts sandwich ${sandwich}`, en: `S${student.id} accepts sandwich ${sandwich}` },
        codeLine: 10,
        vars: [{ name: "match", value: `${student.preference} == ${sandwich}` }],
        note: {
          vi: "Preference khop, nen hoc sinh roi queue va sandwich tren cung duoc lay di.",
          en: "The preference matches, so the student leaves the queue and the top sandwich is removed.",
        },
      });

      const servedStudent = queue.shift();
      pushStep({
        title: { vi: `Remove S${servedStudent.id} from front`, en: `Remove S${servedStudent.id} from front` },
        codeLine: 11,
        vars: [
          { name: "served student", value: `S${servedStudent.id}` },
          { name: "preference", value: servedStudent.preference },
        ],
        note: {
          vi: `popleft() loai S${servedStudent.id} khoi front cua queue.`,
          en: `popleft() removes S${servedStudent.id} from the front of the queue.`,
        },
      });

      const eatenSandwich = sandwichStack.shift();
      pushStep({
        title: { vi: `Remove sandwich ${eatenSandwich}`, en: `Remove sandwich ${eatenSandwich}` },
        codeLine: 12,
        vars: [{ name: "eaten sandwich", value: `${eatenSandwich} (${foodName(eatenSandwich)})` }],
        note: {
          vi: "popleft() loai sandwich vua duoc an; sandwich tiep theo tro thanh top.",
          en: "popleft() removes the eaten sandwich; the next sandwich becomes the top.",
        },
      });

      rotations = 0;
      pushStep({
        title: { vi: "Reset rotations", en: "Reset rotations" },
        codeLine: 13,
        vars: [{ name: "action", value: "rotations = 0" }],
        note: {
          vi: "Da co progress vi mot hoc sinh an duoc, nen bat dau dem lai tu 0.",
          en: "Progress was made because one student ate, so restart the rejection count at 0.",
        },
      });
    } else {
      const movedStudent = queue.shift();
      queue.push(movedStudent);
      pushStep({
        title: { vi: `Move S${movedStudent.id} to rear`, en: `Move S${movedStudent.id} to rear` },
        codeLine: 15,
        vars: [
          { name: "moved student", value: `S${movedStudent.id}` },
          { name: "queue operation", value: "append(popleft())" },
        ],
        note: {
          vi: `S${movedStudent.id} khong muon sandwich ${sandwich}, nen roi front va duoc append vao rear cua queue.`,
          en: `S${movedStudent.id} does not want sandwich ${sandwich}, so they leave the front and are appended to the rear of the queue.`,
        },
      });

      rotations += 1;
      pushStep({
        title: { vi: `rotations = ${rotations}`, en: `rotations = ${rotations}` },
        codeLine: 16,
        vars: [
          { name: "rotations", value: rotations },
          { name: "rotations == queue length", value: rotations === queue.length },
        ],
        note: {
          vi: rotations === queue.length
            ? "Queue da quay du mot vong ma khong ai nhan sandwich top. Simulation se dung."
            : "Chua quay het queue, tiep tuc kiem tra hoc sinh moi o front.",
          en: rotations === queue.length
            ? "The queue completed a full rotation without anyone accepting the top sandwich. The simulation will stop."
            : "The queue has not completed a full rotation, so check the new front student next.",
        },
      });
    }
  }

  const answer = queue.length;
  const stopped = answer > 0;
  pushStep({
    title: { vi: `Result: ${answer} unable to eat`, en: `Result: ${answer} unable to eat` },
    codeLine: 18,
    vars: [
      { name: "answer", value: answer },
      { name: "stop reason", value: stopped ? "full rotation without a match" : "queue empty" },
    ],
    note: {
      vi: stopped
        ? `Con ${answer} hoc sinh. Tat ca deu tu choi sandwich top ${sandwichStack[0]}, nen khong ai co the an tiep.`
        : "Queue rong: moi hoc sinh deu da nhan sandwich.",
      en: stopped
        ? `${answer} students remain. Every one of them rejects top sandwich ${sandwichStack[0]}, so nobody else can eat.`
        : "The queue is empty: every student received a sandwich.",
    },
    final: true,
  });

  return { students, sandwiches, answer, steps };
}

/**
 * LeetCode 921: Minimum Add to Make Parentheses Valid.
 * Keep unmatched opening parentheses on a stack and count missing openers.
 */
function buildSteps921(input) {
  const s = String(input).trim();
  const chars = s.split("");
  const stack = [];
  const steps = [];
  let additions;
  let ch;

  function valueLabel(value) {
    return value === undefined ? "not in scope" : value;
  }

  function stackItems() {
    return stack.map((index) => ({ value: "(", detail: `index ${index}` }));
  }

  function stackLabel() {
    return `[${stack.join(", ")}]`;
  }

  function totalNeeded() {
    return additions === undefined ? "not in scope" : additions + stack.length;
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      stackView: {
        title: "Unmatched '(' stack",
        emptyLabel: "no unmatched '('",
        items: stackItems(),
        input: chars,
        current,
        inputLabel: "Parentheses string",
        status: [
          { label: "missing '('", value: valueLabel(additions) },
          { label: "missing ')'", value: stack.length },
          { label: "total additions", value: totalNeeded() },
        ],
      },
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "ch", value: ch === undefined ? "not in scope" : `'${ch}'` },
        { name: "additions", value: valueLabel(additions) },
        { name: "len(stack)", value: stack.length },
        { name: "additions + len(stack)", value: totalNeeded() },
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
      vi: "Stack luu index cua cac '(' chua duoc ghep voi dau ')' nao.",
      en: "The stack stores indices of '(' characters that have not been matched with a ')'.",
    },
  });

  additions = 0;
  pushStep({
    title: { vi: "Initialize additions", en: "Initialize additions" },
    codeLine: 4,
    note: {
      vi: "additions dem so dau '(' can them khi gap ')' ma stack dang rong.",
      en: "additions counts missing '(' characters when a ')' appears while the stack is empty.",
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

    if (ch === "(") {
      pushStep({
        title: { vi: "Opening parenthesis", en: "Opening parenthesis" },
        codeLine: 6,
        current: i,
        vars: [{ name: "ch == '('", value: true }],
        note: {
          vi: "Day la dau mo, nen can cho mot dau ')' o phia sau de ghep cap.",
          en: "This is an opener, so it waits for a later ')' to form a pair.",
        },
      });

      stack.push(i);
      pushStep({
        title: { vi: `Push '(' at ${i}`, en: `Push '(' at ${i}` },
        codeLine: 7,
        current: i,
        vars: [
          { name: "pushed index", value: i },
          { name: "action", value: "stack.append(i)" },
        ],
        note: {
          vi: `Push index ${i}; hien co ${stack.length} dau '(' chua ghep cap.`,
          en: `Push index ${i}; there are now ${stack.length} unmatched '(' characters.`,
        },
      });
      continue;
    }

    if (stack.length) {
      pushStep({
        title: { vi: "A matching '(' exists", en: "A matching '(' exists" },
        codeLine: 8,
        current: i,
        vars: [{ name: "bool(stack)", value: true }],
        note: {
          vi: "Stack khong rong, nen ')' hien tai co the ghep voi dau '(' tren top.",
          en: "The stack is not empty, so the current ')' can match the '(' on top.",
        },
      });

      const openIndex = stack.pop();
      pushStep({
        title: { vi: `Match indices ${openIndex} and ${i}`, en: `Match indices ${openIndex} and ${i}` },
        codeLine: 9,
        current: i,
        vars: [
          { name: "open index", value: openIndex },
          { name: "close index", value: i },
          { name: "matched pair", value: "()" },
        ],
        note: {
          vi: `Ghep '(' tai index ${openIndex} voi ')' tai index ${i}, roi pop khoi stack.`,
          en: `Match '(' at index ${openIndex} with ')' at index ${i}, then pop it from the stack.`,
        },
      });
      continue;
    }

    pushStep({
      title: { vi: "No matching '(' exists", en: "No matching '(' exists" },
      codeLine: 10,
      current: i,
      vars: [{ name: "bool(stack)", value: false }],
      note: {
        vi: "Stack rong, nen ')' hien tai thieu mot dau '(' o phia truoc.",
        en: "The stack is empty, so the current ')' needs an added '(' before it.",
      },
    });

    additions += 1;
    pushStep({
      title: { vi: `additions = ${additions}`, en: `additions = ${additions}` },
      codeLine: 11,
      current: i,
      vars: [
        { name: "action", value: "additions += 1" },
        { name: "added character", value: "'('" },
      ],
      note: {
        vi: `Them mot '(' truoc ')' tai index ${i}; tong so dau '(' can them la ${additions}.`,
        en: `Add a '(' before ')' at index ${i}; ${additions} opening parenthesis must now be added.`,
      },
    });
  }

  const answer = additions + stack.length;
  pushStep({
    title: { vi: `Result: ${answer} addition${answer === 1 ? "" : "s"}`, en: `Result: ${answer} addition${answer === 1 ? "" : "s"}` },
    codeLine: 13,
    current: chars.length,
    vars: [
      { name: "missing '('", value: additions },
      { name: "missing ')'", value: stack.length },
      { name: "answer", value: `${additions} + ${stack.length} = ${answer}` },
    ],
    note: {
      vi: `Can them ${additions} dau '(' cho cac dau ')' bi thua va ${stack.length} dau ')' cho cac dau '(' con trong stack. Ket qua = ${answer}.`,
      en: `Add ${additions} '(' for unmatched closers and ${stack.length} ')' for openers left in the stack. The answer is ${answer}.`,
    },
    final: true,
  });

  return { s, answer, steps };
}

/**
 * LeetCode 1249: Minimum Remove to Make Valid Parentheses.
 * Match closing parentheses with opening indices and remove unmatched ones.
 */
function buildSteps1249(input) {
  const s = String(input);
  const originalChars = s.split("");
  const chars = originalChars.slice();
  const stack = [];
  const removedIndices = new Set();
  const steps = [];
  let ch;

  function stackLabel() {
    return `[${stack.join(", ")}]`;
  }

  function charsLabel() {
    return JSON.stringify(chars);
  }

  function visibleChars() {
    return chars.map((value, index) => removedIndices.has(index) ? "X" : value);
  }

  function visibleString() {
    return chars.join("");
  }

  function removedLabel() {
    return `[${Array.from(removedIndices).sort((a, b) => a - b).join(", ")}]`;
  }

  function stackItems() {
    return stack.map((index) => ({ value: "(", detail: `index ${index}` }));
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      stackView: {
        title: "Unmatched '(' indices",
        emptyLabel: "no unmatched '('",
        items: stackItems(),
        input: visibleChars(),
        current,
        inputLabel: "Characters (X = removed)",
        status: [
          { label: "current character", value: ch === undefined ? "-" : `'${ch}'` },
          { label: "unmatched '('", value: stack.length },
          { label: "removed indices", value: removedLabel() },
        ],
      },
      vars: [
        { name: "chars", value: charsLabel() },
        { name: "stack", value: stackLabel() },
        { name: "ch", value: ch === undefined ? "not in scope" : `'${ch}'` },
        { name: "removed_indices", value: removedLabel() },
        { name: "current string", value: `"${visibleString()}"` },
        { name: "s", value: `"${s}"` },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Convert string to character list", en: "Convert string to character list" },
    codeLine: 3,
    vars: [{ name: "len(chars)", value: chars.length }],
    note: {
      vi: "Dung list de co the danh dau ky tu can xoa bang chuoi rong ''.",
      en: "Use a list so invalid characters can be marked for removal with an empty string.",
    },
  });

  pushStep({
    title: { vi: "Initialize stack", en: "Initialize stack" },
    codeLine: 4,
    note: {
      vi: "Stack luu index cua cac dau '(' chua tim thay ')' ghep cap.",
      en: "The stack stores indices of '(' characters that have not found a matching ')'.",
    },
  });

  for (let i = 0; i < originalChars.length; i++) {
    ch = originalChars[i];
    pushStep({
      title: { vi: `Read '${ch}' at ${i}`, en: `Read '${ch}' at ${i}` },
      codeLine: 5,
      current: i,
      vars: [
        { name: "i", value: i },
        { name: `chars[${i}]`, value: `'${ch}'` },
      ],
      note: {
        vi: `Xu ly ky tu '${ch}' tai index ${i}.`,
        en: `Process character '${ch}' at index ${i}.`,
      },
    });

    if (ch === "(") {
      pushStep({
        title: { vi: "Opening parenthesis", en: "Opening parenthesis" },
        codeLine: 6,
        current: i,
        vars: [{ name: "ch == '('", value: true }],
        note: {
          vi: "Day la dau mo; luu index de cho mot dau ')' o phia sau.",
          en: "This is an opener; save its index for a possible ')' later.",
        },
      });

      stack.push(i);
      pushStep({
        title: { vi: `Push index ${i}`, en: `Push index ${i}` },
        codeLine: 7,
        current: i,
        vars: [
          { name: "pushed index", value: i },
          { name: "action", value: "stack.append(i)" },
        ],
        note: {
          vi: `Index ${i} duoc push. Stack hien tai la ${stackLabel()}.`,
          en: `Push index ${i}. The stack is now ${stackLabel()}.`,
        },
      });
      continue;
    }

    if (ch !== ")") continue;

    pushStep({
      title: { vi: "Closing parenthesis", en: "Closing parenthesis" },
      codeLine: 8,
      current: i,
      vars: [{ name: "ch == ')'", value: true }],
      note: {
        vi: "Day la dau dong; can mot index '(' trong stack de ghep cap.",
        en: "This is a closer; it needs a '(' index from the stack.",
      },
    });

    if (stack.length) {
      pushStep({
        title: { vi: "Matching opener exists", en: "Matching opener exists" },
        codeLine: 9,
        current: i,
        vars: [{ name: "bool(stack)", value: true }],
        note: {
          vi: "Stack khong rong, nen dau ')' nay hop le.",
          en: "The stack is not empty, so this ')' is valid.",
        },
      });

      const openIndex = stack.pop();
      pushStep({
        title: { vi: `Match ${openIndex} with ${i}`, en: `Match ${openIndex} with ${i}` },
        codeLine: 10,
        current: i,
        vars: [
          { name: "open index", value: openIndex },
          { name: "close index", value: i },
          { name: "matched pair", value: `chars[${openIndex}] + chars[${i}] = ()` },
        ],
        note: {
          vi: `Pop index ${openIndex}; '(' tai ${openIndex} ghep voi ')' tai ${i}.`,
          en: `Pop index ${openIndex}; '(' at ${openIndex} matches ')' at ${i}.`,
        },
      });
      continue;
    }

    pushStep({
      title: { vi: "No matching opener", en: "No matching opener" },
      codeLine: 11,
      current: i,
      vars: [{ name: "bool(stack)", value: false }],
      note: {
        vi: `Stack rong, nen ')' tai index ${i} khong hop le va phai bi xoa.`,
        en: `The stack is empty, so ')' at index ${i} is invalid and must be removed.`,
      },
    });

    chars[i] = "";
    removedIndices.add(i);
    pushStep({
      title: { vi: `Remove ')' at ${i}`, en: `Remove ')' at ${i}` },
      codeLine: 12,
      current: i,
      vars: [
        { name: `chars[${i}]`, value: "''" },
        { name: "action", value: `remove index ${i}` },
      ],
      note: {
        vi: `Danh dau index ${i} bang ''. Tren hinh, ky tu bi xoa duoc hien la X.`,
        en: `Mark index ${i} with ''. In the visual, a removed character appears as X.`,
      },
    });
  }

  while (stack.length) {
    const openIndex = stack[stack.length - 1];
    ch = originalChars[openIndex];
    pushStep({
      title: { vi: `Unmatched '(' remains at ${openIndex}`, en: `Unmatched '(' remains at ${openIndex}` },
      codeLine: 14,
      current: openIndex,
      vars: [
        { name: "stack top", value: openIndex },
        { name: "scan complete", value: true },
      ],
      note: {
        vi: `Khong con ')' nao o phia sau de ghep voi '(' tai index ${openIndex}.`,
        en: `No later ')' remains to match '(' at index ${openIndex}.`,
      },
    });

    stack.pop();
    chars[openIndex] = "";
    removedIndices.add(openIndex);
    pushStep({
      title: { vi: `Remove '(' at ${openIndex}`, en: `Remove '(' at ${openIndex}` },
      codeLine: 15,
      current: openIndex,
      vars: [
        { name: "removed index", value: openIndex },
        { name: `chars[${openIndex}]`, value: "''" },
      ],
      note: {
        vi: `Pop index ${openIndex} va danh dau dau '(' khong ghep cap de xoa.`,
        en: `Pop index ${openIndex} and mark the unmatched '(' for removal.`,
      },
    });
  }

  const answer = chars.join("");
  ch = undefined;
  pushStep({
    title: { vi: `Result: "${answer}"`, en: `Result: "${answer}"` },
    codeLine: 17,
    current: chars.length,
    vars: [
      { name: "answer", value: `"${answer}"` },
      { name: "removed count", value: removedIndices.size },
    ],
    note: {
      vi: `Join cac ky tu con lai sau khi xoa index ${removedLabel()}. Ket qua la "${answer}".`,
      en: `Join the remaining characters after removing indices ${removedLabel()}. The result is "${answer}".`,
    },
    final: true,
  });

  return { s, answer, removedIndices: Array.from(removedIndices).sort((a, b) => a - b), steps };
}

/**
 * LeetCode 1963: Minimum Number of Swaps to Make the String Balanced.
 * Match closing brackets with a stack and count those that have no opener.
 */
function buildSteps1963Stack(input) {
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

function buildSteps1963Balance(input) {
  const s = String(input).trim();
  const chars = s.split("");
  const balances = new Array(chars.length).fill(0);
  const swapIndices = [];
  const steps = [];
  let balance = 0;
  let swaps;
  let ch;

  function valueLabel(value) {
    return value === undefined ? "not in scope" : value;
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      arr: balances.slice(),
      sub: chars,
      highlight: current >= 0 && current < chars.length ? [current] : [],
      mark: swapIndices.slice(),
      codeLines: [opts.codeLine],
      codeBlock: 2,
      vars: [
        { name: "balance", value: valueLabel(balance) },
        { name: "swaps", value: valueLabel(swaps) },
        { name: "ch", value: ch === undefined ? "not in scope" : `'${ch}'` },
        { name: "s", value: `"${s}"` },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize balance", en: "Initialize balance" },
    codeLine: 3,
    note: {
      vi: "balance tang voi '[' va giam voi ']'. Balance am nghia la prefix hien tai thua ngoac dong.",
      en: "balance increases for '[' and decreases for ']'. A negative balance means the current prefix has too many closers.",
    },
  });

  swaps = 0;
  pushStep({
    title: { vi: "Initialize swaps", en: "Initialize swaps" },
    codeLine: 4,
    note: {
      vi: "swaps dem so lan can doi mot ']' hien tai voi mot '[' o phia sau.",
      en: "swaps counts how often the current ']' must exchange with a later '['.",
    },
  });

  for (let i = 0; i < chars.length; i++) {
    ch = chars[i];
    pushStep({
      title: { vi: `Read '${ch}'`, en: `Read '${ch}'` },
      codeLine: 6,
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
      balance += 1;
      balances[i] = balance;
      pushStep({
        title: { vi: `balance = ${balance}`, en: `balance = ${balance}` },
        codeLine: 8,
        current: i,
        vars: [{ name: "action", value: "balance += 1" }],
        note: {
          vi: "Gap ngoac mo '[', nen tang balance len 1.",
          en: "An opening '[' increases balance by 1.",
        },
      });
    } else {
      balance -= 1;
      balances[i] = balance;
      pushStep({
        title: { vi: `balance = ${balance}`, en: `balance = ${balance}` },
        codeLine: 10,
        current: i,
        vars: [{ name: "action", value: "balance -= 1" }],
        note: {
          vi: "Gap ngoac dong ']', nen giam balance di 1.",
          en: "A closing ']' decreases balance by 1.",
        },
      });
    }

    if (balance < 0) {
      swaps += 1;
      swapIndices.push(i);
      pushStep({
        title: { vi: `Plan swap #${swaps}`, en: `Plan swap #${swaps}` },
        codeLine: 13,
        current: i,
        vars: [
          { name: "balance < 0", value: true },
          { name: "swap index", value: i },
        ],
        note: {
          vi: `Prefix bi mat can bang tai index ${i}, nen tang swaps len ${swaps}.`,
          en: `The prefix becomes invalid at index ${i}, so increment swaps to ${swaps}.`,
        },
      });

      balance = 1;
      balances[i] = balance;
      pushStep({
        title: { vi: "Reset balance to 1", en: "Reset balance to 1" },
        codeLine: 14,
        current: i,
        vars: [{ name: "action", value: "balance = 1" }],
        note: {
          vi: "Doi ']' hien tai voi mot '[' o phia sau lam contribution thay doi tu -1 thanh +1, nen balance tang 2: -1 -> 1.",
          en: "Swapping the current ']' with a later '[' changes its contribution from -1 to +1, so balance increases by 2: -1 -> 1.",
        },
      });
    }
  }

  const answer = swaps;
  pushStep({
    title: { vi: `Result: ${answer} swap${answer === 1 ? "" : "s"}`, en: `Result: ${answer} swap${answer === 1 ? "" : "s"}` },
    codeLine: 16,
    current: chars.length,
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Greedy da sua moi prefix bi am ngay khi no xuat hien. So swap toi thieu la ${answer}. Balance cuoi co the duong vi code chi dem swap gia lap, khong doi lai cac ky tu o phia sau.`,
      en: `The greedy scan repairs every negative prefix as soon as it appears. The minimum number of swaps is ${answer}. The final balance may be positive because the code counts conceptual swaps without rewriting their later partner characters.`,
    },
    final: true,
  });

  return { s, answer, steps };
}

function buildSteps1963(input, params) {
  const approach = String(params && params.approach ? params.approach : "1");
  if (approach === "2") return buildSteps1963Balance(input);
  return buildSteps1963Stack(input);
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
 * LeetCode 155: Min Stack.
 * Store (value, minimum at this level) so every operation stays O(1).
 */
function buildSteps155(input) {
  const operations = parseDequeOps641(input);
  const stack = [];
  const steps = [];
  const outputs = [];
  let lastResult;

  function operationLabel(op) {
    return `${op.name}(${op.args.join(", ")})`;
  }

  function stackLabel() {
    return stack.length
      ? `[${stack.map((item) => `(${item.value}, ${item.min})`).join(", ")}]`
      : "[]";
  }

  function topLabel() {
    return stack.length ? stack[stack.length - 1].value : "empty";
  }

  function minLabel() {
    return stack.length ? stack[stack.length - 1].min : "empty";
  }

  function resultLabel() {
    return lastResult === undefined || lastResult === null ? "None" : lastResult;
  }

  function stackItems() {
    return stack.map((item) => ({
      value: item.value,
      detail: `min = ${item.min}`,
    }));
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      stackView: {
        title: "Min Stack: (value, minimum)",
        emptyLabel: "empty MinStack",
        items: stackItems(),
        input: operations.map(operationLabel),
        current,
        inputLabel: "Operations",
        status: [
          { label: "top", value: topLabel() },
          { label: "current minimum", value: minLabel() },
          { label: "last output", value: resultLabel() },
        ],
      },
      vars: [
        { name: "stack", value: stackLabel() },
        { name: "top", value: topLabel() },
        { name: "getMin()", value: minLabel() },
        { name: "lastResult", value: resultLabel() },
        { name: "outputs", value: `[${outputs.map((value) => value === null ? "None" : value).join(", ")}]` },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  let startIndex = 0;
  if (operations[0] && operations[0].name === "MinStack") {
    outputs.push(null);
    pushStep({
      title: { vi: "Call MinStack()", en: "Call MinStack()" },
      codeLine: 2,
      current: 0,
      vars: [{ name: "operation", value: "MinStack()" }],
      note: {
        vi: "Constructor tao mot MinStack moi.",
        en: "The constructor creates a new MinStack.",
      },
    });
    startIndex = 1;
  }

  pushStep({
    title: { vi: "Initialize empty stack", en: "Initialize empty stack" },
    codeLine: 3,
    current: operations.length ? 0 : -1,
    note: {
      vi: "Moi entry se luu (value, minimum tinh den entry do).",
      en: "Each entry stores (value, minimum up to that entry).",
    },
  });

  for (let i = startIndex; i < operations.length; i++) {
    const op = operations[i];
    const value = op.args[0];
    lastResult = null;

    if (op.name === "push") {
      pushStep({
        title: { vi: `Call push(${value})`, en: `Call push(${value})` },
        codeLine: 5,
        current: i,
        vars: [
          { name: "operation", value: operationLabel(op) },
          { name: "val", value },
        ],
        note: {
          vi: `Push ${value} va tinh minimum moi truoc khi luu entry.`,
          en: `Push ${value} after computing the new minimum.`,
        },
      });

      const previousMin = stack.length ? stack[stack.length - 1].min : null;
      const currentMin = previousMin === null ? value : Math.min(value, previousMin);
      pushStep({
        title: { vi: `current_min = ${currentMin}`, en: `current_min = ${currentMin}` },
        codeLine: 6,
        current: i,
        vars: [
          { name: "val", value },
          { name: "previous minimum", value: previousMin === null ? "none" : previousMin },
          {
            name: "calculation",
            value: previousMin === null ? `first value -> ${value}` : `min(${value}, ${previousMin}) = ${currentMin}`,
          },
        ],
        note: {
          vi: previousMin === null
            ? `${value} la phan tu dau tien, nen no cung la minimum.`
            : `So sanh ${value} voi minimum cu ${previousMin}; minimum moi la ${currentMin}.`,
          en: previousMin === null
            ? `${value} is the first value, so it is also the minimum.`
            : `Compare ${value} with the previous minimum ${previousMin}; the new minimum is ${currentMin}.`,
        },
      });

      stack.push({ value, min: currentMin });
      outputs.push(null);
      pushStep({
        title: { vi: `Push (${value}, ${currentMin})`, en: `Push (${value}, ${currentMin})` },
        codeLine: 7,
        current: i,
        vars: [
          { name: "entry", value: `(${value}, ${currentMin})` },
          { name: "action", value: "stack.append((val, current_min))" },
        ],
        note: {
          vi: `Entry tren cung luu value = ${value} va minimum hien tai = ${currentMin}.`,
          en: `The new top entry stores value = ${value} and current minimum = ${currentMin}.`,
        },
      });
      continue;
    }

    if (op.name === "pop") {
      pushStep({
        title: { vi: "Call pop()", en: "Call pop()" },
        codeLine: 9,
        current: i,
        vars: [{ name: "operation", value: "pop()" }],
        note: {
          vi: "pop() loai bo toan bo entry tren cung, gom ca value va minimum cua level do.",
          en: "pop() removes the complete top entry, including its value and level minimum.",
        },
      });

      const removed = stack.pop();
      outputs.push(null);
      pushStep({
        title: {
          vi: removed ? `Pop (${removed.value}, ${removed.min})` : "Stack already empty",
          en: removed ? `Pop (${removed.value}, ${removed.min})` : "Stack already empty",
        },
        codeLine: 10,
        current: i,
        vars: [
          { name: "removed", value: removed ? `(${removed.value}, ${removed.min})` : "none" },
          { name: "restored minimum", value: minLabel() },
        ],
        note: {
          vi: removed
            ? `Sau khi bo ${removed.value}, minimum duoc khoi phuc truc tiep tu entry top moi: ${minLabel()}.`
            : "Khong co entry nao de pop.",
          en: removed
            ? `After removing ${removed.value}, the minimum is restored directly from the new top entry: ${minLabel()}.`
            : "There is no entry to pop.",
        },
      });
      continue;
    }

    if (op.name === "top") {
      pushStep({
        title: { vi: "Call top()", en: "Call top()" },
        codeLine: 12,
        current: i,
        vars: [{ name: "operation", value: "top()" }],
        note: {
          vi: "top() chi doc value cua entry tren cung.",
          en: "top() reads only the value from the top entry.",
        },
      });

      lastResult = stack.length ? stack[stack.length - 1].value : null;
      outputs.push(lastResult);
      pushStep({
        title: { vi: `top() -> ${resultLabel()}`, en: `top() -> ${resultLabel()}` },
        codeLine: 13,
        current: i,
        vars: [{ name: "return", value: resultLabel() }],
        note: {
          vi: `Gia tri cua entry top la ${resultLabel()}.`,
          en: `The value stored in the top entry is ${resultLabel()}.`,
        },
      });
      continue;
    }

    if (op.name === "getMin") {
      pushStep({
        title: { vi: "Call getMin()", en: "Call getMin()" },
        codeLine: 15,
        current: i,
        vars: [{ name: "operation", value: "getMin()" }],
        note: {
          vi: "getMin() chi doc minimum da luu trong entry top, khong can duyet lai stack.",
          en: "getMin() reads the minimum stored in the top entry without scanning the stack.",
        },
      });

      lastResult = stack.length ? stack[stack.length - 1].min : null;
      outputs.push(lastResult);
      pushStep({
        title: { vi: `getMin() -> ${resultLabel()}`, en: `getMin() -> ${resultLabel()}` },
        codeLine: 16,
        current: i,
        vars: [{ name: "return", value: resultLabel() }],
        note: {
          vi: `Minimum hien tai duoc lay trong O(1): ${resultLabel()}.`,
          en: `The current minimum is returned in O(1): ${resultLabel()}.`,
        },
      });
    }
  }

  pushStep({
    title: { vi: "Finished operations", en: "Finished operations" },
    codeLine: 16,
    current: operations.length,
    final: true,
    vars: [
      { name: "answer", value: resultLabel() },
      { name: "all outputs", value: `[${outputs.map((value) => value === null ? "None" : value).join(", ")}]` },
    ],
    note: {
      vi: `Da xu ly tat ca operations. Stack cuoi = ${stackLabel()}.`,
      en: `All operations are complete. Final stack = ${stackLabel()}.`,
    },
  });

  return { operations, outputs, answer: lastResult, steps };
}

/**
 * LeetCode 636: Exclusive Time of Functions.
 * Track the active nested calls with a stack and assign each elapsed interval.
 */
function buildSteps636(input, params) {
  const logs = Array.isArray(input)
    ? input.map((log) => String(log).trim())
    : String(input).split(",").map((log) => log.trim()).filter(Boolean);
  const inferredN = logs.reduce((maxId, log) => {
    const id = Number(log.split(":")[0]);
    return Number.isInteger(id) ? Math.max(maxId, id + 1) : maxId;
  }, 0);
  const nValue = Number(params && params.n);
  const n = Number.isInteger(nValue) && nValue > 0 ? nValue : Math.max(1, inferredN);
  const answer = new Array(n).fill(0);
  const stack = [];
  const steps = [];
  let prevTime;
  let currentLog;
  let functionId;
  let event;
  let timestamp;

  function valueLabel(value) {
    return value === undefined ? "not in scope" : value;
  }

  function stackLabel() {
    return `[${stack.join(", ")}]`;
  }

  function answerLabel() {
    return `[${answer.join(", ")}]`;
  }

  function activeLabel() {
    return stack.length ? `function ${stack[stack.length - 1]}` : "CPU idle";
  }

  function stackItems() {
    return stack.map((id, index) => ({
      value: `function ${id}`,
      detail: index === stack.length - 1 ? "running" : "paused",
    }));
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    steps.push({
      title: opts.title,
      codeLines: [opts.codeLine],
      stackView: {
        title: "Function call stack",
        emptyLabel: "no active function",
        items: stackItems(),
        input: logs,
        current,
        inputLabel: "Execution logs",
        status: [
          { label: "active", value: activeLabel() },
          { label: "prev_time", value: valueLabel(prevTime) },
          { label: "exclusive times", value: answerLabel() },
        ],
      },
      vars: [
        { name: "answer", value: answerLabel() },
        { name: "stack", value: stackLabel() },
        { name: "prev_time", value: valueLabel(prevTime) },
        { name: "log", value: currentLog === undefined ? "not in scope" : `"${currentLog}"` },
        { name: "function_id", value: valueLabel(functionId) },
        { name: "event", value: event === undefined ? "not in scope" : `"${event}"` },
        { name: "timestamp", value: valueLabel(timestamp) },
        { name: "active function", value: activeLabel() },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  pushStep({
    title: { vi: "Initialize answer", en: "Initialize answer" },
    codeLine: 3,
    vars: [
      { name: "n", value: n },
      { name: "answer", value: `[0] * ${n} = ${answerLabel()}` },
    ],
    note: {
      vi: `answer[id] se luu exclusive time cua moi function. Ban dau ca ${n} gia tri bang 0.`,
      en: `answer[id] stores each function's exclusive time. All ${n} values start at 0.`,
    },
  });

  pushStep({
    title: { vi: "Initialize call stack", en: "Initialize call stack" },
    codeLine: 4,
    note: {
      vi: "Stack luu cac function dang active; top la function hien dang chiem CPU.",
      en: "The stack stores active calls; its top is the function currently using the CPU.",
    },
  });

  prevTime = 0;
  pushStep({
    title: { vi: "Initialize prev_time", en: "Initialize prev_time" },
    codeLine: 5,
    note: {
      vi: "prev_time la dau moc cua khoang thoi gian chua duoc cong cho function nao.",
      en: "prev_time marks the beginning of the elapsed interval that has not yet been assigned.",
    },
  });

  for (let i = 0; i < logs.length; i++) {
    currentLog = logs[i];
    functionId = undefined;
    event = undefined;
    timestamp = undefined;
    pushStep({
      title: { vi: `Read log ${i}`, en: `Read log ${i}` },
      codeLine: 7,
      current: i,
      vars: [
        { name: "i", value: i },
        { name: `logs[${i}]`, value: `"${currentLog}"` },
      ],
      note: {
        vi: `Xu ly logs[${i}] = "${currentLog}".`,
        en: `Process logs[${i}] = "${currentLog}".`,
      },
    });

    const parts = currentLog.split(":");
    functionId = parts[0];
    event = parts[1];
    timestamp = parts[2];
    pushStep({
      title: { vi: `Split "${currentLog}"`, en: `Split "${currentLog}"` },
      codeLine: 8,
      current: i,
      vars: [
        { name: "raw function_id", value: `"${functionId}"` },
        { name: "raw event", value: `"${event}"` },
        { name: "raw timestamp", value: `"${timestamp}"` },
      ],
      note: {
        vi: "Tach log thanh function_id, event start/end va timestamp.",
        en: "Split the log into function_id, start/end event, and timestamp.",
      },
    });

    functionId = Number(functionId);
    timestamp = Number(timestamp);
    pushStep({
      title: { vi: `Parse id=${functionId}, time=${timestamp}`, en: `Parse id=${functionId}, time=${timestamp}` },
      codeLine: 9,
      current: i,
      vars: [
        { name: "int(function_id)", value: functionId },
        { name: "int(timestamp)", value: timestamp },
      ],
      note: {
        vi: "Chuyen function_id va timestamp sang integer de tinh toan.",
        en: "Convert function_id and timestamp to integers for arithmetic.",
      },
    });

    if (event === "start") {
      pushStep({
        title: { vi: `Function ${functionId} starts`, en: `Function ${functionId} starts` },
        codeLine: 11,
        current: i,
        vars: [{ name: "event == 'start'", value: true }],
        note: {
          vi: `Function ${functionId} bat dau tai timestamp ${timestamp}.`,
          en: `Function ${functionId} starts at timestamp ${timestamp}.`,
        },
      });

      if (stack.length) {
        const activeId = stack[stack.length - 1];
        pushStep({
          title: { vi: `Pause function ${activeId}`, en: `Pause function ${activeId}` },
          codeLine: 12,
          current: i,
          vars: [
            { name: "stack is not empty", value: true },
            { name: "paused function", value: activeId },
          ],
          note: {
            vi: `Function ${activeId} dang chay se bi function ${functionId} tam dung.`,
            en: `Running function ${activeId} is paused by function ${functionId}.`,
          },
        });

        const elapsed = timestamp - prevTime;
        answer[activeId] += elapsed;
        pushStep({
          title: { vi: `Credit function ${activeId}: +${elapsed}`, en: `Credit function ${activeId}: +${elapsed}` },
          codeLine: 13,
          current: i,
          vars: [
            { name: "credited function", value: activeId },
            { name: "elapsed", value: `${timestamp} - ${prevTime} = ${elapsed}` },
            { name: `answer[${activeId}]`, value: answer[activeId] },
          ],
          note: {
            vi: `Cong khoang [${prevTime}, ${timestamp}) dai ${elapsed} cho function ${activeId}.`,
            en: `Credit interval [${prevTime}, ${timestamp}), length ${elapsed}, to function ${activeId}.`,
          },
        });
      }

      stack.push(functionId);
      pushStep({
        title: { vi: `Push function ${functionId}`, en: `Push function ${functionId}` },
        codeLine: 14,
        current: i,
        vars: [
          { name: "pushed", value: functionId },
          { name: "new active function", value: functionId },
        ],
        note: {
          vi: `Push function ${functionId}; no tro thanh top va bat dau chiem CPU.`,
          en: `Push function ${functionId}; it becomes the top call and starts using the CPU.`,
        },
      });

      prevTime = timestamp;
      pushStep({
        title: { vi: `prev_time = ${timestamp}`, en: `prev_time = ${timestamp}` },
        codeLine: 15,
        current: i,
        vars: [{ name: "action", value: `prev_time = ${timestamp}` }],
        note: {
          vi: "Khoang chua tinh tiep theo bat dau tai timestamp cua log start.",
          en: "The next unassigned interval begins at the start timestamp.",
        },
      });
      continue;
    }

    pushStep({
      title: { vi: `Function ${functionId} ends`, en: `Function ${functionId} ends` },
      codeLine: 16,
      current: i,
      vars: [{ name: "event == 'end'", value: true }],
      note: {
        vi: `Function ${functionId} ket thuc tai timestamp ${timestamp}, va timestamp end duoc tinh inclusive.`,
        en: `Function ${functionId} ends at timestamp ${timestamp}, and an end timestamp is inclusive.`,
      },
    });

    const finished = stack.pop();
    pushStep({
      title: { vi: `Pop function ${finished}`, en: `Pop function ${finished}` },
      codeLine: 17,
      current: i,
      vars: [
        { name: "finished", value: finished },
        { name: "resumed function", value: stack.length ? stack[stack.length - 1] : "none" },
      ],
      note: {
        vi: `Function ${finished} da hoan tat, nen pop khoi call stack.`,
        en: `Function ${finished} has completed, so pop it from the call stack.`,
      },
    });

    const elapsed = timestamp - prevTime + 1;
    if (Number.isInteger(finished) && finished >= 0 && finished < answer.length) {
      answer[finished] += elapsed;
    }
    pushStep({
      title: { vi: `Credit function ${finished}: +${elapsed}`, en: `Credit function ${finished}: +${elapsed}` },
      codeLine: 18,
      current: i,
      vars: [
        { name: "finished", value: finished },
        { name: "inclusive duration", value: `${timestamp} - ${prevTime} + 1 = ${elapsed}` },
        { name: `answer[${finished}]`, value: answer[finished] },
      ],
      note: {
        vi: `Log end inclusive, nen tinh ca timestamp ${timestamp}: ${timestamp} - ${prevTime} + 1 = ${elapsed}.`,
        en: `The end log is inclusive, so timestamp ${timestamp} counts: ${timestamp} - ${prevTime} + 1 = ${elapsed}.`,
      },
    });

    prevTime = timestamp + 1;
    pushStep({
      title: { vi: `prev_time = ${prevTime}`, en: `prev_time = ${prevTime}` },
      codeLine: 19,
      current: i,
      vars: [{ name: "calculation", value: `${timestamp} + 1 = ${prevTime}` }],
      note: {
        vi: `Timestamp ${timestamp} da duoc tinh cho function ket thuc, nen khoang moi bat dau tai ${prevTime}.`,
        en: `Timestamp ${timestamp} was assigned to the finished function, so the next interval begins at ${prevTime}.`,
      },
    });
  }

  pushStep({
    title: { vi: `Result: ${answerLabel()}`, en: `Result: ${answerLabel()}` },
    codeLine: 21,
    current: logs.length,
    vars: [{ name: "return", value: answerLabel() }],
    note: {
      vi: `Moi khoang CPU da duoc gan dung mot lan. Exclusive times cuoi la ${answerLabel()}.`,
      en: `Every CPU interval was assigned exactly once. The final exclusive times are ${answerLabel()}.`,
    },
    final: true,
  });

  return { n, logs, answer, steps };
}

/**
 * LeetCode 1081: Smallest Subsequence of Distinct Characters.
 * Build the lexicographically smallest valid answer with a monotonic stack.
 */
function buildSteps1081(input, params) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const chars = s.split("");
  const approach = Number(params && params.approach) === 2 ? 2 : 1;
  const usesFrequency = approach === 2;
  const last = new Map();
  const freq = new Map(chars.map((ch) => [ch, 0]));
  const stack = [];
  const used = new Set();
  const steps = [];

  chars.forEach((ch, index) => last.set(ch, index));

  function stackLabel() {
    return `[${stack.map((item) => item.ch).join(", ")}]`;
  }

  function usedLabel() {
    return `{${[...used].sort().join(", ")}}`;
  }

  function lastLabel() {
    return `{${[...last.entries()].map(([ch, index]) => `${ch}: ${index}`).join(", ")}}`;
  }

  function freqLabel() {
    return `{${[...freq.entries()].map(([ch, count]) => `${ch}: ${count}`).join(", ")}}`;
  }

  function pushStep(opts) {
    const current = Number.isInteger(opts.current) ? opts.current : -1;
    const top = stack.length ? stack[stack.length - 1].ch : null;
    steps.push({
      title: opts.title,
      arr: chars.map((ch) => ch.charCodeAt(0)),
      sub: chars,
      highlight: current >= 0 && current < chars.length ? [current] : [],
      mark: stack.map((item) => item.index),
      codeLines: opts.codeLines || [opts.codeLine],
      codeBlock: approach,
      stackView: {
        title: "Monotonic stack",
        emptyLabel: "empty stack",
        items: stack.map((item) => ({
          value: item.ch,
          detail: usesFrequency
            ? `picked at ${item.index}, remaining ${freq.get(item.ch)}`
            : `picked at ${item.index}, last at ${last.get(item.ch)}`,
        })),
        input: chars,
        inputLabel: "Input s (character / index)",
        current,
        status: [
          { label: "current", value: current >= 0 && current < chars.length ? `'${chars[current]}' @ ${current}` : "-" },
          { label: "top", value: top === null ? "empty" : `'${top}'` },
          { label: usesFrequency ? "vis" : "used", value: usedLabel() },
          { label: "answer so far", value: stack.map((item) => item.ch).join("") || "empty" },
        ],
      },
      vars: [
        { name: "stack", value: stackLabel() },
        { name: usesFrequency ? "vis" : "used", value: usedLabel() },
        { name: usesFrequency ? "freq" : "last", value: usesFrequency ? freqLabel() : lastLabel() },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  if (usesFrequency) {
    pushStep({
      title: { vi: "Khởi tạo freq bằng 0", en: "Initialize freq with zero counts" },
      codeLine: 3,
      vars: [{ name: "s", value: `"${s}"` }],
      note: {
        vi: "Tạo một key cho mỗi ký tự khác nhau. Vòng lặp kế tiếp sẽ đếm tổng số lần xuất hiện.",
        en: "Create one key for every distinct character. The next loop counts all occurrences.",
      },
    });
    pushStep({
      title: { vi: "Khởi tạo vis rỗng", en: "Initialize an empty vis set" },
      codeLine: 4,
      note: {
        vi: "vis đảm bảo mỗi ký tự chỉ xuất hiện một lần trong stack.",
        en: "vis ensures that every character appears in the stack at most once.",
      },
    });
    pushStep({
      title: { vi: "Khởi tạo stack rỗng", en: "Initialize an empty stack" },
      codeLine: 5,
      note: {
        vi: "Stack sẽ chứa subsequence nhỏ nhất đang xây dựng.",
        en: "The stack will hold the smallest subsequence built so far.",
      },
    });
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      pushStep({
        title: { vi: `Đếm '${ch}' tại index ${i}`, en: `Count '${ch}' at index ${i}` },
        codeLine: 7,
        current: i,
        vars: [{ name: "ch", value: `'${ch}'` }],
        note: {
          vi: `Bắt đầu lượt đếm cho s[${i}] = '${ch}'.`,
          en: `Begin the counting iteration for s[${i}] = '${ch}'.`,
        },
      });
      freq.set(ch, freq.get(ch) + 1);
      pushStep({
        title: { vi: `freq['${ch}'] = ${freq.get(ch)}`, en: `freq['${ch}'] = ${freq.get(ch)}` },
        codeLine: 8,
        current: i,
        vars: [{ name: `freq['${ch}']`, value: freq.get(ch) }],
        note: {
          vi: `Đã đếm ${freq.get(ch)} lần xuất hiện của '${ch}'.`,
          en: `Counted ${freq.get(ch)} occurrence(s) of '${ch}'.`,
        },
      });
    }
  } else {
    pushStep({
      title: { vi: "Tính vị trí cuối của mỗi ký tự", en: "Record each character's last index" },
      codeLine: 3,
      vars: [{ name: "s", value: `"${s}"` }],
      note: {
        vi: "last[ch] cho biết sau vị trí hiện tại còn cơ hội gặp lại ch hay không. Chỉ được pop một ký tự khi nó vẫn xuất hiện ở phía sau.",
        en: "last[ch] tells whether ch appears again later. A character may be popped only when another copy remains ahead.",
      },
    });
    pushStep({
      title: { vi: "Khởi tạo stack rỗng", en: "Initialize an empty stack" },
      codeLine: 4,
      note: {
        vi: "Stack sẽ chứa subsequence nhỏ nhất đang xây dựng; thứ tự trong stack luôn giữ đúng thứ tự xuất hiện trong s.",
        en: "The stack holds the smallest subsequence built so far while preserving the order from s.",
      },
    });
    pushStep({
      title: { vi: "Khởi tạo used rỗng", en: "Initialize an empty used set" },
      codeLine: 5,
      note: {
        vi: "used giúp mỗi ký tự chỉ xuất hiện một lần trong stack.",
        en: "used ensures that every character appears in the stack at most once.",
      },
    });
  }

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    pushStep({
      title: { vi: `Đọc s[${i}] = '${ch}'`, en: `Read s[${i}] = '${ch}'` },
      codeLine: usesFrequency ? 10 : 6,
      current: i,
      vars: [
        { name: "i", value: i },
        { name: "ch", value: `'${ch}'` },
        { name: usesFrequency ? "freq[ch] before" : "last[ch]", value: usesFrequency ? freq.get(ch) : last.get(ch) },
      ],
      note: {
        vi: `Xử lý ký tự '${ch}' tại index ${i}.`,
        en: `Process character '${ch}' at index ${i}.`,
      },
    });

    if (usesFrequency) {
      const before = freq.get(ch);
      freq.set(ch, before - 1);
      pushStep({
        title: { vi: `freq['${ch}'] giảm còn ${freq.get(ch)}`, en: `Decrease freq['${ch}'] to ${freq.get(ch)}` },
        codeLine: 11,
        current: i,
        vars: [
          { name: "before", value: before },
          { name: "after", value: freq.get(ch) },
          { name: "meaning", value: "copies after current index" },
        ],
        note: {
          vi: `Giảm trước khi xử lý để freq['${ch}'] chỉ còn số bản sao nằm sau index ${i}.`,
          en: `Decrement before processing so freq['${ch}'] counts only copies after index ${i}.`,
        },
      });
    }

    const alreadyUsed = used.has(ch);
    pushStep({
      title: { vi: `'${ch}' ${alreadyUsed ? "đã" : "chưa"} có trong ${usesFrequency ? "vis" : "used"}`, en: `'${ch}' is ${alreadyUsed ? "already" : "not"} in ${usesFrequency ? "vis" : "used"}` },
      codeLine: usesFrequency ? 12 : 7,
      current: i,
      vars: [
        { name: usesFrequency ? "ch in vis" : "ch in used", value: alreadyUsed },
        { name: "decision", value: alreadyUsed ? "continue" : "check stack" },
      ],
      note: {
        vi: alreadyUsed
          ? `'${ch}' đã nằm trong subsequence, nên không được thêm lần thứ hai.`
          : `'${ch}' chưa có trong subsequence; có thể thử loại các ký tự lớn hơn ở stack top.`,
        en: alreadyUsed
          ? `'${ch}' is already in the subsequence, so it must not be added again.`
          : `'${ch}' is not in the subsequence; larger characters at the stack top may be removable.`,
      },
    });

    if (alreadyUsed) {
      pushStep({
        title: { vi: `Bỏ qua '${ch}'`, en: `Skip '${ch}'` },
        codeLine: usesFrequency ? 13 : 8,
        current: i,
        vars: [{ name: "action", value: "continue" }],
        note: {
          vi: `Giữ nguyên stack ${stackLabel()} và chuyển sang ký tự kế tiếp.`,
          en: `Keep stack ${stackLabel()} unchanged and move to the next character.`,
        },
      });
      continue;
    }

    while (true) {
      const topItem = stack.length ? stack[stack.length - 1] : null;
      const hasTop = topItem !== null;
      const smaller = hasTop && ch < topItem.ch;
      const topAppearsAgain = hasTop && (usesFrequency ? freq.get(topItem.ch) > 0 : i < last.get(topItem.ch));
      const shouldPop = hasTop && smaller && topAppearsAgain;
      let failedReason;
      if (!hasTop) failedReason = "stack is empty";
      else if (!smaller) failedReason = `'${ch}' >= '${topItem.ch}'`;
      else failedReason = usesFrequency
        ? `freq['${topItem.ch}'] = 0`
        : `'${topItem.ch}' has no copy after index ${i}`;

      pushStep({
        title: { vi: shouldPop ? `Có thể pop '${topItem.ch}'` : "Dừng vòng while", en: shouldPop ? `Can pop '${topItem.ch}'` : "Stop the while loop" },
        codeLine: usesFrequency ? 14 : 9,
        current: i,
        vars: [
          { name: "bool(stack)", value: hasTop },
          { name: "ch < stack[-1]", value: hasTop ? `${ch} < ${topItem.ch} = ${smaller}` : "not evaluated" },
          {
            name: usesFrequency ? "freq[stack[-1]] > 0" : "i < last[stack[-1]]",
            value: hasTop
              ? usesFrequency
                ? `${freq.get(topItem.ch)} > 0 = ${topAppearsAgain}`
                : `${i} < ${last.get(topItem.ch)} = ${topAppearsAgain}`
              : "not evaluated",
          },
          { name: "while condition", value: shouldPop },
          ...(!shouldPop ? [{ name: "failed at", value: failedReason }] : []),
        ],
        note: {
          vi: shouldPop
            ? usesFrequency
              ? `'${ch}' nhỏ hơn top '${topItem.ch}', và freq['${topItem.ch}'] = ${freq.get(topItem.ch)} > 0. Pop top sẽ làm đáp án nhỏ hơn mà không làm mất ký tự.`
              : `'${ch}' nhỏ hơn top '${topItem.ch}', và '${topItem.ch}' còn xuất hiện tại index ${last.get(topItem.ch)}. Pop top sẽ làm đáp án nhỏ hơn mà không làm mất ký tự.`
            : `Không pop: ${failedReason}.`,
          en: shouldPop
            ? usesFrequency
              ? `'${ch}' is smaller than top '${topItem.ch}', and freq['${topItem.ch}'] = ${freq.get(topItem.ch)} > 0. Popping improves the answer without losing that character.`
              : `'${ch}' is smaller than top '${topItem.ch}', and '${topItem.ch}' appears again at index ${last.get(topItem.ch)}. Popping improves the answer without losing that character.`
            : `Do not pop: ${failedReason}.`,
        },
      });

      if (!shouldPop) break;

      const removed = stack.pop();
      used.delete(removed.ch);
      pushStep({
        title: { vi: `Pop '${removed.ch}' và xóa khỏi ${usesFrequency ? "vis" : "used"}`, en: `Pop '${removed.ch}' and remove it from ${usesFrequency ? "vis" : "used"}` },
        codeLine: usesFrequency ? 15 : 10,
        current: i,
        vars: [
          { name: "removed", value: `'${removed.ch}' from index ${removed.index}` },
          {
            name: "future copy",
            value: usesFrequency ? `${freq.get(removed.ch)} remaining` : `last index ${last.get(removed.ch)}`,
          },
        ],
        note: {
          vi: `'${removed.ch}' đã rời stack nên cũng phải xóa khỏi ${usesFrequency ? "vis" : "used"}; lần xuất hiện sau của nó có thể được push lại.`,
          en: `'${removed.ch}' left the stack, so it must also leave ${usesFrequency ? "vis" : "used"}; its later occurrence may be pushed again.`,
        },
      });
    }

    stack.push({ ch, index: i });
    pushStep({
      title: { vi: `Push '${ch}' vào stack`, en: `Push '${ch}' onto the stack` },
      codeLine: usesFrequency ? 16 : 11,
      current: i,
      vars: [{ name: "action", value: `stack.append('${ch}')` }],
      note: {
        vi: `Thêm '${ch}' sau khi đã loại hết các top lớn hơn nhưng vẫn có thể gặp lại.`,
        en: `Append '${ch}' after removing every larger top character that can still be found later.`,
      },
    });

    used.add(ch);
    pushStep({
      title: { vi: `Thêm '${ch}' vào ${usesFrequency ? "vis" : "used"}`, en: `Add '${ch}' to ${usesFrequency ? "vis" : "used"}` },
      codeLine: usesFrequency ? 17 : 12,
      current: i,
      vars: [{ name: "action", value: `${usesFrequency ? "vis" : "used"}.add('${ch}')` }],
      note: {
        vi: `Đánh dấu '${ch}' đã nằm trong stack để các bản sao phía sau được bỏ qua.`,
        en: `Mark '${ch}' as present in the stack so later duplicates are skipped.`,
      },
    });
  }

  const answer = stack.map((item) => item.ch).join("");
  pushStep({
    title: { vi: `Kết quả: "${answer}"`, en: `Result: "${answer}"` },
    codeLine: usesFrequency ? 19 : 13,
    current: chars.length,
    vars: [{ name: "answer", value: `"${answer}"` }],
    note: {
      vi: `Nối stack từ đáy lên đỉnh được "${answer}": đủ mọi ký tự đúng một lần và nhỏ nhất theo thứ tự từ điển.`,
      en: `Joining the stack from bottom to top gives "${answer}": every distinct character exactly once in lexicographically smallest order.`,
    },
    final: true,
  });

  return { s, answer, steps };
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

/**
 * LeetCode 3499: Maximize Active Section with Trade I.
 *
 * The string s is conceptually surrounded by imaginary '1's on both ends.
 * A "trade" removes one block of '1's (surrounded by '0's) and converts one
 * block of '0's (surrounded by '1's) into '1's. Since removing a '1'-block
 * merges its two neighboring '0'-blocks into one, the best possible gain is
 * simply the largest sum of two ADJACENT '0' segments (separated by exactly
 * one '1' segment). Answer = (count of existing '1's) + (that best sum).
 */
function buildSteps3499(input) {
  const s = String(input || "").trim();
  const n = s.length;
  const steps = [];

  if (n === 0) {
    steps.push({
      title: { vi: "Chuỗi rỗng", en: "Empty string" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Chuỗi rỗng → 0 khu vực hoạt động.", en: "Empty string → 0 active sections." },
    });
    return { original: s, answer: 0, steps };
  }

  const chars = s.split("");
  const values = chars.map((c) => (c === "1" ? 1 : 0.4));

  let ans = 0;
  let mx = 0;
  let pre = -Infinity;
  let index = 0;

  const preStr = () => (pre === -Infinity ? "-inf" : pre);

  // Line 3: n = len(s)
  steps.push({
    title: { vi: "n = len(s)", en: "n = len(s)" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "n", value: n },
    ],
    note: {
      vi: `s = "${s}". Coi như có '1' ảo ở 2 đầu. n = ${n}.`,
      en: `s = "${s}". Treated as if surrounded by imaginary '1's. n = ${n}.`,
    },
  });

  // Line 4: ans = 0
  steps.push({
    title: { vi: "ans = 0", en: "ans = 0" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [4],
    vars: [{ name: "ans", value: ans }],
    note: {
      vi: "ans sẽ đếm tổng số '1' hiện có trong s.",
      en: "ans will accumulate the total count of existing '1's in s.",
    },
  });

  // Line 5: index = 0
  steps.push({
    title: { vi: "index = 0", en: "index = 0" },
    arr: values,
    sub: chars,
    highlight: [0],
    mark: [],
    codeLines: [5],
    vars: [{ name: "index", value: index }],
    note: {
      vi: "index là con trỏ bắt đầu của đoạn hiện tại.",
      en: "index is the start pointer of the current segment.",
    },
  });

  // Line 6: pre = float('-inf')
  steps.push({
    title: { vi: "pre = -inf", en: "pre = -inf" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [6],
    vars: [{ name: "pre", value: "-inf" }],
    note: {
      vi: "pre = độ dài đoạn '0' liền trước. -inf đảm bảo đoạn '0' đầu tiên không tính gain sai.",
      en: "pre = length of the previous '0' segment. -inf ensures the first '0' segment doesn't wrongly count a gain.",
    },
  });

  // Line 7: mx = 0
  steps.push({
    title: { vi: "mx = 0", en: "mx = 0" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [7],
    vars: [{ name: "mx", value: mx }],
    note: {
      vi: "mx = gain tốt nhất có thể đạt được từ 1 lần trade (tổng 2 đoạn '0' liền kề).",
      en: "mx = best possible gain from one trade (sum of two adjacent '0' segments).",
    },
  });

  while (index < n) {
    // Line 9: while index < n
    steps.push({
      title: { vi: `while index=${index} < n=${n} → True`, en: `while index=${index} < n=${n} → True` },
      arr: values,
      sub: chars,
      highlight: [index],
      mark: [],
      codeLines: [9],
      vars: [
        { name: "index", value: index },
        { name: "n", value: n },
      ],
      note: {
        vi: `index=${index} < n=${n} → còn ký tự để xét, tiếp tục vòng lặp.`,
        en: `index=${index} < n=${n} → characters remain, continue looping.`,
      },
    });

    // Line 10: end = index + 1
    let segmentEnd = index + 1;
    steps.push({
      title: { vi: `end = index + 1 = ${segmentEnd}`, en: `end = index + 1 = ${segmentEnd}` },
      arr: values,
      sub: chars,
      highlight: [index],
      mark: [],
      codeLines: [10],
      vars: [
        { name: "index", value: index },
        { name: "end", value: segmentEnd },
      ],
      note: {
        vi: "end bắt đầu quét từ ký tự kế tiếp để tìm cuối đoạn liên tiếp.",
        en: "end starts scanning from the next character to find the end of the run.",
      },
    });

    // Line 11-12: inner while — scan forward while same char
    while (segmentEnd < n && s[segmentEnd] === s[index]) {
      steps.push({
        title: { vi: `while s[${segmentEnd}]='${s[segmentEnd]}' == s[${index}]='${s[index]}' → True`, en: `while s[${segmentEnd}]='${s[segmentEnd]}' == s[${index}]='${s[index]}' → True` },
        arr: values,
        sub: chars,
        highlight: Array.from({ length: segmentEnd - index + 1 }, (_, k) => index + k),
        mark: [],
        codeLines: [11],
        vars: [
          { name: "end", value: segmentEnd },
          { name: `s[${segmentEnd}]`, value: s[segmentEnd] },
          { name: `s[${index}]`, value: s[index] },
        ],
        note: {
          vi: `s[${segmentEnd}] giống s[${index}] → cùng đoạn, mở rộng end.`,
          en: `s[${segmentEnd}] matches s[${index}] → same segment, extend end.`,
        },
      });

      segmentEnd++;
      steps.push({
        title: { vi: `end += 1 → end = ${segmentEnd}`, en: `end += 1 → end = ${segmentEnd}` },
        arr: values,
        sub: chars,
        highlight: Array.from({ length: segmentEnd - index }, (_, k) => index + k),
        mark: [],
        codeLines: [12],
        vars: [{ name: "end", value: segmentEnd }],
        note: {
          vi: `end = ${segmentEnd}. Tiếp tục kiểm tra ký tự kế tiếp.`,
          en: `end = ${segmentEnd}. Continue checking the next character.`,
        },
      });
    }

    // Show the (now False) while check that exits the inner loop, unless we
    // never entered it (segment of length 1) — still show it once for clarity.
    steps.push({
      title: {
        vi: segmentEnd < n
          ? `while s[${segmentEnd}]='${s[segmentEnd]}' == s[${index}]='${s[index]}' → False`
          : `while end=${segmentEnd} < n=${n} → False`,
        en: segmentEnd < n
          ? `while s[${segmentEnd}]='${s[segmentEnd]}' == s[${index}]='${s[index]}' → False`
          : `while end=${segmentEnd} < n=${n} → False`,
      },
      arr: values,
      sub: chars,
      highlight: Array.from({ length: segmentEnd - index }, (_, k) => index + k),
      mark: [],
      codeLines: [11],
      vars: [{ name: "end", value: segmentEnd }],
      note: {
        vi: "Đoạn liên tiếp kết thúc tại đây. Thoát vòng lặp trong.",
        en: "The consecutive run ends here. Exit the inner loop.",
      },
    });

    // Line 13: cur = end - index
    const curLen = segmentEnd - index;
    const range = Array.from({ length: curLen }, (_, k) => index + k);
    steps.push({
      title: { vi: `cur = end - index = ${segmentEnd} - ${index} = ${curLen}`, en: `cur = end - index = ${segmentEnd} - ${index} = ${curLen}` },
      arr: values,
      sub: chars,
      highlight: range,
      mark: [],
      codeLines: [13],
      vars: [
        { name: "end", value: segmentEnd },
        { name: "index", value: index },
        { name: "cur", value: curLen },
      ],
      note: {
        vi: `Đoạn [${index}..${segmentEnd - 1}] = "${s.slice(index, segmentEnd)}", độ dài cur = ${curLen}.`,
        en: `Segment [${index}..${segmentEnd - 1}] = "${s.slice(index, segmentEnd)}", length cur = ${curLen}.`,
      },
    });

    // Line 15: if s[index] == '1'
    const isOne = s[index] === "1";
    steps.push({
      title: { vi: `if s[${index}]='${s[index]}' == '1' → ${isOne}`, en: `if s[${index}]='${s[index]}' == '1' → ${isOne}` },
      arr: values,
      sub: chars,
      highlight: range,
      mark: [],
      codeLines: [15],
      vars: [{ name: `s[${index}]`, value: s[index] }, { name: "is '1'?", value: isOne }],
      note: isOne
        ? { vi: `s[${index}]='1' → đây là đoạn '1', cộng vào ans.`, en: `s[${index}]='1' → this is a '1' segment, add to ans.` }
        : { vi: `s[${index}]='0' → đây là đoạn '0', vào nhánh else.`, en: `s[${index}]='0' → this is a '0' segment, go to else branch.` },
    });

    if (isOne) {
      // Line 16: ans += cur
      const oldAns = ans;
      ans += curLen;
      steps.push({
        title: { vi: `ans += cur → ans = ${oldAns} + ${curLen} = ${ans}`, en: `ans += cur → ans = ${oldAns} + ${curLen} = ${ans}` },
        arr: values,
        sub: chars,
        highlight: range,
        mark: [],
        codeLines: [16],
        vars: [
          { name: "ans (before)", value: oldAns },
          { name: "cur", value: curLen },
          { name: "ans (after)", value: ans },
        ],
        note: {
          vi: `Đoạn '1' dài ${curLen} là số '1' có sẵn → ans = ${oldAns} + ${curLen} = ${ans}.`,
          en: `The '1' segment of length ${curLen} is existing active sections → ans = ${oldAns} + ${curLen} = ${ans}.`,
        },
      });
    } else {
      // Line 18: mx = max(mx, pre + cur)
      const oldMx = mx;
      const preBefore = preStr();
      const candidate = pre + curLen;
      mx = Math.max(mx, candidate);
      const updated = mx !== oldMx;
      steps.push({
        title: { vi: `mx = max(mx, pre+cur) = max(${oldMx}, ${preBefore}+${curLen}) = ${mx}`, en: `mx = max(mx, pre+cur) = max(${oldMx}, ${preBefore}+${curLen}) = ${mx}` },
        arr: values,
        sub: chars,
        highlight: range,
        mark: updated ? range : [],
        codeLines: [18],
        vars: [
          { name: "mx (before)", value: oldMx },
          { name: "pre", value: preBefore },
          { name: "cur", value: curLen },
          { name: "pre+cur", value: pre === -Infinity ? "-inf" : candidate },
          { name: "mx (after)", value: mx },
        ],
        note: {
          vi: pre === -Infinity
            ? `pre=-inf nên pre+cur=-inf, mx giữ nguyên = ${mx}.`
            : `Ghép đoạn '0' này (dài ${curLen}) với đoạn '0' trước (dài ${pre}) → tổng ${candidate}. mx = max(${oldMx}, ${candidate}) = ${mx}${updated ? " (cập nhật!)" : ""}.`,
          en: pre === -Infinity
            ? `pre=-inf so pre+cur=-inf, mx stays = ${mx}.`
            : `Pair this '0' segment (length ${curLen}) with the previous one (length ${pre}) → sum ${candidate}. mx = max(${oldMx}, ${candidate}) = ${mx}${updated ? " (updated!)" : ""}.`,
        },
      });

      // Line 19: pre = cur
      const oldPre = preStr();
      pre = curLen;
      steps.push({
        title: { vi: `pre = cur → pre = ${pre}`, en: `pre = cur → pre = ${pre}` },
        arr: values,
        sub: chars,
        highlight: range,
        mark: [],
        codeLines: [19],
        vars: [
          { name: "pre (before)", value: oldPre },
          { name: "pre (after)", value: pre },
        ],
        note: {
          vi: `pre cập nhật thành độ dài đoạn '0' vừa xét: pre = ${pre}.`,
          en: `pre updates to the length of this '0' segment: pre = ${pre}.`,
        },
      });
    }

    // Line 21: index = end
    const oldIndex = index;
    index = segmentEnd;
    steps.push({
      title: { vi: `index = end → index = ${index}`, en: `index = end → index = ${index}` },
      arr: values,
      sub: chars,
      highlight: index < n ? [index] : [],
      mark: [],
      codeLines: [21],
      vars: [
        { name: "index (before)", value: oldIndex },
        { name: "index (after)", value: index },
      ],
      note: {
        vi: `Chuyển sang đoạn kế tiếp: index = ${index}.`,
        en: `Move to the next segment: index = ${index}.`,
      },
    });
  }

  // Final while check → False
  steps.push({
    title: { vi: `while index=${index} < n=${n} → False`, en: `while index=${index} < n=${n} → False` },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [9],
    vars: [{ name: "index", value: index }, { name: "n", value: n }],
    note: {
      vi: "Đã xét hết chuỗi. Thoát vòng lặp ngoài.",
      en: "The whole string has been scanned. Exit the outer loop.",
    },
  });

  // Line 23: return ans + mx
  const answer = ans + mx;
  steps.push({
    title: { vi: `return ans + mx = ${ans} + ${mx} = ${answer}`, en: `return ans + mx = ${ans} + ${mx} = ${answer}` },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [23],
    vars: [
      { name: "ans", value: ans },
      { name: "mx", value: mx },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Tổng số '1' gốc = ${ans}. Gain tốt nhất từ 1 lần trade = ${mx}. Kết quả = ${ans} + ${mx} = ${answer}.`,
      en: `Original '1' count = ${ans}. Best gain from one trade = ${mx}. Result = ${ans} + ${mx} = ${answer}.`,
    },
  });

  return { original: s, answer, steps };
}

/**
 * LeetCode 3499 — Approach 2: Sliding Window on runs.
 * Step 1: compress s into runs (character, length) via run-length encoding.
 * Step 2: ans = sum of lengths of '1' runs.
 * Step 3: slide a window of size 3 over the runs array; whenever the middle
 * run is '1', its two '0' neighbors are merge candidates — mx tracks the
 * best combined length.
 */
function buildSteps3499Sliding(input) {
  const s = String(input || "").trim();
  const n = s.length;
  const steps = [];

  if (n === 0) {
    steps.push({
      title: { vi: "Chuỗi rỗng", en: "Empty string" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      codeBlock: 2,
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Chuỗi rỗng → 0 khu vực hoạt động.", en: "Empty string → 0 active sections." },
    });
    return { original: s, answer: 0, steps };
  }

  const chars = s.split("");
  const values = chars.map((c) => (c === "1" ? 1 : 0.4));

  // Line 3: n = len(s)
  steps.push({
    title: { vi: "n = len(s)", en: "n = len(s)" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [3],
    codeBlock: 2,
    vars: [{ name: "s", value: `"${s}"` }, { name: "n", value: n }],
    note: {
      vi: `s = "${s}". n = ${n}. Bước 1: nén chuỗi thành các đoạn (runs).`,
      en: `s = "${s}". n = ${n}. Step 1: compress the string into runs.`,
    },
  });

  // Line 4: runs = []
  const runs = []; // [{ch, len, start}]
  steps.push({
    title: { vi: "runs = []", en: "runs = []" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [4],
    codeBlock: 2,
    vars: [{ name: "runs", value: "[]" }],
    note: {
      vi: "runs sẽ lưu danh sách (ký tự, độ dài) của từng đoạn liên tiếp.",
      en: "runs will store the (character, length) list of each consecutive segment.",
    },
  });

  // Line 5: i = 0
  let i = 0;
  steps.push({
    title: { vi: "i = 0", en: "i = 0" },
    arr: values,
    sub: chars,
    highlight: [0],
    mark: [],
    codeLines: [5],
    codeBlock: 2,
    vars: [{ name: "i", value: i }],
    note: { vi: "i là con trỏ bắt đầu đoạn hiện tại.", en: "i is the start pointer of the current run." },
  });

  while (i < n) {
    // Line 6: while i < n
    steps.push({
      title: { vi: `while i=${i} < n=${n} → True`, en: `while i=${i} < n=${n} → True` },
      arr: values,
      sub: chars,
      highlight: [i],
      mark: [],
      codeLines: [6],
      codeBlock: 2,
      vars: [{ name: "i", value: i }],
      note: { vi: "Còn ký tự để nén.", en: "Characters remain to compress." },
    });

    // Line 7: j = i
    let j = i;
    steps.push({
      title: { vi: `j = i = ${j}`, en: `j = i = ${j}` },
      arr: values,
      sub: chars,
      highlight: [i],
      mark: [],
      codeLines: [7],
      codeBlock: 2,
      vars: [{ name: "j", value: j }],
      note: { vi: "j quét về phía trước để tìm cuối đoạn.", en: "j scans forward to find the end of the run." },
    });

    // Line 8-9: inner while
    while (j < n && s[j] === s[i]) {
      steps.push({
        title: { vi: `while s[${j}]='${s[j]}' == s[${i}]='${s[i]}' → True`, en: `while s[${j}]='${s[j]}' == s[${i}]='${s[i]}' → True` },
        arr: values,
        sub: chars,
        highlight: Array.from({ length: j - i + 1 }, (_, k) => i + k),
        mark: [],
        codeLines: [8],
        codeBlock: 2,
        vars: [{ name: "j", value: j }],
        note: { vi: "Ký tự giống → cùng đoạn, mở rộng j.", en: "Same character → same run, extend j." },
      });
      j++;
      steps.push({
        title: { vi: `j += 1 → j = ${j}`, en: `j += 1 → j = ${j}` },
        arr: values,
        sub: chars,
        highlight: Array.from({ length: j - i }, (_, k) => i + k),
        mark: [],
        codeLines: [9],
        codeBlock: 2,
        vars: [{ name: "j", value: j }],
        note: { vi: `j = ${j}.`, en: `j = ${j}.` },
      });
    }
    steps.push({
      title: {
        vi: j < n ? `while s[${j}]='${s[j]}' == s[${i}]='${s[i]}' → False` : `while j=${j} < n=${n} → False`,
        en: j < n ? `while s[${j}]='${s[j]}' == s[${i}]='${s[i]}' → False` : `while j=${j} < n=${n} → False`,
      },
      arr: values,
      sub: chars,
      highlight: Array.from({ length: j - i }, (_, k) => i + k),
      mark: [],
      codeLines: [8],
      codeBlock: 2,
      vars: [{ name: "j", value: j }],
      note: { vi: "Đoạn kết thúc tại đây.", en: "The run ends here." },
    });

    // Line 10: runs.append((s[i], j - i))
    const runLen = j - i;
    runs.push({ ch: s[i], len: runLen, start: i });
    steps.push({
      title: { vi: `runs.append(('${s[i]}', ${runLen}))`, en: `runs.append(('${s[i]}', ${runLen}))` },
      arr: values,
      sub: chars,
      highlight: Array.from({ length: runLen }, (_, k) => i + k),
      mark: [],
      codeLines: [10],
      codeBlock: 2,
      vars: [{ name: "run", value: `('${s[i]}', ${runLen})` }, { name: "runs", value: `[${runs.map((r) => `('${r.ch}',${r.len})`).join(", ")}]` }],
      note: {
        vi: `Đoạn [${i}..${j - 1}] = "${s.slice(i, j)}" → runs += ('${s[i]}', ${runLen}).`,
        en: `Segment [${i}..${j - 1}] = "${s.slice(i, j)}" → runs += ('${s[i]}', ${runLen}).`,
      },
    });

    // Line 11: i = j
    i = j;
    steps.push({
      title: { vi: `i = j → i = ${i}`, en: `i = j → i = ${i}` },
      arr: values,
      sub: chars,
      highlight: i < n ? [i] : [],
      mark: [],
      codeLines: [11],
      codeBlock: 2,
      vars: [{ name: "i", value: i }],
      note: { vi: `Chuyển sang đoạn kế tiếp: i = ${i}.`, en: `Move to next run: i = ${i}.` },
    });
  }

  steps.push({
    title: { vi: `while i=${i} < n=${n} → False`, en: `while i=${i} < n=${n} → False` },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [6],
    codeBlock: 2,
    vars: [{ name: "i", value: i }],
    note: { vi: "Đã nén hết chuỗi thành runs.", en: "The whole string has been compressed into runs." },
  });

  // Show runs as its own bar chart from here on (run lengths as bars, char as sub-label)
  const runArr = runs.map((r) => r.len);
  const runSub = runs.map((r) => r.ch);
  const runRangeAll = (idx) => {
    const r = runs[idx];
    return Array.from({ length: r.len }, (_, k) => r.start + k);
  };

  // Line 13: ans = sum(length for ch, length in runs if ch == '1')
  const ans = runs.filter((r) => r.ch === "1").reduce((sum, r) => sum + r.len, 0);
  const onesIdx = runs.map((r, idx) => (r.ch === "1" ? idx : -1)).filter((x) => x >= 0);
  const onesHighlight = onesIdx.flatMap((idx) => runRangeAll(idx));
  steps.push({
    title: { vi: `ans = sum('1' runs) = ${ans}`, en: `ans = sum('1' runs) = ${ans}` },
    arr: values,
    sub: chars,
    highlight: onesHighlight,
    mark: [],
    codeLines: [13],
    codeBlock: 2,
    vars: [
      { name: "runs", value: `[${runs.map((r) => `('${r.ch}',${r.len})`).join(", ")}]` },
      { name: "ans", value: ans },
    ],
    note: {
      vi: `Cộng độ dài các đoạn '1': ${runs.filter((r) => r.ch === "1").map((r) => r.len).join(" + ") || 0} = ${ans}.`,
      en: `Sum the lengths of '1' runs: ${runs.filter((r) => r.ch === "1").map((r) => r.len).join(" + ") || 0} = ${ans}.`,
    },
  });

  // Line 15: mx = 0
  let mx = 0;
  steps.push({
    title: { vi: "mx = 0", en: "mx = 0" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [15],
    codeBlock: 2,
    vars: [{ name: "mx", value: mx }],
    note: { vi: "mx = gain tốt nhất từ sliding window kích thước 3 trên runs.", en: "mx = best gain from the size-3 sliding window over runs." },
  });

  // Line 16: left, right = 0, 2
  let left = 0;
  let right = 2;
  steps.push({
    title: { vi: `left, right = 0, 2`, en: `left, right = 0, 2` },
    arr: values,
    sub: chars,
    highlight: runs.length >= 3 ? [runRangeAll(left), runRangeAll(right)].flat() : [],
    mark: [],
    codeLines: [16],
    codeBlock: 2,
    vars: [{ name: "left", value: left }, { name: "right", value: right }],
    note: {
      vi: "left và right trượt đồng thời, cách nhau 2 → window luôn có kích thước 3 đoạn (runs[left..right]).",
      en: "left and right slide together, 2 apart → the window always spans 3 runs (runs[left..right]).",
    },
  });

  while (right < runs.length) {
    // Line 17: while right < len(runs)
    const windowHighlight = [runRangeAll(left), runRangeAll(left + 1 <= right - 1 ? left + 1 : left), runRangeAll(right)].flat();
    const fullWindow = Array.from({ length: right - left + 1 }, (_, k) => left + k).flatMap((idx) => runRangeAll(idx));
    steps.push({
      title: { vi: `while right=${right} < len(runs)=${runs.length} → True`, en: `while right=${right} < len(runs)=${runs.length} → True` },
      arr: values,
      sub: chars,
      highlight: fullWindow,
      mark: [],
      codeLines: [17],
      codeBlock: 2,
      vars: [{ name: "left", value: left }, { name: "right", value: right }],
      note: {
        vi: `right=${right} < ${runs.length} → còn window để xét.`,
        en: `right=${right} < ${runs.length} → a window remains to check.`,
      },
    });

    // Line 18: mid = left + 1
    const mid = left + 1;
    steps.push({
      title: { vi: `mid = left + 1 = ${mid}`, en: `mid = left + 1 = ${mid}` },
      arr: values,
      sub: chars,
      highlight: fullWindow,
      mark: [],
      codeLines: [18],
      codeBlock: 2,
      vars: [{ name: "left", value: left }, { name: "mid", value: mid }, { name: "right", value: right }],
      note: {
        vi: `Đoạn giữa window: mid = ${mid}.`,
        en: `Middle run of the window: mid = ${mid}.`,
      },
    });

    // Line 19: if runs[mid][0] == '1'
    const middleIsOne = runs[mid].ch === "1";
    steps.push({
      title: { vi: `if runs[${mid}][0]=='${runs[mid].ch}' == '1' → ${middleIsOne}`, en: `if runs[${mid}][0]=='${runs[mid].ch}' == '1' → ${middleIsOne}` },
      arr: values,
      sub: chars,
      highlight: fullWindow,
      mark: [],
      codeLines: [19],
      codeBlock: 2,
      vars: [{ name: `runs[${mid}][0]`, value: runs[mid].ch }, { name: "is '1'?", value: middleIsOne }],
      note: middleIsOne
        ? { vi: "Đoạn giữa là '1' → 2 đoạn '0' ở left/right là ứng viên merge.", en: "Middle run is '1' → the '0' runs at left/right are merge candidates." }
        : { vi: "Đoạn giữa là '0' → không hợp lệ (không thể trade '0' giữa 2 '0').", en: "Middle run is '0' → not valid (cannot trade '0' between two '0's)." },
    });

    if (middleIsOne) {
      // Line 20: mx = max(mx, runs[left][1] + runs[right][1])
      const oldMx = mx;
      const candidate = runs[left].len + runs[right].len;
      mx = Math.max(mx, candidate);
      const updated = mx !== oldMx;
      steps.push({
        title: { vi: `mx = max(${oldMx}, ${runs[left].len}+${runs[right].len}) = ${mx}`, en: `mx = max(${oldMx}, ${runs[left].len}+${runs[right].len}) = ${mx}` },
        arr: values,
        sub: chars,
        highlight: fullWindow,
        mark: updated ? [runRangeAll(left), runRangeAll(right)].flat() : [],
        codeLines: [20],
        codeBlock: 2,
        vars: [
          { name: "mx (before)", value: oldMx },
          { name: "runs[left][1] + runs[right][1]", value: candidate },
          { name: "mx (after)", value: mx },
        ],
        note: {
          vi: `Merge 2 đoạn '0' ở left/right (${runs[left].len} + ${runs[right].len} = ${candidate}). mx = max(${oldMx}, ${candidate}) = ${mx}${updated ? " (cập nhật!)" : ""}.`,
          en: `Merge the two '0' runs at left/right (${runs[left].len} + ${runs[right].len} = ${candidate}). mx = max(${oldMx}, ${candidate}) = ${mx}${updated ? " (updated!)" : ""}.`,
        },
      });
    }

    // Line 21: left += 1
    const oldLeft = left;
    left++;
    steps.push({
      title: { vi: `left += 1 → left = ${left}`, en: `left += 1 → left = ${left}` },
      arr: values,
      sub: chars,
      highlight: fullWindow,
      mark: [],
      codeLines: [21],
      codeBlock: 2,
      vars: [{ name: "left (before)", value: oldLeft }, { name: "left (after)", value: left }],
      note: {
        vi: `Trượt cửa sổ: left = ${left}.`,
        en: `Slide the window: left = ${left}.`,
      },
    });

    // Line 22: right += 1
    const oldRight = right;
    right++;
    steps.push({
      title: { vi: `right += 1 → right = ${right}`, en: `right += 1 → right = ${right}` },
      arr: values,
      sub: chars,
      highlight: right < runs.length ? [runRangeAll(left), runRangeAll(right)].flat() : [],
      mark: [],
      codeLines: [22],
      codeBlock: 2,
      vars: [{ name: "right (before)", value: oldRight }, { name: "right (after)", value: right }],
      note: {
        vi: `Trượt cửa sổ: right = ${right}.`,
        en: `Slide the window: right = ${right}.`,
      },
    });
  }

  // Final while check → False
  steps.push({
    title: { vi: `while right=${right} < len(runs)=${runs.length} → False`, en: `while right=${right} < len(runs)=${runs.length} → False` },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [17],
    codeBlock: 2,
    vars: [{ name: "left", value: left }, { name: "right", value: right }],
    note: {
      vi: "Đã xét hết mọi cửa sổ kích thước 3. Thoát vòng lặp.",
      en: "All size-3 windows have been checked. Exit the loop.",
    },
  });

  // Line 24: return ans + mx
  const answer = ans + mx;
  steps.push({
    title: { vi: `return ans + mx = ${ans} + ${mx} = ${answer}`, en: `return ans + mx = ${ans} + ${mx} = ${answer}` },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [24],
    codeBlock: 2,
    vars: [
      { name: "ans", value: ans },
      { name: "mx", value: mx },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Tổng số '1' gốc = ${ans}. Gain tốt nhất từ sliding window = ${mx}. Kết quả = ${ans} + ${mx} = ${answer}.`,
      en: `Original '1' count = ${ans}. Best gain from sliding window = ${mx}. Result = ${ans} + ${mx} = ${answer}.`,
    },
  });

  return { original: s, answer, steps };
}

module.exports = {
  1081: {
    id: 1081,
    difficulty: "medium",
    slug: "smallest-subsequence-of-distinct-characters",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Smallest Subsequence of Distinct Characters", en: "Smallest Subsequence of Distinct Characters" },
    titleVi: { vi: "Subsequence phân biệt nhỏ nhất", en: "Lexicographically smallest distinct subsequence" },
    statement: {
      vi: "Trả về subsequence nhỏ nhất theo thứ tự từ điển chứa mỗi ký tự khác nhau của s đúng một lần.",
      en: "Return the lexicographically smallest subsequence that contains every distinct character of s exactly once.",
    },
    defaultInput: "cbacdcbc",
    inputKind: "string",
    inputLabel: { vi: "String s", en: "String s" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn cách visualize", en: "Visualization approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "Cách 1: Last index + used", en: "Approach 1: Last index + used" } },
          { value: 2, label: { vi: "Cách 2: Remaining frequency + vis", en: "Approach 2: Remaining frequency + vis" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 lưu last index; top còn xuất hiện phía sau khi i < last[top].", en: "Approach 1 stores last indices; the top appears later when i < last[top]." },
      { vi: "Cách 2 đếm freq còn lại; giảm freq[ch] trước, rồi top còn xuất hiện khi freq[top] > 0.", en: "Approach 2 tracks remaining frequencies; decrement freq[ch] first, then the top appears later when freq[top] > 0." },
      { vi: "used/vis đảm bảo mỗi ký tự chỉ có một lần trong monotonic stack.", en: "used/vis keeps each character in the monotonic stack at most once." },
      { vi: "Cả hai cách chỉ pop top lớn hơn ch khi top chắc chắn còn một bản sao phía sau.", en: "Both approaches pop a larger top only when another copy is guaranteed to appear later." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(k)",
      note: {
        vi: "Cả hai cách đều O(n): mỗi ký tự được push và pop tối đa một lần. k là số ký tự khác nhau.",
        en: "Both approaches are O(n): each character is pushed and popped at most once. k is the number of distinct characters.",
      },
    },
    code: [
      "class Solution:",
      "    def smallestSubsequence(self, s: str) -> str:",
      "        last = {ch: i for i, ch in enumerate(s)}",
      "        stack = []",
      "        used = set()",
      "        for i, ch in enumerate(s):",
      "            if ch in used:",
      "                continue",
      "            while stack and ch < stack[-1] and i < last[stack[-1]]:",
      "                used.remove(stack.pop())",
      "            stack.append(ch)",
      "            used.add(ch)",
      "        return ''.join(stack)",
    ],
    code2: [
      "class Solution:",
      "    def smallestSubsequence(self, s: str) -> str:",
      "        freq = {ch: 0 for ch in s}",
      "        vis = set()",
      "        stack = []",
      "",
      "        for ch in s:",
      "            freq[ch] += 1",
      "",
      "        for ch in s:",
      "            freq[ch] -= 1",
      "            if ch in vis:",
      "                continue",
      "            while stack and stack[-1] > ch and freq[stack[-1]] > 0:",
      "                vis.remove(stack.pop())",
      "            stack.append(ch)",
      "            vis.add(ch)",
      "",
      "        return \"\".join(stack)",
    ],
    codeLabel: { vi: "Cách 1: Last index + used", en: "Approach 1: Last index + used" },
    code2Label: { vi: "Cách 2: Remaining frequency + vis", en: "Approach 2: Remaining frequency + vis" },
    builder: buildSteps1081,
  },
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
  155: {
    id: 155,
    difficulty: "medium",
    slug: "min-stack",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Min Stack", en: "Min Stack" },
    titleVi: { vi: "Stack ho tro truy van minimum", en: "Stack with constant-time minimum" },
    statement: {
      vi: "Thiet ke stack ho tro push, pop, top va lay phan tu nho nhat trong thoi gian O(1).",
      en: "Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) time.",
    },
    defaultInput: "MinStack(), push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()",
    inputKind: "string",
    inputLabel: { vi: "operations", en: "operations" },
    extraParams: [],
    approach: [
      { vi: "Moi entry luu cap (value, minimum tinh den vi tri do).", en: "Store (value, minimum up to this position) in every entry." },
      { vi: "push(val) tinh current_min = min(val, minimum cu), roi push ca cap.", en: "push(val) computes current_min = min(val, previous minimum), then pushes both." },
      { vi: "pop() tu dong khoi phuc minimum cua level truoc vi no da nam trong entry top moi.", en: "pop() automatically restores the previous level's minimum from the new top entry." },
      { vi: "top() doc value, con getMin() doc minimum trong entry top; ca hai deu O(1).", en: "top() reads the value and getMin() reads the minimum from the top entry; both are O(1)." },
    ],
    complexity: {
      time: "O(1)",
      space: "O(n)",
      note: {
        vi: "Moi operation chi doc hoac cap nhat entry top nen O(1). Stack luu toi da n cap (value, minimum).",
        en: "Every operation reads or updates only the top entry, so it is O(1). The stack stores up to n (value, minimum) pairs.",
      },
    },
    code: [
      "class MinStack:",
      "    def __init__(self):",
      "        self.stack = []",
      "",
      "    def push(self, val: int) -> None:",
      "        current_min = min(val, self.stack[-1][1]) if self.stack else val",
      "        self.stack.append((val, current_min))",
      "",
      "    def pop(self) -> None:",
      "        self.stack.pop()",
      "",
      "    def top(self) -> int:",
      "        return self.stack[-1][0]",
      "",
      "    def getMin(self) -> int:",
      "        return self.stack[-1][1]",
    ],
    builder: buildSteps155,
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
  636: {
    id: 636,
    difficulty: "medium",
    slug: "exclusive-time-of-functions",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Exclusive Time of Functions", en: "Exclusive Time of Functions" },
    titleVi: { vi: "Thoi gian chay rieng cua cac function", en: "Exclusive execution time of functions" },
    statement: {
      vi: "Cho n function chay tren mot CPU va danh sach log start/end theo thu tu. Tra ve exclusive time cua moi function, khong tinh thoi gian bi function con tam dung.",
      en: "Given n functions running on one CPU and their ordered start/end logs, return each function's exclusive time without counting time spent paused by nested calls.",
    },
    defaultInput: ["0:start:0", "1:start:2", "1:end:5", "0:end:6"],
    inputKind: "stringArray",
    inputLabel: { vi: "logs (JSON hoac comma-separated)", en: "logs (JSON or comma-separated)" },
    extraParams: [
      {
        key: "n",
        type: "number",
        label: { vi: "Number of functions n", en: "Number of functions n" },
        default: 2,
      },
    ],
    approach: [
      { vi: "Stack luu cac function active; top la function dang chiem CPU.", en: "Keep active calls on a stack; the top function currently owns the CPU." },
      { vi: "prev_time danh dau dau khoang CPU chua duoc gan vao answer.", en: "prev_time marks the beginning of the CPU interval not yet assigned." },
      { vi: "Tai start log, cong timestamp - prev_time cho function top cu, roi push function moi.", en: "At a start log, credit timestamp - prev_time to the old top, then push the new function." },
      { vi: "Tai end log, pop va cong timestamp - prev_time + 1 vi end timestamp la inclusive.", en: "At an end log, pop and credit timestamp - prev_time + 1 because the end timestamp is inclusive." },
    ],
    complexity: {
      time: "O(m)",
      space: "O(n)",
      note: {
        vi: "Moi log duoc xu ly mot lan, voi m la so logs. Answer va call stack dung toi da O(n) bo nho.",
        en: "Each of the m logs is processed once. The answer and call stack use up to O(n) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def exclusiveTime(self, n: int, logs):",
      "        answer = [0] * n",
      "        stack = []",
      "        prev_time = 0",
      "",
      "        for log in logs:",
      "            function_id, event, timestamp = log.split(':')",
      "            function_id, timestamp = int(function_id), int(timestamp)",
      "",
      "            if event == 'start':",
      "                if stack:",
      "                    answer[stack[-1]] += timestamp - prev_time",
      "                stack.append(function_id)",
      "                prev_time = timestamp",
      "            else:",
      "                finished = stack.pop()",
      "                answer[finished] += timestamp - prev_time + 1",
      "                prev_time = timestamp + 1",
      "",
      "        return answer",
    ],
    builder: buildSteps636,
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
  346: {
    id: 346,
    difficulty: "easy",
    premium: true,
    slug: "moving-average-from-data-stream",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Moving Average from Data Stream", en: "Moving Average from Data Stream" },
    titleVi: { vi: "Trung binh truot tu dong du lieu", en: "Moving average from a data stream" },
    statement: {
      vi: "Thiet ke lop tinh trung binh cua toi da size gia tri moi nhat trong dong du lieu.",
      en: "Design a class that calculates the average of at most the latest size values in a data stream.",
    },
    defaultInput: "MovingAverage(3), next(1), next(10), next(3), next(5)",
    inputKind: "string",
    inputLabel: { vi: "operations", en: "operations" },
    extraParams: [],
    approach: [
      { vi: "Dung deque lam sliding window: FRONT la gia tri cu nhat, REAR la gia tri moi nhat.", en: "Use a deque as the sliding window: FRONT is the oldest value and REAR is the newest." },
      { vi: "Moi next(val), append val va cong vao window_sum.", en: "For each next(val), append val and add it to window_sum." },
      { vi: "Neu queue dai hon size, popleft gia tri cu nhat va tru no khoi window_sum.", en: "If the queue grows beyond size, popleft the oldest value and subtract it from window_sum." },
      { vi: "Tra ve window_sum / len(queue), nen moi operation la O(1).", en: "Return window_sum / len(queue), so every operation is O(1)." },
    ],
    complexity: {
      time: "O(1) per next",
      space: "O(size)",
      note: {
        vi: "Moi gia tri vao va roi queue dung mot lan. Queue chi giu toi da size gia tri.",
        en: "Each value enters and leaves the queue once. The queue stores at most size values.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class MovingAverage:",
      "    def __init__(self, size: int):",
      "        self.size = size",
      "        self.queue = deque()",
      "        self.window_sum = 0",
      "",
      "    def next(self, val: int) -> float:",
      "        self.queue.append(val)",
      "        self.window_sum += val",
      "",
      "        if len(self.queue) > self.size:",
      "            removed = self.queue.popleft()",
      "            self.window_sum -= removed",
      "",
      "        return self.window_sum / len(self.queue)",
    ],
    builder: buildSteps346,
  },
  362: {
    id: 362,
    difficulty: "medium",
    premium: true,
    slug: "design-hit-counter",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Design Hit Counter", en: "Design Hit Counter" },
    titleVi: { vi: "Thiet ke bo dem hit", en: "Design a hit counter" },
    statement: {
      vi: "Thiet ke HitCounter de ghi nhan hit theo timestamp va dem so hit trong 300 giay gan nhat.",
      en: "Design HitCounter to record timestamped hits and count the hits received in the latest 300 seconds.",
    },
    defaultInput: "HitCounter(), hit(1), hit(2), hit(3), getHits(4), hit(300), getHits(300), getHits(301)",
    inputKind: "string",
    inputLabel: { vi: "operations", en: "operations" },
    extraParams: [],
    approach: [
      { vi: "Dung deque luu timestamp cua tung hit theo thu tu tang dan.", en: "Use a deque to store each hit timestamp in chronological order." },
      { vi: "hit(timestamp) append timestamp vao REAR trong O(1).", en: "hit(timestamp) appends the timestamp at REAR in O(1)." },
      { vi: "getHits(timestamp) popleft trong khi FRONT <= timestamp - 300, vi cac hit do da qua 300 giay.", en: "getHits(timestamp) pops from FRONT while FRONT <= timestamp - 300 because those hits are at least 300 seconds old." },
      { vi: "Sau khi loai, moi hit con lai nam trong [timestamp - 299, timestamp], nen dap an la len(queue).", en: "After pruning, every remaining hit lies in [timestamp - 299, timestamp], so the answer is len(queue)." },
    ],
    complexity: {
      time: "O(1) amortized per operation",
      space: "O(n)",
      note: {
        vi: "Moi hit duoc append va popleft toi da mot lan. Queue chi luu cac hit chua het han.",
        en: "Each hit is appended and removed at most once. The queue stores only hits that have not expired.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class HitCounter:",
      "    def __init__(self):",
      "        self.hits = deque()",
      "",
      "    def hit(self, timestamp: int) -> None:",
      "        self.hits.append(timestamp)",
      "",
      "    def getHits(self, timestamp: int) -> int:",
      "        while self.hits and self.hits[0] <= timestamp - 300:",
      "            self.hits.popleft()",
      "",
      "        return len(self.hits)",
    ],
    builder: buildSteps362,
  },
  933: {
    id: 933,
    difficulty: "easy",
    slug: "number-of-recent-calls",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Number of Recent Calls", en: "Number of Recent Calls" },
    titleVi: { vi: "Dem so request gan day", en: "Count recent requests" },
    statement: {
      vi: "RecentCounter nhan cac lenh ping(t) voi t tang dan. Moi ping them request tai thoi diem t va tra ve so request trong khoang inclusive [t - 3000, t].",
      en: "RecentCounter receives ping(t) calls with increasing t. Each ping adds a request at time t and returns the number of requests in the inclusive interval [t - 3000, t].",
    },
    defaultInput: "RecentCounter(), ping(1), ping(100), ping(3001), ping(3002)",
    inputKind: "string",
    inputLabel: { vi: "operations", en: "operations" },
    extraParams: [],
    approach: [
      { vi: "Dung deque luu timestamp cua cac request con nam trong cua so 3000 ms.", en: "Use a deque to store timestamps that remain inside the 3000 ms window." },
      { vi: "Moi ping(t), append t vao REAR vi cac timestamp tang dan.", en: "For each ping(t), append t at REAR because timestamps are increasing." },
      { vi: "Trong khi FRONT < t - 3000, popleft request da qua cu.", en: "While FRONT < t - 3000, popleft the stale request." },
      { vi: "Sau khi loai xong, moi timestamp trong queue deu thuoc [t - 3000, t], nen dap an la len(queue).", en: "After pruning, every timestamp in the queue belongs to [t - 3000, t], so the answer is len(queue)." },
    ],
    complexity: {
      time: "O(1) amortized per ping",
      space: "O(n)",
      note: {
        vi: "Moi timestamp duoc append va popleft toi da mot lan, nen tong thoi gian cho n lenh ping la O(n). Queue chi luu cac request gan day.",
        en: "Each timestamp is appended and removed at most once, so n ping calls take O(n) total time. The queue stores only recent requests.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class RecentCounter:",
      "    def __init__(self):",
      "        self.requests = deque()",
      "",
      "    def ping(self, t: int) -> int:",
      "        self.requests.append(t)",
      "        while self.requests[0] < t - 3000:",
      "            self.requests.popleft()",
      "",
      "        return len(self.requests)",
    ],
    builder: buildSteps933,
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
  921: {
    id: 921,
    difficulty: "medium",
    slug: "minimum-add-to-make-parentheses-valid",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Minimum Add to Make Parentheses Valid", en: "Minimum Add to Make Parentheses Valid" },
    titleVi: { vi: "Them it dau ngoac nhat de chuoi hop le", en: "Minimum additions for valid parentheses" },
    statement: {
      vi: "Cho chuoi chi gom '(' va ')'. Moi lan co the chen mot dau ngoac vao bat ky vi tri nao. Tra ve so lan chen it nhat de chuoi ngoac hop le.",
      en: "Given a string containing only '(' and ')', one parenthesis may be inserted at any position per move. Return the minimum additions needed to make the string valid.",
    },
    defaultInput: "()))((",
    inputKind: "string",
    inputLabel: { vi: "Parentheses string s", en: "Parentheses string s" },
    extraParams: [],
    approach: [
      { vi: "Stack luu cac dau '(' chua ghep cap.", en: "Keep unmatched '(' characters on a stack." },
      { vi: "Gap ')' va stack khong rong: pop mot '(' de tao cap ().", en: "For ')' with a nonempty stack, pop one '(' to form a pair." },
      { vi: "Gap ')' khi stack rong: can them mot '(', nen additions tang 1.", en: "For ')' with an empty stack, one '(' is missing, so increment additions." },
      { vi: "Sau khi duyet, moi '(' con trong stack can them mot ')'. Ket qua la additions + len(stack).", en: "After the scan, each '(' left in the stack needs a ')'. Return additions + len(stack)." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyet moi ky tu mot lan. Stack co the luu toi da n dau '('. Co the toi uu space ve O(1) bang bien dem open.",
        en: "Each character is processed once. The stack may store n opening parentheses; an open counter can optimize the extra space to O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def minAddToMakeValid(self, s: str) -> int:",
      "        stack = []",
      "        additions = 0",
      "        for i, ch in enumerate(s):",
      "            if ch == '(':",
      "                stack.append(i)",
      "            elif stack:",
      "                stack.pop()",
      "            else:",
      "                additions += 1",
      "",
      "        return additions + len(stack)",
    ],
    builder: buildSteps921,
  },
  1249: {
    id: 1249,
    difficulty: "medium",
    slug: "minimum-remove-to-make-valid-parentheses",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Minimum Remove to Make Valid Parentheses", en: "Minimum Remove to Make Valid Parentheses" },
    titleVi: { vi: "Xoa it dau ngoac nhat de chuoi hop le", en: "Minimum removals for valid parentheses" },
    statement: {
      vi: "Cho chuoi gom chu cai va dau ngoac. Xoa so ky tu it nhat de tao mot chuoi ngoac hop le va tra ve mot ket qua bat ky hop le.",
      en: "Given a string containing letters and parentheses, remove the minimum number of parentheses so the result is valid, and return any valid result.",
    },
    defaultInput: "lee(t(c)o)de)",
    inputKind: "string",
    inputLabel: { vi: "String s", en: "String s" },
    extraParams: [],
    approach: [
      { vi: "Duyet trai sang phai va push index cua moi dau '(' vao stack.", en: "Scan left to right and push every '(' index onto the stack." },
      { vi: "Gap ')' va stack khong rong thi pop de ghep cap.", en: "When ')' has an available opener, pop one index to match the pair." },
      { vi: "Gap ')' khi stack rong thi danh dau no de xoa ngay.", en: "When ')' appears with an empty stack, mark it for immediate removal." },
      { vi: "Sau khi duyet, xoa cac dau '(' con trong stack, roi join cac ky tu.", en: "After the scan, remove every '(' index left in the stack, then join the characters." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyet va join moi ky tu mot lan. Stack va character list dung toi da O(n) bo nho.",
        en: "The scan and join each process every character once. The stack and character list use O(n) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def minRemoveToMakeValid(self, s: str) -> str:",
      "        chars = list(s)",
      "        stack = []",
      "        for i, ch in enumerate(chars):",
      "            if ch == '(':",
      "                stack.append(i)",
      "            elif ch == ')':",
      "                if stack:",
      "                    stack.pop()",
      "                else:",
      "                    chars[i] = ''",
      "",
      "        while stack:",
      "            chars[stack.pop()] = ''",
      "",
      "        return ''.join(chars)",
    ],
    builder: buildSteps1249,
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
  1700: {
    id: 1700,
    difficulty: "easy",
    slug: "number-of-students-unable-to-eat-lunch",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: {
      vi: "Number of Students Unable to Eat Lunch",
      en: "Number of Students Unable to Eat Lunch",
    },
    titleVi: { vi: "So hoc sinh khong the an trua", en: "Students unable to eat lunch" },
    statement: {
      vi: "Hoc sinh dung trong queue, moi em thich sandwich circular (0) hoac square (1). Neu hoc sinh o front thich sandwich top thi em lay no va roi queue; neu khong, em chuyen xuong rear. Tra ve so hoc sinh khong the an.",
      en: "Students stand in a queue and prefer either circular (0) or square (1) sandwiches. If the front student wants the top sandwich, they take it and leave; otherwise they move to the rear. Return how many students cannot eat.",
    },
    defaultInput: [1, 1, 1, 0, 0, 1],
    inputKind: "binary",
    inputLabel: { vi: "students (0=circle, 1=square)", en: "students (0=circle, 1=square)" },
    extraParams: [
      {
        key: "sandwiches",
        type: "string",
        label: { vi: "sandwiches (comma separated)", en: "sandwiches (comma separated)" },
        default: "1,0,0,0,1,1",
      },
    ],
    approach: [
      { vi: "Queue la FIFO: xu ly hoc sinh o front; hoc sinh tu choi se chuyen xuong rear.", en: "The queue is FIFO: process the front student; a student who refuses moves to the rear." },
      { vi: "Sandwich dau tien la top. Neu preference khop, loai ca student va sandwich.", en: "The first sandwich is the top. If the preference matches, remove both the student and sandwich." },
      { vi: "rotations dem so lan tu choi lien tiep va reset ve 0 sau khi co hoc sinh an.", en: "rotations counts consecutive refusals and resets to 0 after a student eats." },
      { vi: "Khi rotations == len(queue), queue da quay du mot vong ma khong co match; tat ca hoc sinh con lai khong the an.", en: "When rotations == len(queue), the queue made a full pass without a match; every remaining student is unable to eat." },
    ],
    complexity: {
      time: "O(n^2)",
      space: "O(n)",
      note: {
        vi: "Queue simulation co the rotate O(n) lan cho moi sandwich, nen worst case O(n^2). Hai deque luu toi da n phan tu.",
        en: "The queue simulation may rotate O(n) times per sandwich, so the worst case is O(n^2). The two deques store up to n items.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def countStudents(self, students, sandwiches):",
      "        student_queue = deque(students)",
      "        sandwich_stack = deque(sandwiches)",
      "        rotations = 0",
      "",
      "        while student_queue and rotations < len(student_queue):",
      "            if student_queue[0] == sandwich_stack[0]:",
      "                student_queue.popleft()",
      "                sandwich_stack.popleft()",
      "                rotations = 0",
      "            else:",
      "                student_queue.append(student_queue.popleft())",
      "                rotations += 1",
      "",
      "        return len(student_queue)",
    ],
    builder: buildSteps1700,
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
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Cach tiep can", en: "Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "1 - Stack", en: "1 - Stack" } },
          { value: 2, label: { vi: "2 - Greedy balance O(1)", en: "2 - Greedy balance O(1)" } },
        ],
      },
    ],
    approach: [
      { vi: "Approach 1 - Stack: ghep tung ']' voi '[' gan nhat va dem unmatched_close.", en: "Approach 1 - Stack: match each ']' with the nearest '[' and count unmatched_close." },
      { vi: "Approach 1 tra ve (unmatched_close + 1) // 2.", en: "Approach 1 returns (unmatched_close + 1) // 2." },
      { vi: "Approach 2 - Greedy: cap nhat balance; khi balance < 0 thi swaps++ va reset balance = 1.", en: "Approach 2 - Greedy: update balance; when balance < 0, increment swaps and reset balance to 1." },
      { vi: "Hai approach cho cung dap an; greedy chi dung O(1) extra space.", en: "Both approaches return the same answer; greedy uses only O(1) extra space." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Ca hai deu O(n) time. Approach 1 dung O(n) stack; Approach 2 dung O(1) extra space.",
        en: "Both take O(n) time. Approach 1 uses an O(n) stack; Approach 2 uses O(1) extra space.",
      },
    },
    codeLabel: { vi: "Approach 1: Stack", en: "Approach 1: Stack" },
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
    code2Label: { vi: "Approach 2: Greedy balance O(1)", en: "Approach 2: Greedy balance O(1)" },
    code2: [
      "class Solution:",
      "    def minSwaps(self, s: str) -> int:",
      "        balance = 0",
      "        swaps = 0",
      "",
      "        for ch in s:",
      "            if ch == '[':",
      "                balance += 1",
      "            else:",
      "                balance -= 1",
      "",
      "            if balance < 0:",
      "                swaps += 1",
      "                balance = 1",
      "",
      "        return swaps",
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
  3499: {
    id: 3499,
    difficulty: "medium",
    slug: "maximize-active-section-with-trade-i",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Maximize Active Section with Trade I", en: "Maximize Active Section with Trade I" },
    titleVi: { vi: "Tối đa hoá khu vực hoạt động sau 1 lần trade", en: "Maximize active sections after one trade" },
    statement: {
      vi:
        "Cho chuỗi nhị phân s ('1'=hoạt động, '0'=không). Coi như có '1' ảo ở 2 đầu chuỗi. " +
        "Được thực hiện TỐI ĐA 1 lần trade: chọn 1 đoạn '1' liên tiếp bị '0' bao quanh 2 bên, đổi thành '0'; " +
        "sau đó chọn 1 đoạn '0' liên tiếp bị '1' bao quanh 2 bên, đổi thành '1'. " +
        "Tìm số lượng '1' tối đa có thể đạt được.",
      en:
        "Given a binary string s ('1'=active, '0'=inactive), with imaginary '1's at both ends. " +
        "You may perform AT MOST one trade: pick a contiguous '1' block surrounded by '0's and flip it to '0', " +
        "then pick a contiguous '0' block surrounded by '1's and flip it to '1'. " +
        "Return the maximum possible number of '1's.",
    },
    defaultInput: "00111000",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi nhị phân)", en: "s (binary string)" },
    extraParams: [
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Two-pointer segment scan", en: "Approach 1: Two-pointer segment scan" } },
          { value: "2", label: { vi: "Cách 2: Sliding Window trên runs", en: "Approach 2: Sliding Window on runs" } },
        ],
      },
    ],
    approach: [
      { vi: "Đếm tổng số '1' hiện có trong s → ans.", en: "Count the existing total number of '1's in s → ans." },
      { vi: "Xoá 1 đoạn '1' bị kẹp giữa 2 đoạn '0' sẽ MERGE 2 đoạn '0' đó thành 1 đoạn lớn, có thể đổi hết thành '1'.", en: "Removing a '1' block sandwiched between two '0' blocks MERGES those '0' blocks, which can then all become '1'." },
      { vi: "Cách 1: quét trực tiếp, tính ans/mx song song trong 1 lần đi qua chuỗi.", en: "Approach 1: scan directly, computing ans/mx together in one pass over the string." },
      { vi: "Cách 2: nén chuỗi thành các đoạn (run-length encoding), rồi trượt window kích thước 3 qua mảng đoạn — nếu đoạn giữa là '1', 2 đoạn '0' hai bên là ứng viên merge.", en: "Approach 2: compress the string into runs (RLE), then slide a window of size 3 over the runs — if the middle run is '1', its two '0' neighbors are merge candidates." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1) / O(số đoạn)",
      note: {
        vi: "Cách 1: two-pointer, O(1) bộ nhớ. Cách 2: nén thành runs O(n), rồi sliding window O(số đoạn) ≤ O(n), cần O(số đoạn) bộ nhớ lưu runs.",
        en: "Approach 1: two-pointer, O(1) memory. Approach 2: compress into runs O(n), then sliding window O(number of runs) ≤ O(n), needs O(number of runs) memory to store runs.",
      },
    },
    codeLabel: { vi: "Cách 1: Two-pointer scan", en: "Approach 1: Two-pointer scan" },
    code2Label: { vi: "Cách 2: Sliding Window trên runs", en: "Approach 2: Sliding Window on runs" },
    code: [
      "class Solution:",
      "    def maxActiveSectionsAfterTrade(self, s: str) -> int:",
      "        n = len(s)",
      "        ans = 0",
      "        index = 0",
      "        pre = float('-inf')",
      "        mx = 0",
      "",
      "        while index < n:",
      "            end = index + 1",
      "            while end < n and s[end] == s[index]:",
      "                end += 1",
      "            cur = end - index",
      "",
      "            if s[index] == '1':",
      "                ans += cur",
      "            else:",
      "                mx = max(mx, pre + cur)",
      "                pre = cur",
      "",
      "            index = end",
      "",
      "        return ans + mx",
    ],
    code2: [
      "class Solution:",
      "    def maxActiveSectionsAfterTrade(self, s: str) -> int:",
      "        n = len(s)",
      "        runs = []",
      "        i = 0",
      "        while i < n:",
      "            j = i",
      "            while j < n and s[j] == s[i]:",
      "                j += 1",
      "            runs.append((s[i], j - i))",
      "            i = j",
      "",
      "        ans = sum(length for ch, length in runs if ch == '1')",
      "",
      "        mx = 0",
      "        left, right = 0, 2",
      "        while right < len(runs):",
      "            mid = left + 1",
      "            if runs[mid][0] == '1':",
      "                mx = max(mx, runs[left][1] + runs[right][1])",
      "            left += 1",
      "            right += 1",
      "",
      "        return ans + mx",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps3499Sliding(input) : buildSteps3499(input);
    },
  },
};
