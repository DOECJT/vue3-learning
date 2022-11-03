import { reactive, effect, bucket } from './reactive/index.js'
import computed from './reactive/computed.js'
import watch from './reactive/watch.js'
import { timeout } from './utils.js'
import { createRenderer, type Vnode, type Container, type rendererOptions, shouldSetAsProps } from './render/index.js'
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

const vnode: Vnode = {
  type: 'div',
  props: {
    id: 'foo',
  },
  children: [
    {
      type: 'h3',
      props: {
        class: 'dark',
        style: 'color: #1578ff;'
      },
      children: 'Hello world!'
    },
    {
      type: 'button',
      props: {
        onClick: [
          () => {
            console.log('click 1')
          },
          () => {
            console.log('click 2')
          }
        ],
        onmouseenter: () => {
          console.log('mouseenter')
        }
      },
      children: 'click'
    }
  ]
}

effect(() => {
  render(vnode, document.querySelector('#app') as Container)
})

export {}
