// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * LeetCode 977: Squares of a Sorted Array.
 * Two-pointer: compare abs(left) vs abs(right), place larger square at the end of result.
 */
function buildSteps977(nums) {
  const n = nums.length;
  const result = new Array(n).fill(0);
  const steps = [];
  let left = 0;
  let right = n - 1;
  let pos = n - 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    sub: [...result],
    highlight: [left, right],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "left", value: left },
      { name: "right", value: right },
      { name: "pos", value: pos },
    ],
    note: {
      vi: `Hai con trỏ: left = 0, right = ${right}. Điền result từ cuối (pos = ${pos}).`,
      en: `Two pointers: left = 0, right = ${right}. Fill result from the end (pos = ${pos}).`,
    },
  });

  while (left <= right) {
    const absL = Math.abs(nums[left]);
    const absR = Math.abs(nums[right]);
    let chosen;
    if (absL > absR) {
      result[pos] = absL * absL;
      chosen = "left";
      steps.push({
        title: { vi: `|nums[${left}]| > |nums[${right}]|`, en: `|nums[${left}]| > |nums[${right}]|` },
        arr: [...nums],
        sub: [...result],
        highlight: [left, right],
        mark: [left],
        codeLines: [7, 8, 9],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "|left|", value: absL },
          { name: "|right|", value: absR },
          { name: "result[pos]", value: result[pos] },
          { name: "pos", value: pos },
        ],
        note: {
          vi: `|${nums[left]}| = ${absL} > |${nums[right]}| = ${absR}. result[${pos}] = ${absL}² = ${result[pos]}. Di chuyển left →.`,
          en: `|${nums[left]}| = ${absL} > |${nums[right]}| = ${absR}. result[${pos}] = ${absL}² = ${result[pos]}. Move left →.`,
        },
      });
      left++;
    } else {
      result[pos] = absR * absR;
      chosen = "right";
      steps.push({
        title: { vi: `|nums[${right}]| ≥ |nums[${left}]|`, en: `|nums[${right}]| ≥ |nums[${left}]|` },
        arr: [...nums],
        sub: [...result],
        highlight: [left, right],
        mark: [right],
        codeLines: [10, 11, 12],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "|left|", value: absL },
          { name: "|right|", value: absR },
          { name: "result[pos]", value: result[pos] },
          { name: "pos", value: pos },
        ],
        note: {
          vi: `|${nums[right]}| = ${absR} ≥ |${nums[left]}| = ${absL}. result[${pos}] = ${absR}² = ${result[pos]}. Di chuyển ← right.`,
          en: `|${nums[right]}| = ${absR} ≥ |${nums[left]}| = ${absL}. result[${pos}] = ${absR}² = ${result[pos]}. Move right ←.`,
        },
      });
      right--;
    }
    pos--;
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...result],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [13],
    vars: [{ name: "result", value: [...result] }],
    note: {
      vi: `Mảng bình phương đã sắp xếp: [${result.join(", ")}].`,
      en: `Sorted squares array: [${result.join(", ")}].`,
    },
  });

  return { original: [...nums], answer: result, steps };
}

/**
 * LeetCode 88: Merge Sorted Array.
 * Three pointers from the back: p1 = m-1, p2 = n-1, write = m+n-1.
 * Compare nums1[p1] vs nums2[p2], place the larger at write position.
 */
function buildSteps88(input, params) {
  const m = params.m;
  const n = params.n;
  const nums2Str = String(params.nums2 || "");
  const nums2 = nums2Str.split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const nums1 = [...input]; // already has trailing zeros

  const steps = [];
  let p1 = m - 1;
  let p2 = n - 1;
  let write = m + n - 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums1],
    sub: [...nums2, ...new Array(m).fill("")],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "m", value: m },
      { name: "n", value: n },
      { name: "p1", value: p1 },
      { name: "p2", value: p2 },
      { name: "write", value: write },
      { name: "nums2", value: `[${nums2.join(",")}]` },
    ],
    note: {
      vi: `nums1 = [${nums1.join(",")}] (m=${m} phần tử + ${n} chỗ trống). nums2 = [${nums2.join(",")}]. Điền từ cuối.`,
      en: `nums1 = [${nums1.join(",")}] (m=${m} elements + ${n} slots). nums2 = [${nums2.join(",")}]. Fill from end.`,
    },
  });

  while (p1 >= 0 && p2 >= 0) {
    const v1 = nums1[p1];
    const v2 = nums2[p2];
    if (v1 > v2) {
      nums1[write] = v1;
      steps.push({
        title: { vi: `nums1[${p1}]=${v1} > nums2[${p2}]=${v2}`, en: `nums1[${p1}]=${v1} > nums2[${p2}]=${v2}` },
        arr: [...nums1],
        highlight: [p1, write],
        mark: [],
        codeLines: [6, 7, 8],
        vars: [
          { name: "p1", value: p1 },
          { name: "p2", value: p2 },
          { name: "write", value: write },
          { name: "placed", value: v1 },
        ],
        note: {
          vi: `${v1} > ${v2} → đặt ${v1} tại vị trí ${write}. p1--.`,
          en: `${v1} > ${v2} → place ${v1} at position ${write}. p1--.`,
        },
      });
      p1--;
    } else {
      nums1[write] = v2;
      steps.push({
        title: { vi: `nums2[${p2}]=${v2} ≥ nums1[${p1}]=${v1}`, en: `nums2[${p2}]=${v2} ≥ nums1[${p1}]=${v1}` },
        arr: [...nums1],
        highlight: [write],
        mark: [],
        codeLines: [9, 10, 11],
        vars: [
          { name: "p1", value: p1 },
          { name: "p2", value: p2 },
          { name: "write", value: write },
          { name: "placed", value: v2 },
        ],
        note: {
          vi: `${v2} ≥ ${v1} → đặt ${v2} (từ nums2) tại vị trí ${write}. p2--.`,
          en: `${v2} ≥ ${v1} → place ${v2} (from nums2) at position ${write}. p2--.`,
        },
      });
      p2--;
    }
    write--;
  }

  // Copy remaining nums2 elements
  while (p2 >= 0) {
    nums1[write] = nums2[p2];
    steps.push({
      title: { vi: `Copy nums2[${p2}]=${nums2[p2]}`, en: `Copy nums2[${p2}]=${nums2[p2]}` },
      arr: [...nums1],
      highlight: [write],
      mark: [],
      codeLines: [12, 13],
      vars: [
        { name: "p2", value: p2 },
        { name: "write", value: write },
        { name: "placed", value: nums2[p2] },
      ],
      note: {
        vi: `p1 hết. Copy nums2[${p2}]=${nums2[p2]} vào vị trí ${write}.`,
        en: `p1 exhausted. Copy nums2[${p2}]=${nums2[p2]} into position ${write}.`,
      },
    });
    p2--;
    write--;
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums1],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [14],
    vars: [{ name: "nums1", value: [...nums1] }],
    note: {
      vi: `Mảng đã gộp: [${nums1.join(", ")}].`,
      en: `Merged array: [${nums1.join(", ")}].`,
    },
  });

  return { original: input, answer: nums1, steps };
}

/**
 * LeetCode 27: Remove Element.
 * Two-pointer in-place: write pointer k, read pointer i.
 * If nums[i] != val, copy to nums[k] and advance k.
 */
function buildSteps27(nums, params) {
  const val = params.val;
  const arr = [...nums];
  const steps = [];
  let left = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "val", value: val },
      { name: "left (write)", value: 0 },
      { name: "right (read)", value: 0 },
    ],
    note: {
      vi: `Xóa tất cả phần tử bằng ${val}.\nleft = con trỏ ghi (write pointer)\nright = con trỏ đọc (read pointer)`,
      en: `Remove all elements equal to ${val}.\nleft = write pointer\nright = read pointer`,
    },
  });

  for (let right = 0; right < arr.length; right++) {
    if (arr[right] !== val) {
      arr[left] = arr[right];
      steps.push({
        title: { vi: `nums[right=${right}]=${nums[right]} ≠ ${val} → giữ`, en: `nums[right=${right}]=${nums[right]} ≠ ${val} → keep` },
        arr: [...arr],
        highlight: [right],
        mark: Array.from({ length: left + 1 }, (_, x) => x),
        codeLines: [4, 5, 6],
        vars: [
          { name: "right (read)", value: right },
          { name: "nums[right]", value: nums[right] },
          { name: "left (write)", value: left + 1 },
          { name: "action", value: `nums[${left}] = nums[${right}] → left++` },
        ],
        note: {
          vi: `nums[${right}]=${nums[right]} ≠ ${val} → copy vào nums[left=${left}].\nleft: ${left} → ${left + 1}`,
          en: `nums[${right}]=${nums[right]} ≠ ${val} → copy to nums[left=${left}].\nleft: ${left} → ${left + 1}`,
        },
      });
      left++;
    } else {
      steps.push({
        title: { vi: `nums[right=${right}]=${nums[right]} == ${val} → bỏ`, en: `nums[right=${right}]=${nums[right]} == ${val} → skip` },
        arr: [...arr],
        highlight: [right],
        mark: Array.from({ length: left }, (_, x) => x),
        codeLines: [4],
        vars: [
          { name: "right (read)", value: right },
          { name: "nums[right]", value: nums[right] },
          { name: "left (write)", value: left },
          { name: "action", value: "skip (equals val)" },
        ],
        note: {
          vi: `nums[${right}]=${nums[right]} == ${val} → bỏ qua.\nleft giữ nguyên = ${left}`,
          en: `nums[${right}]=${nums[right]} == ${val} → skip.\nleft stays at ${left}`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: Array.from({ length: left }, (_, x) => x),
    final: true,
    codeLines: [7],
    vars: [
      { name: "left (result)", value: left },
      { name: "nums[0..left-1]", value: `[${arr.slice(0, left).join(", ")}]` },
    ],
    note: {
      vi: `Sau khi xóa: left = ${left} phần tử còn lại = [${arr.slice(0, left).join(", ")}].`,
      en: `After removal: left = ${left} elements remain = [${arr.slice(0, left).join(", ")}].`,
    },
  });

  return { original: [...nums], answer: left, steps };
}

/**
 * LeetCode 905: Sort Array By Parity.
 * Two pointers: left finds odd, right finds even, swap them.
 */
function buildSteps905(nums) {
  const arr = [...nums];
  const n = arr.length;
  const steps = [];
  let left = 0;
  let right = n - 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [left, right],
    mark: [],
    codeLines: [3, 4],
    vars: [{ name: "left", value: left }, { name: "right", value: right }],
    note: {
      vi: `Hai con trỏ: left = 0 (tìm lẻ), right = ${right} (tìm chẵn). Khi gặp → hoán đổi.`,
      en: `Two pointers: left = 0 (find odd), right = ${right} (find even). When found → swap.`,
    },
  });

  while (left < right) {
    if (arr[left] % 2 === 0) {
      steps.push({
        title: { vi: `left=${left}: ${arr[left]} chẵn → tiến`, en: `left=${left}: ${arr[left]} even → advance` },
        arr: [...arr],
        highlight: [left],
        mark: Array.from({ length: left }, (_, x) => x),
        codeLines: [5, 6],
        vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "arr[left]", value: arr[left] }],
        note: { vi: `${arr[left]} chẵn, đúng vị trí. left++.`, en: `${arr[left]} is even, correct side. left++.` },
      });
      left++;
    } else if (arr[right] % 2 === 1) {
      steps.push({
        title: { vi: `right=${right}: ${arr[right]} lẻ → lùi`, en: `right=${right}: ${arr[right]} odd → retreat` },
        arr: [...arr],
        highlight: [right],
        mark: [],
        codeLines: [7, 8],
        vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "arr[right]", value: arr[right] }],
        note: { vi: `${arr[right]} lẻ, đúng vị trí. right--.`, en: `${arr[right]} is odd, correct side. right--.` },
      });
      right--;
    } else {
      const tmp = arr[left];
      arr[left] = arr[right];
      arr[right] = tmp;
      steps.push({
        title: { vi: `Hoán đổi [${left}]↔[${right}]`, en: `Swap [${left}]↔[${right}]` },
        arr: [...arr],
        highlight: [left, right],
        mark: [],
        codeLines: [9, 10],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "swapped", value: `${arr[left]}↔${arr[right]}` },
        ],
        note: {
          vi: `arr[${left}]=${arr[right]} (lẻ) và arr[${right}]=${arr[left]} (chẵn) → hoán đổi. left++, right--.`,
          en: `arr[${left}]=${arr[right]} (odd) and arr[${right}]=${arr[left]} (even) → swap. left++, right--.`,
        },
      });
      left++;
      right--;
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [11],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Tất cả chẵn ở trái, lẻ ở phải: [${arr.join(", ")}].`,
      en: `All evens on the left, odds on the right: [${arr.join(", ")}].`,
    },
  });

  return { original: [...nums], answer: arr, steps };
}

/**
 * LeetCode 283: Move Zeroes.
 * Two-pointer: write pointer places non-zeros, then fill remaining with 0.
 */
function buildSteps283(nums) {
  const arr = [...nums];
  const n = arr.length;
  const steps = [];
  let write = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [{ name: "write", value: 0 }],
    note: {
      vi: `Di chuyển tất cả số 0 về cuối, giữ thứ tự các số khác 0. write = vị trí ghi tiếp.`,
      en: `Move all zeros to the end, maintaining relative order of non-zeros. write = next write position.`,
    },
  });

  for (let i = 0; i < n; i++) {
    if (arr[i] !== 0) {
      arr[write] = arr[i];
      if (write !== i) arr[i] = 0;
      steps.push({
        title: { vi: `nums[${i}]=${nums[i]} ≠ 0 → ghi tại [${write}]`, en: `nums[${i}]=${nums[i]} ≠ 0 → write at [${write}]` },
        arr: [...arr],
        highlight: [write],
        mark: Array.from({ length: write + 1 }, (_, x) => x),
        codeLines: [4, 5, 6],
        vars: [
          { name: "i", value: i },
          { name: "write", value: write + 1 },
          { name: "placed", value: nums[i] },
        ],
        note: {
          vi: `${nums[i]} khác 0 → đặt tại vị trí ${write}. write → ${write + 1}.`,
          en: `${nums[i]} is non-zero → place at position ${write}. write → ${write + 1}.`,
        },
      });
      write++;
    } else {
      steps.push({
        title: { vi: `nums[${i}]=0 → bỏ qua`, en: `nums[${i}]=0 → skip` },
        arr: [...arr],
        highlight: [i],
        mark: Array.from({ length: write }, (_, x) => x),
        codeLines: [4],
        vars: [
          { name: "i", value: i },
          { name: "write", value: write },
        ],
        note: {
          vi: `nums[${i}]=0 → bỏ qua, write giữ nguyên.`,
          en: `nums[${i}]=0 → skip, write stays at ${write}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: Array.from({ length: write }, (_, x) => x),
    final: true,
    codeLines: [7],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Kết quả: [${arr.join(", ")}]. ${write} phần tử khác 0 ở đầu, ${n - write} số 0 ở cuối.`,
      en: `Result: [${arr.join(", ")}]. ${write} non-zeros at front, ${n - write} zeros at end.`,
    },
  });

  return { original: [...nums], answer: arr, steps };
}

/**
 * LeetCode 26: Remove Duplicates from Sorted Array.
 * Two-pointer in-place: write pointer k tracks the next unique slot.
 * If nums[i] != nums[k-1], we found a new unique value → write it.
 */
function buildSteps26(nums) {
  const arr = [...nums];
  const n = arr.length;
  const steps = [];
  if (n === 0) {
    steps.push({
      title: { vi: "Mảng rỗng", en: "Empty array" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "k", value: 0 }],
      note: { vi: "Mảng rỗng → k = 0.", en: "Empty array → k = 0." },
    });
    return { original: [...nums], answer: 0, steps };
  }
  let k = 1;
  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [0],
    mark: [0],
    codeLines: [3, 4],
    vars: [{ name: "k", value: 1 }, { name: "nums[0]", value: arr[0] }],
    note: {
      vi: `Mảng đã sắp xếp. k = vị trí ghi tiếp.\nnums[0]=${arr[0]} luôn được giữ → k = 1.`,
      en: `Sorted array. k = next write position.\nnums[0]=${arr[0]} is always kept → k = 1.`,
    },
  });

  for (let i = 1; i < n; i++) {
    if (arr[i] !== arr[k - 1]) {
      arr[k] = arr[i];
      steps.push({
        title: { vi: `nums[${i}]=${nums[i]} mới → giữ`, en: `nums[${i}]=${nums[i]} new → keep` },
        arr: [...arr],
        highlight: [i],
        mark: Array.from({ length: k + 1 }, (_, x) => x),
        codeLines: [5, 6, 7, 8],
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: nums[i] },
          { name: "nums[k-1]", value: arr[k - 1] },
          { name: "k", value: k + 1 },
          { name: "action", value: "new value, write" },
        ],
        note: {
          vi: `${nums[i]} ≠ ${arr[k - 1]} (nums[k-1]) → giá trị mới. Ghi vào vị trí ${k}. k → ${k + 1}.`,
          en: `${nums[i]} ≠ ${arr[k - 1]} (nums[k-1]) → new value. Write to position ${k}. k → ${k + 1}.`,
        },
      });
      k++;
    } else {
      steps.push({
        title: { vi: `nums[${i}]=${nums[i]} trùng → bỏ`, en: `nums[${i}]=${nums[i]} duplicate → skip` },
        arr: [...arr],
        highlight: [i],
        mark: Array.from({ length: k }, (_, x) => x),
        codeLines: [5],
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: nums[i] },
          { name: "nums[k-1]", value: arr[k - 1] },
          { name: "k", value: k },
          { name: "action", value: "duplicate, skip" },
        ],
        note: {
          vi: `${nums[i]} == ${arr[k - 1]} (nums[k-1]) → trùng, bỏ qua. k giữ nguyên.`,
          en: `${nums[i]} == ${arr[k - 1]} (nums[k-1]) → duplicate, skip. k unchanged.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: Array.from({ length: k }, (_, x) => x),
    final: true,
    codeLines: [9],
    vars: [
      { name: "k", value: k },
      { name: "result", value: arr.slice(0, k) },
    ],
    note: {
      vi: `${k} phần tử khác nhau còn lại = [${arr.slice(0, k).join(", ")}].`,
      en: `${k} unique elements remain = [${arr.slice(0, k).join(", ")}].`,
    },
  });

  return { original: [...nums], answer: k, steps };
}

