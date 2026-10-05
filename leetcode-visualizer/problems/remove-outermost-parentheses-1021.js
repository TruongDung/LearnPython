"use strict";

const bi = (vi, en) => ({ vi, en });
const MAX_LENGTH = 80;
const SOURCE = Object.freeze([
  "class Solution:",
  "    def removeOuterParentheses(self, s: str) -> str:",
  "        result = []",
  "        depth = 0",
  "        for i, ch in enumerate(s):",
  "            if ch == '(':",
  "                if depth > 0:",
  "                    result.append(ch)",
  "                depth += 1",
  "            else:",
  "                depth -= 1",
  "                if depth > 0:",
  "                    result.append(ch)",
  "        return ''.join(result)",
]);

function parseInput(input) {
  if (typeof input !== "string") throw new TypeError("#1021: s must be a string / s phải là chuỗi.");
  const s = input.trim();
  if (!s.length || s.length > MAX_LENGTH || !/^[()]+$/.test(s)) {
    throw new Error(`#1021: enter 1–${MAX_LENGTH} parentheses / nhập 1–${MAX_LENGTH} dấu ngoặc ( hoặc ).`);
  }
  let depth = 0, start = 0;
  const groups = [];
  for (let i = 0; i < s.length; i++) {
    depth += s[i] === "(" ? 1 : -1;
    if (depth < 0) throw new Error("#1021: s must be balanced / chuỗi ngoặc phải hợp lệ.");
    if (depth === 0) { groups.push({ start, end: i }); start = i + 1; }
  }
  if (depth !== 0) throw new Error("#1021: s must be balanced / chuỗi ngoặc phải hợp lệ.");
  return { s, groups };
}

function buildSteps(input) {
  const { s, groups } = parseInput(input);
  const steps = [], result = [], kept = [], removed = [];
  const decisions = Array(s.length).fill(null);
  let depth = null, index = null, depthBefore = null, decision = null;
  const locals = { s };
  function emit(line, event, title, note, final = false) {
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final, title, note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      removeOutermost1021View: {
        s, groups: groups.map(group => ({ ...group })), index,
        depth, depthBefore, decision, event, line,
        result: result.join(""), kept: [...kept], removed: [...removed], decisions: [...decisions],
        groupIndex: index === null ? null : groups.findIndex(group => index >= group.start && index <= group.end),
      },
    });
  }
  emit(2, "call", bi("Bỏ một cặp ngoặc ngoài cùng của MỖI nhóm", "Remove one outer pair from EACH primitive group"), bi("Một nhóm kết thúc khi độ sâu trở về 0. Chỉ bỏ dấu mở đầu và dấu đóng cuối của từng nhóm.", "A primitive group ends when depth returns to 0. Remove only its first opening and last closing parenthesis."));
  locals.result = result;
  emit(3, "init-result", bi("result = []", "result = []"), bi("Chưa giữ ký tự nào; kết quả có thể là chuỗi rỗng.", "No characters kept yet; the result may be empty."));
  depth = 0; locals.depth = depth;
  emit(4, "init-depth", bi("depth = 0: đang ở ngoài mọi nhóm", "depth = 0: outside every group"), bi("depth đếm số dấu '(' đã mở mà chưa đóng.", "depth counts opening parentheses that have not been closed."));
  for (index = 0; index < s.length; index++) {
    const ch = s[index]; depthBefore = depth; decision = null;
    locals.i = index; locals.ch = ch;
    emit(5, "read", bi(`Đọc s[${index}] = '${ch}'`, `Read s[${index}] = '${ch}'`), bi(`Độ sâu trước ký tự này là ${depth}. Chưa quyết định giữ hay bỏ.`, `The depth before this character is ${depth}. No keep/remove decision yet.`));
    const opening = ch === "(";
    emit(6, "branch", bi(`ch == '(' → ${opening ? "True" : "False"}`, `ch == '(' → ${opening ? "True" : "False"}`), bi(opening ? "Dấu mở: kiểm tra trước khi tăng depth." : "Dấu đóng: phải giảm depth trước khi kiểm tra.", opening ? "Opening: check before increasing depth." : "Closing: decrease depth before checking."));
    if (opening) {
      decision = depth > 0 ? "keep-pending" : "remove";
      if (depth === 0) { removed.push(index); decisions[index] = "remove"; }
      emit(7, "open-check", bi(`depth > 0 → ${depth > 0 ? "True: giữ" : "False: bỏ"}`, `depth > 0 → ${depth > 0 ? "True: keep" : "False: remove"}`), bi(depth > 0 ? `Đã ở trong nhóm (depth = ${depth}) → dấu '(' này nằm bên trong. Chưa append cho tới dòng tiếp theo.` : "depth = 0 → đây là dấu '(' ngoài cùng của nhóm mới. Bỏ dấu này, nhưng vẫn tăng depth để theo dõi nhóm.", depth > 0 ? `Already inside a group (depth = ${depth}) → this '(' is internal. It is not appended until the next line.` : "depth = 0 → this '(' starts a new group. Remove it, but still increase depth to track the group."));
      if (depth > 0) {
        result.push(ch); kept.push(index); decisions[index] = "keep"; decision = "keep";
        emit(8, "append-open", bi("Giữ '(' → result.append(ch)", "Keep '(' → result.append(ch)"), bi("Chỉ bây giờ ký tự mới xuất hiện trong kết quả.", "Only now does this character appear in the result."));
      }
      depth++; locals.depth = depth;
      emit(9, "increase", bi(`depth: ${depthBefore} → ${depth}`, `depth: ${depthBefore} → ${depth}`), bi("Đã mở thêm một lớp. Việc bỏ dấu ngoài cùng không làm thay đổi cách đếm độ sâu.", "One more layer is open. Removing an outer parenthesis does not change depth tracking."));
    } else {
      emit(10, "close-branch", bi("Dấu ')': đóng một lớp trước", "Closing ')': close one layer first"), bi("Chưa quyết định. Giảm depth để biết sau khi đóng còn ở bên trong nhóm hay không.", "No decision yet. Decrease depth to see whether we remain inside the group."));
      depth--; locals.depth = depth;
      emit(11, "decrease", bi(`depth: ${depthBefore} → ${depth}`, `depth: ${depthBefore} → ${depth}`), bi("Đã giảm độ sâu, chưa thêm ')' vào result.", "Depth has decreased; ')' has not been added to result."));
      decision = depth > 0 ? "keep-pending" : "remove";
      if (depth === 0) { removed.push(index); decisions[index] = "remove"; }
      emit(12, "close-check", bi(`depth > 0 → ${depth > 0 ? "True: giữ" : "False: bỏ"}`, `depth > 0 → ${depth > 0 ? "True: keep" : "False: remove"}`), bi(depth > 0 ? `Sau khi đóng vẫn còn ${depth} lớp → ')' nằm bên trong. Chờ append ở dòng tiếp theo.` : "depth trở về 0 → ')' đóng lớp ngoài cùng và kết thúc nhóm. Bỏ dấu này.", depth > 0 ? `After closing, ${depth} layers remain → ')' is internal. Wait for append on the next line.` : "depth returns to 0 → ')' closes the outer layer and ends the group. Remove it."));
      if (depth > 0) {
        result.push(ch); kept.push(index); decisions[index] = "keep"; decision = "keep";
        emit(13, "append-close", bi("Giữ ')' → result.append(ch)", "Keep ')' → result.append(ch)"), bi("Thêm dấu đóng bên trong vào kết quả.", "Append the internal closing parenthesis to the result."));
      }
    }
  }
  index = s.length - 1;
  locals.i = index;
  emit(14, "return", bi(`Kết quả: ${result.length ? result.join("") : '"" (rỗng)'}`, `Result: ${result.length ? result.join("") : '"" (empty)'}`), bi(`Có ${groups.length} nhóm: đã bỏ ${removed.length} dấu ngoặc, đúng một cặp mỗi nhóm. Nối các ký tự đã giữ theo thứ tự ban đầu.`, `${groups.length} groups: removed ${removed.length} parentheses, exactly one pair per group. Join kept characters in their original order.`), true);
  return { original: s, answer: result.join(""), steps };
}

