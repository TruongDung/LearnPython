import math

class Solution:
    def isPowerOfThree(self, n: int) -> bool:
        if n<=0: return False

        for i in range(2, int(math.sqrt(n))):
            a1 = self.myPow(3,i)
            if self.myPow(3, i) == n:
                return True
        return False
    
    def myPow(self, x: float, n: int) -> float:
        if x==0:
            return 0
        res=1
        if n<0:
            x=1/x
            n=-n
        while n > 0:
            if n%2:
                res*=x
            x*=x
            n //= 2
        return res

sol = Solution()
sol.isPowerOfThree(27)