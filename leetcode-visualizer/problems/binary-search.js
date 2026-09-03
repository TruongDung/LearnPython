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

  const eventByLine = {
    2: "constructor-call",
    3: "store-times",
    4: "init-leaders",
    5: "init-votes",
    6: "init-leader",
    7: "read-vote",
    8: "count-vote",
    9: "compare-leader",
    10: "set-leader",
    11: "store-leader",
    13: "query-call",
    14: "query-range",
    15: "while-check",
    16: "compute-mid",
    17: "compare-time",
    18: "move-left",
    19: "else-branch",
    20: "move-right",
    21: "return-query",
  };

  function readVar(step, name) {
    const item = (step.vars || []).find((entry) => entry.name === name);
    return item ? item.value : null;
  }

  function parseStoredLeaders(value) {
    const text = String(value ?? "").trim();
    if (text === "[]" || !text.startsWith("[") || !text.endsWith("]")) return [];
    return text.slice(1, -1).split(",").map((item) => Number(item.trim())).filter(Number.isFinite);
  }

  function scoreSnapshot(lastVoteIndex) {
    const score = new Map();
    for (let index = 0; index <= lastVoteIndex; index += 1) {
      score.set(persons[index], (score.get(persons[index]) || 0) + 1);
    }
    return [...new Set(persons)].sort((a, b) => a - b).map((person) => ({
      person,
      votes: score.get(person) || 0,
    }));
  }

  let activeQueryIndex = -1;
  for (const step of steps) {
    const codeLine = step.codeLines && step.codeLines.length ? step.codeLines[0] : null;
    if (codeLine === 13) activeQueryIndex += 1;
    const isQuery = activeQueryIndex >= 0 && (codeLine === null || codeLine >= 13);
    const isFinal = Boolean(step.final);
    const isPreprocessComplete = !isFinal && !codeLine && activeQueryIndex < 0;
    const event = isFinal
      ? "all-results"
      : isPreprocessComplete
        ? "preprocess-complete"
        : eventByLine[codeLine] || "setup";
    const voteIndex = !isQuery && Number.isInteger(step.highlight && step.highlight[0])
      ? step.highlight[0]
      : null;
    let countedThrough = -1;
    let processedCount = 0;
    if (Number.isInteger(voteIndex)) {
      countedThrough = codeLine === 7 ? voteIndex - 1 : voteIndex;
      processedCount = codeLine === 11 ? voteIndex + 1 : voteIndex;
    } else if (isPreprocessComplete || isQuery || isFinal) {
      countedThrough = persons.length - 1;
      processedCount = persons.length;
    }
    const storedFromVars = parseStoredLeaders(readVar(step, "self.leaders"));
    const storedLeaders = storedFromVars.length ? storedFromVars : leaders.slice(0, processedCount);
    const currentLeaderRaw = readVar(step, "leader");
    const currentLeader = currentLeaderRaw !== null && Number.isFinite(Number(currentLeaderRaw))
      ? Number(currentLeaderRaw)
      : processedCount > 0
        ? leaders[processedCount - 1]
        : null;
    const currentPerson = Number.isInteger(voteIndex) ? persons[voteIndex] : null;
    const previousLeader = Number.isInteger(voteIndex) && voteIndex > 0 ? leaders[voteIndex - 1] : null;
    const scores = scoreSnapshot(countedThrough);
    const currentScore = currentPerson === null ? null : (scores.find((item) => item.person === currentPerson)?.votes || 0);
    const previousLeaderScore = previousLeader === null ? null : (scores.find((item) => item.person === previousLeader)?.votes || 0);
    const tieBreak = [9, 10].includes(codeLine)
      && currentPerson !== previousLeader
      && previousLeader !== null
      && currentScore === previousLeaderScore;

    const tRaw = readVar(step, "t");
    const queryTime = tRaw !== null && Number.isFinite(Number(tRaw)) ? Number(tRaw) : null;
    const leftRaw = readVar(step, "left");
    const rightRaw = readVar(step, "right");
    const midRaw = readVar(step, "mid");
    const left = leftRaw !== null && Number.isFinite(Number(leftRaw)) ? Number(leftRaw) : null;
    let right = rightRaw !== null && Number.isFinite(Number(rightRaw)) ? Number(rightRaw) : null;
    const mid = midRaw !== null && Number.isFinite(Number(midRaw)) ? Number(midRaw) : null;
    if (codeLine === 21 && right === null && left !== null) right = left;
    const answerIndex = codeLine === 21 ? Number(readVar(step, "left - 1")) : null;
    const targetIndex = queryTime === null ? null : times.findIndex((time) => time > queryTime);
    const firstGreaterIndex = targetIndex === -1 ? times.length : targetIndex;
    const completedQueries = isFinal
      ? answers.length
      : Math.max(0, activeQueryIndex + (codeLine === 21 ? 1 : 0));

    step.onlineElectionView = {
      event,
      phase: isFinal ? "done" : isQuery ? "query" : isPreprocessComplete ? "ready" : "preprocess",
      persons: [...persons],
      times: [...times],
      leaders: [...leaders],
      storedLeaders: [...storedLeaders],
      scores,
      voteIndex,
      countedThrough,
      processedCount,
      currentPerson,
      currentLeader,
      previousLeader,
      currentScore,
      previousLeaderScore,
      tieBreak,
      queries: [...queries],
      answers: [...answers],
      completedQueries,
      queryIndex: isQuery && !isFinal ? activeQueryIndex : null,
      queryTime,
      left,
      right,
      mid,
      answerIndex: Number.isInteger(answerIndex) ? answerIndex : null,
      firstGreaterIndex,
      whileResult: codeLine === 15 ? String(readVar(step, "condition")) === "True" : null,
    };
  }

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
 * LeetCode 2226: Maximum Candies Allocated to K Children.
 *
 * Given candies piles and k children, find the MAXIMUM number of candies
 * each child can get if every child must receive the SAME amount (from a
 * single pile - candies from different piles cannot be combined).
 *
 * Binary search on the ANSWER (candies per child): the answer lies in
 * [0, max(candies)]. For a candidate `mid` (candies per child), each pile
 * `c` can feed `c // mid` children. If the TOTAL children fed (sum of
 * c // mid over all piles) is:
 *   - >= k → mid is FEASIBLE (maybe can go bigger) → left = mid + 1
 *   - < k  → mid is TOO BIG (not enough children fed) → right = mid - 1
 * The largest feasible mid is the answer (0 if even mid=1 can't feed k kids).
 */
function buildSteps2226(candies, params) {
  const k = Number(params && params.k !== undefined ? params.k : 2);
  const steps = [];
  const n = candies.length;

  function feedCount(mid) {
    if (mid <= 0) return Infinity; // guard, never called with mid<=0 in practice
    const fedPer = candies.map((c) => Math.floor(c / mid));
    const total = fedPer.reduce((a, b) => a + b, 0);
    return { fedPer, total };
  }

  function subLabels(l, r, m) {
    return candies.map((_, i) => {
      const tags = [];
      if (i === l) tags.push("L");
      if (m !== undefined && i === m) tags.push("M");
      if (i === r) tags.push("R");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [...candies],
      sub: opts.sub || candies.map((_, i) => `[${i}]`),
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      candyAllocationView: {
        candies: [...candies],
        k,
        left: opts.left,
        right: opts.right,
        mid: opts.mid,
        fedPer: opts.fedPer || null,
        total: opts.total,
        feasible: opts.feasible !== undefined ? opts.feasible : null,
        bestAnswer: opts.bestAnswer !== undefined ? opts.bestAnswer : null,
        maxPile,
        phase: opts.phase || "range",
        impossible: !!opts.impossible,
        finalAnswer: opts.finalAnswer,
      },
    });
  }

  const totalCandies = candies.reduce((a, b) => a + b, 0);
  const maxPile = Math.max(...candies);

  // Line 3: if sum(candies) < k: return 0
  const impossible = totalCandies < k;
  snap({
    title: { vi: `if sum(candies) < k → ${totalCandies} < ${k} → ${impossible}`, en: `if sum(candies) < k → ${totalCandies} < ${k} → ${impossible}` },
    sub: subLabels(undefined, undefined),
    codeLines: [3],
    phase: "check",
    impossible,
    vars: [
      { name: "candies", value: `[${candies.join(",")}]` },
      { name: "k", value: k },
      { name: "sum(candies)", value: totalCandies },
    ],
    note: impossible
      ? { vi: `Tổng số kẹo ${totalCandies} < ${k} trẻ em → dù chia mỗi trẻ 1 kẹo cũng không đủ → trả về 0.`, en: `Total candies ${totalCandies} < ${k} children → even 1 candy each isn't enough → return 0.` }
      : { vi: `Tổng số kẹo ${totalCandies} ≥ ${k} → có thể chia được, tiếp tục binary search.`, en: `Total candies ${totalCandies} ≥ ${k} → a split is possible, continue with binary search.` },
  });

  if (impossible) {
    snap({
      title: { vi: "return 0", en: "return 0" },
      sub: candies.map((_, i) => `[${i}]`),
      codeLines: [4],
      final: true,
      phase: "found",
      impossible: true,
      finalAnswer: 0,
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: `Không thể phát đủ kẹo cho ${k} trẻ em (mỗi trẻ tối thiểu 1 kẹo) vì tổng chỉ có ${totalCandies}.`,
        en: `Cannot give at least 1 candy to each of ${k} children since the total is only ${totalCandies}.`,
      },
    });
    return { original: [...candies], answer: 0, steps };
  }

  // Line 5: left, right = 1, max(candies)
  let left = 1;
  let right = maxPile;
  snap({
    title: { vi: `left, right = 1, max(candies) → left=${left}, right=${right}`, en: `left, right = 1, max(candies) → left=${left}, right=${right}` },
    sub: subLabels(undefined, undefined),
    codeLines: [5],
    phase: "range",
    left, right,
    vars: [
      { name: "left (min candies/child)", value: left },
      { name: "right (max pile)", value: right },
    ],
    note: {
      vi: `Đáp án (số kẹo/trẻ) nằm trong [1, max(candies)] = [1, ${right}]: không thể vượt quá đống kẹo lớn nhất (1 đống không thể chia quá số kẹo nó có).`,
      en: `The answer (candies per child) lies in [1, max(candies)] = [1, ${right}]: it can't exceed the largest pile (a single pile can't give out more candies than it has).`,
    },
  });

  let answer = 0;

  while (left <= right) {
    // Line 6: while left <= right:
    snap({
      title: { vi: `while left <= right → ${left} <= ${right} → True`, en: `while left <= right → ${left} <= ${right} → True` },
      sub: subLabels(undefined, undefined),
      codeLines: [6],
      phase: "range",
      left, right,
      bestAnswer: answer,
      vars: [{ name: "left", value: left }, { name: "right", value: right }],
      note: {
        vi: `left=${left} ≤ right=${right} → còn khoảng để tìm đáp án lớn nhất, tiếp tục.`,
        en: `left=${left} ≤ right=${right} → there's still a range to search for the largest answer, continue.`,
      },
    });

    // Line 7: mid = (left + right) // 2
    const mid = Math.floor((left + right) / 2);
    snap({
      title: { vi: `mid = (left+right)//2 = (${left}+${right})//2 = ${mid}`, en: `mid = (left+right)//2 = (${left}+${right})//2 = ${mid}` },
      sub: subLabels(undefined, undefined),
      codeLines: [7],
      phase: "mid",
      left, right, mid,
      bestAnswer: answer,
      vars: [{ name: "mid (candies/child thử)", value: mid }],
      note: {
        vi: `Thử mid=${mid} kẹo/trẻ: mỗi đống chia được bao nhiêu trẻ?`,
        en: `Try mid=${mid} candies/child: how many children can each pile feed?`,
      },
    });

    // Line 8: count = sum(c // mid for c in candies)
    const { fedPer, total } = feedCount(mid);
    const fedStr = fedPer.map((f, i) => `${candies[i]}//${mid}=${f}`).join(", ");
    snap({
      title: { vi: `count = sum(c // mid) → ${total} trẻ được nhận kẹo`, en: `count = sum(c // mid) → ${total} children fed` },
      sub: candies.map((v, i) => `[${i}] →${fedPer[i]}`),
      mark: fedPer.map((f, i) => (f > 0 ? i : -1)).filter((i) => i >= 0),
      codeLines: [8],
      phase: "count",
      left, right, mid, fedPer, total,
      bestAnswer: answer,
      vars: [{ name: "children fed", value: total }, { name: "breakdown", value: fedStr }],
      note: {
        vi: `Mỗi đống c chia được c // mid trẻ (chia nguyên). Tổng cộng ${total} trẻ được nhận đủ ${mid} kẹo.`,
        en: `Each pile c can feed c // mid children (integer division). In total ${total} children get exactly ${mid} candies.`,
      },
    });

    const feasible = total >= k;
    // Line 9: if count >= k:
    snap({
      title: { vi: `if count >= k → ${total} >= ${k} → ${feasible}`, en: `if count >= k → ${total} >= ${k} → ${feasible}` },
      sub: candies.map((v, i) => `[${i}] →${fedPer[i]}`),
      mark: fedPer.map((f, i) => (f > 0 ? i : -1)).filter((i) => i >= 0),
      codeLines: [9],
      phase: "compare",
      left, right, mid, fedPer, total, feasible,
      bestAnswer: answer,
      vars: [{ name: "count", value: total }, { name: "k", value: k }],
      note: feasible
        ? { vi: `${total} ≥ k=${k} → mid=${mid} KHẢ THI (đủ trẻ được chia), thử giá trị LỚN HƠN → left=mid+1.`, en: `${total} ≥ k=${k} → mid=${mid} is FEASIBLE (enough children fed), try LARGER → left=mid+1.` }
        : { vi: `${total} < k=${k} → mid=${mid} QUÁ LỚN (không đủ trẻ được chia) → right=mid-1.`, en: `${total} < k=${k} → mid=${mid} is TOO BIG (not enough children fed) → right=mid-1.` },
    });

    if (feasible) {
      answer = mid;
      // Line 10: left = mid + 1
      left = mid + 1;
      snap({
        title: { vi: `left = mid + 1 → left = ${left}`, en: `left = mid + 1 → left = ${left}` },
        sub: subLabels(undefined, undefined),
        codeLines: [10],
        phase: "narrow-up",
        left, right, mid, fedPer, total, feasible,
        bestAnswer: answer,
        vars: [{ name: "left", value: left }, { name: "best answer so far", value: answer }],
        note: {
          vi: `left = ${left}. mid=${mid} khả thi nên lưu tạm là đáp án tốt nhất, thử giá trị lớn hơn.`,
          en: `left = ${left}. mid=${mid} is feasible so it's kept as the best answer so far, try a bigger value.`,
        },
      });
    } else {
      // Line 12: right = mid - 1
      right = mid - 1;
      snap({
        title: { vi: `right = mid - 1 → right = ${right}`, en: `right = mid - 1 → right = ${right}` },
        sub: subLabels(undefined, undefined),
        codeLines: [12],
        phase: "narrow-down",
        left, right, mid, fedPer, total, feasible,
        bestAnswer: answer,
        vars: [{ name: "right", value: right }],
        note: {
          vi: `right = ${right}. mid=${mid} không khả thi, thu hẹp phạm vi tìm kiếm về phía nhỏ hơn.`,
          en: `right = ${right}. mid=${mid} is not feasible, shrink the search range toward smaller values.`,
        },
      });
    }
  }

  const { fedPer: finalFedPer, total: finalTotal } = feedCount(answer);
  snap({
    title: { vi: `return right → ${answer}`, en: `return right → ${answer}` },
    sub: candies.map((v, i) => `[${i}] →${finalFedPer[i]}`),
    mark: finalFedPer.map((f, i) => (f > 0 ? i : -1)).filter((i) => i >= 0),
    final: true,
    codeLines: [13],
    phase: "found",
    left, right, fedPer: finalFedPer, total: finalTotal,
    bestAnswer: answer,
    finalAnswer: answer,
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `left > right, vòng lặp kết thúc. right=${answer} là giá trị LỚN NHẤT sao cho ≥ ${k} trẻ có thể nhận đủ ${answer} kẹo.`,
      en: `left > right, the loop ends. right=${answer} is the LARGEST value such that ≥ ${k} children can each receive ${answer} candies.`,
    },
  });

  return { original: [...candies], answer, steps };
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
function buildSteps1044Legacy(input) {
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

/** LeetCode 875: Koko Eating Bananas — first feasible speed. */
/** Detailed 1044 walkthrough: binary-search rounds plus every rolling-hash window. */
function buildSteps1044(input) {
  const s = String(input);
  const chars = [...s];
  const n = chars.length;
  const steps = [];
  const base = 26n;
  const mod = 1000000007n;
  const values = chars.map((char) => BigInt(char.charCodeAt(0) - 96));
  const lines = {
    setup: [3, 4, 5, 19, 20], choose: [21, 22, 23], init: [6, 7, 8, 9, 10, 11],
    slide: [12, 13, 17], match: [12, 13, 14, 15, 16], found: [24, 25, 26],
    miss: [27, 28], done: [29],
  };
  const range = (start, length) => Number.isInteger(start) && start >= 0
    ? Array.from({ length }, (_, offset) => start + offset)
    : [];
  const view = (overrides = {}) => ({
    phase: "intro", s, chars, n, base: Number(base), mod: Number(mod), round: 0,
    lo: n > 1 ? 1 : 0, hi: Math.max(0, n - 1), mid: null,
    currentStart: null, currentEnd: null, previousStart: null,
    currentHash: null, previousHash: null, power: null, outgoing: null, incoming: null,
    windows: [], bestStart: -1, bestLength: 0, decision: null, history: [],
    ...overrides,
  });
  const add = (title, note, codeLines, data, final = false) => {
    steps.push({
      title, note, codeLines, final,
      arr: chars,
      sub: chars.map((_, index) => `[${index}]`),
      highlight: range(data.currentStart, data.mid || 0),
      mark: range(data.bestStart, data.bestLength),
      vars: [
        { name: "lo", value: data.lo },
        { name: "hi", value: data.hi },
        ...(data.mid === null ? [] : [{ name: "L = mid", value: data.mid }]),
        { name: "best", value: data.bestLength ? `"${s.slice(data.bestStart, data.bestStart + data.bestLength)}"` : '""' },
      ],
      longestDupView: data,
    });
  };

  if (n < 2) {
    const data = view({ phase: "done", lo: 0, hi: 0, decision: "empty" });
    add(
      { vi: 'Chuỗi ngắn hơn 2 ký tự → return ""', en: 'String shorter than 2 → return ""' },
      { vi: "Cần ít nhất hai vị trí để một chuỗi con xuất hiện hai lần.", en: "A substring needs at least two positions to occur twice." },
      lines.done, data, true,
    );
    return { original: s, answer: "", steps };
  }

  let lo = 1;
  let hi = n - 1;
  let bestStart = -1;
  let bestLength = 0;
  let round = 0;
  const history = [];

  add(
    { vi: "Mục tiêu: binary search độ dài chuỗi con lặp", en: "Goal: binary-search the duplicate length" },
    {
      vi: "Nếu tồn tại chuỗi con lặp dài L thì mọi độ dài nhỏ hơn L cũng khả thi. Ta tìm L lớn nhất trong [1, n−1]; mỗi lần kiểm tra L bằng Rolling Hash.",
      en: "If a duplicate of length L exists, every shorter length is feasible. Find the largest L in [1, n−1], checking each L with a rolling hash.",
    },
    lines.setup, view({ lo, hi, bestStart, bestLength }),
  );

  while (lo <= hi) {
    round += 1;
    const mid = Math.floor((lo + hi) / 2);
    const roundLo = lo;
    const roundHi = hi;
    const common = () => ({
      round, lo: roundLo, hi: roundHi, mid, bestStart, bestLength,
      history: history.map((item) => ({ ...item })),
    });
    add(
      { vi: `Vòng ${round}: chọn L = ${mid}`, en: `Round ${round}: choose L = ${mid}` },
      {
        vi: `Khoảng hiện tại [${roundLo}, ${roundHi}]. Ta kiểm tra xem có hai cửa sổ độ dài ${mid} giống hệt nhau không.`,
        en: `Current range [${roundLo}, ${roundHi}]. Check whether two length-${mid} windows are identical.`,
      },
      lines.choose, view({ ...common(), phase: "choose-length" }),
    );

    let power = 1n;
    for (let index = 0; index < mid; index += 1) power = (power * base) % mod;
    let hash = 0n;
    for (let index = 0; index < mid; index += 1) hash = (hash * base + values[index]) % mod;
    const seen = new Map([[hash.toString(), [0]]]);
    const windows = [{ start: 0, text: s.slice(0, mid), hash: hash.toString(), status: "seen" }];
    add(
      { vi: `Khởi tạo hash cho "${s.slice(0, mid)}"`, en: `Initialize the hash for "${s.slice(0, mid)}"` },
      {
        vi: `Mã hóa a=1,…,z=26. Tính hash cửa sổ [0..${mid - 1}] và lưu start=0. power=base^L giúp loại ký tự bên trái khi trượt.`,
        en: `Encode a=1,…,z=26. Hash window [0..${mid - 1}] and store start=0. power=base^L removes the outgoing character when sliding.`,
      },
      lines.init,
      view({ ...common(), phase: "hash-init", currentStart: 0, currentEnd: mid - 1, currentHash: hash.toString(), power: power.toString(), windows: windows.map((item) => ({ ...item })) }),
    );

    let foundStart = -1;
    let matchedStart = -1;
    for (let start = 1; start + mid <= n; start += 1) {
      const oldHash = hash;
      const outgoing = chars[start - 1];
      const incoming = chars[start + mid - 1];
      hash = (hash * base - values[start - 1] * power + values[start + mid - 1]) % mod;
      if (hash < 0n) hash += mod;
      const key = hash.toString();
      const candidates = seen.get(key) || [];
      matchedStart = candidates.find((previous) => s.slice(previous, previous + mid) === s.slice(start, start + mid));
      const matched = matchedStart !== undefined;
      const collision = !matched && candidates.length > 0;
      const record = { start, text: s.slice(start, start + mid), hash: key, status: matched ? "match" : (collision ? "collision" : "seen") };
      windows.push(record);
      add(
        {
          vi: matched ? `Tìm thấy "${record.text}" ở hai vị trí` : `Trượt sang cửa sổ [${start}..${start + mid - 1}]`,
          en: matched ? `Found "${record.text}" at two positions` : `Slide to window [${start}..${start + mid - 1}]`,
        },
        {
          vi: matched
            ? `Hash ${key} đã có tại index ${matchedStart}. So sánh trực tiếp xác nhận s[${matchedStart}:${matchedStart + mid}] = s[${start}:${start + mid}] = "${record.text}".`
            : collision
              ? `Hash ${key} đã có nhưng chuỗi thực tế khác nhau: đây là collision, tiếp tục quét.`
              : `Bỏ '${outgoing}', nhân hash cũ với base ${base}, rồi thêm '${incoming}'. Hash ${key} chưa có nên lưu start=${start}.`,
          en: matched
            ? `Hash ${key} exists at index ${matchedStart}. Direct comparison confirms s[${matchedStart}:${matchedStart + mid}] = s[${start}:${start + mid}] = "${record.text}".`
            : collision
              ? `Hash ${key} exists but the actual strings differ: this is a collision, so keep scanning.`
              : `Remove '${outgoing}', multiply the old hash by base ${base}, then add '${incoming}'. Hash ${key} is new, so store start=${start}.`,
        },
        matched ? lines.match : lines.slide,
        view({
          ...common(), phase: matched ? "match" : "slide", currentStart: start, currentEnd: start + mid - 1,
          previousStart: matched ? matchedStart : null, currentHash: key, previousHash: oldHash.toString(),
          power: power.toString(), outgoing, incoming, windows: windows.map((item) => ({ ...item })),
          decision: matched ? "found" : (collision ? "collision" : "new-hash"),
        }),
      );
      if (matched) {
        foundStart = start;
        break;
      }
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(start);
    }

    const found = foundStart !== -1;
    if (found) {
      bestStart = foundStart;
      bestLength = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
    history.push({ round, lo: roundLo, hi: roundHi, mid, found, nextLo: lo, nextHi: hi });
    add(
      {
        vi: found ? `L=${mid} khả thi → thử dài hơn` : `L=${mid} không khả thi → thử ngắn hơn`,
        en: found ? `L=${mid} is feasible → try longer` : `L=${mid} is not feasible → try shorter`,
      },
      {
        vi: found
          ? `Đã tìm thấy "${s.slice(bestStart, bestStart + bestLength)}". Lưu làm best và đặt lo=${lo}.`
          : `Quét hết ${n - mid + 1} cửa sổ mà không có cặp giống nhau. Đặt hi=${hi}.`,
        en: found
          ? `Found "${s.slice(bestStart, bestStart + bestLength)}". Save it as best and set lo=${lo}.`
          : `Scanned all ${n - mid + 1} windows without an equal pair. Set hi=${hi}.`,
      },
      found ? lines.found : lines.miss,
      view({
        round, phase: "decision", lo, hi, mid, bestStart, bestLength,
        currentStart: foundStart, currentEnd: found ? foundStart + mid - 1 : null,
        previousStart: found ? matchedStart : null, decision: found ? "longer" : "shorter",
        windows: windows.map((item) => ({ ...item })), history: history.map((item) => ({ ...item })),
      }),
    );
  }

  const answer = bestStart === -1 ? "" : s.slice(bestStart, bestStart + bestLength);
  add(
    { vi: `Hoàn tất → return "${answer}"`, en: `Done → return "${answer}"` },
    {
      vi: answer ? `lo > hi. Chuỗi con lặp dài nhất là "${answer}", độ dài ${bestLength}; hai lần xuất hiện có thể chồng lấn.` : "Không có độ dài nào khả thi nên trả về chuỗi rỗng.",
      en: answer ? `lo > hi. The longest duplicated substring is "${answer}", length ${bestLength}; its occurrences may overlap.` : "No length is feasible, so return the empty string.",
    },
    lines.done,
    view({ round, phase: "done", lo, hi, bestStart, bestLength, currentStart: bestStart, currentEnd: bestStart >= 0 ? bestStart + bestLength - 1 : null, decision: "done", history: history.map((item) => ({ ...item })) }),
    true,
  );
  return { original: s, answer, steps };
}

function buildSteps875(input, params) {
  const parsedPiles = Array.isArray(input)
    ? [...input]
    : String(input).split(",").map((value) => Number(value.trim())).filter(Number.isFinite);
  const piles = parsedPiles.map((pile) => Math.max(1, Math.trunc(pile)));
  if (!piles.length) piles.push(1);
  const parsedHours = params && params.h !== undefined ? Number(params.h) : 8;
  const h = Number.isFinite(parsedHours) ? Math.max(piles.length, Math.trunc(parsedHours)) : 8;
  const approach = Number(params && params.approach) === 2 ? 2 : 1;
  const manualCeil = approach === 2;
  const lowerName = manualCeil ? "start" : "lo";
  const upperName = manualCeil ? "end" : "hi";
  const line = manualCeil
    ? { init: [3, 4], while: 6, mid: 7, resetHours: 9, loopPile: 11, remainder: 12, exactAdd: 13, elseBranch: 14, roundedAdd: 15, feasible: 17, moveLo: 18, decisionElse: 19, moveHi: 20, done: 22 }
    : { init: [5], while: 6, mid: 7, aggregateHours: 8, feasible: 9, moveHi: 10, decisionElse: 11, moveLo: 12, done: 13 };
  const steps = [];
  const initialLo = 1;
  const initialHi = Math.max(...piles);
  const tested = [];
  let lo = initialLo;
  let hi = initialHi;

  const breakdown = (speed) => piles.map((pile, index) => ({
    index,
    pile,
    speed,
    hours: Math.ceil(pile / speed),
    fullHours: Math.floor(pile / speed),
    remainder: pile % speed,
  }));
  const hoursNeeded = (speed) => breakdown(speed).reduce((total, item) => total + item.hours, 0);

  function addStep({
    event,
    phase,
    title,
    codeLine,
    codeLines = null,
    note,
    mid = null,
    perPile = [],
    totalHours = null,
    feasible = null,
    whileResult = null,
    previousLo = null,
    previousHi = null,
    answer = null,
    slowerHours = null,
    vars = [],
    final = false,
  }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeBlock: approach,
      codeLines: codeLines || [codeLine],
      vars,
      note,
      kokoSpeedView: {
        event,
        approach,
        phase,
        piles: [...piles],
        h,
        initialLo,
        initialHi,
        lo,
        hi,
        mid,
        perPile: perPile.map((item) => ({ ...item })),
        totalHours,
        feasible,
        whileResult,
        previousLo,
        previousHi,
        answer,
        slowerHours,
        tested: tested.map((item) => ({ ...item })),
      },
    });
  }

  addStep({
    event: "init-range",
    phase: "setup",
    title: { vi: `Tìm tốc độ nhỏ nhất trong [1, ${hi}]`, en: `Find the minimum speed in [1, ${hi}]` },
    codeLines: line.init,
    vars: [
      { name: "piles", value: `[${piles.join(", ")}]` },
      { name: "h", value: h },
      { name: lowerName, value: lo },
      { name: upperName, value: hi },
    ],
    note: {
      vi: `Tốc độ tối thiểu là 1. Tốc độ max(piles)=${hi} chắc chắn đủ vì mỗi đống mất đúng 1 giờ. Ta tìm tốc độ khả thi đầu tiên.`,
      en: `The minimum possible speed is 1. Speed max(piles)=${hi} is guaranteed to work because each pile takes one hour. Find the first feasible speed.`,
    },
  });

  while (true) {
    const canContinue = lo < hi;
    addStep({
      event: "while-check",
      phase: "range",
      title: canContinue
        ? { vi: `${lo} < ${hi} → còn nhiều hơn 1 ứng viên`, en: `${lo} < ${hi} → more than one candidate remains` }
        : { vi: `${lo} = ${hi} → đã tìm thấy tốc độ đầu tiên khả thi`, en: `${lo} = ${hi} → first feasible speed found` },
      codeLine: line.while,
      whileResult: canContinue,
      vars: [{ name: lowerName, value: lo }, { name: upperName, value: hi }, { name: `${lowerName} < ${upperName}`, value: canContinue }],
      note: canContinue
        ? { vi: `Đáp án vẫn nằm trong khoảng đóng [${lo}, ${hi}].`, en: `The answer is still inside the closed interval [${lo}, ${hi}].` }
        : { vi: `Khoảng chỉ còn một tốc độ: ${lo}. Vòng lặp kết thúc.`, en: `Only one speed remains: ${lo}. The loop stops.` },
    });
    if (!canContinue) break;

    const mid = Math.floor((lo + hi) / 2);
    addStep({
      event: "compute-mid",
      phase: "range",
      title: { vi: `Thử tốc độ mid = (${lo} + ${hi}) // 2 = ${mid}`, en: `Try speed mid = (${lo} + ${hi}) // 2 = ${mid}` },
      codeLine: line.mid,
      mid,
      vars: [{ name: lowerName, value: lo }, { name: upperName, value: hi }, { name: "mid", value: mid }],
      note: { vi: `Koko thử ăn ${mid} quả mỗi giờ.`, en: `Koko tries eating ${mid} bananas per hour.` },
    });

    const fullBreakdown = breakdown(mid);
    let perPile = [];
    let totalHours = 0;

    if (manualCeil) {
      addStep({
        event: "calculate-hours",
        phase: "hours",
        title: { vi: "Đặt hours = 0", en: "Reset hours = 0" },
        codeLine: line.resetHours,
        mid,
        perPile,
        totalHours,
        vars: [{ name: "mid", value: mid }, { name: "hours", value: totalHours }],
        note: { vi: "Mỗi lần thử một tốc độ mid mới, tính lại tổng số giờ từ 0.", en: "For each new trial speed, count the total hours again from zero." },
      });

      for (const item of fullBreakdown) {
        addStep({
          event: "calculate-hours",
          phase: "hours",
          title: { vi: `Duyệt pile = ${item.pile}`, en: `Visit pile = ${item.pile}` },
          codeLine: line.loopPile,
          mid,
          perPile,
          totalHours,
          vars: [{ name: "pile", value: item.pile }, { name: "mid", value: mid }, { name: "hours", value: totalHours }],
          note: { vi: `Kiểm tra đống ${item.pile} có chia hết cho tốc độ ${mid} hay không.`, en: `Check whether pile ${item.pile} is divisible by speed ${mid}.` },
        });

        const dividesEvenly = item.remainder === 0;
        addStep({
          event: "calculate-hours",
          phase: "hours",
          title: { vi: `${item.pile} % ${mid} = ${item.remainder} → ${dividesEvenly}`, en: `${item.pile} % ${mid} = ${item.remainder} → ${dividesEvenly}` },
          codeLine: line.remainder,
          mid,
          perPile,
          totalHours,
          vars: [
            { name: "pile", value: item.pile },
            { name: "pile % mid", value: item.remainder },
            { name: "pile % mid == 0", value: dividesEvenly },
            { name: "hours", value: totalHours },
          ],
          note: dividesEvenly
            ? { vi: `${item.pile} chia hết cho ${mid}, không cần làm tròn lên.`, en: `${item.pile} divides evenly by ${mid}, so no extra hour is needed.` }
            : { vi: `${item.pile} còn dư ${item.remainder}, cần thêm 1 giờ.`, en: `${item.pile} leaves remainder ${item.remainder}, so one extra hour is required.` },
        });

        if (!dividesEvenly) {
          addStep({
            event: "calculate-hours",
            phase: "hours",
            title: { vi: "Không chia hết → vào nhánh else", en: "Not divisible → enter else" },
            codeLine: line.elseBranch,
            mid,
            perPile,
            totalHours,
            vars: [{ name: "pile", value: item.pile }, { name: "remainder", value: item.remainder }],
            note: { vi: "Dùng thương nguyên rồi cộng thêm 1 giờ cho phần dư.", en: "Use the integer quotient, then add one hour for the remainder." },
          });
        }

        totalHours += item.hours;
        perPile = [...perPile, item];
        addStep({
          event: "calculate-hours",
          phase: "hours",
          title: dividesEvenly
            ? { vi: `hours += ${item.pile} // ${mid} = ${item.hours}`, en: `hours += ${item.pile} // ${mid} = ${item.hours}` }
            : { vi: `hours += ${item.pile} // ${mid} + 1 = ${item.hours}`, en: `hours += ${item.pile} // ${mid} + 1 = ${item.hours}` },
          codeLine: dividesEvenly ? line.exactAdd : line.roundedAdd,
          mid,
          perPile,
          totalHours,
          vars: [
            { name: "pile", value: item.pile },
            { name: "pile // mid", value: item.fullHours },
            { name: "hours added", value: item.hours },
            { name: "hours", value: totalHours },
          ],
          note: { vi: `Sau đống ${item.pile}, tổng tạm thời là ${totalHours} giờ.`, en: `After pile ${item.pile}, the running total is ${totalHours} hours.` },
        });
      }
    } else {
      perPile = fullBreakdown;
      totalHours = perPile.reduce((total, item) => total + item.hours, 0);
      addStep({
        event: "calculate-hours",
        phase: "hours",
        title: { vi: `Cộng giờ từng đống: ${perPile.map((item) => item.hours).join(" + ")} = ${totalHours}`, en: `Add hours per pile: ${perPile.map((item) => item.hours).join(" + ")} = ${totalHours}` },
        codeLine: line.aggregateHours,
        mid,
        perPile,
        totalHours,
        feasible: totalHours <= h,
        vars: [
          { name: "mid", value: mid },
          ...perPile.map((item) => ({ name: `ceil(${item.pile}/${mid})`, value: item.hours })),
          { name: "hours", value: totalHours },
        ],
        note: {
          vi: `Mỗi đống phải làm tròn lên vì Koko không chuyển phần thời gian còn dư sang đống kế tiếp. Tổng cộng cần ${totalHours} giờ.`,
          en: `Each pile rounds up because Koko cannot use leftover time on another pile. The total is ${totalHours} hours.`,
        },
      });
    }

    const feasible = totalHours <= h;
    addStep({
      event: "feasible-check",
      phase: "decision",
      title: manualCeil
        ? { vi: `${totalHours} > ${h} → ${!feasible}`, en: `${totalHours} > ${h} → ${!feasible}` }
        : { vi: `${totalHours} ${feasible ? "≤" : ">"} ${h} → ${feasible ? "kịp giờ" : "không kịp"}`, en: `${totalHours} ${feasible ? "≤" : ">"} ${h} → ${feasible ? "on time" : "too slow"}` },
      codeLine: line.feasible,
      mid,
      perPile,
      totalHours,
      feasible,
      vars: [
        { name: "hours", value: totalHours },
        { name: "h", value: h },
        { name: manualCeil ? "hours > h" : "hours <= h", value: manualCeil ? !feasible : feasible },
      ],
      note: feasible
        ? { vi: `Tốc độ ${mid} khả thi, nhưng có thể chưa nhỏ nhất. Giữ mid và thử các tốc độ chậm hơn.`, en: `Speed ${mid} is feasible, but it may not be minimal. Keep mid and try slower speeds.` }
        : { vi: `Tốc độ ${mid} quá chậm. Vì tốc độ nhỏ hơn còn tốn nhiều giờ hơn, loại toàn bộ tốc độ ≤ ${mid}.`, en: `Speed ${mid} is too slow. Smaller speeds take at least as long, so remove every speed ≤ ${mid}.` },
    });

    tested.push({ speed: mid, hours: totalHours, feasible });
    const previousLo = lo;
    const previousHi = hi;
    if (feasible) {
      if (manualCeil) {
        addStep({
          event: "else-branch",
          phase: "shrink",
          title: { vi: `${totalHours} ≤ ${h} → vào nhánh else`, en: `${totalHours} ≤ ${h} → enter else` },
          codeLine: line.decisionElse,
          mid,
          perPile,
          totalHours,
          feasible,
          previousLo,
          previousHi,
          vars: [{ name: "hours > h", value: false }, { name: "mid", value: mid }],
          note: { vi: `Tốc độ ${mid} kịp giờ, nên giữ mid bằng end = mid.`, en: `Speed ${mid} finishes on time, so keep it with end = mid.` },
        });
      }
      hi = mid;
      addStep({
        event: "move-hi",
        phase: "shrink",
        title: { vi: `Khả thi → ${upperName} = mid = ${mid}`, en: `Feasible → ${upperName} = mid = ${mid}` },
        codeLine: line.moveHi,
        mid,
        perPile,
        totalHours,
        feasible,
        previousLo,
        previousHi,
        vars: [{ name: `old ${upperName}`, value: previousHi }, { name: upperName, value: hi }, { name: lowerName, value: lo }],
        note: { vi: `Giữ ${mid} vì nó vẫn có thể là đáp án. Khoảng mới: [${lo}, ${hi}].`, en: `Keep ${mid} because it may be the answer. New interval: [${lo}, ${hi}].` },
      });
    } else {
      if (!manualCeil) {
        addStep({
          event: "else-branch",
          phase: "shrink",
          title: { vi: `${totalHours} > ${h} → đi vào nhánh else`, en: `${totalHours} > ${h} → enter the else branch` },
          codeLine: line.decisionElse,
          mid,
          perPile,
          totalHours,
          feasible,
          previousLo,
          previousHi,
          vars: [{ name: "hours <= h", value: false }, { name: "mid", value: mid }],
          note: { vi: `Điều kiện if sai nên thực hiện dòng 12.`, en: `The if condition is false, so line 12 runs next.` },
        });
      }
      lo = mid + 1;
      addStep({
        event: "move-lo",
        phase: "shrink",
        title: { vi: `Quá chậm → ${lowerName} = mid + 1 = ${lo}`, en: `Too slow → ${lowerName} = mid + 1 = ${lo}` },
        codeLine: line.moveLo,
        mid,
        perPile,
        totalHours,
        feasible,
        previousLo,
        previousHi,
        vars: [{ name: `old ${lowerName}`, value: previousLo }, { name: lowerName, value: lo }, { name: upperName, value: hi }],
        note: { vi: `Loại [${previousLo}, ${mid}]. Khoảng mới: [${lo}, ${hi}].`, en: `Remove [${previousLo}, ${mid}]. New interval: [${lo}, ${hi}].` },
      });
    }
  }

  const answer = lo;
  const answerBreakdown = breakdown(answer);
  const answerHours = hoursNeeded(answer);
  const slowerHours = answer > 1 ? hoursNeeded(answer - 1) : null;
  addStep({
    event: "done",
    phase: "done",
    title: { vi: `return ${answer} — tốc độ nhỏ nhất khả thi`, en: `return ${answer} — minimum feasible speed` },
    codeLine: line.done,
    perPile: answerBreakdown,
    totalHours: answerHours,
    feasible: true,
    answer,
    slowerHours,
    final: true,
    vars: [
      { name: lowerName, value: answer },
      { name: `hours(${lowerName})`, value: answerHours },
      ...(slowerHours === null ? [] : [{ name: `hours(${answer - 1})`, value: slowerHours }]),
      { name: "answer", value: answer },
    ],
    note: {
      vi: slowerHours === null
        ? `Tốc độ 1 cần ${answerHours} giờ ≤ ${h}; đây đã là tốc độ nhỏ nhất có thể.`
        : `Tốc độ ${answer} cần ${answerHours} giờ ≤ ${h}, còn tốc độ ${answer - 1} cần ${slowerHours} giờ > ${h}. Vì vậy ${answer} là nhỏ nhất.`,
      en: slowerHours === null
        ? `Speed 1 needs ${answerHours} hours ≤ ${h}; it is already the smallest possible speed.`
        : `Speed ${answer} needs ${answerHours} hours ≤ ${h}, while speed ${answer - 1} needs ${slowerHours} hours > ${h}. Therefore ${answer} is minimal.`,
    },
  });

  return { original: piles, answer, steps };
}

/** LeetCode 1011: Capacity To Ship Packages Within D Days. */
function buildSteps1011(input, params) {
  const parsedWeights = Array.isArray(input)
    ? [...input]
    : String(input).split(",").map((value) => Number(value.trim())).filter(Number.isFinite);
  const weights = parsedWeights.map((weight) => Math.max(1, Math.trunc(weight)));
  if (!weights.length) weights.push(1);
  const parsedDays = params && params.days !== undefined ? Number(params.days) : 5;
  const days = Number.isFinite(parsedDays)
    ? Math.min(weights.length, Math.max(1, Math.trunc(parsedDays)))
    : Math.min(weights.length, 5);
  const steps = [];
  const initialLo = Math.max(...weights);
  const initialHi = weights.reduce((sum, weight) => sum + weight, 0);
  const tested = [];
  let lo = initialLo;
  let hi = initialHi;

  function buildSchedule(capacity) {
    const schedule = [{ day: 1, load: 0, packages: [] }];
    for (let index = 0; index < weights.length; index += 1) {
      const weight = weights[index];
      let currentDay = schedule[schedule.length - 1];
      if (currentDay.load + weight > capacity) {
        currentDay = { day: schedule.length + 1, load: 0, packages: [] };
        schedule.push(currentDay);
      }
      currentDay.packages.push({ index, weight });
      currentDay.load += weight;
    }
    return schedule;
  }

  function addStep({
    event,
    phase,
    title,
    codeLine,
    note,
    mid = null,
    schedule = [],
    neededDays = null,
    feasible = null,
    whileResult = null,
    previousLo = null,
    previousHi = null,
    answer = null,
    smallerDays = null,
    vars = [],
    final = false,
  }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
      shipCapacityView: {
        event,
        phase,
        weights: [...weights],
        days,
        initialLo,
        initialHi,
        lo,
        hi,
        mid,
        schedule: schedule.map((day) => ({
          ...day,
          packages: day.packages.map((pkg) => ({ ...pkg })),
        })),
        neededDays,
        feasible,
        whileResult,
        previousLo,
        previousHi,
        answer,
        smallerDays,
        tested: tested.map((item) => ({ ...item })),
      },
    });
  }

  addStep({
    event: "init-range",
    phase: "setup",
    title: { vi: `Khoảng sức chứa: [${lo}, ${hi}]`, en: `Capacity range: [${lo}, ${hi}]` },
    codeLine: 11,
    vars: [
      { name: "weights", value: `[${weights.join(", ")}]` },
      { name: "days", value: days },
      { name: "lo = max(weights)", value: lo },
      { name: "hi = sum(weights)", value: hi },
    ],
    note: {
      vi: `Tàu phải chở được kiện nặng nhất nên lo=${lo}. Nếu sức chứa hi=${hi}, tàu chở tất cả trong đúng 1 ngày.`,
      en: `The ship must hold the heaviest package, so lo=${lo}. With capacity hi=${hi}, every package ships in one day.`,
    },
  });

  while (true) {
    const canContinue = lo < hi;
    addStep({
      event: "while-check",
      phase: "range",
      title: canContinue
        ? { vi: `${lo} < ${hi} → tiếp tục tìm`, en: `${lo} < ${hi} → continue searching` }
        : { vi: `${lo} = ${hi} → còn đúng một sức chứa`, en: `${lo} = ${hi} → one capacity remains` },
      codeLine: 12,
      whileResult: canContinue,
      vars: [{ name: "lo", value: lo }, { name: "hi", value: hi }, { name: "lo < hi", value: canContinue }],
      note: canContinue
        ? { vi: `Đáp án nằm trong khoảng đóng [${lo}, ${hi}].`, en: `The answer lies in the closed interval [${lo}, ${hi}].` }
        : { vi: `lo gặp hi tại ${lo}; vòng lặp kết thúc.`, en: `lo meets hi at ${lo}; the loop stops.` },
    });
    if (!canContinue) break;

    const mid = Math.floor((lo + hi) / 2);
    addStep({
      event: "compute-mid",
      phase: "range",
      title: { vi: `Thử capacity = (${lo} + ${hi}) // 2 = ${mid}`, en: `Try capacity = (${lo} + ${hi}) // 2 = ${mid}` },
      codeLine: 13,
      mid,
      vars: [{ name: "lo", value: lo }, { name: "hi", value: hi }, { name: "mid", value: mid }],
      note: { vi: `Mô phỏng chất hàng theo đúng thứ tự với sức chứa ${mid}.`, en: `Simulate loading packages in order with capacity ${mid}.` },
    });

    const schedule = buildSchedule(mid);
    const neededDays = schedule.length;
    const feasible = neededDays <= days;
    addStep({
      event: "calculate-days",
      phase: "simulate",
      title: { vi: `Capacity ${mid} cần ${neededDays} ngày`, en: `Capacity ${mid} needs ${neededDays} days` },
      codeLine: 14,
      mid,
      schedule,
      neededDays,
      feasible,
      vars: [
        { name: "mid", value: mid },
        ...schedule.map((day) => ({ name: `day ${day.day} load`, value: day.load })),
        { name: "needed_days", value: neededDays },
      ],
      note: {
        vi: `Duyệt từ trái sang phải. Khi kiện tiếp theo làm tải vượt ${mid}, đóng ngày hiện tại và bắt đầu ngày mới; không được đổi thứ tự hay tách kiện.`,
        en: `Scan left to right. If the next package would exceed ${mid}, close the current day and start a new one; order cannot change and packages cannot split.`,
      },
    });

    addStep({
      event: "feasible-check",
      phase: "decision",
      title: { vi: `${neededDays} ${feasible ? "≤" : ">"} ${days} ngày → ${feasible ? "chở kịp" : "không kịp"}`, en: `${neededDays} ${feasible ? "≤" : ">"} ${days} days → ${feasible ? "fits" : "too small"}` },
      codeLine: 15,
      mid,
      schedule,
      neededDays,
      feasible,
      vars: [
        { name: "needed_days", value: neededDays },
        { name: "days", value: days },
        { name: "needed_days <= days", value: feasible },
      ],
      note: feasible
        ? { vi: `Sức chứa ${mid} đủ, nhưng có thể chưa nhỏ nhất. Giữ mid và thử tàu nhỏ hơn.`, en: `Capacity ${mid} works, but may not be minimal. Keep mid and try a smaller ship.` }
        : { vi: `Sức chứa ${mid} quá nhỏ. Mọi sức chứa nhỏ hơn cũng cần ít nhất ${neededDays} ngày nên đều bị loại.`, en: `Capacity ${mid} is too small. Every smaller capacity needs at least ${neededDays} days, so all are removed.` },
    });

    tested.push({ capacity: mid, neededDays, feasible });
    const previousLo = lo;
    const previousHi = hi;
    if (feasible) {
      hi = mid;
      addStep({
        event: "move-hi",
        phase: "shrink",
        title: { vi: `Chở kịp → hi = mid = ${mid}`, en: `Fits → hi = mid = ${mid}` },
        codeLine: 16,
        mid,
        schedule,
        neededDays,
        feasible,
        previousLo,
        previousHi,
        vars: [{ name: "old hi", value: previousHi }, { name: "hi", value: hi }, { name: "lo", value: lo }],
        note: { vi: `Giữ ${mid} vì nó có thể là đáp án. Khoảng mới: [${lo}, ${hi}].`, en: `Keep ${mid} because it may be the answer. New interval: [${lo}, ${hi}].` },
      });
    } else {
      addStep({
        event: "else-branch",
        phase: "shrink",
        title: { vi: `${neededDays} > ${days} → vào nhánh else`, en: `${neededDays} > ${days} → enter else` },
        codeLine: 17,
        mid,
        schedule,
        neededDays,
        feasible,
        previousLo,
        previousHi,
        vars: [{ name: "needed_days <= days", value: false }, { name: "mid", value: mid }],
        note: { vi: `Điều kiện if sai nên tăng sức chứa tối thiểu ở dòng 18.`, en: `The if condition is false, so line 18 raises the minimum capacity.` },
      });
      lo = mid + 1;
      addStep({
        event: "move-lo",
        phase: "shrink",
        title: { vi: `Tàu quá nhỏ → lo = mid + 1 = ${lo}`, en: `Ship too small → lo = mid + 1 = ${lo}` },
        codeLine: 18,
        mid,
        schedule,
        neededDays,
        feasible,
        previousLo,
        previousHi,
        vars: [{ name: "old lo", value: previousLo }, { name: "lo", value: lo }, { name: "hi", value: hi }],
        note: { vi: `Loại [${previousLo}, ${mid}]. Khoảng mới: [${lo}, ${hi}].`, en: `Remove [${previousLo}, ${mid}]. New interval: [${lo}, ${hi}].` },
      });
    }
  }

  const answer = lo;
  const finalSchedule = buildSchedule(answer);
  const smallerDays = answer > initialLo ? buildSchedule(answer - 1).length : null;
  addStep({
    event: "done",
    phase: "done",
    title: { vi: `return ${answer} — sức chứa nhỏ nhất`, en: `return ${answer} — minimum capacity` },
    codeLine: 19,
    schedule: finalSchedule,
    neededDays: finalSchedule.length,
    feasible: true,
    answer,
    smallerDays,
    final: true,
    vars: [
      { name: "lo", value: answer },
      { name: "days_needed(lo)", value: finalSchedule.length },
      ...(smallerDays === null ? [] : [{ name: `days_needed(${answer - 1})`, value: smallerDays }]),
      { name: "answer", value: answer },
    ],
    note: {
      vi: smallerDays === null
        ? `${answer}=max(weights) là sức chứa nhỏ nhất có thể và chở xong trong ${finalSchedule.length} ngày ≤ ${days}.`
        : `Sức chứa ${answer} cần ${finalSchedule.length} ngày ≤ ${days}, còn ${answer - 1} cần ${smallerDays} ngày > ${days}. Vì vậy ${answer} là nhỏ nhất.`,
      en: smallerDays === null
        ? `${answer}=max(weights) is the smallest possible capacity and finishes in ${finalSchedule.length} days ≤ ${days}.`
        : `Capacity ${answer} needs ${finalSchedule.length} days ≤ ${days}, while ${answer - 1} needs ${smallerDays} days > ${days}. Therefore ${answer} is minimal.`,
    },
  });

  return { original: weights, answer, steps };
}

