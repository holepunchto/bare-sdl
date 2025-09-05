# bare-sdl

SDL bindings for Bare.

```
npm i bare-sdl
```

## API

### `Window`

The `Window` API provides functionality to create SDL windows.

```js
const window = new sdl.Window(title, width, height[, flags])
```

Parameters:

- `title` (`string`): The window title
- `width` (`number`): The window width in pixels
- `height` (`number`): The window height in pixels
- `flags` (`number`, optional): Window creation flags. Defaults to 0

Available flags are exposed through the `constants` object. Common flags include:

- `SDL_WINDOW_FULLSCREEN`: Fullscreen window
- `SDL_WINDOW_BORDERLESS`: Borderless window
- `SDL_WINDOW_RESIZABLE`: Resizable window
- `SDL_WINDOW_VULKAN`: Window usable with Vulkan
- `SDL_WINDOW_METAL`: Window usable with Metal

**Returns**: A new `sdl.Window` instance

#### Methods

##### `Window.destroy()`

Destroy `Window` and associated resources.

**Returns**: `void`

Example:

```js
const window = new sdl.Window('My Window', 800, 600)
window.destroy()
```

### `Renderer`

The `Renderer` API provides functionality to render graphics using SDL.

```js
const renderer = new sdl.Renderer(window)
```

Parameters:

- `window` (`sdl.Window`): The window instance to render to

**Returns**: A new `Renderer` instance

#### Methods

##### `Renderer.clear()`

Clears the renderer with the current draw color.

**Returns**: `boolean` indicating success

##### `Renderer.texture(texture)`

Renders a texture to the renderer.

Parameters:

- `texture` (`sdl.Texture`): The texture to render

**Returns**: `boolean` indicating success

##### `Renderer.present()`

Updates the screen with the rendered content.

**Returns**: `boolean` indicating success

##### `Renderer.destroy()`

Destroy `Renderer` and associated resources.

**Returns**: `void`

### `Texture`

The `Texture` API provides functionality to create and manage SDL textures.

```js
const texture = new sdl.Texture(renderer, width, height[, pixelFormat[, textureAccess]])
```

Parameters:

- `renderer` (`sdl.Renderer`): The renderer instance
- `width` (`number`): The texture width in pixels
- `height` (`number`): The texture height in pixels
- `pixelFormat` (`number`, optional): The pixel format. Defaults to `SDL_PIXELFORMAT_RGB24`
- `textureAccess` (`number`, optional): The texture access pattern. Defaults to `SDL_TEXTUREACCESS_STREAMING`

Available pixel formats and texture access flags are exposed through the `constants` object.

**Returns**: A new `Texture` instance

#### Methods

##### `Texture.update(buffer, pitch)`

Updates the texture with new pixel data.

Parameters:

- `buffer` (`Buffer`): The pixel data buffer
- `pitch` (`number`): The number of bytes per row

**Returns**: `boolean` indicating success

##### `Texture.destroy()`

Destroy `Texture` and associated resources.

**Returns**: `void`

### `Event`

The `Event` API provides functionality to handle SDL events.

```js
const event = new sdl.Event()
```

**Returns**: A new `Event` instance

#### Properties

##### `Event.type`

Gets the event type.

**Returns**: `number`

##### `Event.key`

Gets the keyboard event data.

**Returns**: `Event.Keyboard` instance

### `Event.Keyboard`

The `Event.Keyboard` API provides functionality to handle SDL keyboard events.

```js
const keyboardEvent = new sdl.Event.Keyboard([event])
```

Parameters:

- `event` (`sdl.Event`, optional): The parent event instance. If not provided, a new event will be created.

**Returns**: A new `Event.Keyboard` instance

#### Properties

##### `Event.Keyboard.scancode`

Gets the keyboard scancode.

**Returns**: `number`

### `Poller`

The `Poller` API provides functionality to poll for SDL events.

```js
const poller = new sdl.Poller()
```

**Returns**: A new `sdl.Poller` instance

#### Methods

##### `Poller.poll(event)`

Polls for events.

Parameters:

- `event` (`sdl.Event`): The event instance to store the polled event data

**Returns**: `boolean` indicating if an event was polled

### `AudioDevice`

The `AudioDevice` API provides functionality to manage SDL audio devices for playback and recording.

