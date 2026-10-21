"use strict";
const base = require("./two-pointer")[475];
const bi = (vi, en) => ({ vi, en });
const INF = 10 ** 9;
const code = [
  "class Solution:",
  "    def findRadius(self, houses, heaters):",
  "        heaters.sort()",
  "        radius = 0",
  "        for house in houses:",
  "            left, right = 0, len(heaters)",
  "            while left < right:",
  "                mid = (left + right) // 2",
  "                if heaters[mid] < house:",
  "                    left = mid + 1",
  "                else:",
  "                    right = mid",
  "            nearest = 10**9",
  "            if left > 0:",
  "                nearest = min(nearest, house - heaters[left-1])",
  "            if left < len(heaters):",
  "                nearest = min(nearest, heaters[left] - house)",
  "            radius = max(radius, nearest)",
  "        return radius",
];
function parseList(input, name) {
  let values = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.startsWith("[")) { try { values = JSON.parse(text); } catch { throw new Error(`${name}: mảng không hợp lệ / invalid array.`); } }
    else {
      if (!/^\d+(\s*,\s*\d+)*$/.test(text)) throw new Error(`${name}: nhập số nguyên cách nhau dấu phẩy / enter comma-separated integers.`);
      values = text.split(",").map(Number);
    }
  }
  if (!Array.isArray(values) || values.length < 1 || values.length > 30000 || !values.every(x => typeof x === "number" && Number.isInteger(x) && x >= 1 && x <= INF)) {
    throw new Error(`${name}: cần 1–30000 vị trí nguyên trong [1, 10^9] / expected 1–30000 integer positions in [1, 10^9].`);
  }
  return [...values];
}
function parse(input, params = {}) { return [parseList(input, "houses"), parseList(params.heaters === undefined ? "2,9" : params.heaters, "heaters")]; }
function lowerBound(heaters, house) {
  let left = 0, right = heaters.length;
  while (left < right) { const mid = Math.floor((left + right) / 2); if (heaters[mid] < house) left = mid + 1; else right = mid; }
  return left;
}
function solve(houses, heaters) {
  let radius = 0, bottleneck = null;
  for (let i = 0; i < houses.length; i++) {
    const pos = lowerBound(heaters, houses[i]);
    const a = pos > 0 ? houses[i] - heaters[pos - 1] : INF, b = pos < heaters.length ? heaters[pos] - houses[i] : INF;
    const nearest = Math.min(a, b), heater = a <= b ? pos - 1 : pos;
    if (bottleneck === null || nearest > radius) { radius = nearest; bottleneck = { index: i, house: houses[i], nearest, heater, heaterPosition: heaters[heater] }; }
  }
  return { radius, bottleneck };
}
function builder(input, params = {}) {
  const [houses, heaters] = parse(input, params), originalHeaters = [...heaters], steps = [], history = [];
  const detailed = houses.length <= 12 && heaters.length <= 12;
  if (!detailed) {
    heaters.sort((a,b) => a-b);
    const result = solve(houses, heaters);
    return { original: [...houses], answer: result.radius, steps: [{ title: bi("Kết quả · tính đủ toàn bộ đầu vào", "Result · full input computed"), codeLines: [], final: true, vars: [], arr: [], highlight: [], mark: [], note: bi("", ""),
      heaters475View: { mode: "summary", houses: houses.slice(0,12), heaters: heaters.slice(0,12), totalHouses: houses.length, totalHeaters: heaters.length, radius: result.radius,
        houseIndex: null, house: null, line: null, source: "", event: "return", left: null, right: null, mid: null, check: null, candidate: null, nearest: null, chosen: null, distances: { left: null, right: null }, history: [], bottleneck: result.bottleneck, update: null }
    }] };
  }
  const locals = { self: {}, houses, heaters };
  let houseIndex = null, distances = { left: null, right: null }, chosen = null, bottleneck = null;
  function emit(line, event, title, options = {}) {
    const final = line === 19;
    steps.push({ title: bi(`Dòng ${line} · ${title.vi}`, `Line ${line} · ${title.en}`), codeLines: [line], final, arr: [], highlight: [], mark: [], note: bi("", ""),
      vars: Object.entries(locals).map(([name, raw]) => ({ name, rawValue: Array.isArray(raw) ? [...raw] : typeof raw === "object" ? { ...raw } : raw, value: name === "self" ? "Solution" : Array.isArray(raw) ? [...raw] : raw })),
      heaters475View: { mode: "trace", houses: [...houses], heaters: [...heaters], originalHeaters: [...originalHeaters], totalHouses: houses.length, totalHeaters: heaters.length,
        line, source: code[line-1].trim(), event, radius: locals.radius ?? null, houseIndex, house: houseIndex === null ? null : locals.house,
        left: event === "house" ? null : locals.left ?? null, right: event === "house" ? null : locals.right ?? null, mid: [8,9,10,12].includes(line) ? locals.mid : null,
        nearest: line >= 13 ? locals.nearest ?? null : null, chosen, distances: { ...distances }, check: options.check ?? null, candidate: options.candidate ?? null,
        history: history.map(row => ({ ...row })), bottleneck: bottleneck && { ...bottleneck }, update: options.update || null }
    });
  }
  heaters.sort((a,b) => a-b); emit(3,"sort",bi("Sắp xếp máy sưởi", "Sort heaters"));
  locals.radius = 0; emit(4,"init",bi("Bắt đầu với r = 0", "Start with r = 0"));
  for (let index = 0; index < houses.length; index++) {
    houseIndex = index; locals.house = houses[index]; distances = { left: null, right: null }; chosen = null;
    emit(5,"house",bi(`Nhà #${index}: ${locals.house}`, `House #${index}: ${locals.house}`));
    locals.left = 0; locals.right = heaters.length; emit(6,"bounds",bi("Tìm máy đầu tiên ≥ nhà", "Find first heater ≥ house"));
    while (true) {
      const active = locals.left < locals.right;
      emit(7,active ? "while" : "position",bi(active ? "Còn khoảng tìm kiếm" : `Vị trí chèn: ${locals.left}`, active ? "Search range remains" : `Insertion index: ${locals.left}`),{check:active});
      if (!active) break;
      locals.mid = Math.floor((locals.left + locals.right)/2); emit(8,"mid",bi(`Thử máy #${locals.mid}`, `Try heater #${locals.mid}`));
      const less = heaters[locals.mid] < locals.house;
      emit(9,"compare",bi(`${heaters[locals.mid]} < ${locals.house}? ${less ? "✓" : "✕"}`,`${heaters[locals.mid]} < ${locals.house}? ${less ? "✓" : "✕"}`),{check:less});
      if (less) { locals.left = locals.mid+1; emit(10,"move-left",bi(`left → ${locals.left}`,`left → ${locals.left}`)); }
      else { locals.right = locals.mid; emit(12,"move-right",bi(`right ← ${locals.right}`,`right ← ${locals.right}`)); }
    }
    locals.nearest = INF; emit(13,"reset",bi("Bắt đầu chọn máy gần nhất", "Start choosing the nearest heater"));
    const hasLeft = locals.left > 0;
    emit(14,"has-left",bi(hasLeft ? "Có máy bên trái" : "Không có máy bên trái",hasLeft ? "Left heater exists" : "No left heater"),{check:hasLeft});
    if (hasLeft) {
      const before = locals.nearest, candidate = locals.house - heaters[locals.left-1]; distances.left = candidate;
      locals.nearest = Math.min(before,candidate); chosen = locals.left-1;
      emit(15,"left-distance",bi(`Khoảng cách trái: ${candidate}`,`Left distance: ${candidate}`),{candidate,update:{name:"nearest",operator:"min",before,candidate,after:locals.nearest}});
    }
    const hasRight = locals.left < heaters.length;
    emit(16,"has-right",bi(hasRight ? "Có máy bên phải (hoặc trùng nhà)" : "Không có máy bên phải",hasRight ? "Right heater exists (or at house)" : "No right heater"),{check:hasRight});
    if (hasRight) {
      const before = locals.nearest, candidate = heaters[locals.left] - locals.house; distances.right = candidate;
      if (candidate < before) chosen = locals.left;
      locals.nearest = Math.min(before,candidate);
      emit(17,"right-distance",bi(`Khoảng cách phải: ${candidate}`,`Right distance: ${candidate}`),{candidate,update:{name:"nearest",operator:"min",before,candidate,after:locals.nearest}});
    }
    const before = locals.radius; locals.radius = Math.max(before,locals.nearest);
    if (bottleneck === null || locals.nearest > before) bottleneck = { index, house: locals.house, nearest: locals.nearest, heater: chosen, heaterPosition: heaters[chosen] };
    history.push({index,house:locals.house,heater:heaters[chosen],nearest:locals.nearest,radius:locals.radius});
    emit(18,"radius",bi(`r = max(${before}, ${locals.nearest}) = ${locals.radius}`,`r = max(${before}, ${locals.nearest}) = ${locals.radius}`),{update:{name:"radius",operator:"max",before,candidate:locals.nearest,after:locals.radius}});
  }
  emit(5,"loop-end",bi("Đã xét hết nhà", "All houses processed"));
  emit(19,"return",bi(`Bán kính nhỏ nhất: ${locals.radius}`,`Minimum radius: ${locals.radius}`));
  return { original: [...houses], answer: locals.radius, steps };
}
module.exports = { 475: { ...base, code, builder, debugMode: "line-by-line",
  titleVi: bi("Nhà xa máy nhất quyết định bán kính", "The hardest house determines the radius"),
  statement: bi("Mỗi máy sưởi phủ [vị trí − r, vị trí + r]. Tìm r nhỏ nhất để phủ tất cả nhà; mọi máy dùng chung r.", "Each heater covers [position − r, position + r]. Find the smallest shared r that covers every house."),
  inputLabel: bi("houses · vị trí nhà (1..10^9)", "houses · house positions (1..10^9)"),
  extraParams: [{ key:"heaters",type:"string",default:"2,9",label:bi("heaters · vị trí máy sưởi, cách nhau dấu phẩy", "heaters · comma-separated heater positions") }],
  approach: [bi("Mỗi nhà → máy gần nhất (min).", "Each house → nearest heater (min)."),bi("Mọi nhà → bán kính lớn nhất cần dùng (max).", "All houses → largest required distance (max).")],
  complexity: { time:"O(n log n + m log n)",space:"O(n)",note:bi("m nhà, n máy; Python sort dùng O(n) bộ nhớ phụ. Debug ≤12 nhà và ≤12 máy; đầu vào lớn tính đủ, hình xem trước 12 vị trí mỗi loại.", "m houses, n heaters; Python sort uses O(n) auxiliary space. Full debug for ≤12 of each; larger inputs compute fully and preview 12 of each.") },
  liveArgs: (input,params) => parse(input,params)
} };
