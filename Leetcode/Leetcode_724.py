from typing import List

class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        s = sum(nums)
        sumleft = 0
        for i in range(len(nums)):
            if sumleft == (s - nums[i]) / 2:
                return i
            sumleft += nums[i]
        return -1
    
sol = Solution()
print(sol.pivotIndex([1,-1,4]))