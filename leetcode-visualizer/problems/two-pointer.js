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

module.exports = {
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
};