/** LeetCode 69: Sqrt(x) — binary search for floor(sqrt(x)). */
function buildSteps69(input) {
  const parsed = Number(Array.isArray(input) ? input[0] : String(input).trim());
  const x = Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
  const steps = [];

  let lo = x < 2 ? 0 : 1;
  let hi = x < 2 ? x : Math.floor(x / 2);
  const initialLo = lo;
  const initialHi = hi;

  function addStep({
    event,
    phase,
    title,
    codeLine,
    note,
    mid = null,
    square = null,
    comparison = null,
    whileResult = null,
    previousLo = null,
    previousHi = null,
    removedRange = null,
    answer = null,
    vars = [],
    final = false,
  }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
      sqrtBinaryView: {
        event,
        phase,
        x,
        initialLo,
        initialHi,
        lo,
        hi,
        mid,
        square,
        comparison,
        whileResult,
        previousLo,
        previousHi,
        removedRange: removedRange ? { ...removedRange } : null,
        answer,
      },
    });
  }

  if (x < 2) {
    addStep({
      event: "base-case",
      phase: "done",
      title: { vi: `x=${x} < 2 → return ${x}`, en: `x=${x} < 2 → return ${x}` },
      codeLine: 3,
      answer: x,
      final: true,
      vars: [{ name: "x", value: x }, { name: "answer", value: x }],
      note: {
        vi: `Với x=${x}, căn bậc hai nguyên chính là ${x}; không cần binary search.`,
        en: `For x=${x}, the integer square root is ${x}; no binary search is needed.`,
      },
    });
    return { original: x, answer: x, steps };
  }

  addStep({
    event: "init-range",
    phase: "setup",
    title: { vi: `Khởi tạo khoảng [lo, hi] = [1, ${hi}]`, en: `Initialize [lo, hi] = [1, ${hi}]` },
    codeLine: 4,
    vars: [{ name: "x", value: x }, { name: "lo", value: lo }, { name: "hi", value: hi }],
    note: {
      vi: `Vì x ≥ 2 nên floor(sqrt(x)) nằm trong [1, x // 2] = [1, ${hi}].`,
      en: `Because x ≥ 2, floor(sqrt(x)) lies in [1, x // 2] = [1, ${hi}].`,
    },
  });

  while (true) {
    const canContinue = lo <= hi;
    addStep({
      event: "while-check",
      phase: "range",
      title: canContinue
        ? { vi: `${lo} ≤ ${hi} → tiếp tục tìm`, en: `${lo} ≤ ${hi} → continue searching` }
        : { vi: `${lo} > ${hi} → dừng binary search`, en: `${lo} > ${hi} → stop binary search` },
      codeLine: 5,
      whileResult: canContinue,
      vars: [{ name: "lo", value: lo }, { name: "hi", value: hi }, { name: "lo <= hi", value: canContinue }],
      note: canContinue
        ? { vi: `Khoảng [${lo}, ${hi}] vẫn còn ứng viên.`, en: `The interval [${lo}, ${hi}] still contains candidates.` }
        : { vi: `Hai con trỏ đã giao nhau. Lúc này hi=${hi} là số nguyên lớn nhất có bình phương ≤ ${x}.`, en: `The pointers have crossed. hi=${hi} is now the largest integer whose square is ≤ ${x}.` },
    });
    if (!canContinue) break;

    const mid = Math.floor((lo + hi) / 2);
    const square = mid * mid;
    addStep({
      event: "compute-mid",
      phase: "compare",
      title: { vi: `mid = (${lo} + ${hi}) // 2 = ${mid}`, en: `mid = (${lo} + ${hi}) // 2 = ${mid}` },
      codeLine: 6,
      mid,
      square,
      vars: [
        { name: "lo", value: lo },
        { name: "hi", value: hi },
        { name: "mid", value: mid },
        { name: "mid * mid", value: square },
      ],
      note: {
        vi: `Chọn chính giữa khoảng hiện tại: mid=${mid}; tiếp theo so ${mid}²=${square} với x=${x}.`,
        en: `Choose the center of the current interval: mid=${mid}; next compare ${mid}²=${square} with x=${x}.`,
      },
    });

    const isExact = square === x;
    addStep({
      event: "exact-check",
      phase: isExact ? "done" : "compare",
      title: isExact
        ? { vi: `${mid}² = ${x} → return ${mid}`, en: `${mid}² = ${x} → return ${mid}` }
        : { vi: `${mid}² = ${square} ≠ ${x}`, en: `${mid}² = ${square} ≠ ${x}` },
      codeLine: 7,
      mid,
      square,
      comparison: isExact ? "equal" : square < x ? "less" : "greater",
      answer: isExact ? mid : null,
      final: isExact,
      vars: [
        { name: "mid", value: mid },
        { name: "mid * mid", value: square },
        { name: "mid * mid == x", value: isExact },
        ...(isExact ? [{ name: "answer", value: mid }] : []),
      ],
      note: isExact
        ? { vi: `${mid} là căn bậc hai chính xác của ${x}; hàm kết thúc ngay tại dòng 7.`, en: `${mid} is the exact square root of ${x}; the function returns immediately on line 7.` }
        : { vi: "Không bằng x nên cần kiểm tra mid² nhỏ hơn hay lớn hơn x.", en: "It is not equal to x, so determine whether mid² is below or above x." },
    });
    if (isExact) return { original: x, answer: mid, steps };

    if (square < x) {
      const previousLo = lo;
      const previousHi = hi;
      lo = mid + 1;
      addStep({
        event: "move-lo",
        phase: "shrink",
        title: { vi: `${square} < ${x} → lo = ${mid + 1}`, en: `${square} < ${x} → lo = ${mid + 1}` },
        codeLine: 8,
        mid,
        square,
        comparison: "less",
        previousLo,
        previousHi,
        removedRange: { from: previousLo, to: mid, side: "left" },
        vars: [
          { name: "mid * mid < x", value: true },
          { name: "old lo", value: previousLo },
          { name: "lo", value: lo },
          { name: "hi", value: hi },
        ],
        note: {
          vi: `${mid}² còn nhỏ hơn x. Các số ≤ ${mid} không thể cho đáp án lớn hơn, nên tiếp tục ở nửa phải [${lo}, ${hi}].`,
          en: `${mid}² is below x. Values ≤ ${mid} cannot produce a larger answer, so continue in the right half [${lo}, ${hi}].`,
        },
      });
    } else {
      const previousLo = lo;
      const previousHi = hi;
      hi = mid - 1;
      addStep({
        event: "move-hi",
        phase: "shrink",
        title: { vi: `${square} > ${x} → hi = ${mid - 1}`, en: `${square} > ${x} → hi = ${mid - 1}` },
        codeLine: 9,
        mid,
        square,
        comparison: "greater",
        previousLo,
        previousHi,
        removedRange: { from: mid, to: previousHi, side: "right" },
        vars: [
          { name: "mid * mid < x", value: false },
          { name: "lo", value: lo },
          { name: "old hi", value: previousHi },
          { name: "hi", value: hi },
        ],
        note: {
          vi: `${mid}² lớn hơn x. mid và mọi số bên phải đều quá lớn, nên tiếp tục ở nửa trái [${lo}, ${hi}].`,
          en: `${mid}² is above x. mid and every value to its right are too large, so continue in the left half [${lo}, ${hi}].`,
        },
      });
    }
  }

  addStep({
    event: "done-floor",
    phase: "done",
    title: { vi: `return hi → ${hi}`, en: `return hi → ${hi}` },
    codeLine: 10,
    answer: hi,
    final: true,
    vars: [
      { name: "lo", value: lo },
      { name: "hi", value: hi },
      { name: `${hi}²`, value: hi * hi },
      { name: `${hi + 1}²`, value: (hi + 1) * (hi + 1) },
      { name: "answer", value: hi },
    ],
    note: {
      vi: `${hi}²=${hi * hi} ≤ ${x} < ${(hi + 1) * (hi + 1)}=(${hi + 1})², nên floor(sqrt(${x}))=${hi}.`,
      en: `${hi}²=${hi * hi} ≤ ${x} < ${(hi + 1) * (hi + 1)}=(${hi + 1})², so floor(sqrt(${x}))=${hi}.`,
    },
  });
  return { original: x, answer: hi, steps };
}

