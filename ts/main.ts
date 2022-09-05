// implement
type Func = (...args: any[]) => any

const bucket = new WeakMap<object, any>()
let activeEffect: any[] = []

function track<O extends object>(target: O, key: keyof O) {
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
    fn()
    activeEffect.shift()
  }
  effectFn.options = options
  effectFn.deps = []
  effectFn()
}

// call
const data = {
  foo: 0,
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
function init() {
  createButton('foo: any', () => {
    obj.foo = 'xixi'
  })
  createButton('bar: any', () => {
    obj.bar = 'haha'
  })

  effect(() => {
    console.log(obj.foo)
  }, {
    scheduler(fn) {
      jobQueue.add(fn)
      flushJob()
    }
  })
  obj.foo++
  obj.foo++
  obj.foo++
  obj.foo++
  obj.foo++
  obj.foo++
  // console.log('end')
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
init()
