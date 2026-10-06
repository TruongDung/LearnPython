"use strict";

const text = (vi, en) => ({ vi, en });

function parseN(input) {
  const value = Number(Array.isArray(input) ? input[0] : input);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("n must be an integer from 1 to 5 for this visualization.");
  }
  return value;
}

function buildSteps22(input) {
  const n = parseN(input);
  const steps = [];
  const results = [];
  const nodes = [];
  const stack = [];
  let nextNodeId = 0;

  const nodeById = (id) => nodes.find((node) => node.id === id);
  const makeView = (phase, frame = {}) => {
    const currentNodeId = frame.currentNodeId ?? stack.at(-1) ?? null;
    const currentNode = currentNodeId === null ? null : nodeById(currentNodeId);
    const path = frame.path ?? currentNode?.path ?? "";
    const opened = frame.opened ?? currentNode?.opened ?? 0;
    const closed = frame.closed ?? currentNode?.closed ?? 0;
    const stackIds = new Set(stack);

    return {
      n,
      phase,
      event: frame.event || phase,
      path,
      previewPath: frame.previewPath ?? null,
      opened,
      closed,
      previewOpened: frame.previewOpened ?? null,
      previewClosed: frame.previewClosed ?? null,
      currentNodeId,
      pendingChoice: frame.pendingChoice ?? null,
      backtrackedChoice: frame.backtrackedChoice ?? null,
      check: frame.check || null,
      results: [...results],
      nodes: nodes.map((node) => ({
        ...node,
        state: node.id === currentNodeId
          ? "current"
          : node.status === "solution"
            ? "solution"
            : stackIds.has(node.id)
              ? "ancestor"
              : node.status,
      })),
      stack: stack.map((id, depth) => {
        const node = nodeById(id);
        return { id, depth, path: node.path, opened: node.opened, closed: node.closed };
      }),
    };
  };

  const record = (line, phase, title, note, frame = {}) => {
    const view = makeView(phase, frame);
    const shownPath = view.previewPath ?? view.path;
    const shownOpened = view.previewOpened ?? view.opened;
    const shownClosed = view.previewClosed ?? view.closed;
    steps.push({
      title,
      note,
      codeLines: [line],
      final: Boolean(frame.final),
      vars: [
        { name: "path", value: shownPath || "∅" },
        { name: "opened", value: shownOpened },
        { name: "closed", value: shownClosed },
        { name: "result count", value: results.length },
      ],
      generateParentheses22View: view,
    });
  };

  record(2, "setup", text("Gọi generateParenthesis", "Call generateParenthesis"),
    text(`Bắt đầu với n = ${n}; mỗi đáp án cần ${2 * n} ký tự.`, `Start with n = ${n}; every answer needs ${2 * n} characters.`));
  record(3, "setup", text("result = []", "result = []"),
    text("Khởi tạo danh sách kết quả rỗng.", "Initialize the empty result list."));
  record(5, "setup", text("Định nghĩa hàm backtrack", "Define backtrack"),
    text("State gồm path, số ngoặc mở và số ngoặc đóng đã dùng.", "A state contains the path and the counts of used open and close parentheses."));
  record(20, "choose", text("Bắt đầu từ state rỗng", "Start from the empty state"),
    text("Gọi backtrack([], 0, 0).", "Call backtrack([], 0, 0)."), { event: "initial-call" });

  const visit = (path, opened, closed, parentId, choice) => {
    const node = {
      id: nextNodeId++,
      parentId,
      path,
      opened,
      closed,
      depth: path.length,
      choice,
      status: "active",
    };
    nodes.push(node);
    stack.push(node.id);

    const complete = path.length === 2 * n;
    record(6, complete ? "complete" : "choose",
      complete ? text(`Đủ ${2 * n} ký tự`, `Reached ${2 * n} characters`) : text(`Xét state ${path || "∅"}`, `Inspect state ${path || "∅"}`),
      complete
        ? text("Path đã dùng đủ n cặp ngoặc nên đây là một đáp án.", "The path uses all n pairs, so it is a complete answer.")
        : text("Path chưa đủ độ dài; tiếp tục thử ngoặc mở rồi ngoặc đóng.", "The path is not complete; try an open parenthesis and then a close parenthesis."),
      { currentNodeId: node.id, check: { type: "complete", allowed: complete } });

    if (complete) {
      results.push(path);
      node.status = "solution";
      record(7, "complete", text(`Lưu ${path}`, `Save ${path}`),
        text(`Thêm “${path}” vào result.`, `Append “${path}” to result.`), { currentNodeId: node.id, event: "save-result" });
      record(8, "backtrack", text("Return khỏi leaf", "Return from the leaf"),
        text("Quay lại state cha để thử lựa chọn khác.", "Return to the parent state to try another choice."), { currentNodeId: node.id, event: "leaf-return" });
      stack.pop();
      return;
    }

    const canOpen = opened < n;
    record(10, canOpen ? "choose" : "blocked",
      text(`opened < n → ${canOpen}`, `opened < n → ${canOpen}`),
      canOpen
        ? text("Vẫn còn ngoặc mở; nhánh '(' hợp lệ.", "An open parenthesis remains available, so the '(' branch is valid.")
        : text("Đã dùng đủ n ngoặc mở; chặn nhánh '('.", "All n open parentheses are used, so block the '(' branch."),
      { currentNodeId: node.id, check: { type: "open", allowed: canOpen } });

    if (canOpen) {
      const nextPath = `${path}(`;
      record(11, "choose", text(`Chọn '(' → ${nextPath}`, `Choose '(' → ${nextPath}`),
        text("Thêm ngoặc mở vào path.", "Append an open parenthesis to the path."), {
          currentNodeId: node.id,
          previewPath: nextPath,
          previewOpened: opened + 1,
          previewClosed: closed,
          pendingChoice: "(",
          event: "append-open",
        });
      record(12, "choose", text(`Đệ quy với ${nextPath}`, `Recurse with ${nextPath}`),
        text("Đi sâu vào nhánh vừa chọn.", "Descend into the chosen branch."), {
          currentNodeId: node.id,
          previewPath: nextPath,
          previewOpened: opened + 1,
          previewClosed: closed,
          pendingChoice: "(",
          event: "recurse-open",
        });
      visit(nextPath, opened + 1, closed, node.id, "(");
      record(13, "backtrack", text(`pop '(' → ${path || "∅"}`, `Pop '(' → ${path || "∅"}`),
        text("Khôi phục path của state hiện tại.", "Restore the current state's path."), {
          currentNodeId: node.id,
          backtrackedChoice: "(",
          event: "pop-open",
        });
    }

    const canClose = closed < opened;
    record(15, canClose ? "choose" : "blocked",
      text(`closed < opened → ${canClose}`, `closed < opened → ${canClose}`),
      canClose
        ? text("Có ngoặc mở chưa ghép; nhánh ')' hợp lệ.", "An unmatched open parenthesis exists, so the ')' branch is valid.")
        : text("Không thể đóng trước khi có ngoặc mở chưa ghép; chặn nhánh ')'.", "A close cannot appear without an unmatched open parenthesis, so block the ')' branch."),
      { currentNodeId: node.id, check: { type: "close", allowed: canClose } });

    if (canClose) {
      const nextPath = `${path})`;
      record(16, "choose", text(`Chọn ')' → ${nextPath}`, `Choose ')' → ${nextPath}`),
        text("Thêm ngoặc đóng mà không làm prefix mất cân bằng.", "Append a close parenthesis without making the prefix invalid."), {
          currentNodeId: node.id,
          previewPath: nextPath,
          previewOpened: opened,
          previewClosed: closed + 1,
          pendingChoice: ")",
          event: "append-close",
        });
      record(17, "choose", text(`Đệ quy với ${nextPath}`, `Recurse with ${nextPath}`),
        text("Đi sâu vào nhánh ngoặc đóng.", "Descend into the close-parenthesis branch."), {
          currentNodeId: node.id,
          previewPath: nextPath,
          previewOpened: opened,
          previewClosed: closed + 1,
          pendingChoice: ")",
          event: "recurse-close",
        });
      visit(nextPath, opened, closed + 1, node.id, ")");
      record(18, "backtrack", text(`pop ')' → ${path || "∅"}`, `Pop ')' → ${path || "∅"}`),
        text("Khôi phục path rồi tiếp tục quay lui.", "Restore the path and continue backtracking."), {
          currentNodeId: node.id,
          backtrackedChoice: ")",
          event: "pop-close",
        });
    }

    node.status = "explored";
    stack.pop();
  };

  visit("", 0, 0, null, null);
  record(21, "done", text(`Return ${results.length} đáp án`, `Return ${results.length} answer(s)`),
    text("Toàn bộ cây quyết định hợp lệ đã được duyệt.", "The complete valid decision tree has been explored."), {
      final: true,
      event: "return-result",
    });

  return { original: n, answer: results, steps };
}

