"use strict";

const { bi, parsePlainParams } = require("./hard-viz-shared");
const SOURCE = Object.freeze([
  "class Solution:",
  "    def matchReplacement(self, s: str, sub: str, mappings: list[list[str]]) -> bool:",
  "        allowed = set()",
  "        for old, new in mappings:",
  "            allowed.add((old, new))",
  "        for start in range(len(s) - len(sub) + 1):",
  "            matched = True",
  "            for j, old in enumerate(sub):",
  "                new = s[start + j]",
  "                if old != new and (old, new) not in allowed:",
  "                    matched = False",
  "                    break",
  "            if matched:",
  "                return True",
  "        return False",
]);

function parseInputs(input, params) {
  const options = parsePlainParams(params, 2301);
  if (typeof input !== "string" || !/^[a-zA-Z0-9]{1,80}$/.test(input)) throw new TypeError("#2301: s cần 1–80 chữ/số ASCII / s needs 1–80 ASCII letters/digits.");
  const sub = options.sub;
  if (typeof sub !== "string" || !/^[a-zA-Z0-9]{1,24}$/.test(sub) || sub.length > input.length) throw new TypeError("#2301: sub cần 1–24 chữ/số, độ dài <= s / sub needs 1–24 letters/digits, length <= s.");
  let mappings = options.mappings;
  if (typeof mappings === "string") {
    try { mappings = JSON.parse(mappings); } catch (_) { throw new TypeError("#2301: mappings phải là JSON / mappings must be JSON."); }
  }
  if (!Array.isArray(mappings) || mappings.length > 60) throw new TypeError("#2301: mappings cần 0–60 cặp [old,new] / mappings needs 0–60 [old,new] pairs.");
  mappings = mappings.map((pair, index) => {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(char => typeof char !== "string" || !/^[a-zA-Z0-9]$/.test(char)) || pair[0] === pair[1]) throw new TypeError(`#2301: mappings[${index}] cần hai ký tự chữ/số khác nhau / needs two distinct letters/digits.`);
    return [...pair];
  });
  return [input, sub, mappings];
}

