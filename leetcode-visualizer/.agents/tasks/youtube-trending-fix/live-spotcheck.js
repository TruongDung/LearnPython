'use strict';
// Runs every page's default live-editor case through the real TRACER_PY from public/live-editor.js and writes the
// displayed result + trace length per case. Run before and after a live-editor.js change, then diff the two files.
// Usage: node live-spotcheck.js <out.json>
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..', '..', '..');
const source = fs.readFileSync(path.join(root, 'public', 'live-editor.js'), 'utf8');
const tracer = vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
const built = spawnSync(process.execPath, [path.join(root, 'tests', 'build-live-audit-cases.js')], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const { cases } = JSON.parse(built.stdout);
const wheel = path.join(root, 'public', 'vendor', 'sortedcontainers-2.4.0-py2.py3-none-any.whl');
const program = `${tracer}
import json, sys
payload = json.load(sys.stdin)
sys.path.insert(0, payload['wheel'])
out = {}
for case in payload['cases']:
    key = f"{case['id']}:{case.get('block', 1)}"
    if case.get('prepareError'):
        out[key] = {'prepareError': case['prepareError']}
        continue
    try:
        run = __viz_run_trace(case['code'], case['method'], case.get('args', []), case.get('design'), case.get('oracle'))
        out[key] = {'result': run['result'], 'steps': len(run['trace'])}
    except BaseException as error:
        out[key] = {'error': type(error).__name__ + ': ' + str(error)[:200]}
print(json.dumps(out, sort_keys=True, default=repr))
`;
const localPython = path.join(root, '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
const run = spawnSync(python, ['-c', program], { input: JSON.stringify({ wheel, cases }), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
if (run.status !== 0) {
  process.stderr.write(run.stderr);
  process.exit(1);
}
fs.writeFileSync(process.argv[2], run.stdout);
console.log(`${Object.keys(JSON.parse(run.stdout)).length} cases written to ${process.argv[2]}`);
