// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * LeetCode 1768: Merge Strings Alternately.
 * Walk both strings by index and append one available character from each.
 */
function buildSteps1768(input, params) {
  const word1 = String(input || "");
  const word2 = String((params && params.word2) || "");
  const result = [];
  const steps = [];
  const limit = Math.max(word1.length, word2.length);

  function snapshot({ title, note, i = 0, j = 0, write = -1, source = null, codeLines = [], final = false }) {
    steps.push({
      title,
      arr: [],
      twoPointerMergeView: {
        nums1: [...word1],
        nums2: [...word2],
        result: [...result],
        resultLength: word1.length + word2.length,
        writtenResult: Array.from({ length: word1.length + word2.length }, (_, idx) => idx < result.length),
        pointers1: i < word1.length ? { i } : {},
        pointers2: j < word2.length ? { j } : {},
        pointersResult: write >= 0 ? { write } : {},
        highlight1: source === "word1" && i > 0 ? [i - 1] : [],
        highlight2: source === "word2" && j > 0 ? [j - 1] : [],
        highlightResult: write >= 0 ? [write] : [],
        label1: "word1",
        label2: "word2",
        resultLabel: "merged",
        legend1Name: "i",
        legend1Text: { vi: "ký tự tiếp theo của word1", en: "next character in word1" },
        legend2Name: "j",
        legend2Text: { vi: "ký tự tiếp theo của word2", en: "next character in word2" },
        legend3Name: "write",
        legend3Text: { vi: "vị trí vừa thêm vào kết quả", en: "position just appended to the result" },
      },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars: [
        { name: "i", value: i },
        { name: "j", value: j },
        { name: "result", value: result.join("") || '""' },
      ],
      note,
    });
  }

  snapshot({
    title: { vi: "Khởi tạo kết quả", en: "Initialize the result" },
    note: {
      vi: "Hai con trỏ bắt đầu ở đầu word1 và word2; kết quả ban đầu rỗng.",
      en: "Both pointers start at the beginning of their strings; the result is initially empty.",
    },
    codeLines: [3, 4],
  });

  let i = 0;
  let j = 0;
  for (let index = 0; index < limit; index++) {
    if (i < word1.length) {
      const ch = word1[i];
      result.push(ch);
      i++;
      snapshot({
        title: { vi: `Thêm '${ch}' từ word1`, en: `Append '${ch}' from word1` },
        note: {
          vi: `Lấy word1[${i - 1}] rồi dịch i sang vị trí ${i}.`,
          en: `Take word1[${i - 1}], then advance i to ${i}.`,
        },
        i,
        j,
        write: result.length - 1,
        source: "word1",
        codeLines: [5, 6],
      });
    }

    if (j < word2.length) {
      const ch = word2[j];
      result.push(ch);
      j++;
      snapshot({
        title: { vi: `Thêm '${ch}' từ word2`, en: `Append '${ch}' from word2` },
        note: {
          vi: `Lấy word2[${j - 1}] rồi dịch j sang vị trí ${j}.`,
          en: `Take word2[${j - 1}], then advance j to ${j}.`,
        },
        i,
        j,
        write: result.length - 1,
        source: "word2",
        codeLines: [7, 8],
      });
    }
  }

  const answer = result.join("");
  snapshot({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    note: {
      vi: "Hai chuỗi đã được xen kẽ; phần dư của chuỗi dài hơn cũng đã được thêm vào cuối.",
      en: "The strings are interleaved, including any remaining characters from the longer string.",
    },
    i,
    j,
    codeLines: [9],
    final: true,
  });

  return { word1, word2, answer, steps };
}

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
      circularDequeView: {
        buffer: buffer.slice(),
        front,
        rear,
        size,
        capacity: k,
        active: (opts.highlight || [])[0] ?? -1,
      },
      highlight: opts.highlight || [],
      mark: opts.mark || mark,
      codeLines: [opts.codeLine],
      vars: vars(opts.vars || []),
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  // Line-by-line trace of the exact code shown to the user:
  //  1  class MyCircularDeque:
  //  2      def __init__(self, k: int):
  //  3          self.data = [None] * k
  //  4          self.k = k
  //  5          self.front = 0
  //  6          self.size = 0
  //  7      def insertFront(self, value: int) -> bool:
  //  8          if self.isFull(): return False
  //  9          self.front = (self.front - 1) % self.k
  // 10          self.data[self.front] = value; self.size += 1; return True
  // 11      def insertLast(self, value: int) -> bool:
  // 12          if self.isFull(): return False
  // 13          idx = (self.front + self.size) % self.k
  // 14          self.data[idx] = value; self.size += 1; return True
  // 15      def deleteFront(self) -> bool:
  // 16          if self.isEmpty(): return False
  // 17          self.data[self.front] = None
  // 18          self.front = (self.front + 1) % self.k; self.size -= 1; return True
  // 19      def deleteLast(self) -> bool:
  // 20          if self.isEmpty(): return False
  // 21          idx = (self.front + self.size - 1) % self.k
  // 22          self.data[idx] = None; self.size -= 1; return True
  // 23      def getFront(self) -> int:
  // 24          return -1 if self.isEmpty() else self.data[self.front]
  // 25      def getRear(self) -> int:
  // 26          return -1 if self.isEmpty() else self.data[(self.front + self.size - 1) % self.k]
  // 27      def isEmpty(self) -> bool:
  // 28          return self.size == 0
  // 29      def isFull(self) -> bool:
  // 30          return self.size == self.k

  pushStep({
    title: { vi: "self.data = [None] * k", en: "self.data = [None] * k" },
    codeLine: 3,
    vars: [{ name: "operation", value: `MyCircularDeque(${k})` }],
    note: { vi: `Tạo buffer cố định ${k} ô, ban đầu toàn None.`, en: `Create a fixed buffer of ${k} slots, initially all None.` },
  });
  pushStep({
    title: { vi: `self.k = ${k}`, en: `self.k = ${k}` },
    codeLine: 4,
    note: { vi: `Lưu lại kích thước tối đa của deque.`, en: `Store the deque's maximum capacity.` },
  });
  pushStep({
    title: { vi: "self.front = 0", en: "self.front = 0" },
    codeLine: 5,
    note: { vi: `front bắt đầu tại chỉ số 0.`, en: `front starts at index 0.` },
  });
  pushStep({
    title: { vi: "self.size = 0", en: "self.size = 0" },
    codeLine: 6,
    note: { vi: `Deque rỗng, chưa có phần tử nào.`, en: `The deque is empty, no elements yet.` },
  });

  for (let stepIndex = 0; stepIndex < ops.length; stepIndex++) {
    const { name, args } = ops[stepIndex];
    const value = args[0];

    if (name === "insertFront") {
      const isFull = size === k;
      pushStep({
        title: { vi: `insertFront(${value}): isFull()? ${isFull}`, en: `insertFront(${value}): isFull()? ${isFull}` },
        codeLine: 8,
        vars: [{ name: "value", value }, { name: "isFull()", value: isFull }],
        note: {
          vi: isFull ? "Deque đã đầy → return False, không chèn gì cả." : "Deque chưa đầy → tiếp tục chèn vào đầu.",
          en: isFull ? "Deque is full → return False, nothing is inserted." : "Deque is not full → proceed to insert at the front.",
        },
      });
      if (isFull) {
        lastResult = false;
      } else {
        front = (front - 1 + k) % k;
        pushStep({
          title: { vi: `self.front = (front - 1) % k = ${front}`, en: `self.front = (front - 1) % k = ${front}` },
          codeLine: 9,
          highlight: [front],
          note: { vi: `Lùi front 1 ô theo vòng tròn để chuẩn bị chỗ chèn phía trước.`, en: `Move front back one slot circularly to make room at the front.` },
        });
        buffer[front] = value;
        size++;
        lastResult = true;
        pushStep({
          title: { vi: `data[front] = ${value}; size = ${size}; return True`, en: `data[front] = ${value}; size = ${size}; return True` },
          codeLine: 10,
          highlight: [front],
          vars: [{ name: "value", value }],
          note: { vi: `Ghi ${value} vào ô front mới, tăng size, trả về True.`, en: `Write ${value} into the new front slot, increment size, return True.` },
        });
      }
    } else if (name === "insertLast") {
      const isFull = size === k;
      pushStep({
        title: { vi: `insertLast(${value}): isFull()? ${isFull}`, en: `insertLast(${value}): isFull()? ${isFull}` },
        codeLine: 12,
        vars: [{ name: "value", value }, { name: "isFull()", value: isFull }],
        note: {
          vi: isFull ? "Deque đã đầy → return False, không chèn gì cả." : "Deque chưa đầy → tiếp tục chèn vào cuối.",
          en: isFull ? "Deque is full → return False, nothing is inserted." : "Deque is not full → proceed to insert at the back.",
        },
      });
      if (isFull) {
        lastResult = false;
      } else {
        const idx = (front + size) % k;
        pushStep({
          title: { vi: `idx = (front + size) % k = ${idx}`, en: `idx = (front + size) % k = ${idx}` },
          codeLine: 13,
          highlight: [idx],
          note: { vi: `Tính vị trí ô ngay sau phần tử cuối hiện tại (theo vòng tròn).`, en: `Compute the slot right after the current last element (wrapping around).` },
        });
        buffer[idx] = value;
        size++;
        lastResult = true;
        pushStep({
          title: { vi: `data[${idx}] = ${value}; size = ${size}; return True`, en: `data[${idx}] = ${value}; size = ${size}; return True` },
          codeLine: 14,
          highlight: [idx],
          vars: [{ name: "value", value }, { name: "insert index", value: idx }],
          note: { vi: `Ghi ${value} vào ô ${idx}, tăng size, trả về True.`, en: `Write ${value} into slot ${idx}, increment size, return True.` },
        });
      }
    } else if (name === "deleteFront") {
      const isEmptyNow = size === 0;
      pushStep({
        title: { vi: `deleteFront(): isEmpty()? ${isEmptyNow}`, en: `deleteFront(): isEmpty()? ${isEmptyNow}` },
        codeLine: 16,
        note: {
          vi: isEmptyNow ? "Deque rỗng → return False, không xóa gì cả." : "Deque còn phần tử → tiếp tục xóa ở đầu.",
          en: isEmptyNow ? "Deque is empty → return False, nothing is removed." : "Deque has elements → proceed to remove from the front.",
        },
      });
      if (isEmptyNow) {
        lastResult = false;
      } else {
        const oldFront = front;
        const removed = buffer[oldFront];
        buffer[oldFront] = null;
        pushStep({
          title: { vi: `data[front] = None (xóa ${removed})`, en: `data[front] = None (removing ${removed})` },
          codeLine: 17,
          highlight: [oldFront],
          vars: [{ name: "removed", value: removed }],
          note: { vi: `Xóa giá trị ${removed} đang ở ô front.`, en: `Clear the value ${removed} currently at the front slot.` },
        });
        front = (front + 1) % k;
        size--;
        if (size === 0) front = 0;
        lastResult = true;
        pushStep({
          title: { vi: `front = (front + 1) % k = ${front}; size = ${size}; return True`, en: `front = (front + 1) % k = ${front}; size = ${size}; return True` },
          codeLine: 18,
          highlight: size > 0 ? [front] : [],
          note: { vi: `Tiến front lên 1 ô theo vòng tròn, giảm size, trả về True.`, en: `Advance front one slot circularly, decrement size, return True.` },
        });
      }
    } else if (name === "deleteLast") {
      const isEmptyNow = size === 0;
      pushStep({
        title: { vi: `deleteLast(): isEmpty()? ${isEmptyNow}`, en: `deleteLast(): isEmpty()? ${isEmptyNow}` },
        codeLine: 20,
        note: {
          vi: isEmptyNow ? "Deque rỗng → return False, không xóa gì cả." : "Deque còn phần tử → tiếp tục xóa ở cuối.",
          en: isEmptyNow ? "Deque is empty → return False, nothing is removed." : "Deque has elements → proceed to remove from the back.",
        },
      });
      if (isEmptyNow) {
        lastResult = false;
      } else {
        const idx = rearIndex();
        pushStep({
          title: { vi: `idx = (front + size - 1) % k = ${idx}`, en: `idx = (front + size - 1) % k = ${idx}` },
          codeLine: 21,
          highlight: [idx],
          note: { vi: `Tính vị trí phần tử cuối hiện tại (theo vòng tròn).`, en: `Compute the position of the current last element (wrapping around).` },
        });
        const removed = buffer[idx];
        buffer[idx] = null;
        size--;
        if (size === 0) front = 0;
        lastResult = true;
        pushStep({
          title: { vi: `data[${idx}] = None (xóa ${removed}); size = ${size}; return True`, en: `data[${idx}] = None (removing ${removed}); size = ${size}; return True` },
          codeLine: 22,
          highlight: [idx],
          vars: [{ name: "removed", value: removed }],
          note: { vi: `Xóa giá trị ${removed} ở ô cuối, giảm size, trả về True.`, en: `Clear the value ${removed} at the back slot, decrement size, return True.` },
        });
      }
    } else if (name === "getFront") {
      lastResult = size === 0 ? -1 : buffer[front];
      pushStep({
        title: { vi: `getFront() → ${lastResult}`, en: `getFront() → ${lastResult}` },
        codeLine: 24,
        highlight: size === 0 ? [] : [front],
        note: {
          vi: size === 0 ? "Deque rỗng, trả về -1." : `Giá trị ở front là data[${front}] = ${lastResult}.`,
          en: size === 0 ? "Deque is empty, return -1." : `The value at front is data[${front}] = ${lastResult}.`,
        },
      });
    } else if (name === "getRear") {
      const rear = rearIndex();
      lastResult = size === 0 ? -1 : buffer[rear];
      pushStep({
        title: { vi: `getRear() → ${lastResult}`, en: `getRear() → ${lastResult}` },
        codeLine: 26,
        highlight: rear >= 0 ? [rear] : [],
        note: {
          vi: size === 0 ? "Deque rỗng, trả về -1." : `Giá trị ở rear là data[${rear}] = ${lastResult}.`,
          en: size === 0 ? "Deque is empty, return -1." : `The value at rear is data[${rear}] = ${lastResult}.`,
        },
      });
    } else if (name === "isEmpty") {
      lastResult = size === 0;
      pushStep({
        title: { vi: `isEmpty() → ${lastResult}`, en: `isEmpty() → ${lastResult}` },
        codeLine: 28,
        note: { vi: `size == 0 là ${lastResult}.`, en: `size == 0 is ${lastResult}.` },
      });
    } else if (name === "isFull") {
      lastResult = size === k;
      pushStep({
        title: { vi: `isFull() → ${lastResult}`, en: `isFull() → ${lastResult}` },
        codeLine: 30,
        note: { vi: `size == k là ${lastResult}.`, en: `size == k is ${lastResult}.` },
      });
    }
  }

  pushStep({
    title: { vi: "Hoàn tất các thao tác", en: "Finished operations" },
    codeLine: 30,
    final: true,
    vars: [{ name: "answer", value: lastResult === null ? "None" : lastResult }],
    note: {
      vi: `Đã xử lý xong. Deque hiện tại = [${dequeValues().join(", ")}].`,
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
function buildSteps394(input, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps394CharStack(input);
  return buildSteps394Main(input);
}

function buildSteps394Main(input) {
  const s = String(input).trim();
  const chars = s.split("");
  const stack = [];
  const steps = [];
  let current;
  let number;

  function frameItems() {
    return stack.map((frame) => ({
      value: `("${frame.prefix}", ${frame.repeat})`,
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
 * LeetCode 394, approach 2: single character stack.
 * Push every character (digit, '[', or letter) onto the stack one at a
 * time. At ']': pop characters until '[' is found to collect the nested
 * substring, discard the '[', pop any digit characters below it to build
 * the repeat count, then push the expanded (repeated) substring back onto
 * the stack as one combined item. At the end, join every stack item.
 */
function buildSteps394CharStack(input) {
  const s = String(input).trim();
  const chars = s.split("");
  const stack = []; // each entry: a string (may be multi-char once expanded)
  const steps = [];

  function frameItems() {
    // Show newest on top, like the reference image (top of stack = last pushed).
    return stack.map((item) => ({ value: item }));
  }

  function stackLabel() {
    return stack.length ? `[${stack.map((v) => `"${v}"`).join(", ")}]` : "[]";
  }

  function pushStep({ title, codeLines, current, status, vars, note, final = false }) {
    steps.push({
      title,
      codeBlock: 2,
      codeLines,
      stackView: {
        title: "Stack",
        emptyLabel: "empty stack",
        items: frameItems(),
        input: chars,
        current: Number.isInteger(current) ? current : -1,
        inputLabel: "Encoded string",
        status: status || [],
      },
      vars: [{ name: "stack", value: stackLabel() }, ...(vars || [])],
      note,
      final,
    });
  }

  pushStep({
    title: { vi: "stack = []", en: "stack = []" },
    codeLines: [3],
    vars: [{ name: "s", value: `"${s}"` }],
    note: {
      vi: "Mỗi ký tự (chữ số, '[', chữ cái) sẽ được đẩy lên stack lần lượt, không xử lý gì thêm cho đến khi gặp ']'.",
      en: "Every character (digit, '[', or letter) is pushed onto the stack one at a time, with no extra processing until ']' is seen.",
    },
  });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    pushStep({
      title: { vi: `for ch in s: ch = '${ch}'`, en: `for ch in s: ch = '${ch}'` },
      codeLines: [4],
      current: i,
      status: [{ label: "ch", value: `'${ch}'` }],
      vars: [{ name: "i", value: i }, { name: "ch", value: `'${ch}'` }],
      note: { vi: `Xét ký tự s[${i}] = '${ch}'.`, en: `Process character s[${i}] = '${ch}'.` },
    });

    const isClosing = ch === "]";
    pushStep({
      title: { vi: `ch != ']'? ${!isClosing}`, en: `ch != ']'? ${!isClosing}` },
      codeLines: [5],
      current: i,
      status: [{ label: "ch", value: `'${ch}'` }, { label: "is ']'?", value: isClosing }],
      vars: [{ name: "ch != ']'?", value: !isClosing }],
      note: isClosing
        ? { vi: "Gặp ']' → cần giải nén nhóm hiện tại, không push trực tiếp.", en: "Found ']' → need to expand the current group instead of pushing directly." }
        : { vi: "Không phải ']' (chữ số, '[' hoặc chữ cái) → push thẳng vào stack.", en: "Not ']' (digit, '[', or letter) → push it straight onto the stack." },
    });

    if (!isClosing) {
      stack.push(ch);
      pushStep({
        title: { vi: `Push '${ch}' to stack`, en: `Push '${ch}' to stack` },
        codeLines: [6],
        current: i,
        status: [{ label: "pushed", value: `'${ch}'` }],
        vars: [{ name: "action", value: `stack.append('${ch}')` }],
        note: { vi: `Đẩy '${ch}' lên đỉnh stack.`, en: `Push '${ch}' onto the top of the stack.` },
      });
      continue;
    }

    // ch === ']': collect the nested substring by popping until '['.
    pushStep({
      title: { vi: "substr = \"\"", en: "substr = \"\"" },
      codeLines: [8],
      current: i,
      vars: [{ name: "substr", value: '""' }],
      note: { vi: "Chuẩn bị ghép lại chuỗi con nằm trong nhóm [...] vừa đóng.", en: "Prepare to reassemble the nested substring inside the group that just closed." },
    });

    let substr = "";
    while (stack.length && stack[stack.length - 1] !== "[") {
      const top = stack[stack.length - 1];
      pushStep({
        title: { vi: `stack[-1] = '${top}' != '['? true`, en: `stack[-1] = '${top}' != '['? true` },
        codeLines: [9],
        current: i,
        status: [{ label: "top", value: `'${top}'` }],
        note: { vi: `Đỉnh stack '${top}' chưa phải '[' → tiếp tục pop để ghép substr.`, en: `The top of the stack '${top}' isn't '[' yet → keep popping to build substr.` },
      });
      stack.pop();
      substr = top + substr;
      pushStep({
        title: { vi: `substr = '${top}' + substr = "${substr}"`, en: `substr = '${top}' + substr = "${substr}"` },
        codeLines: [10],
        current: i,
        status: [{ label: "popped", value: `'${top}'` }, { label: "substr", value: `"${substr}"` }],
        vars: [{ name: "substr", value: `"${substr}"` }],
        note: { vi: `Pop '${top}' ra khỏi stack, ghép vào phía trước substr.`, en: `Pop '${top}' off the stack and prepend it to substr.` },
      });
    }
    pushStep({
      title: { vi: `stack[-1] = '[' → dừng vòng lặp`, en: `stack[-1] = '[' → stop the loop` },
      codeLines: [9],
      current: i,
      status: [{ label: "substr collected", value: `"${substr}"` }],
      note: { vi: `Đã gặp '[' ở đỉnh stack → đã lấy đủ chuỗi con "${substr}".`, en: `Found '[' at the top of the stack → the nested substring "${substr}" is fully collected.` },
    });

    stack.pop(); // remove '['
    pushStep({
      title: { vi: "stack.pop() — bỏ '['", en: "stack.pop() — discard '['" },
      codeLines: [11],
      current: i,
      vars: [{ name: "action", value: "stack.pop()  # remove '['" }],
      note: { vi: "Loại bỏ dấu '[' vì đã dùng nó để xác định biên chuỗi con.", en: "Discard the '[' marker since it has served its purpose of bounding the substring." },
    });

    pushStep({
      title: { vi: "k = \"\"", en: "k = \"\"" },
      codeLines: [12],
      current: i,
      vars: [{ name: "k", value: '""' }],
      note: { vi: "Chuẩn bị ghép lại số lần lặp (có thể nhiều chữ số).", en: "Prepare to reassemble the repeat count (which may span multiple digits)." },
    });

    let k = "";
    while (stack.length && /\d/.test(stack[stack.length - 1])) {
      const digit = stack[stack.length - 1];
      pushStep({
        title: { vi: `stack[-1] = '${digit}' isdigit()? true`, en: `stack[-1] = '${digit}' isdigit()? true` },
        codeLines: [13],
        current: i,
        status: [{ label: "top", value: `'${digit}'` }],
        note: { vi: `Đỉnh stack '${digit}' là chữ số → tiếp tục pop để ghép k.`, en: `The top of the stack '${digit}' is a digit → keep popping to build k.` },
      });
      stack.pop();
      k = digit + k;
      pushStep({
        title: { vi: `k = '${digit}' + k = "${k}"`, en: `k = '${digit}' + k = "${k}"` },
        codeLines: [14],
        current: i,
        status: [{ label: "popped", value: `'${digit}'` }, { label: "k", value: `"${k}"` }],
        vars: [{ name: "k", value: `"${k}"` }],
        note: { vi: `Pop '${digit}' ra khỏi stack, ghép vào phía trước k.`, en: `Pop '${digit}' off the stack and prepend it to k.` },
      });
    }
    pushStep({
      title: { vi: `stack rỗng hoặc stack[-1] không phải chữ số → dừng`, en: `stack empty or stack[-1] isn't a digit → stop` },
      codeLines: [13],
      current: i,
      status: [{ label: "k collected", value: k || "(none)" }],
      note: { vi: `Đã lấy đủ số lần lặp k = "${k || 0}".`, en: `The repeat count k = "${k || 0}" is fully collected.` },
    });

    const repeat = Number(k || 0);
    const expanded = substr.repeat(repeat);
    stack.push(expanded);
    pushStep({
      title: { vi: `stack.append(int(k) * substr) → push "${expanded}"`, en: `stack.append(int(k) * substr) → push "${expanded}"` },
      codeLines: [15],
      current: i,
      status: [{ label: "k", value: repeat }, { label: "substr", value: `"${substr}"` }, { label: "expanded", value: `"${expanded}"` }],
      vars: [{ name: "int(k) * substr", value: `${repeat} * "${substr}" = "${expanded}"` }],
      note: { vi: `Nhân substr "${substr}" lên ${repeat} lần thành "${expanded}", đẩy lại vào stack như 1 phần tử duy nhất.`, en: `Repeat substr "${substr}" ${repeat} time(s) into "${expanded}", pushing it back as a single stack item.` },
    });
  }

  const answer = stack.join("");
  pushStep({
    title: { vi: `return "".join(stack) = "${answer}"`, en: `return "".join(stack) = "${answer}"` },
    codeLines: [16],
    current: chars.length,
    status: [{ label: "answer", value: `"${answer}"` }],
    vars: [{ name: "answer", value: `"${answer}"` }],
    note: { vi: `Ghép toàn bộ phần tử còn lại trong stack thành chuỗi kết quả "${answer}".`, en: `Join every remaining stack item into the final decoded string "${answer}".` },
    final: true,
  });

  return { s, answer, steps };
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

/**
 * LeetCode 3501: Maximize Active Section with Trade II.
 *
 * Query version of 3499. For each substring s[l..r], only zero runs fully
 * inside the query and the cut pieces of zero runs touching l/r can contribute
 * to the trade gain. The final answer for a query is total ones in the whole
 * string plus the best available gain inside that query.
 */
function buildSteps3501(input, params) {
  const s = String(input || "").trim();
  const n = s.length;
  const chars = s.split("");
  const values = chars.map((c) => (c === "1" ? 1 : 0.4));
  const steps = [];

  function range(l, r) {
    if (l > r) return [];
    return Array.from({ length: r - l + 1 }, (_, i) => l + i);
  }

  function parseQueries(raw) {
    const parts = String(raw || "").split(";").map((q) => q.trim()).filter(Boolean);
    const queries = parts.map((part) => {
      const nums = part.split(/[,\s]+/).map(Number).filter((x) => Number.isInteger(x));
      return nums.length >= 2 ? [nums[0], nums[1]] : null;
    }).filter(Boolean);
    return queries.length ? queries : [[0, Math.max(0, n - 1)]];
  }

  function getZeroGroups() {
    const groups = [];
    const indexAt = [];
    const trace = [];
    const record = (line, kind, i = -1, extra = {}) => {
      trace.push({
        line,
        kind,
        i,
        groups: groups.map((group) => ({ ...group })),
        indexAt: [...indexAt],
        ...extra,
      });
    };

    record(26, "init-groups");
    record(27, "init-index");
    for (let i = 0; i < n; i++) {
      record(28, "loop", i);
      record(29, "is-zero", i, { result: s[i] === "0" });
      if (s[i] === "0") {
        const continuesGroup = i > 0 && s[i - 1] === "0";
        record(30, "continues-group", i, { result: continuesGroup });
        if (i > 0 && s[i - 1] === "0") {
          groups[groups.length - 1].end = i;
          record(31, "extend-end", i, { groupId: groups.length - 1 });
          groups[groups.length - 1].length += 1;
          record(32, "extend-length", i, { groupId: groups.length - 1 });
        } else {
          record(33, "new-group-else", i);
          groups.push({ start: i, end: i, length: 1, id: groups.length });
          record(34, "new-group", i, { groupId: groups.length - 1 });
        }
      }
      indexAt.push(groups.length - 1);
      record(35, "append-index", i, { groupId: groups.length - 1 });
    }
    record(36, "return");
    return { groups, indexAt, trace };
  }

  function groupLabel(groups) {
    return `[${groups.map((g, i) => `z${i}:[${g.start},${g.end}] len=${g.length}`).join("; ")}]`;
  }

  function addCandidate(candidates, key, label, gain, ranges, zeroGroupIds, codeLine) {
    if (gain <= 0) return;
    candidates.push({ key, label, gain, ranges, zeroGroupIds, codeLine });
  }

  function markRanges(ranges) {
    return ranges.flatMap(([a, b]) => range(a, b));
  }

  if (n === 0 || /[^01]/.test(s)) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: values,
      sub: chars,
      highlight: [],
      mark: [],
      final: true,
      codeLines: [2],
      vars: [{ name: "s", value: `"${s}"` }],
      note: {
        vi: "s phải là chuỗi nhị phân không rỗng.",
        en: "s must be a non-empty binary string.",
      },
    });
    return { original: s, answer: "[]", steps };
  }

  const queries = parseQueries(params && params.queries);
  const ones = chars.filter((ch) => ch === "1").length;
  const { groups: zeroGroups, indexAt: zeroGroupIndex, trace: zeroGroupTrace } = getZeroGroups();
  const answers = [];

  steps.push({
    title: { vi: `ones = s.count('1') = ${ones}`, en: `ones = s.count('1') = ${ones}` },
    arr: values,
    sub: chars,
    highlight: chars.map((ch, i) => (ch === "1" ? i : -1)).filter((i) => i >= 0),
    mark: [],
    codeLines: [3],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "ones", value: ones },
    ],
    note: {
      vi: `Đếm tổng số '1' trong toàn chuỗi trước. Mỗi query sẽ trả về ones + gain tốt nhất.`,
      en: `Count total '1's in the whole string first. Each query returns ones + best gain.`,
    },
  });

  steps.push({
    title: { vi: "Gọi self.getZeroGroups(s)", en: "Call self.getZeroGroups(s)" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "next", value: "getZeroGroups" },
    ],
    note: {
      vi: "Debugger đi vào helper để xem cách chuỗi được nén thành các đoạn '0'.",
      en: "The debugger enters the helper to show how the string is compressed into zero runs.",
    },
  });

  steps.push({
    title: { vi: "Vào hàm getZeroGroups", en: "Enter getZeroGroups" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [25],
    vars: [{ name: "s", value: `"${s}"` }],
    note: {
      vi: "Helper trả về zeroGroups và zeroGroupIndex. zeroGroupIndex[i] là id đoạn '0' gần nhất tại hoặc bên trái i.",
      en: "The helper returns zeroGroups and zeroGroupIndex. zeroGroupIndex[i] is the zero-run id at or immediately left of i.",
    },
  });

  for (const event of zeroGroupTrace) {
    const eventGroups = event.groups;
    const eventMark = eventGroups.flatMap((group) => range(group.start, group.end));
    const eventHighlight = event.i >= 0 ? [event.i] : [];
    let title;
    let note;

    switch (event.kind) {
      case "init-groups":
        title = { vi: "zeroGroups = []", en: "zeroGroups = []" };
        note = { vi: "Khởi tạo danh sách chứa từng đoạn '0' liên tiếp.", en: "Initialize the list of contiguous zero runs." };
        break;
      case "init-index":
        title = { vi: "zeroGroupIndex = []", en: "zeroGroupIndex = []" };
        note = { vi: "Mảng này ánh xạ mỗi vị trí sang id zeroGroup gần nhất bên trái.", en: "This array maps each position to the nearest zero-run id on its left." };
        break;
      case "loop":
        title = { vi: `for i, ch in enumerate(s): i=${event.i}, ch='${s[event.i]}'`, en: `for i, ch in enumerate(s): i=${event.i}, ch='${s[event.i]}'` };
        note = { vi: `Xét ký tự s[${event.i}] = '${s[event.i]}'.`, en: `Inspect s[${event.i}] = '${s[event.i]}'.` };
        break;
      case "is-zero":
        title = { vi: `if ch == '0' → ${event.result}`, en: `if ch == '0' → ${event.result}` };
        note = event.result
          ? { vi: "Đây là '0', cần tạo đoạn mới hoặc nối vào đoạn hiện tại.", en: "This is '0', so either create a run or extend the current one." }
          : { vi: "Đây là '1', không thay đổi zeroGroups.", en: "This is '1', so zeroGroups does not change." };
        break;
      case "continues-group":
        title = { vi: `if i > 0 and s[i - 1] == '0' → ${event.result}`, en: `if i > 0 and s[i - 1] == '0' → ${event.result}` };
        note = event.result
          ? { vi: "Ký tự trước cũng là '0', nên nối vào zeroGroup cuối.", en: "The previous character is also '0', so extend the last zero run." }
          : { vi: "Ký tự này bắt đầu một zeroGroup mới.", en: "This character starts a new zero run." };
        break;
      case "extend-end":
        title = { vi: `zeroGroups[-1]['end'] = ${event.i}`, en: `zeroGroups[-1]['end'] = ${event.i}` };
        note = { vi: `Cập nhật điểm cuối của z${event.groupId} tới index ${event.i}.`, en: `Move the end of z${event.groupId} to index ${event.i}.` };
        break;
      case "extend-length":
        title = { vi: `zeroGroups[-1]['length'] += 1`, en: `zeroGroups[-1]['length'] += 1` };
        note = { vi: `Độ dài z${event.groupId} tăng thành ${eventGroups[event.groupId].length}.`, en: `The length of z${event.groupId} becomes ${eventGroups[event.groupId].length}.` };
        break;
      case "new-group-else":
        title = { vi: "else: bắt đầu zeroGroup mới", en: "else: start a new zero run" };
        note = { vi: "Không thể nối với đoạn trước, chuyển sang nhánh tạo group.", en: "It cannot extend the previous run, so take the new-group branch." };
        break;
      case "new-group":
        title = { vi: `zeroGroups.append({start: ${event.i}, end: ${event.i}, length: 1})`, en: `zeroGroups.append({start: ${event.i}, end: ${event.i}, length: 1})` };
        note = { vi: `Tạo z${event.groupId} bắt đầu tại index ${event.i}.`, en: `Create z${event.groupId} starting at index ${event.i}.` };
        break;
      case "append-index":
        title = { vi: `zeroGroupIndex.append(${event.groupId})`, en: `zeroGroupIndex.append(${event.groupId})` };
        note = event.groupId >= 0
          ? { vi: `Vị trí ${event.i} ánh xạ tới z${event.groupId}.`, en: `Position ${event.i} maps to z${event.groupId}.` }
          : { vi: `Chưa có đoạn '0' nào ở bên trái vị trí ${event.i}, nên lưu -1.`, en: `No zero run exists to the left of position ${event.i}, so store -1.` };
        break;
      default:
        title = { vi: "return zeroGroups, zeroGroupIndex", en: "return zeroGroups, zeroGroupIndex" };
        note = { vi: "Hoàn tất nén các đoạn '0' và trả kết quả về hàm chính.", en: "Finish compressing zero runs and return both results to the main method." };
    }

    steps.push({
      title,
      arr: values,
      sub: chars,
      highlight: eventHighlight,
      mark: eventMark,
      codeLines: [event.line],
      vars: [
        ...(event.i >= 0 ? [{ name: "i", value: event.i }, { name: "ch", value: `'${s[event.i]}'` }] : []),
        { name: "zeroGroups", value: groupLabel(eventGroups) },
        { name: "zeroGroupIndex", value: `[${event.indexAt.join(", ")}]` },
      ],
      note,
    });
  }

  steps.push({
    title: { vi: "Nhận kết quả từ getZeroGroups", en: "Receive getZeroGroups result" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: zeroGroups.flatMap((group) => range(group.start, group.end)),
    codeLines: [4],
    vars: [
      { name: "zeroGroups", value: groupLabel(zeroGroups) },
      { name: "zeroGroupIndex", value: `[${zeroGroupIndex.join(", ")}]` },
      { name: "queries", value: `[${queries.map(([l, r]) => `[${l},${r}]`).join(", ")}]` },
    ],
    note: {
      vi: "Quay lại hàm chính với đầy đủ các zeroGroup và mảng ánh xạ vị trí.",
      en: "Return to the main method with all zero runs and the position mapping.",
    },
  });

  steps.push({
    title: { vi: `if not zeroGroups → ${zeroGroups.length === 0}`, en: `if not zeroGroups → ${zeroGroups.length === 0}` },
    arr: values,
    sub: chars,
    highlight: [],
    mark: zeroGroups.flatMap((g) => range(g.start, g.end)),
    codeLines: [5],
    vars: [{ name: "zeroGroups.length", value: zeroGroups.length }],
    note: {
      vi: zeroGroups.length === 0 ? "Không có đoạn '0', mọi query giữ nguyên số '1'." : "Có ít nhất một đoạn '0', tiếp tục xử lý từng query.",
      en: zeroGroups.length === 0 ? "There are no zero runs, so every query keeps the original one count." : "There is at least one zero run, so continue processing each query.",
    },
  });

  if (zeroGroups.length === 0) {
    const answer = Array(queries.length).fill(ones);
    steps.push({
      title: { vi: `return [ones] * len(queries)`, en: `return [ones] * len(queries)` },
      arr: values,
      sub: chars,
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: `[${answer.join(", ")}]` }],
      note: {
        vi: "Chuỗi toàn '1', không trade nào tăng thêm được. Mọi query trả về ones.",
        en: "The string is all '1's, so no trade can add active sections. Every query returns ones.",
      },
    });
    return { original: s, answer: `[${answer.join(", ")}]`, steps };
  }

  steps.push({
    title: { vi: "ans = []", en: "ans = []" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [8],
    vars: [{ name: "ans", value: "[]" }],
    note: {
      vi: "Tạo mảng kết quả, mỗi query sẽ append một đáp án.",
      en: "Create the result array; each query appends one answer.",
    },
  });

  for (let qi = 0; qi < queries.length; qi++) {
    let [l, r] = queries[qi];
    l = Math.max(0, Math.min(l, n - 1));
    r = Math.max(0, Math.min(r, n - 1));
    if (l > r) [l, r] = [r, l];

    const queryRange = range(l, r);
    const leftGroupIndex = zeroGroupIndex[l];
    const rightGroupIndex = zeroGroupIndex[r];
    const left = s[l] === "0" ? zeroGroups[leftGroupIndex].end - l + 1 : 0;
    const right = s[r] === "0" ? r - zeroGroups[rightGroupIndex].start + 1 : 0;
    const innerStart = leftGroupIndex + 1;
    const innerEnd = s[r] === "1" ? rightGroupIndex : rightGroupIndex - 1;
    const candidates = [];

    steps.push({
      title: { vi: `for l, r in queries → query ${qi}: [${l}, ${r}]`, en: `for l, r in queries → query ${qi}: [${l}, ${r}]` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: [],
      codeLines: [9],
      vars: [
        { name: "query index", value: qi },
        { name: "l", value: l },
        { name: "r", value: r },
      ],
      note: {
        vi: `Bắt đầu xử lý query [${l},${r}]. Trade chỉ được tính trong đoạn đang highlight.`,
        en: `Start processing query [${l},${r}]. The trade is restricted to the highlighted range.`,
      },
    });

    steps.push({
      title: { vi: `left = ${left}`, en: `left = ${left}` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: s[l] === "0" ? range(l, zeroGroups[leftGroupIndex].end) : [],
      codeLines: [10],
      vars: [
        { name: "s[l]", value: s[l] },
        { name: "zeroGroupIndex[l]", value: leftGroupIndex },
        { name: "left cut", value: left },
      ],
      note: {
        vi: s[l] === "0"
          ? `l nằm trong z${leftGroupIndex}; phần đoạn '0' còn lại từ l tới cuối z${leftGroupIndex} dài ${left}.`
          : "s[l] là '1', nên biên trái không cắt qua đoạn '0'. left = 0.",
        en: s[l] === "0"
          ? `l is inside z${leftGroupIndex}; the remaining zero piece from l to the end of z${leftGroupIndex} has length ${left}.`
          : "s[l] is '1', so the left boundary does not cut a zero run. left = 0.",
      },
    });

    steps.push({
      title: { vi: `right = ${right}`, en: `right = ${right}` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: s[r] === "0" ? range(zeroGroups[rightGroupIndex].start, r) : [],
      codeLines: [11],
      vars: [
        { name: "s[r]", value: s[r] },
        { name: "zeroGroupIndex[r]", value: rightGroupIndex },
        { name: "right cut", value: right },
      ],
      note: {
        vi: s[r] === "0"
          ? `r nằm trong z${rightGroupIndex}; phần đoạn '0' từ đầu z${rightGroupIndex} tới r dài ${right}.`
          : "s[r] là '1', nên biên phải không cắt qua đoạn '0'. right = 0.",
        en: s[r] === "0"
          ? `r is inside z${rightGroupIndex}; the zero piece from the start of z${rightGroupIndex} to r has length ${right}.`
          : "s[r] is '1', so the right boundary does not cut a zero run. right = 0.",
      },
    });

    steps.push({
      title: { vi: "candidates = []", en: "candidates = []" },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: [],
      codeLines: [12],
      vars: [
        { name: "candidates", value: "[]" },
        { name: "inner zero groups", value: innerStart <= innerEnd ? `z${innerStart}..z${innerEnd}` : "none" },
      ],
      note: {
        vi: "Bắt đầu với danh sách candidate rỗng, rồi thử từng loại candidate để cuối cùng lấy max.",
        en: "Start with an empty candidate list, then test each candidate type and take the max at the end.",
      },
    });

    const edgeEdgeOk = s[l] === "0" && s[r] === "0" && leftGroupIndex + 1 === rightGroupIndex;
    steps.push({
      title: { vi: `if left cut + right cut → ${edgeEdgeOk}`, en: `if left cut + right cut → ${edgeEdgeOk}` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: edgeEdgeOk ? [range(l, zeroGroups[leftGroupIndex].end), range(zeroGroups[rightGroupIndex].start, r)].flat() : [],
      codeLines: [13],
      vars: [
        { name: "s[l]", value: s[l] },
        { name: "s[r]", value: s[r] },
        { name: "zeroGroupIndex[l] + 1", value: leftGroupIndex + 1 },
        { name: "zeroGroupIndex[r]", value: rightGroupIndex },
      ],
      note: {
        vi: edgeEdgeOk
          ? "Hai biên đều cắt đoạn '0' và chỉ cách nhau đúng một zeroGroup, nên có thể ghép left + right."
          : "Không rơi vào case hai biên cùng cắt hai zeroGroup kề nhau.",
        en: edgeEdgeOk
          ? "Both boundaries cut zero runs that are adjacent through one middle one-run, so left + right is a candidate."
          : "This is not the case where both boundaries cut two adjacent zero runs.",
      },
    });

    if (edgeEdgeOk) {
      addCandidate(
        candidates,
        "edge-edge",
        { vi: "left cut + right cut", en: "left cut + right cut" },
        left + right,
        [[l, zeroGroups[leftGroupIndex].end], [zeroGroups[rightGroupIndex].start, r]],
        [leftGroupIndex, rightGroupIndex],
        14
      );
      steps.push({
        title: { vi: `candidates.append(left + right) = ${left + right}`, en: `candidates.append(left + right) = ${left + right}` },
        arr: values,
        sub: chars,
        highlight: queryRange,
        mark: [range(l, zeroGroups[leftGroupIndex].end), range(zeroGroups[rightGroupIndex].start, r)].flat(),
        codeLines: [14],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "candidate gain", value: left + right },
        ],
        note: {
          vi: `Candidate này thêm được ${left} + ${right} = ${left + right} số '1'.`,
          en: `This candidate adds ${left} + ${right} = ${left + right} active sections.`,
        },
      });
    }

    steps.push({
      title: { vi: `for g in complete zero pairs`, en: `for g in complete zero pairs` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: innerStart < innerEnd ? range(zeroGroups[innerStart].start, zeroGroups[innerEnd].end) : [],
      codeLines: [15],
      vars: [
        { name: "range start", value: innerStart },
        { name: "range end exclusive", value: innerEnd },
        { name: "iterations", value: Math.max(0, innerEnd - innerStart) },
      ],
      note: {
        vi: innerStart < innerEnd
          ? "Duyệt các cặp zeroGroup hoàn chỉnh nằm bên trong query."
          : "Không có đủ hai zeroGroup hoàn chỉnh bên trong query để duyệt.",
        en: innerStart < innerEnd
          ? "Iterate complete adjacent zero-group pairs fully inside the query."
          : "There are not enough complete zero groups inside the query to iterate.",
      },
    });

    for (let g = innerStart; g < innerEnd; g++) {
      const pairGain = zeroGroups[g].length + zeroGroups[g + 1].length;
      addCandidate(
        candidates,
        `inside-${g}`,
        { vi: `z${g} + z${g + 1} hoàn chỉnh`, en: `complete z${g} + z${g + 1}` },
        pairGain,
        [[zeroGroups[g].start, zeroGroups[g].end], [zeroGroups[g + 1].start, zeroGroups[g + 1].end]],
        [g, g + 1],
        16
      );
      steps.push({
        title: { vi: `g=${g}: candidates.append(...) = ${pairGain}`, en: `g=${g}: candidates.append(...) = ${pairGain}` },
        arr: values,
        sub: chars,
        highlight: queryRange,
        mark: [range(zeroGroups[g].start, zeroGroups[g].end), range(zeroGroups[g + 1].start, zeroGroups[g + 1].end)].flat(),
        codeLines: [16],
        vars: [
          { name: "g", value: g },
          { name: `z${g}.length`, value: zeroGroups[g].length },
          { name: `z${g + 1}.length`, value: zeroGroups[g + 1].length },
          { name: "candidate gain", value: pairGain },
        ],
        note: {
          vi: `Nếu xoá đoạn '1' giữa z${g} và z${g + 1}, gain = ${zeroGroups[g].length} + ${zeroGroups[g + 1].length} = ${pairGain}.`,
          en: `If the one-run between z${g} and z${g + 1} is removed, gain = ${zeroGroups[g].length} + ${zeroGroups[g + 1].length} = ${pairGain}.`,
        },
      });
    }

    const leftInsideOk = s[l] === "0" && leftGroupIndex + 1 <= innerEnd;
    steps.push({
      title: { vi: `if left cut + next full run → ${leftInsideOk}`, en: `if left cut + next full run → ${leftInsideOk}` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: leftInsideOk ? [range(l, zeroGroups[leftGroupIndex].end), range(zeroGroups[leftGroupIndex + 1].start, zeroGroups[leftGroupIndex + 1].end)].flat() : [],
      codeLines: [17],
      vars: [
        { name: "s[l]", value: s[l] },
        { name: "zeroGroupIndex[l] + 1", value: leftGroupIndex + 1 },
        { name: "innerEnd", value: innerEnd },
      ],
      note: {
        vi: leftInsideOk
          ? "Biên trái cắt một zeroGroup và zeroGroup kế tiếp nằm trọn trong query."
          : "Không có candidate kiểu left cut + zeroGroup kế tiếp.",
        en: leftInsideOk
          ? "The left boundary cuts a zero run and the next zero run is fully inside the query."
          : "There is no left cut + next full zero run candidate.",
      },
    });

    if (leftInsideOk) {
      const leftInsideGain = left + zeroGroups[leftGroupIndex + 1].length;
      addCandidate(
        candidates,
        "left-inside",
        { vi: "left cut + zero group kế tiếp", en: "left cut + next full zero group" },
        leftInsideGain,
        [[l, zeroGroups[leftGroupIndex].end], [zeroGroups[leftGroupIndex + 1].start, zeroGroups[leftGroupIndex + 1].end]],
        [leftGroupIndex, leftGroupIndex + 1],
        18
      );
      steps.push({
        title: { vi: `candidates.append(left + next) = ${leftInsideGain}`, en: `candidates.append(left + next) = ${leftInsideGain}` },
        arr: values,
        sub: chars,
        highlight: queryRange,
        mark: [range(l, zeroGroups[leftGroupIndex].end), range(zeroGroups[leftGroupIndex + 1].start, zeroGroups[leftGroupIndex + 1].end)].flat(),
        codeLines: [18],
        vars: [
          { name: "left", value: left },
          { name: `z${leftGroupIndex + 1}.length`, value: zeroGroups[leftGroupIndex + 1].length },
          { name: "candidate gain", value: leftInsideGain },
        ],
        note: {
          vi: `Candidate này thêm ${left} + ${zeroGroups[leftGroupIndex + 1].length} = ${leftInsideGain}.`,
          en: `This candidate adds ${left} + ${zeroGroups[leftGroupIndex + 1].length} = ${leftInsideGain}.`,
        },
      });
    }

    const insideRightOk = s[r] === "0" && leftGroupIndex < rightGroupIndex - 1;
    steps.push({
      title: { vi: `if previous full run + right cut → ${insideRightOk}`, en: `if previous full run + right cut → ${insideRightOk}` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: insideRightOk ? [range(zeroGroups[rightGroupIndex - 1].start, zeroGroups[rightGroupIndex - 1].end), range(zeroGroups[rightGroupIndex].start, r)].flat() : [],
      codeLines: [19],
      vars: [
        { name: "s[r]", value: s[r] },
        { name: "zeroGroupIndex[l]", value: leftGroupIndex },
        { name: "zeroGroupIndex[r] - 1", value: rightGroupIndex - 1 },
      ],
      note: {
        vi: insideRightOk
          ? "Biên phải cắt một zeroGroup và zeroGroup trước đó nằm trọn trong query."
          : "Không có candidate kiểu zeroGroup trước + right cut.",
        en: insideRightOk
          ? "The right boundary cuts a zero run and the previous zero run is fully inside the query."
          : "There is no previous full zero run + right cut candidate.",
      },
    });

    if (insideRightOk) {
      const insideRightGain = zeroGroups[rightGroupIndex - 1].length + right;
      addCandidate(
        candidates,
        "inside-right",
        { vi: "zero group trước + right cut", en: "previous full zero group + right cut" },
        insideRightGain,
        [[zeroGroups[rightGroupIndex - 1].start, zeroGroups[rightGroupIndex - 1].end], [zeroGroups[rightGroupIndex].start, r]],
        [rightGroupIndex - 1, rightGroupIndex],
        20
      );
      steps.push({
        title: { vi: `candidates.append(previous + right) = ${insideRightGain}`, en: `candidates.append(previous + right) = ${insideRightGain}` },
        arr: values,
        sub: chars,
        highlight: queryRange,
        mark: [range(zeroGroups[rightGroupIndex - 1].start, zeroGroups[rightGroupIndex - 1].end), range(zeroGroups[rightGroupIndex].start, r)].flat(),
        codeLines: [20],
        vars: [
          { name: `z${rightGroupIndex - 1}.length`, value: zeroGroups[rightGroupIndex - 1].length },
          { name: "right", value: right },
          { name: "candidate gain", value: insideRightGain },
        ],
        note: {
          vi: `Candidate này thêm ${zeroGroups[rightGroupIndex - 1].length} + ${right} = ${insideRightGain}.`,
          en: `This candidate adds ${zeroGroups[rightGroupIndex - 1].length} + ${right} = ${insideRightGain}.`,
        },
      });
    }

    const best = candidates.reduce((winner, candidate) => {
      if (!winner || candidate.gain > winner.gain) return candidate;
      return winner;
    }, null);
    const gain = best ? best.gain : 0;
    const answer = ones + gain;
    answers.push(answer);

    steps.push({
      title: { vi: `best gain = ${gain}`, en: `best gain = ${gain}` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: best ? markRanges(best.ranges) : [],
      codeLines: [21],
      vars: [
        { name: "candidates", value: `[${candidates.map((c) => c.gain).join(", ")}]` },
        { name: "best gain", value: gain },
      ],
      note: {
        vi: best
          ? `Lấy gain lớn nhất trong các candidate: ${gain}.`
          : "Không có candidate nào, gain giữ nguyên 0.",
        en: best
          ? `Take the largest gain among candidates: ${gain}.`
          : "There are no candidates, so gain remains 0.",
      },
    });

    if (candidates.length === 0) {
      steps.push({
        title: { vi: `ans.append(ones + gain) = ${answer}`, en: `ans.append(ones + gain) = ${answer}` },
        arr: values,
        sub: chars,
        highlight: queryRange,
        mark: [],
        codeLines: [22],
        vars: [
          { name: "ones", value: ones },
          { name: "best gain", value: 0 },
          { name: "answer", value: answer },
        ],
        note: {
          vi: `Không có cặp đoạn '0' nào có thể ghép trong [${l},${r}], nên đáp án giữ nguyên = ${ones}.`,
          en: `No pair of zero runs can be merged inside [${l},${r}], so the answer stays ${ones}.`,
        },
      });
      continue;
    }

    steps.push({
      title: { vi: `ans.append(ones + gain) = ${answer}`, en: `ans.append(ones + gain) = ${answer}` },
      arr: values,
      sub: chars,
      highlight: queryRange,
      mark: markRanges(best.ranges),
      codeLines: [22],
      vars: [
        { name: "ones", value: ones },
        { name: "best gain", value: gain },
        { name: "answer", value: answer },
      ],
      note: {
        vi: `Chọn gain lớn nhất = ${gain}. Đáp án query [${l},${r}] là ones + gain = ${ones} + ${gain} = ${answer}.`,
        en: `Choose the largest gain = ${gain}. Query [${l},${r}] answer is ones + gain = ${ones} + ${gain} = ${answer}.`,
      },
    });
  }

  steps.push({
    title: { vi: `return ans = [${answers.join(", ")}]`, en: `return ans = [${answers.join(", ")}]` },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [23],
    vars: [{ name: "answer", value: `[${answers.join(", ")}]` }],
    note: {
      vi: `Trả về answer = [${answers.join(", ")}].`,
      en: `Return answer = [${answers.join(", ")}].`,
    },
  });

  return { original: s, answer: `[${answers.join(", ")}]`, steps };
}

function buildSteps3501SegmentTree(input, params) {
  const s = String(input || "").trim();
  const n = s.length;
  const chars = s.split("");
  const values = chars.map((ch) => (ch === "1" ? 1 : 0.4));
  const steps = [];

  function range(l, r) {
    if (l > r) return [];
    return Array.from({ length: r - l + 1 }, (_, i) => l + i);
  }

  function parseQueries(raw) {
    const parsed = String(raw || "")
      .split(";")
      .map((query) => query.trim())
      .filter(Boolean)
      .map((query) => query.split(/[,\s]+/).map(Number))
      .filter((query) => query.length >= 2 && query.slice(0, 2).every(Number.isInteger))
      .map(([l, r]) => [l, r]);
    return parsed.length ? parsed : [[0, Math.max(0, n - 1)]];
  }

  function groupLabel(groups) {
    return `[${groups.map((group, i) => `z${i}:[${group.start},${group.end}] len=${group.length}`).join("; ")}]`;
  }

  function markPair(groups, pairIndex) {
    if (pairIndex < 0 || pairIndex + 1 >= groups.length) return [];
    return [
      ...range(groups[pairIndex].start, groups[pairIndex].end),
      ...range(groups[pairIndex + 1].start, groups[pairIndex + 1].end),
    ];
  }

  function pushStep(line, title, note, options = {}) {
    steps.push({
      title,
      arr: values,
      sub: chars,
      highlight: options.highlight || [],
      mark: options.mark || [],
      codeLines: [line],
      vars: options.vars || [],
      final: Boolean(options.final),
    });
    steps[steps.length - 1].note = note;
  }

  if (n === 0 || /[^01]/.test(s)) {
    pushStep(
      2,
      { vi: "Input không hợp lệ", en: "Invalid input" },
      { vi: "s phải là chuỗi nhị phân không rỗng.", en: "s must be a non-empty binary string." },
      { final: true, vars: [{ name: "s", value: `"${s}"` }] }
    );
    return { original: s, answer: "[]", steps };
  }

  const queries = parseQueries(params && params.queries);
  const detailed = n <= 80 && queries.length <= 20;
  const zeroGroups = [];
  const zeroGroupIndex = [];
  const zeroTrace = [];
  const snapshot = (line, kind, i = -1, extra = {}) => {
    if (!detailed) return;
    zeroTrace.push({
      line,
      kind,
      i,
      groups: zeroGroups.map((group) => ({ ...group })),
      indexAt: [...zeroGroupIndex],
      ...extra,
    });
  };

  snapshot(54, "init-groups");
  snapshot(55, "init-index");
  for (let i = 0; i < n; i++) {
    snapshot(56, "loop", i);
    snapshot(57, "is-zero", i, { result: s[i] === "0" });
    if (s[i] === "0") {
      const extendsRun = i > 0 && s[i - 1] === "0";
      snapshot(58, "extends-run", i, { result: extendsRun });
      if (extendsRun) {
        zeroGroups[zeroGroups.length - 1].end = i;
        snapshot(59, "extend-end", i, { groupId: zeroGroups.length - 1 });
        zeroGroups[zeroGroups.length - 1].length += 1;
        snapshot(60, "extend-length", i, { groupId: zeroGroups.length - 1 });
      } else {
        snapshot(61, "new-run-else", i);
        zeroGroups.push({ start: i, end: i, length: 1 });
        snapshot(62, "new-run", i, { groupId: zeroGroups.length - 1 });
      }
    }
    zeroGroupIndex.push(zeroGroups.length - 1);
    snapshot(63, "append-index", i, { groupId: zeroGroups.length - 1 });
  }
  snapshot(64, "return-groups");

  const ones = chars.filter((ch) => ch === "1").length;
  pushStep(
    3,
    { vi: `ones = ${ones}`, en: `ones = ${ones}` },
    { vi: "Đếm số section đang active trong toàn chuỗi.", en: "Count active sections in the whole string." },
    {
      highlight: chars.map((ch, i) => (ch === "1" ? i : -1)).filter((i) => i >= 0),
      vars: [{ name: "ones", value: ones }],
    }
  );

  pushStep(
    4,
    { vi: "Gọi self.getZeroGroups(s)", en: "Call self.getZeroGroups(s)" },
    { vi: "Đi vào helper để nén các đoạn '0' liên tiếp.", en: "Enter the helper to compress contiguous zero runs." },
    { vars: [{ name: "s", value: `"${s}"` }] }
  );

  if (detailed) {
    pushStep(
      53,
      { vi: "Vào getZeroGroups", en: "Enter getZeroGroups" },
      { vi: "Mỗi zeroGroup lưu start, end và length.", en: "Each zero group stores start, end, and length." },
      { vars: [{ name: "s", value: `"${s}"` }] }
    );

    for (const event of zeroTrace) {
      let title;
      let note;
      switch (event.kind) {
        case "init-groups":
          title = { vi: "zeroGroups = []", en: "zeroGroups = []" };
          note = { vi: "Khởi tạo danh sách zero-run.", en: "Initialize the zero-run list." };
          break;
        case "init-index":
          title = { vi: "zeroGroupIndex = []", en: "zeroGroupIndex = []" };
          note = { vi: "Khởi tạo mảng ánh xạ vị trí sang zero-run.", en: "Initialize the position-to-zero-run mapping." };
          break;
        case "loop":
          title = { vi: `i=${event.i}, ch='${s[event.i]}'`, en: `i=${event.i}, ch='${s[event.i]}'` };
          note = { vi: `Xét s[${event.i}].`, en: `Inspect s[${event.i}].` };
          break;
        case "is-zero":
          title = { vi: `ch == '0' → ${event.result}`, en: `ch == '0' → ${event.result}` };
          note = event.result
            ? { vi: "Ký tự này thuộc một zero-run.", en: "This character belongs to a zero run." }
            : { vi: "Ký tự '1' không làm đổi zeroGroups.", en: "A '1' does not change zeroGroups." };
          break;
        case "extends-run":
          title = { vi: `s[i - 1] == '0' → ${event.result}`, en: `s[i - 1] == '0' → ${event.result}` };
          note = event.result
            ? { vi: "Nối vào zero-run cuối.", en: "Extend the last zero run." }
            : { vi: "Bắt đầu một zero-run mới.", en: "Start a new zero run." };
          break;
        case "extend-end":
          title = { vi: `z${event.groupId}.end = ${event.i}`, en: `z${event.groupId}.end = ${event.i}` };
          note = { vi: "Dời biên phải của run.", en: "Move the run's right boundary." };
          break;
        case "extend-length":
          title = { vi: `z${event.groupId}.length += 1`, en: `z${event.groupId}.length += 1` };
          note = { vi: "Tăng độ dài run thêm 1.", en: "Increase the run length by 1." };
          break;
        case "new-run-else":
          title = { vi: "else: tạo zero-run mới", en: "else: create a new zero run" };
          note = { vi: "Zero này không liền với run trước.", en: "This zero is not contiguous with the previous run." };
          break;
        case "new-run":
          title = { vi: `Thêm z${event.groupId} tại ${event.i}`, en: `Append z${event.groupId} at ${event.i}` };
          note = { vi: "Run mới có length = 1.", en: "The new run starts with length 1." };
          break;
        case "append-index":
          title = { vi: `zeroGroupIndex.append(${event.groupId})`, en: `zeroGroupIndex.append(${event.groupId})` };
          note = { vi: `Vị trí ${event.i} ánh xạ tới id ${event.groupId}.`, en: `Position ${event.i} maps to id ${event.groupId}.` };
          break;
        default:
          title = { vi: "return zeroGroups, zeroGroupIndex", en: "return zeroGroups, zeroGroupIndex" };
          note = { vi: "Trả dữ liệu nén về hàm chính.", en: "Return compressed data to the main method." };
      }
      pushStep(event.line, title, note, {
        highlight: event.i >= 0 ? [event.i] : [],
        mark: event.groups.flatMap((group) => range(group.start, group.end)),
        vars: [
          ...(event.i >= 0 ? [{ name: "i", value: event.i }, { name: "ch", value: `'${s[event.i]}'` }] : []),
          { name: "zeroGroups", value: groupLabel(event.groups) },
          { name: "zeroGroupIndex", value: `[${event.indexAt.join(", ")}]` },
        ],
      });
    }
  }

  pushStep(
    4,
    { vi: "Nhận zeroGroups và zeroGroupIndex", en: "Receive zeroGroups and zeroGroupIndex" },
    { vi: "Quay lại hàm chính sau khi nén chuỗi.", en: "Return to the main method after compressing the string." },
    {
      mark: zeroGroups.flatMap((group) => range(group.start, group.end)),
      vars: [
        { name: "zeroGroups", value: groupLabel(zeroGroups) },
        { name: "zeroGroupIndex", value: `[${zeroGroupIndex.join(", ")}]` },
      ],
    }
  );

  const tooFewGroups = zeroGroups.length < 2;
  pushStep(
    5,
    { vi: `len(zeroGroups) < 2 → ${tooFewGroups}`, en: `len(zeroGroups) < 2 → ${tooFewGroups}` },
    tooFewGroups
      ? { vi: "Cần hai zero-run để trade; không đủ nên trả ones.", en: "A trade needs two zero runs; there are not enough." }
      : { vi: "Có ít nhất hai zero-run, tiếp tục build segment tree.", en: "There are at least two zero runs, so build the segment tree." },
    { vars: [{ name: "len(zeroGroups)", value: zeroGroups.length }] }
  );

  if (tooFewGroups) {
    const answer = Array(queries.length).fill(ones);
    pushStep(
      6,
      { vi: `return [${answer.join(", ")}]`, en: `return [${answer.join(", ")}]` },
      { vi: "Không có trade hợp lệ cho bất kỳ query nào.", en: "No query has a valid trade." },
      { final: true, vars: [{ name: "answer", value: `[${answer.join(", ")}]` }] }
    );
    return { original: s, answer: `[${answer.join(", ")}]`, steps };
  }

  const pairCount = zeroGroups.length - 1;
  let treeSize = 1;
  if (detailed) {
    pushStep(8, { vi: `pairCount = ${pairCount}`, en: `pairCount = ${pairCount}` }, { vi: "Mỗi lá biểu diễn một cặp zero-run kề nhau.", en: "Each leaf represents one adjacent zero-run pair." }, { vars: [{ name: "pairCount", value: pairCount }] });
    pushStep(9, { vi: "size = 1", en: "size = 1" }, { vi: "Khởi tạo kích thước tầng lá.", en: "Initialize the leaf-layer size." }, { vars: [{ name: "size", value: treeSize }] });
  }
  while (treeSize < pairCount) {
    if (detailed) pushStep(10, { vi: `${treeSize} < ${pairCount} → true`, en: `${treeSize} < ${pairCount} → true` }, { vi: "Chưa đủ lá cho mọi cặp.", en: "There are not enough leaves for every pair." }, { vars: [{ name: "size", value: treeSize }] });
    treeSize *= 2;
    if (detailed) pushStep(11, { vi: `size *= 2 → ${treeSize}`, en: `size *= 2 → ${treeSize}` }, { vi: "Tăng size lên lũy thừa của 2 kế tiếp.", en: "Grow size to the next power of two." }, { vars: [{ name: "size", value: treeSize }] });
  }
  if (detailed) pushStep(10, { vi: `${treeSize} < ${pairCount} → false`, en: `${treeSize} < ${pairCount} → false` }, { vi: "Đã đủ chỗ cho mọi pair gain.", en: "There is enough room for every pair gain." }, { vars: [{ name: "size", value: treeSize }] });

  const tree = Array(2 * treeSize).fill(0);
  const treePair = Array(2 * treeSize).fill(-1);
  if (detailed) pushStep(12, { vi: `tree = [0] * ${2 * treeSize}`, en: `tree = [0] * ${2 * treeSize}` }, { vi: "Tạo segment tree lưu max gain.", en: "Create the max-gain segment tree." }, { vars: [{ name: "tree.length", value: tree.length }] });

  for (let g = 0; g < pairCount; g++) {
    const pairGain = zeroGroups[g].length + zeroGroups[g + 1].length;
    if (detailed) pushStep(13, { vi: `g = ${g}`, en: `g = ${g}` }, { vi: `Chuẩn bị lá cho z${g} + z${g + 1}.`, en: `Prepare the leaf for z${g} + z${g + 1}.` }, { mark: markPair(zeroGroups, g), vars: [{ name: "g", value: g }] });
    tree[treeSize + g] = pairGain;
    treePair[treeSize + g] = g;
    if (detailed) pushStep(14, { vi: `tree[${treeSize + g}] = ${pairGain}`, en: `tree[${treeSize + g}] = ${pairGain}` }, { vi: `Gain của pair z${g}, z${g + 1} là ${pairGain}.`, en: `The gain for pair z${g}, z${g + 1} is ${pairGain}.` }, { mark: markPair(zeroGroups, g), vars: [{ name: "pair gain", value: pairGain }, { name: "tree", value: `[${tree.join(", ")}]` }] });
  }

  for (let node = treeSize - 1; node > 0; node--) {
    if (detailed) pushStep(15, { vi: `node = ${node}`, en: `node = ${node}` }, { vi: "Gộp hai node con.", en: "Merge the two child nodes." }, { vars: [{ name: "node", value: node }] });
    const leftNode = node * 2;
    const rightNode = leftNode + 1;
    if (tree[leftNode] >= tree[rightNode]) {
      tree[node] = tree[leftNode];
      treePair[node] = treePair[leftNode];
    } else {
      tree[node] = tree[rightNode];
      treePair[node] = treePair[rightNode];
    }
    if (detailed) pushStep(16, { vi: `tree[${node}] = ${tree[node]}`, en: `tree[${node}] = ${tree[node]}` }, { vi: "Node cha giữ gain lớn hơn.", en: "The parent keeps the larger gain." }, { mark: markPair(zeroGroups, treePair[node]), vars: [{ name: "tree[node]", value: tree[node] }, { name: "pair", value: treePair[node] }] });
  }

  function rangeMax(left, right) {
    const trace = [];
    const record = (line, kind, extra = {}) => {
      if (detailed) trace.push({ line, kind, left, right, ...extra });
    };
    record(36, "enter");
    record(37, "empty-check", { result: left > right });
    if (left > right) {
      record(38, "empty-return", { best: 0, pairIndex: -1 });
      return { gain: 0, pairIndex: -1, trace };
    }
    left += treeSize;
    record(39, "left-offset");
    right += treeSize;
    record(40, "right-offset");
    let best = 0;
    let pairIndex = -1;
    record(41, "best-init", { best, pairIndex });
    while (left <= right) {
      record(42, "loop", { best, pairIndex });
      const takeLeft = left % 2 === 1;
      record(43, "left-check", { result: takeLeft, best, pairIndex });
      if (takeLeft) {
        if (tree[left] > best) {
          best = tree[left];
          pairIndex = treePair[left];
        }
        record(44, "take-left", { node: left, best, pairIndex });
        left += 1;
        record(45, "left-next", { best, pairIndex });
      }
      const takeRight = right % 2 === 0;
      record(46, "right-check", { result: takeRight, best, pairIndex });
      if (takeRight) {
        if (tree[right] > best) {
          best = tree[right];
          pairIndex = treePair[right];
        }
        record(47, "take-right", { node: right, best, pairIndex });
        right -= 1;
        record(48, "right-prev", { best, pairIndex });
      }
      left = Math.floor(left / 2);
      record(49, "left-parent", { best, pairIndex });
      right = Math.floor(right / 2);
      record(50, "right-parent", { best, pairIndex });
    }
    record(51, "return", { best, pairIndex });
    return { gain: best, pairIndex, trace };
  }

  const answers = [];
  if (detailed) pushStep(18, { vi: "ans = []", en: "ans = []" }, { vi: "Khởi tạo kết quả.", en: "Initialize the result list." }, { vars: [{ name: "ans", value: "[]" }] });

  for (let qi = 0; qi < queries.length; qi++) {
    let [l, r] = queries[qi];
    l = Math.max(0, Math.min(l, n - 1));
    r = Math.max(0, Math.min(r, n - 1));
    if (l > r) [l, r] = [r, l];
    const queryRange = detailed ? range(l, r) : [];
    const leftGroup = zeroGroupIndex[l];
    const rightGroup = zeroGroupIndex[r];
    const leftPiece = s[l] === "1" ? 0 : zeroGroups[leftGroup].end - l + 1;
    const rightPiece = s[r] === "1" ? 0 : r - zeroGroups[rightGroup].start + 1;
    const first = leftGroup + 1;
    const last = s[r] === "1" ? rightGroup : rightGroup - 1;

    if (detailed) {
      pushStep(19, { vi: `query ${qi}: [${l}, ${r}]`, en: `query ${qi}: [${l}, ${r}]` }, { vi: "Trade chỉ nằm trong đoạn highlight.", en: "The trade is restricted to the highlighted range." }, { highlight: queryRange, vars: [{ name: "l", value: l }, { name: "r", value: r }] });
      pushStep(20, { vi: `leftGroup = ${leftGroup}`, en: `leftGroup = ${leftGroup}` }, { vi: "Zero-run tại hoặc ngay trước l.", en: "The zero run at or immediately before l." }, { highlight: [l], vars: [{ name: "leftGroup", value: leftGroup }] });
      pushStep(21, { vi: `rightGroup = ${rightGroup}`, en: `rightGroup = ${rightGroup}` }, { vi: "Zero-run tại hoặc ngay trước r.", en: "The zero run at or immediately before r." }, { highlight: [r], vars: [{ name: "rightGroup", value: rightGroup }] });
      pushStep(22, { vi: `left = ${leftPiece}`, en: `left = ${leftPiece}` }, { vi: "Phần zero-run còn lại ở biên trái.", en: "The remaining zero-run piece at the left boundary." }, { highlight: queryRange, mark: s[l] === "0" ? range(l, zeroGroups[leftGroup].end) : [], vars: [{ name: "left", value: leftPiece }] });
      pushStep(23, { vi: `right = ${rightPiece}`, en: `right = ${rightPiece}` }, { vi: "Phần zero-run ở biên phải.", en: "The zero-run piece at the right boundary." }, { highlight: queryRange, mark: s[r] === "0" ? range(zeroGroups[rightGroup].start, r) : [], vars: [{ name: "right", value: rightPiece }] });
      pushStep(24, { vi: `first = ${first}`, en: `first = ${first}` }, { vi: "Zero-run hoàn chỉnh đầu tiên có thể nằm trong query.", en: "The first complete zero run that may lie inside the query." }, { highlight: queryRange, vars: [{ name: "first", value: first }] });
      pushStep(25, { vi: `last = ${last}`, en: `last = ${last}` }, { vi: "Zero-run hoàn chỉnh cuối cùng có thể nằm trong query.", en: "The last complete zero run that may lie inside the query." }, { highlight: queryRange, vars: [{ name: "last", value: last }] });
      pushStep(26, { vi: `Gọi rangeMax(${first}, ${last - 1})`, en: `Call rangeMax(${first}, ${last - 1})` }, { vi: "Lấy pair gain lớn nhất ở phần giữa bằng segment tree.", en: "Use the segment tree to get the largest middle pair gain." }, { highlight: queryRange, vars: [{ name: "left pair", value: first }, { name: "right pair", value: last - 1 }] });
    }

    const rmq = rangeMax(first, last - 1);
    if (detailed) {
      for (const event of rmq.trace) {
        const eventBest = event.best === undefined ? 0 : event.best;
        let title = { vi: `rangeMax: left=${event.left}, right=${event.right}`, en: `rangeMax: left=${event.left}, right=${event.right}` };
        let note = { vi: "Thu hẹp range trên segment tree.", en: "Narrow the range on the segment tree." };
        if (event.kind === "empty-check") {
          title = { vi: `left > right → ${event.result}`, en: `left > right → ${event.result}` };
          note = { vi: event.result ? "Không có cặp hoàn chỉnh ở giữa." : "Range có ít nhất một pair.", en: event.result ? "There is no complete middle pair." : "The range contains at least one pair." };
        } else if (event.kind === "empty-return") {
          title = { vi: "return 0", en: "return 0" };
        } else if (event.kind === "left-offset" || event.kind === "right-offset") {
          title = { vi: `Đổi sang leaf index: [${event.left}, ${event.right}]`, en: `Convert to leaf indices: [${event.left}, ${event.right}]` };
        } else if (event.kind === "best-init") {
          title = { vi: "best = 0", en: "best = 0" };
        } else if (event.kind === "left-check") {
          title = { vi: `left % 2 == 1 → ${event.result}`, en: `left % 2 == 1 → ${event.result}` };
        } else if (event.kind === "right-check") {
          title = { vi: `right % 2 == 0 → ${event.result}`, en: `right % 2 == 0 → ${event.result}` };
        } else if (event.kind === "take-left" || event.kind === "take-right") {
          title = { vi: `Lấy node ${event.node}, best = ${event.best}`, en: `Take node ${event.node}, best = ${event.best}` };
          note = { vi: "Node này nằm trọn trong range query.", en: "This node is fully covered by the query range." };
        } else if (event.kind === "return") {
          title = { vi: `return best = ${event.best}`, en: `return best = ${event.best}` };
          note = { vi: "Hoàn tất RMQ trong O(log n).", en: "Finish the RMQ in O(log n)." };
        }
        pushStep(event.line, title, note, {
          highlight: queryRange,
          mark: markPair(zeroGroups, event.pairIndex === undefined ? -1 : event.pairIndex),
          vars: [{ name: "left", value: event.left }, { name: "right", value: event.right }, { name: "best", value: eventBest }],
        });
      }
    }

    let gain = rmq.gain;
    let bestPair = rmq.pairIndex;
    let bestMark = markPair(zeroGroups, bestPair);
    if (detailed) {
      pushStep(26, { vi: `gain = ${gain}`, en: `gain = ${gain}` }, { vi: "Nhận max gain của các cặp hoàn chỉnh ở giữa.", en: "Receive the maximum gain among complete middle pairs." }, { highlight: queryRange, mark: bestMark, vars: [{ name: "gain", value: gain }, { name: "best pair", value: bestPair }] });
    }

    const leftOk = s[l] === "0" && leftGroup + 1 <= last;
    if (detailed) pushStep(27, { vi: `left boundary candidate → ${leftOk}`, en: `left boundary candidate → ${leftOk}` }, { vi: leftOk ? "Biên trái ghép được với zero-run kế tiếp." : "Không có candidate ở biên trái.", en: leftOk ? "The left piece can merge with the next zero run." : "There is no left-boundary candidate." }, { highlight: queryRange, vars: [{ name: "condition", value: leftOk }] });
    if (leftOk) {
      const candidate = leftPiece + zeroGroups[leftGroup + 1].length;
      if (candidate > gain) {
        gain = candidate;
        bestMark = [...range(l, zeroGroups[leftGroup].end), ...range(zeroGroups[leftGroup + 1].start, zeroGroups[leftGroup + 1].end)];
      }
      if (detailed) pushStep(28, { vi: `gain = max(gain, ${candidate}) = ${gain}`, en: `gain = max(gain, ${candidate}) = ${gain}` }, { vi: "So sánh candidate cắt biên trái.", en: "Compare the left-cut candidate." }, { highlight: queryRange, mark: bestMark, vars: [{ name: "candidate", value: candidate }, { name: "gain", value: gain }] });
    }

    const rightOk = s[r] === "0" && first <= rightGroup - 1;
    if (detailed) pushStep(29, { vi: `right boundary candidate → ${rightOk}`, en: `right boundary candidate → ${rightOk}` }, { vi: rightOk ? "Zero-run trước ghép được với phần biên phải." : "Không có candidate ở biên phải.", en: rightOk ? "The previous zero run can merge with the right piece." : "There is no right-boundary candidate." }, { highlight: queryRange, vars: [{ name: "condition", value: rightOk }] });
    if (rightOk) {
      const candidate = zeroGroups[rightGroup - 1].length + rightPiece;
      if (candidate > gain) {
        gain = candidate;
        bestMark = [...range(zeroGroups[rightGroup - 1].start, zeroGroups[rightGroup - 1].end), ...range(zeroGroups[rightGroup].start, r)];
      }
      if (detailed) pushStep(30, { vi: `gain = max(gain, ${candidate}) = ${gain}`, en: `gain = max(gain, ${candidate}) = ${gain}` }, { vi: "So sánh candidate cắt biên phải.", en: "Compare the right-cut candidate." }, { highlight: queryRange, mark: bestMark, vars: [{ name: "candidate", value: candidate }, { name: "gain", value: gain }] });
    }

    const edgeOk = s[l] === "0" && s[r] === "0" && leftGroup + 1 === rightGroup;
    if (detailed) pushStep(31, { vi: `two-boundary candidate → ${edgeOk}`, en: `two-boundary candidate → ${edgeOk}` }, { vi: edgeOk ? "Hai phần biên thuộc hai zero-run kề nhau." : "Hai biên không tạo một pair riêng.", en: edgeOk ? "The two boundary pieces belong to adjacent zero runs." : "The two boundaries do not form their own pair." }, { highlight: queryRange, vars: [{ name: "condition", value: edgeOk }] });
    if (edgeOk) {
      const candidate = leftPiece + rightPiece;
      if (candidate > gain) {
        gain = candidate;
        bestMark = [...range(l, zeroGroups[leftGroup].end), ...range(zeroGroups[rightGroup].start, r)];
      }
      if (detailed) pushStep(32, { vi: `gain = max(gain, ${candidate}) = ${gain}`, en: `gain = max(gain, ${candidate}) = ${gain}` }, { vi: "So sánh candidate gồm cả hai biên.", en: "Compare the two-boundary candidate." }, { highlight: queryRange, mark: bestMark, vars: [{ name: "candidate", value: candidate }, { name: "gain", value: gain }] });
    }

    const answer = ones + gain;
    answers.push(answer);
    if (detailed) pushStep(33, { vi: `ans.append(${ones} + ${gain}) = ${answer}`, en: `ans.append(${ones} + ${gain}) = ${answer}` }, { vi: "Cộng gain tốt nhất vào số '1' ban đầu.", en: "Add the best gain to the original one count." }, { highlight: queryRange, mark: bestMark, vars: [{ name: "ones", value: ones }, { name: "gain", value: gain }, { name: "answer", value: answer }] });
  }

  pushStep(34, { vi: `return ans = [${answers.join(", ")}]`, en: `return ans = [${answers.join(", ")}]` }, { vi: "Trả kết quả cho mọi query.", en: "Return the result for every query." }, { final: true, vars: [{ name: "answer", value: `[${answers.join(", ")}]` }] });
  return { original: s, answer: `[${answers.join(", ")}]`, steps };
}

function buildSteps3501RecursiveSegmentTree(input, params) {
  const s = String(input || "").trim();
  const n = s.length;
  const chars = s.split("");
  const values = chars.map((ch) => (ch === "1" ? 1 : 0.4));
  const steps = [];

  function range(l, r) {
    if (l > r) return [];
    return Array.from({ length: r - l + 1 }, (_, i) => l + i);
  }

  function parseQueries(raw) {
    const parsed = String(raw || "")
      .split(";")
      .map((query) => query.trim())
      .filter(Boolean)
      .map((query) => query.split(/[,\s]+/).map(Number))
      .filter((query) => query.length >= 2 && query.slice(0, 2).every(Number.isInteger))
      .map(([l, r]) => [l, r]);
    return parsed.length ? parsed : [[0, Math.max(0, n - 1)]];
  }

  function lowerBound(arr, target) {
    let left = 0;
    let right = arr.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] < target) left = mid + 1;
      else right = mid;
    }
    return left;
  }

  function upperBound(arr, target) {
    let left = 0;
    let right = arr.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] <= target) left = mid + 1;
      else right = mid;
    }
    return left;
  }

  function pushStep(line, title, note, options = {}) {
    steps.push({
      title,
      arr: values,
      sub: chars,
      highlight: options.highlight || [],
      mark: options.mark || [],
      codeLines: [line],
      codeBlock: 2,
      vars: options.vars || [],
      final: Boolean(options.final),
      note,
    });
  }

  if (n === 0 || /[^01]/.test(s)) {
    pushStep(48, { vi: "Input không hợp lệ", en: "Invalid input" }, { vi: "s phải là chuỗi nhị phân không rỗng.", en: "s must be a non-empty binary string." }, { final: true });
    return { original: s, answer: "[]", steps };
  }

  const queries = parseQueries(params && params.queries);
  const detailed = n <= 80 && queries.length <= 20;
  const cnt1 = chars.filter((ch) => ch === "1").length;
  const zeroBlocks = [];
  const blockLeft = [];
  const blockRight = [];

  pushStep(49, { vi: `n = ${n}`, en: `n = ${n}` }, { vi: "Lấy độ dài chuỗi.", en: "Read the string length." }, { vars: [{ name: "n", value: n }] });
  pushStep(50, { vi: `cnt1 = ${cnt1}`, en: `cnt1 = ${cnt1}` }, { vi: "Đếm tổng số '1' trong toàn chuỗi.", en: "Count all '1's in the whole string." }, { highlight: chars.map((ch, i) => (ch === "1" ? i : -1)).filter((i) => i >= 0), vars: [{ name: "cnt1", value: cnt1 }] });
  if (detailed) {
    pushStep(52, { vi: "zeroBlocks = []", en: "zeroBlocks = []" }, { vi: "Lưu độ dài từng zero-block.", en: "Store each zero-block length." });
    pushStep(53, { vi: "blockLeft = []", en: "blockLeft = []" }, { vi: "Lưu biên trái từng zero-block.", en: "Store each zero-block's left boundary." });
    pushStep(54, { vi: "blockRight = []", en: "blockRight = []" }, { vi: "Lưu biên phải từng zero-block.", en: "Store each zero-block's right boundary." });
    pushStep(56, { vi: "i = 0", en: "i = 0" }, { vi: "Bắt đầu quét run-length.", en: "Start the run-length scan." }, { vars: [{ name: "i", value: 0 }] });
  }

  let scan = 0;
  while (scan < n) {
    const st = scan;
    if (detailed) {
      pushStep(57, { vi: `${scan} < ${n} → true`, en: `${scan} < ${n} → true` }, { vi: "Còn ký tự cần quét.", en: "There are characters left to scan." }, { highlight: [scan], vars: [{ name: "i", value: scan }] });
      pushStep(58, { vi: `st = ${st}`, en: `st = ${st}` }, { vi: "Ghi lại đầu run hiện tại.", en: "Record the current run start." }, { highlight: [st], vars: [{ name: "st", value: st }] });
    }
    while (scan < n && s[scan] === s[st]) {
      if (detailed) pushStep(59, { vi: `s[${scan}] == '${s[st]}' → true`, en: `s[${scan}] == '${s[st]}' → true` }, { vi: "Ký tự vẫn thuộc run hiện tại.", en: "The character remains in the current run." }, { highlight: range(st, scan), vars: [{ name: "i", value: scan }, { name: "st", value: st }] });
      scan += 1;
      if (detailed) pushStep(60, { vi: `i += 1 → ${scan}`, en: `i += 1 → ${scan}` }, { vi: "Mở rộng run sang phải.", en: "Extend the run to the right." }, { highlight: range(st, scan - 1), vars: [{ name: "i", value: scan }] });
    }
    const isZeroRun = s[st] === "0";
    if (detailed) pushStep(61, { vi: `s[st] == '0' → ${isZeroRun}`, en: `s[st] == '0' → ${isZeroRun}` }, { vi: isZeroRun ? "Đây là zero-block, lưu lại." : "Đây là one-block, bỏ qua.", en: isZeroRun ? "This is a zero block, so store it." : "This is a one block, so skip it." }, { highlight: range(st, scan - 1) });
    if (isZeroRun) {
      zeroBlocks.push(scan - st);
      blockLeft.push(st);
      blockRight.push(scan - 1);
      const blockId = zeroBlocks.length - 1;
      if (detailed) {
        pushStep(62, { vi: `zeroBlocks.append(${scan - st})`, en: `zeroBlocks.append(${scan - st})` }, { vi: `z${blockId} dài ${scan - st}.`, en: `z${blockId} has length ${scan - st}.` }, { mark: range(st, scan - 1), vars: [{ name: "zeroBlocks", value: `[${zeroBlocks.join(", ")}]` }] });
        pushStep(63, { vi: `blockLeft.append(${st})`, en: `blockLeft.append(${st})` }, { vi: `Biên trái z${blockId}.`, en: `Left boundary of z${blockId}.` }, { mark: range(st, scan - 1), vars: [{ name: "blockLeft", value: `[${blockLeft.join(", ")}]` }] });
        pushStep(64, { vi: `blockRight.append(${scan - 1})`, en: `blockRight.append(${scan - 1})` }, { vi: `Biên phải z${blockId}.`, en: `Right boundary of z${blockId}.` }, { mark: range(st, scan - 1), vars: [{ name: "blockRight", value: `[${blockRight.join(", ")}]` }] });
      }
    }
  }
  if (detailed) pushStep(57, { vi: `${scan} < ${n} → false`, en: `${scan} < ${n} → false` }, { vi: "Đã quét hết chuỗi.", en: "The string scan is complete." }, { vars: [{ name: "i", value: scan }] });

  const m = zeroBlocks.length;
  pushStep(66, { vi: `m = ${m}`, en: `m = ${m}` }, { vi: "Số zero-block đã tìm được.", en: "Number of zero blocks found." }, { vars: [{ name: "m", value: m }] });
  pushStep(67, { vi: `m < 2 → ${m < 2}`, en: `m < 2 → ${m < 2}` }, { vi: m < 2 ? "Không đủ hai zero-block để trade." : "Có thể tiếp tục build segment tree.", en: m < 2 ? "There are not enough zero blocks for a trade." : "Continue building the segment tree." }, { vars: [{ name: "m", value: m }] });
  if (m < 2) {
    const answer = Array(queries.length).fill(cnt1);
    pushStep(68, { vi: `return [${answer.join(", ")}]`, en: `return [${answer.join(", ")}]` }, { vi: "Mọi query giữ nguyên cnt1.", en: "Every query keeps cnt1 unchanged." }, { final: true, vars: [{ name: "answer", value: `[${answer.join(", ")}]` }] });
    return { original: s, answer: `[${answer.join(", ")}]`, steps };
  }

  const tmpSum = Array.from({ length: m - 1 }, (_, i) => zeroBlocks[i] + zeroBlocks[i + 1]);
  if (detailed) pushStep(70, { vi: `tmpSum = [${tmpSum.join(", ")}]`, en: `tmpSum = [${tmpSum.join(", ")}]` }, { vi: "tmpSum[k] là gain của cặp z[k], z[k+1].", en: "tmpSum[k] is the gain of pair z[k], z[k+1]." }, { vars: [{ name: "tmpSum", value: `[${tmpSum.join(", ")}]` }] });

  const segArray = Array(tmpSum.length << 2).fill(0);
  const segPair = Array(tmpSum.length << 2).fill(-1);
  if (detailed) {
    pushStep(71, { vi: "seg = SegmentTree(tmpSum)", en: "seg = SegmentTree(tmpSum)" }, { vi: "Đi vào constructor của recursive segment tree.", en: "Enter the recursive segment-tree constructor." });
    pushStep(5, { vi: "Vào SegmentTree.__init__", en: "Enter SegmentTree.__init__" }, { vi: "Khởi tạo cây từ tmpSum.", en: "Initialize the tree from tmpSum." });
    pushStep(6, { vi: `self.n = ${tmpSum.length}`, en: `self.n = ${tmpSum.length}` }, { vi: "Số phần tử cần build.", en: "Number of values to build." }, { vars: [{ name: "self.n", value: tmpSum.length }] });
    pushStep(7, { vi: "self.arr = arr", en: "self.arr = arr" }, { vi: "Giữ mảng pair gain gốc.", en: "Keep the original pair-gain array." }, { vars: [{ name: "self.arr", value: `[${tmpSum.join(", ")}]` }] });
    pushStep(8, { vi: `self.seg = [0] * ${segArray.length}`, en: `self.seg = [0] * ${segArray.length}` }, { vi: "Cấp phát cây.", en: "Allocate the tree." }, { vars: [{ name: "len(self.seg)", value: segArray.length }] });
    pushStep(10, { vi: "if self.n → true", en: "if self.n → true" }, { vi: "Mảng không rỗng nên gọi build.", en: "The array is non-empty, so call build." });
    pushStep(11, { vi: `build(1, 0, ${tmpSum.length - 1})`, en: `build(1, 0, ${tmpSum.length - 1})` }, { vi: "Build từ root.", en: "Build from the root." });
  }

  function buildTree(p, l, r) {
    if (detailed) pushStep(13, { vi: `build(p=${p}, l=${l}, r=${r})`, en: `build(p=${p}, l=${l}, r=${r})` }, { vi: "Xử lý một node của cây.", en: "Process one tree node." }, { vars: [{ name: "p", value: p }, { name: "l", value: l }, { name: "r", value: r }] });
    const isLeaf = l === r;
    if (detailed) pushStep(14, { vi: `l == r → ${isLeaf}`, en: `l == r → ${isLeaf}` }, { vi: isLeaf ? "Node lá." : "Node trong, chia đôi tiếp.", en: isLeaf ? "This is a leaf." : "This is an internal node; split again." });
    if (isLeaf) {
      segArray[p] = tmpSum[l];
      segPair[p] = l;
      if (detailed) {
        pushStep(15, { vi: `self.seg[${p}] = ${tmpSum[l]}`, en: `self.seg[${p}] = ${tmpSum[l]}` }, { vi: `Lá lưu gain của pair ${l}.`, en: `The leaf stores gain for pair ${l}.` }, { mark: [...range(blockLeft[l], blockRight[l]), ...range(blockLeft[l + 1], blockRight[l + 1])], vars: [{ name: "self.seg[p]", value: tmpSum[l] }] });
        pushStep(16, { vi: "return", en: "return" }, { vi: "Hoàn tất node lá.", en: "Finish the leaf node." });
      }
      return;
    }
    const mid = Math.floor((l + r) / 2);
    if (detailed) pushStep(18, { vi: `mid = ${mid}`, en: `mid = ${mid}` }, { vi: "Chia interval thành hai nửa.", en: "Split the interval into two halves." }, { vars: [{ name: "mid", value: mid }] });
    if (detailed) pushStep(20, { vi: `build(${p << 1}, ${l}, ${mid})`, en: `build(${p << 1}, ${l}, ${mid})` }, { vi: "Đệ quy sang con trái.", en: "Recurse into the left child." });
    buildTree(p << 1, l, mid);
    if (detailed) pushStep(21, { vi: `build(${p << 1 | 1}, ${mid + 1}, ${r})`, en: `build(${p << 1 | 1}, ${mid + 1}, ${r})` }, { vi: "Đệ quy sang con phải.", en: "Recurse into the right child." });
    buildTree(p << 1 | 1, mid + 1, r);
    const leftNode = p << 1;
    const rightNode = p << 1 | 1;
    if (segArray[leftNode] >= segArray[rightNode]) {
      segArray[p] = segArray[leftNode];
      segPair[p] = segPair[leftNode];
    } else {
      segArray[p] = segArray[rightNode];
      segPair[p] = segPair[rightNode];
    }
    if (detailed) pushStep(23, { vi: `self.seg[${p}] = ${segArray[p]}`, en: `self.seg[${p}] = ${segArray[p]}` }, { vi: "Node cha giữ max của hai con.", en: "The parent keeps the maximum of both children." }, { vars: [{ name: "self.seg[p]", value: segArray[p] }] });
  }

  buildTree(1, 0, tmpSum.length - 1);

  function queryTree(L, R, queryHighlight) {
    if (detailed) {
      pushStep(25, { vi: `query(L=${L}, R=${R})`, en: `query(L=${L}, R=${R})` }, { vi: "Bắt đầu range maximum query.", en: "Start the range maximum query." }, { highlight: queryHighlight });
      pushStep(26, { vi: `L > R → ${L > R}`, en: `L > R → ${L > R}` }, { vi: L > R ? "Range rỗng." : "Range hợp lệ.", en: L > R ? "The range is empty." : "The range is valid." }, { highlight: queryHighlight });
    }
    if (L > R) {
      if (detailed) pushStep(27, { vi: "return 0", en: "return 0" }, { vi: "Không có pair hoàn chỉnh ở giữa.", en: "There is no complete middle pair." }, { highlight: queryHighlight });
      return { gain: 0, pair: -1 };
    }

    function visit(p, l, r) {
      if (detailed) pushStep(29, { vi: `_query(p=${p}, l=${l}, r=${r})`, en: `_query(p=${p}, l=${l}, r=${r})` }, { vi: "Thăm một node query.", en: "Visit one query node." }, { highlight: queryHighlight, vars: [{ name: "p", value: p }, { name: "l", value: l }, { name: "r", value: r }] });
      const covered = L <= l && r <= R;
      if (detailed) pushStep(30, { vi: `node nằm trọn range → ${covered}`, en: `node fully covered → ${covered}` }, { vi: covered ? "Dùng trực tiếp max của node." : "Node chỉ giao một phần, cần đi xuống.", en: covered ? "Use this node's maximum directly." : "The node is only partially covered; descend." }, { highlight: queryHighlight });
      if (covered) {
        if (detailed) pushStep(31, { vi: `return self.seg[${p}] = ${segArray[p]}`, en: `return self.seg[${p}] = ${segArray[p]}` }, { vi: "Node được range bao phủ hoàn toàn.", en: "The query range fully covers this node." }, { highlight: queryHighlight, vars: [{ name: "gain", value: segArray[p] }, { name: "pair", value: segPair[p] }] });
        return { gain: segArray[p], pair: segPair[p] };
      }
      const mid = Math.floor((l + r) / 2);
      let best = { gain: 0, pair: -1 };
      if (detailed) {
        pushStep(33, { vi: `mid = ${mid}`, en: `mid = ${mid}` }, { vi: "Tính điểm chia node.", en: "Compute the node midpoint." }, { highlight: queryHighlight, vars: [{ name: "mid", value: mid }] });
        pushStep(34, { vi: "res = 0", en: "res = 0" }, { vi: "Khởi tạo max cục bộ.", en: "Initialize the local maximum." }, { highlight: queryHighlight });
        pushStep(36, { vi: `L <= mid → ${L <= mid}`, en: `L <= mid → ${L <= mid}` }, { vi: "Kiểm tra giao với con trái.", en: "Check overlap with the left child." }, { highlight: queryHighlight });
      }
      if (L <= mid) {
        if (detailed) pushStep(37, { vi: "Query con trái", en: "Query left child" }, { vi: "Đệ quy sang nửa trái.", en: "Recurse into the left half." }, { highlight: queryHighlight });
        best = visit(p << 1, l, mid);
      }
      if (detailed) pushStep(39, { vi: `R > mid → ${R > mid}`, en: `R > mid → ${R > mid}` }, { vi: "Kiểm tra giao với con phải.", en: "Check overlap with the right child." }, { highlight: queryHighlight });
      if (R > mid) {
        if (detailed) pushStep(40, { vi: "Query con phải", en: "Query right child" }, { vi: "Đệ quy sang nửa phải và lấy max.", en: "Recurse into the right half and take the maximum." }, { highlight: queryHighlight });
        const candidate = visit(p << 1 | 1, mid + 1, r);
        if (candidate.gain > best.gain) best = candidate;
      }
      if (detailed) pushStep(42, { vi: `return res = ${best.gain}`, en: `return res = ${best.gain}` }, { vi: "Trả max của các nhánh đã thăm.", en: "Return the maximum from visited branches." }, { highlight: queryHighlight, vars: [{ name: "res", value: best.gain }] });
      return best;
    }

    const result = visit(1, 0, tmpSum.length - 1);
    if (detailed) pushStep(44, { vi: `return _query(...) = ${result.gain}`, en: `return _query(...) = ${result.gain}` }, { vi: "Hoàn tất recursive RMQ.", en: "Finish the recursive RMQ." }, { highlight: queryHighlight, vars: [{ name: "gain", value: result.gain }] });
    return result;
  }

  const answers = [];
  if (detailed) pushStep(72, { vi: "ans = []", en: "ans = []" }, { vi: "Khởi tạo kết quả.", en: "Initialize the result list." });

  for (let qi = 0; qi < queries.length; qi++) {
    let [l, r] = queries[qi];
    l = Math.max(0, Math.min(l, n - 1));
    r = Math.max(0, Math.min(r, n - 1));
    if (l > r) [l, r] = [r, l];
    const queryHighlight = detailed ? range(l, r) : [];
    const firstBlock = lowerBound(blockRight, l);
    const lastBlock = upperBound(blockLeft, r) - 1;

    if (detailed) {
      pushStep(74, { vi: `query ${qi}: [${l}, ${r}]`, en: `query ${qi}: [${l}, ${r}]` }, { vi: "Bắt đầu xử lý query.", en: "Start processing the query." }, { highlight: queryHighlight, vars: [{ name: "l", value: l }, { name: "r", value: r }] });
      pushStep(75, { vi: `i = bisect_left(...) = ${firstBlock}`, en: `i = bisect_left(...) = ${firstBlock}` }, { vi: "Zero-block đầu tiên có right >= l.", en: "First zero block whose right boundary is at least l." }, { highlight: queryHighlight, vars: [{ name: "i", value: firstBlock }] });
      pushStep(76, { vi: `j = bisect_right(...) - 1 = ${lastBlock}`, en: `j = bisect_right(...) - 1 = ${lastBlock}` }, { vi: "Zero-block cuối cùng có left <= r.", en: "Last zero block whose left boundary is at most r." }, { highlight: queryHighlight, vars: [{ name: "j", value: lastBlock }] });
    }

    const fewerThanTwo = firstBlock > m - 1 || lastBlock < 0 || firstBlock >= lastBlock;
    if (detailed) pushStep(78, { vi: `Có ít hơn 2 zero-block → ${fewerThanTwo}`, en: `Fewer than 2 zero blocks → ${fewerThanTwo}` }, { vi: fewerThanTwo ? "Không thể trade trong substring." : "Substring chứa ít nhất hai zero-block.", en: fewerThanTwo ? "No trade is possible in the substring." : "The substring contains at least two zero blocks." }, { highlight: queryHighlight });
    if (fewerThanTwo) {
      answers.push(cnt1);
      if (detailed) {
        pushStep(79, { vi: `ans.append(${cnt1})`, en: `ans.append(${cnt1})` }, { vi: "Giữ nguyên số '1'.", en: "Keep the original one count." }, { highlight: queryHighlight, vars: [{ name: "answer", value: cnt1 }] });
        pushStep(80, { vi: "continue", en: "continue" }, { vi: "Chuyển sang query tiếp theo.", en: "Move to the next query." }, { highlight: queryHighlight });
      }
      continue;
    }

    const firstLen = blockRight[firstBlock] - Math.max(blockLeft[firstBlock], l) + 1;
    const lastLen = Math.min(blockRight[lastBlock], r) - blockLeft[lastBlock] + 1;
    if (detailed) {
      pushStep(82, { vi: `firstLen = ${firstLen}`, en: `firstLen = ${firstLen}` }, { vi: "Độ dài thực của zero-block đầu trong substring.", en: "Actual length of the first zero block inside the substring." }, { highlight: queryHighlight, mark: range(Math.max(blockLeft[firstBlock], l), blockRight[firstBlock]), vars: [{ name: "firstLen", value: firstLen }] });
      pushStep(83, { vi: `lastLen = ${lastLen}`, en: `lastLen = ${lastLen}` }, { vi: "Độ dài thực của zero-block cuối trong substring.", en: "Actual length of the last zero block inside the substring." }, { highlight: queryHighlight, mark: range(blockLeft[lastBlock], Math.min(blockRight[lastBlock], r)), vars: [{ name: "lastLen", value: lastLen }] });
      pushStep(85, { vi: `i + 1 == j → ${firstBlock + 1 === lastBlock}`, en: `i + 1 == j → ${firstBlock + 1 === lastBlock}` }, { vi: firstBlock + 1 === lastBlock ? "Substring chứa đúng hai zero-block." : "Có zero-block hoàn chỉnh ở giữa.", en: firstBlock + 1 === lastBlock ? "The substring contains exactly two zero blocks." : "There are complete zero blocks in the middle." }, { highlight: queryHighlight });
    }

    if (firstBlock + 1 === lastBlock) {
      const bestGain = firstLen + lastLen;
      const answer = cnt1 + bestGain;
      answers.push(answer);
      if (detailed) {
        const mark = [...range(Math.max(blockLeft[firstBlock], l), blockRight[firstBlock]), ...range(blockLeft[lastBlock], Math.min(blockRight[lastBlock], r))];
        pushStep(86, { vi: `bestGain = ${bestGain}`, en: `bestGain = ${bestGain}` }, { vi: "Ghép trực tiếp hai block biên.", en: "Merge the two boundary blocks directly." }, { highlight: queryHighlight, mark, vars: [{ name: "bestGain", value: bestGain }] });
        pushStep(87, { vi: `ans.append(${answer})`, en: `ans.append(${answer})` }, { vi: "Cộng bestGain vào cnt1.", en: "Add bestGain to cnt1." }, { highlight: queryHighlight, mark, vars: [{ name: "answer", value: answer }] });
        pushStep(88, { vi: "continue", en: "continue" }, { vi: "Hoàn tất query này.", en: "Finish this query." }, { highlight: queryHighlight });
      }
      continue;
    }

    const val1 = firstLen + zeroBlocks[firstBlock + 1];
    const val2 = zeroBlocks[lastBlock - 1] + lastLen;
    if (detailed) {
      pushStep(90, { vi: `val1 = ${val1}`, en: `val1 = ${val1}` }, { vi: "Block đầu bị cắt + block kế tiếp hoàn chỉnh.", en: "Cut first block plus the next complete block." }, { highlight: queryHighlight, vars: [{ name: "val1", value: val1 }] });
      pushStep(91, { vi: `val2 = ${val2}`, en: `val2 = ${val2}` }, { vi: "Block áp cuối hoàn chỉnh + block cuối bị cắt.", en: "Complete penultimate block plus the cut last block." }, { highlight: queryHighlight, vars: [{ name: "val2", value: val2 }] });
      pushStep(92, { vi: `val3 = seg.query(${firstBlock + 1}, ${lastBlock - 2})`, en: `val3 = seg.query(${firstBlock + 1}, ${lastBlock - 2})` }, { vi: "Query các cặp hoàn chỉnh ở giữa.", en: "Query complete pairs in the middle." }, { highlight: queryHighlight });
    }
    const middle = queryTree(firstBlock + 1, lastBlock - 2, queryHighlight);
    const val3 = middle.gain;
    let bestGain = val1;
    let bestMark = [...range(Math.max(blockLeft[firstBlock], l), blockRight[firstBlock]), ...range(blockLeft[firstBlock + 1], blockRight[firstBlock + 1])];
    if (val2 > bestGain) {
      bestGain = val2;
      bestMark = [...range(blockLeft[lastBlock - 1], blockRight[lastBlock - 1]), ...range(blockLeft[lastBlock], Math.min(blockRight[lastBlock], r))];
    }
    if (val3 > bestGain) {
      bestGain = val3;
      bestMark = middle.pair >= 0 ? [...range(blockLeft[middle.pair], blockRight[middle.pair]), ...range(blockLeft[middle.pair + 1], blockRight[middle.pair + 1])] : [];
    }
    const answer = cnt1 + bestGain;
    answers.push(answer);
    if (detailed) {
      pushStep(94, { vi: `bestGain = max(${val1}, ${val2}, ${val3}) = ${bestGain}`, en: `bestGain = max(${val1}, ${val2}, ${val3}) = ${bestGain}` }, { vi: "Chọn candidate tốt nhất.", en: "Choose the best candidate." }, { highlight: queryHighlight, mark: bestMark, vars: [{ name: "val1", value: val1 }, { name: "val2", value: val2 }, { name: "val3", value: val3 }, { name: "bestGain", value: bestGain }] });
      pushStep(95, { vi: `ans.append(${answer})`, en: `ans.append(${answer})` }, { vi: "Cộng gain tốt nhất vào cnt1.", en: "Add the best gain to cnt1." }, { highlight: queryHighlight, mark: bestMark, vars: [{ name: "answer", value: answer }] });
    }
  }

  pushStep(97, { vi: `return ans = [${answers.join(", ")}]`, en: `return ans = [${answers.join(", ")}]` }, { vi: "Trả kết quả cho mọi query.", en: "Return all query results." }, { final: true, vars: [{ name: "answer", value: `[${answers.join(", ")}]` }] });
  return { original: s, answer: `[${answers.join(", ")}]`, steps };
}

/**
 * LeetCode 3517: Smallest Palindromic Rearrangement I.
 * Count each character, build the left half in sorted order, then mirror it.
 */
function buildSteps3517(input) {
  const s = String(input || "");
  const source = [...s];
  const freq = {};
  for (const ch of source) freq[ch] = (freq[ch] || 0) + 1;

  const chars = Object.keys(freq).sort();
  const halfLength = Math.floor(source.length / 2);
  const leftParts = [];
  const processed = new Set();
  const steps = [];
  let middle = "";

  function view(activeChar = null, placements = [], formula = "", final = false, showCounts = true) {
    const left = [...leftParts.join("")];
    const preview = new Array(source.length).fill(null);
    for (let i = 0; i < left.length; i++) {
      preview[i] = left[i];
      preview[source.length - 1 - i] = left[i];
    }
    if (middle && source.length % 2 === 1) preview[halfLength] = middle;

    return {
      source: [...source],
      counts: showCounts ? chars.map((ch) => ({ ch, count: freq[ch], pairs: Math.floor(freq[ch] / 2), odd: freq[ch] % 2 })) : [],
      activeChar,
      processed: [...processed],
      left,
      halfLength,
      middle,
      preview,
      placements,
      formula,
      final,
    };
  }

  steps.push({
    title: { vi: `Nhận chuỗi palindrome s = "${s}"`, en: `Read palindromic string s = "${s}"` },
    arr: [], palindromeBuildView: view(null, [], "", false, false),
    codeLines: [3], vars: [{ name: "s", value: `"${s}"` }],
    note: { vi: "Ta sẽ dùng mỗi cặp ký tự cho hai vị trí đối xứng.", en: "Each character pair will occupy two mirrored positions." },
  });

  steps.push({
    title: { vi: "Đếm tần suất từng ký tự", en: "Count every character" },
    arr: [], palindromeBuildView: view(null, [], `Counter(s) = {${chars.map((ch) => `'${ch}': ${freq[ch]}`).join(", ")}}`),
    codeLines: [4], vars: chars.map((ch) => ({ name: `count['${ch}']`, value: freq[ch] })),
    note: { vi: "Mỗi cặp đi vào hai nửa; ký tự có số lượng lẻ sẽ nằm ở giữa.", en: "Each pair goes into both halves; an odd leftover character occupies the center." },
  });

  steps.push({
    title: { vi: "Khởi tạo nửa trái", en: "Initialize the left half" },
    arr: [], palindromeBuildView: view(), codeLines: [5],
    vars: [{ name: "left", value: "[]" }],
    note: { vi: "Nửa trái được xây theo thứ tự alphabet để kết quả nhỏ nhất.", en: "The left half is built alphabetically to make the result lexicographically smallest." },
  });

  steps.push({
    title: { vi: "Khởi tạo ký tự giữa", en: "Initialize the middle character" },
    arr: [], palindromeBuildView: view(), codeLines: [6],
    vars: [{ name: "middle", value: '""' }],
    note: { vi: "Chuỗi độ dài chẵn sẽ giữ middle rỗng.", en: "For an even-length string, middle remains empty." },
  });

  for (const ch of chars) {
    const count = freq[ch];
    const pairs = Math.floor(count / 2);
    const remainder = count % 2;

    steps.push({
      title: { vi: `Xét ký tự '${ch}'`, en: `Process character '${ch}'` },
      arr: [], palindromeBuildView: view(ch, [], `count['${ch}'] = ${count}`),
      codeLines: [7], vars: [{ name: "ch", value: `'${ch}'` }, { name: "count", value: count }],
      note: { vi: "Các ký tự được xét theo thứ tự tăng dần.", en: "Characters are processed in ascending order." },
    });

    steps.push({
      title: { vi: `Số cặp '${ch}' = ${pairs}`, en: `Number of '${ch}' pairs = ${pairs}` },
      arr: [], palindromeBuildView: view(ch, [], `${count} // 2 = ${pairs} pair${pairs === 1 ? "" : "s"}`),
      codeLines: [8], vars: [{ name: "pairs", value: pairs }],
      note: { vi: `Dùng ${pairs} ký tự '${ch}' cho nửa trái và ${pairs} ký tự đối xứng ở nửa phải.`, en: `Use ${pairs} '${ch}' character(s) in the left half and ${pairs} mirrored in the right half.` },
    });

    const before = leftParts.join("").length;
    leftParts.push(ch.repeat(pairs));
    const placements = [];
    for (let i = before; i < before + pairs; i++) placements.push(i, source.length - 1 - i);
    steps.push({
      title: { vi: `Thêm '${ch.repeat(pairs)}' vào nửa trái`, en: `Append '${ch.repeat(pairs)}' to the left half` },
      arr: [], palindromeBuildView: view(ch, placements, `left += '${ch}' × ${pairs}`),
      codeLines: [9], vars: [{ name: "left", value: `"${leftParts.join("")}"` }],
      note: { vi: "Visualization đồng thời cho thấy vị trí đối xứng tương ứng ở nửa phải.", en: "The visualization also shows the corresponding mirrored positions in the right half." },
    });

    steps.push({
      title: { vi: `Kiểm tra ${count} % 2 != 0`, en: `Check ${count} % 2 != 0` },
      arr: [], palindromeBuildView: view(ch, [], `${count} % 2 = ${remainder}`),
      codeLines: [10], vars: [{ name: "condition", value: remainder ? "True" : "False" }],
      note: { vi: remainder ? `Còn dư một '${ch}', nên đặt nó ở giữa.` : `Không còn ký tự '${ch}' dư.`, en: remainder ? `One '${ch}' remains, so place it in the center.` : `No '${ch}' character remains.` },
    });

    if (remainder) {
      middle = ch;
      steps.push({
        title: { vi: `Gán middle = '${ch}'`, en: `Assign middle = '${ch}'` },
        arr: [], palindromeBuildView: view(ch, [halfLength], `middle = '${ch}'`),
        codeLines: [11], vars: [{ name: "middle", value: `'${ch}'` }],
        note: { vi: "Palindrome chỉ có tối đa một ký tự không ghép cặp.", en: "A palindrome has at most one unpaired character." },
      });
    }

    processed.add(ch);
  }

  const half = leftParts.join("");
  steps.push({
    title: { vi: `Ghép nửa trái: half = "${half}"`, en: `Join the left half: half = "${half}"` },
    arr: [], palindromeBuildView: view(null, [], `half = "${half}"`),
    codeLines: [12], vars: [{ name: "half", value: `"${half}"` }],
    note: { vi: "Nửa trái đã tăng dần; nửa phải bắt buộc là bản đảo của nó.", en: "The left half is sorted; the right half must be its reverse." },
  });

  const answer = half + middle + [...half].reverse().join("");
  steps.push({
    title: { vi: `Kết quả: "${answer}"`, en: `Result: "${answer}"` },
    arr: [], palindromeBuildView: view(null, source.map((_, i) => i), `${half} + ${middle || "∅"} + ${[...half].reverse().join("")}`, true),
    final: true, codeLines: [13], vars: [{ name: "answer", value: `"${answer}"` }],
    note: { vi: "Nửa phải là reverse của nửa trái, nên kết quả vừa palindrome vừa nhỏ nhất theo thứ tự từ điển.", en: "The right half is the reverse of the left, so the result is both palindromic and lexicographically smallest." },
  });

  return { original: s, answer, steps };
}

/**
 * Approach 2 for LeetCode 3517: because s is already a palindrome, its first
 * half contains exactly one character from every mirrored pair.
 */
function buildSteps3517HalfBucket(input) {
  const s = String(input || "");
  const source = [...s];
  const n = source.length;
  const partition = Math.floor(n / 2);
  const bucket = new Array(26).fill(0);
  const steps = [];
  let left = "";
  let mid = "";
  let right = "";

  function snapshot({
    title,
    note,
    codeLines,
    vars = [],
    scanIndex = -1,
    activeBucket = -1,
    placements = [],
    formula = "",
    showBucket = true,
    final = false,
  }) {
    const preview = new Array(n).fill(null);
    for (let i = 0; i < left.length; i++) preview[i] = left[i];
    if (mid) preview[partition] = mid;
    const rightStart = partition + (n % 2);
    for (let i = 0; i < right.length; i++) preview[rightStart + i] = right[i];

    steps.push({
      title,
      arr: [],
      palindromeBuildView: {
        source: [...source],
        counts: [],
        bucket: showBucket ? [...bucket] : [],
        partition,
        scanIndex,
        activeBucket,
        left: [...left],
        middle: mid,
        right,
        halfLength: partition,
        preview,
        placements,
        formula,
        final,
        bucketApproach: true,
      },
      codeBlock: 2,
      codeLines,
      vars,
      note,
      final,
    });
  }

  snapshot({
    title: { vi: `partition = len(s) // 2 = ${partition}`, en: `partition = len(s) // 2 = ${partition}` },
    note: { vi: `Chỉ cần đếm s[0..${Math.max(0, partition - 1)}] vì s đã là palindrome: nửa đầu chứa đúng một ký tự của mỗi cặp đối xứng.`, en: `Only s[0..${Math.max(0, partition - 1)}] must be counted because s is already palindromic: the first half contains one character from each mirrored pair.` },
    codeLines: [3],
    vars: [{ name: "len(s)", value: n }, { name: "partition", value: partition }],
    formula: `${n} // 2 = ${partition}`,
    showBucket: false,
  });

  snapshot({
    title: { vi: "Khởi tạo bucket gồm 26 số 0", en: "Initialize a bucket of 26 zeros" },
    note: { vi: "Mỗi index 0..25 tương ứng với ký tự a..z.", en: "Each index 0..25 corresponds to a character a..z." },
    codeLines: [4],
    vars: [{ name: "bucket", value: `[${bucket.join(",")}]` }],
    formula: "bucket[0..25] = 0",
  });

  for (let i = 0; i < partition; i++) {
    const ch = source[i];
    const bucketIndex = ch.charCodeAt(0) - 97;
    snapshot({
      title: { vi: `Vòng lặp: i = ${i}`, en: `Loop: i = ${i}` },
      note: { vi: `i=${i} còn nằm trong range(${partition}), đọc s[${i}] = '${ch}'.`, en: `i=${i} is still in range(${partition}); read s[${i}] = '${ch}'.` },
      codeLines: [6],
      vars: [{ name: "i", value: i }, { name: "s[i]", value: `'${ch}'` }],
      scanIndex: i,
      activeBucket: bucketIndex,
      formula: `ord('${ch}') - 97 = ${bucketIndex}`,
    });

    bucket[bucketIndex] += 1;
    snapshot({
      title: { vi: `bucket[${bucketIndex}] += 1`, en: `bucket[${bucketIndex}] += 1` },
      note: { vi: `Đã đếm thêm một '${ch}': bucket[${bucketIndex}] = ${bucket[bucketIndex]}.`, en: `Count one more '${ch}': bucket[${bucketIndex}] = ${bucket[bucketIndex]}.` },
      codeLines: [7],
      vars: [{ name: "i", value: i }, { name: "bucket index", value: bucketIndex }, { name: `bucket[${bucketIndex}]`, value: bucket[bucketIndex] }],
      scanIndex: i,
      activeBucket: bucketIndex,
      formula: `bucket[ord('${ch}') - 97] = ${bucket[bucketIndex]}`,
    });
  }

  snapshot({
    title: { vi: `Kết thúc vòng lặp tại i = ${partition}`, en: `Finish the loop at i = ${partition}` },
    note: { vi: `Đã duyệt đủ ${partition} ký tự của nửa đầu.`, en: `All ${partition} characters in the first half have been counted.` },
    codeLines: [6],
    vars: [{ name: "i", value: partition }, { name: "condition", value: "False" }],
    formula: `${partition} ∉ range(${partition})`,
  });

  snapshot({
    title: { vi: "Bắt đầu tạo left", en: "Start building left" },
    note: { vi: "left chưa được gán; Python bắt đầu đánh giá biểu thức join.", en: "left is not assigned yet; Python starts evaluating the join expression." },
    codeLines: [9],
    vars: [{ name: "left", value: "unassigned" }],
    formula: 'left = "".join(...)',
  });

  const pieces = [];
  for (let index = 0; index < 26; index++) {
    if (bucket[index] <= 0) continue;
    const ch = String.fromCharCode(index + 97);
    const piece = ch.repeat(bucket[index]);
    pieces.push(piece);
    snapshot({
      title: { vi: `Comprehension lấy '${piece}' từ bucket[${index}]`, en: `Comprehension takes '${piece}' from bucket[${index}]` },
      note: { vi: `bucket[${index}] > 0 nên tạo chr(${index} + 97) × ${bucket[index]} = '${piece}'. left vẫn chưa được gán cho đến khi join hoàn tất.`, en: `bucket[${index}] > 0, so create chr(${index} + 97) × ${bucket[index]} = '${piece}'. left remains unassigned until join finishes.` },
      codeLines: [10],
      vars: [{ name: "bucket index", value: index }, { name: "character", value: `'${ch}'` }, { name: "piece", value: `'${piece}'` }],
      activeBucket: index,
      formula: `chr(${index} + 97) × ${bucket[index]} = '${piece}'`,
    });
  }

  left = pieces.join("");
  snapshot({
    title: { vi: `Hoàn tất join: left = "${left}"`, en: `Finish join: left = "${left}"` },
    note: { vi: "Các bucket được đọc từ a đến z, nên left tự động tăng dần.", en: "Buckets are read from a to z, so left is automatically sorted." },
    codeLines: [11],
    vars: [{ name: "left", value: `"${left}"` }],
    placements: [...left].map((_, i) => i),
    formula: `"".join([${pieces.map((piece) => `'${piece}'`).join(", ")}]) = "${left}"`,
  });

  mid = n % 2 !== 0 ? source[partition] : "";
  snapshot({
    title: { vi: `mid = ${mid ? `'${mid}'` : "''"}`, en: `mid = ${mid ? `'${mid}'` : "''"}` },
    note: { vi: n % 2 ? `Độ dài lẻ nên lấy s[partition] = s[${partition}] = '${mid}'.` : "Độ dài chẵn nên mid là chuỗi rỗng.", en: n % 2 ? `The length is odd, so take s[partition] = s[${partition}] = '${mid}'.` : "The length is even, so mid is empty." },
    codeLines: [13],
    vars: [{ name: "len(s) % 2", value: n % 2 }, { name: "mid", value: `"${mid}"` }],
    placements: mid ? [partition] : [],
    formula: n % 2 ? `s[${partition}] = '${mid}'` : 'mid = ""',
  });

  right = [...left].reverse().join("");
  const rightStart = partition + (n % 2);
  snapshot({
    title: { vi: `right = left[::-1] = "${right}"`, en: `right = left[::-1] = "${right}"` },
    note: { vi: "Đảo nửa trái để tạo đúng các vị trí đối xứng của palindrome.", en: "Reverse the left half to create the mirrored positions of the palindrome." },
    codeLines: [14],
    vars: [{ name: "left", value: `"${left}"` }, { name: "right", value: `"${right}"` }],
    placements: [...right].map((_, i) => rightStart + i),
    formula: `"${left}"[::-1] = "${right}"`,
  });

  const answer = left + mid + right;
  snapshot({
    title: { vi: `Trả về "${answer}"`, en: `Return "${answer}"` },
    note: { vi: "Ghép left + mid + right để nhận palindrome nhỏ nhất theo thứ tự từ điển.", en: "Concatenate left + mid + right to get the lexicographically smallest palindrome." },
    codeLines: [16],
    vars: [{ name: "answer", value: `"${answer}"` }],
    placements: source.map((_, i) => i),
    formula: `${left} + ${mid || "∅"} + ${right} = ${answer}`,
    final: true,
  });

  return { original: s, answer, steps };
}

/**
 * LeetCode 3518: Smallest Palindromic Rearrangement II.
 * A palindrome is fully determined by its left half, so find the k-th distinct
 * multiset permutation of that half. Counts are capped just above the maximum k.
 */
function buildSteps3518(input, params) {
  const s = String(input || "");
  const source = [...s];
  const requestedK = Math.max(1, Math.trunc(Number(params && params.k) || 1));
  const cap = 1000001;
  const counts = new Array(26).fill(0);
  for (const ch of source) {
    const index = ch.charCodeAt(0) - 97;
    if (index >= 0 && index < 26) counts[index] += 1;
  }

  const halfCounts = counts.map((count) => Math.floor(count / 2));
  const halfLength = halfCounts.reduce((sum, count) => sum + count, 0);
  const middleIndex = counts.findIndex((count) => count % 2 === 1);
  const middle = middleIndex >= 0 ? String.fromCharCode(97 + middleIndex) : "";
  const steps = [];
  const left = [];
  let currentK = requestedK;
  let countsVisible = false;
  let halfVisible = false;
  let middleVisible = false;
  let knownTotalWays = null;

  function cappedChoose(n, r) {
    let choose = Math.min(r, n - r);
    let result = 1;
    for (let i = 1; i <= choose; i++) {
      result = (result * (n - i + 1)) / i;
      if (result >= cap) return cap;
    }
    return Math.round(result);
  }

  function countPermutations(freq) {
    let remaining = freq.reduce((sum, count) => sum + count, 0);
    let total = 1;
    for (const amount of freq) {
      if (!amount) continue;
      total *= cappedChoose(remaining, amount);
      if (total >= cap) return cap;
      remaining -= amount;
    }
    return Math.round(total);
  }

  function candidateOptions(freq) {
    const options = [];
    let rangeStart = 1;
    for (let index = 0; index < 26; index++) {
      if (!freq[index]) continue;
      const next = [...freq];
      next[index] -= 1;
      const ways = countPermutations(next);
      options.push({
        index,
        ch: String.fromCharCode(97 + index),
        ways,
        capped: ways >= cap,
        rangeStart,
        rangeEnd: rangeStart + ways - 1,
        status: "untried",
      });
      rangeStart += ways;
    }
    return options;
  }

  function snapshot({
    title,
    note,
    codeLines,
    vars = [],
    phase,
    activeIndex = -1,
    candidates = [],
    rankAtPosition = null,
    position = left.length,
    totalWays = knownTotalWays,
    formula = "",
    final = false,
    impossible = false,
  }) {
    const preview = new Array(source.length).fill(null);
    for (let i = 0; i < left.length; i++) {
      preview[i] = left[i];
      preview[source.length - 1 - i] = left[i];
    }
    if (middleVisible && middle) preview[halfLength] = middle;

    steps.push({
      title,
      arr: [],
      kthPalindromeView: {
        source: [...source],
        counts: countsVisible ? counts.map((count, index) => ({
          ch: String.fromCharCode(97 + index), count, half: Math.floor(count / 2),
        })).filter((item) => item.count > 0) : [],
        halfCounts: halfVisible ? [...halfCounts] : [],
        halfLength,
        middle: middleVisible ? middle : "",
        left: [...left],
        preview,
        requestedK,
        currentK,
        rankAtPosition,
        position,
        totalWays,
        totalCapped: totalWays >= cap,
        activeIndex,
        candidates: candidates.map((candidate) => ({ ...candidate })),
        phase,
        formula,
        final,
        impossible,
        cap,
      },
      codeLines,
      vars,
      note,
      final,
    });
  }

  snapshot({
    title: { vi: `Nhận s = "${s}", k = ${requestedK}`, en: `Read s = "${s}", k = ${requestedK}` },
    note: { vi: "Mỗi palindrome được xác định hoàn toàn bởi nửa trái; nửa phải chỉ là ảnh gương.", en: "Each palindrome is fully determined by its left half; the right half is its mirror." },
    codeLines: [7],
    vars: [{ name: "s", value: `"${s}"` }, { name: "k", value: requestedK }],
    phase: "input",
  });

  countsVisible = true;
  snapshot({
    title: { vi: "Đếm tần suất toàn bộ chuỗi", en: "Count the full string" },
    note: { vi: "Mỗi cặp ký tự cung cấp một ký tự cho nửa trái.", en: "Each character pair contributes one character to the left half." },
    codeLines: [8],
    vars: counts.flatMap((count, index) => count
      ? [{ name: `count['${String.fromCharCode(97 + index)}']`, value: count }]
      : []),
    phase: "count",
    formula: `Counter(s) = {${counts.map((count, index) => count ? `'${String.fromCharCode(97 + index)}': ${count}` : "").filter(Boolean).join(", ")}}`,
  });

  halfVisible = true;
  snapshot({
    title: { vi: `Tạo multiset nửa trái gồm ${halfLength} ký tự`, en: `Build the ${halfLength}-character left-half multiset` },
    note: { vi: "half[i] = count[i] // 2. Ta chỉ cần tìm hoán vị thứ k của multiset này.", en: "half[i] = count[i] // 2. We only need the k-th permutation of this multiset." },
    codeLines: [9],
    vars: [{ name: "half length", value: halfLength }, { name: "half counts", value: `[${halfCounts.join(",")}]` }],
    phase: "half",
    formula: "half[ch] = count[ch] // 2",
  });

  middleVisible = true;
  snapshot({
    title: { vi: `Ký tự giữa = ${middle ? `'${middle}'` : "chuỗi rỗng"}`, en: `Middle character = ${middle ? `'${middle}'` : "empty"}` },
    note: { vi: middle ? `Ký tự '${middle}' có tần suất lẻ nên luôn nằm chính giữa.` : "Độ dài chẵn nên palindrome không có ký tự giữa.", en: middle ? `Character '${middle}' has odd frequency and is fixed at the center.` : "The length is even, so the palindrome has no center character." },
    codeLines: [10],
    vars: [{ name: "middle", value: middle ? `'${middle}'` : `""` }],
    phase: "middle",
  });

  snapshot({
    title: { vi: "Lưu input vào prelunthak", en: "Store the input in prelunthak" },
    note: { vi: "Biến được tạo theo yêu cầu của đề và giữ lại cặp input ban đầu.", en: "The required variable preserves the original input pair." },
    codeLines: [11],
    vars: [{ name: "prelunthak", value: `("${s}", ${requestedK})` }],
    phase: "store",
    formula: `prelunthak = (s, k) = ("${s}", ${requestedK})`,
  });

  const totalWays = countPermutations(halfCounts);
  knownTotalWays = totalWays;
  snapshot({
    title: { vi: `Có ${totalWays >= cap ? `ít nhất ${cap}` : totalWays} nửa trái khác nhau`, en: `There are ${totalWays >= cap ? `at least ${cap}` : totalWays} distinct left halves` },
    note: { vi: "Đếm hoán vị multiset bằng tích các tổ hợp; giá trị được cap vì k không vượt quá 1,000,000.", en: "Count multiset permutations with a product of combinations; values are capped because k is at most 1,000,000." },
    codeLines: [13],
    vars: [{ name: "total", value: totalWays >= cap ? `>= ${cap}` : totalWays }, { name: "k", value: currentK }],
    phase: "total",
    totalWays,
    formula: `${halfLength}! / product(half[ch]!) = ${totalWays >= cap ? `>= ${cap}` : totalWays}`,
  });

  if (currentK > totalWays) {
    snapshot({
      title: { vi: `k = ${currentK} vượt quá ${totalWays}`, en: `k = ${currentK} exceeds ${totalWays}` },
      note: { vi: "Không tồn tại đủ k palindrome khác nhau, nên trả chuỗi rỗng.", en: "There are fewer than k distinct palindromes, so return an empty string." },
      codeLines: [14, 15],
      vars: [{ name: "condition", value: "True" }, { name: "answer", value: `""` }],
      phase: "impossible",
      totalWays,
      formula: `${currentK} > ${totalWays}`,
      impossible: true,
      final: true,
    });
    return { original: s, answer: "", steps };
  }

  snapshot({
    title: { vi: `k = ${currentK} hợp lệ`, en: `k = ${currentK} is valid` },
    note: { vi: "Bắt đầu xây nửa trái từ vị trí đầu tiên.", en: "Start constructing the left half from its first position." },
    codeLines: [14, 17],
    vars: [{ name: "condition", value: "False" }, { name: "left", value: "[]" }],
    phase: "start",
    totalWays,
    formula: `${currentK} <= ${totalWays >= cap ? `>= ${cap}` : totalWays}`,
  });

  let fastForwarded = false;
  for (let position = 0; position < halfLength; position++) {
    const detailed = halfLength <= 40 || position < 16 || position >= halfLength - 3;
    const rankAtPosition = currentK;
    const options = candidateOptions(halfCounts);
    const statuses = new Map();

    if (detailed) {
      snapshot({
        title: { vi: `Vị trí ${position}: tìm block chứa rank ${rankAtPosition}`, en: `Position ${position}: find the block containing rank ${rankAtPosition}` },
        note: { vi: "Mỗi ký tự có thể chọn tạo ra một block palindrome liên tiếp theo thứ tự từ điển.", en: "Each possible next character creates one contiguous lexicographic block of palindromes." },
        codeLines: [18],
        vars: [{ name: "pos", value: position }, { name: "k", value: currentK }, { name: "left", value: `"${left.join("")}"` }],
        phase: "position",
        candidates: options,
        rankAtPosition,
        position,
        formula: `target rank inside this prefix = ${rankAtPosition}`,
      });
    } else if (!fastForwarded) {
      fastForwarded = true;
      snapshot({
        title: { vi: "Tua nhanh các vị trí ở giữa", en: "Fast-forward the middle positions" },
        note: { vi: "Với input lớn, visualization giữ các bước đầu và cuối; thuật toán vẫn xử lý mọi vị trí.", en: "For large inputs, the visualization keeps the first and last positions; the algorithm still processes every position." },
        codeLines: [18],
        vars: [{ name: "remaining positions", value: halfLength - position }],
        phase: "fast-forward",
        position,
      });
    }

    for (const option of options) {
      if (detailed) {
        const trying = options.map((candidate) => ({
          ...candidate,
          status: candidate.index === option.index ? "trying" : (statuses.get(candidate.index) || "untried"),
        }));
        snapshot({
          title: { vi: `Thử '${option.ch}' tại vị trí ${position}`, en: `Try '${option.ch}' at position ${position}` },
          note: { vi: `Tạm dùng một '${option.ch}', rồi đếm số cách hoàn thành phần đuôi.`, en: `Tentatively use one '${option.ch}', then count ways to complete the suffix.` },
          codeLines: [19, 20, 21],
          vars: [{ name: "i", value: option.index }, { name: "char", value: `'${option.ch}'` }, { name: "half[i]", value: halfCounts[option.index] }],
          phase: "try",
          activeIndex: option.index,
          candidates: trying,
          rankAtPosition,
          position,
          formula: `candidate '${option.ch}' covers ranks ${option.rangeStart}..${option.rangeEnd}`,
        });
      }

      halfCounts[option.index] -= 1;
      const ways = countPermutations(halfCounts);
      if (detailed) {
        const counted = options.map((candidate) => ({
          ...candidate,
          status: candidate.index === option.index ? "counted" : (statuses.get(candidate.index) || "untried"),
        }));
        snapshot({
          title: { vi: `'${option.ch}' tạo ${ways >= cap ? `ít nhất ${cap}` : ways} cách hoàn thành`, en: `'${option.ch}' creates ${ways >= cap ? `at least ${cap}` : ways} completions` },
          note: { vi: "ways là kích thước block có prefix hiện tại cộng với ký tự đang thử.", en: "ways is the size of the block under the current prefix plus the candidate character." },
          codeLines: [23, 24],
          vars: [{ name: `half['${option.ch}']`, value: halfCounts[option.index] }, { name: "ways", value: ways >= cap ? `>= ${cap}` : ways }, { name: "k", value: currentK }],
          phase: "count-candidate",
          activeIndex: option.index,
          candidates: counted,
          rankAtPosition,
          position,
          formula: `ways('${left.join("") + option.ch}') = ${ways >= cap ? `>= ${cap}` : ways}`,
        });
      }

      if (currentK > ways) {
        const previousK = currentK;
        currentK -= ways;
        halfCounts[option.index] += 1;
        statuses.set(option.index, "skipped");
        if (detailed) {
          snapshot({
            title: { vi: `Bỏ block '${option.ch}': k ${previousK} -> ${currentK}`, en: `Skip the '${option.ch}' block: k ${previousK} -> ${currentK}` },
            note: { vi: `Rank cần tìm nằm sau ${ways} kết quả bắt đầu bằng '${option.ch}', nên trừ đúng kích thước block và hoàn lại count.`, en: `The target lies after ${ways} results beginning with '${option.ch}', so subtract that block and restore the count.` },
            codeLines: [26, 27, 28],
            vars: [{ name: "condition", value: "True" }, { name: "k", value: `${previousK} - ${ways} = ${currentK}` }, { name: `half['${option.ch}']`, value: halfCounts[option.index] }],
            phase: "skip",
            activeIndex: option.index,
            candidates: options.map((candidate) => ({ ...candidate, status: statuses.get(candidate.index) || "untried" })),
            rankAtPosition,
            position,
            formula: `${previousK} > ${ways}; new k = ${currentK}`,
          });
        }
        continue;
      }

      left.push(option.ch);
      statuses.set(option.index, "chosen");
      if (detailed) {
        snapshot({
          title: { vi: `Chọn '${option.ch}' cho vị trí ${position}`, en: `Choose '${option.ch}' for position ${position}` },
          note: { vi: `k = ${currentK} nằm trong block ${ways} cách này. Giữ count đã giảm và cố định ký tự '${option.ch}'.`, en: `k = ${currentK} lies inside this block of ${ways} ways. Keep the decremented count and fix '${option.ch}'.` },
          codeLines: [26, 29, 30, 31],
          vars: [{ name: "condition", value: "False" }, { name: "left", value: `"${left.join("")}"` }, { name: "k", value: currentK }],
          phase: "choose",
          activeIndex: option.index,
          candidates: options.map((candidate) => ({ ...candidate, status: statuses.get(candidate.index) || "untried" })),
          rankAtPosition,
          position,
          formula: `${currentK} <= ${ways}; prefix = "${left.join("")}"`,
        });
      }
      break;
    }
  }

  const leftText = left.join("");
  snapshot({
    title: { vi: `Hoàn tất nửa trái: "${leftText}"`, en: `Finish the left half: "${leftText}"` },
    note: { vi: "current k luôn là rank bên trong block prefix đã chọn.", en: "The current k has remained the rank inside the selected prefix block." },
    codeLines: [33],
    vars: [{ name: "left", value: `"${leftText}"` }, { name: "k", value: currentK }],
    phase: "join",
    position: halfLength,
    formula: `left = "".join(left) = "${leftText}"`,
  });

  const answer = leftText + middle + [...leftText].reverse().join("");
  snapshot({
    title: { vi: `Palindrome thứ ${requestedK}: "${answer}"`, en: `Palindrome #${requestedK}: "${answer}"` },
    note: { vi: "Nửa phải là reverse của nửa trái; thứ tự palindrome giống hệt thứ tự các nửa trái.", en: "The right half is the reverse of the left; palindrome order is exactly the order of their left halves." },
    codeLines: [34],
    vars: [{ name: "answer", value: `"${answer}"` }, { name: "requested k", value: requestedK }],
    phase: "final",
    position: halfLength,
    formula: `${leftText} + ${middle || "empty"} + ${[...leftText].reverse().join("")} = ${answer}`,
    final: true,
  });

  return { original: s, answer, steps };
}

/**
 * LeetCode 3458: Select K Disjoint Special Substrings.
 * A substring is "special" if no character inside it appears outside it, and it
 * is NOT the whole string. Build the minimal special interval starting at each
 * char's first occurrence (like Partition Labels), then greedily pick the max
 * number of non-overlapping ones and check if it reaches k.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def maxSubstringLength(self, s, k):
 *  3          if k == 0: return True
 *  4          first, last = first/last occurrence of each char
 *  5          intervals = []
 *  6          for i in range(n):
 *  7              if first[s[i]] != i: continue
 *  8              j = last[s[i]]; t = i; valid = True
 *  9              while t <= j:
 * 10                  if first[s[t]] < i: valid = False; break
 * 11                  j = max(j, last[s[t]]); t += 1
 * 12              if valid and not (i==0 and j==n-1): intervals.append((j, i))
 * 13          intervals.sort()
 * 14          count = 0; prev_end = -1
 * 15          for end, start in intervals:
 * 16              if start > prev_end: count += 1; prev_end = end
 * 17          return count >= k
 */
function buildSteps3458(input, params) {
  const s = String(input);
  const n = s.length;
  const k = params && params.k !== undefined ? Number(params.k) : 2;
  const chars = s.split("");
  const steps = [];

  const first = {};
  const last = {};
  for (let i = 0; i < n; i++) {
    if (!(s[i] in first)) first[s[i]] = i;
    last[s[i]] = i;
  }

  const inRange = (lo, hi) => (lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, x) => lo + x) : []);
  function makeGrid(opts) {
    const labels = {};
    const setLabel = (idx, lb) => {
      if (idx < 0 || idx >= n) return;
      const key = `0,${idx + 1}`;
      labels[key] = labels[key] ? `${labels[key]}\n${lb}` : lb;
    };
    (opts.selected || []).forEach(([st, en], gi) => {
      for (const idx of inRange(st, en)) setLabel(idx, `S${gi + 1}`);
    });
    if (opts.window) { setLabel(opts.window[0], "i"); setLabel(opts.window[1], "j"); }
    return {
      dp: [["", ...chars]],
      text1: "",
      text2: s,
      colLabels: chars.map((ch, i) => ({ index: `${i}`, char: ch })),
      hlCell: Number.isInteger(opts.focus) ? [0, opts.focus + 1] : null,
      pathCells: opts.window ? inRange(opts.window[0], opts.window[1]).map((i) => [0, i + 1]) : [],
      historyCells: (opts.selected || []).flatMap(([st, en]) => inRange(st, en).map((i) => [0, i + 1])),
      cellLabels: labels,
      largeCells: true,
      caption: opts.caption || "",
    };
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: makeGrid(opts),
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  const firstStr = `{${Object.keys(first).map((c) => `${c}:${first[c]}`).join(", ")}}`;
  const lastStr = `{${Object.keys(last).map((c) => `${c}:${last[c]}`).join(", ")}}`;

  snap({
    title: { vi: "Tính first/last mỗi ký tự", en: "Compute first/last of each char" },
    codeLines: [4, 5],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "k", value: k },
      { name: "first", value: firstStr },
      { name: "last", value: lastStr },
    ],
    note: {
      vi:
        `Chuỗi con "đặc biệt" = mọi ký tự bên trong KHÔNG xuất hiện bên ngoài, và KHÔNG phải cả chuỗi.\n` +
        `Ý tưởng: từ mỗi vị trí xuất hiện ĐẦU của một ký tự, mở rộng đoạn tới khi "đóng kín" (giống Partition Labels).\n` +
        `Sau đó chọn tối đa số đoạn RỜI NHAU và kiểm tra ≥ k.`,
      en:
        `A "special" substring = every inside char does NOT appear outside, and it is NOT the whole string.\n` +
        `Idea: from each char's FIRST occurrence, expand the segment until "closed" (like Partition Labels).\n` +
        `Then pick the max number of DISJOINT segments and check ≥ k.`,
    },
  });

  // Build minimal special intervals
  const intervals = [];
  for (let i = 0; i < n; i++) {
    if (first[s[i]] !== i) continue;
    let j = last[s[i]];
    let t = i;
    let valid = true;
    while (t <= j) {
      if (first[s[t]] < i) { valid = false; break; }
      j = Math.max(j, last[s[t]]);
      t += 1;
    }
    const isWhole = (i === 0 && j === n - 1);
    if (valid && !isWhole) intervals.push([j, i]); // (end, start)

    snap({
      title: { vi: `Start i=${i} ('${s[i]}'): đoạn [${i}, ${valid ? j : "?"}] ${valid ? (isWhole ? "= cả chuỗi → loại" : "→ hợp lệ") : "→ không đóng kín"}`, en: `Start i=${i} ('${s[i]}'): segment [${i}, ${valid ? j : "?"}] ${valid ? (isWhole ? "= whole string → reject" : "→ valid") : "→ not closed"}` },
      focus: i,
      window: valid ? [i, j] : [i, Math.min(j, n - 1)],
      codeLines: [6, 7, 8, 9, 10, 11, 12],
      vars: [
        { name: "i", value: i },
        { name: "char", value: `'${s[i]}'` },
        { name: "end j", value: valid ? j : "broke" },
        { name: "valid", value: valid && !isWhole },
        { name: "intervals", value: intervals.map(([e, st]) => `[${st},${e}]`).join(", ") || "none" },
      ],
      note: {
        vi: valid
          ? (isWhole
            ? `Đoạn [${i},${j}] phủ cả chuỗi → không được tính là special.`
            : `Mở rộng: j = max(last của mọi ký tự trong đoạn) = ${j}. Mọi ký tự trong [${i},${j}] không xuất hiện ngoài → đoạn ĐÓNG KÍN, hợp lệ.`)
          : `Có ký tự trong đoạn xuất hiện TRƯỚC i (first < ${i}) → đoạn không thể bắt đầu ở ${i} → bỏ.`,
        en: valid
          ? (isWhole
            ? `Segment [${i},${j}] covers the whole string → not counted as special.`
            : `Expand: j = max(last of every char inside) = ${j}. All chars in [${i},${j}] don't appear outside → CLOSED, valid.`)
          : `A char inside appears BEFORE i (first < ${i}) → cannot start at ${i} → skip.`,
      },
    });
  }

  // Greedy select
  intervals.sort((a, b) => a[0] - b[0]);
  let count = 0;
  let prevEnd = -1;
  const selected = [];

  snap({
    title: { vi: `Sắp ${intervals.length} đoạn theo end; greedy chọn rời nhau`, en: `Sort ${intervals.length} segments by end; greedily pick disjoint` },
    codeLines: [13, 14],
    vars: [
      { name: "intervals (by end)", value: intervals.map(([e, st]) => `[${st},${e}]`).join(", ") || "none" },
      { name: "count", value: 0 },
      { name: "prev_end", value: -1 },
    ],
    note: {
      vi: "Sắp các đoạn theo END tăng dần. Duyệt và chọn đoạn nếu start > prev_end (không chồng lấn) — chiến lược tham lam tối đa số đoạn rời nhau.",
      en: "Sort segments by END ascending. Pick a segment if start > prev_end (non-overlapping) — greedy strategy maximizing disjoint count.",
    },
  });

  for (const [end, start] of intervals) {
    const pick = start > prevEnd;
    if (pick) { count += 1; prevEnd = end; selected.push([start, end]); }
    snap({
      title: { vi: `Đoạn [${start},${end}]: ${pick ? `CHỌN → count=${count}` : "bỏ (chồng lấn)"}`, en: `Segment [${start},${end}]: ${pick ? `PICK → count=${count}` : "skip (overlaps)"}` },
      focus: start,
      window: [start, end],
      selected: [...selected],
      codeLines: [15, 16],
      vars: [
        { name: "segment", value: `[${start},${end}]` },
        { name: "start > prev_end?", value: `${start} > ${pick ? prevEnd === end ? "prev" : prevEnd : prevEnd}` },
        { name: "count", value: count },
        { name: "prev_end", value: prevEnd },
      ],
      note: {
        vi: pick
          ? `start=${start} > prev_end → không chồng đoạn đã chọn → CHỌN. count=${count}, prev_end=${end}.`
          : `start=${start} ≤ prev_end=${prevEnd} → chồng lấn đoạn đã chọn → bỏ qua.`,
        en: pick
          ? `start=${start} > prev_end → doesn't overlap chosen → PICK. count=${count}, prev_end=${end}.`
          : `start=${start} ≤ prev_end=${prevEnd} → overlaps a chosen segment → skip.`,
      },
    });
  }

  const answer = count >= k;
  snap({
    title: { vi: `count=${count} ${answer ? "≥" : "<"} k=${k} → ${answer}`, en: `count=${count} ${answer ? "≥" : "<"} k=${k} → ${answer}` },
    selected: [...selected],
    final: true,
    codeLines: [17],
    vars: [
      { name: "count", value: count },
      { name: "k", value: k },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Số đoạn special rời nhau tối đa = ${count}. ${answer ? `≥ k=${k} → chọn được k đoạn → true.` : `< k=${k} → không đủ → false.`}`,
      en: `Max disjoint special segments = ${count}. ${answer ? `≥ k=${k} → can select k → true.` : `< k=${k} → not enough → false.`}`,
    },
  });

  return { original: s, answer, steps };
}

/**
 * LeetCode 49: Group Anagrams — hash map keyed by sorted letters.
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def groupAnagrams(self, strs):
 *  3          groups = defaultdict(list)
 *  4          for word in strs:
 *  5              key = "".join(sorted(word))
 *  6              groups[key].append(word)
 *  7          return list(groups.values())
 */
function buildSteps49(input) {
  const strs = String(input).split(",").map((w) => w.trim()).filter((w) => w.length >= 0);
  const steps = [];
  const groups = {};

  const groupsStr = () => `{${Object.entries(groups).map(([k, v]) => `"${k}":[${v.join(",")}]`).join(", ")}}`;

  function snap(opts) {
    steps.push({
      title: opts.title, arr: [], highlight: [], mark: [], final: opts.final || false,
      codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  snap({
    title: { vi: "groups = {} (hash map)", en: "groups = {} (hash map)" },
    codeLines: [3],
    vars: [{ name: "strs", value: `[${strs.join(", ")}]` }, { name: "groups", value: "{}" }],
    note: {
      vi: "Hai từ là anagram ⟺ khi sắp xếp chữ cái thì giống nhau. Dùng chuỗi đã sắp làm KHÓA gom nhóm.",
      en: "Two words are anagrams ⟺ their sorted letters match. Use the sorted string as the grouping KEY.",
    },
  });

  for (const word of strs) {
    const key = word.split("").sort().join("");
    (groups[key] = groups[key] || []).push(word);
    snap({
      title: { vi: `"${word}" → key="${key}"`, en: `"${word}" → key="${key}"` },
      codeLines: [4, 5, 6],
      vars: [
        { name: "word", value: `"${word}"` },
        { name: "sorted key", value: `"${key}"` },
        { name: "groups", value: groupsStr() },
      ],
      note: { vi: `Sắp chữ cái của "${word}" → "${key}". Thêm "${word}" vào nhóm có khóa "${key}".`, en: `Sort letters of "${word}" → "${key}". Append "${word}" to the group keyed "${key}".` },
    });
  }

  const result = Object.values(groups);
  snap({
    title: { vi: `Kết quả: ${JSON.stringify(result)}`, en: `Result: ${JSON.stringify(result)}` },
    final: true, codeLines: [7],
    vars: [{ name: "answer", value: JSON.stringify(result) }],
    note: { vi: `Các nhóm anagram: ${JSON.stringify(result)}.`, en: `Anagram groups: ${JSON.stringify(result)}.` },
  });

  return { original: strs, answer: result, steps };
}

/**
 * LeetCode 43: Multiply Strings — grade-school multiplication into a digit array.
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def multiply(self, num1, num2):
 *  3          if num1=="0" or num2=="0": return "0"
 *  4          result = [0]*(m+n)
 *  5          for i in range(m-1, -1, -1):
 *  6              for j in range(n-1, -1, -1):
 *  7                  mul = d1*d2
 *  8                  total = mul + result[i+j+1]
 *  9                  result[i+j+1] = total % 10
 * 10                  result[i+j]  += total // 10
 * 11          strip leading zeros; return "".join(result)
 */
function buildSteps43(input, params) {
  const num1 = String(input);
  const num2 = String(params && params.num2 !== undefined ? params.num2 : "456");
  const steps = [];
  const m = num1.length, n = num2.length;

  function snap(opts) {
    steps.push({
      title: opts.title, arr: [], highlight: [], mark: [], final: opts.final || false,
      codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  if (num1 === "0" || num2 === "0") {
    snap({ title: { vi: 'Có thừa số 0 → "0"', en: 'A factor is 0 → "0"' }, final: true, codeLines: [3], vars: [{ name: "answer", value: '"0"' }], note: { vi: "", en: "" } });
    return { original: num1, answer: "0", steps };
  }

  const result = new Array(m + n).fill(0);
  snap({
    title: { vi: `result = [0]*${m + n}`, en: `result = [0]*${m + n}` },
    codeLines: [3, 4],
    vars: [{ name: "num1", value: `"${num1}"` }, { name: "num2", value: `"${num2}"` }, { name: "result", value: `[${result.join(",")}]` }],
    note: {
      vi: `Nhân như tay: tích chữ số num1[i]·num2[j] đặt vào result[i+j+1], nhớ sang result[i+j]. Mảng result có ${m + n} ô.`,
      en: `Grade-school multiply: digit product num1[i]·num2[j] goes to result[i+j+1], carry to result[i+j]. The result array has ${m + n} slots.`,
    },
  });

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const mul = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48);
      const low = i + j + 1, high = i + j;
      const total = mul + result[low];
      result[low] = total % 10;
      result[high] += Math.floor(total / 10);
      snap({
        title: { vi: `${num1[i]}×${num2[j]}=${mul}; result[${low}]=${result[low]}, nhớ ${Math.floor(total / 10)}`, en: `${num1[i]}×${num2[j]}=${mul}; result[${low}]=${result[low]}, carry ${Math.floor(total / 10)}` },
        codeLines: [5, 6, 7, 8, 9, 10],
        vars: [
          { name: "i,j", value: `${i},${j}` },
          { name: "mul", value: mul },
          { name: "total", value: total },
          { name: `result[${low}]`, value: result[low] },
          { name: `result[${high}]`, value: result[high] },
          { name: "result", value: `[${result.join(",")}]` },
        ],
        note: {
          vi: `num1[${i}]='${num1[i]}' × num2[${j}]='${num2[j]}' = ${mul}. total = ${mul} + result[${low}] = ${total}. Ghi ${total % 10} tại ${low}, cộng nhớ ${Math.floor(total / 10)} vào ${high}.`,
          en: `num1[${i}]='${num1[i]}' × num2[${j}]='${num2[j]}' = ${mul}. total = ${mul} + result[${low}] = ${total}. Write ${total % 10} at ${low}, add carry ${Math.floor(total / 10)} to ${high}.`,
        },
      });
    }
  }

  let start = 0;
  while (start < result.length - 1 && result[start] === 0) start++;
  const answer = result.slice(start).join("");
  snap({
    title: { vi: `Kết quả: "${answer}"`, en: `Result: "${answer}"` },
    final: true, codeLines: [11],
    vars: [{ name: "answer", value: `"${answer}"` }],
    note: { vi: `Bỏ số 0 ở đầu → "${answer}" = ${num1} × ${num2}.`, en: `Strip leading zeros → "${answer}" = ${num1} × ${num2}.` },
  });

  return { original: num1, answer, steps };
}

/**
 * LeetCode 65: Valid Number — deterministic finite automaton (DFA).
 * Walk the string one char at a time following the state transition table.
 * Valid iff we end in an accepting state.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def isNumber(self, s):
 *  3          states = [ ... transition table ... ]
 *  4          accepting = {2, 4, 7, 8}
 *  5          state = 0
 *  6          for ch in s:
 *  7              g = group(ch)   # space/sign/digit/dot/e/invalid
 *  8              if g invalid or g not in states[state]: return False
 *  9              state = states[state][g]
 * 10          return state in accepting
 */
function buildSteps65(input) {
  const s = String(input);
  const chars = s.split("");
  const steps = [];

  const states = [
    { space: 0, sign: 1, digit: 2, dot: 3 }, // 0 start
    { digit: 2, dot: 3 },                     // 1 after sign
    { digit: 2, dot: 4, e: 5, space: 8 },     // 2 int digits
    { digit: 4 },                             // 3 dot (no int yet)
    { digit: 4, e: 5, space: 8 },             // 4 digits after dot
    { sign: 6, digit: 7 },                    // 5 after e
    { digit: 7 },                             // 6 sign in exponent
    { digit: 7, space: 8 },                   // 7 exponent digits
    { space: 8 },                             // 8 trailing spaces
  ];
  const accepting = new Set([2, 4, 7, 8]);
  const stateName = [
    "start", "after sign", "int digits", "dot", "frac digits",
    "after e", "exp sign", "exp digits", "trailing space",
  ];
  const group = (ch) => {
    if (ch === " ") return "space";
    if (ch === "+" || ch === "-") return "sign";
    if (ch >= "0" && ch <= "9") return "digit";
    if (ch === ".") return "dot";
    if (ch === "e" || ch === "E") return "e";
    return "invalid";
  };

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: [["", ...chars]],
        text1: "", text2: s,
        colLabels: chars.map((ch, i) => ({ index: `${i}`, char: ch })),
        hlCell: Number.isInteger(opts.focus) ? [0, opts.focus + 1] : null,
        pathCells: opts.done ? opts.done.map((i) => [0, i + 1]) : [],
        largeCells: true,
        caption: opts.caption || "",
      },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snap({
    title: { vi: "state = 0 (start)", en: "state = 0 (start)" },
    codeLines: [34, 35],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "state", value: "0 (start)" },
      { name: "accepting", value: "{2,4,7,8}" },
    ],
    note: {
      vi:
        "Dùng máy trạng thái hữu hạn (DFA). Mỗi ký tự được phân nhóm: space/sign/digit/dot/e.\n" +
        "Trạng thái chấp nhận: 2 (số nguyên), 4 (số thập phân), 7 (số mũ), 8 (khoảng trắng cuối).\n" +
        "Nếu không có chuyển tiếp hợp lệ → số không hợp lệ.",
      en:
        "Use a deterministic finite automaton (DFA). Each char is grouped: space/sign/digit/dot/e.\n" +
        "Accepting states: 2 (integer), 4 (decimal), 7 (exponent), 8 (trailing space).\n" +
        "If no valid transition exists → not a valid number.",
    },
  });

  let state = 0;
  let ok = true;
  const done = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const g = group(ch);
    const canMove = g !== "invalid" && (g in states[state]);
    if (!canMove) {
      snap({
        title: { vi: `'${ch}' (${g}) không hợp lệ ở state ${state} → False`, en: `'${ch}' (${g}) invalid at state ${state} → False` },
        focus: i,
        done: [...done],
        codeLines: [6, 7, 8],
        vars: [
          { name: "i", value: i },
          { name: "char", value: `'${ch}'` },
          { name: "group", value: g },
          { name: "state", value: `${state} (${stateName[state]})` },
          { name: "allowed", value: Object.keys(states[state]).join(", ") || "none" },
        ],
        note: {
          vi: `Ký tự '${ch}' thuộc nhóm '${g}'. Từ state ${state} (${stateName[state]}) không có chuyển tiếp cho '${g}' (chỉ cho phép: ${Object.keys(states[state]).join(", ") || "không có"}) → trả về False.`,
          en: `Char '${ch}' is group '${g}'. From state ${state} (${stateName[state]}) there is no transition for '${g}' (allowed: ${Object.keys(states[state]).join(", ") || "none"}) → return False.`,
        },
      });
      ok = false;
      break;
    }
    const prev = state;
    state = states[state][g];
    done.push(i);
    snap({
      title: { vi: `'${ch}' (${g}): state ${prev} → ${state}`, en: `'${ch}' (${g}): state ${prev} → ${state}` },
      focus: i,
      done: [...done],
      codeLines: [6, 7, 9],
      vars: [
        { name: "i", value: i },
        { name: "char", value: `'${ch}'` },
        { name: "group", value: g },
        { name: "state", value: `${state} (${stateName[state]})` },
      ],
      note: {
        vi: `'${ch}' nhóm '${g}' → chuyển từ state ${prev} (${stateName[prev]}) sang state ${state} (${stateName[state]}).`,
        en: `'${ch}' group '${g}' → move from state ${prev} (${stateName[prev]}) to state ${state} (${stateName[state]}).`,
      },
    });
  }

  const answer = ok && accepting.has(state);
  if (ok) {
    snap({
      title: { vi: `Hết chuỗi ở state ${state} → ${answer}`, en: `End at state ${state} → ${answer}` },
      done: [...done],
      final: true,
      codeLines: [10],
      vars: [
        { name: "final state", value: `${state} (${stateName[state]})` },
        { name: "in accepting?", value: accepting.has(state) },
        { name: "answer", value: answer },
      ],
      note: {
        vi: accepting.has(state)
          ? `Kết thúc ở state ${state} (${stateName[state]}) ∈ {2,4,7,8} → là SỐ HỢP LỆ.`
          : `Kết thúc ở state ${state} (${stateName[state]}) ∉ {2,4,7,8} → KHÔNG hợp lệ.`,
        en: accepting.has(state)
          ? `Ended at state ${state} (${stateName[state]}) ∈ {2,4,7,8} → VALID number.`
          : `Ended at state ${state} (${stateName[state]}) ∉ {2,4,7,8} → NOT valid.`,
      },
    });
  } else {
    // add final answer step
    steps[steps.length - 1].final = true;
  }

  return { original: s, answer, steps };
}

/** LeetCode 14: Longest Common Prefix — shrink the prefix against each word. */
function buildSteps14(input) {
  const strs = String(input).split(",").map((w) => w.trim()).filter((w) => w.length >= 0);
  const steps = [];
  function snap(o) { steps.push({ title: o.title, arr: [], highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  if (!strs.length) { snap({ title: { vi: 'Rỗng → ""', en: 'Empty → ""' }, final: true, codeLines: [3], vars: [{ name: "answer", value: '""' }], note: { vi: "", en: "" } }); return { original: strs, answer: "", steps }; }
  let prefix = strs[0];
  snap({
    title: { vi: `prefix = "${prefix}" (từ đầu tiên)`, en: `prefix = "${prefix}" (first word)` },
    codeLines: [3, 4], vars: [{ name: "strs", value: `[${strs.join(", ")}]` }, { name: "prefix", value: `"${prefix}"` }],
    note: { vi: "Lấy từ đầu làm prefix ban đầu, rồi rút ngắn dần cho khớp mọi từ.", en: "Take the first word as the initial prefix, then shrink it to match every word." },
  });
  for (let w = 1; w < strs.length; w++) {
    const word = strs[w];
    while (!word.startsWith(prefix)) {
      const old = prefix;
      prefix = prefix.slice(0, -1);
      snap({
        title: { vi: `"${word}" không bắt đầu bằng "${old}" → cắt → "${prefix}"`, en: `"${word}" doesn't start with "${old}" → trim → "${prefix}"` },
        codeLines: [5, 6, 7], vars: [{ name: "word", value: `"${word}"` }, { name: "prefix", value: `"${prefix}"` }],
        note: { vi: `Rút ngắn prefix 1 ký tự cho tới khi "${word}" bắt đầu bằng nó.`, en: `Shrink prefix by one char until "${word}" starts with it.` },
      });
      if (!prefix) { snap({ title: { vi: 'prefix rỗng → ""', en: 'prefix empty → ""' }, final: true, codeLines: [7], vars: [{ name: "answer", value: '""' }], note: { vi: "Không có tiền tố chung.", en: "No common prefix." } }); return { original: strs, answer: "", steps }; }
    }
    snap({
      title: { vi: `"${word}" bắt đầu bằng "${prefix}" ✓`, en: `"${word}" starts with "${prefix}" ✓` },
      codeLines: [4, 5], vars: [{ name: "word", value: `"${word}"` }, { name: "prefix", value: `"${prefix}"` }],
      note: { vi: `prefix "${prefix}" khớp "${word}".`, en: `prefix "${prefix}" matches "${word}".` },
    });
  }
  snap({ title: { vi: `Đáp án: "${prefix}"`, en: `Answer: "${prefix}"` }, final: true, codeLines: [8], vars: [{ name: "answer", value: `"${prefix}"` }], note: { vi: `Tiền tố chung dài nhất = "${prefix}".`, en: `Longest common prefix = "${prefix}".` } });
  return { original: strs, answer: prefix, steps };
}

