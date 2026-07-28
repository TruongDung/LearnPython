from typing import List


class Solution:
    def sortColors(self, nums: List[int]) -> None:
        # Dutch National Flag: low, mid scan, high
        low, mid, high = 0, 0, len(nums) - 1

        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:  # nums[mid] == 2
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1
                # Do not advance mid: swapped-in value is unexamined


sol = Solution()
a = [2, 0, 2, 1, 1, 0]
sol.sortColors(a)
print(a)  # [0, 0, 1, 1, 2, 2]
b = [2, 0, 1]
sol.sortColors(b)
print(b)  # [0, 1, 2]
