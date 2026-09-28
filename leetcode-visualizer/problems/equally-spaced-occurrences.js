// Focused array problem definitions extracted from array.js.
module.exports = {};


function validateEquallySpaced4048Input(nums) {
  if (!Array.isArray(nums) || nums.length < 3) {
    throw new Error("nums must contain at least 3 integers.");
  }
  if (nums.length > 24) {
    throw new Error("Use at most 24 values so the line-by-line visualization stays readable.");
  }
  if (!nums.every((value) => Number.isInteger(value) && value >= 1 && value <= 100)) {
    throw new Error("nums must contain integers from 1 to 100.");
  }
  return [...nums];
}

function buildSteps4048(input) {
  const nums = validateEquallySpaced4048Input(input);
  const positions = new Map();
  const statuses = new Map();
  const steps = [];
  let answer = 0;
  let collectedCount = 0;

  function snapshot({
    operation,
    phaseIndex,
    codeLine,
    title,
    note,
    currentIndex = -1,
    currentValue = null,
    activeValue = null,
    activeIndices = [],
    gapLeft = null,
    gapRight = null,
    countOk = null,
    equalGaps = null,
    answerBefore = answer,
    final = false,
  }) {
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      vars: [
        { name: "index", value: currentIndex >= 0 ? currentIndex : "—" },
        { name: "value", value: currentValue == null ? (activeValue ?? "—") : currentValue },
        { name: "indices", value: activeIndices.length ? `[${activeIndices.join(", ")}]` : "[]" },
        { name: "gap_left", value: gapLeft ?? "—" },
        { name: "gap_right", value: gapRight ?? "—" },
        { name: "answer", value: answer },
      ],
      equallySpaced4048View: {
        operation,
        phaseIndex,
        nums: [...nums],
        collectedCount,
        currentIndex,
        currentValue,
        activeValue,
        activeIndices: [...activeIndices],
        gapLeft,
        gapRight,
        countOk,
        equalGaps,
        answerBefore,
        answer,
        groups: [...positions.entries()].map(([value, indices]) => ({
          value,
          indices: [...indices],
          status: statuses.get(value) || "pending",
        })),
        final,
      },
    });
  }

  snapshot({
    operation: "init-map",
    phaseIndex: 0,
    codeLine: 6,
    title: { vi: "Tạo bảng vị trí", en: "Create the position map" },
    note: {
      vi: "Mỗi value sẽ ánh xạ tới danh sách index xuất hiện theo thứ tự tăng dần.",
      en: "Each value maps to its occurrence indices in increasing order.",
    },
  });

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    snapshot({
      operation: "scan",
      phaseIndex: 0,
      codeLine: 7,
      currentIndex: index,
      currentValue: value,
      title: { vi: `Đọc nums[${index}] = ${value}`, en: `Read nums[${index}] = ${value}` },
      note: {
        vi: `Dòng 7 chọn cặp (index, value) = (${index}, ${value}).`,
        en: `Line 7 selects (index, value) = (${index}, ${value}).`,
      },
    });

    if (!positions.has(value)) positions.set(value, []);
    positions.get(value).push(index);
    statuses.set(value, "pending");
    collectedCount = index + 1;
    snapshot({
      operation: "append",
      phaseIndex: 0,
      codeLine: 8,
      currentIndex: index,
      currentValue: value,
      activeValue: value,
      activeIndices: positions.get(value),
      title: { vi: `Thêm index ${index} cho value ${value}`, en: `Append index ${index} for value ${value}` },
      note: {
        vi: `positions[${value}] = [${positions.get(value).join(", ")}].`,
        en: `positions[${value}] = [${positions.get(value).join(", ")}].`,
      },
    });
  }

  snapshot({
    operation: "init-answer",
    phaseIndex: 1,
    codeLine: 10,
    title: { vi: "Khởi tạo đáp án", en: "Initialize the answer" },
    note: { vi: "Bắt đầu kiểm tra từng value riêng biệt.", en: "Begin checking each distinct value." },
  });

  for (const [value, indices] of positions.entries()) {
    statuses.set(value, "active");
    snapshot({
      operation: "group",
      phaseIndex: 1,
      codeLine: 11,
      activeValue: value,
      activeIndices: indices,
      title: { vi: `Xét value ${value}`, en: `Inspect value ${value}` },
      note: {
        vi: `${value} xuất hiện tại [${indices.join(", ")}]. Trước tiên cần đúng ba lần xuất hiện.`,
        en: `${value} appears at [${indices.join(", ")}]. It must first have exactly three occurrences.`,
      },
    });

    const countOk = indices.length === 3;
    const gapLeft = countOk ? indices[1] - indices[0] : null;
    const gapRight = countOk ? indices[2] - indices[1] : null;
    const equalGaps = countOk ? gapLeft === gapRight : false;
    const special = countOk && equalGaps;
    statuses.set(value, special ? "special-ready" : countOk ? "unequal" : "wrong-count");
    snapshot({
      operation: "check",
      phaseIndex: countOk ? 2 : 1,
      codeLine: 12,
      activeValue: value,
      activeIndices: indices,
      gapLeft,
      gapRight,
      countOk,
      equalGaps,
      title: {
        vi: !countOk ? `${value}: có ${indices.length} lần, không phải 3` : `${value}: khoảng cách ${gapLeft} và ${gapRight}`,
        en: !countOk ? `${value}: ${indices.length} occurrences, not 3` : `${value}: gaps ${gapLeft} and ${gapRight}`,
      },
      note: {
        vi: !countOk
          ? "Điều kiện dừng ngay ở len(indices) == 3."
          : special
            ? `${gapLeft} = ${gapRight}, nên ba lần xuất hiện cách đều.`
            : `${gapLeft} ≠ ${gapRight}, nên ba lần xuất hiện không cách đều.`,
        en: !countOk
          ? "The condition stops at len(indices) == 3."
          : special
            ? `${gapLeft} = ${gapRight}, so the three occurrences are equally spaced.`
            : `${gapLeft} != ${gapRight}, so the three occurrences are not equally spaced.`,
      },
    });

    if (special) {
      const answerBefore = answer;
      answer += 1;
      statuses.set(value, "special");
      snapshot({
        operation: "count",
        phaseIndex: 3,
        codeLine: 13,
        activeValue: value,
        activeIndices: indices,
        gapLeft,
        gapRight,
        countOk,
        equalGaps,
        answerBefore,
        title: { vi: `Đếm value ${value}`, en: `Count value ${value}` },
        note: {
          vi: `answer = ${answerBefore} + 1 = ${answer}.`,
          en: `answer = ${answerBefore} + 1 = ${answer}.`,
        },
      });
    }
  }

  snapshot({
    operation: "return",
    phaseIndex: 4,
    codeLine: 14,
    title: { vi: `Trả về ${answer}`, en: `Return ${answer}` },
    note: {
      vi: "Mỗi value đặc biệt được đếm đúng một lần sau khi kiểm tra nhóm index của nó.",
      en: "Each special value is counted once after its index group is checked.",
    },
    final: true,
  });

  return { original: [...nums], answer, steps };
}

