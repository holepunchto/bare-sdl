const test = require("brittle");
const sdl2 = require(".");

test("it should expose window position center const", (t) => {
  t.ok(sdl2.constants.SDL_WINDOWPOS_CENTERED);
});
