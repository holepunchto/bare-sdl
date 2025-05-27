const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')
const Window = require('./window')

module.exports = class SDLRenderer extends ReferenceCounted {
  constructor(window) {
    if (!(window instanceof Window)) {
      throw new TypeError('Renderer expect a Window type as parameter')
    }

    super()
    this._handle = binding.createRenderer(window._handle)
  }

  clear() {
    return binding.clearRender(this._handle)
  }

  copy(texture) {
    binding.copyRenderer(this._handle, texture._handle)
  }

  present() {
    binding.presentRenderer(this._handle)
  }

  _destroy() {
    binding.destroyRenderer(this._handle)
    this._handle = null
  }
}
