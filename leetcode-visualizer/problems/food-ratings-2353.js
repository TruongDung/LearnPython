"use strict";

const { bi, integer, heapPush, heapPop, pictureTrace } = require("./picture-study-shared");
const code = ["from collections import defaultdict", "from heapq import heappush, heappop", "class FoodRatings:",
  "    def __init__(self, foods, cuisines, ratings):", "        self.food = {}", "        self.heaps = defaultdict(list)",
  "        for food, cuisine, rating in zip(foods, cuisines, ratings):", "            self.food[food] = (rating, cuisine)", "            heappush(self.heaps[cuisine], (-rating, food))",
  "    def changeRating(self, food, newRating):", "        rating, cuisine = self.food[food]", "        self.food[food] = (newRating, cuisine)",
  "        heappush(self.heaps[cuisine], (-newRating, food))", "    def highestRated(self, cuisine):", "        heap = self.heaps[cuisine]",
  "        while -heap[0][0] != self.food[heap[0][1]][0]:", "            heappop(heap)", "        return heap[0][1]"];
const defaultInput = JSON.stringify({ foods: ["kimchi", "miso", "sushi", "moussaka", "ramen", "bulgogi"], cuisines: ["korean", "japanese", "japanese", "greek", "japanese", "korean"], ratings: [9, 12, 8, 15, 14, 7],
  operations: [["highestRated", "korean"], ["highestRated", "japanese"], ["changeRating", "sushi", 16], ["highestRated", "japanese"], ["changeRating", "ramen", 16], ["highestRated", "japanese"], ["changeRating", "ramen", 5], ["highestRated", "japanese"]] });
