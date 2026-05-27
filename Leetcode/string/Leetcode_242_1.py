from collections import Counter
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        
    #     for key, count in Counter(s).items():
    #         print(key, count)
    #     print(sorted(s))
    #     return sorted(s) == sorted(t)

        freq = [0]*26
        for index in range(len(s)):
            freq[ord(s[index])-ord('a')] += 1
            #freq[ord(t[index])-ord('a')] -= 1
        for value in freq:
            if value != 0:
                return False
        print(freq)
        return True
    
sol = Solution()
print(sol.isAnagram('abc', 'cba'))