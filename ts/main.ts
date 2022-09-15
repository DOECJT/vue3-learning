const data: Partial<Record<PropertyKey, any>> = {
  foo: 0,
  get bar() {
    return this.foo
  }
}
const p = new Proxy(data, {
  get(target, key, reciver) {
    // console.log('receiver', reciver)
    console.log(`get: ${key}`)
    // return 'xixi'
    return Reflect.get(target, key, reciver)
  },
  set(target, key, newValue) {
    console.log(`set: ${key}`)
    target[key] = newValue
    return true
  },
  deleteProperty(target, key) {
    console.log(`delete: ${key}`)
    return Reflect.deleteProperty(target, key)
  }
})

console.log('foo', p.foo)
delete p.foo
console.log('foo', p.foo)