/** LeetCode 278: First Bad Version — binary search for the leftmost bad. */
function buildSteps278(input) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  const firstBad = 4; // must match FIRST_BAD baked into the executed code
  const steps = [];
  const versions = Array.from({ length: n }, (_, i) => i + 1);
  const sub = versions.map((v) => (v >= firstBad ? "bad" : "ok"));
  const barArr = () => versions.map((v) => (v >= firstBad ? 2 : 1)); // bad bars are taller
  const idx = (v) => v - 1;
  let low = 1, high = n;
  steps.push({
    title: { vi: "low = 1, high = n", en: "low = 1, high = n" },
    arr: barArr(), sub, highlight: [], mark: [], codeLines: [3, 4, 8],
    vars: [{ name: "n", value: n }, { name: "low", value: low }, { name: "high", value: high }, { name: "(ẩn) first bad", value: firstBad }],
    note: { vi: `Có n=${n} phiên bản; từ phiên bản xấu ĐẦU TIÊN trở đi đều xấu. Dùng nhị phân tìm phiên bản xấu đầu tiên. (Ngưỡng ẩn = ${firstBad}, cột "bad" cao hơn.)`, en: `n=${n} versions; every version from the FIRST bad one onward is bad. Binary search for that first bad version. (Hidden threshold = ${firstBad}; "bad" bars are taller.)` },
  });
  let guard = 0;
  while (low < high && guard++ < n + 2) {
    const mid = low + Math.floor((high - low) / 2);
    const bad = mid >= firstBad;
    steps.push({
      title: { vi: `mid=${mid}, isBadVersion=${bad}`, en: `mid=${mid}, isBadVersion=${bad}` },
      arr: barArr(), sub, highlight: [idx(mid)], mark: [idx(low), idx(high)], codeLines: bad ? [9, 10, 11, 12] : [9, 10, 11, 13, 14],
      vars: [{ name: "low", value: low }, { name: "high", value: high }, { name: "mid", value: mid }, { name: "isBadVersion(mid)", value: bad }],
      note: {
        vi: bad
          ? `mid=${mid} là XẤU → phiên bản xấu đầu tiên là ${mid} hoặc ở bên trái. high = mid = ${mid}.`
          : `mid=${mid} là TỐT → phiên bản xấu đầu tiên nằm bên phải. low = mid+1 = ${mid + 1}.`,
        en: bad
          ? `mid=${mid} is BAD → the first bad version is ${mid} or to its left. high = mid = ${mid}.`
          : `mid=${mid} is GOOD → the first bad version is to the right. low = mid+1 = ${mid + 1}.`,
      },
    });
    if (bad) high = mid; else low = mid + 1;
  }
  steps.push({
    title: { vi: `Phiên bản xấu đầu tiên = ${low}`, en: `First bad version = ${low}` },
    arr: barArr(), sub, highlight: [idx(low)], mark: [idx(low)], final: true, codeLines: [9, 15],
    vars: [{ name: "answer", value: low }],
    note: { vi: `low == high == ${low} → phiên bản xấu đầu tiên là ${low}.`, en: `low == high == ${low} → the first bad version is ${low}.` },
  });
  return { original: n, answer: low, steps };
}

