class Solution:
    def shortestPathBinaryMatrix(self, grid: List[List[int]]) -> int:
        n = len(grid)
        if grid[0][0] == 1 or grid[n-1][n-1] == 1:
            return -1

        queue = collections.deque()
        visited = [[False for _ in range(n)] for _ in range(n)]

        queue.append((0, 0))
        visited[0][0] = True

        path_len = 1

        directions = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]

        while queue:
            size = len(queue)
            for _ in range(size):
                curr = queue.popleft()

                if curr[0] == n-1 and curr[1] == n-1:
                    return path_len

                for direction in directions:
                    x = curr[0] + direction[0]
                    y = curr[1] + direction[1]


                    if x < 0 or x >= n or y < 0 or y >= n or grid[x][y] == 1:
                        continue
                    
                    if not visited[x][y]:
                        queue.append((x, y))
                        visited[x][y] = True


            path_len += 1

        return -1