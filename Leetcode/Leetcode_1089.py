class Solution:
    def duplicateZeros(self, arr: List[int]) -> None:
        zeroes = arr.count(0)
        n = len(arr)
        for i in range(n-1, -1, -1):
            if i + zeroes < n:
                print('if 1')
                arr[i + zeroes] = arr[i]
                print(arr)

            if arr[i] == 0: 
                print('if 2')
                zeroes -= 1
                if i + zeroes < n:
                    arr[i + zeroes] = 0
        #print(arr)
        return arr

sol = Solution()
print(sol.duplicateZeros([1,0,2,3,0,4,5,0]))