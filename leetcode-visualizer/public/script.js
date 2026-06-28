const $ = (id) => document.getElementById(id);

let lang = "vi";
let currentProblemId = null;
let problemData = null; // dữ liệu bài (song ngữ) đã tải
let steps = [];
let stepIndex = 0;
let answerValue = null; // đáp án của lần chạy hiện tại
let playTimer = null;
let catalogData = null; // danh sách bài theo nhóm

// ---- Chuỗi giao diện theo ngôn ngữ ----
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
    kbdHint: "Phím tắt: ← Lùi · → Tiến · Home Về đầu · End Đến cuối · Space Chạy/Dừng",    errEmptyId: "Vui lòng nhập số bài.",
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
    kbdHint: "Shortcuts: ← Prev · → Next · Home First · End Last · Space Play/Pause",
    errEmptyId: "Please enter a problem number.",
    errLoad: "Could not load the problem.",
    errConn: "Connection error to server.",
    errArr: "Enter positive integers separated by commas. E.g. 2,2,1,2,1",
    errSolve: "Could not process the request.",
  },
};

const t = () => I18N[lang];

// ---- Chuyển ngôn ngữ ----
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
  // nút Chạy/Dừng phụ thuộc trạng thái
  $("playBtn").textContent = playTimer ? t().playStop : t().play;
}

// ---- Danh mục bài theo nhóm thuật toán ----
async function loadCatalog() {
  try {
    const res = await fetch("/api/problems");
    const data = await res.json();
    if (res.ok) {
      catalogData = data.groups;
      renderCatalog();
    }
  } catch (err) {
    // bỏ qua, vẫn có thể nhập số bài thủ công
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
    const nameSpan = document.createElement("span");
    nameSpan.textContent = pick(group);
    const countSpan = document.createElement("span");
    countSpan.className = "count";
    countSpan.textContent = `(${group.problems.length})`;
    titleEl.appendChild(nameSpan);
    titleEl.appendChild(countSpan);

    const itemsEl = document.createElement("div");
    itemsEl.className = "cat-items";

    group.problems.forEach((p) => {
      const chip = document.createElement("button");
      chip.className = "prob-chip" + (p.id === currentProblemId ? " active" : "");
      chip.dataset.id = p.id;

      const pid = document.createElement("span");
      pid.className = "pid";
      pid.textContent = `#${p.id}`;

      const pname = document.createElement("span");
      pname.className = "pname";
      pname.textContent = pick(p.title);

      chip.appendChild(pid);
      chip.appendChild(pname);
      chip.addEventListener("click", () => {
        $("problemId").value = p.id;
        loadProblem();
      });
      itemsEl.appendChild(chip);
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
      chip.classList.toggle("active", Number(chip.dataset.id) === currentProblemId);
    });
}

// ---- Tải thông tin bài ----
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
    problemData = data;
    renderProblem();
    $("arrInput").value = data.defaultInput.join(",");
    markActiveChip();

    show("problemPanel");
    hide("vizPanel");
    steps = [];
    stopPlay();
  } catch (err) {
    showError("searchError", t().errConn);
  }
}

// Vẽ panel mô tả bài theo ngôn ngữ hiện tại
function renderProblem() {
  if (!problemData) return;
  $("problemId2").textContent = `#${problemData.id}`;
  $("problemTitle").textContent = pick(problemData.title);
  $("problemTitleVi").textContent = pick(problemData.titleVi);
  $("problemStatement").textContent = pick(problemData.statement);
  // Nhãn ô nhập: dùng nhãn tùy biến của bài nếu có, ngược lại về mặc định
  $("arrLabel").textContent = problemData.inputLabel
    ? pick(problemData.inputLabel)
    : t().arrLabel;
  renderComplexity();
  renderExtraParams();
}

// Hiển thị phân tích độ phức tạp thời gian/bộ nhớ
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

  // Bản gọn trong vùng trực quan hóa
  $("vizCxTime").textContent = cx.time;
  $("vizCxSpace").textContent = cx.space;
  show("vizComplexity");
}