/** LeetCode 28: Find the Index of the First Occurrence. */
function buildSteps28(input, params) {
  const haystack = String(input);
  const needle = String(params && params.needle !== undefined ? params.needle : "sad");
  const chars = haystack.split("");
  const n = haystack.length, m = needle.length;
  const steps = [];
  function snap(o) {
    steps.push({
      title: o.title, arr: [],
      grid: { dp: [["", ...chars]], text1: "", text2: haystack, colLabels: chars.map((ch, i) => ({ index: `${i}`, char: ch })), hlCell: Number.isInteger(o.focus) ? [0, o.focus + 1] : null, pathCells: o.win ? o.win.map((i) => [0, i + 1]) : [], largeCells: true },
      highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note,
    });
  }
  snap({ title: { vi: `Tìm "${needle}" trong "${haystack}"`, en: `Find "${needle}" in "${haystack}"` }, codeLines: [3], vars: [{ name: "haystack", value: `"${haystack}"` }, { name: "needle", value: `"${needle}"` }], note: { vi: `Thử từng vị trí bắt đầu i; so sánh cửa sổ haystack[i:i+${m}] với needle.`, en: `Try each start i; compare window haystack[i:i+${m}] with needle.` } });
  let answer = -1;
  for (let i = 0; i + m <= n; i++) {
    const window = haystack.slice(i, i + m);
    const match = window === needle;
    const win = Array.from({ length: m }, (_, x) => i + x);
    snap({
      title: { vi: `i=${i}: "${window}" ${match ? "==" : "≠"} "${needle}"`, en: `i=${i}: "${window}" ${match ? "==" : "≠"} "${needle}"` },
      focus: i, win, codeLines: match ? [4, 5] : [4], final: match,
      vars: [{ name: "i", value: i }, { name: "window", value: `"${window}"` }, { name: "match?", value: match }],
      note: { vi: match ? `Khớp tại i=${i} → trả về ${i}.` : `Không khớp → thử i tiếp theo.`, en: match ? `Match at i=${i} → return ${i}.` : `No match → try the next i.` },
    });
    if (match) { answer = i; break; }
  }
  if (answer === -1) snap({ title: { vi: "Không tìm thấy → -1", en: "Not found → -1" }, final: true, codeLines: [6], vars: [{ name: "answer", value: -1 }], note: { vi: "Không có vị trí nào khớp.", en: "No position matches." } });
  return { original: haystack, answer, steps };
}

