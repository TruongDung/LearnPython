// Lazy live-code editor runtime. Loaded only after the user opens the editor.

let monacoEditorInstance = null;
let monacoLoadPromise = null;
let monacoSourceKey = null;
let pythonCompletionsRegistered = false;
let monacoThemesRegistered = false;
let pyodideInstance = null;
let pyodideLoadPromise = null;
let liveSteps = [];
let liveResizeInitialized = false;
let liveCopyResetTimer = null;
const MONACO_LOADER_URL = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs/loader.js";

const LIVE_I18N = {
  vi: {
    loading: "Đang tải Python runtime (chỉ lần đầu)...",
    running: "Đang chạy...",
    ready: (n) => `Đã chạy xong — ${n} bước.`,
    doneNoTrace: "Chạy xong nhưng không bắt được dòng nào (code có thể không gọi hàm nào).",
    copied: "✓ Đã sao chép!",
    copyFailed: "Không thể sao chép code.",
  },
  en: {
    loading: "Loading Python runtime (first time only)...",
    running: "Running...",
    ready: (n) => `Finished — ${n} step(s).`,
    doneNoTrace: "Ran successfully but no traced lines were captured (no function was called).",
    copied: "✓ Copied!",
    copyFailed: "Could not copy code.",
  },
};
const lt = () => LIVE_I18N[lang] || LIVE_I18N.en;

function loadMonaco() {
  if (monacoLoadPromise) return monacoLoadPromise;
  monacoLoadPromise = new Promise((resolve, reject) => {
    const loadEditor = () => {
      if (!window.require) {
        reject(new Error("Monaco loader script not found"));
        return;
      }
      window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs" } });
      window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
    };
    if (window.require) {
      loadEditor();
      return;
    }
    const loader = document.createElement("script");
    loader.src = MONACO_LOADER_URL;
    loader.async = true;
    loader.dataset.monacoLoader = "true";
    loader.addEventListener("load", loadEditor, { once: true });
    loader.addEventListener("error", () => reject(new Error("Could not load the code editor")), { once: true });
    document.head.appendChild(loader);
  }).catch((error) => {
    monacoLoadPromise = null;
    throw error;
  });
  return monacoLoadPromise;
}

function registerMonacoThemes(monaco) {
  if (monacoThemesRegistered) return;
  monacoThemesRegistered = true;

  monaco.editor.defineTheme("leetcode-python-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6A9955", fontStyle: "italic" },
      { token: "keyword", foreground: "C586C0" },
      { token: "keyword.control", foreground: "C586C0" },
      { token: "keyword.flow", foreground: "C586C0" },
      { token: "keyword.operator", foreground: "D4D4D4" },
      { token: "string", foreground: "CE9178" },
      { token: "string.escape", foreground: "D7BA7D" },
      { token: "number", foreground: "B5CEA8" },
      { token: "type", foreground: "4EC9B0" },
      { token: "type.identifier", foreground: "4EC9B0" },
      { token: "identifier", foreground: "9CDCFE" },
      { token: "function", foreground: "DCDCAA" },
      { token: "delimiter", foreground: "D4D4D4" },
      { token: "operator", foreground: "D4D4D4" },
    ],
    colors: {
      "editor.background": "#1E1E1E",
      "editor.foreground": "#D4D4D4",
      "editorLineNumber.foreground": "#858585",
      "editorLineNumber.activeForeground": "#C6C6C6",
      "editor.lineHighlightBackground": "#2A2D2E",
      "editor.lineHighlightBorder": "#00000000",
      "editorCursor.foreground": "#AEAFAD",
      "editor.selectionBackground": "#264F78",
      "editor.inactiveSelectionBackground": "#3A3D41",
      "editorIndentGuide.background1": "#404040",
      "editorIndentGuide.activeBackground1": "#707070",
      "editorBracketHighlight.foreground1": "#FFD700",
      "editorBracketHighlight.foreground2": "#DA70D6",
      "editorBracketHighlight.foreground3": "#179FFF",
      "editorBracketHighlight.foreground4": "#FFD700",
      "editorBracketHighlight.foreground5": "#DA70D6",
      "editorBracketHighlight.foreground6": "#179FFF",
      "editorSuggestWidget.background": "#252526",
      "editorSuggestWidget.border": "#454545",
      "editorSuggestWidget.foreground": "#D4D4D4",
      "editorSuggestWidget.highlightForeground": "#4FC1FF",
      "editorSuggestWidget.selectedBackground": "#04395E",
      "editorSuggestWidget.selectedForeground": "#FFFFFF",
      "editorSuggestWidget.focusHighlightForeground": "#9CDCFE",
      "editorSuggestWidgetStatus.foreground": "#C5C5C5",
      "editorWidget.background": "#252526",
      "editorHoverWidget.background": "#252526",
    },
  });

  monaco.editor.defineTheme("leetcode-python-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "008000", fontStyle: "italic" },
      { token: "keyword", foreground: "AF00DB" },
      { token: "keyword.control", foreground: "AF00DB" },
      { token: "keyword.flow", foreground: "AF00DB" },
      { token: "keyword.operator", foreground: "000000" },
      { token: "string", foreground: "A31515" },
      { token: "string.escape", foreground: "EE0000" },
      { token: "number", foreground: "098658" },
      { token: "type", foreground: "267F99" },
      { token: "type.identifier", foreground: "267F99" },
      { token: "identifier", foreground: "001080" },
      { token: "function", foreground: "795E26" },
      { token: "delimiter", foreground: "000000" },
      { token: "operator", foreground: "000000" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#000000",
      "editorLineNumber.foreground": "#237893",
      "editorLineNumber.activeForeground": "#0B216F",
      "editor.lineHighlightBackground": "#F3F3F3",
      "editor.lineHighlightBorder": "#00000000",
      "editorCursor.foreground": "#000000",
      "editor.selectionBackground": "#ADD6FF",
      "editor.inactiveSelectionBackground": "#E5EBF1",
      "editorIndentGuide.background1": "#D3D3D3",
      "editorIndentGuide.activeBackground1": "#939393",
      "editorBracketHighlight.foreground1": "#0431FA",
      "editorBracketHighlight.foreground2": "#319331",
      "editorBracketHighlight.foreground3": "#7B3814",
      "editorSuggestWidget.background": "#F3F3F3",
      "editorSuggestWidget.border": "#C8C8C8",
      "editorSuggestWidget.foreground": "#1F1F1F",
      "editorSuggestWidget.highlightForeground": "#0066BF",
      "editorSuggestWidget.selectedBackground": "#D6EBFF",
      "editorSuggestWidget.selectedForeground": "#111111",
      "editorSuggestWidget.focusHighlightForeground": "#004C8C",
      "editorSuggestWidgetStatus.foreground": "#4F4F4F",
    },
  });
}

