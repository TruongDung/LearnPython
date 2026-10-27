"use strict";

const text = (vi, en) => ({ vi, en });

function parseN(input) {
  const raw = Array.isArray(input) && input.length === 1 ? input[0] : input;
  const value = typeof raw === "number" ? raw : typeof raw === "string" && /^[1-5]$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new RangeError("#22: n phải là số nguyên từ 1 đến 5 / n must be an integer from 1 to 5.");
  }
  return value;
}

function buildSteps22(input) {
  const n = parseN(input), result = [], path = [], nodes = [], stack = [], steps = [];
  function record(line, phase, title, detail = {}, final = false) {
    const f = stack.at(-1), active = new Set(stack.map(frame => frame.id));
    const locals = { n, result: [...result], ...(f ? { path: [...path], opened: f.opened, closed: f.closed } : {}) };
    const view = {
      approach: 1, n, phase, event: phase, scope: f ? "backtrack" : "generateParenthesis", locals,
      source: { line, timing: "after" }, path: f ? path.join("") : "", opened: f?.opened ?? null, closed: f?.closed ?? null,
      currentNodeId: f?.id ?? null, results: [...result],
      stack: stack.map(frame => ({ ...frame, path: path.join("") })),
      nodes: nodes.map(node => ({ ...node, state: node.id === f?.id ? "current" : active.has(node.id) ? "ancestor" : node.status })),
      check: f?.check ? { ...f.check } : null, ...detail,
    };
    steps.push({ title, note: text("", ""), codeLines: [line], final, vars: [
      { name: "n", value: n }, { name: "path", value: f ? [...path] : "—" },
      { name: "opened", value: f?.opened ?? "—" }, { name: "closed", value: f?.closed ?? "—" },
      { name: "len(path)", value: f ? path.length : "—" }, { name: "len(result)", value: result.length },
    ], generateParentheses22View: view });
  }
  record(3, "result-init", text("result = []", "result = []"));
  record(5, "define", text("Tạo hàm backtrack", "Define backtrack"));
  function visit(opened, closed, parentId = null, choice = null) {
    const node = { id: nodes.length, parentId, path: path.join(""), opened, closed, depth: path.length, choice, status: "explored" };
    nodes.push(node);
    const f = { id: node.id, opened, closed, entryPath: node.path, check: null }; stack.push(f);
    const complete = path.length === 2 * n;
    f.check = { type: "complete", allowed: complete };
    record(6, "complete-check", text(complete ? "Đủ 2n dấu ngoặc" : "Chưa đủ 2n dấu ngoặc", complete ? "2n parentheses reached" : "Not yet 2n parentheses"));
    if (complete) {
      result.push(path.join("")); node.status = "solution";
      record(7, "save-result", text(`Lưu ${result.at(-1)}`, `Save ${result.at(-1)}`));
      record(8, "leaf-return", text("↩ Về nhánh cha", "↩ Return to parent")); stack.pop(); return;
    }
    const canOpen = opened < n;
    f.check = { type: "open", allowed: canOpen };
    record(10, canOpen ? "allow-open" : "block-open", text(`opened < n → ${canOpen}`, `opened < n → ${canOpen}`));
    if (canOpen) {
      path.push("("); record(11, "append-open", text("Thêm (", "Append ("), { added: "(" });
      visit(opened + 1, closed, node.id, "(");
      record(12, "resume-open", text("↩ Đệ quy nhánh ( hoàn tất", "↩ Open branch returned"));
      path.pop(); record(13, "pop-open", text("Bỏ ( để thử nhánh khác", "Remove ( for the next branch"), { removed: "(" });
    }
    const canClose = closed < opened;
    f.check = { type: "close", allowed: canClose };
    record(15, canClose ? "allow-close" : "block-close", text(`closed < opened → ${canClose}`, `closed < opened → ${canClose}`));
    if (canClose) {
      path.push(")"); record(16, "append-close", text("Thêm )", "Append )"), { added: ")" });
      visit(opened, closed + 1, node.id, ")");
      record(17, "resume-close", text("↩ Đệ quy nhánh ) hoàn tất", "↩ Close branch returned"));
      path.pop(); record(18, "pop-close", text("Bỏ ) để quay lui", "Remove ) to backtrack"), { removed: ")" });
    }
    stack.pop();
  }
  visit(0, 0);
  record(20, "root-return", text("↩ Đã duyệt mọi nhánh", "↩ All branches returned"));
  record(21, "done", text(`${result.length} chuỗi ngoặc đúng`, `${result.length} valid strings`), {}, true);
  return { original: n, answer: [...result], steps };
}

