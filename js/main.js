"use strict";
const bucket = new WeakMap();
let activeEffect;
const data = {
    text: 'hello world'
};
function track(target, key) {
    if (!activeEffect)
        return;
    if (!bucket.get(target)) {
        const m = new Map();
        bucket.set(target, m);
    }
    if (!bucket.get(target).get(key)) {
        const s = new Set();
        bucket.get(target).set(key, s);
    }
    bucket.get(target).get(key).add(activeEffect);
}
function trigger(target, key) {
    const m = bucket.get(target);
    if (!m)
        return;
    const s = m.get(key);
    if (!s)
        return;
    s.forEach((fn) => fn());
}
const obj = new Proxy(data, {
    get: function (target, key) {
        track(target, key);
        return target[key];
    },
    set: function (target, key, newValue) {
        target[key] = newValue;
        trigger(target, key);
        return true;
    }
});
function effect(fn) {
    activeEffect = fn;
    fn();
}
function greet() {
    console.log('greet');
    const root = document.querySelector('#app');
    if (root) {
        root.innerText = obj.text;
    }
}
function init() {
    createButton('text: vue3', () => {
        obj.text = 'hello vue3';
    });
    createButton('noExist: xixi', () => {
        obj.noExist = 'xixi';
    });
    effect(greet);
}
function createButton(info, handler) {
    const button = document.createElement('button');
    button.innerText = info;
    button.addEventListener('click', handler);
    const container = document.querySelector('#controller');
    if (container) {
        container.appendChild(button);
    }
}
init();
