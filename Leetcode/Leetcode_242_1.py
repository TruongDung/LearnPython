from collections import Counter
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        
        for key, count in Counter(s).items():
            print(key, count)
        print(sorted(s))
        return sorted(s) == sorted(t)
    
sol = Solution()
print(sol.isAnagram('anagram', 'nagaram'))