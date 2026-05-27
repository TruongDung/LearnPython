class Solution:
    def reverseWords(self, s: str) -> str:

        s1 = "a"
        print(id(s1))

        lst = s.split()
        lst.reverse()

        result = ""

        for i in (lst):
            result += i + " "

        return result
    
sol = Solution()
print(sol.reverseWords(" the  sky  is blue "))