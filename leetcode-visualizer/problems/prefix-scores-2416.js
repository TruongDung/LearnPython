"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
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
];

function parseWords(input) {
  let words = input;
  if (typeof input === "string") {
    const raw = input.trim();
    try { words = raw.startsWith("[") ? JSON.parse(raw) : raw.split(/[,;]/).map(word => word.trim()); }
    catch { throw new Error("#2416: Nhập mảng JSON hoặc các từ cách nhau bằng dấu phẩy / Enter a JSON array or comma-separated words."); }
  }
  if (!Array.isArray(words) || words.length < 1 || words.length > 1000 || words.some(word => typeof word !== "string" || !/^[a-z]{1,1000}$/.test(word))) {
    throw new Error("#2416: 1–1000 từ a–z, mỗi từ 1–1000 ký tự / Use 1–1000 lowercase words, each 1–1000 letters.");
  }
  return [...words];
}

// Large inputs retain the complete O(S) answer without an unbounded debug recording.
function buildSummary(words) {
  const nodes = [{ children: Object.create(null), count: 0 }];
  for (const word of words) {
    let node = 0;
    for (const ch of word) {
      if (!Object.hasOwn(nodes[node].children, ch)) {
        nodes[node].children[ch] = nodes.length;
        nodes.push({ children: Object.create(null), count: 0 });
      }
      node = nodes[node].children[ch]; nodes[node].count++;
    }
  }
  const answer = words.map(word => {
    let node = 0, total = 0;
    for (const ch of word) { node = nodes[node].children[ch]; total += nodes[node].count; }
    return total;
  });
  const preview = [];
  function visit(id, parent, prefix, ch) {
    if (preview.length >= 28 || prefix.length > 8) return;
    preview.push({ id, parent, prefix, ch, count: nodes[id].count, members: [], children: [] });
    for (const [key, child] of Object.entries(nodes[id].children)) visit(child, id, prefix + key, key);
  }
  visit(0, null, "", "root");
  const visible = new Set(preview.map(node => node.id));
  preview.forEach(node => { node.children = Object.values(nodes[node.id].children).filter(id => visible.has(id)); });
  return { original: words, answer, steps: [{ arr: [], codeLines: [], final: true,
    title: bi("Kết quả · dữ liệu lớn", "Result · large input"), note: bi("", ""),
    vars: [{ name: "answer", value: [...answer] }],
    prefixScore2416View: { phase: "done", mode: "summary", words: words.slice(0, 8), wordCount: words.length,
      nodes: preview, nodeCount: nodes.length, wordIndex: null, current: null, path: [], terms: [],
      answer: [...answer], wordResults: [], line: null, source: "", total: null, transition: null, pending: null },
  }] };
}

