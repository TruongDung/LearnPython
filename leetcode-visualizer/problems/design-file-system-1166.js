"use strict";

const { bi } = require("./hard-viz-shared");
const MAX_OPERATIONS = 10_000;
const MAX_TRACE_STEPS = 220;
const SOURCE = [
  "class FileSystem:",
  "    def __init__(self):",
  "        self.root = {}",
  "",
  "    def createPath(self, path: str, value: int) -> bool:",
  "        if path == '' or path == '/':",
  "            return False",
  "        parts = path.split('/')[1:]",
  "        node = self.root",
  "        for part in parts[:-1]:",
  "            if part not in node:",
  "                return False",
  "            node = node[part]",
  "        if parts[-1] in node:",
  "            return False",
  "        node[parts[-1]] = {'$value': value}",
  "        return True",
  "",
  "    def get(self, path: str) -> int:",
  "        node = self.root",
  "        for part in path.split('/')[1:]:",
  "            if part not in node:",
  "                return -1",
  "            node = node[part]",
  "        return node.get('$value', -1)",
];
const TRIE_SOURCE = [
  "class TrieNode:",
  "    def __init__(self, value=-1):",
  "        self.value = value",
  "        self.children = {}",
  "",
  "class FileSystem:",
  "    def __init__(self):",
  "        self.root = TrieNode()",
  "",
  "    def createPath(self, path: str, value: int) -> bool:",
  "        if path == '' or path == '/':",
  "            return False",
  "        parts = path.split('/')[1:]",
  "        node = self.root",
  "        for part in parts[:-1]:",
  "            if part not in node.children:",
  "                return False",
  "            node = node.children[part]",
  "        name = parts[-1]",
  "        if name in node.children:",
  "            return False",
  "        node.children[name] = TrieNode(value)",
  "        return True",
  "",
  "    def get(self, path: str) -> int:",
  "        node = self.root",
  "        for part in path.split('/')[1:]:",
  "            node = node.children.get(part)",
  "            if node is None:",
  "                return -1",
  "        return node.value",
];
// Match the shared operations to the corresponding TrieNode Python lines.
const TRIE_LINES = { 3: 8, 5: 10, 7: 12, 11: 16, 12: 17, 13: 18, 14: [19, 20], 15: 21, 16: 22, 17: 23, 19: 25, 22: 27, 23: [28, 29, 30], 24: [28, 29], 25: 31 };

class TrieNode {
  constructor(value = -1) { this.value = value; this.children = new Map(); }
}

function parseFileSystem1166Operations(input) {
  let rows = input;
  if (typeof rows === "string") {
    const source = rows.trim();
    if (source.startsWith("[")) {
      try { rows = JSON.parse(source); } catch { throw new Error("#1166: JSON không hợp lệ / invalid JSON."); }
    } else {
      rows = source.split(";").map((row) => row.trim()).filter(Boolean).map((row) => {
        const match = row.match(/^(createPath|create|get)\s*\((.*)\)$/i);
        if (!match) throw new Error(`#1166: operation không hợp lệ / invalid operation: ${row}`);
        const name = match[1].toLowerCase() === "get" ? "get" : "createPath";
        const args = match[2].split(",").map((part) => part.trim());
        if (args[0]?.startsWith('"')) {
          try { args[0] = JSON.parse(args[0]); } catch { throw new Error("#1166: path không hợp lệ / invalid path."); }
        } else if (args[0]?.startsWith("'")) {
          if (!args[0].endsWith("'")) throw new Error("#1166: path không hợp lệ / invalid path.");
          args[0] = args[0].slice(1, -1);
        }
        if (name === "createPath" && args.length === 2) args[1] = /^\d+$/.test(args[1]) ? Number(args[1]) : NaN;
        return [name, ...args];
      });
    }
  }
  if (!Array.isArray(rows) || !rows.length || rows.length > MAX_OPERATIONS) {
    throw new Error("#1166: cần 1..10000 operations / provide 1..10000 operations.");
  }
  return rows.map((row, index) => {
    if (!Array.isArray(row)) throw new Error(`#1166: operation ${index + 1} phải là mảng / must be an array.`);
    const [rawName, path, value] = row;
    const name = rawName === "create" ? "createPath" : rawName;
    if (!((name === "createPath" && row.length === 3) || (name === "get" && row.length === 2))) {
      throw new Error(`#1166: operation ${index + 1}: createPath(path,value) hoặc get(path).`);
    }
    if (typeof path !== "string" || path.length > 100 || !(["", "/"].includes(path) || /^(\/[a-z]+)+$/.test(path))) {
      throw new Error(`#1166: path ${index + 1} phải có dạng /a/b, tối đa 100 ký tự / use /a/b, at most 100 characters.`);
    }
    if (name === "createPath" && (!Number.isSafeInteger(value) || value < 1 || value > 1_000_000_000)) {
      throw new Error(`#1166: value ${index + 1} phải thuộc [1, 1e9] / must be in [1, 1e9].`);
    }
    return { name, path, value: name === "createPath" ? value : null, args: name === "createPath" ? [path, value] : [path] };
  });
}

