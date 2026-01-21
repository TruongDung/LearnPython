class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {
        ')': '(',
        '}': '{',
        ']': '['
        }
        if not s or s[0] in pairs:
            return False
        
        stack = []

        for c in s:
            if not stack and c in pairs:
                return False
            if c in pairs and stack:
                top = stack.pop()
                if pairs[c] != top:
                    return False
            else:
                stack.append(c)
        return not stack
    
sol = Solution()
print(sol.isValid("{[]}"))