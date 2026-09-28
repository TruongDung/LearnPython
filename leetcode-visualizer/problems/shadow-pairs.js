// Focused array problem definitions extracted from array.js.
module.exports = {};


function validateShadowPairs4054Input(nums) {
  if (!Array.isArray(nums) || nums.length < 3) {
    throw new Error("nums must contain at least 3 integers.");
  }
  if (nums.length > 40) {
    throw new Error("Use at most 40 values so the line-by-line visualization stays readable.");
  }
  if (!nums.every((value) => Number.isInteger(value) && value >= 1 && value <= 1_000_000_000)) {
    throw new Error("nums must contain integers from 1 to 1,000,000,000.");
  }
  return [...nums];
}

function buildSteps4054(input) {
  const nums = validateShadowPairs4054Input(input);
  const candidates = [];
  const steps = [];
  let answer = 0;

  function lowerBound(value) {
    let left = 0;
    let right = candidates.length;
    while (left < right) {
      const middle = Math.floor((left + right) / 2);
      if (candidates[middle].value < value) left = middle + 1;
      else right = middle;
    }
    return left;
  }

  function snapshot({
    phase,
    phaseIndex,
    operation,
    codeLine,
    title,
    note,
    j = -1,
    value = null,
    smaller = null,
    answerBefore = answer,
    qualifying = [],
    popped = null,
    shouldPop = null,
    final = false,
  }) {
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      vars: [
        { name: "j", value: j >= 0 ? j : "—" },
        { name: "value", value: value == null ? "—" : value },
        { name: "smaller", value: smaller == null ? "—" : smaller },
        { name: "stack_top", value: candidates.length ? candidates[candidates.length - 1].value : "—" },
        { name: "answer", value: answer },
      ],
      shadowPairs4054View: {
        phase,
        phaseIndex,
        operation,
        nums: [...nums],
        j,
        value,
        candidates: candidates.map((item) => ({ ...item })),
        smaller,
        answerBefore,
        answer,
        qualifying: qualifying.map((item) => ({ ...item })),
        popped: popped ? { ...popped } : null,
        shouldPop,
        final,
      },
    });
  }

  snapshot({
    phase: "init",
    phaseIndex: 0,
    operation: "init-stack",
    codeLine: 5,
    title: { vi: "Tạo stack ứng viên", en: "Create the candidate stack" },
    note: {
      vi: "Stack sẽ lưu các suffix-minimum của prefix đã duyệt theo thứ tự không giảm.",
      en: "The stack stores suffix minima of the processed prefix in nondecreasing order.",
    },
  });
  snapshot({
    phase: "init",
    phaseIndex: 0,
    operation: "init-answer",
    codeLine: 6,
    title: { vi: "Khởi tạo đáp án", en: "Initialize the answer" },
    note: { vi: "Chưa có cặp nào được đếm.", en: "No pair has been counted yet." },
  });

  for (let j = 0; j < nums.length; j += 1) {
    const value = nums[j];
    snapshot({
      phase: "scan",
      phaseIndex: 0,
      operation: "scan",
      codeLine: 7,
      j,
      value,
      title: { vi: `Xét j = ${j}, value = ${value}`, en: `Visit j = ${j}, value = ${value}` },
      note: {
        vi: `Dòng 7 lấy nums[${j}] làm đầu phải của các cặp đang xét.`,
        en: `Line 7 uses nums[${j}] as the right endpoint of the pairs being considered.`,
      },
    });

    const smaller = lowerBound(value);
    const qualifying = candidates.slice(0, smaller);
    snapshot({
      phase: "count",
      phaseIndex: 1,
      operation: "binary-search",
      codeLine: 8,
      j,
      value,
      smaller,
      qualifying,
      title: { vi: `Tìm ${smaller} ứng viên nhỏ hơn ${value}`, en: `Find ${smaller} candidates below ${value}` },
      note: {
        vi: `Dòng 8 dùng bisect_left: ${smaller} phần tử đầu stack nhỏ hơn ${value}.`,
        en: `Line 8 uses bisect_left: the first ${smaller} stack entries are smaller than ${value}.`,
      },
    });

    const answerBefore = answer;
    answer += smaller;
    snapshot({
      phase: "count",
      phaseIndex: 1,
      operation: "add-count",
      codeLine: 9,
      j,
      value,
      smaller,
      answerBefore,
      qualifying,
      title: { vi: `Cộng ${smaller} shadow pair`, en: `Add ${smaller} shadow pairs` },
      note: {
        vi: `Dòng 9 cập nhật answer: ${answerBefore} + ${smaller} = ${answer}.`,
        en: `Line 9 updates answer: ${answerBefore} + ${smaller} = ${answer}.`,
      },
    });

    let shouldPop = candidates.length > 0 && candidates[candidates.length - 1].value > value;
    snapshot({
      phase: "prune",
      phaseIndex: 2,
      operation: "check-pop",
      codeLine: 10,
      j,
      value,
      smaller,
      qualifying,
      shouldPop,
      title: {
        vi: shouldPop ? `Top > ${value}: cần pop` : `Top không lớn hơn ${value}`,
        en: shouldPop ? `Top > ${value}: pop required` : `Top is not greater than ${value}`,
      },
      note: {
        vi: shouldPop
          ? `Dòng 10 đúng vì ${candidates[candidates.length - 1].value} > ${value}.`
          : "Dòng 10 sai; stack đã sẵn sàng nhận phần tử mới.",
        en: shouldPop
          ? `Line 10 is true because ${candidates[candidates.length - 1].value} > ${value}.`
          : "Line 10 is false; the stack is ready for the new entry.",
      },
    });

    while (shouldPop) {
      const popped = candidates.pop();
      snapshot({
        phase: "prune",
        phaseIndex: 2,
        operation: "pop",
        codeLine: 11,
        j,
        value,
        smaller,
        qualifying,
        popped,
        title: { vi: `Loại (${popped.index}, ${popped.value})`, en: `Remove (${popped.index}, ${popped.value})` },
        note: {
          vi: `Dòng 11 loại chỉ số ${popped.index}: ${value} nhỏ hơn ${popped.value} nên ứng viên này bị che cho mọi đầu phải tương lai.`,
          en: `Line 11 removes index ${popped.index}: ${value} is smaller than ${popped.value}, so this candidate is shadowed for every future right endpoint.`,
        },
      });

      shouldPop = candidates.length > 0 && candidates[candidates.length - 1].value > value;
      snapshot({
        phase: "prune",
        phaseIndex: 2,
        operation: "check-pop",
        codeLine: 10,
        j,
        value,
        smaller,
        qualifying,
        shouldPop,
        title: {
          vi: shouldPop ? `Top vẫn > ${value}` : "Kết thúc vòng while",
          en: shouldPop ? `Top is still > ${value}` : "Finish the while loop",
        },
        note: {
          vi: shouldPop
            ? `Top mới ${candidates[candidates.length - 1].value} vẫn lớn hơn ${value}.`
            : "Dòng 10 sai sau khi kiểm tra lại.",
          en: shouldPop
            ? `The new top ${candidates[candidates.length - 1].value} is still greater than ${value}.`
            : "Line 10 is false after checking again.",
        },
      });
    }

    candidates.push({ index: j, value });
    snapshot({
      phase: "push",
      phaseIndex: 3,
      operation: "push",
      codeLine: 12,
      j,
      value,
      smaller,
      qualifying,
      title: { vi: `Đẩy (${j}, ${value}) vào stack`, en: `Push (${j}, ${value}) onto the stack` },
      note: {
        vi: `Dòng 12 thêm chỉ số ${j}; stack vẫn không giảm theo value.`,
        en: `Line 12 adds index ${j}; the stack remains nondecreasing by value.`,
      },
    });
  }

  snapshot({
    phase: "done",
    phaseIndex: 4,
    operation: "return",
    codeLine: 13,
    title: { vi: `Trả về ${answer}`, en: `Return ${answer}` },
    note: {
      vi: "Mỗi cặp hợp lệ được đếm đúng lúc đầu phải j được duyệt.",
      en: "Every valid pair is counted exactly when its right endpoint j is visited.",
    },
    final: true,
  });

  return { original: [...nums], answer, steps };
}

