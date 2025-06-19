const binding = require('../binding')
const ReferenceCounted = require('./reference-counted')

class AudioStream extends ReferenceCounted {
  constructor(source, target) {
    super()

    this._handle = binding.createAudioStream(
      source.format,
      source.channels,
      source.freq,
      target.format,
      target.channels,
      target.freq
    )
  }

  _destroy() {
    binding.destroyAudioStream(this._handle)
    this._handle = null
  }

  put(buffer, offset = 0, length = buffer.byteLength - offset) {
    return binding.putAudioStreamData(this._handle, buffer, offset, length)
  }

  get(buffer, offset = 0, length = buffer.byteLength - offset) {
    return binding.getAudioStreamData(this._handle, buffer, offset, length)
  }

  get available() {
    return binding.getAudioStreamAvailable(this._handle)
  }

  flush() {
    return binding.flushAudioStream(this._handle)
  }

  clear() {
    return binding.clearAudioStream(this._handle)
  }

  get device() {
    return binding.getAudioStreamDevice(this._handle)
  }
}

class AudioDevice extends ReferenceCounted {
  constructor(
    deviceId = binding.constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK,
    spec = null
  ) {
    super()

    if (typeof deviceId !== 'number') {
      throw new TypeError('deviceId must be a number')
    }

    if (spec) {
      this._handle = binding.openAudioDevice(
        deviceId,
        spec.format,
        spec.channels,
        spec.freq
      )
    } else {
      this._handle = binding.openAudioDevice(
        deviceId,
        binding.constants.SDL_AUDIO_F32,
        2,
        48000
      )
    }
  }

  _destroy() {
    binding.closeAudioDevice(this._handle)
    this._handle = null
  }

  bind(stream) {
    return binding.bindAudioStream(this._handle, stream._handle)
  }

  unbind(stream) {
    binding.unbindAudioStream(stream._handle)
  }

  pause() {
    return binding.pauseAudioDevice(this._handle)
  }

  resume() {
    return binding.resumeAudioDevice(this._handle)
  }
}

module.exports = {
  AudioStream,
  AudioDevice
}
