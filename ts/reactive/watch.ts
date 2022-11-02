import { effect } from './index.js'
import { Func } from '../base.js'

function traverse(value: any, seen = new Set()) {
  if (
    typeof value !== 'object' ||
    value === null ||
    seen.has(value)
  ) return

  seen.add(value)
  for (const key in value) {
    traverse(value[key], seen)
  }
}

type WatchOptions = {
  immediate?: boolean
  flush?: 'pre' | 'post'
}
export default function watch(source: any, callback: Func, options?: WatchOptions) {
  const getter = typeof source === 'function'
    ? source
    : () => traverse(source)
  
  let value: any
  let oldValue: any
  
  let cleanup: Func
  const onCleanup = (cleanupFn: Func) => {
    cleanup = cleanupFn
  }

  const job = () => {
    value = effectFn()
    if (typeof cleanup === 'function') {
      cleanup()
    }
    callback(value, oldValue, onCleanup)
    oldValue = value
  }

  const effectFn = effect(
    () => getter(),
    {
      scheduler: () => {
        if (options?.flush === 'post') {
          Promise.resolve().then(() => {
            job()
          })
        } else {
          job()
        }
      },
      lazy: true
    }
  )

  if (options?.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}
