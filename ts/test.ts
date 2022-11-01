import { reactive, effect } from './reactive/index.js'
import computed from './reactive/computed.js'
import watch from './reactive/watch.js'
import { timeout } from './utils.js'

const container = document.querySelector('#app')

// handle data
const data = reactive({
  count: 0
})
watch(() => data.count, () => {
  console.log('count changed')
})
const run = async () => {
  await timeout(0)

  data.lastName = `${data.lastName}1`
}
run()

// render
function greet() {
  console.log('greet')
  const el = document.createElement('h3')
  el.innerHTML = fullName.value

  if (container) {
    container.innerHTML = ''
    container.appendChild(el)
  }
}

effect(greet)

export {}
