"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class TrieNode:",
  "    def __init__(self):",
  "        self.children = {}",
  "        self.is_word = False",
  "",
  "class WordDictionary:",
  "    def __init__(self):",
  "        self.root = TrieNode()",
  "",
  "    def addWord(self, word):",
  "        node = self.root",
  "        for ch in word:",
  "            if ch not in node.children:",
  "                node.children[ch] = TrieNode()",
  "            node = node.children[ch]",
  "        node.is_word = True",
  "",
  "    def search(self, word):",
  "        def dfs(node, i):",
  "            if i == len(word):",
  "                return node.is_word",
  "            if word[i] == '.':",
  "                for child in node.children.values():",
  "                    if dfs(child, i + 1):",
  "                        return True",
  "                return False",
  "            if word[i] not in node.children:",
  "                return False",
  "            return dfs(node.children[word[i]], i + 1)",
  "        return dfs(self.root, 0)",
];

function parseInput(input, params = {}) {
  if (typeof input !== "string") throw new Error("#211: Nhập các từ cách nhau bằng dấu phẩy / Enter comma-separated words.");
  const words = input.split(",").map(word => word.trim());
  const pattern = String(params.search ?? ".ad").trim();
  if (words.length < 1 || words.length > 10 || words.some(word => !/^[a-z]{1,10}$/.test(word))) {
    throw new Error("#211: Mô phỏng 1–10 từ, mỗi từ 1–10 chữ a–z / Visualize 1–10 words, each with 1–10 lowercase letters.");
  }
  if (!/^[a-z.]{1,10}$/.test(pattern) || (pattern.match(/\./g) || []).length > 2) {
    throw new Error("#211: Pattern 1–10 ký tự a–z hoặc ., tối đa 2 dấu chấm / Use 1–10 lowercase letters or dots, at most 2 dots.");
  }
  return { words, pattern };
}

