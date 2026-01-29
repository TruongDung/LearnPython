from collections import Counter

class Solution:
    def nextGreatestLetter(self, letters: List[str], target: str) -> str:
        start = 0 
        end = len(letters) - 1
        res = letters[0]
        while start < end:
            mid = (start + end) // 2
            if ord(letters[mid]) > ord(target):
                end = mid - 1
                res = letters[mid]
            elif ord(letters[mid]) <= ord(target):
                start = mid + 1

        if start == end:
            print(start)

        return res
    
sol = Solution()
print(sol.nextGreatestLetter(["c","f","j"], "a"))