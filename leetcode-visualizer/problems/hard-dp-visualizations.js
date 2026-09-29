"use strict";

// Focused hard dynamic-programming visualizations for LeetCode 920, 964, and 1416.

const MOD = 1_000_000_007;
const bi = (vi, en) => ({ vi, en });
const clonePhases = (phases) => phases.map((phase) => ({ ...phase }));

function parseUnsignedInteger(value, name) {
  let parsed = NaN;
  if (typeof value === "number") {
    parsed = value;
  } else if (typeof value === "string" && /^(0|[1-9]\d*)$/.test(value.trim())) {
    parsed = Number(value.trim());
  }
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new TypeError(`${name} must be a non-negative safe integer / phải là số nguyên không âm an toàn.`);
  }
  return parsed;
}

function parseSingleIntegerInput(input, name) {
  if (!Array.isArray(input) || input.length !== 1 || !Number.isSafeInteger(input[0])) {
    throw new TypeError(`${name} input must be an array containing exactly one safe integer / input phải là mảng chứa đúng một số nguyên an toàn.`);
  }
  return input[0];
}

function recentRowIndices(lastRow, limit) {
  if (lastRow + 1 <= limit) {
    return Array.from({ length: lastRow + 1 }, (_, index) => index);
  }
  const rows = [0];
  for (let row = Math.max(1, lastRow - (limit - 2)); row <= lastRow; row++) rows.push(row);
  return rows;
}

// -----------------------------------------------------------------------------
// 920. Number of Music Playlists
// -----------------------------------------------------------------------------

const PLAYLIST_920_LIMITS = Object.freeze({
  minN: 1,
  maxN: 12,
  maxGoal: 24,
  maxTraceSteps: 220,
  maxTableRows: 8,
});

const PLAYLIST_920_PHASES = Object.freeze([
  bi("Khởi tạo", "Initialize"),
  bi("Chọn độ dài", "Select playlist length"),
  bi("Thêm bài mới", "Add a new song"),
  bi("Phát lại bài cũ", "Replay an eligible song"),
  bi("Ghi ô DP", "Write the DP cell"),
  bi("Kết quả", "Result"),
]);

const PLAYLIST_920_CODE = Object.freeze([
  "class Solution:",
  "    def numMusicPlaylists(self, n: int, goal: int, k: int) -> int:",
  "        MOD = 10**9 + 7",
  "        dp = [[0] * (n + 1) for _ in range(goal + 1)]",
  "        dp[0][0] = 1",
  "        for length in range(1, goal + 1):",
  "            for used in range(1, min(n, length) + 1):",
  "                add_new = dp[length - 1][used - 1] * (n - used + 1)",
  "                replay = dp[length - 1][used] * max(used - k, 0)",
  "                dp[length][used] = (add_new + replay) % MOD",
  "        return dp[goal][n]",
]);

function parseMusicPlaylists920Input(input, params = {}) {
  const n = parseSingleIntegerInput(input, "Number of Music Playlists n");
  const goal = parseUnsignedInteger(params.goal, "goal");
  const k = parseUnsignedInteger(params.k, "k");

  if (n < PLAYLIST_920_LIMITS.minN || n > PLAYLIST_920_LIMITS.maxN) {
    throw new RangeError(`n must be in [${PLAYLIST_920_LIMITS.minN}, ${PLAYLIST_920_LIMITS.maxN}] for this visualization.`);
  }
  if (goal < n || goal > PLAYLIST_920_LIMITS.maxGoal) {
    throw new RangeError(`goal must be in [n, ${PLAYLIST_920_LIMITS.maxGoal}] for this visualization.`);
  }
  if (k >= n) {
    throw new RangeError("k must satisfy 0 <= k < n / k phải thỏa 0 <= k < n.");
  }
  return { n, goal, k };
}

function buildPlaylist920Table(dp, n, length, used, written) {
  const rowIndices = recentRowIndices(length, PLAYLIST_920_LIMITS.maxTableRows);
  return {
    title: bi(
      `Bảng dp[độ dài][số bài khác nhau] đến độ dài ${length}`,
      `dp[length][unique songs] through length ${length}`,
    ),
    columns: Array.from({ length: n + 1 }, (_, index) => bi(`u=${index}`, `u=${index}`)),
    rows: rowIndices.map((row) => ({
      label: bi(`độ dài ${row}`, `length ${row}`),
      state: row === length ? "active" : "computed",
      cells: Array.from({ length: n + 1 }, (_, column) => {
        let state = "pending";
        if (row === 0 && column === 0) state = "base";
        else if (column > Math.min(n, row)) state = "invalid";
        else if (row < length) state = "computed";
        else if (used === null) state = column === 0 ? "computed" : "pending";
        else if (column < used) state = "computed";
        else if (column === used) state = written ? "updated" : "active";
        return { value: dp[row][column], state };
      }),
    })),
  };
}