function buildSteps(input, params = {}) {
  const { words, pattern } = parseInput(input, params);
  const dictionary = { kind: "dictionary" }, frames = [], steps = [], branchLog = [];
  const failed = new Set();
  let nextId = 0, wordIndex = null, operation = "WordDictionary()", matched = [], phase = "build";
  const rawNode = node => ({
    ...(node.children === null ? {} : { children: Object.fromEntries(Object.entries(node.children).map(([ch, child]) => [ch, rawNode(child)])) }),
    ...(node.isWord === null ? {} : { is_word: node.isWord }),
  });
  const rawValue = value => value?.kind === "node" ? rawNode(value) : value?.kind === "dictionary"
    ? (value.root ? { root: rawNode(value.root) } : {}) : value;
  function variables(locals) {
    return Object.entries(locals).map(([name, value]) => value?.kind ? {
      name, value: value.kind === "node" ? `TrieNode(${JSON.stringify(value.prefix || "root")})` : "WordDictionary", rawValue: rawValue(value),
    } : { name, value });
  }
  function pathTo(node) {
    const result = [];
    for (let cursor = node; cursor; cursor = cursor.parent) result.unshift(cursor.id);
    return result;
  }
  function emit(line, event, label, result = null, final = false) {
    const frame = frames.at(-1);
    const active = frame.locals.node || (frame.locals.self?.kind === "node" ? frame.locals.self : dictionary.root);
    const nodes = [];
    function visit(node) {
      nodes.push({ id: node.id, parent: node.parent?.id ?? null, ch: node.ch, prefix: node.prefix, isWord: node.isWord,
        children: Object.values(node.children || {}).map(child => child.id) });
      Object.values(node.children || {}).forEach(visit);
    }
    if (dictionary.root) visit(dictionary.root);
    const dfsFrames = frames.filter(item => item.method === "dfs");
    const wildcard = [...dfsFrames].reverse().find(item => pattern[item.locals.i] === ".");
    const branchParent = wildcard?.locals.node;
    const branches = Object.values(branchParent?.children || {}).map(child => ({
      id: child.id, ch: child.ch,
      active: wildcard.locals.child === child,
      result: branchLog.findLast(item => item.from === branchParent.id && item.to === child.id)?.result ?? null,
    }));
    frame.line = line;
    steps.push({ arr: [], codeBlock: 1, codeLines: [line], final,
      title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), note: bi("", ""), vars: variables(frame.locals),
      wordDictionary211View: { line, source: CODE[line - 1].trim(), event, scope: frame.method, operation, phase,
        words: [...words], wordIndex, pattern, nodes, current: active?.id ?? null, path: active ? pathTo(active) : [],
        pending: active && !nodes.some(node => node.id === active.id) ? { ch: active.ch, prefix: active.prefix } : null,
        i: frame.method === "dfs" ? frame.locals.i : phase === "search" ? 0 : null,
        char: frame.locals.ch ?? null, completed: phase === "search" ? words.length : wordIndex ?? 0,
        stack: dfsFrames.map(item => ({ node: item.locals.node.prefix || "root", i: item.locals.i, line: item.line ?? 20 })),
        branches, branchLog: branchLog.map(item => ({ ...item })), failed: [...failed], matched: [...matched], result,
        answer: final ? result : null },
    });
  }
  function makeNode(ch, parent) {
    const node = { kind: "node", id: nextId++, ch, prefix: parent ? parent.prefix + ch : "", parent, children: null, isWord: null };
    frames.push({ method: "TrieNode.__init__", locals: { self: node } });
    node.children = Object.create(null);
    emit(3, "children-init", bi("children = {}", "children = {}"));
    node.isWord = false;
    emit(4, "end-init", bi("Chưa phải cuối từ", "Not a word end yet"));
    frames.pop();
    return node;
  }
  frames.push({ method: "WordDictionary.__init__", locals: { self: dictionary } });
  dictionary.root = makeNode("root", null);
  emit(8, "root", bi("Tạo root", "Create root"));
  frames.pop();
  words.forEach((word, index) => {
    wordIndex = index; operation = `addWord(${JSON.stringify(word)})`;
    const frame = { method: "addWord", locals: { self: dictionary, word, node: dictionary.root } };
    frames.push(frame);
    emit(11, "add-start", bi("node → root", "node → root"));
    for (const ch of word) {
      frame.locals.ch = ch;
      emit(12, "add-char", bi(`Đọc '${ch}'`, `Read '${ch}'`));
      const missing = !Object.hasOwn(frame.locals.node.children, ch);
      emit(13, "add-check", bi(missing ? `Thiếu '${ch}'` : `Dùng lại '${ch}'`, missing ? `Missing '${ch}'` : `Reuse '${ch}'`));
      if (missing) {
        frame.locals.node.children[ch] = makeNode(ch, frame.locals.node);
        emit(14, "create", bi(`Tạo cạnh '${ch}'`, `Create '${ch}' edge`));
      }
      frame.locals.node = frame.locals.node.children[ch];
      emit(15, "descend", bi(`node → ${frame.locals.node.prefix}`, `node → ${frame.locals.node.prefix}`));
    }
    emit(12, "add-loop-end", bi("Hết ký tự", "No more characters"));
    frame.locals.node.isWord = true;
    emit(16, "mark-end", bi(`★ ${word}`, `★ ${word}`));
    frames.pop();
  });
  phase = "search"; operation = `search(${JSON.stringify(pattern)})`; wordIndex = null;
  frames.push({ method: "search", locals: { self: dictionary, word: pattern, dfs: "dfs" } });
  emit(19, "define-dfs", bi("Chuẩn bị DFS", "Define DFS"));
  function dfs(node, i) {
    const frame = { method: "dfs", locals: { node, i, dfs: "dfs", word: pattern } };
    frames.push(frame);
    emit(20, "end-check", bi(`i = ${i} / ${pattern.length}`, `i = ${i} / ${pattern.length}`));
    if (i === pattern.length) {
      const result = node.isWord;
      if (result) matched = pathTo(node); else failed.add(node.id);
      emit(21, "terminal", bi(result ? "Hết pattern + ★ → True" : "Chỉ là prefix → False", result ? "Pattern ended + ★ → True" : "Only a prefix → False"), result);
      frames.pop(); return result;
    }
    const dot = pattern[i] === ".";
    emit(22, "wildcard-check", bi(dot ? ". = một ký tự bất kỳ" : `Tìm cạnh '${pattern[i]}'`, dot ? ". = any one letter" : `Find '${pattern[i]}' edge`));
    if (dot) {
      for (const child of Object.values(node.children)) {
        frame.locals.child = child;
        const attempt = { from: node.id, to: child.id, ch: child.ch, result: null };
        branchLog.push(attempt);
        emit(23, "try-branch", bi(`. → '${child.ch}'`, `. → '${child.ch}'`));
        const result = dfs(child, i + 1);
        attempt.result = result;
        emit(24, result ? "branch-success" : "backtrack", bi(result ? `'${child.ch}' → True` : `'${child.ch}' × → quay lui`, result ? `'${child.ch}' → True` : `'${child.ch}' × → backtrack`), result);
        if (result) {
          emit(25, "short-circuit", bi("Có một nhánh đúng → dừng", "One match → stop"), true);
          frames.pop(); return true;
        }
      }
      emit(23, "branch-loop-end", bi("Hết nhánh", "No more branches"));
      failed.add(node.id);
      emit(26, "all-failed", bi("Mọi nhánh đều sai → False", "All branches failed → False"), false);
      frames.pop(); return false;
    }
    const missing = !Object.hasOwn(node.children, pattern[i]);
    emit(27, "edge-check", bi(missing ? `Không có '${pattern[i]}'` : `Có cạnh '${pattern[i]}'`, missing ? `No '${pattern[i]}' edge` : `Found '${pattern[i]}' edge`));
    if (missing) {
      failed.add(node.id);
      emit(28, "missing", bi("Thiếu cạnh → False", "Missing edge → False"), false);
      frames.pop(); return false;
    }
    const result = dfs(node.children[pattern[i]], i + 1);
    if (!result) failed.add(node.id);
    emit(29, "literal-return", bi(`Trả về ${result ? "True" : "False"}`, `Return ${result ? "True" : "False"}`), result);
    frames.pop(); return result;
  }
  const answer = dfs(dictionary.root, 0);
  emit(30, "done", bi(`search → ${answer ? "True" : "False"}`, `search → ${answer ? "True" : "False"}`), answer, true);
  frames.pop();
  return { original: words, answer, steps };
}