function buildFileSystem1166Steps(input, method = 1) {
  const operations = parseFileSystem1166Operations(input);
  const root = new TrieNode();
  const trieNodes = new Map([["/", root]]);
  const nodes = new Map([["/", { path: "/", parent: null, name: "/", value: method === 2 ? -1 : null, depth: 0 }]]);
  const outputs = [];
  const history = [];
  const steps = [];
  let omittedSteps = 0;

  const emit = ({ phase, line, operationIndex = null, current = "/", visited = ["/"], missing = null, result = null, reason = null, final = false, nodeMissing = false }) => {
    if (!final && steps.length >= MAX_TRACE_STEPS - 1) { omittedSteps += 1; return; }
    const operation = operationIndex == null ? null : operations[operationIndex];
    const labels = {
      init: bi("FileSystem()", "FileSystem()"), start: bi(operation?.name || "", operation?.name || ""),
      walk: bi("Duyệt thư mục", "Walk folders"), "check-parent": bi("Kiểm tra cha", "Check parent"),
      "check-target": bi("Kiểm tra đường dẫn", "Check path"), created: bi("Tạo thành công", "Created"),
      rejected: bi("Không tạo được", "Cannot create"), found: bi("Đọc giá trị", "Read value"),
      "not-found": bi("Không tìm thấy", "Not found"), done: bi("Kết quả", "Result"),
    };
    const codeLines = line == null ? [] : [line].flat();
    const activeNode = nodeMissing ? null : trieNodes.get(current);
    steps.push({
      arr: [], codeBlock: method, codeLines: method === 2 ? codeLines.flatMap((number) => TRIE_LINES[number]) : codeLines, title: labels[phase], note: bi("", ""), final,
      vars: [{ name: "path", value: operation?.path ?? "—" }, { name: "node", value: nodeMissing ? "None" : current }, { name: "result", value: result ?? "—" }],
      fileSystem1166View: {
        phase, method, operationIndex, operationCount: operations.length,
        activeNode: activeNode ? { path: current, value: activeNode.value, children: [...activeNode.children].map(([name, child]) => ({ name, value: child.value })) } : null,
        operation: operation ? { ...operation, args: [...operation.args] } : null,
        nodes: [...nodes.values()].map((node) => ({ ...node })), current, visited: [...visited], missing, result, reason,
        outputs: [...outputs], history: history.slice(-6).map((entry) => ({ ...entry })),
        omittedSteps, answer: final ? [...outputs] : null,
      },
    });
  };

  emit({ phase: "init", line: 3 });
  operations.forEach((operation, operationIndex) => {
    const { name, path, value } = operation;
    const parts = path.split("/").slice(1);
    const visited = ["/"];
    let current = "/";
    let node = root;
    let nodeMissing = false;
    emit({ phase: "start", line: name === "createPath" ? 5 : 19, operationIndex });
    let result;
    let reason = null;
    let missing = null;
    if (path === "" || path === "/") {
      result = name === "createPath" ? false : -1;
      reason = "invalid-path";
      nodeMissing = method === 2 && name === "get" && path === "/";
    } else {
      const toVisit = name === "createPath" ? parts.slice(0, -1) : parts;
      for (const part of toVisit) {
        const next = current === "/" ? `/${part}` : `${current}/${part}`;
        emit({ phase: name === "createPath" ? "check-parent" : "walk", line: name === "createPath" ? 11 : 22, operationIndex, current, visited });
        if (!node.children.has(part)) {
          missing = next;
          reason = name === "createPath" ? "missing-parent" : "missing-path";
          nodeMissing = method === 2 && name === "get";
          break;
        }
        node = node.children.get(part);
        current = next;
        visited.push(current);
        emit({ phase: "walk", line: name === "createPath" ? 13 : 24, operationIndex, current, visited });
      }
      if (missing) result = name === "createPath" ? false : -1;
      else if (name === "createPath") {
        emit({ phase: "check-target", line: 14, operationIndex, current, visited });
        if (node.children.has(parts.at(-1))) { result = false; reason = "exists"; }
        else {
          const child = new TrieNode(value);
          node.children.set(parts.at(-1), child);
          trieNodes.set(path, child);
          nodes.set(path, { path, parent: current, name: parts.at(-1), value, depth: parts.length });
          if (method === 1) current = path;
          visited.push(path);
          result = true;
        }
      } else result = node.value;
    }
    outputs.push(result);
    history.push({ index: operationIndex + 1, name, path, value, result });
    const phase = name === "createPath" ? result ? "created" : "rejected" : result === -1 ? "not-found" : "found";
    const line = name === "createPath" ? result ? [16, 17] : reason === "invalid-path" ? 7 : reason === "exists" ? 15 : 12 : result === -1 && path !== "" ? 23 : 25;
    emit({ phase, line, operationIndex, current, visited, missing, result, reason, nodeMissing });
  });
  emit({ phase: "done", line: null, final: true });
  return { original: operations.map((operation) => [operation.name, ...operation.args]), answer: outputs, steps };
}

