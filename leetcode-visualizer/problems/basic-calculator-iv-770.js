"use strict";

// LeetCode 770 — Basic Calculator IV.
// Recursive descent handles precedence while sparse maps combine like monomials.

const label = (vi, en) => ({ vi, en });

const TRACE_LIMIT_770 = 480;
const TOKEN_LIMIT_770 = 260;
const TERM_PREVIEW_LIMIT_770 = 12;
const ANSWER_PREVIEW_LIMIT_770 = 24;
const FRAME_PREVIEW_LIMIT_770 = 24;
const INTERMEDIATE_TERM_LIMIT_770 = 1500;

function parseCsv770(raw, name) {
  if (raw === undefined || raw === null || raw === "") return [];
  if (typeof raw !== "string") throw new Error(`${name} must be a comma-separated string`);
  const values = raw.split(",").map((value) => value.trim());
  if (values.some((value) => value === "")) {
    throw new Error(`${name} cannot contain an empty item`);
  }
  return values;
}

function tokenize770(expression) {
  const tokens = [];
  let cursor = 0;

  while (cursor < expression.length) {
    const character = expression[cursor];
    if (/\s/.test(character)) {
      cursor += 1;
      continue;
    }

    const start = cursor;
    if (character >= "0" && character <= "9") {
      cursor += 1;
      while (cursor < expression.length && expression[cursor] >= "0" && expression[cursor] <= "9") {
        cursor += 1;
      }
      tokens.push({ type: "number", value: expression.slice(start, cursor), start, end: cursor });
    } else if (character >= "a" && character <= "z") {
      cursor += 1;
      while (cursor < expression.length && expression[cursor] >= "a" && expression[cursor] <= "z") {
        cursor += 1;
      }
      tokens.push({ type: "variable", value: expression.slice(start, cursor), start, end: cursor });
    } else if (character === "+" || character === "-" || character === "*") {
      cursor += 1;
      tokens.push({ type: "operator", value: character, start, end: cursor });
    } else if (character === "(" || character === ")") {
      cursor += 1;
      tokens.push({ type: character === "(" ? "lparen" : "rparen", value: character, start, end: cursor });
    } else {
      throw new Error(`unexpected character '${character}' at index ${cursor}`);
    }

    if (tokens.length > TOKEN_LIMIT_770) {
      throw new Error(`expression may contain at most ${TOKEN_LIMIT_770} tokens`);
    }
  }

  return tokens;
}

function parseBasicCalculatorIV770Input(input, params = {}) {
  if (typeof input !== "string") throw new Error("expression must be a string");
  const expression = input.trim();
  if (expression.length < 1 || expression.length > 250) {
    throw new Error("expression must contain 1..250 characters");
  }

  const evalvars = parseCsv770(params.evalvars, "evalvars");
  const rawEvalints = parseCsv770(params.evalints, "evalints");
  if (evalvars.length > 40) throw new Error("at most 40 substitutions are supported");
  if (evalvars.some((variable) => !/^[a-z]+$/.test(variable))) {
    throw new Error("evalvars must contain lowercase variable names separated by commas");
  }
  if (new Set(evalvars).size !== evalvars.length) {
    throw new Error("evalvars cannot contain duplicate variable names");
  }

  const evalints = rawEvalints.map((rawValue) => {
    if (!/^[+-]?\d+$/.test(rawValue)) {
      throw new Error("evalints must contain integers separated by commas");
    }
    const value = Number(rawValue);
    if (!Number.isSafeInteger(value)) throw new Error("evalints must be safe integers");
    return value;
  });
  if (evalvars.length !== evalints.length) {
    throw new Error("evalvars and evalints must contain the same number of items");
  }

  const tokens = tokenize770(expression);
  if (tokens.length === 0) throw new Error("expression must contain a number or variable");

  return { expression, evalvars, evalints, tokens };
}

function monomialKey770(variables) {
  return variables.join("*");
}

function variablesFromKey770(key) {
  return key === "" ? [] : key.split("*");
}

function checkedCoefficient770(value) {
  if (!Number.isSafeInteger(value)) {
    throw new Error("a polynomial coefficient exceeded JavaScript's safe integer range");
  }
  return value;
}

function constantPolynomial770(value) {
  return value === 0 ? new Map() : new Map([["", value]]);
}

