from bisect import bisect_left, bisect_right
from typing import List


class Solution:
    def stoneGameV(self, stoneValue: List[int]) -> int:
        """Return Alice's maximum score using interval DP and prefix sums."""
        n = len(stoneValue)
        if not n:
            return 0

        prefix = [0] * (n + 1)
        for index, value in enumerate(stoneValue):
            prefix[index + 1] = prefix[index] + value

        dp = [[0] * n for _ in range(n)]
        best_left = [[0] * n for _ in range(n)]
        best_right = [[0] * n for _ in range(n)]
        for index, value in enumerate(stoneValue):
            best_left[index][index] = value
            best_right[index][index] = value

        for length in range(2, n + 1):
            for left in range(n - length + 1):
                right = left + length - 1
                total = prefix[right + 1] - prefix[left]
                score = 0

                # Keep the left side when it is strictly smaller.
                left_limit = prefix[left] + (total - 1) // 2
                boundary = bisect_right(prefix, left_limit, left + 1, right + 1)
                if boundary > left + 1:
                    score = best_left[left][boundary - 1]

                # Keep the right side when it is strictly smaller.
                right_start = bisect_right(prefix, prefix[left] + total // 2, left + 1, right + 1)
                if right_start <= right:
                    score = max(score, best_right[right_start][right])

                # If both sides have the same sum, Alice may keep either side.
                middle = bisect_left(prefix, prefix[left] + total // 2, left + 1, right + 1)
                if total % 2 == 0 and middle <= right and prefix[middle] == prefix[left] + total // 2:
                    score = max(score, total // 2 + max(dp[left][middle - 1], dp[middle][right]))

                dp[left][right] = score
                interval_value = total + score
                best_left[left][right] = max(best_left[left][right - 1], interval_value)
                best_right[left][right] = max(interval_value, best_right[left + 1][right])

        return dp[0][n - 1]
