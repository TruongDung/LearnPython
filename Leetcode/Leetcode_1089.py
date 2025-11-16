class Solution:
    def duplicateZeros(self, arr: List[int]) -> None:
        j = 0
        tem = 0
        for i in range(len(arr)):
            if arr[i] == 0 and i+2 < len(arr):
                temp = arr[i+1]
                arr[i+1] = 0
                arr[i+2] = temp

sol = Solution()
sol.duplicateZeros([1,0,2,3,0,4,5,0])