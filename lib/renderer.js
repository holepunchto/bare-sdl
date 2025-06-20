const binding = require('../binding')

module.exports = class SDLRenderer {
  constructor(window) {
    this._handle = binding.createRenderer(window._handle)
  }

  destroy() {
    binding.destroyRenderer(this._handle)
    this._handle = null
  }

  clear() {
    return binding.clearRender(this._handle)
  }

  texture(texture) {
    return binding.textureRender(this._handle, texture._handle)
  }

  present() {
    return binding.presentRender(this._handle)
  }
}
