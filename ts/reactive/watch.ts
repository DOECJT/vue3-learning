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

export default function watch(source: any, callback: Func) {
  const getter = typeof source === 'function'
    ? source
    : () => traverse(source)
  
  let value: any
  let oldValue: any
  
  const effectFn = effect(
    () => getter(),
    {
      scheduler: () => {
        value = effectFn()
        
        callback(value, oldValue)

        oldValue = value
      },
      lazy: true
    }
  )

  oldValue = effectFn()
}
