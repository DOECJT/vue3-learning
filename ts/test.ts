import { reactive, effect } from './reactive/index.js'
import computed from './reactive/computed.js'
import watch from './reactive/watch.js'
import { timeout } from './utils.js'

const container = document.querySelector('#app')

// handle data
const data = reactive({
  time: 1000,
  data: '',
})
watch(
  () => data.time,
  async (value, oldValue, onCleanup) => {
    let expired = false
    onCleanup(() => {
      expired = true
    })
    const res = await getData(value)
    if (!expired) {
      data.data = res
    }
  },
)
const run = async () => {
  await timeout(0)

  data.time = 2000
}
run()

// render
function greet() {
  console.log('greet')
  const el = document.createElement('h3')
  el.innerHTML = data.data

  if (container) {
    container.innerHTML = ''
    container.appendChild(el)
  }
}

effect(greet)

async function getData(time: number) {
  await timeout(time)
  return time
}

export {}
