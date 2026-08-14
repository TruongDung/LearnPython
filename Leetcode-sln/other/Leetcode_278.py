# isBadVersion(version) is a pre-defined API on LeetCode.
# For a self-contained, runnable file we simulate it with a threshold.
FIRST_BAD = 4


def isBadVersion(version: int) -> bool:
    return version >= FIRST_BAD


class Solution:
    def firstBadVersion(self, n: int) -> int:
        low, high = 1, n

        # Binary search for the leftmost bad version.
        while low < high:
            mid = low + (high - low) // 2
            if isBadVersion(mid):
                high = mid          # mid may be the first bad one
            else:
                low = mid + 1       # first bad must be to the right

        return low


sol = Solution()
print(sol.firstBadVersion(5))   # 4
print(sol.firstBadVersion(1))   # 1