function registerPythonCompletions(monaco) {
  if (pythonCompletionsRegistered) return;
  pythonCompletionsRegistered = true;

  const keywords = [
    "and", "as", "assert", "async", "await", "break", "class", "continue",
    "def", "del", "elif", "else", "except", "False", "finally", "for",
    "from", "global", "if", "import", "in", "is", "lambda", "None",
    "nonlocal", "not", "or", "pass", "raise", "return", "True", "try",
    "while", "with", "yield",
  ];
  const builtins = [
    ["abs", "abs(${1:value})"],
    ["all", "all(${1:iterable})"],
    ["any", "any(${1:iterable})"],
    ["bin", "bin(${1:number})"],
    ["bool", "bool(${1:value})"],
    ["chr", "chr(${1:code})"],
    ["dict", "dict(${1})"],
    ["divmod", "divmod(${1:a}, ${2:b})"],
    ["enumerate", "enumerate(${1:iterable})"],
    ["filter", "filter(${1:function}, ${2:iterable})"],
    ["float", "float(${1:value})"],
    ["hash", "hash(${1:value})"],
    ["int", "int(${1:value})"],
    ["len", "len(${1:collection})"],
    ["list", "list(${1:iterable})"],
    ["map", "map(${1:function}, ${2:iterable})"],
    ["max", "max(${1:iterable})"],
    ["min", "min(${1:iterable})"],
    ["next", "next(${1:iterator})"],
    ["ord", "ord(${1:char})"],
    ["pow", "pow(${1:base}, ${2:exp})"],
    ["print", "print(${1:value})"],
    ["range", "range(${1:stop})"],
    ["reversed", "reversed(${1:sequence})"],
    ["round", "round(${1:number})"],
    ["set", "set(${1:iterable})"],
    ["sorted", "sorted(${1:iterable})"],
    ["str", "str(${1:value})"],
    ["sum", "sum(${1:iterable})"],
    ["tuple", "tuple(${1:iterable})"],
    ["zip", "zip(${1:iterables})"],
  ];
  const leetcodeHelpers = [
    ["List", "List[${1:int}]", "typing.List"],
    ["Optional", "Optional[${1:TreeNode}]", "typing.Optional"],
    ["Dict", "Dict[${1:str}, ${2:int}]", "typing.Dict"],
    ["Set", "Set[${1:int}]", "typing.Set"],
    ["Tuple", "Tuple[${1:int}, ${2:int}]", "typing.Tuple"],
    ["deque", "deque(${1})", "collections.deque"],
    ["defaultdict", "defaultdict(${1:int})", "collections.defaultdict"],
    ["Counter", "Counter(${1:iterable})", "collections.Counter"],
    ["heapq", "heapq", "heapq module"],
    ["heappush", "heapq.heappush(${1:heap}, ${2:item})", "heapq.heappush"],
    ["heappop", "heapq.heappop(${1:heap})", "heapq.heappop"],
    ["bisect_left", "bisect_left(${1:a}, ${2:x})", "bisect.bisect_left"],
    ["bisect_right", "bisect_right(${1:a}, ${2:x})", "bisect.bisect_right"],
    ["lru_cache", "@lru_cache(None)\ndef ${1:dp}(${2:state}):\n\t${0:pass}", "functools.lru_cache"],
    ["cache", "@cache\ndef ${1:dp}(${2:state}):\n\t${0:pass}", "functools.cache"],
    ["TreeNode", "TreeNode", "LeetCode tree node"],
    ["ListNode", "ListNode", "LeetCode linked-list node"],
  ];
  const imports = [
    ["from typing import ...", "from typing import List, Optional, Dict, Set, Tuple", "Typing imports"],
    ["from collections import ...", "from collections import Counter, defaultdict, deque", "Collections imports"],
    ["from heapq import ...", "from heapq import heappush, heappop, heapify", "Heap imports"],
    ["from bisect import ...", "from bisect import bisect_left, bisect_right", "Bisect imports"],
    ["from functools import ...", "from functools import cache, lru_cache", "Memoization imports"],
  ];
  const dotMembers = [
    ["append", "append(${1:value})", "list.append"],
    ["extend", "extend(${1:iterable})", "list.extend"],
    ["pop", "pop(${1})", "list/dict/set pop"],
    ["sort", "sort()", "list.sort in place"],
    ["reverse", "reverse()", "list.reverse in place"],
    ["copy", "copy()", "shallow copy"],
    ["join", "join(${1:iterable})", "str.join"],
    ["split", "split(${1})", "str.split"],
    ["strip", "strip()", "str.strip"],
    ["startswith", "startswith(${1:prefix})", "str.startswith"],
    ["endswith", "endswith(${1:suffix})", "str.endswith"],
    ["find", "find(${1:sub})", "str.find"],
    ["items", "items()", "dict.items"],
    ["keys", "keys()", "dict.keys"],
    ["values", "values()", "dict.values"],
    ["get", "get(${1:key}, ${2:default})", "dict.get"],
    ["setdefault", "setdefault(${1:key}, ${2:default})", "dict.setdefault"],
    ["add", "add(${1:value})", "set.add"],
    ["remove", "remove(${1:value})", "set.remove"],
    ["discard", "discard(${1:value})", "set.discard"],
    ["popleft", "popleft()", "deque.popleft"],
    ["appendleft", "appendleft(${1:value})", "deque.appendleft"],
  ];
  const snippets = [
    ["def function", "def ${1:function_name}(${2:args}):\n\t${0:pass}", "Function definition"],
    ["class definition", "class ${1:ClassName}:\n\tdef __init__(self, ${2:args}):\n\t\t${0:pass}", "Class definition"],
    ["if statement", "if ${1:condition}:\n\t${0:pass}", "If statement"],
    ["if / else", "if ${1:condition}:\n\t${2:pass}\nelse:\n\t${0:pass}", "If / else statement"],
    ["if guard continue", "if ${1:condition}:\n\tcontinue", "Guard clause in loop"],
    ["for loop", "for ${1:item} in ${2:iterable}:\n\t${0:pass}", "For loop"],
    ["for range loop", "for ${1:i} in range(${2:n}):\n\t${0:pass}", "For loop with range"],
    ["for enumerate", "for ${1:i}, ${2:value} in enumerate(${3:nums}):\n\t${0:pass}", "Loop with index and value"],
    ["while loop", "while ${1:condition}:\n\t${0:pass}", "While loop"],
    ["while queue", "while ${1:queue}:\n\t${2:node} = ${1:queue}.popleft()\n\t${0:pass}", "BFS queue loop"],
    ["try / except", "try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:error}:\n\t${0:pass}", "Try / except block"],
    ["list comprehension", "[${1:expression} for ${2:item} in ${3:iterable}]", "List comprehension"],
    ["dict comprehension", "{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}", "Dict comprehension"],
    ["two pointers", "${1:left}, ${2:right} = 0, len(${3:nums}) - 1\nwhile ${1:left} < ${2:right}:\n\t${0:pass}", "Two pointer skeleton"],
    ["binary search", "${1:left}, ${2:right} = 0, len(${3:nums}) - 1\nwhile ${1:left} <= ${2:right}:\n\t${4:mid} = (${1:left} + ${2:right}) // 2\n\t${0:pass}", "Binary search skeleton"],
    ["DFS function", "def dfs(${1:node}):\n\tif not ${1:node}:\n\t\treturn ${2:None}\n\t${0:pass}", "DFS helper"],
    ["BFS queue", "q = deque([${1:start}])\nwhile q:\n\t${2:node} = q.popleft()\n\t${0:pass}", "BFS with deque"],
    ["heap pattern", "heap = []\nheappush(heap, ${1:item})\n${2:item} = heappop(heap)", "Min-heap pattern"],
    ["memoized dp", "@lru_cache(None)\ndef dp(${1:i}):\n\t${0:pass}", "Memoized DP helper"],
    ["LeetCode Solution", "class Solution:\n\tdef ${1:method}(self, ${2:args}):\n\t\t${0:pass}", "LeetCode Solution class"],
  ];
  const ignoredLocalNames = new Set([
    "self", "cls", "True", "False", "None", "and", "or", "not", "in", "is",
    "if", "else", "elif", "for", "while", "return", "def", "class", "with",
    "as", "try", "except", "finally", "import", "from", "pass", "break", "continue",
  ]);
  const localNamePattern = /^[A-Za-z_]\w*$/;

  function cleanPythonName(raw) {
    const name = String(raw || "")
      .trim()
      .replace(/^\*+/, "")
      .split("=")[0]
      .split(":")[0]
      .trim();
    return localNamePattern.test(name) && !ignoredLocalNames.has(name) ? name : "";
  }

  function addNamesFromTarget(target, addName) {
    String(target || "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\([^)]*\)/g, "")
      .split(",")
      .map(cleanPythonName)
      .filter(Boolean)
      .forEach(addName);
  }

  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: [".", "_"],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const lineBeforeCursor = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      const currentLine = position.lineNumber;
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const suggestions = [];
      const addSnippet = ([label, insertText, detail], priority = 0) => suggestions.push({
        label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        detail,
        sortText: `${priority}-${label}`,
      });
      const addFunction = ([name, insertText, detail], priority = 1) => suggestions.push({
        label: name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        detail: detail || (lang === "vi" ? "Hàm dựng sẵn Python" : "Python built-in function"),
        sortText: `${priority}-${name}`,
      });
      const addLocalFunction = (fn, priority = 0) => suggestions.push({
        label: fn.name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: `${fn.name}(${fn.params.map((param, index) => `\${${index + 1}:${param}}`).join(", ")})`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        detail: lang === "vi" ? "Hàm đã khai báo trong editor" : "Function declared in this editor",
        documentation: `def ${fn.name}(${fn.rawParams.join(", ")})`,
        sortText: `${priority}-${fn.name}`,
      });
      const addLocalVariable = (item, priority = 0) => suggestions.push({
        label: item.name,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: item.name,
        range,
        detail: item.detail || (lang === "vi" ? "Biến đã khai báo trong editor" : "Variable declared in this editor"),
        documentation: item.source ? `${item.source} · line ${item.lineNumber}` : undefined,
        sortText: `${priority}-${String(item.lineNumber).padStart(4, "0")}-${item.name}`,
      });

      const declaredFunctions = [];
      const declaredVariables = [];
      const seenFunctionNames = new Set();
      const seenVariableNames = new Set();
      const functionPattern = /^(\s*)def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:/;
      let activeFunction = null;
      for (let lineNumber = 1; lineNumber <= model.getLineCount(); lineNumber += 1) {
        const line = model.getLineContent(lineNumber);
        if (lineNumber === currentLine && /^\s*def\b/.test(line)) continue;
        const match = line.match(functionPattern);
        if (!match) continue;
        const name = match[2];
        if (seenFunctionNames.has(name)) continue;
        seenFunctionNames.add(name);
        const rawParams = match[3]
          .split(",")
          .map((param) => param.trim())
          .filter(Boolean);
        const params = rawParams
          .map((param) => param.split("=")[0].split(":")[0].trim().replace(/^\*+/, ""))
          .filter((param) => param && param !== "self" && param !== "cls");
        declaredFunctions.push({ name, rawParams, params, indent: match[1].length, lineNumber });
        if (lineNumber <= currentLine && (!activeFunction || lineNumber > activeFunction.lineNumber)) {
          activeFunction = { name, rawParams, params, indent: match[1].length, lineNumber };
        }
      }

      function rememberVariable(name, lineNumber, source, detail) {
        if (!name || seenVariableNames.has(name)) return;
        seenVariableNames.add(name);
        declaredVariables.push({ name, lineNumber, source, detail });
      }

      if (activeFunction) {
        activeFunction.params.forEach((param) => {
          rememberVariable(
            param,
            activeFunction.lineNumber,
            `def ${activeFunction.name}(${activeFunction.rawParams.join(", ")})`,
            lang === "vi" ? "Tham số của function hiện tại" : "Parameter of the current function",
          );
        });
      }

      for (let lineNumber = 1; lineNumber < currentLine; lineNumber += 1) {
        const rawLine = model.getLineContent(lineNumber);
        const codeLine = rawLine.replace(/#.*/, "");
        if (!codeLine.trim()) continue;
        const indent = (codeLine.match(/^\s*/) || [""])[0].length;
        if (activeFunction && lineNumber > activeFunction.lineNumber && indent <= activeFunction.indent) break;

        const addVariableFromLine = (name, source, detail) => rememberVariable(name, lineNumber, source, detail);
        const forMatch = codeLine.match(/^\s*(?:async\s+)?for\s+(.+?)\s+in\s+.+:/);
        if (forMatch) {
          addNamesFromTarget(forMatch[1], (name) => addVariableFromLine(
            name,
            codeLine.trim(),
            lang === "vi" ? "Biến vòng lặp đã khai báo" : "Loop variable declared earlier",
          ));
        }

        const withMatch = codeLine.match(/^\s*with\s+.+?\s+as\s+([A-Za-z_]\w*)\s*:/);
        if (withMatch) {
          addVariableFromLine(withMatch[1], codeLine.trim(), lang === "vi" ? "Biến từ with/as" : "Variable from with/as");
        }

        const exceptMatch = codeLine.match(/^\s*except\b.*?\s+as\s+([A-Za-z_]\w*)\s*:/);
        if (exceptMatch) {
          addVariableFromLine(exceptMatch[1], codeLine.trim(), lang === "vi" ? "Biến exception" : "Exception variable");
        }

        const importMatch = codeLine.match(/^\s*import\s+(.+)/);
        if (importMatch) {
          importMatch[1].split(",").forEach((part) => {
            const pieces = part.trim().split(/\s+as\s+/);
            const alias = pieces[1] || pieces[0].split(".")[0];
            addVariableFromLine(cleanPythonName(alias), codeLine.trim(), lang === "vi" ? "Tên import đã khai báo" : "Imported name");
          });
        }

        const fromImportMatch = codeLine.match(/^\s*from\s+\S+\s+import\s+(.+)/);
        if (fromImportMatch) {
          fromImportMatch[1].split(",").forEach((part) => {
            const pieces = part.trim().split(/\s+as\s+/);
            const imported = pieces[1] || pieces[0];
            addVariableFromLine(cleanPythonName(imported), codeLine.trim(), lang === "vi" ? "Tên import đã khai báo" : "Imported name");
          });
        }

        const assignmentMatch = codeLine.match(/^\s*([^=<>!]+?)\s*(?::=[^=]|=(?!=))/);
        if (assignmentMatch && !/^\s*(if|elif|while|return|assert)\b/.test(codeLine)) {
          addNamesFromTarget(assignmentMatch[1], (name) => addVariableFromLine(
            name,
            codeLine.trim(),
            lang === "vi" ? "Biến đã gán trước đó" : "Assigned earlier",
          ));
        }
      }

      if (lineBeforeCursor.endsWith(".")) {
        dotMembers.forEach((item) => addFunction(item, 0));
        return { suggestions };
      }

      const inImportLine = /^\s*(from|import)\b/.test(lineBeforeCursor);
      if (inImportLine || lineBeforeCursor.trim() === "") {
        imports.forEach((item) => addSnippet(item, 0));
      }

      if (/^\s*for\b/.test(lineBeforeCursor)) {
        [
          ["range(len(...))", "range(len(${1:nums}))", "Loop over indices"],
          ["enumerate(...)", "enumerate(${1:nums})", "Loop over index and value"],
        ].forEach((item) => addSnippet(item, 0));
      }
      if (/^\s*if\b/.test(lineBeforeCursor)) {
        [
          ["not empty", "${1:arr}", "Truthy collection check"],
          ["bounds check", "0 <= ${1:i} < ${2:n}", "Index bounds check"],
          ["visited check", "${1:node} not in ${2:visited}", "Graph/tree visited guard"],
        ].forEach((item) => addSnippet(item, 0));
      }

      declaredVariables.forEach((item) => addLocalVariable(item, 0));
      declaredFunctions.forEach((fn) => addLocalFunction(fn, 0));
      snippets.forEach((item) => addSnippet(item, 1));
      leetcodeHelpers.forEach((item) => addFunction(item, 2));
      builtins.forEach((item) => addFunction(item, 3));
      keywords.forEach((keyword) => suggestions.push({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range,
        detail: lang === "vi" ? "Từ khóa Python" : "Python keyword",
        sortText: `4-${keyword}`,
      }));
      return { suggestions };
    },
  });
}