```js
const device = new sdl.AudioDevice(deviceId[, spec])
```

Parameters:

- `deviceId` (`number`): The audio device ID. Use `constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK` or `constants.SDL_AUDIO_DEVICE_DEFAULT_RECORDING` for defaults.
- `spec` (`object`, optional): Audio specification with the following properties:
  - `format` (`number`): Audio format (e.g., `constants.SDL_AUDIO_F32`)
  - `channels` (`number`): Number of audio channels (e.g., 2 for stereo)
  - `freq` (`number`): Sample rate in Hz (e.g., 48000)

**Returns**: A new `AudioDevice` instance

#### Properties

##### `AudioDevice.name`

Gets the device name.

**Returns**: `string`

##### `AudioDevice.format`

Gets the audio device format.

**Returns**: `AudioDeviceFormat` instance

##### `AudioDevice.isPlaybackDevice`

Indicates if this is a playback device.

**Returns**: `boolean`

##### `AudioDevice.isPhysicalDevice`

Indicates if this is a physical device.

**Returns**: `boolean`

##### `AudioDevice.isPaused`

Indicates if the device is paused.

**Returns**: `boolean`

##### `AudioDevice.gain`

Gets or sets the device gain (volume).

**Returns**: `number` (0.0 to 1.0)

#### Methods

##### `AudioDevice.bindStream(stream)`

Binds an audio stream to this device for playback or recording.

Parameters:

- `stream` (`AudioStream`): The audio stream to bind

**Returns**: `boolean` indicating success

##### `AudioDevice.unbindStream(stream)`

Unbinds an audio stream from this device.

Parameters:

- `stream` (`AudioStream`): The audio stream to unbind

**Returns**: `void`

##### `AudioDevice.pause()`

Pauses audio playback/recording.

**Returns**: `boolean` indicating success

##### `AudioDevice.resume()`

Resumes audio playback/recording.

**Returns**: `boolean` indicating success

##### `AudioDevice.close()`

Closes the audio device.

**Returns**: `void`

#### Static Methods

##### `AudioDevice.playbackDeviceFormats()`

Gets the audio formats supported by all playback devices.

**Returns**: `AudioDeviceFormat[]` - Array of audio device formats

##### `AudioDevice.recordingDeviceFormats()`

Gets the audio formats supported by all recording devices.

**Returns**: `AudioDeviceFormat[]` - Array of audio device formats

##### `AudioDevice.playbackDevices()`

Gets all available playback devices.

**Returns**: `AudioDevice[]` - An array of audio devices

##### `AudioDevice.recordingDevices()`

Gets all available recording devices.

**Returns**: `AudioDevice[]` - An array of audio devices

##### `AudioDevice.defaultPlaybackDevice([spec])`

Creates a new instance of `AudioDevice` for the default audio playback device. Equivalent to calling `new AudioDevice(constants.SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, spec)`

Parameters:

- `spec` (`object`, optional): Audio specification (same as `open()`)

**Returns**: `AudioDevice` - The default playback device

##### `AudioDevice.defaultRecordingDevice([spec])`

Creates a new instance of `AudioDevice` for the default audio recording device. Equivalent to calling `new AudioDevice(constants.SDL_AUDIO_DEVICE_DEFAULT_RECORDING, spec)`

Parameters:

- `spec` (`object`, optional): Audio specification (same as `open()`)

**Returns**: `AudioDevice` - The default recording device

### `AudioDevice.AudioDeviceFormat`

Represents the format of an audio device.

```js
const format = new sdl.AudioDevice.AudioDeviceFormat(deviceId)
```

Parameters:

- `deviceId` (`number`): The audio device ID

**Returns**: A new `AudioDeviceFormat` instance

#### Properties

##### `AudioDeviceFormat.valid`

Indicates if the format is valid.

**Returns**: `boolean`

##### `AudioDeviceFormat.sampleFrames`

Gets the number of sample frames.

**Returns**: `number`

##### `AudioDeviceFormat.spec`

Gets the audio specification.

**Returns**: `AudioSpec` instance

### `AudioDevice.AudioSpec`

Represents an audio specification.

```js
const spec = new sdl.AudioDevice.AudioSpec(format)
```

Parameters:

