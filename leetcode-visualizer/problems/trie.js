// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * Generate steps for LeetCode 208: Implement Trie (Prefix Tree).
 *
 * Visualize the prefix tree when:
 *  - insert(word): traverse/create nodes for each character, mark the last node as is_word.
 *  - search(word): traverse characters, return is_word of the last node.
 *  - startsWith(prefix): traverse characters, return True if traversal completes.
 */
function buildSteps208(input, params) {
  const words = String(input)
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const searchWord = (params.search || "").trim();
  const prefixWord = (params.prefix || "").trim();

  let idCounter = 0;
  const makeNode = (label, parentId) => ({
    id: idCounter++,
    label,
    parentId,
    isWord: false,
    children: {},
  });
  const root = makeNode("\u2022", null);
  const steps = [];

  // Tree layout: x by leaf order, y by depth.
  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((k) => dfs(node.children[k], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        label: node.label,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.isWord,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
      });
      return x;
    }
    dfs(root, 0);

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snapshot({
    title: { vi: "Khởi tạo Trie", en: "Initialize Trie" },
    codeLines: [7, 8],
    highlight: [root.id],
    vars: [{ name: "words", value: `[${words.join(", ")}]` }],
    note: {
      vi: `Tạo Trie rỗng chỉ có nút gốc. Sẽ chèn: [${words.join(", ")}].`,
      en: `Create an empty Trie with just a root node. Will insert: [${words.join(", ")}].`,
    },
  });

  for (const word of words) {
    let node = root;
    const path = [root.id];
    for (const ch of word) {
      let created = false;
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
        created = true;
      }
      node = node.children[ch];
      path.push(node.id);
      snapshot({
        title: { vi: `insert("${word}") · '${ch}'`, en: `insert("${word}") · '${ch}'` },
        codeLines: created ? [12, 13, 14, 15] : [12, 13, 15],
        highlight: [...path],
        vars: [
          { name: "op", value: `insert("${word}")` },
          { name: "ch", value: ch },
          { name: "newNode", value: created ? "yes" : "no" },
        ],
        note: {
          vi: created
            ? `Ký tự '${ch}' chưa có → tạo nút mới rồi đi xuống.`
            : `Ký tự '${ch}' đã tồn tại → đi theo nút có sẵn.`,
          en: created
            ? `Character '${ch}' is missing → create a node and descend.`
            : `Character '${ch}' already exists → follow the existing node.`,
        },
      });
    }
    node.isWord = true;
    snapshot({
      title: { vi: `insert("${word}") · xong`, en: `insert("${word}") · done` },
      codeLines: [16],
      highlight: [...path],
      vars: [
        { name: "op", value: `insert("${word}")` },
        { name: "is_word", value: "True" },
      ],
      note: {
        vi: `Đánh dấu nút cuối là kết thúc của từ "${word}" (is_word = True).`,
        en: `Mark the final node as the end of word "${word}" (is_word = True).`,
      },
    });
  }

  function traverse(target, isSearch, opLabel) {
    let node = root;
    const path = [root.id];
    for (const ch of target) {
      if (!node.children[ch]) {
        snapshot({
          title: { vi: `${opLabel} · thiếu '${ch}'`, en: `${opLabel} · missing '${ch}'` },
          codeLines: isSearch ? [20, 21, 22] : [28, 29, 30],
          highlight: [...path],
          vars: [
            { name: "op", value: opLabel },
            { name: "ch", value: ch },
            { name: "result", value: "False" },
          ],
          note: {
            vi: `Không có nhánh cho '${ch}' → trả về False.`,
            en: `No branch for '${ch}' → return False.`,
          },
        });
        return false;
      }
      node = node.children[ch];
      path.push(node.id);
      snapshot({
        title: { vi: `${opLabel} · '${ch}'`, en: `${opLabel} · '${ch}'` },
        codeLines: isSearch ? [20, 21, 23] : [28, 29, 31],
        highlight: [...path],
        vars: [
          { name: "op", value: opLabel },
          { name: "ch", value: ch },
        ],
        note: {
          vi: `Đi theo ký tự '${ch}'.`,
          en: `Follow character '${ch}'.`,
        },
      });
    }
    const result = isSearch ? node.isWord : true;
    snapshot({
      title: { vi: `${opLabel} · kết quả`, en: `${opLabel} · result` },
      codeLines: isSearch ? [24] : [32],
      highlight: [...path],
      vars: [
        { name: "op", value: opLabel },
        { name: "result", value: result ? "True" : "False" },
      ],
      note: {
        vi: isSearch
          ? `Hết "${target}": is_word = ${node.isWord ? "True" : "False"} → trả về ${result ? "True" : "False"}.`
          : `Đi hết tiền tố "${target}" → trả về True.`,
        en: isSearch
          ? `End of "${target}": is_word = ${node.isWord ? "True" : "False"} → return ${result ? "True" : "False"}.`
          : `Reached the end of prefix "${target}" → return True.`,
      },
    });
    return result;
  }

  const summary = [];
  if (searchWord) {
    const r = traverse(searchWord, true, `search("${searchWord}")`);
    summary.push(`search("${searchWord}") = ${r}`);
  }
  if (prefixWord) {
    const r = traverse(prefixWord, false, `startsWith("${prefixWord}")`);
    summary.push(`startsWith("${prefixWord}") = ${r}`);
  }

  if (steps.length) steps[steps.length - 1].final = true;
  const answer = summary.length ? summary.join("  |  ") : `inserted ${words.length} word(s)`;

  return { words, answer, steps };
}

/**
 * Generate steps for LeetCode 1804: Implement Trie II (Prefix Tree).
 *
 * Each node tracks:
 *  - prefixCount: how many words pass through this node.
 *  - wordCount: how many words end exactly at this node.
 *
 * Operations: insert, countWordsEqualTo, countWordsStartingWith, erase.
 */
function buildSteps1804(input, params) {
  const words = String(input)
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const countWord = (params.countWord || "").trim();
  const countPrefix = (params.countPrefix || "").trim();
  const eraseWord = (params.erase || "").trim();

  let idCounter = 0;
  const makeNode = (label, parentId) => ({
    id: idCounter++,
    label,
    parentId,
    prefixCount: 0,
    wordCount: 0,
    children: {},
  });
  const root = makeNode("\u2022", null);
  const steps = [];

  // Tree layout helper
  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((k) => dfs(node.children[k], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      const nodeLabel = node.label === "\u2022"
        ? "\u2022"
        : `${node.label} (p${node.prefixCount}${node.wordCount > 0 ? " w" + node.wordCount : ""})`;
      nodes.push({
        id: node.id,
        label: nodeLabel,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.wordCount > 0,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
      });
      return x;
    }
    dfs(root, 0);

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snapshot({
    title: { vi: "Khởi tạo Trie II", en: "Initialize Trie II" },
    codeLines: [6, 7],
    highlight: [root.id],
    vars: [{ name: "words", value: `[${words.join(", ")}]` }],
    note: {
      vi: `Trie II: mỗi nút có prefixCount và wordCount. Sẽ chèn: [${words.join(", ")}].`,
      en: `Trie II: each node has prefixCount and wordCount. Will insert: [${words.join(", ")}].`,
    },
  });

  // insert
  for (const word of words) {
    let node = root;
    const path = [root.id];
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
      }
      node = node.children[ch];
      node.prefixCount++;
      path.push(node.id);
    }
    node.wordCount++;

    snapshot({
      title: { vi: `insert("${word}")`, en: `insert("${word}")` },
      codeLines: [9, 10, 11, 12, 13, 14, 15],
      highlight: [...path],
      vars: [
        { name: "op", value: `insert("${word}")` },
        { name: "endNode.prefixCount", value: node.prefixCount },
        { name: "endNode.wordCount", value: node.wordCount },
      ],
      note: {
        vi: `Chèn "${word}": đi qua từng ký tự, tăng prefixCount; cuối cùng tăng wordCount. wordCount = ${node.wordCount}.`,
        en: `Insert "${word}": traverse each char, increment prefixCount; finally increment wordCount. wordCount = ${node.wordCount}.`,
      },
    });
  }

  const summary = [];

  // countWordsEqualTo
  if (countWord) {
    let node = root;
    const path = [root.id];
    let found = true;
    for (const ch of countWord) {
      if (!node.children[ch]) {
        found = false;
        break;
      }
      node = node.children[ch];
      path.push(node.id);
    }
    const result = found ? node.wordCount : 0;
    summary.push(`countWordsEqualTo("${countWord}") = ${result}`);
    snapshot({
      title: { vi: `countWordsEqualTo("${countWord}") = ${result}`, en: `countWordsEqualTo("${countWord}") = ${result}` },
      codeLines: [17, 18, 19, 20, 21, 22],
      highlight: [...path],
      vars: [
        { name: "op", value: `countWordsEqualTo("${countWord}")` },
        { name: "result", value: result },
      ],
      note: {
        vi: found
          ? `Đi hết "${countWord}", wordCount tại nút cuối = ${result}.`
          : `Không tìm thấy đường đi cho "${countWord}" → trả về 0.`,
        en: found
          ? `Reached end of "${countWord}", wordCount at the last node = ${result}.`
          : `Could not traverse "${countWord}" → return 0.`,
      },
    });
  }

  // countWordsStartingWith
  if (countPrefix) {
    let node = root;
    const path = [root.id];
    let found = true;
    for (const ch of countPrefix) {
      if (!node.children[ch]) {
        found = false;
        break;
      }
      node = node.children[ch];
      path.push(node.id);
    }
    const result = found ? node.prefixCount : 0;
    summary.push(`countWordsStartingWith("${countPrefix}") = ${result}`);
    snapshot({
      title: { vi: `countWordsStartingWith("${countPrefix}") = ${result}`, en: `countWordsStartingWith("${countPrefix}") = ${result}` },
      codeLines: [24, 25, 26, 27, 28, 29],
      highlight: [...path],
      vars: [
        { name: "op", value: `countWordsStartingWith("${countPrefix}")` },
        { name: "result", value: result },
      ],
      note: {
        vi: found
          ? `Đi hết "${countPrefix}", prefixCount tại nút cuối = ${result}.`
          : `Không tìm thấy đường đi cho "${countPrefix}" → trả về 0.`,
        en: found
          ? `Reached end of "${countPrefix}", prefixCount at the last node = ${result}.`
          : `Could not traverse "${countPrefix}" → return 0.`,
      },
    });
  }

  // erase
  if (eraseWord) {
    let node = root;
    const path = [root.id];
    let canErase = true;
    for (const ch of eraseWord) {
      if (!node.children[ch]) {
        canErase = false;
        break;
      }
      node = node.children[ch];
      path.push(node.id);
    }
    if (canErase && node.wordCount > 0) {
      // Perform erase: decrement prefixCount along path, decrement wordCount
      let cur = root;
      for (const ch of eraseWord) {
        cur = cur.children[ch];
        cur.prefixCount--;
      }
      cur.wordCount--;
      summary.push(`erase("${eraseWord}") → done`);
      snapshot({
        title: { vi: `erase("${eraseWord}")`, en: `erase("${eraseWord}")` },
        codeLines: [31, 32, 33, 34, 35, 36],
        highlight: [...path],
        vars: [
          { name: "op", value: `erase("${eraseWord}")` },
          { name: "endNode.prefixCount", value: cur.prefixCount },
          { name: "endNode.wordCount", value: cur.wordCount },
        ],
        note: {
          vi: `Xóa 1 bản "${eraseWord}": giảm prefixCount trên đường đi, giảm wordCount ở nút cuối. wordCount = ${cur.wordCount}.`,
          en: `Erase one copy of "${eraseWord}": decrement prefixCount along path, decrement wordCount at end. wordCount = ${cur.wordCount}.`,
        },
      });
    } else {
      summary.push(`erase("${eraseWord}") → word not found`);
      snapshot({
        title: { vi: `erase("${eraseWord}") - không tìm thấy`, en: `erase("${eraseWord}") - not found` },
        codeLines: [31, 32],
        highlight: [...path],
        vars: [
          { name: "op", value: `erase("${eraseWord}")` },
          { name: "result", value: "not found" },
        ],
        note: {
          vi: `Từ "${eraseWord}" không tồn tại trong Trie (wordCount = 0), không thể xóa.`,
          en: `Word "${eraseWord}" does not exist in the Trie (wordCount = 0), cannot erase.`,
        },
      });
    }
  }

  if (steps.length) steps[steps.length - 1].final = true;
  const answer = summary.length ? summary.join("  |  ") : `inserted ${words.length} word(s)`;

  return { words, answer, steps };
}

/**
 * Generate steps for LeetCode 211: Design Add and Search Words Data Structure.
 *
 * Trie + DFS with wildcard '.':
 *  - addWord: standard trie insert.
 *  - search: DFS; when encountering '.', branch into all children.
 */
function buildSteps211Legacy(input, params) {
  const words = String(input)
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const searchPattern = (params.search || "").trim();

  let idCounter = 0;
  const makeNode = (label, parentId) => ({
    id: idCounter++,
    label,
    parentId,
    isWord: false,
    children: {},
  });
  const root = makeNode("\u2022", null);
  const steps = [];

  // Tree layout helper
  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((k) => dfs(node.children[k], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        label: node.label,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.isWord,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
      });
      return x;
    }
    dfs(root, 0);

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Initialize
  snapshot({
    title: { vi: "Khởi tạo WordDictionary", en: "Initialize WordDictionary" },
    codeLines: [6, 7],
    highlight: [root.id],
    vars: [{ name: "words", value: `[${words.join(", ")}]` }],
    note: {
      vi: `Tạo Trie rỗng. Sẽ thêm: [${words.join(", ")}]. Pattern tìm kiếm: "${searchPattern}".`,
      en: `Create an empty Trie. Will add: [${words.join(", ")}]. Search pattern: "${searchPattern}".`,
    },
  });

  // addWord
  for (const word of words) {
    let node = root;
    const path = [root.id];
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
      }
      node = node.children[ch];
      path.push(node.id);
    }
    node.isWord = true;

    snapshot({
      title: { vi: `addWord("${word}")`, en: `addWord("${word}")` },
      codeLines: [10, 11, 12, 13, 14, 15],
      highlight: [...path],
      vars: [
        { name: "op", value: `addWord("${word}")` },
        { name: "is_word", value: "True" },
      ],
      note: {
        vi: `Chèn "${word}" vào Trie, đánh dấu nút cuối is_word = True.`,
        en: `Insert "${word}" into the Trie, mark the end node is_word = True.`,
      },
    });
  }

  // search with wildcard support
  if (searchPattern) {
    const searchPath = [];
    let searchResult = false;

    function dfsSearch(node, i, path) {
      if (i === searchPattern.length) {
        if (node.isWord) {
          searchResult = true;
          snapshot({
            title: { vi: `search("${searchPattern}") · kết thúc ✓`, en: `search("${searchPattern}") · end ✓` },
            codeLines: [19, 20],
            highlight: [...path],
            vars: [
              { name: "op", value: `search("${searchPattern}")` },
              { name: "i", value: i },
              { name: "is_word", value: "True" },
              { name: "result", value: "True" },
            ],
            note: {
              vi: `Đã duyệt hết pattern, nút hiện tại là kết thúc từ → True.`,
              en: `Reached end of pattern, current node is end of word → True.`,
            },
          });
          return true;
        }
        snapshot({
          title: { vi: `search("${searchPattern}") · kết thúc ✗`, en: `search("${searchPattern}") · end ✗` },
          codeLines: [19, 20],
          highlight: [...path],
          vars: [
            { name: "op", value: `search("${searchPattern}")` },
            { name: "i", value: i },
            { name: "is_word", value: "False" },
            { name: "result", value: "False (backtrack)" },
          ],
          note: {
            vi: `Đã duyệt hết pattern, nhưng nút hiện tại KHÔNG phải kết thúc từ → quay lui.`,
            en: `Reached end of pattern, but current node is NOT end of word → backtrack.`,
          },
        });
        return false;
      }

      const ch = searchPattern[i];

      if (ch === ".") {
        const childKeys = Object.keys(node.children).sort();
        snapshot({
          title: { vi: `search · '.' tại i=${i}`, en: `search · '.' at i=${i}` },
          codeLines: [21, 22, 23],
          highlight: [...path],
          vars: [
            { name: "op", value: `search("${searchPattern}")` },
            { name: "i", value: i },
            { name: "char", value: "." },
            { name: "branches", value: childKeys.join(", ") },
          ],
          note: {
            vi: `Gặp '.': thử tất cả nhánh con [${childKeys.join(", ")}].`,
            en: `Encountered '.': try all child branches [${childKeys.join(", ")}].`,
          },
        });

        for (const key of childKeys) {
          const child = node.children[key];
          const newPath = [...path, child.id];
          snapshot({
            title: { vi: `search · '.' → thử '${key}'`, en: `search · '.' → try '${key}'` },
            codeLines: [22, 23],
            highlight: [...newPath],
            vars: [
              { name: "op", value: `search("${searchPattern}")` },
              { name: "i", value: i },
              { name: "trying", value: key },
            ],
            note: {
              vi: `'.' khớp '${key}': đi xuống nhánh '${key}'.`,
              en: `'.' matches '${key}': descend into branch '${key}'.`,
            },
          });
          if (dfsSearch(child, i + 1, newPath)) return true;
        }
        return false;
      }

      // Regular character
      if (!node.children[ch]) {
        snapshot({
          title: { vi: `search · thiếu '${ch}'`, en: `search · missing '${ch}'` },
          codeLines: [26, 27],
          highlight: [...path],
          vars: [
            { name: "op", value: `search("${searchPattern}")` },
            { name: "i", value: i },
            { name: "char", value: ch },
            { name: "result", value: "False" },
          ],
          note: {
            vi: `Không có nhánh '${ch}' → trả về False.`,
            en: `No branch for '${ch}' → return False.`,
          },
        });
        return false;
      }

      const child = node.children[ch];
      const newPath = [...path, child.id];
      snapshot({
        title: { vi: `search · '${ch}' tại i=${i}`, en: `search · '${ch}' at i=${i}` },
        codeLines: [28],
        highlight: [...newPath],
        vars: [
          { name: "op", value: `search("${searchPattern}")` },
          { name: "i", value: i },
          { name: "char", value: ch },
        ],
        note: {
          vi: `Đi theo ký tự '${ch}'.`,
          en: `Follow character '${ch}'.`,
        },
      });
      return dfsSearch(child, i + 1, newPath);
    }

    dfsSearch(root, 0, [root.id]);

    // Final result step
    snapshot({
      title: { vi: `search("${searchPattern}") = ${searchResult}`, en: `search("${searchPattern}") = ${searchResult}` },
      codeLines: [29],
      highlight: [root.id],
      vars: [
        { name: "op", value: `search("${searchPattern}")` },
        { name: "result", value: searchResult ? "True" : "False" },
      ],
      note: {
        vi: `Kết quả: search("${searchPattern}") = ${searchResult}. ${searchResult ? "Tìm thấy từ khớp pattern." : "Không có từ nào khớp pattern."}`,
        en: `Result: search("${searchPattern}") = ${searchResult}. ${searchResult ? "A matching word was found." : "No word matches the pattern."}`,
      },
    });

    if (steps.length) steps[steps.length - 1].final = true;
    return { words, answer: `search("${searchPattern}") = ${searchResult}`, steps };
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { words, answer: `added ${words.length} word(s)`, steps };
}

