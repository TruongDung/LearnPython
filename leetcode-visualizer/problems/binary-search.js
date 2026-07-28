// LeetCode Visualizer - Binary Search problems.

function parseIntegerList(value) {
  const parts = String(value ?? "").split(",").map((part) => part.trim());
  if (!parts.length || parts.some((part) => !/^-?\d+$/.test(part))) return [];
  const numbers = parts.map(Number);
  return numbers.every(Number.isSafeInteger) ? numbers : [];
}

/**
 * LeetCode 33: Search in Rotated Sorted Array.
 * At least one half around mid is sorted, which tells us which half can
 * contain the target and which half can be discarded.
 */
function buildSteps33(nums, params) {
  const target = Number(params && params.target !== undefined ? params.target : nums[0]);
  const steps = [];
  let left = 0;
  let right = nums.length - 1;

  function activeRange(l, r) {
    return l <= r ? Array.from({ length: r - l + 1 }, (_, index) => l + index) : [];
  }

  function labels(l, r, mid) {
    return nums.map((_, index) => {
      const tags = [];
      if (index === l) tags.push("L");
      if (index === mid) tags.push("M");
      if (index === r) tags.push("R");
      return tags.length ? `[${index}] ${tags.join("/")}` : `[${index}]`;
    });
  }

  function pushStep({
    title,
    note,
    mid,
    codeLines,
    final = false,
    answer,
    phase = "range",
    sortedHalf = null,
    keptHalf = null,
    eliminated = [],
    comparison = null,
  }) {
    const vars = [
      { name: "left (L)", value: left },
      { name: "right (R)", value: right },
      { name: "target", value: target },
    ];
    if (Number.isInteger(mid)) {
      vars.splice(2, 0,
        { name: "mid (M)", value: mid },
        { name: "nums[M]", value: nums[mid] },
      );
    }
    if (answer !== undefined) vars.push({ name: "answer", value: answer });

    steps.push({
      title,
      arr: [...nums],
      rotatedSearchView: {
        nums: [...nums],
        target,
        left,
        right,
        mid: Number.isInteger(mid) ? mid : null,
        phase,
        sortedHalf,
        keptHalf,
        eliminated,
        comparison,
      },
      sub: labels(left, right, mid),
      highlight: activeRange(left, right),
      mark: Number.isInteger(mid) ? [mid] : [],
      final,
      codeLines,
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: "Khởi tạo vùng tìm kiếm", en: "Initialize the search range" },
    note: {
      vi: `Tìm target=${target} trong toàn bộ mảng xoay. L và R bao quanh vùng chưa bị loại.`,
      en: `Search for target=${target} in the rotated array. L and R bound the remaining candidates.`,
    },
    codeLines: [3],
    comparison: {
      vi: `Vùng ứng viên ban đầu: [0, ${nums.length - 1}]`,
      en: `Initial candidate range: [0, ${nums.length - 1}]`,
    },
  });

  while (left <= right) {
    pushStep({
      title: { vi: `while L ≤ R → ${left} ≤ ${right} → True`, en: `while L ≤ R → ${left} ≤ ${right} → True` },
      note: {
        vi: "Vùng tìm kiếm vẫn còn phần tử, nên bắt đầu một vòng lặp mới. M chưa được gán ở bước này.",
        en: "The search range still has candidates, so begin a new loop iteration. M is not assigned at this step.",
      },
      codeLines: [4],
      phase: "range",
      comparison: {
        vi: `L=${left} ≤ R=${right} → tiếp tục; M chưa được gán`,
        en: `L=${left} ≤ R=${right} → continue; M is not assigned yet`,
      },
    });

    const mid = Math.floor((left + right) / 2);
    pushStep({
      title: { vi: `M = (L + R) // 2 = ${mid}`, en: `M = (L + R) // 2 = ${mid}` },
      note: {
        vi: `Xét nums[${mid}]=${nums[mid]} ở giữa vùng [${left}, ${right}].`,
        en: `Inspect nums[${mid}]=${nums[mid]} in the middle of [${left}, ${right}].`,
      },
      mid,
      codeLines: [5],
      phase: "mid",
      comparison: {
        vi: `So sánh nums[M]=${nums[mid]} với target=${target}`,
        en: `Compare nums[M]=${nums[mid]} with target=${target}`,
      },
    });

    const foundTarget = nums[mid] === target;
    pushStep({
      title: { vi: `nums[M] == target → ${nums[mid]} == ${target} → ${foundTarget}`, en: `nums[M] == target → ${nums[mid]} == ${target} → ${foundTarget}` },
      note: foundTarget
        ? { vi: "Điều kiện đúng, nên dòng tiếp theo trả về M.", en: "The condition is true, so the next line returns M." }
        : { vi: "Điều kiện sai, tiếp tục xác định nửa nào được sắp xếp.", en: "The condition is false, so determine which half is sorted." },
      mid,
      codeLines: [6],
      phase: foundTarget ? "mid" : "sorted",
      comparison: foundTarget
        ? { vi: `${nums[mid]} = ${target} → True`, en: `${nums[mid]} = ${target} → True` }
        : { vi: `${nums[mid]} ≠ ${target} → False`, en: `${nums[mid]} ≠ ${target} → False` },
    });

    if (foundTarget) {
      pushStep({
        title: { vi: `Tìm thấy target tại index ${mid}`, en: `Target found at index ${mid}` },
        note: {
          vi: `nums[M]=${target}, nên trả về M=${mid}.`,
          en: `nums[M]=${target}, so return M=${mid}.`,
        },
        mid,
        codeLines: [7],
        final: true,
        answer: mid,
        phase: "found",
        comparison: { vi: `${nums[mid]} = ${target}`, en: `${nums[mid]} = ${target}` },
      });
      return { original: [...nums], answer: mid, steps };
    }

    const leftSorted = nums[left] <= nums[mid];
    pushStep({
      title: leftSorted
        ? { vi: "Nửa trái đang tăng dần", en: "The left half is sorted" }
        : { vi: "Nửa phải đang tăng dần", en: "The right half is sorted" },
      note: leftSorted
        ? {
            vi: `nums[L]=${nums[left]} ≤ nums[M]=${nums[mid]}, nên đoạn [L, M] đã được sắp xếp.`,
            en: `nums[L]=${nums[left]} ≤ nums[M]=${nums[mid]}, so [L, M] is sorted.`,
          }
        : {
            vi: `nums[L]=${nums[left]} > nums[M]=${nums[mid]}, nên điểm xoay nằm bên trái và đoạn [M, R] đã được sắp xếp.`,
            en: `nums[L]=${nums[left]} > nums[M]=${nums[mid]}, so the pivot is on the left and [M, R] is sorted.`,
          },
      mid,
      codeLines: [leftSorted ? 8 : 13],
      phase: "sorted",
      sortedHalf: leftSorted ? "left" : "right",
      comparison: leftSorted
        ? { vi: `${nums[left]} ≤ ${nums[mid]} → nửa trái tăng dần`, en: `${nums[left]} ≤ ${nums[mid]} → left half is sorted` }
        : { vi: `${nums[left]} > ${nums[mid]} → nửa phải tăng dần`, en: `${nums[left]} > ${nums[mid]} → right half is sorted` },
    });

    if (leftSorted) {
      const targetInLeft = nums[left] <= target && target < nums[mid];
      pushStep({
        title: { vi: `Target thuộc nửa trái? ${targetInLeft}`, en: `Is target in the left half? ${targetInLeft}` },
        note: targetInLeft
          ? { vi: `${nums[left]} ≤ ${target} < ${nums[mid]} là đúng.`, en: `${nums[left]} ≤ ${target} < ${nums[mid]} is true.` }
          : { vi: `${target} không nằm trong khoảng [${nums[left]}, ${nums[mid]}).`, en: `${target} is outside [${nums[left]}, ${nums[mid]}).` },
        mid,
        codeLines: [9],
        phase: "sorted",
        sortedHalf: "left",
        comparison: targetInLeft
          ? { vi: `${nums[left]} ≤ ${target} < ${nums[mid]} → True`, en: `${nums[left]} ≤ ${target} < ${nums[mid]} → True` }
          : { vi: `${nums[left]} ≤ ${target} < ${nums[mid]} → False`, en: `${nums[left]} ≤ ${target} < ${nums[mid]} → False` },
      });
      if (targetInLeft) {
        const previousRight = right;
        right = mid - 1;
        pushStep({
          title: { vi: `Target thuộc nửa trái: R = ${right}`, en: `Target is in the left half: R = ${right}` },
          note: {
            vi: `${nums[left]} ≤ ${target} < ${nums[mid]}, nên giữ nửa trái và loại [${mid}, ${previousRight}].`,
            en: `${nums[left]} ≤ ${target} < ${nums[mid]}, so keep the left half and discard [${mid}, ${previousRight}].`,
          },
          mid,
          codeLines: [10],
          phase: "narrow",
          keptHalf: "left",
          eliminated: Array.from({ length: previousRight - mid + 1 }, (_, index) => mid + index),
          comparison: { vi: `${nums[left]} ≤ ${target} < ${nums[mid]} → giữ TRÁI`, en: `${nums[left]} ≤ ${target} < ${nums[mid]} → keep LEFT` },
        });
      } else {
        const previousLeft = left;
        pushStep({
          title: { vi: "Nhánh else của nửa trái", en: "Else branch for the left half" },
          note: {
            vi: "Điều kiện ở dòng 9 sai. L chưa thay đổi; dòng tiếp theo mới gán L = M + 1.",
            en: "The condition on line 9 is false. L has not changed; the next line assigns L = M + 1.",
          },
          mid,
          codeLines: [11],
          phase: "sorted",
          sortedHalf: "left",
          comparison: { vi: "Đi vào else; L chưa đổi", en: "Enter else; L has not changed" },
        });
        left = mid + 1;
        pushStep({
          title: { vi: `Target không thuộc nửa trái: L = ${left}`, en: `Target is not in the left half: L = ${left}` },
          note: {
            vi: `Target không nằm trong đoạn tăng [${previousLeft}, ${mid}], nên loại đoạn đó.`,
            en: `The target is outside sorted range [${previousLeft}, ${mid}], so discard it.`,
          },
          mid,
          codeLines: [12],
          phase: "narrow",
          keptHalf: "right",
          eliminated: Array.from({ length: mid - previousLeft + 1 }, (_, index) => previousLeft + index),
          comparison: { vi: `target không thuộc [${nums[previousLeft]}, ${nums[mid]}) → giữ PHẢI`, en: `target is outside [${nums[previousLeft]}, ${nums[mid]}) → keep RIGHT` },
        });
      }
    } else {
      const targetInRight = nums[mid] < target && target <= nums[right];
      pushStep({
        title: { vi: `Target thuộc nửa phải? ${targetInRight}`, en: `Is target in the right half? ${targetInRight}` },
        note: targetInRight
          ? { vi: `${nums[mid]} < ${target} ≤ ${nums[right]} là đúng.`, en: `${nums[mid]} < ${target} ≤ ${nums[right]} is true.` }
          : { vi: `${target} không nằm trong khoảng (${nums[mid]}, ${nums[right]}].`, en: `${target} is outside (${nums[mid]}, ${nums[right]}].` },
        mid,
        codeLines: [14],
        phase: "sorted",
        sortedHalf: "right",
        comparison: targetInRight
          ? { vi: `${nums[mid]} < ${target} ≤ ${nums[right]} → True`, en: `${nums[mid]} < ${target} ≤ ${nums[right]} → True` }
          : { vi: `${nums[mid]} < ${target} ≤ ${nums[right]} → False`, en: `${nums[mid]} < ${target} ≤ ${nums[right]} → False` },
      });
      if (targetInRight) {
        const previousLeft = left;
        left = mid + 1;
        pushStep({
          title: { vi: `Target thuộc nửa phải: L = ${left}`, en: `Target is in the right half: L = ${left}` },
          note: {
            vi: `${nums[mid]} < ${target} ≤ ${nums[right]}, nên giữ nửa phải và loại [${previousLeft}, ${mid}].`,
            en: `${nums[mid]} < ${target} ≤ ${nums[right]}, so keep the right half and discard [${previousLeft}, ${mid}].`,
          },
          mid,
          codeLines: [15],
          phase: "narrow",
          keptHalf: "right",
          eliminated: Array.from({ length: mid - previousLeft + 1 }, (_, index) => previousLeft + index),
          comparison: { vi: `${nums[mid]} < ${target} ≤ ${nums[right]} → giữ PHẢI`, en: `${nums[mid]} < ${target} ≤ ${nums[right]} → keep RIGHT` },
        });
      } else {
        const previousRight = right;
        pushStep({
          title: { vi: "Nhánh else của nửa phải", en: "Else branch for the right half" },
          note: {
            vi: "Điều kiện ở dòng 14 sai. R chưa thay đổi; dòng tiếp theo mới gán R = M - 1.",
            en: "The condition on line 14 is false. R has not changed; the next line assigns R = M - 1.",
          },
          mid,
          codeLines: [16],
          phase: "sorted",
          sortedHalf: "right",
          comparison: { vi: "Đi vào else; R chưa đổi", en: "Enter else; R has not changed" },
        });
        right = mid - 1;
        pushStep({
          title: { vi: `Target không thuộc nửa phải: R = ${right}`, en: `Target is not in the right half: R = ${right}` },
          note: {
            vi: `Target không nằm trong đoạn tăng [${mid}, ${previousRight}], nên loại đoạn đó.`,
            en: `The target is outside sorted range [${mid}, ${previousRight}], so discard it.`,
          },
          mid,
          codeLines: [17],
          phase: "narrow",
          keptHalf: "left",
          eliminated: Array.from({ length: previousRight - mid + 1 }, (_, index) => mid + index),
          comparison: { vi: `target không thuộc (${nums[mid]}, ${nums[previousRight]}] → giữ TRÁI`, en: `target is outside (${nums[mid]}, ${nums[previousRight]}] → keep LEFT` },
        });
      }
    }
  }

  pushStep({
    title: { vi: "Không tìm thấy target", en: "Target not found" },
    note: {
      vi: "L đã vượt R, vùng tìm kiếm rỗng nên trả về -1.",
      en: "L has passed R, leaving no candidates, so return -1.",
    },
    codeLines: [18],
    final: true,
    answer: -1,
    phase: "not-found",
    comparison: { vi: "L > R → vùng ứng viên rỗng", en: "L > R → no candidates remain" },
  });
  return { original: [...nums], answer: -1, steps };
}

function formatCounts(counts) {
  const entries = [...counts.entries()].sort((a, b) => a[0] - b[0]);
  return `{${entries.map(([person, count]) => `${person}: ${count}`).join(", ")}}`;
}

function timelineLabels(persons, leaders, tags = {}) {
  return persons.map((person, index) => {
    const leader = leaders[index] == null ? "?" : leaders[index];
    const tag = tags[index] ? ` | ${tags[index]}` : "";
    return `p=${person} | L=${leader}${tag}`;
  });
}

