class Solution:
    def computeArea(
        self,
        ax1: int,
        ay1: int,
        ax2: int,
        ay2: int,
        bx1: int,
        by1: int,
        bx2: int,
        by2: int,
    ) -> int:
        area_a = (ax2 - ax1) * (ay2 - ay1)
        area_b = (bx2 - bx1) * (by2 - by1)

        overlap_width = max(0, min(ax2, bx2) - max(ax1, bx1))
        overlap_height = max(0, min(ay2, by2) - max(ay1, by1))
        overlap_area = overlap_width * overlap_height

        return area_a + area_b - overlap_area


if __name__ == "__main__":
    solution = Solution()
    assert solution.computeArea(-3, 0, 3, 4, 0, -1, 9, 2) == 45
    assert solution.computeArea(-2, -2, 2, 2, -2, -2, 2, 2) == 16
    assert solution.computeArea(0, 0, 1, 1, 2, 2, 3, 3) == 2