module.exports = {
  278: {
    id: 278, difficulty: "easy", slug: "first-bad-version",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "First Bad Version", en: "First Bad Version" },
    titleVi: { vi: "Phiên bản lỗi đầu tiên", en: "First bad version" },
    statement: { vi: "Các phiên bản 1..n; từ phiên bản xấu đầu tiên trở đi đều xấu. Dùng API isBadVersion để tìm phiên bản xấu đầu tiên với ít lần gọi nhất. Nhập n. (Ngưỡng lỗi ẩn cố định = 4.)", en: "Versions 1..n; every version from the first bad one onward is bad. Use the isBadVersion API to find the first bad version with the fewest calls. Enter n. (Hidden bad threshold fixed at 4.)" },
    defaultInput: [5], inputKind: "positive", inputLabel: { vi: "n", en: "n" }, singleInput: true, maxInput: 40, extraParams: [],
    approach: [
      { vi: "Nhị phân trên khoảng [1, n], tìm biên trái của vùng 'xấu'.", en: "Binary search over [1, n] for the left boundary of the 'bad' region." },
      { vi: "Nếu mid xấu → thu hẹp về trái (high = mid).", en: "If mid is bad → shrink left (high = mid)." },
      { vi: "Nếu mid tốt → tìm bên phải (low = mid + 1).", en: "If mid is good → search right (low = mid + 1)." },
    ],
    complexity: { time: "O(log n)", space: "O(1)", note: { vi: "Chỉ O(log n) lần gọi isBadVersion.", en: "Only O(log n) isBadVersion calls." } },
    code: [
      "FIRST_BAD = 4",
      "",
      "def isBadVersion(version):",
      "    return version >= FIRST_BAD",
      "",
      "class Solution:",
      "    def firstBadVersion(self, n):",
      "        low, high = 1, n",
      "        while low < high:",
      "            mid = low + (high - low) // 2",
      "            if isBadVersion(mid):",
      "                high = mid",
      "            else:",
      "                low = mid + 1",
      "        return low",
    ],
    builder: buildSteps278,
  },
  69: {
    id: 69,
    difficulty: "easy",
    slug: "sqrtx",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Sqrt(x)", en: "Sqrt(x)" },
    titleVi: { vi: "Căn bậc hai nguyên (binary search)", en: "Integer square root (binary search)" },
    statement: { vi: "Tính floor(sqrt(x)) không dùng hàm căn có sẵn. Nhập x.", en: "Compute floor(sqrt(x)) without built-in sqrt. Enter x." },
    defaultInput: [8],
    inputKind: "nonneg", inputLabel: { vi: "x", en: "x" }, extraParams: [],
    approach: [
      { vi: "Tìm m lớn nhất mà m² ≤ x — tính đơn điệu → binary search.", en: "Find the largest m with m² ≤ x — monotonic → binary search." },
      { vi: "mid² == x → trả về mid.", en: "mid² == x → return mid." },
      { vi: "mid² < x → lo=mid+1 (giữ mid làm ứng viên); mid² > x → hi=mid-1.", en: "mid² < x → lo=mid+1 (keep mid as candidate); mid² > x → hi=mid-1." },
      { vi: "Kết quả là hi (floor).", en: "Answer is hi (floor)." },
    ],
    complexity: { time: "O(log x)", space: "O(1)", note: { vi: "Chia đôi khoảng mỗi bước.", en: "Halve the range each step." } },
    code: ["class Solution:", "    def mySqrt(self, x):", "        if x < 2: return x", "        lo, hi = 1, x // 2", "        while lo <= hi:", "            mid = (lo + hi) // 2", "            if mid*mid == x: return mid", "            if mid*mid < x: lo = mid + 1", "            else: hi = mid - 1", "        return hi"],
    builder: buildSteps69,
  },
  875: {
    id: 875,
    difficulty: "medium",
    slug: "koko-eating-bananas",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Koko Eating Bananas", en: "Koko Eating Bananas" },
    titleVi: { vi: "Koko ăn chuối (binary search trên đáp án)", en: "Koko eating bananas (binary search on answer)" },
    statement: {
      vi: "Cho các đống chuối piles và số giờ h. Koko ăn với tốc độ v quả/giờ, mỗi giờ ăn 1 đống (dư thì bỏ). Tìm tốc độ v NHỎ NHẤT để ăn hết trong h giờ. Nhập piles; h trong tham số.",
      en: "Given banana piles and h hours, Koko eats at speed v per hour, one pile per hour (leftover wasted). Find the SMALLEST speed v to finish within h hours. Enter piles; h as a parameter.",
    },
    defaultInput: [3, 6, 7, 11],
    inputKind: "integer",
    inputLabel: { vi: "piles", en: "piles" },
    extraParams: [
      { key: "h", label: { vi: "h (số giờ)", en: "h (hours)" }, default: 8 },
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: math.ceil", en: "Approach 1: math.ceil" } },
          { value: "2", label: { vi: "Cách 2: % và //", en: "Approach 2: % and //" } },
        ],
      },
    ],
    approach: [
      { vi: "Số giờ cần giảm dần khi tốc độ tăng → tính đơn điệu → binary search trên tốc độ.", en: "Hours needed decrease as speed increases → monotonic → binary search on speed." },
      { vi: "Khoảng tìm: [1, max(piles)]. hours(v) = Σ ceil(pile/v).", en: "Range: [1, max(piles)]. hours(v) = Σ ceil(pile/v)." },
      { vi: "Cách 1 dùng math.ceil. Cách 2 tự làm tròn lên: chia hết thì pile // mid, có dư thì pile // mid + 1.", en: "Approach 1 uses math.ceil. Approach 2 rounds up manually: pile // mid when divisible, otherwise pile // mid + 1." },
      { vi: "Cách 1: hours ≤ h thì hi=mid, ngược lại lo=mid+1. Cách 2: hours > h thì start=mid+1, ngược lại end=mid.", en: "Approach 1: hours ≤ h sets hi=mid, otherwise lo=mid+1. Approach 2: hours > h sets start=mid+1, otherwise end=mid." },
      { vi: "Kết quả là lo (Cách 1) hoặc start (Cách 2) — tốc độ nhỏ nhất khả thi.", en: "The answer is lo (Approach 1) or start (Approach 2) — the smallest feasible speed." },
    ],
    complexity: { time: "O(n log(max pile))", space: "O(1)", note: { vi: "Mỗi lần thử tốc độ tính giờ O(n).", en: "Each speed check computes hours in O(n)." } },
    codeLabel: { vi: "Cách 1: math.ceil", en: "Approach 1: math.ceil" },
    code2Label: { vi: "Cách 2: % và //", en: "Approach 2: % and //" },
    code: [
      "import math",
      "",
      "class Solution:",
      "    def minEatingSpeed(self, piles, h):",
      "        lo, hi = 1, max(piles)",
      "        while lo < hi:",
      "            mid = (lo + hi) // 2",
      "            hours = sum(math.ceil(p / mid) for p in piles)",
      "            if hours <= h:",
      "                hi = mid",
      "            else:",
      "                lo = mid + 1",
      "        return lo",
    ],
    code2: [
      "class Solution:",
      "    def minEatingSpeed(self, piles, h):",
      "        start = 1",
      "        end = max(piles)",
      "",
      "        while start < end:",
      "            mid = (start + end) // 2",
      "",
      "            hours = 0",
      "",
      "            for pile in piles:",
      "                if pile % mid == 0:",
      "                    hours += pile // mid",
      "                else:",
      "                    hours += pile // mid + 1",
      "",
      "            if hours > h:",
      "                start = mid + 1",
      "            else:",
      "                end = mid",
      "",
      "        return start",
    ],
    builder: buildSteps875,
  },
  1011: {
    id: 1011,
    difficulty: "medium",
    slug: "capacity-to-ship-packages-within-d-days",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Capacity To Ship Packages Within D Days", en: "Capacity To Ship Packages Within D Days" },
    titleVi: { vi: "Sức chứa nhỏ nhất để chở hàng trong D ngày", en: "Minimum ship capacity within D days" },
    statement: {
      vi: "Các kiện hàng phải được chở theo đúng thứ tự trong weights. Mỗi ngày chất liên tiếp các kiện mà tổng không vượt sức chứa tàu. Tìm sức chứa nhỏ nhất để chở hết trong số ngày cho trước.",
      en: "Packages must be shipped in the given weights order. Each day loads consecutive packages without exceeding the ship capacity. Find the minimum capacity that ships everything within the given days.",
    },
    defaultInput: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    inputKind: "positive",
    inputLabel: { vi: "weights", en: "weights" },
    extraParams: [
      { key: "days", label: { vi: "days (số ngày)", en: "days" }, default: 5 },
    ],
    approach: [
      { vi: "Binary search trên sức chứa. Cận dưới là max(weights); cận trên là sum(weights).", en: "Binary search the capacity. The lower bound is max(weights); the upper bound is sum(weights)." },
      { vi: "Với một capacity, duyệt kiện hàng theo thứ tự và bắt đầu ngày mới khi kiện tiếp theo làm vượt capacity.", en: "For a capacity, scan packages in order and start a new day when the next package would exceed it." },
      { vi: "needed_days ≤ days: capacity đủ, giữ mid bằng hi=mid để thử nhỏ hơn.", en: "needed_days ≤ days: the capacity works, keep mid with hi=mid and try smaller." },
      { vi: "needed_days > days: tàu quá nhỏ, loại mọi capacity ≤ mid bằng lo=mid+1.", en: "needed_days > days: the ship is too small, remove every capacity ≤ mid with lo=mid+1." },
    ],
    complexity: {
      time: "O(n log(sum(weights)))",
      space: "O(1)",
      note: { vi: "Mỗi lần thử capacity cần một lượt O(n) để đếm số ngày.", en: "Each capacity check scans all packages in O(n) to count days." },
    },
    code: [
      "class Solution:",
      "    def shipWithinDays(self, weights, days):",
      "        def count_days(capacity):",
      "            used_days, load = 1, 0",
      "            for weight in weights:",
      "                if load + weight > capacity:",
      "                    used_days += 1",
      "                    load = 0",
      "                load += weight",
      "            return used_days",
      "        lo, hi = max(weights), sum(weights)",
      "        while lo < hi:",
      "            mid = (lo + hi) // 2",
      "            needed_days = count_days(mid)",
      "            if needed_days <= days:",
      "                hi = mid",
      "            else:",
      "                lo = mid + 1",
      "        return lo",
    ],
    builder: buildSteps1011,
  },
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
      "        n = len(s)",
      "        base, mod = 26, 1_000_000_007",
      "        values = [ord(char) - ord('a') + 1 for char in s]",
      "        def search(length):",
      "            power = pow(base, length, mod)",
      "            current = 0",
      "            for value in values[:length]:",
      "                current = (current * base + value) % mod",
      "            seen = {current: [0]}",
      "            for start in range(1, n - length + 1):",
      "                current = (current * base - values[start - 1] * power + values[start + length - 1]) % mod",
      "                for previous in seen.get(current, []):",
      "                    if s[previous:previous + length] == s[start:start + length]:",
      "                        return start",
      "                seen.setdefault(current, []).append(start)",
      "            return -1",
      "        lo, hi = 1, len(s) - 1",
      "        best_start, best_length = -1, 0",
      "        while lo <= hi:",
      "            length = (lo + hi) // 2",
      "            duplicate_start = search(length)",
      "            if duplicate_start != -1:",
      "                best_start, best_length = duplicate_start, length",
      "                lo = length + 1",
      "            else:",
      "                hi = length - 1",
      "        return s[best_start:best_start + best_length]",
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
  2226: {
    id: 2226,
    difficulty: "medium",
    slug: "maximum-candies-allocated-to-k-children",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Maximum Candies Allocated to K Children", en: "Maximum Candies Allocated to K Children" },
    titleVi: { vi: "Số kẹo tối đa chia cho k trẻ em", en: "Maximum candies each of k children can get" },
    statement: {
      vi:
        "Cho mảng candies gồm m đống kẹo và số nguyên k (số trẻ em). Mỗi trẻ chỉ được nhận kẹo từ MỘT đống " +
        "duy nhất, và mọi trẻ phải nhận SỐ KẸO BẰNG NHAU. Tìm số kẹo TỐI ĐA mỗi trẻ có thể nhận được.",
      en:
        "Given an array candies of m piles and an integer k (number of children), each child gets candies from " +
        "a SINGLE pile only, and every child must receive the SAME amount. Find the MAXIMUM candies each child " +
        "can get.",
    },
    defaultInput: [5, 8, 6],
    inputKind: "positive",
    inputLabel: { vi: "candies (đống kẹo)", en: "candies (piles)" },
    extraParams: [{ key: "k", label: { vi: "k (số trẻ em)", en: "k (number of children)" }, default: 3 }],
    approach: [
      { vi: "Nếu tổng kẹo < k → không đủ để mỗi trẻ có ít nhất 1 kẹo → trả về 0.", en: "If the total candies < k → not enough for at least 1 candy each → return 0." },
      { vi: "Binary search trên ĐÁP ÁN (số kẹo/trẻ): nằm trong [1, max(candies)].", en: "Binary search on the ANSWER (candies per child): it lies in [1, max(candies)]." },
      { vi: "Với mid, mỗi đống c chia được c // mid trẻ. Tổng số trẻ được chia = sum(c // mid).", en: "For a given mid, each pile c can feed c // mid children. Total children fed = sum(c // mid)." },
      { vi: "Nếu tổng ≥ k → mid khả thi, thử LỚN HƠN (left=mid+1). Nếu < k → mid quá lớn (right=mid-1).", en: "If the total ≥ k → mid is feasible, try LARGER (left=mid+1). If < k → mid is too big (right=mid-1)." },
    ],
    complexity: {
      time: "O(n·log(max(candies)))",
      space: "O(1)",
      note: {
        vi: "Binary search O(log(max)) lần, mỗi lần tính tổng trẻ được chia tốn O(n).",
        en: "O(log(max)) binary search iterations, each computing the fed-children total in O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def maximumCandies(self, candies, k):",
      "        if sum(candies) < k:",
      "            return 0",
      "        left, right = 1, max(candies)",
      "        while left <= right:",
      "            mid = (left + right) // 2",
      "            count = sum(c // mid for c in candies)",
      "            if count >= k:",
      "                left = mid + 1",
      "            else:",
      "                right = mid - 1",
      "        return right",
    ],
    builder: buildSteps2226,
  },
  __meta: {
    order: [69, 410, 4, 33, 34, 911, 875, 1011, 1044],
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

/**
 * LeetCode 153: Find Minimum in Rotated Sorted Array (no duplicates).
 * Binary search over the closed range [left, right], comparing nums[mid]
 * against nums[right] to decide which half can still contain the minimum.
 * Since all elements are distinct, there is no tie case (unlike bai 154).
 */
function buildSteps153(nums, params) {
  const steps = [];
  let left = 0;
  let right = nums.length - 1;

  function labels(l, r, mid) {
    return nums.map((_, index) => {
      const tags = [];
      if (index === l) tags.push("L");
      if (index === mid) tags.push("M");
      if (index === r) tags.push("R");
      return tags.length ? `[${index}] ${tags.join("/")}` : `[${index}]`;
    });
  }

  function activeRange(l, r) {
    return l <= r ? Array.from({ length: r - l + 1 }, (_, index) => l + index) : [];
  }

  function pushStep({
    title,
    note,
    mid,
    codeLines,
    final = false,
    answer,
    phase = "range",
    keptHalf = null,
    eliminated = [],
    comparison = null,
  }) {
    const vars = [
      { name: "left (L)", value: left },
      { name: "right (R)", value: right },
    ];
    if (Number.isInteger(mid)) {
      vars.splice(2, 0,
        { name: "mid (M)", value: mid },
        { name: "nums[M]", value: nums[mid] },
        { name: "nums[R]", value: nums[right] },
      );
    }
    if (answer !== undefined) vars.push({ name: "answer", value: answer });

    steps.push({
      title,
      arr: [...nums],
      findMinRotatedView: {
        nums: [...nums],
        left,
        right,
        mid: Number.isInteger(mid) ? mid : null,
        phase,
        keptHalf,
        eliminated,
        comparison,
        duplicateShrink: false,
        minIndex: final ? left : null,
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
      vi: `Tìm phần tử nhỏ nhất trong mảng đã xoay (mọi phần tử phân biệt). L và R bao quanh toàn bộ mảng.`,
      en: `Find the minimum element in the rotated array (all elements distinct). L and R bound the entire array.`,
    },
    codeLines: [3],
    comparison: {
      vi: `Vùng ứng viên ban đầu: [0, ${nums.length - 1}]`,
      en: `Initial candidate range: [0, ${nums.length - 1}]`,
    },
  });

  while (left < right) {
    pushStep({
      title: { vi: `while L < R → ${left} < ${right} → True`, en: `while L < R → ${left} < ${right} → True` },
      note: {
        vi: "Vùng tìm kiếm còn nhiều hơn 1 phần tử, nên bắt đầu một vòng lặp mới. M chưa được gán ở bước này.",
        en: "The search range has more than one candidate, so begin a new loop iteration. M is not assigned at this step.",
      },
      codeLines: [4],
      phase: "range",
      comparison: {
        vi: `L=${left} < R=${right} → tiếp tục; M chưa được gán`,
        en: `L=${left} < R=${right} → continue; M is not assigned yet`,
      },
    });

    const mid = Math.floor((left + right) / 2);
    pushStep({
      title: { vi: `M = (L + R) // 2 = ${mid}`, en: `M = (L + R) // 2 = ${mid}` },
      note: {
        vi: `Xét nums[${mid}]=${nums[mid]} ở giữa vùng [${left}, ${right}], sẽ so sánh với nums[R]=${nums[right]}.`,
        en: `Inspect nums[${mid}]=${nums[mid]} in the middle of [${left}, ${right}], to be compared with nums[R]=${nums[right]}.`,
      },
      mid,
      codeLines: [5],
      phase: "mid",
      comparison: {
        vi: `So sánh nums[M]=${nums[mid]} với nums[R]=${nums[right]}`,
        en: `Compare nums[M]=${nums[mid]} with nums[R]=${nums[right]}`,
      },
    });

    if (nums[mid] > nums[right]) {
      pushStep({
        title: { vi: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → True`, en: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → True` },
        note: {
          vi: `nums[M]=${nums[mid]} lớn hơn nums[R]=${nums[right]}, nghĩa là điểm xoay (min) nằm bên PHẢI của mid.`,
          en: `nums[M]=${nums[mid]} is greater than nums[R]=${nums[right]}, so the pivot (min) lies to the RIGHT of mid.`,
        },
        mid,
        codeLines: [6],
        phase: "sorted",
        comparison: { vi: `${nums[mid]} > ${nums[right]} → min nằm bên phải M`, en: `${nums[mid]} > ${nums[right]} → min is to the right of M` },
      });

      const previousLeft = left;
      left = mid + 1;
      pushStep({
        title: { vi: `left = M + 1 = ${left}`, en: `left = M + 1 = ${left}` },
        note: {
          vi: `Loại đoạn [${previousLeft}, ${mid}] vì chắc chắn không chứa min (mid không thể là min do nums[M] > nums[R]).`,
          en: `Discard [${previousLeft}, ${mid}] since it cannot contain the minimum (mid can't be the min because nums[M] > nums[R]).`,
        },
        mid,
        codeLines: [7],
        phase: "narrow",
        keptHalf: "right",
        eliminated: Array.from({ length: mid - previousLeft + 1 }, (_, index) => previousLeft + index),
        comparison: { vi: `${nums[mid]} > ${nums[right]} → left = M + 1`, en: `${nums[mid]} > ${nums[right]} → left = M + 1` },
      });
    } else {
      pushStep({
        title: { vi: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → False`, en: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → False` },
        note: {
          vi: `nums[M]=${nums[mid]} nhỏ hơn nums[R]=${nums[right]} (không thể bằng vì mọi phần tử phân biệt), đi vào else ở dòng 8.`,
          en: `nums[M]=${nums[mid]} is less than nums[R]=${nums[right]} (can't be equal since all elements are distinct), enter the else on line 8.`,
        },
        mid,
        codeLines: [6],
        phase: "sorted",
        comparison: { vi: `${nums[mid]} > ${nums[right]} → False`, en: `${nums[mid]} > ${nums[right]} → False` },
      });

      const previousRight = right;
      right = mid;
      pushStep({
        title: { vi: `right = M = ${right}`, en: `right = M = ${right}` },
        note: {
          vi: `nums[M]=${nums[mid]} < nums[R]=${nums[previousRight]}, nên M có thể chính là min hoặc min nằm bên trái M → GIỮ M lại, loại [${mid + 1}, ${previousRight}].`,
          en: `nums[M]=${nums[mid]} < nums[R]=${nums[previousRight]}, so M could be the min or the min is to its left → KEEP M, discard [${mid + 1}, ${previousRight}].`,
        },
        mid,
        codeLines: [9],
        phase: "narrow",
        keptHalf: "left",
        eliminated: previousRight > mid ? Array.from({ length: previousRight - mid }, (_, index) => mid + 1 + index) : [],
        comparison: { vi: `${nums[mid]} < ${nums[right]} → right = M`, en: `${nums[mid]} < ${nums[right]} → right = M` },
      });
    }
  }

  pushStep({
    title: { vi: `L == R == ${left} → return nums[${left}] = ${nums[left]}`, en: `L == R == ${left} → return nums[${left}] = ${nums[left]}` },
    note: {
      vi: `Vùng tìm kiếm chỉ còn 1 phần tử tại index ${left}. Đó chính là phần tử nhỏ nhất = ${nums[left]}.`,
      en: `The search range has narrowed to a single element at index ${left}. That is the minimum = ${nums[left]}.`,
    },
    codeLines: [10],
    final: true,
    answer: nums[left],
    phase: "found",
    comparison: { vi: `L = R = ${left} → dừng vòng lặp`, en: `L = R = ${left} → loop ends` },
  });

  return { original: [...nums], answer: nums[left], steps };
}

/**
 * LeetCode 154: Find Minimum in Rotated Sorted Array II.
 * Binary search over the closed range [left, right], always comparing
 * nums[mid] against nums[right] to decide which half can still contain the
 * minimum. When nums[mid] == nums[right] we cannot tell which side holds the
 * minimum (duplicates), so we shrink right by 1 instead of halving - this is
 * what makes worst case O(n) when the whole array is one repeated value.
 */
function buildSteps154(nums, params) {
  const steps = [];
  let left = 0;
  let right = nums.length - 1;

  function labels(l, r, mid) {
    return nums.map((_, index) => {
      const tags = [];
      if (index === l) tags.push("L");
      if (index === mid) tags.push("M");
      if (index === r) tags.push("R");
      return tags.length ? `[${index}] ${tags.join("/")}` : `[${index}]`;
    });
  }

  function activeRange(l, r) {
    return l <= r ? Array.from({ length: r - l + 1 }, (_, index) => l + index) : [];
  }

  function pushStep({
    title,
    note,
    mid,
    codeLines,
    final = false,
    answer,
    phase = "range",
    keptHalf = null,
    eliminated = [],
    comparison = null,
    duplicateShrink = false,
  }) {
    const vars = [
      { name: "left (L)", value: left },
      { name: "right (R)", value: right },
    ];
    if (Number.isInteger(mid)) {
      vars.splice(2, 0,
        { name: "mid (M)", value: mid },
        { name: "nums[M]", value: nums[mid] },
        { name: "nums[R]", value: nums[right] },
      );
    }
    if (answer !== undefined) vars.push({ name: "answer", value: answer });

    steps.push({
      title,
      arr: [...nums],
      findMinRotatedView: {
        nums: [...nums],
        left,
        right,
        mid: Number.isInteger(mid) ? mid : null,
        phase,
        keptHalf,
        eliminated,
        comparison,
        duplicateShrink,
        minIndex: final ? left : null,
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
      vi: `Tìm phần tử nhỏ nhất trong mảng đã xoay (có thể có phần tử trùng). L và R bao quanh toàn bộ mảng.`,
      en: `Find the minimum element in the rotated array (duplicates allowed). L and R bound the entire array.`,
    },
    codeLines: [3],
    comparison: {
      vi: `Vùng ứng viên ban đầu: [0, ${nums.length - 1}]`,
      en: `Initial candidate range: [0, ${nums.length - 1}]`,
    },
  });

  while (left < right) {
    pushStep({
      title: { vi: `while L < R → ${left} < ${right} → True`, en: `while L < R → ${left} < ${right} → True` },
      note: {
        vi: "Vùng tìm kiếm còn nhiều hơn 1 phần tử, nên bắt đầu một vòng lặp mới. M chưa được gán ở bước này.",
        en: "The search range has more than one candidate, so begin a new loop iteration. M is not assigned at this step.",
      },
      codeLines: [4],
      phase: "range",
      comparison: {
        vi: `L=${left} < R=${right} → tiếp tục; M chưa được gán`,
        en: `L=${left} < R=${right} → continue; M is not assigned yet`,
      },
    });

    const mid = Math.floor((left + right) / 2);
    pushStep({
      title: { vi: `M = (L + R) // 2 = ${mid}`, en: `M = (L + R) // 2 = ${mid}` },
      note: {
        vi: `Xét nums[${mid}]=${nums[mid]} ở giữa vùng [${left}, ${right}], sẽ so sánh với nums[R]=${nums[right]}.`,
        en: `Inspect nums[${mid}]=${nums[mid]} in the middle of [${left}, ${right}], to be compared with nums[R]=${nums[right]}.`,
      },
      mid,
      codeLines: [5],
      phase: "mid",
      comparison: {
        vi: `So sánh nums[M]=${nums[mid]} với nums[R]=${nums[right]}`,
        en: `Compare nums[M]=${nums[mid]} with nums[R]=${nums[right]}`,
      },
    });

    if (nums[mid] > nums[right]) {
      pushStep({
        title: { vi: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → True`, en: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → True` },
        note: {
          vi: `nums[M]=${nums[mid]} lớn hơn nums[R]=${nums[right]}, nghĩa là điểm xoay (min) nằm bên PHẢI của mid.`,
          en: `nums[M]=${nums[mid]} is greater than nums[R]=${nums[right]}, so the pivot (min) lies to the RIGHT of mid.`,
        },
        mid,
        codeLines: [6],
        phase: "sorted",
        comparison: { vi: `${nums[mid]} > ${nums[right]} → min nằm bên phải M`, en: `${nums[mid]} > ${nums[right]} → min is to the right of M` },
      });

      const previousLeft = left;
      left = mid + 1;
      pushStep({
        title: { vi: `left = M + 1 = ${left}`, en: `left = M + 1 = ${left}` },
        note: {
          vi: `Loại đoạn [${previousLeft}, ${mid}] vì chắc chắn không chứa min (mid không thể là min do nums[M] > nums[R]).`,
          en: `Discard [${previousLeft}, ${mid}] since it cannot contain the minimum (mid can't be the min because nums[M] > nums[R]).`,
        },
        mid,
        codeLines: [7],
        phase: "narrow",
        keptHalf: "right",
        eliminated: Array.from({ length: mid - previousLeft + 1 }, (_, index) => previousLeft + index),
        comparison: { vi: `${nums[mid]} > ${nums[right]} → left = M + 1`, en: `${nums[mid]} > ${nums[right]} → left = M + 1` },
      });
    } else if (nums[mid] < nums[right]) {
      pushStep({
        title: { vi: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → False`, en: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → False` },
        note: {
          vi: `nums[M]=${nums[mid]} không lớn hơn nums[R]=${nums[right]}, đi sang elif ở dòng 8.`,
          en: `nums[M]=${nums[mid]} is not greater than nums[R]=${nums[right]}, move to the elif on line 8.`,
        },
        mid,
        codeLines: [6],
        phase: "sorted",
        comparison: { vi: `${nums[mid]} > ${nums[right]} → False`, en: `${nums[mid]} > ${nums[right]} → False` },
      });

      pushStep({
        title: { vi: `nums[M] < nums[R] → ${nums[mid]} < ${nums[right]} → True`, en: `nums[M] < nums[R] → ${nums[mid]} < ${nums[right]} → True` },
        note: {
          vi: `nums[M]=${nums[mid]} nhỏ hơn nums[R]=${nums[right]}, nghĩa là M có thể chính là min hoặc min nằm bên TRÁI của M (không loại M).`,
          en: `nums[M]=${nums[mid]} is less than nums[R]=${nums[right]}, so M itself could be the min, or the min lies to its LEFT (M is not discarded).`,
        },
        mid,
        codeLines: [8],
        phase: "sorted",
        comparison: { vi: `${nums[mid]} < ${nums[right]} → min ở M hoặc bên trái M`, en: `${nums[mid]} < ${nums[right]} → min is at M or to its left` },
      });

      const previousRight = right;
      right = mid;
      pushStep({
        title: { vi: `right = M = ${right}`, en: `right = M = ${right}` },
        note: {
          vi: `Loại đoạn [${mid + 1}, ${previousRight}] vì mid=${mid} vẫn có thể là min nên được GIỮ LẠI.`,
          en: `Discard [${mid + 1}, ${previousRight}] since mid=${mid} might still be the min, so it is KEPT.`,
        },
        mid,
        codeLines: [9],
        phase: "narrow",
        keptHalf: "left",
        eliminated: previousRight > mid ? Array.from({ length: previousRight - mid }, (_, index) => mid + 1 + index) : [],
        comparison: { vi: `${nums[mid]} < ${nums[right]} → right = M`, en: `${nums[mid]} < ${nums[right]} → right = M` },
      });
    } else {
      pushStep({
        title: { vi: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → False`, en: `nums[M] > nums[R] → ${nums[mid]} > ${nums[right]} → False` },
        note: {
          vi: `nums[M]=${nums[mid]} không lớn hơn nums[R]=${nums[right]}, đi sang elif ở dòng 8.`,
          en: `nums[M]=${nums[mid]} is not greater than nums[R]=${nums[right]}, move to the elif on line 8.`,
        },
        mid,
        codeLines: [6],
        phase: "sorted",
        comparison: { vi: `${nums[mid]} > ${nums[right]} → False`, en: `${nums[mid]} > ${nums[right]} → False` },
      });

      pushStep({
        title: { vi: `nums[M] < nums[R] → ${nums[mid]} < ${nums[right]} → False`, en: `nums[M] < nums[R] → ${nums[mid]} < ${nums[right]} → False` },
        note: {
          vi: `nums[M]=${nums[mid]} bằng nums[R]=${nums[right]}, đi vào else ở dòng 10: không biết min nằm nửa nào.`,
          en: `nums[M]=${nums[mid]} equals nums[R]=${nums[right]}, enter the else on line 10: we can't tell which half holds the min.`,
        },
        mid,
        codeLines: [8],
        phase: "sorted",
        comparison: { vi: `${nums[mid]} < ${nums[right]} → False`, en: `${nums[mid]} < ${nums[right]} → False` },
        duplicateShrink: true,
      });

      const previousRight = right;
      right -= 1;
      pushStep({
        title: { vi: `nums[M] == nums[R] → right -= 1 → right = ${right}`, en: `nums[M] == nums[R] → right -= 1 → right = ${right}` },
        note: {
          vi: `nums[M]=nums[R]=${nums[mid]}: có phần tử trùng nên không thể xác định min ở nửa trái hay phải. ` +
            `Ta chỉ AN TOÀN loại bỏ chính nums[R] (vì nums[M] cũng bằng giá trị đó nên min vẫn còn trong vùng còn lại).`,
          en: `nums[M]=nums[R]=${nums[mid]}: duplicates make it impossible to tell which half holds the min. ` +
            `We can only SAFELY discard nums[R] itself (since nums[M] equals it too, the min is still present in what remains).`,
        },
        mid,
        codeLines: [11],
        phase: "narrow",
        keptHalf: "left",
        eliminated: [previousRight],
        duplicateShrink: true,
        comparison: { vi: `${nums[mid]} == ${nums[previousRight]} → right -= 1 (chỉ loại 1 phần tử)`, en: `${nums[mid]} == ${nums[previousRight]} → right -= 1 (discard only 1 element)` },
      });
    }
  }

  pushStep({
    title: { vi: `L == R == ${left} → return nums[${left}] = ${nums[left]}`, en: `L == R == ${left} → return nums[${left}] = ${nums[left]}` },
    note: {
      vi: `Vùng tìm kiếm chỉ còn 1 phần tử tại index ${left}. Đó chính là phần tử nhỏ nhất = ${nums[left]}.`,
      en: `The search range has narrowed to a single element at index ${left}. That is the minimum = ${nums[left]}.`,
    },
    codeLines: [12],
    final: true,
    answer: nums[left],
    phase: "found",
    comparison: { vi: `L = R = ${left} → dừng vòng lặp`, en: `L = R = ${left} → loop ends` },
  });

  return { original: [...nums], answer: nums[left], steps };
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
  153: {
    id: 153,
    difficulty: "medium",
    slug: "find-minimum-in-rotated-sorted-array",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Find Minimum in Rotated Sorted Array", en: "Find Minimum in Rotated Sorted Array" },
    titleVi: { vi: "Tìm phần tử nhỏ nhất trong mảng xoay", en: "Find the minimum in a rotated sorted array" },
    statement: {
      vi:
        "Mảng nums gồm các phần tử phân biệt, ban đầu tăng dần, rồi bị xoay tại một pivot chưa biết. " +
        "Tìm phần tử nhỏ nhất trong mảng đã xoay.",
      en:
        "An array nums of distinct elements, originally sorted in ascending order, is rotated at an unknown " +
        "pivot. Find the minimum element in the rotated array.",
    },
    defaultInput: [3, 4, 5, 1, 2],
    inputKind: "integer",
    inputLabel: { vi: "nums (mảng đã xoay, phân biệt)", en: "nums (rotated array, distinct)" },
    approach: [
      { vi: "Binary search với vùng đóng [left, right], luôn so sánh nums[mid] với nums[right].", en: "Binary search over the closed range [left, right], always comparing nums[mid] with nums[right]." },
      { vi: "Nếu nums[mid] > nums[right]: điểm xoay (min) nằm bên phải mid → left = mid + 1.", en: "If nums[mid] > nums[right]: the pivot (min) is to the right of mid → left = mid + 1." },
      { vi: "Ngược lại (nums[mid] < nums[right], không thể bằng vì phân biệt): mid có thể chính là min hoặc min nằm bên trái → right = mid.", en: "Otherwise (nums[mid] < nums[right], can't be equal since elements are distinct): mid could be the min, or the min is to its left → right = mid." },
      { vi: "Vòng lặp kết thúc khi left == right, đó chính là vị trí phần tử nhỏ nhất.", en: "The loop ends when left == right, which is the position of the minimum element." },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Mỗi vòng lặp luôn loại được đúng một nửa vùng tìm kiếm vì không có phần tử trùng.",
        en: "Each iteration always discards exactly half of the search range since there are no duplicates.",
      },
    },
    code: [
      "class Solution:",
      "    def findMin(self, nums):",
      "        left, right = 0, len(nums) - 1",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if nums[mid] > nums[right]:",
      "                left = mid + 1",
      "            else:",
      "                right = mid",
      "        return nums[left]",
    ],
    builder: buildSteps153,
  },
  154: {
    id: 154,
    difficulty: "hard",
    slug: "find-minimum-in-rotated-sorted-array-ii",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Find Minimum in Rotated Sorted Array II", en: "Find Minimum in Rotated Sorted Array II" },
    titleVi: { vi: "Tìm phần tử nhỏ nhất trong mảng xoay (có phần tử trùng)", en: "Find the minimum in a rotated sorted array with duplicates" },
    statement: {
      vi:
        "Mảng nums ban đầu tăng dần (không nghiêm ngặt, có thể trùng), rồi bị xoay tại một pivot chưa biết. " +
        "Tìm phần tử nhỏ nhất trong mảng đã xoay.",
      en:
        "An array nums, originally sorted in non-decreasing order (duplicates allowed), is rotated at an unknown " +
        "pivot. Find the minimum element in the rotated array.",
    },
    defaultInput: [2, 2, 2, 0, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums (mảng đã xoay, có thể trùng)", en: "nums (rotated array, duplicates allowed)" },
    approach: [
      { vi: "Binary search với vùng đóng [left, right], luôn so sánh nums[mid] với nums[right].", en: "Binary search over the closed range [left, right], always comparing nums[mid] with nums[right]." },
      { vi: "Nếu nums[mid] > nums[right]: điểm xoay (min) nằm bên phải mid → left = mid + 1.", en: "If nums[mid] > nums[right]: the pivot (min) is to the right of mid → left = mid + 1." },
      { vi: "Nếu nums[mid] < nums[right]: mid có thể chính là min hoặc min nằm bên trái → right = mid.", en: "If nums[mid] < nums[right]: mid could be the min, or the min is to its left → right = mid." },
      { vi: "Nếu nums[mid] == nums[right]: không thể biết min ở nửa nào → right -= 1 để loại bỏ 1 phần tử trùng chắc chắn không mất min.", en: "If nums[mid] == nums[right]: we can't tell which half holds the min → right -= 1 to safely discard one duplicate without losing the minimum." },
      { vi: "Vòng lặp kết thúc khi left == right, đó chính là vị trí phần tử nhỏ nhất.", en: "The loop ends when left == right, which is the position of the minimum element." },
    ],
    complexity: {
      time: "O(log n) trung bình, O(n) trường hợp xấu nhất (toàn phần tử trùng)",
      space: "O(1)",
      note: {
        vi: "Nhánh right -= 1 chỉ loại 1 phần tử mỗi lần nên khi mảng có rất nhiều phần tử trùng (VD toàn số giống nhau), độ phức tạp suy biến về O(n).",
        en: "The right -= 1 branch only discards one element at a time, so when the array has many duplicates (e.g. all equal), complexity degrades to O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def findMin(self, nums):",
      "        left, right = 0, len(nums) - 1",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if nums[mid] > nums[right]:",
      "                left = mid + 1",
      "            elif nums[mid] < nums[right]:",
      "                right = mid",
      "            else:",
      "                right -= 1",
      "        return nums[left]",
    ],
    builder: buildSteps154,
  },
});

// ─── 1095: Find in Mountain Array ───
// Faithful LINE-BY-LINE trace of the three binary searches shown in the UI.
// Phase 1 climbs to the peak (L6–L13), then search() runs on the ascending
// half and, if needed, the descending half (L14–L23). Every arr[...] read is
// counted as a get() because the real problem charges per API access.
function buildSteps1095(input, params = {}) {
  const nums = (Array.isArray(input) ? input : parseIntegerList(input)).map(Number);
  const target = Number(params.target ?? 3);
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 30 || !nums.every(Number.isFinite)) {
    throw new Error("Use a mountain array with 3 to 30 integers.");
  }
  let peakIndex = 0;
  while (peakIndex + 1 < nums.length && nums[peakIndex] < nums[peakIndex + 1]) peakIndex += 1;
  if (peakIndex === 0 || peakIndex === nums.length - 1) {
    throw new Error("Values must strictly rise to one peak, then strictly fall.");
  }
  for (let k = 1; k < nums.length; k++) {
    if (k < peakIndex && nums[k - 1] >= nums[k]) throw new Error("Values must strictly rise to one peak, then strictly fall.");
    if (k > peakIndex && nums[k - 1] <= nums[k]) throw new Error("Values must strictly rise to one peak, then strictly fall.");
  }

  const steps = [];
  let gets = 0;
  const probed = new Set();

  function snapshot(line, phase, lo, hi, mid, found, title, note, final = false, extraVars = []) {
    steps.push({
      title,
      note,
      final,
      arr: [],
      sub: [],
      highlight: mid != null && mid >= 0 ? [mid] : [],
      mark: found != null && found >= 0 ? [found] : [],
      codeLines: Array.isArray(line) ? line : [line],
      vars: [
        { name: "lo", value: lo },
        { name: "hi", value: hi },
        ...(mid != null && mid >= 0 ? [{ name: "mid", value: mid }, { name: "arr[mid]", value: nums[mid] }] : []),
        ...extraVars,
        { name: "target", value: target },
        { name: "gets()", value: gets },
        ...(final ? [{ name: "result", value: found }] : []),
      ],
      mountain1095View: {
        nums,
        target,
        phase,
        lo,
        hi,
        mid,
        peak: peakIndex,
        found,
        gets,
        probed: [...probed],
        answer: final ? found : null,
      },
    });
  }

  // ── Phase 1: find the peak ──
  let lo = 0;
  let hi = nums.length - 1;
  snapshot(6, "peak", lo, hi, null, null, {
    vi: `lo=0, hi=${hi}`,
    en: `lo=0, hi=${hi}`,
  }, {
    vi: "Bước 1 tìm ĐỈNH: so sánh arr[mid] với arr[mid+1] để biết dốc đang đi lên hay đi xuống.",
    en: "Step 1 finds the PEAK: compare arr[mid] with arr[mid+1] to learn whether the slope still rises.",
  });

  while (lo < hi) {
    snapshot(7, "peak", lo, hi, null, null, {
      vi: `while lo < hi: ${lo} < ${hi} → True`,
      en: `while lo < hi: ${lo} < ${hi} → True`,
    }, {
      vi: "Cửa sổ chưa thu về một điểm nên tiếp tục chia đôi.",
      en: "The window has not collapsed to one index, so keep halving.",
    });
    const mid = Math.floor((lo + hi) / 2);
    gets += 2;
    probed.add(mid);
    probed.add(mid + 1);
    snapshot([8, 9], "peak", lo, hi, mid, null, {
      vi: `mid = (${lo} + ${hi}) // 2 = ${mid}`,
      en: `mid = (${lo} + ${hi}) // 2 = ${mid}`,
    }, {
      vi: `Đọc arr[${mid}]=${nums[mid]} và arr[${mid + 1}]=${nums[mid + 1]} — mỗi lần đọc tốn một lượt get().`,
      en: `Reads arr[${mid}]=${nums[mid]} and arr[${mid + 1}]=${nums[mid + 1]} — every read costs one get().`,
    });
    if (nums[mid] < nums[mid + 1]) {
      lo = mid + 1;
      snapshot(10, "peak", lo, hi, mid, null, {
        vi: `${nums[mid]} < ${nums[mid + 1]} → đang lên dốc, lo = ${lo}`,
        en: `${nums[mid]} < ${nums[mid + 1]} → still rising, lo = ${lo}`,
      }, {
        vi: "Vẫn đang tăng nghĩa là đỉnh nằm BÊN PHẢI mid (mid có thể là chính nó).",
        en: "Still increasing means the peak lies RIGHT of mid (mid itself could be it).",
      });
    } else {
      hi = mid;
      snapshot(12, "peak", lo, hi, mid, null, {
        vi: `${nums[mid]} ≥ ${nums[mid + 1]} → đã qua đỉnh, hi = ${hi}`,
        en: `${nums[mid]} ≥ ${nums[mid + 1]} → past the peak, hi = ${hi}`,
      }, {
        vi: "Giảm hoặc bằng tại mid nghĩa là đỉnh ở mid hoặc bên trái — giữ mid trong cửa sổ.",
        en: "Falling at mid means the peak is mid or left of it — keep mid inside the window.",
      });
    }
  }
  snapshot(7, "peak-exit", lo, hi, null, null, {
    vi: `while: ${lo} < ${hi} → False`,
    en: `while: ${lo} < ${hi} → False`,
  }, {
    vi: "lo và hi hội tụ tại một chỉ số duy nhất.",
    en: "lo and hi converged onto a single index.",
  });
  const peak = lo;
  snapshot(13, "peak-found", peak, peak, peak, null, {
    vi: `peak = ${peak} (arr[${peak}] = ${nums[peak]})`,
    en: `peak = ${peak} (arr[${peak}] = ${nums[peak]})`,
  }, {
    vi: `[0…peak] tăng dần, [peak…n-1] giảm dần — hai mảng đơn điệu sẵn sàng cho binary search.`,
    en: `[0…peak] ascends and [peak…n-1] descends — two monotonic halves ready for binary search.`,
  });

  // ── def search(lo, hi, ascending): L14–L21 ──
  function search(startLo, startHi, ascending, labelVi, labelEn) {
    let sLo = startLo;
    let sHi = startHi;
    snapshot(22, ascending ? "asc" : "desc", sLo, sHi, null, null, {
      vi: `${labelVi}: search(${sLo}, ${sHi}, ${ascending})`,
      en: `${labelEn}: search(${sLo}, ${sHi}, ${ascending})`,
    }, {
      vi: `Binary search trên nửa ${ascending ? "TĂNG" : "GIẢM"} [${sLo}…${sHi}]. Điều kiện di chuyển phụ thuộc tham số ascending.`,
      en: `Binary search over the ${ascending ? "ASCENDING" : "DESCENDING"} half [${sLo}…${sHi}]. The move condition flips with the ascending flag.`,
    });
    while (sLo <= sHi) {
      snapshot(15, ascending ? "asc" : "desc", sLo, sHi, null, null, {
        vi: `while lo <= hi: ${sLo} <= ${sHi} → True`,
        en: `while lo <= hi: ${sLo} <= ${sHi} → True`,
      }, {
        vi: "Cửa sổ còn ít nhất một phần tử chưa loại.",
        en: "At least one candidate remains in the window.",
      });
      const mid = Math.floor((sLo + sHi) / 2);
      gets += 1;
      probed.add(mid);
      snapshot([16, 17], ascending ? "asc" : "desc", sLo, sHi, mid, null, {
        vi: `mid = ${mid}, arr[mid] = ${nums[mid]}`,
        en: `mid = ${mid}, arr[mid] = ${nums[mid]}`,
      }, {
        vi: "Một lượt get() để lấy giá trị tại mid.",
        en: "One get() call fetches the value at mid.",
      });
      if (nums[mid] === target) {
        snapshot(18, ascending ? "asc" : "desc", sLo, sHi, mid, mid, {
          vi: `arr[${mid}] == ${target} → TÌM THẤY`,
          en: `arr[${mid}] == ${target} → FOUND`,
        }, {
          vi: ascending
            ? "Nửa tăng xét trước nên đây chắc chắn là index NHỎ NHẤT chứa target."
            : "Chỉ đến được nửa giảm khi nửa tăng không có target.",
          en: ascending
            ? "The ascending half runs first, so this is guaranteed to be the SMALLEST index holding target."
            : "The descending half only runs when the ascending half missed.",
        });
        return mid;
      }
      const goRight = ascending ? nums[mid] < target : nums[mid] > target;
      if (goRight) {
        sLo = mid + 1;
        snapshot(19, ascending ? "asc" : "desc", sLo, sHi, mid, null, {
          vi: ascending
            ? `${nums[mid]} < ${target} → sang phải, lo = ${sLo}`
            : `${nums[mid]} > ${target} → sang phải, lo = ${sLo}`,
          en: ascending
            ? `${nums[mid]} < ${target} → go right, lo = ${sLo}`
            : `${nums[mid]} > ${target} → go right, lo = ${sLo}`,
        }, {
          vi: "(v<t)==ascending đúng khi cần tiến về phía giá trị lớn hơn trên nửa này.",
          en: "(v<t)==ascending holds exactly when this half must move toward larger values.",
        });
      } else {
        sHi = mid - 1;
        snapshot(20, ascending ? "asc" : "desc", sLo, sHi, mid, null, {
          vi: ascending
            ? `${nums[mid]} > ${target} → sang trái, hi = ${sHi}`
            : `${nums[mid]} < ${target} → sang trái, hi = ${sHi}`,
          en: ascending
            ? `${nums[mid]} > ${target} → go left, hi = ${sHi}`
            : `${nums[mid]} < ${target} → go left, hi = ${sHi}`,
        }, {
          vi: "Trên nửa giảm, nhỏ hơn target đồng nghĩa đi SANG PHẢI mới gần target hơn — điều kiện đảo lại so với nửa tăng.",
          en: "On the descending half being below target means moving RIGHT gets closer — the comparison flips versus the ascending half.",
        });
      }
    }
    snapshot(21, ascending ? "asc-exit" : "desc-exit", sLo, sHi, null, -1, {
      vi: `while → False: return -1 (${labelEn})`,
      en: `while → False: return -1 (${labelEn})`,
    }, {
      vi: `Không tìm thấy ${target} trong [${startLo}…${startHi}].`,
      en: `${target} does not exist in [${startLo}…${startHi}].`,
    });
    return -1;
  }

  const left = search(0, peak, true, "Nửa tăng", "ascending half");
  if (left !== -1) {
    snapshot(23, "done", 0, nums.length - 1, left, left, {
      vi: `Kết quả: ${target} nằm tại index ${left}`,
      en: `Result: ${target} sits at index ${left}`,
    }, {
      vi: `Nửa tăng đã trả lời nên KHÔNG cần tốn thêm lượt get() nào trên nửa giảm. Tổng số lần đọc: ${gets}.`,
      en: `The ascending half already answered, so NO further get() calls are spent on the descending half. Total reads: ${gets}.`,
    }, true);
    return { steps, answer: left };
  }

  snapshot(23, "call-desc", 0, nums.length - 1, null, null, {
    vi: "found = -1 → thử nửa giảm",
    en: "found = -1 → try the descending half",
  }, {
    vi: "Toán tử ba ngôi tại dòng 23 chuyển sang search(peak+1, n-1, False).",
    en: "The line-23 ternary now falls through to search(peak+1, n-1, False).",
  });
  const right = search(peak + 1, nums.length - 1, false, "Nửa giảm", "descending half");
  snapshot(23, "done", 0, nums.length - 1, right !== -1 ? right : null, right, {
    vi: right === -1
      ? `Kết quả: ${target} không có trong mảng`
      : `Kết quả: ${target} nằm tại index ${right}`,
    en: right === -1
      ? `Result: ${target} is not in the array`
      : `Result: ${target} sits at index ${right}`,
  }, {
    vi: `Tổng cộng ${gets} lượt get() — vẫn là O(log n).`,
    en: `${gets} get() calls in total — still O(log n).`,
  }, true);

  return { steps, answer: right };
}

Object.assign(module.exports, {
  1095: {
    id: 1095, difficulty: "hard", slug: "find-in-mountain-array", category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Find in Mountain Array", en: "Find in Mountain Array" },
    titleVi: { vi: "Tìm trong Mountain Array", en: "Find in Mountain Array" },
    statement: { vi: "Mảng tăng nghiêm ngặt đến một đỉnh rồi giảm nghiêm ngặt. Tìm index của target bằng số lần truy cập thấp.", en: "The array strictly increases to one peak then strictly decreases. Find the target index with few accesses." },
    defaultInput: [1, 2, 3, 4, 5, 3, 1], inputKind: "integer", inputLabel: { vi: "mountain array", en: "mountain array" }, extraParams: [{ key: "target", label: { vi: "target", en: "target" }, default: 3 }],
    approach: [{ vi: "Binary search đỉnh, sau đó tìm target trên nửa tăng và (nếu cần) nửa giảm với điều kiện so sánh đảo lại.", en: "Binary-search the peak, then search the increasing half and, if needed, the decreasing half with reversed comparisons." }],
    complexity: { time: "O(log n)", space: "O(1)", note: { vi: "Ba lần binary search vẫn là O(log n).", en: "Three binary searches are still O(log n)." } },
    code: ["class Solution:", "    def findInMountainArray(self, target, mountain_arr):", "        n = mountain_arr.length()", "        def get(i):", "            return mountain_arr.get(i)", "        lo, hi = 0, n - 1", "        while lo < hi:", "            mid = (lo + hi) // 2", "            if get(mid) < get(mid + 1):", "                lo = mid + 1", "            else:", "                hi = mid", "        peak = lo", "        def search(lo, hi, ascending):", "            while lo <= hi:", "                mid = (lo + hi) // 2", "                value = get(mid)", "                if value == target: return mid", "                if (value < target) == ascending: lo = mid + 1", "                else: hi = mid - 1", "            return -1", "        found = search(0, peak, True)", "        return found if found != -1 else search(peak + 1, n - 1, False)"],
    liveArgs: (input, params) => [Number(params.target), Array.isArray(input) ? input : parseIntegerList(input)],
    builder: buildSteps1095,
  },
});

// ─── Inclusion–Exclusion + Binary Search learning set ───
const IE_MAX_INPUT = 1000000;
const IE_MAX_VALUE = 1000000000000;

function iePositive(value, name, max = IE_MAX_INPUT) {
  const number = Array.isArray(value) ? Number(value[0]) : Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > max) {
    throw new Error(`${name} must be an integer from 1 to ${max} for this visualization`);
  }
  return number;
}

function ieGcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function ieLcm(a, b, cap = IE_MAX_VALUE) {
  const value = (a / ieGcd(a, b)) * b;
  return value > cap ? cap : value;
}

function ieBitCount(mask) {
  let count = 0;
  while (mask) { count += mask & 1; mask >>= 1; }
  return count;
}

function ieTwoTerms(x, a, b) {
  const lcm = ieLcm(a, b);
  const terms = [
    { sign: "+", label: `⌊x/${a}⌋`, value: Math.floor(x / a), divisor: a },
    { sign: "+", label: `⌊x/${b}⌋`, value: Math.floor(x / b), divisor: b },
    { sign: "−", label: `⌊x/lcm(${a},${b})⌋`, value: Math.floor(x / lcm), divisor: lcm },
  ];
  return { count: terms[0].value + terms[1].value - terms[2].value, terms, formula: `count(x) = ⌊x/${a}⌋ + ⌊x/${b}⌋ − ⌊x/${lcm}⌋` };
}

function ieThreeTerms(x, a, b, c) {
  const ab = ieLcm(a, b);
  const ac = ieLcm(a, c);
  const bc = ieLcm(b, c);
  const abc = ieLcm(ab, c);
  const terms = [
    { sign: "+", label: `⌊x/${a}⌋`, value: Math.floor(x / a), divisor: a },
    { sign: "+", label: `⌊x/${b}⌋`, value: Math.floor(x / b), divisor: b },
    { sign: "+", label: `⌊x/${c}⌋`, value: Math.floor(x / c), divisor: c },
    { sign: "−", label: `⌊x/${ab}⌋`, value: Math.floor(x / ab), divisor: ab },
    { sign: "−", label: `⌊x/${ac}⌋`, value: Math.floor(x / ac), divisor: ac },
    { sign: "−", label: `⌊x/${bc}⌋`, value: Math.floor(x / bc), divisor: bc },
    { sign: "+", label: `⌊x/${abc}⌋`, value: Math.floor(x / abc), divisor: abc },
  ];
  const count = terms.reduce((sum, term) => sum + (term.sign === "+" ? term.value : -term.value), 0);
  return { count, terms, formula: `A + B + C − AB − AC − BC + ABC` };
}

function ieCoinTerms(x, coins) {
  const terms = [];
  let count = 0;
  for (let mask = 1; mask < (1 << coins.length); mask++) {
    const selected = coins.filter((_, index) => mask & (1 << index));
    const lcm = selected.reduce((current, coin) => ieLcm(current, coin), 1);
    const sign = ieBitCount(mask) % 2 === 1 ? "+" : "−";
    const value = Math.floor(x / lcm);
    terms.push({ sign, label: selected.join("·"), value, divisor: lcm, members: selected });
    count += sign === "+" ? value : -value;
  }
  return { count, terms, formula: "Σ single − Σ pairs + Σ triples − …" };
}

function buildIeBinarySearch({ input, target, targetLabel, divisors, kind, formula, intro, codeLines, high, countAt, answerTransform = (value) => value }) {
  const steps = [];
  const history = [];
  let lo = 1;
  let hi = high;
  let answer = null;

  function snapshot({ title, note, phase, event, mid = null, current = null, final = false, vars = [] }) {
    steps.push({
      title, note, codeLines: codeLines[event] || [], vars, final, arr: [], sub: [], highlight: [], mark: [],
      multiplesIeView: {
        mode: "binary", kind, target, targetLabel, divisors: [...divisors], formula,
        intro, phase, event, lo, hi, mid, current: current ? { ...current, terms: (current.terms || []).map((term) => ({ ...term })) } : null,
        history: history.map((entry) => ({ ...entry })), answer,
      },
    });
  }

  snapshot({
    title: { vi: "Ý tưởng: đếm bao hàm–loại trừ rồi binary search", en: "Idea: count with inclusion–exclusion, then binary search" },
    note: intro,
    phase: "intro", event: "intro",
  });
  snapshot({
    title: { vi: `Khoảng đáp án [1, ${hi}]`, en: `Answer range [1, ${hi}]` },
    note: { vi: `Nếu count(x) đạt mục tiêu ${targetLabel}, mọi số lớn hơn cũng đạt. Tính đơn điệu này cho phép binary search biên trái.`, en: `If count(x) reaches target ${targetLabel}, every larger number also reaches it. This monotonicity lets us binary-search the left boundary.` },
    phase: "init", event: "init", vars: [{ name: "target", value: targetLabel }, { name: "hi", value: hi }],
  });
  while (lo < hi) {
    const beforeLo = lo;
    const beforeHi = hi;
    const mid = Math.floor((lo + hi) / 2);
    const current = countAt(mid);
    const passed = Boolean(current.ok);
    history.push({ lo: beforeLo, hi: beforeHi, mid, count: current.count, label: current.label || String(current.count), passed });
    snapshot({
      title: { vi: `Đếm tại x = ${mid}: ${current.label || current.count}`, en: `Count at x = ${mid}: ${current.label || current.count}` },
      note: current.note,
      phase: "count", event: "count", mid, current,
      vars: [{ name: "lo, hi", value: `[${beforeLo}, ${beforeHi}]` }, { name: "mid", value: mid }, { name: "count(mid)", value: current.label || current.count }],
    });
    if (passed) hi = mid;
    else lo = mid + 1;
    snapshot({
      title: passed
        ? { vi: `Đủ điều kiện → hi = ${hi}`, en: `Condition holds → hi = ${hi}` }
        : { vi: `Chưa đủ → lo = ${lo}`, en: `Not enough → lo = ${lo}` },
      note: passed
        ? { vi: `${mid} có thể là đáp án nhưng ta thử nhỏ hơn để tìm giá trị NHỎ NHẤT thỏa điều kiện.`, en: `${mid} can be the answer, but search smaller values for the MINIMUM that works.` }
        : { vi: `${mid} quá nhỏ, nên mọi x ≤ ${mid} đều bị loại.`, en: `${mid} is too small, so every x ≤ ${mid} is eliminated.` },
      phase: "move", event: "move", mid, current,
      vars: [{ name: "new range", value: `[${lo}, ${hi}]` }],
    });
  }
  answer = answerTransform(lo);
  const finalCurrent = countAt(lo);
  snapshot({
    title: { vi: `lo = hi = ${lo} → đáp án ${answer}`, en: `lo = hi = ${lo} → answer ${answer}` },
    note: { vi: `Đây là số nhỏ nhất đạt điều kiện: x=${lo} đạt, còn x=${lo - 1} không đạt (nếu x>1).`, en: `This is the smallest value that works: x=${lo} works, while x=${lo - 1} does not (when x>1).` },
    phase: "done", event: "answer", mid: lo, current: finalCurrent, final: true,
    vars: [{ name: "answer", value: answer }],
  });
  return { input, answer, steps };
}

function buildSteps2652(input) {
  const n = iePositive(input, "n", 50);
  const divisors = [3, 5, 7];
  const steps = [];
  let sum = 0;
  const included = new Array(n + 1).fill(false);
  function snapshot({ title, note, event, index = null, final = false }) {
    steps.push({
      title, note, codeLines: event === "intro" ? [1, 2] : event === "init" ? [3] : event === "check" ? [4, 5] : event === "add" ? [6, 7] : [8],
      vars: [{ name: "sum", value: sum }, ...(index === null ? [] : [{ name: "i", value: index }])], final, arr: [], sub: [], highlight: [], mark: [],
      multiplesIeView: { mode: "sum", kind: "sum-multiples", divisors, target: n, targetLabel: `n = ${n}`, phase: event, event, scanIndex: index, included: [...included], sum, answer: final ? sum : null,
        formula: "i % 3 == 0 OR i % 5 == 0 OR i % 7 == 0", history: [], current: null, lo: null, hi: null, mid: null },
    });
  }
  snapshot({ title: { vi: "Ý tưởng: OR nghĩa là lấy hợp các tập bội số", en: "Idea: OR means take the union of multiple sets" }, note: { vi: "Một số chỉ được cộng MỘT lần, dù nó chia hết cho nhiều hơn một trong 3, 5, 7.", en: "A number is added only ONCE, even if it is divisible by more than one of 3, 5, and 7." }, event: "intro" });
  snapshot({ title: { vi: "sum = 0", en: "sum = 0" }, note: { vi: `Duyệt các số từ 1 đến ${n}.`, en: `Scan integers from 1 through ${n}.` }, event: "init" });
  for (let value = 1; value <= n; value++) {
    const matches = divisors.filter((divisor) => value % divisor === 0);
    snapshot({ title: { vi: `Kiểm tra ${value}`, en: `Check ${value}` }, note: matches.length ? { vi: `${value} chia hết cho ${matches.join(" hoặc ")} → sẽ được cộng.`, en: `${value} is divisible by ${matches.join(" or ")} → add it.` } : { vi: `${value} không chia hết cho 3, 5, 7 → bỏ qua.`, en: `${value} is not divisible by 3, 5, or 7 → skip.` }, event: "check", index: value });
    if (!matches.length) continue;
    included[value] = true;
    sum += value;
    snapshot({ title: { vi: `sum += ${value} → ${sum}`, en: `sum += ${value} → ${sum}` }, note: { vi: "OR chỉ quyết định có cộng hay không; số này không bị cộng lặp lại.", en: "OR only decides whether to add; this number is never added twice." }, event: "add", index: value });
  }
  snapshot({ title: { vi: `Trả về ${sum}`, en: `Return ${sum}` }, note: { vi: `Tổng các bội số của 3 hoặc 5 hoặc 7 không vượt quá ${n}.`, en: `Sum of multiples of 3 or 5 or 7 not exceeding ${n}.` }, event: "answer", final: true });
  return { input, answer: sum, steps };
}

function buildSteps878(input, params = {}) {
  const n = iePositive(input, "n");
  const a = iePositive(params.a, "a");
  const b = iePositive(params.b, "b");
  const high = n * Math.min(a, b);
  if (high > IE_MAX_VALUE) throw new Error("answer range is too large for this visualization");
  const lcm = ieLcm(a, b);
  return buildIeBinarySearch({
    input, target: n, targetLabel: `n = ${n}`, divisors: [a, b], kind: "nth-magical", high,
    formula: `count(x) = ⌊x/${a}⌋ + ⌊x/${b}⌋ − ⌊x/${lcm}⌋`,
    intro: { vi: "Các số magical là hợp của bội số a và b. Cộng hai tập sẽ đếm trùng bội chung, nên trừ đi bội của LCM(a,b).", en: "Magical numbers are the union of multiples of a and b. Adding both sets double-counts common multiples, so subtract multiples of LCM(a,b)." },
    codeLines: { intro: [1, 2], init: [3, 7], count: [4, 5, 8, 9], move: [8, 9, 10, 11], answer: [12] },
    countAt: (x) => { const data = ieTwoTerms(x, a, b); return { ...data, ok: data.count >= n, label: `${data.count} ${data.count >= n ? "≥" : "<"} ${n}`, note: { vi: `count(${x}) = ${data.count}. ${data.count >= n ? "Đã có ít nhất n magical numbers." : "Chưa đủ n magical numbers."}`, en: `count(${x}) = ${data.count}. ${data.count >= n ? "There are at least n magical numbers." : "There are not yet n magical numbers."}` } }; },
    answerTransform: (value) => value % 1000000007,
  });
}

function buildSteps1201(input, params = {}) {
  const n = iePositive(input, "n");
  const a = iePositive(params.a, "a");
  const b = iePositive(params.b, "b");
  const c = iePositive(params.c, "c");
  const high = n * Math.min(a, b, c);
  if (high > IE_MAX_VALUE) throw new Error("answer range is too large for this visualization");
  return buildIeBinarySearch({
    input, target: n, targetLabel: `n = ${n}`, divisors: [a, b, c], kind: "ugly-three", high,
    formula: "A + B + C − AB − AC − BC + ABC",
    intro: { vi: "Ugly number là bội của a HOẶC b HOẶC c. Với ba tập, inclusion–exclusion dùng dấu + cho singleton/triple và dấu − cho các cặp để mỗi số chỉ được đếm một lần.", en: "An ugly number is divisible by a OR b OR c. With three sets, inclusion–exclusion adds singletons/triples and subtracts pairs so each number is counted once." },
    codeLines: { intro: [1, 2], init: [3, 8], count: [4, 5, 9, 10], move: [9, 10, 11, 12], answer: [13] },
    countAt: (x) => { const data = ieThreeTerms(x, a, b, c); return { ...data, ok: data.count >= n, label: `${data.count} ${data.count >= n ? "≥" : "<"} ${n}`, note: { vi: `Bảy hạng inclusion–exclusion cho count(${x}) = ${data.count}.`, en: `The seven inclusion–exclusion terms give count(${x}) = ${data.count}.` } }; },
  });
}

function buildSteps2513(input) {
  if (!Array.isArray(input) || input.length !== 4) throw new Error("enter divisor1, divisor2, uniqueCnt1, uniqueCnt2");
  const [divisor1, divisor2, uniqueCnt1, uniqueCnt2] = input.map((value, index) => iePositive(value, ["divisor1", "divisor2", "uniqueCnt1", "uniqueCnt2"][index]));
  const lcm = ieLcm(divisor1, divisor2);
  const high = 2 * (uniqueCnt1 + uniqueCnt2) * Math.max(divisor1, divisor2);
  if (high > IE_MAX_VALUE) throw new Error("answer range is too large for this visualization");
  return buildIeBinarySearch({
    input, target: uniqueCnt1 + uniqueCnt2, targetLabel: `cnt1=${uniqueCnt1}, cnt2=${uniqueCnt2}`, divisors: [divisor1, divisor2], kind: "two-arrays", high,
    formula: `not d1 ≥ ${uniqueCnt1} · not d2 ≥ ${uniqueCnt2} · not lcm ≥ ${uniqueCnt1 + uniqueCnt2}`,
    intro: { vi: "Một số không chia hết divisor1 chỉ dùng được cho arr1; tương tự divisor2 cho arr2. Số không chia hết LCM(divisor1,divisor2) dùng được cho ÍT NHẤT một mảng, nên cần đủ tổng số phần tử khác nhau.", en: "A number not divisible by divisor1 can serve arr1; likewise divisor2 for arr2. A number not divisible by LCM(divisor1,divisor2) can serve AT LEAST one array, so enough total distinct values are required." },
    codeLines: { intro: [1, 2], init: [3, 9], count: [4, 5, 10, 11], move: [10, 11, 12, 13], answer: [14] },
    countAt: (x) => {
      const forOne = x - Math.floor(x / divisor1);
      const forTwo = x - Math.floor(x / divisor2);
      const sharedPool = x - Math.floor(x / lcm);
      const ok = forOne >= uniqueCnt1 && forTwo >= uniqueCnt2 && sharedPool >= uniqueCnt1 + uniqueCnt2;
      const terms = [
        { sign: "+", label: `not divisible by ${divisor1}`, value: forOne, divisor: divisor1 },
        { sign: "+", label: `not divisible by ${divisor2}`, value: forTwo, divisor: divisor2 },
        { sign: "+", label: `not divisible by lcm=${lcm}`, value: sharedPool, divisor: lcm },
      ];
      return { count: sharedPool, terms, formula: `A=${forOne}/${uniqueCnt1}, B=${forTwo}/${uniqueCnt2}, total=${sharedPool}/${uniqueCnt1 + uniqueCnt2}`, ok, label: ok ? "all three checks ✓" : "a required check fails", note: { vi: ok ? "Cả ba điều kiện đều đủ: có thể chọn hai mảng không giao nhau trong [1..x]." : "Ít nhất một pool còn thiếu; x chưa đủ lớn.", en: ok ? "All three conditions hold: two disjoint arrays can be chosen from [1..x]." : "At least one pool is short; x is not large enough yet." } };
    },
  });
}

function buildSteps3116(input, params = {}) {
  if (!Array.isArray(input) || !input.length) throw new Error("enter one or more coin denominations");
  if (input.length > 6) throw new Error("visualization supports at most 6 coin denominations");
  const coins = input.map((coin) => iePositive(coin, "coin"));
  if (new Set(coins).size !== coins.length) throw new Error("coin denominations must be distinct");
  const k = iePositive(params.k, "k");
  const high = k * Math.min(...coins);
  if (high > IE_MAX_VALUE) throw new Error("answer range is too large for this visualization");
  return buildIeBinarySearch({
    input, target: k, targetLabel: `k = ${k}`, divisors: [...coins], kind: "coin-subsets", high,
    formula: "Σ singletons − Σ pairs + Σ triples − …",
    intro: { vi: "Một amount hợp lệ nếu là bội của ÍT NHẤT một coin. Với m coin, duyệt mọi subset khác rỗng: subset lẻ cộng, subset chẵn trừ bội của LCM(subset).", en: "An amount is valid if it is a multiple of AT LEAST one coin. With m coins, enumerate non-empty subsets: odd subsets add, even subsets subtract multiples of LCM(subset)." },
    codeLines: { intro: [1, 4], init: [5, 16, 25], count: [15, 16, 17, 18, 19, 20, 21, 22, 23], move: [27, 28, 29, 30, 31], answer: [32] },
    countAt: (x) => { const data = ieCoinTerms(x, coins); return { ...data, ok: data.count >= k, label: `${data.count} ${data.count >= k ? "≥" : "<"} ${k}`, note: { vi: `${data.terms.length} subset tạo count(${x}) = ${data.count}.`, en: `${data.terms.length} subsets produce count(${x}) = ${data.count}.` } }; },
  });
}

/** LeetCode 668: Kth Smallest Number in Multiplication Table. */
function buildSteps668(input, params = {}) {
  const m = Number(Array.isArray(input) ? input[0] : input);
  const n = Number(params.n ?? 3);
  const k = Number(params.k ?? 5);
  if (!Number.isInteger(m) || !Number.isInteger(n) || !Number.isInteger(k) || m <= 0 || n <= 0 || k <= 0) {
    throw new Error("m, n, and k must be positive integers");
  }
  if (k > m * n) throw new Error("k must be <= m * n");

  const rows = Math.min(m, 10);
  const cols = Math.min(n, 10);
  const table = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (r + 1) * (c + 1)));
  const steps = [];
  let left = 1;
  let right = m * n;

  function countLE(x) {
    let total = 0;
    const perRow = [];
    for (let i = 1; i <= m; i++) {
      const rowCount = Math.min(n, Math.floor(x / i));
      total += rowCount;
      perRow.push(rowCount);
    }
    return { total, perRow };
  }

  function gridCells(mid, perRow = []) {
    return table.map((row, r) => row.map((value, c) => {
      const withinVisibleCount = c < Math.min(cols, perRow[r] || 0);
      return {
        label: String(value),
        cls: value <= mid && withinVisibleCount ? "visited" : value <= mid ? "path" : "empty",
      };
    }));
  }

  function push({ title, codeLines, mid = null, count = null, perRow = [], vars = [], note, final = false }) {
    const visibleNote = (m > rows || n > cols)
      ? { vi: `Chỉ hiển thị góc ${rows}x${cols}; phép đếm vẫn dùng đủ ${m}x${n}.`, en: `Only the ${rows}x${cols} corner is shown; counting still uses the full ${m}x${n} table.` }
      : null;
    steps.push({
      title,
      arr: Array.from({ length: Math.min(m, 12) }, (_, i) => i + 1),
      sub: Array.from({ length: Math.min(m, 12) }, (_, i) => `row ${i + 1}`),
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        ...(mid === null ? [] : [{ name: "mid", value: mid }]),
        ...(count === null ? [] : [{ name: `count(<=${mid})`, value: count }]),
        { name: "k", value: k },
        ...vars,
      ],
      note: visibleNote
        ? { vi: `${note.vi} ${visibleNote.vi}`, en: `${note.en} ${visibleNote.en}` }
        : note,
      bfsGrid: {
        rows,
        cols,
        cells: gridCells(mid ?? 0, perRow),
      },
    });
  }

  push({
    title: { vi: "Binary search trên giá trị đáp án", en: "Binary search on the answer value" },
    codeLines: [3, 4],
    vars: [{ name: "table size", value: `${m}x${n}` }],
    note: {
      vi: "Không tạo toàn bộ bảng lớn; chỉ tìm x nhỏ nhất sao cho có ít nhất k số <= x.",
      en: "Do not build the full large table; find the smallest x with at least k values <= x.",
    },
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const { total, perRow } = countLE(mid);
    push({
      title: { vi: `mid=${mid}: count=${total}`, en: `mid=${mid}: count=${total}` },
      codeLines: [6, 7, 8, 9],
      mid,
      count: total,
      perRow,
      vars: [
        { name: "per row", value: perRow.slice(0, 10).map((v, i) => `${i + 1}:${v}`).join(" ") + (m > 10 ? " ..." : "") },
      ],
      note: {
        vi: `Ở hàng i có min(n, mid//i) số <= mid. Tổng ${total} ${total >= k ? ">= k, đáp án có thể nhỏ hơn/bằng mid" : "< k, đáp án phải lớn hơn mid"}.`,
        en: `In row i there are min(n, mid//i) values <= mid. Total ${total} is ${total >= k ? ">= k, so answer can be <= mid" : "< k, so answer must be > mid"}.`,
      },
    });
    if (total >= k) {
      right = mid;
      push({
        title: { vi: `count >= k → right = ${right}`, en: `count >= k → right = ${right}` },
        codeLines: [10, 11],
        mid,
        count: total,
        perRow,
        note: { vi: "Giữ mid trong vùng ứng viên vì mid có thể chính là đáp án.", en: "Keep mid in the candidate range because mid might be the answer." },
      });
    } else {
      left = mid + 1;
      push({
        title: { vi: `count < k → left = ${left}`, en: `count < k → left = ${left}` },
        codeLines: [12, 13],
        mid,
        count: total,
        perRow,
        note: { vi: "Có quá ít số <= mid, nên loại bỏ mid và mọi số nhỏ hơn.", en: "Too few values are <= mid, so discard mid and everything smaller." },
      });
    }
  }

  const finalCount = countLE(left);
  push({
    title: { vi: `Đáp án = ${left}`, en: `Answer = ${left}` },
    codeLines: [14],
    mid: left,
    count: finalCount.total,
    perRow: finalCount.perRow,
    vars: [{ name: "answer", value: left }],
    note: {
      vi: "left == right là giá trị nhỏ nhất có count(x) >= k.",
      en: "left == right is the smallest value with count(x) >= k.",
    },
    final: true,
  });

  return { original: { m, n, k }, answer: left, steps };
}

