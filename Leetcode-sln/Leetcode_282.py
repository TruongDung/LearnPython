from typing import List


class Solution:
    def addOperators(self, num: str, target: int) -> List[str]:
        result = []
        n = len(num)

        def backtrack(index: int, expr: str, cur_val: int, last: int) -> None:
            if index == n:
                if cur_val == target:
                    result.append(expr)
                return

            for j in range(index, n):
                # No leading zeros for multi-digit operands
                if j > index and num[index] == '0':
                    break

                operand_str = num[index:j + 1]
                operand = int(operand_str)

                if index == 0:
                    # First operand, no operator prefix
                    backtrack(j + 1, operand_str, operand, operand)
                else:
                    # Try +, -, *
                    backtrack(j + 1, expr + "+" + operand_str,
                              cur_val + operand, operand)
                    backtrack(j + 1, expr + "-" + operand_str,
                              cur_val - operand, -operand)
                    # For *, undo the last operand and reapply with multiplication
                    backtrack(j + 1, expr + "*" + operand_str,
                              cur_val - last + last * operand, last * operand)

        backtrack(0, "", 0, 0)
        return result


sol = Solution()
print(sol.addOperators("123", 6))    # ['1*2*3', '1+2+3']
print(sol.addOperators("232", 8))    # ['2*3+2', '2+3*2']
print(sol.addOperators("105", 5))    # ['1*0+5', '10-5']
print(sol.addOperators("00", 0))     # ['0*0', '0+0', '0-0']
