from collections import deque
from typing import List


class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        # For each course, list the courses that depend on it.
        next_courses = [[] for _ in range(numCourses)]
        # How many prerequisites each course still needs.
        prereq_count = [0] * numCourses

        for course, prerequisite in prerequisites:
            next_courses[prerequisite].append(course)
            prereq_count[course] += 1

        # Start with every course that has no prerequisites.
        queue = deque()
        for course in range(numCourses):
            if prereq_count[course] == 0:
                queue.append(course)

        finished = 0
        while queue:
            course = queue.popleft()
            finished += 1

            # Taking this course removes one prerequisite from its dependents.
            for next_course in next_courses[course]:
                prereq_count[next_course] -= 1
                if prereq_count[next_course] == 0:
                    queue.append(next_course)

        # If we managed to finish every course, there was no cycle.
        return finished == numCourses
