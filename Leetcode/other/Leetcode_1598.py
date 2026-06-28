from typing import List


class Solution:
    def minOperations(self, logs: List[str]) -> int:
        deep = 0
        for i in logs:
            if i == "../":
                if deep>0:
                    deep -= 1
            elif i == "./":
                continue
            else:
                deep += 1

        return deep