/**
 * LeetCode 211: detailed Trie build + wildcard DFS visualization.
 * The view separates the build/search phases and preserves DFS branch history.
 */
function buildSteps211(input, params = {}) {
  const words = String(input).split(",").map((word) => word.trim()).filter(Boolean);
  const pattern = String(params.search || "").trim();
  let nextId = 0;
  const makeNode = (label, parentId) => ({ id: nextId++, label, parentId, isWord: false, children: {} });
  const root = makeNode("•", null);
  const steps = [];
  const callStack = [];
  const triedNodes = new Set();
  const failedNodes = new Set();
  let matchedPath = [];

  function addStep(opts) {
    const activePath = opts.path || [];
    const currentId = opts.current ? opts.current.id : null;
    const branchId = opts.branch ? opts.branch.id : null;
    const nodes = [];
    let xCursor = 0;
    function layout(node, depth) {
      const keys = Object.keys(node.children).sort();
      const childXs = keys.map((key) => layout(node.children[key], depth + 1));
      const x = childXs.length ? (childXs[0] + childXs[childXs.length - 1]) / 2 : xCursor++;
      const status = node.id === currentId ? "CUR" : node.id === branchId ? "TRY" : "";
      nodes.push({
        id: node.id,
        label: node.label,
        labelLines: status ? [node.label, status] : undefined,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.isWord,
        hl: activePath.includes(node.id) || node.id === branchId,
        isPruned: failedNodes.has(node.id) && !activePath.includes(node.id),
      });
      return x;
    }
    layout(root, 0);

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes, showLevels: false },
      wordDictionaryView: {
        phase: opts.phase,
        words: [...words],
        pattern,
        patternIndex: opts.patternIndex ?? null,
        currentWord: opts.currentWord || "",
        wordIndex: opts.wordIndex ?? null,
        charIndex: opts.charIndex ?? null,
        callStack: callStack.map((frame) => ({ ...frame })),
        branches: opts.branches || [],
        activeBranch: opts.activeBranch || "",
        triedBranches: opts.triedBranches || [],
        decision: opts.decision || "",
        result: opts.result,
        activePath: [...activePath],
        triedCount: triedNodes.size,
        failedCount: failedNodes.size,
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines,
      vars: [
        { name: "operation", value: opts.operation || "WordDictionary()" },
        { name: "pattern index i", value: opts.patternIndex ?? "—" },
        { name: "DFS call stack", value: callStack.length ? `[${callStack.map((frame) => `${frame.node}@${frame.i}`).join(" → ")}]` : "[]" },
        { name: "decision", value: opts.decision || "—" },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  addStep({
    phase: "build",
    title: { vi: "Pha 1 — Khởi tạo WordDictionary", en: "Phase 1 — Initialize WordDictionary" },
    codeLines: [7, 8],
    current: root,
    path: [root.id],
    decision: "root = TrieNode()",
    vars: [{ name: "words to add", value: `[${words.join(", ")}]` }],
    note: { vi: `Trie bắt đầu với node gốc •. Ta sẽ thêm ${words.length} từ theo từng ký tự để thấy node nào được tạo và node nào được dùng lại.`, en: `The Trie starts with root •. Add ${words.length} word(s) character by character to see which nodes are created or reused.` },
  });

  words.forEach((word, wordIndex) => {
    let node = root;
    const path = [root.id];
    addStep({
      phase: "build",
      title: { vi: `addWord("${word}") — bắt đầu`, en: `addWord("${word}") — start` },
      codeLines: [10, 11],
      current: root,
      path,
      currentWord: word,
      wordIndex,
      charIndex: 0,
      operation: `addWord("${word}")`,
      decision: "node = root",
      note: { vi: `Bắt đầu tại root. Mỗi ký tự sẽ tương ứng với một cạnh trong Trie.`, en: `Start at root. Each character corresponds to one Trie edge.` },
    });

    [...word].forEach((ch, charIndex) => {
      const exists = Boolean(node.children[ch]);
      addStep({
        phase: "build",
        title: { vi: `Kiểm tra cạnh '${ch}'`, en: `Check edge '${ch}'` },
        codeLines: [12, 13],
        current: node,
        path,
        currentWord: word,
        wordIndex,
        charIndex,
        operation: `addWord("${word}")`,
        decision: exists ? `cạnh '${ch}' đã có → dùng lại` : `chưa có '${ch}' → tạo node`,
        note: exists
          ? { vi: `Prefix này đã tồn tại, nên dùng lại node '${ch}' thay vì tạo bản sao.`, en: `This prefix already exists, so reuse node '${ch}' instead of duplicating it.` }
          : { vi: `Không có cạnh '${ch}' từ node hiện tại, nên cần tạo TrieNode mới.`, en: `The current node has no '${ch}' edge, so create a new TrieNode.` },
      });
      if (!exists) node.children[ch] = makeNode(ch, node.id);
      const child = node.children[ch];
      addStep({
        phase: "build",
        title: exists ? { vi: `Dùng lại node '${ch}'`, en: `Reuse node '${ch}'` } : { vi: `Tạo node '${ch}'`, en: `Create node '${ch}'` },
        codeLines: exists ? [15] : [14, 15],
        current: child,
        path: [...path, child.id],
        currentWord: word,
        wordIndex,
        charIndex,
        operation: `addWord("${word}")`,
        decision: exists ? "reuse + descend" : "create + descend",
        vars: [{ name: "created", value: exists ? "False" : "True" }],
        note: { vi: `Di chuyển node tới '${ch}'. Prefix hiện tại = "${word.slice(0, charIndex + 1)}".`, en: `Move node to '${ch}'. Current prefix = "${word.slice(0, charIndex + 1)}".` },
      });
      node = child;
      path.push(node.id);
    });
    node.isWord = true;
    addStep({
      phase: "build",
      title: { vi: `Đánh dấu kết thúc từ "${word}"`, en: `Mark end of word "${word}"` },
      codeLines: [16],
      current: node,
      path,
      currentWord: word,
      wordIndex,
      charIndex: word.length,
      operation: `addWord("${word}")`,
      decision: "is_word = True",
      vars: [{ name: "terminal word", value: word }],
      note: { vi: `Node cuối được đánh dấu is_word=True. Vòng xanh nghĩa là một từ hoàn chỉnh kết thúc tại đây.`, en: `Mark the last node is_word=True. The green ring means a complete word ends here.` },
    });
  });

  addStep({
    phase: "search",
    title: { vi: `Pha 2 — search("${pattern}")`, en: `Phase 2 — search("${pattern}")` },
    codeLines: [18, 19, 30],
    current: root,
    path: [root.id],
    patternIndex: 0,
    operation: `search("${pattern}")`,
    decision: "dfs(root, 0)",
    note: { vi: "DFS đọc pattern từ trái sang phải. Ký tự thường đi đúng một cạnh; dấu '.' phải thử lần lượt mọi cạnh con.", en: "DFS reads the pattern left to right. A literal follows one edge; '.' must try every child edge." },
  });

  function search(node, index, path, via = "root") {
    callStack.push({ node: node.label, i: index, via, suffix: pattern.slice(index) || "∅" });
    addStep({
      phase: "search",
      title: { vi: `Vào dfs(node='${node.label}', i=${index})`, en: `Enter dfs(node='${node.label}', i=${index})` },
      codeLines: [19],
      current: node,
      path,
      patternIndex: index,
      operation: `search("${pattern}")`,
      decision: `đang khớp suffix "${pattern.slice(index)}"`,
      note: { vi: `Push một frame DFS. i=${index} nghĩa là ${index} ký tự đầu đã khớp.`, en: `Push a DFS frame. i=${index} means the first ${index} pattern character(s) already matched.` },
    });

    if (index === pattern.length) {
      const result = node.isWord;
      if (result) matchedPath = [...path];
      addStep({
        phase: "search",
        title: result ? { vi: "Hết pattern và đang ở cuối từ → True", en: "Pattern ended at a complete word → True" } : { vi: "Hết pattern nhưng chưa phải cuối từ → False", en: "Pattern ended before a complete word → False" },
        codeLines: [20, 21],
        current: node,
        path,
        patternIndex: index,
        operation: `search("${pattern}")`,
        decision: `return is_word → ${result ? "True" : "False"}`,
        result,
        vars: [{ name: "node.is_word", value: result ? "True" : "False" }],
        note: result
          ? { vi: "Đã dùng hết pattern và node hiện tại có is_word=True, nên tìm thấy một từ hoàn chỉnh.", en: "The pattern is exhausted and the current node has is_word=True, so a complete word matched." }
          : { vi: "Khớp hết ký tự nhưng chỉ dừng ở prefix, không phải một từ đã thêm.", en: "All characters matched, but this is only a prefix, not an added word." },
      });
      callStack.pop();
      return result;
    }

    const ch = pattern[index];
    if (ch === ".") {
      const keys = Object.keys(node.children).sort();
      addStep({
        phase: "wildcard",
        title: { vi: `Wildcard '.' tại i=${index}`, en: `Wildcard '.' at i=${index}` },
        codeLines: [22, 23],
        current: node,
        path,
        patternIndex: index,
        branches: keys,
        operation: `search("${pattern}")`,
        decision: keys.length ? `thử ${keys.length} nhánh: ${keys.join(", ")}` : "không có nhánh con",
        note: { vi: `'.' khớp đúng một ký tự bất kỳ. DFS sẽ thử từng nhánh [${keys.join(", ") || "rỗng"}] và backtrack nếu nhánh đó thất bại.`, en: `'.' matches exactly one arbitrary character. DFS tries [${keys.join(", ") || "none"}] and backtracks after a failed branch.` },
      });
      const attempted = [];
      for (const key of keys) {
        const child = node.children[key];
        attempted.push(key);
        triedNodes.add(child.id);
        addStep({
          phase: "wildcard",
          title: { vi: `'.' thử nhánh '${key}'`, en: `'.' tries branch '${key}'` },
          codeLines: [23, 24],
          current: node,
          branch: child,
          path: [...path, child.id],
          patternIndex: index,
          branches: keys,
          activeBranch: key,
          triedBranches: attempted,
          operation: `search("${pattern}")`,
          decision: `dfs('${key}', ${index + 1})`,
          note: { vi: `Tạm xem '.' là '${key}' và đi sâu với ký tự pattern kế tiếp.`, en: `Temporarily let '.' match '${key}' and recurse on the next pattern character.` },
        });
        if (search(child, index + 1, [...path, child.id], `.${key}`)) {
          addStep({
            phase: "wildcard",
            title: { vi: `Nhánh '${key}' trả True → dừng`, en: `Branch '${key}' returned True → stop` },
            codeLines: [24, 25],
            current: node,
            path: matchedPath,
            patternIndex: index,
            branches: keys,
            activeBranch: key,
            triedBranches: attempted,
            operation: `search("${pattern}")`,
            decision: "return True (short-circuit)",
            result: true,
            note: { vi: `Một nhánh wildcard đã tìm thấy từ khớp, nên return True ngay và không thử các nhánh còn lại.`, en: `A wildcard branch found a match, so return True immediately without trying later branches.` },
          });
          callStack.pop();
          return true;
        }
        failedNodes.add(child.id);
        addStep({
          phase: "backtrack",
          title: { vi: `Nhánh '${key}' thất bại → backtrack`, en: `Branch '${key}' failed → backtrack` },
          codeLines: [23, 24],
          current: node,
          path,
          patternIndex: index,
          branches: keys,
          triedBranches: attempted,
          operation: `search("${pattern}")`,
          decision: "False → thử nhánh kế tiếp",
          result: false,
          note: { vi: `Nhánh '${key}' không khớp toàn bộ pattern. Tô đỏ nhánh đã thất bại và quay về frame trước.`, en: `Branch '${key}' did not match the whole pattern. Mark it failed and return to the previous frame.` },
        });
      }
      addStep({
        phase: "backtrack",
        title: { vi: "Mọi nhánh của '.' đều thất bại", en: "Every '.' branch failed" },
        codeLines: [26],
        current: node,
        path,
        patternIndex: index,
        branches: keys,
        triedBranches: attempted,
        operation: `search("${pattern}")`,
        decision: "return False",
        result: false,
        note: { vi: "Không nhánh con nào tạo được một từ hoàn chỉnh khớp pattern, nên frame này trả False.", en: "No child branch produced a complete matching word, so this frame returns False." },
      });
      callStack.pop();
      return false;
    }

    const child = node.children[ch];
    if (!child) {
      addStep({
        phase: "backtrack",
        title: { vi: `Không có cạnh '${ch}' → False`, en: `No '${ch}' edge → False` },
        codeLines: [27, 28],
        current: node,
        path,
        patternIndex: index,
        operation: `search("${pattern}")`,
        decision: `missing '${ch}' → return False`,
        result: false,
        note: { vi: `Ký tự thường phải khớp chính xác. Node hiện tại không có con '${ch}', nên nhánh này kết thúc.`, en: `A literal must match exactly. The current node has no '${ch}' child, so this branch ends.` },
      });
      callStack.pop();
      return false;
    }

    addStep({
      phase: "search",
      title: { vi: `Theo cạnh '${ch}'`, en: `Follow edge '${ch}'` },
      codeLines: [27, 29],
      current: node,
      branch: child,
      path: [...path, child.id],
      patternIndex: index,
      operation: `search("${pattern}")`,
      decision: `dfs('${ch}', ${index + 1})`,
      note: { vi: `Ký tự '${ch}' tồn tại, nên đi đúng một nhánh và tăng i lên ${index + 1}.`, en: `Literal '${ch}' exists, so follow that one edge and advance i to ${index + 1}.` },
    });
    const result = search(child, index + 1, [...path, child.id], ch);
    if (!result) failedNodes.add(child.id);
    addStep({
      phase: result ? "search" : "backtrack",
      title: { vi: `dfs('${ch}', ${index + 1}) trả ${result ? "True" : "False"}`, en: `dfs('${ch}', ${index + 1}) returned ${result ? "True" : "False"}` },
      codeLines: [29],
      current: node,
      path: result ? matchedPath : path,
      patternIndex: index,
      operation: `search("${pattern}")`,
      decision: `return ${result ? "True" : "False"}`,
      result,
      note: result
        ? { vi: `Nhánh '${ch}' khớp phần pattern còn lại, truyền True ngược lên call stack.`, en: `The '${ch}' branch matched the remaining pattern, so propagate True up the call stack.` }
        : { vi: `Nhánh '${ch}' thất bại, quay lui về node cha.`, en: `The '${ch}' branch failed, so backtrack to its parent.` },
    });
    callStack.pop();
    return result;
  }

  const result = pattern ? search(root, 0, [root.id]) : false;
  addStep({
    phase: "done",
    title: { vi: `Pha 3 — search("${pattern}") = ${result ? "True" : "False"}`, en: `Phase 3 — search("${pattern}") = ${result ? "True" : "False"}` },
    codeLines: [30],
    current: result && matchedPath.length ? null : root,
    path: result ? matchedPath : [root.id],
    patternIndex: pattern.length,
    operation: `search("${pattern}")`,
    decision: `final result = ${result ? "True" : "False"}`,
    result,
    vars: [{ name: "answer", value: result ? "True" : "False" }],
    note: result
      ? { vi: `Tìm thấy ít nhất một từ trong Trie khớp "${pattern}". Đường màu vàng/xanh là đường khớp thành công.`, en: `At least one Trie word matches "${pattern}". The highlighted path is the successful route.` }
      : { vi: `Đã thử mọi nhánh cần thiết nhưng không có từ hoàn chỉnh nào khớp "${pattern}".`, en: `Every required branch was tried, but no complete word matches "${pattern}".` },
    final: true,
  });
  return { words, pattern, answer: result, steps };
}

/**
 * Generate steps for LeetCode 648: Replace Words.
 *
 * Build a Trie from dictionary roots, then for each word in the sentence,
 * traverse the Trie to find the shortest root prefix.
 */
function buildSteps648(input, params) {
  const roots = String(input)
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const sentence = String((params && params.sentence) || "").trim();
  const sentenceWords = sentence.split(/\s+/).filter((w) => w.length > 0);

  let idCounter = 0;
  const makeNode = (label, parentId) => ({
    id: idCounter++,
    label,
    parentId,
    isRoot: false,
    rootWord: "",
    children: {},
  });
  const trieRoot = makeNode("\u2022", null);
  const steps = [];
  const resultWords = [];

  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((k) => dfs(node.children[k], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        label: node.label,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.isRoot,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
        sub: node.isRoot ? node.rootWord : "",
      });
      return x;
    }
    dfs(trieRoot, 0);

    const annotations = {};
    if (opts.currentNodeId !== undefined && opts.currentNodeId !== null) {
      annotations[opts.currentNodeId] = { label: "cur", kind: "current" };
    }
    if (opts.stopNodeId !== undefined && opts.stopNodeId !== null) {
      annotations[opts.stopNodeId] = { label: "ROOT", kind: "answer" };
    }
    if (opts.failNodeId !== undefined && opts.failNodeId !== null) {
      annotations[opts.failNodeId] = { label: "miss", kind: "pruned" };
    }

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes, annotations },
      replaceWordsView: {
        roots: roots.slice(),
        sentenceWords: sentenceWords.slice(),
        resultWords: resultWords.slice(),
        wordIndex: opts.wordIndex ?? null,
        word: opts.word || "",
        charIndex: opts.charIndex ?? null,
        prefix: opts.prefix || "",
        phase: opts.phase || "build",
        action: opts.action || "",
        foundRoot: opts.foundRoot || "",
        replacement: opts.replacement || "",
        missingChar: opts.missingChar || "",
        pathChars: opts.pathChars || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: [
        { name: "dictionary", value: `[${roots.join(", ")}]` },
        { name: "sentence", value: sentence || "(empty)" },
        { name: "result", value: resultWords.length ? resultWords.join(" ") : "[]" },
        ...(opts.vars || []),
      ],
      note: opts.note,
    });
  }

  snapshot({
    title: { vi: "Khởi tạo Trie từ dictionary", en: "Build Trie from dictionary" },
    codeLines: [9],
    highlight: [trieRoot.id],
    currentNodeId: trieRoot.id,
    note: {
      vi: "Trie bắt đầu chỉ có node gốc. Mỗi root trong dictionary sẽ được chèn theo từng ký tự.",
      en: "The Trie starts with only the root node. Each dictionary root will be inserted character by character.",
    },
  });

  for (const rootWord of roots) {
    let node = trieRoot;
    const path = [trieRoot.id];
    snapshot({
      title: { vi: `Dòng 11 · lấy root "${rootWord}"`, en: `Line 11 · take root "${rootWord}"` },
      codeLines: [11],
      highlight: [...path],
      currentNodeId: node.id,
      vars: [{ name: "w", value: rootWord }],
      phase: "build",
      action: "take-root",
      word: rootWord,
      note: {
        vi: `Bắt đầu chèn root "${rootWord}" từ dictionary vào Trie.`,
        en: `Start inserting dictionary root "${rootWord}" into the Trie.`,
      },
    });
    snapshot({
      title: { vi: "Dòng 12 · node = root", en: "Line 12 · node = root" },
      codeLines: [12],
      highlight: [...path],
      currentNodeId: node.id,
      vars: [
        { name: "w", value: rootWord },
        { name: "node", value: "root" },
      ],
      phase: "build",
      action: "reset-node",
      word: rootWord,
      note: {
        vi: "Mỗi root dictionary luôn bắt đầu đi từ node gốc của Trie.",
        en: "Each dictionary root always starts from the Trie root node.",
      },
    });

    for (let i = 0; i < rootWord.length; i += 1) {
      const ch = rootWord[i];
      snapshot({
        title: { vi: `Dòng 13 · đọc '${ch}'`, en: `Line 13 · read '${ch}'` },
        codeLines: [13],
        highlight: [...path],
        currentNodeId: node.id,
        vars: [
          { name: "w", value: rootWord },
          { name: "ch", value: ch },
          { name: "prefix", value: rootWord.slice(0, i + 1) },
          { name: "exists?", value: node.children[ch] ? "True" : "False" },
        ],
        phase: "build",
        action: "read-build-char",
        word: rootWord,
        charIndex: i,
        prefix: rootWord.slice(0, i + 1),
        pathChars: rootWord.slice(0, i).split(""),
        note: {
          vi: `Xét ký tự '${ch}' của root "${rootWord}". Kiểm tra từ node hiện tại đã có cạnh này chưa.`,
          en: `Read '${ch}' from root "${rootWord}" and check whether the current node already has this edge.`,
        },
      });

      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
        snapshot({
          title: { vi: `Dòng 14 · tạo node '${ch}'`, en: `Line 14 · create node '${ch}'` },
          codeLines: [14],
          highlight: [...path, node.children[ch].id],
          currentNodeId: node.id,
          vars: [
            { name: "w", value: rootWord },
            { name: "ch", value: ch },
            { name: "node.children[ch]", value: "new TrieNode()" },
          ],
          phase: "build",
          action: "create",
          word: rootWord,
          charIndex: i,
          prefix: rootWord.slice(0, i + 1),
          pathChars: rootWord.slice(0, i + 1).split(""),
          note: {
            vi: `Cạnh '${ch}' chưa tồn tại, nên dòng này tạo node con mới. Con trỏ node vẫn đang ở node cha.`,
            en: `The '${ch}' edge does not exist, so this line creates a new child. The node pointer is still at the parent.`,
          },
        });
      }

      node = node.children[ch];
      path.push(node.id);
      snapshot({
        title: { vi: `Dòng 15 · đi xuống '${ch}'`, en: `Line 15 · move to '${ch}'` },
        codeLines: [15],
        highlight: [...path],
        currentNodeId: node.id,
        vars: [
          { name: "w", value: rootWord },
          { name: "ch", value: ch },
          { name: "node", value: `child '${ch}'` },
        ],
        phase: "build",
        action: "move-child",
        word: rootWord,
        charIndex: i,
        prefix: rootWord.slice(0, i + 1),
        pathChars: rootWord.slice(0, i + 1).split(""),
        note: {
          vi: `Sau dòng này, con trỏ node đi xuống node ký tự '${ch}'.`,
          en: `After this line, the node pointer moves down to the '${ch}' node.`,
        },
      });
    }

    node.isRoot = true;
    snapshot({
      title: { vi: `Dòng 16 · is_root = True`, en: "Line 16 · is_root = True" },
      codeLines: [16],
      highlight: [...path],
      currentNodeId: node.id,
      stopNodeId: node.id,
      vars: [
        { name: "w", value: rootWord },
        { name: "node.is_root", value: "True" },
        { name: "node.word", value: "(empty)" },
      ],
      phase: "mark-root",
      action: "mark-root",
      word: rootWord,
      prefix: rootWord,
      pathChars: rootWord.split(""),
      note: {
        vi: `Node cuối của "${rootWord}" được đánh dấu là một root hợp lệ, nhưng chưa lưu word ở dòng này.`,
        en: `The last node of "${rootWord}" is marked as a valid root, but the word has not been stored yet on this line.`,
      },
    });

    node.rootWord = rootWord;
    snapshot({
      title: { vi: `Dòng 17 · word = "${rootWord}"`, en: `Line 17 · word = "${rootWord}"` },
      codeLines: [17],
      highlight: [...path],
      currentNodeId: node.id,
      stopNodeId: node.id,
      vars: [
        { name: "w", value: rootWord },
        { name: "node.is_root", value: "True" },
        { name: "node.word", value: rootWord },
      ],
      phase: "mark-root",
      action: "store-root-word",
      word: rootWord,
      prefix: rootWord,
      foundRoot: rootWord,
      pathChars: rootWord.split(""),
      note: {
        vi: `Lưu "${rootWord}" vào node terminal. Khi lookup gặp node này, ta có thể thay word bằng root này.`,
        en: `Store "${rootWord}" in the terminal node. During lookup, reaching this node allows replacing the word with this root.`,
      },
    });
  }

  for (let wordIndex = 0; wordIndex < sentenceWords.length; wordIndex += 1) {
    const word = sentenceWords[wordIndex];
    let node = trieRoot;
    const path = [trieRoot.id];
    let foundRoot = null;
    let missingChar = "";

    snapshot({
      title: { vi: `Dòng 20 · word = "${word}"`, en: `Line 20 · word = "${word}"` },
      codeLines: [20],
      highlight: [...path],
      currentNodeId: null,
      vars: [
        { name: "word", value: word },
        { name: "prefix", value: "" },
      ],
      phase: "lookup-start",
      action: "start",
      wordIndex,
      word,
      prefix: "",
      pathChars: [],
      note: {
        vi: `Lấy word thứ ${wordIndex + 1} trong sentence: "${word}".`,
        en: `Take sentence word ${wordIndex + 1}: "${word}".`,
      },
    });
    snapshot({
      title: { vi: "Dòng 21 · node = root", en: "Line 21 · node = root" },
      codeLines: [21],
      highlight: [...path],
      currentNodeId: trieRoot.id,
      vars: [
        { name: "word", value: word },
        { name: "node", value: "root" },
        { name: "prefix", value: "" },
      ],
      phase: "lookup-start",
      action: "lookup-reset-node",
      wordIndex,
      word,
      prefix: "",
      pathChars: [],
      note: {
        vi: `Bắt đầu lookup "${word}" từ root của Trie.`,
        en: `Start looking up "${word}" from the Trie root.`,
      },
    });

    for (let i = 0; i < word.length; i += 1) {
      const ch = word[i];
      snapshot({
        title: { vi: `Dòng 22 · đọc '${ch}'`, en: `Line 22 · read '${ch}'` },
        codeLines: [22],
        highlight: [...path],
        currentNodeId: node.id,
        stopNodeId: node.isRoot ? node.id : null,
        vars: [
          { name: "word", value: word },
          { name: "ch", value: ch },
          { name: "prefix", value: word.slice(0, i) || "" },
          { name: "node.is_root", value: node.isRoot ? "True" : "False" },
        ],
        phase: node.isRoot ? "found-root" : "lookup",
        action: "read-word-char",
        wordIndex,
        word,
        charIndex: i,
        prefix: word.slice(0, i),
        foundRoot: node.isRoot ? node.rootWord : "",
        pathChars: word.slice(0, i).split(""),
        note: {
          vi: `Chuẩn bị xử lý ký tự '${ch}'. Trước khi đi tiếp, kiểm tra node hiện tại có phải root không.`,
          en: `Prepare to process '${ch}'. Before moving, check whether the current node is already a root.`,
        },
      });

      if (node.isRoot) {
        foundRoot = node.rootWord;
        snapshot({
          title: { vi: `Dòng 23 · gặp root "${foundRoot}"`, en: `Line 23 · found root "${foundRoot}"` },
          codeLines: [23],
          highlight: [...path],
          currentNodeId: node.id,
          stopNodeId: node.id,
          vars: [
            { name: "word", value: word },
            { name: "prefix", value: foundRoot },
            { name: "next char", value: ch },
          ],
          phase: "found-root",
          action: "stop-shortest",
          wordIndex,
          word,
          charIndex: i,
          prefix: foundRoot,
          foundRoot,
          pathChars: foundRoot.split(""),
          note: {
            vi: `Điều kiện đúng: node hiện tại đã là root "${foundRoot}". Đây là root ngắn nhất vì ta đọc từ trái sang phải.`,
            en: `The condition is true: the current node is root "${foundRoot}". It is the shortest root because we scan left to right.`,
          },
        });
        snapshot({
          title: { vi: "Dòng 24 · break", en: "Line 24 · break" },
          codeLines: [24],
          highlight: [...path],
          currentNodeId: node.id,
          stopNodeId: node.id,
          vars: [
            { name: "word", value: word },
            { name: "prefix", value: foundRoot },
            { name: "break", value: "stop scanning word" },
          ],
          phase: "found-root",
          action: "break-shortest-root",
          wordIndex,
          word,
          charIndex: i,
          prefix: foundRoot,
          foundRoot,
          pathChars: foundRoot.split(""),
          note: {
            vi: `Dừng vòng lặp ký tự ngay tại root "${foundRoot}". Không cần đọc phần còn lại của "${word}".`,
            en: `Stop the character loop at root "${foundRoot}". The rest of "${word}" does not need to be read.`,
          },
        });
        break;
      }
      if (!node.children[ch]) {
        missingChar = ch;
        snapshot({
          title: { vi: `Dòng 25 · thiếu cạnh '${ch}'`, en: `Line 25 · missing '${ch}' edge` },
          codeLines: [25],
          highlight: [...path],
          currentNodeId: node.id,
          failNodeId: node.id,
          vars: [
            { name: "word", value: word },
            { name: "prefix tried", value: word.slice(0, i + 1) },
            { name: "missing char", value: ch },
          ],
          phase: "miss",
          action: "missing-edge",
          wordIndex,
          word,
          charIndex: i,
          prefix: word.slice(0, i + 1),
          missingChar: ch,
          pathChars: word.slice(0, i).split(""),
          note: {
            vi: `Điều kiện đúng: từ node hiện tại không có cạnh '${ch}', nên lookup thất bại cho "${word}".`,
            en: `The condition is true: the current node has no '${ch}' edge, so lookup fails for "${word}".`,
          },
        });
        snapshot({
          title: { vi: "Dòng 26 · break", en: "Line 26 · break" },
          codeLines: [26],
          highlight: [...path],
          currentNodeId: node.id,
          failNodeId: node.id,
          vars: [
            { name: "word", value: word },
            { name: "missing char", value: ch },
            { name: "break", value: "no matching root" },
          ],
          phase: "miss",
          action: "break-missing-edge",
          wordIndex,
          word,
          charIndex: i,
          prefix: word.slice(0, i + 1),
          missingChar: ch,
          pathChars: word.slice(0, i).split(""),
          note: {
            vi: `Dừng vòng lặp ký tự. Vì không tới root nào, "${word}" sẽ được giữ nguyên ở dòng append.`,
            en: `Stop the character loop. Since no root was reached, "${word}" will be kept at append time.`,
          },
        });
        break;
      }
      node = node.children[ch];
      path.push(node.id);
      snapshot({
        title: { vi: `Dòng 27 · node = child '${ch}'`, en: `Line 27 · node = child '${ch}'` },
        codeLines: [27],
        highlight: [...path],
        currentNodeId: node.id,
        vars: [
          { name: "word", value: word },
          { name: "i", value: i },
          { name: "prefix", value: word.slice(0, i + 1) },
          { name: "node.is_root", value: node.isRoot ? "True" : "False" },
        ],
        phase: node.isRoot ? "candidate-root" : "lookup",
        action: node.isRoot ? "candidate-root" : "read-char",
        wordIndex,
        word,
        charIndex: i,
        prefix: word.slice(0, i + 1),
        foundRoot: node.isRoot ? node.rootWord : "",
        pathChars: word.slice(0, i + 1).split(""),
        note: node.isRoot
          ? {
              vi: `Sau khi đi xuống '${ch}', prefix "${node.rootWord}" đã là root trong dictionary.`,
              en: `After moving to '${ch}', prefix "${node.rootWord}" is a dictionary root.`,
            }
          : {
              vi: `Sau khi đi xuống '${ch}', prefix "${word.slice(0, i + 1)}" vẫn chưa phải root.`,
              en: `After moving to '${ch}', prefix "${word.slice(0, i + 1)}" is not a root yet.`,
            },
      });
    }

    if (!foundRoot && node.isRoot) foundRoot = node.rootWord;
    const replacement = foundRoot || word;
    resultWords.push(replacement);

    snapshot({
      title: {
        vi: foundRoot ? `Dòng 28 · append "${foundRoot}"` : `Dòng 28 · append "${word}"`,
        en: foundRoot ? `Line 28 · append "${foundRoot}"` : `Line 28 · append "${word}"`,
      },
      codeLines: [28],
      highlight: [...path],
      currentNodeId: node.id,
      stopNodeId: foundRoot ? node.id : null,
      failNodeId: !foundRoot && missingChar ? node.id : null,
      vars: [
        { name: "word", value: word },
        { name: "found_root", value: foundRoot || "none" },
        { name: "replacement", value: replacement },
      ],
      phase: foundRoot ? "replace" : "keep",
      action: foundRoot ? "replace" : "keep",
      wordIndex,
      word,
      prefix: foundRoot || "",
      foundRoot: foundRoot || "",
      replacement,
      pathChars: (foundRoot || word).split(""),
      note: {
        vi: foundRoot
          ? `Thêm "${foundRoot}" vào kết quả vì đó là root ngắn nhất của "${word}".`
          : `Không tìm được root cho "${word}", nên thêm chính từ gốc vào kết quả.`,
        en: foundRoot
          ? `Append "${foundRoot}" because it is the shortest root for "${word}".`
          : `No root was found for "${word}", so append the original word.`,
      },
    });
  }

  const answer = resultWords.join(" ");
  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [29],
    highlight: [trieRoot.id],
    vars: [{ name: "result", value: answer }],
    phase: "done",
    action: "done",
    note: {
      vi: `Câu sau khi thay thế: "${answer}".`,
      en: `Sentence after replacement: "${answer}".`,
    },
  });
  steps[steps.length - 1].final = true;

  return { roots, sentence, answer, steps };
}

