// Auto-generated: do not edit headers manually.
// Monotonic Stack catalog additions.

const category = { key: "stack-queue", vi: "Stack & Queue", en: "Stack & Queue" };
const arrayTag = { key: "array", vi: "Mảng", en: "Array" };
const stringTag = { key: "string", vi: "Chuỗi", en: "String" };
const treeTag = { key: "tree", vi: "Cây", en: "Tree" };
const linkedListTag = { key: "linked-list", vi: "Linked List", en: "Linked List" };
const monoTag = { key: "monotonic-stack", vi: "Monotonic Stack", en: "Monotonic Stack" };
const premiumTag = { key: "premium", vi: "Premium", en: "Premium" };

const text = (vi, en = vi) => ({ vi, en });
const arrText = (arr) => `[${arr.join(", ")}]`;

function parseNums(value, label = "nums") {
  const nums = String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number);
  if (!nums.length || nums.some((num) => !Number.isInteger(num))) {
    throw new Error(`${label} must be a non-empty comma-separated list of integers.`);
  }
  return nums;
}

function parsePairs(value, label = "pairs") {
  const pairs = String(value ?? "")
    .split(";")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((part) => Number(part.trim())));
  if (!pairs.length || pairs.some((pair) => pair.length !== 2 || pair.some((num) => !Number.isInteger(num)))) {
    throw new Error(`${label} must use a,b;c,d format.`);
  }
  return pairs;
}

function parseMatrix(value, label = "matrix") {
  const matrix = String(value ?? "")
    .split(";")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((part) => Number(part.trim())));
  if (!matrix.length || matrix.some((row) => !row.length || row.some((num) => !Number.isInteger(num)))) {
    throw new Error(`${label} must use rows separated by semicolons.`);
  }
  return matrix;
}

function genericSteps({ nums, title, answer, note, vars = [], highlights = [], marks = [], sub = null }) {
  const arr = Array.isArray(nums) ? nums : [];
  const labels = sub || arr.map((_, index) => `[${index}]`);
  const steps = [
    {
      title: text("Nhận diện monotonic stack", "Identify the monotonic stack pattern"),
      arr: [...arr],
      sub: labels,
      highlight: [],
      mark: [],
      codeLines: [1],
      vars: [{ name: "n", value: arr.length }, ...vars],
      note: text("Ta giữ stack đơn điệu để mỗi phần tử chỉ vào/ra stack một lần.", "Keep a monotonic stack so each element enters and leaves the stack at most once."),
      stackView: {
        title: "Pattern trace",
        emptyLabel: "algorithm state shown in variables",
        items: [],
        input: [...arr],
        current: -1,
        inputLabel: "input values",
        expected: "",
        status: [
          { label: "n", value: arr.length },
          { label: "answer", value: Array.isArray(answer) ? arrText(answer) : answer },
        ],
      },
    },
  ];
  arr.forEach((value, index) => {
    steps.push({
      title: text(`Xét input[${index}] = ${value}`, `Inspect input[${index}] = ${value}`),
      arr: [...arr],
      sub: labels,
      highlight: [index],
      mark: marks,
      codeLines: [3, 4, 5],
      vars: [
        { name: "i", value: index },
        { name: "value", value },
        { name: "answer", value: Array.isArray(answer) ? arrText(answer) : answer },
        ...vars,
      ],
      note: text(
        "Step này cho thấy phần tử đang được thuật toán stack/greedy xử lý trong lượt quét chính.",
        "This step shows the element being processed by the stack/greedy algorithm during the main scan.",
      ),
      stackView: {
        title: "Input scan",
        emptyLabel: "see variables for compact state",
        items: arr.slice(0, index + 1).map((item, itemIndex) => ({ value: item, detail: `seen input[${itemIndex}]` })),
        input: [...arr],
        current: index,
        inputLabel: "input values",
        expected: value,
        status: [
          { label: "current", value: `${value} at ${index}` },
          { label: "processed", value: `${index + 1}/${arr.length}` },
          { label: "answer", value: Array.isArray(answer) ? arrText(answer) : answer },
        ],
      },
    });
  });
  steps.push({
    title,
    arr: [...arr],
    sub: labels,
    highlight: highlights,
    mark: marks,
    final: true,
    codeLines: [6, 7],
    vars: [{ name: "answer", value: Array.isArray(answer) ? arrText(answer) : answer }, ...vars],
    note,
    stackView: {
      title: "Final result",
      emptyLabel: "done",
      items: [],
      input: [...arr],
      current: -1,
      inputLabel: "input values",
      expected: "",
      status: [
        { label: "answer", value: Array.isArray(answer) ? arrText(answer) : answer },
        { label: "steps", value: steps.length + 1 },
      ],
    },
  });
  return steps;
}

function arrayBuilder(solver, noteFactory = null) {
  return (input, params = {}) => {
    const nums = parseNums(input);
    const answer = solver(nums, params);
    const note = noteFactory ? noteFactory(nums, answer, params) : text(`Kết quả = ${Array.isArray(answer) ? arrText(answer) : answer}.`, `Answer = ${Array.isArray(answer) ? arrText(answer) : answer}.`);
    return { original: nums, answer, steps: genericSteps({ nums, title: text("Kết quả", "Result"), answer, note }) };
  };
}

function finalPrices(nums) {
  const ans = [...nums], stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack.at(-1)] >= nums[i]) ans[stack.pop()] -= nums[i];
    stack.push(i);
  }
  return ans;
}

function buildSteps1475(input) {
  const prices = parseNums(input, "prices");
  if (prices.length > 14) throw new Error("Use up to 14 prices so the discount stack stays readable.");
  const answer = [...prices];
  const stack = [];
  const steps = [];

  const answerText = () => arrText(answer);
  const stackText = () => `[${stack.map((index) => `${index}:${prices[index]}`).join(", ")}]`;
  const priceSub = () => prices.map((price, index) => `i=${index} · price=${price} · final=${answer[index]}`);
  const stackItems = () => stack.map((index) => ({ value: prices[index], detail: `index ${index}` }));

  const snap = ({ title, line, note, current = -1, compare = -1, resolved = -1, final = false }) => {
    const top = stack.length ? stack.at(-1) : null;
    const highlight = [];
    if (current >= 0) highlight.push(current);
    if (compare >= 0 && compare !== current) highlight.push(compare);
    steps.push({
      title,
      arr: [...prices],
      sub: priceSub(),
      highlight,
      mark: resolved >= 0
        ? [resolved]
        : final
          ? answer.map((value, index) => value !== prices[index] ? index : -1).filter((index) => index >= 0)
          : [...stack],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "i", value: current >= 0 ? current : "-" },
        { name: "price", value: current >= 0 ? prices[current] : "-" },
        { name: "stack", value: stackText() },
        { name: "answer", value: answerText() },
      ],
      note,
      final,
      stackView: {
        title: "Monotonic increasing stack (prices waiting for discount)",
        emptyLabel: "no price is waiting",
        items: stackItems(),
        input: [...prices],
        current,
        inputLabel: "prices scanned from left to right",
        expected: current >= 0 ? prices[current] : "",
        status: [
          { label: "current price", value: current >= 0 ? `${prices[current]} at index ${current}` : "-" },
          { label: "stack top", value: top == null ? "empty" : `${prices[top]} at index ${top}` },
          { label: "condition", value: top == null || current < 0 ? "-" : `${prices[top]} >= ${prices[current]}` },
          { label: "final prices", value: answerText() },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3: copy prices sang answer", "Line 3: copy prices into answer"),
    line: 3,
    note: text(
      "Ban đầu chưa biết discount của ai, nên final price tạm thời bằng giá gốc.",
      "Initially no discount is known, so each final price starts as the original price.",
    ),
  });
  snap({
    title: text("Dòng 4: stack rỗng", "Line 4: empty stack"),
    line: 4,
    note: text(
      "Stack lưu index của các món bên trái chưa tìm được món giảm giá đầu tiên ở bên phải. Giá trong stack tăng dần từ dưới lên trên.",
      "The stack stores left-side indices still waiting for their first discount to the right. Prices in the stack increase from bottom to top.",
    ),
  });

  for (let i = 0; i < prices.length; i++) {
    snap({
      title: text(`Dòng 5: xét prices[${i}] = ${prices[i]}`, `Line 5: read prices[${i}] = ${prices[i]}`),
      line: 5,
      current: i,
      note: text(
        `Món hiện tại có giá ${prices[i]}. Nó có thể là discount cho các món trước đó có giá >= ${prices[i]}.`,
        `The current item costs ${prices[i]}. It can discount earlier items whose price is >= ${prices[i]}.`,
      ),
    });

    while (stack.length && prices[stack.at(-1)] >= prices[i]) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 6: ${prices[top]} >= ${prices[i]} nên có discount`, `Line 6: ${prices[top]} >= ${prices[i]}, discount found`),
        line: 6,
        current: i,
        compare: top,
        note: text(
          `Index ${top} đang chờ discount. Vì index ${i} là món đầu tiên bên phải có giá <= ${prices[top]}, ta dùng ${prices[i]} làm discount.`,
          `Index ${top} is waiting for a discount. Because index ${i} is the first price to the right that is <= ${prices[top]}, use ${prices[i]} as the discount.`,
        ),
      });
      const resolved = stack.pop();
      snap({
        title: text(`Dòng 7: pop index ${resolved}`, `Line 7: pop index ${resolved}`),
        line: 7,
        current: i,
        resolved,
        note: text(
          `Lấy index ${resolved} ra khỏi stack vì ta đã biết discount của nó.`,
          `Remove index ${resolved} from the stack because its discount is now known.`,
        ),
      });
      const before = answer[resolved];
      answer[resolved] = prices[resolved] - prices[i];
      snap({
        title: text(`Dòng 8: answer[${resolved}] = ${prices[resolved]} - ${prices[i]} = ${answer[resolved]}`, `Line 8: answer[${resolved}] = ${prices[resolved]} - ${prices[i]} = ${answer[resolved]}`),
        line: 8,
        current: i,
        resolved,
        note: text(
          `Final price của index ${resolved} đổi từ ${before} thành ${answer[resolved]}.`,
          `The final price at index ${resolved} changes from ${before} to ${answer[resolved]}.`,
        ),
      });
    }

    const topAfter = stack.at(-1);
    snap({
      title: text(
        topAfter == null ? "Dòng 6: dừng while vì stack rỗng" : `Dòng 6: dừng while vì ${prices[topAfter]} < ${prices[i]}`,
        topAfter == null ? "Line 6: stop while because stack is empty" : `Line 6: stop while because ${prices[topAfter]} < ${prices[i]}`,
      ),
      line: 6,
      current: i,
      compare: topAfter ?? -1,
      note: text(
        topAfter == null
          ? "Không còn món bên trái nào có thể dùng giá hiện tại làm discount."
          : `Đỉnh stack hiện có giá ${prices[topAfter]}, nhỏ hơn ${prices[i]}, nên giá hiện tại không thể giảm cho nó.`,
        topAfter == null
          ? "No earlier waiting item can use the current price as a discount."
          : `The stack top is ${prices[topAfter]}, smaller than ${prices[i]}, so the current price cannot discount it.`,
      ),
    });

    stack.push(i);
    snap({
      title: text(`Dòng 9: stack.append(${i})`, `Line 9: stack.append(${i})`),
      line: 9,
      current: i,
      note: text(
        `Index ${i} vào stack để chờ món đầu tiên bên phải có giá <= ${prices[i]}.`,
        `Index ${i} enters the stack and waits for the first future price <= ${prices[i]}.`,
      ),
    });
  }

  snap({
    title: text(`Dòng 10: return ${answerText()}`, `Line 10: return ${answerText()}`),
    line: 10,
    final: true,
    note: stack.length
      ? text(
          `Các index còn trong stack [${stack.join(", ")}] không có discount bên phải, nên giữ nguyên giá gốc.`,
          `Remaining stack indices [${stack.join(", ")}] have no discount to the right, so they keep their original prices.`,
        )
      : text("Mọi món đều đã được xét xong.", "Every item has been processed."),
  });

  return { original: prices, answer, steps };
}

function removeDuplicateLetters(input) {
  const s = String(input ?? "");
  const last = {};
  [...s].forEach((ch, i) => { last[ch] = i; });
  const stack = [], used = new Set();
  [...s].forEach((ch, i) => {
    if (used.has(ch)) return;
    while (stack.length && stack.at(-1) > ch && last[stack.at(-1)] > i) used.delete(stack.pop());
    stack.push(ch);
    used.add(ch);
  });
  return stack.join("");
}

function buildSteps316(input) {
  const s = String(input ?? "");
  if (!s || s.length > 18) throw new Error("Use a non-empty string up to 18 characters for the visualization.");
  const chars = [...s];
  const last = new Map();
  const stack = [];
  const used = new Set();
  const steps = [];
  chars.forEach((ch, i) => last.set(ch, i));

  const stackText = () => stack.join("") || "empty";
  const usedText = () => `{${[...used].sort().join(", ")}}`;
  const lastText = () => `{${[...last.entries()].map(([ch, i]) => `${ch}:${i}`).join(", ")}}`;
  const sub = () => chars.map((ch, i) => `${ch} @ ${i}${used.has(ch) ? " · used" : ""}`);
  const stackItems = () => stack.map((ch) => ({ value: ch, detail: `last=${last.get(ch)}` }));
  const snap = ({ title, line, note, current = -1, final = false, removed = "" }) => {
    const top = stack.length ? stack.at(-1) : "";
    steps.push({
      title,
      arr: chars.map((ch) => ch.charCodeAt(0)),
      sub: sub(),
      highlight: current >= 0 ? [current] : [],
      mark: stack.map((ch) => chars.findIndex((c, index) => c === ch && index <= last.get(ch))),
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "ch", value: current >= 0 ? chars[current] : "-" },
        { name: "stack", value: stackText() },
        { name: "used", value: usedText() },
        { name: "last", value: lastText() },
        ...(removed ? [{ name: "removed", value: removed }] : []),
      ],
      note,
      final,
      stackView: {
        title: "Monotonic character stack (smallest distinct result)",
        emptyLabel: "empty stack",
        items: stackItems(),
        input: chars,
        current,
        inputLabel: "s scanned left to right",
        expected: current >= 0 ? chars[current] : "",
        status: [
          { label: "current char", value: current >= 0 ? `${chars[current]} @ ${current}` : "-" },
          { label: "top", value: top || "empty" },
          { label: "used", value: usedText() },
          { label: "answer so far", value: stackText() },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3-5: last, stack, used", "Lines 3-5: last, stack, used"),
    line: [3, 4, 5],
    note: text(
      "last cho biết mỗi ký tự còn xuất hiện lại ở đâu. used đảm bảo mỗi ký tự chỉ nằm trong stack một lần.",
      "last tells where each character appears again. used ensures each character appears in the stack only once.",
    ),
  });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    snap({
      title: text(`Dòng 6: i=${i}, ch='${ch}'`, `Line 6: i=${i}, ch='${ch}'`),
      line: 6,
      current: i,
      note: text(
        `Ta muốn stack nhỏ theo thứ tự từ điển, nhưng vẫn phải giữ đủ mỗi ký tự khác nhau.`,
        `We want a lexicographically small stack while still keeping every distinct character.`,
      ),
    });

    if (used.has(ch)) {
      snap({
        title: text(`Dòng 7-8: '${ch}' đã dùng, bỏ qua`, `Lines 7-8: '${ch}' is already used, skip`),
        line: [7, 8],
        current: i,
        note: text(
          `'${ch}' đã có trong stack, nếu thêm nữa sẽ vi phạm điều kiện mỗi ký tự đúng một lần.`,
          `'${ch}' is already in the stack; adding it again would break the exactly-once rule.`,
        ),
      });
      continue;
    }

    while (stack.length && ch < stack.at(-1) && i < last.get(stack.at(-1))) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 9: '${ch}' < '${top}' và '${top}' còn xuất hiện sau`, `Line 9: '${ch}' < '${top}' and '${top}' appears later`),
        line: 9,
        current: i,
        note: text(
          `Pop '${top}' để '${ch}' đứng sớm hơn, vì '${top}' vẫn còn bản sao ở index ${last.get(top)}.`,
          `Pop '${top}' so '${ch}' can appear earlier, because '${top}' still appears again at index ${last.get(top)}.`,
        ),
      });
      const removed = stack.pop();
      used.delete(removed);
      snap({
        title: text(`Dòng 10: remove '${removed}' khỏi used`, `Line 10: remove '${removed}' from used`),
        line: 10,
        current: i,
        removed,
        note: text(
          `Sau khi pop, '${removed}' không còn trong stack nên xóa khỏi used để có thể thêm lại sau.`,
          `After popping, '${removed}' is no longer in the stack, so remove it from used so it can be added later.`,
        ),
      });
    }

    const topAfter = stack.at(-1);
    snap({
      title: text(
        !topAfter ? "Dòng 9: dừng while vì stack rỗng" : `Dòng 9: dừng while, không được pop '${topAfter}'`,
        !topAfter ? "Line 9: stop while because stack is empty" : `Line 9: stop while; cannot pop '${topAfter}'`,
      ),
      line: 9,
      current: i,
      note: text(
        !topAfter
          ? "Không còn ký tự nào trong stack để so sánh."
          : `Không pop '${topAfter}' vì một trong ba điều kiện sai: top không lớn hơn ch, hoặc top không còn xuất hiện phía sau.`,
        !topAfter
          ? "No character remains in the stack to compare."
          : `Do not pop '${topAfter}' because one of the three conditions is false: top is not larger, or top does not appear later.`,
      ),
    });

    stack.push(ch);
    used.add(ch);
    snap({
      title: text(`Dòng 11-12: push '${ch}' và add used`, `Lines 11-12: push '${ch}' and add used`),
      line: [11, 12],
      current: i,
      note: text(
        `Stack hiện là '${stackText()}'.`,
        `The stack is now '${stackText()}'.`,
      ),
    });
  }

  const answer = stack.join("");
  snap({
    title: text(`Dòng 13: return '${answer}'`, `Line 13: return '${answer}'`),
    line: 13,
    final: true,
    note: text(
      "Stack chứa mỗi ký tự khác nhau đúng một lần và nhỏ nhất theo thứ tự từ điển.",
      "The stack contains each distinct character exactly once and is lexicographically smallest.",
    ),
  });

  return { original: s, answer, steps };
}

function pattern132(nums) {
  let third = -Infinity;
  const stack = [];
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] < third) return true;
    while (stack.length && nums[i] > stack.at(-1)) third = stack.pop();
    stack.push(nums[i]);
  }
  return false;
}

function shortestUnsorted(nums) {
  const stack = [];
  let left = nums.length, right = 0;
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack.at(-1)] > nums[i]) left = Math.min(left, stack.pop());
    stack.push(i);
  }
  stack.length = 0;
  for (let i = nums.length - 1; i >= 0; i--) {
    while (stack.length && nums[stack.at(-1)] < nums[i]) right = Math.max(right, stack.pop());
    stack.push(i);
  }
  return right > left ? right - left + 1 : 0;
}