/** LeetCode 58: Length of Last Word — scan from the end. */
function buildSteps58(input) {
  const s = String(input);
  const chars = s.split("");
  const steps = [];
  function snap(o) {
    steps.push({
      title: o.title, arr: [],
      grid: { dp: [["", ...chars.map((c) => c === " " ? "␣" : c)]], text1: "", text2: s, colLabels: chars.map((ch, i) => ({ index: `${i}`, char: ch === " " ? "␣" : ch })), hlCell: Number.isInteger(o.focus) ? [0, o.focus + 1] : null, pathCells: o.mark ? o.mark.map((i) => [0, i + 1]) : [], largeCells: true },
      highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note,
    });
  }
  let i = s.length - 1, length = 0;
  snap({ title: { vi: "Bắt đầu từ cuối chuỗi", en: "Start from the end" }, focus: i, codeLines: [3], vars: [{ name: "s", value: `"${s}"` }, { name: "i", value: i }], note: { vi: "Duyệt từ phải: bỏ khoảng trắng cuối, rồi đếm ký tự của từ cuối.", en: "Scan from the right: skip trailing spaces, then count the last word's chars." } });
  while (i >= 0 && s[i] === " ") {
    snap({ title: { vi: `s[${i}]=' ' → bỏ`, en: `s[${i}]=' ' → skip` }, focus: i, codeLines: [4, 5], vars: [{ name: "i", value: i }], note: { vi: "Khoảng trắng cuối → bỏ qua.", en: "Trailing space → skip." } });
    i--;
  }
  const marks = [];
  while (i >= 0 && s[i] !== " ") {
    length++; marks.push(i);
    snap({ title: { vi: `s[${i}]='${s[i]}' → length=${length}`, en: `s[${i}]='${s[i]}' → length=${length}` }, focus: i, mark: [...marks], codeLines: [6, 7], vars: [{ name: "i", value: i }, { name: "length", value: length }], note: { vi: `Ký tự của từ cuối → length tăng lên ${length}.`, en: `A char of the last word → length becomes ${length}.` } });
    i--;
  }
  snap({ title: { vi: `Đáp án: ${length}`, en: `Answer: ${length}` }, mark: [...marks], final: true, codeLines: [8], vars: [{ name: "answer", value: length }], note: { vi: `Độ dài từ cuối = ${length}.`, en: `Length of the last word = ${length}.` } });
  return { original: s, answer: length, steps };
}

