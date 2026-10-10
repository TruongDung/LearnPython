"use strict";

const { bi } = require("./hard-viz-shared");

const PROBLEM_ID = 1048;
const MAX_WORDS = 1_000;
const MAX_WORD_LENGTH = 16;
const MAX_TRACE_STEPS = 320;

const SOURCE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def longestStrChain(self, words: List[str]) -> int:",
  "        words.sort(key=len)",
  "        dp = {}",
  "        answer = 0",
  "",
  "        for word in words:",
  "            best = 1",
  "            for i in range(len(word)):",
  "                predecessor = word[:i] + word[i + 1:]",
  "                best = max(best, dp.get(predecessor, 0) + 1)",
  "            dp[word] = best",
  "            answer = max(answer, best)",
  "",
  "        return answer",
]);

function parseWords1048(input) {
  let raw = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new RangeError(`#${PROBLEM_ID}: words không được rỗng / must not be empty.`);
    if (text.startsWith("[")) {
      try {
        raw = JSON.parse(text);
      } catch (_error) {
        throw new TypeError(`#${PROBLEM_ID}: words phải là JSON hợp lệ / must be valid JSON.`);
      }
    } else {
      raw = text.split(",").map((word) => word.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_WORDS) {
    throw new RangeError(`#${PROBLEM_ID}: cần 1..${MAX_WORDS} words / provide 1..${MAX_WORDS} words.`);
  }
  const words = raw.map((word, index) => {
    if (typeof word !== "string" || !new RegExp(`^[a-z]{1,${MAX_WORD_LENGTH}}$`).test(word)) {
      throw new RangeError(`#${PROBLEM_ID}: word ${index + 1} phải gồm 1..${MAX_WORD_LENGTH} chữ thường a-z.`);
    }
    return word;
  });
  if (new Set(words).size !== words.length) {
    throw new RangeError(`#${PROBLEM_ID}: words phải khác nhau / must be unique.`);
  }
  return words;
}

function buildSteps1048(input) {
  const original = parseWords1048(input);
  const words = [...original].sort((left, right) => left.length - right.length);
  const dp = new Map();
  const parent = new Map();
  const steps = [];
  let answer = 0;
  let answerWord = null;
  let currentWord = null;
  let currentIndex = null;
  let removedIndex = null;
  let predecessor = null;
  let candidateLength = null;
  let wordBest = null;
  let wordParent = null;
  let traceTruncated = false;

  const chainTo = (word) => {
    const chain = [];
    let cursor = word;
    while (cursor) {
      chain.push(cursor);
      cursor = parent.get(cursor) ?? null;
    }
    return chain.reverse();
  };

  const emit = ({ phase, title, note, codeLines, hit = null, improved = false, final = false }) => {
    if (!final && steps.length >= MAX_TRACE_STEPS - 1) {
      traceTruncated = true;
      return;
    }
    const dpEntries = [...dp.entries()].map(([word, length]) => ({
      word,
      length,
      parent: parent.get(word) ?? null,
      active: word === currentWord,
      best: word === answerWord,
    }));
    const activeChain = wordBest && currentWord
      ? [...(wordParent ? chainTo(wordParent) : []), currentWord]
      : answerWord ? chainTo(answerWord) : [];
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: words.map((word) => word.length),
      sub: [...words],
      highlight: Number.isInteger(currentIndex) ? [currentIndex] : [],
      mark: answerWord ? [words.indexOf(answerWord)] : [],
      vars: [
        { name: "word", value: currentWord ?? "—" },
        { name: "predecessor", value: predecessor ?? "—" },
        { name: "best", value: wordBest ?? "—" },
        { name: "answer", value: answer },
        { name: "dp size", value: dp.size },
      ],
      stringChain1048View: {
        phase,
        words: [...words],
        original: [...original],
        processedCount: dp.size,
        currentWord,
        currentIndex,
        removedIndex,
        predecessor,
        predecessorLength: predecessor === null ? null : dp.get(predecessor) ?? 0,
        candidateLength,
        hit,
        improved,
        wordBest,
        wordParent,
        answer,
        answerWord,
        chain: activeChain,
        dpEntries,
        traceTruncated,
        finalAnswer: final ? answer : null,
      },
    });
  };

  emit({
    phase: "sort",
    title: bi("Sắp xếp từ ngắn đến dài", "Sort words from shortest to longest"),
    note: bi("Khi xử lý một word, mọi predecessor ngắn hơn đúng một ký tự đã có trong dp.", "When a word is processed, every one-character-shorter predecessor is already in dp."),
    codeLines: [1, 3, 4, 5],
  });
  emit({
    phase: "init",
    title: bi("Khởi tạo bảng DP", "Initialize the DP table"),
    note: bi("dp[word] là độ dài chain tốt nhất kết thúc chính xác tại word.", "dp[word] is the best chain length ending exactly at word."),
    codeLines: [6, 7],
  });

  words.forEach((word, index) => {
    currentWord = word;
    currentIndex = index;
    removedIndex = null;
    predecessor = null;
    candidateLength = null;
    wordBest = 1;
    wordParent = null;
    emit({
      phase: "word",
      title: bi(`Bắt đầu word “${word}” với chain 1`, `Start word “${word}” with chain 1`),
      note: bi("Một word đứng một mình luôn tạo được chain dài 1.", "A word by itself always forms a chain of length 1."),
      codeLines: [9, 10],
    });

    for (let i = 0; i < word.length; i += 1) {
      removedIndex = i;
      predecessor = word.slice(0, i) + word.slice(i + 1);
      const predecessorLength = dp.get(predecessor) ?? 0;
      candidateLength = predecessorLength + 1;
      const hit = dp.has(predecessor);
      emit({
        phase: hit ? "hit" : "miss",
        title: hit
          ? bi(`Xóa '${word[i]}' → tìm thấy “${predecessor}”`, `Delete '${word[i]}' → found “${predecessor}”`)
          : bi(`Xóa '${word[i]}' → “${predecessor || "∅"}” chưa có`, `Delete '${word[i]}' → “${predecessor || "∅"}” is absent`),
        note: hit
          ? bi(`dp[${predecessor}] = ${predecessorLength}, nên candidate = ${predecessorLength} + 1 = ${candidateLength}.`, `dp[${predecessor}] = ${predecessorLength}, so candidate = ${predecessorLength} + 1 = ${candidateLength}.`)
          : bi("Chuỗi sau khi xóa không phải word đã xử lý; candidate mặc định chỉ là 1.", "The deletion is not a processed word; the candidate remains the base length 1."),
        codeLines: [11, 12, 13],
        hit,
      });
      if (candidateLength > wordBest) {
        wordBest = candidateLength;
        wordParent = predecessor;
        emit({
          phase: "improve",
          title: bi(`best của “${word}” tăng lên ${wordBest}`, `“${word}” best increases to ${wordBest}`),
          note: bi(`Nối “${word}” sau chain kết thúc tại “${predecessor}”.`, `Append “${word}” to the chain ending at “${predecessor}”.`),
          codeLines: [13],
          hit: true,
          improved: true,
        });
      }
    }

    dp.set(word, wordBest);
    parent.set(word, wordParent);
    emit({
      phase: "store",
      title: bi(`Lưu dp[“${word}”] = ${wordBest}`, `Store dp[“${word}”] = ${wordBest}`),
      note: bi(wordParent ? `Predecessor tốt nhất là “${wordParent}”.` : "Không predecessor nào tồn tại; chain bắt đầu tại đây.", wordParent ? `The best predecessor is “${wordParent}”.` : "No predecessor exists; a chain starts here."),
      codeLines: [14],
    });
    if (wordBest > answer) {
      answer = wordBest;
      answerWord = word;
      emit({
        phase: "answer",
        title: bi(`Global answer tăng lên ${answer}`, `Global answer increases to ${answer}`),
        note: bi(`Chain tốt nhất hiện tại: ${chainTo(answerWord).join(" → ")}.`, `Current best chain: ${chainTo(answerWord).join(" → ")}.`),
        codeLines: [15],
        improved: true,
      });
    } else {
      emit({
        phase: "answer-keep",
        title: bi(`Giữ global answer = ${answer}`, `Keep global answer = ${answer}`),
        note: bi(`Chain kết thúc tại “${word}” không dài hơn kỷ lục hiện tại.`, `The chain ending at “${word}” does not beat the current record.`),
        codeLines: [15],
      });
    }
  });

  currentWord = answerWord;
  currentIndex = answerWord ? words.indexOf(answerWord) : null;
  removedIndex = null;
  predecessor = null;
  candidateLength = null;
  wordBest = answer;
  wordParent = answerWord ? parent.get(answerWord) ?? null : null;
  emit({
    phase: "done",
    title: bi(`Longest chain có độ dài ${answer}`, `The longest chain has length ${answer}`),
    note: bi(`Một chain tối ưu: ${chainTo(answerWord).join(" → ")}.`, `One optimal chain: ${chainTo(answerWord).join(" → ")}.`),
    codeLines: [17],
    final: true,
  });

  return { original, answer, chain: chainTo(answerWord), steps };
}

