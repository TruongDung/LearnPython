"use strict";

const {
  bi,
  createTracer,
  fail,
  parsePlainParams,
  parseStringArray,
} = require("./hard-viz-shared");

const DEFAULT_WORDS_3045 = Object.freeze(["a", "aba", "ababa", "aa"]);

const LIMITS_3045 = Object.freeze({
  maxWords: 100_000,
  maxWordLength: 100_000,
  maxTotalCharacters: 500_000,
  maxTraceSteps: 220,
  maxTracedWords: 16,
  maxPairFrames: 150,
  maxArrayItems: 32,
  maxGraphNodes: 56,
  maxGraphEdges: 55,
  maxTableRows: 30,
  maxSequenceItems: 36,
  queryHeadRows: 8,
  queryTailRows: 20,
});

const PHASES_3045 = Object.freeze([
  bi("Khởi tạo trie cặp ký tự", "Initialize the paired-character trie"),
  bi("Truy vấn các từ trước", "Query prior words"),
  bi("Cộng terminal trên đường đi", "Accumulate terminals along the path"),
  bi("Chèn từ hiện tại", "Insert the current word"),
  bi("Tăng terminal", "Increment the terminal count"),
  bi("Kết quả", "Result"),
]);

const SOURCE_3045 = Object.freeze([
  "from typing import List",
  "",
  "class TrieNode:",
  "    def __init__(self):",
  "        self.children = {}",
  "        self.terminal = 0",
  "",
  "class Solution:",
  "    def countPrefixSuffixPairs(self, words: List[str]) -> int:",
  "        root = TrieNode()",
  "        answer = 0",
  "",
  "        for word in words:",
  "            node = root",
  "            for left, right in zip(word, reversed(word)):",
  "                pair = (left, right)",
  "                if pair not in node.children:",
  "                    break",
  "                node = node.children[pair]",
  "                answer += node.terminal",
  "",
  "            node = root",
  "            for left, right in zip(word, reversed(word)):",
  "                pair = (left, right)",
  "                if pair not in node.children:",
  "                    node.children[pair] = TrieNode()",
  "                node = node.children[pair]",
  "            node.terminal += 1",
  "",
  "        return answer",
]);

function parseCountPrefixSuffixPairs3045Input(input, params = {}) {
  parsePlainParams(params, 3045);
  const words = parseStringArray(input, {
    problemId: 3045,
    name: "words",
    minLength: 1,
    maxLength: LIMITS_3045.maxWords,
    minWordLength: 1,
    maxWordLength: LIMITS_3045.maxWordLength,
    lowercase: true,
    distinct: false,
  });
  const totalCharacters = words.reduce((total, word) => total + word.length, 0);
  if (totalCharacters > LIMITS_3045.maxTotalCharacters) {
    fail(
      3045,
      RangeError,
      `tổng độ dài words không được vượt ${LIMITS_3045.maxTotalCharacters}`,
      `the total length of words must not exceed ${LIMITS_3045.maxTotalCharacters}`,
    );
  }
  return { words: [...words], totalCharacters };
}

function pairedKey(word, depth) {
  return (word.charCodeAt(depth) - 97) * 26
    + word.charCodeAt(word.length - 1 - depth) - 97;
}

function pairedLabel(key) {
  const left = String.fromCharCode(97 + Math.floor(key / 26));
  const right = String.fromCharCode(97 + (key % 26));
  return `(${left}, ${right})`;
}

function compactWord(word) {
  if (word.length <= 30) return `"${word}"`;
  return `"${word.slice(0, 13)}…${word.slice(-13)}" · len=${word.length}`;
}

function selectedPairDepths(length, activeDepth) {
  const capacity = LIMITS_3045.maxSequenceItems - 1;
  if (length <= capacity) return Array.from({ length }, (_value, depth) => depth);

  const selected = new Set();
  const head = 8;
  const tail = 8;
  const middle = capacity - head - tail;
  for (let depth = 0; depth < head; depth += 1) selected.add(depth);
  for (let depth = length - tail; depth < length; depth += 1) selected.add(depth);

  const center = Number.isSafeInteger(activeDepth) ? activeDepth : head + Math.floor(middle / 2);
  const latestStart = Math.max(head, length - tail - middle);
  const start = Math.max(head, Math.min(latestStart, center - Math.floor(middle / 2)));
  for (let depth = start; depth < start + middle; depth += 1) selected.add(depth);

  for (let depth = 0; selected.size < capacity && depth < length; depth += 1) {
    selected.add(depth);
  }
  return [...selected].sort((left, right) => left - right).slice(0, capacity);
}

