const sdl = require('..')
const { writeWAVFile } = require('../test/helpers')

const [recordingDeviceName] = Bare.argv.slice(2)

const mic = sdl.AudioDevice.getRecordingDevice({
  name: recordingDeviceName
})

console.log('mic', mic.toJSON())

console.log('Recording for 5 seconds...')

const targetSpec = {
  format: sdl.constants.SDL_AUDIO_F32,
  channels: 1,
  freq: 44100
}

const inputStream = new sdl.AudioStream(mic.spec, targetSpec)

mic.bindStream(inputStream)

const recordInterval = setInterval(() => {
  if (inputStream.available > 0) {
    const buffer = Buffer.allocUnsafe(inputStream.available)
    const bytesRead = inputStream.get(buffer.buffer)
    if (bytesRead > 0) {
      chunks.push(buffer.subarray(0, bytesRead))
      console.log(`Read ${bytesRead} bytes`)
    }
  }
}, 100)

const chunks = []

setTimeout(() => {
  clearInterval(recordInterval)
  mic.destroy()

  const audioData = Buffer.concat(chunks)
  writeWAVFile('recording.wav', audioData, targetSpec)
}, 5000)
