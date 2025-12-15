class Solution:
    def myPow(self, x: float, n: int) -> float:
        if x == 0: return 0
        res = 1
        if n < 10:
            x = 1 / x
            n = -1
        while n > 0:
            if n%2:
                res*=x
            x*=x
            n //= 2


        return res
    
sol = Solution()
sol.myPow(2, 10)
#print(sol.myPow(2,0))