module.exports = { 211: {
  id: 211, difficulty: "medium", slug: "design-add-and-search-words-data-structure",
  category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
  title: bi("Design Add and Search Words Data Structure", "Design Add and Search Words Data Structure"),
  titleVi: bi("Thêm từ · tìm với ký tự .", "Add words · search with ."),
  statement: bi("Thêm từ vào Trie. Khi tìm, dấu . khớp đúng một ký tự. Khớp hết pattern và dừng tại ★ mới trả True.", "Add words to a Trie. During search, . matches exactly one letter. Return True only after matching the whole pattern at a ★ word end."),
  defaultInput: "bad,dad,mad", inputKind: "string",
  inputLabel: bi("1–10 từ cách nhau bằng dấu phẩy · mỗi từ 1–10 chữ a–z", "1–10 comma-separated words · 1–10 lowercase letters each"),
  extraParams: [{ key: "search", type: "string", default: ".ad", label: bi("search(pattern) · . khớp 1 ký tự · tối đa 2 dấu .", "search(pattern) · . matches 1 letter · up to 2 dots") }],
  approach: [bi("Chữ thường → 1 cạnh · dấu . → thử từng nhánh", "Letter → one edge · dot → try each branch"), bi("★ là cuối từ · prefix chưa đủ", "★ marks a word end · a prefix is not enough")],
  complexity: { time: "O(L) add · O(26ᵈ · L) search", space: "O(S + L)", note: bi("L: độ dài từ; d: số dấu .; S: tổng ký tự đã thêm. Giới hạn mô phỏng: 10 từ × 10 ký tự.", "L: word length; d: dots; S: total inserted characters. Visualization limit: 10 words × 10 characters.") },
  debugMode: "line-by-line", code: CODE, builder: buildSteps,
} };
