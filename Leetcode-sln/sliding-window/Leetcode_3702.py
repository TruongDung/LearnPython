from typing import List


class Solution:
    def longestSubsequence(self, nums: List[int]) -> int:
        xor = 0
        has_nonzero = False

        for x in nums:
            xor ^= x
            if x != 0:
                has_nonzero = True

        if xor != 0:
            return len(nums)

        if has_nonzero:
            return len(nums) - 1

        return 0


sol = Solution()
print(sol.longestSubsequence([7,6,1,9]))
