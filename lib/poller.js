const binding = require('../binding')
const sdl = require('..')

module.exports = class SDLPoller {
  poll(event) {
    if (!(event instanceof sdl.Event)) {
      throw new TypeError('Poller.poll expect an Event type as parameter')
    }
    return binding.poll(event._handle)
  }
}
