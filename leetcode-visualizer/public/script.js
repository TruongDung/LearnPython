const $ = (id) => document.getElementById(id);

let lang = "en";
let currentProblemId = null;
let problemData = null; // loaded problem data (bilingual)
let steps = [];
let stepIndex = 0;
let answerValue = null; // answer from the current run
let playTimer = null;
let catalogData = null; // problem list grouped by algorithm

// ---- UI strings by language ----
const I18N = {
  vi: {
    subtitle: "Nhập số bài LeetCode để xem thuật toán chạy từng bước",
    problemIdLabel: "Số bài LeetCode",
    loadBtn: "Tải bài",
    arrLabel: "Mảng đầu vào (cách nhau bởi dấu phẩy)",
    runBtn: "Trực quan hóa",
    first: "⏮",
    prev: "◀ Lùi",
    play: "▶ Chạy",
    playStop: "⏸ Dừng",
    next: "Tiến ▶",
    last: "⏭",
    stepCounter: (a, b) => `Bước ${a}/${b}`,
    answer: (v) => `Đáp án: ${v}`,
    timeLabel: "Thời gian",
    spaceLabel: "Bộ nhớ",
    varsLabel: "Biến (debug)",
    approachLabel: "Ý chính",
    kbdHint: "Phím tắt: ← Lùi · → Tiến · Home Về đầu · End Đến cuối · Space Chạy/Dừng",
    errEmptyId: "Vui lòng nhập số bài.",
    errLoad: "Không tải được bài.",
    errConn: "Lỗi kết nối tới server.",
    errArr: "Nhập các số nguyên dương, cách nhau bởi dấu phẩy. VD: 2,2,1,2,1",
    errSolve: "Không xử lý được.",
  },
  en: {
    subtitle: "Enter a LeetCode problem number to watch the algorithm run step by step",
    problemIdLabel: "LeetCode problem number",
    loadBtn: "Load",
    arrLabel: "Input array (comma separated)",
    runBtn: "Visualize",
    first: "⏮",
    prev: "◀ Prev",
    play: "▶ Play",
    playStop: "⏸ Pause",
    next: "Next ▶",
    last: "⏭",
    stepCounter: (a, b) => `Step ${a}/${b}`,
    answer: (v) => `Answer: ${v}`,
    timeLabel: "Time",
    spaceLabel: "Space",
    varsLabel: "Variables (debug)",
    approachLabel: "Key Idea",
    kbdHint: "Shortcuts: ← Prev · → Next · Home First · End Last · Space Play/Pause",
    errEmptyId: "Please enter a problem number.",
    errLoad: "Could not load the problem.",
    errConn: "Connection error to server.",
    errArr: "Enter positive integers separated by commas. E.g. 2,2,1,2,1",
    errSolve: "Could not process the request.",
  },
};

const t = () => I18N[lang];

// ---- Language switching ----
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

function setLang(newLang) {
  lang = newLang;
  document.documentElement.lang = newLang;
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === newLang);
  });
  applyStaticStrings();
  renderProblem();
  renderCatalog();
  if (steps.length) renderStep();
}function applyStaticStrings() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = t()[key];
    if (typeof val === "string") el.textContent = val;
  });
  // Play/Pause button depends on state
  $("playBtn").textContent = playTimer ? t().playStop : t().play;
}

// ---- Problem catalog grouped by algorithm ----
async function loadCatalog() {
  try {
    const res = await fetch("/api/problems");
    const data = await res.json();
    if (res.ok) {
      catalogData = data.groups;
      renderCatalog();
    }
  } catch (err) {
    // ignore error, user can still enter problem number manually
  }
}

