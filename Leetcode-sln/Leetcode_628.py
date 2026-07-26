from typing import List


class Solution:
    def maximumProduct(self, nums: List[int]) -> int:
        first = second = third = float('-inf')
        minFirst = minSecond = float('inf')
        for digit in nums:
            if digit > first:
                third = second
                second = first
                first = digit
            elif digit > second:
                third = second
                second = digit
            elif digit > third:
                third = digit
            if digit < minFirst:
                minSecond = minFirst
                minFirst = digit
            elif digit < minSecond:
                minSecond = digit
        return max(first * second * third, minFirst * minSecond * first)

sol = Solution()
sol.maximumProduct([-1, -2, -3])
