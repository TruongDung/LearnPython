class Solution:
    def myAtoi(self, s: str) -> int:
        i, n = 0, len(s)
        # 1) skip leading spaces
        while i < n and s[i] == ' ':
            i += 1

        # 2) optional sign
        sign = 1
        if i < n and s[i] in '+-':
            if s[i] == '-':
                sign = -1
            i += 1

        # 3) read digits
        num = 0
        while i < n and s[i].isdigit():
            num = num * 10 + int(s[i])
            i += 1

        num *= sign
        # 4) clamp to 32-bit signed range
        return max(-2 ** 31, min(2 ** 31 - 1, num))


sol = Solution()
print(sol.myAtoi("42"))          # 42
print(sol.myAtoi("   -042"))     # -42
print(sol.myAtoi("1337c0d3"))    # 1337
print(sol.myAtoi("-91283472332"))  # -2147483648
