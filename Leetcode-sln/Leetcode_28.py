class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        if m == 0:
            return 0

        # Try each possible start; compare the window with needle
        for i in range(n - m + 1):
            if haystack[i:i + m] == needle:
                return i

        return -1


sol = Solution()
print(sol.strStr("sadbutsad", "sad"))    # 0
print(sol.strStr("leetcode", "leeto"))   # -1
print(sol.strStr("hello", "ll"))         # 2
