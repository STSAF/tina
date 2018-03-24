import set from 'set-value'
import clone from 'clone'

class Page {
  constructor (options) {
    for (let key in options) {
      this[key] = options[key]
    }
  }

  setData (data, callback) {
    let next = clone(this.data)
    for (let key in data) {
      if (key.includes('[') || key.includes('.')) {
        set(next, key, data[key])
      } else {
        next[key] = data[key]
      }
    }
    this.data = next
    if (typeof callback === 'function') {
      callback()
    }
  }

  _emit (name, ...argv) {
    return this[name].call(this, ...argv)
  }
}

export default class MinaSandbox {
  constructor ({ Tina }) {
    const sandbox = this

    sandbox._pages = []
    // sandbox._components = []

    sandbox.Page = function (options) {
      sandbox._pages.push(new Page(options))
    }
    // sandbox.Component = function (options) {
    // // TODO
    //   sandbox._components.push(options)
    // }

    // replace Tina.globals
    sandbox._replaced = {
      Tina,
      Page: Tina.globals.Page,
      // Component: Tina.globals.Component,
    }
    Tina.globals.Page = sandbox.Page
    // Tina.globals.Component = sandbox.Component
  }

  getPage (index) {
    return this._pages[index >= 0 ? index : this._pages.length + index]
  }
  // getComponent (index) {
  //   return this._components[index >= 0 ? index : this._components.length + index]
  // }

  restore () {
    this._replaced.Tina.globals.Page = this._replaced.Page
    // this._replaced.Tina.globals.Component = this._replaced.Component
  }
}
