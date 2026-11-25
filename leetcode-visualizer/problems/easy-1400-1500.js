"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1400,'Construct K Palindrome Strings','string',['annabelle',2],true,`
class Solution:
    def canConstruct(self, s, k):
        from collections import Counter
        counts = Counter(s)
        odd = sum(count%2 for count in counts.values())
        return odd <= k <= len(s)
`,'Mỗi chữ có tần suất lẻ cần tâm của một palindrome riêng. Số chuỗi k phải ít nhất bằng số tần suất lẻ và không vượt số ký tự.','O(n)','O(alphabet)');
add(1402,'Reducing Dishes','greedy',[[-1,-8,0,5,-9]],14,`
class Solution:
    def maxSatisfaction(self, satisfaction):
        ordered = sorted(satisfaction,reverse=True)
        prefix,answer = 0,0
        for value in ordered:
            if prefix+value <= 0:
                break
            prefix += value
            answer += prefix
        return answer
`,'Xếp món tốt nhất về cuối. Thêm một món vào đầu làm tổng điểm tăng đúng tổng satisfaction của nhóm đã chọn; chỉ thêm khi phần tăng còn dương.','O(n log n)','O(n)',{difficulty:'hard'});
add(1403,'Minimum Subsequence in Non-Increasing Order','greedy',[[4,3,10,9,8]],[10,9],`
class Solution:
    def minSubsequence(self, nums):
        total,selected,answer = sum(nums),0,[]
        for value in sorted(nums,reverse=True):
            answer.append(value)
            selected += value
            if selected > total-selected:
                break
        return answer
`,'Để chọn ít phần tử nhất mà tổng vượt phần còn lại, lấy số lớn nhất trước. Kết quả đã có thứ tự không tăng.','O(n log n)','O(n)',{difficulty:'easy'});
add(1405,'Longest Happy String','greedy',[1,1,7],'ccaccbcc',`
class Solution:
    def longestDiverseString(self, a, b, c):
        import heapq
        assert min(a,b,c) >= 0 and a+b+c <= 80
        heap = [(-count,ch) for count,ch in [(a,'a'),(b,'b'),(c,'c')] if count]
        heapq.heapify(heap)
        answer = ''
        while heap:
            count,ch = heapq.heappop(heap)
            if answer.endswith(ch*2):
                if not heap:
                    break
                otherCount,other = heapq.heappop(heap)
                answer += other
                if otherCount+1:
                    heapq.heappush(heap,(otherCount+1,other))
                heapq.heappush(heap,(count,ch))
            else:
                answer += ch
                if count+1:
                    heapq.heappush(heap,(count+1,ch))
        return answer
`,'Ưu tiên chữ còn nhiều nhất trong heap. Nếu nó tạo bộ ba giống nhau thì dùng chữ nhiều thứ nhì; không còn chữ thay thế thì dừng.','O(a+b+c)','O(a+b+c)',{focus:['heap','answer','ch']});
add(1407,'Top Travellers','sql',[[{id:1,name:'Alice'},{id:2,name:'Bob'},{id:3,name:'Alex'}],[{user_id:1,distance:100},{user_id:2,distance:200},{user_id:1,distance:100}]],[{name:'Alice',travelled_distance:200},{name:'Bob',travelled_distance:200},{name:'Alex',travelled_distance:0}],`
class Solution:
    def travellers(self, users, rides):
        totals = {u['id']:0 for u in users}
        for row in rides:
            totals[row['user_id']] += row['distance']
        ordered = sorted(users,key=lambda u:(-totals[u['id']],u['name']))
        return [{'name':u['name'],'travelled_distance':totals[u['id']]} for u in ordered]
`,'Cộng khoảng cách riêng theo user id, giữ cả người chưa đi với tổng 0. Xếp tổng giảm, hòa thì tên tăng theo từ điển.','O(users log users+rides)','O(users)',{difficulty:'easy'});
add(1408,'String Matching in an Array','string',[[ 'mass','as','hero','superhero']],['as','hero'],`
class Solution:
    def stringMatching(self, words):
        answer = []
        for i,word in enumerate(words):
            if any(i != j and word in other for j,other in enumerate(words)):
                answer.append(word)
        return answer
`,'Mỗi từ kiểm tra có là đoạn liên tiếp của một từ khác vị trí hay không; tìm thấy thì chỉ lưu một lần.','O(n²L²)','O(n)',{difficulty:'easy'});
add(1410,'HTML Entity Parser','string',['&amp; is an HTML entity but &ambassador; is not.'],'& is an HTML entity but &ambassador; is not.',`
class Solution:
    def entityParser(self, text):
        entities = {'&quot;':chr(34),'&apos;':chr(39),'&amp;':'&','&gt;':'>','&lt;':'<','&frasl;':'/'}
        cursor,answer = 0,''
        while cursor < len(text):
            matched = False
            for entity,replacement in entities.items():
                if text.startswith(entity,cursor):
                    answer += replacement
                    cursor += len(entity)
                    matched = True
                    break
            if not matched:
                answer += text[cursor]
                cursor += 1
        return answer
`,'Đọc nguồn đúng một lượt, chỉ thay sáu entity được định nghĩa. Không giải mã lại phần vừa sinh, nên &amp;gt; phải thành &gt;, không thành dấu >.','O(n)','O(n)',{focus:['text','answer','cursor','entity']});
add(1412,'Find the Quiet Students in All Exams','sql',[[{student_id:1,student_name:'Alice'},{student_id:2,student_name:'Bob'},{student_id:3,student_name:'Charlie'}],[{exam_id:1,student_id:1,score:70},{exam_id:1,student_id:2,score:80},{exam_id:1,student_id:3,score:90}]],[{student_id:2,student_name:'Bob'}],`
class Solution:
    def quietStudents(self, students, exams):
        groups,participated,extreme = {},set(),set()
        for row in exams:
            groups.setdefault(row['exam_id'],[]).append(row)
            participated.add(row['student_id'])
        for rows in groups.values():
            low,high = min(r['score'] for r in rows),max(r['score'] for r in rows)
            extreme.update(r['student_id'] for r in rows if r['score'] in (low,high))
        return [s for s in sorted(students,key=lambda r:r['student_id']) if s['student_id'] in participated-extreme]
`,'Quiet phải từng dự thi nhưng chưa bao giờ đạt điểm cao nhất hoặc thấp nhất trong bất kỳ kỳ thi nào, kể cả đồng hạng cực trị.','O(students log students+exams)','O(students+exams)',{difficulty:'hard'});
add(1413,'Minimum Value to Get Positive Step by Step Sum','array',[[-3,2,-3,4,2]],5,`
class Solution:
    def minStartValue(self, nums):
        prefix,lowest = 0,0
        for value in nums:
            prefix += value
            lowest = min(lowest,prefix)
        return 1-lowest
`,'Tìm tổng tiền tố nhỏ nhất kể cả 0 ban đầu. Giá trị bắt đầu phải nâng điểm thấp nhất đó lên đúng 1.','O(n)','O(1)',{difficulty:'easy'});
add(1414,'Find the Minimum Number of Fibonacci Numbers Whose Sum Is K','greedy',[19],3,`
class Solution:
    def findMinFibonacciNumbers(self, k):
        fibonacci = [1,1]
        while fibonacci[-1] < k:
            fibonacci.append(fibonacci[-1]+fibonacci[-2])
        answer = 0
        for value in reversed(fibonacci):
            if value <= k:
                k -= value
                answer += 1
        return answer
`,'Sinh các số Fibonacci tới k rồi luôn lấy số lớn nhất không vượt phần còn thiếu; tiếp tục tới khi phần dư bằng 0.','O(log k)','O(log k)');
add(1415,'The k-th Lexicographical String of All Happy Strings of Length n','string',[3,9],'cab',`
class Solution:
    def getHappyString(self, n, k):
        assert 1 <= n <= 20 and k >= 1
        if k > 3*2**(n-1):
            return ''
        answer = ''
        for i in range(n):
            block = 2**(n-i-1)
            for ch in 'abc':
                if answer and answer[-1] == ch:
                    continue
                if k > block:
                    k -= block
                else:
                    answer += ch
                    break
        return answer
