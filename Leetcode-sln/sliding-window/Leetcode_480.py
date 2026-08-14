import heapq
from collections import defaultdict
from typing import List


class Solution:
    def medianSlidingWindow(self, nums: List[int], k: int) -> List[float]:
        small = []  # max-heap (store negatives) - lower half
        large = []  # min-heap - upper half
        delayed = defaultdict(int)  # numbers scheduled for lazy removal
        small_size = 0
        large_size = 0
        result = []

        def prune(heap):
            # Discard elements at the top that were marked for deletion
            while heap:
                num = -heap[0] if heap is small else heap[0]
                if delayed[num] > 0:
                    delayed[num] -= 1
                    heapq.heappop(heap)
                else:
                    break

        def rebalance():
            nonlocal small_size, large_size
            # small can hold at most one more than large
            if small_size > large_size + 1:
                heapq.heappush(large, -heapq.heappop(small))
                small_size -= 1
                large_size += 1
                prune(small)
            elif small_size < large_size:
                heapq.heappush(small, -heapq.heappop(large))
                large_size -= 1
                small_size += 1
                prune(large)

        def median():
            if k % 2 == 1:
                return float(-small[0])
            return (-small[0] + large[0]) / 2

        for i, num in enumerate(nums):
            # Insert num
            if not small or num <= -small[0]:
                heapq.heappush(small, -num)
                small_size += 1
            else:
                heapq.heappush(large, num)
                large_size += 1
            rebalance()

            # Remove the element leaving the window
            if i >= k:
                out = nums[i - k]
                delayed[out] += 1
                if out <= -small[0]:
                    small_size -= 1
                    if out == -small[0]:
                        prune(small)
                else:
                    large_size -= 1
                    if out == large[0]:
                        prune(large)
                rebalance()

            if i >= k - 1:
                result.append(median())

        return result


sol = Solution()
print(sol.medianSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3))
# [1.0, -1.0, -1.0, 3.0, 5.0, 6.0]
print(sol.medianSlidingWindow([1, 2, 3, 4], 2))  # [1.5, 2.5, 3.5]
