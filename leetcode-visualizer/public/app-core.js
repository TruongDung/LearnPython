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
const companySubTabSelection = new Map(); // groupKey -> active sub-tab key
let problemSearchQuery = "";
let activeCatalogGroupKey = null;
let categoryTagActiveIndex = -1;
let debugBreakpoints = new Set();
let debugWatches = [];
let searchErrorState = null;
let themeMode = "manual";
let themeAutoTimer = null;
let activeCatalogJumpKey = null;
let catalogJumpHighlightTimer = null;
let codeSnippetBlurred = true;
const RECENT_PROBLEMS_KEY = "recentProblems";
const RECENT_PROBLEMS_LIMIT = 10;
const CODE_SNIPPET_BLURRED_KEY = "leetcodeCodeSnippetBlurred";
const problemVisualizationAssetPromises = new Map();

function problemVisualizationAssetNodes(problemId) {
  const id = Number(problemId);
  if (!Number.isInteger(id)) return [];
  const suffix = new RegExp(`-${id}\\.(?:css|js)(?:[?#]|$)`);
  return [...document.querySelectorAll("template[data-problem-assets]")]
    .flatMap((template) => [...template.content.querySelectorAll("link[href], script[src]")])
    .filter((asset) => suffix.test(asset.getAttribute("href") || asset.getAttribute("src") || ""));
}

function loadProblemVisualizationAsset(sourceAsset) {
  const isStyle = sourceAsset.tagName === "LINK";
  const url = sourceAsset.getAttribute(isStyle ? "href" : "src");
  if (!url) return Promise.resolve();
  if (problemVisualizationAssetPromises.has(url)) {
    return problemVisualizationAssetPromises.get(url);
  }

  const promise = new Promise((resolve, reject) => {
    const asset = document.createElement(isStyle ? "link" : "script");
    asset.dataset.problemAsset = url;
    if (isStyle) {
      asset.rel = "stylesheet";
      asset.href = url;
    } else {
      asset.src = url;
      asset.async = false;
    }
    asset.addEventListener("load", resolve, { once: true });
    asset.addEventListener("error", () => {
      problemVisualizationAssetPromises.delete(url);
      reject(new Error(`Failed to load visualization asset: ${url}`));
    }, { once: true });
    document.head.appendChild(asset);
  });
  problemVisualizationAssetPromises.set(url, promise);
  return promise;
}

async function ensureProblemVisualizationAssets(problemId) {
  const assets = problemVisualizationAssetNodes(problemId);
  const styles = assets.filter((asset) => asset.tagName === "LINK");
  const scripts = assets.filter((asset) => asset.tagName === "SCRIPT");
  const stylesReady = Promise.all(styles.map(loadProblemVisualizationAsset));

  // Keep script execution deterministic for problems such as #745 that use
  // two renderer modules. Styles can download in parallel with that chain.
  for (const script of scripts) {
    await loadProblemVisualizationAsset(script);
  }
  await stylesReady;
}

async function ensureBaseVisualizationRuntime() {
  const sourceAsset = [...document.querySelectorAll("template[data-shared-visualization-assets]")]
    .flatMap((template) => [...template.content.querySelectorAll("script[src]")])
    .find((asset) => {
      const src = asset.getAttribute("src");
      return src && new URL(src, document.baseURI).pathname.endsWith("/app-renderers-base.js");
    });
  if (!sourceAsset) {
    throw new Error("Base visualization runtime not found");
  }
  await loadProblemVisualizationAsset(sourceAsset);
}

function warmProblemVisualizationAssets(problemId) {
  const load = () => ensureProblemVisualizationAssets(problemId).catch((error) => {
    console.error(error);
  });
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(load, { timeout: 1500 });
  } else {
    window.setTimeout(load, 0);
  }
}

