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
  // "written" tracks which nums1 slots hold their FINAL merged value, so the
  // bar chart can visually distinguish "already merged" (green, via mark)
  // from "still a placeholder / not yet overwritten" (plain).
  const written = new Array(nums1.length).fill(false);
  for (let i = 0; i < m; i++) written[i] = true; // the initial m real elements count as written

  function snap(opts) {
    const pointers1 = {};
    if (opts.p1 !== undefined && opts.p1 >= 0) pointers1.p1 = opts.p1;
    if (opts.write !== undefined && opts.write >= 0) pointers1.write = opts.write;
    const pointers2 = {};
    if (opts.p2 !== undefined && opts.p2 >= 0) pointers2.p2 = opts.p2;

    steps.push({
      title: opts.title,
      arr: [],
      twoPointerMergeView: {
        nums1: [...nums1],
        nums2,
        written: [...written],
        pointers1,
        pointers2,
        highlight1: opts.highlight1 || [],
        highlight2: opts.highlight2 || [],
        label1: "nums1",
        label2: "nums2",
        legend1Name: "p1",
        legend1Text: { vi: "phần tử thực còn lại của nums1", en: "remaining real element of nums1" },
        legend2Name: "p2",
        legend2Text: { vi: "phần tử còn lại của nums2", en: "remaining element of nums2" },
        legend3Name: "write",
        legend3Text: { vi: "vị trí đang ghi", en: "position being written" },
      },
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: [
        { name: "p1", value: opts.p1 },
        { name: "p2", value: opts.p2 },
        { name: "write", value: opts.write },
        { name: "nums2 (p2=" + opts.p2 + ")", value: `[${nums2.map((v, i) => (i === opts.p2 ? `[${v}]` : v)).join(",")}]` },
        ...(opts.extra || []),
      ],
      note: opts.note,
    });
  }

  // Line 3: p1 = m - 1
  let p1 = m - 1;
  snap({
    title: { vi: "p1 = m - 1", en: "p1 = m - 1" },
    p1, p2: undefined, write: undefined,
    codeLines: [3],
    note: {
      vi: `nums1 = [${nums1.join(",")}] (m=${m} phần tử thực + ${n} chỗ trống 0). p1 chỉ vào phần tử THỰC cuối cùng của nums1: p1=${p1}.`,
      en: `nums1 = [${nums1.join(",")}] (m=${m} real elements + ${n} placeholder zeros). p1 points at nums1's last REAL element: p1=${p1}.`,
    },
  });

  // Line 4: p2 = n - 1
  let p2 = n - 1;
  snap({
    title: { vi: "p2 = n - 1", en: "p2 = n - 1" },
    p1, p2, write: undefined,
    codeLines: [4],
    note: {
      vi: `nums2 = [${nums2.join(",")}]. p2 chỉ vào phần tử cuối cùng của nums2: p2=${p2}.`,
      en: `nums2 = [${nums2.join(",")}]. p2 points at nums2's last element: p2=${p2}.`,
    },
  });

  // Line 5: write = m + n - 1
  let write = m + n - 1;
  snap({
    title: { vi: "write = m + n - 1", en: "write = m + n - 1" },
    p1, p2, write,
    codeLines: [5],
    note: {
      vi: `write chỉ vào Ô CUỐI CÙNG của nums1 (chỗ trống): write=${write}. Ý tưởng: điền nums1 từ PHẢI sang TRÁI, luôn đặt số LỚN HƠN vào cuối trước — nhờ vậy không cần mảng phụ.`,
      en: `write points at nums1's VERY LAST slot (a placeholder): write=${write}. Idea: fill nums1 from RIGHT to LEFT, always placing the LARGER number last first — so no extra array is needed.`,
    },
  });

  while (true) {
    // Line 6: while p1 >= 0 and p2 >= 0:
    const loopContinues = p1 >= 0 && p2 >= 0;
    snap({
      title: { vi: `while p1≥0 and p2≥0 → ${p1}≥0 and ${p2}≥0 → ${loopContinues}`, en: `while p1≥0 and p2≥0 → ${p1}≥0 and ${p2}≥0 → ${loopContinues}` },
      p1, p2, write,
      highlight1: p1 >= 0 ? [p1] : [],
      highlight2: p2 >= 0 ? [p2] : [],
      codeLines: [6],
      note: loopContinues
        ? { vi: "Cả 2 mảng đều còn phần tử chưa xét → tiếp tục so sánh.", en: "Both arrays still have unprocessed elements → keep comparing." }
        : { vi: "Một trong hai con trỏ đã âm → dừng vòng lặp chính (một mảng đã hết).", en: "One pointer has gone negative → exit the main loop (one array is exhausted)." },
    });

    if (!loopContinues) break;

    const v1 = nums1[p1];
    const v2 = nums2[p2];
    const v1Bigger = v1 > v2;

    // Line 7: if nums1[p1] > nums2[p2]:
    snap({
      title: { vi: `if nums1[p1] > nums2[p2] → ${v1} > ${v2} → ${v1Bigger}`, en: `if nums1[p1] > nums2[p2] → ${v1} > ${v2} → ${v1Bigger}` },
      p1, p2, write,
      highlight1: [p1],
      highlight2: [p2],
      codeLines: [7],
      note: v1Bigger
        ? { vi: `nums1[${p1}]=${v1} lớn hơn → nums1 đang giữ số LỚN HƠN, nên số này sẽ được đặt vào cuối (write=${write}).`, en: `nums1[${p1}]=${v1} is larger → nums1 currently holds the BIGGER number, so it gets placed at the end (write=${write}).` }
        : { vi: `nums2[${p2}]=${v2} lớn hơn hoặc bằng → nums2 sẽ được đặt vào cuối.`, en: `nums2[${p2}]=${v2} is larger or equal → nums2 gets placed at the end.` },
    });

    if (v1Bigger) {
      // Line 8: nums1[write] = nums1[p1]
      nums1[write] = v1;
      written[write] = true;
      snap({
        title: { vi: `nums1[write] = nums1[p1] → nums1[${write}] = ${v1}`, en: `nums1[write] = nums1[p1] → nums1[${write}] = ${v1}` },
        p1, p2, write,
        highlight1: [write],
        codeLines: [8],
        note: {
          vi: `Đặt ${v1} vào vị trí write=${write}. Ô này giờ đã HOÀN TẤT (tô xanh).`,
          en: `Place ${v1} at position write=${write}. This slot is now FINALIZED (shown in green).`,
        },
      });

      // Line 9: p1 -= 1
      p1--;
      snap({
        title: { vi: `p1 -= 1 → p1 = ${p1}`, en: `p1 -= 1 → p1 = ${p1}` },
        p1, p2, write,
        codeLines: [9],
        note: {
          vi: `Đã dùng xong nums1[${p1 + 1}], lùi p1 sang trái: p1=${p1}.`,
          en: `Finished using nums1[${p1 + 1}], move p1 left: p1=${p1}.`,
        },
      });
    } else {
      // Line 11: nums1[write] = nums2[p2]
      nums1[write] = v2;
      written[write] = true;
      snap({
        title: { vi: `nums1[write] = nums2[p2] → nums1[${write}] = ${v2}`, en: `nums1[write] = nums2[p2] → nums1[${write}] = ${v2}` },
        p1, p2, write,
        highlight1: [write],
        codeLines: [11],
        note: {
          vi: `Đặt ${v2} (từ nums2) vào vị trí write=${write}. Ô này giờ đã HOÀN TẤT (tô xanh).`,
          en: `Place ${v2} (from nums2) at position write=${write}. This slot is now FINALIZED (shown in green).`,
        },
      });

      // Line 12: p2 -= 1
      p2--;
      snap({
        title: { vi: `p2 -= 1 → p2 = ${p2}`, en: `p2 -= 1 → p2 = ${p2}` },
        p1, p2, write,
        codeLines: [12],
        note: {
          vi: `Đã dùng xong nums2[${p2 + 1}], lùi p2 sang trái: p2=${p2}.`,
          en: `Finished using nums2[${p2 + 1}], move p2 left: p2=${p2}.`,
        },
      });
    }

    // Line 13: write -= 1
    write--;
    snap({
      title: { vi: `write -= 1 → write = ${write}`, en: `write -= 1 → write = ${write}` },
      p1, p2, write,
      codeLines: [13],
      note: {
        vi: `Ô cuối đã điền xong, lùi write sang trái để chuẩn bị điền ô kế tiếp: write=${write}.`,
        en: `The last slot is filled, move write left to prepare for the next slot: write=${write}.`,
      },
    });
  }

  // Line 14: nums1[:p2+1] = nums2[:p2+1]
  if (p2 >= 0) {
    for (let i = p2; i >= 0; i--) written[i] = true;
    for (let i = 0; i <= p2; i++) nums1[i] = nums2[i];
  }
  snap({
    title: p2 >= 0
      ? { vi: `nums1[:p2+1] = nums2[:p2+1] → copy nums2[0..${p2}]`, en: `nums1[:p2+1] = nums2[:p2+1] → copy nums2[0..${p2}]` }
      : { vi: `nums1[:p2+1] = nums2[:p2+1] → p2=-1, không copy gì thêm`, en: `nums1[:p2+1] = nums2[:p2+1] → p2=-1, nothing left to copy` },
    p1, p2, write,
    final: true,
    codeLines: [14],
    note: p2 >= 0
      ? { vi: `p1 đã hết trước — nghĩa là mọi phần tử còn lại của nums2 (0..${p2}) đều NHỎ HƠN mọi phần tử đã đặt, nên chỉ cần copy thẳng chúng vào đầu nums1.`, en: `p1 ran out first — meaning every remaining nums2 element (0..${p2}) is SMALLER than everything already placed, so they can be copied straight into the front of nums1.` }
      : { vi: "p2 đã hết trước (hoặc cùng lúc) — không còn phần tử nums2 nào cần copy thêm.", en: "p2 ran out first (or at the same time) — no leftover nums2 elements to copy." },
  });

  return { original: input, answer: nums1, steps };
}

/**
 * LeetCode 88 Approach 2: same three-pointer merge, different variable names
 * (i/j/k instead of p1/p2/write) and the trailing copy is an explicit
 * `while j >= 0` loop instead of a slice assignment. Same algorithm, same
 * O(m+n) time / O(1) space — just a different way to write the leftover-copy
 * step, and the comparison is written as nums1[i] < nums2[j] (place nums2's
 * value when nums1's is smaller) instead of nums1[p1] > nums2[p2].
 */