function loadPyodideRuntime() {
  if (pyodideLoadPromise) return pyodideLoadPromise;
  pyodideLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    script.onload = async () => {
      try {
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
        });
        resolve(pyodide);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error("Failed to load Pyodide from CDN"));
    document.head.appendChild(script);
  });
  return pyodideLoadPromise;
}

function selectedLiveCodeBlock() {
  const approachInput = $("extraParams") && $("extraParams").querySelector('[data-param="approach"]');
  const selected = approachInput ? Number(approachInput.value) : 1;
  if (selected === 3 && problemData && problemData.code3) return 3;
  if (selected === 2 && problemData && problemData.code2) return 2;
  return 1;
}

function currentLiveSourceKey() {
  return `${currentProblemId || "none"}:${selectedLiveCodeBlock()}`;
}

function currentPrimaryCode() {
  const codeBlock = selectedLiveCodeBlock();
  if (codeBlock === 3) return (problemData.code3 || []).join("\n");
  if (codeBlock === 2) return (problemData.code2 || []).join("\n");
  const localizedCode = problemData && (lang === "vi" ? problemData.codeVi : problemData.codeEn);
  return (localizedCode || (problemData && problemData.code) || []).join("\n");
}

function clearedSolutionSkeleton(sourceCode) {
  const code = String(sourceCode || "");
  const classMatch = code.match(/^([ \t]*)class\s+Solution\s*:[ \t]*(?:#.*)?$/m);
  if (!classMatch) return "class Solution:\n    ";

  const classIndent = classMatch[1] || "";
  const afterClass = code.slice(classMatch.index + classMatch[0].length);
  const methodMatch = afterClass.match(/\n([ \t]+)def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:->[^\n:]+)?\s*:[ \t]*(?:#.*)?/);
  if (!methodMatch) return `${classIndent}class Solution:\n${classIndent}    `;

  const methodIndent = methodMatch[1];
  const methodName = methodMatch[2];
  const args = methodMatch[3].trim();
  const bodyIndent = `${methodIndent}    `;
  return `${classIndent}class Solution:\n${methodIndent}def ${methodName}(${args}):\n${bodyIndent}`;
}

async function collectLiveCallArgs() {
  // Re-use the same input/params the canned visualizer already validated.
  const isString = problemData && problemData.inputKind === "string";
  const isStringArray = problemData && problemData.inputKind === "stringArray";
  let input;
  if (isString) {
    input = problemData.preserveInputWhitespace ? $("arrInput").value : $("arrInput").value.trim();
  } else if (isStringArray) {
    const raw = $("arrInput").value.trim();
    input = raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    input = $("arrInput").value.trim().split(",").map((s) => s.trim()).filter((s) => s !== "").map(Number);
  }
  const params = {};
  $("extraParams").querySelectorAll("[data-param]").forEach((inp) => {
    params[inp.dataset.param] = inp.dataset.type === "string" ? inp.value : Number(inp.value);
  });

  const res = await fetch(`/api/problem/${currentProblemId}/live-args`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, params, codeBlock: selectedLiveCodeBlock() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not prepare arguments");
  return data;
}

async function ensureMonacoEditor() {
  const sourceKey = currentLiveSourceKey();
  if (monacoEditorInstance) {
    if (monacoSourceKey !== sourceKey) {
      monacoEditorInstance.setValue(currentPrimaryCode());
      monacoSourceKey = sourceKey;
    }
    monacoEditorInstance.layout();
    return monacoEditorInstance;
  }
  $("liveStatus").textContent = lt().loading;
  const monaco = await loadMonaco();
  registerMonacoThemes(monaco);
  registerPythonCompletions(monaco);
  const isLight = document.documentElement.dataset.theme !== "dark";
  monacoEditorInstance = monaco.editor.create($("monacoEditor"), {
    value: currentPrimaryCode(),
    language: "python",
    theme: isLight ? "leetcode-python-light" : "leetcode-python-dark",
    fontFamily: '"Cascadia Code", "JetBrains Mono", "SFMono-Regular", Consolas, Menlo, monospace',
    fontLigatures: false,
    fontSize: 14,
    lineHeight: 21,
    wordWrap: "on",
    wrappingIndent: "same",
    wrappingStrategy: "advanced",
    scrollbar: {
      horizontal: "hidden",
      horizontalScrollbarSize: 0,
      vertical: "auto",
      verticalScrollbarSize: 10,
    },
    minimap: { enabled: false },
    automaticLayout: true,
    fixedOverflowWidgets: true,
    // Monaco's sticky header uses a separate default font and can look
    // inconsistent near the end of long solutions, so keep one code surface.
    stickyScroll: { enabled: false },
    scrollBeyondLastLine: false,
    renderLineHighlight: "all",
    renderWhitespace: "selection",
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true,
    matchBrackets: "always",
    bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: true },
    guides: { indentation: true, highlightActiveIndentation: true, bracketPairs: true },
    padding: { top: 10, bottom: 10 },
    autoIndent: "full",
    formatOnPaste: true,
    formatOnType: true,
    quickSuggestions: { other: true, comments: false, strings: false },
    quickSuggestionsDelay: 80,
    suggestOnTriggerCharacters: true,
    snippetSuggestions: "top",
    tabCompletion: "on",
    wordBasedSuggestions: "currentDocument",
    parameterHints: { enabled: true },
  });
  monacoSourceKey = sourceKey;
  $("liveStatus").textContent = "";
  monacoEditorInstance.layout();
  return monacoEditorInstance;
}

function initLiveEditorResize() {
  if (liveResizeInitialized) return;
  const wrap = $("liveEditorWrap");
  const editorHost = $("monacoEditor");
  const handle = $("liveResizeHandle");
  if (!wrap || !editorHost || !handle) return;
  liveResizeInitialized = true;

  const storageKey = "leetcode-live-editor-size";
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function applySize(width, height) {
    const parentWidth = wrap.parentElement ? wrap.parentElement.clientWidth : window.innerWidth;
    const nextWidth = clamp(width, Math.min(280, parentWidth), parentWidth);
    const nextHeight = clamp(height, 220, Math.max(360, Math.round(window.innerHeight * 0.78)));
    wrap.style.setProperty("--live-editor-width", `${Math.round(nextWidth)}px`);
    wrap.style.setProperty("--live-editor-height", `${Math.round(nextHeight)}px`);
    if (monacoEditorInstance) monacoEditorInstance.layout();
    return { width: nextWidth, height: nextHeight };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved && Number.isFinite(saved.height)) {
      applySize(wrap.parentElement ? wrap.parentElement.clientWidth : window.innerWidth, saved.height);
    }
  } catch (_) {
    localStorage.removeItem(storageKey);
  }

  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = wrap.getBoundingClientRect().width;
    const startHeight = editorHost.getBoundingClientRect().height;
    wrap.classList.add("is-resizing");
    handle.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const size = applySize(startWidth + moveEvent.clientX - startX, startHeight + moveEvent.clientY - startY);
      localStorage.setItem(storageKey, JSON.stringify({ height: size.height }));
    };
    const onEnd = (endEvent) => {
      wrap.classList.remove("is-resizing");
      if (handle.hasPointerCapture(endEvent.pointerId)) handle.releasePointerCapture(endEvent.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  });

  handle.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const currentWidth = wrap.getBoundingClientRect().width;
    const currentHeight = editorHost.getBoundingClientRect().height;
    const size = applySize(currentWidth, currentHeight + 60);
    localStorage.setItem(storageKey, JSON.stringify({ height: size.height }));
  });
}

