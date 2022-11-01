import { reactive, effect } from './reactive/index.js'
import computed from './reactive/computed.js'
import { timeout } from './utils.js'

const container = document.querySelector('#app')

// handle data
const data = reactive({
  firstName: 'jack',
  lastName: 'johns'
})
const fullName = computed(() => {
  return `${data.firstName} ${data.lastName}`
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