function buildSteps920(input, params = {}) {
  const { n, goal, k } = parseMusicPlaylists920Input(input, params);
  const dp = Array.from({ length: goal + 1 }, () => Array(n + 1).fill(0));
  dp[0][0] = 1;

  const steps = [];
  let traceTruncated = false;

  function emit({
    phaseIndex,
    title,
    note,
    action,
    formula,
    codeLines,
    length,
    used = null,
    addNew = 0,
    replay = 0,
    newChoices = 0,
    replayChoices = 0,
    written = false,
    final = false,
  }) {
    if (steps.length >= PLAYLIST_920_LIMITS.maxTraceSteps && !final) {
      traceTruncated = true;
      return;
    }

    const row = [...dp[length]];
    const highlight = Number.isInteger(used) ? [used] : [];
    const mark = [];
    for (let index = 0; index <= n; index++) {
      const isComputed = final
        || (used === null ? index === 0 : index < used || (written && index === used));
      if (isComputed) mark.push(index);
    }
    const currentValue = Number.isInteger(used) ? dp[length][used] : 0;
    const answer = final ? dp[goal][n] : null;

    steps.push({
      title,
      note,
      arr: row,
      sub: row.map((_, index) => `u=${index}`),
      highlight,
      mark,
      final,
      codeLines: [...codeLines],
      vars: [
        { name: "n", value: n },
        { name: "goal", value: goal },
        { name: "k", value: k },
        { name: "length", value: length },
        { name: "used", value: used === null ? "—" : used },
        { name: "add_new", value: addNew },
        { name: "replay", value: replay },
        { name: "cell", value: currentValue },
      ],
      hardProblemView: {
        problemId: 920,
        phaseIndex,
        phases: clonePhases(PLAYLIST_920_PHASES),
        phase: { ...PLAYLIST_920_PHASES[phaseIndex] },
        action,
        formula,
        metrics: [
          { label: bi("Độ dài", "Length"), value: length, state: "active" },
          { label: bi("Bài đã dùng", "Unique used"), value: used === null ? "—" : used },
          { label: bi("Chọn bài mới", "New choices"), value: newChoices, state: "candidate" },
          { label: bi("Chọn phát lại", "Replay choices"), value: replayChoices, state: "candidate" },
          { label: bi("Đóng góp mới", "New contribution"), value: addNew },
          { label: bi("Đóng góp phát lại", "Replay contribution"), value: replay },
        ],
        table: buildPlaylist920Table(dp, n, length, used, written),
        legend: [
          { label: bi("Ô đang xét", "Active cell"), state: "active" },
          { label: bi("Ô vừa cập nhật", "Updated cell"), state: "updated" },
          { label: bi("Ô đã tính", "Computed cell"), state: "computed" },
          { label: bi("Ngoài miền hợp lệ", "Invalid state"), state: "invalid" },
        ],
        answer,
        traceTruncated,
      },
    });
  }

  emit({
    phaseIndex: 0,
    title: bi("Khởi tạo dp[0][0] = 1", "Initialize dp[0][0] = 1"),
    note: bi(
      "Có đúng một playlist rỗng dùng 0 bài khác nhau; mọi trạng thái khác bắt đầu bằng 0.",
      "There is exactly one empty playlist using zero distinct songs; every other state starts at zero.",
    ),
    action: bi("Tạo bảng và đặt trạng thái gốc.", "Allocate the table and seed the base state."),
    formula: bi("dp[0][0] = 1", "dp[0][0] = 1"),
    codeLines: [3, 4, 5],
    length: 0,
    written: true,
  });

  for (let length = 1; length <= goal; length++) {
    emit({
      phaseIndex: 1,
      title: bi(`Xây playlist độ dài ${length}`, `Build playlists of length ${length}`),
      note: bi(
        `Chỉ có thể dùng từ 1 đến min(n, ${length}) bài khác nhau ở độ dài này.`,
        `This length can use from 1 through min(n, ${length}) distinct songs.`,
      ),
      action: bi("Bắt đầu một hàng DP mới.", "Start a new DP row."),
      formula: bi(`1 <= used <= min(${n}, ${length})`, `1 <= used <= min(${n}, ${length})`),
      codeLines: [6, 7],
      length,
    });

    const upperUsed = Math.min(n, length);
    for (let used = 1; used <= upperUsed; used++) {
      const newChoices = n - used + 1;
      const addNew = (dp[length - 1][used - 1] * newChoices) % MOD;
      emit({
        phaseIndex: 2,
        title: bi(
          `Thêm bài mới vào dp[${length}][${used}]`,
          `Add a new song to dp[${length}][${used}]`,
        ),
        note: bi(
          `Playlist nguồn đã dùng ${used - 1} bài; còn ${newChoices} bài chưa xuất hiện để chọn.`,
          `The source playlist uses ${used - 1} songs, leaving ${newChoices} never-played songs to choose from.`,
        ),
        action: bi("Tính chuyển trạng thái bằng bài chưa dùng.", "Compute the never-used-song transition."),
        formula: bi(
          `${dp[length - 1][used - 1]} × ${newChoices} = ${addNew} (mod M)`,
          `${dp[length - 1][used - 1]} × ${newChoices} = ${addNew} (mod M)`,
        ),
        codeLines: [8],
        length,
        used,
        addNew,
        newChoices,
      });

      const replayChoices = Math.max(used - k, 0);
      const replay = (dp[length - 1][used] * replayChoices) % MOD;
      emit({
        phaseIndex: 3,
        title: bi(
          `Xét phát lại cho dp[${length}][${used}]`,
          `Consider a replay for dp[${length}][${used}]`,
        ),
        note: bi(
          `Trong ${used} bài đã xuất hiện, ${k} bài gần nhất bị khóa; còn ${replayChoices} lựa chọn hợp lệ.`,
          `Among ${used} previously used songs, the most recent ${k} are blocked, leaving ${replayChoices} eligible choices.`,
        ),
        action: bi("Tính chuyển trạng thái phát lại.", "Compute the replay transition."),
        formula: bi(
          `${dp[length - 1][used]} × max(${used} − ${k}, 0) = ${replay} (mod M)`,
          `${dp[length - 1][used]} × max(${used} − ${k}, 0) = ${replay} (mod M)`,
        ),
        codeLines: [9],
        length,
        used,
        addNew,
        replay,
        newChoices,
        replayChoices,
      });

      dp[length][used] = (addNew + replay) % MOD;
      emit({
        phaseIndex: 4,
        title: bi(
          `Ghi dp[${length}][${used}] = ${dp[length][used]}`,
          `Write dp[${length}][${used}] = ${dp[length][used]}`,
        ),
        note: bi(
          "Hai trường hợp rời nhau: bài cuối là bài mới hoặc là một bài cũ đủ xa trong lịch sử.",
          "The two cases are disjoint: the last song is either new or an old song far enough back in history.",
        ),
        action: bi("Cộng hai đóng góp theo modulo.", "Add both contributions modulo M."),
        formula: bi(
          `(${addNew} + ${replay}) mod ${MOD} = ${dp[length][used]}`,
          `(${addNew} + ${replay}) mod ${MOD} = ${dp[length][used]}`,
        ),
        codeLines: [10],
        length,
        used,
        addNew,
        replay,
        newChoices,
        replayChoices,
        written: true,
      });
    }
  }

  const answer = dp[goal][n];
  emit({
    phaseIndex: 5,
    title: bi(`Đáp án = ${answer}`, `Answer = ${answer}`),
    note: traceTruncated
      ? bi(
        "Trace đã được rút gọn để giữ giao diện nhẹ, nhưng toàn bộ các hàng và ô DP vẫn được tính trước khi lấy đáp án.",
        "The trace was shortened to keep the UI responsive, but every DP row and cell was still computed before reading the answer.",
      )
      : bi(
        `Ô cuối đếm playlist dài ${goal} đã dùng đủ cả ${n} bài.`,
        `The final cell counts length-${goal} playlists that use all ${n} songs.`,
      ),
    action: bi("Đọc ô đích dp[goal][n].", "Read the target cell dp[goal][n]."),
    formula: bi(`dp[${goal}][${n}] = ${answer}`, `dp[${goal}][${n}] = ${answer}`),
    codeLines: [11],
    length: goal,
    used: n,
    written: true,
    final: true,
  });

  return { original: [n], answer, steps };
}

// -----------------------------------------------------------------------------
// 964. Least Operators to Express Number
// -----------------------------------------------------------------------------

const LEAST_OPS_964_LIMITS = Object.freeze({
  minX: 2,
  maxX: 100,
  minTarget: 1,
  maxTarget: 200_000_000,
  maxTraceSteps: 240,
  maxMemoItems: 12,
  maxStackItems: 12,
  maxDigitColumns: 32,
});

