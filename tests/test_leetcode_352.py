"""Tests for LeetCode 352: Data Stream as Disjoint Intervals."""

import random

from Leetcode.other.Leetcode_352 import (  # pylint: disable=no-name-in-module
    SummaryRanges,
)


def test_leetcode_example():
    """Run the exact operation sequence from the problem statement."""
    stream = SummaryRanges()
    assert stream.getIntervals() == []

    stream.addNum(1)
    assert stream.getIntervals() == [[1, 1]]

    stream.addNum(3)
    assert stream.getIntervals() == [[1, 1], [3, 3]]

    stream.addNum(7)
    assert stream.getIntervals() == [[1, 1], [3, 3], [7, 7]]

    stream.addNum(2)
    assert stream.getIntervals() == [[1, 3], [7, 7]]

    stream.addNum(6)
    assert stream.getIntervals() == [[1, 3], [6, 7]]


def test_duplicate_value_is_covered():
    """Adding an already covered value leaves intervals untouched."""
    stream = SummaryRanges()
    for value in (5, 4, 6):
        stream.addNum(value)

    snapshot = stream.getIntervals()
    assert snapshot == [[4, 6]]

    stream.addNum(5)
    stream.addNum(4)
    stream.addNum(6)
    assert stream.getIntervals() == snapshot


def test_bridge_merges_three_pieces():
    """A value touching both neighbours fuses them into one interval."""
    stream = SummaryRanges()
    stream.addNum(0)
    stream.addNum(2)
    assert stream.getIntervals() == [[0, 0], [2, 2]]

    stream.addNum(1)
    assert stream.getIntervals() == [[0, 2]]


def test_extend_left_and_right_edges():
    """Values adjacent to exactly one neighbour extend that neighbour."""
    stream = SummaryRanges()
    stream.addNum(10)
    stream.addNum(20)
    stream.addNum(11)
    assert stream.getIntervals() == [[10, 11], [20, 20]]

    stream.addNum(19)
    assert stream.getIntervals() == [[10, 11], [19, 20]]

    stream.addNum(12)
    assert stream.getIntervals() == [[10, 12], [19, 20]]


def test_boundaries_and_isolated_values():
    """Zero and isolated gaps form their own single-value intervals."""
    stream = SummaryRanges()
    stream.addNum(0)
    stream.addNum(100)
    assert stream.getIntervals() == [[0, 0], [100, 100]]

    stream.addNum(50)
    assert stream.getIntervals() == [[0, 0], [50, 50], [100, 100]]

    stream.addNum(49)
    assert stream.getIntervals() == [[0, 0], [49, 50], [100, 100]]


def test_get_intervals_returns_a_copy():
    """Mutating the returned summary must not corrupt internal state."""
    stream = SummaryRanges()
    stream.addNum(3)
    snapshot = stream.getIntervals()
    snapshot[0][0] = -999

    assert stream.getIntervals() == [[3, 3]]


def test_random_stream_matches_brute_force():
    """Random streams agree with recomputing runs from the sorted set."""
    rng = random.Random(352)

    for _ in range(25):
        stream = SummaryRanges()
        seen = []
        for _ in range(120):
            value = rng.randint(0, 60)
            seen.append(value)
            stream.addNum(value)

            unique = sorted(set(seen))
            expected = []
            for item in unique:
                if expected and expected[-1][1] + 1 >= item:
                    expected[-1][1] = item
                else:
                    expected.append([item, item])
            assert stream.getIntervals() == expected
