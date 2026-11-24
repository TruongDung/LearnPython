"use strict";
const {defineEasy}=require('./easy-lesson');
const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(504,'Base 7','math',[100],'202',`
class Solution:
    def convertToBase7(self, num):
        sign = '-' if num < 0 else ''
        value, digits = abs(num), []
        if value == 0:
            return '0'
        while value:
            value, remainder = divmod(value, 7)
            digits.append(str(remainder))
        return sign + ''.join(digits[::-1])
`,'Chia cho 7, giữ số dư; đọc các số dư từ cuối về đầu.','O(log₇ n)','O(log₇ n)',{difficulty:'easy',description:'Convert a signed integer to base seven.'});
add(506,'Relative Ranks','array',[[5,4,3,2,1]],['Gold Medal','Silver Medal','Bronze Medal','4','5'],`
class Solution:
    def findRelativeRanks(self, score):
        order = sorted(range(len(score)), key=lambda i: -score[i])
        answer = [''] * len(score)
        medals = ['Gold Medal', 'Silver Medal', 'Bronze Medal']
        for rank, index in enumerate(order):
            answer[index] = medals[rank] if rank < 3 else str(rank + 1)
        return answer
`,'Xếp điểm từ cao xuống thấp, rồi đặt huy chương về đúng vị trí ban đầu.','O(n log n)','O(n)',{difficulty:'easy'});
add(507,'Perfect Number','math',[28],true,`
class Solution:
    def checkPerfectNumber(self, num):
        import math
        if num <= 1:
            return False
        total = 1
        for divisor in range(2, math.isqrt(num) + 1):
            if num % divisor == 0:
                total += divisor
                if divisor * divisor != num:
                    total += num // divisor
        return total == num
`,'Ghép các cặp ước số; cộng mọi ước nhỏ hơn số đang xét.','O(√n)','O(1)',{difficulty:'easy'});
add(508,'Most Frequent Subtree Sum','tree',[[5,2,-3]],[-3,2,4],`
class Solution:
    def findFrequentTreeSum(self, root):
        from collections import Counter
        counts = Counter()
        def visit(node):
            if node is None:
                return 0
            total = node.val + visit(node.left) + visit(node.right)
            counts[total] += 1
            return total
        visit(root)
        maximum = max(counts.values(), default=0)
        return sorted(value for value, count in counts.items() if count == maximum)
`,'Tính tổng từng cây con từ dưới lên, rồi đếm tổng nào xuất hiện nhiều nhất.','O(n)','O(n)',{kinds:['tree'],focus:['counts','total']});
add(511,'Game Play Analysis I','sql',[[{player_id:1,event_date:'2016-03-01',device_id:2,games_played:5},{player_id:1,event_date:'2016-05-02',device_id:2,games_played:6}]], [{player_id:1,first_login:'2016-03-01'}],`
class Solution:
    def firstLogin(self, activity):
        first = {}
        for row in activity:
            player = row['player_id']
            first[player] = min(first.get(player, row['event_date']), row['event_date'])
        return [dict(player_id=p, first_login=first[p]) for p in sorted(first)]
`,'Gom theo người chơi; giữ ngày đăng nhập sớm nhất của mỗi người.','O(n + p log p)','O(p)',{difficulty:'easy',reference:'SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id;'});
add(512,'Game Play Analysis II','sql',[[{player_id:1,event_date:'2016-03-01',device_id:2},{player_id:1,event_date:'2016-05-02',device_id:3}]], [{player_id:1,device_id:2}],`
class Solution:
    def firstDevice(self, activity):
        first = {}
        for row in activity:
            player = row['player_id']
            if player not in first or row['event_date'] < first[player]['event_date']:
                first[player] = row
        return [dict(player_id=p, device_id=first[p]['device_id']) for p in sorted(first)]
`,'Đánh dấu bản ghi đầu tiên của từng người chơi và lấy thiết bị của bản ghi đó.','O(n + p log p)','O(p)',{difficulty:'easy',reference:'SELECT player_id, device_id FROM (SELECT *, ROW_NUMBER() OVER(PARTITION BY player_id ORDER BY event_date) r FROM Activity) a WHERE r=1;'});
add(517,'Super Washing Machines','greedy',[[1,0,5]],3,`
class Solution:
    def findMinMoves(self, machines):
        total = sum(machines)
        if total % len(machines):
            return -1
        average = total // len(machines)
        balance = answer = 0
        for load in machines:
            surplus = load - average
            balance += surplus
            answer = max(answer, abs(balance), surplus)
        return answer
`,'Mỗi máy cần cùng số áo: theo dõi lượng áo phải đi qua mỗi ranh giới.','O(n)','O(1)',{difficulty:'hard',focus:['average','balance','surplus','answer']});
add(519,'Random Flip Matrix','design',[2,3,3],{uniqueCells:[2,3,3]},`
class Solution:
    def flipMany(self, rows, cols, flips):
        import random
        assert rows > 0 and cols > 0 and 0 <= flips <= rows * cols
        remaining, moved, answer = rows * cols, {}, []
        for _ in range(flips):
            picked = random.randrange(remaining)
            cell = moved.get(picked, picked)
            remaining -= 1
            moved[picked] = moved.get(remaining, remaining)
            answer.append([cell // cols, cell % cols])
        return answer
`,'Chọn đều một ô chưa lật; đổi ô đã chọn với ô cuối để không chọn trùng.','O(1) expected per flip','O(flips)',{description:'Uniform sampling without replacement; a fixed replay seed makes the animation reproducible.'});
add(520,'Detect Capital','string',['USA'],true,`
class Solution:
    def detectCapitalUse(self, word):
        all_upper = word.isupper()
        all_lower = word.islower()
        first_upper = word[:1].isupper() and word[1:].islower()
        return all_upper or all_lower or first_upper
`,'So ba mẫu hợp lệ: toàn hoa, toàn thường, hoặc chỉ chữ đầu viết hoa.','O(n)','O(1)',{difficulty:'easy'});
add(521,'Longest Uncommon Subsequence I','string',['aba','cdc'],3,`
class Solution:
    def findLUSlength(self, a, b):
        if a == b:
            return -1
        return max(len(a), len(b))
`,'Hai chuỗi khác nhau: chuỗi dài hơn chính là dãy con riêng cần tìm.','O(n+m)','O(1)',{difficulty:'easy'});
add(522,'Longest Uncommon Subsequence II','string',[['aba','cdc','eae']],3,`
class Solution:
    def findLUSlength(self, strs):
        def subsequence(a, b):
            i = 0
            for ch in b:
                if i < len(a) and a[i] == ch:
                    i += 1
            return i == len(a)
        for i in sorted(range(len(strs)), key=lambda i: -len(strs[i])):
            if all(i == j or not subsequence(strs[i], other) for j, other in enumerate(strs)):
                return len(strs[i])
        return -1
`,'Thử chuỗi dài trước; loại nếu nó là dãy con của bất kỳ chuỗi khác.','O(n²L)','O(n)');
add(527,'Word Abbreviation','string',[['like','god','internal','me','internet','interval','intension','face','intrusion']],['l2e','god','internal','me','i6t','interval','inte4n','f2e','intr4n'],`
class Solution:
    def wordsAbbreviation(self, words):
        assert len(set(words)) == len(words)
        prefixes = [1] * len(words)
        def abbreviate(word, prefix):
            if len(word) - prefix <= 2:
                return word
            return word[:prefix] + str(len(word) - prefix - 1) + word[-1]
        while True:
            groups = {}
            answer = [abbreviate(w, prefixes[i]) for i,w in enumerate(words)]
            for i, abbreviation in enumerate(answer):
                groups.setdefault(abbreviation, []).append(i)
            collisions = [indices for indices in groups.values() if len(indices) > 1]
            if not collisions:
                return answer
            for indices in collisions:
                for i in indices:
                    prefixes[i] += 1
`,'Nếu hai từ viết tắt bị trùng, giữ thêm một chữ đầu cho cả nhóm rồi thử lại.','O(nL²)','O(nL)',{difficulty:'hard',focus:['answer','prefixes','groups']});
add(531,'Lonely Pixel I','array',[['WWB','WBW','BWW']],3,`
class Solution:
    def findLonelyPixel(self, picture):
        rows, cols = len(picture), len(picture[0])
        row_count = [0] * rows
        col_count = [0] * cols
        for r in range(rows):
            for c in range(cols):
                if picture[r][c] == 'B':
                    row_count[r] += 1
                    col_count[c] += 1
        answer = 0
        for r in range(rows):
            for c in range(cols):
                if picture[r][c] == 'B' and row_count[r] == col_count[c] == 1:
                    answer += 1
        return answer
`,'Một điểm đen cô đơn khi hàng và cột của nó đều chỉ có đúng một điểm đen.','O(RC)','O(R+C)',{focus:['picture','row_count','col_count']});
add(532,'K-diff Pairs in an Array','array',[[3,1,4,1,5],2],2,`
class Solution:
    def findPairs(self, nums, k):
        from collections import Counter
        if k < 0:
            return 0
        counts = Counter(nums)
        answer = 0
        for value in counts:
            if (k == 0 and counts[value] > 1) or (k > 0 and value + k in counts):
                answer += 1
        return answer
`,'Mỗi giá trị chỉ đếm một cặp với value+k; nếu k=0 phải có hai bản sao.','O(n)','O(n)');
add(533,'Lonely Pixel II','array',[['WBWBBW','WBWBBW','WBWBBW','WWBWBW'],3],6,`
class Solution:
    def findBlackPixel(self, picture, target):
        from collections import Counter
        patterns = [''.join(row) for row in picture]
        counts = Counter(patterns)
        columns = [sum(row[c] == 'B' for row in picture) for c in range(len(picture[0]))]
        answer = 0
        for r, row in enumerate(patterns):
            if row.count('B') == target and counts[row] == target:
                for c, color in enumerate(row):
                    if color == 'B' and columns[c] == target:
                        answer += 1
        return answer
`,'Đếm điểm đen theo hàng/cột và số hàng giống hệt nhau; cả ba số phải bằng target.','O(RC)','O(RC)',{focus:['picture','columns','counts']});
add(534,'Game Play Analysis III','sql',[[{player_id:1,event_date:'2016-03-01',games_played:5},{player_id:1,event_date:'2016-05-02',games_played:6}]], [{player_id:1,event_date:'2016-03-01',games_played_so_far:5},{player_id:1,event_date:'2016-05-02',games_played_so_far:11}],`
class Solution:
    def cumulativeGames(self, activity):
        totals, answer = {}, []
        for row in sorted(activity, key=lambda r: (r['player_id'], r['event_date'])):
            player = row['player_id']
            totals[player] = totals.get(player, 0) + row['games_played']
            answer.append(dict(player_id=player, event_date=row['event_date'], games_played_so_far=totals[player]))
        return answer
`,'Đi theo ngày của từng người chơi; cộng dồn số trận đã chơi tới ngày hiện tại.','O(n log n)','O(n)',{reference:'SELECT player_id,event_date,SUM(games_played) OVER(PARTITION BY player_id ORDER BY event_date) games_played_so_far FROM Activity;'});
add(535,'Encode and Decode TinyURL','design',[['https://example.com/first','https://example.com/second']],{short:['https://tiny.local/1','https://tiny.local/2'],decoded:['https://example.com/first','https://example.com/second']},`
class Solution:
    def roundTrip(self, urls):
        short, mapping = [], {}
        for url in urls:
            key = 'https://tiny.local/' + str(len(mapping) + 1)
            mapping[key] = url
            short.append(key)
        decoded = []
        for key in short:
            decoded.append(mapping[key])
        return dict(short=short, decoded=decoded)
`,'URL ngắn chỉ là một mã; bảng ánh xạ giúp khôi phục đúng URL gốc.','O(total URL characters)','O(total URL characters)',{description:'Local codec demonstration; no URL is visited and no shortening service is contacted.'});
add(536,'Construct Binary Tree from String','tree',['4(2(3)(1))(6(5))'],[4,2,6,3,1,5],`
class Solution:
    def str2tree(self, s):
        index = 0
        def parse():
            nonlocal index
            start = index
            if index < len(s) and s[index] == '-':
                index += 1
            while index < len(s) and s[index].isdigit():
                index += 1
            node = TreeNode(int(s[start:index]))
            for side in ('left', 'right'):
                if index < len(s) and s[index] == '(':
                    index += 1
                    if s[index] != ')':
                        setattr(node, side, parse())
                    assert s[index] == ')'
                    index += 1
            return node
        return parse() if s else None
`,'Đọc số làm gốc; cặp ngoặc thứ nhất dựng nhánh trái, cặp thứ hai dựng nhánh phải.','O(n)','O(n)',{answerKind:'tree'});
add(537,'Complex Number Multiplication','math',['1+1i','1+1i'],'0+2i',`
class Solution:
    def complexNumberMultiply(self, num1, num2):
        a, b = map(int, num1[:-1].split('+'))
        c, d = map(int, num2[:-1].split('+'))
        real = a * c - b * d
        imaginary = a * d + b * c
        return str(real) + '+' + str(imaginary) + 'i'
`,'Nhân như nhị thức, rồi đổi i² thành −1: phần thực ac−bd, phần ảo ad+bc.','O(n+m)','O(n+m)');
add(544,'Output Contest Matches','array',[4],'((1,4),(2,3))',`
class Solution:
    def findContestMatch(self, n):
        assert 1 <= n <= 32 and n & (n - 1) == 0
        teams = list(map(str, range(1, n + 1)))
        while len(teams) > 1:
            teams = ['(' + teams[i] + ',' + teams[-1-i] + ')' for i in range(len(teams)//2)]
        return teams[0]
`,'Ghép đội mạnh nhất còn lại với đội yếu nhất; mỗi vòng thu còn một nửa số đội.','O(n log n) string copying','O(n log n)');
add(548,'Split Array with Equal Sum','array',[[1,2,1,2,1,2,1]],true,`
class Solution:
    def splitArray(self, nums):
        prefix = [0]
        for value in nums:
            prefix.append(prefix[-1] + value)
        n = len(nums)
        for j in range(3, n - 3):
            sums = set()
            for i in range(1, j - 1):
                if prefix[i] == prefix[j] - prefix[i+1]:
                    sums.add(prefix[i])
            for k in range(j + 2, n - 1):
                right = prefix[k] - prefix[j+1]
                if right == prefix[n] - prefix[k+1] and right in sums:
                    return True
        return False
`,'Bỏ ba vị trí i,j,k; so bốn đoạn còn lại bằng tổng tiền tố, không cộng các ô bị bỏ.','O(n²)','O(n)',{difficulty:'hard',focus:['nums','prefix','sums']});
add(550,'Game Play Analysis IV','sql',[[{player_id:1,event_date:'2016-03-01'},{player_id:1,event_date:'2016-03-02'},{player_id:2,event_date:'2016-03-01'}]],0.5,`
class Solution:
    def fraction(self, activity):
        from datetime import date, timedelta
        from decimal import Decimal, ROUND_HALF_UP
        days = {}
        for row in activity:
            days.setdefault(row['player_id'], set()).add(date.fromisoformat(row['event_date']))
        returned = 0
        for visits in days.values():
            returned += min(visits) + timedelta(days=1) in visits
        return float((Decimal(returned) / len(days)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)) if days else 0.0
`,'Chỉ tính người quay lại đúng ngày sau lần đăng nhập đầu tiên; chia cho toàn bộ người chơi.','O(n)','O(n)',{reference:'WITH firsts AS (SELECT player_id,MIN(event_date) d FROM Activity GROUP BY player_id) SELECT ROUND(AVG(EXISTS(SELECT 1 FROM Activity a WHERE a.player_id=f.player_id AND a.event_date=DATE_ADD(f.d,INTERVAL 1 DAY))),2) fraction FROM firsts f;'});
add(551,'Student Attendance Record I','string',['PPALLP'],true,`
class Solution:
    def checkRecord(self, s):
        absent = late = 0
        for day in s:
            absent += day == 'A'
            late = late + 1 if day == 'L' else 0
            if absent >= 2 or late >= 3:
                return False
        return True
`,'Đếm tổng lần vắng và chuỗi đi muộn liên tiếp; vi phạm một trong hai là loại.','O(n)','O(1)',{difficulty:'easy'});
add(553,'Optimal Division','math',[[1000,100,10,2]],'1000/(100/10/2)',`
class Solution:
    def optimalDivision(self, nums):
        assert nums and all(v > 0 for v in nums)
        if len(nums) == 1:
            return str(nums[0])
        if len(nums) == 2:
            return str(nums[0]) + '/' + str(nums[1])
        denominator = '/'.join(map(str, nums[1:]))
        return str(nums[0]) + '/(' + denominator + ')'
`,'Giữ số đầu ở tử; gom phần còn lại vào mẫu để các số sau làm mẫu nhỏ đi.','O(n)','O(n)',{description:'The problem supplies integers at least 2, except the single-element case.'});
add(554,'Brick Wall','array',[[[1,2,2,1],[3,1,2],[1,3,2],[2,4],[3,1,2],[1,3,1,1]]],2,`
class Solution:
    def leastBricks(self, wall):
        from collections import Counter
        edges = Counter()
        for row in wall:
            position = 0
            for width in row[:-1]:
                position += width
                edges[position] += 1
        return len(wall) - max(edges.values(), default=0)
`,'Kẻ qua khe gạch nhiều nhất; không dùng hai mép ngoài của bức tường.','O(total bricks)','O(total internal edges)',{focus:['wall','edges','position']});
add(555,'Split Concatenated Strings','string',[['abc','xyz']],'zyxcba',`
class Solution:
    def splitLoopedString(self, strs):
        best = [max(s, s[::-1]) for s in strs]
        answer = ''
        for i, original in enumerate(strs):
            middle = ''.join(best[i+1:] + best[:i])
            for word in (original, original[::-1]):
                for cut in range(len(word)):
                    candidate = word[cut:] + middle + word[:cut]
                    answer = max(answer, candidate)
        return answer
`,'Các khối giữ thứ tự vòng tròn. Chỉ thử hai chiều và mọi điểm cắt của khối chứa chỗ bắt đầu.','O(total_length²)','O(total_length)',{focus:['best','word','candidate','answer']});
add(556,'Next Greater Element III','array',[12443322],13222344,`
class Solution:
    def nextGreaterElement(self, n):
        digits = list(str(n))
        i = len(digits) - 2
        while i >= 0 and digits[i] >= digits[i+1]:
            i -= 1
        if i < 0:
            return -1
        j = len(digits) - 1
        while digits[j] <= digits[i]:
            j -= 1
        digits[i], digits[j] = digits[j], digits[i]
        digits[i+1:] = digits[i+1:][::-1]
        answer = int(''.join(digits))
        return answer if answer < 2**31 else -1
`,'Tìm chỗ giảm từ phải, đổi với chữ số vừa lớn hơn, rồi đảo đuôi để tăng ít nhất.','O(number of digits)','O(number of digits)',{focus:['digits','i','j']});
add(558,'Logical OR of Two Binary Grids Represented as Quad-Trees','tree',[{isLeaf:true,val:true},{isLeaf:true,val:false}],{isLeaf:true,val:true},`
class Solution:
    def intersect(self, quadTree1, quadTree2):
        if quadTree1['isLeaf']:
            return quadTree1 if quadTree1['val'] else quadTree2
        if quadTree2['isLeaf']:
            return quadTree2 if quadTree2['val'] else quadTree1
        children = {}
        for side in ('topLeft','topRight','bottomLeft','bottomRight'):
            children[side] = self.intersect(quadTree1[side], quadTree2[side])
        values = list(children.values())
        if all(c['isLeaf'] and c['val'] == values[0]['val'] for c in values):
            return dict(isLeaf=True, val=values[0]['val'])
        return dict(isLeaf=False, val=False, **children)
`,'OR theo vùng: vùng toàn 1 thắng ngay; bốn vùng con giống nhau thì gộp thành một lá.','O(nodes visited)','O(tree height + output)',{description:'Quad-tree nodes are JSON objects with val/isLeaf and four named child fields.'});
add(559,'Maximum Depth of N-ary Tree','tree',[[1,[[3,[[5,[]],[6,[]]]],[2,[]],[4,[]]]]],3,`
class Solution:
    def maxDepth(self, root):
        if root is None:
            return 0
        value, children = root
        depth = 0
        for child in children:
            depth = max(depth, self.maxDepth(child))
        return depth + 1
`,'Độ sâu của một node = 1 + độ sâu lớn nhất trong các con.','O(n)','O(height)',{difficulty:'easy',description:'Represent an N-ary node as [value, children]; null is an empty tree.'});
add(561,'Array Partition','array',[[1,4,3,2]],4,`
class Solution:
    def arrayPairSum(self, nums):
        nums.sort()
        total = 0
        for i in range(0, len(nums), 2):
            total += nums[i]
        return total
`,'Sau khi sắp xếp, ghép hai số kề nhau; lấy số nhỏ của mỗi cặp.','O(n log n)','O(n) Python sort',{difficulty:'easy'});
add(563,'Binary Tree Tilt','tree',[[1,2,3]],1,`
class Solution:
    def findTilt(self, root):
        tilt = 0
        def visit(node):
            nonlocal tilt
            if node is None:
                return 0
            left = visit(node.left)
            right = visit(node.right)
            tilt += abs(left - right)
            return node.val + left + right
        visit(root)
        return tilt
`,'Mỗi node góp |tổng trái − tổng phải|; cộng các độ lệch từ dưới lên.','O(n)','O(height)',{kinds:['tree'],difficulty:'easy',focus:['left','right','tilt']});
add(564,'Find the Closest Palindrome','string',['123'],'121',`
class Solution:
    def nearestPalindromic(self, n):
        value, length = int(n), len(n)
        candidates = {10**(length-1)-1, 10**length+1}
        prefix = int(n[:(length+1)//2])
        for middle in (prefix-1, prefix, prefix+1):
            text = str(middle)
            palindrome = text + (text[:-1] if length % 2 else text)[::-1]
            candidates.add(int(palindrome))
        candidates.discard(value)
        return str(min(candidates, key=lambda x: (abs(value-x), x)))
`,'Chỉ cần gương của nửa đầu ±1 và hai mốc đổi số chữ số; hòa thì chọn số nhỏ.','O(number of digits)','O(number of digits)',{difficulty:'hard',focus:['candidates','prefix']});
add(565,'Array Nesting','graph',[[5,4,0,3,1,6,2]],4,`
class Solution:
    def arrayNesting(self, nums):
        assert sorted(nums) == list(range(len(nums)))
        visited, answer = set(), 0
        for start in range(len(nums)):
            current, length = start, 0
            while current not in visited:
                visited.add(current)
                current = nums[current]
                length += 1
            answer = max(answer, length)
        return answer
`,'Mỗi phần tử là mũi tên tới chỉ số kế; đo vòng dài nhất và không thăm lại vòng cũ.','O(n)','O(n)',{focus:['nums','visited','current','length']});
add(568,'Maximum Vacation Days','dp',[[[0,1,1],[1,0,1],[1,1,0]],[[1,3,1],[6,0,3],[3,3,3]]],12,`
class Solution:
    def maxVacationDays(self, flights, days):
        n = len(flights)
        dp = [-float('inf')] * n
        dp[0] = 0
        for week in range(len(days[0])):
            following = [-float('inf')] * n
            for city in range(n):
                for destination in range(n):
                    if city == destination or flights[city][destination]:
                        following[destination] = max(following[destination], dp[city] + days[destination][week])
            dp = following
        return max(dp)
`,'Mỗi tuần chọn ở lại hoặc bay; dp[thành phố] giữ tổng ngày nghỉ tốt nhất tới tuần đó.','O(weeks·cities²)','O(cities)',{difficulty:'hard',focus:['days','dp','following']});
add(569,'Median Employee Salary','sql',[[{id:1,company:'A',salary:100},{id:2,company:'A',salary:200},{id:3,company:'A',salary:300}]], [{id:2,company:'A',salary:200}],`
class Solution:
    def medianEmployees(self, employees):
        groups, answer = {}, []
        for row in employees:
            groups.setdefault(row['company'], []).append(row)
        for company in sorted(groups):
            ranked = sorted(groups[company], key=lambda r: (r['salary'], r['id']))
            n = len(ranked)
            answer.extend(ranked[(n-1)//2:n//2+1])
        return answer
`,'Xếp lương trong từng công ty; lấy một hoặc hai dòng ở giữa, phá hòa bằng id.','O(n log n)','O(n)',{difficulty:'hard',reference:'WITH r AS (SELECT *,ROW_NUMBER() OVER(PARTITION BY company ORDER BY salary,id) rn,COUNT(*) OVER(PARTITION BY company) n FROM Employee) SELECT id,company,salary FROM r WHERE rn IN (FLOOR((n+1)/2),FLOOR((n+2)/2));'});
add(570,'Managers with at Least 5 Direct Reports','sql',[[{id:1,name:'John',managerId:null},...Array.from({length:5},(_,i)=>({id:i+2,name:'E'+i,managerId:1}))]],['John'],`
class Solution:
    def managers(self, employees):
        from collections import Counter
        reports = Counter(e['managerId'] for e in employees)
        return [e['name'] for e in employees if reports[e['id']] >= 5]
`,'Đếm nhân viên báo cáo trực tiếp cho mỗi managerId; giữ người có ít nhất 5.','O(n)','O(n)',{reference:'SELECT e.name FROM Employee e JOIN Employee r ON r.managerId=e.id GROUP BY e.id,e.name HAVING COUNT(*)>=5;'});
add(571,'Find Median Given Frequency of Numbers','sql',[[{num:0,frequency:7},{num:1,frequency:1},{num:2,frequency:3},{num:3,frequency:1}]],0,`
class Solution:
    def median(self, numbers):
        ranked = sorted(numbers, key=lambda r: r['num'])
        count = sum(r['frequency'] for r in ranked)
        targets = [(count+1)//2, (count+2)//2]
        cumulative, middle = 0, []
        for row in ranked:
            previous = cumulative
            cumulative += row['frequency']
            for target in targets:
                if previous < target <= cumulative:
                    middle.append(row['num'])
        return sum(middle) / 2
`,'Không bung dữ liệu: tổng tần suất cho biết hai vị trí giữa nằm trong nhóm số nào.','O(n log n)','O(n)',{difficulty:'hard',reference:'WITH r AS (SELECT num,frequency,SUM(frequency) OVER(ORDER BY num) hi,SUM(frequency) OVER() n FROM Numbers) SELECT AVG(num) median FROM r WHERE hi>=FLOOR((n+1)/2) AND hi-frequency<FLOOR((n+2)/2);'});
add(573,'Squirrel Simulation','math',[5,7,[2,2],[4,4],[[3,0],[2,5]]],12,`
class Solution:
    def minDistance(self, height, width, tree, squirrel, nuts):
        def distance(a,b):
            return abs(a[0]-b[0]) + abs(a[1]-b[1])
        baseline = sum(2 * distance(tree,nut) for nut in nuts)
        saving = max(distance(tree,nut) - distance(squirrel,nut) for nut in nuts)
        return baseline - saving
`,'Mọi hạt đều đi-về từ cây, trừ hạt đầu khởi hành từ sóc; chọn khoản tiết kiệm lớn nhất.','O(n)','O(1)');
add(574,'Winning Candidate','sql',[[{id:1,name:'A'},{id:2,name:'B'}],[1,2,2]],'B',`
class Solution:
    def winner(self, candidates, votes):
        from collections import Counter
        counts = Counter(votes)
        winner = max(counts, key=counts.get)
        return next(c['name'] for c in candidates if c['id'] == winner)
`,'Đếm phiếu theo mã ứng viên; nối mã nhiều phiếu nhất với tên ứng viên.','O(v+c)','O(c)',{reference:'SELECT name FROM Candidate WHERE id=(SELECT candidateId FROM Vote GROUP BY candidateId ORDER BY COUNT(*) DESC LIMIT 1);'});
add(575,'Distribute Candies','array',[[1,1,2,2,3,3]],3,`
class Solution:
    def distributeCandies(self, candyType):
        kinds = len(set(candyType))
        allowance = len(candyType) // 2
        return min(kinds, allowance)
`,'Số loại ăn được không vượt số loại đang có, cũng không vượt số kẹo được chia.','O(n)','O(n)',{difficulty:'easy'});
add(576,'Out of Boundary Paths','dp',[2,2,2,0,0],6,`
class Solution:
    def findPaths(self, m, n, maxMove, startRow, startColumn):
        assert 1 <= m <= 8 and 1 <= n <= 8 and 0 <= maxMove <= 12
        dp = [[0]*n for _ in range(m)]
        dp[startRow][startColumn] = 1
        answer, mod = 0, 10**9+7
        for move in range(maxMove):
            following = [[0]*n for _ in range(m)]
            for r in range(m):
                for c in range(n):
                    for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                        nr,nc = r+dr,c+dc
                        if 0 <= nr < m and 0 <= nc < n:
                            following[nr][nc] = (following[nr][nc]+dp[r][c])%mod
                        else:
                            answer = (answer+dp[r][c])%mod
            dp = following
        return answer
`,'Mỗi lượt lan số cách sang bốn ô; bước ra ngoài được cộng vào đáp án và không đi tiếp.','O(mn·moves)','O(mn)',{focus:['dp','following','answer']});
add(577,'Employee Bonus','sql',[[{empId:1,name:'Brad'},{empId:2,name:'John'}],[{empId:2,bonus:500}]],[{name:'Brad',bonus:null},{name:'John',bonus:500}],`
class Solution:
    def bonuses(self, employee, bonus):
        amounts = {r['empId']:r['bonus'] for r in bonus}
        answer = []
        for row in employee:
            value = amounts.get(row['empId'])
            if value is None or value < 1000:
                answer.append(dict(name=row['name'],bonus=value))
        return answer
`,'LEFT JOIN giữ cả nhân viên chưa có thưởng; lọc thưởng dưới 1000 hoặc NULL.','O(e+b)','O(b+output)',{difficulty:'easy',reference:'SELECT e.name,b.bonus FROM Employee e LEFT JOIN Bonus b ON e.empId=b.empId WHERE b.bonus<1000 OR b.bonus IS NULL;'});
add(578,'Get Highest Answer Rate Question','sql',[[{question_id:1,action:'show'},{question_id:1,action:'answer'},{question_id:2,action:'show'}]],1,`
class Solution:
    def survey(self, events):
        from fractions import Fraction
        counts = {}
        for event in events:
            pair = counts.setdefault(event['question_id'],[0,0])
            pair[0] += event['action'] == 'answer'
            pair[1] += event['action'] == 'show'
        return min(counts,key=lambda q:(-Fraction(counts[q][0],counts[q][1] or 1),q))
`,'Tỷ lệ trả lời = số answer / số show; nếu hòa, lấy mã câu hỏi nhỏ nhất.','O(n+q)','O(q)',{reference:"SELECT question_id AS survey_log FROM SurveyLog GROUP BY question_id ORDER BY SUM(action='answer')/SUM(action='show') DESC,question_id LIMIT 1;"});
add(579,'Find Cumulative Salary of an Employee','sql',[[{id:1,month:1,salary:20},{id:1,month:2,salary:30},{id:1,month:3,salary:40},{id:1,month:4,salary:60}]],[{id:1,month:3,Salary:90},{id:1,month:2,Salary:50},{id:1,month:1,Salary:20}],`
class Solution:
    def cumulative(self, employees):
        latest = {}
        for row in employees:
            latest[row['id']] = max(latest.get(row['id'],0),row['month'])
        answer = []
        for row in sorted(employees,key=lambda r:(r['id'],-r['month'])):
            if row['month'] != latest[row['id']]:
                total = sum(r['salary'] for r in employees if r['id']==row['id'] and row['month']-2<=r['month']<=row['month'])
                answer.append(dict(id=row['id'],month=row['month'],Salary=total))
        return answer
`,'Cộng lương tháng hiện tại và hai tháng trước; bỏ tháng mới nhất của từng nhân viên.','O(n²)','O(n)',{difficulty:'hard',reference:'SELECT e.id,e.month,SUM(p.salary) Salary FROM Employee e JOIN Employee p ON p.id=e.id AND p.month BETWEEN e.month-2 AND e.month WHERE e.month<(SELECT MAX(month) FROM Employee x WHERE x.id=e.id) GROUP BY e.id,e.month ORDER BY e.id,e.month DESC;'});
add(580,'Count Student Number in Departments','sql',[[{dept_id:1,dept_name:'Engineering'},{dept_id:2,dept_name:'Science'}],[{student_id:1,dept_id:1}]],[{dept_name:'Engineering',student_number:1},{dept_name:'Science',student_number:0}],`
class Solution:
    def counts(self, departments, students):
        from collections import Counter
        counts = Counter(s['dept_id'] for s in students)
        answer = [dict(dept_name=d['dept_name'],student_number=counts[d['dept_id']]) for d in departments]
        return sorted(answer,key=lambda r:(-r['student_number'],r['dept_name']))
`,'Giữ mọi khoa, kể cả khoa không có sinh viên; đếm rồi xếp số lượng giảm dần.','O(s+d log d)','O(d)',{reference:'SELECT d.dept_name,COUNT(s.student_id) student_number FROM Department d LEFT JOIN Student s ON s.dept_id=d.dept_id GROUP BY d.dept_id,d.dept_name ORDER BY student_number DESC,d.dept_name;'});
add(582,'Kill Process','graph',[[1,3,10,5],[3,0,5,3],5],[5,10],`
class Solution:
    def killProcess(self, pid, ppid, kill):
        from collections import defaultdict,deque
        children = defaultdict(list)
        for child,parent in zip(pid,ppid):
            children[parent].append(child)
        queue,answer = deque([kill]),[]
        while queue:
            current = queue.popleft()
            answer.append(current)
            queue.extend(children[current])
        return answer
`,'Bắt đầu ở tiến trình bị dừng; lần theo mọi cạnh cha → con để tìm toàn bộ hậu duệ.','O(n)','O(n)');
add(584,'Find Customer Referee','sql',[[{id:1,name:'Will',referee_id:null},{id:2,name:'Jane',referee_id:2},{id:3,name:'Alex',referee_id:1}]],['Will','Alex'],`
class Solution:
    def customers(self, rows):
        answer = []
        for row in rows:
            if row['referee_id'] is None or row['referee_id'] != 2:
                answer.append(row['name'])
        return answer
`,'Lấy người không được mã 2 giới thiệu; NULL cũng phải được giữ lại.','O(n)','O(output)',{difficulty:'easy',reference:'SELECT name FROM Customer WHERE referee_id<>2 OR referee_id IS NULL;'});
add(585,'Investments in 2016','sql',[[{tiv_2015:10,tiv_2016:5,lat:10,lon:10},{tiv_2015:10,tiv_2016:20,lat:20,lon:20},{tiv_2015:20,tiv_2016:30,lat:30,lon:30}]],25,`
class Solution:
    def investments(self, insurance):
        from collections import Counter
        from decimal import Decimal,ROUND_HALF_UP
        previous = Counter(r['tiv_2015'] for r in insurance)
        locations = Counter((r['lat'],r['lon']) for r in insurance)
        total = Decimal(0)
        for row in insurance:
            if previous[row['tiv_2015']]>1 and locations[row['lat'],row['lon']]==1:
                total += Decimal(str(row['tiv_2016']))
        return float(total.quantize(Decimal('0.01'),rounding=ROUND_HALF_UP))
`,'Chỉ cộng hồ sơ có giá trị năm trước bị trùng nhưng tọa độ là duy nhất.','O(n)','O(n)',{reference:'SELECT ROUND(SUM(tiv_2016),2) tiv_2016 FROM Insurance WHERE tiv_2015 IN (SELECT tiv_2015 FROM Insurance GROUP BY tiv_2015 HAVING COUNT(*)>1) AND (lat,lon) IN (SELECT lat,lon FROM Insurance GROUP BY lat,lon HAVING COUNT(*)=1);'});
add(586,'Customer Placing the Largest Number of Orders','sql',[[1,2,2,3]],2,`
class Solution:
    def largestOrders(self, customers):
        from collections import Counter
        counts = Counter(customers)
        return max(counts,key=counts.get)
`,'Gom đơn hàng theo khách; chọn khách có nhóm lớn nhất.','O(n)','O(customers)',{difficulty:'easy',reference:'SELECT customer_number FROM Orders GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1;'});
for(const [id,title,post]of[[589,'N-ary Tree Preorder Traversal',false],[590,'N-ary Tree Postorder Traversal',true]])add(id,title,'tree',[[1,[[3,[[5,[]],[6,[]]]],[2,[]],[4,[]]]]],post?[5,6,3,2,4,1]:[1,3,5,6,2,4],`
class Solution:
    def traverse(self, root):
        answer = []
        def visit(node):
            if node is None:
                return
            value,children = node
${post?'':'            answer.append(value)\n'}            for child in children:
                visit(child)
${post?'            answer.append(value)\n':''}        visit(root)
        return answer
`,post?'Thăm hết các con trước, rồi mới ghi giá trị node cha.':'Ghi giá trị node cha trước, rồi thăm lần lượt từng con.','O(n)','O(height + output)',{difficulty:'easy',description:'N-ary nodes use [value, children] JSON form.'});
add(591,'Tag Validator','string',['<DIV>This is the first line <![CDATA[<div>]]></DIV>'],true,`
class Solution:
    def isValid(self, code):
        stack,index = [],0
        while index < len(code):
            if index and not stack:
                return False
            if code.startswith('<![CDATA[',index):
                if not stack:
                    return False
                end = code.find(']]>',index+9)
                if end == -1:
                    return False
                index = end+3
            elif code[index] == '<':
                end = code.find('>',index+1)
                if end == -1:
                    return False
                closing = code.startswith('</',index)
                name = code[index+2:end] if closing else code[index+1:end]
                if not 1<=len(name)<=9 or not all('A'<=c<='Z' for c in name):
                    return False
                if closing:
                    if not stack or stack.pop()!=name:
                        return False
                else:
                    stack.append(name)
                index = end+1
            else:
                if not stack:
                    return False
                index += 1
        return bool(code) and not stack
`,'Ngăn xếp kiểm tra cặp thẻ; CDATA được xem như văn bản, và chỉ có một thẻ gốc.','O(n)','O(n)',{difficulty:'hard',focus:['stack','name','index']});
add(592,'Fraction Addition and Subtraction','math',['-1/2+1/2+1/3'],'1/3',`
class Solution:
    def fractionAddition(self, expression):
        import re,math
        numerator,denominator = 0,1
        for a,b in re.findall(r'([+-]?[0-9]+)/([0-9]+)',expression):
            a,b = int(a),int(b)
            numerator,denominator = numerator*b+a*denominator,denominator*b
            divisor = math.gcd(numerator,denominator)
            numerator //= divisor
            denominator //= divisor
        return str(numerator)+'/'+str(denominator)
`,'Quy đồng từng phân số vào tổng hiện tại; rút gọn bằng ước chung lớn nhất sau mỗi bước.','O(terms·log denominator)','O(number of digits)');
add(593,'Valid Square','math',[[0,0],[1,1],[1,0],[0,1]],true,`
class Solution:
    def validSquare(self, p1,p2,p3,p4):
        points = [p1,p2,p3,p4]
        distances = []
        for i in range(4):
            for j in range(i):
                distances.append((points[i][0]-points[j][0])**2+(points[i][1]-points[j][1])**2)
        distances.sort()
        return distances[0]>0 and len(set(distances[:4]))==1 and distances[4]==distances[5]==2*distances[0]
`,'Sáu khoảng cách gồm bốn cạnh bằng nhau và hai đường chéo có bình phương dài gấp đôi cạnh.','O(1)','O(1)');
add(594,'Longest Harmonious Subsequence','array',[[1,3,2,2,5,2,3,7]],5,`
class Solution:
    def findLHS(self, nums):
        from collections import Counter
        counts = Counter(nums)
        answer = 0
        for value in counts:
            if value+1 in counts:
                answer = max(answer,counts[value]+counts[value+1])
        return answer
`,'Dãy hợp lệ chỉ dùng hai giá trị kề nhau x và x+1; cộng hai tần suất.','O(n)','O(n)',{difficulty:'easy'});
add(595,'Big Countries','sql',[[{name:'Afghanistan',population:25500100,area:652230},{name:'Albania',population:2831741,area:28748}]], [{name:'Afghanistan',population:25500100,area:652230}],`
class Solution:
    def bigCountries(self, world):
        answer = []
        for row in world:
            if row['area']>=3000000 or row['population']>=25000000:
                answer.append({k:row[k] for k in ('name','population','area')})
        return answer
`,'Chỉ cần đạt một trong hai ngưỡng: diện tích lớn HOẶC dân số đông.','O(n)','O(output)',{difficulty:'easy',reference:'SELECT name,population,area FROM World WHERE area>=3000000 OR population>=25000000;'});
add(596,'Classes With at Least 5 Students','sql',[[{student:'A',class:'Math'},{student:'B',class:'Math'},{student:'C',class:'Math'},{student:'D',class:'Math'},{student:'E',class:'Math'}]],['Math'],`
class Solution:
    def classes(self, courses):
        groups = {}
        for row in courses:
            groups.setdefault(row['class'],set()).add(row['student'])
        return sorted(name for name,students in groups.items() if len(students)>=5)
`,'Gom theo lớp, đếm sinh viên khác nhau, rồi giữ lớp có ít nhất 5 người.','O(n)','O(n)',{difficulty:'easy',reference:'SELECT class FROM Courses GROUP BY class HAVING COUNT(DISTINCT student)>=5;'});
add(597,'Friend Requests I: Overall Acceptance Rate','sql',[[[1,2],[1,2],[2,3]],[[1,2]]],0.5,`
class Solution:
    def acceptanceRate(self, requests, accepted):
        from decimal import Decimal,ROUND_HALF_UP
        sent = set(map(tuple,requests))
        approved = set(map(tuple,accepted))
        if not sent:
            return 0.0
        return float((Decimal(len(approved))/len(sent)).quantize(Decimal('0.01'),rounding=ROUND_HALF_UP))
`,'Loại cặp trùng trước khi tính số chấp nhận / số gửi; không có yêu cầu thì trả 0.','O(n+m)','O(n+m)',{difficulty:'easy',reference:'SELECT COALESCE(ROUND((SELECT COUNT(*) FROM (SELECT DISTINCT requester_id,accepter_id FROM RequestAccepted) a)/(SELECT COUNT(*) FROM (SELECT DISTINCT sender_id,send_to_id FROM FriendRequest) r),2),0) accept_rate;'});
add(598,'Range Addition II','array',[3,3,[[2,2],[3,3]]],4,`
class Solution:
    def maxCount(self, m,n,ops):
        rows,cols = m,n
        for a,b in ops:
            rows = min(rows,a)
            cols = min(cols,b)
        return rows*cols
`,'Vùng tăng nhiều nhất là phần giao của mọi hình chữ nhật bắt đầu từ góc trên trái.','O(operations)','O(1)',{difficulty:'easy'});
add(599,'Minimum Index Sum of Two Lists','array',[['Shogun','Tapioca Express','Burger King','KFC'],['Piatti','The Grill at Torrey Pines','Hungry Hunter Steakhouse','Shogun']],['Shogun'],`
class Solution:
    def findRestaurant(self, list1,list2):
        positions = {name:i for i,name in enumerate(list1)}
        best,answer = float('inf'),[]
        for j,name in enumerate(list2):
            if name in positions:
                total = positions[name]+j
                if total < best:
                    best,answer = total,[name]
                elif total == best:
                    answer.append(name)
        return answer
`,'Tên phải xuất hiện ở cả hai danh sách; giữ các tên có tổng hai chỉ số nhỏ nhất.','O(n+m)','O(n)',{difficulty:'easy'});
module.exports=lessons;
