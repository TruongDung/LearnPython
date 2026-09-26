const label = (vi, en) => ({ vi, en });
const TRACE_WORDS = 8;
const TRACE_CHARS = 40;
const PREVIEW_NODES = 28;
const PREVIEW_DEPTH = 8;

function parseWords2416(input) {
  let words = input;
  if (typeof input === "string") {
    const raw = input.trim();
    if (raw.startsWith("[")) {
      try {
        words = JSON.parse(raw);
      } catch (_error) {
        throw new Error("words must be valid JSON or comma-separated lowercase words");
      }
    } else {
      words = raw.split(/[,;]/).map((word) => word.trim());
    }
  }
  if (!Array.isArray(words) || words.length < 1 || words.length > 1000
    || !words.every((word) => typeof word === "string" && word.length >= 1
      && word.length <= 1000 && /^[a-z]+$/.test(word))) {
    throw new Error("words must contain 1..1000 lowercase a-z words, each 1..1000 letters long");
  }
  return words;
}

function buildSteps2416(input) {
  const words = parseWords2416(input);
  const totalChars = words.reduce((sum, word) => sum + word.length, 0);
  const nodes = [{ id: 0, char: "", parent: null, depth: 0, count: 0, children: new Map() }];
  const steps = [];
  const answer = [];
  let node = null;
  let wordIndex = null;
  let charIndex = null;
  let ch = null;
  let nextNode = null;
  let total = null;
  let addedCount = null;

  function pathFor(current) {
    const path = [];
    for (let cursor = current; cursor !== null; cursor = nodes[cursor].parent) path.push(cursor);
    return path.reverse();
  }

  function prefixFor(current) {
    return pathFor(current).slice(1).map((id) => nodes[id].char).join("");
  }

  function record(phase, title, line, note, final = false) {
    const word = wordIndex === null ? null : words[wordIndex];
    const path = node === null ? [] : pathFor(node);
    const visible = nodes.slice(0, PREVIEW_NODES).filter((item) => item.depth <= PREVIEW_DEPTH);
    const vars = [{ name: "words", value: words.length }, { name: "trie_nodes", value: nodes.length }];
    if (wordIndex !== null) vars.push({ name: "i", value: wordIndex }, { name: "word", value: word });
    if (ch !== null) vars.push({ name: "ch", value: ch });
    if (node !== null) vars.push({ name: "node.count", value: nodes[node].count });
    if (total !== null) vars.push({ name: "total", value: total });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note, final,
      prefixScores2416View: {
        phase, words: words.slice(0, TRACE_WORDS), wordCount: words.length, totalChars,
        wordIndex, word,
        charIndex, ch, currentNode: node, nextNode,
        currentPrefix: node === null ? "" : prefixFor(node),
        nextPrefix: word !== null && charIndex !== null ? word.slice(0, charIndex + 1) : "",
        activePath: path, count: node === null ? null : nodes[node].count,
        addedCount, total, answer: [...answer], nodeCount: nodes.length,
        nodes: visible.map((item) => ({
          id: item.id, parent: item.parent, char: item.char, depth: item.depth,
          prefix: prefixFor(item.id), count: item.count,
        })),
        shortened: words.length > TRACE_WORDS || totalChars > TRACE_CHARS
          || nodes.length > PREVIEW_NODES,
      },
    });
  }

  record("enter", label("Vào hàm sumPrefixScores", "Enter sumPrefixScores"), 6,
    label("Điểm của một prefix là số từ trong input bắt đầu bằng prefix đó.",
      "A prefix's score is the number of input words starting with it."));
  node = 0;
  record("root", label("Tạo gốc Trie", "Create Trie root"), 7,
    label("Mỗi nút con sẽ lưu số từ đi qua prefix của nút đó.",
      "Each child node counts the words passing through its prefix."));

  let tracedBuildChars = 0;
  for (let i = 0; i < words.length; i++) {
    wordIndex = i;
    charIndex = null;
    ch = null;
    nextNode = null;
    node = 0;
    const traceWord = i < TRACE_WORDS && tracedBuildChars < TRACE_CHARS;
    if (traceWord) record("build-word", label(`Chèn "${words[i]}"`, `Insert "${words[i]}"`), 8,
      label("Bắt đầu thêm từ này vào Trie.", "Start inserting this word into the Trie."));
    if (traceWord) record("build-root", label("node = root", "node = root"), 9,
      label("Mỗi từ đều bắt đầu từ gốc.", "Every word starts at the root."));
    for (let j = 0; j < words[i].length; j++) {
      charIndex = j;
      ch = words[i][j];
      nextNode = nodes[node].children.get(ch) ?? null;
      const trace = i < TRACE_WORDS && tracedBuildChars < TRACE_CHARS;
      if (trace) record("build-char", label(`Ký tự '${ch}'`, `Character '${ch}'`), 10,
        label(`Prefix đang xây: "${words[i].slice(0, j + 1)}".`,
          `Building prefix "${words[i].slice(0, j + 1)}".`));
      const missing = nextNode === null;
      if (trace) record("check-child", label(missing ? `Chưa có cạnh '${ch}'` : `Đã có cạnh '${ch}'`,
        missing ? `Missing '${ch}' edge` : `Existing '${ch}' edge`), 11,
      missing
        ? label("Tạo nút mới cho prefix này.", "Create a node for this prefix.")
        : label("Dùng lại nút prefix đã có.", "Reuse the existing prefix node."));
      if (missing) {
        nextNode = nodes.length;
        nodes.push({ id: nextNode, char: ch, parent: node, depth: nodes[node].depth + 1,
          count: 0, children: new Map() });
        nodes[node].children.set(ch, nextNode);
        if (trace) record("create-child", label(`Tạo nút "${words[i].slice(0, j + 1)}"`,
          `Create node "${words[i].slice(0, j + 1)}"`), 12,
        label("Nút mới có count = 0 trước khi từ hiện tại đi qua.",
          "A new node starts at count = 0 before this word passes through."));
      }
      node = nextNode;
      if (trace) record("move-build", label(`Đi tới "${words[i].slice(0, j + 1)}"`,
        `Move to "${words[i].slice(0, j + 1)}"`), 13,
      label("Nút hiện tại đại diện cho prefix vừa đọc.",
        "The current node represents the prefix just read."));
      nodes[node].count++;
      if (trace) record("count", label(`count("${words[i].slice(0, j + 1)}") = ${nodes[node].count}`,
        `count("${words[i].slice(0, j + 1)}") = ${nodes[node].count}`), 14,
      label("Tăng 1 vì từ này có prefix tương ứng.",
        "Add one because this word has the current prefix."));
      tracedBuildChars++;
    }
  }

  wordIndex = null;
  charIndex = null;
  ch = null;
  nextNode = null;
  node = null;
  record("answer-init", label("Tạo mảng kết quả", "Initialize answer array"), 15,
    label("Trie đã lưu điểm của từng prefix; giờ cộng các điểm theo mỗi từ.",
      "The Trie now holds every prefix score; sum them for each word."));

  let tracedQueryChars = 0;
  for (let i = 0; i < words.length; i++) {
    wordIndex = i;
    charIndex = null;
    ch = null;
    nextNode = null;
    node = null;
    total = null;
    addedCount = null;
    const traceWord = i < TRACE_WORDS && tracedQueryChars < TRACE_CHARS;
    if (traceWord) record("score-word", label(`Tính điểm "${words[i]}"`,
      `Score "${words[i]}"`), 16,
    label("Duyệt lại đường prefix của từ trong Trie đã hoàn chỉnh.",
      "Walk this word's prefix path through the completed Trie."));
    node = 0;
    if (traceWord) record("score-root", label("node = root", "node = root"), 17,
      label("Bắt đầu cộng từ nút gốc.", "Start the sum at the root."));
    total = 0;
    if (traceWord) record("total-init", label("total = 0", "total = 0"), 18,
      label("Chưa cộng prefix nào của từ này.", "No prefix of this word has been added yet."));
    for (let j = 0; j < words[i].length; j++) {
      charIndex = j;
      ch = words[i][j];
      addedCount = null;
      const trace = i < TRACE_WORDS && tracedQueryChars < TRACE_CHARS;
      if (trace) record("score-char", label(`Ký tự '${ch}'`, `Character '${ch}'`), 19,
        label(`Đi tới prefix "${words[i].slice(0, j + 1)}".`,
          `Move to prefix "${words[i].slice(0, j + 1)}".`));
      node = nodes[node].children.get(ch);
      if (trace) record("move-score", label(`Đọc count("${words[i].slice(0, j + 1)}") = ${nodes[node].count}`,
        `Read count("${words[i].slice(0, j + 1)}") = ${nodes[node].count}`), 20,
      label("Count tại nút là số từ chia sẻ prefix này.",
        "This node's count is the number of words sharing this prefix."));
      addedCount = nodes[node].count;
      total += addedCount;
      if (trace) record("add-score", label(`total += ${addedCount} → ${total}`,
        `total += ${addedCount} → ${total}`), 21,
      label("Cộng điểm prefix này vào tổng của từ.",
        "Add this prefix's score to the word's total."));
      tracedQueryChars++;
    }
    answer.push(total);
    if (traceWord) record("append-answer", label(`answer[${i}] = ${total}`,
      `answer[${i}] = ${total}`), 22,
    label("Đã cộng điểm mọi prefix không rỗng của từ này.",
      "All nonempty prefix scores for this word have been added."));
  }
  wordIndex = null;
  charIndex = null;
  ch = null;
  node = null;
  nextNode = null;
  total = null;
  addedCount = null;
  record("done", label(`Trả về [${answer.join(", ")}]`,
    `Return [${answer.join(", ")}]`), 23,
  label("Mỗi phần tử là tổng count trên đường Trie của từ tương ứng.",
    "Each result sums the counts along its word's Trie path."), true);
  return { original: words, answer, steps };
}

