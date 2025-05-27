cmake_minimum_required(VERSION 3.31)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-fetch REQUIRED PATHS node_modules/cmake-fetch)

set(CMAKE_POSITION_INDEPENDENT_CODE ON)

project(bare_sdl C CXX)

fetch_package("github:holepunchto/libjstl#8d4c339")

set(SDL_STATIC ON CACHE BOOL "Build a static version of SDL" FORCE)

fetch_package("github:libsdl-org/SDL#release-3.2.14")

add_bare_module(bare_sdl)

target_sources(
  ${bare_sdl}
  PRIVATE
    binding.cc
)

target_link_libraries(
  ${bare_sdl}
  PRIVATE
    SDL3-static
    jstl
)
