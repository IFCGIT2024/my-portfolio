const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
  const listeners = {};
  const doc = { activeElement: null, createElement: tag => new Element(tag), addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener: name => { delete listeners[name]; } };
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.style = { setProperty() {} }; this.classList = { add() {} }; this.events = {}; this.isConnected = true; }
    setAttribute(k, v) { this.attrs[k] = v; }
    appendChild(child) { child.parent = this; this.children.push(child); return child; }
    append(...children) { children.forEach(c => this.appendChild(c)); }
    addEventListener(name, fn) { this.events[name] = fn; }
    remove() { this.isConnected = false; if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); }
    focus() { doc.activeElement = this; }
    click() { this.events.click?.({ target: this }); }
  }
  doc.body = new Element('body');
  const win = {innerWidth: 375, innerHeight: 700};
  vm.runInNewContext(fs.readFileSync('radial.js', 'utf8'), {window: win, document: doc, Number, Math});
  const find = (root, pred) => pred(root) ? root : root.children.map(c => find(c, pred)).find(Boolean);
  return {win, doc, listeners, button: label => find(doc.body, el => el.attrs['aria-label'] === label && el.tag === 'button')};
}

test('object radial exposes nested size and shape actions', () => {
  const {win, button} = setup(); const selected = [];
  win.ObjectMenu.open({x: 0, y: 0, item: {name:'Bed', widthMetres: 1, depthMetres: 2}, onAction: (...args) => selected.push(args)});
  assert.ok(button('Edit points')); button('Size & angle').click();
  assert.ok(button('Width')); assert.ok(button('Depth')); button('Rotate 90°').click();
  assert.equal(selected[0][0], 'rotate');
});

test('wall and node radial dispatch correct actions and Escape only closes menu', () => {
  const {win, button, listeners, doc} = setup(); const selected = [];
  win.WallMenu.open({x: 20,y: 20,interior:true,curved:true,onAction:a => selected.push(a)});
  button('Straighten').click(); assert.deepEqual(selected, ['straighten']);
  win.NodeMenu.open({x:20,y:20,kind:'wall',onDelete:() => selected.push('delete')});
  button('Delete point').click(); assert.deepEqual(selected, ['straighten','delete']);
  win.NodeMenu.open({x:20,y:20,onDelete() {}});
  let stopped = false; listeners.keydown({key:'Escape', preventDefault(){}, stopPropagation(){stopped=true;}});
  assert.equal(stopped,true); assert.equal(doc.body.children.length,0);
});
