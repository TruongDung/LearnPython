"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def minimumLength(self, s: str) -> int:",
  "        left, right = 0, len(s) - 1",
  "        while left < right and s[left] == s[right]:",
  "            char = s[left]",
  "            while left < right and s[left] == char:",
  "                left += 1",
  "            while right >= left and s[right] == char:",
  "                right -= 1",
  "        return max(0, right - left + 1)",
];

function parseInput(input) {
  if (typeof input !== "string" || !/^[abc]{1,100000}$/.test(input)) {
    throw new Error("1750: s must contain 1–100000 characters a, b, c / s cần 1–100000 ký tự a, b, c.");
  }
  return input;
}
const preview = value => value.length <= 32 ? value : value.slice(0, 15) + "…" + value.slice(-15);

function buildSteps(input) {
  const s = parseInput(input), steps = [], history = [];
  let left = 0, right = s.length - 1, round = 0, char = null;
  let startLeft = left, startRight = right, omitted = 0;
  const emit = (line, phase, title, note, extra = {}) => {
    if (steps.length >= 1000 && phase !== "done") { omitted++; return; }
    const positions = new Set();
    if (s.length <= 16) for (let index = 0; index < s.length; index++) positions.add(index);
    else {
      for (const center of [Math.min(left, s.length - 1), Math.max(0, right)]) {
        const from = Math.max(0, Math.min(center - 3, s.length - 8));
        for (let index = from; index < Math.min(s.length, from + 8); index++) positions.add(index);
      }
    }
    const remaining = Math.max(0, right - left + 1);
    // Keep snapshots small even when the original input has 100,000 letters.
    const remainingPreview = remaining <= 32 ? s.slice(left, right + 1) : s.slice(left, left + 15) + "…" + s.slice(right - 14, right + 1);
    steps.push({
      arr: [], highlight: [], mark: [], codeLines: [line], title, note, final: phase === "done",
      vars: [{ name: "left", value: left }, { name: "right", value: right }, ...(char === null ? [] : [{ name: "char", value: char }])],
      similarEnds1750View: {
        length: s.length, left, right, round, char, phase, startLeft, startRight, remaining, remainingPreview,
        leftChar: left <= right ? s[left] : null, rightChar: left <= right ? s[right] : null,
        cells: [...positions].sort((a, b) => a - b).map(index => ({ index, char: s[index] })),
        originalPreview: preview(s), omitted, activeIndex: extra.activeIndex ?? null,
        history: history.slice(-4).map(item => ({ ...item })), answer: phase === "done" ? remaining : null,
      },
    });
  };
  emit(3, "init", bi("Đặt left và right ở hai đầu", "Place left and right at the ends"), bi("Chỉ xóa khi hai đầu cùng chữ và còn ít nhất hai vị trí khác nhau. Một ký tự đơn lẻ không tự ghép với chính nó.", "Delete only when both ends have the same letter and occupy distinct positions. A single letter cannot pair with itself."));
  while (true) {
    const canDelete = left < right && s[left] === s[right];
    emit(4, "check", canDelete ? bi(`'${s[left]}' = '${s[right]}': có thể xóa hai đầu`, `'${s[left]}' = '${s[right]}': both ends can be deleted`) : bi("Dừng: không còn cặp đầu/cuối hợp lệ", "Stop: no valid prefix/suffix pair remains"), canDelete
      ? bi("Lấy toàn bộ nhóm chữ giống nhau ở mỗi đầu. Phần giữa chưa bị đụng tới.", "Take the entire run of this letter at each end. The middle is left untouched.")
      : left > right ? bi("Đã xóa hết chuỗi.", "The entire string has been deleted.")
      : left === right ? bi("Còn một ký tự. Prefix và suffix không được chồng lên nhau, nên phải giữ nó.", "One letter remains. Prefix and suffix cannot overlap, so it must stay.")
      : bi(`Hai đầu '${s[left]}' và '${s[right]}' khác nhau. Không thể thực hiện thêm phép xóa.`, `The ends '${s[left]}' and '${s[right]}' differ. No further deletion is possible.`));
    if (!canDelete) break;
    round++; char = s[left]; startLeft = left; startRight = right;
    emit(5, "select", bi(`Lượt ${round}: chọn chữ '${char}'`, `Round ${round}: choose '${char}'`), bi("Hai nhóm cần cùng chữ, nhưng không cần cùng độ dài.", "Both runs need the same letter, but may have different lengths."));
    while (left < right && s[left] === char) {
      emit(6, "check-left", bi(`s[${left}] = '${char}'`, `s[${left}] = '${char}'`), bi("Thu hẹp bên trái; để lại ít nhất một vị trí cho nhóm bên phải, tránh chồng lấn.", "Shrink the left side; leave at least one position for the right run to avoid overlap."), { activeIndex: left });
      const removed = left++;
      emit(7, "move-left", bi(`left → ${left}`, `left → ${left}`), bi(`Bỏ qua vị trí ${removed} bên trái.`, `Skip position ${removed} on the left.`), { activeIndex: removed });
    }
    emit(6, "left-stop", bi("Đã tìm hết nhóm bên trái", "The left run is complete"), bi("Bây giờ thu hẹp nhóm cùng chữ từ bên phải.", "Now shrink the run of the same letter from the right."));
    while (right >= left && s[right] === char) {
      emit(8, "check-right", bi(`s[${right}] = '${char}'`, `s[${right}] = '${char}'`), bi("Chỉ bỏ vị trí chưa bị left đi qua. Hai nhóm không dùng chung index.", "Skip only positions not already crossed by left. The two runs share no index."), { activeIndex: right });
      const removed = right--;
      emit(9, "move-right", bi(`right → ${right}`, `right → ${right}`), bi(`Bỏ qua vị trí ${removed} bên phải.`, `Skip position ${removed} on the right.`), { activeIndex: removed });
    }
    const remaining = Math.max(0, right - left + 1);
    history.push({ round, char, leftCount: left - startLeft, rightCount: startRight - right, remaining,
      preview: remaining <= 32 ? s.slice(left, right + 1) : s.slice(left, left + 15) + "…" + s.slice(right - 14, right + 1) });
    emit(8, "round", bi(`Xong lượt ${round}: còn ${remaining} ký tự`, `Round ${round} complete: ${remaining} letters remain`), bi(`Xóa ${left - startLeft} chữ '${char}' bên trái và ${startRight - right} bên phải. Tiếp tục kiểm tra hai đầu mới.`, `Delete ${left - startLeft} '${char}' letters on the left and ${startRight - right} on the right. Check the new ends next.`));
  }
  const answer = Math.max(0, right - left + 1);
  emit(10, "done", bi(`Độ dài nhỏ nhất: ${answer}`, `Minimum length: ${answer}`), bi(answer === 0 ? `Sau ${round} lượt, chuỗi rỗng. Trả 0.` : `Sau ${round} lượt, còn ${answer} ký tự; không thể xóa thêm hai đầu. Trả ${answer}.`, answer === 0 ? `After ${round} rounds, the string is empty. Return 0.` : `After ${round} rounds, ${answer} letters remain; no further end deletion is possible. Return ${answer}.`));
  return { original: s, answer, steps };
}

