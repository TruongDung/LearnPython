const TJ68_LIMITS = Object.freeze({
  words: 20,
  maxWidth: 24,
  totalCharacters: 120,
});

function parse68Data(input, params = {}) {
  let words;

  if (Array.isArray(input)) {
    words = input.map((word) => String(word).trim());
  } else {
    const raw = String(input ?? "").trim();
    if (!raw) throw new Error("words must not be empty");

    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("not an array");
        words = parsed.map((word) => String(word).trim());
      } catch (_error) {
        throw new Error("words must be a valid JSON array or a comma-separated list");
      }
    } else {
      words = raw.split(/[,;|]/).map((word) => word.trim());
    }
  }

  const maxWidth = Number(params.maxWidth);
  if (!Number.isInteger(maxWidth) || maxWidth < 1 || maxWidth > TJ68_LIMITS.maxWidth) {
    throw new Error(`maxWidth must be an integer between 1 and ${TJ68_LIMITS.maxWidth} for visualization`);
  }
  if (!words.length) throw new Error("words must not be empty");
  if (words.length > TJ68_LIMITS.words) {
    throw new Error(`visualization supports at most ${TJ68_LIMITS.words} words`);
  }
  if (!words.every((word) => word.length > 0)) {
    throw new Error("every word must be non-empty");
  }
  if (!words.every((word) => /^[!-~]+$/.test(word))) {
    throw new Error("every word must use printable ASCII characters without whitespace");
  }
  if (words.some((word) => word.length > maxWidth)) {
    throw new Error("every word must be no longer than maxWidth");
  }
  const totalCharacters = words.reduce((sum, word) => sum + word.length, 0);
  if (totalCharacters > TJ68_LIMITS.totalCharacters) {
    throw new Error(`visualization supports at most ${TJ68_LIMITS.totalCharacters} word characters`);
  }

  return { words, maxWidth };
}

