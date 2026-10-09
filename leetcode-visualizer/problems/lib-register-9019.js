"use strict";

const LIB_REGISTER_9019_SOURCE = Object.freeze([
  "class Library:",
  "    def __init__(self):",
  "        self.registrations = {}",
  "",
  "    def Register(self, name, value):",
  "        self.registrations[name] = value",
  "",
  "    def Evaluate(self, template):",
  "        visiting = set()",
  "",
  "        def dfs(text, source=\"<template>\"):",
  "            result = []",
  "            variable = []",
  "            inside = False",
  "            for index, char in enumerate(text):",
  "                if char == \"%\":",
  "                    if inside:",
  "                        name = \"\".join(variable)",
  "                        if name in visiting:",
  "                            raise ValueError(\"Cycle detected\")",
  "                        visiting.add(name)",
  "                        value = self.registrations.get(name, \"\")",
  "                        result.append(dfs(value, name))",
  "                        visiting.remove(name)",
  "                        variable = []",
  "                        inside = False",
  "                    else:",
  "                        inside = True",
  "                elif inside:",
  "                    variable.append(char)",
  "                else:",
  "                    result.append(char)",
  "            return \"\".join(result)",
  "",
  "        return dfs(template)",
  "",
  "class Solution:",
  "    def evaluateLibrary(self, registrations, template):",
  "        library = Library()",
  "        for name, value in registrations:",
  "            library.Register(name, value)",
  "        return library.Evaluate(template)",
]);

const MAX_REGISTRATIONS = 15;
const MAX_NAME_LENGTH = 28;
const MAX_VALUE_LENGTH = 180;
const MAX_TEMPLATE_LENGTH = 240;
const MAX_EXPANDED_LENGTH = 5000;
const MAX_WORK = 24000;
const MAX_TRACE_STEPS = 700;
const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function parseLibRegister9019Input(input, params = {}) {
  if (typeof input !== "string") throw new TypeError("Registrations must be a string.");
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter at least one registration in NAME=value form.");
  const segments = trimmed.split("|");
  if (segments.length > MAX_REGISTRATIONS) {
    throw new RangeError(`This visualization supports at most ${MAX_REGISTRATIONS} registrations.`);
  }

  const registrations = segments.map((segment, index) => {
    const separator = segment.indexOf("=");
    if (separator < 1) throw new Error(`Registration ${index + 1} must use NAME=value.`);
    const name = segment.slice(0, separator).trim();
    const value = segment.slice(separator + 1).trim();
    if (!NAME_PATTERN.test(name) || name.length > MAX_NAME_LENGTH) {
      throw new Error(`Registration ${index + 1} has an invalid name. Use letters, digits, and underscores, starting with a letter or underscore.`);
    }
    if (value.length > MAX_VALUE_LENGTH) {
      throw new RangeError(`Value for ${name} must be at most ${MAX_VALUE_LENGTH} characters.`);
    }
    return { name, value };
  });

  const template = typeof params.template === "string" ? params.template : "";
  if (!template.length) throw new Error("Template cannot be empty.");
  if (template.length > MAX_TEMPLATE_LENGTH) {
    throw new RangeError(`Template must be at most ${MAX_TEMPLATE_LENGTH} characters.`);
  }
  return { registrations, template };
}

