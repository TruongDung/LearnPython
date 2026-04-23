class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        ans = 0

        row = len(grid)
        col = len(grid[0])

        def dfs(r,c):
            if r < 0 or r>= row or c <0 or c>= col or grid[r][c] == 0:
                return 0
            
            grid[r][c] = 0
            area = 1
            area += dfs(r+1, c)
            area += dfs(r-1, c)
            area += dfs(r, c+1)
            area += dfs(r, c-1)

            return area

        for i in range(row):
            for j in range(col):
                if grid[i][j] == 1:
                    ans = max(ans, dfs(i,j))
        return ans
    
sol = Solution()
sol.maxAreaOfIsland([[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]])