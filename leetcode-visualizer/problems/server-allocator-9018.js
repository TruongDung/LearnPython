"use strict";

// Interview design problem — allocate the smallest available server name per type.

const SERVER_ALLOCATOR_9018_MAX_INITIAL_SERVERS = 18;
const SERVER_ALLOCATOR_9018_MAX_OPERATIONS = 20;
const SERVER_ALLOCATOR_9018_MAX_INITIAL_NUMBER = 32;
const SERVER_ALLOCATOR_9018_MAX_TYPES = 10;
const SERVER_ALLOCATOR_9018_MAX_TYPE_LENGTH = 24;
const SERVER_ALLOCATOR_9018_MAX_TRACKED_NUMBER = SERVER_ALLOCATOR_9018_MAX_INITIAL_NUMBER + SERVER_ALLOCATOR_9018_MAX_OPERATIONS;
const SERVER_ALLOCATOR_9018_TYPE_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(?:-[A-Za-z0-9_]+)*$/;

const SERVER_ALLOCATOR_9018_SOURCE = Object.freeze([
  "from heapq import heapify, heappop, heappush",
  "",
  "class ServerAllocator:",
  "    def __init__(self, existing_inventory):",
  "        self.init(existing_inventory)",
  "",
  "    @staticmethod",
  "    def _split(name):",
  "        server_type, number = name.rsplit(\"-\", 1)",
  "        return server_type, int(number)",
  "",
  "    def init(self, existing_inventory):",
  "        self.used = {}",
  "        self.free = {}",
  "        self.next_id = {}",
  "        for name in existing_inventory:",
  "            server_type, number = self._split(name)",
  "            self.used.setdefault(server_type, set()).add(number)",
  "        for server_type, numbers in self.used.items():",
  "            next_id = max(numbers) + 1",
  "            gaps = [number for number in range(1, next_id)",
  "                    if number not in numbers]",
  "            heapify(gaps)",
  "            self.free[server_type] = gaps",
  "            self.next_id[server_type] = next_id",
  "",
  "    def allocate(self, server_type):",
  "        self.used.setdefault(server_type, set())",
  "        self.free.setdefault(server_type, [])",
  "        self.next_id.setdefault(server_type, 1)",
  "        if self.free[server_type]:",
  "            number = heappop(self.free[server_type])",
  "        else:",
  "            number = self.next_id[server_type]",
  "            self.next_id[server_type] += 1",
  "        self.used[server_type].add(number)",
  "        return f\"{server_type}-{number}\"",
  "",
  "    def deallocate(self, name):",
  "        server_type, number = self._split(name)",
  "        numbers = self.used.get(server_type)",
  "        if numbers is None or number not in numbers:",
  "            return",
  "        numbers.remove(number)",
  "        heappush(self.free[server_type], number)",
]);

function parseServerType9018(value, label = "server type") {
  if (typeof value !== "string") throw new TypeError(`${label} must be a string.`);
  const serverType = value.trim();
  if (!serverType || serverType.length > SERVER_ALLOCATOR_9018_MAX_TYPE_LENGTH || !SERVER_ALLOCATOR_9018_TYPE_PATTERN.test(serverType)) {
    throw new Error(`${label} must start with a letter and contain only letters, numbers, underscores, or nonempty hyphen-separated parts.`);
  }
  return serverType;
}

function parseServerName9018(value, options = {}) {
  if (typeof value !== "string") throw new TypeError("Every server name must be a string.");
  const name = value.trim();
  const separator = name.lastIndexOf("-");
  if (separator <= 0 || separator === name.length - 1) {
    throw new Error(`Invalid server name \"${name}\". Expected <type>-<positive number>.`);
  }
  const serverType = parseServerType9018(name.slice(0, separator));
  const suffix = name.slice(separator + 1);
  if (!/^[1-9]\d*$/.test(suffix)) {
    throw new Error(`Invalid server number in \"${name}\". Numbers must be positive integers without leading zeros.`);
  }
  const number = Number(suffix);
  const maximum = options.initial
    ? SERVER_ALLOCATOR_9018_MAX_INITIAL_NUMBER
    : SERVER_ALLOCATOR_9018_MAX_TRACKED_NUMBER;
  if (!Number.isSafeInteger(number) || number > maximum) {
    throw new RangeError(`Server number in \"${name}\" must be at most ${maximum} for this visualization.`);
  }
  return { name: `${serverType}-${number}`, serverType, number };
}

