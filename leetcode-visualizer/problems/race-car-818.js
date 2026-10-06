// LeetCode 818 — Race Car focused exact visualization module.

const RACE_CAR_818_MAX_TARGET = 64;
const RACE_CAR_818_SOURCE = Object.freeze([
  "class Solution:",
  "    def racecar(self, target: int) -> int:",
  "        dp = [0] * (target + 1)",
  "        for distance in range(1, target + 1):",
  "            n = distance.bit_length()",
  "            full = (1 << n) - 1",
  "            if full == distance:",
  "                dp[distance] = n",
  "                continue",
  "            dp[distance] = n + 1 + dp[full - distance]",
  "            for reverse in range(n - 1):",
  "                backward = (1 << reverse) - 1",
  "                remaining = distance - ((1 << (n - 1)) - 1 - backward)",
  "                candidate = (n - 1) + 1 + reverse + 1 + dp[remaining]",
  "                if candidate < dp[distance]:",
  "                    dp[distance] = candidate",
  "        return dp[target]",
]);

function parseRaceCar818Input(input) {
  if (!Array.isArray(input) || input.length !== 1 || !Number.isSafeInteger(input[0])) {
    throw new TypeError("Race Car input must be an array containing exactly one safe integer target.");
  }
  const target = input[0];
  if (target < 1 || target > RACE_CAR_818_MAX_TARGET) {
    throw new RangeError(`Race Car target must be between 1 and ${RACE_CAR_818_MAX_TARGET}.`);
  }
  return target;
}

function assertRaceCar818JsonSafe(value, path = "snapshot", ancestors = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isSafeInteger(value)) {
      throw new TypeError(`Race Car ${path} contains a non-finite or unsafe number.`);
    }
    return;
  }
  if (typeof value !== "object") {
    throw new TypeError(`Race Car ${path} contains a non-JSON value.`);
  }
  if (ancestors.has(value)) {
    throw new TypeError(`Race Car ${path} contains a cycle.`);
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertRaceCar818JsonSafe(item, `${path}[${index}]`, ancestors));
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`Race Car ${path} contains a non-plain object.`);
    }
    Object.entries(value).forEach(([key, item]) => {
      assertRaceCar818JsonSafe(item, `${path}.${key}`, ancestors);
    });
  }
  ancestors.delete(value);
}

