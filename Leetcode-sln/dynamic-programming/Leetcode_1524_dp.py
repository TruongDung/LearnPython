class Solution:
    def numOfSubarrays(self, arr):
        MOD = 10**9 + 7
        odd, even = 0, 0
        answer = 0
        for i, value in enumerate(arr):
            if value % 2:
                odd, even = even + 1, odd
            else:
                odd, even = odd, even + 1
            answer = (answer + odd) % MOD
        return answer
