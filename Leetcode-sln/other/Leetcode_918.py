class Solution:
    def maxSubarraySumCircular(self, nums: List[int]) -> int:
        total = sum(nums)

        # Maximum subarray (Kadane)
        curr_max = max_sum = nums[0]

        # Minimum subarray
        curr_min = min_sum = nums[0]

        for x in nums[1:]:
            curr_max = max(x, curr_max + x)
            max_sum = max(max_sum, curr_max)

            curr_min = min(x, curr_min + x)
            min_sum = min(min_sum, curr_min)

        # All numbers are negative
        if max_sum < 0:
            return max_sum

        # Either normal max subarray or circular max subarray
        return max(max_sum, total - min_sum)