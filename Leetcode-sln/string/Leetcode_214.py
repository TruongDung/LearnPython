class Solution:
    def shortestPalindrome(self, s: str) -> str:
        reverse = s[::-1]
        pattern = s + "#" + reverse
        lps = [0] * len(pattern)
        for i in range(1, len(pattern)):
            length = lps[i - 1]
            while length and pattern[i] != pattern[length]:
                length = lps[length - 1]
            if pattern[i] == pattern[length]:
                length += 1
            lps[i] = length
        palindrome_prefix = lps[-1]
        suffix = s[palindrome_prefix:]
        return suffix[::-1] + s


if __name__ == "__main__":
    solution = Solution()
    assert solution.shortestPalindrome("aacecaaa") == "aaacecaaa"
    assert solution.shortestPalindrome("abcd") == "dcbabcd"
    assert solution.shortestPalindrome("") == ""
