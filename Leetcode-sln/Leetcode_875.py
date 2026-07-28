import math
from typing import List


class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        def hours_needed(speed: int) -> int:
            return sum(math.ceil(pile / speed) for pile in piles)

        # Binary search on the eating speed (the answer)
        lo, hi = 1, max(piles)
        while lo < hi:
            mid = (lo + hi) // 2
            if hours_needed(mid) <= h:
                hi = mid          # mid works → try slower
            else:
                lo = mid + 1      # too slow → need faster

        return lo


sol = Solution()
print(sol.minEatingSpeed([3, 6, 7, 11], 8))         # 4
print(sol.minEatingSpeed([30, 11, 23, 4, 20], 5))   # 30
print(sol.minEatingSpeed([30, 11, 23, 4, 20], 6))   # 23