function setLiveEditorLayoutMode(on) {
  const wrap = $("liveEditorWrap");
  const split = wrap && wrap.closest(".viz-split");
  if (split) split.classList.toggle("live-editing", on);
  if (wrap && on) wrap.style.setProperty("--live-editor-width", "100%");
  if (monacoEditorInstance) requestAnimationFrame(() => monacoEditorInstance.layout());
}

async function ensurePyodide() {
  if (pyodideInstance) return pyodideInstance;
  $("liveStatus").textContent = lt().loading;
  pyodideInstance = await loadPyodideRuntime();
  return pyodideInstance;
}

// Python-side tracer: wraps the user's Solution class so that calling its
// public method records (line, locals-snapshot) for every executed line,
// then returns both the trace and the return value to JS.
const TRACER_PY = `
import sys, json, math, heapq, io, contextlib, collections, bisect, functools, itertools
from collections import Counter, defaultdict, deque
from typing import List, Optional, Dict, Set, Tuple
from functools import cache, lru_cache
from bisect import bisect_left, bisect_right
from itertools import accumulate
from math import gcd

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self):
        return f"TreeNode(val={self.val})"

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def __repr__(self):
        return f"ListNode(val={self.val})"

class Node:
    def __init__(self, val=0, next=None, random=None, child=None, neighbors=None, left=None, right=None, parent=None):
        self.val = val
        self.next = next
        self.random = random
        self.child = child
        self.neighbors = neighbors if neighbors is not None else []
        self.left = left
        self.right = right
        self.parent = parent

    def __repr__(self):
        return f"Node(val={self.val})"

class HtmlParser:
    def __init__(self, edges):
        self.graph = defaultdict(list)
        for source, target in edges:
            self.graph[source].append(target)

    def getUrls(self, url):
        return self.graph.get(url, [])

class Employee:
    def __init__(self, id, importance, subordinates):
        self.id = id
        self.importance = importance
        self.subordinates = subordinates

    def __repr__(self):
        return f"Employee(id={self.id}, importance={self.importance})"

def __viz_build_list(values):
    dummy = ListNode()
    tail = dummy
    for item in values:
        tail.next = ListNode(item)
        tail = tail.next
    return dummy.next

def __viz_build_tree(values):
    if not values or values[0] is None:
        return None, []
    root = TreeNode(values[0])
    nodes = [root]
    queue = deque([root])
    index = 1
    while queue and index < len(values):
        parent = queue.popleft()
        if index < len(values) and values[index] is not None:
            parent.left = TreeNode(values[index])
            nodes.append(parent.left)
            queue.append(parent.left)
        index += 1
        if index < len(values) and values[index] is not None:
            parent.right = TreeNode(values[index])
            nodes.append(parent.right)
            queue.append(parent.right)
        index += 1
    return root, nodes

def __viz_build_node_tree(values, with_parent=False):
    if not values or values[0] is None:
        return None, []
    root = Node(values[0])
    nodes = [root]
    queue = deque([root])
    index = 1
    while queue and index < len(values):
        parent = queue.popleft()
        if index < len(values) and values[index] is not None:
            parent.left = Node(values[index], parent=parent if with_parent else None)
            nodes.append(parent.left)
            queue.append(parent.left)
        index += 1
        if index < len(values) and values[index] is not None:
            parent.right = Node(values[index], parent=parent if with_parent else None)
            nodes.append(parent.right)
            queue.append(parent.right)
        index += 1
    return root, nodes

def __viz_materialize(value, context=None, namespace=None):
    """Convert JSON-safe live arguments into LeetCode helper objects."""
    if context is None:
        context = {}
    if namespace is None:
        namespace = globals()
    if isinstance(value, dict) and value.get("__viz_type") == "binary_tree":
        values = value.get("values", [])
        root, nodes = __viz_build_tree(values)
        context["tree:" + value.get("tree_id", "root")] = (root, nodes)
        return root
    if isinstance(value, dict) and value.get("__viz_type") == "binary_tree_next":
        root, nodes = __viz_build_node_tree(value.get("values", []))
        context["tree:" + value.get("tree_id", "root")] = (root, nodes)
        return root
    if isinstance(value, dict) and value.get("__viz_type") in ("binary_tree_ref", "binary_tree_refs"):
        _root, nodes = context.get("tree:" + value.get("tree_id", "root"), (None, []))
        wanted = value.get("values", []) if value.get("__viz_type") == "binary_tree_refs" else [value.get("value")]
        matches = []
        for target in wanted:
            matches.append(next((node for node in nodes if node.val == target), None))
        return matches if value.get("__viz_type") == "binary_tree_refs" else matches[0]
    if isinstance(value, dict) and value.get("__viz_type") == "linked_list":
        return __viz_build_list(value.get("values", []))
    if isinstance(value, dict) and value.get("__viz_type") == "employee_list":
        employees = []
        for entry in value.get("values", []):
            if isinstance(entry, dict):
                employees.append(Employee(entry.get("id"), entry.get("importance"), list(entry.get("subordinates", []))))
            else:
                employees.append(Employee(entry[0], entry[1], list(entry[2])))
        return employees
    if isinstance(value, dict) and value.get("__viz_type") == "graph_node":
        nodes = {index: Node(index) for index in range(1, value.get("n", 0) + 1)}
        for left, right in value.get("edges", []):
            nodes[left].neighbors.append(nodes[right])
            nodes[right].neighbors.append(nodes[left])
        return nodes.get(value.get("start"))
    if isinstance(value, dict) and value.get("__viz_type") == "random_list":
        entries = value.get("entries", [])
        nodes = [Node(entry[0]) for entry in entries]
        for index, node in enumerate(nodes):
            node.next = nodes[index + 1] if index + 1 < len(nodes) else None
            random_index = entries[index][1]
            node.random = nodes[random_index] if 0 <= random_index < len(nodes) else None
        return nodes[0] if nodes else None
    if isinstance(value, dict) and value.get("__viz_type") == "multilevel_list":
        def make_chain(values):
            nodes = [Node(item) for item in values]
            for index, node in enumerate(nodes):
                node.prev = nodes[index - 1] if index else None
                node.next = nodes[index + 1] if index + 1 < len(nodes) else None
            return nodes
        top = make_chain(value.get("values", []))
        by_value = {node.val: node for node in top}
        for group in str(value.get("children", "")).split(";"):
            if not group or ":" not in group:
                continue
            parent_value, children_text = group.split(":", 1)
            children = make_chain([int(item) for item in children_text.split(",") if item])
            if children and int(parent_value) in by_value:
                by_value[int(parent_value)].child = children[0]
                by_value.update({node.val: node for node in children})
        return top[0] if top else None
    if isinstance(value, dict) and value.get("__viz_type") == "html_parser":
        return HtmlParser(value.get("edges", []))
    if isinstance(value, dict) and value.get("__viz_type") == "parent_tree_ref":
        root, nodes = __viz_build_node_tree(value.get("values", []), True)
        context["tree:" + value.get("tree_id", "parent_tree")] = (root, nodes)
        return next((node for node in nodes if node.val == value.get("value")), None)
    if isinstance(value, dict) and value.get("__viz_type") == "parent_tree_existing_ref":
        _root, nodes = context.get("tree:" + value.get("tree_id", "parent_tree"), (None, []))
        return next((node for node in nodes if node.val == value.get("value")), None)
    if isinstance(value, dict) and value.get("__viz_type") == "previous_result":
        return context.get("previous_result")
    if isinstance(value, dict) and value.get("__viz_type") == "intersecting_lists":
        values_a = value.get("head_a", [])
        values_b = value.get("head_b", [])
        intersection = value.get("intersection")
        index_a = next((i for i, item in enumerate(values_a) if item == intersection), len(values_a))
        index_b = next((i for i, item in enumerate(values_b) if item == intersection), len(values_b))
        shared = __viz_build_list(values_a[index_a:])
        def with_shared(prefix):
            head = __viz_build_list(prefix)
            if head is None:
                return shared
            tail = head
            while tail.next:
                tail = tail.next
            tail.next = shared
            return head
        heads = (with_shared(values_a[:index_a]), with_shared(values_b[:index_b]))
        context["intersecting_lists"] = heads
        return heads[0]
    if isinstance(value, dict) and value.get("__viz_type") == "intersecting_lists_ref":
        heads = context.get("intersecting_lists", (None, None))
        return heads[1] if value.get("head") == "b" else heads[0]
    if isinstance(value, dict) and value.get("__viz_type") == "design_instance":
        class_name = value.get("className", value.get("class_name"))
        if not isinstance(class_name, str) or not class_name:
            raise RuntimeError("A design_instance marker requires a className.")
        instance_class = namespace.get(class_name)
        if instance_class is None:
            raise RuntimeError(f"Class '{class_name}' was not found for a design_instance marker.")
        constructor_values = value.get("constructorArgs", value.get("args", []))
        if constructor_values is None:
            constructor_values = []
        elif not isinstance(constructor_values, (list, tuple)):
            constructor_values = [constructor_values]
        constructor_args = [__viz_materialize(item, context, namespace) for item in constructor_values]
        return instance_class(*constructor_args)
    if isinstance(value, list):
        return [__viz_materialize(item, context, namespace) for item in value]
    if isinstance(value, tuple):
        return tuple(__viz_materialize(item, context, namespace) for item in value)
    if isinstance(value, dict):
        return {key: __viz_materialize(item, context, namespace) for key, item in value.items()}
    return value

def __viz_run_trace(user_code, method_name, call_args, design_config=None, oracle_config=None):
    trace = []
    stdout_buffer = io.StringIO()

    def safe_repr(value, depth=0):
        try:
            if depth > 3:
                return "..."
            if isinstance(value, (int, float, str, bool)) or value is None:
                if isinstance(value, float) and (math.isinf(value) or math.isnan(value)):
                    return repr(value)
                return value
            if isinstance(value, (list, tuple)):
                return [safe_repr(v, depth + 1) for v in value[:200]]
            if isinstance(value, dict):
                return {str(k): safe_repr(v, depth + 1) for k, v in list(value.items())[:200]}
            if isinstance(value, set):
                return [safe_repr(v, depth + 1) for v in list(value)[:200]]
            return repr(value)
        except Exception:
            return "<unrepr>"

    def tracer(frame, event, arg):
        try:
            code = frame.f_code
            if code.co_filename != "<usercode>":
                return None
            if event == "line":
                snapshot = {}
                for k, v in frame.f_locals.items():
                    if k == "self":
                        continue
                    snapshot[k] = safe_repr(v)
                trace.append({"line": frame.f_lineno, "vars": snapshot, "stdout": stdout_buffer.getvalue()})
            elif event == "return" and code.co_name == method_name:
                # A line event fires before that line executes. Capture the
                # public method's return as well so the final step shows
                # mutations made by its last line (for example, a tree swap).
                snapshot = {}
                for k, v in frame.f_locals.items():
                    if k == "self":
                        continue
                    snapshot[k] = safe_repr(v)
                trace.append({"line": frame.f_lineno, "vars": snapshot, "stdout": stdout_buffer.getvalue()})
            elif event == "call":
                return tracer
        except Exception:
            pass
        return tracer

    user_code = user_code.encode("utf-8", "replace").decode("utf-8")
    compiled = compile(user_code, "<usercode>", "exec")
    # Seed common LeetCode helper names so snippets that omit their own
    # imports (as shown in the problem's code panel) still run.
    ns2 = {
        "heapq": heapq,
        "Counter": Counter,
        "defaultdict": defaultdict,
        "deque": deque,
        "List": List,
        "Optional": Optional,
        "Dict": Dict,
        "Set": Set,
        "Tuple": Tuple,
        "math": math,
        "collections": collections,
        "bisect": bisect,
        "functools": functools,
        "itertools": itertools,
        "cache": cache,
        "lru_cache": lru_cache,
        "bisect_left": bisect_left,
        "bisect_right": bisect_right,
        "accumulate": accumulate,
        "gcd": gcd,
        "TreeNode": TreeNode,
        "ListNode": ListNode,
        "Node": Node,
        "HtmlParser": HtmlParser,
        "Employee": Employee,
    }
    if oracle_config is not None:
        if oracle_config.get("type") != "guess-number":
            raise ValueError("Unknown live oracle type.")
        oracle_n, oracle_pick = oracle_config.get("n"), oracle_config.get("pick")
        if type(oracle_n) is not int or type(oracle_pick) is not int or not 1 <= oracle_pick <= oracle_n <= 2147483647:
            raise ValueError("Invalid guess-number API configuration.")
        def guess(number):
            if type(number) is not int or not 1 <= number <= oracle_n:
                raise ValueError("guess(number) requires an integer in [1, n].")
            return -1 if number > oracle_pick else 1 if number < oracle_pick else 0
        ns2["guess"] = guess
    exec(compiled, ns2)
    sys.settrace(tracer)
    try:
        materialize_context = {}
        with contextlib.redirect_stdout(stdout_buffer):
            if design_config:
                if design_config.get("functionName"):
                    function2 = ns2.get(design_config["functionName"])
                    if function2 is None:
                        raise RuntimeError(f"Function '{design_config['functionName']}' was not found.")
                    materialized_args = [__viz_materialize(value, materialize_context, ns2) for value in design_config.get("args", [])]
                    result = function2(*materialized_args)
                else:
                    class2 = ns2.get(design_config.get("className"))
                    if class2 is None:
                        raise RuntimeError(f"Class '{design_config.get('className')}' was not found.")
                    constructor_args = [__viz_materialize(value, materialize_context, ns2) for value in design_config.get("constructorArgs", [])]
                    instance2 = class2(*constructor_args)
                    result = []
                    for operation in design_config.get("operations", []):
                        operation_args = [__viz_materialize(value, materialize_context, ns2) for value in operation.get("args", [])]
                        operation_result = getattr(instance2, operation["name"])(*operation_args)
                        materialize_context["previous_result"] = operation_result
                        result.append(operation_result)
                    if design_config.get("resultMode") == "last":
                        result = result[-1] if result else None
            else:
                Solution2 = ns2.get("Solution")
                if Solution2 is None:
                    raise RuntimeError("No 'class Solution' found in the code.")
                instance2 = Solution2()
                method2 = getattr(instance2, method_name, None)
                if method2 is None:
                    raise RuntimeError(f"Solution has no method '{method_name}'.")
                materialized_args = [__viz_materialize(value, materialize_context, ns2) for value in call_args]
                result = method2(*materialized_args)
    finally:
        sys.settrace(None)

    return {"trace": trace, "result": safe_repr(result), "stdout": stdout_buffer.getvalue()}
`;

