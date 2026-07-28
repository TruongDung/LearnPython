from collections import deque
from typing import List


class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        dq = deque()  # stores indices, values decreasing
        result = []

        for i, num in enumerate(nums):
            # Remove indices whose values are smaller than current (useless)
            while dq and nums[dq[-1]] < num:
                dq.pop()
            dq.append(i)

            # Remove front index if it is outside the window
            if dq[0] <= i - k:
                dq.popleft()

            # Window has formed its first k elements
            if i >= k - 1:
                result.append(nums[dq[0]])

        return result


sol = Solution()
print(sol.maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3,3,5,5,6,7]
print(sol.maxSlidingWindow([1], 1))                          # [1]
