const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const { SUPPORTED, CATEGORY_ORDER } = require("./problems");
const { prepareDesignLiveRun, prepareGenericLiveArgs } = require("./live-args");

const PREMIUM_PROBLEM_IDS = new Set([
  156, 246, 253, 269, 270, 276, 285, 314, 317, 323, 359, 366, 370, 426, 487,
  505, 588, 642, 734, 760, 1101, 1136, 1166, 1197, 1216, 1236, 1245, 1258, 1644,
  1650, 1676, 1804,
]);

function isPremium(problem) {
  return Boolean(problem.premium || PREMIUM_PROBLEM_IDS.has(problem.id));
}

app.get("/api/problems", (req, res) => {
  // Group problems by algorithm category
  const groupsMap = {};
  for (const key of Object.keys(SUPPORTED)) {
    const p = SUPPORTED[key];
    const primary = p.category || { key: "other", vi: "Khác", en: "Other" };
    const categories = [primary, ...(Array.isArray(p.tags) ? p.tags : [])];
    const seenCategoryKeys = new Set();
    for (const cat of categories) {
      if (!cat || !cat.key || seenCategoryKeys.has(cat.key)) continue;
      seenCategoryKeys.add(cat.key);
      if (!groupsMap[cat.key]) {
        groupsMap[cat.key] = { key: cat.key, vi: cat.vi, en: cat.en, problems: [] };
      }
      groupsMap[cat.key].problems.push({
        id: p.id,
        title: p.title,
        titleVi: p.titleVi,
        difficulty: p.difficulty || null,
        premium: isPremium(p),
      });
    }
  }
  const groups = Object.values(groupsMap);
  groups.forEach((g) => {
    const ordering = CATEGORY_ORDER[g.key];
    if (ordering) {
      const orderMap = new Map(ordering.order.map((id, idx) => [id, idx]));
      g.problems.sort((a, b) => {
        const ai = orderMap.has(a.id) ? orderMap.get(a.id) : Infinity;
        const bi = orderMap.has(b.id) ? orderMap.get(b.id) : Infinity;
        if (ai !== bi) return ai - bi;
        return a.id - b.id;
      });
      g.recommendedOrderLabel = ordering.label;
      if (ordering.guide) g.guide = ordering.guide;
    } else {
      g.problems.sort((a, b) => a.id - b.id);
    }
  });
  groups.sort((a, b) => a.key.localeCompare(b.key));
  res.json({ groups });
});

app.get("/api/problem/:id", (req, res) => {
  const id = Number(req.params.id);
  const problem = SUPPORTED[id];
  if (!problem) {
    return res.status(404).json({
      code: "UNSUPPORTED_PROBLEM",
      problemId: id,
      error: `Problem ${id} is not supported yet.`,
    });
  }
  res.json({
    id: problem.id,
    difficulty: problem.difficulty || null,
    premium: isPremium(problem),
    slug: problem.slug || null,
    category: problem.category || null,
    tags: problem.tags || [],
    title: problem.title,
    titleVi: problem.titleVi,
    statement: problem.statement,
    defaultInput: problem.defaultInput,
    inputKind: problem.inputKind,
    extraParams: problem.extraParams || [],
    inputLabel: problem.inputLabel || null,
    complexity: problem.complexity || null,
    code: problem.code || [],
    codeVi: problem.codeVi || null,
    codeEn: problem.codeEn || null,
    code2: problem.code2 || null,
    code3: problem.code3 || null,
    codeCsharp: problem.codeCsharp || null,
    codeLabel: problem.codeLabel || null,
    code2Label: problem.code2Label || null,
    code3Label: problem.code3Label || null,
    approach: problem.approach || null,
    debugMode: problem.debugMode || null,
    hasLiveArgs: typeof problem.liveArgs === "function",
  });
});

// Compute ready-to-call Python argument values (JSON-safe) for the live code
// editor, using the same input/params the canned visualizer already accepts.
// Falls back to a generic best-effort binding when a problem hasn't opted in
// with an explicit `liveArgs` converter.
app.post("/api/problem/:id/live-args", (req, res) => {
  const id = Number(req.params.id);
  const problem = SUPPORTED[id];
  if (!problem) {
    return res.status(404).json({ error: `Bài ${id} chưa được hỗ trợ.` });
  }
  const input = req.body.input;
  const params = req.body.params || {};

  if (typeof problem.liveArgs === "function") {
    try {
      const args = problem.liveArgs(input, params);
      return res.json({ args });
    } catch (err) {
      return res.status(400).json({ error: String((err && err.message) || err) });
    }
  }

  try {
    const design = prepareDesignLiveRun(problem, input, params, req.body.codeBlock || 1);
    if (design) return res.json({ args: [], design });
    const args = prepareGenericLiveArgs(problem, input, params, req.body.codeBlock || 1);
    res.json({ args, generic: true });
  } catch (err) {
    res.status(400).json({ error: String((err && err.message) || err) });
  }
});

