// #2135 — Count Words Obtained After Adding a Letter
// Reverse the operation: remove one letter from each target and look up the
// remaining character-set bitmask among the start words.

const CODE2135 = [
  "from typing import List",
  "",
  "class Solution:",
  "    def wordCount(self, startWords: List[str], targetWords: List[str]) -> int:",
  "        def mask(word):",
  "            value = 0",
  "            for ch in word:",
  "                value |= 1 << (ord(ch) - ord('a'))",
  "            return value",
  "",
  "        starts = {mask(word) for word in startWords}",
  "        answer = 0",
  "",
  "        for word in targetWords:",
  "            target = mask(word)",
  "",
  "            for ch in word:",
  "                without_ch = target ^ (1 << (ord(ch) - ord('a')))",
  "                if without_ch in starts:",
  "                    answer += 1",
  "                    break",
  "",
  "        return answer",
];

const MAX_WORDS2135 = 60;

function parseWordList2135(input, label) {
  let raw;
  if (Array.isArray(input)) raw = input;
  else {
    const text = String(input ?? "").trim();
    if (!text) throw new Error(`${label} không được rỗng`);
    if (text.startsWith("[")) {
      try { raw = JSON.parse(text); } catch (_error) { throw new Error(`${label} JSON không hợp lệ`); }
    } else raw = text.split(",").map((word) => word.trim()).filter(Boolean);
  }
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_WORDS2135) {
    throw new Error(`${label} cần 1–${MAX_WORDS2135} từ`);
  }
  const words = raw.map((word) => String(word).trim().toLowerCase());
  const seenWords = new Set();
  for (const word of words) {
    if (!/^[a-z]{1,26}$/.test(word)) throw new Error(`${label}: "${word}" chỉ được chứa 1–26 chữ cái a-z`);
    if (new Set(word).size !== word.length) throw new Error(`${label}: "${word}" có ký tự lặp`);
    if (seenWords.has(word)) throw new Error(`${label}: từ "${word}" bị trùng`);
    seenWords.add(word);
  }
  return words;
}

function parseInput2135(input, params = {}) {
  return {
    startWords: parseWordList2135(input, "startWords"),
    targetWords: parseWordList2135(params.targetWords ?? "tack,act,acti", "targetWords"),
  };
}

