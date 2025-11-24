class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False

        d = {}
        for i in range(len(s)):
            if s[i] in d:
                if d[s[i]] != t[i]:
                    return False
            d[s[i]] = t[i]
        
        e = {}

        for i in range(len(t)):
            if t[i] in e:
                if d[t[i]] != s[i]:
                    return False
            e[t[i]] = s[i]

        return True
    
sol = Solution()
sol.isIsomorphic("badc", "baba")