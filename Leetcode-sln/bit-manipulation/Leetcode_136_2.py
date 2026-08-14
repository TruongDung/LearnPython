from typing import List


class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        # XOR cancels pairs (a ^ a = 0); the lone number remains
        for num in nums:
            result ^= num
        return result


sol = Solution()
print(sol.singleNumber([2, 2, 1]))        # 1
print(sol.singleNumber([4, 1, 2, 1, 2]))  # 4
print(sol.singleNumber([1]))              # 1
