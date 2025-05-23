cmake_minimum_required(VERSION 3.25)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-fetch REQUIRED PATHS node_modules/cmake-fetch)

if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
  set(CMAKE_POSITION_INDEPENDENT_CODE ON)
endif()

project(bare_sdl C CXX)

set(SDL3_DISABLE_INSTALL ON CACHE BOOL "" FORCE)
set(SDL3_SHARED OFF CACHE BOOL "" FORCE)
set(SDL3_STATIC ON CACHE BOOL "" FORCE)
set(BUILD_SHARED_LIBS OFF)

fetch_package("github:holepunchto/libjstl#d92f140c")
fetch_package("github:libsdl-org/SDL#main")

add_bare_module(bare_sdl)

target_sources(
  ${bare_sdl}
  PRIVATE
    binding.cc
)

target_link_libraries(
  ${bare_sdl}
  PRIVATE
    SDL3::SDL3
    jstl
)
