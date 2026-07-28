import heapq
import math
from typing import List


class Solution:
    def pickGifts(self, gifts: List[int], k: int) -> int:
        # Max-heap via negatives
        heap = [-g for g in gifts]
        heapq.heapify(heap)

        for _ in range(k):
            largest = -heapq.heappop(heap)
            # Leave floor(sqrt(largest)) gifts behind
            heapq.heappush(heap, -math.isqrt(largest))

        return -sum(heap)


sol = Solution()
print(sol.pickGifts([25, 64, 9, 4, 100], 4))  # 29
print(sol.pickGifts([1, 1, 1, 1], 4))         # 4
