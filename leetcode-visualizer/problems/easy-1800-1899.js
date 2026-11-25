"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1800,'Maximum Ascending Subarray Sum','array',[[10,20,30,5,10,50]],65,`
class Solution:
    def maxAscendingSum(self, nums):
        total,answer = 0,0
        for i,value in enumerate(nums):
            total = total+value if i and value > nums[i-1] else value
            answer = max(answer,total)
        return answer
`,'Đoạn phải liên tiếp và tăng nghiêm ngặt. Khi value không lớn hơn ô trước, bắt đầu tổng mới từ value; theo dõi tổng cao nhất.','O(n)','O(1)');
add(1801,'Number of Orders in the Backlog','design',[[[10,5,0],[15,2,1],[25,1,1],[30,4,0]]],6,`
class Solution:
    def getNumberOfBacklogOrders(self, orders):
        import heapq
        buys,sells = [],[]
        for price,amount,kind in orders:
            other = sells if kind == 0 else buys
            while amount and other and (other[0][0] <= price if kind == 0 else -other[0][0] >= price):
                matched = min(amount,other[0][1])
                amount -= matched
                other[0][1] -= matched
                if other[0][1] == 0:
                    heapq.heappop(other)
            if amount:
                heapq.heappush(buys if kind == 0 else sells,[-price if kind == 0 else price,amount])
        return sum(amount for price,amount in buys+sells)%1000000007
`,'Buy ưu tiên giá cao nhất, sell ưu tiên giá thấp nhất. Mỗi lệnh mới khớp tối đa với phía đối diện khi giá thỏa điều kiện; lượng dư mới vào backlog.','O(orders log orders)','O(orders)',{focus:['buys','sells','price','amount','matched']});
add(1802,'Maximum Value at a Given Index in a Bounded Array','search',[4,2,6],2,`
class Solution:
    def maxValue(self, n, index, maxSum):
        def side(peak,length):
            used = min(peak-1,length)
            return used*(2*peak-used-1)//2+length-used
        left,right = 1,maxSum-n+1
        while left < right:
            mid = (left+right+1)//2
            total = mid+side(mid,index)+side(mid,n-index-1)
            if total <= maxSum:
                left = mid
            else:
                right = mid-1
        return left
`,'Với đỉnh mid, tổng nhỏ nhất giảm mỗi bước 1 về hai phía cho tới 1 rồi giữ 1. Tính hai cấp số cộng để thử tính khả thi, tìm nhị phân đỉnh lớn nhất.','O(log maxSum)','O(1)');
add(1803,'Count Pairs With XOR in a Range','bits',[[1,4,2,7],2,6],6,`
class Solution:
    def countPairs(self, nums, low, high):
        answer = 0
        for i in range(len(nums)):
            for j in range(i):
                value = nums[i]^nums[j]
                if low <= value <= high:
                    answer += 1
        return answer
`,'Bản trực quan xét từng cặp j<i để thấy phép XOR và kiểm tra cả hai biên đóng [low,high]. Mỗi cặp chỉ được tính một lần.','O(n²)','O(1)',{focus:['nums','i','j','value','answer']});
add(1805,'Number of Different Integers in a String','string',['a123bc34d8ef34'],3,`
class Solution:
    def numDifferentIntegers(self, word):
        import re
        numbers = set()
        for token in re.findall(r'[0-9]+',word):
            normalized = token.lstrip('0') or '0'
            numbers.add(normalized)
        return len(numbers)
`,'Tách các dãy chữ số liên tiếp rồi bỏ số 0 đầu để chuẩn hóa. Dùng chuỗi thay số nguyên để không giới hạn độ dài; 000 và 0 đều thành 0.','O(n)','O(n)');
add(1806,'Minimum Number of Operations to Reinitialize a Permutation','array',[4],2,`
class Solution:
    def reinitializePermutation(self, n):
        original = list(range(n))
        permutation,answer = original[:],0
        while True:
            permutation = [permutation[i//2] if i%2 == 0 else permutation[n//2+(i-1)//2] for i in range(n)]
            answer += 1
            if permutation == original:
                return answer
`,'Mỗi vòng tạo mảng mới từ mảng cũ theo công thức chỉ số chẵn/lẻ. Dừng ở lần đầu toàn bộ hoán vị trở về thứ tự ban đầu, sau ít nhất một vòng.','O(n·period)','O(n)');
add(1807,'Evaluate the Bracket Pairs of a String','string',['(name)is(age)yearsold',[['name','bob'],['age','two']]],'bobistwoyearsold',`
class Solution:
    def evaluate(self, s, knowledge):
        dictionary = dict(knowledge)
        answer,key,inside = '', '',False
        for char in s:
            if char == '(':
                inside,key = True,''
            elif char == ')':
                answer += dictionary.get(key,'?')
                inside = False
            elif inside:
                key += char
            else:
                answer += char
        return answer
`,'Bên trong ngoặc thì thu tên key; gặp ngoặc đóng mới tra từ điển và chèn giá trị hoặc ?. Chữ ngoài ngoặc được sao chép nguyên.','O(n+output)','O(dictionary+output)');
add(1808,'Maximize Number of Nice Divisors','math',[5],6,`
class Solution:
    def maxNiceDivisors(self, primeFactors):
        if primeFactors <= 3:
            return primeFactors
        threes,remainder = divmod(primeFactors,3)
        if remainder == 1:
            return pow(3,threes-1,1000000007)*4%1000000007
        if remainder == 2:
            return pow(3,threes,1000000007)*2%1000000007
        return pow(3,threes,1000000007)
`,'Số nice divisors là tích số mũ của các nguyên tố. Chia tổng số mũ thành các nhóm 3 cho tích lớn nhất; nếu dư 1 thì đổi 3+1 thành 2+2.','O(log primeFactors)','O(1)');
add(1809,'Ad-Free Sessions','sql',[[{session_id:1,customer_id:1,start_time:1,end_time:5},{session_id:2,customer_id:1,start_time:6,end_time:9}],[{ad_id:1,customer_id:1,timestamp:3}]],[{session_id:2}],`
class Solution:
    def adFreeSessions(self, playback, ads):
        answer = []
        for session in playback:
            shown = any(ad['customer_id'] == session['customer_id'] and session['start_time'] <= ad['timestamp'] <= session['end_time'] for ad in ads)
            if not shown:
                answer.append({'session_id':session['session_id']})
        return answer
`,'Một phiên có quảng cáo nếu cùng customer_id và timestamp nằm trong khoảng bắt đầu/kết thúc kể cả hai biên. Chỉ xuất session không có hàng khớp.','O(sessions·ads)','O(result)');
add(1810,'Minimum Path Cost in a Hidden Grid','graph',[[[1,2,0],[0,3,4]],[0,0],[1,2]],9,`
class Solution:
    def findShortestPath(self, grid, start, target):
        import heapq
        discovered = {}
        def explore(r,c):
            discovered[r,c] = grid[r][c]
            for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):
                nr,nc = r+dr,c+dc
                if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] > 0 and (nr,nc) not in discovered:
                    explore(nr,nc)
        explore(*start)
        heap,distance = [(0,*start)],{tuple(start):0}
        while heap:
            cost,r,c = heapq.heappop(heap)
            if cost != distance[r,c]:
                continue
            if [r,c] == target:
                return cost
            for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):
                point = (r+dr,c+dc)
                if point in discovered and cost+discovered[point] < distance.get(point,float('inf')):
                    distance[point] = cost+discovered[point]
                    heapq.heappush(heap,(distance[point],*point))
        return -1
