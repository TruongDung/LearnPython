"""Tests for LeetCode 149: Max Points on a Line."""

import random

from Leetcode.other.Leetcode_149 import (  # pylint: disable=no-name-in-module
    Solution,
)


def test_leetcode_example_one():
    """A perfect diagonal contains every point."""
    assert Solution().maxPoints([[1, 1], [2, 2], [3, 3]]) == 3


def test_leetcode_example_two():
    """The densest line is the slope -1 diagonal through four points."""
    points = [[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]
    assert Solution().maxPoints(points) == 4


def test_single_point_and_pair():
    """Trivial inputs return n directly."""
    solution = Solution()
    assert solution.maxPoints([[5, -7]]) == 1
    assert solution.maxPoints([[0, 0], [9, -9]]) == 2


def test_axis_parallel_and_negative_slopes():
    """Axis-parallel and negative-slope lines are counted correctly."""
    solution = Solution()
    assert solution.maxPoints([[-1, -1], [0, 0], [1, 1], [2, 2]]) == 4
    assert solution.maxPoints([[3, 1], [3, 4], [3, -2], [7, 7]]) == 3
    assert solution.maxPoints([[2, 5], [-6, 5], [10, 5], [1, 1]]) == 3


def test_duplicate_points_extend_every_line():
    """Coincident copies ride along on the best line through their spot."""
    assert Solution().maxPoints([[1, 1], [1, 1], [2, 2], [3, 3]]) == 4


def test_random_points_match_brute_force():
    """Random unique-point sets agree with an O(n^3) reference check."""
    rng = random.Random(149)

    for _ in range(30):
        count = rng.randint(2, 9)
        seen = set()
        points = []
        while len(points) < count:
            point = (rng.randint(-8, 8), rng.randint(-8, 8))
            if point not in seen:
                seen.add(point)
                points.append(list(point))

        expected = 1
        for i in range(count):
            for j in range(i + 1, count):
                x1, y1 = points[i]
                x2, y2 = points[j]
                on_line = sum(
                    (y - y1) * (x2 - x1) == (y2 - y1) * (x - x1)
                    for x, y in points
                )
                expected = max(expected, on_line)

        assert Solution().maxPoints(points) == expected