const clone = value => JSON.parse(JSON.stringify(value));
function buildSteps(input, params) {
  const [s, sub, mappings] = parseInputs(input, params);
  const allowed = new Set();
  const steps = [];
  const history = [];
  const locals = { s, sub, mappings };
  let previousVars = Object.entries(locals).map(([name, value]) => ({ name, value: clone(value) }));
  let start = null; let j = null; let pair = null; let answer = null;
  let statuses = Array(sub.length).fill("pending");
  function emit(line, event, note, final = false) {
    const vars = Object.entries(locals).map(([name, value]) => ({ name, value: clone(value) }));
    steps.push({ arr: [], codeLines: [line], final,
      title: bi(`Dòng ${line}: ${SOURCE[line - 1].trim()}`, `Line ${line}: ${SOURCE[line - 1].trim()}`), note, vars,
      matchReplacement2301View: {
        line, source: SOURCE[line - 1], event, s, sub, start, j, pair: clone(pair), answer,
        allowed: clone(locals.allowed), statuses: [...statuses],
        buildingPair: event === "mapping" || event === "mapping-write" ? [locals.old, locals.new] : null,
        history: history.slice(-6).map(entry => ({ ...entry })), beforeVars: clone(previousVars),
        nextLine: null, nextSource: null,
      },
    });
    previousVars = vars;
  }
  locals.allowed = [];
  emit(3, "build", bi("Khởi tạo set rỗng để lưu các cặp có hướng old → new.", "Initialize an empty set to store directed old → new pairs."));
  for (const [old, next] of mappings) {
    locals.old = old; locals.new = next;
    emit(4, "mapping", bi(`Lấy cặp '${old}' → '${next}' từ mappings; chưa thêm vào set.`, `Read pair '${old}' → '${next}' from mappings; it has not been added to the set yet.`));
    allowed.add(old + next);
    locals.allowed = [...allowed].sort().map(key => [...key]);
    emit(5, "mapping-write", bi("Thêm đúng cặp có hướng; cặp trùng chỉ lưu một lần. Không thêm chiều ngược hay đường đi qua ký tự trung gian.", "Add this directed pair; duplicates collapse. No reverse edges or paths through intermediate characters are added."));
  }
  emit(4, "mappings-end", bi("Đã đọc hết mappings. Bắt đầu thử cửa sổ trong s.", "All mappings have been read. Begin trying windows in s."));
  for (let offset = 0; offset <= s.length - sub.length; offset++) {
    start = offset; j = null; pair = null; statuses = Array(sub.length).fill("pending"); locals.start = start;
    emit(6, "window", bi(`Đặt sub dưới s[${start}:${start + sub.length}] = '${s.slice(start, start + sub.length)}'. Chưa so ký tự nào trong cửa sổ mới.`, `Align sub with s[${start}:${start + sub.length}] = '${s.slice(start, start + sub.length)}'. No characters in this window have been compared yet.`));
    locals.matched = true;
    emit(7, "reset", bi("Giả sử cửa sổ khớp; chỉ đặt matched = False khi gặp ký tự không thể khớp.", "Assume the window matches; set matched = False only on an impossible character."));
    for (let index = 0; index < sub.length; index++) {
      j = index; pair = null; locals.j = j; locals.old = sub[j];
      emit(8, "character", bi(`Lấy j = ${j}, old = '${sub[j]}' từ sub gốc. Mỗi vị trí được kiểm tra độc lập.`, `Take j = ${j}, old = '${sub[j]}' from the original sub. Each position is checked independently.`));
      locals.new = s[start + j];
      pair = { old: locals.old, new: locals.new, exact: null, permitted: null, rejected: null };
      emit(9, "read", bi(`Đọc new = s[${start} + ${j}] = '${locals.new}'. s giữ nguyên; ta xét thay old trong sub thành new.`, `Read new = s[${start} + ${j}] = '${locals.new}'. s stays unchanged; consider replacing old in sub with new.`));
      pair.exact = pair.old === pair.new;
      pair.permitted = allowed.has(pair.old + pair.new);
      pair.rejected = !pair.exact && !pair.permitted;
      statuses[j] = pair.rejected ? "failed" : pair.exact ? "exact" : "mapped";
      emit(10, "check", bi(pair.exact ? "Hai ký tự giống nhau: giữ nguyên, không cần mapping. Điều kiện if là False." : pair.permitted ? `Có mapping trực tiếp '${pair.old}' → '${pair.new}': thay một lần được. Điều kiện if là False.` : `Hai ký tự khác nhau và không có mapping '${pair.old}' → '${pair.new}'. Điều kiện if là True: cửa sổ bị loại.`, pair.exact ? "Characters are equal: keep this character, with no mapping needed. The if condition is False." : pair.permitted ? `Direct mapping '${pair.old}' → '${pair.new}' exists: one replacement works. The if condition is False.` : `Characters differ and mapping '${pair.old}' → '${pair.new}' is absent. The if condition is True: reject this window.`));
      if (pair.rejected) {
        locals.matched = false;
        emit(11, "reject", bi("matched chuyển thành False. Một vị trí không khớp đủ để loại toàn bộ cửa sổ.", "matched becomes False. One impossible position rejects the whole window."));
        history.push({ start, window: s.slice(start, start + sub.length), matched: false, failedAt: j });
        emit(12, "break", bi("break thoát vòng j; các vị trí còn lại không cần so. Tiếp theo kiểm tra if matched.", "break exits the j loop; remaining positions need no comparison. Next, check if matched."));
        break;
      }
    }
    if (locals.matched) emit(8, "characters-end", bi("Vòng j đã hết: tất cả vị trí khớp bằng giữ nguyên hoặc một mapping trực tiếp.", "The j loop is exhausted: every position matches unchanged or through one direct mapping."));
    emit(13, "window-check", bi(locals.matched ? "matched là True: cửa sổ này là một đáp án hợp lệ." : "matched là False: bỏ qua return True, thử start tiếp theo.", locals.matched ? "matched is True: this window is a valid answer." : "matched is False: skip return True and try the next start."));
    if (locals.matched) {
      answer = true; history.push({ start, window: s.slice(start, start + sub.length), matched: true, failedAt: null });
      emit(14, "return", bi(`Trả True. Chọn các phép thay đã đánh dấu để sub thành '${s.slice(start, start + sub.length)}', là chuỗi con của s tại start = ${start}.`, `Return True. Use the marked replacements to turn sub into '${s.slice(start, start + sub.length)}', a substring of s at start = ${start}.`), true);
      break;
    }
  }
  if (answer === null) {
    emit(6, "windows-end", bi("Vòng start đã hết; mọi cửa sổ đều có ít nhất một vị trí không thể khớp.", "The start loop is exhausted; every window contains at least one impossible position."));
    answer = false;
    emit(15, "return", bi("Trả False: không thể biến sub thành chuỗi con của s bằng các phép thay cho phép.", "Return False: the allowed replacements cannot turn sub into a substring of s."), true);
  }
  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.matchReplacement2301View.nextLine = nextLine;
    step.matchReplacement2301View.nextSource = nextLine === null ? null : SOURCE[nextLine - 1];
  });
  return { original: s, answer, steps };
}

