import { createRenderer, shouldSetAsProps, type rendererOptions } from './index.js'
import type { Func } from '../base.js'

// render
const browserOptions: rendererOptions = {
  createElement(tag: string | symbol) {
    return document.createElement(tag as string)
  },
  setElementText(el: HTMLElement, text: string) {
    el.innerText = text
  },
  insert(el: HTMLElement, parent: HTMLElement, anchor: HTMLElement | null = null) {
    parent.insertBefore(el, anchor)
  },
  patchProps(el: any, key: string, oldValue: any, value: any) {
    if (key.startsWith('on')) {
      const type = key.slice(2).toLowerCase()
      const invokers = el._vei || (el._vei = {})
      let invoker = invokers[type]
      if (value) {
        if (!invoker) {
          invoker = el._vei[type] = (e: Event) => {
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach((fn: Func) => fn(e))
            } else {
              invoker.value(e)
            }
          }
          invoker.value = value
          el.addEventListener(type, invoker)
        } else {
          invoker.value = value
        }
      } else if (invoker) {
        el.removeEventListener(type, invoker)
      }
    } else if (key === 'class') {
      el.className = value || ''
    } else if (shouldSetAsProps(el, key)) {
      const type = typeof el[key]
      if (type === 'boolean' && value === '') {
        el[key] = true
      } else {
        el[key] = value
      }
    } else {
      el.setAttribute(key, value)
    }
  },
  createText(text) {
    return document.createTextNode(text)
  },
  createComment(comment) {
    return document.createComment(comment)
  },
  setText(el, text) {
    el.nodeValue = text
  }
}
export default createRenderer(browserOptions).render
