class Solution:
    def minAddToMakeValid(self, s: str) -> int:
        count = 0
        stack = []
        for i in s:
            if stack and i == ")":
                stack.pop()
            stack.append(i)
        
        return count

sol = Solution()
print(sol.minAddToMakeValid("())"))