`,'Mô hình hidden grid: 0=tường, số dương là phí bước vào ô. DFS khám phá bản đồ, sau đó Dijkstra luôn mở ô có tổng phí nhỏ nhất. Ô xuất phát không mất phí.','O(cells log cells)','O(cells)',{description:'GridMaster is modeled locally with positive entry costs and coordinate discovery.',focus:['grid','discovered','distance','cost','r','c']});
add(1811,'Find Interview Candidates','sql',[[{user_id:1,name:'Ada',mail:'a@x'},{user_id:2,name:'Bob',mail:'b@x'}],[{contest_id:1,gold_medal:1,silver_medal:2,bronze_medal:3},{contest_id:2,gold_medal:1,silver_medal:3,bronze_medal:4},{contest_id:3,gold_medal:1,silver_medal:4,bronze_medal:5}]],[{name:'Ada',mail:'a@x'}],`
class Solution:
    def interviewCandidates(self, users, contests):
        medals,golds = {},{}
        for contest in contests:
            winner = contest['gold_medal']
            golds[winner] = golds.get(winner,0)+1
            for key in ('gold_medal','silver_medal','bronze_medal'):
                medals.setdefault(contest[key],set()).add(contest['contest_id'])
        answer = []
        for user in users:
            identifier = user['user_id']
            ids = medals.get(identifier,set())
            consecutive = any(i+1 in ids and i+2 in ids for i in ids)
            if golds.get(identifier,0) >= 3 or consecutive:
                answer.append({'name':user['name'],'mail':user['mail']})
        return answer
`,'Ứng viên đạt ít nhất 3 huy chương vàng bất kỳ hoặc nhận huy chương ở 3 contest_id liên tiếp. Tách bộ đếm vàng và tập contest để kiểm tra hai điều kiện OR.','O(users+contests)','O(medals)');
add(1812,'Determine Color of a Chessboard Square','math',['a1'],false,`
class Solution:
    def squareIsWhite(self, coordinates):
        column = ord(coordinates[0])-ord('a')
        row = int(coordinates[1])-1
        return (column+row)%2 == 1
`,'a1 là ô đen. Mỗi bước ngang hoặc dọc đổi màu, nên tổng tọa độ đổi parity; tổng lẻ là ô trắng.','O(1)','O(1)');
add(1813,'Sentence Similarity III','string',['My name is Haley','My Haley'],true,`
class Solution:
    def areSentencesSimilar(self, sentence1, sentence2):
        a,b = sentence1.split(),sentence2.split()
        if len(a) > len(b):
            a,b = b,a
        prefix = 0
        while prefix < len(a) and a[prefix] == b[prefix]:
            prefix += 1
        suffix = 0
        while suffix < len(a)-prefix and a[-1-suffix] == b[-1-suffix]:
            suffix += 1
        return prefix+suffix == len(a)
`,'Đoạn từ thêm vào phải liền nhau, nên chuỗi ngắn phải được phủ bằng một prefix khớp và một suffix khớp không chồng nhau. So theo từ nguyên vẹn.','O(words)','O(words)');
add(1814,'Count Nice Pairs in an Array','array',[[42,11,1,97]],2,`
class Solution:
    def countNicePairs(self, nums):
        counts,answer = {},0
        for value in nums:
            reversedValue = int(str(value)[::-1])
            key = value-reversedValue
            answer += counts.get(key,0)
            counts[key] = counts.get(key,0)+1
        return answer%1000000007
`,'Chuyển nums[i]+rev(nums[j])=nums[j]+rev(nums[i]) thành nums[i]-rev(nums[i]) bằng nhau. Đếm các khóa đã gặp thay vì duyệt từng cặp.','O(n·digits)','O(n)');
add(1815,'Maximum Number of Groups Getting Fresh Donuts','dp',[3,[1,2,3,4,5,6]],4,`
class Solution:
    def maxHappyGroups(self, batchSize, groups):
        from functools import lru_cache
        assert batchSize <= 6 and len(groups) <= 12
        counts = [0]*batchSize
        for group in groups:
            counts[group%batchSize] += 1
        fresh,counts[0] = counts[0],0
        @lru_cache(None)
        def visit(state,remainder):
            answer = 0
            for value,count in enumerate(state):
                if count:
                    following = list(state)
                    following[value] -= 1
                    answer = max(answer,int(remainder == 0)+visit(tuple(following),(remainder+value)%batchSize))
            return answer
        return fresh+visit(tuple(counts),0)
`,'Nhóm chia hết batchSize luôn có thể nhận bánh mới trước. Các nhóm còn lại chỉ cần phần dư; thử thứ tự các phần dư với cache, thưởng 1 khi trước nhóm không còn bánh dư.','O(batchSize·product(count+1))','O(product(count+1))',{focus:['counts','state','remainder','value','answer']});
add(1816,'Truncate Sentence','string',['Hello how are you Contestant',4],'Hello how are you',`
class Solution:
    def truncateSentence(self, s, k):
        words = s.split()
        selected = words[:k]
        return ' '.join(selected)
`,'Tách thành từ, lấy đúng k từ đầu và nối lại bằng một dấu cách giữa các từ.','O(n)','O(n)');
add(1817,'Finding the Users Active Minutes','array',[[[0,5],[1,2],[0,2],[0,5],[1,3]],5],[0,2,0,0,0],`
class Solution:
    def findingUsersActiveMinutes(self, logs, k):
        minutes = {}
        for user,time in logs:
            minutes.setdefault(user,set()).add(time)
        answer = [0]*k
        for times in minutes.values():
            answer[len(times)-1] += 1
        return answer
`,'UAM là số phút khác nhau có hoạt động, không phải số dòng log. Dùng set theo user rồi tạo histogram: ô j-1 đếm người có đúng j phút.','O(logs+k)','O(logs+k)');
add(1818,'Minimum Absolute Sum Difference','search',[[1,7,5],[2,3,5]],3,`
class Solution:
    def minAbsoluteSumDiff(self, nums1, nums2):
        from bisect import bisect_left
        ordered = sorted(nums1)
        total,saving = 0,0
        for a,b in zip(nums1,nums2):
            old = abs(a-b)
            total += old
            position = bisect_left(ordered,b)
            for i in (position-1,position):
                if 0 <= i < len(ordered):
                    saving = max(saving,old-abs(ordered[i]-b))
        return (total-saving)%1000000007
`,'Chỉ được thay tối đa một ô bằng giá trị đã có trong nums1. Với mỗi b, tìm hai hàng xóm gần b trong mảng sắp xếp để tính mức tiết kiệm tốt nhất; trừ đúng một lần.','O(n log n)','O(n)');
add(1819,'Number of Different Subsequences GCDs','math',[[6,10,3]],5,`
class Solution:
    def countDifferentSubsequenceGCDs(self, nums):
        import math
        present,maximum = set(nums),max(nums)
        assert maximum <= 100
        answer = 0
        for candidate in range(1,maximum+1):
            common = 0
            for multiple in range(candidate,maximum+1,candidate):
                if multiple in present:
                    common = math.gcd(common,multiple)
            if common == candidate:
                answer += 1
        return answer
`,'GCD bằng g chỉ có thể tạo từ các số là bội của g. Lấy GCD tất cả các bội có trong mảng; nếu kết quả đúng g thì tồn tại dãy con cần tìm. Giới hạn hình: giá trị ≤100.','O(max·log max)','O(max)');
add(1820,'Maximum Number of Accepted Invitations','graph',[[[1,1,1],[1,0,1],[0,0,1]]],3,`
class Solution:
    def maximumInvitations(self, grid):
        partner = [-1]*len(grid[0])
        def match(boy,seen):
            for girl,allowed in enumerate(grid[boy]):
                if allowed and girl not in seen:
                    seen.add(girl)
                    if partner[girl] == -1 or match(partner[girl],seen):
                        partner[girl] = boy
                        return True
            return False
        answer = 0
        for boy in range(len(grid)):
            answer += match(boy,set())
        return answer
