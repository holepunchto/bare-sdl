const test = require('brittle')
const sdl = require('..')
const {
  hasRecordingDevice,
  hasPlaybackDevice,
  generateTone
} = require('./helpers/index')

test('it should expose an AudioStream class', function (t) {
  const stream = new sdl.AudioStream(
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: sdl.constants.SDL_AUDIO_S16, channels: 2, freq: 48000 }
  )
  t.teardown(() => stream.destroy())

  t.ok(stream, 'stream created successfully')
  t.ok(stream._handle, 'stream has handle')
  t.is(
    stream.source.format,
    sdl.constants.SDL_AUDIO_F32,
    'source format stored'
  )
  t.is(
    stream.target.format,
    sdl.constants.SDL_AUDIO_S16,
    'target format stored'
  )
})

test('AudioStream should support put/get/clear operations', function (t) {
  const stream = new sdl.AudioStream(
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  t.teardown(() => stream.destroy())

  const spec = { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  const audioData = generateTone({
    frequency: 440,
    amplitude: 0.5,
    seconds: 0.1,
    spec
  })

  const result = stream.put(audioData.buffer)
  t.ok(result, 'successfully put audio data')

  const available = stream.available
  t.ok(available > 0, 'stream has available data')

  const outputBuffer = new ArrayBuffer(available)
  const bytesRead = stream.get(outputBuffer)
  t.ok(bytesRead > 0, 'successfully got audio data')

  stream.clear()
  t.is(stream.available, 0, 'stream cleared successfully')
})

test('AudioStream should handle round-trip data correctly', function (t) {
  const stream = new sdl.AudioStream(
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  t.teardown(() => stream.destroy())

  const samples = 1024
  const input = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    input[i] = Math.sin(i * 0.1)
  }

  stream.put(input.buffer)

  const output = new ArrayBuffer(input.buffer.byteLength)
  const outputFloat = new Float32Array(output)
  const bytesRead = stream.get(output)

  t.is(bytesRead, input.buffer.byteLength, 'read expected number of bytes')

  let count = 0
  for (let i = 0; i < samples; i++) {
    if (Math.abs(outputFloat[i] - input[i]) < 0.0001) {
      count++
    }
  }

  t.is(count, samples, `all ${samples} samples match`)
})

test('AudioStream should expose device property', function (t) {
  const stream = new sdl.AudioStream(
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 48000 },
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 48000 }
  )

  t.teardown(() => stream.destroy())

  t.is(stream.device, 0, 'unbound stream reports device as 0')
})

