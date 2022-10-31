import { reactive, effect } from './reactive/index.js'
import { timeout } from './utils.js'

const container = document.querySelector('#app')

// handle data
const data = reactive({
  isShow: true,
  greet: 'Hello world!'
})
const run = async () => {
  await timeout(1000)
  data.isShow = false
  await timeout(1000)
  data.greet = 'Hello, vue!'
  await timeout(1000)
  data.isShow = true
}
run()

// render
function greet() {
  console.log('greet')
  const el = document.createElement('h3')
  el.innerHTML = data.isShow ? data.greet : 'xixi'

  if (container) {
    container.innerHTML = ''
    container.appendChild(el)
  }
}
effect(greet)

export {}
