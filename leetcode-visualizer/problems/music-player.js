// Music Player — LFU selection with a no-repeat round reset.

const DESIGN = { key: "design", vi: "Thiết kế hệ thống", en: "Design" };
const HASHMAP = { key: "hashmap", vi: "Hash Map", en: "Hash Map" };
const HEAP = { key: "heap", vi: "Heap / Priority Queue", en: "Heap / Priority Queue" };
const GREEDY = { key: "greedy", vi: "Tham lam", en: "Greedy" };
const STRING = { key: "string", vi: "Chuỗi", en: "String" };
const SORTING = { key: "sorting", vi: "Sắp xếp", en: "Sorting" };

function buildSteps9002(input, params) {
  const songs = [...new Set(String(input || "").split(",").map((song) => song.trim()).filter(Boolean))].slice(0, 8);
  if (!songs.length) throw new Error("Cần ít nhất một bài hát.");

  const requestedPlays = Number(params && params.plays);
  const playCount = Number.isInteger(requestedPlays) ? Math.max(1, Math.min(requestedPlays, 32)) : 8;
  const order = new Map(songs.map((song, index) => [song, index]));
  const frequency = new Map(songs.map((song) => [song, 0]));
  const playedThisRound = new Set();
  const history = [];
  const steps = [];
  let round = 1;

  function snapshot(options = {}) {
    const candidates = options.candidates || [];
    steps.push({
      title: options.title,
      arr: [], highlight: [], mark: [], final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "round", value: round },
        { name: "played_this_round", value: `{${[...playedThisRound].join(", ")}}` },
        { name: "freq", value: `{${songs.map((song) => `${song}:${frequency.get(song)}`).join(", ")}}` },
        ...(options.vars || []),
      ],
      note: options.note,
      musicPlayerView: {
        songs: songs.map((song) => ({ song, frequency: frequency.get(song), playedThisRound: playedThisRound.has(song), candidate: candidates.includes(song) })),
        round,
        requestedPlays: playCount,
        completedPlays: history.length,
        history: [...history],
        candidates,
        selectedSong: options.selectedSong || null,
        minFrequency: options.minFrequency ?? null,
        didReset: Boolean(options.didReset),
        phase: options.phase || "ready",
      },
    });
  }

  snapshot({
    title: { vi: "Khởi tạo MusicPlayer", en: "Initialize MusicPlayer" },
    codeLines: [2, 3, 4, 5, 6], phase: "initialize",
    note: { vi: `Có ${songs.length} bài. freq lưu tổng lượt phát; played_this_round chặn phát lại trước khi hết một vòng.`, en: `${songs.length} songs. freq stores total plays; played_this_round prevents a repeat before the round ends.` },
  });

  for (let request = 1; request <= playCount; request++) {
    snapshot({ title: { vi: `Yêu cầu play() #${request}`, en: `play() request #${request}` }, codeLines: [8], phase: "request", note: { vi: "Bắt đầu chọn bài cho yêu cầu mới.", en: "Start selecting a song for the new request." } });

    if (playedThisRound.size === songs.length) {
      snapshot({
        title: { vi: `Đã phát đủ ${songs.length}/${songs.length} bài → reset vòng`, en: `All ${songs.length}/${songs.length} songs played → reset the round` },
        codeLines: [9], phase: "reset-check", didReset: true,
        note: { vi: "Mọi bài đã xuất hiện đúng một lần trong vòng này, nên xóa tập chặn để mở vòng mới. Tổng freq không bị xóa.", en: "Every song appeared once this round, so clear the no-repeat set for a new round. Total freq is preserved." },
      });
      playedThisRound.clear();
      round += 1;
      snapshot({ title: { vi: `played_this_round.clear() → vòng ${round}`, en: `played_this_round.clear() → round ${round}` }, codeLines: [10], phase: "reset", didReset: true, note: { vi: "Vòng mới bắt đầu: mọi bài lại đủ điều kiện để được chọn.", en: "A new round begins: every song is eligible again." } });
    }

    const candidates = songs.filter((song) => !playedThisRound.has(song));
    snapshot({ title: { vi: `Lọc ${candidates.length} bài chưa phát trong vòng`, en: `Filter ${candidates.length} songs not yet played this round` }, codeLines: [11], phase: "candidates", candidates, note: { vi: `Candidates = [${candidates.join(", ")}]. Những bài đã phát trong vòng bị loại.`, en: `Candidates = [${candidates.join(", ")}]. Songs already played this round are excluded.` } });

    const minFrequency = Math.min(...candidates.map((song) => frequency.get(song)));
    const tied = candidates.filter((song) => frequency.get(song) === minFrequency);
    snapshot({ title: { vi: `LFU: tần suất nhỏ nhất là ${minFrequency}`, en: `LFU: smallest frequency is ${minFrequency}` }, codeLines: [12], phase: "select", candidates: tied, minFrequency, note: { vi: `Ưu tiên bài ít được phát nhất. Hòa giữa [${tied.join(", ")}] sẽ theo thứ tự input.`, en: `Prefer the least-frequently played song. Ties among [${tied.join(", ")}] use input order.` } });

    const song = tied.sort((a, b) => order.get(a) - order.get(b))[0];
    snapshot({ title: { vi: `Chọn “${song}”`, en: `Choose “${song}”` }, codeLines: [12], phase: "selected", candidates: tied, selectedSong: song, minFrequency, note: { vi: `“${song}” là bài LFU hợp lệ đầu tiên theo thứ tự input.`, en: `“${song}” is the first eligible LFU song in input order.` } });

    frequency.set(song, frequency.get(song) + 1);
    snapshot({ title: { vi: `freq[“${song}”] += 1`, en: `freq[“${song}”] += 1` }, codeLines: [13], phase: "frequency", candidates: tied, selectedSong: song, minFrequency, note: { vi: `Tổng số lượt phát của “${song}” tăng thành ${frequency.get(song)}.`, en: `The total play count of “${song}” becomes ${frequency.get(song)}.` } });

    playedThisRound.add(song);
    history.push(song);
    snapshot({ title: { vi: `Đánh dấu “${song}” đã phát trong vòng`, en: `Mark “${song}” as played this round` }, codeLines: [14, 15], phase: "commit", candidates: tied, selectedSong: song, minFrequency, note: { vi: `Thêm vào played_this_round và return “${song}”.`, en: `Add it to played_this_round and return “${song}”.` } });
  }

  snapshot({ title: { vi: "Hoàn tất mô phỏng", en: "Simulation complete" }, codeLines: [15], phase: "done", final: true, note: { vi: `Chuỗi phát: ${history.join(" → ")}.`, en: `Play sequence: ${history.join(" → ")}.` } });
  return { original: songs, answer: history, steps };
}