function buildSteps68(input, params = {}) {
  const { words, maxWidth } = parse68Data(input, params);
  const output = [];
  const steps = [];
  let start = 0;

  function snapshot({
    phase,
    codeLines,
    title,
    note,
    lineStart = start,
    end = lineStart,
    candidateIndex = null,
    letters = 0,
    fit = null,
    isLastLine = false,
    isSingleWord = false,
    totalSpaces = null,
    gapCount = 0,
    baseSpaces = null,
    extraSpaces = null,
    trailingSpaces = 0,
    gapWidths = [],
    completedGaps = 0,
    activeGap = null,
    partialLine = "",
    renderedLine = "",
    final = false,
  }) {
    const lineWords = words.slice(lineStart, end);
    steps.push({
      title,
      note,
      codeLines: Array.isArray(codeLines) ? codeLines : [codeLines],
      final,
      vars: [
        { name: "start", value: lineStart },
        { name: "end", value: end },
        { name: "letters", value: letters },
        ...(totalSpaces === null ? [] : [{ name: "total_spaces", value: totalSpaces }]),
        ...(baseSpaces === null ? [] : [{ name: "spaces, extra", value: `${baseSpaces}, ${extraSpaces}` }]),
        { name: "lines", value: output.length },
      ],
      textJustification68View: {
        phase,
        words: [...words],
        maxWidth,
        start: lineStart,
        end,
        candidateIndex,
        letters,
        minimumGaps: Math.max(0, end - lineStart - 1),
        fit: fit ? { ...fit } : null,
        lineWords,
        isLastLine,
        isSingleWord,
        totalSpaces,
        gapCount,
        baseSpaces,
        extraSpaces,
        trailingSpaces,
        gapWidths: [...gapWidths],
        completedGaps,
        activeGap,
        partialLine,
        renderedLine,
        output: [...output],
        final,
      },
    });
  }

  snapshot({
    phase: "init",
    codeLines: [5, 6],
    lineStart: 0,
    end: 0,
    title: { vi: "Bắt đầu với dòng kết quả rỗng", en: "Start with an empty output" },
    note: {
      vi: `Mỗi dòng phải có đúng ${maxWidth} ký tự. Ta sẽ tham lam lấy nhiều từ nhất có thể rồi phân phối toàn bộ khoảng trắng còn lại.`,
      en: `Every line must contain exactly ${maxWidth} characters. Greedily take as many words as fit, then distribute every remaining space.`,
    },
  });

  while (start < words.length) {
    let end = start + 1;
    let letters = words[start].length;

    snapshot({
      phase: "line-start",
      codeLines: [8, 9, 10],
      end,
      letters,
      title: { vi: `Mở dòng mới bằng “${words[start]}”`, en: `Open a new line with “${words[start]}”` },
      note: {
        vi: `Từ đầu tiên luôn bắt đầu dòng. letters = ${letters}; tiếp theo thử thêm từng từ cùng ít nhất một dấu cách cho mỗi khe.`,
        en: `The first word always starts the line. letters = ${letters}; now try each following word with at least one space per gap.`,
      },
    });

    while (end < words.length) {
      const candidate = words[end];
      const candidateLength = candidate.length;
      const prospectiveGaps = end - start;
      const usedWithMinimumSpaces = letters + candidateLength + prospectiveGaps;
      const fits = usedWithMinimumSpaces <= maxWidth;
      const fit = {
        word: candidate,
        lettersBefore: letters,
        candidateLength,
        prospectiveGaps,
        usedWithMinimumSpaces,
        fits,
      };

      snapshot({
        phase: fits ? "scan" : "reject",
        codeLines: [11, 12, 13],
        end,
        candidateIndex: end,
        letters,
        fit,
        title: fits
          ? { vi: `“${candidate}” vừa: ${usedWithMinimumSpaces} ≤ ${maxWidth}`, en: `“${candidate}” fits: ${usedWithMinimumSpaces} ≤ ${maxWidth}` }
          : { vi: `“${candidate}” không vừa: ${usedWithMinimumSpaces} > ${maxWidth}`, en: `“${candidate}” does not fit: ${usedWithMinimumSpaces} > ${maxWidth}` },
        note: {
          vi: `${letters} ký tự chữ + ${candidateLength} ký tự của từ mới + ${prospectiveGaps} khe tối thiểu = ${usedWithMinimumSpaces}. ${fits ? "Nhận từ này vào dòng." : "Khóa dòng hiện tại; từ này sẽ mở đầu dòng kế tiếp."}`,
          en: `${letters} letter characters + ${candidateLength} from the candidate + ${prospectiveGaps} minimum gaps = ${usedWithMinimumSpaces}. ${fits ? "Accept this word." : "Lock this line; the candidate will start the next one."}`,
        },
      });

      if (!fits) break;

      letters += candidateLength;
      end += 1;
      snapshot({
        phase: "accept",
        codeLines: [15, 16],
        end,
        candidateIndex: end - 1,
        letters,
        fit,
        title: { vi: `Nhận “${candidate}” · dòng có ${end - start} từ`, en: `Accept “${candidate}” · ${end - start} words packed` },
        note: {
          vi: `Cập nhật letters = ${letters}, end = ${end}. Ta vẫn thử nhét thêm từ nếu còn.`,
          en: `Update letters = ${letters} and end = ${end}. Keep trying while another word remains.`,
        },
      });
    }

    const wordCount = end - start;
    const isLastLine = end === words.length;
    const isSingleWord = wordCount === 1;

    snapshot({
      phase: "packed",
      codeLines: [18, 19],
      end,
      letters,
      isLastLine,
      isSingleWord,
      title: {
        vi: `Khóa ${wordCount} từ · ${isLastLine ? "dòng cuối" : isSingleWord ? "dòng một từ" : "căn đều"}`,
        en: `Lock ${wordCount} word${wordCount === 1 ? "" : "s"} · ${isLastLine ? "last line" : isSingleWord ? "single-word line" : "full justification"}`,
      },
      note: isLastLine || isSingleWord
        ? {
          vi: "Dòng cuối hoặc dòng chỉ có một từ dùng đúng một dấu cách giữa các từ, rồi bù khoảng trắng ở bên phải.",
          en: "A last or single-word line uses one space between words and puts all remaining padding on the right.",
        }
        : {
          vi: "Đây là dòng thường có nhiều từ, nên chia đều mọi khoảng trắng vào các khe và ưu tiên khe bên trái khi có dư.",
          en: "This is a non-final multiword line, so divide all spaces among gaps and give any remainder to the leftmost gaps.",
        },
    });

    const totalSpaces = maxWidth - letters;
    const gapCount = wordCount - 1;
    let gapWidths;
    let line;
    let baseSpaces;
    let extraSpaces;
    let trailingSpaces = 0;

    if (isLastLine || isSingleWord) {
      baseSpaces = gapCount > 0 ? 1 : 0;
      extraSpaces = 0;
      gapWidths = Array(gapCount).fill(1);
      trailingSpaces = totalSpaces - gapCount;
      line = words.slice(start, end).join(" ").padEnd(maxWidth);

      snapshot({
        phase: "left-justify",
        codeLines: [19, 20],
        end,
        letters,
        isLastLine,
        isSingleWord,
        totalSpaces,
        gapCount,
        baseSpaces,
        extraSpaces,
        trailingSpaces,
        gapWidths,
        completedGaps: gapCount,
        renderedLine: line,
        title: { vi: `Căn trái · bù ${trailingSpaces} dấu cách bên phải`, en: `Left justify · pad ${trailingSpaces} spaces on the right` },
        note: {
          vi: `Nối bằng một dấu cách tạo ${gapCount} khe, sau đó ljust thêm ${trailingSpaces} dấu cách để đạt đúng ${maxWidth} ký tự.`,
          en: `Join with one space across ${gapCount} gap${gapCount === 1 ? "" : "s"}, then ljust with ${trailingSpaces} trailing spaces to reach exactly ${maxWidth}.`,
        },
      });
    } else {
      [baseSpaces, extraSpaces] = [Math.floor(totalSpaces / gapCount), totalSpaces % gapCount];
      gapWidths = Array.from(
        { length: gapCount },
        (_unused, gap) => baseSpaces + (gap < extraSpaces ? 1 : 0),
      );

      snapshot({
        phase: "distribute",
        codeLines: [21, 22],
        end,
        letters,
        totalSpaces,
        gapCount,
        baseSpaces,
        extraSpaces,
        gapWidths,
        title: { vi: `${totalSpaces} khoảng trắng ÷ ${gapCount} khe = ${baseSpaces}, dư ${extraSpaces}`, en: `${totalSpaces} spaces ÷ ${gapCount} gaps = ${baseSpaces}, remainder ${extraSpaces}` },
        note: {
          vi: `Mỗi khe nhận ${baseSpaces} dấu cách; ${extraSpaces} khe ngoài cùng bên trái nhận thêm một dấu cách.`,
          en: `Every gap receives ${baseSpaces} spaces; the leftmost ${extraSpaces} gap${extraSpaces === 1 ? "" : "s"} receive one extra.`,
        },
      });

      const parts = [];
      for (let gap = 0; gap < gapCount; gap += 1) {
        parts.push(words[start + gap]);
        parts.push(" ".repeat(gapWidths[gap]));
        snapshot({
          phase: "gap",
          codeLines: [24, 25, 26, 27],
          end,
          letters,
          totalSpaces,
          gapCount,
          baseSpaces,
          extraSpaces,
          gapWidths,
          completedGaps: gap + 1,
          activeGap: gap,
          partialLine: parts.join(""),
          title: {
            vi: `Khe ${gap + 1}: ${gapWidths[gap]} dấu cách${gap < extraSpaces ? " (thêm 1)" : ""}`,
            en: `Gap ${gap + 1}: ${gapWidths[gap]} spaces${gap < extraSpaces ? " (one extra)" : ""}`,
          },
          note: gap < extraSpaces
            ? { vi: "Khe này nằm trong phần dư bên trái nên nhận base + 1.", en: "This gap is in the left remainder, so it receives base + 1." }
            : { vi: "Phần dư đã dùng hết; khe này nhận đúng số khoảng trắng cơ sở.", en: "The remainder is exhausted; this gap receives exactly the base width." },
        });
      }

      parts.push(words[end - 1]);
      line = parts.join("");
      snapshot({
        phase: "assembled",
        codeLines: [28, 29],
        end,
        letters,
        totalSpaces,
        gapCount,
        baseSpaces,
        extraSpaces,
        gapWidths,
        completedGaps: gapCount,
        renderedLine: line,
        title: { vi: `Ghép dòng đủ ${line.length}/${maxWidth} ký tự`, en: `Assemble an exact ${line.length}/${maxWidth}-character line` },
        note: {
          vi: "Ghép từ cuối sau tất cả các khe. Không có khoảng trắng thừa ở cuối một dòng căn đều thông thường.",
          en: "Append the final word after all gaps. A normal fully justified line has no trailing padding.",
        },
      });
    }

    output.push(line);
    snapshot({
      phase: "emit",
      codeLines: [31, 32],
      end,
      letters,
      isLastLine,
      isSingleWord,
      totalSpaces,
      gapCount,
      baseSpaces,
      extraSpaces,
      trailingSpaces,
      gapWidths,
      completedGaps: gapCount,
      renderedLine: line,
      title: { vi: `Lưu dòng ${output.length} · chuyển start = ${end}`, en: `Store line ${output.length} · advance start to ${end}` },
      note: {
        vi: `Dòng đã lưu có đúng ${line.length} ký tự. Mọi từ trong [${start}, ${end}) đã xử lý xong.`,
        en: `The stored line has exactly ${line.length} characters. Every word in [${start}, ${end}) is now complete.`,
      },
    });

    start = end;
  }

  snapshot({
    phase: "done",
    codeLines: [34],
    lineStart: words.length,
    end: words.length,
    renderedLine: output.at(-1) || "",
    final: true,
    title: { vi: `Hoàn tất ${output.length} dòng`, en: `Finished ${output.length} lines` },
    note: {
      vi: `Mỗi dòng có đúng ${maxWidth} ký tự, thứ tự từ được giữ nguyên, và mọi khoảng trắng dư trên dòng thường đã được ưu tiên từ trái sang phải.`,
      en: `Every line has exactly ${maxWidth} characters, word order is preserved, and remainder spaces on normal lines were assigned from left to right.`,
    },
  });

  return { input: [...words], answer: [...output], steps };
}

