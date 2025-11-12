const fs = require('bare-fs')
const { Readable } = require('streamx')
const sdl = require('../..')
const { constants } = sdl

let hasRecordingDevice
try {
  hasRecordingDevice = sdl.AudioDevice.recordingDevices().length > 0
} catch (error) {
  if (!error.message.includes('No default recording device')) {
    throw error
  }
  hasRecordingDevice = false
}

let hasPlaybackDevice
try {
  hasPlaybackDevice = sdl.AudioDevice.playbackDevices().length > 0
} catch (error) {
  if (!error.message.includes('No default playback device')) {
    throw error
  }
  hasPlaybackDevice = false
}

/**
 * Gets the number of bytes per sample for a given audio format.
 * @param {number} format - The audio format constant.
 * @returns {number} The number of bytes per sample.
 * @throws {Error} If the format is unsupported.
 */
function getBytesPerSample(format) {
  switch (format) {
    case constants.SDL_AUDIO_F32:
      return 4
    case constants.SDL_AUDIO_S16:
      return 2
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Generates a single sample for a tone at a given time.
 * @param {number} frequency - The frequency of the tone in Hz.
 * @param {number} amplitude - The amplitude of the tone (0.0 to 1.0).
 * @param {number} seconds - The time in seconds.
 * @returns {number} The sample value.
 */
function generateSample(frequency, amplitude, seconds) {
  return Math.sin(2 * Math.PI * frequency * seconds) * amplitude
}

/**
 * Writes a sample to a buffer at a given offset for a specific format.
 * @param {Buffer} buffer - The buffer to write to.
 * @param {number} sample - The sample value.
 * @param {number} offset - The offset in the buffer.
 * @param {number} format - The audio format.
 */
function writeSampleToBuffer(buffer, sample, offset, format) {
  switch (format) {
    case constants.SDL_AUDIO_F32: {
      buffer.writeFloatLE(sample, offset)
      break
    }
    case constants.SDL_AUDIO_S16: {
      const intSample = Math.round(sample * 32767)
      buffer.writeInt16LE(intSample, offset)
      break
    }
  }
}

/**
 * Generates a tone buffer with the specified frequency, amplitude, duration, and audio format.
 * @param {Object} options - The options for generating the tone.
 * @param {number} options.frequency - The frequency of the tone in Hz.
 * @param {number} options.amplitude - The amplitude of the tone (0.0 to 1.0).
 * @param {number} options.seconds - The duration of the tone in seconds.
 * @param {Object} options.spec - The audio format object containing frequency and channel info.
 * @param {number} options.spec.format - The audio format (e.g., SDL_AUDIO_F32).
 * @param {number} options.spec.freq - The sample rate of the audio.
 * @param {number} options.spec.channels - The number of audio channels.
 * @returns {Buffer} A buffer containing the generated tone data.
 */
function generateTone({ frequency, amplitude, seconds, spec }) {
  const samples = spec.freq * seconds
  const bytesPerSample = getBytesPerSample(spec.format)
  const audioData = Buffer.alloc(samples * bytesPerSample * spec.channels)

  for (let i = 0; i < samples; i++) {
    const t = i / spec.freq
    const sample = generateSample(frequency, amplitude, t)

    for (let channel = 0; channel < spec.channels; channel++) {
      const offset = (i * spec.channels + channel) * bytesPerSample
      writeSampleToBuffer(audioData, sample, offset, spec.format)
    }
  }

  return audioData
}

/**
 * Creates a readable stream that generates a continuous tone.
 * @param {Object} options - The options for generating the tone.
 * @param {number} options.frequency - The frequency of the tone in Hz.
 * @param {number} options.amplitude - The amplitude of the tone (0.0 to 1.0).
 * @param {Object} options.spec - The audio format object.
 * @param {number} options.spec.format - The audio format (e.g., SDL_AUDIO_F32).
 * @param {number} options.spec.freq - The sample rate of the audio.
 * @param {number} options.spec.channels - The number of audio channels.
 * @param {number} [options.seconds=0.05] - Duration of each chunk in seconds.
 * @returns {Readable} A readable stream that emits tone data chunks.
 */
function createToneStream({ frequency, amplitude, spec, seconds = 0.5 }) {
  let sampleIndex = 0
  const samplesPerChunk = Math.floor(spec.freq * seconds)
  const bytesPerSample = getBytesPerSample(spec.format)

  return new Readable({
    read(cb) {
      if (Readable.isBackpressured(this)) {
        cb()
        return
      }

      const audioData = Buffer.alloc(samplesPerChunk * bytesPerSample * spec.channels)

      for (let i = 0; i < samplesPerChunk; i++) {
        const t = (sampleIndex + i) / spec.freq
        const sample = generateSample(frequency, amplitude, t)

        for (let channel = 0; channel < spec.channels; channel++) {
          const offset = (i * spec.channels + channel) * bytesPerSample
          writeSampleToBuffer(audioData, sample, offset, spec.format)
        }
      }

      sampleIndex += samplesPerChunk
      this.push(audioData)
      cb()
    },

    destroy(err, cb) {
      if (cb) cb(err)
    }
  })
}

/**
 * Calculates the frequency of a sine wave from audio data.
 * @param {Buffer} audioData - The audio data buffer.
 * @param {number} sampleRate - The sample rate of the audio.
 * @param {number} format - The audio format constant.
 * @returns {number} The estimated frequency in Hz.
 */
function calculateSineWaveHz(audioData, sampleRate, format) {
  const samples = []
  const bytesPerSample = getBytesPerSample(format)

  for (let i = 0; i < audioData.length; i += bytesPerSample) {
    switch (format) {
      case constants.SDL_AUDIO_F32: {
        samples.push(audioData.readFloatLE(i))
        break
      }
      case constants.SDL_AUDIO_S16: {
        samples.push(audioData.readInt16LE(i) / 32767)
        break
      }
    }
  }

  let crossings = 0
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i - 1] < 0 && samples[i] >= 0) || (samples[i - 1] >= 0 && samples[i] < 0)) {
      crossings++
    }
  }

  const cycles = crossings / 2
  const duration = samples.length / sampleRate
  return cycles / duration
}

