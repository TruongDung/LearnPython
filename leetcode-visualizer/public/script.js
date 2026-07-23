const $ = (id) => document.getElementById(id);
const PLAY_INTERVAL_MS = 1600;

let lang = "en";
let currentProblemId = null;
let problemData = null; // loaded problem data (bilingual)
let steps = [];
let stepIndex = 0;
let answerValue = null; // answer from the current run
let playTimer = null;
let catalogData = null; // problem list grouped by algorithm
let problemSearchQuery = "";
let debugBreakpoints = new Set();
let debugWatches = [];
const RECENT_PROBLEMS_KEY = "recentProblems";
const RECENT_PROBLEMS_LIMIT = 10;

// ---- UI strings by language ----
const I18N = {
  vi: {
    subtitle: "Nhập số bài LeetCode để xem thuật toán chạy từng bước",
    problemIdLabel: "Số bài LeetCode",
    loadBtn: "Tải bài",
    keywordSearchLabel: "Tìm theo từ khóa",
    keywordSearchPlaceholder: "vd: meet, heap, tree...",
    searchResults: (count) => `${count} kết quả`,
    noSearchResults: (query) => `Không tìm thấy bài nào cho “${query}”.`,
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
    kbdHint: "Phím tắt: ← Lùi · → hoặc F10 Tiến · Home Về đầu · End Đến cuối · Space Chạy/Dừng",
    errEmptyId: "Vui lòng nhập số bài.",
    errLoad: "Không tải được bài.",
    errConn: "Lỗi kết nối tới server.",
    errArr: "Nhập các số nguyên dương, cách nhau bởi dấu phẩy. VD: 2,2,1,2,1",
    errSolve: "Không xử lý được.",
    premiumLabel: "LeetCode Premium",
    premiumHidden: "Mô tả LeetCode bị ẩn vì đây là bài Premium.",
    clearRecent: "Xóa",
  },
  en: {
    subtitle: "Enter a LeetCode problem number to watch the algorithm run step by step",
    problemIdLabel: "LeetCode problem number",
    loadBtn: "Load",
    keywordSearchLabel: "Search by keyword",
    keywordSearchPlaceholder: "e.g. meet, heap, tree...",
    searchResults: (count) => `${count} result${count === 1 ? "" : "s"}`,
    noSearchResults: (query) => `No problems found for “${query}”.`,
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
    kbdHint: "Shortcuts: ← Prev · → or F10 Next · Home First · End Last · Space Play/Pause",
    errEmptyId: "Please enter a problem number.",
    errLoad: "Could not load the problem.",
    errConn: "Connection error to server.",
    errArr: "Enter positive integers separated by commas. E.g. 2,2,1,2,1",
    errSolve: "Could not process the request.",
    premiumLabel: "LeetCode Premium",
    premiumHidden: "LeetCode description hidden because this is a Premium problem.",
    clearRecent: "Clear",
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
  renderRecentProblems();
  renderCatalog();
  renderProblemSearchResults();
  if (steps.length) renderStep();
}

function applyStaticStrings() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = t()[key];
    if (typeof val === "string") el.textContent = val;
  });
  // Play/Pause button depends on state
  $("playBtn").textContent = playTimer ? t().playStop : t().play;
  const keywordInput = $("problemKeyword");
  if (keywordInput) keywordInput.placeholder = t().keywordSearchPlaceholder;
}

function readRecentProblems() {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_PROBLEMS_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item) => item && Number.isInteger(Number(item.id))).slice(0, RECENT_PROBLEMS_LIMIT);
  } catch (err) {
    return [];
  }
}

function saveRecentProblem(problem) {
  const recent = readRecentProblems().filter((item) => Number(item.id) !== Number(problem.id));
  recent.unshift({
    id: Number(problem.id),
    title: problem.title,
    difficulty: problem.difficulty || null,
    premium: Boolean(problem.premium),
    openedAt: Date.now(),
  });
  try {
    localStorage.setItem(RECENT_PROBLEMS_KEY, JSON.stringify(recent.slice(0, RECENT_PROBLEMS_LIMIT)));
  } catch (err) {
    // The app still works if storage is unavailable or full.
  }
  renderRecentProblems();
}

function renderRecentProblems() {
  const section = $("recentProblems");
  const container = $("recentItems");
  if (!section || !container) return;
  const recent = readRecentProblems();
  section.classList.toggle("hidden", recent.length === 0 || Boolean(normalizeProblemSearch(problemSearchQuery)));
  container.innerHTML = "";

  recent.forEach((problem) => {
    const button = document.createElement("button");
    button.className = "prob-chip recent-chip" + (Number(problem.id) === currentProblemId ? " active" : "");
    button.type = "button";
    button.dataset.id = problem.id;
    const problemTitle = pick(problem.title) || `LeetCode ${problem.id}`;
    button.setAttribute("aria-label", `#${problem.id} ${problemTitle}`);
    button.title = problemTitle;
    const id = document.createElement("span");
    id.className = "pid";
    id.textContent = `#${problem.id}`;
    button.appendChild(id);

    button.addEventListener("click", () => {
      $("problemId").value = problem.id;
      loadProblem();
    });
    container.appendChild(button);
  });
}

$("clearRecentBtn").addEventListener("click", () => {
  localStorage.removeItem(RECENT_PROBLEMS_KEY);
  renderRecentProblems();
});

// ---- Problem catalog grouped by algorithm ----
async function loadCatalog() {
  try {
    const res = await fetch("/api/problems");
    const data = await res.json();
    if (res.ok) {
      catalogData = data.groups;
      renderCatalog();
      renderProblemSearchResults();
    }
  } catch (err) {
    // ignore error, user can still enter problem number manually
  }
}

function renderCatalog() {
  const container = $("catalog");
  if (!catalogData) return;
  container.classList.toggle("hidden", Boolean(normalizeProblemSearch(problemSearchQuery)));
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

function normalizeProblemSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function renderProblemSearchResults() {
  const section = $("problemSearchResults");
  const items = $("problemSearchItems");
  const summary = $("problemSearchSummary");
  const empty = $("problemSearchEmpty");
  const catalog = $("catalog");
  if (!section || !items || !summary || !empty || !catalog) return;

  const normalizedQuery = normalizeProblemSearch(problemSearchQuery);
  const searching = normalizedQuery.length > 0;
  section.classList.toggle("hidden", !searching);
  catalog.classList.toggle("hidden", searching);
  renderRecentProblems();
  if (!searching || !catalogData) {
    items.innerHTML = "";
    empty.classList.add("hidden");
    return;
  }

  const matches = [];
  catalogData.forEach((group) => {
    group.problems.forEach((problem) => {
      const searchable = normalizeProblemSearch([
        problem.id,
        problem.title && problem.title.vi,
        problem.title && problem.title.en,
        problem.titleVi && problem.titleVi.vi,
        problem.titleVi && problem.titleVi.en,
        group.vi,
        group.en,
        problem.difficulty,
      ].filter(Boolean).join(" "));
      if (searchable.includes(normalizedQuery)) matches.push({ problem, group });
    });
  });

  summary.textContent = t().searchResults(matches.length);
  items.innerHTML = "";
  empty.classList.toggle("hidden", matches.length > 0);
  empty.textContent = matches.length ? "" : t().noSearchResults(problemSearchQuery.trim());

  matches.forEach(({ problem, group }) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "prob-chip search-result-chip" + (problem.id === currentProblemId ? " active" : "");
    chip.dataset.id = problem.id;
    if (problem.premium) {
      chip.dataset.premium = "true";
      chip.title = t().premiumLabel;
    }

    const pid = document.createElement("span");
    pid.className = "pid";
    pid.textContent = `#${problem.id}`;
    const name = document.createElement("span");
    name.className = "pname";
    name.textContent = pick(problem.title);
    const category = document.createElement("span");
    category.className = "search-result-category";
    category.textContent = pick(group);
    chip.append(pid, name, category);

    if (problem.difficulty) {
      const difficulty = document.createElement("span");
      difficulty.className = `diff diff-${problem.difficulty}`;
      difficulty.textContent = problem.difficulty;
      chip.appendChild(difficulty);
    }
    chip.addEventListener("click", () => {
      $("problemId").value = problem.id;
      loadProblem();
    });
    items.appendChild(chip);
  });
}

$("problemKeyword").addEventListener("input", (event) => {
  problemSearchQuery = event.target.value;
  renderProblemSearchResults();
});

