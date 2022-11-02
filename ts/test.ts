import { reactive, effect, bucket } from './reactive/index.js'
import computed from './reactive/computed.js'
import watch from './reactive/watch.js'
import { timeout } from './utils.js'
import { createRenderer, type Vnode, type Container, type rendererOptions } from './render/index.js'

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

// render
const browserOptions = {
  createElement(tag: string) {
    return document.createElement(tag)
  },
  setElementText(el: HTMLElement, text: string) {
    el.innerText = text
  },
  insert(el: HTMLElement, parent: HTMLElement, anchor: HTMLElement | null = null) {
    parent.insertBefore(el, anchor)
  },
}
const renderer = createRenderer(browserOptions)

const vnode: Vnode = {
  type: 'h3',
  children: data.greet
}

effect(() => {
  renderer.render(vnode, document.querySelector('#app') as Container)
})

export {}
