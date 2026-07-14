// LeetCode Visualizer — Heap / Priority Queue problems.
// A heap is stored as an array; node i has children 2i+1, 2i+2 and parent floor((i-1)/2).
// We render it as a binary tree so the heap property is easy to see.

const HEAP_CAT = { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" };

// Build tree-view nodes from a heap array.
// heap: array of elements. labelFn(el) → string shown in the node.
// hlSet / markSet: Sets of ARRAY INDICES to highlight (amber) / mark (green ring).
function heapTree(heap, labelFn, hlSet, markSet) {
  const nodes = [];
  let nextX = 0;
  function dfs(i, depth) {
    if (i >= heap.length) return;
    dfs(2 * i + 1, depth + 1);
    const x = nextX++;
    nodes.push({
      id: i,
      label: labelFn(heap[i]),
      x,
      y: depth,
      parentId: i === 0 ? null : Math.floor((i - 1) / 2),
      hl: hlSet ? hlSet.has(i) : false,
      isWord: markSet ? markSet.has(i) : false,
    });
    dfs(2 * i + 2, depth + 1);
  }
  dfs(0, 0);
  return nodes;
}

function heapSnapshot(heap, labelFn, opts) {
  return {
    title: opts.title,
    arr: [],
    tree: { nodes: heapTree(heap, labelFn, opts.hlSet, opts.markSet) },
    highlight: [],
    mark: [],
    codeLines: opts.codeLines || [],
    vars: opts.vars || [],
    note: opts.note,
  };
}

// ─── 347: Top K Frequent Elements ───
function buildSteps347(input, params) {
  const nums = String(input).split(",").map((s) => Number(s.trim()));
  const k = params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  const label = (e) => `${e.v}·f${e.f}`;

  steps.push(heapSnapshot([], label, {
    title: { vi: `Top ${k} phần tử xuất hiện nhiều nhất`, en: `Top ${k} frequent elements` },
    codeLines: [2],
    vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "k", value: k }],
    note: {
      vi:
        `Ý tưởng:\n` +
        `• B1: Đếm tần suất mỗi số (hash map).\n` +
        `• B2: Duy trì MIN-HEAP kích thước k theo tần suất.\n` +
        `  - Đẩy từng (số, freq) vào heap.\n` +
        `  - Nếu heap > k phần tử → bỏ gốc (freq NHỎ nhất).\n` +
        `• Cuối cùng heap chứa đúng k số có tần suất lớn nhất.\n` +
        `Nhãn nút hiển thị "số·fTầnSuất"; heap sắp theo tần suất.`,
      en:
        `Idea:\n` +
        `• Step 1: Count the frequency of each number (hash map).\n` +
        `• Step 2: Keep a MIN-HEAP of size k by frequency.\n` +
        `  - Push each (number, freq) into the heap.\n` +
        `  - If heap > k → pop the root (SMALLEST freq).\n` +
        `• In the end the heap holds the k most frequent numbers.\n` +
        `Node label shows "value·fFreq"; the heap is ordered by frequency.`,
    },
  }));

  // Step 1: frequency map.
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);
  const freqStr = [...freq.entries()].map(([v, f]) => `${v}→${f}`).join(", ");
  steps.push(heapSnapshot([], label, {
    title: { vi: "Bước 1: Đếm tần suất", en: "Step 1: Count frequencies" },
    codeLines: [3, 4],
    vars: [{ name: "freq", value: freqStr }],
    note: { vi: `Tần suất: ${freqStr}. Giờ đẩy lần lượt vào min-heap kích thước ${k}.`, en: `Frequencies: ${freqStr}. Now push them one by one into a min-heap of size ${k}.` },
  }));

  // Min-heap keyed by frequency, with step recording on every swap.
  const heap = [];
  const less = (a, b) => a.f < b.f; // min-heap on frequency

  function heapArrStr() { return `[${heap.map((e) => `${e.v}:${e.f}`).join(", ")}]`; }

  function siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (less(heap[i], heap[p])) {
        const a = heap[i], b = heap[p];
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push(heapSnapshot(heap, label, {
          title: { vi: `Sift-up: ${a.v}(f${a.f}) ↑ đổi với ${b.v}(f${b.f})`, en: `Sift-up: swap ${a.v}(f${a.f}) with ${b.v}(f${b.f})` },
          hlSet: new Set([i, p]), codeLines: [7],
          vars: [{ name: "heap", value: heapArrStr() }],
          note: { vi: `freq ${a.f} < freq ${b.f} → con nhỏ hơn cha, đổi chỗ để giữ tính chất min-heap (gốc luôn nhỏ nhất).`, en: `freq ${a.f} < freq ${b.f} → child smaller than parent, swap to keep the min-heap property (root is smallest).` },
        }));
        i = p;
      } else break;
    }
  }

  function siftDown(i) {
    const n = heap.length;
    while (true) {
      let s = i; const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && less(heap[l], heap[s])) s = l;
      if (r < n && less(heap[r], heap[s])) s = r;
      if (s === i) break;
      const a = heap[i], b = heap[s];
      [heap[i], heap[s]] = [heap[s], heap[i]];
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Sift-down: ${a.v}(f${a.f}) ↓ đổi với ${b.v}(f${b.f})`, en: `Sift-down: swap ${a.v}(f${a.f}) with ${b.v}(f${b.f})` },
        hlSet: new Set([i, s]), codeLines: [12],
        vars: [{ name: "heap", value: heapArrStr() }],
        note: { vi: `Cha lớn hơn con nhỏ nhất → đẩy xuống để khôi phục min-heap.`, en: `Parent larger than smallest child → push it down to restore the min-heap.` },
      }));
      i = s;
    }
  }

  // Step 2: push each (value, freq) into the size-k min-heap.
  for (const [v, f] of freq.entries()) {
    heap.push({ v, f });
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push (${v}, f=${f})`, en: `Push (${v}, f=${f})` },
      hlSet: new Set([heap.length - 1]), codeLines: [6, 7],
      vars: [{ name: "heap", value: heapArrStr() }, { name: "size", value: heap.length }],
      note: { vi: `Thêm ${v} (freq ${f}) vào CUỐI heap, rồi sift-up cho về đúng vị trí.`, en: `Add ${v} (freq ${f}) at the END of the heap, then sift-up into place.` },
    }));
    siftUp(heap.length - 1);

    if (heap.length > k) {
      const removed = heap[0];
      const last = heap.pop();
      if (heap.length > 0) heap[0] = last;
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Heap > ${k} → pop gốc ${removed.v}(f${removed.f})`, en: `Heap > ${k} → pop root ${removed.v}(f${removed.f})` },
        hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [8, 9],
        vars: [{ name: "removed", value: `${removed.v} (f${removed.f})` }, { name: "heap", value: heapArrStr() }],
        note: { vi: `Heap vượt quá ${k} phần tử → bỏ GỐC (freq nhỏ nhất = ${removed.f}). Đưa phần tử cuối lên gốc rồi sift-down.`, en: `Heap exceeds ${k} → drop the ROOT (smallest freq = ${removed.f}). Move the last element to the root then sift-down.` },
      }));
      if (heap.length > 0) siftDown(0);
    }
  }

  // Result: the k elements left in the heap (sorted by freq desc for display).
  const result = heap.map((e) => e.v).sort((a, b) => freq.get(b) - freq.get(a));
  const markAll = new Set(heap.map((_, i) => i));
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Kết quả: [${result.join(", ")}]`, en: `Result: [${result.join(", ")}]` },
    markSet: markAll, codeLines: [10],
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: { vi: `Heap còn lại đúng ${k} số có tần suất lớn nhất → đáp án [${result.join(", ")}].`, en: `The heap holds exactly the ${k} most frequent numbers → answer [${result.join(", ")}].` },
  });
  fs.final = true; steps.push(fs);

  return { input, answer: `[${result.join(", ")}]`, steps };
}

