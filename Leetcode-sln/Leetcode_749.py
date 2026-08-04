from typing import List


class Solution:
    def containVirus(self, is_infected: List[List[int]]) -> int:
        rows, cols = len(is_infected), len(is_infected[0])
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        total_walls = 0

        while True:
            visited = [[False] * cols for _ in range(rows)]
            regions = []     # infected cells per region
            frontiers = []   # uninfected neighbor cells threatened by each region
            wall_counts = []  # walls needed to fully quarantine each region

            for r in range(rows):
                for c in range(cols):
                    if is_infected[r][c] == 1 and not visited[r][c]:
                        region = set()
                        frontier = set()
                        walls = 0
                        stack = [(r, c)]
                        visited[r][c] = True
                        while stack:
                            cur_r, cur_c = stack.pop()
                            region.add((cur_r, cur_c))
                            for delta_r, delta_c in directions:
                                next_r, next_c = cur_r + delta_r, cur_c + delta_c
                                if 0 <= next_r < rows and 0 <= next_c < cols:
                                    if is_infected[next_r][next_c] == 1 and not visited[next_r][next_c]:
                                        visited[next_r][next_c] = True
                                        stack.append((next_r, next_c))
                                    elif is_infected[next_r][next_c] == 0:
                                        frontier.add((next_r, next_c))
                                        walls += 1
                        regions.append(region)
                        frontiers.append(frontier)
                        wall_counts.append(walls)

            if not regions:
                break

            # Quarantine the region that threatens the MOST uninfected cells.
            max_idx = max(range(len(regions)), key=lambda i: len(frontiers[i]))

            if len(frontiers[max_idx]) == 0:
                break

            total_walls += wall_counts[max_idx]

            for i, region in enumerate(regions):
                if i == max_idx:
                    for (rr, cc) in region:
                        is_infected[rr][cc] = 2  # permanently quarantined
                else:
                    for (rr, cc) in frontiers[i]:
                        is_infected[rr][cc] = 1  # virus spreads overnight

        return total_walls


class SolutionApproach2:
    # Alternative structure: recursive DFS that RETURNS the wall count for
    # the region it just explored (walls += dfs(...)), instead of
    # accumulating walls in an outer variable. Quarantined cells are marked
    # -1 instead of 2, and `visited` is a single set shared across the
    # whole day's scan instead of a 2D boolean array.
    def containVirus(self, is_infected: List[List[int]]) -> int:
        rows = len(is_infected)
        cols = len(is_infected[0])
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        total_walls = 0

        while True:
            visited = set()
            regions = []
            frontiers = []
            walls_needed = []

            def dfs(row, col, region, frontier):
                visited.add((row, col))
                region.add((row, col))
                walls = 0
                for delta_row, delta_col in directions:
                    next_row = row + delta_row
                    next_col = col + delta_col
                    if not (0 <= next_row < rows and 0 <= next_col < cols):
                        continue
                    if is_infected[next_row][next_col] == 0:
                        frontier.add((next_row, next_col))
                        walls += 1
                    elif (is_infected[next_row][next_col] == 1 and (next_row, next_col) not in visited):
                        walls += dfs(next_row, next_col, region, frontier)
                return walls

            for row in range(rows):
                for col in range(cols):
                    if is_infected[row][col] == 1 and (row, col) not in visited:
                        region = set()
                        frontier = set()
                        walls = dfs(row, col, region, frontier)
                        regions.append(region)
                        frontiers.append(frontier)
                        walls_needed.append(walls)

            if not regions:
                break

            quarantine_index = max(range(len(frontiers)), key=lambda index: len(frontiers[index]))

            if len(frontiers[quarantine_index]) == 0:
                break

            total_walls += walls_needed[quarantine_index]
            for row, col in regions[quarantine_index]:
                is_infected[row][col] = -1

            for index in range(len(regions)):
                if index == quarantine_index:
                    continue
                for row, col in frontiers[index]:
                    is_infected[row][col] = 1

        return total_walls


sol = Solution()
GRID_1 = [
    [0, 1, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
]
print(sol.containVirus([row[:] for row in GRID_1]))  # 10

GRID_2 = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
print(sol.containVirus([row[:] for row in GRID_2]))  # 4

sol2 = SolutionApproach2()
print(sol2.containVirus([row[:] for row in GRID_1]))  # 10
print(sol2.containVirus([row[:] for row in GRID_2]))  # 4
