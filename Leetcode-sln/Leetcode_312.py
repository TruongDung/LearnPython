from typing import List


class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        # Pad with 1 on both ends
        balloons = [1] + nums + [1]
        n = len(balloons)

        # dp[i][j] = max coins from bursting all balloons in open interval (i, j)
        dp = [[0] * n for _ in range(n)]

        # length = size of the open interval span
        for length in range(2, n):
            for left in range(n - length):
                right = left + length
                # k = last balloon to burst in (left, right)
                for k in range(left + 1, right):
                    coins = balloons[left] * balloons[k] * balloons[right]
                    coins += dp[left][k] + dp[k][right]
                    dp[left][right] = max(dp[left][right], coins)

        return dp[0][n - 1]


sol = Solution()
print(sol.maxCoins([3, 1, 5, 8]))  # 167
print(sol.maxCoins([1, 5]))        # 10
