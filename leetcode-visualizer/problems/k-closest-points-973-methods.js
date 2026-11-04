'use strict';
const bi=(vi,en)=>({vi,en}),code=s=>s.trim().split('\n');
const entries=`        entries = []
        for index, (x, y) in enumerate(points):
            d2 = x * x + y * y
            entries.append((d2, index, x, y))`;
const answer=`        answer = []
        for entry in entries[:k]:
            answer.append([entry[2], entry[3]])
        return answer`;
module.exports=[
 {label:bi('Max-heap giữ k điểm','Size-k max-heap'),time:'O(n log(k+1))',space:'O(k)',code:code(`
from heapq import heappush, heappop

class Solution:
    def kClosest(self, points, k):
        heap = []
        for index, (x, y) in enumerate(points):
            d2 = x * x + y * y
            heappush(heap, (-d2, -index, x, y))
            if len(heap) > k:
                removed = heappop(heap)
        answer = []
        for entry in heap:
            answer.append([entry[2], entry[3]])
        return answer`)},
 {label:bi('Sắp xếp theo khoảng cách²','Sort by squared distance'),time:'O(n log n)',space:'O(n)',code:code(`
class Solution:
    def kClosest(self, points, k):
${entries}
        entries.sort()
${answer}`)},
 {label:bi('Min-heap rồi lấy k điểm','Min-heap then k pops'),time:'O(n + k log n)',space:'O(n)',code:code(`
from heapq import heapify, heappop

class Solution:
    def kClosest(self, points, k):
        heap = []
        for index, (x, y) in enumerate(points):
            d2 = x * x + y * y
            heap.append((d2, index, x, y))
        heapify(heap)
        answer = []
        for take in range(k):
            entry = heappop(heap)
            answer.append([entry[2], entry[3]])
        return answer`)},
 {label:bi('Thư viện heapq.nsmallest','heapq.nsmallest'),time:'O(n log(k+1))',space:'O(k)',code:code(`
from heapq import nsmallest

class Solution:
    def kClosest(self, points, k):
        def distance(point):
            x, y = point
            return x * x + y * y
        answer = nsmallest(k, points, key=distance)
        return answer`)},
 {label:bi('Quickselect Lomuto','Lomuto quickselect'),time:'Average O(n), worst O(n²)',space:'O(n)',code:code(`
class Solution:
    def kClosest(self, points, k):
${entries}
        lo, hi = 0, len(entries) - 1
        target = k - 1
        while lo < hi:
            pivot_index = (lo + hi) // 2
            entries[pivot_index], entries[hi] = entries[hi], entries[pivot_index]
            pivot = entries[hi][0]
            store = lo
            for scan in range(lo, hi):
                if entries[scan][0] <= pivot:
                    entries[store], entries[scan] = entries[scan], entries[store]
                    store += 1
            entries[store], entries[hi] = entries[hi], entries[store]
            if store == target:
                break
            if store < target:
                lo = store + 1
            else:
                hi = store - 1
${answer}`)},
 {label:bi('Quickselect ba vùng','Three-way quickselect'),time:'Average O(n), worst O(n²)',space:'O(n)',code:code(`
class Solution:
    def kClosest(self, points, k):
${entries}
        lo, hi = 0, len(entries) - 1
        target = k - 1
        while lo <= hi:
            pivot = entries[(lo + hi) // 2][0]
            less, scan, greater = lo, lo, hi
            while scan <= greater:
                d2 = entries[scan][0]
                if d2 < pivot:
                    entries[less], entries[scan] = entries[scan], entries[less]
                    less += 1
                    scan += 1
                elif d2 > pivot:
                    entries[scan], entries[greater] = entries[greater], entries[scan]
                    greater -= 1
                else:
                    scan += 1
            if target < less:
                hi = less - 1
            elif target > greater:
                lo = greater + 1
            else:
                break
${answer}`)},
 {label:bi('Binary search khoảng cách²','Binary search squared radius'),time:'O(n log(D+1))',space:'O(n)',code:code(`
class Solution:
    def kClosest(self, points, k):
        entries = []
        high = 0
        for index, (x, y) in enumerate(points):
            d2 = x * x + y * y
            entries.append((d2, index, x, y))
            high = max(high, d2)
        low = 0
        while low < high:
            mid = (low + high) // 2
            count = 0
            for entry in entries:
                if entry[0] <= mid:
                    count += 1
            if count >= k:
                high = mid
            else:
                low = mid + 1
        threshold = low
        answer = []
        for entry in entries:
            if entry[0] < threshold:
                answer.append([entry[2], entry[3]])
        for entry in entries:
            if entry[0] == threshold and len(answer) < k:
                answer.append([entry[2], entry[3]])
        return answer`)},
];
