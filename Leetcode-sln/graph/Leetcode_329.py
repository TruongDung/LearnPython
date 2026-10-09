class Solution:
    def longestIncreasingPath(self, matrix):
        m, n = len(matrix), len(matrix[0])

        # Subproblem 5: Memoization
        dp = [[0] * n for _ in range(m)]

        # Subproblem 2: Four directions
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        # Subproblem 4: Depth-First Search (DFS)
        def dfs(r, c):
            if dp[r][c]:
                return dp[r][c]

            best = 1
            for dr, dc in directions:
                nr = r + dr
                nc = c + dc

                # Subproblem 3: Check valid boundaries and increasing values
                if (0 <= nr < m and
                    0 <= nc < n and
                    matrix[nr][nc] > matrix[r][c]):

                    best = max(best, 1 + dfs(nr, nc))

            dp[r][c] = best
            return best

        # Subproblem 1: Traverse the entire matrix
        res = 0
        for r in range(m):
            for c in range(n):
                res = max(res, dfs(r, c))

        return res
