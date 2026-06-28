from typing import List

class Solution:
    def leftRightDifference(self, nums: List[int]) -> List[int]:

        n = len(nums)

        left_sum = [0] * n
        right_sum = [0] * n

        # prefix sum bên trái
        for i in range(1, n):
            left_sum[i] = left_sum[i - 1] + nums[i - 1]

        # prefix sum bên phải
        for i in range(n - 2, -1, -1):
            right_sum[i] = right_sum[i + 1] + nums[i + 1]

        result = [0] * n

        for i in range(n):
            result[i] = abs(left_sum[i] - right_sum[i])

        return result
        
sol = Solution()
print(sol.leftRightDifference([10,4,8,3]))
