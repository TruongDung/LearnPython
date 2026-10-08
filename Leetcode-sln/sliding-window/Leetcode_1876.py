class Solution:
    def countGoodSubstrings(self, s: str) -> int:
        answer = 0
        for left in range(len(s) - 2):
            window = s[left:left + 3]
            if len(set(window)) == 3:
                answer += 1
        return answer


if __name__ == '__main__':
    print(Solution().countGoodSubstrings('xyzzaz'))
    print(Solution().countGoodSubstrings('aababcabc'))
