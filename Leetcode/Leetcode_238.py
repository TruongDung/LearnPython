class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        left_product = [0]*len(nums)
        right_product = [0]*len(nums)
        product = 1
        for i in range(len(nums)):
            product *= nums[i]
            left_product[i] = product
       
        product = 1
        for i in range(len(nums)-1, -1, -1):
            product *= nums[i]
            right_product[i] = product


        res = [0] * len(nums)
        n = len(nums)
        for i in range(len(nums)):
            if i == 0:
                res[i] = right_product[i+1]
            elif i == n-1:
                res[i] = left_product[i-1]
            else:
                res[i] = left_product[i-1] * right_product[i+1]


        return res
    
sol = Solution()
sol.productExceptSelf([1,2,3,4])