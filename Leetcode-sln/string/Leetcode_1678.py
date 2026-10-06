class Solution:
    def interpret(self, command: str) -> str:
        result = []
        i = 0
        while i < len(command):
            if command[i] == 'G':
                result.append('G')
                i += 1
            elif command.startswith('()', i):
                result.append('o')
                i += 2
            else:
                result.append('al')
                i += 4
        return ''.join(result)


if __name__ == '__main__':
    solution = Solution()
    print(solution.interpret('G()(al)'))
    print(solution.interpret('G()()()()(al)'))
    print(solution.interpret('(al)G(al)()()G'))
