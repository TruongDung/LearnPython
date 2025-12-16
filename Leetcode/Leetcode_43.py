class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        #return str(int(num1) * int(num2))
        # n1 = 0
        # for i in num1:
        #     n1 = n1*10 + (ord(i) - ord('0'))

        # n2 = 0
        # for j in num2:
        #     n2 = n2*10 + (ord(j) - ord('0'))   
        
        # return str(n1*n2)

        if num1 == "0" or num2 == "0":
            return "0"

        m, n = len(num1), len(num2)
        res = [0] * (m + n)

        # Nhân từng chữ số (từ phải sang trái)
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                mul = (ord(num1[i]) - ord('0')) * (ord(num2[j]) - ord('0'))
                sum_ = mul + res[i + j + 1]

                res[i + j + 1] = sum_ % 10
                res[i + j] += sum_ // 10

        # Bỏ các số 0 ở đầu
        result = []
        for num in res:
            if not result and num == 0:
                continue
            result.append(str(num))

        return ''.join(result) if result else "0"
    
sol = Solution()
#print(sol.multiply("2", "3"))  # Kết quả: "6"
print(sol.multiply("123", "456"))  # Kết quả: "56088"
