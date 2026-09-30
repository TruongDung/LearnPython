// LeetCode 2218: group knapsack over pile-prefix choices.

const label = (vi, en) => ({ vi, en });
const MAX_PILES = 15;
const MAX_TOTAL_COINS = 120;
const MAX_K = 40;
const MAX_TRACE_STEPS = 260;

function parsePiles2218(input) {
  let piles;
  if (Array.isArray(input)) {
    piles = input;
  } else {
    const raw = String(input ?? "").trim();
    try {
      if (raw.startsWith("[")) {
        piles = JSON.parse(raw);
      } else {
        piles = raw.split(";").map((pile) => {
          const values = pile.split(",").map((value) => value.trim());
          if (!values.length || values.some((value) => value === "")) throw new Error("empty coin");
          return values.map(Number);
        });
      }
    } catch (_error) {
      throw new Error("piles phải là JSON như [[1,100,3],[7,8,9]] hoặc các pile ngăn bởi dấu chấm phẩy");
    }
  }

  const totalCoins = Array.isArray(piles)
    ? piles.reduce((total, pile) => total + (Array.isArray(pile) ? pile.length : 0), 0)
    : 0;
  if (!Array.isArray(piles) || piles.length < 1 || piles.length > MAX_PILES
    || totalCoins > MAX_TOTAL_COINS
    || piles.some((pile) => !Array.isArray(pile) || pile.length < 1
      || pile.some((coin) => !Number.isInteger(coin) || coin < 1 || coin > 100000))) {
    throw new Error(`piles cần 1–${MAX_PILES} pile không rỗng, tối đa ${MAX_TOTAL_COINS} coin; mỗi coin là số nguyên trong [1, 100000]`);
  }
  return piles.map((pile) => [...pile]);
}