function markActiveChip() {
  document
    .querySelectorAll("#catalog .prob-chip, #problemSearchItems .prob-chip")
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

    const problemChanged = currentProblemId !== data.id;
    currentProblemId = data.id;
    localStorage.setItem("lastProblemId", data.id);
    problemData = data;
    saveRecentProblem(data);
    if (problemChanged) $("extraParams").innerHTML = "";
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
      if (p.min !== undefined) inputEl.min = p.min;
      if (p.max !== undefined) inputEl.max = p.max;
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
  return Boolean(problemData) && problemData.debugMode !== "semantic";
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
  const visualizationActive = steps.length && !$("vizPanel").classList.contains("hidden");
  if (e.key === "F10" && visualizationActive) {
    e.preventDefault();
    $("nextBtn").click();
    return;
  }

  // Skip when typing in input fields
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  // Only active when visualization is visible
  if (!visualizationActive) return;

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
  }, PLAY_INTERVAL_MS);
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
  const { cells, rows, cols, variant } = step.bfsGrid;
  const el = $("bfsGridView");
  el.style.textAlign = "center";
  const isTicTacToe = variant === "tic-tac-toe";
  const isPhonePath = variant === "phone-path";
  const isEffortGrid = variant === "effort-grid";
  const variantClass = isTicTacToe
    ? " tic-tac-toe-grid"
    : isPhonePath
      ? " phone-path-grid"
      : isEffortGrid
        ? " effort-grid"
        : "";
  const gridClass = `bfs-grid${variantClass}`;
  const gridStyle = isTicTacToe
    ? ""
    : ` style="grid-template-columns:repeat(${cols},${isPhonePath ? "68px" : isEffortGrid ? "64px" : "32px"})"`;
  let html = `<div class="${gridClass}"${gridStyle}>`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const cls = cell.cls || "empty";
      const label = cell.label || "";
      const meta = cell.meta || "";
      const topTag = isEffortGrid ? `<span class="bfs-cell-label-tag">ARR</span>` : "";
      html += `<div class="bfs-cell ${cls}">${topTag}<span class="bfs-cell-value">${escapeXml(label)}</span>${meta ? `<span class="bfs-cell-meta">${escapeXml(meta)}</span>` : ""}</div>`;
    }
  }
  html += "</div>";
  if (isEffortGrid) {
    const hasParity = !!step.bfsGrid.parity;
    html += `<div class="effort-grid-legend">
      <span><strong class="eg-legend-big">99</strong> ${lang === "vi" ? "= thời điểm ĐẾN sớm nhất (cập nhật)" : "= earliest ARRIVAL time (updates)"}</span>
      <span><strong class="eg-legend-small">⏱99</strong> ${lang === "vi" ? "= thời điểm phòng sẵn sàng (cố định)" : "= room ready time (fixed)"}</span>
      ${hasParity ? `<span><i class="eg-swatch eg-swatch-even"></i>${lang === "vi" ? "bước tới tốn 1s" : "step costs 1s"}</span><span><i class="eg-swatch eg-swatch-odd"></i>${lang === "vi" ? "bước tới tốn 2s" : "step costs 2s"}</span>` : ""}
    </div>`;
  }
  el.innerHTML = html;
}

// ---- Shift 2D Grid renderer ----
function renderShiftGridView(step) {
  const view = step.shiftGridView;
  const source = view.source || [];
  const result = view.result || [];
  const currentKey = view.current ? `${view.current[0]},${view.current[1]}` : "";
  const targetKey = view.target ? `${view.target[0]},${view.target[1]}` : "";
  const placedSet = new Set((view.placed || []).map(([r, c]) => `${r},${c}`));
  const hasGrid = source.length > 0 && source[0] && source[0].length > 0;
  const cols = hasGrid ? source[0].length : 0;

  const matrixHtml = (matrix, kind) => {
    if (!matrix.length) return `<div class="shift-empty">${lang === "vi" ? "Không có dữ liệu" : "No data"}</div>`;
    let cells = "";
    matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        const key = `${r},${c}`;
        const classes = ["shift-cell"];
        if (kind === "source" && key === currentKey) classes.push("source-active");
        if (kind === "source" && view.sourceRow === r && !currentKey) classes.push("row-active");
        if (kind === "result" && view.resultRow === r && !targetKey) classes.push("row-active");
        if (kind === "result" && placedSet.has(key)) classes.push("placed");
        if (kind === "result" && key === targetKey) classes.push("target-active");
        const display = value === null || value === undefined ? "·" : value;
        cells += `<div class="${classes.join(" ")}" aria-label="${kind} row ${r} column ${c}, value ${escapeHtml(display)}">
          <span class="shift-coord">(${r},${c})</span>
          <strong>${escapeHtml(display)}</strong>
        </div>`;
      });
    });
    return `<div class="shift-matrix" style="--shift-cols:${cols}">${cells}</div>`;
  };

  const hasArrayLanes = Array.isArray(view.oneArr) && Array.isArray(view.newArr);
  let track = "";
  if (hasGrid && !hasArrayLanes) {
    const flat = source.flat();
    track = `<div class="shift-track" aria-label="Flattened grid">${flat.map((value, index) => {
      const classes = ["shift-track-cell"];
      if (index === view.oldPos) classes.push("old-index");
      if (index === view.newPos) classes.push("new-index");
      return `<div class="${classes.join(" ")}"><span>${index}</span><strong>${escapeHtml(value)}</strong></div>`;
    }).join("")}</div>`;
  }

  let arrayLanes = "";
  if (hasGrid && hasArrayLanes) {
    const size = source.flat().length;
    const laneHtml = (label, values, activeIndex, activeClass) => {
      const cells = Array.from({ length: size }, (_, index) => {
        const value = values[index];
        const classes = ["shift-array-cell"];
        if (value !== null && value !== undefined) classes.push("filled");
        if (index === activeIndex) classes.push(activeClass);
        return `<div class="${classes.join(" ")}"><span>${index}</span><strong>${escapeHtml(value === null || value === undefined ? "·" : value)}</strong></div>`;
      }).join("");
      return `<div class="shift-array-lane"><strong class="shift-array-name">${label}</strong><div class="shift-array-values">${cells}</div></div>`;
    };
    arrayLanes = `<div class="shift-array-lanes">
      ${laneHtml("one_arr", view.oneArr, view.activeOneIndex, "source-index")}
      ${laneHtml("new_arr", view.newArr, view.activeNewIndex, "target-index")}
    </div>`;
  }

  const formula = view.oldPos === undefined
    ? `<span>k = <strong>${escapeHtml(view.k)}</strong></span><span>k % cells = <strong>${escapeHtml(view.normalizedK)}</strong></span>`
    : hasArrayLanes
      ? `<span>i = <strong>${view.oldPos}</strong></span><span>+ k = <strong>${escapeHtml(view.k)}</strong></span>${view.newPos === undefined ? "" : `<span>new_index = <strong>${view.newPos}</strong></span>`}`
      : `<span>old_pos = <strong>${view.oldPos}</strong></span><span>+ k = <strong>${escapeHtml(view.k)}</strong></span>${view.newPos === undefined ? "" : `<span>new_pos = <strong>${view.newPos}</strong></span>`}`;

  const sourceLabel = pick(view.sourceLabel) || (lang === "vi" ? "Grid nguồn" : "Source grid");
  const resultLabel = pick(view.resultLabel) || (lang === "vi" ? "Grid kết quả" : "Result grid");

  $("treeView").innerHTML = `<div class="shift-grid-viz">
    <div class="shift-phase">${escapeHtml(pick(view.phase) || "")}</div>
    <div class="shift-formula">${formula}</div>
    <div class="shift-matrices">
      <section class="shift-matrix-block">
        <h4>${escapeHtml(sourceLabel)}</h4>
        ${matrixHtml(source, "source")}
      </section>
      <div class="shift-arrow" aria-hidden="true">→</div>
      <section class="shift-matrix-block">
        <h4>${escapeHtml(resultLabel)}</h4>
        ${matrixHtml(result, "result")}
      </section>
    </div>
    ${arrayLanes}
    ${track}
    <div class="shift-legend">
      <span><i class="source-swatch"></i>${lang === "vi" ? "ô nguồn" : "source"}</span>
      <span><i class="target-swatch"></i>${lang === "vi" ? "ô đích" : "target"}</span>
      <span><i class="placed-swatch"></i>${lang === "vi" ? "đã đặt" : "placed"}</span>
    </div>
  </div>`;
}

