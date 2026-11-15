class Solution:
    def longestSquareStreak(self, nums):
        values = set(nums)
        best = 0
        for start in sorted(values):
            x = start
            length = 0
            while x in values:
                length += 1
                x *= x
            best = max(best, length)
        return best if best >= 2 else -1