function buildSteps911(persons, params) {
  const times = parseIntegerList(params.times);
  const queries = parseIntegerList(params.queries);
  const steps = [];

  const validTimeline = times.length === persons.length
    && times.length > 0
    && times.every((time, index) => time >= 0 && (index === 0 || times[index - 1] < time));
  const validQueries = validTimeline && queries.length > 0 && queries.every((query) => query >= times[0]);

  if (!validTimeline || !validQueries) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: times.length ? [...times] : [0],
      sub: times.length === persons.length ? timelineLabels(persons, []) : [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [],
      vars: [
        { name: "persons.length", value: persons.length },
        { name: "times.length", value: times.length },
        { name: "queries.length", value: queries.length },
      ],
      note: {
        vi: "persons và times phải cùng độ dài; times tăng nghiêm ngặt; mỗi query phải >= times[0].",
        en: "persons and times must have equal length; times must be strictly increasing; every query must be >= times[0].",
      },
    });
    return { original: { persons: [...persons], times, queries }, answer: null, steps };
  }

  const leaders = [];
  const votes = new Map();
  let leader = -1;

  steps.push({
    title: { vi: "Gọi TopVotedCandidate(persons, times)", en: "Call TopVotedCandidate(persons, times)" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [
      { name: "persons", value: `[${persons.join(", ")}]` },
      { name: "times", value: `[${times.join(", ")}]` },
    ],
    note: {
      vi: "Bắt đầu constructor; các thuộc tính self.times và self.leaders chưa được gán.",
      en: "Enter the constructor; self.times and self.leaders have not been assigned yet.",
    },
  });

  steps.push({
    title: { vi: "Lưu timeline", en: "Store the timeline" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
    ],
    note: {
      vi: "times đã tăng nghiêm ngặt. Mỗi index i ghép persons[i] với times[i].",
      en: "times is strictly increasing. Each index i pairs persons[i] with times[i].",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo self.leaders", en: "Initialize self.leaders" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "self.leaders", value: "[]" },
    ],
    note: {
      vi: "Mảng self.leaders bắt đầu rỗng và sẽ lưu leader sau từng phiếu.",
      en: "self.leaders starts empty and will store the leader after every vote.",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo votes = {}", en: "Initialize votes = {}" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "self.leaders", value: "[]" },
      { name: "votes", value: "{}" },
    ],
    note: {
      vi: "Hash map votes chưa chứa phiếu của ứng viên nào.",
      en: "The votes hash map does not contain any candidate counts yet.",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo leader = -1", en: "Initialize leader = -1" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "self.leaders", value: "[]" },
      { name: "votes", value: "{}" },
      { name: "leader", value: "none" },
    ],
    note: {
      vi: "Giá trị -1 là sentinel: chưa có leader trước phiếu đầu tiên.",
      en: "The value -1 is a sentinel: there is no leader before the first vote.",
    },
  });

  for (let i = 0; i < persons.length; i++) {
    const person = persons[i];

    steps.push({
      title: { vi: `Phiếu ${i}: person = ${person}`, en: `Vote ${i}: person = ${person}` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [7],
      vars: [
        { name: "person", value: person },
        { name: "votes", value: formatCounts(votes) },
        { name: "leader", value: leader < 0 ? "none" : leader },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: `Xử lý phiếu cho person ${person} tại time ${times[i]}.`,
        en: `Process a vote for person ${person} at time ${times[i]}.`,
      },
    });

    votes.set(person, (votes.get(person) || 0) + 1);
    steps.push({
      title: { vi: `votes[${person}] += 1`, en: `votes[${person}] += 1` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [8],
      vars: [
        { name: "person", value: person },
        { name: "votes", value: formatCounts(votes) },
        { name: "leader", value: leader < 0 ? "none" : leader },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: `Person ${person} hiện có ${votes.get(person)} phiếu.`,
        en: `Person ${person} now has ${votes.get(person)} vote(s).`,
      },
    });

    const leaderVotes = leader < 0 ? 0 : (votes.get(leader) || 0);
    const shouldLead = votes.get(person) >= leaderVotes;
    const tiesDifferentLeader = leader >= 0 && leader !== person && votes.get(person) === leaderVotes;
    steps.push({
      title: {
        vi: `So sánh ${votes.get(person)} >= ${leaderVotes}: ${shouldLead ? "True" : "False"}`,
        en: `Compare ${votes.get(person)} >= ${leaderVotes}: ${shouldLead ? "True" : "False"}`,
      },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [9],
      vars: [
        { name: "person", value: person },
        { name: "votes", value: formatCounts(votes) },
        { name: "leader", value: leader < 0 ? "none" : leader },
        { name: "votes.get(leader, 0)", value: leaderVotes },
        { name: "condition", value: shouldLead ? "True" : "False" },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: leader < 0
          ? `Đây là phiếu đầu tiên, nên person ${person} trở thành leader.`
          : tiesDifferentLeader
          ? "Hai người hòa phiếu. Điều kiện >= cho người vừa nhận phiếu trở thành leader."
          : shouldLead
            ? `Person ${person} đang dẫn đầu và vừa nhận thêm phiếu, nên vẫn là leader.`
            : `Person ${person} ít phiếu hơn leader ${leader}, nên leader không đổi.`,
        en: leader < 0
          ? `This is the first vote, so person ${person} becomes the leader.`
          : tiesDifferentLeader
          ? "Two candidates are tied. The >= condition makes the most recently voted person the leader."
          : shouldLead
            ? `Person ${person} is already leading and just received another vote, so remains leader.`
            : `Person ${person} has fewer votes than leader ${leader}, so the leader stays unchanged.`,
      },
    });

    if (shouldLead) {
      const previousLeader = leader;
      leader = person;
      steps.push({
        title: { vi: `leader = ${person}`, en: `leader = ${person}` },
        arr: [...times],
        sub: timelineLabels(persons, leaders),
        highlight: [i],
        mark: leaders.map((_, index) => index),
        codeLines: [10],
        vars: [
          { name: "person", value: person },
          { name: "votes", value: formatCounts(votes) },
          { name: "leader", value: leader },
          { name: "self.leaders", value: `[${leaders.join(", ")}]` },
        ],
        note: {
          vi: tiesDifferentLeader
            ? `Đang hòa ${leaderVotes}-${leaderVotes}; phiếu mới nhất thuộc person ${person}, nên ${person} thắng tie.`
            : previousLeader === person
              ? `Leader ${person} nhận thêm phiếu và tiếp tục dẫn đầu với ${votes.get(person)} phiếu.`
              : `Person ${person} trở thành leader với ${votes.get(person)} phiếu.`,
          en: tiesDifferentLeader
            ? `The count is tied ${leaderVotes}-${leaderVotes}; the latest vote is for person ${person}, so ${person} wins the tie.`
            : previousLeader === person
              ? `Leader ${person} receives another vote and remains ahead with ${votes.get(person)} vote(s).`
              : `Person ${person} becomes leader with ${votes.get(person)} vote(s).`,
        },
      });
    }

    leaders.push(leader);
    steps.push({
      title: { vi: `leaders.append(${leader})`, en: `leaders.append(${leader})` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [11],
      vars: [
        { name: "person", value: person },
        { name: "votes", value: formatCounts(votes) },
        { name: "leader", value: leader },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: `Tại time ${times[i]}, leader được lưu là person ${leader}.`,
        en: `At time ${times[i]}, person ${leader} is stored as the leader.`,
      },
    });
  }

  steps.push({
    title: { vi: "Hoàn tất tiền xử lý", en: "Preprocessing complete" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: times.map((_, index) => index),
    codeLines: [],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      { name: "construction", value: "O(n)" },
    ],
    note: {
      vi: "Mỗi times[i] đã ghép với leaders[i]. Bây giờ mỗi q(t) chỉ cần binary search.",
      en: "Each times[i] is paired with leaders[i]. Each q(t) can now use binary search.",
    },
  });

  const answers = [];
  for (let queryIndex = 0; queryIndex < queries.length; queryIndex++) {
    const t = queries[queryIndex];

    steps.push({
      title: { vi: `Gọi q(${t})`, en: `Call q(${t})` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [],
      mark: [],
      codeLines: [13],
      vars: [
        { name: "t", value: t },
        { name: "self.times", value: `[${times.join(", ")}]` },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: `Bắt đầu một lần gọi q với tham số t=${t}; left và right chưa được gán cho lần gọi này.`,
        en: `Begin one q call with t=${t}; left and right have not been assigned for this call yet.`,
      },
    });

    let left = 0;
    let right = times.length;
    let mid = null;
    steps.push({
      title: { vi: `left, right = 0, ${right}`, en: `left, right = 0, ${right}` },
      arr: [...times],
      sub: timelineLabels(persons, leaders, { 0: "L", [times.length - 1]: "R-1" }),
      highlight: [],
      mark: [],
      codeLines: [14],
      vars: [
        { name: "t", value: t },
        { name: "left", value: left },
        { name: "right", value: right },
      ],
      note: {
        vi: `Tìm index đầu tiên có times[index] > ${t}. right=${right} là biên loại trừ.`,
        en: `Find the first index where times[index] > ${t}. right=${right} is exclusive.`,
      },
    });

    while (left < right) {
      steps.push({
        title: { vi: `Kiểm tra ${left} < ${right}`, en: `Check ${left} < ${right}` },
        arr: [...times],
        sub: timelineLabels(persons, leaders, {
          [left]: "L",
          [Math.max(left, right - 1)]: left === right - 1 ? "L,R-1" : "R-1",
        }),
        highlight: [],
        mark: [],
        codeLines: [15],
        vars: [
          { name: "t", value: t },
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "condition", value: "True" },
        ],
        note: {
          vi: "Khoảng tìm kiếm chưa rỗng, tiếp tục binary search.",
          en: "The search interval is not empty, so binary search continues.",
        },
      });

      mid = Math.floor((left + right) / 2);
      const tags = { [left]: "L", [mid]: "M" };
      if (right - 1 >= left) tags[right - 1] = tags[right - 1] ? `${tags[right - 1]},R-1` : "R-1";
      steps.push({
        title: { vi: `mid = (${left} + ${right}) // 2 = ${mid}`, en: `mid = (${left} + ${right}) // 2 = ${mid}` },
        arr: [...times],
        sub: timelineLabels(persons, leaders, tags),
        highlight: [mid],
        mark: [],
        codeLines: [16],
        vars: [
          { name: "t", value: t },
          { name: "left", value: left },
          { name: "mid", value: mid },
          { name: "right", value: right },
          { name: "times[mid]", value: times[mid] },
        ],
        note: {
          vi: `Chọn index giữa ${mid}, tương ứng time ${times[mid]} và leader ${leaders[mid]}.`,
          en: `Choose middle index ${mid}, which has time ${times[mid]} and leader ${leaders[mid]}.`,
        },
      });

      const moveRight = times[mid] <= t;
      steps.push({
        title: {
          vi: `${times[mid]} <= ${t}: ${moveRight ? "True" : "False"}`,
          en: `${times[mid]} <= ${t}: ${moveRight ? "True" : "False"}`,
        },
        arr: [...times],
        sub: timelineLabels(persons, leaders, tags),
        highlight: [mid],
        mark: [],
        codeLines: [17],
        vars: [
          { name: "t", value: t },
          { name: "left", value: left },
          { name: "mid", value: mid },
          { name: "right", value: right },
          { name: "times[mid]", value: times[mid] },
          { name: "condition", value: moveRight ? "True" : "False" },
        ],
        note: {
          vi: moveRight
            ? `time ${times[mid]} <= ${t}; index đầu tiên có time > t phải nằm sau mid, nên bỏ [left..mid].`
            : `time ${times[mid]} đã vượt query ${t}; index đầu tiên > t nằm tại mid hoặc bên trái.`,
          en: moveRight
            ? `Time ${times[mid]} <= ${t}; the first time greater than t must be after mid, so discard [left..mid].`
            : `Time ${times[mid]} exceeds query ${t}; the first index > t is at mid or to its left.`,
        },
      });

      if (moveRight) {
        left = mid + 1;
        steps.push({
          title: { vi: `left = ${mid} + 1 = ${left}`, en: `left = ${mid} + 1 = ${left}` },
          arr: [...times],
          sub: timelineLabels(persons, leaders, left < times.length ? { [left]: "new L" } : {}),
          highlight: [],
          mark: [],
          codeLines: [18],
          vars: [
            { name: "t", value: t },
            { name: "left", value: left },
            { name: "mid", value: mid },
            { name: "right", value: right },
          ],
          note: {
            vi: `Dời left qua mid. Khoảng mới là [${left}, ${right}).`,
            en: `Move left past mid. The new interval is [${left}, ${right}).`,
          },
        });
      } else {
        steps.push({
          title: { vi: "Đi vào nhánh else", en: "Enter the else branch" },
          arr: [...times],
          sub: timelineLabels(persons, leaders, tags),
          highlight: [mid],
          mark: [],
          codeLines: [19],
          vars: [
            { name: "t", value: t },
            { name: "left", value: left },
            { name: "mid", value: mid },
            { name: "right", value: right },
            { name: "times[mid]", value: times[mid] },
          ],
          note: {
            vi: `${times[mid]} <= ${t} là False; chưa đổi right cho đến khi chạy dòng 20.`,
            en: `${times[mid]} <= ${t} is False; right does not change until line 20 runs.`,
          },
        });

        right = mid;
        steps.push({
          title: { vi: `right = mid = ${right}`, en: `right = mid = ${right}` },
          arr: [...times],
          sub: timelineLabels(persons, leaders, right > left ? { [right - 1]: "new R-1" } : {}),
          highlight: [],
          mark: [],
          codeLines: [20],
          vars: [
            { name: "t", value: t },
            { name: "left", value: left },
            { name: "mid", value: mid },
            { name: "right", value: right },
          ],
          note: {
            vi: `Giữ mid trong phía có thể chứa index đầu tiên > t. Khoảng mới là [${left}, ${right}).`,
            en: `Keep mid in the side that may contain the first index > t. The new interval is [${left}, ${right}).`,
          },
        });
      }
    }

    steps.push({
      title: { vi: `Kiểm tra ${left} < ${right}: False`, en: `Check ${left} < ${right}: False` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [],
      mark: [],
      codeLines: [15],
      vars: [
        { name: "t", value: t },
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "mid", value: mid },
        { name: "condition", value: "False" },
      ],
      note: {
        vi: `Khoảng [${left}, ${right}) đã rỗng. left=${left} là index đầu tiên có time > ${t}.`,
        en: `The interval [${left}, ${right}) is empty. left=${left} is the first index whose time is greater than ${t}.`,
      },
    });

    const answerIndex = left - 1;
    const answer = leaders[answerIndex];
    answers.push(answer);
    steps.push({
      title: { vi: `q(${t}) = ${answer}`, en: `q(${t}) = ${answer}` },
      arr: [...times],
      sub: timelineLabels(persons, leaders, { [answerIndex]: "answer" }),
      highlight: [],
      mark: [answerIndex],
      codeLines: [21],
      vars: [
        { name: "t", value: t },
        { name: "left", value: left },
        { name: "left - 1", value: answerIndex },
        { name: "self.leaders[left - 1]", value: answer },
      ],
      note: {
        vi: `left=${left} là index đầu tiên có time > ${t}; vì vậy time gần nhất <= ${t} nằm tại left-1=${answerIndex}.`,
        en: `left=${left} is the first index with time > ${t}; therefore the latest time <= ${t} is at left-1=${answerIndex}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả tất cả truy vấn", en: "All query results" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [],
    vars: [
      { name: "queries", value: `[${queries.join(", ")}]` },
      { name: "answers", value: `[${answers.join(", ")}]` },
    ],
    note: {
      vi: `Hoàn tất ${queries.length} truy vấn. Mỗi truy vấn dùng O(log n).`,
      en: `Completed ${queries.length} queries. Each query uses O(log n).`,
    },
  });

  return {
    original: { persons: [...persons], times, queries },
    answer: answers,
    steps,
  };
}

/**
 * LeetCode 4: Median of Two Sorted Arrays.
 *
 * Given two sorted arrays nums1 (size m) and nums2 (size n), find the median
 * of the merged sorted array in O(log(min(m,n))) time — WITHOUT merging.
 *
 * Key idea: binary search a "partition" of the SHORTER array (A). For a
 * candidate cut i in A (0..m), the corresponding cut in B is forced:
 *   j = (m + n + 1) // 2 - i
 * so that the LEFT side (A[0..i) + B[0..j)) always has exactly
 * ceil((m+n)/2) elements. The partition is valid once:
 *   A[i-1] <= B[j]  and  B[j-1] <= A[i]
 * (using -Infinity/+Infinity as sentinels at the array edges).
 * Once valid, the median is derived from maxLeft/minRight directly.
 */
function parseNumList(raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return [];
  return trimmed.split(",").map((s) => Number(s.trim()));
}

function buildSteps4(input, params) {
  const A0 = Array.isArray(input) ? input.map(Number) : parseNumList(input);
  const B0 = parseNumList(params.nums2);
  const steps = [];

  const validA = A0.every((v) => Number.isFinite(v));
  const validB = B0.every((v) => Number.isFinite(v));

  if (!validA || !validB || (A0.length === 0 && B0.length === 0)) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "nums1 và nums2 phải là mảng số, không cùng rỗng.", en: "nums1 and nums2 must be numeric arrays, not both empty." },
    });
    return { original: A0, answer: 0, steps };
  }

  // Ensure A is the SHORTER array (binary search runs on A).
  let swapped = false;
  let A = A0, B = B0;
  if (A.length > B.length) { A = B0; B = A0; swapped = true; }
  const m = A.length, n = B.length;

  const labelA = swapped ? "nums2" : "nums1";
  const labelB = swapped ? "nums1" : "nums2";

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      partitionView: {
        rowA: A,
        rowB: B,
        labelA,
        labelB,
        cutA: opts.i !== undefined ? opts.i : 0,
        cutB: opts.j !== undefined ? opts.j : 0,
        highlight: opts.highlight || {},
        status: opts.status || [],
      },
      highlight: [],
      mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Line 3: m, n = len(nums1), len(nums2)
  snap({
    title: { vi: `m, n = len(nums1), len(nums2) → m=${A0.length}, n=${B0.length}`, en: `m, n = len(nums1), len(nums2) → m=${A0.length}, n=${B0.length}` },
    i: 0, j: 0,
    codeLines: [3],
    vars: [{ name: "m", value: A0.length }, { name: "n", value: B0.length }],
    note: {
      vi: `m = len(nums1) = ${A0.length}, n = len(nums2) = ${B0.length}.`,
      en: `m = len(nums1) = ${A0.length}, n = len(nums2) = ${B0.length}.`,
    },
  });

  // Line 4: if m > n:
  snap({
    title: { vi: `if m > n → ${A0.length} > ${B0.length} → ${swapped}`, en: `if m > n → ${A0.length} > ${B0.length} → ${swapped}` },
    i: 0, j: 0,
    codeLines: [4],
    vars: [{ name: "m > n", value: swapped }],
    note: swapped
      ? { vi: `nums1 dài hơn nums2 → cần đổi vai trò để binary search luôn chạy trên mảng NGẮN HƠN.`, en: `nums1 is longer than nums2 → need to swap roles so binary search always runs on the SHORTER array.` }
      : { vi: `nums1 không dài hơn nums2 → giữ nguyên, A=nums1 (ngắn hơn hoặc bằng), B=nums2.`, en: `nums1 is not longer than nums2 → keep as is, A=nums1 (shorter or equal), B=nums2.` },
  });

  if (swapped) {
    // Line 5: nums1, nums2, m, n = nums2, nums1, n, m
    snap({
      title: { vi: `nums1, nums2, m, n = nums2, nums1, n, m`, en: `nums1, nums2, m, n = nums2, nums1, n, m` },
      i: 0, j: 0,
      codeLines: [5],
      vars: [{ name: "A (shorter)", value: `[${A.join(",")}]` }, { name: "B (longer)", value: `[${B.join(",")}]` }],
      note: {
        vi: `Đổi vai trò: giờ A=[${A.join(",")}] (m=${m}) là mảng ngắn hơn, B=[${B.join(",")}] (n=${n}).`,
        en: `Roles swapped: now A=[${A.join(",")}] (m=${m}) is the shorter array, B=[${B.join(",")}] (n=${n}).`,
      },
    });
  }

  // Line 6: left, right = 0, m
  let left = 0, right = m;
  snap({
    title: { vi: `left, right = 0, m → left=0, right=${m}`, en: `left, right = 0, m → left=0, right=${m}` },
    i: 0,
    j: Math.ceil((m + n) / 2),
    codeLines: [6],
    vars: [{ name: "left", value: 0 }, { name: "right", value: m }],
    note: {
      vi: `Binary search giá trị i (số phần tử của A ở nửa TRÁI), i ∈ [0, ${m}].`,
      en: `Binary search the value i (how many elements of A go in the LEFT half), i ∈ [0, ${m}].`,
    },
  });

  const half = Math.floor((m + n + 1) / 2);
  let result = null;
  let iterGuard = 0;

  while (left <= right && iterGuard < 200) {
    iterGuard++;
    // Line 7: while left <= right:
    snap({
      title: { vi: `while left ≤ right → ${left} ≤ ${right} → True`, en: `while left ≤ right → ${left} ≤ ${right} → True` },
      i: left,
      j: half - left,
      codeLines: [7],
      vars: [{ name: "left", value: left }, { name: "right", value: right }],
      note: {
        vi: `left=${left} ≤ right=${right} → còn khoảng để tìm i hợp lệ, tiếp tục.`,
        en: `left=${left} ≤ right=${right} → there's still a range to search for a valid i, continue.`,
      },
    });

    // Line 8: i = (left + right) // 2
    const i = Math.floor((left + right) / 2);
    // Line 9: j = (m + n + 1) // 2 - i
    const j = half - i;

    snap({
      title: { vi: `i = (left+right)//2 = (${left}+${right})//2 = ${i}`, en: `i = (left+right)//2 = (${left}+${right})//2 = ${i}` },
      i,
      j: half - i,
      codeLines: [8],
      vars: [{ name: "i", value: i }],
      note: {
        vi: `Thử cắt A tại i=${i}: nửa trái của A lấy ${i} phần tử đầu, nửa phải lấy ${m - i} phần tử còn lại.`,
        en: `Try cutting A at i=${i}: A's left half takes the first ${i} elements, right half takes the remaining ${m - i}.`,
      },
    });

    snap({
      title: { vi: `j = (m+n+1)//2 - i = ${half} - ${i} = ${j}`, en: `j = (m+n+1)//2 - i = ${half} - ${i} = ${j}` },
      i,
      j,
      codeLines: [9],
      vars: [{ name: "j", value: j }, { name: "half = (m+n+1)//2", value: half }],
      note: {
        vi: `j buộc phải bằng ${j} để tổng số phần tử ở nửa trái (i+j) luôn = ⌈(m+n)/2⌉ = ${half}, bất kể i là bao nhiêu.`,
        en: `j is forced to be ${j} so the total left-half size (i+j) is always ⌈(m+n)/2⌉ = ${half}, regardless of i.`,
      },
    });

    if (j < 0 || j > n) {
      if (j < 0) { right = i - 1; } else { left = i + 1; }
      continue;
    }

    // Sentinels
    const Aleft = i === 0 ? -Infinity : A[i - 1];
    const Aright = i === m ? Infinity : A[i];
    const Bleft = j === 0 ? -Infinity : B[j - 1];
    const Bright = j === n ? Infinity : B[j];

    // Line 10: if i > 0 and A[i-1] > B[j]:
    const aLeftTooBig = Aleft > Bright;
    snap({
      title: { vi: `if i>0 and A[i-1] > B[j] → ${fmt(Aleft)} > ${fmt(Bright)} → ${aLeftTooBig}`, en: `if i>0 and A[i-1] > B[j] → ${fmt(Aleft)} > ${fmt(Bright)} → ${aLeftTooBig}` },
      i, j,
      highlight: { rowA: i > 0 ? [i - 1] : [], rowB: j < n ? [j] : [] },
      codeLines: [10],
      vars: [{ name: "A[i-1]", value: fmt(Aleft) }, { name: "B[j]", value: fmt(Bright) }],
      note: aLeftTooBig
        ? { vi: `A[i-1]=${fmt(Aleft)} > B[j]=${fmt(Bright)} → nửa trái của A đang LỚN HƠN nửa phải của B → i quá lớn, cần giảm i.`, en: `A[i-1]=${fmt(Aleft)} > B[j]=${fmt(Bright)} → A's left half is TOO BIG compared to B's right half → i is too large, need to decrease it.` }
        : { vi: `A[i-1]=${fmt(Aleft)} ≤ B[j]=${fmt(Bright)} → điều kiện này ổn, kiểm tiếp điều kiện kia.`, en: `A[i-1]=${fmt(Aleft)} ≤ B[j]=${fmt(Bright)} → this condition is fine, check the other one next.` },
    });

    if (aLeftTooBig) {
      // Line 11: right = i - 1
      const oldRight = right;
      right = i - 1;
      snap({
        title: { vi: `right = i - 1 = ${i} - 1 = ${right}`, en: `right = i - 1 = ${i} - 1 = ${right}` },
        i, j,
        codeLines: [11],
        vars: [{ name: "right", value: right }],
        note: {
          vi: `Thu hẹp phạm vi tìm i: right = ${oldRight} → ${right}. Lần sau i sẽ nhỏ hơn.`,
          en: `Shrink the search range for i: right = ${oldRight} → ${right}. Next i will be smaller.`,
        },
      });
      continue;
    }

    // Line 12: elif j > 0 and B[j-1] > A[i]:
    const bLeftTooBig = Bleft > Aright;
    snap({
      title: { vi: `elif j>0 and B[j-1] > A[i] → ${fmt(Bleft)} > ${fmt(Aright)} → ${bLeftTooBig}`, en: `elif j>0 and B[j-1] > A[i] → ${fmt(Bleft)} > ${fmt(Aright)} → ${bLeftTooBig}` },
      i, j,
      highlight: { rowA: i < m ? [i] : [], rowB: j > 0 ? [j - 1] : [] },
      codeLines: [12],
      vars: [{ name: "B[j-1]", value: fmt(Bleft) }, { name: "A[i]", value: fmt(Aright) }],
      note: bLeftTooBig
        ? { vi: `B[j-1]=${fmt(Bleft)} > A[i]=${fmt(Aright)} → nửa trái của B đang LỚN HƠN nửa phải của A → i quá nhỏ, cần tăng i.`, en: `B[j-1]=${fmt(Bleft)} > A[i]=${fmt(Aright)} → B's left half is TOO BIG compared to A's right half → i is too small, need to increase it.` }
        : { vi: `B[j-1]=${fmt(Bleft)} ≤ A[i]=${fmt(Aright)} → cả 2 điều kiện đều ổn → partition HỢP LỆ!`, en: `B[j-1]=${fmt(Bleft)} ≤ A[i]=${fmt(Aright)} → both conditions hold → partition is VALID!` },
    });

    if (bLeftTooBig) {
      // Line 13: left = i + 1
      const oldLeft = left;
      left = i + 1;
      snap({
        title: { vi: `left = i + 1 = ${i} + 1 = ${left}`, en: `left = i + 1 = ${i} + 1 = ${left}` },
        i, j,
        codeLines: [13],
        vars: [{ name: "left", value: left }],
        note: {
          vi: `Thu hẹp phạm vi tìm i: left = ${oldLeft} → ${left}. Lần sau i sẽ lớn hơn.`,
          en: `Shrink the search range for i: left = ${oldLeft} → ${left}. Next i will be larger.`,
        },
      });
      continue;
    }

    // Valid partition found.
    const maxLeft = Math.max(Aleft, Bleft);
    const minRight = Math.min(Aright, Bright);
    const totalLen = m + n;
    const isOdd = totalLen % 2 === 1;
    const median = isOdd ? maxLeft : (maxLeft + minRight) / 2;

    // Line 14: else:
    snap({
      title: { vi: `else: (partition hợp lệ, tính maxLeft)`, en: `else: (valid partition, compute maxLeft)` },
      i, j,
      highlight: { rowA: i > 0 ? [i - 1] : [], rowB: j > 0 ? [j - 1] : [] },
      codeLines: [14],
      vars: [{ name: "i", value: i }, { name: "j", value: j }],
      note: {
        vi: `Cả 2 điều kiện đều không đúng → partition (i=${i}, j=${j}) hợp lệ. Chuyển sang tính median.`,
        en: `Neither condition holds → partition (i=${i}, j=${j}) is valid. Move on to computing the median.`,
      },
    });

    // Line 15: left_part = max(A[i-1] if i>0 else -inf, B[j-1] if j>0 else -inf)
    snap({
      title: { vi: `left_part = max(A[i-1], B[j-1]) = max(${fmt(Aleft)}, ${fmt(Bleft)}) = ${maxLeft}`, en: `left_part = max(A[i-1], B[j-1]) = max(${fmt(Aleft)}, ${fmt(Bleft)}) = ${maxLeft}` },
      i, j,
      highlight: { rowA: i > 0 ? [i - 1] : [], rowB: j > 0 ? [j - 1] : [] },
      codeLines: [15],
      vars: [{ name: "left_part", value: maxLeft }],
      note: {
        vi: `left_part = phần tử LỚN NHẤT ở toàn bộ nửa trái = max(A[i-1], B[j-1]) = ${maxLeft}.`,
        en: `left_part = the LARGEST element across the whole left half = max(A[i-1], B[j-1]) = ${maxLeft}.`,
      },
    });

    // Line 16: if (m + n) % 2 == 1:
    snap({
      title: { vi: `if (m+n)%2==1 → ${isOdd}`, en: `if (m+n)%2==1 → ${isOdd}` },
      i, j,
      codeLines: [16],
      vars: [{ name: "m+n", value: totalLen }, { name: "(m+n)%2", value: totalLen % 2 }],
      note: isOdd
        ? { vi: `Tổng số phần tử LẺ (${totalLen}) → phần tử giữa chính là left_part, không cần xét nửa phải.`, en: `Total count is ODD (${totalLen}) → the middle element is exactly left_part, no need to look at the right half.` }
        : { vi: `Tổng số phần tử CHẴN (${totalLen}) → median là trung bình của 2 phần tử giữa, cần thêm right_part.`, en: `Total count is EVEN (${totalLen}) → the median is the average of the two middle elements, also need right_part.` },
    });

    if (isOdd) {
      // Line 17: return left_part
      const fs = {
        title: { vi: `return left_part → ${median}`, en: `return left_part → ${median}` },
        arr: [],
        partitionView: {
          rowA: A, rowB: B, labelA, labelB, cutA: i, cutB: j,
          highlight: { rowA: i > 0 ? [i - 1] : [], rowB: j > 0 ? [j - 1] : [] },
          status: [{ label: "answer", value: median }],
        },
        highlight: [], mark: [],
        final: true,
        codeLines: [17],
        vars: [{ name: "answer", value: median }],
        note: { vi: `Median = ${median}.`, en: `Median = ${median}.` },
      };
      steps.push(fs);
      result = median;
      break;
    }

    // Line 18: right_part = min(A[i] if i<m else inf, B[j] if j<n else inf)
    snap({
      title: { vi: `right_part = min(A[i], B[j]) = min(${fmt(Aright)}, ${fmt(Bright)}) = ${minRight}`, en: `right_part = min(A[i], B[j]) = min(${fmt(Aright)}, ${fmt(Bright)}) = ${minRight}` },
      i, j,
      highlight: { rowA: i < m ? [i] : [], rowB: j < n ? [j] : [] },
      codeLines: [18],
      vars: [{ name: "right_part", value: minRight }],
      note: {
        vi: `right_part = phần tử NHỎ NHẤT ở toàn bộ nửa phải = min(A[i], B[j]) = ${minRight}.`,
        en: `right_part = the SMALLEST element across the whole right half = min(A[i], B[j]) = ${minRight}.`,
      },
    });

    // Line 19: return (left_part + right_part) / 2
    const fs = {
      title: { vi: `return (left_part+right_part)/2 → (${maxLeft}+${minRight})/2 = ${median}`, en: `return (left_part+right_part)/2 → (${maxLeft}+${minRight})/2 = ${median}` },
      arr: [],
      partitionView: {
        rowA: A, rowB: B, labelA, labelB, cutA: i, cutB: j,
        highlight: { rowA: [i > 0 ? i - 1 : -1, i < m ? i : -1].filter((x) => x >= 0), rowB: [j > 0 ? j - 1 : -1, j < n ? j : -1].filter((x) => x >= 0) },
        status: [{ label: "answer", value: median }],
      },
      highlight: [], mark: [],
      final: true,
      codeLines: [19],
      vars: [{ name: "left_part", value: maxLeft }, { name: "right_part", value: minRight }, { name: "answer", value: median }],
      note: { vi: `Median = (${maxLeft} + ${minRight}) / 2 = ${median}.`, en: `Median = (${maxLeft} + ${minRight}) / 2 = ${median}.` },
    };
    steps.push(fs);
    result = median;
    break;
  }

  return { original: A0, nums2: B0, answer: result, steps };
}

function fmt(v) {
  if (v === Infinity) return "+\u221E";
  if (v === -Infinity) return "-\u221E";
  return String(v);
}

/**
 * LeetCode 410: Split Array Largest Sum.
 *
 * Given an integer array nums and an integer k, split nums into k
 * non-empty contiguous subarrays to MINIMIZE the LARGEST subarray sum.
 *
 * Binary search on the ANSWER: the answer (the minimized largest sum) lies
 * somewhere in [max(nums), sum(nums)]. For a candidate `mid`, greedily count
 * how many groups are needed if no group's sum may exceed `mid`:
 *   - if that count <= k, mid is FEASIBLE (maybe can go smaller) → right = mid
 *   - if that count > k, mid is TOO SMALL (needs more groups than allowed) → left = mid + 1
 * The smallest feasible mid is the answer.
 */
function buildSteps410(nums, params) {
  const k = Number(params && params.k !== undefined ? params.k : 2);
  const steps = [];
  const n = nums.length;

  function groupsFor(mid) {
    // Greedily pack nums into the fewest groups possible where each group's
    // sum never exceeds `mid`. Returns [groupId per index], groupCount.
    const groupOf = new Array(n).fill(0);
    let groups = 1;
    let curSum = 0;
    for (let i = 0; i < n; i++) {
      if (curSum + nums[i] > mid) {
        groups++;
        curSum = 0;
      }
      groupOf[i] = groups - 1;
      curSum += nums[i];
    }
    return { groupOf, groups };
  }

  function subLabels(l, r, m) {
    return nums.map((_, i) => {
      const tags = [];
      if (i === l) tags.push("L");
      if (m !== undefined && i === m) tags.push("M");
      if (i === r) tags.push("R");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }

  function snap(opts) {
    const groupInfo = opts.mid !== undefined ? groupsFor(opts.mid) : null;
    steps.push({
      title: opts.title,
      arr: [...nums],
      sub: opts.sub || nums.map((_, i) => `[${i}]`),
      highlight: opts.highlight || [],
      mark: groupInfo ? groupInfo.groupOf.filter((_, i) => groupInfo.groupOf[i] % 2 === 1) : [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  const sum = nums.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...nums);

  // Line 3: left, right = max(nums), sum(nums)
  let left = maxVal;
  let right = sum;
  snap({
    title: { vi: `left, right = max(nums), sum(nums) → left=${left}, right=${right}`, en: `left, right = max(nums), sum(nums) → left=${left}, right=${right}` },
    sub: subLabels(undefined, undefined),
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(",")}]` },
      { name: "k", value: k },
      { name: "left (max element)", value: left },
      { name: "right (total sum)", value: right },
    ],
    note: {
      vi: `nums=[${nums.join(",")}], k=${k}. Đáp án (largest sum nhỏ nhất có thể) chắc chắn nằm trong [max(nums), sum(nums)] = [${left}, ${right}]: không thể nhỏ hơn phần tử lớn nhất (1 nhóm phải chứa nó), và không cần lớn hơn tổng cả mảng (dùng đúng 1 nhóm).`,
      en: `nums=[${nums.join(",")}], k=${k}. The answer (the minimized largest sum) is guaranteed to lie in [max(nums), sum(nums)] = [${left}, ${right}]: it can't be smaller than the largest element (some group must contain it), and never needs to exceed the total sum (using just 1 group).`,
    },
  });

  let answer = right;
  let iterGuard = 0;

  while (left < right && iterGuard < 100) {
    iterGuard++;
    // Line 4: while left < right:
    snap({
      title: { vi: `while left < right → ${left} < ${right} → True`, en: `while left < right → ${left} < ${right} → True` },
      sub: subLabels(undefined, undefined),
      codeLines: [4],
      vars: [{ name: "left", value: left }, { name: "right", value: right }],
      note: {
        vi: `left=${left} < right=${right} → còn khoảng để tìm đáp án nhỏ nhất, tiếp tục.`,
        en: `left=${left} < right=${right} → there's still a range to search for the minimum answer, continue.`,
      },
    });

    // Line 5: mid = (left + right) // 2
    const mid = Math.floor((left + right) / 2);
    snap({
      title: { vi: `mid = (left+right)//2 = (${left}+${right})//2 = ${mid}`, en: `mid = (left+right)//2 = (${left}+${right})//2 = ${mid}` },
      sub: subLabels(undefined, undefined),
      codeLines: [5],
      vars: [{ name: "mid", value: mid }],
      note: {
        vi: `Thử mid=${mid}: nếu giới hạn mỗi nhóm ≤ ${mid} thì cần bao nhiêu nhóm?`,
        en: `Try mid=${mid}: if each group is capped at ≤ ${mid}, how many groups are needed?`,
      },
    });

    // Line 6: groups = count_groups(nums, mid)
    const { groupOf, groups } = groupsFor(mid);
    const groupsStr = groupOf.map((g, i) => `${nums[i]}→G${g}`).join(", ");
    snap({
      title: { vi: `groups = count_groups(nums, mid) → ${groups} nhóm`, en: `groups = count_groups(nums, mid) → ${groups} groups` },
      sub: nums.map((v, i) => `[${i}] G${groupOf[i]}`),
      mid,
      codeLines: [6],
      vars: [{ name: "groups needed", value: groups }, { name: "grouping", value: groupsStr }],
      note: {
        vi: `Đi từ trái sang phải, cộng dồn vào nhóm hiện tại; khi cộng thêm sẽ VƯỢT mid=${mid} thì mở nhóm mới. Kết quả cần ${groups} nhóm (màu xen kẽ = nhóm khác nhau).`,
        en: `Scan left to right, accumulate into the current group; when adding the next element would EXCEED mid=${mid}, start a new group. Needs ${groups} groups (alternating colors = different groups).`,
      },
    });

    const feasible = groups <= k;
    // Line 7: if groups <= k:
    snap({
      title: { vi: `if groups <= k → ${groups} <= ${k} → ${feasible}`, en: `if groups <= k → ${groups} <= ${k} → ${feasible}` },
      sub: nums.map((v, i) => `[${i}] G${groupOf[i]}`),
      mid,
      codeLines: [7],
      vars: [{ name: "groups", value: groups }, { name: "k", value: k }],
      note: feasible
        ? { vi: `${groups} ≤ k=${k} → mid=${mid} KHẢ THI (đủ ít nhóm), có thể thử giá trị NHỎ HƠN → right=mid.`, en: `${groups} ≤ k=${k} → mid=${mid} is FEASIBLE (few enough groups), maybe can go SMALLER → right=mid.` }
        : { vi: `${groups} > k=${k} → mid=${mid} QUÁ NHỎ (cần nhiều nhóm hơn cho phép) → left=mid+1.`, en: `${groups} > k=${k} → mid=${mid} is TOO SMALL (needs more groups than allowed) → left=mid+1.` },
    });

    if (feasible) {
      // Line 8: right = mid
      right = mid;
      snap({
        title: { vi: `right = mid → right = ${right}`, en: `right = mid → right = ${right}` },
        sub: subLabels(undefined, undefined),
        codeLines: [8],
        vars: [{ name: "right", value: right }],
        note: {
          vi: `right = ${right}. Thu hẹp phạm vi tìm kiếm về phía nhỏ hơn.`,
          en: `right = ${right}. Shrink the search range toward smaller values.`,
        },
      });
    } else {
      // Line 10: left = mid + 1
      left = mid + 1;
      snap({
        title: { vi: `left = mid + 1 → left = ${left}`, en: `left = mid + 1 → left = ${left}` },
        sub: subLabels(undefined, undefined),
        codeLines: [10],
        vars: [{ name: "left", value: left }],
        note: {
          vi: `left = ${left}. Thu hẹp phạm vi tìm kiếm về phía lớn hơn.`,
          en: `left = ${left}. Shrink the search range toward larger values.`,
        },
      });
    }
  }

  answer = left;
  const { groupOf: finalGroupOf } = groupsFor(answer);
  const fs = {
    title: { vi: `return left → ${answer}`, en: `return left → ${answer}` },
    arr: [...nums],
    sub: nums.map((v, i) => `[${i}] G${finalGroupOf[i]}`),
    highlight: [],
    mark: finalGroupOf.filter((_, i) => finalGroupOf[i] % 2 === 1),
    final: true,
    codeLines: [11],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `left == right == ${answer} → đây là giá trị NHỎ NHẤT sao cho nums chia được thành ≤ k=${k} nhóm liên tiếp mà tổng mỗi nhóm ≤ ${answer}.`,
      en: `left == right == ${answer} → this is the SMALLEST value such that nums can be split into ≤ k=${k} contiguous groups each summing to ≤ ${answer}.`,
    },
  };
  steps.push(fs);

  return { original: nums, answer, steps };
}

/**
 * LeetCode 1044: Longest Duplicate Substring — binary search on length +
 * Rabin-Karp rolling hash. search(L) checks if some substring of length L
 * appears twice; the answer length is monotonic so we binary search it.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def longestDupSubstring(self, s):
 *  3          def search(L):  # returns start index of a dup of length L, or -1
 *  4              compute rolling hash of first L chars; seen = {hash}
 *  5              for i in 1..n-L: roll hash; if in seen: return i; seen.add
 *  6              return -1
 *  7          lo, hi = 1, n - 1; start, best = -1, 0
 *  8          while lo <= hi:
 *  9              mid = (lo + hi) // 2
 * 10              idx = search(mid)
 * 11              if idx != -1: start, best = idx, mid; lo = mid + 1
 * 12              else: hi = mid - 1
 * 13          return s[start:start+best]
 */
function buildSteps1044(input) {
  const s = String(input);
  const n = s.length;
  const steps = [];
  const chars = s.split("");

  if (n < 2) {
    steps.push({
      title: { vi: 'Chuỗi quá ngắn → ""', en: 'String too short → ""' },
      arr: chars, sub: chars.map((_, i) => `[${i}]`), highlight: [], mark: [],
      final: true, codeLines: [2], vars: [{ name: "answer", value: '""' }],
      note: { vi: "Cần ít nhất 2 ký tự để có lặp.", en: "Need at least 2 characters to have a duplicate." },
    });
    return { original: s, answer: "", steps };
  }

  // search(L): return start index of a duplicated substring of length L, or -1
  function search(L) {
    if (L === 0) return 0;
    const seen = new Map(); // hash -> list of start indices
    const base = 26n;
    const mod = 1152921504606846883n; // large prime
    let cur = 0n;
    const nums = chars.map((c) => BigInt(c.charCodeAt(0) - 97));
    for (let i = 0; i < L; i++) cur = (cur * base + nums[i]) % mod;
    let baseL = 1n;
    for (let i = 0; i < L; i++) baseL = (baseL * base) % mod;
    const put = (h, idx) => { if (!seen.has(h)) seen.set(h, []); seen.get(h).push(idx); };
    put(cur, 0);
    for (let i = 1; i + L <= n; i++) {
      cur = (cur * base - nums[i - 1] * baseL % mod + mod * base) % mod;
      cur = (cur + nums[i + L - 1]) % mod;
      if (seen.has(cur)) {
        // verify (avoid rare collision)
        for (const j of seen.get(cur)) {
          if (s.slice(j, j + L) === s.slice(i, i + L)) return i;
        }
      }
      put(cur, i);
    }
    return -1;
  }

  steps.push({
    title: { vi: "Binary search trên ĐỘ DÀI của chuỗi lặp", en: "Binary search on the LENGTH of the duplicate" },
    arr: chars,
    sub: chars.map((_, i) => `[${i}]`),
    highlight: [], mark: [],
    codeLines: [7],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "n", value: n },
      { name: "lo", value: 1 },
      { name: "hi", value: n - 1 },
    ],
    note: {
      vi:
        `Nếu tồn tại chuỗi lặp độ dài L thì cũng tồn tại độ dài L-1 → tính đơn điệu → BINARY SEARCH trên L.\n` +
        `search(L) dùng rolling hash (Rabin-Karp) kiểm tra có 2 vị trí trùng chuỗi độ dài L không, trong O(n).`,
      en:
        `If a duplicate of length L exists, one of length L-1 exists too → monotonic → BINARY SEARCH on L.\n` +
        `search(L) uses a rolling hash (Rabin-Karp) to check if two positions share a length-L substring, in O(n).`,
    },
  });

  let lo = 1, hi = n - 1;
  let start = -1, best = 0;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const idx = search(mid);
    const dupHit = idx !== -1;

    const hlCells = dupHit
      ? Array.from({ length: mid }, (_, x) => idx + x)
      : [];

    if (dupHit) { start = idx; best = mid; }

    steps.push({
      title: { vi: `mid=${mid}: search(${mid}) = ${dupHit ? `tìm thấy tại ${idx}` : "-1"}`, en: `mid=${mid}: search(${mid}) = ${dupHit ? `found at ${idx}` : "-1"}` },
      arr: chars,
      sub: chars.map((_, i) => `[${i}]`),
      highlight: hlCells,
      mark: dupHit ? Array.from({ length: best }, (_, x) => start + x) : [],
      codeLines: dupHit ? [8, 9, 10, 11] : [8, 9, 10, 12],
      vars: [
        { name: "lo", value: lo },
        { name: "hi", value: hi },
        { name: "mid", value: mid },
        { name: "search(mid)", value: dupHit ? idx : -1 },
        { name: "best so far", value: best > 0 ? `"${s.slice(start, start + best)}" (len ${best})` : "none" },
      ],
      note: {
        vi: dupHit
          ? `Có chuỗi lặp độ dài ${mid} tại index ${idx}: "${s.slice(idx, idx + mid)}" (tô vàng). Lưu best và thử DÀI HƠN → lo = ${mid + 1}.`
          : `Không có chuỗi lặp độ dài ${mid} → thử NGẮN HƠN → hi = ${mid - 1}.`,
        en: dupHit
          ? `A length-${mid} duplicate exists at index ${idx}: "${s.slice(idx, idx + mid)}" (highlighted). Save best and try LONGER → lo = ${mid + 1}.`
          : `No length-${mid} duplicate → try SHORTER → hi = ${mid - 1}.`,
      },
    });

    if (dupHit) lo = mid + 1;
    else hi = mid - 1;
  }

  const answer = start !== -1 ? s.slice(start, start + best) : "";
  steps.push({
    title: { vi: `return "${answer}"`, en: `return "${answer}"` },
    arr: chars,
    sub: chars.map((_, i) => `[${i}]`),
    highlight: [],
    mark: answer ? Array.from({ length: best }, (_, x) => start + x) : [],
    final: true,
    codeLines: [13],
    vars: [{ name: "answer", value: `"${answer}"` }, { name: "length", value: best }],
    note: {
      vi: answer ? `Chuỗi con lặp DÀI NHẤT là "${answer}" (độ dài ${best}).` : `Không có chuỗi con nào lặp → "".`,
      en: answer ? `The LONGEST duplicated substring is "${answer}" (length ${best}).` : `No duplicated substring → "".`,
    },
  });

  return { original: s, answer, steps };
}

module.exports = {
  1044: {
    id: 1044,
    difficulty: "hard",
    slug: "longest-duplicate-substring",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Longest Duplicate Substring", en: "Longest Duplicate Substring" },
    titleVi: { vi: "Chuỗi con lặp dài nhất (Binary Search + Rolling Hash)", en: "Longest duplicated substring (Binary Search + Rolling Hash)" },
    statement: {
      vi:
        "Cho chuỗi s. Tìm chuỗi con DÀI NHẤT xuất hiện ít nhất 2 lần (có thể chồng lấn). " +
        "Nếu không có, trả về \"\". Nhập chuỗi s.",
      en:
        "Given a string s, find the LONGEST substring that appears at least twice (occurrences may overlap). " +
        "If none, return \"\". Enter the string s.",
    },
    defaultInput: "banana",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [],
    approach: [
      { vi: "Độ dài chuỗi lặp có tính ĐƠN ĐIỆU → binary search trên độ dài L.", en: "The duplicate length is MONOTONIC → binary search on the length L." },
      { vi: "search(L): dùng rolling hash (Rabin-Karp) kiểm tra có 2 chuỗi con độ dài L trùng nhau không, O(n).", en: "search(L): use a rolling hash (Rabin-Karp) to test whether two length-L substrings match, in O(n)." },
      { vi: "Nếu search(mid) tìm thấy → lưu kết quả, thử dài hơn (lo = mid+1).", en: "If search(mid) finds one → save it, try longer (lo = mid+1)." },
      { vi: "Nếu không → thử ngắn hơn (hi = mid-1). Kết quả là chuỗi dài nhất tìm được.", en: "Otherwise → try shorter (hi = mid-1). The answer is the longest found." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Binary search O(log n) lần × mỗi lần rolling hash O(n).",
        en: "Binary search O(log n) iterations × O(n) rolling hash each.",
      },
    },
    code: [
      "class Solution:",
      "    def longestDupSubstring(self, s):",
      "        def search(L):",
      "            # rolling hash of window length L; seen = set of hashes",
      "            # for each window: if hash seen -> return start, else add",
      "            return -1",
      "        lo, hi = 1, n - 1",
      "        start, best = -1, 0",
      "        while lo <= hi:",
      "            mid = (lo + hi) // 2",
      "            idx = search(mid)",
      "            if idx != -1: start, best = idx, mid; lo = mid + 1",
      "            else: hi = mid - 1",
      "        return s[start:start+best]",
    ],
    builder: buildSteps1044,
  },
  410: {
    id: 410,
    difficulty: "hard",
    slug: "split-array-largest-sum",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Split Array Largest Sum", en: "Split Array Largest Sum" },
    titleVi: { vi: "Chia mảng để tổng lớn nhất nhỏ nhất", en: "Split array to minimize the largest sum" },
    statement: {
      vi:
        "Cho mảng nums và số nguyên k. Chia nums thành k mảng con LIÊN TIẾP, không rỗng, sao cho TỔNG LỚN NHẤT " +
        "trong các mảng con là NHỎ NHẤT có thể. Trả về giá trị tổng lớn nhất đó.",
      en:
        "Given an array nums and an integer k, split nums into k non-empty CONTIGUOUS subarrays such that the " +
        "LARGEST sum among the subarrays is MINIMIZED. Return that minimized largest sum.",
    },
    defaultInput: [7, 2, 5, 10, 8],
    inputKind: "positive",
    inputLabel: { vi: "nums (dương)", en: "nums (positive)" },
    extraParams: [{ key: "k", label: { vi: "k (số nhóm)", en: "k (number of groups)" }, default: 2 }],
    approach: [
      { vi: "Binary search trên ĐÁP ÁN: giá trị cần tìm nằm trong [max(nums), sum(nums)].", en: "Binary search on the ANSWER: the value we want lies in [max(nums), sum(nums)]." },
      { vi: "Với mid, đếm SỐ NHÓM cần dùng nếu mỗi nhóm bị giới hạn tổng ≤ mid (đi tham lam từ trái sang phải).", en: "For a given mid, count the NUMBER OF GROUPS needed if each group's sum is capped at ≤ mid (greedy left to right)." },
      { vi: "Nếu số nhóm ≤ k → mid khả thi, thử nhỏ hơn (right=mid). Nếu > k → mid quá nhỏ (left=mid+1).", en: "If the group count ≤ k → mid is feasible, try smaller (right=mid). If > k → mid is too small (left=mid+1)." },
    ],
    complexity: {
      time: "O(n·log(sum(nums)))",
      space: "O(1)",
      note: {
        vi: "Binary search O(log(sum)) lần, mỗi lần đếm nhóm tốn O(n).",
        en: "O(log(sum)) binary search iterations, each counting groups in O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def splitArray(self, nums, k):",
      "        left, right = max(nums), sum(nums)",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            groups = self.count_groups(nums, mid)",
      "            if groups <= k:",
      "                right = mid",
      "            else:",
      "                left = mid + 1",
      "        return left",
      "    def count_groups(self, nums, mid):",
      "        groups, cur_sum = 1, 0",
      "        for num in nums:",
      "            if cur_sum + num > mid:",
      "                groups += 1",
      "                cur_sum = 0",
      "            cur_sum += num",
      "        return groups",
    ],
    builder: buildSteps410,
  },
  __meta: {
    order: [410, 4, 33, 34, 911, 1044],
    label: { vi: "Thứ tự học Binary Search", en: "Binary Search learning order" },
  },
  4: {
    id: 4,
    difficulty: "hard",
    slug: "median-of-two-sorted-arrays",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Median of Two Sorted Arrays", en: "Median of Two Sorted Arrays" },
    titleVi: { vi: "Trung vị của 2 mảng đã sắp xếp", en: "Median of two sorted arrays" },
    statement: {
      vi:
        "Cho 2 mảng đã sắp xếp tăng dần nums1 (kích thước m) và nums2 (kích thước n). " +
        "Trả về trung vị (median) của mảng hợp nhất, với độ phức tạp O(log(m+n)).",
      en:
        "Given two sorted arrays nums1 (size m) and nums2 (size n), return the median of the two " +
        "combined sorted arrays, with time complexity O(log(m+n)).",
    },
    defaultInput: [1, 3],
    inputKind: "integer",
    inputLabel: { vi: "nums1 (đã sắp xếp)", en: "nums1 (sorted)" },
    extraParams: [{ key: "nums2", label: { vi: "nums2 (đã sắp xếp)", en: "nums2 (sorted)" }, type: "string", default: "2" }],
    approach: [
      { vi: "Binary search trên mảng NGẮN HƠN (A). Với mỗi i (số phần tử A ở nửa trái), j bị buộc = ⌈(m+n)/2⌉ - i để nửa trái luôn đủ ⌈(m+n)/2⌉ phần tử.", en: "Binary search on the SHORTER array (A). For each i (how many A elements go left), j is forced = ⌈(m+n)/2⌉ - i so the left half always has exactly ⌈(m+n)/2⌉ elements." },
      { vi: "Partition hợp lệ khi A[i-1] ≤ B[j] và B[j-1] ≤ A[i] (dùng ±∞ ở biên mảng).", en: "The partition is valid when A[i-1] ≤ B[j] and B[j-1] ≤ A[i] (using ±∞ at array edges)." },
      { vi: "Tổng lẻ → median = max(A[i-1], B[j-1]). Tổng chẵn → trung bình của maxLeft và minRight.", en: "Odd total → median = max(A[i-1], B[j-1]). Even total → average of maxLeft and minRight." },
    ],
    complexity: {
      time: "O(log(min(m,n)))",
      space: "O(1)",
      note: {
        vi: "Binary search chỉ chạy trên mảng ngắn hơn.",
        en: "Binary search only runs on the shorter array.",
      },
    },
    code: [
      "class Solution:",
      "    def findMedianSortedArrays(self, nums1, nums2):",
      "        m, n = len(nums1), len(nums2)",
      "        if m > n:",
      "            nums1, nums2, m, n = nums2, nums1, n, m",
      "        left, right = 0, m",
      "        while left <= right:",
      "            i = (left + right) // 2",
      "            j = (m + n + 1) // 2 - i",
      "            if i > 0 and nums1[i-1] > (nums2[j] if j < n else float('inf')):",
      "                right = i - 1",
      "            elif j > 0 and nums2[j-1] > (nums1[i] if i < m else float('inf')):",
      "                left = i + 1",
      "            else:",
      "                left_part = max(nums1[i-1] if i > 0 else float('-inf'), nums2[j-1] if j > 0 else float('-inf'))",
      "                if (m + n) % 2 == 1:",
      "                    return left_part",
      "                right_part = min(nums1[i] if i < m else float('inf'), nums2[j] if j < n else float('inf'))",
      "                return (left_part + right_part) / 2",
    ],
    builder: buildSteps4,
  },
  911: {
    id: 911,
    difficulty: "medium",
    slug: "online-election",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Online Election", en: "Online Election" },
    titleVi: { vi: "Bầu cử trực tuyến", en: "Track election leaders over time" },
    statement: {
      vi: "Cho persons[i] là người nhận phiếu tại times[i]. Với mỗi q(t), trả về người đang dẫn đầu tại thời điểm t; nếu hòa, người nhận phiếu gần nhất thắng.",
      en: "persons[i] receives a vote at times[i]. For each q(t), return the leader at time t; ties are won by the most recently voted person.",
    },
    defaultInput: [0, 1, 1, 0, 0, 1, 0],
    inputKind: "nonneg",
    inputLabel: { vi: "persons (ứng viên nhận từng phiếu)", en: "persons (candidate receiving each vote)" },
    extraParams: [
      {
        key: "times",
        type: "string",
        label: { vi: "times (tăng nghiêm ngặt, phẩy ngăn)", en: "times (strictly increasing, comma separated)" },
        default: "0,5,10,15,20,25,30",
      },
      {
        key: "queries",
        type: "string",
        label: { vi: "queries q(t) (phẩy ngăn)", en: "q(t) queries (comma separated)" },
        default: "3,12,25,15,24,8",
      },
    ],
    approach: [
      {
        vi: "Constructor: đếm phiếu theo thứ tự thời gian và lưu leader sau mỗi phiếu. Dùng >= để người nhận phiếu mới nhất thắng khi hòa.",
        en: "Constructor: count votes chronologically and store the leader after every vote. Use >= so the latest vote wins ties.",
      },
      {
        vi: "q(t): binary search index đầu tiên có times[index] > t, rồi trả leaders[index - 1].",
        en: "q(t): binary-search the first index where times[index] > t, then return leaders[index - 1].",
      },
    ],
    complexity: {
      time: "Constructor O(n), q(t) O(log n)",
      space: "O(n)",
      note: {
        vi: "Tiền xử lý một lần O(n). Mảng leaders cho phép mỗi truy vấn chỉ binary search trên times.",
        en: "Preprocess once in O(n). The leaders array lets every query use only a binary search over times.",
      },
    },
    code: [
      "class TopVotedCandidate:",
      "    def __init__(self, persons, times):",
      "        self.times = times",
      "        self.leaders = []",
      "        votes = {}",
      "        leader = -1",
      "        for person in persons:",
      "            votes[person] = votes.get(person, 0) + 1",
      "            if votes[person] >= votes.get(leader, 0):",
      "                leader = person",
      "            self.leaders.append(leader)",
      "",
      "    def q(self, t: int) -> int:",
      "        left, right = 0, len(self.times)",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if self.times[mid] <= t:",
      "                left = mid + 1",
      "            else:",
      "                right = mid",
      "        return self.leaders[left - 1]",
    ],
    builder: buildSteps911,
  },
};

/**
 * LeetCode 34: Find First and Last Position of Element in Sorted Array.
 * Two half-open binary searches [left, right):
 *  - lowerBound(target): first index where nums[i] >= target.
 *  - lowerBound(target + 1): first index where nums[i] >= target + 1,
 *    i.e. first index where nums[i] > target. Subtract 1 to get the last
 *    occurrence of target.
 * If lowerBound(target) is out of range or doesn't actually equal target,
 * target isn't present → return [-1, -1].
 */
function buildSteps34(nums, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps34Alt(nums, params);
  return buildSteps34Main(nums, params);
}

function buildSteps34Main(nums, params) {
  const target = Number(params && params.target !== undefined ? params.target : nums[0]);
  const n = nums.length;
  const steps = [];

  function labels(l, r, m) {
    return nums.map((_, i) => {
      const tags = [];
      if (i === l) tags.push("L");
      if (m !== undefined && i === m) tags.push("M");
      if (i === r) tags.push("R");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }
  function activeRange(l, r) {
    return Array.from({ length: Math.max(0, r - l) }, (_, k) => l + k);
  }

  // lowerBound(x): first index where nums[i] >= x. Emits one step per line,
  // codeBlock 1 = lowerBound helper, tagged with which call site (first/second).
  function lowerBound(x, callLabel) {
    let left = 0;
    let right = n;
    steps.push({
      title: { vi: `lowerBound(${x}): left, right = 0, len(nums)`, en: `lowerBound(${x}): left, right = 0, len(nums)` },
      arr: [...nums],
      sub: labels(left, right),
      highlight: activeRange(left, right),
      mark: [],
      codeLines: [4],
      vars: [{ name: "call", value: callLabel }, { name: "x", value: x }, { name: "left (L)", value: left }, { name: "right (R)", value: right }],
      note: {
        vi: `${callLabel}: tìm chỉ số đầu tiên có nums[i] ≥ ${x}. Vùng tìm kiếm ban đầu là toàn bộ mảng.`,
        en: `${callLabel}: find the first index where nums[i] ≥ ${x}. The initial search range is the whole array.`,
      },
    });

    while (left < right) {
      steps.push({
        title: { vi: `while L=${left} < R=${right} → True`, en: `while L=${left} < R=${right} → True` },
        arr: [...nums],
        sub: labels(left, right),
        highlight: activeRange(left, right),
        mark: [],
        codeLines: [5],
        vars: [{ name: "left (L)", value: left }, { name: "right (R)", value: right }],
        note: {
          vi: `L=${left} < R=${right} → còn vùng để thu hẹp.`,
          en: `L=${left} < R=${right} → there's still a range to narrow.`,
        },
      });

      const mid = Math.floor((left + right) / 2);
      steps.push({
        title: { vi: `M = (L+R)//2 = ${mid}`, en: `M = (L+R)//2 = ${mid}` },
        arr: [...nums],
        sub: labels(left, right, mid),
        highlight: activeRange(left, right),
        mark: [mid],
        codeLines: [6],
        vars: [{ name: "mid (M)", value: mid }, { name: "nums[M]", value: nums[mid] }],
        note: { vi: `Điểm giữa vùng [${left}, ${right}) là M=${mid}. nums[${mid}] = ${nums[mid]}.`, en: `The midpoint of [${left}, ${right}) is M=${mid}. nums[${mid}] = ${nums[mid]}.` },
      });

      const goRight = nums[mid] < x;
      steps.push({
        title: { vi: `nums[M]=${nums[mid]} < x=${x} → ${goRight}`, en: `nums[M]=${nums[mid]} < x=${x} → ${goRight}` },
        arr: [...nums],
        sub: labels(left, right, mid),
        highlight: activeRange(left, right),
        mark: [mid],
        codeLines: [7],
        vars: [{ name: "nums[M] < x?", value: goRight }],
        note: goRight
          ? { vi: `${nums[mid]} < ${x} → M quá nhỏ, đáp án nằm bên PHẢI của M → bỏ nửa trái.`, en: `${nums[mid]} < ${x} → M is too small, the answer is to the RIGHT of M → discard the left half.` }
          : { vi: `${nums[mid]} ≥ ${x} → M có thể là đáp án → giữ M, bỏ nửa phải.`, en: `${nums[mid]} ≥ ${x} → M could be the answer → keep M, discard the right half.` },
      });

      if (goRight) {
        const oldLeft = left;
        left = mid + 1;
        steps.push({
          title: { vi: `L = M + 1 = ${left}`, en: `L = M + 1 = ${left}` },
          arr: [...nums],
          sub: labels(left, right),
          highlight: activeRange(left, right),
          mark: [],
          codeLines: [8],
          vars: [{ name: "left before", value: oldLeft }, { name: "left after (L)", value: left }],
          note: { vi: `Vùng tìm kiếm co lại thành [${left}, ${right}).`, en: `The search range shrinks to [${left}, ${right}).` },
        });
      } else {
        const oldRight = right;
        right = mid;
        steps.push({
          title: { vi: `R = M = ${right}`, en: `R = M = ${right}` },
          arr: [...nums],
          sub: labels(left, right),
          highlight: activeRange(left, right),
          mark: [],
          codeLines: [10],
          vars: [{ name: "right before", value: oldRight }, { name: "right after (R)", value: right }],
          note: { vi: `Vùng tìm kiếm co lại thành [${left}, ${right}) — M vẫn có thể là đáp án nên không bị loại.`, en: `The search range shrinks to [${left}, ${right}) — M might still be the answer, so it's kept.` },
        });
      }
    }

    steps.push({
      title: { vi: `while L=${left} < R=${right} → False`, en: `while L=${left} < R=${right} → False` },
      arr: [...nums],
      sub: labels(left, right),
      highlight: [],
      mark: [left].filter((i) => i >= 0 && i < n),
      codeLines: [5],
      vars: [{ name: "left (L)", value: left }, { name: "right (R)", value: right }],
      note: { vi: `L và R gặp nhau tại ${left} → return ${left}.`, en: `L and R meet at ${left} → return ${left}.` },
    });
    steps.push({
      title: { vi: `lowerBound(${x}) return left = ${left}`, en: `lowerBound(${x}) return left = ${left}` },
      arr: [...nums],
      sub: labels(left, right),
      highlight: [],
      mark: [left].filter((i) => i >= 0 && i < n),
      codeLines: [11],
      vars: [{ name: "returns", value: left }],
      note: { vi: `${callLabel} trả về ${left}.`, en: `${callLabel} returns ${left}.` },
    });
    return left;
  }

  steps.push({
    title: { vi: `Bắt đầu findFirstLast(nums, ${target})`, en: `Start findFirstLast(nums, ${target})` },
    arr: [...nums],
    sub: labels(0, n),
    highlight: activeRange(0, n),
    mark: [],
    codeLines: [12],
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }, { name: "target", value: target }],
    note: {
      vi: `Cần tìm vị trí đầu và cuối của ${target}. Gọi lowerBound(target) để tìm biên trái.`,
      en: `Need to find the first and last position of ${target}. Call lowerBound(target) to find the left boundary.`,
    },
  });

  const first = lowerBound(target, "lowerBound(target) — first call, finds left boundary");

  const notFound = first === n || nums[first] !== target;
  steps.push({
    title: { vi: `first==len(nums) or nums[first]!=target? ${notFound}`, en: `first==len(nums) or nums[first]!=target? ${notFound}` },
    arr: [...nums],
    sub: labels(first, first),
    highlight: [],
    mark: first < n ? [first] : [],
    codeLines: [13],
    vars: [{ name: "first", value: first }, { name: "nums[first]", value: first < n ? nums[first] : "out of range" }],
    note: notFound
      ? { vi: `first=${first}: ${first === n ? "vượt quá mảng" : `nums[${first}]=${nums[first]} ≠ ${target}`} → target không tồn tại.`, en: `first=${first}: ${first === n ? "out of bounds" : `nums[${first}]=${nums[first]} ≠ ${target}`} → target does not exist.` }
      : { vi: `first=${first}: nums[${first}]=${target} → target tồn tại, tiếp tục tìm biên phải.`, en: `first=${first}: nums[${first}]=${target} → target exists, proceed to find the right boundary.` },
  });

  if (notFound) {
    steps.push({
      title: { vi: "return [-1, -1]", en: "return [-1, -1]" },
      arr: [...nums],
      sub: labels(-1, -1),
      highlight: [],
      mark: [],
      final: true,
      codeLines: [14],
      vars: [{ name: "answer", value: "[-1, -1]" }],
      note: { vi: `${target} không có trong mảng.`, en: `${target} is not in the array.` },
    });
    return { original: [...nums], answer: "[-1, -1]", steps };
  }

  steps.push({
    title: { vi: `Bắt đầu gọi lowerBound(target + 1) = lowerBound(${target + 1})`, en: `Begin calling lowerBound(target + 1) = lowerBound(${target + 1})` },
    arr: [...nums],
    sub: labels(first, first),
    highlight: [],
    mark: [first],
    codeLines: [15],
    vars: [{ name: "target + 1", value: target + 1 }],
    note: {
      vi: `Biên phải = chỉ số đầu tiên có nums[i] > target, trừ 1. Tính bằng lowerBound(target+1) - 1.`,
      en: `The right boundary = the first index where nums[i] > target, minus 1. Computed as lowerBound(target+1) - 1.`,
    },
  });

  const lastBoundStart = lowerBound(target + 1, "lowerBound(target + 1) — second call, finds right boundary");
  const last = lastBoundStart - 1;

  steps.push({
    title: { vi: `last = lowerBound(target+1) - 1 = ${lastBoundStart} - 1 = ${last}`, en: `last = lowerBound(target+1) - 1 = ${lastBoundStart} - 1 = ${last}` },
    arr: [...nums],
    sub: labels(first, last),
    highlight: [],
    mark: [first, last].filter((i, idx, arr) => arr.indexOf(i) === idx),
    codeLines: [15],
    vars: [{ name: "last", value: last }],
    note: { vi: `Chỉ số cuối cùng của ${target} là ${last}.`, en: `The last index of ${target} is ${last}.` },
  });

  steps.push({
    title: { vi: `return [first, last] = [${first}, ${last}]`, en: `return [first, last] = [${first}, ${last}]` },
    arr: [...nums],
    sub: labels(first, last),
    highlight: Array.from({ length: last - first + 1 }, (_, i) => first + i),
    mark: [first, last].filter((i, idx, arr) => arr.indexOf(i) === idx),
    final: true,
    codeLines: [16],
    vars: [{ name: "answer", value: `[${first}, ${last}]` }],
    note: { vi: `${target} xuất hiện từ index ${first} đến ${last}.`, en: `${target} appears from index ${first} to ${last}.` },
  });

  return { original: [...nums], answer: `[${first}, ${last}]`, steps };
}

/**
 * LeetCode 34, approach 2: two closed-interval binary searches with a
 * left-biased mid, one for the first occurrence (findFirst) and one for the
 * last occurrence (findLast). findLast needs an extra fix: because mid is
 * floor-biased, a 2-element window [start, start+1] always computes
 * mid = start; if nums[mid] == target the loop would set start = mid (no
 * progress) and spin forever. The fix forces mid = end whenever the window
 * has shrunk to exactly 2 elements, guaranteeing progress every iteration.
 * Line-by-line trace of the exact code shown to the user:
 *  1  class Solution:
 *  2      def searchRange(self, nums, target):
 *  3          if len(nums) == 0:
 *  4              return [-1, -1]
 *  5          first = self.findFirst(nums, target)
 *  6          if first == -1:
 *  7              return [-1, -1]
 *  8          last = self.findLast(nums, target)
 *  9          return [first, last]
 * 10      def findFirst(self, nums, target):
 * 11          start, end = 0, len(nums) - 1
 * 12          while start < end:
 * 13              mid = (start + end) // 2
 * 14              if nums[mid] == target:
 * 15                  end = mid
 * 16              elif nums[mid] > target:
 * 17                  end = mid - 1
 * 18              else:
 * 19                  start = mid + 1
 * 20          if nums[start] == target:
 * 21              return start
 * 22          else:
 * 23              return -1
 * 24      def findLast(self, nums, target):
 * 25          start, end = 0, len(nums) - 1
 * 26          while start < end:
 * 27              mid = (start + end) // 2
 * 28              if start + 1 == end:
 * 29                  mid = end
 * 30              if nums[mid] == target:
 * 31                  start = mid
 * 32              elif nums[mid] > target:
 * 33                  end = mid - 1
 * 34              else:
 * 35                  start = mid + 1
 * 36          if nums[start] == target:
 * 37              return start
 * 38          else:
 * 39              return -1
 */
function buildSteps34Alt(nums, params) {
  const target = Number(params && params.target !== undefined ? params.target : nums[0]);
  const n = nums.length;
  const steps = [];

  function labels(s, e, m) {
    return nums.map((_, i) => {
      const tags = [];
      if (i === s) tags.push("S");
      if (m !== undefined && i === m) tags.push("M");
      if (i === e) tags.push("E");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }
  function activeRange(s, e) {
    return s > e ? [] : Array.from({ length: e - s + 1 }, (_, k) => s + k);
  }
  function push({ title, s, e, m, highlight, mark, codeLines, vars, note, final = false }) {
    steps.push({
      title,
      arr: [...nums],
      sub: labels(s, e, m),
      highlight: highlight !== undefined ? highlight : activeRange(s, e),
      mark: mark || [],
      final,
      codeBlock: 2,
      codeLines,
      vars: vars || [],
      note,
    });
  }

  if (n === 0) {
    push({
      title: { vi: "len(nums) == 0 → return [-1, -1]", en: "len(nums) == 0 → return [-1, -1]" },
      s: -1, e: -1,
      codeLines: [4],
      final: true,
      vars: [{ name: "answer", value: "[-1, -1]" }],
      note: { vi: "Mảng rỗng, không có gì để tìm.", en: "The array is empty, nothing to find." },
    });
    return { original: [...nums], answer: "[-1, -1]", steps };
  }

  push({
    title: { vi: `Bắt đầu searchRange(nums, ${target})`, en: `Start searchRange(nums, ${target})` },
    s: 0, e: n - 1,
    codeLines: [5],
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }, { name: "target", value: target }],
    note: { vi: `Gọi findFirst để tìm vị trí xuất hiện đầu tiên của ${target}.`, en: `Call findFirst to locate the first occurrence of ${target}.` },
  });

  // findFirst: closed interval [start, end], mid biased left. No special fix needed
  // because setting end = mid when start < end always strictly decreases end.
  function findFirst() {
    let start = 0;
    let end = n - 1;
    push({
      title: { vi: "findFirst: start, end = 0, len(nums)-1", en: "findFirst: start, end = 0, len(nums)-1" },
      s: start, e: end,
      codeLines: [11],
      vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
      note: { vi: "Vùng tìm kiếm ban đầu là toàn bộ mảng.", en: "The initial search range is the whole array." },
    });

    while (start < end) {
      push({
        title: { vi: `while S=${start} < E=${end} → True`, en: `while S=${start} < E=${end} → True` },
        s: start, e: end,
        codeLines: [12],
        vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
        note: { vi: "Còn hơn 1 phần tử trong vùng, tiếp tục thu hẹp.", en: "More than one element remains in range, keep narrowing." },
      });

      const mid = Math.floor((start + end) / 2);
      push({
        title: { vi: `M = (S+E)//2 = ${mid}`, en: `M = (S+E)//2 = ${mid}` },
        s: start, e: end, m: mid,
        codeLines: [13],
        mark: [mid],
        vars: [{ name: "mid (M)", value: mid }, { name: "nums[M]", value: nums[mid] }],
        note: { vi: `nums[${mid}] = ${nums[mid]}.`, en: `nums[${mid}] = ${nums[mid]}.` },
      });

      if (nums[mid] === target) {
        push({
          title: { vi: `nums[M]=${nums[mid]} == target=${target} → True`, en: `nums[M]=${nums[mid]} == target=${target} → True` },
          s: start, e: end, m: mid,
          codeLines: [14],
          mark: [mid],
          note: { vi: "M chính là target → có thể là đáp án, giữ M, thu hẹp E về M.", en: "M itself equals target → could be the answer, keep M, shrink E to M." },
        });
        end = mid;
        push({
          title: { vi: `E = M = ${end}`, en: `E = M = ${end}` },
          s: start, e: end,
          codeLines: [15],
          note: { vi: `Vùng co lại thành [${start}, ${end}] — M vẫn có thể là vị trí đầu tiên nên không bị loại.`, en: `Range shrinks to [${start}, ${end}] — M might still be the first occurrence, so it's kept.` },
        });
      } else if (nums[mid] > target) {
        push({
          title: { vi: `nums[M]=${nums[mid]} > target=${target} → True`, en: `nums[M]=${nums[mid]} > target=${target} → True` },
          s: start, e: end, m: mid,
          codeLines: [16],
          mark: [mid],
          note: { vi: "M quá lớn → target (nếu có) nằm bên trái M → loại M và mọi thứ bên phải.", en: "M is too large → target (if present) is left of M → discard M and everything to its right." },
        });
        end = mid - 1;
        push({
          title: { vi: `E = M - 1 = ${end}`, en: `E = M - 1 = ${end}` },
          s: start, e: end,
          codeLines: [17],
          note: { vi: `Vùng co lại thành [${start}, ${end}].`, en: `Range shrinks to [${start}, ${end}].` },
        });
      } else {
        push({
          title: { vi: `nums[M]=${nums[mid]} < target=${target} → else`, en: `nums[M]=${nums[mid]} < target=${target} → else` },
          s: start, e: end, m: mid,
          codeLines: [18],
          mark: [mid],
          note: { vi: "M quá nhỏ → target nằm bên phải M → loại M và mọi thứ bên trái.", en: "M is too small → target is right of M → discard M and everything to its left." },
        });
        start = mid + 1;
        push({
          title: { vi: `S = M + 1 = ${start}`, en: `S = M + 1 = ${start}` },
          s: start, e: end,
          codeLines: [19],
          note: { vi: `Vùng co lại thành [${start}, ${end}].`, en: `Range shrinks to [${start}, ${end}].` },
        });
      }
    }

    push({
      title: { vi: `while S=${start} < E=${end} → False`, en: `while S=${start} < E=${end} → False` },
      s: start, e: end,
      highlight: [],
      mark: [start],
      codeLines: [12],
      vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
      note: { vi: `S và E gặp nhau tại ${start}.`, en: `S and E meet at ${start}.` },
    });

    const found = nums[start] === target;
    push({
      title: { vi: `nums[start]=${nums[start]} == target=${target}? ${found}`, en: `nums[start]=${nums[start]} == target=${target}? ${found}` },
      s: start, e: end,
      highlight: [],
      mark: [start],
      codeLines: [20],
      vars: [{ name: "nums[start]", value: nums[start] }],
      note: { vi: found ? `nums[${start}] = ${target} → tìm thấy.` : `nums[${start}] = ${nums[start]} ≠ ${target} → target không tồn tại.`, en: found ? `nums[${start}] = ${target} → found.` : `nums[${start}] = ${nums[start]} ≠ ${target} → target does not exist.` },
    });
    if (found) {
      push({
        title: { vi: `findFirst return start = ${start}`, en: `findFirst return start = ${start}` },
        s: start, e: end, highlight: [], mark: [start],
        codeLines: [21],
        vars: [{ name: "returns", value: start }],
        note: { vi: `findFirst trả về ${start}.`, en: `findFirst returns ${start}.` },
      });
      return start;
    }
    push({
      title: { vi: "findFirst return -1", en: "findFirst return -1" },
      s: start, e: end, highlight: [], mark: [],
      codeLines: [23],
      vars: [{ name: "returns", value: -1 }],
      note: { vi: "target không tồn tại trong mảng.", en: "target does not exist in the array." },
    });
    return -1;
  }

  const first = findFirst();

  const notFound = first === -1;
  push({
    title: { vi: `first == -1? ${notFound}`, en: `first == -1? ${notFound}` },
    s: 0, e: n - 1, highlight: [], mark: notFound ? [] : [first],
    codeLines: [6],
    vars: [{ name: "first", value: first }],
    note: notFound
      ? { vi: `first=-1 → ${target} không tồn tại, không cần tìm findLast.`, en: `first=-1 → ${target} does not exist, no need to call findLast.` }
      : { vi: `first=${first} → ${target} tồn tại, tiếp tục gọi findLast.`, en: `first=${first} → ${target} exists, proceed to call findLast.` },
  });
  if (notFound) {
    push({
      title: { vi: "return [-1, -1]", en: "return [-1, -1]" },
      s: -1, e: -1, highlight: [], mark: [],
      final: true,
      codeLines: [7],
      vars: [{ name: "answer", value: "[-1, -1]" }],
      note: { vi: `${target} không có trong mảng.`, en: `${target} is not in the array.` },
    });
    return { original: [...nums], answer: "[-1, -1]", steps };
  }

  push({
    title: { vi: `last = self.findLast(nums, ${target})`, en: `last = self.findLast(nums, ${target})` },
    s: 0, e: n - 1, highlight: [], mark: [first],
    codeLines: [8],
    vars: [],
    note: { vi: "Gọi findLast để tìm vị trí xuất hiện cuối cùng.", en: "Call findLast to locate the last occurrence." },
  });

  // findLast: same closed-interval search, but with a fix to guarantee
  // progress: when the window has exactly 2 elements (start+1 == end),
  // force mid = end so a match at mid sets start = end (loop terminates)
  // instead of start = start (no progress, infinite loop).
  function findLast() {
    let start = 0;
    let end = n - 1;
    push({
      title: { vi: "findLast: start, end = 0, len(nums)-1", en: "findLast: start, end = 0, len(nums)-1" },
      s: start, e: end,
      codeLines: [25],
      vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
      note: { vi: "Vùng tìm kiếm ban đầu là toàn bộ mảng.", en: "The initial search range is the whole array." },
    });

    while (start < end) {
      push({
        title: { vi: `while S=${start} < E=${end} → True`, en: `while S=${start} < E=${end} → True` },
        s: start, e: end,
        codeLines: [26],
        vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
        note: { vi: "Còn hơn 1 phần tử trong vùng, tiếp tục thu hẹp.", en: "More than one element remains in range, keep narrowing." },
      });

      let mid = Math.floor((start + end) / 2);
      push({
        title: { vi: `M = (S+E)//2 = ${mid}`, en: `M = (S+E)//2 = ${mid}` },
        s: start, e: end, m: mid,
        codeLines: [27],
        mark: [mid],
        vars: [{ name: "mid (M)", value: mid }],
        note: { vi: `M lấy nghiêng về bên trái do chia nguyên.`, en: `M leans left because of integer division.` },
      });

      const needsFix = start + 1 === end;
      push({
        title: { vi: `S+1 == E? ${needsFix} (${start}+1 vs ${end})`, en: `S+1 == E? ${needsFix} (${start}+1 vs ${end})` },
        s: start, e: end, m: mid,
        codeLines: [28],
        mark: [mid],
        vars: [{ name: "S+1 == E?", value: needsFix }],
        note: needsFix
          ? { vi: "Vùng chỉ còn đúng 2 phần tử. Nếu không ép M=E, khi nums[M]==target thì start=M=start (không tiến), gây lặp vô hạn.", en: "The range has exactly 2 elements left. Without forcing M=E, a match at M would set start=M=start (no progress), causing an infinite loop." }
          : { vi: "Vùng còn hơn 2 phần tử, không cần chỉnh M.", en: "The range has more than 2 elements, no fix needed for M." },
      });
      if (needsFix) {
        mid = end;
        push({
          title: { vi: `M = E = ${mid}`, en: `M = E = ${mid}` },
          s: start, e: end, m: mid,
          codeLines: [29],
          mark: [mid],
          note: { vi: "Ép M về E để đảm bảo mỗi vòng lặp đều tiến triển.", en: "Force M to E to guarantee progress every iteration." },
        });
      }

      if (nums[mid] === target) {
        push({
          title: { vi: `nums[M]=${nums[mid]} == target=${target} → True`, en: `nums[M]=${nums[mid]} == target=${target} → True` },
          s: start, e: end, m: mid,
          codeLines: [30],
          mark: [mid],
          note: { vi: "M chính là target → có thể là đáp án (vị trí cuối), giữ M, thu hẹp S về M.", en: "M itself equals target → could be the answer (last position), keep M, shrink S to M." },
        });
        start = mid;
        push({
          title: { vi: `S = M = ${start}`, en: `S = M = ${start}` },
          s: start, e: end,
          codeLines: [31],
          note: { vi: `Vùng co lại thành [${start}, ${end}] — M vẫn có thể là vị trí cuối nên không bị loại.`, en: `Range shrinks to [${start}, ${end}] — M might still be the last occurrence, so it's kept.` },
        });
      } else if (nums[mid] > target) {
        push({
          title: { vi: `nums[M]=${nums[mid]} > target=${target} → True`, en: `nums[M]=${nums[mid]} > target=${target} → True` },
          s: start, e: end, m: mid,
          codeLines: [32],
          mark: [mid],
          note: { vi: "M quá lớn → target (nếu có) nằm bên trái M → loại M và mọi thứ bên phải.", en: "M is too large → target (if present) is left of M → discard M and everything to its right." },
        });
        end = mid - 1;
        push({
          title: { vi: `E = M - 1 = ${end}`, en: `E = M - 1 = ${end}` },
          s: start, e: end,
          codeLines: [33],
          note: { vi: `Vùng co lại thành [${start}, ${end}].`, en: `Range shrinks to [${start}, ${end}].` },
        });
      } else {
        push({
          title: { vi: `nums[M]=${nums[mid]} < target=${target} → else`, en: `nums[M]=${nums[mid]} < target=${target} → else` },
          s: start, e: end, m: mid,
          codeLines: [34],
          mark: [mid],
          note: { vi: "M quá nhỏ → target nằm bên phải M → loại M và mọi thứ bên trái.", en: "M is too small → target is right of M → discard M and everything to its left." },
        });
        start = mid + 1;
        push({
          title: { vi: `S = M + 1 = ${start}`, en: `S = M + 1 = ${start}` },
          s: start, e: end,
          codeLines: [35],
          note: { vi: `Vùng co lại thành [${start}, ${end}].`, en: `Range shrinks to [${start}, ${end}].` },
        });
      }
    }

    push({
      title: { vi: `while S=${start} < E=${end} → False`, en: `while S=${start} < E=${end} → False` },
      s: start, e: end, highlight: [], mark: [start],
      codeLines: [26],
      vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
      note: { vi: `S và E gặp nhau tại ${start}.`, en: `S and E meet at ${start}.` },
    });

    const found = nums[start] === target;
    push({
      title: { vi: `nums[start]=${nums[start]} == target=${target}? ${found}`, en: `nums[start]=${nums[start]} == target=${target}? ${found}` },
      s: start, e: end, highlight: [], mark: [start],
      codeLines: [36],
      vars: [{ name: "nums[start]", value: nums[start] }],
      note: { vi: found ? `nums[${start}] = ${target} → tìm thấy.` : `nums[${start}] = ${nums[start]} ≠ ${target} → target không tồn tại.`, en: found ? `nums[${start}] = ${target} → found.` : `nums[${start}] = ${nums[start]} ≠ ${target} → target does not exist.` },
    });
    if (found) {
      push({
        title: { vi: `findLast return start = ${start}`, en: `findLast return start = ${start}` },
        s: start, e: end, highlight: [], mark: [start],
        codeLines: [37],
        vars: [{ name: "returns", value: start }],
        note: { vi: `findLast trả về ${start}.`, en: `findLast returns ${start}.` },
      });
      return start;
    }
    push({
      title: { vi: "findLast return -1", en: "findLast return -1" },
      s: start, e: end, highlight: [], mark: [],
      codeLines: [39],
      vars: [{ name: "returns", value: -1 }],
      note: { vi: "target không tồn tại trong mảng.", en: "target does not exist in the array." },
    });
    return -1;
  }

  const last = findLast();

  push({
    title: { vi: `return [first, last] = [${first}, ${last}]`, en: `return [first, last] = [${first}, ${last}]` },
    s: first, e: last,
    highlight: Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => first + i),
    mark: [first, last].filter((v, idx, arr) => arr.indexOf(v) === idx),
    final: true,
    codeLines: [9],
    vars: [{ name: "answer", value: `[${first}, ${last}]` }],
    note: { vi: `${target} xuất hiện từ index ${first} đến ${last}.`, en: `${target} appears from index ${first} to ${last}.` },
  });

  return { original: [...nums], answer: `[${first}, ${last}]`, steps };
}

/**
 * LeetCode 35: Search Insert Position.
 * Classic binary search on a sorted array. If target is found, return its
 * index. Otherwise return the index where it would be inserted to keep the
 * array sorted — which is exactly what `left` converges to when the loop
 * ends (left === right, the first index where nums[i] >= target).
 */
function buildSteps35(nums, params) {
  const target = Number(params && params.target !== undefined ? params.target : nums[0]);
  const n = nums.length;
  const steps = [];

  // Build sub-labels: index, plus L/M/R tags for the pointers that land on it.
  // right can equal n (one past the last bar), so it never gets a tag on a bar.
  function labels(l, r, m) {
    return nums.map((_, i) => {
      const tags = [];
      if (i === l) tags.push("L");
      if (m !== undefined && i === m) tags.push("M");
      if (i === r) tags.push("R");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }
  // The active search range is [left, right) — everything else is "discarded".
  function activeRange(l, r) {
    return Array.from({ length: Math.max(0, r - l) }, (_, k) => l + k);
  }

  // Line 3: left, right = 0, len(nums)
  let left = 0;
  let right = n;
  steps.push({
    title: { vi: "left, right = 0, len(nums)", en: "left, right = 0, len(nums)" },
    arr: [...nums],
    sub: labels(left, right),
    highlight: activeRange(left, right),
    mark: [],
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "target", value: target },
      { name: "left (L)", value: left },
      { name: "right (R)", value: right === n ? `${right} (past last index)` : right },
    ],
    note: {
      vi: `Tìm target=${target} trong nums đã sắp xếp. Vùng tìm kiếm ban đầu là TOÀN BỘ mảng: L=${left}, R=${right} (một bước sau chỉ số cuối). Các cột sáng = vùng đang xét.`,
      en: `Find target=${target} in the sorted nums. The initial search range is the WHOLE array: L=${left}, R=${right} (one past the last index). Highlighted bars = the active range.`,
    },
  });

  while (left < right) {
    // Line 4: while left < right
    steps.push({
      title: { vi: `while L=${left} < R=${right} → True`, en: `while L=${left} < R=${right} → True` },
      arr: [...nums],
      sub: labels(left, right),
      highlight: activeRange(left, right),
      mark: [],
      codeLines: [4],
      vars: [{ name: "left (L)", value: left }, { name: "right (R)", value: right }],
      note: {
        vi: `L=${left} < R=${right} → vùng tìm kiếm còn hơn 0 phần tử, tiếp tục thu hẹp.`,
        en: `L=${left} < R=${right} → the range still has elements, keep narrowing it.`,
      },
    });

    // Line 5: mid = (left + right) // 2
    const mid = Math.floor((left + right) / 2);
    steps.push({
      title: { vi: `M = (L+R)//2 = (${left}+${right})//2 = ${mid}`, en: `M = (L+R)//2 = (${left}+${right})//2 = ${mid}` },
      arr: [...nums],
      sub: labels(left, right, mid),
      highlight: activeRange(left, right),
      mark: [mid],
      codeLines: [5],
      vars: [{ name: "mid (M)", value: mid }, { name: "nums[M]", value: nums[mid] }],
      note: {
        vi: `Điểm giữa của vùng [${left}, ${right}) là M=${mid}. nums[${mid}] = ${nums[mid]} (cột màu xanh).`,
        en: `The midpoint of range [${left}, ${right}) is M=${mid}. nums[${mid}] = ${nums[mid]} (highlighted in green).`,
      },
    });

    // Line 6: if nums[mid] < target
    const goRight = nums[mid] < target;
    steps.push({
      title: { vi: `nums[M]=${nums[mid]} < target=${target} → ${goRight}`, en: `nums[M]=${nums[mid]} < target=${target} → ${goRight}` },
      arr: [...nums],
      sub: labels(left, right, mid),
      highlight: activeRange(left, right),
      mark: [mid],
      codeLines: [6],
      vars: [{ name: "nums[M] < target?", value: goRight }],
      note: goRight
        ? { vi: `${nums[mid]} < ${target} → M và mọi thứ bên trái M đều quá nhỏ. target chắc chắn nằm bên PHẢI của M → bỏ nửa trái.`, en: `${nums[mid]} < ${target} → M and everything left of M is too small. target must be to the RIGHT of M → discard the left half.` }
        : { vi: `${nums[mid]} ≥ ${target} → M có thể LÀ vị trí đúng (hoặc vị trí đúng nằm bên trái M) → giữ M lại, bỏ nửa phải.`, en: `${nums[mid]} ≥ ${target} → M could BE the answer (or the answer is left of M) → keep M, discard the right half.` },
    });

    if (goRight) {
      // Line 7: left = mid + 1
      const oldLeft = left;
      left = mid + 1;
      steps.push({
        title: { vi: `L = M + 1 = ${left}  (bỏ [${oldLeft}..${mid}])`, en: `L = M + 1 = ${left}  (discard [${oldLeft}..${mid}])` },
        arr: [...nums],
        sub: labels(left, right),
        highlight: activeRange(left, right),
        mark: [],
        codeLines: [7],
        vars: [{ name: "left before", value: oldLeft }, { name: "left after (L)", value: left }],
        note: {
          vi: `Vùng tìm kiếm co lại thành [${left}, ${right}) — các cột mờ đã bị loại.`,
          en: `The search range shrinks to [${left}, ${right}) — dimmed bars have been eliminated.`,
        },
      });
    } else {
      // Line 9: right = mid
      const oldRight = right;
      right = mid;
      steps.push({
        title: { vi: `R = M = ${right}  (bỏ [${right}..${oldRight - 1}], giữ M làm ứng viên)`, en: `R = M = ${right}  (discard [${right}..${oldRight - 1}], keep M as a candidate)` },
        arr: [...nums],
        sub: labels(left, right),
        highlight: activeRange(left, right),
        mark: [],
        codeLines: [9],
        vars: [{ name: "right before", value: oldRight }, { name: "right after (R)", value: right }],
        note: {
          vi: `Vùng tìm kiếm co lại thành [${left}, ${right}) — M vẫn có thể là đáp án nên KHÔNG bị loại.`,
          en: `The search range shrinks to [${left}, ${right}) — M might still be the answer, so it is NOT eliminated.`,
        },
      });
    }
  }

  // Final while check → False
  steps.push({
    title: { vi: `while L=${left} < R=${right} → False`, en: `while L=${left} < R=${right} → False` },
    arr: [...nums],
    sub: labels(left, right),
    highlight: [],
    mark: [Math.min(left, n - 1 >= 0 ? left : 0)].filter((i) => i >= 0 && i < n),
    codeLines: [4],
    vars: [{ name: "left (L)", value: left }, { name: "right (R)", value: right }],
    note: {
      vi: `L và R đã gặp nhau tại ${left} → vùng tìm kiếm chỉ còn 0 phần tử. Đây chính là vị trí đầu tiên mà nums[i] ≥ target.`,
      en: `L and R have met at ${left} → the search range is down to 0 elements. This is the first index where nums[i] ≥ target.`,
    },
  });

  // Line 10: return left
  steps.push({
    title: { vi: `return left = ${left}`, en: `return left = ${left}` },
    arr: [...nums],
    sub: labels(left, right),
    highlight: [],
    mark: [left].filter((i) => i >= 0 && i < n),
    final: true,
    codeLines: [10],
    vars: [{ name: "answer", value: left }],
    note: left < n && nums[left] === target
      ? { vi: `nums[${left}] = ${target} → target đã có sẵn trong mảng, tại index ${left}.`, en: `nums[${left}] = ${target} → target already exists in the array, at index ${left}.` }
      : { vi: `target=${target} không có trong mảng. Nếu chèn vào để giữ thứ tự tăng, nó sẽ đứng ở index ${left}.`, en: `target=${target} is not in the array. If inserted to keep the array sorted, it would sit at index ${left}.` },
  });

  return { original: [...nums], answer: left, steps };
}

/**
 * LeetCode 35 — Approach 2: Closed-interval binary search [start, end] with
 * an early return on exact match, plus a post-loop check.
 */
function buildSteps35v2(nums, params) {
  const target = Number(params && params.target !== undefined ? params.target : nums[0]);
  const n = nums.length;
  const steps = [];

  function labels(s, e, m) {
    return nums.map((_, i) => {
      const tags = [];
      if (i === s) tags.push("S");
      if (m !== undefined && i === m) tags.push("M");
      if (i === e) tags.push("E");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }
  function activeRange(s, e) {
    return Array.from({ length: Math.max(0, e - s + 1) }, (_, k) => s + k);
  }

  // Line 3: start = 0
  let start = 0;
  steps.push({
    title: { vi: "start = 0", en: "start = 0" },
    arr: [...nums],
    sub: labels(start, undefined),
    highlight: [],
    mark: [],
    codeBlock: 2,
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "target", value: target },
      { name: "start (S)", value: start },
    ],
    note: {
      vi: `Tìm target=${target}. Đây là closed-interval binary search: cả start và end đều là chỉ số HỢP LỆ (khác với cách 1 dùng right = len(nums)).`,
      en: `Find target=${target}. This is a closed-interval binary search: both start and end are VALID indices (unlike Approach 1 which uses right = len(nums)).`,
    },
  });

  // Line 4: end = len(nums) - 1
  let end = n - 1;
  steps.push({
    title: { vi: `end = len(nums) - 1 = ${end}`, en: `end = len(nums) - 1 = ${end}` },
    arr: [...nums],
    sub: labels(start, end),
    highlight: activeRange(start, end),
    mark: [],
    codeBlock: 2,
    codeLines: [4],
    vars: [{ name: "end (E)", value: end }],
    note: {
      vi: `end = ${end} (chỉ số cuối cùng của mảng). Vùng tìm kiếm ban đầu: [S=${start}, E=${end}] — bao gồm CẢ HAI đầu.`,
      en: `end = ${end} (the array's last index). Initial search range: [S=${start}, E=${end}] — INCLUDING both ends.`,
    },
  });

  while (start < end) {
    // Line 5: while start < end
    steps.push({
      title: { vi: `while S=${start} < E=${end} → True`, en: `while S=${start} < E=${end} → True` },
      arr: [...nums],
      sub: labels(start, end),
      highlight: activeRange(start, end),
      mark: [],
      codeBlock: 2,
      codeLines: [5],
      vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
      note: {
        vi: `S=${start} < E=${end} → vùng [${start}, ${end}] có hơn 1 phần tử, tiếp tục.`,
        en: `S=${start} < E=${end} → range [${start}, ${end}] has more than 1 element, continue.`,
      },
    });

    // Line 6: mid = (start + end) // 2
    const mid = Math.floor((start + end) / 2);
    steps.push({
      title: { vi: `M = (S+E)//2 = (${start}+${end})//2 = ${mid}`, en: `M = (S+E)//2 = (${start}+${end})//2 = ${mid}` },
      arr: [...nums],
      sub: labels(start, end, mid),
      highlight: activeRange(start, end),
      mark: [mid],
      codeBlock: 2,
      codeLines: [6],
      vars: [{ name: "mid (M)", value: mid }, { name: "nums[M]", value: nums[mid] }],
      note: {
        vi: `M = ${mid}. nums[${mid}] = ${nums[mid]}.`,
        en: `M = ${mid}. nums[${mid}] = ${nums[mid]}.`,
      },
    });

    // Line 7: if nums[mid] == target
    const isMatch = nums[mid] === target;
    steps.push({
      title: { vi: `if nums[M]=${nums[mid]} == target=${target} → ${isMatch}`, en: `if nums[M]=${nums[mid]} == target=${target} → ${isMatch}` },
      arr: [...nums],
      sub: labels(start, end, mid),
      highlight: activeRange(start, end),
      mark: [mid],
      codeBlock: 2,
      codeLines: [7],
      vars: [{ name: "nums[M] == target?", value: isMatch }],
      note: isMatch
        ? { vi: `${nums[mid]} == ${target} → Tìm thấy chính xác! Return luôn M=${mid}.`, en: `${nums[mid]} == ${target} → Exact match found! Return M=${mid} immediately.` }
        : { vi: `${nums[mid]} ≠ ${target} → chưa khớp, tiếp tục kiểm tra hướng.`, en: `${nums[mid]} ≠ ${target} → not a match yet, check which direction to go.` },
    });

    if (isMatch) {
      // Line 8: return mid
      steps.push({
        title: { vi: `return mid = ${mid}`, en: `return mid = ${mid}` },
        arr: [...nums],
        sub: labels(start, end, mid),
        highlight: [],
        mark: [mid],
        final: true,
        codeBlock: 2,
        codeLines: [8],
        vars: [{ name: "answer", value: mid }],
        note: {
          vi: `Trả về ngay index ${mid} vì nums[${mid}] = ${target} khớp chính xác. (Đây là điểm khác biệt so với Cách 1 — không cần đợi vòng lặp kết thúc.)`,
          en: `Return index ${mid} immediately since nums[${mid}] = ${target} matches exactly. (This is the key difference from Approach 1 — no need to wait for the loop to end.)`,
        },
      });
      return { original: [...nums], answer: mid, steps };
    }

    // Line 9: elif nums[mid] > target
    const goLeft = nums[mid] > target;
    steps.push({
      title: { vi: `elif nums[M]=${nums[mid]} > target=${target} → ${goLeft}`, en: `elif nums[M]=${nums[mid]} > target=${target} → ${goLeft}` },
      arr: [...nums],
      sub: labels(start, end, mid),
      highlight: activeRange(start, end),
      mark: [mid],
      codeBlock: 2,
      codeLines: [9],
      vars: [{ name: "nums[M] > target?", value: goLeft }],
      note: goLeft
        ? { vi: `${nums[mid]} > ${target} → M quá lớn, target nằm bên TRÁI của M → end = mid.`, en: `${nums[mid]} > ${target} → M is too large, target is to the LEFT of M → end = mid.` }
        : { vi: `${nums[mid]} < ${target} → M quá nhỏ, target nằm bên PHẢI của M → vào nhánh else.`, en: `${nums[mid]} < ${target} → M is too small, target is to the RIGHT of M → go to else.` },
    });

    if (goLeft) {
      // Line 10: end = mid
      const oldEnd = end;
      end = mid;
      steps.push({
        title: { vi: `E = M = ${end}  (bỏ [${end + 1}..${oldEnd}], giữ M làm ứng viên)`, en: `E = M = ${end}  (discard [${end + 1}..${oldEnd}], keep M as a candidate)` },
        arr: [...nums],
        sub: labels(start, end),
        highlight: activeRange(start, end),
        mark: [],
        codeBlock: 2,
        codeLines: [10],
        vars: [{ name: "end before", value: oldEnd }, { name: "end after (E)", value: end }],
        note: {
          vi: `Vùng tìm kiếm co lại thành [${start}, ${end}] — M vẫn có thể là đáp án (chèn tại vị trí M) nên giữ lại.`,
          en: `The search range shrinks to [${start}, ${end}] — M could still be the answer (insert at M), so it's kept.`,
        },
      });
    } else {
      // Line 11: else
      steps.push({
        title: { vi: `else:`, en: `else:` },
        arr: [...nums],
        sub: labels(start, end, mid),
        highlight: activeRange(start, end),
        mark: [mid],
        codeBlock: 2,
        codeLines: [11],
        vars: [],
        note: {
          vi: `nums[M] < target → vào nhánh else.`,
          en: `nums[M] < target → enter the else branch.`,
        },
      });

      // Line 12: start = mid + 1
      const oldStart = start;
      start = mid + 1;
      steps.push({
        title: { vi: `S = M + 1 = ${start}  (bỏ [${oldStart}..${mid}])`, en: `S = M + 1 = ${start}  (discard [${oldStart}..${mid}])` },
        arr: [...nums],
        sub: labels(start, end),
        highlight: activeRange(start, end),
        mark: [],
        codeBlock: 2,
        codeLines: [12],
        vars: [{ name: "start before", value: oldStart }, { name: "start after (S)", value: start }],
        note: {
          vi: `Vùng tìm kiếm co lại thành [${start}, ${end}] — M và mọi thứ bên trái M đã bị loại.`,
          en: `The search range shrinks to [${start}, ${end}] — M and everything left of M has been eliminated.`,
        },
      });
    }
  }

  // Final while check → False
  steps.push({
    title: { vi: `while S=${start} < E=${end} → False`, en: `while S=${start} < E=${end} → False` },
    arr: [...nums],
    sub: labels(start, end),
    highlight: activeRange(start, end),
    mark: [],
    codeBlock: 2,
    codeLines: [5],
    vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
    note: {
      vi: `S=${start} = E=${end} → chỉ còn 1 phần tử trong vùng tìm kiếm. Thoát vòng lặp, cần kiểm tra hậu kỳ.`,
      en: `S=${start} = E=${end} → only 1 element remains in the range. Exit the loop, a post-loop check is needed.`,
    },
  });

  // Line 13: if nums[start] >= target
  const found = nums[start] >= target;
  steps.push({
    title: { vi: `if nums[S]=${nums[start]} >= target=${target} → ${found}`, en: `if nums[S]=${nums[start]} >= target=${target} → ${found}` },
    arr: [...nums],
    sub: labels(start, end),
    highlight: [start],
    mark: [],
    codeBlock: 2,
    codeLines: [13],
    vars: [{ name: "nums[S] >= target?", value: found }],
    note: found
      ? { vi: `${nums[start]} ≥ ${target} → target thuộc tại hoặc trước vị trí S=${start}. Trả về S.`, en: `${nums[start]} ≥ ${target} → target belongs at or before position S=${start}. Return S.` }
      : { vi: `${nums[start]} < ${target} → target lớn hơn cả phần tử cuối cùng còn lại → chèn NGAY SAU S.`, en: `${nums[start]} < ${target} → target is larger than the last remaining element → insert RIGHT AFTER S.` },
  });

  const answer = found ? start : start + 1;

  if (found) {
    // Line 14: return start
    steps.push({
      title: { vi: `return start = ${start}`, en: `return start = ${start}` },
      arr: [...nums],
      sub: labels(start, end),
      highlight: [],
      mark: [start],
      final: true,
      codeBlock: 2,
      codeLines: [14],
      vars: [{ name: "answer", value: answer }],
      note: nums[start] === target
        ? { vi: `nums[${start}] = ${target} → target có sẵn tại index ${start}.`, en: `nums[${start}] = ${target} → target already exists at index ${start}.` }
        : { vi: `nums[${start}] > ${target} → chèn target vào index ${start} để giữ thứ tự tăng.`, en: `nums[${start}] > ${target} → insert target at index ${start} to keep the array sorted.` },
    });
  } else {
    // Line 16: return start + 1
    steps.push({
      title: { vi: `return start + 1 = ${answer}`, en: `return start + 1 = ${answer}` },
      arr: [...nums],
      sub: labels(start, end),
      highlight: [],
      mark: [answer].filter((i) => i < n),
      final: true,
      codeBlock: 2,
      codeLines: [16],
      vars: [{ name: "answer", value: answer }],
      note: {
        vi: `target=${target} lớn hơn mọi phần tử → chèn vào cuối mảng, tại index ${answer}.`,
        en: `target=${target} is larger than every element → insert at the end of the array, at index ${answer}.`,
      },
    });
  }

  return { original: [...nums], answer, steps };
}

module.exports = Object.assign(module.exports, {
  33: {
    id: 33,
    difficulty: "medium",
    slug: "search-in-rotated-sorted-array",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Search in Rotated Sorted Array", en: "Search in Rotated Sorted Array" },
    titleVi: { vi: "Tìm kiếm trong mảng đã xoay", en: "Search a rotated sorted array" },
    statement: {
      vi: "Cho mảng số nguyên phân biệt đã sắp xếp tăng dần rồi bị xoay tại một pivot và một target. Trả về index của target, hoặc -1 nếu không tồn tại.",
      en: "Given a distinct ascending array rotated at an unknown pivot and a target, return the target index, or -1 when absent.",
    },
    defaultInput: [4, 5, 6, 7, 0, 1, 2],
    inputKind: "integer",
    inputLabel: { vi: "nums (mảng đã xoay)", en: "nums (rotated array)" },
    extraParams: [
      { key: "target", label: { vi: "target", en: "target" }, default: 0 },
    ],
    approach: [
      { vi: "Dùng binary search với vùng đóng [left, right].", en: "Use binary search over the closed interval [left, right]." },
      { vi: "Ở mỗi bước, ít nhất một trong hai nửa [left, mid] hoặc [mid, right] luôn tăng dần.", en: "At every step, at least one of [left, mid] or [mid, right] is sorted." },
      { vi: "Kiểm tra target có nằm trong nửa tăng dần hay không để giữ nửa đó và loại nửa còn lại.", en: "Check whether target lies inside the sorted half, keeping that half and discarding the other." },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Mỗi vòng lặp loại ít nhất một nửa vùng tìm kiếm và chỉ dùng các biến con trỏ.",
        en: "Each iteration discards at least half of the search range and uses only pointer variables.",
      },
    },
    code: [
      "class Solution:",
      "    def search(self, nums, target):",
      "        left, right = 0, len(nums) - 1",
      "        while left <= right:",
      "            mid = (left + right) // 2",
      "            if nums[mid] == target:",
      "                return mid",
      "            if nums[left] <= nums[mid]:",
      "                if nums[left] <= target < nums[mid]:",
      "                    right = mid - 1",
      "                else:",
      "                    left = mid + 1",
      "            else:",
      "                if nums[mid] < target <= nums[right]:",
      "                    left = mid + 1",
      "                else:",
      "                    right = mid - 1",
      "        return -1",
    ],
    builder: buildSteps33,
  },
  34: {
    id: 34,
    difficulty: "medium",
    slug: "find-first-and-last-position-of-element-in-sorted-array",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Find First and Last Position of Element in Sorted Array", en: "Find First and Last Position of Element in Sorted Array" },
    titleVi: { vi: "Tìm vị trí đầu và cuối của phần tử", en: "Find first and last position of a target" },
    statement: {
      vi: "Cho mảng nums đã sắp xếp tăng dần và target. Trả về [first, last] là chỉ số đầu và cuối của target trong nums, hoặc [-1, -1] nếu target không tồn tại.",
      en: "Given a sorted array nums and a target, return [first, last], the first and last index of target in nums, or [-1, -1] if target does not exist.",
    },
    defaultInput: [5, 7, 7, 8, 8, 10],
    inputKind: "integer",
    extraParams: [
      { key: "target", label: { vi: "target", en: "target" }, default: 8 },
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: lowerBound(x) half-open", en: "Approach 1: lowerBound(x) half-open" } },
        { value: "2", label: { vi: "Cách 2: findFirst/findLast closed-interval", en: "Approach 2: findFirst/findLast closed-interval" } },
      ] },
    ],
    approach: [
      { vi: "Viết hàm lowerBound(x): binary search half-open [left, right) trả về chỉ số đầu tiên có nums[i] ≥ x.", en: "Write a lowerBound(x) helper: half-open [left, right) binary search returning the first index where nums[i] ≥ x." },
      { vi: "first = lowerBound(target). Nếu vượt mảng hoặc nums[first] ≠ target → target không tồn tại, trả [-1, -1].", en: "first = lowerBound(target). If out of bounds or nums[first] ≠ target → target doesn't exist, return [-1, -1]." },
      { vi: "last = lowerBound(target + 1) - 1 (chỉ số đầu tiên có nums[i] > target, rồi trừ 1 để lùi về phần tử cuối bằng target).", en: "last = lowerBound(target + 1) - 1 (the first index where nums[i] > target, then subtract 1 to land on the last element equal to target)." },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Hai lần binary search độc lập, mỗi lần O(log n) → tổng O(log n).",
        en: "Two independent binary searches, each O(log n) → total O(log n).",
      },
    },
    code: [
      "class Solution:",
      "    def searchRange(self, nums, target):",
      "        def lowerBound(x):",
      "            left, right = 0, len(nums)",
      "            while left < right:",
      "                mid = (left + right) // 2",
      "                if nums[mid] < x:",
      "                    left = mid + 1",
      "                else:",
      "                    right = mid",
      "            return left",
      "        first = lowerBound(target)",
      "        if first == len(nums) or nums[first] != target:",
      "            return [-1, -1]",
      "        last = lowerBound(target + 1) - 1",
      "        return [first, last]",
    ],
    code2: [
      "class Solution:",
      "    def searchRange(self, nums, target):",
      "        if len(nums) == 0:",
      "            return [-1, -1]",
      "        first = self.findFirst(nums, target)",
      "        if first == -1:",
      "            return [-1, -1]",
      "        last = self.findLast(nums, target)",
      "        return [first, last]",
      "    def findFirst(self, nums, target):",
      "        start, end = 0, len(nums) - 1",
      "        while start < end:",
      "            mid = (start + end) // 2",
      "            if nums[mid] == target:",
      "                end = mid",
      "            elif nums[mid] > target:",
      "                end = mid - 1",
      "            else:",
      "                start = mid + 1",
      "        if nums[start] == target:",
      "            return start",
      "        else:",
      "            return -1",
      "    def findLast(self, nums, target):",
      "        start, end = 0, len(nums) - 1",
      "        while start < end:",
      "            mid = (start + end) // 2",
      "            if start + 1 == end:",
      "                mid = end",
      "            if nums[mid] == target:",
      "                start = mid",
      "            elif nums[mid] > target:",
      "                end = mid - 1",
      "            else:",
      "                start = mid + 1",
      "        if nums[start] == target:",
      "            return start",
      "        else:",
      "            return -1",
    ],
    codeLabel: { vi: "Cách 1: lowerBound(x) half-open", en: "Approach 1: lowerBound(x) half-open" },
    code2Label: { vi: "Cách 2: findFirst/findLast closed-interval", en: "Approach 2: findFirst/findLast closed-interval" },
    builder: buildSteps34,
  },
  35: {
    id: 35,
    difficulty: "easy",
    slug: "search-insert-position",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Search Insert Position", en: "Search Insert Position" },
    titleVi: { vi: "Vị trí chèn khi tìm kiếm", en: "Find the insert position" },
    statement: {
      vi: "Cho mảng nums đã sắp xếp tăng dần (không trùng) và target. Trả về index của target nếu tồn tại; nếu không, trả về index mà target sẽ được chèn vào để giữ mảng sắp xếp.",
      en: "Given a sorted array nums of distinct integers and a target, return the index if target is found. If not, return the index where it would be inserted to keep the array sorted.",
    },
    defaultInput: [1, 3, 5, 6],
    inputKind: "integer",
    extraParams: [
      { key: "target", label: { vi: "target", en: "target" }, default: 5 },
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Half-open [left, right)", en: "Approach 1: Half-open [left, right)" } },
          { value: "2", label: { vi: "Cách 2: Closed [start, end] + early return", en: "Approach 2: Closed [start, end] + early return" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: Binary search half-open [left, right). Nếu nums[mid] < target → left=mid+1. Ngược lại → right=mid.", en: "Approach 1: Half-open binary search [left, right). If nums[mid] < target → left=mid+1. Otherwise → right=mid." },
      { vi: "Cách 2: Binary search closed [start, end]. Nếu nums[mid]==target → return luôn. Nếu nums[mid]>target → end=mid. Ngược lại → start=mid+1.", en: "Approach 2: Closed-interval binary search [start, end]. If nums[mid]==target → return immediately. If nums[mid]>target → end=mid. Otherwise → start=mid+1." },
      { vi: "Cách 2 cần bước hậu kỳ sau vòng lặp: so sánh nums[start] với target để quyết định trả start hay start+1.", en: "Approach 2 needs a post-loop check: compare nums[start] with target to decide whether to return start or start+1." },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Cả 2 cách đều O(log n) time, O(1) space. Cách 1 đơn giản hơn (không cần hậu kỳ); cách 2 có thể return sớm khi tìm thấy target chính xác.",
        en: "Both are O(log n) time, O(1) space. Approach 1 is simpler (no post-loop step); Approach 2 can return early on an exact target match.",
      },
    },
    codeLabel: { vi: "Cách 1: Half-open [left, right)", en: "Approach 1: Half-open [left, right)" },
    code2Label: { vi: "Cách 2: Closed [start, end]", en: "Approach 2: Closed [start, end]" },
    code: [
      "class Solution:",
      "    def searchInsert(self, nums, target):",
      "        left, right = 0, len(nums)",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if nums[mid] < target:",
      "                left = mid + 1",
      "            else:",
      "                right = mid",
      "        return left",
    ],
    code2: [
      "class Solution:",
      "    def searchInsert(self, nums, target):",
      "        start = 0",
      "        end = len(nums) - 1",
      "        while start < end:",
      "            mid = (start + end) // 2",
      "            if nums[mid] == target:",
      "                return mid",
      "            elif nums[mid] > target:",
      "                end = mid",
      "            else:",
      "                start = mid + 1",
      "        if nums[start] >= target:",
      "            return start",
      "        else:",
      "            return start + 1",
    ],
    builder: (nums, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps35v2(nums, params) : buildSteps35(nums, params);
    },
  },
});
