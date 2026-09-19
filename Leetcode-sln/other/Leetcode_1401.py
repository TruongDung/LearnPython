class Solution:
    def checkOverlap(
        self,
        radius: int,
        xCenter: int,
        yCenter: int,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
    ) -> bool:
        # Closest point of the rectangle to the circle center: clamp per axis.
        closest_x = max(x1, min(xCenter, x2))
        closest_y = max(y1, min(yCenter, y2))

        dx = xCenter - closest_x
        dy = yCenter - closest_y

        # Compare squared distances to avoid floating point sqrt.
        return dx * dx + dy * dy <= radius * radius

    def checkOverlap2(
        self,
        radius: int,
        xCenter: int,
        yCenter: int,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
    ) -> bool:
        # Per-axis overshoot: 0 when the center already projects inside the slab.
        dx = max(x1 - xCenter, 0, xCenter - x2)
        dy = max(y1 - yCenter, 0, yCenter - y2)

        dist_squared = dx * dx + dy * dy
        return dist_squared <= radius * radius


if __name__ == "__main__":
    solution = Solution()

    assert solution.checkOverlap(1, 0, 0, 1, -1, 3, 1) is True
    assert solution.checkOverlap(1, 1, 1, 1, -3, 2, -1) is False
    assert solution.checkOverlap(1, 0, 0, -1, 0, 0, 1) is True
    # Corner is the closest point and sits exactly on the circle.
    assert solution.checkOverlap(5, 0, 0, 3, 4, 8, 9) is True
    # Same corner, radius one unit too short.
    assert solution.checkOverlap(4, 0, 0, 3, 4, 8, 9) is False
    # Center strictly inside the rectangle.
    assert solution.checkOverlap(1, 5, 5, 0, 0, 10, 10) is True

    assert solution.checkOverlap2(1, 0, 0, 1, -1, 3, 1) is True
    assert solution.checkOverlap2(1, 1, 1, 1, -3, 2, -1) is False
    assert solution.checkOverlap2(1, 0, 0, -1, 0, 0, 1) is True
    assert solution.checkOverlap2(5, 0, 0, 3, 4, 8, 9) is True
    assert solution.checkOverlap2(4, 0, 0, 3, 4, 8, 9) is False
    assert solution.checkOverlap2(1, 5, 5, 0, 0, 10, 10) is True
