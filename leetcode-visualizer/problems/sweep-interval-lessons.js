'use strict';
const { lesson, rows, vector, sortedDisjoint } = require('./sweep-lesson');
const specs = [
  {
    id: 57, title: 'Insert Interval', slug: 'insert-interval', category: 'interval', tags: ['array'],
    fields: ['intervals', 'newInterval'], example: { intervals: [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval: [4,8] },
    kind: 'interval', picture: { lanes: ['intervals', 'newInterval', 'result'], closed: true },
    validate(intervals, newInterval) { sortedDisjoint(intervals); vector(newInterval, { min: 2, max: 2 }); rows([newInterval]); },
    statement: ['Chèn newInterval vào danh sách khoảng đóng đã sắp xếp, gộp các khoảng giao nhau.', 'Insert newInterval into sorted disjoint closed intervals and merge overlaps.'],
    hint: ['Giữ các khoảng bên trái → gộp phần giao → giữ phần bên phải.', 'Keep left intervals → merge overlaps → keep right intervals.'], time: 'O(n)', space: 'O(n)',
    source: `def insert(self, intervals, newInterval):
    result = []
    i = 0
    start, end = newInterval
    while i < len(intervals) and intervals[i][1] < start:
        result.append(intervals[i])
        i += 1
    while i < len(intervals) and intervals[i][0] <= end:
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    result.append([start, end])
    result.extend(intervals[i:])
    return result`,
  },
  {
    id: 435, title: 'Non-overlapping Intervals', slug: 'non-overlapping-intervals', category: 'greedy', tags: ['interval'],
    fields: ['intervals'], example: [[1,2],[2,3],[3,4],[1,3]], kind: 'interval', picture: { lanes: ['intervals', 'kept', 'removed'] },
    validate(intervals) { rows(intervals); if (intervals.some(([s,e]) => s === e)) throw Error('Use start < end.'); },
    statement: ['Xóa ít khoảng nhất để các khoảng còn lại không giao nhau. Hai khoảng chạm đầu mút được phép.', 'Remove the fewest intervals so the rest do not overlap. Touching endpoints are allowed.'],
    hint: ['Sắp theo điểm kết thúc; giữ khoảng kết thúc sớm nhất còn phù hợp.', 'Sort by end; keep the earliest finishing compatible interval.'], time: 'O(n log n)', space: 'O(n)',
    source: `def eraseOverlapIntervals(self, intervals):
    intervals.sort(key=lambda pair: pair[1])
    end = -inf
    kept = []
    removed = []
    for start, finish in intervals:
        if start >= end:
            kept.append([start, finish])
            end = finish
        else:
            removed.append([start, finish])
    return len(removed)`,
  },
  {
    id: 986, title: 'Interval List Intersections', slug: 'interval-list-intersections', category: 'two-pointer', tags: ['interval'],
    fields: ['firstList', 'secondList'], example: { firstList: [[0,2],[5,10],[13,23],[24,25]], secondList: [[1,5],[8,12],[15,24],[25,26]] },
    kind: 'interval', picture: { lanes: ['firstList', 'secondList', 'result'], closed: true },
    validate(a,b) { sortedDisjoint(a); sortedDisjoint(b); },
    statement: ['Tìm giao của hai danh sách khoảng đóng, mỗi danh sách đã sắp xếp và không giao nhau.', 'Intersect two sorted lists of disjoint closed intervals.'],
    hint: ['Lấy max(start), min(end); tiến con trỏ của khoảng kết thúc sớm hơn.', 'Take max(start), min(end); advance the interval that ends first.'], time: 'O(n + m)', space: 'O(n + m)',
    source: `def intervalIntersection(self, firstList, secondList):
    i = j = 0
    result = []
    while i < len(firstList) and j < len(secondList):
        start = max(firstList[i][0], secondList[j][0])
        end = min(firstList[i][1], secondList[j][1])
        if start <= end:
            result.append([start, end])
        if firstList[i][1] < secondList[j][1]:
            i += 1
        else:
            j += 1
    return result`,
  },
  {
    id: 228, title: 'Summary Ranges', slug: 'summary-ranges', difficulty: 'easy', category: 'array', tags: ['interval'],
    fields: ['nums'], example: [0,1,2,4,5,7], kind: 'array', picture: { arrays: ['nums'], results: ['result'] },
    validate(nums) { vector(nums); if (nums.some((x,i) => i && x <= nums[i-1])) throw Error('Use strictly increasing numbers.'); },
    statement: ['Tóm tắt dãy số nguyên tăng dần thành các khoảng liên tiếp nhỏ nhất.', 'Summarize a strictly increasing integer array into maximal consecutive ranges.'],
    hint: ['Đánh dấu đầu dãy; kéo dài khi số kế tiếp bằng số hiện tại + 1.', 'Mark each run start; extend while the next number is current + 1.'], time: 'O(n)', space: 'O(n)',
    source: `def summaryRanges(self, nums):
    result = []
    i = 0
    while i < len(nums):
        start = nums[i]
        while i + 1 < len(nums) and nums[i + 1] == nums[i] + 1:
            i += 1
        end = nums[i]
        result.append(str(start) if start == end else str(start) + "->" + str(end))
        i += 1
    return result`,
  },
];
module.exports = Object.fromEntries(specs.map(spec => [spec.id, lesson(spec)]));
