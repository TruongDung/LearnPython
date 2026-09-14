from typing import List


class Solution:
    def isRectangleOverlap(self, rec1: List[int], rec2: List[int]) -> bool:
        x1 = rec1[0]
        y1 = rec1[1]
        x2 = rec1[2]
        y2 = rec1[3]

        x3 = rec2[0]
        y3 = rec2[1]
        x4 = rec2[2]
        y4 = rec2[3]

        # Not overlap: rec1 is left, right, below, or above rec2.
        if x2 <= x3 or x1 >= x4 or y2 <= y3 or y1 >= y4:
            return False

        # Overlap.
        return True


if __name__ == "__main__":
    solution = Solution()
    assert solution.isRectangleOverlap([0, 0, 2, 2], [1, 1, 3, 3]) is True
    assert solution.isRectangleOverlap([0, 0, 1, 1], [1, 0, 2, 1]) is False
    assert solution.isRectangleOverlap([0, 0, 1, 1], [2, 2, 3, 3]) is False
