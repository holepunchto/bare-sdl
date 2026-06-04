const binding = require('../binding')

class SDLRect {
  constructor(x = 0, y = 0, w = 0, h = 0) {
    this._handle = binding.createRect(x, y, w, h)
  }

  get x() {
    return binding.getRectX(this._handle)
  }

  get y() {
    return binding.getRectY(this._handle)
  }

  get w() {
    return binding.getRectW(this._handle)
  }

  get h() {
    return binding.getRectH(this._handle)
  }

  set(x, y, w, h) {
    binding.setRect(this._handle, x, y, w, h)
  }
}

class SDLFRect {
  constructor(x = 0, y = 0, w = 0, h = 0) {
    this._handle = binding.createFRect(x, y, w, h)
  }

  get x() {
    return binding.getFRectX(this._handle)
  }

  get y() {
    return binding.getFRectY(this._handle)
  }

  get w() {
    return binding.getFRectW(this._handle)
  }

  get h() {
    return binding.getFRectH(this._handle)
  }

  set(x, y, w, h) {
    binding.setFRect(this._handle, x, y, w, h)
  }
}

module.exports = SDLRect
module.exports.F = SDLFRect
