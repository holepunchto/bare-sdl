const test = require('brittle')
const sdl = require('..')

test('it should expose an Event class', (t) => {
  const event = new sdl.Event()
  t.ok(event)
})

test('Event class shouls expose a type getter initialized at zero', (t) => {
  const event = new sdl.Event()
  t.ok(event.type == 0)
})

test('Event class shouls expose a key getter which returns Event.Keyboard', (t) => {
  const event = new sdl.Event()
  t.ok(event.key instanceof sdl.Event.Keyboard)
})

test('it should expose an Event.Keyboard class', (t) => {
  const event = new sdl.Event.Keyboard()
  t.ok(event)
})

test('Event.Keyboard class shouls expose a scancode getter initialized at zero', (t) => {
  const event = new sdl.Event.Keyboard()
  t.ok(event.scancode == 0)
})

test('Event.Keyboard should be initialized by passing an Event instance', (t) => {
  const event = new sdl.Event.Keyboard(new sdl.Event())
  t.ok(event)
})
