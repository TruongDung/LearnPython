from typing import List

class Solution:
    def countPaths(self, grid: List[List[int]]) -> int:
        MOD = 10**9 + 7
        rows, cols = len(grid), len(grid[0])

        dp = [[0] * cols for _ in range(rows)]
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def dfs(r, c):
            if dp[r][c]:
                return dp[r][c]

            count = 1

            for dr, dc in directions:
                nr = r + dr
                nc = c + dc

                if (0 <= nr < rows and
                    0 <= nc < cols and
                    grid[nr][nc] > grid[r][c]):

                    count += dfs(nr, nc)

            dp[r][c] = count % MOD
            return dp[r][c]

        ans = 0

        for r in range(rows):
            for c in range(cols):
                ans = (ans + dfs(r, c)) % MOD

        return ans

