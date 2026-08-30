// Auto-generated: do not edit headers manually.
// Monotonic Stack catalog additions.

const category = { key: "stack-queue", vi: "Stack & Queue", en: "Stack & Queue" };
const arrayTag = { key: "array", vi: "Mảng", en: "Array" };
const stringTag = { key: "string", vi: "Chuỗi", en: "String" };
const treeTag = { key: "tree", vi: "Cây", en: "Tree" };
const linkedListTag = { key: "linked-list", vi: "Linked List", en: "Linked List" };
const monoTag = { key: "monotonic-stack", vi: "Monotonic Stack", en: "Monotonic Stack" };
const premiumTag = { key: "premium", vi: "Premium", en: "Premium" };

const text = (vi, en = vi) => ({ vi, en });
const arrText = (arr) => `[${arr.join(", ")}]`;

function parseNums(value, label = "nums") {
  const nums = String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number);
  if (!nums.length || nums.some((num) => !Number.isInteger(num))) {
    throw new Error(`${label} must be a non-empty comma-separated list of integers.`);
  }
  return nums;
}

function parsePairs(value, label = "pairs") {
  const pairs = String(value ?? "")
    .split(";")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((part) => Number(part.trim())));
  if (!pairs.length || pairs.some((pair) => pair.length !== 2 || pair.some((num) => !Number.isInteger(num)))) {
    throw new Error(`${label} must use a,b;c,d format.`);
  }
  return pairs;
}

function parseMatrix(value, label = "matrix") {
  const matrix = String(value ?? "")
    .split(";")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((part) => Number(part.trim())));
  if (!matrix.length || matrix.some((row) => !row.length || row.some((num) => !Number.isInteger(num)))) {
    throw new Error(`${label} must use rows separated by semicolons.`);
  }
  return matrix;
}

function genericSteps({ nums, title, answer, note, vars = [], highlights = [], marks = [], sub = null }) {
  const arr = Array.isArray(nums) ? nums : [];
  return [
    {
      title: text("Nhận diện monotonic stack", "Identify the monotonic stack pattern"),
      arr: [...arr],
      sub: sub || arr.map((_, index) => `[${index}]`),
      highlight: [],
      mark: [],
      codeLines: [1],
      vars: [{ name: "n", value: arr.length }],
      note: text("Ta giữ stack đơn điệu để mỗi phần tử chỉ vào/ra stack một lần.", "Keep a monotonic stack so each element enters and leaves the stack at most once."),
    },
    {
      title,
      arr: [...arr],
      sub: sub || arr.map((_, index) => `[${index}]`),
      highlight: highlights,
      mark: marks,
      final: true,
      codeLines: [1],
      vars: [{ name: "answer", value: Array.isArray(answer) ? arrText(answer) : answer }, ...vars],
      note,
    },
  ];
}

function arrayBuilder(solver, noteFactory = null) {
  return (input, params = {}) => {
    const nums = parseNums(input);
    const answer = solver(nums, params);
    const note = noteFactory ? noteFactory(nums, answer, params) : text(`Kết quả = ${Array.isArray(answer) ? arrText(answer) : answer}.`, `Answer = ${Array.isArray(answer) ? arrText(answer) : answer}.`);
    return { original: nums, answer, steps: genericSteps({ nums, title: text("Kết quả", "Result"), answer, note }) };
  };
}

function finalPrices(nums) {
  const ans = [...nums], stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack.at(-1)] >= nums[i]) ans[stack.pop()] -= nums[i];
    stack.push(i);
  }
  return ans;
}

function removeDuplicateLetters(input) {
  const s = String(input ?? "");
  const last = {};
  [...s].forEach((ch, i) => { last[ch] = i; });
  const stack = [], used = new Set();
  [...s].forEach((ch, i) => {
    if (used.has(ch)) return;
    while (stack.length && stack.at(-1) > ch && last[stack.at(-1)] > i) used.delete(stack.pop());
    stack.push(ch);
    used.add(ch);
  });
  return stack.join("");
}

function pattern132(nums) {
  let third = -Infinity;
  const stack = [];
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] < third) return true;
    while (stack.length && nums[i] > stack.at(-1)) third = stack.pop();
    stack.push(nums[i]);
  }
  return false;
}

function shortestUnsorted(nums) {
  const stack = [];
  let left = nums.length, right = 0;
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack.at(-1)] > nums[i]) left = Math.min(left, stack.pop());
    stack.push(i);
  }
  stack.length = 0;
  for (let i = nums.length - 1; i >= 0; i--) {
    while (stack.length && nums[stack.at(-1)] < nums[i]) right = Math.max(right, stack.pop());
    stack.push(i);
  }
  return right > left ? right - left + 1 : 0;
}

function maxBinaryTree(nums) {
  const stack = [];
  nums.forEach((value) => {
    const node = { val: value, left: null, right: null };
    while (stack.length && stack.at(-1).val < value) node.left = stack.pop();
    if (stack.length) stack.at(-1).right = node;
    stack.push(node);
  });
  while (stack.length > 1) stack.pop();
  return stack[0]?.val ?? null;
}

function maxChunks(nums) {
  let best = 0, chunks = 0;
  nums.forEach((num, i) => {
    best = Math.max(best, num);
    if (best === i) chunks++;
  });
  return chunks;
}

function carFleet(input, params = {}) {
  const cars = parsePairs(input, "cars");
  const target = Number(params.target ?? 12);
  const times = cars
    .map(([position, speed]) => [position, (target - position) / speed])
    .sort((a, b) => b[0] - a[0]);
  let fleets = 0, slowest = 0;
  times.forEach(([, time]) => {
    if (time > slowest) {
      fleets++;
      slowest = time;
    }
  });
  return fleets;
}

function stockSpan(input) {
  const prices = parseNums(input, "prices");
  const stack = [], answer = [];
  prices.forEach((price, i) => {
    while (stack.length && stack.at(-1)[0] <= price) stack.pop();
    answer.push(stack.length ? i - stack.at(-1)[1] : i + 1);
    stack.push([price, i]);
  });
  return { original: prices, answer, steps: genericSteps({ nums: prices, title: text("Stock spans", "Stock spans"), answer, note: text("Stack giảm dần theo giá; span nhảy về ngày có giá cao hơn gần nhất.", "The stack decreases by price; span jumps back to the nearest previous higher price.") }) };
}

function sumSubarrayMins(nums) {
  const mod = 1000000007, stack = [];
  let ans = 0, dot = 0;
  nums.forEach((num) => {
    let count = 1;
    while (stack.length && stack.at(-1)[0] >= num) {
      const [value, span] = stack.pop();
      count += span;
      dot -= value * span;
    }
    stack.push([num, count]);
    dot += num * count;
    ans = (ans + dot) % mod;
  });
  return ans;
}

function maxWidthRamp(nums) {
  const stack = [];
  for (let i = 0; i < nums.length; i++) if (!stack.length || nums[i] < nums[stack.at(-1)]) stack.push(i);
  let ans = 0;
  for (let j = nums.length - 1; j >= 0; j--) {
    while (stack.length && nums[stack.at(-1)] <= nums[j]) ans = Math.max(ans, j - stack.pop());
  }
  return ans;
}

function bstPreorder(nums) {
  const stack = [];
  let lower = -Infinity;
  for (const value of nums) {
    if (value < lower) return "invalid preorder";
    while (stack.length && value > stack.at(-1)) lower = stack.pop();
    stack.push(value);
  }
  return "valid preorder";
}

function nextGreaterNodes(nums) {
  const ans = Array(nums.length).fill(0), stack = [];
  nums.forEach((value, i) => {
    while (stack.length && nums[stack.at(-1)] < value) ans[stack.pop()] = value;
    stack.push(i);
  });
  return ans;
}