function variablePolynomial770(variable) {
  return new Map([[variable, 1]]);
}

function addPolynomials770(left, right, sign = 1) {
  const result = new Map(left);
  for (const [monomial, coefficient] of right) {
    const next = checkedCoefficient770((result.get(monomial) || 0) + sign * coefficient);
    if (next === 0) result.delete(monomial);
    else result.set(monomial, next);
  }
  return result;
}

function multiplyPolynomials770(left, right) {
  if (left.size === 0 || right.size === 0) return new Map();
  const result = new Map();

  for (const [leftKey, leftCoefficient] of left) {
    const leftVariables = variablesFromKey770(leftKey);
    for (const [rightKey, rightCoefficient] of right) {
      const variables = [...leftVariables, ...variablesFromKey770(rightKey)].sort();
      const monomial = monomialKey770(variables);
      const product = checkedCoefficient770(leftCoefficient * rightCoefficient);
      const next = checkedCoefficient770((result.get(monomial) || 0) + product);
      if (next === 0) result.delete(monomial);
      else result.set(monomial, next);
      if (result.size > INTERMEDIATE_TERM_LIMIT_770) {
        throw new Error(`an intermediate polynomial exceeded ${INTERMEDIATE_TERM_LIMIT_770} terms`);
      }
    }
  }

  return result;
}

function compareMonomials770(left, right) {
  if (left.length !== right.length) return right.length - left.length;
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }
  return 0;
}

function polynomialTerms770(polynomial) {
  return [...polynomial.entries()]
    .filter(([, coefficient]) => coefficient !== 0)
    .map(([key, coefficient]) => {
      const variables = variablesFromKey770(key);
      return {
        coefficient,
        variables,
        degree: variables.length,
        key,
        text: variables.length ? [coefficient, ...variables].join("*") : String(coefficient),
      };
    })
    .sort((left, right) => compareMonomials770(left.variables, right.variables));
}

function formatPolynomial770(polynomial) {
  return polynomialTerms770(polynomial).map((term) => term.text);
}

