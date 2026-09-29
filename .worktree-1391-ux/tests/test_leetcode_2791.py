from Leetcode.tree.Leetcode_2791 import Solution  # pylint: disable=no-name-in-module


def test_count_palindrome_paths_sample_1():
    assert Solution().countPalindromePaths([-1, 0, 0, 1, 1, 2], "acaabc") == 8


def test_count_palindrome_paths_sample_2():
    assert Solution().countPalindromePaths([-1, 0, 0, 0, 0], "aaaaa") == 10


def test_count_palindrome_paths_mixed_letters():
    assert Solution().countPalindromePaths([-1, 0, 0, 1, 2, 2], "abacbe") == 6