function buildSteps1019(input) {
  const values = parseNums(input, "head");
  if (values.length > 14) throw new Error("Use up to 14 linked-list nodes so the stack trace stays readable.");
  const answer = Array(values.length).fill(0);
  const stack = [];
  const steps = [];

  const stackLabel = () => `[${stack.map((index) => `${index}:${values[index]}`).join(", ")}]`;
  const answerLabel = () => arrText(answer);
  const nodeSub = () => values.map((_, index) => `node ${index} · ans=${answer[index]}`);
  const stackItems = () => stack.map((index) => ({ value: values[index], detail: `node ${index}` }));
  const linkedListText = () => values.map((value, index) => `${index}:${value}`).join(" -> ");

  const snap = ({ title, line, note, current = -1, compare = null, resolved = null, final = false }) => {
    const highlight = new Set();
    if (Number.isInteger(current) && current >= 0) highlight.add(current);
    if (Number.isInteger(compare) && compare >= 0) highlight.add(compare);
    steps.push({
      title,
      arr: [...values],
      sub: nodeSub(),
      highlight: [...highlight],
      mark: Number.isInteger(resolved)
        ? [resolved]
        : final
          ? answer.map((value, index) => value > 0 ? index : -1).filter((index) => index >= 0)
          : [...stack],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "linked list", value: linkedListText() },
        { name: "stack", value: stackLabel() },
        { name: "answer", value: answerLabel() },
      ],
      note,
      final,
      stackView: {
        title: "Monotonic decreasing stack (nodes waiting for a greater value)",
        emptyLabel: "no node is waiting",
        items: stackItems(),
        input: [...values],
        current,
        inputLabel: "linked list values copied into an array",
        expected: current >= 0 ? values[current] : "",
        status: [
          { label: "current node", value: current >= 0 ? `${current}:${values[current]}` : "-" },
          { label: "stack top", value: stack.length ? `${stack.at(-1)}:${values[stack.at(-1)]}` : "empty" },
          { label: "answer", value: answerLabel() },
        ],
      },
    });
  };

  snap({
    title: text("Chuyển linked list thành array", "Copy linked list into an array"),
    line: [3, 4, 5, 6],
    note: text(
      "Linked list không truy cập index nhanh, nên ta copy value sang array để dùng stack theo index.",
      "A linked list has no fast index access, so copy node values into an array and store indices in the stack.",
    ),
  });

  snap({
    title: text("answer toàn 0, stack rỗng", "answer starts as all 0, stack is empty"),
    line: [7, 8],
    note: text(
      "0 nghĩa là node này chưa tìm thấy node lớn hơn ở bên phải.",
      "0 means this node has not found a greater node to its right yet.",
    ),
  });

  for (let i = 0; i < values.length; i++) {
    snap({
      title: text(`Đọc node ${i}: value = ${values[i]}`, `Read node ${i}: value = ${values[i]}`),
      line: 9,
      current: i,
      note: text(
        `Node hiện tại có thể là next greater cho các node nhỏ hơn đang nằm trên stack.`,
        `The current node may be the next greater value for smaller nodes waiting on the stack.`,
      ),
    });

    while (stack.length && values[stack.at(-1)] < values[i]) {
      const top = stack.at(-1);
      snap({
        title: text(`${values[top]} < ${values[i]} nên node ${top} được giải quyết`, `${values[top]} < ${values[i]}, so node ${top} is resolved`),
        line: 10,
        current: i,
        compare: top,
        note: text(
          `Vì node ${i} là node lớn hơn đầu tiên ta gặp sau node ${top}, đáp án của node ${top} chính là ${values[i]}.`,
          `Because node ${i} is the first greater node encountered after node ${top}, node ${top}'s answer is ${values[i]}.`,
        ),
      });
      const resolved = stack.pop();
      answer[resolved] = values[i];
      snap({
        title: text(`answer[${resolved}] = ${values[i]}`, `answer[${resolved}] = ${values[i]}`),
        line: 11,
        current: i,
        resolved,
        note: text(
          `Pop node ${resolved} khỏi stack vì nó đã có next greater.`,
          `Pop node ${resolved} from the stack because its next greater value is known.`,
        ),
      });
    }

    stack.push(i);
    snap({
      title: text(`Push node ${i} vào stack`, `Push node ${i} onto the stack`),
      line: 12,
      current: i,
      note: text(
        `Node ${i} chờ một node lớn hơn xuất hiện ở phía sau. Stack vẫn giảm dần theo value.`,
        `Node ${i} waits for a greater node later in the list. The stack remains decreasing by value.`,
      ),
    });
  }

  snap({
    title: text(`Return ${answerLabel()}`, `Return ${answerLabel()}`),
    line: 13,
    final: true,
    note: stack.length
      ? text(
          `Các node còn lại trong stack [${stack.join(", ")}] không có node lớn hơn ở bên phải nên giữ 0.`,
          `Nodes still in the stack [${stack.join(", ")}] have no greater node to the right, so they keep 0.`,
        )
      : text("Mọi node đều đã được giải quyết.", "Every node has been resolved."),
  });

  return { original: values, answer, steps };
}

function longestWPI(nums) {
  const prefix = [0];
  nums.forEach((h) => prefix.push(prefix.at(-1) + (h > 8 ? 1 : -1)));
  const stack = [];
  for (let i = 0; i < prefix.length; i++) if (!stack.length || prefix[i] < prefix[stack.at(-1)]) stack.push(i);
  let ans = 0;
  for (let j = prefix.length - 1; j >= 0; j--) while (stack.length && prefix[j] > prefix[stack.at(-1)]) ans = Math.max(ans, j - stack.pop());
  return ans;
}

function mctFromLeafValues(nums) {
  const stack = [Infinity];
  let cost = 0;
  nums.forEach((value) => {
    while (stack.at(-1) <= value) {
      const mid = stack.pop();
      cost += mid * Math.min(stack.at(-1), value);
    }
    stack.push(value);
  });
  while (stack.length > 2) cost += stack.pop() * stack.at(-1);
  return cost;
}

function countSubmatrices(input) {
  const mat = parseMatrix(input);
  const cols = mat[0].length;
  const heights = Array(cols).fill(0);
  let ans = 0;
  for (const row of mat) {
    for (let c = 0; c < cols; c++) heights[c] = row[c] ? heights[c] + 1 : 0;
    const stack = [];
    let rowSum = 0;
    for (let c = 0; c < cols; c++) {
      let count = 1;
      while (stack.length && stack.at(-1)[0] >= heights[c]) {
        const [h, span] = stack.pop();
        rowSum -= h * span;
        count += span;
      }
      stack.push([heights[c], count]);
      rowSum += heights[c] * count;
      ans += rowSum;
    }
  }
  return { original: mat.flat(), answer: ans, steps: genericSteps({ nums: mat.flat(), title: text("Đếm submatrix toàn 1", "Count all-ones submatrices"), answer: ans, note: text("Mỗi hàng biến thành histogram; stack tăng tính số rectangle kết thúc tại cột hiện tại.", "Each row becomes a histogram; an increasing stack counts rectangles ending at the current column.") }) };
}

function findLengthOfShortestSubarray(nums) {
  let right = nums.length - 1;
  while (right > 0 && nums[right - 1] <= nums[right]) right--;
  let ans = right;
  for (let left = 0; left < nums.length; left++) {
    if (left > 0 && nums[left - 1] > nums[left]) break;
    while (right < nums.length && nums[left] > nums[right]) right++;
    ans = Math.min(ans, right - left - 1);
  }
  return ans;
}

function mostCompetitive(nums, params = {}) {
  const k = Number(params.k ?? 2);
  const stack = [];
  nums.forEach((num, i) => {
    while (stack.length && stack.at(-1) > num && stack.length - 1 + nums.length - i >= k) stack.pop();
    if (stack.length < k) stack.push(num);
  });
  return stack;
}

function maxSumMinProduct(nums) {
  const prefix = [0];
  nums.forEach((num) => prefix.push(prefix.at(-1) + num));
  const stack = [];
  let best = 0;
  for (let i = 0; i <= nums.length; i++) {
    const cur = i === nums.length ? 0 : nums[i];
    while (stack.length && nums[stack.at(-1)] > cur) {
      const mid = stack.pop();
      const left = stack.length ? stack.at(-1) + 1 : 0;
      best = Math.max(best, nums[mid] * (prefix[i] - prefix[left]));
    }
    stack.push(i);
  }
  return best;
}

function subArrayRanges(nums) {
  const sum = (sign) => {
    const stack = [];
    let ans = 0;
    for (let i = 0; i <= nums.length; i++) {
      const cur = i === nums.length ? sign * Infinity : nums[i];
      while (stack.length && (sign === 1 ? nums[stack.at(-1)] < cur : nums[stack.at(-1)] > cur)) {
        const mid = stack.pop();
        const left = stack.length ? stack.at(-1) : -1;
        ans += nums[mid] * (mid - left) * (i - mid);
      }
      stack.push(i);
    }
    return ans;
  };
  return sum(1) - sum(-1);
}

function totalSteps(nums) {
  const stack = [];
  let ans = 0;
  nums.forEach((num) => {
    let days = 0;
    while (stack.length && stack.at(-1)[0] <= num) days = Math.max(days, stack.pop()[1]);
    days = stack.length ? days + 1 : 0;
    ans = Math.max(ans, days);
    stack.push([num, days]);
  });
  return ans;
}

function removeNodes(nums) {
  const stack = [];
  nums.forEach((num) => {
    while (stack.length && stack.at(-1) < num) stack.pop();
    stack.push(num);
  });
  return stack;
}

function beautifulTowers(nums) {
  const n = nums.length;
  const calc = (arr) => {
    const res = Array(n).fill(0), stack = [];
    let sum = 0;
    for (let i = 0; i < n; i++) {
      let count = 1;
      while (stack.length && stack.at(-1)[0] > arr[i]) {
        const [h, c] = stack.pop();
        sum -= h * c;
        count += c;
      }
      stack.push([arr[i], count]);
      sum += arr[i] * count;
      res[i] = sum;
    }
    return res;
  };
  const left = calc(nums), right = calc([...nums].reverse()).reverse();
  return Math.max(...nums.map((height, i) => left[i] + right[i] - height));
}

function maxChunksII(nums) {
  const stack = [];
  nums.forEach((num) => {
    let mx = num;
    while (stack.length && stack.at(-1) > num) mx = Math.max(mx, stack.pop());
    stack.push(mx);
  });
  return stack.length;
}

function oddEvenJump(nums) {
  const n = nums.length;
  const next = (order) => {
    const ans = Array(n).fill(-1), stack = [];
    order.forEach((i) => {
      while (stack.length && i > stack.at(-1)) ans[stack.pop()] = i;
      stack.push(i);
    });
    return ans;
  };
  const oddNext = next([...Array(n).keys()].sort((a, b) => nums[a] - nums[b] || a - b));
  const evenNext = next([...Array(n).keys()].sort((a, b) => nums[b] - nums[a] || a - b));
  const odd = Array(n).fill(false), even = Array(n).fill(false);
  odd[n - 1] = even[n - 1] = true;
  for (let i = n - 2; i >= 0; i--) {
    if (oddNext[i] !== -1) odd[i] = even[oddNext[i]];
    if (evenNext[i] !== -1) even[i] = odd[evenNext[i]];
  }
  return odd.filter(Boolean).length;
}

function minIncrementsTarget(nums) {
  let ans = nums[0] || 0;
  for (let i = 1; i < nums.length; i++) if (nums[i] > nums[i - 1]) ans += nums[i] - nums[i - 1];
  return ans;
}

function carFleetII(input) {
  const cars = parsePairs(input, "cars");
  const ans = Array(cars.length).fill(-1), stack = [];
  for (let i = cars.length - 1; i >= 0; i--) {
    const [p, s] = cars[i];
    while (stack.length) {
      const j = stack.at(-1);
      const [p2, s2] = cars[j];
      const t = (p2 - p) / (s - s2);
      if (s <= s2 || (ans[j] > 0 && t >= ans[j])) stack.pop();
      else break;
    }
    if (stack.length) {
      const j = stack.at(-1);
      ans[i] = (cars[j][0] - p) / (s - cars[j][1]);
    }
    stack.push(i);
  }
  return ans.map((v) => v < 0 ? -1 : Number(v.toFixed(5)));
}

