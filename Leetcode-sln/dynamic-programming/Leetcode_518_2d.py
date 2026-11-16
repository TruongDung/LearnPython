class Solution:
    def change(self, amount, coins):
        rows, cols = len(coins) + 1, amount + 1
        dp = [[0] * cols for _ in range(rows)]
        for row in range(rows):
            dp[row][0] = 1
        for row in range(1, rows):
            coin = coins[row-1]
            for col in range(1, cols):
                skip = dp[row-1][col]
                take = 0
                if col >= coin:
                    take = dp[row][col-coin]
                dp[row][col] = skip + take
        return dp[rows-1][cols-1]
