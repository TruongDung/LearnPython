class Solution:
    def defangIPaddr(self, address: str) -> str:
        result = []
        for i, ch in enumerate(address):
            if ch == '.':
                result.append('[.]')
            else:
                result.append(ch)
        return ''.join(result)


if __name__ == '__main__':
    solution = Solution()
    print(solution.defangIPaddr('1.1.1.1'))
    print(solution.defangIPaddr('255.100.50.0'))
