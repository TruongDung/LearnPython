from typing import List


class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        # Treat each value as a "next" pointer: i -> nums[i].
        # A duplicate value creates a cycle; find its entrance
        # with Floyd's tortoise-and-hare (O(1) extra space).
        slow = fast = nums[0]

        # Phase 1: advance until the two pointers meet in the cycle.
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break

        # Phase 2: reset one pointer; they meet at the cycle entrance.
        slow = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]

        return slow


sol = Solution()
print(sol.findDuplicate([1, 3, 4, 2, 2]))  # 2
print(sol.findDuplicate([3, 1, 3, 4, 2]))  # 3
