#include <bare.h>
#include <js.h>

#include <SDL3/SDL.h>

static js_value_t *bare_sdl2_exports(js_env_t *env, js_value_t *exports) {
  int err;

#define V(name)                                                                \
  {                                                                            \
    js_value_t *val;                                                           \
    err = js_create_int64(env, name, &val);                                    \
    assert(err == 0);                                                          \
    err = js_set_named_property(env, exports, #name, val);                     \
    assert(err == 0);                                                          \
  }

  V(SDL_WINDOWPOS_CENTERED)

#undef V

  return exports;
}

BARE_MODULE(bare_sdl2, bare_sdl2_exports)
