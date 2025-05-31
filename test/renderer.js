const test = require('brittle')
const sdl = require('..')

test('it should expose a Renderer class', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  t.teardown(() => {
    clean(win, ren)
  })

  t.ok(ren)
})

test('Renderer class should throw if window is not a intance of Window', (t) => {
  t.exception.all(() => {
    new sdl.Renderer({})
  })
})

test('Renderer class should expose a clear method', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  t.teardown(() => {
    clean(win, ren)
  })

  t.ok(typeof ren.clear() == 'boolean')
})

test('Renderer class should expose a present method', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  t.teardown(() => {
    clean(win, ren)
  })

  t.ok(typeof ren.present() == 'boolean')
})

test('Renderer class should expose a texture method', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  const tex = new sdl.Texture(ren, 100, 100)
  t.teardown(() => {
    clean(win, ren, tex)
  })

  t.ok(typeof ren.texture(tex) == 'boolean')
})

// Helpers

function clean(win, ren, tex) {
  if (tex) tex._destroy()
  ren._destroy()
  win._destroy()
}
