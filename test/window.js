const test = require('brittle')
const sdl = require('..')

test('it should expose a window class', (t) => {
  const win = new sdl.Window('Window', 100, 100)
  t.teardown(() => {
    win._destroy()
  })
  t.ok(win)
})

test('it should be possible to pass a flag', (t) => {
  const win = new sdl.Window(
    'Window',
    100,
    100,
    sdl.constants.SDL_WINDOW_FULLSCREEN
  )
  t.teardown(() => {
    win._destroy()
  })

  t.ok(win)
})

test('it should throw an error when window creation fails', (t) => {
  t.exception(() => {
    let win = new sdl.Window(
      'Invalid Window',
      100,
      100,
      sdl.constants.SDL_WINDOW_VULKAN | sdl.constants.SDL_WINDOW_METAL
    )
  })
})
