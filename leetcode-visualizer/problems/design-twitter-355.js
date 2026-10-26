"use strict";

const { bi, parseInteger } = require("./hard-viz-shared");
const base = require("./heap")[355];
const SOURCE = Object.freeze(base.code.map((line, i) => i === 13 ? "        for uid in sorted(followees):" : line));
const copy = value => JSON.parse(JSON.stringify(value));
const ARITY = { postTweet: 2, getNewsFeed: 1, follow: 2, unfollow: 2 };

function parseTwitter355Operations(input = base.defaultInput) {
  let raw = input;
  if (typeof input === "string") {
    const text = input.trim();
    try { raw = text.startsWith("[") ? JSON.parse(text) : text.split(/[;\n]+|,\s*(?=[A-Za-z_]\w*\s*\()/).map(line => line.trim()).filter(Boolean); }
    catch (_) { throw new TypeError("#355: JSON không hợp lệ / invalid JSON."); }
  }
  if (!Array.isArray(raw) || !raw.length || raw.length > 100) throw new RangeError("#355: cần 1–100 lệnh / enter 1–100 operations.");
  return Array.from(raw).map((item, index) => {
    let name, args;
    if (typeof item === "string") {
      const match = item.match(/^([A-Za-z_]\w*)\s*\(([^()]*)\)$/);
      if (match) { name = match[1]; args = match[2].trim() ? match[2].split(",").map(value => value.trim()) : []; }
    } else if (Array.isArray(item)) [name, ...args] = item;
    else if (item && typeof item === "object") { name = item.name; args = item.args; }
    if (!Object.hasOwn(ARITY, name) || !Array.isArray(args) || args.length !== ARITY[name]) {
      throw new TypeError(`#355: lệnh ${index + 1} không hợp lệ / invalid operation ${index + 1}; use postTweet, getNewsFeed, follow or unfollow.`);
    }
    args = Array.from(args).map((value, i) => parseInteger(value, { problemId: 355, name: `${name}[${i}]`, min: 0 })).map(value => value === 0 ? 0 : value);
    return { name, args, label: `${name}(${args.join(", ")})` };
  });
}

function buildSteps355(input) {
  const operations = parseTwitter355Operations(input), state = {}, steps = [], feeds = [], designResults = [];
  let activeIndex = -1, method = "__init__", locals = {}, heap = [], resultEntries = [], lastPopped = null;
  const titles = {
    init: bi("Khởi tạo Twitter", "Initialize Twitter"), post: bi("Đăng tweet", "Post a tweet"), clock: bi("Giảm timestamp", "Decrement timestamp"),
    follow: bi("Thêm nguồn tweet", "Add a tweet source"), unfollow: bi("Bỏ theo dõi", "Unfollow"),
    "heap-init": bi("Khởi tạo heap", "Initialize heap"), sources: bi("Chọn các nguồn", "Select sources"),
    source: bi("Xét một user", "Select a user"), "source-end": bi("Đã xét hết nguồn", "All sources checked"),
    "has-tweets": bi("User có tweet?", "Does this user have tweets?"), cursor: bi("Chọn tweet mới nhất", "Select the newest tweet"),
    read: bi("Đọc tweet", "Read a tweet"), push: bi("Tweet → heap", "Tweet → heap"), "result-init": bi("Khởi tạo feed", "Initialize the feed"),
    guard: bi("Còn tweet và chưa đủ 10?", "Tweets remain and fewer than 10?"), pop: bi("Lấy tweet mới nhất", "Pop the newest tweet"),
    append: bi("Tweet → feed", "Tweet → feed"), older: bi("Còn tweet cũ hơn?", "Is there an older tweet?"),
    back: bi("Lùi trên cùng dòng thời gian", "Step back on the same timeline"), "read-older": bi("Đọc tweet cũ kế tiếp", "Read the next older tweet"),
    return: bi("Trả về feed", "Return the feed"),
  };
  const tweetList = uid => state.tweets[uid] || (state.tweets[uid] = []);
  const followSet = uid => state.following[uid] || (state.following[uid] = new Set());
  const globals = () => ({ ...(state.count === undefined ? {} : { count: state.count }),
    ...(state.tweets ? { tweets: Object.fromEntries(Object.entries(state.tweets).map(([uid, tweets]) => [uid, tweets.map(tweet => [tweet.ts, tweet.tweetId])])) } : {}),
    ...(state.following ? { following: Object.fromEntries(Object.entries(state.following).map(([uid, set]) => [uid, [...set].sort((a, b) => a - b)])) } : {}) });
  function emit(line, phase, detail = {}) {
    if (locals.heap) locals.heap = heap.map(entry => [entry.ts, entry.tweetId, entry.userId, entry.idx]);
    const snapshot = globals(), op = operations[activeIndex], actor = op ? op.args[0] : null, lastFeed = feeds.at(-1);
    const isFeed = method === "getNewsFeed", result = isFeed ? locals.result ?? null : lastFeed?.result ?? null;
    const owner = isFeed ? locals.userId : lastFeed?.userId ?? null;
    const ids = new Set([...Object.keys(snapshot.tweets || {}), ...Object.keys(snapshot.following || {})].map(Number));
    Object.values(snapshot.following || {}).forEach(values => values.forEach(uid => ids.add(uid)));
    if (actor !== null) ids.add(actor);
    if (op && ["follow", "unfollow"].includes(op.name)) ids.add(op.args[1]);
    steps.push({
      title: titles[phase], note: bi("", ""), arr: [], highlight: [], mark: [], codeLines: [line], codeBlock: 1,
      final: Boolean(detail.complete && activeIndex === operations.length - 1),
      vars: [{ name: "count", value: state.count ?? "—" }, { name: "userId", value: locals.userId ?? "—" },
        { name: "uid", value: locals.uid ?? "—" }, { name: "idx", value: locals.idx ?? "—" },
        { name: "tweetId", value: locals.tweetId ?? "—" }, { name: "len(heap)", value: locals.heap ? heap.length : "—" }],
      twitterView: {
        operations, activeIndex, method, phase, actor, users: [...ids].sort((a, b) => a - b),
        count: state.count ?? null, tweets: copy(state.tweets || {}), following: snapshot.following || {},
        eligibleIds: actor === null ? [] : [...new Set([actor, ...(snapshot.following?.[actor] || [])])].sort((a, b) => a - b),
        heapReady: locals.heap !== undefined, heap: heap.map(entry => ({ ...entry })), resultReady: result !== null,
        result: result ? [...result] : [], resultEntries: copy(isFeed ? resultEntries : lastFeed?.entries || []), feedOwner: owner,
        currentFeed: isFeed, returned: phase === "return" || !isFeed && Boolean(lastFeed), feeds: copy(feeds), designResults: copy(designResults),
        focusUid: detail.focusUid ?? null, action: detail.action || null, check: detail.check ?? null,
        cursor: locals.uid !== undefined && locals.idx !== undefined ? { userId: locals.uid, idx: locals.idx } : null,
        source: { line, text: SOURCE[line - 1], timing: "after" }, globals: copy(snapshot), locals: copy(locals),
      },
    });
  }
  const less = (a, b) => {
    for (const key of ["ts", "tweetId", "userId", "idx"]) if (a[key] !== b[key]) return a[key] < b[key];
    return false;
  };
  function siftDown(start, pos) {
    const item = heap[pos];
    while (pos > start) {
      const parent = (pos - 1) >> 1;
      if (!less(item, heap[parent])) break;
      heap[pos] = heap[parent]; pos = parent;
    }
    heap[pos] = item;
  }
  function push(entry) { heap.push(entry); siftDown(0, heap.length - 1); }
  function pop() {
    const removed = heap[0], last = heap.pop();
    if (heap.length) {
      let pos = 0, child = 1;
      while (child < heap.length) {
        const right = child + 1;
        if (right < heap.length && !less(heap[child], heap[right])) child = right;
        heap[pos] = heap[child]; pos = child; child = 2 * pos + 1;
      }
      heap[pos] = last; siftDown(0, pos);
    }
    return removed;
  }
  state.count = 0; emit(5, "init");
  state.tweets = {}; emit(6, "init");
  state.following = {}; emit(7, "init");
  operations.forEach((op, index) => {
    activeIndex = index; method = op.name; heap = []; resultEntries = []; lastPopped = null;
    if (method === "postTweet") {
      const [userId, tweetId] = op.args; locals = { userId, tweetId };
      const entry = { ts: state.count, tweetId };
      tweetList(userId).push(entry); emit(9, "post", { focusUid: userId, action: { kind: "post", ...entry, userId, idx: tweetList(userId).length - 1 } });
      state.count--; designResults.push(null); emit(10, "clock", { focusUid: userId, complete: true });
    } else if (method === "follow" || method === "unfollow") {
      const [followerId, followeeId] = op.args; locals = { followerId, followeeId };
      if (method === "follow") followSet(followerId).add(followeeId); else followSet(followerId).delete(followeeId);
      designResults.push(null);
      emit(method === "follow" ? 29 : 31, method, { focusUid: followeeId, action: { kind: method, from: followerId, to: followeeId }, complete: true });
    } else {
      locals = { userId: op.args[0], heap: [] }; emit(12, "heap-init");
      locals.followees = [...new Set([...followSet(locals.userId), locals.userId])].sort((a, b) => a - b); emit(13, "sources");
      for (const uid of locals.followees) {
        locals.uid = uid; emit(14, "source", { focusUid: uid });
        const tweets = tweetList(uid), pass = tweets.length > 0; emit(15, "has-tweets", { check: pass, focusUid: uid });
        if (!pass) continue;
        locals.idx = tweets.length - 1; emit(16, "cursor", { focusUid: uid });
        [locals.ts, locals.tweetId] = [tweets[locals.idx].ts, tweets[locals.idx].tweetId]; emit(17, "read", { focusUid: uid });
        const entry = { ts: locals.ts, tweetId: locals.tweetId, userId: uid, idx: locals.idx };
        push(entry); emit(18, "push", { focusUid: uid, action: { kind: "push", ...entry } });
      }
      emit(14, "source-end");
      locals.result = []; emit(19, "result-init");
      while (true) {
        const pass = heap.length > 0 && locals.result.length < 10; emit(20, "guard", { check: pass });
        if (!pass) break;
        lastPopped = pop(); [locals.ts, locals.tweetId, locals.uid, locals.idx] = [lastPopped.ts, lastPopped.tweetId, lastPopped.userId, lastPopped.idx];
        emit(21, "pop", { focusUid: locals.uid, action: { kind: "pop", ...lastPopped } });
        locals.result.push(locals.tweetId); resultEntries.push({ ...lastPopped });
        emit(22, "append", { focusUid: locals.uid, action: { kind: "append", ...lastPopped } });
        const older = locals.idx > 0; emit(23, "older", { check: older, focusUid: locals.uid });
        if (older) {
          locals.idx--; emit(24, "back", { focusUid: locals.uid, action: { kind: "back", userId: locals.uid, from: locals.idx + 1, to: locals.idx } });
          const next = tweetList(locals.uid)[locals.idx]; [locals.next_ts, locals.next_tid] = [next.ts, next.tweetId];
          emit(25, "read-older", { focusUid: locals.uid, action: { kind: "read", ...next, userId: locals.uid, idx: locals.idx } });
          const entry = { ts: locals.next_ts, tweetId: locals.next_tid, userId: locals.uid, idx: locals.idx };
          push(entry); emit(26, "push", { focusUid: locals.uid, action: { kind: "push", ...entry } });
        }
      }
      feeds.push({ userId: locals.userId, result: [...locals.result], entries: copy(resultEntries), operationIndex: index });
      designResults.push([...locals.result]); emit(27, "return", { complete: true });
    }
  });
  return { original: copy(operations), answer: feeds.length ? [...feeds.at(-1).result] : [], designResults: copy(designResults), steps };
}

module.exports = {
  355: {
    ...base, code: SOURCE, builder: buildSteps355, parseTwitter355Operations, debugMode: "line-by-line",
    statement: bi("Đăng tweet, theo dõi người dùng và lấy tối đa 10 tweet mới nhất từ mình cùng những người đang follow.", "Post tweets, follow users and retrieve up to 10 newest tweets from yourself and your followees."),
    inputLabel: bi("Operations · ngăn bằng ; · tối đa 100 lệnh", "Operations · semicolon-separated · up to 100 calls"),
    approach: [bi("follow/unfollow → bật hoặc tắt nguồn tweet.", "follow/unfollow → enable or disable a tweet source."),
      bi("Mỗi nguồn đưa tweet mới nhất vào min-heap. ts nhỏ hơn = mới hơn.", "Each source seeds its newest tweet into the min-heap. Smaller ts = newer."),
      bi("Pop → thêm vào feed → nạp tweet cũ kế tiếp của cùng user. Dừng ở 10.", "Pop → append to the feed → push the same user's next older tweet. Stop at 10.")],
    complexity: { time: "O(F log(F+1) + 10 log(F+1))", space: "O(T + R + F)", note: bi("F nguồn gồm chính mình; T tweet; R quan hệ follow.", "F sources include yourself; T tweets; R follow relationships.") },
    visualizationLimits: { maxOperations: 100 },
  },
};
