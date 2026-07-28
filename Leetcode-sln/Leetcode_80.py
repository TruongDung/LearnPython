from typing import List


class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        # write index; each value may appear at most twice
        write = 0
        for num in nums:
            if write < 2 or num != nums[write - 2]:
                nums[write] = num
                write += 1
        return write


sol = Solution()
a = [1, 1, 1, 2, 2, 3]
k = sol.removeDuplicates(a)
print(k, a[:k])  # 5 [1,1,2,2,3]
b = [0, 0, 1, 1, 1, 1, 2, 3, 3]
k = sol.removeDuplicates(b)
print(k, b[:k])  # 7 [0,0,1,1,2,3,3]
