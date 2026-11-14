"use strict";

// ─── 9025: YouTube Trending Videos (Top K) ─────────────────────────────────
//
// Interview design question (screenshot): records(video_id) adds 1 to that video's score and returns the top-k
// video ids, highest first. Approach 1 is the user's code, verbatim: rebuild a size-k min-heap of (score, id) on
// every call, drain it into res and return reversed(res). Tuple order makes ties go to the LARGER id (string
// order), so k = 2, scores {1: 3, 2: 3, 3: 4}, records("1") returns ["3", "1"]. Approaches 2 (SortedList) and 3
// (doubly linked list of score buckets) are written to give exactly the same order.
//
// Starting scores in the input are earlier records() calls ("warm-up"): the class has no other way to receive
// them. They run before the traced calls and are shown as one step per video, not line by line.
// One executed Python line per step. Pictures live in public/renderer-youtube-trending-9025.js.

const MAX_K_9025 = 5;
const MAX_CALLS_9025 = 8;
const MAX_VIDEOS_9025 = 8;
const MAX_SCORE_9025 = 9;
const ID_RE_9025 = /^[A-Za-z0-9]{1,3}$/;
const DEFAULT_INPUT_9025 = "2 | 1:3, 2:3, 3:4 | 1, 2, 2, 4, 3";
const SCREENSHOT_INPUT_9025 = "2 | 1:3, 2:3, 3:4 | 1";

const SOURCE_9025 = Object.freeze([
  "from collections import defaultdict",
  "import heapq",
  "",
  "class YT:",
  "    def __init__(self, k):",
  "        self.k = k",
  "        self.videos = defaultdict(int)",
  "",
  "    def records(self, video_id):",
  "        self.videos[video_id] += 1",
  "",
  "        min_heap = []",
  "",
  "        for id, score in self.videos.items():",
  "            heapq.heappush(min_heap,(score, id))",
  "",
  "            if len(min_heap) > self.k:",
  "                heapq.heappop(min_heap)",
  "",
  "        res = []",
  "        while min_heap:",
  "            score, id = heapq.heappop(min_heap)",
  "            res.append(id)",
  "",
  "        return reversed(res)",
]);

const SOURCE2_9025 = Object.freeze([
  "from collections import defaultdict",
  "from sortedcontainers import SortedList",
  "",
  "class YT:",
  "    def __init__(self, k):",
  "        self.k = k",
  "        self.videos = defaultdict(int)",
  "        self.ranked = SortedList()",
  "",
  "    def records(self, video_id):",
  "        score = self.videos[video_id]",
  "        if score:",
  "            self.ranked.remove((score, video_id))",
  "        self.videos[video_id] = score + 1",
  "        self.ranked.add((score + 1, video_id))",
  "        res = [id for _, id in self.ranked[-self.k:]]",
  "        return reversed(res)",
]);

const SOURCE3_9025 = Object.freeze([
  "class Bucket:",
  "    def __init__(self, score):",
  "        self.score = score",
  "        self.ids = set()",
  "        self.prev = self.next = None",
  "",
  "class YT:",
  "    def __init__(self, k):",
  "        self.k = k",
  "        self.where = {}",
  "        self.head = Bucket(0)",
  "        self.tail = Bucket(float('inf'))",
  "        self.head.next, self.tail.prev = self.tail, self.head",
  "",
  "    def records(self, video_id):",
  "        cur = self.where.get(video_id, self.head)",
  "        nxt = cur.next",
  "        if nxt.score != cur.score + 1:",
  "            nxt = Bucket(cur.score + 1)",
  "            nxt.prev, nxt.next = cur, cur.next",
  "            cur.next.prev = nxt",
  "            cur.next = nxt",
  "        nxt.ids.add(video_id)",
  "        self.where[video_id] = nxt",
  "        if cur is not self.head:",
  "            cur.ids.remove(video_id)",
  "            if not cur.ids:",
  "                cur.prev.next, cur.next.prev = cur.next, cur.prev",
  "        res = []",
  "        node = self.tail.prev",
  "        while node is not self.head and len(res) < self.k:",
  "            for id in sorted(node.ids, reverse=True)[:self.k - len(res)]:",
  "                res.append(id)",
  "            node = node.prev",
  "        return res",
]);

const SOURCES_9025 = [null, SOURCE_9025, SOURCE2_9025, SOURCE3_9025];

const bi9025 = (vi, en) => ({ vi, en });
const same9025 = (text) => bi9025(text, text);

