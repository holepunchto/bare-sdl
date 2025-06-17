# bare-sdl

SDL bindings for Bare.

```
npm i bare-sdl
```

## Documentation

### Window

The Window API provides functionality to create SDL windows.

```javascript
const window = new sdl.Window(title, width, height[, flags])
```

Parameters:

- `title` (string): The window title
- `width` (number): The window width in pixels
- `height` (number): The window height in pixels
- `flags` (number, optional): Window creation flags. Defaults to 0

Available flags are exposed through the `constants` object. Common flags include:

- `SDL_WINDOW_FULLSCREEN`: Fullscreen window
- `SDL_WINDOW_BORDERLESS`: Borderless window
- `SDL_WINDOW_RESIZABLE`: Resizable window
- `SDL_WINDOW_VULKAN`: Window usable with Vulkan
- `SDL_WINDOW_METAL`: Window usable with Metal

**Returns**: A new `sdl.Window` instance

> The window instance is reference counted. Use `.ref()` to increment the reference count and `.unref()` to decrement it. The window will be automatically destroyed when the reference count reaches zero.

Example:

```javascript
const window = new sdl.Window('My Window', 800, 600)
window.ref() // Increment reference count
// ... use window ...
window.unref() // Decrement reference count
// Window will be destroyed when reference count reaches zero
```

### Renderer

The Renderer API provides functionality to render graphics using SDL.

```javascript
const renderer = new sdl.Renderer(window)
```

Parameters:

- `window` (sdl.Window): The window instance to render to

**Returns**: A new `Renderer` instance

> The renderer instance is reference counted. Use `.ref()` to increment the reference count and `.unref()` to decrement it.

#### Methods

##### `Renderer.clear()`

Clears the renderer with the current draw color.

**Returns**: boolean indicating success

##### `Renderer.texture(texture)`

Renders a texture to the renderer.

Parameters:

- `texture` (sdl.Texture): The texture to render

**Returns**: boolean indicating success

##### `Renderer.present()`

Updates the screen with the rendered content.

**Returns**: boolean indicating success

### Texture

The Texture API provides functionality to create and manage SDL textures.

```javascript
const texture = new sdl.Texture(renderer, width, height[, pixelFormat[, textureAccess]])
```

Parameters:

- `renderer` (sdl.Renderer): The renderer instance
- `width` (number): The texture width in pixels
- `height` (number): The texture height in pixels
- `pixelFormat` (number, optional): The pixel format. Defaults to `SDL_PIXELFORMAT_RGB24`
- `textureAccess` (number, optional): The texture access pattern. Defaults to `SDL_TEXTUREACCESS_STREAMING`

Available pixel formats and texture access flags are exposed through the `constants` object.

**Returns**: A new `Texture` instance

> The texture instance is reference counted. Use `.ref()` to increment the reference count and `.unref()` to decrement it.

#### Methods

##### `Texture.update(buffer, pitch)`

Updates the texture with new pixel data.

Parameters:

- `buffer` (Buffer): The pixel data buffer
- `pitch` (number): The number of bytes per row

**Returns**: boolean indicating success

### Event

The Event API provides functionality to handle SDL events.

```javascript
const event = new sdl.Event()
```

**Returns**: A new `Event` instance

#### Properties

##### `Event.type`

Gets the event type.

**Returns**: number

##### `Event.key`

Gets the keyboard event data.

**Returns**: `Event.Keyboard` instance

### Event.Keyboard

The Keyboard Event API provides functionality to handle SDL keyboard events.

```javascript
const keyboardEvent = new sdl.Event.Keyboard([event])
```

Parameters:

- `event` (sdl.Event, optional): The parent event instance. If not provided, a new event will be created.

**Returns**: A new `Event.Keyboard` instance

#### Properties

##### `Event.Keyboard.scancode`

Gets the keyboard scancode.

**Returns**: number

### Poller

The Poller API provides functionality to poll for SDL events.

```javascript
const poller = new sdl.Poller()
```

**Returns**: A new `sdl.Poller` instance

#### Methods

##### `Poller.poll(event)`

Polls for events.

Parameters:

- `event` (sdl.Event): The event instance to store the polled event data

**Returns**: boolean indicating if an event was polled

## Examples

- [Video playback with `bare-ffmpeg`](./example/video-playback.js)

## License

Apache-2.0
