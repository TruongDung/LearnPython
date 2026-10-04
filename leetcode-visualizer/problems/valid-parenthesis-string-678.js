"use strict";

const { bi } = require("./hard-viz-shared");
const SOURCE = Object.freeze([
  "class Solution:",
  "    def checkValidString(self, s: str) -> bool:",
  "        low = high = 0",
  "        for i, ch in enumerate(s):",
  "            if ch == '(':",
  "                low += 1",
  "                high += 1",
  "            elif ch == ')':",
  "                low -= 1",
  "                high -= 1",
  "            else:",
  "                low -= 1",
  "                high += 1",
  "            if high < 0:",
  "                return False",
  "            low = max(low, 0)",
  "        return low == 0",
]);

function parseString(input) {
  if (typeof input !== "string") throw new TypeError("#678: s must be a string / s phải là chuỗi.");
  const s = input.trim();
  if (s.length < 1 || s.length > 100) throw new RangeError("#678: s must contain 1..100 characters / s phải có 1..100 ký tự.");
  if (!/^[()*]+$/.test(s)) throw new TypeError("#678: use only (, ), and * / chỉ dùng (, ), và *.");
  return s;
}

// A teaching witness only: the displayed greedy solution itself stores two bounds.
function buildWitness(s) {
  const opens = [];
  const stars = [];
  const assigned = [...s].map(ch => ch === "*" ? "" : ch);
  [...s].forEach((ch, index) => {
    if (ch === "(") opens.push(index);
    else if (ch === "*") stars.push(index);
    else if (opens.length) opens.pop();
    else assigned[stars.pop()] = "(";
  });
  while (opens.length) {
    const opening = opens.pop();
    const star = stars.pop();
    if (star === undefined || star < opening) throw new Error("#678: witness must close an earlier opening bracket.");
    assigned[star] = ")";
  }
  return { assigned, resolved: assigned.join("") };
}

function buildSteps(input) {
  const s = parseString(input);
  const steps = [];
  const history = [];
  let low = 0;
  let high = 0;
  let index = null;
  let before = { low: 0, high: 0 };
  let committed = { low: 0, high: 0, length: 0, feasible: true };
  let answer = null;
  const locals = { s, low, high };
  function emit(line, event, title, note, final = false) {
    locals.low = low;
    locals.high = high;
    steps.push({
      arr: [], codeLines: [line], final,
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      validParenthesis678View: {
        line, source: SOURCE[line - 1], event, s, index, ch: index === null ? null : s[index],
        low, high, before: { ...before }, committed: { ...committed }, answer,
        calculating: index !== null && committed.length === index && !final,
        history: history.slice(-6).map(row => ({ ...row })), historyOmitted: Math.max(0, history.length - 6),
        witness: answer === true ? buildWitness(s) : null,
      },
    });
  }
  emit(3, "initialize", bi("low = high = 0", "low = high = 0"), bi("Chưa đọc ký tự nào: có đúng 0 ngoặc mở chưa được đóng.", "Before reading any character, there are exactly 0 unmatched opening brackets."));
  for (index = 0; index < s.length; index++) {
    const ch = s[index];
    locals.i = index;
    locals.ch = ch;
    before = { low, high };
    emit(4, "read", bi(`Đọc s[${index}] = '${ch}'`, `Read s[${index}] = '${ch}'`), bi("Một ký tự cập nhật hai biên, rồi mới chốt khoảng hợp lệ cho prefix mới.", "Update both bounds for this character, then finalize the valid range for the new prefix."));
    emit(5, "opening-check", bi(`ch == '(' → ${ch === "(" ? "True" : "False"}`, `ch == '(' → ${ch === "(" ? "True" : "False"}`), bi(ch === "(" ? "Ngoặc mở làm mọi khả năng tăng thêm 1." : "Ký tự không phải ngoặc mở: kiểm tra nhánh tiếp theo.", ch === "(" ? "An opening bracket increases every possible count by 1." : "This is not an opening bracket; check the next branch."));
    if (ch === "(") {
      low++;
      emit(6, "low-up", bi(`low: ${before.low} → ${low}`, `low: ${before.low} → ${low}`), bi("Đang tính biên dưới. Chưa cập nhật xong biên trên.", "Computing the lower bound. The upper bound has not been updated yet."));
      high++;
      emit(7, "high-up", bi(`high: ${before.high} → ${high}`, `high: ${before.high} → ${high}`), bi("Thêm một ngoặc mở trong mọi cách diễn giải.", "Every interpretation gains an opening bracket."));
    } else {
      emit(8, "closing-check", bi(`ch == ')' → ${ch === ")" ? "True" : "False"}`, `ch == ')' → ${ch === ")" ? "True" : "False"}`), bi(ch === ")" ? "Ngoặc đóng giảm cả hai biên đi 1." : "Dấu * có thể là ), rỗng, hoặc (. Giữ tất cả khả năng qua hai biên.", ch === ")" ? "A closing bracket decreases both bounds by 1." : "A star can mean ), empty, or (. Keep all possibilities through the two bounds."));
      low--;
      emit(ch === ")" ? 9 : 12, "low-down", bi(`low: ${before.low} → ${low}`, `low: ${before.low} → ${low}`), bi(ch === ")" ? "Biên dưới giảm 1; nếu âm, sẽ loại các cách có ngoặc đóng dư." : "Biên nhỏ nhất xem * như ). Giá trị âm tạm thời sẽ được chặn về 0.", ch === ")" ? "Decrease the lower bound; negative counts will be discarded." : "The lower bound treats * as ). A temporary negative bound will be clamped to 0."));
      high += ch === ")" ? -1 : 1;
      emit(ch === ")" ? 10 : 13, ch === ")" ? "high-down" : "star-high-up", bi(`high: ${before.high} → ${high}`, `high: ${before.high} → ${high}`), bi(ch === ")" ? "Ngay cả số ngoặc mở lớn nhất cũng giảm 1." : "Biên lớn nhất xem * như (. Cách xem * là rỗng nằm giữa hai biên.", ch === ")" ? "Even the maximum possible opening count decreases by 1." : "The upper bound treats * as (. Treating it as empty lies between the bounds."));
    }
    if (high < 0) committed = { low: null, high: null, length: index + 1, feasible: false };
    emit(14, "check-high", bi(`high < 0 → ${high < 0 ? "True" : "False"}`, `high < 0 → ${high < 0 ? "True" : "False"}`), bi(high < 0 ? "Ngay cả cách có nhiều ngoặc mở nhất cũng không đóng được ngoặc này. Prefix đã sai; ký tự sau không thể sửa." : "Vẫn có ít nhất một cách không bị ngoặc đóng dư. Tiếp tục chuẩn hóa low.", high < 0 ? "Even the most openings cannot match this closing bracket. This invalid prefix cannot be repaired by later characters." : "At least one interpretation avoids an extra closing bracket. Now normalize low."));
    if (high < 0) {
      answer = false;
      emit(15, "return-prefix-failure", bi("return False: ngoặc đóng dư", "return False: unmatched closing bracket"), bi("Dừng sớm tại prefix đầu tiên không còn khả năng hợp lệ.", "Stop at the first prefix with no valid interpretation."), true);
      return { original: s, answer, steps };
    }
    const rawLow = low;
    low = Math.max(low, 0);
    committed = { low, high, length: index + 1, feasible: true };
    history.push({ index, ch, beforeLow: before.low, beforeHigh: before.high, low, high });
    emit(16, "clamp", bi(`low = max(${rawLow}, 0) = ${low}`, `low = max(${rawLow}, 0) = ${low}`), bi(`Chốt prefix ${index + 1} ký tự: có thể còn từ ${low} đến ${high} ngoặc mở. Không giữ cách diễn giải có số ngoặc mở âm.`, `Finalize ${index + 1} characters: possible unmatched openings range from ${low} to ${high}. Discard interpretations with a negative opening count.`));
  }
  answer = low === 0;
  index = null;
  emit(17, "return", bi(`return low == 0 → ${answer ? "True" : "False"}`, `return low == 0 → ${answer ? "True" : "False"}`), bi(answer ? "Khoảng cuối chứa 0: tồn tại cách gán * để đóng hết ngoặc mở." : `Ít nhất vẫn còn ${low} ngoặc mở chưa đóng. Không còn ký tự để đóng chúng.`, answer ? "The final range contains 0: some star assignment closes all opening brackets." : `At least ${low} openings remain unmatched, with no characters left to close them.`), true);
  return { original: s, answer, steps };
}

