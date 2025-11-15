class Solution:
    def findNumbers(self, nums: List[int]) -> int:
        count = 0
        for i in range(len(nums)):
            if self.countDigit(nums[i]) %2 == 0:
                count += 1
        return count
    
    def countDigit(self, num: int) -> int:
        count = 0
        while num>0:
            num = num // 10
            count += 1
        return count
    
sol = Solution()
print(sol.findNumbers([555,901,482,1771]))