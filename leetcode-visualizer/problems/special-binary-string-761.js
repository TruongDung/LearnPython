// LeetCode 761 — Special Binary String (recursive decomposition + descending sort).

const label = (vi, en) => ({ vi, en });
const SPECIAL_BINARY_761_MAX_LENGTH = 50;
const SPECIAL_BINARY_761_TRACE_LIMIT = 600;

function parseSpecialBinary761Input(input) {
  if (typeof input !== "string") {
    throw new TypeError("Special Binary String input must be a string.");
  }

  const value = input.trim();
  if (value.length < 1 || value.length > SPECIAL_BINARY_761_MAX_LENGTH) {
    throw new RangeError(`Special Binary String input must contain 1..${SPECIAL_BINARY_761_MAX_LENGTH} bits.`);
  }
  if (!/^[01]+$/.test(value)) {
    throw new TypeError("Special Binary String input may contain only 0 and 1.");
  }

  let balance = 0;
  for (let index = 0; index < value.length; index++) {
    balance += value[index] === "1" ? 1 : -1;
    if (balance < 0) {
      throw new RangeError(`Every prefix must contain at least as many 1s as 0s (failed at index ${index}).`);
    }
  }
  if (balance !== 0) {
    throw new RangeError("Special Binary String input must contain the same number of 1s and 0s.");
  }

  return value;
}

