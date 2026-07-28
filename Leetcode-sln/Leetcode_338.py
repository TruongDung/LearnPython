from typing import List


class Solution:
    def countBits(self, n: int) -> List[int]:
        dp = [0] * (n + 1)

        # dp[i] = dp[i >> 1] + (i & 1)
        # Drop the last bit (i>>1) then add it back if it was 1
        for i in range(1, n + 1):
            dp[i] = dp[i >> 1] + (i & 1)

        return dp


sol = Solution()
print(sol.countBits(2))  # [0, 1, 1]
print(sol.countBits(5))  # [0, 1, 1, 2, 1, 2]
