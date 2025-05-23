const test = require('brittle')
const sdl2 = require('.')

test('it should expose window position center const', (t) => {
  t.ok(sdl2.constants.SDL_WINDOWPOS_CENTERED)
})

test('it should expose a window class', (t) => {
  const win = new sdl.Window('Bare-ly a Window', 100, 100)
  t.ok(win)
})
