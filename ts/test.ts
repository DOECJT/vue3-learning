import { reactive, effect, bucket } from './reactive/index.js'
import computed from './reactive/computed.js'
import watch from './reactive/watch.js'
import { timeout } from './utils.js'
import {
  createRenderer,
  type Vnode,
  type Container,
  type rendererOptions,
  shouldSetAsProps,
  Text,
  Comment,
  Fragment,
} from './render/index.js'
import render from './render/render.js'

const container = document.querySelector('#app')

// handle data
const data = reactive({
  greet: 'Hello, world!',
})
const run = async () => {
  await timeout(0)

  postRendering()
}
const postRendering = async () => {
  await timeout(1000)
  data.greet = 'Hello, vue!'
}
run()

function createVnode() {
  // const vnode: Vnode = {
  //   type: 'div',
  //   props: {
  //     id: 'foo',
  //   },
  //   children: [
  //     {
  //       type: 'h3',
  //       props: {
  //         class: 'dark',
  //         style: 'color: #1578ff;'
  //       },
  //       children: [
  //         {
  //           type: Text,
  //           children: 'this is text content'
  //         },
  //         {
  //           type: Comment,
  //           children: 'this is comment content'
  //         }
  //       ]
  //     },
  //     {
  //       type: 'button',
  //       props: {
  //         onClick: [
  //           () => {
  //             console.log('click 1')
  //           },
  //           () => {
  //             console.log('click 2')
  //           }
  //         ],
  //         onmouseenter: () => {
  //           console.log('mouseenter')
  //         }
  //       },
  //       children: 'click'
  //     }
  //   ]
  // }
  const vnode: Vnode = {
    type: Fragment,
    children: [
      { type: 'li', children: 'item 1' },
      { type: 'li', children: 'item 2' },
      { type: 'li', children: 'item 3' },
    ]
  }

  return vnode
}


effect(() => {
  const vnode = createVnode()
  render(vnode, document.querySelector('#app') as Container)
})

export {}
