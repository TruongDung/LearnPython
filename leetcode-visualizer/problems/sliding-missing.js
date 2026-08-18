// Additional sliding-window visualizations. Every snapshot highlights exactly one source line.

function indices(start, end) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, offset) => start + offset);
}

function mapText(map) {
  const entries = [...map.entries()];
  return entries.length ? `{${entries.map(([key, value]) => `${key}:${value}`).join(", ")}}` : "{}";
}

function arraySnapshot(steps, values, options) {
  const left = options.left ?? 0;
  const right = options.right ?? -1;
  steps.push({
    title: options.title,
    arr: [...values],
    sub: values.map((_, index) => `[${index}]`),
    highlight: options.highlight ?? indices(left, right),
    mark: options.mark || [],
    final: Boolean(options.final),
    codeLines: [options.line],
    vars: options.vars || [],
    note: options.note,
    ...(options.freq ? { slidingFreqView: {
      nums: [...values], label: options.label || "nums", left, right,
      window: indices(left, right), best: options.best || [], freq: options.freq,
      k: options.k ?? 0, mode: options.mode || "frequency", activeValue: options.activeValue,
      overLimit: Boolean(options.overLimit), ans: options.answer ?? 0, done: Boolean(options.final),
    } } : {}),
  });
}

function buildSteps1456(input, params = {}) {
  const chars = [...String(input ?? "")]; const k = Number(params.k ?? 3);
  if (!Number.isInteger(k) || k < 1 || k > chars.length) throw new Error("k must be between 1 and the string length");
  const vowels = new Set("aeiouAEIOU"); const steps = []; let count = 0; let answer = 0; let bestLeft = 0;
  const snap = (title, line, right = -1, note, extra = {}) => arraySnapshot(steps, chars, { title, line, left: extra.left ?? Math.max(0, right - k + 1), right, mark: extra.mark, final: extra.final, note, label: "s", freq: { vowels: count }, k, activeValue: extra.activeValue, answer, best: indices(bestLeft, bestLeft + k - 1), vars: [{ name: "k", value: k }, { name: "vowels", value: count }, { name: "ans", value: answer }, ...(extra.vars || [])] });
  snap({ vi: "Khởi tạo số nguyên âm", en: "Initialize vowel count" }, 3, -1, { vi: "Đếm nguyên âm trong cửa sổ dài k.", en: "Count vowels in each length-k window." });
  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right]; snap({ vi: `Xét s[${right}] = ${JSON.stringify(ch)}`, en: `Inspect s[${right}] = ${JSON.stringify(ch)}` }, 5, right, { vi: "Mở rộng cửa sổ sang phải.", en: "Expand the window to the right." }, { activeValue: ch });
    if (vowels.has(ch)) { count++; snap({ vi: `${JSON.stringify(ch)} là nguyên âm → count = ${count}`, en: `${JSON.stringify(ch)} is a vowel → count = ${count}` }, 6, right, { vi: "Thêm nguyên âm mới vào số đếm.", en: "Include the new vowel in the count." }, { activeValue: ch }); }
    if (right >= k) { const outgoing = chars[right - k]; snap({ vi: `Cửa sổ quá k → bỏ s[${right - k}]`, en: `Window exceeds k → remove s[${right - k}]` }, 7, right, { vi: "Giữ chính xác k ký tự.", en: "Keep exactly k characters." }); if (vowels.has(outgoing)) { count--; snap({ vi: `Bỏ nguyên âm ${JSON.stringify(outgoing)} → count = ${count}`, en: `Remove vowel ${JSON.stringify(outgoing)} → count = ${count}` }, 8, right, { vi: "Trừ nguyên âm rời cửa sổ.", en: "Subtract the outgoing vowel." }); } }
    if (right >= k - 1) { const old = answer; if (count > answer) { answer = count; bestLeft = right - k + 1; } snap({ vi: `ans = max(${old}, ${count}) → ${answer}`, en: `ans = max(${old}, ${count}) → ${answer}` }, 9, right, { vi: "Lưu số nguyên âm lớn nhất của một cửa sổ k ký tự.", en: "Record the best vowel count for a k-character window." }, { mark: count > old ? indices(right - k + 1, right) : [] }); }
  }
  snap({ vi: `return ans → ${answer}`, en: `return ans → ${answer}` }, 10, bestLeft + k - 1, { vi: "Đây là số nguyên âm lớn nhất có thể.", en: "This is the largest possible vowel count." }, { left: bestLeft, mark: indices(bestLeft, bestLeft + k - 1), final: true });
  return { original: String(input ?? ""), k, answer, steps };
}

function buildSteps1343(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : []; const k = Number(params.k ?? 3); const threshold = Number(params.threshold ?? 4);
  if (!Number.isInteger(k) || k < 1 || k > nums.length || !Number.isFinite(threshold)) throw new Error("k must fit nums and threshold must be numeric");
  const steps = []; let sum = 0; let answer = 0;
  const snap = (title, line, right = -1, note, extra = {}) => arraySnapshot(steps, nums, { title, line, left: Math.max(0, right - k + 1), right, mark: extra.mark, final: extra.final, note, vars: [{ name: "k", value: k }, { name: "threshold", value: threshold }, { name: "windowSum", value: sum }, { name: "requiredSum", value: k * threshold }, { name: "ans", value: answer }, ...(extra.vars || [])] });
  snap({ vi: "Khởi tạo windowSum và ans", en: "Initialize windowSum and ans" }, 3, -1, { vi: "So sánh tổng cửa sổ với k × threshold để tránh số thực.", en: "Compare the window sum with k × threshold to avoid floating point values." });
  for (let right = 0; right < nums.length; right++) { const value = nums[right]; snap({ vi: `Xét nums[${right}] = ${value}`, en: `Inspect nums[${right}] = ${value}` }, 5, right, { vi: "Mở rộng cửa sổ.", en: "Expand the window." }); sum += value; snap({ vi: `windowSum += ${value} → ${sum}`, en: `windowSum += ${value} → ${sum}` }, 6, right, { vi: "Cộng phần tử mới.", en: "Add the incoming item." }); if (right >= k) { const outgoing = nums[right - k]; sum -= outgoing; snap({ vi: `windowSum -= ${outgoing} → ${sum}`, en: `windowSum -= ${outgoing} → ${sum}` }, 7, right, { vi: "Bỏ phần tử cũ để giữ cửa sổ dài k.", en: "Remove the old item to keep a length-k window." }); } if (right >= k - 1) { const qualifies = sum >= k * threshold; snap({ vi: `${sum} ≥ ${k * threshold}? ${qualifies}`, en: `${sum} ≥ ${k * threshold}? ${qualifies}` }, 8, right, { vi: "Điều này tương đương average ≥ threshold.", en: "This is equivalent to average ≥ threshold." }); if (qualifies) { answer++; snap({ vi: `ans += 1 → ${answer}`, en: `ans += 1 → ${answer}` }, 9, right, { vi: "Đếm cửa sổ đạt ngưỡng.", en: "Count this qualifying window." }, { mark: indices(right - k + 1, right) }); } } }
  snap({ vi: `return ans → ${answer}`, en: `return ans → ${answer}` }, 10, nums.length - 1, { vi: "Đã đếm mọi cửa sổ hợp lệ.", en: "All qualifying windows are counted." }, { final: true }); return { original: nums, k, threshold, answer, steps };
}

function buildSteps1423(input, params = {}) {
  const cards = Array.isArray(input) ? input.map(Number) : []; const k = Number(params.k ?? 3);
  if (!Number.isInteger(k) || k < 0 || k > cards.length) throw new Error("k must be between 0 and cardPoints.length");
  const steps = []; const total = cards.reduce((a, b) => a + b, 0); const keep = cards.length - k; let window = 0; let minWindow = Infinity;
  const snap = (title, line, left = 0, right = -1, note, extra = {}) => arraySnapshot(steps, cards, { title, line, left, right, mark: extra.mark, final: extra.final, note, vars: [{ name: "k", value: k }, { name: "total", value: total }, { name: "keep", value: keep }, { name: "windowSum", value: window }, { name: "minKeep", value: Number.isFinite(minWindow) ? minWindow : "∞" }, ...(extra.vars || [])] });
  snap({ vi: `total = ${total}, keep = n - k = ${keep}`, en: `total = ${total}, keep = n - k = ${keep}` }, 3, 0, -1, { vi: "Thay vì chọn hai đầu, tìm tổng nhỏ nhất của đoạn giữa phải bỏ.", en: "Instead of choosing both ends, find the minimum middle segment to leave behind." });
  if (keep === 0) { snap({ vi: `return total → ${total}`, en: `return total → ${total}` }, 4, 0, cards.length - 1, { vi: "Lấy mọi lá bài.", en: "Take every card." }, { mark: indices(0, cards.length - 1), final: true }); return { original: cards, k, answer: total, steps }; }
  for (let right = 0; right < cards.length; right++) { window += cards[right]; snap({ vi: `windowSum += ${cards[right]} → ${window}`, en: `windowSum += ${cards[right]} → ${window}` }, 6, Math.max(0, right - keep + 1), right, { vi: "Mở rộng đoạn giữa.", en: "Expand the middle segment." }); if (right >= keep) { window -= cards[right - keep]; snap({ vi: `windowSum -= ${cards[right - keep]} → ${window}`, en: `windowSum -= ${cards[right - keep]} → ${window}` }, 7, right - keep + 1, right, { vi: "Giữ đoạn giữa dài đúng keep.", en: "Keep the middle segment at exactly keep cards." }); } if (right >= keep - 1) { const old = minWindow; minWindow = Math.min(minWindow, window); snap({ vi: `minKeep = min(${Number.isFinite(old) ? old : "∞"}, ${window}) → ${minWindow}`, en: `minKeep = min(${Number.isFinite(old) ? old : "∞"}, ${window}) → ${minWindow}` }, 8, right - keep + 1, right, { vi: "Đoạn giữa nhỏ nhất để lại nhiều điểm nhất ở hai đầu.", en: "The smallest middle segment leaves the most points at both ends." }); } }
  const answer = total - minWindow; snap({ vi: `return total - minKeep = ${answer}`, en: `return total - minKeep = ${answer}` }, 9, 0, cards.length - 1, { vi: "Tổng ngoài đoạn giữa tối thiểu là đáp án.", en: "The sum outside the minimum middle segment is the answer." }, { final: true }); return { original: cards, k, answer, steps };
}

