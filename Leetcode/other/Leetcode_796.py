class Solution:
    def rotateString(self, s: str, goal: str) -> bool:
        for i in range(len(s)):
            print('s1 : ' + s[i:] + ' s2 : ' + s[:i])
            if s[i:] + s[:i] == goal:
                return True
            
        return False
            