// ─── 373: Find K Pairs with Smallest Sums ───
function buildSteps373(input, params) {
  const nums1 = String(input).split(",").map((s) => Number(s.trim()));
  const nums2 = String(params.nums2 || "").split(",").map((s) => Number(s.trim()));
  const k = params.k !== undefined ? Number(params.k) : 3;
  const steps = [];
  const label = (e) => `(${e.u},${e.v})·s${e.sum}`;
  const heap = [];
  const less = (a, b) => a.sum < b.sum;
  const arrStr = () => `[${heap.map((e) => `(${e.u},${e.v}):${e.sum}`).join(", ")}]`;
  const result = [];
  const picked = new Set();

  function pickedKey(i, j) {
    return `${i},${j}`;
  }

  function pairSnapshot(opts) {
    const dp = Array.from({ length: nums1.length + 1 }, () => Array(nums2.length + 1).fill(""));
    for (let i = 0; i < nums1.length; i++) {
      for (let j = 0; j < nums2.length; j++) {
        dp[i + 1][j + 1] = nums1[i] + nums2[j];
      }
    }

    const pathCells = [];
    const cellLabels = {};
    for (const item of heap) {
      const key = `${item.i + 1},${item.j + 1}`;
      pathCells.push([item.i + 1, item.j + 1]);
      cellLabels[key] = "heap";
    }
    for (const key of picked) {
      const [i, j] = key.split(",").map(Number);
      pathCells.push([i + 1, j + 1]);
      cellLabels[`${i + 1},${j + 1}`] = "result";
    }

    const highlighted = opts.hlSet ? [...opts.hlSet].map((idx) => heap[idx]).find(Boolean) : null;
    const activePair = opts.activePair || (highlighted ? [highlighted.i, highlighted.j, "heap"] : null);
    if (activePair) {
      cellLabels[`${activePair[0] + 1},${activePair[1] + 1}`] = activePair[2] || "current";
    }

    return {
      title: opts.title,
      arr: [],
      grid: {
        dp,
        text1: "nums1",
        text2: "nums2",
        largeCells: true,
        rowLabels: nums1.map((value, idx) => ({ index: `i=${idx}`, char: String(value) })),
        colLabels: nums2.map((value, idx) => ({ index: `j=${idx}`, char: String(value) })),
        hlCell: activePair ? [activePair[0] + 1, activePair[1] + 1] : null,
        pathCells,
        cellLabels,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: opts.final || false,
    };
  }

  const heapSnapshot = (_heap, _label, opts) => pairSnapshot(opts);

  function siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (less(heap[i], heap[p])) {
        const a = heap[i], b = heap[p];
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push(heapSnapshot(heap, label, {
          title: { vi: `Sift-up: tổng ${a.sum} ↑ đổi với tổng ${b.sum}`, en: `Sift-up: sum ${a.sum} ↑ swap with sum ${b.sum}` },
          hlSet: new Set([i, p]), codeLines: [9],
          vars: [{ name: "heap", value: arrStr() }],
          note: { vi: `Tổng ${a.sum} < ${b.sum} → con nhỏ hơn cha, đổi chỗ để gốc luôn là tổng nhỏ nhất.`, en: `Sum ${a.sum} < ${b.sum} → child smaller than parent, swap so the root stays the smallest sum.` },
        }));
        i = p;
      } else break;
    }
  }
  function siftDown(i) {
    const n = heap.length;
    while (true) {
      let s = i; const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && less(heap[l], heap[s])) s = l;
      if (r < n && less(heap[r], heap[s])) s = r;
      if (s === i) break;
      const a = heap[i], b = heap[s];
      [heap[i], heap[s]] = [heap[s], heap[i]];
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Sift-down: tổng ${a.sum} ↓ đổi với tổng ${b.sum}`, en: `Sift-down: sum ${a.sum} ↓ swap with sum ${b.sum}` },
        hlSet: new Set([i, s]), codeLines: [13],
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `Cha lớn hơn con nhỏ nhất → đẩy xuống để khôi phục min-heap.`, en: `Parent larger than smallest child → push down to restore the min-heap.` },
      }));
      i = s;
    }
  }

  steps.push(pairSnapshot({
    title: { vi: `Tìm ${k} cặp có tổng nhỏ nhất`, en: `Find ${k} pairs with smallest sums` },
    codeLines: [2],
    vars: [{ name: "nums1", value: `[${nums1.join(",")}]` }, { name: "nums2", value: `[${nums2.join(",")}]` }, { name: "k", value: k }],
    note: {
      vi:
        `Cặp (u, v): u thuộc nums1, v thuộc nums2. Cả 2 mảng đã SẮP XẾP tăng dần.\n` +
        `Dùng MIN-HEAP theo tổng u+v:\n` +
        `• Khởi tạo: đẩy (nums1[i], nums2[0]) cho i = 0..min(k,len1)-1 (cặp nhỏ nhất ở mỗi hàng).\n` +
        `• Lặp k lần: lấy gốc (tổng nhỏ nhất) → thêm vào kết quả; đẩy cặp kế tiếp (cùng u, v lùi sang nums2[j+1]).\n` +
        `Nhãn nút: "(u,v)·sTổng".`,
      en:
        `Pair (u, v): u from nums1, v from nums2. Both arrays are SORTED ascending.\n` +
        `Use a MIN-HEAP on the sum u+v:\n` +
        `• Init: push (nums1[i], nums2[0]) for i = 0..min(k,len1)-1 (smallest pair of each row).\n` +
        `• Repeat k times: pop the root (smallest sum) → add to result; push the next pair (same u, advance to nums2[j+1]).\n` +
        `Node label: "(u,v)·sSum".`,
    },
  }));

  // Init: push (nums1[i], nums2[0]).
  const lim = Math.min(k, nums1.length);
  for (let i = 0; i < lim; i++) {
    const el = { u: nums1[i], v: nums2[0], i, j: 0, sum: nums1[i] + nums2[0] };
    heap.push(el);
    steps.push(pairSnapshot({
      title: { vi: `Khởi tạo: push (${el.u}, ${el.v}) tổng ${el.sum}`, en: `Init: push (${el.u}, ${el.v}) sum ${el.sum}` },
      hlSet: new Set([heap.length - 1]), codeLines: [5, 6],
      vars: [{ name: "heap", value: arrStr() }],
      note: { vi: `Mỗi phần tử nums1 ghép với phần tử ĐẦU của nums2 (nhỏ nhất). Thêm vào heap rồi sift-up.`, en: `Pair each nums1 element with the FIRST (smallest) of nums2. Add to heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
  }

  // Pop k times.
  while (result.length < k && heap.length > 0) {
    const root = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    result.push([root.u, root.v]);
    picked.add(pickedKey(root.i, root.j));
    const resStr = result.map((p) => `[${p.join(",")}]`).join(", ");
    steps.push(pairSnapshot({
      title: { vi: `Lấy cặp nhỏ nhất (${root.u},${root.v}) tổng ${root.sum}`, en: `Pop smallest pair (${root.u},${root.v}) sum ${root.sum}` },
      activePair: [root.i, root.j, "pop"],
      codeLines: [8, 9, 10],
      vars: [{ name: "lấy ra", value: `(${root.u},${root.v}) = ${root.sum}` }, { name: "result", value: `[${resStr}]` }, { name: "heap", value: arrStr() }],
      note: { vi: `Gốc = cặp tổng nhỏ nhất → thêm (${root.u},${root.v}) vào kết quả. Đưa phần tử cuối lên gốc rồi sift-down.`, en: `Root = pair with smallest sum → add (${root.u},${root.v}) to the result. Move last to root then sift-down.` },
    }));
    if (heap.length > 0) siftDown(0);

    // Push the next candidate from the same nums1 element.
    if (root.j + 1 < nums2.length) {
      const nj = root.j + 1;
      const el = { u: root.u, v: nums2[nj], i: root.i, j: nj, sum: root.u + nums2[nj] };
      heap.push(el);
      steps.push(pairSnapshot({
        title: { vi: `Đẩy cặp kế tiếp (${el.u}, ${el.v}) tổng ${el.sum}`, en: `Push next pair (${el.u}, ${el.v}) sum ${el.sum}` },
        activePair: [el.i, el.j, "push"],
        hlSet: new Set([heap.length - 1]), codeLines: [11, 12],
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `Giữ nguyên u=${el.u}, lùi sang phần tử kế của nums2 (v=${el.v}). Đây là ứng viên nhỏ tiếp theo của hàng này.`, en: `Keep u=${el.u}, advance to the next nums2 element (v=${el.v}). This is the next smallest candidate for this row.` },
      }));
      siftUp(heap.length - 1);
    }
  }

  const resStr = result.map((p) => `[${p.join(",")}]`).join(", ");
  const fs = pairSnapshot({
    title: { vi: `Kết quả: [${resStr}]`, en: `Result: [${resStr}]` },
    codeLines: [13],
    vars: [{ name: "answer", value: `[${resStr}]` }],
    note: { vi: `Đã lấy ${result.length} cặp có tổng nhỏ nhất theo thứ tự tăng dần.`, en: `Collected ${result.length} pairs with the smallest sums in ascending order.` },
  });
  fs.final = true; steps.push(fs);

  return { input, answer: `[${resStr}]`, steps };
}

