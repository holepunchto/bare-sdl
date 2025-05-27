#include "SDL3/SDL_error.h"
#include <bare.h>
#include <js.h>
#include <jstl.h>

#include <SDL3/SDL.h>

typedef struct {
  SDL_Window *handle;
} bare_sdl_window_t;

static uv_once_t bare_sdl__init_guard = UV_ONCE_INIT;

static void
bare_sdl__on_init(void) {
  SDL_Init(SDL_INIT_VIDEO);
}

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

static js_value_t *
bare_sdl_exports(js_env_t *env, js_value_t *exports) {
  uv_once(&bare_sdl__init_guard, bare_sdl__on_init);

  int err;
  js_object_t _exports = static_cast<js_object_t>(exports);

#define V(name, constant) \
  err = js_set_property(env, _exports, name, static_cast<uint32_t>(constant)); \
  assert(err == 0);

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
#undef V

#define V(name, function) \
  err = js_set_property<function>(env, _exports, name); \
  assert(err == 0);

  V("createWindow", bare_sdl_create_window)
  V("destroyWindow", bare_sdl_destroy_window)
#undef V

  return exports;
}

BARE_MODULE(bare_sdl, bare_sdl_exports)
