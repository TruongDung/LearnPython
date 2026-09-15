class Solution:
    def maxPalindromes(self, s: str, k: int) -> int:
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        for length in range(1, n + 1):
            for left in range(n - length + 1):
                right = left + length - 1
                pal[left][right] = (
                    s[left] == s[right]
                    and (length <= 2 or pal[left + 1][right - 1])
                )

        dp = [0] * (n + 1)
        for end in range(n):
            dp[end + 1] = dp[end]
            for start in range(end - k + 2):
                if pal[start][end]:
                    dp[end + 1] = max(dp[end + 1], dp[start] + 1)
        return dp[n]


if __name__ == "__main__":
    solution = Solution()
    assert solution.maxPalindromes("abaccdbbd", 3) == 2
    assert solution.maxPalindromes("adbcda", 2) == 0
