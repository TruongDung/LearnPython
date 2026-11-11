'use strict';

const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });

const CODE = `class Solution:
    def minimumCost(self, cost1, cost2, costBoth, need1, need2):
        matched = min(need1, need2)
        cover = max(need1, need2)
        candidates = sorted(set([0, matched, cover]))
        best = None
        best_plan = None
        for both_count in candidates:
            only1 = max(need1 - both_count, 0)
            only2 = max(need2 - both_count, 0)
            total_cost = both_count * costBoth + only1 * cost1 + only2 * cost2
            if best is None or total_cost < best:
                best = total_cost
                best_plan = (both_count, only1, only2)
        return best`;

function parse(input) {
  let values = input;
  try {
    if (typeof values === 'string') {
      const text = values.trim();
      values = text.startsWith('[')
        ? JSON.parse(text)
        : text.split(/[,\s;]+/).filter(Boolean).map(Number);
    }
  } catch {
    values = null;
  }
  if (!Array.isArray(values) || values.length !== 5 ||
      values.some(value => !Number.isSafeInteger(value)) ||
      values.slice(0, 3).some(value => value < 1 || value > 1e6) ||
      values.slice(3).some(value => value < 0 || value > 1e9)) {
    throw new RangeError('3789: Enter cost1,cost2,costBoth,need1,need2 within the problem constraints.');
  }
  return [...values];
}

function tracePayload(input) {
  return {
    code: CODE,
    method: 'minimumCost',
    args: parse(input),
  };
}

function build(input) {
  const [cost1, cost2, costBoth, need1, need2] = parse(input);
  const code = CODE.split('\n');
  const native = runTrace({ code: CODE, method: 'minimumCost', args: [cost1, cost2, costBoth, need1, need2] });
  const matched = Math.min(need1, need2);
  const cover = Math.max(need1, need2);
  const quantities = [...new Set([0, matched, cover])].sort((a, b) => a - b);
  const plans = quantities.map(bothCount => ({
    bothCount,
    only1: null,
    only2: null,
    total1: null,
    total2: null,
    cost: null,
    status: 'pending',
    step: null,
  }));
  let active = null;
  let winner = null;
  const steps = native.events.map((event, index) => {
    const locals = event.locals;
    const source = code[event.line - 1].trim();
    const final = index === native.events.length - 1;
    const finalPlan = locals.best_plan ?? [0, 0, 0];
    let action = 'setup';
    if (source === 'for both_count in candidates:') {
      active = event.branch ? locals.both_count : null;
      action = event.branch ? 'candidate' : 'compare';
    }
    if (source === 'only1 = max(need1 - both_count, 0)') action = 'remaining1';
    if (source === 'only2 = max(need2 - both_count, 0)') action = 'remaining2';
    if (source === 'total_cost = both_count * costBoth + only1 * cost1 + only2 * cost2') {
      action = 'cost';
      const plan = plans.find(item => item.bothCount === locals.both_count);
      Object.assign(plan, {
        only1: locals.only1,
        only2: locals.only2,
        total1: locals.both_count + locals.only1,
        total2: locals.both_count + locals.only2,
        cost: locals.total_cost,
        status: 'computed',
        step: index,
      });
    }
    if (source === 'best = total_cost') {
      action = 'best';
      winner = locals.both_count;
      plans.forEach(plan => {
        if (plan.status === 'winner') plan.status = 'computed';
      });
      plans.find(plan => plan.bothCount === winner).status = 'winner';
    }
    if (final) {
      action = 'done';
      winner = finalPlan[0];
    }
    const candidate = active === null ? null : plans.find(plan => plan.bothCount === active);
    const view = {
      id: 3789,
      inputs: { cost1, cost2, costBoth, need1, need2 },
      matched,
      cover,
      candidates: plans.map(plan => ({ ...plan })),
      active,
      candidate: candidate ? { ...candidate } : null,
      winner,
      action,
      source,
      line: event.line,
      answer: final ? native.answer : null,
      bestPlan: final ? [...finalPlan] : null,
      final,
    };
    const title = {
      setup: bi('Chuẩn bị các điểm cần so sánh', 'Set up the candidate breakpoints'),
      candidate: bi(`Thử ${active} món loại 3`, `Try ${active} type-3 items`),
      compare: bi('So sánh các phương án', 'Compare the candidate plans'),
      remaining1: bi('Tính số món loại 1 còn thiếu', 'Compute remaining type-1 items'),
      remaining2: bi('Tính số món loại 2 còn thiếu', 'Compute remaining type-2 items'),
      cost: bi('Tính tổng chi phí phương án', 'Calculate this plan’s total cost'),
      best: bi('Cập nhật phương án rẻ nhất', 'Update the cheapest plan'),
      done: bi(`Chi phí tối thiểu: ${native.answer}`, `Minimum cost: ${native.answer}`),
    }[action];
    const note = {
      setup: bi(
        `Loại 3 đáp ứng đồng thời cả hai nhu cầu. Chỉ cần xét số lượng 0, min(${need1}, ${need2}) = ${matched}, hoặc max(${need1}, ${need2}) = ${cover}.`,
        `Type 3 contributes to both needs. Check only 0, min(${need1}, ${need2}) = ${matched}, and max(${need1}, ${need2}) = ${cover}.`,
      ),
      candidate: bi(
        `Giả sử mua ${active} món loại 3; từ đó tính chính xác phần còn thiếu cho từng loại.`,
        `Assume we buy ${active} type-3 items, then calculate exactly what remains for each type.`,
      ),
      compare: bi(
        `Đã tính ${plans.filter(plan => plan.cost !== null).length} trong ${plans.length} phương án ứng viên.`,
        `Calculated ${plans.filter(plan => plan.cost !== null).length} of ${plans.length} candidate plans.`,
      ),
      remaining1: bi(
        `Nhu cầu loại 1 còn max(${need1} − ${locals.both_count}, 0) = ${locals.only1}.`,
        `Type-1 need remaining: max(${need1} − ${locals.both_count}, 0) = ${locals.only1}.`,
      ),
      remaining2: bi(
        `Nhu cầu loại 2 còn max(${need2} − ${locals.both_count}, 0) = ${locals.only2}.`,
        `Type-2 need remaining: max(${need2} − ${locals.both_count}, 0) = ${locals.only2}.`,
      ),
      cost: bi(
        `${locals.both_count} × ${costBoth} + ${locals.only1} × ${cost1} + ${locals.only2} × ${cost2} = ${locals.total_cost}.`,
        `${locals.both_count} × ${costBoth} + ${locals.only1} × ${cost1} + ${locals.only2} × ${cost2} = ${locals.total_cost}.`,
      ),
      best: bi(
        `So far, ${locals.best} là chi phí thấp nhất.`,
        `So far, ${locals.best} is the lowest cost.`,
      ),
      done: bi(
        `Chọn ${finalPlan[0]} món loại 3, ${finalPlan[1]} món loại 1 và ${finalPlan[2]} món loại 2.`,
        `Choose ${finalPlan[0]} type-3 items, ${finalPlan[1]} type-1 items, and ${finalPlan[2]} type-2 items.`,
      ),
    }[action];
    return {
      arr: [],
      codeBlock: 1,
      codeLines: [event.line],
      final,
      title,
      note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value, rawValue: value })),
      cost3789View: view,
    };
  });
  return { original: parse(input), answer: native.answer, steps };
}