module.exports = Object.assign(module.exports, {
  668: {
    id: 668,
    difficulty: "hard",
    slug: "kth-smallest-number-in-multiplication-table",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Kth Smallest Number in Multiplication Table", en: "Kth Smallest Number in Multiplication Table" },
    titleVi: { vi: "Số nhỏ thứ k trong bảng nhân", en: "Kth smallest in a multiplication table" },
    statement: {
      vi: "Bảng m x n có table[i][j] = i*j với i,j bắt đầu từ 1. Tìm số nhỏ thứ k mà không cần tạo toàn bộ bảng.",
      en: "An m x n table has table[i][j] = i*j with i,j starting from 1. Find the kth smallest number without building the full table.",
    },
    defaultInput: [3],
    inputKind: "positive",
    singleInput: true,
    inputLabel: { vi: "m (số hàng)", en: "m (rows)" },
    extraParams: [
      { key: "n", label: { vi: "n (số cột)", en: "n (columns)" }, default: 3, min: 1 },
      { key: "k", label: { vi: "k", en: "k" }, default: 5, min: 1 },
    ],
    approach: [
      { vi: "Binary search giá trị x trong [1, m*n].", en: "Binary-search value x in [1, m*n]." },
      { vi: "count(x) = tổng theo hàng min(n, x//i), tức số phần tử <= x.", en: "count(x) = sum over rows min(n, x//i), the number of values <= x." },
      { vi: "Tìm x nhỏ nhất sao cho count(x) >= k.", en: "Find the smallest x such that count(x) >= k." },
    ],
    complexity: {
      time: "O(m log(m*n))",
      space: "O(1)",
      note: { vi: "Mỗi lần check duyệt m hàng và dùng phép chia nguyên.", en: "Each check scans m rows and uses integer division." },
    },
    code: [
      "class Solution:",
      "    def findKthNumber(self, m: int, n: int, k: int) -> int:",
      "        left, right = 1, m * n",
      "        def count_less_equal(x):",
      "            count = 0",
      "            for i in range(1, m + 1):",
      "                count += min(n, x // i)",
      "            return count",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if count_less_equal(mid) >= k:",
      "                right = mid",
      "            else:",
      "                left = mid + 1",
      "        return left",
    ],
    builder: buildSteps668,
  },
  2652: {
    id: 2652, difficulty: "easy", slug: "sum-multiples", category: { key: "math", vi: "Toán", en: "Math" },
    tags: [{ key: "inclusion-exclusion", vi: "Bao hàm – loại trừ", en: "Inclusion–Exclusion" }],
    title: { vi: "Sum Multiples", en: "Sum Multiples" }, titleVi: { vi: "Tổng các bội số", en: "Sum of multiples" },
    statement: { vi: "Trả về tổng các số nguyên dương ≤ n chia hết cho 3 HOẶC 5 HOẶC 7.", en: "Return the sum of all positive integers ≤ n divisible by 3 OR 5 OR 7." },
    defaultInput: [10], inputKind: "positive", singleInput: true, maxInput: 50, inputLabel: { vi: "n (1..50)", en: "n (1..50)" }, extraParams: [],
    approach: [{ vi: "Duyệt 1..n; điều kiện OR đúng nếu ít nhất một phép chia hết đúng.", en: "Scan 1..n; the OR condition holds when at least one divisibility test succeeds." }, { vi: "Mỗi số chỉ cộng một lần, kể cả khi là bội chung.", en: "Add each number once, even if it is a common multiple." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "n tối đa 50 theo đề bài.", en: "The problem bounds n by 50." } },
    code: ["class Solution:", "    def sumOfMultiples(self, n):", "        total = 0", "        for i in range(1, n + 1):", "            if i % 3 == 0 or i % 5 == 0 or i % 7 == 0:", "                total += i", "        return total"], builder: buildSteps2652,
  },
  878: {
    id: 878, difficulty: "hard", slug: "nth-magical-number", category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [{ key: "inclusion-exclusion", vi: "Bao hàm – loại trừ", en: "Inclusion–Exclusion" }], title: { vi: "Nth Magical Number", en: "Nth Magical Number" }, titleVi: { vi: "Số magical thứ n", en: "Find the nth magical number" },
    statement: { vi: "Số magical chia hết cho a hoặc b. Tìm số magical thứ n (mod 10^9+7).", en: "A magical number is divisible by a or b. Find the nth magical number (mod 10^9+7)." },
    defaultInput: [4], inputKind: "positive", singleInput: true, inputLabel: { vi: "n", en: "n" }, extraParams: [{ key: "a", label: { vi: "a", en: "a" }, default: 2, min: 1, max: IE_MAX_INPUT }, { key: "b", label: { vi: "b", en: "b" }, default: 3, min: 1, max: IE_MAX_INPUT }],
    approach: [{ vi: "count(x)=⌊x/a⌋+⌊x/b⌋−⌊x/lcm(a,b)⌋.", en: "count(x)=⌊x/a⌋+⌊x/b⌋−⌊x/lcm(a,b)⌋." }, { vi: "count(x) không giảm, nên tìm x nhỏ nhất có count(x) ≥ n bằng binary search.", en: "count(x) is non-decreasing, so binary-search the smallest x with count(x) ≥ n." }],
    complexity: { time: "O(log(n·min(a,b)))", space: "O(1)", note: { vi: "Mỗi lần check chỉ gồm vài phép chia nguyên.", en: "Each check uses only a few integer divisions." } },
    code: ["class Solution:", "    def nthMagicalNumber(self, n, a, b):", "        lcm = a * b // gcd(a, b)", "        def count(x):", "            return x // a + x // b - x // lcm", "        lo, hi = 1, n * min(a, b)", "        while lo < hi:", "            mid = (lo + hi) // 2", "            if count(mid) >= n:", "                hi = mid", "            else:", "                lo = mid + 1", "        return lo % 1_000_000_007"], builder: buildSteps878,
  },
  1201: {
    id: 1201, difficulty: "medium", slug: "ugly-number-iii", category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [{ key: "inclusion-exclusion", vi: "Bao hàm – loại trừ", en: "Inclusion–Exclusion" }], title: { vi: "Ugly Number III", en: "Ugly Number III" }, titleVi: { vi: "Ugly number thứ n với ba ước", en: "Nth ugly number with three divisors" },
    statement: { vi: "Ugly number chia hết cho a hoặc b hoặc c. Tìm ugly number thứ n.", en: "An ugly number is divisible by a or b or c. Find the nth ugly number." },
    defaultInput: [3], inputKind: "positive", singleInput: true, inputLabel: { vi: "n", en: "n" }, extraParams: [{ key: "a", label: { vi: "a", en: "a" }, default: 2, min: 1, max: IE_MAX_INPUT }, { key: "b", label: { vi: "b", en: "b" }, default: 3, min: 1, max: IE_MAX_INPUT }, { key: "c", label: { vi: "c", en: "c" }, default: 5, min: 1, max: IE_MAX_INPUT }],
    approach: [{ vi: "Dùng 7 hạng inclusion–exclusion cho ba tập bội số.", en: "Use the 7 inclusion–exclusion terms for three sets of multiples." }, { vi: "Binary search x nhỏ nhất có count(x) ≥ n.", en: "Binary-search the smallest x with count(x) ≥ n." }],
    complexity: { time: "O(log(n·min(a,b,c)))", space: "O(1)", note: { vi: "Mỗi check có đúng 7 phép chia.", en: "Every check has exactly 7 divisions." } },
    code: ["class Solution:", "    def nthUglyNumber(self, n, a, b, c):", "        ab, ac, bc = lcm(a,b), lcm(a,c), lcm(b,c)", "        abc = lcm(ab, c)", "        def count(x):", "            return x//a + x//b + x//c - x//ab - x//ac - x//bc + x//abc", "        lo, hi = 1, n * min(a,b,c)", "        while lo < hi:", "            mid = (lo + hi) // 2", "            if count(mid) >= n:", "                hi = mid", "            else:", "                lo = mid + 1", "        return lo"], builder: buildSteps1201,
  },
  2513: {
    id: 2513, difficulty: "medium", slug: "minimize-the-maximum-of-two-arrays", category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [{ key: "inclusion-exclusion", vi: "Bao hàm – loại trừ", en: "Inclusion–Exclusion" }], title: { vi: "Minimize the Maximum of Two Arrays", en: "Minimize the Maximum of Two Arrays" }, titleVi: { vi: "Tối thiểu hóa giá trị lớn nhất của hai mảng", en: "Minimize the maximum for two arrays" },
    statement: { vi: "Chọn uniqueCnt1 số không chia hết divisor1 và uniqueCnt2 số không chia hết divisor2, hai mảng không giao nhau. Tìm maximum nhỏ nhất. Nhập divisor1,divisor2,uniqueCnt1,uniqueCnt2.", en: "Choose uniqueCnt1 numbers not divisible by divisor1 and uniqueCnt2 numbers not divisible by divisor2, with disjoint arrays. Find the smallest possible maximum. Enter divisor1,divisor2,uniqueCnt1,uniqueCnt2." },
    defaultInput: [2, 7, 1, 3], inputKind: "positive", inputLabel: { vi: "divisor1, divisor2, uniqueCnt1, uniqueCnt2", en: "divisor1, divisor2, uniqueCnt1, uniqueCnt2" }, extraParams: [],
    approach: [{ vi: "Với x, đếm pool không chia hết divisor1, không chia hết divisor2, và pool không chia hết LCM cho tổng hai mảng.", en: "For x, count the pool not divisible by divisor1, not divisible by divisor2, and not divisible by the LCM for both arrays together." }, { vi: "Cả ba điều kiện đều đơn điệu theo x, nên binary search đáp án.", en: "All three conditions are monotone in x, so binary-search the answer." }],
    complexity: { time: "O(log answer)", space: "O(1)", note: { vi: "Mỗi check dùng ba phép chia nguyên.", en: "Each check uses three integer divisions." } },
    code: ["class Solution:", "    def minimizeSet(self, divisor1, divisor2, uniqueCnt1, uniqueCnt2):", "        both = lcm(divisor1, divisor2)", "        def valid(x):", "            for1 = x - x // divisor1", "            for2 = x - x // divisor2", "            shared = x - x // both", "            return for1 >= uniqueCnt1 and for2 >= uniqueCnt2 and shared >= uniqueCnt1 + uniqueCnt2", "        lo, hi = 1, 2 * (uniqueCnt1 + uniqueCnt2) * max(divisor1, divisor2)", "        while lo < hi:", "            mid = (lo + hi) // 2", "            if valid(mid):", "                hi = mid", "            else:", "                lo = mid + 1", "        return lo"], builder: buildSteps2513,
  },
  3116: {
    id: 3116, difficulty: "hard", slug: "kth-smallest-amount-with-single-denomination-combination", category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [{ key: "inclusion-exclusion", vi: "Bao hàm – loại trừ", en: "Inclusion–Exclusion" }], title: { vi: "Kth Smallest Amount With Single Denomination Combination", en: "Kth Smallest Amount With Single Denomination Combination" }, titleVi: { vi: "Amount nhỏ thứ k từ một denomination", en: "Kth smallest amount from one denomination" },
    statement: { vi: "Một amount hợp lệ nếu là bội của ít nhất một coin, nhưng chỉ dùng một denomination. Tìm amount nhỏ thứ k. Nhập coins; k ở ô riêng.", en: "An amount is valid if it is a multiple of at least one coin, while using only one denomination. Find the kth smallest amount. Enter coins; k is a separate field." },
    defaultInput: [3, 6, 9], inputKind: "positive", inputLabel: { vi: "coins (dương, tối đa 6 coin)", en: "coins (positive, up to 6 coins)" }, extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 5, min: 1, max: IE_MAX_INPUT }],
    approach: [{ vi: "Mỗi coin tạo tập bội số. Duyệt mọi subset không rỗng, lấy LCM và cộng/trừ theo parity của subset.", en: "Each coin creates a set of multiples. Enumerate every non-empty subset, use its LCM, and add/subtract by subset parity." }, { vi: "count(x) đơn điệu, nên binary search amount nhỏ nhất có ít nhất k amount hợp lệ.", en: "count(x) is monotone, so binary-search the smallest amount with at least k valid amounts." }],
    complexity: { time: "O(2^m · log(k·min(coins)))", space: "O(2^m)", note: { vi: "m là số coin; visualization giới hạn m ≤ 6 để thấy được các subset.", en: "m is the number of coins; the visualization limits m ≤ 6 so every subset remains visible." } },
    code: ["from math import gcd", "", "class Solution:", "    def findKthSmallest(self, coins, k):", "        def lcm(a, b):", "            return a // gcd(a, b) * b", "", "        def lcm_of_selected_coins(mask):", "            lcm_value = 1", "            for i, coin in enumerate(coins):", "                if mask & (1 << i):", "                    lcm_value = lcm(lcm_value, coin)", "            return lcm_value", "", "        def count(x):", "            total = 0", "            for mask in range(1, 1 << len(coins)):", "                lcm_value = lcm_of_selected_coins(mask)", "                if mask.bit_count() % 2:", "                    total += x // lcm_value", "                else:", "                    total -= x // lcm_value", "            return total", "", "        lo, hi = 1, k * min(coins)", "        while lo < hi:", "            mid = (lo + hi) // 2", "            if count(mid) >= k:", "                hi = mid", "            else:", "                lo = mid + 1", "        return lo"], builder: buildSteps3116,
  },
});