// Vẽ các ô nhập tham số phụ (vd k của bài 1004), giữ lại giá trị đã nhập khi đổi ngôn ngữ
function renderExtraParams() {
  const container = $("extraParams");
  const params = problemData.extraParams || [];
  const existing = {};
  container.querySelectorAll("input[data-param]").forEach((inp) => {
    existing[inp.dataset.param] = inp.value;
  });

  container.innerHTML = "";
  params.forEach((p) => {
    const wrap = document.createElement("div");
    wrap.className = "param";

    const label = document.createElement("label");
    label.textContent = pick(p.label);
    label.setAttribute("for", `param-${p.key}`);

    const input = document.createElement("input");
    input.type = "number";
    input.id = `param-${p.key}`;
    input.dataset.param = p.key;
    input.value = existing[p.key] !== undefined ? existing[p.key] : p.default;

    wrap.appendChild(label);
    wrap.appendChild(input);
    container.appendChild(wrap);
  });
}

// Lấy chuỗi theo ngôn ngữ; hỗ trợ cả chuỗi thường lẫn object {vi,en}
function pick(field) {
  if (field && typeof field === "object") return field[lang] ?? field.en ?? field.vi;
  return field;
}

// ---- Chạy thuật toán ----
$("runBtn").addEventListener("click", runViz);

async function runViz() {
  hide("runError");
  const raw = $("arrInput").value.trim();
  const input = raw
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

  // Thu thập tham số phụ
  const params = {};
  $("extraParams")
    .querySelectorAll("input[data-param]")
    .forEach((inp) => {
      params[inp.dataset.param] = Number(inp.value);
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

// ---- Điều khiển từng bước ----
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

// ---- Điều hướng bằng bàn phím ----
document.addEventListener("keydown", (e) => {
  // Bỏ qua khi đang gõ trong ô nhập
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  // Chỉ hoạt động khi đang xem trực quan hóa
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

// ---- Vẽ code Python ----
function renderCode() {
  const panel = $("codePanel");
  const code = (problemData && problemData.code) || [];
  panel.innerHTML = "";
  if (code.length === 0) {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  code.forEach((line, idx) => {
    const row = document.createElement("div");
    row.className = "code-line";
    row.dataset.line = idx + 1; // 1-indexed

    const ln = document.createElement("span");
    ln.className = "ln";
    ln.textContent = idx + 1;

    const txt = document.createElement("span");
    txt.className = "txt";
    txt.textContent = line;

    row.appendChild(ln);
    row.appendChild(txt);
    panel.appendChild(row);
  });
}

function updateCodeHighlight(activeLines) {
  const set = new Set(activeLines);
  $("codePanel")
    .querySelectorAll(".code-line")
    .forEach((row) => {
      row.classList.toggle("active", set.has(Number(row.dataset.line)));
    });
}

// ---- Vẽ một bước ----
function renderStep() {  const step = steps[stepIndex];
  if (!step) return;

  $("stepTitle").textContent = pick(step.title);
  $("stepCounter").textContent = t().stepCounter(stepIndex + 1, steps.length);
  $("stepNote").textContent = pick(step.note);
  updateCodeHighlight(step.codeLines || []);

  const maxVal = Math.max(...steps.flatMap((s) => s.arr.map((v) => Math.abs(v))), 1);

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

  // nút điều khiển
  $("firstBtn").disabled = stepIndex === 0;
  $("prevBtn").disabled = stepIndex === 0;
  $("nextBtn").disabled = stepIndex === steps.length - 1;
  $("lastBtn").disabled = stepIndex === steps.length - 1;

  // hộp kết quả
  if (step.final) {
    $("answer").textContent = t().answer(answerValue);
    show("answer");
  } else {
    hide("answer");
  }
}

// ---- Tiện ích ----
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

// Khởi tạo
applyStaticStrings();
loadCatalog();
loadProblem();
