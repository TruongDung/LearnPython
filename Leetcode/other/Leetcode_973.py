import heapq
from typing import List


class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []

        for x, y in points:
            dist = x * x + y * y
            heapq.heappush(heap, (dist, [x, y]))

        res = []

        for _ in range(k):
            dist, point = heapq.heappop(heap)
            res.append(point)

        return res
