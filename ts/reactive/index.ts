import type { Func } from '../base'

type R = Record<PropertyKey, any>
type EffectFn = {
  (...args: any[]): any
  deps: Array<List>
}
type Store = Map<PropertyKey, List>
type List = Set<EffectFn>

const bucket = new WeakMap<Record<PropertyKey, any>, Store>()
let effectFnStack: EffectFn[] = []

function track(target: R, key: PropertyKey) {
  if (!effectFnStack[effectFnStack.length - 1]) return
  
  let store = bucket.get(target)
  if (!store) {
    bucket.set(target, (store = new Map()))
  }
  let list = store.get(key)
  if (!list) {
    store.set(key, (list = new Set()))
  }
  list.add(effectFnStack[effectFnStack.length - 1])

  // collect deps
  effectFnStack[effectFnStack.length - 1].deps.push(list)
}

function trigger(target: R, key: PropertyKey) {
  const store = bucket.get(target)
  if (!store) return
  const list = store.get(key)
  if (!list) return

  const runList: List = new Set()
  list.forEach(effectFn => {
    runList.add(effectFn)
  })
  runList.forEach(effectFn => {
    if (effectFn === effectFnStack[effectFnStack.length - 1]) return
    effectFn()
  })
}

export function reactive(data: Record<PropertyKey, any>) {
  return new Proxy(data, {
    get: (target, key) => {
      track(target, key)
      
      return Reflect.get(target, key)
    },
    set: (target, key, value) => {
      const ret = Reflect.set(target, key, value)

      trigger(target, key)

      return ret
    }
  })
}

// handle effect
function cleanup(effectFn: EffectFn) {
  effectFn.deps.forEach(dep => {
    dep.delete(effectFn)
  })
}
export function effect(fn: Func) {
  const effectFn: EffectFn = () => {
    cleanup(effectFn)
    
    effectFnStack.push(effectFn)
    fn()
    effectFnStack.pop()
  }
  effectFn.deps = []

  effectFn()
}