function buildSteps88v2(input, params) {
  const m = params.m;
  const n = params.n;
  const nums2Str = String(params.nums2 || "");
  const nums2 = nums2Str.split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const nums1 = [...input];

  const steps = [];
  const written = new Array(nums1.length).fill(false);
  for (let idx = 0; idx < m; idx++) written[idx] = true;

  function snap(opts) {
    const pointers1 = {};
    if (opts.i !== undefined && opts.i >= 0) pointers1.i = opts.i;
    if (opts.k !== undefined && opts.k >= 0) pointers1.k = opts.k;
    const pointers2 = {};
    if (opts.j !== undefined && opts.j >= 0) pointers2.j = opts.j;

    steps.push({
      title: opts.title,
      arr: [],
      twoPointerMergeView: {
        nums1: [...nums1],
        nums2,
        written: [...written],
        pointers1,
        pointers2,
        highlight1: opts.highlight1 || [],
        highlight2: opts.highlight2 || [],
        label1: "nums1",
        label2: "nums2",
        legend1Name: "i",
        legend1Text: { vi: "phần tử thực còn lại của nums1", en: "remaining real element of nums1" },
        legend2Name: "j",
        legend2Text: { vi: "phần tử còn lại của nums2", en: "remaining element of nums2" },
        legend3Name: "k",
        legend3Text: { vi: "vị trí đang ghi", en: "position being written" },
      },
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeBlock: 2,
      codeLines: opts.codeLines || [],
      vars: [
        { name: "i", value: opts.i },
        { name: "j", value: opts.j },
        { name: "k", value: opts.k },
        { name: "nums2 (j=" + opts.j + ")", value: `[${nums2.map((v, idx) => (idx === opts.j ? `[${v}]` : v)).join(",")}]` },
      ],
      note: opts.note,
    });
  }

  // Line 3: i = m - 1
  let i = m - 1;
  snap({
    title: { vi: "i = m - 1", en: "i = m - 1" },
    i, j: undefined, k: undefined,
    codeLines: [3],
    note: {
      vi: `nums1 = [${nums1.join(",")}] (m=${m} phần tử thực + ${n} chỗ trống 0). i chỉ vào phần tử THỰC cuối cùng của nums1: i=${i}.`,
      en: `nums1 = [${nums1.join(",")}] (m=${m} real elements + ${n} placeholder zeros). i points at nums1's last REAL element: i=${i}.`,
    },
  });

  // Line 4: j = n - 1
  let j = n - 1;
  snap({
    title: { vi: "j = n - 1", en: "j = n - 1" },
    i, j, k: undefined,
    codeLines: [4],
    note: {
      vi: `nums2 = [${nums2.join(",")}]. j chỉ vào phần tử cuối cùng của nums2: j=${j}.`,
      en: `nums2 = [${nums2.join(",")}]. j points at nums2's last element: j=${j}.`,
    },
  });

  // Line 5: k = m + n - 1
  let k = m + n - 1;
  snap({
    title: { vi: "k = m + n - 1", en: "k = m + n - 1" },
    i, j, k,
    codeLines: [5],
    note: {
      vi: `k chỉ vào Ô CUỐI CÙNG của nums1: k=${k}. Điền nums1 từ PHẢI sang TRÁI, luôn đặt số LỚN HƠN vào cuối trước.`,
      en: `k points at nums1's VERY LAST slot: k=${k}. Fill nums1 from RIGHT to LEFT, always placing the LARGER number last first.`,
    },
  });

  while (true) {
    // Line 6: while i >= 0 and j >= 0:
    const loopContinues = i >= 0 && j >= 0;
    snap({
      title: { vi: `while i≥0 and j≥0 → ${i}≥0 and ${j}≥0 → ${loopContinues}`, en: `while i≥0 and j≥0 → ${i}≥0 and ${j}≥0 → ${loopContinues}` },
      i, j, k,
      highlight1: i >= 0 ? [i] : [],
      highlight2: j >= 0 ? [j] : [],
      codeLines: [6],
      note: loopContinues
        ? { vi: "Cả 2 mảng đều còn phần tử chưa xét → tiếp tục so sánh.", en: "Both arrays still have unprocessed elements → keep comparing." }
        : { vi: "Một trong hai con trỏ đã âm → dừng vòng lặp chính.", en: "One pointer has gone negative → exit the main loop." },
    });

    if (!loopContinues) break;

    const v1 = nums1[i];
    const v2 = nums2[j];
    const v1Smaller = v1 < v2;

    // Line 7: if nums1[i] < nums2[j]:
    snap({
      title: { vi: `if nums1[i] < nums2[j] → ${v1} < ${v2} → ${v1Smaller}`, en: `if nums1[i] < nums2[j] → ${v1} < ${v2} → ${v1Smaller}` },
      i, j, k,
      highlight1: [i],
      highlight2: [j],
      codeLines: [7],
      note: v1Smaller
        ? { vi: `nums1[${i}]=${v1} nhỏ hơn → nums2 đang giữ số LỚN HƠN, nên số này (${v2}) được đặt vào cuối (k=${k}).`, en: `nums1[${i}]=${v1} is smaller → nums2 currently holds the BIGGER number, so it (${v2}) gets placed at the end (k=${k}).` }
        : { vi: `nums1[${i}]=${v1} lớn hơn hoặc bằng → nums1 sẽ được đặt vào cuối.`, en: `nums1[${i}]=${v1} is larger or equal → nums1 gets placed at the end.` },
    });

    if (v1Smaller) {
      // Line 8: nums1[k] = nums2[j]
      nums1[k] = v2;
      written[k] = true;
      snap({
        title: { vi: `nums1[k] = nums2[j] → nums1[${k}] = ${v2}`, en: `nums1[k] = nums2[j] → nums1[${k}] = ${v2}` },
        i, j, k,
        highlight1: [k],
        codeLines: [8],
        note: {
          vi: `Đặt ${v2} (từ nums2) vào vị trí k=${k}. Ô này giờ đã HOÀN TẤT (tô xanh).`,
          en: `Place ${v2} (from nums2) at position k=${k}. This slot is now FINALIZED (shown in green).`,
        },
      });

      // Line 9: j -= 1
      j--;
      snap({
        title: { vi: `j -= 1 → j = ${j}`, en: `j -= 1 → j = ${j}` },
        i, j, k,
        codeLines: [9],
        note: {
          vi: `Đã dùng xong nums2[${j + 1}], lùi j sang trái: j=${j}.`,
          en: `Finished using nums2[${j + 1}], move j left: j=${j}.`,
        },
      });

      // Line 10: k -= 1
      k--;
      snap({
        title: { vi: `k -= 1 → k = ${k}`, en: `k -= 1 → k = ${k}` },
        i, j, k,
        codeLines: [10],
        note: {
          vi: `Ô cuối đã điền xong, lùi k sang trái: k=${k}.`,
          en: `The last slot is filled, move k left: k=${k}.`,
        },
      });
    } else {
      // Line 12: nums1[k] = nums1[i]
      nums1[k] = v1;
      written[k] = true;
      snap({
        title: { vi: `nums1[k] = nums1[i] → nums1[${k}] = ${v1}`, en: `nums1[k] = nums1[i] → nums1[${k}] = ${v1}` },
        i, j, k,
        highlight1: [k],
        codeLines: [12],
        note: {
          vi: `Đặt ${v1} vào vị trí k=${k}. Ô này giờ đã HOÀN TẤT (tô xanh).`,
          en: `Place ${v1} at position k=${k}. This slot is now FINALIZED (shown in green).`,
        },
      });

      // Line 13: i -= 1
      i--;
      snap({
        title: { vi: `i -= 1 → i = ${i}`, en: `i -= 1 → i = ${i}` },
        i, j, k,
        codeLines: [13],
        note: {
          vi: `Đã dùng xong nums1[${i + 1}], lùi i sang trái: i=${i}.`,
          en: `Finished using nums1[${i + 1}], move i left: i=${i}.`,
        },
      });

      // Line 14: k -= 1
      k--;
      snap({
        title: { vi: `k -= 1 → k = ${k}`, en: `k -= 1 → k = ${k}` },
        i, j, k,
        codeLines: [14],
        note: {
          vi: `Ô cuối đã điền xong, lùi k sang trái: k=${k}.`,
          en: `The last slot is filled, move k left: k=${k}.`,
        },
      });
    }
  }

  while (true) {
    // Line 15: while j >= 0:
    const copyContinues = j >= 0;
    snap({
      title: { vi: `while j≥0 → ${j}≥0 → ${copyContinues}`, en: `while j≥0 → ${j}≥0 → ${copyContinues}` },
      i, j, k,
      highlight2: j >= 0 ? [j] : [],
      codeLines: [15],
      note: copyContinues
        ? { vi: `i đã hết trước. Mọi phần tử còn lại của nums2 (0..${j}) đều NHỎ HƠN mọi phần tử đã đặt, nên copy thẳng vào đầu nums1.`, en: `i ran out first. Every remaining nums2 element (0..${j}) is SMALLER than everything already placed, so copy it straight into the front of nums1.` }
        : { vi: "j đã hết — không còn phần tử nums2 nào cần copy thêm.", en: "j is exhausted — no leftover nums2 elements to copy." },
    });

    if (!copyContinues) break;

    // Line 16: nums1[k] = nums2[j]
    nums1[k] = nums2[j];
    written[k] = true;
    snap({
      title: { vi: `nums1[k] = nums2[j] → nums1[${k}] = ${nums2[j]}`, en: `nums1[k] = nums2[j] → nums1[${k}] = ${nums2[j]}` },
      i, j, k,
      highlight1: [k],
      codeLines: [16],
      note: {
        vi: `Copy nums2[${j}]=${nums2[j]} vào vị trí k=${k}.`,
        en: `Copy nums2[${j}]=${nums2[j]} into position k=${k}.`,
      },
    });

    // Line 17: j -= 1
    j--;
    snap({
      title: { vi: `j -= 1 → j = ${j}`, en: `j -= 1 → j = ${j}` },
      i, j, k,
      codeLines: [17],
      note: {
        vi: `j=${j}.`,
        en: `j=${j}.`,
      },
    });

    // Line 18: k -= 1
    k--;
    snap({
      title: { vi: `k -= 1 → k = ${k}`, en: `k -= 1 → k = ${k}` },
      i, j, k,
      codeLines: [18],
      note: {
        vi: `k=${k}.`,
        en: `k=${k}.`,
      },
    });
  }

  // Line 19: return
  snap({
    title: { vi: "return", en: "return" },
    i, j, k,
    final: true,
    codeLines: [19],
    note: {
      vi: `Đã gộp xong, kết quả nằm trong nums1 (sửa tại chỗ, không trả về giá trị).`,
      en: `Merge complete, the result lives in nums1 (modified in-place, no return value).`,
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
        codeLines: [5, 6, 7, 8],
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
        codeLines: [9, 10],
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
    codeLines: [11],
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
  let zeros = 0;
  for (let i = 0; i < n; i++) { if (nums[i] === 0) zeros++; }
  // This is only for the visualization: it exposes the extra slots that the
  // real in-place array cannot keep after all zeros are duplicated.
  const virtual = new Array(n + zeros).fill(null);
  const zeroView = (read, write, writes = [], finalized = []) => ({
    source: [...nums],
    output: [...arr],
    virtual: [...virtual],
    visibleLength: n,
    read,
    write,
    writes,
    finalized,
  });

  steps.push({
    title: { vi: "Khởi tạo n", en: "Initialize n" },
    arr: [...arr], sub: null,
    duplicateZerosView: zeroView(-1, -1),
    highlight: [], mark: [], codeLines: [3],
    vars: [{ name: "n", value: n }],
    note: {
      vi: `n = len(arr) = ${n}. i và j chưa được gán.`,
      en: `n = len(arr) = ${n}. i and j have not been assigned yet.`,
    },
  });

  steps.push({
    title: { vi: "Gán i = n - 1", en: "Assign i = n - 1" },
    arr: [...arr], sub: null,
    duplicateZerosView: zeroView(n - 1, -1),
    highlight: arr.map((v, i) => v === 0 ? i : -1).filter((x) => x >= 0),
    mark: [], codeLines: [4],
    vars: [{ name: "i (read)", value: n - 1 }],
    note: {
      vi: `i = n - 1 = ${n - 1}. j chưa được gán.`,
      en: `i = n - 1 = ${n - 1}. j has not been assigned yet.`,
    },
  });

  steps.push({
    title: { vi: `Gán j = ${n} + ${zeros} - 1 = ${n + zeros - 1}`, en: `Assign j = ${n} + ${zeros} - 1 = ${n + zeros - 1}` },
    arr: [...arr], sub: null,
    duplicateZerosView: zeroView(n - 1, n + zeros - 1),
    highlight: arr.map((v, i) => v === 0 ? i : -1).filter((x) => x >= 0),
    mark: [], codeLines: [5, 6],
    vars: [{ name: "i (read)", value: n - 1 }, { name: "arr.count(0)", value: zeros }, { name: "j (write)", value: n + zeros - 1 }],
    note: {
      vi: `j = n + arr.count(0) - 1 = ${n} + ${zeros} - 1 = ${n + zeros - 1}. Bây giờ j xuất hiện tại ô ${n + zeros - 1}.`,
      en: `j = n + arr.count(0) - 1 = ${n} + ${zeros} - 1 = ${n + zeros - 1}. j now appears at slot ${n + zeros - 1}.`,
    },
  });

  // Pass 2: fill right-to-left.
  let right = n + zeros - 1;
  for (let left = n - 1; left >= 0; left--) {
    const value = nums[left];
    steps.push({
      title: { vi: `Kiểm tra arr[i=${left}] == 0?`, en: `Check arr[i=${left}] == 0?` },
      arr: [...arr], duplicateZerosView: zeroView(left, right),
      highlight: [], mark: [], codeLines: [7],
      vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "arr[i]", value }, { name: "condition", value: value === 0 ? "True" : "False" }],
      note: {
        vi: value === 0 ? `arr[${left}] = 0 → điều kiện ĐÚNG, đi vào nhánh nhân đôi số 0.` : `arr[${left}] = ${value} → điều kiện SAI, đi vào nhánh else.`,
        en: value === 0 ? `arr[${left}] = 0 → condition is TRUE; enter the duplicate-zero branch.` : `arr[${left}] = ${value} → condition is FALSE; enter the else branch.`,
      },
    });
    if (value === 0) {
      const firstWrite = right < n;
      steps.push({
        title: { vi: `Kiểm tra j=${right} <= n - 1?`, en: `Check j=${right} <= n - 1?` },
        arr: [...arr], duplicateZerosView: zeroView(left, right),
        highlight: [], mark: [], codeLines: [8],
        vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "condition", value: firstWrite ? "True" : "False" }],
        note: { vi: firstWrite ? `Điều kiện đúng, bước tiếp theo mới gán arr[j] = 0.` : `Điều kiện sai vì j nằm ngoài mảng; bỏ qua dòng gán.`, en: firstWrite ? `Condition is true; the next step assigns arr[j] = 0.` : `Condition is false because j is outside the array; skip the assignment.` },
      });
      if (firstWrite) {
        virtual[right] = 0;
        arr[right] = 0;
        steps.push({
          title: { vi: `Gán arr[j=${right}] = 0`, en: `Assign arr[j=${right}] = 0` },
          arr: [...arr], duplicateZerosView: zeroView(left, right, [right]),
          highlight: [right], mark: [], codeLines: [9],
          vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "arr[j]", value: 0 }],
          note: { vi: `Bây giờ số 0 đầu tiên mới được ghi vào arr[${right}].`, en: `The first zero is now written to arr[${right}].` },
        });
      }
      right--;

      steps.push({
        title: { vi: `j -= 1 → j=${right}`, en: `j -= 1 → j=${right}` },
        arr: [...arr], duplicateZerosView: zeroView(left, right),
        highlight: [], mark: [], codeLines: [10],
        vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "action", value: "j -= 1" }],
        note: { vi: `Con trỏ j lùi sang trái một ô.`, en: `Pointer j moves one slot left.` },
      });

      const secondWrite = right < n;
      steps.push({
        title: { vi: `Kiểm tra lại j=${right} <= n - 1?`, en: `Check j=${right} <= n - 1 again?` },
        arr: [...arr], duplicateZerosView: zeroView(left, right),
        highlight: [], mark: [], codeLines: [11],
        vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "condition", value: secondWrite ? "True" : "False" }],
        note: { vi: secondWrite ? `Điều kiện đúng, bước tiếp theo mới ghi số 0 thứ hai.` : `Điều kiện sai; không ghi số 0 thứ hai.`, en: secondWrite ? `Condition is true; the next step writes the second zero.` : `Condition is false; do not write the second zero.` },
      });
      if (secondWrite) {
        virtual[right] = 0;
        arr[right] = 0;
        steps.push({
          title: { vi: `Gán arr[j=${right}] = 0 lần hai`, en: `Assign arr[j=${right}] = 0 a second time` },
          arr: [...arr], duplicateZerosView: zeroView(left, right, [right]),
          highlight: [right], mark: [], codeLines: [12],
          vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "arr[j]", value: 0 }],
          note: { vi: `Số 0 thứ hai được ghi vào arr[${right}].`, en: `The second zero is written to arr[${right}].` },
        });
      }
      right--;
      steps.push({
        title: { vi: `j -= 1 → j=${right}`, en: `j -= 1 → j=${right}` },
        arr: [...arr], duplicateZerosView: zeroView(left, right),
        highlight: [], mark: [], codeLines: [13],
        vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "action", value: "j -= 1" }],
        note: { vi: `j lùi thêm một ô sau lần ghi thứ hai.`, en: `j moves one more slot left after the second write.` },
      });
      steps.push({
        title: { vi: `i -= 1 → i=${left - 1}`, en: `i -= 1 → i=${left - 1}` },
        arr: [...arr], duplicateZerosView: zeroView(left - 1, right),
        highlight: [], mark: [], codeLines: [14],
        vars: [{ name: "i (read)", value: left - 1 }, { name: "j (write)", value: right }, { name: "action", value: "i -= 1" }],
        note: { vi: `Con trỏ i lùi sang trái một ô để đọc phần tử tiếp theo.`, en: `Pointer i moves one slot left to read the next element.` },
      });
    } else {
      steps.push({
        title: { vi: `Đi vào nhánh else vì arr[i=${left}] = ${value}`, en: `Enter else because arr[i=${left}] = ${value}` },
        arr: [...arr], duplicateZerosView: zeroView(left, right),
        highlight: [], mark: [], codeLines: [15],
        vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "arr[i]", value }],
        note: { vi: `Dòng else chỉ chọn nhánh; arr[j] chưa thay đổi.`, en: `The else line only selects the branch; arr[j] has not changed.` },
      });
      const didWrite = right < n;
      steps.push({
        title: { vi: `Kiểm tra j=${right} <= n - 1?`, en: `Check j=${right} <= n - 1?` },
        arr: [...arr], duplicateZerosView: zeroView(left, right),
        highlight: [], mark: [], codeLines: [16],
        vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "condition", value: didWrite ? "True" : "False" }],
        note: { vi: didWrite ? `Điều kiện đúng. arr[j] vẫn chưa đổi; bấm Next mới thực hiện phép gán.` : `Điều kiện sai vì j nằm ngoài mảng; bỏ qua phép gán.`, en: didWrite ? `Condition is true. arr[j] is still unchanged; the next step performs the assignment.` : `Condition is false because j is outside the array; skip the assignment.` },
      });
      if (didWrite) {
        virtual[right] = value;
        arr[right] = value;
        steps.push({
          title: { vi: `Gán arr[j=${right}] = arr[i=${left}] = ${value}`, en: `Assign arr[j=${right}] = arr[i=${left}] = ${value}` },
          arr: [...arr], duplicateZerosView: zeroView(left, right, [right]),
          highlight: [right], mark: [], codeLines: [17],
          vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "arr[j]", value }],
          note: { vi: `Đến dòng 17, arr[${right}] mới được gán bằng ${value}.`, en: `At line 17, arr[${right}] is now assigned ${value}.` },
        });
      }
      right--;
      steps.push({
        title: { vi: `j -= 1 → j=${right}`, en: `j -= 1 → j=${right}` },
        arr: [...arr], duplicateZerosView: zeroView(left, right),
        highlight: [], mark: [], codeLines: [18],
        vars: [{ name: "i (read)", value: left }, { name: "j (write)", value: right }, { name: "action", value: "j -= 1" }],
        note: { vi: `Con trỏ j lùi sang trái một ô.`, en: `Pointer j moves one slot left.` },
      });
      steps.push({
        title: { vi: `i -= 1 → i=${left - 1}`, en: `i -= 1 → i=${left - 1}` },
        arr: [...arr], duplicateZerosView: zeroView(left - 1, right),
        highlight: [], mark: [], codeLines: [19],
        vars: [{ name: "i (read)", value: left - 1 }, { name: "j (write)", value: right }, { name: "action", value: "i -= 1" }],
        note: { vi: `Con trỏ i lùi sang trái một ô để đọc phần tử tiếp theo.`, en: `Pointer i moves one slot left to read the next element.` },
      });
    }
  }

  const fs = {
    title: { vi: `Kết quả: [${arr.join(",")}]`, en: `Result: [${arr.join(",")}]` },
    arr: [...arr], highlight: [], mark: arr.map((_, i) => i),
    duplicateZerosView: zeroView(-1, -1, [], arr.map((_, i) => i)),
    final: true, codeLines: [20],
    vars: [{ name: "result", value: `[${arr.join(",")}]` }],
    note: { vi: `Hoàn tất. i và j đã đi hết mảng. Mọi số 0 đã được nhân đôi tại chỗ.`, en: `Done. i and j have traversed the array. Every zero was duplicated in-place.` },
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
  let prevGroupIdx = -1; // -1 = dummy node

  // Build graph nodes with dummy "D" at start
  function graphSnap(title, note, edges, annotations, hlNodes, visitedNodes, vars, codeLines) {
    const nodes = [{ id: 999, label: "D" }, ...result.map((v, i) => ({ id: i, label: String(v) }))];
    const edgesWithDummy = [{ u: 999, v: 0, w: "" }, ...edges];
    // Add prev_group annotation
    const ann = { ...annotations };
    if (prevGroupIdx === -1) ann[999] = "prev_grp";
    else if (prevGroupIdx >= 0) ann[prevGroupIdx] = ann[prevGroupIdx] ? ann[prevGroupIdx] + ",prev_grp" : "prev_grp";
    return {
      title, arr: [],
      graph: { nodes, edges: edgesWithDummy, hlNodes: hlNodes || [], hlEdges: [], visitedNodes: visitedNodes || [], annotations: ann },
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

    // Reverse this segment — 4 sub-steps per node + connect step
    const segment = result.slice(groupStart, groupStart + k);

    for (let step = 0; step < k; step++) {
      const curVal = segment[step];
      const prevVal = step > 0 ? segment[step - 1] : "null";
      const nxtVal = step + 1 < k ? segment[step + 1] : "next_group";

      const annRev = {};
      annRev[groupStart + step] = "cur";
      if (step > 0) annRev[groupStart + step - 1] = "prev";
      if (step + 1 < k) annRev[groupStart + step + 1] = "nxt";

      // Sub-step A: nxt = cur.next
      steps.push(graphSnap(
        { vi: `  nxt = cur.next = ${nxtVal}`, en: `  nxt = cur.next = ${nxtVal}` },
        { vi: `Lưu con trỏ next của cur (${curVal}) trước khi đảo.`, en: `Save cur's next pointer before reversing.` },
        forwardEdges(), annRev, [groupStart + step], visitedSoFar,
        [{ name: "prev", value: prevVal }, { name: "cur", value: curVal }, { name: "nxt", value: nxtVal }, { name: "step", value: `${step + 1}/${k}` }],
        [15]
      ));

      // Sub-step B: cur.next = prev
      steps.push(graphSnap(
        { vi: `  cur.next = prev → ${curVal}→${prevVal}`, en: `  cur.next = prev → ${curVal}→${prevVal}` },
        { vi: `Đảo pointer: ${curVal}.next = ${prevVal} (thay vì ${nxtVal}).`, en: `Reverse pointer: ${curVal}.next = ${prevVal} (instead of ${nxtVal}).` },
        forwardEdges(), annRev, [groupStart + step], visitedSoFar,
        [{ name: "prev", value: prevVal }, { name: "cur", value: curVal }, { name: "action", value: `${curVal}.next = ${prevVal}` }],
        [16]
      ));

      // Sub-step C: prev = cur
      steps.push(graphSnap(
        { vi: `  prev = cur = ${curVal}`, en: `  prev = cur = ${curVal}` },
        { vi: `Tiến prev: prev = ${curVal}.`, en: `Advance prev: prev = ${curVal}.` },
        forwardEdges(), { [groupStart + step]: "prev" }, [groupStart + step], visitedSoFar,
        [{ name: "prev", value: curVal }, { name: "cur", value: "→ nxt" }],
        [17]
      ));

      // Sub-step D: cur = nxt
      const annAfterD = {};
      if (step + 1 < k) annAfterD[groupStart + step + 1] = "cur";
      annAfterD[groupStart + step] = "prev";
      steps.push(graphSnap(
        { vi: `  cur = nxt = ${nxtVal}`, en: `  cur = nxt = ${nxtVal}` },
        { vi: `Tiến cur: cur = ${nxtVal}.`, en: `Advance cur: cur = ${nxtVal}.` },
        forwardEdges(), annAfterD, step + 1 < k ? [groupStart + step + 1] : [], visitedSoFar,
        [{ name: "prev", value: curVal }, { name: "cur", value: nxtVal }],
        [18]
      ));
    }

    segment.reverse();
    for (let i = 0; i < k; i++) result[groupStart + i] = segment[i];

    // Connect step: prev_group.next = kth, prev_group = tmp
    const prevGroupVal = groupStart > 0 ? result[groupStart - 1] : "D";
    const kthVal = segment[0]; // first of reversed = was last = kth
    const tmpVal = segment[segment.length - 1]; // last of reversed = was first = will be new prev_group

    steps.push(graphSnap(
      { vi: `Connect: ${prevGroupVal}.next = ${kthVal}, prev_group = ${tmpVal}`, en: `Connect: ${prevGroupVal}.next = ${kthVal}, prev_group = ${tmpVal}` },
      {
        vi: `Nối nhóm đã đảo với nhóm trước:\n  prev_group.next = kth (${prevGroupVal}→${kthVal})\n  prev_group = tmp = ${tmpVal} (đầu cũ của nhóm, giờ ở cuối)`,
        en: `Link reversed group with previous:\n  prev_group.next = kth (${prevGroupVal}→${kthVal})\n  prev_group = tmp = ${tmpVal} (old group head, now at end)`,
      },
      forwardEdges(), {}, [], Array.from({ length: groupStart + k }, (_, i) => i),
      [{ name: "prev_group.next", value: `${prevGroupVal}→${kthVal}` }, { name: "prev_group (new)", value: tmpVal }, { name: "list", value: result.join("→") }],
      [19, 20, 21, 22]
    ));

    // Update prevGroupIdx: it's now the last node of the reversed group (= old first = groupStart + k - 1 after reverse)
    prevGroupIdx = groupStart + k - 1;

    // After reverse: all nodes up to groupEnd are "visited"
    const visitedAfter = Array.from({ length: groupStart + k }, (_, i) => i);

    steps.push(graphSnap(
      { vi: `Đảo xong nhóm ${groupNum}: [${segment.join(",")}]`, en: `Group ${groupNum} reversed: [${segment.join(",")}]` },
      { vi: `List hiện tại: ${result.join("→")}.`, en: `Current list: ${result.join("→")}.` },
      forwardEdges(), {}, [], visitedAfter,
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

    // Annotations above nodes: "l1" on current l1 position, "l2" on current l2 position, "cur" on last result
    const annotations = {};
    if (curPos >= 0 && curPos < l1.length) annotations[curPos] = "l1";
    if (curPos >= 0 && curPos < l2.length) annotations[l2Offset + curPos] = "l2";
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
  const parseList = (s) => (s || "").split(",").map((x) => x.trim()).filter((x) => x !== "").map(Number);
  const l1 = parseList(parts[0]);
  const l2 = parseList(parts[1]);
  const steps = [];

  // committed[] = values whose node has been fully linked AND cur has moved
  // onto it (cur = cur.next already executed). pending = a value attached via
  // "cur.next = ..." but cur has NOT advanced onto it yet (still mid-statement).
  const committed = [];
  let pending = null; // { value, source: 'l1' | 'l2' | 'rest' }

  const l2Off = l1.length;
  const resOff = l1.length + l2.length;

  // Tree view: l1 at y=0, l2 at y=1, result at y=2 (dummy "D" + annotations)
  function treeSnap(title, note, curI, curJ, vars, codeLines, opts = {}) {
    const nodes = [];
    l1.forEach((v, idx) => {
      nodes.push({ id: idx, label: String(v), x: idx * 2, y: 0, parentId: idx > 0 ? idx - 1 : null, hl: idx === curI, isWord: false });
    });
    l2.forEach((v, idx) => {
      nodes.push({ id: l2Off + idx, label: String(v), x: idx * 2, y: 1, parentId: idx > 0 ? l2Off + idx - 1 : null, hl: idx === curJ, isWord: false });
    });

    nodes.push({ id: resOff, label: "D", x: 0, y: 2, parentId: null, hl: false, isWord: false });
    committed.forEach((v, idx) => {
      nodes.push({ id: resOff + 1 + idx, label: String(v), x: (idx + 1) * 2, y: 2, parentId: resOff + idx, hl: false, isWord: false });
    });
    if (pending !== null) {
      const pendId = resOff + 1 + committed.length;
      nodes.push({ id: pendId, label: String(pending.value), x: (committed.length + 1) * 2, y: 2, parentId: resOff + committed.length, hl: true, isWord: false });
    }

    // Annotations: "l1"/"l2" on current source pointers, "cur" on the last
    // COMMITTED node (dummy if none committed yet, but only once cur has
    // actually been assigned via "cur = dummy"). "cur.next" on the pending
    // (attached-but-not-committed) node, if any.
    const annotations = {};
    if (curI >= 0 && curI < l1.length) annotations[curI] = "l1";
    if (curJ >= 0 && curJ < l2.length) annotations[l2Off + curJ] = "l2";
    if (opts.showCur !== false) annotations[resOff + committed.length] = opts.curLabel || "cur";
    if (pending !== null) annotations[resOff + 1 + committed.length] = "cur.next";

    return { title, arr: [], tree: { nodes, annotations }, highlight: [], mark: [], codeLines: codeLines || [], vars: vars || [], note, final: opts.final || false };
  }

  // Line 3: dummy = ListNode(0)
  steps.push(treeSnap(
    { vi: "dummy = ListNode(0)", en: "dummy = ListNode(0)" },
    { vi: `Tạo node dummy. cur CHƯA được gán, nên chưa hiện con trỏ cur.`, en: `Create the dummy node. cur is NOT assigned yet, so no cur pointer is shown.` },
    0, 0,
    [{ name: "l1", value: l1.join("→") }, { name: "l2", value: l2.join("→") }],
    [3],
    { showCur: false }
  ));

  // Line 4: cur = dummy
  steps.push(treeSnap(
    { vi: "cur = dummy", en: "cur = dummy" },
    { vi: `cur bắt đầu tại dummy. Sẽ di chuyển dần khi build result.`, en: `cur starts at dummy. It will advance as the result is built.` },
    0, 0,
    [{ name: "cur", value: "dummy" }],
    [4]
  ));

  let i = 0, j = 0;

  while (i < l1.length && j < l2.length) {
    // Line 5: while l1 and l2 -> True
    steps.push(treeSnap(
      { vi: `while l1 and l2 → True`, en: `while l1 and l2 → True` },
      { vi: `Cả 2 list còn phần tử: l1[${i}]=${l1[i]}, l2[${j}]=${l2[j]}.`, en: `Both lists still have nodes: l1[${i}]=${l1[i]}, l2[${j}]=${l2[j]}.` },
      i, j,
      [{ name: "l1.val", value: l1[i] }, { name: "l2.val", value: l2[j] }],
      [5]
    ));

    const takeL1 = l1[i] <= l2[j];

    // Line 6: if l1.val <= l2.val
    steps.push(treeSnap(
      { vi: `if l1.val(${l1[i]}) <= l2.val(${l2[j]}) → ${takeL1}`, en: `if l1.val(${l1[i]}) <= l2.val(${l2[j]}) → ${takeL1}` },
      { vi: takeL1 ? `${l1[i]} ≤ ${l2[j]} → True. Lấy l1.` : `${l1[i]} > ${l2[j]} → False. Lấy l2.`, en: takeL1 ? `${l1[i]} ≤ ${l2[j]} → True. Take l1.` : `${l1[i]} > ${l2[j]} → False. Take l2.` },
      i, j,
      [{ name: "l1.val <= l2.val?", value: takeL1 }],
      [6]
    ));

    if (takeL1) {
      // Line 7: cur.next = l1
      pending = { value: l1[i], source: "l1" };
      steps.push(treeSnap(
        { vi: `cur.next = l1  (attach ${l1[i]})`, en: `cur.next = l1  (attach ${l1[i]})` },
        { vi: `Nối node l1[${i}]=${l1[i]} vào sau cur. cur chưa di chuyển.`, en: `Link node l1[${i}]=${l1[i]} after cur. cur has not moved yet.` },
        i, j,
        [{ name: "attached", value: l1[i] }],
        [7]
      ));

      // Line 8: l1 = l1.next
      i++;
      steps.push(treeSnap(
        { vi: `l1 = l1.next → l1[${i}]`, en: `l1 = l1.next → l1[${i}]` },
        { vi: `Con trỏ l1 tiến sang node kế tiếp.`, en: `The l1 pointer moves to the next node.` },
        i, j,
        [{ name: "l1 (new head)", value: i < l1.length ? l1[i] : "None" }],
        [8]
      ));
    } else {
      // Line 9: else
      steps.push(treeSnap(
        { vi: `else:`, en: `else:` },
        { vi: `l1.val > l2.val → vào nhánh else.`, en: `l1.val > l2.val → enter the else branch.` },
        i, j,
        [],
        [9]
      ));

      // Line 10: cur.next = l2
      pending = { value: l2[j], source: "l2" };
      steps.push(treeSnap(
        { vi: `cur.next = l2  (attach ${l2[j]})`, en: `cur.next = l2  (attach ${l2[j]})` },
        { vi: `Nối node l2[${j}]=${l2[j]} vào sau cur. cur chưa di chuyển.`, en: `Link node l2[${j}]=${l2[j]} after cur. cur has not moved yet.` },
        i, j,
        [{ name: "attached", value: l2[j] }],
        [10]
      ));

      // Line 11: l2 = l2.next
      j++;
      steps.push(treeSnap(
        { vi: `l2 = l2.next → l2[${j}]`, en: `l2 = l2.next → l2[${j}]` },
        { vi: `Con trỏ l2 tiến sang node kế tiếp.`, en: `The l2 pointer moves to the next node.` },
        i, j,
        [{ name: "l2 (new head)", value: j < l2.length ? l2[j] : "None" }],
        [11]
      ));
    }

    // Line 12: cur = cur.next  (commit the pending node)
    committed.push(pending.value);
    pending = null;
    steps.push(treeSnap(
      { vi: `cur = cur.next → cur=${committed[committed.length - 1]}`, en: `cur = cur.next → cur=${committed[committed.length - 1]}` },
      { vi: `cur di chuyển tới node vừa gắn. Node này chính thức nằm trong result.`, en: `cur advances onto the just-attached node. It is now officially part of the result.` },
      i, j,
      [{ name: "result", value: committed.join("→") }],
      [12]
    ));
  }

  // Final while check → False
  const reason = i >= l1.length ? "l1 hết" : "l2 hết";
  const reasonEn = i >= l1.length ? "l1 exhausted" : "l2 exhausted";
  steps.push(treeSnap(
    { vi: `while l1 and l2 → False`, en: `while l1 and l2 → False` },
    { vi: `${reason} → thoát vòng lặp.`, en: `${reasonEn} → exit the loop.` },
    i < l1.length ? i : -1, j < l2.length ? j : -1,
    [{ name: "l1 remaining", value: i < l1.length ? l1.slice(i).join(",") : "none" }, { name: "l2 remaining", value: j < l2.length ? l2.slice(j).join(",") : "none" }],
    [5]
  ));

  // Line 13: cur.next = l1 or l2  (attach the whole remaining chain at once)
  const remaining = i < l1.length ? l1.slice(i) : l2.slice(j);
  const remainingSource = i < l1.length ? "l1" : "l2";
  remaining.forEach((v) => committed.push(v));
  if (i < l1.length) i = l1.length;
  if (j < l2.length) j = l2.length;

  steps.push(treeSnap(
    { vi: `cur.next = ${remainingSource}  (nối phần còn lại: ${remaining.join("→") || "None"})`, en: `cur.next = ${remainingSource}  (attach remaining: ${remaining.join("→") || "None"})` },
    { vi: remaining.length
      ? `${remainingSource} còn lại [${remaining.join(", ")}] được nối thẳng vào cur (đã sorted nên không cần so sánh nữa).`
      : `Cả 2 list đều hết → cur.next = None.`,
      en: remaining.length
        ? `The remaining ${remainingSource} [${remaining.join(", ")}] is linked directly after cur (already sorted, no more comparisons needed).`
        : `Both lists are exhausted → cur.next = None.` },
    -1, -1,
    [{ name: "result", value: committed.join("→") }],
    [13]
  ));

  // Line 14: return dummy.next
  const fs = treeSnap(
    { vi: `return dummy.next → ${committed.join("→")}`, en: `return dummy.next → ${committed.join("→")}` },
    { vi: `Merged: ${committed.join("→")}.`, en: `Merged: ${committed.join("→")}.` },
    -1, -1,
    [{ name: "answer", value: committed.join("→") }],
    [14],
    { final: true, curLabel: "cur" }
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: `[${committed.join(",")}]`, steps };
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

/**
 * LeetCode 475: Heaters.
 * Algorithm: sort heaters, then for each house do binary search (bisect_left)
 * to find the nearest heater. Answer = max over all houses of min_dist.
 *
 * Code lines (1-indexed):
 *  1  import bisect
 *  2  class Solution:
 *  3      def findRadius(self, houses, heaters):
 *  4          heaters.sort()
 *  5          res = 0
 *  6          for h in houses:
 *  7              pos = bisect.bisect_left(heaters, h)
 *  8              if pos > 0:
 *  9                  left_dist = abs(heaters[pos-1] - h)
 * 10              else:
 * 11                  left_dist = float('inf')
 * 12              if pos < len(heaters):
 * 13                  right_dist = abs(heaters[pos] - h)
 * 14              else:
 * 15                  right_dist = float('inf')
 * 16              min_dist = min(left_dist, right_dist)
 * 17              res = max(res, min_dist)
 * 18          return res
 */
function buildSteps475(inputHouses, params) {
  const houses = Array.isArray(inputHouses)
    ? [...inputHouses]
    : String(inputHouses).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));

  const heatersRaw = String(params && params.heaters || "2,9");
  const heatersSorted = heatersRaw.split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  heatersSorted.sort((a, b) => a - b);

  const steps = [];
  const INF = Infinity;
  const fmt = (v) => v === INF ? "∞" : String(v);

  if (houses.length === 0 || heatersSorted.length === 0) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [3],
      vars: [],
      note: { vi: "Cần ít nhất 1 nhà và 1 lò sưởi.", en: "Need at least one house and one heater." },
    });
    return { original: { houses, heaters: heatersSorted }, answer: 0, steps };
  }

  // Display heaters array throughout; houses shown in sub row
  const n = heatersSorted.length;

  // ── Step 1: sort heaters ──────────────────────────────────────────────────
  steps.push({
    title: { vi: "heaters.sort()", en: "heaters.sort()" },
    arr: [...heatersSorted],
    sub: heatersSorted.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "houses", value: `[${houses.join(", ")}]` },
      { name: "heaters (sorted)", value: `[${heatersSorted.join(", ")}]` },
    ],
    note: {
      vi: "Sắp xếp heaters để binary search hoạt động đúng. Mảng hiển thị là heaters đã sort; nhà sẽ được xử lý từng cái.",
      en: "Sort heaters so binary search works correctly. The displayed array is the sorted heaters; each house is processed one by one.",
    },
  });

  // ── Step 2: res = 0 ───────────────────────────────────────────────────────
  let res = 0;
  steps.push({
    title: { vi: "res = 0", en: "res = 0" },
    arr: [...heatersSorted],
    sub: heatersSorted.map((_, i) => `[${i}]`),
    highlight: [],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "res", value: 0 },
      { name: "houses", value: `[${houses.join(", ")}]` },
    ],
    note: {
      vi: "res = bán kính nhỏ nhất cần dùng. Bắt đầu từ 0 và tăng lên bằng max(res, min_dist) sau mỗi nhà.",
      en: "res = minimum required radius. Starts at 0 and grows by max(res, min_dist) after each house.",
    },
  });

  // ── Process each house ────────────────────────────────────────────────────
  for (let hi = 0; hi < houses.length; hi++) {
    const h = houses[hi];

    // ── for h in houses ────────────────────────────────────────────────────
    steps.push({
      title: { vi: `for h in houses: h = ${h}`, en: `for h in houses: h = ${h}` },
      arr: [...heatersSorted],
      sub: heatersSorted.map((_, i) => `[${i}]`),
      highlight: [],
      mark: [],
      codeLines: [6],
      vars: [
        { name: "h", value: h },
        { name: "house index", value: hi },
        { name: "res (so far)", value: res },
      ],
      note: {
        vi: `Xét nhà h = ${h}. Cần tìm lò sưởi gần nhất trong heaters bằng binary search.`,
        en: `Processing house h = ${h}. Use binary search to find the nearest heater.`,
      },
    });

    // ── Binary search: bisect_left ─────────────────────────────────────────
    // Simulate bisect_left with annotated steps
    let lo = 0, bhi = n;
    while (lo < bhi) {
      const mid = (lo + bhi) >> 1;
      const condition = heatersSorted[mid] < h;
      steps.push({
        title: { vi: `bisect_left: mid=${mid}, heaters[${mid}]=${heatersSorted[mid]} ${condition ? "<" : "≥"} h=${h}`, en: `bisect_left: mid=${mid}, heaters[${mid}]=${heatersSorted[mid]} ${condition ? "<" : "≥"} h=${h}` },
        arr: [...heatersSorted],
        sub: heatersSorted.map((_, i) => {
          if (i >= lo && i < bhi) return `[${i}]`;
          return "·";
        }),
        highlight: [mid],
        mark: Array.from({ length: n }, (_, i) => (i >= lo && i < bhi ? i : -1)).filter((x) => x >= 0),
        codeLines: [7],
        vars: [
          { name: "h", value: h },
          { name: "lo", value: lo },
          { name: "hi (bhi)", value: bhi },
          { name: "mid", value: mid },
          { name: `heaters[${mid}]`, value: heatersSorted[mid] },
          { name: "condition heaters[mid] < h", value: condition },
        ],
        note: {
          vi: condition
            ? `heaters[${mid}]=${heatersSorted[mid]} < h=${h} → lo = mid+1 = ${mid + 1}. Thu hẹp vùng tìm về bên phải.`
            : `heaters[${mid}]=${heatersSorted[mid]} ≥ h=${h} → hi = mid = ${mid}. Thu hẹp vùng tìm về bên trái.`,
          en: condition
            ? `heaters[${mid}]=${heatersSorted[mid]} < h=${h} → lo = mid+1 = ${mid + 1}. Narrow search to the right.`
            : `heaters[${mid}]=${heatersSorted[mid]} ≥ h=${h} → hi = mid = ${mid}. Narrow search to the left.`,
        },
      });
      if (condition) lo = mid + 1;
      else bhi = mid;
    }
    const pos = lo; // bisect_left result

    steps.push({
      title: { vi: `bisect_left xong: pos = ${pos}`, en: `bisect_left done: pos = ${pos}` },
      arr: [...heatersSorted],
      sub: heatersSorted.map((_, i) => `[${i}]`),
      highlight: pos < n ? [pos] : [],
      mark: pos > 0 ? [pos - 1] : [],
      codeLines: [7],
      vars: [
        { name: "h", value: h },
        { name: "pos", value: pos },
        { name: "heaters[pos-1]", value: pos > 0 ? heatersSorted[pos - 1] : "N/A" },
        { name: "heaters[pos]", value: pos < n ? heatersSorted[pos] : "N/A" },
      ],
      note: {
        vi: `pos = ${pos} = vị trí chèn của h=${h} trong heaters.\n` +
            (pos > 0 ? `heaters[pos-1]=${heatersSorted[pos - 1]} là lò sưởi bên TRÁI.\n` : "Không có lò sưởi bên trái (pos=0).\n") +
            (pos < n ? `heaters[pos]=${heatersSorted[pos]} là lò sưởi bên PHẢI.` : "Không có lò sưởi bên phải (pos=n)."),
        en: `pos = ${pos} = insertion point of h=${h} in heaters.\n` +
            (pos > 0 ? `heaters[pos-1]=${heatersSorted[pos - 1]} is the LEFT neighbor.\n` : "No left neighbor (pos=0).\n") +
            (pos < n ? `heaters[pos]=${heatersSorted[pos]} is the RIGHT neighbor.` : "No right neighbor (pos=n)."),
      },
    });

    // ── left_dist ─────────────────────────────────────────────────────────
    let leftDist;
    if (pos > 0) {
      leftDist = Math.abs(heatersSorted[pos - 1] - h);
      steps.push({
        title: { vi: `pos > 0 → left_dist = |heaters[${pos - 1}] - h| = |${heatersSorted[pos - 1]} - ${h}| = ${leftDist}`, en: `pos > 0 → left_dist = |heaters[${pos - 1}] - h| = |${heatersSorted[pos - 1]} - ${h}| = ${leftDist}` },
        arr: [...heatersSorted],
        sub: heatersSorted.map((_, i) => `[${i}]`),
        highlight: [pos - 1],
        mark: [],
        codeLines: [8, 9],
        vars: [
          { name: "h", value: h },
          { name: "pos", value: pos },
          { name: `heaters[${pos - 1}]`, value: heatersSorted[pos - 1] },
          { name: "left_dist", value: leftDist },
        ],
        note: {
          vi: `pos=${pos} > 0 nên có lò sưởi bên trái tại index ${pos - 1}.\nleft_dist = |${heatersSorted[pos - 1]} - ${h}| = ${leftDist}.`,
          en: `pos=${pos} > 0 so there is a left heater at index ${pos - 1}.\nleft_dist = |${heatersSorted[pos - 1]} - ${h}| = ${leftDist}.`,
        },
      });
    } else {
      leftDist = INF;
      steps.push({
        title: { vi: `pos = 0 → left_dist = ∞ (không có lò sưởi bên trái)`, en: `pos = 0 → left_dist = ∞ (no left heater)` },
        arr: [...heatersSorted],
        sub: heatersSorted.map((_, i) => `[${i}]`),
        highlight: [],
        mark: [],
        codeLines: [10, 11],
        vars: [
          { name: "h", value: h },
          { name: "pos", value: pos },
          { name: "left_dist", value: "∞" },
        ],
        note: {
          vi: `pos=${pos} = 0, nhà h=${h} nằm bên trái TẤT CẢ lò sưởi → left_dist = ∞.`,
          en: `pos=${pos} = 0, house h=${h} is to the left of ALL heaters → left_dist = ∞.`,
        },
      });
    }

    // ── right_dist ────────────────────────────────────────────────────────
    let rightDist;
    if (pos < n) {
      rightDist = Math.abs(heatersSorted[pos] - h);
      steps.push({
        title: { vi: `pos < len(heaters) → right_dist = |heaters[${pos}] - h| = |${heatersSorted[pos]} - ${h}| = ${rightDist}`, en: `pos < len(heaters) → right_dist = |heaters[${pos}] - h| = |${heatersSorted[pos]} - ${h}| = ${rightDist}` },
        arr: [...heatersSorted],
        sub: heatersSorted.map((_, i) => `[${i}]`),
        highlight: [pos],
        mark: [],
        codeLines: [12, 13],
        vars: [
          { name: "h", value: h },
          { name: "pos", value: pos },
          { name: `heaters[${pos}]`, value: heatersSorted[pos] },
          { name: "right_dist", value: rightDist },
        ],
        note: {
          vi: `pos=${pos} < len(heaters)=${n} nên có lò sưởi bên phải tại index ${pos}.\nright_dist = |${heatersSorted[pos]} - ${h}| = ${rightDist}.`,
          en: `pos=${pos} < len(heaters)=${n} so there is a right heater at index ${pos}.\nright_dist = |${heatersSorted[pos]} - ${h}| = ${rightDist}.`,
        },
      });
    } else {
      rightDist = INF;
      steps.push({
        title: { vi: `pos = len(heaters) → right_dist = ∞ (không có lò sưởi bên phải)`, en: `pos = len(heaters) → right_dist = ∞ (no right heater)` },
        arr: [...heatersSorted],
        sub: heatersSorted.map((_, i) => `[${i}]`),
        highlight: [],
        mark: [],
        codeLines: [14, 15],
        vars: [
          { name: "h", value: h },
          { name: "pos", value: pos },
          { name: "right_dist", value: "∞" },
        ],
        note: {
          vi: `pos=${pos} = len(heaters)=${n}, nhà h=${h} nằm bên phải TẤT CẢ lò sưởi → right_dist = ∞.`,
          en: `pos=${pos} = len(heaters)=${n}, house h=${h} is to the right of ALL heaters → right_dist = ∞.`,
        },
      });
    }

    // ── min_dist ──────────────────────────────────────────────────────────
    const minDist = Math.min(leftDist === INF ? Infinity : leftDist, rightDist === INF ? Infinity : rightDist);
    const nearestIdx = (leftDist <= rightDist) ? (pos > 0 ? pos - 1 : -1) : (pos < n ? pos : -1);

    steps.push({
      title: { vi: `min_dist = min(${fmt(leftDist)}, ${fmt(rightDist)}) = ${fmt(minDist)}`, en: `min_dist = min(${fmt(leftDist)}, ${fmt(rightDist)}) = ${fmt(minDist)}` },
      arr: [...heatersSorted],
      sub: heatersSorted.map((_, i) => `[${i}]`),
      highlight: nearestIdx >= 0 ? [nearestIdx] : [],
      mark: nearestIdx >= 0 ? [nearestIdx] : [],
      codeLines: [16],
      vars: [
        { name: "h", value: h },
        { name: "left_dist", value: fmt(leftDist) },
        { name: "right_dist", value: fmt(rightDist) },
        { name: "min_dist", value: fmt(minDist) },
        { name: "nearest heater", value: nearestIdx >= 0 ? `heaters[${nearestIdx}]=${heatersSorted[nearestIdx]}` : "none" },
      ],
      note: {
        vi: `Khoảng cách tới lò sưởi gần nhất = min(${fmt(leftDist)}, ${fmt(rightDist)}) = ${fmt(minDist)}. Lò sưởi phủ nhà này là ${nearestIdx >= 0 ? `heaters[${nearestIdx}]=${heatersSorted[nearestIdx]}` : "(không có)"}.`,
        en: `Distance to nearest heater = min(${fmt(leftDist)}, ${fmt(rightDist)}) = ${fmt(minDist)}. Covering heater: ${nearestIdx >= 0 ? `heaters[${nearestIdx}]=${heatersSorted[nearestIdx]}` : "(none)"}.`,
      },
    });

    // ── res update ─────────────────────────────────────────────────────────
    const oldRes = res;
    res = Math.max(res, minDist);
    const updated = res > oldRes;

    steps.push({
      title: { vi: `res = max(${oldRes}, ${fmt(minDist)}) = ${fmt(res)}`, en: `res = max(${oldRes}, ${fmt(minDist)}) = ${fmt(res)}` },
      arr: [...heatersSorted],
      sub: heatersSorted.map((_, i) => `[${i}]`),
      highlight: updated && nearestIdx >= 0 ? [nearestIdx] : [],
      mark: updated && nearestIdx >= 0 ? [nearestIdx] : [],
      codeLines: [17],
      vars: [
        { name: "h", value: h },
        { name: "min_dist", value: fmt(minDist) },
        { name: "old res", value: oldRes },
        { name: "res", value: fmt(res) },
        { name: "updated?", value: updated },
      ],
      note: {
        vi: updated
          ? `min_dist=${fmt(minDist)} > res=${oldRes} → cập nhật res = ${fmt(res)}. Bán kính cần tăng lên để phủ nhà h=${h}.`
          : `min_dist=${fmt(minDist)} ≤ res=${oldRes} → res không đổi = ${fmt(res)}.`,
        en: updated
          ? `min_dist=${fmt(minDist)} > res=${oldRes} → update res = ${fmt(res)}. Radius must grow to cover house h=${h}.`
          : `min_dist=${fmt(minDist)} ≤ res=${oldRes} → res stays at ${fmt(res)}.`,
      },
    });
  }

  // ── Final ──────────────────────────────────────────────────────────────────
  steps.push({
    title: { vi: `return res = ${res}`, en: `return res = ${res}` },
    arr: [...heatersSorted],
    sub: heatersSorted.map((_, i) => `[${i}]`),
    highlight: [],
    mark: Array.from({ length: n }, (_, i) => i),
    final: true,
    codeLines: [18],
    vars: [
      { name: "answer (res)", value: res },
      { name: "houses covered", value: houses.length },
      { name: "heaters used", value: n },
    ],
    note: {
      vi: `Bán kính nhỏ nhất cần thiết = ${res}. Mọi nhà trong [${houses.join(", ")}] đều được phủ bởi ít nhất 1 lò sưởi trong [${heatersSorted.join(", ")}].`,
      en: `Minimum radius required = ${res}. Every house in [${houses.join(", ")}] is covered by at least one heater in [${heatersSorted.join(", ")}].`,
    },
  });

  return { original: { houses, heaters: heatersSorted }, answer: res, steps };
}

