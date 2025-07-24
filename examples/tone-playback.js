const sdl = require('..')
const { generateTone } = require('../test/helpers')

const { constants } = sdl

const sourceAudioSpec = {
  freq: 44100,
  format: constants.SDL_AUDIO_F32,
  channels: 1
}

const device = sdl.AudioDevice.defaultPlaybackDevice()
const stream = new sdl.AudioStream(sourceAudioSpec, device.spec)

device.bindStream(stream)

const audioData = generateTone({
  frequency: 440,
  amplitude: 0.1,
  seconds: 1,
  spec: device.spec
})

stream.put(audioData)

setTimeout(() => {
  stream.destroy()
  device.destroy()
}, 1500)
