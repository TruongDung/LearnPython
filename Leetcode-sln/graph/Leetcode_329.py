# class Solution:
#     def longestIncreasingPath(self, matrix):
#         rows, cols = len(matrix), len(matrix[0])

#         # Subproblem 5: Memoization
#         dp = [[0] * cols for _ in range(rows)]

#         # Subproblem 2: Four directions
#         directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

#         # Subproblem 4: Depth-First Search (DFS)
#         def dfs(r, c):
#             if dp[r][c]:
#                 return dp[r][c]

#             best = 1
#             for dr, dc in directions:
#                 nr = r + dr
#                 nc = c + dc

#                 # Subproblem 3: Check valid boundaries and increasing values
#                 if (0 <= nr < rows and
#                     0 <= nc < cols and
#                     matrix[nr][nc] > matrix[r][c]):

#                     best = max(best, 1 + dfs(nr, nc))

#             dp[r][c] = best
#             return best

#         # Subproblem 1: Traverse the entire matrix
#         res = 0
#         for r in range(rows):
#             for c in range(cols):
#                 res = max(res, dfs(r, c))

#         return res

class Solution:
    def longestIncreasingPath(self, matrix):
        if not matrix or not matrix[0]:
            return []

        rows = len(matrix)
        cols = len(matrix[0])

        dp = [[0] * cols for _ in range(rows)]
        next_cell = [[None] * cols for _ in range(rows)]

        directions = [(1,0), (-1,0), (0,1), (0,-1)]

        def dfs(r, c):
            if dp[r][c]:
                return dp[r][c]

            best = 1

            for dr, dc in directions:
                nr = r + dr
                nc = c + dc

                if (0 <= nr < rows and
                    0 <= nc < cols and
                    matrix[nr][nc] > matrix[r][c]):

                    length = 1 + dfs(nr, nc)

                    if length > best:
                        best = length
                        next_cell[r][c] = (nr, nc)

            dp[r][c] = best
            return best

        max_len = 0
        start = None

        for r in range(rows):
            for c in range(cols):
                length = dfs(r, c)

                if length > max_len:
                    max_len = length
                    start = (r, c)

        # Reconstruct path
        path = []

        while start is not None:
            r, c = start
            path.append((r, c))
            start = next_cell[r][c]

        return path

sol = Solution()
print(sol.longestIncreasingPath([[9,9,4],[6,6,8],[2,1,1]]))
