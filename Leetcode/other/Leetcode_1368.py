from collections import deque

class Solution:
    def minCost(self, grid: List[List[int]]) -> int:
        """
        Minimum Cost to Make at Least One Valid Path in a Grid (LeetCode 1368)
        
        Use 0-1 BFS: cost 0 when following the direction, cost 1 when changing direction.
        Directions: 1=right, 2=left, 3=down, 4=up
        """
        if not grid:
            return 0
        
        m, n = len(grid), len(grid[0])
        # Directions: right, left, down, up
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        
        # dist[i][j] = minimum cost to reach (i, j)
        dist = [[float('inf')] * n for _ in range(m)]
        dist[0][0] = 0
        
        # 0-1 BFS using deque
        dq = deque([(0, 0)])
        
        while dq:
            row, col = dq.popleft()
            
            # Current cell's direction (1-indexed to 0-indexed)
            direction = grid[row][col] - 1
            next_row, next_col = directions[direction]
            next_row += row
            next_col += col
            
            # Try all 4 directions
            for dir_idx, (dr, dc) in enumerate(directions):
                new_row, new_col = row + dr, col + dc
                
                # Check bounds
                if 0 <= new_row < m and 0 <= new_col < n:
                    # Cost: 0 if following the cell's direction, 1 otherwise
                    cost = 0 if dir_idx == direction else 1
                    new_dist = dist[row][col] + cost
                    
                    if new_dist < dist[new_row][new_col]:
                        dist[new_row][new_col] = new_dist
                        # Add to front if cost 0, to back if cost 1
                        if cost == 0:
                            dq.appendleft((new_row, new_col))
                        else:
                            dq.append((new_row, new_col))
        
        return dist[m - 1][n - 1]
        