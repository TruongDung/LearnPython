"use strict";
const { trace, bi } = require("./picture-trace");
const bounds = require("./sliding")[2444], stars = require("./string")[3170];
const boundsCode = [...bounds.code];
function parseBounds(nums, params = {}) {
  const minK = params.minK === undefined ? 1 : params.minK, maxK = params.maxK === undefined ? 5 : params.maxK;
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 100000 || ![...nums, minK, maxK].every(x => Number.isInteger(x) && x >= 1 && x <= 1000000)) throw new Error("nums: 2–100000 số; nums, minK, maxK là số nguyên từ 1 đến 10⁶.");
  return [[...nums], minK, maxK];
}
function buildBounds(input, params) {
  const [nums, minK, maxK] = parseBounds(input, params), T = trace(2444, boundsCode, nums.length <= 30);
  const l = { self: {}, nums, minK, maxK }, found = [];
  let ready = false;
  const view = () => ({ nums: nums.slice(0, T.active ? 30 : 12), total: nums.length, minK, maxK, i: l.i ?? null,
    bad: l.bad ?? null, min_pos: l.min_pos ?? null, max_pos: l.max_pos ?? null, count: ready ? l.count : null, res: l.res ?? 0, found });
  const E = (line, event) => T.emit(line, event, l, view);
  l.res = 0; E(3, "res = 0"); l.bad = -1; E(4, "bad = -1"); l.min_pos = -1; E(5, "min_pos = -1"); l.max_pos = -1; E(6, "max_pos = -1");
  for (let i = 0; i < nums.length; i++) {
    l.i = i; l.num = nums[i]; ready = false; E(7, "read");
    E(8, l.num < minK || l.num > maxK ? "True" : "False");
    if (l.num < minK || l.num > maxK) { l.bad = i; E(9, "bad → i"); }
    E(10, l.num === minK ? "True" : "False"); if (l.num === minK) { l.min_pos = i; E(11, "min_pos → i"); }
    E(12, l.num === maxK ? "True" : "False"); if (l.num === maxK) { l.max_pos = i; E(13, "max_pos → i"); }
    l.count = Math.max(0, Math.min(l.min_pos, l.max_pos) - l.bad); ready = true; E(14, "count");
    l.res += l.count;
    if (T.active) for (let start = l.bad + 1; start <= Math.min(l.min_pos, l.max_pos); start++) found.push({ start, end: i });
    E(15, "res += count");
  }
  ready = false; E(7, "loop end"); E(16, "return");
  return T.finish(l.res, view, nums);
}
const starsCode = [
  "class Solution:", "    def clearStars(self, s):", "        positions = {}", "        removed = [False] * len(s)",
  "        for i, char in enumerate(s):", "            if char != '*':", "                positions.setdefault(ord(char) - ord('a'), []).append(i)", "                continue",
  "            removed[i] = True", "            for letter in range(26):", "                if positions.get(letter):", "                    index = positions[letter].pop()",
  "                    removed[index] = True", "                    break", "        result = ''", "        for j, char in enumerate(s):",
  "            if not removed[j]:", "                result += char", "        return result"
];
function parseStars(s) {
  if (typeof s !== "string" || !/^[a-z*]{1,100000}$/.test(s)) throw new Error("s: 1–100000 ký tự a-z hoặc *.");
  let available = 0;
  for (const char of s) { available += char === "*" ? -1 : 1; if (available < 0) throw new Error("Mỗi * cần ít nhất một chữ chưa xóa bên trái."); }
  return s;
}
function buildStars(input) {
  const s = parseStars(input), T = trace(3170, starsCode, s.length <= 40), l = { self: {}, s };
  let chosen = null, phase = "scan";
  const view = () => ({ s: s.slice(0, T.active ? 40 : 30), total: s.length, i: phase === "result" ? l.j ?? null : l.i ?? null,
    chosen, phase, removed: (l.removed || []).slice(0, T.active ? 40 : 30),
    buckets: Object.entries(l.positions || {}).map(([letter, indices]) => ({ letter: String.fromCharCode(97 + Number(letter)), indices: indices.slice(-6), total: indices.length })).filter(b => b.total),
    result: (l.result || "").slice(0, 80), resultLength: (l.result || "").length, letter: l.letter ?? null });
  const E = (line, event) => T.emit(line, event, l, view);
  l.positions = {}; E(3, "letter stacks"); l.removed = Array(s.length).fill(false); E(4, "removed");
  for (let i = 0; i < s.length; i++) {
    l.i = i; l.char = s[i]; chosen = null; E(5, "read"); E(6, l.char !== "*" ? "True" : "False");
    if (l.char !== "*") { const letter = l.char.charCodeAt(0) - 97; (l.positions[letter] ??= []).push(i); E(7, "push index"); E(8, "continue"); continue; }
    l.removed[i] = true; E(9, "remove *");
    for (let letter = 0; letter < 26; letter++) {
      l.letter = letter; E(10, "a → z"); E(11, l.positions[letter]?.length ? "True" : "False");
      if (l.positions[letter]?.length) {
        l.index = l.positions[letter].pop(); chosen = l.index; E(12, "pop rightmost");
        l.removed[l.index] = true; E(13, "remove letter"); E(14, "break"); break;
      }
    }
  }
  chosen = null; E(5, "loop end"); l.result = ""; phase = "result"; E(15, "result");
  for (let j = 0; j < s.length; j++) { l.j = j; l.char = s[j]; E(16, "read result"); E(17, !l.removed[j] ? "True" : "False"); if (!l.removed[j]) { l.result += l.char; E(18, "append"); } }
  E(16, "loop end"); E(19, "return"); return T.finish(l.result, view, s);
}
module.exports = {
  2444: { ...bounds, code: boundsCode, builder: buildBounds, debugMode: "line-by-line", liveArgs: parseBounds,
    statement: bi("Đoạn hợp lệ phải chứa cả minK và maxK, không chứa số vượt biên.", "A valid range contains both bounds and no out-of-range value."),
    approach: [bi("bad < start ≤ min(min_pos, max_pos)"), bi("Mỗi vị trí start hợp lệ tạo một đoạn kết thúc tại i.", "Each valid start gives one range ending at i.")],
    complexity: { ...bounds.complexity, note: bi("Debug ≤30 số; mảng lớn tính đủ và xem trước 12 số.", "Line debug ≤30 numbers; larger arrays are fully counted with a 12-number preview.") } },
  3170: { ...stars, code: starsCode, builder: buildStars, debugMode: "line-by-line", liveArgs: input => [parseStars(input)],
    statement: bi("Mỗi * xóa chữ nhỏ nhất bên trái. Nếu trùng chữ, xóa index bên phải nhất.", "Each star removes the smallest letter on its left. Break ties by removing the rightmost index."),
    approach: [bi("a → z: chọn stack đầu tiên còn index.", "a → z: choose the first non-empty stack."), bi("Pop index phải nhất → giữ chữ nhỏ ở bên trái.", "Pop the rightmost index to retain smaller letters on the left.")],
    complexity: { ...stars.complexity, note: bi("Debug ≤40 ký tự; chuỗi lớn xử lý đủ và xem trước 30 ký tự.", "Line debug ≤40 characters; longer strings are fully processed with a 30-character preview.") } }
};