const LEAST_OPS_964_PHASES = Object.freeze([
  bi("Khởi tạo", "Initialize"),
  bi("Mở trạng thái", "Open a state"),
  bi("Tách chữ số cơ số x", "Split a base-x digit"),
  bi("Làm tròn xuống", "Evaluate rounding down"),
  bi("Nhớ sang hàng", "Evaluate carry"),
  bi("Ghi nhớ và trả về", "Memoize and return"),
  bi("Kết quả", "Result"),
]);

const LEAST_OPS_964_CODE = Object.freeze([
  "from functools import cache",
  "",
  "class Solution:",
  "    def leastOpsExpressTarget(self, x: int, target: int) -> int:",
  "        @cache",
  "        def solve(position: int, remaining: int) -> int:",
  "            if remaining == 0:",
  "                return 0",
  "            unit_cost = 2 if position == 0 else position",
  "            if remaining == 1:",
  "                return unit_cost",
  "            quotient, remainder = divmod(remaining, x)",
  "            use_low = remainder * unit_cost + solve(position + 1, quotient)",
  "            if remainder == 0:",
  "                return use_low",
  "            use_carry = (x - remainder) * unit_cost + solve(position + 1, quotient + 1)",
  "            return min(use_low, use_carry)",
  "        return solve(0, target) - 1",
]);

function parseLeastOperators964Input(input, params = {}) {
  const x = parseSingleIntegerInput(input, "Least Operators x");
  const target = parseUnsignedInteger(params.target, "target");
  if (x < LEAST_OPS_964_LIMITS.minX || x > LEAST_OPS_964_LIMITS.maxX) {
    throw new RangeError(`x must be in [${LEAST_OPS_964_LIMITS.minX}, ${LEAST_OPS_964_LIMITS.maxX}].`);
  }
  if (target < LEAST_OPS_964_LIMITS.minTarget || target > LEAST_OPS_964_LIMITS.maxTarget) {
    throw new RangeError(`target must be in [${LEAST_OPS_964_LIMITS.minTarget}, ${LEAST_OPS_964_LIMITS.maxTarget}].`);
  }
  return { x, target };
}

function baseXDigits(value, x) {
  const digits = [];
  let remaining = value;
  while (remaining > 0) {
    digits.push(remaining % x);
    remaining = Math.floor(remaining / x);
  }
  return digits.length ? digits : [0];
}

