class Solution:
    def multiply(self, num1: str, num2: str) -> str:

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
#print(sol.multiply("123", "456"))  # Kết quả: "56088"
print(sol.multiply("123", "45")) 