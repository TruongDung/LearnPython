from typing import List

class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        total = sum(nums)
        left = 0
        for i, x in enumerate(nums):
            if left == total - left - x:
                return i
            left += x
        return -1
    
sol = Solution()
print(sol.pivotIndex([1,7,3,6,5,6]))