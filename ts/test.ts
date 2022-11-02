import { reactive, effect } from './reactive/index.js'
import computed from './reactive/computed.js'
import watch from './reactive/watch.js'
import { timeout } from './utils.js'

const container = document.querySelector('#app')

// handle data
const data = reactive({
  a: 1,
  b: 2,
})
watch(
  () => data.a + data.b,
  (value, oldValue) => {
    console.log('changed')
    console.log('value', value)
    console.log('oldValue', oldValue)
  }
)
const run = async () => {
  await timeout(0)

  data.a = 2
  data.b = 3
}
run()

// render
function greet() {
  console.log('greet')
  const el = document.createElement('h3')
  el.innerHTML = ''

  if (container) {
    container.innerHTML = ''
    container.appendChild(el)
  }
}

// effect(greet)

export {}
