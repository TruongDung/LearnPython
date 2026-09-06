"""Tests for LeetCode 115: Distinct Subsequences."""

import importlib.util
from pathlib import Path

import pytest


MODULE_PATH = (
    Path(__file__).resolve().parents[1]
    / "Leetcode-sln"
    / "dynamic-programming"
    / "Leetcode_115.py"
)
SPEC = importlib.util.spec_from_file_location("leetcode_115", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)
Solution = MODULE.Solution


@pytest.mark.parametrize(
    "source, target, expected",
    [
        ("rabbbit", "rabbit", 3),
        ("babgbag", "bag", 5),
        ("abc", "abc", 1),
        ("abc", "abcd", 0),
        ("aaaaa", "aa", 10),
        ("", "", 1),
        ("abc", "", 1),
        ("", "a", 0),
    ],
)
def test_num_distinct(source, target, expected):
    assert Solution().numDistinct(source, target) == expected
