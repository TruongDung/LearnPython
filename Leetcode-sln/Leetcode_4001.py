#4001. Aggregate Two Time Series
class Solution:
    def aggregateTimeSeries(self, series1: list[list[int]], series2: list[list[int]]) -> list[list[int]]:
        i, j = 0, 0
        n, m = len(series1), len(series2)
        res = []
        
        while i < n or j < m:
            t1 = series1[i][0] if i < n else float('inf')
            t2 = series2[j][0] if j < m else float('inf')
            
            t = min(t1, t2)
            
            val1 = series1[i][1] if i < n else 0
            val2 = series2[j][1] if j < m else 0

            res.append([t, val1 + val2])
            
            if t1 == t:
                i += 1
            if t2 == t:
                j += 1
                
        return res

sol = Solution()
print(sol.aggregateTimeSeries([[1,3],[4,1]], [[2,2],[5,2]]))