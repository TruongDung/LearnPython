class Solution:
    def validMountainArray(self, arr: List[int]) -> bool:
        if len(arr)<3: return False
        i = 0 
        j = len(arr) - 1

        while i < len(arr) and arr[i]< arr[i+1]:
            i += 1

        while j>0 and arr[j-1]> arr[j]:
            j -= 1

        if i == j: return True

        return False
    

sol = Solution()
#print(sol.validMountainArray([0,2,3,4,5,2,1,0]))
print(sol.validMountainArray([0,3,2,1]));