function buildSteps2135(input, params = {}) {
  const { startWords, targetWords } = parseInput2135(input, params);
  const toMask = (word) => {
    let value = 0;
    for (const ch of word) value = (value | (1 << (ch.charCodeAt(0) - 97))) >>> 0;
    return value;
  };
  const maskLetters = (value) => Array.from({ length: 26 }, (_, index) => (
    value & (1 << index) ? String.fromCharCode(97 + index) : null
  )).filter(Boolean).join("");
  const startMaskSet = new Set();
  const startEntries = [];
  const verdicts = [];
  const steps = [];
  let answer = 0;

  const snapshot = ({ phase, title, note, codeLines, currentTarget = null, targetMask = null, removedChar = null, candidateMask = null, attempts = [], matchedStart = null, final = false }) => {
    steps.push({
      title,
      arr: targetWords.map((word) => word.length),
      sub: [...targetWords],
      highlight: currentTarget === null ? [] : [targetWords.indexOf(currentTarget)],
      mark: verdicts.filter((entry) => entry.matched).map((entry) => targetWords.indexOf(entry.word)),
      final,
      codeLines,
      vars: [
        { name: "answer", value: answer },
        { name: "start masks", value: startMaskSet.size },
        { name: "target", value: currentTarget ?? "—" },
        ...(removedChar === null ? [] : [{ name: "remove", value: removedChar }]),
        ...(candidateMask === null ? [] : [{ name: "candidate key", value: maskLetters(candidateMask) || "∅" }]),
      ],
      note,
      countWords2135View: {
        phase,
        startWords: [...startWords],
        targetWords: [...targetWords],
        startEntries: startEntries.map((entry) => ({ ...entry })),
        currentTarget,
        targetMask,
        removedChar,
        candidateMask,
        candidateLetters: candidateMask === null ? null : maskLetters(candidateMask),
        attempts: attempts.map((entry) => ({ ...entry })),
        matchedStart,
        verdicts: verdicts.map((entry) => ({ ...entry })),
        answer,
      },
    });
  };

  snapshot({
    phase: "intro",
    title: { vi: "Đảo chiều phép biến đổi", en: "Reverse the transformation" },
    codeLines: [4, 5],
    note: {
      vi: "Thay vì thử thêm 25 chữ vào từng startWord, ta bỏ đúng một chữ khỏi targetWord rồi hỏi phần còn lại có nằm trong start set không.",
      en: "Instead of trying additions for every startWord, remove exactly one letter from each targetWord and ask whether the remainder is in the start set.",
    },
  });

  for (const word of startWords) {
    const mask = toMask(word);
    startMaskSet.add(mask);
    startEntries.push({ word, mask, letters: maskLetters(mask) });
    snapshot({
      phase: "build",
      title: { vi: `Lưu start "${word}" thành {${maskLetters(mask)}}`, en: `Store start "${word}" as {${maskLetters(mask)}}` },
      codeLines: [5, 6, 7, 8, 9, 11],
      note: {
        vi: `Bitmask không quan tâm thứ tự ký tự, nên mọi hoán vị của "${word}" có cùng một key.`,
        en: `A bitmask ignores letter order, so every permutation of "${word}" has the same key.`,
      },
    });
  }

  for (const word of targetWords) {
    const targetMask = toMask(word);
    const attempts = [];
    snapshot({
      phase: "target",
      currentTarget: word,
      targetMask,
      title: { vi: `Xét target "${word}"`, en: `Inspect target "${word}"` },
      codeLines: [14, 15],
      note: {
        vi: `Target có ${word.length} chữ, nên có đúng ${word.length} cách bỏ một chữ. Chỉ cần một cách khớp là target hợp lệ.`,
        en: `The target has ${word.length} letters, so there are exactly ${word.length} one-letter removals. One match is enough to validate it.`,
      },
    });

    let matchedStart = null;
    for (const ch of word) {
      const bit = (1 << (ch.charCodeAt(0) - 97)) >>> 0;
      const candidateMask = (targetMask ^ bit) >>> 0;
      const startEntry = startEntries.find((entry) => entry.mask === candidateMask) || null;
      attempts.push({ removed: ch, candidateMask, letters: maskLetters(candidateMask), matched: Boolean(startEntry), startWord: startEntry?.word ?? null });
      snapshot({
        phase: startEntry ? "match" : "try",
        currentTarget: word,
        targetMask,
        removedChar: ch,
        candidateMask,
        attempts,
        matchedStart: startEntry?.word ?? null,
        title: startEntry
          ? { vi: `Bỏ '${ch}' → khớp start "${startEntry.word}"`, en: `Remove '${ch}' → matches start "${startEntry.word}"` }
          : { vi: `Bỏ '${ch}' → không có trong start set`, en: `Remove '${ch}' → absent from the start set` },
        codeLines: startEntry ? [17, 18, 19, 20, 21] : [17, 18, 19],
        note: startEntry
          ? { vi: `Phần còn lại {${maskLetters(candidateMask)}} đúng bằng mask của "${startEntry.word}". Tăng answer và break để target này chỉ được đếm một lần.`, en: `The remainder {${maskLetters(candidateMask)}} equals the mask of "${startEntry.word}". Increment answer and break so this target is counted once.` }
          : { vi: `Key {${maskLetters(candidateMask)}} không tồn tại; thử bỏ ký tự tiếp theo.`, en: `Key {${maskLetters(candidateMask)}} is absent; try removing the next letter.` },
      });
      if (startEntry) {
        matchedStart = startEntry.word;
        answer++;
        break;
      }
    }
    verdicts.push({ word, matched: matchedStart !== null, startWord: matchedStart, attempts: attempts.length });
    snapshot({
      phase: "verdict",
      currentTarget: word,
      targetMask,
      attempts,
      matchedStart,
      title: matchedStart
        ? { vi: `"${word}" hợp lệ · answer = ${answer}`, en: `"${word}" is valid · answer = ${answer}` }
        : { vi: `"${word}" không tạo được`, en: `"${word}" cannot be formed` },
      codeLines: matchedStart ? [20, 21] : [14],
      note: matchedStart
        ? { vi: `Có thể thêm đúng một chữ vào "${matchedStart}" rồi sắp xếp để được "${word}".`, en: `Add exactly one letter to "${matchedStart}" and rearrange to obtain "${word}".` }
        : { vi: "Không cách bỏ một chữ nào tạo ra mask thuộc startWords.", en: "No one-letter removal produces a mask from startWords." },
    });
  }

  snapshot({
    phase: "answer",
    final: true,
    title: { vi: `Có ${answer} target word hợp lệ`, en: `${answer} target words are valid` },
    codeLines: [23],
    note: {
      vi: `Mỗi target được đếm tối đa một lần nhờ break ngay sau match đầu tiên.`,
      en: `Each target is counted at most once because the loop breaks after its first match.`,
    },
  });
  return { original: { startWords, targetWords }, answer, steps };
}

