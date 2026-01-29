class Solution:
    def findKthPositive(self, arr: List[int], k: int) -> int:
        for num in arr:
            if num <= k:
                k += 1
            elif num > k:
                break
        return k
    
sol = Solution()
print(sol.findKthPositive([2,3,4,7,11], 5))
#print(sol.findKthPositive([1,2,3,4], 2))