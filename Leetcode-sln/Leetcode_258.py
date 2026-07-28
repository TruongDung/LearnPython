class Solution:
    def addDigits(self, num: int) -> int:
        # Repeatedly replace num with the sum of its digits
        # until only a single digit remains (the digital root).
        while num >= 10:
            total = 0
            while num > 0:
                total += num % 10
                num //= 10
            num = total

        return num


sol = Solution()
print(sol.addDigits(38))  # 2  (3+8=11 -> 1+1=2)
print(sol.addDigits(0))   # 0
print(sol.addDigits(9))   # 9
