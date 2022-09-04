type Component = {
  render(): VNode
}

type ElementVNode = {
  tag: string
  props: Record<string, any>
  children: VNode[] | string
}
type ComponentVNode = {
  tag: Component
}
type VNode = ElementVNode | ComponentVNode

const app: VNode = {
  tag: 'div',
  props: {
    onClick() {
      console.log('hello')
    }
  },
  children: 'click me'
}
const MyComponent: Component = {
  render() {
    return {
      tag: 'div',
      props: {
        onClick() {
          console.log('I am a component.')
        }
      },
      children: 'component'
    }
  }
}
const MyComponentVNode: ComponentVNode = {
  tag: MyComponent
}

function mountElement(vnode: ElementVNode, root: Element) {
  const el = document.createElement(vnode.tag)
  
  Object.keys(vnode.props).forEach(key => {
    if (key.startsWith('on')) {
      el.addEventListener(key.substring(2).toLocaleLowerCase(), vnode.props[key])
    }
  })
  if (typeof vnode.children === 'string') {
    el.innerText = vnode.children
  } else {
    for (let child of vnode.children) {
      render(child, el)
    }
  }

  root.appendChild(el)
}

function mountComponent(vnode: ComponentVNode, root: Element) {
  const node = vnode.tag.render()
  render(node, root)
}

function render(vnode: VNode, root: Element) {
  if (typeof vnode.tag === 'string') {
    mountElement(vnode as ElementVNode, root)
  } else if (typeof vnode.tag.render === 'function') {
    mountComponent(vnode as ComponentVNode, root)
  }
}

const root = document.querySelector('#app')
if (root) {
  render(MyComponentVNode, root)
}