/** LeetCode 8: String to Integer (atoi). */
function buildSteps8(input) {
  const s = String(input);
  const chars = s.split("");
  const steps = [];
  function snap(o) { steps.push({ title: o.title, arr: [], grid: { dp: [["", ...chars.map((c) => c === " " ? "␣" : c)]], text1: "", text2: s, colLabels: chars.map((c, i) => ({ index: `${i}`, char: c === " " ? "␣" : c })), hlCell: Number.isInteger(o.focus) ? [0, o.focus + 1] : null, largeCells: true }, highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  let i = 0, n = s.length;
  snap({ title: { vi: "Bỏ khoảng trắng đầu", en: "Skip leading spaces" }, focus: 0, codeLines: [3, 4], vars: [{ name: "s", value: `"${s}"` }], note: { vi: "1) bỏ khoảng trắng, 2) đọc dấu, 3) đọc chữ số, 4) chặn trong [-2³¹, 2³¹-1].", en: "1) skip spaces, 2) read sign, 3) read digits, 4) clamp to [-2³¹, 2³¹-1]." } });
  while (i < n && s[i] === ' ') i++;
  let sign = 1;
  if (i < n && (s[i] === '+' || s[i] === '-')) { if (s[i] === '-') sign = -1; snap({ title: { vi: `Dấu '${s[i]}' → sign=${sign}`, en: `Sign '${s[i]}' → sign=${sign}` }, focus: i, codeLines: [5, 6, 7], vars: [{ name: "sign", value: sign }, { name: "i", value: i } ], note: { vi: `Đọc dấu.`, en: `Read the sign.` } }); i++; }
  let num = 0;
  while (i < n && s[i] >= '0' && s[i] <= '9') { num = num * 10 + (s.charCodeAt(i) - 48); snap({ title: { vi: `Chữ số '${s[i]}' → num=${num}`, en: `Digit '${s[i]}' → num=${num}` }, focus: i, codeLines: [8, 9], vars: [{ name: "digit", value: s[i] }, { name: "num", value: num }], note: { vi: `num = num*10 + ${s[i]} = ${num}.`, en: `num = num*10 + ${s[i]} = ${num}.` } }); i++; }
  num *= sign;
  const clamped = Math.max(-(2 ** 31), Math.min(2 ** 31 - 1, num));
  snap({ title: { vi: `Chặn phạm vi → ${clamped}`, en: `Clamp to range → ${clamped}` }, final: true, codeLines: [10, 11], vars: [{ name: "num*sign", value: num }, { name: "answer", value: clamped }], note: { vi: `Áp dấu ${sign} và chặn trong [-2³¹, 2³¹-1] → ${clamped}.`, en: `Apply sign ${sign} and clamp to [-2³¹, 2³¹-1] → ${clamped}.` } });
  return { original: s, answer: clamped, steps };
}

/** LeetCode 67: Add Binary. */
function buildSteps67(input, params) {
  const a = String(input);
  const b = String(params && params.b !== undefined ? params.b : "1");
  const steps = [];
  function snap(o) { steps.push({ title: o.title, arr: [], highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: `a="${a}", b="${b}"`, en: `a="${a}", b="${b}"` }, codeLines: [3], vars: [{ name: "a", value: a }, { name: "b", value: b }], note: { vi: "Cộng nhị phân từ phải sang, giữ carry.", en: "Add binary from the right, carrying." } });
  let i = a.length - 1, j = b.length - 1, carry = 0;
  const res = [];
  while (i >= 0 || j >= 0 || carry) {
    let total = carry;
    if (i >= 0) total += a.charCodeAt(i) - 48;
    if (j >= 0) total += b.charCodeAt(j) - 48;
    res.push(total % 2);
    carry = Math.floor(total / 2);
    snap({ title: { vi: `bit: a[${i}]+b[${j}]+carry → ghi ${total % 2}, carry=${carry}`, en: `bit: a[${i}]+b[${j}]+carry → write ${total % 2}, carry=${carry}` }, codeLines: [4, 5, 6, 7, 8], vars: [{ name: "i", value: i }, { name: "j", value: j }, { name: "total", value: total }, { name: "result", value: [...res].reverse().join("") }, { name: "carry", value: carry }], note: { vi: `Tổng ${total} → bit ${total % 2}, nhớ ${carry}.`, en: `Sum ${total} → bit ${total % 2}, carry ${carry}.` } });
    i--; j--;
  }
  const answer = res.reverse().join("");
  snap({ title: { vi: `Kết quả: "${answer}"`, en: `Result: "${answer}"` }, final: true, codeLines: [9], vars: [{ name: "answer", value: `"${answer}"` }], note: { vi: `Tổng nhị phân = ${answer}.`, en: `Binary sum = ${answer}.` } });
  return { original: a, answer, steps };
}

/** LeetCode 224: Basic Calculator — stack for parentheses. */
function buildSteps224(input) {
  const s = String(input);
  const steps = [];
  function snap(o) { steps.push({ title: o.title, arr: [], highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: "Khởi tạo result=0, sign=+1, stack=[]", en: "Init result=0, sign=+1, stack=[]" }, codeLines: [3], vars: [{ name: "s", value: `"${s}"` }], note: { vi: "Duyệt ký tự: gộp số; +/- cập nhật result; '(' đẩy ngữ cảnh; ')' gộp lại.", en: "Scan chars: build numbers; +/- update result; '(' pushes context; ')' merges back." } });
  let result = 0, sign = 1, num = 0;
  const stack = [];
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') { num = num * 10 + (ch.charCodeAt(0) - 48); }
    else if (ch === '+' || ch === '-') { result += sign * num; num = 0; sign = ch === '+' ? 1 : -1; snap({ title: { vi: `'${ch}' → result=${result}, sign=${sign}`, en: `'${ch}' → result=${result}, sign=${sign}` }, codeLines: [4, 5, 6], vars: [{ name: "result", value: result }, { name: "sign", value: sign }], note: { vi: `Cộng số trước vào result, đặt dấu mới.`, en: `Add the previous number to result, set the new sign.` } }); }
    else if (ch === '(') { stack.push(result); stack.push(sign); result = 0; sign = 1; snap({ title: { vi: `'(' → đẩy (result, sign) vào stack`, en: `'(' → push (result, sign) onto stack` }, codeLines: [7, 8, 9], vars: [{ name: "stack", value: `[${stack.join(",")}]` }], note: { vi: `Lưu ngữ cảnh, bắt đầu tính trong ngoặc.`, en: `Save context, start evaluating inside the parentheses.` } }); }
    else if (ch === ')') { result += sign * num; num = 0; result *= stack.pop(); result += stack.pop(); snap({ title: { vi: `')' → gộp: result=${result}`, en: `')' → merge: result=${result}` }, codeLines: [10, 11, 12], vars: [{ name: "result", value: result }, { name: "stack", value: `[${stack.join(",")}]` }], note: { vi: `Kết thúc ngoặc: nhân dấu trước '(' rồi cộng result trước '('.`, en: `Close the group: multiply by the sign before '(' then add the result before '('.` } }); }
  }
  const answer = result + sign * num;
  snap({ title: { vi: `Đáp án: ${answer}`, en: `Answer: ${answer}` }, final: true, codeLines: [13], vars: [{ name: "answer", value: answer }], note: { vi: `Cộng nốt số cuối → ${answer}.`, en: `Add the final number → ${answer}.` } });
  return { original: s, answer, steps };
}

/** LeetCode 3829: Design Ride Sharing System — two FIFO queues + lazy rider cancellation. */
function buildSteps3829(input) {
  const parsed = parseDequeOps641(input);
  const allowed = new Set(["addRider", "addDriver", "matchDriverWithRider", "cancelRider"]);
  const calls = parsed
    .filter((operation) => operation.name !== "RideSharingSystem")
    .filter((operation) => allowed.has(operation.name))
    .filter((operation) => {
      if (operation.name === "matchDriverWithRider") return operation.args.length === 0;
      return operation.args.length === 1 && Number.isInteger(operation.args[0]);
    });
  const operations = [
    { name: "RideSharingSystem", args: [], label: "RideSharingSystem()" },
    ...calls.map((operation) => ({
      ...operation,
      label: `${operation.name}(${operation.args.join(", ")})`,
    })),
  ];
  const riders = [];
  const drivers = [];
  const activeRiders = new Set();
  const results = Array(operations.length).fill(null);
  const matches = [];
  const steps = [];
  const initialized = { riders: false, drivers: false, activeRiders: false };
  let completedOps = 0;
  let lastReturnLine = 7;

  const riderQueueLabel = () => `[${riders.map((rider) => activeRiders.has(rider) ? rider : `${rider} (cancelled)`).join(", ")}]`;
  const resultLabel = (result) => Array.isArray(result) ? `[${result.join(", ")}]` : "None";

  function snapshot(options) {
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLine ? [options.codeLine] : [],
      vars: [
        { name: "riders", value: initialized.riders ? riderQueueLabel() : "not initialized" },
        { name: "drivers", value: initialized.drivers ? `[${drivers.join(", ")}]` : "not initialized" },
        { name: "active_riders", value: initialized.activeRiders ? `{${[...activeRiders].join(", ")}}` : "not initialized" },
        { name: "outputs", value: `[${results.slice(0, completedOps).map(resultLabel).join(", ")}]` },
        ...(options.vars || []),
      ],
      note: options.note,
      rideSharingView: {
        phase: options.phase || "idle",
        operations: operations.map((operation) => ({ ...operation, args: [...operation.args] })),
        results: results.map((result) => Array.isArray(result) ? [...result] : result),
        completedOps,
        activeOpIndex: options.opIndex ?? null,
        riders: [...riders],
        drivers: [...drivers],
        activeRiders: [...activeRiders],
        initialized: { ...initialized },
        activeRider: options.activeRider ?? null,
        activeDriver: options.activeDriver ?? null,
        removedRider: options.removedRider ?? null,
        cancelledRider: options.cancelledRider ?? null,
        cancelHadEffect: options.cancelHadEffect ?? null,
        pair: options.pair ? [...options.pair] : null,
        condition: options.condition ?? null,
        matches: matches.map((pair) => [...pair]),
        returnValue: options.returnValue === undefined
          ? null
          : Array.isArray(options.returnValue) ? [...options.returnValue] : options.returnValue,
      },
    });
  }

  snapshot({
    title: { vi: "Khởi tạo RideSharingSystem", en: "Initialize RideSharingSystem" },
    codeLine: 4,
    opIndex: 0,
    phase: "initialize",
    note: { vi: "Hệ thống cần hai queue FIFO và một set lưu các rider vẫn còn hiệu lực.", en: "The system needs two FIFO queues and a set containing riders whose requests are still active." },
  });
  initialized.riders = true;
  snapshot({
    title: { vi: "riders = deque()", en: "riders = deque()" },
    codeLine: 5,
    opIndex: 0,
    phase: "initialize",
    note: { vi: "FRONT của riders luôn là yêu cầu đến sớm nhất chưa được lazy-cleanup.", en: "The riders FRONT is always the earliest request not yet lazily cleaned up." },
  });
  initialized.drivers = true;
  snapshot({
    title: { vi: "drivers = deque()", en: "drivers = deque()" },
    codeLine: 6,
    opIndex: 0,
    phase: "initialize",
    note: { vi: "FRONT của drivers là tài xế trở nên sẵn sàng sớm nhất.", en: "The drivers FRONT is the driver who became available earliest." },
  });
  initialized.activeRiders = true;
  completedOps = 1;
  snapshot({
    title: { vi: "active_riders = set()", en: "active_riders = set()" },
    codeLine: 7,
    opIndex: 0,
    phase: "initialize-done",
    note: { vi: "Set cho phép cancel O(1). Rider bị hủy có thể còn trong queue nhưng không còn trong active_riders.", en: "The set makes cancellation O(1). A cancelled rider may remain in the queue but is absent from active_riders." },
  });

  for (let opIndex = 1; opIndex < operations.length; opIndex++) {
    const operation = operations[opIndex];
    const id = operation.args[0];

    if (operation.name === "addRider") {
      snapshot({
        title: { vi: `Gọi addRider(${id})`, en: `Call addRider(${id})` },
        codeLine: 9,
        opIndex,
        phase: "rider-call",
        activeRider: id,
        vars: [{ name: "riderId", value: id }],
        note: { vi: `Rider ${id} đến sau mọi rider hiện có nên sẽ vào REAR.`, en: `Rider ${id} arrives after every current rider, so it will enter at REAR.` },
      });
      riders.push(id);
      snapshot({
        title: { vi: `Đưa rider ${id} vào REAR`, en: `Append rider ${id} at REAR` },
        codeLine: 10,
        opIndex,
        phase: "rider-queued",
        activeRider: id,
        vars: [{ name: "action", value: `riders.append(${id})` }],
        note: { vi: `Queue đã có rider ${id}, nhưng dòng tiếp theo mới đánh dấu request này là active.`, en: `The queue now contains rider ${id}, but the next line marks the request active.` },
      });
      activeRiders.add(id);
      results[opIndex] = null;
      completedOps = opIndex + 1;
      snapshot({
        title: { vi: `Kích hoạt rider ${id}`, en: `Activate rider ${id}` },
        codeLine: 11,
        opIndex,
        phase: "rider-active",
        activeRider: id,
        vars: [{ name: "action", value: `active_riders.add(${id})` }],
        note: { vi: `Rider ${id} vừa ở trong queue vừa ở trong active_riders nên đủ điều kiện được ghép.`, en: `Rider ${id} is now both queued and active, so the rider is eligible for matching.` },
      });
      lastReturnLine = 11;
      continue;
    }

    if (operation.name === "addDriver") {
      snapshot({
        title: { vi: `Gọi addDriver(${id})`, en: `Call addDriver(${id})` },
        codeLine: 13,
        opIndex,
        phase: "driver-call",
        activeDriver: id,
        vars: [{ name: "driverId", value: id }],
        note: { vi: `Driver ${id} vừa sẵn sàng và sẽ đứng ở REAR.`, en: `Driver ${id} just became available and will enter at REAR.` },
      });
      drivers.push(id);
      results[opIndex] = null;
      completedOps = opIndex + 1;
      snapshot({
        title: { vi: `Đưa driver ${id} vào REAR`, en: `Append driver ${id} at REAR` },
        codeLine: 14,
        opIndex,
        phase: "driver-queued",
        activeDriver: id,
        vars: [{ name: "action", value: `drivers.append(${id})` }],
        note: { vi: `Driver ${id} đứng sau các driver đã đến trước; thứ tự FIFO được giữ nguyên.`, en: `Driver ${id} follows drivers who arrived earlier; FIFO order is preserved.` },
      });
      lastReturnLine = 14;
      continue;
    }

    if (operation.name === "cancelRider") {
      const hadEffect = activeRiders.has(id);
      snapshot({
        title: { vi: `Gọi cancelRider(${id})`, en: `Call cancelRider(${id})` },
        codeLine: 26,
        opIndex,
        phase: "cancel-call",
        activeRider: id,
        cancelledRider: id,
        cancelHadEffect: hadEffect,
        vars: [{ name: "riderId", value: id }, { name: "riderId in active_riders", value: hadEffect }],
        note: hadEffect
          ? { vi: `Rider ${id} đang chờ nên request sẽ bị vô hiệu hóa.`, en: `Rider ${id} is waiting, so the request will be invalidated.` }
          : { vi: `Rider ${id} không còn active (đã ghép, đã hủy hoặc không tồn tại), nên lời gọi không có tác dụng.`, en: `Rider ${id} is no longer active (matched, cancelled, or absent), so the call has no effect.` },
      });
      activeRiders.delete(id);
      results[opIndex] = null;
      completedOps = opIndex + 1;
      snapshot({
        title: hadEffect
          ? { vi: `Hủy rider ${id}`, en: `Cancel rider ${id}` }
          : { vi: `discard(${id}) không thay đổi set`, en: `discard(${id}) leaves the set unchanged` },
        codeLine: 27,
        opIndex,
        phase: hadEffect ? "cancel-done" : "cancel-noop",
        activeRider: id,
        cancelledRider: id,
        cancelHadEffect: hadEffect,
        vars: [{ name: "action", value: `active_riders.discard(${id})` }],
        note: hadEffect
          ? { vi: `Rider ${id} được gạch mờ trong queue. Không xóa giữa deque; match() sẽ lazy-remove khi rider này tới FRONT.`, en: `Rider ${id} is dimmed in the queue. We avoid deleting from the middle; match() lazily removes the rider upon reaching FRONT.` }
          : { vi: "set.discard không báo lỗi khi phần tử không tồn tại.", en: "set.discard does not raise when the element is absent." },
      });
      lastReturnLine = 27;
      continue;
    }

    snapshot({
      title: { vi: "Gọi matchDriverWithRider()", en: "Call matchDriverWithRider()" },
      codeLine: 16,
      opIndex,
      phase: "match-call",
      note: { vi: "Trước tiên phải dọn các rider đã hủy đang chắn ở FRONT; sau đó mới xét đủ hai phía để ghép.", en: "First clean cancelled riders blocking the FRONT; then verify both sides before matching." },
    });

    while (riders.length > 0 && !activeRiders.has(riders[0])) {
      const staleRider = riders[0];
      snapshot({
        title: { vi: `FRONT rider ${staleRider} đã bị hủy`, en: `FRONT rider ${staleRider} is cancelled` },
        codeLine: 17,
        opIndex,
        phase: "cleanup-check",
        activeRider: staleRider,
        cancelledRider: staleRider,
        condition: true,
        vars: [{ name: "while condition", value: true }, { name: "riders[0]", value: staleRider }],
        note: { vi: `${staleRider} còn nằm vật lý ở FRONT nhưng không còn trong active_riders, nên không thể ghép.`, en: `${staleRider} is physically at FRONT but absent from active_riders, so this rider cannot be matched.` },
      });
      riders.shift();
      snapshot({
        title: { vi: `Lazy-remove rider ${staleRider}`, en: `Lazy-remove rider ${staleRider}` },
        codeLine: 18,
        opIndex,
        phase: "cleanup-pop",
        removedRider: staleRider,
        cancelledRider: staleRider,
        vars: [{ name: "popleft", value: staleRider }],
        note: { vi: `Loại rider ${staleRider} khỏi FRONT trong O(1); rider kế tiếp trở thành người đến sớm nhất.`, en: `Remove rider ${staleRider} from FRONT in O(1); the next rider becomes the earliest arrival.` },
      });
    }

    const cleanFront = riders.length > 0 ? riders[0] : null;
    snapshot({
      title: cleanFront === null
        ? { vi: "Queue rider rỗng: dừng cleanup", en: "Rider queue empty: stop cleanup" }
        : { vi: `FRONT rider ${cleanFront} vẫn active`, en: `FRONT rider ${cleanFront} is active` },
      codeLine: 17,
      opIndex,
      phase: "cleanup-done",
      activeRider: cleanFront,
      condition: false,
      vars: [{ name: "while condition", value: false }],
      note: cleanFront === null
        ? { vi: "Không còn rider nào để dọn hoặc ghép.", en: "No riders remain to clean or match." }
        : { vi: `Rider ${cleanFront} có trong active_riders, nên giữ lại ở FRONT để ghép.`, en: `Rider ${cleanFront} is in active_riders, so keep this rider at FRONT for matching.` },
    });

    const noMatch = riders.length === 0 || drivers.length === 0;
    snapshot({
      title: noMatch
        ? { vi: "Thiếu rider hoặc driver", en: "A rider or driver is missing" }
        : { vi: "Cả hai queue đều sẵn sàng", en: "Both queues are ready" },
      codeLine: 19,
      opIndex,
      phase: "availability-check",
      activeRider: riders[0] ?? null,
      activeDriver: drivers[0] ?? null,
      condition: noMatch,
      vars: [
        { name: "not riders", value: riders.length === 0 },
        { name: "not drivers", value: drivers.length === 0 },
        { name: "condition", value: noMatch },
      ],
      note: noMatch
        ? { vi: "Không được pop phía còn lại; giữ nguyên queue và trả [-1, -1].", en: "Do not pop the remaining side; preserve its queue and return [-1, -1]." }
        : { vi: "FRONT của mỗi queue là người đến sớm nhất, nên hai phần tử này tạo cặp tiếp theo.", en: "Each FRONT is the earliest arrival, so these two entries form the next pair." },
    });

    if (noMatch) {
      const result = [-1, -1];
      results[opIndex] = result;
      completedOps = opIndex + 1;
      snapshot({
        title: { vi: "Trả về [-1, -1]", en: "Return [-1, -1]" },
        codeLine: 20,
        opIndex,
        phase: "no-match",
        pair: result,
        returnValue: result,
        vars: [{ name: "return", value: "[-1, -1]" }],
        note: { vi: "Chưa thể tạo chuyến đi; driver hoặc rider còn lại tiếp tục chờ cho lời gọi sau.", en: "No ride can be created yet; any remaining driver or rider continues waiting for a later call." },
      });
      lastReturnLine = 20;
      continue;
    }

    const driver = drivers.shift();
    snapshot({
      title: { vi: `Lấy FRONT driver ${driver}`, en: `Take FRONT driver ${driver}` },
      codeLine: 21,
      opIndex,
      phase: "take-driver",
      activeDriver: driver,
      activeRider: riders[0],
      vars: [{ name: "driver", value: driver }, { name: "action", value: "drivers.popleft()" }],
      note: { vi: `Driver ${driver} đến sớm nhất nên rời FRONT trước. Rider vẫn chưa bị pop ở dòng này.`, en: `Driver ${driver} arrived earliest, so this driver leaves FRONT first. The rider has not been popped on this line.` },
    });
    const rider = riders.shift();
    snapshot({
      title: { vi: `Lấy FRONT rider ${rider}`, en: `Take FRONT rider ${rider}` },
      codeLine: 22,
      opIndex,
      phase: "take-rider",
      activeDriver: driver,
      activeRider: rider,
      vars: [{ name: "rider", value: rider }, { name: "action", value: "riders.popleft()" }],
      note: { vi: `Rider ${rider} là request active đến sớm nhất nên được ghép với driver ${driver}.`, en: `Rider ${rider} is the earliest active request, so this rider matches driver ${driver}.` },
    });
    activeRiders.delete(rider);
    snapshot({
      title: { vi: `Xóa rider ${rider} khỏi active_riders`, en: `Remove rider ${rider} from active_riders` },
      codeLine: 23,
      opIndex,
      phase: "deactivate-match",
      activeDriver: driver,
      activeRider: rider,
      vars: [{ name: "action", value: `active_riders.remove(${rider})` }],
      note: { vi: `Request của rider ${rider} đã được dùng; cancelRider(${rider}) về sau sẽ không có tác dụng.`, en: `Rider ${rider}'s request has been consumed; a later cancelRider(${rider}) has no effect.` },
    });
    const pair = [driver, rider];
    matches.push(pair);
    results[opIndex] = pair;
    completedOps = opIndex + 1;
    snapshot({
      title: { vi: `Ghép [driver ${driver}, rider ${rider}]`, en: `Match [driver ${driver}, rider ${rider}]` },
      codeLine: 24,
      opIndex,
      phase: "matched",
      activeDriver: driver,
      activeRider: rider,
      pair,
      returnValue: pair,
      vars: [{ name: "return", value: `[${driver}, ${rider}]` }],
      note: { vi: `Thứ tự kết quả luôn là [driverId, riderId] = [${driver}, ${rider}].`, en: `The result order is always [driverId, riderId] = [${driver}, ${rider}].` },
    });
    lastReturnLine = 24;
  }

  snapshot({
    title: { vi: "Hoàn tất mọi operation", en: "All operations complete" },
    codeLine: lastReturnLine,
    phase: "done",
    final: true,
    vars: [{ name: "matches", value: `[${matches.map((pair) => `[${pair.join(", ")}]`).join(", ")}]` }],
    note: { vi: "Mỗi rider/driver chỉ vào và rời queue tối đa một lần; lazy-cleanup giúp chi phí trung bình mỗi operation là O(1).", en: "Each rider and driver enters and leaves a queue at most once; lazy cleanup gives O(1) amortized cost per operation." },
  });

  return { original: input, operations, outputs: results, matches, answer: results, steps };
}