function buildSteps1052(input, params = {}) {
  const customers = Array.isArray(input) ? input.map(Number) : []; const grumpy = String(params.grumpy ?? "0,1,0,1,0,1,0,1").split(",").map((value) => Number(value.trim())); const minutes = Number(params.minutes ?? 3);
  if (grumpy.length !== customers.length || grumpy.some((v) => v !== 0 && v !== 1) || !Number.isInteger(minutes) || minutes < 1 || minutes > customers.length) throw new Error("grumpy must be 0/1 values matching customers and minutes must fit");
  const steps = []; let baseline = 0; for (let i = 0; i < customers.length; i++) if (!grumpy[i]) baseline += customers[i]; let extra = 0; let bestExtra = 0; let bestLeft = 0;
  const snap = (title, line, right = -1, note, extraOptions = {}) => arraySnapshot(steps, customers, { title, line, left: Math.max(0, right - minutes + 1), right, mark: extraOptions.mark, final: extraOptions.final, note, vars: [{ name: "grumpy", value: `[${grumpy.join(", ")}]` }, { name: "minutes", value: minutes }, { name: "baseline", value: baseline }, { name: "extraSatisfied", value: extra }, { name: "bestExtra", value: bestExtra }, ...(extraOptions.vars || [])] });
  snap({ vi: `baseline = ${baseline}`, en: `baseline = ${baseline}` }, 4, -1, { vi: "Khách ở các phút không grumpy luôn hài lòng.", en: "Customers during non-grumpy minutes are always satisfied." });
  for (let right = 0; right < customers.length; right++) { snap({ vi: `Xét phút ${right}`, en: `Inspect minute ${right}` }, 6, right, { vi: "Trượt kỹ thuật bí mật qua thời gian.", en: "Slide the secret technique through time." }); if (grumpy[right]) { extra += customers[right]; snap({ vi: `extra += ${customers[right]} → ${extra}`, en: `extra += ${customers[right]} → ${extra}` }, 7, right, { vi: "Kỹ thuật cứu khách ở phút grumpy này.", en: "The technique rescues customers at this grumpy minute." }); } if (right >= minutes && grumpy[right - minutes]) { extra -= customers[right - minutes]; snap({ vi: `extra -= ${customers[right - minutes]} → ${extra}`, en: `extra -= ${customers[right - minutes]} → ${extra}` }, 8, right, { vi: "Cửa sổ bỏ phút grumpy đã rời đi.", en: "The window drops the outgoing grumpy minute." }); } if (right >= minutes - 1) { const old = bestExtra; if (extra > bestExtra) { bestExtra = extra; bestLeft = right - minutes + 1; } snap({ vi: `bestExtra = max(${old}, ${extra}) → ${bestExtra}`, en: `bestExtra = max(${old}, ${extra}) → ${bestExtra}` }, 9, right, { vi: "Chọn cửa sổ bí mật tốt nhất.", en: "Choose the best secret-technique window." }, { mark: extra > old ? indices(right - minutes + 1, right) : [] }); } }
  const answer = baseline + bestExtra; snap({ vi: `return baseline + bestExtra = ${answer}`, en: `return baseline + bestExtra = ${answer}` }, 10, bestLeft + minutes - 1, { vi: "Khách luôn hài lòng cộng khách được cứu.", en: "Always-satisfied customers plus rescued customers." }, { mark: indices(bestLeft, bestLeft + minutes - 1), final: true }); return { original: customers, grumpy, minutes, answer, steps };
}

function buildSteps862(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : []; const k = Number(params.k ?? 3); if (!Number.isFinite(k)) throw new Error("k must be numeric");
  const prefix = [0]; nums.forEach((value) => prefix.push(prefix[prefix.length - 1] + value)); const deque = []; const steps = []; let answer = Infinity;
  const snap = (title, line, index, note, extra = {}) => arraySnapshot(steps, nums, { title, line, left: extra.left ?? 0, right: extra.right ?? index - 1, mark: extra.mark, final: extra.final, note, vars: [{ name: "k", value: k }, { name: "i", value: index }, { name: "prefix[i]", value: prefix[index] }, { name: "deque(indices)", value: `[${deque.join(", ")}]` }, { name: "answer", value: Number.isFinite(answer) ? answer : "∞" }, ...(extra.vars || [])] });
  snap({ vi: "prefix[0] = 0, deque = []", en: "prefix[0] = 0, deque = []" }, 3, 0, { vi: "Deque giữ candidate prefix tăng dần.", en: "The deque keeps increasing candidate prefixes." });
  for (let i = 0; i < prefix.length; i++) { snap({ vi: `Xét prefix[${i}] = ${prefix[i]}`, en: `Inspect prefix[${i}] = ${prefix[i]}` }, 5, i, { vi: "Tìm start prefix tạo tổng ít nhất k.", en: "Find a start prefix that makes a sum of at least k." }); while (deque.length && prefix[i] - prefix[deque[0]] >= k) { const start = deque.shift(); const length = i - start; const old = answer; answer = Math.min(answer, length); snap({ vi: `prefix[${i}] - prefix[${start}] ≥ k → ans = ${answer}`, en: `prefix[${i}] - prefix[${start}] ≥ k → ans = ${answer}` }, 6, i, { vi: "Front tạo subarray hợp lệ; pop nó để thử subarray ngắn hơn.", en: "The front makes a valid subarray; pop it to seek a shorter one." }, { left: start, right: i - 1, mark: length < old ? indices(start, i - 1) : [] }); } while (deque.length && prefix[i] <= prefix[deque[deque.length - 1]]) { const removed = deque.pop(); snap({ vi: `prefix[${i}] ≤ prefix[${removed}] → pop back`, en: `prefix[${i}] ≤ prefix[${removed}] → pop back` }, 7, i, { vi: "Prefix lớn hơn hoặc bằng mới bị dominated.", en: "A larger-or-equal prior prefix is dominated." }); } deque.push(i); snap({ vi: `deque.append(${i})`, en: `deque.append(${i})` }, 8, i, { vi: "Lưu prefix hiện tại làm candidate cho tương lai.", en: "Store this prefix as a future candidate." }); }
  const result = Number.isFinite(answer) ? answer : -1; snap({ vi: `return ${result}`, en: `return ${result}` }, 9, prefix.length - 1, { vi: "Độ dài ngắn nhất có tổng ít nhất k, hoặc −1.", en: "The shortest length with sum at least k, or −1." }, { final: true }); return { original: nums, k, answer: result, steps };
}

function buildSteps1438(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : []; const limit = Number(params.limit ?? 4); if (!Number.isFinite(limit)) throw new Error("limit must be numeric");
  const minDeque = []; const maxDeque = []; const steps = []; let left = 0; let answer = 0; let best = [];
  const snap = (title, line, right = -1, note, extra = {}) => arraySnapshot(steps, nums, { title, line, left, right, mark: extra.mark, final: extra.final, note, vars: [{ name: "limit", value: limit }, { name: "minDeque", value: `[${minDeque.join(", ")}]` }, { name: "maxDeque", value: `[${maxDeque.join(", ")}]` }, { name: "left", value: left }, { name: "ans", value: answer }, ...(extra.vars || [])] });
  snap({ vi: "Khởi tạo hai monotonic deque", en: "Initialize two monotonic deques" }, 3, -1, { vi: "minDeque và maxDeque cho min/max cửa sổ trong O(1).", en: "minDeque and maxDeque provide window min/max in O(1)." });
  for (let right = 0; right < nums.length; right++) { snap({ vi: `Xét nums[${right}] = ${nums[right]}`, en: `Inspect nums[${right}] = ${nums[right]}` }, 5, right, { vi: "Mở rộng right.", en: "Expand right." }); while (minDeque.length && nums[minDeque[minDeque.length - 1]] > nums[right]) { minDeque.pop(); snap({ vi: "Pop minDeque back lớn hơn phần tử mới", en: "Pop a minDeque back larger than the new item" }, 6, right, { vi: "Giữ minDeque tăng dần.", en: "Keep minDeque increasing." }); } while (maxDeque.length && nums[maxDeque[maxDeque.length - 1]] < nums[right]) { maxDeque.pop(); snap({ vi: "Pop maxDeque back nhỏ hơn phần tử mới", en: "Pop a maxDeque back smaller than the new item" }, 7, right, { vi: "Giữ maxDeque giảm dần.", en: "Keep maxDeque decreasing." }); } minDeque.push(right); maxDeque.push(right); snap({ vi: `Push ${right} vào hai deque`, en: `Push ${right} into both deques` }, 8, right, { vi: "Chỉ số mới là candidate min và max.", en: "The new index is a min and max candidate." }); while (nums[maxDeque[0]] - nums[minDeque[0]] > limit) { snap({ vi: `${nums[maxDeque[0]]} - ${nums[minDeque[0]]} > ${limit} → shrink`, en: `${nums[maxDeque[0]]} - ${nums[minDeque[0]]} > ${limit} → shrink` }, 9, right, { vi: "Biên độ cửa sổ vượt limit.", en: "The window range exceeds limit." }); if (minDeque[0] === left) minDeque.shift(); if (maxDeque[0] === left) maxDeque.shift(); left++; snap({ vi: `left += 1 → ${left}`, en: `left += 1 → ${left}` }, 10, right, { vi: "Loại biên trái cũ khỏi cửa sổ.", en: "Remove the old left boundary from the window." }); } const length = right - left + 1; if (length > answer) { answer = length; best = indices(left, right); } snap({ vi: `ans = max(ans, ${length}) → ${answer}`, en: `ans = max(ans, ${length}) → ${answer}` }, 11, right, { vi: "Cửa sổ hiện tại hợp lệ.", en: "The current window is valid." }, { mark: length === answer ? indices(left, right) : [] }); }
  snap({ vi: `return ans → ${answer}`, en: `return ans → ${answer}` }, 12, best[best.length - 1] ?? -1, { vi: "Cửa sổ dài nhất có max−min không vượt limit.", en: "The longest window whose max−min does not exceed limit." }, { mark: best, final: true }); return { original: nums, limit, answer, steps };
}

function buildSteps1493(input) {
  const nums = Array.isArray(input) ? input.map(Number) : []; if (nums.some((value) => value !== 0 && value !== 1)) throw new Error("nums must be binary");
  const steps = []; let left = 0; let zeros = 0; let answer = 0; let best = [];
  const snap = (title, line, right = -1, note, extra = {}) => arraySnapshot(steps, nums, { title, line, left, right, mark: extra.mark, final: extra.final, note, freq: { 0: zeros, 1: Math.max(0, right - left + 1 - zeros) }, k: 1, activeValue: 0, overLimit: zeros > 1, answer, vars: [{ name: "left", value: left }, { name: "zeros", value: zeros }, { name: "ans", value: answer }, ...(extra.vars || [])] });
  snap({ vi: "left = zeros = ans = 0", en: "left = zeros = ans = 0" }, 3, -1, { vi: "Cửa sổ cho phép tối đa một số 0 để xóa.", en: "The window allows at most one zero to delete." });
  for (let right = 0; right < nums.length; right++) { snap({ vi: `Xét nums[${right}] = ${nums[right]}`, en: `Inspect nums[${right}] = ${nums[right]}` }, 5, right, { vi: "Mở rộng cửa sổ.", en: "Expand the window." }); if (nums[right] === 0) { zeros++; snap({ vi: `zeros += 1 → ${zeros}`, en: `zeros += 1 → ${zeros}` }, 6, right, { vi: "Số 0 này là ứng viên bị xóa.", en: "This zero is the deletion candidate." }); } while (zeros > 1) { if (nums[left] === 0) zeros--; left++; snap({ vi: `zeros > 1 → left = ${left}`, en: `zeros > 1 → left = ${left}` }, 7, right, { vi: "Thu hẹp đến khi chỉ còn một số 0.", en: "Shrink until only one zero remains." }); } const lengthAfterDelete = right - left; if (lengthAfterDelete > answer) { answer = lengthAfterDelete; best = indices(left, right); } snap({ vi: `ans = max(ans, right - left) → ${answer}`, en: `ans = max(ans, right - left) → ${answer}` }, 8, right, { vi: "Trừ một phần tử vì bắt buộc phải xóa đúng một phần tử.", en: "Subtract one because exactly one item must be deleted." }, { mark: lengthAfterDelete === answer ? best : [] }); }
  snap({ vi: `return ans → ${answer}`, en: `return ans → ${answer}` }, 9, best[best.length - 1] ?? -1, { vi: "Dãy 1 dài nhất sau một lần xóa.", en: "The longest run of ones after one deletion." }, { mark: best, final: true }); return { original: nums, answer, steps };
}