async function runLiveCode() {
  hide("liveError");
  $("liveStatus").textContent = lt().running;
  try {
    const editor = await ensureMonacoEditor();
    const userCode = editor.getValue();
    const liveCall = await collectLiveCallArgs();
    const args = liveCall.args || [];
    const design = liveCall.design || null;
    const oracle = liveCall.oracle || null;
    const pyodide = await ensurePyodide();

    if (!pyodide.__viz_tracer_loaded) {
      pyodide.runPython(TRACER_PY);
      pyodide.__viz_tracer_loaded = true;
    }

    // Infer the public method name from the code itself (first "def X(self" after "class Solution").
    const methodMatch = userCode.match(/class\s+Solution\b[\s\S]*?def\s+(\w+)\s*\(\s*self/);
    if (!methodMatch && !design) {
      throw new Error(lang === "vi" ? "Không tìm thấy 'class Solution' với 1 phương thức nhận self." : "Could not find a 'class Solution' with a method taking self.");
    }
    const methodName = methodMatch ? methodMatch[1] : (design.functionName || design.className || "design");

    pyodide.globals.set("__viz_user_code", userCode);
    pyodide.globals.set("__viz_method_name", methodName);
    pyodide.globals.set("__viz_call_args", pyodide.toPy(args));
    pyodide.globals.set("__viz_design", design ? pyodide.toPy(design) : null);
    pyodide.globals.set("__viz_oracle", oracle ? pyodide.toPy(oracle) : null);

    const runFn = pyodide.globals.get("__viz_run_trace");
    const resultProxy = runFn(
      pyodide.globals.get("__viz_user_code"),
      methodName,
      pyodide.globals.get("__viz_call_args"),
      pyodide.globals.get("__viz_design"),
      pyodide.globals.get("__viz_oracle"),
    );
    const resultJs = resultProxy.toJs({ dict_converter: Object.fromEntries });
    resultProxy.destroy && resultProxy.destroy();

    const rawTrace = resultJs.trace || [];
    liveSteps = rawTrace.map((entry, idx) => ({
      line: entry.line,
      vars: entry.vars || {},
      stdout: entry.stdout || "",
      isLast: idx === rawTrace.length - 1,
    }));
    const answer = resultJs.result;

    if (liveSteps.length === 0) {
      $("liveStatus").textContent = lt().doneNoTrace;
    } else {
      $("liveStatus").textContent = lt().ready(liveSteps.length);
    }

    enterLiveStepMode(userCode, answer);
  } catch (err) {
    $("liveStatus").textContent = "";
    showRichError("liveError", formatPythonRuntimeError(err));
  }
}

// Replace the normal canned-animation step list with the real traced run,
// reusing the existing controls (Prev/Next/Play) and code-highlight logic.
function enterLiveStepMode(userCode, answer) {
  const userLines = userCode.split("\n");
  steps = liveSteps.map((s) => ({
    title: { vi: `Dòng ${s.line}`, en: `Line ${s.line}` },
    codeLines: [s.line],
    vars: Object.entries(s.vars).map(([name, value]) => ({ name, value: formatLiveValue(value) })),
    stdout: s.stdout,
    note: { vi: "", en: "" },
    final: s.isLast,
    __live: true,
  }));
  answerValue = formatLiveValue(answer);
  stepIndex = 0;
  resetBreakpoints();
  renderLiveCodePanel(userLines);
  // Collapse Monaco and show the read-only highlighted trace. This is still
  // live mode, so keep only "Exit editor" visible in the mode bar.
  setLiveEditorLayoutMode(false);
  $("liveEditorWrap").classList.add("hidden");
  $("codePanel").classList.remove("hidden");
  $("liveEditBtn").classList.add("hidden");
  renderStep();
}

// Simple, generic right-hand panel for live-run steps: just a clean list of
// the current local variables (mirrors a real debugger's "locals" view).
// This intentionally does not try to guess a specialized visualization
// (heap tree, grid, graph...) since the user's edited code can differ
// arbitrarily from the shape the canned builders expect.
function renderLiveVarsView(step) {
  const el = $("liveVarsView");
  const entries = step.vars || [];
  const varsHtml = entries.length === 0
    ? `<div class="live-vars-empty">${lang === "vi" ? "Chưa có biến local nào tại dòng này." : "No local variables at this line yet."}</div>`
    : `<div class="live-vars-list">${entries.map((v) => `
      <div class="live-var-row">
        <span class="live-var-name">${escapeHtml(v.name)}</span>
        <span class="live-var-value">${escapeHtml(v.value)}</span>
      </div>`).join("")}</div>`;
  const stdout = step.stdout || "";
  const stdoutHtml = stdout
    ? `<pre class="live-console-output">${escapeHtml(stdout)}</pre>`
    : `<div class="live-console-empty">${lang === "vi" ? "Chưa có output ở step này." : "No output at this step yet."}</div>`;
  el.innerHTML = `
    <div class="live-vars-title">${lang === "vi" ? "Biến local (thật, từ Python)" : "Local variables (real, from Python)"}</div>
    ${varsHtml}
    <div class="live-console-panel">
      <div class="live-vars-title">${lang === "vi" ? "Kết quả print()" : "Console output (print)"}</div>
      ${stdoutHtml}
    </div>`;
}

function formatLiveValue(value) {
  if (Array.isArray(value)) return `[${value.map(formatLiveValue).join(", ")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).map(([k, v]) => `${k}: ${formatLiveValue(v)}`).join(", ")}}`;
  }
  if (value === null || value === undefined) return "None";
  return String(value);
}

