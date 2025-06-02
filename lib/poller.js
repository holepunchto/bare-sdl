const binding = require('../binding')

module.exports = class SDLPoller {
  poll(event) {
    return binding.poll(event._handle)
  }
}
