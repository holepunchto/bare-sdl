#include "SDL3/SDL_camera.h"
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

typedef struct {
  SDL_KeyboardEvent handle;
} bare_sdl_keyboard_event_t;

typedef struct {
  SDL_AudioDeviceID *devices;
  int count;
} bare_sdl_audio_device_list_t;

typedef struct {
  SDL_AudioSpec spec;
  int sample_frames;
  bool valid;
} bare_sdl_audio_device_format_t;

typedef struct {
  SDL_Camera *handle;
} bare_sdl_camera_t;

enum bare_camera_format_status : uint8_t {
  BARE_CAMERA_FORMAT_OK = 0,
  BARE_CAMERA_FORMAT_PENDING = 1,
  BARE_CAMERA_FORMAT_ERROR = 2
};

typedef struct {
  SDL_CameraSpec spec;
  bare_camera_format_status status;
} bare_sdl_camera_spec_t;

typedef struct {
  SDL_CameraSpec spec;
} bare_sdl_camera_format_t;

typedef struct {
  SDL_Surface *surface;
  uint64_t timestamp;
} bare_sdl_camera_frame_t;

static uv_once_t bare_sdl__init_guard = UV_ONCE_INIT;

static void
bare_sdl__on_init(void) {
  // Note: This is a way to prevent SDL to handle signals
  SDL_SetHint(SDL_HINT_NO_SIGNAL_HANDLERS, "1");
  SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO | SDL_INIT_CAMERA);
}

// Window