function buildSteps804(input) {
  const words = String(input || "").split(",").map((word) => word.trim().toLowerCase()).filter(Boolean);
  if (!words.length || words.some((word) => !/^[a-z]+$/.test(word))) throw new Error("Nhập các từ thường a-z, cách nhau bằng dấu phẩy.");
  const morse = [".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."];
  const encodings = new Set();
  const steps = [];
  const snap = (title, line, index = -1, code = "", final = false, note = "") => steps.push({
    title, arr: words, highlight: index < 0 ? [] : [index], mark: [], final, codeLines: [line],
    vars: [{ name: "seen", value: `{${[...encodings].join(", ")}}` }, { name: "current code", value: code || "—" }], note,
  });
  snap({ vi: "Khởi tạo bảng Morse và set", en: "Initialize the Morse table and set" }, 3, -1, "", false, { vi: "Set chỉ giữ encoding khác nhau.", en: "A set keeps only distinct encodings." });
  words.forEach((word, index) => {
    snap({ vi: `Đọc word = “${word}”`, en: `Read word = “${word}”` }, 5, index, "", false, { vi: "Mã hóa từng ký tự của từ hiện tại.", en: "Encode every character in the current word." });
    const code = [...word].map((ch) => morse[ch.charCodeAt(0) - 97]).join("");
    snap({ vi: `“${word}” → ${code}`, en: `“${word}” → ${code}` }, 6, index, code, false, { vi: "Nối các mã Morse của từng chữ cái.", en: "Concatenate each letter's Morse code." });
    const existed = encodings.has(code);
    encodings.add(code);
    snap({ vi: existed ? "Encoding đã có trong set" : "Thêm encoding mới vào set", en: existed ? "Encoding already exists in the set" : "Add a new encoding to the set" }, 7, index, code, false, { vi: existed ? "Không tăng số lượng vì set tự loại trùng." : "Đây là một encoding chưa từng gặp.", en: existed ? "The count does not grow because a set deduplicates." : "This encoding has not been seen before." });
  });
  snap({ vi: `Có ${encodings.size} encoding khác nhau`, en: `${encodings.size} distinct encodings` }, 8, -1, "", true, { vi: "Kích thước set là đáp án.", en: "The set size is the answer." });
  return { original: words, answer: encodings.size, steps };
}

