from collections import defaultdict


class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        majority = nums[0]
        count = 1

        for i in range(1,len(nums)):
            if count == 0:
                count = 1
                majority = nums[i]
            elif majority != nums[i]:
                count -= 1
            else:
                count += 1
        
        return majority
sol = Solution()
print(sol.majorityElement([2,2,1,1,1,2,2]))