function maximumScore(nums, params = {}) {
  const k = Number(params.k ?? 3);
  let left = k, right = k, minVal = nums[k], ans = nums[k];
  while (left > 0 || right < nums.length - 1) {
    if (left === 0 || (right < nums.length - 1 && nums[right + 1] > nums[left - 1])) right++;
    else left--;
    minVal = Math.min(minVal, nums[left], nums[right]);
    ans = Math.max(ans, minVal * (right - left + 1));
  }
  return ans;
}

function canSeePersonsCount(nums) {
  const ans = Array(nums.length).fill(0), stack = [];
  for (let i = nums.length - 1; i >= 0; i--) {
    while (stack.length && nums[i] > stack.at(-1)) {
      ans[i]++;
      stack.pop();
    }
    if (stack.length) ans[i]++;
    stack.push(nums[i]);
  }
  return ans;
}

function validSubarraySize(nums, params = {}) {
  const threshold = Number(params.threshold ?? 6);
  const stack = [];
  for (let i = 0; i <= nums.length; i++) {
    const cur = i === nums.length ? 0 : nums[i];
    while (stack.length && nums[stack.at(-1)] > cur) {
      const mid = stack.pop();
      const left = stack.length ? stack.at(-1) : -1;
      const len = i - left - 1;
      if (nums[mid] > threshold / len) return len;
    }
    stack.push(i);
  }
  return -1;
}

function secondGreater(nums) {
  const first = [], second = [], ans = Array(nums.length).fill(-1);
  nums.forEach((num, i) => {
    while (second.length && nums[second.at(-1)] < num) ans[second.pop()] = num;
    const moved = [];
    while (first.length && nums[first.at(-1)] < num) moved.push(first.pop());
    while (moved.length) second.push(moved.pop());
    first.push(i);
  });
  return ans;
}

function maxSubsequenceNumber(nums, k) {
  const drop = nums.length - k, stack = [];
  let remain = drop;
  nums.forEach((num) => {
    while (remain && stack.length && stack.at(-1) < num) {
      stack.pop();
      remain--;
    }
    stack.push(num);
  });
  return stack.slice(0, k);
}

function createMaximumNumber(input, params = {}) {
  const nums1 = parseNums(input, "nums1");
  const nums2 = parseNums(params.nums2 ?? "9,1,2,5,8,3", "nums2");
  const k = Number(params.k ?? 5);
  const greater = (a, i, b, j) => {
    while (i < a.length && j < b.length && a[i] === b[j]) { i++; j++; }
    return j === b.length || (i < a.length && a[i] > b[j]);
  };
  const merge = (a, b) => {
    const out = [];
    let i = 0, j = 0;
    while (i < a.length || j < b.length) out.push(greater(a, i, b, j) ? a[i++] : b[j++]);
    return out;
  };
  let best = [];
  for (let i = Math.max(0, k - nums2.length); i <= Math.min(k, nums1.length); i++) {
    const candidate = merge(maxSubsequenceNumber(nums1, i), maxSubsequenceNumber(nums2, k - i));
    if (greater(candidate, 0, best, 0)) best = candidate;
  }
  return { original: nums1, answer: best, steps: genericSteps({ nums: nums1, title: text("Tạo số lớn nhất", "Create maximum number"), answer: best, note: text("Dùng monotonic stack để lấy subsequence lớn nhất từ từng mảng rồi merge tham lam.", "Use monotonic stacks to pick best subsequences from both arrays, then greedily merge.") }) };
}

function buildSteps321(input, params = {}) {
  const nums1 = parseNums(input, "nums1");
  const nums2 = parseNums(params.nums2 ?? "9,1,2,5,8,3", "nums2");
  const k = Number(params.k ?? 5);
  if (!Number.isInteger(k) || k < 1 || k > nums1.length + nums2.length) {
    throw new Error("k must be between 1 and nums1.length + nums2.length.");
  }
  if (nums1.length + nums2.length > 14) {
    throw new Error("Use up to 14 total digits so the visualization stays readable.");
  }

  const combined = [...nums1, ...nums2];
  const sourceSub = [
    ...nums1.map((_, index) => `nums1[${index}]`),
    ...nums2.map((_, index) => `nums2[${index}]`),
  ];
  const steps = [];
  let best = [];
  let activeStack = [];
  let stage = "";
  let currentCandidate = [];

  const labelSeq = (seq) => `[${seq.join(", ")}]`;
  const isGreater = (a, i, b, j) => {
    while (i < a.length && j < b.length && a[i] === b[j]) {
      i++;
      j++;
    }
    return j === b.length || (i < a.length && a[i] > b[j]);
  };
  const status = (extra = []) => [
    { label: "split", value: stage || "-" },
    { label: "stack", value: labelSeq(activeStack) },
    { label: "candidate", value: labelSeq(currentCandidate) },
    { label: "best", value: best.length ? labelSeq(best) : "[]" },
    ...extra,
  ];
  const addStep = ({ title, line, note, highlight = [], mark = [], stack = activeStack, extraStatus = [], final = false }) => {
    steps.push({
      title,
      arr: combined,
      sub: sourceSub,
      highlight,
      mark,
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "nums1", value: labelSeq(nums1) },
        { name: "nums2", value: labelSeq(nums2) },
        { name: "k", value: k },
        { name: "best", value: best.length ? labelSeq(best) : "[]" },
      ],
      note,
      final,
      stackView: {
        title: "Greedy monotonic stack / merge state",
        emptyLabel: "empty",
        input: combined,
        inputLabel: "nums1 followed by nums2",
        current: highlight.length ? highlight[0] : -1,
        expected: stack.length ? stack.at(-1) : "",
        items: stack.map((value, index) => ({ value, detail: `pos ${index}` })),
        status: status(extraStatus),
      },
    });
  };

  const pickMax = (nums, size, label, offset) => {
    const dropStart = nums.length - size;
    let drop = dropStart;
    const stack = [];
    activeStack = stack;
    addStep({
      title: text(`Chọn ${size} digit tốt nhất từ ${label}`, `Pick best ${size} digit(s) from ${label}`),
      line: [3, 4, 5],
      note: text(
        `Có thể bỏ tối đa ${dropStart} digit. Stack giữ subsequence lớn nhất theo thứ tự.`,
        `We may drop up to ${dropStart} digit(s). The stack keeps the lexicographically largest subsequence in order.`,
      ),
      extraStatus: [{ label: "drop left", value: drop }],
    });

    nums.forEach((digit, index) => {
      addStep({
        title: text(`${label}[${index}] = ${digit}`, `${label}[${index}] = ${digit}`),
        line: 6,
        highlight: [offset + index],
        stack,
        note: text(
          `Digit hiện tại có thể đẩy các digit nhỏ hơn phía trước ra khỏi stack nếu vẫn còn quyền bỏ.`,
          `The current digit can remove smaller previous digits if we still have drops left.`,
        ),
        extraStatus: [{ label: "drop left", value: drop }],
      });
      while (drop > 0 && stack.length && stack.at(-1) < digit) {
        const removed = stack.at(-1);
        addStep({
          title: text(`${removed} < ${digit} và còn drop`, `${removed} < ${digit} and drops remain`),
          line: 7,
          highlight: [offset + index],
          stack,
          note: text(
            `Pop ${removed}: bỏ digit nhỏ hơn bên trái giúp số tạo ra lớn hơn.`,
            `Pop ${removed}: removing the smaller left digit makes the final number larger.`,
          ),
          extraStatus: [{ label: "drop left", value: drop }],
        });
        stack.pop();
        drop--;
        addStep({
          title: text(`pop ${removed}, drop còn ${drop}`, `pop ${removed}, drop left ${drop}`),
          line: 8,
          highlight: [offset + index],
          stack,
          note: text(
            `Sau khi pop, thử tiếp với đỉnh stack mới.`,
            `After popping, compare the current digit with the new stack top.`,
          ),
          extraStatus: [{ label: "drop left", value: drop }],
        });
      }
      stack.push(digit);
      addStep({
        title: text(`Push ${digit}`, `Push ${digit}`),
        line: 9,
        highlight: [offset + index],
        stack,
        note: text(
          `Giữ ${digit} trong subsequence ứng viên của ${label}.`,
          `Keep ${digit} in ${label}'s candidate subsequence.`,
        ),
        extraStatus: [{ label: "drop left", value: drop }],
      });
    });

    const picked = stack.slice(0, size);
    activeStack = picked;
    addStep({
      title: text(`${label} chọn ${labelSeq(picked)}`, `${label} picks ${labelSeq(picked)}`),
      line: 10,
      stack: picked,
      note: text(
        `Nếu stack còn dài, chỉ lấy ${size} digit đầu vì subsequence cần đúng độ dài.`,
        `If the stack is longer, keep only the first ${size} digit(s) because the subsequence needs the exact length.`,
      ),
      extraStatus: [{ label: `${label} pick`, value: labelSeq(picked) }],
    });
    return picked;
  };

  const merge = (left, right) => {
    const result = [];
    let i = 0;
    let j = 0;
    currentCandidate = result;
    activeStack = [];
    addStep({
      title: text(`Merge ${labelSeq(left)} và ${labelSeq(right)}`, `Merge ${labelSeq(left)} and ${labelSeq(right)}`),
      line: [14, 15, 16],
      note: text(
        `Mỗi bước chọn suffix còn lại lớn hơn theo thứ tự từ điển.`,
        `At each step, choose the lexicographically larger remaining suffix.`,
      ),
      extraStatus: [{ label: "left", value: labelSeq(left) }, { label: "right", value: labelSeq(right) }],
    });
    while (i < left.length || j < right.length) {
      const takeLeft = isGreater(left, i, right, j);
      const digit = takeLeft ? left[i++] : right[j++];
      result.push(digit);
      activeStack = [...result];
      addStep({
        title: text(`Lấy ${digit} từ ${takeLeft ? "nums1-pick" : "nums2-pick"}`, `Take ${digit} from ${takeLeft ? "nums1-pick" : "nums2-pick"}`),
        line: takeLeft ? [17, 18, 19, 20] : [17, 21, 22, 23],
        stack: result,
        note: text(
          takeLeft
            ? `Suffix bên trái lớn hơn hoặc hòa nhưng tốt hơn, nên lấy digit bên trái.`
            : `Suffix bên phải lớn hơn, nên lấy digit bên phải.`,
          takeLeft
            ? `The left suffix is larger or wins the tie, so take from the left.`
            : `The right suffix is larger, so take from the right.`,
        ),
        extraStatus: [{ label: "merged", value: labelSeq(result) }],
      });
    }
    addStep({
      title: text(`Candidate = ${labelSeq(result)}`, `Candidate = ${labelSeq(result)}`),
      line: 24,
      stack: result,
      note: text(
        `Đây là số tốt nhất cho cách chia digit hiện tại.`,
        `This is the best number for the current split.`,
      ),
      extraStatus: [{ label: "candidate", value: labelSeq(result) }],
    });
    return result;
  };
  const pickQuiet = (nums, size) => {
    let drop = nums.length - size;
    const stack = [];
    nums.forEach((digit) => {
      while (drop > 0 && stack.length && stack.at(-1) < digit) {
        stack.pop();
        drop--;
      }
      stack.push(digit);
    });
    return stack.slice(0, size);
  };
  const mergeQuiet = (left, right) => {
    const result = [];
    let i = 0;
    let j = 0;
    while (i < left.length || j < right.length) {
      result.push(isGreater(left, i, right, j) ? left[i++] : right[j++]);
    }
    return result;
  };

  const minTake1 = Math.max(0, k - nums2.length);
  const maxTake1 = Math.min(k, nums1.length);
  addStep({
    title: text("Thử mọi cách chia k digit", "Try every split of k digits"),
    line: [25, 26],
    note: text(
      `Lấy i digit từ nums1 và ${k}-i digit từ nums2, với i từ ${minTake1} đến ${maxTake1}.`,
      `Take i digits from nums1 and ${k}-i digits from nums2, with i from ${minTake1} to ${maxTake1}.`,
    ),
  });

  const splitResults = [];
  for (let take1 = minTake1; take1 <= maxTake1; take1++) {
    const take2 = k - take1;
    const leftPick = pickQuiet(nums1, take1);
    const rightPick = pickQuiet(nums2, take2);
    const candidate = mergeQuiet(leftPick, rightPick);
    const improves = isGreater(candidate, 0, best, 0);
    if (improves) best = candidate;
    splitResults.push({ take1, take2, leftPick, rightPick, candidate, improves });
    currentCandidate = candidate;
    activeStack = candidate;
    stage = `nums1:${take1}, nums2:${take2}`;
    addStep({
      title: text(
        `Split ${take1}+${take2}: candidate ${labelSeq(candidate)}`,
        `Split ${take1}+${take2}: candidate ${labelSeq(candidate)}`,
      ),
      line: [26, 27, 28],
      stack: candidate,
      note: text(
        improves
          ? `Candidate này tốt hơn best hiện tại, nên tạm giữ làm best.`
          : `Candidate này không vượt qua best hiện tại.`,
        improves
          ? `This candidate beats the current best, so keep it as best for now.`
          : `This candidate does not beat the current best.`,
      ),
      extraStatus: [
        { label: "nums1 pick", value: labelSeq(leftPick) },
        { label: "nums2 pick", value: labelSeq(rightPick) },
        { label: "candidate", value: labelSeq(candidate) },
      ],
    });
  }

  const winning = splitResults.find((item) => item.candidate.length === best.length && item.candidate.every((digit, index) => digit === best[index])) || splitResults.at(-1);
  stage = `nums1:${winning.take1}, nums2:${winning.take2}`;
  currentCandidate = [];
  activeStack = [];
  addStep({
    title: text("Bung chi tiết split thắng", "Zoom into the winning split"),
    line: 26,
    note: text(
      `Split thắng là lấy ${winning.take1} digit từ nums1 và ${winning.take2} digit từ nums2.`,
      `The winning split takes ${winning.take1} digit(s) from nums1 and ${winning.take2} digit(s) from nums2.`,
    ),
    extraStatus: [{ label: "winning split", value: stage }],
  });
  const leftPick = pickMax(nums1, winning.take1, "nums1", 0);
  const rightPick = pickMax(nums2, winning.take2, "nums2", nums1.length);
  const candidate = merge(leftPick, rightPick);
  currentCandidate = candidate;
  activeStack = candidate;
  addStep({
    title: text(`${labelSeq(candidate)} là best cuối cùng`, `${labelSeq(candidate)} is the final best`),
    line: [27, 28],
    stack: candidate,
    note: text(
      `Candidate của split thắng khớp best sau khi so tất cả split.`,
      `The winning split's candidate matches the best after comparing every split.`,
    ),
    extraStatus: [{ label: "candidate", value: labelSeq(candidate) }],
  });

  currentCandidate = best;
  activeStack = best;
  addStep({
    title: text(`Return ${labelSeq(best)}`, `Return ${labelSeq(best)}`),
    line: 28,
    stack: best,
    final: true,
    note: text(
      `Sau khi thử mọi split hợp lệ, best là số lớn nhất độ dài ${k}.`,
      `After all valid splits, best is the largest number of length ${k}.`,
    ),
    extraStatus: [{ label: "answer", value: labelSeq(best) }],
  });

  return { original: { nums1, nums2, k }, answer: best, steps };
}

