class Solution:
    def addBinary(self, a: str, b: str) -> str:
        m = len(a)
        n = len(b)

        res = []

        i = m-1
        j = n-1

        memory = 0

        while i>=0 or j>=0:
            if i>=0:
                memory += ord(a[i]) - ord('0')
                i-=1
            if j>=0:
                memory += ord(b[j]) - ord('0')
                j-=1
        
            res.insert(0, str(memory % 2))
            memory //= 2

        if memory == 1:
            res.insert(0, "1")
        
sol = Solution()
sol.addBinary("11", "1")