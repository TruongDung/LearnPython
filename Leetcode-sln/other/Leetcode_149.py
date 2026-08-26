"""LeetCode 149: Max Points on a Line."""

from __future__ import annotations

from math import gcd


class Solution:
    """Count the densest straight line with slope hashing in O(n^2)."""

    def maxPoints(self, points: list[list[int]]) -> int:
        n = len(points)
        if n <= 2:
            return n

        def canonical_slope(dy: int, dx: int) -> tuple[int, int]:
            g = gcd(abs(dy), abs(dx))
            a, b = dy // g, dx // g
            if b < 0:
                a, b = -a, -b
            if b == 0:
                a, b = 1, 0
            elif a == 0:
                a, b = 0, 1
            return a, b

        best = 1
        for i in range(n):
            slopes: dict[tuple[int, int], int] = {}
            duplicates = 0
            for j in range(n):
                if j == i:
                    continue
                dy = points[j][1] - points[i][1]
                dx = points[j][0] - points[i][0]
                if dy == 0 and dx == 0:
                    duplicates += 1
                    continue
                key = canonical_slope(dy, dx)
                slopes[key] = slopes.get(key, 0) + 1
            local = (max(slopes.values()) if slopes else 0) + duplicates + 1
            best = max(best, local)
        return best
