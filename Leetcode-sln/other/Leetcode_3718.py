from typing import List


class Solution:
    def missingMultiple(self, nums: List[int], k: int) -> int:
        seen = set(nums)
        ans = k
        while ans in seen:
            ans += k
        return ans


sol = Solution()
print(sol.missingMultiple([8, 2, 3, 4, 6], 2))
