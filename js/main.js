"use strict";
const bucket = new WeakMap();
let activeEffect = [];
function track(target, key) {
    if (activeEffect.length === 0)
        return;
    if (!bucket.get(target)) {
        const m = new Map();
        bucket.set(target, m);
    }
    if (!bucket.get(target).get(key)) {
        const s = new Set();
        bucket.get(target).set(key, s);
    }
    const dep = bucket.get(target).get(key);
    dep.add(activeEffect[0]);
    activeEffect[0].deps.push(dep);
}
function trigger(target, key) {
    const m = bucket.get(target);
    if (!m)
        return;
    const s = m.get(key);
    if (!s)
        return;
    const newDep = new Set();
    s.forEach(fn => {
        if (fn !== activeEffect[0]) {
            newDep.add(fn);
        }
    });
    newDep.forEach((fn) => {
        var _a;
        const scheduler = (_a = fn.options) === null || _a === void 0 ? void 0 : _a.scheduler;
        if (scheduler) {
            scheduler(fn);
        }
        else {
            fn();
        }
    });
}
function observe(data) {
    return new Proxy(data, {
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
}
function cleanup(effectFn) {
    effectFn.deps.forEach((dep) => {
        dep.delete(effectFn);
    });
    effectFn.deps.length = 0;
}
function effect(fn, options) {
    const effectFn = () => {
        activeEffect.unshift(effectFn);
        cleanup(effectFn);
        fn();
        activeEffect.shift();
    };
    effectFn.options = options;
    effectFn.deps = [];
    effectFn();
}
// call
const data = {
    foo: 0,
};
const obj = observe(data);
let temp1, temp2;
function greet() {
    console.log('greet');
    const root = document.querySelector('#app');
    if (root) {
        root.innerText = obj.ok ? obj.text : 'not';
    }
}
let jobQueue = new Set();
let isFlushing = false;
function flushJob() {
    if (isFlushing)
        return;
    isFlushing = true;
    Promise
        .resolve()
        .then(() => {
        jobQueue.forEach(fn => fn());
    });
}
function init() {
    createButton('foo: any', () => {
        obj.foo = 'xixi';
    });
    createButton('bar: any', () => {
        obj.bar = 'haha';
    });
    effect(() => {
        console.log(obj.foo);
    }, {
        scheduler(fn) {
            jobQueue.add(fn);
            flushJob();
        }
    });
    obj.foo++;
    obj.foo++;
    obj.foo++;
    obj.foo++;
    obj.foo++;
    obj.foo++;
    // console.log('end')
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
