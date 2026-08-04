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
