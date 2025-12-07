class Solution:
    def validWordSquare(self, words: List[str]) -> bool:
        for i in range(len(words)):
            for j in range(len(words[i])):
                if i >= len(words[j]):
                    return False
                if words[i][j] != words[j][i]: 
                    return False

        return True


sol = Solution()
#sol.validWordSquare(["ball","asee","let","lep"])
sol.validWordSquare(["abc", "b"])