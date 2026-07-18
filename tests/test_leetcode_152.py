import pytest

from Leetcode.Leetcode_152 import Solution  # pylint: disable=no-name-in-module
# Leetcode/__init__.py rewrites __path__ to point at Leetcode-sln/ at runtime
# (Python identifiers can't contain hyphens), which pylint's static analysis
# can't follow. The import resolves correctly at runtime and under pytest.


def brute_force_max_product(nums):
    best = nums[0]
    for i in range(len(nums)):
        product = 1
        for j in range(i, len(nums)):
            product *= nums[j]
            best = max(best, product)
    return best


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([2, 3, -2, 4], 6),
        ([-2, 0, -1], 0),
        ([-2, 3, -4], 24),
        ([0, 2], 2),
        ([-2], -2),
        ([0], 0),
        ([-1, -2, -3, 0], 6),
        ([-2, -3, 7], 42),
        ([-2, 0, -1, 4, -3], 12),
        ([1, -2, -3, 4], 24),
        ([-1, -2, -9, -6], 108),
        ([-1, 0, -2, 2, -3, 0, 4], 12),
    ],
)
def test_max_product(nums, expected):
    assert Solution().maxProduct(nums) == expected


@pytest.mark.parametrize(
    "nums",
    [
        [-4, -3, -2, -1],
        [-3, 0, -2, 2, -1],
        [2, -5, -2, -4, 3],
        [1, -2, 0, -3, 4, -5],
    ],
)
def test_max_product_matches_brute_force(nums):
    assert Solution().maxProduct(nums) == brute_force_max_product(nums)
