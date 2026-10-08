"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def backspaceCompare(self, s: str, t: str) -> bool:",
  "        i, j = len(s) - 1, len(t) - 1",
  "        skip_s, skip_t = 0, 0",
  "        while i >= 0 or j >= 0:",
  "            while i >= 0:",
  "                if s[i] == '#':",
  "                    skip_s += 1",
  "                    i -= 1",
  "                elif skip_s:",
  "                    skip_s -= 1",
  "                    i -= 1",
  "                else:",
  "                    break",
  "            while j >= 0:",
  "                if t[j] == '#':",
  "                    skip_t += 1",
  "                    j -= 1",
  "                elif skip_t:",
  "                    skip_t -= 1",
  "                    j -= 1",
  "                else:",
  "                    break",
  "            if i < 0 or j < 0:",
  "                return i == j",
  "            if s[i] != t[j]:",
  "                return False",
  "            i -= 1",
  "            j -= 1",
  "        return True",
];

function parseInput(input, params = {}) {
  const s = input;
  const t = params.t;
  if (typeof s !== "string" || !/^[a-z#]{1,100}$/.test(s) || typeof t !== "string" || !/^[a-z#]{1,100}$/.test(t)) {
    throw new Error("844: s and t must each contain 1–100 lowercase letters or # / s và t phải gồm 1–100 chữ thường a–z hoặc #.");
  }
  return { s, t };
}

function buildSteps(input, params) {
  const { s, t } = parseInput(input, params);
  const steps = [];
  const backspacesS = [];
  const backspacesT = [];
  const deletedS = [];
  const deletedT = [];
  const matchedS = [];
  const matchedT = [];
  const matches = [];
  let i = s.length - 1;
  let j = t.length - 1;
  let skipS = 0;
  let skipT = 0;

  const emit = (line, phase, title, note, extra = {}) => steps.push({
    arr: [],
    highlight: [],
    mark: [],
    codeLines: [line],
    title,
    note,
    final: Boolean(extra.final),
    vars: [
      { name: "i", value: i },
      { name: "j", value: j },
      { name: "skip_s", value: skipS },
      { name: "skip_t", value: skipT },
    ],
    backspace844View: {
      s,
      t,
      i,
      j,
      skipS,
      skipT,
      phase,
      activeSide: extra.activeSide || null,
      activeIndex: Number.isInteger(extra.activeIndex) ? extra.activeIndex : null,
      backspacesS: [...backspacesS],
      backspacesT: [...backspacesT],
      deletedS: [...deletedS],
      deletedT: [...deletedT],
      matchedS: [...matchedS],
      matchedT: [...matchedT],
      matches: matches.map((match) => ({ ...match })),
      compared: extra.compared ? { ...extra.compared } : null,
      answer: extra.answer ?? null,
    },
  });

  emit(3, "pointers", bi(`i = ${i}, j = ${j}`, `i = ${i}, j = ${j}`), bi("Quét ngược để biết một chữ có bị dấu # ở bên phải xóa hay không.", "Scan backward so a letter can be matched with any # to its right."));
  emit(4, "skips", bi("skip_s = 0, skip_t = 0", "skip_s = 0, skip_t = 0"), bi("Mỗi bộ đếm lưu số chữ tiếp theo phải bỏ qua trong chuỗi tương ứng.", "Each counter stores how many upcoming letters must be skipped in its string."));

  while (i >= 0 || j >= 0) {
    emit(5, "loop", bi(`i >= 0 hoặc j >= 0 → ${i >= 0 || j >= 0}`, `i >= 0 or j >= 0 → ${i >= 0 || j >= 0}`), bi("Tìm ký tự còn hiển thị tiếp theo của cả hai chuỗi.", "Find the next visible character in both strings."));

    while (i >= 0) {
      emit(6, "scan-s", bi(`Quét s[${i}] = '${s[i]}'`, `Scan s[${i}] = '${s[i]}'`), bi("Đọc s từ phải sang trái với skip_s hiện tại.", "Read s from right to left with the current skip_s."), { activeSide: "s", activeIndex: i });
      if (s[i] === "#") {
        emit(7, "backspace-s-check", bi("Gặp # trong s", "Found # in s"), bi("Dấu # tạo thêm một lần xóa đang chờ.", "The # creates one pending deletion."), { activeSide: "s", activeIndex: i });
        backspacesS.push(i);
        skipS += 1;
        emit(8, "backspace-s", bi(`skip_s += 1 → ${skipS}`, `skip_s += 1 → ${skipS}`), bi("Lần xóa này sẽ áp dụng cho chữ cái gần nhất ở bên trái.", "This deletion will apply to the nearest letter on the left."), { activeSide: "s", activeIndex: i });
        const consumed = i;
        i -= 1;
        emit(9, "move-s", bi(`i -= 1 → ${i}`, `i -= 1 → ${i}`), bi(`Đã xử lý dấu # tại index ${consumed}.`, `Processed the # at index ${consumed}.`), { activeSide: "s", activeIndex: consumed });
      } else if (skipS > 0) {
        emit(10, "delete-s-check", bi(`skip_s = ${skipS} > 0`, `skip_s = ${skipS} > 0`), bi(`Chữ '${s[i]}' bị một dấu # bên phải xóa.`, `Letter '${s[i]}' is erased by a # to its right.`), { activeSide: "s", activeIndex: i });
        deletedS.push(i);
        skipS -= 1;
        emit(11, "delete-s", bi(`skip_s -= 1 → ${skipS}`, `skip_s -= 1 → ${skipS}`), bi("Đã ghép chữ bị xóa với một backspace đang chờ.", "Matched the erased letter with one pending backspace."), { activeSide: "s", activeIndex: i });
        const consumed = i;
        i -= 1;
        emit(12, "move-s", bi(`i -= 1 → ${i}`, `i -= 1 → ${i}`), bi(`Bỏ qua chữ bị xóa tại index ${consumed}.`, `Skip the erased letter at index ${consumed}.`), { activeSide: "s", activeIndex: consumed });
      } else {
        emit(13, "visible-s", bi(`s[${i}] = '${s[i]}' còn hiển thị`, `s[${i}] = '${s[i]}' is visible`), bi("Không có backspace đang chờ, nên đây là chữ tiếp theo để so sánh.", "No backspace is pending, so this is the next character to compare."), { activeSide: "s", activeIndex: i });
        emit(14, "ready-s", bi("Dừng quét s", "Stop scanning s"), bi("Giữ i tại ký tự còn hiển thị này trong khi tìm ký tự của t.", "Keep i on this visible character while searching t."), { activeSide: "s", activeIndex: i });
        break;
      }
    }

    while (j >= 0) {
      emit(15, "scan-t", bi(`Quét t[${j}] = '${t[j]}'`, `Scan t[${j}] = '${t[j]}'`), bi("Đọc t từ phải sang trái với skip_t hiện tại.", "Read t from right to left with the current skip_t."), { activeSide: "t", activeIndex: j });
      if (t[j] === "#") {
        emit(16, "backspace-t-check", bi("Gặp # trong t", "Found # in t"), bi("Dấu # tạo thêm một lần xóa đang chờ.", "The # creates one pending deletion."), { activeSide: "t", activeIndex: j });
        backspacesT.push(j);
        skipT += 1;
        emit(17, "backspace-t", bi(`skip_t += 1 → ${skipT}`, `skip_t += 1 → ${skipT}`), bi("Lần xóa này sẽ áp dụng cho chữ cái gần nhất ở bên trái.", "This deletion will apply to the nearest letter on the left."), { activeSide: "t", activeIndex: j });
        const consumed = j;
        j -= 1;
        emit(18, "move-t", bi(`j -= 1 → ${j}`, `j -= 1 → ${j}`), bi(`Đã xử lý dấu # tại index ${consumed}.`, `Processed the # at index ${consumed}.`), { activeSide: "t", activeIndex: consumed });
      } else if (skipT > 0) {
        emit(19, "delete-t-check", bi(`skip_t = ${skipT} > 0`, `skip_t = ${skipT} > 0`), bi(`Chữ '${t[j]}' bị một dấu # bên phải xóa.`, `Letter '${t[j]}' is erased by a # to its right.`), { activeSide: "t", activeIndex: j });
        deletedT.push(j);
        skipT -= 1;
        emit(20, "delete-t", bi(`skip_t -= 1 → ${skipT}`, `skip_t -= 1 → ${skipT}`), bi("Đã ghép chữ bị xóa với một backspace đang chờ.", "Matched the erased letter with one pending backspace."), { activeSide: "t", activeIndex: j });
        const consumed = j;
        j -= 1;
        emit(21, "move-t", bi(`j -= 1 → ${j}`, `j -= 1 → ${j}`), bi(`Bỏ qua chữ bị xóa tại index ${consumed}.`, `Skip the erased letter at index ${consumed}.`), { activeSide: "t", activeIndex: consumed });
      } else {
        emit(22, "visible-t", bi(`t[${j}] = '${t[j]}' còn hiển thị`, `t[${j}] = '${t[j]}' is visible`), bi("Không có backspace đang chờ, nên đây là chữ tiếp theo để so sánh.", "No backspace is pending, so this is the next character to compare."), { activeSide: "t", activeIndex: j });
        emit(23, "ready-t", bi("Dừng quét t", "Stop scanning t"), bi("Cả hai con trỏ đã sẵn sàng cho lần so sánh tiếp theo.", "Both pointers are ready for the next comparison."), { activeSide: "t", activeIndex: j });
        break;
      }
    }

    const exhausted = i < 0 || j < 0;
    emit(24, "exhaustion", bi(`i < 0 hoặc j < 0 → ${exhausted}`, `i < 0 or j < 0 → ${exhausted}`), exhausted
      ? bi("Ít nhất một chuỗi không còn ký tự hiển thị.", "At least one string has no visible characters left.")
      : bi("Cả hai chuỗi đều còn một ký tự hiển thị để so sánh.", "Both strings have one visible character ready to compare."));
    if (exhausted) {
      const answer = i === j;
      emit(25, "done", bi(`i == j → ${answer}`, `i == j → ${answer}`), answer
        ? bi("Cả hai chuỗi hết ký tự cùng lúc, nên nội dung sau backspace bằng nhau.", "Both strings ran out together, so their backspaced contents are equal.")
        : bi("Chỉ một chuỗi còn ký tự hiển thị, nên hai nội dung khác nhau.", "Only one string still has a visible character, so the contents differ."), { answer, final: true });
      return { original: s, t, answer, steps };
    }

    const compared = { sIndex: i, tIndex: j, sChar: s[i], tChar: t[j] };
    const mismatch = s[i] !== t[j];
    emit(26, "compare", bi(`'${s[i]}' != '${t[j]}' → ${mismatch}`, `'${s[i]}' != '${t[j]}' → ${mismatch}`), mismatch
      ? bi("Hai ký tự còn hiển thị khác nhau; có thể kết luận ngay.", "The visible characters differ, so we can stop immediately.")
      : bi("Hai ký tự khớp. Đánh dấu cặp này rồi tiếp tục sang trái.", "The visible characters match. Record this pair and continue left."), { compared });
    if (mismatch) {
      emit(27, "done", bi("Trả về False", "Return False"), bi("Một cặp ký tự hiển thị không khớp.", "A pair of visible characters does not match."), { compared, answer: false, final: true });
      return { original: s, t, answer: false, steps };
    }

    matchedS.push(i);
    matchedT.push(j);
    matches.push(compared);
    i -= 1;
    emit(28, "advance-s", bi(`i -= 1 → ${i}`, `i -= 1 → ${i}`), bi("Ký tự của s đã khớp; tìm ký tự hiển thị trước đó.", "The s character matched; find the previous visible character."), { compared });
    j -= 1;
    emit(29, "advance-t", bi(`j -= 1 → ${j}`, `j -= 1 → ${j}`), bi("Ký tự của t đã khớp; bắt đầu vòng so sánh tiếp theo.", "The t character matched; begin the next comparison round."), { compared });
  }

  emit(30, "done", bi("Trả về True", "Return True"), bi("Mọi ký tự còn hiển thị đã khớp theo thứ tự.", "Every visible character matched in order."), { answer: true, final: true });
  return { original: s, t, answer: true, steps };
}

module.exports = {
  844: {
    id: 844,
    slug: "backspace-string-compare",
    difficulty: "easy",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Backspace String Compare", "Backspace String Compare"),
    titleVi: bi("So sánh hai chuỗi có phím Backspace", "Compare two strings with backspaces"),
    statement: bi("Cho hai chuỗi s và t gồm chữ thường và dấu #, trong đó # xóa chữ trước nó nếu có. Kiểm tra hai chuỗi có bằng nhau sau khi xử lý mọi backspace hay không. Đề gốc cho độ dài tối đa 200; mô phỏng nhận tối đa 100 ký tự mỗi chuỗi.", "Given strings s and t containing lowercase letters and #, where # erases the preceding letter when one exists, determine whether both strings are equal after processing all backspaces. The original limit is 200; visualization accepts up to 100 characters per string."),
    inputKind: "string",
    preserveInputWhitespace: true,
    inputLabel: bi("s — 1–100 chữ thường hoặc #", "s — 1–100 lowercase letters or #"),
    defaultInput: "ab#c",
    extraParams: [{ key: "t", type: "string", label: bi("t — 1–100 chữ thường hoặc #", "t — 1–100 lowercase letters or #"), default: "ad#c" }],
    debugMode: "line-by-line",
    approach: [
      bi("Quét s và t từ phải sang trái; skip_s/skip_t đếm số chữ cần xóa.", "Scan s and t from right to left; skip_s/skip_t count pending deletions."),
      bi("Gặp # thì tăng skip; gặp chữ khi skip > 0 thì bỏ chữ và giảm skip.", "On # increment skip; on a letter with skip > 0, discard it and decrement skip."),
      bi("Khi tìm được chữ còn hiển thị của cả hai chuỗi, so sánh trực tiếp.", "When the next visible character of each string is found, compare them directly."),
      bi("Nếu một chuỗi hết trước hoặc một cặp khác nhau thì False; nếu cùng hết thì True.", "If one string ends first or a pair differs return False; if both end together return True."),
    ],
    complexity: {
      time: "O(n + m)",
      space: "O(1)",
      note: bi("Mỗi con trỏ chỉ đi sang trái và mỗi ký tự được đọc tối đa một lần; không dựng chuỗi sau xử lý. Không tính dữ liệu trace.", "Each pointer only moves left and reads each character at most once; no processed strings are built. Excludes trace data."),
    },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: (input, params) => { const { s, t } = parseInput(input, params); return [s, t]; },
  },
};
