class Solution:
    def romanToInt(self, s: str) -> int:
        total = 0
        d = {'I': 1, 'V':5, 'X':10, 'L':50, 'C':100, 'D': 500, 'M': 1000}

        for i in range(len(s)):
            current = s[i]
            if i + 1 < len(s) and d[s[i+1]]>d[current]: 
                total = total - d[current]
            else: 
                total += d[current]

        return total

            
        


            
sol = Solution()
print(sol.romanToInt('MCMXCIV'))