from collections import deque

class Solution:
    def minimumObstacles(self, grid: List[List[int]]) -> int:
        """
        Minimum Obstacles to Remove to Reach Corner (LeetCode 2290)
        
        Use 0-1 BFS: cost 0 for empty cells (0), cost 1 for obstacles (1).
        """
        if not grid:
            return 0
        
        m, n = len(grid), len(grid[0])
        if m == 1 and n == 1:
            return 0
        
        # Directions: right, left, down, up
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        
        # dist[i][j] = minimum obstacles removed to reach (i, j)
        dist = [[float('inf')] * n for _ in range(m)]
        dist[0][0] = 0
        
        # 0-1 BFS using deque
        dq = deque([(0, 0)])
        
        while dq:
            row, col = dq.popleft()
            
            for dr, dc in directions:
                new_row, new_col = row + dr, col + dc
                
                if 0 <= new_row < m and 0 <= new_col < n:
                    # Cost to move to this cell: 0 if grid[new_row][new_col] == 0, else 1
                    cost = grid[new_row][new_col]
                    new_dist = dist[row][col] + cost
                    
                    if new_dist < dist[new_row][new_col]:
                        dist[new_row][new_col] = new_dist
                        # Add to front if cost 0 (empty cell), to back if cost 1 (obstacle)
                        if cost == 0:
                            dq.appendleft((new_row, new_col))
                        else:
                            dq.append((new_row, new_col))
        
        return dist[m - 1][n - 1]
        