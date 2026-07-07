class Solution:
    def sumAndMultiply(self, n: int) -> int:
        s = 0
        temp = 0
        while n>0:
            digit0 = n%10
            s += digit0

            if digit0 !=0:
                temp = temp * 10 + digit0
            n = n//10

        # reserve
        rev = 0
        while temp > 0:
            rev = rev * 10 + temp%10
            temp //= 10

sol = Solution()
print(sol.sumAndMultiply(10203004))