function buildSteps22Bitmask(input) {
  const n = parseN(input), width = 2 * n, totalMasks = 1 << width;
  const result = [], inspected = [], steps = [], locals = { n, result };
  let check = null, invalidAt = null;
  function record(line, phase, title, final = false) {
    const path = locals.path?.join("") || "";
    steps.push({ title, note: text("", ""), codeLines: [line], final,
      vars: [
        { name: "mask", value: locals.mask ?? "—" }, { name: "i", value: locals.i ?? "—" },
        { name: "path", value: locals.path ? [...locals.path] : "—" }, { name: "balance", value: locals.balance ?? "—" },
        { name: "valid", value: locals.valid ?? "—" }, { name: "len(result)", value: result.length },
      ], generateParentheses22View: {
        approach: 2, n, width, totalMasks, phase, event: phase, scope: "generateParenthesis", source: { line, timing: "after" },
        locals: JSON.parse(JSON.stringify(locals)), results: [...result], inspected: inspected.slice(-10).map(row => ({ ...row })),
        path, mask: locals.mask ?? null, index: locals.i ?? null, balance: locals.balance ?? null, valid: locals.valid ?? null,
        check: check ? { ...check } : null, invalidAt,
      },
    });
  }
  record(3, "result-init", text("result = []", "result = []"));
  locals.width = width; record(4, "width", text(`width = ${width}`, `width = ${width}`));
  for (let mask = 0; mask < totalMasks; mask++) {
    locals.mask = mask; check = null; invalidAt = null;
    record(6, "next-mask", text(`Mask ${mask}`, `Mask ${mask}`));
    locals.path = []; record(7, "path-init", text("path = []", "path = []"));
    locals.balance = 0; record(8, "balance-init", text("balance = 0", "balance = 0"));
    locals.valid = true; record(9, "valid-init", text("valid = True", "valid = True"));
    let broken = false;
    for (let i = 0; i < width; i++) {
      locals.i = i; check = null; record(11, "read-bit", text(`Đọc bit ${i}`, `Read bit ${i}`));
      const bit = (mask >> i) & 1; check = { type: "bit", allowed: Boolean(bit) };
      record(12, "test-bit", text(`bit ${i} = ${bit}`, `bit ${i} = ${bit}`));
      if (bit) {
        locals.path.push("("); record(13, "append-open", text("1 → (", "1 → ("));
        locals.balance++; record(14, "increase-balance", text("balance + 1", "balance + 1"));
      } else {
        locals.path.push(")"); record(16, "append-close", text("0 → )", "0 → )"));
        locals.balance--; record(17, "decrease-balance", text("balance − 1", "balance − 1"));
      }
      check = { type: "prefix", allowed: locals.balance >= 0 };
      record(19, "check-prefix", text(`balance < 0 → ${locals.balance < 0}`, `balance < 0 → ${locals.balance < 0}`));
      if (locals.balance < 0) {
        locals.valid = false; invalidAt = i; record(20, "mark-invalid", text("valid = False", "valid = False"));
        record(21, "break-mask", text("✕ Dừng mask này", "✕ Stop this mask")); broken = true; break;
      }
    }
    if (!broken) record(11, "bits-exhausted", text("Đã đọc đủ bit", "All bits read"));
    const accepted = locals.valid && locals.balance === 0;
    check = { type: "candidate", allowed: accepted };
    record(23, "check-candidate", text(accepted ? "✓ Nhận ứng viên" : "✕ Loại ứng viên", accepted ? "✓ Accept candidate" : "✕ Reject candidate"));
    if (accepted) {
      result.push(locals.path.join("")); record(24, "save-result", text(`Lưu ${result.at(-1)}`, `Save ${result.at(-1)}`));
    }
    inspected.push({ mask, path: locals.path.join(""), balance: locals.balance, accepted });
  }
  record(6, "masks-exhausted", text("Đã thử đủ mask", "All masks tried"));
  record(26, "done", text(`${result.length} chuỗi ngoặc đúng`, `${result.length} valid strings`), true);
  return { original: n, answer: [...result], steps };
}

