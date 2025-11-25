from collections import defaultdict
class Solution:
    def anagramMappings(self, nums1: List[int], nums2: List[int]) -> List[int]:
       
        hashmap = defaultdict(int) 
        
        for index, val in enumerate(nums2):
            hashmap[val] = index
        
        
        for index, val in enumerate(nums1):
            nums1[index] = hashmap[val]
        
        return nums1
    
sol = Solution()
sol.anagramMappings([12,28,46,32,50], [50,12,32,46,28])