function buildSteps2218(input, params = {}) {
  const piles = parsePiles2218(input);
  const k = Number(params.k);
  const totalCoins = piles.reduce((total, pile) => total + pile.length, 0);
  if (!Number.isInteger(k) || k < 1 || k > MAX_K || k > totalCoins) {
    throw new Error(`k phải là số nguyên trong [1, min(${MAX_K}, tổng số coin=${totalCoins})]`);
  }

  const n = piles.length;
  const prefixes = piles.map(() => [0]);
  const dp = Array.from({ length: n + 1 }, () => Array(k + 1).fill(Number.NEGATIVE_INFINITY));
  const choice = Array.from({ length: n + 1 }, () => Array(k + 1).fill(-1));

  const steps = [];
  let omitted = false;
  const displayDp = () => dp.map((row) => row.map((value) => Number.isFinite(value) ? value : "·"));
  const pileData = () => piles.map((coins, index) => ({
    index,
    coins: [...coins],
    prefix: [...prefixes[index]],
  }));

  function record(options) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const candidates = (options.candidates || []).map((candidate) => ({
      ...candidate,
      coins: [...candidate.coins],
    }));
    const selectedCounts = options.selectedCounts ? [...options.selectedCounts] : null;
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: [options.line],
      vars: options.vars || [],
      note: options.note,
      coins2218View: {
        approach: 1,
        phase: options.phase,
        operation: options.operation,
        n,
        k,
        totalCoins,
        piles: pileData(),
        pileIndex: options.pileIndex ?? null,
        used: options.used ?? null,
        coinIndex: options.coinIndex ?? null,
        take: options.take ?? null,
        sourceCoins: options.sourceCoins ?? null,
        reachable: options.reachable ?? null,
        updated: options.updated ?? null,
        candidates,
        bestTake: options.bestTake ?? null,
        bestValue: options.bestValue ?? null,
        dp: displayDp(),
        selectedCounts,
        answer: options.final ? dp[n][k] : null,
        omitted,
      },
    });
  }

  record({
    phase: "init",
    operation: "bind-class",
    line: 1,
    title: label("Khai báo lớp Solution", "Bind the Solution class"),
    vars: [{ name: "piles", value: n }, { name: "k", value: k }],
    note: label(
      "Lớp chứa lời giải group-knapsack cho các prefix của từng pile.",
      "The class contains the group-knapsack solution over pile prefixes.",
    ),
  });
  record({
    phase: "init",
    operation: "enter-method",
    line: 2,
    title: label("Gọi maxValueOfCoins", "Enter maxValueOfCoins"),
    vars: [{ name: "piles", value: n }, { name: "k", value: k }],
    note: label(
      `Cần lấy đúng ${k} coin từ ${n} pile.`,
      `Take exactly ${k} coins from ${n} piles.`,
    ),
  });
  record({
    phase: "init",
    operation: "set-n",
    line: 3,
    title: label(`n = ${n}`, `n = ${n}`),
    vars: [{ name: "n", value: n }, { name: "total coins", value: totalCoins }, { name: "k", value: k }],
    note: label("n là số pile.", "n is the number of piles."),
  });
  record({
    phase: "init",
    operation: "allocate-dp",
    line: 4,
    title: label("Khởi tạo bảng DP bằng −∞", "Allocate the DP table with −∞"),
    vars: [
      { name: "rows", value: n + 1 },
      { name: "columns", value: k + 1 },
      { name: "k", value: k },
    ],
    note: label(
      "dp[i][j] lưu giá trị lớn nhất khi lấy đúng j coin từ i pile đầu. −∞ biểu thị trạng thái chưa thể đạt tới.",
      "dp[i][j] stores the best value from exactly j coins using the first i piles. −∞ marks an unreachable state.",
    ),
  });
  dp[0][0] = 0;
  choice[0][0] = 0;
  record({
    phase: "init",
    operation: "seed-base-case",
    line: 5,
    title: label("dp[0][0] = 0", "dp[0][0] = 0"),
    vars: [{ name: "dp[0][0]", value: 0 }],
    note: label(
      "Không dùng pile nào và lấy 0 coin cho tổng giá trị 0; đây là trạng thái nguồn duy nhất lúc đầu.",
      "Using no piles and taking zero coins has value 0; this is the only initial source state.",
    ),
  });

  for (let pileIndex = 0; pileIndex < n; pileIndex++) {
    const pile = piles[pileIndex];
    record({
      phase: "pile",
      operation: "select-pile",
      line: 6,
      pileIndex,
      title: label(`Bắt đầu pile ${pileIndex + 1}`, `Start pile ${pileIndex + 1}`),
      vars: [
        { name: "i", value: pileIndex + 1 },
        { name: "pile", value: `[${pile.join(", ")}]` },
      ],
      note: label(
        `Xử lý pile ${pileIndex + 1}; mọi lựa chọn hợp lệ phải lấy một prefix từ trên xuống.`,
        `Process pile ${pileIndex + 1}; every legal choice takes a top prefix.`,
      ),
    });
    prefixes[pileIndex] = [0];
    record({
      phase: "pile",
      operation: "init-prefix",
      line: 7,
      pileIndex,
      title: label("prefix = [0]", "prefix = [0]"),
      vars: [{ name: "prefix", value: "[0]" }],
      note: label(
        "Lấy 0 coin từ pile hiện tại có giá trị 0.",
        "Taking zero coins from the current pile has value 0.",
      ),
    });
    for (let coinIndex = 0; coinIndex < pile.length; coinIndex++) {
      const coin = pile[coinIndex];
      prefixes[pileIndex].push(prefixes[pileIndex][prefixes[pileIndex].length - 1] + coin);
      record({
        phase: "pile",
        operation: "append-prefix",
        line: 8,
        pileIndex,
        coinIndex,
        title: label(
          `Thêm coin ${coin}: prefix[${coinIndex + 1}] = ${prefixes[pileIndex][coinIndex + 1]}`,
          `Add coin ${coin}: prefix[${coinIndex + 1}] = ${prefixes[pileIndex][coinIndex + 1]}`,
        ),
        vars: [
          { name: "coin", value: coin },
          { name: "prefix", value: `[${prefixes[pileIndex].join(", ")}]` },
        ],
        note: label(
          `prefix[${coinIndex + 1}] là tổng của ${coinIndex + 1} coin trên cùng.`,
          `prefix[${coinIndex + 1}] is the value of the top ${coinIndex + 1} coin(s).`,
        ),
      });
    }

    for (let used = 0; used <= k; used++) {
      const candidates = [];
      let bestValue = Number.NEGATIVE_INFINITY;
      let bestTake = -1;
      const maxTake = Math.min(pile.length, used);
      record({
        phase: "state",
        operation: "select-used",
        line: 9,
        pileIndex,
        used,
        candidates,
        bestTake,
        bestValue: null,
        title: label(`Tính dp[${pileIndex + 1}][${used}]`, `Compute dp[${pileIndex + 1}][${used}]`),
        vars: [
          { name: "i", value: pileIndex + 1 },
          { name: "used", value: used },
          { name: "max take", value: maxTake },
        ],
        note: label(
          `Thử mọi take từ 0 đến ${maxTake} cho ô đích này.`,
          `Try every take from 0 through ${maxTake} for this destination cell.`,
        ),
      });
      for (let take = 0; take <= maxTake; take++) {
        const sourceCoins = used - take;
        const previous = dp[pileIndex][sourceCoins];
        const reachable = Number.isFinite(previous);
        record({
          phase: "state",
          operation: "select-take",
          line: 10,
          pileIndex,
          used,
          take,
          sourceCoins,
          candidates,
          bestTake,
          bestValue: Number.isFinite(bestValue) ? bestValue : null,
          title: label(`Thử take = ${take}`, `Try take = ${take}`),
          vars: [
            { name: "used", value: used },
            { name: "take", value: take },
            { name: "used - take", value: sourceCoins },
          ],
          note: label(
            `Lựa chọn này cần trạng thái nguồn dp[${pileIndex}][${sourceCoins}].`,
            `This choice needs source state dp[${pileIndex}][${sourceCoins}].`,
          ),
        });
        record({
          phase: "state",
          operation: reachable ? "reachable-source" : "unreachable-source",
          line: 11,
          pileIndex,
          used,
          take,
          sourceCoins,
          reachable,
          candidates,
          bestTake,
          bestValue: Number.isFinite(bestValue) ? bestValue : null,
          title: reachable
            ? label(`dp[${pileIndex}][${sourceCoins}] = ${previous} khả thi`, `dp[${pileIndex}][${sourceCoins}] = ${previous} is reachable`)
            : label(`dp[${pileIndex}][${sourceCoins}] = −∞`, `dp[${pileIndex}][${sourceCoins}] = −∞`),
          vars: [
            { name: "source", value: `dp[${pileIndex}][${sourceCoins}]` },
            { name: "previous", value: reachable ? previous : "−∞" },
            { name: "reachable", value: reachable },
          ],
          note: reachable
            ? label("Nguồn khả thi nên thực hiện phép chuyển trạng thái.", "The source is reachable, so execute the transition.")
            : label("Nguồn không khả thi nên bỏ qua dòng cập nhật.", "The source is unreachable, so skip the update line."),
        });
        if (!reachable) continue;
        const pileValue = prefixes[pileIndex][take];
        const total = previous + pileValue;
        const candidate = {
          take,
          sourceCoins,
          previous,
          pileValue,
          total,
          coins: pile.slice(0, take),
          winner: false,
        };
        candidates.push(candidate);
        let updated = false;
        if (total > bestValue) {
          candidates.forEach((item) => { item.winner = false; });
          bestValue = total;
          bestTake = take;
          candidate.winner = true;
          dp[pileIndex + 1][used] = bestValue;
          choice[pileIndex + 1][used] = bestTake;
          updated = true;
        }
        record({
          phase: "state",
          operation: updated ? "update-cell" : "keep-cell",
          line: 12,
          pileIndex,
          used,
          take,
          sourceCoins,
          reachable: true,
          updated,
          candidates,
          bestTake,
          bestValue,
          title: updated
            ? label(`Cập nhật dp[${pileIndex + 1}][${used}] = ${bestValue}`, `Update dp[${pileIndex + 1}][${used}] = ${bestValue}`)
            : label(`Giữ dp[${pileIndex + 1}][${used}] = ${bestValue}`, `Keep dp[${pileIndex + 1}][${used}] = ${bestValue}`),
          vars: [
            { name: "previous", value: previous },
            { name: "prefix[take]", value: pileValue },
            { name: "candidate", value: total },
            { name: "updated", value: updated },
            { name: `dp[${pileIndex + 1}][${used}]`, value: bestValue },
          ],
          note: updated
            ? label(
              `${previous} + ${pileValue} = ${total} tốt hơn giá trị cũ, nên ghi vào ô DP.`,
              `${previous} + ${pileValue} = ${total} improves the old value, so write it to the DP cell.`,
            )
            : label(
              `${previous} + ${pileValue} = ${total} không tốt hơn ${bestValue}, nên giữ nguyên ô DP.`,
              `${previous} + ${pileValue} = ${total} does not improve ${bestValue}, so keep the DP cell.`,
            ),
        });
      }
    }
  }

  const selectedCounts = Array(n).fill(0);
  let remaining = k;
  for (let i = n; i >= 1; i--) {
    const take = choice[i][remaining];
    if (take < 0) throw new Error("Không thể dựng lại lựa chọn tối ưu cho input này");
    selectedCounts[i - 1] = take;
    remaining -= take;
  }

  const selectionText = selectedCounts
    .map((take, index) => `P${index + 1}: ${take}`)
    .join(", ");
  record({
    phase: "done",
    operation: "return-answer",
    line: 13,
    pileIndex: n - 1,
    used: k,
    selectedCounts,
    title: label(`Đáp án = ${dp[n][k]}`, `Answer = ${dp[n][k]}`),
    vars: [
      { name: "answer", value: dp[n][k] },
      { name: "take per pile", value: `[${selectedCounts.join(", ")}]` },
      { name: "coins taken", value: selectedCounts.reduce((sum, take) => sum + take, 0) },
    ],
    note: omitted
      ? label(
        `Trace dài đã được rút gọn, nhưng toàn bộ DP vẫn được tính. Truy vết một phương án tối ưu (${selectionText}) cho đúng ${k} coin, tổng giá trị ${dp[n][k]}.`,
        `The long trace was shortened, but the full DP was computed. One optimal reconstruction (${selectionText}) takes exactly ${k} coins for value ${dp[n][k]}.`,
      )
      : label(
        `Truy vết lựa chọn tốt nhất ở từng hàng: ${selectionText}. Tổng số coin là ${k}, tổng giá trị là ${dp[n][k]}.`,
        `Backtrack the best choice in each row: ${selectionText}. The selection uses ${k} coins with total value ${dp[n][k]}.`,
      ),
    final: true,
  });

  return { original: piles, k, selectedCounts, answer: dp[n][k], steps };
}