module.exports = {
  2135: {
    id: 2135,
    difficulty: "medium",
    slug: "count-words-obtained-after-adding-a-letter",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
      { key: "hash-set", vi: "Hash Set", en: "Hash Set" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
    ],
    title: { vi: "Count Words Obtained After Adding a Letter", en: "Count Words Obtained After Adding a Letter" },
    titleVi: { vi: "Đếm target tạo được sau khi thêm một chữ", en: "Count targets formed by adding one letter" },
    statement: {
      vi: "Với mỗi startWord, được thêm đúng một chữ chưa có rồi sắp xếp lại. Đếm số targetWords có thể thu được.",
      en: "For each startWord, add exactly one letter not already present and rearrange. Count how many targetWords can be obtained.",
    },
    defaultInput: "ant,act,tack",
    inputKind: "string",
    inputLabel: { vi: "startWords (cách nhau bởi dấu phẩy)", en: "startWords (comma separated)" },
    extraParams: [
      { key: "targetWords", type: "string", label: { vi: "targetWords (cách nhau bởi dấu phẩy)", en: "targetWords (comma separated)" }, default: "tack,act,acti" },
    ],
    approach: [
      { vi: "Biểu diễn tập ký tự của mỗi startWord bằng bitmask 26 bit; thứ tự ký tự tự động bị bỏ qua.", en: "Represent each startWord's character set with a 26-bit mask; letter order disappears automatically." },
      { vi: "Với từng targetWord, thử bỏ mỗi chữ bằng XOR rồi tra mask còn lại trong hash set.", en: "For each targetWord, remove each letter with XOR and look up the remaining mask in the hash set." },
      { vi: "Gặp một mask khớp thì tăng kết quả và break, vì mỗi target chỉ được đếm một lần.", en: "On the first matching mask, increment and break because each target counts only once." },
    ],
    complexity: {
      time: "O(S + T)",
      space: "O(S)",
      note: {
        vi: "S và T là tổng số ký tự trong startWords và targetWords; mỗi ký tự được xử lý O(1) bằng bitmask/hash set.",
        en: "S and T are total characters in startWords and targetWords; each character takes O(1) bitmask/hash-set work.",
      },
    },
    code: CODE2135,
    liveArgs: (input, params) => {
      const { startWords, targetWords } = parseInput2135(input, params);
      return [startWords, targetWords];
    },
    builder: buildSteps2135,
  },
};
