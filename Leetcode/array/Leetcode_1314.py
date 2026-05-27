class Solution:
    def matrixBlockSum(self, mat: List[List[int]], k: int) -> List[List[int]]:
        m, n = len(mat), len(mat[0])
        prefix = [[0] * (n + 1) for _ in range(m + 1)]
        for r in range(1, m+1):
            for c in range(1, n+1):
                prefix[r][c] =(
                    mat[r-1][c-1]
                    +prefix[r-1][c]
                    +prefix[r][c-1]
                    -prefix[r-1][c-1]
                    )
        
        # 2️⃣ Tạo ma trận kết quả
        answer = [[0]*n for _ in range(m)]
        for i in range(m):
            for j in range(n):
                # Xác định biên của hình vuông k xung quanh
                r1 = max(0, i - k)
                c1 = max(0, j - k)
                r2 = min(m - 1, i + k)
                c2 = min(n - 1, j + k)

                # Tổng hình chữ nhật bằng prefix sum
                answer[i][j] = (
                    prefix[r2+1][c2+1] - 
                    prefix[r1][c2+1] - 
                    prefix[r2+1][c1] + 
                    prefix[r1][c1]
                )
        return answer
    
sol = Solution()
print(sol.matrixBlockSum([[1,2,3],[4,5,6],[7,8,9]], 1))