`,'Tìm ghép cặp hai phía. Nếu cô gái đã có người ghép, thử chuyển người đó sang lựa chọn khác để mở đường tăng thêm một cặp; seen ngăn vòng lặp trong mỗi lần tìm.','O(boys·edges)','O(boys+girls)',{focus:['grid','partner','boy','girl','seen','answer']});
add(1821,'Find Customers With Positive Revenue this Year','sql',[[{customer_id:1,year:2021,revenue:10},{customer_id:2,year:2021,revenue:0},{customer_id:3,year:2020,revenue:20}]],[{customer_id:1}],`
class Solution:
    def positiveCustomers(self, customers):
        return [{'customer_id':row['customer_id']} for row in customers if row['year'] == 2021 and row['revenue'] > 0]
`,'Lọc đúng năm 2021 và revenue dương. Doanh thu 0 hoặc doanh thu dương ở năm khác đều không được chọn.','O(rows)','O(result)');
add(1822,'Sign of the Product of an Array','math',[[-1,-2,-3,-4,3,2,1]],1,`
class Solution:
    def arraySign(self, nums):
        sign = 1
        for value in nums:
            if value == 0:
                return 0
            if value < 0:
                sign = -sign
        return sign
`,'Không cần nhân các số lớn: số âm chỉ đảo dấu, số dương giữ dấu, và có số 0 thì tích bằng 0 ngay.','O(n)','O(1)');
add(1825,'Finding MK Average','design',[3,1,[['addElement',3],['addElement',1],['calculateMKAverage'],['addElement',10],['calculateMKAverage']]],[null,null,-1,null,3],`
class Solution:
    def mkAverage(self, m, k, operations):
        assert m > 2*k
        window,answer = [],[]
        for operation in operations:
            result = None
            if operation[0] == 'addElement':
                window.append(operation[1])
                if len(window) > m:
                    window.pop(0)
            elif len(window) < m:
                result = -1
            else:
                ordered = sorted(window)
                selected = ordered[k:m-k]
                result = sum(selected)//len(selected)
            answer.append(result)
        return answer
`,'Chỉ giữ m phần tử mới nhất. Khi đủ dữ liệu, bỏ k số nhỏ nhất và k số lớn nhất, lấy trung bình phần giữa và làm tròn xuống; chưa đủ m trả -1.','O(operations·m log m)','O(m+operations)',{focus:['window','ordered','selected','answer']});
add(1826,'Faulty Sensor','array',[[2,3,4,5],[2,1,3,4]],1,`
class Solution:
    def badSensor(self, sensor1, sensor2):
        i = 0
        while i < len(sensor1) and sensor1[i] == sensor2[i]:
            i += 1
        if i >= len(sensor1)-1:
            return -1
        firstBad = sensor1[i:-1] == sensor2[i+1:]
        secondBad = sensor2[i:-1] == sensor1[i+1:]
        if firstBad == secondBad:
            return -1
        return 1 if firstBad else 2
`,'Tìm điểm lệch đầu tiên. Cảm biến lỗi làm rơi một giá trị nên phần sau bị dịch trái một ô và ô cuối là ngẫu nhiên; thử hai giả thuyết, nếu đều hợp hoặc đều sai thì không xác định được.','O(n)','O(n)');
add(1827,'Minimum Operations to Make the Array Increasing','greedy',[[1,1,1]],3,`
class Solution:
    def minOperations(self, nums):
        previous,answer = nums[0],0
        for value in nums[1:]:
            needed = max(value,previous+1)
            answer += needed-value
            previous = needed
        return answer
`,'Từ trái sang phải, ô mới nhỏ nhất được phép là previous+1. Chỉ tăng lên mức tối thiểu này để không tạo thêm chi phí cho các ô sau.','O(n)','O(n)');
add(1828,'Queries on Number of Points Inside a Circle','math',[[[1,3],[3,3],[5,3],[2,2]],[[2,3,1],[4,3,1],[1,1,2]]],[3,2,2],`
class Solution:
    def countPoints(self, points, queries):
        answer = []
        for x,y,radius in queries:
            count = 0
            for px,py in points:
                count += (px-x)**2+(py-y)**2 <= radius*radius
            answer.append(count)
        return answer
`,'So bình phương khoảng cách với radius² để tránh căn bậc hai. Điểm trên đường tròn được tính vì điều kiện là ≤.','O(points·queries)','O(queries)');
add(1829,'Maximum XOR for Each Query','bits',[[0,1,1,3],2],[0,3,2,3],`
class Solution:
    def getMaximumXor(self, nums, maximumBit):
        xor = 0
        for value in nums:
            xor ^= value
        mask,answer = (1<<maximumBit)-1,[]
        for value in reversed(nums):
            answer.append(xor^mask)
            xor ^= value
        return answer
`,'Muốn XOR lớn nhất trong maximumBit bit thì chọn k là phần bù các bit của XOR hiện tại. Sau mỗi query bỏ số cuối bằng XOR lại chính nó.','O(n)','O(n)');
add(1830,'Minimum Number of Operations to Make String Sorted','math',['cba'],5,`
class Solution:
    def makeStringSorted(self, s):
        from collections import Counter
        from math import factorial
        counts,answer = Counter(s),0
        for i,char in enumerate(s):
            for smaller in sorted(counts):
                if smaller < char and counts[smaller]:
                    counts[smaller] -= 1
                    permutations = factorial(len(s)-i-1)
                    for count in counts.values():
                        permutations //= factorial(count)
                    answer += permutations
                    counts[smaller] += 1
            counts[char] -= 1
        return answer%1000000007
`,'Mỗi thao tác tạo hoán vị liền trước, nên số thao tác là thứ hạng từ điển của s trong các hoán vị phân biệt. Với từng prefix, đếm các cách chọn chữ nhỏ hơn bằng công thức đa thức giai thừa.','O(n·alphabet²) big-integer arithmetic','O(alphabet)',{focus:['s','i','char','counts','permutations','answer']});
add(1831,'Maximum Transaction Each Day','sql',[[{transaction_id:1,day:'2021-01-01 10:00',amount:10},{transaction_id:2,day:'2021-01-01 11:00',amount:20}]],[{transaction_id:2}],`
class Solution:
    def maximumTransactions(self, transactions):
        maximum = {}
        for row in transactions:
            day = row['day'][:10]
            maximum[day] = max(maximum.get(day,0),row['amount'])
        return [{'transaction_id':r['transaction_id']} for r in sorted(transactions,key=lambda r:r['transaction_id']) if r['amount'] == maximum[r['day'][:10]]]
`,'Chỉ nhóm theo phần ngày, bỏ giờ. Tìm amount lớn nhất mỗi ngày rồi giữ mọi giao dịch đồng hạng; cuối cùng xếp transaction_id tăng dần.','O(rows log rows)','O(days)');
add(1832,'Check if the Sentence Is Pangram','string',['thequickbrownfoxjumpsoverthelazydog'],true,`
class Solution:
    def checkIfPangram(self, sentence):
        seen = set()
        for char in sentence:
            seen.add(char)
        return len(seen) == 26
`,'Đề chỉ dùng chữ thường tiếng Anh. Pangram phải có đủ 26 chữ khác nhau; số lần lặp của mỗi chữ không quan trọng.','O(n)','O(26)');
add(1833,'Maximum Ice Cream Bars','greedy',[[1,3,2,4,1],7],4,`
class Solution:
    def maxIceCream(self, costs, coins):
        answer = 0
        for cost in sorted(costs):
            if cost > coins:
                break
            coins -= cost
            answer += 1
        return answer
`,'Muốn mua nhiều cây nhất thì chọn giá rẻ trước. Khi giá nhỏ nhất còn lại đã vượt tiền, mọi cây sau đều không mua được nữa.','O(n log n)','O(n)');
add(1835,'Find XOR Sum of All Pairs Bitwise AND','bits',[[1,2,3],[6,5]],0,`
class Solution:
    def getXORSum(self, arr1, arr2):
        first,second = 0,0
        for value in arr1:
            first ^= value
        for value in arr2:
            second ^= value
        return first&second
