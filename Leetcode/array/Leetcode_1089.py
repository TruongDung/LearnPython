class Solution:
    def duplicateZeros(self, arr: List[int]) -> None:
        n = len(arr)

        i = n-1

        total_len = n
        for k in range(n):
            if arr[k] == 0:
                total_len += 1

        j = total_len - 1

        while i>=0:
            if arr[i] == 0:
                if j <= n-1:
                    arr[j] = 0
                j-=1
                if j <= n-1:
                    arr[j] = 0
                j-=1
                i-=1
            else:
                if j <= n-1:
                    arr[j] = arr[i]
                j-=1
                i-=1
        return arr

sol = Solution()
print(sol.duplicateZeros([1,0,2,3,0,4,5,0]))