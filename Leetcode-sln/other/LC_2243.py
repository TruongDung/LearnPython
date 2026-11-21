class Solution:
    def digitSum(self, s: str, k: int) -> str:

        while len(s)>k:
            first_temp = []
            second_temp = []

            for i in range(0,len(s),k):
                single_number = (s[i:i+k])
                first_temp.append(single_number)

            for item in first_temp:
                second_temp.append(sum(int(digit) for digit in str(item)))

            s = ''.join(second_temp)

        return s

sol = Solution()
print(sol.digitSum("00000000", 3))