Object.assign(module.exports, {
  4048: {
    id: 4048,
    difficulty: "easy",
    slug: "count-values-with-equally-spaced-occurrences-i",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "hash-map", vi: "Hash Map", en: "Hash Map" },
      { key: "counting", vi: "Đếm", en: "Counting" },
    ],
    title: { vi: "Count Values With Equally Spaced Occurrences I", en: "Count Values With Equally Spaced Occurrences I" },
    titleVi: { vi: "Đếm giá trị xuất hiện cách đều I", en: "Count values with equally spaced occurrences I" },
    statement: {
      vi: "Một số nguyên là special nếu xuất hiện đúng ba lần và khoảng cách giữa hai cặp index liên tiếp bằng nhau. Trả về số lượng giá trị special phân biệt.",
      en: "An integer is special if it appears exactly three times and the two consecutive index gaps are equal. Return the number of distinct special integers.",
    },
    defaultInput: [1, 8, 1, 5, 1, 5, 8, 5],
    inputKind: "array",
    inputLabel: { vi: "nums", en: "nums" },
    approach: [
      { vi: "Duyệt nums một lần và gom toàn bộ index theo value trong hash map.", en: "Scan nums once and group all occurrence indices by value in a hash map." },
      { vi: "Một value chỉ có thể special khi danh sách index có đúng ba phần tử.", en: "A value can be special only when its index list has exactly three entries." },
      { vi: "Với [i₁, i₂, i₃], kiểm tra i₂ − i₁ = i₃ − i₂ rồi tăng answer.", en: "For [i1, i2, i3], check i2 - i1 = i3 - i2, then increment the answer." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Mỗi index được thêm vào đúng một nhóm và mỗi nhóm được kiểm tra một lần.",
        en: "Each index is added to one group and every group is checked once.",
      },
    },
    debugMode: "semantic",
    code: [
      "from collections import defaultdict",
      "from typing import List",
      "",
      "class Solution:",
      "    def countSpecialIntegers(self, nums: List[int]) -> int:",
      "        positions = defaultdict(list)",
      "        for index, value in enumerate(nums):",
      "            positions[value].append(index)",
      "",
      "        answer = 0",
      "        for value, indices in positions.items():",
      "            if len(indices) == 3 and indices[1] - indices[0] == indices[2] - indices[1]:",
      "                answer += 1",
      "        return answer",
    ],
    liveArgs: (input) => [validateEquallySpaced4048Input(input)],
    builder: buildSteps4048,
  },
});

