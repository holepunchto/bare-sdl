# bare-sdl

SDL bindings for Bare.

```
npm i bare-sdl
```

## Documentation

### Window

The Window API provides functionality to create SDL windows.

```javascript
const window = new SDLWindow(title, width, height[, flags])
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

**Returns**: A new `SDLWindow` instance

> The window instance is reference counted. Use `.ref()` to increment the reference count and `.unref()` to decrement it. The window will be automatically destroyed when the reference count reaches zero.

Example:

```javascript
const window = new SDLWindow('My Window', 800, 600)
window.ref() // Increment reference count
// ... use window ...
window.unref() // Decrement reference count
// Window will be destroyed when reference count reaches zero
```

### Renderer

The Renderer API provides functionality to render graphics using SDL.

```javascript
const renderer = new SDLRenderer(window)
```

Parameters:

- `window` (SDLWindow): The window instance to render to

**Returns**: A new `SDLRenderer` instance

> The renderer instance is reference counted. Use `.ref()` to increment the reference count and `.unref()` to decrement it.

#### Methods

##### `SDLRenderer.clear()`

Clears the renderer with the current draw color.

**Returns**: boolean indicating success

##### `SDLRenderer.texture(texture)`

Renders a texture to the renderer.

Parameters:

- `texture` (SDLTexture): The texture to render

**Returns**: boolean indicating success

##### `SDLRenderer.present()`

Updates the screen with the rendered content.

**Returns**: boolean indicating success

### Texture

The Texture API provides functionality to create and manage SDL textures.

```javascript
const texture = new SDLTexture(renderer, width, height[, pixelFormat[, textureAccess]])
```

Parameters:

- `renderer` (SDLRenderer): The renderer instance
- `width` (number): The texture width in pixels
- `height` (number): The texture height in pixels
- `pixelFormat` (number, optional): The pixel format. Defaults to `SDL_PIXELFORMAT_RGB24`
- `textureAccess` (number, optional): The texture access pattern. Defaults to `SDL_TEXTUREACCESS_STREAMING`

Available pixel formats and texture access flags are exposed through the `constants` object.

**Returns**: A new `SDLTexture` instance

> The texture instance is reference counted. Use `.ref()` to increment the reference count and `.unref()` to decrement it.

#### Methods

##### `SDLTexture.update(buffer, pitch)`

Updates the texture with new pixel data.

Parameters:

- `buffer` (Buffer): The pixel data buffer
- `pitch` (number): The number of bytes per row

**Returns**: boolean indicating success

### Event

The Event API provides functionality to handle SDL events.

```javascript
const event = new SDLEvent()
```

**Returns**: A new `SDLEvent` instance

#### Properties

##### `SDLEvent.type`

Gets the event type.

**Returns**: number

##### `SDLEvent.key`

Gets the keyboard event data.

**Returns**: `SDLKeyboardEvent` instance

### Event.Keyboard

The Keyboard Event API provides functionality to handle SDL keyboard events.

```javascript
const keyboardEvent = new SDLEvent.Keyboard([event])
```

Parameters:

- `event` (SDLEvent, optional): The parent event instance. If not provided, a new event will be created.

**Returns**: A new `SDLKeyboardEvent` instance

#### Properties

##### `SDLKeyboardEvent.scancode`

Gets the keyboard scancode.

**Returns**: number

## License

Apache-2.0
