const test = require('brittle')
const sdl = require('..')

test('it should expose a Texture class', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  const tex = new sdl.Texture(ren, 100, 100)
  t.ok(tex)
})

test('Texture class should be construct specifiying pixel format and texture access', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  const tex = new sdl.Texture(
    ren,
    100,
    100,
    sdl.constants.SDL_PIXELFORMAT_RGB24,
    sdl.constants.SDL_TEXTUREACCESS_STREAMING
  )
  t.ok(tex)
})

test('Texture class should throw an error if renderer is not an instance of Renderer', (t) => {
  t.exception.all(() => {
    new sdl.Texture({}, 100, 100)
  })
})

test('Texture class should throw an error if pixel format is wrong', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  t.exception(() => {
    new sdl.Texture(ren, 100, 100, 1)
  })
})