function validateEquallySpaced4049Input(nums) {
  if (!Array.isArray(nums) || nums.length < 3) {
    throw new Error("nums must contain at least 3 integers.");
  }
  if (nums.length > 30) {
    throw new Error("Use at most 30 values so the line-by-line visualization stays readable.");
  }
  if (!nums.every((value) => Number.isInteger(value) && value >= 1 && value <= 1_000_000_000)) {
    throw new Error("nums must contain integers from 1 to 1,000,000,000.");
  }
  return [...nums];
}

function buildSteps4049(input) {
  const nums = validateEquallySpaced4049Input(input);
  const positions = new Map();
  const statuses = new Map();
  const steps = [];
  let answer = 0;
  let collectedCount = 0;

  function snapshot({
    operation,
    phaseIndex,
    codeLine,
    title,
    note,
    currentIndex = -1,
    currentValue = null,
    activeValue = null,
    activeIndices = [],
    expectedGap = null,
    actualGap = null,
    currentGapOrdinal = null,
    checkedGapCount = 0,
    mismatchGapOrdinal = null,
    countOk = null,
    equallySpaced = null,
    answerBefore = answer,
    final = false,
  }) {
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      vars: [
        { name: "value", value: currentValue == null ? (activeValue ?? "—") : currentValue },
        { name: "indices", value: activeIndices.length ? `[${activeIndices.join(", ")}]` : "[]" },
        { name: "gap", value: expectedGap ?? "—" },
        { name: "current_gap", value: actualGap ?? "—" },
        { name: "equally_spaced", value: equallySpaced == null ? "—" : equallySpaced },
        { name: "answer", value: answer },
      ],
      equallySpaced4049View: {
        operation,
        phaseIndex,
        nums: [...nums],
        collectedCount,
        currentIndex,
        currentValue,
        activeValue,
        activeIndices: [...activeIndices],
        expectedGap,
        actualGap,
        currentGapOrdinal,
        checkedGapCount,
        mismatchGapOrdinal,
        countOk,
        equallySpaced,
        answerBefore,
        answer,
        groups: [...positions.entries()].map(([value, indices]) => ({
          value,
          indices: [...indices],
          status: statuses.get(value) || "pending",
        })),
        final,
      },
    });
  }

  snapshot({
    operation: "init-map",
    phaseIndex: 0,
    codeLine: 6,
    title: { vi: "Tạo bảng vị trí", en: "Create the position map" },
    note: {
      vi: "Gom mọi index theo value; mỗi danh sách tự tăng dần vì nums được quét từ trái sang phải.",
      en: "Group every index by value; each list is naturally increasing because nums is scanned left to right.",
    },
  });

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    snapshot({
      operation: "scan",
      phaseIndex: 0,
      codeLine: 7,
      currentIndex: index,
      currentValue: value,
      title: { vi: `Đọc nums[${index}] = ${value}`, en: `Read nums[${index}] = ${value}` },
      note: { vi: `Chọn occurrence tại index ${index}.`, en: `Select the occurrence at index ${index}.` },
    });

    if (!positions.has(value)) positions.set(value, []);
    positions.get(value).push(index);
    statuses.set(value, "pending");
    collectedCount = index + 1;
    snapshot({
      operation: "append",
      phaseIndex: 0,
      codeLine: 8,
      currentIndex: index,
      currentValue: value,
      activeValue: value,
      activeIndices: positions.get(value),
      title: { vi: `Thêm index ${index} cho value ${value}`, en: `Append index ${index} for value ${value}` },
      note: { vi: `positions[${value}] = [${positions.get(value).join(", ")}].`, en: `positions[${value}] = [${positions.get(value).join(", ")}].` },
    });
  }

  snapshot({
    operation: "init-answer",
    phaseIndex: 1,
    codeLine: 10,
    title: { vi: "Khởi tạo đáp án", en: "Initialize the answer" },
    note: { vi: "Bắt đầu kiểm tra từng nhóm index.", en: "Begin checking each index group." },
  });

  for (const [value, indices] of positions.entries()) {
    statuses.set(value, "active");
    snapshot({
      operation: "group",
      phaseIndex: 1,
      codeLine: 11,
      activeValue: value,
      activeIndices: indices,
      title: { vi: `Xét value ${value}`, en: `Inspect value ${value}` },
      note: { vi: `${value} xuất hiện tại [${indices.join(", ")}].`, en: `${value} appears at [${indices.join(", ")}].` },
    });

    const countOk = indices.length >= 3;
    statuses.set(value, countOk ? "enough" : "too-few");
    snapshot({
      operation: "size-check",
      phaseIndex: 1,
      codeLine: 12,
      activeValue: value,
      activeIndices: indices,
      countOk,
      title: {
        vi: countOk ? `${value}: có ${indices.length} occurrences` : `${value}: chỉ có ${indices.length} occurrences`,
        en: countOk ? `${value}: ${indices.length} occurrences` : `${value}: only ${indices.length} occurrences`,
      },
      note: countOk
        ? { vi: "Có ít nhất ba occurrence, tiếp tục kiểm tra khoảng cách.", en: "There are at least three occurrences, so continue to the gap checks." }
        : { vi: "Ít hơn ba occurrence nên value này không thể special.", en: "Fewer than three occurrences means this value cannot be special." },
    });

    if (!countOk) {
      snapshot({
        operation: "continue",
        phaseIndex: 1,
        codeLine: 13,
        activeValue: value,
        activeIndices: indices,
        countOk,
        title: { vi: `Bỏ qua value ${value}`, en: `Skip value ${value}` },
        note: { vi: "Chuyển thẳng sang nhóm tiếp theo.", en: "Continue directly to the next group." },
      });
      continue;
    }

    const expectedGap = indices[1] - indices[0];
    let checkedGapCount = 1;
    statuses.set(value, "checking");
    snapshot({
      operation: "set-gap",
      phaseIndex: 2,
      codeLine: 14,
      activeValue: value,
      activeIndices: indices,
      expectedGap,
      checkedGapCount,
      countOk,
      title: { vi: `Đặt gap chuẩn = ${expectedGap}`, en: `Set the reference gap to ${expectedGap}` },
      note: { vi: `${indices[1]} − ${indices[0]} = ${expectedGap}; mọi gap sau phải bằng số này.`, en: `${indices[1]} - ${indices[0]} = ${expectedGap}; every later gap must match it.` },
    });

    let equallySpaced = true;
    snapshot({
      operation: "init-flag",
      phaseIndex: 3,
      codeLine: 15,
      activeValue: value,
      activeIndices: indices,
      expectedGap,
      checkedGapCount,
      countOk,
      equallySpaced,
      title: { vi: "Giả sử các gap bằng nhau", en: "Assume the gaps are equal" },
      note: { vi: "Cờ chỉ đổi thành False khi gặp một gap khác gap chuẩn.", en: "The flag changes to False only when a gap differs from the reference." },
    });

    let mismatchGapOrdinal = null;
    for (let i = 2; i < indices.length; i += 1) {
      const actualGap = indices[i] - indices[i - 1];
      snapshot({
        operation: "gap-loop",
        phaseIndex: 3,
        codeLine: 16,
        activeValue: value,
        activeIndices: indices,
        expectedGap,
        actualGap,
        currentGapOrdinal: i,
        checkedGapCount,
        countOk,
        equallySpaced,
        title: { vi: `Xét gap thứ ${i}`, en: `Inspect gap ${i}` },
        note: { vi: `${indices[i]} − ${indices[i - 1]} = ${actualGap}.`, en: `${indices[i]} - ${indices[i - 1]} = ${actualGap}.` },
      });

      const matches = actualGap === expectedGap;
      if (matches) checkedGapCount = i;
      else mismatchGapOrdinal = i;
      snapshot({
        operation: "gap-check",
        phaseIndex: 3,
        codeLine: 17,
        activeValue: value,
        activeIndices: indices,
        expectedGap,
        actualGap,
        currentGapOrdinal: i,
        checkedGapCount,
        mismatchGapOrdinal,
        countOk,
        equallySpaced,
        title: {
          vi: matches ? `${actualGap} = ${expectedGap}: gap hợp lệ` : `${actualGap} ≠ ${expectedGap}: mismatch`,
          en: matches ? `${actualGap} = ${expectedGap}: valid gap` : `${actualGap} != ${expectedGap}: mismatch`,
        },
        note: matches
          ? { vi: "Tiếp tục kiểm tra occurrence kế tiếp.", en: "Continue to the next occurrence." }
          : { vi: "Chỉ một mismatch cũng đủ loại toàn bộ value.", en: "A single mismatch is enough to reject the whole value." },
      });

      if (!matches) {
        equallySpaced = false;
        statuses.set(value, "unequal");
        snapshot({
          operation: "set-false",
          phaseIndex: 3,
          codeLine: 18,
          activeValue: value,
          activeIndices: indices,
          expectedGap,
          actualGap,
          currentGapOrdinal: i,
          checkedGapCount,
          mismatchGapOrdinal,
          countOk,
          equallySpaced,
          title: { vi: "Đánh dấu không cách đều", en: "Mark as not equally spaced" },
          note: { vi: "equally_spaced = False.", en: "equally_spaced = False." },
        });
        snapshot({
          operation: "break",
          phaseIndex: 3,
          codeLine: 19,
          activeValue: value,
          activeIndices: indices,
          expectedGap,
          actualGap,
          currentGapOrdinal: i,
          checkedGapCount,
          mismatchGapOrdinal,
          countOk,
          equallySpaced,
          title: { vi: "Dừng kiểm tra gap", en: "Stop checking gaps" },
          note: { vi: "Không cần xét các gap còn lại.", en: "No remaining gap can change this rejection." },
        });
        break;
      }
    }

    statuses.set(value, equallySpaced ? "special-ready" : "unequal");
    snapshot({
      operation: "final-check",
      phaseIndex: 4,
      codeLine: 20,
      activeValue: value,
      activeIndices: indices,
      expectedGap,
      checkedGapCount,
      mismatchGapOrdinal,
      countOk,
      equallySpaced,
      title: {
        vi: equallySpaced ? `${value} thỏa mọi gap` : `${value} bị loại`,
        en: equallySpaced ? `${value} passes every gap` : `${value} is rejected`,
      },
      note: equallySpaced
        ? { vi: "Tất cả occurrence cách nhau đúng gap chuẩn.", en: "Every occurrence is separated by the reference gap." }
        : { vi: "equally_spaced là False nên không tăng answer.", en: "equally_spaced is False, so the answer is not incremented." },
    });

    if (equallySpaced) {
      const answerBefore = answer;
      answer += 1;
      statuses.set(value, "special");
      snapshot({
        operation: "count",
        phaseIndex: 4,
        codeLine: 21,
        activeValue: value,
        activeIndices: indices,
        expectedGap,
        checkedGapCount,
        countOk,
        equallySpaced,
        answerBefore,
        title: { vi: `Đếm value ${value}`, en: `Count value ${value}` },
        note: { vi: `answer = ${answerBefore} + 1 = ${answer}.`, en: `answer = ${answerBefore} + 1 = ${answer}.` },
      });
    }
  }

  snapshot({
    operation: "return",
    phaseIndex: 4,
    codeLine: 22,
    title: { vi: `Trả về ${answer}`, en: `Return ${answer}` },
    note: {
      vi: "Mỗi value có ít nhất ba occurrence và mọi gap bằng nhau được đếm đúng một lần.",
      en: "Every value with at least three occurrences and identical gaps is counted exactly once.",
    },
    final: true,
  });

  return { original: [...nums], answer, steps };
}

