cmake_minimum_required(VERSION 3.25)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)

include(FetchContent)

project(bare_sdl C)

set(SDL3_DISABLE_INSTALL ON CACHE BOOL "" FORCE)
set(SDL3_SHARED OFF CACHE BOOL "" FORCE)
set(SDL3_STATIC ON CACHE BOOL "" FORCE)
set(BUILD_SHARED_LIBS OFF)

FetchContent_Declare(
    SDL3
    GIT_REPOSITORY "https://github.com/libsdl-org/SDL.git"
    GIT_TAG "main"
    EXCLUDE_FROM_ALL
)
FetchContent_MakeAvailable(SDL3)

add_bare_module(bare_sdl)

target_sources(
  ${bare_sdl}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_sdl}
  PRIVATE
    SDL3::SDL3
)
