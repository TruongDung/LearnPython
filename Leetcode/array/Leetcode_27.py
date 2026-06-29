from typing import List


class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        left = 0  # write pointer
        for right in range(len(nums)):  # read pointer
            if nums[right] != val:
                nums[left] = nums[right]
                left += 1
        return left


# Test
if __name__ == "__main__":
    sol = Solution()

    nums1 = [3, 2, 2, 3]
    k1 = sol.removeElement(nums1, 3)
    print(k1, nums1[:k1])  # 2 [2, 2]

    nums2 = [0, 1, 2, 2, 3, 0, 4, 2]
    k2 = sol.removeElement(nums2, 2)
    print(k2, nums2[:k2])  # 5 [0, 1, 3, 0, 4]
