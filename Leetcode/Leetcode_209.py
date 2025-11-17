from typing import List

class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        j = 0
        total = 0
        min_len = float('inf')

        for i in range(len(nums)):
            total += nums[i]

            while total >= target:
                min_len = min(min_len, i - j + 1)
                total -= nums[j]
                j += 1

        return 0 if min_len == float('inf') else min_len
    

sol = Solution()
print(sol.minSubArrayLen(7,[2,3,1,2,4,3]))