function renderCatalog() {
  const container = $("catalog");
  if (!catalogData) return;
  container.innerHTML = "";

  catalogData.forEach((group) => {
    const groupEl = document.createElement("div");
    groupEl.className = "cat-group";

    const titleEl = document.createElement("div");
    titleEl.className = "cat-title";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "cat-toggle";
    toggleBtn.textContent = "+";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = pick(group);
    const countSpan = document.createElement("span");
    countSpan.className = "count";
    countSpan.textContent = `(${group.problems.length})`;

    titleEl.appendChild(toggleBtn);
    titleEl.appendChild(nameSpan);
    titleEl.appendChild(countSpan);

    const itemsEl = document.createElement("div");
    itemsEl.className = "cat-items collapsed";

    // Show recommended learning order banner if available
    if (group.recommendedOrderLabel) {
      const banner = document.createElement("div");
      banner.className = "cat-order-banner";
      banner.innerHTML = `<span class="cat-order-icon">✨</span><span>${pick(group.recommendedOrderLabel)}</span>`;
      itemsEl.appendChild(banner);
    }

    const hasOrder = !!group.recommendedOrderLabel;
    group.problems.forEach((p, idx) => {
      const chip = document.createElement("button");
      chip.className = "prob-chip" + (p.id === currentProblemId ? " active" : "");
      chip.dataset.id = p.id;

      if (hasOrder) {
        const step = document.createElement("span");
        step.className = "prob-step";
        step.textContent = idx + 1;
        chip.appendChild(step);
      }

      const pid = document.createElement("span");
      pid.className = "pid";
      pid.textContent = `#${p.id}`;

      const pname = document.createElement("span");
      pname.className = "pname";
      pname.textContent = pick(p.title);

      chip.appendChild(pid);
      chip.appendChild(pname);
      if (p.difficulty) {
        const diff = document.createElement("span");
        diff.className = `diff diff-${p.difficulty}`;
        diff.textContent = p.difficulty;
        chip.appendChild(diff);
      }
      chip.addEventListener("click", () => {
        $("problemId").value = p.id;
        loadProblem();
      });
      itemsEl.appendChild(chip);
    });

    // Toggle collapse/expand
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const collapsed = itemsEl.classList.toggle("collapsed");
      toggleBtn.textContent = collapsed ? "+" : "−";
    });

    groupEl.appendChild(titleEl);
    groupEl.appendChild(itemsEl);
    container.appendChild(groupEl);
  });
}

function markActiveChip() {
  $("catalog")
    .querySelectorAll(".prob-chip")
    .forEach((chip) => {
      const isActive = Number(chip.dataset.id) === currentProblemId;
      chip.classList.toggle("active", isActive);
      // Auto-expand the parent group of the active problem
      if (isActive) {
        const group = chip.closest(".cat-group");
        if (group) {
          const items = group.querySelector(".cat-items");
          const toggle = group.querySelector(".cat-toggle");
          if (items && items.classList.contains("collapsed")) {
            items.classList.remove("collapsed");
            if (toggle) toggle.textContent = "−";
          }
        }
      }
    });
}

// ---- Load problem info ----
$("loadBtn").addEventListener("click", loadProblem);$("problemId").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadProblem();
});

async function loadProblem() {
  const id = $("problemId").value.trim();
  hide("searchError");
  if (!id) {
    return showError("searchError", t().errEmptyId);
  }

  try {
    const res = await fetch(`/api/problem/${id}`);
    const data = await res.json();
    if (!res.ok) {
      return showError("searchError", data.error || t().errLoad);
    }

    currentProblemId = data.id;
    localStorage.setItem("lastProblemId", data.id);
    problemData = data;
    renderProblem();
    $("arrInput").value = Array.isArray(data.defaultInput)
      ? data.defaultInput.join(",")
      : data.defaultInput;
    markActiveChip();

    show("problemPanel");
    hide("vizPanel");
    steps = [];
    stopPlay();
  } catch (err) {
    showError("searchError", t().errConn);
  }
}

// Render problem description panel in current language
function renderProblem() {
  if (!problemData) return;
  $("problemId2").textContent = `#${problemData.id}`;
  const titleEl = $("problemTitle");
  titleEl.textContent = pick(problemData.title);
  if (problemData.slug) {
    titleEl.href = `https://leetcode.com/problems/${problemData.slug}/`;
    titleEl.target = "_blank";
    titleEl.rel = "noopener";
  } else {
    titleEl.removeAttribute("href");
  }

  // Difficulty badge
  const diffEl = $("problemDiff");
  if (problemData.difficulty) {
    diffEl.textContent = problemData.difficulty;
    diffEl.className = `diff diff-${problemData.difficulty}`;
    diffEl.classList.remove("hidden");
  } else {
    diffEl.classList.add("hidden");
  }

  $("problemTitleVi").textContent = pick(problemData.titleVi);
  $("problemStatement").textContent = pick(problemData.statement);
  // Input label: use custom label if provided, otherwise default
  $("arrLabel").textContent = problemData.inputLabel
    ? pick(problemData.inputLabel)
    : t().arrLabel;
  renderComplexity();
  renderApproach();
  renderExtraParams();
}

