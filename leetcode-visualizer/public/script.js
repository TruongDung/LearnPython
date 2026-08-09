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
let searchErrorState = null;
let themeMode = "manual";
let themeAutoTimer = null;
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
    unsupportedProblem: (id) => `Bài ${id} chưa được hỗ trợ.`,
    errConn: "Lỗi kết nối tới server.",
    errArr: "Nhập các số nguyên dương, cách nhau bởi dấu phẩy. VD: 2,2,1,2,1",
    errSolve: "Không xử lý được.",
    premiumLabel: "LeetCode Premium",
    premiumHidden: "Mô tả LeetCode bị ẩn vì đây là bài Premium.",
    clearRecent: "Xóa",
    liveEditBtn: "✎ Sửa & chạy code",
    liveExitBtn: "Đóng editor",
    liveRunBtn: "▶ Chạy code của tôi",
    liveClearBtn: "Clear thân hàm",
    liveResetBtn: "↺ Về code gốc",
    autoTheme: "Tự động",
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
    unsupportedProblem: (id) => `Problem ${id} is not supported yet.`,
    errConn: "Connection error to server.",
    errArr: "Enter positive integers separated by commas. E.g. 2,2,1,2,1",
    errSolve: "Could not process the request.",
    premiumLabel: "LeetCode Premium",
    premiumHidden: "LeetCode description hidden because this is a Premium problem.",
    clearRecent: "Clear",
    liveEditBtn: "✎ Edit & run code",
    liveExitBtn: "Exit editor",
    liveRunBtn: "▶ Run my code",
    liveClearBtn: "Clear body",
    liveResetBtn: "↺ Reset to original",
    autoTheme: "Auto",
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
  renderSearchError();
  if (steps.length) renderStep();
}

function renderSearchError() {
  if (!searchErrorState) return;
  if (searchErrorState.type === "unsupported") {
    showError("searchError", t().unsupportedProblem(searchErrorState.id));
  }
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
  updateThemeButtons();
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
  searchErrorState = null;
  hide("searchError");
  if (!id) {
    return showError("searchError", t().errEmptyId);
  }

  try {
    const res = await fetch(`/api/problem/${id}`);
    const data = await res.json();
    if (!res.ok) {
      if (data.code === "UNSUPPORTED_PROBLEM") {
        searchErrorState = { type: "unsupported", id: data.problemId ?? id };
        renderSearchError();
        return;
      }
      return showError("searchError", data.error || t().errLoad);
    }

    const problemChanged = currentProblemId !== data.id;
    currentProblemId = data.id;
    localStorage.setItem("lastProblemId", data.id);
    problemData = data;
    resetLiveEditorState();
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
    resetLiveEditorState();
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
    // NOTE: excludes quote chars so a run of operators (e.g. "('-") never
    // swallows the opening quote of a string literal. Without this, a
    // pattern like float('-inf') would have its leading "'" eaten by "op",
    // causing the str pattern to re-sync on the WRONG quote later in the
    // line and highlight a huge unrelated span as a string (the reported
    // "green font" bug).
    { type: "op", re: /^[^\w\s'"]+/ },
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
function distinctIslandGuideHtml(view) {
  const vi = lang === "vi";
  const phaseOrder = { scan: 0, dfs: 1, compare: 2, done: 3 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phaseLabels = [
    { vi: "Tìm một đảo", en: "Find an island" },
    { vi: "Tạo chữ ký", en: "Build signature" },
    { vi: "So sánh trong visited", en: "Compare in visited" },
  ];
  const phases = phaseLabels.map((label, index) => {
    const state = activePhase > index ? "is-done" : activePhase === index ? "is-active" : "";
    return `<div class="distinct-island-phase ${state}"><span>${activePhase > index ? "✓" : index + 1}</span>${escapeHtml(vi ? label.vi : label.en)}</div>`;
  }).join("");

  let action;
  if (view.phase === "done") {
    action = vi
      ? `Hoàn tất: ${view.islandNumber} đảo tạo ra ${view.distinctCount} chữ ký khác nhau.`
      : `Done: ${view.islandNumber} islands produced ${view.distinctCount} distinct signatures.`;
  } else if (view.event === "compare-signature") {
    action = view.candidateState === "new"
      ? (vi
          ? `Chữ ký chưa có trong visited → lưu thành shape S${view.matchId}; distinct tăng lên ${view.distinctCount}.`
          : `Signature is not in visited → store it as shape S${view.matchId}; distinct becomes ${view.distinctCount}.`)
      : (vi
          ? `Chữ ký trùng hoàn toàn với S${view.matchId} trong visited → đây là cùng hình dạng, không tăng distinct.`
          : `Signature exactly matches S${view.matchId} in visited → same shape, so distinct does not increase.`);
  } else if (view.current && view.origin && view.phase === "dfs") {
    const dr = view.current[0] - view.origin[0];
    const dc = view.current[1] - view.origin[1];
    action = vi
      ? `Ô tuyệt đối (${view.current[0]},${view.current[1]}) − gốc (${view.origin[0]},${view.origin[1]}) = tọa độ tương đối (${dr},${dc}).`
      : `Absolute cell (${view.current[0]},${view.current[1]}) − origin (${view.origin[0]},${view.origin[1]}) = relative coordinate (${dr},${dc}).`;
  } else if (view.event === "found" && view.origin) {
    action = vi
      ? `Gặp đất mới tại (${view.origin[0]},${view.origin[1]}): chọn làm gốc, nên ô đầu tiên luôn có tọa độ tương đối (0,0).`
      : `New land at (${view.origin[0]},${view.origin[1]}): choose it as origin, so the first relative coordinate is always (0,0).`;
  } else {
    action = vi
      ? "Quét từ trái sang phải, trên xuống dưới; mỗi ô đất chưa thăm bắt đầu một đảo mới."
      : "Scan left-to-right, top-to-bottom; each unvisited land cell starts a new island.";
  }

  const shapeHtml = view.shape.length
    ? view.shape.map((cell, index) => `<span class="distinct-shape-cell${index === view.shape.length - 1 && view.phase === "dfs" ? " is-latest" : ""}">
        <b>(${cell.row},${cell.col})</b><small>→ (${cell.dr},${cell.dc})</small>
      </span>`).join("")
    : `<span class="distinct-island-empty">${vi ? "shape đang rỗng" : "shape is empty"}</span>`;

  const frontierHtml = view.stack.length
    ? view.stack.map((cell) => `<span>(${cell.row},${cell.col})<small>rel (${cell.dr},${cell.dc})</small></span>`).join("")
    : `<em>${vi ? "rỗng" : "empty"}</em>`;

  const knownHtml = view.knownSignatures.length
    ? view.knownSignatures.map((record) => {
        const coords = record.shape.map((cell) => `(${cell.dr},${cell.dc})`).join(" ");
        const matched = view.phase === "compare" && record.id === view.matchId;
        return `<div class="distinct-known-shape${matched ? " is-match" : ""}">
          <strong>S${record.id}</strong><code>${escapeHtml(coords)}</code>${matched ? `<small>${view.candidateState === "new" ? (vi ? "MỚI" : "NEW") : (vi ? "TRÙNG" : "MATCH")}</small>` : ""}
        </div>`;
      }).join("")
    : `<span class="distinct-island-empty">${vi ? "visited chưa có chữ ký" : "visited has no signatures yet"}</span>`;

  const candidateCoords = view.shape.map((cell) => `(${cell.dr},${cell.dc})`).join(" ");
  const candidateHtml = view.signature
    ? `<div class="distinct-candidate ${view.candidateState === "duplicate" ? "is-duplicate" : "is-new"}">
        <span>${vi ? "Chữ ký đang so sánh" : "Candidate signature"}</span>
        <code>${escapeHtml(candidateCoords)}</code>
      </div>`
    : "";

  const summary = vi
    ? `Mô phỏng tạo chữ ký hình dạng cho đảo số ${view.islandNumber || 1}.`
    : `Shape-signature simulation for island ${view.islandNumber || 1}.`;
  return `<section class="distinct-island-guide" aria-label="${escapeHtml(summary)}">
    <div class="distinct-island-phases">${phases}</div>
    <div class="distinct-island-action">${escapeHtml(action)}</div>
    <div class="distinct-island-summary">
      <span>${vi ? "Đảo hiện tại" : "Current island"}<strong>${view.islandNumber || "—"}</strong></span>
      <span>${vi ? "Chữ ký trong visited" : "Signatures in visited"}<strong>${view.visitedSize}</strong></span>
      <span>${vi ? "Số hình khác nhau" : "Distinct shapes"}<strong>${view.distinctCount}</strong></span>
    </div>
    <div class="distinct-island-section">
      <div class="distinct-island-section-title"><strong>${vi ? "Shape đang xây" : "Shape being built"}</strong><small>${vi ? "tọa độ tuyệt đối → tương đối" : "absolute → relative coordinates"}</small></div>
      <div class="distinct-shape-cells">${shapeHtml}</div>
    </div>
    <div class="distinct-island-frontier"><strong>${vi ? "DFS frontier" : "DFS frontier"}</strong>${frontierHtml}</div>
    ${candidateHtml}
    <div class="distinct-island-section">
      <div class="distinct-island-section-title"><strong>visited</strong><small>${vi ? "mỗi chữ ký duy nhất được lưu một lần" : "each unique signature is stored once"}</small></div>
      <div class="distinct-known-shapes">${knownHtml}</div>
    </div>
    <div class="distinct-island-legend">
      <span><i class="land"></i>${vi ? "đất chưa thăm" : "unvisited land"}</span>
      <span><i class="current"></i>${vi ? "ô hiện tại" : "current cell"}</span>
      <span><i class="shape"></i>${vi ? "đang tạo shape" : "building shape"}</span>
      <span><i class="finished"></i>${vi ? "đảo đã phân loại" : "classified island"}</span>
    </div>
  </section>`;
}

function effortGuideHtml(view) {
  const vi = lang === "vi";
  const event = view.event || "init";
  const current = Array.isArray(view.current) ? view.current : null;
  const neighbor = Array.isArray(view.neighbor) ? view.neighbor : null;
  const heights = Array.isArray(view.heights) ? view.heights : [];
  const heap = Array.isArray(view.heap) ? [...view.heap] : [];
  const pathEdges = Array.isArray(view.pathEdges) ? view.pathEdges : [];
  const valueAt = (cell) => cell && heights[cell[0]] ? heights[cell[0]][cell[1]] : null;
  const coord = (cell) => cell ? `(${cell[0]},${cell[1]})` : "—";
  const hasValue = (value) => value !== null && value !== undefined;
  const activePhase = event === "done"
    ? 3
    : ["direction", "neighbor", "bounds", "edge"].includes(event)
      ? 1
      : ["relax", "compare"].includes(event)
        ? 2
        : ["update"].includes(event) || (event === "push" && neighbor)
          ? 3
          : 0;
  const phaseLabels = vi
    ? ["1 · Pop heap", "2 · Đo cạnh", "3 · Lấy max", "4 · Relax"]
    : ["1 · Pop heap", "2 · Measure edge", "3 · Take max", "4 · Relax"];
  const phases = phaseLabels.map((label, index) => {
    const state = event === "done" || index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : index === activePhase ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  const heapHtml = heap.length
    ? heap.slice(0, 8).map(([effort, row, col], index) => `<span class="${index === 0 ? "top" : ""}"><small>${index === 0 ? "TOP" : `#${index + 1}`}</small><strong>${effort}</strong>· (${row},${col})</span>`).join("")
    : `<span class="effort-heap-empty">∅</span>`;
  const moreHeap = heap.length > 8 ? `<small class="effort-heap-more">+${heap.length - 8}</small>` : "";

  const currentHeight = valueAt(current);
  const neighborHeight = valueAt(neighbor);
  const routeHtml = current
    ? `<div class="effort-route-row">
        <span class="current-cell"><small>${vi ? "Ô ĐANG POP" : "POPPED CELL"}</small><strong>${coord(current)}</strong><em>height ${currentHeight}</em></span>
        ${neighbor ? `<b aria-hidden="true">→</b><span class="neighbor-cell"><small>${vi ? "HÀNG XÓM" : "NEIGHBOR"}</small><strong>${coord(neighbor)}</strong><em>${hasValue(neighborHeight) ? `height ${neighborHeight}` : (vi ? "ngoài grid" : "outside grid")}</em></span>` : ""}
      </div>`
    : `<div class="effort-key-idea"><code>effort(path) = max(|Δheight|)</code><span>${vi ? "không cộng các cạnh" : "never sum the edges"}</span></div>`;

  const formulaHtml = hasValue(view.edgeEffort)
    ? `<div class="effort-formula-row">
        <span><small>${vi ? "ĐƯỜNG ĐẾN CURRENT" : "PATH TO CURRENT"}</small><strong>${view.curEffort}</strong></span>
        <b>max</b>
        <span><small>|${currentHeight} − ${neighborHeight}|</small><strong>${view.edgeEffort}</strong></span>
        <b>=</b>
        <span class="new-effort"><small>new_effort</small><strong>${hasValue(view.newEffort) ? view.newEffort : "?"}</strong></span>
        ${hasValue(view.improves) ? `<span class="effort-decision ${view.improves ? "update" : "skip"}">${view.improves ? "✓ UPDATE" : "✕ SKIP"}<small>${hasValue(view.newEffort) ? view.newEffort : "?"} &lt; ${escapeHtml(String(view.oldEffort))}</small></span>` : ""}
      </div>`
    : `<div class="effort-key-idea"><code>new_effort = max(cur_effort, edge_effort)</code></div>`;

  const pathHtml = pathEdges.length
    ? `<div class="effort-path-row"><strong>${vi ? "ĐƯỜNG CUỐI · bottleneck được tô đậm" : "FINAL PATH · bottleneck is emphasized"}</strong><div>${pathEdges.map((edge) => {
      const bottleneck = edge.diff === view.answer;
      return `<span class="${bottleneck ? "bottleneck" : ""}">${coord(edge.from)}→${coord(edge.to)} <b>|Δ|=${edge.diff}</b></span>`;
    }).join("")}</div></div>`
    : "";

  return `<section class="effort-dijkstra-guide" aria-label="${vi ? "Mô phỏng Dijkstra minimax" : "Minimax Dijkstra simulation"}">
    <div class="effort-phases">${phases}</div>
    <div class="effort-guide-main">
      <div class="effort-heap-lane"><div><strong>MIN-HEAP</strong><small>${vi ? "effort nhỏ nhất đứng đầu" : "smallest effort first"}</small></div><div>${heapHtml}${moreHeap}</div></div>
      ${routeHtml}
      ${formulaHtml}
    </div>
    ${pathHtml}
  </section>`;
}

function renderFloodFillView(step) {
  const view = step.floodFillView;
  const vi = lang === "vi";
  const recursive = view.mode === "recursive";
  const bfs = view.mode === "bfs";
  const keyOf = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const coord = (cell) => Array.isArray(cell) ? `(${cell[0]},${cell[1]})` : "—";
  const currentKey = keyOf(view.current);
  const neighborKey = keyOf(view.neighbor);
  const startKey = keyOf(view.start);
  const hasTopFrame = recursive && view.stack.length > 0;
  const neighborInside = Array.isArray(view.neighbor)
    && view.neighbor[0] >= 0 && view.neighbor[0] < view.rows
    && view.neighbor[1] >= 0 && view.neighbor[1] < view.cols;
  const expansionPhases = new Set(["stack-init", "fill-start", "stack-check", "pop"]);
  const neighborPhases = new Set(["direction", "neighbor", "neighbor-check"]);
  const fillPhases = new Set(["fill-neighbor", "push-neighbor", "stack-empty", "done"]);
  const recursiveCallPhases = new Set(["main-call", "dfs-enter", "recursive-call", "resume-frame"]);
  const recursiveCheckPhases = new Set(["bounds-check", "color-check", "return-bounds", "return-color"]);
  const recursiveFillPhases = new Set(["recolor", "dfs-complete", "main-resume", "done"]);
  const bfsQueuePhases = new Set(["queue-init", "fill-start", "directions", "queue-check", "dequeue"]);
  const bfsNeighborPhases = new Set(["direction", "next-row", "neighbor", "row-bounds", "col-bounds", "bounds-check", "continue-bounds", "color-check", "continue-color"]);
  const bfsFillPhases = new Set(["fill-neighbor", "enqueue-neighbor", "queue-empty", "done"]);
  const activePhase = recursive
    ? recursiveFillPhases.has(view.phase) ? 3 : recursiveCheckPhases.has(view.phase) ? 2 : recursiveCallPhases.has(view.phase) ? 1 : 0
    : bfs
      ? bfsFillPhases.has(view.phase) ? 3 : bfsNeighborPhases.has(view.phase) ? 2 : bfsQueuePhases.has(view.phase) ? 1 : 0
    : fillPhases.has(view.phase) ? 3 : neighborPhases.has(view.phase) ? 2 : expansionPhases.has(view.phase) ? 1 : 0;
  const phaseLabels = recursive
    ? (vi
      ? ["1. Khởi tạo", "2. Vào frame dfs", "3. Hai base case", "4. Tô và gọi 4 hướng"]
      : ["1. Initialize", "2. Enter dfs frame", "3. Two base cases", "4. Recolor and call four ways"])
    : bfs
      ? (vi
        ? ["1. Đọc màu gốc", "2. Dequeue ở FRONT", "3. Kiểm tra hàng xóm", "4. Tô và enqueue BACK"]
        : ["1. Read source color", "2. Dequeue from FRONT", "3. Check a neighbor", "4. Recolor and enqueue at BACK"])
    : (vi
      ? ["1. Đọc màu gốc", "2. Pop từ DFS stack", "3. Kiểm tra hàng xóm", "4. Tô màu và push"]
      : ["1. Read source color", "2. Pop DFS stack", "3. Check a neighbor", "4. Recolor and push"]);
  const phasesHtml = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < activePhase;
    const state = done ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${done ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const cellsHtml = view.image.map((row, rowIndex) => row.map((value, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const classes = ["flood-fill-cell"];
    if (view.changed[rowIndex][colIndex]) classes.push("is-filled");
    else if (view.original[rowIndex][colIndex] === view.originalColor) classes.push("is-source-color");
    else classes.push("is-barrier");
    if (key === startKey) classes.push("is-start");
    if (key === currentKey) classes.push("is-current");
    if (key === neighborKey) classes.push("is-neighbor");
    const tags = [];
    if (key === currentKey) tags.push(recursive ? (hasTopFrame ? "TOP" : "READ") : "CUR");
    if (key === neighborKey) tags.push("NEXT");
    return `<div class="${classes.join(" ")}">
      <small>[${rowIndex},${colIndex}]</small>
      <strong>${escapeHtml(value)}</strong>
      <span>${tags.join(" · ")}</span>
    </div>`;
  }).join("")).join("");

  const stackHtml = view.stack.length
    ? view.stack.map((cell, index) => {
      const top = index === view.stack.length - 1;
      const front = index === 0;
      const back = top;
      const label = recursive
        ? (top ? `TOP · d${index}` : `depth ${index}`)
        : bfs
          ? (front && back ? "FRONT / BACK" : front ? "FRONT" : back ? "BACK" : `#${index}`)
          : (top ? "TOP" : `#${index}`);
      return `<span class="${(bfs ? front : top) ? "is-top" : ""}"><small>${label}</small><strong>${escapeHtml(coord(cell))}</strong></span>`;
    }).join("")
    : `<em>∅</em>`;

  const directionDefinitions = [
    { delta: [1, 0], arrow: "↓", vi: "xuống", en: "down" },
    { delta: [-1, 0], arrow: "↑", vi: "lên", en: "up" },
    { delta: [0, 1], arrow: "→", vi: "phải", en: "right" },
    { delta: [0, -1], arrow: "←", vi: "trái", en: "left" },
  ];
  const directionHtml = directionDefinitions.map((direction) => {
    const active = Array.isArray(view.direction)
      && view.direction[0] === direction.delta[0] && view.direction[1] === direction.delta[1];
    return `<span class="${active ? "is-active" : ""}"><b>${direction.arrow}</b><small>${escapeHtml(vi ? direction.vi : direction.en)}</small><code>(${direction.delta.join(",")})</code></span>`;
  }).join("");

  const activeDirection = directionDefinitions.find((direction) => Array.isArray(view.direction)
    && view.direction[0] === direction.delta[0] && view.direction[1] === direction.delta[1]);
  const arrow = activeDirection ? activeDirection.arrow : "→";
  const currentInside = Array.isArray(view.current)
    && view.current[0] >= 0 && view.current[0] < view.rows
    && view.current[1] >= 0 && view.current[1] < view.cols;
  const currentValue = currentInside ? view.image[view.current[0]][view.current[1]] : "OUT";
  let neighborValue = "?";
  if (neighborInside) neighborValue = view.image[view.neighbor[0]][view.neighbor[1]];
  const recursiveState = {
    "dfs-enter": ["FRAME STATE", "enter", `d${Math.max(0, view.stack.length - 1)}`],
    "bounds-check": ["BASE CASE 1", "in bounds?", view.insideGrid === null ? "?" : view.insideGrid ? "True" : "False"],
    "return-bounds": ["FRAME STATE", "out of bounds", "RETURN"],
    "color-check": ["BASE CASE 2", "source color?", view.matchesOriginal === null ? "?" : view.matchesOriginal ? "True" : "False"],
    "return-color": ["FRAME STATE", "wrong/visited", "RETURN"],
    recolor: ["FRAME STATE", "recolor", String(view.newColor)],
    "dfs-complete": ["FRAME STATE", "4 calls done", "RETURN"],
  }[view.phase] || ["FRAME STATE", "dfs(row,col)", "ACTIVE"];
  const bfsState = {
    "read-color": ["BFS SETUP", "read source", String(view.originalColor ?? "?")],
    "same-color-check": ["BFS SETUP", "same color?", view.originalColor === view.newColor ? "True" : "False"],
    "queue-init": ["QUEUE OP", "enqueue start", "BACK"],
    "fill-start": ["VISITED", "recolor start", String(view.newColor)],
    directions: ["BFS SETUP", "4 directions", "READY"],
    dequeue: ["QUEUE OP", "popleft", "FRONT"],
    direction: ["DIRECTION", activeDirection ? `(${activeDirection.delta.join(",")})` : "choose", arrow],
    "next-row": ["COORDINATE", "next_row", String(view.nextRow ?? "?")],
  }[view.phase] || ["BFS STATE", "queue traversal", "ACTIVE"];
  const hasNeighbor = Array.isArray(view.neighbor);
  const routeHtml = Array.isArray(view.current) && ((!recursive && !bfs) || hasNeighbor)
    ? `<div class="flood-fill-route">
        <span class="${currentInside ? "is-current" : "is-outside"}"><small>${hasTopFrame ? "TOP FRAME" : recursive ? "FOCUS" : "CURRENT"}</small><strong>${escapeHtml(coord(view.current))}</strong><em>${escapeHtml(currentValue)}</em></span>
        <b>${arrow}</b>
        <span class="${neighborInside ? "is-neighbor" : "is-outside"}"><small>NEIGHBOR</small><strong>${escapeHtml(coord(view.neighbor))}</strong><em>${neighborInside ? escapeHtml(neighborValue) : "OUT"}</em></span>
      </div>`
    : recursive && Array.isArray(view.current)
      ? `<div class="flood-fill-route is-frame">
          <span class="${currentInside ? "is-current" : "is-outside"}"><small>${hasTopFrame ? "TOP FRAME" : "FOCUS"}</small><strong>${escapeHtml(coord(view.current))}</strong><em>${escapeHtml(currentValue)}</em></span>
          <b>→</b>
          <span class="is-check"><small>${escapeHtml(recursiveState[0])}</small><strong>${escapeHtml(recursiveState[1])}</strong><em>${escapeHtml(recursiveState[2])}</em></span>
        </div>`
      : bfs && Array.isArray(view.current)
        ? `<div class="flood-fill-route is-frame">
            <span class="${currentInside ? "is-current" : "is-outside"}"><small>CURRENT</small><strong>${escapeHtml(coord(view.current))}</strong><em>${escapeHtml(currentValue)}</em></span>
            <b>→</b>
            <span class="is-check"><small>${escapeHtml(bfsState[0])}</small><strong>${escapeHtml(bfsState[1])}</strong><em>${escapeHtml(bfsState[2])}</em></span>
          </div>`
        : `<div class="flood-fill-route is-idle"><code>${recursive ? "dfs(row,col) → base cases → recolor → 4 calls" : bfs ? "queue.popleft() → current → enqueue neighbors" : "stack.pop() → current → 4 neighbors"}</code></div>`;

  const truth = (value) => value === null ? "?" : value ? "True" : "False";
  let decision = "?";
  let decisionClass = "";
  if (view.phase === "done") {
    decision = "RETURN";
    decisionClass = "is-fill";
  } else if (recursive && view.phase === "main-call") {
    decision = "CALL";
    decisionClass = "is-push";
  } else if (recursive && view.phase === "dfs-enter") {
    decision = "ENTER";
    decisionClass = "is-push";
  } else if (recursive && view.phase === "bounds-check") {
    decision = view.insideGrid ? "NEXT CHECK" : "RETURN";
    decisionClass = view.insideGrid ? "is-fill" : "is-skip";
  } else if (recursive && view.phase === "color-check") {
    decision = view.matchesOriginal ? "RECOLOR" : "RETURN";
    decisionClass = view.matchesOriginal ? "is-fill" : "is-skip";
  } else if (recursive && ["return-bounds", "return-color", "dfs-complete"].includes(view.phase)) {
    decision = "RETURN";
    decisionClass = "is-skip";
  } else if (recursive && view.phase === "recolor") {
    decision = "RECOLOR";
    decisionClass = "is-fill";
  } else if (recursive && view.phase === "recursive-call") {
    decision = "CALL";
    decisionClass = "is-push";
  } else if (recursive && view.phase === "resume-frame") {
    decision = "RESUME";
    decisionClass = "is-fill";
  } else if (recursive && view.phase === "main-resume") {
    decision = "DONE";
    decisionClass = "is-fill";
  } else if (bfs && view.phase === "queue-init") {
    decision = "ENQUEUE";
    decisionClass = "is-push";
  } else if (bfs && view.phase === "queue-check") {
    decision = "CONTINUE";
    decisionClass = "is-fill";
  } else if (bfs && view.phase === "dequeue") {
    decision = "DEQUEUE";
    decisionClass = "is-push";
  } else if (bfs && ["row-bounds", "col-bounds"].includes(view.phase)) {
    decision = "STORE";
    decisionClass = "is-fill";
  } else if (bfs && view.phase === "bounds-check") {
    decision = view.insideGrid ? "NEXT CHECK" : "SKIP";
    decisionClass = view.insideGrid ? "is-fill" : "is-skip";
  } else if (bfs && ["continue-bounds", "continue-color"].includes(view.phase)) {
    decision = "SKIP";
    decisionClass = "is-skip";
  } else if (bfs && view.phase === "color-check") {
    decision = view.matchesOriginal ? "RECOLOR" : "SKIP";
    decisionClass = view.matchesOriginal ? "is-fill" : "is-skip";
  } else if (bfs && view.phase === "enqueue-neighbor") {
    decision = "ENQUEUE";
    decisionClass = "is-push";
  } else if (bfs && view.phase === "queue-empty") {
    decision = "STOP";
    decisionClass = "is-skip";
  } else if (view.phase === "stack-empty") {
    decision = "STOP";
    decisionClass = "is-skip";
  } else if (view.phase === "fill-neighbor") {
    decision = vi ? "TÔ MÀU" : "RECOLOR";
    decisionClass = "is-fill";
  } else if (view.phase === "push-neighbor") {
    decision = "PUSH";
    decisionClass = "is-push";
  } else if (view.canFill !== null) {
    decision = view.canFill ? (vi ? "HỢP LỆ" : "FILL") : (vi ? "BỎ QUA" : "SKIP");
    decisionClass = view.canFill ? "is-fill" : "is-skip";
  }
  const firstCheck = bfs && view.phase === "row-bounds"
    ? { label: "ROW IN BOUNDS", value: view.rowInside }
    : bfs && view.phase === "col-bounds"
      ? { label: "COL IN BOUNDS", value: view.colInside }
      : { label: vi ? "TRONG BIÊN" : "IN BOUNDS", value: view.insideGrid };
  const checksHtml = `<div class="flood-fill-checks">
    <span class="${firstCheck.value === true ? "is-pass" : firstCheck.value === false ? "is-fail" : ""}"><small>${firstCheck.label}</small><strong>${truth(firstCheck.value)}</strong></span>
    <b>AND</b>
    <span class="${view.matchesOriginal === true ? "is-pass" : view.matchesOriginal === false ? "is-fail" : ""}"><small>${recursive ? "image[row][col] == original" : "image[next] == original"}</small><strong>${truth(view.matchesOriginal)}</strong></span>
    <b>→</b>
    <span class="flood-fill-decision ${decisionClass}"><small>${vi ? "HÀNH ĐỘNG" : "ACTION"}</small><strong>${escapeHtml(decision)}</strong></span>
  </div>`;

  let actionDetail;
  if (bfs && view.phase === "enter") {
    actionDetail = vi ? "Cách 3 dùng FIFO queue: lấy ô cũ nhất ở FRONT, thêm ô mới vào BACK." : "Approach 3 uses a FIFO queue: remove the oldest cell at FRONT and add new cells at BACK.";
  } else if (bfs && view.phase === "dimensions") {
    actionDetail = vi ? `Image có ${view.rows} hàng, ${view.cols} cột; đây là biên để chặn neighbor ngoài image.` : `The image has ${view.rows} rows and ${view.cols} columns; these bounds reject outside neighbors.`;
  } else if (bfs && view.phase === "read-color") {
    actionDetail = vi ? `Đọc original_color = ${view.originalColor} tại ô bắt đầu ${coord(view.start)}.` : `Read original_color = ${view.originalColor} from the start cell ${coord(view.start)}.`;
  } else if (bfs && view.phase === "same-color-check") {
    actionDetail = view.originalColor === view.newColor
      ? (vi ? "Màu mới trùng màu gốc, nên return trước khi tạo queue." : "The new color matches the source, so return before creating the queue.")
      : (vi ? "Màu mới khác màu gốc; tiếp tục khởi tạo BFS queue." : "The new color differs from the source; initialize the BFS queue.");
  } else if (bfs && view.phase === "queue-init") {
    actionDetail = vi ? `${coord(view.start)} vào queue; vì chỉ có một phần tử nên nó vừa là FRONT vừa là BACK.` : `${coord(view.start)} enters the queue; as its only item, it is both FRONT and BACK.`;
  } else if (bfs && view.phase === "fill-start") {
    actionDetail = vi ? "Tô ô bắt đầu ngay khi enqueue để đánh dấu visited và tránh enqueue trùng." : "Recolor the start cell on enqueue to mark it visited and prevent duplicate enqueue.";
  } else if (bfs && view.phase === "directions") {
    actionDetail = vi ? "Bốn hướng không có đường chéo: xuống, lên, phải, trái." : "Use four non-diagonal directions: down, up, right, and left.";
  } else if (bfs && view.phase === "queue-check") {
    actionDetail = vi ? `Queue còn ${view.stack.length} ô; BFS sẽ lấy ô ở FRONT.` : `${view.stack.length} cell(s) remain; BFS removes the FRONT cell next.`;
  } else if (bfs && view.phase === "dequeue") {
    actionDetail = vi ? `${coord(view.current)} vừa rời FRONT và trở thành CURRENT; thứ tự các ô còn lại không đổi.` : `${coord(view.current)} just left FRONT and became CURRENT; the remaining order is unchanged.`;
  } else if (bfs && view.phase === "direction") {
    actionDetail = vi ? `Từ CURRENT ${coord(view.current)}, chọn hướng ${arrow}; bước sau mới tính neighbor.` : `From CURRENT ${coord(view.current)}, choose direction ${arrow}; the next line computes the neighbor.`;
  } else if (bfs && view.phase === "next-row") {
    actionDetail = vi ? `Tính next_row = ${view.nextRow}; bước sau mới tính next_col.` : `Compute next_row = ${view.nextRow}; the next line computes next_col.`;
  } else if (bfs && view.phase === "neighbor") {
    actionDetail = vi ? `Hướng ${arrow} từ ${coord(view.current)} tạo neighbor ${coord(view.neighbor)}.` : `Direction ${arrow} from ${coord(view.current)} produces neighbor ${coord(view.neighbor)}.`;
  } else if (bfs && view.phase === "row-bounds") {
    actionDetail = vi ? `row_inside = ${truth(view.rowInside)} vì kiểm tra 0 <= ${view.nextRow} < ${view.rows}.` : `row_inside = ${truth(view.rowInside)} from checking 0 <= ${view.nextRow} < ${view.rows}.`;
  } else if (bfs && view.phase === "col-bounds") {
    actionDetail = vi ? `col_inside = ${truth(view.colInside)} vì kiểm tra 0 <= ${view.nextCol} < ${view.cols}.` : `col_inside = ${truth(view.colInside)} from checking 0 <= ${view.nextCol} < ${view.cols}.`;
  } else if (bfs && view.phase === "bounds-check") {
    actionDetail = view.insideGrid
      ? (vi ? `${coord(view.neighbor)} nằm trong image; tiếp tục kiểm tra màu.` : `${coord(view.neighbor)} is inside the image; check its color next.`)
      : (vi ? `${coord(view.neighbor)} nằm ngoài image; không được truy cập ô này.` : `${coord(view.neighbor)} is outside the image; do not access this cell.`);
  } else if (bfs && view.phase === "continue-bounds") {
    actionDetail = vi ? "continue bỏ neighbor ngoài biên và chuyển sang hướng tiếp theo; queue không đổi." : "continue skips the out-of-bounds neighbor and moves to the next direction; the queue is unchanged.";
  } else if (bfs && view.phase === "color-check") {
    actionDetail = view.matchesOriginal
      ? (vi ? `image${coord(view.neighbor)} vẫn bằng ${view.originalColor}; neighbor thuộc vùng cần tô.` : `image${coord(view.neighbor)} still equals ${view.originalColor}; the neighbor belongs to the fill region.`)
      : (vi ? `image${coord(view.neighbor)} không bằng ${view.originalColor}; đây là biên màu hoặc ô đã visited.` : `image${coord(view.neighbor)} does not equal ${view.originalColor}; it is a color boundary or an already visited cell.`);
  } else if (bfs && view.phase === "continue-color") {
    actionDetail = vi ? "continue bỏ ô khác màu hoặc đã tô; không thêm nó vào queue." : "continue skips a different or visited cell; it is not added to the queue.";
  } else if (bfs && view.phase === "fill-neighbor") {
    actionDetail = vi ? `Đổi ${coord(view.neighbor)} sang màu ${view.newColor} trước khi enqueue để đánh dấu visited.` : `Recolor ${coord(view.neighbor)} to ${view.newColor} before enqueueing it to mark it visited.`;
  } else if (bfs && view.phase === "enqueue-neighbor") {
    actionDetail = vi ? `${coord(view.neighbor)} vào BACK; mọi ô đứng trước sẽ được dequeue trước nó.` : `${coord(view.neighbor)} enters at BACK; every cell ahead of it will be dequeued first.`;
  } else if (bfs && view.phase === "queue-empty") {
    actionDetail = vi ? "Queue rỗng: toàn bộ component nối với ô bắt đầu đã được xử lý." : "The queue is empty: the entire component connected to the start has been processed.";
  } else if (bfs) {
    actionDetail = vi ? `Hoàn tất BFS: ${view.filledCount} ô đã đổi sang màu ${view.newColor}.` : `BFS complete: ${view.filledCount} cell(s) were changed to color ${view.newColor}.`;
  } else if (recursive && view.phase === "enter") {
    actionDetail = vi ? "Cách 2 dùng call stack của dfs; mỗi lời gọi tạo một frame riêng." : "Approach 2 uses the dfs call stack; every call creates its own frame.";
  } else if (recursive && view.phase === "rows") {
    actionDetail = vi ? `rows = ${view.rows}: lưu số hàng để kiểm tra biên.` : `rows = ${view.rows}: store the row count for bounds checks.`;
  } else if (recursive && view.phase === "dimensions") {
    actionDetail = vi ? `cols = ${view.cols}: miền hợp lệ là row 0..${view.rows - 1}, col 0..${view.cols - 1}.` : `cols = ${view.cols}: valid coordinates are rows 0..${view.rows - 1}, cols 0..${view.cols - 1}.`;
  } else if (recursive && view.phase === "read-color") {
    actionDetail = vi ? `Đọc original_color = ${view.originalColor} tại ô bắt đầu ${coord(view.start)}.` : `Read original_color = ${view.originalColor} from the start cell ${coord(view.start)}.`;
  } else if (recursive && view.phase === "same-color-check") {
    actionDetail = view.originalColor === view.newColor
      ? (vi ? "Màu mới trùng màu gốc, nên return ngay và không tạo frame dfs." : "The new color matches the source, so return before creating any dfs frame.")
      : (vi ? "Màu mới khác màu gốc; tiếp tục định nghĩa và gọi dfs." : "The new color differs from the source; continue to define and call dfs.");
  } else if (recursive && view.phase === "define-dfs") {
    actionDetail = vi ? "Mỗi frame dfs chạy hai base case, tô ô hợp lệ, rồi lần lượt gọi xuống, lên, phải, trái." : "Each dfs frame checks two base cases, recolors a valid cell, then calls down, up, right, and left.";
  } else if (recursive && view.phase === "main-call") {
    actionDetail = vi ? `Dòng chính gọi dfs${coord(view.start)}; bước sau frame đầu tiên mới được đẩy vào call stack.` : `The main function calls dfs${coord(view.start)}; the next step pushes the first frame onto the call stack.`;
  } else if (recursive && view.phase === "dfs-enter") {
    actionDetail = vi ? `Tạo frame ${coord(view.current)} ở TOP; depth hiện tại là ${Math.max(0, view.stack.length - 1)}.` : `Create frame ${coord(view.current)} at TOP; the current depth is ${Math.max(0, view.stack.length - 1)}.`;
  } else if (recursive && view.phase === "bounds-check") {
    actionDetail = view.insideGrid
      ? (vi ? `${coord(view.current)} nằm trong biên, nên frame chuyển sang kiểm tra màu.` : `${coord(view.current)} is in bounds, so this frame proceeds to the color check.`)
      : (vi ? `${coord(view.current)} nằm ngoài biên, nên base case 1 sẽ return.` : `${coord(view.current)} is out of bounds, so base case 1 returns.`);
  } else if (recursive && view.phase === "return-bounds") {
    actionDetail = vi ? `Frame ${coord(view.current)} return vì ngoài biên; bước sau nó rời TOP và frame cha tiếp tục.` : `Frame ${coord(view.current)} returns out of bounds; next it leaves TOP and its parent resumes.`;
  } else if (recursive && view.phase === "color-check") {
    actionDetail = view.matchesOriginal
      ? (vi ? `image${coord(view.current)} vẫn bằng original_color ${view.originalColor}, nên được phép tô.` : `image${coord(view.current)} still equals original_color ${view.originalColor}, so it may be recolored.`)
      : (vi ? `image${coord(view.current)} không còn bằng ${view.originalColor}; base case 2 ngăn đi lặp hoặc vượt vùng.` : `image${coord(view.current)} no longer equals ${view.originalColor}; base case 2 prevents revisits or crossing the region.`);
  } else if (recursive && view.phase === "return-color") {
    actionDetail = vi ? `Frame ${coord(view.current)} return mà không tô; bước sau frame cha được resume.` : `Frame ${coord(view.current)} returns without recoloring; the parent frame resumes next.`;
  } else if (recursive && view.phase === "recolor") {
    actionDetail = vi ? `Đổi image${coord(view.current)} thành ${view.newColor} trước bốn lời gọi con để đánh dấu đã thăm.` : `Set image${coord(view.current)} to ${view.newColor} before the four child calls to mark it visited.`;
  } else if (recursive && view.phase === "recursive-call") {
    actionDetail = vi ? `Frame ${coord(view.current)} tạm dừng và gọi frame con ${coord(view.neighbor)} theo hướng ${arrow}.` : `Frame ${coord(view.current)} pauses and calls child frame ${coord(view.neighbor)} in direction ${arrow}.`;
  } else if (recursive && view.phase === "resume-frame") {
    actionDetail = vi ? `Frame con ${coord(view.neighbor)} đã rời stack; frame cha ${coord(view.current)} tiếp tục ở đúng dòng gọi.` : `Child frame ${coord(view.neighbor)} left the stack; parent frame ${coord(view.current)} resumes at that call line.`;
  } else if (recursive && view.phase === "dfs-complete") {
    actionDetail = vi ? `Bốn hướng của ${coord(view.current)} đều đã return; frame TOP này chuẩn bị rời call stack.` : `All four directions from ${coord(view.current)} returned; this TOP frame is ready to leave the call stack.`;
  } else if (recursive && view.phase === "main-resume") {
    actionDetail = vi ? "Frame gốc đã return; call stack rỗng và quyền điều khiển trở lại floodFill." : "The root frame returned; the call stack is empty and control is back in floodFill.";
  } else if (recursive) {
    actionDetail = vi ? `Hoàn tất: ${view.filledCount} ô đã đổi sang màu ${view.newColor}.` : `Complete: ${view.filledCount} cell(s) were changed to color ${view.newColor}.`;
  } else if (view.phase === "enter") {
    actionDetail = vi ? "Bắt đầu từ ô S và chỉ lan qua cạnh trên, dưới, trái, phải." : "Start at S and spread only through top, bottom, left, and right edges.";
  } else if (view.phase === "dimensions") {
    actionDetail = vi ? `Image có ${view.rows} hàng và ${view.cols} cột.` : `The image has ${view.rows} rows and ${view.cols} columns.`;
  } else if (view.phase === "read-color") {
    actionDetail = vi ? `Ô bắt đầu có màu ${view.originalColor}; chỉ ô nối liền vẫn mang màu này mới thuộc vùng.` : `The start cell has color ${view.originalColor}; only connected cells still carrying it belong to the region.`;
  } else if (view.phase === "same-color-check") {
    actionDetail = view.originalColor === view.newColor
      ? (vi ? "Màu mới trùng màu gốc, nên trả ngay để tránh lặp." : "The new color matches the source, so return immediately to avoid looping.")
      : (vi ? "Màu mới khác màu gốc; có thể bắt đầu DFS." : "The new color differs from the source, so DFS can begin.");
  } else if (view.phase === "directions") {
    actionDetail = vi ? "Bốn hướng không có đường chéo: xuống, lên, phải, trái." : "Use four non-diagonal directions: down, up, right, and left.";
  } else if (view.phase === "stack-init") {
    actionDetail = vi ? `Đưa ô bắt đầu ${coord(view.start)} vào TOP của stack.` : `Put the start cell ${coord(view.start)} on TOP of the stack.`;
  } else if (view.phase === "fill-start") {
    actionDetail = vi ? "Tô ô bắt đầu trước khi duyệt để nó không bao giờ được push lần hai." : "Recolor the start before traversal so it can never be pushed twice.";
  } else if (view.phase === "stack-check") {
    actionDetail = vi ? `Stack còn ${view.stack.length} ô, nên vòng while tiếp tục.` : `${view.stack.length} cell(s) remain on the stack, so the while loop continues.`;
  } else if (view.phase === "pop") {
    actionDetail = vi ? `${coord(view.current)} rời TOP và trở thành CURRENT để mở rộng.` : `${coord(view.current)} leaves TOP and becomes CURRENT for expansion.`;
  } else if (view.phase === "direction") {
    actionDetail = vi ? `Chọn hướng ${activeDirection ? activeDirection.arrow : ""}; bước kế tiếp mới tính tọa độ neighbor.` : `Choose direction ${activeDirection ? activeDirection.arrow : ""}; the next line computes the neighbor coordinate.`;
  } else if (view.phase === "neighbor") {
    actionDetail = vi ? `Từ CURRENT ${coord(view.current)}, hướng ${arrow} tạo neighbor ${coord(view.neighbor)}.` : `From CURRENT ${coord(view.current)}, direction ${arrow} produces neighbor ${coord(view.neighbor)}.`;
  } else if (view.phase === "neighbor-check") {
    actionDetail = view.canFill
      ? (vi ? "Neighbor nằm trong biên và còn màu gốc, nên được phép tô." : "The neighbor is in bounds and still has the source color, so it can be filled.")
      : (vi ? "Ít nhất một điều kiện sai; neighbor không được tô hay push." : "At least one condition fails; the neighbor is neither recolored nor pushed.");
  } else if (view.phase === "fill-neighbor") {
    actionDetail = vi ? `Đổi ${coord(view.neighbor)} sang màu ${view.newColor} trước khi push.` : `Recolor ${coord(view.neighbor)} to ${view.newColor} before pushing it.`;
  } else if (view.phase === "push-neighbor") {
    actionDetail = vi ? `${coord(view.neighbor)} đã ở TOP và sẽ được pop để tiếp tục lan.` : `${coord(view.neighbor)} is now on TOP and will later be popped to continue the fill.`;
  } else if (view.phase === "stack-empty") {
    actionDetail = vi ? "Stack rỗng: không còn ô nào trong component cần mở rộng." : "The stack is empty: no cell in the component remains to expand.";
  } else {
    actionDetail = vi ? `Hoàn tất: ${view.filledCount} ô đã đổi sang màu ${view.newColor}.` : `Complete: ${view.filledCount} cell(s) were changed to color ${view.newColor}.`;
  }

  const summary = vi
    ? `Flood Fill ${view.rows} nhân ${view.cols}; đã tô ${view.filledCount} ô; ${recursive ? "call stack" : bfs ? "queue" : "stack"} có ${view.stack.length} phần tử.`
    : `Flood Fill ${view.rows} by ${view.cols}; ${view.filledCount} cells recolored; ${view.stack.length} item(s) in the ${recursive ? "call stack" : bfs ? "BFS queue" : "DFS stack"}.`;
  $("treeView").innerHTML = `<section class="flood-fill-viz${recursive ? " is-recursive" : bfs ? " is-bfs" : ""}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="flood-fill-phases">${phasesHtml}</div>
    <div class="flood-fill-status">
      <span><small>${vi ? "MÀU GỐC" : "SOURCE"}</small><strong>${view.originalColor === null ? "?" : escapeHtml(view.originalColor)}</strong></span>
      <span><small>${vi ? "MÀU MỚI" : "NEW COLOR"}</small><strong>${escapeHtml(view.newColor)}</strong></span>
      <span><small>${vi ? "ĐÃ TÔ" : "RECOLORED"}</small><strong>${view.filledCount}</strong></span>
      <span><small>${recursive ? "CALL STACK" : bfs ? "QUEUE" : "STACK"}</small><strong>${view.stack.length}</strong></span>
    </div>
    <div class="flood-fill-main">
      <section class="flood-fill-image-section">
        <header><strong>IMAGE</strong><span>${vi ? "tọa độ [row,col]" : "coordinates [row,col]"}</span></header>
        <div class="flood-fill-grid-scroll"><div class="flood-fill-grid" style="--flood-cols:${view.cols}">${cellsHtml}</div></div>
      </section>
      <section class="flood-fill-work-section">
        <header><strong>${recursive ? "CALL STACK" : bfs ? "BFS QUEUE" : "DFS STACK"}</strong><span>${recursive ? (vi ? "TOP frame ở bên phải" : "TOP frame at the right") : bfs ? (vi ? "popleft FRONT · append BACK" : "popleft FRONT · append BACK") : (vi ? "push/pop ở bên phải" : "push/pop at the right")}</span></header>
        <div class="flood-fill-stack">${stackHtml}</div>
        <div class="flood-fill-directions">${directionHtml}</div>
        ${routeHtml}
      </section>
    </div>
    ${checksHtml}
    <div class="flood-fill-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="flood-fill-legend">
      <span><i class="source"></i>${vi ? "còn màu gốc" : "source color"}</span>
      <span><i class="filled"></i>${vi ? "đã đổi màu" : "recolored"}</span>
      <span><i class="current"></i>${recursive ? "TOP FRAME" : "CURRENT"}</span>
      <span><i class="neighbor"></i>NEIGHBOR</span>
      <span><b>S</b>${vi ? "ô bắt đầu" : "start cell"}</span>
    </div>
  </section>`;
}

// ---- 749 Contain Virus renderer (reuses the flood-fill-* CSS from #733) ----
function renderVirusView(step) {
  const view = step.virusView;
  const vi = lang === "vi";
  const keyOf = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const coord = (cell) => Array.isArray(cell) ? `(${cell[0]},${cell[1]})` : "—";
  const currentKey = keyOf(view.current);

  // 4 tabs matching Contain Virus's own daily cycle:
  //   1. Scan & DFS each region   2. Compare frontiers   3. Quarantine winner   4. Spread the rest
  const scanPhases = new Set(["scan-cell", "dfs-visit", "dfs-neighbor", "region-done"]);
  const comparePhases = new Set(["no-regions", "compare-frontiers", "no-threat"]);
  const quarantinePhases = new Set(["add-walls", "mark-quarantine"]);
  const spreadPhases = new Set(["spread-loop", "spread-cell", "done"]);
  const activePhase = quarantinePhases.has(view.phase) ? 2 : spreadPhases.has(view.phase) ? 3 : comparePhases.has(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Quét & DFS từng vùng", "2. So sánh frontier", "3. Cách ly vùng thắng", "4. Lan các vùng còn lại"]
    : ["1. Scan & DFS regions", "2. Compare frontiers", "3. Quarantine winner", "4. Spread the rest"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < activePhase;
    const state = done ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${done ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // Grid cells: 0=uninfected, 1=infected, 2 or -1=quarantined (walled)
  const regionSet = new Set(view.regionCells || []);
  const frontierSet = new Set(view.frontierCells || []);
  const winnerSet = new Set(view.winnerCells || []);
  const cellsHtml = view.grid.map((row, rowIndex) => row.map((value, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const classes = ["flood-fill-cell"];
    const quarantined = value === 2 || value === -1;
    if (quarantined) classes.push("is-filled");
    else if (value === 1) classes.push("is-source-color");
    else classes.push("is-barrier");
    if (regionSet.has(key)) classes.push("is-neighbor");
    if (frontierSet.has(key)) classes.push("is-virus-frontier");
    if (winnerSet.has(key)) classes.push("is-current");
    if (key === currentKey) classes.push("is-current");
    const tags = [];
    if (regionSet.has(key)) tags.push(vi ? "VÙNG" : "REGION");
    if (frontierSet.has(key)) tags.push(vi ? "BIÊN" : "FRONTIER");
    if (winnerSet.has(key)) tags.push(vi ? "CÁCH LY" : "WALLED");
    return `<div class="${classes.join(" ")}">
      <small>[${rowIndex},${colIndex}]</small>
      <strong>${escapeHtml(value)}</strong>
      <span>${tags.join(" · ")}</span>
    </div>`;
  }).join("")).join("");

  // Region summary table: one row per region found this day
  const regionsHtml = (view.regions && view.regions.length)
    ? view.regions.map((region, index) => {
      const isWinner = index === view.quarantineIndex;
      return `<span class="${isWinner ? "is-top" : ""}">
        <small>${vi ? "vùng" : "region"} #${index}</small>
        <strong>${region.size} ${vi ? "ô" : "cells"}</strong>
        <em>${vi ? "frontier" : "frontier"}=${region.frontierSize} · ${vi ? "tường" : "walls"}=${region.walls}</em>
      </span>`;
    }).join("")
    : `<em>∅</em>`;

  const truth = (value) => value === null || value === undefined ? "?" : value ? "True" : "False";
  let decision = "?";
  let decisionClass = "";
  if (view.phase === "mark-quarantine") { decision = vi ? "CÁCH LY" : "QUARANTINE"; decisionClass = "is-fill"; }
  else if (view.phase === "add-walls") { decision = vi ? "XÂY TƯỜNG" : "BUILD WALLS"; decisionClass = "is-fill"; }
  else if (view.phase === "spread-cell") { decision = vi ? "LAN" : "SPREAD"; decisionClass = "is-push"; }
  else if (view.phase === "no-threat" || view.phase === "no-regions") { decision = vi ? "DỪNG" : "STOP"; decisionClass = "is-skip"; }
  else if (view.phase === "done") { decision = vi ? "TRẢ VỀ" : "RETURN"; decisionClass = "is-fill"; }
  else if (view.phase === "compare-frontiers") { decision = vi ? "CHỌN VÙNG MAX" : "PICK MAX"; decisionClass = "is-push"; }
  else if (view.phase === "dfs-visit" || view.phase === "dfs-neighbor") { decision = vi ? "MỞ RỘNG VÙNG" : "EXPAND REGION"; decisionClass = "is-push"; }

  const checksHtml = `<div class="flood-fill-checks">
    <span class="${view.day !== undefined ? "is-pass" : ""}"><small>${vi ? "NGÀY" : "DAY"}</small><strong>${view.day ?? "?"}</strong></span>
    <b>·</b>
    <span class="${view.regions && view.regions.length ? "is-pass" : ""}"><small>${vi ? "SỐ VÙNG" : "REGIONS"}</small><strong>${view.regions ? view.regions.length : "?"}</strong></span>
    <b>→</b>
    <span class="flood-fill-decision ${decisionClass}"><small>${vi ? "HÀNH ĐỘNG" : "ACTION"}</small><strong>${escapeHtml(decision)}</strong></span>
  </div>`;

  const summary = vi
    ? `Contain Virus ${view.rows} nhân ${view.cols}; ngày ${view.day ?? "?"}; tổng tường = ${view.totalWalls ?? 0}.`
    : `Contain Virus ${view.rows} by ${view.cols}; day ${view.day ?? "?"}; total walls = ${view.totalWalls ?? 0}.`;

  $("treeView").innerHTML = `<section class="flood-fill-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="flood-fill-phases">${phasesHtml}</div>
    <div class="flood-fill-status">
      <span><small>${vi ? "NGÀY" : "DAY"}</small><strong>${view.day ?? "?"}</strong></span>
      <span><small>${vi ? "SỐ VÙNG" : "REGIONS"}</small><strong>${view.regions ? view.regions.length : 0}</strong></span>
      <span><small>${vi ? "TƯỜNG NGÀY NÀY" : "WALLS TODAY"}</small><strong>${view.wallsToday ?? 0}</strong></span>
      <span><small>${vi ? "TỔNG TƯỜNG" : "TOTAL WALLS"}</small><strong>${view.totalWalls ?? 0}</strong></span>
    </div>
    <div class="flood-fill-main">
      <section class="flood-fill-image-section">
        <header><strong>GRID</strong><span>${vi ? "0=lành 1=nhiễm 2/-1=cách ly" : "0=clean 1=infected 2/-1=walled"}</span></header>
        <div class="flood-fill-grid-scroll"><div class="flood-fill-grid" style="--flood-cols:${view.cols}">${cellsHtml}</div></div>
      </section>
      <section class="flood-fill-work-section">
        <header><strong>${vi ? "CÁC VÙNG NGÀY NÀY" : "REGIONS THIS DAY"}</strong><span>${vi ? "vùng #max_idx sẽ bị cách ly" : "region #max_idx gets quarantined"}</span></header>
        <div class="flood-fill-stack">${regionsHtml}</div>
      </section>
    </div>
    ${checksHtml}
    <div class="flood-fill-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="flood-fill-legend">
      <span><i class="source"></i>${vi ? "đất nhiễm" : "infected"}</span>
      <span><i class="filled"></i>${vi ? "đã cách ly" : "walled"}</span>
      <span><i class="current"></i>${vi ? "vùng thắng" : "winning region"}</span>
      <span><i class="neighbor"></i>${vi ? "vùng hiện tại" : "current region"}</span>
      <span><b>F</b>${vi ? "biên (frontier)" : "frontier"}</span>
    </div>
  </section>`;
}

function renderRottingOrangesView(step) {
  const view = step.rottingOrangesView || {};
  const vi = lang === "vi";
  const grid = Array.isArray(view.grid) ? view.grid : [];
  const frontier = Array.isArray(view.frontier) ? view.frontier : [];
  const nextFrontier = Array.isArray(view.nextFrontier) ? view.nextFrontier : [];
  const queue = Array.isArray(view.queue) ? view.queue : [];
  const newlyRotten = Array.isArray(view.newlyRotten) ? view.newlyRotten : [];
  const key = (row, col) => `${row},${col}`;
  const sourceKey = view.source ? key(view.source[0], view.source[1]) : "";
  const neighborKey = view.neighbor ? key(view.neighbor[0], view.neighbor[1]) : "";
  const frontierKeys = new Set(frontier.map((cell) => key(cell.row, cell.col)));
  const nextKeys = new Set(nextFrontier.map((cell) => key(cell.row, cell.col)));
  const queueKeys = new Set(queue.map((cell) => key(cell.row, cell.col)));
  const newKeys = new Set(newlyRotten.map(([row, col]) => key(row, col)));
  const phaseIndex = view.phase === "result" ? 2 : view.phase === "spread" ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Quét nguồn và đếm cam tươi", "2. Lan theo từng lớp BFS", "3. Kiểm tra cam tươi còn lại"]
    : ["1. Scan sources and count fresh", "2. Spread one BFS layer per minute", "3. Check remaining fresh"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const cellsHtml = grid.flatMap((row) => row.map((cell) => {
    const cellKey = key(cell.row, cell.col);
    const classes = ["rotting-cell"];
    if (cell.value === 0) classes.push("is-empty");
    else if (cell.value === 1) classes.push("is-fresh");
    else classes.push("is-rotten");
    if (frontierKeys.has(cellKey)) classes.push("is-frontier");
    if (nextKeys.has(cellKey)) classes.push("is-next-frontier");
    if (cellKey === sourceKey) classes.push("is-source");
    if (cellKey === neighborKey) classes.push("is-neighbor");
    if (newKeys.has(cellKey)) classes.push("is-newly-rotten");
    let badge = "";
    if (cellKey === sourceKey) badge = vi ? "ĐANG LAN" : "SPREADING";
    else if (newKeys.has(cellKey)) badge = `NEW · t=${cell.rottenMinute}`;
    else if (nextKeys.has(cellKey)) badge = "NEXT";
    else if (frontierKeys.has(cellKey)) badge = "NOW";
    const stateLabel = cell.value === 0
      ? (vi ? "TRỐNG" : "EMPTY")
      : cell.value === 1
        ? "FRESH"
        : `ROTTEN · t=${Math.max(0, cell.rottenMinute)}`;
    const orange = cell.value === 0
      ? `<span class="rotting-empty-mark">0</span>`
      : `<span class="rotting-orange"><i></i><b>${cell.value === 1 ? "1" : "2"}</b></span>`;
    return `<div class="${classes.join(" ")}" role="gridcell" aria-label="cell ${cell.row}, ${cell.col}: ${escapeHtml(stateLabel)}">
      <span class="rotting-cell-badge">${escapeHtml(badge)}</span>
      ${orange}
      <small>[${cell.row},${cell.col}]</small>
      <em>${escapeHtml(stateLabel)}</em>
    </div>`;
  })).join("");

  const makeQueueLane = (items, kind) => items.length
    ? items.map((cell, index) => {
      const cellKey = key(cell.row, cell.col);
      const classes = ["rotting-queue-chip"];
      if (cellKey === sourceKey) classes.push("is-current");
      if (kind === "current" && !queueKeys.has(cellKey) && cellKey !== sourceKey) classes.push("is-processed");
      if (kind === "next") classes.push("is-next");
      return `<span class="${classes.join(" ")}"><small>${index + 1}</small><strong>(${cell.row},${cell.col})</strong><em>t=${Math.max(0, cell.rottenMinute)}</em></span>`;
    }).join(`<b>→</b>`)
    : `<em class="rotting-lane-empty">${vi ? "trống" : "empty"}</em>`;

  const timelineHtml = (view.timeline || []).map((entry) => `<span class="${entry.minute === view.minutes ? "is-current" : entry.minute === view.targetMinute ? "is-next" : ""}"><small>${vi ? "PHÚT" : "MIN"} ${entry.minute}</small><strong>${entry.cells.length}</strong><em>${entry.cells.map(([row, col]) => `(${row},${col})`).join(" · ") || "—"}</em></span>`).join("");

  const directions = [
    { delta: [-1, 0], arrow: "↑", label: vi ? "LÊN" : "UP", cls: "up" },
    { delta: [0, 1], arrow: "→", label: vi ? "PHẢI" : "RIGHT", cls: "right" },
    { delta: [1, 0], arrow: "↓", label: vi ? "XUỐNG" : "DOWN", cls: "down" },
    { delta: [0, -1], arrow: "←", label: vi ? "TRÁI" : "LEFT", cls: "left" },
  ];
  const directionHtml = directions.map((direction) => {
    const active = view.direction && view.direction[0] === direction.delta[0] && view.direction[1] === direction.delta[1];
    return `<span class="rotting-direction ${direction.cls}${active ? " is-active" : ""}"><strong>${direction.arrow}</strong><small>${direction.label}</small><em>(${direction.delta.join(",")})</em></span>`;
  }).join("");

  let checkHtml;
  if (view.neighbor) {
    const inBounds = view.check ? view.check.inBounds : null;
    const isFresh = view.check ? view.check.isFresh : null;
    const sourceText = view.source ? `(${view.source.join(",")})` : "?";
    const directionText = view.direction ? `(${view.direction.join(",")})` : "?";
    const neighborText = `(${view.neighbor.join(",")})`;
    const accepted = inBounds === true && isFresh === true;
    checkHtml = `<div class="rotting-neighbor-check ${accepted ? "is-pass" : inBounds === false || isFresh === false ? "is-fail" : ""}">
      <div class="rotting-coordinate"><span><small>${vi ? "CAM NGUỒN" : "SOURCE"}</small><strong>${escapeHtml(sourceText)}</strong></span><i>+</i><span><small>${vi ? "HƯỚNG" : "DIRECTION"}</small><strong>${escapeHtml(directionText)}</strong></span><i>=</i><span><small>${vi ? "Ô KẾ" : "NEIGHBOR"}</small><strong>${escapeHtml(neighborText)}</strong></span></div>
      <div class="rotting-checks"><span class="${inBounds === true ? "pass" : inBounds === false ? "fail" : "pending"}"><b>1</b><small>${vi ? "nằm trong grid" : "inside grid"}</small><strong>${inBounds === null ? "?" : String(inBounds)}</strong></span><span class="${isFresh === true ? "pass" : isFresh === false ? "fail" : "pending"}"><b>2</b><small>grid[next] == 1</small><strong>${isFresh === null ? "?" : String(isFresh)}</strong></span><em>${accepted ? (vi ? "CAM NÀY SẼ THỐI" : "THIS ORANGE ROTS") : inBounds === false || isFresh === false ? (vi ? "BỎ QUA HƯỚNG NÀY" : "SKIP THIS DIRECTION") : (vi ? "ĐANG KIỂM TRA" : "CHECKING")}</em></div>
    </div>`;
  } else {
    checkHtml = `<div class="rotting-rule"><strong>1 ${vi ? "phút" : "minute"} = 1 BFS level</strong><span>${vi ? "Chỉ frontier NOW được lan; cam NEXT phải chờ phút sau." : "Only the NOW frontier spreads; NEXT oranges wait for the following minute."}</span></div>`;
  }

  const initialFresh = Number.isInteger(view.initialFresh) ? view.initialFresh : 0;
  const freshValue = Number.isInteger(view.fresh) ? view.fresh : "?";
  const rottedFresh = Number.isInteger(view.fresh) && initialFresh > 0 ? initialFresh - view.fresh : 0;
  const progress = initialFresh > 0 ? Math.max(0, Math.min(100, (rottedFresh / initialFresh) * 100)) : 0;
  const resultHtml = view.phase === "result" && view.answer !== undefined
    ? `<div class="rotting-result ${view.answer === -1 ? "is-impossible" : "is-success"}"><small>RETURN</small><strong>${escapeHtml(view.answer)}</strong><span>${view.answer === -1 ? (vi ? `${view.fresh} cam tươi bị cô lập` : `${view.fresh} fresh orange(s) are isolated`) : (vi ? `mọi cam tươi đã thối sau ${view.answer} phút` : `all fresh oranges rotted after ${view.answer} minute(s)`)}</span></div>`
    : "";
  const summary = vi
    ? `Rotting Oranges trên grid ${view.rows} nhân ${view.cols}; phút ${view.minutes ?? "?"}; còn ${freshValue} cam tươi.`
    : `Rotting Oranges on a ${view.rows} by ${view.cols} grid; minute ${view.minutes ?? "?"}; ${freshValue} fresh remain.`;

  $("treeView").innerHTML = `<section class="rotting-oranges-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rotting-phases">${phasesHtml}</div>
    <div class="rotting-status">
      <span><small>${vi ? "PHÚT ĐÃ XONG" : "MINUTE DONE"}</small><strong>${view.minutes === null ? "—" : escapeHtml(view.minutes)}</strong></span>
      <span><small>${vi ? "CAM TƯƠI CÒN" : "FRESH LEFT"}</small><strong>${escapeHtml(freshValue)}</strong><i style="--rotting-progress:${progress}%"></i></span>
      <span><small>FRONTIER NOW</small><strong>${frontier.length}</strong></span>
      <span><small>FRONTIER NEXT</small><strong>${nextFrontier.length}</strong></span>
    </div>
    <section class="rotting-grid-section"><header><strong>GRID</strong><span>0 ${vi ? "trống" : "empty"} · 1 fresh · 2 rotten</span></header><div class="rotting-grid" role="grid" style="--rotting-cols:${view.cols}">${cellsHtml}</div></section>
    <div class="rotting-workspace">
      <section class="rotting-queue-section"><header><strong>QUEUE BY MINUTE</strong><span>${vi ? "hai lớp không được trộn khi xử lý" : "process the two layers separately"}</span></header><div class="rotting-lane current"><label>NOW · t=${view.minutes ?? 0}</label><div>${makeQueueLane(frontier, "current")}</div></div><div class="rotting-lane next"><label>NEXT · t=${view.targetMinute ?? 1}</label><div>${makeQueueLane(nextFrontier, "next")}</div></div></section>
      <section class="rotting-directions-section"><header><strong>4 DIRECTIONS</strong><span>${view.source ? `source (${view.source.join(",")})` : (vi ? "chưa có source" : "no source yet")}</span></header><div class="rotting-directions">${directionHtml}</div></section>
    </div>
    ${checkHtml}
    <section class="rotting-timeline-section"><header><strong>${vi ? "LỊCH SỬ LAN" : "SPREAD TIMELINE"}</strong><span>${vi ? "số cam mới thối mỗi phút" : "newly rotten oranges per minute"}</span></header><div class="rotting-timeline">${timelineHtml || `<em>${vi ? "chưa có cam thối" : "no rotten oranges yet"}</em>`}</div></section>
    ${resultHtml}
    <div class="rotting-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="rotting-legend"><span><i class="fresh"></i>fresh</span><span><i class="now"></i>frontier NOW</span><span><i class="next"></i>frontier NEXT</span><span><i class="source"></i>${vi ? "đang lan" : "spreading source"}</span><span><i class="empty"></i>${vi ? "ô trống" : "empty"}</span></div>
  </section>`;
}

function renderBfsGrid(step) {
  const { cells, rows, cols, variant } = step.bfsGrid;
  const el = $("bfsGridView");
  el.style.textAlign = "center";
  const isTicTacToe = variant === "tic-tac-toe";
  const isPhonePath = variant === "phone-path";
  const isEffortGrid = variant === "effort-grid";
  const isDistinctIslands = variant === "distinct-islands";
  const variantClass = isTicTacToe
    ? " tic-tac-toe-grid"
    : isPhonePath
      ? " phone-path-grid"
      : isEffortGrid
        ? " effort-grid"
        : isDistinctIslands
          ? " distinct-islands-grid"
        : "";
  const gridClass = `bfs-grid${variantClass}${isEffortGrid && step.effortView ? " minimax-effort-grid" : ""}`;
  const gridStyle = isTicTacToe
    ? ""
    : ` style="grid-template-columns:repeat(${cols},${isPhonePath ? "68px" : isEffortGrid ? (step.effortView ? "78px" : "64px") : isDistinctIslands ? "58px" : "32px"})"`;
  let html = `<div class="${gridClass}"${gridStyle}>`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const cls = cell.cls || "empty";
      const label = cell.label || "";
      const meta = cell.meta || "";
      const topTag = isEffortGrid ? `<span class="bfs-cell-label-tag">${step.effortView ? "HEIGHT" : "ARR"}</span>` : "";
      const coordTag = step.effortView && cell.coord ? `<span class="bfs-cell-coord">${escapeXml(cell.coord)}</span>` : "";
      const endpointTag = step.effortView && cell.endpoint ? `<span class="bfs-cell-endpoint">${escapeXml(cell.endpoint)}</span>` : "";
      const ariaLabel = step.effortView ? ` aria-label="cell ${escapeXml(cell.coord || `${r},${c}`)}, height ${escapeXml(label)}, ${escapeXml(meta)}"` : "";
      html += `<div class="bfs-cell ${cls}"${ariaLabel}>${topTag}${coordTag}${endpointTag}<span class="bfs-cell-value">${escapeXml(label)}</span>${meta ? `<span class="bfs-cell-meta">${escapeXml(meta)}</span>` : ""}</div>`;
    }
  }
  html += "</div>";
  if (isEffortGrid) {
    const hasParity = !!step.bfsGrid.parity;
    html += step.effortView
      ? `<div class="effort-grid-legend minimax">
          <span><strong class="eg-legend-big">8</strong>${lang === "vi" ? "height của ô" : "cell height"}</span>
          <span><strong class="eg-legend-small">best:2</strong>${lang === "vi" ? "effort tốt nhất tới ô" : "best effort to cell"}</span>
          <span><i class="eg-swatch eg-current"></i>${lang === "vi" ? "current" : "current"}</span>
          <span><i class="eg-swatch eg-neighbor"></i>${lang === "vi" ? "hàng xóm" : "neighbor"}</span>
          <span><i class="eg-swatch eg-path"></i>${lang === "vi" ? "đường cuối" : "final path"}</span>
        </div>`
      : `<div class="effort-grid-legend">
          <span><strong class="eg-legend-big">99</strong> ${lang === "vi" ? "= thời điểm ĐẾN sớm nhất (cập nhật)" : "= earliest ARRIVAL time (updates)"}</span>
          <span><strong class="eg-legend-small">⏱99</strong> ${lang === "vi" ? "= thời điểm phòng sẵn sàng (cố định)" : "= room ready time (fixed)"}</span>
          ${hasParity ? `<span><i class="eg-swatch eg-swatch-even"></i>${lang === "vi" ? "bước tới tốn 1s" : "step costs 1s"}</span><span><i class="eg-swatch eg-swatch-odd"></i>${lang === "vi" ? "bước tới tốn 2s" : "step costs 2s"}</span>` : ""}
        </div>`;
  }
  const guideHtml = step.distinctIslandView ? distinctIslandGuideHtml(step.distinctIslandView) : "";
  const effortGuide = step.effortView ? effortGuideHtml(step.effortView) : "";
  el.innerHTML = guideHtml + effortGuide + html;
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

function distanceKGuideHtml(view) {
  const vi = lang === "vi";
  const phaseOrder = { parent: 0, bfs: 1, collect: 2, done: 3 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phases = [
    { vi: "Nối node với cha", en: "Build parent links" },
    { vi: "BFS từ target", en: "BFS from target" },
    { vi: `Lấy lớp d = ${view.k}`, en: `Collect layer d = ${view.k}` },
  ];
  const phaseHtml = phases.map((item, index) => {
    const state = activePhase > index ? "is-done" : activePhase === index ? "is-active" : "";
    const marker = activePhase > index ? "✓" : String(index + 1);
    return `<div class="distance-k-phase ${state}"><span>${marker}</span>${escapeHtml(vi ? item.vi : item.en)}</div>`;
  }).join("");

  const relationNames = {
    left: vi ? "con trái" : "left child",
    right: vi ? "con phải" : "right child",
    parent: vi ? "cha" : "parent",
  };
  let actionText;
  if (view.phase === "parent") {
    actionText = vi
      ? `Đang tạo đường đi ngược con → cha. Đã ghi ${view.parentCount} liên kết.`
      : `Building reverse child → parent links. ${view.parentCount} links recorded.`;
  } else if (view.phase === "collect" && view.distance !== null && view.distance !== undefined) {
    const layerValues = (view.queue || []).map((item) => item.value).join(", ");
    actionText = vi
      ? `distance=${view.distance}=k nên toàn bộ queue [${layerValues}] là lớp cần lấy.`
      : `distance=${view.distance}=k, so the entire queue [${layerValues}] is the requested layer.`;
  } else if (view.phase === "done") {
    actionText = vi
      ? `Hoàn tất: các node ở đúng lớp d=${view.k} là [${view.result.join(", ")}].`
      : `Done: nodes on layer d=${view.k} are [${view.result.join(", ")}].`;
  } else if (view.inspecting) {
    const relation = relationNames[view.inspecting.relation] || view.inspecting.relation;
    if (view.inspecting.reason === "none") {
      actionText = vi
        ? `Từ node ${view.current.value}, hướng ${relation} là None → bỏ qua.`
        : `From node ${view.current.value}, ${relation} is None → skip.`;
    } else if (view.inspecting.eligible) {
      actionText = vi
        ? `${view.current.value} → ${relation} ${view.inspecting.value}: chưa visited → đưa vào queue với d=${view.current.distance + 1}.`
        : `${view.current.value} → ${relation} ${view.inspecting.value}: not visited → enqueue with d=${view.current.distance + 1}.`;
    } else {
      actionText = vi
        ? `${view.current.value} → ${relation} ${view.inspecting.value}: đã có trong visited → bỏ qua để tránh quay vòng.`
        : `${view.current.value} → ${relation} ${view.inspecting.value}: already in visited → skip to prevent a cycle.`;
    }
  } else if (view.current) {
    actionText = view.current.distance === view.k
      ? (vi
          ? `Node ${view.current.value} có d=${view.current.distance}=k → thêm vào result và không mở rộng xa hơn.`
          : `Node ${view.current.value} has d=${view.current.distance}=k → add it to result and do not expand farther.`)
      : (vi
          ? `Đang xử lý node ${view.current.value} tại d=${view.current.distance}; kiểm tra lần lượt left, right, parent.`
          : `Processing node ${view.current.value} at d=${view.current.distance}; inspect left, right, then parent.`);
  } else {
    actionText = vi
      ? `Target ${view.target} bắt đầu ở d=0. Queue luôn lấy node có khoảng cách nhỏ nhất trước.`
      : `Target ${view.target} starts at d=0. The queue always processes the smallest distance first.`;
  }

  const layerMap = new Map((view.layers || []).map((layer) => [Number(layer.distance), layer.nodes || []]));
  if (!layerMap.has(Number(view.k))) layerMap.set(Number(view.k), []);
  const layerHtml = [...layerMap.entries()].sort(([a], [b]) => a - b).map(([distance, nodes]) => {
    const isGoal = distance === Number(view.k);
    const nodesHtml = nodes.length
      ? nodes.map((node) => {
          const stateClass = node.isAnswer
            ? "is-answer"
            : node.isCurrent
              ? "is-current"
              : node.isQueued
                ? "is-queued"
                : node.isTarget
                  ? "is-target"
                  : "is-visited";
          const stateLabel = node.isAnswer
            ? (vi ? "đáp án" : "answer")
            : node.isCurrent
              ? (vi ? "đang xử lý" : "current")
              : node.isQueued
                ? "queue"
                : node.isTarget
                  ? "target"
                  : "visited";
          return `<span class="distance-k-node ${stateClass}"><b>${escapeHtml(node.value)}</b><small>${stateLabel}</small></span>`;
        }).join("")
      : `<span class="distance-k-empty">${vi ? "chưa tới lớp này" : "layer not reached yet"}</span>`;
    return `<div class="distance-k-layer${isGoal ? " is-goal" : ""}">
      <div class="distance-k-layer-label"><strong>d=${distance}</strong>${isGoal ? `<small>${vi ? "CẦN LẤY" : "COLLECT"}</small>` : ""}</div>
      <div class="distance-k-layer-nodes">${nodesHtml}</div>
    </div>`;
  }).join("");

  const summary = vi
    ? `Mô phỏng BFS từ target ${view.target}; lớp khoảng cách cần tìm là ${view.k}.`
    : `BFS simulation from target ${view.target}; requested distance layer is ${view.k}.`;
  return `<section class="distance-k-guide" aria-label="${escapeHtml(summary)}">
    <div class="distance-k-phases">${phaseHtml}</div>
    <div class="distance-k-rule"><strong>${vi ? "Quy tắc:" : "Rule:"}</strong> ${vi ? "mỗi cạnh đi qua làm distance tăng 1; visited ngăn quay lại node cũ." : "each traversed edge adds 1 to distance; visited prevents returning to an old node."}</div>
    <div class="distance-k-action">${escapeHtml(actionText)}</div>
    <div class="distance-k-layers">${layerHtml}</div>
    <div class="distance-k-legend">
      <span><i class="target"></i>target</span>
      <span><i class="current"></i>${vi ? "đang xử lý" : "current"}</span>
      <span><i class="queued"></i>queue</span>
      <span><i class="visited"></i>visited</span>
      <span><i class="answer"></i>${vi ? "đáp án" : "answer"}</span>
    </div>
  </section>`;
}

function rightSideBfsGuideHtml(view) {
  const vi = lang === "vi";
  const phaseGroup = {
    initialize: 0,
    "enqueue-root": 0,
    "while-queue": 1,
    "lock-level": 1,
    "level-index": 2,
    dequeue: 2,
    "check-left": 2,
    "enqueue-left": 2,
    "check-right": 2,
    "enqueue-right": 2,
    "check-rightmost": 3,
    "save-rightmost": 3,
    "done-levels": 3,
    done: 3,
  };
  const activePhase = phaseGroup[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1. Enqueue root", "2. Chốt size của tầng", "3. Popleft và enqueue con", "4. Lưu node cuối tầng"]
    : ["1. Enqueue root", "2. Lock the level size", "3. Popleft and enqueue children", "4. Save the level's last node"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < activePhase;
    const state = done ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${done ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+\.\s*/, ""))}</b></span>`;
  }).join("");

  const selectedIds = new Set(view.selectedIds || []);
  const currentLevelHtml = (view.currentLevel || []).length
    ? view.currentLevel.map((node, index) => {
      const isCurrent = view.current && node.id === view.current.id;
      const isNext = !view.current && index === view.index;
      const classes = [
        "rsv-level-node",
        index < view.processedCount ? "is-processed" : "is-pending",
        isCurrent ? "is-current" : "",
        isNext ? "is-next" : "",
        index === view.rightmostIndex ? "is-rightmost" : "",
        selectedIds.has(node.id) ? "is-saved" : "",
      ].filter(Boolean).join(" ");
      const stateLabel = isCurrent
        ? "CURRENT"
        : isNext
          ? (vi ? "KẾ TIẾP" : "NEXT")
          : index < view.processedCount
            ? (vi ? "ĐÃ XỬ LÝ" : "PROCESSED")
            : (vi ? "ĐANG CHỜ" : "WAITING");
      return `<span class="${classes}"><small>i=${index}${index === view.rightmostIndex ? " · RIGHTMOST" : ""}</small><strong>${escapeHtml(node.val)}</strong><em>${stateLabel}</em></span>`;
    }).join("")
    : `<em class="rsv-empty">${vi ? "chưa chốt tầng" : "level not locked yet"}</em>`;

  const nextLevelHtml = (view.nextLevel || []).length
    ? view.nextLevel.map((node, index) => `<span class="rsv-next-node"><small>${index === 0 ? "FRONT" : index === view.nextLevel.length - 1 ? "BACK" : `#${index}`}</small><strong>${escapeHtml(node.val)}</strong></span>`).join("")
    : `<em class="rsv-empty">${vi ? "chưa enqueue node con" : "no children enqueued yet"}</em>`;

  const hasDecision = Number.isInteger(view.index) && view.index >= 0 && view.size > 0;
  const decisionValue = hasDecision ? view.index === view.size - 1 : null;
  const decisionHtml = hasDecision
    ? `<code>i=${view.index} == size-1=${view.size - 1}</code><strong class="${decisionValue ? "is-true" : "is-false"}">${decisionValue ? "True" : "False"}</strong><span>${decisionValue ? (vi ? "node này là góc nhìn bên phải" : "this node is visible from the right") : (vi ? "tiếp tục tới node cuối tầng" : "continue to the level's last node")}</span>`
    : `<code>i == size - 1</code><strong>?</strong><span>${vi ? "chỉ node cuối mỗi tầng được thêm vào res" : "only the last node of each level enters res"}</span>`;

  let actionText;
  if (view.phase === "lock-level") {
    actionText = vi
      ? `Chốt size=${view.size}: đúng ${view.size} node này thuộc level ${view.level}; node con enqueue sau đó thuộc level ${view.level + 1}.`
      : `Lock size=${view.size}: exactly these ${view.size} node(s) belong to level ${view.level}; children enqueued afterward belong to level ${view.level + 1}.`;
  } else if (view.phase === "dequeue" && view.current) {
    actionText = vi
      ? `Popleft ${view.current.val} ở FRONT; đây là node i=${view.index} trong ${view.size} node của level ${view.level}.`
      : `Popleft ${view.current.val} from FRONT; it is node i=${view.index} among ${view.size} node(s) on level ${view.level}.`;
  } else if (["check-left", "check-right"].includes(view.phase)) {
    const side = view.childSide === "left" ? (vi ? "trái" : "left") : (vi ? "phải" : "right");
    actionText = view.child === null
      ? (vi ? `CURRENT không có con ${side}; queue không đổi.` : `CURRENT has no ${side} child; the queue stays unchanged.`)
      : (vi ? `CURRENT có con ${side} ${view.child}; bước sau enqueue vào phần NEXT LEVEL.` : `CURRENT has ${side} child ${view.child}; enqueue it into NEXT LEVEL next.`);
  } else if (["enqueue-left", "enqueue-right"].includes(view.phase)) {
    actionText = vi
      ? `Append ${view.child} vào BACK. Node này chờ ở level ${view.level + 1}, không làm thay đổi size=${view.size} đang chạy.`
      : `Append ${view.child} at BACK. It waits for level ${view.level + 1} and does not change the active size=${view.size}.`;
  } else if (view.phase === "check-rightmost" && view.current) {
    actionText = decisionValue
      ? (vi ? `${view.current.val} có i=size-1 nên là node phải nhất của level ${view.level}.` : `${view.current.val} has i=size-1, so it is the rightmost node on level ${view.level}.`)
      : (vi ? `${view.current.val} chưa phải node cuối level; không thêm vào res.` : `${view.current.val} is not the level's last node; do not add it to res.`);
  } else if (view.phase === "save-rightmost" && view.current) {
    actionText = vi
      ? `Thêm ${view.current.val} vào right side view: res=[${view.result.join(",")}].`
      : `Add ${view.current.val} to the right side view: res=[${view.result.join(",")}].`;
  } else if (["done", "done-levels"].includes(view.phase)) {
    actionText = vi
      ? `BFS hoàn tất; góc nhìn bên phải từ trên xuống là [${view.result.join(",")}].`
      : `BFS is complete; the top-to-bottom right side view is [${view.result.join(",")}].`;
  } else {
    actionText = vi
      ? "BFS xử lý từng tầng từ trái sang phải; node được popleft cuối cùng của mỗi tầng là node nhìn thấy bên phải."
      : "BFS processes each level left to right; the last node popped from each level is visible from the right.";
  }

  const resultHtml = (view.result || []).length
    ? view.result.map((value, index) => `<span><small>level ${index}</small><strong>${escapeHtml(value)}</strong></span>`).join("")
    : `<em class="rsv-empty">[]</em>`;
  const summary = vi
    ? `BFS góc nhìn bên phải; đang ở level ${view.level}, kết quả [${view.result.join(",")}].`
    : `Right-side-view BFS; current level ${view.level}, result [${view.result.join(",")}].`;
  return `<section class="rsv-bfs-guide" aria-label="${escapeHtml(summary)}">
    <div class="rsv-bfs-phases">${phasesHtml}</div>
    <div class="rsv-bfs-status">
      <span><small>LEVEL</small><strong>${view.size > 0 ? view.level : "—"}</strong></span>
      <span><small>FIXED SIZE</small><strong>${view.size || "—"}</strong></span>
      <span><small>i</small><strong>${view.index >= 0 ? view.index : "—"}</strong></span>
      <span><small>QUEUE</small><strong>${(view.queue || []).length}</strong></span>
    </div>
    <div class="rsv-level-flow">
      <div class="rsv-level-band"><header><strong>${vi ? "CURRENT LEVEL" : "CURRENT LEVEL"} ${view.size > 0 ? view.level : ""}</strong><span>size=${view.size || "?"} · ${vi ? "không đổi trong for-loop" : "fixed during the for-loop"}</span></header><div>${currentLevelHtml}</div></div>
      <b>→</b>
      <div class="rsv-level-band is-next"><header><strong>${vi ? "NEXT LEVEL" : "NEXT LEVEL"} ${view.size > 0 ? view.level + 1 : ""}</strong><span>${vi ? "node con append vào BACK" : "children append at BACK"}</span></header><div>${nextLevelHtml}</div></div>
    </div>
    <div class="rsv-bfs-decision">${decisionHtml}</div>
    <div class="rsv-bfs-action">${escapeHtml(actionText)}</div>
    <div class="rsv-result"><strong>RIGHT SIDE VIEW</strong><div>${resultHtml}</div></div>
  </section>`;
}

function rightSideDfsGuideHtml(view) {
  const vi = lang === "vi";
  const phaseGroup = {
    initialize: 0,
    "call-root": 0,
    enter: 1,
    "check-null": 1,
    "call-right": 1,
    "check-depth": 2,
    save: 2,
    "return-null": 3,
    "call-left": 3,
    "return-node": 3,
    done: 3,
  };
  const activePhase = phaseGroup[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1. Gọi DFS từ root", "2. Đi nhánh PHẢI trước", "3. Lưu node đầu tiên mỗi depth", "4. Quay lui rồi đi TRÁI"]
    : ["1. Call DFS from root", "2. Explore RIGHT first", "3. Save the first node per depth", "4. Backtrack, then go LEFT"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < activePhase;
    const state = done ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${done ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+\.\s*/, ""))}</b></span>`;
  }).join("");

  const currentLabel = view.isNullCall
    ? "None"
    : view.current
      ? view.current.val
      : "—";
  const viaLabel = view.via
    ? view.via === "root"
      ? "ROOT"
      : view.via.toUpperCase()
    : "—";
  const statusHtml = `<div class="rsv-dfs-status">
    <span><small>CURRENT NODE</small><strong>${escapeHtml(currentLabel)}</strong></span>
    <span><small>DEPTH</small><strong>${view.depth === null ? "—" : escapeHtml(view.depth)}</strong></span>
    <span><small>len(res)</small><strong>${(view.result || []).length}</strong></span>
    <span><small>CALL VIA</small><strong>${escapeHtml(viaLabel)}</strong></span>
  </div>`;

  const stackHtml = (view.stack || []).length
    ? view.stack.map((frame, index) => {
      const isTop = index === view.stack.length - 1;
      const frameClass = `${isTop ? " is-top" : ""}${frame.node === null ? " is-null" : ""}`;
      const via = frame.via === "root" ? "ROOT" : frame.via.toUpperCase();
      return `<span class="rsv-dfs-frame${frameClass}"><small>${via} · d=${frame.depth}</small><strong>${frame.node === null ? "None" : escapeHtml(frame.node)}</strong>${isTop ? `<em>${vi ? "ĐANG CHẠY" : "RUNNING"}</em>` : ""}</span>`;
    }).join(`<b class="rsv-dfs-stack-arrow">→</b>`)
    : `<em class="rsv-empty">${vi ? "call stack rỗng" : "empty call stack"}</em>`;

  const depthRows = Array.from({ length: Math.max(1, (view.maxDepth || 0) + 1) }, (_, depth) => {
    const hasValue = depth < (view.result || []).length;
    const isCurrent = view.depth === depth;
    const stateClass = `${hasValue ? " is-filled" : ""}${isCurrent ? " is-current" : ""}`;
    const stateText = hasValue
      ? (vi ? "đã chốt node phải nhất" : "rightmost node locked")
      : isCurrent
        ? (vi ? "đang kiểm tra depth này" : "checking this depth")
        : (vi ? "chưa gặp" : "not reached");
    return `<span class="rsv-dfs-depth${stateClass}"><small>depth ${depth}</small><strong>${hasValue ? escapeHtml(view.result[depth]) : "?"}</strong><em>${stateText}</em></span>`;
  }).join("");

  let decisionHtml;
  if (view.decision === null) {
    decisionHtml = `<code>depth == len(res)</code><strong>?</strong><span>${vi ? "True chỉ khi depth này chưa có node đại diện" : "True only when this depth has no representative"}</span>`;
  } else {
    const depth = view.depth === null ? "?" : view.depth;
    const lenBefore = view.decision ? (view.result || []).length - (view.phase === "save" ? 1 : 0) : (view.result || []).length;
    decisionHtml = `<code>${depth} == ${lenBefore}</code><strong class="${view.decision ? "is-true" : "is-false"}">${view.decision ? "True" : "False"}</strong><span>${view.decision ? (vi ? "node đầu tiên ở depth này → thêm vào res" : "first node at this depth → append to res") : (vi ? "depth đã có node nhìn thấy → bỏ qua" : "depth already has a visible node → skip")}</span>`;
  }

  const selectedIds = new Set(view.selectedIds || []);
  const traversalHtml = (view.visitOrder || []).length
    ? view.visitOrder.map((item, index) => {
      const isCurrent = view.current && item.id === view.current.id;
      const classes = `${selectedIds.has(item.id) ? " is-selected" : ""}${isCurrent ? " is-current" : ""}`;
      return `<span class="rsv-dfs-visit${classes}"><small>#${index + 1} · d=${item.depth}</small><strong>${escapeHtml(item.val)}</strong>${selectedIds.has(item.id) ? `<em>VIEW</em>` : ""}</span>`;
    }).join(`<b>→</b>`)
    : `<em class="rsv-empty">${vi ? "chưa thăm node" : "no node visited yet"}</em>`;

  const nextCallHtml = view.nextCall
    ? `<span class="rsv-dfs-next-call"><small>${vi ? "LỜI GỌI KẾ TIẾP" : "NEXT CALL"}</small><code>dfs(${view.nextCall.node === null ? "None" : escapeHtml(view.nextCall.node)}, ${view.nextCall.depth})</code><strong>${escapeHtml(view.nextCall.side.toUpperCase())}</strong></span>`
    : "";
  const actionText = view.action ? pick(view.action) : (vi ? "DFS ưu tiên nhánh phải trước nhánh trái." : "DFS explores the right branch before the left branch.");
  const resultHtml = (view.result || []).length
    ? view.result.map((value, depth) => `<span><small>depth ${depth}</small><strong>${escapeHtml(value)}</strong></span>`).join("")
    : `<em class="rsv-empty">[]</em>`;
  const summary = vi
    ? `DFS góc nhìn bên phải; depth hiện tại ${view.depth ?? "chưa có"}, kết quả [${(view.result || []).join(",")}].`
    : `Right-side-view DFS; current depth ${view.depth ?? "none"}, result [${(view.result || []).join(",")}].`;

  return `<section class="rsv-dfs-guide" aria-label="${escapeHtml(summary)}">
    <div class="rsv-dfs-phases">${phasesHtml}</div>
    ${statusHtml}
    <div class="rsv-dfs-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame ngoài cùng bên phải đang chạy" : "the rightmost frame is running"}</span></header><div>${stackHtml}</div></div>
    ${nextCallHtml}
    <div class="rsv-dfs-depths"><header><strong>FIRST NODE AT EACH DEPTH</strong><span>RIGHT → LEFT</span></header><div>${depthRows}</div></div>
    <div class="rsv-dfs-decision">${decisionHtml}</div>
    <div class="rsv-dfs-action">${escapeHtml(actionText)}</div>
    <div class="rsv-dfs-traversal"><strong>DFS ORDER</strong><div>${traversalHtml}</div></div>
    <div class="rsv-result"><strong>RIGHT SIDE VIEW</strong><div>${resultHtml}</div></div>
  </section>`;
}

function lcaDeepestGuideHtml(view) {
  const vi = lang === "vi";
  const pair = (value) => value
    ? `(${value.height}, ${value.lca})`
    : "?";
  const stack = (view.callStack || []).length
    ? view.callStack.map((value, index) => (
      `<span class="lca-stack-node${index === view.callStack.length - 1 ? " current" : ""}">${escapeHtml(`dfs(${value})`)}</span>`
    )).join(`<i>→</i>`)
    : `<span class="lca-stack-empty">${vi ? "trống" : "empty"}</span>`;

  let decisionText;
  let decisionClass = "waiting";
  if (view.phase === "done") {
    decisionClass = "done";
    decisionText = vi
      ? `Hoàn tất: các lá sâu nhất [${(view.deepestLeaves || []).join(", ")}] ở level ${view.deepestLevel}.`
      : `Done: deepest leaves [${(view.deepestLeaves || []).join(", ")}] are at level ${view.deepestLevel}.`;
  } else if (view.phase === "base") {
    decisionClass = "base";
    decisionText = vi ? "None là đáy đệ quy → trả (0, None)." : "None is the base case → return (0, None).";
  } else if (view.decision === "equal") {
    decisionClass = "equal";
    decisionText = vi
      ? `${view.left.height} = ${view.right.height} → chọn node hiện tại làm LCA.`
      : `${view.left.height} = ${view.right.height} → current node becomes the LCA.`;
  } else if (view.decision === "left" || view.decision === "right") {
    decisionClass = view.decision;
    decisionText = vi
      ? `${view.decision === "left" ? "Trái" : "Phải"} cao hơn → giữ LCA của phía đó.`
      : `${view.decision === "left" ? "Left" : "Right"} is taller → keep that side's LCA.`;
  } else if (view.phase === "enter") {
    decisionText = vi ? "Chờ kết quả cây trái và cây phải…" : "Waiting for the left and right subtree results…";
  } else {
    decisionText = vi
      ? "Quy ước: dfs(node) trả về (chiều cao cây con, LCA)."
      : "Contract: dfs(node) returns (subtree height, LCA).";
  }

  const resultPair = view.result ? pair(view.result) : view.phase === "base" ? "(0, None)" : "?";
  const summary = vi
    ? `Đệ quy postorder tìm LCA lá sâu nhất. Đã xử lý ${view.processed} trên ${view.total} node.`
    : `Postorder recursion finds the LCA of deepest leaves. Processed ${view.processed} of ${view.total} nodes.`;

  return `<section class="lca-deepest-guide" role="img" aria-label="${escapeHtml(summary)}">
    <div class="lca-contract">
      <strong>dfs(node)</strong>
      <span>→</span>
      <code>(height, lca)</code>
      <small>${vi ? "height = chiều cao từ node xuống lá sâu nhất" : "height = distance from node to its deepest leaf"}</small>
    </div>
    <div class="lca-stack-row">
      <b>CALL STACK</b>
      <div>${stack}</div>
    </div>
    <div class="lca-compare-row">
      <div class="lca-side left${view.decision === "left" ? " chosen" : ""}">
        <small>${vi ? "CÂY TRÁI TRẢ VỀ" : "LEFT RETURNS"}</small>
        <strong>${escapeHtml(pair(view.left))}</strong>
      </div>
      <div class="lca-decision ${decisionClass}">
        <span>${escapeHtml(decisionText)}</span>
      </div>
      <div class="lca-side right${view.decision === "right" ? " chosen" : ""}">
        <small>${vi ? "CÂY PHẢI TRẢ VỀ" : "RIGHT RETURNS"}</small>
        <strong>${escapeHtml(pair(view.right))}</strong>
      </div>
      <div class="lca-result${view.result || view.phase === "base" || view.phase === "done" ? " ready" : ""}">
        <small>RETURN</small>
        <strong>${escapeHtml(resultPair)}</strong>
      </div>
    </div>
    <div class="lca-progress"><span style="width:${view.total ? Math.round((view.processed / view.total) * 100) : 0}%"></span></div>
    <small class="lca-progress-label">POSTORDER · ${escapeHtml(view.processed)}/${escapeHtml(view.total)} ${vi ? "node đã xong" : "nodes complete"}</small>
  </section>`;
}

function renderTree(step, targetId = "treeView") {
  const nodes = step.tree.nodes;
  const arrowId = `tree-arrow-${String(targetId).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const treeAnnotations = step.tree.annotations || {}; // { nodeId: "label" | { label, kind } }
  const annotationItems = (annotation) => {
    if (annotation && typeof annotation === "object" && Array.isArray(annotation.labels)) {
      return annotation.labels.map((item) => (
        item && typeof item === "object"
          ? { label: item.label, kind: item.kind || "" }
          : { label: item, kind: "" }
      ));
    }
    if (annotation && typeof annotation === "object") {
      return [{ label: annotation.label, kind: annotation.kind || "" }];
    }
    return annotation === undefined ? [] : [{ label: annotation, kind: "" }];
  };
  const minX = Math.min(0, ...nodes.map((n) => n.x));
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
  const maxAnnotationLines = Math.max(0, ...nodes.map((n) => annotationItems(treeAnnotations[n.id]).length));
  const maxAnnotationHalfWidth = Math.max(0, ...nodes.flatMap((n) => (
    annotationItems(treeAnnotations[n.id]).map((item) => String(item.label ?? "").length * 6.6 / 2)
  )));
  const colW = hasMultiLineLabels ? 84 : Math.max(60, maxHalfWidth * 2 + 14);
  const annotationExtra = Math.max(0, maxAnnotationLines - 1) * 14;
  const rowH = (hasMultiLineLabels ? 96 : 78) + (hasSubLabels ? 16 : 0) + annotationExtra;
  const naturalBasePad = hasMultiLineLabels
    ? Math.max(44, maxAnnotationHalfWidth + 6)
    : Math.max(34, maxHalfWidth + 4, maxAnnotationHalfWidth + 6);
  const basePad = Math.max(naturalBasePad, maxAnnotationLines ? r + 18 + annotationExtra : 0);
  const showLevelLabels = step.tree.showLevels !== false && maxY > 0;
  const configuredLevelGutter = Number(step.tree.levelLabelGutter);
  const leftGutter = showLevelLabels
    ? Math.max(52, Number.isFinite(configuredLevelGutter) ? configuredLevelGutter : 52)
    : 0;
  const width = basePad * 2 + leftGutter + (maxX - minX) * colW;
  const height = basePad * 2 + maxY * rowH + (hasSubLabels ? 12 : 0);
  const px = (x) => basePad + leftGutter + (x - minX) * colW;
  const py = (y) => basePad + y * rowH;

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
    edges += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="tree-edge${n.isNull ? " null-edge" : ""}" marker-end="url(#${arrowId})" />`;
  });

  let circles = "";
  nodes.forEach((n) => {
    const c = pos[n.id];
    const nodeHw = hw[n.id];
    const isPill = nodeHw > r + 0.5;
    const cls = "tree-node" + (n.hl ? " hl" : "") + (n.isWord ? " word" : "") + (n.isPruned ? " pruned" : "") + (n.isNull ? " null" : "");
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
      const annotation = treeAnnotations[n.id];
      const items = annotationItems(annotation);
      const isRichAnnotation = annotation && typeof annotation === "object";
      const color = n.hl ? "#f59e0b" : n.isWord ? "#22c55e" : "#6366f1";
      const firstY = c.y - r - 7 - Math.max(0, items.length - 1) * 14;
      items.forEach((item, index) => {
        const annotationKind = String(item.kind || "").replace(/[^a-zA-Z0-9_-]/g, "");
        const annotationClass = `tree-annotation${annotationKind ? ` ${annotationKind}` : ""}`;
        const fill = isRichAnnotation ? "" : ` fill="${color}"`;
        circles += `<text x="${c.x}" y="${firstY + index * 14}" text-anchor="middle" class="${annotationClass}"${fill}>${escapeXml(item.label)}</text>`;
      });
    }
    // Sub-label below node (e.g. heap array index)
    if (n.sub !== undefined && n.sub !== null) {
      circles += `<text x="${c.x}" y="${c.y + r + 14}" text-anchor="middle" class="tree-sub">${escapeXml(n.sub)}</text>`;
    }
    circles += `</g>`;
  });

  // Level labels ("Level 0", "Level 1", ...) on the left edge of each row,
  // only rendered when the tree has more than one row (skip trivial trees).
  let levelLabels = "";
  if (showLevelLabels) {
    const rowsPresent = [...new Set(nodes.map((n) => n.y))].sort((a, b) => a - b);
    rowsPresent.forEach((y) => {
      const labelY = py(y);
      levelLabels += `<text x="6" y="${labelY}" dy="0.35em" text-anchor="start" class="tree-level-label">Level ${y}</text>`;
    });
  }

  const treeHtml =
    `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="tree-svg${width <= 520 ? " tree-svg-fit" : ""}${step.lcaDeepestView ? " lca-deepest-tree" : ""}">` +
    `<defs><marker id="${arrowId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" class="tree-arrow"/></marker></defs>` +
    edges +
    circles +
    levelLabels +
    `</svg>`;

  const decisionHeader = step.tree.decisionTree || targetId === "decisionTreeView"
    ? `<div class="decision-tree-header">
        <strong>${lang === "vi" ? "Cây quyết định" : "Decision tree"}</strong>
        <span class="decision-tree-legend">
          <i class="dt-current"></i>${lang === "vi" ? "đang chạy" : "current"}
          <i class="dt-answer"></i>${lang === "vi" ? "đáp án" : "answer"}
          <i class="dt-pruned"></i>${lang === "vi" ? "prune / không hợp lệ" : "pruned / invalid"}
        </span>
        ${step.tree.truncated ? `<small>${lang === "vi" ? "Hiển thị 140 node đầu" : "Showing first 140 nodes"}</small>` : ""}
      </div>`
    : "";
  const distanceKGuide = step.distanceKView ? distanceKGuideHtml(step.distanceKView) : "";
  const lcaDeepestGuide = step.lcaDeepestView ? lcaDeepestGuideHtml(step.lcaDeepestView) : "";
  const rightSideBfsGuide = step.rightSideBfsView ? rightSideBfsGuideHtml(step.rightSideBfsView) : "";
  const rightSideDfsGuide = step.rightSideDfsView ? rightSideDfsGuideHtml(step.rightSideDfsView) : "";
  $(targetId).innerHTML = decisionHeader + distanceKGuide + lcaDeepestGuide + rightSideBfsGuide + rightSideDfsGuide + (step.queueView
    ? `<div class="tree-queue-layout${step.queueView.layout === "stacked" ? " tree-queue-stacked" : ""}">
        <div class="tree-queue-tree">${treeHtml}</div>
        <div class="tree-queue-panel">${queueViewHtml(step.queueView, true)}</div>
      </div>`
    : treeHtml);
}

function renderRecoverBstView(step) {
  const view = step.recoverBstView;
  const treeView = $("treeView");
  const vi = lang === "vi";
  const pointerSpecs = [
    { key: "current", label: "curr", roleVi: "node đang xử lý", roleEn: "node being processed" },
    { key: "prev", label: "prev", roleVi: "node vừa thăm trước đó", roleEn: "previous inorder node" },
    { key: "first", label: "first", roleVi: "node lớn của inversion đầu", roleEn: "larger node in first inversion" },
    { key: "second", label: "second", roleVi: "node nhỏ của inversion mới nhất", roleEn: "smaller node in latest inversion" },
  ];
  const pointerHtml = pointerSpecs.map((spec) => {
    const pointer = view[spec.key] || { state: "none", text: "None" };
    const stateClass = pointer.state === "node" ? "has-node" : pointer.state === "sentinel" ? "sentinel" : "is-none";
    const beforeValue = view.swapped && spec.key === "first"
      ? view.swapped.firstBefore
      : view.swapped && spec.key === "second"
        ? view.swapped.secondBefore
        : null;
    const pointerText = beforeValue === null
      ? pointer.text
      : `${pointer.text} · ${vi ? "trước" : "was"} ${beforeValue}`;
    return `<div class="recover-pointer ${spec.key} ${stateClass}">
      <span>${spec.label}</span>
      <strong>${escapeHtml(pointerText)}</strong>
      <small>${escapeHtml(vi ? spec.roleVi : spec.roleEn)}</small>
    </div>`;
  }).join("");

  let comparisonHtml;
  if (view.swapped) {
    comparisonHtml = `<strong>${vi ? "Phục hồi" : "Recover"}</strong><code>${escapeHtml(view.swapped.firstBefore)} ↔ ${escapeHtml(view.swapped.secondBefore)}</code><span>→ ${vi ? "inorder tăng dần" : "ascending inorder"}</span>`;
  } else if (view.comparison) {
    comparisonHtml = `<strong>${vi ? "Kiểm tra inversion" : "Check inversion"}</strong><code>${escapeHtml(view.comparison.expression)}</code><span class="${view.comparison.inversion ? "is-inversion" : "is-valid"}">${view.comparison.inversion ? (vi ? "ĐÚNG → phát hiện inversion" : "TRUE → inversion found") : (vi ? "SAI → thứ tự hợp lệ" : "FALSE → valid order")}</span>`;
  } else {
    comparisonHtml = `<strong>${vi ? "Quy tắc" : "Rule"}</strong><code>${escapeHtml(view.condition || "prev.val > curr.val")}</code><span>${vi ? "thì thứ tự inorder bị giảm" : "means inorder decreases"}</span>`;
  }

  const inorderHtml = view.inorder.length
    ? view.inorder.map((value, index) => `<span class="recover-inorder-value${index === view.inorder.length - 1 ? " latest" : ""}">${escapeHtml(value)}</span>`).join(`<i>→</i>`)
    : `<span class="recover-empty">∅</span>`;
  const stackHtml = view.callStack.length
    ? view.callStack.map((value) => `<span>${escapeHtml(value)}</span>`).join(`<i>→</i>`)
    : `<span class="recover-empty">∅</span>`;
  const summary = vi
    ? `Khôi phục BST: curr ${view.current.text}, prev ${view.prev.text}, first ${view.first.text}, second ${view.second.text}.`
    : `Recover BST: curr ${view.current.text}, prev ${view.prev.text}, first ${view.first.text}, second ${view.second.text}.`;

  treeView.innerHTML = `<div class="recover-bst-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="recover-pointer-row">${pointerHtml}</div>
    <div class="recover-comparison">${comparisonHtml}</div>
    <div id="recoverBstTree" class="recover-tree"></div>
    <div class="recover-traversal-row">
      <div><b>${vi ? "Inorder đã thăm" : "Visited inorder"}</b><span class="recover-sequence">${inorderHtml}</span></div>
      <div><b>Call stack</b><span class="recover-sequence">${stackHtml}</span></div>
      <em>${vi ? "inversion" : "inversions"}: ${escapeHtml(view.inversionCount)}</em>
    </div>
  </div>`;
  renderTree(step, "recoverBstTree");
}

function renderWordSearchView(step) {
  const view = step.wordSearchView;
  const treeView = $("treeView");
  const vi = lang === "vi";
  const pathMap = new Map((view.path || []).map((item, index) => [`${item.r},${item.c}`, { ...item, order: index + 1 }]));
  const triedStarts = new Set((view.triedStarts || []).map(([r, c]) => `${r},${c}`));
  const sameCell = (cell, r, c) => cell && cell.r === r && cell.c === c;
  const isInside = (cell) => cell && cell.r >= 0 && cell.r < view.rows && cell.c >= 0 && cell.c < view.cols;
  const focus = view.target || view.current;
  const actionLabels = {
    init: vi ? "Chuẩn bị DFS từ từng ô" : "Prepare DFS from every cell",
    "row-loop": vi ? "Dòng 20 · chọn hàng bắt đầu" : "Line 20 · select a start row",
    "col-loop": vi ? "Dòng 21 · chọn cột bắt đầu" : "Line 21 · select a start column",
    start: vi ? "Thử một điểm bắt đầu mới" : "Try a new start cell",
    call: vi ? "Tạo một frame DFS mới" : "Create a new DFS frame",
    "base-check": vi ? "Dòng 6 · đã ghép đủ word chưa?" : "Line 6 · is the word complete?",
    validate: vi ? "Dòng 8 · tọa độ và ký tự hợp lệ" : "Line 8 · valid coordinate and character",
    "reject-check": vi ? "Dòng 8 · điều kiện invalid là True" : "Line 8 · invalid condition is True",
    match: vi ? "Ký tự khớp → thêm ô vào path" : "Character matches → add cell to path",
    "save-char": vi ? "Dòng 11 · lưu ký tự vào tmp" : "Line 11 · save the character in tmp",
    "found-start": vi ? "Dòng 13 · bắt đầu biểu thức OR" : "Line 13 · begin the OR expression",
    "found-value": vi ? "Dòng 16 · gán kết quả cho found" : "Line 16 · assign the result to found",
    explore: vi ? "Thử ô kề theo thứ tự ↓ ↑ → ←" : "Try a neighbor in ↓ ↑ → ← order",
    reject: view.reason === "outside"
      ? (vi ? "Nhánh sai: tọa độ vượt biên" : "Reject: coordinate is outside the board")
      : view.reason === "reused"
        ? (vi ? "Nhánh sai: ô đã có trong path" : "Reject: cell is already in the path")
        : (vi ? "Nhánh sai: ký tự không khớp" : "Reject: character mismatch"),
    backtrack: vi ? "Bế tắc → khôi phục ô và lùi lại" : "Dead end → restore the cell and backtrack",
    restore: vi ? "Dòng 17 · khôi phục board[r][c]" : "Line 17 · restore board[r][c]",
    "return-found": vi ? "Dòng 18 · trả found về frame cha" : "Line 18 · return found to the parent",
    found: vi ? "Đã khớp đủ mọi ký tự" : "Every character has been matched",
    "return-true": vi ? "Nhánh con thành công → truyền True lên" : "Child succeeded → propagate True",
    "result-true": vi ? "Tìm thấy đường đi hợp lệ" : "A valid path was found",
    "result-false": vi ? "Đã thử hết nhưng không có đường hợp lệ" : "All starts exhausted; no valid path",
  };

  const rejectedAction = view.action === "reject" || view.action === "reject-check";
  const completed = view.result === true || view.action === "found" || view.action === "result-true";
  const matchedCount = completed ? view.word.length : Math.min(view.word.length, (view.path || []).length);
  const wordHtml = [...view.word].map((letter, index) => {
    const classes = ["word-search-letter"];
    if (index < matchedCount) classes.push("matched");
    else if (index === view.index) classes.push(rejectedAction ? "rejected" : "needed");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(letter)}</strong></span>`;
  }).join('<i class="word-search-word-arrow">→</i>');

  const cellsHtml = (view.board || []).flatMap((row, r) => row.map((letter, c) => {
    const key = `${r},${c}`;
    const pathItem = pathMap.get(key);
    const classes = ["word-search-cell"];
    let state = "";
    if (triedStarts.has(key)) classes.push("tried-start");
    if (pathItem) {
      classes.push(completed ? "found-path" : "in-path");
      state = `${vi ? "bước" : "step"} ${pathItem.order}`;
    }
    if (sameCell(view.target, r, c) && !sameCell(view.current, r, c)) {
      classes.push("target");
      state = vi ? "sắp thử" : "next";
    }
    if (sameCell(view.current, r, c)) {
      classes.push(rejectedAction ? "rejected" : "current");
      state = rejectedAction ? (vi ? "không hợp lệ" : "invalid") : (vi ? "đang xét" : "current");
    }
    if (sameCell(view.restored, r, c)) {
      classes.push("restored");
      state = vi ? "đã khôi phục" : "restored";
    }
    return `<div class="${classes.join(" ")}">
      <small>(${r},${c})</small>
      <strong>${escapeHtml(letter)}</strong>
      <span>${escapeHtml(state)}</span>
      ${pathItem ? `<b>${pathItem.order}</b>` : ""}
    </div>`;
  })).join("");

  const actual = isInside(focus) ? view.board[focus.r][focus.c] : (focus ? (vi ? "ngoài bảng" : "outside") : "—");
  const expected = view.index >= view.word.length ? "✓" : (view.word[view.index] || "—");
  const comparisonClass = rejectedAction ? "is-rejected" : view.action === "match" || completed ? "is-matched" : "";
  const focusText = focus ? `(${focus.r},${focus.c})` : "—";

  const directionOrder = [
    { key: "down", symbol: "↓", label: vi ? "xuống" : "down" },
    { key: "up", symbol: "↑", label: vi ? "lên" : "up" },
    { key: "right", symbol: "→", label: vi ? "phải" : "right" },
    { key: "left", symbol: "←", label: vi ? "trái" : "left" },
  ];
  const directionsHtml = directionOrder.map((direction, index) => {
    const classes = ["word-search-direction"];
    if (index < view.directionIndex) classes.push("tried");
    if (index === view.directionIndex) classes.push(view.result === true ? "success" : "active");
    return `<span class="${classes.join(" ")}"><b>${direction.symbol}</b><small>${direction.label}</small></span>`;
  }).join("");

  const stackHtml = (view.stack || []).length
    ? view.stack.map((frame, index) => `<span class="word-search-frame${index === view.stack.length - 1 ? " active" : ""}"><small>i=${frame.i}</small><strong>(${frame.r},${frame.c})</strong></span>`).join('<i class="word-search-stack-arrow">→</i>')
    : `<span class="word-search-empty">∅</span>`;
  const pathHtml = (view.path || []).length
    ? view.path.map((item) => `<span><small>${item.index}</small><strong>${escapeHtml(item.char)}</strong><em>(${item.r},${item.c})</em></span>`).join('<i>→</i>')
    : `<span class="word-search-empty">∅</span>`;
  const summary = vi
    ? `Tìm từ ${view.word}. Đã khớp ${matchedCount} trên ${view.word.length} ký tự; đang xét ${focusText}.`
    : `Searching for ${view.word}. Matched ${matchedCount} of ${view.word.length} characters; inspecting ${focusText}.`;

  treeView.innerHTML = `<div class="word-search-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="word-search-word"><span>${vi ? "Từ cần tìm" : "Target word"}</span><div>${wordHtml || '<span class="word-search-empty">empty</span>'}</div><em>${matchedCount}/${view.word.length}</em></div>
    <div class="word-search-action ${comparisonClass}"><strong>${escapeHtml(actionLabels[view.action] || pick(step.title))}</strong><span>${escapeHtml(focusText)}</span><code>${escapeHtml(actual)} ${rejectedAction ? "≠" : "→"} ${escapeHtml(expected)}</code></div>
    <div class="word-search-main">
      <div class="word-search-board" style="grid-template-columns: repeat(${Math.max(1, view.cols)}, minmax(48px, 62px))">${cellsHtml}</div>
      <div class="word-search-trace">
        <div><b>${vi ? "Thứ tự thử hướng" : "Direction order"}</b><span class="word-search-directions">${directionsHtml}</span></div>
        <div><b>Call stack</b><span class="word-search-stack">${stackHtml}</span></div>
      </div>
    </div>
    <div class="word-search-path"><b>path</b><span>${pathHtml}</span></div>
    <div class="word-search-legend">
      <span><i class="current"></i>${vi ? "đang xét" : "current"}</span>
      <span><i class="target"></i>${vi ? "ô kế tiếp" : "next cell"}</span>
      <span><i class="path"></i>${vi ? "đường hiện tại" : "current path"}</span>
      <span><i class="rejected"></i>${vi ? "nhánh sai" : "rejected"}</span>
      <span><i class="restored"></i>backtrack</span>
    </div>
  </div>`;
}

function renderSameTreeView(step) {
  const view = step.sameTreeView;
  const treeView = $("treeView");
  const pValue = pick(view.pValue);
  const qValue = pick(view.qValue);
  const statusClass = view.status === "match"
    ? "is-match"
    : view.status === "mismatch"
      ? "is-mismatch"
      : "is-checking";
  const resultLabel = view.result === true
    ? (lang === "vi" ? "True · giống" : "True · same")
    : view.result === false
      ? (lang === "vi" ? "False · khác" : "False · different")
      : pick(view.statusText);
  const pathLabel = view.path === "done" ? (lang === "vi" ? "hoàn tất" : "complete") : view.path;
  const summary = lang === "vi"
    ? `So sánh cây p và q tại ${pathLabel}: ${pValue} ${view.relation} ${qValue}. ${pick(view.statusText)}.`
    : `Comparing trees p and q at ${pathLabel}: ${pValue} ${view.relation} ${qValue}. ${pick(view.statusText)}.`;

  treeView.innerHTML = `<div class="same-tree-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="same-tree-compare">
      <span class="same-tree-path"><small>${lang === "vi" ? "VỊ TRÍ" : "PATH"}</small><code>${escapeHtml(pathLabel)}</code></span>
      <div class="same-tree-pair" aria-hidden="true">
        <span class="same-tree-value"><small>p</small><strong>${escapeHtml(pValue)}</strong></span>
        <span class="same-tree-relation">${escapeHtml(view.relation)}</span>
        <span class="same-tree-value"><small>q</small><strong>${escapeHtml(qValue)}</strong></span>
      </div>
      <span class="same-tree-status ${statusClass}">${escapeHtml(resultLabel)}</span>
    </div>
    <div class="same-tree-columns">
      <section class="same-tree-column" aria-label="${lang === "vi" ? "Cây p" : "Tree p"}">
        <h4><code>p</code><span>${lang === "vi" ? "cây thứ nhất" : "first tree"}</span></h4>
        <div id="sameTreeP" class="same-tree-canvas"></div>
      </section>
      <section class="same-tree-column" aria-label="${lang === "vi" ? "Cây q" : "Tree q"}">
        <h4><code>q</code><span>${lang === "vi" ? "cây thứ hai" : "second tree"}</span></h4>
        <div id="sameTreeQ" class="same-tree-canvas"></div>
      </section>
    </div>
    <div class="same-tree-legend" aria-hidden="true">
      <span><i class="current"></i>${lang === "vi" ? "đang so sánh" : "current pair"}</span>
      <span><i class="matched"></i>${lang === "vi" ? "đã khớp" : "matched"}</span>
      <span><i class="unchecked"></i>${lang === "vi" ? "chưa kiểm tra" : "unchecked"}</span>
    </div>
  </div>`;

  const renderSide = (tree, targetId) => {
    if (tree.nodes.length === 0) {
      $(targetId).innerHTML = `<span class="same-tree-empty">∅</span>`;
      return;
    }
    renderTree({ tree }, targetId);
  };
  renderSide(view.pTree, "sameTreeP");
  renderSide(view.qTree, "sameTreeQ");
}

function renderSortedListBstView(step) {
  const view = step.sortedListBstView;
  const treeView = $("treeView");
  const isArrayMode = view.mode === "array";
  const activeRange = Array.isArray(view.activeRange) ? view.activeRange : null;
  const arrayRange = Array.isArray(view.arrayRange) ? view.arrayRange : null;
  const arrayValues = Array.isArray(view.arrayValues) ? view.arrayValues : [];
  const cuts = new Set(view.cuts || []);
  const picked = new Set(view.picked || []);
  const pointers = view.pointers || {};
  const pointerNames = isArrayMode ? ["head"] : ["head", "prev", "slow", "fast"];
  const pointerClasses = { head: "head", prev: "prev", slow: "slow", fast: "fast" };
  const pointerMap = new Map();

  pointerNames.forEach((name) => {
    const pointer = pointers[name];
    if (!pointer || pointer.state !== "index") return;
    if (!pointerMap.has(pointer.index)) pointerMap.set(pointer.index, []);
    pointerMap.get(pointer.index).push(name);
  });

  const pointerValue = (name) => {
    const pointer = pointers[name] || { state: "unset" };
    if (pointer.state === "unset") return lang === "vi" ? "chưa gán" : "unset";
    if (pointer.state === "null") return "null";
    const value = view.values[pointer.index];
    return `${value} [${pointer.index}]`;
  };

  const listHtml = view.values.map((value, index) => {
    const inRange = activeRange && index >= activeRange[0] && index <= activeRange[1];
    const labels = pointerMap.get(index) || [];
    const nodeClasses = ["slb-node"];
    if (activeRange && !inRange) nodeClasses.push("outside");
    if (isArrayMode && index < (view.copiedCount || 0)) nodeClasses.push("copied");
    if (!isArrayMode && picked.has(index)) nodeClasses.push("picked");
    if (labels.length) nodeClasses.push("pointed");
    const tags = labels.map((name) => `<span class="slb-pointer ${pointerClasses[name]}">${name}</span>`).join("");
    const connector = index < view.values.length - 1
      ? `<span class="slb-link${cuts.has(index) ? " is-cut" : ""}">
          <strong>${cuts.has(index) ? "×" : "→"}</strong>
          ${cuts.has(index) ? `<small>${lang === "vi" ? "đã cắt" : "cut"}</small>` : ""}
        </span>`
      : "";
    return `<div class="slb-list-item">
      <div class="slb-pointer-stack">${tags}</div>
      <div class="${nodeClasses.join(" ")}">
        <strong>${escapeHtml(value)}</strong>
        <small>[${index}]</small>
      </div>
    </div>${connector}`;
  }).join("");

  const statusItem = (name, value, className = "") => `<span class="slb-status ${className}">
    <code>${name}</code><strong>${escapeHtml(value)}</strong>
  </span>`;
  const unsetLabel = lang === "vi" ? "chưa gán" : "unset";
  const statusHtml = isArrayMode
    ? [
        statusItem("head", pointerValue("head"), "head"),
        statusItem("vals", `[${arrayValues.join(", ")}]`, "array"),
        statusItem("lo", view.lo === null || view.lo === undefined ? unsetLabel : view.lo, "range"),
        statusItem("hi", view.hi === null || view.hi === undefined ? unsetLabel : view.hi, "range"),
        statusItem("mid", view.midAssigned ? `${view.mid} → ${view.values[view.mid]}` : unsetLabel, "mid"),
      ].join("")
    : pointerNames.map((name) => statusItem(name, pointerValue(name), pointerClasses[name])).join("");

  const stackHtml = (view.callStack || []).length
    ? view.callStack.map((frame, index) => {
        const range = frame.lo <= frame.hi ? `[${frame.lo}..${frame.hi}]` : "∅";
        const active = index === view.callStack.length - 1 ? " active" : "";
        return `<span class="slb-frame${active}"><small>${escapeHtml(frame.side)}</small><code>${range}</code></span>`;
      }).join('<span class="slb-stack-arrow">›</span>')
    : isArrayMode && view.phase !== "done"
      ? `<span class="slb-frame active"><small>${lang === "vi" ? "hàm chính" : "main"}</small><code>sortedListToBST</code></span>`
      : `<span class="slb-frame active"><small>${lang === "vi" ? "xong" : "done"}</small><code>root</code></span>`;

  const activeLabel = activeRange
    ? `[${activeRange[0]}..${activeRange[1]}]`
    : "∅";
  const arrayRangeLabel = arrayRange ? `[${arrayRange[0]}..${arrayRange[1]}]` : "∅";
  const summary = isArrayMode
    ? lang === "vi"
      ? `Đã copy ${view.copiedCount || 0} trên ${view.values.length} node vào vals. Đoạn preorder hiện tại ${arrayRangeLabel}.`
      : `Copied ${view.copiedCount || 0} of ${view.values.length} nodes into vals. Current preorder range ${arrayRangeLabel}.`
    : lang === "vi"
      ? `Đoạn list hiện tại ${activeLabel}. head ${pointerValue("head")}, prev ${pointerValue("prev")}, slow ${pointerValue("slow")}, fast ${pointerValue("fast")}.`
      : `Current list segment ${activeLabel}. head ${pointerValue("head")}, prev ${pointerValue("prev")}, slow ${pointerValue("slow")}, fast ${pointerValue("fast")}.`;

  const arrayCells = isArrayMode
    ? view.values.map((_, index) => {
        const classes = ["slb-array-cell"];
        const filled = index < arrayValues.length;
        if (filled) classes.push("filled");
        if (arrayRange && index >= arrayRange[0] && index <= arrayRange[1]) classes.push("in-range");
        if (picked.has(index)) classes.push("picked");
        if (view.midAssigned && index === view.mid) classes.push("mid");
        return `<div class="${classes.join(" ")}">
          <span>${index}</span>
          <strong>${filled ? escapeHtml(arrayValues[index]) : "·"}</strong>
          ${view.midAssigned && index === view.mid ? "<small>mid</small>" : ""}
        </div>`;
      }).join("")
    : "";

  const arrayPanel = isArrayMode
    ? `<section class="slb-array-panel">
        <div class="slb-section-title">
          <strong><code>vals</code></strong>
          <span>${arrayValues.length}/${view.values.length} ${lang === "vi" ? "phần tử đã copy" : "values copied"} · ${lang === "vi" ? "đoạn preorder" : "preorder range"} <code>${arrayRangeLabel}</code></span>
        </div>
        <div class="slb-array-scroll"><div class="slb-array-row">${arrayCells}</div></div>
      </section>`
    : "";

  const legendHtml = isArrayMode
    ? `<span><i class="copied-node"></i>${lang === "vi" ? "đã copy vào vals" : "copied into vals"}</span>
       <span><i class="active-range"></i>${lang === "vi" ? "vals[lo..hi]" : "vals[lo..hi]"}</span>
       <span><i class="mid-node"></i>${lang === "vi" ? "mid / root mới" : "mid / new root"}</span>`
    : `<span><i class="active-range"></i>${lang === "vi" ? "đoạn hiện tại" : "active segment"}</span>
       <span><i class="picked-node"></i>${lang === "vi" ? "đã đưa vào BST" : "moved to BST"}</span>
       <span><i class="cut-link"></i>prev.next = None</span>`;

  treeView.innerHTML = `<div class="sorted-list-bst-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="slb-call-stack">
      <strong>${lang === "vi" ? "STACK ĐỆ QUY" : "RECURSION STACK"}</strong>
      <div>${stackHtml}</div>
    </div>
    <div class="slb-status-row${isArrayMode ? " array-mode" : ""}">${statusHtml}</div>
    <section class="slb-list-panel">
      <div class="slb-section-title">
        <strong>${isArrayMode ? (lang === "vi" ? "Linked list nguồn" : "Source linked list") : "Linked list"}</strong>
        <span>${isArrayMode
          ? `${view.copiedCount || 0}/${view.values.length} ${lang === "vi" ? "node đã đọc" : "nodes read"}`
          : `${lang === "vi" ? "đoạn đang xử lý" : "active segment"} <code>${activeLabel}</code>`}</span>
      </div>
      <div class="slb-list-scroll"><div class="slb-list-row">${listHtml}</div></div>
    </section>
    ${arrayPanel}
    <section class="slb-tree-panel">
      <div class="slb-section-title">
        <strong>${lang === "vi" ? "BST đang dựng" : "BST under construction"}</strong>
        <span>${picked.size}/${view.values.length} ${lang === "vi" ? "node đã chọn làm root" : "nodes selected as roots"}</span>
      </div>
      <div id="sortedListBstTree" class="slb-tree-canvas"></div>
    </section>
    <div class="slb-legend" aria-hidden="true">
      ${legendHtml}
    </div>
  </div>`;

  if (view.tree && view.tree.nodes && view.tree.nodes.length) {
    renderTree({ tree: view.tree }, "sortedListBstTree");
  } else {
    $("sortedListBstTree").innerHTML = `<span class="slb-tree-empty">∅</span>`;
  }
}

function renderKeypadPushView(step) {
  const view = step.keypadPushView;
  const treeView = $("treeView");
  const assignments = Array.isArray(view.assignments) ? view.assignments : [];
  const assignmentBySlot = new Map(assignments.map((item) => [`${item.key}:${item.cost}`, item]));
  const currentAssignment = assignments.find((item) => item.index === view.currentIndex);
  const unset = lang === "vi" ? "chưa gán" : "unset";
  const pushLabel = (count) => lang === "vi" ? `${count} lần` : `${count} push${count === 1 ? "" : "es"}`;

  const wordHtml = view.word.map((ch, index) => {
    const assignment = assignments.find((item) => item.index === index);
    const classes = ["kp-word-cell"];
    if (index < view.processedCount) classes.push("done");
    if (index === view.currentIndex) classes.push("current");
    const detail = assignment
      ? `${lang === "vi" ? "phím" : "key"} ${assignment.key} · ${pushLabel(assignment.cost)}`
      : index === view.currentIndex
        ? (lang === "vi" ? "đang xử lý" : "processing")
        : "—";
    return `<div class="${classes.join(" ")}">
      <small>[${index}]</small>
      <strong>${escapeHtml(ch)}</strong>
      <span>${escapeHtml(detail)}</span>
    </div>`;
  }).join("");

  const headerHtml = Array.from({ length: 8 }, (_, offset) => {
    const key = offset + 2;
    const active = key === view.key ? " active" : "";
    return `<div class="kp-key-head${active}"><small>${lang === "vi" ? "PHÍM" : "KEY"}</small><strong>${key}</strong></div>`;
  }).join("");

  const layerRows = Array.from({ length: 4 }, (_, layerIndex) => {
    const cost = layerIndex + 1;
    const slots = Array.from({ length: 8 }, (_, offset) => {
      const key = offset + 2;
      const assigned = assignmentBySlot.get(`${key}:${cost}`);
      const isTarget = key === view.key && cost === view.cost;
      const isPending = isTarget && !assigned && view.currentIndex !== null;
      const classes = ["kp-slot"];
      if (assigned) classes.push("filled");
      if (isTarget) classes.push("active");
      if (isPending) classes.push("pending");
      const letter = assigned ? assigned.ch : isPending ? view.word[view.currentIndex] : "·";
      const slotState = assigned
        ? `${lang === "vi" ? "đã gán" : "assigned"} ${assigned.ch}`
        : isPending
          ? `${lang === "vi" ? "sắp gán" : "pending"} ${view.word[view.currentIndex]}`
          : (lang === "vi" ? "trống" : "empty");
      return `<div class="${classes.join(" ")}" aria-label="${lang === "vi" ? "Phím" : "Key"} ${key}, ${pushLabel(cost)}, ${escapeHtml(slotState)}">
        <strong>${escapeHtml(letter)}</strong>
      </div>`;
    }).join("");
    const activeLayer = cost === view.cost ? " active" : "";
    return `<div class="kp-layer-label${activeLayer}"><strong>${cost}×</strong></div>${slots}`;
  }).join("");

  const iValue = view.currentIndex === null ? unset : view.currentIndex;
  const chValue = view.currentIndex === null ? unset : `'${view.word[view.currentIndex]}'`;
  const groupValue = view.currentIndex === null
    ? unset
    : `[${Math.floor(view.currentIndex / 8) * 8}..${Math.min(Math.floor(view.currentIndex / 8) * 8 + 7, view.word.length - 1)}]`;
  const costValue = view.cost === null ? unset : `${view.currentIndex} // 8 + 1 = ${view.cost}`;
  const summary = lang === "vi"
    ? `Đã gán ${assignments.length} trên ${view.word.length} chữ. Tổng hiện tại ${view.pushes} lần nhấn.`
    : `Assigned ${assignments.length} of ${view.word.length} letters. Current total: ${view.pushes} pushes.`;

  treeView.innerHTML = `<div class="keypad-push-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="kp-status-row">
      <span><small>i / word[i]</small><strong>${escapeHtml(iValue)} / ${escapeHtml(chValue)}</strong></span>
      <span class="${view.currentIndex !== null ? "active" : ""}"><small>${lang === "vi" ? "nhóm 8 ký tự" : "group of 8"}</small><strong>${escapeHtml(groupValue)}</strong></span>
      <span class="${view.cost !== null ? "active" : ""}"><small>i // 8 + 1</small><strong>${escapeHtml(costValue)}</strong></span>
      <span class="total"><small>pushes</small><strong>${escapeHtml(view.pushes)}</strong></span>
    </div>
    <section class="kp-word-section">
      <div class="kp-section-title"><strong>word</strong><span>${assignments.length}/${view.word.length} ${lang === "vi" ? "chữ đã gán" : "letters assigned"}</span></div>
      <div class="kp-word-scroll"><div class="kp-word-row">${wordHtml}</div></div>
    </section>
    <section class="kp-board-section">
      <div class="kp-section-title"><strong>${lang === "vi" ? "Bản đồ phím 2–9" : "Key map 2–9"}</strong><span>${lang === "vi" ? "tầng càng sâu → nhấn càng nhiều" : "deeper layer → more pushes"}</span></div>
      <div class="kp-board-scroll">
        <div class="kp-board-grid">
          <div class="kp-board-corner">${lang === "vi" ? "CHI PHÍ" : "COST"}</div>
          ${headerHtml}
          ${layerRows}
        </div>
      </div>
    </section>
    <div class="kp-current-action">
      ${currentAssignment
        ? `<strong>pushes += ${currentAssignment.cost}</strong><span>${lang === "vi" ? `cho word[${currentAssignment.index}] = '${escapeHtml(currentAssignment.ch)}'` : `for word[${currentAssignment.index}] = '${escapeHtml(currentAssignment.ch)}'`}</span>`
        : view.currentIndex !== null
          ? `<strong>'${escapeHtml(view.word[view.currentIndex])}'</strong><span>${view.cost !== null
              ? `→ ${lang === "vi" ? "phím" : "key"} ${view.key}, ${pushLabel(view.cost)}`
              : view.key !== null
                ? `→ ${lang === "vi" ? "phím" : "key"} ${view.key}`
                : `→ ${lang === "vi" ? "đang đọc word[i]" : "reading word[i]"}`}</span>`
          : `<strong>${view.phase === "done" ? (lang === "vi" ? "HOÀN TẤT" : "COMPLETE") : "word"}</strong><span>${view.phase === "done" ? `${view.pushes} ${lang === "vi" ? "lần nhấn" : "pushes"}` : (lang === "vi" ? "chưa gán chữ nào" : "no letters assigned yet")}</span>`}
    </div>
  </div>`;
}

function renderKeypadHeapView(step) {
  const view = step.keypadHeapView;
  const treeView = $("treeView");
  const isVi = lang === "vi";
  const unset = isVi ? "chưa gán" : "unset";
  const assignments = Array.isArray(view.assignments) ? view.assignments : [];
  const assignmentBySlot = new Map(assignments.map((item) => [`${item.key}:${item.cost}`, item]));
  const phaseStages = {
    input: 0, count: 0,
    "heap-init": 1, "heap-loop": 1, "heap-push": 1,
    "ans-init": 2, "index-init": 2, while: 2, pop: 2, presses: 2, add: 2, increment: 2, "while-done": 2,
    done: 3,
  };
  const activeStage = phaseStages[view.phase] ?? 0;
  const stageLabels = isVi
    ? ["1 · Đếm tần suất", "2 · Tạo max heap", "3 · Lấy lớn nhất trước", "4 · Trả kết quả"]
    : ["1 · Count frequencies", "2 · Build max heap", "3 · Process largest first", "4 · Return result"];
  const stagesHtml = stageLabels.map((label, index) => {
    const state = index < activeStage ? "done" : index === activeStage ? "active" : "pending";
    return `<span class="${state}">${escapeHtml(label)}</span>`;
  }).join("");

  const frequencyHtml = view.freqEntries.map((entry, index) => {
    const visible = index < view.visibleFreqCount;
    const active = index === view.activeFreqIndex ? " active" : "";
    return `<span class="kph-frequency${visible ? " visible" : " hidden-value"}${active}">
      <strong>${visible ? escapeHtml(entry.ch) : "·"}</strong>
      <small>${visible ? `f=${escapeHtml(entry.count)}` : "?"}</small>
    </span>`;
  }).join("");

  const heapHtml = view.heap.length
    ? view.heap.map((stored, index) => `<span class="kph-heap-item${index === 0 ? " root" : ""}">
        <small>${index === 0 ? "ROOT" : `[${index}]`}</small>
        <strong>${escapeHtml(stored)}</strong>
        <em>f=${escapeHtml(-stored)}</em>
      </span>`).join("")
    : `<span class="kph-empty">[]</span>`;

  const headerHtml = Array.from({ length: 8 }, (_, offset) => {
    const key = offset + 2;
    const activeIndex = view.activeAssignmentIndex;
    const activeKey = activeIndex === null ? null : 2 + (activeIndex % 8);
    return `<div class="kp-key-head${key === activeKey ? " active" : ""}"><small>${isVi ? "PHÍM" : "KEY"}</small><strong>${key}</strong></div>`;
  }).join("");

  const layerRows = Array.from({ length: 4 }, (_, layerIndex) => {
    const cost = layerIndex + 1;
    const slots = Array.from({ length: 8 }, (_, offset) => {
      const key = offset + 2;
      const assigned = assignmentBySlot.get(`${key}:${cost}`);
      const isActive = assigned && assigned.index === view.activeAssignmentIndex;
      const pendingIndex = view.activeAssignmentIndex;
      const pendingKey = pendingIndex === null ? null : 2 + (pendingIndex % 8);
      const isPending = !assigned && view.presses !== null && key === pendingKey && cost === view.presses;
      const classes = ["kp-slot", "kph-slot"];
      if (assigned) classes.push("filled");
      if (isActive || isPending) classes.push("active");
      if (isPending) classes.push("pending");
      const frequency = assigned ? assigned.frequency : isPending ? view.frequency : null;
      const contribution = assigned ? assigned.contribution : isPending ? view.frequency * view.presses : null;
      const slotLabel = frequency === null
        ? (isVi ? "trống" : "empty")
        : `frequency ${frequency}, ${cost} ${isVi ? "lần nhấn" : (cost === 1 ? "push" : "pushes")}, +${contribution}`;
      return `<div class="${classes.join(" ")}" aria-label="${isVi ? "Phím" : "Key"} ${key}, ${cost}×, ${escapeHtml(slotLabel)}">
        <strong>${frequency === null ? "·" : `f${escapeHtml(frequency)}`}</strong>
        ${frequency === null ? "" : `<small>+${escapeHtml(contribution)}</small>`}
      </div>`;
    }).join("");
    return `<div class="kp-layer-label${cost === view.presses ? " active" : ""}"><strong>${cost}×</strong></div>${slots}`;
  }).join("");

  const actionByPhase = {
    input: ["word", isVi ? "chờ Counter(word)" : "waiting for Counter(word)"],
    count: ["Counter(word)", `${view.freqEntries.length} ${isVi ? "tần suất" : "frequencies"}`],
    "heap-init": ["max_heap = []", isVi ? "heap đang rỗng" : "the heap is empty"],
    "heap-loop": [`f = ${view.frequency}`, "freq.values()"],
    "heap-push": [`heappush(-${view.frequency})`, isVi ? "số âm nhỏ nhất ở root" : "smallest negative value at root"],
    "ans-init": ["ans = 0", isVi ? "bắt đầu cộng kết quả" : "start accumulating"],
    "index-init": ["index = 0", isVi ? "ô rẻ nhất đầu tiên" : "first cheapest slot"],
    while: ["while max_heap", `${view.heap.length} ${isVi ? "phần tử còn lại" : "items remain"}`],
    pop: [`frequency = ${view.frequency}`, "-heappop(max_heap)"],
    presses: [`presses = ${view.presses}`, `${view.index} // 8 + 1`],
    add: [`ans += ${view.frequency} × ${view.presses}`, `ans = ${view.ans}`],
    increment: [`index += 1`, `index = ${view.index}`],
    "while-done": ["max_heap = []", isVi ? "thoát vòng while" : "exit the while loop"],
    done: [`return ${view.ans}`, isVi ? "hoàn tất" : "complete"],
  };
  const [actionMain, actionDetail] = actionByPhase[view.phase] || ["", ""];
  const summary = isVi
    ? `Heap có ${view.heap.length} phần tử, index ${view.index ?? "chưa gán"}, ans ${view.ans ?? "chưa gán"}.`
    : `The heap has ${view.heap.length} items, index ${view.index ?? "unset"}, ans ${view.ans ?? "unset"}.`;

  treeView.innerHTML = `<div class="keypad-heap-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="kph-phases">${stagesHtml}</div>
    <div class="kp-status-row">
      <span><small>frequency</small><strong>${view.frequency === null ? unset : escapeHtml(view.frequency)}</strong></span>
      <span class="${view.presses !== null ? "active" : ""}"><small>presses</small><strong>${view.presses === null ? unset : escapeHtml(view.presses)}</strong></span>
      <span class="${view.index !== null ? "active" : ""}"><small>index</small><strong>${view.index === null ? unset : escapeHtml(view.index)}</strong></span>
      <span class="total"><small>ans</small><strong>${view.ans === null ? unset : escapeHtml(view.ans)}</strong></span>
    </div>
    <div class="kph-data-grid">
      <section class="kph-data-section">
        <div class="kp-section-title"><strong>freq = Counter(word)</strong><span>${view.visibleFreqCount}/${view.freqEntries.length}</span></div>
        <div class="kph-frequency-row">${frequencyHtml}</div>
      </section>
      <section class="kph-data-section">
        <div class="kp-section-title"><strong>max_heap</strong><span>${isVi ? "lưu -f" : "stores -f"}</span></div>
        <div class="kph-heap-row">${heapHtml}</div>
      </section>
    </div>
    <section class="kp-board-section">
      <div class="kp-section-title"><strong>${isVi ? "Gán tần suất vào phím 2–9" : "Assign frequencies to keys 2–9"}</strong><span>f × presses → ans</span></div>
      <div class="kp-board-scroll">
        <div class="kp-board-grid">
          <div class="kp-board-corner">${isVi ? "CHI PHÍ" : "COST"}</div>
          ${headerHtml}
          ${layerRows}
        </div>
      </div>
    </section>
    <div class="kp-current-action"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
  </div>`;
}

function renderDecisionTree(step) {
  renderTree({ tree: step.decisionTree }, "decisionTreeView");
}

function renderNonDecreasingSubsequencesView(step) {
  const view = step.nonDecreasingView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const current = Array.isArray(view.current) ? view.current : [];
  const chosenIndices = Array.isArray(view.chosenIndices) ? view.chosenIndices : [];
  const used = Array.isArray(view.used) ? view.used : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const chosenOrder = new Map(chosenIndices.map((index, order) => [index, order + 1]));
  const candidateKnown = Number.isInteger(view.i);
  const duplicateKnown = typeof view.duplicate === "boolean";
  const orderKnown = typeof view.orderOk === "boolean";
  const duplicateRejected = view.duplicate === true;
  const orderRejected = view.orderOk === false;
  const accepted = candidateKnown && view.duplicate === false && view.orderOk === true;
  const activePhase = view.action === "result" || view.action === "save"
    ? 2
    : new Set(["loop", "duplicate-check", "skip-duplicate", "order-check", "skip-order", "used-add", "choose", "recurse", "backtrack"]).has(view.action)
      ? 1
      : 0;
  const phaseLabels = vi
    ? ["1. Mở một frame", "2. Lọc rồi chọn", "3. Lưu đáp án"]
    : ["1. Open a frame", "2. Filter then choose", "3. Save answers"];
  const phaseHtml = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${index < activePhase ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const arrayHtml = nums.map((value, index) => {
    const classes = ["nds-number"];
    if (chosenOrder.has(index)) classes.push("is-chosen");
    if (index === view.i) classes.push("is-candidate");
    if (index === view.i && duplicateRejected) classes.push("is-duplicate-reject");
    if (index === view.i && orderRejected) classes.push("is-order-reject");
    if (index === view.i && accepted) classes.push("is-accepted");
    if (Number.isInteger(view.start) && index < view.start && !chosenOrder.has(index)) classes.push("is-before-start");
    let pointer = "";
    if (index === view.i) pointer = `<span class="nds-pointer">i</span>`;
    else if (chosenOrder.has(index)) pointer = `<span class="nds-pick-order">#${chosenOrder.get(index)}</span>`;
    const start = Number.isInteger(view.start) && index === view.start
      ? `<em class="nds-start">start</em>`
      : "";
    return `<div class="${classes.join(" ")}">${pointer}${start}<small>[${index}]</small><strong>${escapeHtml(value)}</strong></div>`;
  }).join("");

  const currentHtml = current.length
    ? current.map((value, index) => `<span><small>#${index + 1}</small><strong>${escapeHtml(value)}</strong></span>`).join("<b>→</b>")
    : `<em>∅</em>`;
  const usedHtml = used.length
    ? used.map((value) => `<span>${escapeHtml(value)}</span>`).join("")
    : `<em>{ }</em>`;
  const stackHtml = Array.isArray(view.callStack) && view.callStack.length
    ? view.callStack.map((frame, index) => `<span class="${index === view.callStack.length - 1 ? "is-active" : ""}"><small>d=${frame.depth}</small><strong>backtrack(${frame.start})</strong></span>`).join("<b>→</b>")
    : `<em>${vi ? "chưa vào hàm" : "not entered"}</em>`;

  function checkClass(known, pass) {
    if (!known) return "is-pending";
    return pass ? "is-pass" : "is-fail";
  }
  const uniquePass = duplicateKnown ? !view.duplicate : false;
  const orderText = view.last === null
    ? (vi ? "current rỗng" : "current is empty")
    : candidateKnown
      ? `${view.candidate} >= ${view.last}`
      : "nums[i] >= current[-1]";
  const checksHtml = `<div class="nds-check ${checkClass(duplicateKnown, uniquePass)}">
      <b>1</b><span><strong>nums[i] ∉ used</strong><small>${duplicateKnown ? `${view.candidate} ${uniquePass ? "∉" : "∈"} {${used.join(", ")}}` : (vi ? "chưa kiểm tra" : "not checked")}</small></span><em>${duplicateKnown ? (uniquePass ? "PASS" : "SKIP") : "?"}</em>
    </div>
    <div class="nds-check ${checkClass(orderKnown, view.orderOk)}">
      <b>2</b><span><strong>${vi ? "Không làm dãy giảm" : "Does not decrease"}</strong><small>${escapeHtml(orderText)}</small></span><em>${orderKnown ? (view.orderOk ? "PASS" : "SKIP") : "?"}</em>
    </div>`;

  const resultHtml = results.length
    ? results.map((sequence, index) => {
      const newest = view.action === "save" && index === results.length - 1;
      return `<span class="${newest ? "is-new" : ""}">[${sequence.map(escapeHtml).join(", ")}]</span>`;
    }).join("")
    : `<em>${vi ? "chưa có đáp án" : "no answers yet"}</em>`;
  const truncated = view.resultCount > results.length
    ? `<small>+${view.resultCount - results.length} ${vi ? "đáp án trước" : "earlier"}</small>`
    : "";
  const summary = vi
    ? `Non-decreasing Subsequences; current có ${current.length} phần tử; đã lưu ${view.resultCount || 0} đáp án.`
    : `Non-decreasing Subsequences; current has ${current.length} values; ${view.resultCount || 0} answers saved.`;

  $("treeView").innerHTML = `<section class="nds-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="nds-phases">${phaseHtml}</div>
    <div class="nds-frame-bar">
      <span><small>FRAME</small><strong>${Number.isInteger(view.start) ? `backtrack(${view.start})` : "—"}</strong></span>
      <span><small>DEPTH</small><strong>${escapeHtml(view.depth ?? 0)}</strong></span>
      <span><small>${vi ? "ĐÁP ÁN" : "ANSWERS"}</small><strong>${escapeHtml(view.resultCount ?? 0)}</strong></span>
    </div>
    <section class="nds-array-section"><header><strong>nums</strong><span>${vi ? "giữ nguyên thứ tự index" : "preserve index order"}</span></header><div class="nds-array">${arrayHtml}</div></section>
    <div class="nds-state-row">
      <section class="nds-current-section"><header><strong>current</strong><span>${vi ? "subsequence đang xây" : "subsequence being built"}</span></header><div class="nds-current">${currentHtml}</div></section>
      <section class="nds-used-section"><header><strong>used</strong><span>${vi ? "chỉ thuộc frame hiện tại" : "current frame only"}</span></header><div class="nds-used">${usedHtml}</div></section>
    </div>
    <section class="nds-checks-section"><header><strong>${vi ? "HAI CỔNG TRƯỚC KHI CHỌN" : "TWO GATES BEFORE CHOOSING"}</strong><span>${candidateKnown ? `nums[${view.i}] = ${view.candidate}` : (vi ? "chưa có ứng viên" : "no candidate")}</span></header><div class="nds-checks">${checksHtml}</div></section>
    <section class="nds-stack-section"><header><strong>CALL STACK</strong><span>start → i + 1</span></header><div class="nds-stack">${stackHtml}</div></section>
    <section class="nds-results-section"><header><strong>result</strong><span>${view.resultCount || 0} ${vi ? "dãy khác nhau" : "distinct sequences"}</span></header><div class="nds-results">${resultHtml}</div>${truncated}</section>
    <div class="nds-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="nds-legend"><span><i class="chosen"></i>${vi ? "đã chọn" : "chosen"}</span><span><i class="candidate"></i>${vi ? "đang xét" : "candidate"}</span><span><i class="duplicate"></i>${vi ? "trùng level" : "same-level duplicate"}</span><span><i class="decrease"></i>${vi ? "làm dãy giảm" : "would decrease"}</span></div>
  </section>`;
}

function renderPredictWinnerView(step) {
  const view = step.predictWinnerView;
  const vi = lang === "vi";
  const hasI = Number.isInteger(view.i);
  const hasJ = Number.isInteger(view.j);
  const intervalReady = hasI && hasJ;
  const intervalStage = new Set(["length", "interval-start", "interval", "take-left", "take-right", "choose"]);
  const activeStage = view.phase === "done" ? 2 : intervalStage.has(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Đoạn dài 1", "2. Ghép đoạn dài hơn", "3. Kiểm tra Player 1"]
    : ["1. Length-1 intervals", "2. Build longer intervals", "3. Check Player 1"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < activeStage ? "is-done" : index === activeStage ? "is-active" : "";
    return `<span class="${state}">${index < activeStage ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const arrayHtml = view.nums.map((value, index) => {
    const classes = ["predict-winner-number"];
    if (intervalReady && (index < view.i || index > view.j)) classes.push("is-outside");
    if (hasI && index === view.i) classes.push("is-left");
    if (hasJ && index === view.j) classes.push("is-right");
    if (hasI && hasJ && view.i === view.j && index === view.i) classes.push("is-only");
    let pointers = "";
    if (hasI && hasJ && view.i === view.j && index === view.i) {
      pointers = `<span>${vi ? "CHỈ CÒN" : "ONLY"}</span>`;
    } else {
      if (hasI && index === view.i) pointers += `<span>L · i</span>`;
      if (hasJ && index === view.j) pointers += `<span>R · j</span>`;
    }
    return `<div class="${classes.join(" ")}">
      <div class="predict-winner-pointers">${pointers}</div>
      <strong>${escapeHtml(value)}</strong>
      <small>[${index}]</small>
    </div>`;
  }).join("");

  const leftDependency = intervalReady && view.i + 1 <= view.j ? [view.i + 1, view.j] : null;
  const rightDependency = intervalReady && view.i <= view.j - 1 ? [view.i, view.j - 1] : null;
  let dpCells = `<div class="predict-winner-dp-cell is-corner">i \\ j</div>`;
  view.nums.forEach((value, j) => {
    dpCells += `<div class="predict-winner-dp-cell is-header"><small>j=${j}</small><strong>${escapeHtml(value)}</strong></div>`;
  });
  view.dp.forEach((row, i) => {
    dpCells += `<div class="predict-winner-dp-cell is-header"><small>i=${i}</small><strong>${escapeHtml(view.nums[i])}</strong></div>`;
    row.forEach((value, j) => {
      const classes = ["predict-winner-dp-cell"];
      if (i > j) classes.push("is-unused");
      if (i === view.i && j === view.j) classes.push("is-active");
      if (leftDependency && i === leftDependency[0] && j === leftDependency[1]) classes.push("is-left-dependency");
      if (rightDependency && i === rightDependency[0] && j === rightDependency[1]) classes.push("is-right-dependency");
      if (value !== null) classes.push("is-filled");
      const cellValue = i > j ? "" : value === null ? "·" : value;
      dpCells += `<div class="${classes.join(" ")}" role="gridcell" aria-label="dp ${i} ${j}: ${cellValue || "unused"}">
        <small>${i <= j ? `[${i},${j}]` : ""}</small><strong>${escapeHtml(cellValue)}</strong>
      </div>`;
    });
  });

  const leftOpponent = leftDependency ? view.dp[leftDependency[0]][leftDependency[1]] : null;
  const rightOpponent = rightDependency ? view.dp[rightDependency[0]][rightDependency[1]] : null;
  const leftKnown = view.takeLeft !== null;
  const rightKnown = view.takeRight !== null;
  const leftClasses = ["predict-winner-choice", "is-left-choice"];
  const rightClasses = ["predict-winner-choice", "is-right-choice"];
  if (view.phase === "take-left") leftClasses.push("is-current");
  if (view.phase === "take-right") rightClasses.push("is-current");
  if (view.phase === "choose" || view.phase === "done") {
    if (view.picked === "left") {
      leftClasses.push("is-picked");
      rightClasses.push("is-rejected");
    } else {
      rightClasses.push("is-picked");
      leftClasses.push("is-rejected");
    }
  }
  const leftChoiceHtml = intervalReady && view.i !== view.j
    ? `<div class="${leftClasses.join(" ")}">
        <div><b>${vi ? "LẤY TRÁI" : "TAKE LEFT"}</b><strong>${escapeHtml(view.nums[view.i])}</strong></div>
        <code>${escapeHtml(view.nums[view.i])} - dp[${view.i + 1}][${view.j}]</code>
        <span>${escapeHtml(view.nums[view.i])} - ${escapeHtml(leftOpponent)} = <b>${leftKnown ? escapeHtml(view.takeLeft) : "?"}</b></span>
      </div>`
    : "";
  const rightChoiceHtml = intervalReady && view.i !== view.j
    ? `<div class="${rightClasses.join(" ")}">
        <div><b>${vi ? "LẤY PHẢI" : "TAKE RIGHT"}</b><strong>${escapeHtml(view.nums[view.j])}</strong></div>
        <code>${escapeHtml(view.nums[view.j])} - dp[${view.i}][${view.j - 1}]</code>
        <span>${escapeHtml(view.nums[view.j])} - ${escapeHtml(rightOpponent)} = <b>${rightKnown ? escapeHtml(view.takeRight) : "?"}</b></span>
      </div>`
    : "";

  let actionMain;
  let actionDetail;
  let actionClass = "";
  if (view.phase === "init") {
    actionMain = "dp[i][j]";
    actionDetail = vi ? "lợi thế tối đa của người sắp chơi trên đoạn [i..j]" : "best advantage for the player about to move on [i..j]";
  } else if (view.phase === "base") {
    actionMain = `dp[${view.i}][${view.j}] = ${view.nums[view.i]}`;
    actionDetail = vi ? "Một số duy nhất: lấy nó, đối thủ không còn điểm trong đoạn này." : "One number remains: take it, leaving no score in this interval for the opponent.";
  } else if (view.phase === "length") {
    actionMain = `length = ${view.length}`;
    actionDetail = vi ? "Chỉ dùng kết quả từ các đoạn ngắn hơn đã được tính." : "Use only previously computed shorter intervals.";
  } else if (view.phase === "interval-start") {
    actionMain = `i = ${view.i}`;
    actionDetail = vi ? "Đặt đầu trái; j sẽ được tính từ i và length." : "Set the left endpoint; j is computed from i and length.";
  } else if (view.phase === "interval") {
    actionMain = `[i, j] = [${view.i}, ${view.j}]`;
    actionDetail = vi ? `Chỉ có thể lấy ${view.nums[view.i]} bên trái hoặc ${view.nums[view.j]} bên phải.` : `Only ${view.nums[view.i]} on the left or ${view.nums[view.j]} on the right can be taken.`;
  } else if (view.phase === "take-left") {
    actionMain = `take_left = ${view.takeLeft}`;
    actionDetail = vi ? "Điểm lấy được trừ lợi thế tối ưu của đối thủ trong đoạn còn lại." : "Score taken minus the opponent's optimal advantage on the remaining interval.";
  } else if (view.phase === "take-right") {
    actionMain = `take_right = ${view.takeRight}`;
    actionDetail = vi ? "Tính tương tự khi lấy số ngoài cùng bên phải." : "Apply the same calculation after taking the rightmost number.";
  } else if (view.phase === "choose") {
    actionMain = `max(${view.takeLeft}, ${view.takeRight}) = ${view.dp[view.i][view.j]}`;
    actionDetail = vi ? `Người hiện tại chọn ${view.picked === "left" ? "TRÁI" : "PHẢI"} để giữ lợi thế lớn hơn.` : `The current player chooses ${view.picked.toUpperCase()} for the larger advantage.`;
    actionClass = "is-choice";
  } else {
    actionMain = `dp[0][${view.nums.length - 1}] = ${view.advantage}`;
    actionDetail = view.winner
      ? (vi ? `${view.advantage} ≥ 0 nên Player 1 thắng hoặc hòa.` : `${view.advantage} ≥ 0, so Player 1 wins or ties.`)
      : (vi ? `${view.advantage} < 0 nên Player 2 thắng nếu cả hai chơi tối ưu.` : `${view.advantage} < 0, so Player 2 wins under optimal play.`);
    actionClass = view.winner ? "is-winner" : "is-loser";
  }

  const choicesHtml = intervalReady && view.i !== view.j
    ? `<div class="predict-winner-choices">${leftChoiceHtml}${rightChoiceHtml}</div>`
    : `<div class="predict-winner-rule"><strong>${vi ? "Công thức" : "Formula"}</strong><code>pick - ${vi ? "lợi thế của đối thủ" : "opponent advantage"}</code></div>`;
  const summary = vi
    ? `Predict the Winner với ${view.nums.length} số; phase ${view.phase}.`
    : `Predict the Winner with ${view.nums.length} numbers; phase ${view.phase}.`;
  $("treeView").innerHTML = `<section class="predict-winner-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="predict-winner-phases">${phasesHtml}</div>
    <div class="predict-winner-array">${arrayHtml}</div>
    <div class="predict-winner-workspace">
      <div class="predict-winner-table-block">
        <div class="predict-winner-section-head"><strong>dp[i][j]</strong><span>${vi ? "người hiện tại - đối thủ" : "current player - opponent"}</span></div>
        <div class="predict-winner-table-scroll">
          <div class="predict-winner-dp-grid" role="grid" style="--predict-winner-size:${view.nums.length}">${dpCells}</div>
        </div>
      </div>
      <div class="predict-winner-choice-block">
        <div class="predict-winner-section-head"><strong>${vi ? "Hai lựa chọn" : "Two choices"}</strong><span>${intervalReady ? `[${view.i}, ${view.j}]` : "—"}</span></div>
        ${choicesHtml}
      </div>
    </div>
    <div class="predict-winner-action ${actionClass}"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="predict-winner-legend">
      <span><i class="active"></i>${vi ? "ô đang tính" : "current cell"}</span>
      <span><i class="left"></i>dp[i+1][j]</span>
      <span><i class="right"></i>dp[i][j-1]</span>
    </div>
  </section>`;
}

function renderStoneGameIIView(step) {
  const view = step.stoneGameIIView || {};
  const vi = lang === "vi";
  const piles = Array.isArray(view.piles) ? view.piles : [];
  const suffix = Array.isArray(view.suffix) ? view.suffix : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const options = Array.isArray(view.options) ? view.options : [];
  const hasState = Number.isInteger(view.i) && Number.isInteger(view.m);
  const hasChoice = hasState && Number.isInteger(view.x);
  const phaseIndex = view.phase === "result" ? 2 : ["dp-init", "dp"].includes(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Dựng tổng suffix", "2. Điền dp[i][M] và thử X", "3. Trả dp[0][1]"]
    : ["1. Build suffix totals", "2. Fill dp[i][M] and try X", "3. Return dp[0][1]"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const maxPile = Math.max(1, ...piles.map((pile) => pile.value));
  const selectedEnd = hasChoice ? Math.min(piles.length, view.i + view.x) : null;
  const pilesHtml = piles.map((pile) => {
    const classes = ["sg2-pile"];
    if (Number.isInteger(view.i) && pile.index < view.i) classes.push("is-consumed");
    if (Number.isInteger(view.i) && pile.index >= view.i) classes.push("is-remaining");
    if (hasChoice && pile.index >= view.i && pile.index < selectedEnd) classes.push("is-taken");
    if (Number.isInteger(view.nextI) && pile.index >= view.nextI) classes.push("is-opponent-suffix");
    if (pile.index === view.i) classes.push("is-start");
    const pointers = [];
    if (pile.index === view.i) pointers.push("i");
    if (hasChoice && pile.index === selectedEnd - 1) pointers.push(`X=${view.x}`);
    if (pile.index === view.nextI) pointers.push(vi ? "đối thủ" : "opponent");
    const height = 18 + Math.round((pile.value / maxPile) * 32);
    return `<div class="${classes.join(" ")}">
      <div class="sg2-pointers">${pointers.map((pointer) => `<span>${escapeHtml(pointer)}</span>`).join("")}</div>
      <div class="sg2-pile-bar" style="--sg2-pile-height:${height}px"><strong>${escapeHtml(pile.value)}</strong></div>
      <small>[${pile.index}]</small>
    </div>`;
  }).join("");

  const suffixHtml = suffix.map((cell) => {
    const classes = ["sg2-suffix-cell"];
    if (cell.index === view.i) classes.push("is-active");
    if (cell.index === view.nextI) classes.push("is-dependency");
    if (!cell.known) classes.push("is-pending");
    return `<span class="${classes.join(" ")}"><small>suffix[${cell.index}]</small><strong>${cell.known ? escapeHtml(cell.value) : "?"}</strong></span>`;
  }).join("");

  const columnHeaders = Array.from({ length: view.n || 0 }, (_, index) => `<div class="sg2-dp-head">M=${index + 1}</div>`).join("");
  const dpRows = dp.map((row, rowIndex) => {
    const cells = row.map((cell) => {
      const classes = ["sg2-dp-cell"];
      if (cell.known) classes.push("is-known");
      if (cell.i === view.i && cell.m === view.m) classes.push("is-active");
      if (cell.i === view.nextI && cell.m === view.nextM) classes.push("is-dependency");
      if (cell.i === view.n) classes.push("is-base");
      const role = cell.i === view.i && cell.m === view.m
        ? (vi ? "đang tính" : "current")
        : cell.i === view.nextI && cell.m === view.nextM
          ? (vi ? "đối thủ" : "opponent")
          : "";
      return `<div class="${classes.join(" ")}" role="gridcell" aria-label="dp ${cell.i} ${cell.m}: ${cell.known ? cell.value : "unknown"}"><small>${escapeHtml(role)}</small><strong>${cell.known ? escapeHtml(cell.value) : "?"}</strong></div>`;
    }).join("");
    const rowSuffix = suffix[rowIndex] && suffix[rowIndex].known ? suffix[rowIndex].value : "?";
    return `<div class="sg2-dp-row-head"><strong>i=${rowIndex}</strong><small>Σ=${escapeHtml(rowSuffix)}</small></div>${cells}`;
  }).join("");

  const stateHtml = `<div class="sg2-state-strip">
    <span><small>${vi ? "TRẠNG THÁI" : "STATE"}</small><strong>${hasState ? `dp[${view.i}][${view.m}]` : "dp[i][M]"}</strong></span>
    <span><small>${vi ? "CÒN LẠI" : "REMAINING"}</small><strong>${Number.isInteger(view.remaining) ? view.remaining : "?"} ${vi ? "đống" : "piles"}</strong></span>
    <span><small>${vi ? "GIỚI HẠN LƯỢT" : "TURN LIMIT"}</small><strong>${Number.isInteger(view.m) ? `1 ≤ X ≤ ${view.maxTake}` : "1 ≤ X ≤ 2M"}</strong></span>
    <span><small>${hasState ? `suffix[${view.i}]` : "suffix[i]"}</small><strong>${hasState && suffix[view.i]?.known ? escapeHtml(suffix[view.i].value) : "?"}</strong></span>
  </div>`;

  let formulaHtml;
  if (view.phase === "suffix" && Number.isInteger(view.i)) {
    const left = piles[view.i]?.value ?? "?";
    const right = suffix[view.i + 1]?.known ? suffix[view.i + 1].value : "?";
    const result = suffix[view.i]?.known ? suffix[view.i].value : "?";
    formulaHtml = `<div class="sg2-formula suffix"><span><small>piles[${view.i}]</small><strong>${escapeHtml(left)}</strong></span><i>+</i><span><small>suffix[${view.i + 1}]</small><strong>${escapeHtml(right)}</strong></span><i>=</i><span class="is-result"><small>suffix[${view.i}]</small><strong>${escapeHtml(result)}</strong></span></div>`;
  } else {
    const suffixValue = hasState && suffix[view.i]?.known ? suffix[view.i].value : "?";
    const opponentValue = view.opponent === null || view.opponent === undefined ? "?" : view.opponent;
    const candidateValue = view.candidate === null || view.candidate === undefined ? "?" : view.candidate;
    formulaHtml = `<div class="sg2-formula"><span><small>${hasState ? `suffix[${view.i}] · ${vi ? "tổng còn lại" : "remaining total"}` : "suffix[i]"}</small><strong>${escapeHtml(suffixValue)}</strong></span><i>−</i><span class="is-opponent"><small>${Number.isInteger(view.nextI) ? `dp[${view.nextI}][${view.nextM}] · ${vi ? "đối thủ" : "opponent"}` : "dp[i+X][max(M,X)]"}</small><strong>${escapeHtml(opponentValue)}</strong></span><i>=</i><span class="is-result"><small>${vi ? "người hiện tại đảm bảo" : "current player secures"}</small><strong>${escapeHtml(candidateValue)}</strong></span></div>`;
  }

  let optionCounts;
  if (view.takeAll || view.phase === "result") {
    optionCounts = options.map((option) => option.x);
  } else {
    optionCounts = Array.from({ length: Number.isInteger(view.maxTake) ? view.maxTake : 0 }, (_, index) => index + 1);
  }
  const optionsHtml = optionCounts.length ? optionCounts.map((x) => {
    const option = options.find((item) => item.x === x);
    const classes = ["sg2-option"];
    if (x === view.x) classes.push("is-current");
    if (option && x === view.bestX) classes.push("is-best");
    if (!option) classes.push("is-pending");
    const indices = option ? `[${option.indices.join(", ")}]` : (hasState ? `[${view.i}..${view.i + x - 1}]` : "—");
    return `<div class="${classes.join(" ")}">
      <header><strong>X=${x}</strong><span>${option && x === view.bestX ? (vi ? "TỐT NHẤT" : "BEST") : option ? (vi ? "ĐÃ THỬ" : "TRIED") : (vi ? "CHƯA THỬ" : "PENDING")}</span></header>
      <code>${escapeHtml(indices)}</code>
      <div><span><small>${vi ? "lấy ngay" : "take now"}</small><b>${option ? escapeHtml(option.immediate) : "?"}</b></span><span><small>${vi ? "đối thủ" : "opponent"}</small><b>${option ? escapeHtml(option.opponent) : "?"}</b></span><span><small>${vi ? "đảm bảo" : "secures"}</small><b>${option ? escapeHtml(option.candidate) : "?"}</b></span></div>
      <small>${option ? `→ dp[${option.nextI}][${option.nextM}]` : `→ dp[${hasState ? view.i + x : "i+X"}][max(M,${x})]`}</small>
    </div>`;
  }).join("") : `<div class="sg2-options-empty">${vi ? "Các lựa chọn X sẽ xuất hiện khi bắt đầu một trạng thái dp." : "X choices appear when a dp state begins."}</div>`;

  let detail;
  if (view.event === "enter") detail = vi ? "Alice bắt đầu tại (i=0, M=1)." : "Alice starts at (i=0, M=1).";
  else if (view.event === "read-n") detail = vi ? "Mỗi trạng thái được xác định bởi vị trí i và giới hạn M." : "Each state is identified by position i and limit M.";
  else if (view.event === "init-suffix") detail = vi ? "Suffix rỗng sau cuối mảng có tổng bằng 0." : "The empty suffix after the array has total 0.";
  else if (view.event === "suffix-loop") detail = vi ? `Chuẩn bị cộng piles[${view.i}] vào suffix bên phải.` : `Prepare to add piles[${view.i}] to the suffix on its right.`;
  else if (view.event === "suffix-save") detail = vi ? `Đã biết tổng đá từ vị trí ${view.i} đến cuối.` : `The total from position ${view.i} to the end is now known.`;
  else if (view.event === "init-dp") detail = vi ? `Hàng i=${view.n} là base case: không còn đá nên mọi giá trị bằng 0.` : `Row i=${view.n} is the base case: no piles remain, so every value is 0.`;
  else if (view.event === "outer-loop") detail = vi ? `Mở hàng i=${view.i}; các hàng i lớn hơn đã sẵn sàng.` : `Open row i=${view.i}; rows with larger i are ready.`;
  else if (view.event === "inner-loop") detail = vi ? `Tại M=${view.m}, được xét X từ 1 đến ${view.maxTake}.` : `At M=${view.m}, X ranges from 1 through ${view.maxTake}.`;
  else if (view.event === "take-all-check") detail = view.takeAll
    ? (vi ? `2M đủ phủ ${view.remaining} đống còn lại.` : `2M covers all ${view.remaining} remaining piles.`)
    : (vi ? "Không thể lấy hết; phải tính phần tối ưu của đối thủ." : "Cannot take all; the opponent's optimal remainder must be considered.");
  else if (view.event === "take-all") detail = vi ? `Lấy hết ${view.remaining} đống và để lại 0 cho đối thủ.` : `Take all ${view.remaining} piles and leave 0 for the opponent.`;
  else if (view.event === "else-branch") detail = vi ? `So sánh ${view.maxTake} lựa chọn X.` : `Compare ${view.maxTake} possible X choices.`;
  else if (view.event === "reset-best") detail = vi ? "Đặt best=0 trước khi thử lựa chọn đầu tiên." : "Reset best=0 before evaluating the first choice.";
  else if (view.event === "option-loop") detail = vi ? `X=${view.x}: lấy ${view.immediate} viên ngay, rồi chuyển lượt sang dp[${view.nextI}][${view.nextM}].` : `X=${view.x}: take ${view.immediate} now, then pass the turn to dp[${view.nextI}][${view.nextM}].`;
  else if (view.event === "evaluate-option") detail = vi ? `Đối thủ đảm bảo ${view.opponent}; người hiện tại còn ${view.candidate}. Best hiện tại là ${view.best}.` : `The opponent secures ${view.opponent}; the current player keeps ${view.candidate}. Current best is ${view.best}.`;
  else if (view.event === "commit") detail = vi ? `Chọn X=${view.bestX} và lưu dp[${view.i}][${view.m}]=${view.best}.` : `Choose X=${view.bestX} and store dp[${view.i}][${view.m}]=${view.best}.`;
  else detail = vi ? `Alice đảm bảo ${view.alice}/${view.total} viên khi cả hai chơi tối ưu.` : `Alice guarantees ${view.alice}/${view.total} stones under optimal play.`;

  const resultHtml = view.phase === "result" ? `<div class="sg2-result-split">
    <span class="alice" style="--sg2-share:${view.total ? (view.alice / view.total) * 100 : 0}%"><small>ALICE · dp[0][1]</small><strong>${escapeHtml(view.alice)}</strong><i></i></span>
    <span class="bob" style="--sg2-share:${view.total ? (view.bob / view.total) * 100 : 0}%"><small>BOB · ${vi ? "còn lại" : "remainder"}</small><strong>${escapeHtml(view.bob)}</strong><i></i></span>
  </div>` : "";

  const summary = vi
    ? `Stone Game II với ${piles.length} đống; trạng thái ${view.phase}.`
    : `Stone Game II with ${piles.length} piles; phase ${view.phase}.`;
  $("treeView").innerHTML = `<section class="stone-game-ii-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sg2-phases">${phasesHtml}</div>
    ${stateHtml}
    <section class="sg2-piles-section"><header><strong>PILES</strong><span>${hasChoice ? `${vi ? "lấy" : "take"} X=${view.x} · next (${view.nextI}, ${view.nextM})` : (vi ? "độ cao biểu diễn số đá" : "height represents stones")}</span></header><div class="sg2-piles">${pilesHtml}</div></section>
    <section class="sg2-suffix-section"><header><strong>SUFFIX TOTALS</strong><span>suffix[i] = piles[i] + suffix[i+1]</span></header><div class="sg2-suffix-row">${suffixHtml}</div></section>
    ${formulaHtml}
    <section class="sg2-options-section"><header><strong>${vi ? "LỰA CHỌN X" : "X CHOICES"}</strong><span>${hasState ? `dp[${view.i}][${view.m}]` : "dp[i][M]"}</span></header><div class="sg2-options">${optionsHtml}</div></section>
    <section class="sg2-table-section"><header><strong>DP TABLE</strong><span>${vi ? "số đá tối đa người hiện tại đảm bảo" : "maximum stones current player secures"}</span></header><div class="sg2-table-scroll"><div class="sg2-dp-grid" role="grid" style="--sg2-cols:${view.n || 1}"><div class="sg2-dp-corner">i / M</div>${columnHeaders}${dpRows}</div></div></section>
    ${resultHtml}
    <div class="sg2-action ${view.takeAll ? "is-take-all" : ""} ${view.phase === "result" ? "is-result" : ""}"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(detail)}</span></div>
    <div class="sg2-legend"><span><i class="current"></i>${vi ? "trạng thái hiện tại" : "current state"}</span><span><i class="taken"></i>${vi ? "đống đang lấy" : "piles taken"}</span><span><i class="opponent"></i>${vi ? "trạng thái đối thủ" : "opponent state"}</span><span><i class="best"></i>${vi ? "lựa chọn tốt nhất" : "best choice"}</span></div>
  </section>`;
}

function renderStoneGameView(step) {
  const view = step.stoneGameView;
  const vi = lang === "vi";
  const hasI = Number.isInteger(view.i);
  const hasK = Number.isInteger(view.k);
  const activeChoice = hasK ? view.k + 1 : null;
  const solvingPhases = new Set([
    "index", "take-reset", "best-reset", "choice", "bounds-check",
    "accumulate", "compare", "commit",
  ]);
  const activePhase = view.phase === "result" ? 2 : solvingPhases.has(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Khởi tạo suffix DP", "2. Thử lấy 1-3 viên", "3. Đọc dấu dp[0]"]
    : ["1. Initialize suffix DP", "2. Try taking 1-3", "3. Read dp[0] sign"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${index < activePhase ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const stoneHtml = view.stones.map((stone) => {
    const classes = ["stone-game-stone"];
    classes.push(stone.value < 0 ? "is-negative" : stone.value > 0 ? "is-positive" : "is-zero");
    const selected = hasI && stone.index >= view.i && stone.index < view.i + view.selectedCount;
    const cursor = hasI && hasK && stone.index === view.i + view.k;
    if (hasI && stone.index < view.i) classes.push("is-before-suffix");
    if (hasI && stone.index >= view.i) classes.push("is-suffix");
    if (selected) classes.push("is-selected");
    if (cursor) classes.push("is-cursor");
    let pointer = "";
    if (hasI && stone.index === view.i) pointer += `<span>i</span>`;
    if (cursor) pointer += `<span>i+k</span>`;
    const takeOrder = selected ? stone.index - view.i + 1 : null;
    return `<div class="${classes.join(" ")}">
      <div class="stone-game-pointer">${pointer}</div>
      <strong>${escapeHtml(stone.value)}</strong>
      <small>[${stone.index}]</small>
      ${takeOrder === null ? "" : `<em>${vi ? "lấy" : "take"} ${takeOrder}</em>`}
    </div>`;
  }).join("");

  const dpHtml = view.dp.map((cell) => {
    const classes = ["stone-game-dp-cell"];
    if (cell.known) classes.push("is-known");
    if (cell.base) classes.push("is-base");
    if (cell.index === view.i) classes.push("is-active");
    if (cell.index === view.next) classes.push("is-dependency");
    const value = cell.value === null ? "?" : cell.value;
    let role = "";
    if (cell.index === view.i) role = vi ? "đang tính" : "current";
    else if (cell.index === view.next) role = vi ? "đối thủ" : "opponent";
    else if (cell.base) role = "base";
    return `<div class="${classes.join(" ")}">
      <span>${role}</span><small>dp[${cell.index}]</small><strong>${escapeHtml(value)}</strong>
    </div>`;
  }).join("");

  const optionHtml = [1, 2, 3].map((count) => {
    const option = view.options.find((item) => item.count === count);
    const classes = ["stone-game-option"];
    if (activeChoice === count) classes.push("is-current");
    if (view.bestCount === count && option) classes.push("is-best");
    if (view.phase === "commit" && view.bestCount !== count && option) classes.push("is-rejected");
    const isInvalid = activeChoice === count && view.phase === "bounds-check" && view.valid === false;
    if (isInvalid) classes.push("is-invalid");

    let stonesLabel = "—";
    if (option) {
      stonesLabel = option.indices.map((index) => view.stones[index].value).join(" + ");
    } else if (hasI && view.i + count <= view.stones.length) {
      stonesLabel = view.stones.slice(view.i, view.i + count).map((stone) => stone.value).join(" + ");
    }
    const status = option
      ? (view.bestCount === count ? (vi ? "tốt nhất" : "best") : (vi ? "đã thử" : "tried"))
      : isInvalid ? (vi ? "vượt mảng" : "out of range") : (vi ? "chưa thử" : "not tried");
    return `<div class="${classes.join(" ")}">
      <div class="stone-game-option-head"><b>${vi ? "LẤY" : "TAKE"} ${count}</b><span>${escapeHtml(status)}</span></div>
      <strong>${escapeHtml(stonesLabel)}</strong>
      <div class="stone-game-option-math">
        <span><small>take</small><b>${option ? escapeHtml(option.take) : "?"}</b></span>
        <i>−</i>
        <span><small>${option ? `dp[${option.next}]` : "dp[next]"}</small><b>${option ? escapeHtml(option.opponent) : "?"}</b></span>
        <i>=</i>
        <span class="candidate"><small>candidate</small><b>${option ? escapeHtml(option.candidate) : "?"}</b></span>
      </div>
    </div>`;
  }).join("");

  const nextCell = Number.isInteger(view.next) ? view.dp[view.next] : null;
  const opponent = nextCell && nextCell.value !== null ? nextCell.value : "?";
  const takeValue = view.take === null ? "?" : view.take;
  const candidateValue = view.candidate === null ? "?" : view.candidate;
  const bestValue = view.best === null ? "?" : view.best;
  const formulaHtml = `<div class="stone-game-formula">
    <span class="is-take"><small>${vi ? "điểm lấy ngay" : "score taken now"}</small><strong>${escapeHtml(takeValue)}</strong></span>
    <i>−</i>
    <span class="is-opponent"><small>${Number.isInteger(view.next) ? `dp[${view.next}] · ${vi ? "lợi thế đối thủ" : "opponent advantage"}` : "dp[next]"}</small><strong>${escapeHtml(opponent)}</strong></span>
    <i>=</i>
    <span class="is-candidate"><small>candidate</small><strong>${escapeHtml(candidateValue)}</strong></span>
    <i>→ max →</i>
    <span class="is-best"><small>${hasI ? `dp[${view.i}] · best` : "dp[i] · best"}</small><strong>${escapeHtml(bestValue)}</strong></span>
  </div>`;

  let actionDetail;
  if (view.phase === "setup") {
    actionDetail = vi ? "Đọc số viên đá; chưa có ô dp nào được tạo." : "Read the stones; no dp cell has been initialized yet.";
  } else if (view.phase === "initialize") {
    actionDetail = vi ? `dp[${view.stones.length}] = 0 vì suffix rỗng không còn điểm.` : `dp[${view.stones.length}] = 0 because the empty suffix has no score.`;
  } else if (view.phase === "index") {
    actionDetail = vi ? `Bắt đầu suffix tại i=${view.i}; các ô bên phải đã biết.` : `Start the suffix at i=${view.i}; all cells to its right are known.`;
  } else if (view.phase === "take-reset") {
    actionDetail = vi ? "Đặt take=0 trước khi cộng dần 1, 2 rồi 3 viên." : "Reset take=0 before accumulating 1, then 2, then 3 stones.";
  } else if (view.phase === "best-reset") {
    actionDetail = vi ? `Đặt dp[${view.i}]=−∞ để lựa chọn hợp lệ đầu tiên chắc chắn thay thế nó.` : `Set dp[${view.i}]=−∞ so the first valid choice must replace it.`;
  } else if (view.phase === "choice") {
    actionDetail = vi ? `k=${view.k} tương ứng thử lấy ${activeChoice} viên.` : `k=${view.k} means trying to take ${activeChoice} stone(s).`;
  } else if (view.phase === "bounds-check") {
    actionDetail = view.valid
      ? (vi ? `i+k còn trong mảng, nên lựa chọn lấy ${activeChoice} viên hợp lệ.` : `i+k is inside the array, so taking ${activeChoice} stone(s) is valid.`)
      : (vi ? `i+k vượt cuối mảng; bỏ qua lựa chọn lấy ${activeChoice} viên.` : `i+k is past the array; skip taking ${activeChoice} stone(s).`);
  } else if (view.phase === "accumulate") {
    actionDetail = vi ? `Cộng viên mới vào tổng đang lấy: take=${view.take}.` : `Add the new stone to the running taken sum: take=${view.take}.`;
  } else if (view.phase === "compare") {
    actionDetail = vi ? `Lấy ${view.take}, sau đó đối thủ có lợi thế ${opponent}; candidate=${view.candidate}. Giữ giá trị lớn nhất.` : `Take ${view.take}, then the opponent has advantage ${opponent}; candidate=${view.candidate}. Keep the maximum.`;
  } else if (view.phase === "commit") {
    actionDetail = vi ? `Lấy ${view.bestCount} viên là nước đi tốt nhất tại suffix này; chốt dp[${view.i}]=${view.best}.` : `Taking ${view.bestCount} stone(s) is best for this suffix; commit dp[${view.i}]=${view.best}.`;
  } else {
    const resultReason = view.winner === "Alice"
      ? (vi ? "dp[0] dương: Alice hơn điểm khi cả hai chơi tối ưu." : "dp[0] is positive: Alice finishes ahead under optimal play.")
      : view.winner === "Bob"
        ? (vi ? "dp[0] âm: Bob hơn điểm khi cả hai chơi tối ưu." : "dp[0] is negative: Bob finishes ahead under optimal play.")
        : (vi ? "dp[0] bằng 0: hai người hòa điểm." : "dp[0] is zero: both players tie.");
    actionDetail = resultReason;
  }

  const resultClass = view.phase === "result" ? ` is-result is-${String(view.winner || "tie").toLowerCase()}` : "";
  const summary = vi
    ? `Stone Game III với ${view.stones.length} viên; trạng thái ${view.phase}.`
    : `Stone Game III with ${view.stones.length} stones; phase ${view.phase}.`;
  $("treeView").innerHTML = `<section class="stone-game-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="stone-game-phases">${phasesHtml}</div>
    <section class="stone-game-stones-section">
      <header><strong>stones</strong><span>${hasI ? `suffix [${view.i}..${view.stones.length - 1}]` : (vi ? "đầu vào" : "input")}</span></header>
      <div class="stone-game-scroll"><div class="stone-game-stones">${stoneHtml}</div></div>
    </section>
    <section class="stone-game-dp-section">
      <header><strong>suffix dp</strong><span>${vi ? "lợi thế người hiện tại − đối thủ" : "current-player advantage"}</span></header>
      <div class="stone-game-scroll"><div class="stone-game-dp-row">${dpHtml}</div></div>
    </section>
    ${formulaHtml}
    <section class="stone-game-options-section">
      <header><strong>${vi ? "Ba nước đi có thể thử" : "Three possible moves"}</strong><span>candidate = take − dp[next]</span></header>
      <div class="stone-game-options">${optionHtml}</div>
    </section>
    <div class="stone-game-action${resultClass}"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(actionDetail)}</span>${view.phase === "result" ? `<b>${escapeHtml(view.winner)}</b>` : ""}</div>
    <div class="stone-game-legend">
      <span><i class="selected"></i>${vi ? "đang lấy" : "stones taken"}</span>
      <span><i class="opponent"></i>dp[next]</span>
      <span><i class="best"></i>${vi ? "lựa chọn tốt nhất" : "best choice"}</span>
      <span><b>dp[i] &gt; 0</b>Alice · <b>= 0</b>Tie · <b>&lt; 0</b>Bob</span>
    </div>
  </section>`;
}

function renderRectangleAreaView(step) {
  const view = step.rectangleAreaView;
  const vi = lang === "vi";
  const phaseIndex = {
    build: 0, sort: 0,
    init: 1, event: 1, measure: 1, scan: 1, merge: 1,
    area: 2, update: 2,
    done: 3,
  }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1. Tạo x-events", "2. Hợp các đoạn y", "3. Cộng diện tích dải", "4. Trả modulo"]
    : ["1. Build x-events", "2. Merge y-intervals", "3. Add strip area", "4. Return modulo"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const eventsHtml = view.events.length
    ? view.events.map((event) => {
      const type = event.type === 1 ? "START" : "END";
      const classes = ["rectangle-area-event", event.type === 1 ? "is-start" : "is-end"];
      if (event.isCurrent) classes.push("is-current");
      else if (event.isProcessed) classes.push("is-processed");
      if (view.currentRectId === event.rectId && !event.isCurrent && view.phase === "build") classes.push("is-related");
      return `<div class="${classes.join(" ")}">
        <small>x = ${escapeHtml(event.x)}</small>
        <strong>${type} R${escapeHtml(event.rectId)}</strong>
        <span>[${escapeHtml(event.y1)}, ${escapeHtml(event.y2)})</span>
      </div>`;
    }).join("")
    : `<span class="rectangle-area-empty">${vi ? "Chưa có event" : "No events yet"}</span>`;

  const allX = view.rectangles.flatMap((rect) => [rect.x1, rect.x2]);
  const allY = view.rectangles.flatMap((rect) => [rect.y1, rect.y2]);
  const rawMinX = Math.min(...allX);
  const rawMaxX = Math.max(...allX);
  const rawMinY = Math.min(...allY);
  const rawMaxY = Math.max(...allY);
  const xPadding = Math.max(0.45, (rawMaxX - rawMinX) * 0.08);
  const yPadding = Math.max(0.45, (rawMaxY - rawMinY) * 0.1);
  const minX = rawMinX - xPadding;
  const maxX = rawMaxX + xPadding;
  const minY = rawMinY - yPadding;
  const maxY = rawMaxY + yPadding;
  const svgWidth = 620;
  const svgHeight = 338;
  const pad = { left: 48, right: 20, top: 22, bottom: 42 };
  const plotWidth = svgWidth - pad.left - pad.right;
  const plotHeight = svgHeight - pad.top - pad.bottom;
  const sx = (x) => pad.left + ((x - minX) / (maxX - minX || 1)) * plotWidth;
  const sy = (y) => pad.top + ((maxY - y) / (maxY - minY || 1)) * plotHeight;

  const makeTicks = (values, minValue, maxValue) => {
    const unique = [...new Set(values.concat(Number.isInteger(minValue) ? [minValue] : []))].sort((a, b) => a - b);
    if (unique.length <= 9) return unique;
    const ticks = [];
    for (let index = 0; index < 7; index++) ticks.push(minValue + ((maxValue - minValue) * index) / 6);
    return ticks;
  };
  const xTicks = makeTicks(allX, rawMinX, rawMaxX);
  const yTicks = makeTicks(allY, rawMinY, rawMaxY);
  let gridSvg = "";
  xTicks.forEach((tick) => {
    const x = sx(tick);
    gridSvg += `<line class="rectangle-area-grid-line" x1="${x}" y1="${pad.top}" x2="${x}" y2="${svgHeight - pad.bottom}" />`;
    gridSvg += `<text class="rectangle-area-axis-label" x="${x}" y="${svgHeight - 17}" text-anchor="middle">${escapeXml(Number(tick.toFixed(2)))}</text>`;
  });
  yTicks.forEach((tick) => {
    const y = sy(tick);
    gridSvg += `<line class="rectangle-area-grid-line" x1="${pad.left}" y1="${y}" x2="${svgWidth - pad.right}" y2="${y}" />`;
    gridSvg += `<text class="rectangle-area-axis-label" x="${pad.left - 10}" y="${y}" text-anchor="end" dy="0.34em">${escapeXml(Number(tick.toFixed(2)))}</text>`;
  });

  let bandsSvg = "";
  view.processedBands.forEach((band) => {
    band.segments.forEach((segment) => {
      const x = sx(band.x1);
      const y = sy(segment.y2);
      const width = Math.max(0, sx(band.x2) - x);
      const height = Math.max(0, sy(segment.y1) - y);
      bandsSvg += `<rect class="rectangle-area-counted-band" x="${x}" y="${y}" width="${width}" height="${height}" />`;
    });
  });
  if (view.currentBand && view.currentBand.x2 > view.currentBand.x1) {
    view.currentBand.segments.forEach((segment) => {
      const x = sx(view.currentBand.x1);
      const y = sy(segment.y2);
      const width = Math.max(0, sx(view.currentBand.x2) - x);
      const height = Math.max(0, sy(segment.y1) - y);
      bandsSvg += `<rect class="rectangle-area-current-band${view.currentBand.counted ? " is-counted" : ""}" x="${x}" y="${y}" width="${width}" height="${height}" />`;
    });
  }

  const sourceSvg = view.rectangles.map((rect) => {
    const x = sx(rect.x1);
    const y = sy(rect.y2);
    const width = sx(rect.x2) - x;
    const height = sy(rect.y1) - y;
    const current = rect.id === view.currentRectId ? " is-current" : "";
    return `<g class="rectangle-area-source rectangle-area-source-${(rect.id - 1) % 4 + 1}${current}">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" />
      <text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dy="0.35em">R${escapeXml(rect.id)}</text>
    </g>`;
  }).join("");

  let sweepSvg = "";
  if (view.sweepX !== null) {
    const x = sx(view.sweepX);
    sweepSvg = `<line class="rectangle-area-sweep-line" x1="${x}" y1="${pad.top - 8}" x2="${x}" y2="${svgHeight - pad.bottom + 5}" />
      <path class="rectangle-area-sweep-arrow" d="M ${x - 6} ${pad.top - 8} L ${x + 6} ${pad.top - 8} L ${x} ${pad.top} Z" />
      <text class="rectangle-area-sweep-label" x="${x}" y="${pad.top - 11}" text-anchor="middle">x=${escapeXml(view.sweepX)}</text>`;
  }
  let intervalSvg = "";
  if (view.currentInterval && view.sweepX !== null) {
    const x = sx(view.sweepX) + 8;
    const yTop = sy(view.currentInterval.y2);
    const yBottom = sy(view.currentInterval.y1);
    intervalSvg = `<line class="rectangle-area-scan-interval" x1="${x}" y1="${yTop}" x2="${x}" y2="${yBottom}" />
      <circle class="rectangle-area-scan-point" cx="${x}" cy="${yTop}" r="4" />
      <circle class="rectangle-area-scan-point" cx="${x}" cy="${yBottom}" r="4" />`;
  }
  const plotSummary = vi
    ? `${view.rectangles.length} hình chữ nhật; diện tích đã cộng ${view.area}; đường quét ${view.sweepX === null ? "chưa gán" : `tại x=${view.sweepX}`}.`
    : `${view.rectangles.length} rectangles; accumulated area ${view.area}; sweep ${view.sweepX === null ? "unset" : `at x=${view.sweepX}`}.`;

  const activeHtml = view.active.length
    ? view.active.map((interval) => {
      const current = view.currentInterval && interval.rectId === view.currentInterval.rectId ? " is-current" : "";
      return `<div class="rectangle-area-interval${current}"><b>R${escapeHtml(interval.rectId)}</b><code>[${escapeHtml(interval.y1)}, ${escapeHtml(interval.y2)})</code></div>`;
    }).join("")
    : `<span class="rectangle-area-empty">${vi ? "active đang rỗng" : "active is empty"}</span>`;
  const unionHtml = view.mergedSegments.length
    ? view.mergedSegments.map((segment) => `<code>[${escapeHtml(segment.y1)}, ${escapeHtml(segment.y2)})</code>`).join("")
    : `<span class="rectangle-area-empty">${vi ? "chưa có đoạn y phủ" : "no covered y yet"}</span>`;

  let actionMain = "";
  let actionDetail = "";
  if (view.phase === "build") {
    actionMain = `events.length = ${view.events.length}`;
    actionDetail = vi ? "Mỗi hình đóng góp START tại x1 và END tại x2." : "Each rectangle contributes START at x1 and END at x2.";
  } else if (view.phase === "sort") {
    actionMain = vi ? "Quét từ x nhỏ đến x lớn" : "Sweep from smaller to larger x";
    actionDetail = vi ? "Các event cùng x không tạo diện tích vì Δx = 0." : "Events sharing an x add no area because Δx = 0.";
  } else if (view.phase === "init") {
    actionMain = `prev_x = ${view.prevX ?? "?"}, area = ${view.area}`;
    actionDetail = vi ? "Khởi tạo vị trí bắt đầu và tổng diện tích." : "Initialize the starting position and accumulated area.";
  } else if (view.phase === "event") {
    actionMain = `[prev_x, x) = [${view.currentBand?.x1 ?? view.prevX}, ${view.sweepX})`;
    actionDetail = vi ? "Luôn đo dải bên trái trước khi thay đổi active." : "Always measure the strip to the left before changing active.";
  } else if (["measure", "scan", "merge"].includes(view.phase)) {
    const end = view.currentEnd === null ? "?" : view.currentEnd;
    actionMain = `covered_y = ${view.coveredY}`;
    actionDetail = view.currentInterval
      ? (vi ? `Đang merge R${view.currentInterval.rectId}[${view.currentInterval.y1},${view.currentInterval.y2}); current_end = ${end}.` : `Merging R${view.currentInterval.rectId}[${view.currentInterval.y1},${view.currentInterval.y2}); current_end = ${end}.`)
      : (vi ? "Reset rồi merge các interval theo start tăng dần." : "Reset, then merge intervals by increasing start.");
  } else if (view.phase === "area") {
    const dx = view.currentBand ? view.currentBand.x2 - view.currentBand.x1 : 0;
    actionMain = `${dx} × ${view.coveredY} = ${view.stripArea}`;
    actionDetail = vi ? `Cộng diện tích dải một lần; area = ${view.area}.` : `Add the strip once; area = ${view.area}.`;
  } else if (view.phase === "update") {
    const event = view.events.find((item) => item.isCurrent);
    actionMain = event ? `${event.type === 1 ? "START" : "END"} R${event.rectId}` : "active";
    actionDetail = event
      ? (event.type === 1
        ? (vi ? "Thêm interval để dùng cho dải bên phải." : "Add its interval for the strip to the right.")
        : (vi ? "Xóa interval vì hình đã kết thúc tại x này." : "Remove its interval because the rectangle ends at this x."))
      : "";
  } else {
    actionMain = `${view.area} mod 1,000,000,007 = ${view.answer}`;
    actionDetail = vi ? "Diện tích hợp cuối cùng: mỗi vùng chỉ được tính đúng một lần." : "Final union area: every region is counted exactly once.";
  }

  $("treeView").innerHTML = `<section class="rectangle-area-viz" role="img" aria-label="${escapeHtml(plotSummary)}">
    <div class="rectangle-area-phases">${phasesHtml}</div>
    <div class="rectangle-area-events" aria-label="x events">${eventsHtml}</div>
    <div class="rectangle-area-workspace">
      <div class="rectangle-area-plot-wrap">
        <div class="rectangle-area-section-head"><strong>${vi ? "Mặt phẳng tọa độ" : "Coordinate plane"}</strong><span>${vi ? "đường quét đi từ trái sang phải" : "sweep moves left to right"}</span></div>
        <svg class="rectangle-area-plot" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="${escapeHtml(plotSummary)}">
          <title>${escapeXml(plotSummary)}</title>
          ${gridSvg}
          <line class="rectangle-area-axis" x1="${pad.left}" y1="${svgHeight - pad.bottom}" x2="${svgWidth - pad.right}" y2="${svgHeight - pad.bottom}" />
          <line class="rectangle-area-axis" x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${svgHeight - pad.bottom}" />
          ${bandsSvg}${sourceSvg}${intervalSvg}${sweepSvg}
          <text class="rectangle-area-axis-name" x="${svgWidth - pad.right}" y="${svgHeight - 7}" text-anchor="end">x</text>
          <text class="rectangle-area-axis-name" x="${pad.left - 12}" y="${pad.top}" text-anchor="end">y</text>
        </svg>
      </div>
      <aside class="rectangle-area-state">
        <div class="rectangle-area-metrics">
          <span><small>prev_x</small><strong>${view.prevX === null ? "—" : escapeHtml(view.prevX)}</strong></span>
          <span><small>x</small><strong>${view.sweepX === null ? "—" : escapeHtml(view.sweepX)}</strong></span>
          <span><small>covered_y</small><strong>${escapeHtml(view.coveredY)}</strong></span>
          <span class="is-total"><small>area</small><strong>${escapeHtml(view.area)}</strong></span>
        </div>
        <div class="rectangle-area-state-section">
          <div class="rectangle-area-section-head"><strong>active</strong><span>${view.active.length} interval${view.active.length === 1 ? "" : "s"}</span></div>
          <div class="rectangle-area-active-list">${activeHtml}</div>
        </div>
        <div class="rectangle-area-state-section">
          <div class="rectangle-area-section-head"><strong>${vi ? "Hợp trên trục y" : "Union on y-axis"}</strong><span>current_end = ${view.currentEnd === null ? "—" : escapeHtml(view.currentEnd)}</span></div>
          <div class="rectangle-area-union-list">${unionHtml}</div>
        </div>
      </aside>
    </div>
    <div class="rectangle-area-action"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="rectangle-area-legend">
      <span><i class="source"></i>${vi ? "hình ban đầu" : "source rectangle"}</span>
      <span><i class="counted"></i>${vi ? "đã cộng vào area" : "counted area"}</span>
      <span><i class="current"></i>${vi ? "dải đang tính" : "current strip"}</span>
      <span><i class="sweep"></i>${vi ? "đường quét" : "sweep line"}</span>
    </div>
  </section>`;
}

// ---- Graph renderer (directed weighted graph) ----
function renderGraph(step, targetId = "treeView") {
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
  const restrictedSet = new Set(step.graph.restrictedNodes || []);
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
    const isRestricted = restrictedSet.has(node.id);
    let cls = "graph-node";
    if (isRestricted) cls += " restricted";
    else if (isHl) cls += " hl";
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
  $(targetId).innerHTML =
    caption +
    `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" class="tree-svg graph-svg${isLinear ? " graph-linear" : ""}${isFlow ? " graph-flow" : ""}">` +
    defs + columnSvg + edgeSvg + nodeSvg +
    `</svg>`;
}

function renderNetworkDelayView(step) {
  const view = step.networkDelayView;
  const vi = lang === "vi";
  const dijkstraPhases = new Set(["init", "pop", "stale", "inspect", "calculate", "compare", "update", "push"]);
  const activeStage = view.phase === "build" ? 0 : dijkstraPhases.has(view.phase) ? 1 : 2;
  const stageLabels = vi
    ? ["1. Dựng graph", "2. Chạy Dijkstra", "3. Lấy max(dist)"]
    : ["1. Build graph", "2. Run Dijkstra", "3. Take max(dist)"];
  const stageHtml = stageLabels.map((label, index) => {
    const state = index < activeStage ? "is-done" : index === activeStage ? "is-active" : "";
    return `<span class="${state}">${index < activeStage ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const distanceHtml = view.distances.map((item) => {
    const classes = ["network-delay-dist"];
    let stateLabel = vi ? "chưa tới" : "unreached";
    if (item.value !== "∞") stateLabel = vi ? "đã biết" : "known";
    if (item.isSource) {
      classes.push("is-source");
      stateLabel = "source";
    }
    if (item.isFinalized) {
      classes.push("is-finalized");
      stateLabel = vi ? "đã chốt" : "finalized";
    }
    if (item.isCandidate) {
      classes.push("is-candidate");
      stateLabel = vi ? "đang so sánh" : "candidate";
    }
    if (item.isCurrent) {
      classes.push("is-current");
      stateLabel = vi ? "vừa pop" : "popped";
    }
    return `<div class="${classes.join(" ")}">
      <small>node ${escapeHtml(item.node)}</small>
      <strong>${escapeHtml(item.value)}</strong>
      <em>${escapeHtml(stateLabel)}</em>
    </div>`;
  }).join("");

  const heapHtml = view.heap.length
    ? view.heap.map((item, index) => `<div class="network-delay-heap-item${index === 0 ? " is-front" : ""}">
        <small>${index === 0 ? (vi ? "POP TIẾP" : "NEXT POP") : `[${index}]`}</small>
        <strong>(${escapeHtml(item.distance)}, ${escapeHtml(item.node)})</strong>
        <em>distance, node</em>
      </div>`).join("")
    : `<span class="network-delay-empty">${vi ? "heap rỗng" : "empty heap"}</span>`;

  const edge = view.activeEdge;
  const currentDistance = edge
    ? (view.distances.find((item) => item.node === edge.u) || {}).value
    : null;
  let actionMain;
  let actionDetail;
  let outcomeClass = "";
  if (view.phase === "build") {
    actionMain = edge ? `${edge.u} → ${edge.v} · w=${edge.w}` : (vi ? "Tạo adjacency list" : "Create adjacency list");
    actionDetail = edge
      ? (vi ? "Lưu cạnh có hướng và trọng số vào graph[u]." : "Store the directed weighted edge in graph[u].")
      : (vi ? "Chuẩn bị danh sách cạnh đi ra cho mỗi node." : "Prepare outgoing edges for every node.");
  } else if (view.phase === "init") {
    actionMain = `dist[${view.source}] = 0`;
    actionDetail = vi ? "Nguồn vào heap với khoảng cách 0; các node khác vẫn là ∞." : "Push the source with distance 0; every other node remains ∞.";
  } else if (view.phase === "pop") {
    actionMain = view.currentNode === null
      ? (vi ? "Lấy phần tử nhỏ nhất của heap" : "Take the minimum heap entry")
      : `pop → node ${view.currentNode}`;
    actionDetail = vi ? "Chỉ node có distance nhỏ nhất hiện tại được mở rộng." : "Only the node with the smallest current distance is expanded.";
  } else if (view.phase === "stale") {
    actionMain = vi ? `Bỏ qua bản ghi cũ của node ${view.currentNode}` : `Skip stale entry for node ${view.currentNode}`;
    actionDetail = vi ? "Heap entry lớn hơn dist đang lưu, nên không được duyệt cạnh từ entry này." : "The heap entry exceeds the stored dist, so its outgoing edges are not explored.";
    outcomeClass = "is-rejected";
  } else if (edge && view.phase === "inspect") {
    actionMain = `${edge.u} → ${edge.v} · w=${edge.w}`;
    actionDetail = vi ? `Thử đi từ node ${edge.u} đang xử lý sang node ${edge.v}.` : `Try moving from current node ${edge.u} to node ${edge.v}.`;
  } else if (edge && view.phase === "calculate") {
    actionMain = `${currentDistance} + ${edge.w} = ${view.candidate}`;
    actionDetail = vi ? `Đây là thời gian mới nếu tín hiệu đi qua cạnh ${edge.u} → ${edge.v}.` : `This is the candidate arrival time through edge ${edge.u} → ${edge.v}.`;
  } else if (edge && view.phase === "compare") {
    actionMain = `${view.candidate} < ${view.oldDistance} → ${view.improves ? "True" : "False"}`;
    actionDetail = view.improves
      ? (vi ? `Đường mới tốt hơn, dòng kế tiếp sẽ cập nhật dist[${edge.v}].` : `The new route is better; the next line updates dist[${edge.v}].`)
      : (vi ? `Không tốt hơn, giữ nguyên dist[${edge.v}] = ${view.oldDistance}.` : `No improvement; keep dist[${edge.v}] = ${view.oldDistance}.`);
    outcomeClass = view.improves ? "is-accepted" : "is-rejected";
  } else if (edge && view.phase === "update") {
    actionMain = `dist[${edge.v}]: ${view.oldDistance} → ${view.candidate}`;
    actionDetail = vi ? "Khoảng cách ngắn nhất đã biết được thay bằng giá trị nhỏ hơn." : "Replace the known shortest distance with the smaller value.";
    outcomeClass = "is-accepted";
  } else if (edge && view.phase === "push") {
    actionMain = `heappush((${view.candidate}, ${edge.v}))`;
    actionDetail = vi ? "Trạng thái mới vào heap và sẽ được sắp theo distance." : "The improved state enters the heap and is ordered by distance.";
    outcomeClass = "is-accepted";
  } else if (view.phase === "done") {
    actionMain = view.answer === -1 ? "return -1" : `return ${view.answer}`;
    actionDetail = view.answer === -1
      ? (vi ? "Vẫn còn node có dist = ∞, nên tín hiệu không tới được toàn mạng." : "At least one dist is ∞, so the signal cannot reach the whole network.")
      : (vi ? `Giá trị lớn nhất trong dist là ${view.answer}: thời điểm node cuối cùng nhận tín hiệu.` : `The maximum dist is ${view.answer}: when the final node receives the signal.`);
    outcomeClass = view.answer === -1 ? "is-rejected" : "is-accepted";
  } else {
    actionMain = vi ? "Heap rỗng → kiểm tra max(dist)" : "Heap empty → inspect max(dist)";
    actionDetail = vi ? "Khoảng cách lớn nhất quyết định thời gian toàn mạng nhận được tín hiệu." : "The largest distance determines when the whole network has received the signal.";
  }

  const summary = vi
    ? `Dijkstra từ nguồn ${view.source}. Heap có ${view.heap.length} trạng thái.`
    : `Dijkstra from source ${view.source}. The heap contains ${view.heap.length} states.`;
  $("treeView").innerHTML = `<section class="network-delay-viz" aria-label="${escapeHtml(summary)}">
    <div class="network-delay-phases">${stageHtml}</div>
    <div class="network-delay-workspace">
      <div id="networkDelayGraph" class="network-delay-graph"></div>
      <div class="network-delay-state">
        <div class="network-delay-section-head"><strong>dist</strong><span>${vi ? "thời gian ngắn nhất đã biết" : "best known arrival time"}</span></div>
        <div class="network-delay-distances">${distanceHtml}</div>
        <div class="network-delay-section-head"><strong>min-heap</strong><span>${vi ? "ưu tiên distance nhỏ nhất" : "smallest distance first"}</span></div>
        <div class="network-delay-heap">${heapHtml}</div>
      </div>
    </div>
    <div class="network-delay-action ${outcomeClass}"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="network-delay-legend">
      <span><i class="current"></i>${vi ? "vừa pop / đang xử lý" : "popped / current"}</span>
      <span><i class="candidate"></i>${vi ? "node đang relax" : "relax candidate"}</span>
      <span><i class="finalized"></i>${vi ? "khoảng cách đã chốt" : "finalized distance"}</span>
    </div>
  </section>`;
  renderGraph(step, "networkDelayGraph");
}

function renderPathExistsDfsView(step) {
  const view = step.pathExistsDfsView || {};
  const vi = lang === "vi";
  const callStack = Array.isArray(view.callStack) ? view.callStack : [];
  const visited = new Set(Array.isArray(view.visited) ? view.visited : []);
  const adj = Array.isArray(view.adj) ? view.adj : [];
  const activeNode = Number.isInteger(view.activeNode) ? view.activeNode : null;
  const activeNeighbor = Number.isInteger(view.activeNeighbor) ? view.activeNeighbor : null;
  const source = Number.isInteger(view.source) ? view.source : null;
  const destination = Number.isInteger(view.destination) ? view.destination : null;

  const stage = ["intro", "build-adj", "init-visited"].includes(view.phase)
    ? 0
    : view.phase === "done" ? 2 : 1;
  const stageLabels = vi
    ? ["1 · Dựng graph", "2 · DFS đệ quy", "3 · Return kết quả"]
    : ["1 · Build graph", "2 · Recursive DFS", "3 · Return result"];
  const phases = stageLabels.map((label, index) => {
    const state = index < stage ? "done" : index === stage ? "active" : "";
    return `<span class="${state}">${index < stage ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`;
  }).join("");

  const stackHtml = callStack.length
    ? callStack.map((node, index) => `<span class="${index === callStack.length - 1 ? "top" : ""}"><small>#${index + 1}</small><strong>dfs(${escapeHtml(node)})</strong></span>`).join("")
    : `<span class="path1971-empty">${vi ? "stack rỗng" : "empty stack"}</span>`;

  const visitedHtml = adj.length
    ? adj.map((_, node) => {
      const classes = [
        "path1971-node-chip",
        visited.has(node) ? "visited" : "",
        node === activeNode ? "active" : "",
        node === source ? "source" : "",
        node === destination ? "destination" : "",
      ].filter(Boolean).join(" ");
      return `<span class="${classes}">${node}</span>`;
    }).join("")
    : `<span class="path1971-empty">∅</span>`;

  const adjHtml = adj.length
    ? adj.map((neighbors, node) => {
      const neighborHtml = neighbors.length
        ? neighbors.map((nb) => `<span class="${nb === activeNeighbor ? "current" : visited.has(nb) ? "visited" : ""}">${escapeHtml(nb)}</span>`).join("")
        : "<em>∅</em>";
      return `<div class="path1971-adj-row ${node === activeNode ? "active" : ""}">
        <b>${node}</b><i>→</i><div>${neighborHtml}</div>
      </div>`;
    }).join("")
    : `<div class="path1971-empty">${vi ? "adj đang rỗng" : "adj is empty"}</div>`;

  const decisionText = {
    "define-dfs": vi ? "Định nghĩa dfs(node): kiểm tra đích, kiểm tra visited, rồi thử từng hàng xóm." : "Define dfs(node): check destination, check visited, then try each neighbor.",
    "init-adj": vi ? "Tạo danh sách kề rỗng cho mọi node." : "Create an empty adjacency list for every node.",
    "read-edge": vi ? "Đọc một cạnh vô hướng từ input." : "Read one undirected edge from input.",
    "append-forward": vi ? "Thêm chiều a → b vào adjacency list." : "Add direction a → b to the adjacency list.",
    "append-backward": vi ? "Thêm chiều b → a vì graph vô hướng." : "Add direction b → a because the graph is undirected.",
    "init-visited": vi ? "Khởi tạo visited để tránh lặp trong chu trình." : "Initialize visited to avoid cycles.",
    "start-dfs": vi ? "Gọi dfs(source) để bắt đầu tìm đường." : "Call dfs(source) to start searching.",
    "enter-call": vi ? "Một frame dfs mới được đặt lên call stack." : "A new dfs frame is pushed onto the call stack.",
    "destination-found": vi ? "node hiện tại chính là destination." : "The current node is the destination.",
    "not-destination": vi ? "Chưa tới đích, tiếp tục kiểm tra visited." : "Not at the destination yet; check visited next.",
    "already-visited": vi ? "Node đã thăm rồi, nhánh này trả False." : "This node was already visited; this branch returns False.",
    "not-visited": vi ? "Node chưa thăm, có thể mở rộng nhánh này." : "This node is unvisited; this branch can expand.",
    "mark-visited": vi ? "Đánh dấu node trước khi đi sang hàng xóm." : "Mark the node before exploring neighbors.",
    "iterate-neighbors": vi ? "Duyệt từng hàng xóm trong adj[node]." : "Iterate through adj[node].",
    "call-neighbor": vi ? "Gọi dfs(neighbor), call stack sâu thêm một tầng." : "Call dfs(neighbor); the call stack goes one level deeper.",
    "neighbor-false": vi ? "Nhánh vừa thử trả False, quay lại frame hiện tại." : "The tried branch returned False; return to the current frame.",
    "return-false-exhausted": vi ? "Hết hàng xóm mà không tới đích, trả False." : "No neighbor reaches the destination; return False.",
    "return-false-visited": vi ? "Gặp node đã thăm, trả False để chặn chu trình." : "Hit a visited node; return False to stop the cycle.",
    "return-true": vi ? "Tới destination, trả True." : "Reached destination; return True.",
    "bubble-true": vi ? "True lan ngược lên các frame cha." : "True bubbles back up through parent frames.",
    "done-true": vi ? "Có đường đi từ source tới destination." : "A path exists from source to destination.",
    "done-false": vi ? "Không có đường đi trong component của source." : "No path exists in source's component.",
  }[view.decision] || (vi ? "Theo dõi DFS đệ quy." : "Trace recursive DFS.");

  const returnClass = view.returnValue === true ? "true" : view.returnValue === false ? "false" : "";
  const returnLabel = view.returnValue === null || view.returnValue === undefined
    ? (vi ? "chưa return" : "no return yet")
    : String(view.returnValue);
  const summary = vi
    ? `DFS đệ quy từ ${source} tới ${destination}. Stack có ${callStack.length} frame.`
    : `Recursive DFS from ${source} to ${destination}. Stack has ${callStack.length} frame(s).`;

  $("treeView").innerHTML = `<section class="path1971-viz" aria-label="${escapeHtml(summary)}">
    <div class="path1971-phases">${phases}</div>
    <div class="path1971-layout">
      <div id="path1971Graph" class="path1971-graph"></div>
      <div class="path1971-state">
        <div class="path1971-head"><strong>call stack</strong><span>${vi ? "frame trên cùng đang chạy" : "top frame is running"}</span></div>
        <div class="path1971-stack">${stackHtml}</div>
        <div class="path1971-head"><strong>visited</strong><span>${visited.size}/${adj.length}</span></div>
        <div class="path1971-visited">${visitedHtml}</div>
      </div>
    </div>
    <div class="path1971-lower">
      <div class="path1971-adj">
        <div class="path1971-head"><strong>adjacency list</strong><span>${vi ? "hàng xóm của từng node" : "neighbors per node"}</span></div>
        <div>${adjHtml}</div>
      </div>
      <div class="path1971-decision ${returnClass}">
        <small>${vi ? "Bước hiện tại" : "Current step"}</small>
        <strong>${escapeHtml(decisionText)}</strong>
        <div>
          ${activeNode === null ? "" : `<span>node = ${escapeHtml(activeNode)}</span>`}
          ${activeNeighbor === null ? "" : `<span>nb = ${escapeHtml(activeNeighbor)}</span>`}
          <span>return = ${escapeHtml(returnLabel)}</span>
        </div>
      </div>
    </div>
  </section>`;
  renderGraph(step, "path1971Graph");
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

function renderOnlineElectionView(step) {
  const view = step.onlineElectionView;
  const el = $("treeView");
  const vi = lang === "vi";
  const queryAnswerStep = view.event === "return-query";
  const phaseIndex = view.phase === "done"
    ? 4
    : view.phase === "query"
      ? queryAnswerStep ? 3 : 2
      : ["store-leader", "preprocess-complete"].includes(view.event) ? 1 : 0;
  const phaseLabels = vi
    ? ["1 · Đếm phiếu", "2 · Lưu leader theo time", "3 · Binary search q(t)", "4 · Trả leader gần nhất"]
    : ["1 · Count votes", "2 · Save leader by time", "3 · Binary-search q(t)", "4 · Return latest leader"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const queryMode = view.phase === "query";
  const finalMode = view.phase === "done";
  const timeline = view.times.map((time, index) => {
    const tags = [];
    if (queryMode && index === view.left) tags.push("L");
    if (queryMode && view.right !== null && index === view.right - 1) tags.push("R−1");
    if (queryMode && index === view.mid) tags.push("M");
    if (index === view.answerIndex) tags.push(vi ? "đáp án" : "answer");
    let state = "future";
    if (finalMode) state = "processed";
    else if (!queryMode) {
      if (index < view.processedCount) state = "processed";
      if (index === view.voteIndex) state = "current";
    } else if (view.left === null || view.right === null) {
      state = "active";
    } else if (index < view.left) {
      state = "before";
    } else if (index >= view.right) {
      state = "after";
    } else {
      state = "active";
    }
    if (index === view.mid) state += " mid";
    if (index === view.answerIndex) state += " answer";
    const storedLeader = queryMode || finalMode
      ? view.leaders[index]
      : index < view.storedLeaders.length ? view.storedLeaders[index] : null;
    return `<div class="election-point ${state}">
      <small>${escapeHtml(tags.join(" · ") || `i=${index}`)}</small>
      <strong>t=${time}</strong>
      <span>${vi ? "phiếu" : "vote"}: P${view.persons[index]}</span>
      <b>${storedLeader === null || storedLeader === undefined ? "leader: ?" : `leader: P${storedLeader}`}</b>
    </div>`;
  }).join("");
  const sentinel = queryMode
    ? `<div class="election-sentinel${view.left === view.times.length ? " pointer" : ""}"><small>${view.left === view.times.length ? "L" : ""}</small><strong>n=${view.times.length}</strong><span>${vi ? "biên phải" : "right edge"}</span></div>`
    : "";

  const scoreCards = view.scores.map((item) => {
    const isLeader = item.person === view.currentLeader;
    const isCurrent = item.person === view.currentPerson;
    return `<span class="election-score${isLeader ? " leader" : ""}${isCurrent ? " current" : ""}"><small>P${item.person}${isLeader ? ` · ${vi ? "leader" : "leader"}` : ""}</small><strong>${item.votes}</strong><i>${vi ? "phiếu" : "votes"}</i></span>`;
  }).join("");

  const results = view.queries.map((query, index) => {
    const completed = index < view.completedQueries || finalMode;
    const active = index === view.queryIndex && !finalMode;
    return `<span class="election-query-chip${completed ? " done" : ""}${active ? " active" : ""}"><small>q(${query})</small><strong>${completed ? `P${view.answers[index]}` : active ? "…" : "?"}</strong></span>`;
  }).join("");

  let actionHtml;
  if (view.event === "constructor-call") {
    actionHtml = `<div class="election-action setup"><small>CONSTRUCTOR</small><strong>${vi ? "Duyệt phiếu theo thứ tự thời gian" : "Process votes chronologically"}</strong><span>${vi ? "Mỗi vị trí i sẽ lưu leader ngay sau phiếu tại times[i]" : "Each index i stores the leader immediately after the vote at times[i]"}</span></div>`;
  } else if (["store-times", "init-leaders", "init-votes", "init-leader"].includes(view.event)) {
    actionHtml = `<div class="election-action setup"><small>${vi ? "KHỞI TẠO" : "INITIALIZE"}</small><strong>${escapeHtml(step.title[lang] || step.title.en)}</strong><span>${vi ? "Chuẩn bị timeline, bảng đếm và leader hiện tại" : "Prepare the timeline, vote counts, and current leader"}</span></div>`;
  } else if (view.event === "read-vote") {
    actionHtml = `<div class="election-action vote"><small>${vi ? "ĐỌC PHIẾU" : "READ VOTE"}</small><strong>t=${view.times[view.voteIndex]} → P${view.currentPerson}</strong><span>${vi ? "Phiếu chưa được cộng ở bước này" : "The vote has not been counted yet"}</span></div>`;
  } else if (view.event === "count-vote") {
    actionHtml = `<div class="election-action vote"><small>${vi ? "CỘNG PHIẾU" : "COUNT VOTE"}</small><strong>P${view.currentPerson}: ${view.currentScore} ${vi ? "phiếu" : "vote(s)"}</strong><span>votes[P${view.currentPerson}] += 1</span></div>`;
  } else if (view.event === "compare-leader") {
    const relation = view.currentScore >= view.previousLeaderScore ? "≥" : "<";
    actionHtml = `<div class="election-action compare${view.tieBreak ? " tie" : ""}"><small>${view.tieBreak ? (vi ? "HÒA → PHIẾU MỚI NHẤT THẮNG" : "TIE → MOST RECENT WINS") : (vi ? "SO PHIẾU" : "COMPARE COUNTS")}</small><strong>${view.currentScore} ${relation} ${view.previousLeaderScore ?? 0}</strong><span>${view.tieBreak ? `P${view.currentPerson} ${vi ? "trở thành leader vì vừa nhận phiếu" : "becomes leader because this vote is most recent"}` : (vi ? "Dùng >= để xử lý trường hợp hòa" : "Use >= to handle ties")}</span></div>`;
  } else if (view.event === "set-leader") {
    actionHtml = `<div class="election-action leader"><small>${vi ? "CẬP NHẬT LEADER" : "UPDATE LEADER"}</small><strong>leader = P${view.currentLeader}</strong><span>${view.tieBreak ? (vi ? "Hòa phiếu; người vừa nhận phiếu thắng" : "Tied count; the latest vote wins") : (vi ? "Ứng viên này đang có số phiếu cao nhất" : "This candidate now has the highest count")}</span></div>`;
  } else if (view.event === "store-leader") {
    actionHtml = `<div class="election-action leader"><small>${vi ? "LƯU SNAPSHOT" : "SAVE SNAPSHOT"}</small><strong>leaders[${view.voteIndex}] = P${view.currentLeader}</strong><span>time ${view.times[view.voteIndex]} → leader P${view.currentLeader}</span></div>`;
  } else if (view.event === "preprocess-complete") {
    actionHtml = `<div class="election-action ready"><small>${vi ? "TIỀN XỬ LÝ XONG" : "PREPROCESSING COMPLETE"}</small><strong>leaders = [${view.leaders.map((leader) => `P${leader}`).join(", ")}]</strong><span>${vi ? "Mỗi q(t) giờ chỉ cần tìm vị trí trên times" : "Each q(t) now only searches for a position in times"}</span></div>`;
  } else if (view.event === "query-call") {
    actionHtml = `<div class="election-action query"><small>${vi ? "TRUY VẤN" : "QUERY"}</small><strong>q(${view.queryTime})</strong><span>${vi ? `Tìm time đầu tiên > ${view.queryTime}, rồi lùi 1 vị trí` : `Find the first time > ${view.queryTime}, then step back once`}</span></div>`;
  } else if (view.event === "query-range") {
    actionHtml = `<div class="election-action query"><small>${vi ? "KHOẢNG NỬA MỞ" : "HALF-OPEN RANGE"}</small><strong>[L, R) = [${view.left}, ${view.right})</strong><span>${vi ? "R có thể bằng n và không phải index của phiếu" : "R may equal n and is not a vote index"}</span></div>`;
  } else if (view.event === "while-check") {
    actionHtml = `<div class="election-action condition ${view.whileResult ? "yes" : "no"}"><small>WHILE L &lt; R</small><strong>${view.left} &lt; ${view.right} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? "Khoảng vẫn còn vị trí cần kiểm tra" : "The range still has positions to inspect") : (vi ? "L là index đầu tiên có time > t" : "L is the first index with time > t")}</span></div>`;
  } else if (view.event === "compute-mid") {
    actionHtml = `<div class="election-action mid"><small>COMPUTE MID</small><strong>M=${view.mid} → times[M]=${view.times[view.mid]}</strong><span>${view.times[view.mid]} ${view.times[view.mid] <= view.queryTime ? "≤" : ">"} q=${view.queryTime}</span></div>`;
  } else if (view.event === "compare-time") {
    const moveLeft = view.times[view.mid] <= view.queryTime;
    actionHtml = `<div class="election-action compare ${moveLeft ? "past" : "future"}"><small>times[M] &lt;= t</small><strong>${view.times[view.mid]} ${moveLeft ? "≤" : ">"} ${view.queryTime}</strong><span>${moveLeft ? (vi ? "Phiếu này đã xảy ra; tìm time muộn hơn" : "This vote has happened; search later") : (vi ? "Phiếu này ở tương lai; giữ M và tìm bên trái" : "This vote is in the future; keep M and search left")}</span></div>`;
  } else if (view.event === "move-left") {
    actionHtml = `<div class="election-action move past"><small>${vi ? "BỎ PHẦN ĐÃ XẢY RA" : "REMOVE PAST PREFIX"}</small><strong>L = M + 1 = ${view.left}</strong><span>${vi ? "Mọi index ≤ M đều có time ≤ t" : "Every index ≤ M has time ≤ t"}</span></div>`;
  } else if (view.event === "else-branch") {
    actionHtml = `<div class="election-action compare future"><small>ELSE</small><strong>times[M] &gt; t</strong><span>${vi ? "Tiếp theo đặt R=M; không bỏ M" : "Next set R=M; do not remove M"}</span></div>`;
  } else if (view.event === "move-right") {
    actionHtml = `<div class="election-action move future"><small>${vi ? "GIỮ M, THU HẸP BÊN TRÁI" : "KEEP M, SHRINK LEFT"}</small><strong>R = M = ${view.right}</strong><span>${vi ? "M vẫn có thể là time đầu tiên > t" : "M may still be the first time > t"}</span></div>`;
  } else if (view.event === "return-query") {
    actionHtml = `<div class="election-action result"><small>${vi ? "LÙI MỘT VỊ TRÍ" : "STEP BACK ONCE"}</small><strong>L=${view.left} → L−1=${view.answerIndex}</strong><span>leaders[${view.answerIndex}] = P${view.leaders[view.answerIndex]}</span></div>`;
  } else {
    actionHtml = `<div class="election-action result"><small>${vi ? "HOÀN TẤT" : "COMPLETE"}</small><strong>[${view.answers.map((answer) => `P${answer}`).join(", ")}]</strong><span>${vi ? "Mỗi truy vấn dùng O(log n) sau O(n) tiền xử lý" : "Each query takes O(log n) after O(n) preprocessing"}</span></div>`;
  }

  const queryGuide = queryMode
    ? `<div class="election-query-guide"><span><small>${vi ? "MỤC TIÊU" : "GOAL"}</small><strong>${vi ? `time đầu tiên > ${view.queryTime}` : `first time > ${view.queryTime}`}</strong></span><i>→</i><span><small>${vi ? "LEADER CẦN TRẢ" : "LEADER TO RETURN"}</small><strong>${view.answerIndex === null ? `leaders[L−1]` : `leaders[${view.answerIndex}] = P${view.leaders[view.answerIndex]}`}</strong></span></div>`
    : "";
  const legendHtml = queryMode
    ? `<span><i class="before"></i>${vi ? "time ≤ query / đã bỏ" : "time ≤ query / removed"}</span><span><i class="active"></i>${vi ? "đang tìm" : "active"}</span><span><i class="after"></i>${vi ? "time > query" : "time > query"}</span><span><i class="answer"></i>${vi ? "leader được trả" : "returned leader"}</span>`
    : `<span><i class="before"></i>${vi ? "đã lưu leader" : "leader saved"}</span><span><i class="current"></i>${vi ? "phiếu hiện tại" : "current vote"}</span><span><i class="future"></i>${vi ? "chưa xử lý" : "not processed"}</span>`;

  el.innerHTML = `<div class="election-viz">
    <div class="election-phases">${phases}</div>
    <div class="election-summary">
      <span><small>${vi ? "PHIẾU ĐÃ LƯU" : "STORED VOTES"}</small><strong>${queryMode || finalMode ? view.times.length : view.processedCount} / ${view.times.length}</strong></span>
      <span><small>${vi ? "TRUY VẤN HIỆN TẠI" : "CURRENT QUERY"}</small><strong>${view.queryTime === null ? "—" : `q(${view.queryTime})`}</strong></span>
      <span><small>${vi ? "KHOẢNG [L,R)" : "RANGE [L,R)"}</small><strong>${view.left === null ? "—" : `[${view.left}, ${view.right})`}</strong></span>
    </div>
    <div class="election-timeline" role="img" aria-label="${escapeHtml(vi ? "Timeline phiếu và leader sau từng phiếu" : "Vote timeline and leader after each vote")}">${timeline}${sentinel}</div>
    <div class="election-legend">${legendHtml}</div>
    ${queryMode ? queryGuide : `<div class="election-scores"><small>${vi ? "BẢNG ĐẾM PHIẾU" : "VOTE COUNTS"}</small>${scoreCards}</div>`}
    ${actionHtml}
    <div class="election-queries"><small>${vi ? "KẾT QUẢ q(t)" : "q(t) RESULTS"}</small>${results}</div>
  </div>`;
}

function renderShipCapacityView(step) {
  const view = step.shipCapacityView;
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = { setup: 0, range: 1, simulate: 2, decision: 3, shrink: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Chọn khoảng capacity", "2 · Thử capacity giữa", "3 · Xếp hàng theo từng ngày", "4 · Giữ nửa đúng"]
    : ["1 · Set capacity range", "2 · Try middle capacity", "3 · Load packages by day", "4 · Keep the correct half"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const chosenCapacity = Number.isInteger(view.answer) ? view.answer : view.mid;
  const domainCount = view.initialHi - view.initialLo + 1;
  let capacities;
  if (domainCount <= 24) {
    capacities = Array.from({ length: domainCount }, (_, index) => view.initialLo + index);
  } else {
    capacities = [...new Set([
      view.initialLo,
      view.lo - 1,
      view.lo,
      view.mid,
      view.hi,
      view.hi + 1,
      view.initialHi,
      ...(view.tested || []).map((item) => item.capacity),
    ].filter((capacity) => Number.isInteger(capacity) && capacity >= view.initialLo && capacity <= view.initialHi))].sort((a, b) => a - b);
  }

  const capacityCells = capacities.map((capacity, index) => {
    const isAnswer = capacity === view.answer;
    const isMid = capacity === view.mid && !isAnswer;
    let zone = "active";
    if (view.event === "done") zone = capacity < view.answer ? "slow" : capacity > view.answer ? "works" : "answer";
    else if (capacity < view.lo) zone = "slow";
    else if (capacity > view.hi) zone = "works";
    const tested = (view.tested || []).find((item) => item.capacity === capacity);
    const gapBefore = index > 0 && capacity - capacities[index - 1] > 1;
    const labels = [
      isAnswer ? { text: vi ? "đáp án" : "answer", type: "is-answer" } : null,
      isMid ? { text: "mid", type: "is-mid" } : null,
      capacity === view.lo && capacity === view.hi
        ? { text: "lo = hi", type: "is-boundary" }
        : capacity === view.lo
          ? { text: "lo", type: "is-boundary" }
          : capacity === view.hi
            ? { text: "hi", type: "is-boundary" }
            : null,
    ].filter(Boolean);
    const labelHtml = labels.length
      ? labels.map((label) => `<span class="${label.type}">${escapeHtml(label.text)}</span>`).join("")
      : '<span aria-hidden="true">&nbsp;</span>';
    return `${gapBefore ? '<span class="koko-speed-gap">…</span>' : ""}<span class="koko-speed-cell ${zone}${isMid ? " mid" : ""}${isAnswer ? " answer" : ""}"><small class="ship-capacity-labels">${labelHtml}</small><strong>${capacity}</strong><em>${tested ? `${tested.neededDays}d` : ""}</em></span>`;
  }).join("");

  const waitingPackages = `<div class="ship-package-queue">${view.weights.map((weight, index) => `<span><small>#${index}</small><strong>${weight}</strong></span>`).join("")}</div>`;
  const scheduleRows = (view.schedule || []).map((day) => {
    const percentage = Math.min(100, (day.load / chosenCapacity) * 100);
    const packages = day.packages.map((pkg) => `<span class="ship-package" style="flex-grow:${Math.max(1, pkg.weight)}"><small>#${pkg.index}</small><strong>${pkg.weight}</strong></span>`).join("");
    return `<div class="ship-day-row">
      <span class="ship-day-label">${vi ? "Ngày" : "Day"} ${day.day}</span>
      <div class="ship-day-packages">${packages}</div>
      <div class="ship-load"><div><span style="width:${percentage}%"></span></div><strong>${day.load} / ${chosenCapacity}</strong></div>
    </div>`;
  }).join("");
  const scheduleHtml = Number.isInteger(chosenCapacity)
    ? `<div class="ship-days"><div class="ship-days-title"><strong>${vi ? "Xếp liên tiếp, giữ nguyên thứ tự" : "Load consecutively, preserving order"}</strong><span>capacity = ${chosenCapacity}</span></div>${scheduleRows}</div>`
    : `<div class="ship-days pending"><div class="ship-days-title"><strong>${vi ? "Hàng đợi kiện hàng" : "Package queue"}</strong><span>${vi ? "chưa chọn capacity" : "capacity not chosen"}</span></div>${waitingPackages}</div>`;

  const dayEquation = Number.isInteger(view.neededDays)
    ? `<div class="ship-days-equation"><span>${vi ? "Cần" : "Needs"}</span><strong>${view.neededDays} ${vi ? "ngày" : "days"}</strong><i>${view.neededDays <= view.days ? "≤" : ">"}</i><strong>${view.days} ${vi ? "ngày cho phép" : "allowed"}</strong><b class="${view.neededDays <= view.days ? "works" : "slow"}">${view.neededDays <= view.days ? (vi ? "CHỞ KỊP" : "FITS") : (vi ? "TÀU QUÁ NHỎ" : "TOO SMALL")}</b></div>`
    : "";

  let actionHtml;
  if (view.event === "init-range") {
    actionHtml = `<div class="koko-action setup"><small>${vi ? "CẬN AN TOÀN" : "SAFE BOUNDS"}</small><strong>max(weights) = ${view.initialLo} · sum(weights) = ${view.initialHi}</strong><span>${vi ? "Nhỏ hơn max: kiện nặng nhất không lên tàu · sum: chở tất cả trong 1 ngày" : "Below max: the heaviest package cannot fit · sum: ship everything in one day"}</span></div>`;
  } else if (view.event === "while-check") {
    actionHtml = `<div class="koko-action condition ${view.whileResult ? "yes" : "no"}"><small>WHILE lo &lt; hi</small><strong>${view.lo} &lt; ${view.hi} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? "Vẫn còn nhiều capacity cần phân biệt" : "Multiple capacities remain") : (vi ? "lo gặp hi: đã tìm biên khả thi đầu tiên" : "lo meets hi: first feasible capacity found")}</span></div>`;
  } else if (view.event === "compute-mid") {
    actionHtml = `<div class="koko-action mid"><small>COMPUTE MID</small><strong>(${view.lo} + ${view.hi}) // 2 = ${view.mid}</strong><span>${vi ? `Thử tàu có sức chứa ${view.mid}` : `Try a ship with capacity ${view.mid}`}</span></div>`;
  } else if (view.event === "calculate-days") {
    actionHtml = `<div class="koko-action count"><small>${vi ? "MÔ PHỎNG CHẤT HÀNG" : "SIMULATE LOADING"}</small><strong>needed_days = ${view.neededDays}</strong><span>${vi ? "Kiện tiếp theo không vừa thì bắt đầu ngày mới" : "Start a new day when the next package does not fit"}</span></div>`;
  } else if (view.event === "feasible-check") {
    actionHtml = `<div class="koko-action decision ${view.feasible ? "works" : "slow"}"><small>IF needed_days &lt;= days</small><strong>${view.neededDays} ${view.feasible ? "≤" : ">"} ${view.days} → ${view.feasible}</strong><span>${view.feasible ? (vi ? "capacity đủ; giữ mid và thử tàu nhỏ hơn" : "capacity works; keep mid and try smaller") : (vi ? "capacity quá nhỏ; mọi giá trị ≤ mid đều bị loại" : "capacity is too small; remove every value ≤ mid")}</span></div>`;
  } else if (view.event === "move-hi") {
    actionHtml = `<div class="koko-action move works"><small>${vi ? "GIỮ NỬA TRÁI" : "KEEP LEFT HALF"}</small><strong>hi = mid = ${view.mid}</strong><span>[${view.previousLo}, ${view.previousHi}] → [${view.lo}, ${view.hi}] · ${vi ? "giữ mid vì mid đang chở kịp" : "keep mid because it currently works"}</span></div>`;
  } else if (view.event === "else-branch") {
    actionHtml = `<div class="koko-action decision slow"><small>ELSE</small><strong>${view.neededDays} &gt; ${view.days}</strong><span>${vi ? "Điều kiện if sai; bước tiếp theo tăng lo" : "The if condition is false; increase lo next"}</span></div>`;
  } else if (view.event === "move-lo") {
    actionHtml = `<div class="koko-action move slow"><small>${vi ? "BỎ NỬA TRÁI" : "REMOVE LEFT HALF"}</small><strong>lo = mid + 1 = ${view.lo}</strong><span>[${view.previousLo}, ${view.previousHi}] → [${view.lo}, ${view.hi}] · ${vi ? `loại mọi capacity ≤ ${view.mid}` : `remove every capacity ≤ ${view.mid}`}</span></div>`;
  } else {
    const proof = view.smallerDays === null
      ? (vi ? `${view.answer}=max(weights), không thể dùng tàu nhỏ hơn` : `${view.answer}=max(weights), so no smaller ship can work`)
      : vi
        ? `C=${view.answer}: ${view.neededDays} ngày ≤ ${view.days} · C=${view.answer - 1}: ${view.smallerDays} ngày > ${view.days}`
        : `C=${view.answer}: ${view.neededDays}d ≤ ${view.days}d · C=${view.answer - 1}: ${view.smallerDays}d > ${view.days}d`;
    actionHtml = `<div class="koko-action result"><small>${vi ? "CHỨNG MINH NHỎ NHẤT" : "MINIMUM PROOF"}</small><strong>return ${view.answer}</strong><span>${proof}</span></div>`;
  }

  const testedHtml = (view.tested || []).length
    ? `<div class="koko-tested"><small>${vi ? "ĐÃ THỬ" : "TESTED"}</small>${view.tested.map((item) => `<span class="${item.feasible ? "works" : "slow"}">C=${item.capacity} → ${item.neededDays}d ${item.feasible ? "✓" : "✕"}</span>`).join("")}</div>`
    : "";
  const totalWeight = view.weights.reduce((sum, weight) => sum + weight, 0);

  el.innerHTML = `<div class="koko-speed-viz ship-capacity-viz">
    <div class="koko-phases">${phases}</div>
    <div class="koko-summary">
      <span><small>${vi ? "GIỚI HẠN" : "DEADLINE"}</small><strong>${view.days}d</strong></span>
      <span><small>${vi ? "KHOẢNG CAPACITY" : "CAPACITY RANGE"}</small><strong>[${view.lo}, ${view.hi}]</strong></span>
      <span><small>${vi ? "TỔNG KHỐI LƯỢNG" : "TOTAL WEIGHT"}</small><strong>${totalWeight}</strong></span>
    </div>
    <div class="koko-speed-line" role="img" aria-label="${escapeHtml(vi ? `Khoảng capacity đang tìm [${view.lo}, ${view.hi}]` : `Active capacity range [${view.lo}, ${view.hi}]`)}">${capacityCells}</div>
    <div class="koko-speed-legend"><span><i class="slow"></i>${vi ? "quá nhỏ / đã loại" : "too small / removed"}</span><span><i class="active"></i>${vi ? "đang tìm" : "active range"}</span><span><i class="works"></i>${vi ? "chở kịp" : "fits deadline"}</span></div>
    ${scheduleHtml}
    ${dayEquation}
    ${actionHtml}
    ${testedHtml}
  </div>`;
}

function renderKokoSpeedView(step) {
  const view = step.kokoSpeedView;
  const el = $("treeView");
  const vi = lang === "vi";
  const manualCeil = Number(view.approach) === 2;
  const lowerName = manualCeil ? "start" : "lo";
  const upperName = manualCeil ? "end" : "hi";
  const phaseIndex = { setup: 0, range: 1, hours: 2, decision: 3, shrink: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Chọn khoảng tốc độ", "2 · Thử tốc độ giữa", "3 · Tính giờ từng đống", "4 · Giữ nửa đúng"]
    : ["1 · Set speed range", "2 · Try middle speed", "3 · Count each pile's hours", "4 · Keep the correct half"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const chosenSpeed = Number.isInteger(view.answer) ? view.answer : view.mid;
  const activeRange = `[${view.lo}, ${view.hi}]`;
  const statusValue = view.totalHours === null
    ? (vi ? "chưa tính" : "not counted")
    : `${view.totalHours} / ${view.h} ${vi ? "giờ" : "hours"}`;

  const domainCount = view.initialHi - view.initialLo + 1;
  let speedValues;
  if (domainCount <= 24) {
    speedValues = Array.from({ length: domainCount }, (_, index) => view.initialLo + index);
  } else {
    speedValues = [...new Set([
      view.initialLo,
      view.lo - 1,
      view.lo,
      view.mid,
      view.hi,
      view.hi + 1,
      view.initialHi,
      ...(view.tested || []).map((item) => item.speed),
    ].filter((value) => Number.isInteger(value) && value >= view.initialLo && value <= view.initialHi))].sort((a, b) => a - b);
  }

  const speedCells = speedValues.map((speed, index) => {
    const isAnswer = speed === view.answer;
    const isMid = speed === view.mid && !isAnswer;
    let zone = "active";
    if (view.event === "done") zone = speed < view.answer ? "slow" : speed > view.answer ? "works" : "answer";
    else if (speed < view.lo) zone = "slow";
    else if (speed > view.hi) zone = "works";
    const tested = (view.tested || []).find((item) => item.speed === speed);
    const gapBefore = index > 0 && speed - speedValues[index - 1] > 1;
    const labels = [
      isAnswer ? { text: vi ? "đáp án" : "answer", type: "is-answer" } : null,
      isMid ? { text: "mid", type: "is-mid" } : null,
      speed === view.lo && speed === view.hi
        ? { text: `${lowerName}=${upperName}`, type: "is-boundary" }
        : speed === view.lo
          ? { text: lowerName, type: "is-boundary" }
          : speed === view.hi
            ? { text: upperName, type: "is-boundary" }
            : null,
    ].filter(Boolean);
    const labelHtml = labels.length
      ? labels.map((label) => `<span class="${label.type}">${escapeHtml(label.text)}</span>`).join("")
      : '<span aria-hidden="true">&nbsp;</span>';
    const hours = tested ? `${tested.hours}h` : "";
    return `${gapBefore ? '<span class="koko-speed-gap">…</span>' : ""}<span class="koko-speed-cell ${zone}${isMid ? " mid" : ""}${isAnswer ? " answer" : ""}"><small class="koko-speed-labels">${labelHtml}</small><strong>${speed}</strong><em>${hours}</em></span>`;
  }).join("");

  const perPile = view.perPile || [];
  const pileRows = view.piles.map((pile, index) => {
    const detail = perPile[index];
    if (!detail || !Number.isInteger(chosenSpeed)) {
      return `<div class="koko-pile-row"><span class="koko-pile-id">${vi ? "Đống" : "Pile"} ${index + 1}</span><strong>${pile} 🍌</strong><span class="koko-pile-wait">${vi ? "chờ chọn tốc độ" : "waiting for a speed"}</span></div>`;
    }
    const visibleHours = Math.min(detail.hours, 10);
    const hourChips = Array.from({ length: visibleHours }, (_, hourIndex) => {
      const eaten = hourIndex < detail.hours - 1 || detail.remainder === 0 ? chosenSpeed : detail.remainder;
      return `<span>${Math.min(eaten, pile)}<small>h${hourIndex + 1}</small></span>`;
    }).join("");
    const extra = detail.hours > visibleHours ? `<b>+${detail.hours - visibleHours}</b>` : "";
    return `<div class="koko-pile-row">
      <span class="koko-pile-id">${vi ? "Đống" : "Pile"} ${index + 1}</span>
      <strong>${pile} 🍌</strong>
      <div class="koko-hour-chips" aria-label="${escapeHtml(`${detail.hours} hours`)}">${hourChips}${extra}</div>
      <code>${manualCeil ? `${pile} // ${chosenSpeed}${detail.remainder === 0 ? "" : " + 1"}` : `ceil(${pile} / ${chosenSpeed})`} = ${detail.hours}h</code>
    </div>`;
  }).join("");

  const hourEquation = perPile.length
    ? `<div class="koko-hours-equation"><span>${perPile.map((item) => item.hours).join(" + ")}</span><i>=</i><strong>${view.totalHours}</strong><i>${view.totalHours <= view.h ? "≤" : ">"}</i><strong>h = ${view.h}</strong><b class="${view.totalHours <= view.h ? "works" : "slow"}">${view.totalHours <= view.h ? (vi ? "KỊP" : "WORKS") : (vi ? "QUÁ CHẬM" : "TOO SLOW")}</b></div>`
    : `<div class="koko-hours-equation pending"><span>${manualCeil
      ? (vi ? "Chọn mid, rồi dùng % và // để làm tròn từng đống" : "Choose mid, then use % and // to round each pile up")
      : (vi ? "Chọn mid rồi tính ceil(pile / mid) cho từng đống" : "Choose mid, then compute ceil(pile / mid) for every pile")}</span></div>`;

  let actionHtml;
  if (view.event === "init-range") {
    actionHtml = `<div class="koko-action setup"><small>${vi ? "KHOẢNG BAN ĐẦU" : "INITIAL RANGE"}</small><strong>${lowerName} = 1 · ${upperName} = max(piles) = ${view.initialHi}</strong><span>${vi ? `${upperName} luôn đủ nhanh: mỗi đống chỉ cần 1 giờ` : `${upperName} is guaranteed fast enough: every pile takes one hour`}</span></div>`;
  } else if (view.event === "while-check") {
    actionHtml = `<div class="koko-action condition ${view.whileResult ? "yes" : "no"}"><small>WHILE ${lowerName} &lt; ${upperName}</small><strong>${view.lo} &lt; ${view.hi} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? "Còn nhiều tốc độ cần phân biệt" : "Multiple candidate speeds remain") : (vi ? `${lowerName} gặp ${upperName}: đây là tốc độ khả thi đầu tiên` : `${lowerName} meets ${upperName}: this is the first feasible speed`)}</span></div>`;
  } else if (view.event === "compute-mid") {
    actionHtml = `<div class="koko-action mid"><small>COMPUTE MID</small><strong>(${view.lo} + ${view.hi}) // 2 = ${view.mid}</strong><span>${vi ? `Thử ăn ${view.mid} quả/giờ` : `Try eating ${view.mid} bananas/hour`}</span></div>`;
  } else if (view.event === "calculate-hours") {
    actionHtml = `<div class="koko-action count"><small>${vi ? "TÍNH TỔNG GIỜ" : "COUNT TOTAL HOURS"}</small><strong>hours = ${view.totalHours}</strong><span>${manualCeil ? (vi ? "Chia hết: pile // mid · Có dư: pile // mid + 1" : "Divisible: pile // mid · Remainder: pile // mid + 1") : (vi ? "Mỗi đống làm tròn lên riêng biệt bằng math.ceil" : "Round each pile up separately with math.ceil")}</span></div>`;
  } else if (view.event === "feasible-check") {
    actionHtml = `<div class="koko-action decision ${view.feasible ? "works" : "slow"}"><small>${manualCeil ? "IF hours &gt; h" : "IF hours &lt;= h"}</small><strong>${manualCeil ? `${view.totalHours} > ${view.h} → ${!view.feasible}` : `${view.totalHours} ${view.feasible ? "≤" : ">"} ${view.h} → ${view.feasible}`}</strong><span>${view.feasible ? (vi ? `mid kịp giờ; giữ mid bằng ${upperName} = mid` : `mid works; keep it with ${upperName} = mid`) : (vi ? `mid quá chậm; tăng ${lowerName} = mid + 1` : `mid is too slow; increase ${lowerName} = mid + 1`)}</span></div>`;
  } else if (view.event === "move-hi") {
    actionHtml = `<div class="koko-action move works"><small>${vi ? "GIỮ NỬA TRÁI" : "KEEP LEFT HALF"}</small><strong>${upperName} = mid = ${view.mid}</strong><span>[${view.previousLo}, ${view.previousHi}] → [${view.lo}, ${view.hi}] · ${vi ? "không bỏ mid vì mid có thể là đáp án" : "do not remove mid because it may be the answer"}</span></div>`;
  } else if (view.event === "else-branch") {
    actionHtml = manualCeil
      ? `<div class="koko-action decision works"><small>ELSE</small><strong>${view.totalHours} ≤ ${view.h}</strong><span>${vi ? `Kịp giờ; tiếp theo đặt ${upperName} = mid` : `On time; set ${upperName} = mid next`}</span></div>`
      : `<div class="koko-action decision slow"><small>ELSE</small><strong>${view.totalHours} &gt; ${view.h}</strong><span>${vi ? "Điều kiện if sai; tiếp theo tăng lo" : "The if condition is false; increase lo next"}</span></div>`;
  } else if (view.event === "move-lo") {
    actionHtml = `<div class="koko-action move slow"><small>${vi ? "BỎ NỬA TRÁI" : "REMOVE LEFT HALF"}</small><strong>${lowerName} = mid + 1 = ${view.lo}</strong><span>[${view.previousLo}, ${view.previousHi}] → [${view.lo}, ${view.hi}] · ${vi ? `loại mọi tốc độ ≤ ${view.mid}` : `remove every speed ≤ ${view.mid}`}</span></div>`;
  } else {
    const proof = view.answer === 1
      ? (vi ? `1 là tốc độ nhỏ nhất có thể và chỉ cần ${view.totalHours} giờ` : `1 is the smallest possible speed and needs only ${view.totalHours} hours`)
      : `${view.answer}: ${view.totalHours}h ≤ ${view.h}h · ${view.answer - 1}: ${view.slowerHours}h > ${view.h}h`;
    actionHtml = `<div class="koko-action result"><small>${vi ? "CHỨNG MINH NHỎ NHẤT" : "MINIMUM PROOF"}</small><strong>return ${lowerName} = ${view.answer}</strong><span>${proof}</span></div>`;
  }

  const testedHtml = (view.tested || []).length
    ? `<div class="koko-tested"><small>${vi ? "ĐÃ THỬ" : "TESTED"}</small>${view.tested.map((item) => `<span class="${item.feasible ? "works" : "slow"}">k=${item.speed} → ${item.hours}h ${item.feasible ? "✓" : "✕"}</span>`).join("")}</div>`
    : "";

  el.innerHTML = `<div class="koko-speed-viz">
    <div class="koko-phases">${phases}</div>
    <div class="koko-summary">
      <span><small>${vi ? "GIỚI HẠN" : "TIME LIMIT"}</small><strong>${view.h}h</strong></span>
      <span><small>${vi ? "KHOẢNG TỐC ĐỘ" : "SPEED RANGE"}</small><strong>${activeRange}</strong></span>
      <span><small>${vi ? "TỔNG GIỜ" : "TOTAL TIME"}</small><strong>${statusValue}</strong></span>
    </div>
    <div class="koko-speed-line" role="img" aria-label="${escapeHtml(vi ? `Khoảng tốc độ đang tìm ${activeRange}` : `Active speed range ${activeRange}`)}">${speedCells}</div>
    <div class="koko-speed-legend"><span><i class="slow"></i>${vi ? "quá chậm / đã loại" : "too slow / removed"}</span><span><i class="active"></i>${vi ? "đang tìm" : "active range"}</span><span><i class="works"></i>${vi ? "đủ nhanh" : "fast enough"}</span></div>
    <div class="koko-piles"><div class="koko-piles-title"><strong>${vi ? "Mỗi đống mất bao nhiêu giờ?" : "How many hours does each pile take?"}</strong><span>${Number.isInteger(chosenSpeed) ? `speed = ${chosenSpeed} 🍌/h` : "speed = ?"}</span></div>${pileRows}</div>
    ${hourEquation}
    ${actionHtml}
    ${testedHtml}
  </div>`;
}

function renderSqrtBinaryView(step) {
  const view = step.sqrtBinaryView;
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = { setup: 0, range: 1, compare: 2, shrink: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Tạo [lo, hi]", "2 · Kiểm tra while / mid", "3 · So mid² với x", "4 · Thu hẹp / trả về"]
    : ["1 · Build [lo, hi]", "2 · Check while / mid", "3 · Compare mid² to x", "4 · Shrink / return"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const baseCase = view.event === "base-case";
  const domainLo = baseCase ? 0 : view.initialLo;
  const domainHi = Math.max(baseCase ? 1 : view.initialHi, domainLo);
  const candidateCount = domainHi - domainLo + 1;
  const graphWidth = 680;
  const graphHeight = 285;
  const plotLeft = 70;
  const plotRight = graphWidth - 60;
  const axisY = 105;
  const bucketWidth = (plotRight - plotLeft) / Math.max(1, candidateCount);

  function centerX(value) {
    return plotLeft + (value - domainLo + 0.5) * bucketWidth;
  }

  function edgeX(value) {
    return plotLeft + (value - domainLo) * bucketWidth;
  }

  function segment(from, to, className) {
    const left = Math.max(domainLo, from);
    const right = Math.min(domainHi, to);
    if (left > right) return "";
    return `<rect class="sqrt-zone ${className}" x="${edgeX(left)}" y="${axisY - 18}" width="${edgeX(right + 1) - edgeX(left)}" height="36" rx="7"></rect>`;
  }

  const confirmedEnd = baseCase ? view.answer : Math.min(domainHi, view.lo - 1);
  const rejectedStart = baseCase ? domainHi + 1 : Math.max(domainLo, view.hi + 1);
  const activeFrom = Math.max(domainLo, view.lo);
  const activeTo = Math.min(domainHi, view.hi);
  const zones = baseCase
    ? segment(view.answer, view.answer, "answer")
    : `${segment(domainLo, confirmedEnd, "confirmed")}${segment(activeFrom, activeTo, "active")}${segment(rejectedStart, domainHi, "rejected")}`;

  let tickValues;
  if (candidateCount <= 16) {
    tickValues = Array.from({ length: candidateCount }, (_, index) => domainLo + index);
  } else {
    tickValues = [...new Set([
      domainLo,
      domainHi,
      view.lo,
      view.hi,
      view.mid,
      view.answer,
    ].filter((value) => Number.isInteger(value) && value >= domainLo && value <= domainHi))].sort((a, b) => a - b);
  }
  const ticks = tickValues.map((value) => `<g class="sqrt-tick${value === view.answer ? " answer" : ""}">
    <line x1="${centerX(value)}" y1="${axisY - 23}" x2="${centerX(value)}" y2="${axisY + 23}"></line>
    <text class="value" x="${centerX(value)}" y="${axisY + 43}">${value}</text>
    ${candidateCount <= 12 ? `<text class="square" x="${centerX(value)}" y="${axisY + 68}">${value}²=${value * value}</text>` : ""}
  </g>`).join("");

  let markers = "";
  if (!baseCase) {
    if (view.lo === view.hi && view.lo >= domainLo && view.lo <= domainHi) {
      markers += `<g class="sqrt-pointer both"><line x1="${centerX(view.lo)}" y1="${axisY + 20}" x2="${centerX(view.lo)}" y2="${axisY + 27}"></line><line x1="${centerX(view.lo)}" y1="${axisY + 79}" x2="${centerX(view.lo)}" y2="${axisY + 116}"></line><text x="${centerX(view.lo)}" y="${axisY + 140}">lo = hi = ${view.lo}</text></g>`;
    } else {
      if (view.lo >= domainLo && view.lo <= domainHi + 1) {
        const loX = view.lo > domainHi ? plotRight + 12 : centerX(view.lo);
        markers += `<g class="sqrt-pointer lo"><line x1="${loX}" y1="${axisY + 20}" x2="${loX}" y2="${axisY + 27}"></line><line x1="${loX}" y1="${axisY + 79}" x2="${loX}" y2="${axisY + 88}"></line><text x="${loX}" y="${axisY + 110}">lo=${view.lo}</text></g>`;
      }
      if (view.hi >= domainLo - 1 && view.hi <= domainHi) {
        const hiX = view.hi < domainLo ? plotLeft - 12 : centerX(view.hi);
        markers += `<g class="sqrt-pointer hi"><line x1="${hiX}" y1="${axisY + 20}" x2="${hiX}" y2="${axisY + 27}"></line><line x1="${hiX}" y1="${axisY + 79}" x2="${hiX}" y2="${axisY + 118}"></line><text x="${hiX}" y="${axisY + 142}">hi=${view.hi}</text></g>`;
      }
    }
  }
  if (Number.isInteger(view.mid)) {
    markers += `<g class="sqrt-pointer mid"><line x1="${centerX(view.mid)}" y1="${axisY - 20}" x2="${centerX(view.mid)}" y2="${axisY - 62}"></line><path d="M ${centerX(view.mid) - 8} ${axisY - 61} L ${centerX(view.mid) + 8} ${axisY - 61} L ${centerX(view.mid)} ${axisY - 48} Z"></path><text x="${centerX(view.mid)}" y="${axisY - 72}">mid=${view.mid} · ${view.mid}²=${view.square}</text></g>`;
  }

  const axisLabel = vi
    ? `Binary search các số nguyên từ ${domainLo} đến ${domainHi}; vùng xanh lá đã xác nhận nhỏ, vùng xanh dương đang tìm, vùng đỏ quá lớn.`
    : `Binary search over integers ${domainLo} through ${domainHi}; green is confirmed low, blue is active, and red is too large.`;
  const rangeSvg = `<svg class="sqrt-range-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(axisLabel)}">
    ${zones}<line class="sqrt-axis" x1="${plotLeft}" y1="${axisY}" x2="${plotRight}" y2="${axisY}"></line>${ticks}${markers}
  </svg>`;

  let actionHtml;
  if (view.event === "base-case") {
    actionHtml = `<div class="sqrt-action result"><small>BASE CASE</small><strong>x = ${view.x} &lt; 2</strong><b>return ${view.answer}</b></div>`;
  } else if (view.event === "init-range") {
    actionHtml = `<div class="sqrt-action setup"><small>${vi ? "KHOẢNG BAN ĐẦU" : "INITIAL RANGE"}</small><strong>[1, x // 2]</strong><b>[${view.lo}, ${view.hi}]</b><span>${vi ? "Đáp án không thể lớn hơn x // 2 khi x ≥ 2" : "For x ≥ 2, the answer cannot exceed x // 2"}</span></div>`;
  } else if (view.event === "while-check") {
    actionHtml = `<div class="sqrt-action condition ${view.whileResult ? "yes" : "no"}"><small>WHILE CONDITION</small><strong>${view.lo} ≤ ${view.hi} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? "Khoảng còn ứng viên" : "Candidates remain") : (vi ? "lo đã vượt hi; chuyển tới return hi" : "lo crossed hi; proceed to return hi")}</span></div>`;
  } else if (view.event === "compute-mid") {
    actionHtml = `<div class="sqrt-action mid"><small>COMPUTE MID</small><strong>(${view.lo} + ${view.hi}) // 2 = ${view.mid}</strong><b>${view.mid}² = ${view.square}</b></div>`;
  } else if (view.event === "exact-check") {
    const exact = view.comparison === "equal";
    actionHtml = `<div class="sqrt-action compare ${exact ? "exact" : "not-exact"}"><small>EXACT?</small><strong>${view.square} ${exact ? "=" : "≠"} ${view.x}</strong><b>${exact ? `return ${view.mid}` : (vi ? "Tiếp tục so sánh" : "Continue comparing")}</b></div>`;
  } else if (view.event === "move-lo") {
    actionHtml = `<div class="sqrt-action move right"><small>${view.square} &lt; ${view.x}</small><strong>lo = mid + 1 = ${view.lo}</strong><b>[${view.previousLo}..${view.mid}] → ${vi ? "tìm bên phải" : "search right"}</b><span>${vi ? `mid=${view.mid} là ứng viên floor đã xác nhận` : `mid=${view.mid} is a confirmed floor candidate`}</span></div>`;
  } else if (view.event === "move-hi") {
    actionHtml = `<div class="sqrt-action move left"><small>${view.square} &gt; ${view.x}</small><strong>hi = mid - 1 = ${view.hi}</strong><b>[${view.mid}..${view.previousHi}] → ${vi ? "loại vì quá lớn" : "remove as too large"}</b></div>`;
  } else {
    actionHtml = `<div class="sqrt-action result"><small>${vi ? "CHỨNG MINH FLOOR" : "FLOOR PROOF"}</small><strong>${view.answer}² ≤ ${view.x} &lt; ${view.answer + 1}²</strong><b>${view.answer * view.answer} ≤ ${view.x} &lt; ${(view.answer + 1) * (view.answer + 1)}</b><span>return hi = ${view.answer}</span></div>`;
  }

  const rangeText = baseCase ? "—" : view.lo <= view.hi ? `[${view.lo}, ${view.hi}]` : "∅";
  const bestConfirmed = baseCase ? view.answer : view.answer ?? Math.max(1, view.lo - 1);
  const equation = Number.isInteger(view.mid)
    ? `<div class="sqrt-equation ${view.comparison || "pending"}"><span><small>mid</small><strong>${view.mid}</strong></span><i>→</i><span><small>mid²</small><strong>${view.square}</strong></span><i>${view.comparison === "less" ? "<" : view.comparison === "greater" ? ">" : view.comparison === "equal" ? "=" : "?"}</i><span><small>x</small><strong>${view.x}</strong></span></div>`
    : "";

  el.innerHTML = `<div class="sqrt-binary-viz">
    <div class="sqrt-phases">${phases}</div>
    <div class="sqrt-summary">
      <span><small>TARGET x</small><strong>${view.x}</strong></span>
      <span><small>${vi ? "KHOẢNG ĐANG TÌM" : "ACTIVE RANGE"}</small><strong>${rangeText}</strong></span>
      <span><small>${vi ? "ỨNG VIÊN ĐÃ XÁC NHẬN" : "CONFIRMED CANDIDATE"}</small><strong>${bestConfirmed ?? "—"}</strong></span>
    </div>
    <div class="sqrt-chart">${rangeSvg}<div class="sqrt-legend"><span><i class="confirmed"></i>${vi ? "đã tìm bên phải" : "searched right"}</span><span><i class="active"></i>${vi ? "đang tìm" : "active"}</span><span><i class="rejected"></i>${vi ? "quá lớn" : "too large"}</span></div></div>
    ${equation}
    ${actionHtml}
  </div>`;
}

function renderHistogramRectangleView(step) {
  const view = step.histogramRectangleView;
  const el = $("treeView");
  const vi = lang === "vi";
  const bars = view.bars || [];
  const n = view.originalLength || 0;
  const phaseIndex = { setup: 0, scan: 0, stack: 1, area: 2, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Đọc cột i", "2 · Pop khi top ≥ current", "3 · Tính width × height", "4 · Cập nhật max_area"]
    : ["1 · Read bar i", "2 · Pop while top ≥ current", "3 · Compute width × height", "4 · Update max_area"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    const icon = state === "done" ? "✓" : state === "active" ? "▶" : "○";
    return `<span class="${state}">${icon} ${escapeHtml(label)}</span>`;
  }).join("");

  const graphWidth = Math.max(620, bars.length * 82 + 90);
  const graphHeight = 330;
  const plotLeft = 55;
  const plotRight = graphWidth - 35;
  const baseline = 245;
  const plotHeight = 165;
  const cellWidth = (plotRight - plotLeft) / Math.max(1, bars.length);
  const barWidth = Math.min(58, cellWidth * 0.68);
  const maxHeight = Math.max(1, ...bars);
  const stackSet = new Set(view.stack || []);
  const best = view.bestRect;
  const hasCandidate = Number.isInteger(view.leftBoundary)
    && Number.isInteger(view.rightBoundary)
    && view.rightBoundary >= view.leftBoundary
    && Number.isFinite(view.candidateHeight);

  function centerX(index) {
    return plotLeft + (index + 0.5) * cellWidth;
  }

  function rectForRange(left, right, height) {
    const x = centerX(left) - cellWidth / 2 + 4;
    const width = Math.max(2, (right - left + 1) * cellWidth - 8);
    const scaledHeight = height === 0 ? 2 : (height / maxHeight) * plotHeight;
    return { x, y: baseline - scaledHeight, width, height: scaledHeight };
  }

  let rangeSvg = "";
  if (best && view.event !== "done") {
    const rect = rectForRange(best.left, best.right, best.height);
    rangeSvg += `<rect class="hist-best-rect" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="5"></rect>`;
  }
  if (hasCandidate) {
    const rect = rectForRange(view.leftBoundary, view.rightBoundary, view.candidateHeight);
    const candidateClass = view.event === "done" ? "hist-final-rect" : "hist-candidate-rect";
    rangeSvg += `<rect class="${candidateClass}" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="5"></rect>`;
    const x1 = centerX(view.leftBoundary) - cellWidth / 2 + 7;
    const x2 = centerX(view.rightBoundary) + cellWidth / 2 - 7;
    rangeSvg += `<line class="hist-width-line" x1="${x1}" y1="${baseline + 34}" x2="${x2}" y2="${baseline + 34}"></line>
      <line class="hist-width-tick" x1="${x1}" y1="${baseline + 27}" x2="${x1}" y2="${baseline + 41}"></line>
      <line class="hist-width-tick" x1="${x2}" y1="${baseline + 27}" x2="${x2}" y2="${baseline + 41}"></line>
      <text class="hist-width-label" x="${(x1 + x2) / 2}" y="${baseline + 55}">${vi ? "rộng" : "width"} = ${view.width}</text>`;
  }

  const barsSvg = bars.map((height, index) => {
    const sentinel = index === view.sentinelIndex;
    const scaledHeight = height === 0 ? 2 : (height / maxHeight) * plotHeight;
    const x = centerX(index) - barWidth / 2;
    const y = baseline - scaledHeight;
    const classes = ["hist-bar"];
    if (sentinel) classes.push("sentinel");
    if (stackSet.has(index)) classes.push("in-stack");
    if (index === view.currentIndex) classes.push("current");
    if (index === view.poppedIndex) classes.push("popped");
    if (hasCandidate && index >= view.leftBoundary && index <= view.rightBoundary) classes.push("candidate-span");
    if (best && index >= best.left && index <= best.right) classes.push("best-span");
    const indexLabel = sentinel ? `S(${index})` : `[${index}]`;
    const stackMark = stackSet.has(index) ? `<text class="hist-stack-mark" x="${centerX(index)}" y="${Math.max(42, y - 27)}">STACK</text>` : "";
    const currentMark = index === view.currentIndex
      ? `<path class="hist-current-pointer" d="M ${centerX(index) - 8} 27 L ${centerX(index) + 8} 27 L ${centerX(index)} 39 Z"></path><text class="hist-current-label" x="${centerX(index)}" y="18">i</text>`
      : "";
    return `${currentMark}${stackMark}<g class="${classes.join(" ")}" aria-label="${sentinel ? "sentinel" : `bar ${index}`}, height ${height}">
      <rect x="${x}" y="${y}" width="${barWidth}" height="${scaledHeight}" rx="4"></rect>
      <text class="hist-height" x="${centerX(index)}" y="${Math.max(55, y - 8)}">${height}</text>
      <text class="hist-index" x="${centerX(index)}" y="${baseline + 20}">${indexLabel}</text>
    </g>`;
  }).join("");

  const chartLabel = vi
    ? "Histogram với cột hiện tại, các index trong stack và hình chữ nhật đang được tính."
    : "Histogram showing the current bar, stack indices, and rectangle being evaluated.";
  const chartSvg = `<svg class="histogram-rect-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(chartLabel)}">
    <line class="hist-baseline" x1="${plotLeft}" y1="${baseline}" x2="${plotRight}" y2="${baseline}"></line>
    ${barsSvg}${rangeSvg}
  </svg>`;

  const stackItems = (view.stack || []).length
    ? view.stack.map((index, position) => {
        const top = position === view.stack.length - 1;
        const sentinel = index === view.sentinelIndex;
        return `<span class="${top ? "top" : ""}"><small>${top ? "TOP" : `#${position + 1}`}</small><strong>${sentinel ? `S(${index})` : `index ${index}`}</strong><em>h = ${bars[index]}</em></span>`;
      }).join("<i>→</i>")
    : `<em class="hist-stack-empty">∅ ${vi ? "stack rỗng" : "empty stack"}</em>`;

  let actionHtml;
  if (view.event === "init-stack") {
    actionHtml = `<div class="hist-action rule"><small>STACK</small><strong>[]</strong><span>${vi ? "Lưu index theo chiều cao tăng nghiêm ngặt" : "Stores indices in strictly increasing height order"}</span></div>`;
  } else if (view.event === "init-max") {
    actionHtml = `<div class="hist-action rule"><small>MAXIMUM</small><strong>max_area = 0</strong><span>${vi ? "Chưa có candidate" : "No candidate yet"}</span></div>`;
  } else if (view.event === "add-sentinel") {
    actionHtml = `<div class="hist-action sentinel"><small>SENTINEL</small><strong>bars = heights + [0]</strong><span>${vi ? `Thêm S tại index ${view.sentinelIndex} để xả stack` : `Append S at index ${view.sentinelIndex} to flush the stack`}</span></div>`;
  } else if (view.event === "scan") {
    actionHtml = `<div class="hist-action scan"><small>${vi ? "CỘT HIỆN TẠI" : "CURRENT BAR"}</small><strong>i = ${view.currentIndex}</strong><b>bars[i] = ${view.currentHeight}</b><span>${view.currentIndex === view.sentinelIndex ? (vi ? "Sentinel bắt đầu xả stack" : "Sentinel starts flushing the stack") : (vi ? "So sánh với đỉnh stack" : "Compare with the stack top")}</span></div>`;
  } else if (view.event === "while-check") {
    const topIndex = view.poppedIndex;
    const expression = topIndex === null
      ? "stack is empty"
      : `${bars[topIndex]} ≥ ${view.currentHeight}`;
    actionHtml = `<div class="hist-action compare ${view.whileResult ? "yes" : "no"}"><small>WHILE CONDITION</small><strong>${escapeHtml(expression)} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? `Pop index ${topIndex}` : `Pop index ${topIndex}`) : (vi ? `Dừng pop và push index ${view.currentIndex}` : `Stop popping and push index ${view.currentIndex}`)}</span></div>`;
  } else if (view.event === "pop") {
    actionHtml = `<div class="hist-action pop"><small>POP</small><strong>top = ${view.poppedIndex}</strong><b>height = ${view.candidateHeight}</b><span>${vi ? `Biên phải độc quyền = i = ${view.currentIndex}` : `Exclusive right boundary = i = ${view.currentIndex}`}</span></div>`;
  } else if (view.event === "width") {
    const formula = view.leftBoundary === 0
      ? `width = i = ${view.width}`
      : `width = ${view.currentIndex} - ${view.leftBoundary - 1} - 1 = ${view.width}`;
    actionHtml = `<div class="hist-action width"><small>${vi ? "BIÊN HÌNH CHỮ NHẬT" : "RECTANGLE BOUNDS"}</small><strong>[${view.leftBoundary} .. ${view.rightBoundary}]</strong><b>${formula}</b><span>${vi ? "Hai biên chặn không thuộc hình chữ nhật" : "The blocking boundaries are excluded"}</span></div>`;
  } else if (view.event === "area") {
    const decision = view.improved
      ? (vi ? `${view.candidateArea} > ${view.previousMax} → UPDATE` : `${view.candidateArea} > ${view.previousMax} → UPDATE`)
      : (vi ? `${view.candidateArea} ≤ ${view.previousMax} → KEEP` : `${view.candidateArea} ≤ ${view.previousMax} → KEEP`);
    actionHtml = `<div class="hist-action area ${view.improved ? "improved" : "kept"}"><small>AREA</small><strong>${view.candidateHeight} × ${view.width} = ${view.candidateArea}</strong><b>${decision}</b><span>max_area = ${view.maxArea}</span></div>`;
  } else if (view.event === "push") {
    actionHtml = `<div class="hist-action push"><small>PUSH</small><strong>stack.append(${view.currentIndex})</strong><span>${view.currentIndex === view.sentinelIndex ? (vi ? "Stack cuối cùng chứa sentinel" : "The final stack contains the sentinel") : (vi ? "Đỉnh stack mới nằm bên phải" : "The new stack top is on the right")}</span></div>`;
  } else {
    actionHtml = `<div class="hist-action result"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>max_area = ${view.maxArea}</strong>${best ? `<b>[${best.left}..${best.right}] · h=${best.height} · w=${best.width}</b>` : ""}</div>`;
  }

  const bestHtml = best
    ? `<span><small>${vi ? "BEST RANGE" : "BEST RANGE"}</small><strong>[${best.left}..${best.right}]</strong></span>
       <span><small>HEIGHT × WIDTH</small><strong>${best.height} × ${best.width}</strong></span>
       <span><small>MAX AREA</small><strong>${best.area}</strong></span>`
    : `<span><small>${vi ? "BEST RANGE" : "BEST RANGE"}</small><strong>—</strong></span>
       <span><small>HEIGHT × WIDTH</small><strong>—</strong></span>
       <span><small>MAX AREA</small><strong>${view.maxArea}</strong></span>`;

  el.innerHTML = `<div class="histogram-rect-viz">
    <div class="hist-phases">${phases}</div>
    <div class="hist-best-summary">${bestHtml}</div>
    <div class="hist-chart">${chartSvg}
      <div class="hist-legend"><span><i class="current"></i>i</span><span><i class="stack"></i>stack</span><span><i class="candidate"></i>${vi ? "candidate" : "candidate"}</span><span><i class="best"></i>${vi ? "tốt nhất" : "best"}</span><span><i class="sentinel"></i>sentinel</span></div>
    </div>
    <div class="hist-detail-row">
      <div class="hist-stack-lane"><strong>MONOTONIC STACK <small>${vi ? "đáy → đỉnh" : "bottom → top"}</small></strong><div>${stackItems}</div></div>
      ${actionHtml}
    </div>
  </div>`;
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

function queueViewHtml(view, compact = false) {
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

  const streamHtml = stream.length ? `<div>
    <div class="stack-input-label">Incoming stream</div>
    <div class="stack-input-row">${streamItems}</div>
  </div>` : "";

  return `<div class="queue-viz${compact ? " queue-viz-compact" : ""}">
      <div class="queue-heading">${escapeHtml(String(view.title || "Queue"))}</div>
      <div class="queue-cells">${cells}</div>
      <div class="queue-status">${statusItems}</div>
      ${streamHtml}
    </div>`;
}

function renderQueueView(step) {
  $("treeView").innerHTML = queueViewHtml(step.queueView || {});
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

function renderSynonymSentenceView(step) {
  const view = step.synonymSentenceView || {};
  const vi = lang === "vi";
  const phases = vi
    ? ["Nối cặp", "Tạo nhóm", "Gắn lựa chọn", "Sinh câu"]
    : ["Union pairs", "Build groups", "Map choices", "Generate"];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const pairs = Array.isArray(view.pairs) ? view.pairs : [];
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const sentence = Array.isArray(view.sentence) ? view.sentence : [];
  const options = Array.isArray(view.options) ? view.options : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const completed = Array.isArray(view.completed) ? view.completed : [];
  const activeWords = new Set(Array.isArray(view.activeWords) ? view.activeWords : []);
  const activeWord = Number.isInteger(view.activeWord) ? view.activeWord : -1;
  const expected = Number.isFinite(view.expected) ? view.expected : 0;
  const originalWordLabel = vi ? "từ gốc" : "original word";
  const replacedWordLabel = vi ? "từ đã thay" : "replaced word";

  const phaseHtml = phases.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<div class="synonym-phase ${state}">
      <span>${index < phaseIndex ? "✓" : index + 1}</span>
      <strong>${escapeHtml(label)}</strong>
    </div>`;
  }).join("");

  const pairHtml = pairs.map((pair, index) => `<div class="synonym-pair-step ${escapeHtml(pair.state || "pending")}">
    <small>#${index + 1}</small>
    <span>${escapeHtml(pair.a)}</span>
    <b>↔</b>
    <span>${escapeHtml(pair.b)}</span>
  </div>`).join("");

  const groupsHtml = groups.length
    ? groups.map((group) => {
      const words = Array.isArray(group.words) ? group.words : [];
      const isActive = words.some((word) => activeWords.has(word));
      return `<div class="synonym-group${isActive ? " active" : ""}">
        <div class="synonym-group-root"><small>root</small><strong>${escapeHtml(group.root)}</strong></div>
        <div class="synonym-group-words">${words.map((word) => `<span class="${activeWords.has(word) ? "active" : ""}">${escapeHtml(word)}</span>`).join("")}</div>
      </div>`;
    }).join("")
    : `<div class="synonym-groups-empty"><code>groups = {}</code></div>`;

  const sentenceHtml = sentence.map((word, index) => {
    const choices = Array.isArray(options[index]) && options[index].length ? options[index] : [word];
    const hasChoice = choices.length > 1;
    const isChosen = index < prefix.length;
    const isActive = index === activeWord;
    const isPending = view.mode === "backtrack" && index >= prefix.length && !isActive;
    const shownWord = isChosen ? prefix[index] : word;
    const tileClass = [
      "synonym-word-slot",
      hasChoice ? "branch" : "fixed",
      isChosen ? "chosen" : "",
      isActive ? "active" : "",
      isPending ? "pending" : "",
    ].filter(Boolean).join(" ");
    return `<div class="${tileClass}">
      <div class="synonym-word-head"><small>[${index}]</small><span>${escapeHtml(word)}</span></div>
      <strong>${escapeHtml(shownWord)}</strong>
      <div class="synonym-word-options">${choices.map((choice) => {
        const selected = isChosen && prefix[index] === choice;
        const current = isActive && view.currentChoice === choice;
        return `<span class="${selected || current ? "selected" : ""}">${escapeHtml(choice)}</span>`;
      }).join("")}</div>
    </div>`;
  }).join("");

  const branchPositions = options
    .map((choices, index) => (Array.isArray(choices) && choices.length > 1 ? index : -1))
    .filter((index) => index >= 0);

  const dfsState = view.dfsState && typeof view.dfsState === "object" ? view.dfsState : null;
  const dfsEventLabels = vi
    ? {
      ready: "Sẵn sàng gọi dfs(0)", enter: "Vào hàm dfs", checkBase: "Kiểm tra base case",
      checkSynonym: "Kiểm tra từ có synonym", fixed: "Giữ nguyên từ cố định",
      choices: "Lấy danh sách synonym", iterate: "Vòng for chọn một nhánh",
      assign: "Gán từ vào câu", recurse: "Gọi dfs sâu hơn", append: "Thêm câu vào ans",
      return: "Return và backtrack", done: "DFS hoàn tất",
    }
    : {
      ready: "Ready to call dfs(0)", enter: "Enter dfs", checkBase: "Check base case",
      checkSynonym: "Check whether the word has synonyms", fixed: "Keep a fixed word",
      choices: "Read synonym choices", iterate: "For-loop selects a branch",
      assign: "Assign the word", recurse: "Recurse to the next index", append: "Append sentence to ans",
      return: "Return and backtrack", done: "DFS complete",
    };

  const dfsSection = phaseIndex >= 3 && dfsState
    ? (() => {
      const stack = Array.isArray(dfsState.callStack) ? dfsState.callStack : [];
      const workingWords = Array.isArray(dfsState.workingWords) ? dfsState.workingWords : sentence;
      const choices = Array.isArray(dfsState.choices) ? dfsState.choices : [];
      const exploredChoices = new Set(Array.isArray(dfsState.exploredChoices) ? dfsState.exploredChoices : []);
      const currentIndex = Number.isInteger(dfsState.currentIndex) ? dfsState.currentIndex : -1;
      const event = dfsState.event || "ready";
      const eventLabel = dfsEventLabels[event] || event;
      const stackHtml = stack.length
        ? stack.map((index, stackIndex) => `${stackIndex ? '<b aria-hidden="true">→</b>' : ""}<span class="${stackIndex === stack.length - 1 ? "active" : ""}">dfs(${index})</span>`).join("")
        : `<span class="empty">∅</span>`;
      const workingHtml = workingWords.map((word, index) => {
        const state = index === currentIndex ? "active" : index < currentIndex ? "processed" : "pending";
        const changed = sentence[index] !== word ? " changed" : "";
        return `<span class="synonym-dfs-word ${state}${changed}" aria-label="${escapeHtml(`[${index}] ${word}`)}"><small>[${index}]</small>${escapeHtml(word)}</span>`;
      }).join("");
      const choicesHtml = choices.length
        ? choices.map((choice) => {
          const isCurrent = dfsState.currentChoice === choice;
          const isExplored = exploredChoices.has(choice);
          const state = isCurrent ? "current" : isExplored ? "explored" : "pending";
          const marker = isCurrent ? "▶" : isExplored ? "✓" : "○";
          return `<span class="synonym-dfs-choice ${state}">${marker} ${escapeHtml(choice)}</span>`;
        }).join("")
        : `<span class="synonym-dfs-no-choices">${vi ? "Chưa đọc choices ở dòng 43–44" : "Choices are read at lines 43–44"}</span>`;

      return `<section class="synonym-dfs-section">
        <div class="synonym-section-heading">
          <strong>${vi ? "MÔ PHỎNG DFS / BACKTRACKING" : "DFS / BACKTRACKING SIMULATION"}</strong>
          <span>ind = ${currentIndex} / n = ${sentence.length}</span>
        </div>
        <div class="synonym-dfs-status">
          <div class="synonym-dfs-stack-block">
            <small>CALL STACK</small>
            <div class="synonym-dfs-stack">${stackHtml}</div>
          </div>
          <div class="synonym-dfs-event">
            <small>${vi ? "THAO TÁC HIỆN TẠI" : "CURRENT ACTION"}</small>
            <strong>${escapeHtml(eventLabel)}</strong>
          </div>
        </div>
        <div class="synonym-dfs-working">
          <small>${vi ? "WORDS ĐANG ĐƯỢC THAY ĐỔI TRỰC TIẾP" : "WORDS MUTATED IN PLACE"}</small>
          <div>${workingHtml}</div>
        </div>
        <div class="synonym-dfs-choices">
          <small>${vi ? "CÁC NHÁNH TẠI VỊ TRÍ HIỆN TẠI" : "BRANCHES AT THE CURRENT POSITION"}</small>
          <div>${choicesHtml}</div>
        </div>
      </section>`;
    })()
    : "";

  const decisionTreeSection = phaseIndex >= 3 && dfsState && branchPositions.length
    ? (() => {
      const completedEntries = completed.map((result, index) => {
        const resultWords = String(result).split(/\s+/).filter(Boolean);
        return { index, result, path: branchPositions.map((position) => resultWords[position]) };
      });
      const workingWords = Array.isArray(dfsState.workingWords) ? dfsState.workingWords : sentence;
      const currentIndex = Number.isInteger(dfsState.currentIndex) ? dfsState.currentIndex : -1;
      const eventUsesCurrentChoice = new Set(["iterate", "assign", "recurse", "return"]);
      const activePath = [];
      if (dfsState.event !== "done") {
        for (const position of branchPositions) {
          if (position < currentIndex) {
            activePath.push(workingWords[position]);
          } else if (position === currentIndex && dfsState.currentChoice && eventUsesCurrentChoice.has(dfsState.event)) {
            activePath.push(dfsState.currentChoice);
          } else {
            break;
          }
        }
      }

      const treePositions = [];
      let renderedLeafCount = 1;
      for (const position of branchPositions) {
        const nextLeafCount = renderedLeafCount * options[position].length;
        if (treePositions.length >= 3 || nextLeafCount > 24) break;
        treePositions.push(position);
        renderedLeafCount = nextLeafCount;
      }
      const truncated = treePositions.length < branchPositions.length;
      const pathStartsWith = (path, pathPrefix) => pathPrefix.every((choice, index) => path[index] === choice);
      const nodeHtml = (depth, pathPrefix) => {
        if (depth >= treePositions.length) return "";
        const position = treePositions[depth];
        const choices = Array.isArray(options[position]) ? options[position] : [];
        return `<ul>${choices.map((choice) => {
          const nextPrefix = [...pathPrefix, choice];
          const isCurrent = activePath.length >= nextPrefix.length && pathStartsWith(activePath, nextPrefix);
          const matchingCompleted = completedEntries.filter((entry) => pathStartsWith(entry.path, nextPrefix));
          const isExplored = matchingCompleted.length > 0;
          const state = isCurrent ? "current" : isExplored ? "explored" : "pending";
          const marker = isCurrent ? "▶" : isExplored ? "✓" : "○";
          const isLeaf = depth === treePositions.length - 1;
          const exactCompleted = !truncated && isLeaf
            ? matchingCompleted.find((entry) => entry.path.length === nextPrefix.length)
            : null;
          const leafLabel = exactCompleted
            ? `ans #${exactCompleted.index + 1}`
            : isLeaf ? (truncated ? (vi ? "còn nhánh…" : "more branches…") : (vi ? "câu" : "sentence")) : `[${position}]`;
          const accessibleLabel = exactCompleted
            ? `${choice}, ans ${exactCompleted.index + 1}: ${exactCompleted.result}`
            : `${choice}, ${state}`;
          return `<li>
            <div class="synonym-decision-node ${state}${isLeaf ? " leaf" : ""}" aria-label="${escapeHtml(accessibleLabel)}">
              <span aria-hidden="true">${marker}</span><strong>${escapeHtml(choice)}</strong><small>${escapeHtml(leafLabel)}</small>
            </div>
            ${nodeHtml(depth + 1, nextPrefix)}
          </li>`;
        }).join("")}</ul>`;
      };
      const branchLabels = treePositions.map((position, depth) => `${vi ? "Mức" : "Level"} ${depth + 1}: words[${position}]`).join(" · ");
      const rootState = dfsState.event === "done" ? "explored" : "current";
      const rootMarker = dfsState.event === "done" ? "✓" : "▶";

      return `<section class="synonym-decision-section">
        <div class="synonym-section-heading">
          <strong>DECISION TREE</strong>
          <span>${escapeHtml(branchLabels)}</span>
        </div>
        <div class="synonym-decision-legend">
          <span>▶ ${vi ? "đường đang duyệt" : "current path"}</span>
          <span>✓ ${vi ? "đã hoàn tất" : "completed"}</span>
          <span>○ ${vi ? "chưa duyệt" : "pending"}</span>
        </div>
        <div class="synonym-decision-tree" role="tree" aria-label="${vi ? "Cây quyết định sinh câu đồng nghĩa" : "Decision tree for synonym sentence generation"}">
          <ul><li>
            <div class="synonym-decision-node root ${rootState}"><span aria-hidden="true">${rootMarker}</span><strong>∅</strong><small>dfs(0)</small></div>
            ${nodeHtml(0, [])}
          </li></ul>
        </div>
        ${truncated ? `<div class="synonym-decision-note">${vi ? "Cây lớn: chỉ hiển thị 3 mức đầu, trace DFS vẫn mô phỏng đầy đủ." : "Large tree: showing the first 3 levels; the DFS trace remains complete."}</div>` : ""}
      </section>`;
    })()
    : "";

  const replaceablePositions = new Set(branchPositions);

  const renderResultSentence = (result) => String(result).split(/\s+/).filter(Boolean).map((word, index) => {
    if (!replaceablePositions.has(index)) {
      return `<span class="synonym-result-word">${escapeHtml(word)}</span>`;
    }
    const isOriginal = word === sentence[index];
    const state = isOriginal ? "original" : "replaced";
    const stateLabel = isOriginal ? originalWordLabel : replacedWordLabel;
    return `<span class="synonym-result-word replaceable ${state}" title="${escapeHtml(stateLabel)}" aria-label="${escapeHtml(`${word}: ${stateLabel}`)}">${escapeHtml(word)}</span>`;
  }).join(" ");

  const resultsHtml = completed.length
    ? completed.map((result, index) => `<div class="synonym-result-item${index === completed.length - 1 && view.mode !== "result" ? " newest" : ""}">
      <small class="synonym-result-index">${index + 1}</small><span class="synonym-result-sentence">${renderResultSentence(result)}</span>
    </div>`).join("")
    : `<div class="synonym-results-empty">${vi ? "Chưa có câu hoàn chỉnh" : "No completed sentence yet"}</div>`;

  const sentenceSection = phaseIndex >= 2
    ? `<section class="synonym-sentence-section">
        <div class="synonym-section-heading">
          <strong>${vi ? "CÂU VÀ LỰA CHỌN" : "SENTENCE CHOICES"}</strong>
          <span>${vi ? "ô xanh = có thể thay thế" : "green = replaceable"}</span>
        </div>
        <div class="synonym-sentence-grid">${sentenceHtml}</div>
      </section>`
    : "";

  const resultsSection = phaseIndex >= 3
    ? `<section class="synonym-results-section">
        <div class="synonym-section-heading">
          <strong>ans</strong>
          <span>${completed.length} / ${expected} ${vi ? "câu" : "sentences"}</span>
        </div>
        <div class="synonym-result-legend" aria-label="${vi ? "Chú thích từ trong kết quả" : "Result word legend"}">
          <span><i class="original"></i>${originalWordLabel}</span>
          <span><i class="replaced"></i>${replacedWordLabel}</span>
        </div>
        <div class="synonym-results-list">${resultsHtml}</div>
      </section>`
    : "";

  const summary = vi
    ? `Bước ${phases[phaseIndex]}. Có ${groups.length} nhóm synonym và ${completed.length} trên ${expected} câu đã hoàn thành.`
    : `${phases[phaseIndex]} phase. ${groups.length} synonym groups and ${completed.length} of ${expected} sentences completed.`;

  $("treeView").innerHTML = `<div class="synonym-sentence-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="synonym-phases">${phaseHtml}</div>
    <div class="synonym-action">${escapeHtml(pick(view.action) || "")}</div>
    <div class="synonym-pair-flow">${pairHtml}</div>
    <section class="synonym-groups-section">
      <div class="synonym-section-heading">
        <strong>${vi ? "NHÓM SYNONYM" : "SYNONYM GROUPS"}</strong>
        <span>${groups.length} ${vi ? "nhóm" : "groups"}</span>
      </div>
      <div class="synonym-groups">${groupsHtml}</div>
    </section>
    ${dfsSection}
    ${decisionTreeSection}
    ${sentenceSection}
    ${resultsSection}
  </div>`;
}

function renderReplaceWordsView(step) {
  const view = step.replaceWordsView || {};
  const treeView = $("treeView");
  const vi = lang === "vi";
  const roots = Array.isArray(view.roots) ? view.roots : [];
  const sentenceWords = Array.isArray(view.sentenceWords) ? view.sentenceWords : [];
  const resultWords = Array.isArray(view.resultWords) ? view.resultWords : [];
  const wordIndex = Number.isInteger(view.wordIndex) ? view.wordIndex : null;
  const charIndex = Number.isInteger(view.charIndex) ? view.charIndex : null;
  const currentWord = view.word || (wordIndex !== null ? sentenceWords[wordIndex] : "");
  const phase = view.phase || "build";
  const foundRoot = view.foundRoot || "";
  const replacement = view.replacement || "";
  const prefix = view.prefix || "";
  const missingChar = view.missingChar || "";

  const dictionaryHtml = roots.length
    ? roots.map((root) => {
      const active = currentWord === root || foundRoot === root || prefix === root;
      return `<span class="rw-root${active ? " active" : ""}">${escapeHtml(root)}</span>`;
    }).join("")
    : `<span class="rw-empty">∅</span>`;

  const sentenceHtml = sentenceWords.length
    ? sentenceWords.map((word, index) => {
      const classes = ["rw-word"];
      if (index < resultWords.length) classes.push("done");
      if (index === wordIndex) classes.push("current");
      const label = index < resultWords.length ? resultWords[index] : word;
      if (index < resultWords.length && resultWords[index] !== word) classes.push("changed");
      return `<span class="${classes.join(" ")}"><small>${escapeHtml(word)}</small><strong>${escapeHtml(label)}</strong></span>`;
    }).join("")
    : `<span class="rw-empty">${vi ? "Không có câu" : "No sentence"}</span>`;

  const charHtml = currentWord
    ? currentWord.split("").map((ch, index) => {
      const classes = ["rw-char"];
      if (index < prefix.length && phase !== "miss") classes.push("matched");
      if (index === charIndex) classes.push(phase === "miss" ? "missing" : "current");
      if (foundRoot && index < foundRoot.length) classes.push("root-prefix");
      return `<span class="${classes.join(" ")}"><b>${escapeHtml(ch)}</b><small>${index}</small></span>`;
    }).join("")
    : `<span class="rw-empty">∅</span>`;

  const resultHtml = resultWords.length
    ? resultWords.map((word) => `<span class="rw-result-token">${escapeHtml(word)}</span>`).join("")
    : `<span class="rw-empty">[]</span>`;

  const pathHtml = (Array.isArray(view.pathChars) && view.pathChars.length)
    ? view.pathChars.map((ch) => `<span>${escapeHtml(ch)}</span>`).join("<i>→</i>")
    : "<span>root</span>";

  let decisionClass = "";
  let decisionMain = "";
  let decisionSub = "";
  if (phase === "replace") {
    decisionClass = "replace";
    decisionMain = `${currentWord} → ${replacement}`;
    decisionSub = vi ? "dùng root ngắn nhất đã gặp" : "use the shortest root found";
  } else if (phase === "keep") {
    decisionClass = "keep";
    decisionMain = currentWord;
    decisionSub = vi ? "không có root phù hợp, giữ nguyên" : "no matching root, keep original";
  } else if (phase === "miss") {
    decisionClass = "miss";
    decisionMain = vi ? `Thiếu cạnh '${missingChar}'` : `Missing edge '${missingChar}'`;
    decisionSub = vi ? "không thể tiếp tục theo Trie" : "cannot continue in the Trie";
  } else if (phase === "found-root" || phase === "candidate-root") {
    decisionClass = "found";
    decisionMain = foundRoot ? `root = ${foundRoot}` : prefix;
    decisionSub = vi ? "dừng sớm vì đây là root ngắn nhất" : "stop early because this is the shortest root";
  } else if (phase === "done") {
    decisionClass = "done";
    decisionMain = resultWords.join(" ");
    decisionSub = vi ? "câu sau khi thay thế" : "sentence after replacement";
  } else if (phase === "build" || phase === "mark-root") {
    decisionClass = "build";
    decisionMain = currentWord ? (phase === "mark-root" ? `${currentWord} ✓` : currentWord) : (vi ? "Xây Trie" : "Build Trie");
    decisionSub = vi ? "chèn root dictionary vào Trie" : "insert dictionary roots into the Trie";
  } else {
    decisionClass = "scan";
    decisionMain = prefix || currentWord || (vi ? "Bắt đầu tra từ" : "Start lookup");
    decisionSub = vi ? "đọc từng ký tự từ trái sang phải" : "read characters from left to right";
  }

  const summary = vi
    ? `Replace Words: ${roots.length} root và ${sentenceWords.length} từ trong câu.`
    : `Replace Words with ${roots.length} roots and ${sentenceWords.length} sentence words.`;

  treeView.innerHTML = `<section class="replace-words-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rw-section">
      <header><strong>Dictionary roots</strong><span>${vi ? "root càng ngắn càng ưu tiên" : "shorter root wins"}</span></header>
      <div class="rw-root-row">${dictionaryHtml}</div>
    </div>
    <div class="rw-section">
      <header><strong>Sentence</strong><span>${vi ? "trên: từ gốc, dưới: kết quả" : "top: original, bottom: output"}</span></header>
      <div class="rw-sentence-row">${sentenceHtml}</div>
    </div>
    <div class="rw-workspace">
      <div class="rw-section">
        <header><strong>${vi ? "Word đang xét" : "Current word"}</strong><span>${currentWord ? escapeHtml(currentWord) : "—"}</span></header>
        <div class="rw-char-row">${charHtml}</div>
        <div class="rw-path"><small>${vi ? "Đường đi Trie" : "Trie path"}</small><div>${pathHtml}</div></div>
      </div>
      <div class="rw-decision ${decisionClass}">
        <small>${vi ? "Quyết định" : "Decision"}</small>
        <strong>${escapeHtml(decisionMain || "—")}</strong>
        <span>${escapeHtml(decisionSub || "")}</span>
      </div>
    </div>
    <div class="rw-section result">
      <header><strong>${vi ? "Result đang có" : "Current result"}</strong><span>${resultWords.length}/${sentenceWords.length}</span></header>
      <div class="rw-result-row">${resultHtml}</div>
    </div>
  </section>`;
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

// ---- Even/Odd slot fill visualization (LeetCode 767 approach 2) ----
function renderEvenOddFillView(step) {
  const view = step.evenOddFillView || {};
  const res = Array.isArray(view.res) ? view.res : [];
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const i = Number.isInteger(view.i) ? view.i : null;
  const curCh = view.curCh || null;

  const slots = res.map((ch, index) => {
    const isEven = index % 2 === 0;
    const isCursor = index === i;
    const filled = ch !== null;
    const classes = ["eof-slot", isEven ? "eof-even" : "eof-odd"];
    if (isCursor) classes.push("eof-cursor");
    if (filled) classes.push("eof-filled");
    return `<div class="${classes.join(" ")}">
      <span class="eof-slot-index">[${index}]</span>
      <strong class="eof-slot-char">${filled ? escapeHtml(ch) : "_"}</strong>
    </div>`;
  }).join("");

  const heapItems = heap.map((entry, index) => `<span class="eof-heap-entry${index === 0 ? " root" : ""}">
    ${index === 0 ? `<strong>${lang === "vi" ? "gốc" : "root"}</strong> ` : ""}(-${escapeHtml(String(entry.freq))}, '${escapeHtml(String(entry.ch))}')
  </span>`).join("");

  const heapBox = heap.length
    ? `<div class="eof-heap-box"><span class="eof-heap-label">pq (max-heap)</span>${heapItems}</div>`
    : `<div class="eof-heap-box eof-heap-empty">${lang === "vi" ? "pq rỗng" : "pq empty"}</div>`;

  const curBox = curCh
    ? `<div class="eof-current"><span class="eof-current-label">${lang === "vi" ? "Đang điền" : "Placing"}</span><strong>'${escapeHtml(curCh)}'</strong></div>`
    : "";

  const legend = `<div class="eof-legend">
    <span><i class="eof-swatch eof-swatch-even"></i>${lang === "vi" ? "ô chẵn (0,2,4,...)" : "even slots (0,2,4,...)"}</span>
    <span><i class="eof-swatch eof-swatch-odd"></i>${lang === "vi" ? "ô lẻ (1,3,5,...)" : "odd slots (1,3,5,...)"}</span>
    <span><i class="eof-swatch eof-swatch-cursor"></i>${lang === "vi" ? "vị trí i hiện tại" : "current pointer i"}</span>
  </div>`;

  $("treeView").innerHTML = `<div class="eof-viz">
    ${heapBox}
    ${curBox}
    <div class="eof-slots">${slots}</div>
    ${legend}
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

// ---- Partition visualization (LeetCode 4: Median of Two Sorted Arrays) ----
function renderPartitionView(step) {
  const view = step.partitionView || {};
  const rowA = Array.isArray(view.rowA) ? view.rowA : [];
  const rowB = Array.isArray(view.rowB) ? view.rowB : [];
  const cutA = Number.isInteger(view.cutA) ? view.cutA : 0;
  const cutB = Number.isInteger(view.cutB) ? view.cutB : 0;
  const statuses = Array.isArray(view.status) ? view.status : [];
  const highlightIdx = view.highlight || {}; // { rowA: [i,...], rowB: [i,...] }
  // labelA/labelB reflect which ORIGINAL array (nums1 or nums2) rowA/rowB
  // actually is, since the algorithm may swap roles internally so binary
  // search always runs on the shorter array.
  const labelA = view.labelA || "nums1";
  const labelB = view.labelB || "nums2";

  function renderRow(rowLabel, values, cut, hlSet) {
    const cells = values.map((v, i) => {
      const inLeft = i < cut;
      const isHl = hlSet && hlSet.has(i);
      const isInf = v === Infinity || v === -Infinity;
      const label = isInf ? (v > 0 ? "+\u221E" : "-\u221E") : String(v);
      return `<div class="partition-cell${inLeft ? " left-half" : " right-half"}${isHl ? " hl" : ""}">
        <span class="partition-cell-idx">[${i}]</span>
        <strong>${escapeHtml(label)}</strong>
      </div>`;
    }).join("");
    return `<div class="partition-row">
      <span class="partition-row-label">${escapeHtml(rowLabel)}</span>
      <div class="partition-row-cells">${cells}</div>
    </div>`;
  }

  const hlA = new Set(highlightIdx.rowA || []);
  const hlB = new Set(highlightIdx.rowB || []);

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  const legend = `<div class="partition-legend">
    <span><i class="partition-swatch partition-swatch-left"></i>${lang === "vi" ? "nửa TRÁI (đã chọn)" : "LEFT half (chosen)"}</span>
    <span><i class="partition-swatch partition-swatch-right"></i>${lang === "vi" ? "nửa PHẢI" : "RIGHT half"}</span>
  </div>`;

  $("treeView").innerHTML = `
    <div class="partition-viz">
      ${renderRow(labelA, rowA, cutA, hlA)}
      ${renderRow(labelB, rowB, cutB, hlB)}
      ${legend}
      <div class="partition-status">${statusItems}</div>
    </div>`;
}

// ---- Two-pointer merge visualization (e.g. bai 88: Merge Sorted Array) ----
// Dedicated view showing nums1 and nums2 as separate rows, with a colored
// down-arrow + label above each pointer's current cell (instead of tiny text
// tags like "[i] p1" crammed into the sub-label, which is hard to scan when
// multiple pointers land near each other).
function renderTwoPointerMergeView(step) {
  const view = step.twoPointerMergeView || {};
  const nums1 = Array.isArray(view.nums1) ? view.nums1 : [];
  const nums2 = Array.isArray(view.nums2) ? view.nums2 : [];
  const written = Array.isArray(view.written) ? view.written : [];
  const result = Array.isArray(view.result) ? view.result : null;
  const resultLength = Number.isInteger(view.resultLength) ? view.resultLength : (result ? result.length : 0);
  const writtenResult = Array.isArray(view.writtenResult) ? view.writtenResult : [];
  const pointers1 = view.pointers1 || {}; // { i: idx, k: idx } -> pointer name -> index into nums1
  const pointers2 = view.pointers2 || {}; // { j: idx } -> pointer name -> index into nums2
  const pointersResult = view.pointersResult || {};
  const highlight1 = new Set(view.highlight1 || []);
  const highlight2 = new Set(view.highlight2 || []);
  const highlightResult = new Set(view.highlightResult || []);

  // Fixed color per pointer name so it's visually consistent across every step.
  const pointerColor = { i: "tp-ptr-a", p1: "tp-ptr-a", j: "tp-ptr-b", p2: "tp-ptr-b", k: "tp-ptr-c", write: "tp-ptr-c" };

  function pointersAt(pointerMap, idx) {
    return Object.entries(pointerMap).filter(([, v]) => v === idx).map(([name]) => name);
  }

  function renderRow(rowLabel, values, pointerMap, hlSet, rowClass, writtenCells = []) {
    const cells = values.map((v, i) => {
      const names = pointersAt(pointerMap, i);
      const arrowsHtml = names.map((name) => {
        const cls = pointerColor[name] || "tp-ptr-a";
        return `<div class="tp-pointer-arrow ${cls}"><span class="tp-pointer-name">${escapeHtml(name)}</span><span class="tp-pointer-caret">\u25BC</span></div>`;
      }).join("");
      const isWritten = writtenCells[i];
      const isHl = hlSet.has(i);
      return `<div class="tp-cell-wrap">
        <div class="tp-pointer-stack">${arrowsHtml}</div>
        <div class="tp-cell${isWritten ? " tp-cell-written" : ""}${isHl ? " tp-cell-hl" : ""}">
          <span class="tp-cell-idx">[${i}]</span>
          <strong>${escapeHtml(String(v))}</strong>
        </div>
      </div>`;
    }).join("");
    return `<div class="tp-row ${rowClass}">
      <span class="tp-row-label">${escapeHtml(rowLabel)}</span>
      <div class="tp-row-cells">${cells}</div>
    </div>`;
  }

  const legendItems = [
    { name: view.legend1Name || "i", cls: pointerColor[view.legend1Name || "i"] || "tp-ptr-a", text: pick(view.legend1Text) },
    { name: view.legend2Name || "j", cls: pointerColor[view.legend2Name || "j"] || "tp-ptr-b", text: pick(view.legend2Text) },
    { name: view.legend3Name || "k", cls: pointerColor[view.legend3Name || "k"] || "tp-ptr-c", text: pick(view.legend3Text) },
  ].filter((item) => item.text);
  const legendHtml = legendItems.map((item) => `<span><i class="tp-legend-swatch ${item.cls}"></i>${escapeHtml(item.name)} = ${escapeHtml(item.text)}</span>`).join("");

  $("treeView").innerHTML = `
    <div class="tp-merge-viz">
      ${renderRow(view.label1 || "nums1", nums1, pointers1, highlight1, "tp-row-nums1", written)}
      ${renderRow(view.label2 || "nums2", nums2, pointers2, highlight2, "tp-row-nums2")}
      ${result ? renderRow(
        view.resultLabel || "result",
        Array.from({ length: resultLength }, (_, idx) => result[idx] ?? "·"),
        pointersResult,
        highlightResult,
        "tp-row-result",
        writtenResult,
      ) : ""}
      <div class="tp-legend">${legendHtml}</div>
    </div>`;
}

// ---- Rotated-array binary search visualization (LeetCode 33) ----
function renderRotatedSearchView(step) {
  const view = step.rotatedSearchView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const left = Number.isInteger(view.left) ? view.left : -1;
  const right = Number.isInteger(view.right) ? view.right : -1;
  const mid = Number.isInteger(view.mid) ? view.mid : -1;
  const eliminated = new Set(Array.isArray(view.eliminated) ? view.eliminated : []);
  const comparison = pick(view.comparison) || "";
  const vi = lang === "vi";
  const minValue = nums.length ? Math.min(...nums) : 0;
  const maxValue = nums.length ? Math.max(...nums) : 0;

  function columnHeight(value) {
    if (maxValue === minValue) return 64;
    return 44 + Math.round(((value - minValue) / (maxValue - minValue)) * 42);
  }

  function pointerLabels(index) {
    const labels = [];
    if (index === left) labels.push("L");
    if (index === mid) labels.push("M");
    if (index === right) labels.push("R");
    return labels;
  }

  function isInSortedHalf(index) {
    if (mid < 0) return false;
    if (view.sortedHalf === "left") return index >= left && index <= mid;
    if (view.sortedHalf === "right") return index >= mid && index <= right;
    return false;
  }

  const cells = nums.map((value, index) => {
    const pointers = pointerLabels(index);
    const active = index >= left && index <= right;
    const found = view.phase === "found" && index === mid;
    const classes = [
      "rotated-cell",
      active ? "active" : "discarded",
      eliminated.has(index) ? "just-eliminated" : "",
      isInSortedHalf(index) ? "sorted-half" : "",
      view.phase === "narrow" && active ? "kept" : "",
      index === mid && view.phase !== "found" ? "mid" : "",
      found ? "found" : "",
    ].filter(Boolean).join(" ");
    const pointerHtml = pointers.length
      ? pointers.map((label) => `<span class="rotated-pointer pointer-${label.toLowerCase()}">${label}<i></i></span>`).join("")
      : `<span class="rotated-pointer-spacer"></span>`;

    return `<div class="rotated-cell-wrap">
      <div class="rotated-pointers">${pointerHtml}</div>
      <div class="${classes}" style="--rotated-height: ${columnHeight(value)}px">
        <strong>${escapeHtml(String(value))}</strong>
        <span>[${index}]</span>
      </div>
    </div>`;
  }).join("");

  const stateLabel = ({
    range: vi ? "Vùng đang tìm" : "Search range",
    mid: vi ? "Kiểm tra điểm giữa" : "Check midpoint",
    sorted: vi ? "Xác định nửa tăng dần" : "Identify sorted half",
    narrow: vi ? `Giữ nửa ${view.keptHalf === "left" ? "TRÁI" : "PHẢI"}` : `Keep the ${view.keptHalf === "left" ? "LEFT" : "RIGHT"} half`,
    found: vi ? "Đã tìm thấy" : "Found",
    "not-found": vi ? "Không tìm thấy" : "Not found",
  })[view.phase] || (vi ? "Vùng đang tìm" : "Search range");

  const summary = vi
    ? `Tìm ${view.target} trong mảng xoay. ${stateLabel}. ${comparison}`
    : `Searching for ${view.target} in a rotated array. ${stateLabel}. ${comparison}`;

  $("treeView").innerHTML = `<div class="rotated-search-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rotated-search-head">
      <span class="rotated-target">target <strong>${escapeHtml(String(view.target))}</strong></span>
      <span class="rotated-phase">${escapeHtml(stateLabel)}</span>
    </div>
    <div class="rotated-cells">${cells}</div>
    <div class="rotated-decision">${escapeHtml(comparison)}</div>
    <div class="rotated-legend">
      <span><i class="legend-active"></i>${vi ? "còn xét" : "candidate"}</span>
      <span><i class="legend-sorted"></i>${vi ? "nửa tăng dần" : "sorted half"}</span>
      <span><i class="legend-mid"></i>mid</span>
      <span><i class="legend-discarded"></i>${vi ? "đã loại" : "discarded"}</span>
    </div>
  </div>`;
}

// ---- Sorted GCD pair queries visualization (LeetCode 3312) ----
function renderGcdPairsView(step) {
  const view = step.gcdPairsView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const sorted = Array.isArray(view.sorted) ? view.sorted : [];
  const pair = view.pair || null;
  const buckets = Array.isArray(view.buckets) ? view.buckets : [];
  const query = view.query || null;
  const activeG = Number.isInteger(view.activeG) ? view.activeG : null;
  const vi = lang === "vi";

  const numsHtml = nums.map((value, index) => {
    const selected = pair && (index === pair.i || index === pair.j);
    return `<div class="gcd-num${selected ? " selected" : ""}"><strong>${escapeHtml(String(value))}</strong><span>[${index}]</span></div>`;
  }).join("");
  const pairHtml = pair
    ? `<div class="gcd-pair-formula"><span>nums[${pair.i}] = ${pair.vi}</span><b>gcd</b><span>nums[${pair.j}] = ${pair.vj}</span><strong>= ${pair.g}</strong></div>`
    : `<div class="gcd-pair-formula muted">${vi ? "Chọn mọi cặp i < j" : "Consider every pair i < j"}</div>`;
  const sortedHtml = sorted.map((value, index) => {
    const selected = query && index === query.index;
    const sameG = activeG !== null && value === activeG;
    return `<div class="gcd-sorted-chip${selected ? " query" : ""}${sameG ? " same-gcd" : ""}"><span>[${index}]</span><strong>${escapeHtml(String(value))}</strong></div>`;
  }).join("");
  const bucketHtml = buckets.length
    ? `<div class="gcd-buckets">${buckets.map((bucket) => `<div class="gcd-bucket${activeG === bucket.g ? " active" : ""}"><span>g = ${bucket.g}</span><strong>${bucket.count}</strong><small>${vi ? `tích lũy ${bucket.prefix}` : `prefix ${bucket.prefix}`}</small></div>`).join("")}</div>`
    : "";
  const queryHtml = query
    ? `<div class="gcd-query-result"><span>q=${query.index}</span><strong>gcdPairs[${query.index}] = ${query.answer}</strong></div>`
    : "";
  const summary = vi
    ? `Tạo GCD cho từng cặp rồi sắp xếp. ${query ? `Query ${query.index} chọn ${query.answer}.` : ""}`
    : `Form GCDs for every pair, then sort them. ${query ? `Query ${query.index} selects ${query.answer}.` : ""}`;

  $("treeView").innerHTML = `<div class="gcd-pairs-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="gcd-source-row"><span class="gcd-row-label">nums</span><div class="gcd-num-list">${numsHtml}</div></div>
    ${pairHtml}
    <div class="gcd-row-label">gcdPairs ${vi ? "(đã sắp xếp)" : "(sorted)"}</div>
    <div class="gcd-sorted-list">${sortedHtml}</div>
    ${bucketHtml}
    ${queryHtml}
  </div>`;
}

// ---- K-th palindromic rearrangement visualization (LeetCode 3518) ----
function renderKthPalindromeView(step) {
  const view = step.kthPalindromeView || {};
  const source = Array.isArray(view.source) ? view.source : [];
  const counts = Array.isArray(view.counts) ? view.counts : [];
  const halfCounts = Array.isArray(view.halfCounts) ? view.halfCounts : [];
  const candidates = Array.isArray(view.candidates) ? view.candidates : [];
  const preview = Array.isArray(view.preview) ? view.preview : [];
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : -1;
  const position = Number.isInteger(view.position) ? view.position : -1;
  const halfLength = Number.isInteger(view.halfLength) ? view.halfLength : Math.floor(source.length / 2);
  const vi = lang === "vi";
  const showsActivePosition = ["position", "try", "count-candidate", "skip", "choose"].includes(view.phase);

  const formatNumber = (value, capped = false) => {
    if (value === null || value === undefined) return "-";
    const formatted = Number(value).toLocaleString("en-US");
    return capped ? `${formatted}+` : formatted;
  };

  const visibleIndexes = (length, limit = 24) => {
    if (length <= limit) return Array.from({ length }, (_, index) => index);
    const side = Math.floor(limit / 2);
    return [
      ...Array.from({ length: side }, (_, index) => index),
      -1,
      ...Array.from({ length: side }, (_, index) => length - side + index),
    ];
  };

  const sourceHtml = visibleIndexes(source.length).map((index) => index < 0
    ? '<span class="kp-ellipsis">...</span>'
    : `<div class="kp-char"><span>[${index}]</span><strong>${escapeHtml(source[index])}</strong></div>`).join("");

  const countsHtml = counts.map((item) => {
    const index = item.ch.charCodeAt(0) - 97;
    const remaining = halfCounts.length ? halfCounts[index] : item.half;
    return `<div class="kp-count${index === activeIndex ? " active" : ""}${remaining === 0 ? " empty" : ""}">
      <strong>${escapeHtml(item.ch)}</strong>
      <span>${vi ? "toàn bộ" : "full"} ${item.count}</span>
      <small>${vi ? "còn lại" : "left"} ${remaining}</small>
    </div>`;
  }).join("");

  const statusLabel = {
    untried: vi ? "CHƯA THỬ" : "UNTRIED",
    trying: vi ? "ĐANG THỬ" : "TRY",
    counted: vi ? "ĐÃ ĐẾM" : "COUNTED",
    skipped: vi ? "BỎ BLOCK" : "SKIP BLOCK",
    chosen: vi ? "CHỌN" : "CHOOSE",
  };
  const candidatesHtml = candidates.map((candidate) => {
    const containsTarget = Number.isFinite(view.rankAtPosition)
      && view.rankAtPosition >= candidate.rangeStart
      && view.rankAtPosition <= candidate.rangeEnd;
    const rangeEnd = candidate.capped ? `${formatNumber(candidate.rangeEnd)}+` : formatNumber(candidate.rangeEnd);
    return `<div class="kp-candidate ${candidate.status || "untried"}${containsTarget ? " contains-target" : ""}">
      <div class="kp-candidate-head"><strong>${escapeHtml(candidate.ch)}</strong><span>${statusLabel[candidate.status] || statusLabel.untried}</span></div>
      <div><small>${vi ? "số cách" : "ways"}</small><b>${formatNumber(candidate.ways, candidate.capped)}</b></div>
      <div><small>rank</small><b>${formatNumber(candidate.rangeStart)}-${rangeEnd}</b></div>
    </div>`;
  }).join("");

  const previewHtml = visibleIndexes(preview.length).map((index) => {
    if (index < 0) return '<span class="kp-ellipsis">...</span>';
    const center = source.length % 2 === 1 && index === halfLength;
    const side = center ? "center" : index < halfLength ? "left" : "right";
    const active = showsActivePosition && (index === position || index === source.length - 1 - position);
    const value = preview[index];
    return `<div class="kp-result-cell ${side}${value != null ? " filled" : ""}${active ? " active" : ""}${view.final ? " final" : ""}">
      <span>[${index}]</span><strong>${escapeHtml(value == null ? "·" : String(value))}</strong>
    </div>`;
  }).join("");

  const emptyText = vi ? "rỗng" : "empty";
  const leftText = Array.isArray(view.left) && view.left.length ? view.left.join("") : emptyText;
  const middleText = view.middle || emptyText;
  const totalText = view.totalWays == null ? "-" : formatNumber(view.totalWays, view.totalCapped);
  const formula = view.formula ? `<div class="kp-formula">${escapeHtml(view.formula)}</div>` : "";
  const summary = vi
    ? `Đang tìm palindrome thứ ${view.requestedK}; prefix hiện tại là ${leftText}, k cục bộ là ${view.currentK}.`
    : `Finding palindrome ${view.requestedK}; the current prefix is ${leftText} and local k is ${view.currentK}.`;

  $("treeView").innerHTML = `<div class="kth-palindrome-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="kp-row"><span class="kp-label">input s</span><div class="kp-chars">${sourceHtml}</div></div>
    <div class="kp-rank-strip">
      <span>${vi ? "k yêu cầu" : "requested k"}<strong>${formatNumber(view.requestedK)}</strong></span>
      <span>${vi ? "k cục bộ" : "local k"}<strong>${formatNumber(view.currentK)}</strong></span>
      <span>${vi ? "tổng cách" : "total ways"}<strong>${totalText}</strong></span>
      <span>prefix<strong>${escapeHtml(leftText)}</strong></span>
      <span>middle<strong>${escapeHtml(middleText)}</strong></span>
    </div>
    ${counts.length ? `<div class="kp-row"><span class="kp-label">half count</span><div class="kp-counts">${countsHtml}</div></div>` : ""}
    ${candidates.length ? `<div class="kp-candidate-section"><div class="kp-candidate-title"><span>${vi ? `Lựa chọn cho vị trí ${position}` : `Choices for position ${position}`}</span><b>${vi ? `rank mục tiêu ${formatNumber(view.rankAtPosition)}` : `target rank ${formatNumber(view.rankAtPosition)}`}</b></div><div class="kp-candidates">${candidatesHtml}</div></div>` : ""}
    ${formula}
    <div class="kp-half-guide"><span>${vi ? "NỬA TRÁI = QUYẾT ĐỊNH THỨ TỰ" : "LEFT HALF = LEXICOGRAPHIC ORDER"}</span><span>${source.length % 2 ? "CENTER" : ""}</span><span>${vi ? "NỬA PHẢI = ĐẢO NGƯỢC" : "RIGHT HALF = REVERSE"}</span></div>
    <div class="kp-row"><span class="kp-label">${view.final ? (vi ? "kết quả" : "result") : "palindrome"}</span><div class="kp-result">${previewHtml}</div></div>
  </div>`;
}

// ---- Smallest palindromic rearrangement visualization (LeetCode 3517) ----
function renderPalindromeBuildView(step) {
  const view = step.palindromeBuildView || {};
  const source = Array.isArray(view.source) ? view.source : [];
  const counts = Array.isArray(view.counts) ? view.counts : [];
  const preview = Array.isArray(view.preview) ? view.preview : [];
  const bucket = Array.isArray(view.bucket) ? view.bucket : [];
  const placements = new Set(Array.isArray(view.placements) ? view.placements : []);
  const processed = new Set(Array.isArray(view.processed) ? view.processed : []);
  const activeChar = view.activeChar;
  const scanIndex = Number.isInteger(view.scanIndex) ? view.scanIndex : -1;
  const activeBucket = Number.isInteger(view.activeBucket) ? view.activeBucket : -1;
  const partition = Number.isInteger(view.partition) ? view.partition : Math.floor(source.length / 2);
  const halfLength = Number.isInteger(view.halfLength) ? view.halfLength : Math.floor(source.length / 2);
  const vi = lang === "vi";

  const sourceHtml = source.map((ch, index) => `<div class="sp-source-cell${ch === activeChar || index === scanIndex ? " active" : ""}${view.bucketApproach && index < partition ? " first-half" : ""}${view.bucketApproach && source.length % 2 && index === partition ? " source-center" : ""}">
    ${index === scanIndex ? '<b class="sp-source-pointer">i</b>' : ""}
    <span>[${index}]</span><strong>${escapeHtml(ch)}</strong>
  </div>`).join("");

  const countsHtml = counts.map((item) => `<div class="sp-count${item.ch === activeChar ? " active" : ""}${processed.has(item.ch) ? " processed" : ""}">
    <strong>${escapeHtml(item.ch)}</strong>
    <span>${vi ? "đếm" : "count"} ${item.count}</span>
    <small>${item.pairs} ${vi ? "cặp" : item.pairs === 1 ? "pair" : "pairs"}${item.odd ? ` + 1 ${vi ? "dư" : "odd"}` : ""}</small>
  </div>`).join("");

  const bucketHtml = bucket.map((value, index) => `<div class="sp-bucket${index === activeBucket ? " active" : ""}${value > 0 ? " filled" : ""}">
    <span>${String.fromCharCode(index + 97)}</span><strong>${value}</strong><small>[${index}]</small>
  </div>`).join("");

  const previewHtml = preview.map((ch, index) => {
    const center = source.length % 2 === 1 && index === halfLength;
    const side = center ? " center" : index < halfLength ? " left" : " right";
    return `<div class="sp-result-cell${side}${placements.has(index) ? " placed" : ""}${view.final ? " final" : ""}">
      <span>[${index}]</span><strong>${escapeHtml(ch == null ? "·" : String(ch))}</strong>
    </div>`;
  }).join("");

  const leftText = Array.isArray(view.left) && view.left.length ? view.left.join("") : "∅";
  const middleText = view.middle || "∅";
  const rightText = view.right || "∅";
  const formula = view.formula ? `<div class="sp-formula">${escapeHtml(view.formula)}</div>` : "";
  const summary = vi
    ? `Xây palindrome nhỏ nhất từ ${source.length} ký tự; nửa trái hiện là ${leftText}, ký tự giữa là ${middleText}.`
    : `Build the smallest palindrome from ${source.length} characters; current left half is ${leftText}, middle is ${middleText}.`;

  $("treeView").innerHTML = `<div class="smallest-palindrome-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sp-row"><span class="sp-label">s</span><div class="sp-source">${sourceHtml}</div></div>
    ${counts.length ? `<div class="sp-row"><span class="sp-label">count</span><div class="sp-counts">${countsHtml}</div></div>` : ""}
    ${bucket.length ? `<div class="sp-row sp-bucket-row"><span class="sp-label">bucket</span><div class="sp-bucket-grid">${bucketHtml}</div></div>` : ""}
    <div class="sp-state"><span>${vi ? "nửa trái" : "left half"}: <strong>${escapeHtml(leftText)}</strong></span><span>middle: <strong>${escapeHtml(middleText)}</strong></span>${view.bucketApproach ? `<span>right: <strong>${escapeHtml(rightText)}</strong></span>` : ""}</div>
    ${formula}
    <div class="sp-half-guide"><span>${vi ? "NỬA TRÁI tăng dần" : "SORTED LEFT HALF"}</span><span>${source.length % 2 ? "CENTER" : ""}</span><span>${vi ? "NỬA PHẢI đối xứng" : "MIRRORED RIGHT HALF"}</span></div>
    <div class="sp-row"><span class="sp-label">${view.final ? (vi ? "kết quả" : "result") : (vi ? "bố cục" : "layout")}</span><div class="sp-result">${previewHtml}</div></div>
  </div>`;
}

// ---- Duplicate zeros visualization (LeetCode 1089) ----
function renderDuplicateZerosView(step) {
  const view = step.duplicateZerosView || {};
  const source = Array.isArray(view.source) ? view.source : [];
  const output = Array.isArray(view.output) ? view.output : [];
  const virtual = Array.isArray(view.virtual) ? view.virtual : output;
  const visibleLength = Number.isInteger(view.visibleLength) ? view.visibleLength : output.length;
  const read = Number.isInteger(view.read) ? view.read : -1;
  const write = Number.isInteger(view.write) ? view.write : -1;
  const writes = new Set((Array.isArray(view.writes) ? view.writes : []).filter((index) => index >= 0 && index < virtual.length));
  const finalized = new Set(Array.isArray(view.finalized) ? view.finalized : []);
  const vi = lang === "vi";

  const row = (values, type) => values.map((value, index) => {
    const isRead = type === "source" && index === read;
    const isWrite = type === "virtual" && writes.has(index);
    const isFinal = type === "virtual" && finalized.has(index);
    const isOverflow = type === "virtual" && index >= visibleLength;
    const display = value === null || value === undefined ? "·" : String(value);
    const pointer = isRead ? "i" : (type === "virtual" && index === write ? "j" : "");
    return `<div class="dz-cell${isRead ? " read" : ""}${isWrite ? " write" : ""}${isFinal ? " final" : ""}${isOverflow ? " overflow" : ""}${pointer ? " pointer-cell" : ""}">
      ${pointer ? `<b class="dz-pointer ${pointer}">${pointer}</b>` : ""}
      <span>[${index}]</span><strong>${escapeHtml(display)}</strong>
    </div>`;
  }).join("");

  const writeLabel = write >= visibleLength
    ? (vi ? `j = ${write} (ngoài mảng)` : `j = ${write} (outside array)`)
    : write >= 0
      ? `j = ${write}`
      : (vi ? "j = -1 (hoàn tất)" : "j = -1 (complete)");
  const summary = vi
    ? `Đọc source[${read}] và ghi ngược trong không gian ${virtual.length} ô; chỉ giữ các ô 0 đến ${visibleLength - 1}.`
    : `Read source[${read}] and write backwards in ${virtual.length} slots; keep only slots 0 through ${visibleLength - 1}.`;
  const keptRange = visibleLength ? `[0..${visibleLength - 1}]` : "-";
  const overflowRange = virtual.length > visibleLength ? `[${visibleLength}..${virtual.length - 1}]` : "-";

  $("treeView").innerHTML = `<div class="duplicate-zeros-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="dz-head"><span class="dz-badge read-badge">READ = ${read >= 0 ? read : "-"}</span><span class="dz-badge write-badge">${escapeHtml(writeLabel)}</span></div>
    <div class="dz-row"><span class="dz-label">${vi ? "nguồn" : "source"}</span><div class="dz-cells">${row(source, "source")}</div></div>
    <div class="dz-arrow">${vi ? "ghi từ phải sang trái" : "write from right to left"}</div>
    <div class="dz-range"><span class="dz-keep">${vi ? `GIỮ ${keptRange}` : `KEEP ${keptRange}`}</span><span class="dz-drop">${vi ? `BỎ ${overflowRange}` : `DROP ${overflowRange}`}</span></div>
    <div class="dz-row"><span class="dz-label">${vi ? "vùng ghi" : "write space"}</span><div class="dz-cells">${row(virtual, "virtual")}</div></div>
  </div>`;
}

// ---- Multi-slot podium visualization (e.g. bai 628: track top-3 & bottom-2) ----
function renderMultiSlotPodiumView(step) {
  const view = step.multiSlotPodiumView || {};
  const values = Array.isArray(view.values) ? view.values : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const slots = Array.isArray(view.slots) ? view.slots : []; // [{ key, label, value, group, bump, transition }]
  const formula = view.formula || null; // { label, value }
  const mirrorHint = !!view.mirrorHint;

  const valueCells = values.map((v, i) => {
    const isCurrent = i === current;
    const isDone = visited[i];
    return `<div class="digit-cell${isCurrent ? " current" : ""}${isDone && !isCurrent ? " done" : ""}">
      <span class="digit-cell-idx">[${i}]</span>
      <strong>${escapeHtml(String(v))}</strong>
    </div>`;
  }).join("");

  const groupClass = { top: "digit-slot-first", bottom: "digit-slot-second" };
  const groupHeading = { top: lang === "vi" ? "TOP-3 (lớn nhất)" : "TOP-3 (largest)", bottom: lang === "vi" ? "BOTTOM-2 (nhỏ nhất)" : "BOTTOM-2 (smallest)" };

  function renderGroup(groupKey) {
    const groupSlots = slots.filter((s) => s.group === groupKey);
    if (!groupSlots.length) return "";
    const cells = groupSlots.map((slot) => {
      const cls = groupClass[slot.group] || "digit-slot-answer";
      const bump = slot.bump ? " bump" : "";
      const val = slot.value === Infinity ? "+\u221E" : slot.value === -Infinity ? "-\u221E" : slot.value;
      const transitionHtml = slot.transition
        ? `<span class="digit-slot-transition">${escapeHtml(slot.transition)}</span>`
        : "";
      return `<div class="digit-slot ${cls}${bump}">
        <span class="digit-slot-label">${escapeHtml(pick(slot.label) || slot.key)}</span>
        <strong>${escapeHtml(String(val))}</strong>
        ${transitionHtml}
      </div>`;
    }).join("");
    return `<div class="multi-slot-group">
      <span class="multi-slot-group-heading">${escapeHtml(groupHeading[groupKey] || groupKey)}</span>
      <div class="multi-slot-group-cells">${cells}</div>
    </div>`;
  }

  const formulaHtml = formula
    ? `<div class="digit-slot digit-slot-answer"><span class="digit-slot-label">${escapeHtml(pick(formula.label) || (lang === "vi" ? "kết quả" : "result"))}</span><strong>${escapeHtml(String(formula.value))}</strong></div>`
    : "";

  const mirrorNote = mirrorHint
    ? `<div class="multi-slot-mirror-hint">${lang === "vi" ? "\u2194 Y hệt logic top-3 ở trên, chỉ đổi chiều so sánh (< thay vì >)" : "\u2194 Same logic as top-3 above, just flipped comparison (< instead of >)"}</div>`
    : "";

  $("treeView").innerHTML = `
    <div class="digit-podium-viz">
      <div class="digit-strip">${valueCells}</div>
      <div class="multi-slot-groups">
        ${renderGroup("top")}
        ${renderGroup("bottom")}
      </div>
      ${mirrorNote}
      ${formulaHtml ? `<div class="digit-podium">${formulaHtml}</div>` : ""}
    </div>`;
}

function renderDigitPodiumView(step) {
  const view = step.digitPodiumView || {};
  const digits = Array.isArray(view.digits) ? view.digits : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const first = view.first ?? 0;
  const second = view.second ?? 0;
  const updateKind = view.updateKind || null; // "first" | "second" | "none" | null
  const answer = view.answer;
  const op = view.op === "vs" ? (lang === "vi" ? "so với" : "vs") : (view.op || "×");
  const resultLabel = view.resultLabel ? pick(view.resultLabel) : (lang === "vi" ? "tích" : "product");
  const defaultFirstLabel = { vi: "first (lớn nhất)", en: "first (largest)" };
  const defaultSecondLabel = { vi: "second (lớn nhì)", en: "second (2nd largest)" };
  const firstLabel = view.firstLabel ? pick(view.firstLabel) : defaultFirstLabel[lang === "vi" ? "vi" : "en"];
  const secondLabel = view.secondLabel ? pick(view.secondLabel) : defaultSecondLabel[lang === "vi" ? "vi" : "en"];

  const digitCells = digits.map((d, i) => {
    const isCurrent = i === current;
    const isDone = visited[i];
    return `<div class="digit-cell${isCurrent ? " current" : ""}${isDone && !isCurrent ? " done" : ""}">
      <span class="digit-cell-idx">[${i}]</span>
      <strong>${escapeHtml(String(d))}</strong>
    </div>`;
  }).join("");

  const firstBump = updateKind === "first" ? " bump" : "";
  const secondBump = updateKind === "second" ? " bump" : "";

  const answerDisplay = typeof answer === "boolean" ? (answer ? (lang === "vi" ? "True" : "True") : "False") : answer;

  const podium = `<div class="digit-podium">
    <div class="digit-slot digit-slot-first${firstBump}">
      <span class="digit-slot-label">${escapeHtml(firstLabel)}</span>
      <strong>${escapeHtml(String(first))}</strong>
    </div>
    <div class="digit-podium-op">${escapeHtml(op)}</div>
    <div class="digit-slot digit-slot-second${secondBump}">
      <span class="digit-slot-label">${escapeHtml(secondLabel)}</span>
      <strong>${escapeHtml(String(second))}</strong>
    </div>
    ${answer !== undefined ? `<div class="digit-podium-op">=</div><div class="digit-slot digit-slot-answer"><span class="digit-slot-label">${escapeHtml(resultLabel)}</span><strong>${escapeHtml(String(answerDisplay))}</strong></div>` : ""}
  </div>`;

  $("treeView").innerHTML = `
    <div class="digit-podium-viz">
      <div class="digit-strip">${digitCells}</div>
      ${podium}
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

function renderSegmentTreeView(step) {
  const view = step.segmentTreeView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const tree = Array.isArray(view.tree) ? view.tree : [];
  const coverage = Array.isArray(view.coverage) ? view.coverage : [];
  const activeNums = new Set(Array.isArray(view.activeNums) ? view.activeNums : []);
  const activeTree = new Set(Array.isArray(view.activeTree) ? view.activeTree : []);
  const selectedTree = new Set(Array.isArray(view.selectedTree) ? view.selectedTree : []);
  const path = Array.isArray(view.path) ? view.path : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const mode = ["build", "update", "query"].includes(view.mode) ? view.mode : "idle";
  const nodeCount = tree.length;

  const numsCells = nums.map((value, index) => `<div class="segment-tree-cell nums-cell${activeNums.has(index) ? " active" : ""}">
    <span>nums[${index}]</span>
    <strong>${escapeHtml(String(value))}</strong>
  </div>`).join("");

  const levels = [];
  for (let start = 1; start <= nodeCount; start *= 2) {
    const end = Math.min(start * 2 - 1, nodeCount);
    const nodes = [];
    for (let index = start; index <= end; index += 1) nodes.push(index);
    levels.push(nodes);
  }

  const treeLevels = levels.map((nodes, levelIndex) => {
    const cells = nodes.map((index) => {
      const value = tree[index - 1];
      const covers = Array.isArray(coverage[index - 1]) ? coverage[index - 1] : [];
      const coverageText = covers.length ? `{${covers.join(",")}}` : "{}";
      const classes = [
        "segment-tree-cell",
        "tree-cell",
        activeTree.has(index) ? "active" : "",
        selectedTree.has(index) ? "selected" : "",
      ].filter(Boolean).join(" ");
      return `<div class="${classes}" aria-label="${escapeHtml(`tree ${index}, sum ${value}, covers ${coverageText}`)}">
        <span>tree[${index}]</span>
        <strong>${escapeHtml(String(value))}</strong>
        <small>${escapeHtml(coverageText)}</small>
      </div>`;
    }).join("");
    return `<div class="segment-tree-level" style="--segment-level-cols:${nodes.length}">
      <div class="segment-tree-level-label">L${levelIndex}</div>
      <div class="segment-tree-level-nodes">${cells}</div>
    </div>`;
  }).join("");

  const pathText = path.length > 0
    ? path.map((index) => `tree[${escapeHtml(String(index))}]`).join(" -> ")
    : (lang === "vi" ? "chưa có node" : "no nodes yet");
  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");
  const modeLabel = {
    build: "build",
    update: "update",
    query: lang === "vi" ? "truy vấn" : "query",
    idle: lang === "vi" ? "chờ" : "idle",
  }[mode];

  $("treeView").innerHTML = `<div class="segment-tree-viz mode-${mode}">
    <div class="segment-tree-mode"><span>${escapeHtml(modeLabel)}</span><strong>${pathText}</strong></div>
    <div class="segment-tree-scroll">
      <div class="segment-tree-heading">nums (0-based)</div>
      <div class="segment-tree-nums" style="--segment-nums-cols:${Math.max(1, nums.length)}">${numsCells}</div>
      <div class="segment-tree-heading">Segment Tree array (1-based display)</div>
      <div class="segment-tree-levels">${treeLevels}</div>
    </div>
    <div class="segment-tree-status">${statusItems}</div>
  </div>`;
}

function renderEvenOddRatioView(step) {
  const view = step.evenOddRatioView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const weights = Array.isArray(view.weights) ? view.weights : [];
  const pref = Array.isArray(view.pref) ? view.pref : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const bit = Array.isArray(view.bit) ? view.bit : [];
  const eligible = new Set(Array.isArray(view.eligiblePrefixIndices) ? view.eligiblePrefixIndices : []);
  const queryPath = new Set(Array.isArray(view.queryPath) ? view.queryPath : []);
  const updatePath = new Set(Array.isArray(view.updatePath) ? view.updatePath : []);
  const currentPrefixIndex = Number.isInteger(view.currentPrefixIndex) ? view.currentPrefixIndex : -1;
  const currentNumIndex = Number.isInteger(view.currentNumIndex) ? view.currentNumIndex : -1;
  const currentValue = currentPrefixIndex >= 0 ? pref[currentPrefixIndex] : null;
  const vi = lang === "vi";
  const countPhase = ![
    "prefix-init", "transform-read", "transform-weight", "prefix-append", "compress", "bit-init",
  ].includes(view.phase);
  const phaseIndex = ["compress", "bit-init"].includes(view.phase) ? 1 : countPhase ? 2 : 0;
  const phaseLabels = vi
    ? ["1. Đổi trọng số", "2. Nén prefix", "3. Fenwick đếm"]
    : ["1. Transform", "2. Compress prefixes", "3. Fenwick count"];
  const phasesHtml = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : ""}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`).join("");

  const numsHtml = nums.map((num, index) => {
    const isEven = num % 2 === 0;
    const weight = weights[index];
    const classes = ["even-odd-ratio-number", isEven ? "is-even" : "is-odd"];
    if (index === currentNumIndex) classes.push("is-current");
    if (weight === null || weight === undefined) classes.push("is-pending");
    return `<div class="${classes.join(" ")}">
      <span>nums[${index}]</span>
      <strong>${escapeHtml(num)}</strong>
      <small>${isEven ? "EVEN" : "ODD"} · ${weight === null || weight === undefined ? "?" : weight > 0 ? `+${weight}` : weight}</small>
    </div>`;
  }).join("");

  const prefixHtml = pref.map((value, index) => {
    const classes = ["even-odd-ratio-prefix"];
    let status = "";
    if (index === currentPrefixIndex) {
      classes.push("is-current");
      status = vi ? "HIỆN TẠI" : "CURRENT";
    } else if (view.phase !== "done" && currentPrefixIndex >= 0 && index < currentPrefixIndex) {
      if (eligible.has(index)) {
        classes.push("is-eligible");
        status = `≥ ${currentValue}`;
      } else {
        classes.push("is-smaller");
        status = `< ${currentValue}`;
      }
    } else if (view.phase !== "done" && countPhase && index > currentPrefixIndex) {
      classes.push("is-future");
      status = vi ? "CHƯA QUÉT" : "FUTURE";
    }
    return `<div class="${classes.join(" ")}">
      <span>pref[${index}]</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(status)}</small>
    </div>`;
  }).join("");

  const fenwickHtml = values.length
    ? values.map((value, zeroIndex) => {
        const index = zeroIndex + 1;
        const lowbit = index & -index;
        const left = index - lowbit + 1;
        const classes = ["even-odd-ratio-bit"];
        if (index === view.rank) classes.push("is-rank");
        if (queryPath.has(index)) classes.push("is-query");
        if (updatePath.has(index)) classes.push("is-update");
        const pathLabel = queryPath.has(index) ? "QUERY" : updatePath.has(index) ? "UPDATE" : "";
        return `<div class="${classes.join(" ")}">
          <span>rank ${index} · value ${escapeHtml(value)}</span>
          <strong>BIT[${index}] = ${escapeHtml(bit[zeroIndex] ?? 0)}</strong>
          <small>[rank ${left}..${index}]${pathLabel ? ` · ${pathLabel}` : ""}</small>
        </div>`;
      }).join("")
    : `<div class="even-odd-ratio-empty">${vi ? "Chưa nén tọa độ" : "Coordinates not compressed yet"}</div>`;

  const isQuery = String(view.phase || "").startsWith("query");
  const isUpdate = String(view.phase || "").startsWith("update");
  const smallerValue = view.smaller === null || view.smaller === undefined
    ? (isQuery ? view.queryTotal : "—")
    : view.smaller;
  const smallerLabel = isQuery && (view.smaller === null || view.smaller === undefined) ? "QUERY TOTAL" : "SMALLER";
  const addedValue = view.smaller === null || view.smaller === undefined ? "—" : view.added;
  const queryLabel = queryPath.size
    ? [...queryPath].map((index) => `BIT[${index}]`).join(" → ")
    : (vi ? "chưa đi qua node" : "no nodes visited");
  const updateLabel = updatePath.size
    ? [...updatePath].map((index) => `BIT[${index}]`).join(" → ")
    : (vi ? "chưa đi qua node" : "no nodes visited");
  const pathHtml = isQuery
    ? `<span class="is-query"><small>QUERY PATH</small><strong>${escapeHtml(queryLabel)}</strong></span>`
    : isUpdate
      ? `<span class="is-update"><small>UPDATE PATH</small><strong>${escapeHtml(updateLabel)}</strong></span>`
      : `<span><small>${vi ? "PREFIX HIỆN TẠI" : "CURRENT PREFIX"}</small><strong>${currentValue === null ? "—" : escapeHtml(currentValue)}</strong></span>`;
  const countEquation = view.phase === "done"
    ? `answer = ${escapeHtml(view.ans ?? 0)}`
    : view.smaller === null || view.smaller === undefined
      ? `${escapeHtml(view.seen ?? 0)} − smaller = ?`
      : `${escapeHtml(view.seen)} − ${escapeHtml(view.smaller)} = ${escapeHtml(view.added)}`;
  const summary = vi
    ? `Prefix hiện tại ${currentValue ?? "chưa có"}; đã thấy ${view.seen ?? 0}; đáp án ${view.ans ?? 0}.`
    : `Current prefix ${currentValue ?? "none"}; ${view.seen ?? 0} seen; answer ${view.ans ?? 0}.`;

  $("treeView").innerHTML = `<section class="even-odd-ratio-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="even-odd-ratio-phases">${phasesHtml}</div>
    <div class="even-odd-ratio-formula">
      <span class="is-even"><small>EVEN</small><strong>+b = +${escapeHtml(view.b)}</strong></span>
      <i aria-hidden="true">+</i>
      <span class="is-odd"><small>ODD</small><strong>−a = −${escapeHtml(view.a)}</strong></span>
      <i aria-hidden="true">⇒</i>
      <code>b·x − a·y ≤ 0</code>
      <i aria-hidden="true">⇒</i>
      <code>pref[current] ≤ pref[start]</code>
    </div>
    <div class="even-odd-ratio-strip">
      <header><strong>nums → weight</strong><small>${vi ? "chẵn +b · lẻ −a" : "even +b · odd −a"}</small></header>
      <div class="even-odd-ratio-scroll"><div class="even-odd-ratio-number-row">${numsHtml}</div></div>
    </div>
    <div class="even-odd-ratio-strip">
      <header><strong>prefix timeline</strong><small>${vi ? "prefix trước ≥ prefix hiện tại là một start hợp lệ" : "previous prefix ≥ current prefix is a valid start"}</small></header>
      <div class="even-odd-ratio-scroll"><div class="even-odd-ratio-prefix-row">${prefixHtml}</div></div>
    </div>
    <div class="even-odd-ratio-strip is-fenwick">
      <header><strong>compressed ranks + Fenwick</strong><small>${vi ? "query(rank−1) đếm prefix nhỏ hơn" : "query(rank−1) counts smaller prefixes"}</small></header>
      <div class="even-odd-ratio-scroll"><div class="even-odd-ratio-bit-row">${fenwickHtml}</div></div>
    </div>
    <div class="even-odd-ratio-counts">
      ${pathHtml}
      <span><small>SEEN</small><strong>${escapeHtml(view.seen ?? 0)}</strong></span>
      <span class="is-smaller"><small>${escapeHtml(smallerLabel)}</small><strong>${escapeHtml(smallerValue)}</strong></span>
      <span class="is-valid"><small>${vi ? "START HỢP LỆ" : "VALID STARTS"}</small><strong>${escapeHtml(addedValue)}</strong></span>
      <span class="is-answer"><small>ANSWER</small><strong>${escapeHtml(view.ans ?? 0)}</strong></span>
    </div>
    <div class="even-odd-ratio-equation"><span>${view.phase === "done" ? (vi ? "HOÀN TẤT" : "COMPLETE") : "seen − smaller"}</span><strong>${countEquation}</strong><small>${view.phase === "done" ? (vi ? "đã xử lý mọi prefix" : "all prefixes processed") : (vi ? "prefix trước ≥ current" : "previous prefixes ≥ current")}</small></div>
    <div class="even-odd-ratio-legend" aria-hidden="true">
      <span><i class="current"></i>${vi ? "prefix hiện tại" : "current prefix"}</span>
      <span><i class="eligible"></i>${vi ? "start hợp lệ (≥)" : "valid start (≥)"}</span>
      <span><i class="smaller"></i>${vi ? "bị query đếm (<)" : "counted as smaller (<)"}</span>
      <span><i class="query"></i>query path</span>
      <span><i class="update"></i>update path</span>
    </div>
  </section>`;
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

// ---- Pair chain timeline (#646) ----
function renderPairChainView(step) {
  const view = step.pairChainView;
  const pairs = view.pairs || [];
  const el = $("treeView");
  if (!pairs.length) {
    el.innerHTML = `<div class="pair-chain-empty">${lang === "vi" ? "Không có cặp" : "No pairs"}</div>`;
    return;
  }

  const minTime = Math.min(...pairs.map((pair) => pair.left));
  const maxTime = Math.max(...pairs.map((pair) => pair.right));
  const span = Math.max(1, maxTime - minTime);
  const width = 820;
  const leftPad = 102;
  const rightPad = 28;
  const top = 58;
  const rowHeight = 52;
  const axisY = top + pairs.length * rowHeight + 8;
  const height = axisY + 116;
  const plotWidth = width - leftPad - rightPad;
  const x = (value) => leftPad + ((value - minTime) / span) * plotWidth;
  const chosen = new Set(view.chosen || []);
  const skipped = new Set(view.skipped || []);
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : null;
  const current = currentIndex === null ? null : pairs[currentIndex];
  const previousEnd = view.previousEnd;
  const previousEndLabel = previousEnd === null || previousEnd === undefined
    ? "-inf"
    : previousEnd === -Infinity ? "-inf" : String(previousEnd);

  const tickValues = [...new Set(pairs.flatMap((pair) => [pair.left, pair.right]))].sort((a, b) => a - b);
  const shownTicks = tickValues.length <= 10
    ? tickValues
    : Array.from({ length: 6 }, (_, index) => minTime + (span * index) / 5);
  const ticks = shownTicks.map((time) => {
    const px = x(time);
    const label = Number.isInteger(time) ? time : Number(time.toFixed(1));
    return `<line class="pair-chain-grid" x1="${px}" y1="${top - 20}" x2="${px}" y2="${axisY}"></line>
      <text class="pair-chain-tick" x="${px}" y="${axisY + 23}" text-anchor="middle">${label}</text>`;
  }).join("");

  const rows = pairs.map((pair, index) => {
    const y = top + index * rowHeight;
    const classes = ["pair-chain-interval"];
    if (chosen.has(index)) classes.push("chosen");
    if (skipped.has(index)) classes.push("skipped");
    if (index === currentIndex) classes.push("current");
    const role = chosen.has(index)
      ? (lang === "vi" ? "chọn" : "take")
      : skipped.has(index) ? (lang === "vi" ? "bỏ" : "skip") : "";
    return `<g class="${classes.join(" ")}">
      <text class="pair-chain-row-label" x="${leftPad - 12}" y="${y + 23}" text-anchor="end">P${index + 1}</text>
      <line class="pair-chain-lane" x1="${leftPad}" y1="${y + 20}" x2="${width - rightPad}" y2="${y + 20}"></line>
      <rect x="${x(pair.left)}" y="${y + 5}" width="${Math.max(7, x(pair.right) - x(pair.left))}" height="30" rx="7"></rect>
      <circle class="pair-chain-dot left" cx="${x(pair.left)}" cy="${y + 20}" r="4"></circle>
      <circle class="pair-chain-dot right" cx="${x(pair.right)}" cy="${y + 20}" r="4"></circle>
      <text class="pair-chain-bar-label" x="${(x(pair.left) + x(pair.right)) / 2}" y="${y + 25}" text-anchor="middle">[${pair.left}, ${pair.right}]</text>
      ${role ? `<text class="pair-chain-role-label" x="${leftPad - 12}" y="${y + 39}" text-anchor="end">${escapeXml(role)}</text>` : ""}
      <title>${escapeXml(`P${index + 1} [${pair.left}, ${pair.right}]`)}</title>
    </g>`;
  }).join("");

  const currentStartLine = current
    ? `<line class="pair-chain-boundary current-start" x1="${x(current.left)}" y1="${top - 24}" x2="${x(current.left)}" y2="${axisY}"></line>
       <text class="pair-chain-boundary-label current-start" x="${x(current.left) + 6}" y="${top - 30}">left=${current.left}</text>`
    : "";
  const previousEndLine = current && Number.isFinite(previousEnd)
    ? `<line class="pair-chain-boundary previous-end" x1="${x(previousEnd)}" y1="${top - 24}" x2="${x(previousEnd)}" y2="${axisY}"></line>
       <text class="pair-chain-boundary-label previous-end" x="${x(previousEnd) + 6}" y="${top - 14}">current_end=${previousEnd}</text>`
    : "";

  let decision = "";
  if (current && view.decision) {
    const ok = view.decision === "take";
    const operator = ok ? ">" : "<=";
    const result = ok
      ? (lang === "vi" ? "CHỌN" : "TAKE")
      : (lang === "vi" ? "BỎ QUA" : "SKIP");
    decision = `<div class="pair-chain-decision ${ok ? "take" : "skip"}">
      <strong>${escapeHtml(String(current.left))} ${operator} ${escapeHtml(previousEndLabel)}</strong>
      <span>${escapeHtml(result)}</span>
    </div>`;
  } else if (view.phase === "done") {
    decision = `<div class="pair-chain-decision done">
      <strong>${lang === "vi" ? "Hoàn tất" : "Done"}</strong>
      <span>${lang === "vi" ? "Chuỗi đã chọn là đáp án" : "Chosen chain is the answer"}</span>
    </div>`;
  }

  const sortedChips = pairs.map((pair, index) => {
    const classes = ["pair-chain-chip"];
    if (chosen.has(index)) classes.push("chosen");
    if (skipped.has(index)) classes.push("skipped");
    if (index === currentIndex) classes.push("current");
    return `<span class="${classes.join(" ")}">P${index + 1} [${pair.left},${pair.right}]</span>`;
  }).join("");
  const chainChips = (view.chosen || []).length
    ? view.chosen.map((index) => {
        const pair = pairs[index];
        return `<span class="pair-chain-selected">[${pair.left},${pair.right}]</span>`;
      }).join(`<span class="pair-chain-arrow">→</span>`)
    : `<span class="pair-chain-empty-chip">∅</span>`;
  const phaseLabel = {
    original: lang === "vi" ? "Input ban đầu" : "Original input",
    sorted: lang === "vi" ? "Sort theo right tăng dần" : "Sorted by right endpoint",
    init: lang === "vi" ? "Khởi tạo current_end = -inf" : "Initialize current_end = -inf",
    inspect: lang === "vi" ? "Đang kiểm tra điều kiện nối chuỗi" : "Checking whether the pair can extend the chain",
    take: lang === "vi" ? "Chọn cặp này vào chain" : "Take this pair into the chain",
    skip: lang === "vi" ? "Bỏ qua vì không nối được" : "Skip because it cannot connect",
    done: lang === "vi" ? "Kết quả cuối cùng" : "Final result",
  }[view.phase] || "";
  const summary = lang === "vi"
    ? `Pair chain gồm ${pairs.length} cặp. Các cặp được quét theo right tăng dần.`
    : `Pair chain with ${pairs.length} pairs scanned by increasing right endpoint.`;

  el.innerHTML = `<div class="pair-chain-viz">
    <div class="pair-chain-status">${escapeHtml(phaseLabel)}</div>
    <div class="pair-chain-order"><span>${lang === "vi" ? "Thứ tự quét:" : "Scan order:"}</span>${sortedChips}</div>
    <svg class="pair-chain-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(summary)}">
      <title>${escapeXml(summary)}</title>
      ${ticks}
      <line class="pair-chain-axis" x1="${leftPad}" y1="${axisY}" x2="${width - rightPad}" y2="${axisY}"></line>
      ${rows}
      ${previousEndLine}
      ${currentStartLine}
    </svg>
    ${decision}
    <div class="pair-chain-result-row"><span>${lang === "vi" ? "Chain đang chọn:" : "Current chain:"}</span><div>${chainChips}</div></div>
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

// ---- Twitter Design (#355) ----
function renderTwitterView(step) {
  const view = step.twitterView;
  const el = $("treeView");
  const vi = lang === "vi";

  // Operations list on left sidebar
  const opsHtml = (view.operations || []).map((op, i) => {
    const active = i === view.activeIndex;
    const done = i < view.activeIndex;
    return `<div class="profit-op${active ? " active" : ""}${done ? " done" : ""}">
      <span class="profit-op-index">${i}</span>
      <span>${escapeHtml(op.label)}</span>
    </div>`;
  }).join("");

  // Tweets per user
  const userIds = [...new Set([
    ...Object.keys(view.tweets),
    ...Object.keys(view.following),
  ])].map(Number).sort((a, b) => a - b);

  const tweetsHtml = userIds.map((uid) => {
    const list = (view.tweets[uid] || []);
    const items = list.length ? list.map((t) => `<span class="twitter-tweet-chip">t${t.tweetId}</span>`).join("") : `<em>—</em>`;
    return `<div class="twitter-state-row">
      <span class="twitter-label">user ${uid}</span>
      <span class="twitter-chips">${items}</span>
    </div>`;
  }).join("") || `<div class="profit-empty">${vi ? "Chưa có tweet" : "No tweets yet"}</div>`;

  // Following per user
  const followHtml = userIds.map((uid) => {
    const set = view.following[uid] || [];
    const items = set.length ? set.map((f) => `<span class="twitter-follow-chip">→${f}</span>`).join("") : `<em>—</em>`;
    return `<div class="twitter-state-row">
      <span class="twitter-label">user ${uid}</span>
      <span class="twitter-chips">${items}</span>
    </div>`;
  }).join("") || `<div class="profit-empty">${vi ? "Chưa follow ai" : "No follows yet"}</div>`;

  // Heap for current getNewsFeed call
  const heapHtml = view.heap.length
    ? view.heap.map((entry, idx) => {
        const rootBadge = idx === 0 ? `<em class="twitter-root">${vi ? "ROOT" : "ROOT"}</em>` : "";
        const focused = entry.focused ? " focused" : "";
        return `<div class="profit-heap-entry current${focused}">
          <div class="profit-heap-top"><span>[${idx}]</span>${rootBadge}</div>
          <div class="profit-heap-name">ts=${escapeHtml(String(entry.ts))} &nbsp;·&nbsp; <strong>t${escapeHtml(String(entry.tweetId))}</strong> &nbsp;·&nbsp; user ${escapeHtml(String(entry.userId))}</div>
        </div>`;
      }).join("")
    : `<div class="profit-empty">heap = []</div>`;

  // Feed results
  const feedsHtml = view.feeds.length
    ? view.feeds.map((feed) =>
        `<div class="twitter-feed-row">
          <strong>getNewsFeed(${escapeHtml(String(feed.userId))})</strong>
          &nbsp;→&nbsp;
          [${feed.result.map((t) => `t${t}`).join(", ")}]
        </div>`
      ).join("")
    : `<div class="profit-empty">${vi ? "Chưa có getNewsFeed" : "No getNewsFeed yet"}</div>`;

  el.innerHTML = `<div class="profit-tracker-viz" role="img" aria-label="Twitter Design 355">
    <div class="profit-ops">${opsHtml}</div>
    <div class="profit-state-grid">
      <section class="profit-state-panel">
        <h4>${vi ? "tweets (mới nhất ở cuối)" : "tweets (most recent last)"}</h4>
        ${tweetsHtml}
      </section>
      <section class="profit-state-panel">
        <h4>${vi ? "following" : "following"}</h4>
        ${followHtml}
      </section>
    </div>
    <section class="profit-state-panel" style="margin:6px 0">
      <h4>heap &nbsp;·&nbsp; getNewsFeed &nbsp;<small style="font-weight:400;opacity:.75">${vi ? "(ts nhỏ hơn = mới hơn)" : "(smaller ts = more recent)"}</small></h4>
      <div class="profit-heap-list">${heapHtml}</div>
    </section>
    <div class="profit-result-row">
      <strong>${vi ? "Kết quả" : "Results"}</strong>
      ${feedsHtml}
    </div>
  </div>

  <style>
    .twitter-state-row{display:flex;align-items:center;gap:6px;padding:2px 0;font-size:.82rem}
    .twitter-label{min-width:52px;color:var(--text-muted,#888);font-weight:600}
    .twitter-chips{display:flex;flex-wrap:wrap;gap:4px}
    .twitter-tweet-chip{background:var(--hl-amber,#f59e0b22);border:1px solid var(--hl-amber,#f59e0b55);border-radius:4px;padding:1px 5px;font-size:.78rem;color:var(--hl-amber,#f59e0b)}
    .twitter-follow-chip{background:var(--hl-blue,#3b82f622);border:1px solid var(--hl-blue,#3b82f655);border-radius:4px;padding:1px 5px;font-size:.78rem;color:var(--hl-blue,#3b82f6)}
    .twitter-feed-row{font-size:.82rem;padding:2px 0}
    .twitter-root{font-size:.7rem;background:var(--hl-green,#22c55e33);color:var(--hl-green,#22c55e);border-radius:3px;padding:1px 4px;margin-left:4px}
  </style>`;
}

// ---- Gas Station track (#134) ----
function renderGasStationView(step) {
  const view = step.gasStationView;
  const el = $("treeView");
  const vi = lang === "vi";
  const answerStart = (view.answer !== null && view.answer >= 0) ? view.answer : null;

  // Feasibility bar: total gas vs total cost.
  const maxSum = Math.max(view.sumGas, view.sumCost, 1);
  const gasPct = Math.round((view.sumGas / maxSum) * 100);
  const costPct = Math.round((view.sumCost / maxSum) * 100);
  const feasHtml = `
    <div class="gas-feasibility ${view.feasible ? "ok" : "bad"}">
      <div class="gas-feas-row">
        <span class="gas-feas-label">⛽ Σgas = ${view.sumGas}</span>
        <div class="gas-feas-bar"><div class="gas-feas-fill gas" style="width:${gasPct}%"></div></div>
      </div>
      <div class="gas-feas-row">
        <span class="gas-feas-label">🚗 Σcost = ${view.sumCost}</span>
        <div class="gas-feas-bar"><div class="gas-feas-fill cost" style="width:${costPct}%"></div></div>
      </div>
      <div class="gas-feas-verdict">
        ${view.feasible
          ? (vi ? `Σgas ≥ Σcost → có 1 điểm xuất phát hợp lệ` : `Σgas ≥ Σcost → one valid start exists`)
          : (vi ? `Σgas < Σcost → không thể đi hết vòng (-1)` : `Σgas < Σcost → cannot complete the loop (-1)`)}
      </div>
    </div>`;

  // Tank gauge.
  const tankNeg = view.tank < 0;
  const tankHtml = `
    <div class="gas-tank-gauge">
      <div class="gas-tank-box ${tankNeg ? "neg" : "pos"}">
        <span class="gas-tank-label">${vi ? "Bình xăng (tank)" : "Fuel tank"}</span>
        <span class="gas-tank-value">${view.tank}</span>
      </div>
      <div class="gas-start-box">
        <span class="gas-start-label">${vi ? "Ứng viên start" : "Candidate start"}</span>
        <span class="gas-start-value">${view.start < view.n ? "▶ " + view.start : (vi ? "hết" : "none")}</span>
      </div>
    </div>`;

  // Station track.
  const cardsHtml = view.stations.map((s) => {
    let cls = "state-" + s.state;
    const isAnswer = answerStart !== null && s.index === answerStart;
    if (isAnswer) cls = "state-answer";
    const isCurrent = view.currentIndex === s.index;
    const isStart = view.start === s.index && !isAnswer && view.phase !== "answer";
    if (isCurrent) cls += " is-current";
    if (isStart) cls += " is-start";
    const netCls = s.net >= 0 ? "pos" : "neg";
    const tankShown = s.tank === null ? "—" : String(s.tank);
    const tankCls = s.tank === null ? "" : (s.tank < 0 ? "neg" : "pos");
    const badge = isAnswer ? "★ START" : (isStart ? "▶ start" : (isCurrent ? (vi ? "xe ở đây" : "car here") : ""));
    return `<div class="gas-station-card ${cls}">
      <div class="gas-st-head">station ${s.index}${badge ? `<span class="gas-st-badge">${badge}</span>` : ""}</div>
      <div class="gas-st-row"><span>⛽ gas</span><strong>${s.gas}</strong></div>
      <div class="gas-st-row"><span>🚗 cost</span><strong>${s.cost}</strong></div>
      <div class="gas-st-net ${netCls}">net ${s.net >= 0 ? "+" : ""}${s.net}</div>
      <div class="gas-st-tank ${tankCls}">tank ${tankShown}</div>
    </div>`;
  }).join(`<div class="gas-arrow">→</div>`);

  const summary = vi
    ? `Trạm xăng: start=${view.start}, tank=${view.tank}.`
    : `Gas station: start=${view.start}, tank=${view.tank}.`;

  el.innerHTML = `<div class="gas-station-viz" role="img" aria-label="${escapeHtml(summary)}">
    ${feasHtml}
    ${tankHtml}
    <div class="gas-track">${cardsHtml}</div>
    <div class="gas-legend">
      <span><i class="lg-pending"></i>${vi ? "chưa tới" : "pending"}</span>
      <span><i class="lg-reached"></i>${vi ? "đã qua (tank≥0)" : "reached (tank≥0)"}</span>
      <span><i class="lg-current"></i>${vi ? "xe đang ở đây" : "car here"}</span>
      <span><i class="lg-start"></i>${vi ? "ứng viên start" : "candidate start"}</span>
      <span><i class="lg-discarded"></i>${vi ? "đã loại bỏ" : "discarded"}</span>
      <span><i class="lg-answer"></i>${vi ? "start hợp lệ" : "valid start"}</span>
    </div>
  </div>`;
}

// ---- Gas Deposits on a circular track (#9135) ----
function renderGasCircularView(step) {
  const view = step.gasCircularView;
  const el = $("treeView");
  const vi = lang === "vi";
  const C = view.circumference || 100;
  const cx = 170, cy = 170, R = 120;

  // deg measured clockwise from the top (12 o'clock = position 0).
  const polar = (deg, r) => {
    const t = (-90 + deg) * Math.PI / 180;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  };
  const angleOf = (position) => ((position % C) / C) * 360;

  // Base track circle.
  let svg = `<circle cx="${cx}" cy="${cy}" r="${R}" class="gasc-track-ring" />`;

  // Traveled arc (green). If distance >= C, show a full ring.
  if (view.pos !== null && view.distance > 0) {
    if (view.distance >= C) {
      svg += `<circle cx="${cx}" cy="${cy}" r="${R}" class="gasc-traveled-ring" />`;
    } else {
      const a0 = angleOf(view.deposits[view.startIndex].position);
      const sweep = (view.distance / C) * 360;
      const a1 = a0 + sweep;
      const [x0, y0] = polar(a0, R);
      const [x1, y1] = polar(a1, R);
      const largeArc = sweep > 180 ? 1 : 0;
      svg += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 ${largeArc} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" class="gasc-traveled-arc" />`;
    }
  }

  // Wrap marker at the top (position 0 / circumference).
  const [wx, wy] = polar(0, R);
  svg += `<line x1="${cx}" y1="${cy - R - 14}" x2="${cx}" y2="${cy - R + 14}" class="gasc-wrap-mark" />`;
  svg += `<text x="${cx}" y="${cy - R - 20}" class="gasc-wrap-text" text-anchor="middle">0 / ${C}</text>`;

  // Deposit dots + labels.
  view.deposits.forEach((d) => {
    const a = angleOf(d.position);
    const [dx, dy] = polar(a, R);
    let cls = "gasc-dot state-" + d.state;
    if (view.currentIndex === d.index) cls += " is-current";
    svg += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="11" class="${cls}" />`;
    svg += `<text x="${dx.toFixed(1)}" y="${(dy + 4).toFixed(1)}" class="gasc-dot-idx" text-anchor="middle">${d.index}</text>`;
    // Outer label with position & gas.
    const [lx, ly] = polar(a, R + 30);
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="gasc-dot-label" text-anchor="middle">@${d.position} ⛽${d.gas}</text>`;
  });

  // Car marker.
  if (view.pos !== null) {
    const a = angleOf(view.pos);
    const [carX, carY] = polar(a, R);
    svg += `<text x="${carX.toFixed(1)}" y="${(carY + 8).toFixed(1)}" class="gasc-car" text-anchor="middle">🚗</text>`;
  }

  const gaugeHtml = `
    <div class="gasc-gauge">
      <div class="gasc-box"><span class="gasc-box-label">${vi ? "Vị trí (pos)" : "Position (pos)"}</span><span class="gasc-box-value">${view.pos === null ? "—" : view.pos}</span></div>
      <div class="gasc-box fuel"><span class="gasc-box-label">${vi ? "Xăng (tank)" : "Fuel (tank)"}</span><span class="gasc-box-value">${view.tank === null ? "—" : view.tank}</span></div>
      <div class="gasc-box dist"><span class="gasc-box-label">${vi ? "Quãng đường" : "Distance"}</span><span class="gasc-box-value">${view.answer !== null ? view.answer : view.distance}</span></div>
      <div class="gasc-box"><span class="gasc-box-label">${vi ? "Số vòng" : "Loops"}</span><span class="gasc-box-value">${view.loops}</span></div>
    </div>`;

  const summary = vi
    ? `Đường đua vòng tròn chu vi ${C}: pos=${view.pos}, tank=${view.tank}, quãng đường=${view.distance}.`
    : `Circular track of circumference ${C}: pos=${view.pos}, tank=${view.tank}, distance=${view.distance}.`;

  el.innerHTML = `<div class="gasc-viz" role="img" aria-label="${escapeHtml(summary)}">
    ${gaugeHtml}
    <div class="gasc-stage">
      <svg viewBox="0 0 340 360" class="gasc-svg" preserveAspectRatio="xMidYMid meet">${svg}</svg>
    </div>
    <div class="gasc-legend">
      <span><i class="lg-start"></i>${vi ? "kho xuất phát" : "start deposit"}</span>
      <span><i class="lg-collected"></i>${vi ? "đã ghé & đổ xăng" : "reached & refueled"}</span>
      <span><i class="lg-current"></i>${vi ? "đang xét" : "current target"}</span>
      <span><i class="lg-unreached"></i>${vi ? "không tới được" : "not reached"}</span>
      <span><i class="lg-pending"></i>${vi ? "chưa tới" : "pending"}</span>
    </div>
  </div>`;
}

// ---- Gas Deposits max distance number-line (#9134) ----
function renderGasDepositsView(step) {
  const view = step.gasDepositsView;
  const el = $("treeView");
  const vi = lang === "vi";
  const scaleMax = view.scaleMax || 1;
  const pct = (x) => Math.max(0, Math.min(100, (x / scaleMax) * 100));

  const startPct = view.startPos === null ? 0 : pct(view.startPos);
  const carPct = view.pos === null ? startPct : pct(view.pos);
  const travWidth = Math.max(0, carPct - startPct);

  // Deposit markers on the number line.
  const markersHtml = view.deposits.map((d) => {
    let cls = "state-" + d.state;
    if (view.currentIndex === d.index) cls += " is-current";
    return `<div class="gasdep-marker ${cls}" style="left:${pct(d.position)}%">
      <div class="gasdep-dot"></div>
      <div class="gasdep-mlabel"><span class="gasdep-mpos">@${d.position}</span><span class="gasdep-mgas">⛽${d.gas}</span></div>
    </div>`;
  }).join("");

  const carHtml = view.pos === null ? "" :
    `<div class="gasdep-car" style="left:${carPct}%">🚗</div>`;

  const lineHtml = `
    <div class="gasdep-line">
      <div class="gasdep-track">
        <div class="gasdep-baseline"></div>
        <div class="gasdep-traveled" style="left:${startPct}%;width:${travWidth}%"></div>
        ${markersHtml}
        ${carHtml}
      </div>
      <div class="gasdep-scale"><span>0</span><span>${scaleMax}</span></div>
    </div>`;

  const tankNeg = view.tank !== null && view.tank < 0;
  const gaugeHtml = `
    <div class="gasdep-gauge">
      <div class="gasdep-box">
        <span class="gasdep-box-label">${vi ? "Vị trí xe (pos)" : "Car position (pos)"}</span>
        <span class="gasdep-box-value">${view.pos === null ? "—" : view.pos}</span>
      </div>
      <div class="gasdep-box ${tankNeg ? "neg" : "fuel"}">
        <span class="gasdep-box-label">${vi ? "Bình xăng (tank)" : "Fuel (tank)"}</span>
        <span class="gasdep-box-value">${view.tank === null ? "—" : view.tank}</span>
      </div>
      <div class="gasdep-box dist">
        <span class="gasdep-box-label">${vi ? "Quãng đường" : "Distance"}</span>
        <span class="gasdep-box-value">${view.answer !== null ? view.answer : view.distance}</span>
      </div>
    </div>`;

  const summary = vi
    ? `Kho xăng: pos=${view.pos}, tank=${view.tank}, quãng đường=${view.distance}.`
    : `Gas deposits: pos=${view.pos}, tank=${view.tank}, distance=${view.distance}.`;

  el.innerHTML = `<div class="gasdep-viz" role="img" aria-label="${escapeHtml(summary)}">
    ${gaugeHtml}
    ${lineHtml}
    <div class="gasdep-legend">
      <span><i class="lg-start"></i>${vi ? "kho xuất phát" : "start deposit"}</span>
      <span><i class="lg-collected"></i>${vi ? "đã ghé & đổ xăng" : "reached & refueled"}</span>
      <span><i class="lg-current"></i>${vi ? "đang xét" : "current target"}</span>
      <span><i class="lg-unreached"></i>${vi ? "không tới được" : "not reached"}</span>
      <span><i class="lg-pending"></i>${vi ? "chưa tới" : "pending"}</span>
    </div>
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

// ---- Cyclic-sort slot map (#41) ----
function renderCyclicSortView(step) {
  const view = step.cyclicSortView;
  const el = $("treeView");
  const vi = lang === "vi";
  const values = Array.isArray(view.values) ? view.values : [];
  const correct = new Set(view.correctIndices || []);
  const ignored = new Set(view.ignoredIndices || []);
  const duplicates = new Set(view.duplicateIndices || []);

  const phaseNumber = view.phase === "place" ? 1 : 2;
  const actionByReason = {
    "outside-range": vi
      ? `${values[view.currentIndex]} nằm ngoài 1..${values.length} → bỏ qua`
      : `${values[view.currentIndex]} is outside 1..${values.length} → ignore`,
    "already-correct": vi
      ? `${values[view.currentIndex]} đã ở đúng nhà → không swap`
      : `${values[view.currentIndex]} is already home → no swap`,
    duplicate: vi
      ? `Ô đích đã có ${values[view.currentIndex]} → đây là bản trùng, không swap`
      : `The target already has ${values[view.currentIndex]} → duplicate, do not swap`,
    swap: vi
      ? `Nhà của ${values[view.currentIndex]}: index ${view.targetIndex}`
      : `Home of ${values[view.currentIndex]}: index ${view.targetIndex}`,
    swapped: vi
      ? `Swap xong: giá trị đã được đặt vào đúng nhà`
      : `Swap complete: the value is now in its home slot`,
    match: vi
      ? `Giá trị thực tế khớp giá trị cần có → quét tiếp`
      : `Actual value matches the expected value → continue`,
    missing: vi
      ? `Giá trị thực tế khác giá trị cần có → tìm thấy số bị thiếu`
      : `Actual value differs from expected → missing value found`,
  };
  let actionText = actionByReason[view.reason] || view.action || "";
  if (!view.reason && view.phase === "place") {
    actionText = view.currentIndex >= 0
      ? (vi
        ? `Đang xét index ${view.currentIndex}, giá trị ${values[view.currentIndex]}`
        : `Processing index ${view.currentIndex}, value ${values[view.currentIndex]}`)
      : (vi
        ? `Các giá trị 1..${values.length} có nhà từ index 0..${Math.max(0, values.length - 1)}`
        : `Values 1..${values.length} have homes at indices 0..${Math.max(0, values.length - 1)}`);
  } else if (!view.reason && view.phase === "scan") {
    actionText = vi ? "Quét từ trái sang phải để tìm ô sai đầu tiên" : "Scan left to right for the first mismatched slot";
  } else if (!view.reason && view.phase === "answer") {
    actionText = vi ? `Tất cả ô đều khớp → đáp án = ${view.answer}` : `Every slot matches → answer = ${view.answer}`;
  }

  const slotsHtml = values.map((value, index) => {
    const classes = ["cyclic-slot"];
    const labels = [];
    if (index === view.currentIndex) {
      classes.push("current");
      labels.push(view.phase === "scan" ? (vi ? "ĐANG KIỂM TRA" : "CHECKING") : "i");
    }
    if (index === view.targetIndex && view.targetIndex !== view.currentIndex) {
      classes.push("target");
      labels.push(vi ? "Ô ĐÍCH" : "TARGET");
    }
    if (index === view.placedIndex) {
      classes.push("placed");
      labels.push(vi ? "VỪA ĐẶT ĐÚNG" : "JUST PLACED");
    } else if (correct.has(index)) {
      classes.push("correct");
      labels.push(vi ? "ĐÚNG NHÀ" : "HOME");
    }
    if (ignored.has(index) && index !== view.targetIndex) {
      classes.push("ignored");
      labels.push(vi ? "BỎ QUA" : "IGNORE");
    } else if (duplicates.has(index)) {
      classes.push("duplicate");
      labels.push(vi ? "TRÙNG" : "DUPLICATE");
    }
    if ((view.phase === "scan" || view.phase === "answer") && index < view.scanIndex) {
      classes.push("scanned");
    }
    if (index === view.missingIndex) {
      classes.push("missing");
      labels.length = 0;
      labels.push(vi ? "THIẾU Ở ĐÂY" : "MISSING HERE");
    }

    return `<div class="${classes.join(" ")}">
      <div class="cyclic-slot-index">index ${index}</div>
      <div class="cyclic-slot-value">${escapeHtml(value)}</div>
      <div class="cyclic-slot-expected">${vi ? "cần" : "expects"} <strong>${index + 1}</strong></div>
      <div class="cyclic-slot-state">${escapeHtml(labels.join(" · ") || (vi ? "chưa xử lý" : "unresolved"))}</div>
    </div>`;
  }).join("");

  const answerHtml = view.answer !== undefined
    ? `<div class="cyclic-answer"><span>${vi ? "Số dương nhỏ nhất bị thiếu" : "Smallest missing positive"}</span><strong>${escapeHtml(view.answer)}</strong></div>`
    : "";
  const summary = vi
    ? `Mô phỏng cyclic sort gồm ${values.length} ô, đang ở pha ${phaseNumber}.`
    : `Cyclic-sort simulation with ${values.length} slots, currently in phase ${phaseNumber}.`;

  el.innerHTML = `<div class="cyclic-sort-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="cyclic-sort-phases">
      <div class="cyclic-phase ${phaseNumber === 1 ? "active" : "done"}"><b>1</b><span>${vi ? "Đặt x về index x − 1" : "Place x at index x − 1"}</span></div>
      <div class="cyclic-phase ${phaseNumber === 2 ? "active" : ""}"><b>2</b><span>${vi ? "Tìm ô sai đầu tiên" : "Find first mismatch"}</span></div>
    </div>
    <div class="cyclic-sort-rule"><strong>${vi ? "Quy tắc" : "Rule"}:</strong> value <b>x</b> → ${vi ? "nhà" : "home"} index <b>x − 1</b></div>
    <div class="cyclic-sort-action">${escapeHtml(actionText)}</div>
    <div class="cyclic-sort-grid">${slotsHtml}</div>
    ${answerHtml}
    <div class="cyclic-sort-legend">
      <span><i class="current"></i>${vi ? "đang xử lý" : "current i"}</span>
      <span><i class="target"></i>${vi ? "ô sẽ swap tới" : "swap target"}</span>
      <span><i class="correct"></i>${vi ? "đúng nhà" : "correct home"}</span>
      <span><i class="ignored"></i>${vi ? "ngoài 1..n" : "outside 1..n"}</span>
      <span><i class="missing"></i>${vi ? "số bị thiếu" : "missing value"}</span>
    </div>
  </div>`;
}

function renderKruskalEffortView(step) {
  const view = step.kruskalEffortView;
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = { build: 0, sort: 1, find: 2, union: 3, check: 4, done: 5 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Tạo cạnh", "2 · Sort ↑", "3 · Find root", "4 · Union", "5 · Kiểm tra S↔T"]
    : ["1 · Build edges", "2 · Sort ↑", "3 · Find roots", "4 · Union", "5 · Check S↔T"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    const icon = state === "done" ? "✓" : state === "active" ? "▶" : "○";
    return `<span class="${state}">${icon} ${escapeHtml(label)}</span>`;
  }).join("");

  const edges = Array.isArray(view.edges) ? view.edges : [];
  const accepted = new Set((view.acceptedEdges || []).map((edge) => edge.key));
  const skipped = new Set(view.skippedEdgeKeys || []);
  const currentKey = view.currentEdge ? view.currentEdge.key : null;
  const maxVisibleEdges = 18;
  let edgeWindowStart = 0;
  if (edges.length > maxVisibleEdges && view.edgeIndex >= 0) {
    edgeWindowStart = Math.max(0, Math.min(view.edgeIndex - 5, edges.length - maxVisibleEdges));
  }
  const visibleEdges = edges.slice(edgeWindowStart, edgeWindowStart + maxVisibleEdges);
  const edgeChips = visibleEdges.map((edge, offset) => {
    const index = edgeWindowStart + offset;
    const classes = [];
    if (accepted.has(edge.key)) classes.push("accepted");
    if (skipped.has(edge.key)) classes.push("skipped");
    if (edge.key === currentKey && index === view.edgeIndex) classes.push("current");
    const [fromRow, fromCol] = edge.from;
    const [toRow, toCol] = edge.to;
    return `<span class="${classes.join(" ")}"><small>#${index + 1}</small><b>(${fromRow},${fromCol})↔(${toRow},${toCol})</b><strong>Δ=${edge.diff}</strong></span>`;
  }).join("");
  const hiddenBefore = edgeWindowStart > 0 ? `<em>… ${edgeWindowStart} ${vi ? "cạnh trước" : "earlier edges"}</em>` : "";
  const hiddenAfterCount = edges.length - edgeWindowStart - visibleEdges.length;
  const hiddenAfter = hiddenAfterCount > 0 ? `<em>+${hiddenAfterCount} ${vi ? "cạnh" : "edges"}</em>` : "";
  const edgeLaneTitle = view.sorted
    ? (vi ? "CẠNH ĐÃ SORT — nhỏ nhất ở bên trái" : "SORTED EDGES — smallest first")
    : (vi ? "CẠNH ĐANG ĐƯỢC TẠO — chưa sort" : "EDGES BEING BUILT — unsorted");

  const width = 104 + Math.max(0, view.cols - 1) * 96;
  const height = 100 + Math.max(0, view.rows - 1) * 92;
  const center = (cell) => ({ x: 52 + cell[1] * 96, y: 50 + cell[0] * 92 });
  const pathKeys = new Set((view.pathEdges || []).map((edge) => edge.key));
  const pathCells = new Set();
  for (const edge of view.pathEdges || []) {
    pathCells.add(`${edge.from[0]},${edge.from[1]}`);
    pathCells.add(`${edge.to[0]},${edge.to[1]}`);
  }

  const acceptedLines = (view.acceptedEdges || []).map((edge) => {
    const from = center(edge.from);
    const to = center(edge.to);
    const classes = ["kruskal-link", "accepted"];
    if (pathKeys.has(edge.key)) classes.push("path");
    if (pathKeys.has(edge.key) && edge.diff === view.answer) classes.push("bottleneck");
    return `<line class="${classes.join(" ")}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
  }).join("");
  let currentLine = "";
  if (view.currentEdge && view.event !== "done") {
    const from = center(view.currentEdge.from);
    const to = center(view.currentEdge.to);
    currentLine = `<line class="kruskal-link current" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
  }

  const nodes = view.heights.map((row, rowIndex) => row.map((cellHeight, colIndex) => {
    const cell = [rowIndex, colIndex];
    const cellId = rowIndex * view.cols + colIndex;
    const point = center(cell);
    const root = view.roots[cellId];
    const cellKey = `${rowIndex},${colIndex}`;
    const isStart = rowIndex === view.start[0] && colIndex === view.start[1];
    const isTarget = rowIndex === view.target[0] && colIndex === view.target[1];
    const isCurrentCell = view.currentCell && rowIndex === view.currentCell[0] && colIndex === view.currentCell[1];
    const isEdgeEnd = view.currentEdge && (
      (rowIndex === view.currentEdge.from[0] && colIndex === view.currentEdge.from[1]) ||
      (rowIndex === view.currentEdge.to[0] && colIndex === view.currentEdge.to[1])
    );
    const classes = ["kruskal-cell", `component-${Math.abs(root) % 6}`];
    if (isCurrentCell) classes.push("scan");
    if (isEdgeEnd) classes.push("edge-end");
    if (pathCells.has(cellKey)) classes.push("path");
    const endpoint = isStart ? "S" : isTarget ? "T" : "";
    return `<g class="${classes.join(" ")}" aria-label="cell (${rowIndex},${colIndex}), height ${cellHeight}, root ${root}">
      <rect x="${point.x - 34}" y="${point.y - 31}" width="68" height="62" rx="9"></rect>
      <text class="coord" x="${point.x - 29}" y="${point.y - 16}">${rowIndex},${colIndex}</text>
      ${endpoint ? `<text class="endpoint" x="${point.x + 26}" y="${point.y - 16}">${endpoint}</text>` : ""}
      <text class="height" x="${point.x}" y="${point.y + 5}">${escapeHtml(cellHeight)}</text>
      <text class="root" x="${point.x}" y="${point.y + 22}">root R${root}</text>
    </g>`;
  }).join("")).join("");
  const gridSummary = vi
    ? `Grid ${view.rows} × ${view.cols}; màu ô biểu diễn component DSU hiện tại.`
    : `${view.rows} × ${view.cols} grid; cell color represents its current DSU component.`;
  const gridSvg = `<svg class="kruskal-grid-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(gridSummary)}">
    ${acceptedLines}${currentLine}${nodes}
  </svg>`;

  let edgeDetail;
  if (view.currentEdge) {
    const edge = view.currentEdge;
    const heightA = view.heights[edge.from[0]][edge.from[1]];
    const heightB = view.heights[edge.to[0]][edge.to[1]];
    const roots = view.rootsBefore;
    let decision = vi ? "Chưa Union" : "Not unioned yet";
    let decisionClass = "waiting";
    if (view.unionChanged === true) {
      decision = roots
        ? (vi ? `Gộp R${roots.u} → R${roots.v}` : `Merge R${roots.u} → R${roots.v}`)
        : (vi ? "Đã gộp hai component" : "Merged two components");
      decisionClass = "merged";
    } else if (view.unionChanged === false) {
      decision = vi ? "Cùng root → bỏ qua chu trình" : "Same root → skip cycle";
      decisionClass = "skipped";
    } else if (roots) {
      decision = roots.u === roots.v
        ? (vi ? "Cùng root → sẽ bỏ qua" : "Same root → will skip")
        : (vi ? "Khác root → có thể gộp" : "Different roots → can merge");
      decisionClass = roots.u === roots.v ? "skipped" : "waiting";
    }
    edgeDetail = `<div class="kruskal-edge-detail">
      <div><small>${vi ? "CẠNH HIỆN TẠI" : "CURRENT EDGE"}</small><strong>(${edge.from[0]},${edge.from[1]}) ↔ (${edge.to[0]},${edge.to[1]})</strong></div>
      <div class="kruskal-diff"><small>|${heightA} − ${heightB}|</small><strong>${edge.diff}</strong></div>
      ${roots ? `<div class="kruskal-roots-before"><span>find(u) = <b>R${roots.u}</b></span><span>find(v) = <b>R${roots.v}</b></span></div>` : ""}
      <div class="kruskal-union-decision ${decisionClass}">${escapeHtml(decision)}</div>
    </div>`;
  } else {
    edgeDetail = `<div class="kruskal-threshold-rule"><code>${vi ? "Mở các cạnh theo diff tăng dần" : "Open edges by ascending diff"}</code><span>${vi ? "Lần đầu S nối T ⇒ ngưỡng nhỏ nhất" : "First time S reaches T ⇒ minimum threshold"}</span></div>`;
  }

  const componentChips = (view.groups || []).map((group) => {
    const cells = group.cells.map(([row, col]) => `(${row},${col})`).join(" ");
    return `<span class="component-chip component-${Math.abs(group.root) % 6}"><b>R${group.root}</b><small>${escapeHtml(cells)}</small></span>`;
  }).join("");
  const connectionClass = view.connected ? "connected" : "separate";
  const connectionText = view.connected
    ? (vi ? "✓ CÙNG COMPONENT" : "✓ SAME COMPONENT")
    : (vi ? "CHƯA KẾT NỐI" : "NOT CONNECTED");
  const connectionHtml = `<div class="kruskal-connection ${connectionClass}">
    <span><small>START</small><b>S · R${view.startRoot}</b></span>
    <strong>${view.connected ? "═" : "≠"}</strong>
    <span><small>TARGET</small><b>T · R${view.targetRoot}</b></span>
    <em>${connectionText}</em>
  </div>`;

  const pathHtml = view.pathEdges && view.pathEdges.length
    ? `<div class="kruskal-final-path"><strong>${vi ? `ĐƯỜNG KẾT NỐI · effort = ${view.answer}` : `CONNECTED PATH · effort = ${view.answer}`}</strong><div>${view.pathEdges.map((edge) => {
      const bottleneck = edge.diff === view.answer;
      return `<span class="${bottleneck ? "bottleneck" : ""}">(${edge.from[0]},${edge.from[1]})→(${edge.to[0]},${edge.to[1]}) <b>Δ=${edge.diff}</b></span>`;
    }).join("")}</div></div>`
    : "";

  el.innerHTML = `<div class="kruskal-effort-viz">
    <div class="kruskal-phases">${phases}</div>
    <div class="kruskal-edge-lane"><div><strong>${edgeLaneTitle}</strong><small>${edges.length} ${vi ? "cạnh" : "edges"}</small></div><div>${hiddenBefore}${edgeChips}${hiddenAfter}</div></div>
    <div class="kruskal-main">
      <div class="kruskal-grid-wrap">${gridSvg}<div class="kruskal-grid-legend"><span><i class="accepted"></i>${vi ? "cạnh đã Union" : "unioned edge"}</span><span><i class="current"></i>${vi ? "cạnh đang xét" : "current edge"}</span><span><i class="bottleneck"></i>bottleneck</span></div></div>
      <div class="kruskal-state">${edgeDetail}${connectionHtml}<div class="kruskal-components"><strong>DSU COMPONENTS · ${view.groups.length}</strong><div>${componentChips}</div></div></div>
    </div>
    ${pathHtml}
  </div>`;
}

function renderParallelCoursesView(step) {
  const view = step.parallelCoursesView;
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = { build: 0, seed: 1, semester: 2, relax: 3, check: 4, done: 5 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Xây graph", "2 · Tìm in-degree 0", "3 · Học song song", "4 · Gỡ cạnh", "5 · Kiểm tra cycle"]
    : ["1 · Build graph", "2 · Find in-degree 0", "3 · Parallel semester", "4 · Remove edges", "5 · Check cycle"];
  const phaseHtml = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    const icon = state === "done" ? "✓" : state === "active" ? "▶" : "○";
    return `<span class="${state}">${icon} ${escapeHtml(label)}</span>`;
  }).join("");

  const columns = view.planColumns || [];
  const maxRows = Math.max(1, ...columns.map((column) => column.courses.length));
  const graphWidth = Math.max(600, columns.length * 210);
  const graphHeight = Math.max(280, 115 + maxRows * 92);
  const columnWidth = graphWidth / Math.max(1, columns.length);
  const positions = new Map();
  let columnSvg = "";
  columns.forEach((column, columnIndex) => {
    const centerX = columnWidth * (columnIndex + 0.5);
    const revealCycle = column.kind === "cycle" && view.event === "cycle";
    const columnLabel = column.kind === "cycle"
      ? (revealCycle ? (vi ? "⛔ CHU TRÌNH" : "⛔ CYCLE") : (vi ? "CHƯA GIẢI QUYẾT" : "UNRESOLVED"))
      : (vi ? `HỌC KỲ ${column.semester}` : `SEMESTER ${column.semester}`);
    if (columnIndex > 0) {
      const dividerX = columnWidth * columnIndex;
      columnSvg += `<line class="pc-column-divider" x1="${dividerX}" y1="34" x2="${dividerX}" y2="${graphHeight - 14}"></line>`;
    }
    columnSvg += `<text class="pc-column-label${revealCycle ? " cycle" : ""}" x="${centerX}" y="24" text-anchor="middle">${escapeXml(columnLabel)}</text>`;

    if (column.kind === "cycle" && column.courses.length > 1) {
      const radius = Math.min(68, columnWidth * 0.28);
      const centerY = graphHeight / 2 + 10;
      column.courses.forEach((course, index) => {
        const angle = (2 * Math.PI * index) / column.courses.length - Math.PI / 2;
        positions.set(course, {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      });
    } else {
      const usableHeight = graphHeight - 72;
      column.courses.forEach((course, row) => {
        positions.set(course, {
          x: centerX,
          y: 48 + ((row + 1) * usableHeight) / (column.courses.length + 1),
        });
      });
    }
  });

  const builtEdges = new Set(view.builtEdgeKeys || []);
  const processedEdges = new Set(view.processedEdgeKeys || []);
  const activeEdgeKey = view.activeEdge ? view.activeEdge.key : null;
  const nodeRadius = 36;
  const edgeSvg = (view.relations || []).map((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return "";
    const active = edge.key === activeEdgeKey;
    const processed = processedEdges.has(edge.key);
    const built = builtEdges.has(edge.key);
    const state = active ? "active" : processed ? "processed" : built ? "built" : "unbuilt";
    const marker = active ? "pc-arrow-active" : processed ? "pc-arrow-processed" : "pc-arrow";
    if (edge.from === edge.to) {
      return `<path class="pc-edge ${state}" d="M ${from.x} ${from.y - nodeRadius} C ${from.x + 82} ${from.y - 78}, ${from.x + 82} ${from.y + 78}, ${from.x} ${from.y + nodeRadius}" marker-end="url(#${marker})"></path>`;
    }
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    const unitX = dx / distance;
    const unitY = dy / distance;
    const x1 = from.x + unitX * (nodeRadius + 2);
    const y1 = from.y + unitY * (nodeRadius + 2);
    const x2 = to.x - unitX * (nodeRadius + (active ? 8 : 6));
    const y2 = to.y - unitY * (nodeRadius + (active ? 8 : 6));
    return `<line class="pc-edge ${state}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${marker})"></line>`;
  }).join("");

  const completedSet = new Set(view.completed || []);
  const betweenSemesters = Number(view.semester) > 0
    && (view.event === "semester-complete" || (view.event === "while-check" && (view.queue || []).length > 0));
  const currentQueue = betweenSemesters
    ? []
    : view.batchActive
      ? view.currentBatch
      : view.queue || [];
  const displayedNextQueue = betweenSemesters ? view.queue || [] : view.nextQueue || [];
  const currentQueueSet = new Set(currentQueue);
  const nextQueueSet = new Set(displayedNextQueue);
  const stuckSet = new Set(view.event === "cycle" ? view.stuckCourses || [] : []);
  const nodeSvg = (view.courses || []).map((course) => {
    const point = positions.get(course);
    if (!point) return "";
    const indegree = view.indegree[course - 1];
    const classes = ["pc-node"];
    let stateLabel = indegree === 0 ? (vi ? "sẵn sàng" : "ready") : (vi ? "đang chờ" : "waiting");
    if (completedSet.has(course)) {
      classes.push("completed");
      stateLabel = vi ? "đã học" : "done";
    }
    if (currentQueueSet.has(course)) {
      classes.push("queued");
      stateLabel = vi ? "queue hiện tại" : "current queue";
    }
    if (nextQueueSet.has(course)) {
      classes.push("next-queued");
      stateLabel = vi ? "queue kế tiếp" : "next queue";
    }
    if (course === view.currentNeighbor) classes.push("neighbor");
    if (course === view.currentCourse) {
      classes.push("current");
      stateLabel = vi ? "đang xử lý" : "processing";
    }
    if (stuckSet.has(course)) {
      classes.push("stuck");
      stateLabel = vi ? "kẹt cycle" : "cycle stuck";
    }
    return `<g class="${classes.join(" ")}" aria-label="course ${course}, in-degree ${indegree}, ${escapeHtml(stateLabel)}">
      <circle cx="${point.x}" cy="${point.y}" r="${nodeRadius}"></circle>
      <text class="course" x="${point.x}" y="${point.y - 7}">C${course}</text>
      <text class="degree" x="${point.x}" y="${point.y + 10}">in = ${indegree}</text>
      <text class="state" x="${point.x}" y="${point.y + 25}">${escapeXml(stateLabel)}</text>
    </g>`;
  }).join("");

  const graphSummary = vi
    ? "Đồ thị môn học được chia theo học kỳ, với mũi tên từ tiên quyết tới môn phụ thuộc."
    : "Course graph grouped by semester, with arrows from prerequisites to dependent courses.";
  const graphHtml = `<svg class="pc-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(graphSummary)}">
    <defs>
      <marker id="pc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
      <marker id="pc-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
      <marker id="pc-arrow-processed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
    </defs>
    ${columnSvg}${edgeSvg}${nodeSvg}
  </svg>`;

  function queueChips(items, className) {
    return items.length
      ? items.map((course) => `<span class="${className}">C${course}</span>`).join("")
      : `<em>∅</em>`;
  }

  let actionHtml;
  if (view.event === "cycle") {
    actionHtml = `<div class="pc-action cycle"><small>${vi ? "BỊ KẸT" : "STUCK"}</small><strong>${(view.stuckCourses || []).map((course) => `C${course}`).join(", ")}</strong><span>${vi ? "queue rỗng nhưng in-degree vẫn > 0" : "queue is empty but in-degree remains > 0"}</span></div>`;
  } else if (view.event === "done") {
    actionHtml = `<div class="pc-action success"><small>${vi ? "HOÀN THÀNH" : "COMPLETE"}</small><strong>${view.answer} ${vi ? "học kỳ" : "semester(s)"}</strong><span>${vi ? "Mọi môn đã được xử lý" : "Every course was processed"}</span></div>`;
  } else if (view.event === "capture-size") {
    const batchText = (view.currentBatch || []).map((course) => `C${course}`).join(" + ") || "∅";
    actionHtml = `<div class="pc-action course"><small>${vi ? "KHÓA BATCH HIỆN TẠI" : "LOCK CURRENT BATCH"}</small><strong>size = ${view.loopSize}</strong><b>${batchText}</b><span>${vi ? "Môn vừa được mở khóa phải vào queue của học kỳ sau" : "A newly unlocked course must enter next semester's queue"}</span></div>`;
  } else if (view.event === "semester-complete") {
    const readyText = (view.queue || []).map((course) => `C${course}`).join(" + ") || "∅";
    actionHtml = `<div class="pc-action success"><small>${vi ? `XONG HỌC KỲ ${view.semester}` : `SEMESTER ${view.semester} COMPLETE`}</small><strong>${readyText}</strong><span>${vi ? `Trở thành queue đầu học kỳ ${view.semester + 1}` : `Becomes the starting queue for semester ${view.semester + 1}`}</span></div>`;
  } else if (["seed-check-ready", "seed-check-blocked", "seed-ready"].includes(view.event)) {
    const degree = view.indegree[view.currentCourse - 1];
    const decision = view.event === "seed-ready"
      ? (vi ? `queue.append(${view.currentCourseIndex})` : `queue.append(${view.currentCourseIndex})`)
      : view.event === "seed-check-ready"
        ? (vi ? "điều kiện True → bước sau sẽ append" : "condition is True → the next step appends")
      : (vi ? `còn ${degree} prerequisite → tiếp tục chờ` : `${degree} prerequisite(s) remain → keep waiting`);
    actionHtml = `<div class="pc-action ${view.event === "seed-ready" ? "success" : "rule"}"><small>${vi ? "INDEX → MÔN HỌC" : "INDEX → COURSE"}</small><strong>i=${view.currentCourseIndex} → C${view.currentCourse}</strong><b>indegree[${view.currentCourseIndex}] = ${degree}</b><span>${escapeHtml(decision)}</span></div>`;
  } else if (view.phase === "build" && view.activeEdge) {
    const buildValue = view.event === "increment-indegree"
      ? `indegree[${view.activeEdge.to - 1}]: ${view.indegreeBefore} → ${view.indegreeAfter}`
      : view.event === "add-edge"
        ? `graph[${view.activeEdge.from - 1}].append(${view.activeEdge.to - 1})`
        : (vi ? "Đọc cặp prerequisite" : "Read prerequisite pair");
    actionHtml = `<div class="pc-action edge"><small>${vi ? "XÂY ĐỒ THỊ" : "BUILD GRAPH"}</small><strong>C${view.activeEdge.from} → C${view.activeEdge.to}</strong><b>${escapeHtml(buildValue)}</b><span>${vi ? "Mũi tên đi từ prerequisite tới môn phụ thuộc" : "The arrow goes from prerequisite to dependent course"}</span></div>`;
  } else if (view.activeEdge) {
    const degreeText = view.indegreeBefore !== undefined
      ? `indegree[${view.activeEdge.to - 1}]: ${view.indegreeBefore} → ${view.indegreeAfter}`
      : `indegree[${view.activeEdge.to - 1}] = ${view.indegree[view.activeEdge.to - 1]}`;
    const decisionText = view.readyDecision === true
      ? (vi ? `C${view.activeEdge.to} đã sẵn sàng cho học kỳ sau` : `C${view.activeEdge.to} is ready for next semester`)
      : view.readyDecision === false
        ? (vi ? `C${view.activeEdge.to} vẫn phải chờ` : `C${view.activeEdge.to} is still blocked`)
        : (vi ? "Gỡ một prerequisite đã hoàn thành" : "Remove one completed prerequisite");
    actionHtml = `<div class="pc-action edge"><small>${vi ? "CẠNH ĐANG XỬ LÝ" : "ACTIVE EDGE"}</small><strong>C${view.activeEdge.from} → C${view.activeEdge.to}</strong><b>${escapeHtml(degreeText)}</b><span>${escapeHtml(decisionText)}</span></div>`;
  } else if (view.event === "result-check") {
    const ok = view.allCompleted === true;
    actionHtml = `<div class="pc-action ${ok ? "success" : "cycle"}"><small>count == n</small><strong>${view.count} == ${view.n} → ${ok ? "True" : "False"}</strong><span>${ok ? (vi ? "trả semester ở dòng kế tiếp" : "return semester on the next line") : (vi ? "đi vào nhánh else" : "enter the else branch")}</span></div>`;
  } else if (view.event === "else-branch") {
    actionHtml = `<div class="pc-action cycle"><small>ELSE</small><strong>count &lt; n</strong><span>${vi ? "còn môn chưa thể lấy khỏi queue" : "some courses could not be removed from the queue"}</span></div>`;
  } else if (view.currentCourse !== null && view.currentCourse !== undefined) {
    const processingSemester = view.activeSemester || view.semester || 1;
    actionHtml = `<div class="pc-action course"><small>${vi ? "INDEX ĐANG XỬ LÝ" : "CURRENT INDEX"}</small><strong>curr=${view.currentCourseIndex} → C${view.currentCourse}</strong><span>${vi ? `Batch học kỳ ${processingSemester} · duyệt graph[curr]` : `Semester ${processingSemester} batch · scan graph[curr]`}</span></div>`;
  } else {
    actionHtml = `<div class="pc-action rule"><code>queue stores 0-based indices</code><span>${vi ? "Mỗi BFS layer = một học kỳ" : "Each BFS layer = one semester"}</span></div>`;
  }

  const indegreeHtml = (view.courses || []).map((course) => {
    const degree = view.indegree[course - 1];
    const classes = [];
    if (course === view.currentNeighbor) classes.push("active");
    if (degree === 0) classes.push("ready");
    if (completedSet.has(course)) classes.push("completed");
    if (stuckSet.has(course)) classes.push("stuck");
    return `<span class="${classes.join(" ")}"><small>C${course} · [${course - 1}]</small><strong>${degree}</strong><em>${degree === 0 ? (vi ? "ready" : "ready") : `${degree} ${vi ? "còn lại" : "left"}`}</em></span>`;
  }).join("");

  const historyHtml = (view.semesterHistory || []).length
    ? view.semesterHistory.map((item) => `<span><small>S${item.semester}</small><strong>${item.courses.map((course) => `C${course}`).join(" + ")}</strong></span>`).join("")
    : `<em>${vi ? "Chưa hoàn thành học kỳ nào" : "No completed semester yet"}</em>`;

  const queueSemester = view.activeSemester || ((view.semester || 0) + 1);
  const currentQueueTitle = betweenSemesters
    ? (vi ? `HỌC KỲ ${view.semester} · ĐÃ XONG` : `SEMESTER ${view.semester} · COMPLETE`)
    : view.batchActive
      ? (vi ? `HỌC KỲ ${queueSemester} · CÒN LẠI` : `SEMESTER ${queueSemester} · REMAINING`)
      : (vi ? "QUEUE SẴN SÀNG BAN ĐẦU" : "INITIAL READY QUEUE");
  const nextQueueTitle = view.batchActive
    ? (vi ? `APPEND CHO HỌC KỲ ${queueSemester + 1}` : `APPENDED FOR SEMESTER ${queueSemester + 1}`)
    : (vi ? `QUEUE HỌC KỲ ${queueSemester}` : `SEMESTER ${queueSemester} QUEUE`);

  el.innerHTML = `<div class="pc-viz">
    <div class="pc-phases">${phaseHtml}</div>
    <div class="pc-summary">
      <span><small>semester</small><strong>${view.semester ?? "—"}</strong></span>
      <span><small>count</small><strong>${view.count ?? "—"}/${view.n}</strong></span>
      <span><small>${vi ? "QUEUE READY" : "READY QUEUE"}</small><strong>${currentQueue.length + displayedNextQueue.length}</strong></span>
    </div>
    <div class="pc-queues">
      <div><small>${currentQueueTitle}</small><section>${queueChips(currentQueue, "current")}</section></div>
      <i>→</i>
      <div><small>${nextQueueTitle}</small><section>${queueChips(displayedNextQueue, "next")}</section></div>
    </div>
    <div class="pc-main">
      <div class="pc-graph">${graphHtml}<div class="pc-legend"><span><i class="ready"></i>${vi ? "ready" : "ready"}</span><span><i class="current"></i>${vi ? "đang xử lý" : "processing"}</span><span><i class="completed"></i>${vi ? "đã học" : "done"}</span><span><i class="next"></i>${vi ? "queue sau" : "next queue"}</span></div></div>
      <div class="pc-debug">
        ${actionHtml}
        <div class="pc-indegree"><strong>IN-DEGREE</strong><div>${indegreeHtml}</div></div>
        <div class="pc-history"><strong>${vi ? "CÁC HỌC KỲ ĐÃ XONG" : "COMPLETED SEMESTERS"}</strong><div>${historyHtml}</div></div>
      </div>
    </div>
  </div>`;
}

function loudRichKahnHtml(view) {
  const vi = lang === "vi";
  const phaseIndex = { build: 0, seed: 1, propagate: 2, unlock: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Dựng cạnh richer → poorer", "2 · Enqueue indegree = 0", "3 · Truyền best quiet xuống", "4 · Giảm indegree và mở khóa"]
    : ["1 · Build richer → poorer edges", "2 · Enqueue indegree = 0", "3 · Propagate the best quiet", "4 · Decrement indegree and unlock"];
  const phases = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < phaseIndex;
    const state = done ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const builtEdgeKeys = new Set(view.builtEdgeKeys || []);
  const processedEdgeKeys = new Set(view.processedEdgeKeys || []);
  const queueSet = new Set(view.queue || []);
  const processedSet = new Set(view.processed || []);
  const relationChips = (view.richerEdges || []).map((edge, index) => {
    const classes = [];
    if (builtEdgeKeys.has(edge.key)) classes.push("built");
    if (processedEdgeKeys.has(edge.key)) classes.push("processed");
    if (edge.key === view.activeEdgeKey) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>#${index + 1}</small><strong>P${edge.a} &gt; P${edge.b}</strong><em>P${edge.a} → P${edge.b}</em></span>`;
  }).join("");

  const layoutAdj = Array.from({ length: view.n }, () => []);
  const layoutIndegree = new Array(view.n).fill(0);
  for (const edge of view.richerEdges || []) {
    layoutAdj[edge.a].push(edge.b);
    layoutIndegree[edge.b] += 1;
  }
  const layoutQueue = [];
  const levels = new Array(view.n).fill(0);
  layoutIndegree.forEach((degree, person) => { if (degree === 0) layoutQueue.push(person); });
  for (let index = 0; index < layoutQueue.length; index++) {
    const person = layoutQueue[index];
    for (const poorer of layoutAdj[person]) {
      levels[poorer] = Math.max(levels[poorer], levels[person] + 1);
      layoutIndegree[poorer] -= 1;
      if (layoutIndegree[poorer] === 0) layoutQueue.push(poorer);
    }
  }
  const maxLevel = Math.max(0, ...levels);
  const layers = Array.from({ length: maxLevel + 1 }, () => []);
  levels.forEach((level, person) => layers[level].push(person));
  const maxLayerSize = Math.max(1, ...layers.map((layer) => layer.length));
  const graphWidth = Math.max(520, 100 + maxLayerSize * 116);
  const graphHeight = Math.max(150, 104 + maxLevel * 124);
  const nodeRadius = 36;
  const positions = new Map();
  layers.forEach((layer, level) => {
    layer.forEach((person, index) => {
      positions.set(person, {
        x: ((index + 1) * graphWidth) / (layer.length + 1),
        y: 54 + level * 124,
      });
    });
  });

  const edgesHtml = (view.richerEdges || []).map((edge) => {
    const from = positions.get(edge.a);
    const to = positions.get(edge.b);
    if (!from || !to) return "";
    const active = edge.key === view.activeEdgeKey;
    const classes = ["lrk-edge"];
    if (!builtEdgeKeys.has(edge.key)) classes.push("unbuilt");
    else if (processedEdgeKeys.has(edge.key)) classes.push("processed");
    else classes.push("built");
    if (active) classes.push("active");
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const x1 = from.x + ux * (nodeRadius + 2);
    const y1 = from.y + uy * (nodeRadius + 2);
    const x2 = to.x - ux * (nodeRadius + 7);
    const y2 = to.y - uy * (nodeRadius + 7);
    return `<line class="${classes.join(" ")}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${active ? "lrk-arrow-active" : "lrk-arrow"})"></line>`;
  }).join("");

  const nodesHtml = Array.from({ length: view.n }, (_, person) => {
    const point = positions.get(person) || { x: graphWidth / 2, y: graphHeight / 2 };
    const degree = view.indegree === null ? null : view.indegree[person];
    const best = view.answer === null ? null : view.answer[person];
    const classes = ["lrk-node"];
    if (degree !== null && degree > 0) classes.push("locked");
    if (degree === 0 && !processedSet.has(person)) classes.push("ready");
    if (queueSet.has(person)) classes.push("queued");
    if (processedSet.has(person)) classes.push("processed");
    if (person === view.seedPerson) classes.push("seed");
    if (person === view.activeU) classes.push("source");
    if (person === view.activeV) classes.push("target");
    const degreeText = degree === null ? "in —" : `in ${degree}`;
    const bestText = best === null ? "best —" : `best P${best} · q${view.quiet[best]}`;
    const stateText = person === view.activeU
      ? "SOURCE"
      : person === view.activeV
        ? "TARGET"
        : queueSet.has(person)
          ? "QUEUE"
          : processedSet.has(person)
            ? "DONE"
            : degree === 0
              ? "READY"
              : degree === null
                ? "WAIT"
                : `WAIT ${degree}`;
    return `<g class="${classes.join(" ")}" aria-label="person ${person}, quiet ${view.quiet[person]}, ${degreeText}, ${bestText}">
      <circle cx="${point.x}" cy="${point.y}" r="${nodeRadius}"></circle>
      <text class="quiet" x="${point.x}" y="${point.y - 18}">quiet ${view.quiet[person]}</text>
      <text class="person" x="${point.x}" y="${point.y + 4}">P${person}</text>
      <text class="best" x="${point.x}" y="${point.y + 23}">${bestText}</text>
      <text class="degree" x="${point.x}" y="${point.y + nodeRadius + 15}">${degreeText} · ${stateText}</text>
    </g>`;
  }).join("");
  const graphSummary = vi
    ? "Đồ thị Kahn có mũi tên từ người giàu hơn xuống người nghèo hơn."
    : "Kahn graph with arrows from richer people down to poorer people.";
  const graphSvg = `<svg class="lrk-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(graphSummary)}">
    <defs>
      <marker id="lrk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10z"></path></marker>
      <marker id="lrk-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10z"></path></marker>
    </defs>
    ${edgesHtml}${nodesHtml}
  </svg>`;

  const queueHtml = view.queue === null
    ? `<em>${vi ? "chưa khởi tạo" : "not initialized"}</em>`
    : view.queue.length
      ? view.queue.map((person, index) => `<span class="${person === view.enqueuedPerson ? "new" : ""}"><small>${index === 0 ? "FRONT" : index === view.queue.length - 1 ? "BACK" : `#${index}`}</small><strong>P${person}</strong><em>best P${view.answer[person]} · q${view.quiet[view.answer[person]]}</em></span>`).join("")
      : `<em>${vi ? "queue rỗng" : "empty queue"}</em>`;
  const currentHtml = Number.isInteger(view.activeU) && ["dequeue", "select-edge", "compare", "update-answer", "decrement-indegree", "check-ready", "enqueue"].includes(view.event)
    ? `<span><small>CURRENT u</small><strong>P${view.activeU}</strong><em>best P${view.answer[view.activeU]} · q${view.quiet[view.answer[view.activeU]]}</em></span>`
    : `<em>${vi ? "chưa popleft" : "nothing dequeued"}</em>`;
  const topoHtml = (view.topoOrder || []).length
    ? view.topoOrder.map((person, index) => `<span><small>#${index + 1}</small><strong>P${person}</strong></span>`).join(`<b>→</b>`)
    : `<em>${vi ? "chưa xử lý node" : "no processed node"}</em>`;

  let actionHtml;
  if (view.candidatePerson !== undefined && view.currentBestPerson !== undefined) {
    const update = view.shouldUpdate === true;
    actionHtml = `<div class="lrk-compare">
      <span class="candidate"><small>${vi ? `CANDIDATE TỪ P${view.activeU}` : `CANDIDATE FROM P${view.activeU}`}</small><strong>P${view.candidatePerson}</strong><b>quiet ${view.quiet[view.candidatePerson]}</b></span>
      <div><code>${view.quiet[view.candidatePerson]} ${update ? "<" : "≥"} ${view.quiet[view.currentBestPerson]}</code><strong class="${update ? "update" : "keep"}">${update ? "UPDATE" : "KEEP"}</strong></div>
      <span><small>${vi ? `BEST HIỆN TẠI CỦA P${view.activeV}` : `CURRENT BEST FOR P${view.activeV}`}</small><strong>P${view.currentBestPerson}</strong><b>quiet ${view.quiet[view.currentBestPerson]}</b></span>
    </div>`;
  } else if (view.indegreeBefore !== undefined && view.indegreeAfter !== undefined) {
    actionHtml = `<div class="lrk-degree-action"><small>${vi ? "SỐ RICHER PREDECESSOR CHƯA XỬ LÝ" : "UNPROCESSED RICHER PREDECESSORS"}</small><strong>indegree[P${view.activeV}]</strong><code>${view.indegreeBefore} → ${view.indegreeAfter}</code><span>${view.indegreeAfter === 0 ? (vi ? "Đã nhận đủ candidate · sẵn sàng enqueue" : "All candidates received · ready to enqueue") : (vi ? `Còn chờ ${view.indegreeAfter} predecessor` : `Still waiting for ${view.indegreeAfter} predecessor(s)`)}</span></div>`;
  } else if (view.event === "seed-check") {
    const degree = view.indegree[view.seedPerson];
    actionHtml = `<div class="lrk-seed-action ${view.ready ? "ready" : "locked"}"><small>SEED QUEUE</small><strong>P${view.seedPerson}</strong><code>indegree[${view.seedPerson}] = ${degree}</code><span>${view.ready ? (vi ? "0 → enqueue" : "0 → enqueue") : (vi ? `${degree} → chưa enqueue` : `${degree} → do not enqueue`)}</span></div>`;
  } else if (["seed-enqueue", "enqueue"].includes(view.event) && Number.isInteger(view.enqueuedPerson)) {
    actionHtml = `<div class="lrk-seed-action ready"><small>${vi ? "THÊM VÀO QUEUE" : "ADD TO QUEUE"}</small><strong>P${view.enqueuedPerson}</strong><code>q.append(${view.enqueuedPerson})</code><span>${vi ? `P${view.enqueuedPerson} đi vào BACK của queue` : `P${view.enqueuedPerson} moves to the BACK of the queue`}</span></div>`;
  } else if (view.event === "check-ready") {
    actionHtml = `<div class="lrk-seed-action ${view.ready ? "ready" : "locked"}"><small>${vi ? "MỞ KHÓA TARGET" : "UNLOCK TARGET"}</small><strong>P${view.activeV}</strong><code>indegree[${view.activeV}] = ${view.indegree[view.activeV]}</code><span>${view.ready ? (vi ? "Đã nhận đủ mọi candidate" : "All candidates received") : (vi ? "Vẫn còn predecessor chưa xử lý" : "Still has an unprocessed predecessor")}</span></div>`;
  } else if (Number.isInteger(view.activeU) && Number.isInteger(view.activeV)) {
    actionHtml = `<div class="lrk-edge-action"><small>RICHER → POORER</small><strong>P${view.activeU} → P${view.activeV}</strong><span>${vi ? `Truyền best quiet từ P${view.activeU} xuống P${view.activeV}` : `Propagate the best quiet from P${view.activeU} down to P${view.activeV}`}</span></div>`;
  } else if (view.event === "dequeue") {
    actionHtml = `<div class="lrk-edge-action"><small>POP FRONT</small><strong>P${view.activeU} · best P${view.answer[view.activeU]}</strong><span>${vi ? "Candidate của u đã hoàn chỉnh vì indegree[u] = 0" : "u's candidate is finalized because indegree[u] = 0"}</span></div>`;
  } else {
    actionHtml = `<div class="lrk-rule"><code>answer[v] = quieter(answer[v], answer[u])</code><span>${vi ? "Chỉ truyền từ richer u xuống poorer v; v chỉ vào queue khi indegree[v] = 0." : "Propagate only from richer u to poorer v; v enters the queue only when indegree[v] = 0."}</span></div>`;
  }

  const indegreeHtml = Array.from({ length: view.n }, (_, person) => {
    const degree = view.indegree === null ? null : view.indegree[person];
    const classes = [];
    if (person === view.activeU) classes.push("source");
    if (person === view.activeV || person === view.seedPerson) classes.push("target");
    if (queueSet.has(person)) classes.push("queued");
    if (processedSet.has(person)) classes.push("processed");
    if (degree === 0 && !processedSet.has(person)) classes.push("ready");
    const status = degree === null
      ? (vi ? "chưa tạo" : "not created")
      : processedSet.has(person)
        ? (vi ? "đã xử lý" : "processed")
        : queueSet.has(person)
          ? "queue"
          : degree === 0
            ? "ready"
            : (vi ? `chờ ${degree}` : `wait ${degree}`);
    return `<span class="${classes.join(" ")}"><small>P${person}</small><strong>${degree === null ? "—" : degree}</strong><em>${status}</em></span>`;
  }).join("");

  const answerHtml = Array.from({ length: view.n }, (_, person) => {
    const best = view.answer === null ? null : view.answer[person];
    const classes = [];
    if (person === view.activeV) classes.push("target");
    if (person === view.changedPerson) classes.push("changed");
    if (processedSet.has(person)) classes.push("finalized");
    return `<span class="${classes.join(" ")}"><small>answer[${person}]</small><strong>${best === null ? "—" : `P${best}`}</strong><em>${best === null ? "not initialized" : `quiet ${view.quiet[best]}`}</em></span>`;
  }).join("");

  return `<div class="loud-rich-kahn">
    <div class="lrk-phases">${phases}</div>
    <div class="lrk-direction"><strong>RICHER</strong><code>P a → P b</code><strong>POORER</strong><span>${vi ? "candidate quiet đi cùng chiều mũi tên" : "quiet candidates follow the arrow"}</span></div>
    <div class="lrk-relations"><header><strong>RICHER INPUT</strong><span>${vi ? "a > b trở thành cạnh a → b" : "a > b becomes edge a → b"}</span></header><div>${relationChips || "∅"}</div></div>
    <div class="lrk-queue-flow">
      <div><small>CURRENT</small><section>${currentHtml}</section></div><b>→</b>
      <div><small>QUEUE · FRONT → BACK</small><section>${queueHtml}</section></div>
    </div>
    <div class="lrk-main">
      <div class="lrk-graph">${graphSvg}<div class="lrk-legend"><span><i class="source"></i>source u</span><span><i class="target"></i>target v</span><span><i class="queued"></i>queue</span><span><i class="processed"></i>${vi ? "đã xử lý" : "processed"}</span></div></div>
      <div class="lrk-debug">${actionHtml}<div class="lrk-indegree"><header><strong>INDEGREE</strong><span>${vi ? "số richer predecessor còn chờ" : "richer predecessors still pending"}</span></header><div>${indegreeHtml}</div></div></div>
    </div>
    <div class="lrk-topo"><strong>TOPO ORDER</strong><div>${topoHtml}</div></div>
    <div class="lrk-answer"><header><strong>ANSWER</strong><span>answer[i] = ${vi ? "người quiet nhất giàu hơn hoặc bằng i" : "quietest person richer than or equal to i"}</span></header><div>${answerHtml}</div></div>
  </div>`;
}

function renderLoudRichView(step) {
  const view = step.loudRichView || step.loudRichV2;
  if (!view) return;
  const el = $("treeView");
  const vi = lang === "vi";

  const isBFS = !!step.loudRichV2;

  if (isBFS) {
    el.innerHTML = loudRichKahnHtml(view);
    return;
  }

  // Original DFS rendering
  const phaseIndex = { build: 0, dfs: 1, explore: 2, compare: 3, memo: 4, done: 5 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Đảo cạnh", "2 · Gọi DFS", "3 · Đi tới richer", "4 · So quiet", "5 · Memo"]
    : ["1 · Reverse edges", "2 · Call DFS", "3 · Visit richer", "4 · Compare quiet", "5 · Memoize"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const builtKeys = new Set(view.builtEdgeKeys || []);
  const currentBuildKey = view.currentBuildEdge ? view.currentBuildEdge.key : null;
  const relationChips = (view.richerEdges || []).map((edge, index) => {
    const classes = [];
    if (builtKeys.has(edge.key)) classes.push("built");
    if (edge.key === currentBuildKey) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>#${index + 1} · INPUT</small><b>P${edge.richer} &gt; P${edge.poorer}</b><em>DFS ${edge.poorer}→${edge.richer}</em></span>`;
  }).join("");

  const adjacency = Array.from({ length: view.n }, () => []);
  for (const edge of view.richerEdges || []) adjacency[edge.from].push(edge.to);
  const rankMemo = new Array(view.n).fill(null);
  const visiting = new Set();
  function rankOf(node) {
    if (rankMemo[node] !== null) return rankMemo[node];
    if (visiting.has(node)) return 0;
    visiting.add(node);
    const rank = adjacency[node].length ? 1 + Math.max(...adjacency[node].map(rankOf)) : 0;
    visiting.delete(node);
    rankMemo[node] = rank;
    return rank;
  }
  for (let node = 0; node < view.n; node++) rankOf(node);
  const maxRank = Math.max(0, ...rankMemo);
  const layers = Array.from({ length: maxRank + 1 }, () => []);
  rankMemo.forEach((rank, node) => layers[rank].push(node));
  const maxLayerSize = Math.max(1, ...layers.map((layer) => layer.length));
  const nodeRadius = 38;
  const layerGap = 108;
  const graphWidth = Math.max(440, 90 + maxLayerSize * 92);
  const graphHeight = 100 + maxRank * layerGap;
  const positions = new Map();
  layers.forEach((layer, rank) => {
    layer.forEach((node, index) => {
      positions.set(node, {
        x: ((index + 1) * graphWidth) / (layer.length + 1),
        y: 48 + rank * layerGap,
      });
    });
  });

  const activeFrom = view.activeEdge ? view.activeEdge[0] : null;
  const activeTo = view.activeEdge ? view.activeEdge[1] : null;
  const graphEdges = (view.richerEdges || []).map((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    const isActive = (edge.from === activeFrom && edge.to === activeTo) || edge.key === currentBuildKey;
    const classes = ["loud-rich-edge", builtKeys.has(edge.key) ? "built" : "unbuilt"];
    if (isActive) classes.push("active");
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    const unitX = dx / distance;
    const unitY = dy / distance;
    const startPadding = nodeRadius + 2;
    const endPadding = nodeRadius + (isActive ? 7 : 5);
    const x1 = from.x + unitX * startPadding;
    const y1 = from.y + unitY * startPadding;
    const x2 = to.x - unitX * endPadding;
    const y2 = to.y - unitY * endPadding;
    return `<line class="${classes.join(" ")}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${isActive ? "loud-rich-arrow-active" : "loud-rich-arrow"})"></line>`;
  }).join("");

  const stackSet = new Set(view.callStack || []);
  const doneSet = new Set(view.doneNodes || []);
  const graphNodes = Array.from({ length: view.n }, (_, person) => {
    const point = positions.get(person);
    const classes = ["loud-rich-node"];
    if (doneSet.has(person)) classes.push("done");
    if (stackSet.has(person)) classes.push("in-stack");
    if (person === view.currentNode) classes.push("current");
    if (person === view.neighbor) classes.push("neighbor");
    if (person === view.candidatePerson) classes.push("candidate");
    const memo = view.answer[person];
    const memoText = memo === -1 ? "ans —" : `ans P${memo} · q${view.quiet[memo]}`;
    return `<g class="${classes.join(" ")}" aria-label="person ${person}, quiet ${view.quiet[person]}, ${memoText}">
      <circle cx="${point.x}" cy="${point.y}" r="${nodeRadius}"></circle>
      <text class="quiet" x="${point.x}" y="${point.y - 17}">quiet ${view.quiet[person]}</text>
      <text class="person" x="${point.x}" y="${point.y + 7}">P${person}</text>
      <text class="memo" x="${point.x}" y="${point.y + 26}">${memoText}</text>
    </g>`;
  }).join("");
  const graphSummary = vi
    ? "Đồ thị DFS có mũi tên từ người nghèo hơn tới người giàu hơn."
    : "DFS graph with arrows from a poorer person to a richer person.";
  const graphSvg = `<svg class="loud-rich-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(graphSummary)}">
    <defs>
      <marker id="loud-rich-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
      <marker id="loud-rich-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
    </defs>
    ${graphEdges}${graphNodes}
  </svg>`;

  const stackHtml = (view.callStack || []).length
    ? view.callStack.map((person, index) => `<span class="${index === view.callStack.length - 1 ? "top" : ""}"><small>${index === 0 ? "ROOT" : `#${index + 1}`}</small><b>dfs(${person})</b></span>`).join("<i>→</i>")
    : `<em>∅</em>`;

  let detailHtml;
  if (view.candidatePerson !== null && view.candidatePerson !== undefined) {
    const operator = view.willUpdate === null ? "?" : view.willUpdate ? "<" : "≥";
    const decision = view.willUpdate === null
      ? (vi ? "Đang chuẩn bị so sánh" : "Preparing comparison")
      : view.willUpdate
        ? (vi ? `UPDATE answer[${view.currentNode}] = ${view.candidatePerson}` : `UPDATE answer[${view.currentNode}] = ${view.candidatePerson}`)
        : (vi ? `KEEP answer[${view.currentNode}] = ${view.currentBestPerson}` : `KEEP answer[${view.currentNode}] = ${view.currentBestPerson}`);
    detailHtml = `<div class="loud-rich-compare">
      <span class="candidate"><small>${vi ? `TỪ answer[${view.neighbor}]` : `FROM answer[${view.neighbor}]`}</small><b>P${view.candidatePerson}</b><strong>quiet ${view.candidateQuiet}</strong></span>
      <i>${escapeHtml(operator)}</i>
      <span><small>${vi ? "BEST HIỆN TẠI" : "CURRENT BEST"}</small><b>P${view.currentBestPerson}</b><strong>quiet ${view.currentBestQuiet}</strong></span>
      <em class="${view.willUpdate ? "update" : "keep"}">${escapeHtml(decision)}</em>
    </div>`;
  } else if (["memo-hit", "memo-return"].includes(view.event) && view.currentBestPerson !== null) {
    detailHtml = `<div class="loud-rich-memo-hit"><small>MEMO HIT</small><strong>dfs(${view.currentNode}) → P${view.currentBestPerson}</strong><span>quiet ${view.currentBestQuiet} · ${vi ? "không DFS lại" : "no recomputation"}</span></div>`;
  } else if (view.currentNode !== null && view.currentNode !== undefined) {
    const neighbors = (view.graph[view.currentNode] || []).map((person) => `P${person}`).join(", ") || "∅";
    const best = view.answer[view.currentNode];
    detailHtml = `<div class="loud-rich-frame"><small>${vi ? "FRAME HIỆN TẠI" : "CURRENT FRAME"}</small><strong>dfs(${view.currentNode})</strong><span>${vi ? "richer neighbors" : "richer neighbors"}: ${neighbors}</span><span>${vi ? "best" : "best"}: ${best === -1 ? "—" : `P${best} · quiet ${view.quiet[best]}`}</span></div>`;
  } else {
    detailHtml = `<div class="loud-rich-rule"><code>answer[x] = argmin quiet[y]</code><span>${vi ? "với y = x hoặc y giàu hơn x" : "where y = x or y is richer than x"}</span></div>`;
  }

  const memoCells = Array.from({ length: view.n }, (_, person) => {
    const winner = view.answer[person];
    const classes = [];
    if (doneSet.has(person)) classes.push("done");
    if (person === view.currentNode) classes.push("current");
    if (person === view.changedPerson) classes.push("changed");
    return `<span class="${classes.join(" ")}"><small>P${person} · quiet ${view.quiet[person]}</small><b>${winner === -1 ? "answer —" : `answer P${winner}`}</b><em>${winner === -1 ? "" : `quiet ${view.quiet[winner]}`}</em></span>`;
  }).join("");

  const finalHtml = view.event === "done"
    ? `<div class="loud-rich-final"><strong>${vi ? "KẾT QUẢ" : "RESULT"}</strong><div>${view.answer.map((winner, person) => `<span>P${person} → <b>P${winner}</b><small>quiet ${view.quiet[winner]}</small></span>`).join("")}</div></div>`
    : "";

  el.innerHTML = `<div class="loud-rich-viz">
    <div class="loud-rich-phases">${phases}</div>
    <div class="loud-rich-relations"><div><strong>RICHER INPUT</strong><small>${vi ? "Pa > Pb · lưu DFS b→a" : "Pa > Pb · store DFS b→a"}</small></div><div>${relationChips || "∅"}</div></div>
    <div class="loud-rich-main">
      <div class="loud-rich-graph">${graphSvg}<div class="loud-rich-legend"><span><i class="current"></i>${vi ? "đang chạy" : "current"}</span><span><i class="neighbor"></i>richer neighbor</span><span><i class="done"></i>memo done</span></div></div>
      <div class="loud-rich-debug"><div class="loud-rich-stack"><strong>CALL STACK</strong><div>${stackHtml}</div></div>${detailHtml}</div>
    </div>
    <div class="loud-rich-memo-table"><strong>MEMO · answer[i]</strong><div>${memoCells}</div></div>
    ${finalHtml}
  </div>`;
}

function renderLruCacheView(step) {
  const view = step.lruCacheView || {};
  const treeView = $("treeView");
  const vi = lang === "vi";
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const order = Array.isArray(view.order) ? view.order : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];
  const pointerProgress = new Set(Array.isArray(view.pointerProgress) ? view.pointerProgress : []);
  const initialized = view.initialized || {};
  const phase = String(view.phase || "idle");
  const phaseIndex = phase.startsWith("init") || phase === "ready"
    ? 0
    : phase.includes("lookup") || phase === "miss" || phase === "hit"
      ? 1
      : phase.includes("remove") || phase.includes("insert") || phase === "new-node" || phase === "update"
        ? 2
        : 3;
  const phaseLabels = vi
    ? ["1. Khởi tạo", "2. Tra hash map", "3. Đổi pointer", "4. Loại LRU"]
    : ["1. Initialize", "2. Hash lookup", "3. Rewire pointers", "4. Evict LRU"];
  const phasesHtml = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : ""}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`).join("");

  const formatResult = (operation, value) => operation.type === "put" ? "null" : String(value);
  const operationsHtml = operations.map((operation, index) => {
    const done = index < Number(view.completedOps || 0);
    const active = index === view.activeOpIndex;
    const classes = ["lru-operation"];
    if (done) classes.push("is-done");
    if (active) classes.push("is-active");
    if (!done && !active) classes.push("is-pending");
    const result = done ? formatResult(operation, results[index]) : "·";
    return `<span class="${classes.join(" ")}"><small>${index + 1}</small><code>${escapeHtml(operation.label)}</code><strong>→ ${escapeHtml(result)}</strong></span>`;
  }).join("");

  const orderKeys = new Set(order.map((node) => node.key));
  const transientKey = view.transient ? view.transient.key : null;
  const mapHtml = entries.length
    ? entries.map((entry) => {
        const classes = ["lru-map-entry"];
        if (entry.key === view.activeKey) classes.push("is-active");
        if (!orderKeys.has(entry.key)) classes.push("is-unlinked");
        if (entry.key === transientKey) classes.push("is-transient");
        const state = orderKeys.has(entry.key)
          ? (vi ? "trong list" : "in list")
          : (vi ? "chưa nối / đã tháo" : "unlinked / detached");
        return `<span class="${classes.join(" ")}"><code>${escapeHtml(entry.key)}</code><i>→</i><strong>Node(${escapeHtml(entry.key)}, ${escapeHtml(entry.value)})</strong><small>${state}</small></span>`;
      }).join("")
    : `<em>{ }</em>`;

  function sentinel(side) {
    const ready = side === "left" ? initialized.left : initialized.right;
    const pointerReady = side === "left" ? initialized.forward : initialized.backward;
    const label = side === "left" ? "LEFT" : "RIGHT";
    const role = side === "left" ? "LRU sentinel" : "MRU sentinel";
    const pointer = side === "left" ? "left.next" : "right.prev";
    return `<div class="lru-sentinel${ready ? " is-ready" : " is-pending"}"><small>${role}</small><strong>${label}</strong><span>${pointerReady ? pointer : "not linked"}</span></div>`;
  }

  const listParts = [sentinel("left")];
  order.forEach((node, index) => {
    listParts.push(`<span class="lru-double-arrow" aria-hidden="true"><i>next →</i><i>← prev</i></span>`);
    const classes = ["lru-list-node"];
    if (node.key === view.activeKey) classes.push("is-active");
    if (node.key === transientKey && phase.includes("remove")) classes.push("is-removing");
    listParts.push(`<div class="${classes.join(" ")}"><small>${index === 0 ? "LRU" : index === order.length - 1 ? "MRU" : `#${index + 1}`}</small><strong>${escapeHtml(node.key)} : ${escapeHtml(node.value)}</strong><span>Node(${escapeHtml(node.key)})</span></div>`);
  });
  if (initialized.left && initialized.right) listParts.push(`<span class="lru-double-arrow" aria-hidden="true"><i>next →</i><i>← prev</i></span>`);
  listParts.push(sentinel("right"));
  const transientHtml = view.transient
    ? `<div class="lru-transient"><small>${escapeHtml(view.transient.status || "detached")}</small><strong>${escapeHtml(view.transient.key)} : ${escapeHtml(view.transient.value)}</strong><span>Node(${escapeHtml(view.transient.key)})</span></div>`
    : `<div class="lru-transient is-empty"><strong>∅</strong><span>${vi ? "không có node rời list" : "no detached node"}</span></div>`;

  const pointerItems = [
    ["prev.next = next", "remove 1/2"],
    ["next.prev = prev", "remove 2/2"],
    ["prev.next = node", "insert 1/4"],
    ["node.prev = prev", "insert 2/4"],
    ["node.next = right", "insert 3/4"],
    ["right.prev = node", "insert 4/4"],
  ].map(([key, label]) => `<span class="${pointerProgress.has(key) ? "is-done" : ""}">${pointerProgress.has(key) ? "✓" : "○"}<b>${label}</b></span>`).join("");
  const pointerContext = view.pointerAction
    ? `<div class="lru-pointer-action"><div><small>prev</small><strong>${escapeHtml(view.prevLabel || "—")}</strong></div><i>↔</i><div class="is-node"><small>node</small><strong>${escapeHtml(view.nodeLabel || "—")}</strong></div><i>↔</i><div><small>next</small><strong>${escapeHtml(view.nextLabel || "—")}</strong></div><code>${escapeHtml(view.pointerAction)}</code></div>`
    : `<div class="lru-pointer-action is-idle"><code>${vi ? "Chọn Next để theo dõi từng phép gán pointer" : "Use Next to follow each pointer assignment"}</code></div>`;

  const lru = order.length ? `${order[0].key}:${order[0].value}` : "—";
  const mru = order.length ? `${order[order.length - 1].key}:${order[order.length - 1].value}` : "—";
  const currentOperation = view.activeOpIndex === null || view.activeOpIndex === undefined ? null : operations[view.activeOpIndex];
  const currentResult = currentOperation && view.activeOpIndex < view.completedOps
    ? formatResult(currentOperation, results[view.activeOpIndex])
    : view.result === null || view.result === undefined ? "—" : view.result;
  const summary = vi
    ? `LRU Cache có ${entries.length} trên ${view.capacity} key; LRU ${lru}; MRU ${mru}.`
    : `LRU Cache has ${entries.length} of ${view.capacity} keys; LRU ${lru}; MRU ${mru}.`;

  treeView.innerHTML = `<section class="lru-cache-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="lru-phases">${phasesHtml}</div>
    <div class="lru-operations" aria-label="${vi ? "Danh sách thao tác" : "Operation list"}">${operationsHtml}</div>
    <div class="lru-status">
      <span><small>SIZE / CAPACITY</small><strong>${entries.length} / ${escapeHtml(view.capacity)}</strong></span>
      <span class="is-lru"><small>LEFT.next · LRU</small><strong>${escapeHtml(lru)}</strong></span>
      <span class="is-mru"><small>RIGHT.prev · MRU</small><strong>${escapeHtml(mru)}</strong></span>
      <span><small>RESULT</small><strong>${escapeHtml(currentResult)}</strong></span>
    </div>
    <section class="lru-map"><header><strong>HASH MAP</strong><small>key → exact Node reference · O(1) lookup</small></header><div>${mapHtml}</div></section>
    <section class="lru-list"><header><strong>DOUBLY LINKED LIST</strong><small>LEFT · least recent → most recent · RIGHT</small></header><div class="lru-list-scroll"><div class="lru-list-track">${listParts.join("")}</div></div></section>
    <div class="lru-pointer-board">${pointerContext}<div class="lru-pointer-progress">${pointerItems}</div></div>
    <div class="lru-detached-row"><header><strong>${vi ? "NODE ĐANG THÁO / CHÈN" : "DETACHED / INSERTING NODE"}</strong><small>${vi ? "map và list có thể tạm khác nhau giữa hai dòng code" : "map and list can temporarily differ between code lines"}</small></header>${transientHtml}</div>
    <div class="lru-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="lru-legend" aria-hidden="true"><span><i class="active"></i>${vi ? "node đang xử lý" : "active node"}</span><span><i class="detached"></i>${vi ? "node chưa nằm trong list" : "node outside list"}</span><span><b>LEFT.next</b> = LRU</span><span><b>RIGHT.prev</b> = MRU</span></div>
  </section>`;
}

function renderLfuCacheView(step) {
  const view = step.lfuCacheView;
  const treeView = $("treeView");
  const vi = lang === "vi";
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];

  const operationHtml = operations.map((operation, index) => {
    const done = index < view.completedOps;
    const active = index === view.activeOpIndex;
    const classes = ["lfu-operation"];
    if (done) classes.push("done");
    if (active) classes.push("active");
    else if (!done) classes.push("pending");
    const result = done
      ? operation.type === "put"
        ? "null"
        : String(results[index])
      : "·";
    return `<span class="${classes.join(" ")}">
      <small>${index + 1}</small>
      <code>${escapeHtml(operation.label)}</code>
      <strong>→ ${escapeHtml(result)}</strong>
    </span>`;
  }).join("");

  const bucketHtml = groups.length
    ? groups.map((group) => {
        const isMin = view.size > 0 && group.frequency === view.minFreq;
        const nodes = Array.isArray(group.keys) ? group.keys : [];
        const nodeHtml = nodes.length
          ? nodes.map((entry, index) => {
              const classes = ["lfu-node"];
              if (entry.key === view.activeKey) classes.push("active");
              if (entry.key === view.movingKey) classes.push("moving");
              if (entry.key === view.evictedKey) classes.push("evicting");
              const position = nodes.length === 1
                ? "LRU = MRU"
                : index === 0
                  ? "LRU"
                  : index === nodes.length - 1
                    ? "MRU"
                    : "";
              const value = entry.value === undefined ? "—" : entry.value;
              return `<div class="${classes.join(" ")}">
                ${position ? `<span class="lfu-recency">${position}</span>` : ""}
                <strong>key ${escapeHtml(entry.key)}</strong>
                <span>value ${escapeHtml(value)}</span>
                <small>freq ${escapeHtml(entry.freq)}</small>
              </div>`;
            }).join('<span class="lfu-order-arrow" aria-hidden="true">→</span>')
          : `<span class="lfu-empty-bucket">${vi ? "bucket tạm rỗng" : "temporarily empty"}</span>`;
        return `<section class="lfu-bucket${isMin ? " minimum" : ""}">
          <header>
            <span><small>FREQUENCY</small><strong>f${escapeHtml(group.frequency)}</strong></span>
            ${isMin ? `<b>min_freq</b>` : ""}
          </header>
          <div class="lfu-bucket-order">
            <span class="lfu-order-label">LRU</span>
            <div class="lfu-node-row">${nodeHtml}</div>
            <span class="lfu-order-label">MRU</span>
          </div>
        </section>`;
      }).join("")
    : `<div class="lfu-empty-cache"><strong>∅</strong><span>${vi ? "cache chưa có key" : "cache has no keys"}</span></div>`;

  const indexHtml = entries.length
    ? entries.map((entry) => {
        const classes = ["lfu-index-entry"];
        if (entry.key === view.activeKey) classes.push("active");
        if (entry.key === view.movingKey) classes.push("moving");
        if (entry.key === view.evictedKey) classes.push("evicting");
        const frequency = entry.freq === null || entry.freq === undefined ? "?" : entry.freq;
        return `<span class="${classes.join(" ")}"><code>${escapeHtml(entry.key)}</code><strong>${escapeHtml(entry.value)}</strong><small>f${escapeHtml(frequency)}</small></span>`;
      }).join("")
    : `<span class="lfu-index-empty">{ }</span>`;

  const activeOperation = view.activeOpIndex === null ? null : operations[view.activeOpIndex];
  const operationDone = view.activeOpIndex !== null && view.activeOpIndex < view.completedOps;
  const currentResult = activeOperation && operationDone
    ? activeOperation.type === "put" ? "null" : results[view.activeOpIndex]
    : view.phase === "done" && operations.length
      ? operations[operations.length - 1].type === "put" ? "null" : results[results.length - 1]
      : "—";
  const minFrequency = view.size > 0 ? view.minFreq : "—";
  const moveHtml = view.movingKey !== null && view.fromFreq !== null && view.toFreq !== null
    ? `<span class="lfu-movement"><strong>key ${escapeHtml(view.movingKey)}</strong><code>f${escapeHtml(view.fromFreq)} → f${escapeHtml(view.toFreq)}</code></span>`
    : view.fromFreq !== null && view.toFreq !== null && view.activeKey !== null
      ? `<span class="lfu-movement"><strong>key ${escapeHtml(view.activeKey)}</strong><code>f${escapeHtml(view.fromFreq)} → f${escapeHtml(view.toFreq)}</code></span>`
      : "";
  const evictionHtml = view.evictedKey !== null
    ? `<span class="lfu-eviction"><strong>${vi ? "EVICT" : "EVICT"} key ${escapeHtml(view.evictedKey)}</strong><small>${vi ? `đầu bucket f${escapeHtml(view.fromFreq)} = LRU` : `front of bucket f${escapeHtml(view.fromFreq)} = LRU`}</small></span>`
    : "";
  const summary = vi
    ? `LFU Cache có ${view.size} trên ${view.capacity} key, min_freq ${minFrequency}. ${pick(step.title)}`
    : `LFU Cache contains ${view.size} of ${view.capacity} keys, min_freq ${minFrequency}. ${pick(step.title)}`;

  treeView.innerHTML = `<div class="lfu-cache-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="lfu-operations" aria-label="${vi ? "Danh sách operations" : "Operation list"}">${operationHtml}</div>
    <div class="lfu-status-row">
      <span><small>CAPACITY</small><strong>${escapeHtml(view.capacity)}</strong></span>
      <span><small>SIZE</small><strong>${escapeHtml(view.size)} / ${escapeHtml(view.capacity)}</strong></span>
      <span class="minimum"><small>MIN_FREQ</small><strong>${escapeHtml(minFrequency)}</strong></span>
      <span><small>RESULT</small><strong>${escapeHtml(currentResult)}</strong></span>
    </div>
    <div class="lfu-action-row">
      <span class="lfu-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(pick(step.title))}</strong></span>
      ${moveHtml}${evictionHtml}
    </div>
    <div class="lfu-buckets">${bucketHtml}</div>
    <section class="lfu-key-index">
      <header><strong>KEY INDEX</strong><small>key → value · frequency</small></header>
      <div>${indexHtml}</div>
    </section>
    <div class="lfu-legend" aria-hidden="true">
      <span><i class="minimum"></i>min_freq bucket</span>
      <span><i class="active"></i>${vi ? "key đang xử lý" : "active key"}</span>
      <span><i class="evicting"></i>${vi ? "key bị loại" : "evicted key"}</span>
      <span><b>LRU → MRU</b>${vi ? "cũ nhất → mới nhất" : "oldest → newest"}</span>
    </div>
  </div>`;
}

function renderRideSharingView(step) {
  const view = step.rideSharingView;
  const treeView = $("treeView");
  const vi = lang === "vi";
  const activeSet = new Set(view.activeRiders || []);
  const phaseIndex = {
    initialize: 0,
    "initialize-done": 0,
    "rider-call": 1,
    "rider-queued": 1,
    "rider-active": 1,
    "driver-call": 1,
    "driver-queued": 1,
    "cancel-call": 2,
    "cancel-done": 2,
    "cancel-noop": 2,
    "cleanup-check": 2,
    "cleanup-pop": 2,
    "cleanup-done": 2,
    "match-call": 3,
    "availability-check": 3,
    "take-driver": 3,
    "take-rider": 3,
    "deactivate-match": 3,
    matched: 3,
    "no-match": 3,
    done: 3,
  }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1. Khởi tạo", "2. Vào queue", "3. Hủy & dọn", "4. Ghép FRONT"]
    : ["1. Initialize", "2. Join queues", "3. Cancel & clean", "4. Match FRONT"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const formatResult = (result) => Array.isArray(result) ? `[${result.join(", ")}]` : "null";
  const operationsHtml = view.operations.map((operation, index) => {
    const done = index < view.completedOps;
    const active = index === view.activeOpIndex;
    const classes = ["ride-sharing-operation"];
    if (done) classes.push("is-done");
    if (active) classes.push("is-active");
    if (!done && !active) classes.push("is-pending");
    const result = done ? formatResult(view.results[index]) : "·";
    return `<div class="${classes.join(" ")}">
      <small>${index}</small>
      <code>${escapeHtml(operation.label)}</code>
      <strong>→ ${escapeHtml(result)}</strong>
    </div>`;
  }).join("");

  function queueLane(kind, items, initialized, activeId) {
    const isRider = kind === "rider";
    const label = isRider ? (vi ? "RIDER ĐANG CHỜ" : "WAITING RIDERS") : (vi ? "DRIVER SẴN SÀNG" : "AVAILABLE DRIVERS");
    let cellsHtml;
    if (!initialized) {
      cellsHtml = `<span class="ride-sharing-empty">${vi ? "chưa khởi tạo" : "not initialized"}</span>`;
    } else if (!items.length) {
      cellsHtml = `<span class="ride-sharing-empty"><b>∅</b>${vi ? "queue rỗng" : "empty queue"}</span>`;
    } else {
      cellsHtml = items.map((id, index) => {
        const cancelled = isRider && !activeSet.has(id);
        const pending = isRider && view.phase === "rider-queued" && id === activeId;
        const classes = ["ride-sharing-node", isRider ? "is-rider" : "is-driver"];
        if (cancelled && !pending) classes.push("is-cancelled");
        if (pending) classes.push("is-pending-active");
        if (id === activeId) classes.push("is-current");
        const status = cancelled && !pending
          ? (vi ? "ĐÃ HỦY" : "CANCELLED")
          : pending
            ? (vi ? "CHƯA ACTIVE" : "NOT ACTIVE")
            : isRider ? "ACTIVE" : "READY";
        return `<div class="${classes.join(" ")}">
          <span>${index === 0 ? "FRONT" : index === items.length - 1 ? "REAR" : `#${index}`}</span>
          <strong>${isRider ? "R" : "D"}${escapeHtml(id)}</strong>
          <small>${status}</small>
        </div>${index < items.length - 1 ? '<i class="ride-sharing-queue-arrow" aria-hidden="true">→</i>' : ""}`;
      }).join("");
    }
    return `<section class="ride-sharing-lane is-${kind}">
      <header><span class="ride-sharing-kind">${isRider ? "R" : "D"}</span><strong>${label}</strong><small>${items.length} ${vi ? "trong deque" : "in deque"}</small></header>
      <div class="ride-sharing-lane-track"><span class="ride-sharing-front-label">FRONT</span><div class="ride-sharing-cells">${cellsHtml}</div><span class="ride-sharing-rear-label">REAR</span></div>
    </section>`;
  }

  const currentOperation = view.activeOpIndex === null ? null : view.operations[view.activeOpIndex];
  const matchContext = new Set([
    "match-call", "cleanup-check", "cleanup-pop", "cleanup-done", "availability-check",
    "take-driver", "take-rider", "deactivate-match", "matched", "no-match",
  ]).has(view.phase);
  const selectedDriver = view.activeDriver ?? (matchContext ? (view.drivers[0] ?? null) : null);
  const selectedRider = view.activeRider ?? view.removedRider ?? (matchContext ? (view.riders[0] ?? null) : null);
  const hasPair = Array.isArray(view.pair);
  const noPair = hasPair && view.pair[0] === -1;
  const isCleaning = ["cleanup-check", "cleanup-pop"].includes(view.phase);
  const gateClasses = ["ride-sharing-gate"];
  if (hasPair) gateClasses.push(noPair ? "is-no-match" : "is-matched");
  if (isCleaning) gateClasses.push("is-cleaning");
  const gateResult = isCleaning
    ? "BLOCKED"
    : hasPair
    ? `[${view.pair.join(", ")}]`
    : selectedDriver !== null && selectedRider !== null
      ? `[${selectedDriver}, ${selectedRider}]`
      : "[driver, rider]";
  const gateShapeLabel = isCleaning ? "cancelled FRONT" : "[driverId, riderId]";
  let gateStatus;
  if (view.phase === "cleanup-check") gateStatus = vi ? `R${view.cancelledRider} không còn active` : `R${view.cancelledRider} is inactive`;
  else if (view.phase === "cleanup-pop") gateStatus = vi ? `lazy-remove R${view.removedRider}` : `lazy-remove R${view.removedRider}`;
  else if (noPair) gateStatus = vi ? "CHƯA ĐỦ HAI PHÍA" : "ONE SIDE MISSING";
  else if (hasPair) gateStatus = vi ? "ĐÃ GHÉP" : "MATCHED";
  else gateStatus = vi ? "CHỜ CẶP FRONT" : "WAITING FOR BOTH FRONTS";
  const gateHtml = `<div class="${gateClasses.join(" ")}">
    <span class="ride-sharing-gate-source is-driver">${selectedDriver === null ? "D—" : `D${escapeHtml(selectedDriver)}`}</span>
    <i aria-hidden="true">→</i>
    <div><small>${escapeHtml(gateStatus)}</small><strong>${escapeHtml(gateResult)}</strong><span>${escapeHtml(gateShapeLabel)}</span></div>
    <i aria-hidden="true">←</i>
    <span class="ride-sharing-gate-source is-rider">${selectedRider === null ? "R—" : `R${escapeHtml(selectedRider)}`}</span>
  </div>`;

  const activeRidersHtml = view.initialized.activeRiders
    ? view.activeRiders.length
      ? view.activeRiders.map((rider) => `<span${rider === view.activeRider ? ' class="is-current"' : ""}>R${escapeHtml(rider)}</span>`).join("")
      : `<em>∅</em>`
    : `<em>${vi ? "chưa khởi tạo" : "not initialized"}</em>`;
  const matchesHtml = view.matches.length
    ? view.matches.map((pair, index) => `<span><small>#${index + 1}</small><b>D${escapeHtml(pair[0])}</b><i>+</i><b>R${escapeHtml(pair[1])}</b></span>`).join("")
    : `<em>${vi ? "chưa có chuyến" : "no rides yet"}</em>`;

  let actionDetail;
  if (view.phase === "rider-queued") {
    actionDetail = vi ? "Đã append vào deque; dòng 11 mới thêm rider vào active_riders." : "Appended to the deque; line 11 adds this rider to active_riders.";
  } else if (view.phase === "cancel-done") {
    actionDetail = vi ? "Node vẫn ở deque nhưng bị gạch mờ; không còn đủ điều kiện ghép." : "The node remains in the deque but is dimmed and no longer matchable.";
  } else if (view.phase === "cancel-noop") {
    actionDetail = vi ? "Rider không active nên discard không thay đổi hệ thống." : "The rider is not active, so discard changes nothing.";
  } else if (view.phase === "cleanup-check") {
    actionDetail = vi ? "FRONT đã hủy làm điều kiện while đúng; bước kế tiếp sẽ popleft." : "The cancelled FRONT makes the while condition true; the next step removes it with popleft.";
  } else if (view.phase === "cleanup-pop") {
    actionDetail = vi ? "Chỉ rider đã hủy rời queue; driver vẫn đứng yên." : "Only the cancelled rider leaves; the driver queue stays unchanged.";
  } else if (view.phase === "availability-check") {
    actionDetail = view.condition
      ? (vi ? "Thiếu một phía nên không pop phía còn lại." : "One side is missing, so the remaining side is not popped.")
      : (vi ? "Hai FRONT là cặp đến sớm nhất hợp lệ." : "The two FRONT entries are the earliest valid pair.");
  } else if (view.phase === "take-driver") {
    actionDetail = vi ? "Dòng 21 chỉ popleft driver; rider sẽ rời ở dòng 22." : "Line 21 poplefts only the driver; the rider leaves on line 22.";
  } else if (view.phase === "take-rider") {
    actionDetail = vi ? "Hai phần tử đã rời deque nhưng rider còn được xóa khỏi active_riders ở dòng 23." : "Both entries left their deques; line 23 still removes the rider from active_riders.";
  } else if (view.phase === "matched") {
    actionDetail = vi ? `Trả đúng thứ tự ${gateResult}: driver trước, rider sau.` : `Return ${gateResult} in driver-first, rider-second order.`;
  } else if (view.phase === "no-match") {
    actionDetail = vi ? "Trả [-1, -1] và giữ nguyên phần tử đang chờ ở queue còn lại." : "Return [-1, -1] and preserve the waiting entry on the other side.";
  } else if (view.phase === "done") {
    actionDetail = vi ? "Mọi operation đã hoàn tất; các queue hiển thị đúng trạng thái còn chờ." : "All operations are complete; the queues show the remaining waiting state.";
  } else {
    actionDetail = currentOperation
      ? `${currentOperation.label}`
      : (vi ? "Theo dõi hai queue FIFO và active_riders." : "Track both FIFO queues and active_riders.");
  }
  const summary = vi
    ? `${view.riders.length} rider trong deque, ${view.activeRiders.length} rider active, ${view.drivers.length} driver sẵn sàng, ${view.matches.length} cặp đã ghép.`
    : `${view.riders.length} riders in deque, ${view.activeRiders.length} active riders, ${view.drivers.length} available drivers, ${view.matches.length} completed matches.`;

  treeView.innerHTML = `<section class="ride-sharing-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="ride-sharing-phases">${phasesHtml}</div>
    <div class="ride-sharing-operations" aria-label="${vi ? "Danh sách operation" : "Operation list"}">${operationsHtml}</div>
    <div class="ride-sharing-status">
      <span><small>${vi ? "RIDER ACTIVE" : "ACTIVE RIDERS"}</small><strong>${view.activeRiders.length}</strong></span>
      <span><small>${vi ? "DRIVER SẴN SÀNG" : "READY DRIVERS"}</small><strong>${view.drivers.length}</strong></span>
      <span class="is-total"><small>${vi ? "CHUYẾN ĐÃ GHÉP" : "MATCHED RIDES"}</small><strong>${view.matches.length}</strong></span>
    </div>
    <div class="ride-sharing-board">
      ${queueLane("driver", view.drivers, view.initialized.drivers, view.activeDriver)}
      ${gateHtml}
      ${queueLane("rider", view.riders, view.initialized.riders, view.activeRider)}
    </div>
    <div class="ride-sharing-index-row">
      <section><header><strong>active_riders</strong><small>set · O(1) discard</small></header><div class="ride-sharing-active-set">${activeRidersHtml}</div></section>
      <section><header><strong>${vi ? "Lịch sử ghép" : "Match history"}</strong><small>[driver, rider]</small></header><div class="ride-sharing-match-history">${matchesHtml}</div></section>
    </div>
    <div class="ride-sharing-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="ride-sharing-legend">
      <span><i class="driver"></i>driver ready</span>
      <span><i class="rider"></i>rider active</span>
      <span><i class="cancelled"></i>${vi ? "rider đã hủy" : "cancelled rider"}</span>
      <span><b>FRONT → REAR</b>${vi ? "cũ nhất → mới nhất" : "oldest → newest"}</span>
    </div>
  </section>`;
}

// ---- Rectangle Area II: Sweep Line + Segment Tree ----
function renderRectangleSweepView(step) {
  const view = step.rectangleSweepView;
  const el = $("treeView");
  const rectangles = view.rectangles || [];
  const xs = view.xs || [];

  if (!rectangles.length || xs.length < 2) {
    el.innerHTML = `<div class="rect850-empty">${lang === "vi" ? "Không có hình chữ nhật hợp lệ." : "No valid rectangles."}</div>`;
    return;
  }

  const light = document.documentElement.getAttribute("data-theme") === "light";
  const colors = {
    text: light ? "#0f172a" : "#e2e8f0",
    muted: light ? "#64748b" : "#94a3b8",
    grid: light ? "#cbd5e1" : "#334155",
    base: light ? "#818cf8" : "#a5b4fc",
    covered: light ? "#4f46e5" : "#818cf8",
    next: light ? "#d97706" : "#fbbf24",
    treeFill: light ? "#eef2ff" : "#1e1b4b",
    treeActive: light ? "#dbeafe" : "#172554",
    treeStroke: light ? "#6366f1" : "#818cf8",
  };

  const allY = rectangles.flatMap((rectangle) => [rectangle[1], rectangle[3]]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const planeWidth = 600;
  const planeHeight = 330;
  const pad = { left: 52, right: 24, top: 24, bottom: 44 };
  const plotWidth = planeWidth - pad.left - pad.right;
  const plotHeight = planeHeight - pad.top - pad.bottom;
  const scaleX = (x) => pad.left + ((x - minX) / Math.max(1, maxX - minX)) * plotWidth;
  const scaleY = (y) => pad.top + ((maxY - y) / Math.max(1, maxY - minY)) * plotHeight;
  const fmt = (number) => typeof number === "string"
    ? number
    : (Number.isInteger(number) ? String(number) : Number(number).toFixed(2));

  const gridLinesX = xs.map((x) => `
    <line x1="${scaleX(x)}" y1="${pad.top}" x2="${scaleX(x)}" y2="${planeHeight - pad.bottom}" stroke="${colors.grid}" stroke-width="1" />
    <text x="${scaleX(x)}" y="${planeHeight - 18}" fill="${colors.muted}" text-anchor="middle">${fmt(x)}</text>`).join("");
  const uniqueY = [...new Set(allY)].sort((a, b) => a - b);
  const gridLinesY = uniqueY.map((y) => `
    <line x1="${pad.left}" y1="${scaleY(y)}" x2="${planeWidth - pad.right}" y2="${scaleY(y)}" stroke="${colors.grid}" stroke-width="1" />
    <text x="${pad.left - 10}" y="${scaleY(y) + 4}" fill="${colors.muted}" text-anchor="end">${fmt(y)}</text>`).join("");

  const baseRectangles = rectangles.map(([x1, y1, x2, y2], index) => `
    <rect x="${scaleX(x1)}" y="${scaleY(y2)}" width="${Math.max(1, scaleX(x2) - scaleX(x1))}" height="${Math.max(1, scaleY(y1) - scaleY(y2))}" fill="${colors.base}" fill-opacity="0.10" stroke="${colors.base}" stroke-width="1.5" />
    <text x="${scaleX(x1) + 7}" y="${scaleY(y2) + 16}" fill="${colors.text}">R${index + 1}</text>`).join("");

  const completedArea = rectangles.map(([x1, y1, x2, y2]) => {
    const completedY = Math.min(Math.max(view.y, y1), y2);
    if (completedY <= y1) return "";
    return `<rect x="${scaleX(x1)}" y="${scaleY(completedY)}" width="${Math.max(1, scaleX(x2) - scaleX(x1))}" height="${Math.max(1, scaleY(y1) - scaleY(completedY))}" fill="${colors.covered}" fill-opacity="0.28" />`;
  }).join("");

  const nextStrip = (view.leafCounts || []).map((count, index) => {
    if (count <= 0 || view.nextY <= view.y) return "";
    return `<rect x="${scaleX(xs[index])}" y="${scaleY(view.nextY)}" width="${Math.max(1, scaleX(xs[index + 1]) - scaleX(xs[index]))}" height="${Math.max(1, scaleY(view.y) - scaleY(view.nextY))}" fill="${colors.next}" fill-opacity="0.28" />`;
  }).join("");

  const planeSvg = `<svg class="rect850-plane" viewBox="0 0 ${planeWidth} ${planeHeight}" role="img" aria-label="${lang === "vi" ? "Mặt phẳng với đường quét ngang" : "Plane with a horizontal sweep line"}">
    ${gridLinesX}${gridLinesY}${completedArea}${nextStrip}${baseRectangles}
    <line x1="${pad.left}" y1="${scaleY(view.y)}" x2="${planeWidth - pad.right}" y2="${scaleY(view.y)}" stroke="${colors.next}" stroke-width="3" />
    <text x="${planeWidth - pad.right}" y="${Math.max(14, scaleY(view.y) - 7)}" fill="${colors.next}" text-anchor="end">sweep y=${fmt(view.y)}</text>
  </svg>`;

  const segmentCount = xs.length - 1;
  const treeNodes = view.treeNodes || [];
  const maxDepth = Math.max(0, ...treeNodes.map((node) => node.depth));
  const treeWidth = Math.max(600, segmentCount * 105);
  const treeHeight = 100 + maxDepth * 86;
  const treePosition = new Map();
  treeNodes.forEach((node) => {
    treePosition.set(node.id, {
      x: 50 + ((node.left + node.right + 1) / (2 * segmentCount)) * (treeWidth - 100),
      y: 38 + node.depth * 86,
    });
  });
  const treeEdges = treeNodes.filter((node) => node.parent !== null).map((node) => {
    const from = treePosition.get(node.parent);
    const to = treePosition.get(node.id);
    return `<line x1="${from.x}" y1="${from.y + 25}" x2="${to.x}" y2="${to.y - 25}" stroke="${colors.grid}" stroke-width="1.5" />`;
  }).join("");
  const treeNodeHtml = treeNodes.map((node) => {
    const position = treePosition.get(node.id);
    const active = node.length > 0;
    const current = node.id === view.activeNode;
    const range = `[${fmt(xs[node.left])}, ${fmt(xs[node.right + 1])})`;
    return `<g>
      <rect x="${position.x - 45}" y="${position.y - 25}" width="90" height="50" rx="9" fill="${active ? colors.treeActive : colors.treeFill}" stroke="${current ? colors.next : active ? colors.treeStroke : colors.grid}" stroke-width="${current ? 4 : node.id === 1 ? 2 : 1}" />
      <text x="${position.x}" y="${position.y - 4}" fill="${colors.text}" text-anchor="middle">${range}</text>
      <text x="${position.x}" y="${position.y + 14}" fill="${active ? colors.treeStroke : colors.muted}" text-anchor="middle">len=${fmt(node.length)} · count=${node.count}</text>
    </g>`;
  }).join("");
  const treeSvg = `<svg viewBox="0 0 ${treeWidth} ${treeHeight}" style="width:${treeWidth}px" role="img" aria-label="Segment Tree storing covered x length">${treeEdges}${treeNodeHtml}</svg>`;

  const segmentHtml = (view.leafCounts || []).map((count, index) => {
    const target = view.updateRange && view.updateRange.left <= index && index <= view.updateRange.right;
    return `
    <div class="rect850-segment ${count > 0 ? "active" : ""} ${target ? "update-target" : ""}">
      <span>[${fmt(xs[index])}, ${fmt(xs[index + 1])})</span>
      <strong>${lang === "vi" ? "phủ" : "cover"}: ${count}</strong>
    </div>`;
  }).join("");
  const eventHtml = (view.events || []).map((event) => `
    <span class="rect850-event ${event.delta > 0 ? "add" : "remove"}">${event.delta > 0 ? "+" : "−"} R${event.rectangleIndex + 1} [${fmt(event.x1)}, ${fmt(event.x2)})</span>`).join("");

  const debugRange = view.updateRange
    ? `${view.updateRange.delta > 0 ? "+1" : "−1"} · [${fmt(view.updateRange.x1)}, ${fmt(view.updateRange.x2)})`
    : "—";
  const activeNodeLabel = view.activeNode
    ? `node #${view.activeNode} · depth ${view.callDepth}`
    : "—";

  el.innerHTML = `<div class="rect850-viz">
    <div class="rect850-debug">
      <span>${escapeHtml(view.phase || "setup")}</span>
      <strong>${escapeHtml(view.action || "")}</strong>
      <code>${escapeHtml(debugRange)} · ${escapeHtml(activeNodeLabel)}</code>
    </div>
    <div class="rect850-stats">
      <div><span>Δy</span><strong>${fmt(view.deltaY)}</strong></div>
      <div><span>${lang === "vi" ? "covered_x mới" : "new covered_x"}</span><strong>${fmt(view.coveredX)}</strong></div>
      <div><span>+ area</span><strong>${fmt(view.addedArea)}</strong></div>
      <div><span>${lang === "vi" ? "tổng area" : "total area"}</span><strong>${fmt(view.area)}</strong></div>
    </div>
    <div class="rect850-section-title">${lang === "vi" ? "1. Sweep Line trên mặt phẳng" : "1. Sweep Line on the plane"}</div>
    ${planeSvg}
    <div class="rect850-events">${eventHtml}</div>
    <div class="rect850-section-title">${lang === "vi" ? "2. Các đoạn x sau nén tọa độ" : "2. Compressed x segments"}</div>
    <div class="rect850-segments">${segmentHtml}</div>
    <div class="rect850-section-title">${lang === "vi" ? "3. Segment Tree · root.length = covered_x" : "3. Segment Tree · root.length = covered_x"}</div>
    <div class="rect850-tree-scroll">${treeSvg}</div>
  </div>`;
}

function renderAverageWindowView(step) {
  const view = step.averageWindowView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const k = Number(view.k) || 1;
  const vi = lang === "vi";
  const phaseIndex = { initialize: 0, slide: 1, compare: 2, done: 3 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Tạo cửa sổ đầu", "2 · OUT trái · IN phải", "3 · So với max_sum"]
    : ["1 · Build first window", "2 · OUT left · IN right", "3 · Compare with max_sum"];
  const phases = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < phaseIndex;
    const state = done ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const inRange = (index, left, right) => (
    Number.isInteger(left) && Number.isInteger(right) && index >= left && index <= right
  );
  const format = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    return String(Number(Number(value).toFixed(5)));
  };
  const maxMagnitude = Math.max(1, ...nums.map((value) => Math.abs(Number(value) || 0)));
  const cells = nums.map((value, index) => {
    const classes = ["avg643-cell"];
    if (inRange(index, view.currentLeft, view.currentRight)) classes.push("current-window");
    if (["advance", "calculate-slide"].includes(view.event) && inRange(index, view.nextLeft, view.nextRight)) classes.push("next-window");
    if (inRange(index, view.bestLeft, view.bestRight)) classes.push("best-window");
    if (index === view.outgoingIndex) classes.push("outgoing");
    if (index === view.incomingIndex) classes.push("incoming");
    const markers = [];
    if (index === view.outgoingIndex) markers.push("OUT");
    if (index === view.incomingIndex) markers.push("IN");
    if (index === view.currentLeft) markers.push("L");
    if (index === view.currentRight) markers.push("R");
    const magnitude = Math.max(7, Math.round((Math.abs(value) / maxMagnitude) * 42));
    return `<div class="${classes.join(" ")}" aria-label="nums[${index}] = ${escapeHtml(String(value))}">
      <div class="avg643-markers">${markers.map((marker) => `<span>${marker}</span>`).join("")}</div>
      <div class="avg643-index">[${index}]</div>
      <div class="avg643-bar-zone"><i class="${value < 0 ? "negative" : "positive"}" style="--avg643-bar:${magnitude}%"></i><b>${escapeHtml(String(value))}</b></div>
    </div>`;
  }).join("");

  const initialValues = nums.slice(0, k);
  const signedExpression = initialValues.map((value, index) => {
    if (index === 0) return String(value);
    return value < 0 ? `− ${Math.abs(value)}` : `+ ${value}`;
  }).join(" ");
  let actionHtml;
  if (view.event === "enter") {
    actionHtml = `<div class="avg643-formula"><small>${vi ? "MỤC TIÊU" : "GOAL"}</small><strong>${vi ? `Tìm tổng lớn nhất trong mọi cửa sổ dài ${k}` : `Find the largest sum among all length-${k} windows`}</strong></div>`;
  } else if (view.event === "select-initial") {
    actionHtml = `<div class="avg643-formula"><small>${vi ? "CỬA SỔ ĐẦU" : "FIRST WINDOW"}</small><code>nums[:${k}] = [${escapeHtml(initialValues.join(", "))}]</code></div>`;
  } else if (view.event === "init-sum" || view.event === "init-max") {
    actionHtml = `<div class="avg643-formula"><small>${view.event === "init-sum" ? "window_sum" : "max_sum = window_sum"}</small><code>${escapeHtml(signedExpression)} = ${format(view.windowSum)}</code></div>`;
  } else if (view.event === "advance") {
    actionHtml = `<div class="avg643-move"><span class="out"><small>OUT</small><strong>nums[${view.outgoingIndex}]</strong><b>${escapeHtml(String(nums[view.outgoingIndex]))}</b></span><i>→</i><span class="in"><small>IN</small><strong>nums[${view.incomingIndex}]</strong><b>${escapeHtml(String(nums[view.incomingIndex]))}</b></span></div>`;
  } else if (["calculate-slide", "apply-slide"].includes(view.event) && view.operation) {
    actionHtml = `<div class="avg643-formula slide"><small>window_sum += IN − OUT</small><code>${format(view.operation.previousSum)} + (${format(view.operation.incomingValue)}) − (${format(view.operation.outgoingValue)}) = ${format(view.operation.result)}</code></div>`;
  } else if (["compare", "apply-max"].includes(view.event)) {
    const update = view.shouldUpdate === true;
    const candidateSum = view.windowSum;
    const recordSum = view.event === "apply-max" && update && view.evaluatedWindows.length > 1
      ? Math.max(...view.evaluatedWindows.slice(0, -1).map((window) => window.sum))
      : view.maxSum;
    actionHtml = `<div class="avg643-compare">
      <span><small>${vi ? "CỬA SỔ HIỆN TẠI" : "CURRENT WINDOW"}</small><strong>${format(candidateSum)}</strong><b>avg ${format(candidateSum / k)}</b></span>
      <div><code>${format(candidateSum)} ${update ? ">" : "≤"} ${format(recordSum)}</code><strong class="${update ? "update" : "keep"}">${update ? "UPDATE" : "KEEP"}</strong></div>
      <span><small>${vi ? "KỶ LỤC TRƯỚC" : "PREVIOUS RECORD"}</small><strong>${format(recordSum)}</strong><b>avg ${format(recordSum / k)}</b></span>
    </div>`;
  } else {
    actionHtml = `<div class="avg643-formula result"><small>return max_sum / k</small><code>${format(view.maxSum)} / ${k} = ${format(view.maxAverage)}</code></div>`;
  }

  const currentRange = Number.isInteger(view.currentLeft) ? `[${view.currentLeft}..${view.currentRight}]` : "—";
  const bestRange = Number.isInteger(view.bestLeft) ? `[${view.bestLeft}..${view.bestRight}]` : "—";
  const statsHtml = `<div class="avg643-stats">
    <span><small>${vi ? "CỬA SỔ HIỆN TẠI" : "CURRENT WINDOW"}</small><strong>${currentRange}</strong><b>sum ${format(view.windowSum)} · avg ${format(view.currentAverage)}</b></span>
    <span><small>${vi ? "CỬA SỔ TỐT NHẤT" : "BEST WINDOW"}</small><strong>${bestRange}</strong><b>max_sum ${format(view.maxSum)} · avg ${format(view.maxAverage)}</b></span>
  </div>`;
  const windows = Array.isArray(view.evaluatedWindows) ? view.evaluatedWindows : [];
  const ledgerHtml = windows.length
    ? windows.map((window, index) => `<span class="${window.isBest ? "best" : ""}${window.left === view.currentLeft && window.right === view.currentRight ? " current" : ""}"><small>#${index + 1} · [${window.left}..${window.right}]</small><strong>sum ${format(window.sum)}</strong><b>avg ${format(window.average)}</b>${window.isBest ? "<em>BEST</em>" : ""}</span>`).join("")
    : `<em>${vi ? "Chưa đánh giá cửa sổ" : "No evaluated window yet"}</em>`;

  $("treeView").innerHTML = `<div class="avg643-viz">
    <div class="avg643-phases">${phases}</div>
    <div class="avg643-rule"><strong>${vi ? `CỬA SỔ CỐ ĐỊNH k = ${k}` : `FIXED WINDOW k = ${k}`}</strong><span>window_sum(new) = window_sum(old) + IN − OUT</span></div>
    <div class="avg643-array">${cells}</div>
    <div class="avg643-legend"><span><i class="window"></i>${vi ? "cửa sổ hiện tại" : "current window"}</span><span><i class="out"></i>OUT</span><span><i class="in"></i>IN</span><span><i class="best"></i>best</span></div>
    ${actionHtml}
    ${statsHtml}
    <div class="avg643-history"><header><strong>${vi ? "CÁC CỬA SỔ ĐÃ ĐÁNH GIÁ" : "EVALUATED WINDOWS"}</strong><span>${vi ? "cùng độ dài nên so tổng là đủ" : "equal length, so comparing sums is enough"}</span></header><div>${ledgerHtml}</div></div>
  </div>`;
}

function renderPrefixAverageView(step) {
  const view = step.prefixAverageView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const k = Number(view.k) || 1;
  const vi = lang === "vi";
  const phaseIndex = { initialize: 0, build: 1, query: 2, done: 3 }[view.phase] ?? 0;
  const labels = vi
    ? ["1 · Đặt prefix[0] = 0", "2 · Dựng mảng prefix", "3 · Trừ hai mốc prefix"]
    : ["1 · Set prefix[0] = 0", "2 · Build the prefix array", "3 · Subtract two prefix marks"];
  const phases = labels.map((label, index) => {
    const done = view.phase === "done" || index < phaseIndex;
    const state = done ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const format = (value, empty = "—") => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return empty;
    return String(Number(Number(value).toFixed(5)));
  };
  const inWindow = (index) => (
    Number.isInteger(view.windowLeft)
    && Number.isInteger(view.windowRight)
    && index >= view.windowLeft
    && index < view.windowRight
  );
  const inBest = (index) => (
    Number.isInteger(view.bestLeft)
    && Number.isInteger(view.bestRight)
    && index >= view.bestLeft
    && index < view.bestRight
  );
  const numsHtml = nums.map((value, index) => {
    const classes = ["prefix643-cell", "num"];
    if (inWindow(index)) classes.push("window");
    if (inBest(index)) classes.push("best");
    if (index === view.activeNumIndex) classes.push("active");
    const markers = [];
    if (index === view.activeNumIndex) markers.push("num");
    if (index === view.windowLeft) markers.push("L");
    if (index === view.windowRight - 1) markers.push("R−1");
    return `<span class="${classes.join(" ")}"><small>nums[${index}]</small><strong>${escapeHtml(String(value))}</strong><em>${markers.join(" · ")}</em></span>`;
  }).join("");
  const prefixHtml = prefix.map((value, index) => {
    const classes = ["prefix643-cell", "prefix"];
    if (value !== null) classes.push("known");
    if (index === view.activePrefixFrom) classes.push("from");
    if (index === view.activePrefixTo) classes.push("to");
    if (index === view.windowLeft) classes.push("left-boundary");
    if (index === view.windowRight) classes.push("right-boundary");
    if (index === view.bestLeft || index === view.bestRight) classes.push("best-boundary");
    const marker = index === view.windowLeft
      ? "LEFT"
      : index === view.windowRight
        ? "RIGHT"
        : index === view.activePrefixFrom
          ? "FROM"
          : index === view.activePrefixTo
            ? "TO"
            : "";
    return `<span class="${classes.join(" ")}"><small>prefix[${index}]</small><strong>${value === null ? "_" : escapeHtml(String(value))}</strong><em>${marker}</em></span>`;
  }).join("");

  let actionHtml;
  if (view.event === "enter") {
    actionHtml = `<div class="prefix643-formula"><small>${vi ? "ĐỊNH NGHĨA" : "DEFINITION"}</small><strong>prefix[t] = sum(nums[0..t−1])</strong></div>`;
  } else if (view.event === "init-prefix") {
    actionHtml = `<div class="prefix643-formula"><small>${vi ? "MỐC GỐC" : "BASE MARK"}</small><code>prefix[0] = 0</code><span>${vi ? "0 phần tử có tổng bằng 0" : "zero values have sum zero"}</span></div>`;
  } else if (view.event === "prefix-loop") {
    actionHtml = `<div class="prefix643-build"><span><small>FROM</small><strong>prefix[${view.activePrefixFrom}] = ${format(prefix[view.activePrefixFrom])}</strong></span><b>+</b><span><small>NUM</small><strong>nums[${view.activeNumIndex}] = ${format(nums[view.activeNumIndex])}</strong></span><b>→</b><span><small>TO</small><strong>prefix[${view.activePrefixTo}] = ?</strong></span></div>`;
  } else if (view.event === "prefix-assign") {
    actionHtml = `<div class="prefix643-formula build"><small>prefix[i + 1] = prefix[i] + num</small><code>${format(prefix[view.activePrefixFrom])} + (${format(nums[view.activeNumIndex])}) = ${format(prefix[view.activePrefixTo])}</code></div>`;
  } else if (view.event === "init-record") {
    actionHtml = `<div class="prefix643-formula record"><small>${vi ? "KHỞI TẠO KỶ LỤC" : "INITIALIZE RECORD"}</small><code>max_sum = −∞</code></div>`;
  } else if (["window-loop", "window-sum"].includes(view.event)) {
    const hasSum = view.windowSum !== null;
    actionHtml = `<div class="prefix643-query">
      <span class="right"><small>RIGHT PREFIX</small><strong>prefix[${view.windowRight}]</strong><b>${format(prefix[view.windowRight])}</b></span>
      <div><code>${format(prefix[view.windowRight])} − ${format(prefix[view.windowLeft])}${hasSum ? ` = ${format(view.windowSum)}` : ""}</code><strong>${vi ? `nums[${view.windowLeft}..${view.windowRight - 1}]` : `nums[${view.windowLeft}..${view.windowRight - 1}]`}</strong></div>
      <span class="left"><small>LEFT PREFIX</small><strong>prefix[${view.windowLeft}]</strong><b>${format(prefix[view.windowLeft])}</b></span>
    </div>`;
  } else if (["compare", "apply-max"].includes(view.event)) {
    const update = view.shouldUpdate === true;
    const previous = view.recordBefore === null ? "−∞" : format(view.recordBefore);
    actionHtml = `<div class="prefix643-compare">
      <span><small>${vi ? "TỔNG CỬA SỔ" : "WINDOW SUM"}</small><strong>${format(view.windowSum)}</strong><b>avg ${format(view.currentAverage)}</b></span>
      <div><code>${format(view.windowSum)} ${update ? ">" : "≤"} ${previous}</code><strong class="${update ? "update" : "keep"}">${update ? "UPDATE" : "KEEP"}</strong></div>
      <span><small>${vi ? "KỶ LỤC TRƯỚC" : "PREVIOUS RECORD"}</small><strong>${previous}</strong><b>${view.recordBefore === null ? "no window yet" : `avg ${format(view.recordBefore / k)}`}</b></span>
    </div>`;
  } else {
    actionHtml = `<div class="prefix643-formula result"><small>return max_sum / k</small><code>${format(view.maxSum)} / ${k} = ${format(view.maxAverage)}</code></div>`;
  }

  const currentRange = Number.isInteger(view.windowLeft) ? `[${view.windowLeft}..${view.windowRight - 1}]` : "—";
  const bestRange = Number.isInteger(view.bestLeft) ? `[${view.bestLeft}..${view.bestRight - 1}]` : "—";
  const windows = Array.isArray(view.evaluatedWindows) ? view.evaluatedWindows : [];
  const historyHtml = windows.length
    ? windows.map((window, index) => `<span class="${window.isBest ? "best" : ""}${window.left === view.windowLeft && window.right === view.windowRight ? " current" : ""}"><small>#${index + 1} · [${window.left}..${window.right - 1}]</small><strong>sum ${format(window.sum)}</strong><b>avg ${format(window.average)}</b>${window.isBest ? "<em>BEST</em>" : ""}</span>`).join("")
    : `<em>${vi ? "Chưa truy vấn cửa sổ" : "No queried window yet"}</em>`;

  $("treeView").innerHTML = `<div class="prefix643-viz">
    <div class="avg643-phases">${phases}</div>
    <div class="prefix643-rule"><strong>PREFIX SUM</strong><span>sum(left..right−1) = prefix[right] − prefix[left]</span></div>
    <section class="prefix643-section"><header><strong>NUMS</strong><span>${vi ? "phần tử gốc" : "original values"}</span></header><div class="prefix643-row nums">${numsHtml}</div></section>
    <section class="prefix643-section"><header><strong>PREFIX</strong><span>${vi ? "n + 1 mốc tổng tích lũy" : "n + 1 cumulative-sum marks"}</span></header><div class="prefix643-row prefix">${prefixHtml}</div></section>
    <div class="prefix643-legend"><span><i class="window"></i>${vi ? "cửa sổ hiện tại" : "current window"}</span><span><i class="left"></i>prefix[left]</span><span><i class="right"></i>prefix[right]</span><span><i class="best"></i>best</span></div>
    ${actionHtml}
    <div class="avg643-stats">
      <span><small>${vi ? "CỬA SỔ HIỆN TẠI" : "CURRENT WINDOW"}</small><strong>${currentRange}</strong><b>sum ${format(view.windowSum)} · avg ${format(view.currentAverage)}</b></span>
      <span><small>${vi ? "CỬA SỔ TỐT NHẤT" : "BEST WINDOW"}</small><strong>${bestRange}</strong><b>max_sum ${format(view.maxSum)} · avg ${format(view.maxAverage)}</b></span>
    </div>
    <div class="avg643-history"><header><strong>${vi ? "CÁC CỬA SỔ ĐÃ TRUY VẤN" : "QUERIED WINDOWS"}</strong><span>prefix[right] − prefix[left]</span></header><div>${historyHtml}</div></div>
  </div>`;
}

function renderValidSequenceView(step) {
  const view = step.validSequenceView || {};
  const word1 = typeof view.word1 === "string" ? view.word1 : "";
  const word2 = typeof view.word2 === "string" ? view.word2 : "";
  const suffix = Array.isArray(view.suffix) ? view.suffix : [];
  const suffixStatus = Array.isArray(view.suffixStatus) ? view.suffixStatus : [];
  const selections = Array.isArray(view.selections) ? view.selections : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const vi = lang === "vi";
  const phaseIndex = { setup: 0, suffix: 0, greedy: 1, done: 2 }[view.phase] ?? 0;
  const labels = vi
    ? ["1 · Dựng suffix từ phải", "2 · Greedy chọn chỉ số nhỏ nhất", "3 · Kiểm tra đủ m chỉ số"]
    : ["1 · Build suffix from the right", "2 · Greedily take smallest indices", "3 · Verify all m indices"];
  const phases = labels.map((label, index) => {
    const done = view.phase === "done" || index < phaseIndex;
    const state = done ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const selectionByWord1 = new Map(selections.map((selection) => [selection.word1Index, selection]));
  const selectionByWord2 = new Map(selections.map((selection) => [selection.word2Index, selection]));
  const suffixWord1 = new Set(suffix.filter((value, index) => suffixStatus[index] === "matched" && value >= 0));

  const word1Html = [...word1].map((char, index) => {
    const selected = selectionByWord1.get(index);
    const classes = ["valid3302-cell", "source"];
    if (index === view.backI) classes.push("back-pointer");
    if (index === view.forwardI) classes.push("forward-pointer");
    if (selected) classes.push("selected", selected.mismatch ? "mismatch" : "exact");
    if (suffixWord1.has(index)) classes.push("suffix-position");
    const markers = [];
    if (index === view.backI) markers.push("BACK i");
    if (index === view.forwardI) markers.push("i");
    if (selected) markers.push(selected.mismatch ? "CHANGED" : `#${selected.word2Index + 1}`);
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(char)}</strong><em>${markers.join(" · ")}</em></span>`;
  }).join("");
  const word2Html = [...word2].map((char, index) => {
    const selected = selectionByWord2.get(index);
    const isTarget = index === view.backJ || index === view.targetJ;
    const classes = ["valid3302-cell", "target"];
    if (isTarget) classes.push("active-target");
    if (selected) classes.push("filled", selected.mismatch ? "mismatch" : "exact");
    const marker = selected
      ? `← word1[${selected.word1Index}]${selected.mismatch ? " · changed" : ""}`
      : isTarget
        ? "TARGET j"
        : "";
    return `<span class="${classes.join(" ")}"><small>word2[${index}]</small><strong>${escapeHtml(char)}</strong><em>${escapeHtml(marker)}</em></span>`;
  }).join("");
  const suffixHtml = [...word2].map((char, index) => {
    const status = suffixStatus[index] || "pending";
    const active = index === view.backJ || (view.decision && view.decision.futureBound === suffix[index]);
    const value = status === "pending" ? "_" : suffix[index];
    const statusText = status === "matched"
      ? `word1[${suffix[index]}] = '${word1[suffix[index]]}'`
      : status === "impossible"
        ? (vi ? "không thể khớp" : "cannot match")
        : (vi ? "chưa tính" : "pending");
    return `<span class="valid3302-suffix ${status}${active ? " active" : ""}"><small>suffix[${index}] · '${escapeHtml(char)}'</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(statusText)}</em></span>`;
  }).join("");

  const selectedString = selections.map((selection) => word1[selection.word1Index]).join("");
  const answerHtml = selections.length
    ? selections.map((selection) => `<span class="${selection.mismatch ? "mismatch" : "exact"}"><small>target ${selection.word2Index}</small><strong>${selection.word1Index}</strong><em>'${escapeHtml(word1[selection.word1Index])}'${selection.mismatch ? ` → '${escapeHtml(word2[selection.word2Index])}'` : ""}</em></span>`).join(`<b>→</b>`)
    : `<em>${vi ? "Chưa chọn chỉ số" : "No selected index"}</em>`;
  const couponHtml = `<div class="valid3302-coupon ${view.mismatchUsed ? "used" : "available"}"><small>${vi ? "PHIẾU MISMATCH" : "MISMATCH COUPON"}</small><strong>${view.mismatchUsed ? (vi ? "ĐÃ DÙNG" : "USED") : (vi ? "CÒN 1 LẦN" : "1 AVAILABLE")}</strong><span>${view.mismatchUsed ? (vi ? "Chỉ được chọn exact match" : "Exact matches only") : (vi ? "Có thể đổi tối đa một ký tự" : "At most one character may change")}</span></div>`;

  const decision = view.decision || {};
  let decisionHtml;
  if (view.phase === "suffix") {
    const sourceIndex = Number.isInteger(view.backI) ? view.backI : decision.word1Index;
    const targetIndex = Number.isInteger(view.backJ) ? view.backJ : decision.word2Index;
    if (view.event === "suffix-save") {
      decisionHtml = `<div class="valid3302-decision suffix"><small>${vi ? "LƯU MỐC BÊN PHẢI" : "SAVE RIGHTMOST MARK"}</small><strong>suffix[${targetIndex}] = ${sourceIndex}</strong><code>word1[${sourceIndex}] = word2[${targetIndex}] = '${escapeHtml(word2[targetIndex] || "")}'</code></div>`;
    } else if (["suffix-break", "suffix-exhausted-check"].includes(view.event) && sourceIndex < 0) {
      decisionHtml = `<div class="valid3302-decision reject"><small>${vi ? "HẾT WORD1" : "WORD1 EXHAUSTED"}</small><strong>i = ${sourceIndex}</strong><span>${vi ? "Dừng dựng các suffix bên trái" : "Stop building earlier suffix entries"}</span></div>`;
    } else if (Number.isInteger(sourceIndex) && sourceIndex >= 0 && Number.isInteger(targetIndex)) {
      const equal = word1[sourceIndex] === word2[targetIndex];
      decisionHtml = `<div class="valid3302-char-check ${equal ? "accept" : "reject"}"><span><small>word1[${sourceIndex}]</small><strong>'${escapeHtml(word1[sourceIndex])}'</strong></span><code>${equal ? "=" : "≠"}</code><span><small>word2[${targetIndex}]</small><strong>'${escapeHtml(word2[targetIndex])}'</strong></span><b>${equal ? (vi ? "LƯU" : "SAVE") : (vi ? "ĐI TRÁI" : "MOVE LEFT")}</b></div>`;
    } else {
      decisionHtml = `<div class="valid3302-decision suffix"><small>RIGHTMOST EXACT SUFFIX</small><strong>${vi ? "Chuẩn bị quét từ phải sang trái" : "Prepare the right-to-left scan"}</strong></div>`;
    }
  } else if (view.phase === "greedy") {
    const sourceIndex = Number.isInteger(view.forwardI) ? view.forwardI : decision.word1Index;
    const targetIndex = Number.isInteger(view.targetJ) && view.targetJ < word2.length ? view.targetJ : decision.word2Index;
    if (decision.type === "mismatch") {
      const lastTarget = targetIndex === word2.length - 1;
      const bound = decision.futureBound;
      decisionHtml = `<div class="valid3302-gate ${decision.canTake ? "accept" : "reject"}">
        <header><strong>${decision.canTake ? (vi ? "CHỌN MISMATCH" : "TAKE MISMATCH") : (vi ? "BỎ CHỈ SỐ NÀY" : "SKIP THIS INDEX")}</strong><code>i=${sourceIndex}</code></header>
        <div><span class="${!decision.mismatchUsed ? "pass" : "fail"}"><small>1</small><b>${decision.mismatchUsed ? (vi ? "coupon đã dùng" : "coupon already used") : (vi ? "coupon chưa dùng" : "coupon unused")}</b></span><span class="${decision.futureExists ? "pass" : "fail"}"><small>2</small><b>${lastTarget ? (vi ? "target cuối" : "last target") : (vi ? "có exact suffix" : "exact suffix exists")}</b></span><span class="${decision.leavesRoom ? "pass" : "fail"}"><small>3</small><b>${lastTarget ? (vi ? "không cần chừa chỗ" : "no suffix space needed") : `${sourceIndex} < suffix[${targetIndex + 1}] = ${bound}`}</b></span></div>
      </div>`;
    } else if (["match", "selected-match", "append-match"].includes(decision.type)) {
      decisionHtml = `<div class="valid3302-char-check accept"><span><small>word1[${sourceIndex}]</small><strong>'${escapeHtml(word1[sourceIndex] || "")}'</strong></span><code>=</code><span><small>word2[${targetIndex}]</small><strong>'${escapeHtml(word2[targetIndex] || "")}'</strong></span><b>${vi ? "CHỌN EXACT" : "TAKE EXACT"}</b></div>`;
    } else if (decision.type === "selected-mismatch") {
      decisionHtml = `<div class="valid3302-char-check mismatch"><span><small>word1[${sourceIndex}]</small><strong>'${escapeHtml(word1[sourceIndex] || "")}'</strong></span><code>→</code><span><small>word2[${targetIndex}]</small><strong>'${escapeHtml(word2[targetIndex] || "")}'</strong></span><b>${vi ? "DÙNG MISMATCH" : "SPEND MISMATCH"}</b></div>`;
    } else {
      decisionHtml = `<div class="valid3302-decision greedy"><small>${vi ? "QUY TẮC GREEDY" : "GREEDY RULE"}</small><strong>${vi ? "Xét i từ nhỏ đến lớn; chọn ngay khi khả thi" : "Scan i in increasing order; take it as soon as feasible"}</strong></div>`;
    }
  } else if (view.phase === "done") {
    const result = Array.isArray(view.result) ? view.result : answer;
    decisionHtml = `<div class="valid3302-decision result ${view.valid ? "accept" : "reject"}"><small>RETURN</small><strong>[${result.join(", ")}]</strong><code>${view.valid ? `"${escapeHtml(selectedString)}" ≈ "${escapeHtml(word2)}"` : `${selections.length}/${word2.length}`}</code></div>`;
  } else {
    decisionHtml = `<div class="valid3302-decision"><small>${vi ? "MỤC TIÊU" : "GOAL"}</small><strong>${vi ? "Mảng chỉ số nhỏ nhất, không phải chuỗi nhỏ nhất" : "Smallest index array, not the smallest formed string"}</strong></div>`;
  }

  $("treeView").innerHTML = `<div class="valid3302-viz">
    <div class="valid3302-phases">${phases}</div>
    <div class="valid3302-rule"><strong>VALID</strong><span>indices ↑ · selected string differs from word2 at ≤ 1 position</span></div>
    <section class="valid3302-section"><header><strong>WORD1 · SOURCE INDICES</strong><span>${vi ? "chọn từ trái sang phải" : "select left to right"}</span></header><div class="valid3302-row">${word1Html}</div></section>
    <section class="valid3302-section"><header><strong>WORD2 · TARGET</strong><span>${vi ? "mỗi ô cần một chỉ số" : "one source index per cell"}</span></header><div class="valid3302-row target">${word2Html}</div></section>
    <section class="valid3302-section suffix"><header><strong>RIGHTMOST SUFFIX FEASIBILITY</strong><span>suffix[j] → word2[j:] exact</span></header><div class="valid3302-suffix-row">${suffixHtml}</div></section>
    <div class="valid3302-status">${couponHtml}<div class="valid3302-answer"><small>ANSWER INDICES</small><div>${answerHtml}</div><span>${selectedString ? `formed = "${escapeHtml(selectedString)}"` : "formed = \"\""}</span></div></div>
    ${decisionHtml}
    <div class="valid3302-legend"><span><i class="pointer"></i>${vi ? "con trỏ hiện tại" : "current pointer"}</span><span><i class="exact"></i>exact</span><span><i class="mismatch"></i>mismatch</span><span><i class="suffix"></i>suffix position</span></div>
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

  if (!step.__live) {
    const liveView = $("liveVarsView");
    if (liveView) liveView.classList.add("hidden");
  }

  if (step.__live) {
    $("bars").classList.add("hidden");
    $("treeView").classList.add("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    $("liveVarsView").classList.remove("hidden");
    renderLiveVarsView(step);
  } else if (step.validSequenceView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderValidSequenceView(step);
  } else if (step.prefixAverageView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPrefixAverageView(step);
  } else if (step.averageWindowView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderAverageWindowView(step);
  } else if (step.rectangleSweepView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderRectangleSweepView(step);
  } else if (step.kruskalEffortView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderKruskalEffortView(step);
  } else if (step.parallelCoursesView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderParallelCoursesView(step);
  } else if (step.loudRichView || step.loudRichV2) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderLoudRichView(step);
  } else if (step.lruCacheView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderLruCacheView(step);
  } else if (step.lfuCacheView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderLfuCacheView(step);
  } else if (step.rideSharingView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderRideSharingView(step);
  } else if (step.kthPalindromeView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderKthPalindromeView(step);
  } else if (step.palindromeBuildView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPalindromeBuildView(step);
  } else if (step.duplicateZerosView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderDuplicateZerosView(step);
  } else if (step.gcdPairsView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderGcdPairsView(step);
  } else if (step.rotatedSearchView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderRotatedSearchView(step);
  } else if (step.twitterView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderTwitterView(step);
  } else if (step.profitTrackerView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderProfitTrackerView(step);
  } else if (step.cyclicSortView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderCyclicSortView(step);
  } else if (step.meetingRoomsTimelineView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderMeetingRoomsTimelineView(step);
  } else if (step.pairChainView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPairChainView(step);
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
  } else if (step.sameTreeView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderSameTreeView(step);
  } else if (step.sortedListBstView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderSortedListBstView(step);
  } else if (step.recoverBstView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderRecoverBstView(step);
  } else if (step.wordSearchView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderWordSearchView(step);
  } else if (step.keypadPushView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderKeypadPushView(step);
  } else if (step.keypadHeapView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderKeypadHeapView(step);
  } else if (step.stoneGameIIView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderStoneGameIIView(step);
  } else if (step.stoneGameView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderStoneGameView(step);
  } else if (step.predictWinnerView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPredictWinnerView(step);
  } else if (step.rectangleAreaView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderRectangleAreaView(step);
  } else if (step.networkDelayView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderNetworkDelayView(step);
  } else if (step.pathExistsDfsView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPathExistsDfsView(step);
  } else if (step.replaceWordsView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderReplaceWordsView(step);
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
  } else if (step.floodFillView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderFloodFillView(step);
  } else if (step.virusView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderVirusView(step);
  } else if (step.gasStationView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderGasStationView(step);
  } else if (step.gasDepositsView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderGasDepositsView(step);
  } else if (step.gasCircularView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderGasCircularView(step);
  } else if (step.rottingOrangesView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderRottingOrangesView(step);
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
  } else if (step.onlineElectionView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderOnlineElectionView(step);
  } else if (step.shipCapacityView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderShipCapacityView(step);
  } else if (step.kokoSpeedView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderKokoSpeedView(step);
  } else if (step.sqrtBinaryView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderSqrtBinaryView(step);
  } else if (step.histogramRectangleView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderHistogramRectangleView(step);
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
  } else if (step.synonymSentenceView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderSynonymSentenceView(step);
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
  } else if (step.evenOddRatioView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderEvenOddRatioView(step);
  } else if (step.segmentTreeView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderSegmentTreeView(step);
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
  } else if (step.evenOddFillView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderEvenOddFillView(step);
  } else if (step.digitPodiumView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderDigitPodiumView(step);
  } else if (step.nonDecreasingView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderNonDecreasingSubsequencesView(step);
  } else if (step.partitionView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderPartitionView(step);
  } else if (step.twoPointerMergeView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderTwoPointerMergeView(step);
  } else if (step.multiSlotPodiumView) {
    $("bars").classList.add("hidden");
    $("treeView").classList.remove("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    renderMultiSlotPodiumView(step);
  } else {
    $("treeView").classList.add("hidden");
    $("gridView").classList.add("hidden");
    $("bfsGridView").classList.add("hidden");
    $("bars").classList.remove("hidden");
    renderBars(step);
  }

  // Backtracking problems keep their original board/array/grid above and show
  // the persistent decision tree in parallel underneath. Problem 77 already
  // uses the main tree view as its decision tree, so it does not need this pane.
  if (step.decisionTree && !step.__live) {
    $("decisionTreeView").classList.remove("hidden");
    renderDecisionTree(step);
  } else {
    $("decisionTreeView").classList.add("hidden");
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

// ---- Theme toggle (auto/dark/light) ----
(function initTheme() {
  const saved = localStorage.getItem("theme");
  const savedMode = localStorage.getItem("themeMode");
  themeMode = savedMode === "auto" ? "auto" : "manual";
  if (themeMode === "auto") {
    applyAutoTheme();
    themeAutoTimer = window.setInterval(applyAutoTheme, 60000);
  } else {
    applyTheme(saved === "light" ? "light" : "dark");
  }
  updateThemeButtons();
})();

$("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.dataset.theme || "dark";
  const next = current === "dark" ? "light" : "dark";
  setThemeMode("manual");
  applyTheme(next);
  localStorage.setItem("theme", next);
});

$("themeAuto").addEventListener("click", () => {
  if (themeMode === "auto") {
    setThemeMode("manual");
    localStorage.setItem("theme", document.documentElement.dataset.theme || "dark");
  } else {
    setThemeMode("auto");
    applyAutoTheme();
  }
});

function themeFromCurrentTime(now = new Date()) {
  const hour = now.getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

function setThemeMode(mode) {
  themeMode = mode === "auto" ? "auto" : "manual";
  localStorage.setItem("themeMode", themeMode);
  if (themeAutoTimer) {
    window.clearInterval(themeAutoTimer);
    themeAutoTimer = null;
  }
  if (themeMode === "auto") {
    themeAutoTimer = window.setInterval(applyAutoTheme, 60000);
  }
  updateThemeButtons();
}

function applyAutoTheme() {
  const theme = themeFromCurrentTime();
  applyTheme(theme);
  localStorage.setItem("theme", theme);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (window.monaco && window.monaco.editor) {
    window.monaco.editor.setTheme(theme === "dark" ? "leetcode-python-dark" : "leetcode-python-light");
  }
  const moonIcon = $("themeIconMoon");
  const sunIcon = $("themeIconSun");
  if (theme === "dark") {
    moonIcon.classList.add("hidden");
    sunIcon.classList.remove("hidden");
  } else {
    moonIcon.classList.remove("hidden");
    sunIcon.classList.add("hidden");
  }
  updateThemeButtons();
}

function updateThemeButtons() {
  const autoBtn = $("themeAuto");
  if (autoBtn) {
    autoBtn.textContent = t().autoTheme || "Auto";
    autoBtn.classList.toggle("active", themeMode === "auto");
    autoBtn.setAttribute("aria-pressed", themeMode === "auto" ? "true" : "false");
    autoBtn.title = themeMode === "auto"
      ? (lang === "vi" ? "Đang tự động đổi sáng/tối theo giờ hiện tại" : "Using day/night by current time")
      : (lang === "vi" ? "Bật tự động sáng/tối theo giờ hiện tại" : "Use day/night by current time");
  }
  const toggleBtn = $("themeToggle");
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-label", themeMode === "auto"
      ? (lang === "vi" ? "Chuyển sang chỉnh theme thủ công" : "Switch to manual theme")
      : (lang === "vi" ? "Đổi sáng/tối" : "Toggle theme"));
  }
}

// =====================================================================
// ---- Live Python editor (Monaco + Pyodide) ----
// Lets the user freely edit the shown Python code and re-run it for real
// in the browser (via Pyodide/WebAssembly), tracing every executed line
// and the local variables at that point (via sys.settrace), independent
// of the hand-authored step animations above. Both libraries are loaded
// lazily, only the first time the user opens the editor.
// =====================================================================

let monacoEditorInstance = null;
let monacoLoadPromise = null;
let monacoSourceKey = null;
let pythonCompletionsRegistered = false;
let monacoThemesRegistered = false;
let pyodideInstance = null;
let pyodideLoadPromise = null;
let liveMode = false;
let liveSteps = [];

const LIVE_I18N = {
  vi: {
    loading: "Đang tải Python runtime (chỉ lần đầu)...",
    running: "Đang chạy...",
    ready: (n) => `Đã chạy xong — ${n} bước.`,
    doneNoTrace: "Chạy xong nhưng không bắt được dòng nào (code có thể không gọi hàm nào).",
  },
  en: {
    loading: "Loading Python runtime (first time only)...",
    running: "Running...",
    ready: (n) => `Finished — ${n} step(s).`,
    doneNoTrace: "Ran successfully but no traced lines were captured (no function was called).",
  },
};
const lt = () => LIVE_I18N[lang] || LIVE_I18N.en;

function loadMonaco() {
  if (monacoLoadPromise) return monacoLoadPromise;
  monacoLoadPromise = new Promise((resolve, reject) => {
    if (!window.require) {
      reject(new Error("Monaco loader script not found"));
      return;
    }
    window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs" } });
    window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
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

      const declaredFunctions = [];
      const seenFunctionNames = new Set();
      const functionPattern = /^(\s*)def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:/;
      for (let lineNumber = 1; lineNumber <= model.getLineCount(); lineNumber += 1) {
        if (lineNumber === currentLine && /^\s*def\b/.test(model.getLineContent(lineNumber))) continue;
        const match = model.getLineContent(lineNumber).match(functionPattern);
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
  if (!classMatch) return "class Solution:\n    pass";

  const classIndent = classMatch[1] || "";
  const afterClass = code.slice(classMatch.index + classMatch[0].length);
  const methodMatch = afterClass.match(/\n([ \t]+)def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:->[^\n:]+)?\s*:[ \t]*(?:#.*)?/);
  if (!methodMatch) return `${classIndent}class Solution:\n${classIndent}    pass`;

  const methodIndent = methodMatch[1];
  const methodName = methodMatch[2];
  const args = methodMatch[3].trim();
  const bodyIndent = `${methodIndent}    `;
  return `${classIndent}class Solution:\n${methodIndent}def ${methodName}(${args}):\n${bodyIndent}pass`;
}

async function collectLiveCallArgs() {
  // Re-use the same input/params the canned visualizer already validated.
  const isString = problemData && problemData.inputKind === "string";
  const isStringArray = problemData && problemData.inputKind === "stringArray";
  let input;
  if (isString) {
    input = $("arrInput").value.trim();
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
    fontLigatures: true,
    fontSize: 14,
    lineHeight: 21,
    minimap: { enabled: false },
    automaticLayout: true,
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
  return monacoEditorInstance;
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

def __viz_materialize(value, context=None):
    """Convert JSON-safe live arguments into LeetCode helper objects."""
    if context is None:
        context = {}
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
    if isinstance(value, list):
        return [__viz_materialize(item, context) for item in value]
    if isinstance(value, tuple):
        return tuple(__viz_materialize(item, context) for item in value)
    if isinstance(value, dict):
        return {key: __viz_materialize(item, context) for key, item in value.items()}
    return value

def __viz_run_trace(user_code, method_name, call_args, design_config=None):
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
    }
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
                    materialized_args = [__viz_materialize(value, materialize_context) for value in design_config.get("args", [])]
                    result = function2(*materialized_args)
                else:
                    class2 = ns2.get(design_config.get("className"))
                    if class2 is None:
                        raise RuntimeError(f"Class '{design_config.get('className')}' was not found.")
                    constructor_args = [__viz_materialize(value, materialize_context) for value in design_config.get("constructorArgs", [])]
                    instance2 = class2(*constructor_args)
                    result = []
                    for operation in design_config.get("operations", []):
                        operation_args = [__viz_materialize(value, materialize_context) for value in operation.get("args", [])]
                        operation_result = getattr(instance2, operation["name"])(*operation_args)
                        materialize_context["previous_result"] = operation_result
                        result.append(operation_result)
            else:
                Solution2 = ns2.get("Solution")
                if Solution2 is None:
                    raise RuntimeError("No 'class Solution' found in the code.")
                instance2 = Solution2()
                method2 = getattr(instance2, method_name, None)
                if method2 is None:
                    raise RuntimeError(f"Solution has no method '{method_name}'.")
                materialized_args = [__viz_materialize(value, materialize_context) for value in call_args]
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

    const runFn = pyodide.globals.get("__viz_run_trace");
    const resultProxy = runFn(
      pyodide.globals.get("__viz_user_code"),
      methodName,
      pyodide.globals.get("__viz_call_args"),
      pyodide.globals.get("__viz_design"),
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
    const msg = (err && err.message) || String(err);
    showError("liveError", msg);
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
  // Collapse the whole Monaco editor panel and show the read-only
  // highlighted trace instead, so code + step controls behave like the
  // canned mode. Re-show "Edit & run code" so the user can hop back into
  // the editor (with their code preserved) without fully exiting live mode.
  $("liveEditorWrap").classList.add("hidden");
  $("codePanel").classList.remove("hidden");
  $("liveEditBtn").classList.remove("hidden");
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
function resetLiveEditorState() {
  liveMode = false;
  liveSteps = [];
  $("liveExitBtn").classList.add("hidden");
  $("liveEditorWrap").classList.add("hidden");
  $("codePanel").classList.remove("hidden");
  $("liveEditBtn").classList.remove("hidden");
  $("liveVarsView").classList.add("hidden");
  hide("liveError");
  $("liveStatus").textContent = "";
}

function setLiveMode(on) {
  liveMode = on;
  $("liveExitBtn").classList.toggle("hidden", !on);
  $("liveEditorWrap").classList.toggle("hidden", !on);
  $("codePanel").classList.toggle("hidden", on);
  if (!on) {
    // Restore the canned visualization exactly as it was before entering live mode.
    renderCode();
    if (problemData) {
      // Re-run the last canned solve so the right-hand visualization comes back.
      runViz();
    }
  }
}

$("liveEditBtn") && $("liveEditBtn").addEventListener("click", async () => {
  liveMode = true;
  $("liveExitBtn").classList.remove("hidden");
  $("liveEditorWrap").classList.remove("hidden");
  $("codePanel").classList.add("hidden");
  try {
    await ensureMonacoEditor();
  } catch (err) {
    showError("liveError", (err && err.message) || String(err));
  }
});

$("liveExitBtn") && $("liveExitBtn").addEventListener("click", () => {
  setLiveMode(false);
});

$("liveRunBtn") && $("liveRunBtn").addEventListener("click", runLiveCode);

$("liveClearBtn") && $("liveClearBtn").addEventListener("click", async () => {
  const editor = await ensureMonacoEditor();
  const skeleton = clearedSolutionSkeleton(editor.getValue() || currentPrimaryCode());
  editor.setValue(skeleton);
  const passLine = skeleton.split("\n").findIndex((line) => line.trim() === "pass") + 1;
  if (passLine > 0) {
    editor.setPosition({ lineNumber: passLine, column: skeleton.split("\n")[passLine - 1].length + 1 });
    editor.focus();
  }
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
