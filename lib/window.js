const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')

module.exports = class SDLWindow extends ReferenceCounted {
  constructor(title, width, height) {
    super()
    this._handle = binding.createWindow(title, width, height)
  }

  _destroy() {
    binding.destroyWindow(this._handle)
    this._handle = null
  }
}
