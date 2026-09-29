"use strict";

const VALID_PARENTHESES_PATH_2267_MAX_ROWS = 7;
const VALID_PARENTHESES_PATH_2267_MAX_COLUMNS = 7;
const VALID_PARENTHESES_PATH_2267_TRACE_LIMIT = 320;
const VALID_PARENTHESES_PATH_2267_SOURCE = Object.freeze([
  "from functools import cache",
  "class Solution:",
  "    def hasValidPath(self, grid):",
  "        rows, cols = len(grid), len(grid[0])",
  "        path_len = rows + cols - 1",
  "        if grid[0][0] != '(' or grid[-1][-1] != ')' or path_len % 2:",
  "            return False",
  "        @cache",
  "        def dfs(r, c, balance):",
  "            balance += 1 if grid[r][c] == '(' else -1",
  "            remaining = (rows - 1 - r) + (cols - 1 - c)",
  "            if balance < 0 or balance > remaining or (remaining - balance) % 2:",
  "                return False",
  "            if r == rows - 1 and c == cols - 1:",
  "                return balance == 0",
  "            if r + 1 < rows and dfs(r + 1, c, balance):",
  "                return True",
  "            if c + 1 < cols and dfs(r, c + 1, balance):",
  "                return True",
  "            return False",
  "        return dfs(0, 0, 0)",
]);

function parseValidParenthesesPath2267Input(input) {
  let candidate;

  if (Array.isArray(input)) {
    candidate = input;
  } else if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new RangeError("Valid Parentheses Path grid must be nonempty.");

    if (text.startsWith("[")) {
      try {
        candidate = JSON.parse(text);
      } catch (error) {
        throw new TypeError("Valid Parentheses Path JSON input must be a valid matrix.");
      }
    } else {
      const rawRows = text.split(/[;|]/);
      if (rawRows.some((row) => !row.trim())) {
        throw new TypeError("Valid Parentheses Path compact input cannot contain an empty row.");
      }
      candidate = rawRows.map((row) => {
        const compact = row.trim();
        if (compact.includes(",")) {
          const cells = compact.split(",").map((cell) => cell.trim());
          if (cells.some((cell) => !cell)) {
            throw new TypeError("Valid Parentheses Path compact input cannot contain an empty cell.");
          }
          return cells;
        }
        return Array.from(compact.replace(/\s+/g, ""));
      });
    }
  } else {
    throw new TypeError("Valid Parentheses Path input must be a compact string, JSON matrix string, or matrix array.");
  }

  if (!Array.isArray(candidate) || candidate.length === 0) {
    throw new RangeError("Valid Parentheses Path grid must contain at least one row.");
  }
  if (candidate.length > VALID_PARENTHESES_PATH_2267_MAX_ROWS) {
    throw new RangeError(`Valid Parentheses Path visualization supports at most ${VALID_PARENTHESES_PATH_2267_MAX_ROWS} rows.`);
  }

  let columns = null;
  const grid = candidate.map((rawRow) => {
    const row = typeof rawRow === "string"
      ? Array.from(rawRow.trim().replace(/\s+/g, ""))
      : rawRow;
    if (!Array.isArray(row) || row.length === 0) {
      throw new TypeError("Every Valid Parentheses Path row must be nonempty.");
    }
    if (row.length > VALID_PARENTHESES_PATH_2267_MAX_COLUMNS) {
      throw new RangeError(`Valid Parentheses Path visualization supports at most ${VALID_PARENTHESES_PATH_2267_MAX_COLUMNS} columns.`);
    }
    if (columns === null) columns = row.length;
    if (row.length !== columns) {
      throw new RangeError("Valid Parentheses Path grid must be rectangular.");
    }
    return row.map((value) => {
      if (typeof value !== "string" || !["(", ")"].includes(value.trim())) {
        throw new TypeError("Every Valid Parentheses Path cell must be '(' or ')'.");
      }
      return value.trim();
    });
  });

  return grid;
}

