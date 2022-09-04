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
const MyComponent = {
    render() {
        return {
            tag: 'div',
            props: {
                onClick() {
                    console.log('I am a component.');
                }
            },
            children: 'component'
        };
    }
};
const MyComponentVNode = {
    tag: MyComponent
};
function mountElement(vnode, root) {
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
function mountComponent(vnode, root) {
    const node = vnode.tag.render();
    render(node, root);
}
function render(vnode, root) {
    if (typeof vnode.tag === 'string') {
        mountElement(vnode, root);
    }
    else if (typeof vnode.tag.render === 'function') {
        mountComponent(vnode, root);
    }
}
const root = document.querySelector('#app');
if (root) {
    render(MyComponentVNode, root);
}
