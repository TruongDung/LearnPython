class Solution:
    def minPathCost(self, grid, moveCost):
        rows, cols = len(grid), len(grid[0])
        dp = [grid[0][:]] + [[float("inf")] * cols for _ in range(rows - 1)]
        parent = [[-1] * cols for _ in range(rows)]
        for row in range(rows - 1):
            for col in range(cols):
                value = grid[row][col]
                for nxt in range(cols):
                    step_cost = moveCost[value][nxt]
                    candidate = dp[row][col] + step_cost + grid[row + 1][nxt]
                    if candidate < dp[row + 1][nxt]:
                        dp[row + 1][nxt] = candidate
                        parent[row + 1][nxt] = col
        return min(dp[-1])