/**
 * LeetCode 352: Data Stream as Disjoint Intervals.
 *
 * Design problem driven by an operation stream such as
 *   SummaryRanges(), addNum(1), getIntervals(), addNum(3), ...
 * Two approaches share one interval list and produce the same states:
 *   1 - linear scan that skips far-away intervals, absorbs touching ones
 *       into a floating [value, value] interval, then inserts the result;
 *   2 - half-open binary search over interval starts finds the first
 *       interval with start > value; prev/next decide between covered,
 *       bridge-merge, extend or plain insert.
 */
function parseDataStreamOps352(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return [];

  const mapOp = (name, argText) => {
    const op = String(name || "").toLowerCase();
    if (op === "summaryranges") return { name: "init" };
    if (op === "addnum") {
      const value = Number(String(argText ?? "").replace(/^["']|["']$/g, "").trim());
      return Number.isInteger(value) ? { name: "add", value } : null;
    }
    if (op === "getintervals") return { name: "query" };
    return null;
  };

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.every((row) => Array.isArray(row))) {
        const ops = parsed.map((row) => mapOp(row[0], row[1])).filter(Boolean);
        if (ops.length) return ops;
      }
    } catch (_error) {
      // Fall through to text parsing below.
    }
  }

  return text
    .split(/\s*[|;\n]+\s*|\s*,\s*(?=[A-Za-z_]\w*\s*[(])/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const call = part.match(/^([A-Za-z_]\w*)\s*\(\s*(-?\d+)?\s*\)$/);
      if (call) return mapOp(call[1], call[2]);
      const bare = part.match(/^([A-Za-z_]\w*)(?:\s+(\d+))?$/);
      return bare ? mapOp(bare[1], bare[2]) : null;
    })
    .filter(Boolean);
}

