const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const SUPPORTED = require("./problems");

// Recommended learning order per category. Problems not in the list are sorted by ID at the end.
const CATEGORY_ORDER = {
  dp: {
    order: [509, 70, 746, 198, 213, 740, 53, 152, 300, 322, 518, 279, 139, 91, 62, 64, 120, 931, 1143, 72, 416],
    label: {
      vi: "Thứ tự học được khuyến nghị",
      en: "Recommended learning order",
    },
    guide: {
      vi: {
        intro:
          "Nếu mục tiêu là phỏng vấn Software Engineer, đây là 20 bài LeetCode DP quan trọng nhất, sắp xếp từ dễ → khó. Sau khi nắm hết, bạn sẽ giải được khoảng 80–90% bài DP trong các cuộc phỏng vấn.",
        patterns: [
          { id: 70, name: "Climbing Stairs", pattern: "Fibonacci DP" },
          { id: 746, name: "Min Cost Climbing Stairs", pattern: "Fibonacci + Cost" },
          { id: 198, name: "House Robber", pattern: "Linear DP" },
          { id: 213, name: "House Robber II", pattern: "Linear DP + Circle" },
          { id: 740, name: "Delete and Earn", pattern: "House Robber Transform" },
          { id: 53, name: "Maximum Subarray", pattern: "Kadane DP" },
          { id: 152, name: "Maximum Product Subarray", pattern: "DP (max/min state)" },
          { id: 300, name: "Longest Increasing Subsequence", pattern: "1D DP / Binary Search" },
          { id: 322, name: "Coin Change", pattern: "Unbounded Knapsack" },
          { id: 518, name: "Coin Change II", pattern: "Counting DP" },
          { id: 279, name: "Perfect Squares", pattern: "Complete Knapsack" },
          { id: 139, name: "Word Break", pattern: "String DP" },
          { id: 91, name: "Decode Ways", pattern: "String DP" },
          { id: 62, name: "Unique Paths", pattern: "Grid DP" },
          { id: 64, name: "Minimum Path Sum", pattern: "Grid DP" },
          { id: 120, name: "Triangle", pattern: "Grid DP" },
          { id: 931, name: "Minimum Falling Path Sum", pattern: "Matrix DP" },
          { id: 1143, name: "Longest Common Subsequence", pattern: "2D DP" },
          { id: 72, name: "Edit Distance", pattern: "2D DP" },
          { id: 416, name: "Partition Equal Subset Sum", pattern: "0/1 Knapsack" },
        ],
        stages: [
          {
            title: "Giai đoạn 1 — DP cơ bản (phải thuộc)",
            description: "Những bài xây nền tảng. Hiểu DP là gì, công thức truy hồi, lựa chọn Take / Skip.",
            problems: [70, 746, 198, 213, 740],
          },
          {
            title: "Giai đoạn 2 — DP trên mảng",
            description: "Học Kadane và pattern theo dõi cả max/min. LIS dùng 1D DP, sau đó nâng cấp O(n log n).",
            problems: [53, 152, 300],
          },
          {
            title: "Giai đoạn 3 — Knapsack",
            description: "Nhóm cực kỳ quan trọng: Unbounded Knapsack, Counting DP, 0/1 Knapsack kinh điển.",
            problems: [322, 518, 279, 416],
          },
          {
            title: "Giai đoạn 4 — String DP",
            description: "dp[i] = cắt được tới i / số cách giải mã. Trên chuỗi 1 chiều.",
            problems: [139, 91],
          },
          {
            title: "Giai đoạn 5 — Grid DP",
            description: "dp[i][j] phụ thuộc ô trên + ô trái. Bottom-up. Mở rộng cho path 3 hướng.",
            problems: [62, 64, 120, 931],
          },
          {
            title: "Giai đoạn 6 — 2D DP",
            description: "Hai chuỗi/hai chiều: LCS (so khớp), Edit Distance (3 thao tác: insert/delete/replace).",
            problems: [1143, 72],
          },
        ],
        conclusion:
          "Đây là lộ trình phổ biến cho phỏng vấn tại các công ty công nghệ. Sau khi thành thạo 20 bài, bạn sẽ nắm các pattern cốt lõi: Fibonacci, Take/Skip, Kadane, LIS, Knapsack, String DP, Grid DP và 2D DP. Tiếp theo có thể học pattern nâng cao: Bitmask DP, Interval DP, Tree DP, Digit DP.",
      },
      en: {
        intro:
          "If your goal is Software Engineer interviews, these are the 20 most important LeetCode DP problems, ordered from easy to hard. Mastering them lets you solve ~80–90% of DP interview questions.",
        patterns: [
          { id: 70, name: "Climbing Stairs", pattern: "Fibonacci DP" },
          { id: 746, name: "Min Cost Climbing Stairs", pattern: "Fibonacci + Cost" },
          { id: 198, name: "House Robber", pattern: "Linear DP" },
          { id: 213, name: "House Robber II", pattern: "Linear DP + Circle" },
          { id: 740, name: "Delete and Earn", pattern: "House Robber Transform" },
          { id: 53, name: "Maximum Subarray", pattern: "Kadane DP" },
          { id: 152, name: "Maximum Product Subarray", pattern: "DP (max/min state)" },
          { id: 300, name: "Longest Increasing Subsequence", pattern: "1D DP / Binary Search" },
          { id: 322, name: "Coin Change", pattern: "Unbounded Knapsack" },
          { id: 518, name: "Coin Change II", pattern: "Counting DP" },
          { id: 279, name: "Perfect Squares", pattern: "Complete Knapsack" },
          { id: 139, name: "Word Break", pattern: "String DP" },
          { id: 91, name: "Decode Ways", pattern: "String DP" },
          { id: 62, name: "Unique Paths", pattern: "Grid DP" },
          { id: 64, name: "Minimum Path Sum", pattern: "Grid DP" },
          { id: 120, name: "Triangle", pattern: "Grid DP" },
          { id: 931, name: "Minimum Falling Path Sum", pattern: "Matrix DP" },
          { id: 1143, name: "Longest Common Subsequence", pattern: "2D DP" },
          { id: 72, name: "Edit Distance", pattern: "2D DP" },
          { id: 416, name: "Partition Equal Subset Sum", pattern: "0/1 Knapsack" },
        ],
        stages: [
          {
            title: "Stage 1 — DP Basics (must know)",
            description: "Foundation problems. Understand what DP is, recurrence, Take / Skip choice.",
            problems: [70, 746, 198, 213, 740],
          },
          {
            title: "Stage 2 — Array DP",
            description: "Learn Kadane and tracking both max/min state. LIS in 1D, then upgrade to O(n log n).",
            problems: [53, 152, 300],
          },
          {
            title: "Stage 3 — Knapsack",
            description: "Critical group: Unbounded Knapsack, Counting DP, classic 0/1 Knapsack.",
            problems: [322, 518, 279, 416],
          },
          {
            title: "Stage 4 — String DP",
            description: "dp[i] = can split up to i / number of decodings. On 1D string.",
            problems: [139, 91],
          },
          {
            title: "Stage 5 — Grid DP",
            description: "dp[i][j] depends on top + left. Bottom-up. Extend to 3-way paths.",
            problems: [62, 64, 120, 931],
          },
          {
            title: "Stage 6 — 2D DP",
            description: "Two strings/dimensions: LCS (matching), Edit Distance (insert/delete/replace).",
            problems: [1143, 72],
          },
        ],
        conclusion:
          "This is a popular path for tech interviews. After mastering these 20, you'll know the core patterns: Fibonacci, Take/Skip, Kadane, LIS, Knapsack, String DP, Grid DP and 2D DP. Next, advanced patterns: Bitmask DP, Interval DP, Tree DP, Digit DP.",
      },
    },
  },
};