// Shared sift helpers that record a step on every swap (generic notes).
function makeSifters(steps, heap, label, less, arrStr) {
  function siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (less(heap[i], heap[p])) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push(heapSnapshot(heap, label, {
          title: { vi: `Sift-up: ${label(heap[p])} ↑`, en: `Sift-up: ${label(heap[p])} ↑` },
          hlSet: new Set([i, p]),
          vars: [{ name: "heap", value: arrStr() }],
          note: { vi: `Con có ưu tiên cao hơn cha → đổi chỗ để giữ tính chất heap (gốc là phần tử lấy ra trước).`, en: `Child has higher priority than parent → swap to keep the heap property (root comes out first).` },
        }));
        i = p;
      } else break;
    }
  }
  function siftDown(i) {
    const n = heap.length;
    while (true) {
      let s = i; const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && less(heap[l], heap[s])) s = l;
      if (r < n && less(heap[r], heap[s])) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Sift-down: ${label(heap[i])} ↓`, en: `Sift-down: ${label(heap[i])} ↓` },
        hlSet: new Set([i, s]),
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `Cha có ưu tiên thấp hơn con → đẩy xuống để khôi phục heap.`, en: `Parent has lower priority than a child → push down to restore the heap.` },
      }));
      i = s;
    }
  }
  return { siftUp, siftDown };
}

// ─── 378: Kth Smallest Element in a Sorted Matrix ───
function buildSteps378(input, params) {
  const matrix = String(input).split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
  const k = params.k !== undefined ? Number(params.k) : 8;
  const n = matrix.length;
  const steps = [];
  const label = (e) => `${e.val}`;
  const heap = [];
  const less = (a, b) => a.val < b.val; // min-heap by value
  const arrStr = () => `[${heap.map((e) => e.val).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);
  const matStr = matrix.map((r) => `[${r.join(",")}]`).join("  ");

  steps.push(heapSnapshot([], label, {
    title: { vi: `Phần tử nhỏ thứ ${k} trong ma trận sorted`, en: `${k}th smallest in a sorted matrix` },
    codeLines: [2],
    vars: [{ name: "matrix", value: matStr }, { name: "k", value: k }],
    note: {
      vi:
        `Ma trận có MỖI HÀNG và MỖI CỘT đều tăng dần.\n` +
        `Dùng MIN-HEAP các phần tử (giá trị, hàng, cột):\n` +
        `• Khởi tạo: đẩy phần tử ĐẦU mỗi hàng (matrix[r][0]).\n` +
        `• Lặp: lấy gốc (nhỏ nhất), đẩy phần tử kế bên phải cùng hàng (matrix[r][c+1]).\n` +
        `• Phần tử lấy ra lần thứ ${k} chính là đáp án.`,
      en:
        `The matrix is sorted in EVERY ROW and EVERY COLUMN.\n` +
        `Use a MIN-HEAP of (value, row, col):\n` +
        `• Init: push the FIRST element of each row (matrix[r][0]).\n` +
        `• Loop: pop the root (smallest), push the next element to its right (matrix[r][c+1]).\n` +
        `• The ${k}th popped element is the answer.`,
    },
  }));

  // Init: first element of each row.
  for (let r = 0; r < n; r++) {
    const el = { val: matrix[r][0], r, c: 0 };
    heap.push(el);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Khởi tạo: push ${el.val} (hàng ${r})`, en: `Init: push ${el.val} (row ${r})` },
      hlSet: new Set([heap.length - 1]), codeLines: [4, 5],
      vars: [{ name: "heap", value: arrStr() }],
      note: { vi: `Đẩy phần tử đầu hàng ${r} = ${el.val} vào heap rồi sift-up.`, en: `Push the first element of row ${r} = ${el.val} into the heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
  }

  let popped = 0; let answer = null;
  while (popped < k && heap.length > 0) {
    const root = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    popped++; answer = root.val;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Pop lần ${popped}: ${root.val} tại (${root.r},${root.c})`, en: `Pop #${popped}: ${root.val} at (${root.r},${root.c})` },
      hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [7, 8],
      vars: [{ name: "lần pop", value: `${popped}/${k}` }, { name: "giá trị", value: root.val }, { name: "heap", value: arrStr() }],
      note: { vi: `Gốc = ${root.val} là phần tử nhỏ thứ ${popped}. ${popped === k ? `Đây là đáp án (nhỏ thứ ${k})!` : `Đưa phần tử cuối lên gốc rồi sift-down.`}`, en: `Root = ${root.val} is the ${popped}th smallest. ${popped === k ? `This is the answer (${k}th smallest)!` : `Move last to root then sift-down.`}` },
    }));
    if (popped === k) break;
    if (heap.length > 0) siftDown(0);
    if (root.c + 1 < matrix[root.r].length) {
      const el = { val: matrix[root.r][root.c + 1], r: root.r, c: root.c + 1 };
      heap.push(el);
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Push kế bên phải: ${el.val} tại (${el.r},${el.c})`, en: `Push right neighbor: ${el.val} at (${el.r},${el.c})` },
        hlSet: new Set([heap.length - 1]), codeLines: [9, 10],
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `Sau khi lấy (${root.r},${root.c}), ứng viên tiếp theo của hàng ${root.r} là ${el.val} ở cột ${el.c}. Đẩy vào rồi sift-up.`, en: `After taking (${root.r},${root.c}), the next candidate of row ${root.r} is ${el.val} at column ${el.c}. Push then sift-up.` },
      }));
      siftUp(heap.length - 1);
    }
  }

  const fs = heapSnapshot(heap, label, {
    title: { vi: `Đáp án: nhỏ thứ ${k} = ${answer}`, en: `Answer: ${k}th smallest = ${answer}` },
    codeLines: [11],
    vars: [{ name: "answer", value: answer }],
    note: { vi: `Phần tử lấy ra lần thứ ${k} = ${answer}.`, en: `The ${k}th popped element = ${answer}.` },
  });
  fs.final = true; steps.push(fs);

  return { input, answer, steps };
}

// ─── 692: Top K Frequent Words ───
function buildSteps692(input, params) {
  const words = String(input).split(",").map((s) => s.trim()).filter((s) => s.length);
  const k = params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  const label = (e) => `${e.w}·f${e.f}`;

  steps.push(heapSnapshot([], label, {
    title: { vi: `Top ${k} từ xuất hiện nhiều nhất`, en: `Top ${k} frequent words` },
    codeLines: [2],
    vars: [{ name: "words", value: `[${words.join(",")}]` }, { name: "k", value: k }],
    note: {
      vi:
        `Trả về k từ xuất hiện NHIỀU nhất. Nếu BẰNG tần suất → từ NHỎ hơn theo bảng chữ cái xếp trước.\n` +
        `Dùng MIN-HEAP kích thước k với thứ tự "tệ nhất ở gốc":\n` +
        `• "Tệ hơn" = freq nhỏ hơn, hoặc cùng freq nhưng từ LỚN hơn (z > a).\n` +
        `• Khi heap > k → bỏ gốc (từ tệ nhất).\n` +
        `• Cuối cùng sắp k từ còn lại theo freq giảm dần, rồi chữ cái tăng dần.`,
      en:
        `Return the k MOST frequent words. On a tie → the lexicographically SMALLER word comes first.\n` +
        `Use a size-k MIN-HEAP with "worst at the root":\n` +
        `• "Worse" = lower freq, or same freq but LARGER word (z > a).\n` +
        `• When heap > k → drop the root (worst word).\n` +
        `• Finally sort the k survivors by freq desc, then word asc.`,
    },
  }));

  // Count frequencies.
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const freqStr = [...freq.entries()].map(([w, f]) => `${w}→${f}`).join(", ");
  steps.push(heapSnapshot([], label, {
    title: { vi: "Bước 1: Đếm tần suất", en: "Step 1: Count frequencies" },
    codeLines: [3, 4],
    vars: [{ name: "freq", value: freqStr }],
    note: { vi: `Tần suất: ${freqStr}. Giờ đẩy vào min-heap kích thước ${k}.`, en: `Frequencies: ${freqStr}. Now push into a size-${k} min-heap.` },
  }));

  const heap = [];
  // Root = worst (lowest freq; tie → lexicographically larger word).
  const less = (a, b) => (a.f < b.f) || (a.f === b.f && a.w > b.w);
  const arrStr = () => `[${heap.map((e) => `${e.w}:${e.f}`).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  for (const [w, f] of freq.entries()) {
    heap.push({ w, f });
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push "${w}" (f=${f})`, en: `Push "${w}" (f=${f})` },
      hlSet: new Set([heap.length - 1]), codeLines: [5, 6],
      vars: [{ name: "heap", value: arrStr() }, { name: "size", value: heap.length }],
      note: { vi: `Thêm "${w}" (freq ${f}) vào cuối heap rồi sift-up.`, en: `Add "${w}" (freq ${f}) at the end then sift-up.` },
    }));
    siftUp(heap.length - 1);
    if (heap.length > k) {
      const removed = heap[0];
      const last = heap.pop();
      if (heap.length > 0) heap[0] = last;
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Heap > ${k} → bỏ "${removed.w}" (f${removed.f})`, en: `Heap > ${k} → drop "${removed.w}" (f${removed.f})` },
        hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [7, 8],
        vars: [{ name: "bỏ", value: `"${removed.w}" (f${removed.f})` }, { name: "heap", value: arrStr() }],
        note: { vi: `Gốc = từ "tệ nhất" (freq nhỏ nhất, hoặc cùng freq nhưng chữ lớn hơn) → loại bỏ. Đưa phần tử cuối lên gốc rồi sift-down.`, en: `Root = "worst" word (lowest freq, or same freq but larger spelling) → remove. Move last to root then sift-down.` },
      }));
      if (heap.length > 0) siftDown(0);
    }
  }

  const result = heap.map((e) => e.w).sort((x, y) => {
    const fx = freq.get(x), fy = freq.get(y);
    if (fx !== fy) return fy - fx;
    return x < y ? -1 : 1;
  });
  const markAll = new Set(heap.map((_, i) => i));
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Kết quả: [${result.map((w) => `"${w}"`).join(", ")}]`, en: `Result: [${result.map((w) => `"${w}"`).join(", ")}]` },
    markSet: markAll, codeLines: [9],
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: { vi: `Heap còn ${k} từ tốt nhất. Sắp theo freq giảm dần, rồi chữ cái tăng dần → [${result.join(", ")}].`, en: `The heap keeps the ${k} best words. Sort by freq desc, then word asc → [${result.join(", ")}].` },
  });
  fs.final = true; steps.push(fs);

  return { input, answer: `[${result.join(", ")}]`, steps };
}

// ─── 973: K Closest Points to Origin ───
function buildSteps973(input, params) {
  const pts = String(input).split(";").map((p) => p.split(",").map((s) => Number(s.trim())));
  const k = params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  const label = (e) => `(${e.x},${e.y})·d${e.d}`;
  const heap = [];
  const less = (a, b) => a.d > b.d; // MAX-heap: largest distance at root
  const arrStr = () => `[${heap.map((e) => `(${e.x},${e.y}):${e.d}`).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  steps.push(heapSnapshot([], label, {
    title: { vi: `${k} điểm gần gốc tọa độ nhất`, en: `${k} closest points to origin` },
    codeLines: [2],
    vars: [{ name: "points", value: pts.map((p) => `(${p.join(",")})`).join(" ") }, { name: "k", value: k }],
    note: {
      vi:
        `Khoảng cách (bình phương) tới gốc = x² + y² (không cần khai căn).\n` +
        `Dùng MAX-HEAP kích thước k theo khoảng cách:\n` +
        `• Đẩy từng điểm vào heap.\n` +
        `• Nếu heap > k → bỏ GỐC (điểm XA nhất).\n` +
        `• Heap còn lại = k điểm gần nhất. Nhãn: "(x,y)·dKhoảngCách²".`,
      en:
        `Squared distance to origin = x² + y² (no square root needed).\n` +
        `Use a MAX-HEAP of size k by distance:\n` +
        `• Push each point.\n` +
        `• If heap > k → drop the ROOT (FARTHEST point).\n` +
        `• Remaining heap = k closest points. Label: "(x,y)·dDist²".`,
    },
  }));

  for (const [x, y] of pts) {
    const d = x * x + y * y;
    heap.push({ x, y, d });
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push (${x},${y}) d=${d}`, en: `Push (${x},${y}) d=${d}` },
      hlSet: new Set([heap.length - 1]), codeLines: [4, 5],
      vars: [{ name: "heap", value: arrStr() }, { name: "size", value: heap.length }],
      note: { vi: `d = ${x}² + ${y}² = ${d}. Thêm vào max-heap rồi sift-up.`, en: `d = ${x}² + ${y}² = ${d}. Add to the max-heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
    if (heap.length > k) {
      const removed = heap[0];
      const last = heap.pop();
      if (heap.length > 0) heap[0] = last;
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Heap > ${k} → bỏ điểm xa nhất (${removed.x},${removed.y}) d${removed.d}`, en: `Heap > ${k} → drop farthest (${removed.x},${removed.y}) d${removed.d}` },
        hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [6, 7],
        vars: [{ name: "bỏ", value: `(${removed.x},${removed.y}) d${removed.d}` }, { name: "heap", value: arrStr() }],
        note: { vi: `Gốc max-heap = điểm xa nhất (d=${removed.d}) → loại. Đưa phần tử cuối lên gốc rồi sift-down.`, en: `Max-heap root = farthest point (d=${removed.d}) → remove. Move last to root then sift-down.` },
      }));
      if (heap.length > 0) siftDown(0);
    }
  }

  const result = heap.map((e) => [e.x, e.y]);
  const resStr = result.map((p) => `[${p.join(",")}]`).join(", ");
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Kết quả: [${resStr}]`, en: `Result: [${resStr}]` },
    markSet: new Set(heap.map((_, i) => i)), codeLines: [8],
    vars: [{ name: "answer", value: `[${resStr}]` }],
    note: { vi: `Heap giữ lại đúng ${k} điểm gần gốc nhất.`, en: `The heap keeps exactly the ${k} closest points.` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer: `[${resStr}]`, steps };
}

// ─── 1046: Last Stone Weight ───
function buildSteps1046(input) {
  const stones = String(input).split(",").map((s) => Number(s.trim()));
  const steps = [];
  const label = (e) => `${e}`;
  const heap = [];
  const less = (a, b) => a > b; // MAX-heap
  const arrStr = () => `[${heap.join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  steps.push(heapSnapshot([], label, {
    title: { vi: "Hòn đá cuối cùng (Last Stone Weight)", en: "Last Stone Weight" },
    codeLines: [2],
    vars: [{ name: "stones", value: `[${stones.join(",")}]` }],
    note: {
      vi:
        `Mỗi lần lấy 2 hòn đá NẶNG nhất (x ≥ y) đập nhau:\n` +
        `• Nếu x == y → cả hai vỡ hết.\n` +
        `• Nếu x > y → còn lại 1 hòn nặng x − y.\n` +
        `Dùng MAX-HEAP để luôn lấy 2 hòn nặng nhất. Lặp tới khi còn ≤ 1 hòn.`,
      en:
        `Each turn take the 2 HEAVIEST stones (x ≥ y) and smash them:\n` +
        `• If x == y → both destroyed.\n` +
        `• If x > y → a stone of weight x − y remains.\n` +
        `Use a MAX-HEAP to always pick the two heaviest. Repeat until ≤ 1 stone.`,
    },
  }));

  for (const s of stones) {
    heap.push(s);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push ${s}`, en: `Push ${s}` },
      hlSet: new Set([heap.length - 1]), codeLines: [3, 4],
      vars: [{ name: "heap", value: arrStr() }],
      note: { vi: `Thêm hòn ${s} vào max-heap rồi sift-up.`, en: `Add stone ${s} to the max-heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
  }

  function popMax(roleVi, roleEn) {
    const root = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Lấy hòn nặng nhất = ${root} (${roleVi})`, en: `Pop heaviest = ${root} (${roleEn})` },
      hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [6, 7],
      vars: [{ name: roleVi, value: root }, { name: "heap", value: arrStr() }],
      note: { vi: `Gốc max-heap = hòn nặng nhất = ${root}. Đưa cuối lên gốc rồi sift-down.`, en: `Max-heap root = heaviest = ${root}. Move last to root then sift-down.` },
    }));
    if (heap.length > 0) siftDown(0);
    return root;
  }

  while (heap.length > 1) {
    const x = popMax("x", "x");
    const y = popMax("y", "y");
    if (x - y > 0) {
      const diff = x - y;
      heap.push(diff);
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `${x} đập ${y} → còn ${diff}, push lại`, en: `${x} vs ${y} → ${diff} remains, push back` },
        hlSet: new Set([heap.length - 1]), codeLines: [8, 9],
        vars: [{ name: "x-y", value: `${x}-${y}=${diff}` }, { name: "heap", value: arrStr() }],
        note: { vi: `x=${x} > y=${y} → hòn mới nặng ${diff} quay lại heap. Sift-up.`, en: `x=${x} > y=${y} → a new stone of weight ${diff} goes back in. Sift-up.` },
      }));
      siftUp(heap.length - 1);
    } else {
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `${x} đập ${y} → cả hai vỡ hết`, en: `${x} vs ${y} → both destroyed` },
        codeLines: [8],
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `x == y = ${x} → hai hòn triệt tiêu, không thêm gì.`, en: `x == y = ${x} → both cancel, nothing added.` },
      }));
    }
  }

  const answer = heap.length ? heap[0] : 0;
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Đáp án: ${answer}`, en: `Answer: ${answer}` },
    codeLines: [10],
    vars: [{ name: "answer", value: answer }],
    note: { vi: heap.length ? `Còn lại 1 hòn nặng ${answer}.` : `Không còn hòn nào → 0.`, en: heap.length ? `One stone of weight ${answer} remains.` : `No stones left → 0.` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 215: Kth Largest Element in an Array ───
function buildSteps215(input, params) {
  const nums = String(input).split(",").map((s) => Number(s.trim()));
  const k = params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  const label = (e) => `${e}`;
  const heap = [];
  const less = (a, b) => a < b; // MIN-heap
  const arrStr = () => `[${heap.join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  steps.push(heapSnapshot([], label, {
    title: { vi: `Phần tử LỚN thứ ${k}`, en: `${k}th LARGEST element` },
    codeLines: [2],
    vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "k", value: k }],
    note: {
      vi:
        `Duy trì MIN-HEAP kích thước k:\n` +
        `• Đẩy từng số vào heap.\n` +
        `• Nếu heap > k → bỏ GỐC (số NHỎ nhất trong heap).\n` +
        `• Heap luôn giữ k số lớn nhất; GỐC chính là số lớn thứ ${k}.`,
      en:
        `Keep a MIN-HEAP of size k:\n` +
        `• Push each number.\n` +
        `• If heap > k → drop the ROOT (the SMALLEST in the heap).\n` +
        `• The heap always holds the k largest; the ROOT is the ${k}th largest.`,
    },
  }));

  for (const x of nums) {
    heap.push(x);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push ${x}`, en: `Push ${x}` },
      hlSet: new Set([heap.length - 1]), codeLines: [4, 5],
      vars: [{ name: "heap", value: arrStr() }, { name: "size", value: heap.length }],
      note: { vi: `Thêm ${x} vào min-heap rồi sift-up.`, en: `Add ${x} to the min-heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
    if (heap.length > k) {
      const removed = heap[0];
      const last = heap.pop();
      if (heap.length > 0) heap[0] = last;
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Heap > ${k} → bỏ nhỏ nhất ${removed}`, en: `Heap > ${k} → drop smallest ${removed}` },
        hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [6, 7],
        vars: [{ name: "bỏ", value: removed }, { name: "heap", value: arrStr() }],
        note: { vi: `Gốc min-heap = ${removed} là nhỏ nhất → loại (không nằm trong top ${k}). Sift-down.`, en: `Min-heap root = ${removed} is smallest → drop (not in the top ${k}). Sift-down.` },
      }));
      if (heap.length > 0) siftDown(0);
    }
  }

  const answer = heap[0];
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Đáp án: lớn thứ ${k} = ${answer}`, en: `Answer: ${k}th largest = ${answer}` },
    markSet: new Set([0]), codeLines: [8],
    vars: [{ name: "answer", value: answer }],
    note: { vi: `Gốc heap = ${answer} là phần tử lớn thứ ${k}.`, en: `The heap root = ${answer} is the ${k}th largest element.` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 253: Meeting Rooms II ───
function buildSteps253(input) {
  const intervals = String(input).split(";").map((p) => p.split(",").map((s) => Number(s.trim())));
  intervals.sort((a, b) => a[0] - b[0]);
  const steps = [];
  const label = (e) => `end ${e}`;
  const heap = [];
  const less = (a, b) => a < b; // MIN-heap of end times
  const arrStr = () => `[${heap.join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);
  const ivStr = intervals.map((iv) => `[${iv.join(",")}]`).join(" ");

  steps.push(heapSnapshot([], label, {
    title: { vi: "Số phòng họp tối thiểu", en: "Minimum meeting rooms" },
    codeLines: [2, 3],
    vars: [{ name: "sorted", value: ivStr }],
    note: {
      vi:
        `Sắp các cuộc họp theo thời điểm BẮT ĐẦU.\n` +
        `Dùng MIN-HEAP chứa thời điểm KẾT THÚC của các phòng đang dùng:\n` +
        `• Với mỗi cuộc họp [s, e]: nếu phòng kết thúc sớm nhất (gốc heap) ≤ s → tái sử dụng (pop).\n` +
        `• Luôn push e (phòng cho cuộc họp này).\n` +
        `• Đáp án = kích thước heap LỚN NHẤT từng đạt = số phòng tối thiểu.`,
      en:
        `Sort meetings by START time.\n` +
        `Use a MIN-HEAP of END times of rooms in use:\n` +
        `• For each meeting [s, e]: if the earliest-ending room (heap root) ≤ s → reuse it (pop).\n` +
        `• Always push e (a room for this meeting).\n` +
        `• Answer = the MAX heap size ever reached = minimum rooms.`,
    },
  }));

  let maxRooms = 0;
  for (const [s, e] of intervals) {
    if (heap.length > 0 && heap[0] <= s) {
      const freed = heap[0];
      const last = heap.pop();
      if (heap.length > 0) heap[0] = last;
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `[${s},${e}]: phòng kết thúc ${freed} ≤ ${s} → tái dùng`, en: `[${s},${e}]: room ending ${freed} ≤ ${s} → reuse` },
        hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [5, 6],
        vars: [{ name: "start", value: s }, { name: "freed end", value: freed }, { name: "heap", value: arrStr() }],
        note: { vi: `Phòng kết thúc lúc ${freed} đã rảnh trước khi ${s} bắt đầu → dùng lại phòng đó (pop). Sift-down.`, en: `A room freed at ${freed} before ${s} starts → reuse it (pop). Sift-down.` },
      }));
      if (heap.length > 0) siftDown(0);
    }
    heap.push(e);
    maxRooms = Math.max(maxRooms, heap.length);
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `[${s},${e}]: dùng phòng tới ${e} (đang dùng ${heap.length})`, en: `[${s},${e}]: occupy until ${e} (in use ${heap.length})` },
      hlSet: new Set([heap.length - 1]), codeLines: [7, 8],
      vars: [{ name: "meeting", value: `[${s},${e}]` }, { name: "rooms in use", value: heap.length }, { name: "maxRooms", value: maxRooms }],
      note: { vi: `Push thời điểm kết thúc ${e}. Số phòng đang dùng = ${heap.length}, lớn nhất từng đạt = ${maxRooms}.`, en: `Push end time ${e}. Rooms in use = ${heap.length}, max so far = ${maxRooms}.` },
    }));
    siftUp(heap.length - 1);
  }

  const fs = heapSnapshot(heap, label, {
    title: { vi: `Đáp án: ${maxRooms} phòng`, en: `Answer: ${maxRooms} rooms` },
    codeLines: [9],
    vars: [{ name: "answer", value: maxRooms }],
    note: { vi: `Số phòng tối thiểu = số cuộc họp chồng nhau nhiều nhất = ${maxRooms}.`, en: `Minimum rooms = maximum number of overlapping meetings = ${maxRooms}.` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer: maxRooms, steps };
}

// ─── 767: Reorganize String ───
function buildSteps767(input) {
  const s = String(input).trim();
  const steps = [];
  const label = (e) => `${e.ch}·${e.cnt}`;
  const heap = [];
  const less = (a, b) => a.cnt > b.cnt; // MAX-heap by count
  const arrStr = () => `[${heap.map((e) => `${e.ch}:${e.cnt}`).join(", ")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  const freq = new Map();
  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
  const freqStr = [...freq.entries()].map(([c, f]) => `${c}→${f}`).join(", ");

  steps.push(heapSnapshot([], label, {
    title: { vi: "Sắp xếp lại chuỗi (không 2 ký tự kề giống nhau)", en: "Reorganize string (no two adjacent equal)" },
    codeLines: [2],
    vars: [{ name: "s", value: s }, { name: "freq", value: freqStr }],
    note: {
      vi:
        `Mục tiêu: xếp lại để KHÔNG có 2 ký tự giống nhau cạnh nhau.\n` +
        `Tham lam với MAX-HEAP theo tần suất:\n` +
        `• Luôn lấy ký tự CÒN NHIỀU nhất, thêm vào kết quả, giảm count.\n` +
        `• GIỮ ký tự vừa dùng sang một bên 1 lượt (prev) để không bị lặp; lượt sau mới đẩy lại heap.\n` +
        `• Nếu ký tự nào > (n+1)/2 thì không thể xếp → trả "".`,
      en:
        `Goal: rearrange so NO two equal characters are adjacent.\n` +
        `Greedy with a MAX-HEAP by frequency:\n` +
        `• Always take the MOST frequent char, append it, decrement its count.\n` +
        `• HOLD the just-used char aside for one turn (prev) to avoid repeats; push it back next turn.\n` +
        `• If any char count > (n+1)/2, it's impossible → return "".`,
    },
  }));

  for (const [ch, cnt] of freq.entries()) {
    heap.push({ ch, cnt });
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Push '${ch}' (${cnt})`, en: `Push '${ch}' (${cnt})` },
      hlSet: new Set([heap.length - 1]), codeLines: [3, 4],
      vars: [{ name: "heap", value: arrStr() }],
      note: { vi: `Thêm '${ch}' tần suất ${cnt} vào max-heap rồi sift-up.`, en: `Add '${ch}' freq ${cnt} to the max-heap then sift-up.` },
    }));
    siftUp(heap.length - 1);
  }

  let result = "";
  let prev = null;
  const n = s.length;
  while (heap.length > 0) {
    const cur = heap[0];
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    result += cur.ch;
    cur.cnt--;
    const pushedBack = prev && prev.cnt > 0;
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Lấy '${cur.ch}' → result = "${result}"`, en: `Take '${cur.ch}' → result = "${result}"` },
      hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [6, 7, 8],
      vars: [{ name: "result", value: `"${result}"` }, { name: "'" + cur.ch + "' còn lại", value: cur.cnt }, { name: "giữ lại (prev)", value: pushedBack ? `'${prev.ch}'(${prev.cnt})` : "—" }, { name: "heap", value: arrStr() }],
      note: { vi: `Lấy ký tự nhiều nhất '${cur.ch}', nối vào kết quả, count còn ${cur.cnt}.` + (pushedBack ? ` Đẩy lại '${prev.ch}'(${prev.cnt}) đã giữ từ lượt trước.` : ``), en: `Take the most frequent '${cur.ch}', append it, count now ${cur.cnt}.` + (pushedBack ? ` Push back held '${prev.ch}'(${prev.cnt}) from last turn.` : ``) },
    }));
    if (heap.length > 0) siftDown(0);
    if (pushedBack) {
      heap.push(prev);
      siftUp(heap.length - 1);
    }
    prev = cur;
  }

  const ok = result.length === n;
  const answer = ok ? result : '""';
  const fs = heapSnapshot(heap, label, {
    title: { vi: ok ? `Kết quả: "${result}"` : `Không thể → ""`, en: ok ? `Result: "${result}"` : `Impossible → ""` },
    codeLines: [9],
    vars: [{ name: "answer", value: answer }],
    note: { vi: ok ? `Xếp được chuỗi hợp lệ: "${result}" (không có 2 ký tự kề giống nhau).` : `Có ký tự xuất hiện quá nhiều → không thể sắp xếp.`, en: ok ? `Built a valid arrangement: "${result}" (no two adjacent equal).` : `Some char is too frequent → impossible.` },
  });
  fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 23: Merge k Sorted Lists ───
function buildSteps23(input, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps23DC(input);
  return buildSteps23Heap(input);
}

function buildSteps23Heap(input) {
  const lists = String(input).split(";").map((s) => s.split(",").map(Number).filter((x) => !isNaN(x)));
  const k = lists.length;
  const steps = [];
  const label = (e) => `${e.val}`;
  const heap = [];
  const less = (a, b) => a.val < b.val;
  const arrStr = () => `[${heap.map((e) => e.val).join(",")}]`;
  const { siftUp, siftDown } = makeSifters(steps, heap, label, less, arrStr);

  const result = [];
  const listsStr = lists.map((l, i) => `L${i}: [${l.join(",")}]`).join("  ");

  steps.push(heapSnapshot([], label, {
    title: { vi: `Gộp ${k} danh sách đã sắp xếp`, en: `Merge ${k} sorted lists` },
    codeLines: [4, 5],
    vars: [{ name: "lists", value: listsStr }, { name: "k", value: k }],
    note: {
      vi:
        `${k} list: ${listsStr}\n\n` +
        `Dùng MIN-HEAP kích thước ≤ ${k}:\n` +
        `• Đẩy head mỗi list vào heap.\n` +
        `• Pop nhỏ nhất → thêm vào kết quả.\n` +
        `• Đẩy node tiếp theo của list đó vào heap.\n` +
        `• Lặp cho đến hết.`,
      en:
        `${k} lists: ${listsStr}\n\n` +
        `Use a MIN-HEAP of size ≤ ${k}:\n` +
        `• Push head of each list into heap.\n` +
        `• Pop the smallest → add to result.\n` +
        `• Push the next node of that list into heap.\n` +
        `• Repeat until done.`,
    },
  }));

  // Track pointers into each list
  const ptrs = lists.map(() => 0);

  // Init: push head of each list
  for (let i = 0; i < k; i++) {
    if (lists[i].length > 0) {
      heap.push({ val: lists[i][0], listIdx: i });
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Push head L${i}: ${lists[i][0]}`, en: `Push head L${i}: ${lists[i][0]}` },
        hlSet: new Set([heap.length - 1]), codeLines: [6, 7, 8],
        vars: [{ name: "heap", value: arrStr() }],
        note: { vi: `Đẩy đầu list ${i} (= ${lists[i][0]}) vào min-heap.`, en: `Push head of list ${i} (= ${lists[i][0]}) into the min-heap.` },
      }));
      siftUp(heap.length - 1);
      ptrs[i] = 1;
    }
  }

  // Pop loop — detailed sub-steps
  while (heap.length > 0) {
    const root = heap[0];
    const li = root.listIdx;
    const hasNext = ptrs[li] < lists[li].length;

    // Sub-step 1: identify root (smallest in heap)
    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Gốc heap = ${root.val} (L${li}) → nhỏ nhất`, en: `Heap root = ${root.val} (L${li}) → smallest` },
      hlSet: new Set([0]), codeLines: [10, 11],
      vars: [{ name: "heap root", value: `${root.val} (from L${li})` }, { name: "heap", value: arrStr() }, { name: "linked list so far", value: result.length > 0 ? `D→${result.join("→")}` : "D (empty)" }],
      note: { vi: `Gốc min-heap = ${root.val} → đây là phần tử nhỏ nhất hiện tại. Sắp pop ra nối vào node.next.`, en: `Min-heap root = ${root.val} → current smallest. About to pop and link to node.next.` },
    }));

    // Sub-step 2: pop root, move last to root
    const last = heap.pop();
    if (heap.length > 0) heap[0] = last;
    result.push(root.val);

    steps.push(heapSnapshot(heap, label, {
      title: { vi: `Pop ${root.val} → result=[${result.join(",")}]`, en: `Pop ${root.val} → result=[${result.join(",")}]` },
      hlSet: heap.length > 0 ? new Set([0]) : new Set(), codeLines: [11, 12, 13],
      vars: [
        { name: "popped", value: root.val },
        { name: "node (cur)", value: `→ ${root.val} (mới nối)` },
        { name: "linked list", value: `D→${result.join("→")} (cur=${root.val})` },
        { name: "last → root", value: heap.length > 0 ? `${heap[0].val} moved to root` : "heap empty" },
      ],
      note: { vi: `Pop ${root.val}, nối vào result. Đưa phần tử cuối lên gốc → cần sift-down.`, en: `Pop ${root.val}, append to result. Move last element to root → need sift-down.` },
    }));

    // Sub-step 3: sift-down (each swap is a separate step via makeSifters)
    if (heap.length > 0) siftDown(0);

    // Sub-step 4: push next from same list (if available)
    if (hasNext) {
      const nextVal = lists[li][ptrs[li]];
      heap.push({ val: nextVal, listIdx: li });

      steps.push(heapSnapshot(heap, label, {
        title: { vi: `Push L${li}[${ptrs[li]}]=${nextVal} vào heap`, en: `Push L${li}[${ptrs[li]}]=${nextVal} into heap` },
        hlSet: new Set([heap.length - 1]), codeLines: [14, 15],
        vars: [
          { name: "from list", value: `L${li}` },
          { name: "next val", value: nextVal },
          { name: "heap", value: arrStr() },
        ],
        note: { vi: `Đẩy phần tử tiếp theo của L${li} (= ${nextVal}) vào cuối heap → cần sift-up.`, en: `Push next element of L${li} (= ${nextVal}) at the end of heap → need sift-up.` },
      }));

      ptrs[li]++;
      // Sub-step 5: sift-up (each swap is a separate step via makeSifters)
      siftUp(heap.length - 1);
    } else {
      steps.push(heapSnapshot(heap, label, {
        title: { vi: `L${li} hết → không push`, en: `L${li} exhausted → no push` },
        codeLines: [14],
        vars: [{ name: "L" + li, value: "exhausted" }, { name: "heap", value: arrStr() }],
        note: { vi: `List ${li} không còn phần tử → không push gì vào heap.`, en: `List ${li} has no more elements → nothing to push.` },
      }));
    }
  }

  // Final
  const fs = heapSnapshot(heap, label, {
    title: { vi: `Kết quả: [${result.join(",")}]`, en: `Result: [${result.join(",")}]` },
    codeLines: [16],
    vars: [{ name: "answer", value: `[${result.join(",")}]` }, { name: "total nodes", value: result.length }],
    note: { vi: `Đã gộp ${k} list thành 1 list tăng dần: [${result.join(",")}].`, en: `Merged ${k} lists into one sorted list: [${result.join(",")}].` },
  });
  fs.final = true; steps.push(fs);

  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 23 Approach 2: Divide & Conquer (merge pairs) ───
