class Solution:
    def minDays(self, n: int) -> int:
        streaks = []
        length = 1
        while length * (length + 1) // 2 <= n:
            points = length * (length + 1) // 2
            streaks.append((points, length + 1))
            length += 1

        dp = [float("inf")] * (n + 1)
        dp[0] = 0
        for score in range(1, n + 1):
            for points, cost in streaks:
                if points > score:
                    break
                dp[score] = min(dp[score], dp[score - points] + cost)

        return dp[n] - 1


if __name__ == "__main__":
    solution = Solution()
    assert solution.minDays(2) == 3
    assert solution.minDays(9) == 6
    assert solution.minDays(12) == 7
