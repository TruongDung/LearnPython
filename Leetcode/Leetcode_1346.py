class Solution:
    def checkIfExist(self, arr: List[int]) -> bool:

        s = set()

        for a in arr:
            if a*2 in s:
                return True
            if a/2 in s:
                return True
            s.add(a)

        return False
    
sol = Solution()
print(sol.checkIfExist([3,1,7,11]))