"use strict";

const { bi, parsePlainParams } = require("./hard-viz-shared");
const DEFAULT_INPUT = "i love coding|i love coffee|we love coding";
const LIMITS = Object.freeze({ maxSentences: 40, maxWords: 240, maxWordLength: 64, maxTraceSteps: 1200 });
const SOURCE = Object.freeze([
  "class Predictor:",
  "    def train(self, sentences):",
  "        counts, winner = {}, {}",
  "        for words in sentences:",
  "            for word, nxt in zip(words, words[1:]):",
  "                counts.setdefault(word, {})[nxt] = counts.get(word, {}).get(nxt, 0) + 1",
  "        for word, choices in counts.items():",
  "            winner[word] = min(choices, key=lambda nxt: (-choices[nxt], nxt))",
  "        self.winner = winner",
  "",
  "    def predict(self, word):",
  "        return self.winner.get(word)",
]);

// Match Python's string ordering, including words outside the BMP.
function compareWords9005(left, right) {
  const a = Array.from(left), b = Array.from(right);
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const difference = a[i].codePointAt(0) - b[i].codePointAt(0);
    if (difference) return difference;
  }
  return a.length - b.length;
}

function parseNextWord9005Input(input = DEFAULT_INPUT, params = {}) {
  const options = parsePlainParams(params, 9005);
  if (typeof input !== "string" || (options.word !== undefined && typeof options.word !== "string")) {
    throw new TypeError("#9005: nhập câu và query dạng chuỗi / sentences and query must be strings.");
  }
  const sentences = input.split("|").map(sentence => sentence.trim().toLowerCase().split(/\s+/).filter(Boolean)).filter(words => words.length);
  const query = (options.word ?? "love").trim().toLowerCase();
  const totalWords = sentences.reduce((sum, words) => sum + words.length, 0);
  if (!sentences.length || !query || /\s/.test(query)) {
    throw new RangeError("#9005: cần câu mẫu và một từ truy vấn / provide training sentences and one query word.");
  }
  if (sentences.length > LIMITS.maxSentences || totalWords > LIMITS.maxWords) {
    throw new RangeError(`#9005: visualization hỗ trợ tối đa ${LIMITS.maxSentences} câu, ${LIMITS.maxWords} từ / visualization supports up to ${LIMITS.maxSentences} sentences and ${LIMITS.maxWords} words.`);
  }
  if ([query, ...sentences.flat()].some(word => Array.from(word).length > LIMITS.maxWordLength)) {
    throw new RangeError(`#9005: mỗi từ tối đa ${LIMITS.maxWordLength} ký tự / each word supports up to ${LIMITS.maxWordLength} characters.`);
  }
  return { sentences, query, totalWords, totalPairs: totalWords - sentences.length };
}

