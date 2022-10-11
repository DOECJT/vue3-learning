import { effect, ref } from '../lib/reactivity.esm-browser.js'

const container = document.querySelector('#app')

const greet = ref('hello, vue')

function createRenderer(options: RendererOptions) {
  const {
    createElement,
    setElementText,
    insert
  } = options
  
  // mount new vnode to container
  function mountElement(vnode: Vnode, container: HTMLElement) {
    const el = createElement(vnode.type)

    if (vnode.props) {
      Object.keys(vnode.props).forEach(prop => {
        // el.setAttribute(prop, vnode.props[prop])
        el[prop] = vnode.props[prop]
        el.setAttribute('data-xixi', true)
      })
    }
    
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null, child, el)
      })
    }
    insert(el, container)
  }

  // mount or patch
  function patch(oldVnode: Vnode | null, newVnode: Vnode, container: HTMLElement) {
    if (!oldVnode) {
      mountElement(newVnode, container)
    } else {

    }
  }

  function render(vnode: Vnode, container: HTMLElement) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      container.innerHTML = ''
    }
    container._vnode = vnode
  }

  return {
    render
  }
}

type Vnode = {
  type: string
  props?: Record<PropertyKey, any>
  children: Vnode[] | string
}
const vnode: Vnode = {
  type: 'div',
  props: {
    id: 'foo',
  },
  children: [
    {
      type: 'h3',
      children: 'Hello, world!'
    }
  ]
}

type RendererOptions = {
  createElement: (tag: string) => any,
  setElementText: (el: any, text: string) => void,
  insert: (el: any, parent: any, anchor?: any) => void,
}

const browserOptions: RendererOptions = {
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  }
}

const consoleOptions: RendererOptions = {
  createElement(tag) {
    console.log(`创建元素 ${tag}`)
    return { tag }
  },
  setElementText(el, text) {
    console.log(`设置 ${JSON.stringify(el)} 的文本内容: ${text}`)
    el.text = text
  },
  insert(el, parent, anchor) {
    console.log(`将 ${JSON.stringify(el)} 添加到 ${JSON.stringify(parent)} 下`)
    parent.children = el
  },
}

const renderer = createRenderer(browserOptions)

renderer.render(vnode, container)
