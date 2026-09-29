const CHERRY_PICKUP_741_MAX_DIMENSION = 5;
const CHERRY_PICKUP_741_MAX_FRAMES = 2_200;
const CHERRY_PICKUP_741_MEASURED_WORST_CASE_FRAMES = 2_145;
const CHERRY_PICKUP_741_TIE_ORDER = Object.freeze(["RR", "DR", "RD", "DD"]);
const CHERRY_PICKUP_741_SOURCE = Object.freeze([
  "class Solution:",
  "    def cherryPickup(self, grid):",
  "        n = len(grid)",
  "        from functools import lru_cache",
  "        @lru_cache(None)",
  "        def dp(r1, c1, c2):",
  "            r2 = r1 + c1 - c2",
  "            if (r1>=n or c1>=n or r2>=n or c2>=n",
  "                    or grid[r1][c1]==-1 or grid[r2][c2]==-1):",
  "                return float('-inf')",
  "            if r1==n-1 and c1==n-1:",
  "                return grid[r1][c1]",
  "            cherries = grid[r1][c1]",
  "            if c1 != c2: cherries += grid[r2][c2]",
  "            cherries += max(dp(r1,c1+1,c2+1), dp(r1+1,c1,c2+1),",
  "                            dp(r1,c1+1,c2),   dp(r1+1,c1,c2))",
  "            return cherries",
  "        return max(0, dp(0, 0, 0))",
]);
const CHERRY_PICKUP_741_MOVES = Object.freeze([
  Object.freeze({ name: "RR", line: 15, a: "right", b: "right", dr1: 0, dc1: 1, dc2: 1 }),
  Object.freeze({ name: "DR", line: 15, a: "down", b: "right", dr1: 1, dc1: 0, dc2: 1 }),
  Object.freeze({ name: "RD", line: 16, a: "right", b: "down", dr1: 0, dc1: 1, dc2: 0 }),
  Object.freeze({ name: "DD", line: 16, a: "down", b: "down", dr1: 1, dc1: 0, dc2: 0 }),
]);

function parseCherryPickup741Input(input) {
  let candidate;
  if (Array.isArray(input)) {
    candidate = input;
  } else if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new RangeError("Cherry Pickup matrix must be nonempty.");
    if (text.startsWith("[")) {
      try {
        candidate = JSON.parse(text);
      } catch (error) {
        throw new TypeError("Cherry Pickup JSON input must be a valid matrix.");
      }
    } else {
      const rawRows = text.split(/[;|]/);
      if (rawRows.some((row) => !row.trim())) {
        throw new TypeError("Cherry Pickup compact input cannot contain an empty row.");
      }
      candidate = rawRows.map((row) => {
        const rawValues = row.split(",");
        if (rawValues.some((value) => !value.trim())) {
          throw new TypeError("Cherry Pickup compact input cannot contain an empty value.");
        }
        return rawValues.map((value) => Number(value.trim()));
      });
    }
  } else {
    throw new TypeError(
      "Cherry Pickup input must be a compact string, JSON matrix string, or matrix array.",
    );
  }

  if (!Array.isArray(candidate) || candidate.length < 1) {
    throw new RangeError("Cherry Pickup matrix must contain at least one row.");
  }
  if (candidate.length > CHERRY_PICKUP_741_MAX_DIMENSION) {
    throw new RangeError(
      `Cherry Pickup visualization supports dimensions up to ${CHERRY_PICKUP_741_MAX_DIMENSION}x${CHERRY_PICKUP_741_MAX_DIMENSION}.`,
    );
  }

  const dimension = candidate.length;
  return candidate.map((row) => {
    if (!Array.isArray(row) || row.length < 1) {
      throw new TypeError("Every Cherry Pickup row must be a nonempty array.");
    }
    if (row.length !== dimension) {
      throw new RangeError("Cherry Pickup matrix must be square with no ragged rows.");
    }
    return Array.from(row, (value) => {
      if (!Number.isSafeInteger(value)) {
        throw new TypeError("Cherry Pickup matrix values must be safe integers.");
      }
      if (value !== -1 && value !== 0 && value !== 1) {
        throw new RangeError("Cherry Pickup matrix values must be exactly -1, 0, or 1.");
      }
      return value;
    });
  });
}

function deepFreezeCherryPickup741View(value) {
  const active = new Set();
  const freeze = (item, path = "<root>") => {
    if (item === null || typeof item === "string" || typeof item === "boolean") return item;
    if (typeof item === "number") {
      if (!Number.isFinite(item)) {
        throw new TypeError(`#741 view field ${path} must contain a finite number.`);
      }
      return item;
    }
    if (typeof item === "undefined" || typeof item === "function" || typeof item === "symbol"
      || typeof item === "bigint") {
      throw new TypeError(`#741 view field ${path} is not JSON-safe.`);
    }
    if (typeof item !== "object") return item;
    if (active.has(item)) throw new TypeError(`#741 view field ${path} cannot be cyclic.`);
    if (Object.isFrozen(item)) return item;
    const prototype = Object.getPrototypeOf(item);
    if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null) {
      throw new TypeError(`#741 view field ${path} must be a plain JSON object or array.`);
    }
    active.add(item);
    Object.entries(item).forEach(([key, child]) => freeze(child, `${path}.${key}`));
    active.delete(item);
    return Object.freeze(item);
  };
  return freeze(value);
}

