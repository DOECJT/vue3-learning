import { Func } from '../base.js'
import { track, effect, trigger } from './index.js'

export default function computed(getter: Func) {
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      dirty = true
      trigger(data, value)
    }
  })

  let dirty = true
  let value: any
  
  const data = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
        track(data, value)
      }
      
      return value
    }
  }

  return data
}
