class Solution:
    def checkPerfectNumber(self, num: int) -> bool:
        if num == 1: return False
        sum1 = 0
        for i in range(2, int(num**0.5) + 1):
            if num%i == 0:
                sum1 += i + num//i
                

        if sum1 == num: return True

        return False

sol = Solution()
sol.checkPerfectNumber(28)