`,'Chọn từng chữ theo a,b,c, bỏ chữ bằng chữ trước. Mỗi lựa chọn mở một khối 2^số_chỗ_còn_lại chuỗi; trừ cả khối nếu k nằm sau nó.','O(n)','O(n)');
add(1417,'Reformat The String','string',['a0b1c2'],'0a1b2c',`
class Solution:
    def reformat(self, s):
        digits = [ch for ch in s if ch.isdigit()]
        letters = [ch for ch in s if ch.isalpha()]
        if abs(len(digits)-len(letters)) > 1:
            return ''
        if len(letters) > len(digits):
            digits,letters = letters,digits
        answer = ''
        for i,ch in enumerate(digits):
            answer += ch
            if i < len(letters):
                answer += letters[i]
        return answer
`,'Tách chữ và số; muốn xen kẽ thì số lượng hai nhóm chênh tối đa 1. Bắt đầu bằng nhóm dài hơn rồi lấy luân phiên.','O(n)','O(n)',{difficulty:'easy'});
add(1418,'Display Table of Food Orders in a Restaurant','sql',[[['Alice','10','A'],['Bob','2','A'],['Bob','2','B']]],[['Table','A','B'],['2','1','1'],['10','1','0']],`
class Solution:
    def displayTable(self, orders):
        from collections import Counter
        foods = sorted({row[2] for row in orders})
        tables = sorted({int(row[1]) for row in orders})
        counts = Counter((int(table),food) for customer,table,food in orders)
        answer = [['Table']+foods]
        for table in tables:
            answer.append([str(table)]+[str(counts[table,food]) for food in foods])
        return answer
`,'Món ăn xếp theo chữ cái, bàn xếp theo số chứ không theo chuỗi. Mỗi ô đếm số đơn của một món tại một bàn và dùng 0 nếu không có.','O(orders+tables·foods)','O(tables·foods)',{diagram:'table',focus:['foods','tables','counts','answer']});
add(1419,'Minimum Number of Frogs Croaking','string',['crcoakroak'],2,`
class Solution:
    def minNumberOfFrogs(self, croakOfFrogs):
        counts,active,best = [0]*4,0,0
        for ch in croakOfFrogs:
            stage = 'croak'.index(ch)
            if stage == 0:
                counts[0] += 1
                active += 1
                best = max(best,active)
            else:
                if counts[stage-1] == 0:
                    return -1
                counts[stage-1] -= 1
                if stage == 4:
                    active -= 1
                else:
                    counts[stage] += 1
        return best if active == 0 else -1
`,'Mỗi tiếng c mở một con đang kêu; r,o,a,k phải tiếp nối một con đang chờ đúng giai đoạn. k cho con đó nghỉ và tái sử dụng; đỉnh số con đang kêu là đáp án.','O(n)','O(5)',{focus:['croakOfFrogs','counts','active','best','stage']});
add(1420,'Build Array Where You Can Find The Maximum Exactly K Comparisons','dp',[2,3,1],6,`
class Solution:
    def numOfArrays(self, n, m, k):
        assert 1 <= n <= 15 and 1 <= m <= 15 and 0 <= k <= n
        if k == 0 or k > m:
            return 0
        mod = 1000000007
        dp = [[0]*(m+1) for _ in range(k+1)]
        dp[1] = [0]+[1]*m
        for length in range(2,n+1):
            following = [[0]*(m+1) for _ in range(k+1)]
            for cost in range(1,k+1):
                prefix = 0
                for maximum in range(1,m+1):
                    following[cost][maximum] = (dp[cost][maximum]*maximum+prefix)%mod
                    prefix = (prefix+dp[cost-1][maximum])%mod
            dp = following
        return sum(dp[k])%mod
`,'dp[cost][max] đếm mảng có đúng cost lần lập kỷ lục lớn nhất. Số mới ≤max có max lựa chọn; số mới lập kỷ lục dùng tổng các trạng thái max cũ nhỏ hơn.','O(nkm)','O(km)',{difficulty:'hard',focus:['dp','following','length','cost','maximum','prefix'],traceOptions:{maxEvents:30000}});
add(1421,'NPV Queries','sql',[[{id:1,year:2018,npv:100},{id:2,year:2020,npv:50}],[{id:1,year:2018},{id:1,year:2020}]],[{id:1,year:2018,npv:100},{id:1,year:2020,npv:0}],`
class Solution:
    def npvQueries(self, npv, queries):
        lookup = {(r['id'],r['year']):r['npv'] for r in npv}
        return [dict(q,npv=lookup.get((q['id'],q['year']),0)) for q in queries]
`,'Khóa tra cứu gồm cả id và year. Nối trái từ Queries, cặp không có dữ liệu NPV thì thay bằng 0.','O(npv+queries)','O(npv)',{difficulty:'easy'});
add(1422,'Maximum Score After Splitting a String','string',['011101'],5,`
class Solution:
    def maxScore(self, s):
        leftZeros,rightOnes,best = 0,s.count('1'),0
        for ch in s[:-1]:
            leftZeros += ch == '0'
            rightOnes -= ch == '1'
            best = max(best,leftZeros+rightOnes)
        return best
`,'Dời điểm cắt sang phải từng ô; cập nhật số 0 bên trái và số 1 bên phải. Không cắt sau ký tự cuối vì hai phần phải không rỗng.','O(n)','O(1)',{difficulty:'easy'});
add(1424,'Diagonal Traverse II','array',[[[1,2,3],[4,5,6],[7,8,9]]],[1,4,2,7,5,3,8,6,9],`
class Solution:
    def findDiagonalOrder(self, nums):
        groups = {}
        for r,row in enumerate(nums):
            for c,value in enumerate(row):
                groups.setdefault(r+c,[]).append(value)
        answer = []
        for diagonal in sorted(groups):
            answer.extend(groups[diagonal][::-1])
        return answer
`,'Các ô cùng đường chéo có r+c bằng nhau. Duyệt hàng tăng rồi đảo mỗi nhóm để đọc từ dưới trái lên trên phải, kể cả các hàng dài ngắn khác nhau.','O(cells+diagonals log diagonals)','O(cells)');
add(1425,'Constrained Subsequence Sum','dp',[[10,2,-10,5,20],2],37,`
class Solution:
    def constrainedSubsetSum(self, nums, k):
        from collections import deque
        dp,queue = [],deque()
        for i,value in enumerate(nums):
            while queue and queue[0] < i-k:
                queue.popleft()
            previous = max(0,dp[queue[0]]) if queue else 0
            dp.append(value+previous)
            while queue and dp[queue[-1]] <= dp[i]:
                queue.pop()
            queue.append(i)
        return max(dp)
`,'dp[i] nối vào tổng tốt nhất trong k vị trí trước hoặc bắt đầu mới. Deque giữ chỉ số có dp giảm dần để lấy max cửa sổ ở đầu trong O(1).','O(n)','O(n)',{difficulty:'hard',focus:['nums','dp','queue','i','previous']});
add(1426,'Counting Elements','array',[[1,2,3]],2,`
class Solution:
    def countElements(self, arr):
        seen = set(arr)
        answer = 0
        for value in arr:
            if value+1 in seen:
                answer += 1
        return answer
`,'Tập seen chỉ dùng để hỏi value+1 có tồn tại. Vẫn duyệt mảng gốc để tính đủ các bản sao của value.','O(n)','O(n)',{difficulty:'easy'});
add(1427,'Perform String Shifts','string',['abc',[[0,1],[1,2]]],'cab',`
class Solution:
    def stringShift(self, s, shift):
        offset = 0
        for direction,amount in shift:
            offset += amount if direction else -amount
        offset %= len(s)
        return s[-offset:]+s[:-offset] if offset else s