function buildSteps2024(input, params = {}) {
  const chars = [...String(input ?? "")]; const k = Number(params.k ?? 2); if (!Number.isInteger(k) || k < 0) throw new Error("k must be a non-negative integer");
  const freq = new Map(); const steps = []; let left = 0; let maxCount = 0; let answer = 0; let best = [];
  const snap = (title, line, right = -1, note, extra = {}) => arraySnapshot(steps, chars, { title, line, left, right, mark: extra.mark, final: extra.final, note, label: "answerKey", freq: Object.fromEntries(freq), k, mode: "frequency", activeValue: extra.activeValue, overLimit: extra.overLimit, answer, best, vars: [{ name: "k", value: k }, { name: "freq", value: mapText(freq) }, { name: "maxCount", value: maxCount }, { name: "left", value: left }, { name: "ans", value: answer }, ...(extra.vars || [])] });
  snap({ vi: "freq = {}, left = maxCount = ans = 0", en: "freq = {}, left = maxCount = ans = 0" }, 3, -1, { vi: "Có thể đổi tối đa k đáp án để đồng nhất cửa sổ.", en: "Up to k answers may be changed to make a window uniform." });
  for (let right = 0; right < chars.length; right++) { const ch = chars[right]; freq.set(ch, (freq.get(ch) || 0) + 1); maxCount = Math.max(maxCount, freq.get(ch)); snap({ vi: `Thêm ${ch}, maxCount = ${maxCount}`, en: `Add ${ch}, maxCount = ${maxCount}` }, 5, right, { vi: "Giữ tần suất lớn nhất trong cửa sổ.", en: "Keep the highest frequency in the window." }, { activeValue: ch }); while (right - left + 1 - maxCount > k) { const removed = chars[left]; freq.set(removed, freq.get(removed) - 1); left++; snap({ vi: `Cần > k thay đổi → bỏ ${removed}, left = ${left}`, en: `Need > k changes → remove ${removed}, left = ${left}` }, 6, right, { vi: "Cửa sổ phải cần không quá k lần đổi.", en: "The window must require no more than k changes." }, { activeValue: ch, overLimit: true }); } const length = right - left + 1; if (length > answer) { answer = length; best = indices(left, right); } snap({ vi: `ans = max(ans, ${length}) → ${answer}`, en: `ans = max(ans, ${length}) → ${answer}` }, 7, right, { vi: "Cửa sổ hợp lệ có thể thành toàn T hoặc toàn F.", en: "This valid window can become all T or all F." }, { mark: length === answer ? indices(left, right) : [] }); }
  snap({ vi: `return ans → ${answer}`, en: `return ans → ${answer}` }, 8, best[best.length - 1] ?? -1, { vi: "Độ dài chuỗi đáp án đồng nhất lớn nhất.", en: "The greatest achievable uniform answer length." }, { mark: best, final: true }); return { original: String(input ?? ""), k, answer, steps };
}

function buildSteps1838(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number).sort((a, b) => a - b) : []; const k = Number(params.k ?? 5); if (!Number.isFinite(k) || k < 0) throw new Error("k must be non-negative");
  const steps = []; let left = 0; let sum = 0; let answer = 0; let best = [];
  const snap = (title, line, right = -1, note, extra = {}) => arraySnapshot(steps, nums, { title, line, left, right, mark: extra.mark, final: extra.final, note, vars: [{ name: "k", value: k }, { name: "windowSum", value: sum }, { name: "target", value: right >= 0 ? nums[right] : "-" }, { name: "cost", value: right >= left ? nums[right] * (right - left + 1) - sum : 0 }, { name: "ans", value: answer }, ...(extra.vars || [])] });
  snap({ vi: `Sắp xếp nums → [${nums.join(", ")}]`, en: `Sort nums → [${nums.join(", ")}]` }, 3, -1, { vi: "Tăng mọi phần tử cửa sổ lên nums[right].", en: "Raise every window value to nums[right]." });
  for (let right = 0; right < nums.length; right++) { sum += nums[right]; snap({ vi: `windowSum += ${nums[right]} → ${sum}`, en: `windowSum += ${nums[right]} → ${sum}` }, 5, right, { vi: "Thêm target lớn nhất hiện tại.", en: "Add the current largest target." }); while (nums[right] * (right - left + 1) - sum > k) { const cost = nums[right] * (right - left + 1) - sum; snap({ vi: `cost = ${cost} > k → shrink`, en: `cost = ${cost} > k → shrink` }, 6, right, { vi: "Không đủ phép tăng để nâng cả cửa sổ.", en: "There are not enough increments to raise the whole window." }); sum -= nums[left]; left++; snap({ vi: `Bỏ cạnh trái → left=${left}, sum=${sum}`, en: `Remove left edge → left=${left}, sum=${sum}` }, 7, right, { vi: "Giảm chi phí bằng cách bỏ giá trị nhỏ nhất.", en: "Reduce cost by discarding the smallest value." }); } const length = right - left + 1; if (length > answer) { answer = length; best = indices(left, right); } snap({ vi: `ans = max(ans, ${length}) → ${answer}`, en: `ans = max(ans, ${length}) → ${answer}` }, 8, right, { vi: "Mọi phần tử cửa sổ có thể tăng thành target trong k phép.", en: "Every window value can be raised to target within k moves." }, { mark: length === answer ? indices(left, right) : [] }); }
  snap({ vi: `return ans → ${answer}`, en: `return ans → ${answer}` }, 9, best[best.length - 1] ?? -1, { vi: "Tần suất lớn nhất có thể đạt được.", en: "The greatest attainable frequency." }, { mark: best, final: true }); return { original: nums, k, answer, steps };
}

function parseTiles(input) {
  const parts = String(input ?? "").split(";").map((part) => part.trim()).filter(Boolean);
  const tiles = parts.map((part) => part.split(",").map((value) => Number(value.trim())));
  if (!tiles.length || tiles.some(([start, end]) => !Number.isInteger(start) || !Number.isInteger(end) || start > end)) throw new Error("tiles must be start,end intervals separated by semicolons");
  return tiles.sort((a, b) => a[0] - b[0]);
}

function buildSteps2271(input, params = {}) {
  const tiles = parseTiles(input); const carpetLen = Number(params.carpetLen ?? 10); if (!Number.isInteger(carpetLen) || carpetLen < 1) throw new Error("carpetLen must be a positive integer");
  const labels = tiles.map(([start, end]) => `[${start},${end}]`); const steps = []; let left = 0; let covered = 0; let answer = 0; let bestRight = -1;
  const snap = (title, line, right = -1, note, extra = {}) => arraySnapshot(steps, labels, { title, line, left, right, mark: extra.mark, final: extra.final, note, vars: [{ name: "carpetLen", value: carpetLen }, { name: "left", value: left }, { name: "coveredFullTiles", value: covered }, { name: "carpetStart", value: extra.carpetStart ?? "-" }, { name: "ans", value: answer }, ...(extra.vars || [])] });
  snap({ vi: "Sắp xếp các đoạn tile", en: "Sort tile intervals" }, 3, -1, { vi: "Đầu vào được duyệt từ trái sang phải.", en: "The intervals are traversed from left to right." });
  for (let right = 0; right < tiles.length; right++) { const [start, end] = tiles[right]; const length = end - start + 1; covered += length; snap({ vi: `Thêm tile [${start},${end}] → covered=${covered}`, en: `Add tile [${start},${end}] → covered=${covered}` }, 5, right, { vi: "Tạm tính tile phải được phủ toàn bộ.", en: "Temporarily count the right tile as fully covered." }); const carpetStart = end - carpetLen + 1; while (left <= right && tiles[left][1] < carpetStart) { covered -= tiles[left][1] - tiles[left][0] + 1; snap({ vi: `Tile trái kết thúc trước ${carpetStart} → bỏ nó`, en: `Left tile ends before ${carpetStart} → remove it` }, 6, right, { vi: "Tile này không thể chạm được bởi thảm kết thúc ở tile phải.", en: "This tile cannot be reached by a carpet ending at the right tile." }, { carpetStart }); left++; } const partialUncovered = Math.max(0, carpetStart - tiles[left][0]); const candidate = covered - partialUncovered; const old = answer; if (candidate > answer) { answer = candidate; bestRight = right; } snap({ vi: `covered - partial = ${candidate}; ans → ${answer}`, en: `covered - partial = ${candidate}; ans → ${answer}` }, 7, right, { vi: "Trừ phần đầu của tile trái nằm trước thảm.", en: "Subtract the part of the left tile lying before the carpet." }, { carpetStart, mark: candidate > old ? indices(left, right) : [] }); }
  snap({ vi: `return ans → ${answer}`, en: `return ans → ${answer}` }, 8, bestRight, { vi: "Số tile trắng lớn nhất một thảm có thể phủ.", en: "The most white tiles one carpet can cover." }, { mark: bestRight >= left ? indices(left, bestRight) : [], final: true }); return { original: String(input ?? ""), carpetLen, answer, steps };
}

