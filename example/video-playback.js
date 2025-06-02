const ffmpeg = require('bare-ffmpeg')
const sdl = require('..')

// Log

function log(message) {
  if (Bare.argv.includes('--debug')) {
    console.log(message)
  }
}

// Playback class

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
    this.win._destroy()
    this.ren._destroy()
    this.tex._destroy()
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
      if (event.type == sdl.constants.SDL_EVENT_QUIT) {
        return false
      }
      return true
    }
    return true
  }
}

// Set up device
let url = undefined
if (Bare.platform == 'win32') url = 'video=FaceTime HD Camera'

const options = new ffmpeg.Dictionary()
options.set('framerate', '30')
options.set('video_size', '1280x720')
if (Bare.platform == 'darwin') options.set('pixel_format', 'uyvy422')
if (Bare.platform == 'win32') options.set('pixel_format', 'yuyv422')
if (Bare.platform == 'win32') options.set('rtbufsize', '100M')

const inputFormatContext = new ffmpeg.InputFormatContext(
  new ffmpeg.InputFormat(),
  options,
  url
)

// Find video stream
const bestStream = inputFormatContext.getBestStream(
  ffmpeg.constants.mediaTypes.VIDEO
)
if (!bestStream) {
  process.exit(1)
}

// Setup rawDecoder
const rawDecoder = bestStream.decoder()

// Set up codec
const codec = ffmpeg.Codec.H264

// Set up decoder
const decoderContext = new ffmpeg.CodecContext(codec.decoder)
decoderContext.open()

// Set up encoder
const encoderOptions = new ffmpeg.Dictionary()
encoderOptions.set('preset', 'ultrafast')
encoderOptions.set('tune', 'zerolatency')
const encoderContext = new ffmpeg.CodecContext(codec.encoder)
encoderContext.width = rawDecoder.width
encoderContext.height = rawDecoder.height
encoderContext.pixelFormat = ffmpeg.constants.pixelFormats.YUV420P
encoderContext.timeBase = new ffmpeg.Rational(1, 30)
encoderContext.open(encoderOptions)

// Set up playback
const playback = new Playback(rawDecoder.width, rawDecoder.height)

// Allocate frames
const rawFrame = new ffmpeg.Frame()
const yuvFrame = new ffmpeg.Frame()
yuvFrame.width = rawDecoder.width
yuvFrame.height = rawDecoder.height
yuvFrame.pixelFormat = ffmpeg.constants.pixelFormats.YUV420P
yuvFrame.alloc()
const rgbFrame = new ffmpeg.Frame()
rgbFrame.width = rawDecoder.width
rgbFrame.height = rawDecoder.height
rgbFrame.pixelFormat = ffmpeg.constants.pixelFormats.RGB24
rgbFrame.alloc()
const rgbaImage = new ffmpeg.Image(
  ffmpeg.constants.pixelFormats.RGBA,
  rgbFrame.width,
  rgbFrame.height
)
rgbaImage.fill(rgbFrame)

// Set up toYUV  scaler
const toYUV = new ffmpeg.Scaler(
  rawDecoder.pixelFormat,
  rawDecoder.width,
  rawDecoder.height,
  ffmpeg.constants.pixelFormats.YUV420P,
  yuvFrame.width,
  yuvFrame.height
)

// Set up toRGB scaler
const toRGB = new ffmpeg.Scaler(
  ffmpeg.constants.pixelFormats.YUV420P,
  rawDecoder.width,
  rawDecoder.height,
  ffmpeg.constants.pixelFormats.RGB24,
  rawDecoder.width,
  rawDecoder.height
)

function capture() {
  const packet = new ffmpeg.Packet()
  while (playback.poll()) {
    encode(packet)
  }
}

function encode(packet) {
  const ret = inputFormatContext.readFrame(packet)
  if (!ret) return

  rawDecoder.sendPacket(packet)
  packet.unref()

  while (rawDecoder.receiveFrame(rawFrame)) {
    log('1 - decoded frame')
    // NOTE: for Mafintosh
    // This were you can playback for the sender
    // playback.render(rawFrame)

    toYUV.scale(rawFrame, yuvFrame)
    log('2 - scale frame to yuv')

    encoderContext.sendFrame(yuvFrame)
    log('3 - send frame')

    while (encoderContext.receivePacket(packet)) {
      log('4 - encoded packet')
      // NOTE: for Mafintosh
      // This where you push to the swarm!
      decode(packet.data)
      packet.unref()
    }
  }
}

// NOTE: for Mafintosh
// This the function that you could use on the receiver side
function decode(buffer) {
  const packet = new ffmpeg.Packet(buffer)
  decoderContext.sendPacket(packet)
  packet.destroy()

  const decodedFrame = new ffmpeg.Frame()
  while (decoderContext.receiveFrame(decodedFrame)) {
    log('5 - decoded frame')
    log('6 - scale frame to rgba')
    toRGB.scale(decodedFrame, rgbFrame)
    playback.render(rgbaImage.data, rgbaImage.lineSize())
  }
}

capture()
