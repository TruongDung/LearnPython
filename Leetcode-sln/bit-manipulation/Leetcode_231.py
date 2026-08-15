class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        # A power of two has exactly one set bit → n & (n-1) == 0
        return n > 0 and (n & (n - 1)) == 0


sol = Solution()
print(sol.isPowerOfTwo(1))   # True
print(sol.isPowerOfTwo(16))  # True
print(sol.isPowerOfTwo(3))   # False
print(sol.isPowerOfTwo(0))   # False