function smallestSubsequenceWithLetter(input, params = {}) {
  const s = String(input ?? "leet");
  const k = Number(params.k ?? 3);
  const letter = String(params.letter ?? "e")[0] || "e";
  const repetition = Number(params.repetition ?? 1);
  let remainLetter = [...s].filter((ch) => ch === letter).length;
  let needLetter = repetition;
  const stack = [];
  [...s].forEach((ch, i) => {
    while (stack.length && stack.at(-1) > ch && stack.length - 1 + s.length - i >= k && (stack.at(-1) !== letter || remainLetter > needLetter)) {
      if (stack.pop() === letter) needLetter++;
    }
    if (stack.length < k) {
      if (ch === letter) {
        stack.push(ch);
        needLetter--;
      } else if (k - stack.length > needLetter) stack.push(ch);
    }
    if (ch === letter) remainLetter--;
  });
  return stack.join("");
}

function totalStrength(nums) {
  let ans = 0;
  for (let i = 0; i < nums.length; i++) {
    let mn = Infinity, sum = 0;
    for (let j = i; j < nums.length; j++) {
      mn = Math.min(mn, nums[j]);
      sum += nums[j];
      ans += mn * sum;
    }
  }
  return ans;
}

function minimumVisitedCells(input) {
  const grid = parseMatrix(input);
  const rows = grid.length, cols = grid[0].length;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const queue = [[0, 0]];
  dist[0][0] = 1;
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    const jump = grid[r][c];
    for (let nc = c + 1; nc <= Math.min(cols - 1, c + jump); nc++) {
      if (dist[r][nc] === Infinity) {
        dist[r][nc] = dist[r][c] + 1;
        queue.push([r, nc]);
      }
    }
    for (let nr = r + 1; nr <= Math.min(rows - 1, r + jump); nr++) {
      if (dist[nr][c] === Infinity) {
        dist[nr][c] = dist[r][c] + 1;
        queue.push([nr, c]);
      }
    }
  }
  const answer = dist[rows - 1][cols - 1];
  return { original: grid.flat(), answer: answer === Infinity ? -1 : answer, steps: genericSteps({ nums: grid.flat(), title: text("Minimum visited cells", "Minimum visited cells"), answer: answer === Infinity ? -1 : answer, note: text("Với input nhỏ, BFS thử các bước nhảy sang phải/xuống; bản tối ưu dùng cấu trúc đơn điệu để bỏ ô đã xử lý.", "For small input, BFS tries right/down jumps; the optimized version uses monotonic structures to skip processed cells.") }) };
}

function maximumSumQueries(input, params = {}) {
  const nums1 = parseNums(input, "nums1");
  const nums2 = parseNums(params.nums2 ?? "2,3,4,5", "nums2");
  const queries = parsePairs(params.queries ?? "4,1;1,3;2,5", "queries");
  const answer = queries.map(([x, y]) => {
    let best = -1;
    for (let i = 0; i < nums1.length; i++) if (nums1[i] >= x && nums2[i] >= y) best = Math.max(best, nums1[i] + nums2[i]);
    return best;
  });
  return { original: nums1, answer, steps: genericSteps({ nums: nums1, title: text("Maximum sum queries", "Maximum sum queries"), answer, note: text("Bản tối ưu sort query và dùng stack đơn điệu trên các điểm Pareto.", "The optimized solution sorts queries and maintains a monotonic stack of Pareto-best points.") }) };
}

function primeScore(num) {
  let x = num, count = 0;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      count++;
      while (x % p === 0) x /= p;
    }
  }
  if (x > 1) count++;
  return count;
}

function maximumScoreAfterOperations(nums, params = {}) {
  let k = Number(params.k ?? 2);
  const scores = nums.map(primeScore);
  const left = Array(nums.length).fill(-1), right = Array(nums.length).fill(nums.length), stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && scores[stack.at(-1)] < scores[i]) right[stack.pop()] = i;
    left[i] = stack.length ? stack.at(-1) : -1;
    stack.push(i);
  }
  const order = [...Array(nums.length).keys()].sort((a, b) => nums[b] - nums[a]);
  let ans = 1;
  for (const i of order) {
    const count = (i - left[i]) * (right[i] - i);
    const take = Math.min(k, count);
    ans *= nums[i] ** take;
    k -= take;
    if (k === 0) break;
  }
  return ans;
}

