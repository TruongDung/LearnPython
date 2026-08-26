"""Tests for LeetCode 546: Remove Boxes."""

import random

from Leetcode.other.Leetcode_546 import (  # pylint: disable=no-name-in-module
    Solution,
)


def test_leetcode_examples():
    """The three samples from the problem statement."""
    solution = Solution()
    assert solution.removeBoxes([1, 3, 2, 2, 2, 3, 4, 3, 1]) == 23
    assert solution.removeBoxes([1, 1, 1]) == 9
    assert solution.removeBoxes([1]) == 1


def test_single_colour_rows_score_square_of_length():
    """One colour everywhere: remove everything in a single strike."""
    solution = Solution()
    assert solution.removeBoxes([7]) == 1
    assert solution.removeBoxes([7, 7, 7, 7]) == 16


def test_sandwiched_run_is_worth_waiting_for():
    """Removing [2] first lets the outer [1]s merge: 1 + 4 beats 3."""
    assert Solution().removeBoxes([1, 2, 1]) == 5


def test_two_colours_interleaved():
    """Clearing the lone [1] first merges four [2]s: 1 + 16."""
    assert Solution().removeBoxes([2, 2, 1, 2, 2]) == 17


def test_random_rows_match_brute_force():
    """Random rows agree with an exhaustive removal-sequence search."""

    def brute(row_):
        if not row_:
            return 0
        best = 0
        i = 0
        while i < len(row_):
            j = i
            while j < len(row_) and row_[j] == row_[i]:
                j += 1
            rest = row_[:i] + row_[j:]
            best = max(best, (j - i) ** 2 + brute(rest))
            i = j
        return best

    rng = random.Random(546)
    for _ in range(40):
        length = rng.randint(1, 7)
        row = [rng.randint(1, 3) for _ in range(length)]
        assert Solution().removeBoxes(row) == brute(row)
