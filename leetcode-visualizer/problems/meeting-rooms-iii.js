// LeetCode 2402: sort by original start, then schedule with free/busy min-heaps.

const label = (vi, en) => ({ vi, en });
const MAX_TRACE_STEPS = 700;

class MinHeap {
  constructor(items = [], compare = (left, right) => left - right) {
    this.data = [...items];
    this.compare = compare;
    for (let index = Math.floor(this.data.length / 2) - 1; index >= 0; index--) this.siftDown(index);
  }

  get size() { return this.data.length; }
  peek() { return this.data[0]; }

  push(value) {
    const items = this.data;
    items.push(value);
    let index = items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(items[parent], items[index]) <= 0) break;
      [items[parent], items[index]] = [items[index], items[parent]];
      index = parent;
    }
  }

  pop() {
    const items = this.data;
    if (!items.length) return null;
    const first = items[0];
    const last = items.pop();
    if (items.length) {
      items[0] = last;
      this.siftDown(0);
    }
    return first;
  }

  siftDown(start) {
    const items = this.data;
    let index = start;
    while (true) {
      const left = 2 * index + 1;
      const right = left + 1;
      let smallest = index;
      if (left < items.length && this.compare(items[left], items[smallest]) < 0) smallest = left;
      if (right < items.length && this.compare(items[right], items[smallest]) < 0) smallest = right;
      if (smallest === index) break;
      [items[index], items[smallest]] = [items[smallest], items[index]];
      index = smallest;
    }
  }
}

function parseMeetings(input) {
  if (Array.isArray(input)) return input.map((meeting) => Array.isArray(meeting) ? [...meeting] : meeting);
  const raw = String(input ?? "").trim();
  if (raw.startsWith("[")) {
    try { return JSON.parse(raw); } catch (_error) { throw new Error("meetings must be pairs [start,end]"); }
  }
  return raw.split(";").map((part) => part.trim().split(",").map((value) =>
    value.trim() === "" ? NaN : Number(value.trim())));
}

