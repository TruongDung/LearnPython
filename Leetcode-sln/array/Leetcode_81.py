class Solution:
    def search(self, nums: list[int], target: int) -> bool:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return True

            # Equal boundary and midpoint values hide the rotation pivot.
            if nums[left] == nums[mid] == nums[right]:
                left += 1
                right -= 1
                continue

            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return False


if __name__ == "__main__":
    solution = Solution()
    assert solution.search([2, 5, 6, 0, 0, 1, 2], 0) is True
    assert solution.search([2, 5, 6, 0, 0, 1, 2], 3) is False
    assert solution.search([1, 0, 1, 1, 1], 0) is True
    assert solution.search([1, 1, 1, 1, 1], 2) is False
