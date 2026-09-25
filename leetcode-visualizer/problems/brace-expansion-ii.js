const label = (vi, en) => ({ vi, en });

const TRACE_LIMIT = 360;
const SET_PREVIEW_LIMIT = 12;

function parseExpression1096(input) {
  if (typeof input !== "string") throw new Error("expression must be a string");
  const expression = input.trim();
  if (expression.length < 1 || expression.length > 60) {
    throw new Error("expression must contain 1..60 characters");
  }
  if (!/^[a-z{},]+$/.test(expression)) {
    throw new Error("expression may contain only lowercase letters, braces, and commas");
  }
  return expression;
}

function buildSteps1096(input) {
  const expression = parseExpression1096(input);
  const steps = [];
  const frames = [];
  let i = 0;
  let operation = null;
  let left = [];
  let right = [];
  let produced = [];
  let finalAnswer = null;
  let traceCount = 0;
  let shortened = false;

  const ordered = (values) => [...values].sort();
  const preview = (values) => ordered(values).slice(0, SET_PREVIEW_LIMIT);
  const frameSnapshot = () => frames.map((frame, depth) => ({
    depth,
    kind: frame.kind,
    result: preview(frame.result),
    size: frame.result.size,
  }));

  function record(phase, title, line, note, final = false) {
    if (!final && traceCount >= TRACE_LIMIT) {
      shortened = true;
      return;
    }
    traceCount++;
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars: [
        { name: "i", value: i },
        { name: "expression[i]", value: i < expression.length ? expression[i] : "end" },
        { name: "depth", value: frames.length },
      ],
      note,
      final,
      braceExpansion1096View: {
        phase,
        expression,
        index: i,
        currentChar: i < expression.length ? expression[i] : null,
        frames: frameSnapshot(),
        operation,
        left: left.slice(0, SET_PREVIEW_LIMIT),
        right: right.slice(0, SET_PREVIEW_LIMIT),
        produced: produced.slice(0, SET_PREVIEW_LIMIT),
        answer: finalAnswer ? finalAnswer.slice(0, SET_PREVIEW_LIMIT) : null,
        answerSize: finalAnswer ? finalAnswer.length : null,
        shortened,
      },
    });
  }

  function parseUnion() {
    const frame = { kind: "union", result: new Set() };
    frames.push(frame);
    record("union-enter", label("Mở một biểu thức hợp", "Enter a union expression"), 6,
      label("parse_expression xử lý các nhánh được ngăn bởi dấu phẩy.",
        "parse_expression handles alternatives separated by commas."));
    frame.result = parseProduct();
    record("union-seed", label("Nhánh đầu tiên", "First alternative"), 7,
      label("Kết quả hợp bắt đầu bằng tích nối đầu tiên.",
        "Seed the union with the first concatenation term."));
    while (i < expression.length && expression[i] === ",") {
      record("union-check", label("Gặp dấu phẩy: lấy hợp", "Comma means union"), 8,
        label("Dấu phẩy chỉ tách nhánh ở độ sâu ngoặc hiện tại.",
          "A comma separates alternatives only at the current brace depth."));
      i++;
      record("union-comma", label("Bỏ qua dấu phẩy", "Consume the comma"), 9,
        label("Bắt đầu phân tích nhánh tiếp theo.", "Start parsing the next alternative."));
      left = preview(frame.result);
      const term = parseProduct();
      right = preview(term);
      operation = "union";
      for (const word of term) frame.result.add(word);
      produced = preview(frame.result);
      record("union-merge", label("Gộp hai tập hợp", "Merge both sets"), 10,
        label("Phép hợp loại các từ trùng nhau tự động.",
          "Set union removes duplicate words automatically."));
      operation = null;
    }
    record("union-return", label("Trả tập hợp của biểu thức", "Return the expression set"), 11,
      label("Không còn dấu phẩy nào ở độ sâu này.",
        "There are no more commas at this brace depth."));
    frames.pop();
    return frame.result;
  }

  function parseProduct() {
    const frame = { kind: "concat", result: new Set([""]) };
    frames.push(frame);
    record("product-enter", label("Mở một tích nối", "Enter a concatenation term"), 14,
      label("parse_term đọc các thừa số liền nhau cho tới dấu phẩy hoặc ngoặc đóng.",
        "parse_term reads adjacent factors until a comma or closing brace."));
    record("product-identity", label('Khởi tạo bằng {""}', 'Start with {""}'), 15,
      label("Chuỗi rỗng là phần tử đơn vị của phép nối chuỗi.",
        "The empty string is the identity element for concatenation."));
    let factors = 0;
    while (i < expression.length && expression[i] !== "}" && expression[i] !== ",") {
      record("product-check", label("Còn một thừa số", "A factor remains"), 16,
        label("Chữ cái hoặc nhóm ngoặc kế tiếp phải được nối vào tích hiện tại.",
          "The next letter or brace group must be concatenated into the current product."));
      let factor;
      if (expression[i] === "{") {
        record("brace-check", label("Mở nhóm ngoặc", "Open a brace group"), 17,
          label("Nội dung trong ngoặc có thể chứa cả hợp và nối.",
            "A brace group may contain both union and concatenation."));
        i++;
        record("brace-open", label("Đi vào trong ngoặc", "Move inside the braces"), 18,
          label("Con trỏ tiến qua dấu ngoặc mở.", "Advance past the opening brace."));
        factor = parseUnion();
        record("brace-result", label("Đã phân tích nhóm", "Brace group parsed"), 19,
          label("Tập hợp trả về trở thành thừa số tiếp theo.",
            "The returned set becomes the next factor."));
        if (i >= expression.length || expression[i] !== "}") {
          throw new Error("expression has an unmatched opening brace");
        }
        i++;
        record("brace-close", label("Bỏ qua ngoặc đóng", "Consume the closing brace"), 20,
          label("Tiếp tục với thừa số liền sau nhóm này.",
            "Continue with the factor immediately after this group."));
      } else if (/[a-z]/.test(expression[i])) {
        record("letter-check", label(`Đọc chữ '${expression[i]}'`, `Read letter '${expression[i]}'`), 21,
          label("Một chữ cái biểu diễn tập hợp chỉ chứa chính chữ đó.",
            "A letter represents a singleton set containing that letter."));
        factor = new Set([expression[i]]);
        record("letter-set", label("Tạo tập một phần tử", "Create a singleton set"), 22,
          label("Đây là thừa số sẽ nối với mọi chuỗi đang có.",
            "This factor will be appended to every current string."));
        i++;
        record("letter-next", label("Tiến sang ký tự kế", "Advance to the next character"), 23,
          label("Con trỏ luôn chỉ tới token chưa xử lý tiếp theo.",
            "The pointer always identifies the next unprocessed token."));
      } else {
        throw new Error(`unexpected character at index ${i}`);
      }
      factors++;
      left = preview(frame.result);
      right = preview(factor);
      operation = "concat";
      const next = new Set();
      for (const prefix of frame.result) {
        for (const suffix of factor) next.add(prefix + suffix);
      }
      frame.result = next;
      produced = preview(frame.result);
      record("product-merge", label("Lấy tích Descartes rồi nối", "Concatenate the Cartesian product"), 24,
        label("Ghép mỗi chuỗi bên trái với mỗi chuỗi bên phải; Set loại bản sao trùng.",
          "Join every left word with every right word; the set removes duplicates."));
      operation = null;
    }
    if (factors === 0) throw new Error(`expected a letter or brace group at index ${i}`);
    record("product-return", label("Trả kết quả phép nối", "Return the concatenation set"), 25,
      label("Dấu phẩy hoặc ngoặc đóng kết thúc tích nối hiện tại.",
        "A comma or closing brace ends the current concatenation term."));
    frames.pop();
    return frame.result;
  }

  record("start", label("Bắt đầu phân tích", "Start parsing"), 3,
    label("Con trỏ i bắt đầu tại ký tự đầu tiên.", "Pointer i starts at the first character."));
  const result = parseUnion();
  if (i !== expression.length) {
    throw new Error(expression[i] === "}" ? "expression has an unmatched closing brace" : `unexpected token at index ${i}`);
  }
  finalAnswer = ordered(result);
  left = [];
  right = [];
  produced = finalAnswer.slice(0, SET_PREVIEW_LIMIT);
  operation = "sort";
  record("done", label(`Trả về ${finalAnswer.length} từ đã sắp xếp`,
    `Return ${finalAnswer.length} sorted word${finalAnswer.length === 1 ? "" : "s"}`), 27,
  label("Sắp xếp tập kết quả theo thứ tự từ điển.",
    "Sort the final set in lexicographic order."), true);
  steps.at(-1).braceExpansion1096View.shortened = shortened || finalAnswer.length > SET_PREVIEW_LIMIT;
  return { original: expression, answer: finalAnswer, steps };
}