/**
 * Writes audio data to a WAV file.
 * @param {string} filename - The output filename.
 * @param {Buffer} audioData - The audio data buffer.
 * @param {Object} spec - The audio format specification.
 * @param {number} spec.format - The audio format constant.
 * @param {number} spec.channels - The number of channels.
 * @param {number} spec.freq - The sample rate.
 */
function writeWAVFile(filename, audioData, spec) {
  const bytesPerSample = spec.format === constants.SDL_AUDIO_F32 ? 4 : 2
  const dataSize = audioData.length

  const buffer = Buffer.alloc(44 + dataSize) // 44 byte header + data

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4) // file size - 8
  buffer.write('WAVE', 8)

  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // fmt chunk size
  buffer.writeUInt16LE(spec.format === constants.SDL_AUDIO_F32 ? 3 : 1, 20) // 3=float, 1=PCM
  buffer.writeUInt16LE(spec.channels, 22)
  buffer.writeUInt32LE(spec.freq, 24) // sample rate
  buffer.writeUInt32LE(spec.freq * spec.channels * bytesPerSample, 28) // Byte rate
  buffer.writeUInt16LE(spec.channels * bytesPerSample, 32)
  buffer.writeUInt16LE(bytesPerSample * 8, 34) // bits per sample

  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  audioData.copy(buffer, 44)

  fs.writeFileSync(filename, buffer)
}

module.exports = {
  hasRecordingDevice,
  hasPlaybackDevice,
  getBytesPerSample,
  generateSample,
  writeSampleToBuffer,
  generateTone,
  createToneStream,
  calculateSineWaveHz,
  writeWAVFile
}
