"use strict";

const { bi, parseStringArray, parsePlainParams } = require("./hard-viz-shared");
const TRIE_745 = require("./prefix-suffix-trie-745");
const SOURCE = Object.freeze([
  "class WordFilter:",
  "    def __init__(self, words: list[str]):",
  "        self.lookup = {}",
  "        for index, word in enumerate(words):",
  "            for p in range(1, len(word) + 1):",
  "                pref = word[:p]",
  "                for s in range(1, len(word) + 1):",
  "                    suff = word[-s:]",
  "                    self.lookup[(pref, suff)] = index",
  "",
  "    def f(self, pref: str, suff: str) -> int:",
  "        key = (pref, suff)",
  "        return self.lookup.get(key, -1)",
]);

function parseInput(input, params) {
  const words = parseStringArray(input, { problemId: 745, name: "words", minLength: 1, maxLength: 10, maxWordLength: 7 });
  const options = parsePlainParams(params, 745);
  let queries = options.queries;
  if (typeof queries === "string") {
    try { queries = JSON.parse(queries); } catch (_) { throw new TypeError("#745: queries phải là JSON / queries must be JSON."); }
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 12) throw new RangeError("#745: cần 1..12 truy vấn / provide 1..12 queries.");
  queries = queries.map((query, index) => {
    if (!Array.isArray(query) || query.length !== 2 || query.some(value => typeof value !== "string" || !/^[a-z]{1,7}$/.test(value))) {
      throw new TypeError(`#745: queries[${index}] phải là [pref,suff], mỗi chuỗi 1..7 chữ a-z / must be [pref,suff], each containing 1..7 lowercase letters.`);
    }
    return [...query];
  });
  return { words, queries };
}

const keyOf = (pref, suff) => `${pref}#${suff}`;

