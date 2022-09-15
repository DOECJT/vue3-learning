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
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }
  return obj
}

// watch
function traverse(source: Record<keyof any, any>, seen = new Set()) {
  if (typeof source !== 'object' || source === null || seen.has(source)) return

  Object.keys(source).forEach((key) => {
    traverse(source[key], seen)
  })

  return source
}
type WatchCallback = (newValue: any, oldValue: any, onCleanup: (cleanup: Func) => any) => any
type WatchOptions = {
  immediate?: boolean
}
function watch(
  source: Record<keyof any, any> | Func,
  cb: WatchCallback,
  options?: WatchOptions
) {
  let getter: Function
  let newValue: any
  let oldValue: any

  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let cleanup: Func
  const onCleanup = (fn: Func) => {
    cleanup = fn
  }

  const job = () => {
    newValue = effectFn()
    // if (typeof cleanup === 'function') {
    //   cleanup()
    // }
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
      job()
    }
  })

  if (options?.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

// call
const data = {
  firstName: 'jack',
  lastName: 'johns',
  request: '0',
  result: '0'
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

const fullName = computed(() => {
  return `${obj.firstName} ${obj.lastName}`
})
function printFullName() {
  console.log('value', fullName.value)
}
createButton('A request', () => {
  obj.request = 'a'
})
createButton('B request', () => {
  obj.request = 'b'
})
effect(() => {
  // let el = document.createElement('h3')
  // el.innerText = fullName.value
  const container = document.querySelector('#app')
  if (container) {
    container.textContent = `request: ${obj.request}, result: ${obj.result}`
  }
  // console.log('fullName', fullName.value)
})

const wait = (timeout: number, content: any) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(content)
  }, timeout)
})

watch(() => {
  return obj.request
}, async (newValue, oldValue, onCleanup) => {
  // console.log(`newValue: ${newValue}`)
  // console.log(`oldValue: ${oldValue}`)
  let expired = false

  onCleanup(() => {
    expired = true
  })
  
  let data: any
  if (newValue === 'a') {
    data = await wait(1000, 'a result')
  } else if (newValue) {
    data = await wait(100, 'b result')
  }

  if (!expired) {
    obj.result = data
  }
}, {
  // immediate: true
})

export {}
