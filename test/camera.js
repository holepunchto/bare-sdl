const test = require('brittle')
const env = require('bare-env')
const sdl = require('..')

test('sdl.Camera - getCameras', (t) => {
  const cameras = sdl.Camera.getCameras()
  t.ok(Array.isArray(cameras), 'returns an array')
})

if (env.CI) {
  // Devices are not available in ci
  Bare.exit()
}

test('sdl.Camera - getCameraName', (t) => {
  using camera = sdl.Camera.defaultCamera()
  const name = sdl.Camera.getCameraName(camera.id)
  t.ok(typeof name === 'string' || name === null, 'returns a string or null')
})

test('sdl.Camera - getCameraPosition', (t) => {
  using camera = sdl.Camera.defaultCamera()
  const position = sdl.Camera.getCameraPosition(camera.id)
  t.ok(typeof position === 'number', 'returns a number')
})

test('sdl.Camera - getSupportedFormats', (t) => {
  using camera = sdl.Camera.defaultCamera()
  const formats = sdl.Camera.getSupportedFormats(camera.id)
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
  using camera = sdl.Camera.defaultCamera()
  t.ok(camera._handle, 'camera handle exists')
  t.ok(typeof camera.id === 'number', 'camera id is a number')
})

test('sdl.Camera - open with spec', (t) => {
  const cameras = sdl.Camera.getCameras()
  const formats = sdl.Camera.getSupportedFormats(cameras[0].id)
  const spec = formats[0]
  using camera = sdl.Camera.defaultCamera(spec)
  t.ok(camera._handle, 'camera handle exists')
})

test('sdl.Camera - permission state', (t) => {
  using camera = sdl.Camera.defaultCamera()
  t.ok(typeof camera.permissionState === 'number', 'permission state is number')
  t.ok(typeof camera.isApproved === 'boolean', 'isApproved is boolean')
  t.ok(typeof camera.isPending === 'boolean', 'isPending is boolean')
})

test('sdl.Camera - spec', (t) => {
  using camera = sdl.Camera.defaultCamera()
  t.ok(camera.spec instanceof sdl.Camera.CameraSpec, 'returns CameraSpec')
  t.ok(typeof camera.spec.width === 'number', 'width is number')
  t.ok(typeof camera.spec.height === 'number', 'height is number')
})

test('sdl.Camera - acquire frame', (t) => {
  using camera = sdl.Camera.defaultCamera()
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

test('SDLCameraSpec (supported formats)', (t) => {
  using camera = sdl.Camera.defaultCamera()
  const formats = sdl.Camera.getSupportedFormats(camera.id)
  const spec = formats[0]
  t.ok(spec, 'spec exists')
  t.ok(typeof spec.width === 'number', 'width is number')
  t.ok(typeof spec.height === 'number', 'height is number')
  t.ok(typeof spec.fps === 'number', 'fps is number')
})

test('sdl.Camera - stress test frame acquisition', (t) => {
  using camera = sdl.Camera.defaultCamera()

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

  t.exception(
    () => {
      using camera = new sdl.Camera(incorrectId)
    },
    /Error/,
    'opening camera with incorrect id should throw'
  )
})

test('sdl.Camera - incorrect device ID handling', (t) => {
  const incorrectId = 0xffffffff

  t.exception(
    () => {
      const formats = sdl.Camera.getSupportedFormats(incorrectId)
    },
    /Error/,
    'invalid device id should throw'
  )
})

test('sdl.Camera - memory cleanup with multiple open/close', (t) => {
  const cameras = sdl.Camera.getCameras()

  const cycles = 10
  const deviceId = cameras[0]

  for (let i = 0; i < cycles; i++) {
    using camera = new sdl.Camera(deviceId)

    t.ok(camera._handle, `cycle ${i}: camera opened`)
    t.ok(
      typeof camera.permissionState === 'number',
      `cycle ${i}: permission state available`
    )

    camera.destroy()
    t.ok(!camera._handle, `cycle ${i}: camera handle cleared after destroy`)
  }

  for (let i = 0; i < cycles; i++) {
    using camera = new sdl.Camera(deviceId)
    t.ok(camera._handle, `using cycle ${i}: camera opened`)
  }
})
