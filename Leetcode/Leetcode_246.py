class Solution:
    def isStrobogrammatic(self, num: str) -> bool:
        d = {'0':'0', '1':'1', '8':'8', '6':'9', '9': '6'}
        j = 0
        for i in range(len(num)-1, -1, -1):
            if num[i] != d.get(num[j]):
                return False

            j += 1


        return True

sol = Solution()
sol.isStrobogrammatic('2')