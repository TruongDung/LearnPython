from typing import List


class Solution:
    def minBitwiseArray(self, nums: List[int]) -> List[int]:
        res = []
        for num in nums:
            if num == 2:
                res.append(-1)
                continue
            # Find the lowest unset bit of num.
            i = 0
            while (num >> i) & 1:
                i += 1
            # Clearing the bit just below the lowest unset bit gives the
            # minimal ans such that ans | (ans + 1) == num.
            res.append(num - (1 << (i - 1)))
        return res


sol = Solution()
print(sol.minBitwiseArray([2, 3, 5, 7]))
