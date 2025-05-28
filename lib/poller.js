const binding = require('../binding')

module.exports = class SDLPoller {
  poll() {
    return binding.poll()
  }
}
