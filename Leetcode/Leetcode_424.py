from collections import Counter
class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        freq = Counter()
        l = 0
        longest = 0
        for r in range(len(s)):
            freq[s[r]] += 1
            while r - l + 1 - max(freq.values()) > k:
                freq[s[l]] -= 1
                l += 1
            longest = max(longest, r - l + 1)
        return longest
    
sol = Solution()
#print(sol.characterReplacement("ABAB", 2))
#print(sol.characterReplacement("AABABBA", 2))
print(sol.characterReplacement)