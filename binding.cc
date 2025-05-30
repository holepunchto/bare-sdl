#include <bare.h>
#include <js.h>
#include <jstl.h>

#include <SDL3/SDL.h>

typedef struct {
  SDL_Window *handle;
} bare_sdl_window_t;

typedef struct {
  SDL_Renderer *handle;
} bare_sdl_renderer_t;

typedef struct {
  SDL_Texture *handle;
} bare_sdl_texture_t;

typedef struct {
  SDL_Event handle;
} bare_sdl_event_t;

static uv_once_t bare_sdl__init_guard = UV_ONCE_INIT;

static void
bare_sdl__on_init(void) {
  SDL_Init(SDL_INIT_VIDEO);
}

// Window

static js_arraybuffer_t
bare_sdl_create_window(
  js_env_t *env,
  js_receiver_t,
  std::string title,
  uint32_t width,
  uint32_t height,
  uint64_t flags
) {
  int err;
  js_arraybuffer_t handle;

  bare_sdl_window_t *win;
  err = js_create_arraybuffer(env, win, handle);
  assert(err == 0);

  win->handle = SDL_CreateWindow(title.c_str(), width, height, flags);
  if (win->handle == nullptr) {
    err = js_throw_error(env, NULL, SDL_GetError());
    assert(err == 0);

    throw js_pending_exception;
  }

  return handle;
}

static void
bare_sdl_destroy_window(
  js_env_t *,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_window_t, 1> win
) {
  SDL_DestroyWindow(win->handle);
}

// Renderer

static js_arraybuffer_t
bare_sdl_create_renderer(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_window_t, 1> win
) {
  int err;
  js_arraybuffer_t handle;

  bare_sdl_renderer_t *ren;
  err = js_create_arraybuffer(env, ren, handle);
  assert(err == 0);

  ren->handle = SDL_CreateRenderer(win->handle, nullptr);
  if (win->handle == nullptr) {
    err = js_throw_error(env, NULL, SDL_GetError());
    assert(err == 0);

    throw js_pending_exception;
  }

  return handle;
}

static void
bare_sdl_destroy_renderer(
  js_env_t *,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_renderer_t, 1> ren
) {
  SDL_DestroyRenderer(ren->handle);
}

static bool
bare_sdl_clear_render(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_renderer_t, 1> ren
) {
  return SDL_RenderClear(ren->handle);
}

static bool
bare_sdl_present_render(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_renderer_t, 1> ren
) {
  return SDL_RenderPresent(ren->handle);
}
static bool
bare_sdl_texture_render(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_renderer_t, 1> ren,
  js_arraybuffer_span_of_t<bare_sdl_texture_t, 1> tex
) {
  // TODO: add source and destination SDL_Rect
  return SDL_RenderTexture(ren->handle, tex->handle, nullptr, nullptr);
}

// Texture

static js_arraybuffer_t
bare_sdl_create_texture(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_renderer_t, 1> ren,
  uint64_t pixel_format,
  uint64_t texture_access,
  uint32_t width,
  uint32_t height
) {
  int err;
  js_arraybuffer_t handle;

  bare_sdl_texture_t *tex;
  err = js_create_arraybuffer(env, tex, handle);
  assert(err == 0);

  tex->handle = SDL_CreateTexture(ren->handle, (SDL_PixelFormat) pixel_format, (SDL_TextureAccess) texture_access, width, height);
  if (tex->handle == nullptr) {
    err = js_throw_error(env, NULL, SDL_GetError());
    assert(err == 0);

    throw js_pending_exception;
  }

  return handle;
}

static void
bare_sdl_destroy_texture(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_texture_t, 1> tex
) {
  SDL_DestroyTexture(tex->handle);
}

static bool
bare_sdl_update_texture(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_texture_t, 1> tex,
  js_arraybuffer_span_t buf,
  uint32_t buf_offset,
  int pitch
) {
  // TODO: add SDL_Rect
  return SDL_UpdateTexture(tex->handle, NULL, &buf[buf_offset], pitch);
}

// Poll Event

