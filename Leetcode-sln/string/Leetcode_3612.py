class Solution:
    def processStr(self, s: str) -> str:
        result = []
        for ch in s:
            if ch == '*':
                if result:
                    result.pop()
            elif ch == '#':
                result = result + result
            elif ch == '%':
                result.reverse()
            else:
                result.append(ch)
        return ''.join(result)


sol = Solution()
print(sol.processStr("a#b%*"))
