class Solution:
    def maxScore(self, s: str) -> int:
        count_one = s.count("1")
        count_zeros = 0
        count_max = 0

        for i in range(len(s)-1):
            if s[i] == "1":
                count_one -= 1
            else:
                count_zeros +=1

            count_max = max(count_max, count_one+ count_zeros)

        return count_max
            
sol = Solution()
print(sol.maxScore("011101"))