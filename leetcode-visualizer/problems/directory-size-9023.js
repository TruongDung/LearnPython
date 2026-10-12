"use strict";
const bi = (vi, en) => ({ vi, en });
const SCAN_CODE = [
  "class FileSizeIndex:",
  "    def __init__(self, files):",
  "        self.files = files",
  "",
  "    def calculate_size(self, path):",
  "        query = path.rstrip('/')",
  "        total = 0",
  "        for size, file_path in self.files:",
  "            if file_path == query or file_path.startswith(query + '/'):",
  "                total += size",
  "        return total",
  "",
  "class Solution:",
  "    def calculateSizes(self, files, queries):",
  "        index = FileSizeIndex(files)",
  "        return [index.calculate_size(path) for path in queries]",
];
const TRIE_CODE = [
  "class TrieNode:",
  "    def __init__(self):",
  "        self.children = {}",
  "        self.total = 0",
  "",
  "class FileSizeIndex:",
  "    def __init__(self, files):",
  "        self.root = TrieNode()",
  "        for size, path in files:",
  "            node = self.root",
  "            node.total += size",
  "            for part in path[5:].split('/'):",
  "                node = node.children.setdefault(part, TrieNode())",
  "                node.total += size",
  "",
  "    def calculate_size(self, path):",
  "        node = self.root",
  "        for part in path.rstrip('/')[5:].split('/'):",
  "            node = node.children.get(part)",
  "            if node is None:",
  "                return 0",
  "        return node.total",
  "",
  "class Solution:",
  "    def calculateSizes(self, files, queries):",
  "        index = FileSizeIndex(files)",
  "        return [index.calculate_size(path) for path in queries]",
];

function parseInput(input) {
  let data = input;
  if (typeof input === "string") {
    try { data = JSON.parse(input); } catch { throw new Error('9023: JSON không hợp lệ / invalid JSON.'); }
  }
  if (!data || !Array.isArray(data.files) || data.files.length > 12 || !Array.isArray(data.queries) || data.queries.length < 1 || data.queries.length > 8) {
    throw new Error('9023: dùng {"files":[[size,"gs://bucket/file"]],"queries":["gs://bucket"]}; tối đa 12 files và 1..8 queries.');
  }
  const validatePath = (path, file) => {
    if (typeof path !== "string" || path.length > 200 || !path.startsWith("gs://")) throw new Error('9023: path phải có dạng gs://bucket/path, tối đa 200 ký tự.');
    const canonical = file ? path : path.replace(/\/+$/, "");
    const parts = canonical.slice(5).split("/");
    if (parts.length > 8 || parts.length < (file ? 2 : 1) || parts.some((part) => !part.trim() || part === "." || part === "..") || /\s/.test(parts[0])) throw new Error('9023: path phải có bucket và các phần không rỗng; tối đa 8 phần, không có . hoặc ...');
    return canonical;
  };
  const names = new Set();
  const files = data.files.map((row) => {
    if (!Array.isArray(row) || row.length !== 2 || !Number.isSafeInteger(row[0]) || row[0] < 0 || row[0] > 1_000_000_000_000) throw new Error('9023: mỗi file là [size,path], size nguyên thuộc [0,1e12].');
    const path = validatePath(row[1], true);
    if (names.has(path)) throw new Error('9023: đường dẫn file bị trùng / duplicate file path.');
    names.add(path);
    return [row[0], path];
  });
  for (const [, path] of files) {
    let parent = path.slice(0, path.lastIndexOf("/"));
    while (parent.length > 5) {
      if (names.has(parent)) throw new Error('9023: một path không thể vừa là file vừa là thư mục / file-directory collision.');
      parent = parent.slice(0, parent.lastIndexOf("/"));
    }
  }
  const queries = data.queries.map((path) => { validatePath(path, false); return path; });
  return { files, queries };
}