- `format` (`AudioDeviceFormat`): The audio device format

**Returns**: A new `AudioSpec` instance

#### Properties

##### `AudioSpec.format`

Gets the audio format.

**Returns**: `number` (e.g., `constants.SDL_AUDIO_F32`)

##### `AudioSpec.channels`

Gets the number of channels.

**Returns**: `number`

##### `AudioSpec.freq`

Gets the sample rate in Hz.

**Returns**: `number`

### `Camera`

The `Camera` API provides functionality to access and capture from system cameras.

```js
const camera = new sdl.Camera(deviceId[, spec])
```

### `AudioStream`

The `AudioStream` API provides functionality to manage SDL audio streams for format conversion, resampling, and device binding.

```js
const stream = new sdl.AudioStream(sourceSpec, targetSpec)
```

Parameters:

- `deviceId` (`number | object`): The camera device ID, or an object `{ id }` returned by `Camera.getCameras()`
- `spec` (`object`, optional): Requested camera specification with the following properties:
  - `format` (`number`): Pixel format (e.g., `constants.SDL_PIXELFORMAT_UYVY`)
  - `colorspace` (`number`): Colorspace constant
  - `width` (`number`): Frame width in pixels
  - `height` (`number`): Frame height in pixels
  - `framerateNumerator` (`number`): Framerate numerator
  - `framerateDenominator` (`number`): Framerate denominator

**Returns**: A new `Camera` instance

#### Properties

##### `Camera.id`

Gets the camera instance ID.

**Returns**: `number`

##### `Camera.name`

Gets the camera device name.

**Returns**: `string`

##### `Camera.properties`

Gets device properties.

**Returns**: `object`

##### `Camera.permissionState`

Gets the permission state for camera access: `-1` (denied), `0` (pending), `1` (approved).

**Returns**: `number`

##### `Camera.isApproved`

Indicates if camera access is approved.

**Returns**: `boolean`

##### `Camera.isDenied`

Indicates if camera access is denied.

**Returns**: `boolean`

##### `Camera.isPending`

Indicates if camera access is pending.

**Returns**: `boolean`

##### `Camera.spec`

Gets the current camera specification.

**Returns**: `Camera.CameraSpec` instance

#### Methods

##### `Camera.acquireFrame()`

Acquires a single camera frame.

**Returns**: `Camera.CameraFrame` instance

##### `Camera.destroy()`

Closes the camera and releases resources.

**Returns**: `void`

#### Static Methods

##### `Camera.getCameras()`

Gets available camera devices.

**Returns**: `object[]` - Array of `{ id, name, index }`

##### `Camera.getCameraName(deviceId)`

Gets the name for a camera device ID.

Parameters:

- `deviceId` (`number`): The camera device ID

**Returns**: `string`

##### `Camera.getCameraPosition(deviceId)`

Gets the position for a camera device ID.

Parameters:

- `deviceId` (`number`): The camera device ID

**Returns**: `number` (`constants.SDL_CAMERA_POSITION_FRONT_FACING` or `constants.SDL_CAMERA_POSITION_BACK_FACING`)

##### `Camera.getSupportedFormats(deviceId)`

Gets the supported formats for a camera device.

Parameters:

- `deviceId` (`number`): The camera device ID

**Returns**: `object[]` - Array of format objects `{ format, colorspace, width, height, framerateNumerator, framerateDenominator, fps }`

##### `Camera.defaultCamera([spec])`

Creates a `Camera` for the default device, optionally with a requested spec.

Parameters:

- `spec` (`object`, optional): Requested specification (same fields as constructor)

**Returns**: `Camera` - The default camera

### `Camera.CameraSpec`

Represents the current camera format selection. Typically accessed only via an existing `Camera` instance.

```js
const spec = camera.spec
```

#### Properties

##### `CameraSpec.format`

Gets the pixel format.

**Returns**: `number`

##### `CameraSpec.colorspace`

Gets the colorspace.

**Returns**: `number`

##### `CameraSpec.width`

Gets the frame width in pixels.

**Returns**: `number`

##### `CameraSpec.height`

Gets the frame height in pixels.

**Returns**: `number`

##### `CameraSpec.framerateNumerator`

Gets the framerate numerator.

**Returns**: `number`

