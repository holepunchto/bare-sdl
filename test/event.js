const test = require('brittle')
const sdl = require('..')

test('it should expose an Event class', (t) => {
  const event = new sdl.Event()
  t.ok(event)
})

test('Event class shouls expose a type getter initialize at zero', (t) => {
  const event = new sdl.Event()
  t.ok(event.type == 0)
})

test('it should expose an Event.Keyboard class', (t) => {
  const event = new sdl.Event.Keyboard(new sdl.Event())
  t.ok(event)
})

test('Event.Keyboard class shouls expose a scancode getter', (t) => {
  const code = new sdl.Event.Keyboard(new sdl.Event())
  t.ok(code)
})
