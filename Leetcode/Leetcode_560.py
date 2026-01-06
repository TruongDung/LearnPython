class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
            self.prefixSum([1,2,3,4])
            sub_num = {0:1}
            total = count = 0

            for n in nums:
                total += n
                
                if total - k in sub_num:
                    count += sub_num[total-k]
                
                sub_num[total] = 1 + sub_num.get(total, 0)
            
            return count
    
    def prefixSum(self, nums):
        prefix = [0]*len(nums)
        prefix[0] = nums[0]
        for i in range(1,len(nums)):
            prefix[i] = prefix[i-1] + nums[i]
             

         

sol = Solution()

sol.subarraySum([1,1,1], 2)