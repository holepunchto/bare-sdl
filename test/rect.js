const test = require('brittle')
const sdl = require('..')

test('it should expose a Rect class', (t) => {
  const r = new sdl.Rect(1, 2, 3, 4)
  t.is(r.x, 1)
  t.is(r.y, 2)
  t.is(r.w, 3)
  t.is(r.h, 4)
})

test('Rect defaults to zeros', (t) => {
  const r = new sdl.Rect()
  t.is(r.x, 0)
  t.is(r.y, 0)
  t.is(r.w, 0)
  t.is(r.h, 0)
})

test('Rect.set updates fields in place', (t) => {
  const r = new sdl.Rect()
  r.set(10, 20, 30, 40)
  t.is(r.x, 10)
  t.is(r.y, 20)
  t.is(r.w, 30)
  t.is(r.h, 40)
})

test('it should expose an FRect class', (t) => {
  const r = new sdl.Rect.F(1.5, 2.5, 3.5, 4.5)
  t.is(r.x, 1.5)
  t.is(r.y, 2.5)
  t.is(r.w, 3.5)
  t.is(r.h, 4.5)
})

test('FRect.set updates fields in place', (t) => {
  const r = new sdl.Rect.F()
  r.set(0.25, 0.5, 0.75, 1)
  t.is(r.x, 0.25)
  t.is(r.y, 0.5)
  t.is(r.w, 0.75)
  t.is(r.h, 1)
})