function buildSteps964(input, params = {}) {
  const { x, target } = parseLeastOperators964Input(input, params);
  const originalDigits = baseXDigits(target, x);
  const memo = new Map();
  const memoDetails = new Map();
  const stack = [];
  const steps = [];
  let traceTruncated = false;
  let finalAnswer = null;

  function emit({
    phaseIndex,
    title,
    note,
    action,
    formula,
    codeLines,
    position = 0,
    remaining = target,
    unitCost = null,
    quotient = null,
    remainder = null,
    lowCost = null,
    carryCost = null,
    choice = null,
    final = false,
  }) {
    if (steps.length >= LEAST_OPS_964_LIMITS.maxTraceSteps && !final) {
      traceTruncated = true;
      return;
    }

    const digitCount = Math.min(
      LEAST_OPS_964_LIMITS.maxDigitColumns,
      Math.max(originalDigits.length, position + 1, 1),
    );
    const digits = Array.from({ length: digitCount }, (_, index) => originalDigits[index] || 0);
    const highlight = position < digitCount ? [position] : [];
    const memoPositions = new Set(
      [...memo.keys()].map((key) => Number(key.split(":")[0])).filter(Number.isSafeInteger),
    );
    const mark = [];
    for (let index = 0; index < digitCount; index++) {
      if (final || (memoPositions.has(index) && index !== position)) mark.push(index);
    }

    const memoItems = [...memo.entries()].slice(-LEAST_OPS_964_LIMITS.maxMemoItems).map(([key, value]) => ({
      label: bi(`F(${key.replace(":", ", ")})`, `F(${key.replace(":", ", ")})`),
      value,
      state: key === `${position}:${remaining}` ? "active" : "memo",
    }));
    if (!memoItems.length) {
      memoItems.push({ label: bi("Chưa có trạng thái", "No cached state yet"), value: "—", state: "pending" });
    }

    const lowState = choice === "low" || choice === "exact"
      ? "chosen"
      : lowCost === null ? "pending" : "candidate";
    const carryState = choice === "carry"
      ? "chosen"
      : carryCost === null ? "pending" : "candidate";

    steps.push({
      title,
      note,
      arr: digits,
      sub: digits.map((_, index) => `x^${index}`),
      highlight,
      mark,
      final,
      codeLines: [...codeLines],
      vars: [
        { name: "x", value: x },
        { name: "target", value: target },
        { name: "position", value: position },
        { name: "remaining", value: remaining },
        { name: "cost(position)", value: unitCost === null ? "—" : unitCost },
        { name: "quotient", value: quotient === null ? "—" : quotient },
        { name: "remainder", value: remainder === null ? "—" : remainder },
        { name: "memo size", value: memo.size },
      ],
      hardProblemView: {
        problemId: 964,
        phaseIndex,
        phases: clonePhases(LEAST_OPS_964_PHASES),
        phase: { ...LEAST_OPS_964_PHASES[phaseIndex] },
        action,
        formula,
        metrics: [
          { label: bi("Vị trí chữ số", "Digit position"), value: position, state: "active" },
          { label: bi("Phần còn lại", "Remaining"), value: remaining },
          { label: bi("Chi phí một đơn vị", "Unit cost"), value: unitCost === null ? "—" : unitCost },
          { label: bi("Số trạng thái memo", "Memo states"), value: memo.size, state: "memo" },
          { label: bi("Độ sâu đệ quy", "Recursion depth"), value: stack.length },
          { label: bi("Đáp án", "Answer"), value: finalAnswer === null ? "—" : finalAnswer, state: final ? "answer" : "pending" },
        ],
        queue: stack.slice(-LEAST_OPS_964_LIMITS.maxStackItems).map((frame, index) => ({
          label: `F(${frame.position}, ${frame.remaining})`,
          sub: bi(`khung ${Math.max(0, stack.length - LEAST_OPS_964_LIMITS.maxStackItems) + index + 1}`, `frame ${Math.max(0, stack.length - LEAST_OPS_964_LIMITS.maxStackItems) + index + 1}`),
          state: index === Math.min(stack.length, LEAST_OPS_964_LIMITS.maxStackItems) - 1 ? "active" : "pending",
        })),
        groups: [
          {
            title: bi("Chữ số cơ số x hiện tại", "Current base-x digit"),
            items: [
              { label: bi("Vị trí", "Position"), value: position, state: "active" },
              { label: bi("Lũy thừa", "Power"), value: `x^${position}` },
              { label: bi("Thương", "Quotient"), value: quotient === null ? "—" : quotient },
              { label: bi("Số dư", "Remainder"), value: remainder === null ? "—" : remainder },
            ],
          },
          {
            title: bi("Hai ứng viên", "Two candidates"),
            items: [
              { label: bi("Dùng số dư dương", "Use positive remainder"), value: lowCost === null ? "—" : lowCost, state: lowState },
              { label: bi("Bù lên rồi nhớ 1", "Complement and carry 1"), value: carryCost === null ? "—" : carryCost, state: carryState },
            ],
          },
          { title: bi("Bộ nhớ đã giới hạn hiển thị", "Bounded memo display"), items: memoItems },
        ],
        sequence: digits.map((value, index) => ({
          label: `x^${index}`,
          value,
          state: index === position ? "active" : "digit",
        })),
        legend: [
          { label: bi("Trạng thái đang tính", "Active state"), state: "active" },
          { label: bi("Ứng viên", "Candidate"), state: "candidate" },
          { label: bi("Ứng viên được chọn", "Chosen candidate"), state: "chosen" },
          { label: bi("Giá trị đã memo", "Memoized value"), state: "memo" },
        ],
        answer: final ? finalAnswer : null,
        traceTruncated,
      },
    });
  }

  emit({
    phaseIndex: 0,
    title: bi("Khởi tạo digit DP có memo", "Initialize memoized digit DP"),
    note: bi(
      "F(i, remaining) là chi phí số hạng có dấu từ lũy thừa x^i trở lên; cache bảo đảm mỗi trạng thái chỉ tính một lần.",
      "F(i, remaining) is the signed-term cost from power x^i upward; caching evaluates each state only once.",
    ),
    action: bi("Tạo hàm solve được memo hóa.", "Create the memoized solve function."),
    formula: bi("answer = F(0, target) − 1", "answer = F(0, target) − 1"),
    codeLines: [5, 6],
  });

  function solve(position, remaining) {
    const key = `${position}:${remaining}`;
    stack.push({ position, remaining });

    if (memo.has(key)) {
      const cached = memo.get(key);
      const details = memoDetails.get(key) || {};
      emit({
        phaseIndex: 5,
        title: bi(`Dùng memo F(${position}, ${remaining}) = ${cached}`, `Reuse memo F(${position}, ${remaining}) = ${cached}`),
        note: bi("Trạng thái này đã được giải; không mở lại các nhánh con.", "This state is already solved, so its children are not reopened."),
        action: bi("Đọc kết quả từ cache.", "Read the cached result."),
        formula: bi(`F(${position}, ${remaining}) = ${cached}`, `F(${position}, ${remaining}) = ${cached}`),
        codeLines: [5],
        position,
        remaining,
        ...details,
      });
      stack.pop();
      return cached;
    }

    emit({
      phaseIndex: 1,
      title: bi(`Mở F(${position}, ${remaining})`, `Open F(${position}, ${remaining})`),
      note: bi(
        `Ta biểu diễn phần còn lại ${remaining} bằng các chữ số có dấu từ x^${position}.`,
        `Represent remaining value ${remaining} with signed digits starting at x^${position}.`,
      ),
      action: bi("Mở một trạng thái đệ quy mới.", "Open a new recursive state."),
      formula: bi(`F(${position}, ${remaining})`, `F(${position}, ${remaining})`),
      codeLines: [6],
      position,
      remaining,
    });

    if (remaining === 0) {
      memo.set(key, 0);
      memoDetails.set(key, { unitCost: null, quotient: null, remainder: null, lowCost: 0, carryCost: null, choice: "zero" });
      emit({
        phaseIndex: 5,
        title: bi("Phần còn lại bằng 0", "Remaining value is zero"),
        note: bi("Không cần thêm số hạng hay toán tử nào.", "No additional term or operator is needed."),
        action: bi("Ghi nhớ trạng thái gốc bằng 0.", "Memoize the zero base case."),
        formula: bi(`F(${position}, 0) = 0`, `F(${position}, 0) = 0`),
        codeLines: [7, 8],
        position,
        remaining,
        lowCost: 0,
        choice: "zero",
      });
      stack.pop();
      return 0;
    }

    const unitCost = position === 0 ? 2 : position;
    if (remaining === 1) {
      memo.set(key, unitCost);
      memoDetails.set(key, { unitCost, quotient: null, remainder: null, lowCost: unitCost, carryCost: null, choice: "low" });
      emit({
        phaseIndex: 5,
        title: bi(
          `Trạng thái cuối F(${position}, 1) = ${unitCost}`,
          `Terminal state F(${position}, 1) = ${unitCost}`,
        ),
        note: position === 0
          ? bi("x^0 được viết bằng x/x nên cost(0)=2 trong mô hình số hạng có dấu.", "x^0 is written as x/x, so cost(0)=2 in the signed-term model.")
          : bi(`Một x^${position} cần ${position} bản sao x trong tích, nên cost(${position})=${position}.`, `One x^${position} term uses ${position} copies of x in a product, so cost(${position})=${position}.`),
        action: bi("Áp dụng điều kiện dừng remaining = 1.", "Apply the remaining = 1 terminal case."),
        formula: bi(`cost(${position}) = ${unitCost}`, `cost(${position}) = ${unitCost}`),
        codeLines: [9, 10, 11],
        position,
        remaining,
        unitCost,
        lowCost: unitCost,
        choice: "low",
      });
      stack.pop();
      return unitCost;
    }

    const quotient = Math.floor(remaining / x);
    const remainder = remaining % x;
    emit({
      phaseIndex: 2,
      title: bi(
        `${remaining} = ${quotient} × ${x} + ${remainder}`,
        `${remaining} = ${quotient} × ${x} + ${remainder}`,
      ),
      note: bi(
        `Số dư ${remainder} là chữ số tại x^${position}; thương ${quotient} chuyển sang vị trí tiếp theo.`,
        `Remainder ${remainder} is the digit at x^${position}; quotient ${quotient} moves to the next position.`,
      ),
      action: bi("Tách thương và số dư trong cơ số x.", "Split quotient and remainder in base x."),
      formula: bi(
        `${remaining} divmod ${x} = (${quotient}, ${remainder})`,
        `${remaining} divmod ${x} = (${quotient}, ${remainder})`,
      ),
      codeLines: [9, 12],
      position,
      remaining,
      unitCost,
      quotient,
      remainder,
    });

    const lowChild = solve(position + 1, quotient);
    const lowCost = remainder * unitCost + lowChild;
    emit({
      phaseIndex: 3,
      title: bi(`Ứng viên xuống = ${lowCost}`, `Round-down candidate = ${lowCost}`),
      note: bi(
        `Dùng ${remainder} số hạng +x^${position}, rồi biểu diễn thương ${quotient} ở vị trí kế tiếp.`,
        `Use ${remainder} positive x^${position} terms, then represent quotient ${quotient} at the next position.`,
      ),
      action: bi("Tính ứng viên dùng trực tiếp số dư.", "Evaluate the direct-remainder candidate."),
      formula: bi(
        `${remainder} × ${unitCost} + F(${position + 1}, ${quotient}) = ${lowCost}`,
        `${remainder} × ${unitCost} + F(${position + 1}, ${quotient}) = ${lowCost}`,
      ),
      codeLines: [13],
      position,
      remaining,
      unitCost,
      quotient,
      remainder,
      lowCost,
    });

    if (remainder === 0) {
      memo.set(key, lowCost);
      memoDetails.set(key, { unitCost, quotient, remainder, lowCost, carryCost: null, choice: "exact" });
      emit({
        phaseIndex: 5,
        title: bi(`Chia hết: F(${position}, ${remaining}) = ${lowCost}`, `Exact digit: F(${position}, ${remaining}) = ${lowCost}`),
        note: bi("Số dư bằng 0 nên nhánh bù và nhớ chỉ thêm chi phí; nhánh chính xác được ghi nhớ ngay.", "The remainder is zero, so complementing and carrying only adds cost; memoize the exact branch immediately."),
        action: bi("Ghi nhớ ứng viên chính xác.", "Memoize the exact candidate."),
        formula: bi(`remainder = 0 ⇒ F = ${lowCost}`, `remainder = 0 ⇒ F = ${lowCost}`),
        codeLines: [14, 15],
        position,
        remaining,
        unitCost,
        quotient,
        remainder,
        lowCost,
        choice: "exact",
      });
      stack.pop();
      return lowCost;
    }

    const carryChild = solve(position + 1, quotient + 1);
    const carryCost = (x - remainder) * unitCost + carryChild;
    emit({
      phaseIndex: 4,
      title: bi(`Ứng viên nhớ = ${carryCost}`, `Carry candidate = ${carryCost}`),
      note: bi(
        `Dùng ${x - remainder} số hạng −x^${position}; chúng bù chữ số hiện tại lên ${x} và tạo một đơn vị nhớ.`,
        `Use ${x - remainder} negative x^${position} terms; they complement this digit to ${x} and create one carry.`,
      ),
      action: bi("Tính ứng viên bù chữ số và nhớ 1.", "Evaluate complementing the digit and carrying 1."),
      formula: bi(
        `${x - remainder} × ${unitCost} + F(${position + 1}, ${quotient + 1}) = ${carryCost}`,
        `${x - remainder} × ${unitCost} + F(${position + 1}, ${quotient + 1}) = ${carryCost}`,
      ),
      codeLines: [16],
      position,
      remaining,
      unitCost,
      quotient,
      remainder,
      lowCost,
      carryCost,
    });

    const useCarry = carryCost < lowCost;
    const best = useCarry ? carryCost : lowCost;
    const choice = useCarry ? "carry" : "low";
    memo.set(key, best);
    memoDetails.set(key, { unitCost, quotient, remainder, lowCost, carryCost, choice });
    emit({
      phaseIndex: 5,
      title: bi(
        `Chọn ${useCarry ? "nhớ" : "xuống"}: chi phí ${best}`,
        `Choose ${useCarry ? "carry" : "round down"}: cost ${best}`,
      ),
      note: bi(
        `So sánh ${lowCost} và ${carryCost}; lưu giá trị nhỏ hơn cho F(${position}, ${remaining}).`,
        `Compare ${lowCost} with ${carryCost}; cache the smaller value for F(${position}, ${remaining}).`,
      ),
      action: bi("Chọn ứng viên tối ưu và ghi memo.", "Choose the optimal candidate and memoize it."),
      formula: bi(
        `F(${position}, ${remaining}) = min(${lowCost}, ${carryCost}) = ${best}`,
        `F(${position}, ${remaining}) = min(${lowCost}, ${carryCost}) = ${best}`,
      ),
      codeLines: [17],
      position,
      remaining,
      unitCost,
      quotient,
      remainder,
      lowCost,
      carryCost,
      choice,
    });
    stack.pop();
    return best;
  }

  const signedTermCost = solve(0, target);
  finalAnswer = signedTermCost - 1;
  emit({
    phaseIndex: 6,
    title: bi(`Đáp án = ${finalAnswer}`, `Answer = ${finalAnswer}`),
    note: traceTruncated
      ? bi(
        "Trace đệ quy đã được rút gọn, nhưng mọi trạng thái memo cần thiết vẫn được tính. Trừ 1 vì số hạng đầu tiên không cần dấu +/− đứng trước.",
        "The recursive trace was shortened, but every required memo state was still computed. Subtract one because the first term needs no leading +/− operator.",
      )
      : bi(
        "F đếm một dấu trước mỗi số hạng; số hạng đầu tiên không cần dấu đó, nên tổng cuối cùng trừ 1.",
        "F counts a sign before every term; the first term needs no such sign, so the final total subtracts one.",
      ),
    action: bi("Bỏ dấu của số hạng đầu tiên.", "Remove the leading sign of the first term."),
    formula: bi(`${signedTermCost} − 1 = ${finalAnswer}`, `${signedTermCost} − 1 = ${finalAnswer}`),
    codeLines: [18],
    position: 0,
    remaining: target,
    unitCost: 2,
    lowCost: signedTermCost,
    choice: "low",
    final: true,
  });

  return { original: [x], answer: finalAnswer, steps };
}

