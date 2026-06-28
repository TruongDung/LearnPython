const $ = (id) => document.getElementById(id);

let currentProblemId = null;
let steps = [];
let stepIndex = 0;
let playTimer = null;

// ---- Tải thông tin bài ----
$("loadBtn").addEventListener("click", loadProblem);
$("problemId").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadProblem();
});

async function loadProblem() {
  const id = $("problemId").value.trim();
  hide("searchError");
  if (!id) {
    return showError("searchError", "Vui lòng nhập số bài.");
  }

  try {
    const res = await fetch(`/api/problem/${id}`);
    const data = await res.json();
    if (!res.ok) {
      return showError("searchError", data.error || "Không tải được bài.");
    }

    currentProblemId = data.id;
    $("problemId2").textContent = `#${data.id}`;
    $("problemTitle").textContent = data.title;
    $("problemTitleVi").textContent = data.titleVi;
    $("problemStatement").textContent = data.statement;
    $("arrInput").value = data.defaultInput.join(",");

    show("problemPanel");
    hide("vizPanel");
    stopPlay();
  } catch (err) {
    showError("searchError", "Lỗi kết nối tới server.");
  }
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

  if (input.length === 0 || input.some((n) => !Number.isInteger(n) || n <= 0)) {
    return showError("runError", "Nhập các số nguyên dương, cách nhau bởi dấu phẩy. VD: 2,2,1,2,1");
  }

  try {
    const res = await fetch(`/api/problem/${currentProblemId}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    const data = await res.json();
    if (!res.ok) {
      return showError("runError", data.error || "Không xử lý được.");
    }

    steps = data.steps;
    stepIndex = 0;
    show("vizPanel");
    renderStep();
    $("vizPanel").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    showError("runError", "Lỗi kết nối tới server.");
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

function togglePlay() {
  if (playTimer) {
    stopPlay();
    return;
  }
  if (stepIndex >= steps.length - 1) stepIndex = 0;
  $("playBtn").textContent = "⏸ Dừng";
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
  $("playBtn").textContent = "▶ Chạy";
}

// ---- Vẽ một bước ----
function renderStep() {
  const step = steps[stepIndex];
  if (!step) return;

  $("stepTitle").textContent = step.title;
  $("stepCounter").textContent = `Bước ${stepIndex + 1}/${steps.length}`;
  $("stepNote").textContent = step.note;

  const maxVal = Math.max(...steps.flatMap((s) => s.arr), 1);
  const isLast = stepIndex === steps.length - 1;

  const barsEl = $("bars");
  barsEl.innerHTML = "";

  step.arr.forEach((val, i) => {
    const highlighted = step.highlight.includes(i);
    const finalBar = isLast && i === step.arr.length - 1;

    const bar = document.createElement("div");
    bar.className = "bar" + (highlighted ? " highlight" : "") + (finalBar ? " final" : "");

    const col = document.createElement("div");
    col.className = "col";
    col.style.height = `${(val / maxVal) * 180 + 4}px`;

    const valEl = document.createElement("div");
    valEl.className = "val";
    valEl.textContent = val;

    const idxEl = document.createElement("div");
    idxEl.className = "idx";
    idxEl.textContent = `[${i}]`;

    bar.appendChild(valEl);
    bar.appendChild(col);
    bar.appendChild(idxEl);
    barsEl.appendChild(bar);
  });

  // nút điều khiển
  $("firstBtn").disabled = stepIndex === 0;
  $("prevBtn").disabled = stepIndex === 0;
  $("nextBtn").disabled = stepIndex === steps.length - 1;
  $("lastBtn").disabled = stepIndex === steps.length - 1;

  // hộp kết quả
  if (isLast) {
    const answer = step.arr[step.arr.length - 1];
    $("answer").textContent = `Đáp án: ${answer}`;
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

// Tự tải bài mặc định khi mở trang
loadProblem();