test('AudioStream should support flush operation', function (t) {
  const stream = new sdl.AudioStream(
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  t.teardown(() => stream.destroy())

  const buffer = new Float32Array(1024)
  stream.put(buffer.buffer)

  const flushResult = stream.flush()
  t.ok(flushResult, 'stream flushed successfully')
})

test('AudioStream should expose resume method', function (t) {
  const stream = new sdl.AudioStream(
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  t.teardown(() => stream.destroy())

  const result = stream.resume()
  t.ok(typeof result === 'boolean', 'resume returns boolean')
})

test('AudioStream playback callbacks should fire when bound to device', function (t) {
  if (!hasPlaybackDevice) {
    t.pass('Skipped - no playback device available')
    return
  }

  t.plan(3)

  let completed = false
  const device = sdl.AudioDevice.defaultPlaybackDevice({
    format: sdl.constants.SDL_AUDIO_F32,
    channels: 2,
    freq: 44100
  })

  const stream = new sdl.AudioStream(device.spec, device.spec, {
    get(needed, total) {
      if (completed) return
      completed = true

      t.ok(typeof needed === 'number', 'get callback receives needed bytes')
      t.ok(typeof total === 'number', 'get callback receives total bytes')
      t.ok(needed > 0, 'needed bytes is positive')

      const silence = Buffer.alloc(needed)
      stream.put(silence)

      device.unbindStream(stream)
    }
  })

  t.teardown(() => {
    stream.destroy()
    device.destroy()
  })

  device.bindStream(stream)
})

test('AudioStream recording callbacks should fire when bound to device', function (t) {
  if (!hasRecordingDevice) {
    t.pass('Skipped - no recording device available')
    return
  }

  t.plan(3)

  let completed = false
  const device = sdl.AudioDevice.defaultRecordingDevice({
    format: sdl.constants.SDL_AUDIO_F32,
    channels: 1,
    freq: 44100
  })

  const stream = new sdl.AudioStream(device.spec, device.spec, {
    put(added, total) {
      if (completed) return
      completed = true

      t.ok(typeof added === 'number', 'put callback receives added bytes')
      t.ok(typeof total === 'number', 'put callback receives total bytes')
      t.ok(added > 0, 'added bytes is positive')

      const buffer = Buffer.allocUnsafe(added)
      stream.get(buffer)

      device.unbindStream(stream)
    }
  })

  t.teardown(() => {
    stream.destroy()
    device.destroy()
  })

  device.bindStream(stream)
})

test('AudioStream should support both Buffer and ArrayBuffer', function (t) {
  const stream = new sdl.AudioStream(
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  t.teardown(() => stream.destroy())

  const nodeBuffer = Buffer.alloc(1024)
  const putResult = stream.put(nodeBuffer)
  t.ok(putResult, 'put works with Node.js Buffer')

  const getBuffer = Buffer.allocUnsafe(stream.available)
  const bytesRead = stream.get(getBuffer)
  t.ok(bytesRead > 0, 'get works with Node.js Buffer')

  const arrayBuffer = new ArrayBuffer(512)
  const putResult2 = stream.put(arrayBuffer)
  t.ok(putResult2, 'put works with ArrayBuffer')
})

test('AudioStream should handle destroyed state gracefully', function (t) {
  const stream = new sdl.AudioStream(
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 },
    { format: sdl.constants.SDL_AUDIO_F32, channels: 2, freq: 44100 }
  )

  stream.destroy()

  t.is(stream.put(Buffer.alloc(100)), false, 'put returns false when destroyed')
  t.is(stream.get(Buffer.alloc(100)), 0, 'get returns 0 when destroyed')
  t.is(stream.available, 0, 'available returns 0 when destroyed')
  t.is(stream.device, 0, 'device returns 0 when destroyed')
  t.is(stream.flush(), false, 'flush returns false when destroyed')
  t.is(stream.clear(), false, 'clear returns false when destroyed')
  t.is(stream.resume(), false, 'resume returns false when destroyed')

  t.execution(() => {
    stream.destroy()
  })
})

test('AudioStream device property should update when bound', function (t) {
  if (!hasPlaybackDevice) {
    t.pass('Skipped - no playback device available')
    return
  }

  const device = sdl.AudioDevice.defaultPlaybackDevice({
    format: sdl.constants.SDL_AUDIO_F32,
    channels: 2,
    freq: 44100
  })

  const stream = new sdl.AudioStream(device.spec, device.spec)

  t.teardown(() => {
    device.destroy()
    stream.destroy()
  })

  t.is(stream.device, 0, 'unbound stream reports device as 0')

  device.bindStream(stream)
  t.ok(stream.device !== 0, 'bound stream reports non-zero device')
  t.is(stream.device, device.id, 'stream device matches bound device id')

  device.unbindStream(stream)
  t.is(stream.device, 0, 'unbound stream reports device as 0 again')
})

test('AudioStream should support continuous playback', function (t) {
  if (!hasPlaybackDevice) {
    t.pass('Skipped - no playback device available')
    return
  }

  t.plan(2)

  let count = 0
  const limit = 3
  const frequency = 440
  const sampleRate = 44100

  const device = sdl.AudioDevice.defaultPlaybackDevice({
    format: sdl.constants.SDL_AUDIO_F32,
    channels: 2,
    freq: sampleRate
  })

  const stream = new sdl.AudioStream(device.spec, device.spec, {
    get(needed) {
      count++

      const samples = needed / 8
      const buffer = new Float32Array(samples * 2)

      for (let i = 0; i < samples; i++) {
        const sample =
          Math.sin(
            (2 * Math.PI * frequency * (i + count * samples)) / sampleRate
          ) * 0.1
        buffer[i * 2] = sample
        buffer[i * 2 + 1] = sample
      }

      stream.put(buffer.buffer)

      if (count >= limit) {
        t.ok(count > 0, 'callback was called')
        t.ok(
          count > 1,
          'callback was called multiple times for continuous playback'
        )

        device.unbindStream(stream)
      }
    }
  })

  t.teardown(() => {
    stream.destroy()
    device.destroy()
  })

  device.bindStream(stream)
})