const category = { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" };
const arrayTag = [{ key: "array", vi: "Mảng", en: "Array" }];
const stringTag = [{ key: "string", vi: "Chuỗi", en: "String" }];
function problem(id, difficulty, slug, title, statement, defaultInput, inputKind, inputLabel, extraParams, code, builder, tags = arrayTag) {
  return { id, difficulty, slug, category, tags, title: { vi: title, en: title }, titleVi: { vi: title, en: title }, statement: { vi: statement, en: statement }, defaultInput, inputKind, inputLabel: { vi: inputLabel, en: inputLabel }, extraParams, complexity: { time: "O(n)", space: "O(n)", note: { vi: "Cửa sổ trượt duyệt mỗi phần tử với số lần hữu hạn.", en: "The sliding window visits each item a bounded number of times." } }, code, builder };
}

module.exports = {
  1456: problem(1456, "medium", "maximum-number-of-vowels-in-a-substring-of-given-length", "Maximum Number of Vowels in a Substring of Given Length", "Return the greatest number of vowels in a substring of length k.", "abciiidef", "string", "s", [{ key: "k", label: { vi: "k (độ dài cửa sổ)", en: "k (window length)" }, default: 3 }], ["class Solution:", "    def maxVowels(self, s, k):", "        count = ans = 0", "        for right, ch in enumerate(s):", "            if ch in 'aeiou':", "                count += 1", "            if right >= k:", "                if s[right-k] in 'aeiou': count -= 1", "            if right >= k-1: ans = max(ans, count)", "        return ans"], buildSteps1456, stringTag),
  1343: problem(1343, "medium", "number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold", "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold", "Count length-k subarrays whose average is at least threshold.", [2, 2, 2, 2, 5, 5, 5, 8], "integer", "arr", [{ key: "k", label: { vi: "k", en: "k" }, default: 3 }, { key: "threshold", label: { vi: "ngưỡng", en: "threshold" }, default: 4 }], ["class Solution:", "    def numOfSubarrays(self, arr, k, threshold):", "        windowSum = ans = 0", "        for right, value in enumerate(arr):", "            windowSum += value", "            if right >= k:", "                windowSum -= arr[right-k]", "            if right >= k-1 and windowSum >= k*threshold:", "                ans += 1", "        return ans"], buildSteps1343),
  1423: problem(1423, "medium", "maximum-points-you-can-obtain-from-cards", "Maximum Points You Can Obtain from Cards", "Take exactly k cards from either end for the maximum score.", [1, 2, 3, 4, 5, 6, 1], "integer", "cardPoints", [{ key: "k", label: { vi: "k (số lá bài)", en: "k (cards to take)" }, default: 3 }], ["class Solution:", "    def maxScore(self, cardPoints, k):", "        total = sum(cardPoints); keep = len(cardPoints)-k", "        if keep == 0: return total", "        minKeep = float('inf'); windowSum = 0", "        for right, value in enumerate(cardPoints):", "            windowSum += value", "            if right >= keep: windowSum -= cardPoints[right-keep]", "            if right >= keep-1: minKeep = min(minKeep, windowSum)", "        return total - minKeep"], buildSteps1423),
  1052: problem(1052, "medium", "grumpy-bookstore-owner", "Grumpy Bookstore Owner", "Maximize satisfied customers by suppressing grumpiness for minutes consecutive minutes.", [1, 0, 1, 2, 1, 1, 7, 5], "integer", "customers", [{ key: "grumpy", type: "string", label: { vi: "grumpy (0/1, cách dấu phẩy)", en: "grumpy (0/1, comma separated)" }, default: "0,1,0,1,0,1,0,1" }, { key: "minutes", label: { vi: "minutes", en: "minutes" }, default: 3 }], ["class Solution:", "    def maxSatisfied(self, customers, grumpy, minutes):", "        baseline = sum(c for c,g in zip(customers,grumpy) if not g)", "        extra = bestExtra = 0", "        for right, value in enumerate(customers):", "            if grumpy[right]: extra += value", "            if right >= minutes and grumpy[right-minutes]:", "                extra -= customers[right-minutes]", "            if right >= minutes-1: bestExtra = max(bestExtra, extra)", "        return baseline + bestExtra"], buildSteps1052),
  862: problem(862, "hard", "shortest-subarray-with-sum-at-least-k", "Shortest Subarray with Sum at Least K", "Return the shortest non-empty subarray whose sum is at least k.", [2, -1, 2], "integer", "nums", [{ key: "k", label: { vi: "k (tổng tối thiểu)", en: "k (minimum sum)" }, default: 3 }], ["class Solution:", "    def shortestSubarray(self, nums, k):", "        prefix = [0]; deque = []; ans = float('inf')", "        for value in nums: prefix.append(prefix[-1] + value)", "        for i, total in enumerate(prefix):", "            while deque and total-prefix[deque[0]] >= k:", "                ans = min(ans, i-deque.pop(0))", "            while deque and total <= prefix[deque[-1]]: deque.pop()", "            deque.append(i)", "        return ans if ans < float('inf') else -1"], buildSteps862),
  1438: problem(1438, "medium", "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit", "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit", "Find the longest subarray where max minus min is at most limit.", [8, 2, 4, 7], "integer", "nums", [{ key: "limit", label: { vi: "limit", en: "limit" }, default: 4 }], ["class Solution:", "    def longestSubarray(self, nums, limit):", "        minDeque = []; maxDeque = []; left = ans = 0", "        for right, value in enumerate(nums):", "            while minDeque and nums[minDeque[-1]] > value: minDeque.pop()", "            while maxDeque and nums[maxDeque[-1]] < value: maxDeque.pop()", "            minDeque.append(right); maxDeque.append(right)", "            while nums[maxDeque[0]] - nums[minDeque[0]] > limit:", "                if minDeque[0] == left: minDeque.pop(0)", "                if maxDeque[0] == left: maxDeque.pop(0)", "                left += 1", "            ans = max(ans, right-left+1)", "        return ans"], buildSteps1438),
  1493: problem(1493, "medium", "longest-subarray-of-1s-after-deleting-one-element", "Longest Subarray of 1's After Deleting One Element", "Delete one element and return the longest remaining subarray of ones.", [1, 1, 0, 1], "binary", "nums", [], ["class Solution:", "    def longestSubarray(self, nums):", "        left = zeros = ans = 0", "        for right, value in enumerate(nums):", "            if value == 0: zeros += 1", "            while zeros > 1:", "                if nums[left] == 0: zeros -= 1", "                left += 1", "            ans = max(ans, right-left)", "        return ans"], buildSteps1493),
  2024: problem(2024, "medium", "maximize-the-confusion-of-an-exam", "Maximize the Confusion of an Exam", "Change at most k answers to maximize a consecutive run of identical answers.", "TTFF", "string", "answerKey", [{ key: "k", label: { vi: "k (số lần đổi)", en: "k (changes)" }, default: 2 }], ["class Solution:", "    def maxConsecutiveAnswers(self, answerKey, k):", "        freq = {}; left = maxCount = ans = 0", "        for right, ch in enumerate(answerKey):", "            freq[ch] = freq.get(ch, 0) + 1; maxCount = max(maxCount, freq[ch])", "            while right-left+1-maxCount > k:", "                freq[answerKey[left]] -= 1; left += 1", "            ans = max(ans, right-left+1)", "        return ans"], buildSteps2024, stringTag),
  1838: problem(1838, "medium", "frequency-of-the-most-frequent-element", "Frequency of the Most Frequent Element", "Use at most k increments to maximize the frequency of one value.", [1, 2, 4], "integer", "nums", [{ key: "k", label: { vi: "k (số phép tăng)", en: "k (increments)" }, default: 5 }], ["class Solution:", "    def maxFrequency(self, nums, k):", "        nums.sort(); left = windowSum = ans = 0", "        for right, target in enumerate(nums):", "            windowSum += target", "            while target*(right-left+1)-windowSum > k:", "                windowSum -= nums[left]; left += 1", "            ans = max(ans, right-left+1)", "        return ans"], buildSteps1838),
  2271: problem(2271, "hard", "maximum-white-tiles-covered-by-a-carpet", "Maximum White Tiles Covered by a Carpet", "Place one fixed-length carpet to cover the most white tiles.", "1,5;10,11;12,18;20,25;30,32", "string", "tiles: start,end;...", [{ key: "carpetLen", label: { vi: "carpetLen", en: "carpetLen" }, default: 10 }], ["class Solution:", "    def maximumWhiteTiles(self, tiles, carpetLen):", "        tiles.sort(); left = covered = ans = 0", "        for right, (start, end) in enumerate(tiles):", "            covered += end-start+1", "            carpetStart = end-carpetLen+1", "            while tiles[left][1] < carpetStart:", "                covered -= tiles[left][1]-tiles[left][0]+1; left += 1", "            ans = max(ans, covered-max(0, carpetStart-tiles[left][0]))", "        return ans"], buildSteps2271),
};


// Hard sliding-window visualizers merged from the former sliding-hard-missing module.
// This scope deliberately reuses the shared category, tags, indices, and mapText helpers above.
(() => {
  const text = (vi, en) => ({ vi, en });
  function snapshot(steps, arr, opts) { steps.push({ title: opts.title, arr: [...arr], sub: opts.sub || arr.map((_, i) => `[${i}]`), highlight: opts.highlight || [], mark: opts.mark || [], final: Boolean(opts.final), codeLines: [opts.line], vars: opts.vars || [], note: opts.note }); }
  function parseWords(raw) {
    const source = Array.isArray(raw) ? raw : String(raw ?? "").split(",");
    const words = source.map((word) => String(word).trim()).filter(Boolean);
    const widths = new Set(words.map((word) => word.length));
    if (!words.length || widths.size !== 1 || words[0].length === 0) {
      throw new Error("words must be non-empty, comma-separated words of equal length");
    }
    return words;
  }

  function buildSteps30(input, params = {}) {
    const s = String(input ?? "");
    const words = parseWords(params.words);
    const width = words[0].length;
    const totalWidth = words.length * width;
    const need = new Map();
    words.forEach((word) => need.set(word, (need.get(word) || 0) + 1));

    const chars = [...s];
    const genericChars = chars.length <= 500 ? chars : [];
    const steps = [];
    const answer = [];
    const completedOffsets = [];
    const frameLimit = s.length <= 120 ? 1500 : s.length <= 500 ? 600 : 220;
    let truncated = false;
    let offset = null;
    let left = 0;
    let right = 0;
    let window = new Map();
    let activeStart = null;
    let activeWord = null;
    let removedStart = null;
    let removedWord = null;
    let discardStart = null;
    let discardEnd = null;
    let matchStart = null;

    const range = (start, end) => Number.isInteger(start) && Number.isInteger(end) && start <= end
      ? Array.from({ length: end - start + 1 }, (_, index) => start + index)
      : [];
    const mapObject = (map) => Object.fromEntries([...map.entries()]);
    const resultIndices = () => answer.flatMap((start) => range(start, start + totalWidth - 1));
    const push = ({ title, note, line, phase, event, final = false, decision = "" }) => {
      if (!final && steps.length >= frameLimit) {
        truncated = true;
        return;
      }
      const windowWords = width > 0 ? Math.max(0, Math.floor((right - left) / width)) : 0;
      const activeEnd = Number.isInteger(activeStart) ? Math.min(s.length - 1, activeStart + width - 1) : null;
      steps.push({
        title,
        note,
        codeLines: [line],
        final,
        arr: [...genericChars],
        sub: genericChars.map((_, index) => `[${index}]`),
        highlight: final ? [] : range(left, right - 1),
        mark: resultIndices(),
        vars: [
          { name: "offset", value: offset ?? "-" },
          { name: "word", value: activeWord ?? "-" },
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "window words", value: windowWords },
          { name: "need", value: mapText(need) },
          { name: "window", value: mapText(window) },
          { name: "result", value: `[${answer.join(", ")}]` },
        ],
        substringConcatView: {
          s,
          words: [...words],
          width,
          totalWidth,
          need: mapObject(need),
          window: mapObject(window),
          offset,
          completedOffsets: [...completedOffsets],
          left,
          right,
          windowWords,
          activeStart,
          activeEnd,
          activeWord,
          removedStart,
          removedEnd: Number.isInteger(removedStart) ? removedStart + width - 1 : null,
          removedWord,
          discardStart,
          discardEnd,
          matchStart,
          answer: [...answer],
          phase,
          event,
          decision,
          truncated,
          final,
        },
      });
    };
    const clearTransient = () => {
      removedStart = null;
      removedWord = null;
      discardStart = null;
      discardEnd = null;
      matchStart = null;
    };

    push({
      title: text("need = Counter(words)", "need = Counter(words)"),
      note: text("Đếm số lần bắt buộc của từng word; word trùng nhau phải được giữ đúng tần suất.", "Count each required word; duplicate words must keep their exact frequency."),
      line: 3,
      phase: "prepare",
      event: "build-need",
      decision: `need = ${mapText(need)}`,
    });
    push({
      title: text("result = []", "result = []"),
      note: text("result sẽ lưu mọi chỉ số bắt đầu của một phép nối hợp lệ.", "result stores every valid concatenation start index."),
      line: 4,
      phase: "prepare",
      event: "init-result",
    });
    push({
      title: text(`width = ${width}`, `width = ${width}`),
      note: text("Mỗi lần right/left di chuyển đúng một word, không di chuyển từng ký tự.", "Each right/left move advances exactly one word, not one character."),
      line: 5,
      phase: "prepare",
      event: "set-width",
      decision: `len(words[0]) = ${width}`,
    });
    push({
      title: text(`total_width = ${words.length} × ${width} = ${totalWidth}`, `total_width = ${words.length} × ${width} = ${totalWidth}`),
      note: text("Cửa sổ chỉ MATCH khi có đúng tổng độ dài của toàn bộ words.", "The window MATCHES only at the exact combined length of all words."),
      line: 6,
      phase: "prepare",
      event: "set-total",
      decision: `${words.length} words × ${width} chars = ${totalWidth}`,
    });

    for (offset = 0; offset < width; offset++) {
      left = offset;
      right = offset;
      window = new Map();
      activeStart = null;
      activeWord = null;
      clearTransient();
      push({
        title: text(`offset = ${offset}`, `offset = ${offset}`),
        note: text(`Lane ${offset} đọc các word bắt đầu tại ${offset}, ${offset + width}, ${offset + 2 * width}, ...`, `Lane ${offset} reads words starting at ${offset}, ${offset + width}, ${offset + 2 * width}, ...`),
        line: 7,
        phase: "offset",
        event: "offset-start",
      });
      push({
        title: text(`left = right = ${offset}`, `left = right = ${offset}`),
        note: text("Hai con trỏ bắt đầu cùng vị trí nên cửa sổ đang rỗng.", "Both pointers start together, so the window is empty."),
        line: 8,
        phase: "offset",
        event: "init-pointers",
      });
      push({
        title: text("window = Counter()", "window = Counter()"),
        note: text("Counter này chỉ đếm các word hiện nằm giữa left và right.", "This Counter tracks only words currently between left and right."),
        line: 9,
        phase: "offset",
        event: "init-window",
      });

      while (right + width <= s.length) {
        clearTransient();
        push({
          title: text(`${right} + ${width} ≤ ${s.length} → tiếp tục`, `${right} + ${width} ≤ ${s.length} → continue`),
          note: text("Vẫn còn đủ ký tự để đọc trọn một word.", "Enough characters remain to read one complete word."),
          line: 10,
          phase: "read",
          event: "loop-check",
          decision: `${right + width} ≤ ${s.length}`,
        });

        activeStart = right;
        activeWord = s.slice(right, right + width);
        push({
          title: text(`Đọc word = ${JSON.stringify(activeWord)}`, `Read word = ${JSON.stringify(activeWord)}`),
          note: text(`Lấy s[${activeStart}:${activeStart + width}] theo đúng độ rộng ${width}.`, `Slice s[${activeStart}:${activeStart + width}] using word width ${width}.`),
          line: 11,
          phase: "read",
          event: "read-word",
        });

        right += width;
        push({
          title: text(`right += ${width} → ${right}`, `right += ${width} → ${right}`),
          note: text("right luôn trỏ ngay sau word vừa đọc.", "right always points just after the incoming word."),
          line: 12,
          phase: "read",
          event: "advance-right",
        });

        const required = need.has(activeWord);
        push({
          title: required
            ? text(`${JSON.stringify(activeWord)} có trong need`, `${JSON.stringify(activeWord)} is in need`)
            : text(`${JSON.stringify(activeWord)} không có trong need`, `${JSON.stringify(activeWord)} is not in need`),
          note: required
            ? text("Word hợp lệ về loại; tiếp theo kiểm tra số lượng.", "The word type is valid; next check its count.")
            : text("Không thể có đáp án nào băng qua word lạ này.", "No valid answer can cross this unknown word."),
          line: 13,
          phase: required ? "count" : "reset",
          event: required ? "known-word" : "unknown-word",
          decision: required ? "word ∈ need" : "word ∉ need",
        });

        if (!required) {
          discardStart = left;
          discardEnd = right - 1;
          window.clear();
          push({
            title: text("window.clear()", "window.clear()"),
            note: text("Xóa toàn bộ tần suất vì lane phải bắt đầu lại sau word lạ.", "Clear all frequencies because this lane must restart after the unknown word."),
            line: 14,
            phase: "reset",
            event: "reset-clear",
          });
          left = right;
          push({
            title: text(`left = right = ${right}`, `left = right = ${right}`),
            note: text("Vùng bị loại vẫn được tô đỏ ở frame này để thấy chính xác phần vừa reset.", "The discarded range remains red in this frame so the reset is explicit."),
            line: 15,
            phase: "reset",
            event: "reset-left",
          });
          push({
            title: text("continue", "continue"),
            note: text("Bỏ qua các bước đếm/shrink/match và đọc word kế tiếp trong cùng offset.", "Skip count/shrink/match and read the next word in this offset."),
            line: 16,
            phase: "reset",
            event: "reset-continue",
          });
          continue;
        }

        window.set(activeWord, (window.get(activeWord) || 0) + 1);
        push({
          title: text(`window[${activeWord}] = ${window.get(activeWord)}`, `window[${activeWord}] = ${window.get(activeWord)}`),
          note: text(`Cần ${need.get(activeWord)} bản sao của ${activeWord}.`, `${need.get(activeWord)} copies of ${activeWord} are required.`),
          line: 17,
          phase: "count",
          event: "add-word",
          decision: `${window.get(activeWord)} / ${need.get(activeWord)}`,
        });

        let shrank = false;
        while (window.get(activeWord) > need.get(activeWord)) {
          shrank = true;
          push({
            title: text(`${activeWord}: ${window.get(activeWord)} > ${need.get(activeWord)} → SHRINK`, `${activeWord}: ${window.get(activeWord)} > ${need.get(activeWord)} → SHRINK`),
            note: text("Word vừa thêm bị dư; dịch left cho đến khi tần suất hợp lệ.", "The incoming word is overrepresented; move left until its count is valid."),
            line: 18,
            phase: "shrink",
            event: "over-count",
            decision: `${window.get(activeWord)} > ${need.get(activeWord)}`,
          });
          removedStart = left;
          removedWord = s.slice(left, left + width);
          push({
            title: text(`removed = ${JSON.stringify(removedWord)}`, `removed = ${JSON.stringify(removedWord)}`),
            note: text(`Word trái nhất bắt đầu tại index ${removedStart}.`, `The leftmost word starts at index ${removedStart}.`),
            line: 19,
            phase: "shrink",
            event: "pick-remove",
          });
          const nextCount = (window.get(removedWord) || 0) - 1;
          if (nextCount > 0) window.set(removedWord, nextCount);
          else window.delete(removedWord);
          push({
            title: text(`window[${removedWord}] giảm còn ${Math.max(0, nextCount)}`, `window[${removedWord}] decreases to ${Math.max(0, nextCount)}`),
            note: text("Loại word trái nhất khỏi Counter của cửa sổ.", "Remove the leftmost word from the window Counter."),
            line: 20,
            phase: "shrink",
            event: "remove-count",
          });
          left += width;
          push({
            title: text(`left += ${width} → ${left}`, `left += ${width} → ${left}`),
            note: text("Cửa sổ mới bắt đầu sau word vừa loại.", "The new window starts after the removed word."),
            line: 21,
            phase: "shrink",
            event: "advance-left",
          });
        }

        push({
          title: text(
            `${activeWord}: ${window.get(activeWord) || 0} ≤ ${need.get(activeWord)} → ${shrank ? "dừng SHRINK" : "không cần SHRINK"}`,
            `${activeWord}: ${window.get(activeWord) || 0} ≤ ${need.get(activeWord)} → ${shrank ? "stop SHRINK" : "no SHRINK needed"}`,
          ),
          note: shrank
            ? text("Tần suất đã trở lại hợp lệ; tiếp tục kiểm tra tổng độ dài cửa sổ.", "The frequency is valid again; continue with the total window-length check.")
            : text("Word vừa thêm không bị dư nên giữ nguyên left.", "The incoming word is not overrepresented, so left stays in place."),
          line: 18,
          phase: shrank ? "shrink" : "validate",
          event: shrank ? "shrink-complete" : "count-within",
          decision: `${window.get(activeWord) || 0} ≤ ${need.get(activeWord)}`,
        });

        const exactLength = right - left === totalWidth;
        push({
          title: exactLength
            ? text(`${right} − ${left} = ${totalWidth} → MATCH`, `${right} − ${left} = ${totalWidth} → MATCH`)
            : text(`${right} − ${left} = ${right - left}; cần ${totalWidth}`, `${right} − ${left} = ${right - left}; need ${totalWidth}`),
          note: exactLength
            ? text("Đúng số word và mọi count không vượt need, nên toàn bộ frequency khớp.", "The word count is exact and no count exceeds need, so all frequencies match.")
            : text("Cửa sổ hợp lệ nhưng chưa chứa đủ toàn bộ words.", "The window is valid but does not yet contain all words."),
          line: 22,
          phase: exactLength ? "match" : "validate",
          event: exactLength ? "match-check" : "incomplete",
          decision: `${right - left} ${exactLength ? "=" : "≠"} ${totalWidth}`,
        });
        if (exactLength) {
          answer.push(left);
          matchStart = left;
          push({
            title: text(`result.append(${left})`, `result.append(${left})`),
            note: text(`s[${left}:${right}] là phép nối hợp lệ; thứ tự word có thể bất kỳ.`, `s[${left}:${right}] is a valid concatenation; word order may be arbitrary.`),
            line: 23,
            phase: "match",
            event: "save-match",
            decision: `result = [${answer.join(", ")}]`,
          });
        }
      }

      activeStart = null;
      activeWord = null;
      clearTransient();
      completedOffsets.push(offset);
      push({
        title: text(`Offset ${offset} hoàn tất`, `Offset ${offset} complete`),
        note: text("Không còn đủ ký tự cho một word trọn vẹn trong lane này.", "This lane has no room for another complete word."),
        line: 10,
        phase: "offset",
        event: "offset-complete",
        decision: `${right + width} > ${s.length}`,
      });
    }

    offset = null;
    activeStart = null;
    activeWord = null;
    left = 0;
    right = 0;
    window = new Map();
    clearTransient();
    push({
      title: text(`return [${answer.join(", ")}]`, `return [${answer.join(", ")}]`),
      note: text("Đây là mọi vị trí bắt đầu tìm được từ tất cả word-width offsets.", "These are all start positions found across every word-width offset."),
      line: 24,
      phase: "done",
      event: "done",
      final: true,
      decision: `result = [${answer.join(", ")}]`,
    });

    return { original: s, words, answer, steps };
  }
  function parsePoints(raw) { const points = String(raw ?? "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => part.split(",").map((value) => Number(value.trim()))); if (points.length < 2 || points.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y)) || points.some((point, i) => i && point[0] <= points[i - 1][0])) throw new Error("points must be at least two strictly x-sorted x,y pairs separated by semicolons"); return points; }
  function buildSteps1499(input, params = {}) {
    const points = parsePoints(input); const k = Number(params.k ?? 1); if (!Number.isFinite(k) || k < 0) throw new Error("k must be non-negative"); const labels = points.map(([x, y]) => `(${x},${y})`); const steps = []; const deque = []; let answer = -Infinity; let best = [];
    const snap = (title, line, i, note, extra = {}) => snapshot(steps, labels, { title, line, highlight: i >= 0 ? [i] : [], mark: extra.mark || best, final: extra.final, note, sub: labels.map((_, index) => `point ${index}`), vars: [{ name: "k", value: k }, { name: "i", value: i >= 0 ? i : "-" }, { name: "deque indices", value: `[${deque.join(", ")}]` }, { name: "deque y-x", value: `[${deque.map((index) => points[index][1] - points[index][0]).join(", ")}]` }, { name: "answer", value: Number.isFinite(answer) ? answer : "-∞" }] });
    snap(text("deque = [], answer = −∞", "deque = [], answer = −∞"), 3, -1, text("Deque sẽ giảm dần theo y − x để front luôn tốt nhất.", "The deque decreases by y − x, so its front is always best."));
    for (let i = 0; i < points.length; i++) { const [x, y] = points[i]; snap(text(`Xét point ${i} = (${x}, ${y})`, `Inspect point ${i} = (${x}, ${y})`), 4, i, text("Điểm hiện tại là phía phải của phương trình.", "The current point is the equation's right endpoint.")); while (deque.length && x - points[deque[0]][0] > k) { const removed = deque.shift(); snap(text(`x − x[${removed}] > k → pop front`, `x − x[${removed}] > k → pop front`), 6, i, text("Điểm quá xa không thể ghép với bất kỳ điểm sau nào.", "This point is too far left to pair with any future point.")); } if (deque.length) { const candidate = y + x + points[deque[0]][1] - points[deque[0]][0]; const old = answer; if (candidate > answer) { answer = candidate; best = [deque[0], i]; } snap(text(`candidate = ${candidate}; answer = ${answer}`, `candidate = ${candidate}; answer = ${answer}`), 8, i, text("Front tối đa hóa yᵢ − xᵢ, nên tạo cặp tốt nhất với điểm hiện tại.", "The front maximizes yᵢ − xᵢ, producing the best pair with this point."), { mark: candidate > old ? best : undefined }); } while (deque.length && points[deque[deque.length - 1]][1] - points[deque[deque.length - 1]][0] <= y - x) { const removed = deque.pop(); snap(text(`key[${removed}] ≤ ${y - x} → pop back`, `key[${removed}] ≤ ${y - x} → pop back`), 10, i, text("Điểm cũ bị dominated bởi điểm hiện tại: mới hơn và key không nhỏ hơn.", "The old point is dominated: the current one is newer with an equal-or-better key.")); } deque.push(i); snap(text(`append ${i} (key y−x = ${y - x})`, `append ${i} (key y−x = ${y - x})`), 11, i, text("Giữ điểm này làm ứng viên cho các điểm bên phải.", "Keep this point as a candidate for later right endpoints.")); }
    const result = Number.isFinite(answer) ? answer : null; snap(text(`return ${result ?? "không có cặp"}`, `return ${result ?? "no pair"}`), 12, points.length - 1, text("Giá trị phương trình lớn nhất trong các cặp có khoảng cách x hợp lệ.", "The maximum equation value among x-distance-valid pairs."), { final: true }); return { original: points, k, answer: result, steps };
  }
  function buildSteps995(input, params = {}) {
    const nums = Array.isArray(input) ? input.map(Number) : []; const k = Number(params.k ?? 3); if (!Number.isInteger(k) || k < 1 || nums.some((value) => value !== 0 && value !== 1)) throw new Error("nums must be binary and k must be a positive integer"); const steps = []; const started = Array(nums.length).fill(0); let parity = 0; let answer = 0;
    const snap = (title, line, i, note, extra = {}) => snapshot(steps, nums, { title, line, highlight: i >= 0 ? indices(Math.max(0, i - k + 1), i) : [], mark: extra.mark, final: extra.final, note, vars: [{ name: "k", value: k }, { name: "flip parity", value: parity }, { name: "started flips", value: `[${started.join(", ")}]` }, { name: "answer", value: answer }] });
    snap(text("parity = answer = 0", "parity = answer = 0"), 3, -1, text("parity cho biết bit hiện tại đã bị đảo số lần lẻ hay chẵn.", "Parity records whether the current bit has been flipped an odd or even number of times."));
    for (let i = 0; i < nums.length; i++) { snap(text(`Xét nums[${i}] = ${nums[i]}`, `Inspect nums[${i}] = ${nums[i]}`), 4, i, text("Quyết định tại vị trí i là bắt buộc: chỉ flip bắt đầu ở i còn có thể sửa bit này.", "The decision at i is forced: only a flip beginning at i can still fix this bit.")); if (i >= k) { parity ^= started[i - k]; snap(text(`Hết hiệu lực flip ở ${i - k} → parity = ${parity}`, `Flip starting at ${i - k} expires → parity = ${parity}`), 5, i, text("Xóa ảnh hưởng của flip có cửa sổ vừa đi qua i.", "Remove the influence of the flip whose window just passed i.")); } if (nums[i] === parity) { snap(text(`nums[i] == parity (${parity}) → cần flip`, `nums[i] == parity (${parity}) → must flip`), 6, i, text("Giá trị hiệu dụng là 0, nên phải bắt đầu một flip ở đây.", "The effective value is 0, so a flip must begin here.")); if (i + k > nums.length) { snap(text(`i + k = ${i + k} vượt n → return -1`, `i + k = ${i + k} exceeds n → return -1`), 7, i, text("Không đủ phần tử để thực hiện flip bắt buộc này.", "There are not enough elements for this required flip."), { final: true }); return { original: nums, k, answer: -1, steps }; } answer++; snap(text(`answer += 1 → ${answer}`, `answer += 1 → ${answer}`), 8, i, text("Một flip bắt buộc được tính vào đáp án.", "Count this forced flip in the answer.")); parity ^= 1; started[i] = 1; snap(text(`start flip tại ${i}; parity = ${parity}`, `start flip at ${i}; parity = ${parity}`), 9, i, text("Đánh dấu flip để parity được đảo lại đúng lúc nó hết hiệu lực.", "Mark the flip so parity is toggled back exactly when it expires."), { mark: indices(i, i + k - 1) }); } }
    snap(text(`return ${answer}`, `return ${answer}`), 10, nums.length - 1, text("Số flip bắt buộc tối thiểu đã thực hiện.", "The minimum number of forced flips performed."), { final: true }); return { original: nums, k, answer, steps };
  }
  function parseLists(raw) { const lists = String(raw ?? "").split("|").map((part) => part.trim()).filter(Boolean).map((part) => part.split(",").map((value) => Number(value.trim()))); if (!lists.length || lists.some((list) => !list.length || list.some((value) => !Number.isFinite(value)) || list.some((value, i) => i && value < list[i - 1]))) throw new Error("lists must be non-empty sorted number lists separated by pipes"); return lists; }
  function buildSteps632(input) {
    const lists = parseLists(input); const labels = lists.map((list, i) => `L${i}: [${list.join(", ")}]`); const heap = lists.map((list, row) => [list[0], row, 0]); heap.sort((a, b) => a[0] - b[0]); let currentMax = Math.max(...heap.map(([value]) => value)); let best = [-Infinity, Infinity]; const steps = [];
    const heapText = () => `[${heap.map(([value, row, index]) => `${value}@L${row}[${index}]`).join(", ")}]`;
    const snap = (title, line, row, note, extra = {}) => snapshot(steps, labels, { title, line, highlight: row === undefined ? [] : [row], mark: extra.mark, final: extra.final, note, sub: labels.map((_, i) => `list ${i}`), vars: [{ name: "min-heap", value: heapText() }, { name: "currentMax", value: currentMax }, { name: "best", value: Number.isFinite(best[0]) ? `[${best.join(", ")}]` : "none" }] });
    snap(text("Đưa phần tử đầu mỗi list vào min-heap", "Put each list's first value in the min-heap"), 3, undefined, text("Heap luôn giữ một ứng viên từ từng list; currentMax là lớn nhất trong chúng.", "The heap keeps one candidate per list; currentMax is the largest of them."));
    while (heap.length) { const [low, row, index] = heap.shift(); snap(text(`pop min ${low} từ L${row}[${index}]`, `pop min ${low} from L${row}[${index}]`), 6, row, text("Đây là biên trái nhỏ nhất của range hiện tại.", "This is the smallest left boundary of the current range.")); if (currentMax - low < best[1] - best[0]) { best = [low, currentMax]; snap(text(`best = [${low}, ${currentMax}]`, `best = [${low}, ${currentMax}]`), 7, row, text("Range mới hẹp hơn range tốt nhất trước đó.", "This range is narrower than the previous best."), { mark: [row] }); } if (index + 1 === lists[row].length) { snap(text(`L${row} đã hết → dừng`, `L${row} is exhausted → stop`), 8, row, text("Không thể giữ một phần tử từ mọi list sau khi list này cạn.", "A candidate from every list is impossible once this list is exhausted.")); break; } const next = lists[row][index + 1]; currentMax = Math.max(currentMax, next); snap(text(`next = ${next}; currentMax = ${currentMax}`, `next = ${next}; currentMax = ${currentMax}`), 9, row, text("Tiến trong list vừa cung cấp minimum để thử range kế tiếp.", "Advance the list that supplied the minimum to try the next range.")); heap.push([next, row, index + 1]); heap.sort((a, b) => a[0] - b[0]); snap(text(`push ${next} từ L${row}`, `push ${next} from L${row}`), 10, row, text("Khôi phục một ứng viên cho list này và cập nhật min-heap.", "Restore a candidate for this list and update the min-heap.")); }
    snap(text(`return [${best.join(", ")}]`, `return [${best.join(", ")}]`), 11, undefined, text("Smallest range chứa ít nhất một phần tử từ mọi list.", "The smallest range containing at least one item from every list."), { final: true }); return { original: lists, answer: best, steps };
  }

  const hardTags = arrayTag;
  const hardStringTags = [stringTag[0], ...arrayTag];
  Object.assign(module.exports, {
    30: {
      id: 30,
      difficulty: "hard",
      slug: "substring-with-concatenation-of-all-words",
      category,
      tags: hardStringTags,
      title: text("Substring with Concatenation of All Words", "Substring with Concatenation of All Words"),
      titleVi: text("Chuỗi con là phép nối của mọi từ", "Substring with Concatenation of All Words"),
      statement: text(
        "Tìm mọi chỉ số bắt đầu nơi s chứa phép nối mỗi từ trong words đúng một lần, theo bất kỳ thứ tự nào.",
        "Find every start where s contains each word in words exactly once, in any order.",
      ),
      defaultInput: "barfoothefoobarman",
      inputKind: "string",
      inputLabel: text("Chuỗi s", "String s"),
      extraParams: [{
        key: "words",
        type: "string",
        label: text("words (cách bởi dấu phẩy)", "words (comma separated)"),
        default: "foo,bar",
      }],
      approach: [
        text("Vì mọi word có cùng độ dài w, chia phép quét thành w offset độc lập; mỗi lane chỉ đọc trọn từng word.", "Because every word has width w, split the scan into w independent offsets; each lane reads complete words only."),
        text("need đếm tần suất bắt buộc, window đếm các word trong [left, right). Word lạ làm RESET toàn bộ lane hiện tại.", "need stores required frequencies, while window counts words in [left, right). An unknown word RESETs the current lane."),
        text("Nếu word vừa thêm bị dư, SHRINK từ trái. Khi right-left bằng tổng độ dài tất cả words, lưu left là một MATCH.", "If the incoming word is overrepresented, SHRINK from the left. When right-left equals the total concatenation width, save left as a MATCH."),
      ],
      complexity: {
        time: "O(|s|)",
        space: "O(words)",
        note: text(
          "Mỗi offset tiến left/right theo từng word; mỗi word được thêm và loại tối đa một lần.",
          "Within each offset, left/right move by whole words; each word is added and removed at most once.",
        ),
      },
      code: [
        "class Solution:",
        "    def findSubstring(self, s, words):",
        "        need = Counter(words)",
        "        result = []",
        "        width = len(words[0])",
        "        total_width = len(words) * width",
        "        for offset in range(width):",
        "            left = right = offset",
        "            window = Counter()",
        "            while right + width <= len(s):",
        "                word = s[right:right + width]",
        "                right += width",
        "                if word not in need:",
        "                    window.clear()",
        "                    left = right",
        "                    continue",
        "                window[word] += 1",
        "                while window[word] > need[word]:",
        "                    removed = s[left:left + width]",
        "                    window[removed] -= 1",
        "                    left += width",
        "                if right - left == total_width:",
        "                    result.append(left)",
        "        return result",
      ],
      builder: buildSteps30,
    },
    1499: { id: 1499, difficulty: "hard", slug: "max-value-of-equation", category, tags: hardTags, title: text("Max Value of Equation", "Max Value of Equation"), titleVi: text("Giá trị lớn nhất của phương trình", "Max Value of Equation"), statement: text("Với points đã sắp xếp theo x, tìm max yᵢ + yⱼ + |xᵢ − xⱼ| khi |xᵢ − xⱼ| ≤ k.", "For x-sorted points, maximize yᵢ + yⱼ + |xᵢ − xⱼ| subject to |xᵢ − xⱼ| ≤ k."), defaultInput: "1,3;2,0;5,10;6,-10", inputKind: "string", inputLabel: text("points (x,y; x,y; ...)", "points (x,y; x,y; ...)"), extraParams: [{ key: "k", label: text("k (khoảng cách x tối đa)", "k (maximum x distance)"), default: 1 }], complexity: { time: "O(n)", space: "O(n)", note: text("Deque đơn điệu giữ các y−x tốt nhất còn nằm trong k.", "A monotonic deque retains the best in-range y−x candidates.") }, code: ["class Solution:", "    def findMaxValueOfEquation(self, points, k):", "        deque = []; answer = -inf", "        for i, (x, y) in enumerate(points):", "            while deque and x - points[deque[0]][0] > k:", "                deque.popleft()", "            if deque:", "                answer = max(answer, y + x + key(deque[0]))", "            while deque and key(deque[-1]) <= y - x:", "                deque.pop()", "            deque.append(i)", "        return answer"], builder: buildSteps1499 },
    995: { id: 995, difficulty: "hard", slug: "minimum-number-of-k-consecutive-bit-flips", category, tags: hardTags, title: text("Minimum Number of K Consecutive Bit Flips", "Minimum Number of K Consecutive Bit Flips"), titleVi: text("Số flip bit K liên tiếp ít nhất", "Minimum Number of K Consecutive Bit Flips"), statement: text("Lật chính xác k bit liên tiếp mỗi lần để biến mọi bit thành 1, với số lần ít nhất.", "Flip exactly k consecutive bits per move to make every bit 1 with the fewest moves."), defaultInput: [0, 1, 0], inputKind: "binary", inputLabel: text("nums (0 hoặc 1)", "nums (0 or 1)"), extraParams: [{ key: "k", label: text("k (độ dài flip)", "k (flip length)"), default: 1 }], complexity: { time: "O(n)", space: "O(n)", note: text("Parity và mảng đánh dấu cho biết các flip nào vẫn ảnh hưởng vị trí hiện tại.", "Parity and start markers track which prior flips still affect the current position.") }, code: ["class Solution:", "    def minKBitFlips(self, nums, k):", "        parity = answer = 0; started = [0]*len(nums)", "        for i in range(len(nums)):", "            if i >= k: parity ^= started[i-k]", "            if nums[i] == parity:", "                if i + k > len(nums): return -1", "                answer += 1", "                parity ^= 1; started[i] = 1", "        return answer"], builder: buildSteps995 },
    632: { id: 632, difficulty: "hard", slug: "smallest-range-covering-elements-from-k-lists", category, tags: hardTags, title: text("Smallest Range Covering Elements from K Lists", "Smallest Range Covering Elements from K Lists"), titleVi: text("Range nhỏ nhất chứa phần tử từ K list", "Smallest Range Covering Elements from K Lists"), statement: text("Tìm range nhỏ nhất chứa ít nhất một số từ mỗi list đã sắp xếp.", "Find the smallest range containing at least one number from every sorted list."), defaultInput: "4,10,15,24,26|0,9,12,20|5,18,22,30", inputKind: "string", inputLabel: text("Các list đã sắp xếp (cách bởi |)", "Sorted lists (pipe separated)"), extraParams: [], complexity: { time: "O(N log K)", space: "O(K)", note: text("Min-heap chứa một phần tử từ mỗi list; chỉ tiến list đang giữ minimum.", "A min-heap holds one item per list; advance only the list holding the minimum.") }, code: ["class Solution:", "    def smallestRange(self, nums):", "        heap = first_item_from_each_list(); current_max = max(heap)", "        best = [-inf, inf]", "        while True:", "            low, row, index = heappop(heap)", "            if current_max-low < best[1]-best[0]: best = [low, current_max]", "            if index + 1 == len(nums[row]): break", "            next_value = nums[row][index+1]; current_max = max(current_max, next_value)", "            heappush(heap, (next_value, row, index+1))", "        return best"], builder: buildSteps632 },
  });
})();


// LeetCode 3159 · collect occurrence positions, then answer one-based occurrence queries.
(() => {
  const text = (vi, en) => ({ vi, en });

  function parseQueries(raw) {
    const queries = String(raw ?? "").split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value));
    if (!queries.length || queries.some((query) => query < 1)) {
      throw new Error("queries must be comma-separated positive occurrence numbers");
    }
    return queries;
  }

  function buildSteps3159(input, params = {}) {
    const nums = Array.isArray(input) ? input.map(Number) : [];
    const x = Number(params.x ?? 1);
    const queries = parseQueries(params.queries ?? "1,3,2");
    if (!nums.length || nums.some((value) => !Number.isFinite(value)) || !Number.isFinite(x)) {
      throw new Error("nums must be a non-empty numeric array and x must be numeric");
    }

    const positions = [];
    const answer = [];
    const steps = [];
    const occurrenceTable = () => positions.length
      ? `[${positions.map((index, occurrence) => `${occurrence + 1} → ${index}`).join(", ")}]`
      : "[]";
    const answerTable = () => answer.length
      ? `[${answer.map((result, queryIndex) => `q${queryIndex + 1} → ${result}`).join(", ")}]`
      : "[]";
    const subLabels = () => nums.map((_, index) => {
      const occurrence = positions.indexOf(index) + 1;
      return occurrence ? `[${index}] · x #${occurrence}` : `[${index}]`;
    });
    const snap = (title, line, note, extra = {}) => {
      const currentIndex = extra.currentIndex;
      const queryIndex = extra.queryIndex;
      const occurrence = queryIndex === undefined ? undefined : queries[queryIndex];
      steps.push({
        title,
        arr: [...nums],
        sub: subLabels(),
        highlight: currentIndex === undefined ? [] : [currentIndex],
        mark: extra.mark ?? [...positions],
        final: Boolean(extra.final),
        codeLines: [line],
        vars: [
          { name: "phase", value: extra.phase || "1. Build positions" },
          { name: "target x", value: x },
          { name: "occurrence # → nums index", value: occurrenceTable() },
          { name: "queries (q is 1-based)", value: `[${queries.join(", ")}]` },
          ...(occurrence === undefined ? [] : [
            { name: "current query", value: `q${queryIndex + 1} = ${occurrence}` },
            { name: "lookup", value: extra.lookup || `positions[${occurrence - 1}]` },
          ]),
          { name: "answers so far", value: answerTable() },
        ],
        occurrenceLookupView: {
          nums: [...nums],
          x,
          positions: [...positions],
          queries: [...queries],
          answer: [...answer],
          phase: extra.phase || "1. Build positions",
          currentIndex: Number.isInteger(currentIndex) ? currentIndex : -1,
          queryIndex: Number.isInteger(queryIndex) ? queryIndex : -1,
          lookup: extra.lookup || "",
          final: Boolean(extra.final),
        },
        note,
      });
    };

    snap(text("Pha 1: tạo bảng occurrence → index", "Phase 1: build the occurrence → index table"), 3,
      text("Ta không trả lời query ngay. Trước hết, positions sẽ lưu index của từng lần gặp x theo đúng thứ tự.", "Do not answer queries yet. First, positions records the index of every x in encounter order."));

    for (let index = 0; index < nums.length; index++) {
      const value = nums[index];
      const matches = value === x;
      snap(text(`So sánh nums[${index}] = ${value} với x = ${x}`, `Compare nums[${index}] = ${value} with x = ${x}`), 5,
        matches
          ? text("Hai giá trị bằng nhau: đây là một lần xuất hiện của x.", "The values match: this is an occurrence of x.")
          : text("Không bằng x: bỏ qua phần tử này và tiếp tục quét.", "It is not x: skip this item and continue scanning."),
        { currentIndex: index });
      if (matches) {
        positions.push(index);
        snap(text(`Lần xuất hiện #${positions.length} của x nằm ở index ${index}`, `Occurrence #${positions.length} of x is at index ${index}`), 6,
          text(`Bảng lookup nhận cặp ${positions.length} → ${index}. Nghĩa là query q = ${positions.length} sẽ trả về ${index}.`, `The lookup table receives ${positions.length} → ${index}. Therefore q = ${positions.length} returns ${index}.`),
          { currentIndex: index, mark: [...positions] });
      }
    }

    snap(text("Pha 2: trả lời từng query", "Phase 2: answer each query"), 7,
      text("Query q là số thứ tự 1-based của lần xuất hiện. Vì positions là mảng 0-based, cần đọc positions[q − 1].", "Query q is a one-based occurrence number. Since positions is zero-based, read positions[q − 1]."),
      { phase: "2. Answer queries" });

    for (let queryIndex = 0; queryIndex < queries.length; queryIndex++) {
      const occurrence = queries[queryIndex];
      const lookup = `q = ${occurrence} → positions[${occurrence - 1}]`;
      snap(text(`Query ${queryIndex + 1}: cần lần xuất hiện thứ ${occurrence}`, `Query ${queryIndex + 1}: request occurrence ${occurrence}`), 8,
        text(`${lookup}. Kiểm tra xem bảng có đủ ${occurrence} phần tử hay không.`, `${lookup}. Check whether the table contains at least ${occurrence} entries.`),
        { queryIndex, lookup, phase: "2. Answer queries", mark: [] });
      const result = occurrence <= positions.length ? positions[occurrence - 1] : -1;
      answer.push(result);
      const resolvedLookup = result === -1 ? `${lookup} → out of range → -1` : `${lookup} = ${result}`;
      snap(text(`Lưu đáp án ${result}`, `Save answer ${result}`), 9,
        result === -1
          ? text(`Bảng chỉ có ${positions.length} lần xuất hiện, nên lần thứ ${occurrence} không tồn tại → −1.`, `The table has only ${positions.length} occurrences, so occurrence ${occurrence} does not exist → −1.`)
          : text(`Lần xuất hiện thứ ${occurrence} của x ở nums[${result}], nên kết quả là ${result}.`, `Occurrence ${occurrence} of x is at nums[${result}], so the result is ${result}.`),
        { queryIndex, lookup: resolvedLookup, phase: "2. Answer queries", mark: result === -1 ? [...positions] : [result] });
    }

    snap(text(`return [${answer.join(", ")}]`, `return [${answer.join(", ")}]`), 10,
      text("Hoàn tất: pha 1 tạo bảng occurrence → index; pha 2 chỉ lookup bảng để trả lời query.", "Complete: phase 1 builds the occurrence → index table; phase 2 only looks up that table for each query."),
      { phase: "Done", final: true });
    return { original: nums, x, queries, answer, steps };
  }

  Object.assign(module.exports, {
    3159: {
      id: 3159,
      difficulty: "medium",
      slug: "find-occurrences-of-an-element-in-an-array",
      category,
      tags: arrayTag,
      title: text("Find Occurrences of an Element in an Array", "Find Occurrences of an Element in an Array"),
      titleVi: text("Tìm các lần xuất hiện của một phần tử trong mảng", "Find Occurrences of an Element in an Array"),
      statement: text("Với mỗi query q, trả về index của lần xuất hiện thứ q (đếm từ 1) của x trong nums; nếu không tồn tại thì trả về −1.", "For every query q, return the index of the q-th (one-based) occurrence of x in nums, or −1 when it does not exist."),
      defaultInput: [1, 3, 1, 7, 1, 2],
      inputKind: "integer",
      inputLabel: text("nums", "nums"),
      extraParams: [
        { key: "x", label: text("x (giá trị cần tìm)", "x (value to find)"), default: 1 },
        { key: "queries", type: "string", label: text("queries (1-based, cách bởi dấu phẩy)", "queries (1-based, comma separated)"), default: "1,3,2,4" },
      ],
      complexity: {
        time: "O(n + q)",
        space: "O(n)",
        note: text("Quét nums để lưu vị trí của x, sau đó mỗi query chỉ là một lần truy cập mảng.", "Scan nums to store positions of x, then answer each query with one array access."),
      },
      code: [
        "class Solution:",
        "    def occurrencesOfElement(self, nums, queries, x):",
        "        positions = []",
        "        for index, value in enumerate(nums):",
        "            if value == x:",
        "                positions.append(index)",
        "        answer = []",
        "        for occurrence in queries:",
        "            answer.append(positions[occurrence-1] if occurrence <= len(positions) else -1)",
        "        return answer",
      ],
      builder: buildSteps3159,
    },
  });
})();


