from bisect import bisect_left
from typing import List


class Fenwick:
    def __init__(self, size: int) -> None:
        self.tree = [0] * (size + 1)

    def add(self, index: int, delta: int) -> None:
        while index < len(self.tree):
            self.tree[index] += delta
            index += index & -index

    def prefix_sum(self, length: int) -> int:
        total = 0
        while length:
            total += self.tree[length]
            length -= length & -length
        return total

    def kth(self, order: int) -> int:
        index = 0
        size = len(self.tree) - 1
        step = 1 << (size.bit_length() - 1)
        while step:
            next_index = index + step
            if next_index < len(self.tree) and self.tree[next_index] < order:
                index = next_index
                order -= self.tree[next_index]
            step >>= 1
        return index + 1


class Solution:
    def shadowPairs(self, nums: List[int]) -> int:
        def solve(left: int, right: int) -> int:
            if left >= right:
                return 0

            middle = (left + right) // 2
            answer = solve(left, middle) + solve(middle + 1, right)
            values = sorted(set(nums[left : right + 1]))
            ranks = {value: index + 1 for index, value in enumerate(values)}

            upper = {}
            bit = Fenwick(len(values))
            inserted = 0
            for i in range(middle, left - 1, -1):
                rank = ranks[nums[i]]
                not_greater = bit.prefix_sum(rank)
                upper[i] = (
                    values[bit.kth(not_greater + 1) - 1]
                    if not_greater < inserted
                    else float("inf")
                )
                bit.add(rank, 1)
                inserted += 1

            lower = {}
            bit = Fenwick(len(values))
            for j in range(middle + 1, right + 1):
                rank = ranks[nums[j]]
                smaller = bit.prefix_sum(rank - 1)
                lower[j] = (
                    values[bit.kth(smaller) - 1]
                    if smaller
                    else float("-inf")
                )
                bit.add(rank, 1)

            left_indices = sorted(range(left, middle + 1), key=lambda i: nums[i])
            expiring = sorted(left_indices, key=lambda i: upper[i])
            right_indices = sorted(range(middle + 1, right + 1), key=lambda j: nums[j])

            bit = Fenwick(len(values))
            activated = expired = active = 0
            for j in right_indices:
                while activated < len(left_indices) and nums[left_indices[activated]] < nums[j]:
                    i = left_indices[activated]
                    bit.add(ranks[nums[i]], 1)
                    active += 1
                    activated += 1
                while expired < len(expiring) and upper[expiring[expired]] < nums[j]:
                    i = expiring[expired]
                    bit.add(ranks[nums[i]], -1)
                    active -= 1
                    expired += 1

                below_lower = bit.prefix_sum(bisect_left(values, lower[j]))
                answer += active - below_lower

            return answer

        return solve(0, len(nums) - 1)


if __name__ == "__main__":
    solution = Solution()
    assert solution.shadowPairs([3, 1, 4, 2, 5]) == 5
    assert solution.shadowPairs([6, 7, 8, 9]) == 3