/**
 * LeetCode 15: 3Sum — sort then two pointers per anchor.
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def threeSum(self, nums):
 *  3          nums.sort(); res = []
 *  4          for i in range(n-2):
 *  5              if i>0 and nums[i]==nums[i-1]: continue
 *  6              left, right = i+1, n-1
 *  7              while left < right:
 *  8                  total = nums[i]+nums[left]+nums[right]
 *  9                  if total < 0: left += 1
 * 10                  elif total > 0: right -= 1
 * 11                  else: res.append(...); move both + skip dups
 * 12          return res
 */
function buildSteps15(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  nums.sort((a, b) => a - b);
  const n = nums.length;
  const steps = [];
  const res = [];

  steps.push({
    title: { vi: "Sắp xếp mảng", en: "Sort the array" },
    arr: [...nums], sub: nums.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    codeLines: [3],
    vars: [{ name: "nums (sorted)", value: `[${nums.join(", ")}]` }],
    note: {
      vi: "Sắp xếp tăng dần để dùng hai con trỏ. Cố định nums[i] rồi tìm cặp (left,right) sao cho tổng = 0.",
      en: "Sort ascending to use two pointers. Fix nums[i], then find a pair (left,right) with total = 0.",
    },
  });

  for (let i = 0; i < n - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        title: { vi: `i=${i}: nums[i]=${nums[i]} trùng nums[i-1] → bỏ`, en: `i=${i}: nums[i]=${nums[i]} same as nums[i-1] → skip` },
        arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
        highlight: [i], mark: [],
        codeLines: [4, 5],
        vars: [{ name: "i", value: i }, { name: "nums[i]", value: nums[i] }],
        note: { vi: `Bỏ anchor trùng để tránh bộ ba lặp.`, en: `Skip a duplicate anchor to avoid repeated triplets.` },
      });
      continue;
    }
    let left = i + 1, right = n - 1;
    steps.push({
      title: { vi: `Anchor i=${i} (nums[i]=${nums[i]}); left=${left}, right=${right}`, en: `Anchor i=${i} (nums[i]=${nums[i]}); left=${left}, right=${right}` },
      arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
      highlight: [i, left, right], mark: [i],
      codeLines: [4, 6],
      vars: [{ name: "i", value: i }, { name: "left", value: left }, { name: "right", value: right }],
      note: { vi: `Cố định nums[${i}]=${nums[i]}. Tìm cặp sao cho tổng ba số = 0.`, en: `Fix nums[${i}]=${nums[i]}. Find a pair summing to -nums[i].` },
    });

    while (left < right) {
      const total = nums[i] + nums[left] + nums[right];
      if (total < 0) {
        steps.push({
          title: { vi: `tổng=${total} < 0 → left++`, en: `total=${total} < 0 → left++` },
          arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
          highlight: [i, left, right], mark: [i],
          codeLines: [7, 8, 9],
          vars: [{ name: "total", value: total }, { name: "left", value: left }, { name: "right", value: right }],
          note: { vi: `${nums[i]}+${nums[left]}+${nums[right]}=${total} < 0 → cần lớn hơn → left tiến.`, en: `${nums[i]}+${nums[left]}+${nums[right]}=${total} < 0 → need larger → move left.` },
        });
        left++;
      } else if (total > 0) {
        steps.push({
          title: { vi: `tổng=${total} > 0 → right--`, en: `total=${total} > 0 → right--` },
          arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
          highlight: [i, left, right], mark: [i],
          codeLines: [7, 8, 10],
          vars: [{ name: "total", value: total }, { name: "left", value: left }, { name: "right", value: right }],
          note: { vi: `${nums[i]}+${nums[left]}+${nums[right]}=${total} > 0 → cần nhỏ hơn → right lùi.`, en: `${nums[i]}+${nums[left]}+${nums[right]}=${total} > 0 → need smaller → move right.` },
        });
        right--;
      } else {
        res.push([nums[i], nums[left], nums[right]]);
        steps.push({
          title: { vi: `tổng=0 → [${nums[i]},${nums[left]},${nums[right]}] ✓`, en: `total=0 → [${nums[i]},${nums[left]},${nums[right]}] ✓` },
          arr: [...nums], sub: nums.map((_, x) => `[${x}]`),
          highlight: [i, left, right], mark: [i, left, right],
          codeLines: [11],
          vars: [{ name: "triplet", value: `[${nums[i]},${nums[left]},${nums[right]}]` }, { name: "res", value: JSON.stringify(res) }],
          note: { vi: `Tìm thấy bộ ba tổng 0. Dời cả hai con trỏ và bỏ qua giá trị trùng.`, en: `Found a zero-sum triplet. Move both pointers and skip duplicates.` },
        });
        left++; right--;
        while (left < right && nums[left] === nums[left - 1]) left++;
        while (left < right && nums[right] === nums[right + 1]) right--;
      }
    }
  }

  steps.push({
    title: { vi: `Kết quả: ${JSON.stringify(res)}`, en: `Result: ${JSON.stringify(res)}` },
    arr: [...nums], sub: nums.map((_, i) => `[${i}]`),
    highlight: [], mark: [], final: true,
    codeLines: [12],
    vars: [{ name: "answer", value: JSON.stringify(res) }],
    note: { vi: `Tất cả bộ ba khác nhau có tổng 0: ${JSON.stringify(res)}.`, en: `All distinct zero-sum triplets: ${JSON.stringify(res)}.` },
  });

  return { original: nums, answer: res, steps };
}

