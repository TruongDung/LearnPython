const fs = require('node:fs');
const path = require('node:path');

const PUBLIC_DIRECTORY = path.join(__dirname, '..', '..', 'public');

const JAVASCRIPT_ASSETS = Object.freeze([
  'app-core.js',
  'renderers-01.js',
  'renderers-02.js',
  'renderers-03.js',
  'renderers-04.js',
  'renderers-05.js',
  'renderers-06.js',
  'renderer-sparse-vector-1570.js',
  'renderer-regex-match-10.js',
  'renderer-wildcard-match-44.js',
  'renderer-maximal-rectangle-85.js',
  'renderer-max-path-sum-124.js',
  'renderer-palindrome-cuts-132.js',
  'renderer-sliding-maximum-239.js',
  'renderer-median-finder-295.js',
  'renderer-remove-invalid-301.js',
  'script.js',
]);

const STYLESHEET_ASSETS = Object.freeze([
  'style.css',
  'style-01.css',
  'style-02.css',
  'style-03.css',
  'style-04.css',
  'style-05.css',
  'style-06.css',
  'style-07.css',
  'style-08.css',
  'style-09.css',
  'sparse-vector-1570.css',
  'regex-match-10.css',
  'wildcard-match-44.css',
  'maximal-rectangle-85.css',
  'max-path-sum-124.css',
  'palindrome-cuts-132.css',
  'sliding-maximum-239.css',
  'median-finder-295.css',
  'remove-invalid-301.css',
]);

const sourceCache = new Map();

function readSource(name, assets) {
  if (!sourceCache.has(name)) {
    sourceCache.set(name, assets
      .map(asset => fs.readFileSync(path.join(PUBLIC_DIRECTORY, asset), 'utf8'))
      .join(''));
  }
  return sourceCache.get(name);
}

function readFrontendJavaScript() {
  return readSource('javascript', JAVASCRIPT_ASSETS);
}

function readFrontendStyles() {
  return readSource('styles', STYLESHEET_ASSETS);
}

function readFrontendIndex() {
  return readSource('index', ['index.html']);
}

module.exports = {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
};
