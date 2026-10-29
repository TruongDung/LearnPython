class Solution:
    def floodFill(self, image, sr, sc, color):
        rows, cols = len(image), len(image[0])
        old = image[sr][sc]
        if old == color:
            return image
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols:
                return
            if image[r][c] != old:
                return
            image[r][c] = color
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
        dfs(sr, sc)
        return image

sol = Solution()
sol.floodFill([[1,1,1],[1,1,0],[1,0,1]], 1,1,2)