// Render the user's edited code (read-only, line-numbered) into the same
// #codePanel structure that updateCodeHighlight()/renderVars() expect,
// so stepping through live-run steps highlights lines exactly like the
// canned animations do.
function renderLiveCodePanel(userLines) {
  const panel = $("codePanel");
  panel.innerHTML = "";
  panel.classList.remove("hidden");
  const pyBlock = document.createElement("div");
  pyBlock.className = "code-lang-block";
  pyBlock.dataset.codeLang = "python";
  const section = document.createElement("div");
  section.className = "code-section";
  section.dataset.block = "1";
  userLines.forEach((line, idx) => {
    const row = document.createElement("div");
    row.className = "code-line";
    row.dataset.line = idx + 1;
    const ln = document.createElement("span");
    ln.className = "ln";
    ln.textContent = idx + 1;
    const txt = document.createElement("span");
    txt.className = "txt";
    txt.innerHTML = renderCodeLineHtml(line);
    row.appendChild(ln);
    row.appendChild(txt);
    section.appendChild(row);
  });
  pyBlock.appendChild(section);
  panel.appendChild(pyBlock);
}

// The live editor is opt-in. Loading another problem or starting the normal
// visualization must return to the regular code panel instead of leaving a
// stale Monaco editor (and stale Solution class) visible from the last run.
function resetLoadedLiveEditorState() {
  liveMode = false;
  liveSteps = [];
  setCodeSnippetBlurred(readCodeSnippetBlurPreference());
  clearTimeout(liveCopyResetTimer);
  liveCopyResetTimer = null;
  if ($("liveCopyBtn")) {
    setLiveCopyButtonState(false);
  }
  setLiveEditorLayoutMode(false);
  $("liveExitBtn").classList.add("hidden");
  $("liveEditorWrap").classList.add("hidden");
  $("codePanel").classList.remove("hidden");
  $("liveEditBtn").classList.remove("hidden");
  $("codeBlurBtn").classList.remove("hidden");
  $("liveVarsView").classList.add("hidden");
  hide("liveError");
  $("liveStatus").textContent = "";
}

