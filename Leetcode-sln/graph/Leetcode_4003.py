import heapq
from typing import List


class Solution:
    def minCost(self, m: int, n: int, penalty: List[List[int]]) -> int:
        # entry_cost(r, c) = (r+1)*(c+1)
        # State: (cost, r, c, parity)
        #   parity = 1 -> next action is odd  (right/down is free)
        #   parity = 0 -> next action is even (left/up   is free)
        inf = float('inf')
        dist = [[[inf] * 2 for _ in range(n)] for _ in range(m)]

        start = (0 + 1) * (0 + 1)      # entry cost of (0, 0)
        dist[0][0][1] = start           # action 1 is the first move (odd)
        heap = [(start, 0, 0, 1)]

        while heap:
            cost, r, c, par = heapq.heappop(heap)
            if cost > dist[r][c][par]:
                continue
            if r == m - 1 and c == n - 1:
                return cost
            # par=1: odd action → right/down follows parity
            # par=0: even action → left/up follows parity
            for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    follows = (par == 1 and (dr, dc) in [(0, 1), (1, 0)]) or \
                              (par == 0 and (dr, dc) in [(0, -1), (-1, 0)])
                    enter = (nr + 1) * (nc + 1)
                    pen = 0 if follows else penalty[r][c]
                    nc_cost = cost + enter + pen
                    np = 1 - par
                    if nc_cost < dist[nr][nc][np]:
                        dist[nr][nc][np] = nc_cost
                        heapq.heappush(heap, (nc_cost, nr, nc, np))
            # wait in current cell
            wait_cost = cost + penalty[r][c]
            np = 1 - par
            if wait_cost < dist[r][c][np]:
                dist[r][c][np] = wait_cost
                heapq.heappush(heap, (wait_cost, r, c, np))

        return min(dist[m - 1][n - 1])


sol = Solution()
print(sol.minCost(2, 2, [[3, 2], [1, 4]]))         # 8
print(sol.minCost(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]))  # 26
