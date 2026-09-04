class Solution:
    def firstStableIndex(self, nums: list[int], k: int) -> int:
        n = len(nums)
        first_arr = []
        second_arr = nums[:]
        instability_arr = []

        for num in nums:
            first_arr.append(num)

            max_val = max(first_arr)
            min_val = min(second_arr)
            instability_arr.append(max_val - min_val)
            second_arr.pop(0)

        for i, val in enumerate(instability_arr):
            if val <= k:
                return i

        return -1

sol = Solution()
print(sol.firstStableIndex([5,0,1,4], 3))

# class Solution:
#     def firstStableIndex(self, nums: list[int], k: int) -> int:
#         n = len(nums)
#         min_num = [nums[-1]] * n
#         for i in range(n - 2, -1, -1):
#             min_num[i] = min(min_num[i + 1], nums[i])
#         max_num = nums[0]
#         for i in range(n):
#             max_num = max(max_num, nums[i])
#             if max_num - min_num[i] <= k:
#                 return i
#         return -1