function buildSteps23DC(input) {
  const lists = String(input).split(";").map((s) => s.split(",").map(Number).filter((x) => !isNaN(x)));
  const steps = [];
  const k = lists.length;

  const listsStr = lists.map((l, i) => `L${i}:[${l.join(",")}]`).join("  ");
  steps.push({
    title: { vi: "Divide & Conquer: gộp từng cặp", en: "Divide & Conquer: merge pairwise" },
    arr: lists.flat(), sub: lists.flat().map(String),
    highlight: [], mark: [], codeLines: [2, 3, 4, 5], codeBlock: 2,
    vars: [{ name: "lists", value: listsStr }, { name: "k", value: k }],
    note: {
      vi: `${k} lists: ${listsStr}\n\nLặp: mỗi vòng gộp từng CẶP. Số list giảm một nửa → log(k) vòng.\nMỗi merge dùng 2 pointers so sánh đầu, lấy nhỏ hơn.`,
      en: `${k} lists: ${listsStr}\n\nLoop: each round merges PAIRS. List count halves → log(k) rounds.\nEach merge uses 2 pointers comparing heads, taking the smaller.`,
    },
  });

  let current = lists.map((l) => [...l]);
  let round = 0;

  while (current.length > 1) {
    round++;
    const merged = [];
    for (let p = 0; p < current.length; p += 2) {
      const la = current[p];
      const lb = p + 1 < current.length ? current[p + 1] : null;

      if (!lb) { merged.push(la); continue; }

      // Tree view: la at y=0, lb at y=1, result at y=2
      const res = [];
      let i = 0, j = 0;

      // Intro step for this pair
      function treeSnap(title, note, curI, curJ, vars, codeLines) {
        const nodes = [];
        // la nodes (y=0)
        la.forEach((v, idx) => { nodes.push({ id: idx, label: String(v), x: idx * 2, y: 0, parentId: idx > 0 ? idx - 1 : null, hl: idx === curI, isWord: false }); });
        // lb nodes (y=1)
        const lbOff = la.length;
        lb.forEach((v, idx) => { nodes.push({ id: lbOff + idx, label: String(v), x: idx * 2, y: 1, parentId: idx > 0 ? lbOff + idx - 1 : null, hl: idx === curJ, isWord: false }); });
        // result nodes (y=2): dummy "D" + values
        const resOff = la.length + lb.length;
        nodes.push({ id: resOff, label: "D", x: 0, y: 2, parentId: null, hl: false, isWord: false });
        res.forEach((v, idx) => {
          const isCur = idx === res.length - 1;
          nodes.push({ id: resOff + 1 + idx, label: String(v), x: (idx + 1) * 2, y: 2, parentId: resOff + idx, hl: false, isWord: isCur });
        });
        const ann = {};
        if (curI >= 0 && curI < la.length) ann[curI] = "l1";
        if (curJ >= 0 && curJ < lb.length) ann[la.length + curJ] = "l2";
        if (res.length > 0) ann[resOff + res.length] = "cur";
        return { title, arr: [], tree: { nodes, annotations: ann }, highlight: [], mark: [], codeLines: codeLines || [], codeBlock: 2, vars: vars || [], note };
      }

      steps.push(treeSnap(
        { vi: `Vòng ${round}: merge [${la.join(",")}] + [${lb.join(",")}]`, en: `Round ${round}: merge [${la.join(",")}] + [${lb.join(",")}]` },
        { vi: `So sánh đầu mỗi list, lấy nhỏ hơn.`, en: `Compare heads, take the smaller.` },
        0, 0,
        [{ name: "l1", value: la.join("→") }, { name: "l2", value: lb.join("→") }],
        [7, 8, 9, 10]
      ));

      // Merge step by step
      while (i < la.length && j < lb.length) {
        const takeL1 = la[i] <= lb[j];
        if (takeL1) { res.push(la[i]); i++; } else { res.push(lb[j]); j++; }

        steps.push(treeSnap(
          { vi: `${res[res.length-1]} ← ${takeL1 ? "l1" : "l2"}`, en: `${res[res.length-1]} ← ${takeL1 ? "l1" : "l2"}` },
          { vi: `${takeL1 ? `l1=${la[i-1]}≤l2=${lb[j]}` : `l2=${lb[j-1]}<l1=${la[i]}`} → lấy ${res[res.length-1]}.`, en: `${takeL1 ? `l1=${la[i-1]}≤l2=${lb[j]}` : `l2=${lb[j-1]}<l1=${la[i]}`} → take ${res[res.length-1]}.` },
          i < la.length ? i : -1, j < lb.length ? j : -1,
          [{ name: "took", value: `${res[res.length-1]} from ${takeL1?"l1":"l2"}` }, { name: "result", value: res.join("→") }],
          takeL1 ? [17, 18, 19] : [20, 21, 22]
        ));
      }
      // Append remaining
      while (i < la.length) res.push(la[i++]);
      while (j < lb.length) res.push(lb[j++]);

      steps.push(treeSnap(
        { vi: `Merge xong: [${res.join(",")}]`, en: `Merge done: [${res.join(",")}]` },
        { vi: `Kết quả: ${res.join("→")}.`, en: `Result: ${res.join("→")}.` },
        -1, -1,
        [{ name: "merged", value: res.join("→") }],
        [24, 25]
      ));

      merged.push(res);
    }
    current = merged;
  }

  const result = current[0] || [];
  const fs = {
    title: { vi: `Kết quả: ${result.join("→")}`, en: `Result: ${result.join("→")}` },
    arr: result, sub: result.map(String),
    highlight: [], mark: result.map((_, i) => i), final: true, codeLines: [11, 12], codeBlock: 2,
    vars: [{ name: "answer", value: result.join("→") }, { name: "rounds", value: round }],
    note: { vi: `Sau ${round} vòng gộp cặp: ${result.join("→")}.`, en: `After ${round} pairwise merge rounds: ${result.join("→")}.` },
  };
  steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
}

