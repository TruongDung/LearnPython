from datetime import datetime
class Solution:
    def daysBetweenDates(self, date1: str, date2: str) -> int:
        format_pattern = "%Y-%m-%d"
        datetime_object1 = datetime.strptime(date1, format_pattern)
        datetime_object2 = datetime.strptime(date2, format_pattern)
        a1 = datetime_object1 - datetime_object2
        return abs(a1.days)
    

sol = Solution()
print(sol.daysBetweenDates("2019-06-29", "2019-06-30"))