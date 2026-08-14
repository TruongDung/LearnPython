class Solution:
    def maximumLengthSubstring(self, s: str) -> int:
        left = 0
        max_occ = 0
        dic_s = {}

        for right in range(len(s)):
            dic_s[s[right]] = dic_s.get(s[right], 0 ) +1
            while dic_s[s[right]] > 2:
                dic_s[s[left]] -= 1
                left += 1

            max_occ = max(max_occ, right - left + 1)

        return max_occ

sol = Solution()
print(sol.maximumLengthSubstring("bcbbbcba"))