/**
 * LeetCode 485: Max Consecutive Ones.
 * Single-pass counter: track current run of 1s, update max when run breaks.
 */
function buildSteps485(nums) {
  const steps = [];
  let curr = 0;
  let maxRun = 0;
  let curStart = 0;
  let bestL = 0;
  let bestR = -1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [{ name: "curr", value: 0 }, { name: "max", value: 0 }],
    note: {
      vi: `curr = số 1 liên tiếp hiện tại. max = kỷ lục lớn nhất.`,
      en: `curr = current run of 1s. max = best run seen so far.`,
    },
  });

  const inRange = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === 1) {
      if (curr === 0) curStart = i;
      curr++;
      const updated = curr > maxRun;
      if (updated) {
        maxRun = curr;
        bestL = curStart;
        bestR = i;
      }
      steps.push({
        title: { vi: `nums[${i}]=1 → curr=${curr}`, en: `nums[${i}]=1 → curr=${curr}` },
        arr: [...nums],
        highlight: inRange(curStart, i),
        mark: [],
        codeLines: [5, 6, 7],
        vars: [
          { name: "i", value: i },
          { name: "curr", value: curr },
          { name: "max", value: maxRun },
        ],
        note: {
          vi: `1 → tăng curr=${curr}. max=${maxRun}${updated ? " ✓ cập nhật" : ""}.`,
          en: `1 → curr=${curr}. max=${maxRun}${updated ? " ✓ updated" : ""}.`,
        },
      });
    } else {
      steps.push({
        title: { vi: `nums[${i}]=0 → reset curr`, en: `nums[${i}]=0 → reset curr` },
        arr: [...nums],
        highlight: [i],
        mark: [],
        codeLines: [8, 9],
        vars: [
          { name: "i", value: i },
          { name: "curr", value: 0 },
          { name: "max", value: maxRun },
        ],
        note: {
          vi: `0 → reset curr=0. max vẫn = ${maxRun}.`,
          en: `0 → reset curr=0. max stays at ${maxRun}.`,
        },
      });
      curr = 0;
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestR >= 0 ? inRange(bestL, bestR) : [],
    final: true,
    codeLines: [10],
    vars: [
      { name: "max", value: maxRun },
      { name: "run", value: bestR >= 0 ? `[${bestL}..${bestR}]` : "none" },
    ],
    note: {
      vi: `Số 1 liên tiếp dài nhất = ${maxRun}${bestR >= 0 ? ` (đoạn [${bestL}..${bestR}])` : ""}.`,
      en: `Longest run of 1s = ${maxRun}${bestR >= 0 ? ` (segment [${bestL}..${bestR}])` : ""}.`,
    },
  });

  return { original: [...nums], answer: maxRun, steps };
}

// ─── 1089: Duplicate Zeros ───
// Two-pointer: read (right-to-left) and write (right-to-left, starts at n+zeros-1).
// Pass 1: count zeros. Pass 2: for each element, copy once (non-zero) or twice (zero).
function buildSteps1089(nums) {
  const n = nums.length;
  const arr = [...nums];
  const steps = [];

  // Pass 1: count zeros.
  let zeros = 0;
  for (let left = 0; left < n; left++) { if (arr[left] === 0) zeros++; }

  steps.push({
    title: { vi: "Bước 1: Đếm số 0, đặt con trỏ right", en: "Step 1: Count zeros, set right pointer" },
    arr: [...arr], sub: null,
    highlight: arr.map((v, i) => v === 0 ? i : -1).filter((x) => x >= 0),
    mark: [], codeLines: [3, 4, 5],
    vars: [
      { name: "zeros", value: zeros },
      { name: "left", value: n - 1 },
      { name: "right", value: n + zeros - 1 },
    ],
    note: {
      vi:
        `Có ${zeros} số 0 → mỗi cái chiếm thêm 1 ô.\n` +
        `• left  bắt đầu từ CUỐI mảng gốc (index ${n - 1}) — con trỏ ĐỌC.\n` +
        `• right bắt đầu tại n + zeros - 1 = ${n + zeros - 1} — con trỏ GHI (chỉ ghi khi right < n).`,
      en:
        `${zeros} zeros → each takes one extra slot.\n` +
        `• left  starts at the END of the original array (index ${n - 1}) — READ pointer.\n` +
        `• right starts at n + zeros - 1 = ${n + zeros - 1} — WRITE pointer (only write when right < n).`,
    },
  });

  // Pass 2: fill right-to-left.
  let right = n + zeros - 1;
  for (let left = n - 1; left >= 0; left--) {
    if (arr[left] === 0) {
      // Write two zeros.
      if (right < n) { arr[right] = 0; }
      right--;
      if (right < n) { arr[right] = 0; }
      const wa = right + 1, wb = right;
      steps.push({
        title: { vi: `left=${left}: gặp 0 → ghi 0 hai lần tại right=${wa}, ${wb}`, en: `left=${left}: zero → write 0 twice at right=${wa}, ${wb}` },
        arr: [...arr],
        highlight: [wa, wb].filter((x) => x >= 0 && x < n),
        mark: arr.map((_, k) => k <= left ? -1 : k).filter((x) => x >= 0),
        codeLines: [8, 9, 10, 11],
        vars: [
          { name: "left  (read)", value: left },
          { name: "right (write)", value: right },
          { name: "arr[left]", value: 0 },
          { name: "action", value: "write 0 × 2" },
          { name: "arr", value: `[${arr.join(",")}]` },
        ],
        note: {
          vi: `arr[left=${left}] = 0 → nhân đôi: ghi 0 tại right=${wa} và right=${wb}. Cả 2 con trỏ đều lùi.`,
          en: `arr[left=${left}] = 0 → duplicate: write 0 at right=${wa} and right=${wb}. Both pointers step back.`,
        },
      });
    } else {
      // Write once.
      if (right < n) { arr[right] = arr[left]; }
      const w = right;
      steps.push({
        title: { vi: `left=${left}: arr[left]=${nums[left]} → copy sang right=${w}`, en: `left=${left}: arr[left]=${nums[left]} → copy to right=${w}` },
        arr: [...arr],
        highlight: w < n ? [w] : [],
        mark: arr.map((_, k) => k <= left ? -1 : k).filter((x) => x >= 0),
        codeLines: [6, 7],
        vars: [
          { name: "left  (read)", value: left },
          { name: "right (write)", value: w },
          { name: "arr[left]", value: nums[left] },
          { name: "action", value: w >= n ? "dropped (out of bounds)" : `write ${nums[left]}` },
          { name: "arr", value: `[${arr.join(",")}]` },
        ],
        note: {
          vi: `arr[left=${left}] = ${nums[left]} (khác 0) → copy sang right=${w}${w >= n ? " (bị bỏ, ngoài mảng)" : ""}. right lùi 1.`,
          en: `arr[left=${left}] = ${nums[left]} (non-zero) → copy to right=${w}${w >= n ? " (dropped)" : ""}. right steps back.`,
        },
      });
    }
    right--;
  }

  const fs = {
    title: { vi: `Kết quả: [${arr.join(",")}]`, en: `Result: [${arr.join(",")}]` },
    arr: [...arr], highlight: [], mark: arr.map((_, i) => i),
    final: true, codeLines: [12],
    vars: [{ name: "result", value: `[${arr.join(",")}]` }],
    note: { vi: `Hoàn tất. left và right đều về 0. Mọi số 0 đã được nhân đôi tại chỗ.`, en: `Done. left and right both reached 0. Every zero duplicated in-place.` },
  };
  steps.push(fs);
  return { input: nums, answer: arr, steps };
}

// ─── 19: Remove Nth Node From End of List ───
// Two pointers: fast goes n+1 ahead, then both advance. When fast=null, slow.next is the target.
function buildSteps19(input, params) {
  const vals = String(input).split(",").map((s) => Number(s.trim()));
  const n = params.n !== undefined ? Number(params.n) : 2;
  const steps = [];

  // Build graph representation of linked list: dummy → v1 → v2 → ... → null
  const nodeIds = ["D", ...vals.map((v, i) => `${v}`)];
  const allNodes = nodeIds.map((lbl, i) => ({ id: i, label: lbl }));
  const allEdges = [];
  for (let i = 0; i < allNodes.length - 1; i++) {
    allEdges.push({ u: i, v: i + 1, w: "" });
  }

  let fast = 0, slow = 0;

  function graphSnap(title, note, hlNodesOverride, removedIdx, vars, codeLines) {
    // Nodes keep original short labels; fast/slow shown by annotation
    const nodes = allNodes.map((nd) => ({ id: nd.id, label: nodeIds[nd.id] }));

    // hlNodes = fast node (amber border), visitedNodes = slow node (green fill)
    const hl = [];
    if (fast >= 0 && fast < allNodes.length) hl.push(fast);
    const visited = [slow];

    // Annotations: "fast" above fast node, "slow" above slow node
    const annotations = {};
    if (fast >= 0 && fast < allNodes.length) annotations[fast] = "fast";
    annotations[slow] = "slow";

    return {
      title,
      arr: [],
      graph: {
        nodes,
        edges: allEdges,
        hlNodes: hl,
        hlEdges: [],
        visitedNodes: visited,
        annotations,
      },
      highlight: [], mark: [],
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    };
  }

  const LEGEND = { vi: "\n\n🟡 viền vàng = fast  |  🟢 fill xanh = slow", en: "\n\n🟡 amber border = fast  |  🟢 green fill = slow" };

  steps.push(graphSnap(
    { vi: "Khởi tạo: dummy → linked list", en: "Init: dummy → linked list" },
    {
      vi: `D → ${vals.join(" → ")} → null\nfast = slow = dummy (node D).\nBước 1: fast đi trước n+1 = ${n + 1} bước.` + LEGEND.vi,
      en: `D → ${vals.join(" → ")} → null\nfast = slow = dummy (node D).\nStep 1: fast advances n+1 = ${n + 1} steps ahead.` + LEGEND.en,
    },
    [0], null,
    [{ name: "linked list", value: `D → ${vals.join(" → ")} → null` }, { name: "n", value: n }, { name: "fast", value: "D" }, { name: "slow", value: "D" }],
    [3, 4, 5]
  ));

  // Step 1: fast advances n+1 steps.
  for (let i = 0; i < n + 1 && fast < allNodes.length - 1; i++) {
    fast++;
    steps.push(graphSnap(
      { vi: `fast → ${nodeIds[fast]} (bước ${i + 1}/${n + 1})`, en: `fast → ${nodeIds[fast]} (step ${i + 1}/${n + 1})` },
      {
        vi: `fast tiến 1 bước → ${nodeIds[fast]}. Gap = ${fast - slow}.`,
        en: `fast advances → ${nodeIds[fast]}. Gap = ${fast - slow}.`,
      },
      [fast, slow], null,
      [{ name: "fast", value: `${nodeIds[fast]} (index ${fast})` }, { name: "slow", value: `${nodeIds[slow]} (index ${slow})` }, { name: "gap", value: fast - slow }],
      [6, 7, 8]
    ));
  }

  // Step 2: both advance until fast passes the last node.
  while (fast < allNodes.length) {
    fast++;
    slow++;
    const atEnd = fast >= allNodes.length;
    steps.push(graphSnap(
      { vi: `Cùng đi: fast=${atEnd ? "null" : nodeIds[fast]}, slow=${nodeIds[slow]}`, en: `Together: fast=${atEnd ? "null" : nodeIds[fast]}, slow=${nodeIds[slow]}` },
      {
        vi: atEnd
          ? `fast = null → DỪNG.\nslow = ${nodeIds[slow]}. slow.next = ${nodeIds[slow + 1]} ← nút thứ ${n} từ cuối cần XÓA.`
          : `Cả 2 tiến 1 bước. Gap vẫn = ${n + 1}.`,
        en: atEnd
          ? `fast = null → STOP.\nslow = ${nodeIds[slow]}. slow.next = ${nodeIds[slow + 1]} ← the ${n}th node from end to REMOVE.`
          : `Both advance 1. Gap stays = ${n + 1}.`,
      },
      [fast < allNodes.length ? fast : -1, slow].filter(x => x >= 0 && x < allNodes.length), null,
      [
        { name: "fast", value: atEnd ? "null (past end)" : `${nodeIds[fast]}` },
        { name: "slow", value: `${nodeIds[slow]}` },
        { name: "to remove", value: `slow.next = ${nodeIds[slow + 1]}` },
      ],
      [9, 10, 11, 12]
    ));
    if (atEnd) break;
  }

  // Remove node
  const removedIdx = slow + 1;
  const removedVal = nodeIds[removedIdx];
  const resultVals = vals.filter((_, i) => i !== removedIdx - 1);

  // Final: show graph with removed node highlighted differently
  const finalNodes = allNodes.filter((_, i) => i !== removedIdx);
  const finalEdges = [];
  for (let i = 0; i < finalNodes.length - 1; i++) {
    finalEdges.push({ u: finalNodes[i].id, v: finalNodes[i + 1].id, w: "" });
  }

  const fs = {
    title: { vi: `Xóa nút ${removedVal} → [${resultVals.join(",")}]`, en: `Remove ${removedVal} → [${resultVals.join(",")}]` },
    arr: [],
    graph: {
      nodes: finalNodes,
      edges: finalEdges,
      hlNodes: [],
      hlEdges: [],
      visitedNodes: finalNodes.map((n) => n.id),
    },
    highlight: [], mark: [],
    final: true, codeLines: [13, 14, 15],
    vars: [
      { name: "removed", value: `${removedVal} (thứ ${n} từ cuối / ${n}th from end)` },
      { name: "result", value: resultVals.join(" → ") + " → null" },
    ],
    note: {
      vi: `slow.next = slow.next.next → bỏ nút ${removedVal}.\nKết quả: ${resultVals.join(" → ")} → null.`,
      en: `slow.next = slow.next.next → skip ${removedVal}.\nResult: ${resultVals.join(" → ")} → null.`,
    },
  };
  steps.push(fs);

  return { input, answer: `[${resultVals.join(",")}]`, steps };
}