function buildSteps2402(input, params = {}) {
  const n = Number(params.n ?? 2);
  const meetings = parseMeetings(input);
  if (!Number.isInteger(n) || n < 1 || n > 100 || !Array.isArray(meetings)
    || meetings.length < 1 || meetings.length > 100000
    || meetings.some((meeting) => !Array.isArray(meeting) || meeting.length !== 2
      || !Number.isInteger(meeting[0]) || !Number.isInteger(meeting[1])
      || meeting[0] < 0 || meeting[0] >= meeting[1] || meeting[1] > 500000)
    || new Set(meetings.map((meeting) => meeting[0])).size !== meetings.length) {
    throw new Error("n must be in [1,100]; meetings must be unique-start integer pairs with 0 <= start < end <= 500000");
  }

  const ordered = meetings.map(([start, end], originalIndex) => ({ start, end, originalIndex }))
    .sort((left, right) => left.start - right.start);
  const free = new MinHeap(Array.from({ length: n }, (_, room) => room));
  const busy = new MinHeap([], (left, right) => left[0] - right[0] || left[1] - right[1]);
  const counts = Array(n).fill(0);
  const roomUntil = Array(n).fill(null);
  const assignments = [];
  const steps = [];
  let currentIndex = null;
  let current = null;
  let room = null;
  let actualStart = null;
  let finish = null;
  let released = null;
  let omitted = false;

  function record(phase, title, line, note, options = {}) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const freeRooms = free.size <= 30 ? [...free.data].sort((a, b) => a - b) : [free.peek()];
    const busyJobs = busy.size <= 30 ? [...busy.data].sort((a, b) => a[0] - b[0] || a[1] - b[1]) : [busy.peek()];
    const roomIds = [...new Set([
      ...Array.from({ length: Math.min(n, 15) }, (_, id) => id), room, released,
    ].filter(Number.isInteger))].sort((a, b) => a - b);
    const assignmentPreview = assignments.length <= 18 ? assignments
      : [...assignments.slice(0, 17), assignments.at(-1)];
    const vars = [
      { name: "n", value: n }, { name: "meetings", value: ordered.length },
      { name: "free", value: free.size }, { name: "busy", value: busy.size },
      { name: "count", value: n <= 15 ? [...counts] : `[${counts.slice(0, 15).join(", ")}, …]` },
    ];
    if (current) vars.push({ name: "meeting", value: [current.start, current.end] },
      { name: "duration", value: current.end - current.start });
    if (room !== null) vars.push({ name: "room", value: room });
    if (actualStart !== null) vars.push({ name: "actual start", value: actualStart });
    if (finish !== null) vars.push({ name: "finish", value: finish });
    if (options.final) vars.push({ name: "answer", value: options.answer });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note,
      final: Boolean(options.final),
      meetingRooms2402View: {
        phase, n, meetingCount: ordered.length, currentIndex,
        meeting: current ? { ...current } : null, room, released, actualStart, finish,
        delayed: actualStart !== null && current !== null && actualStart > current.start,
        freeCount: free.size, busyCount: busy.size,
        freeRooms, busyJobs: busyJobs.map(([until, id]) => ({ until, room: id })),
        rooms: roomIds.map((id) => ({ id, count: counts[id], until: roomUntil[id],
          chosen: id === room, released: id === released })),
        assignments: assignmentPreview.map((assignment) => ({ ...assignment })),
        assignmentCount: assignments.length,
        answer: options.answer ?? null, best: options.best ?? null, omitted,
      },
    });
  }

  record("sort", label("Sắp theo giờ bắt đầu gốc", "Sort by original start time"), 4,
    label("Thứ tự này quyết định cuộc họp nào được ưu tiên khi phải chờ.",
      "This original-start order determines priority when meetings must wait."));
  record("init", label(`Phòng rảnh: 0..${n - 1}`, `Free rooms: 0..${n - 1}`), 5,
    label("Min-heap phòng rảnh chọn số phòng nhỏ nhất.", "The free-room min-heap picks the lowest room number."));
  record("init", label("Busy heap rỗng", "Busy heap is empty"), 7,
    label("Busy heap sắp theo (giờ xong, số phòng).", "The busy heap is ordered by (finish time, room number)."));
  record("init", label("Đếm cuộc họp mỗi phòng", "Initialize room counts"), 8,
    label("Mỗi cuộc họp được phân công sẽ tăng count của đúng một phòng.",
      "Every assigned meeting increments exactly one room's count."));

  for (let index = 0; index < ordered.length; index++) {
    currentIndex = index;
    current = ordered[index];
    room = null;
    actualStart = null;
    finish = null;
    released = null;
    record("meeting", label(`Xét cuộc họp #${current.originalIndex}: [${current.start}, ${current.end})`,
      `Meeting #${current.originalIndex}: [${current.start}, ${current.end})`), 9,
    label("Duyệt theo giờ bắt đầu gốc, không theo giờ đã dời.",
      "Process by original start time, not delayed start time."));

    while (busy.size && busy.peek()[0] <= current.start) {
      record("release-check", label(`Có phòng xong trước ${current.start}`, `A room finishes by ${current.start}`), 10,
        label("Khoảng [start,end) kết thúc đúng lúc start mới thì phòng đã rảnh.",
          "Because intervals are half-open, a room finishing exactly at start is free."));
      const [until, id] = busy.pop();
      released = id;
      roomUntil[id] = null;
      record("release", label(`Phòng ${id} xong lúc ${until}`, `Room ${id} finishes at ${until}`), 11,
        label("Lấy cuộc họp hoàn tất sớm nhất ra khỏi busy heap.",
          "Remove the earliest finished room from the busy heap."));
      free.push(id);
      record("free", label(`Phòng ${id} trở lại free heap`, `Room ${id} returns to free heap`), 12,
        label("Nếu nhiều phòng rảnh, heap sẽ ưu tiên số nhỏ nhất.",
          "Among free rooms, the heap prefers the smallest number."));
    }
    released = null;
    const duration = current.end - current.start;
    record("duration", label(`Thời lượng = ${duration}`, `Duration = ${duration}`), 13,
      label("Nếu bị dời, cuộc họp vẫn giữ nguyên thời lượng này.",
        "A delayed meeting keeps this same duration."));
    record("choice", label(free.size ? "Có phòng rảnh" : "Tất cả phòng đang bận",
      free.size ? "A room is free" : "All rooms are busy"), 14,
    free.size
      ? label("Chọn phòng rảnh có số nhỏ nhất.", "Choose the lowest-numbered free room.")
      : label("Dời tới thời điểm phòng bận kết thúc sớm nhất.", "Delay until the earliest busy room finishes."));
    if (free.size) {
      room = free.pop();
      record("take-free", label(`Chọn phòng rảnh ${room}`, `Take free room ${room}`), 15,
        label("Không cần dời cuộc họp.", "This meeting starts on time."));
      actualStart = current.start;
      finish = current.end;
      record("on-time", label(`Giữ lịch [${actualStart}, ${finish})`, `Keep [${actualStart}, ${finish})`), 16,
        label("Giờ bắt đầu và kết thúc không đổi.", "Start and finish times stay unchanged."));
    } else {
      const [available, id] = busy.pop();
      room = id;
      record("take-busy", label(`Phòng ${room} rảnh sớm nhất lúc ${available}`,
        `Room ${room} frees earliest at ${available}`), 18,
      label("Nếu cùng giờ xong, số phòng nhỏ hơn được chọn.",
        "If finish times tie, choose the smaller room number."));
      actualStart = available;
      finish = available + duration;
      record("delay", label(`Dời tới [${actualStart}, ${finish})`, `Delay to [${actualStart}, ${finish})`), 19,
        label(`Thời lượng vẫn là ${duration}; chỉ tịnh tiến khoảng thời gian.`,
          `Duration remains ${duration}; only the time interval shifts.`));
    }
    busy.push([finish, room]);
    roomUntil[room] = finish;
    assignments.push({ index: currentIndex, originalIndex: current.originalIndex,
      originalStart: current.start, originalEnd: current.end, actualStart, finish, room });
    record("schedule", label(`Phòng ${room} bận tới ${finish}`, `Room ${room} busy until ${finish}`), 20,
      label("Đưa lịch mới vào busy heap theo (giờ xong, số phòng).",
        "Put the new reservation in the busy heap by (finish, room)."));
    counts[room]++;
    record("count", label(`count[${room}] = ${counts[room]}`, `count[${room}] = ${counts[room]}`), 21,
      label("Một phòng có thể nhận nhiều cuộc họp, kể cả cuộc họp bị dời.",
        "A room can receive multiple meetings, including delayed ones."));
  }

  let answer = 0;
  for (let id = 1; id < n; id++) if (counts[id] > counts[answer]) answer = id;
  currentIndex = null;
  current = null;
  room = null;
  actualStart = null;
  finish = null;
  released = null;
  record("done", label(`Phòng ${answer} nhiều cuộc họp nhất`, `Room ${answer} has the most meetings`), 22,
    omitted
      ? label("Trace dài đã rút gọn; lịch và đáp án vẫn được tính đầy đủ.",
        "The long trace was shortened; scheduling and the answer are still complete.")
      : label("Nếu hòa, duyệt từ phòng 0 nên chọn phòng có số nhỏ nhất.",
        "On a tie, scanning from room 0 keeps the lowest room number."),
    { final: true, answer, best: counts[answer] });
  return { original: meetings.map((meeting) => [...meeting]), n, answer, assignments, steps };
}

