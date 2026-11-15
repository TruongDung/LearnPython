class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid):
        m, n = len(obstacleGrid), len(obstacleGrid[0])
        dp = [[0]*n for _ in range(m)]
        for r in range(m):
            for c in range(n):
                if obstacleGrid[r][c] == 1:
                    dp[r][c] = 0
                elif r == 0 and c == 0:
                    dp[r][c] = 1
                else:
                    top = dp[r-1][c] if r > 0 else 0
                    left = dp[r][c-1] if c > 0 else 0
                    dp[r][c] = top + left
        return dp[m-1][n-1]