/**
 * LeetCode 75: Sort Colors — Dutch National Flag (low, mid, high).
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def sortColors(self, nums):
 *  3          low, mid, high = 0, 0, len(nums)-1
 *  4          while mid <= high:
 *  5              if nums[mid] == 0: swap(low, mid); low++; mid++
 *  6              elif nums[mid] == 1: mid++
 *  7              else: swap(mid, high); high--
 */
function buildSteps75(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  let low = 0, mid = 0, high = nums.length - 1;

  const sub = () => nums.map((_, i) => {
    if (i === low && i === mid && i === high) return "low/mid/high";
    if (i === low && i === mid) return "low/mid";
    if (i === mid && i === high) return "mid/high";
    if (i === low) return "low";
    if (i === mid) return "mid";
    if (i === high) return "high";
    return "";
  });

  steps.push({
    title: { vi: "low=0, mid=0, high=n-1", en: "low=0, mid=0, high=n-1" },
    arr: [...nums], sub: sub(),
    highlight: [low, mid, high], mark: [],
    codeLines: [3],
    vars: [{ name: "low", value: low }, { name: "mid", value: mid }, { name: "high", value: high }],
    note: {
      vi:
        "Dutch National Flag: 3 vùng — [0..low-1]=0, [low..mid-1]=1, [high+1..]=2.\n" +
        "mid quét; 0 đẩy về trái (low), 2 đẩy về phải (high), 1 giữ nguyên.",
      en:
        "Dutch National Flag: 3 regions — [0..low-1]=0, [low..mid-1]=1, [high+1..]=2.\n" +
        "mid scans; 0 goes left (low), 2 goes right (high), 1 stays.",
    },
  });

  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      steps.push({
        title: { vi: `nums[mid]=0 → swap(low=${low}, mid=${mid}); low++, mid++`, en: `nums[mid]=0 → swap(low=${low}, mid=${mid}); low++, mid++` },
        arr: [...nums], sub: sub(),
        highlight: [low, mid, high], mark: [low],
        codeLines: [4, 5],
        vars: [{ name: "low", value: low + 1 }, { name: "mid", value: mid + 1 }, { name: "high", value: high }],
        note: { vi: `Gặp 0 → đổi về vùng 0 (low). Cả low và mid tiến.`, en: `Found 0 → move to the 0-region (low). Advance both low and mid.` },
      });
      low++; mid++;
    } else if (nums[mid] === 1) {
      steps.push({
        title: { vi: `nums[mid]=1 → mid++`, en: `nums[mid]=1 → mid++` },
        arr: [...nums], sub: sub(),
        highlight: [low, mid, high], mark: [],
        codeLines: [4, 6],
        vars: [{ name: "low", value: low }, { name: "mid", value: mid + 1 }, { name: "high", value: high }],
        note: { vi: `1 đã ở đúng vùng giữa → chỉ tiến mid.`, en: `1 is already in the middle region → just advance mid.` },
      });
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      steps.push({
        title: { vi: `nums[mid]=2 → swap(mid=${mid}, high=${high}); high--`, en: `nums[mid]=2 → swap(mid=${mid}, high=${high}); high--` },
        arr: [...nums], sub: sub(),
        highlight: [low, mid, high], mark: [high],
        codeLines: [4, 7],
        vars: [{ name: "low", value: low }, { name: "mid", value: mid }, { name: "high", value: high - 1 }],
        note: { vi: `Gặp 2 → đổi về vùng 2 (high). high lùi; KHÔNG tiến mid (giá trị mới chưa xét).`, en: `Found 2 → move to the 2-region (high). high retreats; do NOT advance mid (new value unexamined).` },
      });
      high--;
    }
  }

  steps.push({
    title: { vi: `Kết quả: [${nums.join(", ")}]`, en: `Result: [${nums.join(", ")}]` },
    arr: [...nums], sub: nums.map((_, i) => `[${i}]`),
    highlight: [], mark: [], final: true,
    codeLines: [4],
    vars: [{ name: "answer", value: `[${nums.join(", ")}]` }],
    note: { vi: `Mảng đã sắp: các 0, rồi 1, rồi 2.`, en: `Sorted: all 0s, then 1s, then 2s.` },
  });

  return { original: input, answer: nums, steps };
}

