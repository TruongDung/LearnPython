"use strict";

const { bi } = require("./hard-viz-shared");

const SOURCE = Object.freeze([
  "from itertools import product",
  "",
  "class WordFilter:",
  "    def __init__(self, words: list[str]):",
  "        self.lookup = {}",
  "        for index, word in enumerate(words):",
  "            prefixes = [word[:p] for p in range(1, len(word) + 1)]",
  "            suffixes = [word[-s:] for s in range(1, len(word) + 1)]",
  "            for pref, suff in product(prefixes, suffixes):",
  "                self.lookup[(pref, suff)] = index",
  "",
  "    def f(self, pref: str, suff: str) -> int:",
  "        key = (pref, suff)",
  "        return self.lookup.get(key, -1)",
]);

const clone = value => JSON.parse(JSON.stringify(value));
const keyOf = (pref, suff) => `${pref}#${suff}`;

function buildSteps(input, params, parseInput) {
  const { words, queries } = parseInput(input, params);
  const lookup = new Map();
  const steps = [];
  const outputs = [];
  const recent = [];
  let locals = { words };
  let beforeVars = [{ name: "words", value: [...words] }];
  let phase = "build";
  let wordIndex = null;
  let word = null;
  let prefixes = [];
  let suffixes = [];
  let pairIndex = null;
  let pref = null;
  let suff = null;
  let p = null;
  let s = null;
  let previousIndex = null;
  let query = null;

  function emit(line, event, note, final = false) {
    const vars = Object.entries(locals).map(([name, value]) => ({ name, value: clone(value) }));
    const grid = word
      ? prefixes.map(prefix => suffixes.map(suffix => lookup.get(keyOf(prefix, suffix)) ?? null))
      : [];
    steps.push({
      arr: [],
      codeLines: [line],
      codeBlock: 3,
      final,
      title: bi(`Dòng ${line}: ${SOURCE[line - 1].trim()}`, `Line ${line}: ${SOURCE[line - 1].trim()}`),
      note,
      vars,
      prefixSuffix745View: {
        line,
        source: SOURCE[line - 1],
        event,
        phase,
        strategy: "cartesian-product",
        words: [...words],
        wordIndex,
        word,
        p,
        s,
        pref,
        suff,
        prefixes: [...prefixes],
        suffixes: [...suffixes],
        pairIndex,
        pairCount: prefixes.length * suffixes.length,
        previousIndex,
        lookupSize: lookup.size,
        grid,
        recent: recent.slice(-6).map(entry => ({ ...entry })),
        outputs: [...outputs],
        query: query ? { ...query } : null,
        beforeVars: clone(beforeVars),
        nextLine: null,
        nextSource: null,
      },
    });
    beforeVars = vars;
  }

  emit(5, "initialize", bi(
    "Khởi tạo bảng tra giống cách 1; khác biệt nằm ở cách sinh các cặp prefix/suffix.",
    "Initialize the same lookup as approach 1; only pair generation changes.",
  ));
  words.forEach((value, index) => {
    wordIndex = index;
    word = value;
    prefixes = [];
    suffixes = [];
    pairIndex = pref = suff = p = s = previousIndex = null;
    locals = { words, index, word };
    emit(6, "word", bi(
      `Xử lý words[${index}] = '${word}'. Index tăng dần nên phép gán sau giữ chỉ số lớn nhất.`,
      `Process words[${index}] = '${word}'. Increasing indices make later assignments retain the largest index.`,
    ));

    prefixes = Array.from({ length: word.length }, (_, offset) => word.slice(0, offset + 1));
    locals.prefixes = [...prefixes];
    emit(7, "prefixes", bi(
      `Sinh một chiều prefix: [${prefixes.map(value => `'${value}'`).join(", ")}]. Không có vòng suffix bên trong.`,
      `Build one prefix axis: [${prefixes.map(value => `'${value}'`).join(", ")}]. There is no suffix loop inside it.`,
    ));

    suffixes = Array.from({ length: word.length }, (_, offset) => word.slice(-offset - 1));
    locals.suffixes = [...suffixes];
    emit(8, "suffixes", bi(
      `Sinh độc lập một chiều suffix: [${suffixes.map(value => `'${value}'`).join(", ")}].`,
      `Independently build one suffix axis: [${suffixes.map(value => `'${value}'`).join(", ")}].`,
    ));

    const pairs = prefixes.flatMap(prefix => suffixes.map(suffix => [prefix, suffix]));
    let offset = 0;
    for (const [prefix, suffix] of pairs) {
      pairIndex = offset;
      pref = prefix;
      suff = suffix;
      p = prefixes.indexOf(pref) + 1;
      s = suffixes.indexOf(suff) + 1;
      previousIndex = null;
      locals.pref = pref;
      locals.suff = suff;
      emit(9, "product-pair", bi(
        `product trả cặp ${offset + 1}/${prefixes.length * suffixes.length}: ('${pref}', '${suff}'). Đây là một vòng for duy nhất trong code Python.`,
        `product yields pair ${offset + 1}/${prefixes.length * suffixes.length}: ('${pref}', '${suff}'). The Python code has one explicit for loop.`,
      ));
      previousIndex = lookup.get(keyOf(pref, suff)) ?? null;
      lookup.set(keyOf(pref, suff), index);
      recent.push({ pref, suff, before: previousIndex, index });
      emit(10, "write", bi(
        previousIndex === null
          ? "Ghi cặp Cartesian mới vào lookup."
          : `Cặp đã giữ index ${previousIndex}; ghi đè bằng index lớn hơn ${index}.`,
        previousIndex === null
          ? "Write the new Cartesian pair into lookup."
          : `The pair held index ${previousIndex}; overwrite it with the larger index ${index}.`,
      ));
      offset += 1;
    }
    pairIndex = prefixes.length * suffixes.length;
    pref = suff = p = s = previousIndex = null;
    emit(9, "product-end", bi(
      `Tích Descartes hoàn tất: ${prefixes.length} × ${suffixes.length} = ${pairIndex} cặp.`,
      `Cartesian product complete: ${prefixes.length} × ${suffixes.length} = ${pairIndex} pairs.`,
    ));
  });

  phase = "ready";
  outputs.push(null);
  wordIndex = word = pairIndex = pref = suff = p = s = previousIndex = null;
  prefixes = [];
  suffixes = [];
  emit(6, "constructor-end", bi(
    `WordFilter đã xây xong với ${lookup.size} khóa; constructor trả None (null).`,
    `WordFilter is ready with ${lookup.size} keys; the constructor returns None (null).`,
  ));

  queries.forEach(([prefix, suffix], index) => {
    phase = "query";
    pref = prefix;
    suff = suffix;
    locals = { pref, suff };
    beforeVars = [{ name: "pref", value: pref }, { name: "suff", value: suff }];
    query = { index, pref, suff, result: null };
    locals.key = [pref, suff];
    emit(13, "query-key", bi(
      "Tạo tuple truy vấn. Sau khi tiền xử lý Cartesian, f chỉ cần tra đúng một khóa.",
      "Build the query tuple. After Cartesian preprocessing, f needs one exact lookup.",
    ));
    query.result = lookup.get(keyOf(pref, suff)) ?? -1;
    outputs.push(query.result);
    emit(14, "query-return", bi(
      query.result === -1
        ? "Khóa không tồn tại nên trả -1."
        : `'${words[query.result]}' tại index ${query.result} là từ khớp có index lớn nhất.`,
      query.result === -1
        ? "The key is absent, so return -1."
        : `'${words[query.result]}' at index ${query.result} is the largest-index match.`,
    ), index === queries.length - 1);
  });

  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.prefixSuffix745View.nextLine = nextLine;
    step.prefixSuffix745View.nextSource = nextLine === null ? null : SOURCE[nextLine - 1];
  });
  return { original: [...words], answer: [...outputs], steps };
}

module.exports = { SOURCE, buildSteps };
