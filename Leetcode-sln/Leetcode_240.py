from typing import List


class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        if not matrix or not matrix[0]:
            return False

        # Start from the top-right corner.
        # Moving left decreases the value, moving down increases it.
        row, col = 0, len(matrix[0]) - 1

        while row < len(matrix) and col >= 0:
            value = matrix[row][col]
            if value == target:
                return True
            if value > target:
                col -= 1      # too big -> drop this column
            else:
                row += 1      # too small -> drop this row

        return False


sol = Solution()
MAT = [
    [1, 4, 7, 11, 15],
    [2, 5, 8, 12, 19],
    [3, 6, 9, 16, 22],
    [10, 13, 14, 17, 24],
    [18, 21, 23, 26, 30],
]
print(sol.searchMatrix(MAT, 5))   # True
print(sol.searchMatrix(MAT, 20))  # False
