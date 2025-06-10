const binding = require('../binding')

class SDLEvent {
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
  constructor(event = new SDLEvent()) {
    this._handle = binding.getEventKey(event._handle)
  }

  get scancode() {
    return binding.getEventKeyScancode(this._handle)
  }
}

module.exports = SDLEvent
module.exports.Keyboard = SDLKeyboardEvent
