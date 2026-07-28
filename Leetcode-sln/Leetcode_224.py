class Solution:
    def calculate(self, s: str) -> int:
        result = 0
        sign = 1
        num = 0
        stack = []  # saved (result, sign) before each '('

        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)
            elif ch in '+-':
                result += sign * num
                num = 0
                sign = 1 if ch == '+' else -1
            elif ch == '(':
                # push current context, restart inside the parentheses
                stack.append(result)
                stack.append(sign)
                result = 0
                sign = 1
            elif ch == ')':
                result += sign * num
                num = 0
                result *= stack.pop()      # sign before '('
                result += stack.pop()      # result before '('

        return result + sign * num


sol = Solution()
print(sol.calculate("1 + 1"))               # 2
print(sol.calculate(" 2-1 + 2 "))           # 3
print(sol.calculate("(1+(4+5+2)-3)+(6+8)")) # 23
