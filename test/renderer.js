const test = require('brittle')
const sdl = require('..')

test('it should expose a Renderer class', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  t.ok(ren)
})

test('Renderer class should throw if window is not a intance of Window', (t) => {
  t.exception.all(() => {
    new sdl.Renderer({})
  })
})

test('Renderer class could be destroyed', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)

  t.execution(() => {
    // TODO: the destroy method is not called
    ren._destroy()
  })
})

test('Renderer class should expose a clear method', (t) => {
  const win = new sdl.Window('test', 100, 100)
  const ren = new sdl.Renderer(win)
  t.ok(ren.clear())
})
