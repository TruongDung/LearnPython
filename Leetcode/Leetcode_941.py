class Solution:
    def validMountainArray(self, a: List[int]) -> bool:
        n = len(a)
        if n < 3: return False 

        i, j = 0, n-1

        
        while i+1 < n and a[i] < a[i+1]:
            i += 1

       
        while j-1 >= 0 and a[j] < a[j-1]:
            j -= 1

        
        return 0 < i == j < n-1
    

sol = Solution()
print(sol.validMountainArray([0,2,3,4,5,2,1,0]))