"use strict";

const ALPHABET_SIZE = 10;
const MAX_WORD_LENGTH = 24;
const bi = (vi, en) => ({ vi, en });

const SOURCE = Object.freeze([
  "class Solution:",
  "    def wonderfulSubstrings(self, word: str) -> int:",
  "        frequency = [0] * (1 << 10)",
  "        frequency[0] = 1",
  "",
  "        mask = 0",
  "        answer = 0",
  "",
  "        for char in word:",
  "            mask ^= 1 << (ord(char) - ord(\"a\"))",
  "",
  "            answer += frequency[mask]",
  "",
  "            for bit in range(10):",
  "                answer += frequency[mask ^ (1 << bit)]",
  "",
  "            frequency[mask] += 1",
  "",
  "        return answer",
]);

function fail(ErrorType, vi, en) {
  throw new ErrorType(`#1915: ${vi} / ${en}`);
}

function parse1915(input) {
  if (typeof input !== "string") {
    fail(TypeError, "word phải là chuỗi", "word must be a string");
  }
  const word = input.trim();
  if (!word.length || word.length > MAX_WORD_LENGTH) {
    fail(RangeError, `word phải có 1..${MAX_WORD_LENGTH} ký tự`, `word must contain 1..${MAX_WORD_LENGTH} characters`);
  }
  if (!/^[a-j]+$/.test(word)) {
    fail(RangeError, "word chỉ được chứa a..j", "word may contain only a..j");
  }
  return { word };
}

const binaryMask = (mask) => mask.toString(2).padStart(ALPHABET_SIZE, "0");
const oddLetters = (mask) => Array.from({ length: ALPHABET_SIZE }, (_, bit) =>
  mask & (1 << bit) ? String.fromCharCode(97 + bit) : null).filter(Boolean);

function buildSteps1915(input) {
  const { word } = parse1915(input);
  const frequency = Array(1 << ALPHABET_SIZE).fill(0);
  const positions = Array.from({ length: 1 << ALPHABET_SIZE }, () => []);
  frequency[0] = 1;
  positions[0].push(-1);

  const steps = [];
  const prefixes = [{ index: -1, char: "∅", mask: 0, binary: binaryMask(0), stored: true }];
  const recentMatches = [];
  let index = -1;
  let char = null;
  let mask = 0;
  let maskBefore = 0;
  let answer = 0;
  let answerBefore = 0;
  let exactContribution = 0;
  let oneBitContribution = 0;
  let activeProbe = null;
  let evaluatedProbeCount = 0;
  let matchesCurrent = [];

  function probes() {
    const candidates = [{ kind: "same", bit: null, letter: "=", candidate: mask }];
    for (let bit = 0; bit < ALPHABET_SIZE; bit += 1) {
      candidates.push({ kind: "flip", bit, letter: String.fromCharCode(97 + bit), candidate: mask ^ (1 << bit) });
    }
    return candidates.map((probe, probeIndex) => ({
      ...probe,
      binary: binaryMask(probe.candidate),
      count: frequency[probe.candidate],
      evaluated: probeIndex < evaluatedProbeCount,
      active: probeIndex === activeProbe,
      positions: [...positions[probe.candidate]],
    }));
  }

  function frequencyEntries() {
    return frequency.flatMap((count, value) => count ? [{
      mask: value,
      binary: binaryMask(value),
      oddLetters: oddLetters(value),
      count,
      positions: [...positions[value]],
    }] : []);
  }

  function push(event, line, title, note, final = false) {
    steps.push({
      title,
      note,
      arr: word.split(""),
      highlight: index >= 0 && !final ? [index] : [],
      mark: Array.from({ length: Math.max(0, index) }, (_, offset) => offset),
      codeLines: [line],
      vars: [
        { name: "mask", value: binaryMask(mask) },
        { name: "answer", value: answer },
        { name: "frequency buckets", value: frequencyEntries().length },
      ],
      final,
      wonderful1915View: {
        problemId: 1915,
        event,
        line,
        source: SOURCE[line - 1] || "",
        word,
        index,
        char,
        mask,
        maskBefore,
        binary: binaryMask(mask),
        oddLetters: oddLetters(mask),
        answer,
        answerBefore,
        exactContribution,
        oneBitContribution,
        activeProbe,
        probes: probes(),
        frequencyEntries: frequencyEntries(),
        prefixes: prefixes.map((prefix) => ({ ...prefix })),
        matchesCurrent: matchesCurrent.map((match) => ({ ...match })),
        recentMatches: recentMatches.slice(-12).map((match) => ({ ...match })),
        final,
      },
    });
  }

  push("init-counter", 4,
    bi("Đặt frequency[0] = 1", "Seed frequency[0] = 1"),
    bi("Prefix rỗng ở vị trí −1 có parity mask 0000000000.", "The empty prefix at position −1 has parity mask 0000000000."));

  for (index = 0; index < word.length; index += 1) {
    char = word[index];
    maskBefore = mask;
    answerBefore = answer;
    exactContribution = 0;
    oneBitContribution = 0;
    activeProbe = null;
    evaluatedProbeCount = 0;
    matchesCurrent = [];
    prefixes.push({ index, char, mask, binary: binaryMask(mask), stored: false });

    push("start-char", 9,
      bi(`Xử lý word[${index}] = '${char}'`, `Process word[${index}] = '${char}'`),
      bi("Counter hiện chỉ chứa các prefix đứng trước ký tự này.", "The counter currently contains only prefixes before this character."));

    const bit = char.charCodeAt(0) - 97;
    mask ^= 1 << bit;
    prefixes[prefixes.length - 1].mask = mask;
    prefixes[prefixes.length - 1].binary = binaryMask(mask);
    push("flip-bit", 10,
      bi(`Lật bit '${char}': ${binaryMask(maskBefore)} → ${binaryMask(mask)}`, `Toggle '${char}': ${binaryMask(maskBefore)} → ${binaryMask(mask)}`),
      bi("Bit 1 nghĩa là chữ cái xuất hiện lẻ lần trong prefix hiện tại.", "A 1 bit means that letter occurs an odd number of times in the current prefix."));

    activeProbe = 0;
    evaluatedProbeCount = 1;
    exactContribution = frequency[mask];
    for (const start of positions[mask]) {
      matchesCurrent.push({ start: start + 1, end: index, text: word.slice(start + 1, index + 1), oddLetters: [] });
    }
    answer += exactContribution;
    push("exact-lookup", 12,
      bi(`Cùng mask: +${exactContribution}`, `Same mask: +${exactContribution}`),
      bi("XOR = 0: mọi tần suất trong substring đều chẵn.", "XOR = 0: every character frequency in the substring is even."));

    for (let toggle = 0; toggle < ALPHABET_SIZE; toggle += 1) {
      activeProbe = toggle + 1;
      evaluatedProbeCount = toggle + 2;
      const candidate = mask ^ (1 << toggle);
      const contribution = frequency[candidate];
      oneBitContribution += contribution;
      const letter = String.fromCharCode(97 + toggle);
      for (const start of positions[candidate]) {
        matchesCurrent.push({ start: start + 1, end: index, text: word.slice(start + 1, index + 1), oddLetters: [letter] });
      }
      answer += contribution;
      push("one-bit-lookup", 15,
        bi(`Cho phép '${letter}' lẻ: +${contribution}`, `Allow odd '${letter}': +${contribution}`),
        bi(`Tra mask hiện tại XOR (1 << ${toggle}).`, `Look up current mask XOR (1 << ${toggle}).`));
    }

    activeProbe = null;
    positions[mask].push(index);
    frequency[mask] += 1;
    prefixes[prefixes.length - 1].stored = true;
    recentMatches.push(...matchesCurrent);
    push("store-prefix", 17,
      bi(`Lưu prefix ${index}: frequency[${binaryMask(mask)}] = ${frequency[mask]}`, `Store prefix ${index}: frequency[${binaryMask(mask)}] = ${frequency[mask]}`),
      bi("Luôn query trước rồi mới insert để không đếm substring rỗng.", "Always query before inserting so the empty substring is never counted."));
  }

  index = word.length - 1;
  char = null;
  activeProbe = null;
  push("done", 19,
    bi(`Có ${answer} wonderful substrings`, `There are ${answer} wonderful substrings`),
    bi("Mỗi vị trí chỉ cần 11 phép tra trên mảng 1024 trạng thái.", "Each position needs only 11 lookups in a 1024-state array."), true);

  return { original: word, answer, steps };
}

