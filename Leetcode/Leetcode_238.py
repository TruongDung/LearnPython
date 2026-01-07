class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        res = [1] * n

        product = 1
        for i in range(1, n):
            res[i] = nums[i-1] * res[i-1]

        product = 1
        for i in range(n - 1, -1, -1):
            res[i] = res[i] * product
            product =product * nums[i]

        return res
    
sol = Solution()
sol.productExceptSelf([1,2,3,4])