function buildSteps(input, method) {
  const { files, queries } = parseInput(input);
  const nodes = new Map([["gs://", { path: "gs://", name: "gs://", parent: null, depth: 0, total: method === 2 ? 0 : null, fileIndex: null, children: new Map() }]]);
  const answers = Array(queries.length).fill(null);
  const steps = [];
  const addNode = (parent, part, fileIndex = null) => {
    const path = parent.path === "gs://" ? parent.path + part : `${parent.path}/${part}`;
    if (!nodes.has(path)) {
      const node = { path, name: part, parent: parent.path, depth: parent.depth + 1, total: method === 2 ? 0 : null, fileIndex, children: new Map() };
      nodes.set(path, node);
      parent.children.set(part, node);
    }
    return nodes.get(path);
  };
  const emit = ({ phase, line, fileIndex = null, queryIndex = null, current = "gs://", visited = ["gs://"], matched = [], total = null, missing = null, match = null, final = false }) => {
    const labels = { init: bi("Dữ liệu file", "File data"), build: bi("Cộng vào cache thư mục", "Add to folder cache"), query: bi("Tính dung lượng", "Calculate size"), scan: bi("Kiểm tra một file", "Check one file"), add: bi("Cộng file khớp", "Add matching file"), walk: bi("Duyệt đường dẫn", "Walk path"), result: bi("Dung lượng", "Size"), done: bi("Kết quả", "Results") };
    steps.push({
      title: labels[phase], note: bi("", ""), arr: [], codeBlock: method, codeLines: line ? [line] : [], final,
      vars: [{ name: "path", value: queryIndex === null ? "—" : queries[queryIndex] }, { name: method === 2 ? "node.total" : "total", value: total ?? "—" }, { name: "answer", value: answers.map((value) => value ?? "—").join(", ") }],
      directorySize9023View: {
        phase, method, files: files.map((row) => [...row]), queries: [...queries], answers: [...answers],
        nodes: [...nodes.values()].map(({ children, ...node }) => ({ ...node })), fileIndex, queryIndex, current, visited: [...visited], matched: [...matched], total, missing, match, final,
      },
    });
  };
  if (method === 1) {
    files.forEach(([size, path], index) => {
      let node = nodes.get("gs://");
      path.slice(5).split("/").forEach((part, i, parts) => { node = addNode(node, part, i === parts.length - 1 ? index : null); });
      node.total = size;
    });
  }
  emit({ phase: "init", line: method === 2 ? 8 : 3 });
  if (method === 2) files.forEach(([size, path], index) => {
    let node = nodes.get("gs://");
    const visited = [node.path];
    node.total += size;
    emit({ phase: "build", line: 11, fileIndex: index, current: node.path, visited, total: node.total });
    path.slice(5).split("/").forEach((part, i, parts) => {
      node = addNode(node, part, i === parts.length - 1 ? index : null);
      visited.push(node.path);
      node.total += size;
      emit({ phase: "build", line: 14, fileIndex: index, current: node.path, visited, total: node.total });
    });
  });
  queries.forEach((rawQuery, queryIndex) => {
    const query = rawQuery.replace(/\/+$/, "");
    let total = 0;
    let current = "gs://";
    let missing = null;
    const visited = [current];
    const matched = [];
    emit({ phase: "query", line: method === 2 ? 17 : 6, queryIndex, total: method === 1 ? 0 : null });
    if (method === 1) files.forEach(([size, path], fileIndex) => {
      const match = path === query || path.startsWith(query + "/");
      current = path;
      emit({ phase: "scan", line: 9, fileIndex, queryIndex, current, matched, total, match });
      if (match) {
        matched.push(fileIndex);
        total += size;
        emit({ phase: "add", line: 10, fileIndex, queryIndex, current, matched, total, match });
      }
    });
    else {
      let node = nodes.get(current);
      for (const part of query.slice(5).split("/")) {
        const next = current === "gs://" ? current + part : `${current}/${part}`;
        node = node.children.get(part);
        if (!node) { missing = next; break; }
        current = node.path;
        visited.push(current);
        emit({ phase: "walk", line: 19, queryIndex, current, visited });
      }
      total = missing ? 0 : node.total;
    }
    answers[queryIndex] = total;
    emit({ phase: "result", line: method === 1 ? 11 : missing ? 21 : 22, queryIndex, current: method === 1 ? query : current, visited, matched, total, missing });
  });
  emit({ phase: "done", line: method === 1 ? 16 : 27, final: true });
  return { original: { files, queries }, answer: answers, steps };
}