module.exports = {
  2301: {
    id: 2301, difficulty: "hard", slug: "match-substring-after-replacement",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "hashmap", vi: "Hash Set", en: "Hash Set" }],
    title: bi("Khớp chuỗi con sau khi thay ký tự", "Match Substring After Replacement"),
    titleVi: bi("Trượt sub trên s và kiểm tra mapping có hướng", "Slide sub over s and check directed mappings"),
    statement: bi("Có thể thay ký tự old trong sub thành new theo mappings[old,new]; mỗi vị trí được thay tối đa một lần. Trả True nếu sub sau khi thay là chuỗi con của s. Có thể giữ nguyên ký tự; mapping chỉ có một chiều, không nối nhiều phép thay. Phân biệt chữ hoa/thường.", "Replace old characters in sub with new using mappings[old,new]; each position may be replaced at most once. Return True if the modified sub is a substring of s. Characters may remain unchanged; mappings are directed and cannot be chained. Matching is case-sensitive."),
    defaultInput: "fool3e7bar", inputKind: "string",
    inputLabel: bi("s (1–80 chữ/số, phân biệt hoa/thường)", "s (1–80 case-sensitive letters/digits)"),
    extraParams: [
      { key: "sub", type: "string", default: "leet", label: bi("sub (1–24 ký tự, độ dài ≤ s)", "sub (1–24 characters, length ≤ s)") },
      { key: "mappings", type: "string", default: '[["e","3"],["t","7"],["t","8"]]', label: bi("mappings JSON (0–60 cặp [old,new])", "mappings JSON (0–60 [old,new] pairs)") },
    ],
    debugMode: "line-by-line", code: SOURCE, builder: buildSteps, liveArgs: parseInputs,
    approach: [
      bi("Lưu các cặp (old,new) trong Hash Set. old là ký tự sub, new là ký tự s cần khớp.", "Store (old,new) pairs in a Hash Set. old comes from sub, new is the character in s to match."),
      bi("Thử mỗi cửa sổ độ dài m = len(sub) trong s. Với từng j, giữ nguyên nếu bằng nhau; nếu khác phải có mapping trực tiếp.", "Try each window of length m = len(sub) in s. For each j, keep equal characters unchanged; different characters need a direct mapping."),
      bi("Vị trí thất bại → break và chuyển cửa sổ. Khớp hết → True. Hết cửa sổ → False. Không thay đổi s hoặc sub gốc.", "A failed position breaks the loop and advances the window. All positions match → True. No windows remain → False. The original s and sub are unchanged."),
      bi("Mô phỏng giới hạn s ≤ 80, sub ≤ 24, mappings ≤ 60 để giữ đủ debug từng dòng. Đề cho phép chuỗi đến 5000 ký tự và 1000 mapping.", "Visualization limits: s ≤ 80, sub ≤ 24, mappings ≤ 60, retaining every debug line. The problem permits strings up to 5000 characters and 1000 mappings."),
    ],
    complexity: { time: "O(k + (n − m + 1)·m)", space: "O(k)", note: bi("n = len(s), m = len(sub), k = số mappings; tra set trung bình O(1). Snapshot và lịch sử là chi phí riêng của mô phỏng.", "n = len(s), m = len(sub), k = number of mappings; set membership is expected O(1). Snapshots and history are separate visualization costs.") },
  },
};
