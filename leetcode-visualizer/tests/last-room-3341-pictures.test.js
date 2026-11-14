'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[3341];
const cases = [
  [[0, 4], [4, 4]], [[0, 0, 0], [0, 0, 0]], [[9, 0], [0, 0]],
  [[0, 0, 0], [9, 9, 0], [0, 0, 0]],
  [[0, 1000000000], [1000000000, 0]],
  [[0, 2, 7], [6, 3, 1], [0, 5, 8]],
];
function renderer() {
  const host = { innerHTML: '', dataset: {}, clientWidth: 560 };
  const ctx = { $: () => host, lang: 'vi' };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-last-room-3341.js'), 'utf8'), ctx);
  return { ctx, host };
}

test('3341 pictures preserve every Python snapshot and exact room/heap values in both languages', () => {
  const { ctx, host } = renderer();
  for (const grid of cases) {
    const result = problem.builder(grid), before = JSON.stringify(result);
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      for (const step of result.steps) {
        const v = step.timeRoomView;
        ctx.renderLastRoom3341Pictures(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        assert.equal((host.innerHTML.match(/data-room="/g) || []).length, grid.length * grid[0].length);
        const rooms = [...host.innerHTML.matchAll(/data-room="(\d+),(\d+)" data-gate="(\d+)" data-dist="([^"]+)"/g)];
        for (const [, r, c, gate, distance] of rooms) {
          assert.equal(Number(gate), grid[r][c]);
          assert.equal(distance, String(v.dist?.[r]?.[c] ?? '…'));
        }
        const heap = [...host.innerHTML.matchAll(/data-heap-entry="([^"]+)"/g)].map(m => m[1].split(',').map(Number));
        assert.deepEqual(heap, v.final ? [] : v.heap || []);
      }
    }
    assert.equal(JSON.stringify(result), before);
    ctx.renderLastRoom3341Pictures(result.steps[0]);
    const first = host.innerHTML;
    ctx.renderLastRoom3341Pictures(result.steps.at(-1));
    ctx.renderLastRoom3341Pictures(result.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test('3341 departure and arrival remain separate: wait in the source room, then move for one second', () => {
  const { ctx } = renderer();
  const result = problem.builder(cases[0]);
  const view = result.steps.find(s => s.timeRoomView.event === 'candidate').timeRoomView;
  const scene = ctx.room3341Scene(view);
  assert.equal(scene.clock, 0);
  assert.deepEqual(Array.from(scene.position), [0, 0]);
  assert.equal(scene.transition.wait, 4);
  assert.equal(scene.transition.depart, 4);
  assert.equal(scene.transition.arrival, 5);
  assert.equal(scene.transition.duration, 1);
  const atMax = result.steps.find(s => s.timeRoomView.event === 'depart').timeRoomView;
  assert.equal(ctx.room3341Scene(atMax).transition.arrival, null);
  const beforeMax = result.steps.find(s => s.timeRoomView.event === 'duration').timeRoomView;
  assert.equal(ctx.room3341Scene(beforeMax).transition.wait, null);
});

test('3341 all selectable solution legs replay source waiting, departure and destination arrival', () => {
  const { ctx, host } = renderer();
  for (const grid of cases) {
    const final = problem.builder(grid).steps.at(-1), v = final.timeRoomView;
    ctx.renderLastRoom3341Pictures(final);
    for (const [i, leg] of v.winner.legs.entries()) {
      assert.equal(leg.depart, Math.max(leg.start, grid[leg.to[0]][leg.to[1]]));
      assert.equal(leg.arrival, leg.depart + 1);
      for (const stage of ['wait', 'move', 'arrive']) {
        const scene = ctx.room3341Scene(v, i, stage);
        const position = stage === 'arrive' ? leg.to : leg.from;
        assert.deepEqual(Array.from(scene.position), position);
        assert.equal(scene.clock, stage === 'wait' ? leg.start : stage === 'move' ? leg.depart : leg.arrival);
        host.dataset.rr3341SelectedLeg = String(i); host.dataset.rr3341SelectedStage = stage;
        ctx.renderLastRoom3341Pictures(final);
        assert.match(host.innerHTML, new RegExp(`data-display-time="${scene.clock}"`));
        assert.match(host.innerHTML, new RegExp(`data-wait="${leg.wait}" data-depart="${leg.depart}" data-arrival="${leg.arrival}"`));
        assert.match(host.innerHTML, new RegExp(`data-time-answer="${v.answer}"`));
      }
    }
  }
});

test('3341 gates unlock at departure time, while the occupied starting room ignores its input gate', () => {
  const { ctx } = renderer();
  const v = problem.builder(cases[0]).steps.at(-1).timeRoomView;
  const waiting = ctx.room3341Grid(v, ctx.room3341Scene(v, 0, 'wait'));
  const moving = ctx.room3341Grid(v, ctx.room3341Scene(v, 0, 'move'));
  assert.match(waiting, /data-room="0,1" data-gate="4" data-dist="5" data-open="false"/);
  assert.match(moving, /data-room="0,1" data-gate="4" data-dist="5" data-open="true"/);
  const start = problem.builder(cases[2]).steps[0].timeRoomView;
  assert.match(ctx.room3341Grid(start, ctx.room3341Scene(start)), /data-room="0,0" data-gate="9" data-dist="…" data-open="true"/);
});

test('3341 large waits use bounded illustrations and preserve the billion-second result', () => {
  const { ctx, host } = renderer();
  const final = problem.builder(cases[4]).steps.at(-1);
  ctx.renderLastRoom3341Pictures(final);
  assert.match(host.innerHTML, /data-wait="1000000000"/);
  assert.match(host.innerHTML, /data-time-answer="1000000002"/);
  assert.match(host.innerHTML, /⋯/);
  assert.ok(host.innerHTML.length < 16000);
});

test('3341 uses its dedicated assets and renderer before the shared time-room fallback', () => {
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  assert.match(html, /last-room-3341\.css\?v=door-pictures-v1/);
  assert.match(html, /renderer-last-room-3341\.js\?v=door-pictures-v1/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ''), /renderer-last-room-3341\.js/);
  assert.ok(script.indexOf('renderLastRoom3341Pictures(step)') < script.indexOf('renderTimeRoomPictures(step)'));
});
