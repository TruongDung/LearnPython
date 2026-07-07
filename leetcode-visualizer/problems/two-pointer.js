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
};
