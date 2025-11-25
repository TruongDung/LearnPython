from collections import defaultdict
class Solution:
    def anagramMappings(self, nums1: List[int], nums2: List[int]) -> List[int]:
        if len(nums1) != len(nums2):
            return []
        dict2 = defaultdict(int)
        res = [0]*len(nums1)
        for i, val in enumerate(nums2):
            dict2[val] = i
        for i,val in enumerate(nums1):
            res[i] = dict2[val]
        return res
    
sol = Solution()
sol.anagramMappings([12,28,46,32,50], [50,12,32,46,28])