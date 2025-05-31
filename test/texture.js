const test = require('brittle')
const sdl = require('..')

test('it should expose a Texture class', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  const tex = new sdl.Texture(ren, 100, 100)
  t.teardown(() => {
    clean(win, ren, tex)
  })

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
  t.teardown(() => {
    clean(win, ren, tex)
  })

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

test('Texture class should expose an update method', (t) => {
  const width = 100
  const height = 1
  const pitch = width * 3 // RGB24
  const buf = Buffer.alloc(pitch) // 300 bytes

  const win = new sdl.Window('test', width, height)
  const ren = new sdl.Renderer(win)
  const tex = new sdl.Texture(
    ren,
    width,
    height,
    sdl.constants.SDL_PIXELFORMAT_RGB24,
    sdl.constants.SDL_TEXTUREACCESS_STREAMING
  )
  t.teardown(() => {
    clean(win, ren, tex)
  })

  t.ok(typeof tex.update(buf, 300) == 'boolean')
})

// Helpers

function clean(win, ren, tex) {
  tex._destroy()
  ren._destroy()
  win._destroy()
}
