class Solution:
    def maximumPopulation(self, logs: List[List[int]]) -> int:
       populations = [0 for _ in range(101)]

       for log in logs:
           start_year = log[0] - 1950
           end_year = log[1] - 1950
           populations[start_year] += 1
           populations[end_year] -= 1

       for i in range(1, 101):
           populations[i] += populations[i-1]
      
       max_year = 0
       max_population = 0

       for i in range(101):
           if max_population < populations[i]:
               max_population = populations[i]
               max_year = i

       return max_year+1950 
        
sol = Solution()
sol.maximumPopulation([[1950,1961],[1960,1971],[1970,1981]])