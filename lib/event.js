const binding = require('../binding')

module.exports = class SDLEvent {
  constructor() {
    this._handle = binding.createEvent()
  }

  get type() {
    return binding.getEventType(this._handle)
  }

  get key() {
    return new SDLEventKey(this._handle)
  }
}

class SDLEventKey {
  constructor(eventHandle) {
    this._handle = binding.getEventKey(eventHandle)
  }

  get scancode() {
    return binding.getEventKeyScancode(this._handle)
  }
}
