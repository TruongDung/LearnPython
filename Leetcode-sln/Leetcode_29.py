class Solution:
    def divide(self, dividend: int, divisor: int) -> int:
        INT_MIN, INT_MAX = -2 ** 31, 2 ** 31 - 1

        # Overflow case
        if dividend == INT_MIN and divisor == -1:
            return INT_MAX

        negative = (dividend < 0) != (divisor < 0)
        a, b = abs(dividend), abs(divisor)
        quotient = 0

        # Subtract shifted multiples of b (doubling)
        while a >= b:
            temp, multiple = b, 1
            while a >= (temp << 1):
                temp <<= 1
                multiple <<= 1
            a -= temp
            quotient += multiple

        return -quotient if negative else quotient


sol = Solution()
print(sol.divide(10, 3))   # 3
print(sol.divide(7, -3))   # -2
print(sol.divide(-2147483648, -1))  # 2147483647