function deepFreezeValidParenthesesPath2267View(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function buildSteps2267(input) {
  const grid = parseValidParenthesesPath2267Input(input);
  const rows = grid.length;
  const columns = grid[0].length;
  const pathLength = rows + columns - 1;
  const localized = (en, vi) => ({ en, vi });
  const steps = [];
  const memo = new Map();
  const choices = new Map();
  const stack = [];
  const witnessCells = [];

  const counters = {
    dfsCalls: 0,
    memoChecks: 0,
    memoHits: 0,
    memoMisses: 0,
    memoWrites: 0,
    statesComputed: 0,
    pruneChecks: 0,
    prunes: 0,
    negativePrunes: 0,
    capacityPrunes: 0,
    parityPrunes: 0,
    branchesTried: 0,
    outOfBounds: 0,
    recursiveCalls: 0,
    successfulBranches: 0,
    returns: 0,
    maxDepth: 0,
  };

  const coordinateAt = (row, column) => ({ row, column, char: grid[row][column] });
  const copyCoordinate = (coordinate) => coordinate ? { ...coordinate } : null;
  const keyFor = (row, column, incomingBalance) => `${row}:${column}:${incomingBalance}`;
  const blankMemoAccess = () => ({
    key: null,
    coordinate: null,
    incomingBalance: null,
    balance: null,
    status: "idle",
    result: null,
  });
  const blankBranch = () => ({
    direction: null,
    from: null,
    to: null,
    inBounds: null,
    status: "idle",
    result: null,
  });
  const blankPrune = () => ({ kind: "none", active: false });
  const blankState = () => ({
    key: null,
    coordinate: null,
    char: null,
    delta: null,
    incomingBalance: null,
    balance: null,
    remaining: null,
    result: null,
    status: "idle",
  });

  const precheck = {
    startValid: null,
    endValid: null,
    evenPathLength: null,
    status: "pending",
    reason: null,
  };

  let currentCursor = null;
  let currentState = blankState();
  let memoRead = blankMemoAccess();
  let memoWrite = blankMemoAccess();
  let branch = blankBranch();
  let prune = blankPrune();
  let answer = null;
  let witnessComplete = false;
  let traceDropped = 0;

  const memoEntriesSnapshot = () => Array.from(memo.values(), (entry) => ({ ...entry }));

  const snapshotView = ({ line, event, phase, timing, condition, final, emitted }) => {
    const memoEntries = memoEntriesSnapshot();
    return deepFreezeValidParenthesesPath2267View({
      version: 1,
      problemId: 2267,
      source: { line, text: VALID_PARENTHESES_PATH_2267_SOURCE[line - 1] || "" },
      event,
      phase,
      timing,
      condition: condition && typeof condition === "object"
        ? { expression: condition.expression || null, result: Boolean(condition.result) }
        : { expression: null, result: null },
      setup: {
        rows,
        columns,
        pathLength,
        limits: {
          maxRows: VALID_PARENTHESES_PATH_2267_MAX_ROWS,
          maxColumns: VALID_PARENTHESES_PATH_2267_MAX_COLUMNS,
          traceFrames: VALID_PARENTHESES_PATH_2267_TRACE_LIMIT,
        },
      },
      precheck: { ...precheck },
      grid: {
        rows,
        columns,
        values: grid.map((row) => [...row]),
      },
      state: {
        ...currentState,
        coordinate: copyCoordinate(currentState.coordinate),
      },
      cursors: {
        current: copyCoordinate(currentCursor),
        candidate: copyCoordinate(branch.to),
      },
      stack: stack.map((frame) => ({ ...frame })),
      memo: {
        size: memo.size,
        entries: memoEntries,
        read: { ...memoRead, coordinate: copyCoordinate(memoRead.coordinate) },
        write: { ...memoWrite, coordinate: copyCoordinate(memoWrite.coordinate) },
      },
      branch: {
        ...branch,
        from: copyCoordinate(branch.from),
        to: copyCoordinate(branch.to),
      },
      prune: { ...prune },
      witness: {
        complete: witnessComplete,
        cells: witnessCells.map((cell) => ({ ...cell })),
      },
      counters: { ...counters },
      trace: {
        limit: VALID_PARENTHESES_PATH_2267_TRACE_LIMIT,
        emitted,
        dropped: traceDropped,
        truncated: traceDropped > 0,
      },
      answer,
      final,
    });
  };

  const emit = ({
    line,
    event,
    phase,
    timing = "after",
    condition = null,
    title,
    note,
    final = false,
  }) => {
    if (!final && steps.length >= VALID_PARENTHESES_PATH_2267_TRACE_LIMIT - 1) {
      traceDropped += 1;
      return;
    }
    const view = snapshotView({
      line,
      event,
      phase,
      timing,
      condition,
      final,
      emitted: steps.length + 1,
    });
    const current = view.cursors.current;
    const candidate = view.cursors.candidate;
    steps.push({
      title,
      note,
      arr: [],
      highlight: current ? [(current.row * columns) + current.column] : [],
      mark: candidate ? [(candidate.row * columns) + candidate.column] : [],
      final,
      codeLines: [line],
      vars: [
        { name: "state", value: view.state.key || "—" },
        { name: "balance", value: view.state.balance ?? "—" },
        { name: "remaining", value: view.state.remaining ?? "—" },
        { name: "memo states", value: view.memo.size },
        { name: "answer", value: answer ?? "—" },
      ],
      validParenthesesPath2267View: view,
    });
  };

  const activateFrame = (frame, status = frame.status) => {
    const coordinate = coordinateAt(frame.row, frame.column);
    currentCursor = coordinate;
    currentState = {
      key: frame.key,
      coordinate,
      char: frame.char,
      delta: frame.delta,
      incomingBalance: frame.incomingBalance,
      balance: frame.balance,
      remaining: frame.remaining,
      result: frame.result,
      status,
    };
  };

  const storeAndReturn = (frame, result, line, event, title, note, reason = null) => {
    frame.result = result;
    frame.status = "returning";
    activateFrame(frame, "returning");
    const entry = {
      key: frame.key,
      row: frame.row,
      column: frame.column,
      char: frame.char,
      incomingBalance: frame.incomingBalance,
      balance: frame.balance,
      remaining: frame.remaining,
      result,
      reason,
    };
    memo.set(frame.key, entry);
    memoWrite = {
      key: frame.key,
      coordinate: coordinateAt(frame.row, frame.column),
      incomingBalance: frame.incomingBalance,
      balance: frame.balance,
      status: "write",
      result,
    };
    counters.memoWrites += 1;
    counters.statesComputed += 1;
    counters.returns += 1;
    emit({ line, event, phase: "dfs", title, note });
    stack.pop();
    return result;
  };

  function dfs(row, column, incomingBalance) {
    const key = keyFor(row, column, incomingBalance);
    const coordinate = coordinateAt(row, column);
    const char = grid[row][column];
    const delta = char === "(" ? 1 : -1;
    const balance = incomingBalance + delta;
    const remaining = (rows - 1 - row) + (columns - 1 - column);

    counters.dfsCalls += 1;
    counters.memoChecks += 1;
    currentCursor = coordinate;
    currentState = {
      key,
      coordinate,
      char: null,
      delta: null,
      incomingBalance,
      balance: null,
      remaining: null,
      result: null,
      status: "cache-check",
    };
    branch = blankBranch();
    prune = blankPrune();
    memoWrite = blankMemoAccess();

    const cached = memo.get(key);
    if (cached) {
      counters.memoHits += 1;
      counters.returns += 1;
      currentState.result = cached.result;
      currentState.status = "cache-hit";
      memoRead = {
        key,
        coordinate,
        incomingBalance,
        balance: null,
        status: "hit",
        result: cached.result,
      };
      emit({
        line: 8,
        event: "memo-hit",
        phase: "memo",
        title: localized(`Memo hit: ${key} → ${cached.result}`, `Memo hit: ${key} → ${cached.result}`),
        note: localized(
          "@cache returns this result without expanding the DFS state again.",
          "@cache trả kết quả này mà không mở rộng lại trạng thái DFS.",
        ),
      });
      return cached.result;
    }

    counters.memoMisses += 1;
    memoRead = {
      key,
      coordinate,
      incomingBalance,
      balance: null,
      status: "miss",
      result: null,
    };
    emit({
      line: 8,
      event: "memo-miss",
      phase: "memo",
      title: localized(`Memo miss: ${key}`, `Memo miss: ${key}`),
      note: localized(
        "This (row, column, incoming balance) state must be computed.",
        "Cần tính trạng thái (hàng, cột, balance đầu vào) này.",
      ),
    });
    memoRead = blankMemoAccess();

    const frame = {
      depth: stack.length,
      key,
      row,
      column,
      char: null,
      delta: null,
      incomingBalance,
      balance: null,
      remaining: null,
      result: null,
      status: "entered",
    };
    stack.push(frame);
    counters.maxDepth = Math.max(counters.maxDepth, stack.length);
    activateFrame(frame, "entered");
    emit({
      line: 9,
      event: "dfs-entry",
      phase: "dfs",
      timing: "before",
      title: localized(`Enter dfs(${row}, ${column}, ${incomingBalance})`, `Vào dfs(${row}, ${column}, ${incomingBalance})`),
      note: localized(
        `Push depth ${frame.depth}; bind r = ${row}, c = ${column}, and incoming balance = ${incomingBalance}.`,
        `Đẩy độ sâu ${frame.depth}; gán r = ${row}, c = ${column} và balance đầu vào = ${incomingBalance}.`,
      ),
    });

    frame.char = char;
    frame.delta = delta;
    frame.balance = balance;
    frame.status = "consumed";
    activateFrame(frame, "consumed");
    emit({
      line: 10,
      event: "consume-parenthesis",
      phase: "balance",
      title: localized(
        `Consume '${char}': ${incomingBalance} ${delta > 0 ? "+ 1" : "− 1"} = ${balance}`,
        `Đọc '${char}': ${incomingBalance} ${delta > 0 ? "+ 1" : "− 1"} = ${balance}`,
      ),
      note: localized(
        "An opening parenthesis raises the balance; a closing parenthesis lowers it.",
        "Dấu mở tăng balance; dấu đóng giảm balance.",
      ),
    });

    frame.remaining = remaining;
    frame.status = "remaining";
    activateFrame(frame, "remaining");
    emit({
      line: 11,
      event: "count-remaining",
      phase: "balance",
      title: localized(`${remaining} cell(s) remain`, `Còn ${remaining} ô`),
      note: localized(
        "Every remaining move is either down or right, so this distance is exact.",
        "Mỗi bước còn lại chỉ đi xuống hoặc sang phải, nên khoảng cách này là chính xác.",
      ),
    });

    counters.pruneChecks += 1;
    let pruneKind = "none";
    if (balance < 0) pruneKind = "negative";
    else if (balance > remaining) pruneKind = "capacity";
    else if ((remaining - balance) % 2 !== 0) pruneKind = "parity";
    const shouldPrune = pruneKind !== "none";
    prune = { kind: pruneKind, active: shouldPrune };
    frame.status = shouldPrune ? "pruned" : "feasible";
    activateFrame(frame, frame.status);
    emit({
      line: 12,
      event: shouldPrune ? "prune" : "feasible-state",
      phase: "prune",
      condition: {
        expression: "balance < 0 or balance > remaining or parity mismatch",
        result: shouldPrune,
      },
      title: localized(
        shouldPrune ? `Prune state: ${pruneKind}` : "State remains feasible",
        shouldPrune ? `Cắt nhánh: ${pruneKind}` : "Trạng thái vẫn khả thi",
      ),
      note: localized(
        shouldPrune
          ? "This prefix can no longer become a balanced parenthesis string."
          : "The prefix is nonnegative and can still be closed using the remaining cells.",
        shouldPrune
          ? "Tiền tố này không thể trở thành chuỗi ngoặc cân bằng nữa."
          : "Tiền tố không âm và vẫn có thể đóng hết bằng các ô còn lại.",
      ),
    });

    if (shouldPrune) {
      counters.prunes += 1;
      if (pruneKind === "negative") counters.negativePrunes += 1;
      if (pruneKind === "capacity") counters.capacityPrunes += 1;
      if (pruneKind === "parity") counters.parityPrunes += 1;
      return storeAndReturn(
        frame,
        false,
        13,
        "return-pruned-false",
        localized("Return False from the pruned state", "Trả False từ trạng thái bị cắt"),
        localized(
          "The failed state is memoized so later paths can reuse the result.",
          "Lưu trạng thái thất bại vào memo để các đường sau tái sử dụng.",
        ),
        pruneKind,
      );
    }

    const atDestination = row === rows - 1 && column === columns - 1;
    frame.status = atDestination ? "destination" : "expand";
    activateFrame(frame, frame.status);
    emit({
      line: 14,
      event: atDestination ? "destination" : "not-destination",
      phase: "dfs",
      condition: { expression: "r == rows - 1 and c == cols - 1", result: atDestination },
      title: localized(
        atDestination ? "Reached the destination" : "Destination not reached",
        atDestination ? "Đã tới đích" : "Chưa tới đích",
      ),
      note: localized(
        atDestination ? `The final balance is ${balance}.` : "Try the two legal directions in deterministic order: down, then right.",
        atDestination ? `Balance cuối là ${balance}.` : "Thử hai hướng theo thứ tự cố định: xuống, rồi sang phải.",
      ),
    });

    if (atDestination) {
      const result = balance === 0;
      return storeAndReturn(
        frame,
        result,
        15,
        "return-destination",
        localized(`Destination balance is ${balance} → ${result}`, `Balance tại đích là ${balance} → ${result}`),
        localized(
          result ? "A balanced path has been found." : "The path ends with unmatched opening parentheses.",
          result ? "Đã tìm thấy một đường ngoặc cân bằng." : "Đường đi kết thúc khi vẫn còn dấu mở chưa đóng.",
        ),
        result ? "destination-valid" : "destination-invalid",
      );
    }

    const directions = [
      { name: "down", dr: 1, dc: 0, line: 16, returnLine: 17 },
      { name: "right", dr: 0, dc: 1, line: 18, returnLine: 19 },
    ];

    for (const direction of directions) {
      const nextRow = row + direction.dr;
      const nextColumn = column + direction.dc;
      const inBounds = nextRow < rows && nextColumn < columns;
      counters.branchesTried += 1;
      branch = {
        direction: direction.name,
        from: coordinateAt(row, column),
        to: inBounds ? coordinateAt(nextRow, nextColumn) : { row: nextRow, column: nextColumn, char: null },
        inBounds,
        status: inBounds ? "checking" : "out-of-bounds",
        result: null,
      };
      activateFrame(frame, "branch-check");
      emit({
        line: direction.line,
        event: inBounds ? "try-branch" : "skip-out-of-bounds",
        phase: "branch",
        condition: {
          expression: direction.name === "down" ? "r + 1 < rows" : "c + 1 < cols",
          result: inBounds,
        },
        title: localized(
          inBounds ? `Try ${direction.name}` : `Skip ${direction.name}: outside grid`,
          inBounds
            ? `Thử đi ${direction.name === "down" ? "xuống" : "sang phải"}`
            : `Bỏ qua ${direction.name === "down" ? "hướng xuống" : "hướng phải"}: ngoài lưới`,
        ),
        note: localized(
          inBounds
            ? `Call the child with the current balance ${balance}.`
            : "Short-circuit the bounds condition; no recursive call is made.",
          inBounds
            ? `Gọi trạng thái con với balance hiện tại ${balance}.`
            : "Điều kiện biên dừng sớm; không gọi đệ quy.",
        ),
      });

      if (!inBounds) {
        counters.outOfBounds += 1;
        continue;
      }

      counters.recursiveCalls += 1;
      const childResult = dfs(nextRow, nextColumn, balance);
      memoRead = blankMemoAccess();
      memoWrite = blankMemoAccess();
      activateFrame(frame, "branch-return");
      branch = {
        direction: direction.name,
        from: coordinateAt(row, column),
        to: coordinateAt(nextRow, nextColumn),
        inBounds: true,
        status: childResult ? "accepted" : "rejected",
        result: childResult,
      };
      emit({
        line: direction.line,
        event: "branch-result",
        phase: "branch",
        condition: {
          expression: `dfs(${nextRow}, ${nextColumn}, ${balance})`,
          result: childResult,
        },
        title: localized(
          `${direction.name} branch returned ${childResult}`,
          `Nhánh ${direction.name === "down" ? "xuống" : "phải"} trả về ${childResult}`,
        ),
        note: localized(
          childResult ? "Keep this successor for the final witness path." : "Try the next direction, if one remains.",
          childResult ? "Giữ ô kế tiếp này để dựng đường witness cuối." : "Thử hướng tiếp theo nếu còn.",
        ),
      });

      if (childResult) {
        counters.successfulBranches += 1;
        choices.set(key, {
          row: nextRow,
          column: nextColumn,
          incomingBalance: balance,
        });
        return storeAndReturn(
          frame,
          true,
          direction.returnLine,
          "return-branch-true",
          localized(`Return True via ${direction.name}`, `Trả True qua hướng ${direction.name === "down" ? "xuống" : "phải"}`),
          localized(
            "One successful child is enough; the other branch is not needed.",
            "Chỉ cần một trạng thái con thành công; không cần thử nhánh còn lại.",
          ),
          `via-${direction.name}`,
        );
      }
    }

    return storeAndReturn(
      frame,
      false,
      20,
      "return-exhausted-false",
      localized("Both branches failed → False", "Cả hai nhánh đều thất bại → False"),
      localized(
        "Memoize False after exhausting every legal continuation.",
        "Lưu False vào memo sau khi thử hết mọi hướng hợp lệ.",
      ),
      "exhausted",
    );
  }

  emit({
    line: 1,
    event: "import-cache",
    phase: "setup",
    title: localized("Import the memoization decorator", "Import decorator memoization"),
    note: localized("@cache stores one Boolean per DFS state.", "@cache lưu một Boolean cho mỗi trạng thái DFS."),
  });
  emit({
    line: 2,
    event: "bind-class",
    phase: "setup",
    title: localized("Bind class Solution", "Liên kết lớp Solution"),
    note: localized("Create the LeetCode solution class.", "Tạo lớp lời giải LeetCode."),
  });
  emit({
    line: 3,
    event: "bind-method",
    phase: "setup",
    title: localized("Bind hasValidPath(grid)", "Liên kết hasValidPath(grid)"),
    note: localized("Use the validated rectangular parenthesis grid.", "Dùng lưới ngoặc chữ nhật đã được kiểm tra."),
  });
  emit({
    line: 4,
    event: "set-dimensions",
    phase: "setup",
    title: localized(`Set rows = ${rows}, cols = ${columns}`, `Đặt rows = ${rows}, cols = ${columns}`),
    note: localized("Only down and right moves are allowed.", "Chỉ được đi xuống và sang phải."),
  });
  emit({
    line: 5,
    event: "set-path-length",
    phase: "setup",
    title: localized(`Every path contains ${pathLength} cells`, `Mỗi đường đi có ${pathLength} ô`),
    note: localized("All top-left to bottom-right paths have the same length.", "Mọi đường từ góc trên-trái tới dưới-phải có cùng độ dài."),
  });

  precheck.startValid = grid[0][0] === "(";
  precheck.endValid = grid[rows - 1][columns - 1] === ")";
  precheck.evenPathLength = pathLength % 2 === 0;
  const invalidPrecheck = !precheck.startValid || !precheck.endValid || !precheck.evenPathLength;
  precheck.status = invalidPrecheck ? "failed" : "passed";
  if (!precheck.startValid) precheck.reason = "invalid-start";
  else if (!precheck.endValid) precheck.reason = "invalid-end";
  else if (!precheck.evenPathLength) precheck.reason = "odd-length";
  emit({
    line: 6,
    event: invalidPrecheck ? "precheck-failed" : "precheck-passed",
    phase: "precheck",
    condition: {
      expression: "bad start or bad end or odd path length",
      result: invalidPrecheck,
    },
    title: localized(
      invalidPrecheck ? "O(1) precheck rejects the grid" : "O(1) precheck passes",
      invalidPrecheck ? "Kiểm tra O(1) loại lưới" : "Kiểm tra O(1) thành công",
    ),
    note: localized(
      invalidPrecheck
        ? "A balanced path must start with '(', end with ')', and contain an even number of cells."
        : "The endpoints and path-length parity allow DFS to begin.",
      invalidPrecheck
        ? "Đường cân bằng phải bắt đầu bằng '(', kết thúc bằng ')' và có số ô chẵn."
        : "Hai đầu và parity của độ dài cho phép bắt đầu DFS.",
    ),
  });

  if (invalidPrecheck) {
    answer = false;
    prune = { kind: precheck.reason, active: true };
    currentState = { ...blankState(), result: false, status: "precheck-failed" };
    emit({
      line: 7,
      event: "return-precheck-false",
      phase: "done",
      timing: "before",
      title: localized("Return False", "Trả về False"),
      note: localized("No DFS state needs to be explored.", "Không cần duyệt trạng thái DFS nào."),
      final: true,
    });
  } else {
    answer = dfs(0, 0, 0);

    if (answer) {
      let row = 0;
      let column = 0;
      let incomingBalance = 0;
      while (row < rows && column < columns) {
        const char = grid[row][column];
        const balance = incomingBalance + (char === "(" ? 1 : -1);
        witnessCells.push({
          step: witnessCells.length + 1,
          row,
          column,
          char,
          balance,
        });
        if (row === rows - 1 && column === columns - 1) break;
        const next = choices.get(keyFor(row, column, incomingBalance));
        if (!next) break;
        row = next.row;
        column = next.column;
        incomingBalance = next.incomingBalance;
      }
      witnessComplete = witnessCells.length === pathLength
        && witnessCells[witnessCells.length - 1].row === rows - 1
        && witnessCells[witnessCells.length - 1].column === columns - 1
        && witnessCells[witnessCells.length - 1].balance === 0;
    }

    currentCursor = null;
    currentState = { ...blankState(), result: answer, status: "complete" };
    memoRead = blankMemoAccess();
    memoWrite = blankMemoAccess();
    branch = blankBranch();
    prune = blankPrune();
    emit({
      line: 21,
      event: "final-return",
      phase: "done",
      timing: "before",
      title: localized(`Return ${answer}`, `Trả về ${answer}`),
      note: localized(
        answer
          ? `Witness ${witnessCells.map((cell) => cell.char).join("")} keeps every prefix nonnegative and ends at zero.`
          : "Every feasible memoized state was explored without finding a balanced path.",
        answer
          ? `Witness ${witnessCells.map((cell) => cell.char).join("")} có mọi tiền tố không âm và kết thúc ở 0.`
          : "Mọi trạng thái memo khả thi đã được duyệt nhưng không có đường cân bằng.",
      ),
      final: true,
    });
  }

  return {
    original: grid.map((row) => [...row]),
    answer,
    witness: {
      complete: witnessComplete,
      path: witnessCells.map((cell) => [cell.row, cell.column]),
      string: witnessCells.map((cell) => cell.char).join(""),
      prefixBalances: witnessCells.map((cell) => cell.balance),
      cells: witnessCells.map((cell) => ({ ...cell })),
    },
    memo: memoEntriesSnapshot(),
    counters: { ...counters },
    trace: {
      limit: VALID_PARENTHESES_PATH_2267_TRACE_LIMIT,
      emitted: steps.length,
      dropped: traceDropped,
      truncated: traceDropped > 0,
    },
    steps,
  };
}

module.exports = {
  2267: {
    id: 2267,
    difficulty: "hard",
    slug: "check-if-there-is-a-valid-parentheses-string-path",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    ],
    title: {
      vi: "Check if There Is a Valid Parentheses String Path",
      en: "Check if There Is a Valid Parentheses String Path",
    },
    titleVi: {
      vi: "Kiểm tra đường đi tạo chuỗi ngoặc hợp lệ",
      en: "Valid Parentheses String Path (DFS + memo)",
    },
    statement: {
      vi:
        "Cho lưới ngoặc chữ nhật tối đa 7×7. Đi từ góc trên-trái tới góc dưới-phải, mỗi bước xuống hoặc sang phải. " +
        "Hỏi có đường nào tạo chuỗi ngoặc hợp lệ không. Nhập hàng cách bởi ';' hoặc '|', hoặc dùng JSON matrix.",
      en:
        "Given a rectangular parenthesis grid up to 7×7, move from top-left to bottom-right using only down or right. " +
        "Determine whether some path forms a valid parenthesis string. Separate compact rows with ';' or '|', or use a JSON matrix.",
    },
    defaultInput: "(((;)();(();(()",
    inputKind: "string",
    inputLabel: {
      vi: "Lưới ngoặc ≤7×7 (hàng cách bởi ; hoặc |)",
      en: "Parenthesis grid ≤7×7 (rows separated by ; or |)",
    },
    extraParams: [],
    debugMode: "line-by-line",
    parseValidParenthesesPath2267Input,
    approach: [
      {
        vi: "Loại ngay nếu ô đầu không phải '(', ô cuối không phải ')' hoặc độ dài đường đi là số lẻ.",
        en: "Reject immediately unless the first cell is '(', the last is ')', and every path has even length.",
      },
      {
        vi: "DFS với state (row, col, balance); đọc '(' thì +1, ')' thì −1.",
        en: "DFS on state (row, column, balance); '(' adds 1 and ')' subtracts 1.",
      },
      {
        vi: "Cắt nhánh khi balance âm, lớn hơn số ô còn lại, hoặc sai parity.",
        en: "Prune when balance is negative, exceeds the remaining cells, or has incompatible parity.",
      },
      {
        vi: "Memo hóa toàn bộ state và giữ nhánh thành công đầu tiên để dựng một witness xác định.",
        en: "Memoize every state and retain the first successful branch for a deterministic witness.",
      },
    ],
    complexity: {
      time: "O(m·n·(m+n))",
      space: "O(m·n·(m+n))",
      note: {
        vi: "Có O(m·n·(m+n)) state (ô, balance); mỗi state thử tối đa hai hướng. Stack sâu O(m+n).",
        en: "There are O(m·n·(m+n)) (cell, balance) states; each tries at most two directions. Recursion depth is O(m+n).",
      },
    },
    code: VALID_PARENTHESES_PATH_2267_SOURCE,
    liveArgs: (input) => [parseValidParenthesesPath2267Input(input)],
    builder: buildSteps2267,
  },
};
