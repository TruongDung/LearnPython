from typing import List
import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        # heap = []
        # for num in nums:
        #     heapq.heappush(heap, -num)

        # return -heap[k-1]

        heap = []

        for num in nums:
            heapq.heappush(heap, num)

            if len(heap) > k:
                heapq.heappop(heap)

        return heap[0]

sol = Solution()
print(sol.findKthLargest([3,2,3,1,2,4,5,5,6], 4))  # Output: 4
