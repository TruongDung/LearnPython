from bisect import bisect_left, bisect_right


class Fenwick:
    def __init__(self, size: int):
        self.tree = [0] * (size + 1)

    def add(self, index: int, delta: int) -> None:
        while index < len(self.tree):
            self.tree[index] += delta
            index += index & -index

    def query(self, index: int) -> int:
        total = 0
        while index > 0:
            total += self.tree[index]
            index -= index & -index
        return total


class Solution:
    def distantSubarrays(self, nums: list[int], goal: int, k: int) -> int:
        if k == 0:
            n = len(nums)
            return n * (n + 1) // 2

        prefix = [0]
        for value in nums:
            prefix.append(prefix[-1] + value)

        values = sorted(set(prefix))
        bit = Fenwick(len(values))
        answer = seen = 0
        for current in prefix:
            low = current - goal - k
            high = current - goal + k
            left_count = bit.query(bisect_right(values, low))
            right_count = seen - bit.query(bisect_left(values, high))
            answer += left_count + right_count
            bit.add(bisect_left(values, current) + 1, 1)
            seen += 1
        return answer


if __name__ == "__main__":
    solution = Solution()
    assert solution.distantSubarrays([1, 2, 1], 4, 1) == 5
    assert solution.distantSubarrays([2, -1, 3], 2, 2) == 2
    assert solution.distantSubarrays([-3, 1, 2], 0, 3) == 2
