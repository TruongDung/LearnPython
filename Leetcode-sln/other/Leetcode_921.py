class Solution:
    def minAddToMakeValid(self, s: str) -> int:
        """
        ()) --> (())

        ((( --> ((()))

        stact = []
        """
        count = 0
        stack = []
        for char in s:
            if char == "(":
                stack.append(char)
            else:
                if len(stack) > 0 and char == ")":
                    stack.pop()
                else:
                    count += 1

        return len(stack) + count


sol = Solution()
print(sol.minAddToMakeValid("())"))
