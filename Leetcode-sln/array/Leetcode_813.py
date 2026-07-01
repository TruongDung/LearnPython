from functools import lru_cache
from typing import List


class Solution:
    def largestSumOfAverages(self, nums: List[int], k: int) -> float:
        n = len(nums)
        prefix = [0.0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + nums[i]

        @lru_cache(None)
        def dp(start: int, groups: int) -> float:
            if groups == 1:
                return (prefix[n] - prefix[start]) / (n - start)
            best = 0.0
            for end in range(start + 1, n - groups + 2):
                avg = (prefix[end] - prefix[start]) / (end - start)
                best = max(best, avg + dp(end, groups - 1))
            return best

        return dp(0, k)


sol = Solution()
print(sol.largestSumOfAverages([9, 1, 2, 3, 9], 3))
