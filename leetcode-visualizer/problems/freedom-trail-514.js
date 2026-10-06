// LeetCode 514 — Freedom Trail focused exact visualization module.

const FREEDOM_TRAIL_514_MAX_RING = 8;
const FREEDOM_TRAIL_514_MAX_KEY = 8;
const FREEDOM_TRAIL_514_SOURCE = Object.freeze([
  "from collections import defaultdict",
  "class Solution:",
  "    def findRotateSteps(self, ring, key):",
  "        n = len(ring)",
  "        positions = defaultdict(list)",
  "        for index, char in enumerate(ring):",
  "            positions[char].append(index)",
  "        dp = {0: 0}",
  "        parents = []",
  "        for char in key:",
  "            next_dp = {}",
  "            parent = {}",
  "            for target in positions[char]:",
  "                best = None",
  "                for previous in sorted(dp):",
  "                    clockwise = (previous - target) % n",
  "                    counterclockwise = (target - previous) % n",
  "                    if target == previous:",
  "                        turns, direction, rank = 0, \"stay\", 0",
  "                    elif clockwise <= counterclockwise:",
  "                        turns, direction, rank = clockwise, \"clockwise\", 1",
  "                    else:",
  "                        turns, direction, rank = counterclockwise, \"counterclockwise\", 2",
  "                    candidate = (dp[previous] + turns + 1, previous, rank, turns, direction)",
  "                    if best is None or candidate[:3] < best[:3]:",
  "                        best = candidate",
  "                next_dp[target] = best[0]",
  "                parent[target] = (best[1], best[3], best[4])",
  "            dp = next_dp",
  "            parents.append(parent)",
  "        end = min(dp, key=lambda position: (dp[position], position))",
  "        answer = dp[end]",
  "        actions = []",
  "        for layer in range(len(key) - 1, -1, -1):",
  "            previous, turns, direction = parents[layer][end]",
  "            actions.append((previous, end, direction, turns, key[layer]))",
  "            end = previous",
  "        actions.reverse()",
  "        return answer",
]);

function parseFreedomTrail514Input(input, params) {
  if (typeof input !== "string") throw new TypeError("Freedom Trail ring must be a string.");
  const key = params && params.key;
  if (typeof key !== "string") throw new TypeError("Freedom Trail key must be a string.");
  if (!/^[a-z]+$/.test(input)) {
    throw new TypeError("Freedom Trail ring must contain lowercase English letters only.");
  }
  if (!/^[a-z]+$/.test(key)) {
    throw new TypeError("Freedom Trail key must contain lowercase English letters only.");
  }
  if (input.length > FREEDOM_TRAIL_514_MAX_RING) {
    throw new RangeError(`Freedom Trail visualization supports a ring of at most ${FREEDOM_TRAIL_514_MAX_RING} characters.`);
  }
  if (key.length > FREEDOM_TRAIL_514_MAX_KEY) {
    throw new RangeError(`Freedom Trail visualization supports a key of at most ${FREEDOM_TRAIL_514_MAX_KEY} characters.`);
  }
  const available = new Set(input);
  const missing = [...key].find((char) => !available.has(char));
  if (missing) throw new RangeError(`Freedom Trail key character \"${missing}\" does not occur in the ring.`);
  return { ring: input, key };
}

