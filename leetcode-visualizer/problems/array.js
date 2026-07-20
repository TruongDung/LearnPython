// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * LeetCode 1295: Find Numbers with Even Number of Digits.
 * Count how many numbers in the array have an even number of digits.
 */
function buildSteps1295(nums) {
  const steps = [];
  let count = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [{ name: "count", value: 0 }],
    note: {
      vi: `Duyệt từng số, đếm số lượng chữ số. Nếu chẵn → count += 1.`,
      en: `Iterate each number, count its digits. If even → count += 1.`,
    },
  });

  const evenIndices = [];
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const digits = String(num).length;
    const isEven = digits % 2 === 0;
    if (isEven) {
      count++;
      evenIndices.push(i);
    }

    steps.push({
      title: { vi: `Xét nums[${i}] = ${num}`, en: `Check nums[${i}] = ${num}` },
      arr: [...nums],
      highlight: [i],
      mark: [...evenIndices],
      codeLines: [4, 5, 6],
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
        { name: "digits", value: digits },
        { name: "even?", value: isEven ? "yes" : "no" },
        { name: "count", value: count },
      ],
      note: {
        vi: `${num} có ${digits} chữ số (${isEven ? "chẵn → count++" : "lẻ → bỏ qua"}). count = ${count}.`,
        en: `${num} has ${digits} digit(s) (${isEven ? "even → count++" : "odd → skip"}). count = ${count}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [...evenIndices],
    final: true,
    codeLines: [7],
    vars: [
      { name: "count", value: count },
      { name: "even numbers", value: evenIndices.map((i) => nums[i]) },
    ],
    note: {
      vi: `Có ${count} số có số lượng chữ số chẵn: [${evenIndices.map((i) => nums[i]).join(", ")}].`,
      en: `${count} number(s) have an even number of digits: [${evenIndices.map((i) => nums[i]).join(", ")}].`,
    },
  });

  return { original: [...nums], answer: count, steps };
}

/**
 * LeetCode 941: Valid Mountain Array.
 * Walk up from the left, walk down to the right.
 * Valid if peak is not at either end.
 */
function buildSteps941(nums) {
  const n = nums.length;
  const steps = [];

  if (n < 3) {
    steps.push({
      title: { vi: "Quá ngắn", en: "Too short" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [4],
      vars: [{ name: "result", value: false }],
      note: { vi: `Mảng cần ít nhất 3 phần tử. Trả về False.`, en: `Array needs at least 3 elements. Return False.` },
    });
    return { original: [...nums], answer: false, steps };
  }

  steps.push({
    title: { vi: "Bắt đầu leo lên", en: "Start climbing up" },
    arr: [...nums],
    highlight: [0],
    mark: [],
    codeLines: [5, 6],
    vars: [{ name: "i", value: 0 }, { name: "phase", value: "climb" }],
    note: { vi: "Bắt đầu từ trái, đi lên bao lâu nums[i] < nums[i+1].", en: "Start from the left, climb while nums[i] < nums[i+1]." },
  });

  let i = 0;
  while (i + 1 < n && nums[i] < nums[i + 1]) {
    i++;
    steps.push({
      title: { vi: `Leo lên: i = ${i}`, en: `Climb: i = ${i}` },
      arr: [...nums],
      highlight: Array.from({ length: i + 1 }, (_, x) => x),
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "phase", value: "climb" },
      ],
      note: {
        vi: `nums[${i - 1}]=${nums[i - 1]} < nums[${i}]=${nums[i]} → tiếp tục leo.`,
        en: `nums[${i - 1}]=${nums[i - 1]} < nums[${i}]=${nums[i]} → keep climbing.`,
      },
    });
  }

  const peak = i;
  if (peak === 0 || peak === n - 1) {
    steps.push({
      title: { vi: "Không có đỉnh hợp lệ", en: "No valid peak" },
      arr: [...nums],
      highlight: [peak],
      mark: [],
      final: true,
      codeLines: [8],
      vars: [{ name: "peak", value: peak }, { name: "result", value: false }],
      note: {
        vi: `Đỉnh ở biên (i=${peak}) → không phải núi. Trả về False.`,
        en: `Peak at boundary (i=${peak}) → not a mountain. Return False.`,
      },
    });
    return { original: [...nums], answer: false, steps };
  }

  steps.push({
    title: { vi: `Đỉnh tại i = ${peak}`, en: `Peak at i = ${peak}` },
    arr: [...nums],
    highlight: [peak],
    mark: [peak],
    codeLines: [8, 9],
    vars: [{ name: "peak", value: peak }, { name: "nums[peak]", value: nums[peak] }],
    note: { vi: `Đỉnh = nums[${peak}] = ${nums[peak]}. Bây giờ đi xuống.`, en: `Peak = nums[${peak}] = ${nums[peak]}. Now descend.` },
  });

  while (i + 1 < n && nums[i] > nums[i + 1]) {
    i++;
    steps.push({
      title: { vi: `Xuống: i = ${i}`, en: `Descend: i = ${i}` },
      arr: [...nums],
      highlight: Array.from({ length: i - peak + 1 }, (_, x) => peak + x),
      mark: [peak],
      codeLines: [9, 10],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "phase", value: "descend" },
      ],
      note: {
        vi: `nums[${i - 1}]=${nums[i - 1]} > nums[${i}]=${nums[i]} → tiếp tục xuống.`,
        en: `nums[${i - 1}]=${nums[i - 1]} > nums[${i}]=${nums[i]} → keep descending.`,
      },
    });
  }

  const valid = i === n - 1;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: valid ? Array.from({ length: n }, (_, x) => x) : [peak],
    final: true,
    codeLines: [11],
    vars: [
      { name: "i", value: i },
      { name: "n-1", value: n - 1 },
      { name: "result", value: valid },
    ],
    note: {
      vi: valid
        ? `Đã xuống tới cuối (i=${i} == n-1). Đây là núi hợp lệ → True.`
        : `Dừng sớm tại i=${i} (chưa tới cuối). Không phải núi → False.`,
      en: valid
        ? `Descended to the end (i=${i} == n-1). Valid mountain → True.`
        : `Stopped early at i=${i} (not at end). Not a mountain → False.`,
    },
  });

  return { original: [...nums], answer: valid, steps };
}

/**
 * LeetCode 1299: Replace Elements with Greatest Element on Right Side.
 * Traverse right to left, track running max. Replace each element with the max to its right.
 * Last element becomes -1.
 */
function buildSteps1299(nums) {
  const n = nums.length;
  const original = [...nums];
  const arr = [...nums];
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [{ name: "rightMax", value: -1 }],
    note: {
      vi: `Duyệt từ phải qua trái. rightMax = -1 (phía sau phần tử cuối không có gì).`,
      en: `Traverse right to left. rightMax = -1 (nothing to the right of the last element).`,
    },
  });

  let rightMax = -1;
  for (let i = n - 1; i >= 0; i--) {
    const cur = arr[i];
    arr[i] = rightMax;
    rightMax = Math.max(rightMax, cur);

    steps.push({
      title: { vi: `i = ${i}: thay ${cur} → ${arr[i]}`, en: `i = ${i}: replace ${cur} → ${arr[i]}` },
      arr: [...arr],
      highlight: [i],
      mark: [],
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "original", value: cur },
        { name: "arr[i]", value: arr[i] },
        { name: "rightMax", value: rightMax },
      ],
      note: {
        vi: `arr[${i}] = rightMax cũ = ${arr[i]}. Cập nhật rightMax = max(${arr[i] === -1 && i === n - 1 ? -1 : rightMax === cur ? cur : rightMax}, ${cur}) = ${rightMax}.`,
        en: `arr[${i}] = old rightMax = ${arr[i]}. Update rightMax = max(prev, ${cur}) = ${rightMax}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [9],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Kết quả: [${arr.join(", ")}].`,
      en: `Result: [${arr.join(", ")}].`,
    },
  });

  return { original, answer: arr, steps };
}

// 1089 moved to two-pointer.js

/**
 * Generate steps for LeetCode 1260: Shift 2D Grid.
 * Map each cell to a flattened index, shift it by k with modulo, then map it
 * back to a row and column in the result grid.
 */
function buildSteps1260(input, params) {
  if (Number(params && params.approach) === 2) {
    return buildSteps1260Flatten(input, params);
  }

  const rowStrings = String(input).split(";").map((row) => row.trim()).filter(Boolean);
  const grid = rowStrings.map((row) => row.split(",").map((value) => Number(value.trim())));
  const k = params.k;
  const valid = grid.length > 0
    && grid[0].length > 0
    && grid.every((row) => row.length === grid[0].length)
    && grid.every((row) => row.every(Number.isInteger));

  if (!valid) {
    return {
      original: input,
      answer: null,
      steps: [{
        title: { vi: "Grid không hợp lệ", en: "Invalid grid" },
        codeLines: [3],
        final: true,
        vars: [{ name: "error", value: "invalid rectangular grid" }],
        shiftGridView: { source: [], result: [], k, phase: { vi: "Lỗi input", en: "Input error" } },
        note: {
          vi: "Mỗi hàng phải có cùng số cột và chỉ chứa số nguyên. Ví dụ: 1,2,3;4,5,6;7,8,9.",
          en: "Every row must have the same number of integer cells. Example: 1,2,3;4,5,6;7,8,9.",
        },
      }],
    };
  }

  const m = grid.length;
  const n = grid[0].length;
  const total = m * n;
  const normalizedK = k % total;
  const result = Array.from({ length: m }, () => Array(n).fill(null));
  const steps = [];
  const placed = [];

  const makeView = (overrides = {}) => ({
    source: grid.map((row) => [...row]),
    result: result.map((row) => [...row]),
    k,
    normalizedK,
    placed: placed.map(([r, c]) => [r, c]),
    ...overrides,
  });

  steps.push({
    title: { vi: "Đọc kích thước grid", en: "Read grid dimensions" },
    codeLines: [3],
    vars: [
      { name: "m", value: m },
      { name: "n", value: n },
      { name: "k", value: k },
      { name: "cells", value: total },
    ],
    shiftGridView: makeView({ phase: { vi: "Grid ban đầu", en: "Original grid" } }),
    note: {
      vi: `Grid có ${m} hàng, ${n} cột, tổng cộng ${total} ô. Shift ${k} lần tương đương dịch ${normalizedK} vị trí sau khi lấy modulo ${total}.`,
      en: `The grid has ${m} rows, ${n} columns, and ${total} cells. ${k} shifts equal ${normalizedK} positions after modulo ${total}.`,
    },
  });

  steps.push({
    title: { vi: "Tạo result rỗng", en: "Create an empty result" },
    codeLines: [4],
    vars: [
      { name: "m", value: m },
      { name: "n", value: n },
      { name: "result", value: `${m} x ${n} empty` },
    ],
    shiftGridView: makeView({ phase: { vi: "Chưa đặt ô nào", en: "No cells placed yet" } }),
    note: {
      vi: "Tạo grid kết quả cùng kích thước. Dấu chấm là vị trí chưa được gán.",
      en: "Create a result grid with the same dimensions. A dot marks an unassigned position.",
    },
  });

  for (let r = 0; r < m; r++) {
    steps.push({
      title: { vi: `Duyệt hàng r = ${r}`, en: `Visit row r = ${r}` },
      codeLines: [5],
      vars: [
        { name: "r", value: r },
        { name: "k", value: k },
        { name: "placed", value: placed.length },
      ],
      shiftGridView: makeView({ sourceRow: r, phase: { vi: `Đang duyệt hàng ${r}`, en: `Scanning row ${r}` } }),
      note: {
        vi: `Bắt đầu xử lý các ô ở hàng ${r}.`,
        en: `Begin processing cells in row ${r}.`,
      },
    });

    for (let c = 0; c < n; c++) {
      const value = grid[r][c];
      const oldPos = r * n + c;
      const newPos = (oldPos + k) % total;
      const newR = Math.floor(newPos / n);
      const newC = newPos % n;

      steps.push({
        title: { vi: `Chọn grid[${r}][${c}] = ${value}`, en: `Select grid[${r}][${c}] = ${value}` },
        codeLines: [6],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "value", value },
          { name: "k", value: k },
        ],
        shiftGridView: makeView({
          current: [r, c],
          phase: { vi: "Chọn ô nguồn", en: "Select source cell" },
        }),
        note: {
          vi: `Ô đang xét chứa ${value} tại tọa độ (${r}, ${c}).`,
          en: `The current cell contains ${value} at coordinate (${r}, ${c}).`,
        },
      });

      steps.push({
        title: { vi: `Đổi (${r}, ${c}) thành index ${oldPos}`, en: `Flatten (${r}, ${c}) to index ${oldPos}` },
        codeLines: [7],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "old_pos", value: oldPos },
          { name: "formula", value: `${r} * ${n} + ${c}` },
        ],
        shiftGridView: makeView({
          current: [r, c],
          oldPos,
          phase: { vi: "Trải phẳng tọa độ cũ", en: "Flatten the old coordinate" },
        }),
        note: {
          vi: `old_pos = r * n + c = ${r} * ${n} + ${c} = ${oldPos}.`,
          en: `old_pos = r * n + c = ${r} * ${n} + ${c} = ${oldPos}.`,
        },
      });

      steps.push({
        title: { vi: `Dịch index ${oldPos} thêm ${k}`, en: `Shift index ${oldPos} by ${k}` },
        codeLines: [8],
        vars: [
          { name: "old_pos", value: oldPos },
          { name: "k", value: k },
          { name: "m*n", value: total },
          { name: "new_pos", value: newPos },
        ],
        shiftGridView: makeView({
          current: [r, c],
          oldPos,
          newPos,
          phase: { vi: "Dịch trên dãy 1D", en: "Shift on the 1D sequence" },
        }),
        note: {
          vi: `new_pos = (${oldPos} + ${k}) % ${total} = ${newPos}. Modulo đưa vị trí vượt cuối quay lại đầu grid.`,
          en: `new_pos = (${oldPos} + ${k}) % ${total} = ${newPos}. Modulo wraps positions past the end back to the start.`,
        },
      });

      steps.push({
        title: { vi: `Index ${newPos} -> (${newR}, ${newC})`, en: `Index ${newPos} -> (${newR}, ${newC})` },
        codeLines: [9],
        vars: [
          { name: "new_pos", value: newPos },
          { name: "new_r", value: newR },
          { name: "new_c", value: newC },
          { name: "n", value: n },
        ],
        shiftGridView: makeView({
          current: [r, c],
          target: [newR, newC],
          oldPos,
          newPos,
          phase: { vi: "Đổi index mới thành tọa độ", en: "Unflatten the new index" },
        }),
        note: {
          vi: `new_r = ${newPos} // ${n} = ${newR}; new_c = ${newPos} % ${n} = ${newC}.`,
          en: `new_r = ${newPos} // ${n} = ${newR}; new_c = ${newPos} % ${n} = ${newC}.`,
        },
      });

      result[newR][newC] = value;
      placed.push([newR, newC]);
      steps.push({
        title: { vi: `Đặt ${value} vào result[${newR}][${newC}]`, en: `Place ${value} at result[${newR}][${newC}]` },
        codeLines: [10],
        vars: [
          { name: "value", value },
          { name: "new_r", value: newR },
          { name: "new_c", value: newC },
          { name: "placed", value: placed.length },
        ],
        shiftGridView: makeView({
          current: [r, c],
          target: [newR, newC],
          oldPos,
          newPos,
          phase: { vi: "Gán vào grid kết quả", en: "Write into the result grid" },
        }),
        note: {
          vi: `result[${newR}][${newC}] = grid[${r}][${c}] = ${value}.`,
          en: `result[${newR}][${newC}] = grid[${r}][${c}] = ${value}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Trả về grid đã shift", en: "Return the shifted grid" },
    codeLines: [11],
    final: true,
    vars: [
      { name: "k", value: k },
      { name: "normalized_k", value: normalizedK },
      { name: "placed", value: placed.length },
    ],
    shiftGridView: makeView({ phase: { vi: "Kết quả cuối cùng", en: "Final result" } }),
    note: {
      vi: `Đã chuyển đủ ${total} ô. Trả về grid sau ${k} lần shift.`,
      en: `All ${total} cells have been moved. Return the grid after ${k} shifts.`,
    },
  });

  return { original: grid.map((row) => [...row]), answer: result.map((row) => [...row]), steps };
}

function buildSteps1260Flatten(input, params) {
  const rowStrings = String(input).split(";").map((row) => row.trim()).filter(Boolean);
  const originalGrid = rowStrings.map((row) => row.split(",").map((value) => Number(value.trim())));
  const k = params.k;
  const valid = originalGrid.length > 0
    && originalGrid[0].length > 0
    && originalGrid.every((row) => row.length === originalGrid[0].length)
    && originalGrid.every((row) => row.every(Number.isInteger));

  if (!valid) {
    return {
      original: input,
      answer: null,
      steps: [{
        title: { vi: "Grid không hợp lệ", en: "Invalid grid" },
        codeLines: [3],
        codeBlock: 2,
        final: true,
        vars: [{ name: "error", value: "invalid rectangular grid" }],
        shiftGridView: { source: [], result: [], k, phase: { vi: "Lỗi input", en: "Input error" } },
        note: {
          vi: "Mỗi hàng phải có cùng số cột và chỉ chứa số nguyên. Ví dụ: 1,2,3;4,5,6;7,8,9.",
          en: "Every row must have the same number of integer cells. Example: 1,2,3;4,5,6;7,8,9.",
        },
      }],
    };
  }

  const grid = originalGrid.map((row) => [...row]);
  const nRows = grid.length;
  const nCols = grid[0].length;
  const size = nRows * nCols;
  const oneArr = [];
  const newArr = Array(size).fill(null);
  const rebuiltGrid = Array.from({ length: nRows }, () => Array(nCols).fill(null));
  const steps = [];
  const placed = [];

  const makeView = (overrides = {}) => ({
    source: originalGrid.map((row) => [...row]),
    result: rebuiltGrid.map((row) => [...row]),
    sourceLabel: "grid",
    resultLabel: { vi: "grid đang ghi lại", en: "grid being rebuilt" },
    oneArr: [...oneArr],
    newArr: [...newArr],
    k,
    normalizedK: k % size,
    placed: placed.map(([r, c]) => [r, c]),
    ...overrides,
  });
  const snap = ({ title, line, vars, note, view = {}, final = false }) => {
    steps.push({
      title,
      codeLines: [line],
      codeBlock: 2,
      vars,
      note,
      final,
      shiftGridView: makeView(view),
    });
  };

  snap({
    title: { vi: `n_rows = ${nRows}`, en: `n_rows = ${nRows}` },
    line: 3,
    vars: [{ name: "n_rows", value: nRows }],
    view: { phase: { vi: "Đọc số hàng", en: "Read the row count" } },
    note: { vi: `Grid có ${nRows} hàng.`, en: `The grid has ${nRows} rows.` },
  });
  snap({
    title: { vi: `n_cols = ${nCols}`, en: `n_cols = ${nCols}` },
    line: 4,
    vars: [{ name: "n_rows", value: nRows }, { name: "n_cols", value: nCols }],
    view: { phase: { vi: "Đọc số cột", en: "Read the column count" } },
    note: { vi: `Mỗi hàng có ${nCols} cột.`, en: `Each row has ${nCols} columns.` },
  });
  snap({
    title: { vi: `size = ${size}`, en: `size = ${size}` },
    line: 6,
    vars: [
      { name: "n_rows", value: nRows },
      { name: "n_cols", value: nCols },
      { name: "size", value: size },
    ],
    view: { phase: { vi: "Tính tổng số ô", en: "Compute the total cell count" } },
    note: { vi: `size = ${nRows} * ${nCols} = ${size}.`, en: `size = ${nRows} * ${nCols} = ${size}.` },
  });
  snap({
    title: { vi: "Tạo one_arr rỗng", en: "Create an empty one_arr" },
    line: 8,
    vars: [{ name: "one_arr", value: "[]" }],
    view: { phase: { vi: "Mảng phẳng chưa có phần tử", en: "The flattened array is empty" } },
    note: { vi: "one_arr sẽ chứa grid theo thứ tự từ trái sang phải, từ trên xuống dưới.", en: "one_arr will store the grid from left to right, top to bottom." },
  });
  snap({
    title: { vi: `Tạo new_arr gồm ${size} ô`, en: `Create new_arr with ${size} slots` },
    line: 9,
    vars: [
      { name: "size", value: size },
      { name: "new_arr", value: `[${Array(size).fill("0").join(", ")}]` },
    ],
    view: { phase: { vi: "Mảng sau shift chưa được điền", en: "The shifted array has not been filled" } },
    note: { vi: `Code khởi tạo new_arr với ${size} số 0; visualization dùng dấu chấm để phân biệt các ô chưa được gán.`, en: `The code initializes new_arr with ${size} zeros; the visualization uses dots to distinguish unassigned slots.` },
  });

  for (let r = 0; r < nRows; r++) {
    snap({
      title: { vi: `Lấy hàng ${r}`, en: `Read row ${r}` },
      line: 11,
      vars: [
        { name: "row", value: `[${grid[r].join(", ")}]` },
        { name: "one_arr.length", value: oneArr.length },
      ],
      view: {
        sourceRow: r,
        phase: { vi: `Flatten hàng ${r}`, en: `Flatten row ${r}` },
      },
      note: { vi: `Vòng ngoài lấy grid[${r}] = [${grid[r].join(", ")}].`, en: `The outer loop reads grid[${r}] = [${grid[r].join(", ")}].` },
    });

    for (let c = 0; c < nCols; c++) {
      const value = grid[r][c];
      snap({
        title: { vi: `Đọc x = ${value}`, en: `Read x = ${value}` },
        line: 12,
        vars: [
          { name: "row", value: `[${grid[r].join(", ")}]` },
          { name: "x", value },
          { name: "source", value: `grid[${r}][${c}]` },
        ],
        view: {
          current: [r, c],
          activeOneIndex: oneArr.length,
          phase: { vi: "Chọn phần tử tiếp theo", en: "Select the next value" },
        },
        note: { vi: `Vòng trong đọc x = grid[${r}][${c}] = ${value}.`, en: `The inner loop reads x = grid[${r}][${c}] = ${value}.` },
      });

      oneArr.push(value);
      snap({
        title: { vi: `Append ${value} vào one_arr`, en: `Append ${value} to one_arr` },
        line: 13,
        vars: [
          { name: "x", value },
          { name: "one_arr", value: `[${oneArr.join(", ")}]` },
          { name: "one_arr.length", value: oneArr.length },
        ],
        view: {
          current: [r, c],
          activeOneIndex: oneArr.length - 1,
          phase: { vi: "Ghi vào mảng phẳng", en: "Append to the flattened array" },
        },
        note: { vi: `one_arr.append(${value}) -> [${oneArr.join(", ")}].`, en: `one_arr.append(${value}) -> [${oneArr.join(", ")}].` },
      });
    }
  }

  for (let i = 0; i < size; i++) {
    snap({
      title: { vi: `Duyệt i = ${i}`, en: `Visit i = ${i}` },
      line: 15,
      vars: [
        { name: "i", value: i },
        { name: "one_arr[i]", value: oneArr[i] },
        { name: "k", value: k },
      ],
      view: {
        activeOneIndex: i,
        oldPos: i,
        phase: { vi: "Chọn index cũ", en: "Select the old index" },
      },
      note: { vi: `Xét one_arr[${i}] = ${oneArr[i]}.`, en: `Inspect one_arr[${i}] = ${oneArr[i]}.` },
    });

    const newIndex = (i + k) % size;
    snap({
      title: { vi: `new_index = ${newIndex}`, en: `new_index = ${newIndex}` },
      line: 16,
      vars: [
        { name: "i", value: i },
        { name: "k", value: k },
        { name: "size", value: size },
        { name: "new_index", value: newIndex },
      ],
      view: {
        activeOneIndex: i,
        activeNewIndex: newIndex,
        oldPos: i,
        newPos: newIndex,
        phase: { vi: "Tính vị trí sau shift", en: "Compute the shifted index" },
      },
      note: { vi: `new_index = (${i} + ${k}) % ${size} = ${newIndex}.`, en: `new_index = (${i} + ${k}) % ${size} = ${newIndex}.` },
    });

    newArr[newIndex] = oneArr[i];
    snap({
      title: { vi: `Đặt ${oneArr[i]} vào new_arr[${newIndex}]`, en: `Place ${oneArr[i]} at new_arr[${newIndex}]` },
      line: 17,
      vars: [
        { name: "i", value: i },
        { name: "new_index", value: newIndex },
        { name: "one_arr[i]", value: oneArr[i] },
        { name: "new_arr", value: `[${newArr.map((value) => value === null ? "." : value).join(", ")}]` },
      ],
      view: {
        activeOneIndex: i,
        activeNewIndex: newIndex,
        oldPos: i,
        newPos: newIndex,
        phase: { vi: "Ghi vào mảng đã shift", en: "Write into the shifted array" },
      },
      note: { vi: `new_arr[${newIndex}] = one_arr[${i}] = ${oneArr[i]}.`, en: `new_arr[${newIndex}] = one_arr[${i}] = ${oneArr[i]}.` },
    });
  }

  for (let r = 0; r < nRows; r++) {
    snap({
      title: { vi: `Ghi lại hàng i = ${r}`, en: `Rebuild row i = ${r}` },
      line: 19,
      vars: [
        { name: "i", value: r },
        { name: "n_cols", value: nCols },
      ],
      view: {
        resultRow: r,
        phase: { vi: `Chuyển new_arr về hàng ${r}`, en: `Map new_arr back to row ${r}` },
      },
      note: { vi: `Bắt đầu ghi các giá trị của hàng ${r} trở lại grid.`, en: `Begin writing values for row ${r} back into grid.` },
    });

    for (let c = 0; c < nCols; c++) {
      const flatIndex = r * nCols + c;
      const value = newArr[flatIndex];
      snap({
        title: { vi: `Chọn ô (${r}, ${c})`, en: `Select cell (${r}, ${c})` },
        line: 20,
        vars: [
          { name: "i", value: r },
          { name: "j", value: c },
          { name: "flat_index", value: flatIndex },
        ],
        view: {
          target: [r, c],
          activeNewIndex: flatIndex,
          newPos: flatIndex,
          phase: { vi: "Chọn tọa độ cần ghi", en: "Select the destination coordinate" },
        },
        note: { vi: `Ô grid[${r}][${c}] tương ứng index phẳng ${r} * ${nCols} + ${c} = ${flatIndex}.`, en: `Cell grid[${r}][${c}] corresponds to flat index ${r} * ${nCols} + ${c} = ${flatIndex}.` },
      });

      rebuiltGrid[r][c] = value;
      grid[r][c] = value;
      placed.push([r, c]);
      snap({
        title: { vi: `grid[${r}][${c}] = ${value}`, en: `grid[${r}][${c}] = ${value}` },
        line: 21,
        vars: [
          { name: "i", value: r },
          { name: "j", value: c },
          { name: "i*n_cols+j", value: flatIndex },
          { name: "new_arr[index]", value },
        ],
        view: {
          target: [r, c],
          activeNewIndex: flatIndex,
          newPos: flatIndex,
          phase: { vi: "Ghi trở lại grid", en: "Write back into grid" },
        },
        note: { vi: `grid[${r}][${c}] = new_arr[${flatIndex}] = ${value}.`, en: `grid[${r}][${c}] = new_arr[${flatIndex}] = ${value}.` },
      });
    }
  }

  snap({
    title: { vi: "Trả về grid", en: "Return grid" },
    line: 23,
    final: true,
    vars: [
      { name: "one_arr", value: `[${oneArr.join(", ")}]` },
      { name: "new_arr", value: `[${newArr.join(", ")}]` },
      { name: "grid", value: JSON.stringify(grid) },
    ],
    view: {
      resultLabel: { vi: "grid cuối cùng", en: "final grid" },
      phase: { vi: "Kết quả Approach 2", en: "Approach 2 result" },
    },
    note: { vi: `Trả về grid = ${JSON.stringify(grid)}.`, en: `Return grid = ${JSON.stringify(grid)}.` },
  });

  return { original: originalGrid, answer: grid.map((row) => [...row]), steps };
}

/**
 * Generate steps for LeetCode 1275: Find Winner on a Tic Tac Toe Game.
 * Simulate each move on a 3x3 board and check for a winner.
 */
function buildSteps1275(input) {
  const movesRaw = String(input).split(",").map((m) => m.trim()).filter((m) => m.length > 0);
  const moves = movesRaw.map((m) => {
    const parts = m.split("-");
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  });
  const steps = [];

  const board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  const boardStr = () => board.map((r) => r.map((c) => c || ".").join("")).join("|");

  const flatLabels = () => {
    const flat = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        flat.push(board[r][c] || ".");
    return flat;
  };
  const rowCells = (row) => [row * 3, row * 3 + 1, row * 3 + 2];
  const colCells = (col) => [col, col + 3, col + 6];
  const mainDiagonal = [0, 4, 8];
  const antiDiagonal = [2, 4, 6];
  const cellsMatch = (cells, player) => cells.every((index) => flatLabels()[index] === player);
  const boardCells = (highlight, mark) => {
    const highlightSet = new Set(highlight);
    const markSet = new Set(mark);
    return board.map((row, r) => row.map((player, c) => {
      const index = r * 3 + c;
      let cls = player === "A" ? "tic-a" : player === "B" ? "tic-b" : "empty";
      if (highlightSet.has(index)) cls = "current";
      if (markSet.has(index)) cls = "path";
      return { label: player, meta: `(${r},${c})`, cls };
    }));
  };
  const pushStep = ({ title, highlight = [], mark = [], codeLines, vars = [], note, final = false }) => {
    steps.push({
      title,
      bfsGrid: {
        rows: 3,
        cols: 3,
        cells: boardCells(highlight, mark),
        variant: "tic-tac-toe",
      },
      final,
      codeLines,
      vars,
      note,
    });
  };

  pushStep({
    title: { vi: "Bàn cờ trống", en: "Empty board" },
    codeLines: [3],
    vars: [
      { name: "moves", value: movesRaw.join(", ") },
      { name: "board", value: boardStr() },
    ],
    note: {
      vi: `Bàn 3×3 trống. A đi trước (nước lẻ), B đi sau (nước chẵn).`,
      en: `Empty 3×3 board. A goes first (odd moves), B goes second (even moves).`,
    },
  });

  for (let i = 0; i < moves.length; i++) {
    const [r, c] = moves[i];
    const player = i % 2 === 0 ? "A" : "B";
    const cellIdx = r * 3 + c;

    pushStep({
      title: { vi: `Vòng for: nước ${i + 1}`, en: `For loop: move ${i + 1}` },
      highlight: [cellIdx],
      codeLines: [4],
      vars: [
        { name: "i", value: i },
        { name: "r", value: r },
        { name: "c", value: c },
        { name: "player", value: player },
      ],
      note: {
        vi: `Đọc moves[${i}] = (${r},${c}); ${player} là người chơi của lượt này.`,
        en: `Read moves[${i}] = (${r},${c}); ${player} is the player for this turn.`,
      },
    });

    board[r][c] = player;
    pushStep({
      title: { vi: `${player} đặt quân tại (${r},${c})`, en: `${player} places at (${r},${c})` },
      highlight: [cellIdx],
      codeLines: [5],
      vars: [
        { name: "i", value: i },
        { name: "board[r][c]", value: player },
        { name: "board", value: boardStr() },
      ],
      note: {
        vi: `Gán board[${r}][${c}] = '${player}'. Chưa kiểm tra thắng cho đến khi đặt xong mọi nước đi.`,
        en: `Set board[${r}][${c}] = '${player}'. Winner checks begin after all moves are placed.`,
      },
    });
  }

  for (const player of ["A", "B"]) {
    pushStep({
      title: { vi: `Kiểm tra người chơi ${player}`, en: `Check player ${player}` },
      codeLines: [7],
      vars: [{ name: "player", value: player }, { name: "board", value: boardStr() }],
      note: {
        vi: `Bắt đầu kiểm tra các hàng, cột và đường chéo của ${player}.`,
        en: `Begin checking ${player}'s rows, columns, and diagonals.`,
      },
    });

    for (let line = 0; line < 3; line++) {
      const row = rowCells(line);
      const rowWin = cellsMatch(row, player);
      pushStep({
        title: { vi: `Hàng ${line} của ${player}: ${rowWin}`, en: `Player ${player}, row ${line}: ${rowWin}` },
        highlight: row,
        codeLines: [8, 9],
        vars: [
          { name: "player", value: player },
          { name: "i", value: line },
          { name: "row values", value: row.map((index) => flatLabels()[index]).join(", ") },
          { name: "row complete", value: rowWin },
        ],
        note: {
          vi: `Kiểm tra board[${line}][0..2] có đều là '${player}' hay không.`,
          en: `Check whether board[${line}][0..2] are all '${player}'.`,
        },
      });
      if (rowWin) {
        pushStep({
          title: { vi: `return '${player}'`, en: `return '${player}'` },
          mark: row,
          codeLines: [10],
          vars: [{ name: "winner", value: player }, { name: "winning row", value: line }],
          note: { vi: `${player} thắng bằng hàng ${line}.`, en: `${player} wins on row ${line}.` },
          final: true,
        });
        return { moves: movesRaw, answer: player, steps };
      }

      const col = colCells(line);
      const colWin = cellsMatch(col, player);
      pushStep({
        title: { vi: `Cột ${line} của ${player}: ${colWin}`, en: `Player ${player}, column ${line}: ${colWin}` },
        highlight: col,
        codeLines: [11],
        vars: [
          { name: "player", value: player },
          { name: "i", value: line },
          { name: "column values", value: col.map((index) => flatLabels()[index]).join(", ") },
          { name: "column complete", value: colWin },
        ],
        note: {
          vi: `Kiểm tra board[0..2][${line}] có đều là '${player}' hay không.`,
          en: `Check whether board[0..2][${line}] are all '${player}'.`,
        },
      });
      if (colWin) {
        pushStep({
          title: { vi: `return '${player}'`, en: `return '${player}'` },
          mark: col,
          codeLines: [12],
          vars: [{ name: "winner", value: player }, { name: "winning column", value: line }],
          note: { vi: `${player} thắng bằng cột ${line}.`, en: `${player} wins on column ${line}.` },
          final: true,
        });
        return { moves: movesRaw, answer: player, steps };
      }
    }

    const mainWin = cellsMatch(mainDiagonal, player);
    pushStep({
      title: { vi: `Đường chéo chính của ${player}: ${mainWin}`, en: `Player ${player}, main diagonal: ${mainWin}` },
      highlight: mainDiagonal,
      codeLines: [13],
      vars: [
        { name: "player", value: player },
        { name: "diagonal values", value: mainDiagonal.map((index) => flatLabels()[index]).join(", ") },
        { name: "diagonal complete", value: mainWin },
      ],
      note: {
        vi: `Kiểm tra (0,0), (1,1), (2,2) có đều là '${player}' hay không.`,
        en: `Check whether (0,0), (1,1), and (2,2) are all '${player}'.`,
      },
    });
    if (mainWin) {
      pushStep({
        title: { vi: `return '${player}'`, en: `return '${player}'` },
        mark: mainDiagonal,
        codeLines: [14],
        vars: [{ name: "winner", value: player }, { name: "winning line", value: "main diagonal" }],
        note: { vi: `${player} thắng bằng đường chéo chính.`, en: `${player} wins on the main diagonal.` },
        final: true,
      });
      return { moves: movesRaw, answer: player, steps };
    }

    const antiWin = cellsMatch(antiDiagonal, player);
    pushStep({
      title: { vi: `Đường chéo phụ của ${player}: ${antiWin}`, en: `Player ${player}, anti-diagonal: ${antiWin}` },
      highlight: antiDiagonal,
      codeLines: [15],
      vars: [
        { name: "player", value: player },
        { name: "anti-diagonal values", value: antiDiagonal.map((index) => flatLabels()[index]).join(", ") },
        { name: "anti-diagonal complete", value: antiWin },
      ],
      note: {
        vi: `Kiểm tra (0,2), (1,1), (2,0) có đều là '${player}' hay không.`,
        en: `Check whether (0,2), (1,1), and (2,0) are all '${player}'.`,
      },
    });
    if (antiWin) {
      pushStep({
        title: { vi: `return '${player}'`, en: `return '${player}'` },
        mark: antiDiagonal,
        codeLines: [16],
        vars: [{ name: "winner", value: player }, { name: "winning line", value: "anti-diagonal" }],
        note: { vi: `${player} thắng bằng đường chéo phụ.`, en: `${player} wins on the anti-diagonal.` },
        final: true,
      });
      return { moves: movesRaw, answer: player, steps };
    }
  }

  const answer = moves.length === 9 ? "Draw" : "Pending";
  pushStep({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    final: true,
    codeLines: [17],
    vars: [
      { name: "len(moves)", value: moves.length },
      { name: "answer", value: answer },
    ],
    note: {
      vi: answer === "Draw"
        ? "Hết ô mà không ai thắng → Hòa."
        : `Còn ô trống và chưa ai thắng → Pending.`,
      en: answer === "Draw"
        ? "All cells filled with no winner → Draw."
        : `Empty cells remain and no winner → Pending.`,
    },
  });

  return { moves: movesRaw, answer, steps };
}

