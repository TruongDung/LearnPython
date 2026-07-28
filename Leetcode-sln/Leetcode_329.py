from typing import List


class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        if not matrix or not matrix[0]:
            return 0

        rows, cols = len(matrix), len(matrix[0])
        memo = [[0] * cols for _ in range(rows)]
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        def dfs(r: int, c: int) -> int:
            if memo[r][c]:
                return memo[r][c]

            best = 1
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dfs(nr, nc))

            memo[r][c] = best
            return best

        return max(dfs(r, c) for r in range(rows) for c in range(cols))


sol = Solution()
print(sol.longestIncreasingPath([[9, 9, 4], [6, 6, 8], [2, 1, 1]]))  # 4
print(sol.longestIncreasingPath([[3, 4, 5], [3, 2, 6], [2, 2, 1]]))  # 4
