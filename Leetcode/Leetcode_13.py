class Solution:
    def romanToInt(self, s: str) -> int:
        roman = {
        'I': 1, 'V': 5, 'X': 10,
        'L': 50, 'C': 100, 'D': 500, 'M': 1000
        }
        
        total = 0
        n = len(s)
        for i in range(n):
            current = roman[s[i]]
            # Nếu chưa phải ký tự cuối và ký tự sau lớn hơn ký tự hiện tại
            if i == n-1:
                print('out')
                
            if i < n - 1 and roman[s[i + 1]] > current:
                total -= current    # dạng trừ (IV, IX, XL, ...)
            else:
                total += current    # cộng bình thường
        


            
sol = Solution()
sol.romanToInt('MCMXCIV')