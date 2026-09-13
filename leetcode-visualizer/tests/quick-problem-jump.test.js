const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');

const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');

test('floating tag navigation has an accessible problem textbox and mobile submit button', () => {
  const formStart = html.indexOf('<form id="quickProblemForm"');
  const formEnd = html.indexOf('</form>', formStart);
  const form = html.slice(formStart, formEnd);
  assert.match(form, /aria-label="Jump to LeetCode problem"[\s\S]*<input id="quickProblemId" type="number"/);
  assert.match(form, /<button id="quickProblemGoBtn" type="submit"[\s\S]*>Go<\/button>/);
  assert.doesNotMatch(form, /<label|catalog-quick-row|quickProblemError|aria-hidden="true">#/);
  assert.ok(html.indexOf('id="quickProblemForm"') < html.indexOf('id="backToTopBtn"'));
});

test('quick form delegates to the same loadProblem flow as the top controls', () => {
  assert.match(script, /\$\("quickProblemForm"\)\.addEventListener\("submit", async \(event\) => \{/);
  assert.match(script, /\$\("problemId"\)\.value = input\.value\.trim\(\);/);
  assert.match(script, /await loadProblem\(\{ scrollToEnd: true \}\)/);
  assert.match(script, /input\.setAttribute\("aria-invalid", "true"\)/);
  assert.match(script, /input\.disabled = true;[\s\S]*input\.disabled = false;/);
  assert.match(script, /submitButton\.disabled = true;[\s\S]*submitButton\.disabled = false;/);
  assert.match(script, /jumpNav\.querySelector\("\.catalog-jump-btn"\)/);
});

test('quick form is fixed with the tag shortcuts and remains responsive', () => {
  assert.match(css, /\.catalog-jump-nav \{[\s\S]*position: fixed;[\s\S]*justify-items: end;/);
  assert.match(css, /\.catalog-quick-jump \{[\s\S]*position: sticky;[\s\S]*width: 112px;/);
  assert.match(css, /\.catalog-quick-jump input \{[\s\S]*height: 34px;/);
  assert.match(css, /\.catalog-quick-jump button \{[\s\S]*display: none;/);
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\), \(max-width: 640px\)[\s\S]*\.catalog-quick-jump button \{ display: grid; \}/);
  assert.match(css, /@media \(max-width: 480px\)[\s\S]*\.catalog-quick-jump \{ width: 170px;/);
});
