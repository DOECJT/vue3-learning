import { Func } from '../base.js'

export type Vnode = {
  type: string
  props?: Record<PropertyKey, any>
  children: Vnode[] | string
  el?: HTMLElement
}
export type Container = HTMLElement & {
  _vnode: Vnode
}
export type rendererOptions = {
  createElement: (tag: string) => any
  setElementText: (el: any, text: string) => void
  insert: (el: any, parent: any, anchor?: any) => void
  patchProps: Func
}

export function shouldSetAsProps(el: HTMLElement, key: string) {
  if (el.tagName === 'INPUT' && key === 'form') return false

  return key in el
}
export function createRenderer(options: rendererOptions) {
  const {
    createElement,
    setElementText,
    insert,
    patchProps,
  } = options

  function mountElement(vnode: Vnode, container: Container) {
    // create
    const el = vnode.el = createElement(vnode.type)
    // children
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null, child, el)
      })
    }
    // props
    if (vnode.props) {
      const props = vnode.props
      for (const key in props) {
        const value = props[key]
        patchProps(el, key, null, value)
      }
    }
    // insert
    insert(el, container)
  }

  function patchChildren(oldVnode: Vnode, vnode: Vnode, el: HTMLElement) {
    if (typeof vnode.children === 'string') {
      if (Array.isArray(oldVnode.children)) {
        oldVnode.children.forEach(child => unmount(child))
      } 
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      if (Array.isArray(oldVnode.children)) {
        // diff
        oldVnode.children.forEach(child => unmount(child))
        vnode.children.forEach(child => patch(null, child, el as Container))
      } else {
        setElementText(el, '')
        vnode.children.forEach(child => patch(null, child, el as Container))
      }
    } else {
      if (Array.isArray(oldVnode.children)) {
        oldVnode.children.forEach(child => unmount(child))
      } else if (typeof oldVnode.children === 'string') {
        setElementText(el, '')
      }
    }
  }
  function patchElement(oldVnode: Vnode, vnode: Vnode) {
    const el = vnode.el = oldVnode.el as HTMLElement
    const oldProps = oldVnode.props as Record<string, any>
    const props = vnode.props as Record<string, any>
    // update props
    for (const key in props) {
      patchProps(el, key, oldProps[key], props[key])
    }
    for (const key in oldProps) {
      if (!(key in props)) {
        patchProps(el, key, oldProps[key], null)
      }
    }
    // update children
    patchChildren(oldVnode, vnode, el)
  }
  
  function patch(oldVnode: Vnode | null, vnode: Vnode, container: Container) {
    if (oldVnode && vnode.type === oldVnode.type) {
      unmount(oldVnode)
      oldVnode = null
    }

    const { type } = vnode
    if (typeof type === 'string') {
      // tag
      if (!oldVnode) {
        mountElement(vnode, container)
      } else {
        patchElement(oldVnode, vnode)
      }
    } else if (typeof type === 'object') {
      // component
    } else if (type === '') {
      // others
    }
  }
  
  function unmount(vnode: Vnode) {
    const el = vnode.el
    const parent = el?.parentNode
    if (parent) {
      parent.removeChild(el)
    }
  }
  function render(vnode: any, container: Container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      const _vnode = container._vnode
      if (_vnode) {
        unmount(_vnode)
      }
    }

    container._vnode = vnode
  }
  
  return {
    render
  }
}
