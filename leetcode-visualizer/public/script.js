const $ = (id) => document.getElementById(id);

let lang = "en";
let currentProblemId = null;
let problemData = null; // loaded problem data (bilingual)
let steps = [];
let stepIndex = 0;
let answerValue = null; // answer from the current run
let playTimer = null;
let catalogData = null; // problem list grouped by algorithm
let debugBreakpoints = new Set();
let debugWatches = [];

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
    premiumLabel: "LeetCode Premium",
    premiumHidden: "Mô tả LeetCode bị ẩn vì đây là bài Premium.",
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
    premiumLabel: "LeetCode Premium",
    premiumHidden: "LeetCode description hidden because this is a Premium problem.",
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

    // Show learning guide if available (collapsible)
    if (group.guide) {
      const guide = pick(group.guide);
      const guideBox = document.createElement("details");
      guideBox.className = "cat-guide";

      const summary = document.createElement("summary");
      summary.innerHTML = `<span class="cat-guide-icon">📘</span><span>${lang === "vi" ? "Lộ trình học chi tiết" : "Detailed learning path"}</span>`;
      guideBox.appendChild(summary);

      const body = document.createElement("div");
      body.className = "cat-guide-body";

      // Intro
      const intro = document.createElement("p");
      intro.className = "cat-guide-intro";
      intro.textContent = guide.intro;
      body.appendChild(intro);

      // Patterns table
      if (guide.patterns && guide.patterns.length) {
        const tbl = document.createElement("table");
        tbl.className = "cat-guide-table";
        const thead = document.createElement("thead");
        thead.innerHTML = `<tr><th>#</th><th>${lang === "vi" ? "Bài" : "Problem"}</th><th>Pattern</th></tr>`;
        tbl.appendChild(thead);
        const tbody = document.createElement("tbody");
        guide.patterns.forEach((p, i) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td class="g-step">${i + 1}</td><td><span class="g-id">#${p.id}</span> ${p.name}</td><td class="g-pattern">${p.pattern}</td>`;
          tbody.appendChild(tr);
        });
        tbl.appendChild(tbody);
        body.appendChild(tbl);
      }

      // Stages
      if (guide.stages && guide.stages.length) {
        guide.stages.forEach((stage) => {
          const sec = document.createElement("div");
          sec.className = "cat-guide-stage";
          const h = document.createElement("h4");
          h.textContent = stage.title;
          sec.appendChild(h);
          const desc = document.createElement("p");
          desc.textContent = stage.description;
          sec.appendChild(desc);
          if (stage.problems && stage.problems.length) {
            const probs = document.createElement("div");
            probs.className = "cat-guide-problems";
            probs.innerHTML = stage.problems.map((id) => `<span class="g-id">#${id}</span>`).join(" ");
            sec.appendChild(probs);
          }
          body.appendChild(sec);
        });
      }

      // Conclusion
      if (guide.conclusion) {
        const conc = document.createElement("p");
        conc.className = "cat-guide-conclusion";
        conc.textContent = guide.conclusion;
        body.appendChild(conc);
      }

      guideBox.appendChild(body);
      itemsEl.appendChild(guideBox);
    }

    const hasOrder = !!group.recommendedOrderLabel;
    group.problems.forEach((p, idx) => {
      const chip = document.createElement("button");
      chip.className = "prob-chip" + (p.id === currentProblemId ? " active" : "");
      chip.dataset.id = p.id;
      if (p.premium) {
        chip.dataset.premium = "true";
        chip.title = t().premiumLabel;
      }

      if (hasOrder) {
        const step = document.createElement("span");
        step.className = "prob-step";
        step.textContent = idx + 1;
        chip.appendChild(step);
      }

      const pid = document.createElement("span");
      pid.className = "pid";
      pid.textContent = `#${p.id}`;

      const metaRow = document.createElement("span");
      metaRow.className = "prob-meta";
      metaRow.appendChild(pid);

      const pname = document.createElement("span");
      pname.className = "pname";
      pname.textContent = pick(p.title);

      chip.appendChild(metaRow);
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
      ? (data.inputKind === "stringArray" ? JSON.stringify(data.defaultInput) : data.defaultInput.join(","))
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
  $("problemPanel").dataset.problemId = String(problemData.id);
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
  const statementEl = $("problemStatement");
  if (problemData.premium) {
    statementEl.textContent = t().premiumHidden;
    statementEl.classList.add("premium-hidden-statement");
  } else {
    statementEl.textContent = pick(problemData.statement);
    statementEl.classList.remove("premium-hidden-statement");
  }
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shouldUseLineByLineDebug() {
  return Boolean(problemData);
}

function breakpointKey(codeBlock, line) {
  return `${Number(codeBlock || 1)}:${Number(line)}`;
}

function resetBreakpoints() {
  debugBreakpoints = new Set();
}

function stepHitsBreakpoint(step) {
  if (!step || debugBreakpoints.size === 0) return false;
  const block = step.codeBlock || 1;
  return (step.codeLines || []).some((line) => debugBreakpoints.has(breakpointKey(block, line)));
}

function findBreakpointStep(startIndex, direction) {
  if (debugBreakpoints.size === 0) return -1;
  for (let i = startIndex + direction; i >= 0 && i < steps.length; i += direction) {
    if (stepHitsBreakpoint(steps[i])) return i;
  }
  return -1;
}

function expandStepsLineByLine(rawSteps) {
  const expanded = [];
  (rawSteps || []).forEach((step) => {
    const lines = Array.isArray(step.codeLines)
      ? step.codeLines.filter((line) => Number.isInteger(line))
      : [];

    if (lines.length <= 1) {
      expanded.push(step);
      return;
    }

    lines.forEach((line, idx) => {
      expanded.push({
        ...step,
        codeLines: [line],
        final: Boolean(step.final && idx === lines.length - 1),
      });
    });
  });
  return expanded;
}

// ---- Run algorithm ----
$("runBtn").addEventListener("click", runViz);

function addDebugWatchFromInput() {
  const input = $("watchInput");
  if (!input) return;
  const names = input.value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  names.forEach((name) => {
    if (!debugWatches.includes(name)) debugWatches.push(name);
  });
  input.value = "";
  if (steps.length) renderStep();
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "watchAddBtn") addDebugWatchFromInput();
  if (e.target && e.target.dataset && e.target.dataset.removeWatch) {
    debugWatches = debugWatches.filter((name) => name !== e.target.dataset.removeWatch);
    if (steps.length) renderStep();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.target && e.target.id === "watchInput" && e.key === "Enter") {
    e.preventDefault();
    addDebugWatchFromInput();
  }
});