module.exports = {
  1021: {
    id: 1021, difficulty: "easy", slug: "remove-outermost-parentheses",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }, { key: "parentheses", vi: "Ngoặc", en: "Parentheses" }, { key: "stack", vi: "Ngăn xếp", en: "Stack" }, { key: "counter", vi: "Bộ đếm", en: "Counter" }],
    title: bi("Remove Outermost Parentheses", "Remove Outermost Parentheses"),
    titleVi: bi("Bỏ lớp ngoặc ngoài cùng của từng nhóm", "Remove the outer layer of each primitive group"),
    statement: bi("Cho chuỗi ngoặc hợp lệ s chỉ gồm '(' và ')'. Tách s thành các nhóm hợp lệ không thể chia nhỏ hơn; bỏ một cặp ngoặc ngoài cùng của mỗi nhóm rồi nối lại. Ví dụ (()())(()) → ()()().", "Given a valid parentheses string s, split it into primitive valid groups. Remove one outer pair from each group and concatenate what remains. Example: (()())(()) → ()()()."),
    inputKind: "string", inputLabel: bi("s — chuỗi ngoặc hợp lệ (tối đa 80 ký tự để mô phỏng)", "s — valid parentheses (up to 80 characters for visualization)"),
    defaultInput: "(()())(())", extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Mỗi lần depth trở về 0 là kết thúc một nhóm. Bỏ cặp ngoài cùng của MỖI nhóm, không chỉ cặp đầu/cuối của cả chuỗi.", "Each return to depth 0 ends a primitive group. Remove the outer pair from EACH group, not just the first and last characters of the whole string."),
      bi("Gặp '(': chỉ giữ nếu depth > 0 TRƯỚC khi tăng; sau đó luôn depth += 1.", "On '(': keep it only if depth > 0 BEFORE incrementing; then always increment depth."),
      bi("Gặp ')': luôn depth -= 1 TRƯỚC; chỉ giữ nếu depth vẫn > 0.", "On ')': always decrement depth FIRST; keep it only if depth remains > 0."),
      bi("() → chuỗi rỗng; (()) → (); (()())(()) → ()()().", "() → empty; (()) → (); (()())(()) → ()()()."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: bi("Bộ đếm depth dùng O(1); danh sách result dùng O(n). Không tính các khung mô phỏng. Mã Python hỗ trợ chuỗi dài theo giới hạn gốc.", "The depth counter uses O(1); the result list uses O(n). Excludes visualization frames. The Python solution supports the original input limit.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input).s],
  },
};