function setLiveMode(on) {
  liveMode = on;
  setLiveEditorLayoutMode(on);
  $("liveEditBtn").classList.toggle("hidden", on);
  $("codeBlurBtn").classList.toggle("hidden", on);
  $("liveExitBtn").classList.toggle("hidden", !on);
  $("liveEditorWrap").classList.toggle("hidden", !on);
  $("codePanel").classList.toggle("hidden", on);
  if (!on) {
    setCodeSnippetBlurred(readCodeSnippetBlurPreference());
    // Restore the canned visualization exactly as it was before entering live mode.
    renderCode();
    if (problemData) {
      // Re-run the last canned solve so the right-hand visualization comes back.
      runViz();
    }
  }
}

async function openLiveEditor() {
  setCodeSnippetBlurred(false);
  setLiveMode(true);
  await ensureMonacoEditor();
}
$("liveExitBtn") && $("liveExitBtn").addEventListener("click", () => {
  setLiveMode(false);
});

// Pressing ESC while the live editor is open behaves like clicking "Exit editor".
// Monaco handles ESC for its own widgets (suggest/find) and stops propagation,
// so this only fires when no such widget intercepts the key first.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !liveMode) return;
  const exitButton = $("liveExitBtn");
  if (!exitButton || exitButton.classList.contains("hidden")) return;
  e.preventDefault();
  exitButton.click();
});

