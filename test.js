const test = require('brittle')
const sdl = require('.')

test('it should expose window position center const', (t) => {
  t.ok(sdl.constants.SDL_WINDOWPOS_CENTERED)
})

test('it should expose a window class', (t) => {
  const win = new sdl.Window('Bare-ly a Window', 100, 100)
  t.ok(win)
})

test('it should expose a window class', (t) => {
  const win = new sdl.Window('Bare-ly a Window', 100, 100)
  t.ok(win)
})

test('window class should be destroyed', (t) => {
  const win = new sdl.Window('Bare-ly a Window', 100, 100)
  t.execution(() => {
    win.destroy()
  })
})
