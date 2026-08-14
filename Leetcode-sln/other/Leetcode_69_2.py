class Solution:
    def mySqrt(self, x: int) -> int:
        if x < 2:
            return x

        # Binary search for the largest m with m*m <= x
        lo, hi = 1, x // 2
        while lo <= hi:
            mid = (lo + hi) // 2
            square = mid * mid
            if square == x:
                return mid
            if square < x:
                lo = mid + 1
            else:
                hi = mid - 1

        return hi  # hi is the floor of sqrt(x)


sol = Solution()
print(sol.mySqrt(4))   # 2
print(sol.mySqrt(8))   # 2
print(sol.mySqrt(1))   # 1
print(sol.mySqrt(0))   # 0