module.exports = {
  678: {
    id: 678, difficulty: "medium", slug: "valid-parenthesis-string",
    category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Chuỗi ngoặc hợp lệ có dấu *", "Valid Parenthesis String"),
    titleVi: bi("Giữ khoảng số ngoặc mở có thể còn lại", "Track the range of possible unmatched openings"),
    statement: bi("Cho chuỗi s gồm (, ) và *. Mỗi * có thể thay bằng (, ), hoặc chuỗi rỗng. Trả về True nếu có cách thay để mọi ngoặc đóng khớp một ngoặc mở đứng trước nó và không còn ngoặc mở dư.", "Given s containing (, ), and *, each star can become (, ), or empty. Return True if some assignment matches every closing bracket with an earlier opening bracket and leaves no unmatched openings."),
    defaultInput: "(*))", inputKind: "string", inputLabel: bi("s (1–100 ký tự: (, ), *)", "s (1–100 characters: (, ), *)"),
    extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("low và high là số ngoặc mở chưa đóng nhỏ nhất và lớn nhất có thể có sau mỗi prefix hợp lệ.", "low and high are the minimum and maximum possible unmatched openings after a valid prefix."),
      bi("Gặp (: tăng cả hai. Gặp ): giảm cả hai. Gặp *: giảm low, tăng high vì * có ba cách diễn giải.", "For (: increase both. For ): decrease both. For *: decrease low and increase high because the star has three interpretations."),
      bi("high < 0 thì False ngay. Sau đó chặn low về 0 để loại cách diễn giải có ngoặc đóng dư.", "If high < 0, return False immediately. Otherwise clamp low to 0 to discard interpretations with extra closing brackets."),
      bi("Kết thúc: low == 0 nghĩa là có ít nhất một cách đóng hết ngoặc, không yêu cầu high cũng bằng 0.", "At the end, low == 0 means at least one interpretation closes everything; high does not need to be 0."),
    ],
    complexity: { time: "O(n)", space: "O(1) auxiliary", note: bi("Mã Python chỉ lưu hai biên và quét một lần. Mô phỏng lưu thêm các khung và một cách gán * để giải thích kết quả.", "Python stores two bounds and scans once. The visualization also stores frames and a star-assignment witness to explain the result.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseString(input)],
  },
};
