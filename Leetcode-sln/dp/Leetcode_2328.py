class Solution:
    def countPaths(self, grid):
        MOD = 10**9 + 7
        rows, cols = len(grid), len(grid[0])
        dp = [[1] * cols for _ in range(rows)]
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        cells = sorted(
            ((grid[r][c], r, c) for r in range(rows) for c in range(cols)),
            reverse=True
        )
        res = 0
        for value, r, c in cells:
            for dr, dc in directions:
                nr = r + dr
                nc = c + dc
                if (0 <= nr < rows and
                    0 <= nc < cols and
                    grid[nr][nc] > value):
                    dp[r][c] = (dp[r][c] + dp[nr][nc]) % MOD
            res = (res + dp[r][c]) % MOD
        return res
