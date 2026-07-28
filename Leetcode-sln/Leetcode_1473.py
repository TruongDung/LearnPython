from functools import lru_cache
from typing import List

# LeetCode defines minCost with five inputs in addition to self.
# pylint: disable=too-many-positional-arguments


class Solution:
    def minCost(self, houses: List[int], cost: List[List[int]],
                m: int, n: int, target: int) -> int:
        INF = float('inf')

        @lru_cache(maxsize=None)
        def dp(i: int, prev_color: int, groups: int) -> int:
            # Too many groups already, or impossible to reach target
            if groups > target:
                return INF
            if i == m:
                return 0 if groups == target else INF

            if houses[i] != 0:
                # House already painted; color is fixed
                new_groups = groups + (1 if houses[i] != prev_color else 0)
                return dp(i + 1, houses[i], new_groups)

            best = INF
            for color in range(1, n + 1):
                new_groups = groups + (1 if color != prev_color else 0)
                best = min(best, cost[i][color - 1] + dp(i + 1, color, new_groups))
            return best

        result = dp(0, 0, 0)
        return result if result != INF else -1


sol = Solution()
print(sol.minCost([0, 0, 0, 0, 0], [[1, 10], [10, 1], [10, 1], [1, 10], [5, 1]],
                  5, 2, 3))  # 9
print(sol.minCost([0, 2, 1, 2, 0], [[1, 10], [10, 1], [10, 1], [1, 10], [5, 1]],
                  5, 2, 3))  # 11
print(sol.minCost([3, 1, 2, 3], [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
                  4, 3, 3))  # -1
