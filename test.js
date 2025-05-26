const test = require('brittle')
const sdl = require('.')

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

test('it should be possible to pass a flag', (t) => {
  const win = new sdl.Window('Bare-ly a Window', 100, 100, sdl.constants.windowFlags.SDL_WINDOW_FULLSCREEN)
  t.ok(win)
})