module.exports = {
  2402: {
    id: 2402,
    difficulty: "hard",
    slug: "meeting-rooms-iii",
    category: { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
    tags: [
      { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: label("Meeting Rooms III", "Meeting Rooms III"),
    titleVi: label("Phòng họp được dùng nhiều nhất", "Most-booked room"),
    statement: label(
      "Có n phòng đánh số từ 0. Xét cuộc họp theo giờ bắt đầu gốc: chọn phòng rảnh số nhỏ nhất, hoặc dời tới phòng xong sớm nhất mà vẫn giữ thời lượng. Trả phòng nhận nhiều cuộc họp nhất (hòa chọn số nhỏ nhất).",
      "There are n rooms numbered from 0. Process meetings by original start time: take the lowest free room, or delay to the earliest finishing room without changing duration. Return the most-booked room (lowest number on a tie)."
    ),
    defaultInput: "0,10;1,5;2,7;3,4",
    inputKind: "string",
    inputLabel: label("meetings (start,end;...)", "meetings (start,end;...)"),
    extraParams: [{ key: "n", label: label("n (số phòng)", "n (rooms)"), default: 2 }],
    approach: [
      label("Sắp cuộc họp theo thời điểm bắt đầu gốc để giữ thứ tự ưu tiên.",
        "Sort meetings by original start time to preserve their priority."),
      label("free heap giữ số phòng rảnh; busy heap giữ (giờ xong, phòng) để xử lý cả trường hợp hòa.",
        "The free heap holds room numbers; the busy heap holds (finish, room), including tie-breaking."),
      label("Nếu không còn phòng rảnh, lấy lịch xong sớm nhất và cộng thêm thời lượng gốc; đếm mỗi lần phân công.",
        "If all rooms are busy, take the earliest finish and add the original duration; count each assignment."),
    ],
    complexity: {
      time: "O(m log m + m log n)", space: "O(m + n)",
      note: label("m là số cuộc họp; bản visualizer giữ bản sao đã sắp và lịch phân công. Hai heap chứa tối đa n phòng.",
        "m is the number of meetings; the visualizer keeps a sorted copy and assignment list. The two heaps hold at most n rooms."),
    },
    code: [
      "import heapq",
      "class Solution:",
      "    def mostBooked(self, n, meetings):",
      "        meetings.sort()",
      "        free = list(range(n))",
      "        heapq.heapify(free)",
      "        busy = []  # (finish, room)",
      "        count = [0] * n",
      "        for start, end in meetings:",
      "            while busy and busy[0][0] <= start:",
      "                _, room = heapq.heappop(busy)",
      "                heapq.heappush(free, room)",
      "            duration = end - start",
      "            if free:",
      "                room = heapq.heappop(free)",
      "                finish = end",
      "            else:",
      "                available, room = heapq.heappop(busy)",
      "                finish = available + duration",
      "            heapq.heappush(busy, (finish, room))",
      "            count[room] += 1",
      "        return max(range(n), key=lambda room: (count[room], -room))",
    ],
    builder: buildSteps2402,
  },
};