module.exports = {
  22: {
    id: 22,
    difficulty: "medium",
    slug: "generate-parentheses",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    tags: [
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
      { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
    ],
    title: { vi: "Generate Parentheses", en: "Generate Parentheses" },
    titleVi: { vi: "Sinh tất cả chuỗi ngoặc hợp lệ", en: "Generate all valid parenthesis strings" },
    statement: {
      vi: "Cho n cặp ngoặc, sinh mọi chuỗi ngoặc đúng gồm đúng n dấu mở và n dấu đóng.",
      en: "Given n pairs of parentheses, generate every well-formed string using exactly n opens and n closes.",
    },
    defaultInput: [3],
    inputKind: "positive",
    inputLabel: { vi: "n (1 đến 5)", en: "n (1 to 5)" },
    singleInput: true,
    maxInput: 5,
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: text("Cách giải", "Approach"),
        default: "1",
        options: [
          { value: "1", label: text("Cách 1: Backtracking", "Approach 1: Backtracking") },
          { value: "2", label: text("Cách 2: Bitmask", "Approach 2: Bitmask") },
        ],
      },
    ],
    debugMode: "line-by-line",
    approach: [text("Thêm ( hoặc ) → đi sâu → lưu chuỗi đủ 2n → pop để thử nhánh khác. Bitmask: đọc từng bit, loại khi balance âm.", "Append ( or ) → recurse → save at length 2n → pop for the next branch. Bitmask: decode each bit and reject a negative balance.")],
    complexity: {
      time: "O(Cₙ·n) / O(n·4ⁿ)",
      space: "O(n)",
      note: text("Cách 1 sinh đúng Cₙ đáp án; cách 2 thử mọi chuỗi 2n bit. Space không tính output.", "Approach 1 generates exactly Cₙ answers; approach 2 tries every 2n-bit string. Space excludes the output."),
    },
    codeLabel: text("Cách 1: Backtracking", "Approach 1: Backtracking"),
    code: [
      "class Solution:",
      "    def generateParenthesis(self, n: int) -> list[str]:",
      "        result = []",
      "",
      "        def backtrack(path: list[str], opened: int, closed: int) -> None:",
      "            if len(path) == 2 * n:",
      "                result.append(\"\".join(path))",
      "                return",
      "",
      "            if opened < n:",
      "                path.append(\"(\")",
      "                backtrack(path, opened + 1, closed)",
      "                path.pop()",
      "",
      "            if closed < opened:",
      "                path.append(\")\")",
      "                backtrack(path, opened, closed + 1)",
      "                path.pop()",
      "",
      "        backtrack([], 0, 0)",
      "        return result",
    ],
    code2Label: text("Cách 2: Bitmask", "Approach 2: Bitmask"),
    code2: [
      "class Solution:",
      "    def generateParenthesis(self, n: int) -> list[str]:",
      "        result = []",
      "        width = 2 * n",
      "",
      "        for mask in range(1 << width):",
      "            path = []",
      "            balance = 0",
      "            valid = True",
      "",
      "            for i in range(width):",
      "                if mask & (1 << i):",
      "                    path.append(\"(\")",
      "                    balance += 1",
      "                else:",
      "                    path.append(\")\")",
      "                    balance -= 1",
      "",
      "                if balance < 0:",
      "                    valid = False",
      "                    break",
      "",
      "            if valid and balance == 0:",
      "                result.append(\"\".join(path))",
      "",
      "        return result",
    ],
    liveArgs: (input) => [parseN(input)],
    builder: buildSteps22,
    builder2: buildSteps22Bitmask,
  },
};

