class Solution:
    def shortestBeautifulSubstring(self, s: str, k: int) -> str:
        left = ones = 0
        best = ""
        for right, ch in enumerate(s):
            if ch == "1":
                ones += 1
            while ones > k:
                if s[left] == "1":
                    ones -= 1
                left += 1
            while ones == k:
                cand = s[left:right + 1]
                if best == "" or len(cand) < len(best) or (len(cand) == len(best) and cand < best):
                    best = cand
                if s[left] == "1":
                    ones -= 1
                left += 1
        return best

sol = Solution()
print(sol.shortestBeautifulSubstring("10100010", 5))
