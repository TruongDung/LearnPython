class Solution:
    def countSquares(self, matrix):
        rows, cols = len(matrix), len(matrix[0])
        dp = [[0] * cols for _ in range(rows)]
        total = 0
        for row in range(rows):
            for col in range(cols):
                if matrix[row][col] == 0:
                    dp[row][col] = 0
                elif row == 0 or col == 0:
                    dp[row][col] = 1
                else:
                    dp[row][col] = 1 + min(dp[row-1][col], dp[row][col-1], dp[row-1][col-1])
                total += dp[row][col]
        return total
