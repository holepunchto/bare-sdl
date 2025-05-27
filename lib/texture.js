const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')
const Renderer = require('./renderer')

module.exports = class SDLTexture extends ReferenceCounted {
  constructor(renderer) {
    if (!(renderer instanceof Renderer)) {
      throw new TypeError('Texture expect a Renderer type as parameter')
    }

    super()
    this._handle = binding.createTexture(renderer._handle)
  }

  update(pixels, pitch) {
    // TODO: expose SDL_Rect
    binding.updateTexture(this._handle, pixels, pitch)
  }

  _destroy() {
    binding.destroyTexture(this._handle)
    this._handle = null
  }
}
