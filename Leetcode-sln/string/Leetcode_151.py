class Solution:
    def reverseWords(self, s: str) -> str:
        words = []
        i = len(s) - 1
        while i >= 0:
            if s[i] == ' ':
                i -= 1
                continue
            end = i
            while i >= 0 and s[i] != ' ':
                i -= 1
            words.append(s[i + 1:end + 1])
        return ' '.join(words)


if __name__ == "__main__":
    print(Solution().reverseWords(" the  sky  is blue "))