`,'AND phân phối qua XOR ở từng bit. XOR của mọi cặp AND bằng (XOR arr1) AND (XOR arr2), nên không cần tạo tích Descartes.','O(n+m)','O(1)');
add(1836,'Remove Duplicates From an Unsorted Linked List','list',[[1,2,3,2]], [1,3],`
class Solution:
    def deleteDuplicatesUnsorted(self, head):
        from collections import Counter
        counts,node = Counter(),head
        while node:
            counts[node.val] += 1
            node = node.next
        dummy = tail = ListNode(0)
        node = head
        while node:
            following = node.next
            if counts[node.val] == 1:
                tail.next = node
                tail = node
            node = following
        tail.next = None
        return dummy.next
`,'Đếm toàn danh sách trước, rồi nối lại chỉ các node có giá trị xuất hiện đúng một lần. Giá trị trùng bị xóa hết; ngắt tail.next ở cuối để không kéo theo node bị bỏ.','O(n)','O(n)',{kinds:['list'],answerKind:'list',focus:['counts','node','tail','following']});
add(1837,'Sum of Digits in Base K','math',[34,6],9,`
class Solution:
    def sumBase(self, n, k):
        answer = 0
        while n:
            n,digit = divmod(n,k)
            answer += digit
        return answer
`,'Phần dư khi chia k là chữ số thấp nhất ở cơ số k. Cộng phần dư rồi tiếp tục với thương cho tới khi hết chữ số.','O(log_k n)','O(1)');
add(1839,'Longest Substring Of All Vowels in Order','string',['aeiaaioaaaaeiiiiouuuooaauuaeiu'],13,`
class Solution:
    def longestBeautifulSubstring(self, word):
        length,kinds,answer = 0,0,0
        previous = ''
        for char in word:
            if char < previous:
                length,kinds = 0,0
            length += 1
            if char != previous or length == 1:
                kinds += 1
            if kinds == 5:
                answer = max(answer,length)
            previous = char
        return answer
`,'Một đoạn đẹp phải không giảm theo a,e,i,o,u và có đủ năm loại. Gặp chữ nhỏ hơn chữ trước thì bắt đầu đoạn mới; đếm lần chuyển loại để biết đã đủ 5 chưa.','O(n)','O(1)');
add(1840,'Maximum Building Height','greedy',[5,[[2,1],[4,1]]],2,`
class Solution:
    def maxBuilding(self, n, restrictions):
        limits = {1:0,n:n-1}
        for position,height in restrictions:
            limits[position] = min(limits.get(position,height),height)
        points = [list(pair) for pair in sorted(limits.items())]
        for i in range(1,len(points)):
            points[i][1] = min(points[i][1],points[i-1][1]+points[i][0]-points[i-1][0])
        for i in range(len(points)-2,-1,-1):
            points[i][1] = min(points[i][1],points[i+1][1]+points[i+1][0]-points[i][0])
        answer = 0
        for (a,h1),(b,h2) in zip(points,points[1:]):
            peak = (h1+h2+b-a)//2
            answer = max(answer,peak)
        return answer
`,'Siết chiều cao giới hạn từ trái và từ phải vì mỗi bước chỉ thay đổi tối đa 1. Giữa hai mốc, đỉnh cao nhất là giao hai dốc tăng/giảm, bằng floor((h1+h2+distance)/2).','O(r log r)','O(r)',{focus:['points','a','b','h1','h2','peak']});
add(1841,'League Statistics','sql',[[{team_id:1,team_name:'A'},{team_id:2,team_name:'B'}],[{home_team_id:1,away_team_id:2,home_team_goals:2,away_team_goals:1}]],[{team_name:'A',matches_played:1,points:3,goal_for:2,goal_against:1,goal_diff:1},{team_name:'B',matches_played:1,points:0,goal_for:1,goal_against:2,goal_diff:-1}],`
class Solution:
    def leagueStatistics(self, teams, matches):
        stats = {t['team_id']:{'team_name':t['team_name'],'matches_played':0,'points':0,'goal_for':0,'goal_against':0,'goal_diff':0} for t in teams}
        for match in matches:
            for side,other in (('home','away'),('away','home')):
                row = stats[match[side+'_team_id']]
                scored,conceded = match[side+'_team_goals'],match[other+'_team_goals']
                row['matches_played'] += 1
                row['points'] += 3 if scored > conceded else int(scored == conceded)
                row['goal_for'] += scored
                row['goal_against'] += conceded
                row['goal_diff'] += scored-conceded
        return sorted(stats.values(),key=lambda r:(-r['points'],-r['goal_diff'],r['team_name']))
