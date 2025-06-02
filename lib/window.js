const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')

module.exports = class SDLWindow extends ReferenceCounted {
  constructor(title, width, height, flags = 0) {
    super()
    this._handle = binding.createWindow(title, width, height, flags)
  }

  _destroy() {
    binding.destroyWindow(this._handle)
    this._handle = null
  }
}
