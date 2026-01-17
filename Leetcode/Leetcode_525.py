class Solution:
    def findMaxLength(self, nums: List[int]) -> int:

        dic = {0:-1}

        ans = 0
        count = 0

        for i in range(len(nums)):
            if nums[i] == 1:
                count += 1
            else:
                count -= 1
            
            if count in dic:
                ans = max(ans, i - dic[count])
            else:
                dic[count] = i
        
        return ans
    
sol = Solution()
print(sol.findMaxLength([0,1,0,0,1,1,0]))
sol.findMaxLength([0,1,0,0,1,1,0])
