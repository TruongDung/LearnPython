from typing import List


class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        result = []
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1

        while top <= bottom and left <= right:
            # left → right along top row
            for c in range(left, right + 1):
                result.append(matrix[top][c])
            top += 1
            # top → bottom along right column
            for r in range(top, bottom + 1):
                result.append(matrix[r][right])
            right -= 1
            # right → left along bottom row
            if top <= bottom:
                for c in range(right, left - 1, -1):
                    result.append(matrix[bottom][c])
                bottom -= 1
            # bottom → top along left column
            if left <= right:
                for r in range(bottom, top - 1, -1):
                    result.append(matrix[r][left])
                left += 1

        return result


sol = Solution()
print(
    sol.spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])
)  # [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
