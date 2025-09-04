const test = require('brittle')
const sdl = require('..')
const { hasRecordingDevice, hasPlaybackDevice } = require('./helpers/index')

test('sdl.AudioDevice - defaultRecordingDevice', (t) => {
  if (!hasRecordingDevice) {
    t.pass('No default recording device')
    return
  }

  const device = sdl.AudioDevice.defaultPlaybackDevice()
  t.ok(device instanceof sdl.AudioDevice, 'returns sdl.AudioDevice instance')
})

test('sdl.AudioDevice - defaultPlaybackDevice', (t) => {
  if (!hasPlaybackDevice) {
    t.pass('No default playback device')
    return
  }

  const device = sdl.AudioDevice.defaultPlaybackDevice()
  t.ok(device instanceof sdl.AudioDevice, 'returns sdl.AudioDevice instance')
})

test('sdl.AudioDevice - properties', (t) => {
  if (!hasPlaybackDevice) {
    t.pass('No default playback device')
    return
  }

  const spec = { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 48000 }
  using device = sdl.AudioDevice.defaultPlaybackDevice(spec)

  t.ok(typeof device.name === 'string')
  t.ok(device.format instanceof sdl.AudioDevice.AudioDeviceFormat)
  t.is(typeof device.isPlaybackDevice, 'boolean')
  t.is(typeof device.isPhysicalDevice, 'boolean')
  t.is(typeof device.isPaused, 'boolean')
  t.is(typeof device.gain, 'number')
})

test('sdl.AudioDevice - set gain', (t) => {
  if (!hasPlaybackDevice) {
    t.pass('No default playback device')
    return
  }

  using device = sdl.AudioDevice.defaultPlaybackDevice()
  device.gain = 0.5
  t.is(device.gain, 0.5, 'sets gain correctly')
})

test('sdl.AudioDevice - pause/resume', (t) => {
  if (!hasPlaybackDevice) {
    t.pass('No default playback device')
    return
  }

  const device = sdl.AudioDevice.defaultPlaybackDevice()

  {
    const result = device.pause()
    t.ok(typeof result === 'boolean')
  }

  {
    const result = device.resume()
    t.ok(typeof result === 'boolean', 'returns boolean')
  }
})

test('SDLAudioSpec', (t) => {
  if (!hasPlaybackDevice) {
    t.pass('No default playback device')
    return
  }

  using device = sdl.AudioDevice.defaultPlaybackDevice()
  const format = new sdl.AudioDevice.AudioDeviceFormat(device.id)
  const spec = new sdl.AudioDevice.AudioSpec(format)
  t.ok(spec && spec._format)
})

test('sdl.AudioDeviceFormat', (t) => {
  const deviceId = 1
  const format = new sdl.AudioDevice.AudioDeviceFormat(deviceId)

  t.ok(format._handle)

  const valid = format.valid
  t.ok(typeof valid === 'boolean', 'returns boolean')

  const sampleFrames = format.sampleFrames
  t.ok(typeof sampleFrames === 'number', 'returns number')

  const spec = format.spec
  t.ok(spec instanceof sdl.AudioDevice.AudioSpec, 'returns AudioSpec instance')
})
