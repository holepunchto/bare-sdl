const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')
const Renderer = require('./renderer')
const constants = require('./constants')

module.exports = class SDLTexture extends ReferenceCounted {
  constructor(
    renderer,
    width,
    height,
    pixelFormat = constants.SDL_PIXELFORMAT_RGB24,
    textureAccess = constants.SDL_TEXTUREACCESS_STREAMING
  ) {
    if (!(renderer instanceof Renderer)) {
      throw new TypeError('Texture expect a Renderer type as parameter')
    }

    super()
    this._handle = binding.createTexture(
      renderer._handle,
      pixelFormat,
      textureAccess,
      width,
      height
    )
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