function buildSteps761(input) {
  const original = parseSpecialBinary761Input(input);
  const steps = [];
  const callStack = [];
  const counters = {
    calls: 0,
    scannedBits: 0,
    boundaries: 0,
    components: 0,
    sorts: 0,
  };
  let nextCallId = 1;
  let finalAnswer = null;
  let shortened = false;

  const copyComponent = (component) => component ? {
    discovery: component.discovery,
    span: [...component.span],
    source: component.source,
    rawInner: component.rawInner,
    optimizedInner: component.optimizedInner,
    wrapped: component.wrapped,
  } : null;

  const copyFrame = (frame) => ({
    id: frame.id,
    parentId: frame.parentId,
    depth: frame.depth,
    input: frame.input,
    span: [...frame.span],
    index: frame.index,
    absoluteIndex: frame.index === null ? null : frame.offset + frame.index,
    bit: frame.bit,
    balance: frame.balance,
    componentStart: frame.componentStart,
    status: frame.status,
    parts: frame.parts.map(copyComponent),
    pending: copyComponent(frame.pending),
    result: frame.result,
  });

  function record(frame, phase, event, title, line, note, final = false) {
    if (!final && steps.length >= SPECIAL_BINARY_761_TRACE_LIMIT) {
      shortened = true;
      return;
    }

    const components = frame.parts.map(copyComponent);
    const activeSpan = frame.index === null
      ? null
      : [frame.offset + frame.componentStart, frame.offset + frame.index];
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars: [
        { name: "depth", value: frame.depth },
        { name: "i", value: frame.index === null ? "—" : frame.index },
        { name: "balance", value: frame.balance },
        { name: "parts", value: frame.parts.map((part) => part.wrapped).join(" | ") || "[]" },
      ],
      note,
      final,
      specialBinary761View: {
        phase,
        event,
        original,
        callId: frame.id,
        depth: frame.depth,
        input: frame.input,
        callSpan: [...frame.span],
        index: frame.index,
        absoluteIndex: frame.index === null ? null : frame.offset + frame.index,
        currentBit: frame.bit,
        balance: frame.balance,
        balanceHistory: frame.balanceHistory.slice(),
        componentStart: frame.componentStart,
        activeSpan,
        stack: callStack.map(copyFrame),
        components,
        pending: copyComponent(frame.pending),
        orderBefore: frame.orderBefore ? [...frame.orderBefore] : null,
        orderAfter: frame.orderAfter ? [...frame.orderAfter] : null,
        result: frame.result,
        answer: finalAnswer,
        counters: { ...counters },
        shortened,
      },
    });
  }

  function optimize(segment, offset, parentId = null) {
    const frame = {
      id: nextCallId++,
      parentId,
      depth: callStack.length,
      input: segment,
      offset,
      span: segment.length ? [offset, offset + segment.length - 1] : [offset, offset - 1],
      index: null,
      bit: null,
      balance: 0,
      balanceHistory: Array(segment.length).fill(null),
      componentStart: 0,
      status: "enter",
      parts: [],
      pending: null,
      orderBefore: null,
      orderAfter: null,
      result: null,
    };
    counters.calls++;
    callStack.push(frame);

    record(frame, "decompose", "call-enter",
      label(`Gọi đệ quy ở độ sâu ${frame.depth}`, `Enter recursive call at depth ${frame.depth}`), 2,
      label(
        segment ? `Tối ưu chuỗi con ${segment}.` : "Chuỗi con rỗng là trường hợp cơ sở.",
        segment ? `Optimize substring ${segment}.` : "The empty substring is the base case.",
      ));

    frame.status = "collect";
    record(frame, "decompose", "parts-init",
      label("Tạo danh sách thành phần", "Create the component list"), 3,
      label("Mỗi thành phần đặc biệt cấp cao nhất sẽ được lưu đúng một lần.",
        "Each top-level special component will be stored exactly once."));
    record(frame, "decompose", "pointers-init",
      label("Đặt balance và start bằng 0", "Set balance and start to zero"), 4,
      label("balance biến bit 1 thành ngoặc mở và bit 0 thành ngoặc đóng.",
        "Balance treats bit 1 as an opening bracket and bit 0 as a closing bracket."));

    for (let index = 0; index < segment.length; index++) {
      frame.index = index;
      frame.bit = segment[index];
      frame.status = "scan";
      counters.scannedBits++;
      record(frame, "scan", "scan-bit",
        label(`Đọc bit ${segment[index]} tại i = ${index}`, `Read bit ${segment[index]} at i = ${index}`), 5,
        label("Duyệt chuỗi con từ trái sang phải.", "Scan the current substring from left to right."));

      frame.balance += segment[index] === "1" ? 1 : -1;
      frame.balanceHistory[index] = frame.balance;
      record(frame, "scan", "balance-update",
        label(`Cập nhật balance thành ${frame.balance}`, `Update balance to ${frame.balance}`), 6,
        label(
          segment[index] === "1" ? "Bit 1 tăng độ sâu lồng nhau." : "Bit 0 đóng một mức lồng nhau.",
          segment[index] === "1" ? "Bit 1 increases the nesting depth." : "Bit 0 closes one nesting level.",
        ));

      if (frame.balance !== 0) {
        record(frame, "scan", "inside-component",
          label("Thành phần hiện tại chưa đóng", "The current component is still open"), 7,
          label("balance khác 0 nên tiếp tục quét cùng thành phần.",
            "A nonzero balance means the same component continues."));
        continue;
      }

      counters.boundaries++;
      const source = segment.slice(frame.componentStart, index + 1);
      const rawInner = segment.slice(frame.componentStart + 1, index);
      frame.pending = {
        discovery: frame.parts.length,
        span: [offset + frame.componentStart, offset + index],
        source,
        rawInner,
        optimizedInner: null,
        wrapped: null,
      };
      frame.status = "boundary";
      record(frame, "recurse", "component-boundary",
        label(`Đóng thành phần ${source}`, `Close component ${source}`), 7,
        label("balance trở về 0: đây là một chuỗi đặc biệt cấp cao nhất hoàn chỉnh.",
          "Balance returned to zero, completing one top-level special component."));

      frame.status = "waiting";
      record(frame, "recurse", "child-call",
        label(`Tối ưu phần trong ${rawInner || "ε"}`, `Optimize interior ${rawInner || "ε"}`), 8,
        label("Bỏ cặp 1...0 ngoài cùng và giải phần bên trong bằng cùng quy tắc.",
          "Remove the outer 1...0 pair and solve the interior with the same rule."));
      const optimizedInner = optimize(rawInner, offset + frame.componentStart + 1, frame.id);

      frame.pending.optimizedInner = optimizedInner;
      frame.status = "child-return";
      record(frame, "recurse", "child-return",
        label(`Lời gọi con trả về ${optimizedInner || "ε"}`, `Child call returns ${optimizedInner || "ε"}`), 8,
        label("Kết quả con đã lớn nhất theo thứ tự từ điển trong phần bên trong.",
          "The child result is already lexicographically largest inside this component."));

      frame.pending.wrapped = `1${optimizedInner}0`;
      frame.parts.push(frame.pending);
      counters.components++;
      frame.status = "wrap";
      record(frame, "rebuild", "wrap-component",
        label(`Bọc lại thành ${frame.pending.wrapped}`, `Wrap back into ${frame.pending.wrapped}`), 9,
        label("Khôi phục cặp bit ngoài cùng và giữ nguyên các thành phần trùng nhau.",
          "Restore the outer bit pair and preserve duplicate components."));

      frame.componentStart = index + 1;
      frame.status = "advance";
      record(frame, "decompose", "advance-start",
        label("Chuyển start sang thành phần kế", "Advance start to the next component"), 10,
        label("Mọi bit tới i đã thuộc về một thành phần hoàn chỉnh.",
          "Every bit through i now belongs to a completed component."));
      frame.pending = null;
    }

    frame.orderBefore = frame.parts.map((part) => part.wrapped);
    frame.status = "sort";
    counters.sorts++;
    record(frame, "sort", "sort-start",
      label("Sắp xếp các thành phần giảm dần", "Sort components in descending order"), 11,
      label("Đổi chỗ hai thành phần đặc biệt kề nhau là phép biến đổi hợp lệ.",
        "Swapping adjacent special components is an allowed transformation."));

    frame.parts.sort((left, right) => {
      if (left.wrapped === right.wrapped) return left.discovery - right.discovery;
      return left.wrapped < right.wrapped ? 1 : -1;
    });
    frame.orderAfter = frame.parts.map((part) => part.wrapped);
    record(frame, "sort", "sort-complete",
      label("Đã đặt thành phần lớn nhất trước", "Largest components now come first"), 11,
      label("Thứ tự giảm dần tạo chuỗi ghép lớn nhất tại độ sâu hiện tại.",
        "Descending order produces the largest concatenation at this depth."));

    frame.result = frame.orderAfter.join("");
    frame.status = "return";
    const isRoot = frame.depth === 0;
    if (isRoot) finalAnswer = frame.result;
    record(frame, "return", "call-return",
      label(`Trả về ${frame.result || "ε"}`, `Return ${frame.result || "ε"}`), 12,
      label(
        isRoot ? "Đây là chuỗi đặc biệt lớn nhất có thể tạo được." : "Kết quả này quay lại thành phần của lời gọi cha.",
        isRoot ? "This is the largest special string that can be formed." : "This result returns to the parent component.",
      ), isRoot);

    callStack.pop();
    return frame.result;
  }

  const answer = optimize(original, 0);
  if (steps.length && shortened) steps.at(-1).specialBinary761View.shortened = true;
  return { original, answer, steps };
}

