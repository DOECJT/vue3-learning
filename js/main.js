"use strict";
const app = {
    tag: 'div',
    props: {
        onClick() {
            console.log('hello');
        }
    },
    children: 'click me'
};
function render(vnode, root) {
    const el = document.createElement(vnode.tag);
    Object.keys(vnode.props).forEach(key => {
        if (key.startsWith('on')) {
            el.addEventListener(key.substring(2).toLocaleLowerCase(), vnode.props[key]);
        }
    });
    if (typeof vnode.children === 'string') {
        el.innerText = vnode.children;
    }
    else {
        for (let child of vnode.children) {
            render(child, el);
        }
    }
    root.appendChild(el);
}
const root = document.querySelector('#app');
if (root) {
    render(app, root);
}