function buildSteps770(input, params = {}) {
  const { expression, evalvars, evalints, tokens } = parseBasicCalculatorIV770Input(input, params);
  const substitutions = new Map(evalvars.map((variable, index) => [variable, evalints[index]]));
  const substitutionEntries = evalvars.map((variable, index) => ({ variable, value: evalints[index] }));
  const steps = [];
  const frames = [];
  let tokenIndex = 0;
  let operation = null;
  let finalAnswer = null;
  let traceShortened = false;
  let previewShortened = false;

  function previewPolynomial(polynomial) {
    const terms = polynomialTerms770(polynomial);
    if (terms.length > TERM_PREVIEW_LIMIT_770) previewShortened = true;
    return terms.slice(0, TERM_PREVIEW_LIMIT_770);
  }

  function snapshotFrames() {
    const visibleFrames = frames.slice(-FRAME_PREVIEW_LIMIT_770);
    if (visibleFrames.length < frames.length) previewShortened = true;
    return visibleFrames.map((frame, visibleIndex) => ({
      depth: frames.length - visibleFrames.length + visibleIndex,
      kind: frame.kind,
      start: frame.start,
      result: previewPolynomial(frame.result),
      termCount: frame.result.size,
    }));
  }

  function makeOperation(type, left, right, result, detail = "") {
    return {
      type,
      detail,
      left: previewPolynomial(left),
      right: previewPolynomial(right),
      result: previewPolynomial(result),
      leftCount: left.size,
      rightCount: right.size,
      resultCount: result.size,
    };
  }

  function record(phase, title, line, note, final = false) {
    if (!final && steps.length >= TRACE_LIMIT_770) {
      traceShortened = true;
      return;
    }

    const currentToken = tokens[tokenIndex] || null;
    const frameViews = snapshotFrames();
    const answerPreview = finalAnswer ? finalAnswer.slice(0, ANSWER_PREVIEW_LIMIT_770) : null;
    const answerWasShortened = Boolean(finalAnswer && finalAnswer.length > ANSWER_PREVIEW_LIMIT_770);
    const activeFrame = frames[frames.length - 1] || null;

    steps.push({
      title,
      arr: [],
      sub: tokens.map((token) => token.value),
      highlight: currentToken ? [tokenIndex] : [],
      mark: [],
      codeLines: [line],
      vars: [
        { name: "i", value: tokenIndex },
        { name: "tokens[i]", value: currentToken ? JSON.stringify(currentToken.value) : "end" },
        { name: "parser depth", value: frames.length },
        { name: "active terms", value: activeFrame ? activeFrame.result.size : 0 },
      ],
      note,
      final,
      calculator770View: {
        phase,
        expression,
        tokens,
        index: tokenIndex,
        frames: frameViews,
        omittedFrames: Math.max(0, frames.length - frameViews.length),
        substitutions: substitutionEntries,
        operation,
        answer: answerPreview,
        answerCount: finalAnswer ? finalAnswer.length : null,
        shortened: traceShortened || previewShortened || answerWasShortened,
      },
    });
  }

  function expectedFactorError() {
    const token = tokens[tokenIndex];
    if (!token) return new Error("expression ended while an operand was expected");
    return new Error(`expected a number, variable, or '(' before '${token.value}'`);
  }

  function parseExpression() {
    const frame = { kind: "expression", start: tokenIndex, result: new Map() };
    frames.push(frame);
    record("expression-enter", label("Mở biểu thức cộng/trừ", "Enter an addition/subtraction expression"), 23,
      label("parse_expression là tầng ưu tiên thấp nhất: nó ghép các term bằng + hoặc -.",
        "parse_expression is the lowest-precedence layer: it combines terms with + or -."));

    let result = parseTerm();
    frame.result = result;
    record("expression-seed", label("Nhận term đầu tiên", "Seed with the first term"), 25,
      label("Term đầu tiên trở thành đa thức đang tích lũy.", "The first term becomes the accumulated polynomial."));

    while (tokenIndex < tokens.length && (tokens[tokenIndex].value === "+" || tokens[tokenIndex].value === "-")) {
      const operator = tokens[tokenIndex].value;
      record("expression-operator", label(`Gặp '${operator}'`, `Read '${operator}'`), 26,
        label("Toán tử cộng/trừ được xử lý sau mọi phép nhân trong term kế tiếp.",
          "Addition/subtraction waits until every multiplication in the next term is complete."));
      tokenIndex += 1;
      record("expression-consume", label("Lấy toán tử", "Consume the operator"), 28,
        label("Con trỏ chuyển sang toán hạng bên phải.", "The pointer advances to the right operand."));

      const left = result;
      const right = parseTerm();
      result = addPolynomials770(left, right, operator === "+" ? 1 : -1);
      frame.result = result;
      operation = makeOperation(operator === "+" ? "add" : "subtract", left, right, result, operator);
      record("expression-combine", label(operator === "+" ? "Gộp các hạng tử đồng dạng" : "Trừ và gộp hạng tử đồng dạng",
        operator === "+" ? "Combine like terms" : "Subtract and combine like terms"), 29,
      label("Các monomial giống nhau dùng cùng key nên hệ số được cộng trực tiếp; hệ số 0 bị loại.",
        "Equal monomials share one key, so coefficients combine directly and zero coefficients disappear."));
      operation = null;
    }

    record("expression-return", label("Trả đa thức của biểu thức", "Return the expression polynomial"), 30,
      label("Không còn dấu + hoặc - ở độ sâu ngoặc hiện tại.",
        "No addition or subtraction remains at the current parenthesis depth."));
    frames.pop();
    return result;
  }

  function parseTerm() {
    const frame = { kind: "term", start: tokenIndex, result: new Map() };
    frames.push(frame);
    record("term-enter", label("Mở một term nhân", "Enter a multiplication term"), 32,
      label("parse_term có ưu tiên cao hơn: nó hoàn tất chuỗi phép nhân trước khi trả về.",
        "parse_term has higher precedence: it completes a multiplication chain before returning."));

    let result = parseFactor();
    frame.result = result;
    record("term-seed", label("Nhận factor đầu tiên", "Seed with the first factor"), 34,
      label("Factor đầu tiên khởi tạo tích hiện tại.", "The first factor initializes the current product."));

    while (tokenIndex < tokens.length && tokens[tokenIndex].value === "*") {
      record("term-operator", label("Gặp phép nhân", "Read multiplication"), 35,
        label("Phép nhân phân phối mọi hạng tử bên trái với mọi hạng tử bên phải.",
          "Multiplication distributes every left term across every right term."));
      tokenIndex += 1;
      record("term-consume", label("Lấy dấu '*'", "Consume '*'"), 36,
        label("Con trỏ chuyển tới factor kế tiếp.", "The pointer advances to the next factor."));

      const left = result;
      const right = parseFactor();
      result = multiplyPolynomials770(left, right);
      frame.result = result;
      operation = makeOperation("multiply", left, right, result, "*");
      record("term-multiply", label("Nhân rồi chuẩn hóa monomial", "Multiply and canonicalize monomials"), 37,
        label("Ghép và sắp xếp tên biến trong mỗi cặp; các tích tạo cùng monomial sẽ cộng hệ số.",
          "Merge and sort each pair's variables; products that create the same monomial combine coefficients."));
      operation = null;
    }

    record("term-return", label("Trả đa thức của term", "Return the term polynomial"), 38,
      label("Token kế tiếp không phải '*', nên chuỗi nhân đã hoàn tất.",
        "The next token is not '*', so this multiplication chain is complete."));
    frames.pop();
    return result;
  }

  function parseFactor() {
    const frame = { kind: "factor", start: tokenIndex, result: new Map() };
    frames.push(frame);
    const token = tokens[tokenIndex];
    if (!token || token.value === ")" || token.value === "*") {
      frames.pop();
      throw expectedFactorError();
    }

    record("factor-read", label(`Đọc factor '${token.value}'`, `Read factor '${token.value}'`), 42,
      label("Factor là số, biến, dấu một ngôi hoặc một biểu thức trong ngoặc.",
        "A factor is a number, variable, unary sign, or parenthesized expression."));

    if (token.value === "+" || token.value === "-") {
      const sign = token.value;
      tokenIndex += 1;
      record("factor-unary", label(`Lấy dấu một ngôi '${sign}'`, `Consume unary '${sign}'`), 44,
        label("Dấu một ngôi áp dụng cho toàn bộ factor ngay sau nó.",
          "A unary sign applies to the complete factor that follows."));
      const inner = parseFactor();
      const result = sign === "+" ? inner : addPolynomials770(new Map(), inner, -1);
      frame.result = result;
      operation = makeOperation(sign === "+" ? "identity" : "negate", new Map(), inner, result, sign);
      record("factor-unary-result", label(sign === "+" ? "Giữ nguyên đa thức" : "Đổi dấu mọi hệ số",
        sign === "+" ? "Keep the polynomial" : "Negate every coefficient"), 46,
      label("Dấu trừ một ngôi nhân mọi hệ số với -1.", "Unary minus multiplies every coefficient by -1."));
      operation = null;
      frames.pop();
      return result;
    }

    if (token.value === "(") {
      record("factor-open", label("Mở biểu thức con", "Open a sub-expression"), 47,
        label("Ngoặc tạo một lời gọi parse_expression đệ quy.", "Parentheses trigger a recursive parse_expression call."));
      tokenIndex += 1;
      record("factor-inside", label("Đi vào trong ngoặc", "Move inside the parentheses"), 48,
        label("Con trỏ đứng tại token đầu tiên của biểu thức con.",
          "The pointer now sits on the sub-expression's first token."));
      const result = parseExpression();
      const closing = tokens[tokenIndex];
      if (!closing || closing.value !== ")") {
        frames.pop();
        throw new Error(`missing ')' for '(' at character ${token.start}`);
      }
      frame.result = result;
      operation = makeOperation("group", new Map(), new Map(), result, "()");
      record("factor-group", label("Biểu thức con đã hoàn tất", "Sub-expression complete"), 49,
        label("Đa thức bên trong trở thành một factor duy nhất.",
          "The polynomial inside becomes one complete factor."));
      tokenIndex += 1;
      record("factor-close", label("Lấy dấu ')'", "Consume ')'"), 50,
        label("Rời ngoặc và tiếp tục ở cùng tầng term bên ngoài.",
          "Leave the parentheses and resume the surrounding term."));
      operation = null;
      frames.pop();
      return result;
    }

    tokenIndex += 1;
    let result;
    if (token.type === "number") {
      const value = Number(token.value);
      if (!Number.isSafeInteger(value)) throw new Error("numeric literals must be safe integers");
      result = constantPolynomial770(value);
      operation = makeOperation("literal", new Map(), new Map(), result, token.value);
      frame.result = result;
      record("factor-number", label(`Tạo hằng số ${value}`, `Create constant ${value}`), 55,
        label("Monomial rỗng () biểu diễn một hằng số.", "The empty monomial () represents a constant."));
    } else if (token.type === "variable") {
      if (substitutions.has(token.value)) {
        const value = substitutions.get(token.value);
        result = constantPolynomial770(value);
        operation = makeOperation("substitute", variablePolynomial770(token.value), new Map(), result,
          `${token.value}=${value}`);
        frame.result = result;
        record("factor-substitute", label(`Thay ${token.value} = ${value}`, `Substitute ${token.value} = ${value}`), 58,
          label("Biến đã cho giá trị trở thành hằng số trước khi thực hiện đại số.",
            "An evaluated variable becomes a constant before polynomial arithmetic."));
      } else {
        result = variablePolynomial770(token.value);
        operation = makeOperation("variable", new Map(), new Map(), result, token.value);
        frame.result = result;
        record("factor-variable", label(`Giữ biến ${token.value}`, `Keep variable ${token.value}`), 59,
          label("Biến chưa được thay thế tạo monomial bậc 1 với hệ số 1.",
            "An unresolved variable creates a degree-one monomial with coefficient 1."));
      }
    } else {
      frames.pop();
      throw expectedFactorError();
    }

    operation = null;
    frames.pop();
    return result;
  }

  record("start", label("Nạp bảng thay thế", "Load substitutions"), 5,
    label("Ghép evalvars và evalints thành bảng tra cứu biến → số.",
      "Zip evalvars and evalints into a variable-to-number lookup."));
  record("tokenize", label(`Tách thành ${tokens.length} token`, `Tokenize into ${tokens.length} tokens`), 6,
    label("Số nhiều chữ số và tên biến nhiều ký tự đều được giữ thành một token.",
      "Multi-digit numbers and multi-character variable names each remain one token."));

  const polynomial = parseExpression();
  if (tokenIndex !== tokens.length) {
    const token = tokens[tokenIndex];
    if (token.value === ")") throw new Error(`unmatched ')' at character ${token.start}`);
    throw new Error(`unexpected token '${token.value}' at character ${token.start}`);
  }

  finalAnswer = formatPolynomial770(polynomial);
  operation = makeOperation("sort", polynomial, new Map(), polynomial, "degree ↓, lexicographic ↑");
  record("done", label(`Trả về ${finalAnswer.length} hạng tử`, `Return ${finalAnswer.length} term${finalAnswer.length === 1 ? "" : "s"}`), 63,
    label("Sắp xếp theo bậc giảm dần, rồi thứ tự từ điển của tuple biến; mỗi chuỗi luôn bắt đầu bằng hệ số.",
      "Sort by descending degree, then by the variable tuple; every output string starts with its coefficient."), true);

  return {
    original: expression,
    substitutions: Object.fromEntries(substitutions),
    answer: finalAnswer,
    steps,
  };
}