// ---- UI strings by language ----
const I18N = {
  vi: {
    subtitle: "Nhập số bài LeetCode để xem thuật toán chạy từng bước",
    problemIdLabel: "Số bài LeetCode",
    loadBtn: "Tải bài",
    keywordSearchLabel: "Tìm theo từ khóa",
    keywordSearchPlaceholder: "vd: meet, heap, tree...",
    categoryTagLabel: "Thẻ danh mục",
    categoryTagPlaceholder: "Chọn hoặc nhập danh mục...",
    categoryTagToggle: "Hiện danh sách thẻ danh mục",
    noCategoryTags: "Không tìm thấy danh mục.",
    openCategory: (category) => `Mở danh mục ${category}`,
    closeCategory: (category) => `Đóng danh mục ${category}`,
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
    liveEditBtn: "Sửa & chạy code",
    codeBlurBtn: "Làm mờ code",
    codeRevealBtn: "Hiện code",
    liveExitBtn: "Đóng editor",
    liveRunBtn: "Chạy code của tôi",
    liveCopyBtn: "Sao chép code",
    liveClearBtn: "Clear thân hàm",
    liveResetBtn: "Về code gốc",
    autoTheme: "Tự động",
    backToTop: "Về đầu trang",
    catalogJumpNav: "Đi tới bài hiện tại trong một tag",
    jumpToTag: (tag, id) => `Đi tới tag ${tag}, tại bài #${id}`,
    quickJumpLabel: "Đi nhanh đến bài LeetCode",
    quickJumpPlaceholder: "Nhập số bài",
    quickJumpBtn: "Mở",
  },
  en: {
    subtitle: "Enter a LeetCode problem number to watch the algorithm run step by step",
    problemIdLabel: "LeetCode problem number",
    loadBtn: "Load",
    keywordSearchLabel: "Search by keyword",
    keywordSearchPlaceholder: "e.g. meet, heap, tree...",
    categoryTagLabel: "Category Tag",
    categoryTagPlaceholder: "Choose or type a category...",
    categoryTagToggle: "Show category tags",
    noCategoryTags: "No categories found.",
    openCategory: (category) => `Open ${category} category`,
    closeCategory: (category) => `Close ${category} category`,
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
    liveEditBtn: "Edit & run code",
    codeBlurBtn: "Blur code",
    codeRevealBtn: "Reveal code",
    liveExitBtn: "Exit editor",
    liveRunBtn: "Run my code",
    liveCopyBtn: "Copy code",
    liveClearBtn: "Clear body",
    liveResetBtn: "Reset to original",
    autoTheme: "Auto",
    backToTop: "Back to top",
    catalogJumpNav: "Jump to this problem in a tag",
    jumpToTag: (tag, id) => `Go to ${tag}, problem #${id}`,
    quickJumpLabel: "Jump to LeetCode problem",
    quickJumpPlaceholder: "Problem number",
    quickJumpBtn: "Go",
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
  renderCategoryTagOptions();
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
  const categoryInput = $("categoryTagInput");
  if (categoryInput) {
    categoryInput.placeholder = t().categoryTagPlaceholder;
    const selectedGroup = (catalogData || []).find((group) => group.key === activeCatalogGroupKey);
    if (selectedGroup && document.activeElement !== categoryInput) categoryInput.value = pick(selectedGroup);
  }
  const categoryToggle = $("categoryTagToggle");
  if (categoryToggle) categoryToggle.setAttribute("aria-label", t().categoryTagToggle);
  const liveCopyButton = $("liveCopyBtn");
  if (liveCopyButton && !liveCopyButton.classList.contains("copied")) {
    liveCopyButton.setAttribute("aria-label", t().liveCopyBtn);
    liveCopyButton.title = t().liveCopyBtn;
  }
  ["liveRunBtn", "liveClearBtn", "liveResetBtn"].forEach((id) => {
    const button = $(id);
    if (!button) return;
    button.setAttribute("aria-label", t()[id]);
    button.title = t()[id];
  });
  const backToTopButton = $("backToTopBtn");
  if (backToTopButton) {
    backToTopButton.setAttribute("aria-label", t().backToTop);
    backToTopButton.title = t().backToTop;
  }
  const catalogJumpNav = $("catalogJumpNav");
  if (catalogJumpNav) catalogJumpNav.setAttribute("aria-label", t().catalogJumpNav);
  const quickProblemInput = $("quickProblemId");
  if (quickProblemInput) {
    quickProblemInput.placeholder = t().quickJumpPlaceholder;
    quickProblemInput.setAttribute("aria-label", t().quickJumpLabel);
    quickProblemInput.closest("form")?.setAttribute("aria-label", t().quickJumpLabel);
    if (quickProblemInput.getAttribute("aria-invalid") !== "true") quickProblemInput.title = t().quickJumpLabel;
  }
  const quickProblemGoButton = $("quickProblemGoBtn");
  if (quickProblemGoButton) {
    quickProblemGoButton.setAttribute("aria-label", t().quickJumpBtn);
    quickProblemGoButton.title = t().quickJumpBtn;
  }
  const liveEditButton = $("liveEditBtn");
  if (liveEditButton) {
    liveEditButton.setAttribute("aria-label", t().liveEditBtn);
    liveEditButton.dataset.tooltip = t().liveEditBtn;
  }
  updateCodeBlurButton();
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
      loadProblem({ scrollToEnd: true });
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
      renderCategoryTagOptions();
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
    groupEl.dataset.groupKey = group.key;

    const titleEl = document.createElement("div");
    titleEl.className = "cat-title";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "cat-toggle";
    const isExpanded = group.key === activeCatalogGroupKey;
    toggleBtn.textContent = isExpanded ? "−" : "+";
    toggleBtn.setAttribute("aria-label", isExpanded ? t().closeCategory(pick(group)) : t().openCategory(pick(group)));
    toggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = pick(group);
    const countSpan = document.createElement("span");
    countSpan.className = "count";
    countSpan.textContent = `(${group.problems.length})`;

    titleEl.appendChild(toggleBtn);
    titleEl.appendChild(nameSpan);
    titleEl.appendChild(countSpan);

    const itemsEl = document.createElement("div");
    itemsEl.id = `catalog-group-${group.key}`;
    itemsEl.className = "cat-items" + (isExpanded ? "" : " collapsed");
    toggleBtn.setAttribute("aria-controls", itemsEl.id);

    const mountGroup = () => {
      toggleBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openCatalogGroupExclusively(isExpanded ? null : group.key);
      });
      titleEl.addEventListener("click", () => {
        openCatalogGroupExclusively(isExpanded ? null : group.key);
      });
      groupEl.appendChild(titleEl);
      groupEl.appendChild(itemsEl);
      container.appendChild(groupEl);
    };

    // Collapsed categories only need their header. Building every hidden chip
    // created thousands of buttons and DOM nodes before mobile Safari became
    // interactive. The active category is populated on demand after a click.
    if (!isExpanded) {
      mountGroup();
      return;
    }

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

    if (group.key === "string") {
      const studyGuide = document.createElement("div");
      studyGuide.className = "string-study-guide";
      const reader = document.createElement("a");
      reader.className = "trie-learn-suggestion string-study-link";
      reader.href = `string-study-roadmap.html?lang=${lang}`;
      reader.target = "_blank";
      reader.rel = "noopener noreferrer";
      reader.innerHTML = `<span class="trie-learn-suggestion-icon">📘</span><span><strong>${lang === "vi" ? "Lộ trình học String · 895 bài" : "String learning roadmap · 895 problems"}</strong><small>${lang === "vi" ? "126 bài nền tảng → 769 bài mở rộng · danh sách đầy đủ theo thứ tự học" : "126 core → 769 additional problems · complete list in learning order"}</small></span><b aria-hidden="true">↗</b>`;
      studyGuide.appendChild(reader);
      itemsEl.appendChild(studyGuide);
    }

    if (group.key === "trie") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">🧭</span><span><strong>${lang === "vi" ? "Learn Suggestion" : "Learn Suggestion"}</strong><small>${lang === "vi" ? "8 loại Trie · 3 level · lộ trình phỏng vấn" : "8 Trie patterns · 3 levels · interview roadmap"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const patterns = [
          { name: "Prefix Trie", note: vi ? "Prefix cơ bản · thay root · gợi ý tìm kiếm" : "Basic prefixes · root replacement · search suggestions", ids: [208, 648, 1268] },
          { name: "String Trie", note: vi ? "Wildcard · từ điển · ghép nhiều từ" : "Wildcards · dictionaries · combined words", ids: [211, 676, 472] },
          { name: "Binary Trie", note: vi ? "Bit 0/1 · Maximum XOR" : "Bits 0/1 · Maximum XOR", ids: [421, 1707, 1938, 2935] },
          { name: "Trie + Backtracking", note: vi ? "DFS trên board · sinh hình vuông từ" : "Board DFS · build word squares", ids: [212, 425] },
          { name: "Reverse Trie", note: vi ? "Đọc chuỗi ngược · palindrome" : "Read strings backward · palindromes", ids: [1032, 336] },
          { name: "Prefix + Suffix", note: vi ? "Kết hợp tiền tố và hậu tố" : "Combine prefixes and suffixes", ids: [745, 3042, 3045] },
          { name: "Counting / Aggregate", note: vi ? "Đếm prefix · cộng giá trị theo prefix" : "Count prefixes · aggregate values", ids: [677, 1804] },
          { name: "Complete Prefix", note: vi ? "Mọi prefix đều phải tồn tại" : "Every prefix must exist", ids: [720, 1858, 3043] },
        ];
        const levels = [
          {
            tone: "green",
            icon: "🟢",
            title: vi ? "Level 1 — Phải biết" : "Level 1 — Must know",
            problems: [
              [208, "Implement Trie"], [211, "Design Add and Search Words"], [648, "Replace Words"],
              [677, "Map Sum Pairs"], [720, "Longest Word"], [1268, "Search Suggestions"], [1804, "Implement Trie II"],
            ],
          },
          {
            tone: "yellow",
            icon: "🟡",
            title: vi ? "Level 2 — Muốn giỏi Trie" : "Level 2 — Become strong at Trie",
            problems: [
              [212, "Word Search II"], [421, "Maximum XOR"], [676, "Magic Dictionary"],
              [745, "Prefix and Suffix Search"], [1032, "Stream of Characters"],
              [1858, "Longest Word With All Prefixes"], [3043, "Longest Common Prefix"],
            ],
          },
          {
            tone: "red",
            icon: "🔴",
            title: vi ? "Level 3 — Nâng cao" : "Level 3 — Advanced",
            problems: [
              [336, "Palindrome Pairs"], [425, "Word Squares"], [472, "Concatenated Words"],
              [1707, "Maximum XOR With an Element"], [1938, "Maximum Genetic Difference"],
              [1948, "Delete Duplicate Folders"], [2935, "Maximum Strong Pair XOR II"],
              [3045, "Prefix and Suffix Pairs II"],
            ],
          },
        ];
        const sequence = [208, 211, 648, 677, 720, 1268, 212, 421, 745, 1032, 1707];
        const patternCards = patterns.map((pattern, index) => `<article class="trie-pattern-card"><span class="trie-pattern-number">${String(index + 1).padStart(2, "0")}</span><h4>${pattern.name}</h4><p>${pattern.note}</p><div>${pattern.ids.map((id) => `<a class="trie-problem-link" href="#leetcode-${id}" data-trie-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`).join("")}</div></article>`).join("");
        const levelCards = levels.map((level) => `<article class="trie-level-card ${level.tone}"><h4><span>${level.icon}</span>${level.title}</h4><ul>${level.problems.map(([id, name]) => `<li><a class="trie-problem-row" href="#leetcode-${id}" data-trie-problem-id="${id}"><span>#${id}</span><b>${name}</b></a></li>`).join("")}</ul></article>`).join("");

        $("trieLearnEyebrow").textContent = "TRIE LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "Bạn chỉ cần nhớ 8 loại Trie" : "The 8 Trie patterns to remember";
        $("trieLearnIntro").textContent = vi
          ? "Không cần làm hết mọi bài. Hãy nhận diện đúng pattern trước, sau đó học theo level phỏng vấn."
          : "You do not need to solve everything. Recognize the pattern first, then progress through the interview levels.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình học Trie" : "Close Trie learning guide");
        content.innerHTML = `
          <section class="trie-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "8 loại Trie cốt lõi" : "8 core Trie patterns"}</h3><p>${vi ? "Nhìn dạng bài để chọn đúng biến thể Trie." : "Use the problem shape to select the right Trie variant."}</p></div></div>
            <div class="trie-pattern-grid">${patternCards}</div>
          </section>
          <section class="trie-learn-section">
            <div class="trie-interview-note">⭐ <strong>${vi ? "Nếu mục tiêu là phỏng vấn:" : "If your goal is interviews:"}</strong> ${vi ? "không cần làm hết — chia thành 3 level." : "do not solve everything — use these 3 levels."}</div>
            <div class="trie-level-grid">${levelCards}</div>
          </section>
          <section class="trie-roadmap">
            <div class="trie-learn-section-title"><span>03</span><div><h3>${vi ? "Thứ tự học từ đầu" : "Recommended learning order"}</h3><p>${vi ? "Đi từ thao tác Trie cơ bản đến backtracking và Binary Trie." : "Move from basic Trie operations to backtracking and Binary Trie."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `<a class="trie-problem-link" href="#leetcode-${id}" data-trie-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-trie-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.trieProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) {
              panel.scrollIntoView({ behavior: "auto", block: "start" });
            }
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "sliding") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion sliding-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">🪟</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "17 pattern Sliding Window · lộ trình phỏng vấn" : "17 Sliding Window patterns · interview roadmap"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const patterns = [
          { name: "1. Fixed Size", problems: [[643, "Maximum Average Subarray I"], [1343, "Number of Sub-arrays of Size K and Average ≥ Threshold"], [1456, "Maximum Number of Vowels in a Substring of Given Length"], [2461, "Maximum Sum of Distinct Subarrays With Length K"], [1423, "Maximum Points You Can Obtain from Cards"], [1052, "Grumpy Bookstore Owner"], [567, "Permutation in String"], [438, "Find All Anagrams in a String"]] },
          { name: "2. Longest Valid Window", problems: [[3, "Longest Substring Without Repeating Characters"], [159, "Longest Substring with At Most Two Distinct Characters"], [340, "Longest Substring with At Most K Distinct Characters"], [424, "Longest Repeating Character Replacement"], [904, "Fruit Into Baskets"], [1004, "Max Consecutive Ones III"], [1493, "Longest Subarray of 1's After Deleting One Element"], [2024, "Maximize the Confusion of an Exam"], [2958, "Length of Longest Subarray With at Most K Frequency"], [1208, "Get Equal Substrings Within Budget"], [1438, "Longest Continuous Subarray With Absolute Diff ≤ Limit"]] },
          { name: "3. Shortest Valid Window", problems: [[76, "Minimum Window Substring"], [209, "Minimum Size Subarray Sum"], [1234, "Replace the Substring for Balanced String"], [632, "Smallest Range Covering Elements from K Lists"]] },
          { name: "4. Frequency / Character Counting", problems: [[3, "Longest Substring Without Repeating Characters"], [76, "Minimum Window Substring"], [159, "Longest Substring with At Most Two Distinct Characters"], [340, "Longest Substring with At Most K Distinct Characters"], [424, "Longest Repeating Character Replacement"], [438, "Find All Anagrams in a String"], [567, "Permutation in String"], [904, "Fruit Into Baskets"], [992, "Subarrays with K Different Integers"], [1358, "Number of Substrings Containing All Three Characters"], [2958, "Length of Longest Subarray With at Most K Frequency"]] },
          { name: "5. At Most K", problems: [[159, "Longest Substring with At Most Two Distinct Characters"], [340, "Longest Substring with At Most K Distinct Characters"], [904, "Fruit Into Baskets"], [1004, "Max Consecutive Ones III"], [2024, "Maximize the Confusion of an Exam"], [2958, "Length of Longest Subarray With at Most K Frequency"], [992, "Subarrays with K Different Integers"]] },
          { name: "6. Exactly K / Exactly Condition", problems: [[992, "Subarrays with K Different Integers"], [930, "Binary Subarrays With Sum"], [1248, "Count Number of Nice Subarrays"], [1358, "Number of Substrings Containing All Three Characters"]] },
          { name: "7. Anagram / Permutation", problems: [[438, "Find All Anagrams in a String"], [567, "Permutation in String"], [76, "Minimum Window Substring"], [30, "Substring with Concatenation of All Words"]] },
          { name: "8. Monotonic Deque", problems: [[239, "Sliding Window Maximum"], [1438, "Longest Continuous Subarray With Absolute Diff ≤ Limit"], [862, "Shortest Subarray with Sum at Least K"], [1696, "Jump Game VI"], [2762, "Continuous Subarrays"]] },
          { name: "9. Prefix Sum + Sliding Window", problems: [[209, "Minimum Size Subarray Sum"], [862, "Shortest Subarray with Sum at Least K"], [930, "Binary Subarrays With Sum"], [1248, "Count Number of Nice Subarrays"], [1703, "Minimum Adjacent Swaps for K Consecutive Ones"]] },
          { name: "10. Sliding Window + Heap", problems: [[480, "Sliding Window Median"], [632, "Smallest Range Covering Elements from K Lists"]] },
          { name: "11. Sliding Window + Two Deques", problems: [[1438, "Longest Continuous Subarray With Absolute Diff ≤ Limit"]] },
          { name: "12. Sliding Window + Sort", problems: [[1838, "Frequency of the Most Frequent Element"], [2302, "Count Subarrays With Score Less Than K"]] },
          { name: "13. Sliding Window + Binary Search", problems: [[1838, "Frequency of the Most Frequent Element"], [2513, "Minimize the Maximum of Two Arrays"]] },
          { name: "14. Complement Window", problems: [[1423, "Maximum Points You Can Obtain from Cards"], [1658, "Minimum Operations to Reduce X to Zero"], [2516, "Take K of Each Character From Left and Right"]] },
          { name: "15. String Sliding Window", problems: [[3, "Longest Substring Without Repeating Characters"], [30, "Substring with Concatenation of All Words"], [76, "Minimum Window Substring"], [159, "Longest Substring with At Most Two Distinct Characters"], [340, "Longest Substring with At Most K Distinct Characters"], [424, "Longest Repeating Character Replacement"], [438, "Find All Anagrams in a String"], [567, "Permutation in String"], [1208, "Get Equal Substrings Within Budget"], [1234, "Replace the Substring for Balanced String"], [1358, "Number of Substrings Containing All Three Characters"], [2024, "Maximize the Confusion of an Exam"]] },
          { name: "16. Array Sliding Window", problems: [[209, "Minimum Size Subarray Sum"], [643, "Maximum Average Subarray I"], [904, "Fruit Into Baskets"], [1004, "Max Consecutive Ones III"], [1052, "Grumpy Bookstore Owner"], [1423, "Maximum Points You Can Obtain from Cards"], [1493, "Longest Subarray of 1's After Deleting One Element"], [1658, "Minimum Operations to Reduce X to Zero"], [1838, "Frequency of the Most Frequent Element"], [2461, "Maximum Sum of Distinct Subarrays With Length K"], [2516, "Take K of Each Character From Left and Right"], [2762, "Continuous Subarrays"], [2962, "Count Subarrays Where Max Element Appears at Least K Times"]] },
          { name: "17. Advanced Sliding Window", problems: [[30, "Substring with Concatenation of All Words"], [76, "Minimum Window Substring"], [239, "Sliding Window Maximum"], [480, "Sliding Window Median"], [632, "Smallest Range Covering Elements from K Lists"], [862, "Shortest Subarray with Sum at Least K"], [992, "Subarrays with K Different Integers"], [1438, "Longest Continuous Subarray With Absolute Diff ≤ Limit"], [1703, "Minimum Adjacent Swaps for K Consecutive Ones"], [1838, "Frequency of the Most Frequent Element"], [2302, "Count Subarrays With Score Less Than K"], [2444, "Count Subarrays With Fixed Bounds"], [2516, "Take K of Each Character From Left and Right"], [2762, "Continuous Subarrays"], [2962, "Count Subarrays Where Max Element Appears at Least K Times"]] },
        ];
        const sequence = [3, 209, 567, 438, 424, 904, 1004, 76, 30, 239, 992, 1438, 862];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name]) => supportedIds.has(id)
          ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-sliding-problem-id="${id}"><span>#${id}</span><b>${name}</b></a></li>`
          : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}<em>${unavailableText}</em></b></span></li>`;
        const roadmapItem = (id) => supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-sliding-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`;
        const patternCards = patterns.map((pattern, index) => `<details class="sliding-pattern-card" open><summary><span>${String(index + 1).padStart(2, "0")}</span><strong>${pattern.name.replace(/^\d+\.\s*/, "")}</strong><small>${pattern.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${pattern.problems.map(problemRow).join("")}</ul></details>`).join("");

        $("trieLearnEyebrow").textContent = "SLIDING WINDOW LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "17 pattern Sliding Window cần nhớ" : "17 Sliding Window patterns to remember";
        $("trieLearnIntro").textContent = vi
          ? "Nhận diện loại cửa sổ trước: fixed, longest, shortest, frequency, deque hoặc kỹ thuật kết hợp."
          : "Identify the window type first: fixed, longest, shortest, frequency, deque, or a combined technique.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình Sliding Window" : "Close Sliding Window learning guide");
        content.innerHTML = `
          <section class="trie-learn-section sliding-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "17 nhóm bài cốt lõi" : "17 core problem groups"}</h3><p>${vi ? "Bấm tiêu đề để thu gọn; bài chưa có visualization được đánh dấu riêng." : "Select a heading to collapse it; unavailable visualizations are marked separately."}</p></div></div>
            <div class="sliding-pattern-grid">${patternCards}</div>
          </section>
          <section class="trie-roadmap sliding-roadmap">
            <div class="trie-learn-section-title"><span>02</span><div><h3>${vi ? "Thứ tự nên học" : "Recommended learning order"}</h3><p>${vi ? "Đi từ cửa sổ cơ bản đến frequency, deque và bài shortest nâng cao." : "Progress from basic windows to frequency, deque, and advanced shortest-window problems."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-sliding-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.slidingProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) {
              panel.scrollIntoView({ behavior: "auto", block: "start" });
            }
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "monotonic-stack") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion monotonic-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">↕</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "Monotonic Stack · next greater → contribution → hard" : "Monotonic Stack · next greater → contribution → hard"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const groups = [
          {
            icon: "01",
            name: vi ? "Nền tảng: next greater / warmer day" : "Foundation: next greater / warmer day",
            problems: [[496, "Next Greater Element I"], [503, "Next Greater Element II"], [739, "Daily Temperatures"], [1019, "Next Greater Node In Linked List"]],
          },
          {
            icon: "02",
            name: vi ? "Next smaller / discount / cleanup" : "Next smaller / discount / cleanup",
            problems: [[1475, "Final Prices With a Special Discount"], [2487, "Remove Nodes From Linked List"], [2289, "Steps to Make Array Non-decreasing"], [581, "Shortest Unsorted Continuous Subarray"]],
          },
          {
            icon: "03",
            name: vi ? "Greedy stack trên string/subsequence" : "Greedy stack on strings/subsequences",
            problems: [[316, "Remove Duplicate Letters"], [1081, "Smallest Subsequence"], [402, "Remove K Digits"], [1673, "Most Competitive Subsequence"], [2030, "Smallest K-Length Subsequence"]],
          },
          {
            icon: "04",
            name: vi ? "Span, ramp, chunk" : "Span, ramp, chunks",
            problems: [[901, "Online Stock Span"], [962, "Maximum Width Ramp"], [769, "Max Chunks To Make Sorted"], [768, "Max Chunks To Make Sorted II"], [1124, "Longest Well-Performing Interval"]],
          },
          {
            icon: "05",
            name: vi ? "Histogram và rectangle" : "Histogram and rectangles",
            problems: [[84, "Largest Rectangle in Histogram"], [85, "Maximal Rectangle"], [42, "Trapping Rain Water"], [1504, "Count Submatrices With All Ones"]],
          },
          {
            icon: "06",
            name: vi ? "Contribution: mỗi phần tử làm min/max" : "Contribution: each element as min/max",
            problems: [[907, "Sum of Subarray Minimums"], [2104, "Sum of Subarray Ranges"], [1856, "Maximum Subarray Min-Product"], [2281, "Sum of Total Strength of Wizards"], [2334, "Subarray With Elements Greater Than Varying Threshold"]],
          },
          {
            icon: "07",
            name: vi ? "Tree, queue, car fleet" : "Tree, queue, car fleet",
            problems: [[654, "Maximum Binary Tree"], [1008, "Construct BST from Preorder"], [853, "Car Fleet"], [1776, "Car Fleet II"], [1944, "Visible People in a Queue"]],
          },
          {
            icon: "08",
            name: vi ? "Advanced / offline query / DP" : "Advanced / offline query / DP",
            problems: [[975, "Odd Even Jump"], [1526, "Minimum Number of Increments"], [1793, "Maximum Score of a Good Subarray"], [2454, "Next Greater Element IV"], [2617, "Minimum Visited Cells in a Grid"], [2736, "Maximum Sum Queries"], [2818, "Apply Operations to Maximize Score"], [2940, "Find Building Where Alice and Bob Can Meet"], [2945, "Maximum Non-decreasing Array Length"]],
          },
          {
            icon: "P",
            name: vi ? "Premium nên biết" : "Premium to know",
            problems: [[255, "Verify Preorder Sequence in BST"], [1762, "Buildings With an Ocean View"], [1950, "Maximum of Minimum Values"], [2282, "Visible People in a Grid"], [2297, "Jump Game VIII"], [2345, "Visible Mountains"], [2832, "Maximal Range Each Element Is Maximum"], [2863, "Semi-Decreasing Subarrays"], [1063, "Number of Valid Subarrays"], [2355, "Maximum Number of Books"]],
          },
        ];
        const sequence = [496, 503, 739, 1475, 901, 316, 402, 84, 907, 2104, 962, 456, 654, 853, 1856, 1944, 2454, 2281, 2736, 2940];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name]) => supportedIds.has(id)
          ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-monotonic-problem-id="${id}"><span>#${id}</span><b>${name}</b></a></li>`
          : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}<em>${unavailableText}</em></b></span></li>`;
        const roadmapItem = (id) => supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-monotonic-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`;
        const groupCards = groups.map((item) => `<details class="sliding-pattern-card monotonic-pattern-card" open><summary><span>${item.icon}</span><strong>${item.name}</strong><small>${item.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${item.problems.map(problemRow).join("")}</ul></details>`).join("");

        $("trieLearnEyebrow").textContent = "MONOTONIC STACK LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "9 nhóm Monotonic Stack nên học" : "9 Monotonic Stack groups to learn";
        $("trieLearnIntro").textContent = vi
          ? "Học theo câu hỏi stack trả lời: phần tử lớn hơn/nhỏ hơn kế tiếp, span, contribution, histogram, rồi offline query và DP."
          : "Learn by the question the stack answers: next greater/smaller, span, contribution, histogram, then offline queries and DP.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình Monotonic Stack" : "Close Monotonic Stack learning guide");
        content.innerHTML = `
          <section class="trie-learn-section monotonic-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "Nhóm bài theo pattern" : "Problems grouped by pattern"}</h3><p>${vi ? "Bắt đầu với next greater; các bài hard dùng cùng ý tưởng nhưng thêm contribution, sort hoặc DP." : "Start with next greater; hard problems reuse the same idea with contribution, sorting, or DP."}</p></div></div>
            <div class="sliding-pattern-grid monotonic-pattern-grid">${groupCards}</div>
          </section>
          <section class="trie-roadmap monotonic-roadmap">
            <div class="trie-learn-section-title"><span>02</span><div><h3>${vi ? "Thứ tự học đề xuất" : "Recommended learning order"}</h3><p>${vi ? "Đi từ stack giảm cơ bản tới contribution và query hard." : "Move from basic decreasing stacks to contribution and hard query patterns."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-monotonic-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.monotonicProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) {
              panel.scrollIntoView({ behavior: "auto", block: "start" });
            }
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "segment-tree") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion segment-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">🌳</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "7 nhóm Segment Tree · lộ trình từ nền tảng đến DP" : "7 Segment Tree groups · foundation-to-DP roadmap"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const groups = [
          { icon: "🟢", name: vi ? "Nền tảng" : "Foundation", problems: [[303, "Range Sum Query - Immutable", 0], [307, "Range Sum Query - Mutable", 5]] },
          { icon: "🟡", name: vi ? "Cốt lõi" : "Core", problems: [[315, "Count of Smaller Numbers After Self", 5], [673, "Number of Longest Increasing Subsequence", 4], [1649, "Create Sorted Array Through Instructions", 4]] },
          { icon: "🟡", name: vi ? "Nén tọa độ" : "Coordinate Compression", problems: [[729, "My Calendar I", 0], [731, "My Calendar II", 0], [715, "Range Module", 5]] },
          { icon: "🔴", name: "Lazy Propagation", problems: [[732, "My Calendar III", 5], [2569, "Handling Sum Queries After Update", 5]] },
          { icon: "🔴", name: vi ? "Đếm" : "Counting", problems: [[327, "Count of Range Sum", 0], [493, "Reverse Pairs", 0]] },
          { icon: "🔴", name: "Sweep Line", problems: [[699, "Falling Squares", 0], [850, "Rectangle Area II", 0]] },
          { icon: "🔴", name: "DP", problems: [[2407, "Longest Increasing Subsequence II", 5]] },
        ];
        const sequence = [303, 307, 315, 673, 729, 731, 715, 732, 699, 850, 1649, 2407, 2569, 2926];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name, stars]) => {
          const rating = stars ? `<small class="segment-stars" aria-label="${stars} stars">${"★".repeat(stars)}</small>` : "";
          return supportedIds.has(id)
            ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-segment-problem-id="${id}"><span>#${id}</span><b>${name}${rating}</b></a></li>`
            : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}${rating}<em>${unavailableText}</em></b></span></li>`;
        };
        const roadmapItem = (id) => supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-segment-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`;
        const groupCards = groups.map((item, index) => `<details class="sliding-pattern-card segment-pattern-card" open><summary><span>${item.icon}</span><strong>${item.name}</strong><small>${item.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${item.problems.map(problemRow).join("")}</ul></details>`).join("");

        $("trieLearnEyebrow").textContent = "SEGMENT TREE LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "7 nhóm Segment Tree cần nhớ" : "7 Segment Tree groups to remember";
        $("trieLearnIntro").textContent = vi
          ? "Đi từ range query cơ bản đến nén tọa độ, lazy propagation, counting, sweep line và DP."
          : "Progress from basic range queries to compression, lazy propagation, counting, sweep line, and DP.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình Segment Tree" : "Close Segment Tree learning guide");
        content.innerHTML = `
          <section class="trie-learn-section segment-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "7 nhóm bài cốt lõi" : "7 core problem groups"}</h3><p>${vi ? "Số sao thể hiện mức độ ưu tiên; bài chưa có visualization được đánh dấu riêng." : "Stars indicate priority; unavailable visualizations are marked separately."}</p></div></div>
            <div class="sliding-pattern-grid segment-pattern-grid">${groupCards}</div>
          </section>
          <section class="trie-roadmap segment-roadmap">
            <div class="trie-learn-section-title"><span>02</span><div><h3>${vi ? "Thứ tự nên học" : "Recommended learning order"}</h3><p>${vi ? "Học range sum trước, sau đó counting, calendar/lazy, sweep line và DP nâng cao." : "Start with range sums, then counting, calendar/lazy, sweep line, and advanced DP."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-segment-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.segmentProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) {
              panel.scrollIntoView({ behavior: "auto", block: "start" });
            }
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "mst") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion mst-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">🌲</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "Cây khung nhỏ nhất (MST) · Prim → Kruskal → nâng cao" : "Minimum Spanning Tree (MST) · Prim → Kruskal → advanced"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const groups = [
          { icon: "🌱", name: vi ? "Nền tảng MST" : "MST foundation", problems: [
            [1584, vi ? "Min Cost to Connect All Points — Prim + min-heap" : "Min Cost to Connect All Points — Prim + min-heap"],
            [1135, vi ? "Connecting Cities — Kruskal + Union-Find" : "Connecting Cities — Kruskal + Union-Find"],
          ] },
          { icon: "🌿", name: vi ? "Biến đổi mô hình" : "Model transformation", problems: [
            [1168, vi ? "Optimize Water Distribution — node ảo 0 + Kruskal" : "Optimize Water Distribution — virtual node 0 + Kruskal"],
          ] },
          { icon: "🌳", name: vi ? "Nâng cao" : "Advanced", problems: [
            [1489, vi ? "Critical & Pseudo-Critical Edges — chạy Kruskal nhiều lần" : "Critical & Pseudo-Critical Edges — repeated Kruskal"],
          ] },
          { icon: "🧭", name: vi ? "Union-Find liên quan" : "Related Union-Find", problems: [
            [1579, vi ? "Remove Max Edges — hai DSU (Alice/Bob)" : "Remove Max Edges — two DSUs (Alice/Bob)"],
            [1627, vi ? "Graph Connectivity With Threshold — union bội số" : "Graph Connectivity With Threshold — union multiples"],
          ] },
        ];
        const sequence = [1584, 1135, 1168, 1489];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name]) => (supportedIds.has(id)
          ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-mst-problem-id="${id}"><span>#${id}</span><b>${name}</b></a></li>`
          : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}<em>${unavailableText}</em></b></span></li>`);
        const roadmapItem = (id) => (supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-mst-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`);
        const groupCards = groups.map((item) => `<details class="sliding-pattern-card" open><summary><span>${item.icon}</span><strong>${item.name}</strong><small>${item.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${item.problems.map(problemRow).join("")}</ul></details>`).join("");

        $("trieLearnEyebrow").textContent = "SPANNING TREE (MST) LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "Lộ trình Cây khung nhỏ nhất (MST)" : "Minimum Spanning Tree (MST) roadmap";
        $("trieLearnIntro").textContent = vi
          ? "Bắt đầu với hai thuật toán MST kinh điển (Prim, Kruskal), rồi học cách mô hình hóa bài toán về MST, cuối cùng là biến thể nâng cao."
          : "Start with the two classic MST algorithms (Prim, Kruskal), then learn to model problems as an MST, and finish with an advanced variant.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình MST" : "Close MST learning guide");
        content.innerHTML = `
          <section class="trie-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "Nhóm bài theo kỹ thuật" : "Problems grouped by technique"}</h3><p>${vi ? "Cùng ý tưởng MST nhưng khác cách dựng cạnh và chạy Union-Find." : "Same MST idea, different ways to build edges and run Union-Find."}</p></div></div>
            <div class="sliding-pattern-grid">${groupCards}</div>
          </section>
          <section class="trie-roadmap">
            <div class="trie-learn-section-title"><span>02</span><div><h3>${vi ? "Thứ tự nên học" : "Recommended learning order"}</h3><p>${vi ? "Prim (1584) → Kruskal (1135) → mô hình hóa (1168) → phân loại cạnh (1489)." : "Prim (1584) → Kruskal (1135) → modeling (1168) → edge classification (1489)."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-mst-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.mstProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) {
              panel.scrollIntoView({ behavior: "auto", block: "start" });
            }
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "union-find") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">🔗</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "Union-Find (DSU) · cơ bản → dynamic connectivity → MST" : "Union-Find (DSU) · fundamentals → dynamic connectivity → MST"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const groups = [
          { icon: "🌱", name: vi ? "Nền tảng connectivity" : "Connectivity foundations", problems: [
            [547, "Number of Provinces — count connected components"],
            [684, "Redundant Connection — detect a cycle"],
            [1319, "Number of Operations to Make Network Connected — reuse spare edges"],
          ] },
          { icon: "🧩", name: vi ? "Ràng buộc & gộp danh tính" : "Constraints & identity merging", problems: [
            [990, "Satisfiability of Equality Equations — equality constraints"],
            [721, "Accounts Merge — shared-email groups"],
          ] },
          { icon: "⏱️", name: vi ? "Kết nối theo quan hệ" : "Connectivity by relationship", problems: [
            [1101, "The Earliest Moment When Everyone Become Friends — chronological unions"],
            [947, "Most Stones Removed with Same Row or Column — row/column components"],
            [1061, "Lexicographically Smallest Equivalent String — canonical representatives"],
          ] },
          { icon: "🚀", name: vi ? "Dynamic & nâng cao" : "Dynamic & advanced", problems: [
            [305, "Number of Islands II — online grid unions"],
            [1579, "Remove Max Number of Edges to Keep Graph Fully Traversable — two DSUs"],
            [1584, "Min Cost to Connect All Points — Kruskal / MST"],
          ] },
        ];
        const sequence = [547, 684, 1319, 990, 721, 1101, 947, 1061, 305, 1579, 1584];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name]) => (supportedIds.has(id)
          ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-dsu-problem-id="${id}"><span>#${id}</span><b>${name}</b></a></li>`
          : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}<em>${unavailableText}</em></b></span></li>`);
        const roadmapItem = (id) => (supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-dsu-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`);
        const groupCards = groups.map((item) => `<details class="sliding-pattern-card" open><summary><span>${item.icon}</span><strong>${item.name}</strong><small>${item.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${item.problems.map(problemRow).join("")}</ul></details>`).join("");

        $("trieLearnEyebrow").textContent = "UNION-FIND (DSU) LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "Lộ trình Union-Find (DSU)" : "Union-Find (DSU) roadmap";
        $("trieLearnIntro").textContent = vi
          ? "Học cách nhận diện component, chu trình và cạnh dư trước; sau đó mở rộng sang ràng buộc, quan hệ động, nhiều DSU và MST."
          : "Learn components, cycles, and redundant edges first; then progress to constraints, dynamic relationships, multiple DSUs, and MST.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình Union-Find" : "Close Union-Find learning guide");
        content.innerHTML = `
          <section class="trie-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "Nhóm bài theo kỹ thuật" : "Problems grouped by technique"}</h3><p>${vi ? "Mỗi nhóm thêm một biến thể DSU mới vào thao tác find / union cơ bản." : "Each group adds a new DSU variation to the core find / union operations."}</p></div></div>
            <div class="sliding-pattern-grid">${groupCards}</div>
          </section>
          <section class="trie-roadmap">
            <div class="trie-learn-section-title"><span>02</span><div><h3>${vi ? "Thứ tự nên học" : "Recommended learning order"}</h3><p>${vi ? "Components → cycle → cạnh dư → ràng buộc → gộp → theo thời gian → grid động → hai DSU → MST." : "Components → cycle → spare edges → constraints → merging → time → dynamic grids → two DSUs → MST."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-dsu-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.dsuProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) {
              panel.scrollIntoView({ behavior: "auto", block: "start" });
            }
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "inclusion-exclusion") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">🧮</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "Bao hàm – loại trừ · bội số → LCM → Binary Search" : "Inclusion–Exclusion · multiples → LCM → Binary Search"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const groups = [
          { icon: "🌱", name: vi ? "Hợp tập & bội số" : "Unions & multiples", problems: [
            [2652, "Sum Multiples — điều kiện chia hết OR", null],
            [878, "Nth Magical Number — 2 tập + LCM + binary search", null],
            [1201, "Ugly Number III — 3 tập + LCM + binary search", vi ? "★ cực quan trọng" : "★ very important"],
          ] },
          { icon: "🪟", name: vi ? "Đếm bằng hiệu hai tập" : "Counting by set difference", problems: [
            [992, "Subarrays with K Different Integers — atMost(K) − atMost(K−1)", null],
            [2444, "Count Subarrays With Fixed Bounds — valid ranges", null],
          ] },
          { icon: "🚀", name: vi ? "Binary Search trên đáp án" : "Binary search on the answer", problems: [
            [2513, "Minimize the Maximum of Two Arrays — divisibility + LCM", null],
            [3116, "Kth Smallest Amount — bitmask + inclusion–exclusion + LCM", vi ? "★ boss cuối" : "★ final boss"],
          ] },
        ];
        const sequence = [2652, 878, 1201, 992, 2444, 2513, 3116];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name, badge]) => (supportedIds.has(id)
          ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-ie-problem-id="${id}"><span>#${id}</span><b>${name}${badge ? `<small class="segment-stars">${badge}</small>` : ""}</b></a></li>`
          : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}<em>${unavailableText}</em></b></span></li>`);
        const roadmapItem = (id) => (supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-ie-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`);
        const groupCards = groups.map((item) => `<details class="sliding-pattern-card" open><summary><span>${item.icon}</span><strong>${item.name}</strong><small>${item.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${item.problems.map(problemRow).join("")}</ul></details>`).join("");

        $("trieLearnEyebrow").textContent = "INCLUSION–EXCLUSION LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "Lộ trình Bao hàm – loại trừ" : "Inclusion–Exclusion roadmap";
        $("trieLearnIntro").textContent = vi
          ? "Từ điều kiện OR đơn giản, qua LCM và đếm hợp tập, đến binary search trên đáp án cùng bao hàm–loại trừ bitmask."
          : "Move from a simple OR condition through LCM union counting to binary search on the answer and bitmask inclusion–exclusion.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình Bao hàm – loại trừ" : "Close Inclusion–Exclusion learning guide");
        content.innerHTML = `
          <section class="trie-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "Nhóm bài theo kỹ thuật" : "Problems grouped by technique"}</h3><p>${vi ? "Học hợp tập trước, rồi dùng hiệu hai tập để đếm, sau đó kết hợp LCM với binary search." : "Learn union counting first, then count with set difference, and finally combine LCM with binary search."}</p></div></div>
            <div class="sliding-pattern-grid">${groupCards}</div>
          </section>
          <section class="trie-roadmap">
            <div class="trie-learn-section-title"><span>02</span><div><h3>${vi ? "Thứ tự nên học" : "Recommended learning order"}</h3><p>${vi ? "#1201 là checkpoint then chốt; #3116 là boss cuối tổng hợp bitmask, bao hàm–loại trừ, LCM và binary search." : "#1201 is the key checkpoint; #3116 is the final boss combining bitmasks, inclusion–exclusion, LCM, and binary search."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-ie-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.ieProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) panel.scrollIntoView({ behavior: "auto", block: "start" });
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "2d-array") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">▦</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "Mảng 2D · duyệt → biến đổi → grid DFS/BFS → DP" : "2D Array · traversal → transforms → grid DFS/BFS → DP"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const groups = [
          { icon: "🧭", name: vi ? "Duyệt & biến đổi ma trận" : "Matrix traversal & transforms", problems: [
            [54, "Spiral Matrix — 4 boundaries"],
            [48, "Rotate Image — transpose + reverse"],
            [73, "Set Matrix Zeroes — marker rows / columns"],
            [2319, "Check if Matrix Is X-Matrix — diagonal rules"],
          ] },
          { icon: "🔎", name: vi ? "Tìm kiếm trong ma trận" : "Matrix search", problems: [
            [74, "Search a 2D Matrix — binary search"],
            [240, "Search a 2D Matrix II — top-right staircase"],
          ] },
          { icon: "🌊", name: vi ? "Graph trên grid" : "Grid graph traversal", problems: [
            [733, "Flood Fill — DFS / BFS"],
            [200, "Number of Islands — connected components"],
            [695, "Max Area of Island — DFS area"],
            [994, "Rotting Oranges — multi-source BFS"],
            [542, "01 Matrix — multi-source BFS distance"],
            [79, "Word Search — grid backtracking"],
          ] },
          { icon: "📐", name: vi ? "Prefix sum & DP 2D" : "2D prefix sums & DP", problems: [
            [304, "Range Sum Query 2D — 2D prefix sum"],
            [62, "Unique Paths — grid DP"],
            [64, "Minimum Path Sum — grid DP"],
            [221, "Maximal Square — square DP"],
          ] },
        ];
        const sequence = [54, 48, 73, 2319, 74, 240, 733, 200, 695, 994, 542, 79, 304, 62, 64, 221];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name]) => (supportedIds.has(id)
          ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-array2d-problem-id="${id}"><span>#${id}</span><b>${name}</b></a></li>`
          : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}<em>${unavailableText}</em></b></span></li>`);
        const roadmapItem = (id) => (supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-array2d-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`);
        const groupCards = groups.map((item) => `<details class="sliding-pattern-card" open><summary><span>${item.icon}</span><strong>${item.name}</strong><small>${item.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${item.problems.map(problemRow).join("")}</ul></details>`).join("");

        $("trieLearnEyebrow").textContent = "2D ARRAY LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "Lộ trình Mảng 2D" : "2D Array roadmap";
        $("trieLearnIntro").textContent = vi
          ? "Bắt đầu bằng cách duyệt và biến đổi ma trận, sau đó tìm kiếm, DFS/BFS trên grid, và kết thúc với prefix sum cùng DP 2D."
          : "Start with matrix traversal and transforms, then search, grid DFS/BFS, and finish with 2D prefix sums and DP.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình Mảng 2D" : "Close 2D Array learning guide");
        content.innerHTML = `
          <section class="trie-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "Nhóm bài theo kỹ thuật" : "Problems grouped by technique"}</h3><p>${vi ? "Mỗi nhóm bổ sung một cách nhìn mới: tọa độ, đường đi, component, khoảng cách và trạng thái DP." : "Each group adds a new view: coordinates, paths, components, distances, and DP state."}</p></div></div>
            <div class="sliding-pattern-grid">${groupCards}</div>
          </section>
          <section class="trie-roadmap">
            <div class="trie-learn-section-title"><span>02</span><div><h3>${vi ? "Thứ tự nên học" : "Recommended learning order"}</h3><p>${vi ? "Từ duyệt ma trận cơ bản đến grid graph, rồi đi tới prefix sum và dynamic programming 2D." : "From basic matrix traversal through grid graphs, then into 2D prefix sums and dynamic programming."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-array2d-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.array2dProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) panel.scrollIntoView({ behavior: "auto", block: "start" });
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "flood-fill") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion flood-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">▦</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "Flood Fill · connected components → boundary → DFS + memo" : "Flood Fill · connected components → boundary → DFS + memo"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemNode = ([id, name, note], extraClass = "") => (supportedIds.has(id)
          ? `<a class="flood-tree-problem ${extraClass}" href="#leetcode-${id}" data-flood-problem-id="${id}" aria-label="Load LeetCode ${id}: ${name}"><span>#${id}</span><strong>${name}</strong>${note ? `<small>${note}</small>` : ""}</a>`
          : `<span class="flood-tree-problem unavailable ${extraClass}" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><strong>${name}</strong><small>${unavailableText}</small></span>`);
        const down = `<i class="flood-tree-down" aria-hidden="true">↓</i>`;

        $("trieLearnEyebrow").textContent = "FLOOD FILL LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "Từ #733 đến DFS + Memoization" : "From #733 to DFS + Memoization";
        $("trieLearnIntro").textContent = vi
          ? "Bắt đầu bằng cách lan trên grid, sau đó tách thành hai nhánh chính: xử lý component và BFS theo level. Từ component, học tiếp boundary flood, thông tin component, reverse traversal và DFS có memo."
          : "Start with grid traversal, then split into component processing and level-order BFS. From components, continue through boundary flood, component metadata, reverse traversal, and memoized DFS.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình Flood Fill" : "Close Flood Fill learning guide");
        content.innerHTML = `
          <section class="trie-learn-section flood-tree-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "Cây lộ trình Flood Fill" : "Flood Fill learning tree"}</h3><p>${vi ? "Học nền tảng trước, rồi chọn nhánh theo dạng output của bài." : "Learn the foundation first, then choose a branch based on the required output."}</p></div></div>
            <div class="flood-learning-tree">
              <div class="flood-tree-root">${problemNode([733, "Flood Fill", vi ? "Điểm bắt đầu" : "Starting point"], "root")}</div>
              ${down}
              <div class="flood-tree-foundation"><strong>${vi ? "Grid DFS / BFS cơ bản" : "Basic Grid DFS / BFS"}</strong><small>${vi ? "4 hướng · visited · đổi màu hoặc đánh dấu" : "4 directions · visited · recolor or mark"}</small></div>
              <div class="flood-tree-split" aria-hidden="true"><span></span></div>
              <div class="flood-tree-branches">
                <section class="flood-tree-branch components">
                  <header><strong>Connected Components</strong><small>${vi ? "Đếm, đo và phân loại vùng" : "Count, measure, and classify regions"}</small></header>
                  <div class="flood-tree-chain">
                    ${problemNode([200, "Number of Islands", vi ? "Đếm component" : "Count components"])}
                    ${down}
                    ${problemNode([695, "Max Area of Island", vi ? "Tích lũy diện tích" : "Accumulate area"])}
                  </div>
                  <div class="flood-tree-forks">
                    <section>
                      <header><strong>Boundary Flood</strong><small>${vi ? "Lan từ biên để loại vùng mở" : "Flood from the boundary"}</small></header>
                      <div class="flood-tree-node-grid">
                        ${problemNode([130, "Surrounded Regions", vi ? "Giữ vùng nối biên" : "Preserve boundary regions"])}
                        ${problemNode([1020, "Number of Enclaves", vi ? "Xóa đất nối biên" : "Remove boundary land"])}
                      </div>
                      ${down}
                      <header class="flood-tree-subhead"><strong>Reverse Traversal</strong></header>
                      ${problemNode([417, "Pacific Atlantic Water Flow", vi ? "Đi ngược từ hai biên" : "Traverse backward from both borders"])}
                      ${down}
                      <header class="flood-tree-subhead"><strong>DFS + Memoization</strong></header>
                      ${problemNode([329, "Longest Increasing Path", vi ? "Cache kết quả mỗi ô" : "Cache each cell result"])}
                    </section>
                    <section>
                      <header><strong>Component Info</strong><small>${vi ? "Chu vi, id, kích thước, trạng thái đóng" : "Perimeter, id, size, closed state"}</small></header>
                      <div class="flood-tree-chain compact">
                        ${problemNode([463, "Island Perimeter", vi ? "Đếm cạnh biên" : "Count boundary edges"])}
                        ${problemNode([827, "Making A Large Island", vi ? "Gắn id + size" : "Assign id + size"])}
                        ${problemNode([1254, "Number of Closed Islands", vi ? "Component có chạm biên?" : "Does the component touch a border?"])}
                      </div>
                    </section>
                  </div>
                </section>
                <section class="flood-tree-branch bfs-levels">
                  <header><strong>BFS Levels</strong><small>${vi ? "Khoảng cách hoặc thời gian lan" : "Distance or propagation time"}</small></header>
                  <div class="flood-tree-chain">
                    ${problemNode([994, "Rotting Oranges", vi ? "Multi-source BFS theo phút" : "Multi-source BFS by minute"])}
                    ${down}
                    ${problemNode([542, "01 Matrix", vi ? "Khoảng cách tới số 0 gần nhất" : "Distance to the nearest zero"])}
                  </div>
                </section>
              </div>
            </div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-flood-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.floodProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) panel.scrollIntoView({ behavior: "auto", block: "start" });
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "bfs") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion bfs-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">≋</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "9 nhóm BFS · level order → state space → 0-1 BFS" : "9 BFS groups · level order → state space → 0-1 BFS"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const groups = [
          { icon: "①", name: vi ? "1 · BFS nền tảng / Level order" : "1 · BFS fundamentals / Level order", problems: [
            [102, "Binary Tree Level Order Traversal"], [107, "Binary Tree Level Order Traversal II"], [199, "Binary Tree Right Side View"], [515, "Find Largest Value in Each Tree Row"], [637, "Average of Levels in Binary Tree"],
          ] },
          { icon: "↝", name: vi ? "2 · Đường đi ngắn nhất không trọng số" : "2 · Unweighted shortest path", problems: [
            [127, "Word Ladder"], [752, "Open the Lock"], [1091, "Shortest Path in Binary Matrix"], [9006, "Graph BFS Shortest Path"], [9007, "BFS Shortest Path in Obstacle Grid"],
          ] },
          { icon: "▦", name: vi ? "3 · BFS trên Grid" : "3 · Grid BFS", problems: [
            [994, "Rotting Oranges"], [286, "Walls and Gates"], [542, "01 Matrix"], [934, "Shortest Bridge"], [1926, "Nearest Exit from Entrance in Maze"], [1293, "Shortest Path in a Grid with Obstacles Elimination"],
          ] },
          { icon: "◎", name: vi ? "4 · Multi-source BFS" : "4 · Multi-source BFS", problems: [
            [994, "Rotting Oranges"], [542, "01 Matrix"], [1162, "As Far from Land as Possible"], [1765, "Map of Highest Peak"], [286, "Walls and Gates"], [934, "Shortest Bridge"],
          ] },
          { icon: "◇", name: vi ? "5 · BFS trên không gian trạng thái" : "5 · State-space BFS", problems: [
            [752, "Open the Lock"], [2059, "Minimum Operations to Convert Number"], [3568, "Minimum Moves to Clean the Classroom"], [818, "Race Car"], [847, "Shortest Path Visiting All Nodes"], [864, "Shortest Path to Get All Keys"],
          ] },
          { icon: "⇄", name: vi ? "6 · Bidirectional BFS" : "6 · Bidirectional BFS", problems: [
            [127, "Word Ladder"], [126, "Word Ladder II"], [752, "Open the Lock"],
          ] },
          { icon: "⇣", name: vi ? "7 · Topological / Reverse BFS" : "7 · Topological / Reverse BFS", problems: [
            [207, "Course Schedule"], [210, "Course Schedule II"], [802, "Find Eventual Safe States"], [913, "Cat and Mouse"], [1136, "Parallel Courses"],
          ] },
          { icon: "01", name: vi ? "8 · 0-1 BFS với deque" : "8 · 0-1 BFS with a deque", problems: [
            [1368, "Minimum Cost to Make at Least One Valid Path in a Grid"], [2290, "Minimum Obstacle Removal to Reach Corner"],
          ] },
          { icon: "♧", name: vi ? "9 · BFS theo tầng trên cây / đồ thị" : "9 · Layered BFS on trees / graphs", problems: [
            [1311, "Get Watched Videos by Your Friends"], [1376, "Time Needed to Inform All Employees"], [742, "Closest Leaf in a Binary Tree"], [314, "Binary Tree Vertical Order Traversal"], [662, "Maximum Width of Binary Tree"],
          ] },
        ];
        const levels = [
          {
            tone: "green",
            icon: "🟢",
            title: vi ? "Level 1 — Nắm queue và layer" : "Level 1 — Master queues and layers",
            problems: [[102, "Level Order Traversal"], [994, "Rotting Oranges"], [542, "01 Matrix"], [785, "Is Graph Bipartite?"], [9006, "Graph BFS Shortest Path"]],
          },
          {
            tone: "yellow",
            icon: "🟡",
            title: vi ? "Level 2 — Shortest path và state" : "Level 2 — Shortest paths and state",
            problems: [[127, "Word Ladder"], [752, "Open the Lock"], [1091, "Shortest Path in Binary Matrix"], [1293, "Obstacle Elimination"], [2059, "Convert Number"]],
          },
          {
            tone: "red",
            icon: "🔴",
            title: vi ? "Level 3 — Biến thể nâng cao" : "Level 3 — Advanced variants",
            problems: [[126, "Word Ladder II"], [847, "Visit All Nodes"], [864, "Get All Keys"], [1368, "0-1 BFS"], [913, "Retrograde BFS"]],
          },
        ];
        const sequence = [102, 994, 542, 785, 9006, 127, 752, 1091, 1293, 2059, 847, 1368, 126];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name]) => (supportedIds.has(id)
          ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-bfs-problem-id="${id}"><span>#${id}</span><b>${name}</b></a></li>`
          : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}<em>${unavailableText}</em></b></span></li>`);
        const roadmapItem = (id) => (supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-bfs-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`);
        const groupCards = groups.map((item) => `<details class="sliding-pattern-card bfs-pattern-card" open><summary><span>${item.icon}</span><strong>${item.name}</strong><small>${item.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${item.problems.map(problemRow).join("")}</ul></details>`).join("");
        const levelCards = levels.map((level) => `<article class="trie-level-card ${level.tone}"><h4><span>${level.icon}</span>${level.title}</h4><ul>${level.problems.map(problemRow).join("")}</ul></article>`).join("");

        $("trieLearnEyebrow").textContent = "BFS LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "9 nhóm BFS cần nhận diện" : "9 BFS patterns to recognize";
        $("trieLearnIntro").textContent = vi
          ? "Bắt đầu từ queue và duyệt theo layer, sau đó mở rộng sang shortest path, multi-source, state-space, bidirectional và 0-1 BFS."
          : "Start with queues and layer traversal, then progress through shortest paths, multi-source, state-space, bidirectional, and 0-1 BFS.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình BFS" : "Close BFS learning guide");
        content.innerHTML = `
          <section class="trie-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "9 nhóm bài theo tín hiệu đề" : "9 groups by problem signal"}</h3><p>${vi ? "Nhìn nguồn khởi tạo, loại cạnh và state để chọn đúng biến thể BFS." : "Use the sources, edge costs, and state shape to choose the right BFS variant."}</p></div></div>
            <div class="sliding-pattern-grid">${groupCards}</div>
          </section>
          <section class="trie-learn-section">
            <div class="trie-interview-note">⭐ <strong>${vi ? "Quy tắc chọn nhanh:" : "Quick selection rule:"}</strong> ${vi ? "cạnh cùng trọng số → BFS; trọng số chỉ 0/1 → 0-1 BFS; nhiều nguồn → enqueue tất cả trước vòng lặp." : "equal edge weights → BFS; only 0/1 weights → 0-1 BFS; multiple sources → enqueue all sources before the loop."}</div>
            <div class="trie-level-grid">${levelCards}</div>
          </section>
          <section class="trie-roadmap bfs-roadmap">
            <div class="trie-learn-section-title"><span>03</span><div><h3>${vi ? "Thứ tự nên học" : "Recommended learning order"}</h3><p>${vi ? "Queue → layer → shortest path → mở rộng state → biến thể nâng cao." : "Queue → layers → shortest paths → expanded state → advanced variants."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-bfs-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.bfsProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) {
              panel.scrollIntoView({ behavior: "auto", block: "start" });
            }
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    if (group.key === "backtracking") {
      const learnButton = document.createElement("button");
      learnButton.type = "button";
      learnButton.className = "trie-learn-suggestion backtracking-learn-suggestion";
      learnButton.setAttribute("aria-haspopup", "dialog");
      learnButton.setAttribute("aria-controls", "trieLearnDialog");
      learnButton.innerHTML = `<span class="trie-learn-suggestion-icon">🧭</span><span><strong>Learn Suggestion</strong><small>${lang === "vi" ? "11 nhóm Backtracking · subsets → CSP → hard" : "11 Backtracking groups · subsets → CSP → hard"}</small></span><b aria-hidden="true">→</b>`;

      learnButton.addEventListener("click", () => {
        const dialog = $("trieLearnDialog");
        const content = $("trieLearnContent");
        const closeButton = $("trieLearnClose");
        if (!dialog || !content || !closeButton) return;
        const vi = lang === "vi";
        const groups = [
          { icon: "🧩", name: vi ? "1 · Subsets / Subsequences" : "1 · Subsets / Subsequences", problems: [
            [78, "Subsets"], [90, "Subsets II"], [491, "Non-decreasing Subsequences"], [1079, "Letter Tile Possibilities"],
          ] },
          { icon: "🎯", name: vi ? "2 · Combinations" : "2 · Combinations", problems: [
            [77, "Combinations"], [39, "Combination Sum"], [40, "Combination Sum II"], [216, "Combination Sum III"], [377, "Combination Sum IV"],
          ] },
          { icon: "🔀", name: vi ? "3 · Permutations" : "3 · Permutations", problems: [
            [46, "Permutations"], [47, "Permutations II"], [60, "Permutation Sequence"],
          ] },
          { icon: "✂️", name: vi ? "4 · String Partitioning" : "4 · String Partitioning", problems: [
            [131, "Palindrome Partitioning"], [93, "Restore IP Addresses"], [140, "Word Break II"], [1593, "Split String Into Max Unique Substrings"],
          ] },
          { icon: "🔧", name: vi ? "5 · Parentheses" : "5 · Parentheses", problems: [
            [22, "Generate Parentheses"], [301, "Remove Invalid Parentheses"],
          ] },
          { icon: "🗺️", name: vi ? "6 · Word / Grid Search" : "6 · Word / Grid Search", problems: [
            [79, "Word Search"], [212, "Word Search II"], [980, "Unique Paths III"], [1219, "Path with Maximum Gold"],
          ] },
          { icon: "♛", name: vi ? "7 · Constraint Satisfaction" : "7 · Constraint Satisfaction", problems: [
            [37, "Sudoku Solver"], [51, "N-Queens"], [52, "N-Queens II"], [36, "Valid Sudoku"], [488, "Zuma Game"],
          ] },
          { icon: "📱", name: vi ? "8 · Phone / Letter Combinations" : "8 · Phone / Letter Combinations", problems: [
            [17, "Letter Combinations of a Phone Number"], [784, "Letter Case Permutation"],
          ] },
          { icon: "⚖️", name: vi ? "9 · Partition / Array" : "9 · Partition / Array", problems: [
            [698, "Partition to K Equal Sum Subsets"], [473, "Matchsticks to Square"], [1723, "Find Minimum Time to Finish All Jobs"], [2305, "Fair Distribution of Cookies"],
          ] },
          { icon: "🕸️", name: vi ? "10 · Graph / Path Backtracking" : "10 · Graph / Path Backtracking", problems: [
            [797, "All Paths From Source to Target"], [980, "Unique Paths III"], [332, "Reconstruct Itinerary"], [1255, "Maximum Score Words Formed by Letters"],
          ] },
          { icon: "🔥", name: vi ? "11 · Hard / Advanced" : "11 · Hard / Advanced", problems: [
            [37, "Sudoku Solver"], [51, "N-Queens"], [212, "Word Search II"], [301, "Remove Invalid Parentheses"], [489, "Robot Room Cleaner"],
            [679, "24 Game"], [854, "K-Similar Strings"], [1079, "Letter Tile Possibilities"], [1219, "Path with Maximum Gold"],
            [1255, "Maximum Score Words Formed by Letters"], [1593, "Split String Into Max Unique Substrings"], [1723, "Find Minimum Time to Finish All Jobs"], [2305, "Fair Distribution of Cookies"],
          ] },
        ];
        const sequence = [78, 90, 77, 39, 40, 46, 17, 784, 131, 301, 79, 212, 51, 980];
        const supportedIds = new Set((catalogData || []).flatMap((entry) => entry.problems || []).map((problem) => Number(problem.id)));
        const unavailableText = vi ? "Chưa có trong visualizer" : "Not in visualizer yet";
        const problemRow = ([id, name]) => (supportedIds.has(id)
          ? `<li><a class="trie-problem-row" href="#leetcode-${id}" data-backtracking-problem-id="${id}"><span>#${id}</span><b>${name}</b></a></li>`
          : `<li><span class="trie-problem-row unavailable" aria-disabled="true" title="${unavailableText}"><span>#${id}</span><b>${name}<em>${unavailableText}</em></b></span></li>`);
        const roadmapItem = (id) => (supportedIds.has(id)
          ? `<a class="trie-problem-link" href="#leetcode-${id}" data-backtracking-problem-id="${id}" aria-label="Load LeetCode ${id}">#${id}</a>`
          : `<span class="trie-problem-link unavailable" aria-disabled="true" title="${unavailableText}">#${id}</span>`);
        const groupCards = groups.map((item) => `<details class="sliding-pattern-card" open><summary><span>${item.icon}</span><strong>${item.name}</strong><small>${item.problems.length} ${vi ? "bài" : "problems"}</small></summary><ul>${item.problems.map(problemRow).join("")}</ul></details>`).join("");

        $("trieLearnEyebrow").textContent = "BACKTRACKING LEARNING MAP";
        $("trieLearnTitle").textContent = vi ? "11 nhóm Backtracking cần nhớ" : "11 Backtracking groups to master";
        $("trieLearnIntro").textContent = vi
          ? "Đi từ subsets/combinations/permutations, qua chia chuỗi, ngoặc, tìm kiếm trên lưới, đến CSP (Sudoku, N-Queens) và các bài phân hoạch / đồ thị khó."
          : "Progress from subsets/combinations/permutations, through string partitioning, parentheses, and grid search, to CSP (Sudoku, N-Queens) and hard partition / graph problems.";
        closeButton.setAttribute("aria-label", vi ? "Đóng lộ trình Backtracking" : "Close Backtracking learning guide");
        content.innerHTML = `
          <section class="trie-learn-section">
            <div class="trie-learn-section-title"><span>01</span><div><h3>${vi ? "11 nhóm bài theo dạng" : "11 problem groups by pattern"}</h3><p>${vi ? "Cùng khung backtracking (choose → explore → un-choose), khác cách cắt tỉa và điều kiện." : "Same backtracking skeleton (choose → explore → un-choose), different pruning and constraints."}</p></div></div>
            <div class="sliding-pattern-grid">${groupCards}</div>
          </section>
          <section class="trie-roadmap">
            <div class="trie-learn-section-title"><span>02</span><div><h3>${vi ? "Thứ tự nên học" : "Recommended learning order"}</h3><p>${vi ? "Nắm subsets/combinations/permutations trước, rồi ngoặc & chia chuỗi, tìm kiếm lưới, và cuối cùng là CSP." : "Master subsets/combinations/permutations first, then parentheses & partitioning, grid search, and finally CSP."}</p></div></div>
            <div class="trie-roadmap-sequence">${sequence.map((id, index) => `${roadmapItem(id)}${index < sequence.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
          </section>`;

        let restoreFocus = learnButton;
        const closeDialog = () => {
          if (dialog.open && typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        };
        content.querySelectorAll("[data-backtracking-problem-id]").forEach((link) => {
          link.addEventListener("click", async (event) => {
            event.preventDefault();
            const problemId = link.dataset.backtrackingProblemId;
            restoreFocus = null;
            closeDialog();
            $("problemId").value = problemId;
            await loadProblem();
            const panel = $("problemPanel");
            if (panel && !panel.classList.contains("hidden")) {
              panel.scrollIntoView({ behavior: "auto", block: "start" });
            }
          });
        });
        closeButton.onclick = closeDialog;
        dialog.onclick = (event) => {
          if (event.target === dialog) closeDialog();
        };
        dialog.onclose = () => {
          if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
          restoreFocus = null;
        };
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
      itemsEl.appendChild(learnButton);
    }

    // The Company group is split into one sub-tab per company. Clicking a tab
    // filters the chips below it; the selection is remembered per group.
    const subTabs = Array.isArray(group.subTabs) ? group.subTabs.filter((tab) => tab && tab.key) : [];
    let activeSubTab = null;
    if (subTabs.length) {
      activeSubTab = companySubTabSelection.get(group.key) || subTabs[0].key;
      if (!subTabs.some((tab) => tab.key === activeSubTab)) activeSubTab = subTabs[0].key;

      const tabBar = document.createElement("div");
      tabBar.className = "cat-subtabs";
      tabBar.setAttribute("role", "tablist");
      subTabs.forEach((tab) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cat-subtab" + (tab.key === activeSubTab ? " active" : "");
        btn.dataset.subtab = tab.key;
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", tab.key === activeSubTab ? "true" : "false");
        const done = Number(tab.count) || 0;
        const total = Number(tab.total) || done;
        btn.innerHTML = `<span>${escapeHtml(pick(tab))}</span><small>${done}/${total}</small>`;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          companySubTabSelection.set(group.key, tab.key);
          renderCatalog();
          // Keep the group open after re-render so the click feels local.
          const reopened = document.querySelector(`.cat-group[data-group-key="${group.key}"]`);
          if (reopened) {
            const items = reopened.querySelector(".cat-items");
            const toggle = reopened.querySelector(".cat-toggle");
            if (items) items.classList.remove("collapsed");
            if (toggle) toggle.textContent = "−";
          }
        });
        tabBar.appendChild(btn);
      });
      itemsEl.appendChild(tabBar);
    }

    const hasOrder = !!group.recommendedOrderLabel;
    let visibleProblems = group.problems;

    if (activeSubTab) {
      // Show the company's entire roster. Problems that exist use their real
      // catalog record; the rest render as disabled placeholders so the full
      // list stays visible as visualizations get added.
      const tab = subTabs.find((x) => x.key === activeSubTab) || {};
      const byId = new Map(group.problems.map((p) => [Number(p.id), p]));
      const roster = Array.isArray(tab.roster) ? tab.roster : [];
      visibleProblems = roster.length
        ? roster.map((entry) => byId.get(Number(entry.id)) || {
            id: entry.id,
            title: { vi: entry.title, en: entry.title },
            difficulty: entry.difficulty || null,
            premium: Boolean(entry.premium),
            tags: [],
            unavailable: true,
          })
        : group.problems.filter((p) => (p.companies || []).includes(activeSubTab));

      const doneCount = visibleProblems.filter((p) => !p.unavailable).length;
      const summary = document.createElement("div");
      summary.className = "cat-subtab-summary";
      summary.innerHTML = lang === "vi"
        ? `<b>${doneCount}</b> / ${visibleProblems.length} bài đã có visualization · các bài mờ là chưa làm`
        : `<b>${doneCount}</b> / ${visibleProblems.length} problems have a visualization · dimmed ones are not built yet`;
      itemsEl.appendChild(summary);
    }

    visibleProblems.forEach((p, idx) => {
      const chip = document.createElement("button");
      chip.className = "prob-chip"
        + (p.id === currentProblemId ? " active" : "")
        + (p.unavailable ? " unavailable" : "");
      chip.dataset.id = p.id;
      if (p.unavailable) {
        chip.disabled = true;
        chip.setAttribute("aria-disabled", "true");
        chip.title = lang === "vi" ? "Chưa có trong visualizer" : "Not in visualizer yet";
      } else if (p.premium) {
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
      const tagsHover = createProblemTagsHover(p.tags);
      if (tagsHover) metaRow.appendChild(tagsHover);

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
      if (!p.unavailable) {
        chip.addEventListener("click", () => {
          $("problemId").value = p.id;
          loadProblem({ scrollToEnd: true });
        });
      }
      itemsEl.appendChild(chip);
    });

    mountGroup();
  });
  renderCatalogJumpNav();
  updateCatalogTagMarkerPositions();
}

function setCatalogGroupExpanded(groupEl, expanded) {
  const items = groupEl.querySelector(".cat-items");
  const toggle = groupEl.querySelector(".cat-toggle");
  if (items) items.classList.toggle("collapsed", !expanded);
  if (toggle) {
    toggle.textContent = expanded ? "−" : "+";
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    const group = (catalogData || []).find((item) => item.key === groupEl.dataset.groupKey);
    if (group) toggle.setAttribute("aria-label", expanded ? t().closeCategory(pick(group)) : t().openCategory(pick(group)));
  }
}

function openCatalogGroupExclusively(groupKey, { scroll = false } = {}) {
  activeCatalogGroupKey = groupKey || null;
  renderCatalog();

  if (!groupKey || !scroll) return;
  requestAnimationFrame(() => {
    const selectedGroup = [...document.querySelectorAll("#catalog .cat-group")]
      .find((groupEl) => groupEl.dataset.groupKey === groupKey);
    selectedGroup?.scrollIntoView({ behavior: "auto", block: "start" });
  });
}

function categoryTagMatches(query) {
  const normalizedQuery = normalizeProblemSearch(query);
  if (!catalogData) return [];
  if (!normalizedQuery) return catalogData;
  return catalogData.filter((group) => normalizeProblemSearch([
    group.key,
    group.vi,
    group.en,
  ].filter(Boolean).join(" ")).includes(normalizedQuery));
}

function renderCategoryTagOptions(query = "") {
  const list = $("categoryTagList");
  const input = $("categoryTagInput");
  if (!list || !input) return;

  const matches = categoryTagMatches(query);
  list.innerHTML = "";
  categoryTagActiveIndex = matches.length && categoryTagActiveIndex >= 0
    ? Math.min(categoryTagActiveIndex, matches.length - 1)
    : -1;

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "category-tag-empty";
    empty.textContent = t().noCategoryTags;
    list.appendChild(empty);
    input.removeAttribute("aria-activedescendant");
    return;
  }

  matches.forEach((group, index) => {
    const option = document.createElement("button");
    option.type = "button";
    option.id = `category-tag-option-${index}`;
    option.className = "category-tag-option";
    option.dataset.groupKey = group.key;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", group.key === activeCatalogGroupKey ? "true" : "false");
    option.classList.toggle("keyboard-active", index === categoryTagActiveIndex);

    const label = document.createElement("span");
    label.textContent = pick(group);
    const count = document.createElement("small");
    count.textContent = group.problems.length;
    option.append(label, count);
    option.addEventListener("mousedown", (event) => event.preventDefault());
    option.addEventListener("click", () => selectCategoryTag(group.key));
    list.appendChild(option);
  });

  const activeOption = list.querySelector(".category-tag-option.keyboard-active");
  if (activeOption) input.setAttribute("aria-activedescendant", activeOption.id);
}

function openCategoryTagDropdown({ showAll = false } = {}) {
  const list = $("categoryTagList");
  const input = $("categoryTagInput");
  const toggle = $("categoryTagToggle");
  if (!list || !input || !toggle) return;
  categoryTagActiveIndex = -1;
  renderCategoryTagOptions(showAll ? "" : input.value);
  list.classList.remove("hidden");
  input.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-expanded", "true");
}

function closeCategoryTagDropdown() {
  const list = $("categoryTagList");
  const input = $("categoryTagInput");
  const toggle = $("categoryTagToggle");
  list?.classList.add("hidden");
  input?.setAttribute("aria-expanded", "false");
  input?.removeAttribute("aria-activedescendant");
  toggle?.setAttribute("aria-expanded", "false");
  categoryTagActiveIndex = -1;
}

function selectCategoryTag(groupKey) {
  const group = (catalogData || []).find((item) => item.key === groupKey);
  if (!group) return;

  problemSearchQuery = "";
  $("problemKeyword").value = "";
  renderProblemSearchResults();
  $("categoryTagInput").value = pick(group);
  closeCategoryTagDropdown();
  openCatalogGroupExclusively(group.key, { scroll: true });
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
    const tagsHover = createProblemTagsHover(problem.tags);
    if (tagsHover) chip.appendChild(tagsHover);

    if (problem.difficulty) {
      const difficulty = document.createElement("span");
      difficulty.className = `diff diff-${problem.difficulty}`;
      difficulty.textContent = problem.difficulty;
      chip.appendChild(difficulty);
    }
    chip.addEventListener("click", () => {
      $("problemId").value = problem.id;
      loadProblem({ scrollToEnd: true });
    });
    items.appendChild(chip);
  });
}

$("problemKeyword").addEventListener("input", (event) => {
  problemSearchQuery = event.target.value;
  renderProblemSearchResults();
});

$("categoryTagInput").addEventListener("focus", (event) => {
  event.target.select();
  openCategoryTagDropdown({ showAll: true });
});

$("categoryTagInput").addEventListener("click", () => {
  openCategoryTagDropdown({ showAll: true });
});

$("categoryTagInput").addEventListener("input", (event) => {
  categoryTagActiveIndex = -1;
  openCategoryTagDropdown();
  renderCategoryTagOptions(event.target.value);
});

$("categoryTagInput").addEventListener("keydown", (event) => {
  const list = $("categoryTagList");
  const options = [...list.querySelectorAll(".category-tag-option")];
  if (event.key === "Escape") {
    closeCategoryTagDropdown();
    return;
  }
  if (event.key === "Tab") {
    closeCategoryTagDropdown();
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;

  event.preventDefault();
  if (list.classList.contains("hidden")) {
    openCategoryTagDropdown();
    return;
  }
  if (!options.length) return;
  if (event.key === "Enter") {
    const option = options[Math.max(categoryTagActiveIndex, 0)];
    if (option) selectCategoryTag(option.dataset.groupKey);
    return;
  }

  const direction = event.key === "ArrowDown" ? 1 : -1;
  categoryTagActiveIndex = (categoryTagActiveIndex + direction + options.length) % options.length;
  options.forEach((option, index) => option.classList.toggle("keyboard-active", index === categoryTagActiveIndex));
  const activeOption = options[categoryTagActiveIndex];
  $("categoryTagInput").setAttribute("aria-activedescendant", activeOption.id);
  activeOption.scrollIntoView({ block: "nearest" });
});

$("categoryTagToggle").addEventListener("click", () => {
  const list = $("categoryTagList");
  if (!list.classList.contains("hidden")) {
    closeCategoryTagDropdown();
    return;
  }
  $("categoryTagInput").focus();
  openCategoryTagDropdown({ showAll: true });
});

document.addEventListener("pointerdown", (event) => {
  if (!$("categoryTagCombobox").contains(event.target)) closeCategoryTagDropdown();
});

function markActiveChip() {
  document
    .querySelectorAll("#catalog .prob-chip, #problemSearchItems .prob-chip")
    .forEach((chip) => {
      const isActive = Number(chip.dataset.id) === currentProblemId;
      chip.classList.toggle("active", isActive);
    });
}

function catalogGroupsForCurrentProblem() {
  if (!catalogData || !currentProblemId) return [];
  const matching = catalogData.filter((group) =>
    (group.problems || []).some((problem) => Number(problem.id) === Number(currentProblemId)),
  );
  if (!problemData) return matching;

  const preferredKeys = [
    ...(problemData.tags || []).map((tag) => tag && tag.key),
    problemData.category && problemData.category.key,
  ].filter(Boolean);
  const order = new Map(preferredKeys.map((key, index) => [key, index]));
  return matching.sort((a, b) => {
    const aOrder = order.has(a.key) ? order.get(a.key) : preferredKeys.length;
    const bOrder = order.has(b.key) ? order.get(b.key) : preferredKeys.length;
    return aOrder - bOrder;
  });
}

function renderCatalogJumpNav() {
  const nav = $("catalogJumpNav");
  if (!nav) return;
  nav.querySelectorAll(".catalog-jump-btn").forEach((button) => button.remove());
  nav.setAttribute("aria-label", t().catalogJumpNav);

  const quickProblemInput = $("quickProblemId");
  if (quickProblemInput && document.activeElement !== quickProblemInput && quickProblemInput.getAttribute("aria-invalid") !== "true") {
    quickProblemInput.value = currentProblemId || "";
  }

  catalogGroupsForCurrentProblem().forEach((group) => {
    const label = String(pick(group));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "catalog-jump-btn" + (activeCatalogJumpKey === group.key ? " is-active" : "");
    button.dataset.groupKey = group.key;
    button.setAttribute("aria-label", t().jumpToTag(label, currentProblemId));
    button.title = t().jumpToTag(label, currentProblemId);

    const icon = document.createElement("span");
    icon.className = "catalog-jump-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "#";
    const textLabel = document.createElement("span");
    textLabel.className = "catalog-jump-label";
    textLabel.textContent = label;
    button.append(icon, textLabel);
    button.addEventListener("click", () => jumpToCatalogGroup(group.key));
    nav.appendChild(button);
  });
  renderCatalogTagMarkers();
  updateBackToTopButton();
}

function catalogTagMarkerLabel(group) {
  const parts = String(group.key || pick(group) || "").split(/[^a-z0-9]+/i).filter(Boolean);
  if (parts.length > 1) return parts.map((part) => part[0]).join("").slice(0, 3).toUpperCase();
  return (parts[0] || "?").slice(0, 3).toUpperCase();
}

function renderCatalogTagMarkers() {
  const nav = $("catalogTagMarkers");
  if (!nav) return;
  nav.replaceChildren();
  const groups = catalogGroupsForCurrentProblem();
  nav.hidden = groups.length === 0;
  if (!groups.length) return;

  nav.setAttribute("aria-label", lang === "vi" ? "Đi đến tag của bài hiện tại" : "Jump to a current problem tag");
  groups.forEach((group) => {
    const label = String(pick(group));
    const button = document.createElement("button");
    button.type = "button";
    button.className = `catalog-tag-marker${group.key === "dp" ? " is-dp" : ""}${activeCatalogJumpKey === group.key ? " is-active" : ""}`;
    button.dataset.groupKey = group.key;
    button.textContent = catalogTagMarkerLabel(group);
    button.setAttribute("aria-label", t().jumpToTag(label, currentProblemId));
    button.title = label;
    button.addEventListener("click", () => jumpToCatalogGroup(group.key));
    nav.appendChild(button);
  });
  updateCatalogTagMarkerPositions();
}

function updateCatalogTagMarkerPositions() {
  const nav = $("catalogTagMarkers");
  if (!nav || nav.hidden) return;
  const markers = [...nav.querySelectorAll(".catalog-tag-marker")];
  const catalog = $("catalog");
  const catalogHidden = catalog.classList.contains("hidden");
  const height = window.innerHeight;
  const markerSize = 38;
  const topInset = 48;
  const bottomInset = 48;
  const maxTop = Math.max(topInset, height - bottomInset - markerSize);
  const range = Math.max(1, document.documentElement.scrollHeight - height);
  const groups = catalogGroupsForCurrentProblem();
  const candidates = markers.map((marker, index) => {
    const group = groups.find((item) => item.key === marker.dataset.groupKey);
    const element = [...document.querySelectorAll("#catalog .cat-group")]
      .find((item) => item.dataset.groupKey === marker.dataset.groupKey);
    let desiredTop;
    if (catalogHidden || !element || element.getBoundingClientRect().height === 0) {
      const progress = markers.length < 2 ? 0 : index / (markers.length - 1);
      desiredTop = topInset + progress * (maxTop - topInset);
    } else {
      const documentTop = element.getBoundingClientRect().top + window.scrollY - 12;
      const progress = Math.max(0, Math.min(1, documentTop / range));
      desiredTop = topInset + progress * (maxTop - topInset);
    }
    return { marker, key: group?.key || marker.dataset.groupKey, desiredTop };
  }).sort((a, b) => a.desiredTop - b.desiredTop);

  let previousTop = topInset - markerSize - 4;
  candidates.forEach((candidate) => {
    const top = Math.max(candidate.desiredTop, previousTop + markerSize + 4);
    candidate.marker.style.top = `${Math.round(Math.min(top, maxTop))}px`;
    previousTop = top;
  });
  const overflow = previousTop - maxTop;
  if (overflow > 0) {
    candidates.forEach((candidate) => {
      candidate.marker.style.top = `${Math.max(topInset, Math.round(Number.parseFloat(candidate.marker.style.top) - overflow))}px`;
    });
  }
}

window.addEventListener("resize", updateCatalogTagMarkerPositions, { passive: true });
// Opening categories, running a visualization, and text reflow change page length.
const catalogTagMarkerObserver = new ResizeObserver(updateCatalogTagMarkerPositions);
catalogTagMarkerObserver.observe(document.body);

function jumpToCatalogGroup(groupKey) {
  if (!currentProblemId) return;
  if (normalizeProblemSearch(problemSearchQuery)) {
    problemSearchQuery = "";
    $("problemKeyword").value = "";
    renderProblemSearchResults();
  }

  activeCatalogJumpKey = groupKey;
  openCatalogGroupExclusively(groupKey);
  $("catalogJumpNav")?.querySelectorAll(".catalog-jump-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.groupKey === groupKey);
  });
  $("catalogTagMarkers")?.querySelectorAll(".catalog-tag-marker").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.groupKey === groupKey);
  });

  requestAnimationFrame(() => {
    const group = [...document.querySelectorAll("#catalog .cat-group")]
      .find((item) => item.dataset.groupKey === groupKey);
    if (!group) return;
    const target = [...group.querySelectorAll(".prob-chip")]
      .find((chip) => Number(chip.dataset.id) === Number(currentProblemId));
    const destination = target || group;
    destination.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
    updateCatalogTagMarkerPositions();
    if (!target) return;
    target.classList.remove("catalog-jump-target");
    requestAnimationFrame(() => target.classList.add("catalog-jump-target"));
    clearTimeout(catalogJumpHighlightTimer);
    catalogJumpHighlightTimer = setTimeout(() => target.classList.remove("catalog-jump-target"), 1700);
  });
}

// ---- Load problem info ----
$("loadBtn").addEventListener("click", () => loadProblem({ scrollToEnd: true }));
$("problemId").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadProblem({ scrollToEnd: true });
});

$("quickProblemForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = $("quickProblemId");
  const submitButton = $("quickProblemGoBtn");
  $("problemId").value = input.value.trim();
  input.removeAttribute("aria-invalid");
  input.setCustomValidity("");
  input.title = t().quickJumpLabel;
  input.disabled = true;
  if (submitButton) submitButton.disabled = true;
  try {
    const loaded = await loadProblem({ scrollToEnd: true });
    if (loaded) {
      input.value = currentProblemId;
      return;
    }
    input.setAttribute("aria-invalid", "true");
    const message = $("searchError").textContent || t().errLoad;
    input.setCustomValidity(message);
    input.title = message;
  } finally {
    input.disabled = false;
    if (submitButton) submitButton.disabled = false;
  }
});

function jumpToPageEnd() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const pageEnd = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.scrollTo(0, pageEnd);
      updateBackToTopButton();
    });
  });
}

function updateBackToTopButton() {
  const button = $("backToTopBtn");
  const jumpNav = $("catalogJumpNav");
  const visible = window.scrollY > 0;
  if (button) button.classList.toggle("is-visible", visible);
  if (jumpNav) jumpNav.classList.toggle("is-visible", visible && Boolean(jumpNav.querySelector(".catalog-jump-btn")));
}

$("backToTopBtn").addEventListener("click", () => {
  window.scrollTo(0, 0);
  $("problemId").focus({ preventScroll: true });
  updateBackToTopButton();
});
window.addEventListener("scroll", updateBackToTopButton, { passive: true });
window.addEventListener("resize", updateBackToTopButton);
updateBackToTopButton();

async function loadProblem({ scrollToEnd = false } = {}) {
  const id = $("problemId").value.trim();
  searchErrorState = null;
  hide("searchError");
  if (!id) {
    showError("searchError", t().errEmptyId);
    return false;
  }

  try {
    const res = await fetch(`/api/problem/${id}`);
    const data = await res.json();
    if (!res.ok) {
      if (data.code === "UNSUPPORTED_PROBLEM") {
        searchErrorState = { type: "unsupported", id: data.problemId ?? id };
        renderSearchError();
        return false;
      }
      showError("searchError", data.error || t().errLoad);
      return false;
    }

    const problemChanged = currentProblemId !== data.id;
    currentProblemId = data.id;
    if (problemChanged) activeCatalogJumpKey = null;
    localStorage.setItem("lastProblemId", data.id);
    problemData = data;
    const quickProblemInput = $("quickProblemId");
    if (quickProblemInput) {
      quickProblemInput.value = data.id;
      quickProblemInput.removeAttribute("aria-invalid");
      quickProblemInput.setCustomValidity("");
      quickProblemInput.title = t().quickJumpLabel;
    }
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
    warmProblemVisualizationAssets(data.id);
    if (scrollToEnd) jumpToPageEnd();
    return true;
  } catch (err) {
    showError("searchError", t().errConn);
    return false;
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

  const tagsEl = $("problemTags");
  tagsEl.innerHTML = "";
  const tagsHover = createProblemTagsHover(problemData.tags, true);
  if (tagsHover) tagsEl.appendChild(tagsHover);
  tagsEl.classList.toggle("hidden", !tagsHover);
  renderCatalogJumpNav();

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
  const approachInput = $("extraParams") && $("extraParams").querySelector('[data-param="approach"]');
  const selectedApproach = Number(approachInput && approachInput.value);
  const cx = selectedApproach === 3 && problemData.complexity3 ? problemData.complexity3
    : selectedApproach === 2 && problemData.complexity2 ? problemData.complexity2 : problemData.complexity;
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

    if (p.key === "approach") {
      inputEl.addEventListener("change", () => {
        resetLiveEditorState();
        renderComplexity();
        if (steps.length) runViz();
      });
    }
  });
}

// Get string by language; supports both plain strings and {vi,en} objects
function pick(field) {
  if (field && typeof field === "object") return field[lang] ?? field.en ?? field.vi;
  return field;
}

function createProblemTagsHover(tags, focusable = false) {
  const values = Array.isArray(tags) ? tags.filter((tag) => tag && pick(tag)) : [];
  if (!values.length) return null;

  const labels = values.map((tag) => String(pick(tag)));
  const wrapper = document.createElement("span");
  wrapper.className = "problem-tags-hover";
  wrapper.setAttribute("aria-label", `Tags: ${labels.join(", ")}`);
  if (focusable) wrapper.tabIndex = 0;

  const trigger = document.createElement("span");
  trigger.className = "problem-tags-trigger";
  trigger.setAttribute("aria-hidden", "true");

  const tooltip = document.createElement("span");
  tooltip.className = "problem-tags-tooltip";
  tooltip.setAttribute("role", "tooltip");
  values.forEach((tag) => {
    const tagEl = document.createElement("span");
    tagEl.className = `problem-tag problem-tag-${tag.key || "other"}`;
    tagEl.textContent = pick(tag);
    tooltip.appendChild(tagEl);
  });

  wrapper.append(trigger, tooltip);
  return wrapper;
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
    const isCriticalPointsDebug = Number(problemData && problemData.id) === 2058;

    const decorateLine = (line, isFinal) => {
      if (!isCriticalPointsDebug) {
        return {
          ...step,
          codeLines: [line],
          final: isFinal,
        };
      }

      const title = step.title || {};
      const titleVi = typeof title === "object" ? (title.vi || title.en || "") : String(title);
      const titleEn = typeof title === "object" ? (title.en || title.vi || "") : String(title);
      return {
        ...step,
        title: {
          vi: `Dòng ${line}: ${titleVi}`,
          en: `Line ${line}: ${titleEn}`,
        },
        debugLine: line,
        criticalPoints2058View: step.criticalPoints2058View
          ? { ...step.criticalPoints2058View, debugLine: line }
          : step.criticalPoints2058View,
        codeLines: [line],
        final: isFinal,
      };
    };

    if (lines.length <= 1) {
      expanded.push(lines.length === 1
        ? decorateLine(lines[0], Boolean(step.final))
        : step);
      return;
    }

    lines.forEach((line, idx) => {
      expanded.push(decorateLine(line, Boolean(step.final && idx === lines.length - 1)));
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
    input = problemData.preserveInputWhitespace ? $("arrInput").value : $("arrInput").value.trim();
    if (input.length === 0 && !problemData.allowEmptyInput && Number(problemData.id) !== 32) {
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
    const [res] = await Promise.all([
      fetch(`/api/problem/${currentProblemId}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, params }),
      }),
      ensureProblemVisualizationAssets(currentProblemId),
    ]);
    const data = await res.json();
    if (!res.ok) {
      return showError("runError", data.error || t().errSolve);
    }

    await Promise.all([
      ensureBaseVisualizationRuntime(),
      ensureSharedVisualizationAssets(data.steps || []),
    ]);

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
    $("vizPanel").scrollIntoView({ behavior: "auto", block: "start" });
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
  // Preserve the expected page-navigation behavior for Home and End. The
  // visualization still exposes dedicated first/last step buttons (⏮/⏭).
  const tag = (e.target.tagName || "").toLowerCase();
  if ((e.key === "Home" || e.key === "End") && tag !== "input" && tag !== "textarea") {
    e.preventDefault();
    if (e.key === "Home") {
      window.scrollTo(0, 0);
    } else {
      const pageEnd = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.scrollTo(0, pageEnd);
    }
    updateBackToTopButton();
    return;
  }

  const visualizationActive = steps.length && !$("vizPanel").classList.contains("hidden");
  if (e.key === "F10" && visualizationActive) {
    e.preventDefault();
    $("nextBtn").click();
    return;
  }

  // Skip when typing in input fields
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
  const split = panel.closest(".viz-split");
  const problemId = Number(problemData && problemData.id);
  if (split) {
    split.classList.toggle("problem-173-layout", problemId === 173);
    split.classList.toggle("problem-677-layout", problemId === 677);
    split.classList.toggle("problem-642-layout", problemId === 642);
    split.classList.toggle("problem-648-layout", problemId === 648);
    split.classList.toggle("problem-211-layout", problemId === 211);
    split.classList.toggle("problem-212-layout", problemId === 212);
    split.classList.toggle("problem-684-layout", problemId === 684);
    split.classList.toggle("problem-685-layout", problemId === 685);
    split.classList.toggle("problem-2058-layout", problemId === 2058);
    split.classList.toggle("problem-2101-layout", problemId === 2101);
  }
  const localizedCode = problemData && (lang === "vi" ? problemData.codeVi : problemData.codeEn);
  const code = localizedCode || (problemData && problemData.code) || [];
  const code2 = (problemData && problemData.code2) || null;
  const code3 = (problemData && problemData.code3) || null;
  const codeCsharp = (problemData && problemData.codeCsharp) || null;
  panel.innerHTML = "";
  if (code.length === 0 && !code2 && !code3 && !codeCsharp) {
    panel.classList.add("hidden");
    $("codeBlurBtn").classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  $("codeBlurBtn").classList.toggle("hidden", liveMode);

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

  // Follow the active line inside the code panel without scrolling the page.
  if (firstActiveRow && panel) {
    setTimeout(() => {
      if (!firstActiveRow.isConnected || !firstActiveRow.classList.contains("active")) return;
      const panelRect = panel.getBoundingClientRect();
      const rowRect = firstActiveRow.getBoundingClientRect();
      const top = panelRect.top + panel.clientTop;
      const bottom = top + panel.clientHeight;

      if (rowRect.top < top || rowRect.bottom > bottom) {
        panel.scrollTop += rowRect.top - top - (panel.clientHeight - rowRect.height) / 2;
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
      const key = typeof v.name === "object" && v.name ? (v.name.en || v.name.vi || JSON.stringify(v.name)) : v.name;
      prevValues[key] = formatVarValue(v.value);
    });
  }

  const makeVarItem = (v, opts = {}) => {
    const valStr = formatVarValue(v.value);
    const item = document.createElement("div");
    item.className = opts.watch ? "var-item watch-item" : "var-item";
    const varKey = typeof v.name === "object" && v.name ? (v.name.en || v.name.vi || JSON.stringify(v.name)) : v.name;
    if (prevStep && varKey in prevValues && prevValues[varKey] !== valStr) {
      item.classList.add("changed");
    }

    const name = document.createElement("span");
    name.className = "var-name";
    name.textContent = pick(v.name);

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
      remove.dataset.removeWatch = varKey;
      item.appendChild(remove);
    }
    return item;
  };

  const varsByName = {};
  vars.forEach((v) => {
    const key = typeof v.name === "object" && v.name ? (v.name.en || v.name.vi || JSON.stringify(v.name)) : v.name;
    varsByName[key] = v;
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
