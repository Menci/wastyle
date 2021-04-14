# WAstyle
AStyle code formatter compiled to WebAssembly, for Node.js and the browser.

[![Build Status](https://img.shields.io/travis/Menci/wastyle?style=flat-square)](https://travis-ci.org/Menci/wastyle)
[![Dependencies](https://img.shields.io/david/Menci/wastyle?style=flat-square)](https://david-dm.org/Menci/wastyle)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/github/license/Menci/wastyle?style=flat-square)](LICENSE)

# Install
Install via NPM:

```bash
$ yarn add wastyle
```

# Usage
Firstly, you need to initialize AStyle WASM library with `init` function.

Unfortunately this step couldn't be done automatically since you need make Webpack emit the AStyle WASM binary to your dist directory and tell us its URL. Since we support running in browser mainly, so I don't want to write code to detect Node.js to increase your Webpack bundle size. So in both Node.js and Webpack this step must be done.

In Node.js, call `init` with a `Buffer` from `fs.readFile` or `fs.readFileSync`:

```javascript
const fs = require("fs");
const util = require("util");
const wastyle = require("wastyle");

util.promisify(fs.readFile)("wastyle/dist/astyle.wasm")
.then(data => wastyle.init(data))
.then(() => console.log("WAstyle is ready!"))
.catch(err => console.error(err));
```

In Webpack, I recommend you to use [`file-loader`](https://webpack.js.org/loaders/file-loader/) to emit the AStyle WASM binary to your dist directory and get its URL. See [NeekSandhu/onigasm#2](https://github.com/NeekSandhu/onigasm/issues/2).

Note that Webpack has a very simple built-in WASM loader, which will load a WASM file (detected by its magic header) as a compiled and instantiated WASM instance. But it doesn't support passing imports to WASM module. So it WILL fail since the AStyle WASM binary needs [WASI](https://wasi.dev/) to run. To disable the build-in WASM loader and force `file-loader` to produce the file URL, use this rule: ([webpack/webpack#6725](https://github.com/webpack/webpack/issues/6725))

```javascript
{
  test: /\.wasm$/,
  loader: "file-loader",
  type: "javascript/auto"
}
```

In your code, initialize WAstyle with:

```javascript
import { init, format } from "wastyle";
import astyleBinaryUrl from "wastyle/dist/astyle.wasm";

init(astyleBinaryUrl).then(() => console.log("WAstyle is ready!"));
```

The `init` function will compile and instantiate the Astyle WASM binary asynchronously. Will throw an error if failed.

After initialization, call the synchronous function `format` to use Astyle:

```javascript
const [success, result] = format("#include <cstdio>\nint main(){int 🦄,a,*b=a,c=🦄*2,*d=nullptr;return -1;}", "pad-oper style=google");
console.log(result);
// #include <cstdio>
// int main() {
//     int 🦄, a, *b = a, c = 🦄 * 2, *d = nullptr;
//     return -1;
// }
```

Besides, you can use `wastyle/dist/astyle-optimize-size.wasm` to reduce your Webpack dist's size.

# Performance
Tested on Chrome 80.0.3987.122 on an i7-6600U laptop, formatting [this](https://paste.ubuntu.com/p/NtGx85z9BK/) C++ file takes 15ms with `wastyle/dist/astyle.wasm` and 40ms with `wastyle/dist/astyle-optimize-size.wasm` in average of 100 samples.

# Development
You'll need `emcc` to build the Astyle WASM binary. Follow [this guide](https://emscripten.org/docs/getting_started/downloads.html) to install it.

```bash
$ yarn build      # Build TypeSrript
$ yarn build:wasm # Build WASM
```

# License
This project is licensed under the MIT license.

Astyle code formatter (Artistic Style) is also licensed under the MIT license. You can find its [license](astyle/LICENSE.md) in the [`astyle`](astyle) folder.
