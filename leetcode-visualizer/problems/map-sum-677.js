"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class TrieNode:",
  "    def __init__(self):",
  "        self.children = {}",
  "        self.score = 0",
  "",
  "class MapSum:",
  "    def __init__(self):",
  "        self.root = TrieNode()",
  "        self.values = {}",
  "    def insert(self, key: str, val: int) -> None:",
  "        delta = val - self.values.get(key, 0)",
  "        self.values[key] = val",
  "        node = self.root",
  "        for char in key:",
  "            if char not in node.children:",
  "                node.children[char] = TrieNode()",
  "            node = node.children[char]",
  "            node.score += delta",
  "    def sum(self, prefix: str) -> int:",
  "        node = self.root",
  "        for char in prefix:",
  "            if char not in node.children:",
  "                return 0",
  "            node = node.children[char]",
  "        return node.score",
];

function parseOperations(input) {
  const strip = value => {
    const raw = String(value ?? "").trim();
    return /^(["']).*\1$/.test(raw) ? raw.slice(1, -1) : raw;
  };
  if (typeof input !== "string") throw new Error("#677: Dùng insert(key,val);sum(prefix) / Use insert(key,val);sum(prefix).");
  const commands = input.split(/[;|]/).map(command => command.trim()).filter(Boolean);
  if (commands.length < 1 || commands.length > 50) throw new Error("#677: Nhập 1–50 thao tác / Enter 1–50 operations.");
  return commands.map(command => {
    const match = /^(insert|sum)\s*\((.*)\)$/i.exec(command);
    if (!match) throw new Error(`#677: Thao tác không hợp lệ / Invalid operation: ${command}`);
    const name = match[1].toLowerCase(), args = match[2].split(",").map(arg => arg.trim()), key = strip(args[0]);
    if (!/^[a-z]{1,50}$/.test(key) || args.length !== (name === "insert" ? 2 : 1)) throw new Error("#677: key/prefix gồm 1–50 chữ a–z / key/prefix must contain 1–50 lowercase letters.");
    if (name === "insert") {
      const val = Number(args[1]);
      if (!/^\d+$/.test(args[1]) || !Number.isSafeInteger(val) || val < 0 || val > 1000) throw new Error("#677: val là số nguyên 0–1000 / val must be an integer from 0 to 1000.");
      return { name, args: [key, val], label: `insert(${JSON.stringify(key)}, ${val})` };
    }
    return { name, args: [key], label: `sum(${JSON.stringify(key)})` };
  });
}

function buildSummary(operations) {
  const root = { children: Object.create(null), score: 0 }, values = new Map(), outputs = [];
  operations.forEach((op, index) => {
    if (op.name === "insert") {
      const [key, val] = op.args, delta = val - (values.get(key) || 0); values.set(key, val);
      let node = root;
      for (const char of key) { node.children[char] ||= { children: Object.create(null), score: 0 }; node = node.children[char]; node.score += delta; }
    } else {
      let node = root;
      for (const char of op.args[0]) { node = node.children[char]; if (!node) break; }
      outputs.push({ opIndex: index, prefix: op.args[0], value: node?.score ?? 0 });
    }
  });
  const nodes = [];
  function visit(node, parent, prefix, ch) {
    if (nodes.length >= 28 || prefix.length > 8) return;
    const id = nodes.length, record = { id, parent, prefix, ch, score: node.score, children: [], isKey: values.has(prefix) };
    nodes.push(record);
    for (const [char, child] of Object.entries(node.children)) { const childId = nodes.length; visit(child, id, prefix + char, char); if (nodes.length > childId) record.children.push(childId); }
  }
  visit(root, null, "", "root");
  const answer = outputs.map(output => output.value);
  return { operations, answer, steps: [{ arr: [], codeLines: [], final: true, title: bi("Kết quả · dữ liệu lớn", "Result · large input"), note: bi("", ""), vars: [],
    mapSum677View: { mode: "summary", line: null, source: "", scope: "", event: "done", operations, opIndex: operations.length,
      op: null, nodes, path: [], updated: [], current: null, pending: null, position: null, values: [...values].map(([key, value]) => ({ key, value })),
      delta: null, oldValue: null, change: null, outputs, result: null, matches: [], answer },
  }] };
}

function buildSteps(input) {
  const operations = parseOperations(input);
  if (operations.length > 12 || operations.reduce((sum, op) => sum + op.args[0].length, 0) > 100) return buildSummary(operations);
  const mapSum = { kind: "map" }, frames = [{ scope: "MapSum.__init__", locals: { self: mapSum } }], steps = [], outputs = [];
  let nextId = 0, opIndex = -1, delta = null, oldValue = null, position = null, change = null, updated = [];
  function rawNode(node) { return { ...(node.children === null ? {} : { children: Object.fromEntries(Object.entries(node.children).map(([char, child]) => [char, rawNode(child)])) }), ...(node.score === null ? {} : { score: node.score }) }; }
  const rawMap = () => ({ ...(mapSum.root ? { root: rawNode(mapSum.root) } : {}), ...(mapSum.values ? { values: { ...mapSum.values } } : {}) });
  function pathTo(node) { const path = []; for (let at = node; at; at = at.parent) path.unshift(at.id); return path; }
  function emit(line, event, label, result = null, final = false) {
    const frame = frames.at(-1), op = operations[opIndex] || null;
    const active = frame?.locals.self?.kind === "node" ? frame.locals.self : frame?.locals.node || mapSum.root;
    const nodes = [];
    function visit(node) {
      nodes.push({ id: node.id, parent: node.parent?.id ?? null, prefix: node.prefix, ch: node.ch, score: node.score,
        children: Object.values(node.children || {}).map(child => child.id), isKey: Object.hasOwn(mapSum.values || {}, node.prefix) });
      Object.values(node.children || {}).forEach(visit);
    }
    if (mapSum.root) visit(mapSum.root);
    const vars = frame ? Object.entries(frame.locals).map(([name, value]) => value?.kind ? { name,
      value: value.kind === "map" ? "MapSum" : `TrieNode(${JSON.stringify(value.prefix || "root")})`, rawValue: value.kind === "map" ? rawMap() : rawNode(value),
    } : { name, value }) : [];
    const values = Object.entries(mapSum.values || {}).map(([key, value]) => ({ key, value }));
    steps.push({ arr: [], codeBlock: 1, codeLines: line === null ? [] : [line], final,
      title: line === null ? label : bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), note: bi("", ""), vars,
      mapSum677View: { mode: "trace", line, source: line === null ? "" : CODE[line - 1].trim(), scope: frame?.scope || "", event, operations,
        opIndex, op, nodes, path: active ? pathTo(active) : [], current: active?.id ?? null, updated: [...updated], position,
        pending: active && !nodes.some(node => node.id === active.id) ? { prefix: active.prefix, ch: active.ch } : null,
        delta, oldValue, change: change && { ...change }, values, outputs: outputs.map(output => ({ ...output })), result,
        matches: op?.name === "sum" && ["sum-return", "missing-return"].includes(event) ? values.filter(entry => entry.key.startsWith(op.args[0])) : [],
        answer: final ? outputs.map(output => output.value) : null },
    });
  }
  function makeNode(ch, parent) {
    const node = { kind: "node", id: nextId++, ch, parent, prefix: parent ? parent.prefix + ch : "", children: null, score: null };
    frames.push({ scope: "TrieNode.__init__", locals: { self: node } });
    node.children = Object.create(null); emit(3, "children-init", bi("children = {}", "children = {}"));
    node.score = 0; emit(4, "score-init", bi("score = 0", "score = 0"));
    frames.pop(); return node;
  }
  mapSum.root = makeNode("root", null); emit(8, "root", bi("Tạo root", "Create root"));
  mapSum.values = Object.create(null); emit(9, "values-init", bi("values = {}", "values = {}")); frames.pop();
  operations.forEach((op, index) => {
    opIndex = index; delta = oldValue = change = position = null; updated = [];
    if (op.name === "insert") {
      const [key, val] = op.args, locals = { self: mapSum, key, val };
      frames.push({ scope: "insert", locals });
      oldValue = mapSum.values[key] ?? 0; delta = val - oldValue; locals.delta = delta;
      emit(11, "delta", bi(`delta = ${val} − ${oldValue} = ${delta}`, `delta = ${val} − ${oldValue} = ${delta}`));
      mapSum.values[key] = val; emit(12, "write-value", bi(`${key} = ${val}`, `${key} = ${val}`));
      locals.node = mapSum.root; emit(13, "insert-root", bi("node → root", "node → root"));
      for (position = 0; position < key.length; position++) {
        const char = key[position]; locals.char = char; change = null;
        emit(14, "insert-char", bi(`Đọc '${char}'`, `Read '${char}'`));
        const missing = !Object.hasOwn(locals.node.children, char);
        emit(15, "insert-check", bi(missing ? `Thiếu '${char}'` : `Dùng lại '${char}'`, missing ? `Missing '${char}'` : `Reuse '${char}'`));
        if (missing) { locals.node.children[char] = makeNode(char, locals.node); emit(16, "create", bi(`Tạo '${char}'`, `Create '${char}'`)); }
        locals.node = locals.node.children[char]; emit(17, "insert-move", bi(`node → ${locals.node.prefix}`, `node → ${locals.node.prefix}`));
        const before = locals.node.score; locals.node.score += delta; updated.push(locals.node.id);
        change = { id: locals.node.id, before, after: locals.node.score };
        emit(18, "update", bi(`Σ(${locals.node.prefix}): ${before} → ${locals.node.score}`, `Σ(${locals.node.prefix}): ${before} → ${locals.node.score}`));
      }
      position = key.length - 1; change = null;
      emit(14, "insert-end", bi("Đã cập nhật cả đường key", "Entire key path updated")); frames.pop();
    } else {
      const prefix = op.args[0], locals = { self: mapSum, prefix, node: mapSum.root };
      frames.push({ scope: "sum", locals });
      emit(20, "sum-root", bi("node → root", "node → root"));
      let missing = false;
      for (position = 0; position < prefix.length; position++) {
        const char = prefix[position]; locals.char = char;
        emit(21, "sum-char", bi(`Đọc '${char}'`, `Read '${char}'`));
        missing = !Object.hasOwn(locals.node.children, char);
        emit(22, "sum-check", bi(missing ? `Không có '${char}'` : `Có cạnh '${char}'`, missing ? `No '${char}' edge` : `Found '${char}' edge`));
        if (missing) {
          outputs.push({ opIndex: index, prefix, value: 0 });
          emit(23, "missing-return", bi("Thiếu cạnh → 0", "Missing edge → 0"), 0); break;
        }
        locals.node = locals.node.children[char]; emit(24, "sum-move", bi(`node → ${locals.node.prefix}`, `node → ${locals.node.prefix}`));
      }
      if (!missing) {
        position = prefix.length - 1; emit(21, "sum-loop-end", bi("Đến node prefix", "Reached prefix node"));
        outputs.push({ opIndex: index, prefix, value: locals.node.score });
        emit(25, "sum-return", bi(`Trả về Σ = ${locals.node.score}`, `Return Σ = ${locals.node.score}`), locals.node.score);
      }
      frames.pop();
    }
  });
  opIndex = operations.length; delta = oldValue = change = position = null; updated = [];
  emit(null, "done", bi(`Kết quả sum: [${outputs.map(output => output.value).join(", ")}]`, `Sum results: [${outputs.map(output => output.value).join(", ")}]`), null, true);
  return { operations, answer: outputs.map(output => output.value), steps };
}

module.exports = { 677: {
  id: 677, difficulty: "medium", slug: "map-sum-pairs",
  category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" }, tags: [{ key: "hashmap", vi: "Bảng băm", en: "Hash Map" }],
  title: bi("Map Sum Pairs", "Map Sum Pairs"), titleVi: bi("Tổng giá trị theo prefix", "Sum values by prefix"),
  statement: bi("insert gán giá trị cho key. Cập nhật key cũ: chỉ cộng delta = mới − cũ. sum(prefix) đọc tổng Σ tại node prefix.", "insert assigns a value to a key. Overwrite: add only delta = new − old. sum(prefix) reads the cached Σ at that prefix node."),
  defaultInput: "insert(apple,3);sum(ap);insert(app,2);sum(ap);insert(apple,2);sum(ap)", inputKind: "string",
  inputLabel: bi("insert(key,val);sum(prefix) · 1–50 lệnh · val 0–1000", "insert(key,val);sum(prefix) · 1–50 commands · val 0–1000"), extraParams: [],
  approach: [bi("Key mới hoặc cũ → delta = mới − cũ", "New or existing key → delta = new − old"), bi("Cộng delta dọc key · sum đọc thẳng Σ", "Add delta along the key · sum reads Σ directly")],
  complexity: { time: "insert O(K) · sum O(P)", space: "O(S)", note: bi("K/P: độ dài key/prefix; S: tổng ký tự key. Debug đầy đủ với ≤12 lệnh, tổng ≤100 ký tự key/prefix; dữ liệu lớn vẫn trả đủ kết quả.", "K/P: key/prefix length; S: total key characters. Full debug for ≤12 commands and ≤100 key/prefix characters; larger inputs return complete results.") },
  debugMode: "line-by-line", code: CODE, builder: buildSteps, parseMapSum677Operations: parseOperations,
} };
