"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def minInsertions(self, s: str) -> int:",
  "        insertions = 0",
  "        need = 0",
  "        for i, ch in enumerate(s):",
  "            if ch == '(':",
  "                if need % 2 == 1:",
  "                    insertions += 1",
  "                    need -= 1",
  "                need += 2",
  "            else:",
  "                need -= 1",
  "                if need == -1:",
  "                    insertions += 1",
  "                    need = 1",
  "        return insertions + need",
];

function parseInput(input, limit = 80) {
  if (typeof input !== "string") throw new TypeError("#1541: s must be a string / s phải là chuỗi.");
  const s = input.trim();
  if (!s.length || s.length > limit || !/^[()]+$/.test(s)) throw new Error(`#1541: enter 1–${limit} parentheses / nhập 1–${limit} dấu ngoặc ( hoặc ).`);
  return s;
}

function buildSteps(input) {
  const s = parseInput(input), steps = [], tokens = [], fixes = [], locals = { s };
  let insertions = null, need = null, index = null;
  function insert(ch, reason, before = index) {
    const token = { ch, inserted: true, index: null, before, reason };
    // A missing '(' precedes the ')' just consumed; other fixes go before the next input.
    if (reason === "missing-open") tokens.splice(tokens.length - 1, 0, token);
    else tokens.push(token);
    fixes.push({ ch, before, reason });
  }
  function emit(line, event, title, note, final = false) {
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final, title, note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      minInsertions1541View: { s, index, line, event, insertions, need,
        tokens: tokens.map(token => ({ ...token })), fixes: fixes.map(fix => ({ ...fix })),
        answer: final ? insertions + need : null },
    });
  }
  emit(2, "call", bi("Một '(' cần hai ')' liên tiếp", "One '(' needs two consecutive ')'"), bi("Ở bài này, () chưa hợp lệ; ()) mới là một nhóm hợp lệ.", "For this problem, () is incomplete; ()) is a balanced group."));
  insertions = 0; locals.insertions = insertions;
  emit(3, "init-count", bi("insertions = 0", "insertions = 0"), bi("Đếm các dấu đã chèn trong lúc duyệt.", "Count characters inserted during the scan."));
  need = 0; locals.need = need;
  emit(4, "init-need", bi("need = 0", "need = 0"), bi("Chưa có dấu mở nào cần đóng.", "No opening needs to be closed yet."));
  for (index = 0; index < s.length; index++) {
    const ch = s[index]; locals.i = index; locals.ch = ch;
    emit(5, "read", bi(`Đọc s[${index}] = '${ch}'`, `Read s[${index}] = '${ch}'`), bi("Các bộ đếm chưa đổi ở dòng đọc ký tự.", "Reading the character does not change the counters."));
    const opening = ch === '(';
    emit(6, "branch", bi(`ch == '(' → ${opening ? 'True' : 'False'}`, `ch == '(' → ${opening ? 'True' : 'False'}`), bi(opening ? "Kiểm tra xem cặp )) trước đó còn dang dở không." : "Dấu ')' hiện tại sẽ giảm số dấu đóng còn thiếu.", opening ? "Check whether the previous )) pair is incomplete." : "The current ')' will reduce the outstanding closing count."));
    if (opening) {
      const odd = need % 2 === 1;
      emit(7, "check-odd", bi(`need % 2 == 1 → ${odd ? 'True' : 'False'}`, `need % 2 == 1 → ${odd ? 'True' : 'False'}`), bi(odd ? "Đã nhận dấu đầu của cặp )). Phải chèn dấu thứ hai trước '(' mới để giữ chúng liền nhau." : "Không có cặp )) dang dở; có thể nhận '(' mới.", odd ? "The first ')' of a pair was received. Insert its second ')' before the new '(' so the pair stays consecutive." : "No )) pair is incomplete; the new '(' can be accepted."));
      if (odd) {
        insertions++; locals.insertions = insertions; insert(')', "finish-pair");
        emit(8, "insert-close", bi("Chèn ')' trước '(' hiện tại", "Insert ')' before the current '('"), bi("Đã tính thêm một lần chèn. Dòng tiếp theo mới giảm need.", "Count one insertion. The next line will reduce need."));
        need--; locals.need = need;
        emit(9, "finish-pair", bi(`Hoàn tất cặp )): need = ${need}`, `Complete the )) pair: need = ${need}`), bi("Cặp )) đã liền nhau. Bây giờ mới nhận dấu mở tiếp theo.", "The )) pair is now consecutive. The next opening can now be accepted."));
      }
      const before = need; need += 2; locals.need = need; tokens.push({ ch, inserted: false, index });
      emit(10, "open", bi(`Nhận '(': need = ${before} + 2 = ${need}`, `Accept '(': need = ${before} + 2 = ${need}`), bi("Một dấu mở mới cần thêm hai dấu đóng.", "A new opening requires two more closing characters."));
    } else {
      emit(11, "close-branch", bi("Xử lý dấu ')'", "Process ')'"), bi("Trừ một khỏi need trước, rồi kiểm tra thiếu dấu mở.", "Subtract one from need first, then check for a missing opening."));
      const before = need; need--; locals.need = need; tokens.push({ ch, inserted: false, index });
      emit(12, "close", bi(`Nhận ')': need = ${before} − 1 = ${need}`, `Accept ')': need = ${before} − 1 = ${need}`), bi(need === -1 ? "need = -1: dấu đóng này chưa có dấu mở. Chưa tính lần chèn ở dòng này." : "Đã nhận một dấu đóng đang cần.", need === -1 ? "need = -1: this closing has no opening. No insertion has been counted at this line." : "One outstanding closing character has been received."));
      const missing = need === -1;
      emit(13, "check-missing", bi(`need == -1 → ${missing ? 'True' : 'False'}`, `need == -1 → ${missing ? 'True' : 'False'}`), bi(missing ? "Phải chèn '(' trước dấu ')' vừa nhận." : "Không cần chèn dấu mở.", missing ? "Insert '(' before the ')' just received." : "No opening insertion is needed."));
      if (missing) {
        insertions++; locals.insertions = insertions; insert('(', "missing-open");
        emit(14, "insert-open", bi("Chèn '(' trước ')' hiện tại", "Insert '(' before the current ')'"), bi("Đã thêm dấu mở. Dòng tiếp theo mới đặt lại need.", "The opening has been inserted. The next line will reset need."));
        need = 1; locals.need = need;
        emit(15, "reset-need", bi("need = 1: còn thiếu ')' thứ hai", "need = 1: the second ')' is still missing"), bi("Dấu '(' vừa chèn cần 2 dấu ')'; dấu hiện tại đã cung cấp 1, nên còn thiếu 1.", "The inserted '(' requires two ')'. The current character supplied one, leaving one missing."));
      }
    }
  }
  index = s.length - 1;
  for (let k = 0; k < need; k++) insert(')', "suffix", s.length);
  emit(16, "return", bi(`Đáp án = ${insertions} + ${need} = ${insertions + need}`, `Answer = ${insertions} + ${need} = ${insertions + need}`), bi(`Thêm ${need} dấu ')' cuối chuỗi. need là số còn thiếu trước khi thêm đuôi; return không gán lại biến này.`, `Append ${need} ')' at the end. need is the outstanding count before appending; return does not reassign it.`), true);
  return { original: s, answer: insertions + need, steps };
}