function buildSteps(input, params) {
  const { words, queries } = parseInput(input, params);
  const lookup = new Map();
  const steps = [];
  const outputs = [];
  const recent = [];
  let locals = { words };
  let phase = "build";
  let wordIndex = null;
  let word = null;
  let p = null;
  let s = null;
  let pref = null;
  let suff = null;
  let previousIndex = null;
  let query = null;
  let previousVars = [{ name: "words", value: [...words] }];
  function emit(line, event, title, note, final = false) {
    const vars = Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value }));
    const grid = word ? Array.from({ length: word.length }, (_, row) => Array.from({ length: word.length }, (_, column) => lookup.get(keyOf(word.slice(0, row + 1), word.slice(-column - 1))) ?? null)) : [];
    steps.push({
      arr: [], codeLines: [line], final, title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note, vars,
      prefixSuffix745View: {
        line, source: SOURCE[line - 1], event, phase, words: [...words], wordIndex, word, p, s, pref, suff, previousIndex,
        lookupSize: lookup.size, grid, recent: recent.slice(-6).map(entry => ({ ...entry })), outputs: [...outputs],
        query: query ? { ...query } : null,
        beforeVars: previousVars.map(entry => ({ ...entry, value: Array.isArray(entry.value) ? [...entry.value] : entry.value })),
        nextLine: null, nextSource: null,
      },
    });
    previousVars = vars;
  }
  emit(3, "initialize", bi("self.lookup = {}", "self.lookup = {}"), bi("Bảng tra rỗng: mỗi khóa (prefix,suffix) sẽ lưu chỉ số lớn nhất của từ phù hợp.", "Empty lookup: each (prefix,suffix) key will store the largest matching word index."));
  words.forEach((value, index) => {
    wordIndex = index; word = value; p = s = pref = suff = previousIndex = null;
    locals.index = index; locals.word = word;
    emit(4, "word", bi(`index = ${index}, word = '${word}'`, `index = ${index}, word = '${word}'`), bi("Xử lý từ theo index tăng dần. Ghi đè khóa cũ bằng index mới sẽ giữ đáp án lớn nhất.", "Process words in increasing index order. Overwriting an old key with the new index retains the largest answer."));
    for (let length = 1; length <= word.length; length++) {
      p = length; pref = suff = s = previousIndex = null; locals.p = p;
      emit(5, "prefix-loop", bi(`p = ${p}`, `p = ${p}`), bi("Chọn độ dài prefix. Dòng tiếp theo mới cắt word[:p].", "Choose the prefix length. The next line slices word[:p]."));
      pref = word.slice(0, p); locals.pref = pref;
      emit(6, "prefix", bi(`pref = '${pref}'`, `pref = '${pref}'`), bi(`Lấy ${p} ký tự đầu của '${word}'.`, `Take the first ${p} characters of '${word}'.`));
      for (let suffixLength = 1; suffixLength <= word.length; suffixLength++) {
        s = suffixLength; suff = previousIndex = null; locals.s = s;
        emit(7, "suffix-loop", bi(`s = ${s}`, `s = ${s}`), bi("Chọn độ dài suffix; chưa cắt chuỗi ở bước này.", "Choose the suffix length; it has not been sliced yet."));
        suff = word.slice(-s); locals.suff = suff;
        emit(8, "suffix", bi(`suff = '${suff}'`, `suff = '${suff}'`), bi(`Lấy ${s} ký tự cuối. Prefix và suffix có thể chồng lên nhau; không cần p+s <= độ dài từ.`, `Take the last ${s} characters. Prefix and suffix may overlap; p+s does not need to fit within the word length.`));
        const key = keyOf(pref, suff);
        previousIndex = lookup.get(key) ?? null;
        lookup.set(key, index);
        recent.push({ pref, suff, before: previousIndex, index });
        emit(9, "write", bi(`lookup[('${pref}','${suff}')] = ${index}`, `lookup[('${pref}','${suff}')] = ${index}`), bi(previousIndex === null ? "Khóa mới: lưu index của từ này vào ô lưới." : `Khóa đã có index ${previousIndex}; ghi đè thành ${index}, là chỉ số lớn hơn.`, previousIndex === null ? "New key: store this word's index in the grid cell." : `The key held index ${previousIndex}; overwrite it with the larger index ${index}.`));
      }
      emit(7, "suffix-end", bi("Vòng s đã hết", "Suffix loop exhausted"), bi("Đã ghép prefix này với mọi suffix không rỗng. Quay lại vòng p.", "This prefix has been paired with every nonempty suffix. Return to the prefix loop."));
    }
    emit(5, "prefix-end", bi("Vòng p đã hết", "Prefix loop exhausted"), bi("Đã tạo mọi cặp prefix/suffix cho từ hiện tại.", "Every prefix/suffix pair for the current word is indexed."));
  });
  phase = "ready";
  outputs.push(null);
  emit(4, "constructor-end", bi("WordFilter đã xây xong", "WordFilter construction complete"), bi(`Bảng có ${lookup.size} khóa khác nhau. Constructor trả về None (null).`, `The lookup contains ${lookup.size} distinct keys. The constructor returns None (null).`));
  wordIndex = word = p = s = previousIndex = null;
  queries.forEach(([prefix, suffix], index) => {
    phase = "query"; pref = prefix; suff = suffix;
    locals = { pref, suff };
    previousVars = [{ name: "pref", value: pref }, { name: "suff", value: suff }];
    query = { index, pref, suff, result: null };
    locals.key = [pref, suff];
    emit(12, "query-key", bi(`key = ('${pref}','${suff}')`, `key = ('${pref}','${suff}')`), bi("Tạo đúng khóa prefix/suffix cần tìm. Không quét lại danh sách words.", "Build the exact prefix/suffix key. No scan through words is needed."));
    query.result = lookup.get(keyOf(pref, suff)) ?? -1;
    outputs.push(query.result);
    emit(13, "query-return", bi(`return ${query.result}`, `return ${query.result}`), bi(query.result === -1 ? "Không có khóa này: không có từ phù hợp, trả -1." : `'${words[query.result]}' tại index ${query.result} khớp cả prefix và suffix. Đây là index lớn nhất.`, query.result === -1 ? "The key is absent: no matching word exists, so return -1." : `'${words[query.result]}' at index ${query.result} matches both prefix and suffix. This is the largest index.`), index === queries.length - 1);
  });
  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.prefixSuffix745View.nextLine = nextLine;
    step.prefixSuffix745View.nextSource = nextLine === null ? null : SOURCE[nextLine - 1];
  });
  return { original: [...words], answer: [...outputs], steps };
}

