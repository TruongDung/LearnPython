"""LeetCode 115: Distinct Subsequences."""


class Solution:
    """Count the subsequences of ``s`` that equal ``t``."""

    def numDistinct(self, s: str, t: str) -> int:
        # dp[j] is the number of ways to form t[:j] from the source
        # characters processed so far.  Iterating backwards prevents the
        # current source character from being used more than once.
        dp = [0] * (len(t) + 1)
        dp[0] = 1

        for source_char in s:
            for j in range(len(t), 0, -1):
                if source_char == t[j - 1]:
                    dp[j] += dp[j - 1]

        return dp[-1]