const BUCKET = "gs://bucket.storage.google.com";
module.exports = {
  9023: {
    id: 9023, difficulty: "medium", slug: null,
    category: { key: "interview", vi: "Phỏng vấn", en: "Interview" },
    tags: [{ key: "trie", vi: "Trie", en: "Trie" }, { key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Directory / File Size (GCS Paths)", "Directory / File Size (GCS Paths)"),
    titleVi: bi("Tính tổng dung lượng theo đường dẫn", "Total size by path"),
    statement: bi("Bài phỏng vấn trong ảnh (ID nội bộ #9023). files chứa [size,path]. Tính dung lượng file hoặc tổng mọi file trong thư mục; path không có trả 0. Hai cách: quét file và Trie cache tổng. Mô phỏng tối đa 12 files, 8 queries, 8 phần/path; file không trùng hoặc đồng thời là thư mục. Dữ liệu mô phỏng, không kết nối GCS.", "Interview problem from the screenshot (internal ID #9023). files contains [size,path]. Return a file's size or the sum of files inside a directory; missing paths return 0. Compare file scanning and a Trie caching totals. Up to 12 files, 8 queries, 8 path parts; no duplicates or file-directory collisions. Simulated data; no GCS connection."),
    defaultInput: JSON.stringify({ files: [[1000, `${BUCKET}/video/movie.mkv`], [500, `${BUCKET}/video/short_video.mp4`], [100, `${BUCKET}/music/song.mp3`]], queries: [`${BUCKET}/video`, `${BUCKET}/music/song.mp3`, BUCKET, `${BUCKET}/missing`] }),
    inputKind: "string", inputLabel: bi("JSON: files [[size,path]], queries [path]", "JSON: files [[size,path]], queries [path]"),
    extraParams: [{ key: "approach", label: bi("Cách giải", "Approach"), type: "select", default: "1", options: [{ value: "1", label: bi("1 · Quét file", "1 · Scan files") }, { value: "2", label: bi("2 · Trie + tổng cache", "2 · Trie + cached totals") }] }],
    debugMode: "line-by-line",
    approach: [bi("Cách 1: cộng file có path == query hoặc bắt đầu bằng query + '/'. Không nhầm /video với /video2.", "Approach 1: sum files with path == query or starting with query + '/'. /video does not match /video2."), bi("Cách 2: mỗi file cộng size vào các node trên đường đi. Query chỉ duyệt tới node và đọc total.", "Approach 2: add each file's size to nodes along its path. Queries walk to the node and read total.")],
    complexity: { time: "O(Q·N·L)", space: "O(Q)", note: bi("N files, Q queries, L độ dài path; không tính dữ liệu đầu vào.", "N files, Q queries, L path length; excludes input storage.") },
    complexity2: { time: "O(N·L + Q·L)", space: "O(N·L + Q)", note: bi("Dựng Trie một lần; mỗi query chỉ đi theo path.", "Build the Trie once; each query only walks its path.") },
    code: SCAN_CODE, codeLabel: bi("Cách 1: Quét file theo prefix", "Approach 1: Scan files by prefix"), builder: input => buildSteps(input, 1),
    code2: TRIE_CODE, code2Label: bi("Cách 2: Trie lưu tổng dung lượng", "Approach 2: Trie with cached size"), builder2: input => buildSteps(input, 2),
    liveArgs: input => { const { files, queries } = parseInput(input); return [files, queries]; },
  },
};
