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

test('sdl.AudioDevice - playbackDevices', async (t) => {
  const devices = await sdl.AudioDevice.playbackDevices()
  t.ok(Array.isArray(devices), 'returns an array')
})

test('sdl.AudioDevice - recordingDevices', async (t) => {
  const devices = await sdl.AudioDevice.recordingDevices()
  t.ok(Array.isArray(devices), 'returns an array')
})

test('sdl.AudioDevice - defaultRecordingDevice', async (t) => {
  const device = await sdl.AudioDevice.defaultRecordingDevice()
  t.ok(device instanceof sdl.AudioDevice, 'returns sdl.AudioDevice instance')
})

test('sdl.AudioDevice - defaultPlaybackDevice', async (t) => {
  const device = await sdl.AudioDevice.defaultPlaybackDevice()
  t.ok(device instanceof sdl.AudioDevice, 'returns sdl.AudioDevice instance')
})

test('sdl.AudioDevice - properties', async (t) => {
  const spec = { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 48000 }
  const device = await sdl.AudioDevice.defaultPlaybackDevice(spec)
  await device.ready()

  t.ok(typeof device.name === 'string')
  t.ok(device.format instanceof sdl.AudioDevice.AudioDeviceFormat)
  t.is(typeof device.isPlaybackDevice, 'boolean')
  t.is(typeof device.isPhysicalDevice, 'boolean')
  t.is(typeof device.isPaused, 'boolean')
  t.is(typeof device.gain, 'number')
})

test('sdl.AudioDevice - set gain', async (t) => {
  const device = await sdl.AudioDevice.defaultPlaybackDevice()
  await device.ready()
  device.gain = 0.5
  t.is(device.gain, 0.5, 'sets gain correctly')
})

test('sdl.AudioDevice - pause/resume', async (t) => {
  const device = await sdl.AudioDevice.defaultPlaybackDevice()
  await device.ready()
  {
    const result = device.pause()
    t.ok(typeof result === 'boolean')
  }

  {
    const result = device.resume()
    t.ok(typeof result === 'boolean', 'returns boolean')
  }
})

test('SDLAudioSpec', async (t) => {
  const device = await sdl.AudioDevice.defaultPlaybackDevice()
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
