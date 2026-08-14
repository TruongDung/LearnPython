from collections import Counter


class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not s or not t:
            return ""

        need = Counter(t)
        missing = len(t)
        left = 0
        start, end = 0, 0

        for right, char in enumerate(s):
            if need[char] > 0:
                missing -= 1
            need[char] -= 1

            # When window contains all chars of t, shrink from left
            while missing == 0:
                if end == 0 or right - left + 1 < end - start:
                    start, end = left, right + 1

                need[s[left]] += 1
                if need[s[left]] > 0:
                    missing += 1
                left += 1

        return s[start:end]


sol = Solution()
print(sol.minWindow("ADOBECODEBANC", "ABC"))  # "BANC"
print(sol.minWindow("a", "a"))                # "a"
print(sol.minWindow("a", "aa"))               # ""
