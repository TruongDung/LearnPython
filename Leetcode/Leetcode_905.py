class Solution:
    def sortArrayByParity(self, nums: List[int]) -> List[int]:
        n = len(nums)
        i = 0
        j = n - 1
        for i in range(n):
            if nums[i] % 2 !=0:
                if nums[j] %2 == 0:
                    # swap
                    temp = nums[j]
                    nums[j] = nums[i]
                    nums[i] = temp
                    j -= 1
        return nums
                
sol = Solution()
sol.sortArrayByParity([3,1,2,4])