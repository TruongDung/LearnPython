"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class Solution:",
  "    def numUniqueEmails(self, emails):",
  "        seen = set()",
  "        for i, email in enumerate(emails):",
  "            local, domain = email.split('@')",
  "            local = local.split('+', 1)[0]",
  "            local = local.replace('.', '')",
  "            normalized = local + '@' + domain",
  "            seen.add(normalized)",
  "        return len(seen)",
];

function parseInput(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 20) {
    throw new Error("#929: Nhập 1–20 email / Enter 1–20 emails.");
  }
  for (const email of input) {
    if (typeof email !== "string" || email.length > 100 || !/^[a-z.][a-z.+]*@[a-z.+]+\.com$/.test(email)) {
      throw new Error("#929: Email tối đa 100 ký tự, chữ thường, . hoặc +, đúng một @; local không bắt đầu bằng +, domain kết thúc .com / Use valid lowercase emails ending in .com (up to 100 characters).");
    }
  }
  return [...input];
}

function buildSteps(input) {
  const emails = parseInput(input), seen = new Set(), steps = [], history = [];
  const locals = { emails };
  let index = null, phase = "init", rawLocal = null, domain = null;
  let cutLocal = null, cleanLocal = null, normalized = null, duplicate = null;
  function emit(line, event, label, final = false) {
    phase = event;
    const vars = Object.entries(locals).map(([name, value]) => {
      if (name === "seen") return { name, value: seen.size ? `{${[...seen].map(email => `'${email}'`).join(", ")}}` : "set()", rawValue: [...seen] };
      return { name, value: Array.isArray(value) ? [...value] : value };
    });
    steps.push({ arr: [], codeBlock: 1, codeLines: [line], final,
      title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), note: bi("", ""), vars,
      uniqueEmail929View: { line, source: CODE[line - 1].trim(), phase, emails: [...emails], index,
        rawLocal, domain, cutLocal, cleanLocal, normalized, duplicate, seen: [...seen],
        history: history.map(item => ({ ...item })), answer: final ? seen.size : null },
    });
  }
  locals.seen = seen;
  emit(3, "init", bi("seen = set()", "seen = set()"));
  for (index = 0; index < emails.length; index++) {
    locals.i = index; locals.email = emails[index];
    rawLocal = domain = cutLocal = cleanLocal = normalized = duplicate = null;
    emit(4, "take", bi(`Email ${index + 1}/${emails.length}`, `Email ${index + 1}/${emails.length}`));
    [rawLocal, domain] = emails[index].split("@");
    locals.local = rawLocal; locals.domain = domain;
    emit(5, "split", bi("Tách local @ domain", "Split local @ domain"));
    cutLocal = rawLocal.split("+", 1)[0]; locals.local = cutLocal;
    emit(6, "cut", bi("Bỏ từ dấu + đầu tiên", "Discard from the first +"));
    cleanLocal = cutLocal.replaceAll(".", ""); locals.local = cleanLocal;
    emit(7, "dots", bi("Bỏ dấu . trong local", "Remove dots from local"));
    normalized = `${cleanLocal}@${domain}`; locals.normalized = normalized;
    duplicate = seen.has(normalized);
    emit(8, "join", bi("Ghép lại · domain giữ nguyên", "Rejoin · keep the domain"));
    seen.add(normalized);
    history.push({ index, email: emails[index], normalized, duplicate });
    emit(9, "add", bi(duplicate ? "Trùng: số hộp thư giữ nguyên" : "Hộp thư mới: +1", duplicate ? "Duplicate: count unchanged" : "New mailbox: +1"));
  }
  index = emails.length - 1;
  emit(4, "loop-end", bi("Đã xét hết email", "All emails processed"));
  emit(10, "done", bi(`Trả về ${seen.size}`, `Return ${seen.size}`), true);
  return { original: emails, answer: seen.size, steps };
}

module.exports = { 929: {
  id: 929, difficulty: "easy", slug: "unique-email-addresses",
  category: { key: "string", vi: "Chuỗi", en: "String" },
  tags: [{ key: "hashmap", vi: "Bảng băm", en: "Hash Map" }],
  title: bi("Unique Email Addresses", "Unique Email Addresses"),
  titleVi: bi("Đếm địa chỉ email duy nhất", "Count unique email addresses"),
  statement: bi("Chỉ xử lý local trước @: bỏ phần từ dấu + đầu tiên, bỏ dấu chấm. Giữ nguyên domain. Đếm số địa chỉ khác nhau.", "Only transform the local part before @: discard from the first + and remove dots. Keep the domain unchanged. Count distinct addresses."),
  inputKind: "stringArray", inputLabel: bi("emails · 1–20 email, tối đa 100 ký tự/email", "emails · 1–20 emails, up to 100 characters each"),
  defaultInput: ["test.email+alex@leetcode.com", "test.e.mail+bob.cathy@leetcode.com", "testemail+david@lee.tcode.com"],
  extraParams: [], debugMode: "line-by-line",
  approach: [bi("local: cắt + → bỏ .", "local: cut + → remove ."), bi("domain giữ nguyên · set chỉ lưu email mới", "Keep domain · a set stores each address once")],
  complexity: { time: "O(S)", space: "O(S)", note: bi("S = tổng số ký tự email. Mô phỏng tối đa 20 email.", "S = total email characters. Visualize up to 20 emails.") },
  code: CODE, builder: buildSteps, liveArgs: input => [parseInput(input)],
} };