$("liveRunBtn") && $("liveRunBtn").addEventListener("click", runLiveCode);

function setLiveCopyButtonState(copied) {
  const button = $("liveCopyBtn");
  if (!button) return;
  button.classList.toggle("copied", copied);
  const label = copied ? lt().copied : t().liveCopyBtn;
  button.setAttribute("aria-label", label);
  button.title = label;
}

async function copyLiveEditorCode() {
  const button = $("liveCopyBtn");
  if (!button) return;
  try {
    const editor = await ensureMonacoEditor();
    const code = editor.getValue();
    let copied = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(code);
        copied = true;
      } catch (_clipboardError) {
        copied = false;
      }
    }
    if (!copied) {
      const fallback = document.createElement("textarea");
      fallback.value = code;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      copied = document.execCommand("copy");
      fallback.remove();
      if (!copied) throw new Error("Copy command failed");
    }
    clearTimeout(liveCopyResetTimer);
    setLiveCopyButtonState(true);
    $("liveStatus").textContent = "";
    liveCopyResetTimer = setTimeout(() => {
      setLiveCopyButtonState(false);
    }, 1800);
  } catch (_error) {
    setLiveCopyButtonState(false);
    $("liveStatus").textContent = lt().copyFailed;
  }
}

$("liveCopyBtn") && $("liveCopyBtn").addEventListener("click", copyLiveEditorCode);

$("liveClearBtn") && $("liveClearBtn").addEventListener("click", async () => {
  const editor = await ensureMonacoEditor();
  const skeleton = clearedSolutionSkeleton(editor.getValue() || currentPrimaryCode());
  editor.setValue(skeleton);
  const skeletonLines = skeleton.split("\n");
  const bodyLine = skeletonLines.length;
  editor.setPosition({ lineNumber: bodyLine, column: skeletonLines[bodyLine - 1].length + 1 });
  editor.focus();
  hide("liveError");
  $("liveStatus").textContent = "";
});

$("liveResetBtn") && $("liveResetBtn").addEventListener("click", async () => {
  const editor = await ensureMonacoEditor();
  editor.setValue(currentPrimaryCode());
  monacoSourceKey = currentLiveSourceKey();
  hide("liveError");
  $("liveStatus").textContent = "";
});

initLiveEditorResize();

