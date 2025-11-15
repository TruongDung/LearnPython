class Solution:
    def validMountainArray(self, arr: List[int]) -> bool:
        lenN = len(arr)
        i = 0
        while i +1 < lenN and arr[i] < arr[i+1]:
            i += 1
        
        if i == 0 or i == lenN-1:
                return False

        while i+1 < lenN and arr[i] > arr[i+1]:
            i += 1
            
            
        return i == lenN -1
    

sol = Solution()
print(sol.validMountainArray([2,0,2]))