function buildSteps352(input, params) {
  const approach = Number(params && params.approach) === 1 ? 1 : 2;
  const raw = String(input ?? "").trim();
  const ops = parseDataStreamOps352(raw);
  const steps = [];
  const invalid = raw.length > 0 && ops.length === 0;

  const intervals = []; // sorted, pairwise disjoint [start, end]
  const results = [];   // snapshots returned by getIntervals()
  const addedValues = ops.filter((op) => op.name === "add").map((op) => op.value);
  const domainLo = addedValues.length ? Math.min(...addedValues) - 1 : 0;
  const domainHi = addedValues.length ? Math.max(...addedValues) + 1 : 9;

  const opLabel = (op) => op.name === "add" ? `addNum(${op.value})` : "getIntervals()";
  const fmtList = (list) => list.map((iv) => `[${iv[0]},${iv[1]}]`).join(", ");

  function snapshot(opts) {
    const step = {
      title: opts.title,
      codeLines: opts.codeLines || [],
      codeBlock: approach,
      dataStream352View: {
        approach,
        event: opts.event,
        ops: ops.filter((op) => op.name !== "init").map(opLabel),
        activeOpIndex: Number.isInteger(opts.activeOp) ? opts.activeOp : -1,
        completedOps: Number.isInteger(opts.completed) ? opts.completed : 0,
        value: opts.value != null ? opts.value : null,
        intervals: intervals.map((iv) => iv.slice()),
        bs: opts.bs || null,
        prevIdx: Number.isInteger(opts.prevIdx) ? opts.prevIdx : null,
        nextIdx: Number.isInteger(opts.nextIdx) ? opts.nextIdx : null,
        scanIdx: Number.isInteger(opts.scanIdx) ? opts.scanIdx : null,
        insertAt: Number.isInteger(opts.insertAt) ? opts.insertAt : null,
        touched: (opts.touched || []).slice(),
        removedIdx: Number.isInteger(opts.removedIdx) ? opts.removedIdx : null,
        newInterval: opts.newInterval ? opts.newInterval.slice() : null,
        results: results.map((snap) => snap.map((iv) => iv.slice())),
        returned: opts.returned ? opts.returned.map((iv) => iv.slice()) : null,
        domainLo,
        domainHi,
      },
      vars: opts.vars || [],
      note: opts.note,
    };
    if (opts.final) step.final = true;
    steps.push(step);
  }

  if (invalid) {
    snapshot({
      title: { vi: "Operations không hợp lệ", en: "Invalid operations" },
      event: "invalid",
      vars: [],
      note: {
        vi: "Dùng dạng SummaryRanges(), addNum(value), getIntervals() ngăn cách bằng dấu phẩy hoặc |.",
        en: "Use SummaryRanges(), addNum(value), getIntervals() separated by commas or |.",
      },
      final: true,
    });
    return { original: { operations: raw }, answer: null, steps };
  }

  if (!ops.length || ops[0].name !== "init") ops.unshift({ name: "init" });

  snapshot({
    title: { vi: 'SummaryRanges(): danh sách khoảng rỗng', en: "SummaryRanges(): empty interval list" },
    event: "init",
    codeLines: approach === 1 ? [4, 5] : [4, 5],
    vars: [{ name: "self.intervals", value: "[]" }],
    note: {
      vi: "Khởi tạo với danh sách các khoảng rời nhau và đã sắp xếp theo start. Mọi giá trị mới phải được nhét vào đúng chỗ mà không phá tính chất này.",
      en: "Initialize an empty list of sorted disjoint intervals. Every incoming value must be woven in without breaking that invariant.",
    },
  });

  ops.forEach((op, opIndex) => {
    if (op.name === "init") return;
    const completed = opIndex;

    if (op.name === "query") {
      const returned = intervals.map((iv) => iv.slice());
      results.push(returned);
      snapshot({
        title: {
          vi: `getIntervals() → [${fmtList(returned)}]`,
          en: `getIntervals() → [${fmtList(returned)}]`,
        },
        event: "query",
        activeOp: opIndex,
        completed: completed + 1,
        returned,
        codeLines: approach === 1 ? [20, 21] : [30, 31],
        vars: [
          { name: "return", value: `[${fmtList(returned)}]` },
          { name: "count", value: returned.length },
        ],
        note: {
          vi: "Danh sách luôn rời nhau và sắp xếp theo start nên chỉ cần trả nguyên trạng thái hiện tại.",
          en: "The list is always disjoint and sorted by start, so the current state is returned as-is.",
        },
      });
      return;
    }

    const value = op.value;
    const addNote = {
      vi: `addNum(${value}): chèn ${value} vào cấu trúc rồi tự động gộp/mở rộng để giữ các khoảng rời nhau.`,
      en: `addNum(${value}): weave ${value} into the structure, merging or extending so intervals stay disjoint.`,
    };

    if (approach === 1) {
      // ---- Approach 1: linear scan ----
      snapshot({
        title: { vi: `addNum(${value})`, en: `addNum(${value})` },
        event: "call-add",
        activeOp: opIndex,
        completed,
        value,
        codeLines: [7, 8, 9],
        vars: [{ name: "value", value }, { name: "new_interval", value: `[${value}, ${value}]` }, { name: "i", value: 0 }],
        note: addNote,
      });

      const newInterval = [value, value];
      let i = 0;
      while (i < intervals.length && intervals[i][1] + 1 < newInterval[0]) {
        snapshot({
          title: {
            vi: `Bỏ qua [${intervals[i][0]}, ${intervals[i][1]}]: end+1 = ${intervals[i][1] + 1} < ${value}`,
            en: `Skip [${intervals[i][0]}, ${intervals[i][1]}]: end+1 = ${intervals[i][1] + 1} < ${value}`,
          },
          event: "skip-scan",
          activeOp: opIndex,
          completed,
          value,
          scanIdx: i,
          codeLines: [11, 12],
          vars: [
            { name: "i", value: i },
            { name: "intervals[i]", value: `[${intervals[i][0]}, ${intervals[i][1]}]` },
            { name: "check", value: `${intervals[i][1] + 1} < ${newInterval[0]} → skip` },
          ],
          note: {
            vi: `Khoảng này kết thúc trước ${value} ít nhất 2 đơn vị nên không thể chạm vào new_interval; dịch con trỏ sang phải.`,
            en: `This interval ends at least 2 units below ${value}, so it cannot touch new_interval; advance the cursor.`,
          },
        });
        i += 1;
      }

      while (i < intervals.length && intervals[i][0] <= newInterval[1] + 1) {
        const cur = intervals[i];
        snapshot({
          title: {
            vi: `Hấp thụ [${cur[0]}, ${cur[1]}]: start = ${cur[0]} ≤ new.end+1 = ${newInterval[1] + 1}`,
            en: `Absorb [${cur[0]}, ${cur[1]}]: start = ${cur[0]} ≤ new.end+1 = ${newInterval[1] + 1}`,
          },
          event: "absorb-check",
          activeOp: opIndex,
          completed,
          value,
          scanIdx: i,
          newInterval: newInterval.slice(),
          codeLines: [14],
          vars: [
            { name: "i", value: i },
            { name: "intervals[i]", value: `[${cur[0]}, ${cur[1]}]` },
            { name: "check", value: `${cur[0]} ≤ ${newInterval[1] + 1} → absorb` },
          ],
          note: {
            vi: "Khoảng này chồng lấn hoặc chạm mép new_interval, nên nó sẽ bị nuốt vào và xóa khỏi danh sách.",
            en: "This interval overlaps or touches new_interval, so it will be swallowed and deleted from the list.",
          },
        });
        newInterval[0] = Math.min(newInterval[0], cur[0]);
        newInterval[1] = Math.max(newInterval[1], cur[1]);
        intervals.splice(i, 1);
        snapshot({
          title: {
            vi: `new_interval lớn thành [${newInterval[0]}, ${newInterval[1]}]; xoá khoảng cũ tại i=${i}`,
            en: `new_interval grows to [${newInterval[0]}, ${newInterval[1]}]; old interval at i=${i} deleted`,
          },
          event: "absorb-grow",
          activeOp: opIndex,
          completed,
          value,
          scanIdx: i,
          newInterval: newInterval.slice(),
          codeLines: [15, 16, 17],
          vars: [
            { name: "i", value: i },
            { name: "new_interval", value: `[${newInterval[0]}, ${newInterval[1]}]` },
          ],
          note: {
            vi: "Phần tử kế tiếp lại nằm tại i, nên vòng lặp xét tiếp đúng vị trí đó.",
            en: "The following element slides into index i, so the loop re-examines the same position.",
          },
        });
      }

      intervals.splice(i, 0, newInterval.slice());
      snapshot({
        title: {
          vi: `Chèn new_interval [${newInterval[0]}, ${newInterval[1]}] tại vị trí ${i}`,
          en: `Insert new_interval [${newInterval[0]}, ${newInterval[1]}] at index ${i}`,
        },
        event: "insert-linear",
        activeOp: opIndex,
        completed: completed + 1,
        value,
        insertAt: i,
        touched: [i],
        codeLines: [18],
        vars: [
          { name: "i", value: i },
          { name: "intervals", value: `[${fmtList(intervals)}]` },
        ],
        note: {
          vi: "Sau khi bỏ qua phần quá gần bên trái và nuốt phần chạm mép, chèn khoảng tổng hợp vào đúng chỗ; danh sách vẫn rời nhau.",
          en: "After skipping the far-left part and absorbing everything touching, the merged interval is spliced back in; the list stays disjoint.",
        },
      });
      return;
    }

    // ---- Approach 2: binary search over starts ----
    snapshot({
      title: { vi: `addNum(${value})`, en: `addNum(${value})` },
      event: "call-add",
      activeOp: opIndex,
      completed,
      value,
      codeLines: [7, 8],
      vars: [{ name: "value", value }],
      note: addNote,
    });

    let left = 0;
    let right = intervals.length;
    let mid = null;

    snapshot({
      title: { vi: `left, right = 0, ${right}`, en: `left, right = 0, ${right}` },
      event: "bs-range",
      activeOp: opIndex,
      completed,
      value,
      bs: { left, right, mid: null },
      codeLines: [8],
      vars: [
        { name: "left (L)", value: left },
        { name: "right (R)", value: right },
        { name: "starts", value: `[${intervals.map((iv) => iv[0]).join(", ")}]` },
      ],
      note: {
        vi: "Tìm index đầu tiên có start > value bằng binary search nửa mở [L, R).",
        en: "Binary-search the first index whose start > value over the half-open range [L, R).",
      },
    });

    while (left < right) {
      mid = Math.floor((left + right) / 2);
      const startMid = intervals[mid][0];
      snapshot({
        title: { vi: `L=${left} < R=${right} → M=(${left}+${right})//2=${mid}`, en: `L=${left} < R=${right} → M=(${left}+${right})//2=${mid}` },
        event: "bs-mid",
        activeOp: opIndex,
        completed,
        value,
        bs: { left, right, mid },
        codeLines: [9, 10],
        vars: [
          { name: "mid (M)", value: mid },
          { name: "starts[M]", value: startMid },
        ],
        note: {
          vi: `Vòng lặp còn chạy vì vùng [${left}, ${right}) không rỗng.`,
          en: `The loop continues because the range [${left}, ${right}) is not empty.`,
        },
      });
      const goRight = startMid <= value;
      snapshot({
        title: {
          vi: `starts[M]=${startMid} ${goRight ? "≤" : ">"} value=${value}`,
          en: `starts[M]=${startMid} ${goRight ? "≤" : ">"} value=${value}`,
        },
        event: "bs-compare",
        activeOp: opIndex,
        completed,
        value,
        bs: { left, right, mid },
        codeLines: [11],
        vars: [{ name: "comparison", value: `${startMid} ${goRight ? "≤" : ">"} ${value}` }],
        note: goRight
          ? {
              vi: `start của khoảng giữa không vượt quá ${value}, nên vị trí cần tìm nằm bên phải M.`,
              en: `The middle interval's start does not exceed ${value}, so the answer lies right of M.`,
            }
          : {
              vi: `start của khoảng giữa vượt quá ${value}, nên M vẫn có thể là đáp án.`,
              en: `The middle interval's start exceeds ${value}, so M may still be the answer.`,
            },
      });
      if (goRight) {
        left = mid + 1;
        snapshot({
          title: { vi: `left = M + 1 = ${left}`, en: `left = M + 1 = ${left}` },
          event: "bs-left",
          activeOp: opIndex,
          completed,
          value,
          bs: { left, right, mid },
          codeLines: [12],
          vars: [{ name: "left (L)", value: left }],
          note: {
            vi: "Toàn bộ nửa trái kể cả M có start ≤ value nên bị loại khỏi vùng tìm kiếm.",
            en: "The whole left half including M has start ≤ value, so it leaves the search range.",
          },
        });
      } else {
        right = mid;
        snapshot({
          title: { vi: `right = M = ${right}`, en: `right = M = ${right}` },
          event: "bs-right",
          activeOp: opIndex,
          completed,
          value,
          bs: { left, right, mid },
          codeLines: [14],
          vars: [{ name: "right (R)", value: right }],
          note: {
            vi: "Giữ M trong vùng tìm kiếm vì nó vẫn có thể là index đầu tiên có start > value.",
            en: "Keep M inside the range because it may still be the first index with start > value.",
          },
        });
      }
    }
    mid = null;

    const prevIdx = left > 0 ? left - 1 : null;
    const nextIdx = left < intervals.length ? left : null;
    const prev = prevIdx !== null ? intervals[prevIdx].slice() : null;
    const nxt = nextIdx !== null ? intervals[nextIdx].slice() : null;
    const neighborVars = [
      { name: "insert index", value: left },
      { name: "prev", value: prev ? `[${prev[0]}, ${prev[1]}]` : "None" },
      { name: "nxt", value: nxt ? `[${nxt[0]}, ${nxt[1]}]` : "None" },
    ];
    snapshot({
      title: {
        vi: `Vị trí chèn i=${left}; prev=${prev ? `[${prev[0]}, ${prev[1]}]` : "None"}, nxt=${nxt ? `[${nxt[0]}, ${nxt[1]}]` : "None"}`,
        en: `Insertion point i=${left}; prev=${prev ? `[${prev[0]}, ${prev[1]}]` : "None"}, nxt=${nxt ? `[${nxt[0]}, ${nxt[1]}]` : "None"}`,
      },
      event: "neighbors",
      activeOp: opIndex,
      completed,
      value,
      bs: { left, right, mid: null },
      prevIdx,
      nextIdx,
      codeLines: [16, 17],
      vars: neighborVars,
      note: {
        vi: "prev là khoảng ngay trước vị trí chèn, nxt là khoảng ngay sau; mọi quyết định đều dựa trên hai láng giềng này.",
        en: "prev is the interval just before the insertion point and nxt the one just after; every decision relies on these two neighbours.",
      },
    });

    if (prev && prev[0] <= value && value <= prev[1]) {
      snapshot({
        title: {
          vi: `${value} ∈ prev=[${prev[0]}, ${prev[1]}] → đã được phủ, không đổi gì`,
          en: `${value} ∈ prev=[${prev[0]}, ${prev[1]}] → already covered, nothing changes`,
        },
        event: "covered",
        activeOp: opIndex,
        completed: completed + 1,
        value,
        prevIdx,
        nextIdx,
        touched: [prevIdx],
        codeLines: [18, 19],
        vars: [...neighborVars, { name: "action", value: "return" }],
        note: {
          vi: "Giá trị nằm trọn trong khoảng bên trái nên danh sách giữ nguyên; chi phí chỉ là O(log n) lần tìm.",
          en: "The value falls inside the left interval, so the list stays untouched; the cost is only the O(log n) search.",
        },
      });
      return;
    }

    if (prev && nxt && prev[1] + 1 === value && nxt[0] - 1 === value) {
      snapshot({
        title: {
          vi: `Cầu nối: prev.end+1 = ${prev[1] + 1} = value và nxt.start−1 = ${nxt[0] - 1} = value → gộp cả hai`,
          en: `Bridge: prev.end+1 = ${prev[1] + 1} = value and nxt.start−1 = ${nxt[0] - 1} = value → merge both`,
        },
        event: "bridge-check",
        activeOp: opIndex,
        completed,
        value,
        prevIdx,
        nextIdx,
        codeLines: [20],
        vars: [...neighborVars, { name: "touch_left", value: true }, { name: "touch_right", value: true }],
        note: {
          vi: `${value} vừa nối mũi sau của prev vừa lấp mũi trước của nxt: ba mảnh sẽ hợp nhất thành một khoảng duy nhất.`,
          en: `${value} caps prev's tail and fills nxt's head at once: all three pieces fuse into a single interval.`,
        },
      });
      intervals[prevIdx][1] = nxt[1];
      snapshot({
        title: {
          vi: `prev kéo dài thành [${intervals[prevIdx][0]}, ${nxt[1]}]`,
          en: `prev extends to [${intervals[prevIdx][0]}, ${nxt[1]}]`,
        },
        event: "bridge-link",
        activeOp: opIndex,
        completed,
        value,
        prevIdx,
        nextIdx,
        touched: [prevIdx, nextIdx],
        codeLines: [21],
        vars: [{ name: "prev", value: `[${intervals[prevIdx][0]}, ${intervals[prevIdx][1]}]` }],
        note: {
          vi: "Chỉ cần gán end của prev bằng end của nxt; nxt vẫn đang đứng cạnh đó chờ bị xoá.",
          en: "Assigning prev's end to nxt's end is enough; nxt still sits beside it waiting to be dropped.",
        },
      });
      intervals.splice(nextIdx, 1);
      snapshot({
        title: {
          vi: `splice(${nextIdx}, 1) bỏ nxt → [${fmtList(intervals)}]`,
          en: `splice(${nextIdx}, 1) drops nxt → [${fmtList(intervals)}]`,
        },
        event: "bridge-pop",
        activeOp: opIndex,
        completed: completed + 1,
        value,
        prevIdx,
        removedIdx: nextIdx,
        touched: [prevIdx],
        codeLines: [22],
        vars: [{ name: "intervals", value: `[${fmtList(intervals)}]` }],
        note: {
          vi: "Ba khoảng [prev], {value}, [nxt] giờ là một khoảng liền mạch; số khoảng giảm đi một.",
          en: "The three pieces [prev], {value}, [nxt] are now one contiguous interval; the count shrinks by one.",
        },
      });
      return;
    }

    if (prev && prev[1] + 1 === value) {
      snapshot({
        title: {
          vi: `prev.end+1 = ${prev[1] + 1} = value → mở rộng prev sang phải`,
          en: `prev.end+1 = ${prev[1] + 1} = value → extend prev to the right`,
        },
        event: "extend-prev-check",
        activeOp: opIndex,
        completed,
        value,
        prevIdx,
        nextIdx,
        codeLines: [23],
        vars: [...neighborVars, { name: "touch_left", value: true }, { name: "touch_right", value: false }],
        note: {
          vi: `${value} dính liền mép phải của prev nhưng không chạm nxt, nên chỉ cần kéo dài end của prev.`,
          en: `${value} sticks to prev's right edge without reaching nxt, so only prev's end needs stretching.`,
        },
      });
      intervals[prevIdx][1] = value;
      snapshot({
        title: {
          vi: `prev trở thành [${intervals[prevIdx][0]}, ${value}]`,
          en: `prev becomes [${intervals[prevIdx][0]}, ${value}]`,
        },
        event: "extend-prev-done",
        activeOp: opIndex,
        completed: completed + 1,
        value,
        prevIdx,
        touched: [prevIdx],
        codeLines: [24],
        vars: [{ name: "intervals", value: `[${fmtList(intervals)}]` }],
        note: {
          vi: "Một phép gán O(1); không khoảng nào phải thêm hay bớt.",
          en: "A single O(1) assignment; no interval is inserted or removed.",
        },
      });
      return;
    }

    if (nxt && nxt[0] - 1 === value) {
      snapshot({
        title: {
          vi: `nxt.start−1 = ${nxt[0] - 1} = value → mở rộng nxt sang trái`,
          en: `nxt.start−1 = ${nxt[0] - 1} = value → extend nxt to the left`,
        },
        event: "extend-next-check",
        activeOp: opIndex,
        completed,
        value,
        prevIdx,
        nextIdx,
        codeLines: [25],
        vars: [...neighborVars, { name: "touch_left", value: false }, { name: "touch_right", value: true }],
        note: {
          vi: `${value} dính liền mép trái của nxt nhưng hụt prev một đơn vị, nên hạ start của nxt xuống ${value}.`,
          en: `${value} touches nxt's left edge but misses prev by one, so lower nxt's start to ${value}.`,
        },
      });
      intervals[nextIdx][0] = value;
      snapshot({
        title: {
          vi: `nxt trở thành [${value}, ${intervals[nextIdx][1]}]`,
          en: `nxt becomes [${value}, ${intervals[nextIdx][1]}]`,
        },
        event: "extend-next-done",
        activeOp: opIndex,
        completed: completed + 1,
        value,
        nextIdx,
        touched: [nextIdx],
        codeLines: [26],
        vars: [{ name: "intervals", value: `[${fmtList(intervals)}]` }],
        note: {
          vi: "Khoảng mới bắt đầu sớm hơn nhưng vẫn rời với prev phía trước.",
          en: "The interval now starts earlier yet remains disjoint from prev on the left.",
        },
      });
      return;
    }

    snapshot({
      title: {
        vi: `Không chạm khoảng nào → chèn [${value}, ${value}] tại ${left}`,
        en: `Touches no interval → insert [${value}, ${value}] at ${left}`,
      },
      event: "insert-check",
      activeOp: opIndex,
      completed,
      value,
      prevIdx,
      nextIdx,
      insertAt: left,
      newInterval: [value, value],
      codeLines: [27, 28],
      vars: [...neighborVars, { name: "gap", value: `${prev ? prev[1] + 1 : "-∞"} … ${nxt ? nxt[0] - 1 : "+∞"}` }],
      note: {
        vi: `${value} đứng cô lập giữa hai láng giềng (hoặc ở biên), nên nó tự lập khoảng mới [${value}, ${value}].`,
        en: `${value} sits isolated between its neighbours (or at an edge), so it forms its own interval [${value}, ${value}].`,
      },
    });
    intervals.splice(left, 0, [value, value]);
    snapshot({
      title: {
        vi: `Danh sách sau chèn: [${fmtList(intervals)}]`,
        en: `List after insert: [${fmtList(intervals)}]`,
      },
      event: "insert-done",
      activeOp: opIndex,
      completed: completed + 1,
      value,
      touched: [left],
      codeLines: [28],
      vars: [{ name: "intervals", value: `[${fmtList(intervals)}]` }],
      note: {
        vi: "Chèn O(n) là điểm yếu của cách dùng mảng; cây cân bằng hoặc danh sách liên kết giúp giảm chi phí chèn.",
        en: "The O(n) splice is the weak spot of the array layout; balanced trees or linked lists cut the insertion cost.",
      },
    });
  });

  snapshot({
    title: { vi: "Hoàn tất toàn bộ luồng thao tác", en: "Operation stream complete" },
    event: "done",
    activeOp: ops.length,
    completed: ops.length - 1,
    codeLines: [],
    vars: [
      { name: "final intervals", value: `[${fmtList(intervals)}]` },
      { name: "queries answered", value: results.length },
    ],
    note: approach === 1
      ? {
          vi: "Cách 1 duyệt tuyến tính: mỗi addNum tốn O(n) nhưng rất dễ cài đặt và khó sai.",
          en: "Approach 1 scans linearly: each addNum costs O(n) but the code is trivial to get right.",
        }
      : {
          vi: "Cách 2 tìm vị trí bằng binary search O(log n); phần gộp/mở rộng chỉ đụng tối đa hai láng giềng.",
          en: "Approach 2 locates the spot with an O(log n) binary search; merging only ever touches the two neighbours.",
        },
    final: true,
  });

  return { original: { operations: raw }, answer: results, steps };
}

// ─── 540: binary search on even-aligned duplicate pairs ───────────────────
function buildSteps540(input) {
  const nums = Array.isArray(input) ? input.map(Number) : [];
  if (!nums.length || nums.length > 17 || nums.some((value) => !Number.isInteger(value)) || nums.some((value, index) => index && value < nums[index - 1])) {
    throw new Error("Use a sorted array of 1 to 17 integers.");
  }
  const frequencies = new Map();
  nums.forEach((value) => frequencies.set(value, (frequencies.get(value) || 0) + 1));
  const singles = [...frequencies.entries()].filter(([, count]) => count === 1).map(([value]) => value);
  const validPairs = [...frequencies.values()].every((count) => count === 1 || count === 2);
  if (nums.length % 2 !== 1 || singles.length !== 1 || !validPairs) {
    throw new Error("The array must contain exactly one single value and every other value exactly twice.");
  }
  const steps = [];
  const snap = (title, codeLines, note, extra = {}) => steps.push({
    title,
    arr: [...nums],
    highlight: [extra.left, extra.right, extra.mid, extra.midNext].filter(Number.isInteger),
    mark: Array.isArray(extra.discarded) ? extra.discarded : [],
    codeLines,
    vars: [{ name: "left", value: extra.left }, { name: "right", value: extra.right }, { name: "mid", value: extra.mid ?? "-" }],
    note,
    final: Boolean(extra.final),
    sequenceTraceView: {
      kind: "single-pair", nums: [...nums], left: extra.left, right: extra.right,
      mid: extra.mid ?? -1, pairEnd: extra.midNext ?? -1,
      phase: extra.phase || "setup", answer: extra.answer ?? null,
    },
  });

  let left = 0;
  let right = nums.length - 1;
  snap(
    { vi: "Khởi tạo left và right", en: "Initialize left and right" }, [3],
    { vi: "Trước phần tử đơn, cặp bắt đầu ở chỉ số chẵn; sau nó, cặp lệch sang chỉ số lẻ.", en: "Before the single value, pairs begin at even indices; after it, the pairs shift to odd indices." },
    { left, right, phase: "setup" },
  );
  while (left < right) {
    snap(
      { vi: `left < right: ${left} < ${right}`, en: `left < right: ${left} < ${right}` }, [4],
      { vi: "Khoảng tìm kiếm còn ít nhất hai vị trí.", en: "The search interval still has at least two positions." },
      { left, right, phase: "loop" },
    );
    let mid = Math.floor((left + right) / 2);
    snap(
      { vi: `mid = (${left} + ${right}) // 2 = ${mid}`, en: `mid = (${left} + ${right}) // 2 = ${mid}` }, [5],
      { vi: "Chọn điểm giữa trong đoạn còn lại.", en: "Choose the middle of the remaining interval." },
      { left, right, mid, phase: "mid" },
    );
    if (mid % 2 === 1) {
      snap(
        { vi: `mid % 2 == 1 → ${mid} là lẻ`, en: `mid % 2 == 1 → ${mid} is odd` }, [6],
        { vi: "Lùi về chỉ số chẵn để so sánh đúng một cặp [mid, mid+1].", en: "Move back to an even index so [mid, mid+1] is a complete pair." },
        { left, right, mid, phase: "align-check" },
      );
      mid -= 1;
      snap(
        { vi: `mid -= 1 → ${mid}`, en: `mid -= 1 → ${mid}` }, [7],
        { vi: "mid đã được căn thẳng vào đầu cặp kỳ vọng.", en: "mid is now aligned with an expected pair start." },
        { left, right, mid, midNext: mid + 1, phase: "align" },
      );
    } else {
      snap(
        { vi: `mid % 2 == 1 → False`, en: `mid % 2 == 1 → False` }, [6],
        { vi: "mid đã là chỉ số chẵn, giữ nguyên để kiểm tra cặp.", en: "mid is already even, so keep it as the pair start." },
        { left, right, mid, midNext: mid + 1, phase: "align" },
      );
    }
    const intactPair = nums[mid] === nums[mid + 1];
    snap(
      { vi: `nums[${mid}] == nums[${mid + 1}] → ${intactPair}`, en: `nums[${mid}] == nums[${mid + 1}] → ${intactPair}` }, [8],
      intactPair
        ? { vi: "Cặp còn nguyên, nên phần tử đơn phải ở bên phải cặp này.", en: "The pair is intact, so the single value must be to its right." }
        : { vi: "Cặp bị lệch tại đây, nên phần tử đơn nằm ở mid hoặc bên trái.", en: "The pair breaks here, so the single value lies at mid or to its left." },
      { left, right, mid, midNext: mid + 1, phase: "compare" },
    );
    if (intactPair) {
      left = mid + 2;
      snap(
        { vi: `left = mid + 2 → ${left}`, en: `left = mid + 2 → ${left}` }, [9],
        { vi: "Bỏ cả cặp nguyên và mọi phần tử bên trái nó.", en: "Discard this intact pair and everything to its left." },
        { left, right, mid, midNext: mid + 1, phase: "move-left" },
      );
    } else {
      snap(
        { vi: "else: cặp không nguyên", en: "else: pair is broken" }, [10],
        { vi: "Nửa phải sau mid không thể chứa phần tử đơn đầu tiên phá vỡ quy luật cặp.", en: "The right half after mid cannot contain the first value that breaks the pair rule." },
        { left, right, mid, midNext: mid + 1, phase: "else" },
      );
      right = mid;
      snap(
        { vi: `right = mid → ${right}`, en: `right = mid → ${right}` }, [11],
        { vi: "Giữ nửa trái, bao gồm mid, để tiếp tục tìm.", en: "Keep the left half, including mid, for the next search." },
        { left, right, mid, midNext: mid + 1, phase: "move-right" },
      );
    }
  }
  snap(
    { vi: `return nums[left] = ${nums[left]}`, en: `return nums[left] = ${nums[left]}` }, [12],
    { vi: "left và right đã hội tụ tại phần tử không có cặp.", en: "left and right converged on the value without a pair." },
    { left, right, mid: left, phase: "done", answer: nums[left], final: true },
  );
  return { original: [...nums], answer: nums[left], steps };
}

function buildSteps704(input, params = {}) {
  const nums = Array.isArray(input) ? input.map(Number) : parseIntegerList(input);
  const target = Number(params.target);
  if (!nums.length || nums.length > 18 || nums.some((value) => !Number.isSafeInteger(value)) || nums.some((value, index) => index && value <= nums[index - 1]) || !Number.isSafeInteger(target)) {
    throw new Error("Use 1 to 18 strictly increasing integers and an integer target.");
  }
  const steps = [];
  const snapshot = (title, line, note, extra = {}) => steps.push({
    title, arr: [...nums], highlight: [extra.left, extra.right, extra.mid].filter(Number.isInteger), mark: [], codeLines: [line],
    vars: [{ name: "left", value: extra.left ?? "-" }, { name: "right", value: extra.right ?? "-" }, { name: "mid", value: extra.mid ?? "-" }, { name: "target", value: target }],
    note, final: Boolean(extra.final),
    sequenceTraceView: { kind: "binary-target", nums: [...nums], left: extra.left ?? -1, right: extra.right ?? -1, mid: extra.mid ?? -1, target, comparison: extra.comparison ?? "", phase: extra.phase || "setup", answer: extra.answer ?? null },
  });

  let left = 0;
  let right = nums.length - 1;
  snapshot({ vi: "Khởi tạo vùng tìm kiếm", en: "Initialize search range" }, 3, { vi: "Vì nums đã tăng dần, so sánh với mid sẽ loại được một nửa vùng.", en: "Because nums is sorted, comparing mid discards half of the range." }, { left, right, phase: "setup" });
  while (left <= right) {
    snapshot({ vi: `left <= right: ${left} <= ${right}`, en: `left <= right: ${left} <= ${right}` }, 4, { vi: "Vùng [left..right] vẫn còn ứng viên.", en: "Range [left..right] still has a candidate." }, { left, right, phase: "loop" });
    const mid = Math.floor((left + right) / 2);
    snapshot({ vi: `mid = (${left} + ${right}) // 2 = ${mid}`, en: `mid = (${left} + ${right}) // 2 = ${mid}` }, 5, { vi: "Chọn phần tử giữa vùng hiện tại.", en: "Choose the current range's middle element." }, { left, right, mid, phase: "mid" });
    if (nums[mid] === target) {
      snapshot({ vi: `nums[${mid}] == target → ${nums[mid]} == ${target}`, en: `nums[${mid}] == target → ${nums[mid]} == ${target}` }, 6, { vi: "Đã tìm thấy target tại mid.", en: "The target is found at mid." }, { left, right, mid, comparison: "equal", phase: "found" });
      snapshot({ vi: `return ${mid}`, en: `return ${mid}` }, 7, { vi: "Chỉ số của target là đáp án.", en: "The target index is the answer." }, { left, right, mid, comparison: "equal", phase: "done", answer: mid, final: true });
      return { original: nums, target, answer: mid, steps };
    }
    if (nums[mid] < target) {
      snapshot({ vi: `${nums[mid]} < ${target} → True`, en: `${nums[mid]} < ${target} → True` }, 8, { vi: "Mọi giá trị từ left tới mid đều quá nhỏ, bỏ nửa trái.", en: "Every value from left through mid is too small, so discard the left half." }, { left, right, mid, comparison: "too-small", phase: "compare" });
      left = mid + 1;
      snapshot({ vi: `left = mid + 1 → ${left}`, en: `left = mid + 1 → ${left}` }, 9, { vi: "Giữ nửa phải còn có thể chứa target.", en: "Keep the right half that may still contain target." }, { left, right, mid, comparison: "too-small", phase: "move-right" });
    } else {
      snapshot({ vi: `${nums[mid]} < ${target} → False`, en: `${nums[mid]} < ${target} → False` }, 8, { vi: "nums[mid] lớn hơn target, nên target chỉ có thể ở nửa trái.", en: "nums[mid] is greater than target, so target can only be in the left half." }, { left, right, mid, comparison: "too-large", phase: "compare" });
      snapshot({ vi: "else", en: "else" }, 10, { vi: "Đi theo nhánh loại nửa phải.", en: "Follow the branch that discards the right half." }, { left, right, mid, comparison: "too-large", phase: "else" });
      right = mid - 1;
      snapshot({ vi: `right = mid - 1 → ${right}`, en: `right = mid - 1 → ${right}` }, 11, { vi: "Giữ nửa trái còn có thể chứa target.", en: "Keep the left half that may still contain target." }, { left, right, mid, comparison: "too-large", phase: "move-left" });
    }
  }
  snapshot({ vi: "return -1", en: "return -1" }, 12, { vi: "Vùng tìm kiếm đã rỗng, target không có trong nums.", en: "The search range is empty, so target is absent from nums." }, { left, right, phase: "not-found", answer: -1, final: true });
  return { original: nums, target, answer: -1, steps };
}

