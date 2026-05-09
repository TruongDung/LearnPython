from collections import deque

class Solution:
    def findSafeWalk(self, grid: List[List[int]], health: int) -> bool:
        """
        Find a Safe Walk Through a Grid (LeetCode 3286)
        
        Use BFS with state (row, col, current_health) to explore paths.
        Health decreases by grid value when visiting a cell.
        Can only move to a cell if current health > grid value of that cell.
        """
        if not grid or not grid[0]:
            return False
        
        m, n = len(grid), len(grid[0])
        
        # Cannot even start if health <= grid[0][0]
        if health <= grid[0][0]:
            return False
        
        start_health = health - grid[0][0]
        
        # Directions: right, left, down, up
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        
        # BFS queue: (row, col, current_health)
        queue = deque([(0, 0, start_health)])
        # Visited: set of (row, col, health)
        visited = set([(0, 0, start_health)])
        
        while queue:
            row, col, curr_health = queue.popleft()
            
            # Check if reached destination
            if row == m - 1 and col == n - 1:
                # Since we reached here, and curr_health is after visiting (row,col), but wait
                # Actually, when we enqueue, we already subtracted for the current cell
                # But for destination, we need curr_health > 0 after visiting, but since we checked curr_health > grid[row][col] before subtracting, and subtracted, curr_health > 0
                return True
            
            for dr, dc in directions:
                new_row, new_col = row + dr, col + dc
                if 0 <= new_row < m and 0 <= new_col < n:
                    # Can move if curr_health > grid[new_row][new_col]
                    if curr_health > grid[new_row][new_col]:
                        new_health = curr_health - grid[new_row][new_col]
                        state = (new_row, new_col, new_health)
                        if state not in visited:
                            visited.add(state)
                            queue.append(state)
        
        return False
        