const test = require('brittle')
const { AudioStream, AudioDevice, constants } = require('..')

test('audio stream basics', function (t) {
  const stream = new AudioStream(
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: constants.SDL_AUDIO_S16, channels: 2, freq: 48000 }
  )

  t.ok(stream, 'stream created successfully')

  stream.destroy()
  t.pass('stream destroyed successfully')
})

test('audio stream put/get/clear', function (t) {
  const stream = new AudioStream(
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  // sine wave!
  const sampleRate = 44100
  const frequency = 440
  const duration = 0.1
  const samples = Math.floor(sampleRate * duration)
  const buffer = new Float32Array(samples * 2)

  for (let i = 0; i < samples; i++) {
    const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.5
    buffer[i * 2] = sample // left channel
    buffer[i * 2 + 1] = sample // right channel
  }

  const result = stream.put(buffer.buffer)
  t.ok(result, 'successfully put audio data')

  const available = stream.available
  t.ok(available > 0, 'stream has available data')

  const outputBuffer = new ArrayBuffer(available)
  const bytesRead = stream.get(outputBuffer)
  t.ok(bytesRead > 0, 'successfully got audio data')

  stream.clear()
  t.is(stream.available, 0, 'stream cleared successfully')

  stream.destroy()
})

test('audio stream round-trip', function (t) {
  const stream = new AudioStream(
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  const samples = 1024
  const input = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    input[i] = Math.sin(i * 0.1)
  }

  stream.put(input.buffer)

  const output = new ArrayBuffer(input.buffer.byteLength)
  const bytesRead = stream.get(output)

  t.is(bytesRead, input.buffer.byteLength, 'read expected number of bytes')

  const outputFloat = new Float32Array(output)
  for (let i = 0; i < samples; i++) {
    t.is(outputFloat[i], input[i], `sample ${i} matches`)
  }

  stream.destroy()
})

test('audio device basics', function (t) {
  const device = new AudioDevice(constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, {
    format: constants.SDL_AUDIO_F32,
    channels: 2,
    freq: 48000
  })

  t.ok(device, 'device created successfully')

  device.destroy()
  t.pass('device destroyed successfully')
})

test('audio stream and device binding', function (t) {
  const device = new AudioDevice(constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, {
    format: constants.SDL_AUDIO_F32,
    channels: 2,
    freq: 48000
  })

  const stream = new AudioStream(
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 48000 },
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 48000 }
  )

  const bindResult = device.bind(stream)
  t.ok(bindResult, 'stream bound to device successfully')

  const boundDevice = stream.device
  t.ok(boundDevice !== 0, 'stream reports bound device')

  device.unbind(stream)
  t.is(stream.device, 0, 'stream unbound successfully')

  stream.destroy()
  device.destroy()
})

test('audio device pause/resume', function (t) {
  const device = new AudioDevice(constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, {
    format: constants.SDL_AUDIO_F32,
    channels: 2,
    freq: 48000
  })

  const pauseResult = device.pause()
  t.ok(pauseResult, 'device paused successfully')

  const resumeResult = device.resume()
  t.ok(resumeResult, 'device resumed successfully')

  device.destroy()
})

test('audio stream flush', function (t) {
  const stream = new AudioStream(
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  const buffer = new Float32Array(1024)
  stream.put(buffer.buffer)

  const flushResult = stream.flush()
  t.ok(flushResult, 'stream flushed successfully')

  stream.destroy()
})
