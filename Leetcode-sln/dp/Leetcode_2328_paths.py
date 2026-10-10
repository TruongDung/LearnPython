from typing import List

class Solution:
    def countPaths(self, grid: List[List[int]]) -> int:
        MOD = 10**9 + 7
        rows, cols = len(grid), len(grid[0])

        if rows * cols > 36:
            raise ValueError("Approach 3 supports at most 36 cells.")

        paths = []
        path = []
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def dfs(r, c):
            path.append((r, c))
            paths.append(path.copy())
            if len(paths) > 5000:
                raise ValueError("More than 5000 paths; use approach 1 or 2.")

            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if (0 <= nr < rows and
                    0 <= nc < cols and
                    grid[nr][nc] > grid[r][c]):
                    dfs(nr, nc)

            path.pop()

        for r in range(rows):
            for c in range(cols):
                dfs(r, c)

        groups = {}
        for cells in paths:
            values = [grid[r][c] for r, c in cells]
            groups.setdefault(len(values), []).append(values)

        for length in sorted(groups):
            formatted = ", ".join(
                "[" + " -> ".join(map(str, values)) + "]"
                for values in groups[length]
            )
            print(f"Paths with length {length}: {formatted}.")

        return len(paths) % MOD
