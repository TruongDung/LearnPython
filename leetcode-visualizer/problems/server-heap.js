// LeetCode 1606: two heaps, using virtual slots for wraparound server choice.

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
      const left = index * 2 + 1;
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

function parseLoad(input) {
  if (Array.isArray(input)) return [...input];
  const raw = String(input ?? "").trim();
  if (raw.startsWith("[")) {
    try { return JSON.parse(raw); } catch (_error) { throw new Error("load must be a comma-separated integer array"); }
  }
  return raw.split(",").map((value) => Number(value.trim()));
}

function buildSteps1606(input, params = {}) {
  const arrival = Array.isArray(input) ? input : [];
  const load = parseLoad(params.load ?? "5,2,3,3,3");
  const k = Number(params.k ?? 3);
  if (!Number.isInteger(k) || k < 1 || k > 100000
    || !arrival.length || arrival.length > 100000 || !Array.isArray(load) || load.length !== arrival.length
    || arrival.some((time, index) => !Number.isInteger(time) || time < 1 || time > 1e9
      || (index > 0 && time <= arrival[index - 1]))
    || load.some((duration) => !Number.isInteger(duration) || duration < 1 || duration > 1e9)) {
    throw new Error("k must be in [1, 100000]; arrival must be strictly increasing positive integers and load must contain matching positive durations in [1, 10^9]");
  }

  let free = null;
  let busy = null;
  let handled = null;
  const busyUntil = Array(k).fill(null);
  const steps = [];
  let i = null;
  let time = null;
  let duration = null;
  let preferred = null;
  let slot = null;
  let server = null;
  let released = null;
  let dropped = false;
  let droppedCount = 0;
  let omitted = false;

  function record(phase, title, line, note, options = {}) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const previewIds = [...new Set([
      ...Array.from({ length: Math.min(k, 18) }, (_, index) => index),
      preferred, server, released,
    ].filter((value) => Number.isInteger(value)))].sort((left, right) => left - right);
    const freeSlots = !free ? [] : free.size <= 30 ? [...free.data].sort((a, b) => a - b) : [free.peek()];
    const busyJobs = !busy ? [] : busy.size <= 30
      ? [...busy.data].sort((a, b) => a[0] - b[0] || a[1] - b[1]) : [busy.peek()];
    const vars = [{ name: "k", value: k }, { name: "arrival count", value: arrival.length }];
    if (free) vars.push({ name: "free count", value: free.size });
    if (busy) vars.push({ name: "busy count", value: busy.size });
    if (handled) vars.push({ name: "handled", value: handled.length <= 18 ? [...handled]
      : `[${handled.slice(0, 18).join(", ")}, …] (${handled.length} servers)` });
    if (handled) vars.push({ name: "dropped", value: droppedCount });
    if (i !== null) vars.push({ name: "i", value: i }, { name: "time", value: time }, { name: "duration", value: duration }, { name: "preferred", value: preferred });
    if (slot !== null) vars.push({ name: "slot", value: slot });
    if (server !== null) vars.push({ name: "server", value: server });
    if (options.final) vars.push({ name: "answer", value: options.answer.length <= 30 ? options.answer
      : `[${options.answer.slice(0, 30).join(", ")}, …] (${options.answer.length} servers)` });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note,
      final: Boolean(options.final),
      serverHeap1606View: {
        phase, k, requestCount: arrival.length, i, time, duration, preferred, slot, server, released, dropped, droppedCount,
        freeCount: free ? free.size : null, busyCount: busy ? busy.size : null,
        freeSlots: freeSlots.map((virtual) => ({ virtual, server: virtual % k })),
        busyJobs: busyJobs.map(([until, id]) => ({ until, server: id })),
        servers: previewIds.map((id) => ({ id, count: handled ? handled[id] : null, until: busyUntil[id],
          preferred: id === preferred, chosen: id === server, released: id === released })),
        best: options.best ?? null, answer: options.answer ? options.answer.slice(0, 30) : null,
        winnerCount: options.answer?.length ?? null, omitted,
      },
    });
  }

  free = new MinHeap(Array.from({ length: k }, (_, index) => index));
  record("init", label(`free = [0..${k - 1}]`, `free = [0..${k - 1}]`), 5,
    label("Mỗi số ban đầu vừa là vị trí ảo vừa là ID server.", "Initially each virtual slot is also a server ID."));
  record("init", label("heapify(free)", "heapify(free)"), 6,
    label("Heap nhỏ nhất giúp chọn server rảnh kế tiếp theo vòng.", "The min-heap chooses the next available server in cyclic order."));
  busy = new MinHeap([], (left, right) => left[0] - right[0] || left[1] - right[1]);
  record("init", label("busy = []", "busy = []"), 7,
    label("Heap này ưu tiên thời điểm hoàn tất sớm nhất.", "This heap prioritizes the earliest finishing job."));
  handled = Array(k).fill(0);
  record("init", label("handled = [0] * k", "handled = [0] * k"), 8,
    label("Đếm số request xử lý thành công của từng server.", "Count successfully handled requests for each server."));

  for (let index = 0; index < arrival.length; index++) {
    i = index;
    time = arrival[i];
    duration = load[i];
    preferred = i % k;
    slot = null;
    server = null;
    released = null;
    dropped = false;
    record("request", label(`Request #${i} tới lúc ${time}`, `Request #${i} arrives at ${time}`), 9,
      label(`Ưu tiên server ${preferred} = ${i} % ${k}; nếu bận thì quấn vòng.`, `Prefer server ${preferred} = ${i} % ${k}; wrap around if busy.`));

    while (true) {
      const ready = busy.size > 0 && busy.peek()[0] <= time;
      record("release-check", label(`Có server xong trước ${time}? ${ready}`, `Any server finished by ${time}? ${ready}`), 10,
        ready
          ? label("Giải phóng server trước khi phân công request mới.", "Release finished servers before assigning the new request.")
          : label("Không còn server cần giải phóng lúc này.", "No more servers finish by this arrival time."));
      if (!ready) break;
      const [until, id] = busy.pop();
      busyUntil[id] = null;
      released = id;
      server = id;
      record("release", label(`Server ${id} xong lúc ${until}`, `Server ${id} finished at ${until}`), 11,
        label("Server rảnh trở lại và sẽ được đặt vào free heap.", "The server becomes available and will rejoin the free heap."));
      const virtual = i + ((id - i) % k + k) % k;
      free.push(virtual);
      slot = virtual;
      record("requeue", label(`free.push(${virtual}) → server ${id}`, `free.push(${virtual}) → server ${id}`), 12,
        label(`Vị trí ảo ${virtual} là chỗ đầu tiên từ i trở đi có modulo k bằng ${id}.`, `Virtual slot ${virtual} is the first position from i onward whose modulo k is ${id}.`));
      server = null;
      slot = null;
    }

    released = null;
    const noFree = free.size === 0;
    record("free-check", label(`free rỗng? ${noFree}`, `free empty? ${noFree}`), 13,
      noFree
        ? label("Tất cả server còn bận: request này bị bỏ.", "All servers are busy: drop this request.")
        : label("Chọn vị trí ảo nhỏ nhất trong free heap.", "Take the smallest virtual slot from the free heap."));
    if (noFree) {
      dropped = true;
      droppedCount++;
      record("drop", label(`Bỏ request #${i}`, `Drop request #${i}`), 14,
        label("Request bị bỏ không làm tăng bộ đếm nào.", "A dropped request changes no handled count."));
      continue;
    }
    slot = free.pop();
    record("pick-slot", label(`Lấy vị trí ảo ${slot}`, `Pop virtual slot ${slot}`), 15,
      label("Heap giữ thứ tự ưu tiên i%k, i+1, ... và quấn vòng.", "The heap preserves priority i%k, i+1, ... with wraparound."));
    server = slot % k;
    record("pick-server", label(`${slot} % ${k} = server ${server}`, `${slot} % ${k} = server ${server}`), 16,
      label("Modulo đưa vị trí ảo về ID server thật.", "Modulo maps the virtual slot back to a real server ID."));
    handled[server]++;
    record("count", label(`handled[${server}] = ${handled[server]}`, `handled[${server}] = ${handled[server]}`), 17,
      label("Chỉ request được nhận mới tăng số lần xử lý.", "Only an accepted request increments the handled count."));
    const until = time + duration;
    busy.push([until, server]);
    busyUntil[server] = until;
    record("busy", label(`Server ${server} bận tới ${until}`, `Server ${server} busy until ${until}`), 18,
      label("Khi request sau đến, giải phóng mọi server có thời điểm xong ≤ thời gian đến.", "At the next arrival, release every server whose finish time is ≤ that arrival."));
  }

  const best = handled.reduce((maximum, count) => Math.max(maximum, count), 0);
  i = null;
  time = null;
  duration = null;
  preferred = null;
  slot = null;
  server = null;
  released = null;
  dropped = false;
  record("best", label(`max(handled) = ${best}`, `max(handled) = ${best}`), 19,
    label("Tìm số request xử lý nhiều nhất.", "Find the maximum handled request count."), { best });
  const answer = handled.flatMap((count, id) => count === best ? [id] : []);
  const answerText = answer.length <= 30 ? answer.join(", ") : `${answer.slice(0, 30).join(", ")}, … (${answer.length})`;
  record("done", label(`Server bận nhất: [${answerText}]`, `Busiest servers: [${answerText}]`), 20,
    omitted
      ? label("Trace dài đã được rút gọn; bộ đếm và đáp án vẫn được tính đầy đủ.", "The long trace was shortened; counts and answer are still complete.")
      : label("Trả mọi server có số lần xử lý bằng giá trị lớn nhất.", "Return every server whose handled count equals the maximum."),
    { final: true, best, answer });
  return { original: [...arrival], arrival: [...arrival], load: [...load], k, answer, steps };
}