function buildSteps9003(input, params) {
  const stock = (Array.isArray(input) ? input : []).map(Number);
  if (!stock.length || stock.some((quantity) => !Number.isInteger(quantity) || quantity < 0)) throw new Error("vmStock phải là mảng số nguyên không âm.");
  const requested = Number(params && params.customers);
  const customers = Number.isInteger(requested) ? Math.max(0, requested) : 4;
  const inventory = [...stock];
  const rentals = Math.min(customers, inventory.reduce((sum, quantity) => sum + quantity, 0));
  const steps = [];
  let revenue = 0;
  const snap = (options) => {
    steps.push({
      title: options.title, arr: [...inventory], highlight: options.highlight || [], mark: options.mark || [], final: Boolean(options.final), codeLines: options.codeLines || [],
      vars: [{ name: "revenue", value: revenue }, { name: "rentals", value: `${options.completed ?? 0} / ${customers}` }, { name: "price (current max)", value: options.max ?? "—" }],
      note: options.note,
    });
  };
  snap({ title: { vi: "Khởi tạo max-heap từ vmStock", en: "Initialize a max-heap from vmStock" }, codeLines: [4, 5], note: { vi: "Max-heap luôn đặt VM type còn nhiều nhất ở đầu heap.", en: "A max-heap always keeps the VM type with the largest remaining stock at its top." } });
  for (let customer = 0; customer < rentals; customer++) {
    const max = Math.max(...inventory);
    const maxIndex = inventory.indexOf(max);
    snap({ title: { vi: `Khách ${customer + 1}: lấy max=${max}`, en: `Customer ${customer + 1}: take max=${max}` }, codeLines: [7, 8], highlight: [maxIndex], completed: customer, max, note: { vi: `Type ${maxIndex + 1} có tồn kho lớn nhất nên được thuê. Giá thuê chính là ${max}, trước khi giảm.`, en: `Type ${maxIndex + 1} has the largest inventory, so it is rented. Its price is ${max}, before decrementing.` } });
    revenue += max;
    snap({ title: { vi: `Doanh thu += ${max}`, en: `Revenue += ${max}` }, codeLines: [9], highlight: [maxIndex], completed: customer, max, note: { vi: `Doanh thu lũy kế = ${revenue}.`, en: `Cumulative revenue = ${revenue}.` } });
    inventory[maxIndex] -= 1;
    snap({ title: { vi: `vmStock[${maxIndex}] giảm thành ${inventory[maxIndex]}`, en: `vmStock[${maxIndex}] decreases to ${inventory[maxIndex]}` }, codeLines: [10, 11], highlight: [maxIndex], completed: customer + 1, max, note: { vi: "Nếu vẫn dương, đẩy tồn kho mới vào max-heap.", en: "If it remains positive, push the new stock into the max-heap." } });
  }
  snap({ title: { vi: `Hoàn tất: revenue = ${revenue}`, en: `Complete: revenue = ${revenue}` }, codeLines: [12], completed: rentals, final: true, note: rentals < customers ? { vi: `Chỉ còn ${rentals} VM để thuê; hết tồn kho trước khách thứ ${customers}.`, en: `Only ${rentals} VMs were available; inventory ran out before customer ${customers}.` } : { vi: "Đã phục vụ đủ số khách có thể thuê.", en: "All possible rental requests have been served." } });
  return { original: stock, answer: revenue, steps };
}

