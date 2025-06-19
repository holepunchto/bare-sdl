const ffmpeg = require('bare-ffmpeg')
const sdl = require('bare-sdl')

const VIDEO_WIDTH = 1280
const VIDEO_HEIGHT = 720
const VIDEO_FPS = 30
const AUDIO_SAMPLE_RATE = 48000

class Playback {
  constructor(width, height) {
    this.win = new sdl.Window('Video Capture', width, height)
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
    this.tex.destroy()
    this.ren.destroy()
    this.win.destroy()
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
}

const deviceURL = '0:1'
const inputOptions = new ffmpeg.Dictionary()
inputOptions.set('framerate', String(VIDEO_FPS))
inputOptions.set('video_size', `${VIDEO_WIDTH}x${VIDEO_HEIGHT}`)
if (Bare.platform === 'darwin') inputOptions.set('pixel_format', 'uyvy422')
if (Bare.platform === 'win32') {
  inputOptions.set('pixel_format', 'yuyv422')
  inputOptions.set('rtbufsize', '100M')
}

const inputFormat = new ffmpeg.InputFormatContext(
  new ffmpeg.InputFormat(),
  inputOptions,
  deviceURL
)

const videoStreamIndex = inputFormat.getBestStreamIndex(
  ffmpeg.constants.mediaTypes.VIDEO
)
const audioStreamIndex = inputFormat.getBestStreamIndex(
  ffmpeg.constants.mediaTypes.AUDIO
)

const videoStream = inputFormat.getStream(videoStreamIndex)
const audioStream = inputFormat.getStream(audioStreamIndex)

if (!videoStream) {
  console.error('Failed to find video stream')
  process.exit(1)
}

if (!audioStream) {
  console.error('Failed to find audio stream')
  process.exit(1)
}

const rawVideoDecoder = videoStream.decoder()

const h264Encoder = new ffmpeg.CodecContext(ffmpeg.Codec.H264.encoder)
h264Encoder.width = rawVideoDecoder.width
h264Encoder.height = rawVideoDecoder.height
h264Encoder.pixelFormat = ffmpeg.constants.pixelFormats.YUV420P
h264Encoder.timeBase = new ffmpeg.Rational(1, VIDEO_FPS)

const encoderOptions = new ffmpeg.Dictionary()
encoderOptions.set('preset', 'ultrafast')
encoderOptions.set('tune', 'zerolatency')
h264Encoder.open(encoderOptions)

const h264Decoder = new ffmpeg.CodecContext(ffmpeg.Codec.H264.decoder)
h264Decoder.open()

const sdlAudioStream = new sdl.AudioStream(
  { format: sdl.constants.SDL_AUDIO_S16, channels: 2, freq: AUDIO_SAMPLE_RATE },
  { format: sdl.constants.SDL_AUDIO_S16, channels: 2, freq: AUDIO_SAMPLE_RATE }
)

const audioDevice = new sdl.AudioDevice(
  sdl.constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK,
  { format: sdl.constants.SDL_AUDIO_S16, channels: 2, freq: AUDIO_SAMPLE_RATE }
)

audioDevice.bind(sdlAudioStream)
audioDevice.resume()

const rawVideoFrame = new ffmpeg.Frame()
const yuvFrame = new ffmpeg.Frame()
yuvFrame.width = rawVideoDecoder.width
yuvFrame.height = rawVideoDecoder.height
yuvFrame.pixelFormat = ffmpeg.constants.pixelFormats.YUV420P
yuvFrame.alloc()

const rgbFrame = new ffmpeg.Frame()
rgbFrame.width = rawVideoDecoder.width
rgbFrame.height = rawVideoDecoder.height
rgbFrame.pixelFormat = ffmpeg.constants.pixelFormats.RGB24
rgbFrame.alloc()

const rgbImage = new ffmpeg.Image(
  ffmpeg.constants.pixelFormats.RGB24,
  rgbFrame.width,
  rgbFrame.height
)
rgbImage.fill(rgbFrame)

const toYUV = new ffmpeg.Scaler(
  rawVideoDecoder.pixelFormat,
  rawVideoDecoder.width,
  rawVideoDecoder.height,
  ffmpeg.constants.pixelFormats.YUV420P,
  yuvFrame.width,
  yuvFrame.height
)

const toRGB = new ffmpeg.Scaler(
  ffmpeg.constants.pixelFormats.YUV420P,
  rawVideoDecoder.width,
  rawVideoDecoder.height,
  ffmpeg.constants.pixelFormats.RGB24,
  rgbFrame.width,
  rgbFrame.height
)

const playback = new Playback(rawVideoDecoder.width, rawVideoDecoder.height)

function processVideo(packet) {
  rawVideoDecoder.sendPacket(packet)
  packet.unref()

  while (rawVideoDecoder.receiveFrame(rawVideoFrame)) {
    toYUV.scale(rawVideoFrame, yuvFrame)
    h264Encoder.sendFrame(yuvFrame)

    while (h264Encoder.receivePacket(packet)) {
      decodeAndRender(packet.data)
      packet.unref()
    }
  }
}

function processAudio(packet) {
  const floatSamples = new Float32Array(
    packet.data.buffer,
    packet.data.byteOffset,
    packet.data.length / 4
  )

  const s16Length = floatSamples.length * 2 * 2 // samples * channels * bytes
  const s16ArrayBuffer = new ArrayBuffer(s16Length)
  const s16View = new Int16Array(s16ArrayBuffer)

  for (let i = 0; i < floatSamples.length; i++) {
    const sample = Math.round(
      Math.max(-1, Math.min(1, floatSamples[i] * 3)) * 32767
    )
    s16View[i * 2] = sample // left
    s16View[i * 2 + 1] = sample // right
  }

  sdlAudioStream.put(s16ArrayBuffer, 0, s16Length)

  packet.unref()
}

function decodeAndRender(encodedData) {
  const packet = new ffmpeg.Packet(encodedData)
  h264Decoder.sendPacket(packet)
  packet.destroy()

  const decodedFrame = new ffmpeg.Frame()
  while (h264Decoder.receiveFrame(decodedFrame)) {
    toRGB.scale(decodedFrame, rgbFrame)
    playback.render(rgbImage.data, rgbImage.lineSize())
  }
  decodedFrame.destroy()
}

function readPackets() {
  let packet = new ffmpeg.Packet()

  const processNextPacket = () => {
    if (inputFormat.readFrame(packet)) {
      if (packet.streamIndex === audioStreamIndex) {
        processAudio(packet)
      } else if (packet.streamIndex === videoStreamIndex) {
        processVideo(packet)
      }

      packet = new ffmpeg.Packet()
    }

    setImmediate(processNextPacket)
  }

  processNextPacket()
}

setInterval(() => {
  let event
  while ((event = playback.poll())) {
    if (event.type === sdl.constants.SDL_EVENT_QUIT) {
      cleanup()
      Bare.exit(0)
    }
  }
}, 16)

readPackets()

function cleanup() {
  playback.destroy()
  audioDevice.destroy()
  sdlAudioStream.destroy()
}