// ─── 234: Palindrome Linked List ───
function buildSteps234(input) {
  const vals = String(input).split(",").map((s) => Number(s.trim()));
  const n = vals.length;
  const steps = [];

  // Graph nodes & edges for linked list
  const nodeIds = vals.map(String);
  const allNodes = vals.map((v, i) => ({ id: i, label: String(v) }));
  const allEdges = [];
  for (let i = 0; i < n - 1; i++) allEdges.push({ u: i, v: i + 1, w: "" });

  let slow = 0, fast = 0;

  function graphSnap(title, note, annotations, hlNodes, visitedNodes, vars, codeLines) {
    return {
      title, arr: [],
      graph: { nodes: allNodes, edges: allEdges, hlNodes: hlNodes || [], hlEdges: [], visitedNodes: visitedNodes || [], annotations: annotations || {} },
      highlight: [], mark: [],
      codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  // Step 1: Find middle
  steps.push(graphSnap(
    { vi: "Bước 1: Tìm giữa (slow/fast)", en: "Step 1: Find middle (slow/fast)" },
    { vi: `slow đi 1 bước, fast đi 2 bước. Khi fast tới cuối → slow ở giữa.`, en: `slow moves 1 step, fast moves 2 steps. When fast reaches the end → slow is at the middle.` },
    { [slow]: "slow", [fast]: "fast" }, [fast], [slow],
    [{ name: "slow", value: `${vals[slow]} (index ${slow})` }, { name: "fast", value: `${vals[fast]} (index ${fast})` }],
    [3, 4, 5, 6]
  ));

  while (fast < n - 1 && fast + 1 < n) {
    slow++; fast += 2;
    if (fast >= n) fast = n - 1;
    const ann = {}; ann[slow] = "slow"; if (fast < n) ann[fast] = "fast";
    steps.push(graphSnap(
      { vi: `slow=${vals[slow]}, fast=${fast < n ? vals[fast] : "end"}`, en: `slow=${vals[slow]}, fast=${fast < n ? vals[fast] : "end"}` },
      { vi: `slow → index ${slow} (${vals[slow]}), fast → index ${fast}.`, en: `slow → index ${slow} (${vals[slow]}), fast → index ${fast}.` },
      ann, fast < n ? [fast] : [], [slow],
      [{ name: "slow", value: `${vals[slow]} (index ${slow})` }, { name: "fast", value: fast < n ? `${vals[fast]} (index ${fast})` : "end" }],
      [5, 6]
    ));
    if (fast >= n - 1) break;
  }

  // Step 2: Reverse second half — show each step with edges changing
  const mid = slow;
  const secondHalf = vals.slice(mid);
  const reversed = [...secondHalf].reverse();

  // Track which edges have been reversed (for visualization)
  let reversedEdges = new Set(); // set of "from-to" reversed

  function getEdges() {
    // Build edges: original for first half, reversed for processed second half
    const edges = [];
    // First half edges (always forward)
    for (let i = 0; i < mid - 1; i++) edges.push({ u: i, v: i + 1, w: "" });
    // Second half: reversed edges we've processed + remaining forward
    for (let i = mid; i < n - 1; i++) {
      if (reversedEdges.has(i)) {
        edges.push({ u: i + 1, v: i, w: "" }); // reversed arrow
      } else {
        edges.push({ u: i, v: i + 1, w: "" }); // original forward
      }
    }
    // Edge from first half end to second half start (mid-1 → mid) if exists
    if (mid > 0 && mid < n) edges.push({ u: mid - 1, v: mid, w: "" });
    return edges;
  }

  function graphSnapWithEdges(title, note, annotations, hlNodes, visitedNodes, vars, codeLines) {
    return {
      title, arr: [],
      graph: { nodes: allNodes, edges: getEdges(), hlNodes: hlNodes || [], hlEdges: [], visitedNodes: visitedNodes || [], annotations: annotations || {} },
      highlight: [], mark: [],
      codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  // Simulate reverse step by step
  let prevIdx = -1; // -1 = null
  let slowIdx = mid;
  steps.push(graphSnapWithEdges(
    { vi: `Bước 2: Đảo nửa sau, prev=null, slow=${vals[mid]}`, en: `Step 2: Reverse 2nd half, prev=null, slow=${vals[mid]}` },
    { vi: `Bắt đầu đảo từ index ${mid}. prev = null, cur = ${vals[mid]}.\nMũi tên sẽ đảo chiều khi mỗi node được xử lý.`, en: `Start reversing from index ${mid}. prev = null, cur = ${vals[mid]}.\nArrows will reverse direction as each node is processed.` },
    { [slowIdx]: "slow" }, [slowIdx], [],
    [{ name: "prev", value: "null" }, { name: "slow", value: `${vals[slowIdx]} (index ${slowIdx})` }],
    [8, 9, 10]
  ));

  while (slowIdx < n) {
    const nxtIdx = slowIdx + 1 < n ? slowIdx + 1 : -1;
    // Reverse the edge: slowIdx now points back to prevIdx
    if (slowIdx < n - 1) reversedEdges.add(slowIdx);

    const ann = {};
    if (prevIdx >= 0) ann[prevIdx] = "prev";
    ann[slowIdx] = "slow";
    if (nxtIdx >= 0 && nxtIdx < n) ann[nxtIdx] = "nxt";

    prevIdx = slowIdx;
    slowIdx = nxtIdx >= 0 ? nxtIdx : n;

    if (slowIdx < n) {
      steps.push(graphSnapWithEdges(
        { vi: `prev=${vals[prevIdx]}, slow=${vals[slowIdx]}`, en: `prev=${vals[prevIdx]}, slow=${vals[slowIdx]}` },
        { vi: `Đảo mũi tên: ${vals[prevIdx]}←${vals[slowIdx]} (thay vì ${vals[prevIdx]}→${vals[slowIdx]}). Tiến.`, en: `Reverse arrow: ${vals[prevIdx]}←${vals[slowIdx]} (instead of ${vals[prevIdx]}→${vals[slowIdx]}). Advance.` },
        ann, [prevIdx], [],
        [{ name: "prev", value: `${vals[prevIdx]} (index ${prevIdx})` }, { name: "slow", value: `${vals[slowIdx]} (index ${slowIdx})` }, { name: "reversed so far", value: vals.slice(mid, prevIdx + 1).reverse().join("←") }],
        [10, 11, 12, 13]
      ));
    } else {
      steps.push(graphSnapWithEdges(
        { vi: `Đảo xong! prev=${vals[prevIdx]}, slow=null`, en: `Reverse done! prev=${vals[prevIdx]}, slow=null` },
        { vi: `cur = null → DỪNG. Nửa sau: ${reversed.join("←")} (mũi tên đảo). prev = head mới.`, en: `cur = null → STOP. Second half: ${reversed.join("←")} (arrows reversed). prev = new head.` },
        { [prevIdx]: "prev" }, [prevIdx], Array.from({ length: n - mid }, (_, i) => mid + i),
        [{ name: "prev (new head)", value: `${vals[prevIdx]}` }, { name: "reversed half", value: reversed.join("←") }],
        [10, 11, 12, 13]
      ));
    }
  }

  // Step 3: Compare both halves — show left/right step by step
  // right traverses the reversed half: starts at n-1, follows reversed arrows
  const firstHalf = vals.slice(0, reversed.length);
  let isPalin = true;
  let mismatchIdx = -1;

  for (let i = 0; i < reversed.length; i++) {
    const leftIdx = i;
    const rightIdx = n - 1 - i; // right walks reversed: n-1, n-2, ...
    const match = firstHalf[i] === reversed[i];

    const ann = {};
    ann[leftIdx] = "left";
    ann[rightIdx] = "right";

    steps.push(graphSnapWithEdges(
      { vi: `So sánh: left=${firstHalf[i]}, right=${reversed[i]}${match ? " ✓" : " ✗"}`, en: `Compare: left=${firstHalf[i]}, right=${reversed[i]}${match ? " ✓" : " ✗"}` },
      {
        vi: `left = ${firstHalf[i]} (index ${leftIdx}) đi theo nửa đầu →.\nright = ${reversed[i]} (index ${rightIdx}) đi theo nửa sau đã đảo ←.${match ? " Khớp → tiếp." : ` KHÔNG khớp!`}`,
        en: `left = ${firstHalf[i]} (index ${leftIdx}) follows first half →.\nright = ${reversed[i]} (index ${rightIdx}) follows reversed second half ←.${match ? " Match → continue." : ` MISMATCH!`}`,
      },
      ann, match ? [] : [leftIdx, rightIdx], match ? [leftIdx, rightIdx] : [],
      [{ name: "left", value: `${firstHalf[i]} (index ${leftIdx})` }, { name: "right", value: `${reversed[i]} (index ${rightIdx})` }, { name: "match?", value: match }],
      [16, 17, 18, 19, 20, 21]
    ));

    if (!match) { isPalin = false; mismatchIdx = i; break; }
  }

  // Final
  if (isPalin) {
    steps.push(graphSnapWithEdges(
      { vi: `✓ Palindrome!`, en: `✓ Palindrome!` },
      { vi: `Tất cả các cặp left/right đều khớp → Palindrome!\nNửa đầu → khớp ← nửa sau đảo.`, en: `All left/right pairs matched → Palindrome!\nFirst half → matches ← reversed second half.` },
      {}, [], Array.from({ length: n }, (_, i) => i),
      [{ name: "answer", value: true }],
      [22]
    ));
  } else {
    steps.push(graphSnapWithEdges(
      { vi: `✗ Không phải palindrome`, en: `✗ Not a palindrome` },
      { vi: `left=${firstHalf[mismatchIdx]} ≠ right=${reversed[mismatchIdx]} → KHÔNG palindrome.`, en: `left=${firstHalf[mismatchIdx]} ≠ right=${reversed[mismatchIdx]} → NOT a palindrome.` },
      {}, [mismatchIdx, n - 1 - mismatchIdx], [],
      [{ name: "answer", value: false }],
      [18, 19]
    ));
  }

  steps[steps.length - 1].final = true;
  return { input, answer: isPalin, steps };
}

// ─── 143: Reorder List ───
function buildSteps143(input) {
  const vals = String(input).split(",").map((s) => Number(s.trim()));
  const n = vals.length;
  const steps = [];

  const allNodes = vals.map((v, i) => ({ id: i, label: String(v) }));
  const allEdges = [];
  for (let i = 0; i < n - 1; i++) allEdges.push({ u: i, v: i + 1, w: "" });

  function graphSnap(title, note, edges, annotations, hlNodes, visitedNodes, vars, codeLines) {
    return {
      title, arr: [],
      graph: { nodes: allNodes, edges, hlNodes: hlNodes || [], hlEdges: [], visitedNodes: visitedNodes || [], annotations: annotations || {} },
      highlight: [], mark: [],
      codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  // Step 1: Find middle
  let slow = 0, fast = 0;
  steps.push(graphSnap(
    { vi: "Bước 1: Tìm giữa (slow/fast)", en: "Step 1: Find middle (slow/fast)" },
    { vi: `slow/fast đều ở đầu. fast đi 2 bước, slow đi 1 bước.`, en: `slow/fast both at head. fast moves 2, slow moves 1.` },
    allEdges, { [slow]: "slow", [fast]: "fast" }, [fast], [slow],
    [{ name: "slow", value: `${vals[slow]}` }, { name: "fast", value: `${vals[fast]}` }],
    [3, 4, 5, 6]
  ));

  while (fast < n - 1 && fast + 1 < n) {
    slow++; fast += 2; if (fast >= n) fast = n - 1;
    const ann = {}; ann[slow] = "slow"; if (fast < n) ann[fast] = "fast";
    steps.push(graphSnap(
      { vi: `slow=${vals[slow]}, fast=${fast < n ? vals[fast] : "end"}`, en: `slow=${vals[slow]}, fast=${fast < n ? vals[fast] : "end"}` },
      { vi: `slow → ${vals[slow]}, fast → ${fast < n ? vals[fast] : "end"}.`, en: `slow → ${vals[slow]}, fast → ${fast < n ? vals[fast] : "end"}.` },
      allEdges, ann, fast < n ? [fast] : [], [slow],
      [{ name: "slow", value: `${vals[slow]} (mid)` }, { name: "fast", value: fast < n ? `${vals[fast]}` : "end" }],
      [5, 6]
    ));
    if (fast >= n - 1) break;
  }

  // Step 2: Reverse second half — show each cur step with edges changing
  const mid = slow;
  const secondHalf = vals.slice(mid);
  const reversed = [...secondHalf].reverse();

  // Track reversed edges for visualization
  const reversedEdgeSet = new Set();

  function getRevEdges() {
    const edges = [];
    for (let i = 0; i < n - 1; i++) {
      if (i >= mid && reversedEdgeSet.has(i)) {
        edges.push({ u: i + 1, v: i, w: "" }); // reversed
      } else {
        edges.push({ u: i, v: i + 1, w: "" }); // original
      }
    }
    return edges;
  }

  let prevIdx = -1;
  let curIdx = mid;

  steps.push(graphSnap(
    { vi: `Bước 2: Reverse nửa sau. prev=null, cur=${vals[curIdx]}`, en: `Step 2: Reverse 2nd half. prev=null, cur=${vals[curIdx]}` },
    { vi: `Bắt đầu đảo từ index ${mid}. prev=null, cur=${vals[curIdx]}.\nMỗi bước: cur.next = prev, prev = cur, cur = nxt.`, en: `Start reverse from index ${mid}. prev=null, cur=${vals[curIdx]}.\nEach step: cur.next = prev, prev = cur, cur = nxt.` },
    getRevEdges(), { [curIdx]: "cur" }, [curIdx], [],
    [{ name: "prev", value: "null" }, { name: "cur", value: `${vals[curIdx]}` }],
    [8, 9, 10]
  ));

  while (curIdx < n) {
    const nxtIdx = curIdx + 1 < n ? curIdx + 1 : -1;
    if (curIdx < n - 1) reversedEdgeSet.add(curIdx);

    const ann = {};
    if (prevIdx >= 0) ann[prevIdx] = "prev";
    ann[curIdx] = "cur";
    if (nxtIdx >= 0 && nxtIdx < n) ann[nxtIdx] = "nxt";

    prevIdx = curIdx;
    curIdx = nxtIdx >= 0 ? nxtIdx : n;

    if (curIdx < n) {
      steps.push(graphSnap(
        { vi: `prev=${vals[prevIdx]}, cur=${vals[curIdx]}`, en: `prev=${vals[prevIdx]}, cur=${vals[curIdx]}` },
        { vi: `Đảo: ${vals[prevIdx]}←${vals[curIdx]}. prev=${vals[prevIdx]}, cur=${vals[curIdx]}.`, en: `Reverse: ${vals[prevIdx]}←${vals[curIdx]}. prev=${vals[prevIdx]}, cur=${vals[curIdx]}.` },
        getRevEdges(), ann, [prevIdx], [],
        [{ name: "prev", value: `${vals[prevIdx]}` }, { name: "cur", value: `${vals[curIdx]}` }, { name: "nxt", value: curIdx + 1 < n ? `${vals[curIdx + 1]}` : "null" }],
        [10, 11, 12, 13]
      ));
    } else {
      steps.push(graphSnap(
        { vi: `Đảo xong! prev=${vals[prevIdx]}, cur=null`, en: `Reverse done! prev=${vals[prevIdx]}, cur=null` },
        { vi: `Nửa sau đã đảo: ${reversed.join("←")}. prev = head mới.`, en: `Second half reversed: ${reversed.join("←")}. prev = new head.` },
        getRevEdges(), { [prevIdx]: "prev" }, [prevIdx], Array.from({ length: n - mid }, (_, i) => mid + i),
        [{ name: "prev (head)", value: `${vals[prevIdx]}` }, { name: "reversed", value: reversed.join("←") }],
        [10, 11, 12, 13]
      ));
    }
  }

  const revEdges = getRevEdges();

  // Step 3: Merge/interleave — simulate with graph view showing pointer manipulation
  const firstH = vals.slice(0, mid);
  const secondH = [...reversed];

  // Build the interleaved result by simulating actual pointer ops
  // first starts at index 0 (head), second starts at index n-1 (prev = reversed head)
  let firstPtr = 0; // index in vals for first pointer
  let secondPtr = n - 1; // index in vals for second pointer
  const resultOrder = []; // track order of nodes in result

  // Current edges representing the linked list being built
  let buildEdges = [...revEdges]; // start with edges after reverse

  steps.push(graphSnap(
    { vi: "Bước 3: Merge xen kẽ (first, second)", en: "Step 3: Interleave (first, second)" },
    { vi: `first = head (${vals[firstPtr]}), second = prev (${vals[secondPtr]}).\nLặp: chèn second vào SAU first, rồi cả 2 tiến.`, en: `first = head (${vals[firstPtr]}), second = prev (${vals[secondPtr]}).\nLoop: insert second AFTER first, then both advance.` },
    buildEdges, { [firstPtr]: "first", [secondPtr]: "second" }, [firstPtr, secondPtr], [],
    [{ name: "first", value: `${vals[firstPtr]} (index ${firstPtr})` }, { name: "second", value: `${vals[secondPtr]} (index ${secondPtr})` }, { name: "1st half", value: firstH.join("→") }, { name: "2nd half (rev)", value: secondH.join("→") }],
    [15, 16, 17]
  ));

  // Simulate the interleave loop
  let fi = 0, si = 0;
  const resultArr = [];

  while (fi < firstH.length && si < secondH.length) {
    const fVal = firstH[fi];
    const sVal = secondH[si];
    const fNextVal = fi + 1 < firstH.length ? firstH[fi + 1] : "null";
    const sNextVal = si + 1 < secondH.length ? secondH[si + 1] : "null";

    // After this operation:
    // first.next = second (link first → second)
    // first = old first.next (advance first)
    // second.next = new first (link second → new first)
    // second = old second.next (advance second)
    resultArr.push(fVal, sVal);
    fi++; si++;

    // Determine node indices
    const fIdx = firstH.indexOf(fVal) < mid ? vals.indexOf(fVal) : -1;
    const sIdx = n - 1 - (si - 1); // second walks from end backward
    const fNextIdx = fi < firstH.length ? vals.indexOf(firstH[fi]) : -1;
    const sNextIdx = si < secondH.length ? n - 1 - si : -1;

    // Build new edges showing the interleaved connections made so far
    const newEdges = [];
    for (let r = 0; r < resultArr.length - 1; r++) {
      const fromIdx = vals.indexOf(resultArr[r]);
      const toIdx = vals.indexOf(resultArr[r + 1]);
      if (fromIdx >= 0 && toIdx >= 0) newEdges.push({ u: fromIdx, v: toIdx, w: "" });
    }
    // Remaining first half edges
    if (fNextIdx >= 0) {
      for (let x = fi; x < firstH.length - 1; x++) {
        newEdges.push({ u: vals.indexOf(firstH[x]), v: vals.indexOf(firstH[x + 1]), w: "" });
      }
    }
    // Remaining second half edges (reversed)
    if (sNextIdx >= 0) {
      for (let x = si; x < secondH.length - 1; x++) {
        const fromI = vals.lastIndexOf(secondH[x]);
        const toI = vals.lastIndexOf(secondH[x + 1]);
        if (fromI >= 0 && toI >= 0) newEdges.push({ u: fromI, v: toI, w: "" });
      }
    }

    const ann = {};
    if (fNextIdx >= 0) ann[fNextIdx] = "first";
    if (sNextIdx >= 0) ann[sNextIdx] = "second";

    steps.push(graphSnap(
      { vi: `${fVal}→${sVal}→${fNextVal === "null" ? "end" : fNextVal}`, en: `${fVal}→${sVal}→${fNextVal === "null" ? "end" : fNextVal}` },
      {
        vi:
          `first.next, first = second, first.next:\n` +
          `  ${fVal}.next = ${sVal}, first tiến → ${fNextVal}\n` +
          `second.next, second = first, second.next:\n` +
          `  ${sVal}.next = ${fNextVal}, second tiến → ${sNextVal}\n` +
          `Kết quả hiện tại: ${resultArr.join("→")}${fNextVal !== "null" ? "→..." : ""}`,
        en:
          `first.next, first = second, first.next:\n` +
          `  ${fVal}.next = ${sVal}, first advances → ${fNextVal}\n` +
          `second.next, second = first, second.next:\n` +
          `  ${sVal}.next = ${fNextVal}, second advances → ${sNextVal}\n` +
          `Result so far: ${resultArr.join("→")}${fNextVal !== "null" ? "→..." : ""}`,
      },
      newEdges, ann,
      fNextIdx >= 0 ? [fNextIdx] : [],
      resultArr.map((v) => vals.indexOf(v)).filter((x) => x >= 0),
      [
        { name: "first", value: fNextVal },
        { name: "second", value: sNextVal },
        { name: "linked", value: `${fVal}→${sVal}→${fNextVal}` },
        { name: "result", value: resultArr.join("→") },
      ],
      [17, 18, 19]
    ));
  }
  // Append remaining
  while (fi < firstH.length) resultArr.push(firstH[fi++]);
  while (si < secondH.length) resultArr.push(secondH[si++]);

  // Final
  const finalEdges = [];
  for (let r = 0; r < resultArr.length - 1; r++) {
    const fromIdx = vals.indexOf(resultArr[r]);
    const toIdx = vals.indexOf(resultArr[r + 1]);
    if (fromIdx >= 0 && toIdx >= 0) finalEdges.push({ u: fromIdx, v: toIdx, w: "" });
  }
  const fs = graphSnap(
    { vi: `Kết quả: ${resultArr.join("→")}`, en: `Result: ${resultArr.join("→")}` },
    { vi: `Linked list đã sắp lại: ${resultArr.join("→")}.\nL0→Ln→L1→Ln-1→...`, en: `Reordered: ${resultArr.join("→")}.\nL0→Ln→L1→Ln-1→...` },
    finalEdges, {},
    [],
    resultArr.map((v) => vals.indexOf(v)).filter((x) => x >= 0),
    [{ name: "answer", value: resultArr.join("→") }],
    [17, 18, 19]
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: `[${resultArr.join(",")}]`, steps };
}

// ─── 138: Copy List with Random Pointer ───
function buildSteps138(input) {
  const entries = String(input).split(",").map((s) => {
    const [v, r] = s.trim().split(":");
    return { val: Number(v), randomIdx: Number(r) };
  });
  const n = entries.length;
  const steps = [];

  const nodes = entries.map((e) => ({ val: e.val, randomIdx: e.randomIdx }));

  function llSnap(title, note, hlIdx, markIdx, vars, codeLines) {
    return {
      title,
      arr: [],
      linkedList: { nodes, hlIdx: hlIdx || [], markIdx: markIdx || [] },
      highlight: [], mark: [],
      codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  // Step 0: show original list
  steps.push(llSnap(
    { vi: "Danh sách gốc (next → + random ⤹)", en: "Original list (next → + random ⤹)" },
    {
      vi: `Mỗi hộp: trên = val + next pointer, dưới = random pointer.\nMũi tên ngang = next. Đường cong dưới = random.\nMục tiêu: deep copy toàn bộ.`,
      en: `Each box: top = val + next pointer, bottom = random pointer.\nHorizontal arrows = next. Curved lines below = random.\nGoal: deep copy everything.`,
    },
    [], [],
    [{ name: "nodes", value: entries.map((e) => `${e.val}(R→${e.randomIdx >= 0 ? entries[e.randomIdx].val : "∅"})`).join(", ") }],
    [2, 3]
  ));

  // Pass 1: create copies
  const mapVals = [];
  for (let i = 0; i < n; i++) {
    mapVals.push(entries[i].val);
    steps.push(llSnap(
      { vi: `Pass 1: copy ${entries[i].val} (${i+1}/${n})`, en: `Pass 1: copy ${entries[i].val} (${i+1}/${n})` },
      { vi: `map[${entries[i].val}] = Node(${entries[i].val})`, en: `map[${entries[i].val}] = Node(${entries[i].val})` },
      [i], Array.from({ length: i }, (_, x) => x),
      [{ name: "cur", value: entries[i].val }, { name: "map", value: `{${mapVals.join(", ")}}` }],
      [5, 6, 7, 8]
    ));
  }

  // Pass 2: assign next and random
  for (let i = 0; i < n; i++) {
    const nextVal = i + 1 < n ? entries[i + 1].val : "null";
    const randIdx = entries[i].randomIdx;
    const randVal = randIdx >= 0 ? entries[randIdx].val : "null";

    steps.push(llSnap(
      { vi: `Pass 2: ${entries[i].val}.next=${nextVal}, .random=${randVal}`, en: `Pass 2: ${entries[i].val}.next=${nextVal}, .random=${randVal}` },
      { vi: `copy.next = map[${nextVal}]\ncopy.random = map[${randVal}]`, en: `copy.next = map[${nextVal}]\ncopy.random = map[${randVal}]` },
      randIdx >= 0 ? [i, randIdx] : [i], [],
      [{ name: "cur", value: entries[i].val }, { name: "copy.next", value: nextVal }, { name: "copy.random", value: randVal }],
      [11, 12, 13, 14, 15]
    ));
  }

  // Final
  const fs = llSnap(
    { vi: "Deep copy hoàn tất!", en: "Deep copy complete!" },
    { vi: `HashMap đảm bảo random trỏ đúng node COPY.`, en: `HashMap ensures random points to COPY nodes.` },
    [], Array.from({ length: n }, (_, i) => i),
    [{ name: "answer", value: "deep copy done" }],
    [16, 17]
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: "copied", steps };
}

// ─── 25: Reverse Nodes in k-Group ───
function buildSteps25(input, params) {
  const vals = String(input).split(",").map((s) => Number(s.trim()));
  const k = params.k !== undefined ? Number(params.k) : 3;
  const n = vals.length;
  const steps = [];

  // Result array (will be mutated as groups are reversed)
  const result = [...vals];

  // Build graph nodes (fixed positions — values will be updated via labels)
  function graphSnap(title, note, edges, annotations, hlNodes, visitedNodes, vars, codeLines) {
    const nodes = result.map((v, i) => ({ id: i, label: String(v) }));
    return {
      title, arr: [],
      graph: { nodes, edges, hlNodes: hlNodes || [], hlEdges: [], visitedNodes: visitedNodes || [], annotations: annotations || {} },
      highlight: [], mark: [], codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  function forwardEdges() {
    const edges = [];
    for (let i = 0; i < n - 1; i++) edges.push({ u: i, v: i + 1, w: "" });
    return edges;
  }

  steps.push(graphSnap(
    { vi: `Đảo từng nhóm ${k} nodes`, en: `Reverse every ${k}-node group` },
    { vi: `List: ${vals.join("→")}. k=${k}.\nLặp: đếm đủ k → đảo nhóm tại chỗ. Còn < k → giữ nguyên.`, en: `List: ${vals.join("→")}. k=${k}.\nLoop: count k → reverse group. Remaining < k → leave.` },
    forwardEdges(), {}, [], [],
    [{ name: "list", value: vals.join("→") }, { name: "k", value: k }],
    [2, 3, 4]
  ));

  let groupStart = 0;
  let groupNum = 0;

  while (groupStart + k <= n) {
    groupNum++;
    const groupEnd = groupStart + k - 1;
    const groupVals = result.slice(groupStart, groupStart + k);
    const hlIndices = Array.from({ length: k }, (_, i) => groupStart + i);

    // Annotation: mark the group
    const ann = {};
    ann[groupStart] = "start";
    ann[groupEnd] = "kth";

    // visitedSoFar = nodes from previous groups already reversed
    const visitedSoFar = Array.from({ length: groupStart }, (_, i) => i);

    steps.push(graphSnap(
      { vi: `Nhóm ${groupNum}: [${groupVals.join(",")}]`, en: `Group ${groupNum}: [${groupVals.join(",")}]` },
      { vi: `Đếm đủ ${k} nodes (index ${groupStart}..${groupEnd}). Đảo nhóm này.`, en: `Found ${k} nodes (index ${groupStart}..${groupEnd}). Reverse this group.` },
      forwardEdges(), ann, hlIndices, visitedSoFar,
      [{ name: "group", value: groupNum }, { name: "nodes", value: groupVals.join("→") }],
      [5, 6, 7, 8, 9, 10]
    ));

    // Reverse this segment — show each pointer swap step
    const segment = result.slice(groupStart, groupStart + k);
    // Sub-steps: simulate prev/cur/nxt inside the group
    const tempArr = [...segment]; // working copy
    for (let step = 0; step < k; step++) {
      // At this point, step elements have been reversed
      // Show cur = tempArr[step] being moved
      const curVal = segment[step];
      const prevVal = step > 0 ? segment[step - 1] : "null";
      const nxtVal = step + 1 < k ? segment[step + 1] : "next_group";

      const annRev = {};
      annRev[groupStart + step] = "cur";
      if (step > 0) annRev[groupStart + step - 1] = "prev";

      steps.push(graphSnap(
        { vi: `  cur=${curVal}, prev=${prevVal}: cur.next=prev`, en: `  cur=${curVal}, prev=${prevVal}: cur.next=prev` },
        { vi: `nxt = cur.next (${nxtVal})\ncur.next = prev (${curVal}→${prevVal})\nprev = cur (${curVal})\ncur = nxt (${nxtVal})`, en: `nxt = cur.next (${nxtVal})\ncur.next = prev (${curVal}→${prevVal})\nprev = cur (${curVal})\ncur = nxt (${nxtVal})` },
        forwardEdges(), annRev, [groupStart + step], visitedSoFar,
        [{ name: "prev", value: prevVal }, { name: "cur", value: curVal }, { name: "nxt", value: nxtVal }, { name: "step", value: `${step + 1}/${k}` }],
        [14, 15, 16, 17, 18]
      ));
    }

    segment.reverse();
    for (let i = 0; i < k; i++) result[groupStart + i] = segment[i];

    // Build edges with current result order
    const edges = [];
    for (let i = 0; i < n - 1; i++) edges.push({ u: i, v: i + 1, w: "" });

    // After reverse: all nodes up to groupEnd are "visited" (done)
    const visitedAfter = Array.from({ length: groupStart + k }, (_, i) => i);

    steps.push(graphSnap(
      { vi: `Đảo xong: [${segment.join(",")}]`, en: `Reversed: [${segment.join(",")}]` },
      { vi: `[${groupVals.join(",")}] → [${segment.join(",")}]. List: ${result.join("→")}.`, en: `[${groupVals.join(",")}] → [${segment.join(",")}]. List: ${result.join("→")}.` },
      edges, {}, [], visitedAfter,
      [{ name: "reversed", value: segment.join("→") }, { name: "list", value: result.join("→") }],
      [11, 12, 13, 14, 15, 16, 17]
    ));

    groupStart += k;
  }

  // Remaining < k
  if (groupStart < n) {
    const remaining = result.slice(groupStart);
    steps.push(graphSnap(
      { vi: `Còn [${remaining.join(",")}] < ${k} → giữ nguyên`, en: `[${remaining.join(",")}] left < ${k} → keep` },
      { vi: `Chỉ còn ${n - groupStart} nodes (< ${k}) → không đảo.`, en: `Only ${n - groupStart} nodes (< ${k}) → don't reverse.` },
      forwardEdges(), {}, Array.from({ length: n - groupStart }, (_, i) => groupStart + i), [],
      [{ name: "remaining", value: remaining.join("→") }],
      [9, 10]
    ));
  }

  // Final
  const fs = graphSnap(
    { vi: `Kết quả: ${result.join("→")}`, en: `Result: ${result.join("→")}` },
    { vi: `List sau đảo từng nhóm ${k}: ${result.join("→")}.`, en: `After reversing every ${k}-group: ${result.join("→")}.` },
    forwardEdges(), {}, [], Array.from({ length: n }, (_, i) => i),
    [{ name: "answer", value: result.join("→") }],
    [18, 19, 20, 21]
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 160: Intersection of Two Linked Lists ───
function buildSteps160(input) {
  const parts = String(input).split(";");
  const listA = parts[0].split(",").map(Number);
  const listB = parts[1] ? parts[1].split(",").map(Number) : [];
  const intersectVal = parts[2] ? Number(parts[2]) : -1;
  const steps = [];

  const intIdxA = intersectVal >= 0 ? listA.indexOf(intersectVal) : -1;
  const intIdxB = intersectVal >= 0 ? listB.indexOf(intersectVal) : -1;
  const hasIntersect = intIdxA >= 0 && intIdxB >= 0;

  // Unique part of A (before intersection), unique part of B, shared tail
  const uniqueA = hasIntersect ? listA.slice(0, intIdxA) : listA;
  const uniqueB = hasIntersect ? listB.slice(0, intIdxB) : listB;
  const shared = hasIntersect ? listA.slice(intIdxA) : [];

  // Build graph nodes: uniqueA nodes (id: a0,a1..), uniqueB nodes (id: b0,b1..), shared (id: s0,s1..)
  const allNodes = [];
  const aIds = [], bIds = [], sIds = [];
  uniqueA.forEach((v, i) => { const id = allNodes.length; aIds.push(id); allNodes.push({ id, label: String(v) }); });
  uniqueB.forEach((v, i) => { const id = allNodes.length; bIds.push(id); allNodes.push({ id, label: String(v) }); });
  shared.forEach((v, i) => { const id = allNodes.length; sIds.push(id); allNodes.push({ id, label: String(v) }); });

  // Edges: A chain → shared, B chain → shared
  const allEdges = [];
  for (let i = 0; i < aIds.length - 1; i++) allEdges.push({ u: aIds[i], v: aIds[i + 1], w: "" });
  for (let i = 0; i < bIds.length - 1; i++) allEdges.push({ u: bIds[i], v: bIds[i + 1], w: "" });
  for (let i = 0; i < sIds.length - 1; i++) allEdges.push({ u: sIds[i], v: sIds[i + 1], w: "" });
  // Connect A tail → shared start
  if (aIds.length > 0 && sIds.length > 0) allEdges.push({ u: aIds[aIds.length - 1], v: sIds[0], w: "" });
  else if (aIds.length === 0 && sIds.length > 0) {} // A starts at shared
  // Connect B tail → shared start
  if (bIds.length > 0 && sIds.length > 0) allEdges.push({ u: bIds[bIds.length - 1], v: sIds[0], w: "" });

  // Map list positions to node ids
  function getNodeId(list, idx, isOnOther) {
    if (list === "A") {
      if (idx < uniqueA.length) return aIds[idx];
      const sIdx = idx - uniqueA.length;
      return sIdx < sIds.length ? sIds[sIdx] : -1;
    } else {
      if (idx < uniqueB.length) return bIds[idx];
      const sIdx = idx - uniqueB.length;
      return sIdx < sIds.length ? sIds[sIdx] : -1;
    }
  }

  function graphSnap(title, note, pANodeId, pBNodeId, annotations, visitedNodes, vars, codeLines) {
    const hl = [];
    if (pANodeId >= 0) hl.push(pANodeId);
    if (pBNodeId >= 0 && pBNodeId !== pANodeId) hl.push(pBNodeId);
    return {
      title, arr: [],
      graph: { nodes: allNodes, edges: allEdges, hlNodes: hl, hlEdges: [], visitedNodes: visitedNodes || [], annotations: annotations || {} },
      highlight: [], mark: [], codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  // Intro
  const ann0 = {};
  if (aIds.length > 0) ann0[aIds[0]] = "pA";
  if (bIds.length > 0) ann0[bIds[0]] = "pB";
  steps.push(graphSnap(
    { vi: "2 pointers: pA từ headA, pB từ headB", en: "Two pointers: pA from headA, pB from headB" },
    {
      vi: `listA: ${listA.join("→")}\nlistB: ${listB.join("→")}\nGiao điểm: ${hasIntersect ? intersectVal : "không"}.\n\nKhi pointer tới null → nhảy sang đầu list kia.\nCả 2 đi tổng lenA+lenB bước → gặp tại giao điểm.`,
      en: `listA: ${listA.join("→")}\nlistB: ${listB.join("→")}\nIntersection: ${hasIntersect ? intersectVal : "none"}.\n\nWhen a pointer reaches null → jump to other list's head.\nBoth traverse lenA+lenB steps → meet at intersection.`,
    },
    aIds.length > 0 ? aIds[0] : (sIds.length > 0 ? sIds[0] : -1),
    bIds.length > 0 ? bIds[0] : (sIds.length > 0 ? sIds[0] : -1),
    ann0, sIds,
    [{ name: "pA", value: listA[0] }, { name: "pB", value: listB[0] }, { name: "intersect", value: hasIntersect ? intersectVal : "none" }],
    [2, 3]
  ));

  // Simulate
  let pA = 0, pB = 0, pAList = "A", pBList = "B";
  let found = false;

  for (let s = 0; s < listA.length + listB.length + 2 && !found; s++) {
    const pAId = getNodeId(pAList, pA);
    const pBId = getNodeId(pBList, pB);
    const pAVal = pAList === "A" ? (pA < listA.length ? listA[pA] : null) : (pA < listB.length ? listB[pA] : null);
    const pBVal = pBList === "B" ? (pB < listB.length ? listB[pB] : null) : (pB < listA.length ? listA[pB] : null);

    if (pAId >= 0 && pBId >= 0 && pAId === pBId) {
      found = true;
      const ann = {}; ann[pAId] = "pA=pB";
      const fs = graphSnap(
        { vi: `✓ Gặp nhau tại ${allNodes[pAId].label}!`, en: `✓ Meet at ${allNodes[pAId].label}!` },
        { vi: `pA == pB → giao điểm = ${allNodes[pAId].label}!`, en: `pA == pB → intersection = ${allNodes[pAId].label}!` },
        pAId, pBId, ann, sIds,
        [{ name: "answer", value: allNodes[pAId].label }],
        [4, 5, 6, 7]
      );
      fs.final = true; steps.push(fs);
      break;
    }

    // Advance pA
    let jumpA = false;
    const pAListLen = pAList === "A" ? listA.length : listB.length;
    pA++;
    if (pA >= pAListLen) {
      pAList = pAList === "A" ? "B" : "A"; pA = 0; jumpA = true;
    }
    // Advance pB
    let jumpB = false;
    const pBListLen = pBList === "B" ? listB.length : listA.length;
    pB++;
    if (pB >= pBListLen) {
      pBList = pBList === "B" ? "A" : "B"; pB = 0; jumpB = true;
    }

    const newPAId = getNodeId(pAList, pA);
    const newPBId = getNodeId(pBList, pB);
    const ann = {};
    if (newPAId >= 0) ann[newPAId] = "pA";
    if (newPBId >= 0 && newPBId !== newPAId) ann[newPBId] = "pB";
    if (newPBId >= 0 && newPBId === newPAId) ann[newPBId] = "pA,pB";

    const newPAVal = pAList === "A" ? (pA < listA.length ? listA[pA] : "null") : (pA < listB.length ? listB[pA] : "null");
    const newPBVal = pBList === "B" ? (pB < listB.length ? listB[pB] : "null") : (pB < listA.length ? listA[pB] : "null");

    steps.push(graphSnap(
      { vi: `pA=${newPAVal}${jumpA ? " (→head" + pAList + ")" : ""}, pB=${newPBVal}${jumpB ? " (→head" + pBList + ")" : ""}`, en: `pA=${newPAVal}${jumpA ? " (→head" + pAList + ")" : ""}, pB=${newPBVal}${jumpB ? " (→head" + pBList + ")" : ""}` },
      { vi: jumpA ? `pA tới null → nhảy sang head${pAList}.` : jumpB ? `pB tới null → nhảy sang head${pBList}.` : `Cả 2 tiến 1 bước.`, en: jumpA ? `pA reached null → jump to head${pAList}.` : jumpB ? `pB reached null → jump to head${pBList}.` : `Both advance.` },
      newPAId, newPBId, ann, sIds,
      [{ name: "pA", value: `${newPAVal} (on ${pAList})` }, { name: "pB", value: `${newPBVal} (on ${pBList})` }],
      [4, 5, 6]
    ));
  }

  if (!found) {
    const fs = graphSnap(
      { vi: "Không giao → null", en: "No intersection → null" },
      { vi: `Cả 2 tới null → không giao.`, en: `Both reached null → no intersection.` },
      -1, -1, {}, [],
      [{ name: "answer", value: "null" }], [7]
    );
    fs.final = true; steps.push(fs);
  }

  return { input, answer: hasIntersect ? intersectVal : "null", steps };
}

// ─── 2: Add Two Numbers ───
function buildSteps2(input) {
  const parts = String(input).split(";");
  const l1 = parts[0].split(",").map(Number);
  const l2 = parts[1] ? parts[1].split(",").map(Number) : [];
  const steps = [];
  const maxLen = Math.max(l1.length, l2.length);
  const result = [];
  let carry = 0;

  const num1 = [...l1].reverse().join("");
  const num2 = [...l2].reverse().join("");

  // Graph: l1 nodes (row 0), l2 nodes (row 1), result nodes (row 2) with dummy + cur marker
  function treeSnap(title, note, curPos, vars, codeLines) {
    const nodes = [];
    // l1 nodes (y=0)
    l1.forEach((v, i) => {
      nodes.push({ id: i, label: String(v), x: i * 2, y: 0, parentId: i > 0 ? i - 1 : null, hl: i === curPos, isWord: false });
    });

    // l2 nodes (y=1)
    const l2Offset = l1.length;
    l2.forEach((v, i) => {
      nodes.push({ id: l2Offset + i, label: String(v), x: i * 2, y: 1, parentId: i > 0 ? l2Offset + i - 1 : null, hl: i === curPos, isWord: false });
    });
    // result nodes (y=2): dummy "D" + values
    const resOffset = l1.length + l2.length;
    nodes.push({ id: resOffset, label: "D", x: 0, y: 2, parentId: null, hl: false, isWord: false });
    result.forEach((v, i) => {
      const isCur = i === result.length - 1;
      nodes.push({ id: resOffset + 1 + i, label: String(v), x: (i + 1) * 2, y: 2, parentId: resOffset + i, hl: false, isWord: isCur });
    });

    // Annotations above nodes: "l1" on first l1 node, "l2" on first l2 node, "cur" on last result
    const annotations = {};
    if (l1.length > 0) annotations[0] = "l1";
    if (l2.length > 0) annotations[l2Offset] = "l2";
    if (result.length > 0) annotations[resOffset + result.length] = "cur";

    return {
      title, arr: [],
      tree: { nodes, annotations },
      highlight: [], mark: [],
      codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  steps.push(treeSnap(
    { vi: `Cộng: ${num1} + ${num2}`, en: `Add: ${num1} + ${num2}` },
    {
      vi: `Hàng 1: l1 = ${l1.join("→")} (số ${num1})\nHàng 2: l2 = ${l2.join("→")} (số ${num2})\nHàng 3: result (build dần)\n\nCộng từng cặp chữ số + carry, từ trái sang phải.`,
      en: `Row 1: l1 = ${l1.join("→")} (number ${num1})\nRow 2: l2 = ${l2.join("→")} (number ${num2})\nRow 3: result (building)\n\nAdd digit pairs + carry, left to right.`,
    },
    -1,
    [{ name: "l1", value: `${l1.join("→")} = ${num1}` }, { name: "l2", value: `${l2.join("→")} = ${num2}` }, { name: "carry", value: 0 }],
    [2, 3, 4, 5]
  ));

  for (let i = 0; i < maxLen || carry > 0; i++) {
    const v1 = i < l1.length ? l1[i] : 0;
    const v2 = i < l2.length ? l2[i] : 0;
    const oldCarry = carry;

    // Sub-step 1: read values
    steps.push(treeSnap(
      { vi: `[${i}] Đọc: l1.val=${v1}, l2.val=${v2}, carry=${oldCarry}`, en: `[${i}] Read: l1.val=${v1}, l2.val=${v2}, carry=${oldCarry}` },
      { vi: `val1 = l1.val = ${v1}${i >= l1.length ? " (l1 hết → 0)" : ""}\nval2 = l2.val = ${v2}${i >= l2.length ? " (l2 hết → 0)" : ""}\ncarry = ${oldCarry}`, en: `val1 = l1.val = ${v1}${i >= l1.length ? " (l1 exhausted → 0)" : ""}\nval2 = l2.val = ${v2}${i >= l2.length ? " (l2 exhausted → 0)" : ""}\ncarry = ${oldCarry}` },
      i,
      [{ name: "position", value: i }, { name: "l1.val", value: `${v1}${i >= l1.length ? " (hết)" : ""}` }, { name: "l2.val", value: `${v2}${i >= l2.length ? " (hết)" : ""}` }, { name: "carry", value: oldCarry }],
      [6, 7, 8]
    ));

    // Sub-step 2: compute total, digit, carry
    const total = v1 + v2 + carry;
    const digit = total % 10;
    carry = Math.floor(total / 10);

    steps.push(treeSnap(
      { vi: `[${i}] Tính: ${v1}+${v2}+${oldCarry}=${total} → digit=${digit}, carry=${carry}`, en: `[${i}] Compute: ${v1}+${v2}+${oldCarry}=${total} → digit=${digit}, carry=${carry}` },
      { vi: `total = ${v1} + ${v2} + ${oldCarry} = ${total}\ndigit = ${total} % 10 = ${digit}\ncarry = ${total} // 10 = ${carry}`, en: `total = ${v1} + ${v2} + ${oldCarry} = ${total}\ndigit = ${total} % 10 = ${digit}\ncarry = ${total} // 10 = ${carry}` },
      i,
      [{ name: "total", value: `${v1}+${v2}+${oldCarry} = ${total}` }, { name: "digit", value: `${total}%10 = ${digit}` }, { name: "carry", value: `${total}//10 = ${carry}` }],
      [9, 10]
    ));

    // Sub-step 3: create node, advance
    result.push(digit);

    steps.push(treeSnap(
      { vi: `[${i}] Tạo node ${digit} → result: ${result.join("→")}`, en: `[${i}] Create node ${digit} → result: ${result.join("→")}` },
      { vi: `cur.next = Node(${digit})\ncur = cur.next\nresult: D→${result.join("→")}`, en: `cur.next = Node(${digit})\ncur = cur.next\nresult: D→${result.join("→")}` },
      i,
      [{ name: "new node", value: digit }, { name: "result", value: `D→${result.join("→")}` }, { name: "carry for next", value: carry }],
      [11, 12, 13, 14]
    ));
  }

  const resultNum = [...result].reverse().join("");
  const fs = treeSnap(
    { vi: `Kết quả: ${result.join("→")} = ${resultNum}`, en: `Result: ${result.join("→")} = ${resultNum}` },
    { vi: `${num1} + ${num2} = ${resultNum}. List: ${result.join("→")}.`, en: `${num1} + ${num2} = ${resultNum}. List: ${result.join("→")}.` },
    -1,
    [{ name: "answer", value: `${result.join("→")} = ${resultNum}` }],
    [14, 15]
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 206: Reverse Linked List ───
function buildSteps206(input) {
  const vals = String(input).split(",").map((s) => Number(s.trim()));
  const n = vals.length;
  const steps = [];

  const allNodes = vals.map((v, i) => ({ id: i, label: String(v) }));
  const reversedEdges = new Set(); // track which edges have been flipped

  function getEdges() {
    const edges = [];
    for (let i = 0; i < n - 1; i++) {
      if (reversedEdges.has(i)) edges.push({ u: i + 1, v: i, w: "" }); // reversed
      else edges.push({ u: i, v: i + 1, w: "" }); // original
    }
    return edges;
  }

  function graphSnap(title, note, annotations, hlNodes, visitedNodes, vars, codeLines) {
    return {
      title, arr: [],
      graph: { nodes: allNodes, edges: getEdges(), hlNodes: hlNodes || [], hlEdges: [], visitedNodes: visitedNodes || [], annotations: annotations || {} },
      highlight: [], mark: [], codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  // Intro
  steps.push(graphSnap(
    { vi: "Đảo linked list: prev=null, cur=head", en: "Reverse list: prev=null, cur=head" },
    { vi: `${vals.join("→")}.\nprev = null, cur = ${vals[0]}.\nLặp: nxt=cur.next, cur.next=prev (đảo), prev=cur, cur=nxt.`, en: `${vals.join("→")}.\nprev = null, cur = ${vals[0]}.\nLoop: nxt=cur.next, cur.next=prev (reverse), prev=cur, cur=nxt.` },
    { 0: "cur" }, [0], [],
    [{ name: "prev", value: "null" }, { name: "cur", value: vals[0] }],
    [2, 3, 4]
  ));

  // Process each node — 4 sub-steps per iteration
  let prevIdx = -1;
  for (let curIdx = 0; curIdx < n; curIdx++) {
    const nxtIdx = curIdx + 1 < n ? curIdx + 1 : -1;
    const nxtVal = nxtIdx >= 0 ? vals[nxtIdx] : "null";
    const prevVal = prevIdx >= 0 ? vals[prevIdx] : "null";

    // Sub-step 1: nxt = cur.next
    const ann1 = {};
    if (prevIdx >= 0) ann1[prevIdx] = "prev";
    ann1[curIdx] = "cur";
    if (nxtIdx >= 0) ann1[nxtIdx] = "nxt";

    steps.push(graphSnap(
      { vi: `nxt = cur.next → ${nxtVal}`, en: `nxt = cur.next → ${nxtVal}` },
      { vi: `Lưu con trỏ tiếp theo: nxt = cur.next = ${nxtVal}.`, en: `Save the next pointer: nxt = cur.next = ${nxtVal}.` },
      ann1, [curIdx], [],
      [{ name: "nxt", value: nxtVal }, { name: "cur", value: vals[curIdx] }, { name: "prev", value: prevVal }],
      [5]
    ));

    // Sub-step 2: cur.next = prev (reverse the edge)
    if (curIdx < n - 1) reversedEdges.add(curIdx);

    const ann2 = {};
    if (prevIdx >= 0) ann2[prevIdx] = "prev";
    ann2[curIdx] = "cur";
    if (nxtIdx >= 0) ann2[nxtIdx] = "nxt";

    steps.push(graphSnap(
      { vi: `cur.next = prev → ${vals[curIdx]}→${prevVal}`, en: `cur.next = prev → ${vals[curIdx]}→${prevVal}` },
      { vi: `Đảo mũi tên: cur (${vals[curIdx]}) trỏ về prev (${prevVal}) thay vì nxt.`, en: `Reverse arrow: cur (${vals[curIdx]}) now points to prev (${prevVal}) instead of next.` },
      ann2, [curIdx, ...(prevIdx >= 0 ? [prevIdx] : [])], [],
      [{ name: "cur.next", value: `→ ${prevVal} (reversed!)` }, { name: "cur", value: vals[curIdx] }, { name: "prev", value: prevVal }],
      [6]
    ));

    // Sub-step 3: prev = cur
    const ann3 = {};
    ann3[curIdx] = "prev";
    if (nxtIdx >= 0) ann3[nxtIdx] = "nxt";

    steps.push(graphSnap(
      { vi: `prev = cur → ${vals[curIdx]}`, en: `prev = cur → ${vals[curIdx]}` },
      { vi: `prev tiến tới cur: prev = ${vals[curIdx]}.`, en: `prev advances to cur: prev = ${vals[curIdx]}.` },
      ann3, [curIdx], [],
      [{ name: "prev", value: vals[curIdx] }, { name: "cur", value: vals[curIdx] }, { name: "nxt", value: nxtVal }],
      [7]
    ));

    // Sub-step 4: cur = nxt
    prevIdx = curIdx;
    const ann4 = {};
    ann4[curIdx] = "prev";
    if (nxtIdx >= 0) ann4[nxtIdx] = "cur";

    steps.push(graphSnap(
      { vi: `cur = nxt → ${nxtVal}`, en: `cur = nxt → ${nxtVal}` },
      { vi: `cur tiến sang nxt: cur = ${nxtVal}.${nxtIdx < 0 ? " (null → dừng vòng lặp)" : ""}`, en: `cur advances to nxt: cur = ${nxtVal}.${nxtIdx < 0 ? " (null → loop ends)" : ""}` },
      ann4, nxtIdx >= 0 ? [nxtIdx] : [], [],
      [{ name: "prev", value: vals[curIdx] }, { name: "cur", value: nxtVal }, { name: "reversed so far", value: vals.slice(0, curIdx + 1).reverse().join("←") }],
      [8]
    ));
  }

  // Final
  const fs = graphSnap(
    { vi: `Xong! Head mới = ${vals[n - 1]}`, en: `Done! New head = ${vals[n - 1]}` },
    { vi: `cur = null → dừng. prev = ${vals[n-1]} = head mới.\nList: ${vals.slice().reverse().join("→")}.`, en: `cur = null → stop. prev = ${vals[n-1]} = new head.\nList: ${vals.slice().reverse().join("→")}.` },
    { [n - 1]: "prev (new head)" }, [], Array.from({ length: n }, (_, i) => i),
    [{ name: "answer", value: vals.slice().reverse().join("→") }],
    [9]
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: `[${vals.slice().reverse().join(",")}]`, steps };
}

// ─── 21: Merge Two Sorted Lists ───
function buildSteps21(input) {
  const parts = String(input).split(";");
  const l1 = parts[0].split(",").map(Number).filter((x) => !isNaN(x));
  const l2 = parts[1] ? parts[1].split(",").map(Number).filter((x) => !isNaN(x)) : [];
  const steps = [];
  const result = [];
  let i = 0, j = 0;

  // Tree view: l1 at y=0, l2 at y=1, result at y=2 (with dummy node "D" at start)
  function treeSnap(title, note, curI, curJ, vars, codeLines) {
    const nodes = [];
    // l1 nodes (y=0) — label "l1:" on first node
    l1.forEach((v, idx) => {
      nodes.push({ id: idx, label: idx === 0 ? `l1:${v}` : String(v), x: (idx + 1) * 2, y: 0, parentId: idx > 0 ? idx - 1 : null, hl: idx === curI, isWord: false });
    });
    // l2 nodes (y=1) — label "l2:" on first node
    const l2Off = l1.length;
    l2.forEach((v, idx) => {
      nodes.push({ id: l2Off + idx, label: idx === 0 ? `l2:${v}` : String(v), x: (idx + 1) * 2, y: 1, parentId: idx > 0 ? l2Off + idx - 1 : null, hl: idx === curJ, isWord: false });
    });
    // result nodes (y=2) — dummy "D" at x=0, then values; last node marked as "cur"
    const resOff = l1.length + l2.length;
    // Dummy node
    nodes.push({ id: resOff, label: "D", x: 0, y: 2, parentId: null, hl: false, isWord: false });
    // Result value nodes
    result.forEach((v, idx) => {
      const isCur = idx === result.length - 1;
      nodes.push({ id: resOff + 1 + idx, label: isCur ? `${v} cur` : String(v), x: (idx + 1) * 2, y: 2, parentId: resOff + idx, hl: false, isWord: isCur });
    });
    return { title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: codeLines || [], vars: vars || [], note };
  }

  steps.push(treeSnap(
    { vi: `Gộp 2 list sorted`, en: `Merge two sorted lists` },
    { vi: `Hàng 1: l1 = ${l1.join("→")}\nHàng 2: l2 = ${l2.join("→")}\nHàng 3: result (build dần)\n\nSo sánh đầu l1 vs l2, lấy nhỏ hơn. Lặp tới hết.`, en: `Row 1: l1 = ${l1.join("→")}\nRow 2: l2 = ${l2.join("→")}\nRow 3: result (building)\n\nCompare l1 head vs l2 head, take smaller. Repeat.` },
    0, 0,
    [{ name: "l1", value: l1.join("→") }, { name: "l2", value: l2.join("→") }],
    [2, 3, 4, 5]
  ));

  while (i < l1.length && j < l2.length) {
    const takeL1 = l1[i] <= l2[j];
    if (takeL1) { result.push(l1[i]); i++; }
    else { result.push(l2[j]); j++; }

    steps.push(treeSnap(
      { vi: `${takeL1 ? l1[i-1] : l2[j-1]} ← ${takeL1 ? "l1" : "l2"}`, en: `${takeL1 ? l1[i-1] : l2[j-1]} ← ${takeL1 ? "l1" : "l2"}` },
      { vi: `${takeL1 ? `l1=${l1[i-1]} ≤ l2=${l2[j]}` : `l2=${l2[j-1]} < l1=${l1[i]}`} → lấy ${result[result.length-1]}.`, en: `${takeL1 ? `l1=${l1[i-1]} ≤ l2=${l2[j]}` : `l2=${l2[j-1]} < l1=${l1[i]}`} → take ${result[result.length-1]}.` },
      i < l1.length ? i : -1, j < l2.length ? j : -1,
      [{ name: "took", value: `${result[result.length-1]} from ${takeL1 ? "l1" : "l2"}` }, { name: "result", value: result.join("→") }],
      takeL1 ? [5, 6, 7] : [8, 9, 10]
    ));
  }

  // Append remaining
  while (i < l1.length) { result.push(l1[i]); i++; }
  while (j < l2.length) { result.push(l2[j]); j++; }

  const fs = treeSnap(
    { vi: `Kết quả: ${result.join("→")}`, en: `Result: ${result.join("→")}` },
    { vi: `Merged: ${result.join("→")}.`, en: `Merged: ${result.join("→")}.` },
    -1, -1,
    [{ name: "answer", value: result.join("→") }],
    [12, 13, 14]
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 876: Middle of the Linked List ───
function buildSteps876(input) {
  const vals = String(input).split(",").map((s) => Number(s.trim()));
  const n = vals.length;
  const steps = [];

  const allNodes = vals.map((v, i) => ({ id: i, label: String(v) }));
  const allEdges = [];
  for (let i = 0; i < n - 1; i++) allEdges.push({ u: i, v: i + 1, w: "" });

  function graphSnap(title, note, slowIdx, fastIdx, vars, codeLines) {
    const ann = {};
    ann[slowIdx] = "slow";
    if (fastIdx >= 0 && fastIdx < n) ann[fastIdx] = fastIdx === slowIdx ? "slow,fast" : "fast";
    return {
      title, arr: [],
      graph: { nodes: allNodes, edges: allEdges, hlNodes: fastIdx >= 0 && fastIdx < n ? [fastIdx] : [], hlEdges: [], visitedNodes: [slowIdx], annotations: ann },
      highlight: [], mark: [], codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  let slow = 0, fast = 0;

  steps.push(graphSnap(
    { vi: "Tìm giữa: slow=fast=head", en: "Find middle: slow=fast=head" },
    { vi: `slow đi 1 bước, fast đi 2 bước.\nKhi fast tới cuối (null hoặc cuối list) → slow ở GIỮA.`, en: `slow moves 1, fast moves 2.\nWhen fast reaches end (null or last) → slow is at the MIDDLE.` },
    slow, fast,
    [{ name: "slow", value: `${vals[slow]} (index ${slow})` }, { name: "fast", value: `${vals[fast]} (index ${fast})` }],
    [2, 3, 4]
  ));

  while (fast < n - 1 && fast + 1 < n) {
    slow++;
    fast += 2;
    if (fast >= n) fast = n; // past end

    steps.push(graphSnap(
      { vi: `slow=${vals[slow]}, fast=${fast < n ? vals[fast] : "end"}`, en: `slow=${vals[slow]}, fast=${fast < n ? vals[fast] : "end"}` },
      { vi: `slow → ${vals[slow]} (index ${slow}). fast → ${fast < n ? vals[fast] + " (index " + fast + ")" : "end"}.`, en: `slow → ${vals[slow]} (index ${slow}). fast → ${fast < n ? vals[fast] + " (index " + fast + ")" : "end"}.` },
      slow, fast,
      [{ name: "slow", value: `${vals[slow]} (index ${slow})` }, { name: "fast", value: fast < n ? `${vals[fast]} (index ${fast})` : "end" }],
      [5, 6]
    ));

    if (fast >= n - 1) break;
  }

  // Final
  const fs = graphSnap(
    { vi: `✓ Giữa = ${vals[slow]} (index ${slow})`, en: `✓ Middle = ${vals[slow]} (index ${slow})` },
    { vi: `fast tới cuối → slow = ${vals[slow]} là node GIỮA.\n${n % 2 === 0 ? "(Số chẵn → lấy node giữa THỨ 2.)" : "(Số lẻ → đúng chính giữa.)"}`, en: `fast reached end → slow = ${vals[slow]} is the MIDDLE node.\n${n % 2 === 0 ? "(Even count → take the SECOND middle.)" : "(Odd count → exact middle.)"}` },
    slow, fast,
    [{ name: "answer", value: `${vals[slow]} (index ${slow})` }],
    [7]
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: vals[slow], steps };
}

module.exports = {
  26: {
    id: 26,
    difficulty: "easy",
    slug: "remove-duplicates-from-sorted-array",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Remove Duplicates from Sorted Array", en: "Remove Duplicates from Sorted Array" },
    titleVi: { vi: "Xóa phần tử trùng (mảng đã sắp xếp)", en: "Remove duplicates in-place" },
    statement: {
      vi: "Cho mảng nums đã sắp xếp tăng dần. Xóa các phần tử trùng tại chỗ, mỗi phần tử chỉ giữ 1 bản. Trả về số phần tử khác nhau k.",
      en: "Given a sorted array nums, remove duplicates in-place so each unique element appears once. Return the number of unique elements k.",
    },
    defaultInput: [1, 1, 2, 3, 3, 4],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: { vi: "Duyệt 1 lần với 2 con trỏ. Tại chỗ O(1).", en: "Single pass with 2 pointers. In-place O(1)." },
    },
    code: [
      "class Solution:",
      "    def removeDuplicates(self, nums):",
      "        if not nums: return 0",
      "        k = 1",
      "        for i in range(1, len(nums)):",
      "            if nums[i] != nums[k-1]:",
      "                nums[k] = nums[i]",
      "                k += 1",
      "        return k",
    ],
    builder: buildSteps26,
  },
  485: {
    id: 485,
    difficulty: "easy",
    slug: "max-consecutive-ones",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Max Consecutive Ones", en: "Max Consecutive Ones" },
    titleVi: { vi: "Dãy số 1 liên tiếp dài nhất", en: "Longest run of consecutive ones" },
    statement: {
      vi: "Cho mảng nhị phân nums. Trả về số lượng 1 liên tiếp lớn nhất.",
      en: "Given a binary array nums, return the maximum number of consecutive 1s.",
    },
    defaultInput: [1, 1, 0, 1, 1, 1],
    inputKind: "binary",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: { vi: "Duyệt mảng 1 lần, 2 biến đếm.", en: "Single pass, 2 counters." },
    },
    code: [
      "class Solution:",
      "    def findMaxConsecutiveOnes(self, nums):",
      "        curr = 0",
      "        max_run = 0",
      "        for x in nums:",
      "            if x == 1:",
      "                curr += 1",
      "                max_run = max(max_run, curr)",
      "            else:",
      "                curr = 0",
      "        return max_run",
    ],
    builder: buildSteps485,
  },
  283: {
    id: 283,
    difficulty: "easy",
    slug: "move-zeroes",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Move Zeroes", en: "Move Zeroes" },
    titleVi: { vi: "Di chuyển số 0 về cuối", en: "Move zeros to end" },
    statement: {
      vi: "Cho mảng nums. Di chuyển tất cả số 0 về cuối mảng, giữ nguyên thứ tự tương đối của các phần tử khác 0. Thực hiện tại chỗ.",
      en: "Given an integer array nums, move all 0's to the end while maintaining the relative order of the non-zero elements. Do it in-place.",
    },
    defaultInput: [0, 1, 0, 3, 12],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần, ghi tại chỗ. O(1) bộ nhớ phụ.",
        en: "Single pass, in-place writes. O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def moveZeroes(self, nums):",
      "        write = 0",
      "        for i in range(len(nums)):",
      "            if nums[i] != 0:",
      "                nums[write], nums[i] = nums[i], nums[write]",
      "                write += 1",
    ],
    builder: buildSteps283,
  },
  905: {
    id: 905,
    difficulty: "easy",
    slug: "sort-array-by-parity",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Sort Array By Parity", en: "Sort Array By Parity" },
    titleVi: { vi: "Sắp xếp theo tính chẵn lẻ", en: "Sort by parity (evens first)" },
    statement: {
      vi: "Cho mảng nums. Sắp xếp sao cho tất cả số chẵn đứng trước tất cả số lẻ. Có thể trả về bất kỳ đáp án hợp lệ.",
      en: "Given an integer array nums, move all even integers to the beginning followed by all odd integers. Any valid answer is accepted.",
    },
    defaultInput: [3, 1, 2, 4],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Hai con trỏ gặp nhau ở giữa → O(n). Hoán đổi tại chỗ → O(1).",
        en: "Two pointers meet in the middle → O(n). In-place swaps → O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def sortArrayByParity(self, nums):",
      "        left, right = 0, len(nums) - 1",
      "        while left < right:",
      "            if nums[left] % 2 == 0:",
      "                left += 1",
      "            elif nums[right] % 2 == 1:",
      "                right -= 1",
      "            else:",
      "                nums[left], nums[right] = nums[right], nums[left]",
      "                left += 1; right -= 1",
      "        return nums",
    ],
    builder: buildSteps905,
  },
  27: {
    id: 27,
    difficulty: "easy",
    slug: "remove-element",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Remove Element", en: "Remove Element" },
    titleVi: { vi: "Xóa phần tử", en: "Remove element in-place" },
    statement: {
      vi: "Cho mảng nums và giá trị val. Xóa tại chỗ tất cả phần tử bằng val. Trả về số phần tử còn lại k.",
      en: "Given an array nums and a value val, remove all instances of val in-place. Return the number of elements k remaining.",
    },
    defaultInput: [3, 2, 2, 3],
    inputKind: "integer",
    extraParams: [
      { key: "val", type: "number", label: { vi: "val (giá trị cần xóa)", en: "val (value to remove)" }, default: 3, allowNegative: true },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần với 2 con trỏ. Tại chỗ nên O(1) bộ nhớ.",
        en: "Single pass with 2 pointers. In-place so O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def removeElement(self, nums, val):",
      "        left = 0",
      "        for right in range(len(nums)):",
      "            if nums[right] != val:",
      "                nums[left] = nums[right]",
      "                left += 1",
      "        return left",
    ],
    builder: buildSteps27,
  },
  88: {
    id: 88,
    difficulty: "easy",
    slug: "merge-sorted-array",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Merge Sorted Array", en: "Merge Sorted Array" },
    titleVi: { vi: "Gộp mảng đã sắp xếp", en: "Merge two sorted arrays in-place" },
    statement: {
      vi:
        "Cho mảng nums1 (kích thước m+n, m phần tử đầu đã sắp xếp, n phần tử cuối = 0 dùng làm chỗ trống) " +
        "và mảng nums2 (n phần tử đã sắp xếp). Gộp nums2 vào nums1 tại chỗ, kết quả sắp xếp tăng dần.",
      en:
        "You are given nums1 of size m+n (first m elements sorted, last n are zeros as placeholders) " +
        "and nums2 of size n (sorted). Merge nums2 into nums1 in-place so the result is sorted.",
    },
    defaultInput: [1, 2, 3, 0, 0, 0],
    inputKind: "integer",
    inputLabel: { vi: "nums1 (gồm cả chỗ trống)", en: "nums1 (including placeholders)" },
    extraParams: [
      { key: "nums2", type: "string", label: { vi: "nums2 (phẩy ngăn cách)", en: "nums2 (comma separated)" }, default: "2,5,6" },
      { key: "m", type: "number", label: { vi: "m (phần tử thực của nums1)", en: "m (real elements in nums1)" }, default: 3 },
      { key: "n", type: "number", label: { vi: "n (phần tử của nums2)", en: "n (elements in nums2)" }, default: 3 },
    ],
    complexity: {
      time: "O(m+n)",
      space: "O(1)",
      note: {
        vi: "Ba con trỏ duyệt tổng m+n lần. Gộp tại chỗ nên O(1) bộ nhớ phụ.",
        en: "Three pointers traverse m+n times total. In-place merge uses O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def merge(self, nums1, m, nums2, n):",
      "        p1 = m - 1",
      "        p2 = n - 1",
      "        write = m + n - 1",
      "        while p1 >= 0 and p2 >= 0:",
      "            if nums1[p1] > nums2[p2]:",
      "                nums1[write] = nums1[p1]",
      "                p1 -= 1",
      "            else:",
      "                nums1[write] = nums2[p2]",
      "                p2 -= 1",
      "            write -= 1",
      "        nums1[:p2+1] = nums2[:p2+1]",
    ],
    builder: buildSteps88,
  },
  977: {
    id: 977,
    difficulty: "easy",
    slug: "squares-of-a-sorted-array",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Squares of a Sorted Array", en: "Squares of a Sorted Array" },
    titleVi: { vi: "Bình phương của mảng đã sắp xếp", en: "Squares of a sorted array" },
    statement: {
      vi: "Cho mảng số nguyên nums đã sắp xếp tăng dần. Trả về mảng bình phương các phần tử, cũng sắp xếp tăng dần.",
      en: "Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
    },
    defaultInput: [-4, -1, 0, 3, 10],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Hai con trỏ duyệt mảng một lần O(n). Mảng kết quả O(n).",
        en: "Two pointers traverse once O(n). Result array O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def sortedSquares(self, nums):",
      "        n = len(nums)",
      "        result = [0] * n",
      "        left, right, pos = 0, n-1, n-1",
      "        while left <= right:",
      "            if abs(nums[left]) > abs(nums[right]):",
      "                result[pos] = nums[left] ** 2",
      "                left += 1",
      "            else:",
      "                result[pos] = nums[right] ** 2",
      "                right -= 1",
      "            pos -= 1",
      "        return result",
    ],
    builder: buildSteps977,
  },
  1089: {
    id: 1089,
    difficulty: "easy",
    slug: "duplicate-zeros",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Duplicate Zeros", en: "Duplicate Zeros" },
    titleVi: { vi: "Nhân đôi các số 0 (tại chỗ)", en: "Duplicate zeros in-place" },
    statement: {
      vi: "Cho mảng arr. Nhân đôi mỗi số 0, dịch các phần tử còn lại sang phải. Kết quả cùng độ dài (bỏ phần tràn). Thực hiện tại chỗ.",
      en: "Given a fixed-length array arr, duplicate each zero, shifting remaining elements right. Elements beyond original length are dropped. Do it in-place.",
    },
    defaultInput: [1, 0, 2, 3, 0, 4, 5, 0],
    inputKind: "nonneg",
    extraParams: [],
    approach: [
      { vi: "Pass 1: đếm số 0 → tính vị trí con trỏ ghi (write = n + zeros - 1).", en: "Pass 1: count zeros → compute write pointer (write = n + zeros - 1)." },
      { vi: "Pass 2: con trỏ đọc (i) từ cuối về đầu; con trỏ ghi (j) từ cuối ghi ngược. Số 0 được ghi 2 lần.", en: "Pass 2: read pointer (i) from back to front; write pointer (j) fills backwards. Zeros written twice." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Hai pass O(n). Tại chỗ O(1).", en: "Two passes O(n). In-place O(1)." } },
    code: [
      "class Solution:",
      "    def duplicateZeros(self, arr):",
      "        n = len(arr)",
      "        zeros = arr.count(0)",
      "        right = n + zeros - 1",
      "        for left in range(n - 1, -1, -1):",
      "            if right < n:",
      "                arr[right] = arr[left]",
      "            if arr[left] == 0:",
      "                right -= 1",
      "                if right < n:",
      "                    arr[right] = 0",
      "            right -= 1",
    ],
    builder: buildSteps1089,
  },
  19: {
    id: 19,
    difficulty: "medium",
    slug: "remove-nth-node-from-end-of-list",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Remove Nth Node From End of List", en: "Remove Nth Node From End of List" },
    titleVi: { vi: "Xóa nút thứ n từ cuối", en: "Remove nth node from the end" },
    statement: {
      vi: "Cho head linked list và n. Xóa nút thứ n tính từ CUỐI và trả về head. Dùng 2 con trỏ fast/slow cách nhau n bước. Nhập danh sách giá trị cách bởi dấu phẩy.",
      en: "Given head of a linked list and n. Remove the nth node from the END and return head. Use two pointers fast/slow spaced n apart. Enter list values comma-separated.",
    },
    defaultInput: "1,2,3,4,5",
    inputKind: "string",
    inputLabel: { vi: "Linked list (dấu phẩy)", en: "Linked list (comma-separated)" },
    extraParams: [{ key: "n", label: { vi: "n (từ cuối)", en: "n (from end)" }, default: 2 }],
    approach: [
      { vi: "fast đi trước n bước. Sau đó fast và slow cùng đi tới khi fast = null.", en: "fast advances n steps ahead. Then fast and slow move together until fast = null." },
      { vi: "Khi fast = null → slow đang ở nút TRƯỚC nút cần xóa → slow.next = slow.next.next.", en: "When fast = null → slow is at the node BEFORE the target → slow.next = slow.next.next." },
    ],
    complexity: { time: "O(L)", space: "O(1)", note: { vi: "L = độ dài list. 1 pass.", en: "L = list length. Single pass." } },
    code: [
      "class Solution:",
      "    def removeNthFromEnd(self, head, n):",
      "        dummy = ListNode(0, head)",
      "        fast = dummy",
      "        slow = dummy",
      "        # fast goes n+1 steps ahead",
      "        for _ in range(n + 1):",
      "            fast = fast.next",
      "        # move both until fast = null",
      "        while fast:",
      "            fast = fast.next",
      "            slow = slow.next",
      "        # remove the node",
      "        slow.next = slow.next.next",
      "        return dummy.next",
    ],
    builder: buildSteps19,
  },
  234: {
    id: 234,
    difficulty: "easy",
    slug: "palindrome-linked-list",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Palindrome Linked List", en: "Palindrome Linked List" },
    titleVi: { vi: "Kiểm tra linked list palindrome", en: "Check if linked list is a palindrome" },
    statement: {
      vi: "Cho head linked list, kiểm tra list có phải palindrome không. Dùng slow/fast tìm giữa → đảo nửa sau → so sánh. Nhập danh sách giá trị cách bởi dấu phẩy.",
      en: "Given head of a linked list, check if it is a palindrome. Use slow/fast to find the middle → reverse the second half → compare. Enter values comma-separated.",
    },
    defaultInput: "1,2,3,4,5,6,6,5,4,3,2,1",
    inputKind: "string",
    inputLabel: { vi: "Linked list (dấu phẩy)", en: "Linked list (comma-separated)" },
    extraParams: [],
    approach: [
      { vi: "Slow/fast tìm giữa: slow đi 1, fast đi 2 → khi fast tới cuối, slow ở giữa.", en: "Slow/fast to find middle: slow moves 1, fast moves 2 → when fast reaches end, slow is at the middle." },
      { vi: "Đảo ngược nửa sau (từ slow đến cuối).", en: "Reverse the second half (from slow to end)." },
      { vi: "So sánh nửa đầu với nửa sau đã đảo. Nếu khớp → palindrome.", en: "Compare first half with reversed second half. If they match → palindrome." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Tìm giữa O(n) + đảo O(n/2) + so sánh O(n/2).", en: "Find middle O(n) + reverse O(n/2) + compare O(n/2)." } },
    code: [
      "class Solution:",
      "    def isPalindrome(self, head):",
      "        # Find middle with slow/fast",
      "        slow = fast = head",
      "        while fast and fast.next:",
      "            slow = slow.next",
      "            fast = fast.next.next",
      "        # Reverse second half",
      "        prev = None",
      "        while slow:",
      "            nxt = slow.next",
      "            slow.next = prev",
      "            prev = slow",
      "            slow = nxt",
      "        # Compare both halves",
      "        left, right = head, prev",
      "        while right:",
      "            if left.val != right.val:",
      "                return False",
      "            left = left.next",
      "            right = right.next",
      "        return True",
    ],
    builder: buildSteps234,
  },
  143: {
    id: 143,
    difficulty: "medium",
    slug: "reorder-list",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Reorder List", en: "Reorder List" },
    titleVi: { vi: "Sắp lại linked list xen kẽ đầu-cuối", en: "Reorder list interleaving head and tail" },
    statement: {
      vi: "Cho linked list L0→L1→...→Ln. Sắp lại thành L0→Ln→L1→Ln-1→L2→Ln-2→... (xen kẽ đầu và cuối). Nhập giá trị cách bởi dấu phẩy.",
      en: "Given linked list L0→L1→...→Ln. Reorder to L0→Ln→L1→Ln-1→L2→Ln-2→... (interleave head and tail). Enter values comma-separated.",
    },
    defaultInput: "1,2,3,4,5,6,7,8,9,10",
    inputKind: "string",
    inputLabel: { vi: "Linked list (dấu phẩy)", en: "Linked list (comma-separated)" },
    extraParams: [],
    approach: [
      { vi: "Bước 1: Slow/fast tìm giữa → cắt list thành 2 nửa.", en: "Step 1: Slow/fast find middle → split list into two halves." },
      { vi: "Bước 2: Đảo ngược nửa sau.", en: "Step 2: Reverse the second half." },
      { vi: "Bước 3: Merge xen kẽ nửa đầu với nửa sau đã đảo.", en: "Step 3: Merge/interleave first half with reversed second half." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "3 pass O(n) mỗi cái. Tại chỗ.", en: "3 passes O(n) each. In-place." } },
    code: [
      "class Solution:",
      "    def reorderList(self, head):",
      "        # Step 1: Find middle",
      "        slow = fast = head",
      "        while fast and fast.next:",
      "            slow = slow.next",
      "            fast = fast.next.next",
      "        # Step 2: Reverse second half",
      "        prev, cur = None, slow",
      "        while cur:",
      "            nxt = cur.next",
      "            cur.next = prev",
      "            prev = cur",
      "            cur = nxt",
      "        # Step 3: Merge/interleave",
      "        first, second = head, prev",
      "        while second.next:",
      "            first.next, first = second, first.next",
      "            second.next, second = first, second.next",
    ],
    builder: buildSteps143,
  },
  138: {
    id: 138,
    difficulty: "medium",
    slug: "copy-list-with-random-pointer",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Copy List with Random Pointer", en: "Copy List with Random Pointer" },
    titleVi: { vi: "Deep copy linked list có random pointer", en: "Deep copy list with random pointer" },
    statement: {
      vi: "Cho linked list mỗi node có next và random pointer (trỏ tới node bất kỳ hoặc null). Tạo deep copy. Dùng HashMap: old→new. Nhập dạng 'val:randomIdx' cách bởi ','  (randomIdx = -1 nếu null).",
      en: "Given a linked list where each node has next and a random pointer (points to any node or null). Create a deep copy. Use HashMap: old→new. Enter as 'val:randomIdx' comma-separated (randomIdx = -1 for null).",
    },
    defaultInput: "7:-1,13:0,11:4,10:2,1:0",
    inputKind: "string",
    inputLabel: { vi: "Nodes (val:randomIdx)", en: "Nodes (val:randomIdx)" },
    extraParams: [],
    approach: [
      { vi: "Pass 1: Tạo copy mỗi node, lưu map old→new (HashMap).", en: "Pass 1: Create a copy of each node, store old→new mapping (HashMap)." },
      { vi: "Pass 2: Gán next và random cho mỗi copy dựa trên map.", en: "Pass 2: Assign next and random for each copy using the map." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "2 pass O(n). HashMap O(n).", en: "2 passes O(n). HashMap O(n)." } },
    code: [
      "class Solution:",
      "    def copyRandomList(self, head):",
      "        if not head: return None",
      "        # Pass 1: create copies, build old→new map",
      "        old_to_new = {}",
      "        cur = head",
      "        while cur:",
      "            old_to_new[cur] = Node(cur.val)",
      "            cur = cur.next",
      "        # Pass 2: assign next and random",
      "        cur = head",
      "        while cur:",
      "            copy = old_to_new[cur]",
      "            copy.next = old_to_new.get(cur.next)",
      "            copy.random = old_to_new.get(cur.random)",
      "            cur = cur.next",
      "        return old_to_new[head]",
    ],
    builder: buildSteps138,
  },
  25: {
    id: 25,
    difficulty: "hard",
    slug: "reverse-nodes-in-k-group",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Reverse Nodes in k-Group", en: "Reverse Nodes in k-Group" },
    titleVi: { vi: "Đảo từng nhóm k nodes", en: "Reverse every k-node group" },
    statement: {
      vi: "Cho linked list và k, đảo ngược từng nhóm k nodes liên tiếp. Nếu nhóm cuối < k thì giữ nguyên. Nhập giá trị cách bởi dấu phẩy.",
      en: "Given a linked list and k, reverse every group of k consecutive nodes. If the last group has fewer than k nodes, leave them as-is. Enter values comma-separated.",
    },
    defaultInput: "1,2,3,4,5,6,7,8,9,10",
    inputKind: "string",
    inputLabel: { vi: "Linked list (dấu phẩy)", en: "Linked list (comma-separated)" },
    extraParams: [{ key: "k", label: { vi: "k (kích thước nhóm)", en: "k (group size)" }, default: 3 }],
    approach: [
      { vi: "Lặp: đếm đủ k nodes → đảo nhóm đó tại chỗ → nối với nhóm trước/sau.", en: "Loop: count k nodes → reverse that group in-place → link with prev/next groups." },
      { vi: "Nếu còn < k nodes → dừng (không đảo).", en: "If fewer than k nodes remain → stop (don't reverse)." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Mỗi node xử lý đúng 1 lần.", en: "Each node processed exactly once." } },
    code: [
      "class Solution:",
      "    def reverseKGroup(self, head, k):",
      "        dummy = ListNode(0, head)",
      "        prev_group = dummy",
      "        while True:",
      "            # Check if k nodes exist",
      "            kth = prev_group",
      "            for _ in range(k):",
      "                kth = kth.next",
      "                if not kth: return dummy.next",
      "            next_group = kth.next",
      "            # Reverse the group",
      "            prev, cur = kth.next, prev_group.next",
      "            for _ in range(k):",
      "                nxt = cur.next",
      "                cur.next = prev",
      "                prev = cur",
      "                cur = nxt",
      "            # Connect with previous group",
      "            tmp = prev_group.next",
      "            prev_group.next = kth",
      "            prev_group = tmp",
    ],
    builder: buildSteps25,
  },
  160: {
    id: 160,
    difficulty: "easy",
    slug: "intersection-of-two-linked-lists",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Intersection of Two Linked Lists", en: "Intersection of Two Linked Lists" },
    titleVi: { vi: "Tìm giao điểm 2 linked lists", en: "Find intersection of two linked lists" },
    statement: {
      vi: "Cho 2 linked list có thể giao nhau (chung phần đuôi). Tìm node giao điểm (hoặc null). Dùng 2 pointers: khi tới null thì nhảy sang đầu list kia. Nhập: listA;listB;intersectVal (phần chung bắt đầu từ đâu).",
      en: "Given two linked lists that may intersect (shared tail). Find the intersection node (or null). Two pointers: when reaching null, jump to the other list's head. Enter: listA;listB;intersectVal.",
    },
    defaultInput: "4,1,8,4,5;5,6,1,8,4,5;8",
    inputKind: "string",
    inputLabel: { vi: "listA;listB;intersectVal", en: "listA;listB;intersectVal" },
    extraParams: [],
    approach: [
      { vi: "2 pointers (pA, pB) chạy đồng thời. Khi pA tới null → nhảy sang headB. Khi pB tới null → nhảy sang headA.", en: "Two pointers (pA, pB) traverse simultaneously. When pA reaches null → jump to headB. When pB reaches null → jump to headA." },
      { vi: "Cả 2 sẽ đi tổng cộng lenA + lenB bước → gặp nhau tại giao điểm (hoặc cả 2 = null nếu không giao).", en: "Both traverse lenA + lenB total steps → meet at intersection (or both = null if no intersection)." },
    ],
    complexity: { time: "O(m+n)", space: "O(1)", note: { vi: "m, n = độ dài 2 list.", en: "m, n = lengths of two lists." } },
    code: [
      "class Solution:",
      "    def getIntersectionNode(self, headA, headB):",
      "        pA, pB = headA, headB",
      "        while pA != pB:",
      "            pA = pA.next if pA else headB",
      "            pB = pB.next if pB else headA",
      "        return pA  # intersection or None",
    ],
    builder: buildSteps160,
  },
  2: {
    id: 2,
    difficulty: "medium",
    slug: "add-two-numbers",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Add Two Numbers", en: "Add Two Numbers" },
    titleVi: { vi: "Cộng 2 số (linked list)", en: "Add two numbers as linked lists" },
    statement: {
      vi: "Cho 2 linked list biểu diễn 2 số nguyên không âm (chữ số đảo ngược). Cộng 2 số và trả về kết quả dưới dạng linked list. Nhập: l1;l2 (giá trị cách bởi dấu phẩy).",
      en: "Given two linked lists representing non-negative integers (digits in reverse order). Add them and return the sum as a linked list. Enter: l1;l2 (values comma-separated).",
    },
    defaultInput: "2,4,3;5,6,4",
    inputKind: "string",
    inputLabel: { vi: "l1;l2 (chữ số đảo ngược)", en: "l1;l2 (digits reversed)" },
    extraParams: [],
    approach: [
      { vi: "Duyệt song song 2 list + carry. Mỗi bước: sum = l1.val + l2.val + carry.", en: "Traverse both lists + carry. Each step: sum = l1.val + l2.val + carry." },
      { vi: "digit = sum % 10, carry = sum // 10. Tạo node mới với digit.", en: "digit = sum % 10, carry = sum // 10. Create new node with digit." },
    ],
    complexity: { time: "O(max(m,n))", space: "O(max(m,n))", note: { vi: "m, n = độ dài 2 list.", en: "m, n = lengths of both lists." } },
    code: [
      "class Solution:",
      "    def addTwoNumbers(self, l1, l2):",
      "        dummy = ListNode(0)",
      "        cur = dummy",
      "        carry = 0",
      "        while l1 or l2 or carry:",
      "            val1 = l1.val if l1 else 0",
      "            val2 = l2.val if l2 else 0",
      "            total = val1 + val2 + carry",
      "            carry = total // 10",
      "            cur.next = ListNode(total % 10)",
      "            cur = cur.next",
      "            l1 = l1.next if l1 else None",
      "            l2 = l2.next if l2 else None",
      "        return dummy.next",
    ],
    builder: buildSteps2,
  },
  206: {
    id: 206,
    difficulty: "easy",
    slug: "reverse-linked-list",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Reverse Linked List", en: "Reverse Linked List" },
    titleVi: { vi: "Đảo ngược linked list", en: "Reverse a linked list" },
    statement: {
      vi: "Cho head linked list, đảo ngược toàn bộ list và trả về head mới. Nhập giá trị cách bởi dấu phẩy.",
      en: "Given head of a linked list, reverse the entire list and return the new head. Enter values comma-separated.",
    },
    defaultInput: "1,2,3,4,5",
    inputKind: "string",
    inputLabel: { vi: "Linked list (dấu phẩy)", en: "Linked list (comma-separated)" },
    extraParams: [],
    approach: [
      { vi: "3 biến: prev=null, cur=head, nxt. Lặp: nxt=cur.next, cur.next=prev, prev=cur, cur=nxt.", en: "3 variables: prev=null, cur=head, nxt. Loop: nxt=cur.next, cur.next=prev, prev=cur, cur=nxt." },
      { vi: "Khi cur=null → prev là head mới.", en: "When cur=null → prev is the new head." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "1 pass O(n). Tại chỗ.", en: "Single pass O(n). In-place." } },
    code: [
      "class Solution:",
      "    def reverseList(self, head):",
      "        prev = None",
      "        cur = head",
      "        while cur:",
      "            nxt = cur.next",
      "            cur.next = prev",
      "            prev = cur",
      "            cur = nxt",
      "        return prev",
    ],
    builder: buildSteps206,
  },
  21: {
    id: 21,
    difficulty: "easy",
    slug: "merge-two-sorted-lists",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Merge Two Sorted Lists", en: "Merge Two Sorted Lists" },
    titleVi: { vi: "Gộp 2 danh sách đã sắp xếp", en: "Merge two sorted linked lists" },
    statement: {
      vi: "Cho 2 linked list đã sắp xếp tăng dần, gộp thành 1 list tăng dần. Nhập: l1;l2 (giá trị cách bởi dấu phẩy).",
      en: "Given two sorted linked lists, merge them into one sorted list. Enter: l1;l2 (values comma-separated).",
    },
    defaultInput: "1,2,4;1,3,4",
    inputKind: "string",
    inputLabel: { vi: "l1;l2 (đã sắp xếp)", en: "l1;l2 (sorted)" },
    extraParams: [],
    approach: [
      { vi: "2 pointers so sánh đầu mỗi list, lấy nhỏ hơn vào result.", en: "Two pointers compare heads, take the smaller into result." },
      { vi: "Khi 1 list hết → nối phần còn lại của list kia.", en: "When one list is exhausted → append the rest of the other." },
    ],
    complexity: { time: "O(m+n)", space: "O(1)", note: { vi: "m, n = độ dài 2 list. Tại chỗ (chỉ đổi next pointers).", en: "m, n = list lengths. In-place (only re-link next pointers)." } },
    code: [
      "class Solution:",
      "    def mergeTwoLists(self, l1, l2):",
      "        dummy = ListNode(0)",
      "        cur = dummy",
      "        while l1 and l2:",
      "            if l1.val <= l2.val:",
      "                cur.next = l1",
      "                l1 = l1.next",
      "            else:",
      "                cur.next = l2",
      "                l2 = l2.next",
      "            cur = cur.next",
      "        cur.next = l1 or l2",
      "        return dummy.next",
    ],
    builder: buildSteps21,
  },
  876: {
    id: 876,
    difficulty: "easy",
    slug: "middle-of-the-linked-list",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Middle of the Linked List", en: "Middle of the Linked List" },
    titleVi: { vi: "Tìm nút giữa linked list", en: "Find middle node of linked list" },
    statement: {
      vi: "Cho head linked list, trả về node GIỮA. Nếu có 2 node giữa, trả về node thứ 2. Dùng slow/fast pointer. Nhập giá trị cách bởi dấu phẩy.",
      en: "Given head of a linked list, return the MIDDLE node. If two middle nodes, return the second one. Use slow/fast pointers. Enter values comma-separated.",
    },
    defaultInput: "1,2,3,4,5,6",
    inputKind: "string",
    inputLabel: { vi: "Linked list (dấu phẩy)", en: "Linked list (comma-separated)" },
    extraParams: [],
    approach: [
      { vi: "slow đi 1 bước, fast đi 2 bước. Khi fast tới cuối → slow ở giữa.", en: "slow moves 1 step, fast moves 2 steps. When fast reaches the end → slow is at the middle." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "1 pass. 2 pointers.", en: "Single pass. 2 pointers." } },
    code: [
      "class Solution:",
      "    def middleNode(self, head):",
      "        slow = fast = head",
      "        while fast and fast.next:",
      "            slow = slow.next",
      "            fast = fast.next.next",
      "        return slow",
    ],
    builder: buildSteps876,
  },
};
