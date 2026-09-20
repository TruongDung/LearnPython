class Solution:
    def reverseDegree(self, s: str) -> int:
        total = 0
        # enumerate(s, 1) because the string position is 1-indexed, not 0-indexed.
        for position, char in enumerate(s, 1):
            # ord(char) - ord("a") is the 0-based rank: 'a' -> 0, 'z' -> 25.
            # Subtracting it from 26 flips the alphabet: 'a' -> 26, 'z' -> 1.
            reverse_position = 26 - (ord(char) - ord("a"))
            total += position * reverse_position
        return total

    def reverseDegree2(self, s: str) -> int:
        # Same sum written as a one-liner, using 27 - k with k the 1-based rank.
        return sum(
            position * (27 - (ord(char) - ord("a") + 1))
            for position, char in enumerate(s, 1)
        )


if __name__ == "__main__":
    solution = Solution()

    # LeetCode example 1: 1*26 + 2*25 + 3*24 = 26 + 50 + 72.
    assert solution.reverseDegree("abc") == 148
    # LeetCode example 2: 1*1 + 2*26 + 3*1 + 4*26 = 1 + 52 + 3 + 104.
    assert solution.reverseDegree("zaza") == 160

    # Boundary letters on a single-character string.
    assert solution.reverseDegree("a") == 26
    assert solution.reverseDegree("z") == 1

    # The two formulations must agree everywhere.
    for word in ("abc", "zaza", "a", "z", "leetcode", "abcdefghijklmnopqrstuvwxyz"):
        assert solution.reverseDegree(word) == solution.reverseDegree2(word), word

    # Whole alphabet in order: sum of i * (27 - i) for i = 1..26.
    assert solution.reverseDegree("abcdefghijklmnopqrstuvwxyz") == sum(
        i * (27 - i) for i in range(1, 27)
    )
