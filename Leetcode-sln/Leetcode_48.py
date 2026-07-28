from typing import List


class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)

        # 1) Transpose (swap across the main diagonal)
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

        # 2) Reverse each row
        for row in matrix:
            row.reverse()


sol = Solution()
m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
sol.rotate(m)
print(m)  # [[7,4,1],[8,5,2],[9,6,3]]
