"use strict";
const { define } = require("./catalog-lesson");
const lessons = {};
const add = (id,title,group,sample,expected,source,options={}) => lessons[id]=define(id,title,group,sample,expected,source,options);
add(105,"Construct Binary Tree from Preorder and Inorder Traversal","tree",[[3,9,20,15,7],[9,3,15,20,7]],[3,9,20,null,null,15,7],`
class Solution:
    def buildTree(self, preorder, inorder):
        assert len(preorder) == len(inorder) and len(set(preorder)) == len(preorder)
        assert set(preorder) == set(inorder)
        positions = {value: i for i, value in enumerate(inorder)}
        cursor = 0
        def build(lo, hi):
            nonlocal cursor
            if lo > hi:
                return None
            value = preorder[cursor]
            pivot = positions[value]
            assert lo <= pivot <= hi, 'Inconsistent traversals'
            cursor += 1
            root = TreeNode(value)
            root.left = build(lo, pivot - 1)
            root.right = build(pivot + 1, hi)
            return root
        return build(0, len(inorder) - 1)
`,{answerKind:"tree",time:"O(n)",space:"O(n)",vi:"Dựng cây từ tiền thứ tự và trung thứ tự",description:"Preorder chooses each root; its position in inorder separates left and right subtrees."});
add(106,"Construct Binary Tree from Inorder and Postorder Traversal","tree",[[9,3,15,20,7],[9,15,7,20,3]],[3,9,20,null,null,15,7],`
class Solution:
    def buildTree(self, inorder, postorder):
        assert len(inorder) == len(postorder) and len(set(inorder)) == len(inorder)
        assert set(inorder) == set(postorder)
        positions = {v: i for i, v in enumerate(inorder)}
        cursor = len(postorder) - 1
        def build(lo, hi):
            nonlocal cursor
            if lo > hi:
                return None
            value = postorder[cursor]
            pivot = positions[value]
            assert lo <= pivot <= hi, 'Inconsistent traversals'
            cursor -= 1
            root = TreeNode(value)
            root.right = build(pivot + 1, hi)
            root.left = build(lo, pivot - 1)
            return root
        return build(0, len(inorder) - 1)
`,{answerKind:"tree",time:"O(n)",space:"O(n)",description:"Consume postorder backwards: root, right subtree, then left subtree."});
add(119,"Pascal's Triangle II","dp",[4],[1,4,6,4,1],`
class Solution:
    def getRow(self, rowIndex):
        assert 0 <= rowIndex <= 33
        row = [1] * (rowIndex + 1)
        for r in range(2, rowIndex + 1):
            for c in range(r - 1, 0, -1):
                row[c] += row[c - 1]
        return row
`,{time:"O(k²)",space:"O(k)",difficulty:"easy",description:"Update one Pascal row from right to left so previous-row values survive."});
add(137,"Single Number II","bits",[[2,2,3,2]],3,`
class Solution:
    def singleNumber(self, nums):
        ones = twos = 0
        for value in nums:
            ones = (ones ^ value) & ~twos
            twos = (twos ^ value) & ~ones
        return ones
`,{time:"O(n)",space:"O(1)",description:"Track each bit count modulo three using the ones and twos masks."});
add(142,"Linked List Cycle II","list",[[3,2,0,-4],1],1,`
class Solution:
    def detectCycle(self, values, pos):
        assert -1 <= pos < len(values) or (not values and pos == -1)
        nodes = [ListNode(v) for v in values]
        for i in range(len(nodes) - 1):
            nodes[i].next = nodes[i + 1]
        if nodes and pos >= 0:
            nodes[-1].next = nodes[pos]
        head = nodes[0] if nodes else None
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                slow = head
                while slow is not fast:
                    slow = slow.next
                    fast = fast.next
                return nodes.index(slow)
        return -1
`,{time:"O(n)",space:"O(1) algorithm; O(n) input fixture",description:"Floyd's two pointers locate the cycle entry. The fixture builds the cycle at pos; output is its index, or -1."});
add(147,"Insertion Sort List","list",[[4,2,1,3]],[1,2,3,4],`
class Solution:
    def insertionSortList(self, head):
        dummy = ListNode()
        while head:
            following = head.next
            prev = dummy
            while prev.next and prev.next.val < head.val:
                prev = prev.next
            head.next = prev.next
            prev.next = head
            head = following
        return dummy.next
`,{kinds:["list"],answerKind:"list",time:"O(n²)",space:"O(1)",description:"Detach each node and insert it into the correct position of the sorted chain."});
add(157,"Read N Characters Given Read4","design",["abcdefgh",6],"abcdef",`
class Solution:
    def read(self, file, n):
        assert n >= 0
        cursor = 0
        output = []
        while len(output) < n:
            buffer = list(file[cursor:cursor + 4])
            cursor += len(buffer)
            if not buffer:
                break
            take = min(len(buffer), n - len(output))
            output.extend(buffer[:take])
        return ''.join(output)
`,{time:"O(n)",space:"O(n) output",description:"Simulated read4 returns up to four file characters. Copy only the requested n characters."});
add(158,"Read N Characters Given Read4 II - Call Multiple Times","design",["abcdefgh",[1,3,4,1]],["a","bcd","efgh",""],`
class Solution:
    def readRequests(self, file, requests):
        from collections import deque
        cursor = 0
        buffer = deque()
        answers = []
        for n in requests:
            assert n >= 0
            output = []
            while len(output) < n:
                if not buffer:
                    block = file[cursor:cursor + 4]
                    cursor += len(block)
                    buffer.extend(block)
                if not buffer:
                    break
                output.append(buffer.popleft())
            answers.append(''.join(output))
        return answers
`,{difficulty:"hard",time:"O(total requested characters)",space:"O(1) buffer + output",description:"Keep unread read4 characters in a persistent buffer between successive read requests."});
add(161,"One Edit Distance","string",["ab","acb"],true,`
class Solution:
    def isOneEditDistance(self, s, t):
        if len(s) > len(t):
            s, t = t, s
        if len(t) - len(s) > 1:
            return False
        for i in range(len(s)):
            if s[i] != t[i]:
                if len(s) == len(t):
                    return s[i + 1:] == t[i + 1:]
                return s[i:] == t[i + 1:]
        return len(t) == len(s) + 1
`,{time:"O(n)",space:"O(n) slicing",description:"Exactly one insertion, deletion or replacement must transform s into t; identical strings are false."});
add(162,"Find Peak Element","search",[[1,2,1,3,5,6,4]],5,`
class Solution:
    def findPeakElement(self, nums):
        assert nums and all(nums[i] != nums[i + 1] for i in range(len(nums) - 1))
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1
            else:
                hi = mid
        return lo
`,{time:"O(log n)",space:"O(1)",description:"Follow the rising slope to retain a peak inside the binary-search interval."});
add(163,"Missing Ranges","array",[[0,1,3,50,75],0,99],[[2,2],[4,49],[51,74],[76,99]],`
class Solution:
    def findMissingRanges(self, nums, lower, upper):
        assert lower <= upper and nums == sorted(set(nums))
        assert all(lower <= x <= upper for x in nums)
        answer = []
        prev = lower - 1
        for value in nums + [upper + 1]:
            if value > prev + 1:
                answer.append([prev + 1, value - 1])
            prev = value
        return answer
`,{time:"O(n)",space:"O(1) + output",difficulty:"easy",description:"Sentinels before lower and after upper expose every missing interval."});
add(164,"Maximum Gap","array",[[3,6,9,1]],3,`
class Solution:
    def maximumGap(self, nums):
        if len(nums) < 2 or min(nums) == max(nums):
            return 0
        lo, hi = min(nums), max(nums)
        width = max(1, (hi - lo) // (len(nums) - 1))
        buckets = [[float('inf'), -float('inf')] for _ in range((hi - lo) // width + 1)]
        for value in nums:
            index = (value - lo) // width
            buckets[index][0] = min(buckets[index][0], value)
            buckets[index][1] = max(buckets[index][1], value)
        answer, previous = 0, lo
        for minimum, maximum in buckets:
            if minimum != float('inf'):
                answer = max(answer, minimum - previous)
                previous = maximum
        return answer
`,{time:"O(n)",space:"O(n)",difficulty:"hard",description:"Store only bucket minima and maxima; the maximum sorted gap lies between nonempty buckets."});
add(165,"Compare Version Numbers","string",["1.01","1.001"],0,`
class Solution:
    def compareVersion(self, version1, version2):
        a, b = version1.split('.'), version2.split('.')
        for i in range(max(len(a), len(b))):
            x = int(a[i]) if i < len(a) else 0
            y = int(b[i]) if i < len(b) else 0
            if x != y:
                return 1 if x > y else -1
        return 0
`,{time:"O(n + m)",space:"O(n + m)",description:"Compare numeric revision components; leading zeros and absent trailing revisions count as zero."});
add(166,"Fraction to Recurring Decimal","math",[4,333],"0.(012)",`
class Solution:
    def fractionToDecimal(self, numerator, denominator):
        assert denominator != 0 and abs(denominator) <= 1000
        sign = '-' if numerator * denominator < 0 else ''
        numerator, denominator = abs(numerator), abs(denominator)
        integer, remainder = divmod(numerator, denominator)
        digits, seen = [], {}
        while remainder and remainder not in seen:
            seen[remainder] = len(digits)
            digit, remainder = divmod(remainder * 10, denominator)
            digits.append(str(digit))
        if remainder:
            start = seen[remainder]
            digits = digits[:start] + ['('] + digits[start:] + [')']
        return sign + str(integer) + ('.' + ''.join(digits) if digits else '')
`,{time:"O(|denominator|)",space:"O(|denominator|)",description:"Remember each remainder's digit position; a repeated remainder starts the recurring cycle. Visual denominator limit: 1000."});
add(168,"Excel Sheet Column Title","math",[701],"ZY",`
class Solution:
    def convertToTitle(self, columnNumber):
        assert columnNumber > 0
        answer = []
        while columnNumber:
            columnNumber, digit = divmod(columnNumber - 1, 26)
            answer.append(chr(ord('A') + digit))
        return ''.join(reversed(answer))
`,{time:"O(log₂₆ n)",space:"O(log₂₆ n)",difficulty:"easy",description:"Excel uses bijective base 26: subtract one before extracting each A–Z digit."});
add(170,"Two Sum III - Data Structure Design","design",[[["add",1],["add",3],["add",5],["find",4],["find",7]]],[null,null,null,true,false],`
class Solution:
    def simulate(self, operations):
        counts = {}
        answers = []
        for operation, value in operations:
            if operation == 'add':
                counts[value] = counts.get(value, 0) + 1
                answers.append(None)
            else:
                assert operation == 'find'
                found = False
                for x in counts:
                    y = value - x
                    if y in counts and (x != y or counts[x] >= 2):
                        found = True
                        break
                answers.append(found)
        return answers
`,{time:"add O(1); find O(n)",space:"O(n)",description:"Store value frequencies; find checks complements and requires two copies when both values are equal."});
add(171,"Excel Sheet Column Number","math",["ZY"],701,`
class Solution:
    def titleToNumber(self, columnTitle):
        assert columnTitle and columnTitle.isalpha() and columnTitle.isupper()
        number = 0
        for ch in columnTitle:
            number = number * 26 + ord(ch) - ord('A') + 1
        return number
`,{time:"O(n)",space:"O(1)",difficulty:"easy",description:"Fold A–Z digits left to right in bijective base 26."});
add(172,"Factorial Trailing Zeroes","math",[25],6,`
class Solution:
    def trailingZeroes(self, n):
        assert n >= 0
        answer = 0
        while n:
            n //= 5
            answer += n
        return answer
`,{time:"O(log₅ n)",space:"O(1)",description:"Count factors of five contributed by multiples of 5, 25, 125, and so on."});
add(175,"Combine Two Tables","sql",[[{"personId":1,"firstName":"Allen","lastName":"Wang"},{"personId":2,"firstName":"Bob","lastName":"Alice"}],[{"personId":2,"city":"New York City","state":"New York"}]],[{"firstName":"Allen","lastName":"Wang","city":null,"state":null},{"firstName":"Bob","lastName":"Alice","city":"New York City","state":"New York"}],`
class Solution:
    def combine(self, people, addresses):
        answer = []
        for person in people:
            matches = [a for a in addresses if a['personId'] == person['personId']]
            for address in matches or [None]:
                answer.append(dict(firstName=person['firstName'], lastName=person['lastName'], city=address['city'] if address else None, state=address['state'] if address else None))
        return answer
`,{time:"O(P·A + output)",space:"O(output)",difficulty:"easy",description:"LEFT JOIN retains people without an address and fills address columns with NULL.",reference:"SELECT p.firstName, p.lastName, a.city, a.state\nFROM Person p LEFT JOIN Address a ON p.personId = a.personId;"});
for(const [id,title,rank] of [[176,"Second Highest Salary",2],[177,"Nth Highest Salary",3]]){
  add(id,title,"sql",rank===2?[[100,200,300]]:[[100,200,300],3],rank===2?200:100,`
class Solution:
    def highest(self, salaries${rank===2?"":", n"}):
        n = ${rank===2?"2":"n"}
        ranked = sorted(set(salaries), reverse=True)
        return ranked[n - 1] if 1 <= n <= len(ranked) else None
`,{time:"O(n log n)",space:"O(n)",description:"Rank distinct salaries; return NULL when the requested distinct rank does not exist.",reference:id===176?"SELECT MAX(salary) AS SecondHighestSalary\nFROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);":"CREATE FUNCTION getNthHighestSalary(N INT) RETURNS INT\nBEGIN\n  SET N = N - 1;\n  RETURN (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT N, 1);\nEND"});
}
add(178,"Rank Scores","sql",[[3.5,3.65,4,3.85,4,3.65]],[[4,1],[4,1],[3.85,2],[3.65,3],[3.65,3],[3.5,4]],`
class Solution:
    def rankScores(self, scores):
        ranks = {value: i + 1 for i, value in enumerate(sorted(set(scores), reverse=True))}
        answer = []
        for score in sorted(scores, reverse=True):
            answer.append([score, ranks[score]])
        return answer
`,{time:"O(n log n)",space:"O(n)",description:"DENSE_RANK assigns equal scores equal ranks, with no gaps.",reference:"SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS `rank`\nFROM Scores ORDER BY score DESC;"});
add(180,"Consecutive Numbers","sql",[[{"id":1,"num":1},{"id":2,"num":1},{"id":3,"num":1},{"id":4,"num":2}]],[1],`
class Solution:
    def consecutive(self, logs):
        by_id = {row['id']: row['num'] for row in logs}
        answer = set()
        for index, number in by_id.items():
            if by_id.get(index + 1) == number and by_id.get(index + 2) == number:
                answer.add(number)
        return sorted(answer)
`,{time:"O(n)",space:"O(n)",description:"Find a number appearing at three consecutive IDs and remove duplicate results.",reference:"SELECT DISTINCT a.num AS ConsecutiveNums\nFROM Logs a JOIN Logs b ON b.id=a.id+1 JOIN Logs c ON c.id=a.id+2\nWHERE a.num=b.num AND b.num=c.num;"});
add(181,"Employees Earning More Than Their Managers","sql",[[{"id":1,"name":"Joe","salary":70000,"managerId":3},{"id":3,"name":"Sam","salary":60000,"managerId":null}]],["Joe"],`
class Solution:
    def employees(self, employees):
        managers = {e['id']: e for e in employees}
        answer = []
        for employee in employees:
            manager = managers.get(employee['managerId'])
            if manager and employee['salary'] > manager['salary']:
                answer.append(employee['name'])
        return answer
`,{time:"O(n)",space:"O(n)",difficulty:"easy",description:"Self-join each employee with their manager and compare salaries.",reference:"SELECT e.name AS Employee FROM Employee e\nJOIN Employee m ON e.managerId=m.id WHERE e.salary>m.salary;"});
add(182,"Duplicate Emails","sql",[["a@b.com","c@d.com","a@b.com"]],["a@b.com"],`
class Solution:
    def duplicates(self, emails):
        from collections import Counter
        counts = Counter(emails)
        answer = []
        for email, count in counts.items():
            if count > 1:
                answer.append(email)
        return sorted(answer)
`,{time:"O(n)",space:"O(n)",difficulty:"easy",description:"GROUP BY email and retain groups with COUNT(*) > 1.",reference:"SELECT email AS Email FROM Person GROUP BY email HAVING COUNT(*) > 1;"});
add(183,"Customers Who Never Order","sql",[[{"id":1,"name":"Joe"},{"id":2,"name":"Henry"}],[1]],["Henry"],`
class Solution:
    def customers(self, customers, orderCustomerIds):
        ordered = set(orderCustomerIds)
        answer = []
        for customer in customers:
            if customer['id'] not in ordered:
                answer.append(customer['name'])
        return answer
`,{time:"O(C + O)",space:"O(O)",difficulty:"easy",description:"Anti-join finds customers without any matching order.",reference:"SELECT c.name AS Customers FROM Customers c\nWHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.customerId=c.id);"});
for(const [id,title,k]of [[184,"Department Highest Salary",1],[185,"Department Top Three Salaries",3]])add(id,title,"sql",[[{"name":"Joe","salary":85000,"departmentId":1},{"name":"Henry","salary":80000,"departmentId":1},{"name":"Max","salary":90000,"departmentId":1}],[{"id":1,"name":"IT"}]],k===1?[{"Department":"IT","Employee":"Max","Salary":90000}]:[{"Department":"IT","Employee":"Joe","Salary":85000},{"Department":"IT","Employee":"Henry","Salary":80000},{"Department":"IT","Employee":"Max","Salary":90000}],`
class Solution:
    def topSalaries(self, employees, departments):
        names = {d['id']: d['name'] for d in departments}
        top = {}
        for dept in names:
            salaries = {e['salary'] for e in employees if e['departmentId'] == dept}
            top[dept] = set(sorted(salaries, reverse=True)[:${k}])
        answer = []
        for employee in employees:
            dept = employee['departmentId']
            if dept in top and employee['salary'] in top[dept]:
                answer.append(dict(Department=names[dept], Employee=employee['name'], Salary=employee['salary']))
        return answer
`,{time:"O(D·E + E log E)",space:"O(E + D)",difficulty:id===185?"hard":"medium",description:`Find the top ${k} distinct salary levels per department, retaining all ties.`,reference:`WITH ranked AS (SELECT e.*, DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) r FROM Employee e)\nSELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM ranked e JOIN Department d ON d.id=e.departmentId WHERE e.r<=${k};`});
add(186,"Reverse Words in a String II","string",[["t","h","e"," ","s","k","y"," ","i","s"," ","b","l","u","e"]],["b","l","u","e"," ","i","s"," ","s","k","y"," ","t","h","e"],`
class Solution:
    def reverseWords(self, s):
        def reverse(lo, hi):
            while lo < hi:
                s[lo], s[hi] = s[hi], s[lo]
                lo += 1
                hi -= 1
        reverse(0, len(s) - 1)
        start = 0
        for end in range(len(s) + 1):
            if end == len(s) or s[end] == ' ':
                reverse(start, end - 1)
                start = end + 1
        return s
`,{time:"O(n)",space:"O(1)",description:"Reverse the whole character array, then reverse each word in place."});
add(187,"Repeated DNA Sequences","string",["AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"],["AAAAACCCCC","CCCCCAAAAA"],`
class Solution:
    def findRepeatedDnaSequences(self, s):
        assert set(s) <= set('ACGT')
        seen, repeated = set(), set()
        for i in range(len(s) - 9):
            word = s[i:i + 10]
            if word in seen:
                repeated.add(word)
            seen.add(word)
        return sorted(repeated)
`,{time:"O(n)",space:"O(n)",description:"Slide a ten-character window and distinguish first occurrences from repeated sequences."});
add(190,"Reverse Bits","bits",[43261596],964176192,`
class Solution:
    def reverseBits(self, n):
        assert 0 <= n < 2 ** 32
        answer = 0
        for bit in range(32):
            answer = (answer << 1) | (n & 1)
            n >>= 1
        return answer
`,{time:"O(32)",space:"O(1)",difficulty:"easy",description:"Move exactly 32 low bits into the reversed result, including leading zeros."});
add(192,"Word Frequency","shell",["the day is sunny the the\nthe sunny is is"],[["the",4],["is",3],["sunny",2],["day",1]],`
class Solution:
    def frequency(self, text):
        from collections import Counter
        counts = Counter()
        for word in text.split():
            counts[word] += 1
        return sorted(counts.items(), key=lambda pair: (-pair[1], pair[0]))
`,{time:"O(n + u log u)",space:"O(u)",description:"Tokenize whitespace, count words, then sort by descending frequency (alphabetically for ties).",reference:"tr -s '[:space:]' '\\n' < words.txt | sed '/^$/d' | sort | uniq -c | sort -k1,1nr -k2,2 | awk '{print $2, $1}'"});
add(193,"Valid Phone Numbers","shell",[["987-123-4567","123 456 7890","(123) 456-7890"]],["987-123-4567","(123) 456-7890"],`
class Solution:
    def validNumbers(self, lines):
        import re
        answer = []
        for line in lines:
            if re.fullmatch(r'(?:[0-9]{3}-|[(][0-9]{3}[)] )[0-9]{3}-[0-9]{4}', line):
                answer.append(line)
        return answer
`,{time:"O(n)",space:"O(output)",difficulty:"easy",description:"Accept exactly xxx-xxx-xxxx or (xxx) xxx-xxxx using anchored regular expressions.",reference:"grep -E '^([0-9]{3}-|\\([0-9]{3}\\) )[0-9]{3}-[0-9]{4}$' file.txt"});
add(194,"Transpose File","shell",["name age\nalice 21\nryan 30"],"name alice ryan\nage 21 30",`
class Solution:
    def transpose(self, text):
        rows = [line.split() for line in text.splitlines()]
        assert not rows or all(len(row) == len(rows[0]) for row in rows)
        output = []
        for col in range(len(rows[0]) if rows else 0):
            output.append(' '.join(row[col] for row in rows))
        return '\\n'.join(output)
`,{time:"O(rows·cols)",space:"O(rows·cols)",description:"Turn each whitespace-separated input column into one output row.",reference:"awk '{for(i=1;i<=NF;i++) a[i]=a[i] (NR==1?\"\":\" \") $i} END {for(i=1;i<=NF;i++) print a[i]}' file.txt"});
add(195,"Tenth Line","shell",["1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11"],"10",`
class Solution:
    def tenthLine(self, text):
        answer = ''
        for number, line in enumerate(text.splitlines(), 1):
            if number == 10:
                answer = line
                break
        return answer
`,{time:"O(first 10 lines)",space:"O(n) model input",difficulty:"easy",description:"Return only line ten, or an empty result when the file is shorter.",reference:"sed -n '10p' file.txt"});
add(196,"Delete Duplicate Emails","sql",[[{"id":1,"email":"john@example.com"},{"id":2,"email":"bob@example.com"},{"id":3,"email":"john@example.com"}]],[{"id":1,"email":"john@example.com"},{"id":2,"email":"bob@example.com"}],`
class Solution:
    def removeDuplicates(self, people):
        first = {}
        for person in people:
            email = person['email']
            first[email] = min(first.get(email, person['id']), person['id'])
        return [p for p in people if p['id'] == first[p['email']]]
`,{time:"O(n)",space:"O(n)",difficulty:"easy",description:"Keep the smallest id for every email; the model returns the surviving table without touching a database.",reference:"DELETE p FROM Person p JOIN Person q ON p.email=q.email AND p.id>q.id;"});
add(197,"Rising Temperature","sql",[[{"id":1,"recordDate":"2015-01-01","temperature":10},{"id":2,"recordDate":"2015-01-02","temperature":25},{"id":3,"recordDate":"2015-01-03","temperature":20}]],[2],`
class Solution:
    def warmer(self, weather):
        from datetime import date, timedelta
        temperatures = {date.fromisoformat(r['recordDate']): r['temperature'] for r in weather}
        answer = []
        for row in weather:
            day = date.fromisoformat(row['recordDate'])
            yesterday = day - timedelta(days=1)
            if yesterday in temperatures and row['temperature'] > temperatures[yesterday]:
                answer.append(row['id'])
        return answer
`,{time:"O(n)",space:"O(n)",difficulty:"easy",description:"Compare with the previous calendar day, not simply the previous table row.",reference:"SELECT w.id FROM Weather w JOIN Weather p\nON DATEDIFF(w.recordDate,p.recordDate)=1 WHERE w.temperature>p.temperature;"});
module.exports = lessons;