`,'Mỗi trận tạo đóng góp cho cả đội nhà và khách: thắng 3, hòa 1, thua 0. Giữ cả đội chưa đấu; xếp điểm giảm, hiệu số giảm, rồi tên tăng.','O(matches+teams log teams)','O(teams)');
add(1842,'Next Palindrome Using Same Digits','string',['1221'],'2112',`
class Solution:
    def nextPalindrome(self, num):
        half = list(num[:len(num)//2])
        i = len(half)-2
        while i >= 0 and half[i] >= half[i+1]:
            i -= 1
        if i < 0:
            return ''
        j = len(half)-1
        while half[j] <= half[i]:
            j -= 1
        half[i],half[j] = half[j],half[i]
        half[i+1:] = reversed(half[i+1:])
        middle = num[len(num)//2] if len(num)%2 else ''
        return ''.join(half)+middle+''.join(reversed(half))
`,'Đầu vào đã là palindrome nên chỉ cần tìm next permutation của nửa trái. Giữ chữ giữa nếu có và phản chiếu lại; nếu nửa trái đã lớn nhất thì không có đáp án.','O(n)','O(n)',{focus:['half','i','j','middle']});
add(1843,'Suspicious Bank Accounts','sql',[[{account_id:1,max_income:100}],[{account_id:1,type:'Creditor',amount:101,day:'2021-01-01'},{account_id:1,type:'Creditor',amount:120,day:'2021-02-01'}]],[{account_id:1}],`
class Solution:
    def suspiciousAccounts(self, accounts, transactions):
        limit = {a['account_id']:a['max_income'] for a in accounts}
        totals = {}
        for transaction in transactions:
            if transaction['type'] == 'Creditor':
                year,month = map(int,transaction['day'][:7].split('-'))
                key = (transaction['account_id'],year*12+month)
                totals[key] = totals.get(key,0)+transaction['amount']
        excessive = {(account,month) for (account,month),amount in totals.items() if amount > limit[account]}
        flagged = {account for account,month in excessive if (account,month+1) in excessive}
        return [{'account_id':account} for account in sorted(flagged)]
`,'Chỉ cộng tiền vào Creditor theo tài khoản và tháng. Đánh dấu tháng vượt max_income rồi tìm hai tháng liên tiếp; đổi năm/tháng thành số tháng để tháng 12 nối đúng với tháng 1.','O(rows+accounts log accounts)','O(account months)');
add(1844,'Replace All Digits with Characters','string',['a1c1e1'],'abcdef',`
class Solution:
    def replaceDigits(self, s):
        chars = list(s)
        for i in range(1,len(chars),2):
            chars[i] = chr(ord(chars[i-1])+int(chars[i]))
        return ''.join(chars)
`,'Các vị trí lẻ là chữ số, cho biết dịch chữ ngay trước bao nhiêu bước trong bảng chữ cái. Thay từng ô lẻ bằng chữ đã dịch.','O(n)','O(n)');
add(1847,'Closest Room','search',[[[2,2],[1,2],[3,2]],[[3,1],[3,3],[5,2]]],[3,-1,3],`
class Solution:
    def closestRoom(self, rooms, queries):
        answer = []
        for preferred,minSize in queries:
            candidates = [identifier for identifier,size in rooms if size >= minSize]
            chosen = min(candidates,key=lambda identifier:(abs(identifier-preferred),identifier)) if candidates else -1
            answer.append(chosen)
        return answer
`,'Lọc phòng đủ minSize trước, rồi so cặp (khoảng cách tới preferred,ID). Nhờ khóa thứ hai, hòa khoảng cách chọn ID nhỏ hơn. Bản hình quét phòng trực tiếp.','O(rooms·queries)','O(rooms+queries)');
add(1848,'Minimum Distance to the Target Element','array',[[1,2,3,4,5],5,3],1,`
class Solution:
    def getMinDistance(self, nums, target, start):
        answer = len(nums)
        for i,value in enumerate(nums):
            if value == target:
                answer = min(answer,abs(i-start))
        return answer
`,'Chỉ số chứa target mới là ứng viên. Khoảng cách là số bước trên chỉ số, |i-start|, không phải hiệu giá trị các phần tử.','O(n)','O(1)');
add(1849,'Splitting a String Into Descending Consecutive Values','backtracking',['050043'],true,`
class Solution:
    def splitString(self, s):
        def visit(start,previous,parts):
            if start == len(s):
                return parts >= 2
            value = 0
            for end in range(start,len(s)):
                value = value*10+int(s[end])
                if previous is not None and value > previous-1:
                    break
                if previous is None or value == previous-1:
                    if visit(end+1,value,parts+1):
                        return True
            return False
        return visit(0,None,0)
`,'Thử mọi điểm cắt, cho phép số 0 ở đầu đoạn. Mỗi giá trị sau phải đúng previous-1; nếu đã lớn hơn thì kéo dài thêm cũng không cứu được. Cần ít nhất hai đoạn.','O(2^n)','O(n)');
add(1850,'Minimum Adjacent Swaps to Reach the Kth Smallest Number','array',['5489355142',4],2,`
class Solution:
    def getMinSwaps(self, num, k):
        target = list(num)
        for step in range(k):
            i = len(target)-2
            while target[i] >= target[i+1]:
                i -= 1
            j = len(target)-1
            while target[j] <= target[i]:
                j -= 1
            target[i],target[j] = target[j],target[i]
            target[i+1:] = reversed(target[i+1:])
        current,answer = list(num),0
        for i,char in enumerate(target):
            j = current.index(char,i)
            while j > i:
                current[j],current[j-1] = current[j-1],current[j]
                answer += 1
                j -= 1
        return answer
`,'Tạo hoán vị lớn kế tiếp k lần để có đích. Sau đó đi từng ô từ trái: kéo lần xuất hiện gần nhất của chữ cần về ô i bằng swap kề, cố định prefix đã đúng.','O(kn+n²)','O(n)',{focus:['current','target','i','j','answer']});
add(1852,'Distinct Numbers in Each Subarray','sliding',[[1,2,3,2,2,1,3],3],[3,2,2,2,3],`
class Solution:
    def distinctNumbers(self, nums, k):
        counts,answer = {},[]
        for i,value in enumerate(nums):
            counts[value] = counts.get(value,0)+1
            if i >= k:
                old = nums[i-k]
                counts[old] -= 1
                if counts[old] == 0:
                    del counts[old]
            if i >= k-1:
                answer.append(len(counts))
        return answer
`,'Cửa sổ cố định k ô: thêm ô mới, bỏ ô ra khỏi cửa sổ và xóa khóa khi tần suất về 0. Số khóa còn lại là số giá trị khác nhau.','O(n)','O(k)');
add(1853,'Convert Date Format','sql',[[{day:'2022-04-12'}]],[{day:'Tuesday, April 12, 2022'}],`
class Solution:
    def convertDates(self, days):
        from datetime import date
        weekdays = 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split()
        months = 'January February March April May June July August September October November December'.split()
        answer = []
        for row in days:
            value = date.fromisoformat(row['day'])
            text = weekdays[value.weekday()]+', '+months[value.month-1]+' '+str(value.day)+', '+str(value.year)
            answer.append({'day':text})
        return answer
`,'Đọc ngày ISO để tính đúng thứ, rồi ghép tên thứ, tên tháng, ngày không thêm 0 và năm. Tên tiếng Anh được cố định để không phụ thuộc ngôn ngữ hệ thống.','O(rows)','O(result)');
add(1858,'Longest Word With All Prefixes','string',[[ 'k','ki','kir','kira','kiran' ]],'kiran',`
class Solution:
    def longestWord(self, words):
        present = set(words)
        answer = ''
        for word in sorted(words):
            valid = all(word[:length] in present for length in range(1,len(word)+1))
            if valid and len(word) > len(answer):
                answer = word
        return answer
`,'Một từ hợp lệ phải có tất cả prefix không rỗng trong danh sách. Duyệt theo từ điển và chỉ cập nhật khi dài hơn để hòa độ dài giữ từ nhỏ nhất.','O(total prefix characters+words log words)','O(words)');
add(1859,'Sorting the Sentence','string',['is2 sentence4 This1 a3'],'This is a sentence',`
class Solution:
    def sortSentence(self, s):
        words = s.split()
        answer = ['']*len(words)
        for word in words:
            position = int(word[-1])-1
            answer[position] = word[:-1]
        return ' '.join(answer)
`,'Chữ số cuối từ là thứ tự từ 1. Đặt phần chữ vào ô position-1 rồi nối mảng theo thứ tự.','O(n)','O(n)');
add(1860,'Incremental Memory Leak','array',[2,2],[3,1,0],`
class Solution:
    def memLeak(self, memory1, memory2):
        second = 1
        while max(memory1,memory2) >= second:
            if memory1 >= memory2:
                memory1 -= second
            else:
                memory2 -= second
            second += 1
        return [second,memory1,memory2]
`,'Ở giây t cần lấy t bộ nhớ từ thanh còn nhiều hơn; hòa thì chọn thanh 1. Không đủ ở cả hai thanh thì dừng và trả giây lỗi cùng dung lượng còn lại.','O(sqrt total memory)','O(1)');
add(1861,'Rotating the Box','array',[[['#','.','*','.'],['#','#','*','.']]],[['#','.'],['#','#'],['*','*'],['.','.']],`
class Solution:
    def rotateTheBox(self, box):
        grid = [row[:] for row in box]
        rows,cols = len(grid),len(grid[0])
        for r in range(rows):
            write = cols-1
            for c in range(cols-1,-1,-1):
                if grid[r][c] == '*':
                    write = c-1
                elif grid[r][c] == '#':
                    grid[r][c] = '.'
                    grid[r][write] = '#'
                    write -= 1
        answer = [[grid[rows-1-r][c] for r in range(rows)] for c in range(cols)]
        return answer
`,'Trước khi quay 90° theo chiều kim đồng hồ, mô phỏng đá dồn sang phải trong mỗi hàng. Vật cản * đặt lại vị trí write; sau đó ánh xạ hàng/cột sang ma trận đã quay.','O(rows·cols)','O(rows·cols)',{focus:['grid','r','c','write','answer']});
add(1862,'Sum of Floored Pairs','math',[[2,5,9]],10,`
class Solution:
    def sumOfFlooredPairs(self, nums):
        answer = 0
        for numerator in nums:
            for denominator in nums:
                answer = (answer+numerator//denominator)%1000000007
        return answer
`,'Bản trực quan duyệt các cặp có thứ tự, kể cả một ô ghép với chính nó. Mỗi cặp đóng góp floor(numerator/denominator); đảo cặp thường cho giá trị khác.','O(n²)','O(1)');
add(1863,'Sum of All Subset XOR Totals','bits',[[1,3]],6,`
class Solution:
    def subsetXORSum(self, nums):
        totals = [0]
        for value in nums:
            totals += [old^value for old in totals]
        return sum(totals)
`,'Bắt đầu với tập rỗng XOR=0. Mỗi số nhân đôi danh sách tập con: một nửa không lấy số đó, một nửa lấy và XOR thêm số đó.','O(2^n)','O(2^n)',{focus:['nums','value','totals']});
add(1864,'Minimum Number of Swaps to Make the Binary String Alternating','string',['111000'],1,`
class Solution:
    def minSwaps(self, s):
        answer = float('inf')
        for start in (0,1):
            target = ''.join(str((start+i)%2) for i in range(len(s)))
            if target.count('1') == s.count('1'):
                mismatches = sum(a != b for a,b in zip(s,target))
                answer = min(answer,mismatches//2)
        return -1 if answer == float('inf') else answer
`,'Thử hai mẫu xen kẽ. Swap không đổi số 1 nên loại mẫu khác tần suất; mỗi swap ghép một ô sai 0 với một ô sai 1 và sửa đúng hai lỗi.','O(n)','O(n)');
add(1865,'Finding Pairs With a Certain Sum','design',[[1,1,2],[1,2,3],[['count',4],['add',1,2],['count',4]]],[3,null,2],`
class Solution:
    def findSumPairs(self, nums1, nums2, operations):
        from collections import Counter
        first,second,answer = nums1[:],nums2[:],[]
        counts = Counter(second)
        for operation in operations:
            if operation[0] == 'add':
                index,value = operation[1:]
                counts[second[index]] -= 1
                second[index] += value
                counts[second[index]] += 1
                answer.append(None)
            else:
                total = operation[1]
                answer.append(sum(counts[total-value] for value in first))
        return answer
`,'nums1 cố định, nums2 được cập nhật. Counter của nums2 giúp count(total) tìm phần bù cho từng số nums1; add phải giảm tần suất cũ trước khi tăng giá trị mới.','O(nums2+queries·nums1)','O(nums1+nums2)',{focus:['second','counts','operation','answer']});
add(1866,'Number of Ways to Rearrange Sticks With K Sticks Visible','dp',[3,2],3,`
class Solution:
    def rearrangeSticks(self, n, k):
        dp = [[0]*(k+1) for _ in range(n+1)]
        dp[0][0] = 1
        for count in range(1,n+1):
            for visible in range(1,min(count,k)+1):
                dp[count][visible] = (dp[count-1][visible-1]+(count-1)*dp[count-1][visible])%1000000007
        return dp[n][k]
`,'Thêm cây ngắn nhất: đặt đầu thì nó được thấy và tăng visible, đặt vào một trong count-1 vị trí còn lại thì bị che. Cộng hai trường hợp không giao nhau.','O(nk)','O(nk)');
add(1867,'Orders With Maximum Quantity Above Average','sql',[[{order_id:1,product_id:1,quantity:10},{order_id:1,product_id:2,quantity:2},{order_id:2,product_id:1,quantity:7}]],[{order_id:1}],`
class Solution:
    def aboveAverage(self, ordersDetails):
        groups = {}
        for row in ordersDetails:
            groups.setdefault(row['order_id'],[]).append(row['quantity'])
        threshold = max(sum(values)/len(values) for values in groups.values())
        return [{'order_id':order} for order,values in sorted(groups.items()) if max(values) > threshold]
`,'Tính trung bình quantity cho từng đơn, rồi lấy lớn nhất của các trung bình làm ngưỡng chung. Chọn đơn có quantity lớn nhất của nó vượt ngưỡng đó.','O(rows+orders log orders)','O(rows)');
add(1868,'Product of Two Run-Length Encoded Arrays','array',[[[1,3],[2,3]],[[6,3],[3,3]]],[[6,6]],`
class Solution:
    def findRLEArray(self, encoded1, encoded2):
        a,b = [pair[:] for pair in encoded1],[pair[:] for pair in encoded2]
        i,j,answer = 0,0,[]
        while i < len(a) and j < len(b):
            count = min(a[i][1],b[j][1])
            value = a[i][0]*b[j][0]
            if answer and answer[-1][0] == value:
                answer[-1][1] += count
            else:
                answer.append([value,count])
            a[i][1] -= count
            b[j][1] -= count
            i += a[i][1] == 0
            j += b[j][1] == 0
        return answer
`,'Không giải nén. Hai run chồng nhau được min(count1,count2) ô cùng tích; giảm số lượng đã dùng rồi chuyển con trỏ. Gộp các run tích bằng nhau liền kề.','O(runs1+runs2)','O(result)',{focus:['a','b','i','j','count','answer']});
add(1869,'Longer Contiguous Segments of Ones than Zeros','string',['1101'],true,`
class Solution:
    def checkZeroOnes(self, s):
        longest,run,previous = [0,0],0,''
        for char in s:
            run = run+1 if char == previous else 1
            longest[int(char)] = max(longest[int(char)],run)
            previous = char
        return longest[1] > longest[0]
`,'Đếm độ dài run hiện tại và giữ cực đại riêng cho 0 và 1. Kết quả cần run 1 lớn hơn nghiêm ngặt run 0.','O(n)','O(1)');
add(1870,'Minimum Speed to Arrive on Time','search',[[1,3,2],2.7],3,`
class Solution:
    def minSpeedOnTime(self, dist, hour):
        from fractions import Fraction
        allowed = Fraction(str(hour))
        if allowed <= len(dist)-1:
            return -1
        left,right = 1,10000000
        while left < right:
            mid = (left+right)//2
            time = sum((distance+mid-1)//mid for distance in dist[:-1])+Fraction(dist[-1],mid)
            if time <= allowed:
                right = mid
            else:
                left = mid+1
        return left
`,'Các chặng trừ chặng cuối phải chờ giờ nguyên nên làm tròn lên. Chặng cuối giữ thời gian phân số; tìm nhị phân vận tốc nhỏ nhất không vượt giờ cho phép.','O(n log 10^7)','O(1)');
add(1871,'Jump Game VII','sliding',['011010',2,3],true,`
class Solution:
    def canReach(self, s, minJump, maxJump):
        reachable = [False]*len(s)
        reachable[0] = True
        active = 0
        for i in range(1,len(s)):
            if i >= minJump:
                active += reachable[i-minJump]
            if i > maxJump:
                active -= reachable[i-maxJump-1]
            reachable[i] = s[i] == '0' and active > 0
        return reachable[-1]
`,'Ô i tới được khi s[i]=0 và có ít nhất một ô tới được trong [i-maxJump,i-minJump]. Bộ đếm active trượt cửa sổ này trong O(1) mỗi ô.','O(n)','O(n)',{focus:['s','reachable','i','active']});
add(1873,'Calculate Special Bonus','sql',[[{employee_id:1,name:'Ada',salary:100},{employee_id:3,name:'Mike',salary:200}]],[{employee_id:1,bonus:100},{employee_id:3,bonus:0}],`
class Solution:
    def specialBonus(self, employees):
        answer = []
        for employee in sorted(employees,key=lambda e:e['employee_id']):
            eligible = employee['employee_id']%2 == 1 and not employee['name'].startswith('M')
            answer.append({'employee_id':employee['employee_id'],'bonus':employee['salary'] if eligible else 0})
        return answer
`,'ID lẻ và tên không bắt đầu bằng M mới nhận toàn bộ lương làm bonus. Vẫn trả hàng cho người không đủ điều kiện với bonus=0.','O(employees log employees)','O(result)');
add(1874,'Minimize Product Sum of Two Arrays','greedy',[[5,3,4,2],[4,2,2,5]],40,`
class Solution:
    def minProductSum(self, nums1, nums2):
        first,second = sorted(nums1),sorted(nums2,reverse=True)
        answer = 0
        for a,b in zip(first,second):
            answer += a*b
        return answer
`,'Ghép số nhỏ nhất của một mảng với số lớn nhất của mảng kia. Hai thứ tự đối nhau cho tổng tích nhỏ nhất theo bất đẳng thức sắp xếp.','O(n log n)','O(n)');
add(1875,'Group Employees of the Same Salary','sql',[[{employee_id:1,name:'A',salary:10},{employee_id:2,name:'B',salary:10},{employee_id:3,name:'C',salary:20}]],[{employee_id:1,name:'A',salary:10,team_id:1},{employee_id:2,name:'B',salary:10,team_id:1}],`
class Solution:
    def salaryTeams(self, employees):
        from collections import Counter
        counts = Counter(e['salary'] for e in employees)
        salaries = sorted(salary for salary,count in counts.items() if count > 1)
        teams = {salary:i+1 for i,salary in enumerate(salaries)}
        selected = [dict(e,team_id=teams[e['salary']]) for e in employees if e['salary'] in teams]
        return sorted(selected,key=lambda e:(e['team_id'],e['employee_id']))
`,'Loại mức lương chỉ có một người. Đánh số team liên tục theo mức lương tăng dần còn lại; trong team xếp employee_id tăng dần.','O(employees log employees)','O(employees)');
add(1877,'Minimize Maximum Pair Sum in Array','greedy',[[3,5,2,3]],7,`
class Solution:
    def minPairSum(self, nums):
        ordered,answer = sorted(nums),0
        for i in range(len(nums)//2):
            pairSum = ordered[i]+ordered[-1-i]
            answer = max(answer,pairSum)
        return answer
`,'Ghép nhỏ nhất với lớn nhất để cân bằng tổng các cặp. Đáp án là tổng lớn nhất trong cách ghép hai đầu này.','O(n log n)','O(n)');
add(1878,'Get Biggest Three Rhombus Sums in a Grid','array',[[[1,2,3],[4,5,6],[7,8,9]]],[20,9,8],`
class Solution:
    def getBiggestThree(self, grid):
        rows,cols = len(grid),len(grid[0])
        sums = set(value for row in grid for value in row)
        for r in range(rows):
            for c in range(cols):
                for size in range(1,min((rows-1-r)//2,c,cols-1-c)+1):
                    total = 0
                    for offset in range(size):
                        total += grid[r+offset][c+offset]+grid[r+size+offset][c+size-offset]
                        total += grid[r+2*size-offset][c-offset]+grid[r+size-offset][c-size+offset]
                    sums.add(total)
        return sorted(sums,reverse=True)[:3]
`,'Hình thoi kích thước 0 là một ô. Với mỗi đỉnh trên và kích thước lớn hơn, đi bốn cạnh, mỗi cạnh lấy size ô để bốn đỉnh không bị đếm hai lần; lấy ba tổng khác nhau lớn nhất.','O(rows·cols·min(rows,cols)²)','O(number of rhombi)',{focus:['grid','r','c','size','offset','sums']});
add(1880,'Check if Word Equals Summation of Two Words','string',['acb','cba','cdb'],true,`
class Solution:
    def isSumEqual(self, firstWord, secondWord, targetWord):
        def number(word):
            value = 0
            for char in word:
                value = value*10+ord(char)-ord('a')
            return value
        first,second,target = number(firstWord),number(secondWord),number(targetWord)
        return first+second == target
`,'a..j ánh xạ thành chữ số 0..9. Ghép giá trị như số thập phân, giữ quy tắc nhân 10 rồi thêm chữ số; so tổng hai từ với từ đích.','O(total characters)','O(1)');
add(1881,'Maximum Value after Insertion','greedy',['99',9],'999',`
class Solution:
    def maxValue(self, n, x):
        negative = n[0] == '-'
        start = 1 if negative else 0
        for i in range(start,len(n)):
            better = int(n[i]) > x if negative else int(n[i]) < x
            if better:
                return n[:i]+str(x)+n[i:]
        return n+str(x)
`,'Số dương: chèn trước chữ số đầu nhỏ hơn x để tăng sớm nhất. Số âm: chèn trước chữ số đầu lớn hơn x để giảm độ lớn tuyệt đối; không chèn trước dấu trừ.','O(digits)','O(digits)');
add(1883,'Minimum Skips to Arrive at Meeting On Time','dp',[[1,3,2],4,2],1,`
class Solution:
    def minSkips(self, dist, speed, hoursBefore):
        n = len(dist)
        dp = [0]+[float('inf')]*n
        for i,distance in enumerate(dist):
            nextDp = [float('inf')]*(n+1)
            for skips in range(i+1):
                elapsed = dp[skips]+distance
                if elapsed == float('inf'):
                    continue
                rested = (elapsed+speed-1)//speed*speed if i < n-1 else elapsed
                nextDp[skips] = min(nextDp[skips],rested)
                if i < n-1:
                    nextDp[skips+1] = min(nextDp[skips+1],elapsed)
            dp = nextDp
        return next((skips for skips,time in enumerate(dp) if time <= speed*hoursBefore),-1)
`,'Đo thời gian bằng đơn vị 1/speed để dùng số nguyên. Sau mỗi chặng trừ chặng cuối, hoặc chờ tới bội tiếp theo của speed, hoặc dùng một skip và giữ nguyên elapsed.','O(n²)','O(n)',{focus:['dist','dp','nextDp','skips','elapsed']});
add(1884,'Egg Drop With 2 Eggs and N Floors','dp',[100],14,`
class Solution:
    def twoEggDrop(self, n):
        moves,covered = 0,0
        while covered < n:
            moves += 1
            covered += moves
        return moves
`,'Với m lượt và 2 trứng, có thể phủ m+(m-1)+…+1 tầng: nếu trứng đầu vỡ thì trứng còn lại thử tuyến tính phần dưới. Tìm m nhỏ nhất có tổng tam giác ≥n.','O(sqrt n)','O(1)');
add(1885,'Count Pairs in Two Arrays','array',[[2,1,2,1],[1,2,1,2]],1,`
class Solution:
    def countPairs(self, nums1, nums2):
        differences = sorted(a-b for a,b in zip(nums1,nums2))
        left,right,answer = 0,len(differences)-1,0
        while left < right:
            if differences[left]+differences[right] > 0:
                answer += right-left
                right -= 1
            else:
                left += 1
        return answer
`,'Điều kiện nums1[i]+nums1[j]>nums2[i]+nums2[j] thành diff[i]+diff[j]>0. Sau sắp xếp, nếu hai đầu dương thì mọi vị trí từ left đến right-1 đều ghép được với right.','O(n log n)','O(n)');
add(1887,'Reduction Operations to Make the Array Elements Equal','array',[[5,1,3]],3,`
class Solution:
    def reductionOperations(self, nums):
        ordered = sorted(nums)
        levels,answer = 0,0
        for i in range(1,len(ordered)):
            if ordered[i] != ordered[i-1]:
                levels += 1
            answer += levels
        return answer
`,'Một thao tác giảm một phần tử xuống mức giá trị phân biệt ngay dưới nó. Mỗi ô cần số bước bằng số mức nhỏ hơn nó; quét tăng dần để đếm mức.','O(n log n)','O(n)');
add(1888,'Minimum Number of Flips to Make the Binary String Alternating','sliding',['111000'],2,`
class Solution:
    def minFlips(self, s):
        n = len(s)
        doubled = s+s
        mismatch,answer = 0,n
        for right,char in enumerate(doubled):
            mismatch += char != str(right%2)
            if right >= n:
                left = right-n
                mismatch -= doubled[left] != str(left%2)
            if right >= n-1:
                answer = min(answer,mismatch,n-mismatch)
        return answer
`,'Mọi phép xoay là một cửa sổ dài n trong s+s. Đếm lỗi so với mẫu 0101… bằng cửa sổ trượt; lỗi với mẫu đối lập là n-mismatch.','O(n)','O(n)',{focus:['doubled','right','left','mismatch','answer']});
add(1889,'Minimum Space Wasted From Packaging','search',[[2,3,5],[[4,8],[2,8]]],6,`
class Solution:
    def minWastedSpace(self, packages, boxes):
        from bisect import bisect_left
        answer = float('inf')
        for supplier in boxes:
            sizes = sorted(supplier)
            waste = 0
            for package in packages:
                index = bisect_left(sizes,package)
                if index == len(sizes):
                    waste = float('inf')
                    break
                waste += sizes[index]-package
            answer = min(answer,waste)
        return -1 if answer == float('inf') else answer%1000000007
`,'Chỉ chọn một nhà cung cấp. Với mỗi kiện, tìm hộp nhỏ nhất đủ chứa bằng tìm nhị phân; nếu có kiện không vừa thì loại toàn bộ nhà cung cấp đó.','O(suppliers·packages log box types+sorting)','O(box types)');
add(1890,'The Latest Login in 2020','sql',[[{user_id:1,time_stamp:'2020-01-01 10:00:00'},{user_id:1,time_stamp:'2020-12-01 10:00:00'},{user_id:1,time_stamp:'2021-01-01 00:00:00'}]],[{user_id:1,last_stamp:'2020-12-01 10:00:00'}],`
class Solution:
    def latestLogin(self, logins):
        latest = {}
        for login in logins:
            if login['time_stamp'][:4] == '2020':
                user = login['user_id']
                latest[user] = max(latest.get(user,''),login['time_stamp'])
        return [{'user_id':user,'last_stamp':stamp} for user,stamp in sorted(latest.items())]
`,'Lọc năm 2020 trước khi lấy MAX timestamp theo user. Lần đăng nhập năm 2021 không được che mất lần cuối của năm cần tìm.','O(rows+users log users)','O(users)');
add(1891,'Cutting Ribbons','search',[[9,7,5],3],5,`
class Solution:
    def maxLength(self, ribbons, k):
        left,right = 0,max(ribbons)
        while left < right:
            mid = (left+right+1)//2
            pieces = sum(length//mid for length in ribbons)
            if pieces >= k:
                left = mid
            else:
                right = mid-1
        return left
`,'Với chiều dài mid, mỗi ruy băng cho floor(length/mid) đoạn. Nếu đủ k đoạn có thể thử dài hơn; nhị phân dùng mid lệch phải để không kẹt khi left và right kề nhau.','O(n log max)','O(1)');
add(1892,'Page Recommendations II','sql',[[{user1_id:1,user2_id:2}],[{user_id:1,page_id:10},{user_id:2,page_id:10},{user_id:2,page_id:20}]],[{user_id:1,page_id:20,friends_likes:1}],`
class Solution:
    def recommendPages(self, friendship, likes):
        friends,liked = {},{}
        for row in friendship:
            a,b = row['user1_id'],row['user2_id']
            friends.setdefault(a,set()).add(b)
            friends.setdefault(b,set()).add(a)
        for row in likes:
            liked.setdefault(row['user_id'],set()).add(row['page_id'])
        answer = []
        for user,people in sorted(friends.items()):
            counts = {}
            for friend in people:
                for page in liked.get(friend,set())-liked.get(user,set()):
                    counts[page] = counts.get(page,0)+1
            for page,count in sorted(counts.items()):
                answer.append({'user_id':user,'page_id':page,'friends_likes':count})
        return answer
`,'Tình bạn là hai chiều. Với mỗi user, gom trang bạn bè thích nhưng user chưa thích; friends_likes đếm số bạn khác nhau đã thích trang.','O(friend likes joins)','O(friendships+likes+result)',{focus:['friends','liked','counts','answer']});
add(1894,'Find the Student that Will Replace the Chalk','math',[[5,1,5],22],0,`
class Solution:
    def chalkReplacer(self, chalk, k):
        k %= sum(chalk)
        for i,need in enumerate(chalk):
            if k < need:
                return i
            k -= need
`,'Bỏ qua toàn bộ vòng đầy bằng modulo tổng phấn. Sau đó quét một vòng: người đầu tiên cần nhiều hơn lượng còn lại phải thay phấn.','O(n)','O(1)');
add(1895,'Largest Magic Square','array',[[[7,1,4,5,6],[2,5,1,6,4],[1,5,4,3,2],[1,2,7,3,4]]],3,`
class Solution:
    def largestMagicSquare(self, grid):
        rows,cols = len(grid),len(grid[0])
        for size in range(min(rows,cols),0,-1):
            for r in range(rows-size+1):
                for c in range(cols-size+1):
                    sums = [sum(grid[r+i][c:c+size]) for i in range(size)]
                    sums += [sum(grid[r+i][c+j] for i in range(size)) for j in range(size)]
                    sums += [sum(grid[r+i][c+i] for i in range(size)),sum(grid[r+i][c+size-1-i] for i in range(size))]
                    if len(set(sums)) == 1:
                        return size
`,'Thử hình vuông từ lớn xuống nhỏ. Tất cả tổng hàng, cột và hai đường chéo phải bằng nhau; nghiệm đầu tiên là kích thước lớn nhất.','O(rows·cols·min(rows,cols)³)','O(min(rows,cols))',{focus:['grid','size','r','c','sums']});
add(1896,'Minimum Cost to Change the Final Value of Expression','dp',['1&(0|1)'],1,`
class Solution:
    def minOperationsToFlip(self, expression):
        values,operators = [],[]
        def combine():
            right,left = values.pop(),values.pop()
            original = operators.pop()
            cost = [float('inf'),float('inf')]
            for operation in ('&','|'):
                for a in (0,1):
                    for b in (0,1):
                        result = a&b if operation == '&' else a|b
                        cost[result] = min(cost[result],left[a]+right[b]+int(operation != original))
            values.append(cost)
        for char in expression:
            if char in '01':
                values.append([int(char != '0'),int(char != '1')])
            elif char == '(':
                operators.append(char)
            elif char == ')':
                while operators[-1] != '(':
                    combine()
                operators.pop()
            else:
                if operators and operators[-1] != '(':
                    combine()
                operators.append(char)
        while operators:
            combine()
        return values[0][1] if values[0][0] == 0 else values[0][0]
`,'Mỗi cây con lưu [chi phí để thành 0,chi phí để thành 1]. Gộp hai con bằng cách thử cả toán tử gốc lẫn toán tử đổi với giá 1. & và | có cùng ưu tiên, xử lý trái sang phải trong ngoặc.','O(expression length)','O(expression length)',{focus:['values','operators','left','right','cost']});
add(1897,'Redistribute Characters to Make All Strings Equal','string',[[ 'abc','aabc','bc' ]],true,`
class Solution:
    def makeEqual(self, words):
        from collections import Counter
        counts = Counter(''.join(words))
        return all(count%len(words) == 0 for count in counts.values())
`,'Có thể chuyển ký tự tự do giữa các từ. Muốn các từ giống hệt nhau, tổng số lượng của mỗi chữ phải chia đều cho số từ.','O(total characters)','O(alphabet)');
add(1898,'Maximum Number of Removable Characters','search',['abcacb','ab',[3,1,0]],2,`
class Solution:
    def maximumRemovals(self, s, p, removable):
        def possible(count):
            removed = set(removable[:count])
            j = 0
            for i,char in enumerate(s):
                if i not in removed and j < len(p) and char == p[j]:
                    j += 1
            return j == len(p)
        left,right = 0,len(removable)
        while left < right:
            mid = (left+right+1)//2
            if possible(mid):
                left = mid
            else:
                right = mid-1
        return left
`,'Chỉ được bỏ prefix của removable theo đúng thứ tự. Với một số lượng thử, quét s và bỏ qua chỉ số bị xóa để kiểm tra p còn là dãy con; điều kiện đơn điệu cho phép nhị phân.','O((s+removable) log removable)','O(removable)',{focus:['removed','i','j','left','right','mid']});
add(1899,'Merge Triplets to Form Target Triplet','greedy',[[[2,5,3],[1,8,4],[1,7,5]],[2,7,5]],true,`
class Solution:
    def mergeTriplets(self, triplets, target):
        merged = [0,0,0]
        for triplet in triplets:
            if all(triplet[i] <= target[i] for i in range(3)):
                merged = [max(a,b) for a,b in zip(merged,triplet)]
        return merged == target
`,'Phép merge chỉ tăng từng tọa độ nên triplet vượt target ở bất kỳ cột nào đều không dùng được. Merge tất cả triplet an toàn rồi so với target.','O(triplets)','O(1)');
module.exports=lessons;