function deepFreezeFreedomTrail514View(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function buildSteps514Exact(input, params) {
  const parsed = parseFreedomTrail514Input(input, params);
  const { ring, key } = parsed;
  const steps = [];
  const localized = (en, vi) => ({ en, vi });
  const counters = {
    ringVisits: 0,
    occurrenceWrites: 0,
    keyLayers: 0,
    targets: 0,
    predecessorTransitions: 0,
    clockwiseComputations: 0,
    counterclockwiseComputations: 0,
    stays: 0,
    clockwiseChoices: 0,
    counterclockwiseChoices: 0,
    candidates: 0,
    bestUpdates: 0,
    bestKeeps: 0,
    costWrites: 0,
    parentWrites: 0,
    reconstructionReads: 0,
    witnessTurns: 0,
    witnessPresses: 0,
  };
  const positions = new Map();
  let positionsAllocated = false;
  let n = null;
  let ringIndex = null;
  let ringChar = null;
  let dp = new Map();
  let dpLayer = -1;
  let nextDp = null;
  let nextDpChar = null;
  let parent = null;
  const parents = [];
  const dpRows = [];
  let keyIndex = null;
  let keyChar = null;
  let target = null;
  let previous = null;
  let clockwise = null;
  let counterclockwise = null;
  let turns = null;
  let direction = null;
  let directionRank = null;
  let rotationPath = [];
  let best = null;
  let candidate = null;
  let candidateOutcome = "idle";
  let end = null;
  let answer = null;
  let reconstructLayer = null;
  let currentAction = null;
  let actions = [];
  let actionsReversed = false;
  let witnessComplete = false;

  const mapEntries = (map) => map instanceof Map
    ? [...map.entries()].sort(([left], [right]) => left - right).map(([position, cost]) => ({ position, cost }))
    : [];
  const parentEntries = (map) => map instanceof Map
    ? [...map.entries()].sort(([left], [right]) => left - right).map(([position, link]) => ({
      position,
      previous: link.previous,
      turns: link.turns,
      direction: link.direction,
    }))
    : [];
  const positionEntries = () => [...positions.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([char, indices]) => ({ char, indices: [...indices] }));
  const copyCandidate = (value) => value ? {
    total: value.total,
    previous: value.previous,
    rank: value.rank,
    turns: value.turns,
    direction: value.direction,
    baseCost: value.baseCost,
    target: value.target,
  } : null;
  const copyAction = (action) => action ? {
    layer: action.layer,
    char: action.char,
    from: action.from,
    to: action.to,
    direction: action.direction,
    turns: action.turns,
    rotationPath: [...action.rotationPath],
    press: action.press,
    cost: action.cost,
  } : null;
  const physicalPath = (from, to, move, count) => {
    const path = [];
    let aligned = from;
    for (let step = 0; step < count; step++) {
      aligned = move === "clockwise" ? (aligned - 1 + ring.length) % ring.length : (aligned + 1) % ring.length;
      path.push(aligned);
    }
    if (path.length && path[path.length - 1] !== to) throw new Error("Freedom Trail physical rotation path invariant failed.");
    if (!path.length && from !== to) throw new Error("Freedom Trail zero-turn path invariant failed.");
    return path;
  };
  const witnessIsValid = () => {
    if (!witnessComplete || actions.length !== key.length || answer === null) return null;
    let aligned = 0;
    let cost = 0;
    for (let layer = 0; layer < actions.length; layer++) {
      const action = actions[layer];
      if (action.layer !== layer || action.char !== key[layer] || action.from !== aligned) return false;
      if (ring[action.to] !== action.char || action.rotationPath.length !== action.turns) return false;
      const expectedPath = physicalPath(action.from, action.to, action.direction, action.turns);
      if (JSON.stringify(expectedPath) !== JSON.stringify(action.rotationPath)) return false;
      aligned = action.to;
      cost += action.turns + 1;
    }
    return cost === answer;
  };
  const snapshotView = ({ line, event, phase, timing, condition, final }) => {
    const activeAligned = previous !== null ? previous : currentAction ? currentAction.from : 0;
    return deepFreezeFreedomTrail514View({
      version: 1,
      problemId: 514,
      source: { line, text: FREEDOM_TRAIL_514_SOURCE[line - 1] },
      event,
      phase,
      timing,
      condition: condition && typeof condition === "object"
        ? { expression: condition.expression, result: condition.result }
        : { expression: null, result: null },
      input: {
        ring,
        key,
        length: ring.length,
        limits: { maxRing: FREEDOM_TRAIL_514_MAX_RING, maxKey: FREEDOM_TRAIL_514_MAX_KEY },
      },
      positions: {
        allocated: positionsAllocated,
        entries: positionEntries(),
        ringIndex,
        ringChar,
      },
      cursor: {
        keyIndex,
        keyChar,
        target,
        previous,
        aligned: activeAligned,
      },
      rotation: {
        clockwise,
        counterclockwise,
        turns,
        direction,
        rank: directionRank,
        path: [...rotationPath],
      },
      candidate: {
        value: copyCandidate(candidate),
        incumbent: copyCandidate(best),
        outcome: candidateOutcome,
      },
      frontier: {
        layer: dpLayer,
        nextChar: nextDpChar,
        dp: mapEntries(dp),
        next: mapEntries(nextDp),
        best: copyCandidate(best),
        parent: parentEntries(parent),
        completedLayers: dpRows.length - 1,
      },
      table: dpRows.map((row) => ({
        layer: row.layer,
        char: row.char,
        costs: row.costs.map((entry) => ({ ...entry })),
      })),
      parents: parents.map((layerMap, layer) => ({
        layer,
        char: key[layer],
        links: parentEntries(layerMap),
      })),
      reconstruction: {
        layer: reconstructLayer,
        end,
        current: copyAction(currentAction),
        actions: actions.map(copyAction),
        reversed: actionsReversed,
        complete: witnessComplete,
      },
      invariants: {
        dpPositionsMatchLayer: dpLayer < 0 || mapEntries(dp).every((entry) => ring[entry.position] === key[dpLayer]),
        nextPositionsMatchChar: nextDp === null || nextDpChar === null || mapEntries(nextDp).every((entry) => ring[entry.position] === nextDpChar),
        parentCoversNext: nextDp === null || parent === null || mapEntries(nextDp).every((entry) => parent.has(entry.position)),
        costsFinite: [...dp.values(), ...(nextDp instanceof Map ? nextDp.values() : [])].every(Number.isSafeInteger),
        witnessValid: witnessIsValid(),
      },
      counters: { ...counters },
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
    const view = snapshotView({ line, event, phase, timing, condition, final });
    const highlighted = [view.cursor.previous, view.cursor.target].filter((value, index, values) => Number.isInteger(value) && values.indexOf(value) === index);
    const witnessTargets = view.reconstruction.actions.map((action) => action.to);
    steps.push({
      title,
      note,
      arr: ring.split("").map(() => 1),
      sub: ring.split("").map((char, index) => `[${index}] ${char}`),
      highlight: highlighted,
      mark: witnessTargets,
      final,
      codeLines: [line],
      vars: [
        { name: "layer / key", value: keyIndex === null ? "—" : `${keyIndex} / ${keyChar}` },
        { name: "previous", value: previous ?? "—" },
        { name: "target", value: target ?? "—" },
        { name: "clockwise", value: clockwise ?? "—" },
        { name: "counterclockwise", value: counterclockwise ?? "—" },
        { name: "answer", value: answer ?? "—" },
      ],
      freedomTrail514View: view,
    });
  };
  const resetTransition = () => {
    target = null;
    previous = null;
    clockwise = null;
    counterclockwise = null;
    turns = null;
    direction = null;
    directionRank = null;
    rotationPath = [];
    best = null;
    candidate = null;
    candidateOutcome = "idle";
  };
  const lexicographicallySmaller = (left, right) => {
    if (!right) return true;
    const leftTuple = [left.total, left.previous, left.rank];
    const rightTuple = [right.total, right.previous, right.rank];
    for (let index = 0; index < leftTuple.length; index++) {
      if (leftTuple[index] !== rightTuple[index]) return leftTuple[index] < rightTuple[index];
    }
    return false;
  };

  emit({ line: 1, event: "import-defaultdict", phase: "setup", title: localized("Import defaultdict", "Import defaultdict"), note: localized("Occurrence lists are created on first character access.", "Danh sách occurrence được tạo khi truy cập ký tự lần đầu.") });
  emit({ line: 2, event: "bind-class", phase: "setup", title: localized("Bind Solution class", "Liên kết lớp Solution"), note: localized("The solution owns one layered position-state DP method.", "Solution chứa một method DP theo tầng trạng thái vị trí.") });
  emit({ line: 3, event: "bind-method", phase: "setup", title: localized("Bind findRotateSteps", "Liên kết findRotateSteps"), note: localized("The method returns rotations plus one press for every key character.", "Method trả số lần quay cộng một lần nhấn cho mỗi ký tự key.") });

  n = ring.length;
  emit({ line: 4, event: "set-ring-size", phase: "setup", title: localized(`n = ${n}`, `n = ${n}`), note: localized("All modular distances use the fixed ring length.", "Mọi khoảng cách modulo dùng độ dài ring cố định.") });
  positionsAllocated = true;
  emit({ line: 5, event: "allocate-positions", phase: "setup", title: localized("Allocate occurrence index", "Tạo index occurrence"), note: localized("Each character maps to every original ring index where it occurs.", "Mỗi ký tự ánh xạ tới mọi index gốc nơi nó xuất hiện.") });
  for (let index = 0; index < ring.length; index++) {
    ringIndex = index;
    ringChar = ring[index];
    counters.ringVisits++;
    emit({ line: 6, event: "scan-ring", phase: "setup", timing: "before", condition: { expression: `${index} < ${ring.length}`, result: true }, title: localized(`Read ring[${index}] = ${ringChar}`, `Đọc ring[${index}] = ${ringChar}`), note: localized("Record this original clockwise index under its character.", "Ghi index gốc theo chiều kim đồng hồ dưới ký tự này.") });
    if (!positions.has(ringChar)) positions.set(ringChar, []);
    positions.get(ringChar).push(index);
    counters.occurrenceWrites++;
    emit({ line: 7, event: "append-position", phase: "setup", title: localized(`positions[${ringChar}] += ${index}`, `positions[${ringChar}] += ${index}`), note: localized(`Occurrences of ${ringChar}: [${positions.get(ringChar).join(", ")}].`, `Các occurrence của ${ringChar}: [${positions.get(ringChar).join(", ")}].`) });
  }
  ringIndex = null;
  ringChar = null;
  emit({ line: 6, event: "scan-ring-complete", phase: "setup", timing: "before", condition: { expression: `${ring.length} < ${ring.length}`, result: false }, title: localized("Occurrence scan complete", "Quét occurrence hoàn tất"), note: localized(`Indexed ${ring.length} ring positions without rotating the ring.`, `Đã index ${ring.length} vị trí ring mà chưa quay ring.`) });

  dp = new Map([[0, 0]]);
  dpRows.push({ layer: -1, char: "", costs: mapEntries(dp) });
  emit({ line: 8, event: "seed-dp", phase: "setup", title: localized("Seed dp[0] = 0", "Khởi tạo dp[0] = 0"), note: localized("Before spelling any character, original index 0 is aligned at twelve o'clock with zero cost.", "Trước khi đánh ký tự nào, index gốc 0 nằm tại vị trí 12 giờ với cost 0.") });
  emit({ line: 9, event: "allocate-parents", phase: "setup", title: localized("Initialize parent layers", "Khởi tạo các tầng parent"), note: localized("One parent map per key layer will preserve a deterministic optimal witness.", "Một parent map cho mỗi tầng key sẽ lưu witness tối ưu xác định.") });

  for (let layer = 0; layer < key.length; layer++) {
    keyIndex = layer;
    keyChar = key[layer];
    resetTransition();
    counters.keyLayers++;
    emit({ line: 10, event: "select-key-character", phase: "transition", timing: "before", condition: { expression: `${layer} < ${key.length}`, result: true }, title: localized(`Layer ${layer}: spell ${keyChar}`, `Tầng ${layer}: đánh ${keyChar}`), note: localized(`Current dp exactly represents key[:${layer}] = \"${key.slice(0, layer)}\".`, `dp hiện tại biểu diễn chính xác key[:${layer}] = \"${key.slice(0, layer)}\".`) });
    nextDp = new Map();
    nextDpChar = keyChar;
    emit({ line: 11, event: "allocate-next-frontier", phase: "transition", title: localized("Initialize next_dp", "Khởi tạo next_dp"), note: localized(`Only ring positions containing ${keyChar} can appear in this frontier.`, `Chỉ vị trí ring chứa ${keyChar} mới xuất hiện trong frontier này.`) });
    parent = new Map();
    emit({ line: 12, event: "allocate-layer-parent", phase: "transition", title: localized("Initialize this layer's parent map", "Khởi tạo parent map của tầng"), note: localized("Each target stores its selected predecessor, physical direction, and turn count.", "Mỗi target lưu predecessor, hướng quay vật lý và số bước quay được chọn.") });

    const targets = [...positions.get(keyChar)];
    for (let targetIndex = 0; targetIndex < targets.length; targetIndex++) {
      target = targets[targetIndex];
      previous = null;
      counters.targets++;
      emit({ line: 13, event: "select-target", phase: "transition", timing: "before", condition: { expression: `${targetIndex} < ${targets.length}`, result: true }, title: localized(`Target occurrence ${keyChar}@${target}`, `Occurrence đích ${keyChar}@${target}`), note: localized("Evaluate every reachable predecessor for this exact occurrence.", "Đánh giá mọi predecessor tới được cho occurrence chính xác này.") });
      best = null;
      candidate = null;
      candidateOutcome = "idle";
      emit({ line: 14, event: "reset-best", phase: "transition", title: localized("Set best = None", "Đặt best = None"), note: localized("No transition to this target has been accepted yet.", "Chưa chấp nhận transition nào tới target này.") });

      const predecessors = [...dp.keys()].sort((left, right) => left - right);
      for (let predecessorIndex = 0; predecessorIndex < predecessors.length; predecessorIndex++) {
        previous = predecessors[predecessorIndex];
        clockwise = null;
        counterclockwise = null;
        turns = null;
        direction = null;
        directionRank = null;
        rotationPath = [];
        candidate = null;
        candidateOutcome = "pending";
        counters.predecessorTransitions++;
        emit({ line: 15, event: "select-predecessor", phase: "transition", timing: "before", condition: { expression: `${predecessorIndex} < ${predecessors.length}`, result: true }, title: localized(`Try previous position ${previous}`, `Thử vị trí trước ${previous}`), note: localized(`The exact completed-prefix cost is dp[${previous}] = ${dp.get(previous)}.`, `Cost chính xác của prefix đã hoàn tất là dp[${previous}] = ${dp.get(previous)}.`) });
        clockwise = (previous - target + n) % n;
        counters.clockwiseComputations++;
        emit({ line: 16, event: "compute-clockwise", phase: "transition", title: localized(`Physical clockwise turns = ${clockwise}`, `Số bước quay ring theo chiều kim đồng hồ = ${clockwise}`), note: localized("A physical clockwise ring rotation moves the aligned original index downward modulo n.", "Quay ring vật lý theo chiều kim đồng hồ làm index gốc đang căn chỉnh giảm theo modulo n.") });
        counterclockwise = (target - previous + n) % n;
        counters.counterclockwiseComputations++;
        emit({ line: 17, event: "compute-counterclockwise", phase: "transition", title: localized(`Physical counterclockwise turns = ${counterclockwise}`, `Số bước quay ring ngược chiều kim đồng hồ = ${counterclockwise}`), note: localized("A physical counterclockwise ring rotation moves the aligned original index upward modulo n.", "Quay ring vật lý ngược chiều kim đồng hồ làm index gốc đang căn chỉnh tăng theo modulo n.") });
        const stays = target === previous;
        emit({ line: 18, event: stays ? "stay-check-true" : "stay-check-false", phase: "transition", condition: { expression: `${target} == ${previous}`, result: stays }, title: localized(`Already aligned? ${stays}`, `Đã căn chỉnh? ${stays}`), note: stays ? localized("No rotation is needed, but pressing still costs one step.", "Không cần quay, nhưng nhấn vẫn tốn một bước.") : localized("Choose the shorter physical rotation direction.", "Chọn hướng quay vật lý ngắn hơn.") });
        if (stays) {
          turns = 0;
          direction = "stay";
          directionRank = 0;
          counters.stays++;
          emit({ line: 19, event: "choose-stay", phase: "transition", title: localized("Choose stay, 0 turns", "Chọn đứng yên, 0 bước quay"), note: localized("Direction rank 0 makes the no-rotation case explicit.", "Rank hướng 0 biểu diễn rõ trường hợp không quay.") });
        } else {
          const chooseClockwise = clockwise <= counterclockwise;
          emit({ line: 20, event: chooseClockwise ? "clockwise-check-true" : "clockwise-check-false", phase: "transition", condition: { expression: `${clockwise} <= ${counterclockwise}`, result: chooseClockwise }, title: localized(`Clockwise no longer? ${chooseClockwise}`, `Chiều kim đồng hồ không dài hơn? ${chooseClockwise}`), note: chooseClockwise ? localized("Choose physical clockwise; it also wins exact half-ring ties.", "Chọn chiều kim đồng hồ vật lý; hướng này cũng thắng khi hòa nửa vòng.") : localized("Counterclockwise is strictly shorter.", "Ngược chiều kim đồng hồ ngắn hơn nghiêm ngặt.") });
          if (chooseClockwise) {
            turns = clockwise;
            direction = "clockwise";
            directionRank = 1;
            counters.clockwiseChoices++;
            emit({ line: 21, event: "choose-clockwise", phase: "transition", title: localized(`Choose clockwise, ${turns} turn(s)`, `Chọn chiều kim đồng hồ, ${turns} bước quay`), note: localized("Rank 1 gives clockwise priority over counterclockwise on equal distance.", "Rank 1 ưu tiên chiều kim đồng hồ hơn ngược chiều khi khoảng cách hòa.") });
          } else {
            emit({ line: 22, event: "direction-else", phase: "transition", timing: "before", title: localized("Enter counterclockwise branch", "Vào nhánh ngược chiều kim đồng hồ"), note: localized("The clockwise comparison was false; no state changes on the else line.", "So sánh chiều kim đồng hồ sai; dòng else chưa đổi trạng thái.") });
            turns = counterclockwise;
            direction = "counterclockwise";
            directionRank = 2;
            counters.counterclockwiseChoices++;
            emit({ line: 23, event: "choose-counterclockwise", phase: "transition", title: localized(`Choose counterclockwise, ${turns} turn(s)`, `Chọn ngược chiều kim đồng hồ, ${turns} bước quay`), note: localized("Rank 2 records the strictly shorter counterclockwise move.", "Rank 2 ghi lại bước ngược chiều kim đồng hồ ngắn hơn nghiêm ngặt.") });
          }
        }
        rotationPath = physicalPath(previous, target, direction, turns);
        candidate = {
          total: dp.get(previous) + turns + 1,
          previous,
          rank: directionRank,
          turns,
          direction,
          baseCost: dp.get(previous),
          target,
        };
        counters.candidates++;
        emit({ line: 24, event: "build-candidate", phase: "transition", title: localized(`Candidate = ${candidate.total} (${dp.get(previous)} + ${turns} + press)`, `Ứng viên = ${candidate.total} (${dp.get(previous)} + ${turns} + nhấn)`), note: localized("The +1 press is mandatory even when the ring stays aligned.", "Phép +1 nhấn là bắt buộc kể cả khi ring đứng yên.") });
        const replace = lexicographicallySmaller(candidate, best);
        candidateOutcome = replace ? "update" : "keep";
        emit({ line: 25, event: replace ? "candidate-better" : "candidate-kept-out", phase: "transition", condition: { expression: best ? `(${candidate.total}, ${candidate.previous}, ${candidate.rank}) < (${best.total}, ${best.previous}, ${best.rank})` : "best is None", result: replace }, title: localized(replace ? "Candidate becomes the best" : "Keep the incumbent best", replace ? "Ứng viên trở thành best" : "Giữ best hiện tại"), note: replace ? localized("Lower total wins; ties prefer smaller predecessor, then direction rank.", "Total nhỏ hơn thắng; khi hòa ưu tiên predecessor nhỏ hơn, rồi rank hướng.") : localized("This legal transition is not better under the deterministic tuple order.", "Transition hợp lệ này không tốt hơn theo thứ tự tuple xác định.") });
        if (replace) {
          best = { ...candidate };
          counters.bestUpdates++;
          emit({ line: 26, event: "replace-best", phase: "transition", title: localized(`best = (${best.total}, prev ${best.previous})`, `best = (${best.total}, prev ${best.previous})`), note: localized("Store the complete transition so cost and witness cannot diverge.", "Lưu toàn bộ transition để cost và witness không thể lệch nhau.") });
        } else {
          counters.bestKeeps++;
        }
      }
      previous = null;
      emit({ line: 15, event: "predecessor-loop-complete", phase: "transition", timing: "before", condition: { expression: `${predecessors.length} < ${predecessors.length}`, result: false }, title: localized(`All predecessors tested for target ${target}`, `Đã thử mọi predecessor cho target ${target}`), note: localized(`The selected cost is ${best.total} from position ${best.previous}.`, `Cost được chọn là ${best.total} từ vị trí ${best.previous}.`) });
      nextDp.set(target, best.total);
      counters.costWrites++;
      emit({ line: 27, event: "write-next-cost", phase: "transition", title: localized(`next_dp[${target}] = ${best.total}`, `next_dp[${target}] = ${best.total}`), note: localized("This is the exact minimum for the current character ending at this target occurrence.", "Đây là minimum chính xác cho ký tự hiện tại khi kết thúc tại occurrence đích này.") });
      parent.set(target, { previous: best.previous, turns: best.turns, direction: best.direction });
      counters.parentWrites++;
      emit({ line: 28, event: "write-parent", phase: "transition", title: localized(`parent[${target}] = (${best.previous}, ${best.turns}, ${best.direction})`, `parent[${target}] = (${best.previous}, ${best.turns}, ${best.direction})`), note: localized("The parent link reproduces the same transition selected by the DP cost.", "Liên kết parent tái tạo đúng transition mà DP cost đã chọn.") });
    }
    target = null;
    emit({ line: 13, event: "target-loop-complete", phase: "transition", timing: "before", condition: { expression: `${targets.length} < ${targets.length}`, result: false }, title: localized(`All ${keyChar} occurrences completed`, `Hoàn tất mọi occurrence ${keyChar}`), note: localized(`next_dp has ${nextDp.size} state(s), one per ${keyChar} occurrence.`, `next_dp có ${nextDp.size} trạng thái, mỗi occurrence ${keyChar} một trạng thái.`) });
    dp = new Map(nextDp);
    dpLayer = layer;
    emit({ line: 29, event: "commit-frontier", phase: "transition", title: localized(`Commit layer ${layer} frontier`, `Commit frontier tầng ${layer}`), note: localized(`dp now exactly represents key[:${layer + 1}] = \"${key.slice(0, layer + 1)}\".`, `dp giờ biểu diễn chính xác key[:${layer + 1}] = \"${key.slice(0, layer + 1)}\".`) });
    parents.push(new Map(parent));
    dpRows.push({ layer, char: keyChar, costs: mapEntries(dp) });
    emit({ line: 30, event: "append-parent-layer", phase: "transition", title: localized(`Store parent layer ${layer}`, `Lưu parent tầng ${layer}`), note: localized("The immutable layer history is now ready for backward reconstruction.", "Lịch sử tầng bất biến giờ sẵn sàng cho tái dựng ngược.") });
  }
  keyIndex = null;
  keyChar = null;
  nextDp = null;
  nextDpChar = null;
  parent = null;
  resetTransition();
  emit({ line: 10, event: "key-loop-complete", phase: "transition", timing: "before", condition: { expression: `${key.length} < ${key.length}`, result: false }, title: localized("All key layers complete", "Mọi tầng key hoàn tất"), note: localized("Every final frontier state spells the entire key.", "Mọi trạng thái frontier cuối đều đã đánh toàn bộ key.") });

  end = [...dp.entries()].sort(([leftPosition, leftCost], [rightPosition, rightCost]) => leftCost - rightCost || leftPosition - rightPosition)[0][0];
  emit({ line: 31, event: "select-final-position", phase: "reconstruction", title: localized(`Choose final position ${end}`, `Chọn vị trí cuối ${end}`), note: localized(`Minimum final tuple is (cost ${dp.get(end)}, position ${end}).`, `Tuple cuối nhỏ nhất là (cost ${dp.get(end)}, vị trí ${end}).`) });
  answer = dp.get(end);
  emit({ line: 32, event: "capture-answer", phase: "reconstruction", title: localized(`answer = ${answer}`, `answer = ${answer}`), note: localized("This includes every physical turn and every required button press.", "Giá trị này gồm mọi bước quay vật lý và mọi lần nhấn bắt buộc.") });
  actions = [];
  actionsReversed = false;
  emit({ line: 33, event: "initialize-actions", phase: "reconstruction", title: localized("Initialize reverse action list", "Khởi tạo danh sách action ngược"), note: localized("Parents are followed from the final layer back to the initial aligned position 0.", "Đi theo parent từ tầng cuối về vị trí căn chỉnh ban đầu 0.") });

  for (let layer = key.length - 1; layer >= 0; layer--) {
    reconstructLayer = layer;
    currentAction = null;
    emit({ line: 34, event: "reconstruct-layer", phase: "reconstruction", timing: "before", condition: { expression: `${layer} >= 0`, result: true }, title: localized(`Reconstruct layer ${layer}`, `Tái dựng tầng ${layer}`), note: localized(`Current endpoint is ${end} for key[${layer}] = ${key[layer]}.`, `Endpoint hiện tại là ${end} cho key[${layer}] = ${key[layer]}.`) });
    const link = parents[layer].get(end);
    counters.reconstructionReads++;
    currentAction = {
      layer,
      char: key[layer],
      from: link.previous,
      to: end,
      direction: link.direction,
      turns: link.turns,
      rotationPath: physicalPath(link.previous, end, link.direction, link.turns),
      press: true,
      cost: link.turns + 1,
    };
    emit({ line: 35, event: "read-parent", phase: "reconstruction", title: localized(`Read parent: ${link.previous} → ${end}`, `Đọc parent: ${link.previous} → ${end}`), note: localized(`${link.direction} for ${link.turns} turn(s), then press ${key[layer]}.`, `${link.direction} trong ${link.turns} bước quay, rồi nhấn ${key[layer]}.`) });
    actions.push({ ...currentAction, rotationPath: [...currentAction.rotationPath] });
    counters.witnessTurns += link.turns;
    counters.witnessPresses++;
    emit({ line: 36, event: "append-action", phase: "reconstruction", title: localized(`Append action for ${key[layer]}`, `Thêm action cho ${key[layer]}`), note: localized(`Reverse reconstruction now holds ${actions.length}/${key.length} action(s).`, `Tái dựng ngược hiện giữ ${actions.length}/${key.length} action.`) });
    end = link.previous;
    emit({ line: 37, event: "move-to-parent", phase: "reconstruction", title: localized(`end = ${end}`, `end = ${end}`), note: localized("Continue from this predecessor in the preceding key layer.", "Tiếp tục từ predecessor này trong tầng key trước.") });
  }
  reconstructLayer = null;
  currentAction = null;
  emit({ line: 34, event: "reconstruction-loop-complete", phase: "reconstruction", timing: "before", condition: { expression: "-1 >= 0", result: false }, title: localized("Backward reconstruction complete", "Tái dựng ngược hoàn tất"), note: localized("The first predecessor has returned to original ring position 0.", "Predecessor đầu tiên đã trở về vị trí ring gốc 0.") });
  actions.reverse();
  actionsReversed = true;
  witnessComplete = true;
  const witnessValid = witnessIsValid();
  if (!witnessValid) throw new Error("Freedom Trail witness invariant failed.");
  emit({ line: 38, event: "reverse-actions", phase: "reconstruction", title: localized("Reverse actions into chronological order", "Đảo actions về thứ tự thời gian"), note: localized(`Witness has ${counters.witnessTurns} turn(s) + ${counters.witnessPresses} press(es) = ${answer}.`, `Witness có ${counters.witnessTurns} bước quay + ${counters.witnessPresses} lần nhấn = ${answer}.`) });
  emit({ line: 39, event: "final-return", phase: "done", title: localized(`Return ${answer}`, `Trả về ${answer}`), note: localized("The DP optimum and reconstructed physical ring actions have identical total cost.", "Tối ưu DP và các action quay ring vật lý được tái dựng có cùng tổng cost."), final: true });

  return {
    original: ring,
    key,
    answer,
    actions: actions.map(copyAction),
    steps,
  };
}

module.exports = {
  514: {
    id: 514,
    difficulty: "hard",
    slug: "freedom-trail",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: { vi: "Freedom Trail", en: "Freedom Trail" },
    titleVi: { vi: "Vòng xoay đánh vần với số bước ít nhất", en: "Spell a key with minimum ring steps" },
    statement: {
      vi: "Cho ring tròn và key. Ban đầu ring[0] ở vị trí 12 giờ. Mỗi bước quay ring một vị trí theo một trong hai hướng, hoặc nhấn nút để nhập ký tự đang ở 12 giờ. Tìm tổng số bước nhỏ nhất để nhập toàn bộ key. Visualizer giới hạn ring và key tối đa 8 chữ thường.",
      en: "Given a circular ring and a key, ring[0] starts at twelve o'clock. One step rotates the ring one position in either direction or presses the button to type the aligned character. Return the minimum steps to spell the full key. The visualizer limits ring and key to eight lowercase letters.",
    },
    defaultInput: "godding",
    inputKind: "string",
    inputLabel: { vi: "ring (1..8 chữ thường)", en: "ring (1..8 lowercase letters)" },
    extraParams: [{ key: "key", type: "string", label: { vi: "key (1..8, mọi ký tự có trong ring)", en: "key (1..8, every character in ring)" }, default: "gd" }],
    debugMode: "line-by-line",
    parseFreedomTrail514Input,
    approach: [
      { vi: "Index mọi vị trí gốc của từng ký tự trên ring; dp[p] là cost nhỏ nhất sau prefix hiện tại khi p nằm ở 12 giờ.", en: "Index every original occurrence; dp[p] is the minimum cost after the current prefix with p aligned at twelve o'clock." },
      { vi: "Với mỗi occurrence đích, thử mọi predecessor và lấy min(dp[previous] + khoảng quay ngắn nhất + 1 lần nhấn).", en: "For each target occurrence, try every predecessor and minimize dp[previous] + shortest rotation + one press." },
      { vi: "Khi hòa: ưu tiên predecessor nhỏ hơn; hướng kim đồng hồ vật lý thắng tie nửa vòng; endpoint nhỏ hơn thắng tie cuối.", en: "On ties: prefer the smaller predecessor; physical clockwise wins a half-ring direction tie; the smaller endpoint wins the final tie." },
      { vi: "Lưu parent từng tầng, đi ngược rồi đảo actions để tạo witness quay-và-nhấn có tổng cost đúng bằng đáp án.", en: "Store one parent map per layer, walk backward, then reverse actions into a rotation-and-press witness whose cost equals the answer." },
    ],
    complexity: {
      time: "O(n + Σ|Pᵢ₋₁|·|Pᵢ|) ≤ O(|key|·n²)",
      space: "O(|key|·n)",
      note: {
        vi: "Rolling DP chỉ cần O(n); parent theo tầng dùng O(|key|·n) để tái dựng witness.",
        en: "Rolling DP needs O(n); layered parents use O(|key|·n) to reconstruct the witness.",
      },
    },
    code: FREEDOM_TRAIL_514_SOURCE,
    liveArgs: (input, params) => {
      const value = parseFreedomTrail514Input(input, params);
      return [value.ring, value.key];
    },
    builder: buildSteps514Exact,
  },
};
