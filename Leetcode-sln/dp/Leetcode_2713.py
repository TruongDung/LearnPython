class Solution:
    def maxIncreasingCells(self, mat):
        rows, cols = len(mat), len(mat[0])
        row_best = [0] * rows
        col_best = [0] * cols
        res = 0
        groups = {}
        for r in range(rows):
            for c in range(cols):
                groups.setdefault(mat[r][c], []).append((r, c))

        for value in sorted(groups):
            pending = []
            for r, c in groups[value]:
                length = 1 + max(row_best[r], col_best[c])
                pending.append((r, c, length))

            for r, c, length in pending:
                row_best[r] = max(row_best[r], length)
                col_best[c] = max(col_best[c], length)
                res = max(res, length)

        return res