function buildSteps581(input) {
  const nums = parseNums(input, "nums");
  if (nums.length > 14) throw new Error("Use up to 14 numbers so the two stack passes stay readable.");
  const stack = [];
  const steps = [];
  let left = nums.length;
  let right = 0;
  let phase = "left pass";

  const stackText = () => `[${stack.map((index) => `${index}:${nums[index]}`).join(", ")}]`;
  const boundaryText = () => left === nums.length || right === 0 ? "not decided" : `[${left}, ${right}]`;
  const stackItems = () => stack.map((index) => ({ value: nums[index], detail: `index ${index}` }));
  const sub = () => nums.map((value, index) => {
    const inside = right > left && index >= left && index <= right ? "sort" : "";
    return `i=${index} · ${value}${inside ? ` · ${inside}` : ""}`;
  });
  const snap = ({ title, line, note, current = -1, compare = -1, resolved = -1, final = false }) => {
    const top = stack.length ? stack.at(-1) : null;
    const highlight = [];
    if (current >= 0) highlight.push(current);
    if (compare >= 0 && compare !== current) highlight.push(compare);
    steps.push({
      title,
      arr: [...nums],
      sub: sub(),
      highlight,
      mark: resolved >= 0
        ? [resolved]
        : right > left
          ? Array.from({ length: right - left + 1 }, (_, offset) => left + offset)
          : [...stack],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "phase", value: phase },
        { name: "stack", value: stackText() },
        { name: "left", value: left === nums.length ? "n" : left },
        { name: "right", value: right },
        { name: "window", value: boundaryText() },
      ],
      note,
      final,
      stackView: {
        title: phase === "left pass"
          ? "Left pass: find earliest broken index"
          : "Right pass: find latest broken index",
        emptyLabel: "empty stack",
        items: stackItems(),
        input: [...nums],
        current,
        inputLabel: phase === "left pass"
          ? "scan left to right, stack keeps increasing indices"
          : "scan right to left, stack keeps decreasing indices",
        expected: current >= 0 ? nums[current] : "",
        status: [
          { label: "current", value: current >= 0 ? `${nums[current]} at ${current}` : "-" },
          { label: "stack top", value: top == null ? "empty" : `${nums[top]} at ${top}` },
          { label: "left", value: left === nums.length ? "n" : left },
          { label: "right", value: right },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3-4: khởi tạo left, right, stack", "Lines 3-4: initialize left, right, stack"),
    line: [3, 4],
    note: text(
      "Mục tiêu là tìm đoạn nhỏ nhất [left..right] mà nếu sort đoạn đó thì toàn mảng sẽ tăng không giảm.",
      "Goal: find the smallest window [left..right] such that sorting only that window makes the whole array nondecreasing.",
    ),
  });

  for (let i = 0; i < nums.length; i++) {
    snap({
      title: text(`Dòng 5: lượt trái, i=${i}, nums[i]=${nums[i]}`, `Line 5: left pass, i=${i}, nums[i]=${nums[i]}`),
      line: 5,
      current: i,
      note: text(
        "Lượt trái phát hiện phần tử lớn hơn nằm bên trái một số nhỏ hơn. Index bị pop có thể là biên trái cần sort.",
        "The left pass detects a larger value sitting before a smaller value. A popped index may be the left boundary of the sort window.",
      ),
    });
    while (stack.length && nums[stack.at(-1)] > nums[i]) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 6: ${nums[top]} > ${nums[i]} nên pop`, `Line 6: ${nums[top]} > ${nums[i]}, so pop`),
        line: 6,
        current: i,
        compare: top,
        note: text(
          `nums[${top}] = ${nums[top]} đứng trước nums[${i}] = ${nums[i]} nhưng lớn hơn, nên index ${top} nằm trong vùng sai thứ tự.`,
          `nums[${top}] = ${nums[top]} is before nums[${i}] = ${nums[i]} but greater, so index ${top} belongs to the unsorted region.`,
        ),
      });
      const popped = stack.pop();
      left = Math.min(left, popped);
      snap({
        title: text(`Dòng 7-8: left = min(left, ${popped}) = ${left}`, `Lines 7-8: left = min(left, ${popped}) = ${left}`),
        line: [7, 8],
        current: i,
        resolved: popped,
        note: text(
          `Cập nhật left về index sớm nhất từng bị phá thứ tự.`,
          `Update left to the earliest index whose order was broken.`,
        ),
      });
    }
    stack.push(i);
    snap({
      title: text(`Dòng 9: push index ${i}`, `Line 9: push index ${i}`),
      line: 9,
      current: i,
      note: text(
        "Stack giữ các index có value tăng dần. Nếu số nhỏ hơn xuất hiện sau này, nó sẽ pop các index sai thứ tự.",
        "The stack keeps indices with increasing values. If a smaller number appears later, it will pop out-of-order indices.",
      ),
    });
  }

  stack.length = 0;
  phase = "right pass";
  snap({
    title: text("Dòng 10: reset stack cho lượt phải", "Line 10: reset stack for the right pass"),
    line: 10,
    note: text(
      "Lượt phải làm điều ngược lại: tìm phần tử nhỏ hơn nằm bên phải một số lớn hơn để xác định biên right.",
      "The right pass does the opposite: find a smaller value on the right of a larger value to determine the right boundary.",
    ),
  });

  for (let i = nums.length - 1; i >= 0; i--) {
    snap({
      title: text(`Dòng 11: lượt phải, i=${i}, nums[i]=${nums[i]}`, `Line 11: right pass, i=${i}, nums[i]=${nums[i]}`),
      line: 11,
      current: i,
      note: text(
        "Nếu nums[i] lớn hơn các phần tử đang chờ bên phải, các index đó cần nằm trong đoạn sort.",
        "If nums[i] is greater than waiting values to its right, those indices must be inside the sort window.",
      ),
    });
    while (stack.length && nums[stack.at(-1)] < nums[i]) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 12: ${nums[top]} < ${nums[i]} nên pop`, `Line 12: ${nums[top]} < ${nums[i]}, so pop`),
        line: 12,
        current: i,
        compare: top,
        note: text(
          `nums[${i}] = ${nums[i]} đứng trước nums[${top}] = ${nums[top]} nhưng lớn hơn, nên index ${top} xác nhận biên phải có thể mở rộng.`,
          `nums[${i}] = ${nums[i]} is before nums[${top}] = ${nums[top]} but greater, so index ${top} can extend the right boundary.`,
        ),
      });
      const popped = stack.pop();
      right = Math.max(right, popped);
      snap({
        title: text(`Dòng 13: right = max(right, ${popped}) = ${right}`, `Line 13: right = max(right, ${popped}) = ${right}`),
        line: 13,
        current: i,
        resolved: popped,
        note: text(
          "Cập nhật right về index xa nhất bên phải bị phá thứ tự.",
          "Update right to the farthest right index whose order was broken.",
        ),
      });
    }
    stack.push(i);
    snap({
      title: text(`Dòng 14: push index ${i}`, `Line 14: push index ${i}`),
      line: 14,
      current: i,
      note: text(
        "Stack lượt phải giữ các index có value giảm dần khi nhìn từ phải sang trái.",
        "The right-pass stack keeps indices with decreasing values while scanning from right to left.",
      ),
    });
  }

  const answer = right > left ? right - left + 1 : 0;
  snap({
    title: text(`Dòng 16: return ${answer}`, `Line 16: return ${answer}`),
    line: 16,
    final: true,
    note: text(
      answer === 0
        ? "Không tìm thấy cặp sai thứ tự, mảng đã tăng không giảm."
        : `Sort đoạn [${left}..${right}] có độ dài ${answer}; mọi phần tử ngoài đoạn đã đúng vị trí tương đối.`,
      answer === 0
        ? "No broken pair was found, so the array is already nondecreasing."
        : `Sorting window [${left}..${right}] of length ${answer} fixes the array; everything outside already has correct relative order.`,
    ),
  });

  return { original: nums, answer, steps };
}

function maxBinaryTree(nums) {
  const stack = [];
  nums.forEach((value) => {
    const node = { val: value, left: null, right: null };
    while (stack.length && stack.at(-1).val < value) node.left = stack.pop();
    if (stack.length) stack.at(-1).right = node;
    stack.push(node);
  });
  while (stack.length > 1) stack.pop();
  return stack[0]?.val ?? null;
}

function maxChunks(nums) {
  let best = 0, chunks = 0;
  nums.forEach((num, i) => {
    best = Math.max(best, num);
    if (best === i) chunks++;
  });
  return chunks;
}

function buildSteps769(input) {
  const nums = parseNums(input, "arr");
  if (nums.length > 16) throw new Error("Use up to 16 values so the chunk trace stays readable.");
  let maxSoFar = -Infinity;
  let chunks = 0;
  const steps = [];
  const chunkEnds = [];

  const chunkText = () => chunkEnds.length ? chunkEnds.join(", ") : "none";
  const sub = () => nums.map((value, index) => `i=${index} · ${value}${chunkEnds.includes(index) ? " · cut" : ""}`);
  const snap = ({ title, line, note, current = -1, final = false }) => {
    steps.push({
      title,
      arr: [...nums],
      sub: sub(),
      highlight: current >= 0 ? [current] : [],
      mark: [...chunkEnds],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "i", value: current >= 0 ? current : "-" },
        { name: "maxSoFar", value: maxSoFar === -Infinity ? "-∞" : maxSoFar },
        { name: "chunks", value: chunks },
        { name: "chunk ends", value: chunkText() },
      ],
      note,
      final,
      stackView: {
        title: "Permutation chunks by prefix maximum",
        emptyLabel: "no chunk cut yet",
        items: chunkEnds.map((index) => ({ value: index, detail: `chunk ends at ${index}` })),
        input: [...nums],
        current,
        inputLabel: "arr scanned left to right",
        expected: current >= 0 ? nums[current] : "",
        status: [
          { label: "current", value: current >= 0 ? `${nums[current]} at ${current}` : "-" },
          { label: "maxSoFar", value: maxSoFar === -Infinity ? "-∞" : maxSoFar },
          { label: "can cut?", value: current >= 0 ? `${maxSoFar} == ${current}` : "-" },
          { label: "chunks", value: chunks },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3-4: maxSoFar = -inf, chunks = 0", "Lines 3-4: maxSoFar = -inf, chunks = 0"),
    line: [3, 4],
    note: text(
      "Vì arr là permutation của 0..n-1, khi max prefix bằng đúng index i thì prefix [0..i] chứa đủ các số 0..i và có thể tách thành một chunk.",
      "Because arr is a permutation of 0..n-1, when the prefix max equals index i, prefix [0..i] contains exactly values 0..i and can be cut as a chunk.",
    ),
  });

  for (let i = 0; i < nums.length; i++) {
    snap({
      title: text(`Dòng 5: xét i=${i}, arr[i]=${nums[i]}`, `Line 5: read i=${i}, arr[i]=${nums[i]}`),
      line: 5,
      current: i,
      note: text("Cập nhật maximum của prefix đang xét.", "Update the maximum value in the current prefix."),
    });
    maxSoFar = Math.max(maxSoFar, nums[i]);
    snap({
      title: text(`Dòng 6: maxSoFar = ${maxSoFar}`, `Line 6: maxSoFar = ${maxSoFar}`),
      line: 6,
      current: i,
      note: text(`Prefix tới i=${i} cần chứa đủ các value từ 0 đến ${i}; điều này xảy ra khi maxSoFar == i.`, `The prefix through i=${i} must contain all values from 0 to ${i}; that happens when maxSoFar == i.`),
    });
    if (maxSoFar === i) {
      chunks += 1;
      chunkEnds.push(i);
      snap({
        title: text(`Dòng 7-8: maxSoFar == i, cắt chunk #${chunks}`, `Lines 7-8: maxSoFar == i, cut chunk #${chunks}`),
        line: [7, 8],
        current: i,
        note: text(`Sort riêng chunk kết thúc tại ${i}; nó sẽ khớp đoạn sorted tương ứng.`, `Sorting the chunk ending at ${i} matches the corresponding sorted segment.`),
      });
    } else {
      snap({
        title: text("Dòng 7: chưa cắt chunk", "Line 7: cannot cut yet"),
        line: 7,
        current: i,
        note: text(`maxSoFar=${maxSoFar} khác i=${i}, nên prefix còn thiếu/đang chứa value vượt ra ngoài đoạn này.`, `maxSoFar=${maxSoFar} differs from i=${i}, so the prefix is still missing values or contains values beyond this segment.`),
      });
    }
  }

  snap({
    title: text(`Dòng 9: return ${chunks}`, `Line 9: return ${chunks}`),
    line: 9,
    final: true,
    note: text(`Có thể chia tối đa ${chunks} chunk.`, `The maximum number of chunks is ${chunks}.`),
  });

  return { original: nums, answer: chunks, steps };
}

function carFleet(input, params = {}) {
  const cars = parsePairs(input, "cars");
  const target = Number(params.target ?? 12);
  const times = cars
    .map(([position, speed]) => [position, (target - position) / speed])
    .sort((a, b) => b[0] - a[0]);
  let fleets = 0, slowest = 0;
  times.forEach(([, time]) => {
    if (time > slowest) {
      fleets++;
      slowest = time;
    }
  });
  return fleets;
}

function stockSpan(input) {
  const prices = parseNums(input, "prices");
  const stack = [], answer = [];
  prices.forEach((price, i) => {
    while (stack.length && stack.at(-1)[0] <= price) stack.pop();
    answer.push(stack.length ? i - stack.at(-1)[1] : i + 1);
    stack.push([price, i]);
  });
  return { original: prices, answer, steps: genericSteps({ nums: prices, title: text("Stock spans", "Stock spans"), answer, note: text("Stack giảm dần theo giá; span nhảy về ngày có giá cao hơn gần nhất.", "The stack decreases by price; span jumps back to the nearest previous higher price.") }) };
}

function buildSteps901(input) {
  const prices = parseNums(input, "prices");
  if (prices.length > 16) throw new Error("Use up to 16 prices so the span stack stays readable.");
  const stack = [];
  const answer = [];
  const steps = [];

  const stackText = () => `[${stack.map(([price, index]) => `${price}@${index}`).join(", ")}]`;
  const answerText = () => arrText(answer);
  const sub = () => prices.map((price, index) => `day=${index} · price=${price} · span=${answer[index] ?? "?"}`);
  const stackItems = () => stack.map(([price, index]) => ({ value: price, detail: `day ${index}` }));
  const snap = ({ title, line, note, current = -1, resolved = null, span = null, final = false }) => {
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title,
      arr: [...prices],
      sub: sub(),
      highlight: current >= 0 ? [current] : [],
      mark: resolved != null ? [resolved[1]] : [],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "day", value: current >= 0 ? current : "-" },
        { name: "price", value: current >= 0 ? prices[current] : "-" },
        { name: "span", value: span ?? "-" },
        { name: "stack", value: stackText() },
        { name: "answer", value: answerText() },
      ],
      note,
      final,
      stackView: {
        title: "Monotonic decreasing price stack",
        emptyLabel: "no previous higher price",
        items: stackItems(),
        input: [...prices],
        current,
        inputLabel: "prices by day",
        expected: current >= 0 ? prices[current] : "",
        status: [
          { label: "current price", value: current >= 0 ? prices[current] : "-" },
          { label: "stack top", value: top ? `${top[0]} at day ${top[1]}` : "empty" },
          { label: "top <= current?", value: top && current >= 0 ? `${top[0]} <= ${prices[current]}` : "-" },
          { label: "answer", value: answerText() },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3-4: stack rỗng, answer rỗng", "Lines 3-4: empty stack and answer"),
    line: [3, 4],
    note: text("Stack giữ các ngày trước có giá lớn hơn giá hiện tại gần nhất.", "The stack keeps previous days that may be the nearest higher price."),
  });

  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    snap({
      title: text(`Dòng 5: day ${i}, price=${price}`, `Line 5: day ${i}, price=${price}`),
      line: 5,
      current: i,
      note: text("Các ngày có giá <= hôm nay được tính vào span và không thể chặn ngày sau nữa.", "Days with price <= today are included in the span and cannot block future days."),
    });
    while (stack.length && stack.at(-1)[0] <= price) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 6: ${top[0]} <= ${price}, pop day ${top[1]}`, `Line 6: ${top[0]} <= ${price}, pop day ${top[1]}`),
        line: 6,
        current: i,
        resolved: top,
        note: text(`Day ${top[1]} có giá không cao hơn hôm nay, nên nằm trong span của hôm nay.`, `Day ${top[1]}'s price is not higher than today, so it belongs inside today's span.`),
      });
      stack.pop();
    }
    const span = stack.length ? i - stack.at(-1)[1] : i + 1;
    answer.push(span);
    snap({
      title: text(`Dòng 8-9: span = ${span}, append vào answer`, `Lines 8-9: span = ${span}, append to answer`),
      line: [8, 9],
      current: i,
      span,
      note: text(
        stack.length
          ? `Giá cao hơn gần nhất còn lại ở day ${stack.at(-1)[1]}, nên span = ${i} - ${stack.at(-1)[1]}.`
          : `Không còn giá cao hơn bên trái, nên span phủ từ day 0 tới day ${i}.`,
        stack.length
          ? `The nearest remaining higher price is day ${stack.at(-1)[1]}, so span = ${i} - ${stack.at(-1)[1]}.`
          : `No higher price remains on the left, so the span covers day 0 through day ${i}.`,
      ),
    });
    stack.push([price, i]);
    snap({
      title: text(`Dòng 10: push [${price}, ${i}]`, `Line 10: push [${price}, ${i}]`),
      line: 10,
      current: i,
      span,
      note: text("Giữ hôm nay để làm mốc giá cao hơn cho các ngày sau.", "Keep today as a possible higher-price boundary for future days."),
    });
  }

  snap({
    title: text(`Dòng 11: return ${answerText()}`, `Line 11: return ${answerText()}`),
    line: 11,
    final: true,
    note: text("Mỗi span là số ngày liên tiếp gần nhất có giá <= ngày hiện tại.", "Each span is the number of consecutive recent days with price <= the current day."),
  });

  return { original: prices, answer, steps };
}

function sumSubarrayMins(nums) {
  const mod = 1000000007, stack = [];
  let ans = 0, dot = 0;
  nums.forEach((num) => {
    let count = 1;
    while (stack.length && stack.at(-1)[0] >= num) {
      const [value, span] = stack.pop();
      count += span;
      dot -= value * span;
    }
    stack.push([num, count]);
    dot += num * count;
    ans = (ans + dot) % mod;
  });
  return ans;
}

function maxWidthRamp(nums) {
  const stack = [];
  for (let i = 0; i < nums.length; i++) if (!stack.length || nums[i] < nums[stack.at(-1)]) stack.push(i);
  let ans = 0;
  for (let j = nums.length - 1; j >= 0; j--) {
    while (stack.length && nums[stack.at(-1)] <= nums[j]) ans = Math.max(ans, j - stack.pop());
  }
  return ans;
}

function buildSteps962(input) {
  const nums = parseNums(input, "nums");
  if (nums.length > 16) throw new Error("Use up to 16 numbers so the ramp stack stays readable.");
  const stack = [];
  const steps = [];
  let answer = 0;
  let phase = "build candidates";

  const stackText = () => `[${stack.map((index) => `${index}:${nums[index]}`).join(", ")}]`;
  const stackItems = () => stack.map((index) => ({ value: nums[index], detail: `index ${index}` }));
  const sub = () => nums.map((value, index) => `i=${index} · ${value}`);
  const snap = ({ title, line, note, current = -1, compare = -1, resolved = -1, final = false }) => {
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title,
      arr: [...nums],
      sub: sub(),
      highlight: [current, compare].filter((index) => index >= 0),
      mark: resolved >= 0 ? [resolved] : [...stack],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "phase", value: phase },
        { name: "answer", value: answer },
        { name: "stack", value: stackText() },
      ],
      note,
      final,
      stackView: {
        title: phase === "build candidates" ? "Candidate left indices with decreasing values" : "Scan right endpoints and resolve ramps",
        emptyLabel: "no candidate left index",
        items: stackItems(),
        input: [...nums],
        current,
        inputLabel: phase === "build candidates" ? "left endpoints" : "right endpoints",
        expected: current >= 0 ? nums[current] : "",
        status: [
          { label: "current", value: current >= 0 ? `${nums[current]} at ${current}` : "-" },
          { label: "stack top", value: top == null ? "empty" : `${nums[top]} at ${top}` },
          { label: "answer", value: answer },
          { label: "ramp check", value: top != null && current >= 0 ? `${nums[top]} <= ${nums[current]}` : "-" },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3-4: stack ứng viên, answer = 0", "Lines 3-4: candidate stack, answer = 0"),
    line: [3, 4],
    note: text("Chỉ index có value nhỏ hơn mọi value trước đó mới đáng làm left endpoint.", "Only indices with values smaller than all previous values are useful left endpoints."),
  });

  for (let i = 0; i < nums.length; i++) {
    const shouldPush = !stack.length || nums[i] < nums[stack.at(-1)];
    snap({
      title: text(`Dòng 5: xét left candidate i=${i}`, `Line 5: check left candidate i=${i}`),
      line: 5,
      current: i,
      note: text(
        shouldPush
          ? `${nums[i]} nhỏ hơn mọi candidate trước đó, push i=${i}.`
          : `${nums[i]} không nhỏ hơn candidate top, nên index này không giúp tạo ramp rộng hơn.`,
        shouldPush
          ? `${nums[i]} is smaller than every previous candidate, so push i=${i}.`
          : `${nums[i]} is not smaller than the candidate top, so this index cannot create a wider ramp.`,
      ),
    });
    if (shouldPush) stack.push(i);
    snap({
      title: text(shouldPush ? `Dòng 6: push ${i}` : "Dòng 6: không push", shouldPush ? `Line 6: push ${i}` : "Line 6: do not push"),
      line: shouldPush ? [6, 7] : 6,
      current: i,
      note: text(`Stack candidate hiện là ${stackText()}.`, `Candidate stack is now ${stackText()}.`),
    });
  }

  phase = "scan rights";
  snap({
    title: text("Dòng 8: bắt đầu quét j từ phải sang trái", "Line 8: scan j from right to left"),
    line: 8,
    note: text("Quét từ phải giúp ramp đầu tiên tìm được cho left candidate thường là rộng nhất.", "Scanning from the right lets a candidate left endpoint find its widest ramp first."),
  });

  for (let j = nums.length - 1; j >= 0; j--) {
    snap({
      title: text(`Dòng 8: j=${j}, nums[j]=${nums[j]}`, `Line 8: j=${j}, nums[j]=${nums[j]}`),
      line: 8,
      current: j,
      note: text("Nếu nums[left] <= nums[j], ta có ramp hợp lệ.", "If nums[left] <= nums[j], we have a valid ramp."),
    });
    while (stack.length && nums[stack.at(-1)] <= nums[j]) {
      const left = stack.at(-1);
      const width = j - left;
      answer = Math.max(answer, width);
      snap({
        title: text(`Dòng 9-10: ramp (${left}, ${j}) width=${width}`, `Lines 9-10: ramp (${left}, ${j}) width=${width}`),
        line: [9, 10],
        current: j,
        compare: left,
        resolved: left,
        note: text(`nums[${left}]=${nums[left]} <= nums[${j}]=${nums[j]}, cập nhật answer=${answer}.`, `nums[${left}]=${nums[left]} <= nums[${j}]=${nums[j]}, update answer=${answer}.`),
      });
      stack.pop();
      snap({
        title: text(`Dòng 11: pop left ${left}`, `Line 11: pop left ${left}`),
        line: 11,
        current: j,
        note: text("Vì đang quét j từ phải sang trái, left này đã thấy j xa nhất có thể; pop để khỏi xét lại.", "Because j scans right to left, this left endpoint has found its farthest possible j; pop it."),
      });
    }
  }

  snap({
    title: text(`Dòng 12: return ${answer}`, `Line 12: return ${answer}`),
    line: 12,
    final: true,
    note: text(`Maximum width ramp là ${answer}.`, `The maximum width ramp is ${answer}.`),
  });

  return { original: nums, answer, steps };
}

function bstPreorder(nums) {
  const stack = [];
  let lower = -Infinity;
  for (const value of nums) {
    if (value < lower) return "invalid preorder";
    while (stack.length && value > stack.at(-1)) lower = stack.pop();
    stack.push(value);
  }
  return "valid preorder";
}

function nextGreaterNodes(nums) {
  const ans = Array(nums.length).fill(0), stack = [];
  nums.forEach((value, i) => {
    while (stack.length && nums[stack.at(-1)] < value) ans[stack.pop()] = value;
    stack.push(i);
  });
  return ans;
}

function buildSteps1019(input) {
  const values = parseNums(input, "head");
  if (values.length > 14) throw new Error("Use up to 14 linked-list nodes so the stack trace stays readable.");
  const answer = Array(values.length).fill(0);
  const stack = [];
  const steps = [];

  const stackLabel = () => `[${stack.map((index) => `${index}:${values[index]}`).join(", ")}]`;
  const answerLabel = () => arrText(answer);
  const nodeSub = () => values.map((_, index) => `node ${index} · ans=${answer[index]}`);
  const stackItems = () => stack.map((index) => ({ value: values[index], detail: `node ${index}` }));
  const linkedListText = () => values.map((value, index) => `${index}:${value}`).join(" -> ");

  const snap = ({ title, line, note, current = -1, compare = null, resolved = null, final = false }) => {
    const highlight = new Set();
    if (Number.isInteger(current) && current >= 0) highlight.add(current);
    if (Number.isInteger(compare) && compare >= 0) highlight.add(compare);
    steps.push({
      title,
      arr: [...values],
      sub: nodeSub(),
      highlight: [...highlight],
      mark: Number.isInteger(resolved)
        ? [resolved]
        : final
          ? answer.map((value, index) => value > 0 ? index : -1).filter((index) => index >= 0)
          : [...stack],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "linked list", value: linkedListText() },
        { name: "stack", value: stackLabel() },
        { name: "answer", value: answerLabel() },
      ],
      note,
      final,
      stackView: {
        title: "Monotonic decreasing stack (nodes waiting for a greater value)",
        emptyLabel: "no node is waiting",
        items: stackItems(),
        input: [...values],
        current,
        inputLabel: "linked list values copied into an array",
        expected: current >= 0 ? values[current] : "",
        status: [
          { label: "current node", value: current >= 0 ? `${current}:${values[current]}` : "-" },
          { label: "stack top", value: stack.length ? `${stack.at(-1)}:${values[stack.at(-1)]}` : "empty" },
          { label: "answer", value: answerLabel() },
        ],
      },
    });
  };

  snap({
    title: text("Chuyển linked list thành array", "Copy linked list into an array"),
    line: [3, 4, 5, 6],
    note: text(
      "Linked list không truy cập index nhanh, nên ta copy value sang array để dùng stack theo index.",
      "A linked list has no fast index access, so copy node values into an array and store indices in the stack.",
    ),
  });

  snap({
    title: text("answer toàn 0, stack rỗng", "answer starts as all 0, stack is empty"),
    line: [7, 8],
    note: text(
      "0 nghĩa là node này chưa tìm thấy node lớn hơn ở bên phải.",
      "0 means this node has not found a greater node to its right yet.",
    ),
  });

  for (let i = 0; i < values.length; i++) {
    snap({
      title: text(`Đọc node ${i}: value = ${values[i]}`, `Read node ${i}: value = ${values[i]}`),
      line: 9,
      current: i,
      note: text(
        `Node hiện tại có thể là next greater cho các node nhỏ hơn đang nằm trên stack.`,
        `The current node may be the next greater value for smaller nodes waiting on the stack.`,
      ),
    });

    while (stack.length && values[stack.at(-1)] < values[i]) {
      const top = stack.at(-1);
      snap({
        title: text(`${values[top]} < ${values[i]} nên node ${top} được giải quyết`, `${values[top]} < ${values[i]}, so node ${top} is resolved`),
        line: 10,
        current: i,
        compare: top,
        note: text(
          `Vì node ${i} là node lớn hơn đầu tiên ta gặp sau node ${top}, đáp án của node ${top} chính là ${values[i]}.`,
          `Because node ${i} is the first greater node encountered after node ${top}, node ${top}'s answer is ${values[i]}.`,
        ),
      });
      const resolved = stack.pop();
      answer[resolved] = values[i];
      snap({
        title: text(`answer[${resolved}] = ${values[i]}`, `answer[${resolved}] = ${values[i]}`),
        line: 11,
        current: i,
        resolved,
        note: text(
          `Pop node ${resolved} khỏi stack vì nó đã có next greater.`,
          `Pop node ${resolved} from the stack because its next greater value is known.`,
        ),
      });
    }

    stack.push(i);
    snap({
      title: text(`Push node ${i} vào stack`, `Push node ${i} onto the stack`),
      line: 12,
      current: i,
      note: text(
        `Node ${i} chờ một node lớn hơn xuất hiện ở phía sau. Stack vẫn giảm dần theo value.`,
        `Node ${i} waits for a greater node later in the list. The stack remains decreasing by value.`,
      ),
    });
  }

  snap({
    title: text(`Return ${answerLabel()}`, `Return ${answerLabel()}`),
    line: 13,
    final: true,
    note: stack.length
      ? text(
          `Các node còn lại trong stack [${stack.join(", ")}] không có node lớn hơn ở bên phải nên giữ 0.`,
          `Nodes still in the stack [${stack.join(", ")}] have no greater node to the right, so they keep 0.`,
        )
      : text("Mọi node đều đã được giải quyết.", "Every node has been resolved."),
  });

  return { original: values, answer, steps };
}

