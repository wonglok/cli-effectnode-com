export class BigMouth {
  constructor () {
    const eventMap = {}

    const on = (name, fn) => {
      if (!eventMap[name]) {
        eventMap[name] = []
      }
      eventMap[name].push(fn)
    }

    const emit = (name, data) => {
      if (!eventMap[name]) {
        return false
      }
      eventMap[name].forEach((fn) => fn(data))
    }

    const off = (name, fn) => {
      if (eventMap[name]) {
        const index = eventMap[name].indexOf(fn)
        if (index >= 0) {
          eventMap[name].splice(index, 1)
        }
      }
    }

    const cancel = (name) => {
      if (eventMap[name]) {
        delete eventMap[name]
      }
    }

    const reset = () => {
      Object.keys(eventMap).forEach((kn) => {
        cancel(kn)
      })
    }

    return {
      on,
      emit,

      off,
      cancel,
      reset
    }
  }
}
