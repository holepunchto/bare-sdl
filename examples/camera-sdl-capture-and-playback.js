const sdl = require('bare-sdl')

class CameraCapture {
  constructor() {
    const cameras = sdl.Camera.getCameras()

    if (!cameras?.length) {
      throw new Error('No cameras found')
    }

    for (const camera of cameras) {
      console.log(`  ${camera.index}: ${camera.name} (${camera.id}))`, camera)

      if (camera.index === 0) {
        const formats = sdl.Camera.getSupportedFormats(camera.id)
        console.log(`  Supported formats: ${formats.length}`)

        for (const format of formats.slice(0, 3)) {
          const fps = format.framerateNumerator / format.framerateDenominator
          console.log(`    - ${format.width}x${format.height} @ ${fps}fps`)
        }
      }
    }

    console.log('\nOpening first camera...')

    const requestedSpec =
      Bare.platform === 'darwin'
        ? {
            format: sdl.constants.SDL_PIXELFORMAT_UYVY,
            width: 1280,
            height: 720,
            framerateNumerator: 30,
            framerateDenominator: 1
          }
        : null

    this.camera = new sdl.Camera(cameras[0], requestedSpec)

    const spec = this.camera.spec
    {
      console.log(
        `Camera format: ${spec.width}x${spec.height} @ ${spec.fps}fps`
      )
      console.log(`Pixel format: 0x${spec.format.toString(16)}`)

      let formatName
      switch (spec.format) {
        case sdl.constants.SDL_PIXELFORMAT_YUY2:
          formatName = 'YUY2'
          break
        case sdl.constants.SDL_PIXELFORMAT_UYVY:
          formatName = 'UYVY'
          break
        case sdl.constants.SDL_PIXELFORMAT_YVYU:
          formatName = 'YVYU'
          break
        case sdl.constants.SDL_PIXELFORMAT_NV12:
          formatName = 'NV12'
          break
        case sdl.constants.SDL_PIXELFORMAT_NV21:
          formatName = 'NV21'
          break
        case sdl.constants.SDL_PIXELFORMAT_RGB24:
          formatName = 'RGB24'
          break
        case sdl.constants.SDL_PIXELFORMAT_BGR24:
          formatName = 'BGR24'
          break
        default:
          formatName = `Unknown (0x${spec.format.toString(16)})`
          break
      }

      console.log(`Format name: ${formatName}`, spec.format, spec.toJSON())
    }

    this.win = new sdl.Window(
      'Camera Capture',
      spec.width || 640,
      spec.height || 480
    )
    this.ren = new sdl.Renderer(this.win)

    const pixelFormat = spec.format
    console.log(`Creating texture with format: 0x${pixelFormat.toString(16)}`)

    this.tex = new sdl.Texture(
      this.ren,
      spec.width || 640,
      spec.height || 480,
      pixelFormat,
      sdl.constants.SDL_TEXTUREACCESS_STREAMING
    )

    this.poller = new sdl.Poller()
    this.frameCount = 0
    this.lastFrameTime = Date.now()
  }

  checkPermission() {
    const state = this.camera.permissionState

    if (state === 0) {
      console.log('Waiting for camera permission...')
      return false
    } else if (state === -1) {
      console.log('Camera permission denied!')
      return false
    } else if (state === 1) {
      if (!this.permissionGranted) {
        console.log('Camera permission granted!')
        this.permissionGranted = true
      }
      return true
    }

    return false
  }

  captureFrame() {
    if (!this.checkPermission()) {
      return false
    }

    const frame = this.camera.acquireFrame()

    if (frame.valid) {
      this.frameCount++

      if (!this.firstFrameLogged) {
        console.log(`First frame format: 0x${frame.format.toString(16)}`)
        this.firstFrameLogged = true
      }

      const now = Date.now()
      if (now - this.lastFrameTime > 1000) {
        const fps = this.frameCount / ((now - this.lastFrameTime) / 1000)
        console.log(
          `Capturing: ${frame.width}x${frame.height}, ${fps.toFixed(1)} fps`
        )
        this.frameCount = 0
        this.lastFrameTime = now
      }

      const pixels = frame.pixels
      if (pixels) {
        const pixelArray = new Uint8Array(pixels)

        if (!this.pitchLogged) {
          console.log(`Frame pitch: ${frame.pitch} bytes`)
          this.pitchLogged = true
        }

        this.tex.update(pixelArray, frame.pitch)

        this.ren.clear()
        this.ren.texture(this.tex)
        this.ren.present()
      }

      frame.release()

      return true
    }

    return false
  }

  pollEvents() {
    const event = new sdl.Event()

    if (this.poller.poll(event)) {
      const type = event.type

      if (
        type === sdl.constants.SDL_EVENT_QUIT ||
        type === sdl.constants.SDL_EVENT_WINDOW_CLOSE_REQUESTED
      ) {
        return false
      }

      if (type === sdl.constants.SDL_EVENT_CAMERA_DEVICE_APPROVED) {
        console.log('Camera approved by system')
      } else if (type === sdl.constants.SDL_EVENT_CAMERA_DEVICE_DENIED) {
        console.log('Camera denied by system')
        return false
      } else if (type === sdl.constants.SDL_EVENT_CAMERA_DEVICE_ADDED) {
        console.log('Camera device added')
      } else if (type === sdl.constants.SDL_EVENT_CAMERA_DEVICE_REMOVED) {
        console.log('Camera device removed')
      }

      if (type === sdl.constants.SDL_EVENT_KEY_DOWN) {
        const key = event.key

        if (key.scancode === sdl.constants.SDL_SCANCODE_ESCAPE) {
          return false
        }
      }
    }

    return true
  }

  destroy() {
    this.camera.destroy()
    this.tex.destroy()
    this.ren.destroy()
    this.win.destroy()
  }

  run() {
    console.log('\nCamera capture started. Press ESC to quit.')

    let running = true
    while (running) {
      running = this.pollEvents()
      this.captureFrame()
    }

    console.log('\nShutting down...')
  }
}

const capture = new CameraCapture()
capture.run()
capture.destroy()
