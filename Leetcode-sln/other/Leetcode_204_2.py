class Solution:
    def countPrimes(self, n: int) -> int:
        if n < 3:
            return 0

        # Sieve of Eratosthenes
        is_prime = [True] * n
        is_prime[0] = is_prime[1] = False

        p = 2
        while p * p < n:
            if is_prime[p]:
                # Mark multiples of p starting from p*p
                for multiple in range(p * p, n, p):
                    is_prime[multiple] = False
            p += 1

        return sum(is_prime)


sol = Solution()
print(sol.countPrimes(10))  # 4 (2,3,5,7)
print(sol.countPrimes(0))   # 0
print(sol.countPrimes(1))   # 0
