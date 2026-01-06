from collections import defaultdict

class Solution:
    def repeatedNTimes(self, nums: List[int]) -> int:
        dic = {}
        for i in nums:
            if i in dic:
                return i
            else:
                dic[i]=1
    
sol = Solution()
print(sol.repeatedNTimes([5,1,5,2,5,3,5,4]))