// -----------------------------------------------------------------------------
// 1416. Restore The Array
// -----------------------------------------------------------------------------

const RESTORE_1416_LIMITS = Object.freeze({
  maxLength: 120,
  minK: 1,
  maxK: 1_000_000_000,
  maxTraceSteps: 240,
  maxTableColumns: 18,
});

const RESTORE_1416_PHASES = Object.freeze([
  bi("Khởi tạo", "Initialize"),
  bi("Chọn prefix nguồn", "Select a source prefix"),
  bi("Mở rộng số", "Extend a number"),
  bi("Cập nhật prefix", "Update a prefix"),
  bi("Bỏ qua hoặc dừng", "Skip or stop"),
  bi("Kết quả", "Result"),
]);

const RESTORE_1416_CODE = Object.freeze([
  "class Solution:",
  "    def numberOfArrays(self, s: str, k: int) -> int:",
  "        MOD = 10**9 + 7",
  "        n = len(s)",
  "        dp = [0] * (n + 1)",
  "        dp[0] = 1",
  "        max_digits = len(str(k))",
  "        for start in range(n):",
  "            if s[start] == '0' or dp[start] == 0:",
  "                continue",
  "            value = 0",
  "            for end in range(start, min(n, start + max_digits)):",
  "                value = value * 10 + int(s[end])",
  "                if value > k:",
  "                    break",
  "                dp[end + 1] = (dp[end + 1] + dp[start]) % MOD",
  "        return dp[n]",
]);

