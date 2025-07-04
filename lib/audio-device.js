const ReadyResource = require('ready-resource')
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

class SDLAudioDevice extends ReadyResource {
  static AudioSpec = SDLAudioSpec
  static AudioDeviceFormat = SDLAudioDeviceFormat

  /**
   * @return []SDLAudioDeviceFormat
   */
  static playbackDeviceFormats() {
    const list = binding.getAudioPlaybackDevices()
    return list.map((deviceId) => {
      return new SDLAudioDeviceFormat(deviceId)
    })
  }

  /**
   * @return []SDLAudioDeviceFormat
   */
  static recordingDeviceFormats() {
    const list = binding.getAudioRecordingDevices()
    return list.map((deviceId) => {
      return new SDLAudioDeviceFormat(deviceId)
    })
  }

  /**
   * @return []SDLAudioDevice
   */
  static async recordingDevices() {
    const list = binding.getAudioRecordingDevices()
    return Promise.all(
      list.map(async (deviceId) => {
        const device = await SDLAudioDevice.open(deviceId)
        return device
      })
    )
  }

  /**
   * @return []SDLAudioDevice
   */
  static async playbackDevices() {
    const list = binding.getAudioPlaybackDevices()
    return Promise.all(
      list.map(async (deviceId) => {
        return SDLAudioDevice.open(deviceId)
      })
    )
  }

  /**
   * @return SDLAudioDevice
   */
  static async defaultRecordingDevice(spec) {
    return SDLAudioDevice.open(
      constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK,
      spec
    )
  }

  /**
   * @return SDLAudioDevice
   */
  static async defaultPlaybackDevice(spec) {
    return SDLAudioDevice.open(
      constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK,
      spec
    )
  }

  /**
   * @return SDLAudioDevice
   */
  static async open(deviceId, spec) {
    const device = new SDLAudioDevice(deviceId, spec)
    await device.ready()
    return device
  }

  constructor(deviceId, spec) {
    super()
    this._requestedDeviceId = deviceId
    this.spec = spec
    this.id = null
  }

  _open() {
    if (this.opening || this.opened) {
      return
    }

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

  _close() {
    if (this.closing) return
    binding.closeAudioDevice(this.id)
    this.id = null
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