/**
 * LeetCode 3302: Find the Lexicographically Smallest Valid Sequence.
 * Build rightmost suffix-match positions, then greedily take the earliest
 * feasible index while spending at most one mismatch.
 */
function buildSteps3302(input, params) {
  const word1 = typeof input === "string" ? input : String(input ?? "");
  const word2 = typeof (params && params.word2) === "string" ? params.word2 : "";
  if (!word1.length || !word2.length || word2.length >= word1.length) {
    throw new Error("word1 and word2 must be non-empty and word2 must be shorter than word1");
  }

  const n = word1.length;
  const m = word2.length;
  const steps = [];
  const suffix = new Array(m).fill(-1);
  const suffixStatus = new Array(m).fill("pending");
  const selections = [];
  const answer = [];
  let phase = "setup";
  let event = "enter";
  let backI = null;
  let backJ = null;
  let forwardI = null;
  let targetJ = null;
  let mismatchUsed = false;
  let decision = null;

  const makeView = (overrides = {}) => ({
    phase,
    event,
    word1,
    word2,
    suffix: [...suffix],
    suffixStatus: [...suffixStatus],
    backI,
    backJ,
    forwardI,
    targetJ,
    mismatchUsed,
    decision: decision ? { ...decision } : null,
    answer: [...answer],
    selections: selections.map((selection) => ({ ...selection })),
    ...overrides,
  });
  const suffixText = () => `[${suffix.map((value, index) => (
    suffixStatus[index] === "pending" ? "_" : value
  )).join(", ")}]`;
  const variables = (extra = []) => {
    const values = [
      { name: "suffix", value: suffixText() },
      { name: "answer", value: `[${answer.join(", ")}]` },
      { name: "changed", value: mismatchUsed },
    ];
    return [...values, ...extra];
  };
  const push = ({ title, line, note, vars = variables(), final = false, view = {} }) => {
    steps.push({
      title,
      arr: word1.split(""),
      sub: word1.split("").map((char, index) => `${index}:${char}`),
      highlight: Number.isInteger(forwardI) ? [forwardI] : Number.isInteger(backI) && backI >= 0 ? [backI] : [],
      mark: [...answer],
      validSequenceView: makeView(view),
      codeLines: [line],
      vars,
      note,
      final,
    });
  };

  push({
    title: { vi: "Bắt đầu validSequence", en: "Enter validSequence" },
    line: 2,
    vars: [
      { name: "word1", value: JSON.stringify(word1) },
      { name: "word2", value: JSON.stringify(word2) },
    ],
    note: {
      vi: "Ta cần chọn m chỉ số tăng dần; chuỗi tạo ra được phép sai word2 nhiều nhất một ký tự.",
      en: "Choose m increasing indices; the resulting string may differ from word2 at at most one character.",
    },
  });

  event = "read-lengths";
  push({
    title: { vi: `n = ${n}, m = ${m}`, en: `n = ${n}, m = ${m}` },
    line: 3,
    vars: [{ name: "n", value: n }, { name: "m", value: m }],
    note: {
      vi: `Kết quả phải có đúng ${m} chỉ số lấy từ word1 dài ${n}.`,
      en: `The result must contain exactly ${m} indices selected from word1 of length ${n}.`,
    },
  });

  event = "init-suffix";
  push({
    title: { vi: "Tạo bảng suffix", en: "Create the suffix table" },
    line: 4,
    note: {
      vi: "suffix[j] sẽ là vị trí xa nhất bên phải có thể bắt đầu khớp chính xác word2[j:].",
      en: "suffix[j] will be the rightmost position that can begin an exact match of word2[j:].",
    },
  });

  phase = "suffix";
  backI = n - 1;
  event = "init-back-pointer";
  push({
    title: { vi: `i = ${backI}`, en: `i = ${backI}` },
    line: 5,
    vars: variables([{ name: "i", value: backI }]),
    note: {
      vi: "Dựng bảng từ phải sang trái để dành nhiều chỗ nhất cho lựa chọn greedy phía trước.",
      en: "Build from right to left so the forward greedy pass keeps as much room as possible.",
    },
  });

  for (let j = m - 1; j >= 0; j--) {
    backJ = j;
    event = "suffix-target";
    decision = null;
    push({
      title: { vi: `Tìm word2[${j}] = '${word2[j]}'`, en: `Find word2[${j}] = '${word2[j]}'` },
      line: 6,
      vars: variables([
        { name: "i", value: backI },
        { name: "j", value: j },
        { name: "target", value: JSON.stringify(word2[j]) },
      ]),
      note: {
        vi: `Tìm lần xuất hiện ngoài cùng bên phải của '${word2[j]}' trước mốc hiện tại.`,
        en: `Find the rightmost '${word2[j]}' before the current boundary.`,
      },
    });

    while (backI >= 0 && word1[backI] !== word2[j]) {
      event = "suffix-scan";
      decision = {
        type: "suffix-skip",
        word1Index: backI,
        word2Index: j,
        canTake: false,
      };
      push({
        title: { vi: `'${word1[backI]}' ≠ '${word2[j]}': bỏ i=${backI}`, en: `'${word1[backI]}' ≠ '${word2[j]}': skip i=${backI}` },
        line: 7,
        vars: variables([
          { name: "i", value: backI },
          { name: "j", value: j },
          { name: "word1[i] == word2[j]", value: false },
        ]),
        note: {
          vi: `word1[${backI}] không thể khớp word2[${j}], tiếp tục đi sang trái.`,
          en: `word1[${backI}] cannot match word2[${j}], so continue leftward.`,
        },
      });
      backI -= 1;
      event = "suffix-move";
      push({
        title: { vi: `i giảm còn ${backI}`, en: `Decrement i to ${backI}` },
        line: 8,
        vars: variables([{ name: "i", value: backI }, { name: "j", value: j }]),
        note: {
          vi: "Con trỏ i chỉ đi sang trái, nên toàn bộ lượt dựng suffix là O(n + m).",
          en: "Pointer i only moves left, so the complete suffix build is O(n + m).",
        },
      });
    }

    event = "suffix-exhausted-check";
    decision = {
      type: "suffix-check",
      word1Index: backI,
      word2Index: j,
      canTake: backI >= 0,
    };
    push({
      title: backI < 0
        ? { vi: "i < 0: hậu tố này không thể khớp", en: "i < 0: this suffix cannot match" }
        : { vi: `Tìm thấy '${word2[j]}' tại i=${backI}`, en: `Found '${word2[j]}' at i=${backI}` },
      line: 9,
      vars: variables([{ name: "i < 0", value: backI < 0 }, { name: "j", value: j }]),
      note: backI < 0
        ? { vi: `Không thể khớp chính xác word2[${j}:]; các mốc bên trái cũng không thể.`, en: `word2[${j}:] cannot match exactly; earlier suffix starts cannot match either.` }
        : { vi: `Có thể lưu vị trí ${backI} cho suffix[${j}].`, en: `Position ${backI} can be stored in suffix[${j}].` },
    });

    if (backI < 0) {
      for (let index = 0; index <= j; index++) suffixStatus[index] = "impossible";
      event = "suffix-break";
      push({
        title: { vi: "Dừng vòng dựng suffix", en: "Stop building suffix" },
        line: 10,
        note: {
          vi: "Các hậu tố đã lưu bên phải vẫn hữu ích để kiểm tra vị trí dùng một lần mismatch.",
          en: "The suffix positions already stored on the right are still useful for validating the one mismatch.",
        },
      });
      break;
    }

    suffix[j] = backI;
    suffixStatus[j] = "matched";
    event = "suffix-save";
    decision = { type: "suffix-save", word1Index: backI, word2Index: j, canTake: true };
    push({
      title: { vi: `suffix[${j}] = ${backI}`, en: `suffix[${j}] = ${backI}` },
      line: 11,
      vars: variables([{ name: `suffix[${j}]`, value: backI }]),
      note: {
        vi: `word2[${j}:] có thể khớp chính xác bắt đầu từ word1[${backI}].`,
        en: `word2[${j}:] can match exactly starting at word1[${backI}].`,
      },
    });
    backI -= 1;
    event = "suffix-reserve-left";
    push({
      title: { vi: `i = ${backI} cho ký tự trước`, en: `Set i = ${backI} for the previous character` },
      line: 12,
      vars: variables([{ name: "i", value: backI }]),
      note: {
        vi: "Giảm i để các chỉ số suffix luôn tăng dần khi đọc word2 từ trái sang phải.",
        en: "Decrement i so suffix indices remain increasing when word2 is read left to right.",
      },
    });
  }

  phase = "greedy";
  backI = null;
  backJ = null;
  decision = null;
  event = "init-answer";
  push({
    title: { vi: "answer = []", en: "answer = []" },
    line: 14,
    note: {
      vi: "Bây giờ duyệt word1 từ trái sang phải và chọn chỉ số khả thi đầu tiên.",
      en: "Now scan word1 left to right and take the first feasible index.",
    },
  });

  targetJ = 0;
  event = "init-target";
  push({
    title: { vi: "j = 0", en: "j = 0" },
    line: 15,
    vars: variables([{ name: "j", value: targetJ }]),
    note: {
      vi: "j chỉ ký tự tiếp theo trong word2 cần tạo.",
      en: "j points to the next character of word2 that must be produced.",
    },
  });

  event = "init-coupon";
  push({
    title: { vi: "changed = False", en: "changed = False" },
    line: 16,
    note: {
      vi: "Phiếu mismatch vẫn còn: ta có thể chọn đúng một ký tự không khớp khi việc đó vẫn khả thi.",
      en: "The mismatch coupon is available: one nonmatching character may be selected when the suffix remains feasible.",
    },
  });

  for (let i = 0; i < n; i++) {
    forwardI = i;
    event = "greedy-loop";
    decision = null;
    push({
      title: { vi: `Xét i=${i}, '${word1[i]}'`, en: `Consider i=${i}, '${word1[i]}'` },
      line: 17,
      vars: variables([{ name: "i", value: i }, { name: "j", value: targetJ }]),
      note: {
        vi: `Vì duyệt i tăng dần, chỉ số khả thi đầu tiên sẽ cho mảng answer nhỏ nhất theo thứ tự từ điển.`,
        en: `Because i increases, the first feasible index gives the lexicographically smallest answer array.`,
      },
    });

    event = "complete-check";
    decision = { type: "complete-check", canTake: targetJ === m };
    push({
      title: targetJ === m
        ? { vi: "j == m: đã đủ chỉ số", en: "j == m: enough indices selected" }
        : { vi: `j=${targetJ} < m=${m}: tiếp tục`, en: `j=${targetJ} < m=${m}: continue` },
      line: 18,
      vars: variables([{ name: "j == m", value: targetJ === m }]),
      note: targetJ === m
        ? { vi: "Đã tạo đủ word2, không cần xét chỉ số lớn hơn.", en: "word2 is complete, so larger indices are unnecessary." }
        : { vi: `Vẫn cần tạo word2[${targetJ}:].`, en: `word2[${targetJ}:] still needs to be produced.` },
    });
    if (targetJ === m) {
      event = "greedy-break";
      push({
        title: { vi: "Dừng vòng greedy", en: "Stop the greedy loop" },
        line: 19,
        note: { vi: "answer đã hoàn chỉnh.", en: "answer is complete." },
      });
      break;
    }

    const matches = word1[i] === word2[targetJ];
    event = "match-check";
    decision = {
      type: "match",
      word1Index: i,
      word2Index: targetJ,
      canTake: matches,
    };
    push({
      title: matches
        ? { vi: `'${word1[i]}' == '${word2[targetJ]}'`, en: `'${word1[i]}' == '${word2[targetJ]}'` }
        : { vi: `'${word1[i]}' ≠ '${word2[targetJ]}'`, en: `'${word1[i]}' ≠ '${word2[targetJ]}'` },
      line: 20,
      vars: variables([{ name: "word1[i] == word2[j]", value: matches }]),
      note: matches
        ? { vi: "Khớp chính xác luôn an toàn và không dùng phiếu mismatch.", en: "An exact match is always safe and does not spend the mismatch coupon." }
        : { vi: "Không khớp; cần kiểm tra xem có thể dùng mismatch tại chỉ số này hay không.", en: "The characters differ; check whether the mismatch can be spent at this index." },
    });

    if (matches) {
      const matchedTarget = targetJ;
      answer.push(i);
      selections.push({ word1Index: i, word2Index: matchedTarget, mismatch: false });
      event = "append-match";
      decision = { type: "selected-match", word1Index: i, word2Index: matchedTarget, canTake: true };
      push({
        title: { vi: `answer.append(${i})`, en: `answer.append(${i})` },
        line: 21,
        note: {
          vi: `Chọn chỉ số ${i}: word1[${i}] = word2[${matchedTarget}] = '${word1[i]}'.`,
          en: `Select index ${i}: word1[${i}] = word2[${matchedTarget}] = '${word1[i]}'.`,
        },
      });
      targetJ += 1;
      event = "advance-target-match";
      push({
        title: { vi: `j tăng thành ${targetJ}`, en: `Increment j to ${targetJ}` },
        line: 22,
        vars: variables([{ name: "j", value: targetJ }]),
        note: { vi: "Chuyển sang ký tự mục tiêu tiếp theo.", en: "Move to the next target character." },
      });
      continue;
    }

    const futureBound = targetJ === m - 1 ? null : suffix[targetJ + 1];
    const futureExists = targetJ === m - 1 || futureBound >= 0;
    const leavesRoom = targetJ === m - 1 || i < futureBound;
    const canMismatch = !mismatchUsed && futureExists && leavesRoom;
    event = "mismatch-check";
    decision = {
      type: "mismatch",
      word1Index: i,
      word2Index: targetJ,
      canTake: canMismatch,
      futureBound,
      futureExists,
      leavesRoom,
      mismatchUsed,
    };
    push({
      title: canMismatch
        ? { vi: `Có thể dùng mismatch tại i=${i}`, en: `Mismatch is feasible at i=${i}` }
        : { vi: `Không thể chọn i=${i}`, en: `Cannot select i=${i}` },
      line: 23,
      vars: variables([
        { name: "not changed", value: !mismatchUsed },
        { name: "future bound", value: targetJ === m - 1 ? "last target" : futureBound },
        { name: "i < suffix[j + 1]", value: targetJ === m - 1 ? true : leavesRoom },
      ]),
      note: canMismatch
        ? { vi: targetJ === m - 1 ? "Đây là ký tự mục tiêu cuối nên không cần chừa hậu tố." : `${i} < suffix[${targetJ + 1}] = ${futureBound}, nên phần còn lại vẫn khớp được chính xác.`, en: targetJ === m - 1 ? "This is the final target, so no suffix space is needed." : `${i} < suffix[${targetJ + 1}] = ${futureBound}, so the remainder can still match exactly.` }
        : { vi: mismatchUsed ? "Phiếu mismatch đã dùng; phải bỏ chỉ số này." : !futureExists ? "Hậu tố còn lại không thể khớp chính xác." : `${i} không nhỏ hơn suffix[${targetJ + 1}] = ${futureBound}; chọn i sẽ chặn hậu tố.`, en: mismatchUsed ? "The mismatch coupon is already spent, so skip this index." : !futureExists ? "The remaining suffix cannot match exactly." : `${i} is not smaller than suffix[${targetJ + 1}] = ${futureBound}; selecting i would block the suffix.` },
    });

    if (!canMismatch) continue;

    const mismatchTarget = targetJ;
    answer.push(i);
    selections.push({ word1Index: i, word2Index: mismatchTarget, mismatch: true });
    event = "append-mismatch";
    decision = { type: "selected-mismatch", word1Index: i, word2Index: mismatchTarget, canTake: true, futureBound };
    push({
      title: { vi: `answer.append(${i}) bằng mismatch`, en: `answer.append(${i}) using the mismatch` },
      line: 24,
      note: {
        vi: `Chọn chỉ số nhỏ nhất ${i}; '${word1[i]}' sẽ được xem như '${word2[mismatchTarget]}'.`,
        en: `Select the smallest index ${i}; '${word1[i]}' will be treated as '${word2[mismatchTarget]}'.`,
      },
    });
    targetJ += 1;
    event = "advance-target-mismatch";
    push({
      title: { vi: `j tăng thành ${targetJ}`, en: `Increment j to ${targetJ}` },
      line: 25,
      vars: variables([{ name: "j", value: targetJ }]),
      note: { vi: "Mismatch đã tạo xong một ký tự mục tiêu.", en: "The mismatch has produced one target character." },
    });
    mismatchUsed = true;
    event = "spend-mismatch";
    push({
      title: { vi: "changed = True", en: "changed = True" },
      line: 26,
      note: {
        vi: "Từ giờ chỉ được chọn các ký tự khớp chính xác.",
        en: "From now on, only exact character matches may be selected.",
      },
    });
  }

  phase = "done";
  event = "done";
  forwardI = null;
  decision = null;
  const valid = targetJ === m;
  const result = valid ? [...answer] : [];
  push({
    title: valid
      ? { vi: `Trả về [${result.join(", ")}]`, en: `Return [${result.join(", ")}]` }
      : { vi: "Không có valid sequence", en: "No valid sequence exists" },
    line: 27,
    vars: [
      { name: "j", value: targetJ },
      { name: "m", value: m },
      { name: "return", value: `[${result.join(", ")}]` },
    ],
    note: valid
      ? { vi: `Các chỉ số tăng dần [${result.join(", ")}] tạo chuỗi "${selections.map((selection) => word1[selection.word1Index]).join("")}" và dùng ${mismatchUsed ? "1" : "0"} mismatch.`, en: `Increasing indices [${result.join(", ")}] form "${selections.map((selection) => word1[selection.word1Index]).join("")}" using ${mismatchUsed ? "1" : "0"} mismatch.` }
      : { vi: `Chỉ tạo được ${targetJ}/${m} ký tự nên phải trả mảng rỗng.`, en: `Only ${targetJ}/${m} target characters were produced, so return an empty array.` },
    final: true,
    view: { result, valid },
  });

  return { original: word1, word2, answer: result, steps };
}

