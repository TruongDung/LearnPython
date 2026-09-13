from typing import List


class Solution:
    def dieSimulator(self, n: int, rollMax: List[int]) -> int:
        """Count valid sequences of n die rolls."""
        mod = 10 ** 9 + 7
        max_streak = max(rollMax)

        # dp[face][streak] is the number of sequences whose final rolls are
        # exactly `streak` copies of `face`.
        dp = [[0] * (max_streak + 1) for _ in range(6)]
        for face in range(6):
            dp[face][1] = 1

        for _ in range(1, n):
            next_dp = [[0] * (max_streak + 1) for _ in range(6)]
            face_totals = [sum(streaks) % mod for streaks in dp]
            total = sum(face_totals) % mod

            for face in range(6):
                # Switching from any other face starts a new streak.
                next_dp[face][1] = (total - face_totals[face]) % mod

                # Repeating this face extends its streak when allowed.
                for streak in range(2, rollMax[face] + 1):
                    next_dp[face][streak] = dp[face][streak - 1]

            dp = next_dp

        return sum(sum(streaks) for streaks in dp) % mod


if __name__ == "__main__":
    solution = Solution()
    assert solution.dieSimulator(2, [1, 1, 2, 2, 2, 3]) == 34
    assert solution.dieSimulator(2, [1, 1, 1, 1, 1, 1]) == 30
    assert solution.dieSimulator(3, [1, 1, 1, 2, 2, 3]) == 181