// Input: "k | id:score, … | call, …", e.g. "2 | 1:3, 2:3 | 1". The middle part may be empty.
function parse9025(input) {
  const fail = (message) => {
    throw new Error(`9025: ${message}`);
  };
  const text = input === undefined || input === null ? DEFAULT_INPUT_9025 : input;
  if (typeof text !== "string") fail("enter k | id:score, … | calls, e.g. 2 | 1:3, 2:3 | 1.");
  const parts = text.split("|");
  if (parts.length !== 3) fail("use three parts: k | id:score, … | calls.");
  const kText = parts[0].trim();
  if (!/^\d+$/.test(kText)) fail(`k must be an integer 1–${MAX_K_9025}.`);
  const k = Number(kText);
  if (k < 1 || k > MAX_K_9025) fail(`k must be an integer 1–${MAX_K_9025}.`);
  const tokens = (value) => value.split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
  const checkId = (id) => {
    if (!ID_RE_9025.test(id)) fail("ids are 1–3 letters or digits.");
  };
  const scores = [];
  const seen = new Set();
  for (const item of tokens(parts[1])) {
    const match = item.match(/^([^:]+):(\d+)$/);
    if (!match) fail("write scores as id:score, e.g. 1:3.");
    checkId(match[1]);
    const score = Number(match[2]);
    if (score < 1 || score > MAX_SCORE_9025) fail(`start scores must be 1–${MAX_SCORE_9025}.`);
    if (seen.has(match[1])) fail(`video ${match[1]} is listed twice.`);
    seen.add(match[1]);
    scores.push([match[1], score]);
  }
  const calls = tokens(parts[2]);
  if (calls.length < 1 || calls.length > MAX_CALLS_9025) fail(`use 1–${MAX_CALLS_9025} calls.`);
  calls.forEach((id) => {
    checkId(id);
    seen.add(id);
  });
  if (seen.size > MAX_VIDEOS_9025) fail(`use at most ${MAX_VIDEOS_9025} videos.`);
  return { k, scores, calls };
}

const cmpStr9025 = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
// Python tuple order for (score, id).
const tupleCmp9025 = (a, b) => a[0] - b[0] || cmpStr9025(a[1], b[1]);
const tupleLess9025 = (a, b) => tupleCmp9025(a, b) < 0;

// Expected answers without the traced code: the k largest (score, id) tuples, largest first.
function expected9025(parsed) {
  const score = new Map(parsed.scores);
  return parsed.calls.map((id) => {
    score.set(id, (score.get(id) || 0) + 1);
    return [...score].map(([v, s]) => [s, v]).sort((a, b) => tupleCmp9025(b, a)).slice(0, parsed.k).map(([, v]) => v);
  });
}

// Exact CPython heapq (push = append + _siftdown; pop = pop last, put at root, _siftup + _siftdown).
function siftDown9025(heap, startpos, pos) {
  const item = heap[pos];
  while (pos > startpos) {
    const parentpos = (pos - 1) >> 1;
    const parent = heap[parentpos];
    if (tupleLess9025(item, parent)) {
      heap[pos] = parent;
      pos = parentpos;
      continue;
    }
    break;
  }
  heap[pos] = item;
}

function siftUp9025(heap, pos) {
  const endpos = heap.length;
  const startpos = pos;
  const item = heap[pos];
  let childpos = 2 * pos + 1;
  while (childpos < endpos) {
    const rightpos = childpos + 1;
    if (rightpos < endpos && !tupleLess9025(heap[childpos], heap[rightpos])) childpos = rightpos;
    heap[pos] = heap[childpos];
    pos = childpos;
    childpos = 2 * pos + 1;
  }
  heap[pos] = item;
  siftDown9025(heap, startpos, pos);
}

function heappush9025(heap, item) {
  heap.push(item);
  siftDown9025(heap, 0, heap.length - 1);
}

function heappop9025(heap) {
  const last = heap.pop();
  if (heap.length) {
    const top = heap[0];
    heap[0] = last;
    siftUp9025(heap, 0);
    return top;
  }
  return last;
}

const pyStr9025 = (id) => `'${id}'`;
const pyList9025 = (ids) => `[${ids.map(pyStr9025).join(", ")}]`;
const pyDict9025 = (map) => `{${[...map].map(([id, s]) => `${pyStr9025(id)}: ${s}`).join(", ")}}`;
const pyTuple9025 = ([s, id]) => `(${s}, ${pyStr9025(id)})`;
const pyTuples9025 = (list) => `[${list.map(pyTuple9025).join(", ")}]`;
const short9025 = (ids) => (ids.length ? ids.join(",") : "—");
const scoreText9025 = (s) => (s === Infinity ? "inf" : String(s));
const pyBucket9025 = (bucket) => `Bucket(${scoreText9025(bucket.score)})`;
const clone9025 = (value) => JSON.parse(JSON.stringify(value));