function longestWPI(nums) {
  const prefix = [0];
  nums.forEach((h) => prefix.push(prefix.at(-1) + (h > 8 ? 1 : -1)));
  const stack = [];
  for (let i = 0; i < prefix.length; i++) if (!stack.length || prefix[i] < prefix[stack.at(-1)]) stack.push(i);
  let ans = 0;
  for (let j = prefix.length - 1; j >= 0; j--) while (stack.length && prefix[j] > prefix[stack.at(-1)]) ans = Math.max(ans, j - stack.pop());
  return ans;
}

function buildSteps1124(input) {
  const hours = parseNums(input, "hours");
  if (hours.length > 16) throw new Error("Use up to 16 days so the prefix stack stays readable.");
  const prefix = [0];
  const stack = [];
  const steps = [];
  let answer = 0;
  let phase = "prefix";

  const prefixText = () => arrText(prefix);
  const stackText = () => `[${stack.map((index) => `${index}:${prefix[index]}`).join(", ")}]`;
  const stackItems = () => stack.map((index) => ({ value: prefix[index], detail: `prefix index ${index}` }));
  const sub = () => hours.map((h, i) => `day=${i} · ${h}${h > 8 ? " tiring" : " ok"}`);
  const snap = ({ title, line, note, current = -1, compare = -1, resolved = -1, final = false }) => {
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title,
      arr: [...hours],
      sub: sub(),
      highlight: current > 0 ? [current - 1] : current >= 0 && current < hours.length ? [current] : [],
      mark: resolved >= 0 ? [Math.max(0, resolved - 1)] : [],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "phase", value: phase },
        { name: "prefix", value: prefixText() },
        { name: "stack", value: stackText() },
        { name: "answer", value: answer },
      ],
      note,
      final,
      stackView: {
        title: phase === "prefix" ? "Build score prefix (+1 tiring, -1 non-tiring)" : phase === "build stack" ? "Decreasing prefix minima stack" : "Resolve widest positive-score intervals",
        emptyLabel: "empty stack",
        items: stackItems(),
        input: phase === "prefix" ? [...hours] : [...prefix],
        current,
        inputLabel: phase === "prefix" ? "hours by day" : "prefix score indices",
        expected: phase === "prefix" ? (current > 0 ? hours[current - 1] : "") : (current >= 0 ? prefix[current] : ""),
        status: [
          { label: "current", value: phase === "prefix" ? (current > 0 ? `day ${current - 1}` : "-") : (current >= 0 ? `prefix ${current}:${prefix[current]}` : "-") },
          { label: "stack top", value: top == null ? "empty" : `${top}:${prefix[top]}` },
          { label: "answer", value: answer },
          { label: "check", value: top != null && current >= 0 && phase === "scan rights" ? `${prefix[current]} > ${prefix[top]}` : "-" },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3: prefix = [0]", "Line 3: prefix = [0]"),
    line: 3,
    note: text("Ngày mệt hours > 8 tính +1, ngày không mệt tính -1. Interval tốt khi prefix[j] > prefix[i].", "A tiring day hours > 8 counts +1, otherwise -1. An interval is well-performing when prefix[j] > prefix[i]."),
  });
  for (let i = 0; i < hours.length; i++) {
    const delta = hours[i] > 8 ? 1 : -1;
    prefix.push(prefix.at(-1) + delta);
    snap({
      title: text(`Dòng 4-5: day ${i}, delta=${delta}, prefix=${prefix.at(-1)}`, `Lines 4-5: day ${i}, delta=${delta}, prefix=${prefix.at(-1)}`),
      line: [4, 5],
      current: i + 1,
      note: text(`hours[${i}]=${hours[i]} ${hours[i] > 8 ? "mệt" : "không mệt"}, nên cộng ${delta}.`, `hours[${i}]=${hours[i]} is ${hours[i] > 8 ? "tiring" : "non-tiring"}, so add ${delta}.`),
    });
  }

  phase = "build stack";
  snap({
    title: text("Dòng 6: xây stack prefix giảm", "Line 6: build decreasing prefix stack"),
    line: 6,
    note: text("Chỉ prefix nhỏ kỷ lục mới đáng làm điểm bắt đầu i cho interval dài.", "Only record-low prefix values are useful start indices for long intervals."),
  });
  for (let i = 0; i < prefix.length; i++) {
    const shouldPush = !stack.length || prefix[i] < prefix[stack.at(-1)];
    if (shouldPush) stack.push(i);
    snap({
      title: text(shouldPush ? `Dòng 7-9: push prefix index ${i}` : `Dòng 7-8: không push index ${i}`, shouldPush ? `Lines 7-9: push prefix index ${i}` : `Lines 7-8: do not push index ${i}`),
      line: shouldPush ? [7, 8, 9] : [7, 8],
      current: i,
      note: text(
        shouldPush
          ? `prefix[${i}]=${prefix[i]} là mức thấp mới, có thể tạo interval tốt dài hơn về sau.`
          : `prefix[${i}]=${prefix[i]} không thấp hơn top, nên index sớm hơn/top tốt hơn cho độ dài.`,
        shouldPush
          ? `prefix[${i}]=${prefix[i]} is a new low and may make a longer interval later.`
          : `prefix[${i}]=${prefix[i]} is not lower than the top; an earlier/top index is better for width.`,
      ),
    });
  }

  phase = "scan rights";
  for (let j = prefix.length - 1; j >= 0; j--) {
    snap({
      title: text(`Dòng 11: j=${j}, prefix[j]=${prefix[j]}`, `Line 11: j=${j}, prefix[j]=${prefix[j]}`),
      line: 11,
      current: j,
      note: text("Nếu prefix[j] > prefix[i], đoạn days i..j-1 có nhiều ngày mệt hơn ngày không mệt.", "If prefix[j] > prefix[i], days i..j-1 have more tiring than non-tiring days."),
    });
    while (stack.length && prefix[j] > prefix[stack.at(-1)]) {
      const i = stack.at(-1);
      const width = j - i;
      answer = Math.max(answer, width);
      snap({
        title: text(`Dòng 12-13: interval (${i}, ${j}) dài ${width}`, `Lines 12-13: interval (${i}, ${j}) length ${width}`),
        line: [12, 13],
        current: j,
        compare: i,
        resolved: i,
        note: text(`prefix[${j}]=${prefix[j]} > prefix[${i}]=${prefix[i]}, cập nhật answer=${answer}.`, `prefix[${j}]=${prefix[j]} > prefix[${i}]=${prefix[i]}, update answer=${answer}.`),
      });
      stack.pop();
    }
  }

  snap({
    title: text(`Dòng 14: return ${answer}`, `Line 14: return ${answer}`),
    line: 14,
    final: true,
    note: text(`Longest well-performing interval có độ dài ${answer}.`, `The longest well-performing interval has length ${answer}.`),
  });

  return { original: hours, answer, steps };
}

function mctFromLeafValues(nums) {
  const stack = [Infinity];
  let cost = 0;
  nums.forEach((value) => {
    while (stack.at(-1) <= value) {
      const mid = stack.pop();
      cost += mid * Math.min(stack.at(-1), value);
    }
    stack.push(value);
  });
  while (stack.length > 2) cost += stack.pop() * stack.at(-1);
  return cost;
}

function countSubmatrices(input) {
  const mat = parseMatrix(input);
  const cols = mat[0].length;
  const heights = Array(cols).fill(0);
  let ans = 0;
  for (const row of mat) {
    for (let c = 0; c < cols; c++) heights[c] = row[c] ? heights[c] + 1 : 0;
    const stack = [];
    let rowSum = 0;
    for (let c = 0; c < cols; c++) {
      let count = 1;
      while (stack.length && stack.at(-1)[0] >= heights[c]) {
        const [h, span] = stack.pop();
        rowSum -= h * span;
        count += span;
      }
      stack.push([heights[c], count]);
      rowSum += heights[c] * count;
      ans += rowSum;
    }
  }
  return { original: mat.flat(), answer: ans, steps: genericSteps({ nums: mat.flat(), title: text("Đếm submatrix toàn 1", "Count all-ones submatrices"), answer: ans, note: text("Mỗi hàng biến thành histogram; stack tăng tính số rectangle kết thúc tại cột hiện tại.", "Each row becomes a histogram; an increasing stack counts rectangles ending at the current column.") }) };
}

function findLengthOfShortestSubarray(nums) {
  let right = nums.length - 1;
  while (right > 0 && nums[right - 1] <= nums[right]) right--;
  let ans = right;
  for (let left = 0; left < nums.length; left++) {
    if (left > 0 && nums[left - 1] > nums[left]) break;
    while (right < nums.length && nums[left] > nums[right]) right++;
    ans = Math.min(ans, right - left - 1);
  }
  return ans;
}

function mostCompetitive(nums, params = {}) {
  const k = Number(params.k ?? 2);
  const stack = [];
  nums.forEach((num, i) => {
    while (stack.length && stack.at(-1) > num && stack.length - 1 + nums.length - i >= k) stack.pop();
    if (stack.length < k) stack.push(num);
  });
  return stack;
}

function buildSteps1673(input, params = {}) {
  const nums = parseNums(input, "nums");
  const k = Number(params.k ?? 2);
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error("k must be an integer from 1 to nums.length.");
  if (nums.length > 14) throw new Error("Use up to 14 numbers so the competitive stack stays readable.");
  const stack = [];
  const steps = [];
  let drop = nums.length - k;

  const stackText = () => arrText(stack);
  const sub = () => nums.map((num, index) => `i=${index} · ${num}`);
  const stackItems = () => stack.map((value, index) => ({ value, detail: `stack[${index}]` }));
  const snap = ({ title, line, note, current = -1, removed = null, final = false }) => {
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title,
      arr: [...nums],
      sub: sub(),
      highlight: current >= 0 ? [current] : [],
      mark: [],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "k", value: k },
        { name: "drop", value: drop },
        { name: "stack", value: stackText() },
        ...(removed != null ? [{ name: "removed", value: removed }] : []),
      ],
      note,
      final,
      stackView: {
        title: "Monotonic increasing stack (most competitive subsequence)",
        emptyLabel: "empty stack",
        items: stackItems(),
        input: [...nums],
        current,
        inputLabel: "nums scanned left to right",
        expected: current >= 0 ? nums[current] : "",
        status: [
          { label: "current num", value: current >= 0 ? nums[current] : "-" },
          { label: "top", value: top ?? "empty" },
          { label: "drop budget", value: drop },
          { label: "stack", value: stackText() },
        ],
      },
    });
  };

  snap({
    title: text(`Dòng 3-4: drop = n-k = ${drop}`, `Lines 3-4: drop = n-k = ${drop}`),
    line: [3, 4],
    note: text(
      `Ta được bỏ ${drop} phần tử để subsequence còn đúng độ dài k=${k}.`,
      `We may remove ${drop} elements so the remaining subsequence has length k=${k}.`,
    ),
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    snap({
      title: text(`Dòng 5: xét nums[${i}] = ${num}`, `Line 5: read nums[${i}] = ${num}`),
      line: 5,
      current: i,
      note: text(
        "Nếu num nhỏ hơn đỉnh stack và vẫn còn quyền drop, đưa num lên sớm hơn sẽ tạo subsequence nhỏ hơn.",
        "If num is smaller than the stack top and we still have drop budget, placing num earlier makes the subsequence smaller.",
      ),
    });

    while (drop > 0 && stack.length && stack.at(-1) > num) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 6: drop>0 và ${top} > ${num}`, `Line 6: drop>0 and ${top} > ${num}`),
        line: 6,
        current: i,
        note: text(
          `Có thể bỏ ${top} để ${num} đứng trước, làm kết quả cạnh tranh hơn.`,
          `We can remove ${top} so ${num} appears earlier, making the result more competitive.`,
        ),
      });
      const removed = stack.pop();
      drop -= 1;
      snap({
        title: text(`Dòng 7: pop ${removed}, drop = ${drop}`, `Line 7: pop ${removed}, drop = ${drop}`),
        line: 7,
        current: i,
        removed,
        note: text(
          `Đã dùng một quyền drop. Stack hiện là ${stackText()}.`,
          `Spent one drop. The stack is now ${stackText()}.`,
        ),
      });
    }

    stack.push(num);
    snap({
      title: text(`Dòng 8: push ${num}`, `Line 8: push ${num}`),
      line: 8,
      current: i,
      note: text(
        "Giữ num trong stack. Nếu stack dài hơn k ở cuối, ta lấy k phần tử đầu.",
        "Keep num in the stack. If the stack is longer than k at the end, take the first k values.",
      ),
    });
  }

  const answer = stack.slice(0, k);
  snap({
    title: text(`Dòng 9: return ${arrText(answer)}`, `Line 9: return ${arrText(answer)}`),
    line: 11,
    final: true,
    note: text(
      `Lấy k=${k} phần tử đầu của stack để có subsequence cạnh tranh nhất.`,
      `Take the first k=${k} stack values to get the most competitive subsequence.`,
    ),
  });

  return { original: nums, answer, steps };
}

function maxSumMinProduct(nums) {
  const prefix = [0];
  nums.forEach((num) => prefix.push(prefix.at(-1) + num));
  const stack = [];
  let best = 0;
  for (let i = 0; i <= nums.length; i++) {
    const cur = i === nums.length ? 0 : nums[i];
    while (stack.length && nums[stack.at(-1)] > cur) {
      const mid = stack.pop();
      const left = stack.length ? stack.at(-1) + 1 : 0;
      best = Math.max(best, nums[mid] * (prefix[i] - prefix[left]));
    }
    stack.push(i);
  }
  return best;
}

function subArrayRanges(nums) {
  const sum = (sign) => {
    const stack = [];
    let ans = 0;
    for (let i = 0; i <= nums.length; i++) {
      const cur = i === nums.length ? sign * Infinity : nums[i];
      while (stack.length && (sign === 1 ? nums[stack.at(-1)] < cur : nums[stack.at(-1)] > cur)) {
        const mid = stack.pop();
        const left = stack.length ? stack.at(-1) : -1;
        ans += nums[mid] * (mid - left) * (i - mid);
      }
      stack.push(i);
    }
    return ans;
  };
  return sum(1) - sum(-1);
}

function totalSteps(nums) {
  const stack = [];
  let ans = 0;
  nums.forEach((num) => {
    let days = 0;
    while (stack.length && stack.at(-1)[0] <= num) days = Math.max(days, stack.pop()[1]);
    days = stack.length ? days + 1 : 0;
    ans = Math.max(ans, days);
    stack.push([num, days]);
  });
  return ans;
}

function removeNodes(nums) {
  const stack = [];
  nums.forEach((num) => {
    while (stack.length && stack.at(-1) < num) stack.pop();
    stack.push(num);
  });
  return stack;
}

function buildSteps2289(input) {
  const nums = parseNums(input, "nums");
  if (nums.length > 14) throw new Error("Use up to 14 numbers so the days stack stays readable.");
  const stack = [];
  const steps = [];
  let answer = 0;

  const stackText = () => `[${stack.map((item) => `${item.value}:${item.days}d`).join(", ")}]`;
  const stackItems = () => stack.map((item) => ({ value: item.value, detail: `${item.days} step(s)` }));
  const sub = () => nums.map((value, index) => `i=${index} · ${value}`);
  const snap = ({ title, line, note, current = -1, compareTop = null, popped = null, days = null, final = false }) => {
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title,
      arr: [...nums],
      sub: sub(),
      highlight: current >= 0 ? [current] : [],
      mark: final ? [] : stack.map((_, index) => index),
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "i", value: current >= 0 ? current : "-" },
        { name: "num", value: current >= 0 ? nums[current] : "-" },
        { name: "days", value: days ?? "-" },
        { name: "answer", value: answer },
        { name: "stack", value: stackText() },
        ...(popped ? [{ name: "popped", value: `${popped.value}:${popped.days}d` }] : []),
      ],
      note,
      final,
      stackView: {
        title: "Stack of survivors (value + removal step)",
        emptyLabel: "no previous survivor",
        items: stackItems(),
        input: [...nums],
        current,
        inputLabel: "scan left to right",
        expected: current >= 0 ? nums[current] : "",
        status: [
          { label: "current num", value: current >= 0 ? nums[current] : "-" },
          { label: "stack top", value: top ? `${top.value}, ${top.days} step(s)` : "empty" },
          { label: "while check", value: top && current >= 0 ? `${top.value} <= ${nums[current]}` : "-" },
          { label: "answer", value: answer },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3-4: stack rỗng, answer = 0", "Lines 3-4: empty stack, answer = 0"),
    line: [3, 4],
    note: text(
      "Mỗi phần tử trong stack là [value, days]: value này sẽ bị xóa sau bao nhiêu step, hoặc 0 nếu sống mãi tới lúc này.",
      "Each stack item is [value, days]: how many steps before this value is removed, or 0 if it survives so far.",
    ),
  });

  for (let i = 0; i < nums.length; i++) {
    let days = 0;
    snap({
      title: text(`Dòng 5-6: xét nums[${i}] = ${nums[i]}, days = 0`, `Lines 5-6: read nums[${i}] = ${nums[i]}, days = 0`),
      line: [5, 6],
      current: i,
      days,
      note: text(
        "days tạm thời là thời điểm nums[i] có thể bị xóa. Ta sẽ tăng nó dựa trên các phần tử nhỏ hơn hoặc bằng ở bên trái.",
        "days is the possible removal step for nums[i]. It will be updated from smaller-or-equal values on the left.",
      ),
    });

    while (stack.length && stack.at(-1).value <= nums[i]) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 7: ${top.value} <= ${nums[i]} nên pop`, `Line 7: ${top.value} <= ${nums[i]}, so pop`),
        line: 7,
        current: i,
        days,
        compareTop: top,
        note: text(
          `${nums[i]} lớn hơn hoặc bằng ${top.value}, nên ${top.value} không thể là phần tử bên trái làm ${nums[i]} bị xóa. Nhưng days của nó vẫn ảnh hưởng dây chuyền.`,
          `${nums[i]} is greater than or equal to ${top.value}, so ${top.value} cannot delete ${nums[i]}. Its days still affect the chain reaction.`,
        ),
      });
      const removed = stack.pop();
      days = Math.max(days, removed.days);
      snap({
        title: text(`Dòng 8: days = max(days, ${removed.days}) = ${days}`, `Line 8: days = max(days, ${removed.days}) = ${days}`),
        line: 8,
        current: i,
        days,
        popped: removed,
        note: text(
          "Nếu phần tử bị pop chỉ biến mất sau nhiều vòng, nums[i] cũng phải chờ ít nhất lâu như vậy trước khi so được với phần tử lớn hơn bên trái.",
          "If the popped value disappears only after several rounds, nums[i] must wait at least that long before comparing with the larger value to the left.",
        ),
      });
    }

    const topAfter = stack.at(-1);
    days = stack.length ? days + 1 : 0;
    snap({
      title: text(
        stack.length ? `Dòng 9: còn ${topAfter.value} > ${nums[i]}, days = ${days}` : "Dòng 9: stack rỗng, days = 0",
        stack.length ? `Line 9: ${topAfter.value} > ${nums[i]} remains, days = ${days}` : "Line 9: stack empty, days = 0",
      ),
      line: 9,
      current: i,
      days,
      note: text(
        stack.length
          ? `${nums[i]} sẽ bị ${topAfter.value} ở bên trái xóa sau ${days} step.`
          : `${nums[i]} không có phần tử lớn hơn còn sống ở bên trái, nên nó không bị xóa.`,
        stack.length
          ? `${nums[i]} will be removed by the surviving larger left value ${topAfter.value} after ${days} step(s).`
          : `${nums[i]} has no surviving larger value to its left, so it is not removed.`,
      ),
    });

    answer = Math.max(answer, days);
    snap({
      title: text(`Dòng 10: answer = max(answer, ${days}) = ${answer}`, `Line 10: answer = max(answer, ${days}) = ${answer}`),
      line: 10,
      current: i,
      days,
      note: text(
        "answer là số step lớn nhất cần chờ trong toàn bộ mảng.",
        "answer is the largest removal step needed anywhere in the array.",
      ),
    });

    stack.push({ value: nums[i], days });
    snap({
      title: text(`Dòng 11: push [${nums[i]}, ${days}]`, `Line 11: push [${nums[i]}, ${days}]`),
      line: 11,
      current: i,
      days,
      note: text(
        `Đưa nums[${i}] vào stack cùng thời điểm bị xóa của nó.`,
        `Push nums[${i}] together with its removal step.`,
      ),
    });
  }

  snap({
    title: text(`Dòng 12: return ${answer}`, `Line 12: return ${answer}`),
    line: 12,
    final: true,
    note: text(
      `Sau ${answer} step, không còn cặp kề nhau nào có nums[i-1] > nums[i].`,
      `After ${answer} step(s), no adjacent pair remains with nums[i-1] > nums[i].`,
    ),
  });

  return { original: nums, answer, steps };
}

