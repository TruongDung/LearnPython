class Solution:
    def minimumCost(self, nums: List[int]) -> int:
        # cost của subarray đầu tiên luôn là nums[0]
        first = nums[0]
        
        # lấy 2 số nhỏ nhất trong phần còn lại
        rest = sorted(nums[1:])
        
        return first + rest[0] + rest[1]
    
sol = Solution()
#print(sol.minimumCost([1,2,3,12]))
print(sol.minimumCost([10,6,3,4,5,2,9,11,5]))