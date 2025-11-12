const sdl = require('bare-sdl')

const cameras = sdl.Camera.getCameras()

if (cameras.length === 0) {
  console.log('No cameras found')
  Bare.exit()
}

cameras.forEach((deviceId, index) => {
  console.log(`Camera ${index + 1}:`)

  const name = sdl.Camera.getCameraName(deviceId)
  console.log(`  Name: ${name || 'Unknown'}`)
  console.log(`  Device ID: ${deviceId}`)

  const position = sdl.Camera.getCameraPosition(deviceId)
  let positionDescription = 'Unknown'
  if (position === sdl.constants.SDL_CAMERA_POSITION_FRONT_FACING) {
    positionDescription = 'Front-facing (selfie camera)'
  } else if (position === sdl.constants.SDL_CAMERA_POSITION_BACK_FACING) {
    positionDescription = 'Back-facing (main camera)'
  }
  console.log(`  Position: ${positionDescription}`)

  const formats = sdl.Camera.getSupportedFormats(deviceId)
  console.log(`  Supported formats: ${formats.length}`)

  if (formats.length > 0) {
    const resolutions = new Map()

    for (const format of formats) {
      const key = `${format.width}x${format.height}`
      if (!resolutions.has(key)) {
        resolutions.set(key, [])
      }

      const fps = format.framerateNumerator / format.framerateDenominator
      resolutions.get(key).push({
        fps,
        format: format.format,
        colorspace: format.colorspace
      })
    }

    console.log('\n  Available resolutions:')
    const sortedResolutions = Array.from(resolutions.entries()).sort((a, b) => {
      const [w1, h1] = a[0].split('x').map(Number)
      const [w2, h2] = b[0].split('x').map(Number)
      return w2 * h2 - w1 * h1
    })

    sortedResolutions.slice(0, 5).forEach(([resolution, configs]) => {
      const fpsValues = configs.map((c) => c.fps).filter((v, i, a) => a.indexOf(v) === i)
      const fpsStr = fpsValues
        .sort((a, b) => b - a)
        .map((f) => `${f}`)
        .join(', ')
      console.log(`    - ${resolution} @ ${fpsStr} fps`)
    })

    if (sortedResolutions.length > 5) {
      console.log(`    ... and ${sortedResolutions.length - 5} more resolutions`)
    }
  }

  console.log()
})