function buildSteps9004(input) {
  const digits = (Array.isArray(input) ? input : []).map(Number);
  if (digits.length < 2 || digits.some((digit) => !Number.isInteger(digit) || digit < 0 || digit > 9)) throw new Error("Cần ít nhất 2 chữ số từ 0 đến 9.");
  const work = [...digits].sort((a, b) => b - a);
  const steps = [];
  const asNumber = () => work.join("");
  const snap = (title, line, highlight = [], mark = [], final = false, note = "") => steps.push({ title, arr: [...work], highlight, mark, final, codeLines: [line], vars: [{ name: "largest", value: digits.slice().sort((a, b) => b - a).join("") }, { name: "current", value: asNumber() }], note });
  snap({ vi: `Sort giảm dần → ${asNumber()} (lớn nhất)`, en: `Sort descending → ${asNumber()} (largest)` }, 3, [], [], false, { vi: "Số lớn nhất đặt chữ số lớn ở bên trái.", en: "The largest number places larger digits to the left." });
  let pivot = work.length - 2;
  while (pivot >= 0 && work[pivot] <= work[pivot + 1]) pivot -= 1;
  if (pivot < 0) {
    snap({ vi: "Không có hoán vị khác", en: "No distinct permutation exists" }, 6, [], [], true, { vi: "Mọi chữ số giống nhau, nên không tạo được số lớn nhì.", en: "All digits are equal, so no second-largest number can be formed." });
    return { original: digits, answer: null, steps };
  }
  snap({ vi: `Pivot: digit ${work[pivot]} tại index ${pivot}`, en: `Pivot: digit ${work[pivot]} at index ${pivot}` }, 6, [pivot], [], false, { vi: "Đây là vị trí phải nhất còn có thể giảm để nhận số nhỏ hơn gần nhất.", en: "This is the rightmost position that can decrease to make the nearest smaller number." });
  let swap = work.length - 1;
  while (work[swap] >= work[pivot]) swap -= 1;
  snap({ vi: `Chọn ${work[swap]} để đổi với pivot`, en: `Choose ${work[swap]} to swap with pivot` }, 8, [pivot, swap], [], false, { vi: "Chọn chữ số lớn nhất nhưng vẫn nhỏ hơn pivot.", en: "Choose the largest digit that is still smaller than the pivot." });
  [work[pivot], work[swap]] = [work[swap], work[pivot]];
  snap({ vi: `Đổi chỗ → ${asNumber()}`, en: `Swap → ${asNumber()}` }, 9, [pivot, swap], [], false, { vi: "Prefix giảm ít nhất có thể.", en: "The prefix decreases by the smallest possible amount." });
  const suffix = work.slice(pivot + 1).reverse();
  work.splice(pivot + 1, suffix.length, ...suffix);
  snap({ vi: `Đảo suffix → số lớn nhì ${asNumber()}`, en: `Reverse suffix → second-largest ${asNumber()}` }, 10, [], Array.from({ length: suffix.length }, (_, index) => pivot + 1 + index), true, { vi: "Sau khi giảm pivot, suffix tăng dần là lớn nhất có thể; đây là hoán vị ngay trước số lớn nhất.", en: "After decreasing the pivot, an ascending suffix is maximal; this is the permutation immediately before the largest." });
  return { original: digits, answer: asNumber(), steps };
}

