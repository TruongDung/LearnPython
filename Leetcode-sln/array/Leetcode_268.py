from typing import List


class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        n = len(nums)
        # XOR all indices 0..n and all values; the missing number remains
        result = n
        for i, num in enumerate(nums):
            result ^= i ^ num
        return result


sol = Solution()
print(sol.missingNumber([3, 0, 1]))          # 2
print(sol.missingNumber([0, 1]))             # 2
print(sol.missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1]))  # 8
