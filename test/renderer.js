const test = require('brittle')
const sdl = require('..')

test('it should expose a Renderer class', (t) => {
  const win = new sdl.Window('test', 100, 100)
  t.teardown(() => win.destroy())

  const ren = new sdl.Renderer(win)
  t.teardown(() => ren.destroy())

  t.ok(ren)
})

test('Renderer class should expose a clear method', (t) => {
  const win = new sdl.Window('test', 100, 100)
  t.teardown(() => win.destroy())

  const ren = new sdl.Renderer(win)
  t.teardown(() => ren.destroy())

  t.ok(typeof ren.clear() == 'boolean')
})

test('Renderer class should expose a present method', (t) => {
  const win = new sdl.Window('test', 100, 100)
  t.teardown(() => win.destroy())

  const ren = new sdl.Renderer(win)
  t.teardown(() => ren.destroy())

  t.ok(typeof ren.present() == 'boolean')
})

test('Renderer class should expose a texture method', (t) => {
  const win = new sdl.Window('test', 100, 100)
  t.teardown(() => win.destroy())

  const ren = new sdl.Renderer(win)
  t.teardown(() => ren.destroy())

  const tex = new sdl.Texture(ren, 100, 100)
  t.teardown(() => tex.destroy())

  t.ok(typeof ren.texture(tex) == 'boolean')
})
