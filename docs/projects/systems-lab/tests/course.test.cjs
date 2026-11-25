const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');

const dir = path.resolve(__dirname, '..');
const read = file => readFileSync(path.resolve(dir, file), 'utf8');
const course = runInNewContext(read('course.js') + '\nsystemsCourse');
const ids = new Set(course.lessons.map(lesson => lesson.id));
const assembly = JSON.parse(read('../assembly-lab/data/lessons.json'));
const assemblyIds = new Set(assembly.lessons.flatMap(chapter => chapter.steps.map(step => step.id)));

test('every lesson has a unique route, a worked trace and a changed example', () => {
  assert.equal(ids.size, course.lessons.length);
  for (const lesson of course.lessons) {
    assert.ok(course.chapters[lesson.chapter]);
    assert.match(lesson.id, /^[a-z][a-z0-9-]*$/);
    assert.ok(lesson.example && lesson.steps.length && lesson.reason);
    assert.equal(new Set(lesson.options).size, lesson.options.length);
    assert.ok(lesson.options[lesson.answer]);
    for (const link of lesson.assembly || []) assert.ok(assemblyIds.has(link.id), link.id);
  }
});

test('each master skill has recall criteria and a route back to a lesson', () => {
  assert.equal(course.skills.length, 38);
  assert.equal(new Set(course.skills.map(s => s.title)).size, 38);
  for (const skill of course.skills) {
    assert.ok(skill.prompt && skill.model && skill.lessons.length);
    for (const id of skill.lessons) assert.ok(ids.has(id), id);
  }
});

test('every workbook exam item has an answer, explanation and remedial lesson', () => {
  assert.equal(course.exam.length, 20);
  for (const item of course.exam) {
    assert.equal(item.options.length, 4);
    assert.ok(item.options[item.answer] && item.reason && item.variation);
    assert.ok(ids.has(item.lesson), item.lesson);
  }
});