module.exports = {
  1048: {
    id: 1048,
    slug: "longest-string-chain",
    difficulty: "medium",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
    ],
    title: bi("Longest String Chain", "Longest String Chain"),
    titleVi: bi("Chuỗi từ dài nhất bằng cách thêm một ký tự", "Longest chain by adding one character"),
    statement: bi("Tìm chain dài nhất sao cho mỗi word kế tiếp được tạo bằng cách chèn đúng một ký tự mà vẫn giữ thứ tự các ký tự cũ.", "Find the longest chain where each next word inserts exactly one character while preserving the order of existing characters."),
    defaultInput: "a,b,ba,bca,bda,bdca",
    inputKind: "string",
    inputLabel: bi("words (cách nhau bởi dấu phẩy hoặc JSON)", "words (comma separated or JSON)"),
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      bi("Sắp xếp words theo độ dài để predecessor luôn được xử lý trước.", "Sort words by length so every predecessor is processed first."),
      bi("Với mỗi word, xóa lần lượt từng ký tự để sinh mọi predecessor có thể.", "For each word, delete each character in turn to generate every possible predecessor."),
      bi("Tra dp trong hash map và lưu chain dài nhất kết thúc tại word.", "Look up dp in a hash map and store the longest chain ending at the word."),
    ],
    complexity: {
      time: "O(n · L²)",
      space: "O(n · L)",
      note: bi("Có L cách xóa; mỗi lần tạo predecessor tốn O(L). L ≤ 16.", "There are L deletions, and building each predecessor costs O(L). L ≤ 16."),
    },
    code: SOURCE,
    parseWords: parseWords1048,
    liveArgs: (input) => [parseWords1048(input)],
    builder: buildSteps1048,
  },
};