// ---- Grid renderer (2D DP) ----
function renderGrid(step) {
  const { dp, text1, text2, hlCell, autoScrollCell, pathCells, historyCells, cellLabels, showIndices, rowLabels, colLabels, largeCells, bestCell, bestCells, caption, secondaryCaption, mutedCells } = step.grid;
  const pathSet = new Set((pathCells || []).map(([r, c]) => `${r},${c}`));
  const historySet = new Set((historyCells || []).map(([r, c]) => `${r},${c}`));
  const mutedSet = new Set((mutedCells || []).map(([r, c]) => `${r},${c}`));
  const bestSet = new Set((bestCells || []).map(([r, c]) => `${r},${c}`));
  if (bestCell) bestSet.add(`${bestCell[0]},${bestCell[1]}`);
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
      if (historySet.has(`${i},${j}`)) cls += " history";
      if (pathSet.has(`${i},${j}`)) cls += " path";
      if (bestSet.has(`${i},${j}`)) cls += " best";
      if (mutedSet.has(`${i},${j}`)) cls += " muted";
      const key = `${i},${j}`;
      const fullLabel = labels[key] || "";
      const label = fullLabel
        ? `<span class="cell-label" title="${escapeXml(fullLabel)}">${escapeXml(fullLabel)}</span>`
        : "";
      html += `<td class="${cls}" data-grid-row="${i}" data-grid-col="${j}">${label}<span class="cell-value">${dp[i][j]}</span></td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  const captionHtml = caption ? `<div class="dp-grid-caption">${escapeXml(caption)}</div>` : "";
  const secondaryCaptionHtml = secondaryCaption
    ? `<div class="dp-grid-caption-secondary">${escapeXml(secondaryCaption)}</div>`
    : "";
  const gridView = $("gridView");
  gridView.innerHTML = captionHtml + secondaryCaptionHtml + html;

  if (Array.isArray(autoScrollCell)) {
    const [scrollRow, scrollCol] = autoScrollCell;
    const target = gridView.querySelector(
      `.dp-cell[data-grid-row="${scrollRow}"][data-grid-col="${scrollCol}"]`,
    );
    if (target) {
      if (gridView._autoScrollFrame) cancelAnimationFrame(gridView._autoScrollFrame);
      gridView._autoScrollFrame = requestAnimationFrame(() => {
        gridView._autoScrollFrame = null;
        const viewport = gridView.getBoundingClientRect();
        const cell = target.getBoundingClientRect();
        const padding = 20;
        let delta = 0;
        if (cell.right > viewport.right - padding) {
          delta = cell.right - viewport.right + padding;
        } else if (cell.left < viewport.left + padding) {
          delta = cell.left - viewport.left - padding;
        }
        if (delta !== 0) {
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          gridView.scrollTo({
            left: Math.max(0, gridView.scrollLeft + delta),
            behavior: reduceMotion ? "auto" : "smooth",
          });
        }
      });
    }
  }
}

// ---- Tree renderer (Trie) ----
function escapeXml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function renderTree(step) {
  const nodes = step.tree.nodes;
  const maxX = Math.max(0, ...nodes.map((n) => n.x));
  const maxY = Math.max(0, ...nodes.map((n) => n.y));
  const hasMultiLineLabels = nodes.some((n) => Array.isArray(n.labelLines) && n.labelLines.length > 1);
  const hasSubLabels = nodes.some((n) => n.sub !== undefined && n.sub !== null);
  const r = hasMultiLineLabels ? 30 : 18;
  // For single-line labels, widen the node into a pill shape when the text
  // wouldn't fit in a plain circle (e.g. "-1, leetcode"), instead of shrinking
  // the font until it's unreadable.
  const charW = 7.6;
  const hPad = 14;
  const maxHalfWidth = hasMultiLineLabels
    ? r
    : Math.max(r, ...nodes.map((n) => (String(n.label || "").length * charW) / 2 + hPad));
  const colW = hasMultiLineLabels ? 84 : Math.max(60, maxHalfWidth * 2 + 14);
  const rowH = (hasMultiLineLabels ? 96 : 78) + (hasSubLabels ? 16 : 0);
  const pad = hasMultiLineLabels ? 44 : Math.max(34, maxHalfWidth + 4);
  const width = pad * 2 + maxX * colW;
  const height = pad * 2 + maxY * rowH + (hasSubLabels ? 12 : 0);
  const px = (x) => pad + x * colW;
  const py = (y) => pad + y * rowH;

  const pos = {};
  nodes.forEach((n) => {
    pos[n.id] = { x: px(n.x), y: py(n.y) };
  });

  // Per-node horizontal half-width (pill radius); vertical stays r.
  const hw = {};
  nodes.forEach((n) => {
    hw[n.id] = hasMultiLineLabels ? r : Math.max(r, (String(n.label || "").length * charW) / 2 + hPad);
  });

  let edges = "";
  nodes.forEach((n) => {
    if (n.parentId === null || n.parentId === undefined) return;
    const p = pos[n.parentId];
    const c = pos[n.id];
    if (!p) return;
    // Shorten line so arrowhead doesn't overlap the node shape
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
    const nodeHw = hw[n.id];
    const isPill = nodeHw > r + 0.5;
    const cls = "tree-node" + (n.hl ? " hl" : "") + (n.isWord ? " word" : "");
    circles += `<g class="${cls}">`;
    if (isPill) {
      if (n.isWord) circles += `<rect x="${c.x - nodeHw - 4}" y="${c.y - r - 4}" width="${(nodeHw + 4) * 2}" height="${(r + 4) * 2}" rx="${r + 4}" class="tree-ring" />`;
      circles += `<rect x="${c.x - nodeHw}" y="${c.y - r}" width="${nodeHw * 2}" height="${r * 2}" rx="${r}" />`;
    } else {
      if (n.isWord) circles += `<circle cx="${c.x}" cy="${c.y}" r="${r + 4}" class="tree-ring" />`;
      circles += `<circle cx="${c.x}" cy="${c.y}" r="${r}" />`;
    }
    if (Array.isArray(n.labelLines) && n.labelLines.length > 0) {
      const lineGap = 11;
      const firstY = c.y - ((n.labelLines.length - 1) * lineGap) / 2;
      circles += `<text x="${c.x}" y="${firstY}" text-anchor="middle" font-size="9.5">`;
      n.labelLines.forEach((line, index) => {
        circles += `<tspan x="${c.x}" dy="${index === 0 ? 0 : lineGap}">${escapeXml(line)}</tspan>`;
      });
      circles += `</text>`;
    } else {
      circles += `<text x="${c.x}" y="${c.y}" dy="0.35em" text-anchor="middle">${escapeXml(n.label)}</text>`;
    }
    // Annotation above node (e.g. "l1", "l2", "cur", "slow")
    if (treeAnnotations[n.id] !== undefined) {
      const ann = treeAnnotations[n.id];
      const color = n.hl ? "#f59e0b" : n.isWord ? "#22c55e" : "#6366f1";
      circles += `<text x="${c.x}" y="${c.y - r - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${escapeXml(ann)}</text>`;
    }
    // Sub-label below node (e.g. heap array index)
    if (n.sub !== undefined && n.sub !== null) {
      circles += `<text x="${c.x}" y="${c.y + r + 14}" text-anchor="middle" class="tree-sub">${escapeXml(n.sub)}</text>`;
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
  const isLinear = step.graph.layout === "linear";
  const isFlow = step.graph.layout === "flow";
  const r = isLinear ? 44 : isFlow ? 28 : 24;
  const pad = isLinear ? 64 : isFlow ? 72 : 60;
  const size = Math.max(280, n * 50);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - pad;

  const pos = {};
  let svgWidth = size;
  let svgHeight = size;
  if (isFlow && step.graph.positions) {
    svgWidth = step.graph.width || 660;
    svgHeight = step.graph.height || 340;
    nodes.forEach((node) => {
      const custom = step.graph.positions[node.id];
      if (!custom) return;
      pos[node.id] = {
        x: pad + custom.x * (svgWidth - pad * 2),
        y: pad + custom.y * (svgHeight - pad * 2),
      };
    });
  } else if (isLinear) {
    const order = step.graph.order || nodes.map((node) => node.id);
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const orderedNodes = order.map((id) => nodeById.get(id)).filter(Boolean);
    const remainingNodes = nodes.filter((node) => !order.includes(node.id));
    const allOrdered = orderedNodes.concat(remainingNodes);
    const hasDiscardedRow = allOrdered.some((node) => node.row === "discarded");
    const hasCircularEdge = edges.some((edge) => edge.circular);
    const gap = 196;
    const left = 96;
    svgWidth = Math.max(420, left * 2 + Math.max(0, allOrdered.length - 1) * gap);
    svgHeight = hasDiscardedRow ? 250 : hasCircularEdge ? 260 : 180;
    allOrdered.forEach((node, i) => {
      pos[node.id] = {
        x: left + i * gap,
        y: node.row === "discarded" ? 178 : 86,
      };
    });
  } else {
    // Position nodes in a circle
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      pos[node.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }

  const hlNodeSet = new Set(hlNodes || []);
  const visitedSet = new Set(visitedNodes || []);
  const hlEdgeSet = new Set((hlEdges || []).map((e) => `${e[0]}-${e[1]}${e[2] ? `-${e[2]}` : ""}`));

  // Optional column dividers + labels (used by "semester"/level layouts to show
  // that nodes in the same column are grouped together, e.g. LeetCode 1136).
  let columnSvg = "";
  if (isFlow && step.graph.columnLabels) {
    for (const col of step.graph.columnLabels) {
      const colX = pad + col.x * (svgWidth - pad * 2);
      if (col.divider) {
        columnSvg += `<line x1="${colX}" y1="${pad * 0.35}" x2="${colX}" y2="${svgHeight - pad * 0.35}" class="graph-column-divider" />`;
      }
      if (col.label) {
        columnSvg += `<text x="${colX}" y="${pad * 0.55}" text-anchor="middle" class="graph-column-label">${escapeXml(col.label)}</text>`;
      }
    }
  }

  // Draw edges (with arrowheads and weight labels)
  let edgeSvg = "";
  const arrowId = "graph-arrow";
  const arrowPrevId = "graph-arrow-prev";
  const arrowHlId = "graph-arrow-hl";

  for (const edge of edges) {
    const from = pos[edge.u];
    const to = pos[edge.v];
    if (!from || !to) continue;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const x1 = from.x + ux * (r + 2);
    const y1 = from.y + uy * (r + 2);
    const x2 = to.x - ux * (r + 6);
    const y2 = to.y - uy * (r + 6);

    const edgeKey = `${edge.u}-${edge.v}`;
    const reverseEdgeKey = `${edge.v}-${edge.u}`;
    const typedEdgeKey = `${edgeKey}${edge.kind ? `-${edge.kind}` : ""}`;
    const isHl = hlEdgeSet.has(edgeKey)
      || hlEdgeSet.has(typedEdgeKey)
      || (edge.undirected && hlEdgeSet.has(reverseEdgeKey));
    const kindClass = edge.kind ? ` ${edge.kind}` : "";
    const isDimmed = step.graph.dimUnfocused && hlEdgeSet.size > 0 && !isHl;
    const cls = `graph-edge${kindClass}${isHl ? " hl" : ""}${isDimmed ? " dim" : ""}`;
    const markerId = isHl ? arrowHlId : edge.kind === "prev" ? arrowPrevId : arrowId;
    const markerEnd = edge.undirected ? "" : `url(#${markerId})`;
    const isPointerLane = isLinear && (edge.kind === "next" || edge.kind === "prev") && Math.abs(dy) < 1;

    let mx = (x1 + x2) / 2;
    let my = (y1 + y2) / 2;
    const labelOffset = isFlow ? 30 : 12;
    let labelX = mx - uy * labelOffset;
    let labelY = my + ux * labelOffset;
    if (isFlow) {
      const normalX = -uy;
      const normalY = ux;
      const candidateA = { x: mx + normalX * labelOffset, y: my + normalY * labelOffset };
      const candidateB = { x: mx - normalX * labelOffset, y: my - normalY * labelOffset };
      const centerX = svgWidth / 2;
      const centerY = svgHeight / 2;
      const distanceA = (candidateA.x - centerX) ** 2 + (candidateA.y - centerY) ** 2;
      const distanceB = (candidateB.x - centerX) ** 2 + (candidateB.y - centerY) ** 2;
      const outward = distanceA >= distanceB ? candidateA : candidateB;
      labelX = outward.x;
      labelY = outward.y;
    }
    if (isLinear && edge.circular) {
      const isSelfLoop = edge.u === edge.v;
      const isPrev = edge.kind === "prev";
      if (isSelfLoop) {
        const side = isPrev ? -1 : 1;
        const startY = from.y - r;
        const endY = from.y + r;
        const controlX = from.x + side * 84;
        edgeSvg += `<path d="M ${from.x} ${startY} C ${controlX} ${from.y - 74}, ${controlX} ${from.y + 74}, ${from.x} ${endY}" class="${cls}" marker-end="${markerEnd}" />`;
        labelX = from.x + side * 70;
        labelY = from.y;
      } else {
        const curveY = from.y + (isPrev ? 86 : -66);
        const startY = from.y + (isPrev ? r + 2 : -r - 2);
        const endY = to.y + (isPrev ? r + 6 : -r - 6);
        edgeSvg += `<path d="M ${from.x} ${startY} C ${from.x} ${curveY}, ${to.x} ${curveY}, ${to.x} ${endY}" class="${cls}" marker-end="${markerEnd}" />`;
        labelX = (from.x + to.x) / 2;
        labelY = curveY + (isPrev ? 13 : -10);
      }
    } else if (isPointerLane) {
      const laneY = from.y + (edge.kind === "prev" ? 13 : -13);
      const direction = Math.sign(dx) || 1;
      const laneX1 = from.x + direction * (r + 2);
      const laneX2 = to.x - direction * (r + 6);
      edgeSvg += `<line x1="${laneX1}" y1="${laneY}" x2="${laneX2}" y2="${laneY}" class="${cls}" marker-end="${markerEnd}" />`;
      mx = (laneX1 + laneX2) / 2;
      my = laneY;
      labelX = mx;
      labelY = laneY + (edge.kind === "prev" ? 15 : -15);
    } else if (edge.kind === "next" || edge.kind === "prev") {
      // Offset next/prev perpendicular to the edge line so the two
      // directions render as parallel lines instead of overlapping.
      // Use a canonical (order-independent) direction so the "next" edge
      // (u->v) and its matching "prev" edge (v->u, i.e. reversed) always
      // offset to opposite sides — otherwise the reversed direction flips
      // the perpendicular too and both lines land on the same side.
      const swap = String(edge.u) > String(edge.v);
      const canonUx = swap ? -ux : ux;
      const canonUy = swap ? -uy : uy;
      const perpX = -canonUy;
      const perpY = canonUx;
      const side = edge.kind === "prev" ? -1 : 1;
      const offset = 8 * side;
      const ox1 = x1 + perpX * offset;
      const oy1 = y1 + perpY * offset;
      const ox2 = x2 + perpX * offset;
      const oy2 = y2 + perpY * offset;
      edgeSvg += `<line x1="${ox1}" y1="${oy1}" x2="${ox2}" y2="${oy2}" class="${cls}" marker-end="${markerEnd}" />`;
      mx = (ox1 + ox2) / 2;
      my = (oy1 + oy2) / 2;
      labelX = mx + perpX * 14 * side;
      labelY = my + perpY * 14 * side;
    } else {
      edgeSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="${markerEnd}" />`;
    }

    const weightText = edge.w === undefined || edge.w === null ? "" : String(edge.w);
    const weightWidth = Math.max(24, weightText.length * 8 + 10);
    const weight = weightText
      ? `<rect x="${labelX - weightWidth / 2}" y="${labelY - 9}" width="${weightWidth}" height="18" rx="4" class="graph-weight-bg${isHl ? " hl" : ""}${isDimmed ? " dim" : ""}" />` +
        `<text x="${labelX}" y="${labelY}" class="graph-weight${kindClass}${isHl ? " hl" : ""}${isDimmed ? " dim" : ""}" text-anchor="middle" dy="0.35em">${escapeXml(weightText)}</text>`
      : "";
    edgeSvg += weight;
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
    if (node.sub !== undefined) {
      nodeSvg += `<text x="${p.x}" y="${p.y + r + 18}" class="graph-sub" text-anchor="middle">${escapeXml(node.sub)}</text>`;
    }
    nodeSvg += `</g>`;
  }

  // Arrow marker definitions
  const defs = `<defs>
    <marker id="${arrowId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
    </marker>
    <marker id="${arrowPrevId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
    </marker>
    <marker id="${arrowHlId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
    </marker>
  </defs>`;

  const caption = step.graph.caption
    ? `<div class="graph-caption">${escapeXml(pick(step.graph.caption))}</div>`
    : "";
  $("treeView").innerHTML =
    caption +
    `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" class="tree-svg graph-svg${isLinear ? " graph-linear" : ""}${isFlow ? " graph-flow" : ""}">` +
    defs + columnSvg + edgeSvg + nodeSvg +
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

function renderCircularDequeView(step) {
  const view = step.circularDequeView || {};
  const buffer = Array.isArray(view.buffer) ? view.buffer : [];
  const capacity = Math.max(Number(view.capacity) || buffer.length, 1);
  const front = Number.isInteger(view.front) ? view.front : -1;
  const rear = Number.isInteger(view.rear) ? view.rear : -1;
  const active = Number.isInteger(view.active) ? view.active : -1;
  const size = Math.max(Number(view.size) || 0, 0);
  const cx = 210;
  const cy = 190;
  const radius = capacity <= 6 ? 112 : 125;
  const cellRadius = Math.max(25, Math.min(36, 104 / Math.sqrt(capacity)));

  const point = (idx, extra = 0) => {
    const angle = -Math.PI / 2 + (idx * Math.PI * 2) / capacity;
    return { x: cx + Math.cos(angle) * (radius + extra), y: cy + Math.sin(angle) * (radius + extra) };
  };

  const logicalPosition = (idx) => {
    if (size === 0 || front < 0) return -1;
    const offset = (idx - front + capacity) % capacity;
    return offset < size ? offset : -1;
  };

  const cells = Array.from({ length: capacity }, (_, idx) => {
    const p = point(idx);
    const value = buffer[idx];
    const occupied = value !== null && value !== undefined;
    const logical = logicalPosition(idx);
    const classes = ["cdeque-cell", occupied ? "occupied" : "empty", idx === active ? "active" : ""].filter(Boolean).join(" ");
    return `<g class="${classes}" transform="translate(${p.x} ${p.y})">
      <circle r="${cellRadius}"></circle>
      <text class="cdeque-value" text-anchor="middle" y="5">${occupied ? escapeXml(String(value)) : "∅"}</text>
      <text class="cdeque-index" text-anchor="middle" y="${cellRadius + 16}">[${idx}]${logical >= 0 ? ` · #${logical}` : ""}</text>
    </g>`;
  }).join("");

  const pointer = (idx, label, kind, shift) => {
    if (idx < 0) return "";
    const start = point(idx, cellRadius + 48 + shift);
    const end = point(idx, cellRadius + 8);
    return `<g class="cdeque-pointer ${kind}">
      <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" marker-end="url(#cdeque-arrow)"></line>
      <text x="${start.x}" y="${start.y - 7}" text-anchor="middle">${label}</text>
    </g>`;
  };

  const rearShift = rear === front && size > 0 ? 24 : 0;
  $("treeView").innerHTML = `<div class="cdeque-viz">
    <svg viewBox="0 0 420 380" role="img" aria-label="Circular deque with ${size} of ${capacity} slots occupied">
      <defs><marker id="cdeque-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs>
      <circle class="cdeque-track" cx="${cx}" cy="${cy}" r="${radius}"></circle>
      ${cells}
      ${size > 0 ? pointer(front, "FRONT", "front", 0) : ""}
      ${size > 0 ? pointer(rear, "REAR", "rear", rearShift) : ""}
      <text class="cdeque-center-main" x="${cx}" y="${cy - 5}" text-anchor="middle">size ${size} / ${capacity}</text>
      <text class="cdeque-center-sub" x="${cx}" y="${cy + 20}" text-anchor="middle">clockwise = front → rear</text>
    </svg>
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
  const pickViewText = (value) => {
    const isLocalized = value && !Array.isArray(value) && typeof value === "object"
      && (Object.prototype.hasOwnProperty.call(value, "vi") || Object.prototype.hasOwnProperty.call(value, "en"));
    return isLocalized ? pick(value) : value;
  };
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefixSums = Array.isArray(view.prefixSums) ? view.prefixSums : [];
  const remainders = Array.isArray(view.remainders) ? view.remainders : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const matchStart = Number.isInteger(view.matchStart) ? view.matchStart : -1;
  const matchEnd = Number.isInteger(view.matchEnd) ? view.matchEnd : -1;
  const matchState = view.matchState === "too-short" ? "too-short" : "valid";
  const heading = pickViewText(view.heading) || pick({ vi: "Mảng / tổng tiền tố / phần dư", en: "Numbers / prefix / remainder" });
  const prefixLabel = pickViewText(view.prefixLabel) || pick({ vi: "tổng", en: "sum" });
  const remainderLabel = pickViewText(view.remainderLabel) || pick({ vi: "dư", en: "rem" });
  const mapTitle = pickViewText(view.mapTitle) || pick({ vi: "Chỉ số đầu tiên của mỗi phần dư", en: "Earliest remainder index" });
  const mapKeyLabel = pickViewText(view.mapKeyLabel) || pick({ vi: "dư", en: "remainder" });
  const mapValueLabel = pickViewText(view.mapValueLabel) || pick({ vi: "chỉ số", en: "index" });

  const cells = nums.map((num, index) => {
    const isCurrent = index === current;
    const isMatch = matchStart >= 0 && index >= matchStart && index <= matchEnd;
    const prefix = prefixSums[index];
    const remainder = remainders[index];
    return `<div class="remainder-cell${isMatch ? ` match ${matchState}` : ""}${isCurrent ? " current" : ""}">
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
    <span>${escapeHtml(String(pickViewText(item.label) ?? ""))}</span>
    <strong>${escapeHtml(String(pickViewText(item.value) ?? "-"))}</strong>
  </div>`).join("");

  const proof = view.proof && typeof view.proof === "object" ? view.proof : null;
  let proofHtml = "";
  if (proof) {
    const state = ["candidate", "valid", "too-short"].includes(proof.state) ? proof.state : "candidate";
    const subarray = Array.isArray(proof.subarray) ? proof.subarray : [];
    const conclusion = state === "valid"
      ? pick({
          vi: `Cùng dư ${proof.remainder} nên hiệu chia hết cho ${proof.k}; độ dài ${proof.length} >= 2, đoạn con hợp lệ.`,
          en: `The equal remainder ${proof.remainder} makes the difference divisible by ${proof.k}; length ${proof.length} >= 2, so the subarray is valid.`,
        })
      : state === "too-short"
        ? pick({
            vi: `Tổng ${proof.subarraySum} chia hết cho ${proof.k}, nhưng độ dài ${proof.length} < 2 nên đoạn này chưa hợp lệ.`,
            en: `Sum ${proof.subarraySum} is divisible by ${proof.k}, but length ${proof.length} < 2, so this subarray is too short.`,
          })
        : pick({
            vi: `Hai tổng tiền tố cùng dư ${proof.remainder}; vì vậy hiệu của chúng chia hết cho ${proof.k}. Tiếp theo kiểm tra độ dài.`,
            en: `Both prefix sums have remainder ${proof.remainder}, so their difference is divisible by ${proof.k}. Next, check the length.`,
          });

    proofHtml = `<div class="remainder-proof ${state}">
      <div class="remainder-heading">${escapeHtml(pick({ vi: "Mô phỏng: trừ hai tổng tiền tố", en: "Simulation: subtract two prefix sums" }))}</div>
      <div class="remainder-proof-flow">
        <div class="remainder-proof-term">
          <span>${escapeHtml(pick({ vi: "Tổng đến chỉ số hiện tại", en: "Current prefix" }))}</span>
          <strong>P[${escapeHtml(String(proof.currentIndex))}] = ${escapeHtml(String(proof.currentSum))}</strong>
          <small>${escapeHtml(String(proof.currentSum))} % ${escapeHtml(String(proof.k))} = ${escapeHtml(String(proof.remainder))}</small>
        </div>
        <strong class="remainder-proof-operator">-</strong>
        <div class="remainder-proof-term">
          <span>${escapeHtml(pick({ vi: "Tổng trước đoạn con", en: "Prefix before subarray" }))}</span>
          <strong>P[${escapeHtml(String(proof.previousIndex))}] = ${escapeHtml(String(proof.previousSum))}</strong>
          <small>${escapeHtml(String(proof.previousSum))} % ${escapeHtml(String(proof.k))} = ${escapeHtml(String(proof.remainder))}</small>
        </div>
        <strong class="remainder-proof-operator">=</strong>
        <div class="remainder-proof-term result">
          <span>${escapeHtml(pick({ vi: "Tổng đoạn con", en: "Subarray sum" }))}</span>
          <strong>${escapeHtml(String(proof.currentSum))} - ${escapeHtml(String(proof.previousSum))} = ${escapeHtml(String(proof.subarraySum))}</strong>
          <small>nums[${escapeHtml(String(proof.start))}..${escapeHtml(String(proof.end))}] = [${escapeHtml(subarray.join(", "))}]</small>
        </div>
      </div>
      <div class="remainder-proof-conclusion">${escapeHtml(conclusion)}</div>
    </div>`;
  }

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
      ${proofHtml}
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
    const boundaryLabel = isBoundary && activeBoundary === activeStart ? "start" : isBoundary ? "end + 1" : "";
    const signClass = value > 0 ? " positive" : value < 0 ? " negative" : "";
    return `<div class="diff-cell${inRange ? " in-range" : ""}${isBoundary ? " boundary" : ""}${isSentinel ? " sentinel" : ""}">
      <span class="diff-index">[${index}]</span>
      <strong class="diff-value${signClass}">${escapeHtml(String(value))}</strong>
      ${boundaryLabel ? `<small class="diff-marker">${escapeHtml(boundaryLabel)}</small>` : ""}
      ${isSentinel ? "<small>end</small>" : ""}
    </div>`;
  }).join("");

  const resultCells = result.map((value, index) => `<div class="diff-cell result${index === currentResult ? " boundary" : ""}">
    <span class="diff-index">[${index}]</span>
    <strong class="diff-value">${value == null ? "-" : escapeHtml(String(value))}</strong>
  </div>`).join("");

  const updateItems = updates.length
    ? updates.map((update, index) => `<div class="diff-update${index === currentUpdate ? " current" : ""}">
      <span class="diff-update-index">update ${index}</span>
      <div class="diff-update-values">
        <span><small>start</small>${escapeHtml(String(update.start))}</span>
        <span><small>end</small>${escapeHtml(String(update.end))}</span>
        <span><small>inc</small>${escapeHtml(String(update.inc))}</span>
      </div>
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

function renderRunningSumView(step) {
  const view = step.runningSumView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const running = Array.isArray(view.running) ? view.running : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const current = Number.isInteger(view.current) ? view.current : -1;

  const columns = nums.map((num, index) => {
    const isCurrent = index === current;
    const isDone = running[index] != null;
    return `<div class="running-column${isCurrent ? " current" : ""}${isDone ? " done" : ""}">
      <span class="running-index">[${index}]</span>
      <div class="running-input">
        <small>nums</small>
        <strong>${escapeHtml(String(num))}</strong>
      </div>
      <div class="running-arrow">+</div>
      <div class="running-output">
        <small>sum</small>
        <strong>${running[index] == null ? "-" : escapeHtml(String(running[index]))}</strong>
      </div>
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  $("treeView").innerHTML = `
    <div class="running-viz">
      <div class="running-strip">${columns}</div>
      <div class="running-status">${statusItems}</div>
    </div>`;
}

function renderPrefix1DView(step) {
  const view = step.prefix1DView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const prefixIndex = Number.isInteger(view.prefixIndex) ? view.prefixIndex : -1;
  const query = view.query || null;
  const left = query && Number.isInteger(query.left) ? query.left : -1;
  const right = query && Number.isInteger(query.right) ? query.right : -1;

  const numsCells = nums.map((num, index) => {
    const inQuery = left >= 0 && index >= left && index <= right;
    return `<div class="prefix1d-cell input${index === current ? " current" : ""}${inQuery ? " in-query" : ""}">
      <span>[${index}]</span>
      <strong>${escapeHtml(String(num))}</strong>
    </div>`;
  }).join("");

  const prefixCells = prefix.map((value, index) => {
    const isQueryEdge = query && (index === left || index === right + 1);
    return `<div class="prefix1d-cell prefix${index === prefixIndex ? " current" : ""}${isQueryEdge ? " edge" : ""}">
      <span>p[${index}]</span>
      <strong>${value == null ? "-" : escapeHtml(String(value))}</strong>
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  $("treeView").innerHTML = `
    <div class="prefix1d-viz">
      <div>
        <div class="prefix1d-heading">nums</div>
        <div class="prefix1d-row">${numsCells}</div>
      </div>
      <div>
        <div class="prefix1d-heading">prefix</div>
        <div class="prefix1d-row prefix-row">${prefixCells}</div>
      </div>
      <div class="prefix1d-status">${statusItems}</div>
    </div>`;
}

function renderFenwickView(step) {
  const view = step.fenwickView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const bit = Array.isArray(view.bit) ? view.bit : [];
  const activeNums = new Set(Array.isArray(view.activeNums) ? view.activeNums : []);
  const activeBit = new Set(Array.isArray(view.activeBit) ? view.activeBit : []);
  const visitedBit = new Set(Array.isArray(view.visitedBit) ? view.visitedBit : []);
  const path = Array.isArray(view.path) ? view.path : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const mode = ["build", "update", "query"].includes(view.mode) ? view.mode : "idle";
  const minWidth = Math.max(0, Math.max(nums.length, bit.length) * 76);

  const numsCells = nums.map((value, index) => `<div class="fenwick-cell nums-cell${activeNums.has(index) ? " active" : ""}">
    <span>nums[${index}]</span>
    <strong>${escapeHtml(String(value))}</strong>
  </div>`).join("");

  const bitCells = bit.map((value, zeroIndex) => {
    const index = zeroIndex + 1;
    const lowbit = index & -index;
    const rangeLeft = index - lowbit;
    const rangeRight = index - 1;
    const classes = [
      "fenwick-cell",
      "bit-cell",
      activeBit.has(index) ? "active" : "",
      visitedBit.has(index) ? "visited" : "",
    ].filter(Boolean).join(" ");
    const label = `BIT ${index}, sum ${value}, covers nums ${rangeLeft} through ${rangeRight}`;
    return `<div class="${classes}" aria-label="${escapeHtml(label)}">
      <span>BIT[${index}]</span>
      <strong>${escapeHtml(String(value))}</strong>
      <small>[${rangeLeft}..${rangeRight}]</small>
    </div>`;
  }).join("");

  const pathText = path.length > 0
    ? path.map((index) => `BIT[${escapeHtml(String(index))}]`).join(" → ")
    : (lang === "vi" ? "chưa có node" : "no nodes yet");
  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");
  const modeLabel = {
    build: lang === "vi" ? "build" : "build",
    update: "update",
    query: lang === "vi" ? "truy vấn" : "query",
    idle: lang === "vi" ? "chờ" : "idle",
  }[mode];

  $("treeView").innerHTML = `<div class="fenwick-viz mode-${mode}">
    <div class="fenwick-mode"><span>${escapeHtml(modeLabel)}</span><strong>${pathText}</strong></div>
    <div class="fenwick-scroll">
      <div class="fenwick-content" style="--fenwick-cols:${Math.max(1, Math.max(nums.length, bit.length))};--fenwick-min-width:${minWidth}px">
        <div class="fenwick-heading">nums (0-based)</div>
        <div class="fenwick-row nums-row">${numsCells}</div>
        <div class="fenwick-heading">Fenwick Tree (1-based)</div>
        <div class="fenwick-row bit-row">${bitCells}</div>
      </div>
    </div>
    <div class="fenwick-status">${statusItems}</div>
  </div>`;
}

function renderSkylineView(step) {
  const view = step.skylineView || {};
  const buildings = Array.isArray(view.buildings) ? view.buildings : [];
  const skyline = Array.isArray(view.skyline) ? view.skyline : [];
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const activeIds = new Set(Array.isArray(view.activeBuildingIds) ? view.activeBuildingIds : []);
  const sweepX = Number.isFinite(view.sweepX) ? view.sweepX : null;

  if (buildings.length === 0) {
    $("treeView").innerHTML = `<div class="skyline-empty">${escapeHtml(lang === "vi" ? "Chưa có tòa nhà hợp lệ." : "No valid buildings.")}</div>`;
    return;
  }

  const width = 760;
  const height = 340;
  const pad = { left: 48, right: 22, top: 24, bottom: 46 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const minX = Math.min(...buildings.map((building) => building[0]));
  const maxX = Math.max(...buildings.map((building) => building[1]));
  const maxBuildingHeight = Math.max(1, ...buildings.map((building) => building[2]));
  const xRange = Math.max(1, maxX - minX);
  const xScale = (value) => pad.left + ((value - minX) / xRange) * plotWidth;
  const yScale = (value) => pad.top + plotHeight - (value / maxBuildingHeight) * plotHeight;
  const groundY = yScale(0);

  const yTicks = [...new Set([0, Math.round(maxBuildingHeight / 2), maxBuildingHeight])].sort((a, b) => a - b);
  const allXTicks = [...new Set(buildings.flatMap((building) => [building[0], building[1]]))].sort((a, b) => a - b);
  const tickStride = Math.max(1, Math.ceil(allXTicks.length / 10));
  const xTicks = allXTicks.filter((_, index) => index % tickStride === 0 || index === allXTicks.length - 1);

  const gridLines = yTicks.map((tick) => {
    const y = yScale(tick);
    return `<line class="skyline-grid" x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}"></line>
      <text class="skyline-axis-label" x="${pad.left - 10}" y="${y + 4}" text-anchor="end">${tick}</text>`;
  }).join("");

  const xAxisLabels = xTicks.map((tick) => {
    const x = xScale(tick);
    return `<line class="skyline-tick" x1="${x}" y1="${groundY}" x2="${x}" y2="${groundY + 5}"></line>
      <text class="skyline-axis-label" x="${x}" y="${groundY + 22}" text-anchor="middle">${tick}</text>`;
  }).join("");

  const buildingRects = buildings.map(([left, right, buildingHeight], index) => {
    const x = xScale(left);
    const y = yScale(buildingHeight);
    const rectWidth = Math.max(1, xScale(right) - x);
    const rectHeight = groundY - y;
    return `<g class="skyline-building${activeIds.has(index) ? " active" : ""}">
      <rect x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}"></rect>
      <title>[${left}, ${right}, ${buildingHeight}]</title>
    </g>`;
  }).join("");

  let skylinePath = "";
  if (skyline.length > 0) {
    skylinePath = `M ${xScale(skyline[0][0])} ${groundY} L ${xScale(skyline[0][0])} ${yScale(skyline[0][1])}`;
    for (let index = 1; index < skyline.length; index++) {
      const [x, current] = skyline[index];
      const previous = skyline[index - 1][1];
      skylinePath += ` L ${xScale(x)} ${yScale(previous)} L ${xScale(x)} ${yScale(current)}`;
    }
    const lastPoint = skyline[skyline.length - 1];
    if (sweepX !== null && sweepX > lastPoint[0]) {
      skylinePath += ` L ${xScale(sweepX)} ${yScale(lastPoint[1])}`;
    }
  }

  const keyPoints = skyline.length <= 14 ? skyline.map(([x, value]) => {
    const px = xScale(x);
    const py = yScale(value);
    const labelY = value === 0 ? py - 9 : Math.max(pad.top + 12, py - 9);
    return `<circle class="skyline-key-point" cx="${px}" cy="${py}" r="4"></circle>
      <text class="skyline-key-label" x="${px}" y="${labelY}" text-anchor="middle">${escapeXml(`[${x},${value}]`)}</text>`;
  }).join("") : "";

  const sweepLine = sweepX === null ? "" : `<line class="skyline-sweep" x1="${xScale(sweepX)}" y1="${pad.top}" x2="${xScale(sweepX)}" y2="${groundY}"></line>
    <text class="skyline-sweep-label" x="${xScale(sweepX)}" y="${pad.top - 7}" text-anchor="middle">x=${sweepX}</text>`;

  const heapItems = heap.length > 0
    ? heap.map((entry, index) => {
      const stale = sweepX !== null && entry.right <= sweepX;
      return `<span class="skyline-heap-entry${index === 0 ? " root" : ""}${stale ? " stale" : ""}">
        ${index === 0 ? `<strong>${escapeHtml(lang === "vi" ? "root" : "root")}</strong> ` : ""}h${escapeHtml(entry.height)} → ${escapeHtml(entry.right)}${stale ? ` (${escapeHtml(lang === "vi" ? "hết hạn" : "expired")})` : ""}
      </span>`;
    }).join("")
    : `<span class="skyline-heap-empty">${escapeHtml(lang === "vi" ? "heap rỗng" : "empty heap")}</span>`;

  const summary = lang === "vi"
    ? `Biểu đồ ${buildings.length} tòa nhà; đường quét ${sweepX === null ? "chưa bắt đầu" : `tại x=${sweepX}`}; skyline hiện có ${skyline.length} điểm.`
    : `Chart of ${buildings.length} buildings; sweep line ${sweepX === null ? "not started" : `at x=${sweepX}`}; current skyline has ${skyline.length} points.`;

  $("treeView").innerHTML = `<div class="skyline-viz">
    <svg class="skyline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(summary)}">
      <title>${escapeXml(summary)}</title>
      ${gridLines}
      ${xAxisLabels}
      ${buildingRects}
      ${sweepLine}
      ${skylinePath ? `<path class="skyline-outline" d="${skylinePath}"></path>` : ""}
      ${keyPoints}
    </svg>
    <div class="skyline-heap" aria-label="${escapeHtml(lang === "vi" ? "Trạng thái max-heap" : "Max-heap state")}">
      <span class="skyline-heap-label">max-heap</span>
      ${heapItems}
    </div>
  </div>`;
}

// ---- Meeting-room allocation timeline (#253) ----
function renderMeetingRoomsTimelineView(step) {
  const view = step.meetingRoomsTimelineView;
  const intervals = view.intervals || [];
  const assignments = view.assignments || [];
  const el = $("treeView");
  if (!intervals.length) {
    el.innerHTML = `<div class="meeting-timeline-empty">${lang === "vi" ? "Không có cuộc họp" : "No meetings"}</div>`;
    return;
  }

  const minTime = Math.min(...intervals.map((meeting) => meeting.start));
  const maxTime = Math.max(...intervals.map((meeting) => meeting.end));
  const span = Math.max(1, maxTime - minTime);
  const width = 820;
  const left = 105;
  const right = 24;
  const top = 42;
  const rowHeight = 58;
  const selectedRoom = Number.isInteger(view.selectedRoom) ? view.selectedRoom : null;
  // Do not draw a room lane before that room actually exists. In Approach 2,
  // pq is still empty while the first meeting is only being inspected.
  const roomCount = Math.max(0, view.roomCount || 0, selectedRoom === null ? 0 : selectedRoom + 1);
  const axisY = top + (roomCount + 1) * rowHeight + 4;
  const height = axisY + 42;
  const plotWidth = width - left - right;
  const x = (time) => left + ((time - minTime) / span) * plotWidth;
  const current = Number.isInteger(view.currentIndex) ? intervals[view.currentIndex] : null;
  const currentAssigned = current && assignments.some((meeting) => meeting.meetingIndex === view.currentIndex);

  const tickValues = [...new Set(intervals.flatMap((meeting) => [meeting.start, meeting.end]))].sort((a, b) => a - b);
  const shownTicks = tickValues.length <= 9
    ? tickValues
    : Array.from({ length: 6 }, (_, index) => minTime + (span * index) / 5);
  const ticks = shownTicks.map((time) => {
    const px = x(time);
    const label = Number.isInteger(time) ? time : Number(time.toFixed(1));
    return `<line class="rooms-timeline-grid" x1="${px}" y1="${top - 18}" x2="${px}" y2="${axisY}"></line>
      <text class="rooms-timeline-tick" x="${px}" y="${axisY + 23}" text-anchor="middle">${label}</text>`;
  }).join("");

  const lanes = Array.from({ length: roomCount }, (_, room) => {
    const y = top + (room + 1) * rowHeight;
    return `<line class="rooms-lane-line" x1="${left}" y1="${y + 20}" x2="${width - right}" y2="${y + 20}"></line>
      <text class="rooms-lane-label" x="${left - 12}" y="${y + 24}" text-anchor="end">Room ${room + 1}</text>`;
  }).join("");

  const meetingBars = assignments.map((meeting) => {
    const y = top + (meeting.room + 1) * rowHeight;
    const isSelected = selectedRoom === meeting.room && meeting.meetingIndex === view.currentIndex;
    return `<g class="rooms-meeting${isSelected ? " selected" : ""}">
      <rect x="${x(meeting.start)}" y="${y + 5}" width="${Math.max(5, x(meeting.end) - x(meeting.start))}" height="30" rx="7"></rect>
      <text x="${(x(meeting.start) + x(meeting.end)) / 2}" y="${y + 25}" text-anchor="middle">[${meeting.start}, ${meeting.end}]</text>
      <title>Room ${meeting.room + 1}: [${meeting.start}, ${meeting.end}]</title>
    </g>`;
  }).join("");

  let currentBar = "";
  if (current && !currentAssigned) {
    const targetRow = selectedRoom === null ? 0 : selectedRoom + 1;
    const y = top + targetRow * rowHeight;
    currentBar = `<g class="rooms-current-meeting">
      <text class="rooms-lane-label current" x="${left - 12}" y="${y + 24}" text-anchor="end">${targetRow === 0 ? (lang === "vi" ? "Đang xét" : "Inspecting") : `Room ${targetRow}`}</text>
      <rect x="${x(current.start)}" y="${y + 5}" width="${Math.max(5, x(current.end) - x(current.start))}" height="30" rx="7"></rect>
      <text x="${(x(current.start) + x(current.end)) / 2}" y="${y + 25}" text-anchor="middle">[${current.start}, ${current.end}]</text>
    </g>`;
  }

  const sweepLine = current
    ? `<line class="rooms-start-line" x1="${x(current.start)}" y1="${top - 18}" x2="${x(current.start)}" y2="${axisY}"></line>
       <text class="rooms-start-label" x="${x(current.start) + 5}" y="${top - 23}">start=${current.start}</text>`
    : "";
  const sortedChips = intervals.map((meeting, index) => {
    const done = assignments.some((assigned) => assigned.meetingIndex === index);
    const active = view.currentIndex === index;
    return `<span class="rooms-sorted-chip${done ? " done" : ""}${active ? " active" : ""}">[${meeting.start},${meeting.end}]</span>`;
  }).join("");
  const heapChips = (view.heap || []).length
    ? view.heap.map((entry, index) => `<span class="rooms-heap-chip${index === 0 ? " root" : ""}">R${entry.room + 1} · end ${entry.end}</span>`).join("")
    : `<span class="rooms-heap-empty">∅</span>`;

  const decisionText = {
    reuse: lang === "vi" ? `Tái sử dụng Room ${selectedRoom + 1}` : `Reuse Room ${selectedRoom + 1}`,
    new: lang === "vi" ? "Cần tạo phòng mới" : "Create a new room",
    reused: lang === "vi" ? `Đã tái sử dụng Room ${selectedRoom + 1}` : `Reused Room ${selectedRoom + 1}`,
    created: lang === "vi" ? `Đã tạo Room ${selectedRoom + 1}` : `Created Room ${selectedRoom + 1}`,
    done: lang === "vi" ? `Tối thiểu ${view.roomCount} phòng` : `Minimum ${view.roomCount} rooms`,
  }[view.decision] || "";
  const summary = lang === "vi"
    ? `Timeline phân bổ ${intervals.length} cuộc họp vào ${view.roomCount} phòng.`
    : `Timeline allocating ${intervals.length} meetings across ${view.roomCount} rooms.`;

  el.innerHTML = `<div class="rooms-timeline-viz">
    <div class="rooms-sorted-row"><span>${lang === "vi" ? "Thứ tự:" : "Order:"}</span>${sortedChips}</div>
    <svg class="rooms-timeline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(summary)}">
      <title>${escapeXml(summary)}</title>
      ${ticks}
      <line class="rooms-timeline-axis" x1="${left}" y1="${axisY}" x2="${width - right}" y2="${axisY}"></line>
      ${lanes}
      ${meetingBars}
      ${currentBar}
      ${sweepLine}
    </svg>
    ${decisionText ? `<div class="rooms-decision ${view.decision || ""}">${escapeHtml(decisionText)}</div>` : ""}
    <div class="rooms-heap-row"><span>min-heap</span>${heapChips}</div>
  </div>`;
}

// ---- Meeting interval timeline (#252) ----
function renderMeetingTimelineView(step) {
  const view = step.meetingTimelineView;
  const intervals = view.intervals || [];
  const el = $("treeView");
  if (!intervals.length) {
    el.innerHTML = `<div class="meeting-timeline-empty">${lang === "vi" ? "Không có cuộc họp" : "No meetings"}</div>`;
    return;
  }

  const minTime = Math.min(...intervals.map((interval) => interval.start));
  const maxTime = Math.max(...intervals.map((interval) => interval.end));
  const span = Math.max(1, maxTime - minTime);
  const width = 820;
  const left = 112;
  const right = 24;
  const top = 50;
  const rowHeight = 54;
  const axisY = top + intervals.length * rowHeight + 10;
  const height = axisY + 48;
  const plotWidth = width - left - right;
  const x = (time) => left + ((time - minTime) / span) * plotWidth;
  const active = new Set(view.active || []);
  const processed = new Set(view.processed || []);
  const comparison = view.comparison;

  const tickValues = [...new Set(intervals.flatMap((interval) => [interval.start, interval.end]))].sort((a, b) => a - b);
  const shownTicks = tickValues.length <= 9
    ? tickValues
    : Array.from({ length: 6 }, (_, index) => minTime + (span * index) / 5);
  const ticks = shownTicks.map((time) => {
    const px = x(time);
    const label = Number.isInteger(time) ? time : Number(time.toFixed(1));
    return `<line class="meeting-timeline-grid" x1="${px}" y1="${top - 18}" x2="${px}" y2="${axisY}"></line>
      <text class="meeting-timeline-tick" x="${px}" y="${axisY + 24}" text-anchor="middle">${label}</text>`;
  }).join("");

  let overlapBand = "";
  if (comparison && comparison.overlap === true) {
    const overlapStart = comparison.currentStart;
    const overlapEnd = comparison.previousEnd;
    const y1 = top + Math.min(comparison.previousIndex, comparison.currentIndex) * rowHeight - 7;
    const y2 = top + (Math.max(comparison.previousIndex, comparison.currentIndex) + 1) * rowHeight - 11;
    overlapBand = `<rect class="meeting-overlap-band" x="${x(overlapStart)}" y="${y1}" width="${Math.max(3, x(overlapEnd) - x(overlapStart))}" height="${y2 - y1}"></rect>
      <text class="meeting-overlap-label" x="${(x(overlapStart) + x(overlapEnd)) / 2}" y="${y1 - 8}" text-anchor="middle">${lang === "vi" ? "TRÙNG GIỜ" : "OVERLAP"}</text>`;
  }

  const rows = intervals.map((interval, index) => {
    const y = top + index * rowHeight;
    const isPrevious = comparison && comparison.previousIndex === index;
    const isCurrent = comparison && comparison.currentIndex === index;
    const classes = ["meeting-interval"];
    if (processed.has(index)) classes.push("processed");
    if (active.has(index)) classes.push(isPrevious ? "previous" : isCurrent ? "current" : "active");
    if (comparison && comparison.overlap === true && (isPrevious || isCurrent)) classes.push("conflict");
    const role = isPrevious
      ? (lang === "vi" ? "trước" : "previous")
      : isCurrent ? (lang === "vi" ? "hiện tại" : "current") : "";
    const label = `M${index + 1} [${interval.start}, ${interval.end}]`;
    return `<g class="${classes.join(" ")}">
      <text class="meeting-row-label" x="${left - 12}" y="${y + 23}" text-anchor="end">M${index + 1}</text>
      <rect x="${x(interval.start)}" y="${y + 5}" width="${Math.max(5, x(interval.end) - x(interval.start))}" height="30" rx="7"></rect>
      <text class="meeting-bar-label" x="${(x(interval.start) + x(interval.end)) / 2}" y="${y + 25}" text-anchor="middle">[${interval.start}, ${interval.end}]</text>
      ${role ? `<text class="meeting-role-label" x="${left - 12}" y="${y + 39}" text-anchor="end">${escapeXml(role)}</text>` : ""}
      <title>${escapeXml(label)}</title>
    </g>`;
  }).join("");

  let comparisonLines = "";
  let verdict = "";
  if (comparison) {
    const prevX = x(comparison.previousEnd);
    const currentX = x(comparison.currentStart);
    comparisonLines = `<line class="meeting-boundary previous" x1="${prevX}" y1="${top - 20}" x2="${prevX}" y2="${axisY}"></line>
      <line class="meeting-boundary current" x1="${currentX}" y1="${top - 20}" x2="${currentX}" y2="${axisY}"></line>`;
    if (comparison.overlap !== null) {
      const operator = comparison.overlap ? "<" : "≥";
      const result = comparison.overlap
        ? (lang === "vi" ? "Xung đột" : "Conflict")
        : (lang === "vi" ? "Không trùng" : "No conflict");
      verdict = `<div class="meeting-verdict ${comparison.overlap ? "conflict" : "safe"}">
        current_start ${comparison.currentStart} ${operator} prev_end ${comparison.previousEnd} → ${result}
      </div>`;
    }
  }

  const orderLabel = view.sorted
    ? (lang === "vi" ? "Đã sắp xếp theo start" : "Sorted by start")
    : (lang === "vi" ? "Thứ tự ban đầu" : "Original order");
  const summary = lang === "vi"
    ? `Timeline ${intervals.length} cuộc họp. ${orderLabel}.`
    : `Timeline of ${intervals.length} meetings. ${orderLabel}.`;
  el.innerHTML = `<div class="meeting-timeline-viz">
    <div class="meeting-timeline-status">${escapeHtml(orderLabel)}</div>
    <svg class="meeting-timeline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(summary)}">
      <title>${escapeXml(summary)}</title>
      ${ticks}
      <line class="meeting-timeline-axis" x1="${left}" y1="${axisY}" x2="${width - right}" y2="${axisY}"></line>
      ${rows}
      ${overlapBand}
      ${comparisonLines}
    </svg>
    ${verdict}
  </div>`;
}

// ---- Real-time experience profit tracker (#9001) ----
function renderProfitTrackerView(step) {
  const view = step.profitTrackerView;
  const el = $("treeView");
  const vi = lang === "vi";

  const operationHtml = (view.operations || []).map((operation, index) => {
    const active = index === view.activeIndex;
    const done = index < view.activeIndex || view.activeIndex >= view.operations.length;
    const detail = operation.op === "U"
      ? `${operation.name} ${operation.delta >= 0 ? "+" : ""}${operation.delta}`
      : (vi ? "lấy max" : "get max");
    return `<div class="profit-op${active ? " active" : ""}${done ? " done" : ""}">
      <span class="profit-op-index">${index}</span>
      <strong>${escapeHtml(operation.op)}</strong>
      <span>${escapeHtml(detail)}</span>
    </div>`;
  }).join("");

  const totalsHtml = view.totals.length
    ? view.totals.map((entry) => `<div class="profit-total-row">
        <span>${escapeHtml(entry.name)}</span><strong>${escapeHtml(entry.total)}</strong>
      </div>`).join("")
    : `<div class="profit-empty">${vi ? "Chưa có dữ liệu" : "No data yet"}</div>`;

  const heapHtml = view.heap.length
    ? view.heap.map((entry) => `<div class="profit-heap-entry${entry.root ? " root" : ""}${entry.current ? " current" : " stale"}${entry.focused ? " focused" : ""}">
        <div class="profit-heap-top">
          <span>[${entry.index}]${entry.root ? ` · ${vi ? "ROOT" : "ROOT"}` : ""}</span>
          <strong>${entry.current ? "CURRENT" : "STALE"}</strong>
        </div>
        <div class="profit-heap-name">${escapeHtml(entry.name)}</div>
        <div class="profit-heap-values">
          <span>${vi ? "profit" : "profit"} = ${escapeHtml(entry.profit)}</span>
          <span>${vi ? "lưu" : "stored"} (${escapeHtml(entry.storedPriority)}, '${escapeHtml(entry.name)}')</span>
        </div>
      </div>`).join("")
    : `<div class="profit-empty">heap = []</div>`;

  const resultHtml = view.result.length
    ? view.result.map((name, index) => `<span class="profit-result-item">Q${index + 1}: ${escapeHtml(name === null ? "None" : name)}</span>`).join("")
    : `<span class="profit-empty">res = []</span>`;

  const action = view.action || {};
  let actionHtml = "";
  if (action.type === "init") {
    const labels = { totals: "totals = {}", heap: "heap = []", res: "res = []" };
    actionHtml = `<span>${vi ? "Khởi tạo" : "Initialize"}</span><strong>${escapeHtml(labels[action.target] || action.target)}</strong>`;
  } else if (action.type === "read") {
    const detail = action.op === "U"
      ? `${action.name}, delta ${action.delta >= 0 ? "+" : ""}${action.delta}`
      : (vi ? "cần đọc winner hiện tại" : "read the current winner");
    actionHtml = `<span>${vi ? "Đọc operation" : "Read operation"}</span><strong>${escapeHtml(action.op)} · ${escapeHtml(detail)}</strong>`;
  } else if (action.type === "branch") {
    actionHtml = `<span>op == 'U'</span><span class="profit-arrow">→</span><strong>${action.branch === "update" ? (vi ? "ĐÚNG: UPDATE" : "TRUE: UPDATE") : (vi ? "SAI: QUERY" : "FALSE: QUERY")}</strong>`;
  } else if (action.type === "update") {
    actionHtml = `<span>${escapeHtml(action.name)}: ${escapeHtml(action.oldTotal)}</span><span class="profit-arrow">+</span><span>${escapeHtml(action.delta)}</span><span class="profit-arrow">=</span><strong>${escapeHtml(action.newTotal)}</strong>`;
  } else if (action.type === "push") {
    actionHtml = `<span>${vi ? "total thật" : "true total"}: ${escapeHtml(action.profit)}</span><span class="profit-arrow">→</span><span>${vi ? "đổi dấu" : "negate"}: ${escapeHtml(action.storedPriority)}</span><span class="profit-arrow">→</span><strong>heappush</strong>`;
  } else if (action.type === "compare") {
    actionHtml = `<span>root ${escapeHtml(action.name)} = ${escapeHtml(action.heapProfit)}</span><span class="profit-arrow">${action.current ? "=" : "≠"}</span><span>totals[${escapeHtml(action.name)}] = ${escapeHtml(action.actualProfit)}</span><span class="profit-arrow">→</span><strong class="${action.current ? "is-current" : "is-stale"}">${action.current ? "CURRENT" : "STALE"}</strong>`;
  } else if (action.type === "pop") {
    actionHtml = `<strong class="is-stale">POP STALE</strong><span>${escapeHtml(action.name)} · ${escapeHtml(action.profit)}</span><span class="profit-arrow">→</span><span>${vi ? "kiểm tra root mới" : "check the new root"}</span>`;
  } else if (action.type === "empty") {
    actionHtml = `<strong>heap = []</strong><span class="profit-arrow">→</span><span>${vi ? "winner = None" : "winner = None"}</span>`;
  } else if (action.type === "answer") {
    actionHtml = action.name === null
      ? `<span>heap = []</span><span class="profit-arrow">→</span><strong>res.append(None)</strong>`
      : `<strong>PEEK heap[0]</strong><span class="profit-arrow">→</span><span>${escapeHtml(action.name)} · ${escapeHtml(action.profit)}</span><span class="profit-arrow">→</span><strong>res.append('${escapeHtml(action.name)}')</strong><em>${vi ? "không pop root" : "keep the root"}</em>`;
  } else if (action.type === "return") {
    actionHtml = `<strong>${vi ? "Hoàn tất tất cả operation" : "All operations complete"}</strong><span class="profit-arrow">→</span><span>return res</span>`;
  }

  const summary = vi
    ? `Profit tracker tại operation ${view.activeIndex}. totals có ${view.totals.length} experience, heap có ${view.heap.length} entry.`
    : `Profit tracker at operation ${view.activeIndex}. totals has ${view.totals.length} experiences and the heap has ${view.heap.length} entries.`;

  el.innerHTML = `<div class="profit-tracker-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="profit-ops">${operationHtml}</div>
    <div class="profit-action">${actionHtml}</div>
    <div class="profit-state-grid">
      <section class="profit-state-panel">
        <h4>${vi ? "totals · dữ liệu thật" : "totals · source of truth"}</h4>
        ${totalsHtml}
      </section>
      <section class="profit-state-panel">
        <h4>heap · ${vi ? "các snapshot" : "snapshots"}</h4>
        <div class="profit-heap-list">${heapHtml}</div>
      </section>
    </div>
    <div class="profit-result-row"><strong>res</strong>${resultHtml}</div>
    <div class="profit-legend">
      <span><i class="current"></i>CURRENT = ${vi ? "khớp totals" : "matches totals"}</span>
      <span><i class="stale"></i>STALE = ${vi ? "phiên bản cũ" : "old snapshot"}</span>
      <span><i class="root"></i>ROOT = ${vi ? "ứng viên lớn nhất" : "maximum candidate"}</span>
    </div>
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

  if (step.profitTrackerView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderProfitTrackerView(step);
  } else if (step.meetingRoomsTimelineView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderMeetingRoomsTimelineView(step);
  } else if (step.meetingTimelineView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderMeetingTimelineView(step);
  } else if (step.skylineView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderSkylineView(step);
  } else if (step.tree) {
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
  } else if (step.shiftGridView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderShiftGridView(step);
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
  } else if (step.circularDequeView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderCircularDequeView(step);
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
  } else if (step.runningSumView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderRunningSumView(step);
  } else if (step.fenwickView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderFenwickView(step);
  } else if (step.prefix1DView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPrefix1DView(step);
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
