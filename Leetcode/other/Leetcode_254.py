class Solution:
    def getFactors(self, n: int) -> List[List[int]]:
        res = []

        def dfs(start, temp, target):
            
            for f in range(start, int(target**0.5) + 1):
                if target % f == 0:
                    temp.append(f)
                    if target // f >= f:          
                        temp.append(target // f)
                        res.append(temp.copy())
                        temp.pop()
                        dfs(f, temp, target // f) 
                    temp.pop()

        dfs(2, [], n)
        return res