/**
 * LeetCode 676: Implement Magic Dictionary.
 * Trie + search with exactly one character changed.
 */
function buildSteps676(input, params) {
  const words = String(input).split(",").map((w) => w.trim()).filter(Boolean);
  const searchWords = (params.search || "").split(",").map((w) => w.trim()).filter(Boolean);

  let idCounter = 0;
  const makeNode = (label, parentId) => ({ id: idCounter++, label, parentId, isWord: false, children: {} });
  const root = makeNode("\u2022", null);
  const steps = [];

  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) { x = nextX++; }
      else { const xs = keys.map((k) => dfs(node.children[k], depth + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
      nodes.push({ id: node.id, label: node.label, x, y: depth, parentId: node.parentId, isWord: node.isWord, hl: opts.highlight ? opts.highlight.includes(node.id) : false });
      return x;
    }
    dfs(root, 0);
    steps.push({ title: opts.title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note });
  }

  snapshot({ title: { vi: "Khởi tạo", en: "Initialize" }, highlight: [root.id], vars: [{ name: "words", value: words.join(", ") }], note: { vi: `Chèn từ điển: [${words.join(", ")}].`, en: `Build dictionary: [${words.join(", ")}].` } });

  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = makeNode(ch, node.id);
      node = node.children[ch];
    }
    node.isWord = true;
  }
  snapshot({ title: { vi: "Trie đã xây", en: "Trie built" }, highlight: [], vars: [{ name: "words", value: words.join(", ") }], note: { vi: "Tất cả từ đã chèn vào Trie.", en: "All words inserted into Trie." } });

  function dfsSearch(node, word, idx, misses, path) {
    if (idx === word.length) return node.isWord && misses === 1;
    const ch = word[idx];
    for (const key of Object.keys(node.children).sort()) {
      const newMiss = misses + (key !== ch ? 1 : 0);
      if (newMiss > 1) continue;
      if (dfsSearch(node.children[key], word, idx + 1, newMiss, path)) {
        path.push(node.children[key].id);
        return true;
      }
    }
    return false;
  }

  const results = [];
  for (const sw of searchWords) {
    const path = [];
    const found = dfsSearch(root, sw, 0, 0, path);
    path.push(root.id);
    path.reverse();
    results.push(`search("${sw}") = ${found}`);
    snapshot({
      title: { vi: `search("${sw}")`, en: `search("${sw}")` },
      highlight: found ? path : [],
      vars: [{ name: "word", value: sw }, { name: "result", value: found ? "True" : "False" }],
      note: {
        vi: found ? `"${sw}" có thể đạt được bằng cách đổi đúng 1 ký tự → True.` : `"${sw}" không thể đổi đúng 1 ký tự để khớp → False.`,
        en: found ? `"${sw}" can be reached by changing exactly 1 character → True.` : `"${sw}" cannot match with exactly 1 change → False.`,
      },
    });
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { words, answer: results.join(" | "), steps };
}

/**
 * LeetCode 1268: Search Suggestions System.
 * Trie + DFS to find top-3 suggestions for each prefix while typing.
 */
function buildSteps1268(input, params) {
  const products = String(input).split(",").map((w) => w.trim()).filter(Boolean).sort();
  const searchWord = (params.searchWord || "").trim();

  let idCounter = 0;
  const makeNode = (label, parentId) => ({ id: idCounter++, label, parentId, isWord: false, children: {} });
  const root = makeNode("\u2022", null);
  const steps = [];

  // Map word → terminal node id (for highlighting suggestions)
  const wordNodeId = {};

  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) { x = nextX++; }
      else { const xs = keys.map((k) => dfs(node.children[k], depth + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
      nodes.push({ id: node.id, label: node.label, x, y: depth, parentId: node.parentId, isWord: node.isWord, hl: opts.highlight ? opts.highlight.includes(node.id) : false });
      return x;
    }
    dfs(root, 0);
    steps.push({ title: opts.title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note });
  }

  // Insert all products and show each insertion
  for (const word of products) {
    let node = root;
    const insertPath = [root.id];
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = makeNode(ch, node.id);
      node = node.children[ch];
      insertPath.push(node.id);
    }
    node.isWord = true;
    wordNodeId[word] = node.id;
    snapshot({
      title: { vi: `Chèn "${word}"`, en: `Insert "${word}"` },
      codeLines: [5, 6, 7, 8, 9],
      highlight: insertPath,
      vars: [{ name: "word", value: word }],
      note: { vi: `Chèn "${word}" vào Trie. Đánh dấu nút cuối là is_word.`, en: `Insert "${word}" into Trie. Mark the end node as is_word.` },
    });
  }

  snapshot({
    title: { vi: "Trie hoàn chỉnh", en: "Trie complete" },
    codeLines: [4],
    highlight: [],
    vars: [{ name: "products", value: products.join(", ") }],
    note: { vi: `Đã chèn ${products.length} sản phẩm (đã sắp xếp). Bắt đầu gõ "${searchWord}".`, en: `Inserted ${products.length} products (sorted). Start typing "${searchWord}".` },
  });

  function collectWords(node, prefix, result) {
    if (result.length >= 3) return;
    if (node.isWord) result.push(prefix);
    for (const ch of Object.keys(node.children).sort()) {
      collectWords(node.children[ch], prefix + ch, result);
      if (result.length >= 3) return;
    }
  }

  const allSuggestions = [];
  let node = root;
  let prefix = "";
  const path = [root.id];
  for (const ch of searchWord) {
    prefix += ch;
    if (!node.children[ch]) {
      allSuggestions.push([]);
      snapshot({
        title: { vi: `Gõ "${prefix}" — không có`, en: `Type "${prefix}" — missing` },
        codeLines: [13, 14],
        highlight: [...path],
        vars: [
          { name: "prefix", value: prefix },
          { name: "suggestions", value: "[]" },
          { name: "reason", value: `no branch '${ch}'` },
        ],
        note: { vi: `Không có nhánh '${ch}' → gợi ý rỗng. Các ký tự sau cũng rỗng.`, en: `No branch '${ch}' → empty suggestions. All subsequent characters too.` },
      });
      // Remaining characters also empty
      for (let k = prefix.length; k < searchWord.length; k++) {
        allSuggestions.push([]);
      }
      node = null;
      break;
    }
    node = node.children[ch];
    path.push(node.id);
    const sugg = [];
    collectWords(node, prefix, sugg);
    allSuggestions.push(sugg);

    // Highlight path + suggestion word-end nodes
    const suggHl = sugg.map((w) => wordNodeId[w]).filter(Boolean);
    snapshot({
      title: { vi: `Gõ "${prefix}"`, en: `Type "${prefix}"` },
      codeLines: [11, 12, 15, 16],
      highlight: [...path, ...suggHl],
      vars: [
        { name: "prefix", value: prefix },
        { name: "suggestions", value: `[${sugg.join(", ")}]` },
        { name: "count", value: sugg.length },
      ],
      note: {
        vi: `Tiền tố "${prefix}" → top-3 gợi ý: [${sugg.join(", ")}]. DFS trên nhánh '${ch}' thu được ${sugg.length} kết quả.`,
        en: `Prefix "${prefix}" → top-3 suggestions: [${sugg.join(", ")}]. DFS from branch '${ch}' collected ${sugg.length} result(s).`,
      },
    });
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { products, searchWord, answer: allSuggestions, steps };
}

