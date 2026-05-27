from collections import defaultdict
class Solution:
    def lengthOfLongestSubstringKDistinct(self, s: str, k: int) -> int:
        i = 0
        m = defaultdict(int)
        max_length = 0

        for j in range(len(s)):
            m[s[j]] += 1

            while(len(m)) > k:
                f = m[s[i]]
                if f == 1:
                    del m[s[i]]
                else:
                    m[s[i]] = f - 1
                i += 1

            max_length = max(max_length, j-i+1)

        return max_length
    
sol = Solution()
print(sol.lengthOfLongestSubstringKDistinct("eceba", 2))