function buildSteps2218OneDimensional(input, params = {}) {
  const piles = parsePiles2218(input);
  const k = Number(params.k);
  const totalCoins = piles.reduce((total, pile) => total + pile.length, 0);
  if (!Number.isInteger(k) || k < 1 || k > MAX_K || k > totalCoins) {
    throw new Error(`k phải là số nguyên trong [1, min(${MAX_K}, tổng số coin=${totalCoins})]`);
  }

  const n = piles.length;
  const prefixes = piles.map(() => [0]);
  let dp = Array(k + 1).fill(Number.NEGATIVE_INFINITY);
  let newDp = null;
  const steps = [];
  let omitted = false;

  const displayRow = (row) => row.map((value) => Number.isFinite(value) ? value : "·");
  const displayDp = () => newDp === null ? [displayRow(dp)] : [displayRow(dp), displayRow(newDp)];
  const rowLabels = () => newDp === null ? ["dp"] : ["dp (previous)", "new_dp"];
  const pileData = () => piles.map((coins, index) => ({
    index,
    coins: [...coins],
    prefix: [...prefixes[index]],
  }));

  function record(options) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const candidates = (options.candidates || []).map((candidate) => ({
      ...candidate,
      coins: [...candidate.coins],
    }));
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeBlock: 2,
      codeLines: [options.line],
      vars: options.vars || [],
      note: options.note,
      coins2218View: {
        approach: 2,
        phase: options.phase,
        operation: options.operation,
        n,
        k,
        totalCoins,
        piles: pileData(),
        pileIndex: options.pileIndex ?? null,
        used: options.used ?? null,
        coinIndex: options.coinIndex ?? null,
        take: options.take ?? null,
        sourceCoins: options.sourceCoins ?? null,
        reachable: options.reachable ?? null,
        updated: options.updated ?? null,
        candidates,
        bestTake: options.bestTake ?? null,
        bestValue: options.bestValue ?? null,
        dp: displayDp(),
        dpRowLabels: rowLabels(),
        selectedCounts: null,
        answer: options.final ? dp[k] : null,
        omitted,
      },
    });
  }

  record({
    phase: "init",
    operation: "bind-class",
    line: 1,
    title: label("Khai báo lớp Solution", "Bind the Solution class"),
    vars: [{ name: "piles", value: n }, { name: "k", value: k }],
    note: label("Cách 2 nén bảng DP xuống một chiều.", "Approach 2 compresses the DP table to one dimension."),
  });
  record({
    phase: "init",
    operation: "enter-method",
    line: 2,
    title: label("Gọi maxValueOfCoins", "Enter maxValueOfCoins"),
    vars: [{ name: "piles", value: n }, { name: "k", value: k }],
    note: label(`Cần lấy đúng ${k} coin từ ${n} pile.`, `Take exactly ${k} coins from ${n} piles.`),
  });
  record({
    phase: "init",
    operation: "set-negative-infinity",
    line: 3,
    title: label("Đặt NEG_INF = −∞", "Set NEG_INF = −∞"),
    vars: [{ name: "NEG_INF", value: "−∞" }],
    note: label("−∞ phân biệt trạng thái chưa thể lấy đúng số coin yêu cầu.", "−∞ marks an exact-count state that is not reachable yet."),
  });
  record({
    phase: "init",
    operation: "allocate-dp",
    line: 4,
    title: label("Khởi tạo dp một chiều bằng −∞", "Allocate the one-dimensional dp with −∞"),
    vars: [{ name: "dp length", value: k + 1 }, { name: "k", value: k }],
    note: label("dp[j] là tổng lớn nhất khi lấy đúng j coin từ các pile đã xử lý.", "dp[j] is the best value for taking exactly j coins from the processed piles."),
  });
  dp[0] = 0;
  record({
    phase: "init",
    operation: "seed-base-case",
    line: 5,
    title: label("dp[0] = 0", "dp[0] = 0"),
    vars: [{ name: "dp[0]", value: 0 }],
    note: label("Lấy đúng 0 coin có tổng bằng 0; các số lượng khác vẫn chưa thể đạt tới.", "Taking exactly zero coins has value 0; every other count remains unreachable."),
  });

  for (let pileIndex = 0; pileIndex < n; pileIndex++) {
    const pile = piles[pileIndex];
    record({
      phase: "pile",
      operation: "select-pile",
      line: 7,
      pileIndex,
      title: label(`Bắt đầu pile ${pileIndex + 1}`, `Start pile ${pileIndex + 1}`),
      vars: [{ name: "pile", value: `[${pile.join(", ")}]` }],
      note: label("Mỗi lựa chọn hợp lệ là một prefix của pile này.", "Every legal choice is a prefix of this pile."),
    });

    prefixes[pileIndex] = [0];
    record({
      phase: "pile",
      operation: "init-prefix",
      line: 8,
      pileIndex,
      title: label("prefix = [0]", "prefix = [0]"),
      vars: [{ name: "prefix", value: "[0]" }],
      note: label("Lấy 0 coin từ pile hiện tại có giá trị 0.", "Taking zero coins from this pile has value 0."),
    });

    for (let coinIndex = 0; coinIndex < pile.length; coinIndex++) {
      const coin = pile[coinIndex];
      record({
        phase: "pile",
        operation: "select-coin",
        line: 10,
        pileIndex,
        coinIndex,
        title: label(`Đọc coin ${coin}`, `Read coin ${coin}`),
        vars: [{ name: "coin", value: coin }, { name: "index", value: coinIndex }],
        note: label("Vòng lặp đọc coin tiếp theo từ trên xuống.", "The loop reads the next coin from top to bottom."),
      });
      prefixes[pileIndex].push(prefixes[pileIndex][prefixes[pileIndex].length - 1] + coin);
      record({
        phase: "pile",
        operation: "append-prefix",
        line: 11,
        pileIndex,
        coinIndex,
        title: label(`prefix[${coinIndex + 1}] = ${prefixes[pileIndex][coinIndex + 1]}`, `prefix[${coinIndex + 1}] = ${prefixes[pileIndex][coinIndex + 1]}`),
        vars: [{ name: "coin", value: coin }, { name: "prefix", value: `[${prefixes[pileIndex].join(", ")}]` }],
        note: label(`Đây là tổng khi lấy ${coinIndex + 1} coin trên cùng.`, `This is the value of taking the top ${coinIndex + 1} coin(s).`),
      });
    }

    newDp = [...dp];
    record({
      phase: "copy",
      operation: "copy-dp",
      line: 13,
      pileIndex,
      title: label("Sao chép dp sang new_dp", "Copy dp into new_dp"),
      vars: [{ name: "new_dp", value: `[${displayRow(newDp).join(", ")}]` }],
      note: label("Bản sao giữ sẵn trường hợp x = 0: không lấy coin từ pile hiện tại.", "The copy preserves the x = 0 case: take no coin from the current pile."),
    });

    for (let used = 1; used <= k; used++) {
      const candidates = [];
      let bestValue = newDp[used];
      let bestTake = Number.isFinite(bestValue) ? 0 : -1;
      if (Number.isFinite(bestValue)) {
        candidates.push({
          take: 0,
          sourceCoins: used,
          previous: dp[used],
          pileValue: 0,
          total: dp[used],
          coins: [],
          winner: true,
        });
      }
      record({
        phase: "state",
        operation: "select-used",
        line: 15,
        pileIndex,
        used,
        candidates,
        bestTake,
        bestValue: Number.isFinite(bestValue) ? bestValue : null,
        title: label(`Tính new_dp[${used}]`, `Compute new_dp[${used}]`),
        vars: [{ name: "j", value: used }, { name: "current", value: Number.isFinite(bestValue) ? bestValue : "−∞" }],
        note: label("Xét số coin cần lấy chính xác là j.", "Consider the exact target count j."),
      });

      const maxTake = Math.min(used, pile.length);
      for (let take = 1; take <= maxTake; take++) {
        const sourceCoins = used - take;
        record({
          phase: "state",
          operation: "select-take",
          line: 16,
          pileIndex,
          used,
          take,
          sourceCoins,
          candidates,
          bestTake,
          bestValue: Number.isFinite(bestValue) ? bestValue : null,
          title: label(`Thử x = ${take}`, `Try x = ${take}`),
          vars: [{ name: "j", value: used }, { name: "x", value: take }, { name: "j - x", value: sourceCoins }],
          note: label(`Thử lấy ${take} coin trên cùng của pile này.`, `Try taking the top ${take} coin(s) from this pile.`),
        });

        const previous = dp[sourceCoins];
        const reachable = Number.isFinite(previous);
        record({
          phase: "state",
          operation: reachable ? "reachable-source" : "unreachable-source",
          line: 17,
          pileIndex,
          used,
          take,
          sourceCoins,
          reachable,
          candidates,
          bestTake,
          bestValue: Number.isFinite(bestValue) ? bestValue : null,
          title: reachable
            ? label(`dp[${sourceCoins}] = ${previous} khả thi`, `dp[${sourceCoins}] = ${previous} is reachable`)
            : label(`dp[${sourceCoins}] = −∞`, `dp[${sourceCoins}] = −∞`),
          vars: [{ name: `dp[${sourceCoins}]`, value: reachable ? previous : "−∞" }, { name: "reachable", value: reachable }],
          note: reachable
            ? label("Nguồn khả thi nên chạy phép cập nhật ở dòng kế tiếp.", "The source is reachable, so execute the update on the next line.")
            : label("Nguồn chưa thể đạt tới nên bỏ qua phép cập nhật.", "The source is unreachable, so skip the update."),
        });
        if (!reachable) continue;

        const pileValue = prefixes[pileIndex][take];
        const total = previous + pileValue;
        const candidate = {
          take,
          sourceCoins,
          previous,
          pileValue,
          total,
          coins: pile.slice(0, take),
          winner: false,
        };
        candidates.push(candidate);
        const oldValue = newDp[used];
        const updated = total > oldValue;
        if (updated) {
          candidates.forEach((item) => { item.winner = false; });
          newDp[used] = total;
          bestValue = total;
          bestTake = take;
          candidate.winner = true;
        }
        record({
          phase: "state",
          operation: updated ? "update-cell" : "keep-cell",
          line: 18,
          pileIndex,
          used,
          take,
          sourceCoins,
          reachable: true,
          updated,
          candidates,
          bestTake,
          bestValue: Number.isFinite(newDp[used]) ? newDp[used] : null,
          title: updated
            ? label(`Cập nhật new_dp[${used}] = ${newDp[used]}`, `Update new_dp[${used}] = ${newDp[used]}`)
            : label(`Giữ new_dp[${used}] = ${Number.isFinite(newDp[used]) ? newDp[used] : "−∞"}`, `Keep new_dp[${used}] = ${Number.isFinite(newDp[used]) ? newDp[used] : "−∞"}`),
          vars: [
            { name: "new_dp[j] before", value: Number.isFinite(oldValue) ? oldValue : "−∞" },
            { name: "dp[j - x]", value: previous },
            { name: "prefix[x]", value: pileValue },
            { name: "candidate", value: total },
            { name: "updated", value: updated },
          ],
          note: updated
            ? label(`${previous} + ${pileValue} = ${total} tốt hơn giá trị cũ.`, `${previous} + ${pileValue} = ${total} improves the old value.`)
            : label(`${previous} + ${pileValue} = ${total} không tốt hơn giá trị đang có.`, `${previous} + ${pileValue} = ${total} does not improve the current value.`),
        });
      }
    }

    dp = newDp;
    newDp = null;
    record({
      phase: "copy",
      operation: "commit-dp",
      line: 23,
      pileIndex,
      title: label(`Gán dp = new_dp sau pile ${pileIndex + 1}`, `Assign dp = new_dp after pile ${pileIndex + 1}`),
      vars: [{ name: "dp", value: `[${displayRow(dp).join(", ")}]` }],
      note: label("Pile tiếp theo chỉ được đọc từ snapshot đã hoàn tất này.", "The next pile reads only from this completed snapshot."),
    });
  }

  record({
    phase: "done",
    operation: "return-answer",
    line: 25,
    pileIndex: n - 1,
    used: k,
    title: label(`Đáp án = ${dp[k]}`, `Answer = ${dp[k]}`),
    vars: [{ name: "dp[k]", value: dp[k] }, { name: "k", value: k }],
    note: omitted
      ? label("Trace dài đã được rút gọn, nhưng toàn bộ DP vẫn được tính và dp[k] là đáp án chính xác.", "The long trace was shortened, but the full DP was computed and dp[k] is the exact answer.")
      : label("Sau khi xử lý mọi pile, dp[k] là giá trị lớn nhất khi lấy đúng k coin.", "After every pile is processed, dp[k] is the maximum value for taking exactly k coins."),
    final: true,
  });

  return { original: piles, k, answer: dp[k], steps };
}