function buildSteps3045(input, params = {}) {
  const { words, totalCharacters } = parseCountPrefixSuffixPairs3045Input(input, params);
  const displayedWordCount = Math.min(words.length, LIMITS_3045.maxArrayItems);
  const displayedIndices = Array.from({ length: displayedWordCount }, (_value, index) => index);
  const displayedWords = words.slice(0, displayedWordCount).map(compactWord);

  const nodes = [{
    id: 0,
    parent: null,
    pairKey: null,
    depth: 0,
    terminal: 0,
    children: new Map(),
  }];
  const terminalNodeIds = [];

  let runningAnswer = 0;
  let insertedWords = 0;
  let tracedPairFrames = 0;
  let currentWordIndex = null;
  let currentWord = "";
  let currentContribution = 0;
  let currentDepth = null;
  let currentNode = 0;
  let currentParent = null;
  let currentPairKey = null;
  let currentMode = "idle";
  let currentPairMissing = false;
  let currentEdgeCreated = false;
  let queryStoppedAtMissing = false;
  let activePath = new Set([0]);
  let queryRowCount = 0;
  let queryHeadRows = [];
  let queryTailRows = [];

  const tracer = createTracer({
    problemId: 3045,
    source: SOURCE_3045,
    phases: PHASES_3045,
    maxSteps: LIMITS_3045.maxTraceSteps,
    baseArray: displayedIndices,
    legend: [
      { label: bi("Node/cặp đang xét", "Active node/pair"), state: "active" },
      { label: bi("Cạnh vừa tạo", "Newly created edge"), state: "updated" },
      { label: bi("Node kết thúc từ trước", "Prior-word terminal"), state: "success" },
      { label: bi("Cặp không tồn tại", "Missing pair"), state: "warning" },
    ],
  });

  if (
    words.length > LIMITS_3045.maxTracedWords
    || words.length > LIMITS_3045.maxArrayItems
    || words.some((word) => word.length > LIMITS_3045.maxSequenceItems - 1)
  ) {
    tracer.truncate();
  }

  function resetQueryRows() {
    queryRowCount = 0;
    queryHeadRows = [];
    queryTailRows = [];
  }

  function appendQueryRow(row) {
    queryRowCount += 1;
    if (queryHeadRows.length < LIMITS_3045.queryHeadRows) {
      queryHeadRows.push(row);
      return;
    }
    queryTailRows.push(row);
    if (queryTailRows.length > LIMITS_3045.queryTailRows) queryTailRows.shift();
    if (queryRowCount > LIMITS_3045.queryHeadRows + LIMITS_3045.queryTailRows) {
      tracer.truncate();
    }
  }

  function queryTable() {
    const toTableRow = (row) => ({
      label: `d=${row.depth}`,
      state: row.missing ? "warning" : (row.terminal > 0 ? "success" : "computed"),
      cells: [
        { value: row.pair, state: row.missing ? "warning" : "active" },
        row.missing ? "∅" : `n${row.nodeId}`,
        { value: row.terminal, state: row.terminal > 0 ? "success" : "muted" },
        { value: `+${row.contribution}`, state: row.contribution > 0 ? "updated" : "muted" },
        { value: row.answerAfter, state: row.contribution > 0 ? "answer" : "info" },
      ],
    });

    if (queryRowCount === 0) {
      return {
        title: bi("Terminal và đóng góp truy vấn", "Terminal counts and query contributions"),
        columns: [
          bi("Cặp", "Pair"),
          bi("Node", "Node"),
          "terminal",
          bi("Đóng góp", "Contribution"),
          bi("Đáp án chạy", "Running answer"),
        ],
        rows: [{
          label: "—",
          state: "pending",
          cells: [bi("Chưa truy vấn", "Not queried yet"), "—", "—", "—", runningAnswer],
        }],
      };
    }

    const hiddenRows = Math.max(
      0,
      queryRowCount - queryHeadRows.length - queryTailRows.length,
    );
    const rows = queryHeadRows.map(toTableRow);
    if (hiddenRows > 0) {
      rows.push({
        label: bi(`${hiddenRows} depth ẩn`, `${hiddenRows} hidden depths`),
        state: "muted",
        cells: ["…", "…", "…", "…", "…"],
      });
    }
    rows.push(...queryTailRows.map(toTableRow));

    return {
      title: bi("Terminal và đóng góp truy vấn", "Terminal counts and query contributions"),
      columns: [
        bi("Cặp", "Pair"),
        bi("Node", "Node"),
        "terminal",
        bi("Đóng góp", "Contribution"),
        bi("Đáp án chạy", "Running answer"),
      ],
      rows: rows.slice(0, LIMITS_3045.maxTableRows),
    };
  }

  function pairSequence() {
    if (currentWordIndex === null) {
      return [{
        label: bi("Cặp ký tự", "Character pair"),
        value: "—",
        state: "pending",
      }];
    }

    const depths = selectedPairDepths(currentWord.length, currentDepth);
    const sequence = depths.map((depth) => {
      let state = "pending";
      if (currentMode === "result" || currentMode === "terminal") {
        state = depth === currentWord.length - 1 ? "success" : "computed";
      } else if (currentMode === "insert") {
        if (depth < currentDepth) state = "visited";
        if (depth === currentDepth) state = currentEdgeCreated ? "updated" : "active";
      } else if (currentMode === "query" || currentMode === "query-summary") {
        if (currentDepth !== null && depth < currentDepth) state = "visited";
        if (depth === currentDepth) state = currentPairMissing ? "warning" : "active";
      }
      return {
        label: bi(`độ sâu ${depth}`, `depth ${depth}`),
        value: `(${currentWord[depth]}, ${currentWord[currentWord.length - 1 - depth]})`,
        state,
      };
    });

    if (depths.length < currentWord.length) {
      sequence.push({
        label: bi("Cặp chưa hiển thị", "Hidden pairs"),
        value: `+${currentWord.length - depths.length}`,
        state: "muted",
      });
    }
    return sequence;
  }

  function visibleNodeIds() {
    const selected = new Set([0]);
    let cursor = currentNode;
    const pathTail = [];
    while (cursor !== null && pathTail.length < LIMITS_3045.maxGraphNodes - 1) {
      pathTail.push(cursor);
      cursor = nodes[cursor].parent;
    }
    pathTail.reverse().forEach((nodeId) => {
      if (selected.size < LIMITS_3045.maxGraphNodes) selected.add(nodeId);
    });

    for (
      let index = terminalNodeIds.length - 1;
      index >= 0 && selected.size < LIMITS_3045.maxGraphNodes;
      index -= 1
    ) {
      selected.add(terminalNodeIds[index]);
    }
    for (let nodeId = 1; nodeId < nodes.length && selected.size < LIMITS_3045.maxGraphNodes; nodeId += 1) {
      selected.add(nodeId);
    }

    return [...selected].sort((left, right) => {
      const depthDifference = nodes[left].depth - nodes[right].depth;
      return depthDifference || left - right;
    });
  }

  function trieGraph() {
    const visible = visibleNodeIds();
    const visibleSet = new Set(visible);
    const levels = [];
    let previousDepth = null;
    visible.forEach((nodeId) => {
      const depth = nodes[nodeId].depth;
      if (depth !== previousDepth) {
        levels.push([]);
        previousDepth = depth;
      }
      levels.at(-1).push(nodeId);
    });

    return {
      layout: "tree",
      nodes: visible.map((nodeId) => {
        const node = nodes[nodeId];
        let state = node.terminal > 0 ? "success" : "computed";
        if (activePath.has(nodeId)) state = "path";
        if (nodeId === currentNode) state = currentEdgeCreated ? "updated" : "active";
        if (nodeId === 0 && currentWordIndex === null) state = "base";
        return {
          id: nodeId,
          label: nodeId === 0 ? bi("gốc", "root") : `n${nodeId}`,
          sub: nodeId === 0
            ? bi(`${insertedWords} từ trước`, `${insertedWords} prior words`)
            : bi(`d=${node.depth} · cuối=${node.terminal}`, `d=${node.depth} · terminal=${node.terminal}`),
          state,
        };
      }),
      edges: visible
        .filter((nodeId) => nodeId !== 0 && visibleSet.has(nodes[nodeId].parent))
        .slice(-LIMITS_3045.maxGraphEdges)
        .map((nodeId) => {
          const node = nodes[nodeId];
          let state = activePath.has(nodeId) ? "path" : "computed";
          if (nodeId === currentNode && node.parent === currentParent) {
            state = currentEdgeCreated ? "updated" : "active";
          }
          return {
            u: node.parent,
            v: nodeId,
            label: pairedLabel(node.pairKey),
            directed: true,
            state,
          };
        }),
      levels,
    };
  }

  function emit(options) {
    return tracer.emit({
      phaseIndex: options.phaseIndex,
      title: options.title,
      note: options.note,
      action: options.action,
      formula: options.formula,
      codeLines: options.codeLines,
      vars: [
        { name: "j", value: currentWordIndex === null ? "—" : currentWordIndex },
        { name: bi("từ hiện tại", "current word"), value: currentWordIndex === null ? "—" : compactWord(currentWord) },
        { name: bi("độ sâu", "depth"), value: currentDepth === null ? "—" : currentDepth },
        { name: bi("cặp", "pair"), value: currentPairKey === null ? "—" : pairedLabel(currentPairKey) },
        { name: bi("đóng góp của từ", "word contribution"), value: currentContribution },
        { name: bi("đáp án chạy", "running answer"), value: runningAnswer },
      ],
      arr: displayedIndices,
      sub: displayedWords,
      highlight: currentWordIndex !== null && currentWordIndex < displayedWordCount
        ? [currentWordIndex]
        : [],
      mark: displayedIndices.filter((index) => index < insertedWords),
      graph: trieGraph(),
      table: queryTable(),
      sequence: pairSequence(),
      metrics: [
        { label: bi("Số từ", "Words"), value: words.length },
        { label: bi("Tổng ký tự", "Total characters"), value: totalCharacters },
        { label: bi("Từ đã chèn", "Inserted words"), value: insertedWords, state: "computed" },
        { label: bi("Node trie", "Trie nodes"), value: nodes.length, state: "info" },
        { label: bi("Đóng góp hiện tại", "Current contribution"), value: currentContribution, state: "updated" },
        { label: bi("Đáp án chạy", "Running answer"), value: runningAnswer, state: "answer" },
      ],
      legend: [
        { label: bi("Đường cặp đang đi", "Current paired path"), state: "path" },
        { label: bi("Node/cặp đang xét", "Active node/pair"), state: "active" },
        { label: bi("Cạnh vừa tạo", "Newly created edge"), state: "updated" },
        { label: bi("Node có terminal > 0", "Node with terminal > 0"), state: "success" },
        { label: bi("Cặp không tồn tại", "Missing pair"), state: "warning" },
      ],
      final: Boolean(options.final),
      answer: options.final ? runningAnswer : null,
    });
  }

  function emitPairFrame(traceWord, options) {
    if (!traceWord || tracedPairFrames >= LIMITS_3045.maxPairFrames) {
      if (traceWord) tracer.truncate();
      return false;
    }
    tracedPairFrames += 1;
    return emit(options);
  }

  emit({
    phaseIndex: 0,
    title: bi("Trie bắt đầu chỉ có node gốc", "The trie starts with only its root"),
    note: bi(
      "Mỗi cạnh sẽ lưu một cặp (word[d], word[len−1−d]); terminal đếm số từ trước kết thúc tại node.",
      "Each edge stores (word[d], word[len−1−d]); terminal counts prior words ending at the node.",
    ),
    action: bi("Khởi tạo root, answer = 0.", "Initialize root and answer = 0."),
    formula: bi("key[d] = (word[d], word[len−1−d])", "key[d] = (word[d], word[len−1−d])"),
    codeLines: [10, 11],
  });

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    currentWordIndex = wordIndex;
    currentWord = words[wordIndex];
    currentContribution = 0;
    currentDepth = null;
    currentNode = 0;
    currentParent = null;
    currentPairKey = null;
    currentMode = "query";
    currentPairMissing = false;
    currentEdgeCreated = false;
    queryStoppedAtMissing = false;
    activePath = new Set([0]);
    resetQueryRows();

    const traceWord = wordIndex < LIMITS_3045.maxTracedWords;
    if (traceWord) {
      emit({
        phaseIndex: 1,
        title: bi(`Truy vấn words[${wordIndex}] = "${currentWord}"`, `Query words[${wordIndex}] = "${currentWord}"`),
        note: bi(
          `Trie hiện chỉ chứa ${insertedWords} từ có index nhỏ hơn ${wordIndex}, nên mọi terminal tìm thấy đều thỏa i < j.`,
          `The trie currently contains only ${insertedWords} words with indices below ${wordIndex}, so every terminal found satisfies i < j.`,
        ),
        action: bi("Bắt đầu tại root và đọc chuỗi cặp ký tự.", "Start at the root and read the character-pair sequence."),
        formula: bi("node = root", "node = root"),
        codeLines: [13, 14],
      });
    }

    let queryNode = 0;
    for (let depth = 0; depth < currentWord.length; depth += 1) {
      const key = pairedKey(currentWord, depth);
      const parentId = queryNode;
      const nextNode = nodes[parentId].children.get(key);
      currentDepth = depth;
      currentParent = parentId;
      currentPairKey = key;
      currentEdgeCreated = false;

      if (nextNode === undefined) {
        currentNode = parentId;
        currentPairMissing = true;
        queryStoppedAtMissing = true;
        appendQueryRow({
          depth,
          pair: pairedLabel(key),
          nodeId: null,
          terminal: 0,
          contribution: 0,
          answerAfter: runningAnswer,
          missing: true,
        });
        emitPairFrame(traceWord, {
          phaseIndex: 1,
          title: bi(`Không có cạnh ${pairedLabel(key)}`, `No ${pairedLabel(key)} edge`),
          note: bi(
            "Không từ nào đã chèn có thể khớp tiếp đường cặp này, nên truy vấn dừng; phần chèn vẫn chạy đầy đủ sau đó.",
            "No inserted word can continue along this paired path, so the query stops; the insertion still runs fully afterward.",
          ),
          action: bi("Dừng truy vấn tại cạnh bị thiếu.", "Stop the query at the missing edge."),
          formula: bi("pair ∉ node.children ⇒ break", "pair ∉ node.children ⇒ break"),
          codeLines: [15, 16, 17, 18],
        });
        break;
      }

      queryNode = nextNode;
      currentNode = queryNode;
      currentPairMissing = false;
      activePath.add(queryNode);
      const terminal = nodes[queryNode].terminal;
      runningAnswer += terminal;
      currentContribution += terminal;
      appendQueryRow({
        depth,
        pair: pairedLabel(key),
        nodeId: queryNode,
        terminal,
        contribution: terminal,
        answerAfter: runningAnswer,
        missing: false,
      });
      emitPairFrame(traceWord, {
        phaseIndex: terminal > 0 ? 2 : 1,
        title: terminal > 0
          ? bi(`terminal = ${terminal}: cộng ${terminal}`, `terminal = ${terminal}: add ${terminal}`)
          : bi(`Đi qua n${queryNode}; terminal = 0`, `Visit n${queryNode}; terminal = 0`),
        note: terminal > 0
          ? bi(
            `Có ${terminal} từ trước kết thúc tại depth ${depth + 1}; mỗi từ là cả prefix lẫn suffix của words[${wordIndex}].`,
            `${terminal} prior word(s) end at depth ${depth + 1}; each is both a prefix and a suffix of words[${wordIndex}].`,
          )
          : bi(
            "Cặp khớp nhưng chưa có từ trước nào kết thúc ở node này.",
            "The pair matches, but no prior word ends at this node.",
          ),
        action: bi("Đi theo cạnh rồi cộng terminal vào answer.", "Follow the edge, then add terminal to answer."),
        formula: bi(`answer += ${terminal} → ${runningAnswer}`, `answer += ${terminal} → ${runningAnswer}`),
        codeLines: [15, 16, 19, 20],
      });
    }

    currentMode = "query-summary";
    if (traceWord) {
      emit({
        phaseIndex: 2,
        title: bi(
          `words[${wordIndex}] đóng góp ${currentContribution}`,
          `words[${wordIndex}] contributes ${currentContribution}`,
        ),
        note: queryStoppedAtMissing
          ? bi(
            "Đường truy vấn dừng ở cặp đầu tiên chưa tồn tại; mọi terminal trước điểm đó đã được cộng.",
            "The query path stopped at its first missing pair; every terminal before that point was accumulated.",
          )
          : bi(
            "Toàn bộ đường cặp đã tồn tại; terminal ở mọi depth đã được cộng, kể cả multiplicity của từ trùng.",
            "The full paired path existed; terminals at every depth were accumulated, including duplicate-word multiplicity.",
          ),
        action: bi("Chốt đóng góp truy vấn trước khi thay đổi trie.", "Finalize the query contribution before mutating the trie."),
        formula: bi(`answer = ${runningAnswer}`, `answer = ${runningAnswer}`),
        codeLines: [13, 14, 15, 20],
      });
    }

    let insertNode = 0;
    currentMode = "insert";
    currentPairMissing = false;
    activePath = new Set([0]);
    for (let depth = 0; depth < currentWord.length; depth += 1) {
      const key = pairedKey(currentWord, depth);
      const parentId = insertNode;
      let nextNode = nodes[parentId].children.get(key);
      const created = nextNode === undefined;
      if (created) {
        nextNode = nodes.length;
        nodes.push({
          id: nextNode,
          parent: parentId,
          pairKey: key,
          depth: nodes[parentId].depth + 1,
          terminal: 0,
          children: new Map(),
        });
        nodes[parentId].children.set(key, nextNode);
        if (nodes.length > LIMITS_3045.maxGraphNodes) tracer.truncate();
      }

      insertNode = nextNode;
      activePath.add(insertNode);
      currentDepth = depth;
      currentNode = insertNode;
      currentParent = parentId;
      currentPairKey = key;
      currentPairMissing = false;
      currentEdgeCreated = created;
      emitPairFrame(traceWord, {
        phaseIndex: 3,
        title: created
          ? bi(`Tạo cạnh ${pairedLabel(key)} tới n${insertNode}`, `Create ${pairedLabel(key)} edge to n${insertNode}`)
          : bi(`Dùng lại cạnh ${pairedLabel(key)} tới n${insertNode}`, `Reuse ${pairedLabel(key)} edge to n${insertNode}`),
        note: created
          ? bi(
            "Node mới thuộc đường của từ hiện tại và có terminal = 0.",
            "The new node belongs to the current word's path and starts with terminal = 0.",
          )
          : bi(
            "Đường cặp này đã được tạo bởi một từ trước; chưa tăng terminal cho tới cuối từ.",
            "A prior word already created this paired path; terminal is not incremented until the word ends.",
          ),
        action: bi("Tạo hoặc dùng lại child theo cặp ký tự.", "Create or reuse the child keyed by the character pair."),
        formula: bi("node = node.children.setdefault(pair, TrieNode())", "node = node.children.setdefault(pair, TrieNode())"),
        codeLines: [22, 23, 24, 25, 26, 27],
      });
    }

    const wasTerminal = nodes[insertNode].terminal > 0;
    if (!wasTerminal) terminalNodeIds.push(insertNode);
    nodes[insertNode].terminal += 1;
    insertedWords += 1;
    currentMode = "terminal";
    currentDepth = currentWord.length - 1;
    currentNode = insertNode;
    currentParent = nodes[insertNode].parent;
    currentPairKey = nodes[insertNode].pairKey;
    currentPairMissing = false;
    currentEdgeCreated = false;

    if (traceWord) {
      emit({
        phaseIndex: 4,
        title: bi(
          `terminal(n${insertNode}) = ${nodes[insertNode].terminal}`,
          `terminal(n${insertNode}) = ${nodes[insertNode].terminal}`,
        ),
        note: wasTerminal
          ? bi(
            "Từ trùng kết thúc tại cùng node; tăng terminal giữ đúng multiplicity cho các truy vấn tương lai.",
            "A duplicate ends at the same node; incrementing terminal preserves multiplicity for future queries.",
          )
          : bi(
            "Chỉ sau khi truy vấn xong mới đánh dấu từ hiện tại, nên nó không bao giờ tự ghép cặp với chính nó.",
            "The current word is marked only after its query, so it can never pair with itself.",
          ),
        action: bi("Tăng terminal đúng một lần cho words[j].", "Increment terminal exactly once for words[j]."),
        formula: bi(`terminal += 1 → ${nodes[insertNode].terminal}`, `terminal += 1 → ${nodes[insertNode].terminal}`),
        codeLines: [28],
      });
    }
  }

  const terminalMultiplicity = terminalNodeIds.reduce(
    (total, nodeId) => total + nodes[nodeId].terminal,
    0,
  );
  if (terminalMultiplicity !== words.length || insertedWords !== words.length) {
    throw new Error("#3045: trie terminal multiplicity invariant failed");
  }
  if (!Number.isSafeInteger(runningAnswer) || runningAnswer < 0
    || runningAnswer > (words.length * (words.length - 1)) / 2) {
    throw new Error("#3045: pair-count invariant failed");
  }

  currentMode = "result";
  currentPairMissing = false;
  currentEdgeCreated = false;
  emit({
    phaseIndex: 5,
    title: bi(`Có ${runningAnswer} cặp hợp lệ`, `${runningAnswer} valid pairs`),
    note: tracer.truncated
      ? bi(
        "Trace hoặc preview trie đã được rút gọn, nhưng mọi từ và mọi cặp ký tự vẫn được truy vấn rồi chèn đầy đủ.",
        "The trace or trie preview was shortened, but every word and character pair was still fully queried and inserted.",
      )
      : bi(
        "Vì mỗi words[j] được truy vấn trước khi chèn, tổng terminal chỉ đếm các cặp (i, j) với i < j.",
        "Because each words[j] is queried before insertion, accumulated terminals count only pairs (i, j) with i < j.",
      ),
    action: bi("Trả tổng đóng góp terminal.", "Return the accumulated terminal contributions."),
    formula: bi(`answer = ${runningAnswer}`, `answer = ${runningAnswer}`),
    codeLines: [30],
    final: true,
  });

  return {
    original: [...words],
    answer: runningAnswer,
    steps: tracer.finish(),
  };
}

