# bare-sdl

SDL bindings for Bare.

```
npm i bare-sdl
```

## Documentation

### Window

The Window API provides functionality to create SDL windows.

```javascript
const window = new SDLWindow(title, width, height, [flags])
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

## License

Apache-2.0