`,'Cộng dịch phải là dương, dịch trái là âm; các lệnh triệt tiêu nhau. Lấy modulo độ dài rồi thực hiện đúng một phép quay.','O(shifts+string length)','O(string length)',{difficulty:'easy'});
add(1428,'Leftmost Column with at Least a One','search',[[[0,0],[1,1]]],0,`
class Solution:
    def leftMostColumnWithOne(self, binaryMatrix):
        rows,cols = len(binaryMatrix),len(binaryMatrix[0])
        calls = []
        def get(r,c):
            calls.append([r,c])
            return binaryMatrix[r][c]
        r,c,answer = 0,cols-1,-1
        while r < rows and c >= 0:
            if get(r,c) == 1:
                answer = c
                c -= 1
            else:
                r += 1
        return answer
`,'Các hàng đã sắp 0 trước 1 sau. Đi từ góc trên phải: gặp 1 sang trái tìm cột nhỏ hơn, gặp 0 xuống hàng tiếp. Chỉ cần rows+cols lần hỏi API.','O(rows+cols)','O(rows+cols) replay call log',{description:'The supplied matrix implements the read-only BinaryMatrix.get API; calls records actual queried cells.',focus:['binaryMatrix','calls','r','c','answer']});
add(1429,'First Unique Number','design',[[2,3,5],[['showFirstUnique'],['add',5],['showFirstUnique'],['add',2],['showFirstUnique'],['add',3],['showFirstUnique']]],[2,null,2,null,3,null,-1],`
class Solution:
    def firstUnique(self, nums, operations):
        from collections import Counter,deque
        counts,queue,answer = Counter(nums),deque(nums),[]
        for operation in operations:
            if operation[0] == 'add':
                value = operation[1]
                counts[value] += 1
                queue.append(value)
                answer.append(None)
            else:
                while queue and counts[queue[0]] > 1:
                    queue.popleft()
                answer.append(queue[0] if queue else -1)
        return answer
`,'Counter biết số nào đã trùng; deque giữ thứ tự xuất hiện. Khi hỏi, bỏ các phần tử trùng ở đầu tới số duy nhất đầu tiên.','O(n+q) amortized','O(n+q)',{focus:['queue','counts','answer']});
add(1430,'Check If a String Is a Valid Sequence from Root to Leaves Path in a Binary Tree','tree',[[0,1,0,0,1,0,null,null,1,0,0],[0,1,0,1]],true,`
class Solution:
    def isValidSequence(self, root, arr):
        def visit(node,index):
            if not node or index >= len(arr) or node.val != arr[index]:
                return False
            if index == len(arr)-1:
                return not node.left and not node.right
            return visit(node.left,index+1) or visit(node.right,index+1)
        return visit(root,0)
`,'Mỗi tầng phải khớp phần tử kế tiếp trong arr. Khớp hết mảng vẫn chưa đủ: node cuối phải là lá, không được dừng giữa đường.','O(nodes)','O(height)',{kinds:['tree']});
add(1431,'Kids With the Greatest Number of Candies','array',[[2,3,5,1,3],3],[true,true,true,false,true],`
class Solution:
    def kidsWithCandies(self, candies, extraCandies):
        greatest = max(candies)
        answer = []
        for count in candies:
            answer.append(count+extraCandies >= greatest)
        return answer
`,'So từng bạn sau khi nhận toàn bộ extraCandies với mức lớn nhất ban đầu. Mỗi bạn được xét độc lập, hòa mức cao nhất vẫn là True.','O(n)','O(n)',{difficulty:'easy'});
add(1432,'Max Difference You Can Get From Changing an Integer','greedy',[555],888,`
class Solution:
    def maxDiff(self, num):
        text = str(num)
        maximum = text
        for ch in text:
            if ch != '9':
                maximum = text.replace(ch,'9')
                break
        minimum = text
        if text[0] != '1':
            minimum = text.replace(text[0],'1')
        else:
            for ch in text[1:]:
                if ch not in '01':
                    minimum = text.replace(ch,'0')
                    break
        return int(maximum)-int(minimum)
`,'Mỗi phép thay đổi tất cả bản sao một chữ số. Muốn max, đổi chữ khác 9 đầu tiên thành 9; muốn min, giảm từ trái nhưng không tạo số 0 đầu.','O(digits)','O(digits)');
add(1433,'Check If a String Can Break Another String','string',['abc','xya'],true,`
class Solution:
    def checkIfCanBreak(self, s1, s2):
        left,right = sorted(s1),sorted(s2)
        first = all(a >= b for a,b in zip(left,right))
        second = all(a <= b for a,b in zip(left,right))
        return first or second
`,'Sắp cả hai chuỗi; một chuỗi break chuỗi kia khi mọi chữ ở cùng thứ hạng đều không nhỏ hơn. Chỉ cần một trong hai chiều đúng.','O(n log n)','O(n)');
add(1434,'Number of Ways to Wear Different Hats to Each Other','dp',[[[3,4],[4,5],[5]]],1,`
class Solution:
    def numberWays(self, hats):
        n = len(hats)
        assert 1 <= n <= 8
        owners = {}
        for person,liked in enumerate(hats):
            for hat in liked:
                owners.setdefault(hat,[]).append(person)
        dp = [0]*(1 << n)
        dp[0] = 1
        for hat,people in sorted(owners.items()):
            following = dp[:]
            for mask,ways in enumerate(dp):
                if ways:
                    for person in people:
                        if not (mask >> person & 1):
                            nextMask = mask | (1 << person)
                            following[nextMask] = (following[nextMask]+ways)%1000000007
            dp = following
        return dp[-1]
