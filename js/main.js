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
function render(vnode) {
}
