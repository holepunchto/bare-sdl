const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')
const constants = require('./constants')

module.exports = class SDLTexture extends ReferenceCounted {
  constructor(
    renderer,
    width,
    height,
    pixelFormat = constants.SDL_PIXELFORMAT_RGB24,
    textureAccess = constants.SDL_TEXTUREACCESS_STREAMING
  ) {
    super()

    this._handle = binding.createTexture(
      renderer._handle,
      pixelFormat,
      textureAccess,
      width,
      height
    )
  }

  _destroy() {
    binding.destroyTexture(this._handle)
    this._handle = null
  }

  update(buffer, lineSize) {
    // TODO: expose SDL_Rect
    return binding.updateTexture(
      this._handle,
      buffer.buffer,
      buffer.byteOffset,
      lineSize
    )
  }
}
