import heapq
from typing import List


class Solution:
    def trapRainWater(self, heightMap: List[List[int]]) -> int:
        if not heightMap or len(heightMap) < 3 or len(heightMap[0]) < 3:
            return 0

        rows, cols = len(heightMap), len(heightMap[0])
        visited = [[False] * cols for _ in range(rows)]
        heap = []

        # Push all border cells into the min-heap
        for r in range(rows):
            for c in range(cols):
                if r in (0, rows - 1) or c in (0, cols - 1):
                    heapq.heappush(heap, (heightMap[r][c], r, c))
                    visited[r][c] = True

        water = 0
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        while heap:
            height, r, c = heapq.heappop(heap)
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc]:
                    visited[nr][nc] = True
                    # Water trapped = current boundary height - cell height
                    water += max(0, height - heightMap[nr][nc])
                    # New boundary height is the max of the two
                    new_height = max(height, heightMap[nr][nc])
                    heapq.heappush(heap, (new_height, nr, nc))

        return water


sol = Solution()
print(sol.trapRainWater([
    [1, 4, 3, 1, 3, 2],
    [3, 2, 1, 3, 2, 4],
    [2, 3, 3, 2, 3, 1],
]))  # 4
