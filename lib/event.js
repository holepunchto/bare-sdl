const binding = require('../binding')

module.exports = exports = class SDLEvent {
  constructor() {
    this._handle = binding.createEvent()
  }

  get type() {
    return binding.getEventType(this._handle)
  }

  get key() {
    return new SDLKeyboardEvent(this)
  }
}

class SDLKeyboardEvent {
  constructor(event) {
    this._handle = binding.getEventKey(event._handle)
  }

  get scancode() {
    return binding.getEventKeyScancode(this._handle)
  }
}

exports.Keyboard = SDLKeyboardEvent