app.post("/api/problem/:id/solve", (req, res) => {
  const id = Number(req.params.id);
  const problem = SUPPORTED[id];
  if (!problem) {
    return res.status(404).json({ error: `Bài ${id} chưa được hỗ trợ.` });
  }

  const input = req.body.input;
  const params = req.body.params || {};

  if (problem.inputKind === "string") {
    if (typeof input !== "string" || input.length === 0) {
      return res.status(400).json({
        error: "Đầu vào s phải là một chuỗi không rỗng.",
      });
    }
  } else if (problem.inputKind === "stringArray") {
    if (!Array.isArray(input) || input.length === 0 || !input.every((s) => typeof s === "string")) {
      return res.status(400).json({
        error: "Input must be an array of strings, e.g. [\"10\",\"0001\",\"1\",\"0\"].",
      });
    }
  } else {
    if (!Array.isArray(input) || input.length === 0 || !input.every((n) => Number.isInteger(n))) {
      return res.status(400).json({
        error: "Đầu vào phải là mảng các số nguyên.",
      });
    }

    if (problem.inputKind === "positive" && !input.every((n) => n > 0)) {
      return res.status(400).json({
        error: "Đầu vào phải là mảng các số nguyên dương, ví dụ: 2,2,1,2,1",
      });
    }

    if (problem.inputKind === "binary" && !input.every((n) => n === 0 || n === 1)) {
      return res.status(400).json({
        error: "Đầu vào phải là mảng nhị phân chỉ gồm 0 và 1, ví dụ: 1,1,1,0,0,1",
      });
    }

    if (problem.inputKind === "nonneg" && !input.every((n) => n >= 0)) {
      return res.status(400).json({
        error: "Đầu vào phải là mảng các số nguyên không âm, ví dụ: 1,100,1,1,1",
      });
    }

    if (problem.singleInput) {
      if (input.length !== 1) {
        return res.status(400).json({ error: "Bài này chỉ nhận đúng một số." });
      }
      if (problem.maxInput && input[0] > problem.maxInput) {
        return res.status(400).json({ error: `Giá trị tối đa cho phép là ${problem.maxInput}.` });
      }
    }
  }

  // Validate extra parameters
  for (const p of problem.extraParams || []) {
    const v = params[p.key];
    if (p.type === "string") {
      if (typeof v !== "string" || v.length === 0) {
        return res.status(400).json({ error: `Tham số "${p.key}" phải là chuỗi không rỗng.` });
      }
    } else if (p.type === "float") {
      if (typeof v !== "number" || !isFinite(v)) {
        return res.status(400).json({ error: `Tham số "${p.key}" phải là một số.` });
      }
    } else if (p.type === "select") {
      // select params are sent as numbers; accept any finite number or skip if undefined
      if (v !== undefined && typeof v !== "number" && typeof v !== "string") {
        return res.status(400).json({ error: `Tham số "${p.key}" không hợp lệ.` });
      }
    } else if (!Number.isInteger(v) || (!p.allowNegative && v < 0)) {
      return res.status(400).json({
        error: `Tham số "${p.key}" phải là số nguyên${p.allowNegative ? "" : " không âm"}.`,
      });
    }

    if (typeof v === "number" && p.min !== undefined && v < p.min) {
      return res.status(400).json({ error: `Tham số "${p.key}" phải lớn hơn hoặc bằng ${p.min}.` });
    }
    if (typeof v === "number" && p.max !== undefined && v > p.max) {
      return res.status(400).json({ error: `Tham số "${p.key}" phải nhỏ hơn hoặc bằng ${p.max}.` });
    }
  }

  // Only some string problems require s and t to have equal length.
  if (problem.requireEqualLength && typeof params.t === "string" && params.t.length !== input.length) {
    return res.status(400).json({ error: "Chuỗi s và t phải có cùng độ dài." });
  }

  try {
    const result = (params.approach === 3 || params.approach === "3") && typeof problem.builder3 === "function"
      ? problem.builder3(input, params)
      : (params.approach === 2 || params.approach === "2") && typeof problem.builder2 === "function"
        ? problem.builder2(input, params)
        : problem.builder(input, params);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: String((err && err.message) || err) });
  }
});

app.listen(PORT, () => {
  console.log(`LeetCode Visualizer chạy tại http://localhost:${PORT}`);
});