Object.assign(module.exports, {
  4054: {
    id: 4054,
    difficulty: "medium",
    slug: "count-shadow-pairs-i",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "monotonic-stack", vi: "Stack đơn điệu", en: "Monotonic Stack" },
      { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
      { key: "array", vi: "Mảng", en: "Array" },
    ],
    title: { vi: "Count Shadow Pairs I", en: "Count Shadow Pairs I" },
    titleVi: { vi: "Đếm cặp bóng I", en: "Count shadow pairs I" },
    statement: {
      vi: "Một cặp (i,j), i < j, là shadow pair khi nums[i] < nums[j] và không có k nằm giữa sao cho nums[k] < nums[i]. Hãy trả về tổng số cặp.",
      en: "A pair (i,j), i < j, is a shadow pair when nums[i] < nums[j] and no index k between them has nums[k] < nums[i]. Return the total number of such pairs.",
    },
    defaultInput: [3, 1, 4, 1, 5],
    inputKind: "array",
    inputLabel: { vi: "nums", en: "nums" },
    approach: [
      { vi: "Duyệt j từ trái sang phải; stack lưu các chỉ số i chưa bị một giá trị nhỏ hơn ở bên phải che khuất.", en: "Sweep j from left to right; the stack stores indices i not shadowed by a smaller value to their right." },
      { vi: "Value trong stack không giảm. bisect_left(stack, nums[j]) cho đúng số ứng viên có nums[i] < nums[j].", en: "Stack values are nondecreasing. bisect_left(stack, nums[j]) is exactly the number of candidates with nums[i] < nums[j]." },
      { vi: "Pop mọi value lớn hơn nums[j], giữ lại value bằng nhau, rồi push nums[j].", en: "Pop every value greater than nums[j], keep equal values, then push nums[j]." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Mỗi phần tử được push/pop tối đa một lần; mỗi j thực hiện một bisect_left.",
        en: "Each element is pushed and popped at most once; every j performs one bisect_left.",
      },
    },
    debugMode: "semantic",
    code: [
      "from bisect import bisect_left",
      "",
      "class Solution:",
      "    def shadowPairs(self, nums):",
      "        stack = []",
      "        answer = 0",
      "        for j, value in enumerate(nums):",
      "            smaller = bisect_left(stack, value)",
      "            answer += smaller",
      "            while stack and stack[-1] > value:",
      "                stack.pop()",
      "            stack.append(value)",
      "        return answer",
    ],
    liveArgs: (input) => [validateShadowPairs4054Input(input)],
    builder: buildSteps4054,
  },
});

