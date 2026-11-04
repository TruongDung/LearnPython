'use strict';
const bi=(vi,en)=>({vi,en}),code=s=>s.trim().split('\n');
const starts=`        starts = []
        for index, (start, end) in enumerate(intervals):
            starts.append((start, index))
        starts.sort()`;
module.exports=[
 {label:bi('Sắp xếp + binary search','Sort + binary search'),time:'O(n log n)',space:'O(n)',code:code(`
class Solution:
    def findRightInterval(self, intervals):
${starts}
        answer = [-1] * len(intervals)
        for i, (start, end) in enumerate(intervals):
            lo, hi = 0, len(starts)
            while lo < hi:
                mid = (lo + hi) // 2
                if starts[mid][0] < end:
                    lo = mid + 1
                else:
                    hi = mid
            if lo < len(starts):
                answer[i] = starts[lo][1]
            else:
                answer[i] = -1
        return answer`)},
 {label:bi('bisect_left','bisect_left'),time:'O(n log n)',space:'O(n)',code:code(`
from bisect import bisect_left

class Solution:
    def findRightInterval(self, intervals):
${starts}
        answer = [-1] * len(intervals)
        for i, (start, end) in enumerate(intervals):
            pos = bisect_left(starts, (end, -1))
            if pos < len(starts):
                answer[i] = starts[pos][1]
            else:
                answer[i] = -1
        return answer`)},
 {label:bi('Sắp xếp hai đầu + hai con trỏ','Sort starts/ends + two pointers'),time:'O(n log n)',space:'O(n)',code:code(`
class Solution:
    def findRightInterval(self, intervals):
        starts, ends = [], []
        for index, (start, end) in enumerate(intervals):
            starts.append((start, index))
            ends.append((end, index))
        starts.sort()
        ends.sort()
        answer = [-1] * len(intervals)
        j = 0
        for end, i in ends:
            while j < len(starts) and starts[j][0] < end:
                j += 1
            if j < len(starts):
                answer[i] = starts[j][1]
            else:
                answer[i] = -1
        return answer`)},
 {label:bi('Hai min-heap','Two min-heaps'),time:'O(n log n)',space:'O(n)',code:code(`
from heapq import heappush, heappop

class Solution:
    def findRightInterval(self, intervals):
        starts, ends = [], []
        for index, (start, end) in enumerate(intervals):
            heappush(starts, (start, index))
            heappush(ends, (end, index))
        answer = [-1] * len(intervals)
        while ends:
            end, i = heappop(ends)
            while starts and starts[0][0] < end:
                removed = heappop(starts)
            if starts:
                answer[i] = starts[0][1]
            else:
                answer[i] = -1
        return answer`)},
 {label:bi('BST cân bằng + lower bound','Balanced BST + lower bound'),time:'O(n log n)',space:'O(n)',code:code(`
class Solution:
    def findRightInterval(self, intervals):
${starts}
        def build(lo, hi):
            if lo >= hi:
                return None
            mid = (lo + hi) // 2
            node = (starts[mid][0], starts[mid][1], build(lo, mid), build(mid + 1, hi))
            return node
        tree = build(0, len(starts))
        answer = [-1] * len(intervals)
        for i, (start, end) in enumerate(intervals):
            node = tree
            candidate = -1
            while node is not None:
                value, original, left_child, right_child = node
                if value >= end:
                    candidate = original
                    node = left_child
                else:
                    node = right_child
            answer[i] = candidate
        return answer`)},
 {label:bi('Nén tọa độ + suffix','Coordinate compression + suffix'),time:'O(n log n)',space:'O(n)',code:code(`
class Solution:
    def findRightInterval(self, intervals):
        coords = []
        for start, end in intervals:
            coords.append(start)
            coords.append(end)
        coords = sorted(set(coords))
        position = {}
        for p, value in enumerate(coords):
            position[value] = p
        next_index = [-1] * len(coords)
        for index, (start, end) in enumerate(intervals):
            next_index[position[start]] = index
        for p in range(len(coords) - 2, -1, -1):
            if next_index[p] == -1:
                next_index[p] = next_index[p + 1]
        answer = []
        for i, (start, end) in enumerate(intervals):
            answer.append(next_index[position[end]])
        return answer`)},
 {label:bi('Vét cạn mọi ứng viên','Brute-force candidates'),time:'O(n²)',space:'O(n)',code:code(`
class Solution:
    def findRightInterval(self, intervals):
        answer = []
        for i, (start, end) in enumerate(intervals):
            best_start = float('inf')
            candidate = -1
            for j, (next_start, _) in enumerate(intervals):
                if next_start >= end and next_start < best_start:
                    best_start = next_start
                    candidate = j
            answer.append(candidate)
        return answer`)},
];