module.exports = Object.assign(module.exports, {
  704: {
    id: 704, difficulty: "easy", slug: "binary-search",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: { vi: "Binary Search", en: "Binary Search" },
    titleVi: { vi: "Tìm kiếm nhị phân", en: "Binary search in a sorted array" },
    statement: { vi: "Tìm chỉ số của target trong mảng nums tăng dần, hoặc trả -1 nếu không có.", en: "Find target's index in a sorted increasing array nums, or return -1 when it is absent." },
    defaultInput: "-1,0,3,5,9,12", inputKind: "integer", inputLabel: { vi: "nums đã sắp xếp", en: "sorted nums" },
    extraParams: [{ key: "target", type: "number", label: { vi: "target", en: "target" }, default: 9 }],
    approach: [
      { vi: "Giữ vùng ứng viên [left..right].", en: "Maintain the candidate range [left..right]." },
      { vi: "So sánh nums[mid] với target để bỏ nửa chắc chắn không thể chứa target.", en: "Compare nums[mid] with target to discard the half that cannot contain it." },
    ],
    complexity: { time: "O(log n)", space: "O(1)", note: { vi: "Mỗi vòng lặp giảm ít nhất một nửa số ứng viên.", en: "Each iteration removes at least half the candidates." } },
    code: [
      "class Solution:",
      "    def search(self, nums, target):",
      "        left, right = 0, len(nums) - 1",
      "        while left <= right:",
      "            mid = (left + right) // 2",
      "            if nums[mid] == target:",
      "                return mid",
      "            if nums[mid] < target:",
      "                left = mid + 1",
      "            else:",
      "                right = mid - 1",
      "        return -1",
    ],
    liveArgs: (input, params) => [Array.isArray(input) ? input.map(Number) : parseIntegerList(input), Number(params.target)],
    builder: buildSteps704,
  },
  540: {
    id: 540,
    difficulty: "medium",
    slug: "single-element-in-a-sorted-array",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: { vi: "Single Element in a Sorted Array", en: "Single Element in a Sorted Array" },
    titleVi: { vi: "Phần tử đơn trong mảng đã sắp xếp", en: "Find the unpaired value in a sorted array" },
    statement: { vi: "Trong mảng đã sắp xếp, mọi giá trị xuất hiện hai lần trừ một giá trị. Tìm giá trị đơn trong O(log n).", en: "In a sorted array, every value appears twice except one. Find the single value in O(log n)." },
    defaultInput: "1,1,2,3,3,4,4,8,8",
    inputKind: "integer", inputLabel: { vi: "nums đã sắp xếp", en: "sorted nums" }, extraParams: [],
    approach: [
      { vi: "Trước giá trị đơn, cặp bắt đầu ở chỉ số chẵn; sau đó pattern bị lệch.", en: "Before the single value, pairs start at even indices; afterward the pattern shifts." },
      { vi: "Căn mid về chỉ số chẵn rồi kiểm tra cặp [mid, mid+1].", en: "Align mid to an even index, then inspect the pair [mid, mid+1]." },
    ],
    complexity: { time: "O(log n)", space: "O(1)", note: { vi: "Mỗi lần loại bỏ xấp xỉ một nửa đoạn tìm kiếm.", en: "Each iteration discards roughly half the search interval." } },
    code: ["class Solution:", "    def singleNonDuplicate(self, nums):", "        left, right = 0, len(nums) - 1", "        while left < right:", "            mid = (left + right) // 2", "            if mid % 2 == 1:", "                mid -= 1", "            if nums[mid] == nums[mid + 1]:", "                left = mid + 2", "            else:", "                right = mid", "        return nums[left]"],
    builder: buildSteps540,
  },
  352: {
    id: 352,
    difficulty: "hard",
    slug: "data-stream-as-disjoint-intervals",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "design", vi: "Thiết kế", en: "Design" },
      { key: "ordered-set", vi: "Tập có thứ tự", en: "Ordered Set" },
    ],
    title: { vi: "Data Stream as Disjoint Intervals", en: "Data Stream as Disjoint Intervals" },
    titleVi: { vi: "Luồng dữ liệu thành các khoảng rời nhau", en: "Summarize a number stream as disjoint intervals" },
    statement: {
      vi: "Thiết kế SummaryRanges: addNum(value) thêm một số nguyên vào luồng, getIntervals() trả về các khoảng [start, end] rời nhau phủ toàn bộ số đã thấy, sắp theo start.",
      en: "Design SummaryRanges: addNum(value) feeds an integer into the stream and getIntervals() reports disjoint [start, end] intervals covering every number seen so far, sorted by start.",
    },
    defaultInput: "SummaryRanges(), addNum(1), getIntervals(), addNum(3), getIntervals(), addNum(7), getIntervals(), addNum(2), getIntervals(), addNum(6), getIntervals()",
    inputKind: "string",
    inputLabel: { vi: "Operations, ngăn cách bằng dấu phẩy hoặc |", en: "Operations separated by comma or |" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn cách visualize", en: "Visualization approach" },
        default: 2,
        options: [
          { value: 1, label: { vi: "Cách 1: Quét tuyến tính + hấp thụ", en: "Approach 1: Linear scan + absorb" } },
          { value: 2, label: { vi: "Cách 2: Binary search trên starts", en: "Approach 2: Binary search on starts" } },
        ],
      },
    ],
    approach: [
      {
        vi: "Giữ danh sách các khoảng rời nhau đã sắp xếp; đây là bất biến cần bảo vệ sau mỗi addNum.",
        en: "Maintain a sorted list of disjoint intervals; that invariant must survive every addNum.",
      },
      {
        vi: "Cách 1: quét từ trái, bỏ qua các khoảng kết thúc trước value−1, hấp thụ mọi khoảng chạm/chứa value thành new_interval rồi chèn lại.",
        en: "Approach 1: scan from the left, skip intervals ending before value−1, absorb every interval touching value into new_interval, then splice it back in.",
      },
      {
        vi: "Cách 2: binary search index đầu tiên có start > value; dựa vào prev/nxt để quyết định: đã phủ, cầu nối hai bên, mở rộng một bên, hoặc chèn mới.",
        en: "Approach 2: binary-search the first index with start > value; prev/nxt decide between covered, bridging both sides, extending one side, or inserting fresh.",
      },
      {
        vi: "getIntervals() trả nguyên trạng thái hiện tại vì danh sách luôn chuẩn hóa.",
        en: "getIntervals() simply returns the current state because the list is always normalized.",
      },
    ],
    complexity: {
      time: "addNum: O(log n) tìm + O(n) chèn · getIntervals: O(1)",
      space: "O(n)",
      note: {
        vi: "Binary search chỉ trả vị trí; chi phí chèn/xoá trên mảng vẫn O(n). Dùng balanced BST/Skip List thì addNum xuống O(log n) thực thụ.",
        en: "Binary search only locates the spot; array splicing stays O(n). A balanced BST/skip list makes addNum truly logarithmic.",
      },
    },
    codeLabel: { vi: "Cách 1 · Quét tuyến tính", en: "Approach 1 · Linear scan" },
    code2Label: { vi: "Cách 2 · Binary search", en: "Approach 2 · Binary search" },
    code: [
      "class SummaryRangesLinear:",
      "    \"\"\"Approach 1: scan and absorb every touching interval.\"\"\"",
      "",
      "    def __init__(self):",
      "        self.intervals = []",
      "",
      "    def addNum(self, value: int) -> None:",
      "        new_interval = [value, value]",
      "        i = 0",
      "        # Skip intervals that end at least 2 below value.",
      "        while i < len(self.intervals) and self.intervals[i][1] + 1 < new_interval[0]:",
      "            i += 1",
      "        # Absorb every overlapping or touching interval.",
      "        while i < len(self.intervals) and self.intervals[i][0] <= new_interval[1] + 1:",
      "            new_interval[0] = min(new_interval[0], self.intervals[i][0])",
      "            new_interval[1] = max(new_interval[1], self.intervals[i][1])",
      "            del self.intervals[i]",
      "        self.intervals.insert(i, new_interval)",
      "",
      "    def getIntervals(self):",
      "        return self.intervals",
    ],
    code2: [
      "class SummaryRanges:",
      "    \"\"\"Approach 2: binary search the insertion point over interval starts.\"\"\"",
      "",
      "    def __init__(self):",
      "        self.intervals = []",
      "",
      "    def addNum(self, value: int) -> None:",
      "        left, right = 0, len(self.intervals)",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if self.intervals[mid][0] <= value:",
      "                left = mid + 1",
      "            else:",
      "                right = mid",
      "        # left is now the first index whose start > value",
      "        prev = self.intervals[left - 1] if left > 0 else None",
      "        nxt = self.intervals[left] if left < len(self.intervals) else None",
      "        if prev and prev[0] <= value <= prev[1]:",
      "            return",
      "        if prev and nxt and prev[1] + 1 == value == nxt[0] - 1:",
      "            prev[1] = nxt[1]",
      "            self.intervals.pop(left)",
      "        elif prev and prev[1] + 1 == value:",
      "            prev[1] = value",
      "        elif nxt and nxt[0] - 1 == value:",
      "            nxt[0] = value",
      "        else:",
      "            self.intervals.insert(left, [value, value])",
      "",
      "    def getIntervals(self):",
      "        return self.intervals",
    ],
    builder: buildSteps352,
  },
});

// ─── 3161: Block Placement Queries ──────────────────────────────────────────
//
// We simulate the REVERSE-scan approach step by step:
//   - Sentinel obstacles 0 and N are always present.
//   - All type-1 queries are added to the sorted obstacle set up front.
//   - Then queries are scanned in REVERSE:
//       * type-1 → "remove" the obstacle (it hasn't been placed yet in forward
//                  time) and recompute the gap between its two neighbours.
//       * type-2 → answer using fenwick.get(prev_obstacle) >= sz OR x−prev >= sz
//
// The Fenwick tree stores MAX gap in any prefix [0..i].

function parseQueries3161(raw, label = "queries") {
  const text = String(raw ?? "").trim();
  if (!text) throw new Error(`${label} is required`);
  const rows = text.includes("[")
    ? (JSON.parse(text))
    : text.split(/[;\n]/).filter((r) => r.trim()).map((r) => r.split(",").map(Number));
  if (!Array.isArray(rows) || rows.some((r) => !Array.isArray(r) || r.length < 2 || r.some((v) => !Number.isInteger(v)))) {
    throw new Error(`${label} must be rows of integers like [[1,2],[2,3,1]] or 1,2;2,3,1`);
  }
  rows.forEach((r, idx) => {
    if (r[0] !== 1 && r[0] !== 2) throw new Error(`query ${idx}: type must be 1 or 2`);
    if (r[0] === 2 && r.length < 3) throw new Error(`query ${idx}: type-2 needs [2, x, sz]`);
    if (r.some((v) => v < 0)) throw new Error(`query ${idx}: all values must be non-negative`);
  });
  return rows.map((r) => r.map(Number));
}

function buildSteps3161(input, params = {}) {
  const queries = parseQueries3161(params.queries ?? "1,2;2,3,3;2,3,1;2,2,2", "queries");
  if (queries.length > 16) throw new Error("Use at most 16 queries for readable visualization.");

  const N = Math.max(50000, queries.reduce((m, q) => Math.max(m, q[1], q[0] === 2 ? q[1] + q[2] : 0), 0) + 1);
  const steps = [];

  // ── Fenwick max-tree ──────────────────────────────────────────────────────
  const fenwick = new Array(N + 2).fill(0);
  function fenwickMaximize(i, val) {
    for (; i <= N; i += i & -i) fenwick[i] = Math.max(fenwick[i], val);
  }
  function fenwickGet(i) {
    let res = 0;
    for (; i > 0; i -= i & -i) res = Math.max(res, fenwick[i]);
    return res;
  }

  // ── Sorted obstacle set ───────────────────────────────────────────────────
  const obstacleSet = new Set([0, N]);
  let sortedObs = () => [...obstacleSet].sort((a, b) => a - b);

  // Phase 0 — collect all type-1 x values and insert into obstacleSet
  queries.forEach((q) => { if (q[0] === 1) obstacleSet.add(q[1]); });

  const initialObs = sortedObs();
  const gapText = (obs) => {
    const a = obs || sortedObs();
    return a.length < 2 ? "[]"
      : a.slice(1).map((v, i) => `${a[i]}–${v}:${v - a[i]}`).join(" ");
  };

  // ── Intro ─────────────────────────────────────────────────────────────────
  function snap(o) {
    const obs = sortedObs();
    steps.push({
      title: o.title, note: o.note, codeLines: o.codeLines,
      arr: [], highlight: [], mark: [], vars: o.vars || [], final: o.final || false,
      blockQueriesView: {
        phase: o.phase,
        n: N,
        obstacles: [...obs],
        fenwick: fenwick.slice(0, Math.min(N + 1, 20)),
        queries,
        queryIndex: o.queryIndex ?? -1,
        currentQuery: o.currentQuery ?? null,
        prevObs: o.prevObs ?? null,
        nextObs: o.nextObs ?? null,
        gapUpdated: o.gapUpdated ?? null,
        queryAnswer: o.queryAnswer ?? null,
        answers: [...(o.answers || [])],
        fenwickQuery: o.fenwickQuery ?? null,
        fenwickResult: o.fenwickResult ?? null,
      },
    });
  }

  snap({
    title: { vi: `${queries.length} truy vấn trên trục số [0, ${N}]`, en: `${queries.length} queries on number line [0, ${N}]` },
    note: {
      vi: `Có 2 loại truy vấn: 1=[thêm chướng ngại vật tại x], 2=[kiểm tra có thể đặt block kích thước sz trong [0,x] không?]. Thuật toán: duyệt NGƯỢC + Fenwick max-tree lưu gap lớn nhất theo prefix.`,
      en: `Two query types: 1=[add obstacle at x], 2=[can a block of size sz fit in [0,x]?]. Algorithm: process in REVERSE + Fenwick max-tree storing the max gap in each prefix.`,
    },
    codeLines: [19, 20], phase: "init",
    vars: [
      { name: "N (sentinel)", value: N },
      { name: "queries", value: queries.length },
      { name: "type-1 count", value: queries.filter((q) => q[0] === 1).length },
      { name: "type-2 count", value: queries.filter((q) => q[0] === 2).length },
    ],
    answers: [],
  });

  snap({
    title: { vi: "Pre-insert tất cả chướng ngại vật từ truy vấn type-1", en: "Pre-insert all obstacles from type-1 queries" },
    note: {
      vi: `Nhóm lại tất cả chướng ngại vật type-1 để biết trạng thái ban đầu. Sau đó sẽ XÓA từng cái khi duyệt ngược (= chưa được thêm vào ở thời điểm đó). Obstacles: [${initialObs.join(", ")}].`,
      en: `Collect all type-1 obstacles upfront as the initial state. We will REMOVE each one as we process in reverse (= not yet placed at that point). Obstacles: [${initialObs.join(", ")}].`,
    },
    codeLines: [22, 23, 24, 25], phase: "preinsert",
    vars: [{ name: "obstacles", value: `[${initialObs.join(", ")}]` }, { name: "sentinels", value: `0, ${N}` }],
    answers: [],
  });

  // Phase 1 — build initial Fenwick from consecutive gaps
  for (let i = 0; i < initialObs.length - 1; i++) {
    const x1 = initialObs[i], x2 = initialObs[i + 1];
    fenwickMaximize(x2, x2 - x1);
  }

  snap({
    title: { vi: "Xây Fenwick max-tree từ các gap ban đầu", en: "Build Fenwick max-tree from initial gaps" },
    note: {
      vi: `Fenwick[i] = max gap trong prefix [0..i]. Với mỗi cặp (obs[j], obs[j+1]), gọi maximize(obs[j+1], gap). fenwick.get(x) = max gap trong [0..x].`,
      en: `Fenwick[i] = max gap in prefix [0..i]. For each pair (obs[j], obs[j+1]) call maximize(obs[j+1], gap). fenwick.get(x) = max gap in [0..x].`,
    },
    codeLines: [26, 27], phase: "build",
    vars: [{ name: "initial gaps", value: gapText(initialObs) }],
    answers: [],
  });

  // Phase 2 — process queries in reverse
  const answers = [];
  const revOrder = [...queries.keys()].reverse();

  snap({
    title: { vi: "Bắt đầu duyệt truy vấn theo thứ tự NGƯỢC", en: "Start processing queries in REVERSE order" },
    note: {
      vi: "Duyệt ngược để biến type-1 thành thao tác XÓA (phục hồi trạng thái trước khi obstacle được thêm). Type-2 được trả lời dựa trên trạng thái lúc đó.",
      en: "Reverse processing turns type-1 into REMOVE operations (restoring the state before the obstacle was placed). Type-2 queries are answered based on the state at that point.",
    },
    codeLines: [29], phase: "reverse-start",
    vars: [{ name: "process order", value: `i = ${queries.length - 1} → 0` }],
    answers: [],
  });

  for (const i of revOrder) {
    const q = queries[i];
    const type = q[0], x = q[1];
    const obs = sortedObs();

    if (type === 1) {
      // Find neighbours (x is in the set now; remove it after this step)
      const idx = obs.indexOf(x);
      const prev = obs[idx - 1] ?? 0;
      const next = obs[idx + 1] ?? N;

      snap({
        title: { vi: `i=${i}: Truy vấn 1 [thêm x=${x}] — NGƯỢC = XÓA x=${x}`, en: `i=${i}: Query 1 [add x=${x}] — REVERSED = REMOVE x=${x}` },
        note: {
          vi: `Duyệt ngược nghĩa là tại thời điểm này obstacle x=${x} chưa tồn tại. Xóa nó khỏi sorted set và cập nhật gap giữa prev=${prev} và next=${next}: gap = ${next - prev}. Gọi fenwick.maximize(${next}, ${next - prev}).`,
          en: `In reverse, obstacle x=${x} doesn't exist yet. Remove it from the sorted set and update the gap between prev=${prev} and next=${next}: gap = ${next - prev}. Call fenwick.maximize(${next}, ${next - prev}).`,
        },
        codeLines: [30, 31, 32, 33, 34, 35],
        phase: "type1",
        queryIndex: i, currentQuery: [...q],
        prevObs: prev, nextObs: next,
        gapUpdated: next - prev,
        vars: [
          { name: "i", value: i },
          { name: "type", value: 1 },
          { name: "x", value: x },
          { name: "prev obs", value: prev },
          { name: "next obs", value: next },
          { name: "new gap", value: next - prev },
        ],
        answers: [...answers].reverse(),
      });

      obstacleSet.delete(x);
      fenwickMaximize(next, next - prev);

    } else {
      // Type 2: check if block of size sz fits in [0, x]
      const sz = q[2];
      const obs2 = sortedObs();
      const prevIdx = obs2.filter((v) => v <= x).length - 1;
      const prev = obs2[prevIdx];
      const directGap = x - prev;
      const fenwickVal = fenwickGet(prev);
      const answer = fenwickVal >= sz || directGap >= sz;
      answers.unshift(answer);

      snap({
        title: { vi: `i=${i}: Truy vấn 2 [x=${x}, sz=${sz}] → ${answer ? "true" : "false"}`, en: `i=${i}: Query 2 [x=${x}, sz=${sz}] → ${answer ? "true" : "false"}` },
        note: {
          vi: `prev_obs ≤ x: prev=${prev}. Gap trực tiếp: x−prev = ${directGap}. Max gap trong [0..${prev}] = fenwick.get(${prev}) = ${fenwickVal}. Trả lời: (${fenwickVal} ≥ ${sz}) OR (${directGap} ≥ ${sz}) = ${answer}.`,
          en: `Largest obstacle ≤ x: prev=${prev}. Direct gap: x−prev = ${directGap}. Max gap in [0..${prev}] = fenwick.get(${prev}) = ${fenwickVal}. Answer: (${fenwickVal} ≥ ${sz}) OR (${directGap} ≥ ${sz}) = ${answer}.`,
        },
        codeLines: [36, 37, 38, 39, 40],
        phase: "type2",
        queryIndex: i, currentQuery: [...q],
        prevObs: prev, nextObs: null,
        gapUpdated: null,
        queryAnswer: answer,
        fenwickQuery: prev,
        fenwickResult: fenwickVal,
        vars: [
          { name: "i", value: i },
          { name: "type", value: 2 },
          { name: "x", value: x },
          { name: "sz", value: sz },
          { name: "prev obs", value: prev },
          { name: "x − prev", value: directGap },
          { name: `fenwick.get(${prev})`, value: fenwickVal },
          { name: "answer", value: String(answer) },
        ],
        answers: [...answers].reverse().length ? [...answers] : [],
      });
    }
  }

  const finalAnswers = [...answers];
  snap({
    title: { vi: `Kết quả: [${finalAnswers.map((v) => String(v)).join(", ")}]`, en: `Result: [${finalAnswers.map((v) => String(v)).join(", ")}]` },
    note: {
      vi: "Các câu trả lời type-2 đã được thu thập theo thứ tự ngược và đảo lại thành đúng thứ tự đề.",
      en: "Type-2 answers were collected in reverse order and flipped back to the original order.",
    },
    codeLines: [41], phase: "done", final: true,
    vars: [{ name: "answer", value: `[${finalAnswers.map((v) => String(v)).join(", ")}]` }],
    answers: finalAnswers,
  });

  return { input, answer: finalAnswers, steps };
}

Object.assign(module.exports, {
  3161: {
    id: 3161,
    difficulty: "hard",
    slug: "block-placement-queries",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "binary-search", vi: "Binary Search", en: "Binary Search" },
      { key: "segment-tree", vi: "Segment Tree / Fenwick Tree", en: "Segment Tree / Fenwick Tree" },
      { key: "sorted-set", vi: "Sorted Set", en: "Sorted Set" },
    ],
    title: { vi: "Block Placement Queries", en: "Block Placement Queries" },
    titleVi: { vi: "Truy vấn đặt block (Sorted Set + Fenwick max-tree)", en: "Block placement queries (Sorted Set + Fenwick max-tree)" },
    statement: {
      vi: "Cho dãy truy vấn trên trục số nguyên không âm. Truy vấn type 1 [1,x]: thêm chướng ngại vật tại x. Truy vấn type 2 [2,x,sz]: trả lời TRUE nếu có thể đặt block kích thước sz hoàn toàn trong [0,x] mà không chạm chướng ngại vật (được phép chạm). Điểm 0 luôn có chướng ngại vật ảo.",
      en: "Given queries on the non-negative integer line. Type 1 [1,x]: add an obstacle at x. Type 2 [2,x,sz]: return TRUE if a block of size sz can be placed entirely in [0,x] without overlapping any obstacle (touching is allowed). There is always a virtual obstacle at 0.",
    },
    defaultInput: [1],
    inputKind: "positive",
    singleInput: true,
    inputLabel: { vi: "n (không dùng trực tiếp, dùng extraParams)", en: "n (unused; configure queries below)" },
    extraParams: [
      {
        key: "queries", type: "string",
        label: { vi: "queries: type,x[,sz]; ... hoặc JSON [[1,2],[2,3,1],...]", en: "queries: type,x[,sz]; ... or JSON [[1,2],[2,3,1],...]" },
        default: "1,2;2,3,3;2,3,1;2,2,2",
      },
    ],
    approach: [
      { vi: "Sentinel 0 và N luôn là chướng ngại vật. Pre-insert tất cả type-1 vào sorted set.", en: "Sentinels 0 and N are always obstacles. Pre-insert all type-1 positions into a sorted set." },
      { vi: "Xây Fenwick max-tree: fenwick[i] lưu max gap của prefix [0..i]. Gọi maximize(obs_next, obs_next − obs_prev) cho mỗi cặp liên tiếp.", en: "Build a Fenwick max-tree: fenwick[i] stores the max gap in prefix [0..i]. Call maximize(obs_next, obs_next − obs_prev) for every consecutive pair." },
      { vi: "Duyệt NGƯỢC: type-1 trở thành XÓA obstacle (và cập nhật gap giữa 2 hàng xóm), type-2 trả lời bằng fenwick.get(prev_obs) >= sz OR x − prev_obs >= sz.", en: "Process in REVERSE: type-1 becomes REMOVE (update gap between neighbours), type-2 answers with fenwick.get(prev_obs) >= sz OR x − prev_obs >= sz." },
      { vi: "Đảo ngược mảng đáp án để lấy đúng thứ tự.", en: "Reverse the answer array to restore original query order." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: { vi: "Mỗi truy vấn thực hiện O(log N) trên Fenwick tree và bisect trên sorted set.", en: "Each query does O(log N) on the Fenwick tree and a bisect on the sorted set." },
    },
    code: [
      "class FenwickTree:",
      "    def __init__(self, n):",
      "        self.vals = [0] * (n + 1)",
      "    def maximize(self, i, val):",
      "        while i < len(self.vals):",
      "            self.vals[i] = max(self.vals[i], val)",
      "            i += i & -i",
      "    def get(self, i):",
      "        res = 0",
      "        while i > 0:",
      "            res = max(res, self.vals[i])",
      "            i -= i & -i",
      "        return res",
      "",
      "from sortedcontainers import SortedList",
      "from itertools import pairwise",
      "",
      "class Solution:",
      "    def getResults(self, queries):",
      "        N = min(50000, len(queries) * 3)",
      "        tree = FenwickTree(N + 1)",
      "        obstacles = SortedList([0, N])",
      "        for q in queries:",
      "            if q[0] == 1:",
      "                obstacles.add(q[1])",
      "        for x1, x2 in pairwise(obstacles):",
      "            tree.maximize(x2, x2 - x1)",
      "        ans = []",
      "        for q in reversed(queries):",
      "            if q[0] == 1:",
      "                x = q[1]",
      "                i = obstacles.index(x)",
      "                nxt, prv = obstacles[i+1], obstacles[i-1]",
      "                obstacles.remove(x)",
      "                tree.maximize(nxt, nxt - prv)",
      "            else:",
      "                x, sz = q[1], q[2]",
      "                i = obstacles.bisect_right(x)",
      "                prv = obstacles[i - 1]",
      "                ans.append(tree.get(prv) >= sz or x - prv >= sz)",
      "        return ans[::-1]",
    ],
    liveArgs(input, params = {}) {
      return [parseQueries3161(params.queries ?? "1,2;2,3,1;2,3,2", "queries")];
    },
    builder: buildSteps3161,
  },
});
