const test = require('brittle')
const sdl = require('..')

test('sdl.Camera - getCameras', (t) => {
  const cameras = sdl.Camera.getCameras()
  t.ok(Array.isArray(cameras), 'returns an array')
})

test('sdl.Camera - getCameraName', (t) => {
  const cameras = sdl.Camera.getCameras()
  const name = sdl.Camera.getCameraName(cameras[0].id)
  t.ok(typeof name === 'string' || name === null, 'returns a string or null')
})

test('sdl.Camera - getCameraPosition', (t) => {
  const cameras = sdl.Camera.getCameras()
  const position = sdl.Camera.getCameraPosition(cameras[0])
  t.ok(typeof position === 'number', 'returns a number')
})

test('sdl.Camera - getSupportedFormats', (t) => {
  const cameras = sdl.Camera.getCameras()
  const formats = sdl.Camera.getSupportedFormats(cameras[0])
  t.ok(Array.isArray(formats), 'returns an array')

  if (formats.length > 0) {
    const format = formats[0]
    t.ok(typeof format.format === 'number', 'format is a number')
    t.ok(typeof format.width === 'number', 'width is a number')
    t.ok(typeof format.height === 'number', 'height is a number')
    t.ok(
      typeof format.framerateNumerator === 'number',
      'framerateNumerator is a number'
    )
    t.ok(
      typeof format.framerateDenominator === 'number',
      'framerateDenominator is a number'
    )
  }
})

test('sdl.Camera - open without spec', (t) => {
  const cameras = sdl.Camera.getCameras()
  using camera = new sdl.Camera(cameras[0].id)
  t.ok(camera._handle, 'camera handle exists')
  t.ok(typeof camera.id === 'number', 'camera id is a number')
})

test('sdl.Camera - open with spec', (t) => {
  const cameras = sdl.Camera.getCameras()
  const formats = sdl.Camera.getSupportedFormats(cameras[0])
  const spec = formats[0]
  using camera = new sdl.Camera(cameras[0].id, spec)
  t.ok(camera._handle, 'camera handle exists')
})

test('sdl.Camera - permission state', (t) => {
  const cameras = sdl.Camera.getCameras()
  using camera = new sdl.Camera(cameras[0].id)
  t.ok(typeof camera.permissionState === 'number', 'permission state is number')
  t.ok(typeof camera.isApproved === 'boolean', 'isApproved is boolean')
  t.ok(typeof camera.isPending === 'boolean', 'isPending is boolean')
})

test('sdl.Camera - format', (t) => {
  const cameras = sdl.Camera.getCameras()
  using camera = new sdl.Camera(cameras[0].id)
  const format = camera.format
  t.ok(format instanceof sdl.Camera.CameraSpec, 'returns CameraSpec instance')
  t.ok(typeof format.width === 'number', 'width is number')
  t.ok(typeof format.height === 'number', 'height is number')
})

test('sdl.Camera - acquire frame', (t) => {
  const cameras = sdl.Camera.getCameras()
  using camera = new sdl.Camera(cameras[0].id)
  using frame = camera.acquireFrame()

  t.ok(frame instanceof sdl.Camera.CameraFrame, 'returns CameraFrame instance')

  if (frame.valid) {
    t.ok(typeof frame.timestamp === 'number', 'timestamp is number')
    t.ok(typeof frame.width === 'number', 'width is number')
    t.ok(typeof frame.height === 'number', 'height is number')
    t.ok(typeof frame.pitch === 'number', 'pitch is number')
    t.ok(typeof frame.format === 'number', 'format is number')

    const pixels = frame.pixels
    if (pixels) {
      t.ok(pixels instanceof ArrayBuffer, 'pixels is ArrayBuffer')
    }
  }
})

test('SDLCameraFormat', (t) => {
  const cameras = sdl.Camera.getCameras()
  const formats = sdl.Camera.getSupportedFormats(cameras[0].id)
  const format = formats[0]
  t.ok(format, 'format exists')
  t.ok(typeof format.width === 'number', 'width is number')
  t.ok(typeof format.height === 'number', 'height is number')
  t.ok(typeof format.fps === 'number', 'fps is number')
})

test('sdl.Camera - stress test frame acquisition', (t) => {
  const cameras = sdl.Camera.getCameras()
  using camera = new sdl.Camera(cameras[0])

  const frameCount = 50
  for (let i = 0; i < frameCount; i++) {
    using frame = camera.acquireFrame()
    if (frame.valid) {
      t.ok(frame.timestamp >= 0, `frame ${i}: timestamp is valid`)
    }
  }
})

test('sdl.Camera - incorrect device ID handling', (t) => {
  const incorrectId = 0xffffffff

  const name = sdl.Camera.getCameraName(incorrectId)
  t.not(name?.length, 'incorrect id does not return name')

  const position = sdl.Camera.getCameraPosition(incorrectId)

  t.ok(
    position === sdl.constants.SDL_CAMERA_POSITION_UNKNOWN,
    'incorrect id returns unknown position'
  )

  const formats = sdl.Camera.getSupportedFormats(incorrectId)
  t.ok(
    Array.isArray(formats) && formats.length === 0,
    'invalid device returns empty formats array'
  )

  t.exception(
    () => {
      using camera = new sdl.Camera(incorrectId)
    },
    /Error/,
    'opening camera with incorrect id should throw'
  )
})

test('sdl.Camera - memory cleanup with multiple open/close', (t) => {
  const cameras = sdl.Camera.getCameras()

  const cycles = 10
  const deviceId = cameras[0]

  for (let i = 0; i < cycles; i++) {
    const camera = new sdl.Camera(deviceId)
    t.ok(camera._handle, `cycle ${i}: camera opened`)

    const format = camera.format
    t.ok(format.valid, `cycle ${i}: format check successful`)

    camera.destroy()
    t.ok(!camera._handle, `cycle ${i}: camera handle cleared after destroy`)
  }

  for (let i = 0; i < cycles; i++) {
    using camera = new sdl.Camera(deviceId)
    t.ok(camera._handle, `using cycle ${i}: camera opened`)
  }
})
