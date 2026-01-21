from collections import defaultdict


class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        m = defaultdict(int)

        for i in nums:
            m[i] += 1
            
            if m[i] > len(nums)//2:
                return i
        return 0
sol = Solution()
print(sol.majorityElement([3,2,3]))