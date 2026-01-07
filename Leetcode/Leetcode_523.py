class Solution:
<<<<<<< HEAD
    def checkSubarraySum(self, nums: List[int], k: int) -> bool:
        
=======
    def CheckSumArray(self, nums: List[int], k:int) -> bool:
        prefix_mod = 0
        mod_seen = {0:-1}
        for i in range(len(nums)):
            prefix_mod = (prefix_mod + nums[i])%k
            
            if prefix_mod in mod_seen:
                if i - mod_seen[prefix_mod] > 1: return True
            else:
                mod_seen[prefix_mod] = i
        return False
    

sol = Solution()
print(sol.CheckSumArray([1,5,2,1,5,2,1,3], 5))
>>>>>>> 5d5b04fd803f0282d0cdad0d3f124d660beb3381
