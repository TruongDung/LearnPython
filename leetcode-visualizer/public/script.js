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

function shouldUseLineByLineDebug() {
  return problemData && problemData.category && problemData.category.key === "dp";
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

    steps = shouldUseLineByLineDebug()
      ? expandStepsLineByLine(data.steps)
      : (data.steps || []);
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
      row.appendChild(ln); row.appendChild(txt); section.appendChild(row);
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
  const { dp, text1, text2, hlCell, pathCells, cellLabels, showIndices, rowLabels, colLabels } = step.grid;
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

  let html = '<table class="dp-grid"><thead><tr><th></th><th></th>';
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