static bool
bare_sdl_poll(
  js_env_t *,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_event_t, 1> e
) {
  return SDL_PollEvent(&e->handle);
}

static js_arraybuffer_t
bare_sdl_create_event(
  js_env_t *env,
  js_receiver_t
) {
  int err;
  js_arraybuffer_t handle;

  bare_sdl_event_t *event;
  err = js_create_arraybuffer(env, event, handle);
  assert(err == 0);

  memset(&event->handle, 0, sizeof(SDL_Event));

  return handle;
}

static uint32_t
bare_sdl_get_event_type(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_event_t, 1> e
) {
  return e->handle.type;
}

// Exports

static js_value_t *
bare_sdl_exports(js_env_t *env, js_value_t *exports) {
  uv_once(&bare_sdl__init_guard, bare_sdl__on_init);

  int err;
  js_object_t _exports = static_cast<js_object_t>(exports);

#define V(name, constant) \
  err = js_set_property(env, _exports, name, static_cast<uint32_t>(constant)); \
  assert(err == 0);

  // Window flags

  V("SDL_WINDOW_FULLSCREEN", SDL_WINDOW_FULLSCREEN)
  V("SDL_WINDOW_OPENGL", SDL_WINDOW_OPENGL)
  V("SDL_WINDOW_OCCLUDED", SDL_WINDOW_OCCLUDED)
  V("SDL_WINDOW_HIDDEN", SDL_WINDOW_HIDDEN)
  V("SDL_WINDOW_BORDERLESS", SDL_WINDOW_BORDERLESS)
  V("SDL_WINDOW_RESIZABLE", SDL_WINDOW_RESIZABLE)
  V("SDL_WINDOW_MINIMIZED", SDL_WINDOW_MINIMIZED)
  V("SDL_WINDOW_MAXIMIZED", SDL_WINDOW_MAXIMIZED)
  V("SDL_WINDOW_MOUSE_GRABBED", SDL_WINDOW_MOUSE_GRABBED)
  V("SDL_WINDOW_INPUT_FOCUS", SDL_WINDOW_INPUT_FOCUS)
  V("SDL_WINDOW_MOUSE_FOCUS", SDL_WINDOW_MOUSE_FOCUS)
  V("SDL_WINDOW_EXTERNAL", SDL_WINDOW_EXTERNAL)
  V("SDL_WINDOW_MODAL", SDL_WINDOW_MODAL)
  V("SDL_WINDOW_HIGH_PIXEL_DENSITY", SDL_WINDOW_HIGH_PIXEL_DENSITY)
  V("SDL_WINDOW_MOUSE_CAPTURE", SDL_WINDOW_MOUSE_CAPTURE)
  V("SDL_WINDOW_ALWAYS_ON_TOP", SDL_WINDOW_ALWAYS_ON_TOP)
  V("SDL_WINDOW_UTILITY", SDL_WINDOW_UTILITY)
  V("SDL_WINDOW_TOOLTIP", SDL_WINDOW_TOOLTIP)
  V("SDL_WINDOW_POPUP_MENU", SDL_WINDOW_POPUP_MENU)
  V("SDL_WINDOW_KEYBOARD_GRABBED", SDL_WINDOW_KEYBOARD_GRABBED)
  V("SDL_WINDOW_VULKAN", SDL_WINDOW_VULKAN)
  V("SDL_WINDOW_METAL", SDL_WINDOW_METAL)
  V("SDL_WINDOW_TRANSPARENT", SDL_WINDOW_TRANSPARENT)
  V("SDL_WINDOW_NOT_FOCUSABLE", SDL_WINDOW_NOT_FOCUSABLE)

  // Pixel formats
  V("SDL_PIXELFORMAT_UNKNOWN", SDL_PIXELFORMAT_UNKNOWN)
  V("SDL_PIXELFORMAT_INDEX1LSB", SDL_PIXELFORMAT_INDEX1LSB)
  V("SDL_PIXELFORMAT_INDEX1MSB", SDL_PIXELFORMAT_INDEX1MSB)
  V("SDL_PIXELFORMAT_INDEX2LSB", SDL_PIXELFORMAT_INDEX2LSB)
  V("SDL_PIXELFORMAT_INDEX2MSB", SDL_PIXELFORMAT_INDEX2MSB)
  V("SDL_PIXELFORMAT_INDEX4LSB", SDL_PIXELFORMAT_INDEX4LSB)
  V("SDL_PIXELFORMAT_INDEX4MSB", SDL_PIXELFORMAT_INDEX4MSB)
  V("SDL_PIXELFORMAT_INDEX8", SDL_PIXELFORMAT_INDEX8)
  V("SDL_PIXELFORMAT_RGB332", SDL_PIXELFORMAT_RGB332)
  V("SDL_PIXELFORMAT_XRGB4444", SDL_PIXELFORMAT_XRGB4444)
  V("SDL_PIXELFORMAT_XBGR4444", SDL_PIXELFORMAT_XBGR4444)
  V("SDL_PIXELFORMAT_XRGB1555", SDL_PIXELFORMAT_XRGB1555)
  V("SDL_PIXELFORMAT_XBGR1555", SDL_PIXELFORMAT_XBGR1555)
  V("SDL_PIXELFORMAT_ARGB4444", SDL_PIXELFORMAT_ARGB4444)
  V("SDL_PIXELFORMAT_RGBA4444", SDL_PIXELFORMAT_RGBA4444)
  V("SDL_PIXELFORMAT_ABGR4444", SDL_PIXELFORMAT_ABGR4444)
  V("SDL_PIXELFORMAT_BGRA4444", SDL_PIXELFORMAT_BGRA4444)
  V("SDL_PIXELFORMAT_ARGB1555", SDL_PIXELFORMAT_ARGB1555)
  V("SDL_PIXELFORMAT_RGBA5551", SDL_PIXELFORMAT_RGBA5551)
  V("SDL_PIXELFORMAT_ABGR1555", SDL_PIXELFORMAT_ABGR1555)
  V("SDL_PIXELFORMAT_BGRA5551", SDL_PIXELFORMAT_BGRA5551)
  V("SDL_PIXELFORMAT_RGB565", SDL_PIXELFORMAT_RGB565)
  V("SDL_PIXELFORMAT_BGR565", SDL_PIXELFORMAT_BGR565)
  V("SDL_PIXELFORMAT_RGB24", SDL_PIXELFORMAT_RGB24)
  V("SDL_PIXELFORMAT_BGR24", SDL_PIXELFORMAT_BGR24)
  V("SDL_PIXELFORMAT_XRGB8888", SDL_PIXELFORMAT_XRGB8888)
  V("SDL_PIXELFORMAT_RGBX8888", SDL_PIXELFORMAT_RGBX8888)
  V("SDL_PIXELFORMAT_XBGR8888", SDL_PIXELFORMAT_XBGR8888)
  V("SDL_PIXELFORMAT_BGRX8888", SDL_PIXELFORMAT_BGRX8888)
  V("SDL_PIXELFORMAT_ARGB8888", SDL_PIXELFORMAT_ARGB8888)
  V("SDL_PIXELFORMAT_RGBA8888", SDL_PIXELFORMAT_RGBA8888)
  V("SDL_PIXELFORMAT_ABGR8888", SDL_PIXELFORMAT_ABGR8888)
  V("SDL_PIXELFORMAT_BGRA8888", SDL_PIXELFORMAT_BGRA8888)
  V("SDL_PIXELFORMAT_XRGB2101010", SDL_PIXELFORMAT_XRGB2101010)
  V("SDL_PIXELFORMAT_XBGR2101010", SDL_PIXELFORMAT_XBGR2101010)
  V("SDL_PIXELFORMAT_ARGB2101010", SDL_PIXELFORMAT_ARGB2101010)
  V("SDL_PIXELFORMAT_ABGR2101010", SDL_PIXELFORMAT_ABGR2101010)
  V("SDL_PIXELFORMAT_RGB48", SDL_PIXELFORMAT_RGB48)
  V("SDL_PIXELFORMAT_BGR48", SDL_PIXELFORMAT_BGR48)
  V("SDL_PIXELFORMAT_RGBA64", SDL_PIXELFORMAT_RGBA64)
  V("SDL_PIXELFORMAT_ARGB64", SDL_PIXELFORMAT_ARGB64)
  V("SDL_PIXELFORMAT_BGRA64", SDL_PIXELFORMAT_BGRA64)
  V("SDL_PIXELFORMAT_ABGR64", SDL_PIXELFORMAT_ABGR64)
  V("SDL_PIXELFORMAT_RGB48_FLOAT", SDL_PIXELFORMAT_RGB48_FLOAT)
  V("SDL_PIXELFORMAT_BGR48_FLOAT", SDL_PIXELFORMAT_BGR48_FLOAT)
  V("SDL_PIXELFORMAT_RGBA64_FLOAT", SDL_PIXELFORMAT_RGBA64_FLOAT)
  V("SDL_PIXELFORMAT_ARGB64_FLOAT", SDL_PIXELFORMAT_ARGB64_FLOAT)
  V("SDL_PIXELFORMAT_BGRA64_FLOAT", SDL_PIXELFORMAT_BGRA64_FLOAT)
  V("SDL_PIXELFORMAT_ABGR64_FLOAT", SDL_PIXELFORMAT_ABGR64_FLOAT)
  V("SDL_PIXELFORMAT_RGB96_FLOAT", SDL_PIXELFORMAT_RGB96_FLOAT)
  V("SDL_PIXELFORMAT_BGR96_FLOAT", SDL_PIXELFORMAT_BGR96_FLOAT)
  V("SDL_PIXELFORMAT_RGBA128_FLOAT", SDL_PIXELFORMAT_RGBA128_FLOAT)
  V("SDL_PIXELFORMAT_ARGB128_FLOAT", SDL_PIXELFORMAT_ARGB128_FLOAT)
  V("SDL_PIXELFORMAT_BGRA128_FLOAT", SDL_PIXELFORMAT_BGRA128_FLOAT)
  V("SDL_PIXELFORMAT_ABGR128_FLOAT", SDL_PIXELFORMAT_ABGR128_FLOAT)
  V("SDL_PIXELFORMAT_YV12", SDL_PIXELFORMAT_YV12)
  V("SDL_PIXELFORMAT_IYUV", SDL_PIXELFORMAT_IYUV)
  V("SDL_PIXELFORMAT_YUY2", SDL_PIXELFORMAT_YUY2)
  V("SDL_PIXELFORMAT_UYVY", SDL_PIXELFORMAT_UYVY)
  V("SDL_PIXELFORMAT_YVYU", SDL_PIXELFORMAT_YVYU)
  V("SDL_PIXELFORMAT_NV12", SDL_PIXELFORMAT_NV12)
  V("SDL_PIXELFORMAT_NV21", SDL_PIXELFORMAT_NV21)
  V("SDL_PIXELFORMAT_P010", SDL_PIXELFORMAT_P010)
  V("SDL_PIXELFORMAT_EXTERNAL_OES", SDL_PIXELFORMAT_EXTERNAL_OES)
  V("SDL_PIXELFORMAT_MJPG", SDL_PIXELFORMAT_MJPG)
  V("SDL_PIXELFORMAT_RGBA32", SDL_PIXELFORMAT_ABGR8888)
  V("SDL_PIXELFORMAT_ARGB32", SDL_PIXELFORMAT_BGRA8888)
  V("SDL_PIXELFORMAT_BGRA32", SDL_PIXELFORMAT_ARGB8888)
  V("SDL_PIXELFORMAT_ABGR32", SDL_PIXELFORMAT_RGBA8888)
  V("SDL_PIXELFORMAT_RGBX32", SDL_PIXELFORMAT_XBGR8888)
  V("SDL_PIXELFORMAT_XRGB32", SDL_PIXELFORMAT_BGRX8888)
  V("SDL_PIXELFORMAT_BGRX32", SDL_PIXELFORMAT_XRGB8888)
  V("SDL_PIXELFORMAT_XBGR32", SDL_PIXELFORMAT_RGBX8888)

  // Texture access

  V("SDL_TEXTUREACCESS_STATIC", SDL_TEXTUREACCESS_STATIC)
  V("SDL_TEXTUREACCESS_STREAMING", SDL_TEXTUREACCESS_STREAMING)
  V("SDL_TEXTUREACCESS_TARGET", SDL_TEXTUREACCESS_TARGET)

  // Event type

  V("SDL_EVENT_QUIT", SDL_EVENT_QUIT)
  V("SDL_EVENT_TERMINATING", SDL_EVENT_TERMINATING)
  V("SDL_EVENT_LOW_MEMORY", SDL_EVENT_LOW_MEMORY)
  V("SDL_EVENT_WILL_ENTER_BACKGROUND", SDL_EVENT_WILL_ENTER_BACKGROUND)
  V("SDL_EVENT_DID_ENTER_BACKGROUND", SDL_EVENT_DID_ENTER_BACKGROUND)
  V("SDL_EVENT_WILL_ENTER_FOREGROUND", SDL_EVENT_WILL_ENTER_FOREGROUND)
  V("SDL_EVENT_DID_ENTER_FOREGROUND", SDL_EVENT_DID_ENTER_FOREGROUND)
  V("SDL_EVENT_LOCALE_CHANGED", SDL_EVENT_LOCALE_CHANGED)
  V("SDL_EVENT_SYSTEM_THEME_CHANGED", SDL_EVENT_SYSTEM_THEME_CHANGED)
  V("SDL_EVENT_DISPLAY_ORIENTATION ", SDL_EVENT_DISPLAY_ORIENTATION)
  V("SDL_EVENT_DISPLAY_ADDED", SDL_EVENT_DISPLAY_ADDED)
  V("SDL_EVENT_DISPLAY_REMOVED", SDL_EVENT_DISPLAY_REMOVED)
  V("SDL_EVENT_DISPLAY_MOVED", SDL_EVENT_DISPLAY_MOVED)
  V("SDL_EVENT_DISPLAY_DESKTOP_MODE_CHANGED", SDL_EVENT_DISPLAY_DESKTOP_MODE_CHANGED)
  V("SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED", SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED)
  V("SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED", SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED)
  V("SDL_EVENT_WINDOW_SHOWN ", SDL_EVENT_WINDOW_SHOWN)
  V("SDL_EVENT_WINDOW_HIDDEN", SDL_EVENT_WINDOW_HIDDEN)
  V("SDL_EVENT_WINDOW_EXPOSED", SDL_EVENT_WINDOW_EXPOSED)
  V("SDL_EVENT_WINDOW_MOVED", SDL_EVENT_WINDOW_MOVED)
  V("SDL_EVENT_WINDOW_RESIZED", SDL_EVENT_WINDOW_RESIZED)
  V("SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED", SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED)
  V("SDL_EVENT_WINDOW_METAL_VIEW_RESIZED", SDL_EVENT_WINDOW_METAL_VIEW_RESIZED)
  V("SDL_EVENT_WINDOW_MINIMIZED", SDL_EVENT_WINDOW_MINIMIZED)
  V("SDL_EVENT_WINDOW_MAXIMIZED", SDL_EVENT_WINDOW_MAXIMIZED)
  V("SDL_EVENT_WINDOW_RESTORED", SDL_EVENT_WINDOW_RESTORED)
  V("SDL_EVENT_WINDOW_MOUSE_ENTER", SDL_EVENT_WINDOW_MOUSE_ENTER)
  V("SDL_EVENT_WINDOW_MOUSE_LEAVE", SDL_EVENT_WINDOW_MOUSE_LEAVE)
  V("SDL_EVENT_WINDOW_FOCUS_GAINED", SDL_EVENT_WINDOW_FOCUS_GAINED)
  V("SDL_EVENT_WINDOW_FOCUS_LOST", SDL_EVENT_WINDOW_FOCUS_LOST)
  V("SDL_EVENT_WINDOW_CLOSE_REQUESTED", SDL_EVENT_WINDOW_CLOSE_REQUESTED)
  V("SDL_EVENT_WINDOW_HIT_TEST", SDL_EVENT_WINDOW_HIT_TEST)
  V("SDL_EVENT_WINDOW_ICCPROF_CHANGED", SDL_EVENT_WINDOW_ICCPROF_CHANGED)
  V("SDL_EVENT_WINDOW_DISPLAY_CHANGED", SDL_EVENT_WINDOW_DISPLAY_CHANGED)
  V("SDL_EVENT_WINDOW_DISPLAY_SCALE_CHANGED", SDL_EVENT_WINDOW_DISPLAY_SCALE_CHANGED)
  V("SDL_EVENT_WINDOW_SAFE_AREA_CHANGED", SDL_EVENT_WINDOW_SAFE_AREA_CHANGED)
  V("SDL_EVENT_WINDOW_OCCLUDED", SDL_EVENT_WINDOW_OCCLUDED)
  V("SDL_EVENT_WINDOW_ENTER_FULLSCREEN", SDL_EVENT_WINDOW_ENTER_FULLSCREEN)
  V("SDL_EVENT_WINDOW_LEAVE_FULLSCREEN", SDL_EVENT_WINDOW_LEAVE_FULLSCREEN)
  V("SDL_EVENT_WINDOW_DESTROYED", SDL_EVENT_WINDOW_DESTROYED)
  V("SDL_EVENT_WINDOW_HDR_STATE_CHANGED", SDL_EVENT_WINDOW_HDR_STATE_CHANGED)
  V("SDL_EVENT_KEY_DOWN", SDL_EVENT_KEY_DOWN)
  V("SDL_EVENT_KEY_UP", SDL_EVENT_KEY_UP)
  V("SDL_EVENT_TEXT_EDITING", SDL_EVENT_TEXT_EDITING)
  V("SDL_EVENT_TEXT_INPUT", SDL_EVENT_TEXT_INPUT)
  V("SDL_EVENT_KEYMAP_CHANGED", SDL_EVENT_KEYMAP_CHANGED)
  V("SDL_EVENT_KEYBOARD_ADDED", SDL_EVENT_KEYBOARD_ADDED)
  V("SDL_EVENT_KEYBOARD_REMOVED", SDL_EVENT_KEYBOARD_REMOVED)
  V("SDL_EVENT_TEXT_EDITING_CANDIDATES", SDL_EVENT_TEXT_EDITING_CANDIDATES)
  V("SDL_EVENT_MOUSE_MOTION", SDL_EVENT_MOUSE_MOTION)
  V("SDL_EVENT_MOUSE_BUTTON_DOWN", SDL_EVENT_MOUSE_BUTTON_DOWN)
  V("SDL_EVENT_MOUSE_BUTTON_UP", SDL_EVENT_MOUSE_BUTTON_UP)
  V("SDL_EVENT_MOUSE_WHEEL", SDL_EVENT_MOUSE_WHEEL)
  V("SDL_EVENT_MOUSE_ADDED", SDL_EVENT_MOUSE_ADDED)
  V("SDL_EVENT_MOUSE_REMOVED", SDL_EVENT_MOUSE_REMOVED)
#undef V

#define V(name, function) \
  err = js_set_property<function>(env, _exports, name); \
  assert(err == 0);

  V("createWindow", bare_sdl_create_window)
  V("destroyWindow", bare_sdl_destroy_window)

  V("createRenderer", bare_sdl_create_renderer)
  V("destroyRenderer", bare_sdl_destroy_renderer)
  V("clearRender", bare_sdl_clear_render)
  V("presentRender", bare_sdl_present_render)
  V("textureRender", bare_sdl_texture_render)

  V("createTexture", bare_sdl_create_texture)
  V("destroyTexture", bare_sdl_destroy_texture)
  V("updateTexture", bare_sdl_update_texture)

  V("poll", bare_sdl_poll)
  V("createEvent", bare_sdl_create_event)
  V("getEventType", bare_sdl_get_event_type)
#undef V

  return exports;
}

BARE_MODULE(bare_sdl, bare_sdl_exports)
