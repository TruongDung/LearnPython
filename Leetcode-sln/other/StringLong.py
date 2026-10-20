from typing import List

"dp[num] = max(dp[num], dp[num-1]+1)"
def longest(nums: List[int]) -> int:
    dp = {}
    max_len = 0
    
    for num in nums:
        dp[num] = dp.get(num-1, 0) + 1
        max_len = max(max_len, dp[num])

    return max_len

print(longest([2,1,3,2,4,3,2,5,4,5]))
