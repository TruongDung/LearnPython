"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1701,'Average Waiting Time','array',[[[1,2],[2,5],[4,3]]],5,`
class Solution:
    def averageWaitingTime(self, customers):
        finish,total = 0,0
        for arrival,duration in customers:
            start = max(arrival,finish)
            finish = start+duration
            total += finish-arrival
        return total/len(customers)
`,'Đầu bếp chỉ bắt đầu khi khách đã đến và món trước đã xong. Thời gian chờ của khách tính cả thời gian nấu: finish-arrival.','O(n)','O(1)');
add(1702,'Maximum Binary String After Change','greedy',['000110'],'111011',`
class Solution:
    def maximumBinaryString(self, binary):
        zeros = binary.count('0')
        if zeros <= 1:
            return binary
        first = binary.index('0')
        zeroPosition = first+zeros-1
        return '1'*zeroPosition+'0'+'1'*(len(binary)-zeroPosition-1)
`,'Prefix trước số 0 đầu tiên giữ nguyên. Các phép đổi dồn mọi số 0 còn lại thành đúng một 0 ở first+zeroCount-1; mọi ô khác thành 1 để tối đa giá trị.','O(n)','O(n)');
add(1703,'Minimum Adjacent Swaps for K Consecutive Ones','sliding',[[1,0,0,1,0,1],2],1,`
class Solution:
    def minMoves(self, nums, k):
        positions = [i for i,value in enumerate(nums) if value]
        adjusted = [position-i for i,position in enumerate(positions)]
        answer = float('inf')
        for left in range(len(positions)-k+1):
            group = adjusted[left:left+k]
            median = group[k//2]
            cost = sum(abs(position-median) for position in group)
            answer = min(answer,cost)
        return answer
`,'Chọn k số 1 liên tiếp trong danh sách vị trí. Trừ thứ tự của chúng để bỏ khoảng cách bắt buộc giữa các ô 1; kéo các vị trí đã chỉnh về median cho tổng số đổi kề nhỏ nhất.','O(number of ones·k)','O(n)',{focus:['positions','adjusted','group','median','cost']});
add(1704,'Determine if String Halves Are Alike','string',['book'],true,`
class Solution:
    def halvesAreAlike(self, s):
        vowels = set('aeiouAEIOU')
        middle = len(s)//2
        left = sum(char in vowels for char in s[:middle])
        right = sum(char in vowels for char in s[middle:])
        return left == right
`,'Chia chuỗi chẵn thành hai nửa bằng nhau, đếm nguyên âm không phân biệt hoa/thường rồi so hai bộ đếm.','O(n)','O(n)');
add(1705,'Maximum Number of Eaten Apples','greedy',[[1,2,3,5,2],[3,2,1,4,2]],7,`
class Solution:
    def eatenApples(self, apples, days):
        import heapq
        heap,day,answer = [],0,0
        while day < len(apples) or heap:
            if day < len(apples) and apples[day] and days[day]:
                heapq.heappush(heap,[day+days[day],apples[day]])
            while heap and heap[0][0] <= day:
                heapq.heappop(heap)
            if heap:
                heap[0][1] -= 1
                answer += 1
                if heap[0][1] == 0:
                    heapq.heappop(heap)
            day += 1
        return answer
`,'Min-heap ưu tiên lô hỏng sớm nhất. Mỗi ngày thêm lô mới, bỏ lô đã hỏng rồi ăn một quả; vẫn tiếp tục sau ngày cuối trồng nếu còn táo tốt.','O((n+eaten) log n)','O(n)',{focus:['heap','day','answer']});
add(1706,'Where Will the Ball Fall','array',[[[1,1,1,-1,-1],[1,1,1,-1,-1],[-1,-1,-1,1,1],[1,1,1,1,-1],[-1,-1,-1,-1,-1]]],[1,-1,-1,-1,-1],`
class Solution:
    def findBall(self, grid):
        answer = []
        for start in range(len(grid[0])):
            c = start
            for r in range(len(grid)):
                nextCol = c+grid[r][c]
                if not 0 <= nextCol < len(grid[0]) or grid[r][nextCol] != grid[r][c]:
                    c = -1
                    break
                c = nextCol
            answer.append(c)
        return answer
`,'Ở mỗi hàng, bóng phải đi qua hai tấm nghiêng cùng chiều. Chạm tường hoặc gặp hình chữ V thì kẹt; theo dõi riêng đường đi từ từng cột đầu.','O(rows·cols)','O(cols)',{focus:['grid','start','r','c','nextCol','answer']});
add(1707,'Maximum XOR With an Element From Array','bits',[[0,1,2,3,4],[[3,1],[1,3],[5,6]]],[3,3,7],`
class Solution:
    def maximizeXor(self, nums, queries):
        answer = []
        for x,limit in queries:
            best = -1
            for value in nums:
                if value <= limit:
                    best = max(best,x^value)
            answer.append(best)
        return answer
`,'Mỗi truy vấn chỉ xét số không vượt limit rồi chọn XOR lớn nhất. Bản trực quan quét trực tiếp để nhìn từng phép XOR; nếu không có ứng viên trả -1.','O(nums·queries)','O(queries)',{focus:['nums','x','limit','value','best','answer']});
add(1708,'Largest Subarray Length K','array',[[1,4,5,2,3],3],[5,2,3],`
class Solution:
    def largestSubarray(self, nums, k):
        start = max(range(len(nums)-k+1),key=lambda i:nums[i])
        return nums[start:start+k]
`,'Theo đề các giá trị phân biệt, nên chỉ phần tử đầu đã quyết định thứ tự từ điển của hai đoạn. Chọn phần tử đầu lớn nhất trong những vị trí còn đủ k ô.','O(n)','O(k)');
add(1709,'Biggest Window Between Visits','sql',[[{user_id:1,visit_date:'2020-11-28'},{user_id:1,visit_date:'2020-10-20'}]],[{user_id:1,biggest_window:39}],`
class Solution:
    def biggestWindow(self, visits):
        from datetime import date
        groups = {}
        for visit in visits:
            groups.setdefault(visit['user_id'],[]).append(date.fromisoformat(visit['visit_date']))
        answer = []
        for user,days in sorted(groups.items()):
            ordered = sorted(days)+[date(2021,1,1)]
            gap = max((ordered[i+1]-ordered[i]).days for i in range(len(ordered)-1))
            answer.append({'user_id':user,'biggest_window':gap})
        return answer
`,'Thêm mốc 2021-01-01 sau lần thăm cuối. Sắp ngày theo người dùng và lấy khoảng cách ngày lớn nhất giữa hai mốc liên tiếp.','O(rows log rows)','O(rows)');
add(1710,'Maximum Units on a Truck','greedy',[[[1,3],[2,2],[3,1]],4],8,`
class Solution:
    def maximumUnits(self, boxTypes, truckSize):
        answer = 0
        for count,units in sorted(boxTypes,key=lambda pair:pair[1],reverse=True):
            take = min(count,truckSize)
            answer += take*units
            truckSize -= take
        return answer
`,'Mọi hộp chiếm một chỗ nên ưu tiên số đơn vị trên mỗi hộp lớn nhất. Lấy tối đa lượng còn lại và số chỗ xe còn.','O(types log types)','O(types)');
add(1711,'Count Good Meals','array',[[1,3,5,7,9]],4,`
class Solution:
    def countPairs(self, deliciousness):
        seen,answer = {},0
        powers = [1<<i for i in range(22)]
        for value in deliciousness:
            for total in powers:
                answer += seen.get(total-value,0)
            seen[value] = seen.get(value,0)+1
        return answer%1000000007
`,'Một bữa tốt có tổng là lũy thừa 2. Với số mới, tìm phần bù của từng tổng trong bộ đếm các số trước nó; sau đó mới thêm số mới để tránh ghép với chính mình.','O(22n)','O(n)');
add(1712,'Ways to Split Array Into Three Subarrays','array',[[1,2,2,2,5,0]],3,`
class Solution:
    def waysToSplit(self, nums):
        prefix = [0]
        for value in nums:
            prefix.append(prefix[-1]+value)
        answer = 0
        for i in range(1,len(nums)-1):
            for j in range(i+1,len(nums)):
                left,middle,right = prefix[i],prefix[j]-prefix[i],prefix[-1]-prefix[j]
                if left <= middle <= right:
                    answer += 1
        return answer%1000000007
`,'Hai đường cắt i,j chia thành ba đoạn không rỗng. Prefix sum lấy mỗi tổng trong O(1); chỉ cộng khi left≤middle≤right. Bản hình liệt kê các cặp đường cắt.','O(n²)','O(n)',{focus:['nums','prefix','i','j','left','middle','right']});
add(1713,'Minimum Operations to Make a Subsequence','dp',[[5,1,3],[9,4,2,3,4]],2,`
class Solution:
    def minOperations(self, target, arr):
        from bisect import bisect_left
        positions = {value:i for i,value in enumerate(target)}
        tails = []
        for value in arr:
            if value in positions:
                index = positions[value]
                slot = bisect_left(tails,index)
                if slot == len(tails):
                    tails.append(index)
                else:
                    tails[slot] = index
        return len(target)-len(tails)
`,'Target không trùng giá trị nên đổi mỗi phần tử arr thành vị trí trong target. Dãy tăng dài nhất của vị trí là phần target đã giữ được; chèn bù các phần tử còn thiếu.','O(arr log target)','O(target)',{focus:['positions','tails','index','slot']});
add(1714,'Sum Of Special Evenly-Spaced Elements In Array','array',[[0,1,2,3,4,5,6,7],[[0,3],[5,1],[4,2]]],[9,18,10],`
class Solution:
    def solve(self, nums, queries):
        answer = []
        for start,step in queries:
            total = 0
            for index in range(start,len(nums),step):
                total += nums[index]
            answer.append(total%1000000007)
        return answer
`,'Với truy vấn [start,step], cộng các ô start,start+step,… tới cuối mảng. Bản trực quan duyệt trực tiếp từng chỉ số được chọn.','O(queries·n)','O(queries)',{focus:['nums','start','step','index','total']});
add(1715,'Count Apples and Oranges','sql',[[{box_id:1,chest_id:1,apple_count:2,orange_count:3},{box_id:2,chest_id:null,apple_count:1,orange_count:2}],[{chest_id:1,apple_count:5,orange_count:7}]],[{apple_count:8,orange_count:12}],`
class Solution:
    def countFruit(self, boxes, chests):
        contents = {c['chest_id']:c for c in chests}
        apples,oranges = 0,0
        for box in boxes:
            chest = contents.get(box['chest_id'],{})
            apples += box['apple_count']+chest.get('apple_count',0)
            oranges += box['orange_count']+chest.get('orange_count',0)
        return [{'apple_count':apples,'orange_count':oranges}]
`,'Mỗi hộp có trái cây riêng và có thể chứa một rương. LEFT JOIN rương theo chest_id, thay rương thiếu bằng 0 rồi cộng cả hai nguồn.','O(boxes+chests)','O(chests)');
add(1716,'Calculate Money in Leetcode Bank','math',[10],37,`
class Solution:
    def totalMoney(self, n):
        answer = 0
        for day in range(n):
            week,weekday = divmod(day,7)
            deposit = 1+week+weekday
            answer += deposit
        return answer
`,'Tách số ngày thành tuần và ngày trong tuần. Thứ Hai tuần mới tăng 1 so với thứ Hai tuần trước; trong tuần mỗi ngày tăng thêm 1.','O(n)','O(1)');
add(1717,'Maximum Score From Removing Substrings','greedy',['cdbcbbaaabab',4,5],19,`
class Solution:
    def maximumGain(self, s, x, y):
        first,second = ('ab',x),('ba',y)
        if x < y:
            first,second = second,first
        answer = 0
        for pattern,score in (first,second):
            stack = []
            for char in s:
                if stack and stack[-1]+char == pattern:
                    stack.pop()
                    answer += score
                else:
                    stack.append(char)
            s = ''.join(stack)
        return answer
`,'Xóa cặp có điểm cao hơn trước bằng stack, rồi xử lý cặp còn lại trên chuỗi còn dư. Chữ khác a/b tự ngăn các nhóm và không cần xử lý riêng.','O(n)','O(n)',{focus:['pattern','stack','s','answer']});
add(1718,'Construct the Lexicographically Largest Valid Sequence','backtracking',[3],[3,1,2,3,2],`
class Solution:
    def constructDistancedSequence(self, n):
        assert 1 <= n <= 7
        sequence,used = [0]*(2*n-1),set()
        def visit(index):
            while index < len(sequence) and sequence[index]:
                index += 1
            if index == len(sequence):
                return True
            for value in range(n,0,-1):
                second = index if value == 1 else index+value
                if value not in used and second < len(sequence) and sequence[second] == 0:
                    sequence[index] = sequence[second] = value
                    used.add(value)
                    if visit(index+1):
                        return True
                    used.remove(value)
                    sequence[index] = sequence[second] = 0
            return False
        visit(0)
        return sequence
`,'Điền ô trống trái nhất và thử số lớn trước. Số v>1 phải chiếm hai ô cách nhau đúng v; số 1 chỉ chiếm một ô. Nghiệm đầu tiên tìm được là lớn nhất theo từ điển.','O(n!)','O(n)',{focus:['sequence','index','value','second','used']});
add(1719,'Number Of Ways To Reconstruct A Tree','graph',[[[1,2],[2,3]]],1,`
class Solution:
    def checkWays(self, pairs):
        graph = {}
        for a,b in pairs:
            graph.setdefault(a,set()).add(b)
            graph.setdefault(b,set()).add(a)
        root = next((v for v in graph if len(graph[v]) == len(graph)-1),None)
        if root is None:
            return 0
        answer = 1
        for node,neighbors in graph.items():
            if node == root:
                continue
            candidates = [v for v in neighbors if len(graph[v]) >= len(neighbors)]
            if not candidates:
                return 0
            parent = min(candidates,key=lambda v:len(graph[v]))
            if not (neighbors-{parent}) <= graph[parent]:
                return 0
            if len(graph[parent]) == len(neighbors):
                answer = 2
        return answer
`,'Cặp cho biết quan hệ tổ tiên, không phải cạnh trực tiếp. Gốc phải liên quan mọi node; chọn cha có tập hàng xóm nhỏ nhất bao trùm hàng xóm của node. Hai tập bằng nhau cho phép đổi vai nên có nhiều nghiệm.','O(n²)','O(n²)',{focus:['graph','root','node','parent','answer']});
add(1720,'Decode XORed Array','bits',[[1,2,3],1],[1,0,2,1],`
class Solution:
    def decode(self, encoded, first):
        answer = [first]
        for value in encoded:
            answer.append(answer[-1]^value)
        return answer
`,'Vì encoded[i]=arr[i] XOR arr[i+1], XOR lại với arr[i] sẽ lấy được arr[i+1]. Biết first là đủ khôi phục từ trái sang phải.','O(n)','O(n)');
add(1721,'Swapping Nodes in a Linked List','list',[[1,2,3,4,5],2],[1,4,3,2,5],`
class Solution:
    def swapNodes(self, head, k):
        first = head
        for i in range(k-1):
            first = first.next
        runner,second = first,head
        while runner.next:
            runner = runner.next
            second = second.next
        first.val,second.val = second.val,first.val
        return head
`,'Tìm node thứ k từ đầu. Đặt runner ở đó và second ở đầu; khi runner tới cuối, second là node thứ k từ cuối. Đề yêu cầu đổi giá trị nên giữ nguyên liên kết.','O(n)','O(1)',{kinds:['list'],answerKind:'list',focus:['first','runner','second']});
add(1722,'Minimize Hamming Distance After Swap Operations','graph',[[1,2,3,4],[2,1,4,5],[[0,1],[2,3]]],1,`
class Solution:
    def minimumHammingDistance(self, source, target, allowedSwaps):
        from collections import Counter
        parent = list(range(len(source)))
        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x
        for a,b in allowedSwaps:
            parent[find(a)] = find(b)
        counts = {}
        for i,value in enumerate(source):
            counts.setdefault(find(i),Counter())[value] += 1
        answer = 0
        for i,value in enumerate(target):
            group = counts[find(i)]
            if group[value]:
                group[value] -= 1
            else:
                answer += 1
        return answer
`,'Các vị trí trong cùng thành phần liên thông có thể hoán vị tự do. DSU gom nhóm, Counter lưu kho giá trị của nhóm; mỗi target lấy một giá trị nếu còn, thiếu thì tăng Hamming.','O(n²+swaps·n) simple DSU','O(n)',{focus:['parent','counts','group','answer']});
add(1724,'Checking Existence of Edge Length Limited Paths II','graph',[3,[[0,1,2],[1,2,4],[0,2,8]],[[0,2,5],[0,2,4]]],[true,false],`
class Solution:
    def distanceLimitedPaths(self, n, edgeList, queries):
        graph = [[] for _ in range(n)]
        for a,b,weight in edgeList:
            graph[a].append([b,weight])
            graph[b].append([a,weight])
        answer = []
        for start,end,limit in queries:
            queue,seen = [start],{start}
            for node in queue:
                for other,weight in graph[node]:
                    if weight < limit and other not in seen:
                        seen.add(other)
                        queue.append(other)
            answer.append(end in seen)
        return answer
`,'Mô phỏng đối tượng đồ thị cố định với nhiều query. Với mỗi query, BFS chỉ qua cạnh có trọng số nhỏ hơn limit; bằng limit cũng bị chặn. Bản giảng dùng BFS để thấy đường đi.','O(queries·(n+edges))','O(n+edges)',{focus:['start','end','limit','queue','seen']});
add(1725,'Number Of Rectangles That Can Form The Largest Square','array',[[[5,8],[3,9],[5,12],[16,5]]],3,`
class Solution:
    def countGoodRectangles(self, rectangles):
        sides = [min(width,height) for width,height in rectangles]
        largest = max(sides)
        return sides.count(largest)
`,'Hình vuông cắt được từ hình chữ nhật có cạnh tối đa bằng cạnh ngắn hơn. Tìm giá trị lớn nhất rồi đếm bao nhiêu hình đạt giá trị đó.','O(n)','O(n)');
add(1726,'Tuple with Same Product','array',[[2,3,4,6]],8,`
class Solution:
    def tupleSameProduct(self, nums):
        counts,answer = {},0
        for i in range(len(nums)):
            for j in range(i+1,len(nums)):
                product = nums[i]*nums[j]
                answer += 8*counts.get(product,0)
                counts[product] = counts.get(product,0)+1
        return answer
`,'Các số dương phân biệt nên hai cặp có cùng tích không thể chia sẻ một phần tử. Mỗi cặp-cặp tạo 8 bộ có thứ tự nhờ đổi hai cặp và đảo hai phần tử trong từng cặp.','O(n²)','O(n²)');
add(1727,'Largest Submatrix With Rearrangements','array',[[[0,0,1],[1,1,1],[1,0,1]]],4,`
class Solution:
    def largestSubmatrix(self, matrix):
        heights,answer = [0]*len(matrix[0]),0
        for row in matrix:
            heights = [h+1 if value else 0 for h,value in zip(heights,row)]
            ordered = sorted(heights,reverse=True)
            for i,height in enumerate(ordered):
                answer = max(answer,(i+1)*height)
        return answer
`,'Mỗi ô heights là số 1 liên tiếp phía trên. Có thể đổi thứ tự cột toàn cục, nên với mỗi đáy hàng chỉ cần xếp các chiều cao giảm dần và thử rộng·cao. Giữ heights gốc cho hàng sau.','O(rows·cols log cols)','O(cols)');
add(1729,'Find Followers Count','sql',[[{user_id:0,follower_id:1},{user_id:0,follower_id:2},{user_id:1,follower_id:0}]],[{user_id:0,followers_count:2},{user_id:1,followers_count:1}],`
class Solution:
    def followersCount(self, followers):
        groups = {}
        for row in followers:
            groups.setdefault(row['user_id'],set()).add(row['follower_id'])
        return [{'user_id':user,'followers_count':len(people)} for user,people in sorted(groups.items())]
`,'Nhóm người theo dõi theo user_id rồi đếm mỗi nhóm. Trả kết quả tăng dần theo ID người được theo dõi.','O(rows+users log users)','O(rows)');
add(1731,'The Number of Employees Which Report to Each Employee','sql',[[{employee_id:1,name:'Ada',reports_to:null,age:40},{employee_id:2,name:'Bob',reports_to:1,age:30},{employee_id:3,name:'Cal',reports_to:1,age:31}]],[{employee_id:1,name:'Ada',reports_count:2,average_age:31}],`
class Solution:
    def reportingEmployees(self, employees):
        from decimal import Decimal,ROUND_HALF_UP
        answer = []
        for manager in sorted(employees,key=lambda e:e['employee_id']):
            reports = [e['age'] for e in employees if e['reports_to'] == manager['employee_id']]
            if reports:
                average = int((Decimal(sum(reports))/len(reports)).quantize(Decimal('1'),rounding=ROUND_HALF_UP))
                answer.append({'employee_id':manager['employee_id'],'name':manager['name'],'reports_count':len(reports),'average_age':average})
        return answer
`,'SELF JOIN nhân viên với quản lý trực tiếp, không tính cấp dưới gián tiếp. Chỉ giữ người có báo cáo trực tiếp; trung bình tuổi làm tròn .5 lên.','O(employees²)','O(employees)');
add(1732,'Find the Highest Altitude','array',[[-5,1,5,0,-7]],1,`
class Solution:
    def largestAltitude(self, gain):
        altitude,answer = 0,0
        for change in gain:
            altitude += change
            answer = max(answer,altitude)
        return answer
`,'Độ cao xuất phát là 0 và cũng phải được xét. Prefix sum của gain cho độ cao sau từng chặng; lưu giá trị cao nhất đã gặp.','O(n)','O(1)');
add(1733,'Minimum Number of People to Teach','greedy',[2,[[1],[2],[1,2]],[[1,2],[1,3],[2,3]]],1,`
class Solution:
    def minimumTeachings(self, n, languages, friendships):
        known = [set(row) for row in languages]
        need = set()
        for a,b in friendships:
            if not known[a-1]&known[b-1]:
                need.update((a-1,b-1))
        answer = len(need)
        for language in range(1,n+1):
            learners = sum(language not in known[person] for person in need)
            answer = min(answer,learners)
        return answer
`,'Chỉ người thuộc một cặp bạn chưa có ngôn ngữ chung mới cần xét. Thử dạy cùng một ngôn ngữ cho nhóm đó và chọn số người chưa biết ngôn ngữ ấy nhỏ nhất.','O(friendships·languages+n·people)','O(total languages)');
add(1734,'Decode XORed Permutation','bits',[[3,1]],[1,2,3],`
class Solution:
    def decode(self, encoded):
        n,first = len(encoded)+1,0
        assert n%2 == 1
        for value in range(1,n+1):
            first ^= value
        for i in range(1,len(encoded),2):
            first ^= encoded[i]
        answer = [first]
        for value in encoded:
            answer.append(answer[-1]^value)
        return answer
`,'XOR 1..n là XOR toàn bộ hoán vị. XOR encoded ở chỉ số lẻ bằng XOR mọi phần tử trừ phần tử đầu vì n lẻ; từ đó tìm first rồi khôi phục từng ô.','O(n)','O(n)');
add(1735,'Count Ways to Make Array With Product','math',[[[2,6],[5,1],[73,660]]],[4,1,50734910],`
class Solution:
    def waysToFillArray(self, queries):
        from math import comb
        answer = []
        for n,product in queries:
            ways,prime = 1,2
            while prime*prime <= product:
                exponent = 0
                while product%prime == 0:
                    exponent += 1
                    product //= prime
                ways = ways*comb(n+exponent-1,exponent)%1000000007
                prime += 1
            if product > 1:
                ways = ways*n%1000000007
            answer.append(ways)
        return answer
`,'Phân tích tích thành thừa số nguyên tố. Với số mũ e, phân phối e đơn vị vào n vị trí bằng C(n+e-1,e); các nguyên tố độc lập nên nhân số cách.','O(queries·sqrt product)','O(queries)');
add(1736,'Latest Time by Replacing Hidden Digits','string',['2?:?0'],'23:50',`
class Solution:
    def maximumTime(self, time):
        for minute in range(24*60-1,-1,-1):
            candidate = str(minute//60).zfill(2)+':'+str(minute%60).zfill(2)
            if all(a == '?' or a == b for a,b in zip(time,candidate)):
                return candidate
`,'Duyệt thời gian hợp lệ từ 23:59 lùi về 00:00. Thời gian đầu tiên khớp mọi chữ số đã biết chính là đáp án lớn nhất.','O(1440)','O(1)');
add(1737,'Change Minimum Characters to Satisfy One of Three Conditions','string',['aba','caa'],2,`
class Solution:
    def minCharacters(self, a, b):
        from collections import Counter
        first,second = Counter(a),Counter(b)
        answer = len(a)+len(b)-max(first[c]+second[c] for c in 'abcdefghijklmnopqrstuvwxyz')
        for cut in range(1,26):
            boundary = chr(97+cut)
            aLow = sum(count for char,count in first.items() if char < boundary)
            bLow = sum(count for char,count in second.items() if char < boundary)
            answer = min(answer,len(a)-aLow+bLow,len(b)-bLow+aLow)
        return answer
`,'Thử ba loại điều kiện: mọi chữ giống nhau, mọi chữ a nhỏ hơn b, hoặc ngược lại. Hai điều kiện thứ tự dùng một ranh giới giữa 26 chữ để đếm chữ phải đổi ở mỗi bên.','O(n+m+26²)','O(26)');
add(1738,'Find Kth Largest XOR Coordinate Value','bits',[[[5,2],[1,6]],1],7,`
class Solution:
    def kthLargestValue(self, matrix, k):
        rows,cols = len(matrix),len(matrix[0])
        prefix,values = [[0]*(cols+1) for _ in range(rows+1)],[]
        for r in range(rows):
            for c in range(cols):
                prefix[r+1][c+1] = matrix[r][c]^prefix[r][c+1]^prefix[r+1][c]^prefix[r][c]
                values.append(prefix[r+1][c+1])
        return sorted(values,reverse=True)[k-1]
`,'Prefix XOR của hình chữ nhật từ gốc dùng trên XOR trái XOR chéo để phần giao được bù đúng. Thu mọi tọa độ, sắp giảm dần và lấy vị trí k-1.','O(rows·cols log(rows·cols))','O(rows·cols)');
add(1740,'Find Distance in a Binary Tree','tree',[[3,5,1,6,2,0,8,null,null,7,4],5,0],3,`
class Solution:
    def findDistance(self, root, p, q):
        graph,queue = {},[root]
        for node in queue:
            graph.setdefault(node.val,[])
            for child in (node.left,node.right):
                if child:
                    graph[node.val].append(child.val)
                    graph.setdefault(child.val,[]).append(node.val)
                    queue.append(child)
        seen,queue = {p},[(p,0)]
        for node,distance in queue:
            if node == q:
                return distance
            for other in graph[node]:
                if other not in seen:
                    seen.add(other)
                    queue.append((other,distance+1))
`,'Thêm cạnh hai chiều giữa cha và con để có thể đi lên hoặc xuống. BFS từ p tìm q; số lớp đã đi là khoảng cách theo cạnh.','O(n)','O(n)',{kinds:['tree'],focus:['graph','node','distance','seen']});
add(1741,'Find Total Time Spent by Each Employee','sql',[[{emp_id:1,event_day:'2020-11-28',in_time:4,out_time:32},{emp_id:1,event_day:'2020-11-28',in_time:55,out_time:200}]],[{day:'2020-11-28',emp_id:1,total_time:173}],`
class Solution:
    def employeeTime(self, employees):
        totals = {}
        for row in employees:
            key = (row['event_day'],row['emp_id'])
            totals[key] = totals.get(key,0)+row['out_time']-row['in_time']
        return [{'day':day,'emp_id':employee,'total_time':total} for (day,employee),total in sorted(totals.items())]
`,'Mỗi lượt làm việc đóng góp out_time-in_time. Nhóm theo cả ngày và nhân viên để nhiều lượt trong cùng ngày được cộng đúng.','O(rows+groups log groups)','O(groups)');
add(1742,'Maximum Number of Balls in a Box','math',[1,10],2,`
class Solution:
    def countBalls(self, lowLimit, highLimit):
        boxes = {}
        for ball in range(lowLimit,highLimit+1):
            box = sum(int(digit) for digit in str(ball))
            boxes[box] = boxes.get(box,0)+1
        return max(boxes.values())
`,'Số hộp là tổng các chữ số của số trên quả bóng. Tăng bộ đếm hộp tương ứng và tìm số bóng nhiều nhất.','O(range·digits)','O(digits·9)');
add(1743,'Restore the Array From Adjacent Pairs','graph',[[[2,1],[3,4],[3,2]]],[1,2,3,4],`
class Solution:
    def restoreArray(self, adjacentPairs):
        graph = {}
        for a,b in adjacentPairs:
            graph.setdefault(a,[]).append(b)
            graph.setdefault(b,[]).append(a)
        start = min(node for node in graph if len(graph[node]) == 1)
        answer,previous,current = [],None,start
        while current is not None:
            answer.append(current)
            following = next((v for v in graph[current] if v != previous),None)
            previous,current = current,following
        return answer
`,'Các cặp tạo thành một đường đi: hai đầu có bậc 1. Chọn một đầu rồi đi sang hàng xóm khác node vừa tới; chọn đầu nhỏ hơn để kết quả mẫu ổn định.','O(n)','O(n)');
add(1744,'Can You Eat Your Favorite Candy on Your Favorite Day?','array',[[7,4,5,3,8],[[0,2,2],[4,2,4],[2,13,1000000000]]],[true,false,true],`
class Solution:
    def canEat(self, candiesCount, queries):
        prefix = [0]
        for count in candiesCount:
            prefix.append(prefix[-1]+count)
        answer = []
        for kind,day,cap in queries:
            least,most = day+1,(day+1)*cap
            possible = least <= prefix[kind+1] and most > prefix[kind]
            answer.append(possible)
        return answer
`,'Đến hết ngày day phải ăn trong [day+1,(day+1)·cap] viên. Loại cần ăn chiếm khoảng số thứ tự (prefix[kind],prefix[kind+1]]; hai khoảng phải giao nhau.','O(types+queries)','O(types+queries)');
add(1745,'Palindrome Partitioning IV','dp',['abcbdd'],true,`
class Solution:
    def checkPartitioning(self, s):
        n = len(s)
        palindrome = [[False]*n for _ in range(n)]
        for left in range(n-1,-1,-1):
            for right in range(left,n):
                palindrome[left][right] = s[left] == s[right] and (right-left < 2 or palindrome[left+1][right-1])
        for i in range(1,n-1):
            for j in range(i+1,n):
                if palindrome[0][i-1] and palindrome[i][j-1] and palindrome[j][n-1]:
                    return True
        return False
`,'Tính bảng palindrome cho mọi đoạn trước. Sau đó thử hai đường cắt tạo đúng ba đoạn không rỗng; cả ba ô tra bảng đều phải đúng.','O(n²)','O(n²)',{focus:['palindrome','i','j','s']});
add(1746,'Maximum Subarray Sum After One Operation','dp',[[2,-1,-4,-3]],17,`
class Solution:
    def maxSumAfterOperation(self, nums):
        normal,changed,answer = 0,float('-inf'),float('-inf')
        for value in nums:
            changed = max(changed+value,max(0,normal)+value*value)
            normal = max(0,normal)+value
            answer = max(answer,changed)
        return answer
`,'Giữ hai trạng thái đoạn kết thúc ở đây: chưa bình phương và đã bình phương đúng một số. Với changed, hoặc nối số thường sau phép đổi cũ, hoặc bình phương số hiện tại.','O(n)','O(1)');
add(1747,'Leetflex Banned Accounts','sql',[[{account_id:1,ip_address:1,login:'2021-01-01 10:00',logout:'2021-01-01 11:00'},{account_id:1,ip_address:2,login:'2021-01-01 10:30',logout:'2021-01-01 12:00'}]],[{account_id:1}],`
class Solution:
    def bannedAccounts(self, logInfo):
        banned = set()
        for i,a in enumerate(logInfo):
            for b in logInfo[i+1:]:
                overlap = max(a['login'],b['login']) <= min(a['logout'],b['logout'])
                if a['account_id'] == b['account_id'] and a['ip_address'] != b['ip_address'] and overlap:
                    banned.add(a['account_id'])
        return [{'account_id':account} for account in sorted(banned)]
`,'SELF JOIN các lần đăng nhập cùng tài khoản nhưng khác IP. Hai khoảng thời gian giao nhau kể cả tại biên sẽ đánh dấu tài khoản; set loại trùng.','O(rows²)','O(accounts)');
add(1748,'Sum of Unique Elements','array',[[1,2,3,2]],4,`
class Solution:
    def sumOfUnique(self, nums):
        from collections import Counter
        counts = Counter(nums)
        return sum(value for value,count in counts.items() if count == 1)
`,'Đếm tần suất trước, rồi chỉ cộng giá trị xuất hiện đúng một lần. Các lần xuất hiện trùng bị loại hoàn toàn.','O(n)','O(n)');
add(1752,'Check if Array Is Sorted and Rotated','array',[[3,4,5,1,2]],true,`
class Solution:
    def check(self, nums):
        drops = 0
        for i in range(len(nums)):
            if nums[i] > nums[(i+1)%len(nums)]:
                drops += 1
        return drops <= 1
`,'Trên vòng tròn, một mảng tăng dần đã xoay có tối đa một lần giảm. Phải xét cả cạnh từ ô cuối về ô đầu.','O(n)','O(1)');
add(1753,'Maximum Score From Removing Stones','math',[2,4,6],6,`
class Solution:
    def maximumScore(self, a, b, c):
        total,largest = a+b+c,max(a,b,c)
        pairsByTotal = total//2
        pairsByOtherPiles = total-largest
        return min(pairsByTotal,pairsByOtherPiles)
`,'Mỗi lượt cần hai viên từ hai đống khác nhau. Số lượt bị chặn bởi tổng/2 và bởi tổng hai đống không lớn nhất; giá trị nhỏ hơn trong hai cận luôn đạt được.','O(1)','O(1)');
add(1754,'Largest Merge Of Two Strings','greedy',['cabaa','bcaaa'],'cbcabaaaaa',`
class Solution:
    def largestMerge(self, word1, word2):
        answer = ''
        while word1 and word2:
            if word1 > word2:
                answer += word1[0]
                word1 = word1[1:]
            else:
                answer += word2[0]
                word2 = word2[1:]
        return answer+word1+word2
`,'Chọn từ chuỗi có hậu tố còn lại lớn hơn theo từ điển. Khi hai chữ đầu bằng nhau phải so tiếp cả hậu tố, không thể quyết định chỉ bằng ký tự đầu.','O((n+m)²)','O(n+m)');
add(1756,'Design Most Recently Used Queue','design',[8,[3,5,2,8]],[3,6,2,2],`
class Solution:
    def mruQueue(self, n, fetches):
        queue,answer = list(range(1,n+1)),[]
        for k in fetches:
            value = queue.pop(k-1)
            queue.append(value)
            answer.append(value)
        return answer
`,'fetch(k) dùng thứ tự từ 1: lấy phần tử thứ k, xóa khỏi chỗ cũ và đưa xuống cuối. Bản hình dùng list để thấy toàn bộ thứ tự sau mỗi lần fetch.','O(fetches·n)','O(n+fetches)',{focus:['queue','k','value','answer']});
add(1757,'Recyclable and Low Fat Products','sql',[[{product_id:0,low_fats:'Y',recyclable:'N'},{product_id:1,low_fats:'Y',recyclable:'Y'}]],[{product_id:1}],`
class Solution:
    def recyclableLowFat(self, products):
        answer = []
        for product in products:
            if product['low_fats'] == 'Y' and product['recyclable'] == 'Y':
                answer.append({'product_id':product['product_id']})
        return answer
`,'Giữ sản phẩm khi cả low_fats và recyclable cùng bằng Y. Đây là phép AND giữa hai điều kiện lọc.','O(rows)','O(result)');
add(1758,'Minimum Changes To Make Alternating Binary String','string',['0100'],1,`
class Solution:
    def minOperations(self, s):
        zeroStart = sum(char != str(i%2) for i,char in enumerate(s))
        oneStart = len(s)-zeroStart
        return min(zeroStart,oneStart)
`,'Chỉ có hai mẫu xen kẽ: 0101… và 1010…. Mỗi ô sai mẫu đầu sẽ đúng mẫu sau, nên hai số lần đổi cộng lại bằng độ dài chuỗi.','O(n)','O(1)');
add(1759,'Count Number of Homogenous Substrings','string',['abbcccaa'],13,`
class Solution:
    def countHomogenous(self, s):
        previous,run,answer = None,0,0
        for char in s:
            run = run+1 if char == previous else 1
            answer = (answer+run)%1000000007
            previous = char
        return answer
`,'Nếu đoạn cùng chữ kết thúc ở đây dài run thì có run đoạn đồng nhất mới. Đổi chữ sẽ bắt đầu run=1.','O(n)','O(1)');
add(1760,'Minimum Limit of Balls in a Bag','search',[[9],2],3,`
class Solution:
    def minimumSize(self, nums, maxOperations):
        left,right = 1,max(nums)
        while left < right:
            mid = (left+right)//2
            operations = sum((value-1)//mid for value in nums)
            if operations <= maxOperations:
                right = mid
            else:
                left = mid+1
        return left
`,'Để mỗi túi có tối đa mid quả, túi value cần ceil(value/mid)-1 lần tách, bằng (value-1)//mid. Đủ lượt tách thì thử giới hạn nhỏ hơn.','O(n log max)','O(1)');
add(1761,'Minimum Degree of a Connected Trio in a Graph','graph',[6,[[1,2],[1,3],[3,2],[4,1],[5,2],[3,6]]],3,`
class Solution:
    def minTrioDegree(self, n, edges):
        graph = [set() for _ in range(n)]
        for a,b in edges:
            graph[a-1].add(b-1)
            graph[b-1].add(a-1)
        answer = float('inf')
        for a in range(n):
            for b in graph[a]:
                if b > a:
                    for c in graph[a]&graph[b]:
                        if c > b:
                            answer = min(answer,len(graph[a])+len(graph[b])+len(graph[c])-6)
        return -1 if answer == float('inf') else answer
`,'Bộ ba liên thông là tam giác. Duyệt a<b<c để tránh trùng; tổng bậc của ba đỉnh đếm ba cạnh trong hai lần nên trừ 6 để còn cạnh ra ngoài.','O(n³)','O(n+edges)');
add(1763,'Longest Nice Substring','string',['YazaAay'],'aAa',`
class Solution:
    def longestNiceSubstring(self, s):
        answer = ''
        for left in range(len(s)):
            letters = set()
            for right in range(left,len(s)):
                letters.add(s[right])
                if all(char.swapcase() in letters for char in letters) and right-left+1 > len(answer):
                    answer = s[left:right+1]
        return answer
`,'Mở rộng từng đoạn và kiểm tra mọi chữ đều có bản trái hoa/thường trong cùng đoạn. Chỉ cập nhật khi dài hơn để hòa độ dài giữ đoạn xuất hiện sớm nhất.','O(n²·alphabet)','O(n)');
add(1764,'Form Array by Concatenating Subarrays of Another Array','array',[[[1,-1,-1],[3,-2,0]],[1,-1,0,1,-1,-1,3,-2,0]],true,`
class Solution:
    def canChoose(self, groups, nums):
        start = 0
        for group in groups:
            while start+len(group) <= len(nums) and nums[start:start+len(group)] != group:
                start += 1
            if start+len(group) > len(nums):
                return False
            start += len(group)
        return True
`,'Tìm mỗi group sớm nhất có thể sau group trước. Khi khớp, nhảy qua cả group để các đoạn không chồng nhau; khoảng trống giữa các group được phép.','O(n·max group length)','O(max group length)');
add(1766,'Tree of Coprimes','tree',[[2,3,3,2],[[0,1],[1,2],[1,3]]],[-1,0,0,1],`
class Solution:
    def getCoprimes(self, nums, edges):
        import math
        graph = [[] for _ in nums]
        for a,b in edges:
            graph[a].append(b)
            graph[b].append(a)
        path,answer = [],[-1]*len(nums)
        def visit(node,parent):
            for ancestor in reversed(path):
                if math.gcd(nums[node],nums[ancestor]) == 1:
                    answer[node] = ancestor
                    break
            path.append(node)
            for other in graph[node]:
                if other != parent:
                    visit(other,node)
            path.pop()
        visit(0,-1)
        return answer
`,'DFS giữ đường từ gốc đến cha hiện tại. Duyệt ngược path để gặp tổ tiên gần nhất có gcd=1; sau khi xong nhánh phải pop để không lấy nhầm node ở nhánh khác.','O(n²)','O(n)',{focus:['nums','path','node','ancestor','answer']});
add(1767,'Find the Subtasks That Did Not Execute','sql',[[{task_id:1,subtasks_count:3}],[{task_id:1,subtask_id:2}]],[{task_id:1,subtask_id:1},{task_id:1,subtask_id:3}],`
class Solution:
    def missingSubtasks(self, tasks, executed):
        done = {(row['task_id'],row['subtask_id']) for row in executed}
        answer = []
        for task in tasks:
            for subtask in range(1,task['subtasks_count']+1):
                if (task['task_id'],subtask) not in done:
                    answer.append({'task_id':task['task_id'],'subtask_id':subtask})
        return answer
`,'Sinh đầy đủ subtask 1..subtasks_count của mỗi task, rồi anti-join với cặp task_id/subtask_id đã chạy.','O(total subtasks+executed)','O(executed+result)');
add(1769,'Minimum Number of Operations to Move All Balls to Each Box','array',['110'],[1,1,3],`
class Solution:
    def minOperations(self, boxes):
        answer = [0]*len(boxes)
        for order in (range(len(boxes)),range(len(boxes)-1,-1,-1)):
            balls,cost = 0,0
            for i in order:
                answer[i] += cost
                balls += int(boxes[i])
                cost += balls
        return answer
`,'Quét trái sang phải tính công chuyển bóng từ trái, rồi quét ngược tính từ phải. Mỗi bước đi thêm một ô làm cost tăng bằng số bóng đã đi qua.','O(n)','O(n)',{focus:['boxes','answer','i','balls','cost']});
add(1770,'Maximum Score from Performing Multiplication Operations','dp',[[1,2,3],[3,2,1]],14,`
class Solution:
    def maximumScore(self, nums, multipliers):
        from functools import lru_cache
        @lru_cache(None)
        def score(operation,left):
            if operation == len(multipliers):
                return 0
            right = len(nums)-1-(operation-left)
            chooseLeft = nums[left]*multipliers[operation]+score(operation+1,left+1)
            chooseRight = nums[right]*multipliers[operation]+score(operation+1,left)
            return max(chooseLeft,chooseRight)
        return score(0,0)
`,'Trạng thái chỉ cần lượt nhân và số phần tử đã lấy bên trái. Số lấy bên phải suy ra từ operation-left; thử hai đầu và cache kết quả tốt nhất.','O(m²)','O(m²)');
add(1771,'Maximize Palindrome Length From Subsequences','dp',['cacb','cbba'],5,`
class Solution:
    def longestPalindrome(self, word1, word2):
        s = word1+word2
        n,answer = len(s),0
        dp = [[0]*n for _ in range(n)]
        for left in range(n-1,-1,-1):
            dp[left][left] = 1
            for right in range(left+1,n):
                if s[left] == s[right]:
                    dp[left][right] = dp[left+1][right-1]+2
                    if left < len(word1) <= right:
                        answer = max(answer,dp[left][right])
                else:
                    dp[left][right] = max(dp[left+1][right],dp[left][right-1])
        return answer
`,'Tính dãy con palindrome dài nhất trên word1+word2. Chỉ cập nhật đáp án bằng cặp hai đầu khớp nằm ở hai từ khác nhau để bảo đảm mỗi từ đóng góp ít nhất một chữ.','O(n²)','O(n²)',{focus:['s','dp','left','right','answer']});
add(1772,'Sort Features by Popularity','string',[['cooler','lock','touch'],['i like cooler cooler','lock touch','cooler lock']],['cooler','lock','touch'],`
class Solution:
    def sortFeatures(self, features, responses):
        counts = dict.fromkeys(features,0)
        for response in responses:
            words = set(response.split())
            for feature in features:
                counts[feature] += feature in words
        return sorted(features,key=lambda feature:-counts[feature])
`,'Một response chỉ góp tối đa một điểm cho mỗi feature nên tách thành set từ. Sắp xếp ổn định theo điểm giảm dần để hòa điểm giữ thứ tự feature đầu vào.','O(responses·features+characters)','O(features+words)');
add(1773,'Count Items Matching a Rule','array',[[['phone','blue','pixel'],['computer','silver','lenovo'],['phone','gold','iphone']],'color','silver'],1,`
class Solution:
    def countMatches(self, items, ruleKey, ruleValue):
        column = {'type':0,'color':1,'name':2}[ruleKey]
        answer = 0
        for item in items:
            answer += item[column] == ruleValue
        return answer
`,'Ánh xạ ruleKey sang đúng cột type/color/name. Chỉ so cột đó với ruleValue cho từng hàng.','O(items)','O(1)');
add(1775,'Equal Sum Arrays With Minimum Number of Operations','greedy',[[1,2,3,4,5,6],[1,1,2,2,2,2]],3,`
class Solution:
    def minOperations(self, nums1, nums2):
        if sum(nums1) > sum(nums2):
            nums1,nums2 = nums2,nums1
        difference = sum(nums2)-sum(nums1)
        gains = sorted([6-value for value in nums1]+[value-1 for value in nums2],reverse=True)
        answer = 0
        for gain in gains:
            if difference <= 0:
                return answer
            difference -= gain
            answer += 1
        return answer if difference <= 0 else -1
`,'Đặt mảng tổng nhỏ trước. Mỗi ô có mức cải thiện tối đa: tăng lên 6 ở mảng nhỏ hoặc giảm về 1 ở mảng lớn. Dùng mức cải thiện lớn nhất trước để giảm số thao tác.','O((n+m) log(n+m))','O(n+m)');
add(1777,"Product's Price for Each Store",'sql',[[{product_id:0,store:'store1',price:95},{product_id:0,store:'store3',price:105}]],[{product_id:0,store1:95,store2:null,store3:105}],`
class Solution:
    def pivotPrices(self, products):
        rows = {}
        for product in products:
            identifier = product['product_id']
            if identifier not in rows:
                rows[identifier] = {'product_id':identifier,'store1':None,'store2':None,'store3':None}
            rows[identifier][product['store']] = product['price']
        return [rows[identifier] for identifier in sorted(rows)]
`,'PIVOT biến các giá trị store thành ba cột store1/store2/store3. Mỗi sản phẩm tạo một hàng; cửa hàng không bán giữ NULL thay vì 0.','O(rows+products log products)','O(products)');
add(1778,'Shortest Path in a Hidden Grid','graph',[[[1,1,0],[0,1,1]],[0,0],[1,2]],3,`
class Solution:
    def findShortestPath(self, grid, start, target):
        directions = [(-1,0),(1,0),(0,-1),(0,1)]
        discovered = {tuple(start)}
        def explore(r,c):
            for dr,dc in directions:
                nr,nc = r+dr,c+dc
                canMove = 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] != 0
                if canMove and (nr,nc) not in discovered:
                    discovered.add((nr,nc))
                    explore(nr,nc)
        explore(*start)
        queue,seen = [(start[0],start[1],0)],{tuple(start)}
        for r,c,distance in queue:
            if [r,c] == target:
                return distance
            for dr,dc in directions:
                point = (r+dr,c+dc)
                if point in discovered and point not in seen:
                    seen.add(point)
                    queue.append((*point,distance+1))
        return -1
`,'Mô hình GridMaster dùng lưới 0=tường, 1=đường. Trước hết DFS khám phá vùng đi được, tương ứng đi và quay lui bằng API; sau đó BFS trên bản đồ đã biết để tìm đường ngắn nhất.','O(rows·cols)','O(rows·cols)',{description:'Local hidden-grid model; DFS discovers reachable cells before BFS. GridMaster movement is represented by coordinates.',focus:['grid','discovered','r','c','distance']});
add(1779,'Find Nearest Point That Has the Same X or Y Coordinate','math',[3,4,[[1,2],[3,1],[2,4],[2,3],[4,4]]],2,`
class Solution:
    def nearestValidPoint(self, x, y, points):
        best,answer = float('inf'),-1
        for i,(a,b) in enumerate(points):
            if a == x or b == y:
                distance = abs(a-x)+abs(b-y)
                if distance < best:
                    best,answer = distance,i
        return answer
`,'Lọc điểm chung x hoặc y trước khi so khoảng cách Manhattan. Chỉ cập nhật khi gần hơn để giữ chỉ số nhỏ nhất khi hòa.','O(points)','O(1)');
add(1780,'Check if Number is a Sum of Powers of Three','math',[12],true,`
class Solution:
    def checkPowersOfThree(self, n):
        while n:
            n,remainder = divmod(n,3)
            if remainder == 2:
                return False
        return True
`,'Viết n ở cơ số 3. Chỉ chữ số 0/1 mới biểu diễn dùng mỗi lũy thừa tối đa một lần; gặp phần dư 2 thì không thể.','O(log n)','O(1)');
add(1781,'Sum of Beauty of All Substrings','string',['aabcb'],5,`
class Solution:
    def beautySum(self, s):
        answer = 0
        for left in range(len(s)):
            counts = {}
            for right in range(left,len(s)):
                char = s[right]
                counts[char] = counts.get(char,0)+1
                beauty = max(counts.values())-min(counts.values())
                answer += beauty
        return answer
`,'Mở rộng mỗi đoạn con và cập nhật tần suất. Beauty lấy tần suất lớn nhất trừ nhỏ nhất trong những chữ thật sự xuất hiện, không tính chữ có tần suất 0.','O(n²·alphabet)','O(alphabet)');
add(1782,'Count Pairs Of Nodes','graph',[4,[[1,2],[2,4],[1,3],[2,3],[2,1]], [2,3]],[6,5],`
class Solution:
    def countPairs(self, n, edges, queries):
        from collections import Counter
        degree,shared = [0]*n,Counter()
        for a,b in edges:
            a,b = min(a,b)-1,max(a,b)-1
            degree[a] += 1
            degree[b] += 1
            shared[a,b] += 1
        answer = []
        for query in queries:
            count = 0
            for a in range(n):
                for b in range(a+1,n):
                    count += degree[a]+degree[b]-shared[a,b] > query
            answer.append(count)
        return answer
`,'Số cạnh chạm ít nhất một trong hai node là degree[a]+degree[b]-shared[a,b]. Cạnh song song vẫn tính riêng nhưng mỗi cạnh chung chỉ tính một lần; điều kiện là lớn hơn query.','O(queries·n²+edges)','O(n+edges)');
add(1783,'Grand Slam Titles','sql',[[{player_id:1,player_name:'Ada'},{player_id:2,player_name:'Bob'}],[{year:2020,Wimbledon:1,Fr_open:1,US_open:2,Au_open:1}]],[{player_id:1,player_name:'Ada',grand_slams_count:3},{player_id:2,player_name:'Bob',grand_slams_count:1}],`
class Solution:
    def grandSlams(self, players, championships):
        counts = {}
        for season in championships:
            for tournament in ('Wimbledon','Fr_open','US_open','Au_open'):
                player = season[tournament]
                counts[player] = counts.get(player,0)+1
        return [{'player_id':p['player_id'],'player_name':p['player_name'],'grand_slams_count':counts[p['player_id']]} for p in players if p['player_id'] in counts]
`,'UNPIVOT bốn giải của từng năm thành bốn chức vô địch. Cộng theo player_id rồi JOIN tên; người chưa thắng giải nào không xuất hiện.','O(players+years)','O(players)');
add(1784,'Check if Binary String Has at Most One Segment of Ones','string',['1001'],false,`
class Solution:
    def checkOnesSegment(self, s):
        segments,previous = 0,'0'
        for char in s:
            if char == '1' and previous == '0':
                segments += 1
            previous = char
        return segments <= 1
`,'Một đoạn 1 bắt đầu khi chuyển từ 0 sang 1. Đếm số lần bắt đầu đoạn để phân biệt một dãy 1 liên tục với nhiều dãy rời nhau.','O(n)','O(1)');
add(1785,'Minimum Elements to Add to Form a Given Sum','math',[[1,-1,1],3,-4],2,`
class Solution:
    def minElements(self, nums, limit, goal):
        difference = abs(goal-sum(nums))
        return (difference+limit-1)//limit
`,'Mỗi phần tử thêm vào thay đổi tổng tối đa limit theo hướng cần thiết. Số phần tử là ceil(|goal-sum|/limit); phần tử cuối dùng phần dư.','O(n)','O(1)');
add(1787,'Make the XOR of All Segments Equal to Zero','dp',[[1,2,0,3,0],1],3,`
class Solution:
    def minChanges(self, nums, k):
        from collections import Counter
        assert all(0 <= value < 16 for value in nums)
        width = 1<<max(1,max(nums).bit_length())
        dp = [0]+[float('inf')]*(width-1)
        for group in range(k):
            counts = Counter(nums[group::k])
            size = len(nums[group::k])
            nextDp = [min(dp)+size]*width
            for mask in range(width):
                for value,count in counts.items():
                    nextDp[mask] = min(nextDp[mask],dp[mask^value]+size-count)
            dp = nextDp
        return dp[0]
`,'Hai cửa sổ k liền nhau XOR=0 buộc các ô cách k bằng nhau. Gom theo index%k, chọn một giá trị mỗi nhóm; DP theo XOR của các giá trị đã chọn, chi phí là số ô phải sửa. Giới hạn hình: giá trị 0..15.','O(k·width·distinct values)','O(width)',{focus:['group','counts','dp','nextDp','mask']});
add(1788,'Maximize the Beauty of the Garden','array',[[1,2,3,1,2]],8,`
class Solution:
    def maximumBeauty(self, flowers):
        first,positive,answer = {},0,float('-inf')
        for value in flowers:
            if value in first:
                answer = max(answer,2*value+positive-first[value])
            else:
                first[value] = positive+max(0,value)
            positive += max(0,value)
        return answer
`,'Hai đầu giữ lại phải cùng giá trị. Giữa hai đầu chỉ giữ các số dương và bỏ số âm; prefix tổng dương tính phần giữa, lần xuất hiện đầu cho cơ hội tổng lớn nhất.','O(n)','O(n)');
add(1789,'Primary Department for Each Employee','sql',[[{employee_id:1,department_id:1,primary_flag:'N'},{employee_id:2,department_id:1,primary_flag:'N'},{employee_id:2,department_id:2,primary_flag:'Y'}]],[{employee_id:1,department_id:1},{employee_id:2,department_id:2}],`
class Solution:
    def primaryDepartments(self, employee):
        from collections import Counter
        counts = Counter(row['employee_id'] for row in employee)
        return [{'employee_id':row['employee_id'],'department_id':row['department_id']} for row in employee if row['primary_flag'] == 'Y' or counts[row['employee_id']] == 1]
`,'Người chỉ có một phòng ban dùng phòng đó dù cờ là N. Người thuộc nhiều phòng chỉ lấy hàng có primary_flag=Y.','O(rows)','O(employees)');
add(1790,'Check if One String Swap Can Make Strings Equal','string',['bank','kanb'],true,`
class Solution:
    def areAlmostEqual(self, s1, s2):
        different = [i for i in range(len(s1)) if s1[i] != s2[i]]
        if not different:
            return True
        if len(different) != 2:
            return False
        a,b = different
        return s1[a] == s2[b] and s1[b] == s2[a]
`,'Không cần đổi nếu hai chuỗi đã bằng nhau. Nếu khác, phải có đúng hai vị trí và các chữ ở đó khớp chéo sau một lần swap.','O(n)','O(n)');
add(1791,'Find Center of Star Graph','graph',[[[1,2],[2,3],[4,2]]],2,`
class Solution:
    def findCenter(self, edges):
        first,second = edges[0],edges[1]
        return first[0] if first[0] in second else first[1]
`,'Đồ thị đã được đảm bảo là hình sao. Hai cạnh bất kỳ có đúng một đầu chung và đó là tâm, nên chỉ cần xem hai cạnh đầu.','O(1)','O(1)');
add(1792,'Maximum Average Pass Ratio','greedy',[[[1,2],[3,5],[2,2]],2],0.7833333333333333,`
class Solution:
    def maxAverageRatio(self, classes, extraStudents):
        import heapq
        heap = []
        for passed,total in classes:
            gain = (passed+1)/(total+1)-passed/total
            heapq.heappush(heap,(-gain,passed,total))
        for student in range(extraStudents):
            _,passed,total = heapq.heappop(heap)
            passed,total = passed+1,total+1
            gain = (passed+1)/(total+1)-passed/total
            heapq.heappush(heap,(-gain,passed,total))
        return sum(passed/total for _,passed,total in heap)/len(classes)
`,'Mỗi học sinh mới chắc chắn đậu. Ưu tiên lớp có mức tăng tỷ lệ (p+1)/(t+1)-p/t lớn nhất, không phải tỷ lệ hiện tại nhỏ nhất; cập nhật lợi ích sau mỗi học sinh.','O((classes+extra) log classes)','O(classes)');
add(1794,'Count Pairs of Equal Substrings With Minimum Difference','string',['abcd','bccda'],1,`
class Solution:
    def countQuadruples(self, firstString, secondString):
        last = {char:i for i,char in enumerate(secondString)}
        minimum,answer = float('inf'),0
        for i,char in enumerate(firstString):
            if char in last:
                difference = i-last[char]
                if difference < minimum:
                    minimum,answer = difference,1
                elif difference == minimum:
                    answer += 1
        return answer
`,'Cần tối thiểu j-a với [i,j] ở chuỗi đầu và [a,b] ở chuỗi sau. Đoạn dài hơn 1 luôn có thể rút xuống một chữ để giảm j-a, nên chỉ xét chữ đơn: vị trí sớm bên đầu và muộn bên sau.','O(n+m)','O(alphabet)',{focus:['firstString','secondString','last','difference','minimum','answer']});
add(1795,'Rearrange Products Table','sql',[[{product_id:0,store1:95,store2:100,store3:105},{product_id:1,store1:70,store2:null,store3:80}]],[{product_id:0,store:'store1',price:95},{product_id:0,store:'store2',price:100},{product_id:0,store:'store3',price:105},{product_id:1,store:'store1',price:70},{product_id:1,store:'store3',price:80}],`
class Solution:
    def rearrangeProducts(self, products):
        answer = []
        for product in products:
            for store in ('store1','store2','store3'):
                if product[store] is not None:
                    answer.append({'product_id':product['product_id'],'store':store,'price':product[store]})
        return answer
`,'UNPIVOT ba cột cửa hàng thành nhiều hàng. Chỉ phát hàng có giá khác NULL; giá 0 vẫn là giá hợp lệ và phải được giữ.','O(rows)','O(result)');
add(1796,'Second Largest Digit in a String','string',['dfa12321afd'],2,`
class Solution:
    def secondHighest(self, s):
        digits = sorted({int(char) for char in s if char.isdigit()},reverse=True)
        return digits[1] if len(digits) >= 2 else -1
`,'Lọc chữ số, loại trùng bằng set rồi sắp giảm dần. Lớn thứ hai là giá trị khác nhau thứ hai, không phải lần xuất hiện thứ hai.','O(n)','O(10)');
add(1798,'Maximum Number of Consecutive Values You Can Make','greedy',[[1,3]],2,`
class Solution:
    def getMaximumConsecutive(self, coins):
        reachable = 0
        for coin in sorted(coins):
            if coin > reachable+1:
                break
            reachable += coin
        return reachable+1
`,'Đã tạo được mọi tổng 0..reachable. Coin≤reachable+1 nối liền vùng tổng mới tới reachable+coin; coin lớn hơn tạo một lỗ không thể lấp. Kết quả tính cả tổng 0.','O(n log n)','O(n)');
module.exports=lessons;
