"use strict";
const {defineEasy}=require('./easy-lesson');
const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(601,'Human Traffic of Stadium','sql',[[{id:1,visit_date:'2017-01-01',people:120},{id:2,visit_date:'2017-01-02',people:150},{id:3,visit_date:'2017-01-03',people:180},{id:4,visit_date:'2017-01-04',people:80}]], [{id:1,visit_date:'2017-01-01',people:120},{id:2,visit_date:'2017-01-02',people:150},{id:3,visit_date:'2017-01-03',people:180}],`
class Solution:
    def stadium(self, rows):
        answer, run = [], []
        for row in sorted(rows, key=lambda r: r['id']):
            if row['people'] < 100 or (run and row['id'] != run[-1]['id'] + 1):
                if len(run) >= 3:
                    answer.extend(run)
                run = []
            if row['people'] >= 100:
                run.append(row)
        if len(run) >= 3:
            answer.extend(run)
        return answer
`,'Gom các ID liên tiếp có ít nhất 100 người; chỉ giữ cả nhóm dài từ 3.','O(n log n)','O(n)',{guide:'Group consecutive IDs with at least 100 visitors. Keep every row in runs of length three or more.'});
add(602,'Friend Requests II: Who Has the Most Friends','sql',[[[1,2],[1,3],[2,3],[3,4]]],[{id:3,num:3}],`
class Solution:
    def mostFriends(self, accepted):
        friends = {}
        for a, b in accepted:
            friends.setdefault(a, set()).add(b)
            friends.setdefault(b, set()).add(a)
        best = max((len(v) for v in friends.values()), default=0)
        return [{'id': p, 'num': len(friends[p])} for p in sorted(friends) if len(friends[p]) == best]
`,'Mỗi quan hệ thêm bạn cho cả hai người; tìm người có tập bạn lớn nhất.','O(n)','O(n)');
add(603,'Consecutive Available Seats','sql',[[{seat_id:1,free:1},{seat_id:2,free:0},{seat_id:3,free:1},{seat_id:4,free:1},{seat_id:5,free:1}]],[3,4,5],`
class Solution:
    def seats(self, rows):
        free = {r['seat_id'] for r in rows if r['free']}
        answer = []
        for seat in sorted(free):
            if seat - 1 in free or seat + 1 in free:
                answer.append(seat)
        return answer
`,'Ghế trống được chọn khi ít nhất một ghế sát bên cũng trống.','O(n log n)','O(n)');
add(604,'Design Compressed String Iterator','design',['L1e2t1C1o1d1e1',['next','next','next','hasNext','next']],['L','e','e',true,'t'],`
class Solution:
    def iterate(self, compressedString, operations):
        cursor, remaining, letter = 0, 0, ' '
        answer = []
        for operation in operations:
            if operation == 'hasNext':
                answer.append(remaining > 0 or cursor < len(compressedString))
                continue
            if remaining == 0 and cursor < len(compressedString):
                letter = compressedString[cursor]
                cursor += 1
                end = cursor
                while end < len(compressedString) and compressedString[end].isdigit():
                    end += 1
                remaining = int(compressedString[cursor:end])
                cursor = end
            answer.append(letter if remaining else ' ')
            remaining = max(0, remaining - 1)
        return answer
`,'Con trỏ đọc nhóm chữ–số; remaining cho biết còn bao nhiêu lần trả chữ hiện tại. hasNext không tiêu thụ ký tự.','O(|s|+q)','O(q)',{focus:['compressedString','remaining','cursor','answer']});
add(605,'Can Place Flowers','greedy',[[1,0,0,0,1],1],true,`
class Solution:
    def canPlaceFlowers(self, flowerbed, n):
        bed = flowerbed[:]
        planted = 0
        for i in range(len(bed)):
            if bed[i] == 0 and (i == 0 or bed[i-1] == 0) and (i+1 == len(bed) or bed[i+1] == 0):
                bed[i] = 1
                planted += 1
        return planted >= n
`,'Chỉ trồng vào ô trống khi cả hai ô kề đều trống hoặc nằm ngoài biên.','O(n)','O(n)',{difficulty:'easy',focus:['bed','planted']});
add(606,'Construct String from Binary Tree','tree',[[1,2,3,4]],'1(2(4))(3)',`
class Solution:
    def tree2str(self, root):
        def visit(node):
            if not node:
                return ''
            left, right = visit(node.left), visit(node.right)
            text = str(node.val)
            if node.left or node.right:
                text += '(' + left + ')'
            if node.right:
                text += '(' + right + ')'
            return text
        return visit(root)
`,'Viết node rồi nhánh trái/phải trong ngoặc; giữ () bên trái nếu chỉ có con phải.','O(n²)','O(n²)',{kinds:['tree']});
add(607,'Sales Person','sql',[[{sales_id:1,name:'Amy'},{sales_id:2,name:'Bob'}],[{com_id:1,name:'RED'},{com_id:2,name:'BLUE'}],[{sales_id:1,com_id:1},{sales_id:2,com_id:2}]],['Bob'],`
class Solution:
    def salesPerson(self, sales, companies, orders):
        red = {r['com_id'] for r in companies if r['name'] == 'RED'}
        excluded = set()
        for order in orders:
            if order['com_id'] in red:
                excluded.add(order['sales_id'])
        return [r['name'] for r in sales if r['sales_id'] not in excluded]
`,'Tìm đơn hàng của RED, đánh dấu người bán liên quan rồi lấy phần còn lại.','O(s+c+o)','O(s+c)');
add(608,'Tree Node','sql',[[{id:1,p_id:null},{id:2,p_id:1},{id:3,p_id:1}]], [{id:1,type:'Root'},{id:2,type:'Leaf'},{id:3,type:'Leaf'}],`
class Solution:
    def classify(self, tree):
        parents = {r['p_id'] for r in tree if r['p_id'] is not None}
        answer = []
        for row in sorted(tree, key=lambda r: r['id']):
            kind = 'Root' if row['p_id'] is None else 'Inner' if row['id'] in parents else 'Leaf'
            answer.append({'id': row['id'], 'type': kind})
        return answer
`,'Không có cha → Root; có con → Inner; còn lại là Leaf.','O(n log n)','O(n)');
add(609,'Find Duplicate File in System','string',[['root/a 1.txt(abcd) 2.txt(efgh)','root/c 3.txt(abcd)','root/c/d 4.txt(efgh)']],[['root/a/1.txt','root/c/3.txt'],['root/a/2.txt','root/c/d/4.txt']],`
class Solution:
    def findDuplicate(self, paths):
        groups = {}
        for description in paths:
            folder, *files = description.split()
            for file in files:
                name, content = file.split('(', 1)
                groups.setdefault(content[:-1], []).append(folder + '/' + name)
        return [files for files in groups.values() if len(files) > 1]
`,'Nhóm đường dẫn theo nội dung trong ngoặc; nhóm có nhiều file chính là trùng lặp.','O(L)','O(L)');
add(610,'Triangle Judgement','sql',[[[13,15,30],[10,20,15]]],['No','Yes'],`
class Solution:
    def triangle(self, rows):
        answer = []
        for x, y, z in rows:
            answer.append('Yes' if min(x,y,z) > 0 and x+y > z and x+z > y and y+z > x else 'No')
        return answer
`,'Ba cạnh tạo tam giác khi tổng hai cạnh bất kỳ lớn hơn cạnh còn lại.','O(n)','O(n)');
add(612,'Shortest Distance in a Plane','sql',[[[-1,-1],[0,0],[-1,-2]]],1,`
class Solution:
    def distance(self, points):
        import math
        best = float('inf')
        for i in range(len(points)):
            for j in range(i):
                squared = sum((a-b)**2 for a,b in zip(points[i], points[j]))
                best = min(best, squared)
        return round(math.sqrt(best), 2) if len(points) >= 2 else None
`,'Thử từng cặp điểm; giữ bình phương khoảng cách nhỏ nhất rồi lấy căn.','O(n²)','O(1)');
add(613,'Shortest Distance in a Line','sql',[[-1,0,2]],1,`
class Solution:
    def distance(self, points):
        ordered = sorted(points)
        best = None
        for i in range(1, len(ordered)):
            gap = ordered[i] - ordered[i-1]
            best = gap if best is None else min(best, gap)
        return best
`,'Sắp điểm trên trục số; cặp gần nhất luôn nằm cạnh nhau.','O(n log n)','O(n)');
add(614,'Second Degree Follower','sql',[[{followee:'A',follower:'B'},{followee:'B',follower:'C'},{followee:'B',follower:'D'}]],[{follower:'B',num:2}],`
class Solution:
    def secondDegree(self, follow):
        following = {r['follower'] for r in follow}
        groups = {}
        for row in follow:
            groups.setdefault(row['followee'], set()).add(row['follower'])
        return [{'follower': p, 'num': len(groups[p])} for p in sorted(groups) if p in following]
`,'Giữ người vừa theo dõi người khác vừa có người theo dõi; đếm số follower của họ.','O(n log n)','O(n)');
add(615,'Average Salary: Departments VS Company','sql',[[{employee_id:1,department_id:1},{employee_id:2,department_id:2}],[{employee_id:1,amount:100,pay_date:'2020-01-01'},{employee_id:2,amount:200,pay_date:'2020-01-01'}]],[{pay_month:'2020-01',department_id:1,comparison:'lower'},{pay_month:'2020-01',department_id:2,comparison:'higher'}],`
class Solution:
    def compare(self, employees, salaries):
        department = {r['employee_id']: r['department_id'] for r in employees}
        company, groups = {}, {}
        for row in salaries:
            month, amount = row['pay_date'][:7], row['amount']
            company.setdefault(month, []).append(amount)
            groups.setdefault((month, department[row['employee_id']]), []).append(amount)
        answer = []
        for (month, dep), amounts in sorted(groups.items()):
            left = sum(amounts) * len(company[month])
            right = sum(company[month]) * len(amounts)
            comparison = 'higher' if left > right else 'lower' if left < right else 'same'
            answer.append({'pay_month': month, 'department_id': dep, 'comparison': comparison})
        return answer
`,'Nhóm lương theo tháng và phòng ban; so trung bình phòng với trung bình toàn công ty cùng tháng.','O(n log n)','O(n)');
add(616,'Add Bold Tag in String','string',['abcxyz123',['abc','123']],'<b>abc</b>xyz<b>123</b>',`
class Solution:
    def addBoldTag(self, s, words):
        bold = [False] * len(s)
        for i in range(len(s)):
            for word in words:
                if s.startswith(word, i):
                    for j in range(i, i+len(word)):
                        bold[j] = True
        answer = ''
        for i, ch in enumerate(s):
            if bold[i] and (i == 0 or not bold[i-1]):
                answer += '<b>'
            answer += ch
            if bold[i] and (i+1 == len(s) or not bold[i+1]):
                answer += '</b>'
        return answer
`,'Tô các ký tự khớp từ điển; chỉ mở/đóng thẻ ở biên vùng tô liên tục.','O(n·Σ|word|)','O(n)',{focus:['s','bold','answer']});
add(618,'Students Report By Geography','sql',[[{name:'Jack',continent:'America'},{name:'Jane',continent:'America'},{name:'Pascal',continent:'Europe'}]],[{America:'Jack',Asia:null,Europe:'Pascal'},{America:'Jane',Asia:null,Europe:null}],`
class Solution:
    def report(self, students):
        groups = {c: sorted(r['name'] for r in students if r['continent'] == c) for c in ['America','Asia','Europe']}
        answer = []
        for i in range(max(map(len, groups.values()), default=0)):
            answer.append({c: names[i] if i < len(names) else None for c,names in groups.items()})
        return answer
`,'Sắp tên riêng từng châu lục; ghép các tên cùng thứ hạng thành một hàng, thiếu thì NULL.','O(n log n)','O(n)');
add(619,'Biggest Single Number','sql',[[8,8,3,3,1,4,5,6]],6,`
class Solution:
    def biggest(self, numbers):
        from collections import Counter
        counts = Counter(numbers)
        singles = [value for value, count in counts.items() if count == 1]
        return max(singles) if singles else None
`,'Đếm tần suất; lấy số lớn nhất trong các số xuất hiện đúng một lần.','O(n)','O(n)');
add(620,'Not Boring Movies','sql',[[{id:1,movie:'War',description:'great',rating:8.9},{id:2,movie:'Science',description:'great',rating:8.6},{id:3,movie:'Irish',description:'boring',rating:6.2}]],[{id:1,movie:'War',description:'great',rating:8.9}],`
class Solution:
    def movies(self, cinema):
        selected = []
        for row in cinema:
            if row['id'] % 2 and row['description'] != 'boring':
                selected.append(row)
        return sorted(selected, key=lambda r: -r['rating'])
`,'Lọc ID lẻ và mô tả khác boring; xếp điểm đánh giá giảm dần.','O(n log n)','O(n)');
add(623,'Add One Row to Tree','tree',[[4,2,6,3,1,5],1,2],[4,1,1,2,null,null,6,3,1,5],`
class Solution:
    def addOneRow(self, root, val, depth):
        if depth == 1:
            return TreeNode(val, root)
        def visit(node, level):
            if not node:
                return
            if level == depth - 1:
                node.left = TreeNode(val, node.left)
                node.right = TreeNode(val, None, node.right)
            else:
                visit(node.left, level+1)
                visit(node.right, level+1)
        visit(root, 1)
        return root
`,'Đến tầng ngay phía trên; chèn node mới và nối lại cây con cũ về đúng bên.','O(n)','O(n)',{kinds:['tree'],answerKind:'tree'});
add(624,'Maximum Distance in Arrays','array',[[[1,2,3],[4,5],[1,2,3]]],4,`
class Solution:
    def maxDistance(self, arrays):
        low, high, best = arrays[0][0], arrays[0][-1], 0
        for row in arrays[1:]:
            best = max(best, row[-1]-low, high-row[0])
            low, high = min(low, row[0]), max(high, row[-1])
        return best
`,'So hai đầu mảng mới với min/max của các mảng cũ trước khi cập nhật chúng.','O(k)','O(1)');
add(625,'Minimum Factorization','math',[48],68,`
class Solution:
    def smallestFactorization(self, a):
        if a == 1:
            return 1
        assert a > 0
        digits = []
        for digit in range(9, 1, -1):
            while a % digit == 0:
                digits.append(str(digit))
                a //= digit
        answer = int(''.join(digits[::-1])) if a == 1 and digits else 0
        return answer if answer < 2**31 else 0
`,'Tách thừa số từ 9 xuống 2 để ít chữ số; đảo lại để được số nhỏ nhất.','O(log a)','O(log a)');
add(626,'Exchange Seats','sql',[[{id:1,student:'Abbot'},{id:2,student:'Doris'},{id:3,student:'Emerson'}]],[{id:1,student:'Doris'},{id:2,student:'Abbot'},{id:3,student:'Emerson'}],`
class Solution:
    def exchange(self, seats):
        rows = sorted(seats, key=lambda r: r['id'])
        answer = []
        for i in range(0, len(rows), 2):
            pair = rows[i:i+2]
            students = [r['student'] for r in pair][::-1]
            answer.extend({'id': r['id'], 'student': name} for r,name in zip(pair,students))
        return answer
`,'Đổi tên sinh viên trong từng cặp ghế 1–2, 3–4; ghế lẻ cuối giữ nguyên.','O(n log n)','O(n)');
add(627,'Swap Salary','sql',[[{id:1,name:'A',sex:'m',salary:100},{id:2,name:'B',sex:'f',salary:200}]],[{id:1,name:'A',sex:'f',salary:100},{id:2,name:'B',sex:'m',salary:200}],`
class Solution:
    def swap(self, salary):
        answer = []
        for row in salary:
            updated = dict(row)
            updated['sex'] = 'f' if row['sex'] == 'm' else 'm'
            answer.append(updated)
        return answer
`,'Mỗi hàng đổi m ↔ f; các cột khác giữ giá trị ban đầu.','O(n)','O(n)',{reference:"UPDATE Salary SET sex = CASE sex WHEN 'm' THEN 'f' ELSE 'm' END;"});
add(633,'Sum of Square Numbers','math',[5],true,`
class Solution:
    def judgeSquareSum(self, c):
        import math
        assert 0 <= c <= 1000000
        left, right = 0, math.isqrt(c)
        while left <= right:
            total = left*left + right*right
            if total == c:
                return True
            if total < c:
                left += 1
            else:
                right -= 1
        return False
`,'Tổng hai bình phương nhỏ thì tăng trái; lớn thì giảm phải.','O(√c)','O(1)');
add(634,'Find the Derangement of An Array','dp',[3],2,`
class Solution:
    def findDerangement(self, n):
        assert 0 <= n <= 80
        dp = [1, 0]
        for size in range(2, n+1):
            dp.append((size-1) * (dp[size-1]+dp[size-2]) % 1000000007)
        return dp[n]
`,'Chọn vị trí cho phần tử đầu: có n−1 cách; phần còn lại thành hai trường hợp dp[n−1] và dp[n−2].','O(n)','O(n)');
add(638,'Shopping Offers','dp',[[2,5],[[3,0,5],[1,2,10]],[3,2]],14,`
class Solution:
    def shoppingOffers(self, price, special, needs):
        from functools import lru_cache
        offers = [o for o in special if any(o[:-1]) and o[-1] < sum(p*q for p,q in zip(price,o))]
        @lru_cache(None)
        def solve(state):
            best = sum(p*q for p,q in zip(price,state))
            for offer in offers:
                remain = tuple(q-count for q,count in zip(state,offer))
                if min(remain) >= 0:
                    best = min(best, offer[-1] + solve(remain))
            return best
        return solve(tuple(needs))
`,'Mỗi trạng thái là số món còn thiếu; so mua lẻ với từng gói không mua dư. Lưu kết quả để tránh tính lại.','O(∏(needs+1)·s·k)','O(∏(needs+1))');
add(639,'Decode Ways II','dp',['1*'],18,`
class Solution:
    def numDecodings(self, s):
        dp = [1]
        for i, ch in enumerate(s):
            single = 9 if ch == '*' else int(ch != '0')
            ways = single * dp[-1]
            if i:
                a, b = s[i-1], ch
                if a == '*' and b == '*':
                    pair = 15
                elif a == '*':
                    pair = 2 if b <= '6' else 1
                elif b == '*':
                    pair = 9 if a == '1' else 6 if a == '2' else 0
                else:
                    pair = int(10 <= int(a+b) <= 26)
                ways += pair * dp[-2]
            dp.append(ways % 1000000007)
        return dp[-1]
`,'dp[i] đếm cách giải mã tiền tố. Ký tự * có 9 cách đứng một mình; mỗi cặp có 0–15 cách hợp lệ.','O(n)','O(n)',{focus:['s','dp','single','pair','ways']});
add(640,'Solve the Equation','string',['x+5-3+x=6+x-2'],'x=2',`
class Solution:
    def solveEquation(self, equation):
        import re
        def parse(text):
            coefficient, constant = 0, 0
            for term in re.findall('[+-]?[^+-]+', text):
                if term.endswith('x'):
                    number = term[:-1]
                    coefficient += -1 if number == '-' else 1 if number in ('','+') else int(number)
                else:
                    constant += int(term)
            return coefficient, constant
        a, b = parse(equation.split('=')[0])
        c, d = parse(equation.split('=')[1])
        coefficient, constant = a-c, d-b
        if coefficient == 0:
            return 'Infinite solutions' if constant == 0 else 'No solution'
        return 'x=' + str(constant // coefficient)
`,'Gộp hệ số x và hằng số mỗi vế; chuyển về (a−c)x = d−b.','O(n)','O(n)');
add(644,'Maximum Average Subarray II','search',[[1,12,-5,-6,50,3],4],12.75,`
class Solution:
    def findMaxAverage(self, nums, k):
        low, high = min(nums), max(nums)
        for iteration in range(45):
            mid = (low+high)/2
            prefix = [0]
            for value in nums:
                prefix.append(prefix[-1] + value-mid)
            minimum, feasible = 0, False
            for end in range(k, len(nums)+1):
                minimum = min(minimum, prefix[end-k])
                if prefix[end] >= minimum:
                    feasible = True
            if feasible:
                low = mid
            else:
                high = mid
        return low
`,'Thử mức trung bình mid: trừ mid khỏi từng số, rồi tìm đoạn dài ≥k có tổng không âm.','O(n log(1/ε))','O(n)',{focus:['nums','prefix','low','high','mid','feasible']});
add(645,'Set Mismatch','array',[[1,2,2,4]],[2,3],`
class Solution:
    def findErrorNums(self, nums):
        seen, duplicate = set(), None
        for value in nums:
            if value in seen:
                duplicate = value
            seen.add(value)
        missing = sum(range(1,len(nums)+1)) - sum(seen)
        return [duplicate, missing]
`,'Tập seen phát hiện số lặp; tổng 1..n trừ tổng các số khác nhau cho ra số thiếu.','O(n)','O(n)',{difficulty:'easy'});
add(647,'Palindromic Substrings','string',['aaa'],6,`
class Solution:
    def countSubstrings(self, s):
        answer = 0
        for center in range(len(s)):
            for left, right in ((center,center),(center,center+1)):
                while left >= 0 and right < len(s) and s[left] == s[right]:
                    answer += 1
                    left -= 1
                    right += 1
        return answer
`,'Thử tâm lẻ và chẵn. Mỗi lần hai đầu khớp là thêm đúng một chuỗi con đối xứng.','O(n²)','O(1)',{focus:['s','left','right','answer']});
add(649,'Dota2 Senate','greedy',['RDD'],'Dire',`
class Solution:
    def predictPartyVictory(self, senate):
        from collections import deque
        radiant = deque(i for i,ch in enumerate(senate) if ch == 'R')
        dire = deque(i for i,ch in enumerate(senate) if ch == 'D')
        while radiant and dire:
            r, d = radiant.popleft(), dire.popleft()
            if r < d:
                radiant.append(r+len(senate))
            else:
                dire.append(d+len(senate))
        return 'Radiant' if radiant else 'Dire'
`,'Người có lượt sớm hơn cấm đối thủ; người sống sót xếp lại ở cuối vòng sau.','O(n)','O(n)');
add(650,'2 Keys Keyboard','math',[9],6,`
class Solution:
    def minSteps(self, n):
        assert 1 <= n <= 10000
        remaining, factor, answer = n, 2, 0
        while factor*factor <= remaining:
            while remaining % factor == 0:
                answer += factor
                remaining //= factor
            factor += 1
        if remaining > 1:
            answer += remaining
        return answer
`,'Mỗi thừa số p tương ứng Copy All một lần và Paste p−1 lần; cộng các thừa số nguyên tố.','O(√n)','O(1)');
add(651,'4 Keys Keyboard','dp',[7],9,`
class Solution:
    def maxA(self, n):
        assert 0 <= n <= 50
        dp = list(range(n+1))
        for presses in range(1,n+1):
            for stop in range(1,presses-2):
                copies = presses-stop-1
                dp[presses] = max(dp[presses], dp[stop]*copies)
        return dp[n]
`,'So gõ A trực tiếp với dừng ở stop, chọn tất cả, copy rồi paste nhiều lần.','O(n²)','O(n)');
add(652,'Find Duplicate Subtrees','tree',[[1,2,3,4,null,2,4,null,null,4]],[[4],[2,4]],`
class Solution:
    def findDuplicateSubtrees(self, root):
        counts, answer = {}, []
        def visit(node):
            if not node:
                return None
            signature = (node.val, visit(node.left), visit(node.right))
            counts[signature] = counts.get(signature,0) + 1
            if counts[signature] == 2:
                answer.append(_tree_values(node))
            return signature
        visit(root)
        return answer
`,'Mã cây con bằng (giá trị, mã trái, mã phải). Khi cùng mã xuất hiện lần thứ hai, lưu một cây đại diện. Kết quả hiển thị dạng level-order.','O(n²)','O(n²)',{kinds:['tree']});
add(655,'Print Binary Tree','tree',[[1,2]],[['','1',''],['2','','']],`
class Solution:
    def printTree(self, root):
        def height(node):
            return 0 if not node else 1+max(height(node.left),height(node.right))
        rows = height(root)
        assert rows <= 6
        answer = [[''] * (2**rows-1) for _ in range(rows)]
        def place(node, r, left, right):
            if node:
                mid = (left+right)//2
                answer[r][mid] = str(node.val)
                place(node.left,r+1,left,mid-1)
                place(node.right,r+1,mid+1,right)
        place(root,0,0,2**rows-2)
        return answer
`,'Node đặt giữa khoảng cột của nó; chia đôi khoảng cho cây trái và cây phải.','O(h·2^h)','O(h·2^h)',{kinds:['tree'],focus:['answer']});
add(656,'Coin Path','dp',[[1,2,4,-1,2],2],[1,3,5],`
class Solution:
    def cheapestJump(self, coins, maxJump):
        n = len(coins)
        if not n or coins[0] < 0 or coins[-1] < 0:
            return []
        cost, paths = [float('inf')]*n, [[] for _ in coins]
        cost[-1], paths[-1] = coins[-1], [n]
        for i in range(n-2,-1,-1):
            if coins[i] < 0:
                continue
            for j in range(i+1,min(n,i+maxJump+1)):
                candidate = coins[i]+cost[j]
                if paths[j] and candidate < cost[i]:
                    cost[i], paths[i] = candidate, [i+1]+paths[j]
        return paths[0]
`,'Tính từ đích về đầu. Chọn chi phí thấp nhất; duyệt điểm nhảy tăng dần để giữ đường đi nhỏ nhất theo thứ tự từ điển khi bằng giá.','O(nB+n²)','O(n²)',{focus:['coins','cost','paths']});
add(657,'Robot Return to Origin','array',['UD'],true,`
class Solution:
    def judgeCircle(self, moves):
        x, y = 0, 0
        for move in moves:
            x += (move == 'R') - (move == 'L')
            y += (move == 'U') - (move == 'D')
        return x == 0 and y == 0
`,'Cập nhật tọa độ sau từng lệnh; kết thúc ở (0,0) thì trở về gốc.','O(n)','O(1)',{difficulty:'easy'});
add(658,'Find K Closest Elements','search',[[1,2,3,4,5],4,3],[1,2,3,4],`
class Solution:
    def findClosestElements(self, arr, k, x):
        left, right = 0, len(arr)-k
        while left < right:
            mid = (left+right)//2
            if x-arr[mid] > arr[mid+k]-x:
                left = mid+1
            else:
                right = mid
        return arr[left:left+k]
`,'Tìm nhị phân vị trí bắt đầu đoạn k phần tử; so khoảng cách hai đầu có thể bị loại.','O(log(n−k)+k)','O(k)');
add(659,'Split Array into Consecutive Subsequences','greedy',[[1,2,3,3,4,5]],true,`
class Solution:
    def isPossible(self, nums):
        from collections import Counter
        remaining, tails = Counter(nums), Counter()
        for value in nums:
            if remaining[value] == 0:
                continue
            remaining[value] -= 1
            if tails[value-1]:
                tails[value-1] -= 1
                tails[value] += 1
            elif remaining[value+1] and remaining[value+2]:
                remaining[value+1] -= 1
                remaining[value+2] -= 1
                tails[value+2] += 1
            else:
                return False
        return True
`,'Ưu tiên nối vào dãy cũ; nếu không có, bắt đầu dãy mới dài ít nhất 3 bằng hai số kế tiếp.','O(n)','O(n)');
add(660,'Remove 9','math',[9],10,`
class Solution:
    def newInteger(self, n):
        digits = []
        while n:
            n, remainder = divmod(n,9)
            digits.append(str(remainder))
        return int(''.join(digits[::-1]) or '0')
`,'Viết n trong hệ cơ số 9; các chữ số 0..8 chính là thứ tự các số không chứa 9.','O(log n)','O(log n)');
add(661,'Image Smoother','array',[[[1,1,1],[1,0,1],[1,1,1]]],[[0,0,0],[0,0,0],[0,0,0]],`
class Solution:
    def imageSmoother(self, img):
        m, n = len(img), len(img[0])
        answer = [[0]*n for _ in img]
        for r in range(m):
            for c in range(n):
                values = [img[i][j] for i in range(max(0,r-1),min(m,r+2)) for j in range(max(0,c-1),min(n,c+2))]
                answer[r][c] = sum(values)//len(values)
        return answer
`,'Mỗi ô nhận trung bình làm tròn xuống của vùng 3×3 hợp lệ quanh nó; luôn đọc ảnh gốc.','O(mn)','O(mn)',{difficulty:'easy',focus:['img','answer','values']});
add(663,'Equal Tree Partition','tree',[[5,10,10,null,null,2,3]],true,`
class Solution:
    def checkEqualTree(self, root):
        sums = []
        def visit(node):
            if not node:
                return 0
            total = node.val+visit(node.left)+visit(node.right)
            sums.append(total)
            return total
        total = visit(root)
        return total % 2 == 0 and total//2 in sums[:-1]
`,'Cắt một cạnh được hai phần bằng nhau khi một cây con có tổng bằng nửa tổng cây. Bỏ tổng của cả cây.','O(n)','O(n)',{kinds:['tree']});
add(665,'Non-decreasing Array','array',[[4,2,3]],true,`
class Solution:
    def checkPossibility(self, nums):
        values, changes = nums[:], 0
        for i in range(1,len(values)):
            if values[i] < values[i-1]:
                changes += 1
                if changes > 1:
                    return False
                if i < 2 or values[i] >= values[i-2]:
                    values[i-1] = values[i]
                else:
                    values[i] = values[i-1]
        return True
`,'Gặp cặp giảm: hạ số trước nếu không phá cặp bên trái; nếu không thì nâng số hiện tại. Chỉ được sửa một lần.','O(n)','O(n)',{focus:['values','changes']});
add(666,'Path Sum IV','tree',[[113,215,221]],12,`
class Solution:
    def pathSum(self, nums):
        values = {number//10: number%10 for number in nums}
        def visit(key, prefix):
            if key not in values:
                return 0
            depth, position = divmod(key,10)
            total = prefix+values[key]
            left, right = (depth+1)*10+2*position-1, (depth+1)*10+2*position
            if left not in values and right not in values:
                return total
            return visit(left,total)+visit(right,total)
        return visit(11,0)
`,'Hai chữ số đầu là tầng/vị trí; số cuối là giá trị. Truyền tổng từ gốc và cộng chỉ ở lá.','O(n)','O(n)');
add(667,'Beautiful Arrangement II','array',[7,4],[1,5,2,4,3,6,7],`
class Solution:
    def constructArray(self, n, k):
        assert 1 <= k < n <= 80
        answer, left, right = [], 1, k+1
        while left <= right:
            answer.append(left)
            left += 1
            if left <= right:
                answer.append(right)
                right -= 1
        answer.extend(range(k+2,n+1))
        return answer
`,'Đan xen thấp–cao trong 1..k+1 để tạo chênh lệch k,k−1,...,1; nối phần còn lại tăng dần.','O(n)','O(n)');
add(669,'Trim a Binary Search Tree','tree',[[3,0,4,null,2,null,null,1],1,3],[3,2,null,1],`
class Solution:
    def trimBST(self, root, low, high):
        def trim(node):
            if not node:
                return None
            if node.val < low:
                return trim(node.right)
            if node.val > high:
                return trim(node.left)
            node.left, node.right = trim(node.left), trim(node.right)
            return node
        return trim(root)
`,'BST quá nhỏ thì bỏ cả nhánh trái; quá lớn thì bỏ cả nhánh phải. Node hợp lệ giữ lại và cắt tiếp hai con.','O(n)','O(h)',{kinds:['tree'],answerKind:'tree'});
add(670,'Maximum Swap','greedy',[2736],7236,`
class Solution:
    def maximumSwap(self, num):
        digits = list(str(num))
        last = {int(ch): i for i,ch in enumerate(digits)}
        for i, ch in enumerate(digits):
            for digit in range(9,int(ch),-1):
                if last.get(digit,-1) > i:
                    j = last[digit]
                    digits[i], digits[j] = digits[j], digits[i]
                    return int(''.join(digits))
        return num
`,'Từ trái sang phải, đổi với chữ số lớn nhất nằm bên phải; chọn lần xuất hiện cuối để tối đa phần đuôi.','O(d)','O(d)');
add(672,'Bulb Switcher II','bits',[3,1],4,`
class Solution:
    def flipLights(self, n, presses):
        states = set()
        for mask in range(16):
            used = mask.bit_count()
            if used > presses or (presses-used) % 2:
                continue
            bulbs = []
            for i in range(1,min(n,6)+1):
                toggles = [True, i%2 == 0, i%2 == 1, i%3 == 1]
                bulbs.append(1 ^ (sum(toggles[b] for b in range(4) if mask >> b & 1) % 2))
            states.add(tuple(bulbs))
        return len(states)
`,'Mỗi nút chỉ cần biết bấm lẻ hay chẵn; thử 16 mặt nạ và loại số lần bấm không phù hợp.','O(1)','O(1)',{focus:['bulbs','states','mask','used']});
add(679,'24 Game','backtracking',[[4,1,8,7]],true,`
class Solution:
    def judgePoint24(self, cards):
        from fractions import Fraction
        def solve(values):
            if len(values) == 1:
                return values[0] == 24
            for i in range(len(values)):
                for j in range(i):
                    a, b = values[i], values[j]
                    rest = [v for k,v in enumerate(values) if k not in (i,j)]
                    candidates = {a+b,a-b,b-a,a*b}
                    if a:
                        candidates.add(b/a)
                    if b:
                        candidates.add(a/b)
                    for result in sorted(candidates):
                        if solve(rest+[result]):
                            return True
            return False
        assert len(cards) == 4
        return solve([Fraction(v) for v in cards])
`,'Chọn hai số, thay bằng kết quả một phép toán rồi đệ quy. Dùng phân số để kiểm tra 24 chính xác.','O(1) với 4 lá bài','O(1)',{traceOptions:{maxEvents:20000}});
add(681,'Next Closest Time','string',['19:34'],'19:39',`
class Solution:
    def nextClosestTime(self, time):
        allowed = set(time.replace(':',''))
        start = int(time[:2])*60+int(time[3:])
        for elapsed in range(1,1441):
            minute = (start+elapsed)%1440
            candidate = f'{minute//60:02d}:{minute%60:02d}'
            if set(candidate.replace(':','')) <= allowed:
                return candidate
`,'Tiến từng phút, kể cả qua nửa đêm; dừng ở giờ đầu tiên chỉ dùng các chữ số ban đầu.','O(1440)','O(1)',{traceOptions:{maxEvents:12000}});
add(682,'Baseball Game','array',[['5','2','C','D','+']],30,`
class Solution:
    def calPoints(self, operations):
        stack = []
        for operation in operations:
            if operation == 'C':
                stack.pop()
            elif operation == 'D':
                stack.append(2*stack[-1])
            elif operation == '+':
                stack.append(stack[-1]+stack[-2])
            else:
                stack.append(int(operation))
        return sum(stack)
`,'Stack lưu các lượt hợp lệ: C xóa, D nhân đôi, + cộng hai lượt cuối.','O(n)','O(n)',{difficulty:'easy',focus:['operations','stack']});
add(683,'K Empty Slots','array',[[1,3,2],1],2,`
class Solution:
    def kEmptySlots(self, bulbs, k):
        import bisect
        active = []
        for day, bulb in enumerate(bulbs,1):
            i = bisect.bisect_left(active,bulb)
            if i and bulb-active[i-1] == k+1:
                return day
            if i < len(active) and active[i]-bulb == k+1:
                return day
            active.insert(i,bulb)
        return -1
`,'Giữ vị trí hoa đã nở theo thứ tự; chỉ xét hai hàng xóm của hoa vừa nở. Khoảng cách k+1 nghĩa là có k ô chưa nở ở giữa.','O(n²)','O(n)');
add(686,'Repeated String Match','string',['abcd','cdabcdab'],3,`
class Solution:
    def repeatedStringMatch(self, a, b):
        repeats = (len(b)+len(a)-1)//len(a)
        for count in (repeats,repeats+1):
            repeated = a*count
            if b in repeated:
                return count
        return -1
`,'Thử số lần lặp vừa đủ dài, rồi thêm một lần để chứa trường hợp b vắt qua biên.','O((|a|+|b|)·|b|)','O(|a|+|b|)');
add(691,'Stickers to Spell Word','dp',[[ 'with','example','science'],'thehat'],3,`
class Solution:
    def minStickers(self, stickers, target):
        from collections import Counter
        from functools import lru_cache
        counts = [Counter(s) for s in stickers]
        @lru_cache(None)
        def solve(remaining):
            if not remaining:
                return 0
            needed, best = Counter(remaining), float('inf')
            for sticker in counts:
                if not sticker[remaining[0]]:
                    continue
                rest = ''.join(ch*max(0,n-sticker[ch]) for ch,n in sorted(needed.items()))
                best = min(best,1+solve(rest))
            return best
        answer = solve(''.join(sorted(target)))
        return -1 if answer == float('inf') else answer
`,'Trạng thái là các chữ còn thiếu đã sắp xếp; thử nhãn chứa chữ đầu tiên còn thiếu rồi ghi nhớ số nhãn ít nhất.','O(2^t·s·t)','O(2^t·t)',{traceOptions:{maxEvents:16000}});
add(696,'Count Binary Substrings','string',['00110011'],6,`
class Solution:
    def countBinarySubstrings(self, s):
        previous, current, answer = 0, 0, 0
        for i, ch in enumerate(s):
            if i and s[i-1] != ch:
                answer += min(previous,current)
                previous, current = current, 0
            current += 1
        return answer+min(previous,current)
`,'Gom từng dãy cùng bit; hai dãy kề độ dài a,b tạo min(a,b) chuỗi con hợp lệ.','O(n)','O(1)',{difficulty:'easy'});
add(697,'Degree of an Array','array',[[1,2,2,3,1]],2,`
class Solution:
    def findShortestSubArray(self, nums):
        first, last, counts = {}, {}, {}
        for i, value in enumerate(nums):
            first.setdefault(value,i)
            last[value] = i
            counts[value] = counts.get(value,0)+1
        degree = max(counts.values())
        return min(last[v]-first[v]+1 for v in counts if counts[v] == degree)
`,'Bậc là tần suất lớn nhất. Với mỗi số đạt bậc, đo đoạn từ lần xuất hiện đầu đến cuối rồi lấy ngắn nhất.','O(n)','O(n)',{difficulty:'easy'});
module.exports=lessons;
