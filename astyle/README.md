# Astyle
Here's the module's Astyle WASM binary's source code. Licensed originally under [MIT](LICENSE.md).

I made as less as possiable modification to the Astyle source code. The `astyle_wasm.cpp` is added to provide the interface to be used in JavaScript. Besides, I added an explicit template instantiation in `astyle_main.cpp` so I can use the template class `ASStreamIterator<std::stringstream>` in `astyle_wasm.cpp`.

Remember to [build](../build-wasm.sh) with `-DASTYLE_LIB` and `-std=c++11`.
