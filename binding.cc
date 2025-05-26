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
  assert(win->handle != nullptr);

  return handle;
}

static void
bare_sdl_destroy_window(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_t handle
) {
  int err;

  bare_sdl_window_t *win;
  err = js_get_arraybuffer_info(env, handle, win);
  assert(err == 0);

  SDL_DestroyWindow(win->handle);
}

static js_value_t *
bare_sdl_exports(js_env_t *env, js_value_t *exports) {
  uv_once(&bare_sdl__init_guard, bare_sdl__on_init);

  int err;
  js_object_t _exports = static_cast<js_object_t>(exports);

#define V_UINT32(name, constant) \
  err = js_set_property(env, _exports, name, static_cast<uint32_t>(constant)); \
  assert(err == 0);

#define V_FUNCTION(name, function) \
  err = js_set_property<function>(env, _exports, name); \
  assert(err == 0);

  V_UINT32("SDL_WINDOWPOS_CENTERED", SDL_WINDOWPOS_CENTERED)

  V_FUNCTION("createWindow", bare_sdl_create_window)
  V_FUNCTION("destroyWindow", bare_sdl_destroy_window)

#undef V_UINT32
#undef V_FUNCTION

  return exports;
}

BARE_MODULE(bare_sdl, bare_sdl_exports)