function parseFoodRatings2353(input = defaultInput) {
  let p = input;
  if (typeof input === "string") { try { p = JSON.parse(input); } catch (_) { throw new TypeError("#2353: JSON không hợp lệ / invalid JSON."); } }
  if (!p || !Array.isArray(p.foods) || !Array.isArray(p.cuisines) || !Array.isArray(p.ratings) || !Array.isArray(p.operations) || !p.foods.length || p.foods.length > 30 || p.operations.length > 60 || p.cuisines.length !== p.foods.length || p.ratings.length !== p.foods.length) {
    throw new RangeError("#2353: foods/cuisines/ratings cùng độ dài (1–30), operations tối đa 60 / equal-length arrays (1–30), up to 60 operations.");
  }
  const word = value => typeof value === "string" && /^[a-z]{1,10}$/.test(value);
  if (!p.foods.every(word) || !p.cuisines.every(word) || new Set(p.foods).size !== p.foods.length) throw new TypeError("#2353: tên gồm 1–10 chữ a–z, foods không trùng / use 1–10 lowercase letters and unique foods.");
  const ratings = p.ratings.map(x => integer(x, 1, 100000000, "rating"));
  const operations = p.operations.map((op, index) => {
    if (!Array.isArray(op)) throw new TypeError(`#2353: operation ${index + 1}`);
    if (op[0] === "changeRating" && op.length === 3 && p.foods.includes(op[1])) return { name: op[0], args: [op[1], integer(op[2], 1, 100000000, "newRating")] };
    if (op[0] === "highestRated" && op.length === 2 && p.cuisines.includes(op[1])) return { name: op[0], args: [op[1]] };
    throw new TypeError(`#2353: operation ${index + 1} không hợp lệ / invalid operation ${index + 1}.`);
  });
  return { foods: [...p.foods], cuisines: [...p.cuisines], ratings, operations };
}
function builder(input) {
  const parsed = parseFoodRatings2353(input), { foods, cuisines, ratings, operations } = parsed, food = {}, heaps = {}, history = [], results = [], t = pictureTrace(2353, code, ["food", "cuisine", "rating", "newRating", "heap[0]", "len(heap)", "live rating", "stale"]);
  let activeIndex = -1, local = {}, answer = null;
  const heapFor = cuisine => heaps[cuisine] || (heaps[cuisine] = []);
  const emit = (line, phase, action = null, final = false) => {
    const heap = local.cuisine === undefined ? null : heaps[local.cuisine];
    t.emit(line, phase, { ...local, "heap[0]": heap?.length ? `(${heap[0].join(", ")})` : null, "len(heap)": heap?.length,
      "live rating": heap?.length ? food[heap[0][1]][0] : null, "stale": heap?.length ? -heap[0][0] !== food[heap[0][1]][0] : null },
      { foods, cuisines, food, heaps, operations, activeIndex, local, history, answer, action }, final);
  };
  emit(5, "food = ∅"); emit(6, "heaps = ∅");
  for (let i = 0; i < foods.length; i++) {
    local = { food: foods[i], cuisine: cuisines[i], rating: ratings[i] }; emit(7, "food → cuisine");
    food[local.food] = [local.rating, local.cuisine]; emit(8, "rating");
    heapPush(heapFor(local.cuisine), [-local.rating, local.food]); emit(9, "(-rating, food) → heap", { kind: "push", entry: [-local.rating, local.food] });
  }
  emit(7, "✓", null, !operations.length);
  operations.forEach((op, i) => {
    activeIndex = i;
    if (op.name === "changeRating") {
      const [name, newRating] = op.args; local = { food: name, newRating };
      [local.rating, local.cuisine] = food[name]; emit(11, "rating → cuisine");
      food[name] = [newRating, local.cuisine]; emit(12, "rating ↻", { kind: "change", from: local.rating, to: newRating, food: name });
      heapPush(heapFor(local.cuisine), [-newRating, name]); results.push(null); emit(13, "(-rating, food) → heap", { kind: "push", entry: [-newRating, name] }, i === operations.length - 1);
    } else {
      local = { cuisine: op.args[0] }; const heap = heapFor(local.cuisine); emit(15, "cuisine → heap");
      while (true) {
        const stale = -heap[0][0] !== food[heap[0][1]][0]; emit(16, "stale ?", { kind: "check", pass: stale });
        if (!stale) break;
        const entry = heapPop(heap); emit(17, "stale ×", { kind: "remove", entry });
      }
      answer = heap[0][1]; results.push(answer); history.push({ cuisine: local.cuisine, food: answer, rating: -heap[0][0] });
      emit(18, "★", { kind: "return", food: answer }, i === operations.length - 1);
    }
  });
  return { original: parsed, answer, designResults: results, steps: t.steps };
}
module.exports = { 2353: { id: 2353, difficulty: "medium", slug: "design-a-food-rating-system", category: { key: "design", vi: "Thiết kế", en: "Design" },
  title: bi("Design a Food Rating System"), titleVi: bi("Thiết kế hệ thống đánh giá món ăn", "Design a food rating system"),
  statement: bi("Đổi điểm món ăn và tìm món cao điểm nhất theo cuisine. Hòa điểm → tên nhỏ hơn theo bảng chữ cái.", "Change food ratings and find each cuisine's highest-rated food. Ties use the lexicographically smallest name."),
  defaultInput, inputKind: "string", inputLabel: bi("JSON · foods, cuisines, ratings, operations", "JSON · foods, cuisines, ratings, operations"), extraParams: [],
  approach: [bi("Mỗi cuisine có min-heap (-rating, food).", "Each cuisine has a min-heap of (-rating, food)."), bi("Đổi rating → đẩy bản mới; query → bỏ các gốc cũ.", "Change a rating → push a new entry; query → discard stale roots.")],
  complexity: { time: "O(n log n) init; O(log(n+q)) change; O(q log(n+q)) total pruning", space: "O(n+q)", note: bi("Mỗi bản cũ bị pop tối đa một lần; query có thể dọn nhiều bản.", "Each stale entry is popped at most once; one query may prune many entries.") },
  code, builder, parseFoodRatings2353, debugMode: "line-by-line" } };