module.exports = {
  1606: {
    id: 1606,
    difficulty: "hard",
    slug: "find-servers-that-handled-most-number-of-requests",
    category: { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
    tags: [
      { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: label("Find Servers That Handled Most Number of Requests", "Find Servers That Handled Most Number of Requests"),
    titleVi: label("Server xử lý nhiều yêu cầu nhất", "Busiest servers"),
    statement: label(
      "Request i ưu tiên server i%k, rồi server rảnh kế tiếp theo vòng. Nếu tất cả bận thì bỏ request. Trả về mọi server xử lý nhiều request nhất.",
      "Request i prefers server i%k, then the next available server cyclically. Drop it if all are busy. Return every server that handled the most requests."
    ),
    defaultInput: [1, 2, 3, 4, 5],
    inputKind: "positive",
    inputLabel: label("arrival (thời điểm đến)", "arrival times"),
    extraParams: [
      { key: "k", label: label("k (số server)", "k (servers)"), default: 3 },
      { key: "load", type: "string", label: label("load (thời gian xử lý, cách dấu phẩy)", "load (comma-separated durations)"), default: "5,2,3,3,3" },
    ],
    approach: [
      label("busy heap lưu (thời điểm xong, server); giải phóng trước mỗi request mới.", "The busy heap stores (finish time, server); release finished jobs before each arrival."),
      label("free heap lưu vị trí ảo ≥ i: server thật = vị trí ảo % k. Min-heap tự chọn đúng thứ tự quấn vòng.", "The free heap stores virtual positions ≥ i; real server = slot % k. Its minimum gives cyclic priority."),
      label("Đếm request được nhận trên từng server rồi trả tất cả server đạt max.", "Count accepted requests per server, then return all servers tied for the maximum."),
    ],
    complexity: {
      time: "O((n + k) log k)", space: "O(k)",
      note: label("Mỗi request vào/ra heap một số lần hữu hạn; hai heap cùng tối đa k server.", "Each request causes a bounded number of heap operations; both heaps contain at most k servers."),
    },
    code: [
      "from heapq import heapify, heappop, heappush",
      "",
      "class Solution:",
      "    def busiestServers(self, k, arrival, load):",
      "        free = list(range(k))",
      "        heapify(free)",
      "        busy = []",
      "        handled = [0] * k",
      "        for i, (time, duration) in enumerate(zip(arrival, load)):",
      "            while busy and busy[0][0] <= time:",
      "                _, server = heappop(busy)",
      "                heappush(free, i + (server - i) % k)",
      "            if not free:",
      "                continue",
      "            slot = heappop(free)",
      "            server = slot % k",
      "            handled[server] += 1",
      "            heappush(busy, (time + duration, server))",
      "        best = max(handled)",
      "        return [server for server, count in enumerate(handled) if count == best]",
    ],
    builder: buildSteps1606,
  },
};
