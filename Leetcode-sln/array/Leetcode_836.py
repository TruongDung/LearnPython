from typing import List


class Solution:
    def isRectangleOverlap(self, rec1: List[int], rec2: List[int]) -> bool:
        left = max(rec1[0], rec2[0])
        right = min(rec1[2], rec2[2])
        bottom = max(rec1[1], rec2[1])
        top = min(rec1[3], rec2[3])
        overlap_x = left < right
        overlap_y = bottom < top
        return overlap_x and overlap_y


if __name__ == "__main__":
    solution = Solution()
    assert solution.isRectangleOverlap([0, 0, 2, 2], [1, 1, 3, 3]) is True
    assert solution.isRectangleOverlap([0, 0, 1, 1], [1, 0, 2, 1]) is False
    assert solution.isRectangleOverlap([0, 0, 1, 1], [2, 2, 3, 3]) is False
