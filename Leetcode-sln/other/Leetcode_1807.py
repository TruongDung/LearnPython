import re
class Solution:
    def evaluate(self, s: str, knowledge: list[list[str]]) -> str:

        for a in knowledge:
            if a[0] in s:
                s = s.replace("(" + a[0] + ")", a[1])
            
        s = re.sub(r"\([^)]*\)", "?", s)

        return s

sol = Solution()
print(sol.evaluate("(name)is(age)yearsold", [["name","bob"],["age","two"]]))
