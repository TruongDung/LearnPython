class Solution:
    def numOfSubarrays(self, arr):
        MOD = 10**9 + 7
        even, odd = 1, 0
        parity = 0
        answer = 0
        for i, value in enumerate(arr):
            parity = (parity + value) % 2
            if parity:
                answer = (answer + even) % MOD
                odd += 1
            else:
                answer = (answer + odd) % MOD
                even += 1
        return answer