module.exports = {
  761: {
    id: 761,
    difficulty: "hard",
    slug: "special-binary-string",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "recursion", vi: "Đệ quy", en: "Recursion" },
      { key: "divide-and-conquer", vi: "Chia để trị", en: "Divide and Conquer" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: label("Special Binary String", "Special Binary String"),
    titleVi: label("Chuỗi nhị phân đặc biệt", "Special binary string"),
    statement: label(
      "Chuỗi nhị phân đặc biệt có số bit 1 bằng số bit 0 và trong mọi tiền tố, số bit 1 không ít hơn số bit 0. Hãy đổi chỗ các chuỗi con đặc biệt liên tiếp để tạo chuỗi lớn nhất theo thứ tự từ điển.",
      "A special binary string has equally many 1s and 0s, and every prefix has at least as many 1s as 0s. Swap consecutive special substrings to form the lexicographically largest result.",
    ),
    defaultInput: "11011000",
    inputKind: "string",
    inputLabel: label("Chuỗi đặc biệt s", "Special string s"),
    extraParams: [],
    approach: [
      label("Xem 1 là ngoặc mở và 0 là ngoặc đóng; balance = 0 chia chuỗi thành các thành phần đặc biệt cấp cao nhất.",
        "Treat 1 as an opening bracket and 0 as a closing bracket; balance = 0 splits the string into top-level special components."),
      label("Gọi đệ quy cho phần bên trong mỗi cặp 1...0 rồi bọc kết quả lại.",
        "Recursively maximize the interior of every outer 1...0 pair, then wrap it again."),
      label("Sắp xếp các thành phần đã tối ưu theo thứ tự giảm dần và nối chúng lại.",
        "Sort the optimized components in descending order and concatenate them."),
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: label(
        "So sánh/sắp xếp chuỗi và các lát cắt đệ quy có thể tốn bậc hai; độ sâu đệ quy tối đa O(n).",
        "String comparisons, sorting, and recursive slices can take quadratic work and storage; recursion depth is O(n).",
      ),
    },
    debugMode: "line-by-line",
    code: [
      "class Solution:",
      "    def makeLargestSpecial(self, s: str) -> str:",
      "        parts = []",
      "        balance = start = 0",
      "        for i, bit in enumerate(s):",
      "            balance += 1 if bit == '1' else -1",
      "            if balance == 0:",
      "                inner = self.makeLargestSpecial(s[start + 1:i])",
      "                parts.append('1' + inner + '0')",
      "                start = i + 1",
      "        parts.sort(reverse=True)",
      "        return ''.join(parts)",
    ],
    builder: buildSteps761,
    liveArgs(input) {
      return [parseSpecialBinary761Input(input)];
    },
  },
};