function leftmostBuildingQueries(input, params = {}) {
  const heights = parseNums(input, "heights");
  const queries = parsePairs(params.queries ?? "0,1;0,2;2,4", "queries");
  const answer = queries.map(([a, b]) => {
    if (a > b) [a, b] = [b, a];
    if (a === b || heights[a] < heights[b]) return b;
    for (let i = b + 1; i < heights.length; i++) if (heights[i] > heights[a]) return i;
    return -1;
  });
  return { original: heights, answer, steps: genericSteps({ nums: heights, title: text("Leftmost meeting buildings", "Leftmost meeting buildings"), answer, note: text("Bản tối ưu xử lý query offline bằng stack giảm dần các tòa nhà ứng viên.", "The optimized solution processes queries offline with a decreasing stack of candidate buildings.") }) };
}

function maxNonDecreasingLength(nums) {
  const n = nums.length;
  const prefix = [0];
  nums.forEach((num) => prefix.push(prefix.at(-1) + num));
  const dp = Array.from({ length: n + 1 }, () => new Map());
  dp[0].set(0, 0);
  for (let end = 1; end <= n; end++) {
    for (let start = 0; start < end; start++) {
      const sum = prefix[end] - prefix[start];
      for (const [last, count] of dp[start]) {
        if (sum >= Number(last)) dp[end].set(sum, Math.max(dp[end].get(sum) || 0, count + 1));
      }
    }
  }
  return Math.max(...dp[n].values());
}

function oceanView(nums) {
  const ans = [];
  let tallest = -Infinity;
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] > tallest) ans.push(i);
    tallest = Math.max(tallest, nums[i]);
  }
  return ans.reverse();
}

function maximumOfMinimums(nums) {
  const n = nums.length, ans = Array(n).fill(0), left = Array(n).fill(-1), right = Array(n).fill(n), stack = [];
  for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack.at(-1)] >= nums[i]) right[stack.pop()] = i;
    left[i] = stack.length ? stack.at(-1) : -1;
    stack.push(i);
  }
  for (let i = 0; i < n; i++) ans[right[i] - left[i] - 2] = Math.max(ans[right[i] - left[i] - 2], nums[i]);
  for (let i = n - 2; i >= 0; i--) ans[i] = Math.max(ans[i], ans[i + 1]);
  return ans;
}

function visiblePeopleGrid(input) {
  const grid = parseMatrix(input);
  const rows = grid.length, cols = grid[0].length;
  const ans = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    const stack = [];
    for (let c = cols - 1; c >= 0; c--) {
      while (stack.length && grid[r][c] > stack.at(-1)) { ans[r][c]++; stack.pop(); }
      if (stack.length) ans[r][c]++;
      stack.push(grid[r][c]);
    }
  }
  for (let c = 0; c < cols; c++) {
    const stack = [];
    for (let r = rows - 1; r >= 0; r--) {
      while (stack.length && grid[r][c] > stack.at(-1)) { ans[r][c]++; stack.pop(); }
      if (stack.length) ans[r][c]++;
      stack.push(grid[r][c]);
    }
  }
  return { original: grid.flat(), answer: ans.flat(), steps: genericSteps({ nums: grid.flat(), title: text("Visible people grid", "Visible people grid"), answer: ans.flat(), note: text("Áp dụng logic visible people bằng stack cho từng hàng và từng cột.", "Apply visible-people stack logic to every row and column.") }) };
}

function jumpGameVIII(nums) {
  return nums.length <= 1 ? 0 : "optimized monotonic graph DP";
}

function visibleMountains(input) {
  const peaks = parsePairs(input, "peaks");
  let count = 0;
  peaks.forEach(([x, y], i) => {
    const covered = peaks.some(([a, b], j) => j !== i && Math.abs(x - a) + y <= b);
    if (!covered) count++;
  });
  return { original: peaks.flat(), answer: count, steps: genericSteps({ nums: peaks.map((p) => p[1]), title: text("Visible mountains", "Visible mountains"), answer: count, note: text("Biến mỗi núi thành interval [x-y, x+y]; stack/sort loại interval bị che.", "Convert each mountain to [x-y, x+y]; sorting plus stack removes covered intervals.") }) };
}

function maximumLengthSemiDecreasing(nums) {
  const stack = [];
  for (let i = 0; i < nums.length; i++) if (!stack.length || nums[i] > nums[stack.at(-1)]) stack.push(i);
  let ans = 0;
  for (let j = nums.length - 1; j >= 0; j--) while (stack.length && nums[stack.at(-1)] > nums[j]) ans = Math.max(ans, j - stack.pop() + 1);
  return ans;
}

function maximalRangeMaximum(nums) {
  const n = nums.length, ans = Array(n).fill(0), stack = [];
  for (let i = 0; i <= n; i++) {
    const cur = i === n ? Infinity : nums[i];
    while (stack.length && nums[stack.at(-1)] < cur) {
      const mid = stack.pop();
      const left = stack.length ? stack.at(-1) : -1;
      ans[mid] = i - left - 1;
    }
    stack.push(i);
  }
  return ans;
}

function validSubarrays(nums) {
  const stack = [];
  let ans = 0;
  for (const num of nums) {
    while (stack.length && stack.at(-1) > num) stack.pop();
    stack.push(num);
    ans += stack.length;
  }
  return ans;
}

function maximumBooks(nums) {
  let best = 0;
  for (let r = 0; r < nums.length; r++) {
    let take = nums[r], sum = 0;
    for (let l = r; l >= 0 && take > 0; l--) {
      take = Math.min(take, nums[l]);
      sum += take;
      take--;
    }
    best = Math.max(best, sum);
  }
  return best;
}

function simpleProblem({ id, difficulty, slug, name, viName, statement, defaultInput, inputKind = "string", inputLabel = null, tags = [arrayTag, monoTag], premium = false, solver, extraParams = [], complexity = null }) {
  return {
    id,
    difficulty,
    slug,
    premium,
    category,
    tags: premium ? [...tags, premiumTag] : tags,
    title: text(name),
    titleVi: text(viName || name, name),
    statement: text(statement.vi, statement.en),
    defaultInput,
    inputKind,
    inputLabel: inputLabel || text("nums (cách bởi ,)", "nums (comma separated)"),
    extraParams,
    approach: [
      text("Chọn hướng stack tăng/giảm theo câu hỏi: next greater, next smaller, hoặc span/range.", "Choose an increasing/decreasing stack based on the question: next greater, next smaller, or span/range."),
      text("Khi phần tử hiện tại phá tính đơn điệu, pop các phần tử đã tìm được biên/kết quả.", "When the current element breaks monotonicity, pop entries whose boundary/result is now known."),
    ],
    complexity: complexity || { time: "O(n)", space: "O(n)", note: text("Mỗi phần tử được push và pop nhiều nhất một lần.", "Each element is pushed and popped at most once.") },
    code: [
      "# Monotonic stack template used by this visualization",
      "stack = []",
      "for i, value in enumerate(nums):",
      "    while stack and current_value_resolves(stack[-1], value):",
      "        resolve(stack.pop(), value)",
      "    stack.append(i)",
      "return answer",
    ],
    builder: solver,
  };
}

