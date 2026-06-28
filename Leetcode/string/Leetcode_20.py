class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        for char in s:
            if char == '(':
                stack.append(')')
            elif char == '{':
                stack.append('}')
            elif char == '[':
                stack.append(']')
            elif len(stack) == 0 or stack.pop() != char:
                return False
        return len(stack) == 0


    
sol = Solution()
print(sol.isValid("([])"))