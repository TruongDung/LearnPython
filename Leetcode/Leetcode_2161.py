from typing import List


class Solution:
    def pivotArray(self, nums: List[int], pivot: int) -> List[int]:
        less = [x for x in nums if x < pivot]
        equal = [x for x in nums if x == pivot]
        greater = [x for x in nums if x > pivot]
        return less + equal + greater


sol = Solution()
print(sol.pivotArray([9, 12, 5, 10, 14, 3, 10], 10))