module.exports = {
  3045: {
    id: 3045,
    difficulty: "hard",
    slug: "count-prefix-and-suffix-pairs-ii",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    tags: [
      { key: "trie", vi: "Trie", en: "Trie" },
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "prefix-suffix", vi: "Tiền tố và hậu tố", en: "Prefix and Suffix" },
      { key: "counting", vi: "Đếm", en: "Counting" },
    ],
    title: bi("Đếm cặp tiền tố và hậu tố II", "Count Prefix and Suffix Pairs II"),
    titleVi: bi(
      "Đếm cặp bằng trie cặp ký tự",
      "Count pairs with a paired-character trie",
    ),
    statement: bi(
      "Đếm các cặp chỉ số (i, j), i < j, sao cho words[i] vừa là tiền tố vừa là hậu tố của words[j].",
      "Count index pairs (i, j), i < j, where words[i] is both a prefix and a suffix of words[j].",
    ),
    defaultInput: [...DEFAULT_WORDS_3045],
    defaults: { input: [...DEFAULT_WORDS_3045] },
    expectedOutput: 4,
    inputKind: "stringArray",
    inputLabel: bi("words (các chuỗi chữ thường a-z)", "words (lowercase a-z strings)"),
    extraParams: [],
    visualizationLimits: { ...LIMITS_3045 },
    approach: [
      bi(
        "Biểu diễn mỗi depth d bằng cặp (word[d], word[len−1−d]); một đường trie đồng thời mã hóa prefix từ trái và suffix từ phải.",
        "Represent depth d by (word[d], word[len−1−d]); one trie path simultaneously encodes a left prefix and a right suffix.",
      ),
      bi(
        "Trước khi chèn words[j], đi trên trie chỉ chứa words[0..j−1] và cộng terminal ở mỗi node khớp.",
        "Before inserting words[j], walk the trie containing only words[0..j−1] and add every matched node's terminal count.",
      ),
      bi(
        "Sau truy vấn, chèn toàn bộ chuỗi cặp và tăng terminal ở node cuối; thứ tự này đảm bảo i < j.",
        "After the query, insert the full pair sequence and increment the final node's terminal count; this ordering guarantees i < j.",
      ),
      bi(
        "terminal là multiplicity, nên các từ trùng nhau được đếm riêng mà không cần xử lý đặc biệt.",
        "terminal stores multiplicity, so duplicate words are counted separately without special handling.",
      ),
    ],
    complexity: {
      time: "O(L)",
      space: "O(L)",
      note: bi(
        "L là tổng độ dài các từ. Thuật toán xử lý đầy đủ L cặp khi truy vấn/chèn; chỉ frame, node graph, hàng bảng và sequence hiển thị bị giới hạn.",
        "L is the total word length. The algorithm fully processes all L query/insertion pairs; only emitted frames, graph nodes, table rows, and displayed sequence items are bounded.",
      ),
    },
    code: SOURCE_3045,
    debugMode: "semantic",
    parser: parseCountPrefixSuffixPairs3045Input,
    parseCountPrefixSuffixPairs3045Input,
    liveArgs: (input, params = {}) => {
      const parsed = parseCountPrefixSuffixPairs3045Input(input, params);
      return [[...parsed.words]];
    },
    builder: buildSteps3045,
  },
};