module.exports = {
  770: {
    id: 770,
    difficulty: "hard",
    slug: "basic-calculator-iv",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "parsing", vi: "Phân tích cú pháp", en: "Parsing" },
      { key: "recursion", vi: "Đệ quy", en: "Recursion" },
      { key: "hashmap", vi: "Bảng băm", en: "Hash Map" },
      { key: "math", vi: "Toán học", en: "Math" },
    ],
    title: label("Basic Calculator IV", "Basic Calculator IV"),
    titleVi: label("Máy tính cơ bản IV", "Basic Calculator IV"),
    statement: label(
      "Rút gọn biểu thức đa thức có +, -, *, ngoặc và phép thay biến. Trả các hạng tử khác 0 theo bậc giảm dần rồi thứ tự từ điển.",
      "Simplify a polynomial expression with +, -, *, parentheses, and variable substitutions. Return nonzero terms by descending degree, then lexicographically."
    ),
    defaultInput: "(e + 8) * (e - 8)",
    inputKind: "string",
    inputLabel: label("expression", "expression"),
    extraParams: [
      {
        key: "evalvars",
        label: label("evalvars (phân cách bằng dấu phẩy, có thể trống)", "evalvars (comma-separated, optional)"),
        type: "string",
        default: "",
        allowEmpty: true,
      },
      {
        key: "evalints",
        label: label("evalints (phân cách bằng dấu phẩy, có thể trống)", "evalints (comma-separated, optional)"),
        type: "string",
        default: "",
        allowEmpty: true,
      },
    ],
    approach: [
      label("Tokenize số, biến và toán tử; dùng recursive descent với ba tầng expression → term → factor để giữ đúng ưu tiên.",
        "Tokenize numbers, variables, and operators; use expression → term → factor recursive descent to preserve precedence."),
      label("Biểu diễn đa thức bằng Map: key là tuple biến đã sắp xếp, value là hệ số; tuple rỗng là hằng số.",
        "Represent a polynomial with a map from sorted variable tuples to coefficients; the empty tuple is a constant."),
      label("Cộng/trừ gộp cùng key. Nhân dùng tích Descartes các hạng tử, nối rồi sắp xếp tuple biến để tự gộp hạng đồng dạng.",
        "Addition/subtraction merges equal keys. Multiplication takes a Cartesian product, then sorts variable tuples so like terms merge."),
      label("Loại hệ số 0, sắp xếp theo bậc giảm dần rồi tuple từ điển, và serialize hệ số trước các biến.",
        "Drop zero coefficients, sort by descending degree then lexicographic tuple, and serialize the coefficient before its variables."),
    ],
    complexity: {
      time: "O(n + Σ L·R·d log d)",
      space: "O(P·d)",
      note: label(
        "L và R là số hạng tử trong hai toán hạng của mỗi phép nhân, d là bậc monomial và P là số monomial khác nhau lớn nhất.",
        "L and R are operand term counts at each multiplication, d is monomial degree, and P is the maximum number of distinct monomials."
      ),
    },
    debugMode: "line-by-line",
    code: [
      "import re",
      "",
      "class Solution:",
      "    def basicCalculatorIV(self, expression, evalvars, evalints):",
      "        values = dict(zip(evalvars, evalints))",
      "        tokens = re.findall(r'[a-z]+|\\d+|[()+\\-*]', expression)",
      "        i = 0",
      "",
      "        def add(left, right, sign=1):",
      "            result = left.copy()",
      "            for monomial, coefficient in right.items():",
      "                result[monomial] = result.get(monomial, 0) + sign * coefficient",
      "            return {m: c for m, c in result.items() if c}",
      "",
      "        def multiply(left, right):",
      "            result = {}",
      "            for monomial_a, coefficient_a in left.items():",
      "                for monomial_b, coefficient_b in right.items():",
      "                    monomial = tuple(sorted(monomial_a + monomial_b))",
      "                    result[monomial] = result.get(monomial, 0) + coefficient_a * coefficient_b",
      "            return {m: c for m, c in result.items() if c}",
      "",
      "        def parse_expression():",
      "            nonlocal i",
      "            result = parse_term()",
      "            while i < len(tokens) and tokens[i] in ('+', '-'):",
      "                operator = tokens[i]",
      "                i += 1",
      "                result = add(result, parse_term(), 1 if operator == '+' else -1)",
      "            return result",
      "",
      "        def parse_term():",
      "            nonlocal i",
      "            result = parse_factor()",
      "            while i < len(tokens) and tokens[i] == '*':",
      "                i += 1",
      "                result = multiply(result, parse_factor())",
      "            return result",
      "",
      "        def parse_factor():",
      "            nonlocal i",
      "            token = tokens[i]",
      "            if token in ('+', '-'):",
      "                i += 1",
      "                result = parse_factor()",
      "                return result if token == '+' else add({}, result, -1)",
      "            if token == '(':",
      "                i += 1",
      "                result = parse_expression()",
      "                i += 1",
      "                return result",
      "            i += 1",
      "            if token.isdigit():",
      "                value = int(token)",
      "                return {} if value == 0 else {(): value}",
      "            if token in values:",
      "                value = values[token]",
      "                return {} if value == 0 else {(): value}",
      "            return {(token,): 1}",
      "",
      "        polynomial = parse_expression()",
      "        terms = sorted(polynomial.items(), key=lambda item: (-len(item[0]), item[0]))",
      "        return ['*'.join([str(coefficient), *monomial])",
      "                for monomial, coefficient in terms if coefficient]",
    ],
    builder: buildSteps770,
    liveArgs(input, params) {
      const parsed = parseBasicCalculatorIV770Input(input, params);
      return [parsed.expression, parsed.evalvars, parsed.evalints];
    },
  },
};
