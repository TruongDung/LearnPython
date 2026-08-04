from typing import List


class Solution:
    def countSubIslands(self, grid1: List[List[int]], grid2: List[List[int]]) -> int:
        rows, cols = len(grid1), len(grid1[0])
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        count = 0

        for row in range(rows):
            for col in range(cols):
                if grid2[row][col] != 1:
                    continue

                stack = [(row, col)]
                grid2[row][col] = 0
                is_sub = True

                while stack:
                    current_row, current_col = stack.pop()
                    if grid1[current_row][current_col] == 0:
                        is_sub = False
                    for delta_row, delta_col in directions:
                        next_row, next_col = current_row + delta_row, current_col + delta_col
                        if 0 <= next_row < rows and 0 <= next_col < cols and grid2[next_row][next_col] == 1:
                            grid2[next_row][next_col] = 0
                            stack.append((next_row, next_col))

                if is_sub:
                    count += 1

        return count


class SolutionApproach2:
    # Alternative structure: recursive DFS that returns a boolean.
    # dfs(row, col) returns True if this cell (and everything it recurses
    # into) is still a valid sub-island candidate. Out-of-bounds/water cells
    # vacuously return True (they don't disqualify anything). Grid2 is
    # flooded to 0 as it's visited, doubling as the visited marker.
    def countSubIslands(self, grid1: List[List[int]], grid2: List[List[int]]) -> int:
        rows = len(grid2)
        cols = len(grid2[0])

        def dfs(row, col):
            # Out of bounds or water: contributes nothing, vacuously True.
            if (row < 0 or row >= rows or
                    col < 0 or col >= cols or
                    grid2[row][col] == 0):
                return True

            # Remember whether THIS cell sits on grid1 land.
            is_sub_island = grid1[row][col] == 1

            # Mark visited by flooding it to water.
            grid2[row][col] = 0

            up = dfs(row - 1, col)
            down = dfs(row + 1, col)
            left = dfs(row, col - 1)
            right = dfs(row, col + 1)

            return (is_sub_island and up and down and left and right)

        result = 0
        for row in range(rows):
            for col in range(cols):
                if grid2[row][col] == 1:
                    if dfs(row, col):
                        result += 1
        return result


GRID1 = [[1, 1, 1, 0, 0], [0, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 0, 1, 1]]
GRID2 = [[1, 1, 1, 0, 0], [0, 0, 1, 1, 1], [0, 1, 0, 0, 0], [1, 0, 1, 1, 0], [0, 1, 0, 1, 0]]

sol = Solution()
print(sol.countSubIslands([row[:] for row in GRID1], [row[:] for row in GRID2]))  # 3

sol2 = SolutionApproach2()
print(sol2.countSubIslands([row[:] for row in GRID1], [row[:] for row in GRID2]))  # 3