module.exports = {
  1299: {
    id: 1299,
    difficulty: "easy",
    slug: "replace-elements-with-greatest-element-on-right-side",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Replace Elements with Greatest Element on Right Side", en: "Replace Elements with Greatest Element on Right Side" },
    titleVi: { vi: "Thay bằng phần tử lớn nhất bên phải", en: "Replace with greatest on right" },
    statement: {
      vi: "Cho mảng arr. Thay mỗi phần tử bằng phần tử lớn nhất nằm ở bên phải nó. Phần tử cuối trở thành -1.",
      en: "Given an array arr, replace every element with the greatest element among the elements to its right. The last element becomes -1.",
    },
    defaultInput: [17, 18, 5, 4, 6, 1],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần từ phải. Thay tại chỗ nên O(1) bộ nhớ phụ.",
        en: "Single right-to-left pass. In-place so O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def replaceElements(self, arr):",
      "        n = len(arr)",
      "        right_max = -1",
      "        for i in range(n-1, -1, -1):",
      "            cur = arr[i]",
      "            arr[i] = right_max",
      "            right_max = max(right_max, cur)",
      "        return arr",
    ],
    codeCsharp: [
      "public class Solution {",
      "    public int[] ReplaceElements(int[] arr) {",
      "        int n = arr.Length;",
      "        int rightMax = -1;",
      "        for (int i = n - 1; i >= 0; i--) {",
      "            int cur = arr[i];",
      "            arr[i] = rightMax;",
      "            rightMax = Math.Max(rightMax, cur);",
      "        }",
      "        return arr;",
      "    }",
      "}",
    ],
    builder: buildSteps1299,
  },
  941: {
    id: 941,
    difficulty: "easy",
    slug: "valid-mountain-array",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Valid Mountain Array", en: "Valid Mountain Array" },
    titleVi: { vi: "Mảng núi hợp lệ", en: "Check if array forms a mountain" },
    statement: {
      vi: "Cho mảng arr. Trả về True nếu nó là mảng núi: tăng nghiêm ngặt tới một đỉnh, rồi giảm nghiêm ngặt. Cần ít nhất 3 phần tử.",
      en: "Given an array arr, return True if it is a valid mountain array: strictly increasing to a peak, then strictly decreasing. Needs at least 3 elements.",
    },
    defaultInput: [0, 3, 2, 1],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần từ trái qua đỉnh rồi xuống. O(1) bộ nhớ.",
        en: "Single pass: climb up then descend. O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def validMountainArray(self, arr):",
      "        n = len(arr)",
      "        if n < 3: return False",
      "        i = 0",
      "        while i+1 < n and arr[i] < arr[i+1]:",
      "            i += 1",
      "        if i == 0 or i == n-1: return False",
      "        while i+1 < n and arr[i] > arr[i+1]:",
      "            i += 1",
      "        return i == n - 1",
    ],
    builder: buildSteps941,
  },
  1295: {
    id: 1295,
    difficulty: "easy",
    slug: "find-numbers-with-even-number-of-digits",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Find Numbers with Even Number of Digits", en: "Find Numbers with Even Number of Digits" },
    titleVi: { vi: "Đếm số có chữ số chẵn", en: "Count numbers with even digit count" },
    statement: {
      vi: "Cho mảng nums chứa các số nguyên. Trả về số lượng phần tử có số lượng chữ số chẵn.",
      en: "Given an array nums of integers, return how many of them contain an even number of digits.",
    },
    defaultInput: [12, 345, 2, 6, 7896],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần, đếm chữ số bằng log hoặc chuỗi O(1). Tổng O(n).",
        en: "Single pass, digit count via log or string is O(1). Total O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def findNumbers(self, nums):",
      "        count = 0",
      "        for num in nums:",
      "            if len(str(num)) % 2 == 0:",
      "                count += 1",
      "        return count",
    ],
    builder: buildSteps1295,
  },
  1275: {
    id: 1275,
    difficulty: "easy",
    slug: "find-winner-on-a-tic-tac-toe-game",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Find Winner on a Tic Tac Toe Game", en: "Find Winner on a Tic Tac Toe Game" },
    titleVi: { vi: "Tìm người thắng Tic-Tac-Toe", en: "Find Tic-Tac-Toe winner" },
    statement: {
      vi:
        "Cho danh sách nước đi trên bàn cờ 3x3. Nước đi lẻ là của A, nước chẵn là của B. " +
        "Trả về 'A' nếu A thắng, 'B' nếu B thắng, 'Draw' nếu hòa (hết ô), hoặc 'Pending' nếu chưa kết thúc.",
      en:
        "Given a list of moves on a 3x3 board. Odd moves belong to A, even moves to B. " +
        "Return 'A' if A wins, 'B' if B wins, 'Draw' if it's a draw (all cells filled), or 'Pending' if game is not over.",
    },
    defaultInput: "0-0,2-0,1-1,2-1,2-2",
    inputKind: "string",
    inputLabel: { vi: "Nước đi (row-col, cách bởi dấu phẩy)", en: "Moves (row-col, comma separated)" },
    extraParams: [],
    complexity: {
      time: "O(M)",
      space: "O(1)",
      note: {
        vi: "Duyệt M nước đi, mỗi nước kiểm tra thắng O(1) (bàn cố định 3×3). Bộ nhớ O(1) cho bàn 3×3.",
        en: "Iterate M moves, each check for win is O(1) (fixed 3×3 board). Memory O(1) for the 3×3 board.",
      },
    },
    code: [
      "class Solution:",
      "    def tictactoe(self, moves):",
      "        board = [['' for _ in range(3)] for _ in range(3)]",
      "        for i, (r, c) in enumerate(moves):",
      "            board[r][c] = 'A' if i % 2 == 0 else 'B'",
      "        # Check rows, cols, diagonals",
      "        for player in ['A', 'B']:",
      "            for i in range(3):",
      "                if all(board[i][j]==player for j in range(3)):",
      "                    return player",
      "                if all(board[j][i]==player for j in range(3)):",
      "                    return player",
      "            if all(board[i][i]==player for i in range(3)):",
      "                return player",
      "            if all(board[i][2-i]==player for i in range(3)):",
      "                return player",
      "        return 'Draw' if len(moves)==9 else 'Pending'",
    ],
    builder: buildSteps1275,
  },
  1260: {
    id: 1260,
    difficulty: "easy",
    slug: "shift-2d-grid",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Shift 2D Grid", en: "Shift 2D Grid" },
    titleVi: { vi: "Dịch grid 2 chiều", en: "Shift a 2D grid" },
    statement: {
      vi: "Cho grid m x n và số nguyên k. Mỗi lần shift, mọi phần tử dịch sang phải một ô; phần tử cuối hàng sang đầu hàng kế tiếp và phần tử cuối grid quay về ô (0,0). Trả về grid sau k lần shift.",
      en: "Given an m x n grid and integer k, shift every element right by one per operation. Row endings move to the next row, and the final cell wraps to (0,0). Return the grid after k shifts.",
    },
    defaultInput: "1,2,3;4,5,6;7,8,9",
    inputKind: "string",
    inputLabel: {
      vi: "Grid (phẩy ngăn cột, chấm phẩy ngăn hàng)",
      en: "Grid (commas separate columns, semicolons separate rows)",
    },
    extraParams: [
      { key: "k", label: { vi: "Số lần shift k", en: "Shift count k" }, default: 1, min: 0 },
      {
        key: "approach",
        label: { vi: "Chọn cách visualize", en: "Visualization approach" },
        type: "select",
        default: 1,
        options: [
          { value: 1, label: { vi: "Cách 1: Ánh xạ trực tiếp", en: "Approach 1: Direct mapping" } },
          { value: 2, label: { vi: "Cách 2: Flatten rồi shift", en: "Approach 2: Flatten then shift" } },
        ],
      },
    ],
    complexity: {
      time: "O(m*n)",
      space: "O(m*n)",
      note: {
        vi: "Mỗi ô được đọc và ghi đúng một lần. Grid kết quả chứa m*n phần tử.",
        en: "Each cell is read and written exactly once. The result grid stores m*n elements.",
      },
    },
    approach: [
      { vi: "Cách 1 ánh xạ trực tiếp mỗi tọa độ cũ sang tọa độ mới bằng index phẳng.", en: "Approach 1 maps every old coordinate directly to a new coordinate through a flat index." },
      { vi: "Cách 2 trải grid thành one_arr, dịch sang new_arr, rồi ghi new_arr trở lại grid.", en: "Approach 2 flattens grid into one_arr, shifts into new_arr, then writes new_arr back to grid." },
      { vi: "Cả hai cách dùng modulo để phần tử vượt cuối quay lại đầu.", en: "Both approaches use modulo to wrap positions past the end back to the start." },
    ],
    code: [
      "class Solution:",
      "    def shiftGrid(self, grid: List[List[int]], k: int) -> List[List[int]]:",
      "        m, n = len(grid), len(grid[0])",
      "        result = [[0] * n for _ in range(m)]",
      "        for r in range(m):",
      "            for c in range(n):",
      "                old_pos = r * n + c",
      "                new_pos = (old_pos + k) % (m * n)",
      "                new_r, new_c = divmod(new_pos, n)",
      "                result[new_r][new_c] = grid[r][c]",
      "        return result",
    ],
    code2: [
      "class Solution:",
      "    def shiftGrid(self, grid: List[List[int]], k: int) -> List[List[int]]:",
      "        n_rows = len(grid)",
      "        n_cols = len(grid[0])",
      "",
      "        size = n_rows * n_cols",
      "",
      "        one_arr = []",
      "        new_arr = [0] * size",
      "",
      "        for row in grid:",
      "            for x in row:",
      "                one_arr.append(x)",
      "",
      "        for i in range(size):",
      "            new_index = (i + k) % size",
      "            new_arr[new_index] = one_arr[i]",
      "",
      "        for i in range(n_rows):",
      "            for j in range(n_cols):",
      "                grid[i][j] = new_arr[i * n_cols + j]",
      "",
      "        return grid",
    ],
    codeLabel: { vi: "Cách 1: Ánh xạ trực tiếp", en: "Approach 1: Direct mapping" },
    code2Label: { vi: "Cách 2: Flatten rồi shift", en: "Approach 2: Flatten then shift" },
    builder: buildSteps1260,
  },
};