function parseRestoreArray1416Input(input, params = {}) {
  if (typeof input !== "string") {
    throw new TypeError("Restore The Array input s must be a digit string / s phải là chuỗi chữ số.");
  }
  if (!/^[1-9]\d*$/.test(input)) {
    throw new TypeError("s must contain only digits and must not start with zero / s chỉ gồm chữ số và không bắt đầu bằng 0.");
  }
  if (input.length > RESTORE_1416_LIMITS.maxLength) {
    throw new RangeError(`s length must be in [1, ${RESTORE_1416_LIMITS.maxLength}] for this visualization.`);
  }
  const k = parseUnsignedInteger(params.k, "k");
  if (k < RESTORE_1416_LIMITS.minK || k > RESTORE_1416_LIMITS.maxK) {
    throw new RangeError(`k must be in [${RESTORE_1416_LIMITS.minK}, ${RESTORE_1416_LIMITS.maxK}].`);
  }
  return { s: input, k };
}

function prefixPreview(s, length) {
  if (length === 0) return "ε";
  const prefix = s.slice(0, length);
  return prefix.length <= 9 ? prefix : `…${prefix.slice(-8)}`;
}

function prefixWindowIndices(length, anchor, final) {
  const total = length + 1;
  const width = Math.min(total, RESTORE_1416_LIMITS.maxTableColumns);
  let left = 0;
  if (total > width) {
    left = final
      ? total - width
      : Math.max(0, Math.min(anchor - 5, total - width));
  }
  return Array.from({ length: width }, (_, index) => left + index);
}

function buildSteps1416(input, params = {}) {
  const { s, k } = parseRestoreArray1416Input(input, params);
  const n = s.length;
  const maxDigits = String(k).length;
  const dp = Array(n + 1).fill(0);
  dp[0] = 1;

  const steps = [];
  let traceTruncated = false;

  function emit({
    phaseIndex,
    title,
    note,
    action,
    formula,
    codeLines,
    start = 0,
    end = null,
    value = null,
    before = null,
    after = null,
    updated = false,
    final = false,
  }) {
    if (steps.length >= RESTORE_1416_LIMITS.maxTraceSteps && !final) {
      traceTruncated = true;
      return;
    }

    const targetPrefix = end === null ? start : end + 1;
    const indices = prefixWindowIndices(n, targetPrefix, final);
    const activePositions = new Set([start]);
    if (end !== null) activePositions.add(end + 1);
    const table = {
      title: bi(
        `Cửa sổ prefix p=${indices[0]}..${indices[indices.length - 1]}`,
        `Prefix window p=${indices[0]}..${indices[indices.length - 1]}`,
      ),
      columns: indices.map((index) => bi(`p=${index}`, `p=${index}`)),
      rows: [
        {
          label: bi("Prefix", "Prefix"),
          cells: indices.map((index) => ({
            value: prefixPreview(s, index),
            state: activePositions.has(index) ? "active" : "plain",
          })),
        },
        {
          label: bi("Ký tự kế", "Next digit"),
          cells: indices.map((index) => ({
            value: index < n ? s[index] : "∅",
            state: index === start ? "active" : "plain",
          })),
        },
        {
          label: bi("Số cách dp[p]", "Ways dp[p]"),
          cells: indices.map((index) => {
            let state = "pending";
            if (final && index === n) state = "answer";
            else if (updated && index === end + 1) state = "updated";
            else if (activePositions.has(index)) state = "active";
            else if (index === 0) state = "base";
            else if (index <= start) state = "computed";
            else if (dp[index] > 0) state = "reachable";
            return { value: dp[index], state };
          }),
        },
      ],
    };

    const highlight = [];
    const mark = [];
    indices.forEach((actualIndex, displayIndex) => {
      if (activePositions.has(actualIndex)) highlight.push(displayIndex);
      if (final ? actualIndex === n : actualIndex <= start && !activePositions.has(actualIndex)) mark.push(displayIndex);
    });
    const candidate = end === null ? "—" : s.slice(start, end + 1);
    const answer = final ? dp[n] : null;

    steps.push({
      title,
      note,
      arr: indices.map((index) => dp[index]),
      sub: indices.map((index) => `p=${index}`),
      highlight,
      mark,
      final,
      codeLines: [...codeLines],
      vars: [
        { name: "s", value: s },
        { name: "k", value: k },
        { name: "start", value: start },
        { name: "end", value: end === null ? "—" : end },
        { name: "candidate", value: candidate },
        { name: "value", value: value === null ? "—" : value },
        { name: "dp[start]", value: dp[start] },
        { name: "dp[end + 1]", value: end === null ? "—" : dp[end + 1] },
      ],
      hardProblemView: {
        problemId: 1416,
        phaseIndex,
        phases: clonePhases(RESTORE_1416_PHASES),
        phase: { ...RESTORE_1416_PHASES[phaseIndex] },
        action,
        formula,
        metrics: [
          { label: bi("Prefix nguồn", "Source prefix"), value: start, state: "active" },
          { label: bi("Vị trí cuối", "End index"), value: end === null ? "—" : end },
          { label: bi("Số đang ghép", "Candidate value"), value: value === null ? "—" : value, state: "candidate" },
          { label: bi("Cách ở nguồn", "Source ways"), value: dp[start] },
          { label: bi("Trước cập nhật", "Before update"), value: before === null ? "—" : before },
          { label: bi("Sau cập nhật", "After update"), value: after === null ? "—" : after, state: updated ? "updated" : "pending" },
        ],
        table,
        sequence: indices.map((index) => ({
          label: `p=${index}`,
          value: dp[index],
          state: activePositions.has(index) ? "active" : index === n && final ? "answer" : "plain",
        })),
        legend: [
          { label: bi("Prefix nguồn/đích đang xét", "Active source/target prefix"), state: "active" },
          { label: bi("Prefix vừa cập nhật", "Updated prefix"), state: "updated" },
          { label: bi("Prefix tới được", "Reachable prefix"), state: "reachable" },
          { label: bi("Đáp án", "Answer"), state: "answer" },
        ],
        answer,
        traceTruncated,
      },
    });
  }

  emit({
    phaseIndex: 0,
    title: bi("Khởi tạo dp[0] = 1", "Initialize dp[0] = 1"),
    note: bi(
      "Có đúng một cách tách prefix rỗng. dp[p] sẽ đếm số cách khôi phục s[:p].",
      "There is exactly one way to split the empty prefix. dp[p] will count restorations of s[:p].",
    ),
    action: bi("Tạo mảng prefix DP và đặt trạng thái gốc.", "Allocate prefix DP and seed its base state."),
    formula: bi("dp[0] = 1", "dp[0] = 1"),
    codeLines: [3, 4, 5, 6, 7],
  });

  for (let start = 0; start < n; start++) {
    if (s[start] === "0" || dp[start] === 0) {
      const leadingZero = s[start] === "0";
      emit({
        phaseIndex: 4,
        title: leadingZero
          ? bi(`Bỏ qua start=${start}: chữ số 0`, `Skip start=${start}: leading zero`)
          : bi(`Bỏ qua start=${start}: prefix không tới được`, `Skip start=${start}: unreachable prefix`),
        note: leadingZero
          ? bi("Không số hợp lệ nào được bắt đầu bằng 0, kể cả chuỗi chỉ gồm một chữ số 0.", "A valid restored number cannot start with zero, even as the one-digit string 0.")
          : bi("Không có cách tách prefix trước vị trí này, nên nó không thể sinh chuyển trạng thái.", "No split reaches this prefix, so it cannot generate transitions."),
        action: bi("Bỏ qua prefix nguồn không hợp lệ.", "Skip an invalid source prefix."),
        formula: leadingZero ? bi("s[start] = '0' ⇒ continue", "s[start] = '0' ⇒ continue") : bi("dp[start] = 0 ⇒ continue", "dp[start] = 0 ⇒ continue"),
        codeLines: [9, 10],
        start,
      });
      continue;
    }

    emit({
      phaseIndex: 1,
      title: bi(`Mở rộng từ prefix ${start}`, `Extend from prefix ${start}`),
      note: bi(
        `Có ${dp[start]} cách hợp lệ cho s[:${start}]; mỗi số tiếp theo sẽ kế thừa toàn bộ số cách này.`,
        `There are ${dp[start]} valid restorations of s[:${start}]; every next number inherits all of them.`,
      ),
      action: bi("Chọn một prefix nguồn tới được.", "Select a reachable source prefix."),
      formula: bi(`ways = dp[${start}] = ${dp[start]}`, `ways = dp[${start}] = ${dp[start]}`),
      codeLines: [8, 9, 11],
      start,
      value: 0,
    });

    let value = 0;
    const endLimit = Math.min(n, start + maxDigits);
    for (let end = start; end < endLimit; end++) {
      value = value * 10 + Number(s[end]);
      emit({
        phaseIndex: 2,
        title: bi(`Ghép "${s.slice(start, end + 1)}" = ${value}`, `Build "${s.slice(start, end + 1)}" = ${value}`),
        note: bi(
          `Thêm chữ số s[${end}]=${s[end]} vào ứng viên bắt đầu tại ${start}.`,
          `Append digit s[${end}]=${s[end]} to the candidate beginning at ${start}.`,
        ),
        action: bi("Mở rộng số hiện tại thêm một chữ số.", "Extend the current number by one digit."),
        formula: bi(`value = previous × 10 + ${s[end]} = ${value}`, `value = previous × 10 + ${s[end]} = ${value}`),
        codeLines: [12, 13],
        start,
        end,
        value,
      });

      if (value > k) {
        emit({
          phaseIndex: 4,
          title: bi(`${value} > k, dừng mở rộng`, `${value} > k, stop extending`),
          note: bi(
            "Mọi phần mở rộng tiếp theo chỉ làm số lớn hơn, nên không thể tạo số hợp lệ từ start này.",
            "Every further extension only makes the number larger, so this start cannot produce another valid number.",
          ),
          action: bi("Cắt nhánh khi ứng viên vượt k.", "Prune when the candidate exceeds k."),
          formula: bi(`${value} > ${k} ⇒ break`, `${value} > ${k} ⇒ break`),
          codeLines: [14, 15],
          start,
          end,
          value,
        });
        break;
      }

      const before = dp[end + 1];
      dp[end + 1] = (dp[end + 1] + dp[start]) % MOD;
      emit({
        phaseIndex: 3,
        title: bi(
          `Cập nhật dp[${end + 1}] = ${dp[end + 1]}`,
          `Update dp[${end + 1}] = ${dp[end + 1]}`,
        ),
        note: bi(
          `"${s.slice(start, end + 1)}" không có số 0 đầu và nằm trong [1, k], nên cộng ${dp[start]} cách từ prefix nguồn.`,
          `"${s.slice(start, end + 1)}" has no leading zero and lies in [1, k], so add ${dp[start]} source-prefix ways.`,
        ),
        action: bi("Cộng số cách vào prefix đích.", "Add source ways to the target prefix."),
        formula: bi(
          `dp[${end + 1}] = (${before} + ${dp[start]}) mod ${MOD} = ${dp[end + 1]}`,
          `dp[${end + 1}] = (${before} + ${dp[start]}) mod ${MOD} = ${dp[end + 1]}`,
        ),
        codeLines: [16],
        start,
        end,
        value,
        before,
        after: dp[end + 1],
        updated: true,
      });
    }
  }

  const answer = dp[n];
  emit({
    phaseIndex: 5,
    title: bi(`Đáp án = ${answer}`, `Answer = ${answer}`),
    note: traceTruncated
      ? bi(
        "Trace đã được rút gọn, nhưng toàn bộ prefix và mọi substring dài không quá số chữ số của k vẫn được quét và tính modulo.",
        "The trace was shortened, but every prefix and every substring no longer than k's digit count was still scanned and accumulated modulo M.",
      )
      : bi(
        `dp[${n}] đếm mọi cách tách toàn bộ chuỗi thành các số hợp lệ không vượt ${k}.`,
        `dp[${n}] counts every split of the full string into valid numbers no greater than ${k}.`,
      ),
    action: bi("Đọc số cách của toàn bộ prefix.", "Read the count for the full prefix."),
    formula: bi(`dp[${n}] = ${answer}`, `dp[${n}] = ${answer}`),
    codeLines: [17],
    start: n,
    final: true,
  });

  return { original: s, answer, steps };
}