function buildSteps2487(input) {
  const values = parseNums(input, "head");
  if (values.length > 14) throw new Error("Use up to 14 linked-list nodes so the removal stack stays readable.");
  const stack = [];
  const steps = [];

  const stackText = () => `[${stack.join(", ")}]`;
  const stackItems = () => stack.map((value, index) => ({ value, detail: `kept position ${index}` }));
  const sub = () => values.map((value, index) => `node ${index} · ${value}`);
  const snap = ({ title, line, note, current = -1, removedValue = null, final = false }) => {
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title,
      arr: [...values],
      sub: sub(),
      highlight: current >= 0 ? [current] : [],
      mark: [],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "current node", value: current >= 0 ? `${current}:${values[current]}` : "-" },
        { name: "stack kept nodes", value: stackText() },
        ...(removedValue != null ? [{ name: "removed", value: removedValue }] : []),
      ],
      note,
      final,
      stackView: {
        title: "Kept nodes stack (remove smaller nodes when a bigger right node appears)",
        emptyLabel: "no kept node yet",
        items: stackItems(),
        input: [...values],
        current,
        inputLabel: "linked-list values scanned left to right",
        expected: current >= 0 ? values[current] : "",
        status: [
          { label: "current value", value: current >= 0 ? values[current] : "-" },
          { label: "stack top", value: top ?? "empty" },
          { label: "remove check", value: top != null && current >= 0 ? `${top} < ${values[current]}` : "-" },
          { label: "kept so far", value: stackText() },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3-4: stack rỗng, curr = head", "Lines 3-4: empty stack, curr = head"),
    line: [3, 4],
    note: text(
      "Stack giữ các node sẽ còn lại nếu chỉ xét prefix hiện tại. Khi gặp node lớn hơn, các node nhỏ hơn bên trái phải bị xóa.",
      "The stack stores nodes that would remain after scanning the current prefix. When a larger node appears, smaller left nodes must be removed.",
    ),
  });

  for (let i = 0; i < values.length; i++) {
    snap({
      title: text(`Dòng 5: xét node ${i}, value = ${values[i]}`, `Line 5: read node ${i}, value = ${values[i]}`),
      line: 5,
      current: i,
      note: text(
        `Nếu stack có node nhỏ hơn ${values[i]} ở đỉnh, node đó có một node lớn hơn ở bên phải nên phải xóa.`,
        `If the stack top is smaller than ${values[i]}, that top has a greater node to its right and must be removed.`,
      ),
    });

    while (stack.length && stack.at(-1) < values[i]) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 6: ${top} < ${values[i]} nên xóa`, `Line 6: ${top} < ${values[i]}, so remove it`),
        line: 6,
        current: i,
        note: text(
          `Node value ${top} bị xóa vì node hiện tại ${values[i]} nằm bên phải và lớn hơn nó.`,
          `Node value ${top} is removed because the current node ${values[i]} is to its right and greater.`,
        ),
      });
      const removed = stack.pop();
      snap({
        title: text(`Dòng 7: pop ${removed}`, `Line 7: pop ${removed}`),
        line: 7,
        current: i,
        removedValue: removed,
        note: text(
          `Sau khi pop, tiếp tục kiểm tra đỉnh mới vì ${values[i]} cũng có thể xóa nhiều node liên tiếp.`,
          `After popping, keep checking the new top because ${values[i]} may remove several nodes in a row.`,
        ),
      });
    }

    const topAfter = stack.at(-1);
    snap({
      title: text(
        topAfter == null ? "Dòng 6: dừng while vì stack rỗng" : `Dòng 6: dừng while vì ${topAfter} >= ${values[i]}`,
        topAfter == null ? "Line 6: stop while because stack is empty" : `Line 6: stop while because ${topAfter} >= ${values[i]}`,
      ),
      line: 6,
      current: i,
      note: text(
        topAfter == null
          ? "Không còn node bên trái nào nhỏ hơn node hiện tại."
          : `Node ${topAfter} không bị xóa bởi ${values[i]} vì nó không nhỏ hơn node hiện tại.`,
        topAfter == null
          ? "No left node smaller than the current node remains."
          : `Node ${topAfter} is not removed by ${values[i]} because it is not smaller than the current node.`,
      ),
    });

    stack.push(values[i]);
    snap({
      title: text(`Dòng 8-9: push ${values[i]} rồi curr = curr.next`, `Lines 8-9: push ${values[i]}, then curr = curr.next`),
      line: [8, 9],
      current: i,
      note: text(
        `Giữ node ${values[i]} lại cho tới khi có node lớn hơn ở bên phải xuất hiện.`,
        `Keep node ${values[i]} unless a greater node appears to its right later.`,
      ),
    });
  }

  snap({
    title: text(`Dòng 10-16: nối lại list và return ${stackText()}`, `Lines 10-16: rebuild the list and return ${stackText()}`),
    line: [10, 11, 12, 13, 14, 15, 16],
    final: true,
    note: text(
      "Các value còn trong stack chính là linked list sau khi xóa node có node lớn hơn bên phải.",
      "Values left in the stack are the linked list after removing nodes that have a greater node to their right.",
    ),
  });

  return { original: values, answer: [...stack], steps };
}

function beautifulTowers(nums) {
  const n = nums.length;
  const calc = (arr) => {
    const res = Array(n).fill(0), stack = [];
    let sum = 0;
    for (let i = 0; i < n; i++) {
      let count = 1;
      while (stack.length && stack.at(-1)[0] > arr[i]) {
        const [h, c] = stack.pop();
        sum -= h * c;
        count += c;
      }
      stack.push([arr[i], count]);
      sum += arr[i] * count;
      res[i] = sum;
    }
    return res;
  };
  const left = calc(nums), right = calc([...nums].reverse()).reverse();
  return Math.max(...nums.map((height, i) => left[i] + right[i] - height));
}

function maxChunksII(nums) {
  const stack = [];
  nums.forEach((num) => {
    let mx = num;
    while (stack.length && stack.at(-1) > num) mx = Math.max(mx, stack.pop());
    stack.push(mx);
  });
  return stack.length;
}

function buildSteps768(input) {
  const nums = parseNums(input, "arr");
  if (nums.length > 16) throw new Error("Use up to 16 values so the chunk stack stays readable.");
  const stack = [];
  const steps = [];

  const stackText = () => arrText(stack);
  const stackItems = () => stack.map((value, index) => ({ value, detail: `chunk ${index + 1} max` }));
  const sub = () => nums.map((value, index) => `i=${index} · ${value}`);
  const snap = ({ title, line, note, current = -1, mx = null, removed = null, final = false }) => {
    steps.push({
      title,
      arr: [...nums],
      sub: sub(),
      highlight: current >= 0 ? [current] : [],
      mark: [],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "mx", value: mx ?? "-" },
        { name: "stack chunk maxes", value: stackText() },
        ...(removed != null ? [{ name: "merged popped max", value: removed }] : []),
      ],
      note,
      final,
      stackView: {
        title: "Chunk stack (each item is a chunk maximum)",
        emptyLabel: "no chunk yet",
        items: stackItems(),
        input: [...nums],
        current,
        inputLabel: "arr scanned left to right",
        expected: current >= 0 ? nums[current] : "",
        status: [
          { label: "current", value: current >= 0 ? nums[current] : "-" },
          { label: "top chunk max", value: stack.length ? stack.at(-1) : "empty" },
          { label: "chunks", value: stack.length },
          { label: "mx being merged", value: mx ?? "-" },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3: stack chunk rỗng", "Line 3: empty chunk stack"),
    line: 3,
    note: text("Với duplicate, mỗi stack item là max của một chunk đã dựng.", "With duplicates, each stack item is the maximum of one chunk built so far."),
  });

  for (let i = 0; i < nums.length; i++) {
    let mx = nums[i];
    snap({
      title: text(`Dòng 4-5: xét arr[${i}] = ${nums[i]}, mx=${mx}`, `Lines 4-5: read arr[${i}] = ${nums[i]}, mx=${mx}`),
      line: [4, 5],
      current: i,
      mx,
      note: text("Tạm xem giá trị hiện tại bắt đầu một chunk mới.", "Temporarily treat the current value as the start of a new chunk."),
    });
    while (stack.length && stack.at(-1) > nums[i]) {
      const removed = stack.pop();
      mx = Math.max(mx, removed);
      snap({
        title: text(`Dòng 6-7: pop chunk max ${removed}, mx=${mx}`, `Lines 6-7: pop chunk max ${removed}, mx=${mx}`),
        line: [6, 7],
        current: i,
        mx,
        removed,
        note: text(`Vì chunk trước có max ${removed} > ${nums[i]}, current không thể tách riêng; phải merge chunk lại.`, `Because the previous chunk max ${removed} > ${nums[i]}, current cannot be separated; merge the chunks.`),
      });
    }
    stack.push(mx);
    snap({
      title: text(`Dòng 8: push merged max ${mx}`, `Line 8: push merged max ${mx}`),
      line: 8,
      current: i,
      mx,
      note: text(`Stack hiện có ${stack.length} chunk, mỗi chunk đại diện bằng max của nó.`, `The stack now has ${stack.length} chunk(s), each represented by its maximum.`),
    });
  }

  snap({
    title: text(`Dòng 9: return ${stack.length}`, `Line 9: return ${stack.length}`),
    line: 9,
    final: true,
    note: text(`Số chunk tối đa là số item còn trong stack: ${stack.length}.`, `The maximum chunk count is the number of items left in the stack: ${stack.length}.`),
  });

  return { original: nums, answer: stack.length, steps };
}

function oddEvenJump(nums) {
  const n = nums.length;
  const next = (order) => {
    const ans = Array(n).fill(-1), stack = [];
    order.forEach((i) => {
      while (stack.length && i > stack.at(-1)) ans[stack.pop()] = i;
      stack.push(i);
    });
    return ans;
  };
  const oddNext = next([...Array(n).keys()].sort((a, b) => nums[a] - nums[b] || a - b));
  const evenNext = next([...Array(n).keys()].sort((a, b) => nums[b] - nums[a] || a - b));
  const odd = Array(n).fill(false), even = Array(n).fill(false);
  odd[n - 1] = even[n - 1] = true;
  for (let i = n - 2; i >= 0; i--) {
    if (oddNext[i] !== -1) odd[i] = even[oddNext[i]];
    if (evenNext[i] !== -1) even[i] = odd[evenNext[i]];
  }
  return odd.filter(Boolean).length;
}

function minIncrementsTarget(nums) {
  let ans = nums[0] || 0;
  for (let i = 1; i < nums.length; i++) if (nums[i] > nums[i - 1]) ans += nums[i] - nums[i - 1];
  return ans;
}

function carFleetII(input) {
  const cars = parsePairs(input, "cars");
  const ans = Array(cars.length).fill(-1), stack = [];
  for (let i = cars.length - 1; i >= 0; i--) {
    const [p, s] = cars[i];
    while (stack.length) {
      const j = stack.at(-1);
      const [p2, s2] = cars[j];
      const t = (p2 - p) / (s - s2);
      if (s <= s2 || (ans[j] > 0 && t >= ans[j])) stack.pop();
      else break;
    }
    if (stack.length) {
      const j = stack.at(-1);
      ans[i] = (cars[j][0] - p) / (s - cars[j][1]);
    }
    stack.push(i);
  }
  return ans.map((v) => v < 0 ? -1 : Number(v.toFixed(5)));
}

function maximumScore(nums, params = {}) {
  const k = Number(params.k ?? 3);
  let left = k, right = k, minVal = nums[k], ans = nums[k];
  while (left > 0 || right < nums.length - 1) {
    if (left === 0 || (right < nums.length - 1 && nums[right + 1] > nums[left - 1])) right++;
    else left--;
    minVal = Math.min(minVal, nums[left], nums[right]);
    ans = Math.max(ans, minVal * (right - left + 1));
  }
  return ans;
}

function canSeePersonsCount(nums) {
  const ans = Array(nums.length).fill(0), stack = [];
  for (let i = nums.length - 1; i >= 0; i--) {
    while (stack.length && nums[i] > stack.at(-1)) {
      ans[i]++;
      stack.pop();
    }
    if (stack.length) ans[i]++;
    stack.push(nums[i]);
  }
  return ans;
}

function validSubarraySize(nums, params = {}) {
  const threshold = Number(params.threshold ?? 6);
  const stack = [];
  for (let i = 0; i <= nums.length; i++) {
    const cur = i === nums.length ? 0 : nums[i];
    while (stack.length && nums[stack.at(-1)] > cur) {
      const mid = stack.pop();
      const left = stack.length ? stack.at(-1) : -1;
      const len = i - left - 1;
      if (nums[mid] > threshold / len) return len;
    }
    stack.push(i);
  }
  return -1;
}

function secondGreater(nums) {
  const first = [], second = [], ans = Array(nums.length).fill(-1);
  nums.forEach((num, i) => {
    while (second.length && nums[second.at(-1)] < num) ans[second.pop()] = num;
    const moved = [];
    while (first.length && nums[first.at(-1)] < num) moved.push(first.pop());
    while (moved.length) second.push(moved.pop());
    first.push(i);
  });
  return ans;
}

function maxSubsequenceNumber(nums, k) {
  const drop = nums.length - k, stack = [];
  let remain = drop;
  nums.forEach((num) => {
    while (remain && stack.length && stack.at(-1) < num) {
      stack.pop();
      remain--;
    }
    stack.push(num);
  });
  return stack.slice(0, k);
}

function createMaximumNumber(input, params = {}) {
  const nums1 = parseNums(input, "nums1");
  const nums2 = parseNums(params.nums2 ?? "9,1,2,5,8,3", "nums2");
  const k = Number(params.k ?? 5);
  const greater = (a, i, b, j) => {
    while (i < a.length && j < b.length && a[i] === b[j]) { i++; j++; }
    return j === b.length || (i < a.length && a[i] > b[j]);
  };
  const merge = (a, b) => {
    const out = [];
    let i = 0, j = 0;
    while (i < a.length || j < b.length) out.push(greater(a, i, b, j) ? a[i++] : b[j++]);
    return out;
  };
  let best = [];
  for (let i = Math.max(0, k - nums2.length); i <= Math.min(k, nums1.length); i++) {
    const candidate = merge(maxSubsequenceNumber(nums1, i), maxSubsequenceNumber(nums2, k - i));
    if (greater(candidate, 0, best, 0)) best = candidate;
  }
  return { original: nums1, answer: best, steps: genericSteps({ nums: nums1, title: text("Tạo số lớn nhất", "Create maximum number"), answer: best, note: text("Dùng monotonic stack để lấy subsequence lớn nhất từ từng mảng rồi merge tham lam.", "Use monotonic stacks to pick best subsequences from both arrays, then greedily merge.") }) };
}

function buildSteps321(input, params = {}) {
  const nums1 = parseNums(input, "nums1");
  const nums2 = parseNums(params.nums2 ?? "9,1,2,5,8,3", "nums2");
  const k = Number(params.k ?? 5);
  if (!Number.isInteger(k) || k < 1 || k > nums1.length + nums2.length) {
    throw new Error("k must be between 1 and nums1.length + nums2.length.");
  }
  if (nums1.length + nums2.length > 14) {
    throw new Error("Use up to 14 total digits so the visualization stays readable.");
  }

  const combined = [...nums1, ...nums2];
  const sourceSub = [
    ...nums1.map((_, index) => `nums1[${index}]`),
    ...nums2.map((_, index) => `nums2[${index}]`),
  ];
  const steps = [];
  let best = [];
  let activeStack = [];
  let stage = "";
  let currentCandidate = [];

  const labelSeq = (seq) => `[${seq.join(", ")}]`;
  const isGreater = (a, i, b, j) => {
    while (i < a.length && j < b.length && a[i] === b[j]) {
      i++;
      j++;
    }
    return j === b.length || (i < a.length && a[i] > b[j]);
  };
  const status = (extra = []) => [
    { label: "split", value: stage || "-" },
    { label: "stack", value: labelSeq(activeStack) },
    { label: "candidate", value: labelSeq(currentCandidate) },
    { label: "best", value: best.length ? labelSeq(best) : "[]" },
    ...extra,
  ];
  const addStep = ({ title, line, note, highlight = [], mark = [], stack = activeStack, extraStatus = [], final = false }) => {
    steps.push({
      title,
      arr: combined,
      sub: sourceSub,
      highlight,
      mark,
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "nums1", value: labelSeq(nums1) },
        { name: "nums2", value: labelSeq(nums2) },
        { name: "k", value: k },
        { name: "best", value: best.length ? labelSeq(best) : "[]" },
      ],
      note,
      final,
      stackView: {
        title: "Greedy monotonic stack / merge state",
        emptyLabel: "empty",
        input: combined,
        inputLabel: "nums1 followed by nums2",
        current: highlight.length ? highlight[0] : -1,
        expected: stack.length ? stack.at(-1) : "",
        items: stack.map((value, index) => ({ value, detail: `pos ${index}` })),
        status: status(extraStatus),
      },
    });
  };

  const pickMax = (nums, size, label, offset) => {
    const dropStart = nums.length - size;
    let drop = dropStart;
    const stack = [];
    activeStack = stack;
    addStep({
      title: text(`Chọn ${size} digit tốt nhất từ ${label}`, `Pick best ${size} digit(s) from ${label}`),
      line: [3, 4, 5],
      note: text(
        `Có thể bỏ tối đa ${dropStart} digit. Stack giữ subsequence lớn nhất theo thứ tự.`,
        `We may drop up to ${dropStart} digit(s). The stack keeps the lexicographically largest subsequence in order.`,
      ),
      extraStatus: [{ label: "drop left", value: drop }],
    });

    nums.forEach((digit, index) => {
      addStep({
        title: text(`${label}[${index}] = ${digit}`, `${label}[${index}] = ${digit}`),
        line: 6,
        highlight: [offset + index],
        stack,
        note: text(
          `Digit hiện tại có thể đẩy các digit nhỏ hơn phía trước ra khỏi stack nếu vẫn còn quyền bỏ.`,
          `The current digit can remove smaller previous digits if we still have drops left.`,
        ),
        extraStatus: [{ label: "drop left", value: drop }],
      });
      while (drop > 0 && stack.length && stack.at(-1) < digit) {
        const removed = stack.at(-1);
        addStep({
          title: text(`${removed} < ${digit} và còn drop`, `${removed} < ${digit} and drops remain`),
          line: 7,
          highlight: [offset + index],
          stack,
          note: text(
            `Pop ${removed}: bỏ digit nhỏ hơn bên trái giúp số tạo ra lớn hơn.`,
            `Pop ${removed}: removing the smaller left digit makes the final number larger.`,
          ),
          extraStatus: [{ label: "drop left", value: drop }],
        });
        stack.pop();
        drop--;
        addStep({
          title: text(`pop ${removed}, drop còn ${drop}`, `pop ${removed}, drop left ${drop}`),
          line: 8,
          highlight: [offset + index],
          stack,
          note: text(
            `Sau khi pop, thử tiếp với đỉnh stack mới.`,
            `After popping, compare the current digit with the new stack top.`,
          ),
          extraStatus: [{ label: "drop left", value: drop }],
        });
      }
      stack.push(digit);
      addStep({
        title: text(`Push ${digit}`, `Push ${digit}`),
        line: 9,
        highlight: [offset + index],
        stack,
        note: text(
          `Giữ ${digit} trong subsequence ứng viên của ${label}.`,
          `Keep ${digit} in ${label}'s candidate subsequence.`,
        ),
        extraStatus: [{ label: "drop left", value: drop }],
      });
    });

    const picked = stack.slice(0, size);
    activeStack = picked;
    addStep({
      title: text(`${label} chọn ${labelSeq(picked)}`, `${label} picks ${labelSeq(picked)}`),
      line: 10,
      stack: picked,
      note: text(
        `Nếu stack còn dài, chỉ lấy ${size} digit đầu vì subsequence cần đúng độ dài.`,
        `If the stack is longer, keep only the first ${size} digit(s) because the subsequence needs the exact length.`,
      ),
      extraStatus: [{ label: `${label} pick`, value: labelSeq(picked) }],
    });
    return picked;
  };

  const merge = (left, right) => {
    const result = [];
    let i = 0;
    let j = 0;
    currentCandidate = result;
    activeStack = [];
    addStep({
      title: text(`Merge ${labelSeq(left)} và ${labelSeq(right)}`, `Merge ${labelSeq(left)} and ${labelSeq(right)}`),
      line: [14, 15, 16],
      note: text(
        `Mỗi bước chọn suffix còn lại lớn hơn theo thứ tự từ điển.`,
        `At each step, choose the lexicographically larger remaining suffix.`,
      ),
      extraStatus: [{ label: "left", value: labelSeq(left) }, { label: "right", value: labelSeq(right) }],
    });
    while (i < left.length || j < right.length) {
      const takeLeft = isGreater(left, i, right, j);
      const digit = takeLeft ? left[i++] : right[j++];
      result.push(digit);
      activeStack = [...result];
      addStep({
        title: text(`Lấy ${digit} từ ${takeLeft ? "nums1-pick" : "nums2-pick"}`, `Take ${digit} from ${takeLeft ? "nums1-pick" : "nums2-pick"}`),
        line: takeLeft ? [17, 18, 19, 20] : [17, 21, 22, 23],
        stack: result,
        note: text(
          takeLeft
            ? `Suffix bên trái lớn hơn hoặc hòa nhưng tốt hơn, nên lấy digit bên trái.`
            : `Suffix bên phải lớn hơn, nên lấy digit bên phải.`,
          takeLeft
            ? `The left suffix is larger or wins the tie, so take from the left.`
            : `The right suffix is larger, so take from the right.`,
        ),
        extraStatus: [{ label: "merged", value: labelSeq(result) }],
      });
    }
    addStep({
      title: text(`Candidate = ${labelSeq(result)}`, `Candidate = ${labelSeq(result)}`),
      line: 24,
      stack: result,
      note: text(
        `Đây là số tốt nhất cho cách chia digit hiện tại.`,
        `This is the best number for the current split.`,
      ),
      extraStatus: [{ label: "candidate", value: labelSeq(result) }],
    });
    return result;
  };
  const pickQuiet = (nums, size) => {
    let drop = nums.length - size;
    const stack = [];
    nums.forEach((digit) => {
      while (drop > 0 && stack.length && stack.at(-1) < digit) {
        stack.pop();
        drop--;
      }
      stack.push(digit);
    });
    return stack.slice(0, size);
  };
  const mergeQuiet = (left, right) => {
    const result = [];
    let i = 0;
    let j = 0;
    while (i < left.length || j < right.length) {
      result.push(isGreater(left, i, right, j) ? left[i++] : right[j++]);
    }
    return result;
  };

  const minTake1 = Math.max(0, k - nums2.length);
  const maxTake1 = Math.min(k, nums1.length);
  addStep({
    title: text("Thử mọi cách chia k digit", "Try every split of k digits"),
    line: [25, 26],
    note: text(
      `Lấy i digit từ nums1 và ${k}-i digit từ nums2, với i từ ${minTake1} đến ${maxTake1}.`,
      `Take i digits from nums1 and ${k}-i digits from nums2, with i from ${minTake1} to ${maxTake1}.`,
    ),
  });

  const splitResults = [];
  for (let take1 = minTake1; take1 <= maxTake1; take1++) {
    const take2 = k - take1;
    const leftPick = pickQuiet(nums1, take1);
    const rightPick = pickQuiet(nums2, take2);
    const candidate = mergeQuiet(leftPick, rightPick);
    const improves = isGreater(candidate, 0, best, 0);
    if (improves) best = candidate;
    splitResults.push({ take1, take2, leftPick, rightPick, candidate, improves });
    currentCandidate = candidate;
    activeStack = candidate;
    stage = `nums1:${take1}, nums2:${take2}`;
    addStep({
      title: text(
        `Split ${take1}+${take2}: candidate ${labelSeq(candidate)}`,
        `Split ${take1}+${take2}: candidate ${labelSeq(candidate)}`,
      ),
      line: [26, 27, 28],
      stack: candidate,
      note: text(
        improves
          ? `Candidate này tốt hơn best hiện tại, nên tạm giữ làm best.`
          : `Candidate này không vượt qua best hiện tại.`,
        improves
          ? `This candidate beats the current best, so keep it as best for now.`
          : `This candidate does not beat the current best.`,
      ),
      extraStatus: [
        { label: "nums1 pick", value: labelSeq(leftPick) },
        { label: "nums2 pick", value: labelSeq(rightPick) },
        { label: "candidate", value: labelSeq(candidate) },
      ],
    });
  }

  const winning = splitResults.find((item) => item.candidate.length === best.length && item.candidate.every((digit, index) => digit === best[index])) || splitResults.at(-1);
  stage = `nums1:${winning.take1}, nums2:${winning.take2}`;
  currentCandidate = [];
  activeStack = [];
  addStep({
    title: text("Bung chi tiết split thắng", "Zoom into the winning split"),
    line: 26,
    note: text(
      `Split thắng là lấy ${winning.take1} digit từ nums1 và ${winning.take2} digit từ nums2.`,
      `The winning split takes ${winning.take1} digit(s) from nums1 and ${winning.take2} digit(s) from nums2.`,
    ),
    extraStatus: [{ label: "winning split", value: stage }],
  });
  const leftPick = pickMax(nums1, winning.take1, "nums1", 0);
  const rightPick = pickMax(nums2, winning.take2, "nums2", nums1.length);
  const candidate = merge(leftPick, rightPick);
  currentCandidate = candidate;
  activeStack = candidate;
  addStep({
    title: text(`${labelSeq(candidate)} là best cuối cùng`, `${labelSeq(candidate)} is the final best`),
    line: [27, 28],
    stack: candidate,
    note: text(
      `Candidate của split thắng khớp best sau khi so tất cả split.`,
      `The winning split's candidate matches the best after comparing every split.`,
    ),
    extraStatus: [{ label: "candidate", value: labelSeq(candidate) }],
  });

  currentCandidate = best;
  activeStack = best;
  addStep({
    title: text(`Return ${labelSeq(best)}`, `Return ${labelSeq(best)}`),
    line: 28,
    stack: best,
    final: true,
    note: text(
      `Sau khi thử mọi split hợp lệ, best là số lớn nhất độ dài ${k}.`,
      `After all valid splits, best is the largest number of length ${k}.`,
    ),
    extraStatus: [{ label: "answer", value: labelSeq(best) }],
  });

  return { original: { nums1, nums2, k }, answer: best, steps };
}

