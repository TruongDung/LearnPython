class Solution:
    def lengthOfLastWord(self, s: str) -> int:
        i = len(s) - 1
        length = 0

        # Skip trailing spaces
        while i >= 0 and s[i] == ' ':
            i -= 1

        # Count the last word's characters
        while i >= 0 and s[i] != ' ':
            length += 1
            i -= 1

        return length


sol = Solution()
print(sol.lengthOfLastWord("Hello World"))              # 5
print(sol.lengthOfLastWord("   fly me   to   the moon  "))  # 4
print(sol.lengthOfLastWord("luffy is still joyboy"))    # 6
