class Solution:
    def isValidPalindrome(self, s: str, k: int) -> bool:
        n = len(s)

        # dp[i][j] = length of the longest palindromic subsequence in s[i..j]
        dp = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            dp[i][i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    dp[i][j] = dp[i + 1][j - 1] + 2
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])

        # We can delete at most k chars; remaining must be a palindrome.
        # Min deletions = n - LPS. Valid iff n - LPS(whole) <= k.
        longest_palindrome = dp[0][n - 1]
        return n - longest_palindrome <= k


sol = Solution()
print(sol.isValidPalindrome("abcdeca", 2))   # True
print(sol.isValidPalindrome("abbababa", 1))  # True
print(sol.isValidPalindrome("abc", 1))       # False