##### `CameraSpec.framerateDenominator`

Gets the framerate denominator.

**Returns**: `number`

##### `CameraSpec.fps`

Gets the frames per second.

**Returns**: `number`

### `Camera.CameraFrame`

Represents a single captured frame. Typically accessed only via return value of `camera.acquireFrame`.

```js
const frame = camera.acquireFrame()
```

#### Properties

##### `CameraFrame.valid`

Indicates if the frame is valid.

**Returns**: `boolean`

##### `CameraFrame.timestamp`

Gets the frame timestamp.

**Returns**: `number`

##### `CameraFrame.width`

Gets the frame width in pixels.

**Returns**: `number`

##### `CameraFrame.height`

Gets the frame height in pixels.

**Returns**: `number`

##### `CameraFrame.pitch`

Gets the number of bytes per row.

**Returns**: `number`

##### `CameraFrame.format`

Gets the pixel format.

**Returns**: `number`

##### `CameraFrame.pixels`

Gets the raw pixel data.

**Returns**: `Buffer`

#### Methods

##### `CameraFrame.release()`

# Releases the frame back to the camera.

- `sourceSpec` (`object`): Source audio specification with the following properties:
  - `format` (`number`): Audio format (e.g., `constants.SDL_AUDIO_F32`)
  - `channels` (`number`): Number of audio channels (e.g., 2 for stereo)
  - `freq` (`number`): Sample rate in Hz (e.g., 44100)
- `targetSpec` (`object`): Target audio specification with the following properties:
  - `format` (`number`): Audio format (e.g., `constants.SDL_AUDIO_F32`)
  - `channels` (`number`): Number of audio channels (e.g., 2 for stereo)
  - `freq` (`number`): Sample rate in Hz (e.g., 44100)

**Returns**: A new `AudioStream` instance

Example:

```js
const mic = sdl.AudioDevice.defaultRecordingDevice()

const targetSpec = {
  format: sdl.constants.SDL_AUDIO_F32,
  channels: mic.spec.channels,
  freq: mic.spec.freq
}

const audioStream = new sdl.AudioStream(mic.spec, targetSpec)
```

#### Methods

##### `AudioStream.put(buffer[, offset[, length]])`

Puts audio data into the stream for processing.

Parameters:

- `buffer` (`ArrayBuffer`): The audio data buffer
- `offset` (`number`, optional): The offset in bytes. Defaults to 0
- `length` (`number`, optional): The number of bytes to put. Defaults to `buffer.byteLength - offset`

**Returns**: `boolean` indicating success

##### `AudioStream.get(buffer[, offset[, length]])`

Gets processed audio data from the stream.

Parameters:

- `buffer` (`ArrayBuffer`): The buffer to store the audio data
- `offset` (`number`, optional): The offset in bytes. Defaults to 0
- `length` (`number`, optional): The number of bytes to get. Defaults to `buffer.byteLength - offset`

**Returns**: `number` - The number of bytes read

##### `AudioStream.available`

Gets the number of bytes available for reading from the stream.

**Returns**: `number`

##### `AudioStream.flush()`

Flushes any remaining audio data in the stream.

**Returns**: `boolean` indicating success

##### `AudioStream.clear()`

Clears all audio data from the stream.

**Returns**: `boolean` indicating success

##### `AudioStream.device`

Gets the ID of the bound audio device.

**Returns**: `number` - The device ID (0 if not bound)

##### `AudioStream.createReadStream()`

Creates a readable stream for getting audio data.

**Returns**: `Readable` stream

##### `AudioStream.createWriteStream()`

Creates a writable stream for putting audio data.

**Returns**: `Writable` stream

##### `AudioStream.destroy()`

Destroys the audio stream and frees associated resources.

> > > > > > > main

**Returns**: `void`

## Examples

- [Video playback with `bare-ffmpeg`](./examples/video-playback.js)
- [List available audio playback and recording devices](./examples/audio-device-list.js)
- [List available cameras](./examples/camera-list.js)
- [Capture and playback camera stream](./examples/camera-sdl-capture-and-playback.js)
- [Use sdl.Camera to get device list, use bare-ffmpeg to capture and process camera stream](./examples/camera-sdl-device-list-ffmpeg-capture.js)

## License

Apache-2.0
