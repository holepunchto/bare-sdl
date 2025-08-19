const binding = require('../binding')
const constants = binding.constants

class SDLCameraSpec {
  constructor(spec) {
    this._spec = spec
  }

  get valid() {
    return binding.getCameraSpecValid(this._spec)
  }

  get format() {
    return binding.getCameraSpecFormat(this._spec)
  }

  get colorspace() {
    return binding.getCameraSpecColorspace(this._spec)
  }

  get width() {
    return binding.getCameraSpecWidth(this._spec)
  }

  get height() {
    return binding.getCameraSpecHeight(this._spec)
  }

  get framerateNumerator() {
    return binding.getCameraSpecFramerateNumerator(this._spec)
  }

  get framerateDenominator() {
    return binding.getCameraSpecFramerateDenominator(this._spec)
  }

  get fps() {
    return this.framerateNumerator / this.framerateDenominator
  }

  toJSON() {
    return {
      valid: this.valid,
      format: this.format,
      colorspace: this.colorspace,
      width: this.width,
      height: this.height,
      framerateNumerator: this.framerateNumerator,
      framerateDenominator: this.framerateDenominator,
      fps: this.fps
    }
  }
}

class SDLCameraFormat {
  constructor(handle) {
    this._handle = handle
  }

  get format() {
    return binding.getCameraFormatFormat(this._handle)
  }

  get colorspace() {
    return binding.getCameraFormatColorspace(this._handle)
  }

  get width() {
    return binding.getCameraFormatWidth(this._handle)
  }

  get height() {
    return binding.getCameraFormatHeight(this._handle)
  }

  get framerateNumerator() {
    return binding.getCameraFormatFramerateNumerator(this._handle)
  }

  get framerateDenominator() {
    return binding.getCameraFormatFramerateDenominator(this._handle)
  }

  get fps() {
    return this.framerateNumerator / this.framerateDenominator
  }

  toJSON() {
    return {
      format: this.format,
      colorspace: this.colorspace,
      width: this.width,
      height: this.height,
      framerateNumerator: this.framerateNumerator,
      framerateDenominator: this.framerateDenominator,
      fps: this.fps
    }
  }
}

class SDLCameraFrame {
  constructor(camera) {
    this._camera = camera
    this._handle = binding.acquireCameraFrame(camera._handle)
  }

  get valid() {
    return binding.getCameraFrameValid(this._handle)
  }

  get timestamp() {
    return binding.getCameraFrameTimestamp(this._handle)
  }

  get width() {
    return binding.getCameraFrameWidth(this._handle)
  }

  get height() {
    return binding.getCameraFrameHeight(this._handle)
  }

  get pitch() {
    return binding.getCameraFramePitch(this._handle)
  }

  get format() {
    return binding.getCameraFrameFormat(this._handle)
  }

  get pixels() {
    return binding.getCameraFramePixels(this._handle)
  }

  release() {
    if (this._handle && this._camera._handle) {
      binding.releaseCameraFrame(this._camera._handle, this._handle)
      this._handle = null
    }
  }

  [Symbol.dispose]() {
    this.release()
  }

  toJSON() {
    return {
      valid: this.valid,
      timestamp: this.timestamp,
      width: this.width,
      height: this.height,
      pitch: this.pitch,
      format: this.format
    }
  }
}

class SDLCamera {
  static CameraSpec = SDLCameraSpec
  static CameraFormat = SDLCameraFormat
  static CameraFrame = SDLCameraFrame

  static getCameras() {
    return binding.getCameras()
  }

  static getCameraName(deviceId) {
    return binding.getCameraName(deviceId)
  }

  static getCameraPosition(deviceId) {
    return binding.getCameraPosition(deviceId)
  }

  static getSupportedFormats(deviceId) {
    const formatHandles = binding.getCameraSupportedFormats(deviceId)
    return formatHandles.map((handle) => {
      const format = new SDLCameraFormat(handle)
      return format.toJSON()
    })
  }

  constructor(deviceId, spec) {
    this._deviceId = deviceId
    this._spec = spec

    const format = spec?.format
    const colorspace = spec?.colorspace
    const width = spec?.width
    const height = spec?.height
    const framerateNumerator = spec?.framerateNumerator
    const framerateDenominator = spec?.framerateDenominator

    this._handle = binding.openCamera(
      deviceId,
      format,
      colorspace,
      width,
      height,
      framerateNumerator,
      framerateDenominator
    )
  }

  get id() {
    return binding.getCameraId(this._handle)
  }

  get properties() {
    return binding.getCameraProperties(this._handle)
  }

  get permissionState() {
    return binding.getCameraPermissionState(this._handle)
  }

  get isApproved() {
    return this.permissionState === 1
  }

  get isDenied() {
    return this.permissionState === -1
  }

  get isPending() {
    return this.permissionState === 0
  }

  get format() {
    const spec = binding.getCameraFormat(this._handle)
    return new SDLCameraSpec(spec)
  }

  acquireFrame() {
    return new SDLCameraFrame(this)
  }

  destroy() {
    if (this._handle) {
      binding.closeCamera(this._handle)
      this._handle = null
    }
  }

  [Symbol.dispose]() {
    this.destroy()
  }

  toJSON() {
    return {
      id: this.id,
      deviceId: this._deviceId,
      permissionState: this.permissionState,
      isApproved: this.isApproved,
      isDenied: this.isDenied,
      isPending: this.isPending,
      format: this.format.toJSON()
    }
  }
}

module.exports = SDLCamera
