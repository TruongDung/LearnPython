class Solution:
    def countPartitions(self, nums: List[int]) -> int:
    #     countEven = 0
    #     n = len(nums)
    #     for i in range(len(nums)):
    #         s1 = self.sumPart(nums, 0, i) 
    #         s2 = self.sumPart(nums, i+1, n-1)

    #         if (s1 - s2) %2 == 0 and s2>0:
    #             countEven += 1

    #     return countEven

    # def sumPart(self, nums: List[int], a: int, b:int) -> int:
    #     s = 0
    #     for i in range (len(nums)):
    #         if i >= a and i <= b:
    #             s += nums[i]
    #     return s

        if sum(nums) % 2: return 0
        return len(nums) - 1
    
sol = Solution()
print(sol.countPartitions([10,10,3,7,6]))