from typing import List

class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        j = 0
        for i in range(len(nums)):
            if nums[i] != 0:
                #swap
                nums[j], nums[i] = nums[i], nums[j]
                j += 1
        return nums

       

        
sol = Solution()
print(sol.moveZeroes([0,1,0,3,12]))
    