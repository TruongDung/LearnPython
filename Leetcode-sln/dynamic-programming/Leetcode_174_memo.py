from functools import lru_cache

class Solution:
    def calculateMinimumHP(self, dungeon):
        m, n = len(dungeon), len(dungeon[0])

        @lru_cache(None)
        def dfs(i, j):
            if i >= m or j >= n:
                return float('inf')

            if i == m - 1 and j == n - 1:
                return max(1, 1 - dungeon[i][j])

            down = dfs(i + 1, j)
            right = dfs(i, j + 1)

            return max(1, min(down, right) - dungeon[i][j])

        return dfs(0, 0)