function deepFreezeRaceCar818Snapshot(value) {
  assertRaceCar818JsonSafe(value);
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function copyRaceCar818Plan(plan) {
  return plan ? {
    distance: plan.distance,
    type: plan.type,
    cost: plan.cost,
    n: plan.n,
    full: plan.full,
    previousFull: plan.previousFull,
    reverse: plan.reverse,
    backward: plan.backward,
    remainder: plan.remainder,
    dependencyCost: plan.dependencyCost,
    fixedCost: plan.fixedCost,
    prefix: plan.prefix,
  } : null;
}

function copyRaceCar818SimulationEntry(entry) {
  return {
    step: entry.step,
    command: entry.command,
    beforePosition: entry.beforePosition,
    beforeSpeed: entry.beforeSpeed,
    afterPosition: entry.afterPosition,
    afterSpeed: entry.afterSpeed,
  };
}

function buildSteps818Exact(input) {
  const target = parseRaceCar818Input(input);
  const steps = [];
  const localized = (en, vi) => ({ en, vi });
  const counters = {
    frames: 0,
    distanceIterations: 0,
    bitLengthComputations: 0,
    fullComputations: 0,
    exactChecks: 0,
    exactWrites: 0,
    overshootCandidates: 0,
    undershootIterations: 0,
    backwardComputations: 0,
    remainingComputations: 0,
    candidateEvaluations: 0,
    strictComparisons: 0,
    improvements: 0,
    tiesKept: 0,
    worseKept: 0,
    decisionWrites: 0,
    reconstructionCalls: 0,
    materializations: 0,
    simulatedCommands: 0,
    accelerations: 0,
    reverses: 0,
  };

  let dp = [];
  let computed = [];
  let decisions = [];
  let dpAllocated = false;
  let completedThrough = -1;

  let distance = null;
  let n = null;
  let full = null;
  let isExact = null;
  let overshootRemainder = null;
  let previousFull = null;
  let reverse = null;
  let backward = null;
  let remaining = null;
  let fixedCost = null;
  let dependencyCost = null;
  let candidateCost = null;
  let candidate = null;
  let incumbent = null;
  let outcome = "idle";
  let answer = null;

  let reconstructionDistance = null;
  let reconstructionDepth = null;
  let reconstructionDecision = null;
  const reconstructionStack = [];
  const reconstructionFragments = [];
  let commands = "";
  let reconstructionComplete = false;

  let simulationStarted = false;
  let simulationIndex = null;
  let simulationCommand = null;
  let simulationPosition = null;
  let simulationSpeed = null;
  const simulationHistory = [];
  let simulationComplete = false;

  const planFromValues = (type, values) => ({
    distance: values.distance,
    type,
    cost: values.cost,
    n: values.n,
    full: values.full,
    previousFull: values.previousFull,
    reverse: values.reverse,
    backward: values.backward,
    remainder: values.remainder,
    dependencyCost: values.dependencyCost,
    fixedCost: values.fixedCost,
    prefix: values.prefix,
  });

  const resetRecurrence = (nextOutcome = "idle") => {
    n = null;
    full = null;
    isExact = null;
    overshootRemainder = null;
    previousFull = null;
    reverse = null;
    backward = null;
    remaining = null;
    fixedCost = null;
    dependencyCost = null;
    candidateCost = null;
    candidate = null;
    incumbent = null;
    outcome = nextOutcome;
  };

  const plansEqual = (left, right) => {
    if (!left || !right) return left === right;
    return left.distance === right.distance
      && left.type === right.type
      && left.cost === right.cost
      && left.n === right.n
      && left.full === right.full
      && left.previousFull === right.previousFull
      && left.reverse === right.reverse
      && left.backward === right.backward
      && left.remainder === right.remainder
      && left.dependencyCost === right.dependencyCost
      && left.fixedCost === right.fixedCost
      && left.prefix === right.prefix;
  };

  const decisionIsValid = (index, selected) => {
    if (!selected || selected.distance !== index || selected.cost !== dp[index]) return false;
    if (index === 0) {
      return selected.type === "base"
        && selected.cost === 0
        && selected.n === 0
        && selected.full === 0
        && selected.previousFull === 0
        && selected.reverse === null
        && selected.backward === null
        && selected.remainder === 0
        && selected.dependencyCost === 0
        && selected.fixedCost === 0
        && selected.prefix === "";
    }

    const expectedN = index.toString(2).length;
    const expectedFull = (2 ** expectedN) - 1;
    const expectedPreviousFull = (2 ** (expectedN - 1)) - 1;
    if (selected.n !== expectedN
      || selected.full !== expectedFull
      || selected.previousFull !== expectedPreviousFull) return false;

    if (selected.type === "exact") {
      return index === expectedFull
        && selected.cost === expectedN
        && selected.reverse === null
        && selected.backward === null
        && selected.remainder === 0
        && selected.dependencyCost === 0
        && selected.fixedCost === expectedN
        && selected.prefix === "A".repeat(expectedN);
    }

    if (!Number.isSafeInteger(selected.remainder)
      || selected.remainder < 0
      || selected.remainder >= index
      || !computed[selected.remainder]
      || selected.dependencyCost !== dp[selected.remainder]) return false;

    if (selected.type === "overshoot") {
      return index !== expectedFull
        && selected.reverse === null
        && selected.backward === null
        && selected.remainder === expectedFull - index
        && selected.fixedCost === expectedN + 1
        && selected.cost === selected.fixedCost + dp[selected.remainder]
        && selected.prefix === `${"A".repeat(expectedN)}R`;
    }

    if (selected.type === "undershoot") {
      if (!Number.isSafeInteger(selected.reverse)
        || selected.reverse < 0
        || selected.reverse >= expectedN - 1) return false;
      const expectedBackward = (2 ** selected.reverse) - 1;
      const expectedRemainder = index - (expectedPreviousFull - expectedBackward);
      const expectedFixedCost = (expectedN - 1) + 1 + selected.reverse + 1;
      return selected.backward === expectedBackward
        && selected.remainder === expectedRemainder
        && selected.fixedCost === expectedFixedCost
        && selected.cost === expectedFixedCost + dp[expectedRemainder]
        && selected.prefix === `${"A".repeat(expectedN - 1)}R${"A".repeat(selected.reverse)}R`;
    }

    return false;
  };

  const simulationHistoryIsValid = () => {
    if (!simulationStarted) return null;
    let replayPosition = 0;
    let replaySpeed = 1;
    for (let index = 0; index < simulationHistory.length; index++) {
      const entry = simulationHistory[index];
      if (entry.step !== index + 1
        || entry.command !== commands[index]
        || entry.beforePosition !== replayPosition
        || entry.beforeSpeed !== replaySpeed) return false;
      if (entry.command === "A") {
        replayPosition += replaySpeed;
        replaySpeed *= 2;
      } else if (entry.command === "R") {
        replaySpeed = replaySpeed > 0 ? -1 : 1;
      } else {
        return false;
      }
      if (entry.afterPosition !== replayPosition || entry.afterSpeed !== replaySpeed) return false;
    }
    return replayPosition === simulationPosition && replaySpeed === simulationSpeed;
  };

  const snapshotView = ({ line, event, phase, timing, condition, final }) => {
    const decisionCopies = decisions.map(copyRaceCar818Plan);
    const computedPrefix = !dpAllocated || computed.every(
      (isComputed, index) => isComputed === (index <= completedThrough),
    );
    const costsAreSafe = !dpAllocated || dp.every(
      (value, index) => !computed[index] || (Number.isSafeInteger(value) && value >= 0),
    );
    const uncomputedCellsAreZero = !dpAllocated || dp.every(
      (value, index) => computed[index] || value === 0,
    );
    const decisionsCoverComputed = !dpAllocated || decisions.every(
      (selected, index) => computed[index] === (selected !== null),
    );
    const decisionsAreValid = !dpAllocated || decisions.every(
      (selected, index) => selected === null || decisionIsValid(index, selected),
    );
    const activeDependencyReady = candidate === null
      || candidate.type === "exact"
      || (candidate.remainder >= 0
        && candidate.remainder < candidate.distance
        && computed[candidate.remainder]);
    const strictImprovementOnly = outcome !== "improve"
      || (candidate !== null && incumbent !== null && candidate.cost < incumbent.cost);
    const tieKeptIncumbent = outcome !== "tie"
      || (candidate !== null
        && incumbent !== null
        && candidate.cost === incumbent.cost
        && plansEqual(decisions[distance], incumbent));
    const overshootWinsItsTies = outcome !== "tie"
      || incumbent === null
      || incumbent.type !== "overshoot"
      || (decisions[distance] !== null && decisions[distance].type === "overshoot");
    const historyValid = simulationHistoryIsValid();
    const finalWitnessValid = simulationComplete
      ? reconstructionComplete
        && commands.length === answer
        && simulationHistory.length === commands.length
        && simulationPosition === target
        && historyValid === true
      : null;

    return {
      version: 1,
      problemId: 818,
      source: { line, text: RACE_CAR_818_SOURCE[line - 1] },
      event,
      phase,
      timing,
      condition: condition && typeof condition === "object"
        ? { expression: condition.expression, result: condition.result }
        : { expression: null, result: null },
      input: {
        target,
        limits: { minTarget: 1, maxTarget: RACE_CAR_818_MAX_TARGET },
      },
      recurrence: {
        distance,
        n,
        full,
        exact: isExact,
        overshootRemainder,
        previousFull,
        reverse,
        backward,
        remaining,
        fixedCost,
        dependencyCost,
        candidateCost,
      },
      candidate: {
        value: copyRaceCar818Plan(candidate),
        incumbent: copyRaceCar818Plan(incumbent),
        outcome,
      },
      dp: {
        allocated: dpAllocated,
        completedThrough,
        table: dp.map((value, index) => ({
          distance: index,
          cost: computed[index] ? value : null,
          computed: computed[index],
        })),
      },
      decisions: decisionCopies,
      reconstruction: {
        activeDistance: reconstructionDistance,
        depth: reconstructionDepth,
        decision: copyRaceCar818Plan(reconstructionDecision),
        stack: reconstructionStack.map((entry) => ({
          distance: entry.distance,
          depth: entry.depth,
          type: entry.type,
          remainder: entry.remainder,
          prefix: entry.prefix,
        })),
        fragments: reconstructionFragments.map((fragment) => ({
          distance: fragment.distance,
          depth: fragment.depth,
          type: fragment.type,
          prefix: fragment.prefix,
          suffix: fragment.suffix,
          commands: fragment.commands,
        })),
        commands,
        commandList: commands.split(""),
        complete: reconstructionComplete,
        simulation: {
          started: simulationStarted,
          index: simulationIndex,
          command: simulationCommand,
          current: simulationStarted
            ? { position: simulationPosition, speed: simulationSpeed }
            : null,
          history: simulationHistory.map(copyRaceCar818SimulationEntry),
          complete: simulationComplete,
        },
      },
      counters: { ...counters },
      invariants: {
        definition: "dp[d] is the minimum A/R command count needed to reach distance d from rest",
        sourceLineValid: Number.isSafeInteger(line)
          && line >= 1
          && line <= RACE_CAR_818_SOURCE.length,
        computedPrefix,
        costsAreSafe,
        uncomputedCellsAreZero,
        decisionsCoverComputed,
        decisionsAreValid,
        decisionDependenciesDecrease: decisions.every(
          (selected) => selected === null
            || selected.type === "base"
            || selected.type === "exact"
            || selected.remainder < selected.distance,
        ),
        activeDependencyReady,
        strictImprovementOnly,
        tieKeptIncumbent,
        overshootWinsItsTies,
        answerMatchesTarget: answer === null
          ? null
          : computed[target] && answer === dp[target],
        commandsContainOnlyAR: /^[AR]*$/.test(commands),
        commandsMatchAnswer: reconstructionComplete ? commands.length === answer : null,
        simulationHistoryValid: historyValid,
        finalWitnessValid,
      },
      answer,
      final,
    };
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
    // Reconstruction and physical replay are visualization sidecars, not lines
    // in the displayed Python. Build them fully, then attach them only to the
    // real line-17 return frame instead of fabricating source execution.
    if (phase === "reconstruction") return;
    counters.frames++;
    const view = snapshotView({ line, event, phase, timing, condition, final });
    const activeIndices = [view.recurrence.distance];
    if (view.candidate.value !== null) activeIndices.push(view.candidate.value.remainder);
    const highlight = [...new Set(activeIndices.filter(
      (value) => Number.isSafeInteger(value) && value >= 0 && value <= target,
    ))];
    const step = {
      title,
      note,
      arr: view.dp.table.map((cell) => cell.cost === null ? 0 : cell.cost),
      sub: view.dp.table.map((cell) => `d=${cell.distance}`),
      highlight,
      mark: view.answer === null ? [] : [target],
      final,
      codeLines: [line],
      vars: [
        { name: "target", value: target },
        { name: "distance", value: view.recurrence.distance ?? "—" },
        { name: "n", value: view.recurrence.n ?? "—" },
        { name: "reverse", value: view.recurrence.reverse ?? "—" },
        { name: "candidate", value: view.recurrence.candidateCost ?? "—" },
        { name: "outcome", value: view.candidate.outcome },
        { name: "answer", value: view.answer ?? "—" },
      ],
      raceCar818View: view,
    };
    steps.push(deepFreezeRaceCar818Snapshot(step));
  };

  emit({
    line: 1,
    event: "bind-class",
    phase: "setup",
    title: localized("Bind Solution class", "Liên kết lớp Solution"),
    note: localized(
      "The class exposes one exact bottom-up distance-DP method.",
      "Lớp cung cấp một method DP khoảng cách bottom-up chính xác.",
    ),
  });
  emit({
    line: 2,
    event: "bind-method",
    phase: "setup",
    title: localized("Bind racecar", "Liên kết racecar"),
    note: localized(
      `The strict visualization input has already accepted target ${target}.`,
      `Input visualization nghiêm ngặt đã chấp nhận target ${target}.`,
    ),
  });

  dp = Array(target + 1).fill(0);
  computed = Array(target + 1).fill(false);
  decisions = Array(target + 1).fill(null);
  computed[0] = true;
  decisions[0] = planFromValues("base", {
    distance: 0,
    cost: 0,
    n: 0,
    full: 0,
    previousFull: 0,
    reverse: null,
    backward: null,
    remainder: 0,
    dependencyCost: 0,
    fixedCost: 0,
    prefix: "",
  });
  dpAllocated = true;
  completedThrough = 0;
  counters.decisionWrites++;
  emit({
    line: 3,
    event: "allocate-and-seed-dp",
    phase: "setup",
    title: localized(
      `Allocate dp[0..${target}] and seed dp[0] = 0`,
      `Cấp phát dp[0..${target}] và khởi tạo dp[0] = 0`,
    ),
    note: localized(
      "Distance zero needs no command; every later dependency points to a smaller distance.",
      "Khoảng cách 0 không cần lệnh; mọi dependency sau đều trỏ tới khoảng cách nhỏ hơn.",
    ),
  });

  for (let currentDistance = 1; currentDistance <= target; currentDistance++) {
    distance = currentDistance;
    resetRecurrence("distance-loop");
    counters.distanceIterations++;
    emit({
      line: 4,
      event: "distance-loop-true",
      phase: "dp",
      timing: "before",
      condition: { expression: `${distance} <= ${target}`, result: true },
      title: localized(`Compute distance ${distance}`, `Tính khoảng cách ${distance}`),
      note: localized(
        `All dp dependencies below ${distance} are already exact.`,
        `Mọi dependency dp nhỏ hơn ${distance} đã chính xác.`,
      ),
    });

    n = distance.toString(2).length;
    counters.bitLengthComputations++;
    emit({
      line: 5,
      event: "compute-bit-length",
      phase: "dp",
      title: localized(`n = ${n}`, `n = ${n}`),
      note: localized(
        `${n} accelerations are the first run that can reach or pass ${distance}.`,
        `${n} lần tăng tốc là chuỗi đầu tiên có thể đạt hoặc vượt ${distance}.`,
      ),
    });

    full = (2 ** n) - 1;
    previousFull = (2 ** (n - 1)) - 1;
    counters.fullComputations++;
    emit({
      line: 6,
      event: "compute-full-run",
      phase: "dp",
      title: localized(`full = 2^${n} − 1 = ${full}`, `full = 2^${n} − 1 = ${full}`),
      note: localized(
        `Commands ${"A".repeat(n)} reach position ${full} with speed ${2 ** n}.`,
        `Các lệnh ${"A".repeat(n)} tới vị trí ${full} với tốc độ ${2 ** n}.`,
      ),
    });

    isExact = full === distance;
    counters.exactChecks++;
    emit({
      line: 7,
      event: isExact ? "exact-condition-true" : "exact-condition-false",
      phase: "dp",
      condition: { expression: `${full} == ${distance}`, result: isExact },
      title: localized(
        isExact ? `${distance} is an exact acceleration run` : `${distance} lies before full=${full}`,
        isExact ? `${distance} là một chuỗi tăng tốc chính xác` : `${distance} nằm trước full=${full}`,
      ),
      note: isExact
        ? localized(
          "No reversal can improve a direct all-acceleration run.",
          "Không lần đảo hướng nào có thể tốt hơn chuỗi chỉ tăng tốc trực tiếp.",
        )
        : localized(
          "Seed an overshoot plan, then test every shorter undershoot reversal.",
          "Khởi tạo phương án vượt đích, rồi thử mọi lần đảo hướng thiếu đích ngắn hơn.",
        ),
    });

    if (isExact) {
      fixedCost = n;
      dependencyCost = 0;
      candidateCost = n;
      candidate = planFromValues("exact", {
        distance,
        cost: candidateCost,
        n,
        full,
        previousFull,
        reverse: null,
        backward: null,
        remainder: 0,
        dependencyCost,
        fixedCost,
        prefix: "A".repeat(n),
      });
      incumbent = null;
      outcome = "exact";
      dp[distance] = candidateCost;
      computed[distance] = true;
      decisions[distance] = copyRaceCar818Plan(candidate);
      completedThrough = distance;
      counters.exactWrites++;
      counters.decisionWrites++;
      emit({
        line: 8,
        event: "write-exact-distance",
        phase: "dp",
        title: localized(`dp[${distance}] = ${n}`, `dp[${distance}] = ${n}`),
        note: localized(
          `The deterministic decision is ${"A".repeat(n)}.`,
          `Quyết định xác định là ${"A".repeat(n)}.`,
        ),
      });
      emit({
        line: 9,
        event: "continue-after-exact",
        phase: "dp",
        title: localized("Continue to the next distance", "Tiếp tục tới khoảng cách kế"),
        note: localized(
          "The overshoot and undershoot lines are intentionally skipped.",
          "Các dòng vượt đích và thiếu đích được chủ ý bỏ qua.",
        ),
      });
      continue;
    }

    overshootRemainder = full - distance;
    remaining = overshootRemainder;
    dependencyCost = dp[overshootRemainder];
    fixedCost = n + 1;
    candidateCost = fixedCost + dependencyCost;
    candidate = planFromValues("overshoot", {
      distance,
      cost: candidateCost,
      n,
      full,
      previousFull,
      reverse: null,
      backward: null,
      remainder: overshootRemainder,
      dependencyCost,
      fixedCost,
      prefix: `${"A".repeat(n)}R`,
    });
    incumbent = null;
    outcome = "baseline";
    dp[distance] = candidateCost;
    computed[distance] = true;
    decisions[distance] = copyRaceCar818Plan(candidate);
    completedThrough = distance;
    counters.overshootCandidates++;
    counters.candidateEvaluations++;
    counters.decisionWrites++;
    emit({
      line: 10,
      event: "write-overshoot-baseline",
      phase: "dp",
      title: localized(
        `Overshoot baseline = ${n} + 1 + dp[${overshootRemainder}] = ${candidateCost}`,
        `Baseline vượt đích = ${n} + 1 + dp[${overshootRemainder}] = ${candidateCost}`,
      ),
      note: localized(
        `Run to ${full}, reverse once, then cover the reflected remainder ${overshootRemainder}.`,
        `Chạy tới ${full}, đảo hướng một lần, rồi đi phần còn lại phản chiếu ${overshootRemainder}.`,
      ),
    });

    for (let currentReverse = 0; currentReverse < n - 1; currentReverse++) {
      reverse = currentReverse;
      backward = null;
      remaining = null;
      dependencyCost = null;
      fixedCost = null;
      candidateCost = null;
      candidate = null;
      incumbent = copyRaceCar818Plan(decisions[distance]);
      outcome = "reverse-loop";
      counters.undershootIterations++;
      emit({
        line: 11,
        event: "reverse-loop-true",
        phase: "dp",
        timing: "before",
        condition: { expression: `${reverse} < ${n - 1}`, result: true },
        title: localized(
          `Try ${reverse} backward acceleration(s)`,
          `Thử ${reverse} lần tăng tốc lùi`,
        ),
        note: localized(
          `The car first stops its forward run at ${previousFull}, before target ${distance}.`,
          `Xe trước hết dừng chuỗi tiến tại ${previousFull}, trước target ${distance}.`,
        ),
      });

      backward = (2 ** reverse) - 1;
      counters.backwardComputations++;
      emit({
        line: 12,
        event: "compute-backward-distance",
        phase: "dp",
        title: localized(`backward = 2^${reverse} − 1 = ${backward}`, `backward = 2^${reverse} − 1 = ${backward}`),
        note: localized(
          `After the first R, ${reverse} A command(s) move ${backward} unit(s) backward.`,
          `Sau R đầu tiên, ${reverse} lệnh A đi lùi ${backward} đơn vị.`,
        ),
      });

      remaining = distance - (previousFull - backward);
      counters.remainingComputations++;
      emit({
        line: 13,
        event: "compute-remaining-distance",
        phase: "dp",
        title: localized(`remaining = ${remaining}`, `remaining = ${remaining}`),
        note: localized(
          `A second R restores forward speed +1 at position ${previousFull - backward}.`,
          `R thứ hai khôi phục tốc độ tiến +1 tại vị trí ${previousFull - backward}.`,
        ),
      });

      dependencyCost = dp[remaining];
      fixedCost = (n - 1) + 1 + reverse + 1;
      candidateCost = fixedCost + dependencyCost;
      candidate = planFromValues("undershoot", {
        distance,
        cost: candidateCost,
        n,
        full,
        previousFull,
        reverse,
        backward,
        remainder: remaining,
        dependencyCost,
        fixedCost,
        prefix: `${"A".repeat(n - 1)}R${"A".repeat(reverse)}R`,
      });
      counters.candidateEvaluations++;
      emit({
        line: 14,
        event: "build-undershoot-candidate",
        phase: "dp",
        title: localized(
          `Candidate = ${fixedCost} + dp[${remaining}] = ${candidateCost}`,
          `Ứng viên = ${fixedCost} + dp[${remaining}] = ${candidateCost}`,
        ),
        note: localized(
          "The fixed cost counts the forward run, two reversals, and the backward run.",
          "Cost cố định đếm chuỗi tiến, hai lần đảo hướng và chuỗi lùi.",
        ),
      });

      const improves = candidateCost < dp[distance];
      counters.strictComparisons++;
      if (improves) {
        outcome = "improve";
      } else if (candidateCost === dp[distance]) {
        outcome = "tie";
        counters.tiesKept++;
      } else {
        outcome = "worse";
        counters.worseKept++;
      }
      emit({
        line: 15,
        event: improves ? "strict-improvement-true" : "strict-improvement-false",
        phase: "dp",
        condition: { expression: `${candidateCost} < ${dp[distance]}`, result: improves },
        title: localized(
          improves
            ? `${candidateCost} strictly improves ${dp[distance]}`
            : `${candidateCost} does not improve ${dp[distance]}`,
          improves
            ? `${candidateCost} cải thiện nghiêm ngặt ${dp[distance]}`
            : `${candidateCost} không cải thiện ${dp[distance]}`,
        ),
        note: improves
          ? localized(
            "Replace both the minimum cost and its reconstruction decision.",
            "Thay cả cost nhỏ nhất và quyết định tái dựng của nó.",
          )
          : candidateCost === dp[distance]
            ? localized(
              "Strict comparison keeps the incumbent; therefore the overshoot baseline wins its ties.",
              "So sánh nghiêm ngặt giữ incumbent; vì vậy baseline vượt đích thắng khi hòa.",
            )
            : localized(
              "A larger legal candidate cannot replace the incumbent.",
              "Ứng viên hợp lệ lớn hơn không thể thay incumbent.",
            ),
      });

      if (improves) {
        dp[distance] = candidateCost;
        decisions[distance] = copyRaceCar818Plan(candidate);
        counters.improvements++;
        counters.decisionWrites++;
        emit({
          line: 16,
          event: "write-undershoot-improvement",
          phase: "dp",
          title: localized(`dp[${distance}] = ${candidateCost}`, `dp[${distance}] = ${candidateCost}`),
          note: localized(
            `Store reverse=${reverse}; later equal candidates cannot displace it.`,
            `Lưu reverse=${reverse}; các ứng viên bằng nhau sau đó không thể thay nó.`,
          ),
        });
      }
    }

    reverse = n - 1;
    backward = null;
    remaining = null;
    dependencyCost = null;
    fixedCost = null;
    candidateCost = null;
    candidate = null;
    incumbent = copyRaceCar818Plan(decisions[distance]);
    outcome = "reverse-loop-complete";
    emit({
      line: 11,
      event: "reverse-loop-false",
      phase: "dp",
      timing: "before",
      condition: { expression: `${reverse} < ${n - 1}`, result: false },
      title: localized(
        `All undershoot reversals tested for ${distance}`,
        `Đã thử mọi lần đảo hướng thiếu đích cho ${distance}`,
      ),
      note: localized(
        `The committed ${decisions[distance].type} decision costs ${dp[distance]}.`,
        `Quyết định ${decisions[distance].type} đã chốt có cost ${dp[distance]}.`,
      ),
    });
  }

  distance = target + 1;
  resetRecurrence("distance-loop-complete");
  emit({
    line: 4,
    event: "distance-loop-false",
    phase: "dp",
    timing: "before",
    condition: { expression: `${distance} <= ${target}`, result: false },
    title: localized("All distances complete", "Mọi khoảng cách đã hoàn tất"),
    note: localized(
      `dp[0..${target}] now contains exact minima with deterministic decisions.`,
      `dp[0..${target}] giờ chứa các minimum chính xác với quyết định xác định.`,
    ),
  });

  distance = null;
  answer = dp[target];
  emit({
    line: 17,
    event: "capture-answer",
    phase: "reconstruction",
    title: localized(`Capture answer = ${answer}`, `Ghi nhận answer = ${answer}`),
    note: localized(
      "The visualizer now materializes the stored choices without changing the DP result.",
      "Visualizer giờ cụ thể hóa các lựa chọn đã lưu mà không thay đổi kết quả DP.",
    ),
  });

  emit({
    line: 17,
    event: "initialize-reconstruction",
    phase: "reconstruction",
    title: localized("Initialize command reconstruction", "Khởi tạo tái dựng lệnh"),
    note: localized(
      "Each non-exact decision contributes a fixed prefix and recursively expands one smaller remainder.",
      "Mỗi quyết định không chính xác đóng góp một prefix cố định và đệ quy mở rộng một phần còn lại nhỏ hơn.",
    ),
  });

  const materialize = (activeDistance, depth) => {
    const selected = decisions[activeDistance];
    if (!selected) throw new Error(`Race Car reconstruction is missing distance ${activeDistance}.`);
    reconstructionDistance = activeDistance;
    reconstructionDepth = depth;
    reconstructionDecision = copyRaceCar818Plan(selected);
    reconstructionStack.push({
      distance: activeDistance,
      depth,
      type: selected.type,
      remainder: selected.remainder,
      prefix: selected.prefix,
    });
    counters.reconstructionCalls++;
    emit({
      line: 17,
      event: "reconstruct-decision",
      phase: "reconstruction",
      timing: "before",
      condition: {
        expression: selected.type === "exact"
          ? `${activeDistance} is exact`
          : `${selected.remainder} < ${activeDistance}`,
        result: selected.type === "exact" || selected.remainder < activeDistance,
      },
      title: localized(
        `Expand ${selected.type} decision for distance ${activeDistance}`,
        `Mở rộng quyết định ${selected.type} cho khoảng cách ${activeDistance}`,
      ),
      note: localized(
        selected.type === "exact"
          ? `Its complete command fragment is ${selected.prefix}.`
          : `Append prefix ${selected.prefix}, then solve remainder ${selected.remainder}.`,
        selected.type === "exact"
          ? `Đoạn lệnh hoàn chỉnh là ${selected.prefix}.`
          : `Nối prefix ${selected.prefix}, rồi giải phần còn lại ${selected.remainder}.`,
      ),
    });

    const suffix = selected.type === "exact" || selected.type === "base"
      ? ""
      : materialize(selected.remainder, depth + 1);
    const materialized = `${selected.prefix}${suffix}`;
    if (materialized.length !== selected.cost) {
      throw new Error(`Race Car reconstruction cost invariant failed at distance ${activeDistance}.`);
    }

    reconstructionDistance = activeDistance;
    reconstructionDepth = depth;
    reconstructionDecision = copyRaceCar818Plan(selected);
    commands = materialized;
    reconstructionFragments.push({
      distance: activeDistance,
      depth,
      type: selected.type,
      prefix: selected.prefix,
      suffix,
      commands: materialized,
    });
    counters.materializations++;
    emit({
      line: 17,
      event: "materialize-command-fragment",
      phase: "reconstruction",
      title: localized(
        `Distance ${activeDistance} materializes to ${materialized}`,
        `Khoảng cách ${activeDistance} được cụ thể hóa thành ${materialized}`,
      ),
      note: localized(
        `Fragment length ${materialized.length} exactly matches stored cost ${selected.cost}.`,
        `Độ dài đoạn ${materialized.length} khớp chính xác cost đã lưu ${selected.cost}.`,
      ),
    });
    reconstructionStack.pop();
    return materialized;
  };

  commands = materialize(target, 0);
  reconstructionDistance = null;
  reconstructionDepth = null;
  reconstructionDecision = null;
  reconstructionComplete = true;
  if (commands.length !== answer || !/^[AR]+$/.test(commands)) {
    throw new Error("Race Car command reconstruction invariant failed.");
  }
  emit({
    line: 17,
    event: "reconstruction-complete",
    phase: "reconstruction",
    title: localized(
      `Optimal command string: ${commands}`,
      `Chuỗi lệnh tối ưu: ${commands}`,
    ),
    note: localized(
      `${commands.length} commands equal dp[${target}] = ${answer}.`,
      `${commands.length} lệnh bằng dp[${target}] = ${answer}.`,
    ),
  });

  simulationStarted = true;
  simulationIndex = 0;
  simulationCommand = null;
  simulationPosition = 0;
  simulationSpeed = 1;
  emit({
    line: 17,
    event: "initialize-simulation",
    phase: "reconstruction",
    title: localized("Start simulation at position 0, speed 1", "Bắt đầu mô phỏng tại vị trí 0, tốc độ 1"),
    note: localized(
      "Replay every materialized command under the original Race Car rules.",
      "Phát lại mọi lệnh đã cụ thể hóa theo đúng quy tắc Race Car.",
    ),
  });

  for (let index = 0; index < commands.length; index++) {
    const command = commands[index];
    simulationIndex = index;
    simulationCommand = command;
    const beforePosition = simulationPosition;
    const beforeSpeed = simulationSpeed;
    if (command === "A") {
      simulationPosition += simulationSpeed;
      simulationSpeed *= 2;
      counters.accelerations++;
    } else if (command === "R") {
      simulationSpeed = simulationSpeed > 0 ? -1 : 1;
      counters.reverses++;
    } else {
      throw new Error(`Race Car reconstruction produced invalid command ${command}.`);
    }
    if (!Number.isSafeInteger(simulationPosition) || !Number.isSafeInteger(simulationSpeed)) {
      throw new Error("Race Car simulation exceeded safe integer bounds.");
    }
    simulationHistory.push({
      step: index + 1,
      command,
      beforePosition,
      beforeSpeed,
      afterPosition: simulationPosition,
      afterSpeed: simulationSpeed,
    });
    counters.simulatedCommands++;
    emit({
      line: 17,
      event: command === "A" ? "simulate-accelerate" : "simulate-reverse",
      phase: "reconstruction",
      title: localized(
        `${index + 1}. ${command}: position ${simulationPosition}, speed ${simulationSpeed}`,
        `${index + 1}. ${command}: vị trí ${simulationPosition}, tốc độ ${simulationSpeed}`,
      ),
      note: command === "A"
        ? localized(
          `Move by speed ${beforeSpeed}, then double it.`,
          `Di chuyển theo tốc độ ${beforeSpeed}, rồi nhân đôi tốc độ.`,
        )
        : localized(
          `Position stays ${beforePosition}; reset speed toward the opposite direction.`,
          `Vị trí giữ nguyên ${beforePosition}; đặt lại tốc độ theo hướng ngược lại.`,
        ),
    });
  }

  simulationIndex = commands.length;
  simulationCommand = null;
  simulationComplete = true;
  if (simulationHistory.length !== answer || simulationPosition !== target) {
    throw new Error("Race Car final simulation invariant failed.");
  }
  emit({
    line: 17,
    event: "simulation-complete",
    phase: "reconstruction",
    title: localized(`Simulation reaches target ${target}`, `Mô phỏng tới target ${target}`),
    note: localized(
      `All ${answer} commands replay exactly; final speed is ${simulationSpeed}.`,
      `Cả ${answer} lệnh phát lại chính xác; tốc độ cuối là ${simulationSpeed}.`,
    ),
  });

  emit({
    line: 17,
    event: "final-return",
    phase: "done",
    title: localized(`Return ${answer}`, `Trả về ${answer}`),
    note: localized(
      "The bottom-up optimum, deterministic command witness, and physical simulation all agree.",
      "Tối ưu bottom-up, witness lệnh xác định và mô phỏng vật lý đều khớp nhau.",
    ),
    final: true,
  });

  if (steps.some((step) => step.codeLines.length !== 1)
    || steps.filter((step) => step.final).length !== 1
    || steps.some((step) => !Object.isFrozen(step) || !Object.isFrozen(step.raceCar818View))) {
    throw new Error("Race Car immutable step invariant failed.");
  }

  const simulation = deepFreezeRaceCar818Snapshot({
    start: { position: 0, speed: 1 },
    commands,
    history: simulationHistory.map(copyRaceCar818SimulationEntry),
    final: { position: simulationPosition, speed: simulationSpeed },
    valid: simulationHistory.length === answer && simulationPosition === target,
  });

  return {
    original: [target],
    target,
    answer,
    commands,
    simulation,
    steps,
  };
}

module.exports = {
  818: {
    id: 818,
    difficulty: "hard",
    slug: "race-car",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "shortest-path", vi: "Đường đi ngắn nhất", en: "Shortest Path" },
    ],
    title: { vi: "Race Car", en: "Race Car" },
    titleVi: {
      vi: "Xe đua đến mục tiêu bằng ít lệnh nhất",
      en: "Reach the target with the fewest commands",
    },
    statement: {
      vi: `Xe bắt đầu tại vị trí 0 với tốc độ +1. Lệnh A đi theo tốc độ hiện tại rồi nhân đôi tốc độ; lệnh R giữ vị trí và đổi tốc độ thành −1 hoặc +1 theo hướng ngược lại. Tìm số lệnh ít nhất để tới target dương. Visualizer giới hạn target ở ${RACE_CAR_818_MAX_TARGET}.`,
      en: `The car starts at position 0 with speed +1. Command A moves by the current speed and doubles it; command R keeps the position and resets speed to −1 or +1 in the opposite direction. Find the fewest commands that reach a positive target. The visualizer limits target to ${RACE_CAR_818_MAX_TARGET}.`,
    },
    defaultInput: [6],
    inputKind: "positive",
    inputLabel: {
      vi: `target (1..${RACE_CAR_818_MAX_TARGET})`,
      en: `target (1..${RACE_CAR_818_MAX_TARGET})`,
    },
    singleInput: true,
    maxInput: RACE_CAR_818_MAX_TARGET,
    extraParams: [],
    debugMode: "line-by-line",
    parseRaceCar818Input,
    approach: [
      {
        vi: "dp[d] là số lệnh ít nhất để đi từ trạng thái nghỉ chuẩn (vị trí 0, tốc độ +1) tới khoảng cách d; tính d tăng dần.",
        en: "dp[d] is the fewest commands from the canonical rest state (position 0, speed +1) to distance d; fill d in increasing order.",
      },
      {
        vi: "Nếu d=2^n−1, n lệnh A là tối ưu chính xác. Nếu không, baseline chạy n lệnh A vượt đích, R, rồi dùng dp[2^n−1−d].",
        en: "If d=2^n−1, exactly n A commands are optimal. Otherwise, the baseline runs n A commands past the target, uses R, then dp[2^n−1−d].",
      },
      {
        vi: "Mọi phương án thiếu đích chạy n−1 lệnh A, R, chạy lùi m lệnh A, R lần nữa, rồi dùng dp cho khoảng cách còn lại; thử m=0..n−2.",
        en: "Every undershoot plan runs n−1 A commands, R, m backward A commands, R again, then uses dp for the remaining distance; test m=0..n−2.",
      },
      {
        vi: "Chỉ cải thiện nghiêm ngặt mới thay quyết định, nên baseline vượt đích thắng tie và m nhỏ nhất thắng các tie undershoot sau một cải thiện.",
        en: "Only a strict improvement replaces a decision, so the overshoot baseline wins ties and the smallest m wins later undershoot ties after an improvement.",
      },
      {
        vi: "Visualizer mở rộng đệ quy các quyết định thành chuỗi A/R, mô phỏng từ (0,+1), và bắt buộc độ dài bằng answer cùng vị trí cuối bằng target.",
        en: "The visualizer recursively expands decisions into an A/R string, simulates it from (0,+1), and requires its length to equal the answer and its final position to equal target.",
      },
    ],
    complexity: {
      time: "O(target·log target)",
      space: "O(target)",
      note: {
        vi: `Mỗi d thử O(log d) độ dài chạy lùi; dp và decision dùng O(target). Trace giữ các snapshot giảng giải bất biến và được giới hạn tự nhiên bởi target≤${RACE_CAR_818_MAX_TARGET}.`,
        en: `Each d tests O(log d) backward-run lengths; dp and decisions use O(target). The trace retains immutable teaching snapshots and is naturally bounded by target≤${RACE_CAR_818_MAX_TARGET}.`,
      },
    },
    code: RACE_CAR_818_SOURCE,
    liveArgs: (input) => [parseRaceCar818Input(input)],
    builder: buildSteps818Exact,
  },
};