function buildSteps9005(input, params = {}) {
  const { sentences, query, totalWords, totalPairs } = parseNextWord9005Input(input, params);
  const counts = new Map(), winner = new Map(), steps = [];
  let cached = null, word, nxt, words, choices;
  let sentenceIndex = -1, activePair = null, processedPairs = 0, prediction = null;
  const countsObject = () => Object.fromEntries([...counts].map(([key, value]) => [key, Object.fromEntries(value)]));
  const captions = {
    init: bi("Khởi tạo bộ đếm", "Initialize the counters"),
    sentence: bi("Đọc câu mẫu", "Read a training sentence"),
    pair: bi("Chọn hai từ kề nhau", "Select adjacent words"),
    count: bi("Đếm cặp từ · +1", "Count the word pair · +1"),
    loop: bi("Tiếp tục vòng lặp", "Continue the loop"),
    "choose-word": bi("Xét các từ đi sau", "Inspect the next-word candidates"),
    choose: bi("Chọn từ thắng", "Choose the winner"),
    cache: bi("Lưu winner để tra nhanh", "Cache the winners for lookup"),
    predict: bi("Tra từ dự đoán", "Look up the prediction"),
  };

  function emit(line, phase, detail = {}) {
    if (steps.length >= LIMITS.maxTraceSteps) throw new Error("#9005: full trace exceeded its bound");
    const method = phase === "predict" ? "predict" : "train";
    const state = method === "predict" ? { word: query } : {
      sentences, counts: countsObject(), winner: Object.fromEntries(winner),
      ...(words === undefined ? {} : { words }), ...(word === undefined ? {} : { word }),
      ...(nxt === undefined ? {} : { nxt }), ...(choices === undefined ? {} : { choices: Object.fromEntries(choices) }),
    };
    const focusWord = detail.focusWord ?? (activePair ? activePair.word : word ?? query);
    const models = [...counts].map(([key, options]) => ({
      word: key,
      choices: [...options].map(([token, count]) => ({ word: token, count }))
        .sort((a, b) => b.count - a.count || compareWords9005(a.word, b.word)),
      winner: winner.get(key) ?? null,
    }));
    const focus = models.find(model => model.word === focusWord);
    const count = method === "train" ? counts.get(word)?.get(nxt) : undefined;
    steps.push({
      title: captions[phase], note: bi("", ""), arr: [], highlight: [], mark: [], codeLines: [line], final: method === "predict",
      vars: [
        { name: "word", value: state.word ?? "—" },
        { name: "nxt", value: state.nxt ?? "—" },
        { name: "counts[word][nxt]", value: count ?? "—" },
        { name: "winner[word]", value: (method === "predict" ? cached : winner)?.get(state.word) ?? "—" },
        { name: "query", value: query },
      ],
      nextWord9005View: {
        phase, method, source: { line, text: SOURCE[line - 1], timing: "after" },
        locals: JSON.parse(JSON.stringify(state)),
        sentences: sentences.map(sentence => [...sentence]), sentenceIndex,
        activePair: activePair ? { ...activePair } : null,
        query, prediction, focusWord, models,
        choices: focus ? focus.choices.map(choice => ({ ...choice })) : [],
        focusWinner: winner.get(focusWord) ?? null,
        winners: [...winner].map(([key, value]) => ({ word: key, next: value })),
        cacheReady: cached !== null,
        increment: detail.increment ?? null,
        condition: typeof detail.condition === "boolean" ? detail.condition : null,
        exhausted: Boolean(detail.exhausted), processedPairs, totalPairs, totalWords,
      },
    });
  }

  emit(3, "init", { focusWord: query });
  for (let s = 0; s < sentences.length; s++) {
    sentenceIndex = s; words = sentences[s]; activePair = null;
    emit(4, "sentence", { focusWord: words[0], condition: true });
    for (let index = 0; index + 1 < words.length; index++) {
      word = words[index]; nxt = words[index + 1]; activePair = { sentenceIndex: s, index, word, nxt };
      emit(5, "pair", { condition: true });
      if (!counts.has(word)) counts.set(word, new Map());
      const before = counts.get(word).get(nxt) ?? 0;
      counts.get(word).set(nxt, before + 1); processedPairs++;
      emit(6, "count", { increment: { word, nxt, before, after: before + 1 } });
    }
    activePair = null;
    emit(5, "loop", { condition: false, exhausted: true });
  }
  emit(4, "loop", { condition: false, exhausted: true });
  for (const [key, options] of counts) {
    word = key; choices = options;
    emit(7, "choose-word", { condition: true });
    let best = null;
    for (const [token, count] of options) {
      if (best === null || count > options.get(best) || (count === options.get(best) && compareWords9005(token, best) < 0)) best = token;
    }
    winner.set(word, best);
    emit(8, "choose");
  }
  emit(7, "loop", { condition: false, exhausted: true });
  cached = new Map(winner);
  emit(9, "cache", { focusWord: query });
  prediction = cached.get(query) ?? null;
  emit(12, "predict", { focusWord: query });
  return {
    original: sentences.map(sentence => sentence.join(" ")), answer: prediction,
    counts: countsObject(), winner: Object.fromEntries(winner), steps,
  };
}

module.exports = {
  9005: {
    id: 9005, difficulty: "medium", category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }, { key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Next Word Predictor", "Next Word Predictor"), titleVi: bi("Dự đoán từ kế tiếp", "Predict the next word"),
    statement: bi("Đếm các cặp từ kề nhau trong từng câu. Dự đoán từ đi sau query xuất hiện nhiều nhất; hòa thì chọn thứ tự chữ cái nhỏ hơn.", "Count adjacent word pairs within each sentence. Predict the most frequent word after the query; break ties lexicographically."),
    defaultInput: DEFAULT_INPUT, inputKind: "string", inputLabel: bi("Câu mẫu (ngăn bởi |)", "Training sentences (separated by |)"),
    extraParams: [{ key: "word", type: "string", label: bi("Từ truy vấn", "Query word"), default: "love" }],
    approach: [
      bi("Mỗi mũi tên word → nxt đóng góp một lần đếm.", "Each word → nxt arrow contributes one count."),
      bi("Chọn số đếm lớn nhất; hòa thì dùng thứ tự chữ cái. Lưu winner cho mỗi word.", "Choose the largest count, breaking ties lexicographically. Cache each word's winner."),
    ],
    complexity: { time: "O(total words) train · O(1) predict", space: "O(unique bigrams)", note: bi("Train đếm từng cặp và lưu winner; predict tra một lần trong hash map.", "Training counts each pair and caches the winners; prediction uses one hash-map lookup.") },
    code: SOURCE, debugMode: "line-by-line", visualizationLimits: { ...LIMITS },
    parseNextWord9005Input, builder: buildSteps9005,
  },
};
