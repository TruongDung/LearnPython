class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        result = ""
        for i in range(len(strs[0])):
            same = True
            for word in strs:
                if i >= len(word)  or word[i] != strs[0][i]:
                    same = False
                    break
            if same:
                result += strs[0][i]
            else:
                break
        
    
sol = Solution()
print(sol.longestCommonPrefix(["flower","flow","flight"]))