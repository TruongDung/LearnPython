"""LeetCode 546: Remove Boxes."""

from __future__ import annotations

from typing import List


class Solution:
    """Memoised interval DP over (l, r, k) states.

    ``k`` counts same-coloured boxes glued to the left of ``l``; they will be
    removed together with the run starting at ``l``, so keeping them for a
    later merge can beat removing them immediately.
    """

    def removeBoxes(self, boxes: List[int]) -> int:
        memo = {}

        def dp(left: int, right: int, attached: int) -> int:
            if left > right:
                return 0
            state = (left, right, attached)
            if state in memo:
                return memo[state]
            color = boxes[left]
            best = (attached + 1) ** 2 + dp(left + 1, right, 0)
            for mid in range(left + 1, right + 1):
                if boxes[mid] != color:
                    continue
                merged = dp(mid, right, attached + 1)
                cleared = dp(left + 1, mid - 1, 0)
                best = max(best, merged + cleared)
            memo[state] = best
            return best

        return dp(0, len(boxes) - 1, 0)
