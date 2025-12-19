class Solution:
    def gcdOfStrings(self, str1: str, str2: str) -> str:
        # Check if concatenated strings are equal or not, if not return ""
        if str1 + str2 != str2 + str1:
            return ""
        # If strings are equal than return the substring from 0 to gcd of size(str1), size(str2)
        from math import gcd
        #a1 = gcd(len(str1), len(str2))
        return str1[:gcd(len(str1), len(str2))]

    # def gcd(self, a, b):
    #     while b!=0:
    #         a, b = b, a%b
    #     return a
    

sol = Solution()
#print(sol.gcdOfStrings("ABCABC", "ABC"))
#print(sol.gcdOfStrings("ABABAB", "ABAB"))
print(sol.gcdOfStrings("AA", "A"))