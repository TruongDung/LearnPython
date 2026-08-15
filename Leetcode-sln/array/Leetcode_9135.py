"""Custom problem (circular Gas Station variant): max distance on a loop.

Same as the linear gas-deposits problem, but the track is a CIRCLE with a
given circumference. When you drive past `circumference` you wrap back to
position 0 and keep going, so you can also reach the deposits located before
your start index. Driving distance d burns d fuel; collect a deposit's gas
when you reach it (each deposit once). Return the maximum distance you can
travel before the tank runs dry between two deposits.

The arc distance from the current position to the next deposit (going
forward around the loop) is (next_position - position) % circumference.

Examples:
    [(0,40), (30,40), (70,40)], start=1, circumference=100 -> 120
    [(0,20), (20,20), (40,20), (80,20)], start=0, circumference=100 -> 60
"""
from typing import List, Tuple


class Solution:
    def maxDistance(self, deposits: List[Tuple[int, int]], start: int,
                    circumference: int) -> int:
        n = len(deposits)
        pos, tank = deposits[start]
        distance = 0
        for k in range(1, n):
            i = (start + k) % n
            next_pos = deposits[i][0]
            gap = (next_pos - pos) % circumference
            if tank < gap:
                return distance + tank
            tank -= gap
            distance += gap
            pos = next_pos
            tank += deposits[i][1]
        return distance + tank


if __name__ == "__main__":
    sol = Solution()
    print(sol.maxDistance([(0, 40), (30, 40), (70, 40)], 1, 100))           # 120
    print(sol.maxDistance([(0, 20), (20, 20), (40, 20), (80, 20)], 0, 100))  # 60
