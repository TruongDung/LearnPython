class Solution:
    def myAtoi(self, s: str) -> int:

        i = 0
        n = len(s)

        # 1. skip space
        while i < n and s[i] == ' ':
            i += 1

        # 2. sign
        sign = 1
        if i < n and (s[i] == '+' or s[i] == '-'):
            if s[i] == '-':
                sign = -1
            i += 1

        # 3. read number
        num = 0

        while i < n and s[i].isdigit():
            digit = ord(s[i]) - ord('0')

            num = num * 10 + digit

            # 4. clamp sớm (tránh overflow)
            if sign == 1 and num > 2**31 - 1:
                return 2**31 - 1
            if sign == -1 and num > 2**31:
                return -2**31

            i += 1

        return sign * num