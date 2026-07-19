// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * LeetCode 1295: Find Numbers with Even Number of Digits.
 * Count how many numbers in the array have an even number of digits.
 */
function buildSteps1295(nums) {
  const steps = [];
  let count = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [{ name: "count", value: 0 }],
    note: {
      vi: `Duyệt từng số, đếm số lượng chữ số. Nếu chẵn → count += 1.`,
      en: `Iterate each number, count its digits. If even → count += 1.`,
    },
  });

  const evenIndices = [];
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const digits = String(num).length;
    const isEven = digits % 2 === 0;
    if (isEven) {
      count++;
      evenIndices.push(i);
    }

    steps.push({
      title: { vi: `Xét nums[${i}] = ${num}`, en: `Check nums[${i}] = ${num}` },
      arr: [...nums],
      highlight: [i],
      mark: [...evenIndices],
      codeLines: [4, 5, 6],
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
        { name: "digits", value: digits },
        { name: "even?", value: isEven ? "yes" : "no" },
        { name: "count", value: count },
      ],
      note: {
        vi: `${num} có ${digits} chữ số (${isEven ? "chẵn → count++" : "lẻ → bỏ qua"}). count = ${count}.`,
        en: `${num} has ${digits} digit(s) (${isEven ? "even → count++" : "odd → skip"}). count = ${count}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [...evenIndices],
    final: true,
    codeLines: [7],
    vars: [
      { name: "count", value: count },
      { name: "even numbers", value: evenIndices.map((i) => nums[i]) },
    ],
    note: {
      vi: `Có ${count} số có số lượng chữ số chẵn: [${evenIndices.map((i) => nums[i]).join(", ")}].`,
      en: `${count} number(s) have an even number of digits: [${evenIndices.map((i) => nums[i]).join(", ")}].`,
    },
  });

  return { original: [...nums], answer: count, steps };
}

/**
 * LeetCode 941: Valid Mountain Array.
 * Walk up from the left, walk down to the right.
 * Valid if peak is not at either end.
 */
function buildSteps941(nums) {
  const n = nums.length;
  const steps = [];

  if (n < 3) {
    steps.push({
      title: { vi: "Quá ngắn", en: "Too short" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [4],
      vars: [{ name: "result", value: false }],
      note: { vi: `Mảng cần ít nhất 3 phần tử. Trả về False.`, en: `Array needs at least 3 elements. Return False.` },
    });
    return { original: [...nums], answer: false, steps };
  }

  steps.push({
    title: { vi: "Bắt đầu leo lên", en: "Start climbing up" },
    arr: [...nums],
    highlight: [0],
    mark: [],
    codeLines: [5, 6],
    vars: [{ name: "i", value: 0 }, { name: "phase", value: "climb" }],
    note: { vi: "Bắt đầu từ trái, đi lên bao lâu nums[i] < nums[i+1].", en: "Start from the left, climb while nums[i] < nums[i+1]." },
  });

  let i = 0;
  while (i + 1 < n && nums[i] < nums[i + 1]) {
    i++;
    steps.push({
      title: { vi: `Leo lên: i = ${i}`, en: `Climb: i = ${i}` },
      arr: [...nums],
      highlight: Array.from({ length: i + 1 }, (_, x) => x),
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "phase", value: "climb" },
      ],
      note: {
        vi: `nums[${i - 1}]=${nums[i - 1]} < nums[${i}]=${nums[i]} → tiếp tục leo.`,
        en: `nums[${i - 1}]=${nums[i - 1]} < nums[${i}]=${nums[i]} → keep climbing.`,
      },
    });
  }

  const peak = i;
  if (peak === 0 || peak === n - 1) {
    steps.push({
      title: { vi: "Không có đỉnh hợp lệ", en: "No valid peak" },
      arr: [...nums],
      highlight: [peak],
      mark: [],
      final: true,
      codeLines: [8],
      vars: [{ name: "peak", value: peak }, { name: "result", value: false }],
      note: {
        vi: `Đỉnh ở biên (i=${peak}) → không phải núi. Trả về False.`,
        en: `Peak at boundary (i=${peak}) → not a mountain. Return False.`,
      },
    });
    return { original: [...nums], answer: false, steps };
  }

  steps.push({
    title: { vi: `Đỉnh tại i = ${peak}`, en: `Peak at i = ${peak}` },
    arr: [...nums],
    highlight: [peak],
    mark: [peak],
    codeLines: [8, 9],
    vars: [{ name: "peak", value: peak }, { name: "nums[peak]", value: nums[peak] }],
    note: { vi: `Đỉnh = nums[${peak}] = ${nums[peak]}. Bây giờ đi xuống.`, en: `Peak = nums[${peak}] = ${nums[peak]}. Now descend.` },
  });

  while (i + 1 < n && nums[i] > nums[i + 1]) {
    i++;
    steps.push({
      title: { vi: `Xuống: i = ${i}`, en: `Descend: i = ${i}` },
      arr: [...nums],
      highlight: Array.from({ length: i - peak + 1 }, (_, x) => peak + x),
      mark: [peak],
      codeLines: [9, 10],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "phase", value: "descend" },
      ],
      note: {
        vi: `nums[${i - 1}]=${nums[i - 1]} > nums[${i}]=${nums[i]} → tiếp tục xuống.`,
        en: `nums[${i - 1}]=${nums[i - 1]} > nums[${i}]=${nums[i]} → keep descending.`,
      },
    });
  }

  const valid = i === n - 1;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: valid ? Array.from({ length: n }, (_, x) => x) : [peak],
    final: true,
    codeLines: [11],
    vars: [
      { name: "i", value: i },
      { name: "n-1", value: n - 1 },
      { name: "result", value: valid },
    ],
    note: {
      vi: valid
        ? `Đã xuống tới cuối (i=${i} == n-1). Đây là núi hợp lệ → True.`
        : `Dừng sớm tại i=${i} (chưa tới cuối). Không phải núi → False.`,
      en: valid
        ? `Descended to the end (i=${i} == n-1). Valid mountain → True.`
        : `Stopped early at i=${i} (not at end). Not a mountain → False.`,
    },
  });

  return { original: [...nums], answer: valid, steps };
}

/**
 * LeetCode 1299: Replace Elements with Greatest Element on Right Side.
 * Traverse right to left, track running max. Replace each element with the max to its right.
 * Last element becomes -1.
 */
function buildSteps1299(nums) {
  const n = nums.length;
  const original = [...nums];
  const arr = [...nums];
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [{ name: "rightMax", value: -1 }],
    note: {
      vi: `Duyệt từ phải qua trái. rightMax = -1 (phía sau phần tử cuối không có gì).`,
      en: `Traverse right to left. rightMax = -1 (nothing to the right of the last element).`,
    },
  });

  let rightMax = -1;
  for (let i = n - 1; i >= 0; i--) {
    const cur = arr[i];
    arr[i] = rightMax;
    rightMax = Math.max(rightMax, cur);

    steps.push({
      title: { vi: `i = ${i}: thay ${cur} → ${arr[i]}`, en: `i = ${i}: replace ${cur} → ${arr[i]}` },
      arr: [...arr],
      highlight: [i],
      mark: [],
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "original", value: cur },
        { name: "arr[i]", value: arr[i] },
        { name: "rightMax", value: rightMax },
      ],
      note: {
        vi: `arr[${i}] = rightMax cũ = ${arr[i]}. Cập nhật rightMax = max(${arr[i] === -1 && i === n - 1 ? -1 : rightMax === cur ? cur : rightMax}, ${cur}) = ${rightMax}.`,
        en: `arr[${i}] = old rightMax = ${arr[i]}. Update rightMax = max(prev, ${cur}) = ${rightMax}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [9],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Kết quả: [${arr.join(", ")}].`,
      en: `Result: [${arr.join(", ")}].`,
    },
  });

  return { original, answer: arr, steps };
}

// 1089 moved to two-pointer.js

/**
 * Generate steps for LeetCode 1275: Find Winner on a Tic Tac Toe Game.
 * Simulate each move on a 3x3 board and check for a winner.
 */
function buildSteps1275(input) {
  const movesRaw = String(input).split(",").map((m) => m.trim()).filter((m) => m.length > 0);
  const moves = movesRaw.map((m) => {
    const parts = m.split("-");
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  });
  const steps = [];

  const board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  const boardStr = () => board.map((r) => r.map((c) => c || ".").join("")).join("|");

  function checkWin(player) {
    for (let i = 0; i < 3; i++) {
      if (board[i][0] === player && board[i][1] === player && board[i][2] === player) return true;
      if (board[0][i] === player && board[1][i] === player && board[2][i] === player) return true;
    }
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
    return false;
  }

  // Flatten board to 9-cell array for bar visualization
  const flatBoard = () => {
    const flat = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        flat.push(board[r][c] === "A" ? 1 : board[r][c] === "B" ? -1 : 0);
    return flat;
  };
  const flatLabels = () => {
    const flat = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        flat.push(board[r][c] || ".");
    return flat;
  };

  steps.push({
    title: { vi: "Bàn cờ trống", en: "Empty board" },
    arr: flatBoard(),
    sub: flatLabels(),
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [
      { name: "moves", value: movesRaw.join(", ") },
      { name: "board", value: boardStr() },
    ],
    note: {
      vi: `Bàn 3×3 trống. A đi trước (nước lẻ), B đi sau (nước chẵn).`,
      en: `Empty 3×3 board. A goes first (odd moves), B goes second (even moves).`,
    },
  });

  let winner = null;
  for (let i = 0; i < moves.length; i++) {
    const [r, c] = moves[i];
    const player = i % 2 === 0 ? "A" : "B";
    board[r][c] = player;
    const cellIdx = r * 3 + c;

    const won = checkWin(player);
    if (won) winner = player;

    steps.push({
      title: { vi: `Nước ${i + 1}: ${player} → (${r},${c})${won ? " 🏆" : ""}`, en: `Move ${i + 1}: ${player} → (${r},${c})${won ? " 🏆" : ""}` },
      arr: flatBoard(),
      sub: flatLabels(),
      highlight: [cellIdx],
      mark: won ? flatBoard().map((v, idx) => (v === (player === "A" ? 1 : -1) ? idx : -1)).filter((x) => x >= 0) : [],
      final: won,
      codeLines: [3, 4],
      vars: [
        { name: "move", value: i + 1 },
        { name: "player", value: player },
        { name: "cell", value: `(${r},${c})` },
        { name: "board", value: boardStr() },
        { name: "winner", value: won ? player : "none" },
      ],
      note: {
        vi: won
          ? `${player} đánh ô (${r},${c}) và THẮNG! 🏆`
          : `${player} đánh ô (${r},${c}). Board: ${boardStr()}.`,
        en: won
          ? `${player} plays (${r},${c}) and WINS! 🏆`
          : `${player} plays (${r},${c}). Board: ${boardStr()}.`,
      },
    });

    if (won) {
      return { moves: movesRaw, answer: winner, steps };
    }
  }

  const answer = moves.length === 9 ? "Draw" : "Pending";
  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: flatBoard(),
    sub: flatLabels(),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: answer === "Draw"
        ? "Hết ô mà không ai thắng → Hòa."
        : `Còn ô trống và chưa ai thắng → Pending.`,
      en: answer === "Draw"
        ? "All cells filled with no winner → Draw."
        : `Empty cells remain and no winner → Pending.`,
    },
  });

  return { moves: movesRaw, answer, steps };
}

module.exports = {
  1299: {
    id: 1299,
    difficulty: "easy",
    slug: "replace-elements-with-greatest-element-on-right-side",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Replace Elements with Greatest Element on Right Side", en: "Replace Elements with Greatest Element on Right Side" },
    titleVi: { vi: "Thay bằng phần tử lớn nhất bên phải", en: "Replace with greatest on right" },
    statement: {
      vi: "Cho mảng arr. Thay mỗi phần tử bằng phần tử lớn nhất nằm ở bên phải nó. Phần tử cuối trở thành -1.",
      en: "Given an array arr, replace every element with the greatest element among the elements to its right. The last element becomes -1.",
    },
    defaultInput: [17, 18, 5, 4, 6, 1],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần từ phải. Thay tại chỗ nên O(1) bộ nhớ phụ.",
        en: "Single right-to-left pass. In-place so O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def replaceElements(self, arr):",
      "        n = len(arr)",
      "        right_max = -1",
      "        for i in range(n-1, -1, -1):",
      "            cur = arr[i]",
      "            arr[i] = right_max",
      "            right_max = max(right_max, cur)",
      "        return arr",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int[] ReplaceElements(int[] arr) {",
      "        int n = arr.Length;",
      "        int rightMax = -1;",
      "        for (int i = n - 1; i >= 0; i--) {",
      "            int cur = arr[i];",
      "            arr[i] = rightMax;",
      "            rightMax = Math.Max(rightMax, cur);",
      "        }",
      "        return arr;",
      "    }",
      "}",
    ],
    builder: buildSteps1299,
  },
  941: {
    id: 941,
    difficulty: "easy",
    slug: "valid-mountain-array",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Valid Mountain Array", en: "Valid Mountain Array" },
    titleVi: { vi: "Mảng núi hợp lệ", en: "Check if array forms a mountain" },
    statement: {
      vi: "Cho mảng arr. Trả về True nếu nó là mảng núi: tăng nghiêm ngặt tới một đỉnh, rồi giảm nghiêm ngặt. Cần ít nhất 3 phần tử.",
      en: "Given an array arr, return True if it is a valid mountain array: strictly increasing to a peak, then strictly decreasing. Needs at least 3 elements.",
    },
    defaultInput: [0, 3, 2, 1],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần từ trái qua đỉnh rồi xuống. O(1) bộ nhớ.",
        en: "Single pass: climb up then descend. O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def validMountainArray(self, arr):",
      "        n = len(arr)",
      "        if n < 3: return False",
      "        i = 0",
      "        while i+1 < n and arr[i] < arr[i+1]:",
      "            i += 1",
      "        if i == 0 or i == n-1: return False",
      "        while i+1 < n and arr[i] > arr[i+1]:",
      "            i += 1",
      "        return i == n - 1",
    ],
    builder: buildSteps941,
  },
  1295: {
    id: 1295,
    difficulty: "easy",
    slug: "find-numbers-with-even-number-of-digits",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Find Numbers with Even Number of Digits", en: "Find Numbers with Even Number of Digits" },
    titleVi: { vi: "Đếm số có chữ số chẵn", en: "Count numbers with even digit count" },
    statement: {
      vi: "Cho mảng nums chứa các số nguyên. Trả về số lượng phần tử có số lượng chữ số chẵn.",
      en: "Given an array nums of integers, return how many of them contain an even number of digits.",
    },
    defaultInput: [12, 345, 2, 6, 7896],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần, đếm chữ số bằng log hoặc chuỗi O(1). Tổng O(n).",
        en: "Single pass, digit count via log or string is O(1). Total O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def findNumbers(self, nums):",
      "        count = 0",
      "        for num in nums:",
      "            if len(str(num)) % 2 == 0:",
      "                count += 1",
      "        return count",
    ],
    builder: buildSteps1295,
  },
  1275: {
    id: 1275,
    difficulty: "easy",
    slug: "find-winner-on-a-tic-tac-toe-game",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Find Winner on a Tic Tac Toe Game", en: "Find Winner on a Tic Tac Toe Game" },
    titleVi: { vi: "Tìm người thắng Tic-Tac-Toe", en: "Find Tic-Tac-Toe winner" },
    statement: {
      vi:
        "Cho danh sách nước đi trên bàn cờ 3x3. Nước đi lẻ là của A, nước chẵn là của B. " +
        "Trả về 'A' nếu A thắng, 'B' nếu B thắng, 'Draw' nếu hòa (hết ô), hoặc 'Pending' nếu chưa kết thúc.",
      en:
        "Given a list of moves on a 3x3 board. Odd moves belong to A, even moves to B. " +
        "Return 'A' if A wins, 'B' if B wins, 'Draw' if it's a draw (all cells filled), or 'Pending' if game is not over.",
    },
    defaultInput: "0-0,2-0,1-1,2-1,2-2",
    inputKind: "string",
    inputLabel: { vi: "Nước đi (row-col, cách bởi dấu phẩy)", en: "Moves (row-col, comma separated)" },
    extraParams: [],
    complexity: {
      time: "O(M)",
      space: "O(1)",
      note: {
        vi: "Duyệt M nước đi, mỗi nước kiểm tra thắng O(1) (bàn cố định 3×3). Bộ nhớ O(1) cho bàn 3×3.",
        en: "Iterate M moves, each check for win is O(1) (fixed 3×3 board). Memory O(1) for the 3×3 board.",
      },
    },
    code: [
      "class Solution:",
      "    def tictactoe(self, moves):",
      "        board = [['' for _ in range(3)] for _ in range(3)]",
      "        for i, (r, c) in enumerate(moves):",
      "            board[r][c] = 'A' if i % 2 == 0 else 'B'",
      "        # Check rows, cols, diagonals",
      "        for player in ['A', 'B']:",
      "            for i in range(3):",
      "                if all(board[i][j]==player for j in range(3)):",
      "                    return player",
      "                if all(board[j][i]==player for j in range(3)):",
      "                    return player",
      "            if all(board[i][i]==player for i in range(3)):",
      "                return player",
      "            if all(board[i][2-i]==player for i in range(3)):",
      "                return player",
      "        return 'Draw' if len(moves)==9 else 'Pending'",
    ],
    builder: buildSteps1275,
  },
};
