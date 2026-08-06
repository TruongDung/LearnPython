from typing import List


class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        n = len(nums)
        if n < k:
            return 0

        p = [0] * (n + 1)
        for i in range(n):
            p[i + 1] = p[i] + nums[i]

        max_sum = float('-inf')

        for i in range(k, n+1):
            current_sum = p[i] - p[i-k]
            max_sum = max(max_sum, current_sum)

        return max_sum/k

sol = Solution()
print(sol.findMaxAverage([1,12,-5,-6,50,3], 4))