module.exports = {
  745: {
    id: 745, difficulty: "hard", slug: "prefix-and-suffix-search",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }, { key: "string", vi: "Chuỗi", en: "String" }, { key: "trie", vi: "Trie", en: "Trie" }],
    title: bi("Tìm từ theo tiền tố và hậu tố", "Prefix and Suffix Search"),
    titleVi: bi("Lập bảng prefix/suffix giữ index lớn nhất", "Index prefix/suffix pairs with the largest word index"),
    statement: bi("WordFilter(words) nhận danh sách từ. f(pref,suff) trả index lớn nhất của từ bắt đầu bằng pref và kết thúc bằng suff; không có thì trả -1. Prefix và suffix có thể chồng lên nhau.", "WordFilter(words) indexes the dictionary. f(pref,suff) returns the largest index of a word starting with pref and ending with suff, or -1 if none exists. Prefix and suffix may overlap."),
    defaultInput: ["apple", "apply", "apple"], inputKind: "stringArray",
    inputLabel: bi("words (1–10 từ; mỗi từ 1–7 chữ a-z)", "words (1–10 words; each 1–7 lowercase letters)"),
    extraParams: [
      { key: "approach", type: "select", default: 1, label: bi("Cách giải", "Approach"), options: [
        { value: 1, label: bi("Cách 1: Hash Map prefix/suffix", "Approach 1: Prefix/suffix Hash Map") },
        { value: 2, label: bi("Cách 2: Trie + đảo suffix", "Approach 2: Trie + reversed suffix") },
      ] },
      { key: "queries", type: "string", default: '[["a","e"],["app","ly"],["x","e"],["apple","apple"]]', label: bi("queries JSON (1–12 cặp [pref,suff])", "queries JSON (1–12 [pref,suff] pairs)") },
    ],
    debugMode: "line-by-line",
    approach: [
      bi("Với mỗi từ, ghép mọi prefix không rỗng với mọi suffix không rỗng. Lưu lookup[(pref,suff)] = index.", "For each word, pair every nonempty prefix with every nonempty suffix. Store lookup[(pref,suff)] = index."),
      bi("Index tăng dần nên khóa trùng được ghi đè bởi index lớn hơn. Từ trùng nhau vẫn có index riêng.", "Indices increase, so duplicate keys are overwritten with a larger index. Duplicate words still have distinct indices."),
      bi("f tạo khóa rồi tra bảng, không quét lại words. Thiếu khóa thì trả -1. Hai đoạn có thể chồng lên nhau.", "f builds the key and looks it up without scanning words. Missing keys return -1. Prefix and suffix may overlap."),
      bi("Cách 2 giữ ý tưởng Trie và suffix đảo ngược: chèn mọi word[:p] + '{' + word[::-1], p = 1..L. Truy vấn đi theo pref + '{' + suff[::-1] và trả index tại nút cuối đường truy vấn.", "Approach 2 retains the Trie and reversed-suffix idea: insert every word[:p] + '{' + word[::-1], p = 1..L. A query follows pref + '{' + suff[::-1] and returns the index at the end of that query path."),
      bi("Chỉ chèn word + '{' + reverse(word) sẽ sai: apple{elppa không chứa đường a{e cho f('a','e'). Phải chèn cả prefix ngắn. Mỗi nút cập nhật index lớn nhất, kể cả root; không cần truy vấn đến lá.", "Inserting only word + '{' + reverse(word) fails: apple{elppa has no a{e path for f('a','e'). Short prefixes must also be inserted. Each node retains the largest index, including the root; queries need not reach a leaf."),
      bi("Mô phỏng nhận tối đa 10 từ và 12 truy vấn để giữ đủ từng dòng; giới hạn đề bài là 10000 từ và 10000 truy vấn.", "The visualization accepts up to 10 words and 12 queries to retain every line; the problem allows 10000 words and 10000 queries."),
    ],
    complexity: { time: "Map: O(N·L³); Trie: O(N·L²); f: O(P + S) expected", space: "Map: O(N·L³); Trie: O(N·L²)", note: bi("Map tạo L² cặp và hash chuỗi O(L). Trie chèn L đường, mỗi đường dài O(L); truy vấn đi P+1+S cạnh. L <= 7. Snapshot chỉ phục vụ mô phỏng.", "Map creates L² pairs and hashes strings in O(L). Trie inserts L paths of O(L) length; queries traverse P+1+S edges. L <= 7. Snapshots are only for visualization.") },
    code: SOURCE, codeLabel: bi("Cách 1: Hash Map prefix/suffix", "Approach 1: Prefix/suffix Hash Map"),
    code2: TRIE_745.SOURCE, code2Label: bi("Cách 2: Trie + đảo suffix", "Approach 2: Trie + reversed suffix"),
    builder: buildSteps, builder2: (input, params) => TRIE_745.buildSteps(input, params, parseInput), parseWordFilter745Input: parseInput,
  },
};
