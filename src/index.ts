import { WASI } from "@wasmer/wasi";

interface WasmModuleExports {
  memory: WebAssembly.Memory;
  _start: () => void;
  alloc_buffer: (size: number) => number;
  free_buffer: (buffer: number) => number;
  wastyle: (codePointer: number, optionsPointer: number, resultPointerPointer: number) => number;
}

let wasmExports: WasmModuleExports;

export async function init(wasmFile: string | ArrayBuffer | Buffer): Promise<void> {
  if (wasmExports) return;

  // Load the module
  let wasmModule: WebAssembly.Module;
  if (typeof wasmFile === "string") {
    try {
      wasmModule = await WebAssembly.compileStreaming(await fetch(wasmFile));
    } catch (e) {
      if (e instanceof TypeError) {
        wasmModule = await WebAssembly.compile(await (await fetch(wasmFile)).arrayBuffer());
      }
    }
  } else {
    wasmModule = await WebAssembly.compile(wasmFile);
  }

  // Load WASI and start the module
  const wasi = new WASI({
    args: [],
    env: {}
  });

  const wasm = await WebAssembly.instantiate(wasmModule, {
    wasi_snapshot_preview1: wasi.wasiImport
  });

  wasmExports = (wasm.exports as unknown) as WasmModuleExports;
  wasi.setMemory(wasmExports.memory);

  wasmExports._start(); // C++ initialization
}

function writeString(str: string, memory: WebAssembly.Memory, pointer: number) {
  const encoder = new TextEncoder();
  const stringData = encoder.encode(str);
  const array = new Uint8Array(memory.buffer, pointer, str.length + 1);
  for (let i = 0; i < str.length; i++) array[i] = stringData[i];
  array[str.length] = 0;
}

function readInt32(memory: WebAssembly.Memory, pointer: number) {
  const array = new Uint32Array(memory.buffer, pointer, 1);
  return array[0];
}

function readString(memory: WebAssembly.Memory, pointer: number) {
  let array = new Uint8Array(memory.buffer, pointer);
  let length = 0;
  while (array[length] !== 0) length++;

  if (length === 0) return "";

  const decoder = new TextDecoder();
  array = new Uint8Array(memory.buffer, pointer, length);
  return decoder.decode(array);
}

export function format(code: string, options: string): [boolean, string] {
  if (!wasmExports) {
    throw new Error("Please call init() to load the WASM AStyle library first.");
  }

  // code + options + result buffer address
  const bufferSize = code.length + 1 + (options.length + 1) + 4;

  const bufferPointer = wasmExports.alloc_buffer(bufferSize);

  const resultBufferPointerBufferPointer = bufferPointer;
  const codePointer = resultBufferPointerBufferPointer + 4;
  const optionsPointer = codePointer + (code.length + 1);

  writeString(code, wasmExports.memory, codePointer);
  writeString(options, wasmExports.memory, optionsPointer);

  const success = !!wasmExports.wastyle(codePointer, optionsPointer, resultBufferPointerBufferPointer);

  const resultBufferPointer = readInt32(wasmExports.memory, resultBufferPointerBufferPointer);
  const result = readString(wasmExports.memory, resultBufferPointer);

  wasmExports.free_buffer(bufferPointer);

  if (resultBufferPointer) wasmExports.free_buffer(resultBufferPointer);

  return [success, result];
}