async function runViz() {
  hide("runError");

  const isString = problemData && problemData.inputKind === "string";
  const isStringArray = problemData && problemData.inputKind === "stringArray";
  let input;

  if (isString) {
    input = $("arrInput").value.trim();
    if (input.length === 0) {
      return showError("runError", t().errArr);
    }
  } else if (isStringArray) {
    const raw = $("arrInput").value.trim();
    try {
      input = raw.startsWith("[")
        ? JSON.parse(raw)
        : raw.split(",").map((s) => s.trim()).filter((s) => s !== "");
    } catch (err) {
      return showError("runError", 'Enter strings as JSON, e.g. ["10","0001","1","0"], or comma separated.');
    }
    if (!Array.isArray(input) || input.length === 0 || input.some((s) => typeof s !== "string")) {
      return showError("runError", 'Enter strings as JSON, e.g. ["10","0001","1","0"], or comma separated.');
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

    steps = shouldUseLineByLineDebug()
      ? expandStepsLineByLine(data.steps)
      : (data.steps || []);
    answerValue = data.answer;
    stepIndex = 0;
    resetBreakpoints();
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
  const breakpointIndex = findBreakpointStep(stepIndex, -1);
  if (breakpointIndex >= 0) stepIndex = breakpointIndex;
  else if (stepIndex > 0) stepIndex--;
  renderStep();
});
$("nextBtn").addEventListener("click", () => {
  stopPlay();
  const breakpointIndex = findBreakpointStep(stepIndex, 1);
  if (breakpointIndex >= 0) stepIndex = breakpointIndex;
  else if (stepIndex < steps.length - 1) stepIndex++;
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
    if (stepIndex >= steps.length - 1) {
      stopPlay();
      return;
    }

    stepIndex++;
    renderStep();

    if (stepHitsBreakpoint(steps[stepIndex]) || stepIndex >= steps.length - 1) {
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

// Render a code line with indent guides (subtle vertical dashed lines at every
// 4-column indent level). Leading whitespace is emitted as fixed-width spans
// carrying the guide border; the rest of the line is fed through highlightPython.
function renderCodeLineHtml(line) {
  const m = /^([ \t]*)(.*)$/.exec(line);
  const leading = m ? m[1] : "";
  const rest = m ? m[2] : line;
  // Expand tabs to 4 spaces for counting; assume code uses spaces (which it does here).
  const expanded = leading.replace(/\t/g, "    ");
  const levels = Math.floor(expanded.length / 4);
  const remainder = expanded.length % 4;
  let html = "";
  for (let i = 0; i < levels; i++) {
    html += '<span class="indent-guide">    </span>';
  }
  if (remainder > 0) html += " ".repeat(remainder);
  html += highlightPython(rest);
  return html;
}

function renderCode() {
  const panel = $("codePanel");
  const localizedCode = problemData && (lang === "vi" ? problemData.codeVi : problemData.codeEn);
  const code = localizedCode || (problemData && problemData.code) || [];
  const code2 = (problemData && problemData.code2) || null;
  const code3 = (problemData && problemData.code3) || null;
  const codeCsharp = (problemData && problemData.codeCsharp) || null;
  panel.innerHTML = "";
  if (code.length === 0 && !code2 && !code3 && !codeCsharp) {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");

  // ── Language tabs (Python | C#) ──
  if (codeCsharp) {
    const tabBar = document.createElement("div");
    tabBar.className = "code-lang-tabs";
    ["Python", "C#"].forEach((lbl, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-lang-tab" + (i === 0 ? " active" : "");
      btn.textContent = lbl;
      btn.dataset.codeLang = i === 0 ? "python" : "csharp";
      btn.addEventListener("click", () => {
        tabBar.querySelectorAll(".code-lang-tab").forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        panel.querySelectorAll(".code-lang-block").forEach(b => b.classList.toggle("hidden", b.dataset.codeLang !== btn.dataset.codeLang));
      });
      tabBar.appendChild(btn);
    });
    panel.appendChild(tabBar);
  }

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
  const pyBlock = document.createElement("div");
  pyBlock.className = "code-lang-block";
  pyBlock.dataset.codeLang = "python";
  function attachBreakpoint(row, block, line) {
    const marker = document.createElement("span");
    marker.className = "breakpoint-dot";
    marker.title = "Toggle breakpoint";
    row.appendChild(marker);
    row.classList.toggle("has-breakpoint", debugBreakpoints.has(breakpointKey(block, line)));
    const toggle = (e) => {
      e.stopPropagation();
      const key = breakpointKey(block, line);
      if (debugBreakpoints.has(key)) debugBreakpoints.delete(key);
      else debugBreakpoints.add(key);
      row.classList.toggle("has-breakpoint", debugBreakpoints.has(key));
    };
    marker.addEventListener("click", toggle);
    row.querySelector(".ln").addEventListener("click", toggle);
  }

  if (code.length > 0) {
    const section = document.createElement("div");
    section.className = "code-section";
    section.dataset.block = "1";

    if (code2 || code3) {
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
      txt.innerHTML = renderCodeLineHtml(line);

      row.appendChild(ln);
      row.appendChild(txt);
      attachBreakpoint(row, 1, idx + 1);
      section.appendChild(row);
    });

    pyBlock.appendChild(section);
  }

  // Render secondary code (code2) if available
  if (code2) {
    const section = document.createElement("div");
    section.className = "code-section";
    section.dataset.block = "2";

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
      txt.innerHTML = renderCodeLineHtml(line);

      row.appendChild(ln);
      row.appendChild(txt);
      attachBreakpoint(row, 2, idx + 1);
      section.appendChild(row);
    });

    pyBlock.appendChild(section);
  }

  // Render tertiary code (code3) if available
  if (code3) {
    const section = document.createElement("div");
    section.className = "code-section";
    section.dataset.block = "3";

    const sep = document.createElement("div");
    sep.className = "code-section-label";
    const custom3Label = problemData && problemData.code3Label;
    sep.textContent = custom3Label ? pick(custom3Label) : (lang === "vi" ? "Cách 3" : "Approach 3");
    section.appendChild(sep);

    section.appendChild(createCopyBtn(code3));

    code3.forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "code-line code3-line";
      row.dataset.line3 = idx + 1;

      const ln = document.createElement("span");
      ln.className = "ln";
      ln.textContent = idx + 1;

      const txt = document.createElement("span");
      txt.className = "txt";
      txt.innerHTML = renderCodeLineHtml(line);

      row.appendChild(ln);
      row.appendChild(txt);
      attachBreakpoint(row, 3, idx + 1);
      section.appendChild(row);
    });

    pyBlock.appendChild(section);
  }
  panel.appendChild(pyBlock);

  // ── C# block ──
  if (codeCsharp) {
    const csBlock = document.createElement("div");
    csBlock.className = "code-lang-block hidden";
    csBlock.dataset.codeLang = "csharp";
    const section = document.createElement("div");
    section.className = "code-section";
    section.appendChild(createCopyBtn(codeCsharp));
    codeCsharp.forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "code-line";
      row.dataset.line = idx + 1;
      const ln = document.createElement("span"); ln.className = "ln"; ln.textContent = idx + 1;
      const txt = document.createElement("span"); txt.className = "txt"; txt.innerHTML = renderCodeLineHtml(line);
      row.appendChild(ln); row.appendChild(txt); attachBreakpoint(row, 1, idx + 1); section.appendChild(row);
    });
    csBlock.appendChild(section);
    panel.appendChild(csBlock);
  }
}

