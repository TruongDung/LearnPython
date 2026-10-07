const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

const html = readFrontendIndex();
const script = readFrontendJavaScript();
const css = readFrontendStyles();

test('category tag combobox sits beside keyword search and exposes listbox semantics', () => {
  const toolsStart = html.indexOf('<div class="catalog-search-tools">');
  const toolsEnd = html.indexOf('</section>', toolsStart);
  const tools = html.slice(toolsStart, toolsEnd);

  assert.match(tools, /id="problemKeyword"[\s\S]*id="categoryTagInput"/);
  assert.match(tools, /id="categoryTagInput"[\s\S]*role="combobox"[\s\S]*aria-controls="categoryTagList"/);
  assert.match(tools, /id="categoryTagList"[^>]*role="listbox"/);
});

test('category picker lists and filters every catalog group in both languages', () => {
  assert.match(script, /function categoryTagMatches\(query\)[\s\S]*if \(!normalizedQuery\) return catalogData;/);
  assert.match(script, /group\.key,[\s\S]*group\.vi,[\s\S]*group\.en/);
  assert.match(script, /option\.setAttribute\("role", "option"\)/);
  assert.match(script, /categoryTagInput"\)\.addEventListener\("input"/);
});

test('selecting or toggling a category uses exclusive accordion behavior', () => {
  assert.match(script, /function openCatalogGroupExclusively\(groupKey/);
  assert.match(script, /querySelectorAll\("#catalog \.cat-group"\)\.forEach/);
  assert.match(script, /groupEl\.dataset\.groupKey === groupKey/);
  assert.match(script, /function selectCategoryTag\(groupKey\)[\s\S]*openCatalogGroupExclusively\(group\.key, \{ scroll: true \}\)/);
  assert.match(script, /toggleBtn\.addEventListener\("click"[\s\S]*openCatalogGroupExclusively/);
});

test('category combobox supports keyboard navigation and responsive layout', () => {
  assert.match(script, /\["ArrowDown", "ArrowUp", "Enter"\]/);
  assert.match(script, /event\.key === "Escape"/);
  assert.match(css, /\.catalog-search-tools \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.catalog-search-tools \{[\s\S]*grid-template-columns: 1fr/);
});
