const binding = require('../binding')

module.exports = class SDLAudioStream {
  constructor(source, target, options = {}) {
    this.source = source
    this.target = target
    this._handle = null
    this._destroyed = false

    this._handle = binding.createAudioStream(
      source.format,
      source.channels,
      source.freq,
      target.format,
      target.channels,
      target.freq,
      this._makeSafeCallback(options?.get),
      this._makeSafeCallback(options?.put)
    )
  }

  put(buffer, offset = 0, length) {
    if (this._destroyed || !this._handle) return false

    const result = this._handleBufferParams(buffer, offset, length)

    return binding.putAudioStreamData(
      this._handle,
      result.arrayBuffer,
      result.byteOffset,
      result.length
    )
  }

  get(buffer, offset = 0, length) {
    if (this._destroyed || !this._handle) return 0

    const result = this._handleBufferParams(buffer, offset, length)

    return binding.getAudioStreamData(
      this._handle,
      result.arrayBuffer,
      result.byteOffset,
      result.length
    )
  }

  _handleBufferParams(buffer, offset, length) {
    let arrayBuffer = buffer
    let byteOffset = offset

    if (Buffer.isBuffer(buffer)) {
      arrayBuffer = buffer.buffer
      byteOffset = buffer.byteOffset + offset
      length = length ?? buffer.length - offset
    } else {
      length = length ?? buffer.byteLength - offset
    }

    return {
      arrayBuffer,
      byteOffset,
      length
    }
  }

  get available() {
    if (this._destroyed || !this._handle) return 0
    return binding.getAudioStreamAvailable(this._handle)
  }

  get device() {
    if (this._destroyed || !this._handle) return 0
    return binding.getAudioStreamDevice(this._handle)
  }

  flush() {
    if (this._destroyed || !this._handle) return false
    return binding.flushAudioStream(this._handle)
  }

  clear() {
    if (this._destroyed || !this._handle) return false
    return binding.clearAudioStream(this._handle)
  }

  resume() {
    if (this._destroyed || !this._handle) return false
    return binding.resumeAudioStreamDevice(this._handle)
  }

  destroy() {
    if (this._destroyed) return
    this._destroyed = true

    if (this._handle) {
      binding.destroyAudioStream(this._handle)
      this._handle = null
    }

    this._get = null
    this._put = null
  }

  _makeSafeCallback(cb) {
    if (!cb) {
      return
    }

    return (needed, total) => {
      if (!this._destroyed) {
        cb(needed, total)
      }
    }
  }
}
