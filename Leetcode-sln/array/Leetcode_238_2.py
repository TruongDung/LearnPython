from typing import List


class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = [1] * n

        # 1) prefix products (product of everything to the left)
        prefix = 1
        for i in range(n):
            answer[i] = prefix
            prefix *= nums[i]

        # 2) suffix products (product of everything to the right)
        suffix = 1
        for i in range(n - 1, -1, -1):
            answer[i] *= suffix
            suffix *= nums[i]

        return answer


sol = Solution()
print(sol.productExceptSelf([1, 2, 3, 4]))     # [24,12,8,6]
print(sol.productExceptSelf([-1, 1, 0, -3, 3])) # [0,0,9,0,0]
