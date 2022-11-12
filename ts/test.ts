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
  bol: true
})
const run = async () => {
  await timeout(0)

  postRendering()
}
const postRendering = async () => {
  await timeout(1000)
  data.bol = false
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
    children: data.bol
      ? [
        { type: 'li', children: 'item 1', key: 1 },
        { type: 'li', children: 'item 3', key: 3 },
        { type: 'li', children: 'item 2', key: 2 },
      ]
      : [
        { type: 'li', children: 'item 3', key: 3 },
        { type: 'li', children: 'item 1', key: 1 },
        // { type: 'li', children: 'item 4', key: 4 },
        // { type: 'li', children: 'item 5', key: 5 },
        { type: 'li', children: 'item 2', key: 2 },
      ]
  }

  return vnode
}


effect(() => {
  const vnode = createVnode()
  render(vnode, document.querySelector('#app') as Container)
})

export {}