/**
 * LeetCode 1404: Number of Steps to Reduce a Number in Binary Representation to One.
 *
 * Simulate directly on the binary string:
 *   - last bit 0 → even → divide by 2 by removing that last bit
 *   - last bit 1 → odd  → add 1 with binary carry propagation
 * Stop once the string is exactly "1".
 */
function buildSteps1404(input) {
  const original = String(input || "").trim();
  const steps = [];
  const valid = /^1[01]*$/.test(original);

  function addOne(binary) {
    const bits = binary.split("");
    const carryIndices = [];
    let i = bits.length - 1;
    while (i >= 0 && bits[i] === "1") {
      carryIndices.push(i);
      bits[i] = "0";
      i--;
    }
    if (i >= 0) {
      carryIndices.push(i);
      bits[i] = "1";
    } else {
      bits.unshift("1");
      // Leading carry is represented as -1, while old indices remain available.
      carryIndices.push(-1);
    }
    return { result: bits.join(""), carryIndices };
  }

  function snap(opts) {
    const before = opts.before ?? original;
    const after = opts.after ?? before;
    steps.push({
      title: opts.title,
      arr: after.split("").map(() => 1),
      sub: after.split(""),
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      binaryReductionView: {
        before,
        after,
        operation: opts.operation || "idle",
        lsbIndex: opts.lsbIndex,
        carryIndices: opts.carryIndices || [],
        steps: opts.steps,
        final: opts.final || false,
      },
    });
  }

  if (!valid) {
    snap({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      after: original || "?",
      final: true,
      codeLines: [2],
      vars: [{ name: "s", value: `"${original}"` }],
      note: {
        vi: "s phải là chuỗi nhị phân không rỗng, bắt đầu bằng '1' (không có số 0 ở đầu).",
        en: "s must be a non-empty binary string beginning with '1' (no leading zero).",
      },
    });
    return { original, answer: null, steps };
  }

  let current = original;
  let count = 0;

  // Line 3: steps = 0
  snap({
    title: { vi: "steps = 0", en: "steps = 0" },
    after: current,
    codeLines: [3],
    steps: count,
    vars: [{ name: "s", value: `"${current}"` }, { name: "steps", value: count }],
    note: {
      vi: `Bắt đầu với s="${current}". Mỗi phép +1 hoặc /2 tính là đúng 1 bước.`,
      en: `Start with s="${current}". Every +1 or /2 operation counts as exactly 1 step.`,
    },
  });

  while (current !== "1") {
    // Line 4: while s != "1":
    snap({
      title: { vi: `while s != "1" → "${current}" != "1" → True`, en: `while s != "1" → "${current}" != "1" → True` },
      after: current,
      codeLines: [4],
      operation: "check",
      steps: count,
      vars: [{ name: "s", value: `"${current}"` }, { name: "steps", value: count }],
      note: {
        vi: `s chưa phải "1", nên tiếp tục xét bit cuối cùng s[-1]='${current.at(-1)}'.`,
        en: `s is not yet "1", so inspect its last bit s[-1]='${current.at(-1)}'.`,
      },
    });

    const isEven = current.at(-1) === "0";
    // Line 5: if s[-1] == "0":
    snap({
      title: { vi: `if s[-1] == "0" → '${current.at(-1)}' == '0' → ${isEven}`, en: `if s[-1] == "0" → '${current.at(-1)}' == '0' → ${isEven}` },
      after: current,
      codeLines: [5],
      operation: "check",
      lsbIndex: current.length - 1,
      steps: count,
      vars: [{ name: "s[-1] (LSB)", value: `'${current.at(-1)}'` }],
      note: isEven
        ? { vi: "Bit cuối là 0 → số chẵn → được phép chia 2.", en: "The last bit is 0 → the number is even → divide by 2." }
        : { vi: "Bit cuối là 1 → số lẻ → phải cộng 1 trước.", en: "The last bit is 1 → the number is odd → add 1 first." },
    });

    const before = current;
    let operation;
    let carryIndices = [];

    if (isEven) {
      // Line 6: s = s[:-1]
      current = current.slice(0, -1);
      operation = "divide";
      snap({
        title: { vi: `s = s[:-1] → "${before}" / 2 = "${current}"`, en: `s = s[:-1] → "${before}" / 2 = "${current}"` },
        before,
        after: current,
        codeLines: [6],
        operation,
        lsbIndex: before.length - 1,
        steps: count,
        vars: [{ name: "s", value: `"${current}"` }],
        note: {
          vi: "Trong nhị phân, chia số chẵn cho 2 = bỏ bit 0 ở cuối chuỗi.",
          en: "In binary, dividing an even number by 2 means removing its trailing 0 bit.",
        },
      });
    } else {
      // Line 7: else:
      snap({
        title: { vi: "else: bit cuối là 1", en: "else: the last bit is 1" },
        after: before,
        codeLines: [7],
        operation: "branch-add",
        lsbIndex: before.length - 1,
        steps: count,
        vars: [{ name: "s[-1]", value: "'1'" }],
        note: {
          vi: "Số lẻ không thể chia 2 ngay. Đi vào else để cộng 1, biến nó thành số chẵn.",
          en: "An odd number cannot be divided by 2 immediately. Enter else to add 1 and make it even.",
        },
      });

      // Line 8: s = bin(int(s, 2) + 1)[2:]
      const addition = addOne(before);
      current = addition.result;
      carryIndices = addition.carryIndices;
      operation = "add";
      snap({
        title: { vi: `s = bin(int(s,2)+1)[2:] → "${before}" + 1 = "${current}"`, en: `s = bin(int(s,2)+1)[2:] → "${before}" + 1 = "${current}"` },
        before,
        after: current,
        codeLines: [8],
        operation,
        lsbIndex: before.length - 1,
        carryIndices,
        steps: count,
        vars: [{ name: "s", value: `"${current}"` }],
        note: {
          vi: `Cộng 1 theo nhị phân: carry đi từ phải sang trái qua các bit 1 cuối. Các vị trí carry: ${carryIndices.filter((i) => i >= 0).map((i) => `[${i}]`).join(", ") || "không có"}.`,
          en: `Add 1 in binary: the carry moves right-to-left through trailing 1 bits. Carry positions: ${carryIndices.filter((i) => i >= 0).map((i) => `[${i}]`).join(", ") || "none"}.`,
        },
      });
    }

    // Line 9: steps += 1
    count++;
    snap({
      title: { vi: `steps += 1 → steps=${count}`, en: `steps += 1 → steps=${count}` },
      before,
      after: current,
      codeLines: [9],
      operation,
      lsbIndex: before.length - 1,
      carryIndices,
      steps: count,
      vars: [{ name: "s", value: `"${current}"` }, { name: "steps", value: count }],
      note: {
        vi: `${operation === "divide" ? "Chia 2" : "Cộng 1"} vừa thực hiện, nên tăng bộ đếm bước lên ${count}.`,
        en: `${operation === "divide" ? "Division by 2" : "Addition by 1"} was just performed, so increase the step count to ${count}.`,
      },
    });
  }

  // Line 10: return steps
  snap({
    title: { vi: `return steps → ${count}`, en: `return steps → ${count}` },
    after: current,
    final: true,
    codeLines: [10],
    operation: "found",
    steps: count,
    vars: [{ name: "s", value: `"${current}"` }, { name: "steps", value: count }],
    note: {
      vi: `Đã giảm được về s="1" sau ${count} bước.`,
      en: `The value has reached s="1" after ${count} steps.`,
    },
  });

  return { original, answer: count, steps };
}

/**
 * Approach 2 for LeetCode 1404: convert the binary string to an integer,
 * then directly test parity with num % 2. JavaScript BigInt is used here to
 * preserve Python's arbitrary-size-int behavior for the original constraints.
 */