module.exports = {
  920: {
    id: 920,
    difficulty: "hard",
    slug: "number-of-music-playlists",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "combinatorics", vi: "Tổ hợp", en: "Combinatorics" },
    ],
    title: bi("Number of Music Playlists", "Number of Music Playlists"),
    titleVi: bi("Số playlist âm nhạc", "Number of Music Playlists"),
    statement: bi(
      "Có n bài khác nhau. Tạo playlist dài goal, dùng mọi bài ít nhất một lần, và chỉ phát lại một bài sau khi đã phát ít nhất k bài khác. Đếm số playlist modulo 10^9+7.",
      "There are n distinct songs. Build a playlist of length goal that uses every song at least once and replays a song only after at least k other songs. Count playlists modulo 10^9+7.",
    ),
    defaultInput: [3],
    defaults: { input: [3], goal: 3, k: 1 },
    inputKind: "positive",
    inputLabel: bi("n (1..12)", "n (1..12)"),
    singleInput: true,
    maxInput: PLAYLIST_920_LIMITS.maxN,
    limits: { ...PLAYLIST_920_LIMITS },
    extraParams: [
      { key: "goal", type: "number", min: 1, max: PLAYLIST_920_LIMITS.maxGoal, default: 3, label: bi("goal (độ dài playlist)", "goal (playlist length)") },
      { key: "k", type: "number", min: 0, max: PLAYLIST_920_LIMITS.maxN - 1, default: 1, label: bi("k (khoảng cách phát lại)", "k (replay gap)") },
    ],
    approach: [
      bi("Đặt dp[length][used] là số playlist có độ dài length và dùng đúng used bài khác nhau.", "Let dp[length][used] count playlists of the given length using exactly used distinct songs."),
      bi("Thêm bài chưa từng dùng theo (n−used+1) lựa chọn từ dp[length−1][used−1].", "Append a never-used song in (n−used+1) ways from dp[length−1][used−1]."),
      bi("Phát lại một bài cũ theo max(used−k,0) lựa chọn từ dp[length−1][used].", "Replay an old song in max(used−k,0) ways from dp[length−1][used]."),
      bi("Cộng hai chuyển trạng thái modulo 10^9+7 và trả dp[goal][n].", "Add both transitions modulo 10^9+7 and return dp[goal][n]."),
    ],
    complexity: {
      time: "O(goal · n)",
      space: "O(goal · n)",
      note: bi("Có thể dùng hai hàng O(n); visualization giữ bảng 2D đầy đủ nhưng chỉ hiển thị một cửa sổ hàng bị chặn.", "Two O(n) rows suffice; the visualization retains the full 2D table but displays only a bounded row window."),
    },
    code: PLAYLIST_920_CODE,
    debugMode: "semantic",
    parseMusicPlaylists920Input,
    liveArgs: (input, params) => {
      const parsed = parseMusicPlaylists920Input(input, params);
      return [parsed.n, parsed.goal, parsed.k];
    },
    builder: buildSteps920,
  },

  964: {
    id: 964,
    difficulty: "hard",
    slug: "least-operators-to-express-number",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "math", vi: "Toán", en: "Math" },
      { key: "memoization", vi: "Ghi nhớ", en: "Memoization" },
    ],
    title: bi("Least Operators to Express Number", "Least Operators to Express Number"),
    titleVi: bi("Ít toán tử nhất để biểu diễn một số", "Least operators to express a number"),
    statement: bi(
      "Dùng các bản sao của x cùng +, −, ×, ÷ (không dùng phép một ngôi) để tạo target với ít toán tử nhất. Mọi toán hạng trong biểu thức đều là x.",
      "Use copies of x with +, −, ×, and ÷ (without unary operators) to form target using the fewest operators. Every operand in the expression is x.",
    ),
    defaultInput: [3],
    defaults: { input: [3], target: 19 },
    inputKind: "positive",
    inputLabel: bi("x (2..100)", "x (2..100)"),
    singleInput: true,
    maxInput: LEAST_OPS_964_LIMITS.maxX,
    limits: { ...LEAST_OPS_964_LIMITS },
    extraParams: [
      { key: "target", type: "number", min: LEAST_OPS_964_LIMITS.minTarget, max: LEAST_OPS_964_LIMITS.maxTarget, default: 19, label: bi("target (số đích)", "target") },
    ],
    approach: [
      bi("Xem target theo cơ số x; tại vị trí i, cost(0)=2 cho x/x và cost(i)=i cho x^i khi i>0.", "View target in base x; at position i, cost(0)=2 for x/x and cost(i)=i for x^i when i>0."),
      bi("F(i,r) thử dùng số dư dương tại x^i (làm tròn xuống) hoặc dùng phần bù âm rồi nhớ 1 (làm tròn lên).", "F(i,r) tries the positive remainder at x^i (round down) or its negative complement plus a carry (round up)."),
      bi("remaining=1 trả cost(i); remaining=0 trả 0; memo hóa mọi trạng thái (i,remaining).", "remaining=1 returns cost(i); remaining=0 returns 0; memoize every (i,remaining) state."),
      bi("Chi phí số hạng có dấu đếm thừa một dấu trước số hạng đầu, nên đáp án là F(0,target)−1.", "The signed-term cost counts one extra sign before the first term, so the answer is F(0,target)−1."),
    ],
    complexity: {
      time: "O(log_x(target)) memo states",
      space: "O(log_x(target))",
      note: bi("Mỗi vị trí cơ số x có tối đa hai phần còn lại liên quan (không nhớ hoặc có nhớ); trace và nhóm memo đều bị chặn hiển thị.", "Each base-x position has at most two relevant remaining values (without or with carry); trace and memo groups are display-bounded."),
    },
    code: LEAST_OPS_964_CODE,
    debugMode: "semantic",
    parseLeastOperators964Input,
    liveArgs: (input, params) => {
      const parsed = parseLeastOperators964Input(input, params);
      return [parsed.x, parsed.target];
    },
    builder: buildSteps964,
  },

  1416: {
    id: 1416,
    difficulty: "hard",
    slug: "restore-the-array",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "prefix", vi: "Tiền tố", en: "Prefix" },
    ],
    title: bi("Restore The Array", "Restore The Array"),
    titleVi: bi("Khôi phục mảng", "Restore the array"),
    statement: bi(
      "Tách chuỗi chữ số s thành một hay nhiều số nguyên trong [1,k], không số nào có số 0 đầu. Đếm số cách tách modulo 10^9+7.",
      "Split digit string s into one or more integers in [1,k], with no leading zero in any number. Count the splits modulo 10^9+7.",
    ),
    defaultInput: "1317",
    defaults: { input: "1317", k: 2000 },
    inputKind: "string",
    inputLabel: bi("s (1..120 chữ số, không bắt đầu bằng 0)", "s (1..120 digits, no leading zero)"),
    limits: { ...RESTORE_1416_LIMITS },
    extraParams: [
      { key: "k", type: "number", min: RESTORE_1416_LIMITS.minK, max: RESTORE_1416_LIMITS.maxK, default: 2000, label: bi("k (giá trị lớn nhất)", "k (maximum value)") },
    ],
    approach: [
      bi("Đặt dp[p] là số cách tách prefix s[:p], với dp[0]=1.", "Let dp[p] count splits of prefix s[:p], with dp[0]=1."),
      bi("Từ mỗi prefix tới được không bắt đầu bằng 0, ghép dần tối đa len(str(k)) chữ số.", "From every reachable prefix whose next digit is nonzero, append at most len(str(k)) digits."),
      bi("Mỗi substring có giá trị <=k chuyển dp[start] vào dp[end+1]; dừng ngay khi giá trị vượt k.", "Every substring valued <=k transfers dp[start] into dp[end+1]; stop as soon as its value exceeds k."),
      bi("Mọi phép cộng lấy modulo 10^9+7; dp[len(s)] là đáp án.", "Take every addition modulo 10^9+7; dp[len(s)] is the answer."),
    ],
    complexity: {
      time: "O(|s| · digits(k))",
      space: "O(|s|)",
      note: bi("Mỗi start chỉ quét số chữ số của k; bảng visualization chỉ hiển thị một cửa sổ prefix bị chặn.", "Each start scans only k's digit count; the visualization table shows a bounded prefix window."),
    },
    code: RESTORE_1416_CODE,
    debugMode: "semantic",
    parseRestoreArray1416Input,
    liveArgs: (input, params) => {
      const parsed = parseRestoreArray1416Input(input, params);
      return [parsed.s, parsed.k];
    },
    builder: buildSteps1416,
  },
};
