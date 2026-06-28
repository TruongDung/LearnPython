class Solution:
    def minAddToMakeValid(self, s: str) -> int:
        count = 0
        stack = []
        for i in s:
            if i == "(":
                stack.append(i)
            else:
                if len(stack)>0 and i == ")":
                    stack.pop()
                else:
                    count += 1

        return count + len(stack)

sol = Solution()
print(sol.minAddToMakeValid("())"))