/**
 * LeetCode 1166: Design File System.
 * Trie on paths: createPath(path, value), get(path).
 */
function buildSteps1166(input, params) {
  const ops = String(input).split(";").map((s) => s.trim()).filter(Boolean);

  let idCounter = 0;
  const makeNode = (label, parentId) => ({ id: idCounter++, label, parentId, value: null, children: {} });
  const root = makeNode("/", null);
  const steps = [];

  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) { x = nextX++; }
      else { const xs = keys.map((k) => dfs(node.children[k], depth + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
      const lbl = node.value !== null ? `${node.label}=${node.value}` : node.label;
      nodes.push({ id: node.id, label: lbl, x, y: depth, parentId: node.parentId, isWord: node.value !== null, hl: opts.highlight ? opts.highlight.includes(node.id) : false });
      return x;
    }
    dfs(root, 0);
    steps.push({ title: opts.title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note });
  }

  snapshot({ title: { vi: "Khởi tạo File System", en: "Init File System" }, highlight: [root.id], vars: [], note: { vi: "Hệ thống file rỗng, chỉ có root /.", en: "Empty file system with root /." } });

  const results = [];
  for (const op of ops) {
    const m = op.match(/^(create|get)\(([^,]+?)(?:,\s*(\d+))?\)$/i);
    if (!m) continue;
    const cmd = m[1].toLowerCase();
    const path = m[2].trim();
    const val = m[3] !== undefined ? Number(m[3]) : undefined;
    const parts = path.split("/").filter(Boolean);

    if (cmd === "create") {
      let node = root;
      const pathIds = [root.id];
      let ok = true;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!node.children[parts[i]]) { ok = false; break; }
        node = node.children[parts[i]];
        pathIds.push(node.id);
      }
      const last = parts[parts.length - 1];
      if (ok && !node.children[last]) {
        node.children[last] = makeNode(last, node.id);
        node.children[last].value = val;
        pathIds.push(node.children[last].id);
        results.push(`create("${path}",${val}) = true`);
      } else {
        ok = false;
        results.push(`create("${path}",${val}) = false`);
      }
      snapshot({ title: { vi: `create("${path}", ${val})`, en: `create("${path}", ${val})` }, highlight: pathIds, vars: [{ name: "op", value: `create("${path}",${val})` }, { name: "result", value: ok }], note: { vi: ok ? `Tạo đường dẫn thành công.` : `Thất bại (cha không tồn tại hoặc đã có).`, en: ok ? `Path created successfully.` : `Failed (parent missing or path exists).` } });
    } else {
      let node = root;
      const pathIds = [root.id];
      let found = true;
      for (const p of parts) {
        if (!node.children[p]) { found = false; break; }
        node = node.children[p];
        pathIds.push(node.id);
      }
      const v = found ? node.value : -1;
      results.push(`get("${path}") = ${v}`);
      snapshot({ title: { vi: `get("${path}")`, en: `get("${path}")` }, highlight: pathIds, vars: [{ name: "op", value: `get("${path}")` }, { name: "result", value: v }], note: { vi: found ? `Giá trị = ${v}.` : `Đường dẫn không tồn tại → -1.`, en: found ? `Value = ${v}.` : `Path not found → -1.` } });
    }
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { ops, answer: results.join(" | "), steps };
}

/**
 * LeetCode 588: Design In-Memory File System.
 * Trie: mkdir, addContentToFile, readContentFromFile, ls.
 */
function buildSteps588(input) {
  const operations = String(input).split(";").map((value) => value.trim()).filter(Boolean);
  let idCounter = 0;
  const makeNode = (label, parentId, type = "directory") => ({
    id: idCounter++,
    label,
    parentId,
    type,
    content: type === "file" ? "" : null,
    children: {},
  });
  const root = makeNode("/", null);
  const steps = [];
  const outputs = [];
  const MAX_STEPS = 180;

  function stripQuotes(value) {
    const text = String(value || "").trim();
    return ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))
      ? text.slice(1, -1)
      : text;
  }

  function parseOperation(raw) {
    let match = raw.match(/^ls\((.*)\)$/i);
    if (match) return { name: "ls", path: stripQuotes(match[1]) || "/", raw };
    match = raw.match(/^mkdir\((.*)\)$/i);
    if (match) return { name: "mkdir", path: stripQuotes(match[1]), raw };
    match = raw.match(/^(?:addContentToFile|add)\(([^,]+),\s*"([\s\S]*)"\)$/i);
    if (match) return { name: "addContentToFile", path: stripQuotes(match[1]), content: match[2], raw };
    match = raw.match(/^(?:readContentFromFile|read)\((.*)\)$/i);
    if (match) return { name: "readContentFromFile", path: stripQuotes(match[1]), raw };
    return { name: "invalid", path: "", raw };
  }

  const parsedOperations = operations.map(parseOperation);

  function inventory() {
    let directories = 0;
    let files = 0;
    function walk(node) {
      if (node.type === "file") files += 1;
      else directories += 1;
      Object.values(node.children).forEach(walk);
    }
    walk(root);
    return { directories, files };
  }

  function formatValue(value) {
    if (Array.isArray(value)) return `[${value.map((item) => `"${item}"`).join(", ")}]`;
    if (value === undefined) return "—";
    if (value === null) return "None";
    return `"${value}"`;
  }

  function addStep(options, force = false) {
    if (!force && steps.length >= MAX_STEPS) return;
    const activeIds = options.activeIds || [root.id];
    const annotations = {};
    if (options.currentId !== undefined && options.currentId !== null && !["init", "done"].includes(options.action)) {
      annotations[options.currentId] = {
        label: options.createdId === options.currentId
          ? (options.entryType === "file" ? "NEW FILE" : "NEW DIR")
          : "current",
        kind: options.createdId === options.currentId ? "answer" : "current",
      };
    }
    const nodes = [];
    let nextX = 0;
    function layout(node, depth) {
      const keys = Object.keys(node.children).sort();
      const childXs = keys.map((key) => layout(node.children[key], depth + 1));
      const x = childXs.length ? (childXs[0] + childXs[childXs.length - 1]) / 2 : nextX++;
      nodes.push({
        id: node.id,
        label: node.label,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.type === "file",
        hl: activeIds.includes(node.id),
      });
      return x;
    }
    layout(root, 0);
    const currentNode = options.currentId === undefined || options.currentId === null
      ? null
      : findNode(root, options.currentId);
    const counts = inventory();
    const parts = options.parts || [];

    steps.push({
      title: options.title,
      arr: [],
      tree: { nodes, annotations, showLevels: false },
      fileSystemView: {
        phase: options.phase || "navigate",
        action: options.action || "visit",
        operations: parsedOperations.map((operation) => operation.raw),
        operationIndex: options.operationIndex ?? -1,
        operationName: options.operationName || "FileSystem",
        rawOperation: options.rawOperation || "FileSystem()",
        path: options.path || "/",
        parts: [...parts],
        partIndex: options.partIndex ?? -1,
        createdPartIndexes: [...(options.createdPartIndexes || [])],
        currentId: options.currentId ?? root.id,
        currentNode: currentNode ? {
          name: currentNode.label,
          type: currentNode.type,
          content: currentNode.content,
          children: Object.keys(currentNode.children).sort(),
        } : null,
        entryType: options.entryType || (currentNode ? currentNode.type : "directory"),
        appendedContent: options.appendedContent || "",
        contentBefore: options.contentBefore,
        contentAfter: options.contentAfter,
        result: options.result,
        outputs: outputs.map((output) => ({ ...output })),
        decision: options.decision || "",
        valid: options.valid !== false,
        directories: counts.directories,
        files: counts.files,
      },
      highlight: [],
      mark: [],
      codeLines: options.codeLines || [],
      vars: [
        { name: "operation", value: options.rawOperation || "FileSystem()" },
        { name: "path parts", value: parts.length ? `[${parts.map((part) => `"${part}"`).join(", ")}]` : "[]" },
        { name: "current node", value: currentNode ? `${currentNode.type}: ${currentNode.label}` : "None" },
        { name: "return", value: formatValue(options.result) },
      ],
      note: options.note,
      final: Boolean(options.final),
    });
  }

  function findNode(node, id) {
    if (node.id === id) return node;
    for (const child of Object.values(node.children)) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  }

  function navigate(path, config) {
    const parts = String(path).split("/").filter(Boolean);
    const activeIds = [root.id];
    const createdPartIndexes = [];
    let node = root;

    addStep({
      phase: "parse",
      action: "split",
      operationIndex: config.operationIndex,
      operationName: config.operationName,
      rawOperation: config.rawOperation,
      path,
      parts,
      currentId: root.id,
      activeIds,
      createdPartIndexes,
      codeLines: [29, 30, 31],
      decision: parts.length ? `path.split('/') → [${parts.join(", ")}]` : "path = '/' → stay at root",
      note: {
        vi: parts.length
          ? `Tách "${path}" thành ${parts.length} phần. Bắt đầu từ root rồi đi lần lượt từ trái sang phải.`
          : `Đường dẫn "/" chính là root, không cần đi qua segment nào.`,
        en: parts.length
          ? `Split "${path}" into ${parts.length} part(s). Start at root and walk left to right.`
          : `Path "/" is the root itself, so no segment traversal is needed.`,
      },
    });

    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      const isTerminal = index === parts.length - 1;
      const existing = node.children[part];
      if (!existing && !config.create) {
        addStep({
          phase: "navigate",
          action: "missing",
          operationIndex: config.operationIndex,
          operationName: config.operationName,
          rawOperation: config.rawOperation,
          path,
          parts,
          partIndex: index,
          currentId: node.id,
          activeIds,
          createdPartIndexes,
          valid: false,
          codeLines: [34, 35, 36],
          decision: `children does not contain "${part}" → path missing`,
          note: {
            vi: `Node hiện tại không có con "${part}" và thao tác này không được tạo node, nên đường dẫn không tồn tại.`,
            en: `The current node has no "${part}" child and this operation cannot create nodes, so the path is missing.`,
          },
        });
        return { node: null, parts, activeIds, createdPartIndexes };
      }

      let created = false;
      if (!existing) {
        const type = isTerminal && config.terminalType === "file" ? "file" : "directory";
        node.children[part] = makeNode(part, node.id, type);
        created = true;
        createdPartIndexes.push(index);
      }
      node = node.children[part];
      activeIds.push(node.id);
      addStep({
        phase: "navigate",
        action: created ? (node.type === "file" ? "create-file" : "create-directory") : "reuse",
        operationIndex: config.operationIndex,
        operationName: config.operationName,
        rawOperation: config.rawOperation,
        path,
        parts,
        partIndex: index,
        currentId: node.id,
        createdId: created ? node.id : null,
        activeIds: [...activeIds],
        createdPartIndexes,
        entryType: node.type,
        codeLines: created ? [34, 37, 38] : [34, 38],
        decision: created
          ? `missing "${part}" → create ${node.type}`
          : `found "${part}" → reuse existing ${node.type}`,
        note: created
          ? {
              vi: `Chưa có "${part}" nên tạo ${node.type === "file" ? "FILE" : "FOLDER"} mới rồi di chuyển vào node đó.`,
              en: `"${part}" is missing, so create a new ${node.type.toUpperCase()} and move into it.`,
            }
          : {
              vi: `"${part}" đã tồn tại. Dùng lại node cũ, không tạo bản sao.`,
              en: `"${part}" already exists. Reuse it instead of creating a duplicate.`,
            },
      });
    }
    return { node, parts, activeIds, createdPartIndexes };
  }

  addStep({
    phase: "parse",
    action: "init",
    title: { vi: "Khởi tạo FileSystem với một root folder", en: "Initialize FileSystem with one root folder" },
    currentId: root.id,
    activeIds: [root.id],
    codeLines: [7, 8],
    decision: "self.root = TrieNode()",
    note: {
      vi: "Mỗi segment của đường dẫn là một node Trie. Folder chứa children; file chứa content và được vẽ bằng vòng xanh.",
      en: "Each path segment is a Trie node. A folder owns children; a file owns content and is shown with a green ring.",
    },
  }, true);

  parsedOperations.forEach((operation, operationIndex) => {
    const common = {
      operationIndex,
      operationName: operation.name,
      rawOperation: operation.raw,
      path: operation.path,
    };

    if (operation.name === "invalid") {
      addStep({
        ...common,
        phase: "result",
        action: "invalid",
        title: { vi: `Không hiểu lệnh: ${operation.raw}`, en: `Unknown operation: ${operation.raw}` },
        valid: false,
        codeLines: [],
        decision: "invalid operation syntax",
        result: "Invalid operation",
        note: {
          vi: "Dùng ls(path), mkdir(path), addContentToFile(path, \"content\") hoặc readContentFromFile(path). Alias add/read vẫn được hỗ trợ.",
          en: "Use ls(path), mkdir(path), addContentToFile(path, \"content\"), or readContentFromFile(path). add/read aliases are also supported.",
        },
      });
      return;
    }

    if (operation.name === "mkdir") {
      const walked = navigate(operation.path, { ...common, create: true, terminalType: "directory" });
      outputs.push({ operation: operation.raw, value: "None" });
      addStep({
        ...common,
        phase: "result",
        action: "mkdir-done",
        title: { vi: `mkdir("${operation.path}") hoàn tất`, en: `mkdir("${operation.path}") complete` },
        parts: walked.parts,
        partIndex: walked.parts.length - 1,
        currentId: walked.node ? walked.node.id : root.id,
        activeIds: walked.activeIds,
        createdPartIndexes: walked.createdPartIndexes,
        entryType: "directory",
        codeLines: [16, 17],
        result: null,
        decision: `created ${walked.createdPartIndexes.length} new folder(s)`,
        note: {
          vi: `Đã tạo toàn bộ folder còn thiếu. mkdir không trả dữ liệu; cấu trúc cây được giữ lại cho lệnh tiếp theo.`,
          en: `Every missing folder now exists. mkdir returns no data; the tree remains for the next operation.`,
        },
      });
      return;
    }

    if (operation.name === "addContentToFile") {
      const walked = navigate(operation.path, { ...common, create: true, terminalType: "file" });
      const node = walked.node;
      const before = node.type === "file" ? node.content : "";
      node.type = "file";
      node.content = before + operation.content;
      outputs.push({ operation: operation.raw, value: "None" });
      addStep({
        ...common,
        phase: "result",
        action: "write",
        title: { vi: `Ghi thêm vào file "${node.label}"`, en: `Append to file "${node.label}"` },
        parts: walked.parts,
        partIndex: walked.parts.length - 1,
        currentId: node.id,
        activeIds: walked.activeIds,
        createdPartIndexes: walked.createdPartIndexes,
        entryType: "file",
        appendedContent: operation.content,
        contentBefore: before,
        contentAfter: node.content,
        codeLines: [19, 20, 21, 22, 23],
        result: null,
        decision: `content = "${before}" + "${operation.content}" → "${node.content}"`,
        note: {
          vi: `addContentToFile luôn APPEND, không ghi đè: nội dung cũ "${before}" cộng thêm "${operation.content}".`,
          en: `addContentToFile APPENDS rather than overwrites: old "${before}" plus "${operation.content}".`,
        },
      });
      return;
    }

    if (operation.name === "readContentFromFile") {
      const walked = navigate(operation.path, { ...common, create: false });
      const content = walked.node && walked.node.type === "file" ? walked.node.content : "";
      outputs.push({ operation: operation.raw, value: content });
      addStep({
        ...common,
        phase: "result",
        action: walked.node ? "read" : "missing",
        title: walked.node
          ? { vi: `Đọc file → "${content}"`, en: `Read file → "${content}"` }
          : { vi: "Không tìm thấy file", en: "File not found" },
        parts: walked.parts,
        partIndex: walked.parts.length - 1,
        currentId: walked.node ? walked.node.id : root.id,
        activeIds: walked.activeIds,
        createdPartIndexes: walked.createdPartIndexes,
        entryType: "file",
        codeLines: [25, 26, 27],
        result: content,
        valid: Boolean(walked.node),
        decision: walked.node ? `return content → "${content}"` : "missing path",
        note: walked.node
          ? { vi: `Node cuối là file. Trả nguyên chuỗi content đang lưu: "${content}".`, en: `The terminal node is a file. Return its stored content: "${content}".` }
          : { vi: "Đường dẫn không tồn tại nên không thể đọc file.", en: "The path does not exist, so the file cannot be read." },
      });
      return;
    }

    const walked = navigate(operation.path, { ...common, create: false });
    let listing = [];
    if (walked.node) {
      listing = walked.node.type === "file"
        ? [walked.node.label]
        : Object.keys(walked.node.children).sort();
    }
    outputs.push({ operation: operation.raw, value: listing });
    addStep({
      ...common,
      phase: "result",
      action: walked.node ? "list" : "missing",
      title: walked.node
        ? { vi: `ls → [${listing.join(", ")}]`, en: `ls → [${listing.join(", ")}]` }
        : { vi: "Không tìm thấy đường dẫn", en: "Path not found" },
      parts: walked.parts,
      partIndex: walked.parts.length - 1,
      currentId: walked.node ? walked.node.id : root.id,
      activeIds: walked.activeIds,
      createdPartIndexes: walked.createdPartIndexes,
      entryType: walked.node ? walked.node.type : "directory",
      codeLines: [10, 11, 12, 13, 14],
      result: listing,
      valid: Boolean(walked.node),
      decision: walked.node
        ? (walked.node.type === "file" ? "file → return [file name]" : "directory → sort child names")
        : "missing path",
      note: walked.node
        ? {
            vi: walked.node.type === "file"
              ? "Nếu path trỏ tới file, ls trả về đúng tên file đó."
              : `Nếu path trỏ tới folder, ls sắp xếp tên các children: [${listing.join(", ")}].`,
            en: walked.node.type === "file"
              ? "When path points to a file, ls returns that file name."
              : `When path points to a folder, ls sorts its child names: [${listing.join(", ")}].`,
          }
        : { vi: "Đường dẫn không tồn tại.", en: "The path does not exist." },
    });
  });

  const answer = outputs.map((output) => `${output.operation} → ${Array.isArray(output.value) ? `[${output.value.join(",")}]` : output.value}`).join(" | ");
  addStep({
    phase: "done",
    action: "done",
    operationIndex: parsedOperations.length,
    operationName: "done",
    rawOperation: "All operations complete",
    path: "/",
    currentId: root.id,
    activeIds: [root.id],
    codeLines: [],
    result: answer,
    final: true,
    decision: `completed ${parsedOperations.length} operation(s)`,
    title: { vi: "Hoàn tất toàn bộ thao tác", en: "All operations complete" },
    note: {
      vi: "Cây cuối cùng giữ cả folder và file. Vòng xanh biểu thị file; node thường là folder.",
      en: "The final tree retains both folders and files. Green-ring nodes are files; regular nodes are folders.",
    },
  }, true);

  return { ops: operations, answer, steps };
}

