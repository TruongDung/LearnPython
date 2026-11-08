const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const { readFrontendJavaScript } = require('./helpers/frontend-source');

const script = readFrontendJavaScript();
const source = script.slice(script.indexOf('function normalizeProblemSearch(value)'),
  script.indexOf('$("problemKeyword").addEventListener("input"'));

function element(tag = 'div') {
  const classes = new Set();
  return {
    tag, children: [], dataset: {}, events: {}, textContent: '', className: '',
    classList: {
      add: name => classes.add(name),
      contains: name => classes.has(name),
      toggle(name, force) {
        const show = force === undefined ? !classes.has(name) : force;
        if (show) classes.add(name); else classes.delete(name);
      },
    },
    set innerHTML(_value) { this.children = []; },
    append(...children) { this.children.push(...children); },
    appendChild(child) { this.children.push(child); },
    addEventListener(name, handler) { this.events[name] = handler; },
  };
}

const sum = {
  id: 129, title: { vi: 'Tổng các số từ gốc đến lá', en: 'Sum Root to Leaf Numbers' },
  titleVi: { vi: 'Ghép số từ gốc đến lá', en: 'Build root-to-leaf numbers' },
  difficulty: 'medium', tags: [{ key: 'dfs', vi: 'DFS', en: 'DFS' }], premium: true,
};
const right = { id: 199, title: { vi: 'Góc nhìn bên phải của cây', en: 'Binary Tree Right Side View' }, difficulty: 'medium' };
const groups = [
  { key: 'binary-tree', vi: 'Cây nhị phân', en: 'Binary Tree', problems: [sum, right] },
  { key: 'dfs', vi: 'Tìm kiếm theo chiều sâu', en: 'Depth-first search', problems: [sum, { ...sum, id: '129' }] },
  { key: 'bfs', vi: 'Duyệt theo tầng', en: 'Breadth-first search', problems: [right] },
  { key: 'company', vi: 'Công ty', en: 'Company', problems: [sum, right] },
];

function search(query, catalog = groups, language = 'en') {
  const nodes = new Map(['problemSearchResults', 'problemSearchItems', 'problemSearchSummary',
    'problemSearchEmpty', 'catalog', 'problemId'].map(id => [id, element()]));
  const loads = [];
  const context = {
    catalogData: catalog, problemSearchQuery: query, currentProblemId: 129, lang: language,
    $: id => nodes.get(id), document: { createElement: element },
    pick(value) { return value[context.lang] || value.en; },
    t() {
      return {
        searchResults: count => context.lang === 'vi' ? `${count} kết quả` : `${count} result${count === 1 ? '' : 's'}`,
        noSearchResults: value => `No results: ${value}`, premiumLabel: 'Premium',
      };
    },
    renderRecentProblems() {},
    createProblemTagsHover() { return null; },
    loadProblem(options) { loads.push({ id: nodes.get('problemId').value, ...options }); },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  const render = () => context.renderProblemSearchResults();
  render();
  return { context, nodes, loads, render, chips: () => nodes.get('problemSearchItems').children };
}
const ids = result => result.chips().map(chip => String(chip.dataset.id));

// A title/ID matches the same problem in its primary category, tags and Company.
test('keyword search renders and counts one result per problem ID across categories and duplicate entries', () => {
  for (const query of ['Sum Root to Leaf Numbers', '129']) {
    const result = search(query);
    assert.deepEqual(ids(result), ['129']);
    assert.equal(result.nodes.get('problemSearchSummary').textContent, '1 result');
    assert.equal(result.nodes.get('problemSearchEmpty').classList.contains('hidden'), true);
    assert.match(result.chips()[0].className, / active$/);
    assert.equal(result.chips()[0].dataset.premium, 'true');
    assert.equal(result.chips()[0].children.find(child => child.className === 'search-result-category').textContent, 'Binary Tree');
  }
});

test('category-only keywords still find a problem whose earlier category did not match', () => {
  for (const [query, expected, category] of [
    ['depth-first', ['129'], 'Depth-first search'],
    ['breadth-first', ['199'], 'Breadth-first search'],
    ['company', ['129', '199'], 'Company'],
  ]) {
    const result = search(query);
    assert.deepEqual(ids(result), expected);
    for (const chip of result.chips()) {
      assert.equal(chip.children.find(child => child.className === 'search-result-category').textContent, category);
    }
  }
});

test('distinct IDs sharing a title remain separate results', () => {
  const result = search('Sum Root to Leaf Numbers', [
    { ...groups[0], problems: [sum, { ...sum, id: 999 }] },
    { ...groups[1], problems: [sum, { ...sum, id: '999' }] },
  ]);
  assert.deepEqual(ids(result), ['129', '999']);
  assert.equal(result.nodes.get('problemSearchSummary').textContent, '2 results');
});

test('search remains accent-insensitive and unique after language/query changes and repeated renders', () => {
  const result = search('  TỔNG  ', groups, 'vi');
  assert.deepEqual(ids(result), ['129']);
  assert.equal(result.nodes.get('problemSearchSummary').textContent, '1 kết quả');
  result.context.lang = 'en';
  result.context.problemSearchQuery = 'medium';
  for (let repeat = 0; repeat < 3; repeat++) {
    result.render();
    assert.deepEqual(ids(result), ['129', '199']);
    assert.equal(result.nodes.get('problemSearchSummary').textContent, '2 results');
  }
  result.context.problemSearchQuery = 'not-a-matching-keyword';
  result.render();
  assert.deepEqual(ids(result), []);
  assert.equal(result.nodes.get('problemSearchEmpty').classList.contains('hidden'), false);
  result.context.problemSearchQuery = ' ';
  result.render();
  assert.deepEqual(ids(result), []);
  assert.equal(result.nodes.get('problemSearchResults').classList.contains('hidden'), true);
  assert.equal(result.nodes.get('catalog').classList.contains('hidden'), false);
});

test('catalog metadata without a valid problem ID does not become a search result', () => {
  const invalid = [{}, { id: null }, { id: 0 }, { id: -1 }, { id: 1.5 }, { id: 'bad' }];
  const result = search('other', [{ key: 'other', vi: 'Khác', en: 'Other', problems: invalid }]);
  assert.deepEqual(ids(result), []);
  assert.equal(result.nodes.get('problemSearchSummary').textContent, '0 results');
});

test('the deduplicated result still loads the selected problem once', () => {
  const result = search('depth-first');
  result.chips()[0].events.click();
  assert.deepEqual(result.loads, [{ id: 129, scrollToEnd: true }]);
});