function updateCodeHighlight(activeLines, codeBlock) {
  const set = new Set(activeLines);
  const block = String(codeBlock || 1);
  const targetAttr = codeBlock === 3 ? "line3" : codeBlock === 2 ? "line2" : "line";

  // Only operate on the currently visible language block (or the whole panel if no lang blocks).
  const panel = $("codePanel");
  const visibleLangBlock = panel.querySelector(".code-lang-block:not(.hidden)") || panel;

  // Show only the active section (hide the other); fall back to showing all if no sections labeled.
  const sections = visibleLangBlock.querySelectorAll(".code-section");
  if (sections.length > 1) {
    sections.forEach((sec) => {
      sec.classList.toggle("hidden", sec.dataset.block !== block);
    });
  }

  let firstActiveRow = null;
  visibleLangBlock
    .querySelectorAll(".code-line")
    .forEach((row) => {
      const lineNum = Number(row.dataset[targetAttr]);
      const isActive = !isNaN(lineNum) && set.has(lineNum);
      row.classList.toggle("active", isActive);
      if (isActive && !firstActiveRow) {
        firstActiveRow = row;
      }
    });

  // Auto-scroll to active line (line-by-line debug mode)
  if (firstActiveRow && panel) {
    setTimeout(() => {
      const panelRect = panel.getBoundingClientRect();
      const rowRect = firstActiveRow.getBoundingClientRect();
      
      // If row is not fully visible in viewport
      if (rowRect.top < panelRect.top || rowRect.bottom > panelRect.bottom) {
        firstActiveRow.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 0);
  }
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
  const watchGrid = $("watchGrid");
  const vars = step.vars || [];

  if (!vars.length && !debugWatches.length) {
    panel.classList.add("hidden");
    return;
  }

  const prevValues = {};
  if (prevStep && Array.isArray(prevStep.vars)) {
    prevStep.vars.forEach((v) => {
      prevValues[v.name] = formatVarValue(v.value);
    });
  }

  const makeVarItem = (v, opts = {}) => {
    const valStr = formatVarValue(v.value);
    const item = document.createElement("div");
    item.className = opts.watch ? "var-item watch-item" : "var-item";
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
    if (opts.watch) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "watch-remove";
      remove.textContent = "x";
      remove.dataset.removeWatch = v.name;
      item.appendChild(remove);
    }
    return item;
  };

  const varsByName = {};
  vars.forEach((v) => {
    varsByName[v.name] = v;
  });

  if (watchGrid) {
    watchGrid.innerHTML = "";
    debugWatches.forEach((name) => {
      const watched = varsByName[name] || { name, value: "not in scope" };
      const item = makeVarItem(watched, { watch: true });
      if (!varsByName[name]) item.classList.add("missing");
      watchGrid.appendChild(item);
    });
    watchGrid.classList.toggle("hidden", debugWatches.length === 0);
  }

  grid.innerHTML = "";
  vars.forEach((v) => {
    grid.appendChild(makeVarItem(v));
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
  const { dp, text1, text2, hlCell, pathCells, cellLabels, showIndices, rowLabels, colLabels, largeCells } = step.grid;
  const pathSet = new Set((pathCells || []).map(([r, c]) => `${r},${c}`));
  const labels = cellLabels || {};
  const m = dp.length - 1;
  const n = dp[0].length - 1;
  const axisLabelHtml = (label) => {
    if (!label) return "";
    if (typeof label === "object") {
      return `<span class="axis-index">${escapeXml(label.index || "")}</span><span class="axis-char">${escapeXml(label.char || "")}</span>`;
    }
    return escapeXml(String(label));
  };

  const hasCellLabels = Object.keys(labels).length > 0 || largeCells;
  let html = `<table class="dp-grid${hasCellLabels ? " has-cell-labels" : ""}"><thead><tr><th></th><th></th>`;
  for (let j = 0; j < n; j++) {
    const colLabel = colLabels && colLabels[j]
      ? axisLabelHtml(colLabels[j])
      : showIndices
      ? `<span class="axis-index">j=${j + 1}</span><span class="axis-char">${escapeXml(text2[j])}</span>`
      : escapeXml(text2[j]);
    html += `<th>${colLabel}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (let i = 0; i <= m; i++) {
    html += "<tr>";
    const rowLabel = i === 0
      ? ""
      : rowLabels && rowLabels[i - 1]
        ? axisLabelHtml(rowLabels[i - 1])
        : showIndices
        ? `<span class="axis-index">i=${i}</span><span class="axis-char">${escapeXml(text1[i - 1])}</span>`
        : escapeXml(text1[i - 1]);
    html += `<td class="row-label">${rowLabel}</td>`;
    for (let j = 0; j <= n; j++) {
      let cls = "dp-cell";
      if (hlCell && hlCell[0] === i && hlCell[1] === j) cls += " hl";
      if (pathSet.has(`${i},${j}`)) cls += " path";
      const key = `${i},${j}`;
      const fullLabel = labels[key] || "";
      const label = fullLabel
        ? `<span class="cell-label" title="${escapeXml(fullLabel)}">${escapeXml(fullLabel)}</span>`
        : "";
      html += `<td class="${cls}">${label}<span class="cell-value">${dp[i][j]}</span></td>`;
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
    // Shorten line so arrowhead doesn't overlap the circle
    const dx = c.x - p.x, dy = c.y - p.y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const ux = dx/len, uy = dy/len;
    const x1 = p.x + ux * (r + 2), y1 = p.y + uy * (r + 2);
    const x2 = c.x - ux * (r + 4), y2 = c.y - uy * (r + 4);
    edges += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="tree-edge" marker-end="url(#tree-arrow)" />`;
  });

  let circles = "";
  const treeAnnotations = step.tree.annotations || {}; // { nodeId: "label" }
  nodes.forEach((n) => {
    const c = pos[n.id];
    const cls = "tree-node" + (n.hl ? " hl" : "") + (n.isWord ? " word" : "");
    circles += `<g class="${cls}">`;
    if (n.isWord) circles += `<circle cx="${c.x}" cy="${c.y}" r="${r + 4}" class="tree-ring" />`;
    circles += `<circle cx="${c.x}" cy="${c.y}" r="${r}" />`;
    circles += `<text x="${c.x}" y="${c.y}" dy="0.35em" text-anchor="middle">${escapeXml(n.label)}</text>`;
    // Annotation above node (e.g. "l1", "l2", "cur", "slow")
    if (treeAnnotations[n.id] !== undefined) {
      const ann = treeAnnotations[n.id];
      const color = n.hl ? "#f59e0b" : n.isWord ? "#22c55e" : "#6366f1";
      circles += `<text x="${c.x}" y="${c.y - r - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${escapeXml(ann)}</text>`;
    }
    circles += `</g>`;
  });

  $("treeView").innerHTML =
    `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="tree-svg">` +
    `<defs><marker id="tree-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#64748b"/></marker></defs>` +
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
  const annotations = step.graph.annotations || null; // { nodeId: "label" } e.g. { 2: "slow", 5: "fast" }
  for (const node of nodes) {
    const p = pos[node.id];
    const isHl = hlNodeSet.has(node.id);
    const isVisited = visitedSet.has(node.id);
    let cls = "graph-node";
    if (isHl) cls += " hl";
    else if (isVisited) cls += " visited";

    nodeSvg += `<g class="${cls}">`;
    nodeSvg += `<circle cx="${p.x}" cy="${p.y}" r="${r}" />`;
    nodeSvg += `<text x="${p.x}" y="${p.y}" dy="0.35em" text-anchor="middle">${escapeXml(node.label || String(node.id))}</text>`;
    // Annotation label above node (e.g. "fast", "slow", "head") — only when explicitly provided
    if (annotations && annotations[node.id] !== undefined) {
      const ann = annotations[node.id];
      let color = "#94a3b8"; // default gray
      if (ann.includes("fast.next")) color = "#fb923c"; // lighter orange
      else if (ann.includes("fast")) color = "#f59e0b"; // amber
      if (ann.includes("slow")) color = "#22c55e"; // green
      if (ann === "slow+fast") color = "#ec4899"; // pink for both
      if (ann === "head") color = "#6366f1"; // indigo
      if (ann.startsWith("head ")) color = "#6366f1"; // head combined
      const isFaded = ann.includes(".next");
      const opacity = isFaded ? "0.45" : "1";
      nodeSvg += `<text x="${p.x}" y="${p.y - r - 5}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}" opacity="${opacity}">${escapeXml(ann)}</text>`;
    }
    // Distance label below node (for Dijkstra etc.)
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

// ---- Linked List renderer (horizontal box nodes with next arrows + curved random arrows) ----
function renderLinkedList(step) {
  const { nodes, hlIdx, markIdx } = step.linkedList;
  // nodes: [{ val, randomTarget (val or null), randomIdx }]
  const n = nodes.length;
  const boxW = 90, boxH = 50, gap = 44, padX = 30, padY = 60;
  const totalW = padX * 2 + n * boxW + (n - 1) * gap;
  const totalH = padY * 2 + boxH + 80; // extra space for curved arrows below

  const hlSet = new Set(hlIdx || []);
  const markSet = new Set(markIdx || []);
  const light = document.documentElement.getAttribute("data-theme") === "light";

  const boxFill = light ? "#dbeafe" : "rgba(99,130,200,0.2)";
  const boxStroke = light ? "#3b82f6" : "#6366f1";
  const boxHlFill = light ? "#fef3c7" : "rgba(251,191,36,0.2)";
  const boxHlStroke = light ? "#f59e0b" : "#fbbf24";
  const boxMarkFill = light ? "#dcfce7" : "rgba(34,197,94,0.15)";
  const boxMarkStroke = light ? "#22c55e" : "#34d399";
  const textColor = light ? "#1e293b" : "#e2e8f0";
  const subColor = light ? "#64748b" : "#94a3b8";
  const arrowColor = light ? "#475569" : "#94a3b8";
  const randomColor = light ? "#7c3aed" : "#a78bfa";

  function nodeX(i) { return padX + i * (boxW + gap); }
  const nodeY = padY;

  let svg = "";

  // Arrowhead markers
  svg += `<defs>
    <marker id="ll-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${arrowColor}"/></marker>
    <marker id="ll-random-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${randomColor}"/></marker>
  </defs>`;

  // Next arrows (horizontal between boxes — from right dot to left edge of next box)
  for (let i = 0; i < n - 1; i++) {
    const x1 = nodeX(i) + boxW - 4;
    const x2 = nodeX(i + 1);
    const y = nodeY + boxH / 4;
    svg += `<line x1="${x1}" y1="${y}" x2="${x2 - 2}" y2="${y}" stroke="${arrowColor}" stroke-width="1.5" marker-end="url(#ll-arrow)" />`;
  }
  // Arrow to null box
  const nullX = nodeX(n - 1) + boxW + gap / 2;
  svg += `<line x1="${nodeX(n-1)+boxW-4}" y1="${nodeY+boxH/4}" x2="${nullX}" y2="${nodeY+boxH/4}" stroke="${arrowColor}" stroke-width="1.5" marker-end="url(#ll-arrow)" />`;
  svg += `<rect x="${nullX}" y="${nodeY + 4}" width="36" height="${boxH - 8}" rx="4" fill="none" stroke="${arrowColor}" stroke-dasharray="4 2" />`;
  svg += `<text x="${nullX+18}" y="${nodeY+boxH/2}" dy="0.35em" text-anchor="middle" font-size="11" fill="${subColor}">null</text>`;

  // Random arrows (curved below)
  for (let i = 0; i < n; i++) {
    const rIdx = nodes[i].randomIdx;
    if (rIdx < 0) continue; // null random
    const fromX = nodeX(i) + boxW / 2;
    const fromY = nodeY + boxH;
    const toX = nodeX(rIdx) + boxW / 2;
    const toY = nodeY + boxH;
    const dist = Math.abs(rIdx - i);
    const curveY = fromY + 20 + dist * 12; // curve depth proportional to distance
    svg += `<path d="M${fromX} ${fromY} C${fromX} ${curveY}, ${toX} ${curveY}, ${toX} ${toY}" fill="none" stroke="${randomColor}" stroke-width="1.2" stroke-dasharray="4 2" marker-end="url(#ll-random-arrow)" />`;
  }

  // Boxes
  for (let i = 0; i < n; i++) {
    const x = nodeX(i), y = nodeY;
    let fill = boxFill, stroke = boxStroke;
    if (hlSet.has(i)) { fill = boxHlFill; stroke = boxHlStroke; }
    else if (markSet.has(i)) { fill = boxMarkFill; stroke = boxMarkStroke; }

    svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />`;
    // Divider line
    svg += `<line x1="${x}" y1="${y + boxH/2}" x2="${x + boxW}" y2="${y + boxH/2}" stroke="${stroke}" stroke-width="0.5" opacity="0.5" />`;
    // Value (top half — centered, large)
    svg += `<text x="${x + boxW/2}" y="${y + boxH/4}" dy="0.35em" text-anchor="middle" font-size="14" font-weight="700" fill="${textColor}">${nodes[i].val}</text>`;
    // "random → target" label (bottom half)
    const rTarget = nodes[i].randomIdx >= 0 ? nodes[nodes[i].randomIdx].val : "∅";
    svg += `<text x="${x + 8}" y="${y + 3*boxH/4}" dy="0.35em" font-size="10" fill="${randomColor}">rand→${rTarget}</text>`;
    // Small dot at right edge top (next pointer origin)
    svg += `<circle cx="${x + boxW - 8}" cy="${y + boxH/4}" r="4" fill="${arrowColor}" opacity="0.5" />`;
    // Small dot at bottom center (random pointer origin)
    svg += `<circle cx="${x + boxW/2}" cy="${y + boxH}" r="3" fill="${randomColor}" opacity="0.6" />`;
  }

  $("treeView").innerHTML = `<svg viewBox="0 0 ${totalW + 50} ${totalH}" width="${totalW + 50}" height="${totalH}" class="tree-svg">${svg}</svg>`;
}

function renderStackView(step) {
  const view = step.stackView || {};
  const stack = Array.isArray(view.items) ? view.items : [];
  const input = Array.isArray(view.input) ? view.input : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const expected = view.expected || "";
  const top = stack.length ? stack[stack.length - 1] : "";
  const stackTitle = view.title || "Stack";
  const emptyLabel = view.emptyLabel || "empty stack";

  function itemParts(item) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return {
        value: item.value ?? item.label ?? "",
        detail: item.detail ?? "",
      };
    }
    return { value: item, detail: "" };
  }

  const topParts = itemParts(top);
  const statuses = Array.isArray(view.status)
    ? view.status
    : [
        { label: "top", value: topParts.value || "empty" },
        { label: "expected", value: expected || "-" },
      ];

  const stackItems = stack.length
    ? stack
        .map((item, idx) => {
          const isTop = idx === stack.length - 1;
          const parts = itemParts(item);
          return `<div class="stack-cell${isTop ? " top" : ""}">
            <span class="stack-cell-content">
              <span class="stack-value">${escapeHtml(String(parts.value))}</span>
              ${parts.detail ? `<small class="stack-detail">${escapeHtml(String(parts.detail))}</small>` : ""}
            </span>
            ${isTop ? `<span class="stack-tag">top</span>` : ""}
          </div>`;
        })
        .reverse()
        .join("")
    : `<div class="stack-empty">${escapeHtml(String(emptyLabel))}</div>`;

  const statusItems = statuses
    .map(
      (item) => `<div>
        <span>${escapeHtml(String(item.label ?? ""))}</span>
        <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
      </div>`,
    )
    .join("");

  const inputItems = input
    .map((ch, idx) => {
      const cls = idx === current ? " current" : idx < current ? " done" : "";
      return `<div class="stack-input-token${cls}">
        <span>${escapeHtml(String(ch))}</span>
        <small>${idx}</small>
      </div>`;
    })
    .join("");

  $("treeView").innerHTML = `
    <div class="stack-viz">
      <div class="stack-panel">
        <div class="stack-title">${escapeHtml(String(stackTitle))}</div>
        <div class="stack-container">${stackItems}</div>
        <div class="stack-base"></div>
      </div>
      <div class="stack-side">
        <div class="stack-status">${statusItems}</div>
        <div>
          ${view.inputLabel ? `<div class="stack-input-label">${escapeHtml(String(view.inputLabel))}</div>` : ""}
          <div class="stack-input-row">${inputItems}</div>
        </div>
      </div>
    </div>`;
}

function renderQueueView(step) {
  const view = step.queueView || {};
  const items = Array.isArray(view.items) ? view.items : [];
  const capacity = Math.max(Number(view.capacity) || 0, items.length, 1);
  const stream = Array.isArray(view.stream) ? view.stream : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const active = Number.isInteger(view.active) ? view.active : -1;
  const statuses = Array.isArray(view.status) ? view.status : [];

  const cells = Array.from({ length: capacity }, (_, idx) => {
    const hasValue = idx < items.length;
    const tags = [];
    if (hasValue && idx === 0) tags.push("FRONT");
    if (hasValue && idx === items.length - 1) tags.push("REAR");
    return `<div class="queue-cell${hasValue ? "" : " empty"}${idx === active ? " active" : ""}">
      <span class="queue-tags">${tags.map((tag) => `<small>${tag}</small>`).join("")}</span>
      <strong>${hasValue ? escapeHtml(String(items[idx])) : "empty"}</strong>
      <span class="queue-index">[${idx}]</span>
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  const streamItems = stream.map((value, idx) => {
    const cls = idx === current ? " current" : idx < current ? " done" : "";
    return `<div class="stack-input-token${cls}"><span>${escapeHtml(String(value))}</span><small>${idx}</small></div>`;
  }).join("");

  $("treeView").innerHTML = `
    <div class="queue-viz">
      <div class="queue-heading">${escapeHtml(String(view.title || "Queue"))}</div>
      <div class="queue-cells">${cells}</div>
      <div class="queue-status">${statusItems}</div>
      <div>
        <div class="stack-input-label">Incoming stream</div>
        <div class="stack-input-row">${streamItems}</div>
      </div>
    </div>`;
}

function renderSentenceView(step) {
  const view = step.sentenceView || {};
  const sentence1 = Array.isArray(view.sentence1) ? view.sentence1 : [];
  const sentence2 = Array.isArray(view.sentence2) ? view.sentence2 : [];
  const states = Array.isArray(view.states) ? view.states : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const pairs = Array.isArray(view.pairs) ? view.pairs : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const length = Math.max(sentence1.length, sentence2.length);

  const symbolFor = (state) => ({
    identical: "=",
    similar: "<->",
    different: "x",
    pending: "?",
  })[state] || "?";

  const columns = Array.from({ length }, (_, idx) => {
    const state = states[idx] || "pending";
    const word1 = sentence1[idx] ?? "missing";
    const word2 = sentence2[idx] ?? "missing";
    return `<div class="sentence-column ${escapeHtml(state)}${idx === current ? " current" : ""}">
      <div class="sentence-word sentence-word-top">${escapeHtml(String(word1))}</div>
      <div class="sentence-relation" aria-label="${escapeHtml(state)}">${escapeHtml(symbolFor(state))}</div>
      <div class="sentence-word sentence-word-bottom">${escapeHtml(String(word2))}</div>
      <small>[${idx}]</small>
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  const pairItems = pairs.length
    ? pairs.map((pair) => `<span class="sentence-pair">${escapeHtml(String(pair))}</span>`).join("")
    : `<span class="sentence-pair empty">no similar pairs</span>`;

  $("treeView").innerHTML = `
    <div class="sentence-viz">
      <div class="sentence-title">Aligned word pairs</div>
      <div class="sentence-columns">${columns}</div>
      <div class="sentence-status">${statusItems}</div>
      <div>
        <div class="sentence-pairs-label">Similar pairs (bidirectional)</div>
        <div class="sentence-pairs">${pairItems}</div>
      </div>
    </div>`;
}

function renderPrefix2DView(step) {
  const view = step.prefix2DView || {};
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const terms = Array.isArray(view.terms) ? view.terms : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const region = view.region || null;
  const matrixCell = Array.isArray(view.matrixCell) ? view.matrixCell : null;
  const prefixCell = Array.isArray(view.prefixCell) ? view.prefixCell : null;

  const termMap = new Map();
  terms.forEach((term) => {
    const key = `${term.row}:${term.col}`;
    const previous = termMap.get(key);
    termMap.set(key, previous
      ? { ...term, kind: previous.kind === term.kind ? term.kind : "mixed", label: `${previous.label}, ${term.label}` }
      : term);
  });

  const table = (values, type) => {
    const rowCount = values.length;
    const colCount = rowCount && Array.isArray(values[0]) ? values[0].length : 0;
    const cells = [`<div class="prefix2d-axis corner"></div>`];
    for (let col = 0; col < colCount; col += 1) {
      cells.push(`<div class="prefix2d-axis">c${col}</div>`);
    }
    for (let row = 0; row < rowCount; row += 1) {
      cells.push(`<div class="prefix2d-axis">r${row}</div>`);
      for (let col = 0; col < colCount; col += 1) {
        const classes = ["prefix2d-cell"];
        let badge = "";
        if (type === "matrix") {
          if (region && row >= region.row1 && row <= region.row2 && col >= region.col1 && col <= region.col2) classes.push("in-region");
          if (matrixCell && row === matrixCell[0] && col === matrixCell[1]) classes.push("active");
        } else {
          const term = termMap.get(`${row}:${col}`);
          if (prefixCell && row === prefixCell[0] && col === prefixCell[1]) classes.push("active");
          if (term) {
            classes.push(`term-${term.kind}`);
            badge = `<small>${escapeHtml(String(term.label))}</small>`;
          }
        }
        cells.push(`<div class="${classes.join(" ")}"><strong>${escapeHtml(String(values[row][col]))}</strong>${badge}</div>`);
      }
    }
    return `<div class="prefix2d-table" style="grid-template-columns: 30px repeat(${colCount}, minmax(0, 1fr))">${cells.join("")}</div>`;
  };

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  $("treeView").innerHTML = `
    <div class="prefix2d-viz">
      <div class="prefix2d-panels">
        <section>
          <div class="prefix2d-heading">Matrix</div>
          ${table(matrix, "matrix")}
        </section>
        <section>
          <div class="prefix2d-heading">Prefix sum (padded)</div>
          ${table(prefix, "prefix")}
        </section>
      </div>
      <div class="prefix2d-status">${statusItems}</div>
    </div>`;
}

function renderPrefixRemainderView(step) {
  const view = step.prefixRemainderView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefixSums = Array.isArray(view.prefixSums) ? view.prefixSums : [];
  const remainders = Array.isArray(view.remainders) ? view.remainders : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const matchStart = Number.isInteger(view.matchStart) ? view.matchStart : -1;
  const matchEnd = Number.isInteger(view.matchEnd) ? view.matchEnd : -1;
  const heading = view.heading || "Numbers / prefix / remainder";
  const prefixLabel = view.prefixLabel || "sum";
  const remainderLabel = view.remainderLabel || "rem";
  const mapTitle = view.mapTitle || "Earliest remainder index";
  const mapKeyLabel = view.mapKeyLabel || "remainder";
  const mapValueLabel = view.mapValueLabel || "index";

  const cells = nums.map((num, index) => {
    const isCurrent = index === current;
    const isMatch = matchStart >= 0 && index >= matchStart && index <= matchEnd;
    const prefix = prefixSums[index];
    const remainder = remainders[index];
    return `<div class="remainder-cell${isMatch ? " match" : ""}${isCurrent ? " current" : ""}">
      <span class="remainder-index">[${index}]</span>
      <strong>${escapeHtml(String(num))}</strong>
      <span>${escapeHtml(String(prefixLabel))} ${prefix == null ? "-" : escapeHtml(String(prefix))}</span>
      <span>${escapeHtml(String(remainderLabel))} ${remainder == null ? "-" : escapeHtml(String(remainder))}</span>
    </div>`;
  }).join("");

  const mapCells = entries.map((entry) => `<div class="remainder-map-cell">
    <span>${escapeHtml(String(mapKeyLabel))} ${escapeHtml(String(entry.remainder))}</span>
    <strong>${escapeHtml(String(mapValueLabel))} ${escapeHtml(String(entry.index))}</strong>
  </div>`).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  $("treeView").innerHTML = `
    <div class="remainder-viz">
      <div>
        <div class="remainder-heading">${escapeHtml(String(heading))}</div>
        <div class="remainder-cells">${cells}</div>
      </div>
      <div>
        <div class="remainder-heading">${escapeHtml(String(mapTitle))}</div>
        <div class="remainder-map">${mapCells}</div>
      </div>
      <div class="remainder-status">${statusItems}</div>
    </div>`;
}

function renderDifferenceArrayView(step) {
  const view = step.differenceArrayView || {};
  const diff = Array.isArray(view.diff) ? view.diff : [];
  const result = Array.isArray(view.result) ? view.result : [];
  const updates = Array.isArray(view.updates) ? view.updates : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const currentUpdate = Number.isInteger(view.currentUpdate) ? view.currentUpdate : -1;
  const activeStart = Number.isInteger(view.activeStart) ? view.activeStart : -1;
  const activeEnd = Number.isInteger(view.activeEnd) ? view.activeEnd : -1;
  const activeBoundary = Number.isInteger(view.activeBoundary) ? view.activeBoundary : -1;
  const currentResult = Number.isInteger(view.currentResult) ? view.currentResult : -1;

  const diffCells = diff.map((value, index) => {
    const inRange = activeStart >= 0 && index >= activeStart && index <= activeEnd;
    const isBoundary = index === activeBoundary;
    const isSentinel = index === diff.length - 1;
    return `<div class="diff-cell${inRange ? " in-range" : ""}${isBoundary ? " boundary" : ""}${isSentinel ? " sentinel" : ""}">
      <span>[${index}]</span>
      <strong>${escapeHtml(String(value))}</strong>
      ${isSentinel ? "<small>end</small>" : ""}
    </div>`;
  }).join("");

  const resultCells = result.map((value, index) => `<div class="diff-cell result${index === currentResult ? " boundary" : ""}">
    <span>[${index}]</span>
    <strong>${value == null ? "-" : escapeHtml(String(value))}</strong>
  </div>`).join("");

  const updateItems = updates.length
    ? updates.map((update, index) => `<div class="diff-update${index === currentUpdate ? " current" : ""}">
      <span>${index}</span>
      <strong>[${escapeHtml(String(update.start))}, ${escapeHtml(String(update.end))}, ${escapeHtml(String(update.inc))}]</strong>
    </div>`).join("")
    : `<div class="diff-update empty"><strong>no updates</strong></div>`;

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  $("treeView").innerHTML = `
    <div class="diff-viz">
      <div>
        <div class="diff-heading">Updates</div>
        <div class="diff-updates">${updateItems}</div>
      </div>
      <div>
        <div class="diff-heading">Difference array</div>
        <div class="diff-cells">${diffCells}</div>
      </div>
      <div>
        <div class="diff-heading">Result prefix sum</div>
        <div class="diff-cells result-row">${resultCells}</div>
      </div>
      <div class="diff-status">${statusItems}</div>
    </div>`;
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
  } else if (step.linkedList) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderLinkedList(step);
  } else if (step.stackView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderStackView(step);
  } else if (step.queueView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderQueueView(step);
  } else if (step.sentenceView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderSentenceView(step);
  } else if (step.prefix2DView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPrefix2DView(step);
  } else if (step.prefixRemainderView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPrefixRemainderView(step);
  } else if (step.differenceArrayView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderDifferenceArrayView(step);
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
    const displayedAnswer = Array.isArray(answerValue) ? JSON.stringify(answerValue) : answerValue;
    $("answer").textContent = t().answer(displayedAnswer);
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