module.exports = {
  1750: {
    id: 1750, slug: "minimum-length-of-string-after-deleting-similar-ends", difficulty: "medium",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" }, tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Minimum Length of String After Deleting Similar Ends", "Minimum Length of String After Deleting Similar Ends"),
    titleVi: bi("Độ dài nhỏ nhất sau khi xóa hai đầu giống nhau", "Minimum length after deleting similar ends"),
    statement: bi("Cho s chỉ gồm a, b, c. Mỗi lượt xóa một prefix và một suffix không rỗng, không chồng lấn, cùng chứa một chữ giống nhau. Hai nhóm không cần cùng độ dài. Tìm độ dài nhỏ nhất của chuỗi còn lại. Ví dụ: ca → 2; cabaabac → 0; aabccabba → 3.", "Given s containing only a, b, c, repeatedly delete a nonempty prefix and suffix containing the same letter. They must not overlap and may have different lengths. Return the minimum remaining length. Examples: ca → 2; cabaabac → 0; aabccabba → 3."),
    inputKind: "string", preserveInputWhitespace: true, inputLabel: bi("s — chỉ gồm a, b, c", "s — only a, b, c"), defaultInput: "aabccabba", extraParams: [], debugMode: "line-by-line",
    approach: [bi("Dùng left/right giới hạn vùng chuỗi còn lại.", "Use left/right to bound the remaining string."), bi("Nếu hai đầu cùng chữ, bỏ toàn bộ nhóm chữ đó từ mỗi phía; hai nhóm không chồng lấn.", "If both ends match, skip the entire run of that letter on each side without overlap."), bi("Dừng khi hai đầu khác nhau hoặc còn không quá một ký tự. Trả max(0, right − left + 1).", "Stop when the ends differ or at most one letter remains. Return max(0, right − left + 1).")],
    complexity: { time: "O(n)", space: "O(1)", note: bi("Mỗi vị trí chỉ bị bỏ qua một lần; không tạo chuỗi con trong thuật toán Python. Không tính dữ liệu mô phỏng. Dữ liệu lớn hiển thị cửa sổ ký tự và tối đa 1.000 bước chi tiết trước kết quả cuối.", "Each position is skipped once; the Python algorithm creates no substrings. Excludes visualization data. Large inputs show character windows and at most 1,000 detailed steps before the final result.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
