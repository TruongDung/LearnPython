from typing import List


class Solution:
    def predictTheWinner(self, nums: List[int]) -> bool:
        n = len(nums)
        # dp[i][j] = max score advantage (current player - opponent)
        # on subarray nums[i..j].
        # Positive/zero means the current player wins or ties.
        dp = [[0] * n for _ in range(n)]

        # Base case: single element, current player takes it all
        for i in range(n):
            dp[i][i] = nums[i]

        # Fill by increasing subarray length
        for length in range(2, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                # Take left end: gain nums[i], opponent plays [i+1..j]
                # Take right end: gain nums[j], opponent plays [i..j-1]
                dp[i][j] = max(nums[i] - dp[i + 1][j],
                               nums[j] - dp[i][j - 1])

        # Player 1 wins if they can secure a non-negative advantage
        return dp[0][n - 1] >= 0


sol = Solution()
print(sol.predictTheWinner([1, 5, 2]))       # False
print(sol.predictTheWinner([1, 5, 233, 7]))  # True
print(sol.predictTheWinner([1, 2]))           # True
print(sol.predictTheWinner([2, 4, 55, 4, 1]))  # False
