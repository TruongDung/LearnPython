class Solution:
    def numOfSubarrays(self, arr, k, threshold):
        need = threshold * k
        window_sum = sum(arr[:k])
        count = 0

        if window_sum >= need:
            count += 1

        for i in range(k, len(arr)):
            window_sum += arr[i]        # thêm bên phải
            window_sum -= arr[i - k]    # bỏ bên trái

            if window_sum >= need:
                count += 1

        return count
    
sol = Solution()
#print(sol.numOfSubarrays([2,2,2,2,5,5,5,8], 3, 4))
print(sol.numOfSubarrays([7,7,7,7,7,7,7], 7, 7))