function validateShadowPairs4055Input(nums) {
  if (!Array.isArray(nums) || nums.length < 3) {
    throw new Error("nums must contain at least 3 integers.");
  }
  if (nums.length > 16) {
    throw new Error("Use at most 16 values so the divide-and-conquer visualization stays readable.");
  }
  if (!nums.every((value) => Number.isInteger(value) && value >= 1 && value <= 1_000_000_000)) {
    throw new Error("nums must contain integers from 1 to 1,000,000,000.");
  }
  return [...nums];
}

function buildSteps4055(input) {
  const nums = validateShadowPairs4055Input(input);
  const steps = [];

  function snapshot({
    phase,
    phaseIndex,
    operation,
    codeLine,
    title,
    note,
    left,
    middle,
    right,
    depth,
    leftAnswer = 0,
    rightAnswer = 0,
    crossAnswer = 0,
    subtotal = 0,
    upper = [],
    lower = [],
    currentRight = null,
    active = [],
    qualifying = [],
    rejected = [],
    final = false,
  }) {
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      vars: [
        { name: "left", value: left },
        { name: "middle", value: middle == null ? "—" : middle },
        { name: "right", value: right },
        { name: "cross", value: crossAnswer },
        { name: "answer", value: subtotal },
      ],
      shadowPairs4055View: {
        phase,
        phaseIndex,
        operation,
        nums: [...nums],
        left,
        middle,
        right,
        depth,
        leftAnswer,
        rightAnswer,
        crossAnswer,
        subtotal,
        upper: upper.map((item) => ({ ...item })),
        lower: lower.map((item) => ({ ...item })),
        currentRight: currentRight ? { ...currentRight } : null,
        active: active.map((item) => ({ ...item })),
        qualifying: qualifying.map((item) => ({ ...item })),
        rejected: rejected.map((item) => ({ ...item })),
        final,
      },
    });
  }

  function solve(left, right, depth) {
    if (left >= right) {
      snapshot({
        phase: "split",
        phaseIndex: 0,
        operation: "base-check",
        codeLine: 37,
        title: { vi: `Đoạn [${left}, ${right}] là base case`, en: `Segment [${left}, ${right}] is a base case` },
        note: { vi: "Một phần tử không thể tạo cặp.", en: "One element cannot form a pair." },
        left,
        right,
        depth,
      });
      snapshot({
        phase: "split",
        phaseIndex: 0,
        operation: "base-return",
        codeLine: 38,
        title: { vi: "Trả về 0", en: "Return 0" },
        note: { vi: "Không có cặp nội bộ trong đoạn này.", en: "There is no internal pair in this segment." },
        left,
        right,
        depth,
      });
      return 0;
    }

    const middle = Math.floor((left + right) / 2);
    snapshot({
      phase: "split",
      phaseIndex: 0,
      operation: "split",
      codeLine: 40,
      title: { vi: `Chia [${left}, ${right}] tại ${middle}`, en: `Split [${left}, ${right}] at ${middle}` },
      note: {
        vi: `Nửa trái [${left}, ${middle}], nửa phải [${middle + 1}, ${right}].`,
        en: `Left half [${left}, ${middle}], right half [${middle + 1}, ${right}].`,
      },
      left,
      middle,
      right,
      depth,
    });

    const leftAnswer = solve(left, middle, depth + 1);
    const rightAnswer = solve(middle + 1, right, depth + 1);
    let answer = leftAnswer + rightAnswer;
    snapshot({
      phase: "combine",
      phaseIndex: 3,
      operation: "combine-halves",
      codeLine: 41,
      title: { vi: `Hai nửa có ${answer} cặp`, en: `The two halves contain ${answer} pairs` },
      note: {
        vi: `Cộng ${leftAnswer} cặp bên trái và ${rightAnswer} cặp bên phải trước khi đếm cặp băng qua middle.`,
        en: `Add ${leftAnswer} left-half pairs and ${rightAnswer} right-half pairs before counting pairs crossing middle.`,
      },
      left,
      middle,
      right,
      depth,
      leftAnswer,
      rightAnswer,
      subtotal: answer,
    });

    const upper = [];
    for (let i = middle; i >= left; i -= 1) {
      let bound = Infinity;
      for (let k = i + 1; k <= middle; k += 1) {
        if (nums[k] > nums[i]) bound = Math.min(bound, nums[k]);
      }
      upper.unshift({ index: i, value: nums[i], bound });
      snapshot({
        phase: "bounds",
        phaseIndex: 1,
        operation: "upper-bound",
        codeLine: 51,
        title: { vi: `Tính b[${i}]`, en: `Compute b[${i}]` },
        note: {
          vi: `Giá trị nhỏ nhất lớn hơn ${nums[i]} ở bên phải i trong nửa trái là ${Number.isFinite(bound) ? bound : "+∞"}.`,
          en: `The smallest value greater than ${nums[i]} after i inside the left half is ${Number.isFinite(bound) ? bound : "+∞"}.`,
        },
        left,
        middle,
        right,
        depth,
        leftAnswer,
        rightAnswer,
        subtotal: answer,
        upper,
      });
    }

    const lower = [];
    for (let j = middle + 1; j <= right; j += 1) {
      let bound = -Infinity;
      for (let k = middle + 1; k < j; k += 1) {
        if (nums[k] < nums[j]) bound = Math.max(bound, nums[k]);
      }
      lower.push({ index: j, value: nums[j], bound });
      snapshot({
        phase: "bounds",
        phaseIndex: 1,
        operation: "lower-bound",
        codeLine: 64,
        title: { vi: `Tính c[${j}]`, en: `Compute c[${j}]` },
        note: {
          vi: `Giá trị lớn nhất nhỏ hơn ${nums[j]} trước j trong nửa phải là ${Number.isFinite(bound) ? bound : "−∞"}.`,
          en: `The largest value smaller than ${nums[j]} before j inside the right half is ${Number.isFinite(bound) ? bound : "−∞"}.`,
        },
        left,
        middle,
        right,
        depth,
        leftAnswer,
        rightAnswer,
        subtotal: answer,
        upper,
        lower,
      });
    }

    const rightByValue = [...lower].sort((a, b) => a.value - b.value || a.index - b.index);
    snapshot({
      phase: "sweep",
      phaseIndex: 2,
      operation: "sort-right",
      codeLine: 73,
      title: { vi: "Sắp xếp đầu phải theo value", en: "Sort right endpoints by value" },
      note: {
        vi: "Sweep tăng dần nums[j] để kích hoạt và hết hạn các đầu trái trong Fenwick tree.",
        en: "Sweep nums[j] upward so left endpoints can be activated and expired in the Fenwick tree.",
      },
      left,
      middle,
      right,
      depth,
      leftAnswer,
      rightAnswer,
      subtotal: answer,
      upper,
      lower,
    });

    let crossAnswer = 0;
    for (const currentRight of rightByValue) {
      snapshot({
        phase: "sweep",
        phaseIndex: 2,
        operation: "select-right",
        codeLine: 77,
        title: { vi: `Xét đầu phải j=${currentRight.index}`, en: `Process right endpoint j=${currentRight.index}` },
        note: {
          vi: `nums[j]=${currentRight.value}, c[j]=${Number.isFinite(currentRight.bound) ? currentRight.bound : "−∞"}.`,
          en: `nums[j]=${currentRight.value}, c[j]=${Number.isFinite(currentRight.bound) ? currentRight.bound : "−∞"}.`,
        },
        left,
        middle,
        right,
        depth,
        leftAnswer,
        rightAnswer,
        crossAnswer,
        subtotal: answer,
        upper,
        lower,
        currentRight,
      });

      const active = upper.filter((item) => item.value < currentRight.value && currentRight.value <= item.bound);
      snapshot({
        phase: "sweep",
        phaseIndex: 2,
        operation: "active-window",
        codeLine: 83,
        title: { vi: `${active.length} đầu trái còn hoạt động`, en: `${active.length} left endpoints are active` },
        note: {
          vi: "Điều kiện nums[i] < nums[j] ≤ b[i] loại blocker nằm trong nửa trái.",
          en: "The condition nums[i] < nums[j] <= b[i] excludes blockers inside the left half.",
        },
        left,
        middle,
        right,
        depth,
        leftAnswer,
        rightAnswer,
        crossAnswer,
        subtotal: answer,
        upper,
        lower,
        currentRight,
        active,
      });

      const qualifying = active.filter((item) => currentRight.bound <= item.value);
      const rejected = active.filter((item) => currentRight.bound > item.value);
      snapshot({
        phase: "sweep",
        phaseIndex: 2,
        operation: "query-lower",
        codeLine: 89,
        title: { vi: `Fenwick giữ ${qualifying.length} đầu trái`, en: `Fenwick keeps ${qualifying.length} left endpoints` },
        note: {
          vi: `Lọc thêm c[j] ≤ nums[i]; ${rejected.length} ứng viên bị blocker trong nửa phải loại.`,
          en: `Also require c[j] <= nums[i]; ${rejected.length} candidates are rejected by a blocker in the right half.`,
        },
        left,
        middle,
        right,
        depth,
        leftAnswer,
        rightAnswer,
        crossAnswer,
        subtotal: answer,
        upper,
        lower,
        currentRight,
        active,
        qualifying,
        rejected,
      });

      crossAnswer += qualifying.length;
      answer += qualifying.length;
      snapshot({
        phase: "sweep",
        phaseIndex: 2,
        operation: "add-cross",
        codeLine: 90,
        title: { vi: `Cộng ${qualifying.length} cặp băng qua`, en: `Add ${qualifying.length} crossing pairs` },
        note: {
          vi: `Các cặp thỏa c[j] ≤ nums[i] < nums[j] ≤ b[i]. Subtotal = ${answer}.`,
          en: `These pairs satisfy c[j] <= nums[i] < nums[j] <= b[i]. Subtotal = ${answer}.`,
        },
        left,
        middle,
        right,
        depth,
        leftAnswer,
        rightAnswer,
        crossAnswer,
        subtotal: answer,
        upper,
        lower,
        currentRight,
        active,
        qualifying,
        rejected,
      });
    }

    snapshot({
      phase: "combine",
      phaseIndex: 3,
      operation: "return-segment",
      codeLine: 92,
      title: { vi: `Đoạn [${left}, ${right}] trả về ${answer}`, en: `Segment [${left}, ${right}] returns ${answer}` },
      note: {
        vi: `${leftAnswer} trái + ${rightAnswer} phải + ${crossAnswer} băng qua = ${answer}.`,
        en: `${leftAnswer} left + ${rightAnswer} right + ${crossAnswer} crossing = ${answer}.`,
      },
      left,
      middle,
      right,
      depth,
      leftAnswer,
      rightAnswer,
      crossAnswer,
      subtotal: answer,
      upper,
      lower,
    });
    return answer;
  }

  const answer = solve(0, nums.length - 1, 0);
  snapshot({
    phase: "done",
    phaseIndex: 4,
    operation: "return-final",
    codeLine: 94,
    title: { vi: `Trả về ${answer}`, en: `Return ${answer}` },
    note: {
      vi: "Divide-and-conquer đã đếm các cặp trong mỗi nửa và mọi cặp băng qua đúng một lần.",
      en: "Divide and conquer counted pairs inside each half and every crossing pair exactly once.",
    },
    left: 0,
    middle: Math.floor((nums.length - 1) / 2),
    right: nums.length - 1,
    depth: 0,
    subtotal: answer,
    final: true,
  });

  return { original: [...nums], answer, steps };
}