module.exports = {
  3789: {
    id: 3789,
    slug: 'minimum-cost-to-acquire-required-items',
    difficulty: 'medium',
    category: { key: 'math', vi: 'Toán học', en: 'Math' },
    tags: [{ key: 'greedy', vi: 'Tham lam', en: 'Greedy' }],
    title: bi('Minimum Cost to Acquire Required Items', 'Minimum Cost to Acquire Required Items'),
    titleVi: bi('Chi phí tối thiểu để mua đủ vật phẩm', 'Minimum cost to acquire required items'),
    statement: bi(
      'Có ba loại vật phẩm: loại 1 chỉ đáp ứng nhu cầu 1, loại 2 chỉ đáp ứng nhu cầu 2, loại 3 đáp ứng cả hai. Mua đủ ít nhất need1 và need2 với chi phí nhỏ nhất.',
      'There are three item types: type 1 satisfies need 1, type 2 satisfies need 2, and type 3 satisfies both. Meet need1 and need2 at minimum cost.',
    ),
    inputKind: 'string',
    defaultInput: '3,2,1,3,2',
    inputLabel: bi('cost1,cost2,costBoth,need1,need2', 'cost1,cost2,costBoth,need1,need2'),
    debugMode: 'line-by-line',
    code: CODE.split('\n'),
    builder: build,
    liveArgs: input => parse(input),
    tracePayload,
    allowEmptyInput: false,
    approach: [
      bi('Xét số lượng món loại 3 tại các điểm gãy 0, min(need1, need2), max(need1, need2). Với mỗi phương án, mua phần thiếu bằng loại 1 và 2 rồi chọn chi phí nhỏ nhất.',
        'Evaluate type-3 quantities at the breakpoints 0, min(need1, need2), and max(need1, need2). Fill any remaining needs with types 1 and 2, then choose the cheapest plan.'),
      bi('Khi số món loại 3 tăng, chi phí là hàm tuyến tính giữa hai điểm gãy; sau max(need1, need2), mỗi món chỉ làm tăng chi phí. Vì vậy nghiệm tối ưu nằm tại một trong ba điểm trên.',
        'As the type-3 count increases, cost is linear between breakpoints; beyond max(need1, need2), every extra item only increases cost. Thus an optimum is among these three candidates.'),
    ],
    complexity: { time: 'O(1)', space: 'O(1)', note: bi('So sánh tối đa ba phương án.', 'Compare at most three candidate plans.') },
    visualizationLimits: { completeTrace: true },
  },
};
