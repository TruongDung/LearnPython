class Solution:
    def closeStrings(self, word1: str, word2: str) -> bool:
        if len(word1) != len(word2):
            return False
        count1, count2 = {}, {}
        for ch in word1:
            count1[ch] = count1.get(ch, 0) + 1
        for ch in word2:
            count2[ch] = count2.get(ch, 0) + 1
        if count1.keys() != count2.keys():
            return False
        freq1 = sorted(count1.values())
        freq2 = sorted(count2.values())
        return freq1 == freq2


if __name__ == '__main__':
    solution = Solution()
    print(solution.closeStrings('abc', 'bca'))
    print(solution.closeStrings('a', 'aa'))
    print(solution.closeStrings('cabbba', 'abbccc'))