function buildSteps741Exact(input) {
  const board = parseCherryPickup741Input(input);
  const frozenBoard = deepFreezeCherryPickup741View(board.map((row) => [...row]));
  const n = board.length;
  const steps = [];
  const memo = new Map();
  const memoRecords = new Map();
  const successorRecords = new Map();
  let memoSnapshot = Object.freeze({});
  let successorSnapshot = Object.freeze({});
  const callStack = [];
  const NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
  const localized = (en, vi) => ({ en, vi });
  let rawRoot = { status: "pending", score: null };
  let reachable = null;
  let answer = null;
  let witness = null;
  let completedRootFrame = null;

  const counters = {
    frames: 0,
    dfsCalls: 0,
    rootCalls: 0,
    rootResults: 0,
    cacheHits: 0,
    cacheMisses: 0,
    helperExecutions: 0,
    boundsGuardChecks: 0,
    thornGuardChecks: 0,
    rejectedReturns: 0,
    destinationChecks: 0,
    destinationReturns: 0,
    cherryReads: 0,
    overlapChecks: 0,
    candidateCalls: 0,
    candidateResults: 0,
    strictMaximumUpdates: 0,
    tiesKeptFirst: 0,
    lowerScoresRejected: 0,
    unreachableCandidates: 0,
    memoWrites: 0,
    choiceWrites: 0,
    successorWrites: 0,
    dfsReturns: 0,
    maxCallDepth: 0,
  };

  const stateKey = (r1, c1, c2) => `${r1},${c1},${c2}`;
  const describeState = (r1, c1, c2) => {
    const r2 = r1 + c1 - c2;
    return {
      key: stateKey(r1, c1, c2),
      state: [r1, c1, c2],
      r1,
      c1,
      c2,
      r2,
      time: r1 + c1,
    };
  };
  const inBounds = (row, column) => row >= 0 && row < n && column >= 0 && column < n;
  const cellView = (row, column) => {
    const inside = inBounds(row, column);
    const value = inside ? board[row][column] : null;
    return {
      row,
      column,
      coordinate: [row, column],
      inBounds: inside,
      status: !inside ? "out-of-bounds" : value === -1 ? "thorn" : "open",
      value,
    };
  };
  const rawResultView = (raw) => raw === NEGATIVE_INFINITY
    ? { status: "unreachable", score: null }
    : { status: "reachable", score: raw };
  const copyCandidate = (candidate) => ({
    order: candidate.order,
    move: candidate.move,
    walkerA: candidate.walkerA,
    walkerB: candidate.walkerB,
    sourceLine: candidate.sourceLine,
    targetState: [...candidate.targetState],
    targetTime: candidate.targetTime,
    status: candidate.status,
    score: candidate.score,
    becameStrictMaximum: candidate.becameStrictMaximum,
    reason: candidate.reason,
  });
  const copyChosen = (chosen) => chosen ? {
    order: chosen.order,
    move: chosen.move,
    targetState: [...chosen.targetState],
    score: chosen.score,
    policy: "first strict maximum in RR > DR > RD > DD order",
  } : null;
  const createFrame = (state, origin) => ({
    key: state.key,
    state: [...state.state],
    time: state.time,
    r2: null,
    status: "entered",
    origin: {
      type: origin.type,
      move: origin.move || null,
      sourceLine: origin.line,
      parentState: origin.parentFrame ? [...origin.parentFrame.state] : null,
    },
    guard: { bounds: null, thorns: null, rejectedBy: null },
    destination: null,
    overlap: { sameCell: null, countedOnce: null },
    gain: { walkerA: null, walkerB: null, total: null, combinedWithBest: null },
    candidates: CHERRY_PICKUP_741_MOVES.map((move, order) => {
      const target = describeState(
        state.r1 + move.dr1,
        state.c1 + move.dc1,
        state.c2 + move.dc2,
      );
      return {
        order,
        move: move.name,
        walkerA: move.a,
        walkerB: move.b,
        sourceLine: move.line,
        targetState: [...target.state],
        targetTime: target.time,
        status: "pending",
        score: null,
        becameStrictMaximum: null,
        reason: "not-evaluated",
      };
    }),
    bestScore: null,
    chosen: null,
    returnValue: { status: "pending", score: null },
  });
  const compactStackFrame = (frame, depth) => ({
    depth,
    key: frame.key,
    state: [...frame.state],
    time: frame.time,
    r2: frame.r2,
    status: frame.status,
    origin: { ...frame.origin, parentState: frame.origin.parentState
      ? [...frame.origin.parentState]
      : null },
  });

  const snapshotView = ({ line, event, phase, timing, condition, state, contextFrame, final }) => {
    const current = state || null;
    const currentKey = current ? current.key : null;
    const topFrame = callStack.length ? callStack[callStack.length - 1] : null;
    const frame = contextFrame || (topFrame && topFrame.key === currentKey ? topFrame : null);
    const memoEntries = memoSnapshot;
    const memoEntryValues = Object.values(memoEntries);
    const memoReachable = memoEntryValues.filter((entry) => entry[0] === "reachable").length;
    const memoUnreachable = memoEntryValues.length - memoReachable;
    const successorMap = successorSnapshot;
    const cells = current ? {
      a: cellView(current.r1, current.c1),
      b: cellView(current.r2, current.c2),
    } : { a: null, b: null };
    const memoStatusesExplicit = Object.values(memoEntries).every(
      (entry) => (entry[0] === "reachable" && Number.isSafeInteger(entry[1]))
        || (entry[0] === "unreachable" && entry[1] === null),
    );
    const successorMapCoversReachableMemo = Object.entries(memoEntries).every(
      ([key, entry]) => entry[0] !== "reachable"
        || Object.prototype.hasOwnProperty.call(successorMap, key),
    );
    const synchronizedTime = current
      ? current.r1 + current.c1 === current.r2 + current.c2
      : null;
    const witnessAssertionsHold = witness === null
      ? null
      : Object.values(witness.assertions).every((value) => value === true || value === null);

    return deepFreezeCherryPickup741View({
      version: 1,
      problemId: 741,
      source: { line, text: CHERRY_PICKUP_741_SOURCE[line - 1] },
      event,
      phase,
      timing,
      condition: condition && typeof condition === "object"
        ? { expression: condition.expression, result: condition.result }
        : { expression: null, result: null },
      limits: {
        minDimension: 1,
        maxDimension: CHERRY_PICKUP_741_MAX_DIMENSION,
        maxFrames: CHERRY_PICKUP_741_MAX_FRAMES,
        measuredWorstCaseFrames: CHERRY_PICKUP_741_MEASURED_WORST_CASE_FRAMES,
      },
      board: frozenBoard,
      tieOrder: CHERRY_PICKUP_741_TIE_ORDER,
      callStack: callStack.map(compactStackFrame),
      currentState: current ? [...current.state] : null,
      currentTime: current ? current.time : null,
      currentR2: frame ? frame.r2 : current ? current.r2 : null,
      currentCells: cells,
      overlap: frame ? { ...frame.overlap } : { sameCell: null, countedOnce: null },
      gain: frame ? { ...frame.gain } : {
        walkerA: null,
        walkerB: null,
        total: null,
        combinedWithBest: null,
      },
      candidates: frame ? frame.candidates.map(copyCandidate) : [],
      chosen: frame ? copyChosen(frame.chosen) : null,
      memo: {
        entrySchema: ["status", "score"],
        entryEncoding: "state key -> [reachable|unreachable, finite score|null]",
        entries: memoEntries,
        status: {
          size: memoEntryValues.length,
          reachable: memoReachable,
          unreachable: memoUnreachable,
          current: currentKey && memoRecords.has(currentKey)
            ? memoRecords.get(currentKey).status
            : currentKey ? "not-cached" : "not-applicable",
        },
      },
      successorSchema: "state key -> [move, successor state]; destination -> [null, null]",
      successorMap,
      counters: { ...counters },
      invariants: {
        definition: "dp(r1,c1,c2) is the best synchronized suffix score; r2 = r1 + c1 - c2",
        sourceEventHasSingletonLine: Number.isInteger(line)
          && line >= 1
          && line <= CHERRY_PICKUP_741_SOURCE.length,
        boardIsNonemptySquare: board.length === n
          && board.every((row) => row.length === n),
        boardDomainIsMinusOneZeroOne: board.every(
          (row) => row.every((value) => value === -1 || value === 0 || value === 1),
        ),
        synchronizedTime,
        callDepthWithinPathBound: callStack.length <= 2 * n,
        memoStatusesExplicit,
        successorMapCoversReachableMemo,
        tieOrderIsDeterministic: CHERRY_PICKUP_741_TIE_ORDER.join(">") === "RR>DR>RD>DD",
        framesWithinLimit: counters.frames <= CHERRY_PICKUP_741_MAX_FRAMES,
        reachableZeroIsDistinct: reachable === true && rawRoot.score === 0
          ? answer === null || answer === 0
          : true,
        answerMatchesRootClamp: answer === null
          ? null
          : answer === (rawRoot.status === "reachable" ? Math.max(0, rawRoot.score) : 0),
        witnessAssertionsHold,
        finalHasWitness: final ? witness !== null : null,
      },
      rawRoot: { ...rawRoot },
      reachable,
      answer,
      witness,
      final,
    });
  };

  const emit = ({
    line,
    event,
    phase,
    timing = "after",
    condition = null,
    state = null,
    contextFrame = null,
    title,
    note,
    final = false,
  }) => {
    if (steps.length >= CHERRY_PICKUP_741_MAX_FRAMES) {
      throw new Error(`#741 frame invariant exceeded ${CHERRY_PICKUP_741_MAX_FRAMES} frames.`);
    }
    counters.frames++;
    const view = snapshotView({
      line,
      event,
      phase,
      timing,
      condition,
      state,
      contextFrame,
      final,
    });
    const activeCells = [];
    if (view.currentCells.a && view.currentCells.a.inBounds) {
      activeCells.push([...view.currentCells.a.coordinate]);
    }
    if (view.currentCells.b && view.currentCells.b.inBounds) {
      const coordinate = view.currentCells.b.coordinate;
      if (!activeCells.some(([row, column]) => row === coordinate[0] && column === coordinate[1])) {
        activeCells.push([...coordinate]);
      }
    }
    const finalPathCells = final && view.witness && view.witness.reachable
      ? view.witness.uniqueVisitedCells.map((cell) => [...cell])
      : activeCells;

    steps.push({
      title,
      note,
      arr: [],
      highlight: [],
      mark: [],
      grid: {
        dp: view.board.map((row) => row.map((value) => value === -1 ? "x" : String(value))),
        text1: Array.from({ length: n }, (_, index) => `r${index}`),
        text2: Array.from({ length: n }, (_, index) => `c${index}`),
        hlCell: activeCells.length ? [...activeCells[0]] : null,
        pathCells: finalPathCells,
        largeCells: true,
        caption: final
          ? `Cherry Pickup answer = ${view.answer}; reachable = ${view.reachable}`
          : `Actual top-down DFS/lru_cache execution (${event})`,
      },
      final,
      codeLines: [line],
      vars: [
        { name: "state", value: view.currentState ? `(${view.currentState.join(", ")})` : "-" },
        { name: "t", value: view.currentTime ?? "-" },
        { name: "memo", value: view.memo.status.size },
        { name: "reachable", value: view.reachable ?? "pending" },
        { name: "raw", value: view.rawRoot.score ?? view.rawRoot.status },
        { name: "answer", value: view.answer ?? "pending" },
      ],
      cherryPickup741View: view,
    });
  };

  emit({
    line: 1,
    event: "bind-class",
    phase: "setup",
    title: localized("Bind Solution class", "Lien ket lop Solution"),
    note: localized(
      "The trace follows the frozen 18-line Python source exactly.",
      "Trace bam sat ma Python 18 dong da dong bang.",
    ),
  });
  emit({
    line: 2,
    event: "bind-method",
    phase: "setup",
    title: localized("Bind cherryPickup method", "Lien ket ham cherryPickup"),
    note: localized(
      "The shared strict parser supplied a fresh square board.",
      "Bo phan tich nghiem ngat dung chung da tao bang vuong moi.",
    ),
  });
  emit({
    line: 3,
    event: "set-dimension",
    phase: "setup",
    title: localized(`Set n = ${n}`, `Dat n = ${n}`),
    note: localized(
      `The visualization accepts dimensions 1 through ${CHERRY_PICKUP_741_MAX_DIMENSION}.`,
      `Visualization chap nhan kich thuoc tu 1 den ${CHERRY_PICKUP_741_MAX_DIMENSION}.`,
    ),
  });
  emit({
    line: 4,
    event: "import-lru-cache",
    phase: "setup",
    title: localized("Import lru_cache", "Nhap lru_cache"),
    note: localized(
      "The simulator reproduces cache misses, cache hits, and writes in execution order.",
      "Bo mo phong tai hien cache miss, cache hit va ghi cache theo thu tu thuc thi.",
    ),
  });
  emit({
    line: 5,
    event: "bind-lru-cache-decorator",
    phase: "setup",
    title: localized("Bind @lru_cache(None)", "Lien ket @lru_cache(None)"),
    note: localized(
      "Unreachable cached results use an explicit status and null score in every view.",
      "Ket qua khong the den trong cache dung trang thai ro rang va diem null trong moi view.",
    ),
  });
  emit({
    line: 6,
    event: "bind-dp-helper",
    phase: "setup",
    title: localized("Bind dp(r1, c1, c2)", "Lien ket dp(r1, c1, c2)"),
    note: localized(
      "The second row is derived, so the memo key needs only three coordinates.",
      "Hang thu hai duoc suy ra, nen khoa memo chi can ba toa do.",
    ),
  });

  const emitOriginResult = (origin, target, raw, completedFrame) => {
    const result = rawResultView(raw);
    if (origin.type === "candidate") {
      const parent = origin.parentFrame;
      const candidate = origin.candidate;
      candidate.status = result.status;
      candidate.score = result.score;
      candidate.becameStrictMaximum = false;
      counters.candidateResults++;
      if (result.status === "unreachable") {
        candidate.reason = "unreachable candidate; it cannot become the maximum";
        counters.unreachableCandidates++;
      } else if (parent.chosen === null || result.score > parent.bestScore) {
        candidate.becameStrictMaximum = true;
        candidate.reason = parent.chosen === null
          ? "first reachable candidate"
          : "strictly greater than the earlier maximum";
        parent.bestScore = result.score;
        parent.chosen = {
          order: candidate.order,
          move: candidate.move,
          targetState: [...candidate.targetState],
          score: candidate.score,
        };
        counters.strictMaximumUpdates++;
      } else if (result.score === parent.bestScore) {
        candidate.reason = `tie at ${result.score}; keep earlier ${parent.chosen.move}`;
        counters.tiesKeptFirst++;
      } else {
        candidate.reason = `${result.score} is below current maximum ${parent.bestScore}`;
        counters.lowerScoresRejected++;
      }
      emit({
        line: origin.line,
        event: `candidate-${candidate.move.toLowerCase()}-result`,
        phase: "transition",
        timing: "after",
        state: describeState(...parent.state),
        contextFrame: parent,
        title: localized(
          `${candidate.move} returned ${result.score ?? "unreachable"}`,
          `${candidate.move} tra ve ${result.score ?? "khong the den"}`,
        ),
        note: localized(
          candidate.reason,
          candidate.reason,
        ),
      });
    } else {
      rawRoot = result;
      reachable = result.status === "reachable";
      completedRootFrame = completedFrame;
      counters.rootResults++;
      emit({
        line: 18,
        event: "root-dfs-result",
        phase: "root",
        timing: "during",
        state: target,
        contextFrame: completedFrame,
        title: localized(
          `dp(0, 0, 0) returned ${result.score ?? "unreachable"}`,
          `dp(0, 0, 0) tra ve ${result.score ?? "khong the den"}`,
        ),
        note: localized(
          "The max(0, ...) clamp and witness checks happen next on this same source line.",
          "Phep kep max(0, ...) va kiem tra duong di dien ra tiep theo tren cung dong nguon.",
        ),
      });
    }
  };

  const cacheCompletedFrame = (frame, raw, terminal) => {
    const popped = callStack.pop();
    if (popped !== frame) throw new Error("#741 DFS call-stack invariant failed.");
    const result = rawResultView(raw);
    const chosen = result.status === "reachable" && !terminal ? frame.chosen : null;
    if (result.status === "reachable" && !terminal && chosen === null) {
      throw new Error(`#741 reachable state ${frame.key} has no chosen successor.`);
    }

    memo.set(frame.key, raw);
    const memoRecord = {
      key: frame.key,
      state: [...frame.state],
      time: frame.time,
      status: result.status,
      score: result.score,
      terminal,
    };
    memoRecords.set(frame.key, memoRecord);
    memoSnapshot = deepFreezeCherryPickup741View({
      ...memoSnapshot,
      [frame.key]: [result.status, result.score],
    });
    counters.memoWrites++;

    if (result.status === "reachable") {
      const successor = chosen ? [...chosen.targetState] : null;
      successorRecords.set(frame.key, {
        state: [...frame.state],
        time: frame.time,
        score: result.score,
        terminal,
        move: chosen ? chosen.move : null,
        successor,
      });
      successorSnapshot = deepFreezeCherryPickup741View({
        ...successorSnapshot,
        [frame.key]: [chosen ? chosen.move : null, successor ? [...successor] : null],
      });
      counters.successorWrites++;
      if (chosen) counters.choiceWrites++;
    }

    emit({
      line: 5,
      event: result.status === "unreachable"
        ? "memo-write-unreachable"
        : terminal ? "memo-write-destination" : "memo-choice-write",
      phase: "memo",
      timing: "after",
      state: describeState(...frame.state),
      contextFrame: frame,
      title: localized(
        result.status === "unreachable"
          ? `Cache ${frame.key} as unreachable`
          : `Cache ${frame.key} = ${result.score}`,
        result.status === "unreachable"
          ? `Luu cache ${frame.key} la khong the den`
          : `Luu cache ${frame.key} = ${result.score}`,
      ),
      note: localized(
        chosen
          ? `The sidecar stores successor ${chosen.move} -> (${chosen.targetState.join(", ")}).`
          : terminal
            ? "The reachable destination is stored with a terminal null successor."
            : "No successor is stored for an unreachable state.",
        chosen
          ? `Sidecar luu ke tiep ${chosen.move} -> (${chosen.targetState.join(", ")}).`
          : terminal
            ? "Dich den duoc luu voi ke tiep null."
            : "Khong luu ke tiep cho trang thai khong the den.",
      ),
    });
    return raw;
  };

  const invokeDp = (r1, c1, c2, origin) => {
    const target = describeState(r1, c1, c2);
    counters.dfsCalls++;
    if (origin.type === "candidate") {
      counters.candidateCalls++;
      origin.candidate.status = "calling";
      origin.candidate.reason = "recursive call in progress";
      emit({
        line: origin.line,
        event: `candidate-${origin.move.toLowerCase()}-call`,
        phase: "transition",
        timing: "before",
        state: describeState(...origin.parentFrame.state),
        contextFrame: origin.parentFrame,
        title: localized(
          `Call ${origin.move}: dp(${target.state.join(", ")})`,
          `Goi ${origin.move}: dp(${target.state.join(", ")})`,
        ),
        note: localized(
          `Candidate order is ${CHERRY_PICKUP_741_TIE_ORDER.join(" > ")}; only a strict improvement replaces the current choice.`,
          `Thu tu ung vien la ${CHERRY_PICKUP_741_TIE_ORDER.join(" > ")}; chi gia tri lon hon nghiem ngat moi thay lua chon.`,
        ),
      });
    } else {
      counters.rootCalls++;
      emit({
        line: 18,
        event: "root-dfs-call",
        phase: "root",
        timing: "before",
        state: target,
        title: localized("Call dp(0, 0, 0)", "Goi dp(0, 0, 0)"),
        note: localized(
          "This is the real root call, before max clamps an unreachable result to zero.",
          "Day la loi goi goc thuc, truoc khi max kep ket qua khong the den ve 0.",
        ),
      });
    }

    if (memo.has(target.key)) {
      counters.cacheHits++;
      const raw = memo.get(target.key);
      const result = rawResultView(raw);
      emit({
        line: 5,
        event: "lru-cache-hit",
        phase: "memo",
        timing: "before",
        condition: { expression: `${target.key} in lru_cache`, result: true },
        state: target,
        title: localized(
          `Cache hit for ${target.key}`,
          `Cache hit cho ${target.key}`,
        ),
        note: localized(
          `Return cached status ${result.status} with score ${result.score ?? "null"}; the helper body does not execute.`,
          `Tra trang thai cache ${result.status} voi diem ${result.score ?? "null"}; than helper khong chay.`,
        ),
      });
      emitOriginResult(origin, target, raw, null);
      return raw;
    }

    counters.cacheMisses++;
    emit({
      line: 5,
      event: "lru-cache-miss",
      phase: "memo",
      timing: "before",
      condition: { expression: `${target.key} in lru_cache`, result: false },
      state: target,
      title: localized(
        `Cache miss for ${target.key}`,
        `Cache miss cho ${target.key}`,
      ),
      note: localized(
        "Execute the helper body, then let the decorator cache its returned value.",
        "Chay than helper, sau do decorator luu gia tri tra ve vao cache.",
      ),
    });

    const frame = createFrame(target, origin);
    callStack.push(frame);
    counters.helperExecutions++;
    counters.maxCallDepth = Math.max(counters.maxCallDepth, callStack.length);
    emit({
      line: 6,
      event: "dfs-enter",
      phase: "dfs",
      timing: "before",
      state: target,
      contextFrame: frame,
      title: localized(
        `Enter dp(${target.state.join(", ")})`,
        `Vao dp(${target.state.join(", ")})`,
      ),
      note: localized(
        `Call depth is ${callStack.length}.`,
        `Do sau loi goi la ${callStack.length}.`,
      ),
    });

    frame.r2 = target.r2;
    frame.status = "derived-r2";
    emit({
      line: 7,
      event: "derive-r2",
      phase: "guard",
      timing: "after",
      state: target,
      contextFrame: frame,
      title: localized(
        `Derive r2 = ${r1} + ${c1} - ${c2} = ${target.r2}`,
        `Suy ra r2 = ${r1} + ${c1} - ${c2} = ${target.r2}`,
      ),
      note: localized(
        `Both walkers are synchronized at time ${target.time}.`,
        `Hai nguoi di dong bo tai thoi diem ${target.time}.`,
      ),
    });

    const boundsRejected = r1 >= n || c1 >= n || target.r2 >= n || c2 >= n;
    frame.guard.bounds = boundsRejected;
    counters.boundsGuardChecks++;
    emit({
      line: 8,
      event: boundsRejected ? "bounds-guard-true" : "bounds-guard-false",
      phase: "guard",
      timing: "before",
      condition: {
        expression: `r1>=${n} or c1>=${n} or r2>=${n} or c2>=${n}`,
        result: boundsRejected,
      },
      state: target,
      contextFrame: frame,
      title: localized(
        boundsRejected ? "Bounds guard rejects this state" : "Bounds guard accepts this state",
        boundsRejected ? "Guard bien loai trang thai nay" : "Guard bien chap nhan trang thai nay",
      ),
      note: localized(
        boundsRejected
          ? "Python short-circuiting skips the thorn reads on the continuation line."
          : "All four coordinates are in bounds, so the thorn terms are safe to read.",
        boundsRejected
          ? "Python short-circuit bo qua viec doc gai tren dong tiep theo."
          : "Ca bon toa do nam trong bien, nen co the doc dieu kien gai an toan.",
      ),
    });

    let thornRejected = false;
    if (!boundsRejected) {
      thornRejected = board[r1][c1] === -1 || board[target.r2][c2] === -1;
      frame.guard.thorns = thornRejected;
      counters.thornGuardChecks++;
      emit({
        line: 9,
        event: thornRejected ? "thorn-guard-true" : "thorn-guard-false",
        phase: "guard",
        timing: "before",
        condition: {
          expression: `grid[${r1}][${c1}]==-1 or grid[${target.r2}][${c2}]==-1`,
          result: thornRejected,
        },
        state: target,
        contextFrame: frame,
        title: localized(
          thornRejected ? "Thorn guard rejects this state" : "Thorn guard accepts this state",
          thornRejected ? "Guard gai loai trang thai nay" : "Guard gai chap nhan trang thai nay",
        ),
        note: localized(
          thornRejected ? "At least one walker stands on a thorn." : "Neither walker stands on a thorn.",
          thornRejected ? "It nhat mot nguoi dung tren gai." : "Khong nguoi nao dung tren gai.",
        ),
      });
    }

    if (boundsRejected || thornRejected) {
      frame.guard.rejectedBy = boundsRejected ? "bounds" : "thorn";
      frame.status = "rejected";
      frame.returnValue = { status: "unreachable", score: null };
      counters.rejectedReturns++;
      counters.dfsReturns++;
      emit({
        line: 10,
        event: "rejected-return",
        phase: "return",
        timing: "before",
        state: target,
        contextFrame: frame,
        title: localized("Return unreachable", "Tra ve khong the den"),
        note: localized(
          "The Python -infinity sentinel is represented as status='unreachable', score=null in JSON.",
          "Sentinel -vo cuc cua Python duoc bieu dien bang status='unreachable', score=null trong JSON.",
        ),
      });
      const raw = cacheCompletedFrame(frame, NEGATIVE_INFINITY, false);
      emitOriginResult(origin, target, raw, frame);
      return raw;
    }

    const atDestination = r1 === n - 1 && c1 === n - 1;
    frame.destination = atDestination;
    counters.destinationChecks++;
    emit({
      line: 11,
      event: atDestination ? "destination-guard-true" : "destination-guard-false",
      phase: "base-case",
      timing: "before",
      condition: {
        expression: `r1==${n - 1} and c1==${n - 1}`,
        result: atDestination,
      },
      state: target,
      contextFrame: frame,
      title: localized(
        atDestination ? "Destination reached" : "Destination not reached",
        atDestination ? "Da den dich" : "Chua den dich",
      ),
      note: localized(
        atDestination
          ? "Synchronization and valid bounds place walker B at the same destination."
          : "Continue with the current-cell gain and four recursive candidates.",
        atDestination
          ? "Dong bo va bien hop le dat nguoi B tai cung dich."
          : "Tiep tuc voi diem o hien tai va bon ung vien de quy.",
      ),
    });

    if (atDestination) {
      const raw = board[r1][c1];
      frame.status = "destination";
      frame.overlap = { sameCell: true, countedOnce: true };
      frame.gain = {
        walkerA: raw,
        walkerB: raw,
        total: raw,
        combinedWithBest: raw,
      };
      frame.returnValue = { status: "reachable", score: raw };
      counters.destinationReturns++;
      counters.dfsReturns++;
      emit({
        line: 12,
        event: "destination-return",
        phase: "return",
        timing: "before",
        state: target,
        contextFrame: frame,
        title: localized(`Return destination value ${raw}`, `Tra gia tri dich ${raw}`),
        note: localized(
          "The destination cherry is counted once for both synchronized walkers.",
          "Anh dao tai dich chi duoc dem mot lan cho hai nguoi dong bo.",
        ),
      });
      const cached = cacheCompletedFrame(frame, raw, true);
      emitOriginResult(origin, target, cached, frame);
      return cached;
    }

    const walkerAValue = board[r1][c1];
    frame.gain.walkerA = walkerAValue;
    frame.gain.total = walkerAValue;
    frame.status = "read-walker-a";
    counters.cherryReads++;
    emit({
      line: 13,
      event: "read-walker-a-cherry",
      phase: "gain",
      timing: "after",
      state: target,
      contextFrame: frame,
      title: localized(
        `Read grid[${r1}][${c1}] = ${walkerAValue}`,
        `Doc grid[${r1}][${c1}] = ${walkerAValue}`,
      ),
      note: localized(
        "Initialize this state's gain from walker A's cell.",
        "Khoi tao diem cua trang thai tu o cua nguoi A.",
      ),
    });

    const differentCells = c1 !== c2;
    const walkerBValue = differentCells ? board[target.r2][c2] : walkerAValue;
    frame.overlap = { sameCell: !differentCells, countedOnce: !differentCells };
    frame.gain.walkerB = walkerBValue;
    if (differentCells) frame.gain.total += walkerBValue;
    frame.status = "checked-overlap";
    counters.overlapChecks++;
    if (differentCells) counters.cherryReads++;
    emit({
      line: 14,
      event: differentCells ? "distinct-cells-add-walker-b" : "overlap-count-once",
      phase: "gain",
      timing: "after",
      condition: { expression: `${c1} != ${c2}`, result: differentCells },
      state: target,
      contextFrame: frame,
      title: localized(
        differentCells
          ? `Add walker B's cell; gain = ${frame.gain.total}`
          : `Walkers overlap; gain remains ${frame.gain.total}`,
        differentCells
          ? `Cong o cua nguoi B; diem = ${frame.gain.total}`
          : `Hai nguoi trung o; diem giu ${frame.gain.total}`,
      ),
      note: localized(
        differentCells
          ? "Different columns at the same time imply different cells, so both values count."
          : "Equal columns imply equal rows, so this cell is counted exactly once.",
        differentCells
          ? "Cot khac nhau cung thoi diem nghia la o khac nhau, nen dem ca hai."
          : "Cot bang nhau suy ra hang bang nhau, nen o nay chi duoc dem mot lan.",
      ),
    });

    for (let moveIndex = 0; moveIndex < CHERRY_PICKUP_741_MOVES.length; moveIndex++) {
      const move = CHERRY_PICKUP_741_MOVES[moveIndex];
      const candidate = frame.candidates[moveIndex];
      invokeDp(
        candidate.targetState[0],
        candidate.targetState[1],
        candidate.targetState[2],
        {
          type: "candidate",
          move: move.name,
          line: move.line,
          parentFrame: frame,
          candidate,
        },
      );
    }

    frame.status = "selected-first-maximum";
    const raw = frame.chosen === null
      ? NEGATIVE_INFINITY
      : frame.gain.total + frame.bestScore;
    frame.gain.combinedWithBest = raw === NEGATIVE_INFINITY ? null : raw;
    frame.returnValue = rawResultView(raw);
    emit({
      line: 15,
      event: "select-first-strict-maximum",
      phase: "transition",
      timing: "after",
      state: target,
      contextFrame: frame,
      title: localized(
        frame.chosen
          ? `Choose ${frame.chosen.move}; total = ${raw}`
          : "All four candidates are unreachable",
        frame.chosen
          ? `Chon ${frame.chosen.move}; tong = ${raw}`
          : "Ca bon ung vien deu khong the den",
      ),
      note: localized(
        frame.chosen
          ? `First strict-maximum policy chose ${frame.chosen.move} in RR > DR > RD > DD order.`
          : "No unreachable sentinel is serialized; the combined score remains null.",
        frame.chosen
          ? `Chinh sach cuc dai nghiem ngat dau tien chon ${frame.chosen.move} theo RR > DR > RD > DD.`
          : "Khong serialize sentinel khong the den; diem ket hop giu null.",
      ),
    });

    frame.status = "returning";
    counters.dfsReturns++;
    emit({
      line: 17,
      event: "dfs-return",
      phase: "return",
      timing: "before",
      state: target,
      contextFrame: frame,
      title: localized(
        raw === NEGATIVE_INFINITY ? "Return unreachable" : `Return ${raw}`,
        raw === NEGATIVE_INFINITY ? "Tra ve khong the den" : `Tra ve ${raw}`,
      ),
      note: localized(
        "After this helper return, @lru_cache records the value and the sidecar records its chosen successor.",
        "Sau khi helper tra ve, @lru_cache luu gia tri va sidecar luu ke tiep da chon.",
      ),
    });
    const cached = cacheCompletedFrame(frame, raw, false);
    emitOriginResult(origin, target, cached, frame);
    return cached;
  };

  const buildWitness = (raw) => {
    if (raw === NEGATIVE_INFINITY) {
      return {
        reachable: false,
        rawScore: null,
        answer: 0,
        pathA: [],
        pathB: [],
        outbound: [],
        returnPath: [],
        perTime: [],
        uniqueVisitedCells: [],
        uniqueVisitedCherryCells: [],
        synchronizedScore: null,
        originalOutAndBackDeduplicatedScore: null,
        assertions: {
          emptyPaths: true,
          reachableIsFalse: true,
          answerIsZero: true,
          rawScoreIsNull: true,
          pathLengthsAreTwoNMinusOne: null,
          legalSynchronizedPaths: null,
          legalReverseReturnPath: null,
          noThorns: null,
          synchronizedScoreMatchesRawAndAnswer: null,
          originalScoreMatchesRawAndAnswer: null,
        },
      };
    }

    const pathA = [];
    const pathB = [];
    let state = describeState(0, 0, 0);
    const expectedLength = 2 * n - 1;
    for (let time = 0; time < expectedLength; time++) {
      pathA.push([state.r1, state.c1]);
      pathB.push([state.r2, state.c2]);
      if (time === expectedLength - 1) break;
      const record = successorRecords.get(state.key);
      if (!record || record.terminal || !record.successor) {
        throw new Error(`#741 witness cannot continue from reachable state ${state.key}.`);
      }
      state = describeState(...record.successor);
    }

    const outbound = pathA.map((cell) => [...cell]);
    const returnPath = [...pathB].reverse().map((cell) => [...cell]);
    const perTime = pathA.map((cellA, time) => {
      const cellB = pathB[time];
      const overlap = cellA[0] === cellB[0] && cellA[1] === cellB[1];
      const walkerA = board[cellA[0]][cellA[1]];
      const walkerB = board[cellB[0]][cellB[1]];
      return {
        time,
        a: [...cellA],
        b: [...cellB],
        overlap,
        walkerA,
        walkerB,
        gain: walkerA + (overlap ? 0 : walkerB),
      };
    });
    const uniqueVisitedCells = [];
    const uniqueVisitedCherryCells = [];
    const visited = new Set();
    for (const { a, b } of perTime) {
      for (const cell of [a, b]) {
        const key = `${cell[0]},${cell[1]}`;
        if (visited.has(key)) continue;
        visited.add(key);
        uniqueVisitedCells.push([...cell]);
        if (board[cell[0]][cell[1]] === 1) uniqueVisitedCherryCells.push([...cell]);
      }
    }
    const synchronizedScore = perTime.reduce((total, item) => total + item.gain, 0);
    const originalTripVisited = new Set();
    let originalOutAndBackDeduplicatedScore = 0;
    for (const cell of [...outbound, ...returnPath]) {
      const key = `${cell[0]},${cell[1]}`;
      if (originalTripVisited.has(key)) continue;
      originalTripVisited.add(key);
      if (board[cell[0]][cell[1]] === 1) originalOutAndBackDeduplicatedScore++;
    }
    const rightDownLegal = (path) => path.every((cell, index) => {
      if (index === 0) return cell[0] === 0 && cell[1] === 0;
      const previous = path[index - 1];
      const dr = cell[0] - previous[0];
      const dc = cell[1] - previous[1];
      return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    });
    const upLeftLegal = returnPath.every((cell, index) => {
      if (index === 0) return cell[0] === n - 1 && cell[1] === n - 1;
      const previous = returnPath[index - 1];
      const dr = cell[0] - previous[0];
      const dc = cell[1] - previous[1];
      return (dr === -1 && dc === 0) || (dr === 0 && dc === -1);
    });
    const noThorns = [...pathA, ...pathB].every(([row, column]) => board[row][column] !== -1);
    const clamped = Math.max(0, raw);
    const assertions = {
      pathLengthsAreTwoNMinusOne: pathA.length === expectedLength
        && pathB.length === expectedLength,
      pathAIsLegalRightDown: rightDownLegal(pathA),
      pathBIsLegalRightDown: rightDownLegal(pathB),
      legalSynchronizedPaths: rightDownLegal(pathA) && rightDownLegal(pathB),
      legalReverseReturnPath: upLeftLegal,
      endpointsMatch: pathA.at(-1)[0] === n - 1
        && pathA.at(-1)[1] === n - 1
        && pathB.at(-1)[0] === n - 1
        && pathB.at(-1)[1] === n - 1
        && returnPath.at(-1)[0] === 0
        && returnPath.at(-1)[1] === 0,
      noThorns,
      synchronizedScoreMatchesRawAndAnswer: synchronizedScore === raw
        && synchronizedScore === clamped,
      originalScoreMatchesRawAndAnswer: originalOutAndBackDeduplicatedScore === raw
        && originalOutAndBackDeduplicatedScore === clamped,
      uniqueCherryCellsMatchScore: uniqueVisitedCherryCells.length === raw,
    };
    if (!Object.values(assertions).every(Boolean)) {
      throw new Error(`#741 witness invariant failed: ${JSON.stringify(assertions)}`);
    }
    return {
      reachable: true,
      rawScore: raw,
      answer: clamped,
      pathA,
      pathB,
      outbound,
      returnPath,
      perTime,
      uniqueVisitedCells,
      uniqueVisitedCherryCells,
      synchronizedScore,
      originalOutAndBackDeduplicatedScore,
      assertions,
    };
  };

  const raw = invokeDp(0, 0, 0, { type: "root", line: 18 });
  answer = raw === NEGATIVE_INFINITY ? 0 : Math.max(0, raw);
  witness = buildWitness(raw);
  emit({
    line: 18,
    event: "root-clamp-final",
    phase: "done",
    timing: "after",
    condition: {
      expression: "max(0, dp(0, 0, 0))",
      result: answer,
    },
    state: describeState(0, 0, 0),
    contextFrame: completedRootFrame,
    title: localized(
      `Return ${answer}; reachable = ${reachable}`,
      `Tra ve ${answer}; co duong di = ${reachable}`,
    ),
    note: localized(
      reachable
        ? `The verified sidecar reconstructs two synchronized paths scoring ${answer}.`
        : "The root is unreachable, so both witness paths are explicitly empty and the clamp returns zero.",
      reachable
        ? `Sidecar da kiem chung dung lai hai duong dong bo co diem ${answer}.`
        : "Goc khong the den, nen hai duong witness rong ro rang va phep kep tra ve 0.",
    ),
    final: true,
  });

  const finalViews = steps.filter((step) => step.final);
  const canonicalLines = steps.every((step) => step.codeLines.length === 1
    && step.codeLines[0] === step.cherryPickup741View.source.line
    && step.cherryPickup741View.source.text
      === CHERRY_PICKUP_741_SOURCE[step.codeLines[0] - 1]);
  if (steps.length !== counters.frames
    || steps.length > CHERRY_PICKUP_741_MAX_FRAMES
    || finalViews.length !== 1
    || !canonicalLines) {
    throw new Error("#741 final frame-count/source-line invariant failed.");
  }

  return {
    original: board.map((row) => [...row]),
    answer,
    reachable,
    witness: deepFreezeCherryPickup741View(witness),
    steps,
  };
}

