from typing import List
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        # 2 loop
        count = 0
        prefix_sum = 0
        prefix_map = {0: 1}  # tổng = 0 xuất hiện 1 lần (quan trọng để tính từ đầu mảng)

        for num in nums:
            prefix_sum += num

            # Nếu có prefix trước đó = prefix_sum - k, cộng số lần xuất hiện vào count
            if prefix_sum - k in prefix_map:
                count += prefix_map[prefix_sum - k]

            # Cập nhật tần suất của prefix_sum hiện tại
            prefix_map[prefix_sum] = prefix_map.get(prefix_sum,0) + 1

        return count

    
    
    
sol = Solution()
# print(sol.subarraySum([1,2,3,4,5], 2))  # Output: 2
print(sol.subarraySum([1,1,1], 2))  # Output: 2
print(sol.subarraySum([1,2,3], 3))  # Output: 2 
print(sol.subarraySum([1,2,3,4], 7))  # Output: 1 
#Time Limit Exceeded