module.exports = { 1541: {
  id: 1541, difficulty: "medium", slug: "minimum-insertions-to-balance-a-parentheses-string",
  category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
  tags: [{ key: "string", vi: "Chuỗi", en: "String" }, { key: "parentheses", vi: "Ngoặc", en: "Parentheses" }, { key: "greedy", vi: "Tham lam", en: "Greedy" }],
  title: bi("Minimum Insertions to Balance a Parentheses String", "Minimum Insertions to Balance a Parentheses String"),
  titleVi: bi("Chèn ít nhất để mỗi '(' ghép với '))'", "Minimum insertions to match each '(' with '))'"),
  statement: bi("Cho chuỗi s chỉ gồm '(' và ')'. Mỗi '(' phải ghép với hai ')' liên tiếp ở phía sau. Chèn ít ký tự nhất để chuỗi hợp lệ. Ví dụ (())) cần 1; ()) cần 0. Đề gốc cho tối đa 100.000 ký tự; mô phỏng từng dòng dùng tối đa 80 ký tự.", "Given s containing only '(' and ')', each '(' must match two consecutive ')' after it. Return the minimum insertions to balance s. For example, (())) needs 1; ()) needs 0. The original limit is 100,000 characters; this line-by-line visualization allows up to 80."),
  inputKind: "string", inputLabel: bi("s — 1–80 dấu ngoặc; không cần hợp lệ sẵn", "s — 1–80 parentheses; may be unbalanced"),
  defaultInput: ")()(" , extraParams: [], debugMode: "line-by-line",
  approach: [
    bi("need đếm số ')' còn cần. Mỗi '(' tăng need thêm 2; mỗi ')' giảm need đi 1.", "need counts outstanding ')'. Each '(' adds 2; each ')' subtracts 1."),
    bi("Trước '(' mới, nếu need lẻ thì cặp )) đang dang dở: chèn ')' để hoàn tất nó trước.", "Before a new '(', odd need means an incomplete )) pair: insert ')' to complete it first."),
    bi("Nếu need = -1 sau ')', chèn '(' trước dấu đó và đặt need = 1 vì còn thiếu dấu ')' thứ hai.", "If need becomes -1 after ')', insert '(' before it and set need to 1 for the second ')' still missing."),
    bi("Cuối chuỗi, thêm need dấu ')'. Đáp án = insertions + need. Chỉ chèn khi bắt buộc hoặc khi kết thúc nên đạt số lần chèn ít nhất.", "At the end, append need ')'. Answer = insertions + need. Insertions are forced locally or deferred to the end, giving the minimum count."),
  ],
  complexity: { time: "O(n)", space: "O(1)", note: bi("Thuật toán dùng hai bộ đếm, không dùng stack. Không tính các bản sao và chuỗi minh họa của visualization.", "The algorithm uses two counters and no stack. Excludes snapshots and the illustrative repaired string.") },
  code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input, 100000)],
} };