function buildSteps9025(input, approach) {
  const parsed = parse9025(input);
  const { k, calls } = parsed;
  const answer = expected9025(parsed);
  const allIds = [...new Set([...parsed.scores.map(([id]) => id), ...calls])];
  const finalScores = new Map(parsed.scores);
  calls.forEach((id) => finalScores.set(id, (finalScores.get(id) || 0) + 1));
  const maxScore = Math.max(1, ...finalScores.values());
  const steps = [];
  const results = [];
  const S = {
    ready: false, videos: null, ci: null, videoId: null,
    // approach 1
    heap: null, id: null, score: null, res: null,
    // approach 2
    ranked: null,
    // approach 3
    where: null, head: null, tail: null, cur: null, nxt: null, node: null,
  };
  const dash = (value, format = String) => (value === null || value === undefined ? "—" : format(value));

  // Approach 3 objects: buckets are { uid, score, ids: Set, prev, next }.
  let uid = 0;
  const newBucket = (score) => ({ uid: uid++, score, ids: new Set(), prev: null, next: null });
  const chainOf = () => {
    const out = [];
    for (let b = S.head; b; b = b.next) {
      out.push(b);
      if (b === S.tail) break;
    }
    return out;
  };

  const varsOf = () => {
    if (approach === 1) {
      return [
        { name: "video_id", value: dash(S.videoId, pyStr9025) },
        { name: "self.k", value: S.ready ? k : "—" },
        { name: "self.videos", value: dash(S.videos, pyDict9025) },
        { name: "min_heap", value: dash(S.heap, pyTuples9025) },
        { name: "id", value: dash(S.id, pyStr9025) },
        { name: "score", value: dash(S.score) },
        { name: "res", value: dash(S.res, pyList9025) },
      ];
    }
    if (approach === 2) {
      return [
        { name: "video_id", value: dash(S.videoId, pyStr9025) },
        { name: "self.k", value: S.ready ? k : "—" },
        { name: "self.videos", value: dash(S.videos, pyDict9025) },
        { name: "self.ranked", value: S.ranked ? `SortedList(${pyTuples9025(S.ranked)})` : "—" },
        { name: "score", value: dash(S.score) },
        { name: "res", value: dash(S.res, pyList9025) },
      ];
    }
    return [
      { name: "video_id", value: dash(S.videoId, pyStr9025) },
      { name: "self.k", value: S.ready ? k : "—" },
      { name: "self.where", value: S.where ? `{${[...S.where].map(([v, b]) => `${pyStr9025(v)}: ${pyBucket9025(b)}`).join(", ")}}` : "—" },
      { name: "cur", value: dash(S.cur, pyBucket9025) },
      { name: "nxt", value: dash(S.nxt, pyBucket9025) },
      { name: "node", value: dash(S.node, pyBucket9025) },
      { name: "id", value: dash(S.id, pyStr9025) },
      { name: "res", value: dash(S.res, pyList9025) },
    ];
  };

  // extra: event-specific picture fields (scan, heapAt, popped, removedAt, movedFrom, movedTo, picked, ghost, linking).
  const emit = ({ line, event, title, note, condition = null, bumped = null, extra = {}, final = false }) => {
    const view = {
      version: 1,
      problemId: 9025,
      approach,
      line,
      event,
      condition,
      k,
      calls,
      ci: S.ci,
      videoId: S.videoId,
      maxScore,
      maxVideos: allIds.length,
      videos: S.videos ? [...S.videos] : [],
      bumped,
      res: S.res ? S.res.slice() : null,
      results: results.map((r) => r.slice()),
      final,
      answer: final ? answer : null,
      ...extra,
    };
    if (approach === 1) view.heap = S.heap ? S.heap.map((t) => t.slice()) : null;
    if (approach === 2) view.ranked = S.ranked ? S.ranked.map((t) => t.slice()) : null;
    if (approach === 3 && S.head) {
      const chain = chainOf();
      view.chain = chain.map((b) => ({ score: b === S.tail ? null : b.score, ids: [...b.ids].sort(cmpStr9025) }));
      const at = (b) => (b ? chain.indexOf(b) : -1);
      view.curAt = at(S.cur);
      view.nxtAt = at(S.nxt);
      view.nodeAt = at(S.node);
    }
    steps.push({
      title,
      note,
      arr: [],
      highlight: [],
      mark: [],
      codeBlock: approach,
      codeLines: [line],
      vars: varsOf(),
      final,
      yt9025View: clone9025(view),
    });
  };

  const code = SOURCES_9025[approach];
  const line = (text) => code.indexOf(text) + 1;

  // ---- Module and constructor ----
  if (approach === 1) {
    emit({ line: 1, event: "import", title: same9025(code[0]), note: same9025("defaultdict.") });
    emit({ line: 2, event: "import", title: same9025(code[1]), note: bi9025("Nhập heapq.", "Import heapq.") });
  } else if (approach === 2) {
    emit({ line: 1, event: "import", title: same9025(code[0]), note: same9025("defaultdict.") });
    emit({ line: 2, event: "import", title: same9025(code[1]), note: same9025("SortedList.") });
  } else {
    emit({ line: 1, event: "class", title: same9025("class Bucket"), note: bi9025("Lớp xô điểm.", "Score bucket class.") });
  }
  const ytLine = line("class YT:");
  const initLine = line("    def __init__(self, k):");
  emit({ line: ytLine, event: "class", title: same9025("class YT"), note: bi9025("Định nghĩa lớp.", "Class defined.") });
  emit({ line: initLine, event: "init", title: same9025(`YT(${k})`), note: bi9025(`Tạo, k = ${k}.`, `Create, k = ${k}.`) });
  S.ready = true;
  emit({ line: initLine + 1, event: "init-k", title: same9025(`self.k = ${k}`), note: bi9025(`Giữ ${k} video đầu.`, `Keep the top ${k}.`) });

  const bucketInit = (score, callerLine) => {
    const b = newBucket(score);
    emit({ line: 2, event: "b-init", title: same9025(`Bucket(${scoreText9025(score)})`), note: bi9025(`Xô ${scoreText9025(score)}.`, `Bucket ${scoreText9025(score)}.`), extra: { making: scoreText9025(score), callerLine } });
    emit({ line: 3, event: "b-score", title: same9025(`self.score = ${scoreText9025(score)}`), note: same9025(`score = ${scoreText9025(score)}.`), extra: { making: scoreText9025(score), callerLine } });
    emit({ line: 4, event: "b-ids", title: same9025("self.ids = set()"), note: bi9025("Chưa có video.", "No videos yet."), extra: { making: scoreText9025(score), callerLine } });
    emit({ line: 5, event: "b-links", title: same9025("self.prev = self.next = None"), note: bi9025("Chưa nối.", "Not linked yet."), extra: { making: scoreText9025(score), callerLine } });
    return b;
  };

  if (approach === 1) {
    S.videos = new Map();
    emit({ line: 7, event: "init-videos", title: same9025("self.videos = defaultdict(int)"), note: bi9025("Map điểm rỗng.", "Empty score map.") });
  } else if (approach === 2) {
    S.videos = new Map();
    emit({ line: 7, event: "init-videos", title: same9025("self.videos = defaultdict(int)"), note: bi9025("Map điểm rỗng.", "Empty score map.") });
    S.ranked = [];
    emit({ line: 8, event: "init-ranked", title: same9025("self.ranked = SortedList()"), note: bi9025("Danh sách rỗng.", "Empty sorted list.") });
  } else {
    S.where = new Map();
    emit({ line: 10, event: "init-where", title: same9025("self.where = {}"), note: bi9025("Map video → xô.", "Map video → bucket.") });
    emit({ line: 11, event: "init-head", title: same9025("self.head = Bucket(0)"), note: bi9025("Đầu: xô 0.", "Head: bucket 0.") });
    const head = bucketInit(0, 11);
    S.head = head;
    emit({ line: 12, event: "init-tail", title: same9025("self.tail = Bucket(float('inf'))"), note: bi9025("Đuôi: xô ∞.", "Tail: bucket ∞.") });
    const tail = bucketInit(Infinity, 12);
    S.tail = tail;
    S.head.next = S.tail;
    S.tail.prev = S.head;
    emit({ line: 13, event: "init-link", title: same9025("self.head.next, self.tail.prev = self.tail, self.head"), note: bi9025("Nối đầu ⇄ đuôi.", "Link head ⇄ tail.") });
  }

  // ---- One records() call, untraced: used for warm-up (starting scores). ----
  const quiet = (id) => {
    if (approach === 1) {
      S.videos.set(id, (S.videos.get(id) || 0) + 1);
    } else if (approach === 2) {
      const score = S.videos.get(id) || 0;
      if (score) S.ranked.splice(S.ranked.findIndex((t) => t[1] === id), 1);
      S.videos.set(id, score + 1);
      const entry = [score + 1, id];
      let at = 0;
      while (at < S.ranked.length && tupleCmp9025(S.ranked[at], entry) <= 0) at += 1;
      S.ranked.splice(at, 0, entry);
    } else {
      const cur = S.where.get(id) || S.head;
      let nxt = cur.next;
      if (nxt.score !== cur.score + 1) {
        nxt = newBucket(cur.score + 1);
        nxt.prev = cur;
        nxt.next = cur.next;
        cur.next.prev = nxt;
        cur.next = nxt;
      }
      nxt.ids.add(id);
      S.where.set(id, nxt);
      if (cur !== S.head) {
        cur.ids.delete(id);
        if (!cur.ids.size) {
          cur.prev.next = cur.next;
          cur.next.prev = cur.prev;
        }
      }
    }
  };
  const recordsLine = line("    def records(self, video_id):");
  parsed.scores.forEach(([id, s]) => {
    for (let t = 0; t < s; t++) quiet(id);
    S.videoId = null;
    emit({
      line: recordsLine,
      event: "warmup",
      title: bi9025(`Khởi động: records('${id}') × ${s}`, `Warm-up: records('${id}') × ${s}`),
      note: bi9025(`Khởi động '${id}' ×${s}.`, `Warm-up '${id}' ×${s}.`),
      extra: { warm: id },
    });
  });

  // ---- Traced calls ----
  calls.forEach((videoId, ci) => {
    const last = ci === calls.length - 1;
    S.ci = ci;
    S.videoId = videoId;
    S.heap = null;
    S.id = null;
    S.score = null;
    S.res = null;
    S.cur = null;
    S.nxt = null;
    S.node = null;
    const callTitle = same9025(`records(${pyStr9025(videoId)})`);
    emit({ line: recordsLine, event: "call", title: callTitle, note: bi9025(`Gọi với '${videoId}'.`, `Call with '${videoId}'.`) });

    if (approach === 1) {
      const before = S.videos.get(videoId) || 0;
      S.videos.set(videoId, before + 1);
      const b = videoId;
      emit({ line: 10, event: "bump", bumped: b, title: same9025(`self.videos[${pyStr9025(videoId)}] += 1`), note: same9025(`'${videoId}': ${before} → ${before + 1}`) });
      S.heap = [];
      emit({ line: 12, event: "heap-new", bumped: b, title: same9025("min_heap = []"), note: bi9025("Heap rỗng.", "Empty heap.") });
      for (const [vid, s] of [...S.videos]) {
        S.id = vid;
        S.score = s;
        emit({ line: 14, event: "for", bumped: b, title: same9025(`id, score = ${pyStr9025(vid)}, ${s}`), note: bi9025(`Xét '${vid}' (${s}).`, `Scan '${vid}' (${s}).`), extra: { scan: vid } });
        heappush9025(S.heap, [s, vid]);
        const at = S.heap.findIndex((t) => t[1] === vid);
        emit({ line: 15, event: "push", bumped: b, title: same9025(`heappush(min_heap, ${pyTuple9025([s, vid])})`), note: bi9025(`Đẩy (${s}, '${vid}').`, `Push (${s}, '${vid}').`), extra: { scan: vid, heapAt: at } });
        const over = S.heap.length > k;
        emit({
          line: 17,
          event: "over",
          condition: over,
          bumped: b,
          title: same9025(`if ${S.heap.length} > ${k}`),
          note: over ? bi9025(`Dư 1 (> ${k}).`, `One too many (> ${k}).`) : bi9025(`Còn ≤ ${k}.`, `Still ≤ ${k}.`),
          extra: { scan: vid },
        });
        if (over) {
          const out = heappop9025(S.heap);
          emit({ line: 18, event: "drop", bumped: b, title: same9025("heappop(min_heap)"), note: bi9025(`Bỏ nhỏ nhất '${out[1]}'.`, `Drop smallest '${out[1]}'.`), extra: { scan: vid, popped: out } });
        }
      }
      emit({ line: 14, event: "for-done", bumped: b, title: bi9025("Hết videos.items()", "videos.items() done"), note: bi9025(`Heap giữ top ${k}.`, `Heap holds the top ${k}.`) });
      S.res = [];
      emit({ line: 20, event: "res-new", bumped: b, title: same9025("res = []"), note: bi9025("res rỗng.", "Empty res.") });
      for (;;) {
        const more = S.heap.length > 0;
        emit({ line: 21, event: "while", condition: more, bumped: b, title: same9025(`while min_heap → ${more ? "True" : "False"}`), note: more ? bi9025(`Còn ${S.heap.length} trong heap.`, `${S.heap.length} left in heap.`) : bi9025("Heap rỗng.", "Heap is empty.") });
        if (!more) break;
        const out = heappop9025(S.heap);
        S.score = out[0];
        S.id = out[1];
        emit({ line: 22, event: "take", bumped: b, title: same9025(`score, id = ${out[0]}, ${pyStr9025(out[1])}`), note: bi9025(`Lấy nhỏ nhất '${out[1]}'.`, `Pop smallest '${out[1]}'.`), extra: { popped: out } });
        S.res.push(out[1]);
        emit({ line: 23, event: "append", bumped: b, title: same9025(`res.append(${pyStr9025(out[1])})`), note: bi9025(`res thêm '${out[1]}'.`, `res gets '${out[1]}'.`) });
      }
      const outIds = S.res.slice().reverse();
      results.push(outIds);
      emit({ line: 25, event: "return", bumped: b, final: last, title: same9025(`return reversed(res) → ${pyList9025(outIds)}`), note: same9025(`Top: ${short9025(outIds)}`), extra: { out: outIds } });
    } else if (approach === 2) {
      const had = S.videos.has(videoId);
      S.score = S.videos.get(videoId) || 0;
      if (!had) S.videos.set(videoId, 0);
      emit({ line: 11, event: "score", title: same9025(`score = self.videos[${pyStr9025(videoId)}]`), note: same9025(`score = ${S.score}.`) });
      const has = S.score > 0;
      emit({
        line: 12,
        event: "if-score",
        condition: has,
        title: same9025(`if ${S.score}`),
        note: has ? bi9025(`'${videoId}' đã trong list.`, `'${videoId}' is in the list.`) : bi9025(`'${videoId}' mới.`, `'${videoId}' is new.`),
      });
      let from = null;
      if (has) {
        from = S.ranked.findIndex((t) => t[1] === videoId);
        S.ranked.splice(from, 1);
        emit({ line: 13, event: "remove", title: same9025(`self.ranked.remove(${pyTuple9025([S.score, videoId])})`), note: bi9025(`Gỡ khỏi chỗ ${from}.`, `Remove from slot ${from}.`), extra: { removed: [S.score, videoId], removedAt: from } });
      }
      S.videos.set(videoId, S.score + 1);
      emit({ line: 14, event: "bump", bumped: videoId, title: same9025(`self.videos[${pyStr9025(videoId)}] = ${S.score + 1}`), note: same9025(`'${videoId}': ${S.score} → ${S.score + 1}`), extra: from === null ? {} : { removed: [S.score, videoId], removedAt: from } });
      const entry = [S.score + 1, videoId];
      let at = 0;
      while (at < S.ranked.length && tupleCmp9025(S.ranked[at], entry) <= 0) at += 1;
      S.ranked.splice(at, 0, entry);
      emit({ line: 15, event: "add", bumped: videoId, title: same9025(`self.ranked.add(${pyTuple9025(entry)})`), note: from === null ? bi9025(`Thêm vào chỗ ${at}.`, `Add at slot ${at}.`) : bi9025(`Chuyển ${from} → ${at}.`, `Move ${from} → ${at}.`), extra: { movedTo: at, movedFrom: from } });
      S.res = S.ranked.slice(-k).map(([, v]) => v);
      emit({ line: 16, event: "res", bumped: videoId, title: same9025(`res = ${pyList9025(S.res)}`), note: bi9025(`${S.res.length} cuối, tăng dần.`, `Last ${S.res.length}, ascending.`) });
      const outIds = S.res.slice().reverse();
      results.push(outIds);
      emit({ line: 17, event: "return", bumped: videoId, final: last, title: same9025(`return reversed(res) → ${pyList9025(outIds)}`), note: same9025(`Top: ${short9025(outIds)}`), extra: { out: outIds } });
    } else {
      S.cur = S.where.get(videoId) || S.head;
      emit({ line: 16, event: "cur", title: same9025(`cur = ${pyBucket9025(S.cur)}`), note: S.cur === S.head ? bi9025(`'${videoId}' mới: đầu.`, `'${videoId}' new: head.`) : bi9025(`'${videoId}' ở xô ${S.cur.score}.`, `'${videoId}' in bucket ${S.cur.score}.`) });
      S.nxt = S.cur.next;
      emit({ line: 17, event: "nxt", title: same9025(`nxt = ${pyBucket9025(S.nxt)}`), note: bi9025(`Xô kế: ${scoreText9025(S.nxt.score)}.`, `Next bucket: ${scoreText9025(S.nxt.score)}.`) });
      const need = S.nxt.score !== S.cur.score + 1;
      emit({
        line: 18,
        event: "need",
        condition: need,
        title: same9025(`if ${scoreText9025(S.nxt.score)} != ${S.cur.score + 1}`),
        note: need ? bi9025(`Cần xô ${S.cur.score + 1}.`, `Need bucket ${S.cur.score + 1}.`) : bi9025(`Có sẵn xô ${S.cur.score + 1}.`, `Bucket ${S.cur.score + 1} exists.`),
      });
      if (need) {
        const cur = S.cur;
        emit({ line: 19, event: "new-bucket", title: same9025(`nxt = Bucket(${cur.score + 1})`), note: bi9025(`Tạo xô ${cur.score + 1}.`, `New bucket ${cur.score + 1}.`) });
        const b = bucketInit(cur.score + 1, 19);
        S.nxt = b;
        b.prev = cur;
        b.next = cur.next;
        emit({ line: 20, event: "link-new", title: same9025("nxt.prev, nxt.next = cur, cur.next"), note: bi9025("Xô mới trỏ 2 bên.", "New bucket points out."), extra: { floating: cur.score + 1, half: 1 } });
        cur.next.prev = b;
        emit({ line: 21, event: "link-prev", title: same9025("cur.next.prev = nxt"), note: bi9025("Xô sau trỏ lùi.", "Right side points back."), extra: { floating: cur.score + 1, half: 2 } });
        cur.next = b;
        emit({ line: 22, event: "link-next", title: same9025("cur.next = nxt"), note: bi9025("Đã chèn xô.", "Bucket linked in."), extra: { linked: cur.score + 1 } });
      }
      S.nxt.ids.add(videoId);
      emit({ line: 23, event: "add-id", bumped: videoId, title: same9025(`nxt.ids.add(${pyStr9025(videoId)})`), note: bi9025(`'${videoId}' vào xô ${S.nxt.score}.`, `'${videoId}' into bucket ${S.nxt.score}.`) });
      S.where.set(videoId, S.nxt);
      emit({ line: 24, event: "where", bumped: videoId, title: same9025(`self.where[${pyStr9025(videoId)}] = ${pyBucket9025(S.nxt)}`), note: bi9025(`Ghi xô của '${videoId}'.`, `Remember '${videoId}'.`) });
      const old = S.cur !== S.head;
      emit({ line: 25, event: "old", condition: old, bumped: videoId, title: same9025(`if cur is not self.head → ${old ? "True" : "False"}`), note: old ? bi9025("Gỡ khỏi xô cũ.", "Leave the old bucket.") : bi9025("Không có xô cũ.", "No old bucket.") });
      if (old) {
        S.cur.ids.delete(videoId);
        emit({ line: 26, event: "remove-id", bumped: videoId, title: same9025(`cur.ids.remove(${pyStr9025(videoId)})`), note: bi9025(`Còn ${S.cur.ids.size} ở xô ${S.cur.score}.`, `${S.cur.ids.size} left in bucket ${S.cur.score}.`) });
        const empty = S.cur.ids.size === 0;
        emit({ line: 27, event: "empty", condition: empty, bumped: videoId, title: same9025(`if not cur.ids → ${empty ? "True" : "False"}`), note: empty ? bi9025("Xô cũ rỗng.", "Old bucket is empty.") : bi9025("Xô cũ còn video.", "Old bucket stays.") });
        if (empty) {
          const gone = { score: S.cur.score, at: chainOf().indexOf(S.cur) };
          S.cur.prev.next = S.cur.next;
          S.cur.next.prev = S.cur.prev;
          emit({ line: 28, event: "unlink", bumped: videoId, title: same9025("cur.prev.next, cur.next.prev = cur.next, cur.prev"), note: bi9025(`Gỡ xô ${gone.score}.`, `Unlink bucket ${gone.score}.`), extra: { ghost: gone } });
        }
      }
      S.res = [];
      emit({ line: 29, event: "res-new", bumped: videoId, title: same9025("res = []"), note: bi9025("res rỗng.", "Empty res.") });
      S.node = S.tail.prev;
      emit({ line: 30, event: "node", bumped: videoId, title: same9025(`node = ${pyBucket9025(S.node)}`), note: bi9025("Bắt đầu từ điểm cao.", "Start at the top score.") });
      for (;;) {
        const go = S.node !== S.head && S.res.length < k;
        const why = S.node === S.head ? bi9025("Tới đầu: dừng.", "Reached head: stop.") : S.res.length >= k ? bi9025(`Đủ ${k}: dừng.`, `Have ${k}: stop.`) : bi9025(`Xét xô ${S.node.score}.`, `Visit bucket ${S.node.score}.`);
        emit({ line: 31, event: "walk", condition: go, bumped: videoId, title: same9025(`while ... → ${go ? "True" : "False"}`), note: why });
        if (!go) break;
        const take = [...S.node.ids].sort((a, b) => cmpStr9025(b, a)).slice(0, k - S.res.length);
        for (const vid of take) {
          S.id = vid;
          emit({ line: 32, event: "for-id", bumped: videoId, title: same9025(`id = ${pyStr9025(vid)}`), note: bi9025(`Lấy '${vid}'.`, `Take '${vid}'.`) });
          S.res.push(vid);
          emit({ line: 33, event: "append", bumped: videoId, title: same9025(`res.append(${pyStr9025(vid)})`), note: bi9025(`res thêm '${vid}'.`, `res gets '${vid}'.`) });
        }
        emit({ line: 32, event: "for-done", bumped: videoId, title: bi9025("Hết xô này", "Bucket done"), note: bi9025("Hết xô này.", "Bucket done.") });
        S.node = S.node.prev;
        emit({ line: 34, event: "node-prev", bumped: videoId, title: same9025(`node = ${pyBucket9025(S.node)}`), note: S.node === S.head ? bi9025("Lùi tới đầu.", "Back to head.") : bi9025(`Lùi tới xô ${S.node.score}.`, `Back to bucket ${S.node.score}.`) });
      }
      const outIds = S.res.slice();
      results.push(outIds);
      emit({ line: 35, event: "return", bumped: videoId, final: last, title: same9025(`return ${pyList9025(outIds)}`), note: same9025(`Top: ${short9025(outIds)}`), extra: { out: outIds } });
    }
  });
  return { input, answer, steps };
}