function smallestSubsequenceWithLetter(input, params = {}) {
  const s = String(input ?? "leet");
  const k = Number(params.k ?? 3);
  const letter = String(params.letter ?? "e")[0] || "e";
  const repetition = Number(params.repetition ?? 1);
  let remainLetter = [...s].filter((ch) => ch === letter).length;
  let needLetter = repetition;
  const stack = [];
  [...s].forEach((ch, i) => {
    while (stack.length && stack.at(-1) > ch && stack.length - 1 + s.length - i >= k && (stack.at(-1) !== letter || remainLetter > needLetter)) {
      if (stack.pop() === letter) needLetter++;
    }
    if (stack.length < k) {
      if (ch === letter) {
        stack.push(ch);
        needLetter--;
      } else if (k - stack.length > needLetter) stack.push(ch);
    }
    if (ch === letter) remainLetter--;
  });
  return stack.join("");
}

function buildSteps2030(input, params = {}) {
  const s = String(input ?? "leet");
  const k = Number(params.k ?? 3);
  const letter = String(params.letter ?? "e")[0] || "e";
  const repetition = Number(params.repetition ?? 1);
  if (!s || s.length > 18) throw new Error("Use a non-empty string up to 18 characters for the visualization.");
  if (!Number.isInteger(k) || k < 1 || k > s.length) throw new Error("k must be an integer from 1 to len(s).");
  const totalLetter = [...s].filter((ch) => ch === letter).length;
  if (!Number.isInteger(repetition) || repetition < 0 || repetition > k || repetition > totalLetter) {
    throw new Error("repetition must be between 0 and k, and no more than the number of letter occurrences.");
  }

  const chars = [...s];
  const stack = [];
  const steps = [];
  let remainLetter = totalLetter;
  let needLetter = repetition;

  const stackText = () => stack.join("") || "empty";
  const sub = () => chars.map((ch, index) => `${ch} @ ${index}${ch === letter ? " · letter" : ""}`);
  const stackItems = () => stack.map((ch, index) => ({ value: ch, detail: `stack[${index}]${ch === letter ? ", required" : ""}` }));
  const snap = ({ title, line, note, current = -1, removed = "", final = false }) => {
    const top = stack.length ? stack.at(-1) : "";
    steps.push({
      title,
      arr: chars.map((ch) => ch.charCodeAt(0)),
      sub: sub(),
      highlight: current >= 0 ? [current] : [],
      mark: [],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "k", value: k },
        { name: "letter", value: letter },
        { name: "needLetter", value: needLetter },
        { name: "remainLetter", value: remainLetter },
        { name: "stack", value: stackText() },
        ...(removed ? [{ name: "removed", value: removed }] : []),
      ],
      note,
      final,
      stackView: {
        title: "Constrained monotonic stack (length k + required letter count)",
        emptyLabel: "empty stack",
        items: stackItems(),
        input: chars,
        current,
        inputLabel: "s scanned left to right",
        expected: current >= 0 ? chars[current] : "",
        status: [
          { label: "current char", value: current >= 0 ? `${chars[current]} @ ${current}` : "-" },
          { label: "top", value: top || "empty" },
          { label: "slots left", value: k - stack.length },
          { label: "need / remain", value: `${needLetter} / ${remainLetter}` },
        ],
      },
    });
  };

  snap({
    title: text("Dòng 3-5: đếm letter và khởi tạo stack", "Lines 3-5: count letters and initialize stack"),
    line: [3, 4, 5],
    note: text(
      `Cần kết quả dài k=${k} và chứa '${letter}' ít nhất ${repetition} lần. Ban đầu còn ${remainLetter} ký tự '${letter}' phía trước.`,
      `Need a result of length k=${k} containing '${letter}' at least ${repetition} times. Initially ${remainLetter} '${letter}' characters remain ahead.`,
    ),
  });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    snap({
      title: text(`Dòng 6: i=${i}, ch='${ch}'`, `Line 6: i=${i}, ch='${ch}'`),
      line: 6,
      current: i,
      note: text(
        "Vẫn dùng stack tăng để nhỏ theo từ điển, nhưng mỗi pop/push phải đảm bảo đủ độ dài k và đủ số letter.",
        "Still use an increasing stack for lexicographic order, but every pop/push must preserve length k and required letters.",
      ),
    });

    while (
      stack.length &&
      stack.at(-1) > ch &&
      stack.length - 1 + chars.length - i >= k &&
      (stack.at(-1) !== letter || remainLetter > needLetter)
    ) {
      const top = stack.at(-1);
      snap({
        title: text(`Dòng 7: có thể pop '${top}' trước '${ch}'`, `Line 7: can pop '${top}' before '${ch}'`),
        line: 7,
        current: i,
        note: text(
          `Pop hợp lệ vì '${top}' > '${ch}', vẫn còn đủ ký tự để đạt length k, và nếu top là '${letter}' thì vẫn còn đủ '${letter}' phía sau.`,
          `The pop is valid because '${top}' > '${ch}', enough characters remain to reach length k, and if top is '${letter}', enough '${letter}' remain later.`,
        ),
      });
      const removed = stack.pop();
      if (removed === letter) needLetter += 1;
      snap({
        title: text(`Dòng 8-9: pop '${removed}'${removed === letter ? ", needLetter tăng" : ""}`, `Lines 8-9: pop '${removed}'${removed === letter ? ", needLetter increases" : ""}`),
        line: [8, 9],
        current: i,
        removed,
        note: text(
          removed === letter
            ? `Vừa pop một '${letter}', nên vẫn cần thêm ${needLetter} ký tự '${letter}' trong phần còn lại.`
            : `Pop '${removed}' để '${ch}' có cơ hội đứng sớm hơn.`,
          removed === letter
            ? `Popped one '${letter}', so the remaining result still needs ${needLetter} '${letter}' character(s).`
            : `Pop '${removed}' so '${ch}' can appear earlier.`,
        ),
      });
    }

    if (stack.length < k) {
      snap({
        title: text(`Dòng 10: stack còn chỗ (${stack.length}/${k})`, `Line 10: stack still has room (${stack.length}/${k})`),
        line: 10,
        current: i,
        note: text(
          "Chỉ khi stack chưa đủ k ký tự ta mới cân nhắc push ch hiện tại.",
          "Only when the stack has fewer than k characters do we consider pushing the current character.",
        ),
      });
      if (ch === letter) {
        stack.push(ch);
        needLetter -= 1;
        snap({
          title: text(`Dòng 11-13: push required letter '${ch}'`, `Lines 11-13: push required letter '${ch}'`),
          line: [11, 12, 13],
          current: i,
          note: text(
            `Push '${letter}' và giảm needLetter còn ${needLetter}.`,
            `Push '${letter}' and decrease needLetter to ${needLetter}.`,
          ),
        });
      } else if (k - stack.length > needLetter) {
        stack.push(ch);
        snap({
          title: text(`Dòng 14-15: push '${ch}' vì còn dư slot`, `Lines 14-15: push '${ch}' because there is a spare slot`),
          line: [14, 15],
          current: i,
          note: text(
            `Sau khi push '${ch}', vẫn còn ${k - stack.length} slot cho ${needLetter} ký tự '${letter}' bắt buộc.`,
            `After pushing '${ch}', ${k - stack.length} slot(s) remain for ${needLetter} required '${letter}' character(s).`,
          ),
        });
      } else {
        snap({
          title: text(`Dòng 14: skip '${ch}' để giữ slot cho '${letter}'`, `Line 14: skip '${ch}' to reserve slots for '${letter}'`),
          line: 14,
          current: i,
          note: text(
            `Không push '${ch}' vì mọi slot còn lại phải dành cho ${needLetter} ký tự '${letter}' bắt buộc.`,
            `Do not push '${ch}' because every remaining slot must be reserved for ${needLetter} required '${letter}' character(s).`,
          ),
        });
      }
    } else {
      snap({
        title: text("Dòng 10: stack đã đủ k, không push", "Line 10: stack already has k characters, do not push"),
        line: 10,
        current: i,
        note: text(
          "Stack đã đủ độ dài k, nên chỉ dùng các ký tự sau để xét pop nếu có lợi và hợp lệ.",
          "The stack already has length k, so later characters can only trigger valid pops.",
        ),
      });
    }

    if (ch === letter) {
      remainLetter -= 1;
      snap({
        title: text(`Dòng 16-17: đã đi qua một '${letter}', remainLetter = ${remainLetter}`, `Lines 16-17: passed one '${letter}', remainLetter = ${remainLetter}`),
        line: [16, 17],
        current: i,
        note: text(
          `Giảm số '${letter}' còn lại phía sau current index.`,
          `Decrease the number of '${letter}' characters remaining after the current index.`,
        ),
      });
    }
  }

  const answer = stack.join("");
  snap({
    title: text(`Dòng 18: return '${answer}'`, `Line 18: return '${answer}'`),
    line: 18,
    final: true,
    note: text(
      `Kết quả dài ${answer.length}, nhỏ nhất theo từ điển và chứa '${letter}' đủ yêu cầu.`,
      `The result has length ${answer.length}, is lexicographically smallest, and satisfies the '${letter}' requirement.`,
    ),
  });

  return { original: s, answer, steps };
}

function totalStrength(nums) {
  let ans = 0;
  for (let i = 0; i < nums.length; i++) {
    let mn = Infinity, sum = 0;
    for (let j = i; j < nums.length; j++) {
      mn = Math.min(mn, nums[j]);
      sum += nums[j];
      ans += mn * sum;
    }
  }
  return ans;
}

function minimumVisitedCells(input) {
  const grid = parseMatrix(input);
  const rows = grid.length, cols = grid[0].length;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const queue = [[0, 0]];
  dist[0][0] = 1;
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    const jump = grid[r][c];
    for (let nc = c + 1; nc <= Math.min(cols - 1, c + jump); nc++) {
      if (dist[r][nc] === Infinity) {
        dist[r][nc] = dist[r][c] + 1;
        queue.push([r, nc]);
      }
    }
    for (let nr = r + 1; nr <= Math.min(rows - 1, r + jump); nr++) {
      if (dist[nr][c] === Infinity) {
        dist[nr][c] = dist[r][c] + 1;
        queue.push([nr, c]);
      }
    }
  }
  const answer = dist[rows - 1][cols - 1];
  return { original: grid.flat(), answer: answer === Infinity ? -1 : answer, steps: genericSteps({ nums: grid.flat(), title: text("Minimum visited cells", "Minimum visited cells"), answer: answer === Infinity ? -1 : answer, note: text("Với input nhỏ, BFS thử các bước nhảy sang phải/xuống; bản tối ưu dùng cấu trúc đơn điệu để bỏ ô đã xử lý.", "For small input, BFS tries right/down jumps; the optimized version uses monotonic structures to skip processed cells.") }) };
}

function maximumSumQueries(input, params = {}) {
  const nums1 = parseNums(input, "nums1");
  const nums2 = parseNums(params.nums2 ?? "2,3,4,5", "nums2");
  const queries = parsePairs(params.queries ?? "4,1;1,3;2,5", "queries");
  const answer = queries.map(([x, y]) => {
    let best = -1;
    for (let i = 0; i < nums1.length; i++) if (nums1[i] >= x && nums2[i] >= y) best = Math.max(best, nums1[i] + nums2[i]);
    return best;
  });
  return { original: nums1, answer, steps: genericSteps({ nums: nums1, title: text("Maximum sum queries", "Maximum sum queries"), answer, note: text("Bản tối ưu sort query và dùng stack đơn điệu trên các điểm Pareto.", "The optimized solution sorts queries and maintains a monotonic stack of Pareto-best points.") }) };
}

function primeScore(num) {
  let x = num, count = 0;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      count++;
      while (x % p === 0) x /= p;
    }
  }
  if (x > 1) count++;
  return count;
}

function maximumScoreAfterOperations(nums, params = {}) {
  let k = Number(params.k ?? 2);
  const scores = nums.map(primeScore);
  const left = Array(nums.length).fill(-1), right = Array(nums.length).fill(nums.length), stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && scores[stack.at(-1)] < scores[i]) right[stack.pop()] = i;
    left[i] = stack.length ? stack.at(-1) : -1;
    stack.push(i);
  }
  const order = [...Array(nums.length).keys()].sort((a, b) => nums[b] - nums[a]);
  let ans = 1;
  for (const i of order) {
    const count = (i - left[i]) * (right[i] - i);
    const take = Math.min(k, count);
    ans *= nums[i] ** take;
    k -= take;
    if (k === 0) break;
  }
  return ans;
}

function leftmostBuildingQueries(input, params = {}) {
  const heights = parseNums(input, "heights");
  const queries = parsePairs(params.queries ?? "0,1;0,2;2,4", "queries");
  const answer = queries.map(([a, b]) => {
    if (a > b) [a, b] = [b, a];
    if (a === b || heights[a] < heights[b]) return b;
    for (let i = b + 1; i < heights.length; i++) if (heights[i] > heights[a]) return i;
    return -1;
  });
  return { original: heights, answer, steps: genericSteps({ nums: heights, title: text("Leftmost meeting buildings", "Leftmost meeting buildings"), answer, note: text("Bản tối ưu xử lý query offline bằng stack giảm dần các tòa nhà ứng viên.", "The optimized solution processes queries offline with a decreasing stack of candidate buildings.") }) };
}

function maxNonDecreasingLength(nums) {
  const n = nums.length;
  const prefix = [0];
  nums.forEach((num) => prefix.push(prefix.at(-1) + num));
  const dp = Array.from({ length: n + 1 }, () => new Map());
  dp[0].set(0, 0);
  for (let end = 1; end <= n; end++) {
    for (let start = 0; start < end; start++) {
      const sum = prefix[end] - prefix[start];
      for (const [last, count] of dp[start]) {
        if (sum >= Number(last)) dp[end].set(sum, Math.max(dp[end].get(sum) || 0, count + 1));
      }
    }
  }
  return Math.max(...dp[n].values());
}

function oceanView(nums) {
  const ans = [];
  let tallest = -Infinity;
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] > tallest) ans.push(i);
    tallest = Math.max(tallest, nums[i]);
  }
  return ans.reverse();
}

function maximumOfMinimums(nums) {
  const n = nums.length, ans = Array(n).fill(0), left = Array(n).fill(-1), right = Array(n).fill(n), stack = [];
  for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack.at(-1)] >= nums[i]) right[stack.pop()] = i;
    left[i] = stack.length ? stack.at(-1) : -1;
    stack.push(i);
  }
  for (let i = 0; i < n; i++) ans[right[i] - left[i] - 2] = Math.max(ans[right[i] - left[i] - 2], nums[i]);
  for (let i = n - 2; i >= 0; i--) ans[i] = Math.max(ans[i], ans[i + 1]);
  return ans;
}

function visiblePeopleGrid(input) {
  const grid = parseMatrix(input);
  const rows = grid.length, cols = grid[0].length;
  const ans = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    const stack = [];
    for (let c = cols - 1; c >= 0; c--) {
      while (stack.length && grid[r][c] > stack.at(-1)) { ans[r][c]++; stack.pop(); }
      if (stack.length) ans[r][c]++;
      stack.push(grid[r][c]);
    }
  }
  for (let c = 0; c < cols; c++) {
    const stack = [];
    for (let r = rows - 1; r >= 0; r--) {
      while (stack.length && grid[r][c] > stack.at(-1)) { ans[r][c]++; stack.pop(); }
      if (stack.length) ans[r][c]++;
      stack.push(grid[r][c]);
    }
  }
  return { original: grid.flat(), answer: ans.flat(), steps: genericSteps({ nums: grid.flat(), title: text("Visible people grid", "Visible people grid"), answer: ans.flat(), note: text("Áp dụng logic visible people bằng stack cho từng hàng và từng cột.", "Apply visible-people stack logic to every row and column.") }) };
}

function jumpGameVIII(nums) {
  return nums.length <= 1 ? 0 : "optimized monotonic graph DP";
}

function visibleMountains(input) {
  const peaks = parsePairs(input, "peaks");
  let count = 0;
  peaks.forEach(([x, y], i) => {
    const covered = peaks.some(([a, b], j) => j !== i && Math.abs(x - a) + y <= b);
    if (!covered) count++;
  });
  return { original: peaks.flat(), answer: count, steps: genericSteps({ nums: peaks.map((p) => p[1]), title: text("Visible mountains", "Visible mountains"), answer: count, note: text("Biến mỗi núi thành interval [x-y, x+y]; stack/sort loại interval bị che.", "Convert each mountain to [x-y, x+y]; sorting plus stack removes covered intervals.") }) };
}

function maximumLengthSemiDecreasing(nums) {
  const stack = [];
  for (let i = 0; i < nums.length; i++) if (!stack.length || nums[i] > nums[stack.at(-1)]) stack.push(i);
  let ans = 0;
  for (let j = nums.length - 1; j >= 0; j--) while (stack.length && nums[stack.at(-1)] > nums[j]) ans = Math.max(ans, j - stack.pop() + 1);
  return ans;
}

function maximalRangeMaximum(nums) {
  const n = nums.length, ans = Array(n).fill(0), stack = [];
  for (let i = 0; i <= n; i++) {
    const cur = i === n ? Infinity : nums[i];
    while (stack.length && nums[stack.at(-1)] < cur) {
      const mid = stack.pop();
      const left = stack.length ? stack.at(-1) : -1;
      ans[mid] = i - left - 1;
    }
    stack.push(i);
  }
  return ans;
}

function validSubarrays(nums) {
  const stack = [];
  let ans = 0;
  for (const num of nums) {
    while (stack.length && stack.at(-1) > num) stack.pop();
    stack.push(num);
    ans += stack.length;
  }
  return ans;
}