// Render the key-idea (approach) summary as bullet points
function renderApproach() {
  const box = $("approachBox");
  const list = $("approachList");
  const approach = problemData.approach;
  if (!approach || !approach.length) {
    box.classList.add("hidden");
    return;
  }
  list.innerHTML = "";
  approach.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = pick(item);
    list.appendChild(li);
  });
  box.classList.remove("hidden");
}

// Display time/space complexity analysis
function renderComplexity() {
  const cx = problemData.complexity;
  if (!cx) {
    hide("complexity");
    hide("vizComplexity");
    return;
  }
  $("cxTime").textContent = cx.time;
  $("cxSpace").textContent = cx.space;
  $("cxNote").textContent = pick(cx.note);
  show("complexity");

  // Compact version in visualization area
  $("vizCxTime").textContent = cx.time;
  $("vizCxSpace").textContent = cx.space;
  show("vizComplexity");
}

// Render extra parameter inputs (e.g. k for problem 1004), preserve values on language switch
function renderExtraParams() {
  const container = $("extraParams");
  const params = problemData.extraParams || [];
  const existing = {};
  container.querySelectorAll("[data-param]").forEach((el) => {
    existing[el.dataset.param] = el.value;
  });

  container.innerHTML = "";
  params.forEach((p) => {
    const wrap = document.createElement("div");
    wrap.className = "param";

    const label = document.createElement("label");
    label.textContent = pick(p.label);
    label.setAttribute("for", `param-${p.key}`);

    let inputEl;
    if (p.type === "select" && p.options) {
      inputEl = document.createElement("select");
      inputEl.id = `param-${p.key}`;
      inputEl.dataset.param = p.key;
      inputEl.dataset.type = "number";
      p.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = pick(opt.label);
        inputEl.appendChild(option);
      });
      inputEl.value = existing[p.key] !== undefined ? existing[p.key] : p.default;
    } else {
      inputEl = document.createElement("input");
      inputEl.type = p.type === "string" ? "text" : "number";
      inputEl.id = `param-${p.key}`;
      inputEl.dataset.param = p.key;
      inputEl.dataset.type = p.type || "number";
      inputEl.value = existing[p.key] !== undefined ? existing[p.key] : p.default;
    }

    wrap.appendChild(label);
    wrap.appendChild(inputEl);
    container.appendChild(wrap);
  });
}

// Get string by language; supports both plain strings and {vi,en} objects
function pick(field) {
  if (field && typeof field === "object") return field[lang] ?? field.en ?? field.vi;
  return field;
}

// ---- Run algorithm ----
$("runBtn").addEventListener("click", runViz);

