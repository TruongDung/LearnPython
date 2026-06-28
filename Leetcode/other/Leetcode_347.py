from ast import List
import heapq
from typing import Counter


class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        pq = []
        counter = Counter(nums)
        for num in nums:
            heapq.heappush(pq, nums)
