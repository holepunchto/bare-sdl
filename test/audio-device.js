const test = require('brittle')
const sdl = require('..')

test('sdl.AudioDevice - playbackDeviceFormats', (t) => {
  const formats = sdl.AudioDevice.playbackDeviceFormats()
  t.ok(Array.isArray(formats), 'returns an array')
})

test('sdl.AudioDevice - recordingDeviceFormats', (t) => {
  const formats = sdl.AudioDevice.recordingDeviceFormats()
  t.ok(Array.isArray(formats), 'returns an array')
})

test('sdl.AudioDevice - playbackDevices', (t) => {
  const devices = sdl.AudioDevice.playbackDevices()
  t.ok(Array.isArray(devices), 'returns an array')
})

test('sdl.AudioDevice - recordingDevices', (t) => {
  const devices = sdl.AudioDevice.recordingDevices()
  t.ok(Array.isArray(devices), 'returns an array')
})

test('sdl.AudioDevice - defaultRecordingDevice', (t) => {
  const device = sdl.AudioDevice.defaultRecordingDevice()
  t.ok(device instanceof sdl.AudioDevice, 'returns sdl.AudioDevice instance')
})

test('sdl.AudioDevice - defaultPlaybackDevice', (t) => {
  const device = sdl.AudioDevice.defaultPlaybackDevice()
  t.ok(device instanceof sdl.AudioDevice, 'returns sdl.AudioDevice instance')
})

test('sdl.AudioDevice - properties', (t) => {
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
  using device = sdl.AudioDevice.defaultPlaybackDevice()
  device.gain = 0.5
  t.is(device.gain, 0.5, 'sets gain correctly')
})

test('sdl.AudioDevice - pause/resume', (t) => {
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
