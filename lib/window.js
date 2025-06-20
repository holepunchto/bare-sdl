const binding = require('../binding')

module.exports = class SDLWindow {
  constructor(title, width, height, flags = 0) {
    this._handle = binding.createWindow(title, width, height, flags)
  }

  destroy() {
    binding.destroyWindow(this._handle)
    this._handle = null
  }
}
