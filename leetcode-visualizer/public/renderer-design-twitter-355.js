function renderDesignTwitter355Pictures(step) {
  const v = step.twitterView, vi = lang === "vi", esc = escapeHtml, host = $("treeView");
  const tone = uid => `var(--tw-c${uid % 6})`;
  const avatar = (uid, extra = "") => `<span class="tw355p-avatar ${extra}" style="--tw-tone:${tone(uid)}" title="user ${uid}">U${uid}</span>`;
  const tweet = (entry, extra = "") => `<span class="tw355p-tweet ${extra}" style="--tw-tone:${tone(entry.userId)}" title="U${entry.userId} · tweet ${entry.tweetId} · ts ${entry.ts} · idx ${entry.idx}"><b>t${esc(String(entry.tweetId))}</b><small>ts ${entry.ts} · [${entry.idx}]</small></span>`;
  const op = v.operations[v.activeIndex], queued = new Set(v.heap.map(entry => entry.ts)), sent = new Set(v.resultEntries.map(entry => entry.ts));
  const cursorPhases = ["cursor", "read", "push", "pop", "append", "older", "back", "read-older"];
  const focusedUser = v.focusUid ?? v.heap[0]?.userId ?? v.actor;
  const eligible = new Set(v.eligibleIds), following = v.actor === null ? [] : v.following[v.actor] || [];
  const operationLabel = operation => operation.name === "postTweet" ? `U${operation.args[0]} + t${operation.args[1]}`
    : operation.name === "getNewsFeed" ? `☰ U${operation.args[0]}` : `U${operation.args[0]} ${operation.name === "follow" ? "→" : "⇢"} U${operation.args[1]}${operation.name === "unfollow" ? " ×" : ""}`;
  const rail = v.operations.map((operation, i) => `<span class="tw355p-op ${i === v.activeIndex ? "active" : i < v.activeIndex ? "done" : "future"}" title="${esc(operation.label)}"><small>${i + 1}</small><b>${esc(operationLabel(operation))}</b></span>`).join("");
  const links = following.filter(uid => uid !== v.actor).map(uid => avatar(uid, v.action?.kind === "follow" && uid === v.action.to ? "added" : "")).join("");
  const removedLink = v.action?.kind === "unfollow" && v.action.to !== v.actor ? avatar(v.action.to, "removed") : "";
  const graph = v.actor === null ? '<code>following = { }</code>' : `<small>following</small>${avatar(v.actor)}<b>→</b>${links || !removedLink ? links || '<span class="tw355p-empty">∅</span>' : ""}${removedLink}${following.includes(v.actor) ? '<b class="tw355p-self">↺</b>' : ""}`;
  const lanes = v.users.map(uid => {
    const list = v.tweets[uid] || [], posted = v.method === "postTweet" && v.actor === uid;
    const cards = list.map((entry, idx) => {
      const cursor = cursorPhases.includes(v.phase) && v.cursor?.userId === uid && v.cursor.idx === idx;
      return tweet({ ...entry, userId: uid, idx }, `${queued.has(entry.ts) ? "queued" : ""} ${sent.has(entry.ts) ? "sent" : ""} ${cursor ? `cursor ${["cursor", "back"].includes(v.phase) ? "pending" : ""}` : ""} ${posted && idx === list.length - 1 ? "posted" : ""}`);
    }).join("") || '<span class="tw355p-empty">∅</span>';
    return `<div class="tw355p-lane ${eligible.has(uid) ? "eligible" : "excluded"} ${focusedUser === uid ? "focus" : ""}"><span class="tw355p-user">${avatar(uid)}<small>${v.actor === uid ? "★" : eligible.has(uid) ? "✓" : "×"}</small></span><div class="tw355p-timeline">${cards}</div></div>`;
  }).join("") || `<div class="tw355p-empty">${vi ? "Chưa có tweet" : "No tweets yet"}</div>`;
  const levels = v.heap.length ? Math.floor(Math.log2(v.heap.length)) + 1 : 1, width = Math.max(320, 2 ** (levels - 1) * 68), height = Math.max(90, levels * 44 + 10);
  const point = i => { const depth = Math.floor(Math.log2(i + 1)); return [(i - (2 ** depth - 1) + .5) / 2 ** depth * width, depth * 44 + 8]; };
  const edges = v.heap.map((_, i) => {
    if (!i) return "";
    const from = point(Math.floor((i - 1) / 2)), to = point(i);
    return `<line class="tw355p-edge" x1="${from[0]}" y1="${from[1] + 34}" x2="${to[0]}" y2="${to[1]}"/>`;
  }).join("");
  const nodes = v.heap.map((entry, i) => {
    const p = point(i), pushed = v.action?.kind === "push" && v.action.ts === entry.ts;
    return `<g class="tw355p-node ${i === 0 ? "root" : ""} ${pushed ? "pushed" : ""}" transform="translate(${p[0] - 29},${p[1]})" style="--tw-tone:${tone(entry.userId)}"><title>(${entry.ts}, ${entry.tweetId}, ${entry.userId}, ${entry.idx})</title><rect width="58" height="34" rx="6"/><text class="tw355p-node-tweet" x="29" y="14" ${String(entry.tweetId).length > 6 ? 'textLength="48" lengthAdjust="spacingAndGlyphs"' : ""}>t${entry.tweetId}</text><text class="tw355p-node-source" x="29" y="27" ${String(entry.userId).length > 6 ? 'textLength="48" lengthAdjust="spacingAndGlyphs"' : ""}>U${entry.userId} · ts ${entry.ts}</text></g>`;
  }).join("");
  const feed = v.resultEntries.map((entry, i) => `<span class="tw355p-feed-item ${v.action?.kind === "append" && i === v.resultEntries.length - 1 ? "new" : ""}" style="--tw-tone:${tone(entry.userId)}" title="#${i + 1} · user ${entry.userId} · timestamp ${entry.ts}"><small>${i + 1}</small><b>t${entry.tweetId}</b><em>U${entry.userId}</em></span>`).join("") || `<span class="tw355p-empty">${v.resultReady ? "∅" : "—"}</span>`;
  let operation;
  if (v.action?.kind === "follow" || v.action?.kind === "unfollow") {
    operation = `${avatar(v.action.from)}<b class="${v.action.kind === "follow" ? "yes" : "no"}">${v.action.kind === "follow" ? "→ +" : "⇢ ×"}</b>${avatar(v.action.to)}`;
  } else if (v.action && ["post", "push", "pop", "append", "read"].includes(v.action.kind)) {
    const action = v.action;
    operation = `${action.kind === "pop" ? "<code>heap</code><b>→</b>" : ""}${tweet(action, "action")}<b class="yes">${action.kind === "post" ? "✓" : action.kind === "push" ? "→ ↓" : action.kind === "append" ? "→" : action.kind === "pop" ? "⇢" : "←"}</b><code>${action.kind === "push" ? "heap" : action.kind === "append" ? `result[${v.result.length - 1}] ✓` : action.kind === "post" ? `tweets[${action.userId}]` : action.kind === "pop" ? vi ? "chờ thêm vào result" : "await result.append" : `idx = ${action.idx}`}</code>`;
  } else if (v.action?.kind === "back") {
    operation = `<b class="tw355p-direction">←</b><code>U${v.action.userId} · idx: ${v.action.from} → ${v.action.to}</code>`;
  } else if (v.check !== null) {
    const expression = v.phase === "guard" ? `heap: ${v.heap.length} · result: ${v.result.length} < 10` : v.phase === "older" ? `idx ${v.locals.idx} > 0` : `tweets[${v.locals.uid}]: ${(v.tweets[v.locals.uid] || []).length}`;
    operation = `<code>${esc(expression)}</code><span class="tw355p-condition">${v.check ? "True" : "False"}</span>`;
  } else if (v.phase === "return") {
    operation = `<b class="yes">✓</b><code>return [${v.result.join(", ")}]</code>`;
  } else if (v.phase === "read") {
    operation = tweet({ ts: v.locals.ts, tweetId: v.locals.tweetId, userId: v.locals.uid, idx: v.locals.idx }, "action");
  } else if (v.phase === "sources") {
    operation = `${avatar(v.actor)}<b>∪</b><code>following[${v.actor}] → {${v.locals.followees.join(", ")}}</code>`;
  } else {
    operation = `<code>${esc(v.source.text.trim())}</code>`;
  }
  const history = v.feeds.map(record => `<span><small>U${record.userId}</small><code>[${record.result.join(", ")}]</code></span>`).join("") || '<span class="tw355p-empty">—</span>';
  const summary = vi ? `Twitter: ${op?.label || "khởi tạo"}; heap ${v.heap.length}; feed ${v.result.length}/10.` : `Twitter: ${op?.label || "initialize"}; heap ${v.heap.length}; feed ${v.result.length}/10.`;
  host.innerHTML = `<section class="tw355p-viz" aria-label="${esc(summary)}">
    <div class="tw355p-heading"><b>TWITTER</b><code>${esc(op?.label || "Twitter()")}</code><small>${vi ? "Dòng" : "Line"} ${v.source.line}</small></div>
    <div class="tw355p-ops" aria-label="operations">${rail}</div>
    <section class="tw355p-sources"><header class="tw355p-follow-map">${graph}<small class="tw355p-time-direction">${vi ? "cũ → mới" : "older → newer"}</small></header><div class="tw355p-source-scroll">${lanes}</div></section>
    <div class="tw355p-details"><section class="tw355p-heap"><header><b>MIN-HEAP</b><small>${vi ? "ts nhỏ = mới" : "smaller ts = newer"}</small><span>${v.heapReady ? v.heap.length : "—"}</span></header><div class="tw355p-heap-scroll"><svg class="tw355p-tree" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="heap">${edges}${nodes || `<text class="tw355p-empty-tree" x="${width / 2}" y="45">${v.heapReady ? "∅" : "—"}</text>`}</svg></div></section><section class="tw355p-feed"><header><b>${v.currentFeed ? "result" : "last"}${v.feedOwner === null ? "" : ` · U${v.feedOwner}`}</b><span>${v.resultReady ? v.result.length : "—"} / 10</span></header><div class="tw355p-feed-scroll">${feed}</div></section></div>
    <div class="tw355p-operation">${operation}</div>
    <div class="tw355p-history" aria-label="getNewsFeed results">${history}</div>
  </section>`;
  const heapCanvas = host.querySelector(".tw355p-heap-scroll");
  if (heapCanvas) {
    const i = v.action?.kind === "push" ? Math.max(0, v.heap.findIndex(entry => entry.ts === v.action.ts)) : 0, p = point(i);
    heapCanvas.scrollLeft = Math.max(0, p[0] - heapCanvas.clientWidth / 2);
    heapCanvas.scrollTop = Math.max(0, p[1] + 17 - heapCanvas.clientHeight / 2);
  }
  for (const lane of host.querySelectorAll(".tw355p-timeline")) {
    const target = lane.querySelector(".cursor") || lane.querySelector(".queued") || lane.querySelector(".posted");
    lane.scrollLeft = target ? Math.max(0, target.offsetLeft - lane.clientWidth / 2 + target.clientWidth / 2) : lane.scrollWidth;
  }
  for (const [containerSelector, currentSelector] of [[".tw355p-ops", ".tw355p-op.active"], [".tw355p-source-scroll", ".tw355p-lane.focus"]]) {
    const container = host.querySelector(containerSelector), current = host.querySelector(currentSelector);
    if (container && current) container.scrollTop = Math.max(0, current.offsetTop - container.clientHeight / 2);
  }
  for (const selector of [".tw355p-feed-scroll", ".tw355p-history"]) { const container = host.querySelector(selector); if (container) container.scrollTop = container.scrollHeight; }
}
