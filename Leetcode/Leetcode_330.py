class Solution:
    def containsNearbyAlmostDuplicate(self, nums: List[int], indexDiff: int, valueDiff: int) -> bool:
        if valueDiff < 0: return False # edge case 
        
        seen = {}
        for i, x in enumerate(nums): 
            bkt = x//(valueDiff+1)
            if bkt in seen and i - seen[bkt][0] <= indexDiff: return True 
            if bkt-1 in seen and i - seen[bkt-1][0] <= indexDiff and abs(x - seen[bkt-1][1]) <= valueDiff: return True 
            if bkt+1 in seen and i - seen[bkt+1][0] <= indexDiff and abs(x - seen[bkt+1][1]) <= valueDiff: return True 
            seen[bkt] = (i, x) 
        return False 