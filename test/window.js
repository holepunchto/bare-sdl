const test = require('brittle')
const sdl = require('..')

test('it should expose a window class', (t) => {
  const win = new sdl.Window('Window', 100, 100)
  t.ok(win)
})

test('window class should throw if title is not a string', (t) => {
  t.exception.all(() => {
    const win = new sdl.Window(2832, 100, 100)
  })
})

test('window class should throw if width is not a string', (t) => {
  t.exception.all(() => {
    const win = new sdl.Window('Window', '100', 100)
  })
})

test('window class should throw if height is not a string', (t) => {
  t.exception.all(() => {
    const win = new sdl.Window('Window', 100, '100')
  })
})

test('window class should be destroyed', (t) => {
  const win = new sdl.Window('Window', 100, 100)
  t.execution(() => {
    // TODO: we should be able to use .destroy
    win._destroy()
  })
})

test('it should be possible to pass a flag', (t) => {
  const win = new sdl.Window(
    'Window',
    100,
    100,
    sdl.constants.SDL_WINDOW_FULLSCREEN
  )
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