module.exports = {
  2416: {
    id: 2416,
    difficulty: "hard",
    slug: "sum-of-prefix-scores-of-strings",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    tags: [{ key: "trie", vi: "Trie", en: "Trie" },
      { key: "prefix-sum", vi: "Tổng điểm prefix", en: "Prefix scores" }],
    title: label("Sum of Prefix Scores of Strings", "Sum of Prefix Scores of Strings"),
    titleVi: label("Tổng điểm các tiền tố của chuỗi", "Sum of prefix scores of strings"),
    statement: label(
      "Điểm của một prefix là số từ bắt đầu bằng prefix đó. Với mỗi từ, trả tổng điểm của mọi prefix không rỗng.",
      "A prefix's score is the number of words starting with it. For each word, sum the scores of its nonempty prefixes."
    ),
    defaultInput: '["abc","ab","bc","b"]',
    inputKind: "string",
    inputLabel: label("words (JSON hoặc cách nhau dấu phẩy)", "words (JSON or comma-separated)"),
    extraParams: [],
    approach: [
      label("Chèn tất cả từ vào Trie; mỗi lần một từ đi qua nút prefix thì tăng count ở nút đó.",
        "Insert every word into a Trie, incrementing the count of each prefix node it visits."),
      label("Đi lại từng từ trong Trie và cộng count của các nút trên đường đi.",
        "Walk each word again, summing the counts along its Trie path."),
      label("Từ trùng nhau vẫn được chèn nhiều lần vì mỗi bản sao đều góp 1 vào điểm prefix.",
        "Duplicate words are inserted separately because every copy contributes to prefix scores."),
    ],
    complexity: { time: "O(L)", space: "O(L)",
      note: label("L là tổng độ dài mọi từ; mỗi ký tự được đi qua hai lần. Không tính trace minh họa.",
        "L is the total length of all words; each character is visited twice. Teaching trace is excluded.") },
    debugMode: "line-by-line",
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.count = 0",
      "",
      "class Solution:",
      "    def sumPrefixScores(self, words):",
      "        root = TrieNode()",
      "        for word in words:",
      "            node = root",
      "            for ch in word:",
      "                if ch not in node.children:",
      "                    node.children[ch] = TrieNode()",
      "                node = node.children[ch]",
      "                node.count += 1",
      "        answer = []",
      "        for word in words:",
      "            node = root",
      "            total = 0",
      "            for ch in word:",
      "                node = node.children[ch]",
      "                total += node.count",
      "            answer.append(total)",
      "        return answer",
    ],
    builder: buildSteps2416,
    liveArgs(input) { return [parseWords2416(input)]; },
  },
};