module.exports = {
  347: {
    id: 347, difficulty: "medium", slug: "top-k-frequent-elements",
    category: HEAP_CAT,
    title: { vi: "Top K Frequent Elements", en: "Top K Frequent Elements" },
    titleVi: { vi: "K phần tử xuất hiện nhiều nhất", en: "K most frequent elements" },
    statement: { vi: "Cho mảng nums và số k, trả về k phần tử xuất hiện NHIỀU NHẤT. Nhập mảng cách bởi dấu phẩy.", en: "Given an array nums and integer k, return the k MOST frequent elements. Enter the array comma-separated." },
    defaultInput: "1,1,1,2,2,3",
    inputKind: "string", inputLabel: { vi: "Mảng số (dấu phẩy)", en: "Array (comma-separated)" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Đếm tần suất bằng hash map.", en: "Count frequencies with a hash map." },
      { vi: "Duy trì min-heap kích thước k theo tần suất; khi vượt k thì bỏ gốc (freq nhỏ nhất).", en: "Keep a size-k min-heap by frequency; when it exceeds k, pop the root (smallest freq)." },
      { vi: "Heap còn lại = k phần tử tần suất lớn nhất. (Bucket sort cho O(n).)", en: "Remaining heap = k most frequent. (Bucket sort gives O(n).)" },
    ],
    complexity: { time: "O(n log k)", space: "O(n)", note: { vi: "n lần push/pop vào heap kích thước k.", en: "n push/pop operations on a size-k heap." } },
    code: [
      "class Solution:",
      "    def topKFrequent(self, nums, k):",
      "        from collections import Counter",
      "        freq = Counter(nums)",
      "        import heapq",
      "        heap = []",
      "        for v, f in freq.items():",
      "            heapq.heappush(heap, (f, v))",
      "            if len(heap) > k:",
      "                heapq.heappop(heap)",
      "        return [v for f, v in heap]",
    ],
    builder: buildSteps347,
  },
  373: {
    id: 373, difficulty: "medium", slug: "find-k-pairs-with-smallest-sums",
    category: HEAP_CAT,
    title: { vi: "Find K Pairs with Smallest Sums", en: "Find K Pairs with Smallest Sums" },
    titleVi: { vi: "K cặp có tổng nhỏ nhất", en: "K pairs with smallest sums" },
    statement: { vi: "Cho 2 mảng đã sắp xếp nums1, nums2 và k. Trả về k cặp (u, v) (u∈nums1, v∈nums2) có tổng u+v nhỏ nhất. Nhập nums1; nums2 và k ở ô tham số.", en: "Given two sorted arrays nums1, nums2 and k, return the k pairs (u, v) (u∈nums1, v∈nums2) with the smallest sums u+v. Enter nums1; nums2 and k in the param fields." },
    defaultInput: "1,7,11",
    inputKind: "string", inputLabel: { vi: "nums1 (đã sắp xếp)", en: "nums1 (sorted)" },
    extraParams: [{ key: "nums2", label: { vi: "nums2 (đã sắp xếp)", en: "nums2 (sorted)" }, type: "string", default: "2,4,6" }, { key: "k", label: { vi: "k", en: "k" }, default: 3 }],
    approach: [
      { vi: "Min-heap theo tổng. Khởi tạo với (nums1[i], nums2[0]) cho i đầu.", en: "Min-heap by sum. Initialize with (nums1[i], nums2[0]) for the first i's." },
      { vi: "Mỗi lần pop cặp nhỏ nhất, đẩy cặp kế tiếp (cùng u, v lùi sang nums2[j+1]).", en: "Each pop of the smallest pair, push the next pair (same u, advance to nums2[j+1])." },
    ],
    complexity: { time: "O(k log k)", space: "O(k)", note: { vi: "Mỗi pop/push trên heap kích thước ≤ k.", en: "Each pop/push on a heap of size ≤ k." } },
    code: [
      "class Solution:",
      "    def kSmallestPairs(self, nums1, nums2, k):",
      "        import heapq",
      "        if not nums1 or not nums2: return []",
      "        heap = []",
      "        for i in range(min(k, len(nums1))):",
      "            heapq.heappush(heap, (nums1[i]+nums2[0], i, 0))",
      "        res = []",
      "        while heap and len(res) < k:",
      "            s, i, j = heapq.heappop(heap)",
      "            res.append([nums1[i], nums2[j]])",
      "            if j + 1 < len(nums2):",
      "                heapq.heappush(heap, (nums1[i]+nums2[j+1], i, j+1))",
      "        return res",
    ],
    builder: buildSteps373,
  },
  378: {
    id: 378, difficulty: "medium", slug: "kth-smallest-element-in-a-sorted-matrix",
    category: HEAP_CAT,
    title: { vi: "Kth Smallest Element in a Sorted Matrix", en: "Kth Smallest Element in a Sorted Matrix" },
    titleVi: { vi: "Phần tử nhỏ thứ k trong ma trận sorted", en: "Kth smallest in sorted matrix" },
    statement: { vi: "Cho ma trận n×n với mỗi hàng và mỗi cột tăng dần, tìm phần tử nhỏ thứ k. Nhập các hàng cách bởi ';', các số trong hàng cách bởi ','.", en: "Given an n×n matrix where each row and column is sorted ascending, find the kth smallest element. Enter rows separated by ';', numbers by ','." },
    defaultInput: "1,5,9;10,11,13;12,13,15",
    inputKind: "string", inputLabel: { vi: "Ma trận (hàng cách ';')", en: "Matrix (rows by ';')" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 8 }],
    approach: [
      { vi: "Min-heap (giá trị, hàng, cột). Khởi tạo với phần tử đầu mỗi hàng.", en: "Min-heap of (value, row, col). Initialize with the first element of each row." },
      { vi: "Pop k lần; mỗi pop đẩy phần tử kế bên phải cùng hàng. Lần pop thứ k = đáp án.", en: "Pop k times; each pop pushes the right neighbor in the same row. The kth pop = answer." },
    ],
    complexity: { time: "O(k log n)", space: "O(n)", note: { vi: "Heap chứa tối đa n phần tử (số hàng).", en: "Heap holds at most n elements (number of rows)." } },
    code: [
      "class Solution:",
      "    def kthSmallest(self, matrix, k):",
      "        import heapq",
      "        n = len(matrix)",
      "        heap = [(matrix[r][0], r, 0) for r in range(n)]",
      "        heapq.heapify(heap)",
      "        for _ in range(k):",
      "            val, r, c = heapq.heappop(heap)",
      "            if c + 1 < n:",
      "                heapq.heappush(heap, (matrix[r][c+1], r, c+1))",
      "        return val",
    ],
    builder: buildSteps378,
  },
  692: {
    id: 692, difficulty: "medium", slug: "top-k-frequent-words",
    category: HEAP_CAT,
    title: { vi: "Top K Frequent Words", en: "Top K Frequent Words" },
    titleVi: { vi: "K từ xuất hiện nhiều nhất", en: "K most frequent words" },
    statement: { vi: "Cho danh sách từ và k, trả về k từ xuất hiện nhiều nhất; nếu bằng tần suất thì từ nhỏ hơn theo bảng chữ cái xếp trước. Nhập các từ cách bởi dấu phẩy.", en: "Given words and k, return the k most frequent; on a tie the lexicographically smaller word comes first. Enter words comma-separated." },
    defaultInput: "i,love,leetcode,i,love,coding",
    inputKind: "string", inputLabel: { vi: "Danh sách từ (dấu phẩy)", en: "Words (comma-separated)" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Đếm tần suất. Min-heap kích thước k với gốc = từ 'tệ nhất' (freq nhỏ / chữ lớn).", en: "Count frequencies. Size-k min-heap with the root being the 'worst' word (low freq / larger spelling)." },
      { vi: "Khi heap > k thì bỏ gốc. Cuối cùng sắp theo freq giảm, chữ tăng.", en: "When heap > k, drop the root. Finally sort by freq desc, word asc." },
    ],
    complexity: { time: "O(n log k)", space: "O(n)", note: { vi: "n từ, heap kích thước k.", en: "n words, heap of size k." } },
    code: [
      "class Solution:",
      "    def topKFrequent(self, words, k):",
      "        from collections import Counter",
      "        freq = Counter(words)",
      "        import heapq",
      "        heap = []",
      "        for w, f in freq.items():",
      "            heapq.heappush(heap, (f, [-ord(c) for c in w]))",
      "            if len(heap) > k: heapq.heappop(heap)",
      "        return sorted(freq, key=lambda w: (-freq[w], w))[:k]",
    ],
    builder: buildSteps692,
  },
  973: {
    id: 973, difficulty: "medium", slug: "k-closest-points-to-origin",
    category: HEAP_CAT,
    title: { vi: "K Closest Points to Origin", en: "K Closest Points to Origin" },
    titleVi: { vi: "K điểm gần gốc tọa độ nhất", en: "K closest points to origin" },
    statement: { vi: "Cho danh sách điểm và k, trả về k điểm gần gốc tọa độ (0,0) nhất. Nhập các điểm cách bởi ';', tọa độ cách bởi ','.", en: "Given points and k, return the k points closest to the origin (0,0). Enter points separated by ';', coords by ','." },
    defaultInput: "1,3;-2,2;5,8;0,1",
    inputKind: "string", inputLabel: { vi: "Điểm (cách ';')", en: "Points (sep ';')" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Khoảng cách² = x²+y². Max-heap kích thước k; vượt k thì bỏ điểm xa nhất.", en: "Distance² = x²+y². Size-k max-heap; when exceeding k, drop the farthest." },
    ],
    complexity: { time: "O(n log k)", space: "O(k)", note: { vi: "n điểm, heap kích thước k.", en: "n points, heap of size k." } },
    code: [
      "class Solution:",
      "    def kClosest(self, points, k):",
      "        import heapq",
      "        heap = []",
      "        for x, y in points:",
      "            d = x*x + y*y",
      "            heapq.heappush(heap, (-d, x, y))",
      "            if len(heap) > k: heapq.heappop(heap)",
      "        return [[x, y] for d, x, y in heap]",
    ],
    builder: buildSteps973,
  },
  1046: {
    id: 1046, difficulty: "easy", slug: "last-stone-weight",
    category: HEAP_CAT,
    title: { vi: "Last Stone Weight", en: "Last Stone Weight" },
    titleVi: { vi: "Trọng lượng hòn đá cuối", en: "Weight of the last stone" },
    statement: { vi: "Mỗi lần lấy 2 hòn nặng nhất đập nhau (x≥y): nếu x>y còn lại x−y. Trả về trọng lượng hòn cuối (hoặc 0). Nhập các số cách bởi dấu phẩy.", en: "Each turn smash the two heaviest stones (x≥y): if x>y, x−y remains. Return the last stone's weight (or 0). Enter numbers comma-separated." },
    defaultInput: "2,7,4,1,8,1",
    inputKind: "string", inputLabel: { vi: "Trọng lượng đá (dấu phẩy)", en: "Stone weights (comma-sep)" },
    extraParams: [],
    approach: [
      { vi: "Max-heap. Lặp: pop 2 hòn nặng nhất, nếu lệch thì push hiệu vào lại.", en: "Max-heap. Loop: pop the two heaviest; if they differ, push the difference back." },
    ],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Mỗi lần đập là vài thao tác heap.", en: "Each smash is a few heap operations." } },
    code: [
      "class Solution:",
      "    def lastStoneWeight(self, stones):",
      "        import heapq",
      "        heap = [-s for s in stones]",
      "        heapq.heapify(heap)",
      "        while len(heap) > 1:",
      "            x = -heapq.heappop(heap)",
      "            y = -heapq.heappop(heap)",
      "            if x > y:",
      "                heapq.heappush(heap, -(x - y))",
      "        return -heap[0] if heap else 0",
    ],
    builder: buildSteps1046,
  },
  215: {
    id: 215, difficulty: "medium", slug: "kth-largest-element-in-an-array",
    category: HEAP_CAT,
    title: { vi: "Kth Largest Element in an Array", en: "Kth Largest Element in an Array" },
    titleVi: { vi: "Phần tử lớn thứ k", en: "Kth largest element" },
    statement: { vi: "Cho mảng nums và k, trả về phần tử LỚN thứ k (theo thứ tự sắp xếp). Nhập mảng cách bởi dấu phẩy.", en: "Given nums and k, return the kth LARGEST element (in sorted order). Enter the array comma-separated." },
    defaultInput: "3,2,1,5,6,4",
    inputKind: "string", inputLabel: { vi: "Mảng số (dấu phẩy)", en: "Array (comma-separated)" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Min-heap kích thước k; vượt k thì bỏ gốc (nhỏ nhất). Gốc cuối cùng = lớn thứ k.", en: "Size-k min-heap; when exceeding k, drop the root (smallest). Final root = kth largest." },
    ],
    complexity: { time: "O(n log k)", space: "O(k)", note: { vi: "n số, heap kích thước k.", en: "n numbers, heap of size k." } },
    code: [
      "class Solution:",
      "    def findKthLargest(self, nums, k):",
      "        import heapq",
      "        heap = []",
      "        for x in nums:",
      "            heapq.heappush(heap, x)",
      "            if len(heap) > k:",
      "                heapq.heappop(heap)",
      "        return heap[0]",
    ],
    builder: buildSteps215,
  },
  253: {
    id: 253, difficulty: "medium", slug: "meeting-rooms-ii",
    category: HEAP_CAT,
    title: { vi: "Meeting Rooms II", en: "Meeting Rooms II" },
    titleVi: { vi: "Số phòng họp tối thiểu", en: "Minimum meeting rooms" },
    statement: { vi: "Cho các cuộc họp [start, end], tìm SỐ PHÒNG tối thiểu để tổ chức tất cả. Nhập các cuộc họp cách bởi ';', start/end cách bởi ','.", en: "Given meetings [start, end], find the MINIMUM number of rooms to host them all. Enter meetings separated by ';', start/end by ','." },
    defaultInput: "0,30;5,10;15,20",
    inputKind: "string", inputLabel: { vi: "Cuộc họp (cách ';')", en: "Meetings (sep ';')" },
    extraParams: [],
    approach: [
      { vi: "Sắp theo start. Min-heap thời điểm kết thúc. Nếu phòng kết thúc sớm nhất ≤ start thì tái dùng.", en: "Sort by start. Min-heap of end times. If earliest end ≤ start, reuse that room." },
      { vi: "Số phòng tối thiểu = kích thước heap lớn nhất (số cuộc họp chồng nhau nhiều nhất).", en: "Minimum rooms = max heap size (maximum overlapping meetings)." },
    ],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Sắp xếp O(n log n) + heap.", en: "Sort O(n log n) + heap." } },
    code: [
      "class Solution:",
      "    def minMeetingRooms(self, intervals):",
      "        intervals.sort(key=lambda x: x[0])",
      "        import heapq",
      "        heap = []  # end times",
      "        for s, e in intervals:",
      "            if heap and heap[0] <= s:",
      "                heapq.heappop(heap)",
      "            heapq.heappush(heap, e)",
      "        return len(heap)",
    ],
    builder: buildSteps253,
  },
  767: {
    id: 767, difficulty: "medium", slug: "reorganize-string",
    category: HEAP_CAT,
    title: { vi: "Reorganize String", en: "Reorganize String" },
    titleVi: { vi: "Sắp lại chuỗi không kề trùng", en: "Rearrange so no two adjacent equal" },
    statement: { vi: "Sắp xếp lại chuỗi sao cho không có 2 ký tự giống nhau cạnh nhau. Nếu không thể, trả về \"\". Nhập một chuỗi chữ thường.", en: "Rearrange the string so no two adjacent characters are equal. If impossible, return \"\". Enter a lowercase string." },
    defaultInput: "aab",
    inputKind: "string", inputLabel: { vi: "Chuỗi", en: "String" },
    extraParams: [],
    approach: [
      { vi: "Max-heap theo tần suất. Mỗi lượt lấy ký tự nhiều nhất, giữ lại 1 lượt rồi đẩy về.", en: "Max-heap by frequency. Each turn take the most frequent, hold it one turn, then push back." },
    ],
    complexity: { time: "O(n log k)", space: "O(k)", note: { vi: "k ≤ 26 ký tự.", en: "k ≤ 26 distinct chars." } },
    code: [
      "class Solution:",
      "    def reorganizeString(self, s):",
      "        from collections import Counter",
      "        import heapq",
      "        heap = [(-c, ch) for ch, c in Counter(s).items()]",
      "        heapq.heapify(heap)",
      "        res, prev = [], None",
      "        while heap:",
      "            c, ch = heapq.heappop(heap)",
      "            res.append(ch)",
      "            if prev and prev[0] < 0: heapq.heappush(heap, prev)",
      "            prev = (c + 1, ch)",
      "        out = ''.join(res)",
      "        return out if len(out) == len(s) else ''",
    ],
    builder: buildSteps767,
  },
  23: {
    id: 23,
    difficulty: "hard",
    slug: "merge-k-sorted-lists",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Merge k Sorted Lists", en: "Merge k Sorted Lists" },
    titleVi: { vi: "Gộp k danh sách đã sắp xếp", en: "Merge k sorted linked lists" },
    statement: {
      vi: "Cho k danh sách liên kết đã sắp xếp tăng dần, gộp tất cả thành 1 danh sách duy nhất cũng tăng dần. Nhập các list cách bởi ';', giá trị cách bởi ','.",
      en: "Given k sorted linked lists, merge them into one sorted list. Enter lists separated by ';', values by ','.",
    },
    defaultInput: "1,4,5;1,3,4;2,6",
    inputKind: "string",
    inputLabel: { vi: "Các list (cách bởi ';')", en: "Lists (separated by ';')" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Min-Heap O(n log k)", en: "Approach 1: Min-Heap O(n log k)" } },
          { value: "2", label: { vi: "Cách 2: Divide & Conquer O(n log k)", en: "Approach 2: Divide & Conquer O(n log k)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: Min-heap chứa head mỗi list. Pop nhỏ nhất, push node kế.", en: "Approach 1: Min-heap holds head of each list. Pop smallest, push next node." },
      { vi: "Cách 2: Merge từng cặp list (giống merge sort). Lặp cho tới còn 1 list.", en: "Approach 2: Merge lists pairwise (like merge sort). Repeat until one list remains." },
    ],
    complexity: { time: "O(n log k)", space: "O(k) / O(1)", note: { vi: "Cả 2 cách đều O(n log k). Heap dùng O(k), D&C dùng O(1) extra.", en: "Both are O(n log k). Heap uses O(k) space, D&C uses O(1) extra." } },
    code: [
      "import heapq",
      "",
      "class Solution:",
      "    def mergeKLists(self, lists):",
      "        heap = []",
      "        for i, lst in enumerate(lists):",
      "            if lst:",
      "                heapq.heappush(heap, (lst.val, i, lst))",
      "        dummy = node = ListNode(0)",
      "        while heap:",
      "            val, i, cur = heapq.heappop(heap)",
      "            node.next = cur",
      "            node = node.next",
      "            if cur.next:",
      "                heapq.heappush(heap, (cur.next.val, i, cur.next))",
      "        return dummy.next",
    ],
    code2: [
      "class Solution:",
      "    def mergeKLists(self, lists):",
      "        if not lists:",
      "            return None",
      "        while len(lists) > 1:",
      "            merged = []",
      "            for i in range(0, len(lists), 2):",
      "                l1 = lists[i]",
      "                l2 = lists[i+1] if i+1 < len(lists) else None",
      "                merged.append(self.mergeTwoLists(l1, l2))",
      "            lists = merged",
      "        return lists[0]",
      "",
      "    def mergeTwoLists(self, l1, l2):",
      "        dummy = ListNode(0)",
      "        cur = dummy",
      "        while l1 and l2:",
      "            if l1.val < l2.val:",
      "                cur.next = l1",
      "                l1 = l1.next",
      "            else:",
      "                cur.next = l2",
      "                l2 = l2.next",
      "            cur = cur.next",
      "        cur.next = l1 or l2",
      "        return dummy.next",
    ],
    codeLabel: { vi: "Cách 1: Min-Heap", en: "Approach 1: Min-Heap" },
    code2Label: { vi: "Cách 2: Divide & Conquer", en: "Approach 2: Divide & Conquer" },
    builder: buildSteps23,
  },
};
