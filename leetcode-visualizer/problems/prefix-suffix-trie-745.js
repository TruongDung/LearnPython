"use strict";

const { bi } = require("./hard-viz-shared");
const SOURCE = Object.freeze([
  "class TrieNode:",
  "    def __init__(self):",
  "        self.children = {}",
  "        self.index = -1",
  "",
  "class WordFilter:",
  "    def __init__(self, words: list[str]):",
  "        self.root = TrieNode()",
  "        for idx, word in enumerate(words):",
  "            for p in range(1, len(word) + 1):",
  "                combined = word[:p] + '{' + word[::-1]",
  "                node = self.root",
  "                node.index = idx",
  "                for ch in combined:",
  "                    if ch not in node.children:",
  "                        node.children[ch] = TrieNode()",
  "                    node = node.children[ch]",
  "                    node.index = idx",
  "",
  "    def f(self, pref: str, suff: str) -> int:",
  "        node = self.root",
  "        for ch in pref + '{' + suff[::-1]:",
  "            if ch not in node.children:",
  "                return -1",
  "            node = node.children[ch]",
  "        return node.index",
]);
const clone = value => JSON.parse(JSON.stringify(value));
const reverse = value => [...value].reverse().join("");

function buildSteps(input, params, parseInput) {
  const { words, queries } = parseInput(input, params);
  const nodes = [];
  function create(parent, ch) {
    const node = { id: nodes.length, parent, ch, path: parent ? parent.path + ch : "", index: -1, children: new Map() };
    nodes.push(node);
    return node;
  }
  const root = create(null, "ROOT");
  const summarize = node => ({ path: node.path, index: node.index, children: [...node.children.keys()].sort() });
  const steps = []; const outputs = []; const recent = []; const inserted = [];
  let locals = { words }; let beforeVars = [{ name: "words", value: [...words] }];
  let phase = "build"; let wordIndex = null; let word = null; let p = null;
  let combined = null; let position = null; let exists = null; let query = null; let created = null;
  function emit(line, event, note, final = false) {
    const vars = Object.entries(locals).map(([name, value]) => ({ name, value: name === "node" ? summarize(value) : clone(value) }));
    const cursor = locals.node ?? root;
    const path = [];
    for (let node = cursor; node; node = node.parent) path.unshift({ id: node.id, ch: node.ch, path: node.path, index: node.index });
    const children = [...cursor.children.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([ch, child]) => ({ ch, id: child.id, index: child.index }));
    steps.push({ arr: [], codeLines: [line], codeBlock: 2, final,
      title: bi(`Dòng ${line}: ${SOURCE[line - 1].trim()}`, `Line ${line}: ${SOURCE[line - 1].trim()}`), note, vars,
      prefixSuffix745TrieView: {
        line, source: SOURCE[line - 1], event, phase, words: [...words], wordIndex, word, p, combined, position, exists,
        nodeCount: nodes.length, path, children, cursor: cursor.id, cursorAssigned: Boolean(locals.node),
        created: created ? { ch: created.ch, id: created.id, index: created.index } : null,
        query: query ? { ...query } : null, outputs: [...outputs],
        recent: recent.slice(-6).map(entry => ({ ...entry })), inserted: inserted.slice(-4),
        beforeVars: clone(beforeVars), nextLine: null, nextSource: null,
      },
    });
    beforeVars = vars;
  }
  function writeIndex(line) {
    const before = locals.node.index;
    locals.node.index = locals.idx;
    recent.push({ path: locals.node.path, before, index: locals.idx });
    emit(line, "write-index", bi(`node.index: ${before} → ${locals.idx}. Index từ tăng dần, nên ghi đè luôn giữ index lớn nhất cho đường đi này.`, `node.index: ${before} → ${locals.idx}. Word indices increase, so overwriting retains the largest index for this path.`));
  }
  emit(8, "root", bi("TrieNode() tạo root với children = {} và index = -1. Mô phỏng theo từng dòng của WordFilter; lời gọi TrieNode() được thể hiện bằng nút mới.", "TrieNode() creates the root with children = {} and index = -1. The visualization steps through WordFilter lines; each TrieNode() call is shown as a new node."));
  words.forEach((value, index) => {
    wordIndex = index; word = value; p = null; combined = null; position = null; exists = null; created = null;
    locals.idx = index; locals.word = word;
    emit(9, "word", bi(`Xử lý words[${index}] = '${word}'. Chèn mọi prefix, ghép với '{' và đảo toàn bộ từ.`, `Process words[${index}] = '${word}'. Insert every prefix followed by '{' and the reversed full word.`));
    for (let length = 1; length <= word.length; length++) {
      p = length; combined = null; position = null; exists = null; created = null; locals.p = p;
      emit(10, "prefix", bi(`Chọn p = ${p}: prefix '${word.slice(0, p)}'. Prefix và suffix được phép chồng lên nhau.`, `Choose p = ${p}: prefix '${word.slice(0, p)}'. Prefix and suffix may overlap.`));
      combined = word.slice(0, p) + "{" + reverse(word); locals.combined = combined;
      emit(11, "combined", bi(`Chèn '${word.slice(0, p)}' + '{' + '${reverse(word)}' = '${combined}'. Cần chèn cả prefix ngắn để truy vấn gặp '{' đúng vị trí.`, `Insert '${word.slice(0, p)}' + '{' + '${reverse(word)}' = '${combined}'. Short prefixes must also be inserted so queries encounter '{' at the right position.`));
      locals.node = root;
      emit(12, "reset-node", bi("Mỗi đường combined bắt đầu lại từ root; node là con trỏ đến một nút, không sao chép Trie.", "Each combined path starts again at root; node is a pointer to a node, not a copy of the Trie."));
      writeIndex(13);
      [...combined].forEach((ch, offset) => {
        position = offset; exists = null; created = null; locals.ch = ch;
        emit(14, "character", bi(`Đọc ký tự '${ch}' tại combined[${offset}]. node vẫn ở nút cha; chưa đi qua cạnh này.`, `Read character '${ch}' at combined[${offset}]. node remains at the parent; the edge has not been traversed yet.`));
        exists = locals.node.children.has(ch);
        emit(15, "check-edge", bi(exists ? `Đã có cạnh '${ch}': dùng lại nút, bỏ qua dòng 16.` : `Chưa có cạnh '${ch}': dòng 16 sẽ tạo nút con.`, exists ? `Edge '${ch}' exists: reuse the node and skip line 16.` : `Edge '${ch}' is missing: line 16 creates its child.`));
        if (!exists) {
          created = create(locals.node, ch); locals.node.children.set(ch, created);
          emit(16, "create-node", bi(`Tạo nút #${created.id} với index = -1, nối cạnh '${ch}'. node vẫn ở cha; dòng 17 mới di chuyển.`, `Create node #${created.id} with index = -1 and connect edge '${ch}'. node remains at the parent; line 17 moves it.`));
        }
        locals.node = locals.node.children.get(ch);
        emit(17, "move-node", bi(`node đi đến nút #${locals.node.id}, đường '${locals.node.path}'. index chưa cập nhật ở dòng này.`, `node moves to #${locals.node.id}, path '${locals.node.path}'. Its index has not been updated on this line.`));
        created = null;
        writeIndex(18);
      });
      position = combined.length; exists = null; created = null; inserted.push(combined);
      emit(14, "characters-end", bi("Đã chèn hết combined. Quay lại chọn prefix tiếp theo.", "combined is fully inserted. Choose the next prefix."));
    }
    emit(10, "prefixes-end", bi("Đã chèn mọi prefix của từ này.", "Every prefix of this word has been inserted."));
  });
  phase = "ready"; wordIndex = word = p = combined = position = exists = created = null;
  outputs.push(null);
  emit(9, "constructor-end", bi(`Trie có ${nodes.length} nút. WordFilter đã xây xong, constructor trả None (null).`, `The Trie contains ${nodes.length} nodes. WordFilter is built; the constructor returns None (null).`));
  queries.forEach(([pref, suff], index) => {
    phase = "query"; position = null; exists = null;
    query = { index, pref, suff, key: pref + "{" + reverse(suff), result: null };
    locals = { pref, suff }; beforeVars = [{ name: "pref", value: pref }, { name: "suff", value: suff }];
    locals.node = root;
    emit(21, "query-root", bi(`Tìm '${query.key}' = pref + '{' + reverse(suff). Bắt đầu tại root.`, `Find '${query.key}' = pref + '{' + reverse(suff). Start at root.`));
    for (let offset = 0; offset < query.key.length; offset++) {
      position = offset; exists = null; locals.ch = query.key[offset];
      emit(22, "query-character", bi(`Đọc '${locals.ch}' tại đường truy vấn[${offset}].`, `Read '${locals.ch}' at query path[${offset}].`));
      exists = locals.node.children.has(locals.ch);
      emit(23, "query-check", bi(exists ? `Có cạnh '${locals.ch}': dòng 25 sẽ đi xuống nút con.` : `Thiếu cạnh '${locals.ch}': không có từ khớp cả prefix và suffix.`, exists ? `Edge '${locals.ch}' exists: line 25 will move to its child.` : `Edge '${locals.ch}' is missing: no word matches both prefix and suffix.`));
      if (!exists) {
        query.result = -1; outputs.push(-1);
        emit(24, "query-return", bi("Trả -1 ngay khi thiếu cạnh; không đọc phần còn lại của truy vấn.", "Return -1 on the missing edge; the rest of the query is not read."), index === queries.length - 1);
        break;
      }
      locals.node = locals.node.children.get(locals.ch);
      emit(25, "query-move", bi(`node đi đến #${locals.node.id}, đường '${locals.node.path}', index đang lưu = ${locals.node.index}.`, `node moves to #${locals.node.id}, path '${locals.node.path}', stored index = ${locals.node.index}.`));
    }
    if (query.result === null) {
      position = query.key.length; exists = null;
      emit(22, "query-end", bi("Đã đi hết đường truy vấn. Không cần đi đến lá: index tại nút hiện tại đã lưu đáp án.", "The query path is exhausted. No leaf is required: the current node's index already stores the answer."));
      query.result = locals.node.index; outputs.push(query.result);
      emit(26, "query-return", bi(`Trả node.index = ${query.result}: chỉ số lớn nhất của từ khớp.`, `Return node.index = ${query.result}: the largest matching word index.`), index === queries.length - 1);
    }
  });
  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.prefixSuffix745TrieView.nextLine = nextLine;
    step.prefixSuffix745TrieView.nextSource = nextLine === null ? null : SOURCE[nextLine - 1];
  });
  return { original: [...words], answer: [...outputs], steps };
}

module.exports = { SOURCE, buildSteps };
