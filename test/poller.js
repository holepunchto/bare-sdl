const test = require('brittle')
const sdl = require('..')

test('Poller class should expose a poll method', (t) => {
  const event = new sdl.Event()
  const poller = new sdl.Poller()
  t.ok(typeof poller.poll(event) == 'boolean')
})

test('Poller.poll should throw if type passed is not Event', (t) => {
  const poller = new sdl.Poller()
  t.exception.all(() => {
    poller.poll({})
  })
})
