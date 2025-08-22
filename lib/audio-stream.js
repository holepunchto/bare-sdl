const binding = require('../binding')

module.exports = class SDLAudioStream {
  constructor(source, target, options = {}) {
    this.source = source
    this.target = target
    this._handle = null
    this._destroyed = false
    this._get = options.get || null
    this._put = options.put || null

    const getCallback = this._get
      ? (needed, total) => {
          if (!this._destroyed && this._get) {
            this._get(needed, total)
          }
        }
      : undefined

    const putCallback = this._put
      ? (added, total) => {
          if (!this._destroyed && this._put) {
            this._put(added, total)
          }
        }
      : undefined

    this._handle = binding.createAudioStream(
      source.format,
      source.channels,
      source.freq,
      target.format,
      target.channels,
      target.freq,
      getCallback,
      putCallback
    )
  }

  put(buffer, offset = 0, length) {
    if (this._destroyed || !this._handle) return false

    let arrayBuffer = buffer
    let byteOffset = offset

    if (Buffer.isBuffer(buffer)) {
      arrayBuffer = buffer.buffer
      byteOffset = buffer.byteOffset + offset
      length = length ?? buffer.length - offset
    } else {
      length = length ?? buffer.byteLength - offset
    }

    return binding.putAudioStreamData(
      this._handle,
      arrayBuffer,
      byteOffset,
      length
    )
  }

  get(buffer, offset = 0, length) {
    if (this._destroyed || !this._handle) return 0

    let arrayBuffer = buffer
    let byteOffset = offset

    if (Buffer.isBuffer(buffer)) {
      arrayBuffer = buffer.buffer
      byteOffset = buffer.byteOffset + offset
      length = length ?? buffer.length - offset
    } else {
      length = length ?? buffer.byteLength - offset
    }

    return binding.getAudioStreamData(
      this._handle,
      arrayBuffer,
      byteOffset,
      length
    )
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
}
