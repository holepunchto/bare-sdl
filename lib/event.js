const binding = require('../binding')

module.exports = class SDLEvent {
  constructor() {
    this._handle = binding.createEvent()
  }

  get type() {
    return binding.getEventType(this._handle)
  }
}
