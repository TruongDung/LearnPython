"use strict";
const {defineEasy}=require('./easy-lesson');
const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(701,'Insert into a Binary Search Tree','tree',[[4,2,7,1,3],5],[4,2,7,1,3,5],`
class Solution:
    def insertIntoBST(self, root, val):
        def insert(node):
            if not node:
                return TreeNode(val)
            if val < node.val:
                node.left = insert(node.left)
            else:
                node.right = insert(node.right)
            return node
        return insert(root)
`,'Giá trị nhỏ đi trái, lớn đi phải; đến nhánh rỗng thì gắn node mới.','O(h)','O(h)',{kinds:['tree'],answerKind:'tree'});
add(702,'Search in a Sorted Array of Unknown Size','search',[[-1,0,3,5,9,12],9],4,`
class Solution:
    def search(self, values, target):
        def get(index):
            return values[index] if index < len(values) else 2147483647
        left, right = 0, 1
        while get(right) < target:
            left, right = right+1, right*2
        while left <= right:
            mid = (left+right)//2
            value = get(mid)
            if value == target:
                return mid
            if value < target:
                left = mid+1
            else:
                right = mid-1
        return -1
`,'Reader mô phỏng trả số rất lớn khi vượt biên. Nhân đôi biên phải để tìm khoảng rồi tìm nhị phân.','O(log p)','O(1)',{description:'The input list models ArrayReader; the search uses get(index), with 2147483647 for out-of-bounds reads.'});
add(703,'Kth Largest Element in a Stream','design',[3,[4,5,8,2],[3,5,10,9,4]],[4,5,5,8,8],`
class Solution:
    def stream(self, k, nums, additions):
        import heapq
        assert k >= 1 and len(nums) >= k-1
        heap, answer = [], []
        for value in nums:
            heapq.heappush(heap,value)
            if len(heap) > k:
                heapq.heappop(heap)
        for value in additions:
            heapq.heappush(heap,value)
            if len(heap) > k:
                heapq.heappop(heap)
            answer.append(heap[0])
        return answer
`,'Min-heap chỉ giữ k số lớn nhất đã gặp; phần tử nhỏ nhất trong heap là số lớn thứ k.','O((n+q) log k)','O(k+q)',{focus:['heap','additions','answer']});
add(705,'Design HashSet','design',[[['add',1],['add',2],['contains',1],['contains',3],['remove',2],['contains',2]]],[null,null,true,false,null,false],`
class Solution:
    def hashSet(self, operations):
        buckets, answer = [[] for _ in range(17)], []
        for operation, key in operations:
            bucket = buckets[key%17]
            if operation == 'contains':
                answer.append(key in bucket)
            else:
                if operation == 'add' and key not in bucket:
                    bucket.append(key)
                if operation == 'remove' and key in bucket:
                    bucket.remove(key)
                answer.append(None)
        return answer
`,'key % 17 chọn ngăn; các key va chạm cùng nằm trong một danh sách. Thêm không được tạo bản sao.','O(q²) worst case','O(q)',{focus:['buckets','bucket','operations','answer']});
add(706,'Design HashMap','design',[[['put',1,1],['put',2,2],['get',1],['get',3],['put',2,1],['get',2],['remove',2],['get',2]]],[null,null,1,-1,null,1,null,-1],`
class Solution:
    def hashMap(self, operations):
        buckets, answer = [[] for _ in range(17)], []
        for operation in operations:
            command, key = operation[:2]
            bucket = buckets[key%17]
            index = next((i for i,pair in enumerate(bucket) if pair[0] == key), -1)
            if command == 'get':
                answer.append(bucket[index][1] if index >= 0 else -1)
            else:
                if index >= 0:
                    bucket.pop(index)
                if command == 'put':
                    bucket.append([key,operation[2]])
                answer.append(None)
        return answer
`,'Băm key vào ngăn, tìm đúng cặp key–value; put thay giá trị cũ, get thiếu trả −1.','O(q²) worst case','O(q)',{focus:['buckets','bucket','answer']});
add(708,'Insert into a Sorted Circular Linked List','list',[[3,4,1],2],[3,4,1,2],`
class Solution:
    def insert(self, values, insertVal):
        if not values:
            return [insertVal]
        nodes = [ListNode(v) for v in values]
        for i,node in enumerate(nodes):
            node.next = nodes[(i+1)%len(nodes)]
        head = current = nodes[0]
        while True:
            following = current.next
            ordered = current.val <= insertVal <= following.val
            wrap = current.val > following.val and (insertVal >= current.val or insertVal <= following.val)
            if ordered or wrap or following == head:
                current.next = ListNode(insertVal,following)
                break
            current = following
        answer, current = [head.val], head.next
        while current != head:
            answer.append(current.val)
            current = current.next
        return answer
`,'Chèn giữa hai số có thứ tự hoặc tại chỗ vòng từ max về min. Giữ nguyên head; hình vẽ có cạnh quay về đầu.','O(n)','O(n)',{description:'Input values start at the existing head; output follows the same head around one complete cycle.'});
add(716,'Max Stack','design',[[['push',5],['push',1],['push',5],['top'],['popMax'],['top'],['peekMax'],['pop'],['top']]],[null,null,null,5,5,1,5,1,5],`
class Solution:
    def maxStack(self, operations):
        stack, answer = [], []
        for operation in operations:
            command = operation[0]
            if command == 'push':
                stack.append(operation[1])
                answer.append(None)
            elif command == 'pop':
                answer.append(stack.pop())
            elif command == 'top':
                answer.append(stack[-1])
            elif command == 'peekMax':
                answer.append(max(stack))
            else:
                maximum = max(stack)
                index = len(stack)-1-stack[::-1].index(maximum)
                answer.append(stack.pop(index))
        return answer
`,'Stack giữ thứ tự vào; popMax xóa lần xuất hiện gần đỉnh nhất của giá trị lớn nhất.','O(q²) worst case','O(q)',{focus:['stack','operations','answer']});
add(717,'1-bit and 2-bit Characters','array',[[1,0,0]],true,`
class Solution:
    def isOneBitCharacter(self, bits):
        i = 0
        while i < len(bits)-1:
            i += 2 if bits[i] else 1
        return i == len(bits)-1
`,'Bit 0 tiêu thụ một ô; bit 1 mở đầu ký tự hai ô. Xem con trỏ có dừng đúng tại bit cuối không.','O(n)','O(1)',{difficulty:'easy'});
add(718,'Maximum Length of Repeated Subarray','dp',[[1,2,3,2,1],[3,2,1,4,7]],3,`
class Solution:
    def findLength(self, nums1, nums2):
        dp, answer = [0]*(len(nums2)+1), 0
        for i, value in enumerate(nums1):
            following = [0]*(len(nums2)+1)
            for j, other in enumerate(nums2,1):
                if value == other:
                    following[j] = dp[j-1]+1
                    answer = max(answer,following[j])
            dp = following
        return answer
`,'Hai phần tử bằng nhau thì nối thêm vào đoạn chung kết thúc ở ô chéo trước; khác nhau thì độ dài về 0.','O(mn)','O(n)',{focus:['nums1','nums2','dp','following','answer']});
add(719,'Find K-th Smallest Pair Distance','search',[[1,3,1],1],0,`
class Solution:
    def smallestDistancePair(self, nums, k):
        nums = sorted(nums)
        low, high = 0, nums[-1]-nums[0]
        while low < high:
            mid, count, left = (low+high)//2, 0, 0
            for right in range(len(nums)):
                while nums[right]-nums[left] > mid:
                    left += 1
                count += right-left
            if count >= k:
                high = mid
            else:
                low = mid+1
        return low
`,'Thử khoảng cách mid; cửa sổ đếm số cặp có khoảng cách ≤mid. Đủ k cặp thì tìm khoảng cách nhỏ hơn.','O(n log n+n log D)','O(n)');
add(722,'Remove Comments','string',[['/*Test program */','int main()','{ ','  // variable declaration ','int a, b, c;','/* This is a test','   multiline  ','   comment for ','   testing */','a = b + c;','}']],['int main()','{ ','  ','int a, b, c;','a = b + c;','}'],`
class Solution:
    def removeComments(self, source):
        block, buffer, answer = False, '', []
        for line in source:
            i = 0
            while i < len(line):
                pair = line[i:i+2]
                if block:
                    if pair == '*/':
                        block = False
                        i += 2
                    else:
                        i += 1
                elif pair == '/*':
                    block = True
                    i += 2
                elif pair == '//':
                    break
                else:
                    buffer += line[i]
                    i += 1
            if not block and buffer:
                answer.append(buffer)
                buffer = ''
        return answer
`,'block nhớ đang ở trong /*...*/ xuyên nhiều dòng; // bỏ phần còn lại của dòng. Chỉ xuất buffer khi đã ra khỏi block.','O(L)','O(L)',{focus:['source','line','buffer','answer','block']});
add(723,'Candy Crush','array',[[[1,1,1],[2,3,4],[2,3,4]]],[[0,0,0],[2,3,4],[2,3,4]],`
class Solution:
    def candyCrush(self, board):
        m, n = len(board), len(board[0])
        board = [row[:] for row in board]
        while True:
            crushed = set()
            for r in range(m):
                for c in range(n):
                    if board[r][c] and c+2 < n and board[r][c] == board[r][c+1] == board[r][c+2]:
                        crushed.update((r,c+d) for d in range(3))
                    if board[r][c] and r+2 < m and board[r][c] == board[r+1][c] == board[r+2][c]:
                        crushed.update((r+d,c) for d in range(3))
            if not crushed:
                return board
            for r,c in crushed:
                board[r][c] = 0
            for c in range(n):
                survivors = [board[r][c] for r in range(m) if board[r][c]]
                column = [0]*(m-len(survivors))+survivors
                for r in range(m):
                    board[r][c] = column[r]
`,'Đánh dấu mọi bộ 3 cùng màu trước, xóa đồng thời rồi thả kẹo xuống; lặp đến khi ổn định.','O((mn)²)','O(mn)',{focus:['board','crushed','column']});
add(724,'Find Pivot Index','array',[[1,7,3,6,5,6]],3,`
class Solution:
    def pivotIndex(self, nums):
        total, left = sum(nums), 0
        for i, value in enumerate(nums):
            right = total-left-value
            if left == right:
                return i
            left += value
        return -1
`,'Tổng bên phải = tổng cả mảng − tổng trái − số hiện tại. Trả vị trí đầu có trái = phải.','O(n)','O(1)',{difficulty:'easy'});
add(725,'Split Linked List in Parts','list',[[1,2,3,4,5,6,7,8,9,10],3],[[1,2,3,4],[5,6,7],[8,9,10]],`
class Solution:
    def splitListToParts(self, head, k):
        assert 1 <= k <= 80
        n, node = 0, head
        while node:
            n, node = n+1, node.next
        size, extra = divmod(n,k)
        answer, node = [], head
        for part in range(k):
            values = []
            for offset in range(size+(part < extra)):
                values.append(node.val)
                previous, node = node, node.next
            if values:
                previous.next = None
            answer.append(values)
        return answer
`,'Mỗi phần có n//k node; n%k phần đầu nhận thêm một node. Cắt cạnh next ở cuối từng phần.','O(n+k)','O(n+k)',{kinds:['list'],focus:['values','answer']});
add(726,'Number of Atoms','string',['K4(ON(SO3)2)2'],'K4N2O14S4',`
class Solution:
    def countOfAtoms(self, formula):
        from collections import Counter
        stack, i = [Counter()], 0
        while i < len(formula):
            ch = formula[i]
            if ch == '(':
                stack.append(Counter())
                i += 1
                continue
            if ch == ')':
                group = stack.pop()
                i += 1
                start = i
                while i < len(formula) and formula[i].isdigit():
                    i += 1
                multiplier = int(formula[start:i] or '1')
                for atom,count in group.items():
                    stack[-1][atom] += count*multiplier
            else:
                start = i
                i += 1
                while i < len(formula) and formula[i].islower():
                    i += 1
                atom, start = formula[start:i], i
                while i < len(formula) and formula[i].isdigit():
                    i += 1
                stack[-1][atom] += int(formula[start:i] or '1')
        return ''.join(atom+(str(count) if count > 1 else '') for atom,count in sorted(stack[0].items()))
`,'Mỗi dấu ( mở một bộ đếm; gặp ) thì nhân cả nhóm rồi gộp vào tầng ngoài. Sắp tên nguyên tử trước khi xuất.','O(L²+u log u)','O(L)',{focus:['formula','stack','group','multiplier']});
add(727,'Minimum Window Subsequence','dp',['abcdebdde','bde'],'bcde',`
class Solution:
    def minWindow(self, s1, s2):
        if not s2:
            return ''
        dp, best = [-1]*len(s2), ''
        for i,ch in enumerate(s1):
            for j in range(len(s2)-1,-1,-1):
                if ch == s2[j]:
                    dp[j] = i if j == 0 else dp[j-1]
            if dp[-1] >= 0:
                candidate = s1[dp[-1]:i+1]
                if not best or len(candidate) < len(best):
                    best = candidate
        return best
`,'dp[j] lưu đầu cửa sổ gần nhất chứa tiền tố s2 tới j. Cập nhật từ phải sang trái để một ký tự không dùng hai lần.','O(mn)','O(n)',{focus:['s1','s2','dp','best']});
add(728,'Self Dividing Numbers','math',[1,22],[1,2,3,4,5,6,7,8,9,11,12,15,22],`
class Solution:
    def selfDividingNumbers(self, left, right):
        assert 1 <= left <= right and right-left <= 200
        answer = []
        for value in range(left,right+1):
            digits = [int(ch) for ch in str(value)]
            if all(digit and value % digit == 0 for digit in digits):
                answer.append(value)
        return answer
`,'Tách từng chữ số; mọi chữ số phải khác 0 và chia hết số ban đầu.','O(range·digits)','O(range)',{difficulty:'easy'});
add(735,'Asteroid Collision','array',[[5,10,-5]],[5,10],`
class Solution:
    def asteroidCollision(self, asteroids):
        stack = []
        for asteroid in asteroids:
            alive = True
            while alive and asteroid < 0 and stack and stack[-1] > 0:
                if stack[-1] < -asteroid:
                    stack.pop()
                elif stack[-1] == -asteroid:
                    stack.pop()
                    alive = False
                else:
                    alive = False
            if alive:
                stack.append(asteroid)
        return stack
`,'Chỉ va chạm khi đỉnh stack đi phải và thiên thạch mới đi trái. So độ lớn, xóa vật nhỏ hơn rồi xét tiếp.','O(n)','O(n)',{focus:['asteroids','stack','asteroid','alive']});
add(736,'Parse Lisp Expression','string',['(let x 2 (mult x (let x 3 y 4 (add x y))))'],14,`
class Solution:
    def evaluate(self, expression):
        tokens = expression.replace('(',' ( ').replace(')',' ) ').split()
        cursor = 0
        def parse(environment):
            nonlocal cursor
            token = tokens[cursor]
            cursor += 1
            if token != '(':
                return int(token) if token.lstrip('-').isdigit() else environment[token]
            operation = tokens[cursor]
            cursor += 1
            if operation in ('add','mult'):
                a, b = parse(environment), parse(environment)
                cursor += 1
                return a+b if operation == 'add' else a*b
            local = dict(environment)
            while True:
                token = tokens[cursor]
                if token == '(' or token.lstrip('-').isdigit() or tokens[cursor+1] == ')':
                    result = parse(local)
                    cursor += 1
                    return result
                name = token
                cursor += 1
                local[name] = parse(local)
        return parse({})
`,'Tách token và đệ quy theo ngoặc. let tạo bản sao môi trường để biến bên trong không ghi đè phạm vi bên ngoài.','O(L²)','O(L²)',{focus:['tokens','local','environment','cursor']});
add(737,'Sentence Similarity II','graph',[['great','acting','skills'],['fine','drama','talent'],[['great','good'],['fine','good'],['acting','drama'],['skills','talent']]],true,`
class Solution:
    def areSentencesSimilarTwo(self, sentence1, sentence2, pairs):
        parent = {}
        def find(word):
            parent.setdefault(word,word)
            if parent[word] != word:
                parent[word] = find(parent[word])
            return parent[word]
        for a,b in pairs:
            parent[find(a)] = find(b)
        if len(sentence1) != len(sentence2):
            return False
        for a,b in zip(sentence1,sentence2):
            if find(a) != find(b):
                return False
        return True
`,'Nối các từ tương tự thành nhóm DSU; hai câu giống nhau khi mỗi cặp từ cùng vị trí thuộc cùng nhóm.','O(L²) worst case','O(L)');
add(738,'Monotone Increasing Digits','greedy',[332],299,`
class Solution:
    def monotoneIncreasingDigits(self, n):
        digits, mark = list(str(n)), len(str(n))
        for i in range(len(digits)-1,0,-1):
            if digits[i] < digits[i-1]:
                digits[i-1] = str(int(digits[i-1])-1)
                mark = i
        for i in range(mark,len(digits)):
            digits[i] = '9'
        return int(''.join(digits))
`,'Đi từ phải sang trái; nếu chữ số trước lớn hơn sau thì giảm nó và đánh dấu đuôi cần đổi thành 9.','O(d)','O(d)');
add(744,'Find Smallest Letter Greater Than Target','search',[['c','f','j'],'j'],'c',`
class Solution:
    def nextGreatestLetter(self, letters, target):
        left, right = 0, len(letters)
        while left < right:
            mid = (left+right)//2
            if letters[mid] <= target:
                left = mid+1
            else:
                right = mid
        return letters[left % len(letters)]
`,'Tìm vị trí đầu có chữ lớn hơn target; không có thì quay về chữ đầu mảng.','O(log n)','O(1)',{difficulty:'easy'});
add(747,'Largest Number At Least Twice of Others','array',[[3,6,1,0]],1,`
class Solution:
    def dominantIndex(self, nums):
        index = max(range(len(nums)),key=lambda i: nums[i])
        for i,value in enumerate(nums):
            if i != index and nums[index] < 2*value:
                return -1
        return index
`,'Tìm số lớn nhất rồi so với gấp đôi từng số còn lại.','O(n)','O(1)',{difficulty:'easy'});
add(748,'Shortest Completing Word','string',['1s3 PSt',['step','steps','stripe','stepple']],'steps',`
class Solution:
    def shortestCompletingWord(self, licensePlate, words):
        from collections import Counter
        needed = Counter(ch.lower() for ch in licensePlate if ch.isalpha())
        best = None
        for word in words:
            counts = Counter(word.lower())
            if all(counts[ch] >= count for ch,count in needed.items()):
                if best is None or len(word) < len(best):
                    best = word
        return best
`,'Bỏ số và khoảng trắng trên biển số; từ hợp lệ phải có đủ số lần của từng chữ, rồi chọn ngắn nhất.','O(L+Σ|word|)','O(alphabet)',{difficulty:'easy'});
add(750,'Number Of Corner Rectangles','dp',[[[1,1,1],[1,1,1]]],3,`
class Solution:
    def countCornerRectangles(self, grid):
        pairs, answer = {}, 0
        for r,row in enumerate(grid):
            columns = [c for c,value in enumerate(row) if value]
            for i,left in enumerate(columns):
                for right in columns[i+1:]:
                    key = (left,right)
                    answer += pairs.get(key,0)
                    pairs[key] = pairs.get(key,0)+1
        return answer
`,'Mỗi hàng chọn cặp cột có 1; mỗi hàng trước có cùng cặp tạo thêm một hình chữ nhật.','O(mn²)','O(n²)',{focus:['grid','columns','pairs','answer']});
add(751,'IP to CIDR','bits',['255.0.0.7',10],['255.0.0.7/32','255.0.0.8/29','255.0.0.16/32'],`
class Solution:
    def ipToCIDR(self, ip, n):
        from ipaddress import IPv4Address
        start, answer = int(IPv4Address(ip)), []
        assert 1 <= n <= 256 and start+n <= 2**32
        while n:
            aligned = start & -start or 2**32
            capacity = 1 << (n.bit_length()-1)
            size = min(aligned,capacity)
            answer.append(str(IPv4Address(start))+'/'+str(32-(size.bit_length()-1)))
            start += size
            n -= size
        return answer
`,'Mỗi bước lấy khối lũy thừa 2 lớn nhất vừa căn đúng địa chỉ đầu vừa không vượt số IP còn lại.','O(log n)','O(log n)');
add(754,'Reach a Number','math',[3],2,`
class Solution:
    def reachNumber(self, target):
        target = abs(target)
        assert target <= 1000000
        total, steps = 0, 0
        while total < target or (total-target)%2:
            steps += 1
            total += steps
        return steps
`,'Đi tất cả sang phải được tổng 1+...+k. Đổi hướng một bước giảm tổng đi số chẵn, nên phần dư phải chẵn.','O(√|target|)','O(1)');
add(756,'Pyramid Transition Matrix','backtracking',['BCD',['BCC','CDE','CEA','FFF']],true,`
class Solution:
    def pyramidTransition(self, bottom, allowed):
        from functools import lru_cache
        pairs = {}
        for triple in allowed:
            pairs.setdefault(triple[:2],[]).append(triple[2])
        @lru_cache(None)
        def solve(row):
            if len(row) == 1:
                return True
            def build(index, above):
                if index == len(row)-1:
                    return solve(above)
                for color in pairs.get(row[index:index+2],[]):
                    if build(index+1,above+color):
                        return True
                return False
            return build(0,'')
        assert 1 <= len(bottom) <= 7
        return solve(bottom)
`,'Mỗi cặp gạch dưới chọn màu được phép ở trên; xây đủ một hàng rồi tiếp tục lên đỉnh. Ghi nhớ hàng đã thử.','O(7^(n²)) worst case','O(7^n+n²)',{traceOptions:{maxEvents:20000}});
add(757,'Set Intersection Size At Least Two','greedy',[[[1,3],[1,4],[2,5],[3,5]]],3,`
class Solution:
    def intersectionSizeTwo(self, intervals):
        selected, a, b = [], -float('inf'), -float('inf')
        for left,right in sorted(intervals,key=lambda p:(p[1],-p[0])):
            if left > b:
                a, b = right-1, right
                selected.extend([a,b])
            elif left > a:
                a, b = b, right
                selected.append(b)
        return len(selected)
`,'Xét đoạn kết thúc sớm trước; thiếu điểm thì chọn sát mép phải để dễ dùng lại cho các đoạn sau. Giữ hai điểm lớn nhất a,b.','O(n log n)','O(n)',{focus:['intervals','selected','a','b']});
add(758,'Bold Words in String','string', [['ab','bc'],'aabcd'],'a<b>abc</b>d',
require('./easy-600-699')[616].code.join('\n').replace('def addBoldTag(self, s, words):','def boldWords(self, words, s):'),
'Tô mọi vị trí thuộc một từ khớp; gộp các vùng kề nhau hoặc chồng nhau vào cùng cặp thẻ b.','O(n·Σ|word|)','O(n)',{focus:['s','bold','answer']});
add(762,'Prime Number of Set Bits in Binary Representation','bits',[6,10],4,`
class Solution:
    def countPrimeSetBits(self, left, right):
        assert 0 <= left <= right <= 1000000 and right-left <= 200
        primes, answer = {2,3,5,7,11,13,17,19}, 0
        for value in range(left,right+1):
            ones = value.bit_count()
            if ones in primes:
                answer += 1
        return answer
`,'Đếm bit 1 của từng số; tăng kết quả khi số bit 1 là số nguyên tố.','O(range·log right)','O(1)',{difficulty:'easy'});
add(763,'Partition Labels','greedy',['ababcbacadefegdehijhklij'],[9,7,8],`
class Solution:
    def partitionLabels(self, s):
        last = {ch:i for i,ch in enumerate(s)}
        start, end, answer = 0, 0, []
        for i,ch in enumerate(s):
            end = max(end,last[ch])
            if i == end:
                answer.append(end-start+1)
                start = i+1
        return answer
`,'Cuối đoạn phải bao trùm lần xuất hiện cuối của mọi chữ đã gặp; con trỏ tới end thì có thể cắt.','O(n)','O(alphabet)',{focus:['s','last','start','end','answer']});
add(764,'Largest Plus Sign','dp',[5,[[4,2]]],2,`
class Solution:
    def orderOfLargestPlusSign(self, n, mines):
        assert 1 <= n <= 12
        blocked = {tuple(p) for p in mines}
        dp = [[n]*n for _ in range(n)]
        for r in range(n):
            run = 0
            for c in range(n):
                run = 0 if (r,c) in blocked else run+1
                dp[r][c] = min(dp[r][c],run)
            run = 0
            for c in range(n-1,-1,-1):
                run = 0 if (r,c) in blocked else run+1
                dp[r][c] = min(dp[r][c],run)
        for c in range(n):
            run = 0
            for r in range(n):
                run = 0 if (r,c) in blocked else run+1
                dp[r][c] = min(dp[r][c],run)
            run = 0
            for r in range(n-1,-1,-1):
                run = 0 if (r,c) in blocked else run+1
                dp[r][c] = min(dp[r][c],run)
        return max(map(max,dp))
`,'Quét bốn hướng; ô dp giữ độ dài ngắn nhất trong bốn cánh tính cả tâm. Giá trị lớn nhất là bậc dấu cộng.','O(n²)','O(n²)',{focus:['dp','run']});
add(765,'Couples Holding Hands','greedy',[[0,2,1,3]],1,`
class Solution:
    def minSwapsCouples(self, row):
        row = row[:]
        position = {person:i for i,person in enumerate(row)}
        answer = 0
        for i in range(0,len(row),2):
            partner = row[i]^1
            if row[i+1] != partner:
                j, displaced = position[partner], row[i+1]
                row[i+1], row[j] = row[j], row[i+1]
                position[partner], position[displaced] = i+1, j
                answer += 1
        return answer
`,'Xét từng cặp ghế; bạn đời của x là x XOR 1. Nếu ngồi sai, đổi đúng người vào ghế kế bên.','O(n)','O(n)',{focus:['row','position','partner','answer']});
add(773,'Sliding Puzzle','graph',[[[1,2,3],[4,0,5]]],1,`
class Solution:
    def slidingPuzzle(self, board):
        from collections import deque
        start = ''.join(str(v) for row in board for v in row)
        assert len(board) == 2 and all(len(row) == 3 for row in board) and sorted(start) == list('012345')
        neighbors = [[1,3],[0,2,4],[1,5],[0,4],[1,3,5],[2,4]]
        queue, seen = deque([(start,0)]), {start}
        while queue:
            state, distance = queue.popleft()
            if state == '123450':
                return distance
            zero = state.index('0')
            for target in neighbors[zero]:
                values = list(state)
                values[zero], values[target] = values[target], values[zero]
                following = ''.join(values)
                if following not in seen:
                    seen.add(following)
                    queue.append((following,distance+1))
        return -1
`,'BFS trên trạng thái bảng 2×3. Mỗi cạnh đổi ô trống với ô kề; lần đầu tới 123450 cho số bước ít nhất.','O(6!)','O(6!)',{focus:['state','queue','seen'],traceOptions:{maxEvents:30000,summarizeLocals:{seen:20,queue:20}}});
add(774,'Minimize Max Distance to Gas Station','search',[[1,2,3,4,5,6,7,8,9,10],9],0.5,`
class Solution:
    def minmaxGasDist(self, stations, k):
        import math
        gaps = [b-a for a,b in zip(stations,stations[1:])]
        low, high = 0, max(gaps)
        for iteration in range(50):
            mid = (low+high)/2
            required = sum(math.ceil(gap/mid)-1 for gap in gaps)
            if required <= k:
                high = mid
            else:
                low = mid
        return high
`,'Thử khoảng cách tối đa mid; một đoạn gap cần ceil(gap/mid)−1 trạm mới. Đủ ngân sách thì giảm mid.','O(n log(D/ε))','O(n)',{focus:['stations','gaps','low','high','required']});
add(779,'K-th Symbol in Grammar','bits',[4,5],1,`
class Solution:
    def kthGrammar(self, n, k):
        assert 1 <= n <= 64 and 1 <= k <= 2**(n-1)
        index, parity = k-1, 0
        while index:
            parity ^= index & 1
            index >>= 1
        return parity
`,'Vị trí k−1 viết nhị phân: mỗi bit 1 đổi ký hiệu một lần. Đáp án là tính chẵn/lẻ số bit 1.','O(log k)','O(1)');
add(780,'Reaching Points','math',[1,1,3,5],true,`
class Solution:
    def reachingPoints(self, sx, sy, tx, ty):
        assert min(sx,sy,tx,ty) > 0
        while tx > sx and ty > sy:
            if tx > ty:
                tx %= ty
            else:
                ty %= tx
        return (tx == sx and ty >= sy and (ty-sy)%sx == 0) or (ty == sy and tx >= sx and (tx-sx)%sy == 0)
`,'Đi ngược từ đích: tọa độ lớn được trừ tọa độ nhỏ nhiều lần bằng phép %. Khi một tọa độ khớp gốc, kiểm tra phần còn lại.','O(log max(tx,ty))','O(1)');
add(781,'Rabbits in Forest','math',[[1,1,2]],5,`
class Solution:
    def numRabbits(self, answers):
        from collections import Counter
        counts, total = Counter(answers), 0
        for reply, count in counts.items():
            group = reply+1
            groups = (count+group-1)//group
            total += groups*group
        return total
`,'Trả lời x nghĩa là nhóm màu có x+1 con; làm tròn số nhóm lên để chứa đủ các con trả lời giống nhau.','O(n)','O(n)');
add(782,'Transform to Chessboard','array',[[[0,1,1,0],[0,1,1,0],[1,0,0,1],[1,0,0,1]]],2,`
class Solution:
    def movesToChessboard(self, board):
        n = len(board)
        for r in range(n):
            for c in range(n):
                if board[0][0]^board[r][0]^board[0][c]^board[r][c]:
                    return -1
        rowOnes, colOnes = sum(board[0]), sum(row[0] for row in board)
        if not n//2 <= rowOnes <= (n+1)//2 or not n//2 <= colOnes <= (n+1)//2:
            return -1
        rows = sum(board[i][0] == i%2 for i in range(n))
        cols = sum(board[0][i] == i%2 for i in range(n))
        if n%2:
            rows = n-rows if rows%2 else rows
            cols = n-cols if cols%2 else cols
        else:
            rows, cols = min(rows,n-rows), min(cols,n-cols)
        return (rows+cols)//2
`,'Các hàng phải giống hoặc đối nhau; số 0/1 phải cân bằng. Đếm vị trí lệch mẫu xen kẽ, mỗi lần đổi sửa hai vị trí.','O(n²)','O(1)',{focus:['board','rows','cols','rowOnes','colOnes']});
add(786,'K-th Smallest Prime Fraction','array',[[1,2,3,5],3],[2,5],`
class Solution:
    def kthSmallestPrimeFraction(self, arr, k):
        from fractions import Fraction
        import heapq
        heap = [(Fraction(arr[0],arr[j]),0,j) for j in range(1,len(arr))]
        heapq.heapify(heap)
        for rank in range(k):
            fraction, i, j = heapq.heappop(heap)
            if i+1 < j:
                heapq.heappush(heap,(Fraction(arr[i+1],arr[j]),i+1,j))
        return [arr[i],arr[j]]
`,'Mỗi mẫu số tạo một dãy phân số tăng theo tử số; min-heap trộn các dãy và lấy phần tử thứ k.','O((n+k) log n)','O(n)');
add(788,'Rotated Digits','math',[10],4,`
class Solution:
    def rotatedDigits(self, n):
        assert 1 <= n <= 1000
        answer = 0
        for value in range(1,n+1):
            digits = set(str(value))
            if not digits & set('347') and digits & set('2569'):
                answer += 1
        return answer
`,'Không được chứa 3,4,7; phải chứa ít nhất một chữ số đổi giá trị khi quay: 2,5,6,9.','O(n log n)','O(log n)');
add(789,'Escape The Ghosts','math',[[[1,0],[0,3]],[0,1]],true,`
class Solution:
    def escapeGhosts(self, ghosts, target):
        player = abs(target[0])+abs(target[1])
        for ghost in ghosts:
            distance = abs(ghost[0]-target[0])+abs(ghost[1]-target[1])
            if distance <= player:
                return False
        return True
`,'Bạn đi theo khoảng cách Manhattan tới đích. Nếu ma đến đích sớm hơn hoặc cùng lúc, nó có thể chặn bạn.','O(n)','O(1)');
add(790,'Domino and Tromino Tiling','dp',[3],5,`
class Solution:
    def numTilings(self, n):
        assert 0 <= n <= 80
        dp = [1,1,2]
        for width in range(3,n+1):
            dp.append((2*dp[-1]+dp[-3])%1000000007)
        return dp[n]
`,'dp[w] đếm cách lát bảng 2×w; gộp các trạng thái khuyết cho công thức dp[w] = 2dp[w−1] + dp[w−3].','O(n)','O(n)');
add(791,'Custom Sort String','string',['cba','abcd'],'cbad',`
class Solution:
    def customSortString(self, order, s):
        from collections import Counter
        counts, answer = Counter(s), ''
        for ch in order:
            answer += ch*counts.pop(ch,0)
        for ch,count in counts.items():
            answer += ch*count
        return answer
`,'Đếm chữ; xuất hết từng chữ theo order, sau đó nối các chữ không có thứ tự bắt buộc.','O(n+|order|)','O(n)');
add(793,'Preimage Size of Factorial Zeroes Function','search',[5],0,`
class Solution:
    def preimageSizeFZF(self, k):
        def zeroes(n):
            total = 0
            while n:
                n //= 5
                total += n
            return total
        def lower(target):
            left, right = 0, 5*(target+1)
            while left < right:
                mid = (left+right)//2
                if zeroes(mid) < target:
                    left = mid+1
                else:
                    right = mid
            return left
        return lower(k+1)-lower(k)
`,'Số 0 cuối n! là n//5+n//25+...; tìm hai biên của vùng có đúng k số 0 bằng tìm nhị phân.','O(log² k)','O(1)');
add(794,'Valid Tic-Tac-Toe State','array',[['XOX','O O','XOX']],true,`
class Solution:
    def validTicTacToe(self, board):
        def wins(player):
            lines = list(board)+[''.join(board[r][c] for r in range(3)) for c in range(3)]
            lines += [''.join(board[i][i] for i in range(3)), ''.join(board[i][2-i] for i in range(3))]
            return player*3 in lines
        x, o = ''.join(board).count('X'), ''.join(board).count('O')
        if x not in (o,o+1):
            return False
        if wins('X') and x != o+1:
            return False
        if wins('O') and x != o:
            return False
        return True
`,'X đi trước nên số X bằng O hoặc hơn 1. Nếu có người thắng, số lượt phải khớp với người vừa đi.','O(1)','O(1)');
add(795,'Number of Subarrays with Bounded Maximum','array',[[2,1,4,3],2,3],3,`
class Solution:
    def numSubarrayBoundedMax(self, nums, left, right):
        lastLarge, lastValid, answer = -1, -1, 0
        for i,value in enumerate(nums):
            if value > right:
                lastLarge = i
            if left <= value <= right:
                lastValid = i
            answer += max(0,lastValid-lastLarge)
        return answer
`,'Mỗi đầu phải i: đầu trái phải nằm sau số quá lớn gần nhất và không sau số hợp lệ gần nhất.','O(n)','O(1)');
add(796,'Rotate String','string',['abcde','cdeab'],true,`
class Solution:
    def rotateString(self, s, goal):
        doubled = s+s
        return len(s) == len(goal) and goal in doubled
`,'Mọi phép quay của s đều là một đoạn dài |s| trong s+s; trước hết hai chuỗi phải cùng độ dài.','O(n²) worst case','O(n)',{difficulty:'easy',focus:['s','goal','doubled']});
add(797,'All Paths From Source to Target','graph',[[[1,2],[3],[3],[]]],[[0,1,3],[0,2,3]],`
class Solution:
    def allPathsSourceTarget(self, graph):
        answer, path = [], [0]
        def visit(node):
            if node == len(graph)-1:
                answer.append(path[:])
                return
            for following in graph[node]:
                assert following not in path, 'Input must be a DAG'
                path.append(following)
                visit(following)
                path.pop()
        visit(0)
        return answer
`,'DFS giữ đường đi hiện tại; tới đích thì lưu bản sao, quay lui thì bỏ node cuối.','O(n·2^n)','O(n·2^n)',{focus:['path','answer'],traceOptions:{maxEvents:12000}});
add(798,'Smallest Rotation with Highest Score','array',[[2,3,1,4,0]],3,`
class Solution:
    def bestRotation(self, nums):
        scores, best = [], 0
        for rotation in range(len(nums)):
            rotated = nums[rotation:]+nums[:rotation]
            score = sum(value <= i for i,value in enumerate(rotated))
            scores.append(score)
            if score > scores[best]:
                best = rotation
        return best
`,'Thử từng phép quay; ô i được một điểm nếu giá trị ≤i. Giữ phép quay đầu tiên có điểm cao nhất.','O(n²)','O(n)',{focus:['rotated','scores','rotation','best'],description:'This teaching version explicitly compares every rotation to make the scoring rule visible.'});
module.exports=lessons;
