const fs = require('bare-fs')
const sdl = require('bare-sdl')
const ffmpeg = require('bare-ffmpeg')

const [recordingDeviceName] = Bare.argv.slice(2)

const mic = sdl.AudioDevice.getRecordingDevice({
  name: recordingDeviceName
})

console.log(`Recording from "${mic.name}" for 5 seconds...`)
console.log(`Mic spec: ${mic.spec.freq}Hz, ${mic.spec.channels} channels`)

const outputFile = fs.createWriteStream('recording.opus')
let totalBytesWritten = 0

const io = new ffmpeg.IOContext(4096, {
  onwrite: (buffer) => {
    const chunk = Buffer.from(buffer)
    outputFile.write(chunk)
    totalBytesWritten += chunk.length
    return buffer.length
  }
})

const outFormat = new ffmpeg.OutputFormat('ogg')
const outContext = new ffmpeg.OutputFormatContext(outFormat, io)
const outputStream = outContext.createStream()
const opusCodec = ffmpeg.Codec.for(ffmpeg.constants.codecs.OPUS)
const encoder = new ffmpeg.CodecContext(opusCodec.encoder)

encoder.sampleRate = 48000
encoder.channelLayout = ffmpeg.constants.channelLayouts.MONO
encoder.sampleFormat = ffmpeg.constants.sampleFormats.FLT
encoder.timeBase = new ffmpeg.Rational(1, encoder.sampleRate)
encoder.open()

outputStream.codecParameters.fromContext(encoder)
outputStream.timeBase = encoder.timeBase
outContext.writeHeader()

const resampler = new ffmpeg.Resampler(
  mic.spec.freq,
  mic.spec.channels === 1
    ? ffmpeg.constants.channelLayouts.MONO
    : ffmpeg.constants.channelLayouts.STEREO,
  ffmpeg.constants.sampleFormats.FLT,
  encoder.sampleRate,
  encoder.channelLayout,
  encoder.sampleFormat
)

const frameSize = 960
const inputFrame = new ffmpeg.Frame()
inputFrame.nbSamples = Math.floor(
  (frameSize * mic.spec.freq) / encoder.sampleRate
)
inputFrame.channelLayout =
  mic.spec.channels === 1
    ? ffmpeg.constants.channelLayouts.MONO
    : ffmpeg.constants.channelLayouts.STEREO
inputFrame.format = ffmpeg.constants.sampleFormats.FLT
inputFrame.sampleRate = mic.spec.freq

const outputFrame = new ffmpeg.Frame()
outputFrame.nbSamples = frameSize
outputFrame.channelLayout = encoder.channelLayout
outputFrame.format = encoder.sampleFormat
outputFrame.sampleRate = encoder.sampleRate

const inputSamples = new ffmpeg.Samples(
  inputFrame.format,
  inputFrame.channelLayout.nbChannels,
  inputFrame.nbSamples
)
inputSamples.fill(inputFrame)

const outputSamples = new ffmpeg.Samples(
  outputFrame.format,
  outputFrame.channelLayout.nbChannels,
  outputFrame.nbSamples
)
outputSamples.fill(outputFrame)

let audioBuffer = Buffer.alloc(0)
const bytesPerSample = 4
const channelCount = mic.spec.channels
const bytesNeeded = inputFrame.nbSamples * bytesPerSample * channelCount

const targetSpec = {
  format: sdl.constants.SDL_AUDIO_F32,
  channels: mic.spec.channels,
  freq: mic.spec.freq
}

const audioStream = new sdl.AudioStream(mic.spec, targetSpec, {
  put(added_bytes, total_bytes) {
    const available = audioStream.available
    if (available === 0) {
      return
    }

    const pcmBuffer = Buffer.allocUnsafe(available)
    const bytesRead = audioStream.get(pcmBuffer)

    if (bytesRead > 0) {
      audioBuffer = Buffer.concat([
        audioBuffer,
        pcmBuffer.subarray(0, bytesRead)
      ])

      while (audioBuffer.length >= bytesNeeded) {
        const frameData = audioBuffer.subarray(0, bytesNeeded)
        audioBuffer = audioBuffer.subarray(bytesNeeded)
        frameData.copy(inputSamples.data)
        inputSamples.fill(inputFrame)
        const samplesConverted = resampler.convert(inputFrame, outputFrame)

        if (samplesConverted > 0) {
          if (encoder.sendFrame(outputFrame)) {
            const packet = new ffmpeg.Packet()
            while (encoder.receivePacket(packet)) {
              packet.streamIndex = outputStream.index
              outContext.writeFrame(packet)
              packet.unref()
            }
          }
        }
      }
    }
  }
})

mic.bindStream(audioStream)

setTimeout(() => {
  console.log('Finished recording.')

  mic.unbindStream(audioStream)

  while (resampler.flush(outputFrame) > 0) {
    if (encoder.sendFrame(outputFrame)) {
      const packet = new ffmpeg.Packet()
      while (encoder.receivePacket(packet)) {
        packet.streamIndex = outputStream.index
        outContext.writeFrame(packet)
        packet.unref()
      }
    }
  }

  encoder.sendFrame(null)
  const packet = new ffmpeg.Packet()
  while (encoder.receivePacket(packet)) {
    packet.streamIndex = outputStream.index
    outContext.writeFrame(packet)
    packet.unref()
  }

  outContext.writeTrailer()

  inputFrame.destroy()
  outputFrame.destroy()
  resampler.destroy()
  encoder.destroy()
  outContext.destroy()
  mic.destroy()
  audioStream.destroy()

  outputFile.end(() => {
    console.log(`Saved ${totalBytesWritten} bytes to recording.opus`)
  })
}, 5000)
