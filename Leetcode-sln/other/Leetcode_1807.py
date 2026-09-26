import re
class Solution:
    def evaluate(self, s: str, knowledge: list[list[str]]) -> str:

        # for a in knowledge:
        #     if a[0] in s:
        #         s = s.replace("(" + a[0] + ")", a[1])
            
        # s = re.sub(r"\([^)]*\)", "?", s)

        # return s

        lookup = dict(knowledge)

        result = []
        i = 0

        while i < len(s):
            if s[i] == "(":
                j = s.find(")", i)

                key = s[i + 1:j]

                result.append(lookup.get(key, "?"))

                i = j + 1
            else:
                result.append(s[i])
                i += 1

        return "".join(result)

sol = Solution()
print(sol.evaluate("(name)is(age)yearsold", [["name","bob"],["age","two"]]))
