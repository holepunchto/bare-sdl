const binding = require('../binding')
const constants = binding.constants

class SDLAudioSpec {
  constructor(format) {
    this._format = format
  }

  get format() {
    return binding.getAudioDeviceFormatFormat(this._format._handle)
  }

  get channels() {
    return binding.getAudioDeviceFormatChannels(this._format._handle)
  }

  get freq() {
    return binding.getAudioDeviceFormatFreq(this._format._handle)
  }

  toJSON() {
    return {
      format: this.format,
      channels: this.channels,
      freq: this.freq
    }
  }
}

class SDLAudioDeviceFormat {
  constructor(deviceId) {
    this._handle = binding.getAudioDeviceFormat(deviceId)
  }

  get valid() {
    return binding.getAudioDeviceFormatValid(this._handle)
  }

  get sampleFrames() {
    return binding.getAudioDeviceFormatSampleFrames(this._handle)
  }

  get spec() {
    return new SDLAudioSpec(this)
  }

  toJSON() {
    return {
      valid: this.valid,
      sampleFrames: this.sampleFrames,
      spec: this.spec.toJSON()
    }
  }
}

class SDLAudioDevice {
  static AudioSpec = SDLAudioSpec
  static AudioDeviceFormat = SDLAudioDeviceFormat

  static playbackDeviceFormats() {
    const list = binding.getAudioPlaybackDevices()
    return list.map((deviceId) => {
      return new SDLAudioDeviceFormat(deviceId)
    })
  }

  static getRecordingDevice({ name } = {}) {
    if (!name) {
      return SDLAudioDevice.defaultRecordingDevice()
    }

    const device = SDLAudioDevice.recordingDevices().find((device) => {
      return name === device.name
    })

    if (!device) {
      return null
    }

    return new SDLAudioDevice(device)
  }

  static recordingDeviceFormats() {
    const list = binding.getAudioRecordingDevices()
    return list.map((deviceId) => {
      return new SDLAudioDeviceFormat(deviceId)
    })
  }

  static recordingDevices() {
    const devices = binding.getAudioRecordingDevices()

    return devices.map((id, index) => {
      const name = SDLAudioDevice.getAudioDeviceName(id)

      return {
        id,
        name,
        index
      }
    })
  }

  static getPlaybackDevice({ name } = {}) {
    if (!name) {
      return SDLAudioDevice.defaultPlaybackDevice()
    }

    const device = SDLAudioDevice.playbackDevices().find((device) => {
      return name === device.name
    })

    if (!device) {
      return null
    }

    return new SDLAudioDevice(device)
  }

  static playbackDevices() {
    const devices = binding.getAudioPlaybackDevices()

    return devices.map((id, index) => {
      const name = SDLAudioDevice.getAudioDeviceName(id)

      return {
        id,
        name,
        index
      }
    })
  }

  static defaultRecordingDevice(spec) {
    return new SDLAudioDevice(
      constants.SDL_AUDIO_DEVICE_DEFAULT_RECORDING,
      spec
    )
  }

  static defaultPlaybackDevice(spec) {
    return new SDLAudioDevice(constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, spec)
  }

  static getAudioDeviceName(id) {
    return binding.getAudioDeviceName(id)
  }

  constructor(deviceId, spec) {
    this._requestedDeviceId = deviceId
    this.spec = spec

    const format = this.spec?.format
    const channels = this.spec?.channels
    const freq = this.spec?.freq

    this.id = binding.openAudioDevice(
      this._requestedDeviceId,
      format,
      channels,
      freq
    )

    if (!this.spec) {
      this.spec = this.format.spec
    }
  }

  close() {
    if (!this.id) return
    binding.closeAudioDevice(this.id)
    this.id = null
  }
  destroy() {
    this.close()
  }

  [Symbol.dispose]() {
    this.destroy()
  }

  get name() {
    return binding.getAudioDeviceName(this.id)
  }

  get format() {
    return new SDLAudioDeviceFormat(this.id)
  }

  get isPlaybackDevice() {
    return binding.isAudioDevicePlayback(this.id)
  }

  get isPhysicalDevice() {
    return binding.isAudioDevicePhysical(this.id)
  }

  get isPaused() {
    return binding.isAudioDevicePaused(this.id)
  }

  get gain() {
    return binding.getAudioDeviceGain(this.id)
  }

  set gain(volume) {
    binding.setAudioDeviceGain(this.id, volume)
  }

  pause() {
    if (!this.id) return false
    return binding.pauseAudioDevice(this.id)
  }

  resume() {
    if (!this.id) return false
    return binding.resumeAudioDevice(this.id)
  }

  bindStream(stream) {
    if (!this.id) {
      throw new Error('Audio device not open')
    }

    if (!stream._handle) {
      throw new Error('Audio stream not created')
    }

    const success = binding.bindAudioStream(this.id, stream._handle)

    if (typeof stream._onBound === 'function') {
      stream._onBound()
    }

    this.resume()
    return success
  }

  unbindStream(stream) {
    if (!this.id) return

    if (!stream._handle) {
      throw new Error('Audio stream not created')
    }

    binding.unbindAudioStream(stream._handle)

    if (typeof stream._bound !== 'undefined') {
      stream._bound = false
    }

    return
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      format: this.format.toJSON(),
      isPlaybackDevice: this.isPlaybackDevice,
      isPhysicalDevice: this.isPhysicalDevice,
      isPaused: this.isPaused,
      gain: this.gain
    }
  }
}

module.exports = SDLAudioDevice
