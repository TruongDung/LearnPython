from functools import lru_cache

class Solution:
    def calculateMinimumHP(self, dungeon):
        rows, cols = len(dungeon), len(dungeon[0])

        @lru_cache(None)
        def dfs(row, col):
            if row >= rows or col >= cols:
                return float('inf')

            if row == rows - 1 and col == cols - 1:
                return max(1, 1 - dungeon[row][col])

            down = dfs(row + 1, col)
            right = dfs(row, col + 1)

            return max(1, min(down, right) - dungeon[row][col])

        return dfs(0, 0)