module.exports = {
  2218: {
    id: 2218,
    difficulty: "hard",
    slug: "maximum-value-of-k-coins-from-piles",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    ],
    title: label("Maximum Value of K Coins From Piles", "Maximum Value of K Coins From Piles"),
    titleVi: label("Giá trị lớn nhất khi lấy K đồng xu", "Maximum value from K coins"),
    statement: label(
      "Mỗi pile xếp từ trên xuống. Mỗi lần chỉ được lấy đồng xu trên cùng. Hãy lấy đúng k đồng xu trong tất cả các pile để tổng giá trị lớn nhất.",
      "Coins in each pile are ordered top to bottom, and only the top coin may be removed. Take exactly k coins across all piles to maximize total value.",
    ),
    defaultInput: "[[1,100,3],[7,8,9]]",
    inputKind: "string",
    inputLabel: label("piles: [[trên,...,dưới], ...]", "piles: [[top,...,bottom], ...]"),
    extraParams: [
      { key: "k", label: label("k (số coin phải lấy)", "k (exact coins to take)"), default: 2, min: 1, max: MAX_K },
      {
        key: "approach",
        label: label("Cách giải", "Approach"),
        type: "select",
        default: "1",
        options: [
          { value: "1", label: label("Cách 1: DP 2D + truy vết", "Approach 1: 2D DP + reconstruction") },
          { value: "2", label: label("Cách 2: DP 1D O(k)", "Approach 2: 1D DP O(k)") },
        ],
      },
    ],
    approach: [
      label("Tính prefix[t] cho mỗi pile: giá trị khi lấy đúng t coin trên cùng.", "Build prefix[t] for each pile: the value of taking exactly its top t coins."),
      label("dp[i][j] là giá trị lớn nhất khi lấy đúng j coin từ i pile đầu.", "dp[i][j] is the maximum value from exactly j coins using the first i piles."),
      label("Thử take coin ở pile hiện tại: dp[i][j] = max(dp[i−1][j−take] + prefix[take]).", "Try each take count in the current pile: dp[i][j] = max(dp[i−1][j−take] + prefix[take])."),
      label("Lưu lựa chọn tốt nhất để dựng lại số coin lấy từ từng pile.", "Store the best choice to reconstruct how many coins are taken from every pile."),
      label("Cách 2 dùng dp một chiều và new_dp riêng cho từng pile, giảm bộ nhớ xuống O(k) mà không tái sử dụng cùng một pile.", "Approach 2 uses one-dimensional dp and a separate new_dp per pile, reducing space to O(k) without reusing the same pile."),
    ],
    complexity: {
      time: "O(n · k · maxPile)",
      space: "O(n · k) / O(k)",
      note: label(
        "Cách 1 giữ bảng O(n·k) để truy vết; Cách 2 chỉ giữ dp và new_dp, mỗi mảng O(k).",
        "Approach 1 keeps an O(n·k) table for reconstruction; approach 2 keeps only dp and new_dp, each O(k).",
      ),
    },
    code: [
      "class Solution:",
      "    def maxValueOfCoins(self, piles, k):",
      "        n = len(piles)",
      "        dp = [[float('-inf')] * (k + 1) for _ in range(n + 1)]",
      "        dp[0][0] = 0",
      "        for i, pile in enumerate(piles, 1):",
      "            prefix = [0]",
      "            for coin in pile: prefix.append(prefix[-1] + coin)",
      "            for used in range(k + 1):",
      "                for take in range(min(len(pile), used) + 1):",
      "                    if dp[i - 1][used - take] != float('-inf'):",
      "                        dp[i][used] = max(dp[i][used], dp[i - 1][used - take] + prefix[take])",
      "        return dp[n][k]",
    ],
    code2: [
      "class Solution:",
      "    def maxValueOfCoins(self, piles: list[list[int]], k: int) -> int:",
      "        NEG_INF = float(\"-inf\")",
      "        dp = [NEG_INF] * (k + 1)",
      "        dp[0] = 0",
      "",
      "        for pile in piles:",
      "            prefix = [0]",
      "",
      "            for coin in pile:",
      "                prefix.append(prefix[-1] + coin)",
      "",
      "            new_dp = dp[:]",
      "",
      "            for j in range(1, k + 1):",
      "                for x in range(1, min(j, len(pile)) + 1):",
      "                    if dp[j - x] != NEG_INF:",
      "                        new_dp[j] = max(",
      "                            new_dp[j],",
      "                            dp[j - x] + prefix[x],",
      "                        )",
      "",
      "            dp = new_dp",
      "",
      "        return dp[k]",
    ],
    codeLabel: label("Cách 1 · DP 2D + truy vết", "Approach 1 · 2D DP + reconstruction"),
    code2Label: label("Cách 2 · DP 1D O(k)", "Approach 2 · 1D DP O(k)"),
    debugMode: "line-by-line",
    liveArgs: (input, params) => [parsePiles2218(input), Number(params.k)],
    builder: buildSteps2218,
    builder2: buildSteps2218OneDimensional,
  },
};