function maximumBooks(nums) {
  let best = 0;
  for (let r = 0; r < nums.length; r++) {
    let take = nums[r], sum = 0;
    for (let l = r; l >= 0 && take > 0; l--) {
      take = Math.min(take, nums[l]);
      sum += take;
      take--;
    }
    best = Math.max(best, sum);
  }
  return best;
}

function buildSteps3113(input) {
  const nums = parseNums(input, "nums");
  if (nums.length > 18) throw new Error("Use up to 18 numbers so the stack trace stays readable.");
  const steps = [];
  const stack = [];
  let ans = 0;
  const codeLines = {
    init: [3, 4],
    loop: [5],
    pop: [6, 7],
    pushNew: [8, 9],
    mergeEqual: [10, 11],
    add: [12],
    done: [13],
  };
  const sub = nums.map((value, index) => `i=${index} · ${value}`);
  const stackItems = () => stack.map((entry) => ({ value: entry.value, detail: `count=${entry.count}` }));
  const stackText = () => `[${stack.map((entry) => `${entry.value}×${entry.count}`).join(", ")}]`;

  function snap(o) {
    const top = stack.length ? stack.at(-1) : null;
    steps.push({
      title: o.title,
      arr: [...nums],
      sub,
      highlight: Number.isInteger(o.index) ? [o.index] : [],
      mark: stack.flatMap((entry) => entry.indices || []),
      codeLines: o.codeLines || [],
      vars: [
        { name: "i", value: Number.isInteger(o.index) ? o.index : "-" },
        { name: "x", value: Number.isInteger(o.index) ? nums[o.index] : "-" },
        { name: "stack", value: stackText() },
        { name: "top", value: top ? `${top.value}×${top.count}` : "empty" },
        { name: "ans", value: ans },
        ...(o.vars || []),
      ],
      note: o.note,
      final: o.final || false,
      stackView: {
        title: "Monotonic decreasing stack: value × equal-count",
        emptyLabel: "stack empty",
        items: stackItems(),
        input: [...nums],
        current: Number.isInteger(o.index) ? o.index : -1,
        inputLabel: "nums",
        expected: Number.isInteger(o.index) ? nums[o.index] : "",
        status: [
          { label: "answer", value: ans },
          { label: "top", value: top ? `${top.value}×${top.count}` : "empty" },
          { label: "meaning", value: "same boundary maximums still alive" },
        ],
      },
    });
  }

  snap({
    title: text("Dòng 3-4: stack rỗng, ans = 0", "Lines 3-4: empty stack, ans = 0"),
    codeLines: codeLines.init,
    note: text(
      "Stack giảm dần theo value. Mỗi entry value×count nghĩa là có count điểm bắt đầu cùng value còn có thể ghép với value hiện tại.",
      "The stack is decreasing by value. Each value×count entry means count equal-value starts can still pair with the current value.",
    ),
  });

  nums.forEach((x, i) => {
    snap({
      title: text(`Dòng 5: xét nums[${i}] = ${x}`, `Line 5: inspect nums[${i}] = ${x}`),
      index: i,
      codeLines: codeLines.loop,
      note: text(
        "Ta muốn x làm boundary maximum bên phải. Mọi value nhỏ hơn x trên stack bị x chặn, không thể ghép qua x nữa.",
        "We want x to be the right boundary maximum. Any smaller value on top is blocked by x and cannot pair across it.",
      ),
    });

    while (stack.length && stack.at(-1).value < x) {
      const removed = stack.pop();
      snap({
        title: text(`Dòng 6-7: pop ${removed.value} vì ${removed.value} < ${x}`, `Lines 6-7: pop ${removed.value} because ${removed.value} < ${x}`),
        index: i,
        codeLines: codeLines.pop,
        vars: [{ name: "removed", value: `${removed.value}×${removed.count}` }],
        note: text(
          `${x} lớn hơn ${removed.value}, nên subarray đi qua ${x} sẽ có maximum là ${x}; ${removed.value} không còn làm boundary maximum được.`,
          `${x} is larger than ${removed.value}, so a subarray crossing ${x} has maximum ${x}; ${removed.value} can no longer be the boundary maximum.`,
        ),
      });
    }

    if (!stack.length || stack.at(-1).value > x) {
      stack.push({ value: x, count: 1, indices: [i] });
      snap({
        title: text(`Dòng 8-9: push nhóm mới ${x}×1`, `Lines 8-9: push new group ${x}×1`),
        index: i,
        codeLines: codeLines.pushNew,
        vars: [{ name: "new valid subarray", value: `[${i},${i}]` }],
        note: text(
          `Không có top bằng ${x}. Chỉ subarray một phần tử [${i},${i}] chắc chắn hợp lệ.`,
          `There is no top equal to ${x}. Only the single-element subarray [${i},${i}] is guaranteed valid.`,
        ),
      });
    } else {
      stack.at(-1).count += 1;
      stack.at(-1).indices.push(i);
      snap({
        title: text(`Dòng 10-11: gặp lại ${x}, tăng count`, `Lines 10-11: see ${x} again, increment count`),
        index: i,
        codeLines: codeLines.mergeEqual,
        vars: [{ name: "equal boundaries", value: stack.at(-1).count }],
        note: text(
          `Top cũng là ${x}. Vì mọi số nhỏ hơn đã bị pop, mỗi ${x} còn sống tạo một subarray hợp lệ kết thúc tại i.`,
          `The top is also ${x}. Since smaller values were popped, every surviving ${x} forms a valid subarray ending at i.`,
        ),
      });
    }

    ans += stack.at(-1).count;
    snap({
      title: text(`Dòng 12: ans += ${stack.at(-1).count} → ${ans}`, `Line 12: ans += ${stack.at(-1).count} → ${ans}`),
      index: i,
      codeLines: codeLines.add,
      vars: [{ name: "new valid subarrays ending here", value: stack.at(-1).count }],
      note: text(
        "Cộng số boundary bên trái có cùng value với x và không bị phần tử lớn hơn chắn giữa đường.",
        "Add the number of left boundaries equal to x that are not separated by a larger element.",
      ),
    });
  });

  snap({
    title: text(`Kết quả: ${ans}`, `Result: ${ans}`),
    codeLines: codeLines.done,
    note: text("Mỗi phần tử được push một lần và pop tối đa một lần, nên O(n).", "Each element is pushed once and popped at most once, so the scan is O(n)."),
    final: true,
  });
  return { original: nums, answer: ans, steps };
}

function dominanceBounds3430(nums, wantMin) {
  const n = nums.length;
  const left = Array(n).fill(-1);
  const right = Array(n).fill(n);
  let stack = [];
  for (let i = 0; i < n; i++) {
    while (stack.length && (wantMin ? nums[stack.at(-1)] > nums[i] : nums[stack.at(-1)] < nums[i])) stack.pop();
    left[i] = stack.length ? stack.at(-1) : -1;
    stack.push(i);
  }
  stack = [];
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length && (wantMin ? nums[stack.at(-1)] >= nums[i] : nums[stack.at(-1)] <= nums[i])) stack.pop();
    right[i] = stack.length ? stack.at(-1) : n;
    stack.push(i);
  }
  return { left, right };
}

function boundedPairCount(leftChoices, rightChoices, k) {
  let count = 0;
  for (let left = 1; left <= leftChoices; left++) {
    count += Math.max(0, Math.min(rightChoices, k - left + 1));
  }
  return count;
}

function compute3430(nums, k, wantMin) {
  const { left, right } = dominanceBounds3430(nums, wantMin);
  let total = 0;
  const rows = nums.map((value, i) => {
    const leftChoices = i - left[i];
    const rightChoices = right[i] - i;
    const count = boundedPairCount(leftChoices, rightChoices, k);
    const contribution = value * count;
    total += contribution;
    return { i, value, left: left[i], right: right[i], leftChoices, rightChoices, count, contribution };
  });
  return { total, rows };
}

function buildSteps3430(input, params = {}) {
  const nums = parseNums(input, "nums");
  if (nums.length > 14) throw new Error("Use up to 14 numbers so the contribution table stays readable.");
  const k = Math.max(1, Math.min(nums.length, Number(params.k) || 2));
  const minPart = compute3430(nums, k, true);
  const maxPart = compute3430(nums, k, false);
  const answer = minPart.total + maxPart.total;
  const steps = [];
  const sub = nums.map((value, index) => `i=${index} · ${value}`);
  const codeLines = {
    helper: [3, 4],
    bounds: [5, 6, 7, 8, 9, 10, 11, 12],
    count: [14, 15, 16, 17, 18, 19, 20],
    combine: [22, 23, 24, 25, 26, 27, 28, 29],
  };

  function tableRows(rows, current) {
    return rows.map((row) => ({
      value: row.value,
      detail: `i=${row.i} L=${row.left} R=${row.right} count=${row.count}${row.i === current ? " ← current" : ""}`,
    }));
  }

  function snap(o) {
    const rows = o.rows || [];
    steps.push({
      title: o.title,
      arr: [...nums],
      sub,
      highlight: Number.isInteger(o.index) ? [o.index] : [],
      mark: Number.isInteger(o.index) ? [o.index] : [],
      codeLines: o.codeLines || [],
      vars: [
        { name: "k", value: k },
        { name: "minSum", value: minPart.total },
        { name: "maxSum", value: maxPart.total },
        { name: "answer", value: answer },
        ...(o.vars || []),
      ],
      note: o.note,
      final: o.final || false,
      stackView: {
        title: o.stackTitle || "Contribution rows",
        emptyLabel: "no rows yet",
        items: tableRows(rows, o.index),
        input: [...nums],
        current: Number.isInteger(o.index) ? o.index : -1,
        inputLabel: "nums",
        expected: Number.isInteger(o.index) ? nums[o.index] : "",
        status: [
          { label: "mode", value: o.mode || "-" },
          { label: "k", value: k },
          { label: "partial", value: o.partial ?? "-" },
        ],
      },
    });
  }

  snap({
    title: text("Ý tưởng: cộng contribution của min và max", "Idea: add min and max contributions"),
    codeLines: codeLines.helper,
    vars: [{ name: "valid subarray length", value: `<= ${k}` }],
    note: text(
      "Mỗi index đóng góp value * số subarray dài không quá k mà nó là minimum, cộng thêm value * số subarray mà nó là maximum.",
      "Each index contributes value * the number of length-at-most-k subarrays where it is the minimum, plus the same idea for maximum.",
    ),
  });

  let runningMin = 0;
  minPart.rows.forEach((row) => {
    runningMin += row.contribution;
    snap({
      title: text(`MIN i=${row.i}: ${row.value} thống trị ${row.count} subarray`, `MIN i=${row.i}: ${row.value} owns ${row.count} subarrays`),
      index: row.i,
      rows: minPart.rows.slice(0, row.i + 1),
      mode: "minimum",
      partial: runningMin,
      codeLines: codeLines.bounds.concat(codeLines.count),
      vars: [
        { name: "prev smaller/equal", value: row.left },
        { name: "next smaller", value: row.right },
        { name: "left choices", value: row.leftChoices },
        { name: "right choices", value: row.rightChoices },
        { name: "bounded count", value: row.count },
        { name: "contribution", value: `${row.value} * ${row.count} = ${row.contribution}` },
      ],
      note: text(
        `Với minimum, biên trái dừng ở phần tử <= ${row.value}, biên phải dừng ở phần tử < ${row.value}. Chỉ đếm cặp left/right tạo độ dài <= k.`,
        `For minimum, the left boundary stops at <= ${row.value}, the right boundary stops at < ${row.value}. Count only left/right pairs whose length is <= k.`,
      ),
      stackTitle: "Minimum contribution rows",
    });
  });

  let runningMax = 0;
  maxPart.rows.forEach((row) => {
    runningMax += row.contribution;
    snap({
      title: text(`MAX i=${row.i}: ${row.value} thống trị ${row.count} subarray`, `MAX i=${row.i}: ${row.value} owns ${row.count} subarrays`),
      index: row.i,
      rows: maxPart.rows.slice(0, row.i + 1),
      mode: "maximum",
      partial: runningMax,
      codeLines: codeLines.bounds.concat(codeLines.count),
      vars: [
        { name: "prev greater/equal", value: row.left },
        { name: "next greater", value: row.right },
        { name: "left choices", value: row.leftChoices },
        { name: "right choices", value: row.rightChoices },
        { name: "bounded count", value: row.count },
        { name: "contribution", value: `${row.value} * ${row.count} = ${row.contribution}` },
      ],
      note: text(
        `Với maximum, biên trái dừng ở phần tử >= ${row.value}, biên phải dừng ở phần tử > ${row.value}. Cách tie-break này tránh đếm trùng khi có số bằng nhau.`,
        `For maximum, the left boundary stops at >= ${row.value}, the right boundary stops at > ${row.value}. This tie-break avoids double counting equal values.`,
      ),
      stackTitle: "Maximum contribution rows",
    });
  });

  snap({
    title: text(`Kết quả: ${minPart.total} + ${maxPart.total} = ${answer}`, `Result: ${minPart.total} + ${maxPart.total} = ${answer}`),
    codeLines: codeLines.combine,
    vars: [
      { name: "sum of minimums", value: minPart.total },
      { name: "sum of maximums", value: maxPart.total },
    ],
    note: text(
      "Bài hỏi tổng minimum + maximum trên mọi subarray có độ dài tối đa k.",
      "The problem asks for minimum + maximum over every subarray whose length is at most k.",
    ),
    final: true,
  });

  return { original: nums, answer, steps };
}

function simpleProblem({ id, difficulty, slug, name, viName, statement, defaultInput, inputKind = "string", inputLabel = null, tags = [arrayTag, monoTag], premium = false, solver, extraParams = [], complexity = null }) {
  return {
    id,
    difficulty,
    slug,
    premium,
    category,
    tags: premium ? [...tags, premiumTag] : tags,
    title: text(name),
    titleVi: text(viName || name, name),
    statement: text(statement.vi, statement.en),
    defaultInput,
    inputKind,
    inputLabel: inputLabel || text("nums (cách bởi ,)", "nums (comma separated)"),
    extraParams,
    approach: [
      text("Chọn hướng stack tăng/giảm theo câu hỏi: next greater, next smaller, hoặc span/range.", "Choose an increasing/decreasing stack based on the question: next greater, next smaller, or span/range."),
      text("Khi phần tử hiện tại phá tính đơn điệu, pop các phần tử đã tìm được biên/kết quả.", "When the current element breaks monotonicity, pop entries whose boundary/result is now known."),
    ],
    complexity: complexity || { time: "O(n)", space: "O(n)", note: text("Mỗi phần tử được push và pop nhiều nhất một lần.", "Each element is pushed and popped at most once.") },
    code: [
      "# Monotonic stack template used by this visualization",
      "stack = []",
      "for i, value in enumerate(nums):",
      "    while stack and current_value_resolves(stack[-1], value):",
      "        resolve(stack.pop(), value)",
      "    stack.append(i)",
      "return answer",
    ],
    builder: solver,
  };
}