Object.assign(module.exports, {
  4049: {
    id: 4049,
    difficulty: "medium",
    slug: "count-values-with-equally-spaced-occurrences-ii",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "hash-map", vi: "Hash Map", en: "Hash Map" },
      { key: "counting", vi: "Đếm", en: "Counting" },
    ],
    title: { vi: "Count Values With Equally Spaced Occurrences II", en: "Count Values With Equally Spaced Occurrences II" },
    titleVi: { vi: "Đếm giá trị xuất hiện cách đều II", en: "Count values with equally spaced occurrences II" },
    statement: {
      vi: "Một số nguyên là special nếu xuất hiện ít nhất ba lần và mọi khoảng cách giữa hai occurrence liên tiếp đều bằng nhau. Trả về số lượng value special phân biệt.",
      en: "An integer is special if it appears at least three times and every consecutive occurrence gap is equal. Return the number of distinct special values.",
    },
    defaultInput: [8, 8, 8, 8],
    inputKind: "array",
    inputLabel: { vi: "nums", en: "nums" },
    approach: [
      { vi: "Duyệt nums một lần và gom danh sách index cho từng value bằng hash map.", en: "Scan nums once and group the index list for each value in a hash map." },
      { vi: "Bỏ qua nhóm có ít hơn ba index; dùng khoảng cách của hai index đầu làm gap chuẩn.", en: "Skip groups with fewer than three indices; use the first two indices to define the reference gap." },
      { vi: "Quét mọi gap còn lại; chỉ cần một gap khác là loại value, ngược lại tăng answer.", en: "Scan every remaining gap; one mismatch rejects the value, otherwise increment the answer." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Tổng số index trong mọi nhóm là n, nên cả hai lượt quét đều tuyến tính.",
        en: "The total number of indices across all groups is n, so both passes are linear.",
      },
    },
    debugMode: "semantic",
    code: [
      "from collections import defaultdict",
      "from typing import List",
      "",
      "class Solution:",
      "    def countSpecialIntegers(self, nums: List[int]) -> int:",
      "        positions = defaultdict(list)",
      "        for index, value in enumerate(nums):",
      "            positions[value].append(index)",
      "",
      "        answer = 0",
      "        for value, indices in positions.items():",
      "            if len(indices) < 3:",
      "                continue",
      "            gap = indices[1] - indices[0]",
      "            equally_spaced = True",
      "            for i in range(2, len(indices)):",
      "                if indices[i] - indices[i - 1] != gap:",
      "                    equally_spaced = False",
      "                    break",
      "            if equally_spaced:",
      "                answer += 1",
      "        return answer",
    ],
    liveArgs: (input) => [validateEquallySpaced4049Input(input)],
    builder: buildSteps4049,
  },
});
