from typing import List


class Solution:
    def resultArray(self, nums: List[int], k: int) -> List[int]:
        # Removing a prefix and a suffix while leaving nums non-empty is exactly
        # "keep one non-empty contiguous subarray", so result[x] counts the
        # subarrays whose product % k == x. The buckets must sum to n(n+1)/2.
        #
        # Enumerating subarrays is O(n^2), but k <= 5, so it is enough to track
        # HOW MANY subarrays ending at the current index fall in each remainder.
        ans = [0] * k
        # dp[r] = number of subarrays ending at the previous index with
        # product % k == r.
        dp = [0] * k

        for num in nums:
            new_dp = [0] * k
            num_mod = num % k
            # The single-element subarray [num].
            new_dp[num_mod] = 1
            # Appending num multiplies each earlier remainder by num_mod.
            # Several r can map to the same bucket (num_mod == 0 collapses all
            # of them to 0), so this must accumulate rather than assign.
            for r in range(k):
                new_dp[(r * num_mod) % k] += dp[r]
            # Every subarray ends at exactly one index: no double counting.
            for r in range(k):
                ans[r] += new_dp[r]
            dp = new_dp

        return ans

    def resultArrayBrute(self, nums: List[int], k: int) -> List[int]:
        """O(n^2) reference reading of the statement, for cross-checking."""
        ans = [0] * k
        for start in range(len(nums)):
            product = 1
            for end in range(start, len(nums)):
                product = product * nums[end] % k
                ans[product] += 1
        return ans


if __name__ == "__main__":
    solution = Solution()

    # LeetCode example 1.
    assert solution.resultArray([1, 2, 3, 4, 5], 3) == [9, 2, 4]
    # LeetCode example 2: no subarray has product % 4 == 3.
    assert solution.resultArray([1, 2, 4, 8, 16, 32], 4) == [18, 1, 2, 0]
    # LeetCode example 3.
    assert solution.resultArray([1, 1, 2, 1, 1], 2) == [9, 6]

    # k = 1 puts every subarray in bucket 0.
    assert solution.resultArray([7, 7, 7], 1) == [6]
    # A single element.
    assert solution.resultArray([5], 3) == [0, 0, 1]

    # The two readings must agree, and the buckets must always sum to n(n+1)/2.
    cases = [
        ([1, 2, 3, 4, 5], 3),
        ([1, 2, 4, 8, 16, 32], 4),
        ([1, 1, 2, 1, 1], 2),
        ([7, 7, 7], 1),
        ([5], 3),
        ([3, 9, 27, 81, 6, 10], 5),
        ([1000000000, 999999999, 7, 13], 5),
    ]
    for values, modulus in cases:
        fast = solution.resultArray(values, modulus)
        slow = solution.resultArrayBrute(values, modulus)
        assert fast == slow, (values, modulus, fast, slow)
        n = len(values)
        assert sum(fast) == n * (n + 1) // 2, (values, modulus)
