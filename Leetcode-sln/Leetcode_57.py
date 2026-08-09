from typing import List


class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        merged = []
        for start, end in intervals:
            a1 = intervals[start]


sol = Solution()
sol.insert([[1,3],[6,9]], [2,5])