async function runViz() {
  hide("runError");

  const isString = problemData && problemData.inputKind === "string";
  let input;

  if (isString) {
    input = $("arrInput").value.trim();
    if (input.length === 0) {
      return showError("runError", t().errArr);
    }
  } else {
    const raw = $("arrInput").value.trim();
    input = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);

    const allowNegative = problemData && problemData.inputKind === "integer";
    const invalid =
      input.length === 0 ||
      input.some((n) => !Number.isInteger(n) || (!allowNegative && n < 0));
    if (invalid) {
      return showError("runError", t().errArr);
    }
  }

  // Collect extra params (preserve string/number type per definition)
  const params = {};
  $("extraParams")
    .querySelectorAll("[data-param]")
    .forEach((inp) => {
      params[inp.dataset.param] =
        inp.dataset.type === "string" ? inp.value : Number(inp.value);
    });

  try {
    const res = await fetch(`/api/problem/${currentProblemId}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, params }),
    });
    const data = await res.json();
    if (!res.ok) {
      return showError("runError", data.error || t().errSolve);
    }

    steps = data.steps;
    answerValue = data.answer;
    stepIndex = 0;
    show("vizPanel");
    renderCode();
    renderStep();
    $("vizPanel").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    showError("runError", t().errConn);
  }
}

// ---- Step-by-step controls ----
$("firstBtn").addEventListener("click", () => {
  stopPlay();
  stepIndex = 0;
  renderStep();
});
$("prevBtn").addEventListener("click", () => {
  stopPlay();
  if (stepIndex > 0) stepIndex--;
  renderStep();
});
$("nextBtn").addEventListener("click", () => {
  stopPlay();
  if (stepIndex < steps.length - 1) stepIndex++;
  renderStep();
});
$("lastBtn").addEventListener("click", () => {
  stopPlay();
  stepIndex = steps.length - 1;
  renderStep();
});
$("playBtn").addEventListener("click", togglePlay);

// ---- Keyboard navigation ----
document.addEventListener("keydown", (e) => {
  // Skip when typing in input fields
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  // Only active when visualization is visible
  if (!steps.length || $("vizPanel").classList.contains("hidden")) return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      $("prevBtn").click();
      break;
    case "ArrowRight":
      e.preventDefault();
      $("nextBtn").click();
      break;
    case "Home":
      e.preventDefault();
      $("firstBtn").click();
      break;
    case "End":
      e.preventDefault();
      $("lastBtn").click();
      break;
    case " ":
      e.preventDefault();
      $("playBtn").click();
      break;
    default:
      break;
  }
});

function togglePlay() {
  if (playTimer) {
    stopPlay();
    return;
  }
  if (stepIndex >= steps.length - 1) stepIndex = 0;
  $("playBtn").textContent = t().playStop;
  playTimer = setInterval(() => {
    if (stepIndex < steps.length - 1) {
      stepIndex++;
      renderStep();
    } else {
      stopPlay();
    }
  }, 1100);
}

function stopPlay() {
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
  $("playBtn").textContent = t().play;
}

// ---- Python code syntax highlighting ----
function highlightPython(line) {
  // Tokenize the line to avoid breaking HTML inside tokens
  const tokens = [];
  let remaining = line;

  // Patterns in priority order
  const patterns = [
    { type: "str", re: /^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
    { type: "comment", re: /^#.*$/ },
    { type: "kw", re: /^(?:class|def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|as|self|break|continue|pass|lambda|with|yield|raise|try|except|finally)\b/ },
    { type: "builtin", re: /^(?:len|range|max|min|abs|sum|int|str|float|list|dict|set|print|enumerate|zip|sorted|type|isinstance|map|filter|super|__init__)\b/ },
    { type: "num", re: /^-?\d+\.?\d*/ },
    { type: "ident", re: /^\w+/ },
    { type: "space", re: /^\s+/ },
    { type: "op", re: /^[^\w\s]+/ },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const p of patterns) {
      const m = remaining.match(p.re);
      if (m) {
        tokens.push({ type: p.type, text: m[0] });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "op", text: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  // Mark function/class names (token after def/class keyword)
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "kw" && (tokens[i].text === "def" || tokens[i].text === "class")) {
      // Find next ident token (skip spaces)
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === "space") continue;
        if (tokens[j].type === "ident" || tokens[j].type === "builtin") {
          tokens[j].type = tokens[i].text === "def" ? "fn" : "cls";
        }
        break;
      }
    }
  }

  // Render tokens to HTML
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const classMap = { kw: "py-kw", builtin: "py-builtin", fn: "py-fn", cls: "py-cls", str: "py-str", comment: "py-comment", num: "py-num" };

  return tokens.map((t) => {
    const cls = classMap[t.type];
    const escaped = esc(t.text);
    return cls ? `<span class="${cls}">${escaped}</span>` : escaped;
  }).join("");
}

function renderCode() {
  const panel = $("codePanel");
  const code = (problemData && problemData.code) || [];
  const code2 = (problemData && problemData.code2) || null;
  panel.innerHTML = "";
  if (code.length === 0 && !code2) {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");

  // Helper: create a copy button for a code block
  function createCopyBtn(codeLines) {
    const btn = document.createElement("button");
    btn.className = "code-copy-btn";
    btn.title = "Copy";
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    btn.addEventListener("click", () => {
      const text = codeLines.join("\n");
      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
          btn.classList.remove("copied");
        }, 2000);
      });
    });
    return btn;
  }

  // Render primary code
  if (code.length > 0) {
    const section = document.createElement("div");
    section.className = "code-section";

    if (code2) {
      const label = document.createElement("div");
      label.className = "code-section-label";
      const customLabel = problemData && problemData.codeLabel;
      label.textContent = customLabel ? pick(customLabel) : (lang === "vi" ? "Cách 1" : "Approach 1");
      section.appendChild(label);
    }

    section.appendChild(createCopyBtn(code));

    code.forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "code-line";
      row.dataset.line = idx + 1;

      const ln = document.createElement("span");
      ln.className = "ln";
      ln.textContent = idx + 1;

      const txt = document.createElement("span");
      txt.className = "txt";
      txt.innerHTML = highlightPython(line);

      row.appendChild(ln);
      row.appendChild(txt);
      section.appendChild(row);
    });

    panel.appendChild(section);
  }

  // Render secondary code (code2) if available
  if (code2) {
    const section = document.createElement("div");
    section.className = "code-section";

    const sep = document.createElement("div");
    sep.className = "code-section-label";
    const custom2Label = problemData && problemData.code2Label;
    sep.textContent = custom2Label ? pick(custom2Label) : (lang === "vi" ? "Cách 2" : "Approach 2");
    section.appendChild(sep);

    section.appendChild(createCopyBtn(code2));

    code2.forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "code-line code2-line";
      row.dataset.line2 = idx + 1;

      const ln = document.createElement("span");
      ln.className = "ln";
      ln.textContent = idx + 1;

      const txt = document.createElement("span");
      txt.className = "txt";
      txt.innerHTML = highlightPython(line);

      row.appendChild(ln);
      row.appendChild(txt);
      section.appendChild(row);
    });

    panel.appendChild(section);
  }
}

function updateCodeHighlight(activeLines, codeBlock) {
  const set = new Set(activeLines);
  const targetAttr = codeBlock === 2 ? "line2" : "line";
  $("codePanel")
    .querySelectorAll(".code-line")
    .forEach((row) => {
      const lineNum = Number(row.dataset[targetAttr]);
      row.classList.toggle("active", !isNaN(lineNum) && set.has(lineNum));
    });
}

// ---- Variables panel (debug) ----
// Format variable value for display (array -> "[a, b, c]").
function formatVarValue(value) {
  if (Array.isArray(value)) return `[${value.join(", ")}]`;
  if (value === null) return "null";
  return String(value);
}

// Render variables for current step; highlight variables that changed from previous step.
function renderVars(step, prevStep) {
  const panel = $("varsPanel");
  const grid = $("varsGrid");
  const vars = step.vars;

  if (!vars || !vars.length) {
    panel.classList.add("hidden");
    return;
  }

  const prevValues = {};
  if (prevStep && Array.isArray(prevStep.vars)) {
    prevStep.vars.forEach((v) => {
      prevValues[v.name] = formatVarValue(v.value);
    });
  }

  grid.innerHTML = "";
  vars.forEach((v) => {
    const valStr = formatVarValue(v.value);
    const item = document.createElement("div");
    item.className = "var-item";
    if (prevStep && v.name in prevValues && prevValues[v.name] !== valStr) {
      item.classList.add("changed");
    }

    const name = document.createElement("span");
    name.className = "var-name";
    name.textContent = v.name;

    const eq = document.createElement("span");
    eq.className = "var-eq";
    eq.textContent = "=";

    const value = document.createElement("span");
    value.className = "var-value";
    value.textContent = valStr;

    item.appendChild(name);
    item.appendChild(eq);
    item.appendChild(value);
    grid.appendChild(item);
  });

  panel.classList.remove("hidden");
}

// ---- Bar chart renderer (array visualization) ----
function renderBars(step) {
  const maxVal = Math.max(...steps.flatMap((s) => (s.arr || []).map((v) => Math.abs(v))), 1);
  const barsEl = $("bars");
  barsEl.innerHTML = "";

  step.arr.forEach((val, i) => {
    const marked = (step.mark || []).includes(i);
    const highlighted = (step.highlight || []).includes(i);

    const bar = document.createElement("div");
    bar.className = "bar" + (marked ? " final" : highlighted ? " highlight" : "");

    const col = document.createElement("div");
    col.className = "col";
    col.style.height = `${(Math.abs(val) / maxVal) * 180 + 4}px`;
    if (val < 0) col.classList.add("neg");

    const valEl = document.createElement("div");
    valEl.className = "val";
    valEl.textContent = val;

    const idxEl = document.createElement("div");
    idxEl.className = "idx";
    idxEl.textContent = `[${i}]`;

    bar.appendChild(valEl);
    bar.appendChild(col);
    if (step.sub) {
      const subEl = document.createElement("div");
      subEl.className = "dp";
      subEl.textContent = step.sub[i];
      bar.appendChild(subEl);
    }
    bar.appendChild(idxEl);
    barsEl.appendChild(bar);
  });
}

// ---- BFS Grid renderer (pathfinding) ----
function renderBfsGrid(step) {
  const { cells, rows, cols } = step.bfsGrid;
  const el = $("bfsGridView");
  el.style.textAlign = "center";
  let html = `<div class="bfs-grid" style="grid-template-columns:repeat(${cols},32px)">`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const cls = cell.cls || "empty";
      const label = cell.label || "";
      html += `<div class="bfs-cell ${cls}">${label}</div>`;
    }
  }
  html += "</div>";
  el.innerHTML = html;
}

// ---- Grid renderer (2D DP) ----
function renderGrid(step) {
  const { dp, text1, text2, hlCell, pathCells } = step.grid;
  const pathSet = new Set((pathCells || []).map(([r, c]) => `${r},${c}`));
  const m = dp.length - 1;
  const n = dp[0].length - 1;

  let html = '<table class="dp-grid"><thead><tr><th></th><th></th>';
  for (let j = 0; j < n; j++) html += `<th>${text2[j]}</th>`;
  html += "</tr></thead><tbody>";

  for (let i = 0; i <= m; i++) {
    html += "<tr>";
    html += `<td class="row-label">${i === 0 ? "" : text1[i - 1]}</td>`;
    for (let j = 0; j <= n; j++) {
      let cls = "dp-cell";
      if (hlCell && hlCell[0] === i && hlCell[1] === j) cls += " hl";
      if (pathSet.has(`${i},${j}`)) cls += " path";
      html += `<td class="${cls}">${dp[i][j]}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  $("gridView").innerHTML = html;
}

// ---- Tree renderer (Trie) ----
function escapeXml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function renderTree(step) {
  const nodes = step.tree.nodes;
  const maxX = Math.max(0, ...nodes.map((n) => n.x));
  const maxY = Math.max(0, ...nodes.map((n) => n.y));
  const colW = 60;
  const rowH = 78;
  const pad = 34;
  const r = 18;
  const width = pad * 2 + maxX * colW;
  const height = pad * 2 + maxY * rowH;
  const px = (x) => pad + x * colW;
  const py = (y) => pad + y * rowH;

  const pos = {};
  nodes.forEach((n) => {
    pos[n.id] = { x: px(n.x), y: py(n.y) };
  });

  let edges = "";
  nodes.forEach((n) => {
    if (n.parentId === null || n.parentId === undefined) return;
    const p = pos[n.parentId];
    const c = pos[n.id];
    if (!p) return;
    edges += `<line x1="${p.x}" y1="${p.y}" x2="${c.x}" y2="${c.y}" class="tree-edge" />`;
  });

  let circles = "";
  nodes.forEach((n) => {
    const c = pos[n.id];
    const cls = "tree-node" + (n.hl ? " hl" : "") + (n.isWord ? " word" : "");
    circles += `<g class="${cls}">`;
    if (n.isWord) circles += `<circle cx="${c.x}" cy="${c.y}" r="${r + 4}" class="tree-ring" />`;
    circles += `<circle cx="${c.x}" cy="${c.y}" r="${r}" />`;
    circles += `<text x="${c.x}" y="${c.y}" dy="0.35em" text-anchor="middle">${escapeXml(n.label)}</text>`;
    circles += `</g>`;
  });

  $("treeView").innerHTML =
    `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="tree-svg">` +
    edges +
    circles +
    `</svg>`;
}

// ---- Graph renderer (directed weighted graph) ----
function renderGraph(step) {
  const { nodes, edges, hlNodes, hlEdges, visitedNodes } = step.graph;
  const n = nodes.length;
  const r = 24;
  const pad = 60;
  const size = Math.max(280, n * 50);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - pad;

  // Position nodes in a circle
  const pos = {};
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    pos[node.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const hlNodeSet = new Set(hlNodes || []);
  const visitedSet = new Set(visitedNodes || []);
  const hlEdgeSet = new Set((hlEdges || []).map((e) => `${e[0]}-${e[1]}`));

  // Draw edges (with arrowheads and weight labels)
  let edgeSvg = "";
  const arrowId = "graph-arrow";
  const arrowHlId = "graph-arrow-hl";

  for (const edge of edges) {
    const from = pos[edge.u];
    const to = pos[edge.v];
    if (!from || !to) continue;

    // Shorten the line so arrow doesn't overlap the circle
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len;
    const uy = dy / len;
    const x1 = from.x + ux * (r + 2);
    const y1 = from.y + uy * (r + 2);
    const x2 = to.x - ux * (r + 6);
    const y2 = to.y - uy * (r + 6);

    const isHl = hlEdgeSet.has(`${edge.u}-${edge.v}`);
    const cls = isHl ? "graph-edge hl" : "graph-edge";
    const markerEnd = isHl ? `url(#${arrowHlId})` : `url(#${arrowId})`;

    edgeSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="${markerEnd}" />`;

    // Weight label at midpoint
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    // Offset perpendicular to the edge
    const perpX = -uy * 12;
    const perpY = ux * 12;
    edgeSvg += `<text x="${mx + perpX}" y="${my + perpY}" class="graph-weight${isHl ? " hl" : ""}" text-anchor="middle" dy="0.35em">${edge.w}</text>`;
  }

  // Draw nodes
  let nodeSvg = "";
  for (const node of nodes) {
    const p = pos[node.id];
    const isHl = hlNodeSet.has(node.id);
    const isVisited = visitedSet.has(node.id);
    let cls = "graph-node";
    if (isHl) cls += " hl";
    else if (isVisited) cls += " visited";

    nodeSvg += `<g class="${cls}">`;
    nodeSvg += `<circle cx="${p.x}" cy="${p.y}" r="${r}" />`;
    nodeSvg += `<text x="${p.x}" y="${p.y}" dy="0.35em" text-anchor="middle">${node.id}</text>`;
    // Distance label below node
    if (node.dist !== undefined) {
      const distLabel = node.dist === Infinity ? "∞" : node.dist;
      nodeSvg += `<text x="${p.x}" y="${p.y + r + 14}" class="graph-dist${isHl ? " hl" : ""}" text-anchor="middle">${distLabel}</text>`;
    }
    nodeSvg += `</g>`;
  }

  // Arrow marker definitions
  const defs = `<defs>
    <marker id="${arrowId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
    </marker>
    <marker id="${arrowHlId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
    </marker>
  </defs>`;

  $("treeView").innerHTML =
    `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="tree-svg graph-svg">` +
    defs + edgeSvg + nodeSvg +
    `</svg>`;
}

// ---- Render a single step ----
function renderStep() {
  const step = steps[stepIndex];
  if (!step) return;

  $("stepTitle").textContent = pick(step.title);
  $("stepCounter").textContent = t().stepCounter(stepIndex + 1, steps.length);
  $("stepNote").textContent = pick(step.note);
  updateCodeHighlight(step.codeLines || [], step.codeBlock || 1);
  renderVars(step, stepIndex > 0 ? steps[stepIndex - 1] : null);

  if (step.tree) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderTree(step);
  } else if (step.graph) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderGraph(step);
  } else if (step.grid) {
    $("bars").classList.add("hidden");
    $("treeView").classList.add("hidden");
    $("gridView").classList.remove("hidden");
    $("bfsGridView").classList.add("hidden");
    renderGrid(step);
  } else if (step.bfsGrid) {
    $("bars").classList.add("hidden");
    $("treeView").classList.add("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.remove("hidden");
    renderBfsGrid(step);
  } else {
    $("treeView").classList.add("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    $("bars").classList.remove("hidden");
    renderBars(step);
  }

  // navigation buttons
  $("firstBtn").disabled = stepIndex === 0;
  $("prevBtn").disabled = stepIndex === 0;
  $("nextBtn").disabled = stepIndex === steps.length - 1;
  $("lastBtn").disabled = stepIndex === steps.length - 1;

  // result box
  if (step.final) {
    $("answer").textContent = t().answer(answerValue);
    show("answer");
  } else {
    hide("answer");
  }
}

// ---- Utilities ----
function show(id) {
  $(id).classList.remove("hidden");
}
function hide(id) {
  $(id).classList.add("hidden");
}
function showError(id, msg) {
  const el = $(id);
  el.textContent = msg;
  el.classList.remove("hidden");
}

// Initialize
applyStaticStrings();
loadCatalog();

// Restore last opened problem from localStorage
const savedId = localStorage.getItem("lastProblemId");
if (savedId) {
  $("problemId").value = savedId;
}
loadProblem();

// ---- Theme toggle (dark/light) ----
(function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "dark"); // default dark
  applyTheme(theme);
})();

$("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.dataset.theme || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const moonIcon = $("themeIconMoon");
  const sunIcon = $("themeIconSun");
  if (theme === "dark") {
    moonIcon.classList.add("hidden");
    sunIcon.classList.remove("hidden");
  } else {
    moonIcon.classList.remove("hidden");
    sunIcon.classList.add("hidden");
  }
}
