from functools import lru_cache
from typing import List


class Solution:
    def stoneGameV(self, stoneValue: List[int]) -> int:
        n = len(stoneValue)
        prefix = [0] * (n + 1)
        for index, value in enumerate(stoneValue):
            prefix[index + 1] = prefix[index] + value

        def range_sum(left: int, right: int) -> int:  # inclusive endpoints
            return prefix[right + 1] - prefix[left]

        @lru_cache(None)
        def solve(left: int, right: int) -> int:
            if left == right:
                return 0
            best = 0
            for split in range(left, right):
                first = range_sum(left, split)
                second = range_sum(split + 1, right)
                if first < second:
                    # Right part is heavier, so it is thrown away.
                    best = max(best, first + solve(left, split))
                elif second < first:
                    best = max(best, second + solve(split + 1, right))
                else:
                    # Equal halves: Alice keeps whichever side scores more.
                    best = max(best, first + max(solve(left, split), solve(split + 1, right)))
            return best

        return solve(0, n - 1)


sol = Solution()
print(sol.stoneGameV([6, 2, 3, 4, 5, 5]))  # 18
print(sol.stoneGameV([7, 7, 7, 7, 7, 7, 7]))  # 28
print(sol.stoneGameV([4]))  # 0
