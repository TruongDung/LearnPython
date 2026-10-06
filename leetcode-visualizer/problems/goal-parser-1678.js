"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def interpret(self, command: str) -> str:",
  "        result = []",
  "        i = 0",
  "        while i < len(command):",
  "            if command[i] == 'G':",
  "                result.append('G')",
  "                i += 1",
  "            elif command.startswith('()', i):",
  "                result.append('o')",
  "                i += 2",
  "            else:",
  "                result.append('al')",
  "                i += 4",
  "        return ''.join(result)",
];

function parseInput(input) {
  if (typeof input !== "string" || input.length < 1 || input.length > 100 || input.match(/^(?:G|\(\)|\(al\))+$/)?.[0] !== input) {
    throw new Error("1678: command must contain only G, () and (al), totaling 1–100 characters / command chỉ gồm G, () và (al), dài 1–100 ký tự.");
  }
  return input;
}

function buildSteps(input) {
  const command = parseInput(input);
  const tokens = [...command.matchAll(/G|\(\)|\(al\)/g)].map(match => ({ text:match[0], start:match.index, end:match.index+match[0].length }));
  const steps = [];
  const result = [];
  let i = null;
  let rule = null;
  let previous = null;
  const emit = (line, phase, title, note, final = false) => steps.push({
    arr:[], codeLines:[line], title, note, final,
    vars:[{ name:"command", value:command }, { name:"result", value:[...result] }, ...(i===null?[]:[{ name:"i", value:i }])],
    goalParser1678View:{ command, tokens, i, rule, previous, phase, result:[...result] },
  });
  emit(3,"init",bi("Khởi tạo kết quả rỗng", "Start with an empty result"),bi("Chỉ có 3 loại nhóm: G, () và (al). Ghép bản dịch theo đúng thứ tự.", "There are only 3 token types: G, () and (al). Append their translations in order."));
  i = 0;
  emit(4,"pointer",bi("i = 0: bắt đầu ở đầu command", "i = 0: start at the beginning of command"),bi("i luôn trỏ tới đầu nhóm chưa đọc tiếp theo.", "i always points to the beginning of the next unread token."));
  while (i < command.length) {
    rule = null; previous = null;
    emit(5,"read",bi(`i = ${i} < ${command.length}: còn nhóm để đọc`, `i = ${i} < ${command.length}: more tokens remain`),bi("Kiểm tra ký tự tại i trước khi chọn quy tắc.", "Inspect the character at i before choosing a rule."));
    const isG = command[i] === "G";
    if (isG) rule = "G";
    emit(6,"check-g",bi(`command[${i}] == 'G' → ${isG ? "True" : "False"}`, `command[${i}] == 'G' → ${isG ? "True" : "False"}`),bi(isG ? "Nhận ra G: sẽ giữ nguyên G." : "Không phải G: kiểm tra xem nhóm là ().", isG ? "Found G: keep G unchanged." : "Not G: check whether the token is ()."));
    let output;
    let width;
    let appendLine;
    let advanceLine;
    if (isG) { output="G"; width=1; appendLine=7; advanceLine=8; }
    else {
      const empty = command.startsWith("()",i);
      if (empty) rule = "()";
      emit(9,"check-empty",bi(`command.startswith('()', ${i}) → ${empty ? "True" : "False"}`, `command.startswith('()', ${i}) → ${empty ? "True" : "False"}`),bi(empty ? "Nhận ra cả nhóm (): dịch thành chữ o, không phải số 0." : "Input hợp lệ nên nhóm còn lại chắc chắn là (al).", empty ? "Found the entire () token: translate it to the letter o, not the number 0." : "The input is valid, so the remaining token must be (al)."));
      if (empty) { output="o"; width=2; appendLine=10; advanceLine=11; }
      else {
        rule = "(al)";
        emit(12,"else",bi("Nhóm (al): bỏ ngoặc, giữ al", "Token (al): remove parentheses, keep al"),bi("Đọc cả 4 ký tự ( a l ) như một nhóm.", "Read all 4 characters ( a l ) as one token."));
        output="al"; width=4; appendLine=13; advanceLine=14;
      }
    }
    result.push(output);
    emit(appendLine,"append",bi(`${rule} → ${output}: thêm vào result`, `${rule} → ${output}: append to result`),bi("Kết quả đã thêm bản dịch; con trỏ i chưa di chuyển.", "The translation is appended; the pointer i has not moved yet."));
    previous = i; i += width;
    emit(advanceLine,"advance",bi(`i: ${previous} → ${i} (+${width})`, `i: ${previous} → ${i} (+${width})`),bi(`Đã đọc đủ ${width} ký tự của nhóm ${rule}. ${i===command.length ? "i đã đến cuối command." : "i trỏ đến nhóm tiếp theo."}`, `Consumed all ${width} characters of ${rule}. ${i===command.length ? "i has reached the end of command." : "i points to the next token."}`));
  }
  rule = null; previous = null;
  emit(5,"end",bi(`i = ${i}: không còn nhóm`, `i = ${i}: no tokens remain`),bi("i < len(command) là False. Thoát vòng lặp.", "i < len(command) is False. Exit the loop."));
  const answer = result.join("");
  emit(15,"done",bi(`Kết quả: ${answer}`, `Result: ${answer}`),bi("Ghép các bản dịch; không thêm dấu cách hay ký tự phân cách.", "Join the translations without spaces or separators."),true);
  return { original:command, answer, steps };
}

