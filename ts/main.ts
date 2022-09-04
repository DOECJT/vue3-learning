// implement
type Func = (...args: any[]) => any

const bucket = new WeakMap<object, any>()
let activeEffect: any

function track<O extends object>(target: O, key: keyof O) {
  if (!activeEffect) return
  if (!bucket.get(target)) {
    const m = new Map()
    bucket.set(target, m)
  }
  if (!bucket.get(target).get(key)) {
    const s = new Set()
    bucket.get(target).set(key, s)
  }
  const dep = bucket.get(target).get(key)
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}
function trigger<O extends object>(target: O, key: keyof O) {
  const m = bucket.get(target)
  if (!m) return
  const s = m.get(key) as Set<Func>
  if (!s) return
  const newDep = new Set(s)
  newDep.forEach((fn) => fn())
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
type EffectFn = {
  (): void
  deps: Set<Func>[]
}
function effect(fn: Func) {
  const effectFn: EffectFn = () => {
    activeEffect = effectFn
    cleanup(effectFn)
    fn()
  }
  effectFn.deps = []
  effectFn()
}

// call
const data = {
  foo: true,
  bar: true,
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
function init() {
  createButton('foo: any', () => {
    obj.foo = 'xixi'
  })
  createButton('bar: any', () => {
    obj.bar = 'haha'
  })

  effect(function effectFn1() {
    console.log('effectFn1 执行')

    effect(function effectFn2() {
      console.log('effectFn2 执行')
      temp2 = obj.bar
    })

    temp1 = obj.foo
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
init()