/**
 * LeetCode 212: Word Search II — build a Trie of words, then DFS the board.
 * The Trie lets us prune: from a cell we only continue if the current letter
 * is a child of the current Trie node.
 *
 * board input: rows separated by ';', letters by ','. words via param.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def findWords(self, board, words):
 *  3          trie = {}; build trie of words (leaf marks '$' = word)
 *  4          result = []
 *  5          def dfs(r, c, node):
 *  6              ch = board[r][c]
 *  7              if ch not in node: return
 *  8              nxt = node[ch]
 *  9              if '$' in nxt: result.append(word); del nxt['$']
 * 10              board[r][c] = '#'
 * 11              for (nr, nc) in neighbors: if not visited: dfs(nr, nc, nxt)
 * 12              board[r][c] = ch
 * 13          for r in range(rows):
 * 14              for c in range(cols): dfs(r, c, trie)
 * 15          return result
 */
function buildSteps212(input, params) {
  const board = String(input).split(/[;|]/).map((row) => row.trim()).filter(Boolean)
    .map((row) => row.split(",").map((value) => value.trim()));
  const words = String(params && params.words || "oath,pea,eat,rain")
    .split(",").map((word) => word.trim()).filter(Boolean);
  const rows = board.length;
  const cols = rows ? Math.max(...board.map((row) => row.length)) : 0;
  const steps = [];
  const trie = {};
  const found = [];
  const foundSet = new Set();
  const pathStack = [];
  const callStack = [];
  const used = new Set();
  const MAX_VISUAL_STEPS = 120;

  for (const word of words) {
    let node = trie;
    for (const ch of word) node = (node[ch] = node[ch] || {});
    node.$ = word;
  }

  function pathText(path = pathStack) {
    return path.map(([r, c]) => board[r][c]).join("");
  }

  function trieSnapshot(activePrefix = "", annotation) {
    const nodes = [];
    const annotations = {};
    let leafX = 0;

    function layout(node, prefix, label, parentId, depth) {
      const keys = Object.keys(node).filter((key) => key !== "$").sort();
      const childXs = keys.map((key) => layout(node[key], prefix + key, key, prefix || "root", depth + 1));
      const x = childXs.length ? (childXs[0] + childXs[childXs.length - 1]) / 2 : leafX++;
      const id = prefix || "root";
      const isOnPath = prefix === "" || (activePrefix && activePrefix.startsWith(prefix));
      nodes.push({
        id,
        label: prefix ? label : "•",
        x,
        y: depth,
        parentId,
        isWord: words.includes(prefix),
        hl: Boolean(isOnPath),
      });
      return x;
    }

    layout(trie, "", "•", null, 0);
    const activeId = activePrefix || "root";
    if (annotation && nodes.some((node) => node.id === activeId)) {
      annotations[activeId] = { label: annotation.label, kind: annotation.kind || "" };
    }
    return { nodes, annotations, showLevels: false };
  }

  function addStep(options, force = false) {
    if (!force && steps.length >= MAX_VISUAL_STEPS) return;
    const path = (options.path || pathStack).map(([r, c]) => ({ r, c, char: board[r][c] }));
    const prefix = options.prefix !== undefined ? options.prefix : path.map((cell) => cell.char).join("");
    const trieNode = prefix.split("").reduce((node, ch) => node && node[ch], trie) || trie;
    const children = Object.keys(trieNode).filter((key) => key !== "$").sort();
    const annotation = options.annotation || (options.action === "prune"
      ? { label: `no '${options.needed}'`, kind: "pruned" }
      : options.action === "found"
        ? { label: `✓ ${options.foundWord}`, kind: "answer" }
        : prefix
          ? { label: `prefix: ${prefix}`, kind: "current" }
          : { label: "root", kind: "current" });

    steps.push({
      title: options.title,
      arr: [],
      tree: trieSnapshot(prefix, annotation),
      wordSearchIIView: {
        phase: options.phase || "search",
        action: options.action || "match",
        board: board.map((row) => [...row]),
        rows,
        cols,
        words: [...words],
        found: [...found],
        path,
        prefix,
        current: options.current || null,
        candidate: options.candidate || null,
        restored: options.restored || null,
        direction: options.direction || "",
        needed: options.needed || "",
        trieChildren: children,
        callStack: callStack.map((frame) => ({ ...frame })),
        decision: options.decision || "",
        foundWord: options.foundWord || "",
      },
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "prefix", value: prefix || "∅" },
        { name: "path", value: path.length ? path.map((cell) => `(${cell.r},${cell.c})`).join(" → ") : "[]" },
        { name: "Trie children", value: children.join(", ") || "∅" },
        { name: "result", value: `[${found.map((word) => `"${word}"`).join(", ")}]` },
        ...(options.vars || []),
      ],
      note: options.note,
    });
  }

  addStep({
    phase: "build",
    action: "build",
    title: { vi: "Pha 1 — Xây Trie từ toàn bộ words", en: "Phase 1 — Build one Trie from all words" },
    codeLines: [6, 7, 8, 9, 10, 11],
    decision: { vi: "Gộp các prefix chung vào cùng một nhánh", en: "Merge shared prefixes into the same branch" },
    vars: [{ name: "words", value: `[${words.map((word) => `"${word}"`).join(", ")}]` }],
    note: {
      vi: "Mỗi đường từ root đến vòng xanh là một từ. Khi DFS trên board, chỉ những ký tự có cạnh tương ứng trong Trie mới được đi tiếp.",
      en: "Each root-to-green-ring path is a word. During board DFS, only letters with a matching Trie edge may continue.",
    },
  }, true);

  if (!rows || !cols) {
    addStep({
      phase: "done",
      action: "done",
      title: { vi: "Bảng rỗng → []", en: "Empty board → []" },
      codeLines: [3, 4],
      decision: { vi: "Không có ô bắt đầu", en: "There is no start cell" },
      final: true,
      note: { vi: "Board rỗng nên không thể tạo từ nào.", en: "An empty board cannot form any word." },
    }, true);
    return { original: board, answer: [], steps };
  }

  addStep({
    phase: "search",
    action: "start",
    title: { vi: "Pha 2 — DFS từng ô + cắt tỉa bằng Trie", en: "Phase 2 — DFS each cell + Trie pruning" },
    codeLines: [12, 14, 29, 30, 31],
    decision: { vi: "Bắt đầu ở root; thử từng ô làm ký tự đầu", en: "Start at root; try every cell as the first letter" },
    note: {
      vi: "Board và Trie chạy song song: đi sang một ô trên board cũng phải đi được một cạnh trong Trie. Không có cạnh → dừng nhánh ngay.",
      en: "The board and Trie advance together: every board move must match a Trie edge. A missing edge prunes the branch immediately.",
    },
  }, true);

  const directions = [
    [-1, 0, "↑"],
    [1, 0, "↓"],
    [0, -1, "←"],
    [0, 1, "→"],
  ];

  function dfs(r, c, node, direction = "start") {
    const key = `${r},${c}`;
    if (used.has(key)) return;
    const ch = board[r][c];
    const next = node[ch];

    if (!next) {
      addStep({
        action: "prune",
        title: { vi: `Cắt nhánh: Trie không có cạnh '${ch}'`, en: `Prune: Trie has no '${ch}' edge` },
        codeLines: [15, 16, 17],
        current: pathStack.length ? { r: pathStack[pathStack.length - 1][0], c: pathStack[pathStack.length - 1][1] } : null,
        candidate: { r, c },
        direction,
        needed: ch,
        decision: { vi: `prefix "${pathText()}" + '${ch}' không tồn tại → return`, en: `prefix "${pathText()}" + '${ch}' does not exist → return` },
        note: {
          vi: `Ô (${r},${c}) chứa '${ch}', nhưng node Trie hiện tại không có con '${ch}'. Không cần DFS sâu hơn — đây là lợi ích chính của Trie.`,
          en: `Cell (${r},${c}) is '${ch}', but the current Trie node has no '${ch}' child. Stop immediately — this is the Trie's main benefit.`,
        },
      });
      return;
    }

    pathStack.push([r, c]);
    used.add(key);
    callStack.push({ r, c, char: ch, prefix: pathText(), direction });
    const prefix = pathText();
    addStep({
      action: "match",
      title: { vi: `Khớp '${ch}' → prefix = "${prefix}"`, en: `Match '${ch}' → prefix = "${prefix}"` },
      codeLines: [14, 15, 16, 18],
      current: { r, c },
      candidate: { r, c },
      direction,
      decision: { vi: `Có cạnh '${ch}' trong Trie → tiếp tục`, en: `Trie contains '${ch}' edge → continue` },
      note: {
        vi: `Thêm ô (${r},${c}) vào path và đánh dấu đã dùng. Các vòng xanh trong Trie là nơi một từ hoàn chỉnh kết thúc.`,
        en: `Add (${r},${c}) to the path and mark it used. Green rings in the Trie mark complete words.`,
      },
    });

    if (next.$ !== undefined) {
      const word = next.$;
      if (!foundSet.has(word)) {
        foundSet.add(word);
        found.push(word);
      }
      delete next.$;
      addStep({
        action: "found",
        title: { vi: `✓ Tìm thấy "${word}"`, en: `✓ Found "${word}"` },
        codeLines: [19, 20, 21],
        current: { r, c },
        candidate: { r, c },
        direction,
        foundWord: word,
        decision: { vi: `Node kết thúc từ → thêm "${word}" vào result`, en: `Terminal node → append "${word}" to result` },
        note: {
          vi: `Path màu xanh trên board và đường màu cam trong Trie cùng đánh vần "${word}". Xóa '$' để không thêm trùng từ này.`,
          en: `The green board path and amber Trie path both spell "${word}". Delete '$' so the word is not added twice.`,
        },
      }, true);
    }

    for (const [dr, dc, arrow] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < board[nr].length && !used.has(`${nr},${nc}`)) {
        dfs(nr, nc, next, arrow);
      }
    }

    callStack.pop();
    used.delete(key);
    pathStack.pop();
    addStep({
      action: "backtrack",
      title: { vi: `Backtrack: khôi phục ô (${r},${c})`, en: `Backtrack: restore cell (${r},${c})` },
      codeLines: [22, 23, 24, 25, 26, 27],
      current: pathStack.length ? { r: pathStack[pathStack.length - 1][0], c: pathStack[pathStack.length - 1][1] } : null,
      restored: { r, c },
      direction,
      decision: { vi: "Bỏ ô khỏi path để nhánh khác có thể dùng", en: "Remove the cell so another branch may use it" },
      note: {
        vi: "DFS đã thử xong mọi hàng xóm hợp lệ. Khôi phục ô, lùi một frame và tiếp tục thử hướng khác.",
        en: "DFS has tried every valid neighbor. Restore the cell, pop one frame, and continue with another direction.",
      },
    });
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < board[r].length; c++) dfs(r, c, trie);
  }

  const answer = [...found];
  addStep({
    phase: "done",
    action: "done",
    title: { vi: `Pha 3 — Hoàn tất: tìm thấy ${answer.length} từ`, en: `Phase 3 — Complete: found ${answer.length} word(s)` },
    codeLines: [29, 30, 31, 32],
    final: true,
    decision: { vi: "Đã thử mọi ô bắt đầu", en: "Every start cell has been tried" },
    vars: [{ name: "answer", value: `[${answer.map((word) => `"${word}"`).join(", ")}]` }],
    note: {
      vi: `Kết quả = [${answer.map((word) => `"${word}"`).join(", ")}]. Màu đỏ cho thấy nhánh bị Trie cắt ngay; nhờ vậy không phải duyệt mọi đường đi có thể.`,
      en: `Result = [${answer.map((word) => `"${word}"`).join(", ")}]. Red states show immediate Trie pruning, avoiding exploration of every possible path.`,
    },
  }, true);

  return { original: board, answer, steps };
}

/**
 * LeetCode 642: Design Search Autocomplete System — Trie + cached hot[3].
 * Every Trie node stores the three best historical sentences for its prefix.
 * Typing a character follows one Trie edge and returns that node's hot cache.
 * '#' stores the completed sentence, refreshes caches along its path, and resets.
 *
 * Input: the typed characters as a string (each char is one input() call).
 * Params: sentences (|-separated) and times (comma-separated).
 *
 * Code lines (1-indexed):
 *  1  class TrieNode:
 *  2      def __init__(self):
 *  3          self.children = {}
 *  4          self.hot = []
 *  5
 *  6  class AutocompleteSystem:
 *  7      def __init__(self, sentences, times):
 *  8          self.counts = {}
 *  9          self.root = TrieNode()
 * 10          self.prefix = ""
 * 11          self.node = self.root
 * 12          for s, t in zip(sentences, times):
 * 13              self._add(s, t)
 * 14
 * 15      def _update_hot(self, node, sentence):
 * 16          if sentence not in node.hot:
 * 17              node.hot.append(sentence)
 * 18          node.hot.sort(key=lambda s: (-self.counts[s], s))
 * 19          node.hot = node.hot[:3]
 * 20
 * 21      def _add(self, sentence, amount):
 * 22          self.counts[sentence] = self.counts.get(sentence, 0) + amount
 * 23          node = self.root
 * 24          self._update_hot(node, sentence)
 * 25          for ch in sentence:
 * 26              node = node.children.setdefault(ch, TrieNode())
 * 27              self._update_hot(node, sentence)
 * 28
 * 29      def input(self, c):
 * 30          if c == '#':
 * 31              self._add(self.prefix, 1)
 * 32              self.prefix = ""
 * 33              self.node = self.root
 * 34              return []
 * 35          self.prefix += c
 * 36          self.node = self.node.children.get(c) if self.node else None
 * 37          return self.node.hot[:] if self.node else []
 */
