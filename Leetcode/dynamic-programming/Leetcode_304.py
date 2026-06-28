from typing import List


class NumMatrix:
    def __init__(self, matrix: List[List[int]]):
        self.prefix = []
        if not matrix or not matrix[0]:
            return

        rows = len(matrix)
        cols = len(matrix[0])
        # prefix[i][j] = sum of the rectangle from (0, 0) to (i-1, j-1).
        self.prefix = [[0] * (cols + 1) for _ in range(rows + 1)]
        for i in range(1, rows + 1):
            for j in range(1, cols + 1):
                self.prefix[i][j] = (
                    matrix[i - 1][j - 1]
                    + self.prefix[i - 1][j]
                    + self.prefix[i][j - 1]
                    - self.prefix[i - 1][j - 1]
                )

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        # Inclusion-exclusion over the 2D prefix sums.
        return (
            self.prefix[row2 + 1][col2 + 1]
            - self.prefix[row1][col2 + 1]
            - self.prefix[row2 + 1][col1]
            + self.prefix[row1][col1]
        )


obj = NumMatrix([
    [3, 0, 1, 4, 2],
    [5, 6, 3, 2, 1],
    [1, 2, 0, 1, 5],
    [4, 1, 0, 1, 7],
    [1, 0, 3, 0, 5],
])
print(obj.sumRegion(2, 1, 4, 3))