function buildSteps22Bitmask(input) {
  const n = parseN(input);
  const width = 2 * n;
  const totalMasks = 1 << width;
  const steps = [];
  const results = [];
  const inspected = [];

  const makeView = (phase, frame = {}) => ({
    approach: 2,
    n,
    width,
    totalMasks,
    phase,
    event: frame.event || phase,
    mask: frame.mask ?? null,
    bits: frame.mask === undefined || frame.mask === null
      ? "".padStart(width, "0")
      : frame.mask.toString(2).padStart(width, "0"),
    index: frame.index ?? null,
    path: frame.path ?? "",
    balance: frame.balance ?? 0,
    valid: frame.valid ?? true,
    currentBit: frame.currentBit ?? null,
    currentChar: frame.currentChar ?? null,
    invalidAt: frame.invalidAt ?? null,
    results: [...results],
    inspected: inspected.slice(-10).map((candidate) => ({ ...candidate })),
  });

  const record = (line, phase, title, note, frame = {}) => {
    const view = makeView(phase, frame);
    steps.push({
      title,
      note,
      codeLines: [line],
      final: Boolean(frame.final),
      vars: [
        { name: "mask", value: view.mask === null ? "—" : `${view.mask}/${totalMasks - 1}` },
        { name: "path", value: view.path || "∅" },
        { name: "balance", value: view.balance },
        { name: "valid", value: view.valid },
        { name: "result count", value: results.length },
      ],
      generateParentheses22View: view,
    });
  };

  record(2, "setup", text("Gọi generateParenthesis", "Call generateParenthesis"),
    text(`Duyệt mọi chuỗi ${width} bit; bit 1 là '(' và bit 0 là ')'.`, `Enumerate every ${width}-bit string; bit 1 means '(' and bit 0 means ')'.`));
  record(3, "setup", text("result = []", "result = []"),
    text("Khởi tạo danh sách kết quả rỗng.", "Initialize the empty result list."));
  record(4, "setup", text(`width = ${width}`, `width = ${width}`),
    text("Mỗi ứng viên phải chứa đúng 2n ký tự.", "Every candidate must contain exactly 2n characters."));

  for (let mask = 0; mask < totalMasks; mask++) {
    let path = "";
    let balance = 0;
    let valid = true;
    let currentBit = null;
    let currentChar = null;
    let invalidAt = null;

    const frame = (extra = {}) => ({ mask, path, balance, valid, currentBit, currentChar, invalidAt, ...extra });
    record(6, "scan", text(`Mask ${mask}/${totalMasks - 1}`, `Mask ${mask}/${totalMasks - 1}`),
      text(`Bắt đầu ứng viên ${mask.toString(2).padStart(width, "0")}.`, `Start candidate ${mask.toString(2).padStart(width, "0")}.`), frame({ event: "next-mask" }));
    record(7, "scan", text("path = []", "path = []"),
      text("Xây chuỗi ứng viên từ trái sang phải.", "Build the candidate from left to right."), frame());
    record(8, "scan", text("balance = 0", "balance = 0"),
      text("balance = số '(' trừ số ')' trong prefix hiện tại.", "balance is opens minus closes in the current prefix."), frame());
    record(9, "scan", text("valid = True", "valid = True"),
      text("Ứng viên còn hợp lệ cho đến khi balance âm.", "The candidate stays valid until its balance becomes negative."), frame());

    for (let i = 0; i < width; i++) {
      currentBit = (mask >> i) & 1;
      currentChar = currentBit ? "(" : ")";
      record(11, "decode", text(`Đọc vị trí ${i}`, `Read position ${i}`),
        text(`Kiểm tra bit ${i} của mask.`, `Inspect bit ${i} of the mask.`), frame({ index: i, event: "read-bit" }));
      record(12, "decode", text(`Bit ${i} = ${currentBit}`, `Bit ${i} = ${currentBit}`),
        currentBit
          ? text("Bit 1 chọn ngoặc mở.", "Bit 1 chooses an open parenthesis.")
          : text("Bit 0 chọn ngoặc đóng.", "Bit 0 chooses a close parenthesis."),
        frame({ index: i, event: "test-bit" }));

      if (currentBit) {
        path += "(";
        record(13, "decode", text(`Thêm '(' → ${path}`, `Append '(' → ${path}`),
          text("Ghi ngoặc mở vào ứng viên.", "Write an open parenthesis into the candidate."), frame({ index: i, event: "append-open" }));
        balance += 1;
        record(14, "validate", text(`balance = ${balance}`, `balance = ${balance}`),
          text("Ngoặc mở làm balance tăng 1.", "An open parenthesis increases balance by 1."), frame({ index: i, event: "increase-balance" }));
      } else {
        path += ")";
        record(16, "decode", text(`Thêm ')' → ${path}`, `Append ')' → ${path}`),
          text("Ghi ngoặc đóng vào ứng viên.", "Write a close parenthesis into the candidate."), frame({ index: i, event: "append-close" }));
        balance -= 1;
        record(17, "validate", text(`balance = ${balance}`, `balance = ${balance}`),
          text("Ngoặc đóng làm balance giảm 1.", "A close parenthesis decreases balance by 1."), frame({ index: i, event: "decrease-balance" }));
      }

      record(19, balance < 0 ? "reject" : "validate",
        text(`balance < 0 → ${balance < 0}`, `balance < 0 → ${balance < 0}`),
        balance < 0
          ? text("Prefix đóng nhiều hơn mở nên mask này bị loại ngay.", "The prefix has more closes than opens, so reject this mask immediately.")
          : text("Prefix vẫn hợp lệ; tiếp tục đọc bit kế tiếp.", "The prefix is still valid; continue to the next bit."),
        frame({ index: i, event: "check-prefix" }));

      if (balance < 0) {
        valid = false;
        invalidAt = i;
        record(20, "reject", text("valid = False", "valid = False"),
          text("Đánh dấu ứng viên không hợp lệ.", "Mark the candidate invalid."), frame({ index: i, event: "mark-invalid" }));
        record(21, "reject", text("Dừng đọc mask", "Stop reading this mask"),
          text("Không cần xét phần suffix còn lại.", "The remaining suffix cannot repair an invalid prefix."), frame({ index: i, event: "break-mask" }));
        break;
      }
    }

    const accepted = valid && balance === 0;
    record(23, accepted ? "accept" : "reject",
      text(`valid and balance == 0 → ${accepted}`, `valid and balance == 0 → ${accepted}`),
      accepted
        ? text("Mọi prefix hợp lệ và balance cuối bằng 0: nhận ứng viên.", "Every prefix is valid and the final balance is zero: accept the candidate.")
        : text("Ứng viên bị loại vì prefix âm hoặc balance cuối khác 0.", "Reject because a prefix was negative or the final balance is not zero."),
      frame({ event: "check-candidate" }));

    if (accepted) {
      results.push(path);
      record(24, "accept", text(`Lưu ${path}`, `Save ${path}`),
        text(`Thêm “${path}” vào result.`, `Append “${path}” to result.`), frame({ event: "save-result" }));
    }

    inspected.push({
      mask,
      bits: mask.toString(2).padStart(width, "0"),
      path,
      balance,
      valid,
      accepted,
      invalidAt,
    });
  }

  record(26, "done", text(`Return ${results.length} đáp án`, `Return ${results.length} answer(s)`),
    text(`Đã kiểm tra đủ ${totalMasks} mask.`, `All ${totalMasks} masks have been inspected.`), {
      final: true,
      event: "return-result",
      path: "",
      balance: 0,
      valid: true,
    });

  return { original: n, answer: results, steps };
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
    approach: [
      text("Cách 1 — Backtracking: chỉ mở các nhánh giữ 0 ≤ closed ≤ opened ≤ n.", "Approach 1 — Backtracking: only explore branches that preserve 0 ≤ closed ≤ opened ≤ n."),
      text("Cách 2 — Bitmask: duyệt 2^(2n) mask; bit 1 là '(' và bit 0 là ')'.", "Approach 2 — Bitmask: enumerate 2^(2n) masks; bit 1 is '(' and bit 0 is ')'."),
      text("Bitmask loại ngay prefix có balance < 0 và chỉ nhận ứng viên kết thúc với balance = 0.", "Bitmask rejects a prefix as soon as balance < 0 and accepts only candidates ending with balance = 0."),
    ],
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