// LeetCode 3471 · Find the Largest Almost Missing Integer.
// x is "almost missing" if it lies in exactly one size-k window. For 1 < k < n
// only the first and last positions live in a single window, so the only
// candidates are nums[0] and nums[n-1] (each must occur exactly once).
(() => {
  const text = (vi, en) => ({ vi, en });

  function buildSteps3471(input, params = {}) {
    const nums = Array.isArray(input) ? input.map(Number) : [];
    const k = Number(params.k ?? 3);
    if (!nums.length || nums.some((value) => !Number.isFinite(value))) {
      throw new Error("nums must be a non-empty numeric array");
    }
    if (!Number.isInteger(k) || k < 1 || k > nums.length) {
      throw new Error("k must be between 1 and nums.length");
    }

    const n = nums.length;
    const windowCount = n - k + 1;
    const caseType = k === 1 ? "k1" : k === n ? "kn" : "general";
    const freq = new Map();
    for (const value of nums) freq.set(value, (freq.get(value) || 0) + 1);
    const occurrencesOf = (value) => nums.reduce((acc, item, index) => (item === value ? [...acc, index] : acc), []);
    const freqList = () => [...freq.entries()].map(([value, count]) => ({ value, count }));

    const steps = [];
    const push = (opts) => {
      steps.push({
        title: opts.title,
        arr: [...nums],
        sub: nums.map((_, index) => `[${index}]`),
        highlight: opts.highlight || [],
        mark: opts.mark || [],
        final: Boolean(opts.final),
        codeLines: [opts.line],
        vars: opts.vars || [],
        note: opts.note,
        almostMissingView: {
          nums: [...nums],
          k,
          n,
          windowCount,
          caseType,
          phase: opts.phase || "",
          windowRange: opts.windowRange || null,
          highlight: opts.highlight || [],
          candidates: (opts.candidates || []).map((candidate) => ({ ...candidate, occurrences: [...candidate.occurrences] })),
          activeCandidate: Number.isInteger(opts.activeCandidate) ? opts.activeCandidate : -1,
          answer: opts.answer === undefined ? null : opts.answer,
          freq: opts.freq || null,
        },
      });
    };

    push({
      title: text(`n = ${n}, có ${windowCount} cửa sổ độ dài k = ${k}`, `n = ${n}, there are ${windowCount} windows of length k = ${k}`),
      line: 3,
      phase: "setup",
      note: text(`Số cửa sổ độ dài k là n − k + 1 = ${windowCount}. "Almost missing" nghĩa là giá trị nằm trong ĐÚNG một cửa sổ.`, `The number of length-k windows is n − k + 1 = ${windowCount}. "Almost missing" means a value lies in EXACTLY one window.`),
    });

    push({
      title: text("Đếm tần suất mỗi giá trị", "Count the frequency of each value"),
      line: 4,
      phase: "count",
      freq: freqList(),
      note: text("count[v] cho biết v xuất hiện bao nhiêu lần. Một giá trị lặp lại sẽ chạm nhiều cửa sổ nên khó 'almost missing'.", "count[v] tells how many times v appears. A repeated value touches several windows, so it can rarely be almost missing."),
    });

    if (caseType === "k1") {
      push({
        title: text("k = 1: mỗi cửa sổ chỉ là một phần tử", "k = 1: every window is a single element"),
        line: 5,
        phase: "k1",
        note: text("Khi k = 1, giá trị nằm trong đúng một cửa sổ ⟺ nó xuất hiện đúng một lần trong nums.", "When k = 1, a value lies in exactly one window ⟺ it appears exactly once in nums."),
      });
      const singles = [...freq.entries()].filter(([, count]) => count === 1).map(([value]) => value);
      const singleIndices = singles.flatMap((value) => occurrencesOf(value));
      push({
        title: text(`Các giá trị xuất hiện đúng 1 lần: [${singles.join(", ")}]`, `Values appearing exactly once: [${singles.join(", ")}]`),
        line: 6,
        phase: "k1",
        freq: freqList(),
        highlight: singleIndices,
        mark: singleIndices,
        note: singles.length
          ? text("Chỉ những giá trị này là 'almost missing'.", "Only these values are almost missing.")
          : text("Không có giá trị nào xuất hiện đúng một lần.", "No value appears exactly once."),
      });
      const answer = singles.length ? Math.max(...singles) : -1;
      push({
        title: text(`return ${answer}`, `return ${answer}`),
        line: 7,
        phase: "done",
        final: true,
        answer,
        highlight: answer === -1 ? [] : occurrencesOf(answer),
        mark: answer === -1 ? [] : occurrencesOf(answer),
        note: answer === -1
          ? text("Danh sách rỗng nên trả về −1.", "The list is empty, so return −1.")
          : text(`Giá trị lớn nhất xuất hiện đúng một lần là ${answer}.`, `The largest value appearing exactly once is ${answer}.`),
      });
      return { original: nums, k, answer, steps };
    }

    if (caseType === "kn") {
      push({
        title: text("k = n: chỉ có duy nhất một cửa sổ", "k = n: there is only one window"),
        line: 8,
        phase: "kn",
        windowRange: [0, n - 1],
        highlight: nums.map((_, index) => index),
        note: text("Cửa sổ duy nhất là cả mảng, nên MỌI giá trị phân biệt đều nằm trong đúng một cửa sổ.", "The single window is the whole array, so EVERY distinct value lies in exactly one window."),
      });
      const answer = Math.max(...nums);
      push({
        title: text(`return max(nums) = ${answer}`, `return max(nums) = ${answer}`),
        line: 9,
        phase: "done",
        final: true,
        answer,
        windowRange: [0, n - 1],
        highlight: occurrencesOf(answer),
        mark: occurrencesOf(answer),
        note: text(`Đáp án là phần tử lớn nhất: ${answer}.`, `The answer is the largest element: ${answer}.`),
      });
      return { original: nums, k, answer, steps };
    }

    // 1 < k < n
    const candidates = [
      { role: "start", index: 0, value: nums[0], occurrences: occurrencesOf(nums[0]), valid: null },
      { role: "end", index: n - 1, value: nums[n - 1], occurrences: occurrencesOf(nums[n - 1]), valid: null },
    ];
    let answer = -1;

    push({
      title: text("Chỉ hai đầu mảng nằm trong đúng một cửa sổ", "Only the two ends live in exactly one window"),
      line: 10,
      phase: "general",
      candidates,
      windowRange: [0, k - 1],
      highlight: [0, n - 1],
      answer,
      note: text(`Index 0 chỉ thuộc cửa sổ đầu [0..${k - 1}]; index ${n - 1} chỉ thuộc cửa sổ cuối [${n - k}..${n - 1}]. Mọi index ở giữa thuộc ≥ 2 cửa sổ. Vậy ứng viên duy nhất là nums[0] và nums[${n - 1}].`, `Index 0 belongs only to the first window [0..${k - 1}]; index ${n - 1} only to the last window [${n - k}..${n - 1}]. Every interior index belongs to ≥ 2 windows. So the only candidates are nums[0] and nums[${n - 1}].`),
    });

    candidates[0].valid = freq.get(nums[0]) === 1;
    push({
      title: text(`nums[0] = ${nums[0]} xuất hiện ${freq.get(nums[0])} lần`, `nums[0] = ${nums[0]} appears ${freq.get(nums[0])} time(s)`),
      line: 11,
      phase: "general",
      candidates,
      activeCandidate: 0,
      highlight: candidates[0].occurrences,
      mark: candidates[0].occurrences,
      answer,
      note: candidates[0].valid
        ? text("Xuất hiện đúng một lần nên nó là 'almost missing'.", "It appears exactly once, so it is almost missing.")
        : text("Xuất hiện nhiều hơn một lần nên nó chạm nhiều cửa sổ → loại.", "It appears more than once, so it touches multiple windows → rejected."),
    });
    if (candidates[0].valid) {
      answer = Math.max(answer, nums[0]);
      push({
        title: text(`ans = max(${-1}, ${nums[0]}) = ${answer}`, `ans = max(${-1}, ${nums[0]}) = ${answer}`),
        line: 12,
        phase: "general",
        candidates,
        activeCandidate: 0,
        highlight: [0],
        mark: [0],
        answer,
        note: text("Nhận nums[0] làm ứng viên đáp án.", "Take nums[0] as an answer candidate."),
      });
    }

    candidates[1].valid = freq.get(nums[n - 1]) === 1;
    push({
      title: text(`nums[${n - 1}] = ${nums[n - 1]} xuất hiện ${freq.get(nums[n - 1])} lần`, `nums[${n - 1}] = ${nums[n - 1]} appears ${freq.get(nums[n - 1])} time(s)`),
      line: 13,
      phase: "general",
      candidates,
      activeCandidate: 1,
      highlight: candidates[1].occurrences,
      mark: candidates[1].occurrences,
      answer,
      note: candidates[1].valid
        ? text("Xuất hiện đúng một lần nên nó là 'almost missing'.", "It appears exactly once, so it is almost missing.")
        : text("Xuất hiện nhiều hơn một lần nên bị loại.", "It appears more than once, so it is rejected."),
    });
    if (candidates[1].valid) {
      const previous = answer;
      answer = Math.max(answer, nums[n - 1]);
      push({
        title: text(`ans = max(${previous}, ${nums[n - 1]}) = ${answer}`, `ans = max(${previous}, ${nums[n - 1]}) = ${answer}`),
        line: 14,
        phase: "general",
        candidates,
        activeCandidate: 1,
        highlight: [n - 1],
        mark: [n - 1],
        answer,
        note: text("Cập nhật đáp án với nums cuối mảng.", "Update the answer with the last element."),
      });
    }

    push({
      title: text(`return ${answer}`, `return ${answer}`),
      line: 15,
      phase: "done",
      final: true,
      candidates,
      answer,
      highlight: answer === -1 ? [] : occurrencesOf(answer),
      mark: answer === -1 ? [] : occurrencesOf(answer),
      note: answer === -1
        ? text("Không đầu nào xuất hiện đúng một lần → −1.", "Neither end appears exactly once → −1.")
        : text(`Ứng viên hợp lệ lớn nhất là ${answer}.`, `The largest valid candidate is ${answer}.`),
    });
    return { original: nums, k, answer, steps };
  }

  Object.assign(module.exports, {
    3471: {
      id: 3471,
      difficulty: "easy",
      slug: "find-the-largest-almost-missing-integer",
      category,
      tags: arrayTag,
      title: text("Find the Largest Almost Missing Integer", "Find the Largest Almost Missing Integer"),
      titleVi: text("Tìm số 'almost missing' lớn nhất", "Find the Largest Almost Missing Integer"),
      statement: text("Cho mảng nums và số k. Một giá trị là 'almost missing' nếu nó nằm trong đúng một subarray liên tiếp độ dài k. Trả về giá trị 'almost missing' lớn nhất, hoặc −1 nếu không có.", "Given nums and an integer k, a value is almost missing if it lies in exactly one contiguous subarray of length k. Return the largest almost missing value, or −1 if none exists."),
      defaultInput: [3, 9, 2, 1, 7],
      inputKind: "integer",
      inputLabel: text("nums", "nums"),
      extraParams: [
        { key: "k", type: "number", label: text("k (độ dài cửa sổ)", "k (window length)"), default: 3 },
      ],
      complexity: {
        time: "O(n)",
        space: "O(n)",
        note: text("Đếm tần suất một lần rồi chỉ xét vài trường hợp biên.", "Count frequencies once, then check only a few boundary cases."),
      },
      code: [
        "class Solution:",
        "    def largestAlmostMissingInteger(self, nums, k):",
        "        n = len(nums)",
        "        count = Counter(nums)",
        "        if k == 1:",
        "            singles = [v for v in nums if count[v] == 1]",
        "            return max(singles) if singles else -1",
        "        if k == n:",
        "            return max(nums)",
        "        ans = -1",
        "        if count[nums[0]] == 1:",
        "            ans = max(ans, nums[0])",
        "        if count[nums[-1]] == 1:",
        "            ans = max(ans, nums[-1])",
        "        return ans",
      ],
      builder: buildSteps3471,
    },
  });
})();