function frozenView9019(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function localized9019(en, vi) {
  return { en, vi };
}

function buildLibRegister9019Steps(input, params = {}) {
  const parsed = parseLibRegister9019Input(input, params);
  const registry = new Map();
  const steps = [];
  const frames = [];
  const visiting = new Set();
  let activeName = null;
  let activeValue = null;
  let work = 0;
  let answer = null;
  let error = null;
  let traceOmitted = false;

  const registryRows = () => [...registry.entries()].map(([name, value]) => ({ name, value }));
  const frameRows = () => frames.map((frame) => ({
    source: frame.source,
    text: frame.text,
    index: frame.index,
    char: frame.char,
    inside: frame.inside,
    variable: frame.variable.join(""),
    result: frame.result.join(""),
  }));
  const emit = ({ line, phase, event, title, note, final = false, condition = null, force = false }) => {
    if (!force && steps.length >= MAX_TRACE_STEPS - 1) {
      traceOmitted = true;
      return;
    }
    steps.push({
      codeLines: [line],
      title,
      note,
      final,
      libRegister9019View: frozenView9019({
        phase,
        event,
        line,
        sourceText: LIB_REGISTER_9019_SOURCE[line - 1],
        registrations: registryRows(),
        template: parsed.template,
        frames: frameRows(),
        visiting: [...visiting],
        activeName,
        activeValue,
        condition,
        output: answer,
        error,
        traceOmitted,
        final,
      }),
    });
  };

  emit({
    line: 39, phase: "setup", event: "construct", title: localized9019("Create the Library", "Tạo Library"),
    note: localized9019("Start with one empty registry.", "Bắt đầu với một registry rỗng."),
  });
  emit({
    line: 3, phase: "setup", event: "init-map", title: localized9019("Initialize the registry map", "Khởi tạo registry map"),
    note: localized9019("A hash map gives direct lookup from a placeholder name to its template value.", "Hash map cho phép tra trực tiếp từ tên placeholder đến giá trị template."),
  });

  parsed.registrations.forEach(({ name, value }, index) => {
    activeName = name;
    activeValue = value;
    emit({
      line: 40, phase: "register", event: "select-registration",
      title: localized9019(`Read registration ${index + 1}`, `Đọc registration ${index + 1}`),
      note: localized9019(`Next pair: ${name} = ${value || "<empty>"}.`, `Cặp kế tiếp: ${name} = ${value || "<rỗng>"}.`),
    });
    registry.set(name, value);
    emit({
      line: 6, phase: "register", event: "store-registration",
      title: localized9019(`Register %${name}%`, `Đăng ký %${name}%`),
      note: localized9019("Assignment also makes repeated names use the most recently registered value.", "Phép gán cũng làm tên lặp sử dụng giá trị đăng ký gần nhất."),
    });
  });
  activeName = null;
  activeValue = null;
  emit({
    line: 9, phase: "evaluate", event: "init-visiting", title: localized9019("Start cycle tracking", "Bắt đầu theo dõi chu kỳ"),
    note: localized9019("visiting contains only placeholders on the current recursion path.", "visiting chỉ chứa các placeholder trên đường đệ quy hiện tại."),
  });

  const dfs = (text, source) => {
    work++;
    if (work > MAX_WORK) throw new Error("Expansion limit exceeded");
    const frame = { source, text, index: -1, char: "", inside: false, variable: [], result: [] };
    frames.push(frame);
    emit({
      line: 11, phase: "expand", event: "enter-dfs", title: localized9019(`Enter dfs(${source})`, `Vào dfs(${source})`),
      note: localized9019("Each stack frame scans one registered value (or the root template).", "Mỗi stack frame quét một giá trị đã đăng ký (hoặc template gốc)."),
    });
    emit({ line: 12, phase: "expand", event: "init-result", title: localized9019("Create this frame's output buffer", "Tạo output buffer của frame"), note: localized9019("Literal text and recursively expanded values are appended here.", "Text thường và giá trị được mở rộng đệ quy sẽ được nối vào đây.") });
    emit({ line: 13, phase: "expand", event: "init-variable", title: localized9019("Create the placeholder buffer", "Tạo buffer placeholder"), note: localized9019("Characters between percent delimiters form a registry key.", "Các ký tự giữa hai dấu phần trăm tạo thành khóa registry.") });
    emit({ line: 14, phase: "expand", event: "outside-placeholder", title: localized9019("Begin outside a placeholder", "Bắt đầu ngoài placeholder"), note: localized9019("inside flips whenever a percent delimiter opens or closes a name.", "inside đổi trạng thái mỗi khi dấu phần trăm mở hoặc đóng một tên.") });

    for (let index = 0; index < text.length; index++) {
      work++;
      if (work > MAX_WORK) throw new Error("Expansion limit exceeded");
      frame.index = index;
      frame.char = text[index];
      emit({ line: 15, phase: "scan", event: "scan-character", title: localized9019(`Scan character ${index + 1}`, `Quét ký tự ${index + 1}`), note: localized9019(`Current character: ${JSON.stringify(frame.char)}.`, `Ký tự hiện tại: ${JSON.stringify(frame.char)}.`) });
      const isDelimiter = frame.char === "%";
      emit({ line: 16, phase: "scan", event: "delimiter-check", condition: { expression: "char == '%'", result: isDelimiter }, title: localized9019(isDelimiter ? "Percent delimiter found" : "Ordinary character", isDelimiter ? "Tìm thấy dấu phần trăm" : "Ký tự thường"), note: localized9019(isDelimiter ? "The delimiter either opens or closes a placeholder." : "Route the character by the current inside state.", isDelimiter ? "Dấu này sẽ mở hoặc đóng một placeholder." : "Xử lý ký tự dựa trên trạng thái inside hiện tại.") });
      if (isDelimiter) {
        emit({ line: 17, phase: "scan", event: "inside-check", condition: { expression: "inside", result: frame.inside }, title: localized9019(frame.inside ? "Close the placeholder" : "Open a placeholder", frame.inside ? "Đóng placeholder" : "Mở placeholder"), note: localized9019(frame.inside ? "The buffered characters now name a dependency." : "The following characters belong to a registry key.", frame.inside ? "Các ký tự trong buffer giờ là tên dependency." : "Các ký tự tiếp theo thuộc về một khóa registry.") });
        if (!frame.inside) {
          frame.inside = true;
          emit({ line: 28, phase: "scan", event: "open-placeholder", title: localized9019("Switch inside on", "Bật trạng thái inside"), note: localized9019("Literal output pauses until the matching percent delimiter.", "Việc ghi literal output tạm dừng đến dấu phần trăm đóng.") });
          continue;
        }

        const name = frame.variable.join("");
        activeName = name;
        emit({ line: 18, phase: "resolve", event: "build-name", title: localized9019(`Resolve %${name}%`, `Phân giải %${name}%`), note: localized9019("Join the placeholder buffer to get the registry key.", "Nối buffer placeholder để lấy khóa registry.") });
        const cyclic = visiting.has(name);
        emit({ line: 19, phase: "resolve", event: "cycle-check", condition: { expression: "name in visiting", result: cyclic }, title: localized9019(cyclic ? "Cycle found" : "No cycle on this path", cyclic ? "Phát hiện chu kỳ" : "Không có chu kỳ trên đường này"), note: localized9019(cyclic ? `${name} is already active in the recursion path.` : `${name} can safely be expanded now.`, cyclic ? `${name} đã có trên đường đệ quy hiện tại.` : `${name} có thể được mở rộng an toàn.`) });
        if (cyclic) {
          error = `Cycle detected: ${[...visiting, name].join(" → ")}`;
          emit({ line: 20, phase: "error", event: "cycle-error", title: localized9019("Stop: cyclic registration", "Dừng: registration tạo chu kỳ"), note: localized9019(error, error), final: true, force: true });
          throw Object.assign(new Error(error), { cycle9019: true });
        }

        visiting.add(name);
        emit({ line: 21, phase: "resolve", event: "mark-visiting", title: localized9019(`Mark ${name} active`, `Đánh dấu ${name} đang active`), note: localized9019("Keeping the key active until its recursive call returns detects back edges, not harmless reuse.", "Giữ khóa active đến khi lời gọi đệ quy trả về giúp phát hiện back edge, không nhầm với tái sử dụng hợp lệ.") });
        const value = registry.get(name) ?? "";
        activeValue = value;
        emit({ line: 22, phase: "resolve", event: registry.has(name) ? "lookup-hit" : "lookup-miss", title: localized9019(registry.has(name) ? `Lookup ${name}` : `${name} is not registered`, registry.has(name) ? `Tra cứu ${name}` : `${name} chưa được đăng ký`), note: localized9019(registry.has(name) ? `Registry value: ${value || "<empty>"}.` : "Missing placeholders expand to an empty string, matching dict.get(name, '').", registry.has(name) ? `Giá trị registry: ${value || "<rỗng>"}.` : "Placeholder bị thiếu được mở rộng thành chuỗi rỗng, giống dict.get(name, '').") });
        emit({ line: 23, phase: "recurse", event: "recursive-call", title: localized9019(`Expand ${name} recursively`, `Mở rộng đệ quy ${name}`), note: localized9019("The parent frame waits while a child frame resolves nested placeholders.", "Frame cha chờ trong khi frame con phân giải placeholder lồng nhau.") });
        const expanded = dfs(value, name);
        frame.result.push(expanded);
        if (frame.result.join("").length > MAX_EXPANDED_LENGTH) throw new Error("Expanded output is too long for this visualization");
        emit({ line: 23, phase: "return", event: "append-expanded", title: localized9019(`Append expanded ${name}`, `Nối kết quả mở rộng ${name}`), note: localized9019(`Child returned ${JSON.stringify(expanded)}.`, `Frame con trả về ${JSON.stringify(expanded)}.`) });
        visiting.delete(name);
        emit({ line: 24, phase: "return", event: "unmark-visiting", title: localized9019(`Unmark ${name}`, `Bỏ đánh dấu ${name}`), note: localized9019("The key may appear again later after this recursion branch has finished.", "Khóa có thể xuất hiện lại sau khi nhánh đệ quy này kết thúc.") });
        frame.variable = [];
        emit({ line: 25, phase: "scan", event: "clear-variable", title: localized9019("Clear the placeholder buffer", "Xóa buffer placeholder"), note: localized9019("The next placeholder starts with an empty name buffer.", "Placeholder tiếp theo bắt đầu với buffer tên rỗng.") });
        frame.inside = false;
        activeName = null;
        activeValue = null;
        emit({ line: 26, phase: "scan", event: "close-placeholder", title: localized9019("Return to literal text", "Quay lại literal text"), note: localized9019("Scanning resumes outside the closed placeholder.", "Tiếp tục quét bên ngoài placeholder vừa đóng.") });
      } else if (frame.inside) {
        emit({ line: 29, phase: "scan", event: "inside-branch", condition: { expression: "inside", result: true }, title: localized9019("Character belongs to the name", "Ký tự thuộc về tên"), note: localized9019("Do not emit placeholder-name characters as literal output.", "Không ghi ký tự của tên placeholder thành literal output.") });
        frame.variable.push(frame.char);
        emit({ line: 30, phase: "scan", event: "collect-name", title: localized9019(`Name buffer: ${frame.variable.join("")}`, `Buffer tên: ${frame.variable.join("")}`), note: localized9019("Keep collecting until the closing percent delimiter.", "Tiếp tục thu thập đến dấu phần trăm đóng.") });
      } else {
        emit({ line: 31, phase: "scan", event: "literal-branch", condition: { expression: "inside", result: false }, title: localized9019("Character is literal text", "Ký tự là literal text"), note: localized9019("It can be copied directly into this frame's output.", "Có thể chép trực tiếp vào output của frame này.") });
        frame.result.push(frame.char);
        emit({ line: 32, phase: "scan", event: "append-literal", title: localized9019(`Append ${JSON.stringify(frame.char)}`, `Nối ${JSON.stringify(frame.char)}`), note: localized9019(`Partial output: ${JSON.stringify(frame.result.join(""))}.`, `Output tạm: ${JSON.stringify(frame.result.join(""))}.`) });
      }
    }

    const result = frame.result.join("");
    emit({ line: 33, phase: "return", event: "return-frame", title: localized9019(`Return from ${source}`, `Trả về từ ${source}`), note: localized9019(frame.inside ? `An unmatched opening % leaves ${JSON.stringify(frame.variable.join(""))} unfinished, so it is omitted like the original implementation.` : `Frame result: ${JSON.stringify(result)}.`, frame.inside ? `Dấu % mở không có dấu đóng khiến ${JSON.stringify(frame.variable.join(""))} chưa hoàn tất, nên bị bỏ qua giống implementation gốc.` : `Kết quả frame: ${JSON.stringify(result)}.`) });
    frames.pop();
    return result;
  };

  try {
    emit({ line: 35, phase: "evaluate", event: "evaluate-template", title: localized9019("Evaluate the root template", "Evaluate template gốc"), note: localized9019("The root is scanned by the same DFS used for registered values.", "Template gốc được quét bởi cùng DFS dùng cho các giá trị đã đăng ký.") });
    answer = dfs(parsed.template, "<template>");
    emit({ line: 35, phase: "done", event: "complete", title: localized9019("Template fully expanded", "Template đã mở rộng hoàn toàn"), note: localized9019(`Final output: ${JSON.stringify(answer)}.`, `Output cuối: ${JSON.stringify(answer)}.`), final: true, force: true });
  } catch (caught) {
    if (!caught || !caught.cycle9019) {
      error = String((caught && caught.message) || caught);
      emit({ line: 23, phase: "error", event: "limit-error", title: localized9019("Expansion stopped", "Dừng mở rộng"), note: localized9019(error, error), final: true, force: true });
    }
  }

  return {
    original: parsed.registrations.map(({ name, value }) => [name, value]),
    registrations: parsed.registrations.map(({ name, value }) => [name, value]),
    template: parsed.template,
    answer,
    error,
    steps,
  };
}

const DESIGN = { key: "design", vi: "Thiết kế hệ thống", en: "Design" };
const HASHMAP = { key: "hashmap", vi: "Hash Map", en: "Hash Map" };
const DFS = { key: "dfs", vi: "DFS / Đệ quy", en: "DFS / Recursion" };
const STRING = { key: "string", vi: "Chuỗi", en: "String" };

module.exports = {
  9019: {
    id: 9019,
    difficulty: "medium",
    category: DESIGN,
    tags: [HASHMAP, DFS, STRING],
    title: { vi: "Library Template Register", en: "Library Template Register" },
    titleVi: { vi: "Registry template mở rộng đệ quy", en: "Recursive template registry" },
    statement: {
      vi: "Thiết kế Library hỗ trợ Register(name, value) và Evaluate(template). Placeholder có dạng %NAME% và có thể tham chiếu lồng nhau. Placeholder chưa đăng ký trở thành chuỗi rỗng; nếu đường tham chiếu quay lại một tên đang được mở rộng, báo Cycle detected.",
      en: "Design a Library with Register(name, value) and Evaluate(template). Placeholders use %NAME% and may be nested. An unregistered placeholder expands to an empty string; if a reference path reaches a name currently being expanded, report Cycle detected.",
    },
    defaultInput: "NAME=Ada|DAY=08|MONTH=10|DATE=%MONTH%/%DAY%|GREETING=Hello %NAME%",
    inputKind: "string",
    inputLabel: { vi: "Registrations (NAME=value, ngăn cách bằng |)", en: "Registrations (NAME=value, separated by |)" },
    extraParams: [{
      key: "template", type: "string", default: "%GREETING%! Registered on %DATE%.",
      label: { vi: "Template cần Evaluate", en: "Template to Evaluate" },
    }],
    debugMode: "line-by-line",
    approach: [
      { vi: "Lưu mỗi registration trong hash map để tra cứu placeholder trung bình O(1). Đăng ký lại cùng tên sẽ ghi đè giá trị cũ.", en: "Store each registration in a hash map for average O(1) placeholder lookup. Registering the same name again overwrites its old value." },
      { vi: "Quét chuỗi bằng cờ inside: ký tự ngoài %...% đi thẳng vào output; ký tự bên trong tạo tên biến.", en: "Scan each string with an inside flag: characters outside %...% go to output; characters inside form a variable name." },
      { vi: "Khi đóng placeholder, DFS giá trị đã đăng ký rồi nối kết quả vào frame cha. Call stack thể hiện các template lồng nhau.", en: "When a placeholder closes, DFS its registered value and append the result to the parent frame. The call stack represents nested templates." },
      { vi: "visiting là tập theo đường đệ quy hiện tại. Gặp lại tên trong tập này là back edge và chứng minh có chu kỳ.", en: "visiting is scoped to the current recursion path. Reaching a name already in it is a back edge and proves a cycle." },
    ],
    complexity: {
      time: "O(C + E) over scanned characters and produced expansion",
      space: "O(R + D + E)",
      note: {
        vi: "R là kích thước registry, D là độ sâu tham chiếu và E là độ dài output. Cùng placeholder có thể được mở rộng nhiều lần vì implementation gốc không memoize.",
        en: "R is registry size, D is reference depth, and E is output length. The same placeholder may be expanded repeatedly because the original implementation does not memoize.",
      },
    },
    code: LIB_REGISTER_9019_SOURCE,
    builder: buildLibRegister9019Steps,
    liveArgs: (input, params) => {
      const parsed = parseLibRegister9019Input(input, params);
      return [parsed.registrations.map(({ name, value }) => [name, value]), parsed.template];
    },
  },
};
