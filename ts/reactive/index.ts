import type { Func } from '../base'

type R = Record<PropertyKey, any>
type EffectFnOptions = {
  scheduler?: (effectFn?: EffectFn) => any
  lazy?: boolean
}
type EffectFn = {
  (...args: any[]): any
  deps: Array<List>
  options?: EffectFnOptions
}
type Store = Map<PropertyKey, List>
type List = Set<EffectFn>

const bucket = new WeakMap<Record<PropertyKey, any>, Store>()
let effectFnStack: EffectFn[] = []

export function track(target: R, key: PropertyKey) {
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

export function trigger(target: R, key: PropertyKey) {
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
    const scheduler = effectFn.options?.scheduler
    if (scheduler) {
      scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

export function reactive(data: Record<PropertyKey, any>) {
  for (const key in data) {
    if (typeof data[key] === 'object' && data[key] !== null) {
      data[key] = reactive(data[key])
    }
  }
  
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
export function effect(fn: Func, options?: EffectFnOptions) {
  const effectFn: EffectFn = () => {
    cleanup(effectFn)
    
    effectFnStack.push(effectFn)
    const ret = fn()
    effectFnStack.pop()
    return ret
  }
  effectFn.deps = []
  options && (effectFn.options = options)

  if (!options?.lazy) {
    effectFn()
  }

  return effectFn
}
