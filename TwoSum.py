
from typing import List
class Solution:
    def TwoSumDef(self, nums: List[int], target:int) -> List[int]:
        seen = {}
        for i, n in enumerate(nums):
            complement = target - n
            if complement in seen:
                return [seen[complement], i]
            seen[n] = i
        return seen
    
#if __name__ == "__main__":
sol = Solution()
print(sol.TwoSumDef([2,7,11,15], 9))