static js_arraybuffer_t
bare_sdl_create_window(
  js_env_t *env,
  js_receiver_t,
  std::string title,
  int width,
  int height,
  uint64_t flags
) {
  int err;

  js_arraybuffer_t handle;

  bare_sdl_window_t *win;
  err = js_create_arraybuffer(env, win, handle);
  assert(err == 0);

  win->handle = SDL_CreateWindow(title.c_str(), width, height, flags);

  if (win->handle == nullptr) {
    err = js_throw_error(env, nullptr, SDL_GetError());
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

  if (ren->handle == nullptr) {
    err = js_throw_error(env, nullptr, SDL_GetError());
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
  int width,
  int height
) {
  int err;

  js_arraybuffer_t handle;

  bare_sdl_texture_t *tex;
  err = js_create_arraybuffer(env, tex, handle);
  assert(err == 0);

  tex->handle = SDL_CreateTexture(
    ren->handle,
    static_cast<SDL_PixelFormat>(pixel_format),
    static_cast<SDL_TextureAccess>(texture_access),
    width,
    height
  );

  if (tex->handle == nullptr) {
    err = js_throw_error(env, nullptr, SDL_GetError());
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
  return SDL_UpdateTexture(tex->handle, nullptr, &buf[buf_offset], pitch);
}

// Events

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

static js_arraybuffer_t
bare_sdl_get_event_key(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_event_t, 1> e
) {
  int err;

  js_arraybuffer_t handle;

  bare_sdl_keyboard_event_t *key;
  err = js_create_arraybuffer(env, key, handle);
  assert(err == 0);

  key->handle = e->handle.key;

  return handle;
}

static uint32_t
bare_sdl_get_event_key_scancode(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_keyboard_event_t, 1> key
) {
  return key->handle.scancode;
}

static uint32_t
bare_sdl_open_audio_device(
  js_env_t *env,
  js_receiver_t,
  uint32_t requested_device_id,
  std::optional<uint32_t> format,
  std::optional<int> channels,
  std::optional<int> freq
) {
  int err;

  SDL_AudioSpec spec;
  SDL_AudioSpec *spec_ptr = nullptr;
  if (format.has_value() && channels.has_value() && freq.has_value()) {
    spec = {
      .format = static_cast<SDL_AudioFormat>(format.value()),
      .channels = channels.value(),
      .freq = freq.value()
    };

    spec_ptr = &spec;
  }

  auto logical_device_id = SDL_OpenAudioDevice(requested_device_id, spec_ptr);

  if (logical_device_id == 0) {
    err = js_throw_error(env, nullptr, SDL_GetError());
    assert(err == 0);

    throw js_pending_exception;
  }

  return logical_device_id;
}

static void
bare_sdl_close_audio_device(
  js_env_t *,
  js_receiver_t,
  uint32_t device_id
) {
  SDL_CloseAudioDevice(device_id);
}

static bool
bare_sdl_pause_audio_device(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id
) {
  return SDL_PauseAudioDevice(device_id);
}

static bool
bare_sdl_resume_audio_device(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id
) {
  return SDL_ResumeAudioDevice(device_id);
}

static std::vector<uint32_t>
bare_sdl_get_audio_playback_devices(
  js_env_t *env,
  js_receiver_t
) {
  int count = 0;
  SDL_AudioDeviceID *devices = SDL_GetAudioPlaybackDevices(&count);

  std::vector<uint32_t> list;

  if (devices != nullptr) {
    for (int i = 0; i < count; i++) {
      list.push_back(devices[i]);
    }
    SDL_free(devices);
  }

  return list;
}

static std::vector<uint32_t>
bare_sdl_get_audio_recording_devices(
  js_env_t *env,
  js_receiver_t
) {
  int count = 0;
  SDL_AudioDeviceID *devices = SDL_GetAudioRecordingDevices(&count);

  std::vector<uint32_t> list;

  if (devices != nullptr) {
    for (int i = 0; i < count; i++) {
      list.push_back(devices[i]);
    }
    SDL_free(devices);
  }

  return list;
}

static std::optional<uint32_t>
bare_sdl_get_audio_device_list_item(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_audio_device_list_t, 1> list,
  int index
) {
  if (index < 0 || index >= list->count || !list->devices) {
    return std::nullopt;
  }

  return list->devices[index];
}

static std::optional<std::string>
bare_sdl_get_audio_device_name(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id
) {
  const char *name = SDL_GetAudioDeviceName(device_id);
  return name ? std::optional<std::string>(name) : std::nullopt;
}

static double
bare_sdl_get_audio_device_gain(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id
) {
  return SDL_GetAudioDeviceGain(device_id);
}

static void
bare_sdl_set_audio_device_gain(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id,
  double gain
) {
  SDL_SetAudioDeviceGain(device_id, static_cast<float>(gain));
}

static js_arraybuffer_t
bare_sdl_get_audio_device_format(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id
) {
  int err;

  js_arraybuffer_t handle;

  bare_sdl_audio_device_format_t *format;
  err = js_create_arraybuffer(env, format, handle);
  assert(err == 0);

  format->valid = SDL_GetAudioDeviceFormat(
    device_id,
    &format->spec,
    &format->sample_frames
  );

  return handle;
}

static bool
bare_sdl_get_audio_device_format_valid(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_audio_device_format_t, 1> format
) {
  return format->valid;
}

static uint32_t
bare_sdl_get_audio_device_format_format(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_audio_device_format_t, 1> format
) {
  return format->spec.format;
}

static int
bare_sdl_get_audio_device_format_channels(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_audio_device_format_t, 1> format
) {
  return format->spec.channels;
}

static int
bare_sdl_get_audio_device_format_freq(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_audio_device_format_t, 1> format
) {
  return format->spec.freq;
}

static int
bare_sdl_get_audio_device_format_sample_frames(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_audio_device_format_t, 1> format
) {
  return format->sample_frames;
}

static bool
bare_sdl_is_audio_device_physical(
  js_env_t *env,
  js_receiver_t,
  uint32_t deviceId
) {
  return SDL_IsAudioDevicePhysical(deviceId);
}

static bool
bare_sdl_is_audio_device_playback(
  js_env_t *env,
  js_receiver_t,
  uint32_t deviceId
) {
  return SDL_IsAudioDevicePlayback(deviceId);
}

static bool
bare_sdl_is_audio_device_paused(
  js_env_t *env,
  js_receiver_t,
  uint32_t deviceId
) {
  return SDL_AudioDevicePaused(deviceId);
}

static std::vector<uint32_t>
bare_sdl_get_cameras(
  js_env_t *env,
  js_receiver_t
) {
  int err;

  int count = 0;
  std::vector<uint32_t> list;
  SDL_CameraID *devices = SDL_GetCameras(&count);

  if (devices == nullptr) {
    err = js_throw_error(env, nullptr, SDL_GetError());
    assert(err == 0);

    throw js_pending_exception;
  }

  for (int i = 0; i < count; i++) {
    list.push_back(devices[i]);
  }

  SDL_free(devices);

  return list;
}

static std::optional<std::string>
bare_sdl_get_camera_name(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id
) {
  const char *name = SDL_GetCameraName(device_id);
  return name ? std::optional<std::string>(name) : std::nullopt;
}

static uint32_t
bare_sdl_get_camera_position(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id
) {
  return SDL_GetCameraPosition(device_id);
}

static std::vector<js_arraybuffer_t>
bare_sdl_get_camera_supported_formats(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id
) {
  int err;

  int count = 0;
  std::vector<js_arraybuffer_t> list;
  SDL_CameraSpec **specs = SDL_GetCameraSupportedFormats(device_id, &count);

  if (specs == nullptr) {
    err = js_throw_error(env, nullptr, SDL_GetError());
    assert(err == 0);

    throw js_pending_exception;
  }

  for (int i = 0; i < count; i++) {
    js_arraybuffer_t handle;
    bare_sdl_camera_format_t *format;
    err = js_create_arraybuffer(env, format, handle);
    assert(err == 0);

    format->spec = *specs[i];
    list.push_back(handle);
  }

  SDL_free(specs);

  return list;
}

static uint32_t
bare_sdl_get_camera_format_format(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_format_t, 1> format
) {
  return format->spec.format;
}

static uint32_t
bare_sdl_get_camera_format_colorspace(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_format_t, 1> format
) {
  return format->spec.colorspace;
}

static int
bare_sdl_get_camera_format_width(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_format_t, 1> format
) {
  return format->spec.width;
}

static int
bare_sdl_get_camera_format_height(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_format_t, 1> format
) {
  return format->spec.height;
}

static int
bare_sdl_get_camera_format_framerate_numerator(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_format_t, 1> format
) {
  return format->spec.framerate_numerator;
}

static int
bare_sdl_get_camera_format_framerate_denominator(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_format_t, 1> format
) {
  return format->spec.framerate_denominator;
}

static js_arraybuffer_t
bare_sdl_open_camera(
  js_env_t *env,
  js_receiver_t,
  uint32_t device_id,
  std::optional<uint32_t> format,
  std::optional<uint32_t> colorspace,
  std::optional<int> width,
  std::optional<int> height,
  std::optional<int> framerate_numerator,
  std::optional<int> framerate_denominator
) {
  SDL_CameraSpec spec;
  SDL_CameraSpec *spec_ptr = nullptr;

  if (format.has_value() && width.has_value() && height.has_value()) {
    spec.format = static_cast<SDL_PixelFormat>(format.value());
    spec.colorspace = static_cast<SDL_Colorspace>(colorspace.value_or(0));
    spec.width = width.value();
    spec.height = height.value();
    spec.framerate_numerator = framerate_numerator.value_or(30);
    spec.framerate_denominator = framerate_denominator.value_or(1);
    spec_ptr = &spec;
  }

  int err;
  js_arraybuffer_t handle;
  bare_sdl_camera_t *cam;
  err = js_create_arraybuffer(env, cam, handle);
  assert(err == 0);

  cam->handle = SDL_OpenCamera(device_id, spec_ptr);
  if (cam->handle == nullptr) {
    err = js_throw_error(env, nullptr, SDL_GetError());
    assert(err == 0);

    throw js_pending_exception;
  }

  return handle;
}

static void
bare_sdl_close_camera(
  js_env_t *,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_t, 1> cam
) {
  if (cam->handle) {
    SDL_CloseCamera(cam->handle);
    cam->handle = nullptr;
  }
}

static int
bare_sdl_get_camera_permission_state(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_t, 1> cam
) {
  return SDL_GetCameraPermissionState(cam->handle);
}

static uint32_t
bare_sdl_get_camera_id(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_t, 1> cam
) {
  return SDL_GetCameraID(cam->handle);
}

static uint32_t
bare_sdl_get_camera_properties(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_t, 1> cam
) {
  return SDL_GetCameraProperties(cam->handle);
}

static js_arraybuffer_t
bare_sdl_get_camera_format(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_t, 1> cam
) {
  int err;

  js_arraybuffer_t handle;
  bare_sdl_camera_spec_t *spec;
  err = js_create_arraybuffer(env, spec, handle);
  assert(err == 0);

  if (SDL_GetCameraFormat(cam->handle, &spec->spec)) {
    spec->status = BARE_CAMERA_FORMAT_OK;
    return handle;
  }

  const int state = SDL_GetCameraPermissionState(cam->handle);
  spec->status = (state == 0) ? BARE_CAMERA_FORMAT_PENDING : BARE_CAMERA_FORMAT_ERROR;

  return handle;
}

static int
bare_sdl_get_camera_spec_status(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_spec_t, 1> spec
) {
  return spec->status;
}

static bool
bare_sdl_get_camera_spec_valid(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_spec_t, 1> spec
) {
  return spec->status == BARE_CAMERA_FORMAT_OK;
}

static uint32_t
bare_sdl_get_camera_spec_format(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_spec_t, 1> spec
) {
  return spec->spec.format;
}

static uint32_t
bare_sdl_get_camera_spec_colorspace(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_spec_t, 1> spec
) {
  return spec->spec.colorspace;
}

static int
bare_sdl_get_camera_spec_width(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_spec_t, 1> spec
) {
  return spec->spec.width;
}

static int
bare_sdl_get_camera_spec_height(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_spec_t, 1> spec
) {
  return spec->spec.height;
}

static int
bare_sdl_get_camera_spec_framerate_numerator(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_spec_t, 1> spec
) {
  return spec->spec.framerate_numerator;
}

static int
bare_sdl_get_camera_spec_framerate_denominator(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_spec_t, 1> spec
) {
  return spec->spec.framerate_denominator;
}

static js_arraybuffer_t
bare_sdl_acquire_camera_frame(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_t, 1> cam
) {
  int err;

  js_arraybuffer_t handle;

  bare_sdl_camera_frame_t *frame;
  err = js_create_arraybuffer(env, frame, handle);
  assert(err == 0);

  frame->timestamp = 0;
  Uint64 timestamp_ns = 0;
  frame->surface = SDL_AcquireCameraFrame(cam->handle, &timestamp_ns);

  if (frame->surface) {
    frame->timestamp = timestamp_ns;
  }

  return handle;
}

static void
bare_sdl_release_camera_frame(
  js_env_t *,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_t, 1> cam,
  js_arraybuffer_span_of_t<bare_sdl_camera_frame_t, 1> frame
) {
  if (frame->surface) {
    SDL_ReleaseCameraFrame(cam->handle, frame->surface);
    frame->surface = nullptr;
    frame->timestamp = 0;
  }
}

static bool
bare_sdl_get_camera_frame_valid(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_frame_t, 1> frame
) {
  return frame->surface != nullptr;
}

static uint64_t
bare_sdl_get_camera_frame_timestamp(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_frame_t, 1> frame
) {
  return frame->timestamp;
}

static std::optional<js_arraybuffer_t>
bare_sdl_get_camera_frame_pixels(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_frame_t, 1> frame
) {
  if (!frame->surface) {
    return std::nullopt;
  }

  int err;

  size_t pixel_size = static_cast<size_t>(frame->surface->pitch) * static_cast<size_t>(frame->surface->h);

  js_arraybuffer_t handle;
  uint8_t *data;
  err = js_create_arraybuffer(env, pixel_size, data, handle);
  assert(err == 0);

  memcpy(data, frame->surface->pixels, pixel_size);

  return handle;
}

static int
bare_sdl_get_camera_frame_width(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_frame_t, 1> frame
) {
  return frame->surface ? frame->surface->w : 0;
}

static int
bare_sdl_get_camera_frame_height(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_frame_t, 1> frame
) {
  return frame->surface ? frame->surface->h : 0;
}

static int
bare_sdl_get_camera_frame_pitch(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_frame_t, 1> frame
) {
  return frame->surface ? frame->surface->pitch : 0;
}

static uint32_t
bare_sdl_get_camera_frame_format(
  js_env_t *env,
  js_receiver_t,
  js_arraybuffer_span_of_t<bare_sdl_camera_frame_t, 1> frame
) {
  return frame->surface ? frame->surface->format : 0;
}

// Exports

static js_value_t *
bare_sdl_exports(js_env_t *env, js_value_t *exports) {
  uv_once(&bare_sdl__init_guard, bare_sdl__on_init);

  int err;

  js_object_t constants;
  err = js_create_object(env, constants);
  assert(err == 0);

  err = js_set_property(env, exports, "constants", constants);
  assert(err == 0);

#define V(constant) \
  err = js_set_property(env, constants, #constant, uint32_t(constant)); \
  assert(err == 0);

  V(SDL_WINDOW_FULLSCREEN)
  V(SDL_WINDOW_OPENGL)
  V(SDL_WINDOW_OCCLUDED)
  V(SDL_WINDOW_HIDDEN)
  V(SDL_WINDOW_BORDERLESS)
  V(SDL_WINDOW_RESIZABLE)
  V(SDL_WINDOW_MINIMIZED)
  V(SDL_WINDOW_MAXIMIZED)
  V(SDL_WINDOW_MOUSE_GRABBED)
  V(SDL_WINDOW_INPUT_FOCUS)
  V(SDL_WINDOW_MOUSE_FOCUS)
  V(SDL_WINDOW_EXTERNAL)
  V(SDL_WINDOW_MODAL)
  V(SDL_WINDOW_HIGH_PIXEL_DENSITY)
  V(SDL_WINDOW_MOUSE_CAPTURE)
  V(SDL_WINDOW_ALWAYS_ON_TOP)
  V(SDL_WINDOW_UTILITY)
  V(SDL_WINDOW_TOOLTIP)
  V(SDL_WINDOW_POPUP_MENU)
  V(SDL_WINDOW_KEYBOARD_GRABBED)
  V(SDL_WINDOW_VULKAN)
  V(SDL_WINDOW_METAL)
  V(SDL_WINDOW_TRANSPARENT)
  V(SDL_WINDOW_NOT_FOCUSABLE)

  V(SDL_PIXELFORMAT_UNKNOWN)
  V(SDL_PIXELFORMAT_INDEX1LSB)
  V(SDL_PIXELFORMAT_INDEX1MSB)
  V(SDL_PIXELFORMAT_INDEX2LSB)
  V(SDL_PIXELFORMAT_INDEX2MSB)
  V(SDL_PIXELFORMAT_INDEX4LSB)
  V(SDL_PIXELFORMAT_INDEX4MSB)
  V(SDL_PIXELFORMAT_INDEX8)
  V(SDL_PIXELFORMAT_RGB332)
  V(SDL_PIXELFORMAT_XRGB4444)
  V(SDL_PIXELFORMAT_XBGR4444)
  V(SDL_PIXELFORMAT_XRGB1555)
  V(SDL_PIXELFORMAT_XBGR1555)
  V(SDL_PIXELFORMAT_ARGB4444)
  V(SDL_PIXELFORMAT_RGBA4444)
  V(SDL_PIXELFORMAT_ABGR4444)
  V(SDL_PIXELFORMAT_BGRA4444)
  V(SDL_PIXELFORMAT_ARGB1555)
  V(SDL_PIXELFORMAT_RGBA5551)
  V(SDL_PIXELFORMAT_ABGR1555)
  V(SDL_PIXELFORMAT_BGRA5551)
  V(SDL_PIXELFORMAT_RGB565)
  V(SDL_PIXELFORMAT_BGR565)
  V(SDL_PIXELFORMAT_RGB24)
  V(SDL_PIXELFORMAT_BGR24)
  V(SDL_PIXELFORMAT_XRGB8888)
  V(SDL_PIXELFORMAT_RGBX8888)
  V(SDL_PIXELFORMAT_XBGR8888)
  V(SDL_PIXELFORMAT_BGRX8888)
  V(SDL_PIXELFORMAT_ARGB8888)
  V(SDL_PIXELFORMAT_RGBA8888)
  V(SDL_PIXELFORMAT_ABGR8888)
  V(SDL_PIXELFORMAT_BGRA8888)
  V(SDL_PIXELFORMAT_XRGB2101010)
  V(SDL_PIXELFORMAT_XBGR2101010)
  V(SDL_PIXELFORMAT_ARGB2101010)
  V(SDL_PIXELFORMAT_ABGR2101010)
  V(SDL_PIXELFORMAT_RGB48)
  V(SDL_PIXELFORMAT_BGR48)
  V(SDL_PIXELFORMAT_RGBA64)
  V(SDL_PIXELFORMAT_ARGB64)
  V(SDL_PIXELFORMAT_BGRA64)
  V(SDL_PIXELFORMAT_ABGR64)
  V(SDL_PIXELFORMAT_RGB48_FLOAT)
  V(SDL_PIXELFORMAT_BGR48_FLOAT)
  V(SDL_PIXELFORMAT_RGBA64_FLOAT)
  V(SDL_PIXELFORMAT_ARGB64_FLOAT)
  V(SDL_PIXELFORMAT_BGRA64_FLOAT)
  V(SDL_PIXELFORMAT_ABGR64_FLOAT)
  V(SDL_PIXELFORMAT_RGB96_FLOAT)
  V(SDL_PIXELFORMAT_BGR96_FLOAT)
  V(SDL_PIXELFORMAT_RGBA128_FLOAT)
  V(SDL_PIXELFORMAT_ARGB128_FLOAT)
  V(SDL_PIXELFORMAT_BGRA128_FLOAT)
  V(SDL_PIXELFORMAT_ABGR128_FLOAT)
  V(SDL_PIXELFORMAT_YV12)
  V(SDL_PIXELFORMAT_IYUV)
  V(SDL_PIXELFORMAT_YUY2)
  V(SDL_PIXELFORMAT_UYVY)
  V(SDL_PIXELFORMAT_YVYU)
  V(SDL_PIXELFORMAT_NV12)
  V(SDL_PIXELFORMAT_NV21)
  V(SDL_PIXELFORMAT_P010)
  V(SDL_PIXELFORMAT_EXTERNAL_OES)
  V(SDL_PIXELFORMAT_MJPG)
  V(SDL_PIXELFORMAT_ABGR8888)
  V(SDL_PIXELFORMAT_BGRA8888)
  V(SDL_PIXELFORMAT_ARGB8888)
  V(SDL_PIXELFORMAT_RGBA8888)
  V(SDL_PIXELFORMAT_XBGR8888)
  V(SDL_PIXELFORMAT_BGRX8888)
  V(SDL_PIXELFORMAT_XRGB8888)
  V(SDL_PIXELFORMAT_RGBX8888)

  V(SDL_TEXTUREACCESS_STATIC)
  V(SDL_TEXTUREACCESS_STREAMING)
  V(SDL_TEXTUREACCESS_TARGET)

  V(SDL_EVENT_QUIT)
  V(SDL_EVENT_TERMINATING)
  V(SDL_EVENT_LOW_MEMORY)
  V(SDL_EVENT_WILL_ENTER_BACKGROUND)
  V(SDL_EVENT_DID_ENTER_BACKGROUND)
  V(SDL_EVENT_WILL_ENTER_FOREGROUND)
  V(SDL_EVENT_DID_ENTER_FOREGROUND)
  V(SDL_EVENT_LOCALE_CHANGED)
  V(SDL_EVENT_SYSTEM_THEME_CHANGED)
  V(SDL_EVENT_DISPLAY_ORIENTATION)
  V(SDL_EVENT_DISPLAY_ADDED)
  V(SDL_EVENT_DISPLAY_REMOVED)
  V(SDL_EVENT_DISPLAY_MOVED)
  V(SDL_EVENT_DISPLAY_DESKTOP_MODE_CHANGED)
  V(SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED)
  V(SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED)
  V(SDL_EVENT_WINDOW_SHOWN)
  V(SDL_EVENT_WINDOW_HIDDEN)
  V(SDL_EVENT_WINDOW_EXPOSED)
  V(SDL_EVENT_WINDOW_MOVED)
  V(SDL_EVENT_WINDOW_RESIZED)
  V(SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED)
  V(SDL_EVENT_WINDOW_METAL_VIEW_RESIZED)
  V(SDL_EVENT_WINDOW_MINIMIZED)
  V(SDL_EVENT_WINDOW_MAXIMIZED)
  V(SDL_EVENT_WINDOW_RESTORED)
  V(SDL_EVENT_WINDOW_MOUSE_ENTER)
  V(SDL_EVENT_WINDOW_MOUSE_LEAVE)
  V(SDL_EVENT_WINDOW_FOCUS_GAINED)
  V(SDL_EVENT_WINDOW_FOCUS_LOST)
  V(SDL_EVENT_WINDOW_CLOSE_REQUESTED)
  V(SDL_EVENT_WINDOW_HIT_TEST)
  V(SDL_EVENT_WINDOW_ICCPROF_CHANGED)
  V(SDL_EVENT_WINDOW_DISPLAY_CHANGED)
  V(SDL_EVENT_WINDOW_DISPLAY_SCALE_CHANGED)
  V(SDL_EVENT_WINDOW_SAFE_AREA_CHANGED)
  V(SDL_EVENT_WINDOW_OCCLUDED)
  V(SDL_EVENT_WINDOW_ENTER_FULLSCREEN)
  V(SDL_EVENT_WINDOW_LEAVE_FULLSCREEN)
  V(SDL_EVENT_WINDOW_DESTROYED)
  V(SDL_EVENT_WINDOW_HDR_STATE_CHANGED)
  V(SDL_EVENT_KEY_DOWN)
  V(SDL_EVENT_KEY_UP)
  V(SDL_EVENT_TEXT_EDITING)
  V(SDL_EVENT_TEXT_INPUT)
  V(SDL_EVENT_KEYMAP_CHANGED)
  V(SDL_EVENT_KEYBOARD_ADDED)
  V(SDL_EVENT_KEYBOARD_REMOVED)
  V(SDL_EVENT_TEXT_EDITING_CANDIDATES)
  V(SDL_EVENT_MOUSE_MOTION)
  V(SDL_EVENT_MOUSE_BUTTON_DOWN)
  V(SDL_EVENT_MOUSE_BUTTON_UP)
  V(SDL_EVENT_MOUSE_WHEEL)
  V(SDL_EVENT_MOUSE_ADDED)
  V(SDL_EVENT_MOUSE_REMOVED)
  V(SDL_EVENT_CAMERA_DEVICE_ADDED)
  V(SDL_EVENT_CAMERA_DEVICE_REMOVED)
  V(SDL_EVENT_CAMERA_DEVICE_APPROVED)
  V(SDL_EVENT_CAMERA_DEVICE_DENIED)

  V(SDL_SCANCODE_UNKNOWN)
  V(SDL_SCANCODE_A)
  V(SDL_SCANCODE_B)
  V(SDL_SCANCODE_C)
  V(SDL_SCANCODE_D)
  V(SDL_SCANCODE_E)
  V(SDL_SCANCODE_F)
  V(SDL_SCANCODE_G)
  V(SDL_SCANCODE_H)
  V(SDL_SCANCODE_I)
  V(SDL_SCANCODE_J)
  V(SDL_SCANCODE_K)
  V(SDL_SCANCODE_L)
  V(SDL_SCANCODE_M)
  V(SDL_SCANCODE_N)
  V(SDL_SCANCODE_O)
  V(SDL_SCANCODE_P)
  V(SDL_SCANCODE_Q)
  V(SDL_SCANCODE_R)
  V(SDL_SCANCODE_S)
  V(SDL_SCANCODE_T)
  V(SDL_SCANCODE_U)
  V(SDL_SCANCODE_V)
  V(SDL_SCANCODE_W)
  V(SDL_SCANCODE_X)
  V(SDL_SCANCODE_Y)
  V(SDL_SCANCODE_Z)
  V(SDL_SCANCODE_1)
  V(SDL_SCANCODE_2)
  V(SDL_SCANCODE_3)
  V(SDL_SCANCODE_4)
  V(SDL_SCANCODE_5)
  V(SDL_SCANCODE_6)
  V(SDL_SCANCODE_7)
  V(SDL_SCANCODE_8)
  V(SDL_SCANCODE_9)
  V(SDL_SCANCODE_0)
  V(SDL_SCANCODE_RETURN)
  V(SDL_SCANCODE_ESCAPE)
  V(SDL_SCANCODE_BACKSPACE)
  V(SDL_SCANCODE_TAB)
  V(SDL_SCANCODE_SPACE)
  V(SDL_SCANCODE_MINUS)
  V(SDL_SCANCODE_EQUALS)
  V(SDL_SCANCODE_LEFTBRACKET)
  V(SDL_SCANCODE_RIGHTBRACKET)
  V(SDL_SCANCODE_BACKSLASH)
  V(SDL_SCANCODE_NONUSHASH)
  V(SDL_SCANCODE_SEMICOLON)
  V(SDL_SCANCODE_APOSTROPHE)
  V(SDL_SCANCODE_GRAVE)
  V(SDL_SCANCODE_COMMA)
  V(SDL_SCANCODE_PERIOD)
  V(SDL_SCANCODE_SLASH)
  V(SDL_SCANCODE_CAPSLOCK)
  V(SDL_SCANCODE_F1)
  V(SDL_SCANCODE_F2)
  V(SDL_SCANCODE_F3)
  V(SDL_SCANCODE_F4)
  V(SDL_SCANCODE_F5)
  V(SDL_SCANCODE_F6)
  V(SDL_SCANCODE_F7)
  V(SDL_SCANCODE_F8)
  V(SDL_SCANCODE_F9)
  V(SDL_SCANCODE_F10)
  V(SDL_SCANCODE_F11)
  V(SDL_SCANCODE_F12)
  V(SDL_SCANCODE_PRINTSCREEN)
  V(SDL_SCANCODE_SCROLLLOCK)
  V(SDL_SCANCODE_PAUSE)
  V(SDL_SCANCODE_INSERT)
  V(SDL_SCANCODE_HOME)
  V(SDL_SCANCODE_PAGEUP)
  V(SDL_SCANCODE_DELETE)
  V(SDL_SCANCODE_END)
  V(SDL_SCANCODE_PAGEDOWN)
  V(SDL_SCANCODE_RIGHT)
  V(SDL_SCANCODE_LEFT)
  V(SDL_SCANCODE_DOWN)
  V(SDL_SCANCODE_UP)
  V(SDL_SCANCODE_NUMLOCKCLEAR)
  V(SDL_SCANCODE_KP_DIVIDE)
  V(SDL_SCANCODE_KP_MULTIPLY)
  V(SDL_SCANCODE_KP_MINUS)
  V(SDL_SCANCODE_KP_PLUS)
  V(SDL_SCANCODE_KP_ENTER)
  V(SDL_SCANCODE_KP_1)
  V(SDL_SCANCODE_KP_2)
  V(SDL_SCANCODE_KP_3)
  V(SDL_SCANCODE_KP_4)
  V(SDL_SCANCODE_KP_5)
  V(SDL_SCANCODE_KP_6)
  V(SDL_SCANCODE_KP_7)
  V(SDL_SCANCODE_KP_8)
  V(SDL_SCANCODE_KP_9)
  V(SDL_SCANCODE_KP_0)
  V(SDL_SCANCODE_KP_PERIOD)
  V(SDL_SCANCODE_NONUSBACKSLASH)
  V(SDL_SCANCODE_APPLICATION)
  V(SDL_SCANCODE_POWER)
  V(SDL_SCANCODE_KP_EQUALS)
  V(SDL_SCANCODE_F13)
  V(SDL_SCANCODE_F14)
  V(SDL_SCANCODE_F15)
  V(SDL_SCANCODE_F16)
  V(SDL_SCANCODE_F17)
  V(SDL_SCANCODE_F18)
  V(SDL_SCANCODE_F19)
  V(SDL_SCANCODE_F20)
  V(SDL_SCANCODE_F21)
  V(SDL_SCANCODE_F22)
  V(SDL_SCANCODE_F23)
  V(SDL_SCANCODE_F24)
  V(SDL_SCANCODE_EXECUTE)
  V(SDL_SCANCODE_HELP)
  V(SDL_SCANCODE_MENU)
  V(SDL_SCANCODE_SELECT)
  V(SDL_SCANCODE_STOP)
  V(SDL_SCANCODE_AGAIN)
  V(SDL_SCANCODE_UNDO)
  V(SDL_SCANCODE_CUT)
  V(SDL_SCANCODE_COPY)
  V(SDL_SCANCODE_PASTE)
  V(SDL_SCANCODE_FIND)
  V(SDL_SCANCODE_MUTE)
  V(SDL_SCANCODE_VOLUMEUP)
  V(SDL_SCANCODE_VOLUMEDOWN)
  V(SDL_SCANCODE_KP_COMMA)
  V(SDL_SCANCODE_KP_EQUALSAS400)
  V(SDL_SCANCODE_INTERNATIONAL1)
  V(SDL_SCANCODE_INTERNATIONAL2)
  V(SDL_SCANCODE_INTERNATIONAL3)
  V(SDL_SCANCODE_INTERNATIONAL4)
  V(SDL_SCANCODE_INTERNATIONAL5)
  V(SDL_SCANCODE_INTERNATIONAL6)
  V(SDL_SCANCODE_INTERNATIONAL7)
  V(SDL_SCANCODE_INTERNATIONAL8)
  V(SDL_SCANCODE_INTERNATIONAL9)
  V(SDL_SCANCODE_LANG1)
  V(SDL_SCANCODE_LANG2)
  V(SDL_SCANCODE_LANG3)
  V(SDL_SCANCODE_LANG4)
  V(SDL_SCANCODE_LANG5)
  V(SDL_SCANCODE_LANG6)
  V(SDL_SCANCODE_LANG7)
  V(SDL_SCANCODE_LANG8)
  V(SDL_SCANCODE_LANG9)
  V(SDL_SCANCODE_ALTERASE)
  V(SDL_SCANCODE_SYSREQ)
  V(SDL_SCANCODE_CANCEL)
  V(SDL_SCANCODE_CLEAR)
  V(SDL_SCANCODE_PRIOR)
  V(SDL_SCANCODE_RETURN2)
  V(SDL_SCANCODE_SEPARATOR)
  V(SDL_SCANCODE_OUT)
  V(SDL_SCANCODE_OPER)
  V(SDL_SCANCODE_CLEARAGAIN)
  V(SDL_SCANCODE_CRSEL)
  V(SDL_SCANCODE_EXSEL)
  V(SDL_SCANCODE_KP_00)
  V(SDL_SCANCODE_KP_000)
  V(SDL_SCANCODE_THOUSANDSSEPARATOR)
  V(SDL_SCANCODE_DECIMALSEPARATOR)
  V(SDL_SCANCODE_CURRENCYUNIT)
  V(SDL_SCANCODE_CURRENCYSUBUNIT)
  V(SDL_SCANCODE_KP_LEFTPAREN)
  V(SDL_SCANCODE_KP_RIGHTPAREN)
  V(SDL_SCANCODE_KP_LEFTBRACE)
  V(SDL_SCANCODE_KP_RIGHTBRACE)
  V(SDL_SCANCODE_KP_TAB)
  V(SDL_SCANCODE_KP_BACKSPACE)
  V(SDL_SCANCODE_KP_A)
  V(SDL_SCANCODE_KP_B)
  V(SDL_SCANCODE_KP_C)
  V(SDL_SCANCODE_KP_D)
  V(SDL_SCANCODE_KP_E)
  V(SDL_SCANCODE_KP_F)
  V(SDL_SCANCODE_KP_XOR)
  V(SDL_SCANCODE_KP_POWER)
  V(SDL_SCANCODE_KP_PERCENT)
  V(SDL_SCANCODE_KP_LESS)
  V(SDL_SCANCODE_KP_GREATER)
  V(SDL_SCANCODE_KP_AMPERSAND)
  V(SDL_SCANCODE_KP_DBLAMPERSAND)
  V(SDL_SCANCODE_KP_VERTICALBAR)
  V(SDL_SCANCODE_KP_DBLVERTICALBAR)
  V(SDL_SCANCODE_KP_COLON)
  V(SDL_SCANCODE_KP_HASH)
  V(SDL_SCANCODE_KP_SPACE)
  V(SDL_SCANCODE_KP_AT)
  V(SDL_SCANCODE_KP_EXCLAM)
  V(SDL_SCANCODE_KP_MEMSTORE)
  V(SDL_SCANCODE_KP_MEMRECALL)
  V(SDL_SCANCODE_KP_MEMCLEAR)
  V(SDL_SCANCODE_KP_MEMADD)
  V(SDL_SCANCODE_KP_MEMSUBTRACT)
  V(SDL_SCANCODE_KP_MEMMULTIPLY)
  V(SDL_SCANCODE_KP_MEMDIVIDE)
  V(SDL_SCANCODE_KP_PLUSMINUS)
  V(SDL_SCANCODE_KP_CLEAR)
  V(SDL_SCANCODE_KP_CLEARENTRY)
  V(SDL_SCANCODE_KP_BINARY)
  V(SDL_SCANCODE_KP_OCTAL)
  V(SDL_SCANCODE_KP_DECIMAL)
  V(SDL_SCANCODE_KP_HEXADECIMAL)
  V(SDL_SCANCODE_LCTRL)
  V(SDL_SCANCODE_LSHIFT)
  V(SDL_SCANCODE_LALT)
  V(SDL_SCANCODE_LGUI)
  V(SDL_SCANCODE_RCTRL)
  V(SDL_SCANCODE_RSHIFT)
  V(SDL_SCANCODE_RALT)
  V(SDL_SCANCODE_RGUI)
  V(SDL_SCANCODE_MODE)
  V(SDL_SCANCODE_SLEEP)
  V(SDL_SCANCODE_WAKE)
  V(SDL_SCANCODE_CHANNEL_INCREMENT)
  V(SDL_SCANCODE_CHANNEL_DECREMENT)
  V(SDL_SCANCODE_MEDIA_PLAY)
  V(SDL_SCANCODE_MEDIA_PAUSE)
  V(SDL_SCANCODE_MEDIA_RECORD)
  V(SDL_SCANCODE_MEDIA_FAST_FORWARD)
  V(SDL_SCANCODE_MEDIA_REWIND)
  V(SDL_SCANCODE_MEDIA_NEXT_TRACK)
  V(SDL_SCANCODE_MEDIA_PREVIOUS_TRACK)
  V(SDL_SCANCODE_MEDIA_STOP)
  V(SDL_SCANCODE_MEDIA_EJECT)
  V(SDL_SCANCODE_MEDIA_PLAY_PAUSE)
  V(SDL_SCANCODE_MEDIA_SELECT)
  V(SDL_SCANCODE_AC_NEW)
  V(SDL_SCANCODE_AC_OPEN)
  V(SDL_SCANCODE_AC_CLOSE)
  V(SDL_SCANCODE_AC_EXIT)
  V(SDL_SCANCODE_AC_SAVE)
  V(SDL_SCANCODE_AC_PRINT)
  V(SDL_SCANCODE_AC_PROPERTIES)
  V(SDL_SCANCODE_AC_SEARCH)
  V(SDL_SCANCODE_AC_HOME)
  V(SDL_SCANCODE_AC_BACK)
  V(SDL_SCANCODE_AC_FORWARD)
  V(SDL_SCANCODE_AC_STOP)
  V(SDL_SCANCODE_AC_REFRESH)
  V(SDL_SCANCODE_AC_BOOKMARKS)
  V(SDL_SCANCODE_SOFTLEFT)
  V(SDL_SCANCODE_SOFTRIGHT)
  V(SDL_SCANCODE_CALL)
  V(SDL_SCANCODE_ENDCALL)
  V(SDL_SCANCODE_RESERVED)
  V(SDL_SCANCODE_COUNT)

  V(SDL_AUDIO_U8)
  V(SDL_AUDIO_S8)
  V(SDL_AUDIO_S16LE)
  V(SDL_AUDIO_S16BE)
  V(SDL_AUDIO_S32LE)
  V(SDL_AUDIO_S32BE)
  V(SDL_AUDIO_F32LE)
  V(SDL_AUDIO_F32BE)
  V(SDL_AUDIO_S16)
  V(SDL_AUDIO_S32)
  V(SDL_AUDIO_F32)

  V(SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK)
  V(SDL_AUDIO_DEVICE_DEFAULT_RECORDING)

  V(SDL_CAMERA_POSITION_UNKNOWN)
  V(SDL_CAMERA_POSITION_FRONT_FACING)
  V(SDL_CAMERA_POSITION_BACK_FACING)

  V(BARE_CAMERA_FORMAT_OK)
  V(BARE_CAMERA_FORMAT_PENDING)
  V(BARE_CAMERA_FORMAT_ERROR)
#undef V

#define V(name, function) \
  err = js_set_property<function>(env, exports, name); \
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
  V("getEventKey", bare_sdl_get_event_key)
  V("getEventKeyScancode", bare_sdl_get_event_key_scancode)

  V("openAudioDevice", bare_sdl_open_audio_device)
  V("closeAudioDevice", bare_sdl_close_audio_device)
  V("pauseAudioDevice", bare_sdl_pause_audio_device)
  V("resumeAudioDevice", bare_sdl_resume_audio_device)
  V("getAudioPlaybackDevices", bare_sdl_get_audio_playback_devices)
  V("getAudioRecordingDevices", bare_sdl_get_audio_recording_devices)
  V("getAudioDeviceListItem", bare_sdl_get_audio_device_list_item)
  V("getAudioDeviceName", bare_sdl_get_audio_device_name)
  V("getAudioDeviceGain", bare_sdl_get_audio_device_gain)
  V("setAudioDeviceGain", bare_sdl_set_audio_device_gain)
  V("getAudioDeviceFormat", bare_sdl_get_audio_device_format)
  V("getAudioDeviceFormatValid", bare_sdl_get_audio_device_format_valid)
  V("getAudioDeviceFormatFormat", bare_sdl_get_audio_device_format_format)
  V("getAudioDeviceFormatChannels", bare_sdl_get_audio_device_format_channels)
  V("getAudioDeviceFormatFreq", bare_sdl_get_audio_device_format_freq)
  V("getAudioDeviceFormatSampleFrames", bare_sdl_get_audio_device_format_sample_frames)
  V("isAudioDevicePhysical", bare_sdl_is_audio_device_physical)
  V("isAudioDevicePlayback", bare_sdl_is_audio_device_playback)
  V("isAudioDevicePaused", bare_sdl_is_audio_device_paused)

  V("getCameras", bare_sdl_get_cameras)
  V("getCameraName", bare_sdl_get_camera_name)
  V("getCameraPosition", bare_sdl_get_camera_position)
  V("getCameraSupportedFormats", bare_sdl_get_camera_supported_formats)
  V("getCameraFormatFormat", bare_sdl_get_camera_format_format)
  V("getCameraFormatColorspace", bare_sdl_get_camera_format_colorspace)
  V("getCameraFormatWidth", bare_sdl_get_camera_format_width)
  V("getCameraFormatHeight", bare_sdl_get_camera_format_height)
  V("getCameraFormatFramerateNumerator", bare_sdl_get_camera_format_framerate_numerator)
  V("getCameraFormatFramerateDenominator", bare_sdl_get_camera_format_framerate_denominator)
  V("openCamera", bare_sdl_open_camera)
  V("closeCamera", bare_sdl_close_camera)
  V("getCameraPermissionState", bare_sdl_get_camera_permission_state)
  V("getCameraId", bare_sdl_get_camera_id)
  V("getCameraProperties", bare_sdl_get_camera_properties)
  V("getCameraFormat", bare_sdl_get_camera_format)
  V("getCameraSpecValid", bare_sdl_get_camera_spec_valid)
  V("getCameraSpecStatus", bare_sdl_get_camera_spec_status)
  V("getCameraSpecFormat", bare_sdl_get_camera_spec_format)
  V("getCameraSpecColorspace", bare_sdl_get_camera_spec_colorspace)
  V("getCameraSpecWidth", bare_sdl_get_camera_spec_width)
  V("getCameraSpecHeight", bare_sdl_get_camera_spec_height)
  V("getCameraSpecFramerateNumerator", bare_sdl_get_camera_spec_framerate_numerator)
  V("getCameraSpecFramerateDenominator", bare_sdl_get_camera_spec_framerate_denominator)
  V("acquireCameraFrame", bare_sdl_acquire_camera_frame)
  V("releaseCameraFrame", bare_sdl_release_camera_frame)
  V("getCameraFrameValid", bare_sdl_get_camera_frame_valid)
  V("getCameraFrameTimestamp", bare_sdl_get_camera_frame_timestamp)
  V("getCameraFramePixels", bare_sdl_get_camera_frame_pixels)
  V("getCameraFrameWidth", bare_sdl_get_camera_frame_width)
  V("getCameraFrameHeight", bare_sdl_get_camera_frame_height)
  V("getCameraFramePitch", bare_sdl_get_camera_frame_pitch)
  V("getCameraFrameFormat", bare_sdl_get_camera_frame_format)
#undef V

  return exports;
}

BARE_MODULE(bare_sdl, bare_sdl_exports)
