export class ActionCollection {
  constructor ({ array, onMake = () => {}, onDestroy = () => {} }) {
    let afterAddToArray = (v) => {
      onMake(v)
    }
    let afterRemoveFromArray = (v) => {
      onDestroy(v)
    }

    let load = (data) => {
      data.forEach(each => {
        afterAddToArray(each)
      })
    }

    load(array)

    this.accessKeys = [
      'load',
      'add',
      'remove',
      'forEach'
    ]

    return new Proxy(array, {
      get: (temp, key) => {
        if (typeof key === 'number') {
          return array[key]
        }

        if (key === 'load') {
          return (data) => {
            load(data)
          }
        }

        if (key === 'add') {
          return (v) => {
            array.push(v)
            afterAddToArray(v)
          }
        }

        if (key === 'remove') {
          return (v) => {
            let idx = array.findIndex(e => e._id === v._id)
            array.splice(idx, 1)
            afterRemoveFromArray(v)
          }
        }

        if (key === 'forEach') {
          return array.forEach
        }

        return
      },
      set: (temp, key, value) => {
        return array[key] = value
      }
    })
  }
}
