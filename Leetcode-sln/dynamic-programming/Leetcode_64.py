from typing import List


class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dp = [[0] * n for _ in range(m)]
        dp[0][0] = grid[0][0]

        # Base: first row (can only come from the left)
        for c in range(1, n):
            dp[0][c] = dp[0][c - 1] + grid[0][c]

        # Base: first column (can only come from above)
        for r in range(1, m):
            dp[r][0] = dp[r - 1][0] + grid[r][0]

        # Fill the rest: dp[r][c] = grid[r][c] + min(from top, from left)
        for r in range(1, m):
            for c in range(1, n):
                dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])

        return dp[m - 1][n - 1]


sol = Solution()
print(sol.minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))  # 7
print(sol.minPathSum([[1, 2, 3], [4, 5, 6]]))               # 12
