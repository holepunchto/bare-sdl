const ffmpeg = require('bare-ffmpeg')
const sdl = require('bare-sdl')

class Playback {
  constructor(width, height) {
    this.win = new sdl.Window('Window', width, height)
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

  destroy() {
    this.win.destroy()
    this.ren.destroy()
    this.tex.destroy()
  }

  render(buffer, lineSize) {
    this.tex.update(buffer, lineSize)
    this.ren.clear()
    this.ren.texture(this.tex)
    this.ren.present()
  }

  poll() {
    const event = new sdl.Event()

    if (this.poller.poll(event)) {
      return event
    }

    return null
  }
}

let url
if (Bare.platform === 'darwin') url = '0'
if (Bare.platform === 'win32') url = 'video=FaceTime HD Camera'

const options = new ffmpeg.Dictionary()
options.set('framerate', '30')
options.set('video_size', '1280x720')
if (Bare.platform === 'darwin') options.set('pixel_format', 'uyvy422')
if (Bare.platform === 'win32') {
  options.set('pixel_format', 'yuyv422')
  options.set('rtbufsize', '100M')
}

const inputFormatContext = new ffmpeg.InputFormatContext(
  new ffmpeg.InputFormat(),
  options,
  url
)

const bestStream = inputFormatContext.getBestStream(
  ffmpeg.constants.mediaTypes.VIDEO
)
if (!bestStream) process.exit(1)

const decoder = bestStream.decoder()

const codec = ffmpeg.Codec.H264

const decoderContext = new ffmpeg.CodecContext(codec.decoder)
decoderContext.open()

const encoderOptions = new ffmpeg.Dictionary()
encoderOptions.set('preset', 'ultrafast')
encoderOptions.set('tune', 'zerolatency')

const encoderContext = new ffmpeg.CodecContext(codec.encoder)
encoderContext.width = decoder.width
encoderContext.height = decoder.height
encoderContext.pixelFormat = ffmpeg.constants.pixelFormats.YUV420P
encoderContext.timeBase = new ffmpeg.Rational(1, 30)
encoderContext.open(encoderOptions)

const playback = new Playback(decoder.width, decoder.height)

const raw = new ffmpeg.Frame()

const yuv = new ffmpeg.Frame()
yuv.width = decoder.width
yuv.height = decoder.height
yuv.pixelFormat = ffmpeg.constants.pixelFormats.YUV420P
yuv.alloc()

const rgb = new ffmpeg.Frame()
rgb.width = decoder.width
rgb.height = decoder.height
rgb.pixelFormat = ffmpeg.constants.pixelFormats.RGB24
rgb.alloc()

const image = new ffmpeg.Image(
  ffmpeg.constants.pixelFormats.RGBA,
  rgb.width,
  rgb.height
)
image.fill(rgb)

const toYUV = new ffmpeg.Scaler(
  decoder.pixelFormat,
  decoder.width,
  decoder.height,
  ffmpeg.constants.pixelFormats.YUV420P,
  yuv.width,
  yuv.height
)

const toRGB = new ffmpeg.Scaler(
  ffmpeg.constants.pixelFormats.YUV420P,
  decoder.width,
  decoder.height,
  ffmpeg.constants.pixelFormats.RGB24,
  decoder.width,
  decoder.height
)

function encode(packet) {
  const result = inputFormatContext.readFrame(packet)
  if (!result) return

  decoder.sendPacket(packet)
  packet.unref()

  while (decoder.receiveFrame(raw)) {
    toYUV.scale(raw, yuv)
    encoderContext.sendFrame(yuv)

    while (encoderContext.receivePacket(packet)) {
      decode(packet.data)
      packet.unref()
    }
  }
}

function decode(buffer) {
  const packet = new ffmpeg.Packet(buffer)
  decoderContext.sendPacket(packet)
  packet.destroy()

  const decodedFrame = new ffmpeg.Frame()
  while (decoderContext.receiveFrame(decodedFrame)) {
    toRGB.scale(decodedFrame, rgb)
    playback.render(image.data, image.lineSize())
  }
}

const loop = setInterval(() => {
  let event

  while ((event = playback.poll())) {
    if (event.type === sdl.constants.SDL_EVENT_QUIT) {
      clearInterval(loop)
    }
  }

  const packet = new ffmpeg.Packet()
  encode(packet)
  packet.destroy()
}, 1000 / 24 /* 24 FPS */)