function buildSteps1404v2(input) {
  const original = String(input || "").trim();
  const steps = [];
  const valid = /^1[01]*$/.test(original);

  function carryPath(binary) {
    const path = [];
    let i = binary.length - 1;
    while (i >= 0 && binary[i] === "1") { path.push(i); i--; }
    path.push(i >= 0 ? i : -1);
    return path;
  }

  function snap(opts) {
    const before = opts.before ?? original;
    const after = opts.after ?? before;
    steps.push({
      title: opts.title,
      arr: after.split("").map(() => 1),
      sub: after.split(""),
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      final: opts.final || false,
      codeBlock: 2,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      binaryReductionView: {
        before, after,
        operation: opts.operation || "idle",
        lsbIndex: opts.lsbIndex,
        carryIndices: opts.carryIndices || [],
        steps: opts.steps,
        final: opts.final || false,
      },
    });
  }

  if (!valid) {
    snap({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      after: original || "?", final: true, codeLines: [2],
      vars: [{ name: "s", value: `"${original}"` }],
      note: { vi: "s phải là chuỗi nhị phân không rỗng, bắt đầu bằng '1'.", en: "s must be a non-empty binary string beginning with '1'." },
    });
    return { original, answer: null, steps };
  }

  let count = 0;
  let num;

  // Line 3: steps = 0
  snap({
    title: { vi: "steps = 0", en: "steps = 0" }, after: original, codeLines: [3], steps: count,
    vars: [{ name: "steps", value: count }],
    note: { vi: "Khởi tạo bộ đếm thao tác.", en: "Initialize the operation counter." },
  });

  // Line 4: num = int(s, 2)
  num = BigInt(`0b${original}`);
  snap({
    title: { vi: `num = int(s, 2) → ${num.toString()}`, en: `num = int(s, 2) → ${num.toString()}` },
    after: num.toString(2), codeLines: [4], steps: count,
    vars: [{ name: "s", value: `"${original}"` }, { name: "num (decimal)", value: num.toString() }, { name: "num (binary)", value: `"${num.toString(2)}"` }],
    note: { vi: `Chuyển "${original}" từ hệ 2 sang số nguyên num=${num.toString()}. (Trong Python, int có độ chính xác không giới hạn; visualizer dùng BigInt tương đương.)`, en: `Convert "${original}" from binary to integer num=${num.toString()}. (Python ints have unlimited precision; the visualizer uses equivalent BigInt.)` },
  });

  while (num !== 1n) {
    const beforeNum = num;
    const before = beforeNum.toString(2);

    // Line 5: while num != 1:
    snap({
      title: { vi: `while num != 1 → ${beforeNum} != 1 → True`, en: `while num != 1 → ${beforeNum} != 1 → True` },
      after: before, codeLines: [5], operation: "check", steps: count,
      vars: [{ name: "num (decimal)", value: beforeNum.toString() }, { name: "num (binary)", value: `"${before}"` }],
      note: { vi: `num=${beforeNum} chưa bằng 1, tiếp tục kiểm tra tính chẵn/lẻ.`, en: `num=${beforeNum} is not 1 yet, so continue checking parity.` },
    });

    const isEven = beforeNum % 2n === 0n;
    // Line 6: if num % 2 == 0:
    snap({
      title: { vi: `if num % 2 == 0 → ${beforeNum} % 2 = ${isEven ? 0 : 1} → ${isEven}`, en: `if num % 2 == 0 → ${beforeNum} % 2 = ${isEven ? 0 : 1} → ${isEven}` },
      after: before, codeLines: [6], operation: "check", lsbIndex: before.length - 1, steps: count,
      vars: [{ name: "num % 2", value: isEven ? 0 : 1 }],
      note: isEven
        ? { vi: "Phần dư 0 → num chẵn → chia nguyên cho 2.", en: "Remainder 0 → num is even → integer-divide by 2." }
        : { vi: "Phần dư 1 → num lẻ → cộng 1.", en: "Remainder 1 → num is odd → add 1." },
    });

    let operation;
    let carryIndices = [];
    if (isEven) {
      // Line 7: num //= 2
      num /= 2n;
      operation = "divide";
      snap({
        title: { vi: `num //= 2 → ${beforeNum} // 2 = ${num}`, en: `num //= 2 → ${beforeNum} // 2 = ${num}` },
        before, after: num.toString(2), codeLines: [7], operation, lsbIndex: before.length - 1, steps: count,
        vars: [{ name: "num (decimal)", value: num.toString() }, { name: "num (binary)", value: `"${num.toString(2)}"` }],
        note: { vi: `Chia ${beforeNum} cho 2, nhận ${num}. Dạng nhị phân bỏ bit 0 cuối.`, en: `Divide ${beforeNum} by 2 to get ${num}. Binary form removes the trailing 0 bit.` },
      });
    } else {
      // Line 8: else:
      snap({
        title: { vi: "else: num là số lẻ", en: "else: num is odd" },
        after: before, codeLines: [8], operation: "branch-add", lsbIndex: before.length - 1, steps: count,
        vars: [{ name: "num % 2", value: 1 }],
        note: { vi: "Không thể chia một số lẻ cho 2 ở bài này; cần cộng 1 để số trở thành chẵn.", en: "We do not divide an odd number by 2 in this problem; add 1 first to make it even." },
      });

      // Line 9: num += 1
      carryIndices = carryPath(before);
      num += 1n;
      operation = "add";
      snap({
        title: { vi: `num += 1 → ${beforeNum} + 1 = ${num}`, en: `num += 1 → ${beforeNum} + 1 = ${num}` },
        before, after: num.toString(2), codeLines: [9], operation, lsbIndex: before.length - 1, carryIndices, steps: count,
        vars: [{ name: "num (decimal)", value: num.toString() }, { name: "num (binary)", value: `"${num.toString(2)}"` }],
        note: { vi: `Cộng 1: ${beforeNum} → ${num}. View vẫn tô vàng đường carry ở dạng nhị phân.`, en: `Add 1: ${beforeNum} → ${num}. The view still highlights the binary carry path in gold.` },
      });
    }

    // Line 10: steps += 1
    count++;
    snap({
      title: { vi: `steps += 1 → steps=${count}`, en: `steps += 1 → steps=${count}` },
      before, after: num.toString(2), codeLines: [10], operation, lsbIndex: before.length - 1, carryIndices, steps: count,
      vars: [{ name: "num", value: num.toString() }, { name: "steps", value: count }],
      note: { vi: `Đã thực hiện ${operation === "divide" ? "phép chia 2" : "phép cộng 1"}; tăng steps lên ${count}.`, en: `Completed ${operation === "divide" ? "division by 2" : "addition by 1"}; increase steps to ${count}.` },
    });
  }

  // Line 11: return steps
  snap({
    title: { vi: `return steps → ${count}`, en: `return steps → ${count}` },
    after: "1", final: true, codeLines: [11], operation: "found", steps: count,
    vars: [{ name: "num", value: "1" }, { name: "steps", value: count }],
    note: { vi: `num đã là 1. Trả về ${count} bước.`, en: `num is now 1. Return ${count} steps.` },
  });

  return { original, answer: count, steps };
}

/**
 * LeetCode 2213: Longest Substring of One Repeating Character.
 *
 * s is mutated one character at a time by queries. After EACH query, find
 * the length of the longest run of a single repeating character in the
 * WHOLE string. Use a segment tree where every node stores enough summary
 * information to merge two adjacent intervals:
 *   left character, right character, prefix run length, suffix run length,
 *   best run length, and interval length.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def longestRepeating(self, s, queryCharacters, queryIndices):
 *  3          n = len(s)
 *  4          build a segment tree over s
 *  5          ans = []
 *  6          for ch, index in zip(queryCharacters, queryIndices):
 *  7              update the leaf at index to ch
 *  8              while moving upward: merge(left_child, right_child)
 *  9              ans.append(tree[1].best)
 * 10          return ans
 */
function buildSteps2213(input, params) {
  const s = String(input || "");
  const queryCharacters = String((params && params.queryCharacters) || "").trim();
  const queryIndicesRaw = String((params && params.queryIndices) || "").trim();
  const queryIndices = queryIndicesRaw.length
    ? queryIndicesRaw.split(",").map((x) => Number(x.trim()))
    : [];
  const steps = [];
  const n = s.length;

  const invalid = n === 0
    || queryCharacters.length === 0
    || queryCharacters.length !== queryIndices.length
    || queryIndices.some((idx) => !Number.isInteger(idx) || idx < 0 || idx >= n);

  if (invalid) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: s.split("").map(() => 1),
      sub: s.split(""),
      highlight: [],
      mark: [],
      final: true,
      codeLines: [2],
      vars: [
        { name: "s", value: `"${s}"` },
        { name: "queryCharacters", value: `"${queryCharacters}"` },
        { name: "queryIndices", value: `[${queryIndices.join(",")}]` },
      ],
      note: {
        vi: "s không rỗng; queryCharacters.length phải bằng queryIndices.length; mỗi queryIndices[i] phải là chỉ số hợp lệ trong s.",
        en: "s must be non-empty; queryCharacters.length must equal queryIndices.length; every queryIndices[i] must be a valid index into s.",
      },
    });
    return { original: s, answer: [], steps };
  }

  const chars = s.split("");
  const k = queryCharacters.length;
  const lengths = [];

  function runsFor(arr) {
    const runs = [];
    let start = 0;
    for (let j = 1; j <= arr.length; j++) {
      if (j === arr.length || arr[j] !== arr[j - 1]) {
        runs.push({ start, end: j - 1, length: j - start, ch: arr[start] });
        start = j;
      }
    }
    return runs;
  }

  let size = 1;
  while (size < n) size *= 2;
  const tree = Array.from({ length: size * 2 }, () => null);

  function makeEmpty(l, r) {
    return { l, r, len: 0, leftChar: "", rightChar: "", pref: 0, suff: 0, best: 0 };
  }

  function makeLeaf(index, ch) {
    return { l: index, r: index, len: 1, leftChar: ch, rightChar: ch, pref: 1, suff: 1, best: 1 };
  }

  function mergeNode(left, right) {
    if (!left || left.len === 0) return right || makeEmpty(0, -1);
    if (!right || right.len === 0) return left;
    const node = {
      l: left.l,
      r: right.r,
      len: left.len + right.len,
      leftChar: left.leftChar,
      rightChar: right.rightChar,
      pref: left.pref,
      suff: right.suff,
      best: Math.max(left.best, right.best),
    };
    const canJoin = left.rightChar === right.leftChar;
    if (canJoin) {
      const cross = left.suff + right.pref;
      node.best = Math.max(node.best, cross);
      if (left.pref === left.len) node.pref = left.len + right.pref;
      if (right.suff === right.len) node.suff = right.len + left.suff;
    }
    return node;
  }

  function visibleTreeNodes(activeNode = null, path = []) {
    const pathSet = new Set(path);
    const nodes = [];
    for (let id = 1; id < tree.length; id++) {
      const node = tree[id];
      if (!node || node.len === 0 || node.l >= n) continue;
      nodes.push({
        id,
        l: node.l,
        r: Math.min(node.r, n - 1),
        len: node.len,
        leftChar: node.leftChar,
        rightChar: node.rightChar,
        pref: node.pref,
        suff: node.suff,
        best: node.best,
        active: id === activeNode,
        path: pathSet.has(id),
        root: id === 1,
      });
    }
    return nodes.slice(0, 31);
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: chars.map(() => 1),
      sub: [...chars],
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      repeatingRunsView: {
        chars: [...chars],
        runs: opts.runs || runsFor(chars),
        activeIndex: opts.activeIndex,
        compareIndex: opts.compareIndex,
        bestRun: opts.bestRun,
        currentRun: opts.currentRun,
        queryIndex: opts.queryIndex,
        totalQueries: k,
        lengths: [...lengths],
        phase: opts.phase || "scan",
        changedIndex: opts.changedIndex,
        treeNodes: visibleTreeNodes(opts.activeNode, opts.updatePath || []),
        merge: opts.merge,
        rootBest: tree[1] ? tree[1].best : 0,
      },
    });
  }

  for (let i = 0; i < size; i++) {
    tree[size + i] = i < n ? makeLeaf(i, chars[i]) : makeEmpty(i, i);
  }
  for (let id = size - 1; id >= 1; id--) {
    tree[id] = mergeNode(tree[id * 2], tree[id * 2 + 1]);
  }

  snap({
    title: { vi: "Build Segment Tree từ chuỗi ban đầu", en: "Build the Segment Tree from the initial string" },
    codeLines: [3, 4, 5],
    phase: "init",
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "root.best", value: tree[1].best },
      { name: "ans", value: "[]" },
    ],
    note: {
      vi: "Mỗi node lưu: pref = run dài nhất ở đầu đoạn, suff = run dài nhất ở cuối đoạn, best = run dài nhất trong đoạn.",
      en: "Each node stores: pref = longest run at the left edge, suff = longest run at the right edge, best = longest run inside the interval.",
    },
  });

  for (let qi = 0; qi < k; qi++) {
    const idx = queryIndices[qi];
    const ch = queryCharacters[qi];
    const oldCh = chars[idx];
    const updatePath = [];

    snap({
      title: { vi: `Query ${qi}: queryIndices[${qi}]=${idx}, queryCharacters[${qi}]='${ch}'`, en: `Query ${qi}: queryIndices[${qi}]=${idx}, queryCharacters[${qi}]='${ch}'` },
      codeLines: [36],
      phase: "query-start",
      queryIndex: qi,
      activeIndex: idx,
      vars: [
        { name: "i (query)", value: qi },
        { name: "queryIndices[i]", value: idx },
        { name: "queryCharacters[i]", value: `'${ch}'` },
        { name: "root.best", value: tree[1].best },
      ],
      note: {
        vi: `Bắt đầu query ${qi + 1}: đổi index ${idx} từ '${oldCh}' thành '${ch}', rồi cập nhật đường đi từ leaf lên root.`,
        en: `Start query ${qi + 1}: change index ${idx} from '${oldCh}' to '${ch}', then update the path from leaf to root.`,
      },
    });

    chars[idx] = ch;
    let nodeId = size + idx;
    tree[nodeId] = makeLeaf(idx, ch);
    updatePath.push(nodeId);
    snap({
      title: { vi: `Update leaf: s[${idx}] = '${ch}'`, en: `Update leaf: s[${idx}] = '${ch}'` },
      codeLines: [37],
      phase: "leaf-update",
      queryIndex: qi,
      activeIndex: idx,
      changedIndex: idx,
      activeNode: nodeId,
      updatePath,
      vars: [{ name: "chars", value: `[${chars.join(",")}]` }, { name: "leaf", value: nodeId }],
      note: {
        vi: `Leaf của index ${idx} bây giờ là ký tự '${ch}', nên pref=suff=best=1.`,
        en: `The leaf for index ${idx} is now '${ch}', so pref=suff=best=1.`,
      },
    });

    nodeId = Math.floor(nodeId / 2);
    while (nodeId >= 1) {
      const left = tree[nodeId * 2];
      const right = tree[nodeId * 2 + 1];
      const before = tree[nodeId];
      tree[nodeId] = mergeNode(left, right);
      updatePath.push(nodeId);
      const canJoin = left && right && left.len > 0 && right.len > 0 && left.rightChar === right.leftChar;
      const cross = canJoin ? left.suff + right.pref : 0;
      snap({
        title: { vi: `Merge node ${nodeId}: [${tree[nodeId].l}..${tree[nodeId].r}]`, en: `Merge node ${nodeId}: [${tree[nodeId].l}..${tree[nodeId].r}]` },
        codeLines: [32, 37],
        phase: "merge",
        queryIndex: qi,
        changedIndex: idx,
        activeNode: nodeId,
        updatePath,
        merge: {
          node: nodeId,
          left: left ? { best: left.best, suff: left.suff, rightChar: left.rightChar } : null,
          right: right ? { best: right.best, pref: right.pref, leftChar: right.leftChar } : null,
          canJoin,
          cross,
          beforeBest: before ? before.best : 0,
          afterBest: tree[nodeId].best,
        },
        vars: [
          { name: "node", value: nodeId },
          { name: "left.best", value: left ? left.best : 0 },
          { name: "right.best", value: right ? right.best : 0 },
          { name: "cross", value: cross },
          { name: "node.best", value: tree[nodeId].best },
        ],
        note: {
          vi: canJoin
            ? `Hai nửa nối được vì '${left.rightChar}' == '${right.leftChar}'. cross = left.suff(${left.suff}) + right.pref(${right.pref}) = ${cross}.`
            : `Hai nửa không nối được ở giữa, nên best chỉ lấy max(left.best, right.best).`,
          en: canJoin
            ? `The two halves can join because '${left.rightChar}' == '${right.leftChar}'. cross = left.suff(${left.suff}) + right.pref(${right.pref}) = ${cross}.`
            : "The two halves cannot join across the middle, so best is max(left.best, right.best).",
        },
      });
      nodeId = Math.floor(nodeId / 2);
    }

    lengths.push(tree[1].best);
    const finalRuns = runsFor(chars);
    const bestRunInfo = finalRuns.reduce((acc, r) => (r.length > acc.length ? r : acc), finalRuns[0]);
    snap({
      title: { vi: `Root.best = ${tree[1].best} → append answer`, en: `Root.best = ${tree[1].best} → append answer` },
      codeLines: [38],
      phase: "query-done",
      queryIndex: qi,
      runs: finalRuns,
      bestRun: bestRunInfo,
      updatePath,
      vars: [{ name: "lengths", value: `[${lengths.join(",")}]` }],
      note: {
        vi: `Sau query ${qi + 1}, root.best cho toàn chuỗi = ${tree[1].best}. Chuỗi hiện tại: "${chars.join("")}".`,
        en: `After query ${qi + 1}, root.best for the whole string = ${tree[1].best}. Current string: "${chars.join("")}".`,
      },
    });
  }

  const finalRuns = runsFor(chars);
  snap({
    title: { vi: `return lengths → [${lengths.join(",")}]`, en: `return lengths → [${lengths.join(",")}]` },
    codeLines: [39],
    final: true,
    phase: "found",
    runs: finalRuns,
    vars: [{ name: "lengths", value: `[${lengths.join(",")}]` }],
    note: {
      vi: `Đã xử lý cả ${k} query. Kết quả: lengths = [${lengths.join(",")}].`,
      en: `All ${k} queries processed. Result: lengths = [${lengths.join(",")}].`,
    },
  });

  return { original: s, answer: lengths, steps };
}

