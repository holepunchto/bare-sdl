const binding = require('../binding')
const constants = require('./constants')

module.exports = class SDLTexture {
  constructor(
    renderer,
    width,
    height,
    pixelFormat = constants.SDL_PIXELFORMAT_RGB24,
    textureAccess = constants.SDL_TEXTUREACCESS_STREAMING
  ) {
    this._handle = binding.createTexture(
      renderer._handle,
      pixelFormat,
      textureAccess,
      width,
      height
    )
  }

  destroy() {
    binding.destroyTexture(this._handle)
    this._handle = null
  }

  update(buffer, pitch) {
    // TODO: expose SDL_Rect
    return binding.updateTexture(this._handle, buffer.buffer, buffer.byteOffset, pitch)
  }
}
