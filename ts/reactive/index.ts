import type { Func } from '../base'

type R = Record<PropertyKey, any>
type Effect = Func
type Store = Map<PropertyKey, List>
type List = Set<Effect>

const bucket = new WeakMap<Record<PropertyKey, any>, Store>()
let activeEffect: Func | undefined

function track(target: R, key: PropertyKey) {
  if (!activeEffect) return
  
  let store = bucket.get(target)
  if (!store) {
    bucket.set(target, (store = new Map()))
  }
  let list = store.get(key)
  if (!list) {
    store.set(key, (list = new Set()))
  }
  list.add(activeEffect)
}

function trigger(target: R, key: PropertyKey) {
  const store = bucket.get(target)
  if (!store) return
  const list = store.get(key)
  if (!list) return
  list.forEach(fn => {
    fn()
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
export function effect(fn: Func) {
  activeEffect = fn

  fn()
}