module.exports = {
  1166: {
    id: 1166, difficulty: "medium", slug: "design-file-system", premium: true,
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    tags: [{ key: "design", vi: "Thiết kế hệ thống", en: "Design" }, { key: "hashmap", vi: "Hash Map", en: "Hash Map" }],
    title: bi("Design File System", "Design File System"), titleVi: bi("Tạo và đọc đường dẫn", "Create and read paths"),
    statement: bi("createPath(path, value) chỉ tạo khi đường dẫn chưa có và thư mục cha đã tồn tại. get(path) trả giá trị hoặc -1. Không tự tạo thư mục cha.", "createPath(path, value) succeeds only when the path is new and its parent exists. get(path) returns its value or -1. Parents are not created automatically."),
    defaultInput: 'create(/leet,1);create(/leet/code,2);get(/leet/code);create(/leet/code,9);create(/missing/file,3);get(/missing)',
    inputKind: "string", inputLabel: bi("Lệnh cách nhau bằng ; hoặc JSON", "Commands separated by ; or JSON"), extraParams: [{
      key: "approach", label: bi("Cách giải", "Approach"), type: "select", default: "1",
      options: [{ value: "1", label: bi("1 · Trie dạng dictionary", "1 · Dictionary Trie") }, { value: "2", label: bi("2 · Prefix Tree với TrieNode", "2 · Prefix Tree with TrieNode") }],
    }],
    debugMode: "line-by-line",
    approach: [bi("Mỗi folder là một node trong Trie; duyệt từng phần của /a/b, không duyệt từng ký tự.", "Each folder is a Trie node; walk the parts of /a/b, not individual characters."), bi("Cha thiếu hoặc đường dẫn đã có → không thay đổi cây.", "Missing parent or existing path → leave the tree unchanged."), bi("Cách 2: TrieNode lưu value và children (tên folder → node con). Root có value = -1; chỉ thêm node cuối.", "Approach 2: TrieNode stores value and children (folder name → child node). Root has value = -1; only insert the leaf.")],
    complexity: { time: "O(L)", space: "O(S)", note: bi("L là độ dài đường dẫn; S là tổng số ký tự trong các đường dẫn đã lưu.", "L is the path length; S is the total characters in stored paths.") },
    complexity2: { time: "O(L)", space: "O(S)", note: bi("Mỗi node lưu value và children. L là độ dài đường dẫn; S là tổng số ký tự đã lưu.", "Each node stores value and children. L is the path length; S is the total stored characters.") },
    code: SOURCE, codeLabel: bi("Cách 1: Trie dạng dictionary", "Approach 1: Dictionary Trie"), builder: (input) => buildFileSystem1166Steps(input), parseOperations: parseFileSystem1166Operations,
    code2: TRIE_SOURCE, code2Label: bi("Cách 2: Prefix Tree với TrieNode", "Approach 2: Prefix Tree with TrieNode"),
    builder2: (input) => buildFileSystem1166Steps(input, 2),
  },
};
