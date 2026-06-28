const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/**
 * Sinh các bước cho LeetCode 1846:
 * Maximum Element After Decreasing and Rearranging.
 *
 * Thuật toán:
 *  1. Sắp xếp mảng tăng dần.
 *  2. arr[0] = 1.
 *  3. Với mỗi i: arr[i] = min(arr[i], arr[i-1] + 1).
 *  4. Đáp án là phần tử cuối cùng (lớn nhất).
 */
function buildSteps1846(input) {
  const original = [...input];
  const sorted = [...input].sort((a, b) => a - b);
  const steps = [];

  // Bước khởi tạo: mảng gốc
  steps.push({
    title: "Mảng ban đầu",
    arr: [...original],
    highlight: [],
    note: `Mảng đầu vào: [${original.join(", ")}]. Ta được phép giảm bất kỳ phần tử nào và sắp xếp lại.`,
  });

  // Bước sắp xếp
  steps.push({
    title: "Bước 1: Sắp xếp tăng dần",
    arr: [...sorted],
    highlight: sorted.map((_, i) => i),
    note: `Sắp xếp giúp mỗi phần tử chỉ cần lớn hơn phần tử trước tối đa 1 đơn vị: [${sorted.join(", ")}].`,
  });

  const work = [...sorted];

  // Bước đặt phần tử đầu = 1
  const before0 = work[0];
  work[0] = 1;
  steps.push({
    title: "Bước 2: Ép arr[0] = 1",
    arr: [...work],
    highlight: [0],
    note: `Theo yêu cầu arr[0] phải bằng 1, nên giảm ${before0} → 1.`,
  });

  // Lặp gán arr[i] = min(arr[i], arr[i-1] + 1)
  for (let i = 1; i < work.length; i++) {
    const cur = work[i];
    const cap = work[i - 1] + 1;
    const next = Math.min(cur, cap);
    work[i] = next;

    let note;
    if (next < cur) {
      note = `i=${i}: arr[i]=${cur} > arr[i-1]+1=${cap}, nên giảm xuống ${next} để giữ |arr[i]-arr[i-1]| ≤ 1.`;
    } else {
      note = `i=${i}: arr[i]=${cur} ≤ arr[i-1]+1=${cap}, giữ nguyên ${next}.`;
    }

    steps.push({
      title: `Bước 3.${i}: Xét vị trí i=${i}`,
      arr: [...work],
      highlight: [i - 1, i],
      note,
    });
  }

  const answer = work[work.length - 1];
  steps.push({
    title: "Kết quả",
    arr: [...work],
    highlight: [work.length - 1],
    note: `Phần tử cuối cùng là giá trị lớn nhất có thể đạt được = ${answer}.`,
  });

  return { original, sorted, answer, steps };
}

const SUPPORTED = {
  1846: {
    id: 1846,
    title: "Maximum Element After Decreasing and Rearranging",
    titleVi: "Giá trị lớn nhất sau khi giảm và sắp xếp lại",
    statement:
      "Cho mảng số nguyên dương arr. Bạn được phép: (1) giảm bất kỳ phần tử nào về một số nguyên dương nhỏ hơn; (2) sắp xếp lại mảng tùy ý. Sao cho arr[0] = 1 và |arr[i] - arr[i-1]| ≤ 1 với mọi i. Trả về giá trị lớn nhất có thể của một phần tử trong mảng sau khi thực hiện.",
    defaultInput: [2, 2, 1, 2, 1],
    builder: buildSteps1846,
  },
};

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
    title: problem.title,
    titleVi: problem.titleVi,
    statement: problem.statement,
    defaultInput: problem.defaultInput,
  });
});

app.post("/api/problem/:id/solve", (req, res) => {
  const id = Number(req.params.id);
  const problem = SUPPORTED[id];
  if (!problem) {
    return res.status(404).json({ error: `Bài ${id} chưa được hỗ trợ.` });
  }

  const input = req.body.input;
  if (!Array.isArray(input) || input.length === 0 || !input.every((n) => Number.isInteger(n) && n > 0)) {
    return res.status(400).json({
      error: "Đầu vào phải là mảng các số nguyên dương, ví dụ: 2,2,1,2,1",
    });
  }

  res.json(problem.builder(input));
});

app.listen(PORT, () => {
  console.log(`LeetCode Visualizer chạy tại http://localhost:${PORT}`);
});
