'use strict';

const bi = (vi, en) => ({ vi, en });
const CODE = [
  'class Solution:',
  '    def deleteAndEarn(self, nums):',
  '        largest = max(nums)',
  '        points = [0] * (largest + 1)',
  '        for value in nums:',
  '            points[value] += value',
  '        dp = [0] * (largest + 1)',
  '        dp[1] = points[1]',
  '        for value in range(2, largest + 1):',
  '            skip = dp[value - 1]',
  '            take = dp[value - 2] + points[value]',
  '            dp[value] = max(skip, take)',
  '        return dp[largest]',
];

function parse(nums) {
  if (!Array.isArray(nums) || !nums.length || nums.length > 20000
    || nums.some(value => !Number.isInteger(value) || value < 1 || value > 10000)) {
    throw new Error('740: nums cần 1..20000 số nguyên trong [1, 10000]. / Use 1..20000 integers in [1, 10000].');
  }
  return nums;
}

function buildSteps(input) {
  const nums = parse(input), largest = Math.max(...nums);
  const counts = Array(largest + 1).fill(0), points = Array(largest + 1).fill(0);
  const totalCounts = Array(largest + 1).fill(0);
  for (const value of nums) totalCounts[value]++;
  const values = totalCounts.flatMap((count, value) => count ? [value] : []);
  const dp = Array(largest + 1).fill(0), took = Array(largest + 1).fill(false);
  const detailed = nums.length <= 40 && largest <= 40;
  const sampled = new Set(values.length <= 12 ? values : [...values.slice(0,6), ...values.slice(-6)]);
  const steps = [];
  let processed = 0, activeIndex = null, current = null, choice = null, take = null, skip = null;
  let pyLargest = null, value = null, pointsReady = false, dpReady = false, settled = -1;
  let skipReady = false, takeReady = false;
  const plan = limit => {
    const selected = [];
    for (let value = limit; value >= 1;) {
      if (took[value]) { selected.push(value); value -= 2; }
      else value--;
    }
    return selected.reverse();
  };
  const compactPlan = selected => ({
    values: (selected.length <= 12 ? selected : [...selected.slice(0,6),...selected.slice(-6)])
      .map(value => ({ value, points: points[value], count: counts[value] })),
    omitted: Math.max(0,selected.length-12),
  });
  const emit = (line, phase, event, pending = null, nextIndex = null) => {
    if (!detailed) {
      if (line === 5 && nextIndex !== null && nextIndex >= 2 && nextIndex < nums.length-2) return;
      if (line === 6 && activeIndex >= 2 && activeIndex < nums.length-2) return;
      if ([9,10,11,12].includes(line) && current !== null && current > 1 && !sampled.has(current)) return;
    }
    const final = phase === 'done';
    const selected = plan(Math.max(0,settled));
    const chosenSet = new Set(selected);
    const center = Math.max(0,values.indexOf(current ?? nums[activeIndex ?? 0]));
    const start = Math.max(0,Math.min(values.length-11,center-5));
    // Show an honest window, not 10,001 mostly empty columns.
    const visible = values.length <= 11 ? values : final ? [...values.slice(0,6),...values.slice(-5)] : values.slice(start,start+11);
    const buckets = visible.map(value => ({ value, rank: values.indexOf(value), count: pointsReady ? counts[value] : null, points: pointsReady ? points[value] : null,
      totalCount: totalCounts[value], dp: value <= settled ? dp[value] : null,
      selected: chosenSet.has(value), blocked: chosenSet.has(value-1)||chosenSet.has(value+1),
    }));
    steps.push({
      title: bi(`L${line} · ${event.vi}`, `L${line} · ${event.en}`), note: bi('',''),
      codeLines: [line], codeBlock: 1, debugLine: line, final, arr: [], highlight: [], mark: [],
      vars: Object.entries({ largest: pyLargest, value, skip, take }).filter(([,val])=>val!==null).map(([name,value])=>({name,value})),
      earn740PictureView: {
        phase, line, source: CODE[line-1], timing: 'before', event, detailed, n: nums.length, largest,
        pending, nextIndex, pointsReady, dpReady,
        pythonLocals: { largest: pyLargest, value, skip, take,
          points: detailed && pointsReady ? [...points] : null,
          dp: detailed && dpReady ? [...dp] : null },
        processed, activeIndex, activeValue: activeIndex === null ? null : nums[activeIndex],
        input: nums.slice(0,40), omittedInput: Math.max(0,nums.length-40),
        buckets, omittedBuckets: values.length-visible.length, totalBuckets: values.length,
        current, take: takeReady ? take : null, skip: skipReady ? skip : null, choice, settled,
        best: settled < 0 ? null : dp[settled],
        selected: compactPlan(selected),
        candidates: current !== null && current >= 2 && ['skip','compare','choose'].includes(phase) ? {
          skip: compactPlan(plan(current-1)),
          take: compactPlan([...plan(current-2), ...(points[current] ? [current] : [])]),
          base: dp[current-2], gain: points[current],
          blocked: counts[current-1] ? current-1 : null,
        } : null,
        answer: final ? dp[largest] : null,
      },
    });
  };
  // Match Python's line events: each snapshot is BEFORE the highlighted line.
  emit(3,'setup',bi('Tìm số lớn nhất','Find the largest value'),{target:'largest',before:null,after:largest});
  pyLargest = largest;
  emit(4,'setup',bi('Tạo các cột điểm','Allocate point buckets'),{target:'points',before:null,after:`[0] × ${largest+1}`});
  pointsReady = true;
  for (let index = 0; index < nums.length; index++) {
    emit(5,'read',bi('Đọc số tiếp theo','Read the next number'),{target:'value',before:value,after:nums[index]},index);
    value = nums[index]; activeIndex = index;
    emit(6,'group',bi(`Gom ${value} vào cột ${value}`,`Add ${value} to column ${value}`),
      {target:`points[${value}]`,before:points[value],after:points[value]+value,kind:'points',value});
    counts[nums[index]]++; points[nums[index]] += nums[index]; processed++;
  }
  emit(5,'group-end',bi('Đã gom hết các số','All numbers grouped'));
  activeIndex = null;
  emit(7,'ready',bi('Tạo bảng điểm tốt nhất','Allocate the best-score table'),{target:'dp',before:null,after:`[0] × ${largest+1}`});
  dpReady = true; settled = 0; current = 1;
  emit(8,'base',bi('Giá trị 1: lấy hết','Value 1: take all'),{target:'dp[1]',before:0,after:points[1],kind:'dp',value:1});
  dp[1] = points[1]; took[1] = points[1] > 0; settled = 1;
  for (let next = 2; next <= largest; next++) {
    emit(9,current>1?'choose':'loop',bi('Sang giá trị tiếp theo','Move to the next value'),{target:'value',before:value,after:next});
    current = next; value = next; choice = null; skipReady = false; takeReady = false;
    emit(10,'loop',bi(`Bỏ ${current}: giữ điểm trước`,`Skip ${current}: keep the previous score`),{target:'skip',before:skip,after:dp[current-1]});
    skip = dp[current-1]; skipReady = true;
    emit(11,'skip',bi(`Lấy ${current}: bỏ hàng xóm ${current-1}`,`Take ${current}: skip neighbor ${current-1}`),{target:'take',before:take,after:dp[current-2]+points[current]});
    take = dp[current-2]+points[current]; takeReady = true;
    emit(12,'compare',bi('Ghi điểm lớn hơn','Write the larger score'),{target:`dp[${current}]`,before:dp[current],after:Math.max(skip,take),kind:'dp',value:current});
    dp[current] = Math.max(skip,take); took[current] = take > skip;
    choice = took[current] ? 'take' : 'skip'; settled = current;
  }
  emit(9,current>1?'choose':'loop',bi('Đã xét hết các giá trị','All values processed'));
  emit(13,'done',bi(`Thu được ${dp[largest]} điểm`,`Collect ${dp[largest]} points`));
  return { original: [...nums], answer: dp[largest], chosen: plan(largest), steps };
}

module.exports = { 740: {
  ...require('./dp')[740],
  defaultInput: [2,2,3,3,3,4], code: CODE, builder: buildSteps,
  debugMode: 'line', liveArgs: input => [[...parse(input)]],
  inputLabel: bi('nums · các số nguyên dương','nums · positive integers'),
  limits: { maxLength: 20000, maxValue: 10000 },
  approach: [
    bi('Cùng số → gom điểm: 3 + 3 + 3 = 9.','Equal numbers → group points: 3 + 3 + 3 = 9.'),
    bi('Lấy 3 → mất mọi 2 và 4. Lấy 2 và 4 cùng nhau thì được.','Take 3 → lose all 2s and 4s. Taking 2 and 4 together is allowed.'),
    bi('Mỗi cột: so sánh BỎ với LẤY + điểm tốt nhất cách hai giá trị.','Each column: compare SKIP with TAKE + the best score two values back.'),
  ],
} };