module.exports = {
  1404: {
    id: 1404,
    difficulty: "medium",
    slug: "number-of-steps-to-reduce-a-number-in-binary-representation-to-one",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "math", vi: "Toán học", en: "Math" }],
    title: { vi: "Number of Steps to Reduce a Number in Binary Representation to One", en: "Number of Steps to Reduce a Number in Binary Representation to One" },
    titleVi: { vi: "Số bước giảm số nhị phân về 1", en: "Steps to reduce a binary number to one" },
    statement: {
      vi: "Cho số nguyên dương ở dạng chuỗi nhị phân s. Nếu s là số chẵn thì chia 2; nếu s là số lẻ (trừ 1) thì cộng 1. Trả về số bước cần thiết để đưa s về đúng 1.",
      en: "Given a positive integer as a binary string s, divide it by 2 if it is even, or add 1 if it is odd (except 1). Return the number of steps needed to reach exactly 1.",
    },
    defaultInput: "1101",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi nhị phân)", en: "s (binary string)" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        default: "1",
        label: { vi: "Cách giải", en: "Approach" },
        options: [
          { value: "1", label: { vi: "Cách 1: Mô phỏng chuỗi nhị phân", en: "Approach 1: Binary-string simulation" } },
          { value: "2", label: { vi: "Cách 2: Chuyển sang số nguyên", en: "Approach 2: Integer parity simulation" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 nhìn bit cuối (LSB): 0 nghĩa là số chẵn, nên chia 2 bằng cách bỏ bit 0 cuối.", en: "Approach 1 inspects the last bit (LSB): 0 means even, so divide by 2 by removing that trailing 0." },
      { vi: "Cách 2 chuyển s sang số nguyên, kiểm tra num % 2, rồi chia 2 hoặc cộng 1 trực tiếp.", en: "Approach 2 converts s to an integer, checks num % 2, then directly divides by 2 or adds 1." },
      { vi: "Cả hai cách lặp lại đến khi giá trị bằng 1.", en: "Both approaches repeat until the value equals 1." },
    ],
    complexity: {
      time: "O(n²) với mô phỏng chuỗi trực tiếp; Cách 2 phụ thuộc kích thước số nguyên",
      space: "O(n)",
      note: {
        vi: "Cách 1 rất dễ quan sát; mỗi lần +1 có thể carry qua O(n) bit. Cách 2 bám sát code Python bằng số nguyên; visualizer dùng BigInt để không mất độ chính xác với chuỗi nhị phân dài.",
        en: "Approach 1 is easy to observe; each +1 may carry across O(n) bits. Approach 2 follows the Python integer code and uses BigInt in the visualizer to preserve precision for long binary strings.",
      },
    },
    code: [
      "class Solution:",
      "    def numSteps(self, s):",
      "        steps = 0",
      "        while s != \"1\":",
      "            if s[-1] == \"0\":",
      "                s = s[:-1]",
      "            else:",
      "                s = bin(int(s, 2) + 1)[2:]",
      "            steps += 1",
      "        return steps",
    ],
    code2: [
      "class Solution:",
      "    def numSteps(self, s: str) -> int:",
      "        steps = 0",
      "        num = int(s, 2)",
      "        while num != 1:",
      "            if num % 2 == 0:",
      "                num //= 2",
      "            else:",
      "                num += 1",
      "            steps += 1",
      "        return steps",
    ],
    codeLabel: { vi: "Cách 1: Mô phỏng chuỗi nhị phân", en: "Approach 1: Binary-string simulation" },
    code2Label: { vi: "Cách 2: Chuyển sang số nguyên", en: "Approach 2: Integer parity simulation" },
    builder: (input, params) => String(params && params.approach) === "2"
      ? buildSteps1404v2(input)
      : buildSteps1404(input),
  },
  2213: {
    id: 2213,
    difficulty: "hard",
    slug: "longest-substring-of-one-repeating-character",
    category: { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: { vi: "Longest Substring of One Repeating Character", en: "Longest Substring of One Repeating Character" },
    titleVi: { vi: "Substring lặp dài nhất sau mỗi query", en: "Longest repeating substring after each query" },
    statement: {
      vi:
        "Cho chuỗi s (0-indexed). Cho queryCharacters và queryIndices cùng độ dài k: query thứ i đổi " +
        "s[queryIndices[i]] thành queryCharacters[i]. Sau MỖI query, tìm độ dài substring LIÊN TIẾP dài nhất " +
        "gồm CÙNG MỘT ký tự lặp lại. Trả về mảng lengths.",
      en:
        "Given a 0-indexed string s, queryCharacters and queryIndices of the same length k: the ith query sets " +
        "s[queryIndices[i]] to queryCharacters[i]. After EACH query, find the length of the longest CONTIGUOUS " +
        "substring of a SINGLE repeating character. Return the array lengths.",
    },
    defaultInput: "babacc",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      { key: "queryCharacters", type: "string", label: { vi: "queryCharacters", en: "queryCharacters" }, default: "bcb" },
      { key: "queryIndices", type: "string", label: { vi: "queryIndices (cách bởi ,)", en: "queryIndices (comma separated)" }, default: "1,3,3" },
    ],
    approach: [
      { vi: "Với mỗi query, cập nhật chars[queryIndices[i]] = queryCharacters[i].", en: "For each query, update chars[queryIndices[i]] = queryCharacters[i]." },
      { vi: "Mỗi node Segment Tree lưu 6 thông tin: len, left char, right char, pref, suff, best.", en: "Each Segment Tree node stores 6 values: len, left char, right char, pref, suff, best." },
      { vi: "Khi merge hai node, nếu ký tự cuối bên trái bằng ký tự đầu bên phải thì có cross run = left.suff + right.pref.", en: "When merging two nodes, if the left interval's last char equals the right interval's first char, cross run = left.suff + right.pref." },
      { vi: "Sau point update, chỉ cần merge lại các node trên đường từ leaf lên root; root.best là đáp án sau query.", en: "After a point update, only merge nodes on the path from the leaf to the root; root.best is the answer after the query." },
    ],
    complexity: {
      time: "O((n+k)·log n)",
      space: "O(n)",
      note: {
        vi: "Build tree O(n). Mỗi query update một leaf và merge O(log n) node cha.",
        en: "Build the tree in O(n). Each query updates one leaf and merges O(log n) ancestors.",
      },
    },
    code: [
      "class Solution:",
      "    def longestRepeating(self, s, queryCharacters, queryIndices):",
      "        n = len(s)",
      "        tree = [None] * (4 * n)",
      "",
      "        def merge(a, b):",
      "            length = a[0] + b[0]",
      "            left_char, right_char = a[1], b[2]",
      "            pref, suff = a[3], b[4]",
      "            best = max(a[5], b[5])",
      "            if a[2] == b[1]:",
      "                best = max(best, a[4] + b[3])",
      "                if a[3] == a[0]: pref = a[0] + b[3]",
      "                if b[4] == b[0]: suff = b[0] + a[4]",
      "            return (length, left_char, right_char, pref, suff, best)",
      "",
      "        def build(node, l, r):",
      "            if l == r:",
      "                tree[node] = (1, s[l], s[l], 1, 1, 1)",
      "                return",
      "            mid = (l + r) // 2",
      "            build(node * 2, l, mid)",
      "            build(node * 2 + 1, mid + 1, r)",
      "            tree[node] = merge(tree[node * 2], tree[node * 2 + 1])",
      "",
      "        def update(node, l, r, index, ch):",
      "            if l == r:",
      "                tree[node] = (1, ch, ch, 1, 1, 1)",
      "                return",
      "            mid = (l + r) // 2",
      "            if index <= mid: update(node * 2, l, mid, index, ch)",
      "            else: update(node * 2 + 1, mid + 1, r, index, ch)",
      "            tree[node] = merge(tree[node * 2], tree[node * 2 + 1])",
      "",
      "        build(1, 0, n - 1)",
      "        ans = []",
      "        for ch, index in zip(queryCharacters, queryIndices):",
      "            update(1, 0, n - 1, index, ch)",
      "            ans.append(tree[1][5])",
      "        return ans",
    ],
    builder: buildSteps2213,
  },
  3302: {
    id: 3302,
    difficulty: "medium",
    slug: "find-the-lexicographically-smallest-valid-sequence",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: {
      vi: "Find the Lexicographically Smallest Valid Sequence",
      en: "Find the Lexicographically Smallest Valid Sequence",
    },
    titleVi: {
      vi: "Tìm dãy chỉ số hợp lệ nhỏ nhất theo thứ tự từ điển",
      en: "Lexicographically smallest valid index sequence",
    },
    statement: {
      vi: "Cho word1 và word2. Chọn word2.length chỉ số tăng dần trong word1 sao cho chuỗi tạo được khác word2 nhiều nhất một ký tự. Trả về dãy chỉ số nhỏ nhất theo thứ tự từ điển, hoặc [] nếu không tồn tại.",
      en: "Given word1 and word2, choose word2.length increasing indices from word1 so the resulting string differs from word2 in at most one character. Return the lexicographically smallest index sequence, or [] if none exists.",
    },
    defaultInput: "bacdc",
    inputKind: "string",
    inputLabel: { vi: "word1", en: "word1" },
    extraParams: [
      { key: "word2", type: "string", label: { vi: "word2", en: "word2" }, default: "abc" },
    ],
    approach: [
      {
        vi: "Duyệt ngược để dựng suffix[j]: vị trí ngoài cùng bên phải có thể bắt đầu khớp chính xác word2[j:].",
        en: "Scan backward to build suffix[j]: the rightmost position that can start an exact match of word2[j:].",
      },
      {
        vi: "Duyệt word1 từ trái sang phải. Nếu ký tự khớp thì chọn ngay vì đó là chỉ số nhỏ nhất khả thi.",
        en: "Scan word1 left to right. Select an exact match immediately because it is the smallest feasible index.",
      },
      {
        vi: "Nếu ký tự sai và chưa dùng mismatch, chỉ chọn khi đây là target cuối hoặc i < suffix[j+1], đảm bảo phần còn lại vẫn khớp được.",
        en: "For a differing character with the mismatch unused, select it only for the final target or when i < suffix[j+1], keeping the remaining exact suffix feasible.",
      },
    ],
    complexity: {
      time: "O(n + m)",
      space: "O(m)",
      note: {
        vi: "Con trỏ dựng suffix chỉ đi sang trái và con trỏ greedy chỉ đi sang phải. Mảng suffix có m phần tử.",
        en: "The suffix pointer only moves left and the greedy pointer only moves right. The suffix array stores m positions.",
      },
    },
    code: [
      "class Solution:",
      "    def validSequence(self, word1: str, word2: str) -> List[int]:",
      "        n, m = len(word1), len(word2)",
      "        suffix = [-1] * m",
      "        i = n - 1",
      "        for j in range(m - 1, -1, -1):",
      "            while i >= 0 and word1[i] != word2[j]:",
      "                i -= 1",
      "            if i < 0:",
      "                break",
      "            suffix[j] = i",
      "            i -= 1",
      "",
      "        answer = []",
      "        j = 0",
      "        changed = False",
      "        for i, char in enumerate(word1):",
      "            if j == m:",
      "                break",
      "            if char == word2[j]:",
      "                answer.append(i)",
      "                j += 1",
      "            elif not changed and (j == m - 1 or i < suffix[j + 1]):",
      "                answer.append(i)",
      "                j += 1",
      "                changed = True",
      "        return answer if j == m else []",
    ],
    builder: buildSteps3302,
  },
  3829: {
    id: 3829,
    difficulty: "medium",
    slug: "design-ride-sharing-system",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Design Ride Sharing System", en: "Design Ride Sharing System" },
    titleVi: { vi: "Thiết kế hệ thống ghép rider và driver theo FIFO", en: "Match riders and drivers in FIFO order" },
    statement: {
      vi: "Thiết kế hệ thống quản lý rider đang chờ và driver đang sẵn sàng. matchDriverWithRider() ghép driver đến sớm nhất với rider chờ lâu nhất; cancelRider() chỉ hủy request chưa được ghép.",
      en: "Design a system for waiting riders and available drivers. matchDriverWithRider() pairs the earliest driver with the earliest waiting rider; cancelRider() only cancels an unmatched request.",
    },
    defaultInput: "addRider(3); addRider(1); addRider(7); addDriver(2); matchDriverWithRider(); cancelRider(1); addDriver(5); matchDriverWithRider(); addDriver(9); matchDriverWithRider()",
    inputKind: "string",
    inputLabel: { vi: "Operations (ngăn bởi ;)", en: "Operations (separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "Hai deque giữ thứ tự đến: FRONT là rider/driver sớm nhất, REAR là người mới đến.", en: "Two deques preserve arrival order: FRONT is earliest and REAR is newest." },
      { vi: "active_riders là set các request vẫn hợp lệ; cancel chỉ discard khỏi set trong O(1).", en: "active_riders stores valid requests; cancellation only discards from the set in O(1)." },
      { vi: "Trước khi ghép, lazy-remove mọi rider đã hủy đang chắn ở FRONT.", en: "Before matching, lazily remove cancelled riders blocking the FRONT." },
      { vi: "Chỉ khi cả hai queue còn phần tử mới popleft hai FRONT và trả [driverId, riderId].", en: "Only when both queues are nonempty do we popleft both FRONT entries and return [driverId, riderId]." },
    ],
    complexity: {
      time: "O(1) amortized",
      space: "O(riders + drivers)",
      note: {
        vi: "add/cancel là O(1). Một match riêng lẻ có thể dọn nhiều rider đã hủy, nhưng mỗi rider chỉ bị pop một lần nên chi phí trung bình là O(1).",
        en: "add/cancel are O(1). One match can clean several cancelled riders, but each rider is popped once, so the amortized cost is O(1).",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class RideSharingSystem:",
      "    def __init__(self):",
      "        self.riders = deque()",
      "        self.drivers = deque()",
      "        self.active_riders = set()",
      "",
      "    def addRider(self, riderId: int) -> None:",
      "        self.riders.append(riderId)",
      "        self.active_riders.add(riderId)",
      "",
      "    def addDriver(self, driverId: int) -> None:",
      "        self.drivers.append(driverId)",
      "",
      "    def matchDriverWithRider(self) -> List[int]:",
      "        while self.riders and self.riders[0] not in self.active_riders:",
      "            self.riders.popleft()",
      "        if not self.riders or not self.drivers:",
      "            return [-1, -1]",
      "        driver = self.drivers.popleft()",
      "        rider = self.riders.popleft()",
      "        self.active_riders.remove(rider)",
      "        return [driver, rider]",
      "",
      "    def cancelRider(self, riderId: int) -> None:",
      "        self.active_riders.discard(riderId)",
    ],
    builder: buildSteps3829,
  },
  8: {
    id: 8, difficulty: "medium", slug: "string-to-integer-atoi",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "String to Integer (atoi)", en: "String to Integer (atoi)" },
    titleVi: { vi: "Chuyển chuỗi thành số nguyên", en: "Parse a string into an integer" },
    statement: { vi: "Chuyển chuỗi thành số nguyên 32-bit theo luật atoi (bỏ khoảng trắng, dấu, chữ số, chặn phạm vi). Nhập chuỗi s.", en: "Convert a string to a 32-bit integer per atoi rules (skip spaces, sign, digits, clamp range). Enter the string s." },
    defaultInput: "   -042", inputKind: "string", inputLabel: { vi: "s", en: "s" }, extraParams: [],
    approach: [{ vi: "Bỏ khoảng trắng đầu.", en: "Skip leading spaces." }, { vi: "Đọc dấu +/- nếu có.", en: "Read an optional +/- sign." }, { vi: "Đọc các chữ số liên tiếp.", en: "Read consecutive digits." }, { vi: "Chặn trong [-2³¹, 2³¹-1].", en: "Clamp to [-2³¹, 2³¹-1]." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt.", en: "Single pass." } },
    code: ["class Solution:", "    def myAtoi(self, s):", "        i, n = 0, len(s)", "        while i < n and s[i] == ' ': i += 1", "        sign = 1", "        if i < n and s[i] in '+-':", "            sign = -1 if s[i]=='-' else 1; i += 1", "        num = 0", "        while i < n and s[i].isdigit():", "            num = num*10 + int(s[i]); i += 1", "        num *= sign", "        return max(-2**31, min(2**31-1, num))"],
    builder: buildSteps8,
  },
  67: {
    id: 67, difficulty: "easy", slug: "add-binary",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Add Binary", en: "Add Binary" },
    titleVi: { vi: "Cộng hai số nhị phân dạng chuỗi", en: "Add two binary strings" },
    statement: { vi: "Cộng hai chuỗi nhị phân, trả về chuỗi nhị phân. Nhập a; b trong tham số.", en: "Add two binary strings, return a binary string. Enter a; b as a parameter." },
    defaultInput: "1010", inputKind: "string", inputLabel: { vi: "a", en: "a" },
    extraParams: [{ key: "b", label: { vi: "b", en: "b" }, default: "1011" }],
    approach: [{ vi: "Cộng từ phải sang trái, giữ carry.", en: "Add from right to left, carrying." }, { vi: "Mỗi vị trí: total = bit a + bit b + carry.", en: "Each position: total = bit a + bit b + carry." }, { vi: "Ghi total%2, carry = total//2.", en: "Write total%2, carry = total//2." }],
    complexity: { time: "O(max(m,n))", space: "O(max(m,n))", note: { vi: "Duyệt song song hai chuỗi.", en: "Walk both strings in parallel." } },
    code: ["class Solution:", "    def addBinary(self, a, b):", "        i, j, carry, res = len(a)-1, len(b)-1, 0, []", "        while i >= 0 or j >= 0 or carry:", "            total = carry", "            if i >= 0: total += int(a[i]); i -= 1", "            if j >= 0: total += int(b[j]); j -= 1", "            res.append(str(total % 2)); carry = total // 2", "        return ''.join(reversed(res))"],
    builder: buildSteps67,
  },
  224: {
    id: 224, difficulty: "hard", slug: "basic-calculator",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    title: { vi: "Basic Calculator", en: "Basic Calculator" },
    titleVi: { vi: "Máy tính cơ bản (+, -, ngoặc) dùng stack", en: "Basic calculator (+, -, parentheses) using a stack" },
    statement: { vi: "Tính biểu thức gồm +, -, ( ) và số. Nhập biểu thức s.", en: "Evaluate an expression with +, -, ( ) and integers. Enter the expression s." },
    defaultInput: "(1+(4+5+2)-3)+(6+8)", inputKind: "string", inputLabel: { vi: "s", en: "s" }, extraParams: [],
    approach: [{ vi: "Giữ result, sign, num khi duyệt.", en: "Track result, sign, num while scanning." }, { vi: "+/-: cộng num vào result, cập nhật sign.", en: "+/-: add num to result, update sign." }, { vi: "'(': đẩy (result, sign) vào stack, reset.", en: "'(': push (result, sign) onto the stack, reset." }, { vi: "')': gộp result với ngữ cảnh trên stack.", en: "')': merge result with the context on the stack." }],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Stack cho các ngoặc lồng nhau.", en: "Stack for nested parentheses." } },
    code: ["class Solution:", "    def calculate(self, s):", "        result, sign, num, stack = 0, 1, 0, []", "        for ch in s:", "            if ch.isdigit(): num = num*10 + int(ch)", "            elif ch in '+-':", "                result += sign*num; num = 0; sign = 1 if ch=='+' else -1", "            elif ch == '(':", "                stack.append(result); stack.append(sign); result, sign = 0, 1", "            elif ch == ')':", "                result += sign*num; num = 0", "                result *= stack.pop(); result += stack.pop()", "        return result + sign*num"],
    builder: buildSteps224,
  },
  14: {
    id: 14,
    difficulty: "easy",
    slug: "longest-common-prefix",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Longest Common Prefix", en: "Longest Common Prefix" },
    titleVi: { vi: "Tiền tố chung dài nhất", en: "Longest common prefix" },
    statement: { vi: "Tìm tiền tố chung dài nhất của một danh sách chuỗi. Nhập các từ cách nhau dấu phẩy.", en: "Find the longest common prefix of a list of strings. Enter words comma-separated." },
    defaultInput: "flower,flow,flight",
    inputKind: "string", inputLabel: { vi: "strs", en: "strs" }, extraParams: [],
    approach: [
      { vi: "Lấy từ đầu làm prefix.", en: "Take the first word as the prefix." },
      { vi: "Với mỗi từ, rút ngắn prefix tới khi từ bắt đầu bằng nó.", en: "For each word, shrink the prefix until the word starts with it." },
      { vi: "Nếu prefix rỗng → không có tiền tố chung.", en: "If the prefix becomes empty → no common prefix." },
    ],
    complexity: { time: "O(S)", space: "O(1)", note: { vi: "S = tổng số ký tự.", en: "S = total characters." } },
    code: ["class Solution:", "    def longestCommonPrefix(self, strs):", "        if not strs: return ''", "        prefix = strs[0]", "        for word in strs[1:]:", "            while not word.startswith(prefix):", "                prefix = prefix[:-1]", "        return prefix"],
    builder: buildSteps14,
  },
  28: {
    id: 28,
    difficulty: "easy",
    slug: "find-the-index-of-the-first-occurrence-in-a-string",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Find the Index of the First Occurrence", en: "Find the Index of the First Occurrence" },
    titleVi: { vi: "Vị trí xuất hiện đầu tiên của chuỗi con", en: "First occurrence index of a substring" },
    statement: { vi: "Tìm chỉ số xuất hiện đầu tiên của needle trong haystack, hoặc -1. Nhập haystack; needle trong tham số.", en: "Find the first index of needle in haystack, or -1. Enter haystack; needle as a parameter." },
    defaultInput: "sadbutsad",
    inputKind: "string", inputLabel: { vi: "haystack", en: "haystack" },
    extraParams: [{ key: "needle", label: { vi: "needle", en: "needle" }, default: "sad" }],
    approach: [
      { vi: "Thử từng vị trí bắt đầu i trong haystack.", en: "Try each start position i in haystack." },
      { vi: "So sánh cửa sổ haystack[i:i+m] với needle.", en: "Compare the window haystack[i:i+m] with needle." },
      { vi: "Khớp → trả về i; hết vòng lặp → -1.", en: "Match → return i; loop ends → -1." },
    ],
    complexity: { time: "O(n·m)", space: "O(1)", note: { vi: "So khớp thô; KMP tối ưu O(n+m).", en: "Naive matching; KMP optimizes to O(n+m)." } },
    code: ["class Solution:", "    def strStr(self, haystack, needle):", "        n, m = len(haystack), len(needle)", "        for i in range(n - m + 1):", "            if haystack[i:i+m] == needle:", "                return i", "        return -1"],
    builder: buildSteps28,
  },
  58: {
    id: 58,
    difficulty: "easy",
    slug: "length-of-last-word",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Length of Last Word", en: "Length of Last Word" },
    titleVi: { vi: "Độ dài từ cuối cùng", en: "Length of the last word" },
    statement: { vi: "Trả về độ dài từ cuối cùng trong chuỗi (các từ cách nhau bởi khoảng trắng). Nhập chuỗi s.", en: "Return the length of the last word in the string (words separated by spaces). Enter the string s." },
    defaultInput: "   fly me   to   the moon  ",
    inputKind: "string", inputLabel: { vi: "s", en: "s" }, extraParams: [],
    approach: [
      { vi: "Duyệt từ cuối chuỗi.", en: "Scan from the end of the string." },
      { vi: "Bỏ qua các khoảng trắng cuối.", en: "Skip trailing spaces." },
      { vi: "Đếm ký tự cho tới khi gặp khoảng trắng hoặc hết chuỗi.", en: "Count chars until a space or the start." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt từ phải.", en: "Single right-to-left pass." } },
    code: ["class Solution:", "    def lengthOfLastWord(self, s):", "        i = len(s) - 1; length = 0", "        while i >= 0 and s[i] == ' ':", "            i -= 1", "        while i >= 0 and s[i] != ' ':", "            length += 1; i -= 1", "        return length"],
    builder: buildSteps58,
  },
  49: {
    id: 49,
    difficulty: "medium",
    slug: "group-anagrams",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Group Anagrams", en: "Group Anagrams" },
    titleVi: { vi: "Gom nhóm anagram (hash map)", en: "Group anagrams (hash map)" },
    statement: {
      vi: "Cho danh sách chuỗi. Gom các anagram (cùng tập chữ cái) vào một nhóm. Nhập các từ cách nhau dấu phẩy.",
      en: "Given a list of strings, group the anagrams (same multiset of letters) together. Enter words comma-separated.",
    },
    defaultInput: "eat,tea,tan,ate,nat,bat",
    inputKind: "string",
    inputLabel: { vi: "strs (cách bởi ,)", en: "strs (comma separated)" },
    extraParams: [],
    approach: [
      { vi: "Anagram ⟺ chuỗi chữ cái sắp xếp giống nhau.", en: "Anagrams ⟺ equal sorted-letter strings." },
      { vi: "Dùng chuỗi đã sắp làm khóa của hash map.", en: "Use the sorted string as the hash-map key." },
      { vi: "Thêm mỗi từ vào nhóm ứng với khóa của nó.", en: "Append each word to the group of its key." },
    ],
    complexity: { time: "O(n·k log k)", space: "O(n·k)", note: { vi: "n từ, mỗi từ dài k; sắp k log k.", en: "n words of length k; sorting is k log k." } },
    code: [
      "class Solution:",
      "    def groupAnagrams(self, strs):",
      "        groups = defaultdict(list)",
      "        for word in strs:",
      "            key = ''.join(sorted(word))",
      "            groups[key].append(word)",
      "        return list(groups.values())",
    ],
    builder: buildSteps49,
  },
  43: {
    id: 43,
    difficulty: "medium",
    slug: "multiply-strings",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Multiply Strings", en: "Multiply Strings" },
    titleVi: { vi: "Nhân hai số dạng chuỗi", en: "Multiply two numeric strings" },
    statement: {
      vi: "Cho hai số không âm dạng chuỗi num1, num2. Trả về tích cũng dạng chuỗi (không dùng BigInteger). Nhập num1; num2 trong tham số.",
      en: "Given two non-negative integers as strings num1, num2, return their product as a string (no BigInteger). Enter num1; num2 as a parameter.",
    },
    defaultInput: "123",
    inputKind: "string",
    inputLabel: { vi: "num1", en: "num1" },
    extraParams: [
      { key: "num2", label: { vi: "num2", en: "num2" }, default: "456" },
    ],
    approach: [
      { vi: "Mảng result kích thước m+n chứa từng chữ số của tích.", en: "A result array of size m+n holds each digit of the product." },
      { vi: "Tích num1[i]·num2[j] cộng vào result[i+j+1], nhớ sang result[i+j].", en: "The product num1[i]·num2[j] adds to result[i+j+1], carrying to result[i+j]." },
      { vi: "Xử lý phần nhớ ngay khi cộng (total%10 và total//10).", en: "Handle the carry immediately (total%10 and total//10)." },
      { vi: "Bỏ số 0 ở đầu rồi nối thành chuỗi kết quả.", en: "Strip leading zeros then join into the result string." },
    ],
    complexity: { time: "O(m·n)", space: "O(m+n)", note: { vi: "Nhân từng cặp chữ số.", en: "Multiply every digit pair." } },
    code: [
      "class Solution:",
      "    def multiply(self, num1, num2):",
      "        if num1=='0' or num2=='0': return '0'",
      "        m, n = len(num1), len(num2); result = [0]*(m+n)",
      "        for i in range(m-1, -1, -1):",
      "            for j in range(n-1, -1, -1):",
      "                mul = int(num1[i])*int(num2[j])",
      "                total = mul + result[i+j+1]",
      "                result[i+j+1] = total % 10",
      "                result[i+j] += total // 10",
      "        # strip leading zeros; return ''.join(map(str, result))",
    ],
    builder: buildSteps43,
  },
  65: {
    id: 65,
    difficulty: "hard",
    slug: "valid-number",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Valid Number", en: "Valid Number" },
    titleVi: { vi: "Kiểm tra số hợp lệ (máy trạng thái)", en: "Validate a number (state machine)" },
    statement: {
      vi:
        "Cho chuỗi s. Kiểm tra s có phải một SỐ hợp lệ không (số nguyên, thập phân, có thể kèm dấu và số mũ e/E). " +
        "Dùng máy trạng thái hữu hạn (DFA). Nhập chuỗi s.",
      en:
        "Given a string s, decide if it is a valid NUMBER (integer, decimal, optional sign and exponent e/E). " +
        "Uses a deterministic finite automaton (DFA). Enter the string s.",
    },
    defaultInput: "-90E3",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [],
    approach: [
      { vi: "Xây bảng chuyển trạng thái: 9 state, mỗi state map nhóm ký tự → state kế.", en: "Build a transition table: 9 states, each mapping a char group → next state." },
      { vi: "Nhóm ký tự: space, sign(+/-), digit, dot(.), e(e/E). Ký tự khác → invalid.", en: "Char groups: space, sign(+/-), digit, dot(.), e(e/E). Anything else → invalid." },
      { vi: "Duyệt từng ký tự; nếu không có chuyển tiếp hợp lệ → False.", en: "Walk each char; if no valid transition → False." },
      { vi: "Hợp lệ nếu kết thúc ở state chấp nhận {2,4,7,8}.", en: "Valid iff ending in an accepting state {2,4,7,8}." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt 1 lần; bảng trạng thái cố định.",
        en: "Single pass; fixed-size transition table.",
      },
    },
    code: [
      "class Solution:",
      "    def isNumber(self, s):",
      "        states = [ ...transition table (9 states)... ]",
      "        accepting = {2, 4, 7, 8}",
      "        state = 0",
      "        for ch in s:",
      "            g = group(ch)  # space/sign/digit/dot/e/invalid",
      "            if g == 'invalid' or g not in states[state]: return False",
      "            state = states[state][g]",
      "        return state in accepting",
    ],
    builder: buildSteps65,
  },
  3458: {
    id: 3458,
    difficulty: "hard",
    slug: "select-k-disjoint-special-substrings",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Select K Disjoint Special Substrings", en: "Select K Disjoint Special Substrings" },
    titleVi: { vi: "Chọn k chuỗi con đặc biệt rời nhau", en: "Select k disjoint special substrings" },
    statement: {
      vi:
        "Chuỗi con 'đặc biệt' = mọi ký tự bên trong KHÔNG xuất hiện bên ngoài nó, và KHÔNG phải toàn bộ chuỗi. " +
        "Hỏi có thể chọn k chuỗi con đặc biệt RỜI NHAU (không chồng lấn) hay không. Nhập s; k trong tham số.",
      en:
        "A 'special' substring = every character inside does NOT appear outside it, and it is NOT the whole string. " +
        "Decide whether k DISJOINT (non-overlapping) special substrings can be selected. Enter s; k as a parameter.",
    },
    defaultInput: "abcdbaefab",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      { key: "k", label: { vi: "k", en: "k" }, default: 2 },
    ],
    approach: [
      { vi: "Tính first/last occurrence của mỗi ký tự.", en: "Compute first/last occurrence of each character." },
      { vi: "Từ mỗi first[c]==i, mở rộng j = max(last của các ký tự trong đoạn) — giống Partition Labels.", en: "From each first[c]==i, expand j = max(last of chars inside) — like Partition Labels." },
      { vi: "Nếu có ký tự trong đoạn xuất hiện trước i → không đóng kín, bỏ. Loại đoạn = cả chuỗi.", en: "If a char inside appears before i → not closed, skip. Reject the whole-string segment." },
      { vi: "Greedy chọn tối đa đoạn rời nhau (sắp theo end). count ≥ k → true.", en: "Greedily pick max disjoint segments (sort by end). count ≥ k → true." },
    ],
    complexity: {
      time: "O(n·Σ) ~ O(n)",
      space: "O(n)",
      note: {
        vi: "Σ ≤ 26. Mở rộng đoạn + greedy đều tuyến tính theo n.",
        en: "Σ ≤ 26. Segment expansion + greedy are both linear in n.",
      },
    },
    code: [
      "class Solution:",
      "    def maxSubstringLength(self, s, k):",
      "        if k == 0: return True",
      "        first = {c: i for i, c in enumerate(s) if c not in ...}; last = {...}",
      "        intervals = []",
      "        for i in range(n):",
      "            if first[s[i]] != i: continue",
      "            j = last[s[i]]; t = i; valid = True",
      "            while t <= j:",
      "                if first[s[t]] < i: valid = False; break",
      "                j = max(j, last[s[t]]); t += 1",
      "            if valid and not (i==0 and j==n-1): intervals.append((j, i))",
      "        intervals.sort()",
      "        count = 0; prev_end = -1",
      "        for end, start in intervals:",
      "            if start > prev_end: count += 1; prev_end = end",
      "        return count >= k",
    ],
    builder: buildSteps3458,
  },
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
    extraParams: [
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: prefix/repeat frame stack", en: "Approach 1: prefix/repeat frame stack" } },
        { value: "2", label: { vi: "Cách 2: character stack", en: "Approach 2: character stack" } },
      ] },
    ],
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
    code2: [
      "class Solution:",
      "    def decodeString(self, s: str) -> str:",
      "        stack = []",
      "        for ch in s:",
      "            if ch != ']':",
      "                stack.append(ch)",
      "            else:",
      "                substr = \"\"",
      "                while stack[-1] != '[':",
      "                    substr = stack.pop() + substr",
      "                stack.pop()  # remove '['",
      "                k = \"\"",
      "                while stack and stack[-1].isdigit():",
      "                    k = stack.pop() + k",
      "                stack.append(int(k) * substr)",
      "        return \"\".join(stack)",
    ],
    codeLabel: { vi: "Cách 1: prefix/repeat frame stack", en: "Approach 1: prefix/repeat frame stack" },
    code2Label: { vi: "Cách 2: character stack", en: "Approach 2: character stack" },
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
  1768: {
    id: 1768,
    difficulty: "easy",
    slug: "merge-strings-alternately",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Merge Strings Alternately", en: "Merge Strings Alternately" },
    titleVi: { vi: "Trộn hai chuỗi xen kẽ", en: "Merge two strings alternately" },
    statement: {
      vi: "Cho hai chuỗi word1 và word2. Trộn chúng bằng cách lấy luân phiên một ký tự từ word1 rồi một ký tự từ word2; thêm phần còn lại của chuỗi dài hơn vào cuối.",
      en: "Given word1 and word2, merge them by alternating characters starting with word1, then append any remainder from the longer string.",
    },
    defaultInput: "abc",
    inputKind: "string",
    inputLabel: { vi: "word1", en: "word1" },
    extraParams: [
      {
        key: "word2",
        type: "string",
        label: { vi: "word2", en: "word2" },
        default: "pqr",
      },
    ],
    approach: [
      { vi: "Duyệt đến độ dài của chuỗi dài hơn.", en: "Iterate up to the length of the longer string." },
      { vi: "Ở mỗi vị trí, thêm ký tự từ word1 nếu còn, rồi thêm ký tự từ word2 nếu còn.", en: "At each index, append from word1 if available, then from word2 if available." },
      { vi: "Ghép danh sách ký tự để tạo chuỗi kết quả.", en: "Join the collected characters into the result string." },
    ],
    complexity: {
      time: "O(n + m)",
      space: "O(n + m)",
      note: {
        vi: "Mỗi ký tự của hai chuỗi được đọc và thêm đúng một lần; kết quả chứa n + m ký tự.",
        en: "Every character is read and appended once; the result contains n + m characters.",
      },
    },
    code: [
      "class Solution:",
      "    def mergeAlternately(self, word1: str, word2: str) -> str:",
      "        result = []",
      "        for i in range(max(len(word1), len(word2))):",
      "            if i < len(word1):",
      "                result.append(word1[i])",
      "            if i < len(word2):",
      "                result.append(word2[i])",
      "        return ''.join(result)",
    ],
    builder: buildSteps1768,
  },
  3517: {
    id: 3517,
    difficulty: "medium",
    slug: "smallest-palindromic-rearrangement-i",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Smallest Palindromic Rearrangement I", en: "Smallest Palindromic Rearrangement I" },
    titleVi: { vi: "Sắp xếp palindrome nhỏ nhất", en: "Smallest palindromic rearrangement" },
    statement: {
      vi: "Cho chuỗi palindrome s gồm chữ cái thường. Hãy sắp xếp lại các ký tự để tạo palindrome nhỏ nhất theo thứ tự từ điển.",
      en: "Given a palindromic lowercase string s, rearrange its characters into the lexicographically smallest palindrome.",
    },
    defaultInput: "babab",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi palindrome)", en: "s (palindromic string)" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        default: "1",
        label: { vi: "Cách giải", en: "Approach" },
        options: [
          { value: "1", label: { vi: "Cách 1: Counter toàn chuỗi", en: "Approach 1: Counter over the full string" } },
          { value: "2", label: { vi: "Cách 2: Nửa đầu + bucket[26]", en: "Approach 2: First half + bucket[26]" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 đếm toàn bộ chuỗi bằng Counter rồi lấy một nửa số lượng của mỗi ký tự.", en: "Approach 1 counts the full string with Counter, then takes half of every character count." },
      { vi: "Cách 2 tận dụng s đã là palindrome: nửa đầu chứa đúng một ký tự của mỗi cặp đối xứng, nên chỉ cần đếm s[:n//2] vào bucket[26].", en: "Approach 2 uses the fact that s is already palindromic: its first half contains one character from every mirrored pair, so only s[:n//2] is counted into bucket[26]." },
      { vi: "Cả hai cách tạo left theo alphabet, chọn mid nếu độ dài lẻ, rồi đặt right = left[::-1].", en: "Both approaches build left alphabetically, select mid for odd length, then set right = left[::-1]." },
    ],
    complexity: {
      time: "O(n + k log k)",
      space: "O(n + k)",
      note: {
        vi: "n là độ dài chuỗi, k là số ký tự khác nhau (k <= 26). Với alphabet cố định, thời gian là O(n).",
        en: "n is the string length and k is the number of distinct characters (k <= 26). With a fixed alphabet, this is O(n).",
      },
    },
    code: [
      "from collections import Counter",
      "class Solution:",
      "    def smallestPalindrome(self, s: str) -> str:",
      "        count = Counter(s)",
      "        left = []",
      "        middle = ''",
      "        for ch in sorted(count):",
      "            pairs = count[ch] // 2",
      "            left.append(ch * pairs)",
      "            if count[ch] % 2 != 0:",
      "                middle = ch",
      "        half = ''.join(left)",
      "        return half + middle + half[::-1]",
    ],
    code2: [
      "class Solution:",
      "    def smallestPalindrome(self, s: str) -> str:",
      "        partition = len(s) // 2",
      "        bucket = [0] * 26",
      "",
      "        for i in range(partition):",
      "            bucket[ord(s[i]) - 97] += 1",
      "",
      "        left = \"\".join(",
      "            [chr(i + 97) * bucket[i] for i in range(26) if bucket[i] > 0]",
      "        )",
      "",
      "        mid = s[partition] if len(s) % 2 != 0 else \"\"",
      "        right = left[::-1]",
      "",
      "        return left + mid + right",
    ],
    codeLabel: { vi: "Cách 1: Counter toàn chuỗi", en: "Approach 1: Full-string Counter" },
    code2Label: { vi: "Cách 2: Nửa đầu + bucket[26]", en: "Approach 2: First half + bucket[26]" },
    builder: (input, params) => Number(params && params.approach) === 2
      ? buildSteps3517HalfBucket(input)
      : buildSteps3517(input),
  },
  3518: {
    id: 3518,
    difficulty: "hard",
    slug: "smallest-palindromic-rearrangement-ii",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Smallest Palindromic Rearrangement II", en: "Smallest Palindromic Rearrangement II" },
    titleVi: { vi: "Palindrome nhỏ thứ k", en: "K-th smallest palindromic rearrangement" },
    statement: {
      vi: "Cho chuỗi palindrome s và số nguyên k. Trả về hoán vị palindrome nhỏ thứ k theo thứ tự từ điển; nếu có ít hơn k kết quả khác nhau, trả về chuỗi rỗng.",
      en: "Given a palindromic string s and an integer k, return its k-th lexicographically smallest distinct palindromic permutation; return an empty string if fewer than k exist.",
    },
    defaultInput: "aabbccddeeddccbbaa",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi palindrome)", en: "s (palindromic string)" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k (1-indexed)", en: "k (1-indexed)" }, default: 137, min: 1, max: 1000000 },
    ],
    approach: [
      { vi: "Palindrome được xác định hoàn toàn bởi nửa trái. Lấy count[ch] // 2 để tạo multiset của nửa trái; ký tự lẻ duy nhất được cố định ở giữa.", en: "A palindrome is fully determined by its left half. Use count[ch] // 2 for the left-half multiset; the sole odd character is fixed at the center." },
      { vi: "Tại mỗi vị trí, thử ký tự từ a đến z và đếm số hoán vị phần đuôi. Mỗi lựa chọn tạo thành một block liên tiếp theo thứ tự từ điển.", en: "At each position, try characters from a to z and count suffix permutations. Each choice forms one contiguous lexicographic block." },
      { vi: "Nếu k lớn hơn kích thước block, bỏ block và trừ k; ngược lại chọn ký tự đó. Cuối cùng ghép left + middle + reverse(left).", en: "If k exceeds a block size, skip it and subtract from k; otherwise choose that character. Finally join left + middle + reverse(left)." },
    ],
    complexity: {
      time: "O(26 * n * log CAP)",
      space: "O(n + 26)",
      note: {
        vi: "Alphabet và CAP=1,000,001 là hằng số nhỏ trong bài; số cách được cap ngay khi đủ lớn để so sánh với k.",
        en: "The alphabet and CAP=1,000,001 are small fixed bounds here; arrangement counts are capped as soon as they are large enough to compare with k.",
      },
    },
    code: [
      "from collections import Counter",
      "",
      "",
      "class Solution:",
      "    CAP = 1_000_001",
      "",
      "    def smallestPalindrome(self, s: str, k: int) -> str:",
      "        freq = Counter(s)",
      "        half = [freq[chr(97 + i)] // 2 for i in range(26)]",
      "        middle = next((ch for ch in freq if freq[ch] % 2), '')",
      "        prelunthak = (s, k)",
      "",
      "        total = self._count(half)",
      "        if k > total:",
      "            return ''",
      "",
      "        left = []",
      "        for _ in range(sum(half)):",
      "            for i in range(26):",
      "                if half[i] == 0:",
      "                    continue",
      "",
      "                half[i] -= 1",
      "                ways = self._count(half)",
      "",
      "                if k > ways:",
      "                    k -= ways",
      "                    half[i] += 1",
      "                else:",
      "                    left.append(chr(97 + i))",
      "                    break",
      "",
      "        left = ''.join(left)",
      "        return left + middle + left[::-1]",
      "",
      "    def _count(self, freq):",
      "        remaining = sum(freq)",
      "        total = 1",
      "        for amount in freq:",
      "            if amount:",
      "                total *= self._choose(remaining, amount)",
      "                if total >= self.CAP:",
      "                    return self.CAP",
      "                remaining -= amount",
      "        return total",
      "",
      "    def _choose(self, n, r):",
      "        r = min(r, n - r)",
      "        result = 1",
      "        for i in range(1, r + 1):",
      "            result = result * (n - i + 1) // i",
      "            if result >= self.CAP:",
      "                return self.CAP",
      "        return result",
    ],
    builder: buildSteps3518,
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
  3501: {
    id: 3501,
    difficulty: "hard",
    slug: "maximize-active-section-with-trade-ii",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: { vi: "Maximize Active Section with Trade II", en: "Maximize Active Section with Trade II" },
    titleVi: { vi: "Tối đa hoá khu vực hoạt động sau trade với nhiều query", en: "Maximize active sections after trade with queries" },
    statement: {
      vi:
        "Cho chuỗi nhị phân s và danh sách queries [l,r]. Với mỗi query, chỉ được trade bên trong substring s[l..r]. " +
        "Mỗi trade có thể xoá một đoạn '1' bị kẹp bởi '0', làm hai đoạn '0' hai bên ghép lại rồi đổi thành '1'. " +
        "Trả về số lượng '1' tối đa trong toàn chuỗi sau trade tốt nhất cho từng query.",
      en:
        "Given a binary string s and queries [l,r]. For each query, the trade is restricted to substring s[l..r]. " +
        "A trade removes a '1' block surrounded by '0's, merging the two neighboring zero sections so they can become '1's. " +
        "Return the maximum number of active sections in the whole string after the best trade for each query.",
    },
    defaultInput: "1001000110100101",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi nhị phân)", en: "s (binary string)" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Cách giải", en: "Approach" },
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Iterative Segment Tree", en: "Approach 1: Iterative Segment Tree" } },
          { value: "2", label: { vi: "Cách 2: Recursive Segment Tree + bisect", en: "Approach 2: Recursive Segment Tree + bisect" } },
        ],
      },
      {
        key: "queries",
        type: "string",
        label: { vi: "queries (l,r;l,r;...)", en: "queries (l,r;l,r;...)" },
        default: "2,13;0,7;4,15",
      },
    ],
    approach: [
      { vi: "Đếm tổng số '1' trong toàn chuỗi một lần: ones.", en: "Count total '1's in the whole string once: ones." },
      { vi: "Nén các đoạn '0' thành zeroGroups; mỗi cặp zᵢ, zᵢ₊₁ có gain = len(zᵢ) + len(zᵢ₊₁).", en: "Compress zero runs into zeroGroups; each pair zᵢ, zᵢ₊₁ has gain = len(zᵢ) + len(zᵢ₊₁)." },
      { vi: "Cách 1 map mỗi vị trí sang zeroGroup và dùng iterative segment tree để query pair gain.", en: "Approach 1 maps each position to a zero group and uses an iterative segment tree for pair-gain queries." },
      { vi: "Cách 2 lưu blockLeft/blockRight, dùng bisect tìm hai block biên và recursive segment tree cho phần giữa.", en: "Approach 2 stores blockLeft/blockRight, uses bisect to locate boundary blocks, and a recursive segment tree for the middle." },
      { vi: "Với query [l,r], hai biên có thể cắt giữa một đoạn '0', nên cần xét left cut và right cut riêng.", en: "For query [l,r], each boundary may cut through a zero run, so left cut and right cut need special handling." },
      { vi: "Gain cuối là max của RMQ ở giữa và tối đa ba candidate đặc biệt chạm biên.", en: "The final gain is the max of the middle RMQ and up to three boundary candidates." },
    ],
    complexity: {
      time: "O(n + q log n)",
      space: "O(n)",
      note: {
        vi: "Nén runs và build cây O(n). Mỗi query thực hiện một range maximum query O(log n) và xét O(1) case biên.",
        en: "Run compression and tree construction are O(n). Each query performs one O(log n) range maximum query plus O(1) boundary cases.",
      },
    },
    code: [
      "class Solution:",
      "    def maxActiveSectionsAfterTrade(self, s: str, queries: List[List[int]]) -> List[int]:",
      "        ones = s.count('1')",
      "        zeroGroups, zeroGroupIndex = self.getZeroGroups(s)",
      "        if len(zeroGroups) < 2:",
      "            return [ones] * len(queries)",
      "",
      "        pairCount = len(zeroGroups) - 1",
      "        size = 1",
      "        while size < pairCount:",
      "            size *= 2",
      "        tree = [0] * (2 * size)",
      "        for g in range(pairCount):",
      "            tree[size + g] = zeroGroups[g][2] + zeroGroups[g + 1][2]",
      "        for node in range(size - 1, 0, -1):",
      "            tree[node] = max(tree[node * 2], tree[node * 2 + 1])",
      "",
      "        ans = []",
      "        for l, r in queries:",
      "            leftGroup = zeroGroupIndex[l]",
      "            rightGroup = zeroGroupIndex[r]",
      "            left = 0 if s[l] == '1' else zeroGroups[leftGroup][1] - l + 1",
      "            right = 0 if s[r] == '1' else r - zeroGroups[rightGroup][0] + 1",
      "            first = leftGroup + 1",
      "            last = rightGroup if s[r] == '1' else rightGroup - 1",
      "            gain = self.rangeMax(tree, size, first, last - 1)",
      "            if s[l] == '0' and leftGroup + 1 <= last:",
      "                gain = max(gain, left + zeroGroups[leftGroup + 1][2])",
      "            if s[r] == '0' and first <= rightGroup - 1:",
      "                gain = max(gain, zeroGroups[rightGroup - 1][2] + right)",
      "            if s[l] == '0' and s[r] == '0' and leftGroup + 1 == rightGroup:",
      "                gain = max(gain, left + right)",
      "            ans.append(ones + gain)",
      "        return ans",
      "",
      "    def rangeMax(self, tree, size, left, right):",
      "        if left > right:",
      "            return 0",
      "        left += size",
      "        right += size",
      "        best = 0",
      "        while left <= right:",
      "            if left % 2 == 1:",
      "                best = max(best, tree[left])",
      "                left += 1",
      "            if right % 2 == 0:",
      "                best = max(best, tree[right])",
      "                right -= 1",
      "            left //= 2",
      "            right //= 2",
      "        return best",
      "",
      "    def getZeroGroups(self, s: str):",
      "        zeroGroups = []",
      "        zeroGroupIndex = []",
      "        for i, ch in enumerate(s):",
      "            if ch == '0':",
      "                if i > 0 and s[i - 1] == '0':",
      "                    zeroGroups[-1][1] = i",
      "                    zeroGroups[-1][2] += 1",
      "                else:",
      "                    zeroGroups.append([i, i, 1])",
      "            zeroGroupIndex.append(len(zeroGroups) - 1)",
      "        return zeroGroups, zeroGroupIndex",
    ],
    code2: [
      "from bisect import bisect_left, bisect_right",
      "from typing import List",
      "",
      "class SegmentTree:",
      "    def __init__(self, arr):",
      "        self.n = len(arr)",
      "        self.arr = arr",
      "        self.seg = [0] * (self.n << 2)",
      "",
      "        if self.n:",
      "            self.build(1, 0, self.n - 1)",
      "",
      "    def build(self, p: int, l: int, r: int) -> None:",
      "        if l == r:",
      "            self.seg[p] = self.arr[l]",
      "            return",
      "",
      "        mid = (l + r) >> 1",
      "",
      "        self.build(p << 1, l, mid)",
      "        self.build(p << 1 | 1, mid + 1, r)",
      "",
      "        self.seg[p] = max(self.seg[p << 1], self.seg[p << 1 | 1])",
      "",
      "    def query(self, L: int, R: int) -> int:",
      "        if L > R:",
      "            return 0",
      "",
      "        def _query(p: int, l: int, r: int) -> int:",
      "            if L <= l and r <= R:",
      "                return self.seg[p]",
      "",
      "            mid = (l + r) >> 1",
      "            res = 0",
      "",
      "            if L <= mid:",
      "                res = max(res, _query(p << 1, l, mid))",
      "",
      "            if R > mid:",
      "                res = max(res, _query(p << 1 | 1, mid + 1, r))",
      "",
      "            return res",
      "",
      "        return _query(1, 0, self.n - 1)",
      "",
      "",
      "class Solution:",
      "    def maxActiveSectionsAfterTrade(self, s: str, queries: List[List[int]]) -> List[int]:",
      "        n = len(s)",
      "        cnt1 = s.count('1')",
      "",
      "        zeroBlocks = []",
      "        blockLeft = []",
      "        blockRight = []",
      "",
      "        i = 0",
      "        while i < n:",
      "            st = i",
      "            while i < n and s[i] == s[st]:",
      "                i += 1",
      "            if s[st] == '0':",
      "                zeroBlocks.append(i - st)",
      "                blockLeft.append(st)",
      "                blockRight.append(i - 1)",
      "",
      "        m = len(zeroBlocks)",
      "        if m < 2:",
      "            return [cnt1] * len(queries)",
      "",
      "        tmpSum = [zeroBlocks[i] + zeroBlocks[i + 1] for i in range(m - 1)]",
      "        seg = SegmentTree(tmpSum)",
      "        ans = []",
      "",
      "        for l, r in queries:",
      "            i = bisect_left(blockRight, l)",
      "            j = bisect_right(blockLeft, r) - 1",
      "",
      "            if i > m - 1 or j < 0 or i >= j:",
      "                ans.append(cnt1)",
      "                continue",
      "",
      "            firstLen = blockRight[i] - max(blockLeft[i], l) + 1",
      "            lastLen = min(blockRight[j], r) - blockLeft[j] + 1",
      "",
      "            if i + 1 == j:",
      "                bestGain = firstLen + lastLen",
      "                ans.append(cnt1 + bestGain)",
      "                continue",
      "",
      "            val1 = firstLen + zeroBlocks[i + 1]",
      "            val2 = zeroBlocks[j - 1] + lastLen",
      "            val3 = seg.query(i + 1, j - 2)",
      "",
      "            bestGain = max(val1, val2, val3)",
      "            ans.append(cnt1 + bestGain)",
      "",
      "        return ans",
    ],
    codeLabel: { vi: "Cách 1: Iterative Segment Tree", en: "Approach 1: Iterative Segment Tree" },
    code2Label: { vi: "Cách 2: Recursive Segment Tree + bisect", en: "Approach 2: Recursive Segment Tree + bisect" },
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2
        ? buildSteps3501RecursiveSegmentTree(input, params)
        : buildSteps3501SegmentTree(input, params);
    },
  },
};