function parseServerOperation9018(token, index) {
  const raw = String(token).trim();
  let kind;
  let argument;
  const callMatch = raw.match(/^(allocate|deallocate)\s*\(\s*(.*?)\s*\)$/i);
  if (callMatch) {
    kind = callMatch[1].toLowerCase();
    argument = callMatch[2].trim();
    const matchingQuotes = (argument.startsWith('"') && argument.endsWith('"'))
      || (argument.startsWith("'") && argument.endsWith("'"));
    if (matchingQuotes && argument.length >= 2) argument = argument.slice(1, -1).trim();
  } else {
    const spaceMatch = raw.match(/^(allocate|deallocate)\s+(\S+)$/i);
    if (!spaceMatch) {
      throw new Error(`Operation ${index + 1} must be \"allocate TYPE\" or \"deallocate TYPE-NUMBER\".`);
    }
    kind = spaceMatch[1].toLowerCase();
    argument = spaceMatch[2].trim();
  }

  if (kind === "allocate") {
    const serverType = parseServerType9018(argument, `allocate argument at operation ${index + 1}`);
    return { index, kind, arg: serverType, serverType, number: null, display: `allocate ${serverType}` };
  }
  const parsed = parseServerName9018(argument);
  return { index, kind, arg: parsed.name, serverType: parsed.serverType, number: parsed.number, display: `deallocate ${parsed.name}` };
}

function parseServerAllocator9018Input(input, params = {}) {
  let rawInventory;
  if (Array.isArray(input)) {
    rawInventory = input;
  } else if (typeof input === "string") {
    try {
      rawInventory = JSON.parse(input.trim());
    } catch (_error) {
      throw new Error('Existing inventory must be a JSON string array, for example ["api-1", "db-1"].');
    }
  } else {
    throw new TypeError("Existing inventory must be a JSON string array.");
  }
  if (!Array.isArray(rawInventory)) throw new TypeError("Existing inventory must decode to an array.");
  if (rawInventory.length > SERVER_ALLOCATOR_9018_MAX_INITIAL_SERVERS) {
    throw new RangeError(`The visualization supports at most ${SERVER_ALLOCATOR_9018_MAX_INITIAL_SERVERS} existing servers.`);
  }

  const seenNames = new Set();
  const inventory = rawInventory.map((value) => {
    const parsed = parseServerName9018(value, { initial: true });
    if (seenNames.has(parsed.name)) throw new Error(`Duplicate existing server: ${parsed.name}.`);
    seenNames.add(parsed.name);
    return parsed.name;
  });

  const operationsText = typeof params.operations === "string" ? params.operations.trim() : "";
  if (!operationsText) throw new Error("Enter at least one allocate or deallocate operation.");
  const tokens = operationsText.split("|");
  if (tokens.some((token) => token.trim() === "")) throw new Error("Operations cannot contain an empty | segment.");
  if (tokens.length > SERVER_ALLOCATOR_9018_MAX_OPERATIONS) {
    throw new RangeError(`The visualization supports at most ${SERVER_ALLOCATOR_9018_MAX_OPERATIONS} operations.`);
  }
  const operations = tokens.map(parseServerOperation9018);
  const serverTypes = new Set([
    ...inventory.map((name) => parseServerName9018(name, { initial: true }).serverType),
    ...operations.map((operation) => operation.serverType),
  ]);
  if (serverTypes.size > SERVER_ALLOCATOR_9018_MAX_TYPES) {
    throw new RangeError(`The visualization supports at most ${SERVER_ALLOCATOR_9018_MAX_TYPES} server types.`);
  }

  return {
    inventory: [...inventory],
    operations: operations.map((operation) => ({ ...operation })),
  };
}