module.exports = {
  1475: {
    id: 1475,
    difficulty: "easy",
    slug: "final-prices-with-a-special-discount-in-a-shop",
    category,
    tags: [arrayTag, monoTag],
    title: text("Final Prices With a Special Discount in a Shop"),
    titleVi: text("Giá cuối cùng sau giảm giá", "Final prices after special discount"),
    statement: text(
      "Với mỗi giá prices[i], tìm giá đầu tiên prices[j] ở bên phải sao cho j > i và prices[j] <= prices[i], rồi trừ prices[j]. Nếu không có thì giữ nguyên giá.",
      "For each prices[i], find the first prices[j] to its right with j > i and prices[j] <= prices[i], then subtract prices[j]. If none exists, keep the price unchanged.",
    ),
    defaultInput: "8,4,6,2,3",
    inputKind: "string",
    inputLabel: text("prices (cách bởi ,)", "prices (comma separated)"),
    extraParams: [],
    approach: [
      text("Copy prices sang answer; giá nào chưa có discount thì tạm giữ nguyên.", "Copy prices into answer; any item without a discount temporarily keeps its original price."),
      text("Duyệt trái sang phải, stack lưu index các giá chưa tìm được discount.", "Scan left to right; the stack stores indices whose discount has not been found."),
      text("Khi prices[i] <= prices[stack[-1]], prices[i] là discount đầu tiên cho index ở đỉnh stack.", "When prices[i] <= prices[stack[-1]], prices[i] is the first discount for the index at the stack top."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: text("Mỗi index được push một lần và pop nhiều nhất một lần.", "Each index is pushed once and popped at most once."),
    },
    code: [
      "class Solution:",
      "    def finalPrices(self, prices):",
      "        answer = prices[:]",
      "        stack = []",
      "        for i, price in enumerate(prices):",
      "            while stack and prices[stack[-1]] >= price:",
      "                j = stack.pop()",
      "                answer[j] = prices[j] - price",
      "            stack.append(i)",
      "        return answer",
    ],
    liveArgs: (input) => [parseNums(input, "prices")],
    builder: buildSteps1475,
  },
  316: {
    id: 316,
    difficulty: "medium",
    slug: "remove-duplicate-letters",
    category,
    tags: [stringTag, monoTag],
    title: text("Remove Duplicate Letters"),
    titleVi: text("Xóa chữ trùng để nhỏ nhất", "Remove duplicate letters for the smallest result"),
    statement: text(
      "Xóa ký tự trùng sao cho mỗi ký tự khác nhau xuất hiện đúng một lần và kết quả nhỏ nhất theo thứ tự từ điển.",
      "Remove duplicate letters so each distinct character appears exactly once and the result is lexicographically smallest.",
    ),
    defaultInput: "cbacdcbc",
    inputKind: "string",
    inputLabel: text("s", "s"),
    extraParams: [],
    approach: [
      text("Tính last index của mỗi ký tự để biết ký tự nào còn có thể thêm lại sau.", "Compute each character's last index to know whether it can be added again later."),
      text("Stack tăng theo thứ tự từ điển; pop top lớn hơn ch nếu top vẫn còn xuất hiện phía sau.", "Keep an increasing lexicographic stack; pop a larger top if it appears again later."),
      text("used đảm bảo mỗi ký tự chỉ xuất hiện một lần trong stack.", "used ensures each character appears only once in the stack."),
    ],
    complexity: { time: "O(n)", space: "O(k)", note: text("Mỗi ký tự được push/pop nhiều nhất một lần; k là số ký tự khác nhau.", "Each character is pushed/popped at most once; k is the number of distinct characters.") },
    code: [
      "class Solution:",
      "    def removeDuplicateLetters(self, s):",
      "        last = {ch: i for i, ch in enumerate(s)}",
      "        stack = []",
      "        used = set()",
      "        for i, ch in enumerate(s):",
      "            if ch in used:",
      "                continue",
      "            while stack and ch < stack[-1] and i < last[stack[-1]]:",
      "                used.remove(stack.pop())",
      "            stack.append(ch)",
      "            used.add(ch)",
      "        return ''.join(stack)",
    ],
    liveArgs: (input) => [String(input ?? "")],
    builder: buildSteps316,
  },
  456: simpleProblem({ id: 456, difficulty: "medium", slug: "132-pattern", name: "132 Pattern", viName: "Mẫu 132", statement: text("Kiểm tra có i < j < k sao cho nums[i] < nums[k] < nums[j].", "Check whether i < j < k exists with nums[i] < nums[k] < nums[j]."), defaultInput: "3,1,4,2", solver: arrayBuilder(pattern132) }),
  581: {
    id: 581,
    difficulty: "medium",
    slug: "shortest-unsorted-continuous-subarray",
    category,
    tags: [arrayTag, monoTag],
    title: text("Shortest Unsorted Continuous Subarray"),
    titleVi: text("Subarray ngắn nhất cần sort", "Shortest subarray that must be sorted"),
    statement: text(
      "Tìm độ dài đoạn liên tục ngắn nhất mà nếu sort đoạn đó thì toàn bộ mảng tăng không giảm.",
      "Find the shortest continuous subarray that, if sorted, makes the whole array nondecreasing.",
    ),
    defaultInput: "2,6,4,8,10,9,15",
    inputKind: "string",
    inputLabel: text("nums (cách bởi ,)", "nums (comma separated)"),
    extraParams: [],
    approach: [
      text("Lượt trái dùng stack tăng để tìm index sớm nhất bị một số nhỏ hơn bên phải phá thứ tự.", "The left pass uses an increasing stack to find the earliest index broken by a smaller value to its right."),
      text("Lượt phải dùng stack giảm để tìm index xa nhất bên phải bị một số lớn hơn bên trái phá thứ tự.", "The right pass uses a decreasing stack to find the farthest right index broken by a larger value to its left."),
      text("Nếu right > left thì đáp án là right-left+1; ngược lại mảng đã sorted.", "If right > left, the answer is right-left+1; otherwise the array is already sorted."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi index được push/pop nhiều nhất một lần trong mỗi lượt.", "Each index is pushed/popped at most once in each pass.") },
    code: [
      "class Solution:",
      "    def findUnsortedSubarray(self, nums):",
      "        left, right = len(nums), 0",
      "        stack = []",
      "        for i, num in enumerate(nums):",
      "            while stack and nums[stack[-1]] > num:",
      "                j = stack.pop()",
      "                left = min(left, j)",
      "            stack.append(i)",
      "        stack = []",
      "        for i in range(len(nums) - 1, -1, -1):",
      "            while stack and nums[stack[-1]] < nums[i]:",
      "                j = stack.pop()",
      "                right = max(right, j)",
      "            stack.append(i)",
      "        return right - left + 1 if right > left else 0",
    ],
    liveArgs: (input) => [parseNums(input, "nums")],
    builder: buildSteps581,
  },
  654: simpleProblem({ id: 654, difficulty: "medium", slug: "maximum-binary-tree", name: "Maximum Binary Tree", viName: "Cây nhị phân maximum", statement: text("Dựng Maximum Binary Tree từ mảng distinct.", "Construct the Maximum Binary Tree from a distinct array."), defaultInput: "3,2,1,6,0,5", tags: [arrayTag, treeTag, monoTag], solver: arrayBuilder(maxBinaryTree, (nums, answer) => text(`Root của cây là ${answer}.`, `The tree root is ${answer}.`)) }),
  769: {
    id: 769,
    difficulty: "medium",
    slug: "max-chunks-to-make-sorted",
    category,
    tags: [arrayTag],
    title: text("Max Chunks To Make Sorted"),
    titleVi: text("Số chunk tối đa để sort", "Max chunks to make sorted"),
    statement: text("Chia permutation thành nhiều chunk nhất để sort từng chunk rồi ghép lại thành sorted.", "Split a permutation into the maximum number of chunks that sort independently into the sorted array."),
    defaultInput: "1,0,2,3,4",
    inputKind: "string",
    inputLabel: text("arr (permutation, cách bởi ,)", "arr (permutation, comma separated)"),
    extraParams: [],
    approach: [
      text("Vì arr là permutation 0..n-1, prefix [0..i] tách được khi max(prefix) == i.", "Because arr is a permutation of 0..n-1, prefix [0..i] can be cut when max(prefix) == i."),
      text("Mỗi lần maxSoFar == i, sort chunk hiện tại sẽ đặt đúng các số 0..i.", "Whenever maxSoFar == i, sorting the current chunk places exactly values 0..i."),
    ],
    complexity: { time: "O(n)", space: "O(1)", note: text("Một lượt quét, chỉ giữ maxSoFar và chunks.", "Single scan, keeping only maxSoFar and chunks.") },
    code: [
      "class Solution:",
      "    def maxChunksToSorted(self, arr):",
      "        max_so_far = -1",
      "        chunks = 0",
      "        for i, value in enumerate(arr):",
      "            max_so_far = max(max_so_far, value)",
      "            if max_so_far == i:",
      "                chunks += 1",
      "        return chunks",
    ],
    liveArgs: (input) => [parseNums(input, "arr")],
    builder: buildSteps769,
  },
  853: simpleProblem({ id: 853, difficulty: "medium", slug: "car-fleet", name: "Car Fleet", viName: "Đoàn xe", statement: text("Đếm số đoàn xe tới target.", "Count how many car fleets reach the target."), defaultInput: "10,2;8,4;0,1;5,1;3,3", inputLabel: text("cars (position,speed; ...)", "cars (position,speed; ...)"), extraParams: [{ key: "target", label: text("target", "target"), default: 12, min: 1 }], solver: (input, params) => { const cars = parsePairs(input); const answer = carFleet(input, params); return { original: cars.flat(), answer, steps: genericSteps({ nums: cars.map((p) => p[0]), title: text("Đếm fleet", "Count fleets"), answer, note: text("Duyệt xe từ gần target về xa; stack thời gian đến giữ các fleet chậm nhất.", "Scan cars from nearest to farthest; arrival times form the fleet stack.") }) }; } }),
  901: {
    id: 901,
    difficulty: "medium",
    slug: "online-stock-span",
    category,
    tags: [arrayTag, monoTag],
    title: text("Online Stock Span"),
    titleVi: text("Stock span online", "Online stock span"),
    statement: text("Mỗi giá mới trả về số ngày liên tiếp gần nhất có giá <= hôm nay.", "For each new price, return consecutive previous days with price <= today."),
    defaultInput: "100,80,60,70,60,75,85",
    inputKind: "string",
    inputLabel: text("prices", "prices"),
    extraParams: [],
    approach: [
      text("Stack giảm dần theo giá, lưu [price, day].", "Keep a decreasing stack of [price, day]."),
      text("Pop mọi ngày có price <= hôm nay vì chúng nằm trong span hôm nay.", "Pop every day whose price <= today's price because it belongs to today's span."),
      text("Sau khi pop, span là khoảng cách tới ngày có giá cao hơn gần nhất, hoặc i+1 nếu không có.", "After popping, span is the distance to the nearest higher price day, or i+1 if none exists."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi price được push/pop nhiều nhất một lần.", "Each price is pushed/popped at most once.") },
    code: [
      "class Solution:",
      "    def stockSpans(self, prices):",
      "        stack = []",
      "        answer = []",
      "        for i, price in enumerate(prices):",
      "            while stack and stack[-1][0] <= price:",
      "                stack.pop()",
      "            span = i - stack[-1][1] if stack else i + 1",
      "            answer.append(span)",
      "            stack.append([price, i])",
      "        return answer",
    ],
    liveArgs: (input) => [parseNums(input, "prices")],
    builder: buildSteps901,
  },
  907: simpleProblem({ id: 907, difficulty: "medium", slug: "sum-of-subarray-minimums", name: "Sum of Subarray Minimums", viName: "Tổng minimum của mọi subarray", statement: text("Tính tổng min của mọi subarray.", "Return the sum of every subarray's minimum."), defaultInput: "3,1,2,4", solver: arrayBuilder(sumSubarrayMins) }),
  962: {
    id: 962,
    difficulty: "medium",
    slug: "maximum-width-ramp",
    category,
    tags: [arrayTag, monoTag],
    title: text("Maximum Width Ramp"),
    titleVi: text("Ramp rộng nhất", "Maximum width ramp"),
    statement: text("Tìm max j-i sao cho i<j và nums[i] <= nums[j].", "Find max j-i with i<j and nums[i] <= nums[j]."),
    defaultInput: "6,0,8,2,1,5",
    inputKind: "string",
    inputLabel: text("nums (cách bởi ,)", "nums (comma separated)"),
    extraParams: [],
    approach: [
      text("Lượt trái: stack lưu candidate left indices có value giảm dần.", "Left pass: stack stores candidate left indices with decreasing values."),
      text("Lượt phải: quét j từ phải sang trái; nếu nums[left] <= nums[j], cập nhật width.", "Right pass: scan j from right to left; if nums[left] <= nums[j], update width."),
      text("Khi left đã gặp j xa nhất của nó, pop left khỏi stack.", "Once a left index meets its farthest possible j, pop it from the stack."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi index được push/pop nhiều nhất một lần.", "Each index is pushed/popped at most once.") },
    code: [
      "class Solution:",
      "    def maxWidthRamp(self, nums):",
      "        stack = []",
      "        answer = 0",
      "        for i, value in enumerate(nums):",
      "            if not stack or value < nums[stack[-1]]:",
      "                stack.append(i)",
      "        for j in range(len(nums) - 1, -1, -1):",
      "            while stack and nums[stack[-1]] <= nums[j]:",
      "                answer = max(answer, j - stack[-1])",
      "                stack.pop()",
      "        return answer",
    ],
    liveArgs: (input) => [parseNums(input, "nums")],
    builder: buildSteps962,
  },
  1008: simpleProblem({ id: 1008, difficulty: "medium", slug: "construct-binary-search-tree-from-preorder-traversal", name: "Construct BST from Preorder Traversal", viName: "Dựng BST từ preorder", statement: text("Dựng BST từ preorder traversal.", "Construct a BST from preorder traversal."), defaultInput: "8,5,1,7,10,12", tags: [arrayTag, treeTag, monoTag], solver: arrayBuilder(bstPreorder) }),
  1019: {
    id: 1019,
    difficulty: "medium",
    slug: "next-greater-node-in-linked-list",
    category,
    tags: [arrayTag, linkedListTag, monoTag],
    title: text("Next Greater Node In Linked List"),
    titleVi: text("Node lớn hơn kế tiếp trong linked list", "Next greater node in linked list"),
    statement: text(
      "Với mỗi node trong linked list, tìm giá trị node đầu tiên ở bên phải có value lớn hơn. Nếu không có thì trả về 0.",
      "For each node in a linked list, find the first node to its right with a greater value. Return 0 if none exists.",
    ),
    defaultInput: "2,1,5",
    inputKind: "string",
    inputLabel: text("linked list values (cách bởi ,)", "linked list values (comma separated)"),
    extraParams: [],
    approach: [
      text("Copy linked list sang array values để có index.", "Copy the linked list into a values array so we can use indices."),
      text("Stack giữ index của các node chưa tìm thấy node lớn hơn; value trên stack giảm dần.", "The stack stores indices of nodes still waiting for a greater node; stack values are decreasing."),
      text("Khi values[i] lớn hơn node ở đỉnh stack, values[i] là next greater đầu tiên của node đó.", "When values[i] is greater than the stack top node, values[i] is that node's first next greater value."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: text("Mỗi node được copy một lần, push một lần và pop nhiều nhất một lần.", "Each node is copied once, pushed once, and popped at most once."),
    },
    code: [
      "class Solution:",
      "    def nextLargerNodes(self, head):",
      "        values = []",
      "        while head:",
      "            values.append(head.val)",
      "            head = head.next",
      "        answer = [0] * len(values)",
      "        stack = []",
      "        for i, value in enumerate(values):",
      "            while stack and values[stack[-1]] < value:",
      "                answer[stack.pop()] = value",
      "            stack.append(i)",
      "        return answer",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int[] NextLargerNodes(ListNode head) {",
      "        List<int> values = new List<int>();",
      "        while (head != null) {",
      "            values.Add(head.val);",
      "            head = head.next;",
      "        }",
      "        int[] answer = new int[values.Count];",
      "        Stack<int> stack = new Stack<int>();",
      "        for (int i = 0; i < values.Count; i++) {",
      "            while (stack.Count > 0 && values[stack.Peek()] < values[i]) {",
      "                answer[stack.Pop()] = values[i];",
      "            }",
      "            stack.Push(i);",
      "        }",
      "        return answer;",
      "    }",
      "}",
    ],
    liveArgs: (input) => [{ __viz_type: "linked_list", values: parseNums(input, "head") }],
    builder: buildSteps1019,
  },
  1124: {
    id: 1124,
    difficulty: "medium",
    slug: "longest-well-performing-interval",
    category,
    tags: [arrayTag, monoTag],
    title: text("Longest Well-Performing Interval"),
    titleVi: text("Khoảng làm việc tốt dài nhất", "Longest well-performing interval"),
    statement: text("Ngày mệt là hours > 8; tìm interval dài nhất có ngày mệt nhiều hơn ngày không mệt.", "A tiring day has hours > 8; find the longest interval with more tiring than non-tiring days."),
    defaultInput: "9,9,6,0,6,6,9",
    inputKind: "string",
    inputLabel: text("hours", "hours"),
    extraParams: [],
    approach: [
      text("Đổi mỗi ngày thành +1 nếu hours>8, ngược lại -1; interval tốt khi tổng > 0.", "Convert each day to +1 if hours>8, otherwise -1; an interval is good when its sum > 0."),
      text("Dùng prefix; cần prefix[j] > prefix[i] để đoạn i..j-1 tốt.", "Use prefix sums; need prefix[j] > prefix[i] for interval i..j-1 to be good."),
      text("Stack lưu prefix minima giảm dần, rồi quét j từ phải để lấy width lớn nhất.", "The stack stores decreasing prefix minima, then scan j from the right to get the widest interval."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi prefix index được push/pop nhiều nhất một lần.", "Each prefix index is pushed/popped at most once.") },
    code: [
      "class Solution:",
      "    def longestWPI(self, hours):",
      "        prefix = [0]",
      "        for h in hours:",
      "            prefix.append(prefix[-1] + (1 if h > 8 else -1))",
      "        stack = []",
      "        for i, score in enumerate(prefix):",
      "            if not stack or score < prefix[stack[-1]]:",
      "                stack.append(i)",
      "        answer = 0",
      "        for j in range(len(prefix) - 1, -1, -1):",
      "            while stack and prefix[j] > prefix[stack[-1]]:",
      "                answer = max(answer, j - stack.pop())",
      "        return answer",
    ],
    liveArgs: (input) => [parseNums(input, "hours")],
    builder: buildSteps1124,
  },
  1130: simpleProblem({ id: 1130, difficulty: "medium", slug: "minimum-cost-tree-from-leaf-values", name: "Minimum Cost Tree From Leaf Values", viName: "Cây chi phí nhỏ nhất từ leaf", statement: text("Ghép leaf để tổng non-leaf value nhỏ nhất.", "Combine leaves so the sum of non-leaf values is minimized."), defaultInput: "6,2,4", solver: arrayBuilder(mctFromLeafValues) }),
  1504: simpleProblem({ id: 1504, difficulty: "medium", slug: "count-submatrices-with-all-ones", name: "Count Submatrices With All Ones", viName: "Đếm submatrix toàn 1", statement: text("Đếm mọi submatrix chỉ chứa số 1.", "Count all submatrices containing only ones."), defaultInput: "1,0,1;1,1,0;1,1,0", inputLabel: text("mat (hàng cách ;)", "mat (rows separated by ;)"), solver: countSubmatrices }),
  1574: simpleProblem({ id: 1574, difficulty: "medium", slug: "shortest-subarray-to-be-removed-to-make-array-sorted", name: "Shortest Subarray to be Removed to Make Array Sorted", viName: "Xóa subarray ngắn nhất để mảng sorted", statement: text("Xóa một đoạn liên tục ngắn nhất để phần còn lại không giảm.", "Remove the shortest continuous segment so the remaining array is nondecreasing."), defaultInput: "1,2,3,10,4,2,3,5", solver: arrayBuilder(findLengthOfShortestSubarray) }),
  1673: {
    id: 1673,
    difficulty: "medium",
    slug: "find-the-most-competitive-subsequence",
    category,
    tags: [arrayTag, monoTag],
    title: text("Find the Most Competitive Subsequence"),
    titleVi: text("Subsequence cạnh tranh nhất", "Most competitive subsequence"),
    statement: text("Tìm subsequence độ dài k nhỏ nhất theo thứ tự từ điển.", "Find the lexicographically smallest subsequence of length k."),
    defaultInput: "3,5,2,6",
    inputKind: "string",
    inputLabel: text("nums (cách bởi ,)", "nums (comma separated)"),
    extraParams: [{ key: "k", label: text("k", "k"), default: 2, min: 1 }],
    approach: [
      text("drop = n-k là số phần tử được phép bỏ.", "drop = n-k is the number of elements we may remove."),
      text("Khi num nhỏ hơn top và còn drop, pop top để num đứng sớm hơn.", "When num is smaller than the top and drop remains, pop the top so num appears earlier."),
      text("Cuối cùng lấy k phần tử đầu của stack.", "Take the first k stack values at the end."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi phần tử được push và pop nhiều nhất một lần.", "Each value is pushed and popped at most once.") },
    code: [
      "class Solution:",
      "    def mostCompetitive(self, nums, k):",
      "        drop = len(nums) - k",
      "        stack = []",
      "        for num in nums:",
      "            while drop and stack and stack[-1] > num:",
      "                stack.pop(); drop -= 1",
      "            stack.append(num)",
      "        return stack[:k]",
    ],
    liveArgs: (input, params) => [parseNums(input, "nums"), Number(params.k)],
    builder: buildSteps1673,
  },
  1856: simpleProblem({ id: 1856, difficulty: "medium", slug: "maximum-subarray-min-product", name: "Maximum Subarray Min-Product", viName: "Min-product lớn nhất", statement: text("Tối đa hóa min(subarray) * sum(subarray).", "Maximize min(subarray) * sum(subarray)."), defaultInput: "1,2,3,2", solver: arrayBuilder(maxSumMinProduct) }),
  2104: simpleProblem({ id: 2104, difficulty: "medium", slug: "sum-of-subarray-ranges", name: "Sum of Subarray Ranges", viName: "Tổng range của mọi subarray", statement: text("Tổng (max-min) của mọi subarray.", "Sum max-min over every subarray."), defaultInput: "1,2,3", solver: arrayBuilder(subArrayRanges) }),
  2289: {
    id: 2289,
    difficulty: "medium",
    slug: "steps-to-make-array-non-decreasing",
    category,
    tags: [arrayTag, monoTag],
    title: text("Steps to Make Array Non-decreasing"),
    titleVi: text("Số bước để mảng không giảm", "Steps to make array non-decreasing"),
    statement: text(
      "Mỗi step xóa đồng thời mọi nums[i] nếu nums[i-1] > nums[i]. Trả số step cần để mảng trở thành non-decreasing.",
      "In each step, simultaneously remove every nums[i] where nums[i-1] > nums[i]. Return the number of steps needed until the array is non-decreasing.",
    ),
    defaultInput: "5,3,4,4,7,3,6,11,8,5,11",
    inputKind: "string",
    inputLabel: text("nums (cách bởi ,)", "nums (comma separated)"),
    extraParams: [],
    approach: [
      text("Stack lưu cặp [value, days] cho các phần tử còn sống khi quét từ trái sang phải.", "The stack stores [value, days] for survivors while scanning left to right."),
      text("Pop các value <= num vì chúng không thể xóa num; days của chúng vẫn tạo độ trễ dây chuyền.", "Pop values <= num because they cannot remove num; their days still create chain-reaction delay."),
      text("Nếu còn value lớn hơn bên trái, num bị xóa sau max popped days + 1; nếu stack rỗng thì days = 0.", "If a larger left value remains, num is removed after max popped days + 1; if the stack is empty, days = 0."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi phần tử được push và pop nhiều nhất một lần.", "Each element is pushed and popped at most once.") },
    code: [
      "class Solution:",
      "    def totalSteps(self, nums):",
      "        stack = []",
      "        answer = 0",
      "        for num in nums:",
      "            days = 0",
      "            while stack and stack[-1][0] <= num:",
      "                days = max(days, stack.pop()[1])",
      "            days = days + 1 if stack else 0",
      "            answer = max(answer, days)",
      "            stack.append([num, days])",
      "        return answer",
    ],
    liveArgs: (input) => [parseNums(input, "nums")],
    builder: buildSteps2289,
  },
  2487: {
    id: 2487,
    difficulty: "medium",
    slug: "remove-nodes-from-linked-list",
    category,
    tags: [linkedListTag, monoTag],
    title: text("Remove Nodes From Linked List"),
    titleVi: text("Xóa node có node lớn hơn bên phải", "Remove nodes with a greater node on the right"),
    statement: text(
      "Xóa mọi node trong linked list nếu bên phải nó tồn tại node có value lớn hơn.",
      "Remove every node in the linked list that has a greater value somewhere to its right.",
    ),
    defaultInput: "5,2,13,3,8",
    inputKind: "string",
    inputLabel: text("linked list values (cách bởi ,)", "linked list values (comma separated)"),
    extraParams: [],
    approach: [
      text("Quét values từ trái sang phải, stack giữ các node hiện vẫn được giữ lại.", "Scan values left to right; the stack stores nodes currently kept."),
      text("Khi gặp value lớn hơn đỉnh stack, đỉnh đó chắc chắn phải xóa vì có node lớn hơn ở bên phải.", "When the current value is greater than the stack top, that top must be removed because a greater node exists to its right."),
      text("Các value còn trong stack là linked list sau khi xóa.", "Values left in the stack form the linked list after removals."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi node vào stack một lần và bị pop nhiều nhất một lần.", "Each node enters the stack once and is popped at most once.") },
    code: [
      "class Solution:",
      "    def removeNodes(self, head):",
      "        stack = []",
      "        curr = head",
      "        while curr:",
      "            while stack and stack[-1].val < curr.val:",
      "                stack.pop()",
      "            stack.append(curr)",
      "            curr = curr.next",
      "        dummy = ListNode(0)",
      "        tail = dummy",
      "        for node in stack:",
      "            tail.next = node",
      "            tail = node",
      "        tail.next = None",
      "        return dummy.next",
    ],
    liveArgs: (input) => [{ __viz_type: "linked_list", values: parseNums(input, "head") }],
    builder: buildSteps2487,
  },
  2865: simpleProblem({ id: 2865, difficulty: "medium", slug: "beautiful-towers-i", name: "Beautiful Towers I", viName: "Beautiful Towers I", statement: text("Chọn peak và giảm độ cao hai phía để tổng height lớn nhất.", "Choose a peak and lower both sides to maximize total height."), defaultInput: "5,3,4,1,1", solver: arrayBuilder(beautifulTowers) }),
  2866: simpleProblem({ id: 2866, difficulty: "medium", slug: "beautiful-towers-ii", name: "Beautiful Towers II", viName: "Beautiful Towers II", statement: text("Phiên bản lớn của Beautiful Towers dùng stack/prefix sum.", "Larger Beautiful Towers variant using stack/prefix sums."), defaultInput: "6,5,3,9,2,7", solver: arrayBuilder(beautifulTowers) }),
  768: {
    id: 768,
    difficulty: "hard",
    slug: "max-chunks-to-make-sorted-ii",
    category,
    tags: [arrayTag, monoTag],
    title: text("Max Chunks To Make Sorted II"),
    titleVi: text("Số chunk tối đa để sort II", "Max chunks to make sorted II"),
    statement: text("Chia mảng có duplicate thành nhiều chunk nhất để sort từng chunk rồi ghép lại sorted.", "Split an array with duplicates into the maximum number of chunks that sort independently."),
    defaultInput: "5,4,3,2,1",
    inputKind: "string",
    inputLabel: text("arr (cách bởi ,)", "arr (comma separated)"),
    extraParams: [],
    approach: [
      text("Stack lưu max của từng chunk hiện có.", "The stack stores the maximum value of each current chunk."),
      text("Nếu chunk trước có max > current, current không thể đứng ở chunk riêng; phải merge.", "If the previous chunk max > current, current cannot be a separate chunk; merge chunks."),
      text("Số item còn trong stack là số chunk tối đa.", "The number of items left in the stack is the maximum chunk count."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi chunk max được push/pop nhiều nhất một lần.", "Each chunk max is pushed/popped at most once.") },
    code: [
      "class Solution:",
      "    def maxChunksToSorted(self, arr):",
      "        stack = []",
      "        for value in arr:",
      "            mx = value",
      "            while stack and stack[-1] > value:",
      "                mx = max(mx, stack.pop())",
      "            stack.append(mx)",
      "        return len(stack)",
    ],
    liveArgs: (input) => [parseNums(input, "arr")],
    builder: buildSteps768,
  },
  975: simpleProblem({ id: 975, difficulty: "hard", slug: "odd-even-jump", name: "Odd Even Jump", viName: "Nhảy chẵn lẻ", statement: text("Đếm start index có thể tới cuối bằng luật nhảy odd/even.", "Count starting indices that can reach the end using odd/even jump rules."), defaultInput: "10,13,12,14,15", solver: arrayBuilder(oddEvenJump) }),
  1526: simpleProblem({ id: 1526, difficulty: "hard", slug: "minimum-number-of-increments-on-subarrays-to-form-a-target-array", name: "Minimum Number of Increments on Subarrays to Form a Target Array", viName: "Số increment subarray ít nhất", statement: text("Tạo target từ zero array bằng increment subarray ít nhất.", "Form target from a zero array using the fewest subarray increments."), defaultInput: "1,2,3,2,1", solver: arrayBuilder(minIncrementsTarget) }),
  1776: simpleProblem({ id: 1776, difficulty: "hard", slug: "car-fleet-ii", name: "Car Fleet II", viName: "Đoàn xe II", statement: text("Với mỗi xe, tính thời điểm va chạm với xe phía trước.", "For each car, compute when it collides with a car ahead."), defaultInput: "1,2;2,1;4,3;7,2", inputLabel: text("cars (position,speed; ...)", "cars (position,speed; ...)"), solver: (input) => { const cars = parsePairs(input); const answer = carFleetII(input); return { original: cars.flat(), answer, steps: genericSteps({ nums: cars.map((p) => p[0]), title: text("Collision times", "Collision times"), answer, note: text("Stack giữ xe phía trước còn có thể là va chạm đầu tiên.", "The stack keeps front cars that can still be the first collision.") }) }; } }),
  1793: simpleProblem({ id: 1793, difficulty: "hard", slug: "maximum-score-of-a-good-subarray", name: "Maximum Score of a Good Subarray", viName: "Điểm lớn nhất của good subarray", statement: text("Subarray phải chứa k; score = min * length.", "The subarray must contain k; score = min * length."), defaultInput: "1,4,3,7,4,5", extraParams: [{ key: "k", label: text("k", "k"), default: 3, min: 0 }], solver: arrayBuilder(maximumScore) }),
  1944: simpleProblem({ id: 1944, difficulty: "hard", slug: "number-of-visible-people-in-a-queue", name: "Number of Visible People in a Queue", viName: "Số người nhìn thấy trong hàng đợi", statement: text("Với mỗi người, đếm số người bên phải họ nhìn thấy.", "For each person, count visible people to their right."), defaultInput: "10,6,8,5,11,9", solver: arrayBuilder(canSeePersonsCount) }),
  2334: simpleProblem({ id: 2334, difficulty: "hard", slug: "subarray-with-elements-greater-than-varying-threshold", name: "Subarray With Elements Greater Than Varying Threshold", viName: "Subarray vượt threshold biến đổi", statement: text("Tìm size k sao cho mọi phần tử trong subarray > threshold/k.", "Find a size k where every subarray element is greater than threshold/k."), defaultInput: "1,3,4,3,1", extraParams: [{ key: "threshold", label: text("threshold", "threshold"), default: 6, min: 0 }], solver: arrayBuilder(validSubarraySize) }),
  2454: simpleProblem({ id: 2454, difficulty: "hard", slug: "next-greater-element-iv", name: "Next Greater Element IV", viName: "Phần tử lớn hơn thứ hai", statement: text("Với mỗi index, tìm phần tử lớn hơn thứ hai ở bên phải.", "For each index, find the second greater element to its right."), defaultInput: "2,4,0,9,6", solver: arrayBuilder(secondGreater) }),
  321: {
    id: 321,
    difficulty: "hard",
    slug: "create-maximum-number",
    category,
    tags: [arrayTag, monoTag],
    title: text("Create Maximum Number"),
    titleVi: text("Tạo số lớn nhất", "Create maximum number"),
    statement: text(
      "Chọn tổng cộng k digit từ nums1 và nums2 để tạo số lớn nhất. Thứ tự tương đối của digit trong từng mảng phải được giữ nguyên.",
      "Choose k total digits from nums1 and nums2 to create the largest possible number. The relative order of digits from each array must be preserved.",
    ),
    defaultInput: "3,4,6,5",
    inputKind: "string",
    inputLabel: text("nums1 digits", "nums1 digits"),
    extraParams: [
      { key: "nums2", type: "string", label: text("nums2 digits", "nums2 digits"), default: "9,1,2,5,8,3" },
      { key: "k", label: text("k", "k"), default: 5, min: 1 },
    ],
    approach: [
      text("Thử mọi split: lấy i digit từ nums1 và k-i digit từ nums2.", "Try every split: take i digits from nums1 and k-i digits from nums2."),
      text("Với mỗi mảng, dùng monotonic stack để chọn subsequence lớn nhất đúng độ dài.", "For each array, use a monotonic stack to pick the largest subsequence of the exact length."),
      text("Merge hai subsequence bằng cách luôn chọn suffix còn lại lớn hơn theo thứ tự từ điển.", "Merge the two subsequences by always taking from the lexicographically larger remaining suffix."),
    ],
    complexity: {
      time: "O(k(m+n)^2)",
      space: "O(m+n)",
      note: text(
        "Có nhiều cách tối ưu/triển khai khác nhau; visualization dùng input nhỏ để thấy rõ pick + merge + compare.",
        "There are several optimized implementations; this visualization uses small inputs to make pick + merge + compare clear.",
      ),
    },
    code: [
      "class Solution:",
      "    def maxNumber(self, nums1, nums2, k):",
      "        def pick(nums, size):",
      "            drop = len(nums) - size",
      "            stack = []",
      "            for digit in nums:",
      "                while drop and stack and stack[-1] < digit:",
      "                    stack.pop(); drop -= 1",
      "                stack.append(digit)",
      "            return stack[:size]",
      "        def greater(a, i, b, j):",
      "            while i < len(a) and j < len(b) and a[i] == b[j]:",
      "                i += 1; j += 1",
      "            return j == len(b) or (i < len(a) and a[i] > b[j])",
      "        def merge(a, b):",
      "            ans = []",
      "            i = j = 0",
      "            while i < len(a) or j < len(b):",
      "                if greater(a, i, b, j):",
      "                    ans.append(a[i]); i += 1",
      "                else:",
      "                    ans.append(b[j]); j += 1",
      "            return ans",
      "        best = []",
      "        for i in range(max(0, k-len(nums2)), min(k, len(nums1)) + 1):",
      "            candidate = merge(pick(nums1, i), pick(nums2, k-i))",
      "            if greater(candidate, 0, best, 0): best = candidate",
      "        return best",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int[] MaxNumber(int[] nums1, int[] nums2, int k) {",
      "        List<int> best = new List<int>();",
      "        int start = Math.Max(0, k - nums2.Length);",
      "        int end = Math.Min(k, nums1.Length);",
      "        for (int i = start; i <= end; i++) {",
      "            var candidate = Merge(Pick(nums1, i), Pick(nums2, k - i));",
      "            if (Greater(candidate, 0, best, 0)) best = candidate;",
      "        }",
      "        return best.ToArray();",
      "    }",
      "    private List<int> Pick(int[] nums, int size) {",
      "        int drop = nums.Length - size;",
      "        List<int> stack = new List<int>();",
      "        foreach (int digit in nums) {",
      "            while (drop > 0 && stack.Count > 0 && stack[stack.Count - 1] < digit) {",
      "                stack.RemoveAt(stack.Count - 1);",
      "                drop--;",
      "            }",
      "            stack.Add(digit);",
      "        }",
      "        return stack.GetRange(0, size);",
      "    }",
      "    private bool Greater(List<int> a, int i, List<int> b, int j) {",
      "        while (i < a.Count && j < b.Count && a[i] == b[j]) { i++; j++; }",
      "        return j == b.Count || (i < a.Count && a[i] > b[j]);",
      "    }",
      "    private List<int> Merge(List<int> a, List<int> b) {",
      "        List<int> ans = new List<int>();",
      "        int i = 0, j = 0;",
      "        while (i < a.Count || j < b.Count) {",
      "            if (Greater(a, i, b, j)) ans.Add(a[i++]);",
      "            else ans.Add(b[j++]);",
      "        }",
      "        return ans;",
      "    }",
      "}",
    ],
    liveArgs: (input, params) => [parseNums(input, "nums1"), parseNums(params.nums2, "nums2"), Number(params.k)],
    builder: buildSteps321,
  },
  2030: {
    id: 2030,
    difficulty: "hard",
    slug: "smallest-k-length-subsequence-with-occurrences-of-a-letter",
    category,
    tags: [stringTag, monoTag],
    title: text("Smallest K-Length Subsequence With Occurrences of a Letter"),
    titleVi: text("Subsequence độ dài k nhỏ nhất có đủ ký tự", "Smallest k-length subsequence with required letters"),
    statement: text(
      "Tìm subsequence nhỏ nhất theo thứ tự từ điển, có độ dài k và chứa letter ít nhất repetition lần.",
      "Find the lexicographically smallest subsequence of length k that contains letter at least repetition times.",
    ),
    defaultInput: "leet",
    inputKind: "string",
    inputLabel: text("s", "s"),
    extraParams: [
      { key: "k", label: text("k", "k"), default: 3, min: 1 },
      { key: "letter", type: "string", label: text("letter", "letter"), default: "e" },
      { key: "repetition", label: text("repetition", "repetition"), default: 1, min: 1 },
    ],
    approach: [
      text("Stack tăng để kết quả nhỏ theo từ điển.", "Use an increasing stack to make the result lexicographically small."),
      text("Chỉ pop khi vẫn đủ ký tự để đạt length k và vẫn đủ letter bắt buộc.", "Pop only when enough characters remain to reach length k and enough required letters remain."),
      text("Khi không còn dư slot, skip ký tự thường để dành chỗ cho letter.", "When no spare slot remains, skip non-required characters to reserve space for letter."),
    ],
    complexity: { time: "O(n)", space: "O(k)", note: text("Mỗi ký tự được push/pop nhiều nhất một lần.", "Each character is pushed/popped at most once.") },
    code: [
      "class Solution:",
      "    def smallestSubsequence(self, s, k, letter, repetition):",
      "        remain = s.count(letter)",
      "        need = repetition",
      "        stack = []",
      "        for i, ch in enumerate(s):",
      "            while stack and stack[-1] > ch and len(stack)-1 + len(s)-i >= k and (stack[-1] != letter or remain > need):",
      "                removed = stack.pop()",
      "                if removed == letter: need += 1",
      "            if len(stack) < k:",
      "                if ch == letter:",
      "                    stack.append(ch)",
      "                    need -= 1",
      "                elif k - len(stack) > need:",
      "                    stack.append(ch)",
      "            if ch == letter:",
      "                remain -= 1",
      "        return ''.join(stack)",
    ],
    liveArgs: (input, params) => [String(input ?? ""), Number(params.k), String(params.letter ?? "e")[0] || "e", Number(params.repetition)],
    builder: buildSteps2030,
  },
  3113: {
    id: 3113,
    difficulty: "hard",
    slug: "find-the-number-of-subarrays-where-boundary-elements-are-maximum",
    category,
    tags: [arrayTag, monoTag],
    title: text("Find the Number of Subarrays Where Boundary Elements Are Maximum"),
    titleVi: text("Đếm subarray có hai biên là maximum", "Find the Number of Subarrays Where Boundary Elements Are Maximum"),
    statement: text(
      "Đếm số subarray mà phần tử đầu và phần tử cuối đều bằng maximum của subarray đó.",
      "Count subarrays whose first and last elements are both equal to the maximum element in that subarray.",
    ),
    defaultInput: "1,4,3,3,2",
    inputKind: "string",
    inputLabel: text("nums (cách bởi ,)", "nums (comma separated)"),
    approach: [
      text("Giữ stack giảm dần theo value; value nhỏ hơn số hiện tại bị pop vì đã bị số lớn hơn chắn.", "Keep a decreasing stack by value; smaller values are popped because the current larger value blocks them."),
      text("Mỗi entry lưu value và count số value bằng nhau còn sống trên stack.", "Each entry stores a value and how many equal values are still alive on the stack."),
      text("Khi gặp lại cùng value ở top, tăng count; count đó chính là số subarray hợp lệ kết thúc tại vị trí hiện tại.", "When the top has the same value, increment its count; that count is the number of valid subarrays ending at the current position."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Mỗi phần tử được push một lần và pop tối đa một lần.", "Each element is pushed once and popped at most once.") },
    code: [
      "class Solution:",
      "    def numberOfSubarrays(self, nums):",
      "        stack = []",
      "        ans = 0",
      "        for x in nums:",
      "            while stack and stack[-1][0] < x:",
      "                stack.pop()",
      "            if not stack or stack[-1][0] > x:",
      "                stack.append([x, 1])",
      "            else:",
      "                stack[-1][1] += 1",
      "            ans += stack[-1][1]",
      "        return ans",
    ],
    liveArgs: (input) => [parseNums(input, "nums")],
    builder: buildSteps3113,
  },
  3430: {
    id: 3430,
    difficulty: "hard",
    slug: "maximum-and-minimum-sums-of-at-most-size-k-subarrays",
    category,
    tags: [arrayTag, monoTag],
    title: text("Maximum and Minimum Sums of at Most Size K Subarrays"),
    titleVi: text("Tổng max và min của subarray dài tối đa k", "Maximum and Minimum Sums of at Most Size K Subarrays"),
    statement: text(
      "Tính tổng min(subarray) + max(subarray) trên mọi subarray có độ dài không quá k.",
      "Compute the sum of min(subarray) + max(subarray) over all subarrays whose length is at most k.",
    ),
    defaultInput: "1,2,3",
    inputKind: "string",
    inputLabel: text("nums (cách bởi ,)", "nums (comma separated)"),
    extraParams: [{ key: "k", label: text("k (độ dài tối đa)", "k (maximum size)"), default: 2, min: 1 }],
    approach: [
      text("Tính riêng tổng contribution của minimum và maximum.", "Compute minimum and maximum contributions separately."),
      text("Dùng monotonic stack để tìm prev/next boundary nơi nums[i] còn là min hoặc max duy nhất theo tie-break.", "Use monotonic stacks to find prev/next boundaries where nums[i] owns the min or max role under a tie-break."),
      text("Với leftChoices và rightChoices, chỉ đếm các cặp tạo subarray có độ dài <= k.", "Given leftChoices and rightChoices, count only pairs that form subarrays of length <= k."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: text("Boundary dùng stack O(n); visualization đếm bounded pairs trực tiếp để dễ nhìn.", "Boundaries use O(n) stacks; the visualization counts bounded pairs directly for readability.") },
    code: [
      "class Solution:",
      "    def minMaxSubarraySum(self, nums, k):",
      "        def bounds(is_min):",
      "            left, right, stack = [-1] * len(nums), [len(nums)] * len(nums), []",
      "            for i, x in enumerate(nums):",
      "                while stack and ((nums[stack[-1]] > x) if is_min else (nums[stack[-1]] < x)): stack.pop()",
      "                left[i] = stack[-1] if stack else -1",
      "                stack.append(i)",
      "            stack = []",
      "            for i in range(len(nums) - 1, -1, -1):",
      "                while stack and ((nums[stack[-1]] >= nums[i]) if is_min else (nums[stack[-1]] <= nums[i])): stack.pop()",
      "                right[i] = stack[-1] if stack else len(nums)",
      "                stack.append(i)",
      "            return left, right",
      "        def count_pairs(a, b):",
      "            m = min(a, k)",
      "            full = max(0, min(m, k - b + 1))",
      "            total = full * b",
      "            t = m - full",
      "            total += t * (k + 1) - (full + 1 + m) * t // 2",
      "            return total",
      "        def calc(is_min):",
      "            left, right = bounds(is_min)",
      "            total = 0",
      "            for i, x in enumerate(nums):",
      "                a, b = i - left[i], right[i] - i",
      "                total += x * count_pairs(a, b)",
      "            return total",
      "        return calc(True) + calc(False)",
    ],
    liveArgs: (input, params) => [parseNums(input, "nums"), Number(params.k)],
    builder: buildSteps3430,
  },
  2281: simpleProblem({ id: 2281, difficulty: "hard", slug: "sum-of-total-strength-of-wizards", name: "Sum of Total Strength of Wizards", viName: "Tổng sức mạnh wizard", statement: text("Tổng min(subarray) * sum(subarray) trên mọi subarray.", "Sum min(subarray) * sum(subarray) over every subarray."), defaultInput: "1,3,1,2", solver: arrayBuilder(totalStrength) }),
  2617: simpleProblem({ id: 2617, difficulty: "hard", slug: "minimum-number-of-visited-cells-in-a-grid", name: "Minimum Number of Visited Cells in a Grid", viName: "Số ô thăm ít nhất trong grid", statement: text("Từ mỗi ô được nhảy sang phải hoặc xuống tối đa grid[r][c] bước.", "From each cell, jump right or down up to grid[r][c] cells."), defaultInput: "3,4,2,1;4,2,3,1;2,1,0,0", inputLabel: text("grid (hàng cách ;)", "grid (rows separated by ;)"), solver: minimumVisitedCells }),
  2736: simpleProblem({ id: 2736, difficulty: "hard", slug: "maximum-sum-queries", name: "Maximum Sum Queries", viName: "Query tổng lớn nhất", statement: text("Với mỗi query [x,y], tìm max nums1[i]+nums2[i] khi nums1[i]>=x và nums2[i]>=y.", "For each query [x,y], maximize nums1[i]+nums2[i] with nums1[i]>=x and nums2[i]>=y."), defaultInput: "4,3,1,2", inputLabel: text("nums1", "nums1"), extraParams: [{ key: "nums2", type: "string", label: text("nums2", "nums2"), default: "2,4,9,5" }, { key: "queries", type: "string", label: text("queries (x,y; ...)", "queries (x,y; ...)"), default: "4,1;1,3;2,5" }], solver: maximumSumQueries }),
  2818: simpleProblem({ id: 2818, difficulty: "hard", slug: "apply-operations-to-maximize-score", name: "Apply Operations to Maximize Score", viName: "Tối đa hóa score bằng thao tác", statement: text("Dùng prime score và số subarray mà mỗi index thống trị để chọn giá trị lớn nhất.", "Use prime score and each index's dominance span to choose the largest values."), defaultInput: "8,3,9,3,8", extraParams: [{ key: "k", label: text("k", "k"), default: 2, min: 1 }], solver: arrayBuilder(maximumScoreAfterOperations) }),
  2940: simpleProblem({ id: 2940, difficulty: "hard", slug: "find-building-where-alice-and-bob-can-meet", name: "Find Building Where Alice and Bob Can Meet", viName: "Tòa nhà Alice và Bob gặp nhau", statement: text("Với mỗi query, tìm tòa nhà trái nhất mà cả hai có thể tới.", "For each query, find the leftmost building both people can reach."), defaultInput: "6,4,8,5,2,7", inputLabel: text("heights", "heights"), extraParams: [{ key: "queries", type: "string", label: text("queries (a,b; ...)", "queries (a,b; ...)"), default: "0,1;0,2;2,4" }], solver: leftmostBuildingQueries }),
  2945: simpleProblem({ id: 2945, difficulty: "hard", slug: "find-maximum-non-decreasing-array-length", name: "Find Maximum Non-decreasing Array Length", viName: "Độ dài mảng không giảm lớn nhất", statement: text("Gộp subarray thành tổng sao cho dãy tổng không giảm và số đoạn là lớn nhất.", "Merge subarrays into sums so the sum sequence is nondecreasing and has maximum length."), defaultInput: "5,2,2", solver: arrayBuilder(maxNonDecreasingLength) }),
  255: simpleProblem({ id: 255, difficulty: "medium", slug: "verify-preorder-sequence-in-binary-search-tree", name: "Verify Preorder Sequence in Binary Search Tree", viName: "Kiểm tra preorder BST", statement: text("Premium: kiểm tra dãy có thể là preorder của BST không.", "Premium: check whether a sequence can be a BST preorder traversal."), defaultInput: "5,2,1,3,6", tags: [arrayTag, treeTag, monoTag], premium: true, solver: arrayBuilder(bstPreorder) }),
  1762: simpleProblem({ id: 1762, difficulty: "medium", slug: "buildings-with-an-ocean-view", name: "Buildings With an Ocean View", viName: "Tòa nhà nhìn ra biển", statement: text("Premium: trả index các tòa nhà cao hơn mọi tòa bên phải.", "Premium: return indices taller than every building to their right."), defaultInput: "4,2,3,1", premium: true, solver: arrayBuilder(oceanView) }),
  1950: simpleProblem({ id: 1950, difficulty: "medium", slug: "maximum-of-minimum-values-in-all-subarrays", name: "Maximum of Minimum Values in All Subarrays", viName: "Maximum của minimum theo độ dài", statement: text("Premium: với mỗi độ dài window, tìm minimum lớn nhất.", "Premium: for every window length, find the maximum among window minimums."), defaultInput: "10,20,50,10,70,30", premium: true, solver: arrayBuilder(maximumOfMinimums) }),
  2282: simpleProblem({ id: 2282, difficulty: "medium", slug: "number-of-people-that-can-be-seen-in-a-grid", name: "Number of People That Can Be Seen in a Grid", viName: "Số người nhìn thấy trong grid", statement: text("Premium: đếm người nhìn thấy sang phải và xuống dưới trong grid.", "Premium: count visible people to the right and downward in a grid."), defaultInput: "3,1,4;2,5,1;6,2,3", inputLabel: text("heights grid", "heights grid"), premium: true, solver: visiblePeopleGrid }),
  2297: simpleProblem({ id: 2297, difficulty: "medium", slug: "jump-game-viii", name: "Jump Game VIII", viName: "Jump Game VIII", statement: text("Premium: bài graph/DP dùng stack đơn điệu để dựng cạnh nhảy hữu ích.", "Premium: graph/DP problem using monotonic stacks to build useful jump edges."), defaultInput: "3,2,4,4,1", premium: true, solver: arrayBuilder(jumpGameVIII) }),
  2345: simpleProblem({ id: 2345, difficulty: "medium", slug: "finding-the-number-of-visible-mountains", name: "Finding the Number of Visible Mountains", viName: "Đếm núi nhìn thấy", statement: text("Premium: đếm núi không bị núi khác che hoàn toàn.", "Premium: count mountains not fully covered by another mountain."), defaultInput: "2,2;6,3;5,4", inputLabel: text("peaks (x,y; ...)", "peaks (x,y; ...)"), premium: true, solver: visibleMountains }),
  2832: simpleProblem({ id: 2832, difficulty: "medium", slug: "maximal-range-that-each-element-is-maximum-in-it", name: "Maximal Range That Each Element Is Maximum in It", viName: "Range lớn nhất mà mỗi phần tử là maximum", statement: text("Premium: với mỗi index, tìm range lớn nhất nơi nó là maximum.", "Premium: for each index, find the largest range where it is the maximum."), defaultInput: "1,5,4,3,6", premium: true, solver: arrayBuilder(maximalRangeMaximum) }),
  2863: simpleProblem({ id: 2863, difficulty: "medium", slug: "maximum-length-of-semi-decreasing-subarrays", name: "Maximum Length of Semi-Decreasing Subarrays", viName: "Subarray semi-decreasing dài nhất", statement: text("Premium: tìm subarray dài nhất có đầu lớn hơn cuối.", "Premium: find the longest subarray whose first value is greater than its last value."), defaultInput: "7,6,5,8,4", premium: true, solver: arrayBuilder(maximumLengthSemiDecreasing) }),
  1063: simpleProblem({ id: 1063, difficulty: "hard", slug: "number-of-valid-subarrays", name: "Number of Valid Subarrays", viName: "Số valid subarray", statement: text("Premium: đếm subarray mà phần tử đầu là minimum của subarray.", "Premium: count subarrays where the first element is the subarray minimum."), defaultInput: "1,4,2,5,3", premium: true, solver: arrayBuilder(validSubarrays) }),
  2355: simpleProblem({ id: 2355, difficulty: "hard", slug: "maximum-number-of-books-you-can-take", name: "Maximum Number of Books You Can Take", viName: "Số sách tối đa có thể lấy", statement: text("Premium: chọn đoạn sách, mỗi bước sang trái lấy ít hơn ít nhất 1 quyển.", "Premium: choose a book segment where moving left takes at least one fewer book each shelf."), defaultInput: "8,5,2,7,9", premium: true, solver: arrayBuilder(maximumBooks) }),
};
