class Solution:
    def mySqrt(self, x: int) -> int:
        start = 1
        end = x // 2

        while start < end:
            mid = (start + end) // 2

            v = mid* mid
            if v == x:
                return v
            elif v > x:
                start = mid + 1
            elif v < x:
                end = mid

        return start