// Live editor: warm-up calls first (one records() per starting point), then the traced calls. resultSkip hides the
// warm-up results, so the live result lists one answer per real call, like the page's answer.
function prepareLiveDesign9025(input) {
  const { scores, calls, k } = parse9025(input);
  const warm = scores.flatMap(([id, s]) => Array.from({ length: s }, () => id));
  return {
    className: "YT",
    constructorArgs: [k],
    operations: [...warm, ...calls].map((id) => ({ name: "records", args: [id] })),
    resultSkip: warm.length,
  };
}

const approachLabels9025 = [
  null,
  bi9025("Cách 1: Heap nhỏ cỡ k (code của bạn)", "Approach 1: Size-k min-heap (your code)"),
  bi9025("Cách 2: SortedList (-/+ một mục)", "Approach 2: SortedList (move one entry)"),
  bi9025("Cách 3: DSLK xô điểm (như 432)", "Approach 3: Linked score buckets (like 432)"),
];

module.exports = {
  9025: {
    id: 9025,
    difficulty: "medium",
    slug: null,
    category: { key: "interview", vi: "Phỏng vấn", en: "Interview" },
    tags: [
      { key: "design", vi: "Thiết kế", en: "Design" },
      { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
      { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
      { key: "sorted-set", vi: "Sorted Set", en: "Sorted Set" },
      { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
      { key: "top-k", vi: "Top K", en: "Top K" },
    ],
    title: { vi: "Videos — Top K", en: "Videos — Top K" },
    titleVi: bi9025("Top K video sau mỗi lượt tương tác", "Top K videos after each interaction"),
    statement: bi9025(
      "Thiết kế lớp YT giữ Top K video. records(video_id) cộng 1 điểm cho video đó rồi trả về k id điểm cao nhất, cao trước. Hòa điểm: so tuple (score, id) nên id lớn hơn (so chuỗi) đứng trước. Ví dụ: k = 2, điểm {1: 3, 2: 3, 3: 4}, records(\"1\") → [\"3\", \"1\"] (tập {1, 3}). Điểm đầu trong ô nhập là các lượt records() đã gọi trước (khởi động). Visualization: k 1–5, ≤ 8 video, điểm đầu 1–9, ≤ 8 lượt gọi, id 1–3 chữ/số.",
      "Design a class YT that keeps the Top K videos. records(video_id) adds 1 to that video's score and returns the k highest-scoring ids, highest first. Ties: (score, id) tuples are compared, so the larger id (string order) comes first. Example: k = 2, scores {1: 3, 2: 3, 3: 4}, records(\"1\") → [\"3\", \"1\"] (the set {1, 3}). Starting scores in the input are earlier records() calls (warm-up). Visualization: k 1–5, ≤ 8 videos, start scores 1–9, ≤ 8 calls, ids of 1–3 letters/digits.",
    ),
    defaultInput: DEFAULT_INPUT_9025,
    inputKind: "string",
    inputLabel: bi9025("k | id:điểm đầu, … | lượt gọi, … (k ≤ 5, ≤ 8 video)", "k | id:start score, … | calls, … (k ≤ 5, ≤ 8 videos)"),
    extraParams: [{
      key: "approach",
      label: bi9025("Cách giải", "Approach"),
      type: "select",
      default: 1,
      options: [1, 2, 3].map((value) => ({ value, label: approachLabels9025[value] })),
    }],
    debugMode: "line-by-line",
    approach: [
      bi9025("Cộng 1 điểm cho video_id, rồi lấy k video có (score, id) lớn nhất, lớn trước.", "Add 1 to video_id, then return the k videos with the largest (score, id), largest first."),
      bi9025("Cách 1: mỗi lượt dựng lại min-heap cỡ k từ mọi video; pop hết vào res rồi đảo ngược.", "Approach 1: rebuild a size-k min-heap from every video on each call; pop it into res and reverse."),
      bi9025("Cách 2: SortedList giữ (score, id); chỉ gỡ và thêm lại mục của video vừa đổi; k mục cuối là top.", "Approach 2: a SortedList of (score, id); remove and re-add only the changed entry; the last k entries are the top."),
      bi9025("Cách 3: DSLK các xô điểm (như 432); video nhảy sang xô kế; đi từ đuôi về để lấy top k.", "Approach 3: a linked list of score buckets (like 432); the video hops to the next bucket; walk back from the tail for the top k."),
    ],
    complexity: {
      time: "O(n log k + k log k) / call",
      space: "O(n + k)",
      note: bi9025("n video: duyệt cả map và giữ heap ≤ k + 1 mỗi lượt.", "n videos: scan the whole map and keep a heap of ≤ k + 1 every call."),
    },
    complexity2: {
      time: "O(log n + k) / call",
      space: "O(n)",
      note: bi9025("SortedList gỡ/thêm O(log n); cắt k mục cuối O(k).", "SortedList remove/add in O(log n); slicing the last k is O(k)."),
    },
    complexity3: {
      time: "O(1) + O(n log n) / call",
      space: "O(n)",
      note: bi9025(
        "Nhảy xô O(1). Đọc top k: sorted() sắp cả xô được duyệt, nên tới O(n log n) khi nhiều video hòa điểm.",
        "Hopping buckets is O(1). Reading the top k: sorted() sorts each visited bucket in full, so up to O(n log n) when many videos tie.",
      ),
    },
    code: [...SOURCE_9025],
    codeLabel: approachLabels9025[1],
    code2: [...SOURCE2_9025],
    code2Label: approachLabels9025[2],
    code3: [...SOURCE3_9025],
    code3Label: approachLabels9025[3],
    builder: (input) => buildSteps9025(input, 1),
    builder2: (input) => buildSteps9025(input, 2),
    builder3: (input) => buildSteps9025(input, 3),
    prepareLiveDesign: (input) => prepareLiveDesign9025(input),
  },
};

Object.defineProperty(module.exports[9025], "__internals9025", {
  value: {
    parse9025, expected9025, SOURCE_9025, SOURCE2_9025, SOURCE3_9025, DEFAULT_INPUT_9025, SCREENSHOT_INPUT_9025,
    MAX_K_9025, MAX_CALLS_9025, MAX_VIDEOS_9025,
  },
  enumerable: false,
});
