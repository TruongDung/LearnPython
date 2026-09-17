from __future__ import annotations


class Solution:
    def divideString(self, s: str, k: int, fill: str) -> list[str]:
        groups = []
        for start in range(0, len(s), k):
            group = s[start : start + k]
            if len(group) < k:
                group += fill * (k - len(group))
            groups.append(group)
        return groups


if __name__ == "__main__":
    solution = Solution()
    assert solution.divideString("abcdefghi", 3, "x") == ["abc", "def", "ghi"]
    assert solution.divideString("abcdefghij", 3, "x") == ["abc", "def", "ghi", "jxx"]
