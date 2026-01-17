class Solution:
    def maxFrequency(self, nums: List[int], k: int) -> int:
        l = 0
        total = 0
        res = 1

        for r in range(len(nums)):
            total += nums[r]

            while nums[r] * (r - l + 1) - total > k:
                total -= nums[l]
                l += 1

            res = max(res, r - l + 1)

        return res
    
sol = Solution()
print(sol.maxFrequency([1,2,4], 5))