Object.assign(module.exports, {
  4055: {
    id: 4055,
    difficulty: "hard",
    slug: "count-shadow-pairs-ii",
    category: { key: "divide-and-conquer", vi: "Chia để trị", en: "Divide and Conquer" },
    tags: [
      { key: "divide-and-conquer", vi: "Chia để trị", en: "Divide and Conquer" },
      { key: "fenwick-tree", vi: "Fenwick Tree", en: "Fenwick Tree" },
      { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "array", vi: "Mảng", en: "Array" },
    ],
    title: { vi: "Count Shadow Pairs II", en: "Count Shadow Pairs II" },
    titleVi: { vi: "Đếm cặp bóng II", en: "Count shadow pairs II" },
    statement: {
      vi: "Cặp (i,j), i < j, là shadow pair khi nums[i] < nums[j] và không có k nằm giữa sao cho nums[i] < nums[k] < nums[j]. Trả về tổng số cặp.",
      en: "A pair (i,j), i < j, is a shadow pair when nums[i] < nums[j] and no index k between them satisfies nums[i] < nums[k] < nums[j]. Return the total number of pairs.",
    },
    defaultInput: [3, 1, 4, 2, 5],
    inputKind: "array",
    inputLabel: { vi: "nums", en: "nums" },
    approach: [
      { vi: "Chia mảng theo chỉ số và đệ quy đếm cặp nằm hoàn toàn trong mỗi nửa.", en: "Split by index and recursively count pairs entirely inside each half." },
      { vi: "Với đầu trái i, b[i] là successor nhỏ nhất ở phía sau trong nửa trái; với đầu phải j, c[j] là predecessor lớn nhất phía trước trong nửa phải.", en: "For left endpoint i, b[i] is the smallest greater successor inside the left half; for right endpoint j, c[j] is the largest smaller predecessor inside the right half." },
      { vi: "Cặp băng qua hợp lệ đúng khi c[j] ≤ nums[i] < nums[j] ≤ b[i]; sweep theo nums[j] và Fenwick tree đếm nums[i] trong khoảng.", en: "A crossing pair is valid exactly when c[j] <= nums[i] < nums[j] <= b[i]; sweep by nums[j] and use a Fenwick tree for the value-range count." },
    ],
    complexity: {
      time: "O(n log² n)",
      space: "O(n)",
      note: {
        vi: "Có O(log n) tầng chia để trị; mỗi tầng thực hiện sắp xếp và các thao tác Fenwick O(n log n).",
        en: "There are O(log n) divide-and-conquer levels; each level performs sorting and O(n log n) Fenwick work.",
      },
    },
    debugMode: "semantic",
    code: [
      "from bisect import bisect_left",
      "from typing import List",
      "",
      "",
      "class Fenwick:",
      "    def __init__(self, size: int) -> None:",
      "        self.tree = [0] * (size + 1)",
      "",
      "    def add(self, index: int, delta: int) -> None:",
      "        while index < len(self.tree):",
      "            self.tree[index] += delta",
      "            index += index & -index",
      "",
      "    def prefix_sum(self, length: int) -> int:",
      "        total = 0",
      "        while length:",
      "            total += self.tree[length]",
      "            length -= length & -length",
      "        return total",
      "",
      "    def kth(self, order: int) -> int:",
      "        index = 0",
      "        size = len(self.tree) - 1",
      "        step = 1 << (size.bit_length() - 1)",
      "        while step:",
      "            next_index = index + step",
      "            if next_index < len(self.tree) and self.tree[next_index] < order:",
      "                index = next_index",
      "                order -= self.tree[next_index]",
      "            step >>= 1",
      "        return index + 1",
      "",
      "",
      "class Solution:",
      "    def shadowPairs(self, nums: List[int]) -> int:",
      "        def solve(left: int, right: int) -> int:",
      "            if left >= right:",
      "                return 0",
      "",
      "            middle = (left + right) // 2",
      "            answer = solve(left, middle) + solve(middle + 1, right)",
      "            values = sorted(set(nums[left : right + 1]))",
      "            ranks = {value: index + 1 for index, value in enumerate(values)}",
      "",
      "            upper = {}",
      "            bit = Fenwick(len(values))",
      "            inserted = 0",
      "            for i in range(middle, left - 1, -1):",
      "                rank = ranks[nums[i]]",
      "                not_greater = bit.prefix_sum(rank)",
      "                upper[i] = (",
      "                    values[bit.kth(not_greater + 1) - 1]",
      "                    if not_greater < inserted",
      "                    else float(\"inf\")",
      "                )",
      "                bit.add(rank, 1)",
      "                inserted += 1",
      "",
      "            lower = {}",
      "            bit = Fenwick(len(values))",
      "            for j in range(middle + 1, right + 1):",
      "                rank = ranks[nums[j]]",
      "                smaller = bit.prefix_sum(rank - 1)",
      "                lower[j] = (",
      "                    values[bit.kth(smaller) - 1]",
      "                    if smaller",
      "                    else float(\"-inf\")",
      "                )",
      "                bit.add(rank, 1)",
      "",
      "            left_indices = sorted(range(left, middle + 1), key=lambda i: nums[i])",
      "            expiring = sorted(left_indices, key=lambda i: upper[i])",
      "            right_indices = sorted(range(middle + 1, right + 1), key=lambda j: nums[j])",
      "",
      "            bit = Fenwick(len(values))",
      "            activated = expired = active = 0",
      "            for j in right_indices:",
      "                while activated < len(left_indices) and nums[left_indices[activated]] < nums[j]:",
      "                    i = left_indices[activated]",
      "                    bit.add(ranks[nums[i]], 1)",
      "                    active += 1",
      "                    activated += 1",
      "                while expired < len(expiring) and upper[expiring[expired]] < nums[j]:",
      "                    i = expiring[expired]",
      "                    bit.add(ranks[nums[i]], -1)",
      "                    active -= 1",
      "                    expired += 1",
      "",
      "                below_lower = bit.prefix_sum(bisect_left(values, lower[j]))",
      "                answer += active - below_lower",
      "",
      "            return answer",
      "",
      "        return solve(0, len(nums) - 1)",
    ],
    liveArgs: (input) => [validateShadowPairs4055Input(input)],
    builder: buildSteps4055,
  },
});
