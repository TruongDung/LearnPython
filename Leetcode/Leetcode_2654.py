import math
from typing import List

class Solution:
    def minOperations(self, nums: List[int]) -> int:
        n = len(nums)
        ones = nums.count(1)
        if ones > 0:
            return n - ones

        minOps = math.inf

        for i, g in enumerate(nums):
            for j in range(i + 1, n):
                g = math.gcd(g, nums[j])
                if g == 1:   # gcd(nums[i..j]:== 1
                    minOps = min(minOps, j - i)
                    break

        return -1 if minOps == math.inf else minOps + n - 1
    
sol = Solution()
sol.minOperations([2,6,3,4])