function deepFreezeServerAllocator9018View(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function heapSink9018(heap, index) {
  while (true) {
    const left = index * 2 + 1;
    const right = left + 1;
    let smallest = index;
    if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
    if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
    if (smallest === index) return;
    [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
    index = smallest;
  }
}

function heapify9018(heap) {
  for (let index = Math.floor(heap.length / 2) - 1; index >= 0; index--) heapSink9018(heap, index);
}

function heapPush9018(heap, value) {
  heap.push(value);
  let index = heap.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (heap[parent] <= heap[index]) break;
    [heap[parent], heap[index]] = [heap[index], heap[parent]];
    index = parent;
  }
}

function heapPop9018(heap) {
  if (!heap.length) return null;
  const minimum = heap[0];
  const tail = heap.pop();
  if (heap.length) {
    heap[0] = tail;
    heapSink9018(heap, 0);
  }
  return minimum;
}

function buildServerAllocator9018Steps(input, params) {
  const parsed = parseServerAllocator9018Input(input, params);
  const inventory = [...parsed.inventory];
  const operations = parsed.operations.map((operation) => ({ ...operation }));
  const localized = (en, vi) => ({ en, vi });
  const states = new Map();
  const history = [];
  const outputs = [];
  const steps = [];
  const counters = {
    inventoryScans: 0,
    gapsFound: 0,
    heapBuilds: 0,
    heapPops: 0,
    freshIds: 0,
    heapPushes: 0,
    allocateCalls: 0,
    deallocateCalls: 0,
    noOps: 0,
  };
  let currentOperation = {
    index: null, kind: "init", arg: null, serverType: null, number: null,
    expectedNumber: null, nextId: null, candidates: [], source: null,
    status: "starting", result: null,
  };
  let answer = null;

  const createState = (nextId = null) => ({ used: new Set(), free: [], nextId });
  const sortedNumbers = (values) => [...values].sort((left, right) => left - right);
  const smallestAvailable = (serverType) => {
    const state = states.get(serverType);
    if (!state) return 1;
    if (state.free.length) return state.free[0];
    return state.nextId ?? 1;
  };
  const snapshotTypes = () => [...states.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([serverType, state]) => ({
      serverType,
      used: sortedNumbers(state.used),
      heap: [...state.free],
      available: sortedNumbers(state.free),
      nextId: state.nextId,
      smallestAvailable: state.free.length ? state.free[0] : state.nextId,
    }));
  const buildInvariants = (typeViews) => {
    let validMinHeaps = true;
    let positiveUniqueIds = true;
    let usedAndFreeDisjoint = true;
    let completeCoverage = true;
    let nextIdAboveKnownIds = true;

    for (const typeView of typeViews) {
      for (let index = 0; index < typeView.heap.length; index++) {
        const left = index * 2 + 1;
        const right = left + 1;
        if (left < typeView.heap.length && typeView.heap[index] > typeView.heap[left]) validMinHeaps = false;
        if (right < typeView.heap.length && typeView.heap[index] > typeView.heap[right]) validMinHeaps = false;
      }
      const usedSet = new Set(typeView.used);
      const freeSet = new Set(typeView.heap);
      if (usedSet.size !== typeView.used.length || freeSet.size !== typeView.heap.length
        || [...usedSet, ...freeSet].some((number) => !Number.isSafeInteger(number) || number <= 0)) {
        positiveUniqueIds = false;
      }
      if (typeView.heap.some((number) => usedSet.has(number))) usedAndFreeDisjoint = false;

      const known = new Set([...typeView.used, ...typeView.heap]);
      const inFlight = currentOperation.serverType === typeView.serverType
        && Number.isSafeInteger(currentOperation.number)
        && !known.has(currentOperation.number)
        ? currentOperation.number
        : null;
      if (inFlight !== null) known.add(inFlight);
      if (typeView.nextId !== null) {
        for (let number = 1; number < typeView.nextId; number++) {
          if (!known.has(number)) completeCoverage = false;
        }
        for (const number of known) {
          const isFreshBeforeAdvance = currentOperation.kind === "allocate"
            && currentOperation.source === "fresh"
            && number === currentOperation.number
            && number === typeView.nextId;
          if (number >= typeView.nextId && !isFreshBeforeAdvance) nextIdAboveKnownIds = false;
        }
      }
    }
    const smallestAllocationChosen = currentOperation.kind !== "allocate"
      || currentOperation.number === null
      || currentOperation.expectedNumber === currentOperation.number;
    return {
      validMinHeaps,
      positiveUniqueIds,
      usedAndFreeDisjoint,
      completeCoverage,
      nextIdAboveKnownIds,
      smallestAllocationChosen,
    };
  };
  const finalInventory = () => snapshotTypes().flatMap((type) => type.used.map((number) => `${type.serverType}-${number}`));
  const snapshotView = ({ line, event, phase, timing, condition, final }) => {
    const typeViews = snapshotTypes();
    return deepFreezeServerAllocator9018View({
      version: 1,
      problemId: 9018,
      source: { line, text: SERVER_ALLOCATOR_9018_SOURCE[line - 1] },
      event,
      phase,
      timing,
      condition: condition && typeof condition === "object"
        ? { expression: condition.expression, result: condition.result }
        : { expression: null, result: null },
      input: {
        inventory: [...inventory],
        operations: operations.map((operation) => operation.display),
        limits: {
          maxInitialServers: SERVER_ALLOCATOR_9018_MAX_INITIAL_SERVERS,
          maxOperations: SERVER_ALLOCATOR_9018_MAX_OPERATIONS,
          maxTrackedNumber: SERVER_ALLOCATOR_9018_MAX_TRACKED_NUMBER,
          maxTypes: SERVER_ALLOCATOR_9018_MAX_TYPES,
        },
      },
      operation: { ...currentOperation, candidates: [...currentOperation.candidates] },
      types: typeViews,
      history: history.map((entry) => ({ ...entry })),
      outputs: [...outputs],
      finalInventory: finalInventory(),
      invariants: buildInvariants(typeViews),
      counters: { ...counters },
      answer: final ? [...outputs] : answer,
      final,
    });
  };
  const emit = ({ line, event, phase, timing = "after", condition = null, title, note, final = false }) => {
    const view = snapshotView({ line, event, phase, timing, condition, final });
    const activeType = view.types.find((type) => type.serverType === view.operation.serverType) || view.types[0] || null;
    const rangeLength = activeType
      ? Math.min(SERVER_ALLOCATOR_9018_MAX_TRACKED_NUMBER, Math.max(activeType.nextId || 1, ...activeType.used, ...activeType.available))
      : 0;
    steps.push({
      title,
      note,
      arr: activeType ? Array.from({ length: rangeLength }, (_, index) => activeType.used.includes(index + 1) ? 1 : 0) : [],
      sub: activeType ? Array.from({ length: rangeLength }, (_, index) => `${activeType.serverType}-${index + 1}`) : [],
      highlight: Number.isSafeInteger(view.operation.number) ? [view.operation.number - 1] : [],
      mark: activeType ? activeType.available.map((number) => number - 1) : [],
      final,
      codeLines: [line],
      vars: [
        { name: "operation", value: view.operation.kind ? `${view.operation.kind} ${view.operation.arg || ""}`.trim() : "—" },
        { name: "type", value: view.operation.serverType ?? "—" },
        { name: "number", value: view.operation.number ?? "—" },
        { name: "smallest expected", value: view.operation.expectedNumber ?? "—" },
        { name: "result", value: view.operation.result ?? "None" },
        { name: "outputs", value: JSON.stringify(view.outputs) },
      ],
      serverAllocator9018View: view,
    });
  };
  const completeOperation = (operation, status, result, source = null) => {
    currentOperation = { ...currentOperation, status, result, source: source ?? currentOperation.source };
    outputs.push(result);
    history.push({
      index: operation.index,
      kind: operation.kind,
      arg: operation.arg,
      serverType: currentOperation.serverType,
      number: currentOperation.number,
      status,
      source: currentOperation.source,
      result,
    });
  };

  emit({ line: 1, event: "import-heap", phase: "setup", title: localized("Import min-heap operations", "Import các thao tác min-heap"), note: localized("heapify builds reusable-ID heaps; heappop and heappush keep their minimum at the root.", "heapify tạo heap ID tái sử dụng; heappop và heappush giữ giá trị nhỏ nhất ở gốc.") });
  emit({ line: 3, event: "bind-class", phase: "setup", title: localized("Define ServerAllocator", "Định nghĩa ServerAllocator"), note: localized("Each server type owns independent used IDs, free IDs, and a fresh-ID cursor.", "Mỗi loại server có tập ID đang dùng, ID trống và con trỏ ID mới độc lập.") });
  emit({ line: 4, event: "construct", phase: "setup", title: localized("Construct from existing inventory", "Khởi tạo từ inventory hiện có"), note: localized(`Load ${inventory.length} existing server name(s).`, `Nạp ${inventory.length} tên server hiện có.`) });
  emit({ line: 5, event: "call-init", phase: "setup", title: localized("Call init(existing_inventory)", "Gọi init(existing_inventory)"), note: localized("Initialization first groups allocated IDs, then materializes every missing lower ID.", "Khởi tạo nhóm các ID đang dùng, sau đó tạo mọi ID nhỏ hơn đang bị thiếu.") });

  states.clear();
  currentOperation = { ...currentOperation, status: "reset", arg: `${inventory.length} server(s)` };
  emit({ line: 13, event: "reset-state", phase: "init-scan", title: localized("Reset allocator state", "Đặt lại trạng thái allocator"), note: localized("used, free, and next_id start as empty per-type maps.", "used, free và next_id bắt đầu là các map rỗng theo từng loại.") });
  emit({ line: 14, event: "reset-state", phase: "init-scan", title: localized("Create the free-ID map", "Tạo map ID trống"), note: localized("Every value will be a min-heap of reusable gaps.", "Mỗi giá trị sẽ là một min-heap chứa các khoảng trống tái sử dụng.") });
  emit({ line: 15, event: "reset-state", phase: "init-scan", title: localized("Create the next-ID map", "Tạo map next-ID"), note: localized("next_id is the first never-issued number for a type.", "next_id là số đầu tiên chưa từng được cấp của một loại.") });

  inventory.forEach((name, index) => {
    const parsedName = parseServerName9018(name, { initial: true });
    currentOperation = {
      index, kind: "init", arg: name, serverType: null, number: null,
      expectedNumber: null, nextId: null, candidates: [], source: null,
      status: "scan", result: null,
    };
    counters.inventoryScans++;
    emit({ line: 16, event: "select-inventory-name", phase: "init-scan", timing: "before", condition: { expression: `${index} < ${inventory.length}`, result: true }, title: localized(`Scan ${name}`, `Quét ${name}`), note: localized("Read one existing allocation.", "Đọc một allocation hiện có.") });
    currentOperation = { ...currentOperation, serverType: parsedName.serverType, number: parsedName.number, status: "parsed" };
    emit({ line: 17, event: "split-name", phase: "init-scan", title: localized(`Split into ${parsedName.serverType} and ${parsedName.number}`, `Tách thành ${parsedName.serverType} và ${parsedName.number}`), note: localized("rsplit at the final hyphen also supports types such as api-v2.", "rsplit tại dấu gạch nối cuối cũng hỗ trợ loại như api-v2.") });
    if (!states.has(parsedName.serverType)) states.set(parsedName.serverType, createState());
    states.get(parsedName.serverType).used.add(parsedName.number);
    currentOperation = { ...currentOperation, status: "recorded" };
    emit({ line: 18, event: "record-used", phase: "init-scan", title: localized(`Mark ${name} as allocated`, `Đánh dấu ${name} đang được dùng`), note: localized("The per-type set prevents one number from being allocated twice.", "Set theo loại ngăn một số được cấp hai lần.") });
  });
  currentOperation = { ...currentOperation, index: null, arg: null, number: null, status: "scan-complete" };
  emit({ line: 16, event: "inventory-loop-complete", phase: "init-scan", timing: "before", condition: { expression: `${inventory.length} < ${inventory.length}`, result: false }, title: localized("Inventory scan complete", "Quét inventory hoàn tất"), note: localized("All existing names are grouped by server type.", "Mọi tên hiện có đã được nhóm theo loại server.") });

  for (const [serverType, state] of [...states.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const nextId = Math.max(...state.used) + 1;
    const gaps = [];
    for (let number = 1; number < nextId; number++) {
      if (!state.used.has(number)) gaps.push(number);
    }
    currentOperation = {
      index: null, kind: "init", arg: serverType, serverType, number: null,
      expectedNumber: gaps[0] ?? nextId, nextId, candidates: [...gaps], source: null,
      status: "build-heap", result: null,
    };
    emit({ line: 19, event: "select-type", phase: "init-heaps", timing: "before", title: localized(`Prepare type ${serverType}`, `Chuẩn bị loại ${serverType}`), note: localized(`Allocated IDs are [${sortedNumbers(state.used).join(", ")}].`, `Các ID đang dùng là [${sortedNumbers(state.used).join(", ")}].`) });
    emit({ line: 20, event: "compute-next-id", phase: "init-heaps", title: localized(`next_id[${serverType}] = ${nextId}`, `next_id[${serverType}] = ${nextId}`), note: localized("Fresh allocation starts one above the largest existing ID.", "Allocation mới bắt đầu lớn hơn ID hiện có lớn nhất một đơn vị.") });
    counters.gapsFound += gaps.length;
    emit({ line: 21, event: "find-gaps", phase: "init-heaps", title: localized(`Find gaps [${gaps.join(", ") || "none"}]`, `Tìm khoảng trống [${gaps.join(", ") || "không có"}]`), note: localized("Every missing positive ID below next_id is immediately reusable.", "Mọi ID dương bị thiếu dưới next_id đều có thể tái sử dụng ngay.") });
    heapify9018(gaps);
    counters.heapBuilds++;
    state.free = gaps;
    state.nextId = nextId;
    emit({ line: 23, event: "heapify-gaps", phase: "init-heaps", title: localized(`Heapify ${serverType} gaps`, `Heapify khoảng trống ${serverType}`), note: localized("The smallest gap is now at heap index 0.", "Khoảng trống nhỏ nhất giờ ở index 0 của heap.") });
    emit({ line: 24, event: "store-free-heap", phase: "init-heaps", title: localized(`Store free[${serverType}]`, `Lưu free[${serverType}]`), note: localized(`Reusable IDs: [${sortedNumbers(state.free).join(", ") || "none"}].`, `ID tái sử dụng: [${sortedNumbers(state.free).join(", ") || "không có"}].`) });
    emit({ line: 25, event: "store-next-id", phase: "init-heaps", title: localized(`Store next_id = ${nextId}`, `Lưu next_id = ${nextId}`), note: localized(`The smallest currently available ID is ${smallestAvailable(serverType)}.`, `ID nhỏ nhất hiện có là ${smallestAvailable(serverType)}.`) });
  }
  currentOperation = {
    index: null, kind: "init", arg: `${inventory.length} server(s)`, serverType: null, number: null,
    expectedNumber: null, nextId: null, candidates: [], source: null,
    status: "ready", result: null,
  };
  emit({ line: 25, event: "init-complete", phase: "init-heaps", title: localized("Allocator ready", "Allocator sẵn sàng"), note: localized("Each type can now return its globally smallest available positive number.", "Mỗi loại giờ có thể trả về số dương nhỏ nhất đang khả dụng.") });

  for (const operation of operations) {
    if (operation.kind === "allocate") {
      counters.allocateCalls++;
      const expectedNumber = smallestAvailable(operation.serverType);
      currentOperation = {
        index: operation.index, kind: operation.kind, arg: operation.arg,
        serverType: operation.serverType, number: null, expectedNumber,
        nextId: states.get(operation.serverType)?.nextId ?? 1,
        candidates: states.get(operation.serverType) ? sortedNumbers(states.get(operation.serverType).free) : [],
        source: null, status: "request", result: null,
      };
      emit({ line: 27, event: "allocate-request", phase: "allocate", timing: "before", title: localized(`allocate(${operation.serverType})`, `allocate(${operation.serverType})`), note: localized(`The correct number before mutation is ${expectedNumber}.`, `Số đúng trước khi thay đổi là ${expectedNumber}.`) });

      if (!states.has(operation.serverType)) states.set(operation.serverType, createState(1));
      const state = states.get(operation.serverType);
      if (state.nextId === null) state.nextId = 1;
      currentOperation = { ...currentOperation, status: "defaults-ready", nextId: state.nextId };
      emit({ line: 28, event: "ensure-used", phase: "allocate", title: localized("Ensure used set exists", "Đảm bảo used set tồn tại"), note: localized("An unseen type starts with an empty used set.", "Một loại mới bắt đầu với used set rỗng.") });
      emit({ line: 29, event: "ensure-free", phase: "allocate", title: localized("Ensure free heap exists", "Đảm bảo free heap tồn tại"), note: localized("An unseen type has no released or missing IDs yet.", "Một loại mới chưa có ID bị trả hoặc bị thiếu.") });
      emit({ line: 30, event: "ensure-next-id", phase: "allocate", title: localized(`next_id starts at ${state.nextId}`, `next_id bắt đầu tại ${state.nextId}`), note: localized("Positive server numbering begins at 1.", "Đánh số server dương bắt đầu từ 1.") });

      const hasGap = state.free.length > 0;
      emit({ line: 31, event: hasGap ? "free-check-true" : "free-check-false", phase: "allocate", condition: { expression: `bool(free[${operation.serverType}])`, result: hasGap }, title: localized(hasGap ? "Reusable gap found" : "No reusable gap", hasGap ? "Tìm thấy khoảng trống tái sử dụng" : "Không có khoảng trống tái sử dụng"), note: hasGap ? localized(`Heap root ${state.free[0]} must be selected first.`, `Phải chọn gốc heap ${state.free[0]} trước.`) : localized(`Use the fresh cursor ${state.nextId}.`, `Dùng con trỏ ID mới ${state.nextId}.`) });

      let number;
      let source;
      if (hasGap) {
        number = heapPop9018(state.free);
        source = "reused";
        counters.heapPops++;
        currentOperation = { ...currentOperation, number, source, status: "selected-gap", candidates: sortedNumbers(state.free) };
        emit({ line: 32, event: "pop-gap", phase: "allocate", title: localized(`heappop → ${number}`, `heappop → ${number}`), note: localized("Removing the heap root proves this is the smallest reusable number.", "Lấy gốc heap chứng minh đây là số tái sử dụng nhỏ nhất.") });
      } else {
        number = state.nextId;
        source = "fresh";
        currentOperation = { ...currentOperation, number, source, status: "selected-fresh" };
        emit({ line: 34, event: "take-fresh", phase: "allocate", title: localized(`Take fresh ID ${number}`, `Lấy ID mới ${number}`), note: localized("Every smaller positive ID is already allocated, so the cursor is minimal.", "Mọi ID dương nhỏ hơn đều đang được dùng, nên con trỏ là nhỏ nhất.") });
        state.nextId++;
        counters.freshIds++;
        currentOperation = { ...currentOperation, nextId: state.nextId, status: "cursor-advanced" };
        emit({ line: 35, event: "advance-next-id", phase: "allocate", title: localized(`Advance next_id to ${state.nextId}`, `Tăng next_id lên ${state.nextId}`), note: localized("The cursor never moves backward; released IDs go into the heap instead.", "Con trỏ không bao giờ lùi; ID được trả sẽ vào heap.") });
      }
      state.used.add(number);
      currentOperation = { ...currentOperation, status: "marked-used" };
      emit({ line: 36, event: "mark-used", phase: "allocate", title: localized(`Mark ${operation.serverType}-${number} used`, `Đánh dấu ${operation.serverType}-${number} đang dùng`), note: localized("The selected number leaves the available set before the name is returned.", "Số đã chọn rời tập khả dụng trước khi trả tên.") });
      const result = `${operation.serverType}-${number}`;
      completeOperation(operation, "allocated", result, source);
      emit({ line: 37, event: "return-name", phase: "allocate", title: localized(`Return ${result}`, `Trả về ${result}`), note: localized(source === "reused" ? "This allocation filled the smallest available gap." : "No gap existed, so this allocation consumed the next fresh ID.", source === "reused" ? "Allocation này lấp khoảng trống nhỏ nhất." : "Không có khoảng trống nên allocation này dùng ID mới kế tiếp.") });
      continue;
    }

    counters.deallocateCalls++;
    currentOperation = {
      index: operation.index, kind: operation.kind, arg: operation.arg,
      serverType: operation.serverType, number: operation.number,
      expectedNumber: null, nextId: states.get(operation.serverType)?.nextId ?? null,
      candidates: states.get(operation.serverType) ? sortedNumbers(states.get(operation.serverType).free) : [],
      source: null, status: "request", result: null,
    };
    emit({ line: 39, event: "deallocate-request", phase: "deallocate", timing: "before", title: localized(`deallocate(${operation.arg})`, `deallocate(${operation.arg})`), note: localized("Return this name only if it is currently allocated.", "Chỉ trả tên này nếu nó hiện đang được cấp.") });
    emit({ line: 40, event: "split-deallocation", phase: "deallocate", title: localized(`Split into ${operation.serverType} and ${operation.number}`, `Tách thành ${operation.serverType} và ${operation.number}`), note: localized("The final numeric suffix identifies the per-type ID.", "Hậu tố số cuối xác định ID trong loại.") });
    const state = states.get(operation.serverType);
    currentOperation = { ...currentOperation, status: state ? "type-found" : "type-missing" };
    emit({ line: 41, event: "lookup-type", phase: "deallocate", title: localized(state ? `Find used[${operation.serverType}]` : `Type ${operation.serverType} is unknown`, state ? `Tìm thấy used[${operation.serverType}]` : `Không có loại ${operation.serverType}`), note: localized("A map lookup finds the independent state for this type.", "Tra cứu map tìm trạng thái độc lập của loại này.") });
    const missing = !state || !state.used.has(operation.number);
    emit({ line: 42, event: missing ? "missing-check-true" : "missing-check-false", phase: "deallocate", condition: { expression: `numbers is None or ${operation.number} not in numbers`, result: missing }, title: localized(missing ? "Name is not allocated" : "Name is currently allocated", missing ? "Tên không được cấp" : "Tên đang được cấp"), note: missing ? localized("Ignore unknown or repeated deallocation so no duplicate enters the free heap.", "Bỏ qua deallocation lạ hoặc lặp lại để không có phần tử trùng trong free heap.") : localized("The ID can safely move from used to free.", "ID có thể chuyển an toàn từ used sang free.") });
    if (missing) {
      counters.noOps++;
      completeOperation(operation, "ignored", null, "no-op");
      emit({ line: 43, event: "ignore-missing", phase: "deallocate", title: localized("No-op return", "Trả về no-op"), note: localized("State is unchanged and the method returns None.", "Trạng thái không đổi và method trả về None.") });
      continue;
    }

    state.used.delete(operation.number);
    currentOperation = { ...currentOperation, status: "removed-used", source: "released" };
    emit({ line: 44, event: "remove-used", phase: "deallocate", title: localized(`Remove ${operation.arg} from used`, `Xóa ${operation.arg} khỏi used`), note: localized("The ID is temporarily in flight between the used set and free heap.", "ID tạm thời đang chuyển giữa used set và free heap.") });
    heapPush9018(state.free, operation.number);
    counters.heapPushes++;
    completeOperation(operation, "deallocated", null, "released");
    currentOperation = { ...currentOperation, candidates: sortedNumbers(state.free) };
    emit({ line: 45, event: "push-gap", phase: "deallocate", title: localized(`heappush ${operation.number}`, `heappush ${operation.number}`), note: localized(`The heap root is now ${state.free[0]}, the next reusable number for ${operation.serverType}.`, `Gốc heap giờ là ${state.free[0]}, số tái sử dụng kế tiếp cho ${operation.serverType}.`) });
  }

  answer = [...outputs];
  const finalLine = currentOperation.kind === "allocate" ? 37 : currentOperation.status === "ignored" ? 43 : 45;
  emit({ line: finalLine, event: "simulation-complete", phase: "done", title: localized("Simulation complete", "Mô phỏng hoàn tất"), note: localized(`Method outputs: ${JSON.stringify(outputs)}. Final inventory: [${finalInventory().join(", ")}].`, `Kết quả method: ${JSON.stringify(outputs)}. Inventory cuối: [${finalInventory().join(", ")}].`), final: true });

  return {
    original: [...inventory],
    operations: operations.map((operation) => ({ name: operation.kind, args: [operation.arg] })),
    answer: [...outputs],
    finalInventory: finalInventory(),
    steps,
  };
}

const DESIGN = { key: "design", vi: "Thiết kế hệ thống", en: "Design" };
const HEAP = { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" };
const HASHMAP = { key: "hashmap", vi: "Hash Map", en: "Hash Map" };

module.exports = {
  9018: {
    id: 9018,
    difficulty: "medium",
    category: DESIGN,
    tags: [HEAP, HASHMAP],
    title: { vi: "Server Name Allocator", en: "Server Name Allocator" },
    titleVi: { vi: "Cấp tên server nhỏ nhất còn trống", en: "Allocate the smallest available server name" },
    statement: {
      vi: "Tên server có dạng <loại>-<số>. Khởi tạo từ inventory hiện có; allocate(loại) phải trả tên dùng số dương nhỏ nhất chưa được dùng của riêng loại đó. deallocate(tên) giải phóng số để lần cấp sau tái sử dụng. Deallocate tên không tồn tại hoặc đã giải phóng là no-op an toàn.",
      en: "Server names have the form <type>-<number>. Initialize from existing inventory; allocate(type) must return the name using that type's smallest unused positive number. deallocate(name) releases its number for reuse. Deallocating an unknown or already released name is a safe no-op.",
    },
    defaultInput: '["api-2", "api-4", "api-6", "db-1"]',
    inputKind: "string",
    inputLabel: { vi: "Existing inventory (JSON string array)", en: "Existing inventory (JSON string array)" },
    extraParams: [{
      key: "operations",
      type: "string",
      default: "allocate api | deallocate api-2 | deallocate api-4 | allocate api | allocate db | allocate api | allocate api | allocate api | allocate api",
      label: { vi: "Operations (ngăn cách bằng |)", en: "Operations (separated by |)" },
    }],
    debugMode: "line-by-line",
    parseServerAllocator9018Input,
    approach: [
      { vi: "Dùng used set riêng cho mỗi loại để biết ID nào đang được cấp; tách tên tại dấu gạch nối cuối để hỗ trợ loại có dấu gạch nối.", en: "Keep a per-type used set for allocated IDs; split names at the final hyphen so hyphenated types remain valid." },
      { vi: "Khi init, tìm mọi ID bị thiếu dưới max hiện tại và heapify chúng thành min-heap free; next_id nằm ngay trên max.", en: "During init, find every missing ID below the current maximum and heapify those gaps into free; next_id sits just above the maximum." },
      { vi: "allocate ưu tiên heappop(free); chỉ dùng và tăng next_id khi heap rỗng. Vì vậy luôn chọn số nhỏ nhất.", en: "allocate prefers heappop(free); it uses and advances next_id only when the heap is empty. Therefore it always chooses the minimum." },
      { vi: "deallocate chỉ chuyển một ID thực sự đang dùng sang heap. Lệnh lặp hoặc không hợp lệ là no-op để tránh ID trùng.", en: "deallocate moves only a currently used ID into the heap. Repeated or unknown calls are no-ops, preventing duplicate free IDs." },
    ],
    complexity: {
      time: "init O(N + G), allocate/deallocate O(log Gₜ)",
      space: "O(N + G + T)",
      note: {
        vi: "G là tổng số khoảng trống được tạo dưới max của từng loại; T là số loại. Visualizer giới hạn suffix để minh họa heap rõ ràng.",
        en: "G is the total number of materialized gaps below each type's maximum; T is the type count. The visualizer bounds suffixes to keep the heap trace readable.",
      },
    },
    code: SERVER_ALLOCATOR_9018_SOURCE,
    builder: buildServerAllocator9018Steps,
  },
};
