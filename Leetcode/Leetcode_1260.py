class Solution:
    def shiftGrid(self, grid: List[List[int]], k: int) -> List[List[int]]:

        m, n = len(grid), len(grid[0])
        size = m * n

        arr = [x for row in grid for x in row]   # flatten

        new_arr = [0] * size

        for i in range(size):
            new_index = (i + k) % size   # <-- compute bằng modulo
            new_arr[new_index] = arr[i]
        return []
    

sol = Solution()
#sol.shiftGrid( [[1,2,3],[4,5,6],[7,8,9]], 1)
sol.shiftGrid([[3,8,1,9],[19,7,2,5],[4,6,11,10],[12,0,21,13]], 4)