import { init, format } from "wastyle";

(async () => {
  const path = require("wastyle/dist/astyle.wasm").default;
  await init(path);
  const [success, result] = await format("#include <cstdio>\nint main(){int a,*b=a,c,*d=nullptr;return -1;}", "pad-oper style=google");
  document.querySelector("pre").innerText = result;
})()
