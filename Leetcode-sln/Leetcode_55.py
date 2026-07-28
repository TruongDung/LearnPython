from typing import List


class Solution:
    def canJump(self, nums: List[int]) -> bool:
        farthest = 0
        for i, jump in enumerate(nums):
            # If i is beyond the farthest reachable index, we're stuck
            if i > farthest:
                return False
            farthest = max(farthest, i + jump)
            if farthest >= len(nums) - 1:
                return True
        return True


sol = Solution()
print(sol.canJump([2, 3, 1, 1, 4]))  # True
print(sol.canJump([3, 2, 1, 0, 4]))  # False