function buildSteps642(input, params = {}) {
  const sentences = String(params.sentences ?? "i love you|island|iroman|i love leetcode").split("|").map((s) => s.trim()).filter(Boolean);
  const times = String(params.times ?? "5,3,2,2").split(",").map((x) => Number(x.trim()));
  const typed = input === undefined || input === null ? "i " : String(input);

  const steps = [];
  const counts = new Map();
  const makeNode = () => ({ children: Object.create(null), hot: [] });
  const root = makeNode();

  function compareSentences(left, right) {
    return (counts.get(right) - counts.get(left)) || left.localeCompare(right);
  }

  function updateHot(node, sentence, nodePrefix) {
    const before = [...node.hot];
    node.hot = [...new Set([...node.hot, sentence])].sort(compareSentences).slice(0, 3);
    return {
      prefix: nodePrefix,
      before,
      after: [...node.hot],
      changed: before.join("\u0000") !== node.hot.join("\u0000"),
    };
  }

  function addSentence(sentence, amount) {
    const countBefore = counts.get(sentence) || 0;
    counts.set(sentence, countBefore + amount);
    const updates = [];
    let node = root;
    let nodePrefix = "";
    updates.push(updateHot(node, sentence, nodePrefix));
    for (const char of sentence) {
      nodePrefix += char;
      if (!node.children[char]) node.children[char] = makeNode();
      node = node.children[char];
      updates.push(updateHot(node, sentence, nodePrefix));
    }
    return { countBefore, countAfter: counts.get(sentence), updates };
  }

  function getNode(value) {
    let node = root;
    for (const char of value) {
      node = node ? node.children[char] : null;
    }
    return node;
  }

  let currentNode = root;
  let prefix = "";

  function getTriePath(value) {
    const path = [{ char: "ROOT", prefix: "", hot: [...root.hot], found: true }];
    let node = root;
    let built = "";
    for (const char of value) {
      built += char;
      node = node ? node.children[char] : null;
      path.push({
        char,
        prefix: built,
        hot: node ? [...node.hot] : [],
        found: Boolean(node),
      });
    }
    return path;
  }

  function snap(opts) {
    const triePrefix = opts.triePrefix ?? opts.prefix ?? prefix;
    const inspectPrefix = opts.inspectPrefix ?? triePrefix;
    const inspectedNode = getNode(inspectPrefix);
    const nodeHot = opts.top3 ?? (inspectedNode ? [...inspectedNode.hot] : []);
    const candidates = nodeHot.map((sentence, index) => ({
      sentence,
      count: counts.get(sentence) || 0,
      rank: index + 1,
      score: `(-${counts.get(sentence) || 0}, "${sentence}")`,
      tiedWithPrevious: index > 0 && counts.get(nodeHot[index - 1]) === counts.get(sentence),
    }));
    const suggestions = opts.returnValue ?? [];
    const nodeChildren = inspectedNode
      ? Object.keys(inspectedNode.children).sort().map((char) => ({
        char,
        prefix: inspectPrefix + char,
        hot: [...inspectedNode.children[char].hot],
      }))
      : [];
    const history = [...counts.entries()]
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
      .map(([sentence, count]) => ({ sentence, count }));
    steps.push({
      title: opts.title,
      arr: [],
      autocompleteView: {
        phase: opts.phase || "type",
        stage: opts.stage || "inspect",
        action: opts.action || "rank",
        typedChars: [...typed],
        charIndex: opts.charIndex ?? -1,
        inputChar: opts.inputChar || "",
        prefixBefore: opts.prefixBefore ?? prefix,
        prefix: opts.prefix ?? prefix,
        history,
        triePath: getTriePath(triePrefix),
        triePrefix,
        inspectPrefix,
        nodeFound: opts.nodeFound ?? Boolean(inspectedNode),
        nodeHot: [...nodeHot],
        nodeChildren,
        candidates,
        suggestions: [...suggestions],
        edgeFromPrefix: opts.edgeFromPrefix ?? "",
        edgeChar: opts.edgeChar ?? "",
        edgeFound: opts.edgeFound,
        cacheUpdates: opts.cacheUpdates || [],
        focusUpdatePrefix: opts.focusUpdatePrefix,
        sentenceBeingAdded: opts.sentenceBeingAdded || "",
        committedSentence: opts.committedSentence || "",
        countBefore: opts.countBefore,
        countAfter: opts.countAfter,
        decision: opts.decision || "",
      },
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snap({
    phase: "init",
    stage: "init-empty",
    action: "history",
    prefix: "",
    triePrefix: "",
    top3: [],
    returnValue: [],
    decision: { vi: "Bắt đầu với root rỗng", en: "Start with an empty root" },
    title: { vi: "Tạo root Trie và bảng frequency", en: "Create the Trie root and frequency table" },
    codeLines: [8, 9, 10, 11],
    vars: [
      { name: "counts", value: "{}" },
      { name: "root.children", value: "{}" },
      { name: "root.hot", value: "[]" },
      { name: "node", value: "root" },
    ],
    note: {
      vi: "Ban đầu Trie chỉ có root. Tiếp theo, từng câu lịch sử sẽ được chèn và cập nhật hot[3] ở mọi prefix trên đường đi.",
      en: "The Trie initially contains only root. Each historical sentence will be inserted and update hot[3] at every prefix on its path.",
    },
  });

  sentences.forEach((sentence, index) => {
    const frequency = Number.isFinite(times[index]) ? times[index] : 0;
    const added = addSentence(sentence, frequency);
    const sentenceNode = getNode(sentence);
    snap({
      phase: "init",
      stage: "build-sentence",
      action: "history",
      prefix: "",
      triePrefix: sentence,
      inspectPrefix: sentence,
      nodeFound: true,
      top3: sentenceNode ? [...sentenceNode.hot] : [],
      returnValue: [],
      sentenceBeingAdded: sentence,
      countBefore: added.countBefore,
      countAfter: added.countAfter,
      cacheUpdates: added.updates,
      decision: { vi: `Chèn "${sentence}" (${frequency} lần) qua ${sentence.length + 1} node`, en: `Insert "${sentence}" (${frequency} times) through ${sentence.length + 1} nodes` },
      title: { vi: `Build Trie ${index + 1}/${sentences.length}: "${sentence}"`, en: `Build Trie ${index + 1}/${sentences.length}: "${sentence}"` },
      codeLines: [12, 13, 21, 22, 23, 24, 25, 26, 27],
      vars: [
        { name: "sentence", value: `"${sentence}"` },
        { name: "frequency", value: frequency },
        { name: "counts[sentence]", value: `${added.countBefore} → ${added.countAfter}` },
        { name: "updated nodes", value: added.updates.length },
        { name: "root.hot", value: `[${root.hot.map((s) => `"${s}"`).join(", ")}]` },
      ],
      note: {
        vi: `Tăng frequency của "${sentence}" lên ${added.countAfter}. Đi từ root qua từng ký tự và sort lại hot[3] tại ${added.updates.length} node. Bảng CACHE UPDATE cho biết giá trị trước → sau.`,
        en: `Set the frequency of "${sentence}" to ${added.countAfter}. Walk from root through every character and re-sort hot[3] at ${added.updates.length} nodes. CACHE UPDATE shows before → after.`,
      },
    });
  });

  for (const [charIndex, c] of [...typed].entries()) {
    const shownChar = c === " " ? "␠" : c;
    if (c === "#") {
      const committedSentence = prefix;
      const currentHot = currentNode ? [...currentNode.hot] : [];
      const countBefore = counts.get(committedSentence) || 0;

      snap({
        phase: "commit",
        stage: "commit-detect",
        action: "inspect",
        charIndex,
        inputChar: c,
        prefixBefore: committedSentence,
        prefix: committedSentence,
        triePrefix: committedSentence,
        inspectPrefix: committedSentence,
        nodeFound: Boolean(currentNode),
        top3: currentHot,
        returnValue: [],
        committedSentence,
        countBefore,
        countAfter: countBefore,
        decision: { vi: `Phát hiện '#' → câu hoàn chỉnh là "${committedSentence}"`, en: `Detected '#' → completed sentence is "${committedSentence}"` },
        title: { vi: `Commit 1/3: đọc câu "${committedSentence}"`, en: `Commit 1/3: read sentence "${committedSentence}"` },
        codeLines: [29, 30],
        vars: [
          { name: "c", value: "'#'" },
          { name: "sentence", value: `"${committedSentence}"` },
          { name: "old frequency", value: countBefore },
          { name: "return", value: "[]" },
        ],
        note: {
          vi: `'#' không được thêm vào prefix. Prefix hiện tại "${committedSentence}" trở thành câu cần lưu; input('#') luôn trả về [].`,
          en: `'#' is not appended to the prefix. The current prefix "${committedSentence}" becomes the sentence to store; input('#') always returns [].`,
        },
      });

      const added = addSentence(committedSentence, 1);
      const committedNode = getNode(committedSentence);
      snap({
        phase: "commit",
        stage: "commit-update",
        action: "inspect",
        charIndex,
        inputChar: c,
        prefixBefore: committedSentence,
        prefix: committedSentence,
        triePrefix: committedSentence,
        inspectPrefix: committedSentence,
        nodeFound: true,
        top3: committedNode ? [...committedNode.hot] : [],
        returnValue: [],
        sentenceBeingAdded: committedSentence,
        committedSentence,
        countBefore: added.countBefore,
        countAfter: added.countAfter,
        cacheUpdates: added.updates,
        decision: { vi: `frequency ${added.countBefore} → ${added.countAfter}; cập nhật ${added.updates.length} cache`, en: `frequency ${added.countBefore} → ${added.countAfter}; refresh ${added.updates.length} caches` },
        title: { vi: "Commit 2/3: cập nhật frequency và hot[3]", en: "Commit 2/3: update frequency and hot[3]" },
        codeLines: [21, 22, 23, 24, 25, 26, 27, 31],
        vars: [
          { name: `counts["${committedSentence}"]`, value: `${added.countBefore} → ${added.countAfter}` },
          { name: "path nodes", value: added.updates.length },
          { name: "changed caches", value: added.updates.filter((update) => update.changed).length },
        ],
        note: {
          vi: `Đi lại toàn bộ đường Trie của "${committedSentence}". Tại mỗi prefix, thêm câu vào cache, sort theo (-frequency, sentence), rồi chỉ giữ 3 câu đầu.`,
          en: `Walk the full Trie path of "${committedSentence}". At each prefix, add it to the cache, sort by (-frequency, sentence), then keep only the first three.`,
        },
      });

      prefix = "";
      currentNode = root;
      snap({
        phase: "commit",
        stage: "commit-reset",
        action: "commit",
        charIndex,
        inputChar: c,
        prefixBefore: committedSentence,
        prefix: "",
        triePrefix: "",
        inspectPrefix: "",
        nodeFound: true,
        top3: [...root.hot],
        returnValue: [],
        committedSentence,
        countBefore: added.countBefore,
        countAfter: added.countAfter,
        decision: { vi: "Reset prefix = '' và node = root", en: "Reset prefix = '' and node = root" },
        title: { vi: "Commit 3/3: reset về root", en: "Commit 3/3: reset to root" },
        codeLines: [32, 33, 34],
        vars: [
          { name: "prefix", value: '""' },
          { name: "node", value: "root" },
          { name: "return", value: "[]" },
        ],
        note: {
          vi: "Câu đã được lưu. Hệ thống quay về root để sẵn sàng nhận một truy vấn autocomplete mới.",
          en: "The sentence is stored. The system returns to root and is ready for a new autocomplete query.",
        },
      });
      continue;
    }

    const prefixBefore = prefix;
    const edgeFound = Boolean(currentNode && currentNode.children[c]);
    const beforeHot = currentNode ? [...currentNode.hot] : [];
    snap({
      phase: "type",
      stage: "read-char",
      action: "inspect",
      charIndex,
      inputChar: c,
      prefixBefore,
      prefix: prefixBefore,
      triePrefix: prefixBefore,
      inspectPrefix: prefixBefore,
      nodeFound: Boolean(currentNode),
      top3: beforeHot,
      returnValue: [],
      edgeFromPrefix: prefixBefore,
      edgeChar: c,
      edgeFound,
      decision: { vi: `Đọc c='${shownChar}', chuẩn bị kiểm tra children[c]`, en: `Read c='${shownChar}', prepare to inspect children[c]` },
      title: { vi: `input('${shownChar}') 1/3: đọc ký tự`, en: `input('${shownChar}') 1/3: read character` },
      codeLines: [29, 35],
      vars: [
        { name: "c", value: `'${shownChar}'` },
        { name: "prefix before", value: `"${prefixBefore}"` },
        { name: "lookup", value: `node.children.get('${shownChar}')` },
      ],
      note: {
        vi: `Đang đứng tại node prefix "${prefixBefore}". Ta chưa di chuyển; bước kế tiếp sẽ kiểm tra cạnh '${shownChar}'.`,
        en: `Currently at the node for prefix "${prefixBefore}". No movement yet; the next step checks edge '${shownChar}'.`,
      },
    });

    prefix += c;
    currentNode = currentNode ? (currentNode.children[c] || null) : null;
    const top3 = currentNode ? [...currentNode.hot] : [];
    snap({
      phase: "type",
      stage: "follow-edge",
      action: currentNode ? "inspect" : "no-match",
      charIndex,
      inputChar: c,
      prefixBefore,
      prefix,
      triePrefix: prefix,
      inspectPrefix: prefix,
      nodeFound: Boolean(currentNode),
      top3,
      returnValue: [],
      edgeFromPrefix: prefixBefore,
      edgeChar: c,
      edgeFound: Boolean(currentNode),
      decision: currentNode
        ? { vi: `Tìm thấy cạnh '${shownChar}' → chuyển current node`, en: `Found '${shownChar}' edge → move current node` }
        : { vi: `Không có cạnh '${shownChar}' → node = None`, en: `No '${shownChar}' edge → node = None` },
      title: { vi: `input('${shownChar}') 2/3: lookup cạnh Trie`, en: `input('${shownChar}') 2/3: look up Trie edge` },
      codeLines: [35, 36],
      vars: [
        { name: "prefix", value: `"${prefix}"` },
        { name: `children['${shownChar}']`, value: currentNode ? `TrieNode("${prefix}")` : "None" },
        { name: "node.hot", value: `[${top3.map((s) => `"${s}"`).join(", ")}]` },
      ],
      note: {
        vi: currentNode
          ? `Lookup thành công. current node bây giờ đại diện prefix "${prefix}"; cache hot[3] đã có sẵn, không cần DFS hay quét history.`
          : `Lookup thất bại. Node trở thành None; mọi ký tự tiếp theo sẽ tiếp tục trả [] cho đến khi gặp '#'.`,
        en: currentNode
          ? `Lookup succeeded. The current node now represents prefix "${prefix}"; hot[3] is already cached, so no DFS or history scan is needed.`
          : `Lookup failed. The node becomes None; following characters keep returning [] until '#'.`,
      },
    });

    snap({
      phase: "type",
      stage: "return-hot",
      action: currentNode ? "rank" : "no-match",
      charIndex,
      inputChar: c,
      prefixBefore,
      prefix,
      triePrefix: prefix,
      inspectPrefix: prefix,
      nodeFound: Boolean(currentNode),
      top3,
      returnValue: top3,
      edgeFromPrefix: prefixBefore,
      edgeChar: c,
      edgeFound: Boolean(currentNode),
      decision: currentNode
        ? { vi: `Copy node.hot → trả ${top3.length} gợi ý`, en: `Copy node.hot → return ${top3.length} suggestions` }
        : { vi: "node = None → return []", en: "node = None → return []" },
      title: { vi: `input('${shownChar}') 3/3: trả kết quả`, en: `input('${shownChar}') 3/3: return result` },
      codeLines: [37],
      vars: [
        { name: "ranking key", value: "(-frequency, sentence)" },
        { name: "node.hot", value: `[${top3.map((s) => `"${s}"`).join(", ")}]` },
        { name: "return", value: `[${top3.map((s) => `"${s}"`).join(", ")}]` },
      ],
      note: {
        vi: currentNode
          ? `Trả bản copy node.hot. Thứ tự đã đúng: frequency giảm dần; nếu bằng nhau thì sentence tăng dần theo từ điển.`
          : "Không có node tương ứng với prefix nên kết quả là [].",
        en: currentNode
          ? `Return a copy of node.hot. It is already ordered by frequency descending, then sentence lexicographically ascending.`
          : "There is no node for the prefix, so the result is [].",
      },
    });
  }

  const finalTop3 = currentNode && prefix ? [...currentNode.hot] : [];
  snap({
    phase: "done",
    stage: "done",
    action: "done",
    charIndex: typed.length,
    prefix,
    triePrefix: prefix,
    inspectPrefix: prefix,
    nodeFound: Boolean(currentNode),
    top3: finalTop3,
    returnValue: finalTop3,
    decision: { vi: `Hoàn tất ${typed.length} input call qua ${steps.length} debug step`, en: `Finished ${typed.length} input calls across ${steps.length} debug steps` },
    title: { vi: "Hoàn tất toàn bộ input stream", en: "Finished the complete input stream" },
    final: true,
    codeLines: [37],
    vars: [
      { name: "prefix", value: `"${prefix}"` },
      { name: "node", value: currentNode ? `TrieNode("${prefix}")` : "None" },
      { name: "last return", value: `[${finalTop3.map((s) => `"${s}"`).join(", ")}]` },
    ],
    note: {
      vi: `Visualization đã tách từng input thành các bước đọc ký tự, lookup cạnh, inspect cache và return; '#' được tách thành detect, update và reset.`,
      en: `The visualization splits every input into read, edge lookup, cache inspection, and return; '#' is split into detect, update, and reset.`,
    },
  });

  return { original: typed, answer: `prefix="${prefix}"`, steps };
}

/**
 * LeetCode 677: Map Sum Pairs.
 * Each Trie node caches the sum of all key values in its subtree. Replacing a
 * key propagates only delta = newValue - oldValue along that key's path.
 */
function buildSteps677(input) {
  const stripQuotes = (value) => {
    const text = String(value ?? "").trim();
    return ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))
      ? text.slice(1, -1)
      : text;
  };
  const operations = String(input).split(/\s*[;|]\s*/).filter(Boolean).map((raw, index) => {
    const match = raw.trim().match(/^(insert|sum)\s*\((.*)\)$/i);
    if (!match) throw new Error(`Invalid operation #${index + 1}: ${raw}`);
    const type = match[1].toLowerCase();
    const args = match[2].split(",").map((item) => item.trim());
    if (type === "insert") {
      const key = stripQuotes(args[0]);
      const value = Number(args[1]);
      if (!/^[a-z]+$/.test(key) || !Number.isInteger(value) || value < 0 || args.length !== 2) {
        throw new Error(`insert requires a lowercase key and a non-negative integer: ${raw}`);
      }
      return { type, key, value, label: `insert(\"${key}\", ${value})` };
    }
    const prefix = stripQuotes(args[0]);
    if (!/^[a-z]+$/.test(prefix) || args.length !== 1) {
      throw new Error(`sum requires one lowercase prefix: ${raw}`);
    }
    return { type, prefix, label: `sum(\"${prefix}\")` };
  });
  if (!operations.length) throw new Error("Enter at least one insert(...) or sum(...) operation");

  let nextId = 0;
  const makeNode = (char, prefix, parentId) => ({
    id: nextId++,
    char,
    prefix,
    parentId,
    score: 0,
    children: {},
  });
  const root = makeNode("ROOT", "", null);
  const values = new Map();
  const outputs = [];
  const steps = [];

  function treeSnapshot(activeIds = [], activeId = null, createdId = null) {
    const nodes = [];
    const annotations = {};
    let nextX = 0;
    const activeSet = new Set(activeIds);
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (!keys.length) {
        x = nextX++;
      } else {
        const childXs = keys.map((key) => dfs(node.children[key], depth + 1));
        x = (childXs[0] + childXs[childXs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        labelLines: [node.char === "ROOT" ? "ROOT" : `'${node.char}'`, `Σ=${node.score}`],
        x,
        y: depth,
        parentId: node.parentId,
        hl: activeSet.has(node.id),
        isWord: node.prefix !== "" && values.has(node.prefix),
      });
      if (node.id === activeId) annotations[node.id] = { label: "CURRENT", kind: "current" };
      if (node.id === createdId) annotations[node.id] = { label: "NEW NODE", kind: "created" };
      return x;
    }
    dfs(root, 0);
    return { nodes, annotations, showLevels: false };
  }

  function pathDetails(prefixes) {
    const details = [];
    let node = root;
    details.push({ prefix: "", char: "ROOT", score: root.score });
    for (const prefix of prefixes.slice(1)) {
      const char = prefix[prefix.length - 1];
      if (!node.children[char]) break;
      node = node.children[char];
      details.push({ prefix, char, score: node.score });
    }
    return details;
  }

  function snapshot(opts) {
    const op = Number.isInteger(opts.opIndex) && opts.opIndex >= 0 ? operations[opts.opIndex] : null;
    const target = op ? (op.type === "insert" ? op.key : op.prefix) : "";
    const prefixes = opts.pathPrefixes || [""];
    steps.push({
      title: opts.title,
      arr: [],
      tree: treeSnapshot(opts.activeIds || [root.id], opts.activeId ?? root.id, opts.createdId ?? null),
      mapSumView: {
        phase: opts.phase || "operation",
        event: opts.event || "inspect",
        operations: operations.map((operation) => ({ ...operation })),
        opIndex: opts.opIndex ?? -1,
        operation: op ? { ...op } : null,
        target,
        charIndex: opts.charIndex ?? -1,
        edgeChar: opts.edgeChar ?? null,
        edgeFound: opts.edgeFound,
        currentPrefix: opts.currentPrefix ?? "",
        path: pathDetails(prefixes),
        oldValue: opts.oldValue,
        newValue: opts.newValue,
        delta: opts.delta,
        change: opts.change ? { ...opts.change } : null,
        result: opts.result,
        nodeFound: opts.nodeFound,
        values: [...values.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ({ key, value })),
        outputs: outputs.map((output) => ({ ...output })),
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: [
        { name: "operation", value: op ? op.label : "MapSum()" },
        { name: "prefix", value: JSON.stringify(opts.currentPrefix ?? "") },
        ...(opts.delta === undefined ? [] : [{ name: "delta", value: opts.delta }]),
        ...(opts.result === undefined ? [] : [{ name: "result", value: opts.result }]),
        { name: "values", value: `{${[...values.entries()].map(([key, value]) => `${key}:${value}`).join(", ")}}` },
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  snapshot({
    title: { vi: "Khởi tạo MapSum", en: "Initialize MapSum" },
    phase: "init",
    event: "init",
    opIndex: -1,
    codeLines: [7, 8, 9],
    note: {
      vi: "Trie bắt đầu với root rỗng. values nhớ giá trị chính xác của từng key để xử lý overwrite.",
      en: "The Trie starts with an empty root. values remembers each key's exact value so overwrites can use a delta.",
    },
  });

  operations.forEach((op, opIndex) => {
    snapshot({
      title: { vi: `Thao tác ${opIndex + 1}: ${op.label}`, en: `Operation ${opIndex + 1}: ${op.label}` },
      phase: "operation",
      event: "operation-start",
      opIndex,
      codeLines: [op.type === "insert" ? 10 : 19],
      note: op.type === "insert"
        ? { vi: `Bắt đầu insert key "${op.key}" với value = ${op.value}.`, en: `Begin inserting key "${op.key}" with value = ${op.value}.` }
        : { vi: `Bắt đầu tìm prefix "${op.prefix}"; không cần DFS vì node đã cache tổng.`, en: `Begin looking up prefix "${op.prefix}"; no DFS is needed because the node caches its sum.` },
    });

    if (op.type === "insert") {
      const oldValue = values.get(op.key) || 0;
      const delta = op.value - oldValue;
      values.set(op.key, op.value);
      snapshot({
        title: { vi: `Tính delta = ${op.value} − ${oldValue} = ${delta}`, en: `Compute delta = ${op.value} − ${oldValue} = ${delta}` },
        phase: "delta",
        event: "delta",
        opIndex,
        oldValue,
        newValue: op.value,
        delta,
        codeLines: [11, 12],
        note: {
          vi: `Chỉ cộng delta = ${delta} lên các node. Nhờ vậy overwrite không cộng trùng toàn bộ value mới.`,
          en: `Only add delta = ${delta} to the path. This prevents an overwrite from adding the full new value twice.`,
        },
      });

      let node = root;
      const activeIds = [root.id];
      const prefixes = [""];
      for (let charIndex = 0; charIndex < op.key.length; charIndex++) {
        const char = op.key[charIndex];
        const prefix = op.key.slice(0, charIndex + 1);
        const existed = Boolean(node.children[char]);
        if (!existed) node.children[char] = makeNode(char, prefix, node.id);
        node = node.children[char];
        activeIds.push(node.id);
        prefixes.push(prefix);
        snapshot({
          title: {
            vi: `${existed ? "Đi theo" : "Tạo"} cạnh '${char}' → prefix "${prefix}"`,
            en: `${existed ? "Follow" : "Create"} edge '${char}' → prefix "${prefix}"`,
          },
          phase: "walk",
          event: existed ? "follow-edge" : "create-edge",
          opIndex,
          charIndex,
          edgeChar: char,
          edgeFound: existed,
          currentPrefix: prefix,
          pathPrefixes: [...prefixes],
          activeIds: [...activeIds],
          activeId: node.id,
          createdId: existed ? null : node.id,
          oldValue,
          newValue: op.value,
          delta,
          codeLines: [14, 15, 16, 17],
          note: {
            vi: existed
              ? `Cạnh '${char}' đã tồn tại; di chuyển node tới prefix "${prefix}".`
              : `Chưa có cạnh '${char}', tạo TrieNode mới cho prefix "${prefix}".`,
            en: existed
              ? `Edge '${char}' exists; move node to prefix "${prefix}".`
              : `Edge '${char}' is missing; create a TrieNode for prefix "${prefix}".`,
          },
        });

        const before = node.score;
        node.score += delta;
        snapshot({
          title: { vi: `Cập nhật Σ("${prefix}"): ${before} → ${node.score}`, en: `Update Σ("${prefix}"): ${before} → ${node.score}` },
          phase: "update",
          event: "update-score",
          opIndex,
          charIndex,
          edgeChar: char,
          edgeFound: true,
          currentPrefix: prefix,
          pathPrefixes: [...prefixes],
          activeIds: [...activeIds],
          activeId: node.id,
          oldValue,
          newValue: op.value,
          delta,
          change: { prefix, before, after: node.score },
          codeLines: [18],
          note: {
            vi: `node.score += delta: ${before} + (${delta}) = ${node.score}. Đây là tổng value của mọi key bắt đầu bằng "${prefix}".`,
            en: `node.score += delta: ${before} + (${delta}) = ${node.score}. This is the value sum of all keys starting with "${prefix}".`,
          },
        });
      }
      return;
    }

    let node = root;
    const activeIds = [root.id];
    const prefixes = [""];
    let missing = false;
    for (let charIndex = 0; charIndex < op.prefix.length; charIndex++) {
      const char = op.prefix[charIndex];
      const prefix = op.prefix.slice(0, charIndex + 1);
      if (!node.children[char]) {
        missing = true;
        snapshot({
          title: { vi: `Không có cạnh '${char}' → tổng = 0`, en: `Missing edge '${char}' → sum = 0` },
          phase: "walk",
          event: "missing-edge",
          opIndex,
          charIndex,
          edgeChar: char,
          edgeFound: false,
          currentPrefix: prefixes[prefixes.length - 1],
          pathPrefixes: [...prefixes],
          activeIds: [...activeIds],
          activeId: node.id,
          result: 0,
          nodeFound: false,
          codeLines: [21, 22],
          note: {
            vi: `Prefix bị đứt tại '${char}', nên không key nào khớp và sum trả về 0.`,
            en: `The prefix path breaks at '${char}', so no key matches and sum returns 0.`,
          },
        });
        break;
      }
      node = node.children[char];
      activeIds.push(node.id);
      prefixes.push(prefix);
      snapshot({
        title: { vi: `Đi theo '${char}' → prefix "${prefix}"`, en: `Follow '${char}' → prefix "${prefix}"` },
        phase: "walk",
        event: "query-edge",
        opIndex,
        charIndex,
        edgeChar: char,
        edgeFound: true,
        currentPrefix: prefix,
        pathPrefixes: [...prefixes],
        activeIds: [...activeIds],
        activeId: node.id,
        nodeFound: true,
        codeLines: [21, 22, 23],
        note: {
          vi: `Tìm thấy node prefix "${prefix}" với tổng cache hiện tại Σ = ${node.score}.`,
          en: `Found prefix node "${prefix}" with current cached sum Σ = ${node.score}.`,
        },
      });
    }

    const result = missing ? 0 : node.score;
    outputs.push({ opIndex, prefix: op.prefix, value: result });
    snapshot({
      title: { vi: `sum("${op.prefix}") = ${result}`, en: `sum("${op.prefix}") = ${result}` },
      phase: "return",
      event: "return-sum",
      opIndex,
      charIndex: missing ? Math.max(0, prefixes.length - 1) : op.prefix.length - 1,
      edgeFound: !missing,
      currentPrefix: missing ? prefixes[prefixes.length - 1] : op.prefix,
      pathPrefixes: [...prefixes],
      activeIds: [...activeIds],
      activeId: node.id,
      result,
      nodeFound: !missing,
      codeLines: missing ? [22] : [24],
      note: missing
        ? { vi: `Đường prefix không tồn tại → trả về 0.`, en: `The prefix path does not exist → return 0.` }
        : { vi: `Đọc trực tiếp node.score = ${result}; không cần duyệt các key con.`, en: `Read node.score = ${result} directly; no descendant traversal is needed.` },
    });
  });

  const answer = outputs.map((output) => output.value);
  snapshot({
    title: { vi: `Hoàn tất · kết quả sum = [${answer.join(", ")}]`, en: `Done · sum results = [${answer.join(", ")}]` },
    phase: "done",
    event: "done",
    opIndex: operations.length,
    activeIds: [root.id],
    activeId: root.id,
    codeLines: [],
    final: true,
    note: {
      vi: "Mỗi insert/sum chỉ đi qua độ dài key hoặc prefix; tổng đã được cache ngay tại node.",
      en: "Each insert/sum only walks the key or prefix length; every sum is cached directly on its node.",
    },
  });

  return { operations, answer, steps };
}

module.exports = {
  677: {
    id: 677,
    difficulty: "medium",
    slug: "map-sum-pairs",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    tags: [{ key: "hashmap", vi: "Bảng băm", en: "Hash Map" }],
    title: { vi: "Map Sum Pairs", en: "Map Sum Pairs" },
    titleVi: { vi: "Cặp ánh xạ và tổng theo tiền tố", en: "Map keys and query prefix sums" },
    statement: {
      vi: "Thiết kế MapSum hỗ trợ insert(key, val) và sum(prefix). insert gán val cho key, ghi đè giá trị cũ nếu key đã tồn tại. sum trả về tổng value của mọi key bắt đầu bằng prefix.",
      en: "Design MapSum with insert(key, val) and sum(prefix). insert assigns val to key, replacing its old value when present. sum returns the values of all keys beginning with prefix.",
    },
    defaultInput: "insert(apple, 3); sum(ap); insert(app, 2); sum(ap); insert(apple, 2); sum(ap)",
    inputKind: "string",
    inputLabel: { vi: "Thao tác: insert(key, value); sum(prefix)", en: "Operations: insert(key, value); sum(prefix)" },
    extraParams: [],
    approach: [
      {
        vi: "Mỗi Trie node lưu score = tổng value của tất cả key đi qua node đó.",
        en: "Each Trie node stores score = the sum of values for every key passing through that node.",
      },
      {
        vi: "Hash map values nhớ giá trị cũ. Khi overwrite, tính delta = new − old rồi chỉ cộng delta trên đường key.",
        en: "A values hash map remembers old values. On overwrite, compute delta = new − old and add only delta along the key path.",
      },
      {
        vi: "sum(prefix) đi tới node cuối của prefix và trả node.score ngay lập tức; thiếu cạnh thì trả 0.",
        en: "sum(prefix) walks to the final prefix node and returns node.score immediately; a missing edge returns 0.",
      },
    ],
    complexity: {
      time: "insert: O(K) · sum: O(P)",
      space: "O(ΣK)",
      note: {
        vi: "K là độ dài key, P là độ dài prefix. Trie chứa tối đa tổng số ký tự khác nhau trên mọi key.",
        en: "K is key length and P is prefix length. The Trie stores at most the total distinct path characters across all keys.",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.score = 0",
      "",
      "class MapSum:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "        self.values = {}",
      "    def insert(self, key: str, val: int) -> None:",
      "        delta = val - self.values.get(key, 0)",
      "        self.values[key] = val",
      "        node = self.root",
      "        for char in key:",
      "            if char not in node.children:",
      "                node.children[char] = TrieNode()",
      "            node = node.children[char]",
      "            node.score += delta",
      "    def sum(self, prefix: str) -> int:",
      "        node = self.root",
      "        for char in prefix:",
      "            if char not in node.children:",
      "                return 0",
      "            node = node.children[char]",
      "        return node.score",
    ],
    builder: buildSteps677,
  },
  642: {
    id: 642,
    difficulty: "hard",
    slug: "design-search-autocomplete-system",
    category: { key: "trie", vi: "Trie", en: "Trie" },
    title: { vi: "Design Search Autocomplete System", en: "Design Search Autocomplete System" },
    titleVi: { vi: "Hệ thống gợi ý tìm kiếm (Trie + đếm tần suất)", en: "Search autocomplete (Trie + frequency ranking)" },
    statement: {
      vi:
        "Thiết kế hệ thống autocomplete. Khi người dùng gõ từng ký tự, trả về TOP 3 câu lịch sử " +
        "khớp với prefix, xếp theo (số lần dùng giảm dần, rồi thứ tự từ điển tăng). '#' kết thúc câu. " +
        "Nhập chuỗi ký tự người dùng gõ; câu lịch sử và số lần trong tham số.",
      en:
        "Design an autocomplete system. As the user types each character, return the TOP 3 historical sentences " +
        "matching the prefix, ranked by (usage count desc, then lexicographic asc). '#' ends a sentence. " +
        "Enter the typed characters; historical sentences and times are parameters.",
    },
    defaultInput: "i ",
    inputKind: "string",
    inputLabel: { vi: "Ký tự gõ vào", en: "Typed characters" },
    extraParams: [
      { key: "sentences", type: "string", label: { vi: "Câu lịch sử (cách bởi |)", en: "History sentences (| separated)" }, default: "i love you|island|iroman|i love leetcode" },
      { key: "times", type: "string", label: { vi: "Số lần (cách bởi ,)", en: "Times (comma separated)" }, default: "5,3,2,2" },
    ],
    approach: [
      { vi: "Dựng Trie; mỗi node đại diện một prefix và cache sẵn hot[3].", en: "Build a Trie; each prefix node caches its hot[3] suggestions." },
      { vi: "hot[3] luôn được xếp theo: frequency giảm dần, rồi câu tăng dần theo từ điển.", en: "hot[3] is ordered by frequency descending, then sentence lexicographically ascending." },
      { vi: "input(c): đi từ node hiện tại qua children[c], trả ngay node.hot; không quét toàn bộ lịch sử.", en: "input(c): follow children[c] from the current node and return node.hot without scanning history." },
      { vi: "input('#'): tăng frequency của câu, cập nhật hot[3] dọc đường Trie, rồi reset về root.", en: "input('#'): increment the sentence frequency, refresh hot[3] along its Trie path, then reset to root." },
    ],
    complexity: {
      time: "input(char): O(1), input('#'): O(L)",
      space: "O(S)",
      note: {
        vi: "L = độ dài câu vừa lưu; S = tổng số ký tự trong Trie. Mỗi node chỉ cache tối đa 3 câu nên sort là hằng số.",
        en: "L = committed sentence length; S = total Trie characters. Each node caches at most 3 sentences, so its sort is constant-sized.",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.hot = []",
      "",
      "class AutocompleteSystem:",
      "    def __init__(self, sentences, times):",
      "        self.counts = {}",
      "        self.root = TrieNode()",
      "        self.prefix = ''",
      "        self.node = self.root",
      "        for s, t in zip(sentences, times):",
      "            self._add(s, t)",
      "",
      "    def _update_hot(self, node, sentence):",
      "        if sentence not in node.hot:",
      "            node.hot.append(sentence)",
      "        node.hot.sort(key=lambda s: (-self.counts[s], s))",
      "        node.hot = node.hot[:3]",
      "",
      "    def _add(self, sentence, amount):",
      "        self.counts[sentence] = self.counts.get(sentence, 0) + amount",
      "        node = self.root",
      "        self._update_hot(node, sentence)",
      "        for ch in sentence:",
      "            node = node.children.setdefault(ch, TrieNode())",
      "            self._update_hot(node, sentence)",
      "",
      "    def input(self, c):",
      "        if c == '#':",
      "            self._add(self.prefix, 1)",
      "            self.prefix = ''",
      "            self.node = self.root",
      "            return []",
      "        self.prefix += c",
      "        self.node = self.node.children.get(c) if self.node else None",
      "        return self.node.hot[:] if self.node else []",
    ],
    builder: buildSteps642,
  },
  212: {
    id: 212,
    difficulty: "hard",
    slug: "word-search-ii",
    category: { key: "trie", vi: "Trie", en: "Trie" },
    title: { vi: "Word Search II", en: "Word Search II" },
    titleVi: { vi: "Tìm nhiều từ trên bảng (Trie + DFS)", en: "Find many words on a board (Trie + DFS)" },
    statement: {
      vi:
        "Cho bảng ký tự và danh sách words. Tìm mọi từ có thể ghép từ các ô kề nhau (4 hướng), " +
        "mỗi ô dùng 1 lần trong một từ. Dùng Trie để cắt tỉa. " +
        "Nhập bảng: hàng cách bởi ';', ký tự cách bởi ','; words trong tham số.",
      en:
        "Given a board of letters and a list of words, find all words formable from adjacent cells (4 directions), " +
        "each cell used once per word. Use a Trie to prune. " +
        "Enter board: rows separated by ';', letters by ','; words as a parameter.",
    },
    defaultInput: "o,a,a,n;e,t,a,e;i,h,k,r;i,f,l,v",
    inputKind: "string",
    inputLabel: { vi: "Bảng (hàng cách ;)", en: "Board (rows separated by ;)" },
    extraParams: [
      { key: "words", type: "string", label: { vi: "words (cách bởi ,)", en: "words (comma separated)" }, default: "oath,pea,eat,rain" },
    ],
    approach: [
      { vi: "Xây Trie chứa mọi từ; lá đánh dấu '$' (từ hoàn chỉnh).", en: "Build a Trie of all words; a leaf marks '$' (a complete word)." },
      { vi: "DFS từng ô; chỉ đi tiếp nếu chữ cái là con của node Trie hiện tại (cắt tỉa mạnh).", en: "DFS each cell; continue only if the letter is a child of the current Trie node (strong pruning)." },
      { vi: "Đánh dấu ô đang thăm '#' để không dùng lại; khôi phục khi quay lui.", en: "Mark the current cell '#' so it isn't reused; restore on backtrack." },
      { vi: "Khi gặp '$' trong node → thêm từ vào kết quả, xóa '$' để tránh trùng.", en: "When a node has '$' → add the word to the result and delete '$' to avoid duplicates." },
    ],
    complexity: {
      time: "O(rows·cols·4^L)",
      space: "O(total word length)",
      note: {
        vi: "L = độ dài từ dài nhất. Trie giúp cắt tỉa sớm nên thực tế nhanh hơn nhiều.",
        en: "L = longest word length. The Trie prunes early, so it's much faster in practice.",
      },
    },
    code: [
      "class Solution:",
      "    def findWords(self, board, words):",
      "        if not board or not board[0]:",
      "            return []",
      "        rows, cols = len(board), len(board[0])",
      "        trie = {}",
      "        for word in words:",
      "            node = trie",
      "            for ch in word:",
      "                node = node.setdefault(ch, {})",
      "            node['$'] = word",
      "        result = []",
      "",
      "        def dfs(r, c, node):",
      "            ch = board[r][c]",
      "            if ch not in node:",
      "                return",
      "            nxt = node[ch]",
      "            if '$' in nxt:",
      "                result.append(nxt['$'])",
      "                del nxt['$']",
      "            board[r][c] = '#'",
      "            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '#':",
      "                    dfs(nr, nc, nxt)",
      "            board[r][c] = ch",
      "",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                dfs(r, c, trie)",
      "        return result",
    ],
    liveArgs: (input, params = {}) => [
      String(input).split(/[;|]/).map((row) => row.trim()).filter(Boolean)
        .map((row) => row.split(",").map((value) => value.trim())),
      String(params.words || "").split(",").map((word) => word.trim()).filter(Boolean),
    ],
    builder: buildSteps212,
  },
  676: {
    id: 676,
    difficulty: "medium",
    slug: "implement-magic-dictionary",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Implement Magic Dictionary", en: "Implement Magic Dictionary" },
    titleVi: { vi: "Từ điển ma thuật (Trie + DFS)", en: "Magic dictionary via Trie" },
    statement: {
      vi: "Xây một Trie từ danh sách từ. search(word) trả về True nếu có từ trong Trie khác word đúng 1 ký tự.",
      en: "Build a Trie from a word list. search(word) returns True if there's a word in the Trie that differs from word in exactly one character.",
    },
    defaultInput: "hello,hallo",
    inputKind: "string",
    inputLabel: { vi: "Từ điển (phẩy ngăn cách)", en: "Dictionary words (comma separated)" },
    extraParams: [{ key: "search", type: "string", label: { vi: "Từ cần tìm (phẩy ngăn cách)", en: "Words to search (comma separated)" }, default: "hello,hhllo" }],
    complexity: { time: "O(N·L²)", space: "O(N·L)", note: { vi: "Mỗi search duyệt Trie sâu L, thử thay 1 ký tự nên O(26·L) = O(L²). Bộ nhớ O(N·L) cho Trie.", en: "Each search traverses depth L, trying one swap → O(26·L). Memory O(N·L) for the Trie." } },
    code: ["class MagicDictionary:", "    def __init__(self):", "        self.root = {}", "    def buildDict(self, words):", "        for w in words:", "            node = self.root", "            for ch in w:", "                node = node.setdefault(ch, {})", "            node['$'] = True", "    def search(self, word):", "        def dfs(node, i, misses):", "            if i == len(word):", "                return '$' in node and misses == 1", "            for ch in node:", "                if ch == '$': continue", "                dfs(node[ch], i+1, misses+(ch!=word[i]))", "            return False", "        return dfs(self.root, 0, 0)"],
    builder: buildSteps676,
  },
  1268: {
    id: 1268,
    difficulty: "medium",
    slug: "search-suggestions-system",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Search Suggestions System", en: "Search Suggestions System" },
    titleVi: { vi: "Gợi ý tìm kiếm (Trie)", en: "Search suggestions via Trie" },
    statement: {
      vi: "Cho danh sách sản phẩm và searchWord. Sau mỗi ký tự gõ, trả về tối đa 3 sản phẩm có tiền tố khớp (theo thứ tự từ điển).",
      en: "Given a list of products and a searchWord, after each character typed, return up to 3 product suggestions that share the prefix (lexicographic order).",
    },
    defaultInput: "mobile,mouse,moneypot,monitor,mousepad",
    inputKind: "string",
    inputLabel: { vi: "Sản phẩm (phẩy ngăn cách)", en: "Products (comma separated)" },
    extraParams: [{ key: "searchWord", type: "string", label: { vi: "searchWord", en: "searchWord" }, default: "mouse" }],
    complexity: { time: "O(M + n·L)", space: "O(M)", note: { vi: "Xây Trie O(M) tổng ký tự sản phẩm. Mỗi ký tự gõ, DFS lấy ≤3 từ O(3·L).", en: "Build Trie O(M) total product chars. Per typed char, DFS collects ≤3 words in O(3·L)." } },
    code: ["class Solution:", "    def suggestedProducts(self, products, searchWord):", "        products.sort()", "        root = {}", "        for w in products:", "            node = root", "            for ch in w:", "                node = node.setdefault(ch, {})", "            node['$'] = True", "        def dfs(node, word, suggestions):", "            if len(suggestions) == 3:", "                return", "            if '$' in node:", "                suggestions.append(word)", "            for ch in sorted(key for key in node if key != '$'):", "                dfs(node[ch], word + ch, suggestions)", "        res = []", "        node, prefix = root, ''", "        for ch in searchWord:", "            prefix += ch", "            node = node.get(ch)", "            if not node: break", "            sugg = []; dfs(node, prefix, sugg)", "            res.append(sugg[:3])", "        return res"],
    builder: buildSteps1268,
  },
  1166: {
    id: 1166,
    difficulty: "medium",
    slug: "design-file-system",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Design File System", en: "Design File System" },
    titleVi: { vi: "Thiết kế hệ thống file (Trie đường dẫn)", en: "File system via path Trie" },
    statement: {
      vi: "createPath(path, value) tạo đường dẫn mới (cha phải tồn tại). get(path) trả về value hoặc -1.",
      en: "createPath(path, value) creates a new path (parent must exist). get(path) returns the value or -1.",
    },
    defaultInput: 'create(/leet,1);create(/leet/code,2);get(/leet/code);get(/leet/missing)',
    inputKind: "string",
    inputLabel: { vi: "Các lệnh (;ngăn cách)", en: "Operations (semicolon separated)" },
    extraParams: [],
    complexity: { time: "O(L)", space: "O(N·L)", note: { vi: "Mỗi thao tác O(L) theo độ dài đường dẫn. Bộ nhớ O(N·L).", en: "Each operation is O(L) by path length. Memory O(N·L)." } },
    code: ["class FileSystem:", "    def __init__(self):", "        self.root = {}", "    def createPath(self, path, value):", "        parts = path.split('/')[1:]", "        node = self.root", "        for p in parts[:-1]:", "            if p not in node: return False", "            node = node[p]", "        if parts[-1] in node: return False", "        node[parts[-1]] = {'$val': value}", "        return True", "    def get(self, path):", "        node = self.root", "        for p in path.split('/')[1:]:", "            if p not in node: return -1", "            node = node[p]", "        return node.get('$val', -1)"],
    builder: buildSteps1166,
  },
  588: {
    id: 588,
    difficulty: "hard",
    slug: "design-in-memory-file-system",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Design In-Memory File System", en: "Design In-Memory File System" },
    titleVi: { vi: "Hệ thống file trong bộ nhớ (Trie)", en: "In-memory file system via Trie" },
    statement: {
      vi: "Hỗ trợ: ls(path), mkdir(path), addContentToFile(path, content), readContentFromFile(path).",
      en: "Support: ls(path), mkdir(path), addContentToFile(path, content), readContentFromFile(path).",
    },
    defaultInput: 'mkdir(/a/b/c);addContentToFile(/a/b/c/d,"hello");readContentFromFile(/a/b/c/d);ls(/a/b/c)',
    inputKind: "string",
    inputLabel: { vi: "Các lệnh (; ngăn cách)", en: "Operations (semicolon separated)" },
    extraParams: [],
    approach: [
      { vi: "Mỗi segment trong path là một node Trie: node thường là folder, node có content là file.", en: "Each path segment is a Trie node: regular nodes are folders and content-bearing nodes are files." },
      { vi: "_navigate tách path theo '/', đi từ root và dùng lại node đã có; mkdir/addContentToFile tạo node còn thiếu.", en: "_navigate splits path by '/', starts at root, reuses existing nodes, and lets mkdir/addContentToFile create missing nodes." },
      { vi: "addContentToFile nối thêm content; readContentFromFile trả content; ls trả tên file hoặc danh sách children đã sort.", en: "addContentToFile appends content; readContentFromFile returns content; ls returns a file name or sorted child names." },
    ],
    complexity: {
      time: "navigate O(L); ls O(L + K log K)",
      space: "O(N·L + C)",
      note: {
        vi: "L = số segment của path, K = số children cần sort, C = tổng nội dung file. Đọc/ghi còn phụ thuộc độ dài content.",
        en: "L = path segments, K = children to sort, C = total file content. Reading/writing also depends on content length.",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.content = None  # None = directory, str = file",
      "",
      "class FileSystem:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "",
      "    def ls(self, path):",
      "        node = self._navigate(path)",
      "        if node.content is not None:",
      "            return [path.split('/')[-1]]",
      "        return sorted(node.children.keys())",
      "",
      "    def mkdir(self, path):",
      "        self._navigate(path, create=True)",
      "",
      "    def addContentToFile(self, path, content):",
      "        node = self._navigate(path, create=True)",
      "        if node.content is None:",
      "            node.content = ''",
      "        node.content += content",
      "",
      "    def readContentFromFile(self, path):",
      "        node = self._navigate(path)",
      "        return node.content",
      "",
      "    def _navigate(self, path, create=False):",
      "        node = self.root",
      "        for part in path.split('/')[1:]:",
      "            if not part:",
      "                continue",
      "            if part not in node.children:",
      "                if not create:",
      "                    return None",
      "                node.children[part] = TrieNode()",
      "            node = node.children[part]",
      "        return node",
    ],
    builder: buildSteps588,
  },
  208: {
    id: 208,
    difficulty: "medium",
    slug: "implement-trie-prefix-tree",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Implement Trie (Prefix Tree)", en: "Implement Trie (Prefix Tree)" },
    titleVi: { vi: "Cài đặt Trie (cây tiền tố)", en: "Implement a prefix tree" },
    statement: {
      vi:
        "Cài đặt Trie với các thao tác: insert(word) chèn một từ; " +
        "search(word) trả về True nếu từ đã được chèn; " +
        "startsWith(prefix) trả về True nếu có từ nào bắt đầu bằng tiền tố. " +
        "Nhập danh sách từ cần chèn (cách nhau bởi dấu phẩy), một từ để search và một tiền tố để startsWith.",
      en:
        "Implement a Trie with: insert(word) inserts a word; " +
        "search(word) returns True if the word was inserted; " +
        "startsWith(prefix) returns True if any inserted word starts with the prefix. " +
        "Enter the words to insert (comma separated), a word to search, and a prefix to test.",
    },
    defaultInput: "apple,apply,app",
    inputKind: "string",
    inputLabel: { vi: "Các từ chèn (cách nhau bởi dấu phẩy)", en: "Words to insert (comma separated)" },
    extraParams: [
      {
        key: "search",
        type: "string",
        label: { vi: "search(word)", en: "search(word)" },
        default: "app",
      },
      {
        key: "prefix",
        type: "string",
        label: { vi: "startsWith(prefix)", en: "startsWith(prefix)" },
        default: "appl",
      },
    ],
    complexity: {
      time: "O(L)",
      space: "O(N·L)",
      note: {
        vi: "Mỗi thao tác (insert/search/startsWith) duyệt qua tối đa L ký tự nên O(L). Bộ nhớ tối đa O(N·L) với N từ, mỗi từ dài tối đa L.",
        en: "Each operation (insert/search/startsWith) walks at most L characters, so O(L). Memory is at most O(N·L) for N words of length up to L.",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.is_word = False",
      "",
      "class Trie:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "",
      "    def insert(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                node.children[ch] = TrieNode()",
      "            node = node.children[ch]",
      "        node.is_word = True",
      "",
      "    def search(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                return False",
      "            node = node.children[ch]",
      "        return node.is_word",
      "",
      "    def startsWith(self, prefix):",
      "        node = self.root",
      "        for ch in prefix:",
      "            if ch not in node.children:",
      "                return False",
      "            node = node.children[ch]",
      "        return True",
    ],
    builder: buildSteps208,
  },
  1804: {
    id: 1804,
    difficulty: "medium",
    slug: "implement-trie-ii-prefix-tree",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Implement Trie II (Prefix Tree)", en: "Implement Trie II (Prefix Tree)" },
    titleVi: { vi: "Cài đặt Trie II (cây tiền tố)", en: "Implement Trie II" },
    statement: {
      vi:
        "Cài đặt Trie II với các thao tác: insert(word) chèn một từ; " +
        "countWordsEqualTo(word) trả về số lần từ đó được chèn; " +
        "countWordsStartingWith(prefix) trả về số từ có tiền tố đó; " +
        "erase(word) xóa 1 bản của từ đó khỏi Trie. " +
        "Mỗi nút lưu prefixCount (số từ đi qua) và wordCount (số từ kết thúc tại đây).",
      en:
        "Implement a Trie II with: insert(word) inserts a word; " +
        "countWordsEqualTo(word) returns how many times that word was inserted; " +
        "countWordsStartingWith(prefix) returns the number of words with that prefix; " +
        "erase(word) removes one copy of the word from the Trie. " +
        "Each node stores prefixCount (words passing through) and wordCount (words ending here).",
    },
    defaultInput: "apple,apple,app,apply",
    inputKind: "string",
    inputLabel: { vi: "Các từ chèn (cách nhau bởi dấu phẩy)", en: "Words to insert (comma separated)" },
    extraParams: [
      {
        key: "countWord",
        type: "string",
        label: { vi: "countWordsEqualTo(word)", en: "countWordsEqualTo(word)" },
        default: "apple",
      },
      {
        key: "countPrefix",
        type: "string",
        label: { vi: "countWordsStartingWith(prefix)", en: "countWordsStartingWith(prefix)" },
        default: "app",
      },
      {
        key: "erase",
        type: "string",
        label: { vi: "erase(word)", en: "erase(word)" },
        default: "apple",
      },
    ],
    complexity: {
      time: "O(L)",
      space: "O(N·L)",
      note: {
        vi: "Mỗi thao tác duyệt tối đa L ký tự → O(L). Bộ nhớ O(N·L) cho N từ dài tối đa L.",
        en: "Each operation traverses at most L characters → O(L). Memory O(N·L) for N words of length up to L.",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.prefix_count = 0",
      "        self.word_count = 0",
      "",
      "class Trie:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "    def insert(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                node.children[ch] = TrieNode()",
      "            node = node.children[ch]",
      "            node.prefix_count += 1",
      "        node.word_count += 1",
      "    def countWordsEqualTo(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                return 0",
      "            node = node.children[ch]",
      "        return node.word_count",
      "    def countWordsStartingWith(self, prefix):",
      "        node = self.root",
      "        for ch in prefix:",
      "            if ch not in node.children:",
      "                return 0",
      "            node = node.children[ch]",
      "        return node.prefix_count",
      "    def erase(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            node = node.children[ch]",
      "            node.prefix_count -= 1",
      "        node.word_count -= 1",
    ],
    builder: buildSteps1804,
  },
  211: {
    id: 211,
    difficulty: "medium",
    slug: "design-add-and-search-words-data-structure",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Design Add and Search Words Data Structure", en: "Design Add and Search Words Data Structure" },
    titleVi: { vi: "Thiết kế cấu trúc thêm và tìm từ", en: "Add and search words data structure" },
    statement: {
      vi:
        "Thiết kế cấu trúc dữ liệu hỗ trợ: addWord(word) thêm một từ; " +
        "search(word) tìm từ, trong đó '.' khớp với bất kỳ ký tự nào. " +
        "Nhập danh sách từ cần thêm (cách nhau bởi dấu phẩy), và một pattern để search (có thể chứa '.').",
      en:
        "Design a data structure that supports: addWord(word) adds a word; " +
        "search(word) searches for a word where '.' can match any single character. " +
        "Enter words to add (comma separated), and a pattern to search (may contain '.').",
    },
    defaultInput: "bad,dad,mad",
    inputKind: "string",
    inputLabel: { vi: "Các từ thêm (cách nhau bởi dấu phẩy)", en: "Words to add (comma separated)" },
    extraParams: [
      {
        key: "search",
        type: "string",
        label: { vi: "search(pattern) - dùng '.' cho ký tự bất kỳ", en: "search(pattern) - use '.' for any char" },
        default: ".ad",
      },
    ],
    approach: [
      { vi: "addWord: đi từng ký tự từ root; tạo node nếu cạnh chưa có, dùng lại node nếu chung prefix, rồi đánh dấu is_word=True ở ký tự cuối.", en: "addWord: walk characters from root; create a missing edge, reuse shared-prefix nodes, then mark is_word=True at the last character." },
      { vi: "search với ký tự thường: chỉ đi đúng cạnh tương ứng. Thiếu cạnh thì nhánh đó trả False ngay.", en: "search with a literal: follow exactly that edge. A missing edge makes that branch return False immediately." },
      { vi: "search với '.': DFS thử mọi node con, backtrack khi False, và dừng sớm ngay khi một nhánh trả True.", en: "search with '.': DFS tries every child, backtracks after False, and short-circuits as soon as one branch returns True." },
      { vi: "Khớp hết pattern chỉ thành công khi node cuối có is_word=True; một prefix chưa đủ.", en: "Exhausting the pattern succeeds only when the final node has is_word=True; a prefix alone is not enough." },
    ],
    complexity: {
      time: "O(L) add / O(26^dots · L) search",
      space: "O(N·L)",
      note: {
        vi: "addWord là O(L). search tệ nhất khi có nhiều '.': mỗi '.' phân nhánh tối đa 26 con → O(26^d · L) với d là số dấu '.'. Bộ nhớ O(N·L).",
        en: "addWord is O(L). search worst case with dots: each '.' branches up to 26 children → O(26^d · L) where d is the number of dots. Memory O(N·L).",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.is_word = False",
      "",
      "class WordDictionary:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "",
      "    def addWord(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                node.children[ch] = TrieNode()",
      "            node = node.children[ch]",
      "        node.is_word = True",
      "",
      "    def search(self, word):",
      "        def dfs(node, i):",
      "            if i == len(word):",
      "                return node.is_word",
      "            if word[i] == '.':",
      "                for child in node.children.values():",
      "                    if dfs(child, i + 1):",
      "                        return True",
      "                return False",
      "            if word[i] not in node.children:",
      "                return False",
      "            return dfs(node.children[word[i]], i+1)",
      "        return dfs(self.root, 0)",
    ],
    builder: buildSteps211,
  },
  648: {
    id: 648,
    difficulty: "medium",
    slug: "replace-words",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Replace Words", en: "Replace Words" },
    titleVi: { vi: "Thay thế từ bằng gốc từ", en: "Replace words with roots" },
    statement: {
      vi:
        "Cho danh sách gốc từ (dictionary) và một câu. Thay thế mỗi từ trong câu bằng gốc từ ngắn nhất là tiền tố của nó. " +
        "Nếu một từ có nhiều gốc là tiền tố, dùng gốc ngắn nhất. Nếu không có gốc nào, giữ nguyên từ.",
      en:
        "Given a dictionary of roots and a sentence. Replace each word in the sentence with the shortest root that is a prefix of it. " +
        "If a word has multiple roots as prefixes, use the shortest one. If no root applies, keep the word unchanged.",
    },
    defaultInput: "cat,bat,rat",
    inputKind: "string",
    inputLabel: { vi: "Danh sách gốc từ (cách nhau bởi dấu phẩy)", en: "Dictionary roots (comma separated)" },
    extraParams: [
      {
        key: "sentence",
        type: "string",
        label: { vi: "Câu cần thay thế", en: "Sentence to process" },
        default: "the cattle was rattled by the battery",
      },
    ],
    complexity: {
      time: "O(N·L + S·L)",
      space: "O(N·L)",
      note: {
        vi: "Xây Trie từ N gốc từ dài tối đa L: O(N·L). Duyệt S từ trong câu, mỗi từ tra Trie tối đa L bước: O(S·L). Bộ nhớ Trie: O(N·L).",
        en: "Build Trie from N roots of max length L: O(N·L). Process S words in sentence, each Trie lookup at most L steps: O(S·L). Trie memory: O(N·L).",
      },
    },
    approach: [
      {
        vi: "Chèn từng root trong dictionary vào Trie; node cuối lưu lại root đó.",
        en: "Insert each dictionary root into a Trie; the terminal node stores that root.",
      },
      {
        vi: "Với mỗi word trong sentence, đi từ trái sang phải trên Trie để thử các prefix.",
        en: "For each sentence word, walk left to right through the Trie to test prefixes.",
      },
      {
        vi: "Vừa gặp node là root thì dừng ngay: vì đọc từ trái sang phải nên đó là root ngắn nhất.",
        en: "Stop as soon as a root node is reached: because we scan left to right, it is the shortest root.",
      },
    ],
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.is_root = False",
      "        self.word = ''",
      "",
      "class Solution:",
      "    def replaceWords(self, dictionary, sentence):",
      "        root = TrieNode()",
      "        # Build Trie from dictionary",
      "        for w in dictionary:",
      "            node = root",
      "            for ch in w:",
      "                if ch not in node.children:",
      "                    node.children[ch] = TrieNode()",
      "                node = node.children[ch]",
      "            node.is_root = True",
      "            node.word = w",
      "        # Replace each word",
      "        result = []",
      "        for word in sentence.split():",
      "            node = root",
      "            for ch in word:",
      "                if node.is_root:",
      "                    break",
      "                if ch not in node.children:",
      "                    break",
      "                node = node.children[ch]",
      "            result.append(node.word if node.is_root else word)",
      "        return ' '.join(result)",
    ],
    builder: buildSteps648,
  },
};
