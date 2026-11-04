import heapq
import collections
from typing import List


class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m = len(grid)
        n = len(grid[0])
        count_fresh = 0
        queue = collections.deque()
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    count_fresh += 1
                elif grid[i][j] == 2:
                    queue.append((i, j))
        if count_fresh == 0:
            return 0
        minutes = 1
        directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
        while queue:
            size = len(queue)
            for _ in range(size):
                curr = queue.popleft()
                for direction in directions:
                    x = curr[0] + direction[0]
                    y = curr[1] + direction[1]
                    if x < 0 or x >= m or y < 0 or y >= n or grid[x][y] != 1:
                        continue

                    grid[x][y] = 2
                    count_fresh -= 1
                    if count_fresh == 0:
                        return minutes

                    queue.append((x, y))

            minutes += 1
        return -1


class SolutionBFSWithTime:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        times = [[float("inf")] * cols for _ in range(rows)]
        queue = collections.deque()
        fresh_count = 0

        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == 1:
                    fresh_count += 1
                elif grid[row][col] == 2:
                    times[row][col] = 0
                    queue.append((row, col))

        if fresh_count == 0:
            return 0

        while queue:
            row, col = queue.popleft()
            next_time = times[row][col] + 1

            for row_delta, col_delta in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                next_row = row + row_delta
                next_col = col + col_delta
                if (
                    0 <= next_row < rows
                    and 0 <= next_col < cols
                    and grid[next_row][next_col] == 1
                    and times[next_row][next_col] == float("inf")
                ):
                    times[next_row][next_col] = next_time
                    queue.append((next_row, next_col))

        answer = max(
            times[row][col]
            for row in range(rows)
            for col in range(cols)
            if grid[row][col] == 1
        )
        return -1 if answer == float("inf") else answer


class SolutionDFS:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        times = [[float("inf")] * cols for _ in range(rows)]
        stack = []
        fresh_cells = []

        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == 1:
                    fresh_cells.append((row, col))
                elif grid[row][col] == 2:
                    times[row][col] = 0
                    stack.append((row, col, 0))

        if not fresh_cells:
            return 0

        while stack:
            row, col, current_time = stack.pop()
            if current_time != times[row][col]:
                continue

            for row_delta, col_delta in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                next_row = row + row_delta
                next_col = col + col_delta
                if (
                    0 <= next_row < rows
                    and 0 <= next_col < cols
                    and grid[next_row][next_col] == 1
                    and current_time + 1 < times[next_row][next_col]
                ):
                    times[next_row][next_col] = current_time + 1
                    stack.append((next_row, next_col, current_time + 1))

        answer = max(times[row][col] for row, col in fresh_cells)
        return -1 if answer == float("inf") else answer


class SolutionSimulation:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        state = [row[:] for row in grid]
        fresh_count = sum(cell == 1 for row in state for cell in row)

        if fresh_count == 0:
            return 0

        minutes = 0
        while fresh_count:
            newly_rotten = []
            for row in range(rows):
                for col in range(cols):
                    if state[row][col] != 2:
                        continue

                    for row_delta, col_delta in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                        next_row = row + row_delta
                        next_col = col + col_delta
                        if (
                            0 <= next_row < rows
                            and 0 <= next_col < cols
                            and state[next_row][next_col] == 1
                        ):
                            state[next_row][next_col] = -1
                            newly_rotten.append((next_row, next_col))

            if not newly_rotten:
                return -1

            for row, col in newly_rotten:
                state[row][col] = 2
            fresh_count -= len(newly_rotten)
            minutes += 1

        return minutes


class SolutionDijkstra:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        times = [[float("inf")] * cols for _ in range(rows)]
        min_heap = []
        fresh_cells = []

        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == 1:
                    fresh_cells.append((row, col))
                elif grid[row][col] == 2:
                    times[row][col] = 0
                    heapq.heappush(min_heap, (0, row, col))

        if not fresh_cells:
            return 0

        while min_heap:
            current_time, row, col = heapq.heappop(min_heap)
            if current_time != times[row][col]:
                continue

            for row_delta, col_delta in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                next_row = row + row_delta
                next_col = col + col_delta
                if (
                    0 <= next_row < rows
                    and 0 <= next_col < cols
                    and grid[next_row][next_col] == 1
                    and current_time + 1 < times[next_row][next_col]
                ):
                    times[next_row][next_col] = current_time + 1
                    heapq.heappush(
                        min_heap, (current_time + 1, next_row, next_col)
                    )

        answer = max(times[row][col] for row, col in fresh_cells)
        return -1 if answer == float("inf") else answer
