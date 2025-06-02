const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')

module.exports = class SDLRenderer extends ReferenceCounted {
  constructor(window) {
    super()
    this._handle = binding.createRenderer(window._handle)
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

  _destroy() {
    binding.destroyRenderer(this._handle)
    this._handle = null
  }
}
