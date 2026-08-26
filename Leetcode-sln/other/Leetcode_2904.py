class Solution:
    def shortestBeautifulSubstring(self, s: str, k: int) -> str:
        
        if s.count('1') < k:
            return ""

        left = 0
        count_1 = 0
        best = ""

        for right in range(len(s)):
            if s[right] == '1':
                count_1 += 1

            while count_1 > k:
                if s[left] == '1':
                    count_1 -= 1
                left += 1

            while count_1 == k and s[left] == '0':
                left += 1

            if count_1 == k:
                candidate = s[left:right + 1]

                if (
                    best == ""
                    or len(candidate) < len(best)
                    or (len(candidate) == len(best) and candidate < best)
                ):
                    best = candidate

        return best

sol = Solution()
print(sol.shortestBeautifulSubstring("10100010", 5))