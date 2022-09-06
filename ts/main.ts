// implement
type Func = (...args: any[]) => any

const bucket = new WeakMap<object, any>()
let activeEffect: any[] = []

function track<O extends object>(target: O, key: keyof O) {
  console.log('track')
  if (activeEffect.length === 0) return
  if (!bucket.get(target)) {
    const m = new Map()
    bucket.set(target, m)
  }
  if (!bucket.get(target).get(key)) {
    const s = new Set()
    bucket.get(target).set(key, s)
  }
  const dep = bucket.get(target).get(key)
  dep.add(activeEffect[0])
  activeEffect[0].deps.push(dep)
}
function trigger<O extends object>(target: O, key: keyof O) {
  console.log('trigger')
  const m = bucket.get(target)
  if (!m) return
  const s = m.get(key) as Set<EffectFn>
  if (!s) return
  const newDep = new Set<EffectFn>()
  s.forEach(fn => {
    if (fn !== activeEffect[0]) {
      newDep.add(fn)
    }
  })
  newDep.forEach((fn) => {
    const scheduler = fn.options?.scheduler
    if (scheduler) {
      scheduler(fn)
    } else {
      fn()
    }
  })
}

function observe(data: object) {
  return new Proxy(data, {
    get: function <O extends object>(target: O, key: keyof O) {
      track(target, key)
      
      return target[key]
    },
    set: function <O extends object>(target: O, key: keyof O, newValue: any) {
      target[key] = newValue
      
      trigger(target, key)
      
      return true
    }
  })
}

function cleanup(effectFn: EffectFn) {
  effectFn.deps.forEach((dep: Set<Func>) => {
    dep.delete(effectFn)
  })
  effectFn.deps.length = 0
}
type EffectFnOptions = {
  scheduler?: (effectFn: EffectFn) => void
  lazy?: boolean
}
type EffectFn = {
  (): void
  deps: Set<Func>[]
  options?: EffectFnOptions
}
function effect(fn: Func, options?: EffectFnOptions) {
  const effectFn: EffectFn = () => {
    activeEffect.unshift(effectFn)
    cleanup(effectFn)
    const ret = fn()
    activeEffect.shift()
    return ret
  }
  effectFn.options = options
  effectFn.deps = []
  if (!effectFn.options?.lazy) {
    effectFn()
  }
  return effectFn
}
function computed(getter: Func) {
  let value: any
  let dirty: boolean = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      trigger(obj, 'value')
    }
  })
  return {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }
}

// call
const data = {
  firstName: 'jack',
  lastName: 'johns'
}
const obj: any = observe(data)
let temp1, temp2
function greet() {
  console.log('greet')
  const root = document.querySelector('#app') as HTMLElement
  if (root) {
    root.innerText = obj.ok ? obj.text : 'not'
  }
}
let jobQueue = new Set<EffectFn>()
let isFlushing: boolean = false
function flushJob() {
  if (isFlushing) return

  isFlushing = true
  Promise
  .resolve()
  .then(() => {
    jobQueue.forEach(fn => fn())
  })
}
function createButton(info: string, handler: Func) {
  const button = document.createElement('button')
  button.innerText = info
  button.addEventListener('click', handler)
  const container = document.querySelector('#controller')
  if (container) {
    container.appendChild(button)
  }
}
function init() {
}

// run
init()
const fullName = computed(() => {
  return `${obj.firstName} ${obj.lastName}`
})
function printFullName() {
  console.log('value', fullName.value)
}
createButton('print full name', () => {
  printFullName()
})
createButton('change firstName', () => {
  obj.firstName = 'tom'
})
effect(() => {
  console.log('fullName', fullName.value)
})