module.exports = {
  68: {
    id: 68,
    difficulty: "hard",
    slug: "text-justification",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: { vi: "Text Justification", en: "Text Justification" },
    titleVi: { vi: "Căn đều văn bản", en: "Fully justify text" },
    statement: {
      vi: "Cho mảng các từ words và độ rộng maxWidth. Sắp xếp các từ theo thứ tự vào các dòng đúng maxWidth ký tự. Dòng thường phải căn đều hai lề, phân phối khoảng trắng dư từ trái sang phải; dòng cuối căn trái.",
      en: "Given an array of words and maxWidth, pack the words in order into lines of exactly maxWidth characters. Fully justify normal lines, assigning extra spaces from left to right, and left-justify the final line.",
    },
    defaultInput: ["This", "is", "an", "example", "of", "text", "justification."],
    inputKind: "stringArray",
    inputLabel: { vi: "words (JSON hoặc ngăn cách bằng dấu phẩy)", en: "words (JSON or comma separated)" },
    extraParams: [
      { key: "maxWidth", type: "number", label: { vi: "maxWidth (độ rộng dòng)", en: "maxWidth (line width)" }, default: 16, min: 1, max: TJ68_LIMITS.maxWidth },
    ],
    approach: [
      { vi: "Với mỗi dòng, tham lam mở rộng end khi tổng độ dài chữ cộng số khe tối thiểu vẫn không vượt maxWidth.", en: "For each line, greedily advance end while letter lengths plus the minimum one-space gaps stay within maxWidth." },
      { vi: "Dòng cuối hoặc dòng một từ được nối bằng một dấu cách rồi bù toàn bộ khoảng trắng còn lại ở bên phải.", en: "Join the last line or a single-word line with one space, then put all remaining padding on the right." },
      { vi: "Với dòng thường, chia total_spaces cho số khe bằng divmod. Mỗi khe nhận phần nguyên; các khe bên trái nhận phần dư, mỗi khe thêm một.", en: "For a normal line, divmod total_spaces by the gap count. Every gap gets the quotient; the leftmost gaps each get one from the remainder." },
      { vi: "Ghép từng từ và độ rộng khe đã tính; mỗi dòng kết quả luôn dài đúng maxWidth và không đổi thứ tự từ.", en: "Join each word with its computed gap width; every result line is exactly maxWidth long and preserves word order." },
    ],
    complexity: {
      time: "O(total characters + output size)",
      space: "O(output size)",
      note: {
        vi: "Mỗi từ được quét một lần và mỗi ký tự đầu ra được tạo một lần. Danh sách kết quả chứa toàn bộ văn bản đã căn đều.",
        en: "Each word is scanned once and each output character is produced once. The returned list stores the fully justified text.",
      },
    },
    code: [
      "from typing import List",
      "",
      "class Solution:",
      "    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:",
      "        lines = []",
      "        start = 0",
      "",
      "        while start < len(words):",
      "            end = start + 1",
      "            letters = len(words[start])",
      "            while (",
      "                end < len(words)",
      "                and letters + len(words[end]) + (end - start) <= maxWidth",
      "            ):",
      "                letters += len(words[end])",
      "                end += 1",
      "",
      "            count = end - start",
      "            if end == len(words) or count == 1:",
      "                line = ' '.join(words[start:end]).ljust(maxWidth)",
      "            else:",
      "                spaces, extra = divmod(maxWidth - letters, count - 1)",
      "                parts = []",
      "                for gap in range(count - 1):",
      "                    parts.append(words[start + gap])",
      "                    width = spaces + (1 if gap < extra else 0)",
      "                    parts.append(' ' * width)",
      "                parts.append(words[end - 1])",
      "                line = ''.join(parts)",
      "",
      "            lines.append(line)",
      "            start = end",
      "",
      "        return lines",
    ],
    debugMode: "semantic",
    liveArgs(input, params = {}) {
      const { words, maxWidth } = parse68Data(input, params);
      return [words, maxWidth];
    },
    builder: buildSteps68,
  },
};