module.exports = {
  1096: {
    id: 1096,
    difficulty: "hard",
    slug: "brace-expansion-ii",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "parsing", vi: "Phân tích cú pháp", en: "Parsing" },
      { key: "recursion", vi: "Đệ quy", en: "Recursion" },
      { key: "set", vi: "Tập hợp", en: "Set" },
    ],
    title: label("Brace Expansion II", "Brace Expansion II"),
    titleVi: label("Khai triển biểu thức ngoặc II", "Brace expansion II"),
    statement: label(
      "Cho biểu thức gồm chữ thường, phép hợp bằng dấu phẩy và phép nối ngầm. Trả về mọi từ khác nhau theo thứ tự từ điển.",
      "Given an expression with lowercase letters, comma unions, and implicit concatenation, return every distinct word in sorted order."
    ),
    defaultInput: "{a,b}{c,{d,e}}",
    inputKind: "string",
    inputLabel: label("expression", "expression"),
    extraParams: [],
    approach: [
      label("Dùng parse_expression cho phép hợp: đọc một term rồi gộp các term sau dấu phẩy.",
        "Use parse_expression for union: read one term, then merge terms after commas."),
      label("Dùng parse_term cho phép nối: nhân các tập hợp của những thừa số liền nhau bằng tích Descartes.",
        "Use parse_term for concatenation: Cartesian-product the sets of adjacent factors."),
      label("Gọi đệ quy khi gặp ngoặc mở; Set tự loại từ trùng, rồi sắp xếp kết quả cuối.",
        "Recurse at an opening brace; sets remove duplicates, then sort the final result."),
    ],
    complexity: {
      time: "O(N · W²)",
      space: "O(N · W)",
      note: label(
        "N là độ dài từ lớn nhất và W là số từ khác nhau được tạo; chi phí thực tế phụ thuộc tổng kích thước output.",
        "N is the longest produced word and W is the number of distinct results; actual cost is output-sensitive."
      ),
    },
    debugMode: "line-by-line",
    code: [
      "class Solution:",
      "    def braceExpansionII(self, expression):",
      "        i = 0",
      "",
      "        def parse_expression():",
      "            nonlocal i",
      "            result = parse_term()",
      "            while i < len(expression) and expression[i] == ',':",
      "                i += 1",
      "                result |= parse_term()",
      "            return result",
      "",
      "        def parse_term():",
      "            nonlocal i",
      "            result = {''}",
      "            while i < len(expression) and expression[i] not in '},':",
      "                if expression[i] == '{':",
      "                    i += 1",
      "                    factor = parse_expression()",
      "                    i += 1",
      "                else:",
      "                    factor = {expression[i]}",
      "                    i += 1",
      "                result = {a + b for a in result for b in factor}",
      "            return result",
      "",
      "        return sorted(parse_expression())",
    ],
    builder: buildSteps1096,
    liveArgs(input) {
      return [parseExpression1096(input)];
    },
  },
};
