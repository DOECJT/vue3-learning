export type Vnode = {
  type: string
  children: Vnode[] | string
}
export type Container = HTMLElement & {
  _vnode: Vnode
}
export type rendererOptions = {
  createElement: (tag: string) => any
  setElementText: (el: any, text: string) => void
  insert: (el: any, parent: any, anchor?: any) => void
}

export function createRenderer(options: rendererOptions) {
  const {
    createElement,
    setElementText,
    insert,
  } = options

  function mountElement(vnode: Vnode, container: Container) {
    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    }
    insert(el, container)
  }
  
  function patch(oldVnode: Vnode, vnode: Vnode, container: Container) {
    if (!oldVnode) {
      mountElement(vnode, container)
    } else {
  
    }
  }
  
  function render(vnode: any, container: Container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        container.innerHTML = ''
      }
    }

    container._vnode = vnode
  }
  
  return {
    render
  }
}
