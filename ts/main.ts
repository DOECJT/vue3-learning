type Func = (...args: any[]) => any

const bucket = new WeakMap<object, any>()
let activeEffect: Func | undefined

const data = {
  text: 'hello world'
}
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
  bucket.get(target).get(key).add(activeEffect)
}
function trigger<O extends object>(target: O, key: keyof O) {
  const m = bucket.get(target)
  if (!m) return
  const s = m.get(key)
  if (!s) return
  s.forEach((fn: Func) => fn())
}
const obj: any = new Proxy(data, {
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

function effect(fn: Func) {
  activeEffect = fn
  fn()
}
function greet() {
  console.log('greet')
  const root = document.querySelector('#app') as HTMLElement
  if (root) {
    root.innerText = obj.text
  }
}
function init() {
  createButton('text: vue3', () => {
    obj.text = 'hello vue3'
  })
  createButton('noExist: xixi', () => {
    obj.noExist = 'xixi'
  })

  effect(greet)
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
