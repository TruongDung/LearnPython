class Solution:
    def longestIncreasingPath(self, matrix):
        res = 0
        rows = len(matrix)
        cols = len(matrix[0])

        dp = [[0] * cols for _ in range(rows)]

        directions = [(1,0), (-1,0), (0,1), (0,-1)]
        def dfs(r,c):
            if dp[r][c]:
                return dp[r][c]

            best = 1
            for dr, dc in directions:
                nr = r + dr
                nc = c + dc

                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dfs(nr, nc))
            dp[r][c] = best
            return best


        for r in range(rows):
            for c in range(cols):
                res = max(res, dfs(r,c))


        return res
