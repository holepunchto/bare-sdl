const sdl = require('bare-sdl')
const ffmpeg = require('bare-ffmpeg')

class CameraFFmpegBridge {
  constructor() {
    const cameras = sdl.Camera.getCameras()
    if (cameras.length === 0) {
      throw new Error('No cameras found')
    }

    console.log('Available cameras:')
    cameras.forEach((id, index) => {
      const name = sdl.Camera.getCameraName(id)
      console.log(`  ${index}: ${name}`)
    })

    const selectedIndex = 0
    const cameraName = sdl.Camera.getCameraName(cameras[selectedIndex])
    console.log(`\nUsing: ${cameraName}`)

    const formats = sdl.Camera.getSupportedFormats(cameras[selectedIndex])
    const targetFormat = this.selectBestFormat(formats)
    console.log(`Format: ${targetFormat.width}x${targetFormat.height} @ ${targetFormat.fps}fps`)

    const { url, options } = this.createFFmpegConfig(cameraName, selectedIndex, targetFormat)

    this.initFFmpeg(url, options)
    this.playback = new Playback(targetFormat.width, targetFormat.height)
  }

  selectBestFormat(formats) {
    const preferred =
      formats.find((f) => f.width === 1280 && f.height === 720) ||
      formats.find((f) => f.width >= 1280) ||
      formats[0] ||
      {}

    return {
      width: preferred.width || 640,
      height: preferred.height || 480,
      fps: preferred.framerateNumerator / preferred.framerateDenominator || 30
    }
  }

  createFFmpegConfig(cameraName, cameraIndex, targetFormat) {
    const options = new ffmpeg.Dictionary()
    options.set('framerate', String(targetFormat.fps))
    options.set('video_size', `${targetFormat.width}x${targetFormat.height}`)

    let url = ''

    if (Bare.platform === 'darwin') {
      url = String(cameraIndex)
      options.set('pixel_format', 'uyvy422')
    } else if (Bare.platform === 'win32') {
      url = `video=${cameraName}`
      options.set('pixel_format', 'yuyv422')
      options.set('rtbufsize', '100M')
    } else {
      url = `/dev/video${cameraIndex}`
      options.set('pixel_format', 'yuyv422')
    }

    return { url, options }
  }

  initFFmpeg(url, options) {
    const inputFormat = new ffmpeg.InputFormat()
    this.inputFormatContext = new ffmpeg.InputFormatContext(inputFormat, options, url)

    const bestStream = this.inputFormatContext.getBestStream(ffmpeg.constants.mediaTypes.VIDEO)
    if (!bestStream) {
      throw new Error('No video stream found')
    }

    this.decoder = bestStream.decoder()
    console.log(
      `Stream: ${this.decoder.width}x${this.decoder.height}, format: ${this.decoder.pixelFormat}`
    )

    this.rgbImage = new ffmpeg.Image(
      ffmpeg.constants.pixelFormats.RGB24,
      this.decoder.width,
      this.decoder.height
    )

    this.rawFrame = new ffmpeg.Frame()
    this.rgbFrame = new ffmpeg.Frame()

    this.rgbFrame.width = this.decoder.width
    this.rgbFrame.height = this.decoder.height
    this.rgbFrame.pixelFormat = ffmpeg.constants.pixelFormats.RGB24

    this.rgbImage.fill(this.rgbFrame)

    this.scaler = new ffmpeg.Scaler(
      this.decoder.pixelFormat,
      this.decoder.width,
      this.decoder.height,
      ffmpeg.constants.pixelFormats.RGB24,
      this.decoder.width,
      this.decoder.height
    )
  }

  captureFrame() {
    const packet = new ffmpeg.Packet()
    if (!this.inputFormatContext.readFrame(packet)) {
      return false
    }

    this.decoder.sendPacket(packet)
    packet.unref()

    if (!this.decoder.receiveFrame(this.rawFrame)) {
      return false
    }

    this.scaler.scale(this.rawFrame, this.rgbFrame)
    this.rgbImage.read(this.rgbFrame)

    this.playback.render(this.rgbImage.data, this.rgbImage.lineSize(0))

    return true
  }

  run() {
    console.log('Press ESC to quit\n')

    let running = true
    let frameCount = 0
    let lastTime = Date.now()

    while (running) {
      const event = this.playback.poll()
      if (
        event &&
        (event.type === sdl.constants.SDL_EVENT_QUIT ||
          event.type === sdl.constants.SDL_EVENT_WINDOW_CLOSE_REQUESTED ||
          (event.type === sdl.constants.SDL_EVENT_KEY_DOWN &&
            event.key.scancode === sdl.constants.SDL_SCANCODE_ESCAPE))
      ) {
        running = false
      }

      if (this.captureFrame()) {
        frameCount++

        const now = Date.now()
        if (now - lastTime > 1000) {
          console.log(`FPS: ${(frameCount / ((now - lastTime) / 1000)).toFixed(1)}`)
          frameCount = 0
          lastTime = now
        }
      }
    }
  }

  destroy() {
    if (this.playback) {
      this.playback.destroy()
    }
  }
}

class Playback {
  constructor(width, height) {
    this.win = new sdl.Window('Camera (SDL device list, FFmpeg Capture)', width, height)
    this.ren = new sdl.Renderer(this.win)
    this.tex = new sdl.Texture(
      this.ren,
      width,
      height,
      sdl.constants.SDL_PIXELFORMAT_RGB24,
      sdl.constants.SDL_TEXTUREACCESS_STREAMING
    )
    this.poller = new sdl.Poller()
  }

  render(buffer, lineSize) {
    this.tex.update(buffer, lineSize)
    this.ren.clear()
    this.ren.texture(this.tex)
    this.ren.present()
  }

  poll() {
    const event = new sdl.Event()
    return this.poller.poll(event) ? event : null
  }

  destroy() {
    this.tex.destroy()
    this.ren.destroy()
    this.win.destroy()
  }
}

const bridge = new CameraFFmpegBridge()
bridge.run()
bridge.destroy()