/**
 * LeetCode 443: String Compression — read/write two pointers in place.
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def compress(self, chars):
 *  3          write = read = 0
 *  4          while read < n:
 *  5              ch = chars[read]; count = 0
 *  6              while read < n and chars[read] == ch: read++; count++
 *  7              chars[write] = ch; write++
 *  8              if count > 1: for d in str(count): chars[write]=d; write++
 *  9          return write
 */
function buildSteps443(input, params) {
  const raw = params && params.chars !== undefined ? String(params.chars) : String(input);
  const chars = raw.split(",").map((c) => c.trim()).filter((c) => c.length);
  const n = chars.length;
  const work = [...chars];
  const steps = [];
  let write = 0, read = 0;

  const sub = () => work.map((_, i) => {
    if (i === read && i === write) return "r/w";
    if (i === read) return "read";
    if (i === write) return "write";
    return "";
  });

  steps.push({
    title: { vi: "write = read = 0", en: "write = read = 0" },
    arr: [], sub: null,
    highlight: [], mark: [],
    codeLines: [3],
    vars: [{ name: "chars", value: `[${work.join(",")}]` }, { name: "read", value: 0 }, { name: "write", value: 0 }],
    note: {
      vi: "Nén tại chỗ: read đọc, write ghi. Với mỗi đoạn ký tự giống nhau, ghi ký tự rồi ghi số lượng (nếu > 1).",
      en: "Compress in place: read reads, write writes. For each run of equal chars, write the char then the count (if > 1).",
    },
  });

  while (read < n) {
    const ch = work[read];
    let count = 0;
    const runStart = read;
    while (read < n && work[read] === ch) { read++; count++; }
    steps.push({
      title: { vi: `Đoạn '${ch}' dài ${count} (từ ${runStart})`, en: `Run '${ch}' of length ${count} (from ${runStart})` },
      arr: [], sub: null,
      highlight: [], mark: [],
      codeLines: [4, 5, 6],
      vars: [{ name: "ch", value: `'${ch}'` }, { name: "count", value: count }, { name: "read", value: read }, { name: "write", value: write }],
      note: { vi: `Đếm đoạn liên tiếp '${ch}': ${count} ký tự. read nhảy tới ${read}.`, en: `Count the run of '${ch}': ${count} chars. read jumps to ${read}.` },
    });

    work[write] = ch; write++;
    if (count > 1) {
      for (const d of String(count)) { work[write] = d; write++; }
    }
    steps.push({
      title: { vi: `Ghi '${ch}'${count > 1 ? ` + "${count}"` : ""} → write=${write}`, en: `Write '${ch}'${count > 1 ? ` + "${count}"` : ""} → write=${write}` },
      arr: [], sub: null,
      highlight: [], mark: [],
      codeLines: count > 1 ? [7, 8] : [7],
      vars: [{ name: "chars", value: `[${work.slice(0, write).join(",")}]` }, { name: "write", value: write }],
      note: {
        vi: count > 1
          ? `Ghi ký tự '${ch}' rồi ghi số lượng "${count}". Kết quả tới giờ: [${work.slice(0, write).join(",")}].`
          : `count=1 nên chỉ ghi '${ch}' (không ghi số). Kết quả tới giờ: [${work.slice(0, write).join(",")}].`,
        en: count > 1
          ? `Write char '${ch}' then the count "${count}". Result so far: [${work.slice(0, write).join(",")}].`
          : `count=1 so write only '${ch}' (no digit). Result so far: [${work.slice(0, write).join(",")}].`,
      },
    });
  }

  steps.push({
    title: { vi: `return ${write} → [${work.slice(0, write).join(",")}]`, en: `return ${write} → [${work.slice(0, write).join(",")}]` },
    arr: [], sub: null,
    highlight: [], mark: [], final: true,
    codeLines: [9],
    vars: [{ name: "new length", value: write }, { name: "compressed", value: `[${work.slice(0, write).join(",")}]` }],
    note: { vi: `Độ dài sau nén = ${write}. Mảng đầu: [${work.slice(0, write).join(",")}].`, en: `Compressed length = ${write}. Front of array: [${work.slice(0, write).join(",")}].` },
  });

  return { original: chars, answer: write, steps };
}

