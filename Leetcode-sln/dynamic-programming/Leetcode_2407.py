from bisect import bisect_left
from typing import List


class Solution:
    def lengthOfLIS(self, nums: List[int], k: int) -> int:
        values = sorted(set(nums))
        size = 1
        while size < len(values):
            size *= 2
        tree = [0] * (2 * size)

        def query(left: int, right: int) -> int:
            left += size
            right += size
            best = 0
            while left <= right:
                if left % 2 == 1:
                    best = max(best, tree[left])
                    left += 1
                if right % 2 == 0:
                    best = max(best, tree[right])
                    right -= 1
                left //= 2
                right //= 2
            return best

        def update(position: int, value: int) -> None:
            position += size
            tree[position] = max(tree[position], value)
            while position > 1:
                position //= 2
                tree[position] = max(
                    tree[2 * position], tree[2 * position + 1]
                )

        answer = 0
        for value in nums:
            left = bisect_left(values, value - k)
            right = bisect_left(values, value) - 1
            previous = query(left, right) if left <= right else 0
            current = previous + 1
            update(bisect_left(values, value), current)
            answer = max(answer, current)
        return answer


if __name__ == "__main__":
    solution = Solution()
    assert solution.lengthOfLIS([4, 2, 1, 4, 3, 4, 5, 8, 15], 3) == 5
    assert solution.lengthOfLIS([7, 4, 5, 1, 8, 12, 4, 7], 5) == 4
    assert solution.lengthOfLIS([1, 5], 1) == 1
