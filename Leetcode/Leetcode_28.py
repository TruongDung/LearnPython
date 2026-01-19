class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        if m == 0:
            return 0  # theo yêu cầu: nếu needle rỗng trả về 0
        
        for i in range(n - m + 1):
            if haystack[i:i+m] == needle:
                return i
        return -1
    
sol = Solution()
print(sol.strStr("sqadbutsad", "sad"))