/** LeetCode 11: Container With Most Water — move the shorter wall inward. */
function buildSteps11(input) {
  const h = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  let left = 0, right = h.length - 1, best = 0, bl = 0, br = h.length - 1;
  steps.push({ title: { vi: "left=0, right=n-1", en: "left=0, right=n-1" }, arr: [...h], sub: h.map((_, i) => `[${i}]`), highlight: [left, right], mark: [], codeLines: [3], vars: [{ name: "left", value: left }, { name: "right", value: right }], note: { vi: "Diện tích = min(2 cột) × khoảng cách. Dời con trỏ ở cột THẤP hơn vào trong vì nó giới hạn chiều cao.", en: "Area = min(two walls) × distance. Move the pointer at the SHORTER wall inward since it limits the height." } });
  while (left < right) {
    const area = (right - left) * Math.min(h[left], h[right]);
    if (area > best) { best = area; bl = left; br = right; }
    const moveLeft = h[left] < h[right];
    steps.push({
      title: { vi: `area=(${right}-${left})×min(${h[left]},${h[right]})=${area}`, en: `area=(${right}-${left})×min(${h[left]},${h[right]})=${area}` },
      arr: [...h], sub: h.map((_, i) => `[${i}]`), highlight: [left, right], mark: [bl, br],
      codeLines: moveLeft ? [4, 5, 6] : [4, 5, 7],
      vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "area", value: area }, { name: "best", value: best }],
      note: { vi: `Diện tích hiện tại ${area}, best=${best}. Cột ${moveLeft ? `trái (${h[left]})` : `phải (${h[right]})`} thấp hơn → dời ${moveLeft ? "left++" : "right--"}.`, en: `Current area ${area}, best=${best}. The ${moveLeft ? `left wall (${h[left]})` : `right wall (${h[right]})`} is shorter → move ${moveLeft ? "left++" : "right--"}.` },
    });
    if (moveLeft) left++; else right--;
  }
  steps.push({ title: { vi: `Đáp án: ${best}`, en: `Answer: ${best}` }, arr: [...h], sub: h.map((_, i) => `[${i}]`), highlight: [], mark: [bl, br], final: true, codeLines: [8], vars: [{ name: "answer", value: best }], note: { vi: `Diện tích chứa nước lớn nhất = ${best} (cột ${bl} và ${br}).`, en: `Maximum water area = ${best} (walls ${bl} and ${br}).` } });
  return { original: h, answer: best, steps };
}

/** LeetCode 167: Two Sum II — sorted two pointers. */
function buildSteps167(input, params) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const target = params && params.target !== undefined ? Number(params.target) : 9;
  const steps = [];
  let left = 0, right = nums.length - 1;
  steps.push({ title: { vi: `left=0, right=n-1, target=${target}`, en: `left=0, right=n-1, target=${target}` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [left, right], mark: [], codeLines: [3], vars: [{ name: "target", value: target }, { name: "left", value: left }, { name: "right", value: right }], note: { vi: "Mảng đã sắp xếp. Tổng nhỏ → left++; tổng lớn → right--; bằng → tìm thấy.", en: "Array is sorted. Sum too small → left++; too big → right--; equal → found." } });
  let answer = [];
  while (left < right) {
    const total = nums[left] + nums[right];
    if (total === target) {
      answer = [left + 1, right + 1];
      steps.push({ title: { vi: `${nums[left]}+${nums[right]}=${target} ✓ → [${left + 1},${right + 1}]`, en: `${nums[left]}+${nums[right]}=${target} ✓ → [${left + 1},${right + 1}]` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [left, right], mark: [left, right], final: true, codeLines: [4, 5], vars: [{ name: "answer (1-indexed)", value: `[${left + 1},${right + 1}]` }], note: { vi: `Tìm thấy cặp tổng = ${target}. Trả về chỉ số 1-based.`, en: `Found the pair summing to ${target}. Return 1-based indices.` } });
      break;
    }
    const less = total < target;
    steps.push({ title: { vi: `${nums[left]}+${nums[right]}=${total} ${less ? "<" : ">"} ${target}`, en: `${nums[left]}+${nums[right]}=${total} ${less ? "<" : ">"} ${target}` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [left, right], mark: [], codeLines: less ? [6, 7] : [8, 9], vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "sum", value: total }], note: { vi: less ? `Tổng ${total} < ${target} → cần lớn hơn → left++.` : `Tổng ${total} > ${target} → cần nhỏ hơn → right--.`, en: less ? `Sum ${total} < ${target} → need larger → left++.` : `Sum ${total} > ${target} → need smaller → right--.` } });
    if (less) left++; else right--;
  }
  return { original: nums, answer, steps };
}

/** LeetCode 125: Valid Palindrome — skip non-alnum, compare. */
function buildSteps125(input) {
  const s = String(input);
  const chars = s.split("");
  const steps = [];
  let left = 0, right = s.length - 1;
  const clean = (c) => /[a-z0-9]/i.test(c);
  steps.push({ title: { vi: "left=0, right=n-1", en: "left=0, right=n-1" }, arr: [], grid: { dp: [["", ...chars]], text1: "", text2: s, colLabels: chars.map((c, i) => ({ index: `${i}`, char: c })), largeCells: true }, highlight: [], mark: [], codeLines: [3], vars: [{ name: "s", value: `"${s}"` }], note: { vi: "Bỏ qua ký tự không phải chữ/số, so sánh không phân biệt hoa thường từ hai đầu vào giữa.", en: "Skip non-alphanumeric chars, compare case-insensitively from both ends inward." } });
  function snap(o) { steps.push({ title: o.title, arr: [], grid: { dp: [["", ...chars]], text1: "", text2: s, colLabels: chars.map((c, i) => ({ index: `${i}`, char: c })), hlCell: null, pathCells: [[0, left + 1], [0, right + 1]], largeCells: true }, highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  let answer = true;
  while (left < right) {
    if (!clean(s[left])) { snap({ title: { vi: `s[${left}]='${s[left]}' không phải chữ/số → left++`, en: `s[${left}]='${s[left]}' non-alnum → left++` }, codeLines: [4, 5], vars: [{ name: "left", value: left }], note: { vi: "Bỏ qua ký tự bên trái.", en: "Skip the left char." } }); left++; continue; }
    if (!clean(s[right])) { snap({ title: { vi: `s[${right}]='${s[right]}' không phải chữ/số → right--`, en: `s[${right}]='${s[right]}' non-alnum → right--` }, codeLines: [6, 7], vars: [{ name: "right", value: right }], note: { vi: "Bỏ qua ký tự bên phải.", en: "Skip the right char." } }); right--; continue; }
    const eq = s[left].toLowerCase() === s[right].toLowerCase();
    snap({ title: { vi: `'${s[left]}' ${eq ? "==" : "≠"} '${s[right]}'`, en: `'${s[left]}' ${eq ? "==" : "≠"} '${s[right]}'` }, codeLines: [8, 9], final: !eq, vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "match?", value: eq }], note: { vi: eq ? `Khớp → dời cả hai con trỏ.` : `Không khớp → KHÔNG phải palindrome → False.`, en: eq ? `Match → move both pointers.` : `Mismatch → NOT a palindrome → False.` } });
    if (!eq) { answer = false; break; }
    left++; right--;
  }
  if (answer) snap({ title: { vi: "Là palindrome → True", en: "Is a palindrome → True" }, final: true, codeLines: [10], vars: [{ name: "answer", value: true }], note: { vi: "Mọi cặp đều khớp.", en: "All pairs matched." } });
  return { original: s, answer, steps };
}

/** LeetCode 16: 3Sum Closest. */
function buildSteps16(input, params) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  nums.sort((a, b) => a - b);
  const target = params && params.target !== undefined ? Number(params.target) : 1;
  const n = nums.length;
  const steps = [];
  let closest = nums[0] + nums[1] + nums[2];
  steps.push({ title: { vi: `Sắp xếp; target=${target}`, en: `Sort; target=${target}` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], codeLines: [3], vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "target", value: target }, { name: "closest", value: closest }], note: { vi: "Cố định nums[i], hai con trỏ tìm tổng gần target nhất.", en: "Fix nums[i], two pointers find the sum closest to target." } });
  for (let i = 0; i < n - 2; i++) {
    let left = i + 1, right = n - 1;
    while (left < right) {
      const total = nums[i] + nums[left] + nums[right];
      if (Math.abs(total - target) < Math.abs(closest - target)) closest = total;
      const less = total < target, eq = total === target;
      steps.push({ title: { vi: `i=${i}: ${nums[i]}+${nums[left]}+${nums[right]}=${total}, closest=${closest}`, en: `i=${i}: ${nums[i]}+${nums[left]}+${nums[right]}=${total}, closest=${closest}` }, arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i, left, right], mark: [i], codeLines: eq ? [4, 5, 6] : (less ? [4, 5, 7] : [4, 5, 8]), vars: [{ name: "sum", value: total }, { name: "closest", value: closest }, { name: "|sum-target|", value: Math.abs(total - target) }], note: { vi: eq ? `Trùng target → trả về ngay.` : (less ? `Tổng < target → left++.` : `Tổng > target → right--.`), en: eq ? `Equals target → return immediately.` : (less ? `Sum < target → left++.` : `Sum > target → right--.`) } });
      if (eq) return { original: nums, answer: total, steps: (steps[steps.length - 1].final = true, steps) };
      if (less) left++; else right--;
    }
  }
  steps.push({ title: { vi: `Đáp án: ${closest}`, en: `Answer: ${closest}` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], final: true, codeLines: [9], vars: [{ name: "answer", value: closest }], note: { vi: `Tổng ba số gần target nhất = ${closest}.`, en: `Closest three-sum to target = ${closest}.` } });
  return { original: nums, answer: closest, steps };
}

/**
 * LeetCode 611: Valid Triangle Number.
 * Sort the sides, fix the largest side nums[k], then scan left/right.
 */
function buildSteps611(input) {
  const original = Array.isArray(input)
    ? [...input]
    : String(input || "").split(",").map((s) => Number(s.trim())).filter((x) => !Number.isNaN(x));
  const steps = [];
  const valid = original.length >= 3 && original.every((x) => Number.isFinite(x) && x > 0);
  const nums = [...original].sort((a, b) => a - b);

  function snap(opts) {
    const pointers = [opts.left, opts.right, opts.k].filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < nums.length);
    steps.push({
      title: opts.title,
      arr: [...nums],
      sub: nums.map((_, i) => `[${i}]`),
      highlight: opts.highlight || pointers,
      mark: opts.mark || [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      triangleCountView: {
        nums: [...nums],
        left: opts.left,
        right: opts.right,
        k: opts.k,
        count: opts.count,
        sum: opts.sum,
        condition: opts.condition,
        added: opts.added || 0,
        validStart: opts.validStart,
        validEnd: opts.validEnd,
        phase: opts.phase || "idle",
      },
    });
  }

  if (!valid) {
    snap({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      codeLines: [2], final: true,
      vars: [{ name: "nums", value: `[${original.join(", ")}]` }],
      note: { vi: "nums phải có ít nhất 3 cạnh có độ dài nguyên dương.", en: "nums must contain at least three positive side lengths." },
    });
    return { original, answer: null, steps };
  }

  let count = 0;
  snap({
    title: { vi: `nums.sort() → [${nums.join(", ")}]`, en: `nums.sort() → [${nums.join(", ")}]` },
    codeLines: [3], count,
    vars: [{ name: "nums (sorted)", value: `[${nums.join(", ")}]` }],
    note: { vi: "Sắp xếp tăng dần. Khi cố định cạnh lớn nhất nums[k], chỉ cần kiểm tra nums[left] + nums[right] > nums[k].", en: "Sort ascending. After fixing the largest side nums[k], only check nums[left] + nums[right] > nums[k]." },
  });
  snap({
    title: { vi: "count = 0", en: "count = 0" },
    codeLines: [4], count,
    vars: [{ name: "count", value: count }],
    note: { vi: "count lưu tổng số bộ ba tạo thành tam giác.", en: "count stores the total number of triangle triplets." },
  });

  for (let k = nums.length - 1; k >= 2; k--) {
    snap({
      title: { vi: `for k = ${k}: cố định cạnh lớn nhất nums[k]=${nums[k]}`, en: `for k = ${k}: fix largest side nums[k]=${nums[k]}` },
      codeLines: [5], k, count,
      vars: [{ name: "k", value: k }, { name: "nums[k]", value: nums[k] }, { name: "count", value: count }],
      note: { vi: "Vì mảng đã tăng dần, nums[k] là cạnh lớn nhất của mọi bộ ba đang xét.", en: "Because the array is sorted, nums[k] is the largest side of every triplet currently considered." },
    });

    let left = 0;
    let right = k - 1;
    snap({
      title: { vi: `left=0, right=${right}`, en: `left=0, right=${right}` },
      codeLines: [6], left, right, k, count,
      vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "k", value: k }],
      note: { vi: "Đặt hai con trỏ trong đoạn [0..k-1].", en: "Place two pointers inside range [0..k-1]." },
    });

    while (left < right) {
      snap({
        title: { vi: `while left < right → ${left} < ${right} → True`, en: `while left < right → ${left} < ${right} → True` },
        codeLines: [7], left, right, k, count, phase: "while-check",
        vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "k", value: k }],
        note: { vi: "Hai con trỏ chưa gặp nhau, tiếp tục kiểm tra một cặp cạnh.", en: "The two pointers have not met, so inspect another pair of sides." },
      });
      const sum = nums[left] + nums[right];
      const condition = sum > nums[k];
      snap({
        title: { vi: `nums[${left}] + nums[${right}] > nums[${k}] → ${nums[left]} + ${nums[right]} > ${nums[k]} là ${condition}`, en: `nums[${left}] + nums[${right}] > nums[${k}] → ${nums[left]} + ${nums[right]} > ${nums[k]} is ${condition}` },
        codeLines: [8], left, right, k, count, sum, condition, phase: "compare",
        vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "k", value: k }, { name: "sum", value: sum }],
        note: condition
          ? { vi: `Đúng. Vì nums[left..right-1] đều ≥ nums[left], mọi i từ ${left} đến ${right - 1} ghép với right và k đều hợp lệ.`, en: `True. Since nums[left..right-1] are all ≥ nums[left], every i from ${left} to ${right - 1} forms a valid triangle with right and k.` }
          : { vi: "Sai: tổng hai cạnh nhỏ nhất đang chọn chưa vượt cạnh lớn nhất, nên phải tăng left.", en: "False: the selected two sides do not exceed the largest side, so increase left." },
      });

      if (condition) {
        const added = right - left;
        count += added;
        snap({
          title: { vi: `count += right-left → +${added}, count=${count}`, en: `count += right-left → +${added}, count=${count}` },
          codeLines: [9], left, right, k, count, sum, condition, added, validStart: left, validEnd: right - 1, phase: "count",
          mark: Array.from({ length: added }, (_, offset) => left + offset),
          vars: [{ name: "right - left", value: added }, { name: "count", value: count }],
          note: { vi: `Cộng ${added}: các tam giác (nums[i], nums[${right}], nums[${k}]) với i ∈ [${left}..${right - 1}] đều hợp lệ.`, en: `Add ${added}: triangles (nums[i], nums[${right}], nums[${k}]) for i ∈ [${left}..${right - 1}] are all valid.` },
        });
        right--;
        snap({
          title: { vi: `right -= 1 → right=${right}`, en: `right -= 1 → right=${right}` },
          codeLines: [10], left, right, k, count, phase: "move-right",
          vars: [{ name: "right", value: right }, { name: "count", value: count }],
          note: { vi: "Đã đếm xong mọi bộ ba dùng right cũ, lùi right để thử cạnh giữa nhỏ hơn.", en: "All triplets using the old right were counted, so move right leftward to try a smaller middle side." },
        });
      } else {
        snap({
          title: { vi: "else: điều kiện tam giác chưa đúng", en: "else: triangle condition is not met" },
          codeLines: [11], left, right, k, count, sum, condition, phase: "else",
          vars: [{ name: "sum", value: sum }, { name: "nums[k]", value: nums[k] }],
          note: { vi: "Đi vào else vì sum ≤ nums[k].", en: "Enter else because sum ≤ nums[k]." },
        });
        left++;
        snap({
          title: { vi: `left += 1 → left=${left}`, en: `left += 1 → left=${left}` },
          codeLines: [12], left, right, k, count, phase: "move-left",
          vars: [{ name: "left", value: left }, { name: "count", value: count }],
          note: { vi: "Tăng left để tăng tổng nums[left] + nums[right].", en: "Increase left to raise nums[left] + nums[right]." },
        });
      }
    }
  }

  snap({
    title: { vi: `return count → ${count}`, en: `return count → ${count}` },
    codeLines: [13], count, final: true, phase: "done",
    vars: [{ name: "count", value: count }],
    note: { vi: `Có ${count} bộ ba chỉ số tạo thành tam giác hợp lệ.`, en: `There are ${count} index triplets that form valid triangles.` },
  });
  return { original, answer: count, steps };
}

