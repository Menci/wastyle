const { init, format } = require("../../dist/index");
const fs = require("fs");

(async () => {
  await init(fs.readFileSync("../../dist/astyle.wasm"));
  const [success, result] = format("#include <cstdio>\nint main(){int a,*b=a,c,*d=nullptr;return -1;}", "pad-oper style=google");
  console.log(result);
})();
