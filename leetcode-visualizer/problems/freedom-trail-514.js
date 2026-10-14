"use strict";
const SOURCE = Object.freeze([
  "from collections import defaultdict",
  "",
  "class Solution:",
  "    def findRotateSteps(self, ring: str, key: str) -> int:",
  "        n = len(ring)",
  "",
  "        positions = defaultdict(list)",
  "        for i, char in enumerate(ring):",
  "            positions[char].append(i)",
  "",
  "        dp = {0: 0}",
  "",
  "        for char in key:",
  "            next_dp = {}",
  "",
  "            for target in positions[char]:",
  "                best = float(\"inf\")",
  "",
  "                for prev, cost in dp.items():",
  "                    diff = abs(target - prev)",
  "                    steps = min(diff, n - diff)",
  "",
  "                    best = min(best, cost + steps + 1)",
  "",
  "                next_dp[target] = best",
  "",
  "            dp = next_dp",
  "",
  "        return min(dp.values())"
]);
const bi = (vi, en) => ({ vi, en });
const MAX_TRACE = 180;
function parseFreedomTrail514Input(ring, params = {}) {
  const key = params.key;
  if (typeof ring !== "string" || !/^[a-z]+$/.test(ring)) throw new TypeError("514: ring must contain lowercase letters / ring chỉ gồm chữ thường.");
  if (typeof key !== "string" || !/^[a-z]+$/.test(key)) throw new TypeError("514: key must contain lowercase letters / key chỉ gồm chữ thường.");
  if (ring.length > 100 || key.length > 100) throw new RangeError("514: ring and key must have at most 100 letters / tối đa 100 chữ.");
  const available = new Set(ring);
  if ([...key].some(char => !available.has(char))) throw new RangeError("514: Every key character must occur in ring / mọi chữ của key phải có trong ring.");
  return { ring, key };
}
function buildSteps514Exact(input, params) {
  const { ring, key } = parseFreedomTrail514Input(input, params), n = ring.length;
  const maxTrace = Math.min(500, MAX_TRACE + 2 * n);
  const positions = new Map();
  let dp = new Map([[0, 0]]), next = new Map(), layer = -1, dpLayer = -1, target = null, transition = null;
  let truncated = false, ringIndex = null, ringChar = null;
  const parents = [], steps = [];
  const entries = map => [...map].map(([position, cost]) => ({ position, cost }));
  const physicalPath = (from, count, direction) => Array.from({ length: count }, (_, i) => (from + (direction === "clockwise" ? -1 : 1) * (i + 1) + n) % n);
  function emit(event, line, extra = {}) {
    if (steps.length >= maxTrace && !extra.replay && !extra.final) { truncated = true; return; }
    const visible = [...new Set([0, target, transition?.from, ...[...dp.keys()].slice(0, 10), ...[...next.keys()].slice(0, 10)])].filter(Number.isInteger).sort((a,b) => a-b);
    const { invariants: extraInvariants, ...extraView } = extra;
    const view = {
      version: 2, input: { ring, key, length:n }, event, source: { line, text:SOURCE[line - 1] },
      cursor: { keyIndex:layer, keyChar:layer >= 0 ? key[layer] : null, target, aligned:transition?.from ?? 0, ringIndex, ringChar },
      transition: transition ? {...transition} : null,
      positions: [...positions].map(([char, indices]) => ({ char, indices:[...indices] })),
      frontier: { dp:entries(dp).filter(p => visible.includes(p.position)), next:entries(next).filter(p => visible.includes(p.position)), count:dp.size, nextCount:next.size },
      answer:null, final:false, truncated,
      invariants: { costsFinite:[...dp.values(),...next.values()].every(Number.isSafeInteger), dpPositionsMatchLayer:dpLayer < 0 || [...dp.keys()].every(p => ring[p] === key[dpLayer]), nextPositionsMatchChar:layer < 0 || [...next.keys()].every(p => ring[p] === key[layer]), witnessValid:null },
      ...extraView,
      invariants: { costsFinite:[...dp.values(),...next.values()].every(Number.isSafeInteger), dpPositionsMatchLayer:dpLayer < 0 || [...dp.keys()].every(p => ring[p] === key[dpLayer]), nextPositionsMatchChar:layer < 0 || [...next.keys()].every(p => ring[p] === key[layer]), witnessValid:null, ...extraInvariants },
    };
    steps.push({ arr:[], highlight:[], mark:[], title:bi("Quay vòng → bấm chữ", "Rotate the ring → press a letter"), note:bi("",""), codeLines:[line], final:!!extra.final,
      vars:[{name:"char",value:layer >= 0 ? key[layer] : "—"},{name:"target",value:target ?? "—"},{name:"prev",value:transition?.from ?? "—"},{name:"steps",value:transition?.turns ?? "—"}],
      freedomTrail514View:view });
  }
  emit("set-ring-size", 5);
  emit("initialize-positions", 7);
  for (let i = 0; i < n; i++) {
    ringIndex = i;
    ringChar = ring[i];
    emit("scan-ring-position", 8);
    if (!positions.has(ringChar)) positions.set(ringChar, []);
    positions.get(ringChar).push(i);
    emit("store-ring-position", 9);
  }
  ringIndex = null;
  ringChar = null;
  emit("seed-dp", 11);
  for (layer = 0; layer < key.length; layer++) {
    next = new Map(); transition = null; target = null;
    emit("select-key-character", 13);
    emit("initialize-next-layer", 14);
    const parent = new Map();
    for (const to of positions.get(key[layer])) {
      target = to;
      transition = null;
      emit("select-target-position", 16);
      let best = Infinity, link = null;
      emit("initialize-best-cost", 17);
      for (const [from, cost] of dp) {
        transition = {from,to,baseCost:cost,clockwise:null,counterclockwise:null,turns:null,direction:null,total:null,best:Number.isFinite(best)?best:null};
        emit("select-predecessor", 19);
        const diff = Math.abs(to - from);
        transition = {...transition, diff};
        emit("compute-linear-distance", 20);
        const clockwise = (from - to + n) % n, counterclockwise = (to - from + n) % n;
        const turns = Math.min(diff, n - diff);
        const direction = turns === 0 ? "stay" : clockwise <= counterclockwise ? "clockwise" : "counterclockwise";
        transition = {...transition, clockwise,counterclockwise,turns,direction};
        emit("compute-distance", 21);
        const total = cost + turns + 1;
        const bestBefore = Number.isFinite(best) ? best : null;
        const accepted = total < best;
        if (accepted) { best = total; link = {from,to,turns,direction}; }
        transition = {...transition, total, bestBefore, best, accepted};
        emit("build-candidate", 23);
      }
      next.set(to, best); parent.set(to, link);
      transition = {...link,baseCost:dp.get(link.from),clockwise:(link.from-to+n)%n,counterclockwise:(to-link.from+n)%n,total:best,best,accepted:true};
      emit("write-next-cost", 25);
    }
    dp = next; dpLayer = layer; parents.push(parent); transition = null; target = null;
    emit("commit-frontier", 27, { committed:true });
  }
  const [endpoint, answer] = [...dp].reduce((best, entry) => entry[1] < best[1] ? entry : best);
  const actions = [];
  let end = endpoint;
  for (let i = key.length - 1; i >= 0; i--) {
    const link = parents[i].get(end);
    actions.push({layer:i,char:key[i],from:link.from,to:link.to,turns:link.turns,direction:link.direction,rotationPath:physicalPath(link.from,link.turns,link.direction),press:true,cost:link.turns+1});
    end = link.from;
  }
  actions.reverse();
  next = new Map();
  let aligned = 0, turns = 0, presses = 0;
  for (const action of actions) {
    layer = action.layer; target = action.to;
    transition = {from:action.from,to:action.to,baseCost:turns+presses,clockwise:(action.from-action.to+n)%n,counterclockwise:(action.to-action.from+n)%n,turns:action.turns,direction:action.direction,total:turns+presses+action.cost};
    emit("replay-rotate", 29, {replay:{aligned,turns,presses,typed:key.slice(0,presses),action:{...action,rotationPath:[...action.rotationPath]},rotated:false}});
    aligned = action.to; turns += action.turns;
    presses++;
    emit("replay-press", 29, {replay:{aligned,turns,presses,typed:key.slice(0,presses),action:{...action,rotationPath:[...action.rotationPath]},rotated:true}});
  }
  if (turns + presses !== answer || actions.map(a=>a.char).join("") !== key) throw new Error("514: Optimal path invariant failed");
  emit("final-return", 29, {final:true,answer,actions:actions.map(a=>({...a,rotationPath:[...a.rotationPath]})),replay:{aligned,turns,presses,typed:key,action:null,rotated:true},invariants:{witnessValid:true}});
  return {original:ring,key,answer,actions,steps};
}
module.exports = { 514: {
  id:514,difficulty:"hard",slug:"freedom-trail",
  category:{key:"dp",vi:"Quy hoạch động",en:"Dynamic Programming"},tags:[{key:"string",vi:"Chuỗi",en:"String"}],
  title:bi("Freedom Trail","Freedom Trail"),titleVi:bi("Quay vòng để nhập chữ","Rotate a ring to spell a key"),
  statement:bi("ring[0] bắt đầu ở 12 giờ. Quay một nấc = 1 bước; bấm nhập chữ = 1 bước. Nhập toàn bộ key với ít bước nhất.","ring[0] starts at twelve o'clock. Rotate one notch = 1 step; press a letter = 1 step. Spell the full key with the fewest steps."),
  defaultInput:"godding",inputKind:"string",inputLabel:bi("ring · 1–100 chữ thường","ring · 1–100 lowercase letters"),
  extraParams:[{key:"key",type:"string",label:bi("key · 1–100 chữ có trong ring","key · 1–100 letters present in ring"),default:"gd"}],
  debugMode:"line-by-line",parseFreedomTrail514Input,
  approach:[bi("Lưu mọi vị trí của từng chữ. dp[p] = số bước ít nhất khi p ở 12 giờ.","Index all occurrences. dp[p] = minimum steps with p at twelve o'clock."),
  bi("Với mỗi vị trí chữ tiếp theo: thử các vị trí trước, cộng min(diff, n − diff) + 1.","For each occurrence of the next letter, try previous positions and add min(diff, n − diff) + 1."),
  bi("Giữ mọi vị trí trùng chữ; chọn vị trí gần nhất ngay lúc này chưa chắc tối ưu cho cả key.","Keep all occurrences; the nearest one now may not give the best total for the key.")],
  complexity:{time:"O(|key| × |ring|²)",space:"O(|ring|)",note:bi("Code dùng DP cuốn chiếu. Hình lưu thêm parent để phát lại đường tối ưu; input lớn rút gọn các bước tính DP.","Code uses rolling DP. The visual retains extra parents for optimal-path replay; large inputs shorten the DP trace.")},
  code:SOURCE,liveArgs:(input,params)=>{const p=parseFreedomTrail514Input(input,params);return [p.ring,p.key];},builder:buildSteps514Exact,
} };