module.exports = {
  1475: simpleProblem({ id: 1475, difficulty: "easy", slug: "final-prices-with-a-special-discount-in-a-shop", name: "Final Prices With a Special Discount in a Shop", viName: "Giá cuối cùng sau giảm giá", statement: text("Với mỗi giá, trừ đi giá đầu tiên bên phải nhỏ hơn hoặc bằng nó.", "For each price, subtract the first price to its right that is less than or equal to it."), defaultInput: "8,4,6,2,3", solver: arrayBuilder(finalPrices) }),
  316: simpleProblem({ id: 316, difficulty: "medium", slug: "remove-duplicate-letters", name: "Remove Duplicate Letters", viName: "Xóa chữ trùng để nhỏ nhất", statement: text("Xóa ký tự trùng để mỗi ký tự xuất hiện một lần và kết quả nhỏ nhất theo thứ tự từ điển.", "Remove duplicate letters so every letter appears once and the result is lexicographically smallest."), defaultInput: "cbacdcbc", inputKind: "string", inputLabel: text("s", "s"), tags: [stringTag, monoTag], solver: (input) => { const answer = removeDuplicateLetters(input); return { original: String(input ?? ""), answer, steps: genericSteps({ nums: [...String(input ?? "")].map((_, i) => i), title: text(`answer = ${answer}`, `answer = ${answer}`), answer, note: text("Stack giữ chuỗi tăng theo từ điển, chỉ pop khi ký tự đó còn xuất hiện phía sau.", "The stack keeps a lexicographically small sequence and pops only when that character appears again later.") }) }; } }),
  456: simpleProblem({ id: 456, difficulty: "medium", slug: "132-pattern", name: "132 Pattern", viName: "Mẫu 132", statement: text("Kiểm tra có i < j < k sao cho nums[i] < nums[k] < nums[j].", "Check whether i < j < k exists with nums[i] < nums[k] < nums[j]."), defaultInput: "3,1,4,2", solver: arrayBuilder(pattern132) }),
  581: simpleProblem({ id: 581, difficulty: "medium", slug: "shortest-unsorted-continuous-subarray", name: "Shortest Unsorted Continuous Subarray", viName: "Subarray ngắn nhất cần sort", statement: text("Tìm độ dài đoạn liên tục ngắn nhất cần sort để cả mảng tăng dần.", "Find the shortest continuous segment that must be sorted so the whole array becomes nondecreasing."), defaultInput: "2,6,4,8,10,9,15", solver: arrayBuilder(shortestUnsorted) }),
  654: simpleProblem({ id: 654, difficulty: "medium", slug: "maximum-binary-tree", name: "Maximum Binary Tree", viName: "Cây nhị phân maximum", statement: text("Dựng Maximum Binary Tree từ mảng distinct.", "Construct the Maximum Binary Tree from a distinct array."), defaultInput: "3,2,1,6,0,5", tags: [arrayTag, treeTag, monoTag], solver: arrayBuilder(maxBinaryTree, (nums, answer) => text(`Root của cây là ${answer}.`, `The tree root is ${answer}.`)) }),
  769: simpleProblem({ id: 769, difficulty: "medium", slug: "max-chunks-to-make-sorted", name: "Max Chunks To Make Sorted", viName: "Số chunk tối đa để sort", statement: text("Chia permutation thành nhiều chunk nhất để sort từng chunk rồi ghép lại thành sorted.", "Split a permutation into the maximum number of chunks that sort independently into the sorted array."), defaultInput: "1,0,2,3,4", solver: arrayBuilder(maxChunks) }),
  853: simpleProblem({ id: 853, difficulty: "medium", slug: "car-fleet", name: "Car Fleet", viName: "Đoàn xe", statement: text("Đếm số đoàn xe tới target.", "Count how many car fleets reach the target."), defaultInput: "10,2;8,4;0,1;5,1;3,3", inputLabel: text("cars (position,speed; ...)", "cars (position,speed; ...)"), extraParams: [{ key: "target", label: text("target", "target"), default: 12, min: 1 }], solver: (input, params) => { const cars = parsePairs(input); const answer = carFleet(input, params); return { original: cars.flat(), answer, steps: genericSteps({ nums: cars.map((p) => p[0]), title: text("Đếm fleet", "Count fleets"), answer, note: text("Duyệt xe từ gần target về xa; stack thời gian đến giữ các fleet chậm nhất.", "Scan cars from nearest to farthest; arrival times form the fleet stack.") }) }; } }),
  901: simpleProblem({ id: 901, difficulty: "medium", slug: "online-stock-span", name: "Online Stock Span", viName: "Stock span online", statement: text("Mỗi giá mới trả về số ngày liên tiếp gần nhất có giá <= hôm nay.", "For each new price, return consecutive previous days with price <= today."), defaultInput: "100,80,60,70,60,75,85", inputLabel: text("prices", "prices"), solver: stockSpan }),
  907: simpleProblem({ id: 907, difficulty: "medium", slug: "sum-of-subarray-minimums", name: "Sum of Subarray Minimums", viName: "Tổng minimum của mọi subarray", statement: text("Tính tổng min của mọi subarray.", "Return the sum of every subarray's minimum."), defaultInput: "3,1,2,4", solver: arrayBuilder(sumSubarrayMins) }),
  962: simpleProblem({ id: 962, difficulty: "medium", slug: "maximum-width-ramp", name: "Maximum Width Ramp", viName: "Ramp rộng nhất", statement: text("Tìm max j-i sao cho i<j và nums[i] <= nums[j].", "Find max j-i with i<j and nums[i] <= nums[j]."), defaultInput: "6,0,8,2,1,5", solver: arrayBuilder(maxWidthRamp) }),
  1008: simpleProblem({ id: 1008, difficulty: "medium", slug: "construct-binary-search-tree-from-preorder-traversal", name: "Construct BST from Preorder Traversal", viName: "Dựng BST từ preorder", statement: text("Dựng BST từ preorder traversal.", "Construct a BST from preorder traversal."), defaultInput: "8,5,1,7,10,12", tags: [arrayTag, treeTag, monoTag], solver: arrayBuilder(bstPreorder) }),
  1019: {
    id: 1019,
    difficulty: "medium",
    slug: "next-greater-node-in-linked-list",
    category,
    tags: [arrayTag, linkedListTag, monoTag],
    title: text("Next Greater Node In Linked List"),
    titleVi: text("Node lớn hơn kế tiếp trong linked list", "Next greater node in linked list"),
    statement: text(
      "Với mỗi node trong linked list, tìm giá trị node đầu tiên ở bên phải có value lớn hơn. Nếu không có thì trả về 0.",
      "For each node in a linked list, find the first node to its right with a greater value. Return 0 if none exists.",
    ),
    defaultInput: "2,1,5",
    inputKind: "string",
    inputLabel: text("linked list values (cách bởi ,)", "linked list values (comma separated)"),
    extraParams: [],
    approach: [
      text("Copy linked list sang array values để có index.", "Copy the linked list into a values array so we can use indices."),
      text("Stack giữ index của các node chưa tìm thấy node lớn hơn; value trên stack giảm dần.", "The stack stores indices of nodes still waiting for a greater node; stack values are decreasing."),
      text("Khi values[i] lớn hơn node ở đỉnh stack, values[i] là next greater đầu tiên của node đó.", "When values[i] is greater than the stack top node, values[i] is that node's first next greater value."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: text("Mỗi node được copy một lần, push một lần và pop nhiều nhất một lần.", "Each node is copied once, pushed once, and popped at most once."),
    },
    code: [
      "class Solution:",
      "    def nextLargerNodes(self, head):",
      "        values = []",
      "        while head:",
      "            values.append(head.val)",
      "            head = head.next",
      "        answer = [0] * len(values)",
      "        stack = []",
      "        for i, value in enumerate(values):",
      "            while stack and values[stack[-1]] < value:",
      "                answer[stack.pop()] = value",
      "            stack.append(i)",
      "        return answer",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int[] NextLargerNodes(ListNode head) {",
      "        List<int> values = new List<int>();",
      "        while (head != null) {",
      "            values.Add(head.val);",
      "            head = head.next;",
      "        }",
      "        int[] answer = new int[values.Count];",
      "        Stack<int> stack = new Stack<int>();",
      "        for (int i = 0; i < values.Count; i++) {",
      "            while (stack.Count > 0 && values[stack.Peek()] < values[i]) {",
      "                answer[stack.Pop()] = values[i];",
      "            }",
      "            stack.Push(i);",
      "        }",
      "        return answer;",
      "    }",
      "}",
    ],
    liveArgs: (input) => [{ __viz_type: "linked_list", values: parseNums(input, "head") }],
    builder: buildSteps1019,
  },
  1124: simpleProblem({ id: 1124, difficulty: "medium", slug: "longest-well-performing-interval", name: "Longest Well-Performing Interval", viName: "Khoảng làm việc tốt dài nhất", statement: text("Ngày mệt là hours > 8; tìm interval dài nhất có ngày mệt nhiều hơn ngày không mệt.", "A tiring day has hours > 8; find the longest interval with more tiring than non-tiring days."), defaultInput: "9,9,6,0,6,6,9", inputLabel: text("hours", "hours"), solver: arrayBuilder(longestWPI) }),
  1130: simpleProblem({ id: 1130, difficulty: "medium", slug: "minimum-cost-tree-from-leaf-values", name: "Minimum Cost Tree From Leaf Values", viName: "Cây chi phí nhỏ nhất từ leaf", statement: text("Ghép leaf để tổng non-leaf value nhỏ nhất.", "Combine leaves so the sum of non-leaf values is minimized."), defaultInput: "6,2,4", solver: arrayBuilder(mctFromLeafValues) }),
  1504: simpleProblem({ id: 1504, difficulty: "medium", slug: "count-submatrices-with-all-ones", name: "Count Submatrices With All Ones", viName: "Đếm submatrix toàn 1", statement: text("Đếm mọi submatrix chỉ chứa số 1.", "Count all submatrices containing only ones."), defaultInput: "1,0,1;1,1,0;1,1,0", inputLabel: text("mat (hàng cách ;)", "mat (rows separated by ;)"), solver: countSubmatrices }),
  1574: simpleProblem({ id: 1574, difficulty: "medium", slug: "shortest-subarray-to-be-removed-to-make-array-sorted", name: "Shortest Subarray to be Removed to Make Array Sorted", viName: "Xóa subarray ngắn nhất để mảng sorted", statement: text("Xóa một đoạn liên tục ngắn nhất để phần còn lại không giảm.", "Remove the shortest continuous segment so the remaining array is nondecreasing."), defaultInput: "1,2,3,10,4,2,3,5", solver: arrayBuilder(findLengthOfShortestSubarray) }),
  1673: simpleProblem({ id: 1673, difficulty: "medium", slug: "find-the-most-competitive-subsequence", name: "Find the Most Competitive Subsequence", viName: "Subsequence cạnh tranh nhất", statement: text("Tìm subsequence độ dài k nhỏ nhất theo thứ tự từ điển.", "Find the lexicographically smallest subsequence of length k."), defaultInput: "3,5,2,6", extraParams: [{ key: "k", label: text("k", "k"), default: 2, min: 1 }], solver: arrayBuilder(mostCompetitive) }),
  1856: simpleProblem({ id: 1856, difficulty: "medium", slug: "maximum-subarray-min-product", name: "Maximum Subarray Min-Product", viName: "Min-product lớn nhất", statement: text("Tối đa hóa min(subarray) * sum(subarray).", "Maximize min(subarray) * sum(subarray)."), defaultInput: "1,2,3,2", solver: arrayBuilder(maxSumMinProduct) }),
  2104: simpleProblem({ id: 2104, difficulty: "medium", slug: "sum-of-subarray-ranges", name: "Sum of Subarray Ranges", viName: "Tổng range của mọi subarray", statement: text("Tổng (max-min) của mọi subarray.", "Sum max-min over every subarray."), defaultInput: "1,2,3", solver: arrayBuilder(subArrayRanges) }),
  2289: simpleProblem({ id: 2289, difficulty: "medium", slug: "steps-to-make-array-non-decreasing", name: "Steps to Make Array Non-decreasing", viName: "Số bước để mảng không giảm", statement: text("Mỗi bước xóa nums[i] nếu nums[i-1] > nums[i]; trả số bước đến khi ổn định.", "Each step removes nums[i] if nums[i-1] > nums[i]; return steps until stable."), defaultInput: "5,3,4,4,7,3,6,11,8,5,11", solver: arrayBuilder(totalSteps) }),
  2487: simpleProblem({ id: 2487, difficulty: "medium", slug: "remove-nodes-from-linked-list", name: "Remove Nodes From Linked List", viName: "Xóa node có node lớn hơn bên phải", statement: text("Xóa mọi node có node phía sau giá trị lớn hơn.", "Remove every node that has a greater value to its right."), defaultInput: "5,2,13,3,8", tags: [linkedListTag, monoTag], solver: arrayBuilder(removeNodes) }),
  2865: simpleProblem({ id: 2865, difficulty: "medium", slug: "beautiful-towers-i", name: "Beautiful Towers I", viName: "Beautiful Towers I", statement: text("Chọn peak và giảm độ cao hai phía để tổng height lớn nhất.", "Choose a peak and lower both sides to maximize total height."), defaultInput: "5,3,4,1,1", solver: arrayBuilder(beautifulTowers) }),
  2866: simpleProblem({ id: 2866, difficulty: "medium", slug: "beautiful-towers-ii", name: "Beautiful Towers II", viName: "Beautiful Towers II", statement: text("Phiên bản lớn của Beautiful Towers dùng stack/prefix sum.", "Larger Beautiful Towers variant using stack/prefix sums."), defaultInput: "6,5,3,9,2,7", solver: arrayBuilder(beautifulTowers) }),
  768: simpleProblem({ id: 768, difficulty: "hard", slug: "max-chunks-to-make-sorted-ii", name: "Max Chunks To Make Sorted II", viName: "Số chunk tối đa để sort II", statement: text("Chia mảng có duplicate thành nhiều chunk nhất để sort từng chunk rồi ghép lại sorted.", "Split an array with duplicates into the maximum number of chunks that sort independently."), defaultInput: "5,4,3,2,1", solver: arrayBuilder(maxChunksII) }),
  975: simpleProblem({ id: 975, difficulty: "hard", slug: "odd-even-jump", name: "Odd Even Jump", viName: "Nhảy chẵn lẻ", statement: text("Đếm start index có thể tới cuối bằng luật nhảy odd/even.", "Count starting indices that can reach the end using odd/even jump rules."), defaultInput: "10,13,12,14,15", solver: arrayBuilder(oddEvenJump) }),
  1526: simpleProblem({ id: 1526, difficulty: "hard", slug: "minimum-number-of-increments-on-subarrays-to-form-a-target-array", name: "Minimum Number of Increments on Subarrays to Form a Target Array", viName: "Số increment subarray ít nhất", statement: text("Tạo target từ zero array bằng increment subarray ít nhất.", "Form target from a zero array using the fewest subarray increments."), defaultInput: "1,2,3,2,1", solver: arrayBuilder(minIncrementsTarget) }),
  1776: simpleProblem({ id: 1776, difficulty: "hard", slug: "car-fleet-ii", name: "Car Fleet II", viName: "Đoàn xe II", statement: text("Với mỗi xe, tính thời điểm va chạm với xe phía trước.", "For each car, compute when it collides with a car ahead."), defaultInput: "1,2;2,1;4,3;7,2", inputLabel: text("cars (position,speed; ...)", "cars (position,speed; ...)"), solver: (input) => { const cars = parsePairs(input); const answer = carFleetII(input); return { original: cars.flat(), answer, steps: genericSteps({ nums: cars.map((p) => p[0]), title: text("Collision times", "Collision times"), answer, note: text("Stack giữ xe phía trước còn có thể là va chạm đầu tiên.", "The stack keeps front cars that can still be the first collision.") }) }; } }),
  1793: simpleProblem({ id: 1793, difficulty: "hard", slug: "maximum-score-of-a-good-subarray", name: "Maximum Score of a Good Subarray", viName: "Điểm lớn nhất của good subarray", statement: text("Subarray phải chứa k; score = min * length.", "The subarray must contain k; score = min * length."), defaultInput: "1,4,3,7,4,5", extraParams: [{ key: "k", label: text("k", "k"), default: 3, min: 0 }], solver: arrayBuilder(maximumScore) }),
  1944: simpleProblem({ id: 1944, difficulty: "hard", slug: "number-of-visible-people-in-a-queue", name: "Number of Visible People in a Queue", viName: "Số người nhìn thấy trong hàng đợi", statement: text("Với mỗi người, đếm số người bên phải họ nhìn thấy.", "For each person, count visible people to their right."), defaultInput: "10,6,8,5,11,9", solver: arrayBuilder(canSeePersonsCount) }),
  2334: simpleProblem({ id: 2334, difficulty: "hard", slug: "subarray-with-elements-greater-than-varying-threshold", name: "Subarray With Elements Greater Than Varying Threshold", viName: "Subarray vượt threshold biến đổi", statement: text("Tìm size k sao cho mọi phần tử trong subarray > threshold/k.", "Find a size k where every subarray element is greater than threshold/k."), defaultInput: "1,3,4,3,1", extraParams: [{ key: "threshold", label: text("threshold", "threshold"), default: 6, min: 0 }], solver: arrayBuilder(validSubarraySize) }),
  2454: simpleProblem({ id: 2454, difficulty: "hard", slug: "next-greater-element-iv", name: "Next Greater Element IV", viName: "Phần tử lớn hơn thứ hai", statement: text("Với mỗi index, tìm phần tử lớn hơn thứ hai ở bên phải.", "For each index, find the second greater element to its right."), defaultInput: "2,4,0,9,6", solver: arrayBuilder(secondGreater) }),
  321: {
    id: 321,
    difficulty: "hard",
    slug: "create-maximum-number",
    category,
    tags: [arrayTag, monoTag],
    title: text("Create Maximum Number"),
    titleVi: text("Tạo số lớn nhất", "Create maximum number"),
    statement: text(
      "Chọn tổng cộng k digit từ nums1 và nums2 để tạo số lớn nhất. Thứ tự tương đối của digit trong từng mảng phải được giữ nguyên.",
      "Choose k total digits from nums1 and nums2 to create the largest possible number. The relative order of digits from each array must be preserved.",
    ),
    defaultInput: "3,4,6,5",
    inputKind: "string",
    inputLabel: text("nums1 digits", "nums1 digits"),
    extraParams: [
      { key: "nums2", type: "string", label: text("nums2 digits", "nums2 digits"), default: "9,1,2,5,8,3" },
      { key: "k", label: text("k", "k"), default: 5, min: 1 },
    ],
    approach: [
      text("Thử mọi split: lấy i digit từ nums1 và k-i digit từ nums2.", "Try every split: take i digits from nums1 and k-i digits from nums2."),
      text("Với mỗi mảng, dùng monotonic stack để chọn subsequence lớn nhất đúng độ dài.", "For each array, use a monotonic stack to pick the largest subsequence of the exact length."),
      text("Merge hai subsequence bằng cách luôn chọn suffix còn lại lớn hơn theo thứ tự từ điển.", "Merge the two subsequences by always taking from the lexicographically larger remaining suffix."),
    ],
    complexity: {
      time: "O(k(m+n)^2)",
      space: "O(m+n)",
      note: text(
        "Có nhiều cách tối ưu/triển khai khác nhau; visualization dùng input nhỏ để thấy rõ pick + merge + compare.",
        "There are several optimized implementations; this visualization uses small inputs to make pick + merge + compare clear.",
      ),
    },
    code: [
      "class Solution:",
      "    def maxNumber(self, nums1, nums2, k):",
      "        def pick(nums, size):",
      "            drop = len(nums) - size",
      "            stack = []",
      "            for digit in nums:",
      "                while drop and stack and stack[-1] < digit:",
      "                    stack.pop(); drop -= 1",
      "                stack.append(digit)",
      "            return stack[:size]",
      "        def greater(a, i, b, j):",
      "            while i < len(a) and j < len(b) and a[i] == b[j]:",
      "                i += 1; j += 1",
      "            return j == len(b) or (i < len(a) and a[i] > b[j])",
      "        def merge(a, b):",
      "            ans = []",
      "            i = j = 0",
      "            while i < len(a) or j < len(b):",
      "                if greater(a, i, b, j):",
      "                    ans.append(a[i]); i += 1",
      "                else:",
      "                    ans.append(b[j]); j += 1",
      "            return ans",
      "        best = []",
      "        for i in range(max(0, k-len(nums2)), min(k, len(nums1)) + 1):",
      "            candidate = merge(pick(nums1, i), pick(nums2, k-i))",
      "            if greater(candidate, 0, best, 0): best = candidate",
      "        return best",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int[] MaxNumber(int[] nums1, int[] nums2, int k) {",
      "        List<int> best = new List<int>();",
      "        int start = Math.Max(0, k - nums2.Length);",
      "        int end = Math.Min(k, nums1.Length);",
      "        for (int i = start; i <= end; i++) {",
      "            var candidate = Merge(Pick(nums1, i), Pick(nums2, k - i));",
      "            if (Greater(candidate, 0, best, 0)) best = candidate;",
      "        }",
      "        return best.ToArray();",
      "    }",
      "    private List<int> Pick(int[] nums, int size) {",
      "        int drop = nums.Length - size;",
      "        List<int> stack = new List<int>();",
      "        foreach (int digit in nums) {",
      "            while (drop > 0 && stack.Count > 0 && stack[stack.Count - 1] < digit) {",
      "                stack.RemoveAt(stack.Count - 1);",
      "                drop--;",
      "            }",
      "            stack.Add(digit);",
      "        }",
      "        return stack.GetRange(0, size);",
      "    }",
      "    private bool Greater(List<int> a, int i, List<int> b, int j) {",
      "        while (i < a.Count && j < b.Count && a[i] == b[j]) { i++; j++; }",
      "        return j == b.Count || (i < a.Count && a[i] > b[j]);",
      "    }",
      "    private List<int> Merge(List<int> a, List<int> b) {",
      "        List<int> ans = new List<int>();",
      "        int i = 0, j = 0;",
      "        while (i < a.Count || j < b.Count) {",
      "            if (Greater(a, i, b, j)) ans.Add(a[i++]);",
      "            else ans.Add(b[j++]);",
      "        }",
      "        return ans;",
      "    }",
      "}",
    ],
    liveArgs: (input, params) => [parseNums(input, "nums1"), parseNums(params.nums2, "nums2"), Number(params.k)],
    builder: buildSteps321,
  },
  2030: simpleProblem({ id: 2030, difficulty: "hard", slug: "smallest-k-length-subsequence-with-occurrences-of-a-letter", name: "Smallest K-Length Subsequence With Occurrences of a Letter", viName: "Subsequence độ dài k nhỏ nhất có đủ ký tự", statement: text("Tìm subsequence nhỏ nhất độ dài k chứa letter ít nhất repetition lần.", "Find the smallest subsequence of length k containing letter at least repetition times."), defaultInput: "leet", inputKind: "string", inputLabel: text("s", "s"), tags: [stringTag, monoTag], extraParams: [{ key: "k", label: text("k", "k"), default: 3, min: 1 }, { key: "letter", type: "string", label: text("letter", "letter"), default: "e" }, { key: "repetition", label: text("repetition", "repetition"), default: 1, min: 1 }], solver: (input, params) => { const answer = smallestSubsequenceWithLetter(input, params); return { original: String(input ?? ""), answer, steps: genericSteps({ nums: [...String(input ?? "")].map((_, i) => i), title: text(`answer = ${answer}`, `answer = ${answer}`), answer, note: text("Stack tham lam, nhưng luôn giữ đủ chỗ và đủ số lần của letter.", "A greedy stack while reserving enough slots and occurrences for letter.") }) }; } }),
  2281: simpleProblem({ id: 2281, difficulty: "hard", slug: "sum-of-total-strength-of-wizards", name: "Sum of Total Strength of Wizards", viName: "Tổng sức mạnh wizard", statement: text("Tổng min(subarray) * sum(subarray) trên mọi subarray.", "Sum min(subarray) * sum(subarray) over every subarray."), defaultInput: "1,3,1,2", solver: arrayBuilder(totalStrength) }),
  2617: simpleProblem({ id: 2617, difficulty: "hard", slug: "minimum-number-of-visited-cells-in-a-grid", name: "Minimum Number of Visited Cells in a Grid", viName: "Số ô thăm ít nhất trong grid", statement: text("Từ mỗi ô được nhảy sang phải hoặc xuống tối đa grid[r][c] bước.", "From each cell, jump right or down up to grid[r][c] cells."), defaultInput: "3,4,2,1;4,2,3,1;2,1,0,0", inputLabel: text("grid (hàng cách ;)", "grid (rows separated by ;)"), solver: minimumVisitedCells }),
  2736: simpleProblem({ id: 2736, difficulty: "hard", slug: "maximum-sum-queries", name: "Maximum Sum Queries", viName: "Query tổng lớn nhất", statement: text("Với mỗi query [x,y], tìm max nums1[i]+nums2[i] khi nums1[i]>=x và nums2[i]>=y.", "For each query [x,y], maximize nums1[i]+nums2[i] with nums1[i]>=x and nums2[i]>=y."), defaultInput: "4,3,1,2", inputLabel: text("nums1", "nums1"), extraParams: [{ key: "nums2", type: "string", label: text("nums2", "nums2"), default: "2,4,9,5" }, { key: "queries", type: "string", label: text("queries (x,y; ...)", "queries (x,y; ...)"), default: "4,1;1,3;2,5" }], solver: maximumSumQueries }),
  2818: simpleProblem({ id: 2818, difficulty: "hard", slug: "apply-operations-to-maximize-score", name: "Apply Operations to Maximize Score", viName: "Tối đa hóa score bằng thao tác", statement: text("Dùng prime score và số subarray mà mỗi index thống trị để chọn giá trị lớn nhất.", "Use prime score and each index's dominance span to choose the largest values."), defaultInput: "8,3,9,3,8", extraParams: [{ key: "k", label: text("k", "k"), default: 2, min: 1 }], solver: arrayBuilder(maximumScoreAfterOperations) }),
  2940: simpleProblem({ id: 2940, difficulty: "hard", slug: "find-building-where-alice-and-bob-can-meet", name: "Find Building Where Alice and Bob Can Meet", viName: "Tòa nhà Alice và Bob gặp nhau", statement: text("Với mỗi query, tìm tòa nhà trái nhất mà cả hai có thể tới.", "For each query, find the leftmost building both people can reach."), defaultInput: "6,4,8,5,2,7", inputLabel: text("heights", "heights"), extraParams: [{ key: "queries", type: "string", label: text("queries (a,b; ...)", "queries (a,b; ...)"), default: "0,1;0,2;2,4" }], solver: leftmostBuildingQueries }),
  2945: simpleProblem({ id: 2945, difficulty: "hard", slug: "find-maximum-non-decreasing-array-length", name: "Find Maximum Non-decreasing Array Length", viName: "Độ dài mảng không giảm lớn nhất", statement: text("Gộp subarray thành tổng sao cho dãy tổng không giảm và số đoạn là lớn nhất.", "Merge subarrays into sums so the sum sequence is nondecreasing and has maximum length."), defaultInput: "5,2,2", solver: arrayBuilder(maxNonDecreasingLength) }),
  255: simpleProblem({ id: 255, difficulty: "medium", slug: "verify-preorder-sequence-in-binary-search-tree", name: "Verify Preorder Sequence in Binary Search Tree", viName: "Kiểm tra preorder BST", statement: text("Premium: kiểm tra dãy có thể là preorder của BST không.", "Premium: check whether a sequence can be a BST preorder traversal."), defaultInput: "5,2,1,3,6", tags: [arrayTag, treeTag, monoTag], premium: true, solver: arrayBuilder(bstPreorder) }),
  1762: simpleProblem({ id: 1762, difficulty: "medium", slug: "buildings-with-an-ocean-view", name: "Buildings With an Ocean View", viName: "Tòa nhà nhìn ra biển", statement: text("Premium: trả index các tòa nhà cao hơn mọi tòa bên phải.", "Premium: return indices taller than every building to their right."), defaultInput: "4,2,3,1", premium: true, solver: arrayBuilder(oceanView) }),
  1950: simpleProblem({ id: 1950, difficulty: "medium", slug: "maximum-of-minimum-values-in-all-subarrays", name: "Maximum of Minimum Values in All Subarrays", viName: "Maximum của minimum theo độ dài", statement: text("Premium: với mỗi độ dài window, tìm minimum lớn nhất.", "Premium: for every window length, find the maximum among window minimums."), defaultInput: "10,20,50,10,70,30", premium: true, solver: arrayBuilder(maximumOfMinimums) }),
  2282: simpleProblem({ id: 2282, difficulty: "medium", slug: "number-of-people-that-can-be-seen-in-a-grid", name: "Number of People That Can Be Seen in a Grid", viName: "Số người nhìn thấy trong grid", statement: text("Premium: đếm người nhìn thấy sang phải và xuống dưới trong grid.", "Premium: count visible people to the right and downward in a grid."), defaultInput: "3,1,4;2,5,1;6,2,3", inputLabel: text("heights grid", "heights grid"), premium: true, solver: visiblePeopleGrid }),
  2297: simpleProblem({ id: 2297, difficulty: "medium", slug: "jump-game-viii", name: "Jump Game VIII", viName: "Jump Game VIII", statement: text("Premium: bài graph/DP dùng stack đơn điệu để dựng cạnh nhảy hữu ích.", "Premium: graph/DP problem using monotonic stacks to build useful jump edges."), defaultInput: "3,2,4,4,1", premium: true, solver: arrayBuilder(jumpGameVIII) }),
  2345: simpleProblem({ id: 2345, difficulty: "medium", slug: "finding-the-number-of-visible-mountains", name: "Finding the Number of Visible Mountains", viName: "Đếm núi nhìn thấy", statement: text("Premium: đếm núi không bị núi khác che hoàn toàn.", "Premium: count mountains not fully covered by another mountain."), defaultInput: "2,2;6,3;5,4", inputLabel: text("peaks (x,y; ...)", "peaks (x,y; ...)"), premium: true, solver: visibleMountains }),
  2832: simpleProblem({ id: 2832, difficulty: "medium", slug: "maximal-range-that-each-element-is-maximum-in-it", name: "Maximal Range That Each Element Is Maximum in It", viName: "Range lớn nhất mà mỗi phần tử là maximum", statement: text("Premium: với mỗi index, tìm range lớn nhất nơi nó là maximum.", "Premium: for each index, find the largest range where it is the maximum."), defaultInput: "1,5,4,3,6", premium: true, solver: arrayBuilder(maximalRangeMaximum) }),
  2863: simpleProblem({ id: 2863, difficulty: "medium", slug: "maximum-length-of-semi-decreasing-subarrays", name: "Maximum Length of Semi-Decreasing Subarrays", viName: "Subarray semi-decreasing dài nhất", statement: text("Premium: tìm subarray dài nhất có đầu lớn hơn cuối.", "Premium: find the longest subarray whose first value is greater than its last value."), defaultInput: "7,6,5,8,4", premium: true, solver: arrayBuilder(maximumLengthSemiDecreasing) }),
  1063: simpleProblem({ id: 1063, difficulty: "hard", slug: "number-of-valid-subarrays", name: "Number of Valid Subarrays", viName: "Số valid subarray", statement: text("Premium: đếm subarray mà phần tử đầu là minimum của subarray.", "Premium: count subarrays where the first element is the subarray minimum."), defaultInput: "1,4,2,5,3", premium: true, solver: arrayBuilder(validSubarrays) }),
  2355: simpleProblem({ id: 2355, difficulty: "hard", slug: "maximum-number-of-books-you-can-take", name: "Maximum Number of Books You Can Take", viName: "Số sách tối đa có thể lấy", statement: text("Premium: chọn đoạn sách, mỗi bước sang trái lấy ít hơn ít nhất 1 quyển.", "Premium: choose a book segment where moving left takes at least one fewer book each shelf."), defaultInput: "8,5,2,7,9", premium: true, solver: arrayBuilder(maximumBooks) }),
};
