class Solution:
    def containsNearbyAlmostDuplicate(self, nums: List[int], indexDiff: int, valueDiff: int) -> bool:
        if valueDiff < 0: return False # edge case 
        
        seen = {}
        for i, num in enumerate(nums): 
            valueCheck = num//(valueDiff+1)
            if valueCheck in seen and i - seen[valueCheck][0] <= indexDiff: return True 
            if valueCheck-1 in seen and i - seen[valueCheck-1][0] <= indexDiff and abs(num - seen[valueCheck-1][1]) <= valueDiff: return True 
            if valueCheck+1 in seen and i - seen[valueCheck+1][0] <= indexDiff and abs(num - seen[valueCheck+1][1]) <= valueDiff: return True 
            seen[valueCheck] = (i, num) 
        return False 
    
sol = Solution()
sol.containsNearbyAlmostDuplicate([1,2,3,1], 3, 0)