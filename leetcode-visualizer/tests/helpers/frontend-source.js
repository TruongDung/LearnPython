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
