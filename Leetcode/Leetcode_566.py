class Solution:
    def matrixReshape(self, mat: List[List[int]], r: int, c: int) -> List[List[int]]:
        n_rows = len(mat)
        n_cols = len(mat[0])

        if n_rows * n_cols != r * c : return mat

        arrTemp = []
        res = [[0]* c for _ in range(r)]

        # flatten
        for row in mat:
            for x in row:
                arrTemp.append(x)
        
        # convert
        for i in range(r):
            for j in range(c):
                res[i][j] = arrTemp[i*c + j]
                
        return res


sol = Solution()

print(sol.matrixReshape([[1,2],[3,4]], 1, 4))
#print(sol.matrixReshape([[1,2],[3,4]], 2, 4))
#print(sol.matrixReshape([[1,2]], 1, 1))