function buildSteps(input) {
  const words = parseWords(input);
  if (words.length > 8 || words.reduce((sum, word) => sum + word.length, 0) > 40) return buildSummary(words);
  const solution = { kind: "solution" }, locals = { self: solution, words }, frames = [{ scope: "sumPrefixScores", locals }];
  const steps = [], allNodes = [], wordResults = [];
  let root = null, phase = "build", wordIndex = null, terms = [], transition = null;
  const rawNode = node => ({ ...(node.children === null ? {} : { children: Object.fromEntries(Object.entries(node.children).map(([ch, child]) => [ch, rawNode(child)])) }), ...(node.count === null ? {} : { count: node.count }) });
  function pathTo(node) { const result = []; for (let at = node; at; at = at.parent) result.unshift(at.id); return result; }
  function emit(line, event, label, final = false) {
    const frame = frames.at(-1);
    const current = frame.locals.self?.kind === "node" ? frame.locals.self : locals.node || root;
    const reachable = [];
    function visit(node) {
      reachable.push({ id: node.id, parent: node.parent?.id ?? null, ch: node.ch, prefix: node.prefix, count: node.count,
        members: [...node.members], children: Object.values(node.children || {}).map(child => child.id) });
      Object.values(node.children || {}).forEach(visit);
    }
    if (root) visit(root);
    const vars = Object.entries(frame.locals).map(([name, value]) => value?.kind ? {
      name, value: value.kind === "node" ? `TrieNode(${JSON.stringify(value.prefix || "root")})` : "Solution",
      rawValue: value.kind === "node" ? rawNode(value) : {},
    } : { name, value: Array.isArray(value) ? [...value] : value });
    steps.push({ arr: [], codeBlock: 1, codeLines: [line], final,
      title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), note: bi("", ""), vars,
      prefixScore2416View: { line, source: CODE[line - 1].trim(), event, scope: frame.scope, phase: final ? "done" : phase,
        mode: "trace", words: [...words], wordCount: words.length, wordIndex: final ? null : wordIndex,
        nodes: reachable, nodeCount: allNodes.length, current: current?.id ?? null, path: current ? pathTo(current) : [],
        pending: current && !reachable.some(node => node.id === current.id) ? { ch: current.ch, prefix: current.prefix } : null,
        terms: terms.map(term => ({ ...term })), total: phase === "score" ? locals.total ?? null : null,
        transition: transition && { ...transition }, answer: locals.answer ? [...locals.answer] : [],
        wordResults: wordResults.map(result => ({ ...result, terms: result.terms.map(term => ({ ...term })) })) },
    });
  }
  function makeNode(ch, parent) {
    const node = { kind: "node", id: allNodes.length, parent, ch, prefix: parent ? parent.prefix + ch : "", children: null, count: null, members: [] };
    allNodes.push(node);
    frames.push({ scope: "TrieNode.__init__", locals: { self: node } });
    node.children = Object.create(null); emit(3, "children-init", bi("children = {}", "children = {}"));
    node.count = 0; emit(4, "count-init", bi("count = 0", "count = 0"));
    frames.pop(); return node;
  }
  root = makeNode("root", null); locals.root = root;
  emit(8, "root", bi("Tạo root", "Create root"));
  words.forEach((word, index) => {
    wordIndex = index; locals.word = word; transition = null;
    emit(9, "build-word", bi(`Thêm ${word}`, `Insert ${word}`));
    locals.node = root; emit(10, "build-root", bi("node → root", "node → root"));
    for (const ch of word) {
      locals.ch = ch; transition = null;
      emit(11, "build-char", bi(`Đọc '${ch}'`, `Read '${ch}'`));
      const missing = !Object.hasOwn(locals.node.children, ch);
      emit(12, "check-child", bi(missing ? `Thiếu cạnh '${ch}'` : `Dùng lại '${ch}'`, missing ? `Missing '${ch}' edge` : `Reuse '${ch}'`));
      if (missing) {
        locals.node.children[ch] = makeNode(ch, locals.node);
        emit(13, "create", bi(`Tạo prefix ${word.slice(0, locals.node.prefix.length + 1)}`, `Create prefix ${word.slice(0, locals.node.prefix.length + 1)}`));
      }
      locals.node = locals.node.children[ch];
      emit(14, "build-move", bi(`node → ${locals.node.prefix}`, `node → ${locals.node.prefix}`));
      const before = locals.node.count;
      locals.node.count++; locals.node.members.push(index);
      transition = { id: locals.node.id, before, after: locals.node.count };
      emit(15, "increment", bi(`count(${locals.node.prefix}): ${before} → ${locals.node.count}`, `count(${locals.node.prefix}): ${before} → ${locals.node.count}`));
    }
    transition = null; emit(11, "build-inner-end", bi("Hết ký tự", "No more characters"));
  });
  emit(9, "build-outer-end", bi("Đã đếm mọi prefix", "All prefix counts built"));
  phase = "score"; wordIndex = null; locals.answer = [];
  emit(16, "answer-init", bi("answer = []", "answer = []"));
  words.forEach((word, index) => {
    wordIndex = index; locals.word = word; terms = [];
    emit(17, "score-word", bi(`Tính điểm ${word}`, `Score ${word}`));
    locals.node = root; emit(18, "score-root", bi("node → root", "node → root"));
    locals.total = 0; emit(19, "total-init", bi("total = 0", "total = 0"));
    for (const ch of word) {
      locals.ch = ch; emit(20, "score-char", bi(`Đọc '${ch}'`, `Read '${ch}'`));
      locals.node = locals.node.children[ch];
      emit(21, "score-move", bi(`${locals.node.prefix} · count ${locals.node.count}`, `${locals.node.prefix} · count ${locals.node.count}`));
      locals.total += locals.node.count;
      terms.push({ id: locals.node.id, prefix: locals.node.prefix, count: locals.node.count });
      emit(22, "add-score", bi(`total += ${locals.node.count} → ${locals.total}`, `total += ${locals.node.count} → ${locals.total}`));
    }
    emit(20, "score-inner-end", bi("Hết ký tự", "No more characters"));
    locals.answer.push(locals.total);
    wordResults.push({ word, total: locals.total, terms: terms.map(term => ({ ...term })) });
    emit(23, "append", bi(`answer[${index}] = ${locals.total}`, `answer[${index}] = ${locals.total}`));
  });
  emit(17, "score-outer-end", bi("Đã tính mọi từ", "All word scores computed"));
  emit(24, "done", bi(`Trả về [${locals.answer.join(", ")}]`, `Return [${locals.answer.join(", ")}]`), true);
  return { original: words, answer: [...locals.answer], steps };
}

module.exports = { 2416: {
  id: 2416, difficulty: "hard", slug: "sum-of-prefix-scores-of-strings",
  category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
  tags: [{ key: "prefix-sum", vi: "Tổng điểm prefix", en: "Prefix scores" }],
  title: bi("Sum of Prefix Scores of Strings", "Sum of Prefix Scores of Strings"),
  titleVi: bi("Điểm prefix · Đếm rồi cộng", "Prefix scores · Count, then sum"),
  statement: bi("Mỗi prefix được bao nhiêu từ dùng chung? Cộng các số đếm đó cho từng từ. Ví dụ abc: 2 + 2 + 1 = 5.", "How many words share each prefix? Sum those counts for each word. Example abc: 2 + 2 + 1 = 5."),
  defaultInput: '["abc","ab","bc","b"]', inputKind: "string",
  inputLabel: bi("words · JSON hoặc cách nhau dấu phẩy", "words · JSON or comma-separated"), extraParams: [],
  approach: [bi("Xây Trie: mỗi từ đi qua → count +1", "Build Trie: each passing word → count +1"), bi("Tính điểm: cộng count trên đường đi · không cộng root", "Score: sum path counts · exclude root")],
  complexity: { time: "O(S)", space: "O(S)", note: bi("S = tổng ký tự. Debug đầy đủ khi ≤8 từ và ≤40 ký tự; dữ liệu lớn vẫn tính toàn bộ kết quả.", "S = total characters. Full debug for ≤8 words and ≤40 characters; larger inputs still compute every result.") },
  debugMode: "line-by-line", code: CODE, builder: buildSteps, liveArgs: input => [parseWords(input)],
} };
