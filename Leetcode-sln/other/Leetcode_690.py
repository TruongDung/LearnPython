from typing import List

class Employee:
    def __init__(self, id: int, importance: int, subordinates: List[int]):
        self.id = id
        self.importance = importance
        self.subordinates = subordinates

class Solution:
    def getImportance(self, employees: List['Employee'], id: int) -> int:
        employee_by_id = {employee.id: employee for employee in employees}
        print(employee_by_id)
        def dfs(employee_id):
            employee = employee_by_id[employee_id]
            total = employee.importance
            for subordinate_id in employee.subordinates:
                total += dfs(subordinate_id)
            return total
        return dfs(id)

sol = Solution()
employees = [
    Employee(1, 5, [2, 3]),
    Employee(2, 3, []),
    Employee(3, 3, []),
]
print(sol.getImportance(employees, 1))