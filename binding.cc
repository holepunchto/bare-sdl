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
  uint32_t height
) {
  int err;
  js_arraybuffer_t handle;

  bare_sdl_window_t *win;
  err = js_create_arraybuffer(env, win, handle);
  assert(err == 0);

  win->handle = SDL_CreateWindow(title.c_str(), width, height, 0);
  if (win->handle == nullptr) {
    err = js_throw_error(env, NULL, "Window creation failed");
    assert(err == 0);
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

  V("SDL_WINDOWPOS_CENTERED", SDL_WINDOWPOS_CENTERED)
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