/** LeetCode 18: 4Sum. */
function buildSteps18(input, params) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  nums.sort((a, b) => a - b);
  const target = params && params.target !== undefined ? Number(params.target) : 0;
  const n = nums.length;
  const steps = [];
  const res = [];
  steps.push({ title: { vi: `Sắp xếp; target=${target}`, en: `Sort; target=${target}` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], codeLines: [3], vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "target", value: target }], note: { vi: "Cố định 2 số (i,j), hai con trỏ tìm cặp còn lại. Bỏ qua trùng.", en: "Fix two numbers (i,j), two pointers find the remaining pair. Skip duplicates." } });
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) continue;
      let left = j + 1, right = n - 1;
      while (left < right) {
        const total = nums[i] + nums[j] + nums[left] + nums[right];
        if (total === target) {
          res.push([nums[i], nums[j], nums[left], nums[right]]);
          steps.push({ title: { vi: `[${nums[i]},${nums[j]},${nums[left]},${nums[right]}] = ${target} ✓`, en: `[${nums[i]},${nums[j]},${nums[left]},${nums[right]}] = ${target} ✓` }, arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i, j, left, right], mark: [i, j, left, right], codeLines: [6], vars: [{ name: "quad", value: `[${nums[i]},${nums[j]},${nums[left]},${nums[right]}]` }, { name: "res", value: JSON.stringify(res) }], note: { vi: "Tìm thấy bộ 4. Dời hai con trỏ, bỏ trùng.", en: "Found a quadruplet. Move both pointers, skip duplicates." } });
          left++; right--;
          while (left < right && nums[left] === nums[left - 1]) left++;
          while (left < right && nums[right] === nums[right + 1]) right--;
        } else if (total < target) {
          steps.push({ title: { vi: `tổng=${total} < ${target} → left++`, en: `sum=${total} < ${target} → left++` }, arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i, j, left, right], mark: [i, j], codeLines: [7], vars: [{ name: "sum", value: total }], note: { vi: `Cần lớn hơn → left++.`, en: `Need larger → left++.` } });
          left++;
        } else {
          steps.push({ title: { vi: `tổng=${total} > ${target} → right--`, en: `sum=${total} > ${target} → right--` }, arr: [...nums], sub: nums.map((_, x) => `[${x}]`), highlight: [i, j, left, right], mark: [i, j], codeLines: [8], vars: [{ name: "sum", value: total }], note: { vi: `Cần nhỏ hơn → right--.`, en: `Need smaller → right--.` } });
          right--;
        }
      }
    }
  }
  steps.push({ title: { vi: `Kết quả: ${JSON.stringify(res)}`, en: `Result: ${JSON.stringify(res)}` }, arr: [...nums], sub: nums.map((_, i) => `[${i}]`), highlight: [], mark: [], final: true, codeLines: [9], vars: [{ name: "answer", value: JSON.stringify(res) }], note: { vi: `Mọi bộ 4 khác nhau tổng = ${target}.`, en: `All unique quadruplets summing to ${target}.` } });
  return { original: nums, answer: res, steps };
}

/** LeetCode 80: Remove Duplicates from Sorted Array II (at most twice). */
function buildSteps80(input) {
  const nums = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const arr = [...nums];
  const steps = [];
  let write = 0;
  steps.push({ title: { vi: "write = 0", en: "write = 0" }, arr: [...arr], sub: arr.map((_, i) => `[${i}]`), highlight: [], mark: [], codeLines: [3], vars: [{ name: "nums", value: `[${arr.join(",")}]` }, { name: "write", value: 0 }], note: { vi: "Mỗi giá trị được giữ tối đa 2 lần. Ghi nums[i] nếu write<2 hoặc khác nums[write-2].", en: "Each value kept at most twice. Write nums[i] if write<2 or it differs from nums[write-2]." } });
  for (let i = 0; i < arr.length; i++) {
    const keep = write < 2 || arr[i] !== arr[write - 2];
    if (keep) {
      arr[write] = arr[i];
      steps.push({ title: { vi: `nums[${i}]=${nums[i]} giữ → nums[${write}]`, en: `nums[${i}]=${nums[i]} keep → nums[${write}]` }, arr: [...arr], sub: arr.map((_, x) => `[${x}]`), highlight: [i], mark: Array.from({ length: write + 1 }, (_, x) => x), codeLines: [4, 5, 6], vars: [{ name: "i", value: i }, { name: "write", value: write + 1 }], note: { vi: `${write < 2 ? `write<2` : `khác nums[write-2]=${arr[write - 2]}`} → giữ. write++.`, en: `${write < 2 ? `write<2` : `differs from nums[write-2]=${arr[write - 2]}`} → keep. write++.` } });
      write++;
    } else {
      steps.push({ title: { vi: `nums[${i}]=${nums[i]} trùng lần 3 → bỏ`, en: `nums[${i}]=${nums[i]} 3rd copy → skip` }, arr: [...arr], sub: arr.map((_, x) => `[${x}]`), highlight: [i], mark: Array.from({ length: write }, (_, x) => x), codeLines: [4], vars: [{ name: "i", value: i }, { name: "write", value: write }], note: { vi: `Bằng nums[write-2]=${arr[write - 2]} → đã có 2 bản → bỏ.`, en: `Equals nums[write-2]=${arr[write - 2]} → already twice → skip.` } });
    }
  }
  steps.push({ title: { vi: `return ${write} → [${arr.slice(0, write).join(",")}]`, en: `return ${write} → [${arr.slice(0, write).join(",")}]` }, arr: [...arr], sub: arr.map((_, i) => `[${i}]`), highlight: [], mark: Array.from({ length: write }, (_, x) => x), final: true, codeLines: [7], vars: [{ name: "k", value: write }], note: { vi: `Còn ${write} phần tử.`, en: `${write} elements remain.` } });
  return { original: nums, answer: write, steps };
}