`,'Duyệt từng mũ để mỗi mũ dùng nhiều nhất một lần. Mask cho biết những người đã có mũ; có thể bỏ mũ hoặc đưa cho một người thích nó chưa có mũ.','O(hats·people·2^people)','O(2^people)',{difficulty:'hard',focus:['owners','dp','following','mask','person'],traceOptions:{maxEvents:30000}});
add(1435,'Create a Session Bar Chart','sql',[[{session_id:1,duration:30},{session_id:2,duration:300},{session_id:3,duration:600},{session_id:4,duration:900}]],[{bin:'[0-5>',total:1},{bin:'[5-10>',total:1},{bin:'[10-15>',total:1},{bin:'15 or more',total:1}],`
class Solution:
    def sessionBins(self, sessions):
        labels = ['[0-5>','[5-10>','[10-15>','15 or more']
        counts = [0]*4
        for row in sessions:
            index = min(3,row['duration']//300)
            counts[index] += 1
        return [{'bin':label,'total':count} for label,count in zip(labels,counts)]
`,'duration tính bằng giây; mỗi 300 giây là 5 phút. Mốc 5/10/15 phút thuộc nhóm kế tiếp, và cả bốn nhóm phải có mặt kể cả tổng 0.','O(n)','O(4)',{difficulty:'easy'});
add(1436,'Destination City','string',[[['London','New York'],['New York','Lima'],['Lima','Sao Paulo']]],'Sao Paulo',`
class Solution:
    def destCity(self, paths):
        outgoing = {a for a,b in paths}
        for a,b in paths:
            if b not in outgoing:
                return b
`,'Thành phố cuối có đường đi vào nhưng không có đường đi ra. Lập tập các điểm xuất phát rồi tìm đích không nằm trong tập đó.','O(n)','O(n)',{difficulty:'easy'});
add(1437,'Check If All 1s Are at Least Length K Places Away','array',[[1,0,0,0,1,0,0,1],2],true,`
class Solution:
    def kLengthApart(self, nums, k):
        previous = None
        for i,value in enumerate(nums):
            if value:
                if previous is not None and i-previous-1 < k:
                    return False
                previous = i
        return True
`,'Giữa hai số 1 liên tiếp phải có ít nhất k số 0; dùng khoảng cách chỉ số trừ 1 để đếm ô nằm giữa.','O(n)','O(1)',{difficulty:'easy'});
add(1439,'Find the Kth Smallest Sum of a Matrix With Sorted Rows','array',[[[1,3,11],[2,4,6]],5],7,`
class Solution:
    def kthSmallest(self, mat, k):
        import heapq
        assert 1 <= k <= 80
        sums = [0]
        for row in mat:
            heap = [(value+row[0],i,0) for i,value in enumerate(sums)]
            heapq.heapify(heap)
            following = []
            while heap and len(following) < k:
                value,i,j = heapq.heappop(heap)
                following.append(value)
                if j+1 < len(row):
                    heapq.heappush(heap,(sums[i]+row[j+1],i,j+1))
            sums = following
        return sums[k-1]
`,'Thêm từng hàng vào các tổng nhỏ nhất hiện có. Mỗi tổng cũ tạo một dãy tăng khi cộng với hàng mới; dùng heap trộn và chỉ giữ k tổng nhỏ nhất.','O(rows·k log k)','O(k)',{difficulty:'hard',focus:['mat','sums','heap','following'],traceOptions:{maxEvents:20000}});
add(1440,'Evaluate Boolean Expression','sql',[[{name:'x',value:66},{name:'y',value:77}],[{left_operand:'x',operator:'>',right_operand:'y'},{left_operand:'x',operator:'<',right_operand:'y'},{left_operand:'x',operator:'=',right_operand:'x'}]],[{left_operand:'x',operator:'>',right_operand:'y',value:'false'},{left_operand:'x',operator:'<',right_operand:'y',value:'true'},{left_operand:'x',operator:'=',right_operand:'x',value:'true'}],`
class Solution:
    def evaluate(self, variables, expressions):
        values = {r['name']:r['value'] for r in variables}
        answer = []
        for row in expressions:
            left,right = values[row['left_operand']],values[row['right_operand']]
            operator = row['operator']
            result = left < right if operator == '<' else left > right if operator == '>' else left == right
            answer.append(dict(row,value='true' if result else 'false'))
        return answer
`,'Nối tên biến ở cả hai toán hạng với bảng giá trị; áp dụng đúng toán tử <, > hoặc = rồi xuất chuỗi true/false.','O(variables+expressions)','O(variables)');
add(1441,'Build an Array With Stack Operations','array',[[1,3],3],['Push','Push','Pop','Push'],`
class Solution:
    def buildArray(self, target, n):
        answer,index = [],0
        for value in range(1,n+1):
            if index == len(target):
                break
            answer.append('Push')
            if value == target[index]:
                index += 1
            else:
                answer.append('Pop')
        return answer
`,'Dòng số chỉ đọc theo 1..n. Số cần thì Push giữ lại, số không cần thì Push rồi Pop; đủ target thì dừng đọc.','O(last target value)','O(output length)');
add(1442,'Count Triplets That Can Form Two Arrays of Equal XOR','bits',[[2,3,1,6,7]],4,`
class Solution:
    def countTriplets(self, arr):
        counts,positions,prefix,answer = {0:1},{0:0},0,0
        for end,value in enumerate(arr,1):
            prefix ^= value
            answer += counts.get(prefix,0)*(end-1)-positions.get(prefix,0)
            counts[prefix] = counts.get(prefix,0)+1
            positions[prefix] = positions.get(prefix,0)+end
        return answer
`,'Hai nửa có XOR bằng nhau khi XOR cả đoạn bằng 0, tức hai tiền tố bằng nhau. Mỗi đầu trái a đóng góp end−a−1 cách chọn điểm chia; dùng số lượng và tổng chỉ số để cộng nhanh.','O(n)','O(n)',{focus:['arr','counts','positions','prefix','answer']});
add(1443,'Minimum Time to Collect All Apples in a Tree','graph',[7,[[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]],[false,false,true,false,true,true,false]],8,`
class Solution:
    def minTime(self, n, edges, hasApple):
        assert 1 <= n <= 80
        graph = [[] for _ in range(n)]
        for a,b in edges:
            graph[a].append(b)
            graph[b].append(a)
        def visit(node,parent):
            total = 0
            for child in graph[node]:
                if child == parent:
                    continue
                cost = visit(child,node)
                if cost or hasApple[child]:
                    total += cost+2
            return total
        return visit(0,-1)
`,'Cây con không có táo thì bỏ qua hoàn toàn. Cây con có táo cần đi cạnh xuống và quay lại, nên cộng chi phí con +2; gốc không cần thêm cạnh.','O(n)','O(n)',{focus:['graph','hasApple','node','child','cost','total']});
add(1444,'Number of Ways of Cutting a Pizza','dp',[[ 'A..','AAA','...'],3],3,`
class Solution:
    def ways(self, pizza, k):
        from functools import lru_cache
        m,n = len(pizza),len(pizza[0])
        apples = [[0]*(n+1) for _ in range(m+1)]
        for r in range(m-1,-1,-1):
            for c in range(n-1,-1,-1):
                apples[r][c] = (pizza[r][c] == 'A')+apples[r+1][c]+apples[r][c+1]-apples[r+1][c+1]
        @lru_cache(None)
        def solve(r,c,pieces):
            if apples[r][c] < pieces:
                return 0
            if pieces == 1:
                return 1
            total = 0
            for cut in range(r+1,m):
                if apples[r][c] > apples[cut][c]:
                    total += solve(cut,c,pieces-1)
            for cut in range(c+1,n):
                if apples[r][c] > apples[r][cut]:
                    total += solve(r,cut,pieces-1)
            return total%1000000007
        return solve(0,0,k)
`,'Trạng thái là góc trên trái miếng còn lại và số phần cần cắt. Cắt ngang cho phần trên, cắt dọc cho phần trái; phần được cho phải có táo. Tổng hậu tố đếm táo trong O(1).','O(kmn(m+n))','O(kmn)',{difficulty:'hard',focus:['pizza','apples','r','c','pieces','total']});
add(1445,'Apples & Oranges','sql',[[{sale_date:'2020-05-01',fruit:'apples',sold_num:10},{sale_date:'2020-05-01',fruit:'oranges',sold_num:7}]],[{sale_date:'2020-05-01',diff:3}],`
class Solution:
    def differences(self, sales):
        totals = {}
        for row in sales:
            day = row['sale_date']
            signed = row['sold_num'] if row['fruit'] == 'apples' else -row['sold_num']
            totals[day] = totals.get(day,0)+signed
        return [{'sale_date':day,'diff':total} for day,total in sorted(totals.items())]
`,'Theo từng ngày, táo cộng và cam trừ. Tổng có dấu là số táo bán trừ số cam bán, không phải chênh lệch tuyệt đối.','O(n log n)','O(n)');
add(1446,'Consecutive Characters','string',['leetcode'],2,`
class Solution:
    def maxPower(self, s):
        run,best = 0,0
        for i,ch in enumerate(s):
            run = run+1 if i and s[i-1] == ch else 1
            best = max(best,run)
        return best
`,'run là độ dài nhóm chữ giống nhau kết thúc hiện tại; chữ đổi thì run về 1. Giữ run lớn nhất qua cả chuỗi.','O(n)','O(1)',{difficulty:'easy'});
add(1447,'Simplified Fractions','math',[4],['1/2','1/3','2/3','1/4','3/4'],`
class Solution:
    def simplifiedFractions(self, n):
        from math import gcd
        assert 1 <= n <= 30
        answer = []
        for denominator in range(2,n+1):
            for numerator in range(1,denominator):
                if gcd(numerator,denominator) == 1:
                    answer.append(str(numerator)+'/'+str(denominator))
        return answer
`,'Mẫu từ 2 tới n, tử từ 1 tới mẫu−1 để phân số nằm giữa 0 và 1. Chỉ giữ ƯCLN tử/mẫu bằng 1 để không trùng sau rút gọn.','O(n² log n)','O(n²)');
add(1449,'Form Largest Integer With Digits That Add up to Target','dp',[[4,3,2,5,6,7,2,5,5],9],'7772',`
class Solution:
    def largestNumber(self, cost, target):
        assert 1 <= target <= 100 and len(cost) == 9 and min(cost) > 0
        dp = [0]+[-float('inf')]*target
        for amount in range(1,target+1):
            for digit,price in enumerate(cost,1):
                if amount >= price:
                    dp[amount] = max(dp[amount],dp[amount-price]+1)
        if dp[target] < 0:
            return '0'
        answer = ''
        for digit in range(9,0,-1):
            price = cost[digit-1]
            while target >= price and dp[target] == dp[target-price]+1:
                answer += str(digit)
                target -= price
        return answer
`,'Trước hết dp[t] tối đa số chữ số mua được với đúng giá t. Khi dựng số, thử chữ 9 xuống 1 nhưng chỉ chọn nếu vẫn giữ độ dài tối ưu còn lại.','O(9·target)','O(target)',{difficulty:'hard',focus:['cost','dp','target','digit','answer'],traceOptions:{maxEvents:15000}});
add(1450,'Number of Students Doing Homework at a Given Time','array',[[1,2,3],[3,2,7],4],1,`
class Solution:
    def busyStudent(self, startTime, endTime, queryTime):
        answer = 0
        for start,end in zip(startTime,endTime):
            if start <= queryTime <= end:
                answer += 1
        return answer
`,'Khoảng làm bài tính cả thời điểm bắt đầu và kết thúc. Đếm các khoảng chứa queryTime, không cộng độ dài thời gian.','O(n)','O(1)',{difficulty:'easy'});
add(1451,'Rearrange Words in a Sentence','string',['Leetcode is cool'],'Is cool leetcode',`
class Solution:
    def arrangeWords(self, text):
        words = text.lower().split()
        words.sort(key=len)
        sentence = ' '.join(words)
        return sentence[:1].upper()+sentence[1:]
`,'Viết thường trước rồi sắp ổn định theo độ dài, để các từ bằng độ dài giữ thứ tự cũ. Cuối cùng chỉ viết hoa chữ đầu câu mới.','O(words log words+characters)','O(characters)');
add(1452,'People Whose List of Favorite Companies Is Not a Subset of Another List','array',[[['leetcode','google','facebook'],['google','microsoft'],['google','facebook'],['google'],['amazon']]],[0,1,4],`
class Solution:
    def peopleIndexes(self, favoriteCompanies):
        groups = [set(companies) for companies in favoriteCompanies]
        answer = []
        for i,companies in enumerate(groups):
            if not any(i != j and companies <= other for j,other in enumerate(groups)):
                answer.append(i)
        return answer
`,'Biến mỗi danh sách thành tập; giữ chỉ số i khi không có danh sách người khác chứa toàn bộ công ty của i.','O(people²·companies)','O(total companies)');
add(1453,'Maximum Number of Darts Inside of a Circular Dartboard','math',[[[-2,0],[2,0],[0,2],[0,-2]],2],4,`
class Solution:
    def numPoints(self, darts, r):
        import math
        def count(cx,cy):
            return sum((x-cx)**2+(y-cy)**2 <= r*r+1e-7 for x,y in darts)
        best = max(count(x,y) for x,y in darts)
        for i,(x1,y1) in enumerate(darts):
            for x2,y2 in darts[i+1:]:
                dx,dy = x2-x1,y2-y1
                squared = dx*dx+dy*dy
                if squared == 0 or squared > 4*r*r:
                    continue
                distance = math.sqrt(squared)
                offset = math.sqrt(max(0,r*r-squared/4))
                for sign in (-1,1):
                    cx = (x1+x2)/2+sign*(-dy)*offset/distance
                    cy = (y1+y2)/2+sign*dx*offset/distance
                    best = max(best,count(cx,cy))
        return best
`,'Một hình tròn tối ưu có thể dịch tới khi hai điểm nằm trên biên. Với mỗi cặp cách nhau ≤2r, dựng hai tâm có bán kính r và đếm điểm trong/vào biên, có sai số float nhỏ.','O(n³)','O(1)',{difficulty:'hard',focus:['darts','cx','cy','best'],traceOptions:{maxEvents:30000}});
add(1454,'Active Users','sql',[[{id:1,name:'Alice'},{id:2,name:'Bob'}],[{id:1,login_date:'2020-01-01'},{id:1,login_date:'2020-01-02'},{id:1,login_date:'2020-01-03'},{id:1,login_date:'2020-01-04'},{id:1,login_date:'2020-01-05'},{id:2,login_date:'2020-01-01'}]],[{id:1,name:'Alice'}],`
class Solution:
    def activeUsers(self, accounts, logins):
        from datetime import date,timedelta
        groups,active = {},set()
        for row in logins:
            groups.setdefault(row['id'],set()).add(date.fromisoformat(row['login_date']))
        for user,days in groups.items():
            previous,run = None,0
            for day in sorted(days):
                run = run+1 if previous is not None and day == previous+timedelta(days=1) else 1
                if run >= 5:
                    active.add(user)
                previous = day
        return [a for a in sorted(accounts,key=lambda r:r['id']) if a['id'] in active]
`,'Mỗi người lấy ngày login khác nhau rồi đếm chuỗi ngày liên tiếp. Đủ ít nhất 5 ngày thì được chọn; login nhiều lần cùng ngày không kéo dài chuỗi.','O(n log n)','O(n)');
add(1455,'Check If a Word Occurs As a Prefix of Any Word in a Sentence','string',['i love eating burger','burg'],4,`
class Solution:
    def isPrefixOfWord(self, sentence, searchWord):
        words = sentence.split()
        for index,word in enumerate(words,1):
            if word.startswith(searchWord):
                return index
        return -1
`,'Kiểm tra đầu mỗi từ, không phải đoạn giữa từ. Trả chỉ số từ đầu tiên khớp, đánh số từ 1; không có thì −1.','O(sentence length)','O(sentence length)',{difficulty:'easy'});
add(1458,'Max Dot Product of Two Subsequences','dp',[[2,1,-2,5],[3,0,-6]],18,`
class Solution:
    def maxDotProduct(self, nums1, nums2):
        m,n = len(nums1),len(nums2)
        dp = [[-float('inf')]*(n+1) for _ in range(m+1)]
        for i,a in enumerate(nums1):
            for j,b in enumerate(nums2):
                product = a*b
                dp[i+1][j+1] = max(product,product+max(0,dp[i][j]),dp[i][j+1],dp[i+1][j])
        return dp[m][n]
`,'Hai dãy con phải không rỗng và cùng số phần tử. Thử bắt đầu bằng cặp hiện tại, nối vào tích cũ nếu có lợi, hoặc bỏ một đầu; khởi tạo −∞ để không chọn nhầm dãy rỗng khi mọi tích âm.','O(mn)','O(mn)',{difficulty:'hard',focus:['nums1','nums2','dp','product']});
add(1459,'Rectangles Area','sql',[[{id:1,x_value:2,y_value:7},{id:2,x_value:4,y_value:8},{id:3,x_value:2,y_value:10}]],[{p1:2,p2:3,area:4},{p1:1,p2:2,area:2}],`
class Solution:
    def rectangles(self, points):
        answer = []
        points = sorted(points,key=lambda r:r['id'])
        for i,a in enumerate(points):
            for b in points[i+1:]:
                area = abs(a['x_value']-b['x_value'])*abs(a['y_value']-b['y_value'])
                if area:
                    answer.append({'p1':a['id'],'p2':b['id'],'area':area})
        return sorted(answer,key=lambda r:(-r['area'],r['p1'],r['p2']))
`,'Chọn hai điểm làm hai góc đối diện hình chữ nhật song song trục. Loại diện tích 0, tránh cặp đảo bằng p1<p2 và xếp diện tích giảm.','O(n² log n)','O(n²)');
add(1460,'Make Two Arrays Equal by Reversing Subarrays','array',[[1,2,3,4],[2,4,1,3]],true,`
class Solution:
    def canBeEqual(self, target, arr):
        from collections import Counter
        expected,actual = Counter(target),Counter(arr)
        return expected == actual
`,'Đảo đoạn hai phần tử chính là đổi chỗ kề, nên có thể tạo mọi hoán vị. Chỉ cần hai mảng có cùng giá trị và cùng tần suất.','O(n)','O(n)',{difficulty:'easy'});
add(1461,'Check If a String Contains All Binary Codes of Size K','bits',['00110110',2],true,`
class Solution:
    def hasAllCodes(self, s, k):
        if k > len(s) or len(s)-k+1 < 2**k:
            return False
        found = set()
        mask,value = (1 << k)-1,0
        for i,ch in enumerate(s):
            value = ((value << 1)|int(ch))&mask
            if i+1 >= k:
                found.add(value)
        return len(found) == 2**k
`,'Cửa sổ k bit được cập nhật bằng dịch trái, thêm bit và mask cắt bit cũ. Cần thấy đủ 2^k giá trị khác nhau, không cần liệt kê trước mọi mã.','O(n)','O(min(n,2^k))',{focus:['s','found','mask','value']});
add(1465,'Maximum Area of a Piece of Cake After Horizontal and Vertical Cuts','array',[5,4,[1,2,4],[1,3]],4,`
class Solution:
    def maxArea(self, h, w, horizontalCuts, verticalCuts):
        rows,cols = [0]+sorted(horizontalCuts)+[h],[0]+sorted(verticalCuts)+[w]
        height = max(b-a for a,b in zip(rows,rows[1:]))
        width = max(b-a for a,b in zip(cols,cols[1:]))
        return height*width%1000000007
`,'Thêm cả hai biên ngoài vào danh sách đường cắt. Miếng lớn nhất lấy khoảng hở hàng lớn nhất nhân khoảng hở cột lớn nhất.','O(hCuts log hCuts+vCuts log vCuts)','O(hCuts+vCuts)');
add(1467,'Probability of a Two Boxes Having The Same Number of Distinct Balls','dp',[[2,1,1]],2/3,`
class Solution:
    def getProbability(self, balls):
        from math import comb
        total = sum(balls)
        assert total%2 == 0 and total <= 48 and len(balls) <= 8
        half,dp = total//2,{(0,0):1}
        for count in balls:
            following = {}
            for (used,difference),ways in dp.items():
                for chosen in range(count+1):
                    if used+chosen <= half:
                        delta = int(chosen > 0)-int(chosen < count)
                        key = (used+chosen,difference+delta)
                        following[key] = following.get(key,0)+ways*comb(count,chosen)
            dp = following
        return dp.get((half,0),0)/comb(total,half)
`,'Chọn số bóng mỗi màu vào hộp A. Trạng thái giữ số bóng A và chênh lệch số màu A−B; trọng số tổ hợp C(count,chosen) đếm cách chọn các bóng riêng biệt. Chia số cách thuận lợi cho C(total,total/2).','O(colors·balls²·colors·maxCount)','O(balls·colors)',{difficulty:'hard',focus:['balls','dp','following','used','difference','chosen'],traceOptions:{maxEvents:30000}});
add(1468,'Calculate Salaries','sql',[[{company_id:1,employee_id:1,employee_name:'A',salary:500},{company_id:1,employee_id:2,employee_name:'B',salary:1000},{company_id:2,employee_id:3,employee_name:'C',salary:2000}]],[{company_id:1,employee_id:1,employee_name:'A',salary:500},{company_id:1,employee_id:2,employee_name:'B',salary:1000},{company_id:2,employee_id:3,employee_name:'C',salary:1520}],`
class Solution:
    def afterTax(self, salaries):
        from decimal import Decimal,ROUND_HALF_UP
        maximum = {}
        for row in salaries:
            company = row['company_id']
            maximum[company] = max(maximum.get(company,0),row['salary'])
        answer = []
        for row in salaries:
            highest = maximum[row['company_id']]
            tax = 0 if highest <= 1000 else 24 if highest <= 10000 else 49
            salary = int((Decimal(row['salary'])*(100-tax)/100).quantize(Decimal('1'),rounding=ROUND_HALF_UP))
            answer.append(dict(row,salary=salary))
        return answer
`,'Bài toán giả định một mức thuế chung cho cả công ty, xác định bằng lương cao nhất công ty: 0%,24%,49% tại các ngưỡng 1000 và 10000. Tính lương mới rồi làm tròn số nguyên.','O(n)','O(n)');
add(1469,'Find All The Lonely Nodes','tree',[[1,2,3,null,4]],[4],`
class Solution:
    def getLonelyNodes(self, root):
        answer = []
        def visit(node):
            if not node:
                return
            if node.left and not node.right:
                answer.append(node.left.val)
            if node.right and not node.left:
                answer.append(node.right.val)
            visit(node.left)
            visit(node.right)
        visit(root)
        return answer
`,'Node cô đơn là con duy nhất của cha, không phải lá bất kỳ. Tại mỗi cha kiểm tra chỉ có một bên con rồi lưu giá trị người con đó.','O(n)','O(n)',{kinds:['tree'],difficulty:'easy'});
add(1470,'Shuffle the Array','array',[[2,5,1,3,4,7],3],[2,3,5,4,1,7],`
class Solution:
    def shuffle(self, nums, n):
        answer = []
        for i in range(n):
            answer.extend([nums[i],nums[n+i]])
        return answer
`,'Hai nửa lần lượt là x1..xn và y1..yn; lấy xen kẽ phần tử i của nửa đầu với phần tử i của nửa sau.','O(n)','O(n)',{difficulty:'easy'});
add(1471,'The k Strongest Values in an Array','array',[[1,2,3,4,5],2],[5,1],`
class Solution:
    def getStrongest(self, arr, k):
        ordered = sorted(arr)
        median = ordered[(len(arr)-1)//2]
        left,right,answer = 0,len(arr)-1,[]
        for count in range(k):
            if abs(ordered[left]-median) > abs(ordered[right]-median):
                answer.append(ordered[left])
                left += 1
            else:
                answer.append(ordered[right])
                right -= 1
        return answer
`,'Trung vị lấy ở chỉ số (n−1)//2. Số mạnh hơn cách trung vị xa hơn; hòa khoảng cách chọn số lớn hơn, nên chỉ cần so hai đầu sau sắp xếp.','O(n log n)','O(n)');
add(1474,'Delete N Nodes After M Nodes of a Linked List','list',[[1,2,3,4,5,6,7,8,9,10,11,12,13],2,3],[1,2,6,7,11,12],`
class Solution:
    def deleteNodes(self, head, m, n):
        assert m >= 1 and n >= 0
        node = head
        while node:
            for kept in range(m-1):
                if node:
                    node = node.next
            if not node:
                break
            following = node.next
            for removed in range(n):
                if following:
                    following = following.next
            node.next = following
            node = following
        return head
`,'Đi qua m node giữ lại rồi tìm node sau n node cần xóa. Nối next bỏ qua đoạn xóa và tiếp tục cùng quy tắc tới cuối list.','O(nodes)','O(1)',{kinds:['list'],answerKind:'list',difficulty:'easy'});
add(1476,'Subrectangle Queries','design',[[[1,2],[3,4]],[['getValue',0,1],['updateSubrectangle',0,0,1,0,9],['getValue',1,0]]],[2,null,9],`
class Solution:
    def subrectangles(self, rectangle, operations):
        board,answer = [row[:] for row in rectangle],[]
        for operation in operations:
            if operation[0] == 'getValue':
                answer.append(board[operation[1]][operation[2]])
            else:
                _,top,left,bottom,right,value = operation
                for r in range(top,bottom+1):
                    for c in range(left,right+1):
                        board[r][c] = value
                answer.append(None)
        return answer
`,'Update thay mọi ô trong hình chữ nhật tính cả bốn biên; getValue đọc trạng thái hiện tại, bao gồm các lần cập nhật chồng lên nhau trước đó.','O(total updated cells+queries)','O(matrix+output)',{focus:['board','top','left','bottom','right','answer']});
add(1478,'Allocate Mailboxes','dp',[[1,4,8,10,20],3],5,`
class Solution:
    def minDistance(self, houses, k):
        houses = sorted(houses)
        n = len(houses)
        if k >= n:
            return 0
        cost = [[0]*n for _ in houses]
        for left in range(n-1,-1,-1):
            for right in range(left+1,n):
                cost[left][right] = (cost[left+1][right-1] if left+1 <= right-1 else 0)+houses[right]-houses[left]
        dp = [0]+[float('inf')]*n
        for boxes in range(1,k+1):
            following = [float('inf')]*(n+1)
            for end in range(boxes,n+1):
                following[end] = min(dp[start]+cost[start][end-1] for start in range(boxes-1,end))
            dp = following
        return dp[n]
`,'Một hòm thư phục vụ một nhóm nhà liên tiếp và tối ưu ở trung vị. cost[l][r] lưu chi phí nhóm đó; DP chia dãy nhà thành k nhóm không rỗng.','O(kn²)','O(n²)',{difficulty:'hard',focus:['houses','cost','dp','following','boxes'],traceOptions:{maxEvents:30000}});
const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const weekRow=(category,values)=>Object.assign({category},Object.fromEntries(weekdays.map(day=>[day,values[day]||0])));
add(1479,'Sales by Day of the Week','sql',[[{item_id:1,item_category:'Book'},{item_id:2,item_category:'Food'}],[{item_id:1,order_date:'2020-06-01',quantity:2},{item_id:1,order_date:'2020-06-02',quantity:3}]],[weekRow('Book',{Monday:2,Tuesday:3}),weekRow('Food',{})],`
class Solution:
    def weekdaySales(self, items, orders):
        from datetime import date
        days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        category = {r['item_id']:r['item_category'] for r in items}
        totals = {value:[0]*7 for value in category.values()}
        for order in orders:
            weekday = date.fromisoformat(order['order_date']).weekday()
            totals[category[order['item_id']]][weekday] += order['quantity']
        return [dict(category=category,**dict(zip(days,values))) for category,values in sorted(totals.items())]
`,'Nối mỗi mặt hàng với category, chuyển ngày đặt sang thứ trong tuần và cộng quantity. Pivot thành bảy cột Monday..Sunday, ngày không bán có 0.','O(items+orders+categories log categories)','O(items+categories)',{difficulty:'hard'});
add(1481,'Least Number of Unique Integers after K Removals','greedy',[[5,5,4],1],1,`
class Solution:
    def findLeastNumOfUniqueInts(self, arr, k):
        from collections import Counter
        frequencies = sorted(Counter(arr).values())
        remaining = len(frequencies)
        for count in frequencies:
            if count > k:
                break
            k -= count
            remaining -= 1
        return remaining
`,'Muốn giảm số giá trị khác nhau, phải xóa hết mọi bản sao một giá trị. Xóa các nhóm ít bản sao nhất trước; phần lượt xóa lẻ còn lại không giảm thêm unique.','O(n log n)','O(n)');
add(1483,'Kth Ancestor of a Tree Node','tree',[7,[-1,0,0,1,1,2,2],[[3,1],[5,2],[6,3]]],[1,0,-1],`
class Solution:
    def ancestors(self, n, parent, queries):
        assert 1 <= n <= 80 and len(parent) == n
        up = [parent[:]]
        for level in range(1,max(1,n.bit_length())):
            previous = up[-1]
            up.append([previous[p] if p >= 0 else -1 for p in previous])
        answer = []
        for node,k in queries:
            bit = 0
            while k and node >= 0:
                if k & 1:
                    node = up[bit][node] if bit < len(up) else -1
                k >>= 1
                bit += 1
            answer.append(node)
        return answer
`,'up[b][node] là tổ tiên cách 2^b bước. Phân tích k thành các bit, mỗi bit 1 nhảy một đoạn tương ứng; hết tổ tiên thì trả −1.','O(n log n+q log k)','O(n log n)',{difficulty:'hard',focus:['parent','up','node','k','bit','answer']});
add(1484,'Group Sold Products By The Date','sql',[[{sell_date:'2020-05-30',product:'Leetcode'},{sell_date:'2020-05-30',product:'Basketball'},{sell_date:'2020-05-30',product:'Leetcode'}]],[{sell_date:'2020-05-30',num_sold:2,products:'Basketball,Leetcode'}],`
class Solution:
    def soldProducts(self, activities):
        groups = {}
        for row in activities:
            groups.setdefault(row['sell_date'],set()).add(row['product'])
        return [{'sell_date':day,'num_sold':len(products),'products':','.join(sorted(products))} for day,products in sorted(groups.items())]
`,'Mỗi ngày lấy tập sản phẩm khác nhau; num_sold đếm loại sản phẩm, không đếm số dòng. Sắp tên và nối bằng dấu phẩy không có khoảng trắng.','O(n log n)','O(n)',{difficulty:'easy'});
add(1485,'Clone Binary Tree With Random Pointer','tree',[[1,2,3],[2,0,null]],{tree:[1,2,3],random:[2,0,null]},`
class Solution:
    def copyRandomBinaryTree(self, values, randomIndices):
        root = _tree(values)
        nodes = [root]
        for node in nodes:
            if node:
                nodes.extend([node.left,node.right])
        while nodes and nodes[-1] is None:
            nodes.pop()
        assert len(randomIndices) == len(nodes)
        for i,node in enumerate(nodes):
            if node:
                target = randomIndices[i]
                node.random = nodes[target] if target is not None else None
        copies = {}
        def clone(node):
            if not node:
                return None
            if node in copies:
                return copies[node]
            copy = TreeNode(node.val)
            copies[node] = copy
            copy.left = clone(node.left)
            copy.right = clone(node.right)
            copy.random = clone(node.random)
            return copy
        copied = clone(root)
        ordered = [copied]
        for node in ordered:
            if node:
                ordered.extend([node.left,node.right])
        while ordered and ordered[-1] is None:
            ordered.pop()
        indices = {node:i for i,node in enumerate(ordered) if node}
        return {'tree':_tree_values(copied),'random':[indices.get(node.random) if node else None for node in ordered]}
`,'Input randomIndices dùng chỉ số trong cùng dãy level-order. Map node gốc→bản sao được tạo trước khi đệ quy để xử lý cả random trỏ ngược hoặc thành vòng. Mọi cạnh của bản sao phải trỏ sang node bản sao.','O(n)','O(n)',{description:'values gives level-order nodes. randomIndices has the same trimmed length, including null slots, and points to level-order indices or null.',focus:['copies','randomIndices','node','copy']});
add(1486,'XOR Operation in an Array','bits',[5,0],8,`
class Solution:
    def xorOperation(self, n, start):
        assert 0 <= n <= 200
        answer = 0
        for i in range(n):
            value = start+2*i
            answer ^= value
        return answer
`,'Phần tử i được tính từ start+2i; XOR dồn từng phần tử, không cần lưu cả mảng.','O(n)','O(1)',{difficulty:'easy'});
add(1487,'Making File Names Unique','design',[[ 'gta','gta(1)','gta','avalon']],['gta','gta(1)','gta(2)','avalon'],`
class Solution:
    def getFolderNames(self, names):
        nextSuffix,answer = {},[]
        for name in names:
            if name not in nextSuffix:
                nextSuffix[name] = 1
                answer.append(name)
                continue
            suffix = nextSuffix[name]
            while name+'('+str(suffix)+')' in nextSuffix:
                suffix += 1
            chosen = name+'('+str(suffix)+')'
            nextSuffix[name] = suffix+1
            nextSuffix[chosen] = 1
            answer.append(chosen)
        return answer
`,'Nếu tên đã dùng, thử hậu tố (k) nhỏ nhất còn trống. Ghi cả tên mới và điểm bắt đầu tìm tiếp cho tên gốc để không thử lại các hậu tố đã biết.','O(total name construction)','O(total names)',{focus:['names','nextSuffix','chosen','answer']});
add(1488,'Avoid Flood in The City','greedy',[[1,2,0,0,2,1]],[-1,-1,2,1,-1,-1],`
class Solution:
    def avoidFlood(self, rains):
        import bisect
        dryDays,lastRain,answer = [],{},[1]*len(rains)
        for day,lake in enumerate(rains):
            if lake == 0:
                dryDays.append(day)
                continue
            answer[day] = -1
            if lake in lastRain:
                index = bisect.bisect_right(dryDays,lastRain[lake])
                if index == len(dryDays):
                    return []
                chosen = dryDays.pop(index)
                answer[chosen] = lake
            lastRain[lake] = day
        return answer
`,'Lần mưa thứ hai trên một hồ cần một ngày nắng nằm giữa hai lần mưa. Dành ngày nắng sớm nhất còn trống sau lần mưa trước; không có ngày đó thì không thể tránh lũ.','O(n²) with sorted-list deletion','O(n)',{focus:['rains','dryDays','lastRain','answer']});
add(1490,'Clone N-ary Tree','tree',[[1,[[2,[]],[3,[[4,[]]]]]]],[1,[[2,[]],[3,[[4,[]]]]]],`
class Solution:
    def cloneTree(self, tree):
        def build(value):
            return Node(value[0],[build(child) for child in value[1]]) if value else None
        def clone(node):
            if not node:
                return None
            copy = Node(node.val)
            copy.children = [clone(child) for child in node.children]
            return copy
        def encode(node):
            return [node.val,[encode(child) for child in node.children]] if node else []
        root = build(tree)
        copied = clone(root)
        return encode(copied)
`,'Cây nhiều con dùng [giá trị, danh sách cây con]. Mỗi node tạo một Node mới rồi đệ quy sao chép từng con; thứ tự con và giá trị giữ nguyên nhưng danh tính node phải khác.','O(nodes)','O(nodes)');
add(1491,'Average Salary Excluding the Minimum and Maximum Salary','math',[[4000,3000,1000,2000]],2500,`
class Solution:
    def average(self, salary):
        total = sum(salary)-min(salary)-max(salary)
        return total/(len(salary)-2)
`,'Bỏ đúng mức thấp nhất và cao nhất khỏi tổng, đồng thời bỏ hai người khỏi mẫu số; không lấy trung vị.','O(n)','O(1)',{difficulty:'easy'});
add(1492,'The kth Factor of n','math',[12,3],3,`
class Solution:
    def kthFactor(self, n, k):
        from math import isqrt
        small,large = [],[]
        for divisor in range(1,isqrt(n)+1):
            if n%divisor == 0:
                small.append(divisor)
                if divisor*divisor != n:
                    large.append(n//divisor)
        ordered = small+large[::-1]
        return ordered[k-1] if k <= len(ordered) else -1
`,'Tìm cặp ước d,n/d tới căn. Nhóm ước nhỏ tăng dần, nhóm lớn đảo lại để ghép thành thứ tự tăng; số chính phương không lặp ước căn.','O(√n)','O(√n)');
add(1494,'Parallel Courses II','dp',[4,[[2,1],[3,1],[1,4]],2],3,`
class Solution:
    def minNumberOfSemesters(self, n, relations, k):
        from functools import lru_cache
        assert 1 <= k <= n <= 10
        prerequisites = [0]*n
        for before,after in relations:
            prerequisites[after-1] |= 1 << (before-1)
        full = (1 << n)-1
        @lru_cache(None)
        def solve(completed):
            if completed == full:
                return 0
            available = 0
            for course in range(n):
                if not (completed >> course & 1) and prerequisites[course]&completed == prerequisites[course]:
                    available |= 1 << course
            if not available:
                return float('inf')
            choices = []
            if available.bit_count() <= k:
                choices.append(available)
            else:
                subset = available
                while subset:
                    if subset.bit_count() == k:
                        choices.append(subset)
                    subset = (subset-1)&available
            return 1+min(solve(completed | choice) for choice in choices)
        answer = solve(0)
        return -1 if answer == float('inf') else answer
`,'Mask completed ghi môn đã học. Mỗi kỳ chỉ chọn môn có mọi tiên quyết đã hoàn tất từ kỳ trước; nếu có nhiều hơn k môn sẵn sàng thì thử các tập con đúng k và ghi nhớ trạng thái.','O(3^n+n·2^n)','O(2^n)',{difficulty:'hard',focus:['prerequisites','completed','available','choices'],traceOptions:{maxEvents:100000}});
add(1495,'Friendly Movies Streamed Last Month','sql',[[{content_id:1,title:'Kids Movie',kids_content:'Y',content_type:'Movies'},{content_id:2,title:'Adult Movie',kids_content:'N',content_type:'Movies'}],[{content_id:1,program_date:'2020-06-10'},{content_id:1,program_date:'2020-06-11'},{content_id:2,program_date:'2020-06-12'}]],['Kids Movie'],`
class Solution:
    def friendlyMovies(self, content, tvProgram):
        streamed = {r['content_id'] for r in tvProgram if r['program_date'][:7] == '2020-06'}
        return sorted({r['title'] for r in content if r['content_id'] in streamed and r['kids_content'] == 'Y' and r['content_type'] == 'Movies'})
`,'Giữ chương trình chiếu trong tháng 6/2020, nối Content rồi lọc Movies và kids_content=Y. Cùng phim chiếu nhiều lần chỉ xuất hiện một lần.','O(content+programs log programs)','O(content+programs)',{difficulty:'easy'});
add(1496,'Path Crossing','array',['NESWW'],true,`
class Solution:
    def isPathCrossing(self, path):
        directions = {'N':(0,1),'S':(0,-1),'E':(1,0),'W':(-1,0)}
        x,y,seen = 0,0,{(0,0)}
        for move in path:
            dx,dy = directions[move]
            x,y = x+dx,y+dy
            if (x,y) in seen:
                return True
            seen.add((x,y))
        return False
`,'Lưu mọi tọa độ đã ghé, kể cả gốc trước khi đi. Sau mỗi bước, tọa độ đã tồn tại nghĩa là đường đi cắt lại đường cũ.','O(n)','O(n)',{difficulty:'easy'});
add(1497,'Check If Array Pairs Are Divisible by k','math',[[1,2,3,4,5,10,6,7,8,9],5],true,`
class Solution:
    def canArrange(self, arr, k):
        from collections import Counter
        if len(arr)%2:
            return False
        counts = Counter(value%k for value in arr)
        for remainder,count in counts.items():
            if remainder == 0 or 2*remainder == k:
                if count%2:
                    return False
            elif counts[(k-remainder)%k] != count:
                return False
        return True
`,'Số dư r cần ghép với k−r, nên hai nhóm phải bằng số lượng. Dư 0 và dư k/2 nếu có tự ghép với chính nó nên số lượng phải chẵn.','O(n)','O(n)');
add(1498,'Number of Subsequences That Satisfy the Given Sum Condition','array',[[3,5,6,7],9],4,`
class Solution:
    def numSubseq(self, nums, target):
        nums = sorted(nums)
        powers = [1]
        for i in range(len(nums)):
            powers.append(powers[-1]*2%1000000007)
        left,right,answer = 0,len(nums)-1,0
        while left <= right:
            if nums[left]+nums[right] > target:
                right -= 1
            else:
                answer = (answer+powers[right-left])%1000000007
                left += 1
        return answer
`,'Sau sắp xếp, nếu min+max hợp lệ thì cố định nums[left] làm min; mỗi phần tử còn lại trong cửa sổ được lấy hoặc bỏ nên có 2^(right−left) dãy con.','O(n log n)','O(n)');
add(1500,'Design a File Sharing System','design',[4,[['join',[1,2]],['join',[2,3]],['request',1,3],['leave',1],['join',[4]],['request',2,1]]],[1,2,[2],null,1,[]],`
class Solution:
    def fileSharing(self, m, operations):
        import heapq
        users,freeIds,nextId,answer = {},[],1,[]
        for operation in operations:
            if operation[0] == 'join':
                user = heapq.heappop(freeIds) if freeIds else nextId
                if user == nextId:
                    nextId += 1
                users[user] = set(operation[1])
                answer.append(user)
            elif operation[0] == 'leave':
                user = operation[1]
                del users[user]
                heapq.heappush(freeIds,user)
                answer.append(None)
            else:
                user,chunk = operation[1:]
                providers = sorted(id for id,chunks in users.items() if chunk in chunks)
                if providers:
                    users[user].add(chunk)
                answer.append(providers)
        return answer
`,'join tái sử dụng ID trống nhỏ nhất bằng min-heap. leave xóa toàn bộ chunk của người đó. request trả các chủ chunk hiện tại theo ID tăng; có người cung cấp thì người yêu cầu nhận thêm chunk.','O(operations·users+joins log users)','O(owned chunks+users)',{focus:['users','freeIds','providers','answer']});
module.exports=lessons;
