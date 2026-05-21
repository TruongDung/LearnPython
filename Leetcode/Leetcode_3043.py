class Solution:
    def longestCommonPrefix(self, arr1: List[int], arr2: List[int]) -> int:
        i = 0
        j = 0
        while i < len(arr1) and j < len(arr2):
            if arr1[i] != arr2[j]:
                break
            i += 1
            j += 1
        return i
    
sol = Solution()
print(sol.longestCommonPrefix([1,2,3,4,5], [1,2,3,4,5]))