module.exports = {
  11: {
    id: 11, difficulty: "medium", slug: "container-with-most-water",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Container With Most Water", en: "Container With Most Water" },
    titleVi: { vi: "Chứa nhiều nước nhất (hai con trỏ)", en: "Most water container (two pointers)" },
    statement: { vi: "Cho mảng chiều cao các cột. Chọn 2 cột tạo thùng chứa nhiều nước nhất. Nhập cách nhau dấu phẩy.", en: "Given wall heights, pick 2 walls forming the container holding the most water. Enter comma-separated." },
    defaultInput: [1, 8, 6, 2, 5, 4, 8, 3, 7], inputKind: "nonneg", inputLabel: { vi: "height", en: "height" }, extraParams: [],
    approach: [{ vi: "Hai con trỏ từ hai đầu; diện tích = min(2 cột)×khoảng cách.", en: "Two pointers from both ends; area = min(walls)×distance." }, { vi: "Luôn dời con trỏ ở cột THẤP hơn vào trong.", en: "Always move the pointer at the SHORTER wall inward." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt hai con trỏ.", en: "Single two-pointer pass." } },
    code: ["class Solution:", "    def maxArea(self, height):", "        left, right = 0, len(height)-1; best = 0", "        while left < right:", "            best = max(best, (right-left)*min(height[left], height[right]))", "            if height[left] < height[right]: left += 1", "            else: right -= 1", "        return best"],
    builder: buildSteps11,
  },
  16: {
    id: 16, difficulty: "medium", slug: "3sum-closest",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "3Sum Closest", en: "3Sum Closest" },
    titleVi: { vi: "Bộ ba tổng gần target nhất", en: "Three-sum closest to target" },
    statement: { vi: "Tìm 3 số có tổng GẦN target nhất. Nhập nums cách nhau dấu phẩy; target trong tham số.", en: "Find 3 numbers whose sum is CLOSEST to target. Enter nums comma-separated; target as a parameter." },
    defaultInput: [-1, 2, 1, -4], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" },
    extraParams: [{ key: "target", label: { vi: "target", en: "target" }, default: 1 }],
    approach: [{ vi: "Sắp xếp; cố định nums[i], hai con trỏ.", en: "Sort; fix nums[i], two pointers." }, { vi: "Cập nhật closest nếu |sum-target| nhỏ hơn.", en: "Update closest if |sum-target| is smaller." }, { vi: "sum<target → left++; sum>target → right--.", en: "sum<target → left++; sum>target → right--." }],
    complexity: { time: "O(n²)", space: "O(1)", note: { vi: "Sort + hai con trỏ.", en: "Sort + two pointers." } },
    code: ["class Solution:", "    def threeSumClosest(self, nums, target):", "        nums.sort(); closest = nums[0]+nums[1]+nums[2]", "        for i in range(len(nums)-2):", "            l, r = i+1, len(nums)-1", "            while l < r:", "                s = nums[i]+nums[l]+nums[r]", "                if abs(s-target) < abs(closest-target): closest = s", "                if s < target: l += 1", "                elif s > target: r -= 1", "                else: return s", "        return closest"],
    builder: buildSteps16,
  },
  611: {
    id: 611,
    difficulty: "medium",
    slug: "valid-triangle-number",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: { vi: "Valid Triangle Number", en: "Valid Triangle Number" },
    titleVi: { vi: "Đếm bộ ba tạo thành tam giác", en: "Count valid triangle triplets" },
    statement: {
      vi: "Cho mảng cạnh nums. Đếm số bộ ba chỉ số i < j < k sao cho ba độ dài đó tạo thành một tam giác.",
      en: "Given side lengths nums, count index triplets i < j < k whose three lengths form a triangle.",
    },
    defaultInput: [2, 2, 3, 4],
    inputKind: "positive",
    inputLabel: { vi: "nums (độ dài cạnh)", en: "nums (side lengths)" },
    extraParams: [],
    approach: [
      { vi: "Sắp xếp tăng dần, rồi cố định nums[k] là cạnh lớn nhất.", en: "Sort ascending, then fix nums[k] as the largest side." },
      { vi: "Dùng left=0 và right=k-1. Kiểm tra nums[left] + nums[right] > nums[k].", en: "Use left=0 and right=k-1. Check nums[left] + nums[right] > nums[k]." },
      { vi: "Nếu đúng, mọi i trong [left..right-1] đều hợp lệ: cộng right-left rồi right--. Nếu sai, left++.", en: "If true, every i in [left..right-1] is valid: add right-left then right--. Otherwise left++." },
    ],
    complexity: { time: "O(n²)", space: "O(1)", note: { vi: "Sau khi sort O(n log n), mỗi k chạy hai con trỏ trong O(n).", en: "After O(n log n) sorting, two pointers run in O(n) for each k." } },
    code: [
      "class Solution:",
      "    def triangleNumber(self, nums):",
      "        nums.sort()",
      "        count = 0",
      "        for k in range(len(nums) - 1, 1, -1):",
      "            left, right = 0, k - 1",
      "            while left < right:",
      "                if nums[left] + nums[right] > nums[k]:",
      "                    count += right - left",
      "                    right -= 1",
      "                else:",
      "                    left += 1",
      "        return count",
    ],
    builder: buildSteps611,
  },
  18: {
    id: 18, difficulty: "medium", slug: "4sum",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "4Sum", en: "4Sum" },
    titleVi: { vi: "Bộ bốn tổng bằng target", en: "Quadruplets summing to target" },
    statement: { vi: "Tìm mọi bộ 4 KHÁC NHAU tổng = target. Nhập nums cách nhau dấu phẩy; target trong tham số.", en: "Find all UNIQUE quadruplets summing to target. Enter nums comma-separated; target as a parameter." },
    defaultInput: [1, 0, -1, 0, -2, 2], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" },
    extraParams: [{ key: "target", label: { vi: "target", en: "target" }, default: 0 }],
    approach: [{ vi: "Sắp xếp; cố định 2 số (i,j), hai con trỏ tìm cặp còn lại.", en: "Sort; fix two numbers (i,j), two pointers find the remaining pair." }, { vi: "Bỏ qua giá trị trùng ở mọi tầng.", en: "Skip duplicate values at every level." }],
    complexity: { time: "O(n³)", space: "O(1)", note: { vi: "Hai vòng + hai con trỏ.", en: "Two loops + two pointers." } },
    code: ["class Solution:", "    def fourSum(self, nums, target):", "        nums.sort(); res = []; n = len(nums)", "        for i in range(n-3):", "            for j in range(i+1, n-2):", "                l, r = j+1, n-1", "                while l < r:", "                    s = nums[i]+nums[j]+nums[l]+nums[r]", "                    if s < target: l += 1", "                    elif s > target: r -= 1", "                    else: res.append([nums[i],nums[j],nums[l],nums[r]]); l+=1; r-=1", "        return res"],
    builder: buildSteps18,
  },
  80: {
    id: 80, difficulty: "medium", slug: "remove-duplicates-from-sorted-array-ii",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Remove Duplicates from Sorted Array II", en: "Remove Duplicates from Sorted Array II" },
    titleVi: { vi: "Xóa trùng (giữ tối đa 2 bản)", en: "Remove duplicates (keep at most two)" },
    statement: { vi: "Xóa trùng tại chỗ sao cho mỗi giá trị xuất hiện tối đa 2 lần. Trả về độ dài mới. Nhập mảng đã sắp xếp.", en: "Remove duplicates in-place so each value appears at most twice. Return the new length. Enter a sorted array." },
    defaultInput: [1, 1, 1, 2, 2, 3], inputKind: "integer", inputLabel: { vi: "nums (đã sắp)", en: "nums (sorted)" }, extraParams: [],
    approach: [{ vi: "Con trỏ write ghi phần tử được giữ.", en: "A write pointer places kept elements." }, { vi: "Giữ nums[i] nếu write<2 hoặc nums[i]≠nums[write-2].", en: "Keep nums[i] if write<2 or nums[i]≠nums[write-2]." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt tại chỗ.", en: "Single in-place pass." } },
    code: ["class Solution:", "    def removeDuplicates(self, nums):", "        write = 0", "        for num in nums:", "            if write < 2 or num != nums[write-2]:", "                nums[write] = num; write += 1", "        return write"],
    builder: buildSteps80,
  },
  125: {
    id: 125, difficulty: "easy", slug: "valid-palindrome",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Valid Palindrome", en: "Valid Palindrome" },
    titleVi: { vi: "Kiểm tra palindrome (bỏ ký tự đặc biệt)", en: "Valid palindrome (ignore non-alnum)" },
    statement: { vi: "Chỉ xét chữ và số, không phân biệt hoa thường. Chuỗi có phải palindrome không? Nhập chuỗi s.", en: "Consider only alphanumeric chars, case-insensitive. Is the string a palindrome? Enter the string s." },
    defaultInput: "A man, a plan, a canal: Panama", inputKind: "string", inputLabel: { vi: "s", en: "s" }, extraParams: [],
    approach: [{ vi: "Hai con trỏ từ hai đầu.", en: "Two pointers from both ends." }, { vi: "Bỏ qua ký tự không phải chữ/số.", en: "Skip non-alphanumeric chars." }, { vi: "So sánh không phân biệt hoa thường.", en: "Compare case-insensitively." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt hai con trỏ.", en: "Single two-pointer pass." } },
    code: ["class Solution:", "    def isPalindrome(self, s):", "        l, r = 0, len(s)-1", "        while l < r:", "            while l < r and not s[l].isalnum(): l += 1", "            while l < r and not s[r].isalnum(): r -= 1", "            if s[l].lower() != s[r].lower(): return False", "            l += 1; r -= 1", "        return True"],
    builder: buildSteps125,
  },
  167: {
    id: 167, difficulty: "medium", slug: "two-sum-ii-input-array-is-sorted",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Two Sum II - Input Array Is Sorted", en: "Two Sum II - Input Array Is Sorted" },
    titleVi: { vi: "Two Sum trên mảng đã sắp (hai con trỏ)", en: "Two Sum on a sorted array (two pointers)" },
    statement: { vi: "Mảng đã sắp tăng dần. Tìm 2 số tổng = target, trả về chỉ số 1-based. Nhập numbers; target trong tham số.", en: "Sorted ascending array. Find 2 numbers summing to target, return 1-based indices. Enter numbers; target as a parameter." },
    defaultInput: [2, 7, 11, 15], inputKind: "integer", inputLabel: { vi: "numbers (đã sắp)", en: "numbers (sorted)" },
    extraParams: [{ key: "target", label: { vi: "target", en: "target" }, default: 9 }],
    approach: [{ vi: "Hai con trỏ từ hai đầu.", en: "Two pointers from both ends." }, { vi: "sum<target → left++; sum>target → right--.", en: "sum<target → left++; sum>target → right--." }, { vi: "sum==target → trả về [left+1, right+1].", en: "sum==target → return [left+1, right+1]." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt hai con trỏ.", en: "Single two-pointer pass." } },
    code: ["class Solution:", "    def twoSum(self, numbers, target):", "        l, r = 0, len(numbers)-1", "        while l < r:", "            s = numbers[l] + numbers[r]", "            if s == target: return [l+1, r+1]", "            if s < target: l += 1", "            else: r -= 1", "        return []"],
    builder: buildSteps167,
  },
  15: {
    id: 15,
    difficulty: "medium",
    slug: "3sum",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "3Sum", en: "3Sum" },
    titleVi: { vi: "Bộ ba tổng 0 (sort + hai con trỏ)", en: "Zero-sum triplets (sort + two pointers)" },
    statement: {
      vi: "Cho mảng nums. Tìm mọi bộ ba KHÁC NHAU [a,b,c] có a+b+c=0. Nhập nums cách nhau dấu phẩy.",
      en: "Given nums, find all UNIQUE triplets [a,b,c] with a+b+c=0. Enter nums comma-separated.",
    },
    defaultInput: [-1, 0, 1, 2, -1, -4],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Sắp xếp mảng tăng dần.", en: "Sort the array ascending." },
      { vi: "Cố định nums[i], dùng hai con trỏ left/right tìm cặp tổng = -nums[i].", en: "Fix nums[i], use two pointers left/right to find a pair summing to -nums[i]." },
      { vi: "tổng < 0 → left++; tổng > 0 → right--; tổng = 0 → lưu bộ ba.", en: "sum < 0 → left++; sum > 0 → right--; sum = 0 → record the triplet." },
      { vi: "Bỏ qua giá trị trùng ở anchor và hai con trỏ để tránh lặp.", en: "Skip duplicate values at the anchor and both pointers to avoid repeats." },
    ],
    complexity: { time: "O(n²)", space: "O(1)", note: { vi: "Sort O(n log n) + hai con trỏ O(n²).", en: "Sort O(n log n) + two pointers O(n²)." } },
    code: [
      "class Solution:",
      "    def threeSum(self, nums):",
      "        nums.sort(); res = []; n = len(nums)",
      "        for i in range(n-2):",
      "            if i>0 and nums[i]==nums[i-1]: continue",
      "            left, right = i+1, n-1",
      "            while left < right:",
      "                total = nums[i]+nums[left]+nums[right]",
      "                if total < 0: left += 1",
      "                elif total > 0: right -= 1",
      "                else: res.append([nums[i],nums[left],nums[right]]); left+=1; right-=1; skip dups",
      "        return res",
    ],
    builder: buildSteps15,
  },
  75: {
    id: 75,
    difficulty: "medium",
    slug: "sort-colors",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Sort Colors", en: "Sort Colors" },
    titleVi: { vi: "Sắp màu (Dutch National Flag)", en: "Sort colors (Dutch National Flag)" },
    statement: {
      vi: "Cho mảng gồm 0, 1, 2 (đỏ, trắng, xanh). Sắp xếp tại chỗ trong 1 lượt. Nhập cách nhau dấu phẩy.",
      en: "Given an array of 0, 1, 2 (red, white, blue), sort in-place in one pass. Enter comma-separated.",
    },
    defaultInput: [2, 0, 2, 1, 1, 0],
    inputKind: "integer",
    inputLabel: { vi: "nums (0/1/2)", en: "nums (0/1/2)" },
    extraParams: [],
    approach: [
      { vi: "3 con trỏ: low (biên vùng 0), mid (đang xét), high (biên vùng 2).", en: "3 pointers: low (0-region edge), mid (scanner), high (2-region edge)." },
      { vi: "nums[mid]=0 → swap với low, low++ mid++.", en: "nums[mid]=0 → swap with low, low++ mid++." },
      { vi: "nums[mid]=1 → mid++.", en: "nums[mid]=1 → mid++." },
      { vi: "nums[mid]=2 → swap với high, high-- (không tiến mid).", en: "nums[mid]=2 → swap with high, high-- (do not advance mid)." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt, 3 con trỏ.", en: "Single pass, 3 pointers." } },
    code: [
      "class Solution:",
      "    def sortColors(self, nums):",
      "        low, mid, high = 0, 0, len(nums)-1",
      "        while mid <= high:",
      "            if nums[mid] == 0: nums[low],nums[mid]=nums[mid],nums[low]; low+=1; mid+=1",
      "            elif nums[mid] == 1: mid += 1",
      "            else: nums[mid],nums[high]=nums[high],nums[mid]; high -= 1",
    ],
    builder: buildSteps75,
  },
  443: {
    id: 443,
    difficulty: "medium",
    slug: "string-compression",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "String Compression", en: "String Compression" },
    titleVi: { vi: "Nén chuỗi tại chỗ (read/write)", en: "In-place string compression (read/write)" },
    statement: {
      vi: "Nén mảng ký tự tại chỗ: mỗi đoạn ký tự giống nhau → ký tự + số lượng (nếu > 1). Trả về độ dài mới. Nhập các ký tự cách nhau dấu phẩy.",
      en: "Compress a char array in place: each run of equal chars → char + count (if > 1). Return the new length. Enter chars comma-separated.",
    },
    defaultInput: "a,a,b,b,c,c,c",
    inputKind: "string",
    inputLabel: { vi: "chars (cách bởi ,)", en: "chars (comma separated)" },
    extraParams: [],
    approach: [
      { vi: "Hai con trỏ: read đọc, write ghi.", en: "Two pointers: read reads, write writes." },
      { vi: "Đếm đoạn ký tự giống nhau bằng read.", en: "Count a run of equal chars with read." },
      { vi: "Ghi ký tự; nếu count > 1 ghi thêm các chữ số của count.", en: "Write the char; if count > 1 append the digits of count." },
      { vi: "Trả về vị trí write cuối cùng = độ dài sau nén.", en: "Return the final write position = compressed length." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt tại chỗ.", en: "Single in-place pass." } },
    code: [
      "class Solution:",
      "    def compress(self, chars):",
      "        write = read = 0; n = len(chars)",
      "        while read < n:",
      "            ch = chars[read]; count = 0",
      "            while read < n and chars[read] == ch: read += 1; count += 1",
      "            chars[write] = ch; write += 1",
      "            if count > 1:",
      "                for d in str(count): chars[write] = d; write += 1",
      "        return write",
    ],
    builder: buildSteps443,
  },
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
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: p1/p2/write, slice copy", en: "Approach 1: p1/p2/write, slice copy" } },
          { value: "2", label: { vi: "Cách 2: i/j/k, while copy", en: "Approach 2: i/j/k, while copy" } },
        ],
      },
    ],
    complexity: {
      time: "O(m+n)",
      space: "O(1)",
      note: {
        vi: "Ba con trỏ duyệt tổng m+n lần. Gộp tại chỗ nên O(1) bộ nhớ phụ.",
        en: "Three pointers traverse m+n times total. In-place merge uses O(1) extra memory.",
      },
    },
    codeLabel: { vi: "Cách 1: p1/p2/write, slice copy", en: "Approach 1: p1/p2/write, slice copy" },
    code2Label: { vi: "Cách 2: i/j/k, while copy", en: "Approach 2: i/j/k, while copy" },
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
    code2: [
      "class Solution:",
      "    def merge(self, nums1, m, nums2, n):",
      "        i = m - 1",
      "        j = n - 1",
      "        k = m + n - 1",
      "        while i >= 0 and j >= 0:",
      "            if nums1[i] < nums2[j]:",
      "                nums1[k] = nums2[j]",
      "                j -= 1",
      "                k -= 1",
      "            else:",
      "                nums1[k] = nums1[i]",
      "                i -= 1",
      "                k -= 1",
      "        while j >= 0:",
      "            nums1[k] = nums2[j]",
      "            j -= 1",
      "            k -= 1",
      "        return",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps88v2(input, params) : buildSteps88(input, params);
    },
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
      "        i = n - 1",
      "        j = n + arr.count(0) - 1",
      "        while i >= 0:",
      "            if arr[i] == 0:",
      "                if j <= n - 1:",
      "                    arr[j] = 0",
      "                j -= 1",
      "                if j <= n - 1:",
      "                    arr[j] = 0",
      "                j -= 1",
      "                i -= 1",
      "            else:",
      "                if j <= n - 1:",
      "                    arr[j] = arr[i]",
      "                j -= 1",
      "                i -= 1",
      "        return",
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
  475: {
    id: 475,
    difficulty: "medium",
    slug: "heaters",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Heaters", en: "Heaters" },
    titleVi: { vi: "Bán kính sưởi ấm nhỏ nhất (Binary Search)", en: "Minimum heater radius to cover all houses (Binary Search)" },
    statement: {
      vi:
        "Cho danh sách vị trí nhà (houses) và lò sưởi (heaters) trên trục số. " +
        "Tìm bán kính tối thiểu r sao cho mỗi nhà đều được ít nhất 1 lò sưởi phủ. " +
        "Nhập houses và heaters là hai chuỗi số cách nhau dấu phẩy.",
      en:
        "Given positions of houses and heaters on a number line, find the minimum radius r " +
        "such that every house is covered by at least one heater. " +
        "Enter houses and heaters as comma-separated numbers.",
    },
    defaultInput: [1, 2, 3, 5, 15],
    inputKind: "integer",
    inputLabel: { vi: "Nhà (houses)", en: "Houses" },
    extraParams: [
      { key: "heaters", label: { vi: "Lò sưởi (heaters)", en: "Heaters" }, default: "2,9" },
    ],
    approach: [
      { vi: "Sắp xếp heaters. Với mỗi nhà h, dùng binary search (bisect_left) tìm vị trí chèn pos trong heaters.", en: "Sort heaters. For each house h, use binary search (bisect_left) to find insertion point pos in heaters." },
      { vi: "left_dist = |heaters[pos-1] - h| nếu pos > 0, ngược lại ∞.", en: "left_dist = |heaters[pos-1] - h| if pos > 0, else ∞." },
      { vi: "right_dist = |heaters[pos] - h| nếu pos < len(heaters), ngược lại ∞.", en: "right_dist = |heaters[pos] - h| if pos < len(heaters), else ∞." },
      { vi: "min_dist = min(left_dist, right_dist) = khoảng cách tới lò sưởi gần nhất.", en: "min_dist = min(left_dist, right_dist) = distance to the nearest heater." },
      { vi: "res = max(res, min_dist). Kết quả là bán kính lớn nhất cần thiết.", en: "res = max(res, min_dist). Result is the maximum min_dist across all houses." },
    ],
    complexity: {
      time: "O((m+n) log n)",
      space: "O(1)",
      note: {
        vi: "n = số lò sưởi, m = số nhà. Sort O(n log n) + binary search O(log n) × m nhà.",
        en: "n = heaters, m = houses. Sort O(n log n) + binary search O(log n) per house.",
      },
    },
    code: [
      "import bisect",
      "class Solution:",
      "    def findRadius(self, houses, heaters):",
      "        heaters.sort()",
      "        res = 0",
      "        for h in houses:",
      "            pos = bisect.bisect_left(heaters, h)",
      "            if pos > 0:",
      "                left_dist = abs(heaters[pos-1] - h)",
      "            else:",
      "                left_dist = float('inf')",
      "            if pos < len(heaters):",
      "                right_dist = abs(heaters[pos] - h)",
      "            else:",
      "                right_dist = float('inf')",
      "            min_dist = min(left_dist, right_dist)",
      "            res = max(res, min_dist)",
      "        return res",
    ],
    builder: buildSteps475,
  },
};