module.exports = {
  1915: {
    id: 1915,
    difficulty: "medium",
    slug: "number-of-wonderful-substrings",
    category: { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
    tags: [
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "prefix-xor", vi: "Prefix XOR", en: "Prefix XOR" },
      { key: "frequency-counter", vi: "Bộ đếm tần suất", en: "Frequency Counter" },
      { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
    ],
    title: bi("Number of Wonderful Substrings", "Number of Wonderful Substrings"),
    titleVi: bi("Đếm substring có nhiều nhất một chữ xuất hiện lẻ lần", "Count substrings with at most one odd-frequency letter"),
    statement: bi(
      "Một substring là wonderful nếu nhiều nhất một chữ cái xuất hiện số lần lẻ. Với word chỉ gồm a..j, hãy đếm tất cả wonderful substrings.",
      "A substring is wonderful if at most one letter occurs an odd number of times. Given word containing only a..j, count all wonderful substrings.",
    ),
    defaultInput: "aba",
    inputKind: "string",
    inputLabel: bi("word (chỉ a..j)", "word (a..j only)"),
    allowEmptyInput: false,
    visualizationLimits: { maxWordLength: MAX_WORD_LENGTH, masks: 1 << ALPHABET_SIZE },
    approach: [
      bi("Mã hóa parity của a..j bằng mask 10 bit: bit 1 khi số lần xuất hiện là lẻ.", "Encode the parity of a..j in a 10-bit mask: a bit is 1 exactly when its count is odd."),
      bi("Substring (l..r) có parity = prefix[r] XOR prefix[l−1]. Nó wonderful khi mask này có 0 hoặc 1 bit 1.", "Substring (l..r) has parity prefix[r] XOR prefix[l−1]. It is wonderful exactly when that mask has zero or one set bit."),
      bi("Với mỗi prefix hiện tại, cộng counter[mask] và counter[mask XOR (1<<bit)] cho cả 10 bit.", "For each current prefix, add counter[mask] and counter[mask XOR (1<<bit)] for all 10 bits."),
      bi("Invariant phỏng vấn: counter chỉ chứa prefix trước vị trí hiện tại; query trước insert để không tự ghép prefix với chính nó.", "Interview invariant: the counter contains only earlier prefixes; query before insert so a prefix is never paired with itself."),
    ],
    complexity: {
      time: "O(10n) = O(n)",
      space: "O(2^10) = O(1)",
      note: bi("Bảng có đúng 1024 trạng thái vì alphabet cố định gồm 10 chữ.", "The table has exactly 1024 states because the alphabet is fixed at 10 letters."),
    },
    code: [...SOURCE],
    debugMode: "line-by-line",
    parser: parse1915,
    liveArgs(input) {
      return [parse1915(input).word];
    },
    builder: buildSteps1915,
  },
};
