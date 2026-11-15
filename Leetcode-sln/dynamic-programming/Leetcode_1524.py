class Solution:
    def numOfSubarrays(self, arr):
        MOD = 10**9 + 7
        answer = 0
        for left in range(len(arr)):
            total = 0
            for right in range(left, len(arr)):
                total += arr[right]
                if total % 2:
                    answer = (answer + 1) % MOD
        return answer
