const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')

module.exports = class SDLWindow extends ReferenceCounted {
  constructor(title, width, height, flags = 0) {
    if (typeof title !== 'string') {
      throw new TypeError(
        `Window expect a title of type string but got: ${typeof title}`
      )
    }

    if (typeof width !== 'number') {
      throw new TypeError(
        `Window expect a width of type string but got: ${typeof width}`
      )
    }

    if (typeof height !== 'number') {
      throw new TypeError(
        `Window expect a height of type string but got: ${typeof height}`
      )
    }

    super()
    this._handle = binding.createWindow(title, width, height, flags)
  }

  _destroy() {
    binding.destroyWindow(this._handle)
    this._handle = null
  }
}
