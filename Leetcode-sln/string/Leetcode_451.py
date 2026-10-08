class Solution:
    def frequencySort(self, s: str) -> str:
        count = {}
        for ch in s:
            count[ch] = count.get(ch, 0) + 1
        ordered = sorted(count, key=lambda ch: (-count[ch], ch))
        result = []
        for ch in ordered:
            result.append(ch * count[ch])
        return ''.join(result)


if __name__ == '__main__':
    solution = Solution()
    print(solution.frequencySort('tree'))
    print(solution.frequencySort('cccaaa'))
    print(solution.frequencySort('Aabb'))
