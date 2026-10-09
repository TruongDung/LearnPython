class Solution:
    def longestIncreasingPath(self, matrix):
        rows, cols = len(matrix), len(matrix[0])
        paths = []
        path = []
        res = 0
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def dfs(r, c):
            nonlocal res
            path.append((r, c))
            paths.append(path.copy())
            if len(paths) > 5000:
                raise ValueError("More than 5000 paths; use approach 1.")

            res = max(res, len(path))

            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if (0 <= nr < rows and
                    0 <= nc < cols and
                    matrix[nr][nc] > matrix[r][c]):
                    dfs(nr, nc)

            path.pop()

        for r in range(rows):
            for c in range(cols):
                dfs(r, c)

        groups = {}
        for cells in paths:
            values = [matrix[r][c] for r, c in cells]
            groups.setdefault(len(values), []).append(values)

        for length in sorted(groups):
            formatted = ", ".join(
                "[" + " -> ".join(map(str, values)) + "]"
                for values in groups[length]
            )
            print(f"Paths with length {length}: {formatted}.")

        return res
