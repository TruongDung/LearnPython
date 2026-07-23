from collections import Counter
from typing import List
import heapq

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:

        #c1

        # freq = Counter(nums)
        # heap = []
        # for num, count in freq.items():
        #     heapq.heappush(heap, (-count, num))

        # result = []
        # for _ in range(k):
        #     num, count = heapq.heappop(heap)
        #     result.append(num)

        # return result

        #c2
        freq = Counter(nums)

        heap = []

        for num, count in freq.items():
            heapq.heappush(heap, (count, num))

            if len(heap) > k:
                heapq.heappop(heap)

        return [num for count, num in heap]

sol = Solution()
print(sol.topKFrequent([1,2,1,2,1,2,3,1,3,2], 2))