module.exports = {
  1678:{
    id:1678, slug:"goal-parser-interpretation", difficulty:"easy",
    category:{ key:"string", vi:"Chuỗi", en:"String" },
    title:bi("Goal Parser Interpretation", "Goal Parser Interpretation"), titleVi:bi("Đọc nhóm ký tự và ghép bản dịch", "Read tokens and join their translations"),
    statement:bi("Cho command gồm các nhóm G, () và (al). Dịch G thành G, () thành o, (al) thành al rồi ghép theo thứ tự. Ví dụ: G()(al) → Goal. command dài 1–100 ký tự.", "Given command composed of G, () and (al), translate G to G, () to o, and (al) to al, then concatenate in order. Example: G()(al) → Goal. command contains 1–100 characters."),
    inputKind:"string", inputLabel:bi("command — chỉ gồm G, () và (al)", "command — only G, () and (al)"),
    defaultInput:"G()(al)", extraParams:[], debugMode:"line-by-line",
    approach:[
      bi("Đặt i = 0. Mỗi lần lặp, i trỏ tới đầu một nhóm chưa đọc.", "Start at i = 0. Each iteration begins at the next unread token."),
      bi("G → thêm G, i += 1; () → thêm o, i += 2; (al) → thêm al, i += 4.", "G → append G, i += 1; () → append o, i += 2; (al) → append al, i += 4."),
      bi("Thêm bản dịch trước, rồi nhảy qua toàn bộ nhóm. Không đọc lại ký tự bên trong ngoặc.", "Append the translation, then skip the entire token. Do not read its inner characters again."),
      bi("Khi i == len(command), ghép result. Python cũng có thể dùng command.replace('()', 'o').replace('(al)', 'al').", "When i == len(command), join result. Python can also use command.replace('()', 'o').replace('(al)', 'al')."),
    ],
    complexity:{ time:"O(n)", space:"O(n)", note:bi("Mỗi nhóm được đọc một lần; kiểm tra () có độ dài cố định. Kết quả dùng O(n) bộ nhớ, không tính các khung mô phỏng.", "Each token is read once; checking () takes constant time. The result uses O(n) space, excluding visualization frames.") },
    code:SOURCE, builder:buildSteps, liveArgs:input=>[parseInput(input)],
  },
};
