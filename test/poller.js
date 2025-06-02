const test = require('brittle')
const sdl = require('..')

test('Poller class should expose a poll method', (t) => {
  const event = new sdl.Event()
  const poller = new sdl.Poller()
  t.ok(typeof poller.poll(event) == 'boolean')
})