app.get("/api/problems", (req, res) => {
  // Group problems by algorithm category
  const groupsMap = {};
  for (const key of Object.keys(SUPPORTED)) {
    const p = SUPPORTED[key];
    const cat = p.category || { key: "other", vi: "Khác", en: "Other" };
    if (!groupsMap[cat.key]) {
      groupsMap[cat.key] = { key: cat.key, vi: cat.vi, en: cat.en, problems: [] };
    }
    groupsMap[cat.key].problems.push({ id: p.id, title: p.title, titleVi: p.titleVi, difficulty: p.difficulty || null });
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
      error: `Bài ${id} chưa được hỗ trợ. Hiện hỗ trợ: ${Object.keys(SUPPORTED).join(", ")}.`,
    });
  }
  res.json({
    id: problem.id,
    difficulty: problem.difficulty || null,
    slug: problem.slug || null,
    title: problem.title,
    titleVi: problem.titleVi,
    statement: problem.statement,
    defaultInput: problem.defaultInput,
    inputKind: problem.inputKind,
    extraParams: problem.extraParams || [],
    inputLabel: problem.inputLabel || null,
    complexity: problem.complexity || null,
    code: problem.code || [],
    code2: problem.code2 || null,
    codeLabel: problem.codeLabel || null,
    code2Label: problem.code2Label || null,
    approach: problem.approach || null,
  });
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
    } else if (!Number.isInteger(v) || (!p.allowNegative && v < 0)) {
      return res.status(400).json({
        error: `Tham số "${p.key}" phải là số nguyên${p.allowNegative ? "" : " không âm"}.`,
      });
    }
  }

  // String-type problems require s and t to have equal length
  if (problem.inputKind === "string" && typeof params.t === "string" && params.t.length !== input.length) {
    return res.status(400).json({ error: "Chuỗi s và t phải có cùng độ dài." });
  }

  res.json(problem.builder(input, params));
});

app.listen(PORT, () => {
  console.log(`LeetCode Visualizer chạy tại http://localhost:${PORT}`);
});
