const test = require('brittle')
const sdl = require('..')

test('it should expose an Event class', (t) => {
  const event = new sdl.Event()
  t.ok(event)
})

test('Event class shouls expose a type getter', (t) => {
  const event = new sdl.Event()
  t.ok(typeof event.type == 'number')
})
