class Solution:
    def numberOfPaths(self, grid, k):
        MOD = 10**9 + 7
        m, n = len(grid), len(grid[0])
        dp = [[[0]*k for _ in range(n)] for _ in range(m)]
        dp[0][0][grid[0][0] % k] = 1
        for r in range(m):
            for c in range(n):
                if r == 0 and c == 0:
                    continue
                for rem in range(k):
                    previous = (rem - grid[r][c]) % k
                    top = dp[r-1][c][previous] if r > 0 else 0
                    left = dp[r][c-1][previous] if c > 0 else 0
                    dp[r][c][rem] = (top + left) % MOD
        return dp[m-1][n-1][0]
