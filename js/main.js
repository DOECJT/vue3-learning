"use strict";
const bucket = new WeakMap();
let activeEffect = [];
function track(target, key) {
    console.log('track');
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
    console.log('trigger');
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
    var _a;
    const effectFn = () => {
        activeEffect.unshift(effectFn);
        cleanup(effectFn);
        const ret = fn();
        activeEffect.shift();
        return ret;
    };
    effectFn.options = options;
    effectFn.deps = [];
    if (!((_a = effectFn.options) === null || _a === void 0 ? void 0 : _a.lazy)) {
        effectFn();
    }
    return effectFn;
}
function computed(getter) {
    let value;
    let dirty = true;
    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            dirty = true;
            trigger(obj, 'value');
        }
    });
    return {
        get value() {
            if (dirty) {
                value = effectFn();
                dirty = false;
            }
            track(obj, 'value');
            return value;
        }
    };
}
// call
const data = {
    firstName: 'jack',
    lastName: 'johns'
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
function createButton(info, handler) {
    const button = document.createElement('button');
    button.innerText = info;
    button.addEventListener('click', handler);
    const container = document.querySelector('#controller');
    if (container) {
        container.appendChild(button);
    }
}
function init() {
}
// run
init();
const fullName = computed(() => {
    return `${obj.firstName} ${obj.lastName}`;
});
function printFullName() {
    console.log('value', fullName.value);
}
createButton('print full name', () => {
    printFullName();
});
createButton('change firstName', () => {
    obj.firstName = 'tom';
});
effect(() => {
    console.log('fullName', fullName.value);
});
