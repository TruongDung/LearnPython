"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def defangIPaddr(self, address: str) -> str:",
  "        result = []",
  "        for i, ch in enumerate(address):",
  "            if ch == '.':",
  "                result.append('[.]')",
  "            else:",
  "                result.append(ch)",
  "        return ''.join(result)",
];

function parseInput(input) {
  if (typeof input !== "string" || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(input) || input.split('.').some(part => Number(part) > 255)) {
    throw new Error("1108: enter a valid IPv4 address with four numbers from 0 to 255 / nhập IPv4 gồm 4 số từ 0 đến 255, ngăn bằng dấu chấm.");
  }
  return input;
}

function buildSteps(input) {
  const address = parseInput(input);
  const result = [];
  const steps = [];
  let index = null;
  let ch = null;
  let isDot = null;
  let replaced = 0;
  const emit = (line, phase, title, note, final = false) => {
    steps.push({
      arr: [], codeLines: [line], final, title, note,
      vars: [{ name: "address", value: address }, { name: "result", value: [...result] },
        ...(index === null ? [] : [{ name: "i", value: index }, { name: "ch", value: ch }])],
      defang1108View: { address, index, ch, isDot, phase, replaced, result: [...result] },
    });
  };
  emit(3, "init", bi("Khởi tạo kết quả rỗng", "Start with an empty result"), bi("Duyệt từ trái sang phải. Mỗi dấu chấm sẽ trở thành một nhóm [.] gồm 3 ký tự.", "Scan from left to right. Each dot becomes a [.] group containing 3 characters."));
  for (index = 0; index < address.length; index++) {
    ch = address[index]; isDot = null;
    emit(4, "read", bi(`Đọc address[${index}] = '${ch}'`, `Read address[${index}] = '${ch}'`), bi("Đọc ký tự hiện tại; chưa thêm gì vào kết quả.", "Read the current character; nothing has been appended yet."));
    isDot = ch === ".";
    emit(5, "check", bi(`ch == '.' → ${isDot ? "True" : "False"}`, `ch == '.' → ${isDot ? "True" : "False"}`), bi(isDot ? "Đây là dấu chấm: sẽ thêm cả nhóm [.] ở bước tiếp theo." : "Đây là chữ số: giữ nguyên giá trị và thứ tự.", isDot ? "This is a dot: append the entire [.] group in the next step." : "This is a digit: preserve its value and order."));
    if (isDot) {
      result.push("[.]"); replaced++;
      emit(6, "append-dot", bi("Thay '.' bằng '[.]'", "Replace '.' with '[.]'"), bi(`Thêm [.] vào result. Đã thay ${replaced}/3 dấu chấm.`, `Append [.] to result. Replaced ${replaced}/3 dots.`));
    } else {
      emit(7, "else", bi("Chữ số: đi vào nhánh else", "Digit: take the else branch"), bi(`Giữ nguyên '${ch}'; chưa append cho tới dòng 8.`, `Keep '${ch}' unchanged; append it on line 8.`));
      result.push(ch);
      emit(8, "append-digit", bi(`Giữ '${ch}' → result.append(ch)`, `Keep '${ch}' → result.append(ch)`), bi("Chỉ thêm chữ số này, không đặt ngoặc quanh nó.", "Append only this digit; do not add brackets around it."));
    }
  }
  index = address.length - 1;
  const answer = result.join("");
  emit(9, "done", bi(`Kết quả: ${answer}`, `Result: ${answer}`), bi("Ghép các nhóm lại. 3 dấu chấm đều có ngoặc; các chữ số giữ nguyên. Kết quả dài hơn input 6 ký tự.", "Join the groups. All 3 dots are bracketed; the digits are unchanged. The answer is 6 characters longer than the input."), true);
  return { original: address, answer, steps };
}

module.exports = {
  1108: {
    id: 1108, slug: "defanging-an-ip-address", difficulty: "easy",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: bi("Defanging an IP Address", "Defanging an IP Address"),
    titleVi: bi("Thay dấu chấm trong địa chỉ IP bằng [.]", "Replace IP address dots with [.]"),
    statement: bi("Cho địa chỉ IPv4 hợp lệ address. Trả về chuỗi sau khi thay mỗi dấu '.' bằng '[.]'. Ví dụ: 1.1.1.1 → 1[.]1[.]1[.]1.", "Given a valid IPv4 address, return a string with every '.' replaced by '[.]'. Example: 1.1.1.1 → 1[.]1[.]1[.]1."),
    inputKind: "string", inputLabel: bi("address — IPv4, ví dụ 255.100.50.0", "address — IPv4, e.g. 255.100.50.0"),
    defaultInput: "1.1.1.1", extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Duyệt từng ký tự của address từ trái sang phải.", "Scan address one character at a time, from left to right."),
      bi("Nếu ch == '.', thêm '[.]'; nếu là chữ số, thêm ch nguyên vẹn.", "If ch == '.', append '[.]'; otherwise append the digit unchanged."),
      bi("Ghép result thành chuỗi. Mỗi ô output là nhóm tương ứng với một ký tự input, nên [.] nằm chung một ô.", "Join result into a string. Each output slot is the group for one input character, so [.] shares one slot."),
      bi("Python cũng có thể viết ngắn gọn: address.replace('.', '[.]').", "Python also offers a concise solution: address.replace('.', '[.]')."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: bi("Mỗi ký tự được xét một lần. Với IPv4, kết quả dài n + 6 ký tự. Không tính các khung mô phỏng.", "Each character is visited once. For IPv4, the result contains n + 6 characters. Excludes visualization frames.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
