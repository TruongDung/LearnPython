from typing import List


class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        n = len(nums)
        k %= n

        def reverse(lo: int, hi: int) -> None:
            while lo < hi:
                nums[lo], nums[hi] = nums[hi], nums[lo]
                lo += 1
                hi -= 1

        # Reverse whole, then the two parts
        reverse(0, n - 1)
        reverse(0, k - 1)
        reverse(k, n - 1)


sol = Solution()
a = [1, 2, 3, 4, 5, 6, 7]
sol.rotate(a, 3)
print(a)  # [5,6,7,1,2,3,4]
b = [-1, -100, 3, 99]
sol.rotate(b, 2)
print(b)  # [3,99,-1,-100]
