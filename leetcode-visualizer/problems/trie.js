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
function buildSteps211(input, params) {
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
  const sentence = (params.sentence || "").trim();
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
        isWord: node.isRoot,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
      });
      return x;
    }
    dfs(trieRoot, 0);

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
    title: { vi: "Khởi tạo Trie từ dictionary", en: "Build Trie from dictionary" },
    codeLines: [8, 9],
    highlight: [trieRoot.id],
    vars: [
      { name: "dictionary", value: `[${roots.join(", ")}]` },
      { name: "sentence", value: sentence },
    ],
    note: {
      vi: `Xây Trie từ các gốc từ: [${roots.join(", ")}]. Sau đó thay thế từng từ trong câu.`,
      en: `Build a Trie from roots: [${roots.join(", ")}]. Then replace each word in the sentence.`,
    },
  });

  // Insert all roots into Trie
  for (const rootWord of roots) {
    let node = trieRoot;
    const path = [trieRoot.id];
    for (const ch of rootWord) {
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
      }
      node = node.children[ch];
      path.push(node.id);
    }
    node.isRoot = true;
    node.rootWord = rootWord;

    snapshot({
      title: { vi: `Chèn gốc "${rootWord}"`, en: `Insert root "${rootWord}"` },
      codeLines: [10, 11, 12, 13, 14, 15, 16, 17],
      highlight: [...path],
      vars: [
        { name: "root_word", value: rootWord },
        { name: "is_root", value: "True" },
      ],
      note: {
        vi: `Chèn "${rootWord}" vào Trie, đánh dấu nút cuối là gốc từ.`,
        en: `Insert "${rootWord}" into the Trie, mark the end node as a root.`,
      },
    });
  }

  // Process each word in the sentence
  const resultWords = [];
  for (const word of sentenceWords) {
    let node = trieRoot;
    const path = [trieRoot.id];
    let foundRoot = null;

    for (const ch of word) {
      if (node.isRoot) {
        foundRoot = node.rootWord;
        break;
      }
      if (!node.children[ch]) {
        break;
      }
      node = node.children[ch];
      path.push(node.id);
    }

    if (!foundRoot && node.isRoot) {
      foundRoot = node.rootWord;
    }

    const replacement = foundRoot || word;
    resultWords.push(replacement);

    snapshot({
      title: {
        vi: foundRoot ? `"${word}" → "${foundRoot}"` : `"${word}" (giữ nguyên)`,
        en: foundRoot ? `"${word}" → "${foundRoot}"` : `"${word}" (unchanged)`,
      },
      codeLines: foundRoot ? [20, 21, 22, 23, 24, 27, 28] : [20, 21, 22, 25, 26, 28],
      highlight: [...path],
      vars: [
        { name: "word", value: word },
        { name: "found_root", value: foundRoot || "none" },
        { name: "replacement", value: replacement },
      ],
      note: {
        vi: foundRoot
          ? `Từ "${word}" có gốc "${foundRoot}" là tiền tố → thay thế thành "${foundRoot}".`
          : `Từ "${word}" không khớp gốc nào trong Trie → giữ nguyên.`,
        en: foundRoot
          ? `Word "${word}" has root "${foundRoot}" as prefix → replace with "${foundRoot}".`
          : `Word "${word}" has no matching root in the Trie → keep unchanged.`,
      },
    });
  }

  const answer = resultWords.join(" ");
  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [29],
    highlight: [trieRoot.id],
    vars: [{ name: "result", value: answer }],
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
function buildSteps588(input, params) {
  const ops = String(input).split(";").map((s) => s.trim()).filter(Boolean);

  let idCounter = 0;
  const makeNode = (label, parentId) => ({ id: idCounter++, label, parentId, content: null, children: {} });
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
      const lbl = node.content !== null ? `📄${node.label}` : node.label;
      nodes.push({ id: node.id, label: lbl, x, y: depth, parentId: node.parentId, isWord: node.content !== null, hl: opts.highlight ? opts.highlight.includes(node.id) : false });
      return x;
    }
    dfs(root, 0);
    steps.push({ title: opts.title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note });
  }

  snapshot({ title: { vi: "Khởi tạo File System", en: "Init File System" }, highlight: [root.id], vars: [], note: { vi: "Hệ thống file rỗng.", en: "Empty file system." } });

  function navigate(path, create) {
    const parts = path.split("/").filter(Boolean);
    let node = root;
    const ids = [root.id];
    for (const p of parts) {
      if (!node.children[p]) {
        if (!create) return { node: null, ids };
        node.children[p] = makeNode(p, node.id);
      }
      node = node.children[p];
      ids.push(node.id);
    }
    return { node, ids };
  }

  const results = [];
  for (const op of ops) {
    let m;
    if ((m = op.match(/^ls\(([^)]*)\)$/i))) {
      const path = m[1].trim() || "/";
      const { node, ids } = navigate(path, false);
      let listing = [];
      if (node) {
        if (node.content !== null) {
          listing = [node.label];
        } else {
          listing = Object.keys(node.children).sort();
        }
      }
      results.push(`ls("${path}") = [${listing.join(",")}]`);
      snapshot({ title: { vi: `ls("${path}")`, en: `ls("${path}")` }, highlight: ids, vars: [{ name: "op", value: `ls("${path}")` }, { name: "result", value: `[${listing.join(", ")}]` }], note: { vi: `Liệt kê: [${listing.join(", ")}].`, en: `List: [${listing.join(", ")}].` } });
    } else if ((m = op.match(/^mkdir\(([^)]+)\)$/i))) {
      const path = m[1].trim();
      const { ids } = navigate(path, true);
      results.push(`mkdir("${path}")`);
      snapshot({ title: { vi: `mkdir("${path}")`, en: `mkdir("${path}")` }, highlight: ids, vars: [{ name: "op", value: `mkdir("${path}")` }], note: { vi: "Tạo thư mục (và cha nếu cần).", en: "Create directory (and parents if needed)." } });
    } else if ((m = op.match(/^add\(([^,]+),\s*"([^"]*)"\)$/i))) {
      const path = m[1].trim();
      const content = m[2];
      const { node, ids } = navigate(path, true);
      node.content = (node.content || "") + content;
      results.push(`addContent("${path}", "${content}")`);
      snapshot({ title: { vi: `addContent("${path}")`, en: `addContent("${path}")` }, highlight: ids, vars: [{ name: "op", value: `add("${path}","${content}")` }, { name: "content", value: node.content }], note: { vi: `Nội dung file: "${node.content}".`, en: `File content: "${node.content}".` } });
    } else if ((m = op.match(/^read\(([^)]+)\)$/i))) {
      const path = m[1].trim();
      const { node, ids } = navigate(path, false);
      const c = node ? node.content || "" : "";
      results.push(`read("${path}") = "${c}"`);
      snapshot({ title: { vi: `read("${path}")`, en: `read("${path}")` }, highlight: ids, vars: [{ name: "op", value: `read("${path}")` }, { name: "content", value: c }], note: { vi: `Đọc file: "${c}".`, en: `Read file: "${c}".` } });
    }
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { ops, answer: results.join(" | "), steps };
}

module.exports = {
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
    code: ["class Solution:", "    def suggestedProducts(self, products, searchWord):", "        products.sort()", "        root = {}", "        for w in products:", "            node = root", "            for ch in w:", "                node = node.setdefault(ch, {})", "            node['$'] = True", "        res = []", "        node, prefix = root, ''", "        for ch in searchWord:", "            prefix += ch", "            node = node.get(ch)", "            if not node: break", "            sugg = []; dfs(node, prefix, sugg)", "            res.append(sugg[:3])", "        return res"],
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
    defaultInput: 'mkdir(/a/b/c);add(/a/b/c/d,"hello");read(/a/b/c/d);ls(/a/b/c)',
    inputKind: "string",
    inputLabel: { vi: "Các lệnh (;ngăn cách)", en: "Operations (semicolon separated)" },
    extraParams: [],
    complexity: { time: "O(L)", space: "O(N·L+C)", note: { vi: "Mỗi thao tác O(L). Bộ nhớ O(N·L + tổng nội dung file).", en: "Each operation O(L). Memory O(N·L + total file content)." } },
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
