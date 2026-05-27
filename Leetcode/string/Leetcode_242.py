class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        dictS = {}
        dictT = {}

        for i in range(len(s)):
            if s[i] in dictS:
                dictS[s[i]] += 1
            else:
                dictS[s[i]] = 1
        for i in range(len(t)):
            if t[i] in dictT:
                dictT[t[i]] += 1
            else:
                dictT[t[i]] = 1

        if len(dictS) != len(dictT):
            return False
        
        for key in dictS:
            if not key in dictT:
                return False
            if dictS[key] != dictT[key]:
                return False
        
        return True

    

    
sol = Solution()
print(sol.isAnagram('anagram', 'nagaram'))