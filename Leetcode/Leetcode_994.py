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
