"""Custom problem (variant of Gas Station): maximum drivable distance.

Given gas deposits as a list of (position, gas_amount) sorted by position,
and a starting deposit index `start`, return the maximum distance we can
travel forward. Driving a distance d burns d units of gas. At each deposit
we reach, we collect its gas. If the tank runs dry between two deposits, we
coast forward on whatever fuel is left and stop.

Examples:
    [(0,20), (20,20), (40,20), (80,20)], start=0 -> 60
    [(0,20), (30,20), (40,30), (90,20)], start=1 -> 50
"""
from typing import List, Tuple


class Solution:
    def maxDistance(self, deposits: List[Tuple[int, int]], start: int) -> int:
        n = len(deposits)
        start_pos = deposits[start][0]
        pos = start_pos
        tank = deposits[start][1]
        for i in range(start + 1, n):
            gap = deposits[i][0] - pos
            if tank >= gap:
                tank -= gap
                pos = deposits[i][0]
                tank += deposits[i][1]
            else:
                pos += tank
                return pos - start_pos
        pos += tank
        return pos - start_pos


if __name__ == "__main__":
    sol = Solution()
    print(sol.maxDistance([(0, 20), (20, 20), (40, 20), (80, 20)], 0))  # 60
    print(sol.maxDistance([(0, 20), (30, 20), (40, 30), (90, 20)], 1))  # 50
