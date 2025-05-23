#include <bare.h>
#include <js.h>
#include <jstl.h>

#include <SDL3/SDL.h>

typedef struct {
  SDL_Window *handle;
} bare_sdl2_window_t;

static js_value_t *
bare_sdl_exports(js_env_t *env, js_value_t *exports) {
  int err;
  js_object_t _exports = static_cast<js_object_t>(exports);

#define V_UINT32(name, constant) \
  err = js_set_property(env, _exports, name, static_cast<uint32_t>(constant)); \
  assert(err == 0);

  V_UINT32("SDL_WINDOWPOS_CENTERED", SDL_WINDOWPOS_CENTERED)

  return exports;
}

BARE_MODULE(bare_sdl, bare_sdl_exports)
