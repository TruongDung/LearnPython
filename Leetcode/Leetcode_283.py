from typing import List

class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        left = 0
        right = 0
        while(right< len(nums)):
            if(nums[right] !=0):
                nums[left] , nums[right]= nums[right], nums[left]
                left += 1
            right += 1

        
sol = Solution()
print(sol.moveZeroes([0,1,0,3,12]))
    