module.exports = {
  9002: {
    id: 9002, difficulty: "hard", category: DESIGN, tags: [HASHMAP],
    title: { vi: "Music Player: LFU + Reset", en: "Music Player: LFU + Reset" },
    titleVi: { vi: "Trình phát nhạc: LFU và reset theo vòng", en: "Music player: LFU with round reset" },
    statement: {
      vi: "Thiết kế music player chọn bài CÓ tổng lượt phát thấp nhất (LFU). Một bài không được lặp lại trong cùng vòng; khi mọi bài đã được phát một lần, reset tập chặn và bắt đầu vòng mới. Nếu hòa LFU, chọn bài xuất hiện sớm hơn trong input.",
      en: "Design a music player that selects the song with the lowest total play count (LFU). A song cannot repeat within one round; once every song has played once, reset the blocking set and start a new round. LFU ties use input order.",
    },
    defaultInput: "Blinding Lights,Levitating,As It Was,Flowers", inputKind: "string",
    inputLabel: { vi: "songs (tên cách nhau bằng dấu phẩy; tối đa 8)", en: "songs (comma-separated names; up to 8)" },
    extraParams: [{ key: "plays", label: { vi: "số lần gọi play()", en: "number of play() calls" }, default: 10, min: 1, max: 32 }],
    approach: [
      { vi: "freq[song] lưu tổng số lượt phát, còn played_this_round chỉ quản lý luật không lặp trong vòng hiện tại.", en: "freq[song] stores total plays, while played_this_round only enforces the no-repeat rule in the current round." },
      { vi: "Nếu tập played_this_round đủ mọi bài, clear nó trước khi chọn; không reset freq để LFU vẫn có lịch sử toàn cục.", en: "If played_this_round contains every song, clear it before choosing; do not reset freq, so LFU retains global history." },
      { vi: "Lọc các bài chưa phát trong vòng, chọn freq nhỏ nhất; thứ tự input phá hòa để kết quả xác định.", en: "Filter songs not played this round, choose the smallest freq; input order breaks ties deterministically." },
    ],
    complexity: { time: "O(n) / play()", space: "O(n)", note: { vi: "Mỗi play quét tối đa n bài để lọc và tìm LFU. Hash map và set đều chứa tối đa n bài.", en: "Each play scans at most n songs to filter and find the LFU choice. The hash map and set hold at most n songs." } },
    code: [
      "class MusicPlayer:", "    def __init__(self, songs):", "        self.songs = songs", "        self.played_this_round = set()", "        self.freq = {song: 0 for song in songs}", "        self.order = {song: i for i, song in enumerate(songs)}", "",
      "    def play(self):", "        if len(self.played_this_round) == len(self.songs):", "            self.played_this_round.clear()", "",
      "        candidates = [s for s in self.songs if s not in self.played_this_round]", "        song = min(candidates, key=lambda s: (self.freq[s], self.order[s]))", "        self.freq[song] += 1", "        self.played_this_round.add(song)", "        return song",
    ],
    builder: buildSteps9002,
  },
  804: {
    id: 804, difficulty: "easy", slug: "unique-morse-code-words", category: HASHMAP, tags: [STRING],
    title: { vi: "Unique Morse Code Words", en: "Unique Morse Code Words" },
    titleVi: { vi: "Đếm mã Morse khác nhau", en: "Count distinct Morse encodings" },
    statement: { vi: "Mỗi từ thường được mã hóa bằng bảng Morse chuẩn. Trả về số encoding khác nhau của danh sách từ.", en: "Encode each lowercase word using the standard Morse table. Return the number of distinct encodings." },
    defaultInput: "gin,zen,gig,msg", inputKind: "string", inputLabel: { vi: "words (phẩy ngăn)", en: "words (comma separated)" }, extraParams: [],
    approach: [
      { vi: "Ánh xạ mỗi ký tự a-z sang chuỗi Morse tương ứng.", en: "Map each a-z character to its Morse string." },
      { vi: "Nối mã của các ký tự trong từng từ.", en: "Concatenate the codes of a word's characters." },
      { vi: "Đưa encoding vào hash set; size của set là số encoding duy nhất.", en: "Insert each encoding into a hash set; its size is the number of unique encodings." },
    ],
    complexity: { time: "O(total characters)", space: "O(total characters)", note: { vi: "Mỗi ký tự được mã hóa đúng một lần; set lưu các encoding khác nhau.", en: "Every character is encoded once; the set stores the distinct encodings." } },
    code: ["class Solution:", "    def uniqueMorseRepresentations(self, words):", "        morse = ['.-','-...','-.-.','-..','.','..-.','--.','....','..','.---','-.-','.-..','--','-.','---','.--.','--.-','.-.','...','-','..-','...-','.--','-..-','-.--','--..']", "        seen = set()", "        for word in words:", "            code = ''.join(morse[ord(ch) - ord('a')] for ch in word)", "            seen.add(code)", "        return len(seen)"],
    builder: buildSteps804,
  },
  9003: {
    id: 9003, difficulty: "medium", category: HEAP, tags: [GREEDY],
    title: { vi: "Virtual Machine Rental Revenue", en: "Virtual Machine Rental Revenue" },
    titleVi: { vi: "Doanh thu cho thuê máy ảo", en: "Virtual machine rental revenue" },
    statement: { vi: "Có các VM type với vmStock ban đầu. Mỗi khách thuê type có stock lớn nhất (giảm 1) và trả giá bằng chính stock lớn nhất đó trước khi giảm. Tính tổng doanh thu.", en: "Given VM types with initial vmStock, each customer rents the type with the largest stock (then it decreases by one) and pays that largest stock count before it decreases. Return total revenue." },
    defaultInput: [2, 2], inputKind: "nonneg", inputLabel: { vi: "vmStock", en: "vmStock" }, extraParams: [{ key: "customers", label: { vi: "m (số khách)", en: "m (customers)" }, default: 3, min: 0, max: 30 }],
    approach: [
      { vi: "Max-heap luôn cho VM type có tồn kho lớn nhất để khách thuê.", en: "A max-heap always provides the VM type with the largest stock for a rental." },
      { vi: "Cộng tồn kho lớn nhất vào revenue trước khi giảm nó đi một.", en: "Add the largest stock to revenue before decrementing it by one." },
      { vi: "Nếu stock mới vẫn dương, push lại heap để khách sau tiếp tục tranh VM type đó.", en: "If the new stock remains positive, push it back so later customers can rent that VM type." },
    ],
    complexity: { time: "O((n + m) log n)", space: "O(n)", note: { vi: "Khởi tạo heap O(n); mỗi lượt thuê pop và tối đa push lại một entry, đều O(log n).", en: "Heap setup is O(n); each rental pops and may push back one entry, each O(log n)." } },
    code: ["import heapq", "", "def totalRevenue(vmStock, m):", "    max_heap = [-q for q in vmStock if q > 0]", "    heapq.heapify(max_heap)", "    revenue = 0", "    for _ in range(m):", "        max_q = -heapq.heappop(max_heap)", "        revenue += max_q", "        if max_q > 1:", "            heapq.heappush(max_heap, -(max_q - 1))", "    return revenue"],
    builder: buildSteps9003,
  },
  9004: {
    id: 9004, difficulty: "medium", category: GREEDY, tags: [SORTING],
    title: { vi: "Second Largest Number from Digits", en: "Second Largest Number from Digits" },
    titleVi: { vi: "Số lớn nhì tạo từ các chữ số", en: "Second-largest number composable from digits" },
    statement: { vi: "Dùng mỗi chữ số đúng một lần để tạo số lớn nhất và trả về số lớn nhì phân biệt. Ví dụ [7,9,6,3] → lớn nhất 9763, lớn nhì 9736.", en: "Use every digit exactly once to form the largest number, then return the second-largest distinct number. Example: [7,9,6,3] → largest 9763, second-largest 9736." },
    defaultInput: [7, 9, 6, 3], inputKind: "nonneg", inputLabel: { vi: "digits (0..9)", en: "digits (0..9)" }, extraParams: [],
    approach: [
      { vi: "Sort giảm dần để nhận số lớn nhất.", en: "Sort descending to obtain the largest number." },
      { vi: "Tìm pivot phải nhất có thể giảm, rồi đổi với chữ số lớn nhất nhưng nhỏ hơn pivot.", en: "Find the rightmost pivot that can decrease, then swap it with the largest digit smaller than the pivot." },
      { vi: "Đảo suffix để suffix lớn nhất có thể sau khi prefix đã giảm; đây là previous permutation.", en: "Reverse the suffix to maximize it after the prefix decreases; this is the previous permutation." },
    ],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Sort chi phối O(n log n); bước previous permutation chỉ O(n).", en: "Sorting dominates at O(n log n); the previous-permutation step is only O(n)." } },
    code: ["def second_largest(digits):", "    digits.sort(reverse=True)", "", "    i = len(digits) - 2", "    while i >= 0 and digits[i] <= digits[i + 1]:", "        i -= 1", "    if i < 0:", "        return None", "    j = len(digits) - 1", "    while digits[j] >= digits[i]:", "        j -= 1", "    digits[i], digits[j] = digits[j], digits[i]", "    digits[i + 1:] = reversed(digits[i + 1:])", "    return ''.join(map(str, digits))"],
    builder: buildSteps9004,
  },
};
