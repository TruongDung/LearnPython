class Solution:
    def kWeakestRows(self, mat: List[List[int]], k: int) -> List[int]:
        res = []
        d = {}
        for i in range(len(mat)):
            count = 0
            for j in range(len(mat[i])):
                if mat[i][j]>0:
                    count += 1
            res.append(count)
            d[i] = count

        d = dict(sorted(d.items(), key=lambda item: item[1]))

        res = list(d.keys)[0:k]
        return res

sol = Solution()
sol.kWeakestRows([[1,1,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,0,0,0],[1,1,1,1,1]], 3)