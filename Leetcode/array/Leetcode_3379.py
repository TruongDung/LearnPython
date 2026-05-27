class Solution:
    def constructTransformedArray(self, nums: List[int]) -> List[int]:
        n = len(nums)
        res = [0] * n
        for i, j in enumerate(nums):
            res.append(nums[(i+j)%n])

        return res
    
sol = Solution()
print(sol.constructTransformedArray([3,-2,1,1]))