"""LeetCode 1102: Path With Maximum Minimum Value (Premium).

Given an m x n integer grid, find a path from (0,0) to (m-1,n-1) that
maximises the minimum value along the path (you may move up/down/left/right).
The score of a path is the minimum value on it; return the maximum score.

Approach: best-first search with a max-heap. Always expand the reachable cell
with the largest value. Track `result` = the smallest value seen so far along
the expansion. As soon as we pop the bottom-right cell, `result` is the answer,
because every cell popped before it had a value >= it (max-heap order), so the
path taken keeps the minimum as high as possible.

Examples:
    [[5,4,5],[1,2,6],[7,4,6]] -> 4
    [[2,2,1,2,2,2],[1,2,2,2,1,2]] -> 2
"""
import heapq
from typing import List


class Solution:
    def maximumMinimumPath(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        result = grid[0][0]
        visited = [[False] * n for _ in range(m)]
        heap = [(-grid[0][0], 0, 0)]
        visited[0][0] = True
        while heap:
            val, r, c = heapq.heappop(heap)
            result = min(result, -val)
            if r == m - 1 and c == n - 1:
                return result
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and not visited[nr][nc]:
                    visited[nr][nc] = True
                    heapq.heappush(heap, (-grid[nr][nc], nr, nc))
        return result


if __name__ == "__main__":
    sol = Solution()
    print(sol.maximumMinimumPath([[5, 4, 5], [1, 2, 6], [7, 4, 6]]))            # 4
    print(sol.maximumMinimumPath([[2, 2, 1, 2, 2, 2], [1, 2, 2, 2, 1, 2]]))     # 2