const CHERRY_PICKUP_741_PARSER_PROPERTIES = Object.freeze({
  formats: Object.freeze(["compact rows separated by | or ;", "JSON matrix string", "matrix array"]),
  square: true,
  nonempty: true,
  safeIntegerDomain: Object.freeze([-1, 0, 1]),
  rejectsEmptyRowsAndTokens: true,
  returnsFreshOuterArrayAndRows: true,
  blockedEndpointsAllowed: true,
});

module.exports = {
  741: {
    id: 741,
    difficulty: "hard",
    slug: "cherry-pickup",
    category: { key: "dp", vi: "Quy hoach dong", en: "Dynamic Programming" },
    tags: [
      { key: "memoization", vi: "Ghi nho", en: "Memoization" },
      { key: "three-dimensional-dp", vi: "DP ba chieu", en: "Three-dimensional DP" },
      { key: "path-reconstruction", vi: "Khoi phuc duong di", en: "Path reconstruction" },
    ],
    title: { vi: "Cherry Pickup", en: "Cherry Pickup" },
    titleVi: { vi: "Nhat anh dao (DP 3 chieu)", en: "Cherry pickup (3D DP)" },
    statement: {
      vi: `Cho luoi vuong n x n (${1} <= n <= ${CHERRY_PICKUP_741_MAX_DIMENSION} cho visualization): 1 la anh dao, 0 la o trong, -1 la gai. Di tu goc tren-trai den goc duoi-phai bang phai/xuong, roi quay lai bang trai/len; moi o anh dao chi tinh mot lan. Neu khong co duong hop le, tra ve 0. Diem dau hoac cuoi bi chan duoc phep de minh hoa truong hop khong the den.`,
      en: `Given an n x n grid (1 <= n <= ${CHERRY_PICKUP_741_MAX_DIMENSION} for visualization) containing cherries 1, empty cells 0, and thorns -1, travel from top-left to bottom-right using right/down and return using left/up; count each cherry cell once. Return 0 when no valid route exists. Blocked starts or destinations are accepted to demonstrate unreachable execution.`,
    },
    explanation: {
      vi: "Doi chuyen di-va-ve thanh hai nguoi cung di phai/xuong tai cung thoi diem t. Trang thai (r1,c1,c2) suy ra r2; @lru_cache tinh dung thu tu DFS. Moi trang thai thu RR, DR, RD, DD va chi thay lua chon khi diem lon hon nghiem ngat, nen hoa duoc giu cho ung vien som nhat. Sau khi diem goc co dinh, sidecar moi khoi phuc hai duong va kiem chung diem da loai trung.",
      en: "Convert the out-and-back trip into two walkers moving right/down at the same time t. State (r1,c1,c2) derives r2, and @lru_cache executes the real DFS order. Every state tries RR, DR, RD, DD and replaces its choice only on a strict improvement, so ties keep the earliest candidate. Only after the root score is fixed does a sidecar reconstruct both paths and verify the deduplicated score.",
    },
    defaultInput: "0,1,-1|1,0,-1|1,1,1",
    inputKind: "string",
    inputLabel: {
      vi: "Luoi vuong: hang cach boi | (hoac JSON), chi -1/0/1",
      en: "Square grid: rows separated by | (or JSON), -1/0/1 only",
    },
    maxInput: CHERRY_PICKUP_741_MAX_DIMENSION,
    limits: {
      minDimension: 1,
      maxDimension: CHERRY_PICKUP_741_MAX_DIMENSION,
      maxFrames: CHERRY_PICKUP_741_MAX_FRAMES,
      measuredWorstCaseFrames: CHERRY_PICKUP_741_MEASURED_WORST_CASE_FRAMES,
      measuredWorstCase: "5x5 board with no thorns",
    },
    tieOrder: CHERRY_PICKUP_741_TIE_ORDER,
    tiePolicy: "first strict maximum: RR > DR > RD > DD",
    parserProperties: CHERRY_PICKUP_741_PARSER_PROPERTIES,
    extraParams: [],
    debugMode: "line-by-line",
    parseCherryPickup741Input,
    parser: parseCherryPickup741Input,
    approach: [
      {
        vi: "Hai nguoi cung o thoi diem t = r+c, nen r2 = r1+c1-c2 va chi can memo ba chieu (r1,c1,c2).",
        en: "Both walkers share time t = r+c, so r2 = r1+c1-c2 and the memo needs only three dimensions (r1,c1,c2).",
      },
      {
        vi: "Moi cache miss chay dung than helper: guard bien/gai, dich, diem hien tai, roi bon loi goi de quy theo RR, DR, RD, DD.",
        en: "Every cache miss executes the helper body exactly: bounds/thorn guard, destination, current gain, then four recursive calls in RR, DR, RD, DD order.",
      },
      {
        vi: "Neu hai nguoi trung o, anh dao chi tinh mot lan. Gia tri khong the den co status rieng va score=null, khong serialize Infinity.",
        en: "When walkers overlap, the cell counts once. Unreachable values use an explicit status and score=null; Infinity is never serialized.",
      },
      {
        vi: "Hoa duoc pha quyet dinh RR > DR > RD > DD bang quy tac chi cap nhat khi lon hon nghiem ngat; moi trang thai den duoc luu ke tiep da chon.",
        en: "Ties resolve deterministically as RR > DR > RD > DD by updating only for a strict increase; every reachable state stores its chosen successor.",
      },
      {
        vi: `Parser dung chung nghiem ngat tao hang moi, bat buoc luoi vuong khong rong chi gom -1/0/1, n <= ${CHERRY_PICKUP_741_MAX_DIMENSION}; trace chi tiet toi da ${CHERRY_PICKUP_741_MAX_FRAMES} frame.`,
        en: `The shared strict parser returns fresh rows and requires a nonempty square -1/0/1 grid with n <= ${CHERRY_PICKUP_741_MAX_DIMENSION}; the detailed trace is capped at ${CHERRY_PICKUP_741_MAX_FRAMES} frames.`,
      },
    ],
    complexity: {
      time: "O(n^3)",
      space: "O(n^3)",
      note: {
        vi: `Co O(n^3) trang thai (r1,c1,c2), moi trang thai co bon chuyen tiep O(1); memo va bang ke tiep ton O(n^3). Visualization gioi han n <= ${CHERRY_PICKUP_741_MAX_DIMENSION} va ${CHERRY_PICKUP_741_MAX_FRAMES} frame.`,
        en: `There are O(n^3) states (r1,c1,c2), each with four O(1) transitions; memo and successor storage use O(n^3). Visualization is limited to n <= ${CHERRY_PICKUP_741_MAX_DIMENSION} and ${CHERRY_PICKUP_741_MAX_FRAMES} frames.`,
      },
    },
    code: CHERRY_PICKUP_741_SOURCE,
    liveArgs: (input) => [parseCherryPickup741Input(input)],
    builder: buildSteps741Exact,
  },
};
