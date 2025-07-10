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

  static recordingDeviceFormats() {
    const list = binding.getAudioRecordingDevices()
    return list.map((deviceId) => {
      return new SDLAudioDeviceFormat(deviceId)
    })
  }

  static recordingDevices() {
    const list = binding.getAudioRecordingDevices()
    return list.map((deviceId) => {
      return new SDLAudioDevice(deviceId)
    })
  }

  static playbackDevices() {
    const list = binding.getAudioPlaybackDevices()
    return list.map((deviceId) => {
      return new SDLAudioDevice(deviceId)
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
  }

  destroy() {
    if (this.closing) return
    binding.closeAudioDevice(this.id)
    this.id = null
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
    return binding.pauseAudioDevice(this.id)
  }

  resume() {
    return binding.resumeAudioDevice(this.id)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      format: this.format,
      isPlaybackDevice: this.isPlaybackDevice,
      isPhysicalDevice: this.isPhysicalDevice,
      isPaused: this.isPaused,
      gain: this.gain,
      opening: this.opening,
      opened: this.opened,
      closing: this.closing,
      closed: this.closed
    }
  }
}

module.exports = SDLAudioDevice
