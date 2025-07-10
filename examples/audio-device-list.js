const sdl = require('..')

async function main() {
  const recording = await sdl.AudioDevice.recordingDevices()
  const playback = await sdl.AudioDevice.playbackDevices()

  console.log('\n# Recording devices:\n')
  for (const device of recording) {
    printDevice(device)
  }

  console.log('\n# Playback devices:\n')
  for (const device of recording) {
    printDevice(device)
  }
}

function printDevice(device) {
  console.log('Device:', device.name)
  console.log('ID:', device.id)
  console.log('Sample frames:', device.format.sampleFrames)
  console.log('Spec:')
  console.log('  Format:', device.format.spec.format)
  console.log('  Channels:', device.format.spec.channels)
  console.log('  Freq:', device.format.spec.freq)
  console.log()
}

main().catch(console.error)
